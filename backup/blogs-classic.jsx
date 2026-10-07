// Classic Blogs page (BlogListView + PAGE_SIZE), saved 2026-10-07 before the Blogs makeover.
// Plain reference copy: NOT imported or bundled. See CLAUDE.md, "Blogs page restore".

const PAGE_SIZE = 9;

function BlogListView({ openPost, initialSearch = "", openTopic }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readCount] = useState(() => getReadHistory().length);

  // Whenever a search arrives from the nav bar, apply it here too
  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = useMemo(() => {
    const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matched = [...POSTS]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((post) => (category === "All" ? true : post.category === category))
      .filter((post) => {
        if (terms.length === 0) return true;
        const index = getSearchIndex(post);
        // Every word the person typed has to appear somewhere in the post —
        // order and exact phrasing don't matter, so "grace faith" finds
        // posts about both without needing that exact phrase.
        return terms.every((term) => index.includes(term));
      });

    if (terms.length === 0) return matched;

    // While actively searching, a post whose title matches should always
    // outrank one that just happens to mention the word once in passing —
    // sort is stable, so date order is preserved within each tier.
    return [...matched].sort((a, b) => {
      const aTitleMatch = terms.every((term) => a.title.toLowerCase().includes(term));
      const bTitleMatch = terms.every((term) => b.title.toLowerCase().includes(term));
      if (aTitleMatch === bTitleMatch) return 0;
      return aTitleMatch ? -1 : 1;
    });
  }, [search, category]);

  // Reset pagination whenever the search or category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category]);

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const topics = Object.keys(POST_TAGS);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Blogs
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-8 max-w-lg">
        Every post viewed through one lens: the finished work of Christ.
        {readCount > 0 && (
          <span className="block text-[#8A8D96] dark:text-[#7C808A] text-[13px] mt-1">
            You've read {readCount} {readCount === 1 ? "post" : "posts"} so far.
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8D96] dark:text-[#7C808A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, topics, verses…"
            className="w-full bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 pl-9 pr-9 py-2.5 text-base sm:text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#8A8D96] focus:outline-none focus:border-[#4A5D4E] rounded-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8D96] dark:text-[#7C808A] hover:text-[#1C1F26]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] px-3.5 py-2 rounded-full border-2 transition-all duration-200 ${
                  active
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-[0_4px_12px_-4px_rgba(74,93,78,0.5)]"
                    : "bg-white dark:bg-[#1E2128] text-[#5B5F6B] dark:text-[#A9ADB6] border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 hover:border-[#4A5D4E]/50"
                }`}
              >
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1E2128]" />}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mr-1">Topics:</span>
        {topics.map((tag) => (
          <button
            key={tag}
            onClick={() => openTopic(tag)}
            className="text-xs text-[#5B5F6B] dark:text-[#A9ADB6] bg-[#4A5D4E]/6 hover:bg-[#4A5D4E]/12 hover:text-[#4A5D4E] px-3 py-1.5 rounded-full transition-colors duration-200"
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#8A8D96] dark:text-[#7C808A] mb-8">
        Showing {filtered.length} {filtered.length === 1 ? "post" : "posts"}
        {category !== "All" ? <> in <span className="font-semibold text-[#4A5D4E]">{category}</span></> : null}
        {search.trim() ? <> matching "<span className="font-semibold text-[#1C1F26] dark:text-[#F2F1EC]">{search.trim()}</span>"</> : null}
      </p>

      {filtered.length === 0 ? (
        <p className="text-[#8A8D96] dark:text-[#7C808A] text-sm py-16 text-center">
          Nothing matches that search yet — try a different word or category.
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} onOpen={openPost} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-7 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
