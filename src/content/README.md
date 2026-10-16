# The site's content

Everything a reader sees as *words* lives here, apart from the code. A post is one file.

```
src/content/
  posts/                 one file per post:  NNN-the-title.json   (NNN = the post's id)
  topics.js              POST_TAGS (which posts are in which topic) + TOPIC_DESCRIPTIONS
  series.js              SERIES (named, growing sets of posts, like the Proverbs Series)
  authors.js             AUTHORS (bio for a contributor whose byline should link somewhere)
  moments.js             MOMENTS (the homepage "What are you carrying today?" chooser)
  verses.js              VERSES_OF_DAY (the rotating verse on the homepage)
  site.js                small site settings (email addresses, categories, the 4-day plan's post ids)
```

The `.js` files are plain data with **no imports**, because the build scripts load them directly
in Node. Keep them that way.

## Adding a post

```bash
npm run new-post -- "The Post Title" --category Devotional
# also: --author "Jonny Ardavanis"  --series proverbs  --date "October 20, 2026"
```

That creates `src/content/posts/NNN-the-post-title.json` with the next free id and today's date.
Open it and fill in the text, then add the post's id to a topic in `topics.js` (it can be in more
than one). That's all: the site, the per-post web page, the sitemap, the RSS feed, the share
image and the newsletter draft are all produced from that one file. You never need to touch the code.

`npm run dev` picks up a new or edited post after a refresh.

## What's in a post file

```json
{
  "id": 77,
  "title": "Passing Along God's Wisdom",
  "author": null,
  "date": "October 10, 2026",
  "category": "Devotional",
  "series": "proverbs",
  "readTime": "3 min read",
  "excerpt": "The sentence or two shown on cards and in Google.",
  "blocks": [
    {"type":"p","text":"A paragraph."},
    {"type":"scripture","reference":"Proverbs 22:6","verses":["Direct your children onto the right path..."]}
  ]
}
```

- `id`: a whole number, unique, and it must match the number at the start of the file name.
- `author`: a name, or `null` for a post written by the blog itself. A name only becomes a
  clickable byline if it has an entry in `authors.js`.
- `date`: written like `"October 10, 2026"`. Newest first on the site. For two posts on the same day,
  the higher id counts as newer (an optional whole-number `"order"` overrides the id for that
  tie-break only; six older posts use it to keep their original order).
- `category`: `Foundations`, `Teaching`, `Devotional` or `Wisdom from Proverbs`.
- `series`: optional. `"proverbs"` puts the post in the Proverbs Series regardless of its category
  (posts whose category is `Wisdom from Proverbs` join it automatically).
- `readTime`: not shown anywhere (the real time is worked out from the word count); fill it in for tidiness.
- `excerpt`: lead with the hook. Only the first ~155 characters show in Google.

### Block types

| `type` | fields | shows as |
|---|---|---|
| `p` | `text` | paragraph (the first one gets a drop cap) |
| `heading` | `text` | section heading (3+ of them gives the post a contents list) |
| `list` | `items` | bulleted list |
| `quote` | `text` | "Wisdom of the Day" box |
| `scripture` | `reference`, `verses` | "Scripture Focus" box (add the translation, like `NLT`, to `reference`) |
| `reflection` | `items` | numbered "Reflection Questions" (readers can write answers) |
| `heart` | `text` | "Write This On Your Heart" |
| `encourage` | `text` | centered "Be Encouraged" line |
| `share` | `items` | "Share Your Faith" box |
| `prayer` | `text` | "A Prayer" box |
| `closing` | `text` | small italic closing line |

`**bold**` and `*italic*` work **only** inside `p` blocks and `list` items. Use straight quotes
(`"` and `'`); a `"` inside a text value is written `\"` in JSON.

## How the site uses these files (so a post doesn't slow it down)

A visitor never downloads the whole library. The always-loaded part is a small list of every post's
details (title, date, category, excerpt, read time), about 8 KB compressed. A post's body is its own
file, fetched when someone opens that post. Search text, the Scripture Index verses and the Journal's
reflection questions are separate pieces fetched only by the page that needs them. This is why posts
are separate files, and why a hundred more posts won't make the site heavier to open.
See `vite-plugins/gospel-content.js` and `scripts/lib/content.js`.
