import { POSTS } from "../lib/posts";
import { Eyebrow } from "../components/Eyebrow";
import { PostCard } from "../components/BlogCards";

// Shown for any path that isn't Home, Blogs, About, a real post, or a real
// author collection — a typo'd or dead link, rather than silently landing
// on Home with no explanation. See scripts/prerender.js for the matching
// static dist/404.html, which covers requests Vercel serves before any of
// this JS ever runs.
export function NotFoundView({ setView, openPost }) {
  const recentPosts = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <section className="max-w-2xl mx-auto px-6 sm:px-8 pt-24 pb-16 text-center">
      <Eyebrow center>
        <span className="mx-auto">404</span>
      </Eyebrow>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-5"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        This Page Isn't Here
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[16px] leading-relaxed max-w-md mx-auto mb-10">
        The link may be broken, or the page may have moved. Whatever it was, it isn't lost to us — you can always find your way back.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-20">
        <button
          onClick={() => setView("home")}
          className="inline-flex items-center gap-2 bg-[#1C1F26] text-[#F8F7F3] px-6 py-3 text-sm tracking-wide hover:bg-[#4A5D4E] transition-colors duration-300"
        >
          Go Home
        </button>
        <button
          onClick={() => setView("blog")}
          className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
        >
          Browse the Blogs
        </button>
      </div>

      <div className="text-left">
        <Eyebrow>In the Meantime</Eyebrow>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          <h2 className="sr-only">Recent posts</h2>
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={openPost} />
          ))}
        </div>
      </div>
    </section>
  );
}
