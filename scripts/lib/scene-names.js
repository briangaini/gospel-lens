// Which picture a post's share card gets. Plain data, no imports, so the content
// checker and the card builder can both read it.
//
// A post can name its own with "scene" in its file. Otherwise the picture comes from
// the post's first topic (topics are checked in the order they appear in POST_TAGS).
// A post with neither falls back to the plain dark title card.

export const SCENE_NAMES = ["road", "walkers", "sea", "night", "mountains", "desert", "hill", "window"];

export const TOPIC_SCENES = {
  "The Gospel Explained": "hill",
  "Grace & Assurance": "mountains",
  "Sin & Repentance": "desert",
  "Grief & Comfort": "window",
  "Purpose & Calling": "road",
  "Prayer": "night",
  "Worship": "mountains",
  "Friendship": "walkers",
  "Discipline & Growth": "road",
  "Identity in Christ": "mountains",
  "Peace": "sea",
  "God's Love & Faithfulness": "sea",
  "Heaven & Eternity": "night",
};

export function sceneFor(post) {
  if (post.scene) return post.scene;
  for (const topic of post.topics || []) if (TOPIC_SCENES[topic]) return TOPIC_SCENES[topic];
  return null;
}
