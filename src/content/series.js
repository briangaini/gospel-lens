// A short, real description per topic (added 2026-09-08, per Brian's
// request) -- shown at the top of TopicView and used as that topic page's
// meta description in scripts/prerender.js, so a search engine sees the
// same honest description a visitor does, not a generic "N posts about X."
// Keep these in sync if a topic name ever changes.
// SERIES -- a named, open-ended set of posts with its own page (/series/<slug>)
// and a spot on the homepage. A post joins a series with `series: "<id>"` in
// its object (independent of its category, so a post can be, say, a
// Devotional AND part of the Proverbs Series). The Proverbs Series also picks
// up any post whose category is "Wisdom from Proverbs". Keep each entry on one
// line with no double quotes inside the strings: scripts/prerender.js reads
// this block with a regex to build the page's meta description and sitemap.
export const SERIES = {
  proverbs: { slug: "proverbs", name: "The Proverbs Series", tag: "Wisdom for everyday life from the book of Proverbs", description: "Short, practical posts on the book of Proverbs: how we speak, who we walk with, what we guard, and the everyday choices that shape a life. Each one points back to Jesus, the wisdom of God. New posts are added to this series as they're written.", verse: "Above all else, guard your heart, for everything you do flows from it.", verseRef: "Proverbs 4:23", introId: 77 },
};
