import { useEffect, useMemo, useState } from "react";
import { BLOG_CAT_DOT, BLOG_LABEL, BLOG_LENS, BLOG_SCROLL_ROW, BLOG_SORT_LABELS, BLOG_STATES, BLOG_VIEW_KEY, blogLenBucket, blogTerms, getBlogMeta } from "../lib/blog";
import { postsByTag } from "../lib/posts";
import { CATEGORIES } from "../content/site";
import { slugify } from "../lib/slug";
import { getLikedPostIds, getReadHistory, getSavedPostIds, toggleLikedPost, toggleSavedPost } from "../lib/storage";
import { POST_TAGS, TOPIC_DESCRIPTIONS } from "../content/topics";
import { getSearchIndex, useSearchText, warmSearchText } from "../lib/search";
import { BlogCard, BlogChip, BlogRow } from "../components/BlogCards";
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Search,
  X,
} from "lucide-react";

// A real, permanent page per topic (added 2026-09-04) -- previously topics
// only existed as filter chips on the Blogs page with no page of their own
// to link to or for search engines to index. Mirrors CollectionView's
// structure closely. Carries a "Back to Blogs" link *and* a row of every
// other topic, so a visitor can jump straight between topics without ever
// going back to Blogs first -- Brian asked specifically that switching
// topics not force a round trip through the Blogs page.
// Topics with at least this many posts get the Blogs page's filters (added
// 2026-10-15). A filter bar above 3 posts is more chrome than content, so the
// smaller topics stay a plain list. The old, unfiltered page is saved in
// backup/cards-classic.jsx.
const TOPIC_FILTER_MIN = 8;
export function TopicView(props) {
  // keyed so moving between topics (Other Topics chips) resets the filters
  return <TopicViewInner key={props.topicName} {...props} />;
}
function TopicViewInner({ topicName, openPost, setView, openTopic, goBack }) {
  const meta = useMemo(() => getBlogMeta(), []);
  const posts = useMemo(() => postsByTag(topicName), [topicName]);
  const filterable = posts.length >= TOPIC_FILTER_MIN;
  const categories = CATEGORIES.filter((c) => c !== "All" && posts.some((p) => p.category === c)).sort(
    (a, b) => posts.filter((p) => p.category === b).length - posts.filter((p) => p.category === a).length
  );
  const topicPath = `/topics/${slugify(topicName)}`;

  // Like the Blogs page, filters live in the address bar so a filtered topic
  // can be shared, and survive going into a post and coming Back.
  const initial = useMemo(() => {
    const none = { type: null, state: null, len: null, q: "", sort: "new" };
    if (!filterable || typeof window === "undefined") return none;
    const p = new URLSearchParams(window.location.search);
    const q = p.get("q") || "";
    const sortParam = p.get("sort");
    return {
      type: categories.find((c) => c.toLowerCase() === (p.get("type") || "").toLowerCase()) || null,
      state: BLOG_STATES.find(([k]) => k === p.get("show"))?.[0] || null,
      len: BLOG_LENS.find(([k]) => k === p.get("len"))?.[0] || null,
      q,
      sort: Object.keys(BLOG_SORT_LABELS).includes(sortParam) && sortParam !== "rel" ? sortParam : q ? "rel" : "new",
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [type, setType] = useState(initial.type);
  const [state, setState] = useState(initial.state);
  const [len, setLen] = useState(initial.len);
  const [layout, setLayout] = useState(() => {
    try {
      return window.localStorage.getItem(BLOG_VIEW_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const [readIds] = useState(() => new Set(getReadHistory().map((e) => e.id)));
  const [savedIds, setSavedIds] = useState(() => new Set(getSavedPostIds()));
  const [likedIds, setLikedIds] = useState(() => new Set(getLikedPostIds()));

  useEffect(() => {
    if (!filterable || window.location.pathname.replace(/\/+$/, "") !== topicPath) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type.toLowerCase());
    if (state) p.set("show", state);
    if (len) p.set("len", len);
    if (sort !== "new" && !(sort === "rel" && q.trim())) p.set("sort", sort);
    const qs = p.toString();
    const url = `${topicPath}${qs ? `?${qs}` : ""}`;
    if (window.location.pathname + window.location.search !== url) window.history.replaceState(window.history.state, "", url);
  }, [q, type, state, len, sort, filterable, topicPath]);

  // The body text used by search is fetched on first use; re-render when it lands.
  useSearchText(blogTerms(q).length > 0);

  if (posts.length === 0) return null;

  const otherTopics = Object.keys(POST_TAGS).filter((t) => t !== topicName);
  const terms = blogTerms(q);
  const inputText = "text-[#1C1F26] dark:text-[#F2F1EC]";
  const resetFilters = () => {
    setType(null);
    setState(null);
    setLen(null);
  };
  const clearAll = () => {
    resetFilters();
    setQ("");
    if (sort === "rel") setSort("new");
  };
  const onSearchChange = (value) => {
    setQ(value);
    if (blogTerms(value).length) {
      if (sort === "new") setSort("rel");
    } else if (sort === "rel") {
      setSort("new");
    }
  };
  const chooseLayout = (next) => {
    setLayout(next);
    try {
      window.localStorage.setItem(BLOG_VIEW_KEY, next);
    } catch {
      // not persisted; non-fatal
    }
  };
  const toggleLike = (id) => {
    toggleLikedPost(id);
    setLikedIds(new Set(getLikedPostIds()));
  };
  const toggleSave = (id) => {
    toggleSavedPost(id);
    setSavedIds(new Set(getSavedPostIds()));
  };

  // Does a post pass every active filter? `skip` leaves one out, which is how
  // each chip's live count is worked out (same approach as the Blogs page).
  const searchOk = (post) => {
    if (!terms.length) return true;
    const index = getSearchIndex(post);
    const m = meta.get(post.id);
    return terms.every((t) => index.includes(t) || m.refs.includes(t));
  };
  const passes = (post, skip) => {
    const m = meta.get(post.id);
    if (!searchOk(post)) return false;
    if (skip !== "type" && type && post.category !== type) return false;
    if (skip !== "len" && len && blogLenBucket(m.minutes) !== len) return false;
    if (skip !== "state" && state) {
      const isRead = readIds.has(post.id);
      if (state === "unread" && isRead) return false;
      if (state === "read" && !isRead) return false;
      if (state === "saved" && !savedIds.has(post.id)) return false;
      if (state === "liked" && !likedIds.has(post.id)) return false;
    }
    return true;
  };
  const stateOf = (key) => (p) =>
    key === "unread" ? !readIds.has(p.id) : key === "read" ? readIds.has(p.id) : key === "saved" ? savedIds.has(p.id) : likedIds.has(p.id);
  const countWhere = (skip, extra) => posts.filter((p) => passes(p, skip) && extra(p)).length;

  const byTime = (a, b) => meta.get(b.id).time - meta.get(a.id).time || b.id - a.id;
  let results = posts.filter((p) => passes(p));
  if (sort === "old") results = [...results].sort((a, b) => -byTime(a, b));
  else if (sort === "short") results = [...results].sort((a, b) => meta.get(a.id).minutes - meta.get(b.id).minutes || byTime(a, b));
  else if (sort === "long") results = [...results].sort((a, b) => meta.get(b.id).minutes - meta.get(a.id).minutes || byTime(a, b));
  else if (sort === "rel" && terms.length) {
    const titleMatch = (p) => terms.every((t) => p.title.toLowerCase().includes(t));
    results = [...results].sort((a, b) => (titleMatch(a) === titleMatch(b) ? byTime(a, b) : titleMatch(a) ? -1 : 1));
  }

  const active = [];
  if (type) active.push([type, () => setType(null)]);
  if (state) active.push([BLOG_STATES.find(([k]) => k === state)[1], () => setState(null)]);
  if (len) active.push([BLOG_LENS.find(([k]) => k === len)[1], () => setLen(null)]);

  const renderItem = (p) => {
    const m = meta.get(p.id);
    const common = {
      post: p,
      meta: m,
      terms,
      isRead: readIds.has(p.id),
      isNew: Date.now() - m.time <= 7 * 864e5 && Date.now() >= m.time,
      liked: likedIds.has(p.id),
      saved: savedIds.has(p.id),
      onOpen: openPost,
      onToggleLike: () => toggleLike(p.id),
      onToggleSave: () => toggleSave(p.id),
    };
    return layout === "list" ? <BlogRow key={p.id} {...common} /> : <BlogCard key={p.id} {...common} />;
  };

  const scrollRow = `${BLOG_SCROLL_ROW} sm:flex-wrap sm:overflow-visible sm:[mask-image:none] sm:[-webkit-mask-image:none]`;
  const filterRow = "flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-4 py-3 border-b last:border-b-0 border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 min-w-0";

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => goBack("blog")}
        className="hit inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back
      </button>

      <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] dark:text-[#B08D57] font-semibold mb-3">Topic</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-3"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {topicName}
      </h1>
      {TOPIC_DESCRIPTIONS[topicName] && (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[16px] leading-relaxed max-w-xl mb-3">{TOPIC_DESCRIPTIONS[topicName]}</p>
      )}
      <p className="text-[#6E717A] dark:text-[#848892] text-[13px] mb-10">
        {posts.length} {posts.length === 1 ? "post" : "posts"} on The Gospel Lens.
      </p>

      {filterable && (
        <>
          <div role="group" aria-label="Filters" className="border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 bg-white dark:bg-[#1E2128] rounded-sm">
            <div className={filterRow}>
              <span className={`${BLOG_LABEL} sm:min-w-[52px]`}>Type</span>
              <div className={scrollRow}>
                <BlogChip label="All" count={countWhere("type", () => true)} active={!type} onClick={() => setType(null)} />
                {categories.map((c) => (
                  <BlogChip
                    key={c}
                    label={c}
                    count={countWhere("type", (p) => p.category === c)}
                    active={type === c}
                    dotClass={BLOG_CAT_DOT[c]}
                    onClick={() => setType(type === c ? null : c)}
                  />
                ))}
              </div>
            </div>
            <div className={filterRow}>
              <span className={`${BLOG_LABEL} sm:min-w-[52px]`}>Yours</span>
              <div className={scrollRow}>
                {BLOG_STATES.map(([key, label]) => (
                  <BlogChip key={key} label={label} count={countWhere("state", stateOf(key))} active={state === key} onClick={() => setState(state === key ? null : key)} />
                ))}
              </div>
            </div>
            <div className={filterRow}>
              <span className={`${BLOG_LABEL} sm:min-w-[52px]`}>Length</span>
              <div className={scrollRow}>
                {BLOG_LENS.map(([key, label]) => (
                  <BlogChip
                    key={key}
                    label={label}
                    count={countWhere("len", (p) => blogLenBucket(meta.get(p.id).minutes) === key)}
                    active={len === key}
                    onClick={() => setLen(len === key ? null : key)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 pt-3.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:max-w-[420px] min-w-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E717A] dark:text-[#848892]" />
                <input
                  type="search"
                  value={q}
                  onFocus={warmSearchText}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={`Search in ${topicName}…`}
                  aria-label={`Search in ${topicName}`}
                  autoComplete="off"
                  className={`w-full bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm pl-9 pr-9 py-2.5 text-base sm:text-[15px] ${inputText} placeholder:text-[#6E717A] focus:outline-none focus:border-[#4A5D4E] dark:focus:border-[#6E9077] [&::-webkit-search-cancel-button]:hidden`}
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#6E717A] dark:text-[#848892] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
                  >
                    <X size={14} strokeWidth={2.4} />
                  </button>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort posts"
                className={`flex-none w-[128px] sm:w-auto bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm px-1.5 sm:px-2.5 py-2.5 text-base sm:text-[13.5px] ${inputText}`}
              >
                {terms.length > 0 && <option value="rel">Best match</option>}
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
                <option value="short">Shortest read</option>
                <option value="long">Longest read</option>
              </select>
              <div className="hidden sm:inline-flex border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm overflow-hidden bg-white dark:bg-[#1E2128]" role="group" aria-label="Layout">
                {[["grid", "Card view", LayoutGrid], ["list", "List view", List]].map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseLayout(key)}
                    aria-pressed={layout === key}
                    aria-label={label}
                    title={label}
                    className={`px-[11px] py-[9px] ${layout === key ? "bg-[#4A5D4E]/10 text-[#4A5D4E] dark:text-[#8FAE95]" : "text-[#6E717A] dark:text-[#848892]"}`}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13.5px] text-[#5B5F6B] dark:text-[#A9ADB6] min-h-[28px]" aria-live="polite">
              <span>
                <b className={`${inputText} font-semibold`}>{results.length}</b> {results.length === 1 ? "post" : "posts"}
                {terms.length > 0 && <> for "{q.trim()}"</>} in {topicName}
              </span>
              {active.map(([label, remove]) => (
                <button
                  key={label}
                  type="button"
                  onClick={remove}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#4A5D4E] dark:text-[#8FAE95] bg-[#4A5D4E]/10 rounded-full pl-2.5 pr-2 py-1"
                >
                  {label}
                  <X size={12} strokeWidth={2.6} />
                </button>
              ))}
              {(active.length > 0 || terms.length > 0) && (
                <button type="button" onClick={clearAll} className="text-[12.5px] font-semibold text-[#6E717A] dark:text-[#848892] underline underline-offset-[3px]">
                  Clear all
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {results.length === 0 ? (
        <div className="text-center py-14 px-5 mt-4 mb-14 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
          <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Nothing matches that
          </h2>
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-5">
            {terms.length ? `Nothing in ${topicName} matches that search and those filters.` : "Those filters don't overlap on any post in this topic yet."} Try removing one.
          </p>
          <BlogChip label="Clear everything" onClick={clearAll} active={false} />
        </div>
      ) : layout === "list" && filterable ? (
        <div className="mt-4 mb-14 border-t border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
          <h2 className="sr-only">Posts in {topicName}</h2>
          {results.map(renderItem)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-4 mb-14">
          <h2 className="sr-only">Posts in {topicName}</h2>
          {results.map(renderItem)}
        </div>
      )}

      <h2 className="text-[12px] uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] font-semibold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Other Topics</h2>
      <div className="flex flex-wrap gap-2">
        {otherTopics.map((t) => (
          <button
            key={t}
            onClick={() => openTopic(t)}
            className="text-xs text-[#5B5F6B] dark:text-[#A9ADB6] bg-[#4A5D4E]/6 hover:bg-[#4A5D4E]/12 hover:text-[#4A5D4E] px-3 py-2.5 rounded-full transition-colors duration-200"
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}
