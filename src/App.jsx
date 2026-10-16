import { Suspense, useEffect, useRef, useState } from "react";
import { CACHED_USER_KEY, hasSignedInBefore, JOURNAL_KEY, LIKED_POSTS_KEY, PRAYER_KEY, READ_HISTORY_KEY, SAVED_POSTS_KEY, addPrayerRequest, deletePrayerRequest, getJournalEntriesRaw, getLikedPostIds, getPrayerListRaw, getReadHistory, getSavedPostIds, hasMergedUid, markUidMerged, mergeByUpdatedAt, mergeReadHistory, sameIdSet, sameReadHistory, sameRecordSet, saveJournalAnswer, syncThemeToCloudIfSignedIn, togglePrayerAnswered } from "./lib/storage";
import { getFirebase } from "./lib/firebaseLoader";
import { POSTS, getPostBySlug } from "./lib/posts";
import { slugify } from "./lib/slug";
import { AUTHORS } from "./content/authors";
import { POST_TAGS } from "./content/topics";
import { SERIES } from "./content/series";
import { Nav } from "./components/Nav";
import {
  AboutView,
  BlogListView,
  CollectionView,
  HomeView,
  JournalView,
  LikedPostsView,
  NotFoundView,
  ReadingPlanView,
  SavedPostsView,
  ScriptureIndexView,
  SeriesView,
  SinglePostView,
  TopicView,
} from "./views/lazy";
import { PostRoute } from "./views/PostRoute";
import { loadPostBody } from "./lib/posts";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";

// Starts downloading the page (and, for a post, its text) that the address bar
// points at, right when the app's code arrives -- before React has even drawn
// anything -- so the page's own code and its content download side by side
// instead of one after the other.
function preloadForAddress() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const byPath = {
    "/": HomeView,
    "/blog": BlogListView,
    "/about": AboutView,
    "/saved": SavedPostsView,
    "/liked": LikedPostsView,
    "/journal": JournalView,
    "/verses": ScriptureIndexView,
    "/start-here": ReadingPlanView,
  };
  let view = byPath[path];
  if (!view && path.startsWith("/topics/")) view = TopicView;
  else if (!view && path.startsWith("/collection/")) view = CollectionView;
  else if (!view && path.startsWith("/series/")) view = SeriesView;
  else if (!view) {
    const post = getPostBySlug(path.slice(1));
    if (post) {
      view = SinglePostView;
      loadPostBody(post.id).catch(() => {});
    }
  }
  view?.preload().catch(() => {});
}
if (typeof window !== "undefined") preloadForAddress();

// Once the page is up and the browser is idle, quietly fetch the two pages most
// likely to come next (a post, and the Blogs list) so opening them feels instant.
function prefetchLikelyPages() {
  const run = () => {
    SinglePostView.preload().catch(() => {});
    BlogListView.preload().catch(() => {});
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
  else window.setTimeout(run, 2500);
}

export default function GospelLensApp() {
  // Which page is showing. Starts as null and is set from the address bar right after the
  // first render (see applyLocation below), so the page that isn't being visited is never
  // even downloaded (it used to start on "home" and render the homepage for a moment).
  const [view, setView] = useState(null);
  useEffect(() => {
    prefetchLikelyPages();
  }, []);
  const [activePost, setActivePost] = useState(null);
  // Whether the currently-open post was reached by actually following the
  // 4-Day Reading Plan (from its overview, or by tapping "Continue" from the
  // previous day) -- as opposed to landing on the exact same post through
  // the Blogs page, search, a share link, Saved/Liked, related posts, or
  // Older/Newer nav. The plan's banner/"continue to next day" UI in
  // SinglePostView is gated on this, not just on whether the post happens to
  // be one of the 4 plan posts -- Brian was explicit that a plan post read
  // outside the plan should look like any other post. Deliberately plain
  // React state, not persisted -- a reload or a direct link is exactly the
  // "not currently in the plan" case this is meant to catch.
  const [cameFromPlan, setCameFromPlan] = useState(false);
  // How many of OUR OWN pushState navigations sit behind the current history
  // entry -- lets goBack() (below) tell "there's an in-app page to return
  // to" apart from "this is the first thing loaded this session, going back
  // would leave the site entirely." Read from history.state.navDepth (set
  // by pushHistoryState below) rather than a plain incrementing counter, so
  // it stays correct through real forward/back navigation too, not just
  // our own pushes. Added 2026-09-11 fixing a real Brian report: "Back to
  // Blogs" always landed on the Blogs list no matter where you actually
  // came from (e.g. a post reached via the Scripture Index), and he
  // specifically needs this to work with no dependency on the browser's own
  // back button, since the site is also used installed as a desktop app,
  // which has no visible back/forward chrome at all -- window.history.back()
  // still works perfectly there (it's a plain web-platform API, unrelated
  // to whether the browser draws a back button), it just needed our own
  // in-app "Back" buttons to actually call it instead of hardcoding /blog.
  const navDepthRef = useRef(0);
  const [activeAuthor, setActiveAuthor] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // The inline script in index.html already applied the right class to
  // <html> before this ever mounts (saved localStorage choice, else the
  // system's prefers-color-scheme) — read that back rather than always
  // starting from false, so state and DOM agree from the first render
  // instead of a toggle being needed to "notice" dark mode is already on.
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const [navSearch, setNavSearch] = useState("");
  // Bumped to remount the Blogs page (clearing its filters) whenever Blogs is
  // opened fresh from the nav or a nav search.
  const [blogKey, setBlogKey] = useState(0);
  // Signed-in Firebase user, or null. Added 2026-09-07 so Saved/Liked posts
  // can follow someone across devices/browsers instead of living only in
  // one browser's localStorage -- see src/firebase.js for the "why" and
  // what this deliberately does NOT touch (dark mode, read history stay
  // local-only; Brian only asked about saved/liked). Seeded from a cached
  // { email } (see CACHED_USER_KEY above), not always null, so a repeat
  // signed-in visitor's very first render already shows the right sign-in
  // state instead of a "not signed in" flash that then corrects itself
  // once Firebase's real, lazily-loaded check resolves a moment later.
  const [user, setUser] = useState(() => {
    try {
      const cached = window.localStorage.getItem(CACHED_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Reflection Journal + prayer list, lifted up here (rather than read via a
  // mount-once useState initializer the way Saved/Liked's isPostSaved/
  // isPostLiked are) so both PostBody's inline answer boxes and JournalView
  // read the same live state -- a cross-device sync landing in the
  // reconciliation effect below can update this directly and have every
  // open view reflect it immediately, with no page reload needed at all.
  const [journalEntries, setJournalEntries] = useState(() => getJournalEntriesRaw());
  const [prayerList, setPrayerList] = useState(() => getPrayerListRaw());

  const handleSaveAnswer = (postId, qIndex, text) => setJournalEntries(saveJournalAnswer(postId, qIndex, text));
  const handleAddPrayer = (text) => setPrayerList(addPrayerRequest(text));
  const handleTogglePrayerAnswered = (id) => setPrayerList(togglePrayerAnswered(id));
  const handleDeletePrayer = (id) => setPrayerList(deletePrayerRequest(id));

  useEffect(() => {
    let unsubscribeAuth = () => {};
    let unsubscribeSnapshot = () => {};
    let cancelled = false;
    // getFirebase() runs inside this effect (not at module load), so it
    // fires after the initial page has already rendered -- not before or
    // during it. `onAuthStateChanged` always delivers the CURRENT sign-in
    // state the instant something subscribes, even if the actual sign-in
    // happened earlier (e.g. from a previous visit, or because someone
    // clicked "Sign in with Google" before this promise resolved) -- so
    // deferring the subscription to after first paint doesn't risk missing
    // or racing a sign-in, it just avoids making every visitor wait on
    // Firebase's JS before they see the page at all.
    // Firebase is about 165 KB compressed, and only matters to someone who is signed in (or
    // is about to sign in), so a visitor who has never signed in on this browser doesn't
    // download it at all. Signing in remembers the email in CACHED_USER_KEY (below), which is
    // how this decides. handleSignIn loads Firebase itself when the button is pressed.
    if (!hasSignedInBefore()) return undefined;

    getFirebase().then((fb) => {
      if (cancelled) return;
      unsubscribeAuth = fb.onAuthChange((firebaseUser) => {
        setUser(firebaseUser);
        // Tear down any previous doc subscription first -- covers signing
        // out, and signing into a *different* account without a full page
        // reload in between.
        unsubscribeSnapshot();
        unsubscribeSnapshot = () => {};

        if (!firebaseUser) {
          try {
            window.localStorage.removeItem(CACHED_USER_KEY);
          } catch {}
          return;
        }
        try {
          window.localStorage.setItem(CACHED_USER_KEY, JSON.stringify({ email: firebaseUser.email }));
        } catch {}

        // Live subscription, not a one-time read -- added 2026-09-08 after
        // Brian found a change made on one device took "many refreshes and
        // some time" to reach another. This fires immediately with the
        // current server state, then again every time the doc actually
        // changes (from any device, including this one's own writes).
        // Extended 2026-09-11 to also reconcile read history and dark mode,
        // alongside Saved/Liked -- Brian's explicit ask to sync "all those
        // which normally would be synced," not just the two he originally
        // named.
        //
        // Saved/Liked: two deliberately different phases, not the same
        // logic every time -- caught a real second bug before shipping by
        // actually tracing a removal scenario, not just an addition: a pure
        // union-merge run on every event can only ever ADD ids, never
        // remove them, so if this were unconditional, unsaving a post on
        // one device would get silently undone the next time ANY other
        // device reloaded with stale local data (verified directly: stale
        // local [1,2,3] plus a cloud that had already dropped to [1,2]
        // unions back to [1,2,3] and gets written straight back to the
        // cloud).
        //
        // - The FIRST time this browser ever sees THIS uid's cloud data
        //   (tracked permanently via hasMergedUid/markUidMerged, not per
        //   session) -- union-merge cloud with whatever's already saved/
        //   liked locally, so nothing saved before ever signing in gets
        //   lost. This is the one and only place a removal can be
        //   silently "undone," and only for the narrow, one-time case of
        //   reconciling pre-existing local data into a fresh account.
        // - Every event after that first one, on this device, forever --
        //   trust the cloud's exact contents directly, no union. This is
        //   what actually lets a removal made elsewhere propagate
        //   correctly, and is safe for this device's OWN pending writes
        //   too: Firestore's snapshot listener reflects a client's own
        //   in-flight write immediately (not just after server
        //   confirmation), so by the time this fires for a local toggle,
        //   `cloud` already matches what was just written locally.
        //
        // Read history: safe to union-merge UNCONDITIONALLY on every event,
        // not gated by hasMergedUid the way Saved/Liked are -- nothing ever
        // "unreads" a post, so there's no removal a union could accidentally
        // resurrect-then-undo the way there was for Saved/Liked. Merges by
        // the LATER of the two timestamps per post id (see
        // mergeReadHistory), so "Continue Reading" always reflects whichever
        // device actually read something most recently, not just whichever
        // device wrote to Firestore last.
        //
        // Theme: a single value, not a list, so "merge" doesn't apply --
        // instead, establish it once (if the cloud doesn't have one yet,
        // push whatever this device is currently using) and trust the cloud
        // from then on, the same "establish once, then trust" shape as
        // Saved/Liked's post-first-contact phase, just without a union step
        // since there's nothing to union for a scalar.
        unsubscribeSnapshot = fb.subscribeToCloudLists(firebaseUser.uid, (cloud) => {
          const localSaved = getSavedPostIds();
          const localLiked = getLikedPostIds();
          const localHistory = getReadHistory();
          const localTheme = window.localStorage.getItem("gospel-lens-theme");
          const localJournal = getJournalEntriesRaw();
          const localPrayer = getPrayerListRaw();

          let nextSaved = cloud.savedPostIds;
          let nextLiked = cloud.likedPostIds;
          let cloudFieldsNeedingUpdate = {};

          if (!hasMergedUid(firebaseUser.uid)) {
            nextSaved = Array.from(new Set([...cloud.savedPostIds, ...localSaved]));
            nextLiked = Array.from(new Set([...cloud.likedPostIds, ...localLiked]));
            if (!sameIdSet(nextSaved, cloud.savedPostIds)) cloudFieldsNeedingUpdate.savedPostIds = nextSaved;
            if (!sameIdSet(nextLiked, cloud.likedPostIds)) cloudFieldsNeedingUpdate.likedPostIds = nextLiked;
            markUidMerged(firebaseUser.uid);
          }

          const nextHistory = mergeReadHistory(cloud.readHistory, localHistory);
          if (!sameReadHistory(nextHistory, cloud.readHistory)) cloudFieldsNeedingUpdate.readHistory = nextHistory;

          // Journal entries and the prayer list merge unconditionally too,
          // same as read history, but for a different reason: a record here
          // carries its own deletion as data (the `deleted` tombstone), not
          // as an absence, so a plain "latest updatedAt per id wins" merge
          // is safe every time -- it can't resurrect a deletion the way
          // Saved/Liked's old plain-id-list union could, so there's no
          // first-contact/hasMergedUid gate needed here either.
          const nextJournal = mergeByUpdatedAt(cloud.journalEntries, localJournal);
          if (!sameRecordSet(nextJournal, cloud.journalEntries)) cloudFieldsNeedingUpdate.journalEntries = nextJournal;
          const nextPrayer = mergeByUpdatedAt(cloud.prayerList, localPrayer);
          if (!sameRecordSet(nextPrayer, cloud.prayerList)) cloudFieldsNeedingUpdate.prayerList = nextPrayer;

          let nextTheme = localTheme;
          if (cloud.theme === null) {
            // No theme established for this account yet -- this device's
            // current preference becomes the account's, the same way the
            // very first device to ever save/like something becomes the
            // seed for that list.
            if (localTheme) cloudFieldsNeedingUpdate.theme = localTheme;
          } else if (cloud.theme !== localTheme) {
            nextTheme = cloud.theme;
          }

          if (Object.keys(cloudFieldsNeedingUpdate).length > 0) {
            fb.writeCloudLists(firebaseUser.uid, cloudFieldsNeedingUpdate).catch(() => {});
          }

          // Read history and theme are updated quietly, in place, WITHOUT a
          // reload -- deliberately split off from Saved/Liked below. Found
          // 2026-09-17: this used to reload for a mismatch in ANY of the
          // four fields, and that was a real, serious bug in practice, not
          // just a theoretical one. `recordPostRead` (called every time
          // ANY post is opened) syncs the updated read history to the
          // cloud on every single read -- and with Brian signed in on both
          // his phone and his Mac, that write echoes back through this
          // same live subscription on BOTH devices, including one just
          // sitting open and idle in the background. Reloading for that
          // meant literally every post read on either device force-
          // reloaded the other one too. Reported as "the site glitches for
          // a split second every 5 seconds" -- first noticed on his phone,
          // then also on his Mac once both were open around the same time,
          // and getting more frequent as more posts were read (several new
          // ones were added and read through this same week). A full
          // reload never actually needed to be the mechanism here: unlike
          // Saved/Liked's bookmark/heart icons (see below), nothing reads
          // read-history or theme through a one-time useState initializer
          // that a background update can't otherwise reach -- the read-
          // count stat and Continue Reading card just read localStorage at
          // render time, whenever that next happens naturally, and theme
          // can be applied directly right here instead.
          if (!sameReadHistory(nextHistory, localHistory)) {
            window.localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(nextHistory));
          }
          if (nextTheme && nextTheme !== localTheme) {
            window.localStorage.setItem("gospel-lens-theme", nextTheme);
            document.documentElement.classList.toggle("dark", nextTheme === "dark");
            setDark(nextTheme === "dark");
          }

          // Journal/prayer updates are also applied quietly, with no reload
          // -- unlike Saved/Liked below, PostBody and JournalView read this
          // state via the `journalEntries`/`prayerList` props lifted into
          // this component (see their useState declarations above), not a
          // mount-once initializer, so updating that state here is enough
          // for every open view to pick it up immediately.
          if (!sameRecordSet(nextJournal, localJournal)) {
            window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(nextJournal));
            setJournalEntries(nextJournal);
          }
          if (!sameRecordSet(nextPrayer, localPrayer)) {
            window.localStorage.setItem(PRAYER_KEY, JSON.stringify(nextPrayer));
            setPrayerList(nextPrayer);
          }

          // Saved/Liked are the one thing that genuinely still needs a
          // reload: every PostCard/SinglePostView reads that state via a
          // useState initializer (isPostSaved/isPostLiked), which only
          // runs once on mount, so a background update after mount
          // wouldn't otherwise be reflected in an already-rendered
          // bookmark/heart icon without one.
          const identityNeedsReload = !sameIdSet(nextSaved, localSaved) || !sameIdSet(nextLiked, localLiked);
          if (!identityNeedsReload) return;
          window.localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(nextSaved));
          window.localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(nextLiked));
          window.location.reload();
        });
      });
    });
    return () => {
      cancelled = true;
      unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      const nextTheme = next ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next);
      try {
        window.localStorage.setItem("gospel-lens-theme", nextTheme);
      } catch (e) {
        // localStorage unavailable — theme just won't persist, non-fatal
      }
      syncThemeToCloudIfSignedIn(nextTheme);
      return next;
    });
  };

  // Every forward, in-app navigation goes through this instead of a bare
  // window.history.pushState(null, ...) -- tagging each entry with how deep
  // it sits (navDepthRef, see above) is what lets goBack() below tell real
  // in-app history apart from "nothing to go back to."
  const pushHistoryState = (url) => {
    navDepthRef.current += 1;
    window.history.pushState({ navDepth: navDepthRef.current }, "", url);
  };

  // Used by every real "Back to Blogs" link (Scripture Index, Topic pages,
  // Collection pages, a single post) instead of hardcoding a jump straight
  // to /blog. Added 2026-09-11 -- Brian pointed out that opening a post from
  // the Scripture Index, then hitting "Back to Blogs," dropped him on the
  // main Blogs list instead of back on the Scripture Index (and from there,
  // back on the exact post he was originally reading) -- and that this
  // needs to work as an in-app button, not just via the browser's own back
  // button, since he also uses the site installed as a desktop app, which
  // has no visible back/forward chrome at all. window.history.back() is a
  // plain web-platform API that works identically either way (it's the
  // browser drawing a back BUTTON that's optional, not the underlying
  // session history itself) -- so real in-app history just needed to
  // actually call it, with a safe fallback for the one case there's nothing
  // to go back to (e.g. a post opened directly from a shared link, with no
  // prior in-app navigation this session).
  const goBack = (fallbackView = "blog") => {
    if (navDepthRef.current > 0) {
      window.history.back();
    } else {
      changeView(fallbackView);
    }
  };

  const handleNavSearch = (query) => {
    setNavSearch(query);
    setBlogKey((k) => k + 1);
    setView("blog");
    pushHistoryState("/blog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Read the URL path on load (and on back/forward navigation) so a shared
  // link like /we-will-worship-and-we-will-reign opens that exact post
  // instead of always landing on Home. Old-style #slug and #post-4 links
  // (from before real URLs existed) are silently upgraded in place —
  // history.replaceState swaps the hash for the real path with no visible
  // redirect, so links already shared out in the wild keep working.
  useEffect(() => {
    const applyLocation = () => {
      // Keep navDepthRef in sync with whichever history entry we've actually
      // landed on -- this runs on the initial load (state is whatever it is,
      // usually none) AND on every popstate (our own goBack()'s
      // history.back(), the browser's native back/forward buttons, a
      // trackpad swipe, etc.), so it stays correct no matter how the user
      // got here, not just through our own in-app buttons.
      navDepthRef.current = window.history.state?.navDepth ?? 0;

      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const hash = window.location.hash.replace("#", "");

      if (path === "/" && hash) {
        let target = null;
        if (hash === "blog") target = "/blog";
        else if (hash === "about") target = "/about";
        else if (hash.startsWith("post-")) {
          const id = parseInt(hash.replace("post-", ""), 10);
          const found = POSTS.find((pp) => pp.id === id);
          if (found) target = `/${slugify(found.title)}`;
        } else if (hash.startsWith("collection-")) {
          const authorSlug = hash.replace("collection-", "");
          const authorName = Object.keys(AUTHORS).find((name) => slugify(name) === authorSlug);
          if (authorName) target = `/collection/${slugify(authorName)}`;
        } else {
          const found = getPostBySlug(hash);
          if (found) target = `/${slugify(found.title)}`;
        }
        if (target) {
          window.history.replaceState(null, "", target);
          return applyLocation();
        }
      }

      if (path === "/blog") {
        setView("blog");
        return;
      }
      if (path === "/about") {
        setView("about");
        return;
      }
      if (path === "/saved") {
        setView("saved");
        return;
      }
      if (path.startsWith("/collection/")) {
        const authorSlug = path.replace("/collection/", "");
        const authorName = Object.keys(AUTHORS).find((name) => slugify(name) === authorSlug);
        if (authorName) {
          setActiveAuthor(authorName);
          setView("collection");
          return;
        }
      }
      if (path.startsWith("/topics/")) {
        const topicSlug = path.replace("/topics/", "");
        const topicName = Object.keys(POST_TAGS).find((name) => slugify(name) === topicSlug);
        if (topicName) {
          setActiveTopic(topicName);
          setView("topic");
          return;
        }
      }
      if (path.startsWith("/series/")) {
        const seriesSlug = path.replace("/series/", "");
        const seriesId = Object.keys(SERIES).find((id) => SERIES[id].slug === seriesSlug);
        if (seriesId) {
          setActiveSeries(seriesId);
          setView("series");
          return;
        }
      }
      if (path === "/liked") {
        setView("liked");
        return;
      }
      if (path === "/journal") {
        setView("journal");
        return;
      }
      if (path === "/start-here") {
        setView("readingplan");
        return;
      }
      if (path === "/verses") {
        setView("verses");
        return;
      }
      if (path !== "/") {
        const found = getPostBySlug(path.replace(/^\//, ""));
        if (found) {
          setActivePost(found);
          setView("post");
          return;
        }
        // A non-root path that didn't match blog/about/a collection/a post
        // above is a genuine dead or mistyped link — show a real "not
        // found" page instead of silently falling back to Home.
        setView("notfound");
        return;
      }
      setView("home");
    };
    applyLocation();
    window.addEventListener("popstate", applyLocation);
    return () => window.removeEventListener("popstate", applyLocation);
  }, []);

  // Keep the browser tab title in sync with what's on screen
  useEffect(() => {
    if (view === "post" && activePost) {
      document.title = `${activePost.title} — The Gospel Lens`;
    } else if (view === "blog") {
      document.title = "Blogs — The Gospel Lens";
    } else if (view === "about") {
      document.title = "The Person Behind the Lens — The Gospel Lens";
    } else if (view === "collection" && activeAuthor) {
      document.title = `${activeAuthor} — The Gospel Lens`;
    } else if (view === "series" && activeSeries) {
      document.title = `${SERIES[activeSeries].name} — The Gospel Lens`;
    } else if (view === "topic" && activeTopic) {
      document.title = `${activeTopic} — The Gospel Lens`;
    } else if (view === "saved") {
      document.title = "Saved Posts — The Gospel Lens";
    } else if (view === "liked") {
      document.title = "Liked Posts — The Gospel Lens";
    } else if (view === "journal") {
      document.title = "Your Reflections — The Gospel Lens";
    } else if (view === "verses") {
      document.title = "Scripture Index — The Gospel Lens";
    } else if (view === "readingplan") {
      document.title = "4 Days to Understand the Gospel — The Gospel Lens";
    } else if (view === "notfound") {
      document.title = "Page Not Found — The Gospel Lens";
    } else {
      document.title = "The Gospel Lens";
    }
  }, [view, activePost, activeAuthor, activeTopic, activeSeries]);

  const openPost = (post) => {
    setActivePost(post);
    setCameFromPlan(false);
    setView("post");
    pushHistoryState(`/${slugify(post.title)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Same as openPost, except it marks the post as reached via the guided
  // plan -- used only by the plan overview's own day rows and by the
  // "Continue to Day X" button on a plan post itself, so the sequence stays
  // intact from one day to the next. Any other way of opening a post
  // (Blogs page, search, a share link, Older/Newer nav, etc.) goes through
  // plain openPost above and correctly shows the post with no plan UI at
  // all, even if it happens to be one of the 4 plan posts.
  const openPlanPost = (post) => {
    setActivePost(post);
    setCameFromPlan(true);
    setView("post");
    pushHistoryState(`/${slugify(post.title)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCollection = (authorName) => {
    setActiveAuthor(authorName);
    setView("collection");
    pushHistoryState(`/collection/${slugify(authorName)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openTopic = (topicName) => {
    setActiveTopic(topicName);
    setView("topic");
    pushHistoryState(`/topics/${slugify(topicName)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSeries = (seriesId) => {
    setActiveSeries(seriesId);
    setView("series");
    pushHistoryState(`/series/${SERIES[seriesId].slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openReadingPlan = () => {
    setView("readingplan");
    pushHistoryState("/start-here");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Originally reachable only from the small button inside a post's own
  // Scripture Focus box (see PostBody), per Brian's explicit ask that it not
  // live on the nav or homepage. A homepage teaser card was added 2026-10-01
  // (ScriptureIndexTeaserCard, also at his explicit request) -- the post-page
  // button is unchanged, this is just a second entry point.
  const openScriptureIndex = () => {
    setView("verses");
    pushHistoryState("/verses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Entry point to the Reflection Journal from anywhere other than the
  // hamburger dropdown (which already calls changeView("journal") plainly)
  // -- the Reflection Questions box icon, the per-answer "View your full
  // Journal" link, the homepage teaser card, and a post's own prayer-block
  // nudge all go through this. Passing "prayer" deep-links straight to the
  // Prayer List tab via a #prayer hash (JournalView reads it once on mount
  // to pick its initial tab) -- the one real improvement over a plain link
  // to /journal: the moment someone finishes reading a post's prayer and
  // wants to write their own, the click lands exactly on that tab, not
  // whichever one happened to be open last.
  const openJournal = (tab) => {
    setView("journal");
    pushHistoryState(tab === "prayer" ? "/journal#prayer" : "/journal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeView = (v) => {
    if (v === "blog") setBlogKey((k) => k + 1);
    setView(v);
    setMenuOpen(false);
    pushHistoryState(v === "home" ? "/" : `/${v}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sign-in itself doesn't need to do anything beyond call Firebase --
  // the useEffect above (onAuthChange) picks up the resulting signed-in
  // user and runs the merge. Errors here are almost always the visitor
  // closing the Google popup themselves, not worth surfacing as an error.
  const handleSignIn = () => {
    getFirebase()
      .then((fb) => fb.signInWithGoogle())
      .then((result) => {
        // Remember the sign-in and reload, so the page starts up the normal way for a signed-in
        // visitor (Firebase listening from the start, the account's lists merged in).
        const email = result?.user?.email;
        if (!email) return;
        try {
          window.localStorage.setItem(CACHED_USER_KEY, JSON.stringify({ email }));
        } catch {}
        window.location.reload();
      })
      .catch(() => {});
  };

  const handleSignOut = () => {
    getFirebase()
      .then((fb) => fb.signOutOfGoogle())
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#14161B] flex flex-col transition-colors duration-300">
      <style>{`
        * { font-family: 'Inter', sans-serif; }

        @media print {
          header, footer, .no-print { display: none !important; }
          body, .min-h-screen { background: #fff !important; }
          article { padding: 0 !important; }
          a[href]:after { content: none !important; }

          /* The byline (author · date · read time) uses a light gray meant
             for screens — printers/PDF export often wash light gray out to
             near-invisible, and its clickable-author <button> can pick up
             stray print-only chrome. Force solid, plain text here so it
             actually reads on paper, without touching colors anywhere else
             in the article (the scripture/quote callout boxes rely on
             theirs, e.g. light text on a dark background). */
          .post-byline {
            color: #1C1F26 !important;
            font-size: 11px !important;
          }
          .post-byline button {
            background: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      {/* Skip link: the first tab stop on every page. Hidden until a keyboard user tabs
          to it (sr-only until focused). Moves focus to <main> by hand instead of using
          the #hash, because the router treats a bare #hash as an old-style link. */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          const m = document.getElementById("main-content");
          if (m) {
            m.focus();
            m.scrollIntoView();
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-[#4A5D4E] focus:text-white dark:focus:bg-[#6E9077] dark:focus:text-[#14161B] focus:px-4 focus:py-2.5 focus:rounded-sm focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <Nav
        view={view}
        setView={changeView}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onSearch={handleNavSearch}
        dark={dark}
        toggleDark={toggleDark}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none scroll-mt-20">
        <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        {view === "home" && (
          <HomeView
            setView={changeView}
            openPost={openPost}
            openPlanPost={openPlanPost}
            openReadingPlan={openReadingPlan}
            openTopic={openTopic}
            openScriptureIndex={openScriptureIndex}
            openJournal={openJournal}
            openSeries={openSeries}
          />
        )}
        {view === "blog" && (
          <BlogListView key={blogKey} openPost={openPost} initialSearch={navSearch} openTopic={openTopic} consumeNavSearch={() => setNavSearch("")} />
        )}
        {view === "about" && <AboutView />}
        {view === "collection" && <CollectionView authorName={activeAuthor} openPost={openPost} setView={changeView} goBack={goBack} />}
        {view === "series" && activeSeries && <SeriesView seriesId={activeSeries} openPost={openPost} goBack={goBack} />}
        {view === "topic" && <TopicView topicName={activeTopic} openPost={openPost} setView={changeView} openTopic={openTopic} goBack={goBack} />}
        {view === "post" && (
          <PostRoute
            post={activePost}
            setView={changeView}
            goBack={goBack}
            openPost={openPost}
            openPlanPost={openPlanPost}
            openCollection={openCollection}
            openReadingPlan={openReadingPlan}
            cameFromPlan={cameFromPlan}
            openScriptureIndex={openScriptureIndex}
            journalEntries={journalEntries}
            onSaveAnswer={handleSaveAnswer}
            signedIn={Boolean(user)}
            openJournal={openJournal}
            openSeries={openSeries}
            openTopic={openTopic}
          />
        )}
        {view === "saved" && <SavedPostsView openPost={openPost} setView={changeView} user={user} onSignIn={handleSignIn} />}
        {view === "liked" && <LikedPostsView openPost={openPost} setView={changeView} user={user} onSignIn={handleSignIn} />}
        {view === "journal" && (
          <JournalView
            journalEntries={journalEntries}
            prayerList={prayerList}
            onSaveAnswer={handleSaveAnswer}
            onAddPrayer={handleAddPrayer}
            onToggleAnswered={handleTogglePrayerAnswered}
            onDeletePrayer={handleDeletePrayer}
            openPost={openPost}
            setView={changeView}
            user={user}
            onSignIn={handleSignIn}
            signedIn={Boolean(user)}
            goBack={goBack}
          />
        )}
        {view === "verses" && <ScriptureIndexView openPost={openPost} setView={changeView} goBack={goBack} />}
        {view === "readingplan" && <ReadingPlanView openPlanPost={openPlanPost} />}
        {view === "notfound" && <NotFoundView setView={changeView} openPost={openPost} />}
        </Suspense>
      </main>

      <Footer showNewsletter={view !== null && view !== "home" && view !== "about" && view !== "post"} />
      <BackToTop lift={view === "post"} />
    </div>
  );
}
