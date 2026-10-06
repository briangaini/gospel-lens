// =============================================================================
// CLASSIC HOMEPAGE -- saved 2026-10-06, the day before the makeover shipped.
// NOT imported anywhere and NOT part of the build (it lives outside src/).
// It is a plain copy so the old homepage can be put back without digging
// through git. The full snapshot also exists as the git tag
// homepage-classic-2026-10-06. See "Homepage restore" in CLAUDE.md for the
// exact steps. Components below are in the order they were in App.jsx.
// =============================================================================

// --- getFromArchivePost (original, takes no arguments) ---
// "From the Archive" — resurfaces an older post on the homepage, one per
// calendar week. Originally proposed as a date-anniversary ("one year ago
// today") widget, but every post on the site so far is from the same
// year, so that version would have shown nothing until 2027 — this
// version works immediately instead, and everyone sees the same pick
// during the same week (not a different one per page load) so it reads as
// a deliberate choice rather than a random shuffle.
function getFromArchivePost() {
  const recentIds = new Set(
    [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3).map((p) => p.id)
  );
  // Sorted by id (not array position) so the cycling order stays stable
  // even if posts are edited or reordered in the array later.
  const eligible = [...POSTS].filter((p) => !recentIds.has(p.id)).sort((a, b) => a.id - b.id);
  if (eligible.length === 0) return null;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor(Date.now() / msPerWeek);
  return eligible[weekNumber % eligible.length];
}

// --- VerseOfDay ---
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
    <div className="max-w-2xl mx-auto px-6 sm:px-8 -mt-6 mb-6">
      <div className="bg-[#1C1F26] rounded-sm px-7 py-7 sm:px-9 sm:py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#B08D57] font-semibold mb-4">
          <Sunrise size={13} strokeWidth={2} />
          Verse of the Day
        </div>
        <p
          className="text-[#F8F7F3] text-lg sm:text-xl leading-relaxed italic"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          "{verse.text}"
        </p>
        <p className="text-[#B0B4BD] text-sm mt-4 tracking-wide">— {verse.reference}, ESV</p>
        <button
          onClick={handleShare}
          disabled={status === "working"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B0B4BD] hover:text-[#B08D57] mt-5 transition-colors duration-200 disabled:opacity-60"
        >
          {status === "done" || status === "fallback" ? <Check size={13} strokeWidth={2} /> : <Share2 size={13} strokeWidth={2} />}
          {labels[status]}
        </button>
      </div>
    </div>
  );
}

// --- ContinueReadingCard ---
// Quiet "pick up where you left off" nudge — only appears once a visitor
// has actually opened a post before (see READ HISTORY above), pointing at
// the most recent one. Reads localStorage once per mount, which is enough
// since HomeView remounts fresh whenever the view switches back to Home.
function ContinueReadingCard({ openPost }) {
  const [lastPost] = useState(() => {
    const history = getReadHistory();
    if (!history.length) return null;
    return POSTS.find((p) => p.id === history[history.length - 1].id) || null;
  });

  if (!lastPost) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 -mt-8 mb-4">
      <button
        onClick={() => openPost(lastPost)}
        className="w-full text-left flex items-center justify-between gap-4 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm px-5 py-4 hover:border-[#4A5D4E]/50 transition-colors duration-200"
      >
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A8D96] dark:text-[#7C808A] font-semibold">
            Continue Reading
          </span>
          <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium mt-0.5 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lastPost.title}
          </div>
        </div>
        <ArrowRight size={16} strokeWidth={2} className="shrink-0 text-[#4A5D4E]" />
      </button>
    </div>
  );
}

// --- FromArchiveCard ---
// Dark solid card, deliberately distinct from the lighter Continue Reading
// card just above it, matching the treatment approved in the mockup —
// makes it read as a separate "worth a second look" moment rather than
// blending into ordinary post cards.
function FromArchiveCard({ openPost }) {
  const [post] = useState(() => getFromArchivePost());
  if (!post) return null;

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-4">
      <button
        onClick={() => openPost(post)}
        className="w-full text-left flex items-center gap-4 bg-[#1C1F26] rounded-sm px-6 py-5 hover:bg-[#252932] transition-colors duration-200"
      >
        <Archive size={20} strokeWidth={1.75} className="text-[#B08D57] shrink-0" />
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#B08D57] font-semibold">From the Archive</span>
          <p className="text-[12px] text-[#8A8D96] mt-0.5 mb-1.5">A post worth another look — resurfaced from the archive here each week.</p>
          <div className="text-[#F8F7F3] font-medium truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {post.title}
          </div>
          <span className="text-[11px] text-[#8A8D96]">Originally published {post.date}</span>
        </div>
      </button>
    </section>
  );
}

// --- ScriptureIndexTeaserCard ---
// A teaser card linking out to the full Scripture Index (/verses) rather
// than embedding the whole list -- every reference across 66+ posts,
// grouped by book, is too long to drop into a homepage scroll. Dashed gold
// border deliberately distinguishes it from every other solid-bordered card
// on Home, the same way From the Archive's dark fill sets it apart.
function ScriptureIndexTeaserCard({ openScriptureIndex }) {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-24">
      <button
        onClick={openScriptureIndex}
        className="w-full text-left flex items-center gap-4 bg-white dark:bg-[#1E2128] border border-dashed border-[#B08D57]/60 dark:border-[#D9B77C]/50 rounded-sm px-6 py-5 hover:border-[#B08D57] dark:hover:border-[#D9B77C] transition-colors duration-200"
      >
        <BookOpen size={20} strokeWidth={1.75} className="text-[#B08D57] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            Every verse cited on the site, in one place
          </div>
          <p className="text-[12px] text-[#5B5F6B] dark:text-[#A9ADB6] mt-1">
            Every Scripture Focus reference across all your posts, grouped by Bible book.
          </p>
        </div>
        <ArrowRight size={16} strokeWidth={2} className="shrink-0 text-[#B08D57]" />
      </button>
    </section>
  );
}

// --- JournalTeaserCard ---
// A second teaser card, same family as ScriptureIndexTeaserCard just above
// (dashed border, link-out rather than embedded content) but in sage
// instead of gold specifically so the two stay visually distinguishable
// sitting back to back. Added 2026-10-02 at Brian's explicit request --
// names both halves of the Reflection Journal (answering a post's
// Reflection Questions, and the separate Prayer List) rather than folding
// "and prayers too" into one sentence where it's easy to skim past.
function JournalTeaserCard({ openJournal }) {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-24">
      <button
        onClick={() => openJournal()}
        className="w-full text-left flex items-start gap-4 bg-white dark:bg-[#1E2128] border border-dashed border-[#4A5D4E]/50 dark:border-[#6E9077]/50 rounded-sm px-6 py-5 hover:border-[#4A5D4E] dark:hover:border-[#6E9077] transition-colors duration-200"
      >
        <NotebookPen size={20} strokeWidth={1.75} className="text-[#4A5D4E] dark:text-[#6E9077] shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            A private place to write — reflections and prayers
          </div>
          <p className="text-[12px] text-[#5B5F6B] dark:text-[#A9ADB6] mt-1">
            Answer what each post asks you to reflect on, and keep a running prayer list. Private to you, synced wherever you sign in.
          </p>
          <div className="flex gap-4 mt-2.5">
            <span className="text-[11px] text-[#4A5D4E] dark:text-[#6E9077] font-semibold">Reflections</span>
            <span className="text-[11px] text-[#4A5D4E] dark:text-[#6E9077] font-semibold">Prayer List</span>
          </div>
        </div>
        <ArrowRight size={16} strokeWidth={2} className="shrink-0 text-[#4A5D4E] dark:text-[#6E9077] mt-0.5" />
      </button>
    </section>
  );
}

// --- HomeView ---
function HomeView({ setView, openPost, openReadingPlan, openTopic, openScriptureIndex, openJournal }) {
  return (
    <>
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-20 pb-24 text-center">
        <Eyebrow center>
          <span className="mx-auto">A Christian Editorial Journal</span>
        </Eyebrow>
        <h1
          className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-6xl leading-[1.1] max-w-3xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          Ordinary life, seen through an eternal lens.
        </h1>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Reflections on the gospel of Jesus Christ — for the doubting, the weary, and the curious alike.
        </p>
        <button
          onClick={() => setView("blog")}
          className="mt-10 inline-flex items-center gap-2 bg-[#1C1F26] text-[#F8F7F3] px-7 py-3 text-sm tracking-wide hover:bg-[#4A5D4E] transition-colors duration-300"
        >
          Read the Blogs
          <ArrowRight size={15} strokeWidth={2} />
        </button>
      </section>

      <ContinueReadingCard openPost={openPost} />

      <VerseOfDay />

      <section className="bg-white dark:bg-[#1E2128] border-y border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
          <Eyebrow>Our Mission</Eyebrow>
          <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            What is the Gospel?
          </h2>
          <div className="space-y-5 text-[#3A3E47] dark:text-[#D9D9D9] text-[17px] leading-[1.85]">
            <p>
              <span
                className="float-left text-6xl leading-[0.8] pr-3 pt-1 text-[#4A5D4E]"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                T
              </span>
              he gospel is simply this: God loved a broken world enough to enter it. In Jesus Christ, he lived the life we could not live, died the death we deserved, and rose again so that all who trust in him might be forgiven, made new, and brought home to God — not by our effort, but by his grace.
            </p>
            <p>
              It is not a to-do list. It is not a religion of rule-keeping. It is news of something already accomplished, received simply by faith. That distinction changes everything about how we live, love, fail, and hope.
            </p>
            <p>
              The Gospel Lens exists to hold ordinary life up to that light — our work, our relationships, our doubts, our grief — and to write about what becomes visible when we do.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <Eyebrow>Start Here</Eyebrow>
        <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          New here? Start with these.
        </h2>
        <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-10 max-w-lg">
          If you want to understand what the gospel actually is before anything else, these three posts are the clearest place to begin.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FOUNDATIONAL_POST_IDS.map((id) => {
            const post = POSTS.find((pp) => pp.id === id);
            return post ? <PostCard key={post.id} post={post} onOpen={openPost} featured /> : null;
          })}
        </div>
        <button
          onClick={openReadingPlan}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4A5D4E] mt-8 hover:gap-3 transition-all duration-300"
        >
          Prefer a guided path? Follow the 4-Day Plan
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <h2 className="text-3xl text-[#1C1F26] dark:text-[#F2F1EC] mb-10" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Recent Posts
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...POSTS]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map((post) => (
              <PostCard key={post.id} post={post} onOpen={openPost} />
            ))}
        </div>
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setView("blog")}
            className="inline-flex items-center gap-2 border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#1C1F26] dark:text-[#F2F1EC] px-7 py-3 text-sm font-medium tracking-wide hover:border-[#4A5D4E] hover:text-[#4A5D4E] transition-colors duration-300 rounded-sm"
          >
            See More
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <Eyebrow>Explore by Topic</Eyebrow>
        <div className="flex flex-wrap gap-2.5 mt-6">
          {Object.keys(POST_TAGS).map((tag) => (
            <button
              key={tag}
              onClick={() => openTopic(tag)}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#5B5F6B] dark:text-[#A9ADB6] border border-[#1C1F26]/14 dark:border-[#F2F1EC]/16 rounded-full px-3.5 py-1.5 hover:border-[#4A5D4E] hover:text-[#4A5D4E] dark:hover:border-[#6E9077] dark:hover:text-[#6E9077] transition-colors duration-200"
            >
              {tag}
              <span className="text-[10.5px] font-semibold text-[#B08D57]">{POST_TAGS[tag].length}</span>
            </button>
          ))}
        </div>
      </section>

      <FromArchiveCard openPost={openPost} />

      <ScriptureIndexTeaserCard openScriptureIndex={openScriptureIndex} />

      <JournalTeaserCard openJournal={openJournal} />
    </>
  );
}
