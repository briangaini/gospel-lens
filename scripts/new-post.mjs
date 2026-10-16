// Creates the file for a new post, ready to fill in:
//
//   npm run new-post -- "The Title" --category Devotional
//   npm run new-post -- "The Title" --category "Wisdom from Proverbs" --series proverbs
//   npm run new-post -- "The Title" --category Teaching --author "Jonny Ardavanis" --date "October 20, 2026"
//
// It picks the next free id, names the file the way the site expects
// (src/content/posts/NNN-the-title.json), fills in today's date unless you give one,
// and leaves a single placeholder paragraph. See src/content/README.md for the rest.

import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { readPosts, POSTS_DIR, ROOT } from "./lib/content.js";
import { slugify } from "../src/lib/slug.js";

const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};

if (!title) {
  console.error('Usage: npm run new-post -- "The Title" --category Devotional [--author "Name"] [--series proverbs] [--date "October 20, 2026"]');
  process.exit(1);
}
const category = flag("category");
const known = ["Foundations", "Teaching", "Devotional", "Wisdom from Proverbs"];
if (!category || !known.includes(category)) {
  console.error(`Pick a category with --category: ${known.join(", ")}`);
  process.exit(1);
}

const posts = readPosts();
const id = Math.max(0, ...posts.map((p) => p.id)) + 1;
const date =
  flag("date") ?? new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const file = path.join(POSTS_DIR, `${String(id).padStart(3, "0")}-${slugify(title)}.json`);
if (existsSync(file)) {
  console.error(`${path.relative(ROOT, file)} already exists.`);
  process.exit(1);
}

const lines = [`  "id": ${id}`, `  "title": ${JSON.stringify(title)}`, `  "author": ${JSON.stringify(flag("author") ?? null)}`, `  "date": ${JSON.stringify(date)}`, `  "category": ${JSON.stringify(category)}`];
if (flag("series")) lines.push(`  "series": ${JSON.stringify(flag("series"))}`);
lines.push(`  "readTime": "3 min read"`, `  "excerpt": "One or two sentences that make someone want to read this."`);
writeFileSync(
  file,
  `{\n${lines.join(",\n")},\n  "blocks": [\n    {"type":"p","text":"Write the first paragraph here."}\n  ]\n}\n`
);
console.log(`Created ${path.relative(ROOT, file)} (id ${id}).`);
console.log("Next: fill in the text, then add the id to a topic in src/content/topics.js.");
