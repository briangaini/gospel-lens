import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Lock,
  Trash2,
} from "lucide-react";

// A single private "write your answer" box -- used both inline, under a
// Reflection Question on its own post (no `onDelete`, since clearing the
// text already deletes the entry via saveJournalAnswer), and on the /journal
// page's Reflections tab (with `onDelete`, for an explicit Delete action
// next to an entry someone isn't actively editing). Autosaves 700ms after
// typing stops, or immediately on blur, so there's never an unsaved draft
// sitting in the box.
export function JournalAnswerBox({ postId, qIndex, savedText, onSave, onDelete, signedIn, onViewJournal }) {
  const [draft, setDraft] = useState(savedText);
  const [status, setStatus] = useState(savedText ? "saved" : "idle");
  const timerRef = useRef(null);
  const textareaRef = useRef(null);
  // Tracks whether this box currently has focus -- see the effect below.
  const focusedRef = useRef(false);
  // The last value this box either loaded or saved. commit() skips saving
  // when nothing actually changed -- before this, simply tapping into an
  // empty box and tapping out wrote a deleted-entry tombstone, and tapping
  // in and out of an existing answer re-stamped it with a fresh updatedAt,
  // which let a stale open copy overwrite a newer edit made on another
  // device (same unchanged text, newer timestamp wins the merge).
  const lastCommittedRef = useRef(savedText);
  // Latest draft/props for the unmount flush below, which can't see fresh
  // render values from inside a cleanup closure.
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Keep the box in sync if its saved value changes from elsewhere (e.g. a
  // cross-device sync landing while this box is on screen) -- but ONLY
  // while it's not actively focused. Found and fixed 2026-10-02: applying
  // this unconditionally was a real bug, not a hypothetical one.
  // saveJournalAnswer() trims the stored text, so the instant the 700ms
  // debounced autosave landed right after a trailing space -- a completely
  // normal place to pause mid-sentence -- the trimmed value flowed back
  // down through this prop and this effect clobbered `draft` back to the
  // untrimmed version, erasing the space the person had just typed, right
  // as they continued typing the next word ("just like how " + "jesus"
  // became "just like howjesus"). Gating on focus fixes it: a save this
  // box's own typing triggered never clobbers itself while still focused,
  // and an external change (e.g. another device) still applies correctly
  // once this box isn't the one being typed into.
  useEffect(() => {
    if (focusedRef.current) return;
    setDraft(savedText);
    setStatus(savedText ? "saved" : "idle");
    lastCommittedRef.current = savedText;
  }, [savedText]);

  // Leaving the page (a Back tap, the Journal icon, the browser's own back
  // button) inside the 700ms autosave window used to throw away whatever
  // was typed in that last moment -- this cleanup only cleared the timer.
  // Flush it instead, so nothing typed is ever lost on the way out.
  useEffect(
    () => () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const pending = draftRef.current;
      if (pending.trim() !== (lastCommittedRef.current || "").trim()) {
        onSaveRef.current(postId, qIndex, pending);
      }
    },
    [postId, qIndex]
  );

  // Grow to fit the text instead of guessing a row count -- the old
  // `rows` estimate assumed ~60 characters per line, which is wrong on a
  // phone (~28 fit), so a 3-line-estimated answer that really needed 6
  // lines was clipped and had to be scrolled inside the box.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const commit = (value) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (value.trim() !== (lastCommittedRef.current || "").trim()) {
      onSave(postId, qIndex, value);
      lastCommittedRef.current = value.trim();
    }
    setStatus(value.trim() ? "saved" : "idle");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setDraft(value);
    setStatus("editing");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(value), 700);
  };

  return (
    <div className="no-print">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={handleChange}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => {
          focusedRef.current = false;
          commit(draft);
        }}
        rows={1}
        placeholder="Write your answer…"
        aria-label="Your private answer"
        // 16px on phones on purpose: iOS Safari zooms the whole page in
        // when a text field under 16px gets focus, and never zooms back out.
        className="block w-full min-h-[44px] overflow-hidden bg-[#F8F7F3] dark:bg-[#14161B] border border-dashed border-[#1C1F26]/18 dark:border-[#F2F1EC]/20 rounded-sm px-3 py-2.5 text-base sm:text-[13.5px] leading-snug text-[#2E323B] dark:text-[#D9D9D9] placeholder:text-[#6E717A] resize-none focus:outline-none focus:border-[#4A5D4E] dark:focus:border-[#6E9077] transition-colors duration-150"
      />
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
        <span className="text-[12px] text-[#6E717A] dark:text-[#848892] inline-flex items-center gap-1">
          <Lock size={10} strokeWidth={2} />
          {signedIn ? "Private — synced to your account" : "Private — stored on this device only"}
        </span>
        {onViewJournal && (
          <button
            type="button"
            onClick={() => onViewJournal()}
            className="hit text-[12px] text-[#7F6637] dark:text-[#B08D57] font-semibold hover:underline"
          >
            View your full Journal
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {status === "saved" && draft.trim() && (
            <span className="text-[12px] text-[#4A5D4E] dark:text-[#6E9077] font-semibold">Saved</span>
          )}
          {onDelete && draft.trim() && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Delete this reflection? This can't be undone.")) {
                  setDraft("");
                  setStatus("idle");
                  onDelete();
                }
              }}
              className="inline-flex items-center gap-1 text-[12px] text-[#6E717A] dark:text-[#848892] hover:text-[#C1584A] transition-colors duration-150"
            >
              <Trash2 size={11} strokeWidth={2} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
