# The Gospel Lens

A gospel-centered Christian blog. Single-page React app — no backend, no CMS. All content and UI logic lives directly in the source.

## Tech stack

- React 18 + Vite 5
- Tailwind CSS 3 (utility classes throughout, plus some inline styles for custom fonts)
- `lucide-react` for icons
- Deployed on Vercel — pushing to `main` on GitHub (`briangaini/gospel-lens`) triggers a live deploy, usually live within ~1 minute
- Live URL: https://the-gospel-lens.vercel.app/ — this is Brian's canonical URL; he checks this directly, not the Vercel dashboard or GitHub

## Running locally

```bash
npm run dev
```

Other scripts: `npm run build` (production build), `npm run preview` (preview the build).

## File structure

```
src/
  App.jsx       — everything: POSTS data, block renderer, all views/components
  main.jsx      — React entry point
  index.css     — Tailwind base + global styles
scripts/
  prerender.js  — runs after `vite build`, see "Routing & per-post URLs" below
index.html
vercel.json     — cleanUrls + SPA rewrite fallback
tailwind.config.js
vite.config.js  — includes vite-plugin-pwa config
```

Almost the entire app is in `src/App.jsx` (~2,300+ lines). There is no CMS — adding a post means editing this file directly. **`npm run build` is `vite build && node scripts/prerender.js` — always use `npm run build`, never call `vite build` directly**, or the per-post static pages and sitemap won't regenerate and will go stale.

## Routing & per-post URLs

Real per-post URLs (`/down-but-not-out`, not `/#down-but-not-out`) as of 2026-08-04. Client-side routing in `GospelLensApp` uses `history.pushState`/`popstate` on `location.pathname`, not hash. Old-style `#slug`, `#post-N`, and `#collection-name` links (from before this existed) are silently upgraded via `history.replaceState` the moment they're loaded — no visible redirect, so anything already shared still works.

`scripts/prerender.js` runs after every `vite build` and:
- Extracts `id`/`title`/`excerpt` for every post and `name`/`role`/`bio` for every `AUTHORS` entry straight out of `src/App.jsx` via regex (deliberately *not* by importing/executing the module — that would drag React/JSX evaluation into a plain Node script for no benefit, since this is just reading plain string literals).
- Writes a real static `dist/<slug>.html` per post and `dist/collection/<author-slug>.html` per author, each with that specific post's `<title>`/description/OG/Twitter meta baked in (properly HTML-escaped — some excerpts contain literal `"` or `'`, verified against post 14 which has both). This is what makes link-preview bots (iMessage, X, Facebook — none of which run our JS) show that post's own title/excerpt instead of the generic site-wide one.
- Also writes flat `dist/blog.html` and `dist/about.html` (generic site-wide meta, same as the template) — **required**, not optional: see the `vercel.json` note below for why.
- Regenerates `dist/sitemap.xml` with real URLs (overwrites whatever `vite build` copied from `public/`, since that's just a stale placeholder now — there's no static `public/sitemap.xml` file anymore, it's fully generated).
- Fails loudly (throws, breaking the build) if it can't extract a post's fields, if two post titles slugify to the same URL, or if a post title's slug collides with a reserved route (`blog`/`about`/`collection`) — better than silently shipping a broken or overwritten page. If you ever add a post titled something like "Blog" or "About", the build will stop you and say so.

**`vercel.json` — a genuine gotcha, verified live, don't "simplify" this without re-testing on the real deployment:** `cleanUrls: true` makes Vercel serve `<path>.html` for a request to `/<path>` with no extension — that's what makes `/down-but-not-out` work. The `rewrites` catch-all to `/index.html` was *supposed* to be the fallback for routes without a prerendered file (like `/blog`, `/about`, or a typo), but **verified live on 2026-08-04 that it does not reliably fire** even with `cleanUrls` on — `/blog` and `/about` 404'd until `scripts/prerender.js` started generating real `blog.html`/`about.html` files for them specifically. The `rewrites` rule is left in place (harmless, might help edge cases) but don't rely on it for any route that actually matters — give it a real prerendered file instead. Genuinely unknown/mistyped paths still 404 on Vercel; that's accepted as normal.

If you add a new *type* of standalone view (not a post, not the existing blog/about/collection), give it a real prerendered file in `scripts/prerender.js` the same way — don't assume the rewrite fallback will catch it.

## Content model: the `blocks` system

Every blog post is an object in the `POSTS` array (`src/App.jsx`). Shape:

```js
{
  id: 5,
  title: "Post Title",
  author: "Name or null",       // null = written by the blog itself
  date: "July 31, 2026",
  category: "Teaching",         // e.g. Foundations, Devotional, Teaching
  readTime: "6 min read",   // NOTE: cosmetic only — the UI actually computes read time live via estimateReadTime() (word count / 200wpm) and ignores this field. Fill it in for consistency but don't expect it to control what's displayed.
  excerpt: "One or two sentence teaser shown on the post list.",
  blocks: [ /* array of content blocks, rendered in order by PostBody() */ ],
}
```

`PostBody` (in `App.jsx`) renders each block by `type`. Block types:

| type | shape | renders as |
|---|---|---|
| `p` | `p("text")` helper, or `{ type: "p", text }` | paragraph (first paragraph gets a drop-cap) |
| `heading` | `{ type: "heading", text }` | section heading |
| `list` | `{ type: "list", items: [...] }` | bulleted list |
| `quote` | `{ type: "quote", text, attribution? }` | "Wisdom of the Day" styled callout |
| `scripture` | `{ type: "scripture", reference, verses: [...] }` | "Scripture Focus" callout, one or more verses |
| `reflection` | `{ type: "reflection", items: [...] }` | numbered "Reflection Questions" box |
| `heart` | `{ type: "heart", text }` | "Write This On Your Heart" callout |
| `encourage` | `{ type: "encourage", text }` | centered "Be Encouraged" statement |
| `share` | `{ type: "share", items: [...] }` | "Share Your Faith" bulleted box |
| `prayer` | `{ type: "prayer", text }` | "A Prayer" callout |
| `closing` | `{ type: "closing", text }` | small italic closing line |

There's a `p(text)` shorthand helper (`const p = (text) => ({ type: "p", text })`) used for plain paragraphs — prefer it over writing out `{ type: "p", text: ... }` by hand.

To add a new post: pick the next `id`, write `blocks` using the types above to match the sermon/devotional structure of the content, and prepend or append to `POSTS` (existing posts are ordered by content, not strictly by array position — check surrounding dates).

## Contributor author pages

Contributors with more than one post (currently Jonny Ardavanis) can get a "Teaching From" collection page — a bio plus every post where `post.author` matches their name, sorted by date. To add one for a new contributor: add an entry to the `AUTHORS` object (near `POST_TAGS`) with `role` and `bio` (array of paragraph strings). That's it — `postsByAuthor()` filters `POSTS` by the exact `author` string, no separate tagging array to maintain. The byline on `SinglePostView` automatically becomes a clickable link to `/collection/<slugified-name>` for any author present in `AUTHORS`; authors not in `AUTHORS` just show plain (non-clickable) byline text.

**Deliberately no top-nav link to these pages** — Brian wants the site to clearly stay *his*, not read like a co-owned or contributor-branded site. Reachable only via the byline click. Bio text should always be paraphrased in original wording from facts Brian supplies, never copied verbatim from an external bio/church page — see the git history for how the Jonny Ardavanis bio was written as a real example.

**Display order is driven entirely by the `date` field, not array position or `id`.** Every post list (homepage Recent Posts, Blogs page, older/newer post nav) sorts with `[...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date))`. So if Brian wants a new post to land at a specific point in the chronological order (e.g. "keep post X as the latest"), just pick a `date` that falls where he wants — where the object sits in the `POSTS` array itself doesn't matter for display order.

## Workflow preference

After making a change (code or content), automatically `git add`, commit with a clear descriptive message, and `git push` to `origin main` — do this without asking each time, unless told otherwise for a specific change. Standing exception: pause and confirm first for anything unusually large or destructive (e.g. a big restructuring, deleting content, force-pushing).

**Always verify the live site after pushing** — don't just trust that `git push` succeeded. Check `https://the-gospel-lens.vercel.app/` actually reflects the change, or check the commit's deploy status (public repo, no auth needed): `GET https://api.github.com/repos/briangaini/gospel-lens/commits/<sha>/status`. On 2026-07-31 a stale Vercel "Root Directory" project setting (left over from before the repo was flattened) silently broke every deploy for several pushes in a row — this has since been fixed, but don't assume a push = a live update without checking.

Brian is new to Claude Code — proactively fill in gaps he wouldn't know to ask about (e.g. explain what a setting does before changing it, flag when something needs his explicit approval vs. when it doesn't, don't assume he knows CLI/git/deploy terminology).

## New feature ideas

Before implementing any new feature or "next level" idea for this site (not just routine content/bug-fix edits), propose it and get explicit approval first — even if broader auto-approve permissions are active. Routine work (adding posts, small fixes, tweaks Brian directly asked for) doesn't need this — just do it and push.

## Always end every response with a bugs & ideas roundup

Brian explicitly asked (2026-08-03) for every response in this project to end with: (1) known bugs on the live site, and (2) "next level" feature ideas not yet greenlit — plus, per his follow-up the same day, always explain *how* each would be fixed/built and *what it would look like/do*, not just name it. This is a standing requirement, not a one-time ask — do it even if the response is short or the list is unchanged since last time. Keep the list below current as the source of truth (update it here whenever something is fixed, newly found, or newly proposed) and echo it at the end of each response so Brian always has an accurate, up-to-date punch list to act on.

**Known bugs (as of 2026-08-04): none currently known.** Everything from the original punch list is fixed — see below. Keep this section honest: the moment something new is found, it goes here, not straight to "Fixed."

**Fixed:**
- ~~Newsletter signup broken~~ — fixed 2026-08-04. `BUTTONDOWN_USERNAME` is set to `"gaini"`; the footer form now points at Buttondown's real embeddable-subscribe endpoint. See "Newsletter integration" below.
- ~~Generic/site-wide social share previews~~ — fixed 2026-08-04 via real per-post URLs + prerendering. See "Routing & per-post URLs" above.
- ~~No favicon~~ — fixed 2026-08-04, `public/favicon.svg`, mirrors the header logo mark.
- ~~No sitemap.xml/robots.txt~~ — fixed 2026-08-04 (and upgraded again same day once real URLs existed — `dist/sitemap.xml` now lists real post/collection paths, regenerated on every build, not hand-maintained).
- ~~No author/collection page for Jonny Ardavanis~~ — fixed 2026-08-04, see "Contributor author pages" above.
- ~~No analytics~~ — fixed 2026-08-04, Vercel Analytics (`@vercel/analytics`). **Note: still needs Brian to flip on "Web Analytics" in the Vercel project dashboard itself** — the client-side snippet is live but Vercel logs a harmless console message ("enable Web Analytics for your project") until that toggle is switched on there; that's a dashboard action Brian needs to do himself, not something fixable in code.
- ~~No installable PWA~~ — fixed 2026-08-04, `vite-plugin-pwa` (manifest + service worker via Workbox), icons rasterized from the favicon mark.
- ~~No "Listen to this post"~~ — fixed 2026-08-04, one button below the title and one at the end (synced), better voice selection (scores available system voices for quality), reads paragraph-by-paragraph instead of one flat block.
- ~~`og:type` was `website` on post pages~~ — fixed 2026-08-04, now `article` for individual posts; home/blog/about/collection stay `website`.
- ~~Search results weren't ranked~~ — fixed 2026-08-04, title matches now surface above body-only matches while a search is active.

**Proposed "next level" ideas (not yet greenlit):**
- Genuinely unknown/mistyped URLs 404 on Vercel rather than showing a friendly in-app "not found" page — accepted as normal for now (see the `vercel.json` gotcha above), but a custom 404 page is a small, low-risk idea if Brian wants a softer landing than Vercel's default.
- **A truly natural/emotive Listen-to-Post voice** — the current version (2026-08-04) is the best achievable with the browser's own free voices; a real narrator-quality voice needs a paid cloud TTS API (e.g. ElevenLabs, Amazon Polly, Google Cloud TTS) plus a small serverless function, since a paid API key can't live in this client-only app the same way the Buttondown key couldn't. Real ongoing cost, bigger scope — Brian's call if worth pursuing.
- **RSS feed** — a generated `dist/rss.xml` (same idea as `sitemap.xml`, extended with each post's full excerpt) so people can follow new posts in a feed reader independent of email. Cheap: reuses data the prerender script already extracts.
- **Structured data (JSON-LD `Article` schema)** on each prerendered post page — a small `<script type="application/ld+json">` block with headline/date/author. Doesn't change how the page looks to a visitor, but gives Google more to work with for rich search-result snippets (sometimes shown with a date or author line). Pairs naturally with the prerender script since the data's already extracted there.
- **Save-as-PDF / print button** — `index.css` already has a `@media print` stylesheet that hides the header/footer for clean printing; there's just no button that triggers it yet. A "Print / Save as PDF" link on each post calling `window.print()` would make that existing groundwork actually reachable — useful for someone who wants a physical copy for a small-group study.
- **Weekly digest email to Buttondown subscribers** — now that the newsletter actually captures emails, the natural next step is giving subscribers a reason to have signed up: a simple weekly "here's what went up this week" email. Buttondown supports scheduled/automated sends; this would be a workflow/process change more than code.
- **"Continue reading" / lightly remembered reading history** — using the visitor's own browser storage (no accounts, no server, fully private) to quietly note which posts they've opened, and show something like "You've read 6 posts" or resurface an unfinished one on return visits. A small, low-risk engagement touch.

## Newsletter integration (Buttondown)

`BUTTONDOWN_USERNAME` (near the top of `App.jsx`) is set to `"gaini"` as of 2026-08-04, so the footer's `Footer` component renders Buttondown's official embeddable subscribe form (`https://buttondown.com/api/emails/embed-subscribe/gaini`) — no secret key needed anywhere, safe in client code. There's a fallback path (broken custom `window.storage` form) that only activates if this constant is ever emptied — should stay set. **Never put a Buttondown API key (the private one, not the username) into this codebase** — it would ship to every visitor's browser in the JS bundle, giving anyone who views source full API access to Brian's Buttondown account (read/export subscribers, delete them, etc.). Only the *username* is needed and is safe to hardcode. (Brian pasted his real API key in chat once on 2026-08-04 before this was fixed — it was never used or written anywhere; only the username was used.)
