// The parts of the post data that only some pages need. Each is fetched the first
// time it's asked for and remembered after that (see vite-plugins/gospel-content.js).
import { importOrReload, once } from "./chunkSafe";

// Body text of every post, lower-cased, for the Blogs search.
export const loadSearchText = once(() => importOrReload(() => import("virtual:gospel-content-search")).then((m) => m.default));

// Every Scripture Focus box with its first verse, for the Scripture Index.
export const loadScriptureEntries = once(() => importOrReload(() => import("virtual:gospel-content-scripture")).then((m) => m.default));

// The reflection questions of every post, for the Reflection Journal.
export const loadReflections = once(() => importOrReload(() => import("virtual:gospel-content-reflections")).then((m) => m.default));
