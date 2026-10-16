// Firebase (Google sign-in + Saved/Liked sync, see src/firebase.js) is
// loaded lazily via dynamic import(), not a static import up here --
// statically importing it nearly TRIPLED this app's main JS bundle (365KB
// -> 1030KB gzip'd, measured directly via a build before/after), which
// every visitor would pay for on first load whether or not they ever sign
// in. Vite automatically splits a dynamic import() into its own separate
// chunk, so the bundle every visitor actually downloads on first paint
// stays exactly as small as before this feature existed; Firebase's code
// only downloads for someone who's already signed in from a previous visit
// (checked once on mount, so returning users don't have to re-click sign-in
// every time) or who actively clicks "Sign in with Google." `getFirebase()`
// memoizes the import so it only ever fetches once per page load.
let firebaseModulePromise = null;
export function getFirebase() {
  if (!firebaseModulePromise) {
    // If the dynamic import itself fails -- e.g. a visitor's browser is
    // still holding an older cached page from before a deploy, whose main
    // bundle references a chunk filename that a newer deploy no longer
    // serves (verified directly: Vercel returns a genuine 404 for an old
    // deploy's asset once a newer one has superseded it, not a soft
    // fallback) -- fall back to a full page reload, which fetches the
    // current index.html and therefore the current, correct chunk
    // references, self-healing the same way the site's existing PWA
    // auto-update mechanism already does for the main bundle itself.
    // Without this, a failed import here left "Sign in with Google"
    // silently doing nothing at all -- no error, no feedback, just a
    // dead button -- which is worse than a visible reload.
    firebaseModulePromise = import("../firebase").catch((err) => {
      firebaseModulePromise = null;
      window.location.reload();
      throw err;
    });
  }
  return firebaseModulePromise;
}
