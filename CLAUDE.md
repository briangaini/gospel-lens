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
index.html
tailwind.config.js
vite.config.js
```

Almost the entire app is in `src/App.jsx` (~2,300 lines). There is no router or CMS — adding a post means editing this file directly.

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

Contributors with more than one post (currently Jonny Ardavanis) can get a "Teaching From" collection page — a bio plus every post where `post.author` matches their name, sorted by date. To add one for a new contributor: add an entry to the `AUTHORS` object (near `POST_TAGS`) with `role` and `bio` (array of paragraph strings). That's it — `postsByAuthor()` filters `POSTS` by the exact `author` string, no separate tagging array to maintain. The byline on `SinglePostView` automatically becomes a clickable link to `#collection-<slugified-name>` for any author present in `AUTHORS`; authors not in `AUTHORS` just show plain (non-clickable) byline text.

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

**Known bugs (as of 2026-08-04):**
- Newsletter signup in the footer is silently broken — it calls `window.storage?.set(...)`, which doesn't exist in the deployed app, so it always "succeeds" in the UI but never actually captures the email anywhere. **Blocked on one piece of info from Brian: his Buttondown username** (not an API key — see "Newsletter integration" below for why). The code already has a ready-to-go safe path (`BUTTONDOWN_USERNAME` constant, currently `""`) that needs zero secrets once filled in.
- Social share previews are generic/site-wide, not per-post — sharing an individual post link shows the same title/description card for every post instead of that post's own. This is bigger than a one-line fix: it needs real per-post URLs (not hash fragments) plus a prerendering step, since link-preview bots don't execute the site's JavaScript. Tracked as a next-level idea below ("real per-post URLs") since it's genuinely feature-sized.

**Fixed:**
- ~~No favicon~~ — fixed 2026-08-04, `public/favicon.svg`, mirrors the header logo mark.
- ~~No sitemap.xml/robots.txt~~ — fixed 2026-08-04, `public/sitemap.xml` + `public/robots.txt`. Caveat: because the site uses hash-based routing (`#slug`), individual post entries in the sitemap have limited real indexing value until real per-post URLs exist (see below) — search engines mostly only reliably index the root `/`. The sitemap is currently a hand-generated static file, not auto-regenerated — remember to regenerate it (or ask to) when adding new posts, until/unless that gets automated.
- ~~No author/collection page for Jonny Ardavanis~~ — fixed 2026-08-04, see "Contributor author pages" above.
- ~~No analytics~~ — fixed 2026-08-04, Vercel Analytics (`@vercel/analytics`), zero-cookie/no-consent-banner.

**Proposed "next level" ideas (not yet greenlit):**
- Fix the newsletter capture — needs Brian's Buttondown username (see bug above).
- **Real per-post URLs** (e.g. `/down-but-not-out` instead of `/#down-but-not-out`) — the enabling change behind both proper per-post social previews and full sitemap value. Moderate scope: touches routing and needs a small prerendering/build step so each post's HTML has its own meta tags baked in.
- Per-post social preview cards (depends on the above).
- Installable PWA (add-to-home-screen, works offline) — a `manifest.json` + icons, mostly configuration.
- "Listen to this post" via the browser's built-in text-to-speech (free, no backend, voice quality varies by device).

## Newsletter integration (Buttondown)

The footer's `Footer` component already has a dual path: if `BUTTONDOWN_USERNAME` (near the top of `App.jsx`, currently `""`) is set, it renders Buttondown's official embeddable subscribe form (`https://buttondown.com/api/emails/embed-subscribe/<username>`) — no secret key needed anywhere, safe to ship in client code. If it's empty, it falls back to the broken custom `window.storage` form. **Never put a Buttondown API key (the private one, not the username) into this codebase** — it would ship to every visitor's browser in the JS bundle, giving anyone who views source full API access to Brian's Buttondown account (read/export subscribers, delete them, etc.). Only the *username* (the part of `buttondown.com/<username>`) is needed and is safe to hardcode.
