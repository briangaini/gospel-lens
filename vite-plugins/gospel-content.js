// Feeds the post files in src/content/posts to the site as small, separate pieces,
// so a visitor only downloads what the page they are on needs:
//   virtual:gospel-content-index       every post's details, no body (always loaded, ~26 KB)
//   virtual:gospel-content-search      body text for search (loaded when someone searches)
//   virtual:gospel-content-scripture   verses for the Scripture Index (loaded by that page)
//   virtual:gospel-content-reflections reflection questions (loaded by the Journal)
// Each post's body is its own file, loaded on demand (see src/lib/posts.js).
// In `npm run dev` it also watches the posts folder, so a new or edited post shows up
// after a refresh without restarting.

import {
  POSTS_DIR,
  readPosts,
  buildIndex,
  buildSearchText,
  buildScriptureEntries,
  buildReflections,
} from "../scripts/lib/content.js";

const MODULES = {
  "virtual:gospel-content-index": (posts) => buildIndex(posts),
  "virtual:gospel-content-search": (posts) => buildSearchText(posts),
  "virtual:gospel-content-scripture": (posts) => buildScriptureEntries(posts),
  "virtual:gospel-content-reflections": (posts) => buildReflections(posts),
};

export default function gospelContent() {
  return {
    name: "gospel-content",
    resolveId(id) {
      if (MODULES[id]) return "\0" + id;
    },
    load(id) {
      const name = id.startsWith("\0") ? id.slice(1) : null;
      if (!name || !MODULES[name]) return null;
      return `export default ${JSON.stringify(MODULES[name](readPosts()))};`;
    },
    configureServer(server) {
      server.watcher.add(POSTS_DIR);
      const refresh = (file) => {
        if (!file.startsWith(POSTS_DIR)) return;
        for (const name of Object.keys(MODULES)) {
          const mod = server.moduleGraph.getModuleById("\0" + name);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}
