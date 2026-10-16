// Loading a piece of the site on demand (a page, a post, search text) can fail in
// one real situation: a tab that has been open since before a deploy asks for a
// file whose name changed, and the server no longer has the old one. Reloading
// fetches the current page and the current file names, so that is what this does,
// at most once every 15 seconds (so a genuine outage can't turn into a reload loop).
const KEY = "gospel-lens-chunk-reload";

export function importOrReload(factory) {
  return factory().catch((err) => {
    let recent = false;
    try {
      const last = Number(window.sessionStorage.getItem(KEY) || 0);
      recent = Date.now() - last < 15000;
      if (!recent) window.sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      recent = true; // can't remember, so don't risk a loop
    }
    if (recent) throw err;
    window.location.reload();
    return new Promise(() => {}); // never settles; the page is going away
  });
}

// Runs `factory` once and remembers the answer.
export function once(factory) {
  let promise = null;
  return () => {
    if (!promise) {
      promise = factory().catch((err) => {
        promise = null;
        throw err;
      });
    }
    return promise;
  };
}
