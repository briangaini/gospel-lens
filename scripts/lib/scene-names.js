// What picture each post's share card shows. Plain data, no imports, so the build and the
// content checker can both read it.
//
// POST_PICTURES: post id -> "background:motif" (or "background:motif:variant"). The background
// is the landscape and the motif is the specific thing drawn on it (see scripts/share-scenes.js
// and scripts/share-motifs.js for the lists). **When you add a post, add a line here** that
// pictures what the post is actually about. A post with no line falls back to a plain
// landscape chosen from its first topic (TOPIC_BACKGROUNDS), or to the dark title card.

export const POST_PICTURES = {
  1: "dawn:scroll", 2: "night:kneel", 3: "dawn:key", 4: "light:crown", 5: "dusk:vase",
  6: "dusk:heart:cracked", 7: "dusk:coins", 8: "dusk:tree", 9: "night:constellation", 10: "dusk:cracked-jar",
  11: "field:shears", 12: "dawn:book", 13: "dawn:bridge", 14: "dawn:cross", 15: "dusk:door",
  16: "night:fingerprint", 17: "dusk:cross:road", 18: "dawn:birds", 19: "night:globe", 20: "dawn:friends",
  21: "dusk:tear-bottle", 22: "dusk:tear", 23: "desert:hourglass", 24: "field:sheaf", 25: "dawn:runner",
  26: "dawn:compass", 27: "dusk:ladder", 28: "light:eye", 29: "sea:ripples", 30: "storm:tree",
  31: "sea:rock", 32: "dawn:heart:gold", 33: "field:sprout", 34: "dawn:open-hands", 35: "field:fruit-branch",
  36: "sea:lighthouse", 37: "dusk:vine:grapes", 38: "dawn:sun-arc", 39: "dusk:vine:pruned", 40: "dusk:vine:apart",
  41: "dawn:dove", 42: "field:basket", 43: "field:lilies", 44: "night:stargazer", 45: "dusk:basin",
  46: "dusk:two-trees", 47: "dawn:broken-chain", 48: "desert:plow", 49: "dawn:yoke", 50: "light:",
  51: "night:pillar", 52: "desert:chest", 53: "dawn:leaf", 54: "storm:boat", 55: "dusk:head",
  56: "dusk:mask", 57: "storm:rainbow", 58: "deep:", 59: "field:sower", 60: "desert:tent",
  61: "dusk:shield-sword", 62: "dawn:tomb", 63: "night:candles", 64: "desert:well", 65: "dusk:cup-overflow",
  66: "dawn:cage", 67: "dawn:rings", 68: "dusk:lamp", 69: "dawn:heart:white", 70: "dusk:letter",
  71: "sea:ripples:stone", 72: "dusk:star-path", 73: "dawn:heart:mended", 74: "dusk:thorns", 75: "road:footprints",
  76: "dawn:shepherd", 77: "dawn:parent-child", 78: "dusk:feathers", 79: "dusk:signpost", 80: "dusk:sleeper",
  81: "dusk:sharpen", 82: "dusk:heart:walled", 83: "dusk:tower", 84: "dawn:bread", 85: "dusk:honeycomb",
  86: "dusk:torn-scroll", 87: "desert:bread:water", 88: "dusk:threads", 89: "dusk:helping", 90: "dawn:heart:cross",
  91: "mountains:tree:lush", 92: "field:reaper", 93: "road:walkers", 94: "dusk:farewell", 95: "dawn:hammer",
  96: "night:book:star", 97: "night:orb-companion", 98: "dawn:book:speaking", 99: "night:manger", 100: "field:bread:wheat",
  101: "dusk:torch", 102: "desert:sword", 103: "night:moon-lake",
};

export const TOPIC_BACKGROUNDS = {
  "The Gospel Explained": "dawn",
  "Grace & Assurance": "mountains",
  "Sin & Repentance": "desert",
  "Grief & Comfort": "dusk",
  "Purpose & Calling": "road",
  "Prayer": "night",
  "Worship": "mountains",
  "Friendship": "road",
  "Discipline & Growth": "field",
  "Identity in Christ": "mountains",
  "Peace": "sea",
  "God's Love & Faithfulness": "sea",
  "Heaven & Eternity": "night",
};

// -> { bg, motif, v } or null (null means the plain dark title card).
export function pictureFor(post) {
  const spec = POST_PICTURES[post.id];
  if (spec) {
    const [bg, motif, v] = spec.split(":");
    return { bg, motif: motif || null, v: v || null };
  }
  for (const topic of post.topics || []) if (TOPIC_BACKGROUNDS[topic]) return { bg: TOPIC_BACKGROUNDS[topic], motif: null, v: null };
  return null;
}
