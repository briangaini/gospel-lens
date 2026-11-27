// The pictures behind the share cards: eight little landscapes drawn with canvas
// code (no photos, so nothing to license). Each draws the whole 630 x 630 square;
// build-share-cards.js darkens the top and bottom and sets the text over it.
// Every post draws its own copy (clouds, stars, wheat, ripples shift with the post's
// id), so two posts with the same scene are never pixel-identical.

import { MOTIFS, setInk } from "./share-motifs.js";

const W = 630;

function makeRng(seed) {
  let s = (seed * 2654435761 + 12345) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sky(x, H, stops) {
  const g = x.createLinearGradient(0, 0, 0, H);
  for (const [at, col] of stops) g.addColorStop(at, col);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H + 40);
}

function glow(x, cx, cy, r, inner, outer = "rgba(255,200,120,0)") {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(cx - r, cy - r, r * 2, r * 2);
}

function clouds(x, rnd, n, y0, y1, tint) {
  for (let i = 0; i < n; i++) {
    const cy = y0 + rnd() * (y1 - y0), cx = rnd() * W, w = 120 + rnd() * 220;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, w);
    g.addColorStop(0, tint);
    g.addColorStop(1, "rgba(255,200,150,0)");
    x.save();
    x.translate(cx, cy);
    x.scale(1, 0.12);
    x.translate(-cx, -cy);
    x.fillStyle = g;
    x.fillRect(cx - w, cy - w, w * 2, w * 2);
    x.restore();
  }
}

// A ridge line made of a few random sine waves; `peaky` folds it into mountain peaks.
function ridge(x, rnd, { base, amp, color, peaky = false, freq = 0.011 }) {
  const waves = [0, 1, 2, 3].map((k) => ({ a: 1 / (k + 1), f: freq * (1 + k * 1.7 + rnd() * 0.4), p: rnd() * 6.28 }));
  const norm = waves.reduce((t, w) => t + w.a, 0);
  x.fillStyle = color;
  x.beginPath();
  x.moveTo(0, W);
  for (let px = 0; px <= W + 4; px += 4) {
    let v = 0;
    for (const w of waves) v += w.a * Math.sin(px * w.f + w.p);
    v /= norm;
    const h = peaky ? Math.pow(1 - Math.abs(v), 1.25) : (v + 1) / 2;
    x.lineTo(px, base - amp * h);
  }
  x.lineTo(W, W);
  x.closePath();
  x.fill();
}

function stars(x, rnd, n, maxY, strength = 1) {
  for (let i = 0; i < n; i++) {
    const px = rnd() * W, py = Math.pow(rnd(), 1.3) * maxY, r = Math.pow(rnd(), 4) * 1.3 + 0.3;
    x.fillStyle = `rgba(255,248,230,${(0.25 + 0.75 * rnd()) * strength})`;
    x.beginPath();
    x.arc(px, py, r, 0, 7);
    x.fill();
  }
}


const DAWNS = [
  { sky: [[0, "#26263a"], [0.45, "#7b5156"], [0.8, "#e2a161"], [1, "#f6d9a0"]], r1: "#8a6a58", r2: "#5d4647", sun: "#fff4d2" },
  { sky: [[0, "#2d2a4a"], [0.45, "#9a5a7a"], [0.8, "#f0a08a"], [1, "#fbd8b8"]], r1: "#8a6070", r2: "#5a4058", sun: "#fff0e0" },
  { sky: [[0, "#2a3a5a"], [0.45, "#6a8aa8"], [0.8, "#e8c8a0"], [1, "#fbeccc"]], r1: "#6a7a8a", r2: "#4a5a6a", sun: "#fffbe8" },
  { sky: [[0, "#3a2430"], [0.45, "#a85a3a"], [0.8, "#f0a040"], [1, "#fbd078"]], r1: "#7a5a3a", r2: "#4a3626", sun: "#fff0c0" },
];
const DUSKS = [
  { sky: [[0, "#1d1838"], [0.5, "#5f4373"], [0.82, "#d9826a"], [1, "#f4c088"]], r1: "#43304f", r2: "#2a1d36" },
  { sky: [[0, "#0f1d33"], [0.5, "#2f5a72"], [0.82, "#d49a78"], [1, "#f4c898"]], r1: "#2a4050", r2: "#1a2a38" },
  { sky: [[0, "#22101e"], [0.5, "#7a2f45"], [0.82, "#f08a5a"], [1, "#fbc078"]], r1: "#4a2236", r2: "#2c1424" },
  { sky: [[0, "#1c1c3c"], [0.5, "#5a5a9a"], [0.82, "#e0b0c0"], [1, "#fbd8d0"]], r1: "#3a3a62", r2: "#26264a" },
];

const SCENES = {
  road(x, rnd, withFigures, pathless) {
    const H = 338;
    sky(x, H, [[0, "#26263a"], [0.45, "#7b5156"], [0.8, "#e2a161"], [1, "#f6d9a0"]]);
    clouds(x, rnd, 9, 60, 250, "rgba(255,200,150,.16)");
    glow(x, 318, H - 10, 260, "rgba(255,236,190,.95)");
    x.fillStyle = "#fff4d2";
    x.beginPath();
    x.arc(318, H - 10, 30, 0, 7);
    x.fill();
    ridge(x, rnd, { base: H - 6, amp: 16, color: "#8a6a58" });
    ridge(x, rnd, { base: H - 1, amp: 11, color: "#5d4647", freq: 0.016 });
    let g = x.createLinearGradient(0, H, 0, W);
    g.addColorStop(0, "#c7964b");
    g.addColorStop(0.35, "#a8782f");
    g.addColorStop(1, "#3a2915");
    x.fillStyle = g;
    x.fillRect(0, H, W, W - H);
    const pal = ["#e8bf6a", "#d4a350", "#c18f3d", "#e2b45c", "#a97a30", "#f0cd82"];
    for (let i = 0; i < 3800; i++) {
      const t = Math.pow(rnd(), 1.6), y = H + 4 + t * (W - H), px = rnd() * W;
      x.strokeStyle = pal[(rnd() * pal.length) | 0];
      x.globalAlpha = 0.35 + 0.5 * rnd();
      x.lineWidth = 0.5 + t * 1.6;
      x.beginPath();
      x.moveTo(px, y);
      x.lineTo(px + (rnd() - 0.5) * (2 + t * 5), y - (3 + t * 30));
      x.stroke();
    }
    x.globalAlpha = 1;
    g = x.createLinearGradient(0, H, 0, H + 120);
    g.addColorStop(0, "rgba(255,225,160,.35)");
    g.addColorStop(1, "rgba(255,225,160,0)");
    x.fillStyle = g;
    x.fillRect(0, H, W, 120);
    if (!pathless) {
    g = x.createLinearGradient(0, H, 0, W);
    g.addColorStop(0, "#d9b27a");
    g.addColorStop(1, "#5a3d22");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(312, H);
    x.quadraticCurveTo(300, 430, 160, W);
    x.lineTo(420, W);
    x.quadraticCurveTo(342, 440, 322, H);
    x.closePath();
    x.fill();
    x.strokeStyle = "rgba(60,38,20,.35)";
    x.lineWidth = 1.2;
    x.beginPath();
    x.moveTo(314, H + 2);
    x.quadraticCurveTo(310, 440, 235, W);
    x.stroke();
    x.beginPath();
    x.moveTo(320, H + 2);
    x.quadraticCurveTo(334, 440, 340, W);
    x.stroke();
    for (let i = 0; i < 400; i++) {
      const t = Math.pow(rnd(), 1.4), y = H + 8 + t * (W - H);
      const left = 312 + (160 - 312) * Math.pow(t, 1.1), right = 322 + (420 - 322) * Math.pow(t, 1.1);
      const px = rnd() < 0.5 ? left - rnd() * 12 * (0.3 + t) : right + rnd() * 12 * (0.3 + t);
      x.strokeStyle = pal[(rnd() * pal.length) | 0];
      x.lineWidth = 0.7 + t * 1.8;
      x.beginPath();
      x.moveTo(px, y);
      x.lineTo(px + (rnd() - 0.5) * 6, y - (5 + t * 34));
      x.stroke();
    }
    }
    if (withFigures) {
      const figure = (fx, fy, sc, staff) => {
        x.fillStyle = "#1a1316";
        x.save();
        x.translate(fx, fy);
        x.scale(sc, sc);
        x.beginPath();
        x.arc(0, -40, 4.6, 0, 7);
        x.fill();
        x.beginPath();
        x.moveTo(-5, -35);
        x.quadraticCurveTo(-10, -10, -9, 2);
        x.lineTo(9, 2);
        x.quadraticCurveTo(10, -10, 5, -35);
        x.closePath();
        x.fill();
        x.fillRect(-4.5, 2, 3, 8);
        x.fillRect(1.5, 2, 3, 8);
        if (staff) {
          x.strokeStyle = "#1a1316";
          x.lineWidth = 1.6;
          x.beginPath();
          x.moveTo(11, -30);
          x.lineTo(13, 10);
          x.stroke();
        }
        x.restore();
      };
      figure(305, 411, 0.86, false);
      figure(331, 408, 0.72, true);
    }
    const stalk = (bx, by, h, bend) => {
      x.strokeStyle = "#1f160c";
      x.lineWidth = 2.2;
      x.beginPath();
      x.moveTo(bx, by);
      x.quadraticCurveTo(bx + bend * 0.3, by - h * 0.6, bx + bend, by - h);
      x.stroke();
      for (let k = 0; k < 9; k++) {
        const t = 0.62 + k * 0.04, px = bx + bend * Math.pow(t, 1.8), py = by - h * t;
        x.fillStyle = "#2a1d0e";
        x.beginPath();
        x.ellipse(px + (k % 2 ? 4 : -4), py, 2.4, 5.5, k % 2 ? 0.7 : -0.7, 0, 7);
        x.fill();
      }
    };
    for (let i = 0; i < 9; i++) stalk(-6 + i * 16 + rnd() * 8, W + 10, 170 + rnd() * 130, 18 + rnd() * 26);
    for (let i = 0; i < 9; i++) stalk(W + 6 - i * 16 - rnd() * 8, W + 10, 170 + rnd() * 130, -(18 + rnd() * 26));
  },

  sea(x, rnd) {
    const H = 300;
    sky(x, H, [[0, "#1f2a44"], [0.5, "#6d6a8c"], [0.8, "#e7a98a"], [1, "#f8d9a8"]]);
    clouds(x, rnd, 8, 50, 220, "rgba(255,190,160,.15)");
    x.save();
    x.beginPath();
    x.rect(0, 0, W, H);
    x.clip();
    glow(x, 315, H, 250, "rgba(255,238,200,.95)");
    x.fillStyle = "#fff3d0";
    x.beginPath();
    x.arc(315, H + 6, 28, 0, 7);
    x.fill();
    x.restore();
    const g = x.createLinearGradient(0, H, 0, W);
    g.addColorStop(0, "#5d7688");
    g.addColorStop(0.35, "#2b4256");
    g.addColorStop(1, "#0d1822");
    x.fillStyle = g;
    x.fillRect(0, H, W, W - H);
    for (let r = 0; r < 190; r++) {
      const t = r / 190, y = H + 1 + t * (W - H), half = 12 + t * 120;
      for (let k = 0; k < 5; k++) {
        const len = (6 + rnd() * 26) * (0.5 + t), px = 315 + (rnd() * 2 - 1) * half;
        x.fillStyle = `rgba(255,226,170,${0.5 * (1 - t) * (0.4 + rnd() * 0.6)})`;
        x.fillRect(px - len / 2, y, len, 0.8 + t * 1.6);
      }
    }
    for (let i = 0; i < 1400; i++) {
      const t = Math.pow(rnd(), 1.5), y = H + 4 + t * (W - H), len = 4 + t * 44, px = rnd() * W;
      x.strokeStyle = rnd() < 0.6 ? `rgba(255,255,255,${0.04 + rnd() * 0.1})` : `rgba(0,0,0,${0.12 + rnd() * 0.15})`;
      x.lineWidth = 0.5 + t * 1.1;
      x.beginPath();
      x.moveTo(px, y);
      x.lineTo(px + len, y + (rnd() - 0.5) * 1.2);
      x.stroke();
    }
  },

  night(x, rnd) {
    const H = 385;
    sky(x, H, [[0, "#060919"], [0.6, "#171c42"], [1, "#4c3a60"]]);
    x.save();
    x.translate(330, 190);
    x.rotate(-0.5);
    const band = x.createLinearGradient(0, -90, 0, 90);
    band.addColorStop(0, "rgba(190,180,255,0)");
    band.addColorStop(0.5, "rgba(200,190,255,.13)");
    band.addColorStop(1, "rgba(190,180,255,0)");
    x.fillStyle = band;
    x.fillRect(-520, -90, 1040, 180);
    x.restore();
    stars(x, rnd, 700, H - 40);
    stars(x, rnd, 400, 260, 0.8);
    glow(x, 315, H + 10, 300, "rgba(190,120,150,.35)", "rgba(190,120,150,0)");
    ridge(x, rnd, { base: H + 6, amp: 26, color: "#10142b" });
    ridge(x, rnd, { base: H + 34, amp: 22, color: "#080a18", freq: 0.017 });
    x.fillStyle = "#05060f";
    x.fillRect(0, H + 60, W, W);
  },

  mountains(x, rnd) {
    const H = 340;
    sky(x, H, [[0, "#2a2a4a"], [0.55, "#b87a7c"], [0.85, "#f4c58a"], [1, "#fde3b0"]]);
    clouds(x, rnd, 7, 70, 230, "rgba(255,210,170,.16)");
    glow(x, 400, H - 40, 250, "rgba(255,238,196,.95)");
    x.fillStyle = "#fff1cc";
    x.beginPath();
    x.arc(400, H - 40, 32, 0, 7);
    x.fill();
    const layers = [
      { base: 305, amp: 100, color: "#9c7b8c", freq: 0.008 },
      { base: 345, amp: 95, color: "#76597a", freq: 0.011 },
      { base: 395, amp: 90, color: "#4d3e5c", freq: 0.013 },
      { base: 450, amp: 80, color: "#2b2338", freq: 0.016 },
      { base: 520, amp: 50, color: "#15101a", freq: 0.02 },
    ];
    for (const l of layers) {
      ridge(x, rnd, { ...l, peaky: true });
      const m = x.createLinearGradient(0, l.base - 20, 0, l.base + 50);
      m.addColorStop(0, "rgba(253,227,176,0)");
      m.addColorStop(0.5, "rgba(253,227,176,.2)");
      m.addColorStop(1, "rgba(253,227,176,0)");
      x.fillStyle = m;
      x.fillRect(0, l.base - 20, W, 70);
    }
  },

  desert(x, rnd) {
    const H = 330;
    sky(x, H, [[0, "#3a2f4f"], [0.45, "#c9697a"], [0.8, "#f2a86b"], [1, "#fbd89a"]]);
    clouds(x, rnd, 6, 60, 220, "rgba(255,190,150,.14)");
    glow(x, 205, H - 30, 270, "rgba(255,236,190,.95)");
    x.fillStyle = "#fff0c8";
    x.beginPath();
    x.arc(205, H - 30, 46, 0, 7);
    x.fill();
    x.strokeStyle = "rgba(40,25,35,.7)";
    x.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const bx = 380 + rnd() * 120, by = 110 + rnd() * 70;
      x.beginPath();
      x.moveTo(bx - 7, by - 3);
      x.quadraticCurveTo(bx - 3, by - 6, bx, by);
      x.quadraticCurveTo(bx + 3, by - 6, bx + 7, by - 3);
      x.stroke();
    }
    const dunes = [
      { base: 350, amp: 36, color: "#cf9058", freq: 0.007 },
      { base: 400, amp: 42, color: "#a86a3f", freq: 0.009 },
      { base: 455, amp: 46, color: "#7d4a2c", freq: 0.011 },
      { base: 520, amp: 40, color: "#4a2c1b", freq: 0.013 },
    ];
    for (const d of dunes) {
      ridge(x, rnd, d);
      for (let i = 0; i < 160; i++) {
        const px = rnd() * W, py = d.base + rnd() * 70;
        x.strokeStyle = `rgba(255,220,170,${0.04 + rnd() * 0.08})`;
        x.lineWidth = 0.8;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + 14 + rnd() * 14, py + 3);
        x.stroke();
      }
    }
  },


  dawn(x, rnd, seed) {
    const H = 338, P = DAWNS[seed % DAWNS.length];
    sky(x, H, P.sky);
    clouds(x, rnd, 9, 60, 250, "rgba(255,200,150,.16)");
    glow(x, 318, H - 10, 280, "rgba(255,236,190,.95)");
    x.fillStyle = P.sun;
    x.beginPath();
    x.arc(318 + (rnd() - 0.5) * 60, H - 10, 28, 0, 7);
    x.fill();
    ridge(x, rnd, { base: H - 6, amp: 18, color: P.r1 });
    ridge(x, rnd, { base: H - 1, amp: 11, color: P.r2, freq: 0.016 });
    const g = x.createLinearGradient(0, H, 0, W);
    g.addColorStop(0, "#8a7a4a");
    g.addColorStop(0.5, "#4a3d22");
    g.addColorStop(1, "#1c160c");
    x.fillStyle = g;
    x.fillRect(0, H, W, W - H);
    for (let i = 0; i < 3000; i++) {
      const t = Math.pow(rnd(), 1.5), y = H + 3 + t * (W - H), px = rnd() * W;
      x.strokeStyle = `rgba(214,180,100,${0.12 + rnd() * 0.25})`;
      x.lineWidth = 0.5 + t;
      x.beginPath();
      x.moveTo(px, y);
      x.lineTo(px + (rnd() - 0.5) * 3, y - (2 + t * 14));
      x.stroke();
    }
  },

  dusk(x, rnd, seed) {
    const H = 350, P = DUSKS[seed % DUSKS.length];
    sky(x, H, P.sky);
    clouds(x, rnd, 8, 70, 260, "rgba(255,170,150,.15)");
    stars(x, rnd, 90, 150, 0.6);
    glow(x, 200 + rnd() * 240, H, 260, "rgba(255,200,140,.7)");
    ridge(x, rnd, { base: H + 4, amp: 22, color: P.r1, freq: 0.009 });
    ridge(x, rnd, { base: H + 20, amp: 16, color: P.r2, freq: 0.014 });
    const g = x.createLinearGradient(0, H + 10, 0, W);
    g.addColorStop(0, "#2a1f32");
    g.addColorStop(1, "#0d0912");
    x.fillStyle = g;
    x.fillRect(0, H + 24, W, W);
  },

  field(x, rnd) {
    SCENES.road(x, rnd, false, true);
  },

  storm(x, rnd) {
    const H = 335;
    sky(x, H, [[0, "#10131c"], [0.5, "#2a3245"], [0.85, "#59627a"], [1, "#9a9aa2"]]);
    for (let i = 0; i < 16; i++) {
      const cx = rnd() * W, cy = 40 + rnd() * 230, w = 150 + rnd() * 200;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, w);
      g.addColorStop(0, `rgba(12,14,22,${0.35 + rnd() * 0.3})`);
      g.addColorStop(1, "rgba(12,14,22,0)");
      x.save();
      x.translate(cx, cy);
      x.scale(1, 0.32);
      x.translate(-cx, -cy);
      x.fillStyle = g;
      x.fillRect(cx - w, cy - w, w * 2, w * 2);
      x.restore();
    }
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + (i - 3) * 0.13;
      poly2(x, "rgba(255,226,170,.10)", 315, 70, 315 + Math.cos(a - 0.04) * 420, 70 + Math.sin(a - 0.04) * 420, 315 + Math.cos(a + 0.04) * 420, 70 + Math.sin(a + 0.04) * 420);
    }
    glow(x, 315, H - 6, 230, "rgba(255,226,170,.7)");
    const g = x.createLinearGradient(0, H, 0, W);
    g.addColorStop(0, "#5a6678");
    g.addColorStop(0.3, "#222c3b");
    g.addColorStop(1, "#080b12");
    x.fillStyle = g;
    x.fillRect(0, H, W, W - H);
    for (let i = 0; i < 1500; i++) {
      const t = Math.pow(rnd(), 1.4), y = H + 3 + t * (W - H), len = 4 + t * 36, px = rnd() * W;
      x.strokeStyle = rnd() < 0.5 ? `rgba(255,255,255,${0.05 + rnd() * 0.18})` : `rgba(0,0,0,${0.15 + rnd() * 0.2})`;
      x.lineWidth = 0.6 + t * 1.2;
      x.beginPath();
      x.moveTo(px, y);
      x.lineTo(px + len, y + (rnd() - 0.5) * 2);
      x.stroke();
    }
  },

  light(x, rnd) {
    sky(x, W, [[0, "#06060d"], [1, "#0c0a14"]]);
    const cx = 315, cy = 215;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + rnd() * 0.1, wd = 0.02 + rnd() * 0.035;
      poly2(x, `rgba(255,226,160,${0.05 + rnd() * 0.08})`, cx, cy, cx + Math.cos(a - wd) * 800, cy + Math.sin(a - wd) * 800, cx + Math.cos(a + wd) * 800, cy + Math.sin(a + wd) * 800);
    }
    glow(x, cx, cy, 340, "rgba(255,244,214,.95)", "rgba(255,200,120,0)");
    glow(x, cx, cy, 120, "rgba(255,255,245,1)", "rgba(255,240,200,0)");
    stars(x, rnd, 120, 140, 0.5);
    const g = x.createLinearGradient(0, 380, 0, W);
    g.addColorStop(0, "rgba(12,10,20,0)");
    g.addColorStop(0.2, "#0c0a14");
    g.addColorStop(1, "#05040a");
    x.fillStyle = g;
    x.fillRect(0, 380, W, W - 380);
  },

  deep(x, rnd) {
    sky(x, W, [[0, "#5aa3b4"], [0.3, "#1e5470"], [0.65, "#0e2a44"], [1, "#04080f"]]);
    for (let i = 0; i < 12; i++) {
      const bx = 60 + rnd() * 510, wd = 14 + rnd() * 26;
      poly2(x, `rgba(220,250,255,${0.04 + rnd() * 0.06})`, bx, -10, bx + wd, -10, bx + 90 + (rnd() - 0.5) * 120, 520, bx - 60 + (rnd() - 0.5) * 120, 520);
    }
    for (let i = 0; i < 90; i++) {
      const t = rnd(), px = rnd() * W, py = 40 + t * 520, r = 0.8 + rnd() * 3.2;
      x.strokeStyle = `rgba(200,240,255,${0.15 + rnd() * 0.35})`;
      x.lineWidth = 0.8;
      x.beginPath();
      x.arc(px, py, r, 0, 7);
      x.stroke();
    }
    glow(x, 315, 540, 240, "rgba(255,215,150,.45)");
    x.strokeStyle = "rgba(255,230,170,.8)";
    x.lineWidth = 2;
    x.setLineDash([3, 7]);
    x.beginPath();
    x.moveTo(315, 20);
    x.lineTo(315, 520);
    x.stroke();
    x.setLineDash([]);
    glow(x, 315, 20, 90, "rgba(255,255,255,.7)");
  },
};

function poly2(x, col, ...p) {
  x.fillStyle = col;
  x.beginPath();
  x.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]);
  x.closePath();
  x.fill();
}

// Where a motif stands (gy), and how bright a halo to put behind it so dark shapes read.
const BG_META = {
  road: { gy: 411, halo: "rgba(255,226,170,.30)", ink: "#140e13" },
  dawn: { gy: 398, halo: "rgba(255,226,170,.30)", ink: "#140e13" },
  dusk: { gy: 402, halo: "rgba(255,190,140,.38)", ink: "#140e13" },
  field: { gy: 408, halo: "rgba(255,226,170,.30)", ink: "#140e13" },
  desert: { gy: 408, halo: "rgba(255,226,170,.28)", ink: "#140e13" },
  mountains: { gy: 424, halo: "rgba(255,226,170,.30)", ink: "#140e13" },
  sea: { gy: 348, halo: "rgba(255,226,170,.25)", ink: "#140e13" },
  storm: { gy: 352, halo: "rgba(255,226,170,.38)", ink: "#10131c" },
  night: { gy: 398, halo: "rgba(190,190,255,.34)", ink: "#0a0912" },
  light: { gy: 402, halo: "rgba(255,236,190,.0)", ink: "#0a0912" },
  deep: { gy: 400, halo: "rgba(255,226,170,.0)", ink: "#0a0912" },
};
export const BACKGROUNDS = Object.keys(BG_META);

// Motifs that float in the sky are centred at this height instead of standing on the ground.
const SKY_Y = { birds: 200, globe: 240, tear: 230, fingerprint: 235, eye: 235, mask: 235, rings: 240, thorns: 240, "sun-arc": 215, honeycomb: 255, crown: 225, compass: 240, dove: 235, constellation: 215 };
const SCALE = { pillar: 1.05, ladder: 1.15, lighthouse: 1.25, "moon-lake": 1, rainbow: 1.25, "sun-arc": 1.1, bridge: 1.25, chest: 1.3, farewell: 1.3, signpost: 1.3, thorns: 1.15, honeycomb: 1.15, globe: 1.15, lamp: 1.45, "star-path": 1.2, threads: 1.1, birds: 1.1, "shield-sword": 1.25, feathers: 1.2, tower: 1.3 };

export function drawPicture(ctx, { bg, motif, v }, seed = 1) {
  const rnd = makeRng(seed);
  if (!SCENES[bg]) throw new Error(`Unknown share-card background "${bg}"`);
  SCENES[bg](ctx, rnd, seed);
  if (!motif) return;
  const fn = MOTIFS[motif];
  if (!fn) throw new Error(`Unknown share-card motif "${motif}"`);
  const meta = BG_META[bg];
  setInk(meta.ink);
  const sky = SKY_Y[motif];
  const s = (SCALE[motif] ?? (sky ? 1.2 : 1.35)) * 1.18;
  ctx.save();
  ctx.translate(315, sky ?? meta.gy);
  if (meta.halo.slice(-3) !== ".0)") glow(ctx, 0, sky ? 0 : -60 * s, 170 * s, meta.halo);
  ctx.scale(s, s);
  fn(ctx, { rnd: makeRng(seed * 7 + 3), v, s });
  ctx.restore();
  setInk("#140e13");
}
