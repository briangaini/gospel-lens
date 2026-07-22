# The Gospel Lens

A gospel-centered blog built with React, Vite, and Tailwind CSS — publishing devotionals, sermon notes, and teaching content across three categories: Foundations, Teaching, and Devotional.

**Live site:** [the-gospel-lens.vercel.app](https://the-gospel-lens.vercel.app)

## About

The Gospel Lens exists to explain the gospel of Jesus Christ clearly and to look at ordinary life — work, relationships, doubt, grief, joy — through that lens. Read more on the [About page](https://the-gospel-lens.vercel.app/#about).

## Features

- Home page with a rotating daily Verse of the Day (ESV), a "Start Here" section of foundational posts, and recent posts
- Searchable, filterable blog archive (by category and by cross-cutting topic tags)
- Full-text search across every post's title, body, and scripture references
- Individual post pages with a reading progress bar, previous/next navigation, and related posts
- Shareable, human-readable post links (e.g. `/#post-title-here`)
- Social sharing with a generated verse-card image for the Verse of the Day
- Dark mode
- Print-friendly post styling
- Newsletter signup (via Buttondown)

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide
- **Fonts:** Playfair Display (headings), Inter (body)
- **Deployment:** Vercel, auto-deployed from this repo's `main` branch

## Project Structure

```
gospel-lens/
├── index.html
├── src/
│   ├── App.jsx        # entire site — all pages, components, and post content
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind entry
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

All blog content lives in a single `POSTS` array at the top of `App.jsx`. Adding a new post means adding a new entry to that array — no database or CMS involved.

## Development

```bash
npm install
npm run dev
```

## Deployment

Any push to `main` is automatically built and deployed by Vercel.

## License

Content (blog posts, devotionals, and teaching material) is not covered by the code license below — see the note in the site footer regarding content attribution and permissions. The code itself is released under the MIT License — see [LICENSE.md](./LICENSE.md).
