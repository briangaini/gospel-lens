// Reads the posts in src/content/posts/*.json and prepares them for the site.
// Shared by everything that needs post data: the Vite plugin that feeds the app
// (vite-plugins/gospel-content.js) and the build scripts (prerender.js,
// notify-buttondown.js, build-share-cards.js). Plain Node, no React, so all of
// them can import it directly. Imports only the two pure helper files that have
// no imports of their own.
//
// A post is one file: `NNN-title-slug.json`, where NNN is the post's id. The
// file holds the post's details (id, title, author, date, category, series,
// readTime, excerpt) and its `blocks` (see src/content/README.md).

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { estimateReadTime, countPostWords, stripInline } from "../../src/lib/postText.js";
import { slugify } from "../../src/lib/slug.js";

export const ROOT = path.resolve(import.meta.dirname, "..", "..");
export const POSTS_DIR = path.join(ROOT, "src", "content", "posts");

const BLOCK_FIELDS = {
  p: ["text"],
  heading: ["text"],
  quote: ["text"],
  heart: ["text"],
  encourage: ["text"],
  prayer: ["text"],
  closing: ["text"],
  list: ["items"],
  reflection: ["items"],
  share: ["items"],
  scripture: ["reference", "verses"],
};

// Newest first. Two posts on the same day: the higher id counts as newer, unless
// a post carries an optional "order" number, which is used in place of its id for
// this tie-break only (a few older same-day pairs use it to keep their order).
export function comparePosts(a, b) {
  return new Date(b.date) - new Date(a.date) || (b.order ?? b.id) - (a.order ?? a.id);
}

function fail(file, message) {
  throw new Error(`${path.relative(ROOT, file)}: ${message}`);
}

// Every post, validated for shape (the things that would otherwise crash the
// site at runtime), newest first.
export function readPosts() {
  const names = readdirSync(POSTS_DIR).filter((n) => n.endsWith(".json")).sort();
  const seenIds = new Map();
  const posts = names.map((name) => {
    const file = path.join(POSTS_DIR, name);
    let post;
    try {
      post = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      fail(file, `not valid JSON (${err.message})`);
    }
    const idFromName = Number(name.match(/^(\d+)-/)?.[1]);
    if (!Number.isInteger(idFromName)) fail(file, 'file name must start with the post id, like "077-the-title.json"');
    if (post.id !== idFromName) fail(file, `"id" is ${post.id} but the file name says ${idFromName}`);
    if (seenIds.has(post.id)) fail(file, `id ${post.id} is also used by ${seenIds.get(post.id)}`);
    seenIds.set(post.id, name);
    for (const key of ["title", "date", "category", "excerpt"]) {
      if (typeof post[key] !== "string" || !post[key].trim()) fail(file, `"${key}" is missing or empty`);
    }
    if (post.order !== undefined && !Number.isInteger(post.order)) fail(file, '"order" must be a whole number');
    if (Number.isNaN(new Date(post.date).getTime())) fail(file, `"date" (${post.date}) is not a date the site can read`);
    if (!Array.isArray(post.blocks) || post.blocks.length === 0) fail(file, '"blocks" must be a non-empty list');
    post.blocks.forEach((block, i) => {
      const fields = BLOCK_FIELDS[block?.type];
      if (!fields) fail(file, `block ${i + 1} has an unknown type "${block?.type}"`);
      for (const f of fields) {
        const v = block[f];
        const ok = f === "text" || f === "reference" ? typeof v === "string" : Array.isArray(v) && v.every((x) => typeof x === "string");
        if (!ok) fail(file, `block ${i + 1} (${block.type}) needs "${f}"`);
      }
    });
    return post;
  });
  return posts.sort(comparePosts);
}

export function postSlug(post) {
  return slugify(post.title);
}

// The small per-post record the site keeps in memory at all times (everything
// except the body). Cheap numbers are worked out here, once, so the browser
// never has to read a post's text just to show a card.
export function buildIndex(posts) {
  return posts.map((post) => {
    const { blocks, order, ...meta } = post;
    return {
      ...meta,
      minutes: parseInt(estimateReadTime(post), 10) || 1,
      words: countPostWords(post),
      refs: blocks.filter((b) => b.type === "scripture" && b.reference).map((b) => b.reference),
    };
  });
}

// Lower-cased body text for the Blogs search (loaded only when someone searches).
export function buildSearchText(posts) {
  const out = {};
  for (const post of posts) {
    out[post.id] = post.blocks
      .map((block) => {
        if (block.text) return stripInline(block.text);
        if (block.verses) return block.verses.join(" ");
        if (block.items) return block.items.map(stripInline).join(" ");
        return "";
      })
      .join(" ")
      .toLowerCase();
  }
  return out;
}

// Every Scripture Focus box with its first verse (loaded only by the Scripture Index).
export function buildScriptureEntries(posts) {
  const out = [];
  // In id order, so two boxes citing the same verse list in a steady order.
  for (const post of [...posts].sort((a, b) => a.id - b.id)) {
    for (const block of post.blocks) {
      if (block.type !== "scripture" || !block.verses || !block.verses.length) continue;
      out.push({ id: post.id, reference: block.reference, verse: block.verses[0] });
    }
  }
  return out;
}

// The reflection questions per post (loaded only by the Reflection Journal).
export function buildReflections(posts) {
  const out = {};
  for (const post of posts) {
    const block = post.blocks.find((b) => b.type === "reflection");
    if (block) out[post.id] = block.items;
  }
  return out;
}

// The site's small data files (authors, topics, series, homepage chooser) in the
// shapes the build scripts want. These files are plain data with no imports, so
// Node can load them directly.
export async function loadSiteData() {
  const [{ AUTHORS }, { POST_TAGS, TOPIC_DESCRIPTIONS }, { SERIES }, { MOMENTS }] = await Promise.all([
    import("../../src/content/authors.js"),
    import("../../src/content/topics.js"),
    import("../../src/content/series.js"),
    import("../../src/content/moments.js"),
  ]);
  return {
    authors: Object.entries(AUTHORS).map(([name, a]) => ({ name, role: a.role || "", description: a.bio?.[0] || a.role || "", slug: slugify(name) })),
    topics: Object.entries(POST_TAGS).map(([name, ids]) => ({ name, ids, slug: slugify(name), description: TOPIC_DESCRIPTIONS[name] || null })),
    series: Object.entries(SERIES).map(([id, s]) => ({ id, slug: s.slug, name: s.name, tag: s.tag, description: s.description })),
    moments: MOMENTS,
  };
}
