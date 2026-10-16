import { useEffect, useMemo, useState } from "react";
import { BLOG_CAT_DOT, BLOG_LABEL, BLOG_LENS, BLOG_PAGE, BLOG_SCROLL_ROW, BLOG_SORT_LABELS, BLOG_STATES, BLOG_VIEW_KEY, blogLenBucket, blogTerms, getBlogMeta } from "../lib/blog";
import { POSTS } from "../lib/posts";
import { POST_TAGS } from "../content/topics";
import { CATEGORIES } from "../content/site";
import { slugify } from "../lib/slug";
import { getLikedPostIds, getReadHistory, getSavedPostIds, toggleLikedPost, toggleSavedPost } from "../lib/storage";
import { getSearchIndex, useSearchText, warmSearchText } from "../lib/search";
import { BlogCard, BlogChip, BlogRow } from "../components/BlogCards";
import {
  BookOpen,
  Bookmark,
  Check,
  Heart,
  LayoutGrid,
  List,
  Search,
  Shuffle,
  X,
} from "lucide-react";

export function BlogListView({ openPost, initialSearch = "", openTopic, consumeNavSearch }) {
  const meta = useMemo(() => getBlogMeta(), []);
  const posts = useMemo(() => [...POSTS].sort((a, b) => meta.get(b.id).time - meta.get(a.id).time || b.id - a.id), [meta]);
  const topics = Object.keys(POST_TAGS);
  // Biggest type first (Devotional, Teaching, Foundations), not CATEGORIES' own order.
  const categories = CATEGORIES.filter((c) => c !== "All").sort(
    (a, b) => POSTS.filter((p) => p.category === b).length - POSTS.filter((p) => p.category === a).length
  );

  // Filters live in the address bar (/blog?topic=peace&type=devotional) so a
  // filtered view can be shared or bookmarked, and survives going into a post
  // and coming Back. Read once on mount; written back with replaceState.
  const initial = useMemo(() => {
    const p = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const type = categories.find((c) => c.toLowerCase() === (p.get("type") || "").toLowerCase()) || null;
    const topic = topics.find((t) => slugify(t) === p.get("topic")) || null;
    const state = BLOG_STATES.find(([k]) => k === p.get("show"))?.[0] || null;
    const len = BLOG_LENS.find(([k]) => k === p.get("len"))?.[0] || null;
    const q = p.get("q") || initialSearch || "";
    const sortParam = p.get("sort");
    const sort = Object.keys(BLOG_SORT_LABELS).includes(sortParam) && sortParam !== "rel" ? sortParam : q ? "rel" : "new";
    return { type, topic, state, len, q, sort };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [type, setType] = useState(initial.type);
  const [topic, setTopic] = useState(initial.topic);
  const [state, setState] = useState(initial.state);
  const [len, setLen] = useState(initial.len);
  const [visible, setVisible] = useState(BLOG_PAGE);
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
  const [surpriseNote, setSurpriseNote] = useState("");

  // A search typed in the top nav arrives here as initialSearch.
  useEffect(() => {
    if (initialSearch) {
      setQ(initialSearch);
      setSort("rel");
      setVisible(BLOG_PAGE);
      consumeNavSearch?.();
    }
  }, [initialSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mirror the filters into the address bar without adding history entries.
  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, "") !== "/blog") return;
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (type) p.set("type", type.toLowerCase());
    if (topic) p.set("topic", slugify(topic));
    if (state) p.set("show", state);
    if (len) p.set("len", len);
    if (sort !== "new" && !(sort === "rel" && q.trim())) p.set("sort", sort);
    const qs = p.toString();
    const url = `/blog${qs ? `?${qs}` : ""}`;
    if (window.location.pathname + window.location.search !== url) window.history.replaceState(window.history.state, "", url);
  }, [q, type, topic, state, len, sort]);

  const terms = blogTerms(q);
  // The body text used by search is fetched on first use; recompute results when it lands.
  const searchReady = useSearchText(terms.length > 0);

  // Does a post pass every active filter? `skip` leaves one filter out, which
  // is how each chip's live count is computed.
  const searchOk = useMemo(() => {
    const map = new Map();
    for (const post of posts) {
      if (!terms.length) {
        map.set(post.id, true);
        continue;
      }
      const index = getSearchIndex(post);
      const m = meta.get(post.id);
      map.set(post.id, terms.every((t) => index.includes(t) || m.refs.includes(t)));
    }
    return map;
  }, [posts, meta, q, searchReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const passes = (post, skip) => {
    const m = meta.get(post.id);
    if (!searchOk.get(post.id)) return false;
    if (skip !== "type" && type && post.category !== type) return false;
    if (skip !== "topic" && topic && !m.tags.includes(topic)) return false;
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

  const results = useMemo(() => {
    const list = posts.filter((p) => passes(p));
    const byTime = (a, b) => meta.get(b.id).time - meta.get(a.id).time || b.id - a.id;
    if (sort === "old") return [...list].sort((a, b) => -byTime(a, b));
    if (sort === "short") return [...list].sort((a, b) => meta.get(a.id).minutes - meta.get(b.id).minutes || byTime(a, b));
    if (sort === "long") return [...list].sort((a, b) => meta.get(b.id).minutes - meta.get(a.id).minutes || byTime(a, b));
    if (sort === "rel" && terms.length) {
      // A title match outranks one that merely mentions the word in passing;
      // date order is kept within each tier.
      const titleMatch = (p) => terms.every((t) => p.title.toLowerCase().includes(t));
      return [...list].sort((a, b) => (titleMatch(a) === titleMatch(b) ? byTime(a, b) : titleMatch(a) ? -1 : 1));
    }
    return list;
  }, [posts, searchOk, type, topic, state, len, sort, readIds, savedIds, likedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const countWhere = (skip, extra) => posts.filter((p) => passes(p, skip) && extra(p)).length;
  const stateOf = (key) => (p) =>
    key === "unread" ? !readIds.has(p.id) : key === "read" ? readIds.has(p.id) : key === "saved" ? savedIds.has(p.id) : likedIds.has(p.id);

  const resetPaging = () => setVisible(BLOG_PAGE);
  const clearFilters = () => {
    setType(null);
    setTopic(null);
    setState(null);
    setLen(null);
    resetPaging();
  };
  const clearAll = () => {
    clearFilters();
    setQ("");
    if (sort === "rel") setSort("new");
  };
  const onSearchChange = (value) => {
    setQ(value);
    resetPaging();
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
  const surprise = () => {
    let pool = results.filter((p) => !readIds.has(p.id));
    if (!pool.length) pool = posts.filter((p) => !readIds.has(p.id));
    if (!pool.length) {
      setSurpriseNote("You've read every post. Wow.");
      return;
    }
    openPost(pool[Math.floor(Math.random() * pool.length)]);
  };

  const active = [];
  if (type) active.push([type, () => setType(null)]);
  if (topic) active.push([topic, () => setTopic(null)]);
  if (state) active.push([BLOG_STATES.find(([k]) => k === state)[1], () => setState(null)]);
  if (len) active.push([BLOG_LENS.find(([k]) => k === len)[1], () => setLen(null)]);

  const shown = results.slice(0, visible);
  const total = posts.length;
  const grouped = !terms.length && (sort === "new" || sort === "old");
  const monthOf = (p) => new Date(p.date).toLocaleString("en-US", { month: "long", year: "numeric" });
  const monthTotals = {};
  if (grouped) for (const p of results) monthTotals[monthOf(p)] = (monthTotals[monthOf(p)] || 0) + 1;

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
  const renderBucket = (items, key) =>
    layout === "list" ? (
      <div key={key} className="border-t border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
        {items.map(renderItem)}
      </div>
    ) : (
      <div key={key} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map(renderItem)}
      </div>
    );

  // "Yours" filters that are empty because the visitor has none of that yet
  // (nothing saved, nothing liked, nothing read, or everything read) get a
  // friendly explanation instead of the generic "nothing matches."
  const stateEmpty = state && !posts.some(stateOf(state));
  const stateEmptyCopy = {
    saved: {
      Icon: Bookmark,
      title: "Nothing saved yet",
      text: "Tap the bookmark on any post to set it aside for later, and it will be waiting for you here.",
    },
    liked: {
      Icon: Heart,
      title: "No liked posts yet",
      text: "When a post really speaks to you, tap its heart. The ones that mattered most will collect here.",
    },
    read: {
      Icon: BookOpen,
      title: "You haven't read anything yet",
      text: "Start anywhere, whatever catches your eye. Once you open a post, it shows up here so you can find your way back.",
    },
    unread: {
      Icon: Check,
      title: `You've read all ${total} posts`,
      text: "That's the whole library. Thank you for spending the time. New posts will appear here as they're published, and any of these are worth a second read.",
    },
  }[state];

  let body;
  if (!results.length && stateEmpty && stateEmptyCopy) {
    const { Icon } = stateEmptyCopy;
    body = (
      <div className="text-center py-16 px-5 mt-5 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
        <Icon size={28} strokeWidth={1.75} className="mx-auto text-[#6E717A] dark:text-[#848892] mb-4" />
        <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          {stateEmptyCopy.title}
        </h2>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed max-w-md mx-auto mb-6">{stateEmptyCopy.text}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <BlogChip label="Show all posts" onClick={() => { setState(null); resetPaging(); }} active={false} />
          {state !== "unread" && <BlogChip label="Surprise me" onClick={surprise} active={false} />}
        </div>
      </div>
    );
  } else if (!results.length) {
    body = (
      <div className="text-center py-16 px-5 mt-5 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
        <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Nothing matches that
        </h2>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-5">
          {terms.length && active.length
            ? "Your search and filters together are too narrow."
            : terms.length
            ? `No post mentions "${q.trim()}".`
            : "Those filters don't overlap on any post yet."}{" "}
          Try removing one.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <BlogChip label="Clear everything" onClick={clearAll} active={false} />
          {terms.length > 0 && active.length > 0 && <BlogChip label="Keep search, clear filters" onClick={clearFilters} active={false} />}
        </div>
      </div>
    );
  } else if (grouped) {
    const out = [];
    let bucket = [];
    let current = null;
    shown.forEach((p) => {
      const key = monthOf(p);
      if (key !== current) {
        if (bucket.length) out.push(renderBucket(bucket, `b-${current}`));
        bucket = [];
        current = key;
        out.push(
          <div key={`h-${key}`} className="flex items-baseline gap-3 mt-9 mb-3.5 first:mt-5">
            <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-[22px]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              {key}
            </h2>
            <span className="text-[13px] text-[#6E717A] dark:text-[#848892]">
              {monthTotals[key]} {monthTotals[key] === 1 ? "post" : "posts"}
            </span>
            <span aria-hidden="true" className="flex-1 h-px bg-[#1C1F26]/12 dark:bg-[#F2F1EC]/14 self-center" />
          </div>
        );
      }
      bucket.push(p);
    });
    if (bucket.length) out.push(renderBucket(bucket, `b-${current}`));
    body = <>{out}</>;
  } else {
    body = (
      <div className="mt-5">
        <h2 className="sr-only">Results</h2>
        {renderBucket(shown, "flat")}
      </div>
    );
  }

  const readCount = readIds.size;
  const hasMore = visible < results.length;
  const inputText = "text-[#1C1F26] dark:text-[#F2F1EC]";

  return (
    <div>
      <header className="max-w-5xl mx-auto px-6 sm:px-8 pt-9 sm:pt-14 pb-5 sm:pb-6 flex flex-wrap items-end justify-between gap-5 sm:gap-7">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#7F6637] dark:text-[#D9B77C]">The library</div>
          <h1 className={`${inputText} text-[40px] sm:text-[54px] leading-[1.05] mt-2.5 mb-3`} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Blogs
          </h1>
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-base max-w-[520px]">
            {total} posts, all viewed through one lens: the finished work of Christ.
          </p>
        </div>
        <div className="grid gap-2.5 w-full sm:w-auto sm:min-w-[250px]">
          {readCount > 0 && (
            <>
              <div className="flex justify-between gap-3 text-[13px] text-[#5B5F6B] dark:text-[#A9ADB6]">
                <span>
                  You've read{" "}
                  <b className={`${inputText} font-semibold`}>
                    {readCount} of {total}
                  </b>
                </span>
                <span>{Math.round((readCount / total) * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#4A5D4E]/16 dark:bg-[#6E9077]/24 overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-[#4A5D4E] dark:bg-[#6E9077]" style={{ width: `${Math.max(2, (readCount / total) * 100)}%` }} />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={surprise}
            className="inline-flex items-center justify-center gap-2 text-[13.5px] font-semibold text-[#4A5D4E] dark:text-[#8FAE95] border border-[#4A5D4E] dark:border-[#6E9077] rounded-full px-4 py-2 hover:bg-[#4A5D4E] hover:text-white dark:hover:bg-[#6E9077] dark:hover:text-[#14161B] transition-colors duration-200"
          >
            <Shuffle size={15} strokeWidth={2} />
            Surprise me with something unread
          </button>
          {surpriseNote && <p className="text-xs text-[#6E717A] dark:text-[#848892] text-center">{surpriseNote}</p>}
        </div>
      </header>

      <section aria-label="Filters" className="border-y border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 bg-white dark:bg-[#1E2128]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 grid grid-cols-[minmax(0,1fr)]">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-y-3.5 md:gap-x-8 pt-3.5 pb-3 md:py-3.5 border-b border-[#1C1F26]/7 dark:border-[#F2F1EC]/8">
            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 min-w-0">
              <span className={BLOG_LABEL}>Type</span>
              <div className={`${BLOG_SCROLL_ROW} md:flex-wrap md:overflow-visible md:[mask-image:none] md:[-webkit-mask-image:none]`}>
                <BlogChip label="All" count={countWhere("type", () => true)} active={!type} onClick={() => { setType(null); resetPaging(); }} />
                {categories.map((c) => (
                  <BlogChip
                    key={c}
                    label={c}
                    count={countWhere("type", (p) => p.category === c)}
                    active={type === c}
                    dotClass={BLOG_CAT_DOT[c]}
                    onClick={() => { setType(type === c ? null : c); resetPaging(); }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 min-w-0">
              <span className={BLOG_LABEL}>Yours</span>
              <div className={`${BLOG_SCROLL_ROW} md:flex-wrap md:overflow-visible md:[mask-image:none] md:[-webkit-mask-image:none]`}>
                {BLOG_STATES.map(([key, label]) => (
                  <BlogChip
                    key={key}
                    label={label}
                    count={countWhere("state", stateOf(key))}
                    active={state === key}
                    onClick={() => { setState(state === key ? null : key); resetPaging(); }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 min-w-0">
              <span className={BLOG_LABEL}>Length</span>
              <div className={`${BLOG_SCROLL_ROW} md:flex-wrap md:overflow-visible md:[mask-image:none] md:[-webkit-mask-image:none]`}>
                {BLOG_LENS.map(([key, label]) => (
                  <BlogChip
                    key={key}
                    label={label}
                    count={countWhere("len", (p) => blogLenBucket(meta.get(p.id).minutes) === key)}
                    active={len === key}
                    onClick={() => { setLen(len === key ? null : key); resetPaging(); }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 min-w-0 pt-0.5 pb-3.5 md:py-3">
            <span className={BLOG_LABEL}>Topic</span>
            <div className={BLOG_SCROLL_ROW}>
              <BlogChip label="All topics" active={!topic} onClick={() => { setTopic(null); resetPaging(); }} />
              {topics.map((t) => (
                <BlogChip
                  key={t}
                  label={t}
                  count={countWhere("topic", (p) => meta.get(p.id).tags.includes(t))}
                  active={topic === t}
                  onClick={() => { setTopic(topic === t ? null : t); resetPaging(); }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[81px] z-20 bg-[#F8F7F3]/95 dark:bg-[#14161B]/95 backdrop-blur-sm border-b border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-3 grid gap-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:max-w-[420px] min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E717A] dark:text-[#848892]" />
              <input
                type="search"
                value={q}
                onFocus={warmSearchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search posts…"
                aria-label="Search posts"
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
              onChange={(e) => {
                setSort(e.target.value);
                resetPaging();
              }}
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
              {terms.length > 0 && <> for "{q.trim()}"</>} · {BLOG_SORT_LABELS[sort]}
            </span>
            {active.map(([label, remove]) => (
              <button
                key={label}
                type="button"
                onClick={() => { remove(); resetPaging(); }}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#4A5D4E] dark:text-[#8FAE95] bg-[#4A5D4E]/10 rounded-full pl-2.5 pr-2 py-1"
              >
                {label}
                <X size={12} strokeWidth={2.6} />
              </button>
            ))}
            {topic && (
              <button type="button" onClick={() => openTopic(topic)} className="text-[12.5px] font-semibold text-[#4A5D4E] dark:text-[#8FAE95] underline underline-offset-[3px]">
                Open the {topic} page →
              </button>
            )}
            {(active.length > 0 || terms.length > 0) && (
              <button type="button" onClick={clearAll} className="text-[12.5px] font-semibold text-[#6E717A] dark:text-[#848892] underline underline-offset-[3px]">
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-2 pb-20 sm:pb-24">
        {body}
        {results.length > 0 && hasMore && (
          <div className="grid justify-items-center gap-3 mt-10 text-[13px] text-[#6E717A] dark:text-[#848892]">
            <div>
              Showing {shown.length} of {results.length}
            </div>
            <div className="w-[220px] h-1.5 rounded-full bg-[#4A5D4E]/16 dark:bg-[#6E9077]/24 overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-[#4A5D4E] dark:bg-[#6E9077]" style={{ width: `${(shown.length / results.length) * 100}%` }} />
            </div>
            <button
              type="button"
              onClick={() => setVisible((v) => v + BLOG_PAGE)}
              className="border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 bg-white dark:bg-[#1E2128] text-[#1C1F26] dark:text-[#F2F1EC] px-7 py-3 text-sm font-semibold tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
            >
              Show {Math.min(BLOG_PAGE, results.length - visible)} more
            </button>
          </div>
        )}
        {results.length > BLOG_PAGE && !hasMore && (
          <p className="text-center mt-10 text-[13px] text-[#6E717A] dark:text-[#848892]">That's all {results.length}.</p>
        )}
      </div>
    </div>
  );
}
