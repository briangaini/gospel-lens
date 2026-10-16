// ---------------------------------------------------------------------------
// CONTENT MODEL
// Each post has a `blocks` array so sermon-style posts (with wisdom quotes,
// scripture callouts, and reflection questions) render as designed
// components instead of plain paragraphs. Add new posts below — no other
// code needs to change.
//
// Block types:
//  { type: "p", text }
//  { type: "heading", text }
//  { type: "list", items: [] }                  -> plain bullet list, no label
//  { type: "quote", text, attribution }        -> "Wisdom of the Day" box
//  { type: "scripture", reference, verses: [] } -> "Scripture Focus" box
//  { type: "reflection", items: [] }            -> reflection questions
//  { type: "heart", text }                       -> "Write this on your heart"
//  { type: "closing", text }                     -> italic sign-off
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// NEWSLETTER CONFIG
// Leave BUTTONDOWN_USERNAME blank to keep the current demo-only signup box
// (it just shows "Subscribed ✓" without saving anything). Once you create a
// free account at buttondown.com, put your username here (the part after
// buttondown.com/ in your dashboard URL) and the form becomes fully working
// — no other code changes needed.
// ---------------------------------------------------------------------------
export const BUTTONDOWN_USERNAME = "gaini";
// ---------------------------------------------------------------------------
// CONTACT CONFIG
// Fill in your email address below and two things go live: a "Contact"
// link in the footer for readers, and a separate "Submit a Blog Post" link
// for other writers who want to pitch content (pre-filled subject line so
// their emails are easy to spot). Leave blank to hide both links.
// ---------------------------------------------------------------------------
export const CONTACT_EMAIL = "brian13gaini@gmail.com";
export const CATEGORIES = ["All", "Foundations", "Teaching", "Devotional", "Wisdom from Proverbs"];
// Curated posts for the "Start Here" section — the clearest explanations
// of the gospel itself, pulled out from the general post stream.
const FOUNDATIONAL_POST_IDS = [1, 12, 19];
// A short guided reading path for first-time visitors, in a specific
// suggested order. This order is a first-pass guess from the posts'
// titles/themes, not a close read of the full content -- worth revisiting
// once it's live. Reuses the existing "The Gospel Explained" POST_TAGS
// group (4 posts) rather than a separate list, so there's only one place
// that ever needs updating. Every post here already has its own real,
// public URL -- nothing about this plan ever makes a post inaccessible;
// "upcoming" in ReadingPlanView is a progress cue only, never a gate.
export const READING_PLAN_POST_IDS = [1, 9, 12, 19];
