import { useEffect, useMemo, useState } from "react";
import { getVerseOfDay } from "../content/verses";
import { shareVerseCard } from "../lib/verseCard";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  NotebookPen,
  Share2,
  Sunrise,
} from "lucide-react";
import { HOME_CARD, HOME_FAINT, HOME_GOLD_TEXT, HOME_LIFT, HOME_MUTED, HOME_SERIF, HomeHeading, HomeLabel, HomeSection, MoreLink, shortPostDate } from "../components/homeParts";
import { estimateReadTime } from "../lib/postText";
import { MOMENTS } from "../content/moments";
import { POSTS, getFromArchivePost, postsInSeries } from "../lib/posts";
import { POST_TAGS, TOPIC_DESCRIPTIONS } from "../content/topics";
import { NewsletterForm } from "../components/Footer";
import { READING_PLAN_POST_IDS } from "../content/site";
import { getReadHistory } from "../lib/storage";
import { SERIES } from "../content/series";

// ---------------------------------------------------------------------------
// HOMEPAGE -- redesigned 2026-10-06 at Brian's request, after he approved a
// full-size demo. The classic homepage is NOT gone: it is saved as the git
// tag `homepage-classic-2026-10-06` and as a plain copy in
// backup/homepage-classic.jsx. "Homepage restore" in CLAUDE.md has the exact
// steps to put it back.
//
// The idea: the page is organized around what a person is carrying today,
// because the brand promise is "ordinary life, seen through an eternal
// lens." Real writing is on the first screen, a chooser routes a visitor to
// a post by what they're going through, and the 4-day path, topics,
// Scripture Index, and Journal each get a real home instead of being
// afterthoughts at the bottom. Section order for a first-time visitor
// (no read history) puts the 4-day path ahead of Latest writing; a
// returning reader gets Latest first plus a Continue Reading strip.
// ---------------------------------------------------------------------------

const LAST_VISIT_KEY = "gospel-lens-last-visit";
const LAST_VISIT_BASELINE_KEY = "gospel-lens-visit-baseline";
// Verse of the Day, now a compact card inside the hero (it used to be its
// own full-width block under the hero). Same rotation and the same
// share-as-image behavior as before.
function VerseOfDay() {
  const verse = useMemo(() => getVerseOfDay(), []);
  const [status, setStatus] = useState("idle"); // idle | working | done | fallback

  const handleShare = async () => {
    setStatus("working");
    const result = await shareVerseCard({
      text: verse.text,
      attribution: `${verse.reference}, ESV`,
      title: "Verse of the Day — The Gospel Lens",
      url: window.location.href.split("#")[0],
      filename: "verse-of-the-day.png",
    });
    if (result === "shared" || result === "cancelled") {
      setStatus("idle");
      return;
    }
    setStatus(result === "copied-image" ? "done" : "fallback");
    setTimeout(() => setStatus("idle"), 2500);
  };

  const labels = {
    idle: "Share this verse",
    working: "Preparing image…",
    done: "Verse card copied — paste anywhere",
    fallback: "Text + link copied",
  };

  return (
    <div className="relative overflow-hidden bg-[#1C1F26] dark:bg-[#0B0D10] rounded-sm px-6 py-7 sm:px-8 sm:py-8 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 28%, rgba(217,183,124,0.17), rgba(217,183,124,0) 62%)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#D9B77C] font-semibold mb-3">
          <Sunrise size={13} strokeWidth={2} />
          Verse of the Day
        </div>
        <p className="text-[#F8F7F3] text-lg sm:text-xl leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
          "{verse.text}"
        </p>
        <p className="text-[#B7BBC4] text-[13px] mt-3 tracking-wide">— {verse.reference}, ESV</p>
        <button
          onClick={handleShare}
          disabled={status === "working"}
          className="hit inline-flex items-center gap-1.5 text-xs font-medium text-[#B7BBC4] hover:text-[#D9B77C] mt-4 transition-colors duration-200 disabled:opacity-60"
        >
          {status === "done" || status === "fallback" ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
          {labels[status]}
        </button>
      </div>
    </div>
  );
}
function HomeHero({ latest, openPost, openReadingPlan, setView, openSeries }) {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14 pb-16 sm:pb-20 grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-14 items-start">
        <div>
          <HomeLabel>A Christian Editorial Journal</HomeLabel>
          <h1
            className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl lg:text-[56px] leading-[1.06] tracking-tight"
            style={HOME_SERIF}
          >
            Ordinary life, seen through an eternal lens.
          </h1>
          <p className={`${HOME_MUTED} text-base sm:text-lg leading-relaxed mt-5 max-w-[46ch]`}>
            God loved a broken world enough to enter it. Reflections on the gospel of Jesus Christ — for the doubting, the weary, and the curious alike.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-7">
            <button
              onClick={openReadingPlan}
              className="inline-flex items-center gap-2 bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] px-5 sm:px-6 py-3 text-sm font-medium hover:bg-[#4A5D4E] dark:hover:bg-[#6E9077] dark:hover:text-[#F8F7F3] transition-colors duration-300 rounded-sm"
            >
              New here? Start with the 4-day path
              <ArrowRight size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => setView("blog")}
              className="inline-flex items-center gap-2 border border-[#1C1F26]/25 dark:border-[#F2F1EC]/35 text-[#1C1F26] dark:text-[#F2F1EC] px-5 sm:px-6 py-3 text-sm font-medium hover:border-[#4A5D4E] dark:hover:border-[#6E9077] transition-colors duration-300 rounded-sm"
            >
              Read the latest
            </button>
          </div>
          {openSeries && SERIES.proverbs && (
            <button
              onClick={() => openSeries("proverbs")}
              className={`hit mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${HOME_GOLD_TEXT} hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none`}
            >
              Or explore {SERIES.proverbs.name}
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          )}
          <p className={`${HOME_FAINT} text-[13px] mt-2`}>You don't have to believe anything to read. No ads, no account needed.</p>
        </div>

        <div className="space-y-4">
          <button onClick={() => openPost(latest)} className={`${HOME_CARD} ${HOME_LIFT} group w-full text-left p-6 sm:p-8 block`}>
            <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">
              Newest post · {shortPostDate(latest)} · {latest.category} · {estimateReadTime(latest)}
            </span>
            <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-2xl sm:text-[30px] leading-[1.2] mt-2 mb-3" style={HOME_SERIF}>
              {latest.title}
            </span>
            <span className={`block ${HOME_MUTED} text-[15px] leading-relaxed mb-5`}>{latest.excerpt}</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
              Read more
              <ArrowRight size={14} strokeWidth={2} />
            </span>
          </button>
          <VerseOfDay />
        </div>
      </div>
    </section>
  );
}
// Only shown once someone has actually read something (same condition the
// old Continue Reading card used). Also notes how many posts are dated after
// the day of their last visit -- kept entirely in this browser, never sent
// anywhere, like the rest of the read-history features.
function ContinueStrip({ post, newCount, openPost }) {
  return (
    <div className="border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 bg-white dark:bg-[#1E2128]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-sm">
        <button onClick={() => openPost(post)} className={`inline-flex items-center gap-2 text-left ${HOME_MUTED} hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200`}>
          <Bookmark size={15} strokeWidth={2} className={`shrink-0 ${HOME_GOLD_TEXT}`} />
          <span>
            Continue reading:{" "}
            <span className="text-[#1C1F26] dark:text-[#F2F1EC] text-[15px]" style={HOME_SERIF}>
              {post.title}
            </span>
          </span>
        </button>
        {newCount > 0 && (
          <span className={`${HOME_FAINT} text-[13px] inline-flex items-center gap-1.5`}>
            <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
            {newCount} new {newCount === 1 ? "post" : "posts"} since your last visit
          </span>
        )}
      </div>
    </div>
  );
}
// "What are you carrying today?" -- every moment is a real button that is
// always on the page (no hidden quiz). Picking one swaps in a primary post
// with its excerpt, two related posts, and a link to the topic page.
function MomentsChooser({ openPost, openTopic }) {
  const moments = useMemo(
    () =>
      MOMENTS.map((m) => ({
        ...m,
        primaryPost: POSTS.find((p) => p.id === m.primary),
        secondaryPosts: m.secondary.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean),
      })).filter((m) => m.primaryPost),
    []
  );
  const [cur, setCur] = useState(0);
  const m = moments[cur];
  if (!m) return null;

  return (
    <HomeSection>
      <HomeLabel>What are you carrying today?</HomeLabel>
      <HomeHeading>Start with where you are.</HomeHeading>
      <p className={`${HOME_MUTED} text-base mb-7 max-w-[58ch]`}>Pick whatever is closest. Each one leads to real writing, not a quiz.</p>

      <div className="flex gap-2.5 overflow-x-auto sm:flex-wrap -mx-6 px-6 sm:mx-0 sm:px-0 pb-2 mb-5 snap-x" role="group" aria-label="What are you carrying today">
        {moments.map((x, i) => (
          <button
            key={x.label}
            onClick={() => setCur(i)}
            aria-pressed={i === cur}
            className={`snap-start whitespace-nowrap min-h-[44px] px-[18px] rounded-full border text-[14.5px] font-medium transition-colors duration-200 motion-reduce:transition-none ${
              i === cur
                ? "bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] border-[#1C1F26] dark:border-[#F2F1EC]"
                : `bg-white dark:bg-[#1E2128] ${HOME_MUTED} border-[#1C1F26]/20 dark:border-[#F2F1EC]/22 hover:border-[#4A5D4E] dark:hover:border-[#6E9077] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]`
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div key={cur} className="g-swap grid md:grid-cols-[1.3fr_1fr] gap-5" aria-live="polite">
        <button onClick={() => openPost(m.primaryPost)} className={`${HOME_CARD} ${HOME_LIFT} group text-left p-6 sm:p-8 flex flex-col justify-start`}>
          <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">
            {m.primaryPost.category} · {shortPostDate(m.primaryPost)} · {estimateReadTime(m.primaryPost)}
          </span>
          <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-2xl sm:text-[28px] leading-[1.22] mt-2 mb-3" style={HOME_SERIF}>
            {m.primaryPost.title}
          </span>
          <span className={`block ${HOME_MUTED} text-[15px] leading-relaxed mb-5`}>{m.primaryPost.excerpt}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
            Read this one
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </button>

        <div>
          <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">Also helpful</span>
          <div className="mt-1">
            {m.secondaryPosts.map((p) => (
              <button
                key={p.id}
                onClick={() => openPost(p)}
                className="w-full text-left flex items-baseline justify-between gap-4 py-4 border-t border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 first:border-t-0 group"
              >
                <span>
                  <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-lg leading-snug group-hover:text-[#4A5D4E] dark:group-hover:text-[#6E9077] transition-colors duration-200" style={HOME_SERIF}>
                    {p.title}
                  </span>
                  <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">{p.category}</span>
                </span>
                <span className={`${HOME_FAINT} text-[12.5px] shrink-0`}>{shortPostDate(p)}</span>
              </button>
            ))}
          </div>
          <MoreLink onClick={() => openTopic(m.topic)} className="mt-3 text-left">
            More on {m.topic} ({POST_TAGS[m.topic].length} posts)
          </MoreLink>
        </div>
      </div>
    </HomeSection>
  );
}
function LatestWriting({ lead, rows, openPost, setView }) {
  return (
    <HomeSection>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <HomeLabel>Latest writing</HomeLabel>
          <HomeHeading className="!mb-0">Fresh this week</HomeHeading>
        </div>
        <MoreLink onClick={() => setView("blog")}>See all {POSTS.length} posts</MoreLink>
      </div>
      <div className="grid md:grid-cols-[1.15fr_1fr] gap-7 items-stretch">
        <button onClick={() => openPost(lead)} className={`${HOME_CARD} ${HOME_LIFT} group text-left p-6 sm:p-8 flex flex-col`}>
          <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">
            {lead.category} · {shortPostDate(lead)} · {estimateReadTime(lead)}
          </span>
          <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-2xl sm:text-[30px] leading-[1.2] mt-2 mb-3" style={HOME_SERIF}>
            {lead.title}
          </span>
          <span className={`block ${HOME_MUTED} text-[15px] leading-relaxed mb-5 flex-1`}>{lead.excerpt}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
            Read more
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </button>
        <div>
          {rows.map((p) => (
            <button
              key={p.id}
              onClick={() => openPost(p)}
              className="w-full text-left flex items-baseline justify-between gap-4 py-4 border-t border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 first:border-t-0 group"
            >
              <span>
                <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-lg leading-snug group-hover:text-[#4A5D4E] dark:group-hover:text-[#6E9077] transition-colors duration-200" style={HOME_SERIF}>
                  {p.title}
                </span>
                <span className="text-[12px] uppercase tracking-[0.1em] font-semibold text-[#686C77] dark:text-[#8A8E98]">
                  {p.category} · {estimateReadTime(p)}
                </span>
              </span>
              <span className={`${HOME_FAINT} text-[12.5px] shrink-0`}>{shortPostDate(p)}</span>
            </button>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
// The logo ring as a progress device: one gold segment per plan day read.
function ProgressRing({ flags }) {
  const r = 76;
  const c = 2 * Math.PI * r;
  const seg = c / 4 - 14;
  const done = flags.filter(Boolean).length;
  return (
    <svg width="190" height="190" viewBox="0 0 190 190" role="img" aria-label={`${done} of ${flags.length} days read`} className="shrink-0 max-w-full">
      {flags.map((isDone, i) => (
        <circle
          key={i}
          cx="95"
          cy="95"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${seg} ${c - seg}`}
          transform={`rotate(${-90 + i * 90 + 5} 95 95)`}
          className={isDone ? "stroke-[#B08D57]" : "stroke-[#1C1F26]/15 dark:stroke-[#F2F1EC]/20"}
        />
      ))}
      <text x="95" y="93" textAnchor="middle" fontSize="34" className="fill-[#1C1F26] dark:fill-[#F2F1EC]" style={HOME_SERIF}>
        {done} of {flags.length}
      </text>
      <text x="95" y="115" textAnchor="middle" fontSize="13" className="fill-[#686C77] dark:fill-[#8A8E98]" style={{ fontFamily: "Inter, sans-serif" }}>
        days read
      </text>
    </svg>
  );
}
// Start Here and the 4-Day Plan used to be two separate things (a 3-card
// grid on the homepage, and a /start-here page). They're one path now --
// numbering is honest here because this really is a sequence. Nothing is
// locked; the ring just reflects which days have been read in this browser.
function FourDayPath({ planPosts, readIds, openPlanPost, openReadingPlan }) {
  const flags = planPosts.map((p) => readIds.has(p.id));
  const nextIndex = flags.findIndex((f) => !f);
  return (
    <HomeSection>
      <div className={`${HOME_CARD} p-6 sm:p-10 grid md:grid-cols-[190px_1fr] gap-8 md:gap-11 items-center`}>
        <div className="justify-self-start md:justify-self-center">
          <ProgressRing flags={flags} />
        </div>
        <div>
          <HomeLabel>New here? Start with these four</HomeLabel>
          <HomeHeading className="!text-[24px] sm:!text-[30px]">Four days to understand the gospel</HomeHeading>
          <p className={`${HOME_MUTED} text-[15px] mb-4 max-w-[52ch]`}>
            One post a day, in order, since each one builds on the last. Nothing is locked — the ring fills in as you read.
          </p>
          <div>
            {planPosts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => openPlanPost(p)}
                className="w-full text-left flex items-baseline gap-4 sm:gap-5 py-3.5 border-t border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 group"
              >
                <span className={`${HOME_GOLD_TEXT} text-sm w-12 shrink-0`} style={HOME_SERIF}>
                  Day {i + 1}
                </span>
                <span className="text-[#1C1F26] dark:text-[#F2F1EC] text-base sm:text-lg leading-snug group-hover:text-[#4A5D4E] dark:group-hover:text-[#6E9077] transition-colors duration-200" style={HOME_SERIF}>
                  {p.title}
                </span>
                <span className="ml-auto text-[12.5px] font-semibold text-[#4A5D4E] dark:text-[#6E9077] whitespace-nowrap">
                  {flags[i] ? "Read" : i === nextIndex ? "Up next" : ""}
                </span>
              </button>
            ))}
          </div>
          <MoreLink onClick={openReadingPlan} className="mt-3">
            Open the full plan
          </MoreLink>
        </div>
      </div>
    </HomeSection>
  );
}
function TopicBento({ openTopic }) {
  const topics = Object.keys(POST_TAGS).map((name) => ({ name, count: POST_TAGS[name].length, desc: TOPIC_DESCRIPTIONS[name] }));
  // The three biggest topics get a wider tile (ties keep POST_TAGS order),
  // so the grid has a little rhythm instead of 13 identical boxes.
  const bigNames = new Set([...topics].sort((a, b) => b.count - a.count).slice(0, 3).map((t) => t.name));
  return (
    <HomeSection>
      <HomeLabel>Explore by topic</HomeLabel>
      <HomeHeading>{topics.length === 13 ? "Thirteen" : topics.length} topics, each with its own page.</HomeHeading>
      <p className={`${HOME_MUTED} text-base mb-7 max-w-[58ch]`}>Every post is tagged, so you can follow one thread as far as it goes.</p>
      {/* Phones: one swipeable row (snaps card by card, the next card peeks in
          so it reads as scrollable) instead of a long vertical stack of 13.
          sm and up: the original grid, unchanged. */}
      <div
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 scroll-px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:snap-none sm:grid sm:grid-cols-2 lg:grid-cols-4 [grid-auto-flow:dense]"
      >
        {topics.map((t) => (
          <button key={t.name} onClick={() => openTopic(t.name)} className={`${HOME_CARD} ${HOME_LIFT} text-left p-5 sm:p-[22px] flex flex-col justify-start min-w-0 shrink-0 w-[78%] snap-start sm:w-auto sm:shrink ${bigNames.has(t.name) ? "sm:col-span-2" : ""}`}>
            <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-[17px] sm:text-[19px] leading-[1.2] mb-1.5 break-words" style={HOME_SERIF}>
              {t.name}
            </span>
            <span className={`block text-xs font-semibold ${HOME_GOLD_TEXT}`}>
              {t.count} {t.count === 1 ? "post" : "posts"}
            </span>
            {t.desc && <span className={`block ${HOME_MUTED} text-[13px] sm:text-[13.5px] leading-relaxed mt-3`}>{t.desc}</span>}
          </button>
        ))}
      </div>
      <p className={`sm:hidden mt-3 text-[12.5px] ${HOME_FAINT}`}>Swipe to see all {topics.length} →</p>
    </HomeSection>
  );
}
function BeliefBand({ setView }) {
  return (
    <section className="relative overflow-hidden bg-[#1C1F26] dark:bg-[#0B0D10] text-[#F8F7F3]">
      <svg
        aria-hidden="true"
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] text-[#D9B77C] opacity-[0.12] pointer-events-none"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="5" />
        <path d="M200 120v160M140 175h120" stroke="currentColor" strokeWidth="22" fill="none" />
      </svg>
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="flex items-center gap-2.5 text-[12px] uppercase tracking-[0.2em] font-semibold text-[#D9B77C] mb-4">
          <span className="w-7 h-px bg-[#B08D57]" />
          What we believe
        </div>
        <p className="text-[19px] sm:text-[25px] leading-[1.55] max-w-[30em] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          The gospel is simply this: God loved a broken world enough to enter it. In Jesus Christ, he lived the life we could not live, died the death we deserved, and rose again so that all who trust in him might be forgiven, made new, and brought home to God — not by our effort, but by his grace.
        </p>
        <button onClick={() => setView("about")} className="hit inline-flex items-center gap-1.5 text-sm font-semibold text-[#D9B77C] hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
          Read the full story
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
// The Scripture Index and the Reflection Journal used to be two small
// teaser cards at the very bottom of the page; they're the two things only
// this site does, so they get a heading and a side-by-side spot.
function ToolsPair({ openScriptureIndex, openJournal }) {
  return (
    <HomeSection>
      <HomeLabel>Your tools</HomeLabel>
      <HomeHeading className="!mb-6">Two things only this site does.</HomeHeading>
      <div className="grid md:grid-cols-2 gap-5">
        <button
          onClick={openScriptureIndex}
          className="group text-left bg-white dark:bg-[#1E2128] border border-dashed border-[#B08D57]/70 dark:border-[#D9B77C]/55 hover:border-[#B08D57] dark:hover:border-[#D9B77C] rounded-sm p-6 sm:p-[30px] transition-colors duration-200 flex flex-col justify-start"
        >
          <BookOpen size={24} strokeWidth={1.75} className={HOME_GOLD_TEXT} />
          <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-xl sm:text-[21px] leading-[1.25] mt-3 mb-2" style={HOME_SERIF}>
            Every verse cited on the site, in one place
          </span>
          <span className={`block ${HOME_MUTED} text-[14.5px] leading-relaxed mb-4`}>
            Every Scripture Focus reference across all posts, grouped by Bible book from Genesis to Revelation. Open any one to read it in context.
          </span>
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${HOME_GOLD_TEXT} group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none`}>
            Open the Scripture Index
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </button>
        <button
          onClick={() => openJournal()}
          className="group text-left bg-white dark:bg-[#1E2128] border border-dashed border-[#4A5D4E]/60 dark:border-[#6E9077]/55 hover:border-[#4A5D4E] dark:hover:border-[#6E9077] rounded-sm p-6 sm:p-[30px] transition-colors duration-200 flex flex-col justify-start"
        >
          <NotebookPen size={24} strokeWidth={1.75} className="text-[#4A5D4E] dark:text-[#6E9077]" />
          <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-xl sm:text-[21px] leading-[1.25] mt-3 mb-2" style={HOME_SERIF}>
            A private place to write: reflections and prayers
          </span>
          <span className={`block ${HOME_MUTED} text-[14.5px] leading-relaxed mb-4`}>
            Answer what each post asks you to reflect on, and keep a running prayer list. Private to you, synced wherever you sign in.
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] group-hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none">
            Open your Journal
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </button>
      </div>
    </HomeSection>
  );
}
// "From the Archive" -- one older post per week. `excludeIds` is every post
// already shown elsewhere on the page, so it can never repeat one.
function FromArchiveCard({ openPost, excludeIds }) {
  const [post] = useState(() => getFromArchivePost(excludeIds));
  if (!post) return null;

  return (
    <HomeSection innerClassName="!py-14 sm:!py-16">
      <button
        onClick={() => openPost(post)}
        className="w-full text-left flex items-start sm:items-center gap-4 sm:gap-5 bg-[#1C1F26] dark:bg-[#0B0D10] hover:bg-[#252932] dark:hover:bg-[#15181D] rounded-sm px-6 sm:px-8 py-6 sm:py-7 transition-colors duration-200"
      >
        <Archive size={26} strokeWidth={1.75} className="text-[#D9B77C] shrink-0 mt-1 sm:mt-0" />
        <div className="min-w-0">
          <span className="text-[12px] uppercase tracking-[0.2em] text-[#D9B77C] font-semibold">From the Archive</span>
          <p className="text-[13px] text-[#B7BBC4] mt-1 mb-2">A post worth another look — resurfaced from the archive here each week.</p>
          <div className="text-[#F8F7F3] text-xl sm:text-[21px] leading-snug" style={HOME_SERIF}>
            {post.title}
          </div>
          <span className="text-[13px] text-[#B7BBC4]">
            {post.author ? `By ${post.author} · ` : ""}Originally published {post.date}
          </span>
        </div>
      </button>
    </HomeSection>
  );
}
function NewsletterBand() {
  return (
    <HomeSection>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-7">
        <div>
          <h2 className="text-[#1C1F26] dark:text-[#F2F1EC] text-2xl leading-tight mb-1.5" style={HOME_SERIF}>
            Get new posts by email
          </h2>
          <p className={`${HOME_MUTED} text-base`}>One email, whenever something new is published. No spam.</p>
        </div>
        <NewsletterForm />
      </div>
    </HomeSection>
  );
}
export function HomeView({ setView, openPost, openPlanPost, openReadingPlan, openTopic, openScriptureIndex, openJournal, openSeries }) {
  const newest = useMemo(() => [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)), []);
  const hero = newest[0];
  const latestLead = newest[1];
  const latestRows = newest.slice(2, 6);
  const planPosts = useMemo(() => READING_PLAN_POST_IDS.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean), []);

  // Read history and last-visit time live only in this browser.
  const [readIds] = useState(() => new Set(getReadHistory().map((e) => e.id)));
  const hasHistory = readIds.size > 0;
  const [lastRead] = useState(() => {
    const history = getReadHistory();
    if (!history.length) return null;
    return POSTS.find((p) => p.id === history[history.length - 1].id) || null;
  });
  // Posts dated after the day of the last visit.
  // The baseline for "new since your last visit" is the previous visit's
  // time, held in sessionStorage for the rest of this browsing session so a
  // refresh doesn't make the count vanish. The stored last-visit time itself
  // moves to "now" right after, so the NEXT session compares against this one.
  const [baseline] = useState(() => {
    try {
      const held = window.sessionStorage.getItem(LAST_VISIT_BASELINE_KEY);
      if (held !== null) return Number(held) || 0;
      return Number(window.localStorage.getItem(LAST_VISIT_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const newCount = useMemo(() => {
    if (!baseline) return 0;
    const prevDay = new Date(baseline);
    prevDay.setHours(0, 0, 0, 0);
    return POSTS.filter((p) => new Date(p.date) > prevDay).length;
  }, [baseline]);
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(LAST_VISIT_BASELINE_KEY) === null) {
        window.sessionStorage.setItem(LAST_VISIT_BASELINE_KEY, String(baseline));
      }
      window.localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
      // storage unavailable -- the new-posts note just won't show
    }
  }, [baseline]);

  const shownIds = [hero, latestLead, ...latestRows, ...planPosts].map((p) => p.id);

  const path = <FourDayPath planPosts={planPosts} readIds={readIds} openPlanPost={openPlanPost} openReadingPlan={openReadingPlan} />;

  return (
    <>
      <HomeHero latest={hero} openPost={openPost} openReadingPlan={openReadingPlan} setView={setView} openSeries={openSeries} />
      {hasHistory && lastRead && <ContinueStrip post={lastRead} newCount={newCount} openPost={openPost} />}
      <MomentsChooser openPost={openPost} openTopic={openTopic} />
      {!hasHistory && path}
      <LatestWriting lead={latestLead} rows={latestRows} openPost={openPost} setView={setView} />
      {hasHistory && path}
      <TopicBento openTopic={openTopic} />
      <BeliefBand setView={setView} />
      <SeriesBand seriesId="proverbs" openSeries={openSeries} openPost={openPost} />
      <ToolsPair openScriptureIndex={openScriptureIndex} openJournal={openJournal} />
      <FromArchiveCard openPost={openPost} excludeIds={shownIds} />
      <NewsletterBand />
    </>
  );
}
// The homepage's slot for a series: description and pull verse on the left,
// the latest posts in the series on the right.
function SeriesBand({ seriesId, openSeries, openPost }) {
  const series = SERIES[seriesId];
  const posts = useMemo(() => postsInSeries(seriesId), [seriesId]);
  if (!series || posts.length === 0) return null;
  const latest = [...posts].reverse().slice(0, 3);
  const numberOf = (p) => posts.findIndex((x) => x.id === p.id) + 1;

  return (
    <section className="border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 bg-[#B08D57]/[0.09] dark:bg-[#B08D57]/[0.06]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20 grid md:grid-cols-[1.05fr_1fr] gap-10 md:gap-14 items-start">
        <div>
          <HomeLabel>A series</HomeLabel>
          <HomeHeading>{series.name}</HomeHeading>
          <p className={`${HOME_MUTED} text-base sm:text-[17px] leading-[1.7] mb-6 max-w-[52ch]`}>{series.description}</p>
          {series.verse && (
            <blockquote className="border-l-2 border-[#B08D57] pl-4 mb-7 max-w-[46ch]">
              <p className="text-[#1C1F26] dark:text-[#F2F1EC] text-[18px] sm:text-xl leading-[1.5] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {series.verse}
              </p>
              <footer className={`text-[12px] uppercase tracking-[0.15em] mt-2 ${HOME_GOLD_TEXT}`}>{series.verseRef}</footer>
            </blockquote>
          )}
          <button
            onClick={() => openSeries(seriesId)}
            className="inline-flex items-center gap-2 bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] px-5 py-3 text-sm font-semibold rounded-full hover:bg-[#4A5D4E] dark:hover:bg-white transition-colors duration-200"
          >
            Explore the series
            <ArrowRight size={14} strokeWidth={2} />
          </button>
          <span className={`ml-4 text-[13px] ${HOME_FAINT}`}>
            {posts.length} {posts.length === 1 ? "post" : "posts"} · still growing
          </span>
        </div>
        <div>
          <div className={`text-[12px] uppercase tracking-[0.2em] font-semibold mb-3 ${HOME_GOLD_TEXT}`}>Latest in the series</div>
          <div className="grid gap-3">
            {latest.map((p) => (
              <button key={p.id} onClick={() => openPost(p)} className={`${HOME_CARD} ${HOME_LIFT} text-left p-4 sm:p-5 flex items-start gap-4`}>
                <span className="shrink-0 w-9 h-9 rounded-full border border-[#B08D57]/60 flex items-center justify-center text-[15px] text-[#7F6637] dark:text-[#D9B77C]" style={HOME_SERIF} aria-hidden="true">
                  {numberOf(p)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[#1C1F26] dark:text-[#F2F1EC] text-[17px] sm:text-[18px] leading-snug mb-1" style={HOME_SERIF}>
                    {p.title}
                  </span>
                  <span className={`block text-[12.5px] ${HOME_FAINT}`}>
                    {estimateReadTime(p)} · {p.date}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => openSeries(seriesId)} className={`hit mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${HOME_GOLD_TEXT} hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none`}>
            See all {posts.length}, in order
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
