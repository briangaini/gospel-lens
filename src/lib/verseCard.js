// ---------------------------------------------------------------------------
// VIEWS
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// VERSE CARD IMAGE — draws a shareable graphic (dark card, wrapped verse
// text, reference, and the site URL baked right into the image) so that
// however it gets shared, the link travels with it. Used by the "Share
// this verse" button below.
// ---------------------------------------------------------------------------

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
// `attribution` is used verbatim (e.g. "Romans 10:9, ESV" or a post's own
// scripture-block reference like "John 15:4-5; Philippians 2:12-13") rather
// than a hardcoded translation suffix, since this now also generates cards
// for a post's own Scripture Focus box, not just the homepage Verse of the
// Day, and those references don't all share one translation.
async function generateVerseCardBlob({ text, attribution, eyebrow = "VERSE OF THE DAY" }) {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.load("700 48px 'Playfair Display'");
      await document.fonts.ready;
    } catch (err) {
      // if fonts fail to report ready, draw anyway with fallback fonts
    }
  }

  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#1C1F26";
  ctx.fillRect(0, 0, size, size);

  // Thin gold accent line near top
  ctx.strokeStyle = "#B08D57";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size / 2 - 40, 150);
  ctx.lineTo(size / 2 + 40, 150);
  ctx.stroke();

  // Eyebrow label
  ctx.fillStyle = "#B08D57";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText(eyebrow, size / 2, 200);
  ctx.letterSpacing = "0px";

  // Verse text, wrapped, centered, and auto-shrunk to fit -- a post's own
  // Scripture Focus box can combine several verses into one much longer
  // quote than a single Verse of the Day ever is, and a fixed font size
  // risked exactly the kind of overflow found and fixed in the per-post
  // share cards (see scripts/build-share-cards.js's fitTitle). Two layers
  // of defense here too: shrink to fit, then clamp the reference line's
  // position as a hard backstop regardless of how the text wrapped.
  const maxTextWidth = size - 200;
  const topBound = 260;
  const bottomBound = size - 260;
  const quoted = `"${text}"`;
  let fontSize = 46;
  let lines = [];
  let lineHeight = 62;
  while (fontSize >= 24) {
    ctx.font = `italic 500 ${fontSize}px 'Playfair Display', Georgia, serif`;
    lines = wrapCanvasText(ctx, quoted, maxTextWidth);
    lineHeight = fontSize * 1.35;
    if (lines.length * lineHeight <= bottomBound - topBound) break;
    fontSize -= 2;
  }
  ctx.fillStyle = "#F8F7F3";
  ctx.font = `italic 500 ${fontSize}px 'Playfair Display', Georgia, serif`;
  const totalTextHeight = lines.length * lineHeight;
  let y = topBound + Math.max(0, (bottomBound - topBound - totalTextHeight) / 2) + fontSize * 0.75;
  for (const line of lines) {
    ctx.fillText(line, size / 2, y);
    y += lineHeight;
  }

  // Reference -- shrunk to fit horizontally too, since a combined
  // multi-reference citation (e.g. three passages joined with ";") can run
  // considerably longer than a single "Book Chapter:Verse".
  let refFontSize = 30;
  ctx.font = `400 ${refFontSize}px Inter, sans-serif`;
  const refText = `— ${attribution}`;
  while (refFontSize > 18 && ctx.measureText(refText).width > maxTextWidth) {
    refFontSize -= 2;
    ctx.font = `400 ${refFontSize}px Inter, sans-serif`;
  }
  ctx.fillStyle = "#B0B4BD";
  ctx.fillText(refText, size / 2, Math.min(y + 20, size - 160));

  // Footer wordmark + URL baked into the image itself
  ctx.fillStyle = "#B08D57";
  ctx.font = "700 28px 'Playfair Display', Georgia, serif";
  ctx.fillText("THE GOSPEL LENS", size / 2, size - 110);

  ctx.fillStyle = "#6E717A";
  ctx.font = "400 24px Inter, sans-serif";
  const siteUrl = window.location.href.split("#")[0].replace(/^https?:\/\//, "").replace(/\/$/, "");
  ctx.fillText(siteUrl, size / 2, size - 70);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
// Shared by VerseOfDay's "Share this verse" and ScriptureShareButton (on
// each post's Scripture Focus box) -- generates the card image, then picks
// the best available way to actually hand it to the visitor: the native
// share sheet with the image attached on phones, a straight image-to-
// clipboard copy on desktop, or a plain text+link copy as a last resort.
// Returns a status string the caller uses to pick its own button label.
export async function shareVerseCard({ text, attribution, eyebrow, title, url, filename }) {
  // The link now lives directly inside the shared text itself (not just a
  // separate structural `url` field) -- WhatsApp and most chat apps
  // auto-linkify a plain URL sitting in message text into a real tappable
  // link, which survives far more consistently than relying on an app's
  // own handling of a separate `url` field.
  const shareText = `"${text}" — ${attribution}\n\nRead more: ${url}`;
  const blob = await generateVerseCardBlob({ text, attribution, eyebrow });
  const file = blob ? new File([blob], filename, { type: "image/png" }) : null;

  // Native share WITH a file attached is mobile-only. Verified live (a
  // real repro from a real desktop share) that Chrome's macOS
  // implementation of file-sharing via the Web Share API is genuinely
  // broken, not just inconsistent: it round-trips the file through a
  // local temp path under ~/Library/Application Support/Google/Chrome/
  // <profile>/WebShare/share-<uuid>/<filename>, and handing that off to
  // WhatsApp Desktop, that literal local file path leaked into the
  // visible message text AND the whole share was duplicated -- two
  // images, two text messages, from one click. This lives in Chrome's own
  // OS-integration layer, not anything this page controls, so the fix is
  // to avoid that code path entirely on desktop rather than risk visitors
  // hitting Brian's exact repro. (An earlier attempt fixed a *different*
  // theory -- a rich link preview competing with the image -- which
  // turned out not to be the actual cause; this is.)
  // On mobile, always prefer native share -- with the file when the
  // device supports it, text-only otherwise. Both are safe on mobile;
  // the bug above is specific to desktop Chrome's file-sharing bridge.
  const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile && navigator.share) {
    try {
      const canShareFile = file && navigator.canShare && navigator.canShare({ files: [file] });
      if (canShareFile) {
        await navigator.share({ title, text: shareText, files: [file] });
      } else {
        await navigator.share({ title, text: shareText, url });
      }
      return "shared";
    } catch (err) {
      return "cancelled"; // user closed the share sheet
    }
  }

  // Desktop's default path when there's an actual image to share: copy it
  // to the clipboard, and -- in that same clipboard write -- include the
  // caption text too, so a paste target that reads text (like a caption
  // box) can pick up the link without a second, separate copy. This never
  // touches the broken OS-share-extension bridge above, so it can't hit
  // that bug at all. Deliberately checked BEFORE any desktop native-share
  // fallback, so a valid image is never silently dropped in favor of a
  // text-only share sheet.
  if (file && navigator.clipboard && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": file, "text/plain": new Blob([shareText], { type: "text/plain" }) }),
      ]);
      return "copied-image";
    } catch (err) {
      // Some browsers reject a multi-type ClipboardItem outright -- retry
      // with just the image, which matters most, rather than failing
      // entirely and falling all the way through to text-only.
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": file })]);
        return "copied-image";
      } catch (err2) {
        // fall through to the text-only fallback below
      }
    }
  }

  // No image available at all (e.g. canvas rendering failed) but native
  // share still exists: still better than a bare clipboard copy, and
  // doesn't touch the file-sharing bridge since there's no file here.
  if (!file && navigator.share) {
    try {
      await navigator.share({ title, text: shareText, url });
      return "shared";
    } catch (err) {
      return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return "copied-text";
  } catch (err) {
    return "cancelled";
  }
}
