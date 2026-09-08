// ---------------------------------------------------------------------------
// FIREBASE -- Google sign-in + cross-device sync for Saved/Liked posts
// ---------------------------------------------------------------------------
// Added 2026-09-07, per Brian's explicit request: everything on this site
// (saved posts, liked posts, read history, dark mode) was purely local to
// one browser -- nothing ever left the device, which is also exactly why it
// didn't follow him to another device or browser. This is the one place in
// the app that genuinely needs a backend, so it's the one place that has
// one now. Scope is deliberately narrow: only Saved Posts and Liked Posts
// sync to an account. Dark mode and read history stay local-only -- Brian
// only asked about saved/liked, and there's no reason to widen what leaves
// the browser beyond what was actually requested.
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
// likedPostIds: [...] }. Deliberately just two arrays of post ids, mirroring
// the exact shape already used in localStorage -- this is a sync target,
// not a redesign of the data model.
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
      callback({ savedPostIds: [], likedPostIds: [] });
      return;
    }
    const data = snap.data();
    callback({
      savedPostIds: Array.isArray(data.savedPostIds) ? data.savedPostIds : [],
      likedPostIds: Array.isArray(data.likedPostIds) ? data.likedPostIds : [],
    });
  });
}

// Overwrites the whole document with the given lists. Used both for the
// merge reconciliation in App.jsx's onAuthChange handler and for every
// individual save/like toggle -- these lists are small (a handful of post
// ids at most), so a full overwrite is simpler and cheap, not worth the
// complexity of arrayUnion/arrayRemove.
export async function writeCloudLists(uid, { savedPostIds, likedPostIds }) {
  await setDoc(userDocRef(uid), { savedPostIds, likedPostIds }, { merge: true });
}
