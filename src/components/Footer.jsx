import { useRef, useState } from "react";
import { BUTTONDOWN_USERNAME, CONTACT_EMAIL } from "../content/site";
import {
  BookOpen,
  Check,
} from "lucide-react";

// The email signup form itself -- extracted from Footer on 2026-10-06 so the
// homepage's newsletter band and the footer share one implementation (and
// one Buttondown integration) instead of two copies. Callers supply the
// heading/copy around it.
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | done
  const buttondownFormRef = useRef(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "saving") return;
    setStatus("saving");
    try {
      await window.storage?.set(`newsletter:${Date.now()}`, email.trim(), true);
    } catch (err) {
      // storage optional — fail silently, UI still confirms
    }
    setStatus("done");
    setEmail("");
  };

  // The live Buttondown form (below) is a real cross-origin POST that opens
  // Buttondown's own confirmation page in a new tab (target="_blank") — we
  // never get a response back to react to, since it's a native form
  // submission, not a fetch call. So this is a same-tab, optimistic
  // acknowledgment shown the moment someone submits, rather than something
  // waiting on a result we structurally can't observe. Buttondown double
  // opt-ins everyone, so "check your email to confirm" is accurate
  // regardless of what happens in the new tab.
  const handleButtondownSubmit = () => {
    setStatus("done");
    // Let the native submission read the field first, then clear it —
    // resetting synchronously inside the submit handler risks clearing the
    // value before the browser has captured it for the actual POST.
    setTimeout(() => buttondownFormRef.current?.reset(), 50);
    setTimeout(() => setStatus("idle"), 6000);
  };

  const inputClass =
    "flex-1 min-w-0 sm:w-64 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 px-4 py-2.5 text-base sm:text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#6E717A] focus:outline-none focus:border-[#4A5D4E] dark:focus:border-[#6E9077] rounded-sm";
  const buttonClass =
    "whitespace-nowrap bg-[#1C1F26] dark:bg-[#F2F1EC] text-[#F8F7F3] dark:text-[#1C1F26] px-5 py-2.5 text-sm font-medium hover:bg-[#4A5D4E] dark:hover:bg-[#6E9077] dark:hover:text-[#F8F7F3] transition-colors duration-300 rounded-sm";

  if (BUTTONDOWN_USERNAME) {
    return (
      <div className="w-full sm:w-auto">
        <form
          ref={buttondownFormRef}
          action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
          method="post"
          target="_blank"
          onSubmit={handleButtondownSubmit}
          className="flex w-full sm:w-auto gap-2"
        >
          <input type="hidden" name="embed" value="1" />
          <input type="email" required name="email" placeholder="you@example.com" aria-label="Email address" className={inputClass} />
          <button type="submit" className={buttonClass}>
            Subscribe
          </button>
        </form>
        {status === "done" && (
          <p className="flex items-center gap-1.5 text-xs text-[#4A5D4E] dark:text-[#6E9077] mt-2">
            <Check size={13} strokeWidth={2.5} />
            Check your email to confirm your subscription.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className={inputClass}
      />
      <button type="submit" className={buttonClass}>
        {status === "done" ? "Subscribed ✓" : "Subscribe"}
      </button>
    </form>
  );
}
// showNewsletter is false on the homepage and About, which each have their own
// newsletter signup directly above the footer -- two identical signup forms stacked on top of
// each other would just be noise.
export function Footer({ showNewsletter = true }) {
  return (
    <footer className="border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 mt-24">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-14">
        {showNewsletter && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
            <div>
              <h2
                className="text-lg text-[#1C1F26] dark:text-[#F2F1EC] mb-1"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                Get new posts by email
              </h2>
              <p className="text-sm text-[#5B5F6B] dark:text-[#A9ADB6]">One email, whenever something new is published. No spam.</p>
            </div>
            <NewsletterForm />
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${showNewsletter ? "pt-8" : ""}`}>
          <div className="flex items-center gap-2 text-[#5B5F6B] dark:text-[#A9ADB6]">
            <BookOpen size={14} strokeWidth={1.75} className="text-[#B08D57]" />
            <span className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Gospel Lens
            </span>
          </div>

          {CONTACT_EMAIL && (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-0 text-xs">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center min-h-[44px] text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Contact
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Blog Submission — The Gospel Lens")}`}
                className="inline-flex items-center min-h-[44px] text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Submit a Blog Post
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Share Your Story — The Gospel Lens")}&body=${encodeURIComponent("I wanted to share how a post on The Gospel Lens impacted me:\n\n")}`}
                className="inline-flex items-center min-h-[44px] text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Share Your Story
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Site Suggestion — The Gospel Lens")}`}
                className="inline-flex items-center min-h-[44px] text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#4A5D4E] underline underline-offset-2 transition-colors duration-200"
              >
                Suggest an Idea
              </a>
            </div>
          )}

          <p className="text-xs text-[#6E717A] dark:text-[#848892] tracking-wide">
            © 2026 The Gospel Lens. Every good gift is from above.
          </p>
        </div>

        <p className="text-[12px] text-[#6E717A] dark:text-[#848892] leading-relaxed mt-6 pt-6 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 max-w-2xl">
          Some articles on this site are curated, adapted, or quoted from other Christian teachers, authors, and ministries, and are shared here for devotional and educational purposes. All rights remain with their original creators. Scripture quotations are taken from the translations noted with each verse.
        </p>
        <p className="text-[12px] text-[#6E717A] dark:text-[#848892] leading-relaxed mt-3 max-w-2xl">
          Unless otherwise noted, Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
