import { getReadHistory } from "../lib/storage";
import { READING_PLAN_POST_IDS } from "../content/site";
import { POSTS } from "../lib/posts";

// The 4-day guided path (see READING_PLAN_POST_IDS above). "Upcoming" days
// are visually distinct from "next" and "done," but every single one is a
// real, clickable link the whole time -- nothing here is ever actually
// gated behind finishing an earlier day.
export function ReadingPlanView({ openPlanPost }) {
  const readIds = new Set(getReadHistory().map((entry) => entry.id));
  const planPosts = READING_PLAN_POST_IDS.map((id) => POSTS.find((p) => p.id === id)).filter(Boolean);
  const readCount = planPosts.filter((p) => readIds.has(p.id)).length;
  const nextIndex = planPosts.findIndex((p) => !readIds.has(p.id));

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 pt-16 pb-24">
      <p className="text-[12px] uppercase tracking-[0.2em] text-[#7F6637] dark:text-[#B08D57] font-semibold mb-3">Guided Reading Plan</p>
      <h1
        className="text-[#1C1F26] dark:text-[#F2F1EC] text-4xl sm:text-5xl leading-[1.15] mb-4"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
      >
        {/* Playfair Display's "4" is an old-style figure -- it has a real
            descender and a shorter ascent than the surrounding cap letters,
            which is what originally made it read as "small." First fix
            (1.22em at the heading's own 700 weight) technically matched the
            height but Brian caught a real follow-up problem: at that size,
            700-weight ink reads as visibly heavier/darker than the letters
            around it -- a numeral's shape has less internal counter-space
            than most letters, so scaling it up compounds into a "bold dark
            blob" rather than a same-size match. Settled on a smaller bump
            (1.05em) at the lighter 600 weight instead -- also a real, loaded
            weight for this font (loaded in index.html), not a
            synthetic/unloaded one a browser might render inconsistently --
            which reads as blending with the rest of the heading rather than
            standing out, verified by rendering it directly in the actual
            heading (not an isolated test) and comparing several candidates
            side by side. */}
        <span style={{ fontSize: "1.05em", fontWeight: 600, verticalAlign: "-0.02em" }}>4</span> Days to Understand the Gospel
      </h1>
      <p className="text-[#5B5F6B] dark:text-[#A9ADB6] text-[15px] mb-8 max-w-lg">
        A short path through the posts that explain the gospel most clearly — one each day, in order, since each one builds on the last. Read a post a day, then take a few minutes to sit with what you read before moving on to the next.
      </p>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-[#5B5F6B] dark:text-[#A9ADB6] whitespace-nowrap">
          {readCount} of {planPosts.length} days complete
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-[#1C1F26]/10 dark:bg-[#F2F1EC]/12 overflow-hidden">
          <div className="h-full bg-[#B08D57] rounded-full transition-[width] duration-300" style={{ width: `${(readCount / planPosts.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {planPosts.map((post, i) => {
          const isDone = readIds.has(post.id);
          const isNext = i === nextIndex;
          return (
            <button
              key={post.id}
              onClick={() => openPlanPost(post)}
              className={`flex items-center gap-4 text-left bg-white dark:bg-[#1E2128] border rounded-sm px-5 py-4 transition-colors duration-200 hover:border-[#4A5D4E]/50 ${
                isNext ? "border-[#B08D57]" : "border-[#1C1F26]/10 dark:border-[#F2F1EC]/12"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-[#4A5D4E] text-white"
                    : isNext
                      ? "bg-[#B08D57]/15 text-[#B08D57] border-2 border-[#B08D57]"
                      : "bg-[#1C1F26]/8 dark:bg-[#F2F1EC]/10 text-[#6E717A] dark:text-[#848892]"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] uppercase tracking-[0.1em] text-[#6E717A] dark:text-[#848892] font-semibold">
                  Day {i + 1}
                  {isNext ? " · Up Next" : ""}
                </div>
                <div className="text-[#1C1F26] dark:text-[#F2F1EC] font-medium mt-0.5 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {post.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
