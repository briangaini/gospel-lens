// The pages of the site, each loaded only when someone first visits it (so the
// code a visitor downloads is the shell plus the page they're on, not the whole
// site). `.preload()` starts the download without showing anything, which is how
// the app gets a page's code on its way as early as possible.
import { lazy } from "react";
import { importOrReload } from "../lib/chunkSafe";

function page(loader, exportName) {
  const load = () => importOrReload(() => loader().then((m) => ({ default: m[exportName] })));
  const Component = lazy(load);
  Component.preload = load;
  return Component;
}

export const HomeView = page(() => import("./HomeView"), "HomeView");
export const BlogListView = page(() => import("./BlogListView"), "BlogListView");
export const AboutView = page(() => import("./AboutView"), "AboutView");
export const CollectionView = page(() => import("./CollectionView"), "CollectionView");
export const SeriesView = page(() => import("./SeriesView"), "SeriesView");
export const TopicView = page(() => import("./TopicView"), "TopicView");
export const SinglePostView = page(() => import("./PostView"), "SinglePostView");
export const SavedPostsView = page(() => import("./SavedLikedViews"), "SavedPostsView");
export const LikedPostsView = page(() => import("./SavedLikedViews"), "LikedPostsView");
export const JournalView = page(() => import("./JournalView"), "JournalView");
export const ScriptureIndexView = page(() => import("./ScriptureIndexView"), "ScriptureIndexView");
export const ReadingPlanView = page(() => import("./ReadingPlanView"), "ReadingPlanView");
export const NotFoundView = page(() => import("./NotFoundView"), "NotFoundView");
