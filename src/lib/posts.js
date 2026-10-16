import POSTS_INDEX from "virtual:gospel-content-index";
import { SERIES } from "../content/series";
import { POST_TAGS } from "../content/topics";
import { slugify } from "./slug";

// ---------------------------------------------------------------------------
// THE POSTS. Each post is one file in src/content/posts/ (see
// src/content/README.md). Two halves, loaded differently so a visitor only
// downloads what the page they're on needs:
//   - POSTS: every post's details (title, date, category, excerpt, read time,
//     ...) with NO body. Small, and always loaded, because lists and cards on
//     almost every page need it. Newest first; on the same day the higher id
//     counts as newer.
//   - loadPostBody(id): a post's body (its blocks), fetched on demand the first
//     time that post is opened, then remembered.
// ---------------------------------------------------------------------------
export const POSTS = POSTS_INDEX;

const bodyLoaders = import.meta.glob("/src/content/posts/*.json");
const bodyLoaderById = {};
for (const [file, load] of Object.entries(bodyLoaders)) {
  const id = Number(file.match(/\/(\d+)-[^/]*\.json$/)?.[1]);
  if (Number.isInteger(id)) bodyLoaderById[id] = load;
}
const bodyCache = new Map();
const loadedBodies = new Map();

// Resolves to the post's blocks. Rejects if the file can't be fetched (for
// example a tab left open across a deploy); the caller decides what to do.
export function loadPostBody(id) {
  if (!bodyCache.has(id)) {
    const load = bodyLoaderById[id];
    if (!load) return Promise.reject(new Error(`No post file for id ${id}`));
    bodyCache.set(
      id,
      load().then(
        (mod) => {
          loadedBodies.set(id, mod.default.blocks);
          return mod.default.blocks;
        },
        (err) => {
          bodyCache.delete(id);
          throw err;
        }
      )
    );
  }
  return bodyCache.get(id);
}

// Already-loaded body, or undefined (lets a view render at once when it can).
export function getLoadedPostBody(id) {
  return loadedBodies.get(id);
}

function isInSeries(post, seriesId) {
  return post.series === seriesId || (seriesId === "proverbs" && post.category === "Wisdom from Proverbs");
}
// A series reads in the order it was published (oldest first), unlike the
// rest of the site, which is newest first.
export function postsInSeries(seriesId) {
  return POSTS.filter((p) => isInSeries(p, seriesId)).sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id);
}
export function seriesIdForPost(post) {
  return Object.keys(SERIES).find((id) => isInSeries(post, id)) || null;
}
export function postsByAuthor(authorName) {
  return [...POSTS].filter((p) => p.author === authorName).sort((a, b) => new Date(b.date) - new Date(a.date));
}
export function tagsForPost(postId) {
  return Object.keys(POST_TAGS).filter((tag) => POST_TAGS[tag].includes(postId));
}
// "Keep Reading" picks — a shared topic tag (Grace & Assurance, Grief &
// Comfort, etc.) is a much stronger signal of genuine relevance than just
// sharing a category (Teaching/Devotional/Foundations is a pretty coarse
// bucket), so posts sharing a tag are ranked first, tied by how many tags
// they share; same-category posts fill in after that; newest breaks ties.
// A post with no tag or category overlap at all is left out rather than
// forced in just to hit the count.
export function getRelatedPosts(post, max = 2) {
  const myTags = new Set(tagsForPost(post.id));
  return POSTS.filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      sharedTags: tagsForPost(p.id).filter((t) => myTags.has(t)).length,
      sameCategory: p.category === post.category,
    }))
    .filter((s) => s.sharedTags > 0 || s.sameCategory)
    .sort((a, b) => {
      if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
      if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
      return new Date(b.post.date) - new Date(a.post.date);
    })
    .slice(0, max)
    .map((s) => s.post);
}
export function getPostBySlug(slug) {
  return POSTS.find((post) => slugify(post.title) === slug) || null;
}
// "From the Archive" — resurfaces an older post on the homepage, one per
// calendar week. Originally proposed as a date-anniversary ("one year ago
// today") widget, but every post on the site so far is from the same
// year, so that version would have shown nothing until 2027 — this
// version works immediately instead, and everyone sees the same pick
// during the same week (not a different one per page load) so it reads as
// a deliberate choice rather than a random shuffle.
//
// `excludeIds` (added with the 2026-10-06 homepage makeover): ids of posts
// already shown elsewhere on the homepage, so this pick can never repeat
// one of them (it used to be able to duplicate a Start Here post). Still
// deterministic for a given week and a given set of excluded ids.
export function getFromArchivePost(excludeIds = []) {
  const recentIds = new Set(
    [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map((p) => p.id)
  );
  for (const id of excludeIds) recentIds.add(id);
  // Sorted by id (not array position) so the cycling order stays stable
  // even if posts are edited or reordered in the array later.
  const eligible = [...POSTS].filter((p) => !recentIds.has(p.id)).sort((a, b) => a.id - b.id);
  if (eligible.length === 0) return null;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor(Date.now() / msPerWeek);
  return eligible[weekNumber % eligible.length];
}
export function postsByTag(tagName) {
  const ids = POST_TAGS[tagName] || [];
  return [...POSTS].filter((p) => ids.includes(p.id)).sort((a, b) => new Date(b.date) - new Date(a.date));
}
