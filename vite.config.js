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
      },
    }),
  ],
});
