// ---------------------------------------------------------------------------
// READING TIME — calculated from actual word count (~200 wpm) instead of
// a hand-typed estimate, so it stays accurate as posts get edited.
// ---------------------------------------------------------------------------

export function estimateReadTime(post) {
  // Posts from the site's index already carry their read time worked out in advance
  // (`minutes`), so cards never need the post's text.
  if (typeof post.minutes === "number") return `${post.minutes} min read`;
  const words = post.blocks.reduce((total, block) => {
    if (block.type === "p" || block.type === "quote" || block.type === "heart" || block.type === "prayer" || block.type === "encourage" || block.type === "closing" || block.type === "heading") {
      return total + block.text.split(/\s+/).filter(Boolean).length;
    }
    if (block.type === "scripture") {
      return total + block.verses.join(" ").split(/\s+/).filter(Boolean).length;
    }
    if (block.type === "reflection" || block.type === "share" || block.type === "list") {
      return total + block.items.join(" ").split(/\s+/).filter(Boolean).length;
    }
    return total;
  }, 0);
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
// Light inline formatting for paragraph text: **bold** and *italic*. Only `p`
// blocks use it (a few Proverbs Series posts lean on italics and bold
// run-in lead-ins). Everything that reads post text as plain text (search,
// listen-to-post) goes through stripInline() so no stray asterisks leak.
export function stripInline(text) {
  return typeof text === "string" ? text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1") : text;
}
// Splits a post into one text segment per block (title first) for the
// browser's built-in text-to-speech (see useListenToPost). Read as separate
// queued utterances rather than one giant string — each block gets a clean
// breath/pause between it and the next, instead of running on flat.
export function postToSpeechSegments(post) {
  const segments = [`${post.title}.`];
  post.blocks.forEach((block) => {
    if (["p", "heading", "quote", "heart", "prayer", "encourage", "closing"].includes(block.type)) {
      segments.push(stripInline(block.text));
    } else if (block.type === "scripture") {
      segments.push(block.verses.join(". "));
    } else if (block.type === "reflection" || block.type === "share" || block.type === "list") {
      segments.push(block.items.map(stripInline).join(". "));
    }
  });
  return segments;
}

export function countPostWords(post) {
  return post.blocks.reduce((total, block) => {
    const text = block.text || (block.verses && block.verses.join(" ")) || (block.items && block.items.join(" ")) || "";
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
}
