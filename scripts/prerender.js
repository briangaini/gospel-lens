// Runs after `vite build`. Generates a real static index.html per post (and
// per author collection page) inside dist/, each with correct <title> and
// meta/OG/Twitter tags baked in — so link-preview bots (which don't run our
// JS) see that specific post's title/excerpt instead of the generic
// site-wide description. Also regenerates sitemap.xml with real URLs now
// that real per-post paths exist.
//
// Reads post/author data straight out of src/App.jsx via targeted regexes
// (not by importing/executing the module) to avoid pulling React/JSX
// evaluation into a plain Node build script.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE_URL = "https://the-gospel-lens.vercel.app";

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractField(field, chunk) {
  let m = chunk.match(new RegExp(`${field}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (m) return m[1].replace(/\\(.)/g, "$1");
  m = chunk.match(new RegExp(`${field}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (m) return m[1].replace(/\\(.)/g, "$1");
  return null;
}

function loadPosts(src) {
  const start = src.indexOf("const POSTS = [");
  const end = src.indexOf("\n];", start);
  if (start === -1 || end === -1) throw new Error("Could not locate POSTS array in src/App.jsx");
  const block = src.slice(start, end);
  const chunks = block
    .split(/\n(?=\s*\{\s*\n\s*id:\s*\d+,)/)
    .filter((c) => /id:\s*\d+,/.test(c));

  return chunks.map((chunk) => {
    const idMatch = chunk.match(/id:\s*(\d+),/);
    const title = extractField("title", chunk);
    const excerpt = extractField("excerpt", chunk);
    if (!idMatch || !title || !excerpt) {
      throw new Error(`Failed to extract post fields near: ${chunk.slice(0, 60)}...`);
    }
    return { id: Number(idMatch[1]), title, excerpt, slug: slugify(title) };
  });
}

function loadAuthors(src) {
  const start = src.indexOf("const AUTHORS = {");
  if (start === -1) return [];
  const end = src.indexOf("\n};", start);
  const block = src.slice(start, end);
  const chunks = block
    .split(/\n(?=\s*"[^"]+":\s*\{)/)
    .filter((c) => /^\s*"[^"]+":\s*\{/.test(c));

  return chunks.map((chunk) => {
    const nameMatch = chunk.match(/"([^"]+)":\s*\{/);
    const roleMatch = chunk.match(/role:\s*"((?:[^"\\]|\\.)*)"/);
    const bioMatch = chunk.match(/bio:\s*\[\s*\n?\s*"((?:[^"\\]|\\.)*)"/);
    if (!nameMatch) throw new Error(`Failed to extract author name near: ${chunk.slice(0, 60)}...`);
    const name = nameMatch[1];
    const role = roleMatch ? roleMatch[1].replace(/\\(.)/g, "$1") : "";
    const description = bioMatch ? bioMatch[1].replace(/\\(.)/g, "$1") : role;
    return { name, role, description, slug: slugify(name) };
  });
}

function truncateAtWord(str, max) {
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

function withMeta(template, { title, description, url }) {
  const fullTitle = `${title} — The Gospel Lens`;
  const safeTitle = escapeHtml(fullTitle);
  const safeDescription = escapeHtml(description);
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${safeDescription}" />`
    )
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${safeDescription}" />`
    )
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${safeDescription}" />`
    );
}

// Written as flat <slug>.html files (not <slug>/index.html) to pair with
// vercel.json's "cleanUrls": true — Vercel serves <path>.html for a request
// to /<path> with no extension. This avoids relying on trailing-slash
// directory-index resolution, which isn't consistent across static hosts
// (verified locally: vite preview only resolves the directory-index form
// with a trailing slash, but the app generates clean URLs with none).
function writeHtml(relativeSlug, html) {
  const filePath = path.join(ROOT, "dist", `${relativeSlug}.html`);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

function buildSitemap(posts, authors) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/blog`, priority: "0.8" },
    { loc: `${SITE_URL}/about`, priority: "0.5" },
    ...authors.map((a) => ({ loc: `${SITE_URL}/collection/${a.slug}`, priority: "0.5" })),
    ...posts.map((p) => ({ loc: `${SITE_URL}/${p.slug}`, priority: "0.6" })),
  ];
  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function main() {
  const distDir = path.join(ROOT, "dist");
  if (!existsSync(distDir)) throw new Error("dist/ not found — run `vite build` before this script.");

  const src = readFileSync(path.join(ROOT, "src", "App.jsx"), "utf8");
  const template = readFileSync(path.join(distDir, "index.html"), "utf8");

  const posts = loadPosts(src);
  const authors = loadAuthors(src);

  const RESERVED_SLUGS = new Set(["blog", "about", "collection"]);
  const seenSlugs = new Set();
  for (const p of posts) {
    if (seenSlugs.has(p.slug)) throw new Error(`Duplicate post slug detected: "${p.slug}" (id ${p.id}) — two titles slugify to the same URL.`);
    if (RESERVED_SLUGS.has(p.slug)) throw new Error(`Post "${p.title}" (id ${p.id}) slugifies to "${p.slug}", which collides with a reserved route. Rename the post or change its title slightly.`);
    seenSlugs.add(p.slug);
  }

  for (const post of posts) {
    const html = withMeta(template, {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/${post.slug}`,
    });
    writeHtml(post.slug, html);
  }

  for (const author of authors) {
    const html = withMeta(template, {
      title: author.name,
      description: truncateAtWord(`${author.role} — ${author.description}`, 300),
      url: `${SITE_URL}/collection/${author.slug}`,
    });
    writeHtml(path.join("collection", author.slug), html);
  }

  writeFileSync(path.join(distDir, "sitemap.xml"), buildSitemap(posts, authors));

  console.log(`Prerendered ${posts.length} post pages and ${authors.length} collection page(s). Sitemap regenerated with real URLs.`);
}

main();
