// ---------------------------------------------------------------------------
// SHARED UI PIECES
// ---------------------------------------------------------------------------

export function Eyebrow({ children, center = false }) {
  return (
    <div
      className={`flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-[#4A5D4E] font-semibold mb-4 ${
        center ? "justify-center" : ""
      }`}
    >
      <span className="w-6 h-px bg-[#B08D57]" />
      {children}
    </div>
  );
}
