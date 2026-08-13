// Loads the REAL POSTS/AUTHORS data (blocks included) out of src/App.jsx for
// scripts that need full post content, not just title/excerpt — currently
// just the newsletter email builder in notify-buttondown.js.
//
// Unlike prerender.js's regex-based field extraction (fine for simple flat
// strings), the `blocks` arrays are genuinely nested, varied-shape data —
// regex-parsing that robustly would be fragile. Instead this bundles
// src/App.jsx with esbuild (already a Vite dependency, JSX/React support
// included) with react/react-dom/lucide-react marked external so Node just
// resolves them normally from node_modules, then imports the bundled output
// to get the real POSTS/AUTHORS constants. No components are ever rendered —
// only the top-level data arrays are read — so this never touches the DOM,
// browser APIs, or JSX evaluation in any way that matters here.

import { build } from "esbuild";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");

export async function loadPostsData() {
  // Must live inside the project tree (not the OS temp dir) so Node's module
  // resolution for the bundle's `import "react"` etc. can walk up and find
  // this project's own node_modules.
  const tmpRoot = path.join(ROOT, "node_modules", ".gospel-lens-data-tmp");
  await mkdir(tmpRoot, { recursive: true });
  const tmpDir = await mkdtemp(path.join(tmpRoot, "run-"));
  const outfile = path.join(tmpDir, "app-data.mjs");
  try {
    await build({
      entryPoints: [path.join(ROOT, "src", "App.jsx")],
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      jsx: "automatic",
      external: ["react", "react-dom", "lucide-react", "react/jsx-runtime", "@vercel/analytics/react"],
      logLevel: "silent",
    });
    const mod = await import(pathToFileURL(outfile).href);
    if (!mod.POSTS || !mod.AUTHORS) {
      throw new Error("App.jsx did not export POSTS/AUTHORS as expected.");
    }
    return { POSTS: mod.POSTS, AUTHORS: mod.AUTHORS };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
