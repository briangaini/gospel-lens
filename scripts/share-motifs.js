// The specific subject drawn on each share card (a vine, a lighthouse, an open tomb...),
// sitting on top of one of the backgrounds in share-scenes.js. Each motif is a function
// drawn in a local space: (0,0) is where it stands on the ground (or its centre, for
// motifs that float in the sky), +x right, -y up, roughly 100 units tall at scale 1.
// o = { s: scale, rnd: seeded random }.

let INK = "#140e13", GOLD = "#f4cf86", GOLD2 = "#e0a553", CREAM = "#fff1cf", GREEN = "#2f4a2a", LEAF = "#5f8a45";

const ln = (x, w, col, ...p) => {
  x.strokeStyle = col; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]);
  x.stroke();
};
const circ = (x, cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
const poly = (x, col, ...p) => {
  x.fillStyle = col; x.beginPath(); x.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]);
  x.closePath(); x.fill();
};
const ell = (x, cx, cy, rx, ry, col, rot = 0) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, rot, 0, 7); x.fill(); };
const soft = (x, cx, cy, r, c0) => {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, c0); g.addColorStop(1, "rgba(255,200,120,0)");
  x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
};
// A person made of thick round strokes: head, torso, and arm/leg paths from the joints.
const person = (x, j, col = INK, k = 1) => {
  circ(x, j.head[0], j.head[1], 7 * k, col);
  ln(x, 12 * k, col, ...j.torso);
  for (const limb of [j.la, j.ra, j.ll, j.rl]) if (limb) ln(x, 6.5 * k, col, ...limb);
};
const stand = (dx = 0, lean = 0) => ({
  head: [dx + lean * 0.4, -88], torso: [dx + lean * 0.3, -76, dx, -44],
  la: [dx + lean * 0.3, -75, dx - 10, -56, dx - 11, -40], ra: [dx + lean * 0.3, -75, dx + 10, -56, dx + 11, -40],
  ll: [dx, -44, dx - 6, -22, dx - 6, 0], rl: [dx, -44, dx + 6, -22, dx + 6, 0],
});
const heartPath = (x, cx, cy, k = 1) => {
  x.beginPath(); x.moveTo(cx, cy - 30 * k);
  x.bezierCurveTo(cx - 5 * k, cy - 48 * k, cx - 36 * k, cy - 52 * k, cx - 36 * k, cy - 26 * k);
  x.bezierCurveTo(cx - 36 * k, cy - 4 * k, cx - 10 * k, cy + 10 * k, cx, cy + 22 * k);
  x.bezierCurveTo(cx + 10 * k, cy + 10 * k, cx + 36 * k, cy - 4 * k, cx + 36 * k, cy - 26 * k);
  x.bezierCurveTo(cx + 36 * k, cy - 52 * k, cx + 5 * k, cy - 48 * k, cx, cy - 30 * k);
  x.closePath();
};
const tree = (x, rnd, { bare = true, leaves = false, len = 34, depth = 6, lean = 0 }) => {
  const branch = (bx, by, a, l, d, w) => {
    const ex = bx + Math.cos(a) * l, ey = by + Math.sin(a) * l;
    ln(x, w, INK, bx, by, ex, ey);
    if (d === 0) { if (leaves) { circ(x, ex, ey, 9 + rnd() * 6, rnd() < 0.5 ? GREEN : "#3b5a30"); } return; }
    branch(ex, ey, a - 0.35 - rnd() * 0.3 + lean, l * 0.76, d - 1, w * 0.7);
    branch(ex, ey, a + 0.35 + rnd() * 0.3 + lean, l * 0.76, d - 1, w * 0.7);
    if (d > 3 && rnd() < 0.5) branch(ex, ey, a + (rnd() - 0.5) * 0.4, l * 0.6, d - 2, w * 0.6);
  };
  branch(0, 0, -Math.PI / 2 + lean * 0.5, len, depth, 8);
};
const leafShape = (x, len, wid, col) => {
  x.fillStyle = col; x.beginPath(); x.moveTo(0, 0);
  x.quadraticCurveTo(wid, -len * 0.5, 0, -len); x.quadraticCurveTo(-wid, -len * 0.5, 0, 0); x.fill();
};
const flame = (x, h, w) => {
  const g = x.createLinearGradient(0, 0, 0, -h);
  g.addColorStop(0, "#ff9b3d"); g.addColorStop(0.6, "#ffd36e"); g.addColorStop(1, "#fff6d6");
  x.fillStyle = g; x.beginPath(); x.moveTo(0, 0);
  x.bezierCurveTo(-w, -h * 0.35, -w * 0.5, -h * 0.7, 0, -h);
  x.bezierCurveTo(w * 0.5, -h * 0.7, w, -h * 0.35, 0, 0); x.fill();
};

export const MOTIFS = {
  // ---- things that stand on the ground -------------------------------------------
  scroll: (x) => {
    soft(x, 0, -50, 110, "rgba(255,220,150,.55)");
    x.fillStyle = "#f3e2b6"; x.fillRect(-58, -84, 116, 70);
    ell(x, -58, -49, 8, 35, "#d9c08a"); ell(x, 58, -49, 8, 35, "#d9c08a");
    for (let i = 0; i < 6; i++) ln(x, 2, "rgba(60,40,25,.65)", -44, -74 + i * 10, 44 - (i % 3) * 12, -74 + i * 10);
  },
  "torn-scroll": (x) => {
    soft(x, 0, -50, 110, "rgba(255,210,140,.5)");
    x.save(); x.translate(-10, 0); x.rotate(-0.08);
    poly(x, "#f3e2b6", -58, -84, 4, -84, 14, -62, 0, -48, 12, -30, 2, -14, -58, -14); x.restore();
    x.save(); x.translate(12, 0); x.rotate(0.1);
    poly(x, "#e9d4a2", 14, -84, 62, -84, 62, -14, 8, -14, 16, -30, 6, -48, 18, -62); x.restore();
    ln(x, 2, "rgba(60,40,25,.6)", -48, -72, -8, -72); ln(x, 2, "rgba(60,40,25,.6)", -48, -60, -14, -60); ln(x, 2, "rgba(60,40,25,.6)", 30, -72, 56, -72);
    for (let i = 0; i < 4; i++) circ(x, -18 + i * 14, -6 + (i % 2) * 6, 5, "#cfd3da");
  },
  book: (x, o) => {
    soft(x, 0, -60, 120, "rgba(255,225,160,.65)");
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.22; poly(x, "rgba(255,230,170,.18)", 0, -50, Math.cos(a - 0.05) * 130, -50 + Math.sin(a - 0.05) * 130, Math.cos(a + 0.05) * 130, -50 + Math.sin(a + 0.05) * 130); }
    x.fillStyle = INK; x.beginPath(); x.moveTo(-70, -14); x.lineTo(-70, -50); x.quadraticCurveTo(-35, -66, 0, -48); x.quadraticCurveTo(35, -66, 70, -50); x.lineTo(70, -14); x.quadraticCurveTo(35, -30, 0, -12); x.quadraticCurveTo(-35, -30, -70, -14); x.fill();
    x.fillStyle = "#f6e6b8"; x.beginPath(); x.moveTo(-64, -18); x.lineTo(-64, -48); x.quadraticCurveTo(-33, -62, -3, -46); x.lineTo(-3, -15); x.quadraticCurveTo(-33, -28, -64, -18); x.fill();
    x.beginPath(); x.moveTo(64, -18); x.lineTo(64, -48); x.quadraticCurveTo(33, -62, 3, -46); x.lineTo(3, -15); x.quadraticCurveTo(33, -28, 64, -18); x.fill();
    for (let i = 0; i < 4; i++) { ln(x, 1.4, "rgba(60,40,25,.45)", -58, -42 + i * 6, -10, -38 + i * 6); ln(x, 1.4, "rgba(60,40,25,.45)", 10, -38 + i * 6, 58, -42 + i * 6); }
    if (o.v === "speaking") for (let i = 1; i <= 3; i++) { x.strokeStyle = `rgba(255,224,160,${0.8 - i * 0.2})`; x.lineWidth = 2; x.beginPath(); x.arc(0, -52, 22 + i * 20, -Math.PI * 0.82, -Math.PI * 0.18); x.stroke(); }
    if (o.v === "star") { soft(x, 70, -130, 60, "rgba(255,240,190,.9)"); x.fillStyle = "#fffaf0"; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 16, a = i * Math.PI / 4; x.lineTo(70 + Math.cos(a) * r, -130 + Math.sin(a) * r); } x.fill(); }
  },
  kneel: (x) => {
    ln(x, 12, INK, 8, -46, 2, -22); ln(x, 11, INK, 2, -22, 18, -6); ln(x, 8, INK, 18, -6, -8, -3);
    circ(x, 12, -56, 7.5, INK); ln(x, 6, INK, 8, -42, 22, -40, 20, -52);
  },
  key: (x) => {
    soft(x, 0, -55, 90, "rgba(255,225,150,.6)");
    x.strokeStyle = GOLD; x.lineWidth = 7; x.beginPath(); x.arc(0, -76, 14, 0, 7); x.stroke();
    ln(x, 6, GOLD, 0, -62, 0, -6); ln(x, 6, GOLD, 0, -22, 14, -22); ln(x, 6, GOLD, 0, -34, 11, -34);
  },
  vase: (x) => {
    soft(x, 0, -50, 90, "rgba(255,215,150,.4)");
    x.fillStyle = INK; x.beginPath(); x.moveTo(-12, -98); x.lineTo(12, -98); x.lineTo(10, -82); x.quadraticCurveTo(46, -66, 38, -34);
    x.quadraticCurveTo(34, -8, 18, -2); x.lineTo(-18, -2); x.quadraticCurveTo(-34, -8, -38, -34); x.quadraticCurveTo(-46, -66, -10, -82); x.closePath(); x.fill();
    ln(x, 1.6, GOLD2, -30, -50, 30, -50); ln(x, 1.6, GOLD2, -32, -38, 32, -38);
  },
  "cracked-jar": (x) => {
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.3; poly(x, "rgba(255,225,150,.2)", 0, -48, Math.cos(a - 0.04) * 150, -48 + Math.sin(a - 0.04) * 150, Math.cos(a + 0.04) * 150, -48 + Math.sin(a + 0.04) * 150); }
    soft(x, 0, -48, 100, "rgba(255,220,150,.6)");
    x.fillStyle = INK; x.beginPath(); x.moveTo(-14, -90); x.lineTo(14, -90); x.lineTo(12, -76); x.quadraticCurveTo(46, -62, 40, -32); x.quadraticCurveTo(34, -6, 16, -2); x.lineTo(-16, -2); x.quadraticCurveTo(-34, -6, -40, -32); x.quadraticCurveTo(-46, -62, -12, -76); x.closePath(); x.fill();
    x.strokeStyle = "#ffe9a8"; x.lineWidth = 2.4; x.shadowColor = "#ffd47a"; x.shadowBlur = 8;
    x.beginPath(); x.moveTo(-6, -74); x.lineTo(2, -58); x.lineTo(-10, -44); x.lineTo(0, -26); x.stroke();
    x.beginPath(); x.moveTo(20, -60); x.lineTo(12, -42); x.lineTo(24, -28); x.stroke(); x.shadowBlur = 0;
  },
  heart: (x, o) => {
    const v = o.v || "gold";
    const cy = -58;
    if (v === "walled") { for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283; ell(x, Math.cos(a) * 56, cy + Math.sin(a) * 46, 11, 7, INK, a + 1.57); } }
    soft(x, 0, cy, 100, v === "white" ? "rgba(255,255,255,.55)" : "rgba(255,200,120,.6)");
    if (v === "white") { for (let i = 1; i <= 3; i++) { x.strokeStyle = `rgba(255,255,255,${0.7 - i * 0.18})`; x.lineWidth = 1.6; x.beginPath(); x.ellipse(0, -2, 22 + i * 18, 4 + i * 3, 0, 0, 7); x.stroke(); } }
    heartPath(x, 0, cy, v === "walled" ? 0.85 : 1);
    x.fillStyle = v === "white" ? "#fff8e8" : v === "cracked" ? INK : v === "mended" ? "#a8392f" : "#d9573a"; x.fill();
    if (v === "cracked") { x.strokeStyle = "#ffd98a"; x.lineWidth = 2.6; x.shadowColor = "#ffd47a"; x.shadowBlur = 10; x.beginPath(); x.moveTo(2, cy - 28); x.lineTo(-6, cy - 12); x.lineTo(5, cy); x.lineTo(-4, cy + 14); x.stroke(); x.shadowBlur = 0; }
    if (v === "mended") { x.strokeStyle = "#ffe08a"; x.shadowColor = "#ffd47a"; x.shadowBlur = 6; x.lineWidth = 3.4; x.beginPath(); x.moveTo(2, cy - 28); x.lineTo(-6, cy - 12); x.lineTo(5, cy); x.lineTo(-4, cy + 14); x.stroke(); x.beginPath(); x.moveTo(-22, cy - 30); x.lineTo(-14, cy - 12); x.lineTo(-24, cy + 2); x.stroke(); }
    if (v === "cross") { x.fillStyle = INK; x.fillRect(-3.5, cy - 28, 7, 44); x.fillRect(-14, cy - 16, 28, 7); }
    if (v === "walled") { x.fillStyle = GOLD; }
  },
  coins: (x, o) => {
    const stack = (sx, n) => { for (let i = 0; i < n; i++) { ell(x, sx, -6 - i * 6, 20, 6, "#7b7f88"); ell(x, sx, -8 - i * 6, 20, 6, "#cfd3da"); } };
    stack(-34, 5); stack(2, 8); stack(38, 3);
    for (let i = 0; i < 5; i++) ell(x, -60 + i * 30 + (o.rnd() - 0.5) * 8, 4 + o.rnd() * 3, 9, 3, "#cfd3da");
  },
  tree: (x, o) => tree(x, o.rnd, { bare: !(o.v === "lush"), leaves: o.v === "lush", len: o.v === "lush" ? 30 : 30, depth: o.v === "lush" ? 5 : 6, lean: o.v === "lean" ? 0.18 : 0 }),
  "two-trees": (x, o) => { x.save(); x.translate(-56, 0); tree(x, o.rnd, { len: 26, depth: 5 }); x.restore(); x.fillStyle = INK; x.fillRect(44, -100, 8, 100); x.fillRect(26, -80, 44, 8); },
  cross: (x, o) => {
    soft(x, 0, -60, 120, "rgba(255,225,160,.6)");
    if (o.v === "road") poly(x, "rgba(120,80,40,.55)", -14, 0, 14, 0, 4, -20, -4, -20);
    x.fillStyle = INK; x.fillRect(-4.5, -110, 9, 110); x.fillRect(-26, -86, 52, 9);
  },
  door: (x) => {
    poly(x, "rgba(255,225,150,.45)", 14, -8, 120, 6, 120, -6, 20, -80);
    x.fillStyle = INK; x.fillRect(-26, -96, 52, 96); x.fillStyle = "#ffe29a"; x.fillRect(-20, -90, 40, 90);
    poly(x, INK, -26, -96, -20, -90, -4, -86, -4, -4, -20, 0, -26, 0);
    x.fillStyle = GOLD; circ(x, -8, -44, 2.2, INK);
  },
  tomb: (x) => {
    soft(x, 0, -40, 90, "rgba(255,230,170,.7)");
    poly(x, INK, -110, 0, -90, -52, -50, -86, 0, -96, 50, -86, 90, -52, 110, 0);
    x.fillStyle = "#ffe6a6"; x.beginPath(); x.moveTo(-26, 0); x.lineTo(-26, -42); x.quadraticCurveTo(0, -70, 26, -42); x.lineTo(26, 0); x.fill();
    x.fillStyle = "#3a2f33"; x.beginPath(); x.arc(52, -22, 22, 0, 7); x.fill(); ln(x, 2, "#5a4a50", 36, -28, 62, -14);
  },
  rock: (x) => {
    poly(x, INK, -70, 0, -62, -34, -34, -62, 6, -76, 40, -58, 66, -30, 74, 0);
    poly(x, "rgba(255,225,170,.35)", 6, -76, 40, -58, 22, -50, -4, -62);
    for (let i = 0; i < 6; i++) ln(x, 3, "rgba(255,255,255,.4)", -80 + i * 28, 2, -76 + i * 28, -10 - (i % 2) * 6);
  },
  sprout: (x) => {
    ell(x, 0, 2, 44, 8, "#2a1d12"); ln(x, 4, GREEN, 0, 0, 0, -40, 2, -52);
    x.save(); x.translate(2, -50); x.rotate(0.9); leafShape(x, 34, 14, LEAF); x.restore();
    x.save(); x.translate(0, -44); x.rotate(-0.9); leafShape(x, 30, 12, "#4d7a3a"); x.restore();
    soft(x, 0, -56, 60, "rgba(255,230,160,.4)");
  },
  "fruit-branch": (x, o) => {
    ln(x, 6, INK, -90, -20, -30, -46, 30, -40, 80, -70);
    for (const [px, py] of [[-60, -34], [-10, -48], [30, -40], [58, -54]]) { x.save(); x.translate(px, py); x.rotate(-0.4 + o.rnd() * 0.8); leafShape(x, 30, 10, "#3e6232"); x.restore(); }
    for (const [px, py, r] of [[-24, -34, 11], [8, -24, 13], [46, -26, 11], [-50, -22, 10]]) { circ(x, px, py, r, "#e9863a"); circ(x, px - 3, py - 3, r * 0.35, "rgba(255,230,180,.7)"); ln(x, 2, INK, px, py - r, px + 2, py - r - 7); }
  },
  vine: (x, o) => {
    const v = o.v || "grapes";
    ln(x, 6, INK, -80, 0, -46, -30, -10, -42, 30, -66, 70, -60);
    const lf = (px, py, a, s) => { x.save(); x.translate(px, py); x.rotate(a); leafShape(x, 34 * s, 16 * s, "#2f4d2a"); x.restore(); };
    lf(-46, -30, -1.2, 1); lf(-10, -42, 0.9, 1.1); lf(30, -66, -0.8, 1); lf(70, -60, 1.1, 0.9); lf(-60, -16, 1.3, 0.8);
    if (v === "grapes") for (let i = 0; i < 12; i++) circ(x, -10 + (i % 4) * 9 - Math.floor(i / 4) * 4, -42 + 9 + Math.floor(i / 4) * 10, 5.2, "#6a3d8a");
    if (v === "pruned") { ln(x, 5, INK, 30, -66, 50, -90); ln(x, 6, GOLD2, 50, -90, 54, -94); lf(54, -94, -0.3, 0.6); for (let i = 0; i < 9; i++) circ(x, -10 + (i % 3) * 9, -33 + Math.floor(i / 3) * 10, 5.4, "#6a3d8a"); }
    if (v === "apart") { x.save(); x.translate(88, 6); x.rotate(0.15); ln(x, 6, "#3a2c24", -50, -6, 18, -4); for (const px of [-30, -6]) { x.save(); x.translate(px, -6); x.rotate(0.5); leafShape(x, 20, 8, "#5a4a3a"); x.restore(); } x.restore(); }
  },
  "shears": (x) => {
    ln(x, 6, INK, -26, -4, 14, -72); ln(x, 6, INK, 26, -4, -14, -72);
    x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.arc(-32, 4, 9, 0, 7); x.stroke(); x.beginPath(); x.arc(32, 4, 9, 0, 7); x.stroke();
    circ(x, 0, -34, 3, GOLD2); ln(x, 4, GREEN, -60, -96, 60, -80); x.save(); x.translate(40, -84); x.rotate(0.6); leafShape(x, 22, 9, LEAF); x.restore();
  },
  bridge: (x) => {
    poly(x, INK, -140, 0, -140, -26, -90, -30, -90, 0); poly(x, INK, 140, 0, 140, -26, 90, -30, 90, 0);
    x.fillStyle = INK; x.beginPath(); x.moveTo(-100, -34); x.quadraticCurveTo(0, -78, 100, -34); x.lineTo(100, -26); x.quadraticCurveTo(0, -66, -100, -26); x.fill();
    x.beginPath(); x.moveTo(-100, -26); x.quadraticCurveTo(0, -52, 100, -26); x.lineTo(100, -8); x.quadraticCurveTo(0, -36, -100, -8); x.fill();
    soft(x, 0, -30, 80, "rgba(255,225,160,.35)");
  },
  fingerprint: (x) => {
    soft(x, 0, 0, 110, "rgba(255,225,160,.55)");
    for (let i = 1; i <= 8; i++) { x.strokeStyle = GOLD; x.lineWidth = 2.4; x.beginPath(); x.ellipse(0, 0, 8 + i * 8, 10 + i * 9, 0, Math.PI * (0.15 + (i % 3) * 0.06), Math.PI * (1.85 - (i % 2) * 0.1)); x.stroke(); }
  },
  birds: (x, o) => {
    for (let i = 0; i < 8; i++) { const bx = (o.rnd() - 0.5) * 240, by = (o.rnd() - 0.5) * 70, s = 0.7 + o.rnd() * 0.9; x.strokeStyle = INK; x.lineWidth = 2.6 * s; x.lineCap = "round"; x.beginPath(); x.moveTo(bx - 12 * s, by - 4 * s); x.quadraticCurveTo(bx - 5 * s, by - 10 * s, bx, by); x.quadraticCurveTo(bx + 5 * s, by - 10 * s, bx + 12 * s, by - 4 * s); x.stroke(); }
  },
  globe: (x) => {
    soft(x, 0, 0, 120, "rgba(255,225,170,.5)");
    const g = x.createRadialGradient(-16, -16, 4, 0, 0, 60); g.addColorStop(0, "#5f8fb4"); g.addColorStop(1, "#1d3550"); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.fill();
    x.fillStyle = "#4f7a45"; for (const [a, b, r] of [[-20, -12, 18], [14, 14, 16], [24, -22, 11], [-30, 22, 9]]) { x.beginPath(); x.ellipse(a, b, r, r * 0.7, a * 0.05, 0, 7); x.fill(); }
    x.strokeStyle = "rgba(255,230,170,.7)"; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.stroke();
  },
  friends: (x) => {
    const sit = (dx, face) => { person(x, { head: [dx, -62], torso: [dx, -52, dx - face * 2, -22], la: [dx, -50, dx + face * 10, -36, dx + face * 18, -30], ra: null, ll: [dx - face * 2, -22, dx + face * 16, -20, dx + face * 18, 0], rl: null }); };
    sit(-12, 1); sit(12, -1); ln(x, 6, INK, -12, -50, 8, -52);
    ln(x, 4, INK, -60, 0, 60, 0);
  },
  "tear-bottle": (x) => {
    soft(x, 0, -34, 70, "rgba(255,225,160,.5)");
    x.fillStyle = INK; x.fillRect(-7, -88, 14, 24); x.beginPath(); x.moveTo(-8, -64); x.quadraticCurveTo(-38, -56, -34, -26); x.quadraticCurveTo(-32, -2, 0, -2); x.quadraticCurveTo(32, -2, 34, -26); x.quadraticCurveTo(38, -56, 8, -64); x.fill();
    x.fillStyle = GOLD; x.beginPath(); x.moveTo(0, -42); x.quadraticCurveTo(-12, -24, 0, -14); x.quadraticCurveTo(12, -24, 0, -42); x.fill(); ln(x, 2, "rgba(255,255,255,.4)", -22, -48, -26, -28);
  },
  tear: (x) => {
    soft(x, 0, 0, 90, "rgba(255,235,190,.5)");
    x.fillStyle = "rgba(255,244,214,.95)"; x.beginPath(); x.moveTo(0, -56); x.quadraticCurveTo(-40, -8, -26, 18); x.quadraticCurveTo(0, 42, 26, 18); x.quadraticCurveTo(40, -8, 0, -56); x.fill();
    ln(x, 3, "rgba(255,255,255,.85)", -14, 2, -16, 14);
  },
  hourglass: (x) => {
    soft(x, 0, -52, 80, "rgba(255,225,160,.4)");
    x.fillStyle = "rgba(255,240,200,.35)"; x.beginPath(); x.moveTo(-26, -92); x.lineTo(26, -92); x.lineTo(3, -50); x.lineTo(26, -8); x.lineTo(-26, -8); x.lineTo(-3, -50); x.closePath(); x.fill();
    poly(x, GOLD2, -16, -88, 16, -88, 2, -64, -2, -64); poly(x, GOLD2, -22, -10, 22, -10, 8, -30, -8, -30); ln(x, 2, GOLD2, 0, -64, 0, -30);
    x.fillStyle = INK; x.fillRect(-32, -98, 64, 7); x.fillRect(-32, -8, 64, 7); ln(x, 5, INK, -28, -92, -28, -6); ln(x, 5, INK, 28, -92, 28, -6);
  },
  sheaf: (x) => {
    for (let i = -5; i <= 5; i++) { const ex = i * 9, ey = -96 + Math.abs(i) * 3; ln(x, 2.6, INK, i * 2, 0, ex, ey); for (let k = 0; k < 5; k++) ell(x, ex + (k % 2 ? 3 : -3), ey + k * 6, 2.4, 6, GOLD2, i * 0.07); }
    ln(x, 6, "#3a2a1a", -22, -36, 22, -36);
  },
  runner: (x) => {
    person(x, { head: [14, -92], torso: [10, -80, -4, -48], la: [10, -78, 28, -64, 36, -76], ra: [10, -78, -6, -66, -10, -80], ll: [-4, -48, 14, -34, 26, -12], rl: [-4, -48, -20, -30, -34, -8] });
    ln(x, 3, GOLD2, 62, -4, 62, -94); poly(x, GOLD, 62, -94, 92, -86, 62, -78);
  },
  compass: (x) => {
    soft(x, 0, 0, 120, "rgba(255,225,160,.55)");
    x.strokeStyle = GOLD; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 54, 0, 7); x.stroke();
    x.fillStyle = "rgba(20,14,19,.8)"; x.beginPath(); x.arc(0, 0, 50, 0, 7); x.fill();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; ln(x, i % 4 ? 1.4 : 2.6, GOLD, Math.cos(a) * 44, Math.sin(a) * 44, Math.cos(a) * 50, Math.sin(a) * 50); }
    poly(x, "#e8583f", 0, -40, 8, 0, -8, 0); poly(x, CREAM, 0, 40, 8, 0, -8, 0); circ(x, 0, 0, 4, GOLD);
  },
  ladder: (x) => {
    soft(x, 20, -160, 90, "rgba(255,240,200,.8)");
    ln(x, 5, INK, -22, 0, 4, -170); ln(x, 5, INK, 22, 0, 16, -170);
    for (let i = 1; i < 11; i++) { const t = i / 11, lx = -22 + (4 + 22) * t, rx = 22 + (16 - 22) * t, y = -170 * t; ln(x, 3.4, INK, lx, y, rx, y); }
  },
  eye: (x) => {
    soft(x, 0, 0, 130, "rgba(255,225,160,.6)");
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; ln(x, 2, "rgba(255,225,160,.5)", Math.cos(a) * 54, Math.sin(a) * 36, Math.cos(a) * 84, Math.sin(a) * 56); }
    x.fillStyle = INK; x.beginPath(); x.moveTo(-60, 0); x.quadraticCurveTo(0, -46, 60, 0); x.quadraticCurveTo(0, 46, -60, 0); x.fill();
    circ(x, 0, 0, 20, GOLD); circ(x, 0, 0, 9, INK); circ(x, -5, -5, 3, CREAM);
  },
  ripples: (x, o) => {
    for (let i = 1; i <= 5; i++) { x.strokeStyle = `rgba(255,240,210,${0.85 - i * 0.14})`; x.lineWidth = 2.2; x.beginPath(); x.ellipse(0, 0, 18 + i * 22, 3 + i * 5, 0, 0, 7); x.stroke(); }
    if (o.v === "stone") { circ(x, 0, -62, 9, INK); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.3; ln(x, 2, "rgba(255,245,220,.8)", Math.cos(a) * 12, Math.sin(a) * 6 - 6, Math.cos(a) * 28, Math.sin(a) * 18 - 8); } }
    else { x.fillStyle = "rgba(255,250,235,.9)"; x.beginPath(); x.moveTo(0, -30); x.quadraticCurveTo(-8, -14, 0, -8); x.quadraticCurveTo(8, -14, 0, -30); x.fill(); }
  },
  "open-hands": (x) => {
    soft(x, 0, -70, 90, "rgba(255,230,170,.8)");
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.25; ln(x, 2, "rgba(255,230,170,.55)", Math.cos(a) * 24, -66 + Math.sin(a) * 24, Math.cos(a) * 60, -66 + Math.sin(a) * 60); }
    circ(x, 0, -70, 13, "#fff6d8");
    for (const side of [-1, 1]) {
      x.save(); x.scale(side, 1); x.fillStyle = INK;
      x.beginPath(); x.moveTo(-4, -6); x.quadraticCurveTo(22, -2, 40, -30); x.quadraticCurveTo(46, -42, 36, -40); x.quadraticCurveTo(24, -24, 6, -22); x.quadraticCurveTo(-4, -20, -4, -6); x.fill();
      for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(14 + k * 7, -24 - k * 4, 3.4, 9, 0.9 + k * 0.1, 0, 7); x.fill(); }
      x.restore();
    }
  },
  lighthouse: (x) => {
    poly(x, "rgba(255,238,180,.5)", 0, -92, 280, -122, 280, -60); poly(x, "rgba(255,238,180,.5)", 0, -92, -280, -122, -280, -60);
    soft(x, 0, -92, 70, "rgba(255,240,190,.9)");
    poly(x, "#1d1520", -18, 0, 18, 0, 11, -84, -11, -84); poly(x, CREAM, -15, -22, 15, -22, 13, -36, -13, -36); poly(x, CREAM, -12, -52, 12, -52, 10, -66, -10, -66);
    x.fillStyle = "#ffe29a"; x.fillRect(-9, -98, 18, 14); poly(x, INK, -13, -98, 13, -98, 0, -112); x.fillRect(-14, -84, 28, 4);
    poly(x, INK, -50, 0, -34, -10, -18, 0); poly(x, INK, 18, 0, 34, -12, 56, 0);
  },
  dove: (x) => {
    soft(x, 0, 0, 100, "rgba(255,255,255,.55)");
    x.fillStyle = "#fffaf0"; x.beginPath(); x.ellipse(0, 6, 22, 10, -0.15, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-8, 0); x.quadraticCurveTo(-30, -52, -62, -44); x.quadraticCurveTo(-40, -26, -22, 8); x.fill();
    x.beginPath(); x.moveTo(2, 0); x.quadraticCurveTo(14, -58, 52, -66); x.quadraticCurveTo(38, -34, 20, 6); x.fill();
    poly(x, "#fffaf0", -18, 10, -50, 18, -46, 8, -20, 2); circ(x, 22, -2, 6, "#fffaf0"); poly(x, GOLD2, 27, -2, 36, 1, 27, 3);
    ln(x, 2, LEAF, 34, 2, 52, 14); x.save(); x.translate(46, 10); x.rotate(0.9); leafShape(x, 10, 4, LEAF); x.restore();
  },
  "sun-arc": (x) => {
    x.setLineDash([2, 8]); x.strokeStyle = "rgba(255,240,200,.8)"; x.lineWidth = 2; x.beginPath(); x.moveTo(-210, 60); x.quadraticCurveTo(0, -120, 210, 60); x.stroke(); x.setLineDash([]);
    const pts = [[-190, 46, 7, "#ffd9a0"], [-100, -16, 11, "#fff0c0"], [0, -30, 15, "#fffbe8"], [100, -16, 11, "#ffe0a0"], [190, 46, 7, "#ffa860"]];
    for (const [px, py, r, c] of pts) { soft(x, px, py, r * 4, "rgba(255,230,170,.5)"); circ(x, px, py, r, c); }
  },
  basket: (x) => {
    for (const [px, py, r, c] of [[-26, -42, 11, "#d9453a"], [-4, -50, 12, "#e9863a"], [20, -44, 11, "#7aa24a"], [38, -34, 9, "#d9453a"], [-40, -30, 8, "#e9c23a"], [6, -34, 9, "#9a3a8a"]]) circ(x, px, py, r, c);
    x.fillStyle = "#2a1b12"; x.beginPath(); x.moveTo(-58, -34); x.lineTo(58, -34); x.quadraticCurveTo(50, 0, 0, 0); x.quadraticCurveTo(-50, 0, -58, -34); x.fill();
    for (let i = -4; i <= 4; i++) ln(x, 1.2, "rgba(255,210,150,.4)", i * 12, -32, i * 9, -3);
    ln(x, 1.2, "rgba(255,210,150,.4)", -50, -20, 50, -20);
  },
  lilies: (x) => {
    for (const [px, h, a] of [[-26, 70, -0.15], [4, 92, 0.05], [30, 62, 0.2]]) {
      ln(x, 3, GREEN, px, 0, px + a * 40, -h);
      x.save(); x.translate(px + a * 40, -h); x.rotate(a);
      for (let k = -2; k <= 2; k++) { x.save(); x.rotate(k * 0.45); leafShape(x, 28, 8, "#fff5de"); x.restore(); }
      circ(x, 0, -6, 3, GOLD2); x.restore();
    }
  },
  stargazer: (x) => {
    person(x, { head: [4, -88], torso: [0, -76, -2, -44], la: [0, -74, 12, -92, 20, -110], ra: [0, -74, -12, -56, -12, -40], ll: [-2, -44, -8, -22, -8, 0], rl: [-2, -44, 6, -22, 6, 0] });
    soft(x, 20, -120, 40, "rgba(255,240,200,.6)");
  },
  basin: (x) => {
    x.fillStyle = INK; x.beginPath(); x.moveTo(-50, -34); x.lineTo(50, -34); x.quadraticCurveTo(44, -2, 0, -2); x.quadraticCurveTo(-44, -2, -50, -34); x.fill();
    x.fillStyle = GOLD2; x.beginPath(); x.ellipse(0, -34, 50, 8, 0, 0, 7); x.fill(); x.fillStyle = "#ffe29a"; x.beginPath(); x.ellipse(0, -35, 42, 5, 0, 0, 7); x.fill();
    poly(x, CREAM, 28, -38, 58, -36, 66, -4, 46, -6, 40, -28);
    ln(x, 4, INK, -56, 0, 56, 0);
  },
  "broken-chain": (x) => {
    soft(x, 0, -40, 90, "rgba(255,230,160,.7)");
    const link = (cx, cy, rot, gap) => { x.save(); x.translate(cx, cy); x.rotate(rot); x.strokeStyle = INK; x.lineWidth = 8; x.beginPath(); x.ellipse(0, 0, 20, 12, 0, gap ? 0.5 : 0, gap ? 5.8 : 7); x.stroke(); x.restore(); };
    link(-72, -30, 0.2); link(-44, -28, 0.1, true); link(46, -48, -0.3, true); link(74, -62, -0.5);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283; ln(x, 2, GOLD, Math.cos(a) * 6, -40 + Math.sin(a) * 6, Math.cos(a) * 20, -40 + Math.sin(a) * 20); }
  },
  plow: (x) => {
    ln(x, 6, INK, -50, -88, 24, -34); ln(x, 6, INK, -34, -92, 38, -40); ln(x, 6, INK, 24, -34, 70, -22); poly(x, INK, 60, -26, 92, 0, 56, 2);
    for (let i = 0; i < 4; i++) ln(x, 2.4, "rgba(30,18,12,.8)", -110 + i * 6, 0 + i * 4, 90, 0 + i * 4);
  },
  yoke: (x) => {
    soft(x, 0, -60, 100, "rgba(255,225,160,.5)");
    x.strokeStyle = "#6b4a2a"; x.lineWidth = 11; x.lineCap = "round"; x.beginPath(); x.moveTo(-70, -78); x.quadraticCurveTo(0, -56, 70, -78); x.stroke();
    x.strokeStyle = "#8a6238"; x.lineWidth = 3; x.beginPath(); x.moveTo(-70, -82); x.quadraticCurveTo(0, -60, 70, -82); x.stroke();
    for (const bx of [-38, 38]) { x.strokeStyle = "#6b4a2a"; x.lineWidth = 6; x.beginPath(); x.moveTo(bx - 14, -68); x.quadraticCurveTo(bx - 14, -16, bx, -16); x.quadraticCurveTo(bx + 14, -16, bx + 14, -68); x.stroke(); }
  },
  pillar: (x) => {
    soft(x, 0, -150, 120, "rgba(255,200,110,.6)");
    const g = x.createLinearGradient(0, 0, 0, -260); g.addColorStop(0, "#ff8a2e"); g.addColorStop(0.5, "#ffc866"); g.addColorStop(1, "rgba(255,240,200,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(-26, 0); x.bezierCurveTo(-34, -90, -14, -170, -6, -260); x.lineTo(8, -260); x.bezierCurveTo(16, -170, 36, -90, 26, 0); x.fill();
    for (const px of [-110, -80, 80, 112]) poly(x, INK, px - 18, 0, px, -22, px + 18, 0);
  },
  chest: (x) => {
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.28; poly(x, "rgba(255,225,150,.25)", 0, -50, Math.cos(a - 0.05) * 140, -50 + Math.sin(a - 0.05) * 140, Math.cos(a + 0.05) * 140, -50 + Math.sin(a + 0.05) * 140); }
    soft(x, 0, -46, 80, "rgba(255,225,150,.8)");
    x.fillStyle = INK; x.fillRect(-46, -36, 92, 36); x.beginPath(); x.moveTo(-46, -36); x.lineTo(-40, -66); x.lineTo(40, -66); x.lineTo(46, -36); x.fill();
    x.fillStyle = GOLD; x.beginPath(); x.ellipse(0, -38, 40, 7, 0, 0, 7); x.fill();
    for (let i = 0; i < 9; i++) circ(x, -32 + i * 8, -42 - (i % 3) * 3, 5, i % 2 ? GOLD : GOLD2);
    ln(x, 3, GOLD2, -46, -20, 46, -20);
  },
  leaf: (x) => {
    soft(x, 0, -60, 90, "rgba(255,235,180,.5)");
    ln(x, 4, GREEN, 0, 0, 0, -24);
    x.fillStyle = LEAF; x.beginPath(); x.moveTo(0, -24); x.quadraticCurveTo(64, -40, 4, -104); x.quadraticCurveTo(-60, -50, 0, -24); x.fill();
    ln(x, 2, "rgba(30,60,25,.6)", 0, -26, 2, -96);
    x.fillStyle = "rgba(255,244,214,.95)"; x.beginPath(); x.moveTo(8, -64); x.quadraticCurveTo(-2, -50, 8, -44); x.quadraticCurveTo(18, -50, 8, -64); x.fill();
  },
  boat: (x) => {
    ln(x, 3, INK, 0, -10, 0, -92); poly(x, "#e9d6a8", 3, -90, 44, -22, 3, -22); poly(x, "#cdb88a", -3, -84, -30, -22, -3, -22);
    x.fillStyle = INK; x.beginPath(); x.moveTo(-50, -14); x.quadraticCurveTo(0, 6, 50, -14); x.lineTo(40, 0); x.quadraticCurveTo(0, 12, -40, 0); x.fill();
  },
  head: (x) => {
    soft(x, 0, -60, 110, "rgba(255,225,160,.5)");
    x.fillStyle = INK; x.beginPath(); x.arc(0, -66, 36, 0, 7); x.fill(); poly(x, INK, 30, -66, 46, -58, 32, -54); x.fillRect(-12, -34, 24, 22);
    x.beginPath(); x.ellipse(0, -2, 52, 18, 0, Math.PI, 0); x.fill();
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283, r = 6 + (i % 3) * 7; circ(x, Math.cos(a) * r - 2, -68 + Math.sin(a) * r, 2.6, GOLD); }
    for (let i = 0; i < 5; i++) ln(x, 1.4, "rgba(255,225,160,.7)", -2, -68, -2 + Math.cos(i * 1.3) * 22, -68 + Math.sin(i * 1.3) * 22);
  },
  mask: (x) => {
    soft(x, 0, 0, 110, "rgba(255,225,160,.45)");
    x.fillStyle = INK; x.beginPath(); x.ellipse(0, 0, 38, 50, 0, 0, 7); x.fill(); x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.ellipse(0, 0, 38, 50, 0, 0, 7); x.stroke();
    x.fillStyle = GOLD; x.beginPath(); x.ellipse(-15, -10, 9, 5, -0.3, 0, 7); x.fill(); x.beginPath(); x.ellipse(15, -10, 9, 5, 0.3, 0, 7); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 3; x.beginPath(); x.arc(0, 14, 14, 0.2, Math.PI - 0.2); x.stroke();
    ln(x, 2, "rgba(255,225,160,.8)", 22, -42, 10, -14, 20, 4);
  },
  rainbow: (x) => {
    const cols = ["#e8583f", "#f0913a", "#f4cf5a", "#7fbf6a", "#5a9fd4", "#7a64c0"];
    cols.forEach((c, i) => { x.strokeStyle = c; x.globalAlpha = 0.5; x.lineWidth = 9; x.beginPath(); x.arc(0, 40, 190 - i * 9, Math.PI * 1.08, Math.PI * 1.92); x.stroke(); });
    x.globalAlpha = 1;
  },
  sower: (x, o) => {
    person(x, { head: [-6, -88], torso: [-4, -76, -8, -44], la: [-4, -74, 12, -78, 30, -84], ra: [-4, -74, -16, -62, -22, -50], ll: [-8, -44, 0, -22, 4, 0], rl: [-8, -44, -22, -24, -28, -2] });
    for (let i = 0; i < 14; i++) circ(x, 34 + o.rnd() * 56, -84 + o.rnd() * 40, 1.6, GOLD2);
  },
  tent: (x) => {
    soft(x, 0, -30, 100, "rgba(255,200,110,.45)");
    poly(x, INK, -66, 0, 0, -78, 66, 0); poly(x, "#ffcf7a", -14, 0, 0, -38, 14, 0);
    ln(x, 2, INK, 0, -78, 0, -90); ln(x, 2, INK, -66, 0, -86, 4); ln(x, 2, INK, 66, 0, 86, 4);
    x.save(); x.translate(92, 0); flame(x, 20, 7); x.restore();
  },
  "shield-sword": (x) => {
    soft(x, 0, -56, 100, "rgba(255,225,160,.5)");
    poly(x, "#8a8f9c", -5, -128, 5, -128, 4, -34, -4, -34); poly(x, "#c9ced8", -1, -128, 5, -128, 4, -34, 0, -34); x.fillStyle = GOLD2; x.fillRect(-18, -44, 36, 6);
    x.fillStyle = INK; x.beginPath(); x.moveTo(-34, -92); x.lineTo(34, -92); x.lineTo(30, -42); x.quadraticCurveTo(20, -8, 0, 2); x.quadraticCurveTo(-20, -8, -30, -42); x.closePath(); x.fill();
    x.strokeStyle = GOLD; x.lineWidth = 3; x.stroke(); ln(x, 5, GOLD, 0, -84, 0, -22); ln(x, 5, GOLD, -18, -62, 18, -62);
  },
  candles: (x) => {
    for (let i = -2; i <= 2; i++) { const px = i * 28, h = 40 + ((i + 2) % 3) * 8; x.fillStyle = i === 0 ? "#fff1cf" : "#cfc3a8"; x.fillRect(px - 7, -h, 14, h); ln(x, 1.6, INK, px, -h, px, -h - 6); }
    soft(x, 0, -74, 100, "rgba(255,210,120,.75)"); x.save(); x.translate(0, -52); flame(x, 22, 7); x.restore();
  },
  well: (x) => {
    x.fillStyle = INK; x.fillRect(-34, -34, 68, 34); x.beginPath(); x.ellipse(0, -34, 34, 9, 0, 0, 7); x.fill(); x.fillStyle = "#5a6a80"; x.beginPath(); x.ellipse(0, -34, 28, 6, 0, 0, 7); x.fill();
    ln(x, 5, INK, -30, -34, -30, -90); ln(x, 5, INK, 30, -34, 30, -90); poly(x, INK, -44, -90, 0, -112, 44, -90); ln(x, 1.6, GOLD2, 0, -86, 0, -52); x.fillStyle = INK; x.fillRect(-6, -52, 12, 10);
    for (let i = -3; i <= 3; i++) ln(x, 1, "rgba(255,255,255,.18)", i * 9, -30, i * 9, -4);
  },
  "cup-overflow": (x) => {
    soft(x, 0, -52, 100, "rgba(255,215,130,.6)");
    x.fillStyle = INK; x.beginPath(); x.moveTo(-34, -84); x.lineTo(34, -84); x.quadraticCurveTo(30, -50, 6, -44); x.lineTo(6, -16); x.lineTo(26, -4); x.lineTo(-26, -4); x.lineTo(-6, -16); x.lineTo(-6, -44); x.quadraticCurveTo(-30, -50, -34, -84); x.fill();
    x.fillStyle = GOLD; x.beginPath(); x.ellipse(0, -84, 34, 6, 0, 0, 7); x.fill();
    x.fillStyle = "rgba(255,210,110,.9)"; x.beginPath(); x.moveTo(-34, -84); x.quadraticCurveTo(-46, -66, -44, -40); x.lineTo(-38, -40); x.quadraticCurveTo(-38, -64, -28, -80); x.fill(); x.beginPath(); x.moveTo(34, -84); x.quadraticCurveTo(46, -66, 44, -40); x.lineTo(38, -40); x.quadraticCurveTo(38, -64, 28, -80); x.fill();
    ell(x, 0, 0, 56, 7, "rgba(255,210,110,.7)");
  },
  cage: (x) => {
    x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.arc(0, -52, 40, Math.PI, 0); x.lineTo(40, -6); x.lineTo(-40, -6); x.closePath(); x.stroke();
    for (const bx of [-24, -8, 8, 24]) { x.beginPath(); x.moveTo(bx, -6); x.quadraticCurveTo(bx * 0.6, -50, bx * 0.2, -92); x.stroke(); }
    ln(x, 3, INK, 0, -92, 0, -104); circ(x, 0, -108, 4, INK); x.strokeStyle = INK; x.beginPath(); x.moveTo(40, -52); x.lineTo(70, -66); x.stroke();
    x.save(); x.translate(64, -104); ell(x, 0, 0, 9, 5, INK, -0.4); poly(x, INK, -10, -2, -22, 6, -8, 4); poly(x, INK, 2, -3, 6, -16, 12, -2); circ(x, 8, -3, 3.4, INK); x.restore();
  },
  rings: (x) => {
    soft(x, 0, 0, 100, "rgba(255,225,160,.5)");
    for (const [cx, col] of [[-16, "#8a5a1c"], [16, "#b07a2a"]]) { x.strokeStyle = col; x.lineWidth = 8; x.beginPath(); x.arc(cx, 0, 34, 0, 7); x.stroke(); }
    x.strokeStyle = "#8a5a1c"; x.lineWidth = 8; x.beginPath(); x.arc(-16, 0, 34, -0.7, 0.7); x.stroke();
  },
  lamp: (x) => {
    for (let i = 0; i < 4; i++) { x.fillStyle = `rgba(255,245,225,${0.12 - i * 0.02})`; x.fillRect(-160, -50 - i * 18, 320, 24); }
    soft(x, 0, -92, 110, "rgba(255,215,130,.85)");
    ln(x, 5, INK, 0, 0, 0, -84); x.fillStyle = INK; x.fillRect(-10, -104, 20, 6); x.fillRect(-10, -88, 20, 4); ln(x, 2, INK, -9, -100, -9, -90); ln(x, 2, INK, 9, -100, 9, -90);
    x.fillStyle = "#ffe29a"; x.fillRect(-8, -99, 16, 10); poly(x, INK, -11, -104, 11, -104, 0, -114);
  },
  thorns: (x, o) => {
    soft(x, 0, 0, 100, "rgba(255,210,140,.45)");
    x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.ellipse(0, 0, 50, 22, 0, 0, 7); x.stroke();
    x.strokeStyle = "#3a2d33"; x.lineWidth = 3; x.beginPath(); x.ellipse(0, 0, 44, 18, 0.3, 0, 7); x.stroke();
    for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283, px = Math.cos(a) * 50, py = Math.sin(a) * 22; ln(x, 2.6, INK, px, py, px + Math.cos(a) * 12 + (o.rnd() - 0.5) * 6, py + Math.sin(a) * 12 + (o.rnd() - 0.5) * 6); }
  },
  footprints: (x) => {
    for (let i = 0; i < 9; i++) { const t = i / 9, px = -70 + t * 140 + (i % 2 ? 8 : -8) * (1 - t * 0.5), py = 0 - t * 70, s = 1 - t * 0.55; ell(x, px, py, 7 * s, 11 * s, "rgba(20,14,19,.75)", 0.2); ell(x, px + 1, py + 14 * s, 5 * s, 4 * s, "rgba(20,14,19,.75)"); }
  },
  shepherd: (x) => {
    person(x, { head: [-30, -88], torso: [-30, -76, -30, -44], la: [-30, -74, -18, -60, -8, -66], ra: [-30, -74, -42, -58, -42, -42], ll: [-30, -44, -36, -22, -36, 0], rl: [-30, -44, -24, -22, -24, 0] });
    x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(-6, -2); x.lineTo(-6, -100); x.bezierCurveTo(-6, -118, 16, -118, 16, -102); x.stroke();
    for (const [sx, sy, s] of [[30, 0, 1], [64, -2, 0.85], [92, 0, 0.7]]) { ell(x, sx, sy - 14 * s, 18 * s, 12 * s, "#e9e2d2"); circ(x, sx - 20 * s, sy - 16 * s, 6 * s, INK); for (const lx of [-8, 8]) ln(x, 3 * s, INK, sx + lx * s, sy - 4 * s, sx + lx * s, sy); }
  },
  "parent-child": (x) => {
    person(x, { head: [-14, -88], torso: [-14, -76, -14, -44], la: [-14, -74, -4, -56, 6, -44], ra: [-14, -74, -24, -58, -26, -42], ll: [-14, -44, -20, -22, -20, 0], rl: [-14, -44, -8, -22, -8, 0] });
    person(x, { head: [22, -52], torso: [22, -44, 22, -24], la: [22, -43, 14, -38, 6, -44], ra: [22, -43, 32, -34, 34, -22], ll: [22, -24, 18, -12, 18, 0], rl: [22, -24, 28, -12, 28, 0] }, INK, 0.62);
  },
  feathers: (x, o) => {
    for (let i = 0; i < 9; i++) { x.save(); x.translate((o.rnd() - 0.5) * 240, -20 - o.rnd() * 110); x.rotate((o.rnd() - 0.5) * 2.4); const s = 0.8 + o.rnd() * 0.6; x.fillStyle = "rgba(255,248,230,.95)"; x.beginPath(); x.moveTo(0, 18 * s); x.quadraticCurveTo(10 * s, 0, 0, -22 * s); x.quadraticCurveTo(-10 * s, 0, 0, 18 * s); x.fill(); ln(x, 1, "rgba(120,100,80,.7)", 0, 20 * s, 0, -20 * s); x.restore(); }
  },
  signpost: (x) => {
    ln(x, 6, INK, 0, 0, 0, -108); poly(x, INK, -4, -100, 56, -100, 70, -90, 56, -80, -4, -80); poly(x, INK, 4, -72, -56, -72, -70, -62, -56, -52, 4, -52);
    ln(x, 3, "rgba(120,80,40,.8)", -4, 0, -90, 8); ln(x, 3, "rgba(120,80,40,.8)", 4, 0, 90, 8);
  },
  sleeper: (x) => {
    ln(x, 4, INK, -40, -76, -40, 0); ell(x, -40, -88, 34, 22, GREEN); ell(x, -64, -78, 24, 16, "#3b5a30"); ell(x, -18, -80, 24, 16, "#3b5a30");
    ln(x, 10, INK, 10, -9, 54, -9); circ(x, 4, -10, 7, INK); ln(x, 6, INK, 54, -9, 74, -5); ln(x, 5, INK, 28, -10, 34, -20);
  },
  tower: (x) => {
    poly(x, INK, -70, 0, -70, -26, -52, -26, -52, -52, -34, -52, -34, -76, -16, -76, -16, -100, 16, -100, 16, -76, 34, -76, 34, -52, 52, -52, 52, -26, 70, -26, 70, 0);
    ln(x, 2, "rgba(255,220,150,.6)", -66, -26, 66, -26); ln(x, 2, "rgba(255,220,150,.6)", -48, -52, 48, -52); ln(x, 2, "rgba(255,220,150,.6)", -30, -76, 30, -76);
    ln(x, 2, "#ffd98a", 0, -100, -6, -86, 4, -74);
  },
  bread: (x, o) => {
    const v = o.v || "loaf";
    soft(x, 0, -24, 90, "rgba(255,215,150,.5)");
    ell(x, 0, -18, 46, 22, "#a8662a"); ell(x, 0, -24, 42, 17, "#c98a3e"); ell(x, -10, -30, 18, 6, "rgba(255,220,160,.5)");
    for (const sx of [-14, 2, 18]) ln(x, 2, "#7a4a1c", sx - 4, -34, sx + 4, -14);
    if (v === "water") { x.fillStyle = "#6f8aa8"; x.fillRect(58, -34, 20, 34); ell(x, 68, -34, 10, 3, "#a9c3dc"); x.fillStyle = INK; x.fillRect(64, -48, 8, 14); }
    if (v === "wheat") for (const sx of [-80, -66, 70, 84]) { ln(x, 2, INK, sx, 0, sx + (sx < 0 ? 8 : -8), -64); for (let k = 0; k < 4; k++) ell(x, sx + (sx < 0 ? 8 : -8) + (k % 2 ? 3 : -3), -64 + k * 6, 2.4, 6, GOLD2); }
  },
  honeycomb: (x) => {
    soft(x, 0, 0, 100, "rgba(255,215,120,.6)");
    const hex = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); x.strokeStyle = "#8a5a12"; x.lineWidth = 2; x.stroke(); };
    for (const [cx, cy] of [[0, 0], [28, 0], [-28, 0], [14, -24], [-14, -24], [14, 24], [-14, 24], [42, -24], [-42, -24]]) hex(cx, cy, 15, "#f0b43a");
    hex(0, 0, 15, "#ffd56a"); x.fillStyle = "#f0b43a"; x.beginPath(); x.moveTo(-10, 38); x.quadraticCurveTo(-8, 62, 0, 70); x.quadraticCurveTo(8, 62, 10, 38); x.fill();
  },
  threads: (x, o) => {
    for (let i = 0; i < 6; i++) { x.strokeStyle = i === 3 ? GOLD : "rgba(235,225,245,.55)"; x.lineWidth = i === 3 ? 4.5 : 3; x.beginPath(); x.moveTo(-120, -70 + i * 24); x.bezierCurveTo(-50, -70 + i * 24 + (o.rnd() - 0.5) * 80, 40, -20 + (o.rnd() - 0.5) * 40, 120, -50 + (i - 3) * 8); x.stroke(); }
    soft(x, 40, -30, 70, "rgba(255,220,140,.5)");
  },
  helping: (x) => {
    person(x, { head: [-30, -80], torso: [-30, -70, -26, -40], la: [-30, -68, -14, -54, -4, -64], ra: null, ll: [-26, -40, -32, -20, -32, 0], rl: [-26, -40, -20, -20, -20, 0] });
    x.fillStyle = INK; x.beginPath(); x.ellipse(-40, -58, 20, 26, 0.3, 0, 7); x.fill();
    person(x, { head: [14, -78], torso: [14, -68, 12, -40], la: [14, -66, 0, -52, -14, -46], ra: [14, -66, 22, -50, 26, -38], ll: [12, -40, 8, -20, 8, 0], rl: [12, -40, 18, -20, 18, 0] });
  },
  reaper: (x) => {
    person(x, { head: [-6, -84], torso: [-4, -72, -14, -44], la: [-4, -70, 14, -62, 26, -52], ra: [-4, -70, 10, -66, 22, -58], ll: [-14, -44, -4, -22, 0, 0], rl: [-14, -44, -26, -24, -32, -2] });
    x.strokeStyle = "#cfd3da"; x.lineWidth = 3; x.beginPath(); x.arc(40, -66, 28, Math.PI * 1.1, Math.PI * 1.75); x.stroke(); ln(x, 3, INK, 22, -56, 28, -50);
    for (const [px, h] of [[44, 38], [58, 30], [72, 34]]) { ln(x, 2.4, INK, px, 0, px + 4, -h); for (let k = 0; k < 3; k++) ell(x, px + 4, -h + k * 7, 2.2, 6, GOLD2); }
  },
  farewell: (x) => {
    poly(x, "rgba(110,76,44,.8)", -150, 4, -100, -16, -90, -14, -140, 8); 
    person(x, stand(-100, 0), INK, 0.4);
    person(x, stand(8, 0), INK, 0.95); person(x, { ...stand(32, 0), head: [32, -76], torso: [32, -64, 32, -38], la: [32, -63, 22, -48, 20, -36], ra: [32, -63, 42, -48, 44, -36], ll: [32, -38, 27, -19, 27, 0], rl: [32, -38, 37, -19, 37, 0] }, INK, 0.8);
  },
  hammer: (x) => {
    ln(x, 7, "#6b4a2a", -30, -2, 34, -76); x.save(); x.translate(34, -76); x.rotate(0.9); x.fillStyle = INK; x.fillRect(-26, -12, 52, 22); x.restore();
    x.fillStyle = "#6b4a2a"; x.fillRect(-90, -8, 120, 8); for (const nx of [-70, -50]) { ln(x, 3, "#9aa0ad", nx, -8, nx, -22); }
  },
  "orb-companion": (x) => {
    person(x, { head: [-20, -88], torso: [-20, -76, -20, -44], la: [-20, -74, -8, -58, 4, -52], ra: [-20, -74, -30, -58, -30, -42], ll: [-20, -44, -28, -22, -30, 0], rl: [-20, -44, -10, -22, -8, 0] });
    soft(x, 22, -52, 80, "rgba(255,230,160,.9)"); circ(x, 22, -52, 11, "#fff7dc");
  },
  manger: (x) => {
    soft(x, 0, -34, 90, "rgba(255,225,150,.7)");
    ln(x, 6, INK, -52, 0, 52, -48); ln(x, 6, INK, 52, 0, -52, -48); x.fillStyle = INK; x.beginPath(); x.moveTo(-60, -44); x.lineTo(60, -44); x.lineTo(50, -26); x.lineTo(-50, -26); x.closePath(); x.fill();
    x.fillStyle = GOLD2; x.beginPath(); x.ellipse(0, -44, 54, 8, 0, 0, 7); x.fill(); for (let i = 0; i < 9; i++) ln(x, 1.6, GOLD, -44 + i * 11, -44, -40 + i * 11, -56);
    soft(x, 0, -150, 60, "rgba(255,244,200,.9)"); x.fillStyle = "#fffaf0"; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 20, a = i * Math.PI / 4 - Math.PI / 2; x.lineTo(Math.cos(a) * r, -150 + Math.sin(a) * r); } x.fill();
  },
  torch: (x) => {
    ln(x, 9, "#5a3d22", 0, 0, 0, -96); x.fillStyle = "#3a2616"; x.fillRect(-10, -104, 20, 12);
    soft(x, 0, -128, 90, "rgba(255,200,110,.8)"); x.save(); x.translate(0, -102); flame(x, 52, 17); x.restore();
  },
  sword: (x) => {
    soft(x, 0, -80, 100, "rgba(255,235,190,.6)");
    poly(x, "#d9dde6", -6, -140, 6, -140, 7, -40, -7, -40); poly(x, "#9aa0ad", 0, -140, 6, -140, 7, -40, 0, -40); poly(x, "#d9dde6", -6, -140, 0, -156, 6, -140);
    x.fillStyle = GOLD2; x.fillRect(-24, -40, 48, 7); ln(x, 7, "#5a3d22", 0, -33, 0, -6); circ(x, 0, -4, 6, GOLD2);
  },
  "moon-lake": (x) => {
    soft(x, 0, -150, 130, "rgba(255,248,220,.55)"); circ(x, 0, -150, 26, "#fffaf0");
    const g = x.createLinearGradient(0, -20, 0, 80); g.addColorStop(0, "#1c2a4a"); g.addColorStop(1, "#0b1226"); x.fillStyle = g; x.fillRect(-340, -10, 680, 90);
    for (let i = 0; i < 26; i++) { const t = i / 26; x.fillStyle = `rgba(255,248,220,${0.5 * (1 - t)})`; x.fillRect(-18 - t * 22 + (i % 2) * 8, -6 + i * 3, 36 + t * 44 - (i % 3) * 6, 1.8); }
    poly(x, INK, -340, -10, -240, -30, -120, -10); poly(x, INK, 340, -10, 250, -34, 130, -10);
  },
  constellation: (x) => {
    const pts = [[-70, 40], [-52, 6], [-24, -18], [8, -30], [30, 0], [58, -34], [50, 36], [18, 52], [-18, 30]];
    x.strokeStyle = "rgba(255,236,190,.7)"; x.lineWidth = 1.8; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
    for (const [a, b] of pts) { soft(x, a, b, 16, "rgba(255,240,200,.9)"); circ(x, a, b, 3.6, "#fffaf0"); }
  },
  crown: (x) => {
    for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i - 5) * 0.2; poly(x, "rgba(255,225,150,.22)", 0, 8, Math.cos(a - 0.04) * 160, 8 + Math.sin(a - 0.04) * 160, Math.cos(a + 0.04) * 160, 8 + Math.sin(a + 0.04) * 160); }
    soft(x, 0, 0, 100, "rgba(255,225,150,.7)");
    poly(x, GOLD, -46, 22, -52, -26, -26, -2, 0, -38, 26, -2, 52, -26, 46, 22); x.fillStyle = GOLD2; x.fillRect(-46, 14, 92, 9);
    for (const [cx, cy] of [[-52, -28], [0, -40], [52, -28]]) circ(x, cx, cy, 5, "#e8583f"); for (const cx of [-24, 0, 24]) circ(x, cx, 18, 3.2, CREAM);
  },
  letter: (x) => {
    soft(x, 0, -34, 90, "rgba(255,225,160,.5)");
    x.fillStyle = "#f1e1b8"; x.fillRect(-52, -64, 104, 62); x.strokeStyle = "rgba(60,40,25,.7)"; x.lineWidth = 2; x.strokeRect(-52, -64, 104, 62);
    x.beginPath(); x.moveTo(-52, -64); x.lineTo(0, -28); x.lineTo(52, -64); x.stroke();
    circ(x, 0, -30, 12, "#a8281f"); circ(x, 0, -30, 7, "#c8382c"); ln(x, 2, "#7a1a14", -4, -30, 4, -30);
  },
  "star-path": (x) => {
    poly(x, "rgba(120,80,44,.7)", -6, 0, 6, 0, 2, -110, -2, -110);
    soft(x, 0, -180, 90, "rgba(255,244,200,.9)"); x.fillStyle = "#fffaf0"; x.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? 6 : 26, a = i * Math.PI / 4 - Math.PI / 2; x.lineTo(Math.cos(a) * r, -180 + Math.sin(a) * r); } x.fill();
  },
  walkers: (x) => {
    person(x, { head: [-14, -88], torso: [-14, -76, -14, -44], la: [-14, -74, -22, -58, -24, -42], ra: [-14, -74, -4, -60, -2, -46], ll: [-14, -44, -22, -22, -26, 0], rl: [-14, -44, -8, -22, -4, 0] });
    person(x, { head: [14, -80], torso: [14, -69, 14, -41], la: [14, -67, 6, -52, 4, -40], ra: [14, -67, 22, -52, 24, -40], ll: [14, -41, 8, -20, 6, 0], rl: [14, -41, 22, -20, 26, 0] }, INK, 0.9);
    ln(x, 3, INK, 36, 0, 38, -96);
  },
  sharpen: (x, o) => {
    soft(x, 0, -52, 100, "rgba(255,225,160,.5)");
    for (const sgn of [-1, 1]) { x.save(); x.scale(sgn, 1); poly(x, "#c9ced8", -70, -16, -64, -26, 58, -86, 66, -78); poly(x, "#8a8f9c", -70, -16, -64, -26, -60, -22, -66, -14); ln(x, 7, "#5a3d22", -74, -12, -92, -4); x.restore(); }
    for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (o.rnd() - 0.5) * 2.2, r = 8 + o.rnd() * 30; ln(x, 1.8, GOLD, 0, -52, Math.cos(a) * r, -52 + Math.sin(a) * r); }
  },
};

export const setInk = (c) => { INK = c; };
