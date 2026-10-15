// Plain, never-bundled copy of the pre-2026-10-15 PostCard, CategoryTag and TopicView.
// See "Cards restore" in CLAUDE.md. Not imported anywhere.

function CategoryTag({ category }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#4A5D4E] bg-[#4A5D4E]/8 px-2.5 py-1 rounded-full">
      {category}
    </span>
  );
}

// Not a <button> anymore -- an invisible full-cover button handles "open
// the post" (still real keyboard/screen-reader accessible), and the
// bookmark toggle is its own real button layered on top, since a <button>
// can't legally contain another <button>. The visible content in between
// is pointer-events-none so clicks pass through to whichever of the two
// buttons is actually underneath that point.
function PostCard({ post, onOpen, featured = false, onToggleSave, onToggleLike }) {
  const [saved, setSaved] = useState(() => isPostSaved(post.id));
  const [liked, setLiked] = useState(() => isPostLiked(post.id));

  const handleToggleSave = (e) => {
    e.stopPropagation();
    const nowSaved = toggleSavedPost(post.id);
    setSaved(nowSaved);
    onToggleSave?.(post.id, nowSaved);
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    const nowLiked = toggleLikedPost(post.id);
    setLiked(nowLiked);
    onToggleLike?.(post.id, nowLiked);
  };

  return (
    <div
      className={`group relative flex flex-col bg-white dark:bg-[#1E2128] border border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 hover:border-[#B08D57]/40 rounded-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-15px_rgba(28,31,38,0.25)] ${
        featured ? "p-8" : "p-7"
      }`}
    >
      <button onClick={() => onOpen(post)} className="absolute inset-0 z-0 text-left" aria-label={`Read ${post.title}`} />
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleLike}
          aria-label={liked ? "Remove from Liked Posts" : "Like this post"}
          title={liked ? "Remove from Liked Posts" : "Like this post"}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#14161B]/85 text-[#8A8D96] dark:text-[#7C808A] hover:text-[#C1584A] transition-colors duration-200"
        >
          <Heart size={15} strokeWidth={2} className={liked ? "text-[#C1584A]" : ""} fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          onClick={handleToggleSave}
          aria-label={saved ? "Remove from Saved Posts" : "Save for later"}
          title={saved ? "Remove from Saved Posts" : "Save for later"}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#14161B]/85 text-[#8A8D96] dark:text-[#7C808A] hover:text-[#B08D57] transition-colors duration-200"
        >
          <Bookmark size={15} strokeWidth={2} className={saved ? "text-[#B08D57]" : ""} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="pointer-events-none flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4 pr-20">
          <CategoryTag category={post.category} />
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#8A8D96] dark:text-[#7C808A]">{estimateReadTime(post)}</span>
        </div>
        <h3
          className={`text-[#1C1F26] dark:text-[#F2F1EC] mb-2 leading-snug ${featured ? "text-2xl" : "text-xl"}`}
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {post.title}
        </h3>
        <span className="text-[11px] text-[#8A8D96] dark:text-[#7C808A] mb-3">
          {post.author ? `By ${post.author} · ` : ""}
          {post.date}
        </span>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed mb-6 flex-1">{post.excerpt}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4A5D4E] group-hover:gap-2.5 transition-all duration-300">
          Read More
          <ArrowRight size={14} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

function TopicView({ topicName, openPost, setView, openTopic, goBack }) {
  const posts = postsByTag(topicName);
  if (posts.length === 0) return null;

  const otherTopics = Object.keys(POST_TAGS).filter((t) => t !== topicName);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => goBack("blog")}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back
      </button>

      <p className="text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-3">Topic</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-3"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {topicName}
      </h1>
      {TOPIC_DESCRIPTIONS[topicName] && (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[16px] leading-relaxed max-w-xl mb-3">{TOPIC_DESCRIPTIONS[topicName]}</p>
      )}
      <p className="text-[#8A8D96] dark:text-[#7C808A] text-[13px] mb-10">
        {posts.length} {posts.length === 1 ? "post" : "posts"} on The Gospel Lens.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={openPost} />
        ))}
      </div>

      <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold mb-4">Other Topics</p>
      <div className="flex flex-wrap gap-2">
        {otherTopics.map((t) => (
          <button
            key={t}
            onClick={() => openTopic(t)}
            className="text-xs text-[#5B5F6B] dark:text-[#A9ADB6] bg-[#4A5D4E]/6 hover:bg-[#4A5D4E]/12 hover:text-[#4A5D4E] px-3 py-1.5 rounded-full transition-colors duration-200"
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
}
