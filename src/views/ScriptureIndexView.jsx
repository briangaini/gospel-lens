import { useEffect, useMemo, useState } from "react";
import { loadScriptureEntries } from "../lib/lazyContent";
import { buildScriptureIndex } from "../lib/scriptureIndex";
import {
  ArrowLeft,
} from "lucide-react";

// One shared page for every Scripture Focus reference on the site -- see
// the SCRIPTURE INDEX section above for how the data's built. Approved via
// a mocked demo first (per Brian's ask to see anything visual before it's
// built), including his explicit correction from the first pass: one
// shared index page grouped by book, not a separate page per verse.
export function ScriptureIndexView({ openPost, setView, goBack }) {
  const [rawEntries, setRawEntries] = useState(null);
  useEffect(() => {
    let live = true;
    loadScriptureEntries().then((e) => live && setRawEntries(e));
    return () => {
      live = false;
    };
  }, []);
  const groups = useMemo(() => (rawEntries ? buildScriptureIndex(rawEntries) : []), [rawEntries]);
  const total = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => goBack("blog")}
        className="hit inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back
      </button>

      <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] dark:text-[#B08D57] font-semibold mb-3">Scripture Index</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-3"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        Every Verse, In One Place
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] leading-relaxed max-w-xl mb-3">
        Every Scripture Focus reference cited across The Gospel Lens, grouped by book{rawEntries ? ` — ${total} in all` : ""}. Tap any one to read it in context.
      </p>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <div key={group.book}>
            <h2
              className="text-[#7F6637] dark:text-[#B08D57] text-lg mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            >
              {group.book}
            </h2>
            <div className="divide-y divide-[#1C1F26]/8 dark:divide-[#F2F1EC]/10 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
              {group.entries.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => openPost(entry.post)}
                  className="w-full text-left grid sm:grid-cols-[110px_1fr_auto] gap-x-4 gap-y-1 items-baseline py-3.5 group"
                >
                  <span
                    className="text-[#1C1F26] dark:text-[#F2F1EC] text-[14.5px] font-bold"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {entry.chapterVerse}
                  </span>
                  <span className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[13.5px] italic leading-snug line-clamp-2">
                    "{entry.verseText}"
                  </span>
                  <span className="text-[#7F6637] dark:text-[#B08D57] text-[12.5px] font-medium sm:whitespace-nowrap group-hover:underline underline-offset-2">
                    {entry.post.title} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
