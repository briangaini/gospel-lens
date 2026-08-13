// Runs in CI (see .github/workflows/newsletter-draft.yml) after every build,
// on every push to main. Compares the full post list (loaded via
// load-posts-data.js) against .buttondown-notified.json — a small list of
// post URLs already drafted — and creates a DRAFT email in Buttondown for
// anything new, with the full post rendered as styled HTML (see
// post-to-email-html.js) rather than just a title+excerpt+link. Never
// sends: creating an email via Buttondown's API always lands as a draft
// first (confirmed in their docs), sending is a separate, deliberate step
// Brian takes himself. That's deliberate — a safety net, not a limitation.
//
// Silently does nothing (exit 0) if BUTTONDOWN_API_KEY isn't set yet, so the
// workflow shows green instead of failing before Brian's added the secret.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { loadPostsData } from "./load-posts-data.js";
import { postToEmailHtml } from "./post-to-email-html.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE_FILE = path.join(ROOT, ".buttondown-notified.json");
const SITE_URL = "https://the-gospel-lens.vercel.app";
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const API_KEY = process.env.BUTTONDOWN_API_KEY;

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { notified: [] };
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

function saveState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function createDraft(post, url) {
  const body = postToEmailHtml(post, { url, ogImageUrl: OG_IMAGE_URL, siteUrl: `${SITE_URL}/` });
  const res = await fetch("https://api.buttondown.com/v1/emails", {
    method: "POST",
    headers: {
      Authorization: `Token ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subject: post.title, body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Buttondown API error for "${post.title}": ${res.status} ${text}`);
  }
}

async function main() {
  if (!API_KEY) {
    console.log("BUTTONDOWN_API_KEY is not set — skipping. This is expected until the secret is added in GitHub repo settings.");
    return;
  }

  const { POSTS } = await loadPostsData();
  const state = loadState();
  const notified = new Set(state.notified);

  const withUrls = POSTS.map((post) => ({ post, url: `${SITE_URL}/${slugify(post.title)}` }));
  const newItems = withUrls.filter(({ url }) => !notified.has(url));

  if (newItems.length === 0) {
    console.log("No new posts since the last check — nothing to draft.");
    return;
  }

  let created = 0;
  let hadErrors = false;
  for (const { post, url } of newItems) {
    console.log(`Creating Buttondown draft for: ${post.title}`);
    try {
      await createDraft(post, url);
      notified.add(url);
      created++;
    } catch (err) {
      // Don't let one bad post block the rest, and don't mark it notified
      // if it failed — it'll be retried on the next push. But do surface
      // the failure (see bottom of main) rather than swallowing it, so a
      // genuinely broken/expired key doesn't fail silently forever.
      console.error(err.message);
      hadErrors = true;
    }
  }

  if (created > 0) {
    saveState({ notified: [...notified] });
    console.log(`Created ${created} draft(s). State file updated — go review them in Buttondown before sending.`);
  }

  if (hadErrors) {
    // Fail the workflow run so a genuinely broken/expired key shows up as a
    // red check instead of silently doing nothing — the un-notified post(s)
    // will still retry automatically on the next push either way.
    throw new Error("One or more posts failed to draft — see errors above.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
