import { useEffect, useState } from "react";
import { loadSearchText } from "./lazyContent";
import { tagsForPost } from "./posts";

// Builds one lowercase blob of everything searchable in a post — title,
// excerpt, author, category, topic tags, and every word in the body — so
// a search for any keyword anywhere in a post actually finds it.
//
// The body text isn't part of the always-loaded post details, so it is fetched
// the first time someone actually searches (useSearchText below). Until it has
// arrived, a search matches on everything except the body, and the results
// fill in the moment it lands.
let bodyTextById = null;
const searchIndexCache = new Map();

export function getSearchIndex(post) {
  if (searchIndexCache.has(post.id)) return searchIndexCache.get(post.id);

  const index = [post.title, post.excerpt, post.author || "", post.category, tagsForPost(post.id).join(" "), bodyTextById ? bodyTextById[post.id] || "" : ""]
    .join(" ")
    .toLowerCase();

  // Only remember a complete answer, never the body-less one.
  if (bodyTextById) searchIndexCache.set(post.id, index);
  return index;
}

// Call with `needed` true once a search is happening. Returns true once the body
// text is available (use it as a dependency so results recompute when it lands).
export function useSearchText(needed) {
  const [ready, setReady] = useState(() => Boolean(bodyTextById));
  useEffect(() => {
    if (!needed || bodyTextById) return;
    let live = true;
    loadSearchText().then((text) => {
      bodyTextById = text;
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, [needed]);
  return ready || Boolean(bodyTextById);
}

// Starts fetching the search text early (for example when the search box is focused).
export function warmSearchText() {
  if (!bodyTextById) loadSearchText().then((text) => (bodyTextById = text)).catch(() => {});
}
