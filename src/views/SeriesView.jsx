import { SERIES } from "../content/series";
import { useMemo, useState } from "react";
import { postsInSeries } from "../lib/posts";
import { getReadHistory } from "../lib/storage";
import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { estimateReadTime } from "../lib/postText";
import { BlogStatePill } from "../components/BlogCards";

// THE SERIES PAGE (/series/<slug>) -- hero, the posts in reading order as a
// numbered path, and a closing card that says the series is still growing.
export function SeriesView({ seriesId, openPost, goBack }) {
  const series = SERIES[seriesId];
  const posts = useMemo(() => postsInSeries(seriesId), [seriesId]);
  const [readIds] = useState(() => new Set(getReadHistory().map((e) => e.id)));
  if (!series || posts.length === 0) return null;

  const readCount = posts.filter((p) => readIds.has(p.id)).length;
  const next = posts.find((p) => !readIds.has(p.id));
  const ctaPost = next || posts[0];
  const hasIntro = series.introId && posts[0].id === series.introId;
  const ctaLabel = readCount === 0 ? (hasIntro ? "Start with the intro" : "Start with the first post") : next ? `Continue: ${next.title}` : "Read it again from the start";
  const sinceLabel = new Date(posts[0].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="pt-14 sm:pt-16 pb-24 sm:pb-28">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <button
          onClick={() => goBack("blog")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-8 hover:gap-3 transition-all duration-300"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Back
        </button>

        <header className="relative overflow-hidden rounded-sm bg-[#1C1F26] dark:bg-[#0B0D10] text-[#F8F7F3] px-6 sm:px-12 py-10 sm:py-14">
          <svg
            aria-hidden="true"
            className="absolute -right-16 -top-16 w-[260px] h-[260px] sm:w-[380px] sm:h-[380px] text-[#D9B77C] opacity-[0.10] pointer-events-none"
            viewBox="0 0 400 400"
          >
            <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="5" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M200 120v160M140 175h120" stroke="currentColor" strokeWidth="18" fill="none" />
          </svg>
          <div className="relative">
            <div className="flex items-center gap-2.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-[#D9B77C] mb-4">
              <span className="w-7 h-px bg-[#B08D57]" />A series
            </div>
            <h1 className="text-[38px] sm:text-6xl leading-[1.08] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              {series.name}
            </h1>
            <p className="text-[#D9B77C] text-[17px] sm:text-xl mb-5 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              {series.tag}
            </p>
            <p className="text-[#C9CCD3] text-base sm:text-[17px] leading-[1.75] max-w-[60ch] mb-7">{series.description}</p>

            {series.verse && (
              <blockquote className="border-l-2 border-[#B08D57] pl-4 sm:pl-5 mb-8 max-w-[52ch]">
                <p className="text-[#F8F7F3] text-[18px] sm:text-[21px] leading-[1.5]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                  {series.verse}
                </p>
                <footer className="text-[12px] uppercase tracking-[0.15em] text-[#D9B77C] mt-2">{series.verseRef}</footer>
              </blockquote>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                onClick={() => openPost(ctaPost)}
                className="inline-flex items-center gap-2 bg-[#F2F1EC] text-[#1C1F26] px-5 py-3 text-sm font-semibold rounded-full hover:bg-white transition-colors duration-200 max-w-full"
              >
                <span className="truncate">{ctaLabel}</span>
                <ArrowRight size={14} strokeWidth={2} className="shrink-0" />
              </button>
              <p className="text-[13px] text-[#B7BBC4]">
                {posts.length} {posts.length === 1 ? "post" : "posts"} so far · started {sinceLabel}
                {readCount > 0 && (
                  <>
                    {" "}
                    · you've read <span className="text-[#F8F7F3] font-semibold">{readCount} of {posts.length}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-12 sm:mt-14 mb-6">
          <div className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#7F6637] dark:text-[#D9B77C] mb-2">In reading order</div>
          <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] max-w-[60ch]">
            Read them in the order they were published, or jump to any one. Each stands on its own.
          </p>
        </div>

        <ol className="list-none p-0 m-0">
          {posts.map((p, i) => {
            const isRead = readIds.has(p.id);
            const isNew = Date.now() - new Date(p.date).getTime() <= 7 * 864e5 && Date.now() >= new Date(p.date).getTime();
            return (
              <li key={p.id} className="relative pl-14 sm:pl-[72px] pb-5 sm:pb-6">
                <span
                  className={`absolute left-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center text-lg sm:text-xl ${
                    isRead
                      ? "bg-[#4A5D4E] border-[#4A5D4E] text-white dark:bg-[#6E9077] dark:border-[#6E9077] dark:text-[#14161B]"
                      : "bg-white dark:bg-[#1E2128] border-[#B08D57]/60 text-[#7F6637] dark:text-[#D9B77C]"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  aria-hidden="true"
                >
                  {isRead ? <Check size={18} strokeWidth={3} /> : i + 1}
                </span>
                <span aria-hidden="true" className="absolute left-5 sm:left-6 top-12 sm:top-14 bottom-0 w-px bg-[#B08D57]/40" />
                <button
                  onClick={() => openPost(p)}
                  className="group w-full text-left bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 hover:border-[#B08D57]/60 rounded-sm p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-[0_12px_30px_-18px_rgba(28,31,38,0.3)]"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2 text-[12px] uppercase tracking-[0.1em] text-[#6E717A] dark:text-[#848892]">
                    <span className="font-semibold text-[#5B5F6B] dark:text-[#A9ADB6]">
                      {i === 0 && hasIntro ? "The intro" : `No. ${i + 1}`}
                    </span>
                    <span>{estimateReadTime(p)}</span>
                    <span>{p.date}</span>
                    <BlogStatePill isRead={isRead} isNew={isNew} />
                  </div>
                  <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-[22px] sm:text-2xl leading-[1.25] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {p.title}
                  </h2>
                  <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed mb-3">{p.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
                    {isRead ? "Read again" : "Read this one"}
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </button>
              </li>
            );
          })}
          <li className="relative pl-14 sm:pl-[72px]">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dashed border-[#B08D57]/70 flex items-center justify-center text-[#7F6637] dark:text-[#D9B77C] text-xl"
            >
              +
            </span>
            <div className="border border-dashed border-[#B08D57]/60 rounded-sm p-5 sm:p-6">
              <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-xl leading-snug mb-1.5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                More to come
              </h2>
              <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed">
                This series is still growing. New posts on Proverbs land here as soon as they're published, so check back, or subscribe below to get them by email.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
