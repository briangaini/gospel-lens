import { useEffect, useState } from "react";
import {
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------------------

// `lift` raises it clear of a post page's bottom action bar on narrow screens.
export function BackToTop({ lift = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`no-print fixed ${lift ? "bottom-[88px] min-[1180px]:bottom-6" : "bottom-6"} right-6 z-30 w-11 h-11 rounded-full bg-[#1C1F26] text-[#F8F7F3] flex items-center justify-center shadow-lg hover:bg-[#4A5D4E] transition-colors duration-300`}
    >
      <ArrowRight size={16} strokeWidth={2.5} style={{ transform: "rotate(-90deg)" }} />
    </button>
  );
}
