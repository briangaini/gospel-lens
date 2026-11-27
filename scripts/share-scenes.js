// The pictures behind the share cards: eight little landscapes drawn with canvas
// code (no photos, so nothing to license). Each draws the whole 630 x 630 square;
// build-share-cards.js darkens the top and bottom and sets the text over it.
// Every post draws its own copy (clouds, stars, wheat, ripples shift with the post's
// id), so two posts with the same scene are never pixel-identical.

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
  for (let px = 0; px <= W; px += 4) {
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

const SCENES = {
  road(x, rnd, withFigures) {
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
    for (let i = 0; i < 6000; i++) {
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
    glow(x, 318, 150, 90, "rgba(255,240,200,.55)");
    x.fillStyle = "rgba(255,246,220,.95)";
    x.beginPath();
    x.moveTo(318, 108);
    x.quadraticCurveTo(321, 147, 360, 150);
    x.quadraticCurveTo(321, 153, 318, 192);
    x.quadraticCurveTo(315, 153, 276, 150);
    x.quadraticCurveTo(315, 147, 318, 108);
    x.fill();
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

  hill(x, rnd) {
    const H = 360;
    sky(x, H, [[0, "#12132b"], [0.5, "#5b3b57"], [0.82, "#e08f5d"], [1, "#fbd28f"]]);
    stars(x, rnd, 160, 200, 0.7);
    glow(x, 315, H - 40, 300, "rgba(255,226,170,.9)");
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (i - 7.5) * 0.17 + (rnd() - 0.5) * 0.05, wd = 0.035 + rnd() * 0.04;
      x.fillStyle = `rgba(255,224,160,${0.05 + rnd() * 0.05})`;
      x.beginPath();
      x.moveTo(315, H - 30);
      x.lineTo(315 + Math.cos(a - wd) * 700, H - 30 + Math.sin(a - wd) * 700);
      x.lineTo(315 + Math.cos(a + wd) * 700, H - 30 + Math.sin(a + wd) * 700);
      x.closePath();
      x.fill();
    }
    x.fillStyle = "#fff0c4";
    x.beginPath();
    x.arc(315, H - 22, 20, 0, 7);
    x.fill();
    ridge(x, rnd, { base: H + 30, amp: 16, color: "#4a3040", freq: 0.012 });
    x.fillStyle = "#150f15";
    x.beginPath();
    x.moveTo(-10, W);
    x.lineTo(-10, H + 70);
    x.quadraticCurveTo(160, H + 14, 315, H - 6);
    x.quadraticCurveTo(470, H + 14, 640, H + 70);
    x.lineTo(640, W);
    x.closePath();
    x.fill();
    x.fillStyle = "#0e0a0e";
    x.fillRect(312.5, H - 80, 5, 76);
    x.fillRect(298, H - 62, 34, 5);
  },

  window(x, rnd) {
    const H = 412;
    sky(x, H, [[0, "#0d142b"], [0.6, "#2b3558"], [1, "#6c5b7c"]]);
    stars(x, rnd, 260, 230, 0.9);
    const pine = (px, base, h, w) => {
      x.fillStyle = "#0b0a16";
      for (let t = 0; t < 4; t++) {
        const top = base - h + t * h * 0.22, bw = w * (0.45 + t * 0.2);
        x.beginPath();
        x.moveTo(px, top);
        x.lineTo(px - bw, top + h * 0.38);
        x.lineTo(px + bw, top + h * 0.38);
        x.closePath();
        x.fill();
      }
      x.fillRect(px - 2, base - 6, 4, 10);
    };
    [[60, 150, 46], [118, 105, 34], [520, 125, 40], [575, 170, 50], [470, 90, 28]].forEach(([px, h, w]) => pine(px, H + 6, h, w));
    glow(x, 315, 365, 230, "rgba(255,196,110,.4)");
    x.fillStyle = "#171428";
    x.fillRect(225, 300, 180, 118);
    x.fillStyle = "#100d1e";
    x.beginPath();
    x.moveTo(205, 302);
    x.lineTo(315, 224);
    x.lineTo(425, 302);
    x.closePath();
    x.fill();
    x.fillRect(370, 235, 20, 46);
    const g = x.createLinearGradient(0, 330, 0, 380);
    g.addColorStop(0, "#ffe19a");
    g.addColorStop(1, "#f0a24f");
    x.fillStyle = g;
    x.fillRect(290, 328, 50, 50);
    x.fillStyle = "#171428";
    x.fillRect(313, 328, 4, 50);
    x.fillRect(290, 351, 50, 4);
    x.fillStyle = "rgba(255,206,130,.5)";
    x.fillRect(362, 372, 24, 46);
    const ground = x.createLinearGradient(0, H, 0, W);
    ground.addColorStop(0, "#1c1a2d");
    ground.addColorStop(1, "#06060c");
    x.fillStyle = ground;
    x.fillRect(0, H, W, W - H);
    x.save();
    x.translate(315, H + 14);
    x.scale(1, 0.22);
    glow(x, 0, 0, 170, "rgba(255,196,110,.45)");
    x.restore();
  },
};

export function drawScene(ctx, name, seed = 1) {
  const rnd = makeRng(seed);
  if (name === "walkers") SCENES.road(ctx, rnd, true);
  else if (name === "road") SCENES.road(ctx, rnd, false);
  else SCENES[name](ctx, rnd);
}
