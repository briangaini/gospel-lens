// Generates one branded, per-post share-preview image (630x630, matching
// the site's existing generic og-image.png dimensions so WhatsApp/iMessage
// crop it the same well-tested way) for every post, at build time. Used by
// scripts/prerender.js to point each post's own og:image/twitter:image at
// something specific to that post instead of the one generic image every
// other page (home/blog/about/collection) keeps using.
//
// Design deliberately mirrors two things already live on the site, rather
// than inventing a new look: the dark card treatment already used by
// VerseOfDay on the homepage, and the small link-preview "card" pattern
// already used in the newsletter emails (thumbnail + domain footer). The
// brand mark drawn on each card is the same public/og-image.png artwork
// already approved for share-preview use -- this doesn't touch the header
// logo, favicon, or app icons, which stay exactly as they are.
//
// Approved via a mocked-up HTML preview (three real post titles at real
// size, plus a simulated iMessage bubble) before any of this was built.

import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SIZE = 630;

const COLOR = {
  ink: "#1C1F26",
  cream: "#F8F7F3",
  gold: "#B08D57",
  goldSoft: "rgba(176, 141, 87, 0.16)",
  muted: "#9A9DA6",
  rule: "rgba(248, 247, 243, 0.18)",
};

const FONT = {
  playfair: "Share Card Playfair",
  inter: "Share Card Inter",
  interSemiBold: "Share Card Inter SemiBold",
};

let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const dir = path.join(ROOT, "scripts", "fonts");
  GlobalFonts.registerFromPath(path.join(dir, "Inter-Regular.woff2"), FONT.inter);
  GlobalFonts.registerFromPath(path.join(dir, "Inter-SemiBold.woff2"), FONT.interSemiBold);
  GlobalFonts.registerFromPath(path.join(dir, "PlayfairDisplay-Bold.woff2"), FONT.playfair);
  fontsReady = true;
}

// Word-wraps `text` at `fontSize` against `maxWidth`, shrinking fontSize
// (down to minFontSize) until it fits within maxLines. A long single word
// wider than maxWidth on its own is left to overflow slightly rather than
// shrinking indefinitely -- doesn't happen with any real post title here,
// but this keeps it from ever infinite-looping on unexpected input.
//
// maxHeight matters as much as maxLines: a title that wraps to exactly
// maxLines at a given font size can still be tall enough to run into
// whatever's drawn below it (the divider/domain footer here) once line
// height is factored in -- caught for real on "From Worry to Worship:
// Seeing Your Anxiety Through God's Eyes" (60 characters, the longest
// title on the site as of when this was written), which hit 4 lines at
// the previous minimum font size and visibly overlapped the footer.
function fitTitle(ctx, text, { maxWidth, maxHeight, maxLines, maxFontSize, minFontSize, lineHeightRatio, weight = "700" }) {
  let fontSize = maxFontSize;
  let lines = [];
  while (fontSize >= minFontSize) {
    ctx.font = `${weight} ${fontSize}px "${FONT.playfair}"`;
    lines = wrapLines(ctx, text, maxWidth);
    const blockHeight = lines.length * fontSize * lineHeightRatio;
    if (lines.length <= maxLines && blockHeight <= maxHeight) break;
    fontSize -= 2;
  }
  return { lines, fontSize };
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawPill(ctx, { text, centerX, y, paddingX, paddingY, fontSize }) {
  ctx.font = `700 ${fontSize}px "${FONT.inter}"`;
  ctx.letterSpacing = `${fontSize * 0.16}px`;
  const textWidth = ctx.measureText(text).width;
  const pillWidth = textWidth + paddingX * 2;
  const pillHeight = fontSize + paddingY * 2;
  const x = centerX - pillWidth / 2;

  ctx.fillStyle = COLOR.goldSoft;
  ctx.beginPath();
  ctx.roundRect(x, y, pillWidth, pillHeight, pillHeight / 2);
  ctx.fill();

  ctx.fillStyle = COLOR.gold;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, centerX, y + pillHeight / 2 + 1);
  ctx.letterSpacing = "0px";

  return pillHeight;
}

let brandMarkImage = null;
async function getBrandMark() {
  if (!brandMarkImage) {
    brandMarkImage = await loadImage(path.join(ROOT, "public", "og-image.png"));
  }
  return brandMarkImage;
}

export async function buildShareCard(post) {
  registerFonts();
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = COLOR.ink;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const glow = ctx.createRadialGradient(SIZE / 2, -SIZE * 0.1, 0, SIZE / 2, -SIZE * 0.1, SIZE * 0.75);
  glow.addColorStop(0, "rgba(176, 141, 87, 0.16)");
  glow.addColorStop(1, "rgba(176, 141, 87, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const centerX = SIZE / 2;
  let cursorY = SIZE * 0.155;

  // Brand mark
  const mark = await getBrandMark();
  const markSize = SIZE * 0.15;
  ctx.drawImage(mark, centerX - markSize / 2, cursorY, markSize, markSize);
  cursorY += markSize + SIZE * 0.032;

  // Wordmark
  ctx.font = `600 ${SIZE * 0.021}px "${FONT.interSemiBold}"`;
  ctx.letterSpacing = `${SIZE * 0.021 * 0.22}px`;
  ctx.fillStyle = COLOR.gold;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("THE GOSPEL LENS", centerX, cursorY);
  ctx.letterSpacing = "0px";
  cursorY += SIZE * 0.075;

  // Category eyebrow (pill)
  const pillHeight = drawPill(ctx, {
    text: post.category.toUpperCase(),
    centerX,
    y: cursorY,
    paddingX: SIZE * 0.028,
    paddingY: SIZE * 0.012,
    fontSize: SIZE * 0.021,
  });
  cursorY += pillHeight + SIZE * 0.06;

  // Title -- fit within a comfortable width AND the vertical space actually
  // left before the footer (see fitTitle's comment), shrinking from a
  // large display size down to a still-readable minimum if needed.
  const LINE_HEIGHT_RATIO = 1.22;
  const domainY = SIZE * 0.895;
  const titleBottomLimit = domainY - SIZE * 0.045 - SIZE * 0.02; // stop short of the divider, with a margin
  const maxTitleWidth = SIZE * 0.8;
  const { lines, fontSize: titleFontSize } = fitTitle(ctx, post.title, {
    maxWidth: maxTitleWidth,
    maxHeight: titleBottomLimit - cursorY,
    lineHeightRatio: LINE_HEIGHT_RATIO,
    maxLines: 4,
    maxFontSize: SIZE * 0.073,
    minFontSize: SIZE * 0.032,
  });
  ctx.font = `700 ${titleFontSize}px "${FONT.playfair}"`;
  ctx.fillStyle = COLOR.cream;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const lineHeight = titleFontSize * LINE_HEIGHT_RATIO;
  for (const line of lines) {
    cursorY += lineHeight;
    ctx.fillText(line, centerX, cursorY);
  }

  // Divider + domain footer, pinned near the bottom rather than following
  // the title block, so short and long titles both end up looking
  // deliberately composed instead of the footer drifting around.
  ctx.strokeStyle = COLOR.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - SIZE * 0.075, domainY - SIZE * 0.045);
  ctx.lineTo(centerX + SIZE * 0.075, domainY - SIZE * 0.045);
  ctx.stroke();

  ctx.font = `500 ${SIZE * 0.0175}px "${FONT.inter}"`;
  ctx.fillStyle = COLOR.muted;
  ctx.letterSpacing = `${SIZE * 0.0175 * 0.06}px`;
  ctx.textAlign = "center";
  ctx.fillText("the-gospel-lens.vercel.app", centerX, domainY);
  ctx.letterSpacing = "0px";

  return canvas.toBuffer("image/png");
}

export async function buildAllShareCards(posts, outDir) {
  mkdirSync(outDir, { recursive: true });
  for (const post of posts) {
    const buffer = await buildShareCard(post);
    writeFileSync(path.join(outDir, `${post.slug}.png`), buffer);
  }
}
