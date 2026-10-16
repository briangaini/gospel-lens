import { POSTS } from "../lib/posts";
import { useEffect, useState } from "react";
import { loadReflections } from "../lib/lazyContent";
import {
  ArrowLeft,
  Check,
  Download,
  Lock,
  NotebookPen,
  Trash2,
} from "lucide-react";
import { JournalAnswerBox } from "../components/JournalAnswerBox";

// Groups the raw journal entries (tombstones included) into one row per
// post, newest-activity-first -- the /journal page's Reflections tab reads
// directly from GospelLensApp's lifted state, so this recomputes on every
// render rather than being cached in its own local state (see the section
// comment above JOURNAL_KEY for why that's deliberate: it's what lets a
// cross-device sync update this view with no reload).
function groupJournalEntries(entries) {
  const byPost = new Map();
  for (const entry of entries) {
    if (entry.deleted) continue;
    if (!byPost.has(entry.postId)) byPost.set(entry.postId, []);
    byPost.get(entry.postId).push(entry);
  }
  const groups = [];
  for (const [postId, items] of byPost) {
    const post = POSTS.find((p) => p.id === postId);
    if (!post) continue;
    const sorted = [...items].sort((a, b) => a.qIndex - b.qIndex);
    const mostRecent = Math.max(...items.map((e) => e.updatedAt));
    groups.push({ postId, post, items: sorted, mostRecent });
  }
  groups.sort((a, b) => b.mostRecent - a.mostRecent);
  return groups;
}
function buildJournalExportText(groups, questionText) {
  const lines = ["Your Reflections — The Gospel Lens", `Exported ${new Date().toLocaleDateString()}`, ""];
  for (const group of groups) {
    lines.push(group.post.title, group.post.date, "");
    for (const entry of group.items) {
      const question = questionText(group.postId, entry.qIndex) || `Question ${entry.qIndex + 1}`;
      lines.push(`Q: ${question}`, `A: ${entry.text}`, `(${new Date(entry.updatedAt).toLocaleDateString()})`, "");
    }
  }
  return lines.join("\n");
}
// A private place for both halves of the Reflection Journal idea -- answers
// to each post's Reflection Questions (grouped by post, below) and a
// separate, free-form prayer list with an Answered toggle. Neither needs a
// Back button, same as Saved/Liked -- reached directly from the hamburger
// menu, not something navigated "into" from deep inside another flow.
export function JournalView({ journalEntries, prayerList, onSaveAnswer, onAddPrayer, onToggleAnswered, onDeletePrayer, openPost, setView, user, onSignIn, signedIn, goBack }) {
  // Deep-linked from a post's own prayer-block nudge via openJournal("prayer")
  // (pushes "/journal#prayer") -- read once on mount, same pattern as
  // READING a path elsewhere in this app, so landing here from that specific
  // link opens straight to the Prayer List instead of always defaulting to
  // Reflections.
  const [tab, setTab] = useState(() => (typeof window !== "undefined" && window.location.hash === "#prayer" ? "prayer" : "reflections"));
  const [prayerDraft, setPrayerDraft] = useState("");
  // The reflection questions aren't part of the always-loaded post details, so
  // they are fetched when the Journal opens.
  const [reflections, setReflections] = useState(null);
  useEffect(() => {
    let live = true;
    loadReflections().then((r) => live && setReflections(r));
    return () => {
      live = false;
    };
  }, []);
  const questionText = (postId, qIndex) => reflections?.[postId]?.[qIndex] ?? null;

  const groups = groupJournalEntries(journalEntries);
  const activePrayers = prayerList.filter((p) => !p.deleted);
  const unanswered = activePrayers.filter((p) => !p.answeredAt).sort((a, b) => b.createdAt - a.createdAt);
  const answered = activePrayers.filter((p) => p.answeredAt).sort((a, b) => b.answeredAt - a.answeredAt);

  const handleExport = () => {
    const text = buildJournalExportText(groups, questionText);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gospel-lens-reflections.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddPrayer = (e) => {
    e.preventDefault();
    if (!prayerDraft.trim()) return;
    onAddPrayer(prayerDraft);
    setPrayerDraft("");
  };

  const tabClass = (t) =>
    `text-sm font-semibold pb-2.5 border-b-2 transition-colors duration-200 ${
      tab === t
        ? "text-[#1C1F26] dark:text-[#F2F1EC] border-[#B08D57]"
        : "text-[#6E717A] dark:text-[#848892] border-transparent hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
    }`;

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pt-16 pb-28">
      <button
        onClick={() => goBack("blog")}
        className="hit inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] mb-10 hover:gap-3 transition-all duration-300"
      >
        <ArrowLeft size={15} strokeWidth={2} />
        Back
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <h1 className="text-4xl text-[#1C1F26] dark:text-[#F2F1EC]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Your Reflections
        </h1>
        {tab === "reflections" && groups.length > 0 && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-4 py-2 text-xs font-medium hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-200 rounded-sm"
          >
            <Download size={13} strokeWidth={2} />
            Export as Text
          </button>
        )}
      </div>

      {user ? (
        <div className="flex gap-3 bg-[#FBF8F1] dark:bg-[#1E1A14] border border-[#E6DCC6] dark:border-[#3A3022] rounded-sm px-5 py-4 mb-8 text-[13px] leading-relaxed text-[#5B5F6B] dark:text-[#A9ADB6]">
          <Lock size={15} strokeWidth={2} className="text-[#B08D57] shrink-0 mt-0.5" />
          <p>
            <span className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium">Synced as {user.email}.</span> Your reflections are
            stored in your own account and aren't visible to other visitors. As the site owner, Brian technically has
            database-level access to this project — but entries are never read, reviewed, or used for anything.
          </p>
        </div>
      ) : (
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-8 max-w-lg">
          Private answers to each post's Reflection Questions, plus your own prayer list — stored on this device only.{" "}
          <button onClick={onSignIn} className="hit text-[#4A5D4E] dark:text-[#6E9077] font-medium hover:underline">
            Sign in with Google
          </button>{" "}
          to sync these across your devices instead.
        </p>
      )}

      <div className="flex gap-7 border-b border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 mb-5">
        <button onClick={() => setTab("reflections")} className={tabClass("reflections")}>
          Reflections
        </button>
        <button onClick={() => setTab("prayer")} className={tabClass("prayer")}>
          Prayer List
        </button>
      </div>

      <div className="bg-[#FBF8F1] dark:bg-[#1E1A14] border border-[#E6DCC6] dark:border-[#3A3022] rounded-sm px-4 py-3 mb-6 text-[12.5px] text-[#5B5F6B] dark:text-[#A9ADB6] leading-relaxed">
        {tab === "reflections"
          ? "Answer each post's Reflection Questions in your own words, then come back anytime to see how your thinking — or your heart — has grown."
          : "A place to actually write your prayers down, not just think them. Add a request, then mark it Answered when God moves — a quiet record of what you brought to Him."}
      </div>

      {tab === "reflections" ? (
        groups.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
            <NotebookPen size={28} strokeWidth={1.75} className="mx-auto text-[#6E717A] dark:text-[#848892] mb-4" />
            <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-6">
              Nothing in your journal yet — answer a Reflection Question on any post to start one.
            </p>
            <button
              onClick={() => setView("blog")}
              className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-6 py-2.5 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
            >
              Browse the Blogs
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.postId}>
                <button
                  onClick={() => openPost(group.post)}
                  className="text-left mb-3 hover:text-[#4A5D4E] dark:hover:text-[#6E9077] transition-colors duration-200"
                >
                  <p className="text-[15.5px] text-[#1C1F26] dark:text-[#F2F1EC]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                    {group.post.title}
                  </p>
                  <span className="text-[12px] text-[#6E717A] dark:text-[#848892]">{group.post.date}</span>
                </button>
                <div className="space-y-4">
                  {group.items.map((entry) => (
                    <div key={entry.id} className="bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-5 py-4">
                      <p className="text-[12px] italic text-[#6E717A] dark:text-[#848892] mb-2">
                        {questionText(group.postId, entry.qIndex)}
                      </p>
                      <JournalAnswerBox
                        postId={entry.postId}
                        qIndex={entry.qIndex}
                        savedText={entry.text}
                        onSave={onSaveAnswer}
                        onDelete={() => onSaveAnswer(entry.postId, entry.qIndex, "")}
                        signedIn={signedIn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <form onSubmit={handleAddPrayer} className="flex gap-2 mb-6">
            <input
              type="text"
              value={prayerDraft}
              onChange={(e) => setPrayerDraft(e.target.value)}
              placeholder="Add a prayer request…"
              className="flex-1 min-w-0 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 rounded-sm px-3.5 py-2.5 text-base sm:text-[13.5px] text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#6E717A] focus:outline-none focus:border-[#4A5D4E]"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] px-5 py-2.5 text-[13px] font-medium rounded-sm hover:bg-[#4A5D4E] dark:hover:bg-[#6E9077] dark:hover:text-[#F8F7F3] transition-colors duration-200"
            >
              Add
            </button>
          </form>

          {activePrayers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[#1C1F26]/12 dark:border-[#F2F1EC]/15 rounded-sm">
              <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px]">Nothing here yet — add a prayer request above.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {unanswered.map((prayer) => (
                  <PrayerRow key={prayer.id} prayer={prayer} onToggleAnswered={onToggleAnswered} onDelete={onDeletePrayer} />
                ))}
              </div>
              {answered.length > 0 && (
                <>
                  <p className="text-[12px] uppercase tracking-[0.15em] text-[#6E717A] dark:text-[#848892] font-semibold mt-8 mb-3">
                    Answered
                  </p>
                  <div className="space-y-2.5">
                    {answered.map((prayer) => (
                      <PrayerRow key={prayer.id} prayer={prayer} onToggleAnswered={onToggleAnswered} onDelete={onDeletePrayer} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
function PrayerRow({ prayer, onToggleAnswered, onDelete }) {
  const isAnswered = Boolean(prayer.answeredAt);
  return (
    <div className="flex gap-3 items-start bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-4 py-3.5">
      <button
        onClick={() => onToggleAnswered(prayer.id)}
        aria-label={isAnswered ? "Mark as unanswered" : "Mark as answered"}
        className={`shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-colors duration-200 relative before:content-[''] before:absolute before:-inset-3 ${
          isAnswered
            ? "bg-[#3D7A5C] border-[#3D7A5C] text-white dark:bg-[#6FB391] dark:border-[#6FB391] dark:text-[#14161B]"
            : "border-[#1C1F26]/25 dark:border-[#F2F1EC]/25 hover:border-[#4A5D4E]"
        }`}
      >
        {isAnswered && <Check size={11} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[13.5px] leading-relaxed ${isAnswered ? "text-[#6E717A] dark:text-[#848892] line-through decoration-[#6E717A]/50" : "text-[#2E323B] dark:text-[#D9D9D9]"}`}>
          {prayer.text}
        </p>
        <span className="text-[12px] text-[#6E717A] dark:text-[#848892]">
          Added {new Date(prayer.createdAt).toLocaleDateString()}
          {isAnswered && ` · Answered ${new Date(prayer.answeredAt).toLocaleDateString()}`}
        </span>
      </div>
      <button
        onClick={() => {
          if (window.confirm("Delete this prayer request?")) onDelete(prayer.id);
        }}
        aria-label="Delete prayer request"
        className="shrink-0 p-2 -m-2 text-[#6E717A] dark:text-[#848892] hover:text-[#C1584A] transition-colors duration-200"
      >
        <Trash2 size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
