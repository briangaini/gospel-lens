// ---------------------------------------------------------------------------
// FIREBASE -- Google sign-in + cross-device sync
// ---------------------------------------------------------------------------
// Added 2026-09-07, per Brian's explicit request: everything on this site
// was purely local to one browser -- nothing ever left the device, which is
// also exactly why it didn't follow him to another device or browser. This
// is the one place in the app that genuinely needs a backend, so it's the
// one place that has one now.
//
// Scope, as of 2026-09-11: Saved Posts, Liked Posts, read history
// ("Continue Reading" + the read-count stat), and the dark-mode preference
// all sync to an account now -- Brian's explicit ask, to cover "all those
// which normally would be synced when someone logs in their account," not
// just the two he originally requested. Nothing else does -- there's no
// other meaningful per-visitor state on this site to sync.
//
// `firebaseConfig` below is NOT a secret, unlike the Buttondown API key
// incident earlier in this project's history -- it's safe to be visible in
// client code. It identifies which Firebase project this app talks to;
// actual security is enforced by the Firestore security rules (see
// firestore.rules in the repo root), not by hiding this config. Brian
// created this project himself in the Firebase console (2026-09-07),
// enabled Google as a sign-in provider, and created the Firestore database
// -- this file just wires the app up to what he already set up.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTU34vwUnRvJreTLVEUdSt4H1fJyUsf_o",
  authDomain: "gospel-lens-2fb51.firebaseapp.com",
  projectId: "gospel-lens-2fb51",
  storageBucket: "gospel-lens-2fb51.firebasestorage.app",
  messagingSenderId: "214980155384",
  appId: "1:214980155384:web:3a95e4e3fd68907d2ce80d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutOfGoogle() {
  return signOut(auth);
}

// Fires immediately with the current user (or null), then again on every
// sign-in/sign-out. Returns the unsubscribe function, same shape as every
// other listener-registration helper in this app (e.g. window event
// listeners in useEffect cleanups).
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// One document per signed-in user: users/{uid} -> { savedPostIds: [...],
// likedPostIds: [...], readHistory: [{id, readAt}...], theme: "dark"|"light" }.
// Mirrors the exact shapes already used in localStorage -- this is a sync
// target, not a redesign of the data model. `readHistory` carries a real
// timestamp per entry (not just an id) specifically so two devices' histories
// can be merged by *when* something was actually read, not just by which
// device happened to write last -- see the merge logic in App.jsx.
function userDocRef(uid) {
  return doc(db, "users", uid);
}

// Live subscription, not a one-time read -- added 2026-09-08 after Brian
// found that a change made on one device (e.g. saving a post on his
// laptop) took "many refreshes and some time" to show up on another
// device (his phone). The original design only ever read the cloud lists
// once, at the moment of signing in -- after that, a browser tab had no
// way to learn about a change made elsewhere short of a fresh sign-in.
// onSnapshot instead keeps pushing the current server state to every
// subscribed callback as it changes, typically within a second or two of
// a write landing anywhere. Returns the unsubscribe function.
export function subscribeToCloudLists(uid, callback) {
  return onSnapshot(userDocRef(uid), (snap) => {
    if (!snap.exists()) {
      callback({ savedPostIds: [], likedPostIds: [], readHistory: [], theme: null });
      return;
    }
    const data = snap.data();
    callback({
      savedPostIds: Array.isArray(data.savedPostIds) ? data.savedPostIds : [],
      likedPostIds: Array.isArray(data.likedPostIds) ? data.likedPostIds : [],
      readHistory: Array.isArray(data.readHistory) ? data.readHistory : [],
      theme: typeof data.theme === "string" ? data.theme : null,
    });
  });
}

// Partial update -- only the fields actually passed get written, everything
// else in the document is left untouched (setDoc's `merge: true` already
// merges at the top level, but every caller here only ever passes a subset
// of fields, e.g. a save/like toggle never touches readHistory or theme, so
// this explicitly builds just the payload that was actually given rather
// than writing `undefined` over fields the caller didn't mean to touch).
// Used for the merge reconciliation in App.jsx's onAuthChange handler, for
// every individual save/like toggle, for each new read-history entry, and
// for a dark-mode toggle -- these are all small (a handful of ids/entries at
// most), so a full-field overwrite is simpler than arrayUnion/arrayRemove.
export async function writeCloudLists(uid, fields) {
  const payload = {};
  if (fields.savedPostIds !== undefined) payload.savedPostIds = fields.savedPostIds;
  if (fields.likedPostIds !== undefined) payload.likedPostIds = fields.likedPostIds;
  if (fields.readHistory !== undefined) payload.readHistory = fields.readHistory;
  if (fields.theme !== undefined) payload.theme = fields.theme;
  await setDoc(userDocRef(uid), payload, { merge: true });
}
