// Renders a post's `blocks` array as email-safe HTML — inline styles only
// (no <style> blocks, most email clients strip those), table-based layout
// for the pieces that need to survive Outlook's weak CSS support, colors
// matched to the site's actual palette so the callout boxes ("Wisdom of the
// Day", "Scripture Focus", "Reflection Questions", "Write This On Your
// Heart") read the same as they do on the site. This is a parallel
// implementation of PostBody's rendering, not a shared one — the site uses
// Tailwind classes + React, which don't translate to email HTML at all.

const COLOR = {
  ink: "#1C1F26",
  body: "#2E323B",
  muted: "#5B5F6B",
  faint: "#8A8D96",
  gold: "#B08D57",
  forest: "#4A5D4E",
  cream: "#F8F7F3",
  line: "#e5e2da",
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function boxTable(innerHtml, { background, borderLeft, border }) {
  const borderStyle = borderLeft
    ? `border-left:4px solid ${borderLeft};`
    : border
      ? `border:1px solid ${border};`
      : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:${background}; ${borderStyle} border-radius:4px; margin:0 0 22px;">
  <tr><td style="padding:18px 22px;">${innerHtml}</td></tr>
</table>`;
}

function label(text, color) {
  return `<div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:${color}; font-weight:700; margin:0 0 10px; font-family:Helvetica,Arial,sans-serif;">${escapeHtml(text)}</div>`;
}

function renderBlock(block) {
  const p = (text) =>
    `<p style="font-size:16px; line-height:1.75; color:${COLOR.body}; margin:0 0 18px; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(text)}</p>`;

  switch (block.type) {
    case "p":
      return p(block.text);

    case "heading":
      return `<h2 style="font-size:20px; font-weight:700; color:${COLOR.ink}; margin:26px 0 12px; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(block.text)}</h2>`;

    case "list":
      return `<ul style="margin:0 0 18px; padding-left:22px;">${block.items
        .map((i) => `<li style="font-size:16px; line-height:1.6; color:${COLOR.body}; margin-bottom:8px; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(i)}</li>`)
        .join("")}</ul>`;

    case "quote":
      return boxTable(
        `${label("Wisdom of the Day", COLOR.gold)}<div style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:16px; color:${COLOR.cream}; line-height:1.65;">&ldquo;${escapeHtml(block.text)}&rdquo;</div>${
          block.attribution
            ? `<div style="font-size:13px; color:#B0B4BD; margin-top:10px; font-family:Helvetica,Arial,sans-serif;">— ${escapeHtml(block.attribution)}</div>`
            : ""
        }`,
        { background: COLOR.ink }
      );

    case "scripture":
      return boxTable(
        `${label(`Scripture Focus · ${block.reference}`, COLOR.forest)}${block.verses
          .map(
            (v) =>
              `<div style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:15.5px; color:${COLOR.body}; line-height:1.65; margin-bottom:10px;">&ldquo;${escapeHtml(v)}&rdquo;</div>`
          )
          .join("")}`,
        { background: "#f1f4f0" }
      );

    case "reflection":
      return boxTable(
        `${label("Reflection Questions", COLOR.forest)}${block.items
          .map(
            (q, i) =>
              `<div style="font-size:15.5px; color:${COLOR.body}; margin-bottom:12px; line-height:1.65; font-family:Georgia,'Times New Roman',serif;"><strong style="color:${COLOR.gold};">${i + 1}.</strong>&nbsp; ${escapeHtml(q)}</div>`
          )
          .join("")}`,
        { background: "#ffffff", border: COLOR.line }
      );

    case "heart":
      return boxTable(
        `${label("Write This On Your Heart", "#8a6f42")}<div style="font-size:15.5px; color:${COLOR.body}; line-height:1.65; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(block.text)}</div>`,
        { background: "#fbf3e7" }
      );

    case "encourage":
      return `<table role="presentation" width="100%" style="margin:26px 0;"><tr><td style="text-align:center; border-top:1px solid ${COLOR.line}; border-bottom:1px solid ${COLOR.line}; padding:22px 0;">
        ${label("Be Encouraged", COLOR.gold)}
        <div style="font-family:Georgia,'Times New Roman',serif; font-weight:700; font-size:20px; color:${COLOR.ink}; line-height:1.4;">${escapeHtml(block.text)}</div>
      </td></tr></table>`;

    case "share":
      return boxTable(
        `${label("Share Your Faith", COLOR.forest)}${block.items
          .map((i) => `<div style="font-size:15.5px; color:${COLOR.body}; margin-bottom:8px; font-family:Georgia,'Times New Roman',serif;">•&nbsp; ${escapeHtml(i)}</div>`)
          .join("")}`,
        { background: "#f1f4f0" }
      );

    case "prayer":
      return boxTable(
        `${label("A Prayer", COLOR.muted)}<div style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:15.5px; color:${COLOR.body}; line-height:1.65;">${escapeHtml(block.text)}</div>`,
        { background: "#f7f6f4", borderLeft: COLOR.ink }
      );

    case "closing":
      return `<p style="font-size:13px; font-style:italic; color:${COLOR.faint}; margin:18px 0 0; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(block.text)}</p>`;

    default:
      return "";
  }
}

// Clickable preview card at the top — thumbnail + title + excerpt + domain,
// same information a WhatsApp/iMessage link preview would show, so the
// email reads consistently with how the post shows up everywhere else.
function renderLinkCard({ url, title, excerpt, ogImageUrl }) {
  return `<a href="${url}" style="display:block; text-decoration:none; border:1px solid ${COLOR.line}; border-radius:6px; margin:0 0 28px; overflow:hidden;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td width="76" style="padding:14px; vertical-align:top;">
        <img src="${ogImageUrl}" width="60" height="60" alt="The Gospel Lens" style="display:block; border-radius:6px;" />
      </td>
      <td style="padding:14px 16px 14px 0; vertical-align:top;">
        <div style="font-size:14.5px; font-weight:700; color:${COLOR.ink}; margin:0 0 4px; font-family:Georgia,'Times New Roman',serif;">${escapeHtml(title)} — The Gospel Lens</div>
        <div style="font-size:12.5px; color:${COLOR.muted}; line-height:1.5; font-family:Helvetica,Arial,sans-serif;">${escapeHtml(excerpt)}</div>
        <div style="font-size:11px; color:${COLOR.gold}; margin-top:8px; font-family:Helvetica,Arial,sans-serif;">the-gospel-lens.vercel.app</div>
      </td>
    </tr>
  </table>
</a>`;
}

export function postToEmailHtml(post, { url, ogImageUrl, siteUrl }) {
  const byline = [post.category, post.author ? `By ${post.author}` : null, post.date]
    .filter(Boolean)
    .join(" · ");

  const body = post.blocks.map(renderBlock).join("\n");

  return `<!-- buttondown-editor-mode: fancy -->
<div style="max-width:600px; margin:0 auto; font-family:Georgia,'Times New Roman',serif;">
  <div style="font-size:11px; letter-spacing:1px; text-transform:uppercase; color:${COLOR.faint}; margin:0 0 6px; font-family:Helvetica,Arial,sans-serif;">${escapeHtml(byline)}</div>
  <h1 style="font-size:28px; font-weight:700; color:${COLOR.ink}; line-height:1.2; margin:0 0 22px;">${escapeHtml(post.title)}</h1>

  ${renderLinkCard({ url, title: post.title, excerpt: post.excerpt, ogImageUrl })}

  ${body}

  <table role="presentation" width="100%" style="margin-top:30px; border-top:1px solid ${COLOR.line};"><tr><td style="padding-top:22px;">
    <a href="${url}" style="display:inline-block; background:${COLOR.ink}; color:#F8F7F3; text-decoration:none; padding:12px 22px; border-radius:4px; font-size:14px; font-family:Helvetica,Arial,sans-serif;">Read on The Gospel Lens →</a>
  </td></tr></table>

  <p style="font-size:12px; color:${COLOR.faint}; margin-top:26px; font-family:Helvetica,Arial,sans-serif;">You're receiving this because you subscribed at <a href="${siteUrl}" style="color:${COLOR.faint};">the-gospel-lens.vercel.app</a>.</p>
</div>`;
}
