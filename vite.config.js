import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // The default auto-injected registerSW.js only calls
      // navigator.serviceWorker.register() -- it never reloads a tab that's
      // already open when a new version ships, so registerType:
      // "autoUpdate" alone (which just makes the new service worker
      // skip-waiting and take over in the background) wasn't actually
      // enough: the old JS bundle kept running silently in memory until
      // something else caused a reload. Disabling the auto-injected script
      // and registering manually in src/main.jsx via virtual:pwa-register
      // lets it force a reload the moment a new version is ready, instead
      // of waiting on a visitor's next unrelated navigation.
      injectRegister: false,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "The Gospel Lens",
        short_name: "Gospel Lens",
        description: "Gospel-centered devotionals, sermon notes, and teaching — ordinary life, seen through an eternal lens.",
        start_url: "/",
        display: "standalone",
        background_color: "#F8F7F3",
        theme_color: "#4A5D4E",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,xml,txt}"],
        // The Firebase chunk (see src/App.jsx's getFirebase()) is
        // deliberately loaded via a lazy dynamic import(), not bundled into
        // the main JS, specifically so the vast majority of visitors who
        // never sign in never have to download it. Precaching it here would
        // undo that for anyone with the PWA installed -- it'd download in
        // the background on every install/update whether or not that
        // person ever uses sign-in. Excluded from the precache list; it's
        // still fetched (and then cached by the browser normally) the
        // moment someone actually clicks "Sign in with Google."
        globIgnores: ["**/assets/firebase-*.js"],
        // Found live 2026-09-25: a shared link (e.g. a brand-new post) could
        // flash the client-side "Page Not Found" view for a split second on
        // any *returning* visitor's device before correcting itself.
        // vite-plugin-pwa's generateSW mode silently registers a default
        // Workbox NavigationRoute pointing every single navigation --
        // literally any path -- at the *cached* index.html shell first,
        // confirmed directly by reading the actual generated dist/sw.js
        // (`registerRoute(new NavigationRoute(createHandlerBoundToURL(
        // "index.html")))`, with no allowlist/denylist limiting it). That
        // cached shell references whatever JS bundle was current the last
        // time that visitor's service worker updated -- if they'd visited
        // before a new post was added, their cached bundle's POSTS array
        // genuinely doesn't contain it yet, so the client router correctly
        // (from that stale bundle's own point of view) renders "not found"
        // -- until the site's own update-detection (src/main.jsx) finds the
        // newer service worker a moment later and reloads, this time
        // getting the current bundle and the real post.
        //
        // This fallback route was never actually needed here: every real
        // route (every post, every topic/collection page, /blog, /about,
        // /saved, /liked, /start-here, /verses, home) already has its own
        // accurate, always-fresh static file served directly by Vercel, and
        // a genuinely unknown/mistyped path is already served a real,
        // correct dist/404.html by Vercel itself (see "Custom 404 page")
        // *before* any service worker gets a say -- so routing every
        // navigation through a possibly-stale cached shell first was pure
        // downside with no real upside for this site. Denying the fallback
        // for every path disables it outright: every navigation now goes
        // straight to the network and gets Vercel's live, current file,
        // every time, eliminating this whole class of stale-shell bug (not
        // just for this one post -- for any future one too), at the cost of
        // the app no longer being able to launch itself while the device is
        // fully offline on that very first navigation (client-side
        // navigation *within* an already-loaded session is unaffected and
        // still works offline, same as before).
        navigateFallbackDenylist: [/.*/],
      },
    }),
  ],
});
