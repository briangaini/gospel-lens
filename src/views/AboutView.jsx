import { useState } from "react";
import { CONTACT_EMAIL } from "../content/site";
import { NewsletterForm } from "../components/Footer";

// ABOUT -- redesigned 2026-10-07. The words about Brian are his own, only
// split into sections; nothing about him was invented. The old page is
// restorable, see CLAUDE.md "About page restore" (backup/about-classic.jsx).
function AboutRing() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Gold ring with a cross and an open book" className="w-[62%] max-w-[190px] h-auto">
      <circle cx="60" cy="60" r="52" fill="none" stroke="#B08D57" strokeWidth="3" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#B08D57" strokeWidth="1" opacity=".5" />
      <path d="M60 32v46M44 48h32" stroke="#4A5D4E" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M34 84c9-5 17-5 26 0 9-5 17-5 26 0v8c-9-5-17-5-26 0-9-5-17-5-26 0z"
        fill="none"
        stroke="#B08D57"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function AboutView() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard can be refused; the address is also a plain visible link.
    }
  };
  const mailto = (subject, body) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;

  const eyebrow = "text-[12px] font-semibold tracking-[0.2em] uppercase text-[#7F6637] dark:text-[#D9B77C]";
  const h2Class = "text-[#1C1F26] dark:text-[#F2F1EC] leading-[1.2]";

  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pt-12 sm:pt-[72px] pb-10 sm:pb-14 grid md:grid-cols-[1.25fr_0.75fr] gap-8 md:gap-12 items-center">
        <div>
          <div className={eyebrow}>About</div>
          <h1 className={`${h2Class} text-[40px] sm:text-6xl leading-[1.08] mt-3.5 mb-5 sm:mb-6`} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            The Person Behind the Lens
          </h1>
          <p className="text-[#1C1F26] dark:text-[#F2F1EC] text-[18.5px] sm:text-[21px] leading-[1.65]">
            Greetings in the name of the Lord. I'm Brian, the person behind{" "}
            <em style={{ fontFamily: "'Playfair Display', serif" }}>The Gospel Lens</em>.
          </p>
        </div>
        <aside
          aria-label="Brian"
          className="flex flex-col items-center justify-center gap-4 text-center px-5 py-7 sm:p-6 rounded-sm border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 bg-white dark:bg-[#1E2128] bg-gradient-to-br from-[#4A5D4E]/10 to-transparent"
        >
          <AboutRing />
          <div>
            <div className="text-[#1C1F26] dark:text-[#F2F1EC] text-2xl" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Brian
            </div>
            <div className="text-[13.5px] leading-snug text-[#5B5F6B] dark:text-[#A9ADB6] mt-1">Here to explain the gospel plainly.</div>
          </div>
        </aside>
      </section>

      {/* The quote band */}
      <section className="bg-[#1C1F26] dark:bg-[#0E1014]">
        <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-12 sm:py-20">
          <p className="text-[#B9BCC4] dark:text-[#A9ADB6] text-[17px] sm:text-[18px] leading-[1.7] max-w-[640px] mb-[18px]">
            I was born and raised in India and now live in the United States — two very different worlds that, in their own way, taught me the same thing:
          </p>
          <blockquote
            className="relative pt-[34px] text-[27px] sm:text-[38px] leading-[1.35] italic text-[#F2F1EC]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, textWrap: "balance" }}
          >
            <span aria-hidden="true" className="absolute top-0 left-0 w-14 h-0.5 bg-[#D9B77C]" />
            The gospel isn't a cultural export or a Western idea. It's good news for everyone, everywhere.
          </blockquote>
        </div>
      </section>

      {/* Why this site exists */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-11 sm:py-16">
        <div className={eyebrow}>Why this site exists</div>
        <h2 className={`${h2Class} text-[27px] sm:text-[34px] mt-2.5 mb-[18px]`} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          I kept running into the same problem
        </h2>
        <p className="text-[#2E323B] dark:text-[#D9D9D9] text-[16.5px] sm:text-[17px] leading-[1.75] max-w-[680px]">
          People, myself included at different points, who had heard about Jesus their whole lives without ever really hearing the gospel clearly.
        </p>
        <div className="mt-[26px] grid md:grid-cols-[1fr_1.15fr] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 bg-white dark:bg-[#1E2128]">
          <div className="p-7 border-b md:border-b-0 md:border-r border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#5B5F6B] dark:text-[#A9ADB6] mb-3.5">What many people heard</h3>
            <ul className="grid gap-3">
              {["A list of rules", `A vague sense of "be a good person"`].map((t) => (
                <li
                  key={t}
                  className="text-xl leading-snug text-[#5B5F6B] dark:text-[#A9ADB6] line-through decoration-[#B08D57] decoration-[1.5px]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-7 bg-[#4A5D4E]/10 dark:bg-[#6E9077]/13">
            <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-[#4A5D4E] dark:text-[#8FAE95] mb-3.5">The actual news</h3>
            <p className="text-[#1C1F26] dark:text-[#F2F1EC] text-[23px] leading-[1.45]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              That God, in Christ, did for us what we could never do for ourselves.
            </p>
          </div>
        </div>
      </section>

      {/* A word on who's talking */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-11 sm:py-16 grid md:grid-cols-[0.8fr_1.2fr] md:gap-x-14 gap-y-5 md:items-start">
        <div>
          <div className={eyebrow}>Before you read</div>
          <h2 className={`${h2Class} text-[32px] sm:text-[40px] leading-[1.15] mt-3`} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            This isn't a pulpit.
          </h2>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 pt-5 md:pt-0 md:pl-10">
          <p className="text-[#1C1F26] dark:text-[#F2F1EC] text-xl leading-[1.7]">
            I'm not a pastor or a theologian. I'm just someone who wants that news explained plainly, and who's gathered voices to help do that.
          </p>
          <p className="text-[#2E323B] dark:text-[#D9D9D9] text-xl leading-[1.7] mt-3.5">Some are mine. Some are from teachers I trust.</p>
        </div>
      </section>

      {/* My hope */}
      <section className="bg-[#4A5D4E] text-center">
        <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-14 sm:py-[72px]">
          <div className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#E6D3A9]">My hope</div>
          <p
            className="mt-4 mx-auto max-w-[760px] text-[23px] sm:text-[30px] leading-[1.45] italic text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, textWrap: "balance" }}
          >
            That whoever lands on this page, wherever they're starting from, walks away seeing the gospel a little more clearly than before.
          </p>
        </div>
      </section>

      {/* Get in touch */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-11 sm:py-16">
        <div className={eyebrow}>Say hello</div>
        <h2 className={`${h2Class} text-[27px] sm:text-[34px] mt-2.5 mb-5`} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Get in touch
        </h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          <div className="min-w-0">
            <div className="border-t border-[#1C1F26]/12 dark:border-[#F2F1EC]/14">
              {[
                ["Share your story", "Tell me how a post met you. Only I see it.", mailto("Share Your Story — The Gospel Lens", "I wanted to share how a post on The Gospel Lens impacted me:\n\n")],
                ["Suggest an idea", "Something missing from the site? Say so.", mailto("Site Suggestion — The Gospel Lens")],
                ["Submit a post", "Have something that explains the gospel clearly? Send it over.", mailto("Blog Submission — The Gospel Lens")],
              ].map(([title, text, href]) => (
                <a key={title} href={href} className="block py-4 border-b border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 group">
                  <div className="text-[17px] text-[#1C1F26] dark:text-[#F2F1EC] group-hover:text-[#4A5D4E] dark:group-hover:text-[#6E9077] transition-colors" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                    {title}
                  </div>
                  <div className="text-[14.5px] leading-snug text-[#5B5F6B] dark:text-[#A9ADB6] mt-0.5">{text}</div>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap mt-[18px] text-[14.5px]">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="bg-[#4A5D4E]/10 dark:bg-[#6E9077]/13 px-2.5 py-2.5 rounded-sm text-[#1C1F26] dark:text-[#F2F1EC] break-all hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="text-[12.5px] font-semibold border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 text-[#4A5D4E] dark:text-[#6E9077] px-3 py-1.5 rounded-sm"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="min-w-0 bg-white dark:bg-[#1E2128] border border-[#1C1F26]/12 dark:border-[#F2F1EC]/14 p-6 sm:p-[26px] rounded-sm">
            <h3 className="text-[#1C1F26] dark:text-[#F2F1EC] text-[22px] mb-1.5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              New posts, by email
            </h3>
            <p className="text-[15px] leading-relaxed text-[#5B5F6B] dark:text-[#A9ADB6] mb-4">Get new posts in your inbox. Confirm once, unsubscribe anytime.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
