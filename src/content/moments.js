// The homepage's "What are you carrying today?" chooser (added 2026-10-06
// with the homepage makeover). Each moment is a first-person feeling that
// leads to one hand-picked primary post, two secondary posts, and a topic
// page. `primary`/`secondary` are post ids and `topic` must be a POST_TAGS
// key -- scripts/prerender.js checks all of them at build time, so renaming
// or removing a post can't silently leave a dead link on the homepage.
// These picks are editorial judgment, not an algorithm: change them freely.
export const MOMENTS = [
  { label: "I can't stop worrying", topic: "Peace", primary: 43, secondary: [54, 36] },
  { label: "I'm grieving", topic: "Grief & Comfort", primary: 6, secondary: [22, 30] },
  { label: "I'm full of doubt", topic: "Grace & Assurance", primary: 68, secondary: [31, 53] },
  { label: "I feel ashamed", topic: "Sin & Repentance", primary: 69, secondary: [8, 70] },
  { label: "I'm worn out", topic: "Peace", primary: 71, secondary: [60, 41] },
  { label: "I feel alone", topic: "Friendship", primary: 49, secondary: [20, 67] },
  { label: "I'm new here", topic: "The Gospel Explained", primary: 1, secondary: [12, 19] },
];
