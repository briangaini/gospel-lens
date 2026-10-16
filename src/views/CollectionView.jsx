import { AUTHORS } from "../content/authors";
import { postsByAuthor } from "../lib/posts";
import {
  ArrowLeft,
} from "lucide-react";
import { PostCard } from "../components/BlogCards";

export function CollectionView({ authorName, openPost, setView, goBack }) {
  const info = AUTHORS[authorName];
  if (!info) return null;

  const posts = postsByAuthor(authorName);

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => goBack("blog")}
        className="hit inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back
      </button>

      <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] dark:text-[#B08D57] font-semibold mb-3">Teaching From</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-2"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {authorName}
      </h1>
      <p className="text-[#4A5D4E] text-sm font-medium mb-10">{info.role}</p>

      <div className="max-w-2xl space-y-5 text-[#2E323B] dark:text-[#D9D9D9] text-[17px] leading-[1.85] mb-16">
        {info.bio.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <p className="text-[12px] uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] font-semibold mb-6">
        Collection · {posts.length} {posts.length === 1 ? "post" : "posts"} on The Gospel Lens
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <h2 className="sr-only">Posts by {authorName}</h2>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={openPost} hideByline />
        ))}
      </div>
    </section>
  );
}
