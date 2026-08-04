import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
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
