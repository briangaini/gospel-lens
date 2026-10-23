// ---------------------------------------------------------------------------
// SLUGS — turns a post title into a clean, shareable URL fragment, e.g.
// "We Will Worship and We Will Reign" -> "we-will-worship-and-we-will-reign"
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TOPICS — cross-category tags, separate from Foundations/Teaching/
// Devotional. Lets someone browse "everything about grief" regardless of
// which category it's filed under. Add a post's id to a tag's array to
// tag it — a post can carry more than one tag.
// ---------------------------------------------------------------------------

export const POST_TAGS = {
  "The Gospel Explained": [1, 9, 12, 19, 28, 57, 96],
  "Grace & Assurance": [3, 14, 7, 31, 53, 63, 68, 70, 78, 80, 85, 86],
  "Sin & Repentance": [8, 17, 47, 69, 70, 73, 78, 83, 85, 86],
  "Grief & Comfort": [6, 21, 22, 30],
  "Purpose & Calling": [5, 13, 23, 26, 29, 50, 59, 74, 76, 77, 92, 93, 95],
  "Prayer": [2, 18, 73],
  "Worship": [4, 38, 43, 91],
  "Friendship": [20, 34, 49, 67, 81, 90, 93, 94],
  "Discipline & Growth": [10, 11, 24, 25, 39, 33, 35, 42, 45, 48, 52, 61, 64, 75, 79, 80, 95, 96],
  "Identity in Christ": [16, 37, 40, 46, 47, 55, 56, 66, 82, 83, 87],
  "Peace": [36, 41, 15, 43, 51, 54, 60, 71, 75, 84, 88, 89, 91],
  "God's Love & Faithfulness": [32, 57, 58, 65, 72, 84, 88, 89, 90, 92, 94],
  "Heaven & Eternity": [27, 44, 62],
};
export const TOPIC_DESCRIPTIONS = {
  "The Gospel Explained": "What the gospel actually is, and why it changes everything — the clearest place to start if any of this is new to you.",
  "Grace & Assurance": "Why God's acceptance comes first, not last, and how to actually rest in that instead of always wondering if you've done enough.",
  "Sin & Repentance": "Honest posts on what sin really costs, and what real repentance — not just guilt — looks like.",
  "Grief & Comfort": "For the seasons that hurt. Loss, sorrow, and where God actually is in the middle of it.",
  "Purpose & Calling": "What it means to live for something bigger than yourself, and how to find your place in God's story.",
  "Prayer": "Practical, honest posts on actually talking to God, not just about him.",
  "Worship": "What worship really is, beyond a Sunday morning — a whole life oriented toward God.",
  "Friendship": "On the kind of friendship Scripture actually calls us to — costly, loyal, and gospel-shaped.",
  "Discipline & Growth": "The slow, ordinary work of becoming more like Christ — habits, discipline, and real spiritual growth.",
  "Identity in Christ": "Who you actually are if you belong to Jesus, and why that matters more than anything else you've been told about yourself.",
  "Peace": "Real peace — not the absence of trouble, but the presence of God in the middle of it.",
  "God's Love & Faithfulness": "How wide, how deep, how unshakably constant God's love actually is — and why it was never something you had to earn.",
  "Heaven & Eternity": "What's actually waiting on the other side, and why setting your mind there changes how you live on this one.",
};
