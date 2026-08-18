import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import "./index.css";

// Keeps an already-open tab from ever running a stale bundle after a
// deploy, instead of waiting on a visitor to manually refresh.
//
// registerType: "autoUpdate" (vite.config.js) makes each generated service
// worker call skipWaiting()/clientsClaim() as part of its own install
// step, but that's necessary, not sufficient: a worker can still finish
// installing and sit in the "waiting" state for a while in practice before
// the browser gets around to activating it, and vite-plugin-pwa's own
// higher-level "update ready" detection (virtual:pwa-register's
// onNeedRefresh) turned out not to fire reliably when this was tested
// locally against a real rebuild -- a new worker sat fully installed and
// waiting with no callback firing. So this talks to the raw Service Worker
// API directly instead of going through that abstraction:
//   1. The moment any waiting worker is found (already there on load, or
//      newly finished installing), tell it to activate right away.
//   2. The moment a worker actually takes over the page (controllerchange
//      -- confirmed firing correctly and promptly in testing), reload.
//   3. Force an update *check* immediately on load, and again whenever the
//      tab regains focus after being backgrounded -- rather than only
//      relying on the browser's own default background-check schedule,
//      which turned out to be noticeably slow/conservative in real use
//      (confirmed live: an already-open tab needed several manual
//      refreshes before it picked up a deploy, when relying on that
//      default timing alone). Forcing the check ourselves on load/focus
//      means step 1-2 above get a chance to run almost immediately instead
//      of waiting on however long the browser would've taken on its own.
// Together these get a genuinely automatic update with no prompt and no
// manual refresh needed going forward, for anyone whose browser is already
// running this code. The one thing this can't fix: a visitor whose browser
// is still running an OLDER bundle from *before* this file existed has no
// way to run this logic at all until their own browser's native update
// check (independent of anything here) eventually swaps them onto a
// version that does -- a one-time migration cost with no code-side fix,
// since the old code genuinely has none of this.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((reg) => {
      const activateWhenReady = (worker) => worker?.postMessage({ type: "SKIP_WAITING" });

      if (reg.waiting) activateWhenReady(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") activateWhenReady(newWorker);
        });
      });

      reg.update();
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update();
      });
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
