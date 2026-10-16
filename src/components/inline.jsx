export function renderInline(text) {
  if (typeof text !== "string" || !text.includes("*")) return text;
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i} className="font-semibold text-[#1C1F26] dark:text-[#F2F1EC]" style={{ fontFamily: "inherit" }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i} style={{ fontFamily: "inherit" }}>{part.slice(1, -1)}</em>;
    return part;
  });
}
