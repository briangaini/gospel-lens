// Runs in CI (see .github/workflows/newsletter-draft.yml) after every build,
// on every push to main. Compares the current RSS feed (dist/rss.xml) against
// .buttondown-notified.json — a small list of post URLs already drafted —
// and creates a DRAFT email in Buttondown for anything new. Never sends:
// creating an email via Buttondown's API always lands as a draft first
// (confirmed in their docs), sending is a separate, deliberate step Brian
// takes himself. That's deliberate — a safety net, not a limitation.
//
// Silently does nothing (exit 0) if BUTTONDOWN_API_KEY isn't set yet, so the
// workflow shows green instead of failing before Brian's added the secret.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE_FILE = path.join(ROOT, ".buttondown-notified.json");
const RSS_FILE = path.join(ROOT, "dist", "rss.xml");
const API_KEY = process.env.BUTTONDOWN_API_KEY;

function decodeXml(str) {
  return String(str)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml))) {
    const block = m[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1];
    const description = block.match(/<description>([\s\S]*?)<\/description>/)?.[1];
    if (title && link) {
      items.push({ title: decodeXml(title), link: decodeXml(link), description: decodeXml(description || "") });
    }
  }
  return items;
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { notified: [] };
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

function saveState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function createDraft(post) {
  const body = `${post.description}\n\n[Read the full post](${post.link})`;
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
  if (!existsSync(RSS_FILE)) throw new Error("dist/rss.xml not found — run `npm run build` before this script.");

  const items = parseRssItems(readFileSync(RSS_FILE, "utf8"));
  const state = loadState();
  const notified = new Set(state.notified);

  const newItems = items.filter((item) => !notified.has(item.link));
  if (newItems.length === 0) {
    console.log("No new posts since the last check — nothing to draft.");
    return;
  }

  let created = 0;
  let hadErrors = false;
  for (const item of newItems) {
    console.log(`Creating Buttondown draft for: ${item.title}`);
    try {
      await createDraft(item);
      notified.add(item.link);
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
