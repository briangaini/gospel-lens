import { useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

export function Nav({ view, setView, menuOpen, setMenuOpen, onSearch, dark, toggleDark, user, onSignIn, onSignOut }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const linkClass = (v) =>
    `hit text-sm tracking-wide transition-colors duration-200 pb-1 border-b ${
      view === v || (v === "blog" && (view === "post" || view === "collection"))
        ? "text-[#1C1F26] dark:text-[#F2F1EC] border-[#B08D57]"
        : "text-[#5B5F6B] dark:text-[#A9ADB6] border-transparent hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] hover:border-[#B08D57]/50"
    }`;

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setSearchOpen(false);
    setQuery("");
  };

  // "/" or Cmd/Ctrl+K opens search from anywhere on the site, the same
  // convention used by GitHub, Linear, Notion, etc. "/" is ignored while
  // the visitor is already typing somewhere (so it can still be typed as
  // a literal character); Cmd/Ctrl+K is a deliberate modifier combo, so it
  // always fires regardless of focus.
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isCmdK = (e.metaKey || e.ctrlKey) && key === "k";
      const isSlash = key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isCmdK && !isSlash) return;

      const target = e.target;
      const isEditableTarget = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isSlash && isEditableTarget) return;

      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7F3]/90 dark:bg-[#14161B]/90 backdrop-blur-sm border-b border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between gap-3">
        <button onClick={() => setView("home")} className="hit flex items-center gap-2.5 group shrink-0">
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#B08D57] text-[#B08D57] group-hover:bg-[#B08D57] group-hover:text-[#F8F7F3] transition-colors duration-300">
            <BookOpen size={15} strokeWidth={1.75} />
          </span>
          <span
            className="text-[20px] sm:text-[22px] text-[#1C1F26] dark:text-[#F2F1EC] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            The Gospel Lens
          </span>
        </button>

        {searchOpen ? (
          <form onSubmit={submitSearch} className="flex-1 flex items-center gap-2 max-w-sm">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the blog…"
              className="w-full bg-white dark:bg-[#1E2128] border border-[#1C1F26]/15 dark:border-[#F2F1EC]/18 px-3 py-2 text-base sm:text-sm text-[#1C1F26] dark:text-[#F2F1EC] placeholder:text-[#6E717A] rounded-sm focus:outline-none focus:border-[#4A5D4E]"
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="hit text-[#6E717A] dark:text-[#848892] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]" aria-label="Close search">
              <X size={18} />
            </button>
          </form>
        ) : (
          <>
            <nav className="hidden sm:flex items-center gap-8">
              <button onClick={() => setView("home")} className={linkClass("home")}>
                Home
              </button>
              <button onClick={() => setView("about")} className={linkClass("about")}>
                About
              </button>
              <button onClick={() => setView("blog")} className={linkClass("blog")}>
                Blogs
              </button>
            </nav>

            <div className="flex items-center -mr-[11px]">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title="Search (press / or ⌘K)"
                className="flex items-center justify-center w-11 h-11 text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200"
              >
                <Search size={18} strokeWidth={2} />
              </button>
              {/* Saved/Liked icons hidden on mobile only, per Brian's explicit ask
                  (2026-09-05) -- with search/dark-toggle/hamburger already in this
                  row, a 4th or 5th icon crowded the top bar and, at one point,
                  pushed the hamburger menu button off the edge of a real
                  375px-wide phone screen. Brian said it "looks neat on mobile when
                  there aren't many icons cramped" and asked to go back to exactly
                  search + dark mode + hamburger on mobile, same as before Saved/
                  Liked existed. Both stay one tap away on mobile via the hamburger
                  menu's own "Saved Posts"/"Liked Posts" entries below -- nothing
                  is unreachable, just decluttered from this top bar. Desktop
                  (sm and up) keeps both icons, unchanged. */}
              <button
                onClick={() => setView("saved")}
                aria-label="Saved Posts"
                title="Saved Posts"
                className={`hidden sm:flex items-center justify-center w-11 h-11 transition-colors duration-200 ${
                  view === "saved"
                    ? "text-[#B08D57]"
                    : "text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
                }`}
              >
                <Bookmark size={18} strokeWidth={2} fill={view === "saved" ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => setView("liked")}
                aria-label="Liked Posts"
                title="Liked Posts"
                className={`hidden sm:flex items-center justify-center w-11 h-11 transition-colors duration-200 ${
                  view === "liked"
                    ? "text-[#C1584A]"
                    : "text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC]"
                }`}
              >
                <Heart size={18} strokeWidth={2} fill={view === "liked" ? "currentColor" : "none"} />
              </button>
              <button
                onClick={toggleDark}
                aria-label="Toggle dark mode"
                className="flex items-center justify-center w-11 h-11 text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] transition-colors duration-200"
              >
                {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </button>
              {/* Visible on desktop too, per Brian's explicit ask (2026-09-05) --
                  he wanted the familiar 3-line hamburger icon at the top right
                  even on desktop, alongside (not replacing) the Home/About/Blogs
                  text links and the other icons. Opens the same dropdown list
                  used on mobile at every screen size now. */}
              <button className="flex items-center justify-center w-11 h-11 text-[#1C1F26] dark:text-[#F2F1EC]" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}
      </div>

      {menuOpen && (
        <div className="border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10 bg-[#F8F7F3] dark:bg-[#14161B]">
          {/* Inner max-w-5xl wrapper keeps this dropdown's links aligned under
              the header's own content column on wide desktop screens, instead
              of sitting flush against the far edges of the browser window. */}
          <div className="max-w-5xl mx-auto px-6 sm:px-8 py-4 flex flex-col gap-4">
            <button onClick={() => { setView("home"); setMenuOpen(false); }} className={`text-left ${linkClass("home")}`}>
              Home
            </button>
            <button onClick={() => { setView("about"); setMenuOpen(false); }} className={`text-left ${linkClass("about")}`}>
              About
            </button>
            <button onClick={() => { setView("blog"); setMenuOpen(false); }} className={`text-left ${linkClass("blog")}`}>
              Blogs
            </button>
            <button onClick={() => { setView("saved"); setMenuOpen(false); }} className={`text-left ${linkClass("saved")}`}>
              Saved Posts
            </button>
            <button onClick={() => { setView("liked"); setMenuOpen(false); }} className={`text-left ${linkClass("liked")}`}>
              Liked Posts
            </button>
            {/* Reflection Journal (added 2026-10-02) gets the same treatment
                as Saved/Liked -- dropdown-only, no persistent header icon.
                A real 375px phone only comfortably fits about 3 icons plus
                the wordmark (see the mobile header overflow saga a few
                lines below), and a 3rd synced-list icon would reopen
                exactly that problem for no real benefit over one more tap
                into this already-open menu. */}
            <button onClick={() => { setView("journal"); setMenuOpen(false); }} className={`text-left ${linkClass("journal")}`}>
              Reflection Journal
            </button>

            {/* Sign-in lives here, in the dropdown, rather than as another
                persistent header icon -- deliberately, after the mobile
                header overflow saga a few days earlier taught the same
                lesson twice: the top bar has no room left, and everything
                (Saved Posts, Liked Posts, Reflection Journal) that isn't
                search/dark-mode/menu already lives in this dropdown for
                exactly that reason. */}
            <div className="pt-3 mt-1 border-t border-[#1C1F26]/8 dark:border-[#F2F1EC]/10">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#5B5F6B] dark:text-[#A9ADB6] truncate">
                    Signed in as {user.email}
                  </span>
                  <button
                    onClick={() => { onSignOut(); setMenuOpen(false); }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B5F6B] dark:text-[#A9ADB6] hover:text-[#1C1F26] dark:hover:text-[#F2F1EC] shrink-0"
                  >
                    <LogOut size={14} strokeWidth={2} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { onSignIn(); setMenuOpen(false); }}
                  className="inline-flex items-start gap-2 text-left text-sm font-medium text-[#4A5D4E] dark:text-[#6E9077] hover:underline"
                >
                  <LogIn size={15} strokeWidth={2} className="shrink-0 mt-0.5" />
                  Sign in with Google to sync Saved &amp; Liked posts and your Reflection Journal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
