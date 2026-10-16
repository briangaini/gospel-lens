import {
  ArrowRight,
} from "lucide-react";

export const HOME_SERIF = { fontFamily: "'Playfair Display', serif", fontWeight: 700 };
export const HOME_GOLD_TEXT = "text-[#7F6637] dark:text-[#D9B77C]";
export const HOME_CARD = "bg-white dark:bg-[#1E2128] border border-[#1C1F26]/10 dark:border-[#F2F1EC]/12 rounded-sm";
export const HOME_LIFT =
  "transition-all duration-300 motion-reduce:transition-none hover:border-[#B08D57]/60 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0";
export const HOME_MUTED = "text-[#5B5F6B] dark:text-[#A9ADB6]";
export const HOME_FAINT = "text-[#686C77] dark:text-[#8A8E98]";
export function shortPostDate(post) {
  const d = new Date(post.date);
  if (Number.isNaN(d.getTime())) return post.date;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
}
export function HomeLabel({ children, center = false }) {
  return (
    <div className={`flex items-center gap-2.5 text-[12px] uppercase tracking-[0.2em] font-semibold mb-3.5 ${HOME_GOLD_TEXT} ${center ? "justify-center" : ""}`}>
      {!center && <span className="w-7 h-px bg-[#B08D57]" />}
      {children}
    </div>
  );
}
export function HomeHeading({ children, className = "" }) {
  return (
    <h2 className={`text-[#1C1F26] dark:text-[#F2F1EC] text-[26px] sm:text-4xl leading-[1.15] mb-3 ${className}`} style={HOME_SERIF}>
      {children}
    </h2>
  );
}
export function HomeSection({ children, className = "", innerClassName = "" }) {
  return (
    <section className={`border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 ${className}`}>
      <div className={`max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-20 ${innerClassName}`}>{children}</div>
    </section>
  );
}
export function MoreLink({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`hit inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5D4E] dark:text-[#6E9077] hover:gap-2.5 transition-all duration-300 motion-reduce:transition-none ${className}`}
    >
      {children}
      <ArrowRight size={14} strokeWidth={2} />
    </button>
  );
}
