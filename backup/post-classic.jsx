// Classic post page (PostBody, ReadingProgress, SinglePostView, BackToTop), saved 2026-10-15
// before the post page makeover. Plain reference copy: NOT imported or bundled.
// See CLAUDE.md, "Post page restore".

function PostBody({ blocks, post, openScriptureIndex, journalEntries, onSaveAnswer, signedIn, openJournal }) {
  let paragraphIndex = -1;

  return (
    <div className="space-y-6 text-[#2E323B] dark:text-[#D9D9D9] text-[18px] leading-[1.9]">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          paragraphIndex += 1;
          const isFirst = paragraphIndex === 0;
          return (
            <p key={i}>
              {isFirst ? (
                <>
                  <span
                    className="float-left text-7xl leading-[0.75] pr-3 pt-2 text-[#4A5D4E]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  >
                    {block.text.charAt(0)}
                  </span>
                  {renderInline(block.text.slice(1))}
                </>
              ) : (
                renderInline(block.text)
              )}
            </p>
          );
        }

        if (block.type === "heading") {
          return (
            <h2
              key={i}
              className="text-2xl text-[#1C1F26] dark:text-[#F2F1EC] pt-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={i} className="not-prose space-y-2 pl-1">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-3 text-[18px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-3 shrink-0" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <div key={i} className="not-prose bg-[#1C1F26] text-[#F8F7F3] rounded-sm px-7 py-6 my-8">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-2">
                    Wisdom of the Day
                  </p>
                  <p className="text-[17px] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{block.text}"
                  </p>
                  {block.attribution && (
                    <p className="text-sm text-[#B0B4BD] mt-3">— {block.attribution}</p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "scripture") {
          return (
            <div key={i} className="not-prose border-l-4 border-[#B08D57] bg-[#4A5D4E]/6 rounded-r-sm px-6 py-6 my-8">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold">
                  Scripture Focus · {block.reference}
                </p>
                {/* Entry point to the Scripture Index (/verses) -- the ONLY
                    way in, deliberately, per Brian's explicit ask that it
                    not live on the nav or homepage. Small and in the
                    corner, on purpose: his direct feedback on the first
                    version of this button was that it read too long/big
                    sitting next to "Share this verse" -- moved here,
                    icon-only, opposite the label instead.

                    The hover label is hand-built with group-hover, not the
                    native `title` attribute -- Brian asked for a real "on
                    hover it reads Scripture Index, on mouse-out it
                    disappears" tooltip (2026-09-11). A browser's native
                    title tooltip is unreliable exactly where this site is
                    also used: installed as a desktop app, its OS-level
                    tooltip rendering isn't guaranteed the same way it is in
                    a normal browser tab. This one is plain CSS, so it works
                    identically either way. */}
                {openScriptureIndex && (
                  <div className="relative shrink-0 -mt-0.5">
                    <button
                      onClick={openScriptureIndex}
                      aria-label="View Scripture Index"
                      className="group/tooltip no-print relative w-6 h-6 rounded-full flex items-center justify-center text-[#4A5D4E]/50 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition-colors duration-200"
                    >
                      <List size={13} strokeWidth={2} />
                      <span
                        role="tooltip"
                        className="no-print pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded-sm bg-[#1C1F26] dark:bg-[#F2F1EC] px-2 py-1 text-[11px] font-medium text-[#F8F7F3] dark:text-[#1C1F26] opacity-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:opacity-100 transition-opacity duration-150 z-10"
                      >
                        Scripture Index
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {block.verses.map((v, vi) => (
                  <p key={vi} className="text-[17px] leading-relaxed italic text-[#2E323B] dark:text-[#D9D9D9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{v}"
                  </p>
                ))}
              </div>
              {post && <ScriptureShareButton post={post} reference={block.reference} verses={block.verses} />}
            </div>
          );
        }

        if (block.type === "reflection") {
          return (
            <div key={i} className="not-prose bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-7 py-6 my-8">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold">
                  Reflection Questions
                </p>
                {/* Entry point to the Reflection Journal (/journal) -- same
                    icon-only, hand-built-tooltip treatment as the Scripture
                    Index button on the Scripture Focus box above, for the
                    same reason: consistent, small, in the corner opposite
                    the label. */}
                {openJournal && (
                  <div className="relative shrink-0 -mt-0.5">
                    <button
                      onClick={() => openJournal()}
                      aria-label="View Your Journal"
                      className="group/tooltip no-print relative w-6 h-6 rounded-full flex items-center justify-center text-[#4A5D4E]/50 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition-colors duration-200"
                    >
                      <NotebookPen size={13} strokeWidth={2} />
                      <span
                        role="tooltip"
                        className="no-print pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded-sm bg-[#1C1F26] dark:bg-[#F2F1EC] px-2 py-1 text-[11px] font-medium text-[#F8F7F3] dark:text-[#1C1F26] opacity-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:opacity-100 transition-opacity duration-150 z-10"
                      >
                        Your Journal
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <p className="no-print text-[12.5px] text-[#5B5F6B] dark:text-[#A9ADB6] leading-relaxed mb-4 max-w-[48ch]">
                Answer in your own words, below — it's saved privately to your Journal as you write, so you can look back on it later.
              </p>
              <ul className="space-y-4">
                {block.items.map((q, qi) => (
                  <li key={qi} className="space-y-2">
                    <div className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                      <span className="text-[#B08D57] font-semibold shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {qi + 1}.
                      </span>
                      <span>{q}</span>
                    </div>
                    {post && onSaveAnswer && (
                      <div className="pl-7">
                        <JournalAnswerBox
                          key={`${post.id}-${qi}`}
                          postId={post.id}
                          qIndex={qi}
                          savedText={getJournalAnswerText(journalEntries || [], post.id, qi)}
                          onSave={onSaveAnswer}
                          signedIn={signedIn}
                          onViewJournal={openJournal}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "heart") {
          return (
            <div key={i} className="not-prose flex gap-3 items-start bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm px-6 py-5 my-8">
              <Quote size={18} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a6f42] font-semibold mb-2">
                  Write This On Your Heart
                </p>
                <p className="text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">{block.text}</p>
              </div>
            </div>
          );
        }

        if (block.type === "encourage") {
          return (
            <div key={i} className="not-prose text-center border-y border-[#B08D57]/30 py-8 my-10">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">
                Be Encouraged
              </p>
              <p
                className="text-[22px] sm:text-2xl leading-snug text-[#1C1F26] dark:text-[#F2F1EC] max-w-lg mx-auto"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "share") {
          return (
            <div key={i} className="not-prose bg-[#4A5D4E]/6 rounded-sm px-7 py-6 my-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4">
                Share Your Faith
              </p>
              <ul className="space-y-3">
                {block.items.map((item, ii) => (
                  <li key={ii} className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "prayer") {
          return (
            <div key={i} className="not-prose my-8">
              <div className="bg-[#1C1F26]/4 border-l-4 border-[#1C1F26]/20 dark:border-[#F2F1EC]/20 rounded-r-sm px-7 py-6 mb-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#5B5F6B] dark:text-[#A9ADB6] font-semibold mb-3">
                  A Prayer
                </p>
                <p className="text-[17px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {block.text}
                </p>
              </div>
              {/* Points at the Journal's Prayer tab specifically, not just
                  /journal generally -- openJournal("prayer") deep-links via
                  the #prayer hash, so the moment someone finishes reading a
                  prayer and wants to write their own lands exactly there. */}
              {openJournal && (
                <p className="no-print text-[13px] text-[#5B5F6B] dark:text-[#A9ADB6]">
                  Want to keep praying this?{" "}
                  <button onClick={() => openJournal("prayer")} className="text-[#B08D57] font-semibold hover:underline">
                    Add it to your own Prayer List →
                  </button>
                </p>
              )}
            </div>
          );
        }

        if (block.type === "closing") {
          return (
            <p key={i} className="text-sm italic text-[#8A8D96] dark:text-[#7C808A] pt-2">
              {block.text}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="no-print fixed top-20 left-0 w-full h-[3px] bg-transparent z-20">
      <div className="h-full bg-[#B08D57] transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  );
}

function SinglePostView({ post, setView, goBack, openPost, openPlanPost, openCollection, openReadingPlan, cameFromPlan, openScriptureIndex, journalEntries, onSaveAnswer, signedIn, openJournal, openSeries }) {
  const { status: listenStatus, toggle: toggleListen, restart: restartListen, supported: listenSupported } = useListenToPost(post || POSTS[0]);
  const [saved, setSaved] = useState(() => isPostSaved((post || POSTS[0]).id));
  const [liked, setLiked] = useState(() => isPostLiked((post || POSTS[0]).id));

  // Quietly note this post as read — see the READ HISTORY section above.
  useEffect(() => {
    if (post) recordPostRead(post.id);
  }, [post?.id]);

  // This component doesn't unmount between posts (only `post` changes), so
  // the bookmark/like toggles' own local state needs an explicit refresh
  // here rather than just a useState initializer.
  useEffect(() => {
    if (post) {
      setSaved(isPostSaved(post.id));
      setLiked(isPostLiked(post.id));
    }
  }, [post?.id]);

  if (!post) return null;

  const handleToggleSave = () => setSaved(toggleSavedPost(post.id));
  const handleToggleLike = () => setLiked(toggleLikedPost(post.id));

  const related = getRelatedPosts(post, 2);

  // Is this post one of the 4-Day Reading Plan's days, AND did the reader
  // actually get here by following the plan (its overview, or "Continue" on
  // the previous day)? If both, surface a banner up top (which day, and a
  // way back to the plan overview) and a "continue to the next day" card at
  // the bottom -- added 2026-09-05 after Brian pointed out that finishing
  // Day 1 dropped a reader with no way to find Day 2 or the plan itself
  // again except by remembering the URL. Gating on `cameFromPlan` too (not
  // just the id lookup) is deliberate, per Brian's explicit follow-up: the
  // same post opened from the Blogs page, search, Saved/Liked, a share
  // link, or Older/Newer nav should look exactly like any other post -- the
  // plan's outline is specific to actually being on the guided path, not a
  // permanent property of the post itself. `openPost` (used by every other
  // navigation path) resets `cameFromPlan` to false; only the plan overview
  // and this component's own "Continue" button use `openPlanPost`, which
  // sets it true.
  const planIndex = READING_PLAN_POST_IDS.indexOf(post.id);
  const isPlanPost = cameFromPlan && planIndex !== -1;
  const isLastPlanDay = isPlanPost && planIndex === READING_PLAN_POST_IDS.length - 1;
  const nextPlanPost = isPlanPost && !isLastPlanDay ? POSTS.find((p) => p.id === READING_PLAN_POST_IDS[planIndex + 1]) : null;

  // Series membership (e.g. The Proverbs Series): a banner up top and a
  // "next in the series" card at the end. Shown however the post was reached.
  const seriesId = seriesIdForPost(post);
  const seriesPosts = seriesId ? postsInSeries(seriesId) : [];
  const seriesIndex = seriesPosts.findIndex((p) => p.id === post.id);
  const nextInSeries = seriesIndex !== -1 ? seriesPosts[seriesIndex + 1] || null : null;

  const sortedByDate = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentIndex = sortedByDate.findIndex((p) => p.id === post.id);
  const newerPost = currentIndex > 0 ? sortedByDate[currentIndex - 1] : null;
  const olderPost = currentIndex < sortedByDate.length - 1 ? sortedByDate[currentIndex + 1] : null;

  return (
    <article className="pt-16 pb-28">
      <ReadingProgress />
      <div className="max-w-2xl mx-auto px-6 sm:px-8">
        <button
          onClick={() => goBack("blog")}
          className="no-print inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back
        </button>

        {isPlanPost && (
          <div className="no-print flex items-center justify-between gap-3 mb-8 bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm px-4 py-3">
            <span className="text-[13px] font-medium text-[#8A6D3F] dark:text-[#D9B77C]">
              Day {planIndex + 1} of {READING_PLAN_POST_IDS.length} · 4-Day Reading Plan
            </span>
            <button onClick={openReadingPlan} className="text-[13px] font-medium text-[#B08D57] hover:underline whitespace-nowrap shrink-0">
              View Plan
            </button>
          </div>
        )}

        {seriesId && seriesIndex !== -1 && (
          <div className="no-print flex items-center justify-between gap-3 mb-6 bg-[#9A5B45]/8 dark:bg-[#D08A70]/10 border border-[#9A5B45]/25 dark:border-[#D08A70]/30 rounded-sm px-4 py-3">
            <span className="text-[13px] font-medium text-[#7C4636] dark:text-[#E3A98F]">
              {SERIES[seriesId].name} · No. {seriesIndex + 1} of {seriesPosts.length}
            </span>
            <button onClick={() => openSeries(seriesId)} className="text-[13px] font-medium text-[#9A5B45] dark:text-[#E3A98F] hover:underline whitespace-nowrap shrink-0">
              View series
            </button>
          </div>
        )}

        <CategoryTag category={post.category} />
        <p className="post-byline text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mt-3">
          {post.author && AUTHORS[post.author] ? (
            <button
              onClick={() => openCollection(post.author)}
              className="hover:text-[#4A5D4E] hover:underline underline-offset-2 transition-colors duration-200"
            >
              By {post.author}
            </button>
          ) : post.author ? (
            `By ${post.author}`
          ) : null}
          {post.author ? " · " : ""}
          {post.date} · {estimateReadTime(post)}
        </p>
        <h1
          className="text-[#1C1F26] dark:text-[#F2F1EC] text-3xl sm:text-[2.75rem] leading-[1.15] mt-4 mb-5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {post.title}
        </h1>

        <div className="no-print flex flex-wrap gap-3 mb-10">
          <ListenButton status={listenStatus} onToggle={toggleListen} onRestart={restartListen} supported={listenSupported} />
          <button
            onClick={handleToggleSave}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
          >
            <Bookmark size={14} strokeWidth={2} className={saved ? "text-[#B08D57]" : ""} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save for Later"}
          </button>
          <button
            onClick={handleToggleLike}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#C1584A]/50 hover:text-[#C1584A] transition-colors duration-200"
          >
            <Heart size={14} strokeWidth={2} className={liked ? "text-[#C1584A]" : ""} fill={liked ? "currentColor" : "none"} />
            {liked ? "Liked" : "Like"}
          </button>
        </div>

        <PostBody
          blocks={post.blocks}
          post={post}
          openScriptureIndex={openScriptureIndex}
          journalEntries={journalEntries}
          onSaveAnswer={onSaveAnswer}
          signedIn={signedIn}
          openJournal={openJournal}
        />

        <div className="no-print flex flex-wrap gap-3 mb-6">
          <ListenButton status={listenStatus} onToggle={toggleListen} onRestart={restartListen} supported={listenSupported} />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
          >
            <Printer size={14} strokeWidth={2} />
            Print / Save as PDF
          </button>
        </div>

        <ShareBar post={post} />

        {seriesId && seriesIndex !== -1 && (
          <div className="no-print border border-[#9A5B45]/30 dark:border-[#D08A70]/35 bg-[#9A5B45]/[0.05] dark:bg-[#D08A70]/[0.07] rounded-sm px-6 py-6 mt-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#9A5B45] dark:text-[#E3A98F] font-semibold mb-2">{SERIES[seriesId].name}</p>
            {nextInSeries ? (
              <>
                <p className="text-[#2E323B] dark:text-[#D9D9D9] text-[15px] mb-4">Next in the series, No. {seriesIndex + 2} of {seriesPosts.length}:</p>
                <button
                  onClick={() => openPost(nextInSeries)}
                  className="inline-flex items-center gap-2 bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] px-5 py-2.5 text-sm font-medium rounded-full hover:bg-[#4A5D4E] dark:hover:bg-white transition-colors duration-200 text-left"
                >
                  {nextInSeries.title}
                  <ArrowRight size={14} strokeWidth={2} className="shrink-0" />
                </button>
              </>
            ) : (
              <>
                <p className="text-[#2E323B] dark:text-[#D9D9D9] text-[15px] mb-4">That's the latest in the series so far. More are on the way.</p>
                <button
                  onClick={() => openSeries(seriesId)}
                  className="inline-flex items-center gap-2 border border-[#1C1F26]/20 dark:border-[#F2F1EC]/25 text-[#1C1F26] dark:text-[#F2F1EC] px-5 py-2.5 text-sm font-medium rounded-full hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-200"
                >
                  See the whole series
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        )}

        {isPlanPost && (
          <div className="no-print bg-[#1C1F26] dark:bg-[#14161B] border border-[#F2F1EC]/10 rounded-sm px-6 py-6 mt-8">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#B08D57] font-semibold mb-2">4-Day Reading Plan</p>
            {nextPlanPost ? (
              <>
                <p className="text-[#F2F1EC] text-[15px] mb-4">
                  Take a few minutes to think about what you just read. Ready for Day {planIndex + 2}?
                </p>
                <button
                  onClick={() => openPlanPost(nextPlanPost)}
                  className="inline-flex items-center gap-2 bg-[#F2F1EC] text-[#1C1F26] px-5 py-2.5 text-sm font-medium rounded-full hover:bg-white transition-colors duration-200"
                >
                  Continue to Day {planIndex + 2}: {nextPlanPost.title}
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                <p className="text-[#F2F1EC] text-[15px] mb-4">
                  That's all 4 days — you've read the whole plan. Take a moment to sit with what you've read before you go.
                </p>
                <button
                  onClick={openReadingPlan}
                  className="inline-flex items-center gap-2 bg-[#F2F1EC] text-[#1C1F26] px-5 py-2.5 text-sm font-medium rounded-full hover:bg-white transition-colors duration-200"
                >
                  Review the Plan
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        )}

        {(olderPost || newerPost) && (
          <div className="no-print grid grid-cols-2 gap-4 mt-8">
            {olderPost ? (
              <button
                onClick={() => openPost(olderPost)}
                className="text-left border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-4 py-3 hover:border-[#4A5D4E]/50 transition-colors duration-200"
              >
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mb-1">
                  <ArrowLeft size={11} strokeWidth={2} /> Older
                </span>
                <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{olderPost.title}</span>
              </button>
            ) : <div />}
            {newerPost ? (
              <button
                onClick={() => openPost(newerPost)}
                className="text-right border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-4 py-3 hover:border-[#4A5D4E]/50 transition-colors duration-200"
              >
                <span className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] mb-1">
                  Newer <ArrowRight size={11} strokeWidth={2} />
                </span>
                <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{newerPost.title}</span>
              </button>
            ) : <div />}
          </div>
        )}

        <div className="no-print mt-8">
          <button
            onClick={() => goBack("blog")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] hover:text-[#4A5D4E] transition-colors duration-300"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="no-print max-w-5xl mx-auto px-6 sm:px-8 mt-20 pt-14 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
          <Eyebrow>Keep Reading</Eyebrow>
          <h3 className="text-2xl text-[#1C1F26] dark:text-[#F2F1EC] mb-8" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            More Posts Like This
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {related.map((p) => (
              <PostCard key={p.id} post={p} onOpen={openPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="no-print fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full bg-[#1C1F26] text-[#F8F7F3] flex items-center justify-center shadow-lg hover:bg-[#4A5D4E] transition-colors duration-300"
    >
      <ArrowRight size={16} strokeWidth={2.5} style={{ transform: "rotate(-90deg)" }} />
    </button>
  );
}
