import { useState } from "react";
import { getLikedPostIds, getSavedPostIds } from "../lib/storage";
import { POSTS } from "../lib/posts";
import {
  Bookmark,
  Heart,
} from "lucide-react";
import { PostCard } from "../components/BlogCards";

// The deliberate "come back to this" list -- see the SAVED POSTS section
// above. Distinct from Continue Reading (which is automatic and shows only
// the single most recent post); this shows everything the visitor chose to
// bookmark, newest-saved first, and updates live if they unsave one right
// from this page.
export function SavedPostsView({ openPost, setView, user, onSignIn }) {
  const [savedIds, setSavedIds] = useState(() => [...getSavedPostIds()].reverse());

  const handleToggleSave = (postId, nowSaved) => {
    if (!nowSaved) setSavedIds((ids) => ids.filter((id) => id !== postId));
  };

  const savedPosts = savedIds.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Saved Posts
      </h1>
      {user ? (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          Posts you've deliberately set aside to come back to — synced to your account, so they'll show up on any device you sign in on.
        </p>
      ) : (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          Posts you've deliberately set aside to come back to — stored privately in this browser only, never sent anywhere.{" "}
          <button onClick={onSignIn} className="hit text-[#4A5D4E] dark:text-[#6E9077] font-medium hover:underline">
            Sign in with Google
          </button>{" "}
          to sync these across your devices instead.
        </p>
      )}

      {savedPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
          <Bookmark size={28} strokeWidth={1.75} className="mx-auto text-[#6E717A] dark:text-[#848892] mb-4" />
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-6">
            Nothing saved yet — tap the bookmark icon on any post to add it here.
          </p>
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-2.5 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
          >
            Browse the Blogs
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <h2 className="sr-only">Your saved posts</h2>
          {savedPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={openPost} onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </section>
  );
}
// A lighter, separate reaction from Saved Posts (Brian's explicit choice —
// "Saved" is "I want to come back to this," "Liked" is "this one meant
// something to me," not necessarily meant to be revisited). Mirrors
// SavedPostsView exactly on purpose.
export function LikedPostsView({ openPost, setView, user, onSignIn }) {
  const [likedIds, setLikedIds] = useState(() => [...getLikedPostIds()].reverse());

  const handleToggleLike = (postId, nowLiked) => {
    if (!nowLiked) setLikedIds((ids) => ids.filter((id) => id !== postId));
  };

  const likedPosts = likedIds.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        Liked Posts
      </h1>
      {user ? (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          Posts that meant something to you — synced to your account, so they'll show up on any device you sign in on.
        </p>
      ) : (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          Posts that meant something to you — stored privately in this browser only, never sent anywhere.{" "}
          <button onClick={onSignIn} className="hit text-[#4A5D4E] dark:text-[#6E9077] font-medium hover:underline">
            Sign in with Google
          </button>{" "}
          to sync these across your devices instead.
        </p>
      )}

      {likedPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
          <Heart size={28} strokeWidth={1.75} className="mx-auto text-[#6E717A] dark:text-[#848892] mb-4" />
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-6">
            Nothing liked yet — tap the heart icon on any post to add it here.
          </p>
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-2.5 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
          >
            Browse the Blogs
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <h2 className="sr-only">Your liked posts</h2>
          {likedPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={openPost} onToggleLike={handleToggleLike} />
          ))}
        </div>
      )}
    </section>
  );
}
