import { useMemo, useState } from "react";
import { getReadHistory, isPostLiked, isPostSaved, toggleLikedPost, toggleSavedPost } from "../lib/storage";
import { BLOG_CAT_DOT, blogMatchWhere, getBlogMeta } from "../lib/blog";
import {
  Bookmark,
  Check,
  Heart,
} from "lucide-react";

// The one post card used on Saved, Liked, Topic, author and 404 pages. It is
// the same card the Blogs page uses (BlogCard, below), so a post looks the
// same everywhere: category dot, real read time, Read / New marks, a footer
// with its topic and date, and the author's name on a contributor's posts.
// Heart and bookmark state is read from localStorage on mount, as before;
// onToggleSave / onToggleLike let Saved and Liked drop a card on the spot.
// The old card is saved in backup/cards-classic.jsx (see "Cards restore").
export function PostCard({ post, onOpen, hideByline = false, onToggleSave, onToggleLike }) {
  const [saved, setSaved] = useState(() => isPostSaved(post.id));
  const [liked, setLiked] = useState(() => isPostLiked(post.id));
  const meta = getBlogMeta().get(post.id);
  const isRead = useMemo(() => getReadHistory().some((e) => e.id === post.id), [post.id]);
  const isNew = Date.now() - meta.time <= 7 * 864e5 && Date.now() >= meta.time;

  return (
    <BlogCard
      post={post}
      meta={meta}
      terms={[]}
      isRead={isRead}
      isNew={isNew}
      liked={liked}
      saved={saved}
      hideByline={hideByline}
      onOpen={onOpen}
      onToggleLike={() => {
        const now = toggleLikedPost(post.id);
        setLiked(now);
        onToggleLike?.(post.id, now);
      }}
      onToggleSave={() => {
        const now = toggleSavedPost(post.id);
        setSaved(now);
        onToggleSave?.(post.id, now);
      }}
    />
  );
}
function BlogHighlight({ text, terms }) {
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-[#B08D57]/30 text-inherit rounded-[2px] px-px">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
export function BlogChip({ label, count, active, onClick, dotClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium rounded-full border px-3.5 py-1.5 transition-colors duration-200 ${
        active
          ? "bg-[#4A5D4E] border-[#4A5D4E] text-white dark:bg-[#6E9077] dark:border-[#6E9077] dark:text-[#14161B]"
          : "bg-[#F8F7F3] dark:bg-[#14161B] border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 text-[#5B5F6B] dark:text-[#A9ADB6] hover:border-[#4A5D4E] hover:text-[#4A5D4E] dark:hover:border-[#6E9077] dark:hover:text-[#8FAE95]"
      }`}
    >
      {dotClass && <span className={`w-2 h-2 rounded-full ${dotClass}`} />}
      {label}
      {count != null && (
        <span className={`text-[12px] tabular-nums ${active ? "opacity-75" : "text-[#6E717A] dark:text-[#848892]"}`}>{count}</span>
      )}
    </button>
  );
}
function BlogPostActions({ liked, saved, onToggleLike, onToggleSave, className = "" }) {
  const base = "w-8 h-8 flex items-center justify-center rounded-full text-[#6E717A] dark:text-[#848892] hover:bg-[#4A5D4E]/10 transition-colors duration-200";
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={onToggleLike}
        aria-label={liked ? "Remove from Liked Posts" : "Like this post"}
        title={liked ? "Remove from Liked Posts" : "Like this post"}
        className={`${base} hover:text-[#C1584A]`}
      >
        <Heart size={15} strokeWidth={2} className={liked ? "text-[#C1584A]" : ""} fill={liked ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        onClick={onToggleSave}
        aria-label={saved ? "Remove from Saved Posts" : "Save for later"}
        title={saved ? "Remove from Saved Posts" : "Save for later"}
        className={`${base} hover:text-[#B08D57]`}
      >
        <Bookmark size={15} strokeWidth={2} className={saved ? "text-[#B08D57]" : ""} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
export function BlogStatePill({ isRead, isNew }) {
  if (isRead) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold tracking-[0.08em] uppercase rounded-full px-2 py-0.5 bg-[#4A5D4E]/10 text-[#4A5D4E] dark:text-[#8FAE95]">
        <Check size={10} strokeWidth={3.2} />
        Read
      </span>
    );
  }
  if (isNew) {
    return <span className="text-[12px] font-semibold tracking-[0.08em] uppercase rounded-full px-2 py-0.5 bg-[#B08D57] text-[#1C1F26]">New</span>;
  }
  return null;
}
export function BlogCard({ post, meta, terms, isRead, isNew, liked, saved, hideByline = false, onOpen, onToggleLike, onToggleSave }) {
  const why = blogMatchWhere(post, meta, terms);
  return (
    <article
      className={`group relative flex flex-col min-w-0 rounded-sm border border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 hover:border-[#B08D57]/50 transition-all duration-200 hover:-translate-y-[3px] motion-reduce:hover:translate-y-0 hover:shadow-[0_12px_30px_-16px_rgba(28,31,38,0.3)] px-[22px] pt-[22px] pb-[18px] ${
        isRead ? "bg-transparent" : "bg-white dark:bg-[#1E2128]"
      }`}
    >
      <button type="button" onClick={() => onOpen(post)} aria-label={`Read ${post.title}`} className="absolute inset-0 z-0 rounded-sm" />
      <BlogPostActions liked={liked} saved={saved} onToggleLike={onToggleLike} onToggleSave={onToggleSave} className="absolute top-3 right-3 z-10" />
      <div className="pointer-events-none flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pr-[72px] mb-3 text-[12px] uppercase tracking-[0.1em] text-[#6E717A] dark:text-[#848892]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#5B5F6B] dark:text-[#A9ADB6]">
            <span className={`w-2 h-2 rounded-full ${BLOG_CAT_DOT[post.category] || "bg-[#6E717A]"}`} />
            {post.category}
          </span>
          <span>{meta.minutes} min</span>
          <BlogStatePill isRead={isRead} isNew={isNew} />
        </div>
        <h3 className="text-[#1C1F26] dark:text-[#F2F1EC] text-xl leading-[1.28] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          <BlogHighlight text={post.title} terms={terms} />
        </h3>
        {why && <div className="text-xs text-[#7F6637] dark:text-[#D9B77C] mb-2.5">{why}</div>}
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[14.5px] leading-relaxed line-clamp-3 mb-4">
          <BlogHighlight text={post.excerpt} terms={terms} />
        </p>
        {post.author && !hideByline && <div className="text-xs text-[#6E717A] dark:text-[#848892] -mt-1 mb-3">By {post.author}</div>}
        <div className="mt-auto flex items-center justify-between gap-2.5 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 pt-3 text-[12.5px] text-[#6E717A] dark:text-[#848892]">
          <span className="truncate min-w-0 font-medium text-[#4A5D4E] dark:text-[#8FAE95]">{meta.tags[0] || ""}</span>
          <span className="whitespace-nowrap">{post.date}</span>
        </div>
      </div>
    </article>
  );
}
export function BlogRow({ post, meta, terms, isRead, isNew, liked, saved, hideByline = false, onOpen, onToggleLike, onToggleSave }) {
  const why = blogMatchWhere(post, meta, terms);
  const d = new Date(post.date);
  return (
    <article
      className={`group relative grid grid-cols-[1fr_auto] sm:grid-cols-[92px_1fr_auto] items-center gap-x-4 sm:gap-x-[18px] px-1 py-4 border-b border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 hover:bg-[#4A5D4E]/8 transition-colors duration-200 ${
        isRead ? "opacity-80" : ""
      }`}
    >
      <button type="button" onClick={() => onOpen(post)} aria-label={`Read ${post.title}`} className="absolute inset-0 z-0" />
      <div className="hidden sm:block pointer-events-none text-[12.5px] leading-snug text-[#6E717A] dark:text-[#848892]">
        {d.toLocaleString("en-US", { month: "short", day: "numeric" })}
        <br />
        {d.getFullYear()}
      </div>
      <div className="pointer-events-none min-w-0">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#1C1F26] dark:text-[#F2F1EC] text-[18.5px] leading-snug mb-0.5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          <span>
            <BlogHighlight text={post.title} terms={terms} />
          </span>
          <BlogStatePill isRead={isRead} isNew={isNew} />
        </h3>
        <p className="text-[14px] text-[#5B5F6B] dark:text-[#A9ADB6] line-clamp-2 sm:line-clamp-1">
          <BlogHighlight text={post.excerpt} terms={terms} />
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-[#6E717A] dark:text-[#848892]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5B5F6B] dark:text-[#A9ADB6]">
            <span className={`w-2 h-2 rounded-full ${BLOG_CAT_DOT[post.category] || "bg-[#6E717A]"}`} />
            {post.category}
          </span>
          <span>{meta.minutes} min</span>
          {meta.tags[0] && <span>{meta.tags[0]}</span>}
          {post.author && !hideByline && <span>By {post.author}</span>}
          {why && <span className="text-[#7F6637] dark:text-[#D9B77C]">{why}</span>}
        </div>
      </div>
      <BlogPostActions liked={liked} saved={saved} onToggleLike={onToggleLike} onToggleSave={onToggleSave} className="relative z-10" />
    </article>
  );
}
