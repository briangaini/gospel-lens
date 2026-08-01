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

## Workflow preference

After making a change (code or content), automatically `git add`, commit with a clear descriptive message, and `git push` to `origin main` — do this without asking each time, unless told otherwise for a specific change. Standing exception: pause and confirm first for anything unusually large or destructive (e.g. a big restructuring, deleting content, force-pushing).

**Always verify the live site after pushing** — don't just trust that `git push` succeeded. Check `https://the-gospel-lens.vercel.app/` actually reflects the change, or check the commit's deploy status (public repo, no auth needed): `GET https://api.github.com/repos/briangaini/gospel-lens/commits/<sha>/status`. On 2026-07-31 a stale Vercel "Root Directory" project setting (left over from before the repo was flattened) silently broke every deploy for several pushes in a row — this has since been fixed, but don't assume a push = a live update without checking.

Brian is new to Claude Code — proactively fill in gaps he wouldn't know to ask about (e.g. explain what a setting does before changing it, flag when something needs his explicit approval vs. when it doesn't, don't assume he knows CLI/git/deploy terminology).

## New feature ideas

Before implementing any new feature or "next level" idea for this site (not just routine content/bug-fix edits), propose it and get explicit approval first — even if broader auto-approve permissions are active. Routine work (adding posts, small fixes, tweaks Brian directly asked for) doesn't need this — just do it and push.
