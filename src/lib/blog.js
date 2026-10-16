import { POSTS, tagsForPost } from "./posts";

// BLOGS PAGE -- redesigned 2026-10-07. Restorable, see CLAUDE.md "Blogs page
// restore" (backup/blogs-classic.jsx). Everything here is derived from data
// that already exists: POSTS, POST_TAGS, getSearchIndex and
// the visitor's own local read / saved / liked lists.
export const BLOG_PAGE = 12;
export const BLOG_VIEW_KEY = "gospel-lens-blog-view";
export const BLOG_STATES = [["unread", "Unread"], ["read", "Read"], ["saved", "Saved"], ["liked", "Liked"]];
export const BLOG_LENS = [["quick", "2 min or less"], ["mid", "3 min"], ["long", "4 min or more"]];
export const BLOG_SORT_LABELS = { rel: "best match first", new: "newest first", old: "oldest first", short: "shortest first", long: "longest first" };
export const BLOG_CAT_DOT = {
  Devotional: "bg-[#4A5D4E] dark:bg-[#6E9077]",
  Teaching: "bg-[#B08D57] dark:bg-[#C9A56B]",
  Foundations: "bg-[#1C1F26] dark:bg-[#F2F1EC]",
  "Wisdom from Proverbs": "bg-[#9A5B45] dark:bg-[#D08A70]",
};
export const BLOG_LABEL = "text-[12px] font-semibold tracking-[0.14em] uppercase text-[#6E717A] dark:text-[#848892] flex-none";
export const BLOG_SCROLL_ROW =
  "flex flex-nowrap gap-[7px] overflow-x-auto pb-1 -mb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-mask-image:linear-gradient(90deg,#000_92%,transparent)] [mask-image:linear-gradient(90deg,#000_92%,transparent)]";
export function blogLenBucket(minutes) {
  return minutes <= 2 ? "quick" : minutes === 3 ? "mid" : "long";
}
export function blogTerms(q) {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}
// Per-post facts used by the page, computed once (POSTS never changes at runtime).
let blogMetaCache = null;
export function getBlogMeta() {
  if (blogMetaCache) return blogMetaCache;
  blogMetaCache = new Map();
  for (const post of POSTS) {
    const refs = post.refs.join(" ").toLowerCase();
    const minutes = post.minutes;
    blogMetaCache.set(post.id, {
      minutes,
      refs,
      tags: tagsForPost(post.id),
      time: new Date(post.date).getTime(),
    });
  }
  return blogMetaCache;
}
// Which part of a post a search matched, shown under the title.
export function blogMatchWhere(post, meta, terms) {
  if (!terms.length) return "";
  const has = (text) => terms.every((t) => text.toLowerCase().includes(t));
  if (has(post.title)) return "Matched in the title";
  if (meta.refs && has(meta.refs)) return "Matched in a verse";
  if (has(post.excerpt)) return "Matched in the summary";
  if (meta.tags.length && has(meta.tags.join(" "))) return "Matched in the topic";
  return "Matched inside the post";
}
