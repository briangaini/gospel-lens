import { getFirebase } from "./firebaseLoader";

// ---------------------------------------------------------------------------
// READ HISTORY — a light, entirely local memory of which posts a visitor has
// opened, kept in their own browser's localStorage. Nothing is sent
// anywhere, no account involved; it just powers a quiet "Continue Reading"
// nudge on Home and a small read-count on the Blogs page. Safe to fail
// silently (private browsing, storage disabled, quota full, etc.) since
// none of this is essential to using the site.
// ---------------------------------------------------------------------------

export const READ_HISTORY_KEY = "gospel-lens-read-history";
// Raised from 100 on 2026-10-14. The cap exists only to stop localStorage and
// the synced cloud doc growing forever, but with posts being added every day
// 100 was about to start silently forgetting older reads (the Blogs page's
// Read/Unread filters and "You've read N of M" all count from this list). 1000
// entries is roughly 30KB, tiny for both localStorage and a Firestore doc, and
// covers years of posts at the current pace.
const READ_HISTORY_MAX = 1000;
// Each entry is { id, readAt } -- a real timestamp per post, not just an id.
// Added 2026-09-11 when read history started syncing to the cloud: merging
// two devices' histories correctly means knowing *when* each was read, not
// just which device happened to write last (see the reconciliation effect
// in GospelLensApp). getReadHistory() transparently migrates the old shape
// (a plain array of ids, from before this) -- a legacy numeric entry gets a
// small synthetic readAt (its own array index) rather than Date.now(), so
// it sorts as older than anything read after the migration, preserving its
// original relative order without claiming a read time that was never
// actually recorded.
export function getReadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READ_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry, i) => (typeof entry === "number" ? { id: entry, readAt: i } : entry));
  } catch {
    return [];
  }
}
// Records a post as read, moving it to the end (most-recent) if it was
// already in the list rather than duplicating it, and caps the list length
// so localStorage usage can't grow unbounded for a long-time reader. Also
// pushes to the cloud when signed in (see syncReadHistoryToCloudIfSignedIn)
// -- fire-and-forget, same as every other sync call in this file.
export function recordPostRead(postId) {
  if (typeof window === "undefined") return;
  try {
    const history = getReadHistory().filter((entry) => entry.id !== postId);
    history.push({ id: postId, readAt: Date.now() });
    history.sort((a, b) => a.readAt - b.readAt);
    window.localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(history.slice(-READ_HISTORY_MAX)));
    syncReadHistoryToCloudIfSignedIn();
  } catch {
    // localStorage unavailable — quietly skip, nothing else depends on this
  }
}
// Merges two read histories by taking, for every post id present in
// either, the LATER of its two readAt timestamps -- then re-sorts and caps
// to the most recent READ_HISTORY_MAX. Unlike Saved/Liked, this is safe to
// run unconditionally on every reconciliation event, not just once ever per
// device: there's no user action anywhere in this app that *removes* an
// entry from read history (nothing "unreads" a post), so a pure union can
// never silently undo a deletion the way it could for Saved/Liked -- the
// bug class that fix had to guard against structurally doesn't exist here.
export function mergeReadHistory(cloudHistory, localHistory) {
  const latestById = new Map();
  for (const entry of cloudHistory) latestById.set(entry.id, entry.readAt);
  for (const entry of localHistory) {
    const existing = latestById.get(entry.id);
    if (existing === undefined || entry.readAt > existing) latestById.set(entry.id, entry.readAt);
  }
  const merged = Array.from(latestById, ([id, readAt]) => ({ id, readAt }));
  merged.sort((a, b) => a.readAt - b.readAt);
  return merged.slice(-READ_HISTORY_MAX);
}
// Order-independent equality for two read-history arrays, comparing both id
// and readAt per entry -- mirrors sameIdSet's role for Saved/Liked, used to
// decide whether a merge result actually changed anything worth writing/
// reloading for.
export function sameReadHistory(a, b) {
  if (a.length !== b.length) return false;
  const mapA = new Map(a.map((entry) => [entry.id, entry.readAt]));
  return b.every((entry) => mapA.get(entry.id) === entry.readAt);
}
// ---------------------------------------------------------------------------
// SAVED POSTS — a deliberate "come back to this" list, distinct from the
// read-history-driven Continue Reading above. Same local-only approach
// (nothing sent anywhere, no account), but this is opt-in per post via the
// bookmark icon rather than automatic on every visit.
// ---------------------------------------------------------------------------

export const SAVED_POSTS_KEY = "gospel-lens-saved-posts";
export function getSavedPostIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function isPostSaved(postId) {
  return getSavedPostIds().includes(postId);
}
// Toggles postId in the saved list and returns the resulting state (true =
// now saved, false = now removed) so a caller can update its own local
// state without a second localStorage read.
export function toggleSavedPost(postId) {
  if (typeof window === "undefined") return false;
  try {
    const ids = getSavedPostIds();
    const idx = ids.indexOf(postId);
    const nowSaved = idx === -1;
    if (nowSaved) ids.push(postId);
    else ids.splice(idx, 1);
    window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(ids));
    syncListsToCloudIfSignedIn();
    return nowSaved;
  } catch {
    return isPostSaved(postId);
  }
}
// ---------------------------------------------------------------------------
// LIKED POSTS — deliberately a separate list from Saved, per Brian's
// explicit choice: "Saved" is "I want to come back and finish/read this,"
// "Liked" is a lighter reaction, "this one meant something to me," without
// necessarily intending to revisit it. Same fully-local approach, own
// localStorage key, own icon (Heart), own page. Mirrors the Saved Posts
// helpers exactly on purpose, for the same reason and the same tradeoffs.
// ---------------------------------------------------------------------------

export const LIKED_POSTS_KEY = "gospel-lens-liked-posts";
// A tiny cached { email } object (NOT the real Firebase user, just enough
// to render correctly), written every time a real sign-in is confirmed and
// cleared on sign-out. Purely a UI optimization -- see the `user` useState
// initializer in GospelLensApp for why this exists: Firebase is lazy-
// loaded for page-weight reasons (see getFirebase() above), so on every
// page load there's a real gap, however brief, before the app actually
// knows whether someone's signed in. Without this cache, a returning
// signed-in visitor would see the "not signed in" copy flash for a moment
// on every single page load/refresh before flipping to the real state --
// exactly what Brian reported. Seeding the initial state from this cache
// means a repeat signed-in visitor sees the correct copy from the very
// first render, and Firebase's real check (once it loads) just quietly
// confirms it rather than visibly correcting it.
export const CACHED_USER_KEY = "gospel-lens-cached-user";

// True if someone has signed in on this browser (the sign-in remembers their email
// here). Everything that talks to Firebase checks this first, so a visitor who has never
// signed in never downloads Firebase at all.
export function hasSignedInBefore() {
  try {
    return Boolean(window.localStorage.getItem(CACHED_USER_KEY));
  } catch {
    return false;
  }
}
// Order-independent equality for two arrays of post ids -- used to decide
// whether an incoming cloud update actually changes anything worth acting
// on. Comparing plain arrays index-by-index would treat differently-
// ordered-but-identical sets as "different" and cause needless writes/
// reloads; these lists are conceptually sets, not ordered lists.
export function sameIdSet(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}
// Persisted (localStorage, not sessionStorage) list of uids this specific
// browser has already run its one-time "merge local into the account"
// reconciliation for -- see the onSnapshot handler in GospelLensApp for
// why this needs to be permanent, not per-session. A pure union-merge is
// safe to run once, to fold in whatever was saved/liked locally before
// ever signing in -- but a union can only ever ADD, never remove, so
// running it on EVERY incoming update would silently resurrect a post
// unsaved/unliked on another device the next time this browser reloads
// with stale local data (a real second bug caught before shipping, not
// hypothetical -- verified directly: stale local [1,2,3] plus a cloud
// that had already dropped to [1,2] after a removal elsewhere produces a
// union of [1,2,3], which would get written straight back to the cloud,
// undoing the removal). Past that one genuine first-contact merge, every
// later update trusts the cloud's exact contents instead -- see below.
const MERGED_UIDS_KEY = "gospel-lens-merged-uids";
export function hasMergedUid(uid) {
  try {
    const raw = window.localStorage.getItem(MERGED_UIDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && parsed.includes(uid);
  } catch {
    return false;
  }
}
export function markUidMerged(uid) {
  try {
    const raw = window.localStorage.getItem(MERGED_UIDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const ids = Array.isArray(parsed) ? parsed : [];
    if (!ids.includes(uid)) {
      ids.push(uid);
      window.localStorage.setItem(MERGED_UIDS_KEY, JSON.stringify(ids));
    }
  } catch {}
}
export function getLikedPostIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIKED_POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function isPostLiked(postId) {
  return getLikedPostIds().includes(postId);
}
export function toggleLikedPost(postId) {
  if (typeof window === "undefined") return false;
  try {
    const ids = getLikedPostIds();
    const idx = ids.indexOf(postId);
    const nowLiked = idx === -1;
    if (nowLiked) ids.push(postId);
    else ids.splice(idx, 1);
    window.localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(ids));
    syncListsToCloudIfSignedIn();
    return nowLiked;
  } catch {
    return isPostLiked(postId);
  }
}
// Fire-and-forget: whenever a save/like toggle happens locally AND someone
// is actually signed in, push the current full local snapshot of both
// lists to their Firestore doc. Writes both lists together (not just the
// one that changed) -- they're tiny (a handful of ids at most) and this
// avoids any chance of the two lists drifting out of sync with each other
// in Firestore. Deliberately silent on failure (e.g. offline, or nobody's
// signed in, so Firebase is never even fetched) -- the local
// save/like itself already succeeded and is what the UI reflects; a
// missed cloud sync just means the next successful toggle (or the next
// sign-in-triggered merge) reconciles it, not a lost user action.
function syncListsToCloudIfSignedIn() {
  if (!hasSignedInBefore()) return;
  getFirebase()
    .then((fb) => {
      const uid = fb.auth.currentUser?.uid;
      if (!uid) return;
      return fb.writeCloudLists(uid, { savedPostIds: getSavedPostIds(), likedPostIds: getLikedPostIds() });
    })
    .catch(() => {});
}
// Same fire-and-forget pattern as syncListsToCloudIfSignedIn, for read
// history -- called from recordPostRead. Read history was added to the
// synced fields 2026-09-11, per Brian's explicit ask to sync "all those
// which normally would be synced when someone logs in," not just Saved/
// Liked -- Continue Reading was still stuck per-browser otherwise.
function syncReadHistoryToCloudIfSignedIn() {
  if (!hasSignedInBefore()) return;
  getFirebase()
    .then((fb) => {
      const uid = fb.auth.currentUser?.uid;
      if (!uid) return;
      return fb.writeCloudLists(uid, { readHistory: getReadHistory() });
    })
    .catch(() => {});
}
// Same pattern again, for the dark-mode preference -- called from
// toggleDark. Unlike Saved/Liked/read-history (all lists), theme is a
// single value, so there's no merge/union concept for it -- see the
// reconciliation effect for how "establish once, then trust the cloud"
// applies to a scalar preference instead.
export function syncThemeToCloudIfSignedIn(theme) {
  if (!hasSignedInBefore()) return;
  getFirebase()
    .then((fb) => {
      const uid = fb.auth.currentUser?.uid;
      if (!uid) return;
      return fb.writeCloudLists(uid, { theme });
    })
    .catch(() => {});
}
// ---------------------------------------------------------------------------
// REFLECTION JOURNAL -- a private "write your answer" box under each post's
// Reflection Questions, plus a separate, free-form prayer list. Added
// 2026-10-02, demoed and approved first. Local-first, same as everything
// else (localStorage, nothing sent anywhere until signed in), syncing to the
// same per-user Firestore doc Saved/Liked/read-history/theme already use --
// no new backend, no new account system.
//
// Unlike those earlier synced lists, a journal entry or prayer request can
// be genuinely edited and deleted by the person who wrote it, not just
// added -- a plain id-list union (Saved/Liked's original design) can only
// ever ADD, so it would silently resurrect a deletion made on another
// device, exactly the bug that had to be fixed there. Instead, every record
// here carries its own `updatedAt` timestamp, and deleting one sets
// `deleted: true` on it rather than removing it -- a tombstone, not an
// absence. That makes a plain "whichever device touched this record most
// recently wins" merge (mergeByUpdatedAt, below) safe to run
// unconditionally, every time, for both edits AND deletions -- no separate
// one-time "first contact" merge phase needed the way Saved/Liked required.
//
// This also means journal/prayer state never needs a page reload to stay
// correct across devices, unlike Saved/Liked (which still does, see the
// reconciliation effect in GospelLensApp): PostBody and JournalView read
// this data from props lifted into GospelLensApp's own state, not from a
// mount-once useState initializer the way a bookmark/heart icon does, so an
// incoming cloud update can just update that state directly and have every
// open view pick it up immediately.
// ---------------------------------------------------------------------------

export const JOURNAL_KEY = "gospel-lens-journal-entries";
export const PRAYER_KEY = "gospel-lens-prayer-list";
export function getJournalEntriesRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(JOURNAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
// A post's reflection answer is keyed by post id + question index, one
// answer per question -- saving over an existing one replaces it rather
// than appending a duplicate. Passing an empty/whitespace-only string
// deletes the entry (sets its tombstone) rather than storing a blank
// answer, so clearing the box in the UI and deleting it are the same action.
export function saveJournalAnswer(postId, qIndex, text) {
  if (typeof window === "undefined") return getJournalEntriesRaw();
  try {
    const id = `${postId}-${qIndex}`;
    const trimmed = text.trim();
    const entries = getJournalEntriesRaw().filter((e) => e.id !== id);
    entries.push({ id, postId, qIndex, text: trimmed, updatedAt: Date.now(), deleted: !trimmed });
    window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    syncJournalToCloudIfSignedIn();
    return entries;
  } catch {
    return getJournalEntriesRaw();
  }
}
// Looks up the saved (non-deleted) answer text for one question, or "" if
// there isn't one -- entries is the raw array (tombstones included), as
// held in GospelLensApp's lifted state.
export function getJournalAnswerText(entries, postId, qIndex) {
  const entry = entries.find((e) => e.postId === postId && e.qIndex === qIndex && !e.deleted);
  return entry ? entry.text : "";
}
export function getPrayerListRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRAYER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
export function addPrayerRequest(text) {
  if (typeof window === "undefined") return getPrayerListRaw();
  try {
    const trimmed = text.trim();
    if (!trimmed) return getPrayerListRaw();
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const list = getPrayerListRaw();
    list.push({ id, text: trimmed, createdAt: Date.now(), answeredAt: null, updatedAt: Date.now(), deleted: false });
    window.localStorage.setItem(PRAYER_KEY, JSON.stringify(list));
    syncPrayerToCloudIfSignedIn();
    return list;
  } catch {
    return getPrayerListRaw();
  }
}
export function togglePrayerAnswered(id) {
  if (typeof window === "undefined") return getPrayerListRaw();
  try {
    const list = getPrayerListRaw();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return list;
    const entry = list[idx];
    list[idx] = { ...entry, answeredAt: entry.answeredAt ? null : Date.now(), updatedAt: Date.now() };
    window.localStorage.setItem(PRAYER_KEY, JSON.stringify(list));
    syncPrayerToCloudIfSignedIn();
    return list;
  } catch {
    return getPrayerListRaw();
  }
}
export function deletePrayerRequest(id) {
  if (typeof window === "undefined") return getPrayerListRaw();
  try {
    const list = getPrayerListRaw();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return list;
    list[idx] = { ...list[idx], deleted: true, updatedAt: Date.now() };
    window.localStorage.setItem(PRAYER_KEY, JSON.stringify(list));
    syncPrayerToCloudIfSignedIn();
    return list;
  } catch {
    return getPrayerListRaw();
  }
}
// Generic per-record "latest updatedAt wins" merge -- shared by both
// journalEntries and prayerList, since both use the same {id, updatedAt,
// deleted} shape. See the section comment above for why this is safe to run
// unconditionally, unlike Saved/Liked's old plain-id-list union.
export function mergeByUpdatedAt(cloudList, localList) {
  const byId = new Map();
  for (const entry of cloudList) byId.set(entry.id, entry);
  for (const entry of localList) {
    const existing = byId.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) byId.set(entry.id, entry);
  }
  return Array.from(byId.values());
}
// Order-independent equality for two record lists, comparing id + updatedAt
// per record (mirrors sameReadHistory's role) -- any real change to a
// record's text/deleted/answeredAt necessarily bumps its own updatedAt, so
// this is a valid full-equality check without comparing every field.
export function sameRecordSet(a, b) {
  if (a.length !== b.length) return false;
  const mapA = new Map(a.map((e) => [e.id, e.updatedAt]));
  return b.every((e) => mapA.get(e.id) === e.updatedAt);
}
function syncJournalToCloudIfSignedIn() {
  if (!hasSignedInBefore()) return;
  getFirebase()
    .then((fb) => {
      const uid = fb.auth.currentUser?.uid;
      if (!uid) return;
      return fb.writeCloudLists(uid, { journalEntries: getJournalEntriesRaw() });
    })
    .catch(() => {});
}
function syncPrayerToCloudIfSignedIn() {
  if (!hasSignedInBefore()) return;
  getFirebase()
    .then((fb) => {
      const uid = fb.auth.currentUser?.uid;
      if (!uid) return;
      return fb.writeCloudLists(uid, { prayerList: getPrayerListRaw() });
    })
    .catch(() => {});
}
