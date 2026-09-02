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
  prerender.js          — runs after `vite build`, see "Routing & per-post URLs" below
  build-share-cards.js  — generates per-post share images, see "Share-link preview image" below
  fonts/                — real Playfair Display/Inter font files, used by build-share-cards.js
  notify-buttondown.js  — runs in CI, see "Newsletter auto-draft" below
.github/workflows/
  newsletter-draft.yml  — runs notify-buttondown.js on every push to main
.buttondown-notified.json — state file for the above, committed back by the bot
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

**`vercel.json` — a genuine gotcha, verified live, don't "simplify" this without re-testing on the real deployment:** `cleanUrls: true` makes Vercel serve `<path>.html` for a request to `/<path>` with no extension — that's what makes `/down-but-not-out` work. The `rewrites` catch-all to `/index.html` was *supposed* to be the fallback for routes without a prerendered file (like `/blog`, `/about`, or a typo), but **verified live on 2026-08-04 that it does not reliably fire** even with `cleanUrls` on — `/blog` and `/about` 404'd until `scripts/prerender.js` started generating real `blog.html`/`about.html` files for them specifically. The `rewrites` rule is left in place (harmless, might help edge cases) but don't rely on it for any route that actually matters — give it a real prerendered file instead. Genuinely unknown/mistyped paths now get a real branded 404 (fixed 2026-08-15) — see "Custom 404 page" below.

If you add a new *type* of standalone view (not a post, not the existing blog/about/collection), give it a real prerendered file in `scripts/prerender.js` the same way — don't assume the rewrite fallback will catch it.

## Custom 404 page

Two layers, both generated/verified 2026-08-15, needed because a genuinely unknown path can be served two different ways depending on whether Vercel's `cleanUrls`/`rewrites` routing ever hands off to the SPA's own JS:

- **`NotFoundView`** in `src/App.jsx` — what visitors see once the SPA's JS has loaded and its own router (`GospelLensApp`'s `applyLocation`) determines the path doesn't match Home/Blogs/About/a real post/a real collection. Matches site branding, links back to Home/Blogs, and surfaces 3 recent posts as a graceful recovery path.
- **`dist/404.html`** — a static, JS-free page generated by `scripts/prerender.js`'s `build404Page()`, for requests Vercel serves *before* any SPA JS runs at all (the same gap the `rewrites` gotcha above describes). Vercel auto-detects a `404.html` at the output root and serves it — with a genuine HTTP `404` status — for any unmatched request; this is the same convention GitHub Pages/Netlify use. **Verified live** via a raw `curl` to a nonexistent path (no JS involved): real `404` status code, branded content served — confirms this actually works for this deployment rather than being assumed.

Both pages independently carry the same message/links, so keep them in sync if the copy or link targets change.

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
- ~~No dedicated share-link preview image~~ — fixed 2026-08-12, see "Share-link preview image" below.
- ~~Listen to Post kept reading after navigating to a different post~~ — fixed 2026-08-12, `useListenToPost`'s stop-cleanup now keys off `post?.id`, not just full unmount.
- ~~Listen to Post was start/stop only~~ — fixed 2026-08-12, real play/pause/resume via `speechSynthesis.pause()`/`resume()`, plus a separate small restart-from-beginning button. Also slowed the reading rate to 0.85.
- ~~No RSS feed~~ — fixed 2026-08-12, `dist/rss.xml`, see "RSS feed" below — this is also the mechanism behind the auto-email-on-publish idea.
- ~~No auto-email to newsletter subscribers on new posts~~ — fixed 2026-08-12 via the free code-only path ("Option C"), see "Newsletter auto-draft on publish" below. **Standing reminder, per explicit request: keep mentioning Option B (Zapier) to Brian periodically** — he wants to switch to it eventually and asked to never let it drop off this list.
- ~~Listen to Post spoke on its own, skipped/reordered, or spoke from an unclear point~~ — fixed 2026-08-13. Two real root causes in the old `useListenToPost`: (1) every paragraph's `SpeechSynthesisUtterance` was queued upfront via repeated `.speak()` calls into a plain local array, and browsers can garbage-collect an utterance mid-queue once nothing holds a live reference to it — a known Web Speech API gotcha, and the actual cause of skipping/reordering/"speaking from nowhere"; (2) there was no guard against the page being restored from the browser's back/forward cache (bfcache), which can resume a previously-paused speech session with zero user interaction — the cause of "starts speaking on its own." Fixed by rewriting the hook to chain one utterance at a time via `onend` (holding segments/index/voice/utterance in `useRef`s so the in-flight utterance always has a live reference, instead of a local variable), plus a `pageshow` listener that force-cancels speech whenever `event.persisted` is true. Verified both on localhost and live on production.
- ~~Listen to Post pause/resume still didn't actually work~~ — fixed 2026-08-15, separately from the bug above. Root cause: the fix above still called the browser's *native* `speechSynthesis.pause()`/`.resume()`, and that API itself is genuinely unreliable in real-world use (a long-documented Web Speech API gotcha) — some browsers ignore `pause()` and keep talking, others cancel playback outright instead of truly pausing, making `resume()` afterwards a no-op. Fixed by never touching native pause/resume at all: "pause" now cancels the in-flight utterance ourselves and remembers which paragraph was interrupted (`indexRef` only advances on natural completion), and "resume" re-speaks that paragraph from its start — exact mid-sentence resume is traded for something that actually works consistently everywhere. Verified live on production: pause genuinely stops (`speechSynthesis.speaking` goes `false`, not just the unreliable `.paused` flag), stays stopped, resume genuinely restarts speech, and rapid pause/resume/pause toggling settles into a consistent, non-stuck state.
- ~~No rich Google search results / structured data~~ — fixed 2026-08-15, JSON-LD `Article` schema on every prerendered post page (see `scripts/prerender.js`'s `buildArticleJsonLd`) — headline, dates, author (`Person` for a named contributor, `Organization` for Brian's own posts), publisher, and image. No visible change on the site; just gives Google more to work with. Verified all 34 post pages produce valid JSON.
- ~~No Save-as-PDF / print button~~ — fixed 2026-08-15, a "Print / Save as PDF" button next to "Listen to This Post" on every post, calling `window.print()`. The `@media print` styles hiding the header/footer already existed in `index.css`; this just made them reachable.
- ~~No "continue reading" memory~~ — fixed 2026-08-15. Fully local via `localStorage` (`gospel-lens-read-history`, capped at 100 entries) — nothing sent anywhere. A "Continue Reading" card appears on Home pointing at the last post opened; a small "You've read N posts" line appears on the Blogs page. Both stay hidden until there's real history.
- ~~Genuinely unknown/mistyped URLs 404 on Vercel's generic default page~~ — fixed 2026-08-15, a real custom 404 with two layers: `NotFoundView` in the SPA (matches site branding, links to Home/Blogs, surfaces 3 recent posts) for any path the client-side router doesn't recognize once the JS has loaded, plus a static, JS-free `dist/404.html` (also generated by `scripts/prerender.js`) for requests Vercel serves *before* the SPA ever loads. Verified live with a raw `curl` to a nonexistent path: genuine HTTP `404` status, branded content, no JS required — confirms Vercel's documented "serve `404.html` from the output root automatically" convention actually works for this deployment, the same way the `vercel.json` rewrites gotcha above was verified rather than assumed.
- ~~Print / Save as PDF printed the whole page, not just the post, and the byline printed too faint to read~~ — fixed 2026-08-15 (same day it shipped). Everything outside the actual post — both "Back to Blogs" buttons, both Listen-button rows, the reading-progress bar, the older/newer post nav, and the "Keep Reading" related-posts section — is now marked `.no-print`, so a printed/PDF'd post is just category, byline, title, and body. The byline's light gray screen color also washed out further under print/PDF color handling; gave it a `.post-byline` class forced to solid ink-black text in the print stylesheet specifically (scoped narrowly so it doesn't touch the scripture/quote callout boxes, which intentionally use light text on dark backgrounds). The browser's own default print header/footer (page title + URL) is untouched — that's native browser behavior, not something this app controls, and Brian said he wants it kept.
- ~~No rich Google search results / structured data~~, ~~no Save-as-PDF button~~, ~~no "continue reading" memory~~ — see the 2026-08-15 entries a few lines up; all shipped together in one batch.
- ~~Related posts only matched on category, not topic~~ — fixed 2026-08-15. "Keep Reading" now ranks posts sharing a `POST_TAGS` topic (Grace & Assurance, Grief & Comfort, etc.) above same-category-only matches, and leaves a post out entirely if it shares neither — see `getRelatedPosts()`. Verified live: a Grace & Assurance post now surfaces the *other* Grace & Assurance posts first, not just whatever else happens to share its category.
- ~~Newsletter footer form gave no in-page acknowledgment~~ — fixed 2026-08-15. The live form is a real cross-origin POST to Buttondown (`target="_blank"`), so there's never a response for our own JS to react to. Added an optimistic same-tab "Check your email to confirm your subscription" message the instant someone submits (accurate either way, since Buttondown double opt-ins everyone), and clears the field shortly after.
- ~~Dark mode reset to light on every visit~~ — fixed 2026-08-15. An inline script in `index.html` applies a saved `localStorage` choice, or absent one, the system's `prefers-color-scheme`, before React ever mounts (no flash of the wrong theme). The toggle now persists the choice back to `localStorage` (`gospel-lens-theme`).
- ~~No way for a reader to share how a post impacted them, or privately suggest a site idea to Brian~~ — fixed 2026-08-15. Two new footer links, "Share Your Story" and "Suggest an Idea," reusing the exact `mailto:` pattern already live for "Submit a Blog Post" — zero new third-party account/setup, and both go straight to Brian's own inbox only (nothing public, nothing stored elsewhere), which is what "privately, only to me" required. "Share Your Story" pre-fills a short prompt in the email body; "Suggest an Idea" pre-fills just the subject. The footer's link row now wraps (`flex-wrap`) to fit four links instead of two — verified it wraps cleanly on mobile width with no overlap.

- ~~PWA service worker served a stale cached bundle for a while after a deploy~~ — fixed 2026-08-17. `registerType: "autoUpdate"` (already set) only made the service worker itself skip-waiting and take over in the background — it never reloaded a tab that was already open, so a visitor could sit on an old version until they happened to refresh. Tried the documented fix first (`virtual:pwa-register`'s `onNeedRefresh` → `updateSW(true)`) and, when tested end-to-end locally against a real rebuild while a tab stayed open, found it genuinely unreliable — a new worker sat fully installed and waiting for 15+ seconds with the callback never firing. Replaced it with direct, low-level Service Worker API calls in `src/main.jsx` instead (message any waiting worker to activate immediately, reload on `controllerchange`), since that exact sequence was verified to work reliably.
  - **Follow-up same day:** Brian tested this live and needed several manual hard-refreshes before it actually kicked in — a fair catch that this was exactly the problem still present in a different form. Root cause: detection relied entirely on the browser's own default background schedule for checking whether `sw.js` had changed, which is genuinely conservative/slow in practice (confirmed by his experience, likely worse in Safari). Fixed by calling `registration.update()` explicitly the moment the page loads, and again whenever the tab regains focus after being backgrounded, instead of waiting on that default timing. Verified: repeated the same rebuild-while-tab-open test, and this time a single plain page reload (no manual `reg.update()`, no cache-clearing) was enough to detect and apply the new version — confirms detection is now near-instant rather than dependent on the browser's slower default cadence. **Known, unavoidable limit:** this can't retroactively speed up a visitor who is *still* running a bundle from *before* this fix existed — that old bundle has none of this logic to run, so getting off of it depends on the browser's own native update check firing at least once on its own, same as before this whole fix. This is a one-time cost for anyone who visited before 2026-08-17; every visitor from now on avoids it entirely.

**Proposed "next level" ideas (not yet greenlit):**
- **New — extend the "share as image" verse card to every Scripture Focus box in a post, not just the homepage Verse of the Day.** `generateVerseCardBlob()` (used by `VerseOfDay`'s "Share this verse") already renders a nicely branded, downloadable/shareable image from a `{text, reference}` verse — reusing it on each post's Scripture Focus callout would let a reader share the *specific* verse a post is about, not just whatever's on the homepage that day. Low risk since the hard part (canvas-based card rendering) is already built and proven; this is just wiring a "Share this verse" button into `PostBody`'s scripture block.
- **New — a keyboard shortcut for search (`/` or Cmd/Ctrl+K).** A `keydown` listener that opens the nav search and focuses the input — a small, common power-user pattern that makes repeat visitors' search meaningfully faster to reach than hunting for the icon.
- **New — dedicated, shareable topic pages** (e.g. `/topics/grace-assurance`), one per `POST_TAGS` entry, listing every post with that tag. Parallels the author collection-page architecture already built (`scripts/prerender.js` + `CollectionView`) almost exactly, reuses tag data that already exists, and adds real SEO surface area for long-tail searches ("grace and assurance devotional") that the site currently has no dedicated page for.
- **New — an "On this day" resurfacing widget.** A small card ("One year ago today: [Post Title]") surfacing an older post published around the same calendar date in a previous year — pure date-math over the existing `POSTS` array, no new data needed, and a low-effort way to keep older content circulating instead of it sinking to the bottom of the Blogs list forever.
- **New — a short guided reading plan** (e.g. "5 Days to Understand the Gospel"), sequencing a curated list of posts with a "Day 2 of 5" progress indicator, built on the same `localStorage` read-history mechanism already shipped for Continue Reading. Turns the existing "New here? Start with these" homepage section into a fuller guided path rather than just three unordered cards — a meaningful differentiator from "just a blog" for a first-time visitor.
- **Switch newsletter automation to Option B (Zapier)** — Brian explicitly asked to keep this suggested to him "at any cost" even though Option C is live and working. Free Zapier account + their pre-built "RSS by Zapier + Buttondown" template pointed at `/rss.xml`. Simpler to maintain long-term (Zapier/Buttondown's own supported integration, not bespoke code) at the cost of one more third-party account.
- **A truly natural/emotive Listen-to-Post voice** — the current version is now reliable (pause/resume genuinely works, see Fixed above), but voice quality is still capped by what the browser ships free. A real narrator-quality voice needs a paid cloud TTS API (e.g. ElevenLabs, Amazon Polly, Google Cloud TTS) plus a small serverless function, since a paid API key can't live in this client-only app the same way the Buttondown key couldn't. Real ongoing cost, bigger scope — Brian's call if worth pursuing.
- **Comment section** — Brian wants this eventually but said do it later; keep proposing it each round rather than dropping it. His site has no backend, so this needs a third-party embeddable widget. Recommended: **Cusdis** (lightweight, no ads, simple name+comment for visitors, free tier). Disqus is the well-known alternative but ad-heavy on free tier; Giscus/Utterances need the *commenter* to have a GitHub account, wrong fit for this audience. Whichever is picked, "one comment visible, click to see more" is the widget's default behavior, not something to hand-build. Needs Brian to create the free account himself and hand over the embed/site ID (same pattern as Buttondown) — can't be done for him.

## RSS feed

`dist/rss.xml` is generated by `scripts/prerender.js` (`buildRss()`) from the same post data already extracted for the sitemap — newest first, `<guid isPermaLink="true">` per post, valid RSS 2.0. Linked via `<link rel="alternate" type="application/rss+xml">` in `index.html` for feed-reader auto-discovery. **This is the code-side half of "auto-email every new post to newsletter subscribers"** — Buttondown's "RSS to Email" automation (in Brian's Buttondown dashboard) watches a feed URL and auto-sends when a new item appears; the feed just needs to stay valid, which it does automatically on every build since it's generated, not hand-maintained.

## Share-link preview image (og:image)

`public/og-image.png` (630×630, transparent PNG) is wired into `index.html`'s `<head>` as the site-wide default — added 2026-08-12. Home, Blogs, About, and every author collection page still use this exact image unchanged.

**Every individual post now gets its own distinct, generated share image instead (added 2026-08-26).** `scripts/build-share-cards.js` renders a branded 630×630 PNG per post — category, the post's actual title, the same brand mark as the generic image, and a domain footer — to `dist/og/<slug>.png`, and `scripts/prerender.js` points that post's `og:image`/`twitter:image`/JSON-LD `image` at it specifically (JSON-LD's `publisher.logo` stays on the generic `og-image.png`, since a publisher logo is supposed to be stable across every article, unlike the article's own image). Uses `@napi-rs/canvas` (prebuilt native binaries — installs cleanly on Vercel's Linux build servers, no compile step) with the real Playfair Display/Inter font files bundled in `scripts/fonts/`, so the rendered text matches the site's actual typography rather than a fallback font. Title text auto-wraps and shrinks to fit up to 4 lines, and the fit check is height-aware (not just a line-count cap) — a real overlap bug surfaced 2026-08-26 when "From Worry to Worship: Seeing Your Anxiety Through God's Eyes" (61 characters, the new longest title on the site) wrapped to 4 lines and visibly collided with the domain footer at the old minimum font size; `fitTitle()` now shrinks until the wrapped block's actual pixel height fits the real space above the footer, not just until it's under a line-count ceiling. Tested against that title plus the previous long/short stress-test titles to confirm the fix and no regressions. **Approved via a mocked-up HTML preview first** (three real post titles at real size, plus a simulated iMessage bubble) before any of this was built, per Brian's ask to see anything visual/brand-related before it ships. Verified live: fetched a real generated card straight off production and confirmed it renders pixel-identical to the local build, including both fonts rendering correctly (not a fallback) — confirms the native canvas library actually works on Vercel's infrastructure, not just locally.

**The header logo, favicon, and PWA/app icons are untouched by any of this** — Brian was explicit, more than once, that those must never change; only what a shared *link's* preview image shows. Don't reuse `og-image.png` (or the new per-post cards) for the header, `favicon.svg`, `apple-touch-icon.png`, or the PWA manifest icons without a separate, explicit request to change those specifically.

The image itself: Brian designed it in Canva (a gold ring, a solid cross, an open book) and pasted the raw JPEG export into this repo's root as `logo from canva.jpeg` (untracked — never committed, it's a working reference file, safe to ignore or delete). His Canva account is free-tier, so the "transparent background" export was paywalled; `og-image.png` was produced by processing that JPEG programmatically — scoring each pixel's "whiteness" (the gold linework has a much lower blue channel than the white background, so this cleanly separates logo from background even with JPEG compression noise at the edges), converting background pixels to alpha 0, then cropping to content and padding to a perfect square before the final resize. If this ever needs regenerating (e.g. Brian tweaks the Canva design again), the same technique applies — don't ask him to find a Pro plan for the transparent export.

Also worth remembering: the WhatsApp preview *card itself* being small on a phone screen is WhatsApp's own fixed UI, not something any `og:image`/meta tag can resize — don't imply that's fixable in code if it comes up again.

## Newsletter integration (Buttondown)

`BUTTONDOWN_USERNAME` (near the top of `App.jsx`) is set to `"gaini"` as of 2026-08-04, so the footer's `Footer` component renders Buttondown's official embeddable subscribe form (`https://buttondown.com/api/emails/embed-subscribe/gaini`) — no secret key needed anywhere, safe in client code. There's a fallback path (broken custom `window.storage` form) that only activates if this constant is ever emptied — should stay set. **Never put a Buttondown API key (the private one, not the username) into this codebase** — it would ship to every visitor's browser in the JS bundle, giving anyone who views source full API access to Brian's Buttondown account (read/export subscribers, delete them, etc.). Only the *username* is needed and is safe to hardcode. (Brian pasted his real API key in chat once on 2026-08-04 before this was fixed — it was never used or written anywhere; only the username was used.)

## Newsletter auto-draft on publish (Option C)

Verified live on 2026-08-12 that Buttondown's own "RSS to Email" automation feature — the obvious way to auto-notify subscribers of new posts — is a paid add-on ($9/mo) on Buttondown's pricing page, not included free. Two paths exist to do this for free; Brian chose to build the code-only one now ("Option C") and explicitly wants **Option B kept alive and re-suggested to him periodically** for whenever he's ready (he said "at any cost... always keep reminding me" — treat this as a standing instruction, not a one-time note):

- **Option B (not yet built, keep proposing):** a free Zapier account using their pre-built "RSS by Zapier + Buttondown" template (confirmed this exact integration exists), pointed at `/rss.xml`. Simpler for Brian long-term since it's maintained by Zapier/Buttondown themselves, not bespoke code — but needs him to sign up for a third service.
- **Option C (built, live):** `.github/workflows/newsletter-draft.yml` runs `scripts/notify-buttondown.js` on every push to `main` (no build step needed — reads post data directly, see below). It diffs the current post list against `.buttondown-notified.json` (a small list of already-drafted post URLs, seeded on 2026-08-12 with all posts that existed at the time so it only fires for genuinely new ones going forward) and `POST`s any new post to `https://api.buttondown.com/v1/emails` to create a **draft** — confirmed via Buttondown's own status-flow docs that creating an email via the API always lands as a draft first; sending is a separate, deliberate action, so this can never accidentally blast real subscribers even if something's misconfigured. If a draft creation fails, that post is deliberately *not* marked notified (retries automatically next push) and the workflow run fails loudly (red, not silently green) so a broken/expired key gets noticed — except a *missing* key, which is treated as "not configured yet" and exits cleanly.

Needs `BUTTONDOWN_API_KEY` as a GitHub repo secret (Settings → Secrets and variables → Actions) — Brian adds this himself, same non-negotiable rule as the client-side key: never handle or write the raw key anywhere in this repo or in chat-originated files. **Already added and verified working end-to-end with the real key** (2026-08-12) — the workflow genuinely created drafts in his live Buttondown account, confirmed by checking the bot's own follow-up commit only fires on success.

**Drafts contain the full post, styled like the site — not just an excerpt (upgraded 2026-08-12).** `scripts/post-to-email-html.js` renders every block type (`quote` → "Wisdom of the Day", `scripture` → "Scripture Focus", `reflection`, `heart` → "Write This On Your Heart", etc.) as inline-styled, table-based HTML in the site's actual color palette — inline styles only, no `<style>` blocks, since most email clients strip those. A clickable preview card (thumbnail from `og-image.png` + title + excerpt + domain) sits at the top linking to the live post, and a button at the end. The email body is prefixed with Buttondown's `<!-- buttondown-editor-mode: fancy -->` comment so their API treats it as HTML, not Markdown.

Getting the full `blocks` data (nested, varied-shape objects — a much bigger ask than the flat strings `prerender.js` extracts via regex) uses a different technique: `scripts/load-posts-data.js` bundles `src/App.jsx` with esbuild (`react`/`react-dom`/`lucide-react` marked external, resolved normally by Node from `node_modules` — the temp output file must live *inside* the project tree, e.g. under `node_modules/.gospel-lens-data-tmp/`, or Node's module resolution can't find them) and imports the result to read the real `POSTS`/`AUTHORS` constants directly — robust by construction since it's the actual data the site renders, not a regex guess at it. `App.jsx` has one small additive `export { POSTS, AUTHORS };` at the bottom for this; nothing else about the app changed.
