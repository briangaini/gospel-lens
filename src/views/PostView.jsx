import { useEffect, useRef, useState } from "react";
import { shareVerseCard } from "../lib/verseCard";
import { slugify } from "../lib/slug";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Headphones,
  Heart,
  Link2,
  List,
  NotebookPen,
  Pause,
  Play,
  Printer,
  Quote,
  RotateCcw,
  Share2,
  Sparkles,
  Type,
} from "lucide-react";
import { renderInline } from "../components/inline";
import { JournalAnswerBox } from "../components/JournalAnswerBox";
import { getJournalAnswerText, isPostLiked, isPostSaved, recordPostRead, toggleLikedPost, toggleSavedPost } from "../lib/storage";
import { POSTS, getRelatedPosts, postsInSeries, seriesIdForPost, tagsForPost } from "../lib/posts";
import { countPostWords, estimateReadTime } from "../lib/postText";
import { useListenToPost } from "../lib/listen";
import { READING_PLAN_POST_IDS } from "../content/site";
import { BLOG_CAT_DOT } from "../lib/blog";
import { SERIES } from "../content/series";
import { AUTHORS } from "../content/authors";
import { NewsletterForm } from "../components/Footer";

// ---------------------------------------------------------------------------
// POST BODY RENDERER — turns the `blocks` array into styled sections
// ---------------------------------------------------------------------------

// "Share this verse," but for a specific post's Scripture Focus box rather
// than the homepage Verse of the Day -- reuses the exact same card-image
// generation. Multiple verses in one box are joined into a single quote,
// matching how the box already displays them together.
function ScriptureShareButton({ post, reference, verses }) {
  const [status, setStatus] = useState("idle"); // idle | working | done | fallback

  const handleShare = async () => {
    setStatus("working");
    const result = await shareVerseCard({
      text: verses.join(" "),
      attribution: reference,
      eyebrow: "SCRIPTURE FOCUS",
      title: `${post.title} — The Gospel Lens`,
      url: `${window.location.origin}/${slugify(post.title)}`,
      filename: `${slugify(post.title)}-scripture.png`,
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
    <button
      onClick={handleShare}
      disabled={status === "working"}
      className="hit no-print inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5D4E] dark:text-[#8FAE95] hover:text-[#B08D57] mt-4 transition-colors duration-200 disabled:opacity-60"
    >
      {status === "done" || status === "fallback" ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
      {labels[status]}
    </button>
  );
}
function PostBody({ blocks, post, prefs, openScriptureIndex, journalEntries, onSaveAnswer, signedIn, openJournal }) {
  let paragraphIndex = -1;
  let headingIndex = -1;
  // Reading preferences (text size, sans/serif) only affect the running text;
  // the callout boxes keep their own fixed sizes.
  // (The site's global `* { font-family: Inter }` rule means a font set on this
  // wrapper would not inherit, so the serif choice is applied to the running
  // text itself: paragraphs, list items and their bold/italic.)
  const bodyStyle = prefs ? { fontSize: prefs.size } : undefined;
  const textFont = prefs && prefs.font === "serif" ? { fontFamily: "'Source Serif 4', Georgia, serif" } : undefined;

  return (
    <div className="space-y-6 text-[#2E323B] dark:text-[#D9D9D9] text-[18px] leading-[1.85]" style={bodyStyle}>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          paragraphIndex += 1;
          const isFirst = paragraphIndex === 0;
          return (
            <p key={i} style={textFont}>
              {isFirst ? (
                <>
                  <span
                    className="float-left text-7xl leading-[0.75] pr-3 pt-2 text-[#4A5D4E] dark:text-[#6E9077]"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                  >
                    {block.text.charAt(0)}
                  </span>
                  {renderInline(block.text.slice(1))}
                </>
              ) : (
                renderInline(block.text)
              )}
            </p>
          );
        }

        if (block.type === "heading") {
          headingIndex += 1;
          return (
            <h2
              key={i}
              id={`post-h${headingIndex}`}
              className="relative text-[26px] sm:text-[30px] leading-[1.2] text-[#1C1F26] dark:text-[#F2F1EC] pt-6 mt-10 scroll-mt-[160px] before:content-[''] before:absolute before:top-0 before:left-0 before:w-11 before:h-0.5 before:bg-[#B08D57]"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: undefined }}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={i} className="not-prose space-y-2 pl-1">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-3 leading-[1.7] text-[#2E323B] dark:text-[#D9D9D9]" style={textFont}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-3 shrink-0" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <div key={i} className="not-prose bg-[#1C1F26] text-[#F8F7F3] rounded-sm px-7 py-6 my-8">
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-2">
                    Wisdom of the Day
                  </p>
                  <p className="text-[17px] leading-relaxed italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{block.text}"
                  </p>
                  {block.attribution && (
                    <p className="text-sm text-[#B0B4BD] mt-3">— {block.attribution}</p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "scripture") {
          return (
            <div key={i} className="not-prose border-l-4 border-[#B08D57] bg-[#4A5D4E]/6 rounded-r-sm px-6 py-6 my-8">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold">
                  Scripture Focus · {block.reference}
                </p>
                {/* Entry point to the Scripture Index (/verses) -- the ONLY
                    way in, deliberately, per Brian's explicit ask that it
                    not live on the nav or homepage. Small and in the
                    corner, on purpose: his direct feedback on the first
                    version of this button was that it read too long/big
                    sitting next to "Share this verse" -- moved here,
                    icon-only, opposite the label instead.

                    The hover label is hand-built with group-hover, not the
                    native `title` attribute -- Brian asked for a real "on
                    hover it reads Scripture Index, on mouse-out it
                    disappears" tooltip (2026-09-11). A browser's native
                    title tooltip is unreliable exactly where this site is
                    also used: installed as a desktop app, its OS-level
                    tooltip rendering isn't guaranteed the same way it is in
                    a normal browser tab. This one is plain CSS, so it works
                    identically either way. */}
                {openScriptureIndex && (
                  <div className="relative shrink-0 -mt-0.5">
                    <button
                      onClick={openScriptureIndex}
                      aria-label="View Scripture Index"
                      className="group/tooltip hit no-print relative w-6 h-6 rounded-full flex items-center justify-center text-[#4A5D4E]/50 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition-colors duration-200"
                    >
                      <List size={13} strokeWidth={2} />
                      <span
                        role="tooltip"
                        className="no-print pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded-sm bg-[#1C1F26] dark:bg-[#F2F1EC] px-2 py-1 text-[12px] font-medium text-[#F8F7F3] dark:text-[#1C1F26] opacity-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:opacity-100 transition-opacity duration-150 z-10"
                      >
                        Scripture Index
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {block.verses.map((v, vi) => (
                  <p key={vi} className="text-[19px] sm:text-[21px] leading-[1.55] italic text-[#2E323B] dark:text-[#D9D9D9]" style={{ fontFamily: "'Playfair Display', serif", fontSize: undefined }}>
                    "{v}"
                  </p>
                ))}
              </div>
              {post && <ScriptureShareButton post={post} reference={block.reference} verses={block.verses} />}
            </div>
          );
        }

        if (block.type === "reflection") {
          return (
            <div key={i} id="post-reflection" className="not-prose scroll-mt-[160px] bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-7 py-6 my-8" style={{ fontSize: 16 }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold">
                  Reflection Questions
                </p>
                {/* Entry point to the Reflection Journal (/journal) -- same
                    icon-only, hand-built-tooltip treatment as the Scripture
                    Index button on the Scripture Focus box above, for the
                    same reason: consistent, small, in the corner opposite
                    the label. */}
                {openJournal && (
                  <div className="relative shrink-0 -mt-0.5">
                    <button
                      onClick={() => openJournal()}
                      aria-label="View Your Journal"
                      className="group/tooltip hit no-print relative w-6 h-6 rounded-full flex items-center justify-center text-[#4A5D4E]/50 hover:text-[#4A5D4E] hover:bg-[#4A5D4E]/10 transition-colors duration-200"
                    >
                      <NotebookPen size={13} strokeWidth={2} />
                      <span
                        role="tooltip"
                        className="no-print pointer-events-none absolute top-full right-0 mt-1.5 whitespace-nowrap rounded-sm bg-[#1C1F26] dark:bg-[#F2F1EC] px-2 py-1 text-[12px] font-medium text-[#F8F7F3] dark:text-[#1C1F26] opacity-0 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:opacity-100 transition-opacity duration-150 z-10"
                      >
                        Your Journal
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <p className="no-print text-[12.5px] text-[#5B5F6B] dark:text-[#A9ADB6] leading-relaxed mb-4 max-w-[48ch]">
                Answer in your own words, below — it's saved privately to your Journal as you write, so you can look back on it later.
              </p>
              <ul className="space-y-4">
                {block.items.map((q, qi) => (
                  <li key={qi} className="space-y-2">
                    <div className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                      <span className="text-[#7F6637] dark:text-[#B08D57] font-semibold shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {qi + 1}.
                      </span>
                      <span>{q}</span>
                    </div>
                    {post && onSaveAnswer && (
                      <div className="pl-7">
                        <JournalAnswerBox
                          key={`${post.id}-${qi}`}
                          postId={post.id}
                          qIndex={qi}
                          savedText={getJournalAnswerText(journalEntries || [], post.id, qi)}
                          onSave={onSaveAnswer}
                          signedIn={signedIn}
                          onViewJournal={openJournal}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "heart") {
          return (
            <div key={i} className="not-prose flex gap-3 items-start bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm px-6 py-5 my-8">
              <Quote size={18} className="text-[#B08D57] mt-1 shrink-0" strokeWidth={2} />
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] font-semibold mb-2">
                  Write This On Your Heart
                </p>
                <p className="text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">{block.text}</p>
              </div>
            </div>
          );
        }

        if (block.type === "encourage") {
          return (
            <div key={i} className="not-prose text-center border-y border-[#B08D57]/30 py-8 my-10">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] dark:text-[#B08D57] font-semibold mb-3">
                Be Encouraged
              </p>
              <p
                className="text-[22px] sm:text-2xl leading-snug text-[#1C1F26] dark:text-[#F2F1EC] max-w-lg mx-auto"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "share") {
          return (
            <div key={i} className="not-prose bg-[#4A5D4E]/6 rounded-sm px-7 py-6 my-8">
              <p className="text-[12px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4">
                Share Your Faith
              </p>
              <ul className="space-y-3">
                {block.items.map((item, ii) => (
                  <li key={ii} className="flex gap-3 text-[16px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-2.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "prayer") {
          return (
            <div key={i} className="not-prose my-8">
              <div className="bg-[#1C1F26]/4 border-l-4 border-[#1C1F26]/20 dark:border-[#F2F1EC]/20 rounded-r-sm px-7 py-6 mb-3">
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#5B5F6B] dark:text-[#A9ADB6] font-semibold mb-3">
                  A Prayer
                </p>
                <p className="text-[17px] leading-relaxed text-[#2E323B] dark:text-[#D9D9D9] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {block.text}
                </p>
              </div>
              {/* Points at the Journal's Prayer tab specifically, not just
                  /journal generally -- openJournal("prayer") deep-links via
                  the #prayer hash, so the moment someone finishes reading a
                  prayer and wants to write their own lands exactly there. */}
              {openJournal && (
                <p className="no-print text-[13px] text-[#5B5F6B] dark:text-[#A9ADB6]">
                  Want to keep praying this?{" "}
                  <button onClick={() => openJournal("prayer")} className="text-[#7F6637] dark:text-[#B08D57] font-semibold hover:underline">
                    Add it to your own Prayer List →
                  </button>
                </p>
              )}
            </div>
          );
        }

        if (block.type === "closing") {
          return (
            <p key={i} className="text-sm italic text-[#6E717A] dark:text-[#848892] pt-2">
              {block.text}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
// Presentational only — playback state/logic lives in useListenToPost so the
// top and bottom buttons on a post can share one state and either can
// control the same reading. Main button is a simple play/pause/resume
// toggle; the small restart button (only shown once something's queued)
// fully stops and clears it so the next tap starts from the beginning.
function ListenButton({ status, onToggle, onRestart, supported }) {
  if (!supported) return null;
  const label = status === "speaking" ? "Pause" : status === "paused" ? "Resume" : "Listen to This Post";
  const Icon = status === "speaking" ? Pause : Play;
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        <Icon size={14} strokeWidth={2} />
        {label}
      </button>
      {status !== "idle" && (
        <button
          onClick={onRestart}
          aria-label="Restart from the beginning"
          title="Restart from the beginning"
          className="inline-flex items-center justify-center w-8 h-8 text-[#6E717A] dark:text-[#848892] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
        >
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
function ShareBar({ post, onPrint }) {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(""); // "" | "copied" | "failed"

  const shareUrl = () => `${window.location.origin}/${slugify(post.title)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // clipboard unavailable — fail quietly
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: shareUrl() });
      } catch (err) {
        // user cancelled — no action needed
      }
    } else {
      handleCopy();
    }
  };

  const shareWhatsApp = () => {
    // wa.me opens WhatsApp Web on a computer (or the app if it's installed);
    // the link travels inside the message text.
    const text = `${post.title}\n${shareUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  // Instagram has no web address that pre-fills a message, so this copies the
  // link, opens a new direct message, and tells the visitor to paste it.
  const shareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setIgCopied("copied");
    } catch (err) {
      setIgCopied("failed");
    }
    setTimeout(() => setIgCopied(""), 4000);
    window.open("https://www.instagram.com/direct/new/", "_blank", "noopener,noreferrer");
  };

  const emailHref = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(
    `I thought you might like this post on The Gospel Lens:\n\n${post.title}\n${typeof window !== "undefined" ? window.location.origin : ""}/${slugify(post.title)}`
  )}`;

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3 py-6">
      <span className="text-[12px] uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] font-semibold mr-1">Share</span>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200 sm:hidden"
      >
        <Share2 size={14} strokeWidth={2} />
        Share
      </button>
      <button onClick={shareWhatsApp} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200">
        Share on WhatsApp
      </button>
      <button onClick={shareInstagram} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200">
        {igCopied === "copied" ? "Link copied — paste it in your message" : igCopied === "failed" ? "Tap Copy Link, then paste it in your message" : "Share on Instagram"}
      </button>
      <a href={emailHref} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200">
        Email
      </a>
      <button onClick={shareFacebook} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200">
        Share on Facebook
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
      >
        {copied ? <Check size={14} strokeWidth={2} /> : <Link2 size={14} strokeWidth={2} />}
        {copied ? "Link Copied" : "Copy Link"}
      </button>
      {onPrint && (
        <button
          onClick={onPrint}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-3.5 py-2 rounded-full hover:border-[#4A5D4E]/50 hover:text-[#4A5D4E] transition-colors duration-200"
        >
          <Printer size={14} strokeWidth={2} />
          Print / Save as PDF
        </button>
      )}
    </div>
  );
}
// POST PAGE -- redesigned 2026-10-15. Restorable, see CLAUDE.md "Post page
// restore" (backup/post-classic.jsx). Everything it shows is derived from data
// that already exists; the only new state is two small local-only preferences.
const READING_PREFS_KEY = "gospel-lens-reading-prefs";
const READ_POSITION_KEY = "gospel-lens-read-position";
const POST_TEXT_SIZES = [["Small", 17], ["Medium", 19], ["Large", 21]];
const POST_BAR_TOP = 81;
// Reading preferences (text size, sans or serif), remembered on this device.
function useReadingPrefs() {
  const [prefs, setPrefsState] = useState(() => {
    try {
      const p = JSON.parse(window.localStorage.getItem(READING_PREFS_KEY) || "{}");
      return { size: POST_TEXT_SIZES.some(([, n]) => n === p.size) ? p.size : 19, font: p.font === "serif" ? "serif" : "sans" };
    } catch {
      return { size: 19, font: "sans" };
    }
  });
  const setPrefs = (next) => {
    setPrefsState(next);
    try {
      window.localStorage.setItem(READING_PREFS_KEY, JSON.stringify(next));
    } catch {
      // not persisted; non-fatal
    }
  };
  return [prefs, setPrefs];
}
function getReadPositions() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(READ_POSITION_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function saveReadPosition(postId, pct) {
  try {
    const all = getReadPositions();
    if (pct === null) delete all[postId];
    else all[postId] = { pct, at: Date.now() };
    // keep the 60 most recently touched posts so this can't grow without limit
    const kept = Object.entries(all).sort((a, b) => (b[1].at || 0) - (a[1].at || 0)).slice(0, 60);
    window.localStorage.setItem(READ_POSITION_KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch {
    // storage unavailable -- resume just won't be offered
  }
}
// Scroll progress through the post body, which section is current, and
// whether the title block has scrolled away (which is when the sticky bar and
// the floating actions appear).
function usePostScroll({ bodyRef, headerRef, headingCount, postId }) {
  const [state, setState] = useState({ pct: 0, headerGone: false, active: -1 });
  useEffect(() => {
    const onScroll = () => {
      const body = bodyRef.current;
      const header = headerRef.current;
      if (!body || !header) return;
      const top = body.getBoundingClientRect().top + window.scrollY;
      const h = Math.max(1, body.offsetHeight);
      const pct = Math.max(0, Math.min(100, Math.round(((window.scrollY + 220 - top) / h) * 100)));
      const headerGone = header.getBoundingClientRect().bottom < POST_BAR_TOP + 20;
      let active = -1;
      for (let i = 0; i < headingCount; i++) {
        const el = document.getElementById(`post-h${i}`);
        if (el && el.getBoundingClientRect().top < POST_BAR_TOP + 49 + 90) active = i;
      }
      setState((prev) => (prev.pct === pct && prev.headerGone === headerGone && prev.active === active ? prev : { pct, headerGone, active }));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [postId, headingCount]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
function TextSettings({ prefs, setPrefs, className = "" }) {
  const btn = (active) =>
    `flex-1 text-sm font-medium rounded-sm border py-2 transition-colors ${
      active
        ? "bg-[#4A5D4E] border-[#4A5D4E] text-white dark:bg-[#6E9077] dark:border-[#6E9077] dark:text-[#14161B]"
        : "bg-[#F8F7F3] dark:bg-[#14161B] border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 text-[#5B5F6B] dark:text-[#A9ADB6]"
    }`;
  return (
    <div role="dialog" aria-label="Text settings" onClick={(e) => e.stopPropagation()} className={`no-print absolute z-40 w-[250px] bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-md shadow-[0_14px_34px_-18px_rgba(28,31,38,0.45)] p-4 text-left ${className}`}>
      <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#6E717A] dark:text-[#848892] mb-2">Text size</p>
      <div className="flex gap-1.5 mb-4">
        {POST_TEXT_SIZES.map(([label, n]) => (
          <button key={n} type="button" aria-pressed={prefs.size === n} onClick={() => setPrefs({ ...prefs, size: n })} className={btn(prefs.size === n)} style={{ fontSize: n - 4 }}>
            {label}
          </button>
        ))}
      </div>
      <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#6E717A] dark:text-[#848892] mb-2">Typeface</p>
      <div className="flex gap-1.5">
        <button type="button" aria-pressed={prefs.font === "sans"} onClick={() => setPrefs({ ...prefs, font: "sans" })} className={btn(prefs.font === "sans")}>
          Sans
        </button>
        <button type="button" aria-pressed={prefs.font === "serif"} onClick={() => setPrefs({ ...prefs, font: "serif" })} className={btn(prefs.font === "serif")} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Serif
        </button>
      </div>
    </div>
  );
}
// A small toolbar that appears when a sentence in the post is selected with a
// mouse: copy it as a quote, or share it.
function SelectionToolbar({ bodyRef, post }) {
  const [sel, setSel] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onUp = () => {
      setTimeout(() => {
        const s = window.getSelection();
        const text = s ? s.toString().trim() : "";
        const body = bodyRef.current;
        if (s && !s.isCollapsed && text.length > 12 && body && body.contains(s.anchorNode)) {
          const r = s.getRangeAt(0).getBoundingClientRect();
          setSel({ text, x: Math.min(Math.max(8, r.left + r.width / 2 - 80), window.innerWidth - 168), y: Math.max(90, r.top - 50) });
        } else {
          setSel(null);
        }
      }, 10);
    };
    const hide = () => setSel(null);
    document.addEventListener("mouseup", onUp);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      document.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", hide);
    };
  }, [bodyRef, post.id]);
  if (!sel) return null;
  const url = `${window.location.origin}/${slugify(post.title)}`;
  const quote = `"${sel.text}" — ${post.title}, The Gospel Lens`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${quote}\n${url}`);
      setCopied(true);
      setTimeout(() => { setCopied(false); setSel(null); }, 900);
    } catch {
      setSel(null);
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: quote, url });
      } catch {
        // cancelled
      }
      setSel(null);
    } else {
      copy();
    }
  };
  return (
    <div className="no-print fixed z-50 flex gap-0.5 p-1 rounded-md bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]" style={{ left: sel.x, top: sel.y }} onMouseDown={(e) => e.preventDefault()}>
      <button type="button" onClick={copy} className="px-3 py-1.5 text-[12.5px] font-semibold rounded hover:bg-white/15 dark:hover:bg-black/10">
        {copied ? "Copied" : "Copy quote"}
      </button>
      <button type="button" onClick={share} className="px-3 py-1.5 text-[12.5px] font-semibold rounded hover:bg-white/15 dark:hover:bg-black/10">
        Share
      </button>
    </div>
  );
}
function PostRelatedCard({ post, onOpen }) {
  const tag = tagsForPost(post.id)[0] || post.category;
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="text-left flex flex-col gap-2 min-w-0 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 hover:border-[#B08D57]/55 rounded-sm p-[18px] transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      <span className="text-[18px] leading-[1.28] text-[#1C1F26] dark:text-[#F2F1EC]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
        {post.title}
      </span>
      <span className="text-[13.5px] leading-relaxed text-[#5B5F6B] dark:text-[#A9ADB6] line-clamp-3">{post.excerpt}</span>
      <span className="mt-auto flex justify-between gap-2 text-xs text-[#6E717A] dark:text-[#848892]">
        <span className="truncate font-medium text-[#4A5D4E] dark:text-[#8FAE95]">{tag}</span>
        <span className="whitespace-nowrap">{estimateReadTime(post).replace(" read", "")}</span>
      </span>
    </button>
  );
}
export function SinglePostView({ post, setView, goBack, openPost, openPlanPost, openCollection, openReadingPlan, cameFromPlan, openScriptureIndex, journalEntries, onSaveAnswer, signedIn, openJournal, openSeries, openTopic }) {
  const { status: listenStatus, toggle: toggleListen, restart: restartListen, supported: listenSupported } = useListenToPost(post || POSTS[0]);
  const [saved, setSaved] = useState(() => isPostSaved((post || POSTS[0]).id));
  const [liked, setLiked] = useState(() => isPostLiked((post || POSTS[0]).id));
  const [prefs, setPrefs] = useReadingPrefs();
  const [aaOpen, setAaOpen] = useState(null); // null | "rail" | "bar"
  const [tocOpen, setTocOpen] = useState(false);
  const [resumePct, setResumePct] = useState(null);
  const bodyRef = useRef(null);
  const headerRef = useRef(null);

  const headings = post ? post.blocks.filter((b) => b.type === "heading").map((b) => b.text) : [];
  const hasToc = headings.length >= 3;
  const { pct, headerGone, active } = usePostScroll({ bodyRef, headerRef, headingCount: headings.length, postId: post?.id });

  // Quietly note this post as read — see the READ HISTORY section above.
  useEffect(() => {
    if (post) recordPostRead(post.id);
  }, [post?.id]);

  // This component doesn't unmount between posts (only `post` changes), so
  // the bookmark/like toggles' own local state needs an explicit refresh
  // here rather than just a useState initializer.
  useEffect(() => {
    if (post) {
      setSaved(isPostSaved(post.id));
      setLiked(isPostLiked(post.id));
      setAaOpen(null);
      setTocOpen(false);
    }
  }, [post?.id]);

  // "Pick up where you left off": offered when someone left this post
  // partway through on this device. Local only, like read history.
  useEffect(() => {
    if (!post) return;
    const saved = getReadPositions()[post.id];
    setResumePct(saved && saved.pct >= 12 && saved.pct <= 90 && window.scrollY < 400 ? saved.pct : null);
  }, [post?.id]);
  useEffect(() => {
    if (!post) return;
    if (pct >= 96) saveReadPosition(post.id, null);
    else if (pct >= 8) {
      const t = setTimeout(() => saveReadPosition(post.id, pct), 500);
      return () => clearTimeout(t);
    }
  }, [pct, post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the text-settings popover whenever the page scrolls or someone taps elsewhere.
  useEffect(() => {
    if (!aaOpen) return;
    const close = () => setAaOpen(null);
    window.addEventListener("scroll", close, { passive: true });
    document.addEventListener("click", close);
    return () => {
      window.removeEventListener("scroll", close);
      document.removeEventListener("click", close);
    };
  }, [aaOpen]);

  if (!post) return null;

  const handleToggleSave = () => setSaved(toggleSavedPost(post.id));
  const handleToggleLike = () => setLiked(toggleLikedPost(post.id));

  const words = countPostWords(post);
  const minutes = Math.max(1, Math.round(words / 200));
  const minutesLeft = Math.max(0, Math.ceil(((100 - pct) / 100) * minutes));

  // Is this post one of the 4-Day Reading Plan's days, AND did the reader
  // actually get here by following the plan (its overview, or "Continue" on
  // the previous day)? If both, surface a banner up top (which day, and a
  // way back to the plan overview) and a "continue to the next day" card at
  // the bottom -- added 2026-09-05 after Brian pointed out that finishing
  // Day 1 dropped a reader with no way to find Day 2 or the plan itself
  // again except by remembering the URL. Gating on `cameFromPlan` too (not
  // just the id lookup) is deliberate, per Brian's explicit follow-up: the
  // same post opened from the Blogs page, search, Saved/Liked, a share
  // link, or Older/Newer nav should look exactly like any other post -- the
  // plan's outline is specific to actually being on the guided path, not a
  // permanent property of the post itself. `openPost` (used by every other
  // navigation path) resets `cameFromPlan` to false; only the plan overview
  // and this component's own "Continue" button use `openPlanPost`, which
  // sets it true.
  const planIndex = READING_PLAN_POST_IDS.indexOf(post.id);
  const isPlanPost = cameFromPlan && planIndex !== -1;
  const isLastPlanDay = isPlanPost && planIndex === READING_PLAN_POST_IDS.length - 1;
  const nextPlanPost = isPlanPost && !isLastPlanDay ? POSTS.find((p) => p.id === READING_PLAN_POST_IDS[planIndex + 1]) : null;

  // Series membership (e.g. The Proverbs Series).
  const seriesId = seriesIdForPost(post);
  const seriesPosts = seriesId ? postsInSeries(seriesId) : [];
  const seriesIndex = seriesPosts.findIndex((p) => p.id === post.id);
  const nextInSeries = seriesIndex !== -1 ? seriesPosts[seriesIndex + 1] || null : null;

  // What to read next: the next post in the series, else the closest post by topic.
  const relatedPool = getRelatedPosts(post, 5);
  const upNext = nextInSeries || relatedPool[0] || null;
  const related = relatedPool.filter((p) => !upNext || p.id !== upNext.id).slice(0, 3);
  const hasReflection = post.blocks.some((b) => b.type === "reflection");

  const sortedByDate = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentIndex = sortedByDate.findIndex((p) => p.id === post.id);
  const newerPost = currentIndex > 0 ? sortedByDate[currentIndex - 1] : null;
  const olderPost = currentIndex < sortedByDate.length - 1 ? sortedByDate[currentIndex + 1] : null;

  const scrollToHeading = (i) => {
    const el = document.getElementById(`post-h${i}`);
    if (!el) return;
    // Close the phone contents list first and scroll after the layout has
    // settled, so the heading lands exactly under the sticky bar.
    setTocOpen(false);
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };
  const quickShare = async () => {
    const url = `${window.location.origin}/${slugify(post.title)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch {
        // cancelled
      }
    } else {
      document.getElementById("post-share")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  const resumeNow = () => {
    const body = bodyRef.current;
    if (body) window.scrollTo({ top: body.getBoundingClientRect().top + window.scrollY + body.offsetHeight * (resumePct / 100) - 200, behavior: "smooth" });
    setResumePct(null);
  };

  // Hand-built hover label (not the native title attribute, which doesn't show
  // reliably in the installed desktop app -- same approach as the Scripture
  // Index icon). Sits to the left of the round buttons.
  const RailTip = ({ children }) => (
    <span
      role="tooltip"
      className="no-print pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-[#1C1F26] dark:bg-[#F2F1EC] px-2.5 py-1 text-[12px] font-medium text-[#F8F7F3] dark:text-[#1C1F26] opacity-0 group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 transition-opacity duration-150"
    >
      {children}
    </span>
  );
  const railBtn =
    "group/tip relative w-11 h-11 rounded-full border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 bg-white dark:bg-[#1E2128] text-[#5B5F6B] dark:text-[#A9ADB6] flex items-center justify-center hover:border-[#4A5D4E] hover:text-[#4A5D4E] dark:hover:text-[#8FAE95] transition-colors duration-200";
  const listenIcon = listenStatus === "speaking" ? <Pause size={16} strokeWidth={2} /> : <Headphones size={16} strokeWidth={2} />;
  const listenLabel = listenStatus === "speaking" ? "Pause" : listenStatus === "paused" ? "Resume" : "Listen";
  const pill =
    "inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#5B5F6B] dark:text-[#A9ADB6] bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 px-[15px] py-2.5 rounded-full hover:border-[#4A5D4E]/60 hover:text-[#4A5D4E] transition-colors duration-200";
  const eyebrow = "text-[12px] font-semibold tracking-[0.2em] uppercase text-[#7F6637] dark:text-[#D9B77C]";
  const topicName = tagsForPost(post.id)[0] || post.category;

  return (
    <article className="pb-28">
      {/* Sticky reading bar: a thin progress line always, plus the title and
          time left once the title block has scrolled away. Zero layout height,
          so it never shifts the page. */}
      <div className="no-print sticky top-[81px] z-20 h-0">
        <div className={`absolute inset-x-0 top-0 transition-colors duration-200 ${headerGone ? "bg-[#F8F7F3]/95 dark:bg-[#14161B]/95 backdrop-blur-sm border-b border-[#1C1F26]/12 dark:border-[#F2F1EC]/14" : "border-b border-transparent"}`}>
          <div
            className={`max-w-[1080px] mx-auto px-6 sm:px-8 flex items-center gap-3.5 overflow-hidden transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
              headerGone ? "h-[46px] opacity-100" : "h-0 opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <button type="button" onClick={() => goBack("blog")} aria-label="Back" className="flex items-center justify-center w-11 h-11 -ml-3.5 text-[#4A5D4E] dark:text-[#6E9077]">
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0 truncate text-[15px] text-[#1C1F26] dark:text-[#F2F1EC]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              {post.title}
            </div>
            <div className="text-[12.5px] whitespace-nowrap tabular-nums text-[#6E717A] dark:text-[#848892]">
              {pct >= 98 ? "Done" : `${minutesLeft} min left`} · {pct}%
            </div>
          </div>
          <div className="h-[3px] bg-[#4A5D4E]/10 dark:bg-[#6E9077]/15">
            <div className="h-full bg-[#B08D57]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-6 sm:px-8 pt-10 sm:pt-14">
        <div ref={headerRef} className="max-w-[760px]">
          <button
            onClick={() => goBack("blog")}
            className="hit no-print inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-6 hover:gap-3 transition-all duration-300"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back
          </button>

          {isPlanPost && (
            <div className="no-print flex items-center justify-between gap-3 mb-6 bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm px-4 py-3">
              <span className="text-[13px] font-medium text-[#7F6637] dark:text-[#D9B77C]">
                Day {planIndex + 1} of {READING_PLAN_POST_IDS.length} · 4-Day Reading Plan
              </span>
              <button onClick={openReadingPlan} className="text-[13px] font-medium text-[#7F6637] dark:text-[#B08D57] hover:underline whitespace-nowrap shrink-0">
                View Plan
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-[18px]">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-[#5B5F6B] dark:text-[#A9ADB6] bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-full px-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${BLOG_CAT_DOT[post.category] || "bg-[#6E717A]"}`} />
              {post.category}
            </span>
            {seriesId && seriesIndex !== -1 && (
              <button
                type="button"
                onClick={() => openSeries(seriesId)}
                className="no-print text-[12px] font-semibold tracking-[0.12em] uppercase text-[#9A5B45] dark:text-[#E3A98F] bg-[#9A5B45]/8 dark:bg-[#D08A70]/10 border border-[#9A5B45]/30 dark:border-[#D08A70]/35 rounded-full px-3 py-1.5 hover:bg-[#9A5B45]/14"
              >
                {SERIES[seriesId].name} · No. {seriesIndex + 1} of {seriesPosts.length}
              </button>
            )}
          </div>

          <h1 className="text-[#1C1F26] dark:text-[#F2F1EC] text-[34px] sm:text-5xl lg:text-[56px] leading-[1.1] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, textWrap: "balance" }}>
            {post.title}
          </h1>
          <p className="text-[18px] sm:text-[21px] leading-[1.5] italic text-[#5B5F6B] dark:text-[#A9ADB6] mb-5 max-w-[62ch]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {post.excerpt}
          </p>
          <p className="post-byline flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13.5px] text-[#6E717A] dark:text-[#848892]">
            {post.author && AUTHORS[post.author] ? (
              <button onClick={() => openCollection(post.author)} className="hit font-semibold text-[#5B5F6B] dark:text-[#A9ADB6] underline underline-offset-[3px]">
                By {post.author}
              </button>
            ) : post.author ? (
              <span className="font-semibold text-[#5B5F6B] dark:text-[#A9ADB6]">By {post.author}</span>
            ) : null}
            <span>{post.date}</span>
            <span>
              <b className="font-semibold text-[#5B5F6B] dark:text-[#A9ADB6]">{minutes} min read</b> · {words.toLocaleString()} words
            </span>
          </p>

          <div className="no-print flex flex-wrap items-center gap-2.5 mt-6">
            {listenSupported && (
              <>
                <button
                  type="button"
                  onClick={toggleListen}
                  className="inline-flex items-center gap-2 bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] rounded-full pl-4 pr-5 py-[11px] text-sm font-semibold hover:bg-[#4A5D4E] dark:hover:bg-white transition-colors duration-200"
                >
                  {listenIcon}
                  {listenLabel}
                  <span className="font-medium opacity-70 text-[12.5px]">{minutes} min</span>
                </button>
                {listenStatus !== "idle" && (
                  <button type="button" onClick={restartListen} aria-label="Restart from the beginning" title="Restart from the beginning" className="w-9 h-9 rounded-full border border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 text-[#6E717A] flex items-center justify-center hover:text-[#4A5D4E]">
                    <RotateCcw size={13} strokeWidth={2} />
                  </button>
                )}
              </>
            )}
            <button type="button" onClick={handleToggleLike} className={`${pill} ${liked ? "!text-[#C1584A] !border-[#C1584A]/45" : "hover:!border-[#C1584A]/50 hover:!text-[#C1584A]"}`}>
              <Heart size={15} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
              {liked ? "Liked" : "Like"}
            </button>
            <button type="button" onClick={handleToggleSave} className={`${pill} ${saved ? "!text-[#B08D57] !border-[#B08D57]/55" : ""}`}>
              <Bookmark size={15} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved" : "Save for Later"}
            </button>
          </div>
        </div>

        {resumePct !== null && (
          <div className="no-print flex flex-wrap items-center gap-3 mt-6 max-w-[760px] bg-[#4A5D4E]/8 dark:bg-[#6E9077]/12 border border-[#4A5D4E]/20 dark:border-[#6E9077]/25 rounded-sm px-3.5 py-3 text-sm text-[#2E323B] dark:text-[#D9D9D9]">
            <span>
              You were <b className="text-[#1C1F26] dark:text-[#F2F1EC]">{resumePct}%</b> through this post.
            </span>
            <button type="button" onClick={resumeNow} className="font-semibold text-[#4A5D4E] dark:text-[#8FAE95] underline underline-offset-[3px]">
              Continue where you left off
            </button>
            <button type="button" onClick={() => { saveReadPosition(post.id, null); setResumePct(null); }} className="font-semibold text-[#6E717A] underline underline-offset-[3px]">
              Start over
            </button>
          </div>
        )}

        {/* body: contents rail | text | floating actions (3 columns on wide screens) */}
        <div className="mt-8 min-[1180px]:mt-10 min-[1180px]:grid min-[1180px]:grid-cols-[200px_minmax(0,680px)_52px] min-[1180px]:gap-x-11 min-[1180px]:justify-center min-[1180px]:items-start">
          <aside className="no-print hidden min-[1180px]:block sticky top-[151px] pt-1.5">
            {hasToc && (
              <>
                <h2 className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#6E717A] dark:text-[#848892] mb-3" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  In this post
                </h2>
                <ol className="list-none m-0 p-0 border-l border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a
                        href={`#post-h${i}`}
                        onClick={(e) => { e.preventDefault(); scrollToHeading(i); }}
                        className={`block py-[7px] pl-3.5 -ml-px border-l-2 text-[13.5px] leading-[1.4] transition-colors ${
                          active === i ? "border-[#B08D57] text-[#1C1F26] dark:text-[#F2F1EC] font-semibold" : "border-transparent text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
                        }`}
                      >
                        {h}
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <p className="mt-[18px] text-[12.5px] leading-snug text-[#6E717A] dark:text-[#848892]">
              <b className="tabular-nums font-semibold text-[#1C1F26] dark:text-[#F2F1EC]">{pct >= 98 ? 0 : minutesLeft} min</b> left to read
            </p>
          </aside>

          <div className="min-w-0">
            {hasToc && (
              <details open={tocOpen} onToggle={(e) => setTocOpen(e.currentTarget.open)} className="no-print min-[1180px]:hidden mb-6 border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 rounded-sm bg-white dark:bg-[#1E2128]">
                <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between px-4 py-3 text-[13px] font-semibold tracking-[0.04em] text-[#1C1F26] dark:text-[#F2F1EC] cursor-pointer">
                  In this post · {headings.length} sections
                  <ChevronDown size={15} strokeWidth={2} className={`transition-transform ${tocOpen ? "rotate-180" : ""}`} />
                </summary>
                <ol className="list-none m-0 px-4 pb-3">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a
                        href={`#post-h${i}`}
                        onClick={(e) => { e.preventDefault(); scrollToHeading(i); }}
                        className="block py-2 border-t border-[#1C1F26]/7 dark:border-[#F2F1EC]/8 text-[14.5px] text-[#5B5F6B] dark:text-[#A9ADB6]"
                      >
                        {h}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div ref={bodyRef}>
              <PostBody
                blocks={post.blocks}
                post={post}
                prefs={prefs}
                openScriptureIndex={openScriptureIndex}
                journalEntries={journalEntries}
                onSaveAnswer={onSaveAnswer}
                signedIn={signedIn}
                openJournal={openJournal}
              />
            </div>
          </div>

          {/* floating actions (wide screens): follow you down the page */}
          <aside className={`no-print hidden min-[1180px]:flex sticky top-[151px] flex-col items-center gap-2 pt-1.5 transition-opacity duration-200 ${headerGone ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {listenSupported && (
              <button type="button" onClick={toggleListen} aria-label={listenLabel} className={railBtn}>
                {listenIcon}
                <RailTip>{listenStatus === "idle" ? "Listen to this post" : listenLabel}</RailTip>
              </button>
            )}
            <button type="button" onClick={handleToggleLike} aria-label={liked ? "Remove from Liked Posts" : "Like this post"} className={`${railBtn} ${liked ? "!text-[#C1584A] !border-[#C1584A]/50" : ""}`}>
              <Heart size={16} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
              <RailTip>{liked ? "Liked" : "Like"}</RailTip>
            </button>
            <button type="button" onClick={handleToggleSave} aria-label={saved ? "Remove from Saved Posts" : "Save for later"} className={`${railBtn} ${saved ? "!text-[#B08D57] !border-[#B08D57]/60" : ""}`}>
              <Bookmark size={16} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
              <RailTip>{saved ? "Saved" : "Save for later"}</RailTip>
            </button>
            <button type="button" onClick={quickShare} aria-label="Share" className={railBtn}>
              <Share2 size={16} strokeWidth={2} />
              <RailTip>Share</RailTip>
            </button>
            <div className="relative">
              <button type="button" onClick={(e) => { e.stopPropagation(); setAaOpen(aaOpen === "rail" ? null : "rail"); }} aria-label="Text settings" className={railBtn}>
                <Type size={16} strokeWidth={2} />
                {aaOpen !== "rail" && <RailTip>Text size and font</RailTip>}
              </button>
              {aaOpen === "rail" && <TextSettings prefs={prefs} setPrefs={setPrefs} className="right-full mr-3 top-0" />}
            </div>
          </aside>
        </div>
      </div>

      {/* the end of the post */}
      <div className="max-w-[1080px] mx-auto px-6 sm:px-8 pt-8">
        <div className="min-[1180px]:ml-[244px] max-w-[760px]">
          <div className="no-print border-t border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
            <div id="post-share" className="scroll-mt-40">
              <ShareBar post={post} onPrint={() => window.print()} />
            </div>
          </div>

          {isPlanPost && (
            <div className="no-print bg-[#1C1F26] dark:bg-[#14161B] border border-[#F2F1EC]/10 rounded-sm px-6 py-6 mt-8">
              <p className="text-[12px] uppercase tracking-[0.15em] text-[#B08D57] font-semibold mb-2">4-Day Reading Plan</p>
              {nextPlanPost ? (
                <>
                  <p className="text-[#F2F1EC] text-[15px] mb-4">Take a few minutes to think about what you just read. Ready for Day {planIndex + 2}?</p>
                  <button onClick={() => openPlanPost(nextPlanPost)} className="inline-flex items-center gap-2 bg-[#F2F1EC] text-[#1C1F26] px-5 py-2.5 text-sm font-medium rounded-full hover:bg-white transition-colors duration-200">
                    Continue to Day {planIndex + 2}: {nextPlanPost.title}
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[#F2F1EC] text-[15px] mb-4">That's all 4 days — you've read the whole plan. Take a moment to sit with what you've read before you go.</p>
                  <button onClick={openReadingPlan} className="inline-flex items-center gap-2 bg-[#F2F1EC] text-[#1C1F26] px-5 py-2.5 text-sm font-medium rounded-full hover:bg-white transition-colors duration-200">
                    Review the Plan
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          )}

          {upNext && (
            <div className="no-print">
              <h2 className={`${eyebrow} mt-10 mb-3.5`} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                {nextInSeries ? `Next in ${SERIES[seriesId].name} · No. ${seriesIndex + 2} of ${seriesPosts.length}` : "Up next"}
              </h2>
              <button
                type="button"
                onClick={() => openPost(upNext)}
                className="block w-full text-left bg-[#1C1F26] dark:bg-[#0B0D10] text-[#F8F7F3] rounded-sm px-6 sm:px-7 py-6 sm:py-[26px] transition-all duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-[0_14px_34px_-18px_rgba(28,31,38,0.45)]"
              >
                <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#D9B77C]">
                  {nextInSeries ? "Continue the series" : "Because you read this"} · {estimateReadTime(upNext).replace(" read", "")}
                </span>
                <span className="block text-2xl sm:text-[28px] leading-[1.2] mt-2 mb-2.5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {upNext.title}
                </span>
                <span className="block text-[15.5px] leading-relaxed text-[#C3C6CD] mb-3.5">{upNext.excerpt}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D9B77C]">
                  Read next
                  <ArrowRight size={14} strokeWidth={2} />
                </span>
              </button>
            </div>
          )}

          {hasReflection && (
            <div className="no-print flex flex-wrap items-center gap-4 mt-3.5 bg-white dark:bg-[#1E2128] border border-dashed border-[#4A5D4E]/55 dark:border-[#6E9077]/55 rounded-sm px-[22px] py-5">
              <div className="flex-1 min-w-[200px]">
                <b className="block text-lg text-[#1C1F26] dark:text-[#F2F1EC] mb-0.5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  Put it into words
                </b>
                <span className="text-[14.5px] text-[#5B5F6B] dark:text-[#A9ADB6]">Answer this post's reflection questions privately, in your own Journal.</span>
              </div>
              <button type="button" onClick={() => document.getElementById("post-reflection")?.scrollIntoView({ behavior: "smooth", block: "start" })} className={pill}>
                <NotebookPen size={15} strokeWidth={2} />
                Go to the questions
              </button>
            </div>
          )}

          {related.length > 0 && (
            <div className="no-print">
              <h2 className={`${eyebrow} mt-10 mb-3.5`} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                {openTopic && tagsForPost(post.id)[0] ? (
                  <button type="button" onClick={() => openTopic(tagsForPost(post.id)[0])} className="hit hover:underline underline-offset-[3px] text-left">
                    More on {topicName}
                  </button>
                ) : (
                  `More on ${topicName}`
                )}
              </h2>
              <div className="grid sm:grid-cols-3 gap-3.5">
                {related.map((p) => (
                  <PostRelatedCard key={p.id} post={p} onOpen={openPost} />
                ))}
              </div>
            </div>
          )}

          <div className="no-print flex flex-wrap items-center justify-between gap-5 mt-10 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 rounded-sm px-6 sm:px-7 py-6">
            <div className="min-w-0">
              <h3 className="text-[22px] text-[#1C1F26] dark:text-[#F2F1EC] mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                Get the next one by email
              </h3>
              <p className="text-[14.5px] text-[#5B5F6B] dark:text-[#A9ADB6]">Get new posts in your inbox. Confirm once, unsubscribe anytime.</p>
            </div>
            <NewsletterForm />
          </div>

          {(olderPost || newerPost) && (
            <div className="no-print grid grid-cols-2 gap-3.5 mt-9">
              {olderPost ? (
                <button onClick={() => openPost(olderPost)} className="text-left border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 rounded-sm px-4 py-3.5 hover:border-[#4A5D4E]/60 transition-colors duration-200">
                  <span className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] mb-1">
                    <ArrowLeft size={11} strokeWidth={2} /> Older
                  </span>
                  <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{olderPost.title}</span>
                </button>
              ) : (
                <div />
              )}
              {newerPost ? (
                <button onClick={() => openPost(newerPost)} className="text-right border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 rounded-sm px-4 py-3.5 hover:border-[#4A5D4E]/60 transition-colors duration-200">
                  <span className="flex items-center justify-end gap-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] mb-1">
                    Newer <ArrowRight size={11} strokeWidth={2} />
                  </span>
                  <span className="text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] line-clamp-2">{newerPost.title}</span>
                </button>
              ) : (
                <div />
              )}
            </div>
          )}

          <div className="no-print mt-8">
            <button onClick={() => goBack("blog")} className="hit inline-flex items-center gap-2 text-sm font-medium text-[#1C1F26] dark:text-[#F2F1EC] hover:text-[#4A5D4E] transition-colors duration-300">
              <ArrowLeft size={15} strokeWidth={2} />
              Back
            </button>
          </div>
        </div>
      </div>

      <SelectionToolbar bodyRef={bodyRef} post={post} />

      {/* bottom action bar (everything narrower than the wide layout) */}
      <div className={`no-print min-[1180px]:hidden fixed inset-x-0 bottom-0 z-30 border-t border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 bg-white/96 dark:bg-[#1E2128]/96 backdrop-blur-sm transition-transform duration-250 motion-reduce:transition-none ${headerGone ? "translate-y-0" : "translate-y-[110%]"}`} style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="relative flex justify-around gap-1 px-2.5 py-2 max-w-[760px] mx-auto">
          {[
            listenSupported && { key: "l", label: listenLabel, icon: listenIcon, on: toggleListen },
            { key: "h", label: "Like", icon: <Heart size={18} strokeWidth={2} fill={liked ? "currentColor" : "none"} />, on: handleToggleLike, active: liked, tone: "text-[#C1584A]" },
            { key: "s", label: "Save", icon: <Bookmark size={18} strokeWidth={2} fill={saved ? "currentColor" : "none"} />, on: handleToggleSave, active: saved, tone: "text-[#B08D57]" },
            { key: "x", label: "Share", icon: <Share2 size={18} strokeWidth={2} />, on: quickShare },
          ]
            .filter(Boolean)
            .map((b) => (
              <button key={b.key} type="button" onClick={b.on} className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[12px] font-medium ${b.active ? b.tone : "text-[#5B5F6B] dark:text-[#A9ADB6]"}`}>
                {b.icon}
                {b.label}
              </button>
            ))}
          <button type="button" onClick={(e) => { e.stopPropagation(); setAaOpen(aaOpen === "bar" ? null : "bar"); }} className="flex-1 flex flex-col items-center gap-0.5 py-1.5 text-[12px] font-medium text-[#5B5F6B] dark:text-[#A9ADB6]">
            <Type size={18} strokeWidth={2} />
            Text
          </button>
          {aaOpen === "bar" && <TextSettings prefs={prefs} setPrefs={setPrefs} className="bottom-full mb-3 right-2" />}
        </div>
      </div>
    </article>
  );
}
