/* art_skullreef.js — Skullreef Isles art for Realm of Loner (expansion "The Drowned Crown", level 60, Krugar zone: a
 * tropical reef archipelago that rose from the sea after ten thousand years; the Kessari and Reclaimed camp at
 * Bloodtide Landing, Coralbone Beach, the Sunken Pier, the Screaming Grotto, the drowned troll village of Spirit's Rest
 * and Shal'zua's Steps; reef makrura, the drowned Wavebreaker trolls and their hexers, drowned sailors, grotto sirens,
 * the skeletal Captain Saltbones and the sea giant Krag'vesh the Tidebeast).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Skullreef keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the skeleton rig and the house-style scene pieces are shared copies of art_plaguelands.js;
 * palms, ferns, flags, the Krugar mark, the palisade, nests, feathers, spears and the carved troll face are copies of
 * art_stranglethorn.js; the cutlass is a copy of art_zulfarrak.js. The sea, storm sky, beach, black rock, coral,
 * barnacles, kelp, giant bones, stilt huts, the longship, piers, wrecks, anchors, serpent idols, the temple steps and
 * every mob are new here.
 * THE WAVEBREAKER LOOK (shared with the Temple of Shal'zua pack, keep it consistent): pale sea-teal skin #a4cdc2
 * mottled #6e9c96, clusters of off-white barnacles #dcd6c2, dark olive kelp dreads #56722e / #324a1c hanging down
 * wet, glowing teal eyes #5cf4e2, little pink coral growths #f27a8c on the crown, torn kelp and dark sea-teal cloth
 * with shell beads, coral-headed weapons. Drowned things raised by the sea (sailors, Saltbones) share the teal eyes.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix sr<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
  var OL = '#1a1009';
  var SEQ = 0;
  var PI = Math.PI;

  // ---------- colour + number helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var v = parseInt(h, 16);
    if (isNaN(v)) v = 0x808080;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function hex(a) { return '#' + a.map(function (v) { var s = Math.round(clamp(v, 0, 255)).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lt(c, t) { return mix(c, '#ffffff', t); }
  function dk(c, t) { return mix(c, '#000000', t); }
  function n(v) { v = +v; return isFinite(v) ? Math.round(v * 10) / 10 : 0; }
  function pt(p) { return n(p[0]) + ',' + n(p[1]); }
  function pd(a, close) { return 'M' + a.map(pt).join('L') + (close ? 'Z' : ''); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids, defs) ----------
  function Ctx() { this.p = 'sr' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  Ctx.prototype.cel = function (c) {
    var key = 'c' + c; if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + lt(c, 0.3) + '"/><stop offset="0.4" stop-color="' + c + '"/><stop offset="0.72" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.38) + '"/></linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.lg = function (stops, x1, y1, x2, y2) {
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stopsS(stops) + '</linearGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.rg = function (stops) {
    var id = this.id();
    this.defs.push('<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.5">' + stopsS(stops) + '</radialGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.clip = function (d) { var id = this.id(); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return id; };
  Ctx.prototype.svg = function (w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + body + '</svg>';
  };
  function stopsS(st) {
    return st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function glow(c, col, a) { return c.rg([[0, col, a == null ? 0.6 : a], [0.35, col, (a == null ? 0.6 : a) * 0.4], [1, col, 0]]); }

  // ---------- primitives ----------
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
  function at(s, x, y) { return 'matrix(' + n(s * 1000) / 1000 + ',0,0,' + n(s * 1000) / 1000 + ',' + n(x - x * s) + ',' + n(y - y * s) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function body(c, d, col, shade, sw) {
    var s = P(d, c.cel(col), sw == null ? 2.5 : sw);
    if (shade) s += '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>';
    return s;
  }
  function shadow(c, cx, rx) { return E(cx, 122.5, rx, 8, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])); }
  function flame(c, x, y, s, outer, inner) {
    var o = outer || '#ff7a1a', i = inner || '#ffd84a';
    return P('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y]) + ' ' + pt([x - 9 * s, y - 9 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 1 * s, y - 9 * s]) + ' ' + pt([x, y - 20 * s]) +
      'C' + pt([x + 4 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 14 * s]) + ' ' + pt([x + 5 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 9 * s]) + ' ' + pt([x + 8 * s, y]) + ' ' + pt([x, y]) + 'Z', o, 1.6 * Math.max(0.7, s)) +
      F('M' + pt([x, y - 1 * s]) + 'C' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 1 * s, y - 11 * s]) + 'C' + pt([x, y - 7 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 10 * s]) + 'C' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 4 * s, y - 1 * s]) + ' ' + pt([x, y - 1 * s]) + 'Z', i);
  }
  function orb(c, x, y, r, col) { return C(x, y, r * 2.6, glow(c, col, 0.75)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.5, lt(col, 0.4)], [1, col]]), 1.6); }
  function gEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // shaggy blob outline: points alternate between an outer and an inner ellipse, joined by soft curves
  function shag(cx, cy, rx, ry, k, jag, seed, a0) {
    var r = rng(seed || 7), d = '', pts = [];
    a0 = a0 || 0;
    for (var i = 0; i < k * 2; i++) {
      var a = a0 + PI * 2 * i / (k * 2), f = i % 2 ? 1 - jag * (0.7 + r() * 0.5) : 1 + jag * r() * 0.3;
      pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
    }
    d = 'M' + pt(pts[0]);
    for (var j = 1; j <= pts.length; j++) { var p = pts[j % pts.length], q = pts[j - 1]; d += 'Q' + pt([(p[0] + q[0]) / 2 + (r() - 0.5) * 2, (p[1] + q[1]) / 2 + (r() - 0.5) * 2]) + ' ' + pt(p); }
    return d + 'Z';
  }
  // point helper along a direction: u along ang, v perpendicular
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function haft(c, p, len, ang, col, w, back) { var q = dirQ(p, ang), d = 'M' + pt(q(-(back == null ? 10 : back), 0)) + 'L' + pt(q(len, 0)); return limb(d, col || '#6a4428', w || 3.4) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.55]) + 'Q' + pt([x - w / 2, top + w * 0.05]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top + w * 0.05]) + ' ' + pt([x + w / 2, top + w * 0.55]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }

  // ---- ribbons (shared copy of art_ashenvale.js) ----
  function lerp2(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  function spline(pts, k) {
    var out = [], i, j; k = k || 6;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      for (j = 0; j < k; j++) {
        var t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (a) { return 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3); }));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function taper(pts, w0, w1, k) {
    var s = spline(pts, k), A = [], B = [], m = s.length;
    for (var i = 0; i < m; i++) {
      var a = s[Math.max(0, i - 1)], b = s[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, t = i / (m - 1), w = (w0 + (w1 - w0) * t) / 2;
      A.push([s[i][0] - dy / d * w, s[i][1] + dx / d * w]); B.push([s[i][0] + dy / d * w, s[i][1] - dx / d * w]);
    }
    return { d: pd(A.concat(B.slice().reverse()), true), a: A, b: B, s: s };
  }
  function bands(T, every, from) { var d = ''; for (var i = from || 2; i < T.s.length - 1; i += every) d += 'M' + pt(T.a[i]) + 'L' + pt(T.b[i]); return d; }
  function along(T, f) { var p = []; for (var i = 0; i < T.s.length; i++) p.push(lerp2(T.a[i], T.b[i], f)); return 'M' + p.map(pt).join('L'); }
  function ribbonBand(T, f0, f1) { var P0 = [], P1 = []; for (var i = 0; i < T.s.length; i++) { P0.push(lerp2(T.a[i], T.b[i], f0)); P1.push(lerp2(T.a[i], T.b[i], f1)); } return pd(P0.concat(P1.reverse()), true); }

  // ---- scene house style (shared copies of art_plaguelands.js) ----
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
  function cloud(x, y, s, op, col) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, col || '#f4f6f8', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', dk(col || '#f4f6f8', 0.14), 0.9);
  }
  function overcast(c, seed, y, col, cnt, s) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) o += cloud(-20 + 440 * (i + r() * 0.6) / cnt, y + (r() - 0.5) * 10, (s || 1) * (0.8 + r() * 0.6), 0.9, col);
    return o;
  }
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  function grass(seed, y0, y1, col, cnt, s0, s1, w, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), s = s0 + (s1 - s0) * t, x = x0 + r() * (x1 - x0);
      d += 'M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-7 * s) + 'M' + pt([x, y]) + 'q' + n(0.5 * s) + ',' + n(-5 * s) + ' ' + n(1 * s) + ',' + n(-9 * s) + 'M' + pt([x, y]) + 'q' + n(2 * s) + ',' + n(-3 * s) + ' ' + n(5 * s) + ',' + n(-6 * s);
    }
    return L(d, col, w || 1.2);
  }
  function tuft(c, x, y, s, col) {
    col = col || '#6a8a3a';
    var tips = [[-13, -8], [-9, -17], [-4, -12], [0, -23], [4, -13], [9, -18], [13, -7]], d = 'M' + pt([x - 11 * s, y]), inner = '';
    tips.forEach(function (t, i) {
      d += 'Q' + pt([x + (t[0] - 1) * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * s, y + t[1] * s]);
      if (i < tips.length - 1) d += 'Q' + pt([x + (t[0] + 1.5) * s, y + t[1] * 0.45 * s]) + ' ' + pt([x + (t[0] + tips[i + 1][0]) * 0.5 * s, y - 5 * s]);
      if (i % 2) inner += 'M' + pt([x + t[0] * 0.5 * s, y - 1 * s]) + 'Q' + pt([x + t[0] * 0.7 * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * 0.92 * s, y + t[1] * 0.85 * s]);
    });
    d += 'L' + pt([x + 11 * s, y]) + 'Z';
    return E(x, y + 1, 13 * s, 2.6 * s, '#000', 0, 0.16) + body(c, d, col, L(inner, dk(col, 0.3), 1 * s) + F('M' + pt([x + 2 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.22), 0.8), 1.3 * s);
  }
  function tufts(c, list, col) { return list.map(function (t) { return tuft(c, t[0], t[1], t[2], col); }).join(''); }
  function pebbles(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), s = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < (cnt || 14); i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function deadTree(c, x, y, s, col) {
    col = col || '#3a3228';
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]) + 'M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x - 3 * s, y - 60 * s]), col, 1.6 * s);
    return o + L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]), lt(col, 0.18), 1.4 * s, 0.7);
  }
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
  function crenels(c, x0, x1, y, col, mw) {
    mw = mw || 6; var o = '';
    for (var x = x0; x < x1 - 1; x += mw * 2) o += R(x, y - mw, mw, mw + 1, c.cel(col), 1.3);
    return o;
  }
  function stoneFace(c, x, y, w, h, col, js, top) {
    // top: optional list of [dx, dy] points (relative to x, y-h) replacing the flat top edge, for broken walls
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
  }
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
  function crows(seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + r() * 0.6; d += 'M' + pt([x - 5 * s, y - 2 * s]) + 'Q' + pt([x - 2 * s, y - 3 * s]) + ' ' + pt([x, y]) + 'Q' + pt([x + 2 * s, y - 3 * s]) + ' ' + pt([x + 5 * s, y - 2 * s]); }
    return L(d, '#1e1c20', 1.3);
  }
  function poleBanner(c, x, y, h, s, col, trim, em) {
    var top = y - h, w = 14 * s, bh = 30 * s;
    var o = E(x, y + 1, 5 * s, 1.4 * s, '#000', 0, 0.3) + limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), '#5a3e24', 2 * s) + C(x, top - 5 * s, 2.2 * s, c.cel(GOLD), 1 * s);
    o += limb('M' + pt([x - 2 * s, top]) + 'L' + pt([x + w + 3 * s, top]), '#5a3e24', 1.4 * s);
    var bx = x + 1.5 * s, d = pd([[bx, top], [bx + w, top], [bx + w, top + bh], [bx + w / 2, top + bh - 6 * s], [bx, top + bh]], true);
    o += body(c, d, col, F(pd([[bx + w * 0.62, top - 2], [bx + w + 2, top - 2], [bx + w + 2, top + bh + 2], [bx + w * 0.62, top + bh]], true), dk(col, 0.3), 0.6) +
      L(pd([[bx + 2 * s, top + 1], [bx + 2 * s, top + bh - 2.6 * s], [bx + w / 2, top + bh - 8 * s], [bx + w - 2 * s, top + bh - 2.6 * s], [bx + w - 2 * s, top + 1]]), trim, 1.2 * s), 1.4 * s);
    return o + (em ? em(c, bx + w / 2, top + bh * 0.42, s) : '');
  }
  function brazier(c, x, y, s, fo, fi) {
    var o = E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.3) + C(x, y - 20 * s, 30 * s, glow(c, fo || '#ff9a3a', 0.5));
    o += limb('M' + pt([x - 6 * s, y]) + 'L' + pt([x, y - 12 * s]) + 'L' + pt([x + 6 * s, y]) + 'M' + pt([x, y - 12 * s]) + 'L' + pt([x, y]), '#3a3434', 1.5 * s);
    o += flame(c, x, y - 15 * s, 0.8 * s, fo, fi);
    return o + P('M' + pt([x - 8 * s, y - 17 * s]) + 'L' + pt([x + 8 * s, y - 17 * s]) + 'L' + pt([x + 5 * s, y - 11 * s]) + 'L' + pt([x - 5 * s, y - 11 * s]) + 'Z', c.cel('#4a4444'), 1.3 * s) + L('M' + pt([x - 7 * s, y - 15 * s]) + 'L' + pt([x + 7 * s, y - 15 * s]), '#6a6464', 0.9 * s);
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 8 * s, 30 * s, glow(c, '#ffa040', 0.5)) + E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x + 8 * s, y - 5 * s]), '#5a3a22', 2.8 * s) + limb('M' + pt([x + 10 * s, y]) + 'L' + pt([x - 8 * s, y - 5 * s]), '#6a4428', 2.8 * s);
    o += flame(c, x, y - 2 * s, 0.9 * s);
    for (var i = 0; i < 5; i++) { var a = PI * (0.1 + 0.8 * i / 4); o += E(x + Math.cos(a) * 12 * s, y + Math.sin(a) * 2.6 * s, 3.4 * s, 2.3 * s, c.cel('#76746c'), 1 * s); }
    return o;
  }
  function crate(c, x, y, s, col) {
    col = col || '#8a6a40'; var w = 14 * s;
    return E(x, y + 1, w * 0.7, 2 * s, '#000', 0, 0.3) + P(pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - w], [x - w / 2, y - w]], true), c.cel(col), 1.4 * s) +
      L('M' + pt([x - w / 2, y - w]) + 'L' + pt([x + w / 2, y]) + 'M' + pt([x - w / 2 + 1.5 * s, y - w / 2]) + 'L' + pt([x + w / 2 - 1.5 * s, y - w / 2]), dk(col, 0.4), 1.2 * s);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#7a5434'; var w = 8 * s, h = 15 * s;
    return E(x, y + 1, w, 2 * s, '#000', 0, 0.3) + P('M' + pt([x - w, y]) + 'C' + pt([x - w - 2 * s, y - h * 0.5]) + ' ' + pt([x - w, y - h]) + ' ' + pt([x - w * 0.9, y - h]) + 'L' + pt([x + w * 0.9, y - h]) + 'C' + pt([x + w, y - h]) + ' ' + pt([x + w + 2 * s, y - h * 0.5]) + ' ' + pt([x + w, y]) + 'Z', c.cel(col), 1.4 * s) +
      L('M' + pt([x - w - 1 * s, y - h * 0.25]) + 'L' + pt([x + w + 1 * s, y - h * 0.25]) + 'M' + pt([x - w - 1 * s, y - h * 0.75]) + 'L' + pt([x + w + 1 * s, y - h * 0.75]), '#3a3434', 1.5 * s) + E(x, y - h, w * 0.9, 1.8 * s, dk(col, 0.2), 1 * s);
  }
  // ---- jungle-coast pieces (shared copies of art_stranglethorn.js) ----
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function spear(c, top, bot, len, col, shaft) {
    var d = 'M' + pt(top) + 'L' + pt(bot);
    var dx = top[0] - bot[0], dy = top[1] - bot[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
    var tip = [top[0] + ux * len, top[1] + uy * len];
    return limb(d, shaft || '#7a5a36', 3) + L(d, lt(shaft || '#7a5a36', 0.3), 1, 0.6) +
      P(pd([[top[0] + px * 4.5 - ux * 2, top[1] + py * 4.5 - uy * 2], [top[0] + px * 3 + ux * len * 0.55, top[1] + py * 3 + uy * len * 0.55], tip, [top[0] - px * 3 + ux * len * 0.55, top[1] - py * 3 + uy * len * 0.55], [top[0] - px * 4.5 - ux * 2, top[1] - py * 4.5 - uy * 2]], true), c.cel(col || '#b8b4a8'), 1.8) +
      L('M' + pt([top[0] + px * 3.5 - ux * 4, top[1] + py * 3.5 - uy * 4]) + 'L' + pt([top[0] - px * 3.5 - ux * 4, top[1] - py * 3.5 - uy * 4]), '#c8a060', 1.6);
  }
  function pool(c, x, y, rx, ry, col, rim) {
    col = col || '#3a4640'; rim = rim || MUDD;
    var rp = 'M' + pt([x - rx * 0.55, y - ry * 0.1]) + 'q' + n(rx * 0.25) + ',' + n(-ry * 0.3) + ' ' + n(rx * 0.5) + ',0' + 'M' + pt([x + rx * 0.05, y + ry * 0.35]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.25) + ' ' + n(rx * 0.4) + ',0';
    return E(x, y + ry * 0.14, rx + 4, ry + 2.6, rim, 0, 0.8) + E(x, y, rx, ry, c.lg([[0, dk(col, 0.35)], [1, lt(col, 0.15)]]), 1.4) + E(x - rx * 0.25, y - ry * 0.3, rx * 0.42, ry * 0.2, '#d8e0d8', 0, 0.22) + L(rp, lt(col, 0.45), 0.9, 0.7);
  }
  function nest(c, x, y, s, eggs) {
    var o = E(x, y + 2 * s, 24 * s, 5 * s, '#000', 0, 0.25), r = rng(Math.round(x * 5 + y)), tw = '';
    o += E(x, y - 2 * s, 21 * s, 8 * s, c.cel('#8a6a3a'), 1.6 * s) + E(x, y - 3.4 * s, 15 * s, 4.6 * s, '#3e2e1c');
    [[-7, -5], [2, -6], [9, -4]].slice(0, eggs || 3).forEach(function (e, i) {
      var ex = x + e[0] * s, ey = y + e[1] * s;
      o += E(ex, ey, 4.4 * s, 5.4 * s, c.cel(i % 2 ? '#d8d4b0' : '#e8e0c4'), 1.2 * s) + C(ex - 1.5 * s, ey - 1 * s, 0.9 * s, '#6a5a3a') + C(ex + 1.6 * s, ey + 1.5 * s, 0.8 * s, '#6a5a3a') + C(ex + 0.5 * s, ey - 3 * s, 0.6 * s, '#6a5a3a');
    });
    o += P('M' + pt([x - 21 * s, y - 2 * s]) + 'C' + pt([x - 18 * s, y + 6 * s]) + ' ' + pt([x + 18 * s, y + 6 * s]) + ' ' + pt([x + 21 * s, y - 2 * s]) + 'C' + pt([x + 14 * s, y + 1 * s]) + ' ' + pt([x - 14 * s, y + 1 * s]) + ' ' + pt([x - 21 * s, y - 2 * s]) + 'Z', c.cel('#9a7a44'), 1.4 * s);
    for (var i = 0; i < 12; i++) { var a = PI * (0.05 + 0.9 * r()), px = x - Math.cos(a) * 20 * s, py = y - 2 * s + Math.sin(a) * 5 * s; tw += 'M' + pt([px, py]) + 'l' + n((r() - 0.5) * 12 * s) + ',' + n((r() - 0.6) * 4 * s); }
    return o + L(tw, '#c8a468', 1 * s, 0.9);
  }
  function waves(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, 0.7);
  }
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [0, 1].map(function (a) { return u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a]; }); }
  // almond leaf path from (x, y): side 1 = right-down, -1 = left-down, 0 = straight down
  function leafD(x, y, side, len) {
    var a = side ? (side > 0 ? 0.5 : PI - 0.5) : PI / 2, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, px = -Math.sin(a) * len * 0.35, py = Math.cos(a) * len * 0.35;
    return 'M' + pt([x, y]) + 'Q' + pt([(x + ex) / 2 + px, (y + ey) / 2 + py]) + ' ' + pt([ex, ey]) + 'Q' + pt([(x + ex) / 2 - px, (y + ey) / 2 - py]) + ' ' + pt([x, y]) + 'Z';
  }
  function palm(c, x, y, s, lean, col, seed) {
    col = col || PALM; lean = lean || 0;
    var r = rng(seed || Math.round(x * 3 + y)), h = 96 * s, tx = x + lean * s, ty = y - h;
    var T = taper([[x, y], [x + lean * 0.15 * s, y - h * 0.35], [x + lean * 0.6 * s, y - h * 0.75], [tx, ty]], 10 * s, 5 * s, 6);
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    var fr = function (a, len, cc) {
      var p1 = [tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.5 - len * 0.12], p2 = [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.5 + len * 0.3];
      var F1 = taper([[tx, ty], p1, p2], 11 * s, 1 * s, 5);
      return body(c, F1.d, cc, L(bands(F1, 1, 1), dk(cc, 0.38), 0.9 * s) + F(ribbonBand(F1, 0.55, 1), dk(cc, 0.2), 0.7), 1.3 * s) + L(along(F1, 0.5), lt(cc, 0.25), 0.8 * s, 0.8);
    };
    [-2.6, -1.6, -0.6].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (40 + r() * 8) * s, dk(col, 0.2)); });
    o += body(c, T.d, TRUNK, L(bands(T, 3, 2), dk(TRUNK, 0.4), 1.2 * s) + F(ribbonBand(T, 0.55, 1), dk(TRUNK, 0.3), 0.8), 1.6 * s);
    o += C(tx - 3 * s, ty + 4 * s, 3.4 * s, c.cel('#6a4a24'), 1.2 * s) + C(tx + 3 * s, ty + 5 * s, 3.4 * s, c.cel('#7a5428'), 1.2 * s) + C(tx, ty + 7 * s, 3.2 * s, c.cel('#5a3e20'), 1.2 * s);
    [-3.0, -2.1, -1.1, -0.2, 0.3].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (42 + r() * 10) * s, col); });
    return o;
  }
  // giant fern: a fan of arching serrated fronds
  function fern(c, x, y, s, col, seed) {
    col = col || LEAF; var r = rng(seed || Math.round(x * 5 + y * 7)), o = E(x, y + 1, 22 * s, 3.4 * s, '#000', 0, 0.22), fr = [];
    for (var i = 0; i < 7; i++) fr.push([-PI + 0.25 + i * (PI - 0.5) / 6 + (r() - 0.5) * 0.15, (26 + r() * 10) * s * (i === 0 || i === 6 ? 0.9 : 1)]);
    [0, 6, 1, 5, 2, 4, 3].forEach(function (k, j) {
      var a = fr[k][0], len = fr[k][1], cc = j < 2 ? dk(col, 0.18) : j < 4 ? col : lt(col, 0.07);
      var T = taper([[x, y], [x + Math.cos(a) * len * 0.45, y + Math.sin(a) * len * 0.8], [x + Math.cos(a) * len, y + Math.sin(a) * len * 0.55 + len * 0.3]], 8 * s, 0.6 * s, 5);
      o += body(c, T.d, cc, L(bands(T, 1, 1), dk(cc, 0.4), 0.8 * s), 1.2 * s) + L(along(T, 0.5), lt(cc, 0.3), 0.7 * s, 0.8);
    });
    return o;
  }
  // broad banana / elephant-ear leaf growing from (x, y) along ang
  function bigLeaf(c, x, y, s, ang, col) {
    col = col || LEAF; var q = dirQ([x, y], ang), Ln = 44 * s, Wd = 15 * s;
    var d = 'M' + pt(q(6 * s, 0)) + 'C' + pt(q(Ln * 0.3, -Wd)) + ' ' + pt(q(Ln * 0.85, -Wd * 0.9)) + ' ' + pt(q(Ln, 0)) + 'C' + pt(q(Ln * 0.85, Wd * 0.9)) + ' ' + pt(q(Ln * 0.3, Wd)) + ' ' + pt(q(6 * s, 0)) + 'Z';
    var v = '';
    for (var i = 1; i < 6; i++) { var u = Ln * (0.12 + i * 0.13), k = Wd * 0.75 * (1 - i * 0.1); v += 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, -k)) + 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, k)); }
    var half = pd([q(4 * s, 0), q(Ln + 2, 0), q(Ln, Wd * 1.2), q(4 * s, Wd * 1.2)], true);
    return limb('M' + pt([x, y]) + 'L' + pt(q(8 * s, 0)), dk(col, 0.2), 2.4 * s) + body(c, d, col, F(half, dk(col, 0.22), 0.8) + L(v, dk(col, 0.35), 0.9 * s), 1.5 * s) + L('M' + pt(q(7 * s, 0)) + 'L' + pt(q(Ln * 0.92, 0)), lt(col, 0.3), 1.1 * s, 0.85);
  }
  function leafClump(c, x, y, s, col, flip) {
    var k = flip ? -1 : 1;
    return bigLeaf(c, x, y, s, -PI / 2 - 0.9 * k, dk(col || LEAF, 0.12)) + bigLeaf(c, x, y, s * 1.1, -PI / 2 - 0.25 * k, col) + bigLeaf(c, x, y, s * 0.9, -PI / 2 + 0.5 * k, lt(col || LEAF, 0.06));
  }
  function flag(c, x, y, h, s, cloth, trim, mark, swallow) {
    var w = 16 * s, bh = 26 * s, ty = y - h, bx = x + 1.5 * s, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, ty - 4 * s]), '#5a3e24', 2.6 * s) + limb('M' + pt([x - 2 * s, ty]) + 'L' + pt([x + w + 3 * s, ty]), '#5a3e24', 1.8 * s);
    var d = swallow ? pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh - 6 * s], [bx, ty + bh]], true) : pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh + 5 * s], [bx, ty + bh]], true);
    o += body(c, d, cloth, (trim ? L(pd([[bx + 1.8 * s, ty + 1], [bx + 1.8 * s, ty + bh - 1]]) + pd([[bx + w - 1.8 * s, ty + 1], [bx + w - 1.8 * s, ty + bh - 1]]), trim, 1.3 * s) : '') + F(pd([[bx + w * 0.62, ty], [bx + w + 1, ty], [bx + w + 1, ty + bh + 6 * s], [bx + w * 0.62, ty + bh + 6 * s]], true), '#000', 0.22), 1.4 * s);
    if (mark) o += mark(bx + w / 2, ty + bh * 0.45, s);
    return o + C(x, ty - 4 * s, 1.8 * s, c.cel(GOLD), 0.9 * s);
  }
  // original marks: rebel gold star over a chevron; Krugar black fang-crown; Drayke tan crossed blades
  function hordeMark(x, y, s) { return F(pd([[x - 6 * s, y + 6 * s], [x - 6 * s, y - 2 * s], [x - 3 * s, y + 1 * s], [x, y - 7 * s], [x + 3 * s, y + 1 * s], [x + 6 * s, y - 2 * s], [x + 6 * s, y + 6 * s], [x, y + 9 * s]], true), '#1a1009'); }
  function palisade(c, x0, x1, y, h, col, seed, spikes) {
    col = col || '#8a6a44'; var r = rng(seed || 11), o = '', lw = 9;
    for (var x = x0; x < x1; x += lw) {
      var hh = h * (0.9 + r() * 0.18);
      o += body(c, pd([[x, y], [x, y - hh + 5], [x + lw / 2, y - hh - 4], [x + lw, y - hh + 5], [x + lw, y]], true), r() < 0.5 ? col : lt(col, 0.07), F(pd([[x + lw * 0.6, y - hh - 6], [x + lw + 1, y - hh - 6], [x + lw + 1, y + 1], [x + lw * 0.6, y + 1]], true), dk(col, 0.3), 0.8), 1.4);
    }
    var rl = 'M' + pt([x0, y - h * 0.28]) + 'L' + pt([x1, y - h * 0.3]) + 'M' + pt([x0, y - h * 0.7]) + 'L' + pt([x1, y - h * 0.72]);
    o += L(rl, OL, 3.6) + L(rl, '#b8a070', 1.8);
    if (spikes) for (var sx = x0 + 10; sx < x1 - 4; sx += 20) { var sy = y - h * 0.45; o += P(pd([[sx, sy - 2.5], [sx - 15, sy + 6], [sx + 1, sy + 3]], true), c.cel('#ddd2b8'), 1.2); }
    return o;
  }
  function carvedFace(c, x, y, s, col) {
    col = col || TST; var q = function (u, v) { return [x + u * s, y + v * s]; }, dd = dk(col, 0.5), o = '';
    o += body(c, pd([q(-20, -24), q(20, -24), q(22, 24), q(-22, 24)], true), col, F(pd([q(8, -26), q(24, -26), q(24, 26), q(10, 26)], true), dk(col, 0.25), 0.8) + L('M' + pt(q(-21, -17)) + 'L' + pt(q(21, -17)) + 'M' + pt(q(-21.6, 21)) + 'L' + pt(q(21.6, 21)), dk(col, 0.3), 0.9 * s), 1.8 * s);
    o += P(pd([q(-17, -14), q(-3, -8), q(3, -8), q(17, -14), q(17, -9), q(3, -3), q(-3, -3), q(-17, -9)], true), c.cel(lt(col, 0.1)), 1.3 * s);
    o += P(pd([q(-15, -6), q(-4, -2), q(-6, 2), q(-14, 0)], true), dd, 1 * s) + P(pd([q(15, -6), q(4, -2), q(6, 2), q(14, 0)], true), dd, 1 * s);
    o += P(pd([q(-3, -4), q(3, -4), q(5, 8), q(0, 10), q(-5, 8)], true), c.cel(lt(col, 0.06)), 1.2 * s);
    o += P(pd([q(-12, 12), q(12, 12), q(10, 19), q(-10, 19)], true), dd, 1 * s) + L('M' + pt(q(-6, 12)) + 'L' + pt(q(-6, 19)) + 'M' + pt(q(0, 12)) + 'L' + pt(q(0, 19)) + 'M' + pt(q(6, 12)) + 'L' + pt(q(6, 19)), lt(col, 0.1), 1 * s);
    o += P(pd([q(-11, 17), q(-13, 9), q(-8, 15)], true), c.cel('#d8d0b4'), 1.1 * s) + P(pd([q(11, 17), q(13, 9), q(8, 15)], true), c.cel('#c8c0a4'), 1.1 * s);
    return o;
  }
  // square troll pillar with a carved zigzag band; broken tops are jagged
  function driftwood(c, x, y, len, ang, s) {
    s = s || 1; var q = dirQ([x, y], ang), col = '#b4aa98', e = q(0, 0);
    var o = E(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2 + 3 * s, len * 0.56, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt(q(len * 0.3, 0)) + 'L' + pt(q(len * 0.42, -13 * s)) + 'M' + pt(q(len * 0.7, 0)) + 'L' + pt(q(len * 0.8, -9 * s)) + 'L' + pt(q(len * 0.92, -13 * s)), col, 2.4 * s);
    o += limb('M' + pt(q(0, 0)) + 'L' + pt(q(len, 0)), col, 7 * s) + L('M' + pt(q(3, -1.8 * s)) + 'L' + pt(q(len - 2, -1.8 * s)), lt(col, 0.4), 1.2 * s, 0.8) + L('M' + pt(q(len * 0.2, 1.6 * s)) + 'L' + pt(q(len * 0.5, 1.9 * s)) + 'M' + pt(q(len * 0.6, 1 * s)) + 'L' + pt(q(len * 0.86, 1.7 * s)), dk(col, 0.35), 0.9 * s);
    return o + E(e[0], e[1], 2.6 * s, 4 * s, c.cel('#d8d0bc'), 1.2 * s) + L(ellD(e[0], e[1], 1.2 * s, 2 * s), '#8a806e', 0.6 * s);
  }
  function emForsaken(c, x, y, k) { return P(pd([[x - 6 * k, y - 5 * k], [x - 2 * k, y - 5 * k], [x, y - 1 * k], [x + 2 * k, y - 5 * k], [x + 6 * k, y - 5 * k], [x, y + 7 * k]], true), c.cel(FTRIM), 0.9 * k) + L('M' + pt([x - 7 * k, y - 8 * k]) + 'L' + pt([x + 7 * k, y - 8 * k]), FTRIM, 1.4 * k); }
  function hordeMarkRed(x, y, s) { return F(pd([[x - 6 * s, y + 6 * s], [x - 6 * s, y - 2 * s], [x - 3 * s, y + 1 * s], [x, y - 7 * s], [x + 3 * s, y + 1 * s], [x + 6 * s, y - 2 * s], [x + 6 * s, y + 6 * s], [x, y + 9 * s]], true), HRED); }
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }

  // ============================================================
  //  PALETTE
  // ============================================================
  var PALM = '#4e9a3e', TRUNK = '#8a6a44', LEAF = '#3e8a3a', TST = '#7c8884';
  var SEA = '#34c4b8', SEAD = '#17687e', SEAL = '#9aeedc', FOAM = '#f2fcf6';
  var SAND = '#e8d6a6', WET = '#b8a47a';
  var ROCK = '#34323a';
  var CORAL = '#f27a8c', CORALD = '#c24a66', CORALO = '#ff9460';
  var BONE = '#e8e0c8', BARN = '#dcd6c2', KELP = '#56722e', KELPD = '#324a1c';
  var HRED = '#a81e1e', HBLK = '#221c1c', GOLD = '#e2b23c', GOLDD = '#a8801e', STEEL = '#b8bec8';
  var DSK = '#9aaaa6', DSKD = '#6e807c', DEYE = '#5cf4e2', DRIP = '#8ae8e0', RIM = '#d8f4ee';
  var FPURP = '#4e2a62', FTRIM = '#c8b890', WOOD = '#6e4c2e';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // storm light: dark cloud banks, a bright break (bx, by) with light shafts falling to the sea, a far rain curtain
  function stormSky(c, seed, o) {
    o = o || {};
    var bx = o.bx == null ? 290 : o.bx, by = o.by == null ? 64 : o.by, gc = o.glow || '#fff0c0', sy = o.shaftY || 116;
    var s = sky(c, o.top || '#27303e', o.mid || '#587482', o.bot || '#e6d8a4');
    s += C(bx, by, 120, glow(c, gc, 0.5)) + C(bx, by, 7, lt(gc, 0.6), 0, 0.7);
    var r = rng(seed + 7);
    for (var i = 0; i < 4; i++) { var x0 = bx - 26 + i * 16 + r() * 8, w = 6 + r() * 8, sp = (i - 1.5) * 36 - 6; s += F(pd([[x0, by], [x0 + w, by], [x0 + w + sp + 26, sy], [x0 + sp - 8, sy]], true), c.lg([[0, '#fff4d0', 0.26], [1, '#fff4d0', 0]])); }
    s += overcast(c, seed, 14, o.c1 || '#222a36', 7, 1.5) + overcast(c, seed + 1, 42, o.c2 || '#3c4a58', 6, 1.05);
    var rx = o.rainX == null ? 40 : o.rainX;
    s += F('M' + (rx - 44) + ',0 L' + (rx + 110) + ',0 C' + (rx + 90) + ',30 ' + (rx + 50) + ',54 ' + rx + ',58 C' + (rx - 20) + ',60 ' + (rx - 36) + ',56 ' + (rx - 44) + ',54 Z', '#1a2029', 0.5);
    if (o.rain !== false) s += F(pd([[rx, 56], [rx + 46, 56], [rx + 30, 104], [rx - 20, 104]], true), c.lg([[0, '#2e3a46', 0.45], [1, '#2e3a46', 0]])) + L('M' + (rx + 4) + ',60 l-8,40 M' + (rx + 14) + ',60 l-8,40 M' + (rx + 24) + ',60 l-8,40 M' + (rx + 34) + ',60 l-8,40', '#9aa8b4', 0.6, 0.35);
    return s;
  }
  // turquoise sea from the horizon y0 to y1: deep far, bright near, ripple strokes and an optional sun glitter at gx
  function sea(c, y0, y1, seed, o) {
    o = o || {};
    var s = R(-2, y0, 404, y1 - y0 + 2, c.lg([[0, o.far || SEAD], [0.45, o.mid || '#23a0a8'], [1, o.near || SEA]]));
    s += R(-2, y0, 404, 2.4, lt(o.far || SEAD, 0.3), 0);
    var r = rng(seed), d = '', gl = '';
    for (var i = 0; i < (o.cnt || 34); i++) { var yy = y0 + 3 + r() * (y1 - y0 - 4), t = (yy - y0) / ((y1 - y0) || 1), w = 4 + t * 16, xx = r() * 400; d += 'M' + pt([xx - w, yy]) + 'q' + n(w / 2) + ',' + n(-1.2 - t * 2) + ' ' + n(w) + ',0'; }
    if (o.gx != null) for (var k = 0; k < 14; k++) { var gy = y0 + 2 + k * (y1 - y0) / 15, gw = 3 + k * 1.4; gl += 'M' + pt([o.gx - gw + (r() - 0.5) * 10 * (1 + k * 0.2), gy]) + 'l' + n(gw * 2) + ',0'; }
    return s + L(d, o.line || SEAL, 1, 0.6) + (gl ? L(gl, '#fff8e0', 1.3, 0.75) : '');
  }
  // sand from a wavy shoreline (yl at the left edge, yr at the right) to the bottom, a wet band and the surf
  function beach(c, yl, yr, seed, col, o) {
    o = o || {}; col = col || SAND;
    var r = rng(seed), pts = [];
    for (var x = -8; x <= 412; x += 16) { var t = (x + 8) / 420; pts.push([x, yl + (yr - yl) * t + Math.sin(x * 0.05 + seed) * 1.6 + (r() - 0.5) * 1.2]); }
    var top = 'M' + pts.map(pt).join('L');
    var s = F(top + 'L412,244L-8,244Z', c.lg([[0, lt(col, 0.12)], [0.3, col], [1, dk(col, 0.3)]]));
    var wet = pts.map(function (p) { return [p[0], p[1] + 6]; });
    s += F(top + 'L' + wet.slice().reverse().map(pt).join('L') + 'Z', o.wet || WET, 0.55);
    s += L(top, o.surf || SEAL, 5, 0.3) + L(top, FOAM, 2.2, 0.9);
    var br = '';
    for (var i = 1; i < pts.length - 1; i++) if (r() < 0.6) { var p = pts[i]; br += 'M' + pt([p[0] - 6, p[1] - 4 - r() * 3]) + 'q6,-2.4 12,0'; }
    return s + L(br, FOAM, 1.3, 0.75);
  }
  function shoreY(yl, yr, x) { return yl + (yr - yl) * (x + 8) / 420; }
  // jagged black volcanic rock (x = centre, y = base); foam = surf round the foot
  function blackRock(c, x, y, w, h, seed, col, foam) {
    col = col || ROCK; var r = rng(seed || 5), top = [], k = 5;
    for (var i = 0; i <= k; i++) top.push([x - w / 2 + w * i / k, y - h * (i === 0 || i === k ? 0.15 + r() * 0.2 : 0.55 + r() * 0.45)]);
    var d = 'M' + pt([x - w / 2 - 2, y]) + top.map(function (p) { return 'L' + pt(p); }).join('') + 'L' + pt([x + w / 2 + 2, y]) + 'Z';
    var peak = top.reduce(function (a, b) { return b[1] < a[1] ? b : a; });
    var sh = F(pd([[peak[0], peak[1] - 2], [x + w / 2 + 4, y - h * 0.3], [x + w / 2 + 4, y + 2], [peak[0] + w * 0.08, y + 2]], true), dk(col, 0.4), 0.9);
    var hl = L('M' + pt([top[1][0], top[1][1] + 2]) + 'L' + pt([peak[0] - 2, peak[1] + 2]), lt(col, 0.4), 1.2, 0.8) + L('M' + pt([x - w * 0.2, y - h * 0.25]) + 'l' + n(w * 0.12) + ',' + n(-h * 0.22) + 'M' + pt([x + w * 0.05, y - h * 0.15]) + 'l' + n(w * 0.08) + ',' + n(-h * 0.3), dk(col, 0.45), 1, 0.8);
    var s = E(x, y + 1, w * 0.55, Math.max(2, h * 0.08), '#000', 0, 0.3) + body(c, d, col, sh + hl, 1.8);
    if (foam) s += L('M' + pt([x - w / 2 - 6, y - 1]) + 'q' + n(w * 0.3) + ',-3 ' + n(w * 0.6) + ',0 q' + n(w * 0.3) + ',-3 ' + n(w * 0.55) + ',0', FOAM, 1.8, 0.85) + E(x - w * 0.3, y - 2, w * 0.14, 2, FOAM, 0, 0.6);
    return s;
  }
  // distant island: a soft hump with palm silhouettes, no outline
  function farIsle(seed, x0, x1, y, h, col, palms) {
    var r = rng(seed), d = 'M' + pt([x0, y]), k = 6, pal = '';
    for (var i = 1; i < k; i++) { var t = i / k; d += 'Q' + pt([x0 + (x1 - x0) * (t - 0.08), y - h * (0.6 + r() * 0.6) * Math.sin(PI * t)]) + ' ' + pt([x0 + (x1 - x0) * t, y - h * (0.4 + r() * 0.5) * Math.sin(PI * t)]); }
    d += 'L' + pt([x1, y]) + 'Z';
    for (var j = 0; j < (palms || 0); j++) {
      var px = x0 + (x1 - x0) * (0.25 + 0.5 * r()), py = y - h * 0.6, ph = h * (0.8 + r() * 0.5), tx = px + (r() - 0.5) * 8, ty = py - ph;
      pal += 'M' + pt([px, py]) + 'Q' + pt([px, py - ph * 0.5]) + ' ' + pt([tx, ty]);
      for (var f = 0; f < 5; f++) { var a = -PI + 0.3 + f * 0.62; pal += 'M' + pt([tx, ty]) + 'q' + n(Math.cos(a) * 5) + ',' + n(Math.sin(a) * 4 - 2) + ' ' + n(Math.cos(a) * 9) + ',' + n(Math.sin(a) * 3 + 3); }
    }
    return F(d, col) + (pal ? L(pal, col, 1.4) : '');
  }
  // branching coral (x, y = base); all outlines first so the branches read as one shape
  function coral(c, x, y, s, col, seed) {
    col = col || CORAL; var r = rng(seed || Math.round(x * 7 + y * 3)), br = [], tips = [];
    function grow(p, a, len, w, lv) {
      var e = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len], m = [(p[0] + e[0]) / 2 + (r() - 0.5) * len * 0.25, (p[1] + e[1]) / 2];
      br.push(['M' + pt(p) + 'Q' + pt(m) + ' ' + pt(e), w]);
      if (lv < 2) { grow(e, a - 0.32 - r() * 0.3, len * (0.62 + r() * 0.15), w * 0.72, lv + 1); grow(e, a + 0.32 + r() * 0.3, len * (0.62 + r() * 0.15), w * 0.72, lv + 1); }
      else tips.push([e, w]);
    }
    grow([x - 3 * s, y], -PI / 2 - 0.35, 14 * s, 5.4 * s, 0); grow([x + 3 * s, y], -PI / 2 + 0.3, 12 * s, 5 * s, 0);
    var o = E(x, y + 1, 14 * s, 2.6 * s, '#000', 0, 0.25), a = '', b = '', h = '';
    br.forEach(function (q) { a += L(q[0], OL, q[1] + 3); b += L(q[0], col, q[1]); h += L(q[0], lt(col, 0.3), q[1] * 0.3, 0.7); });
    tips.forEach(function (t) { h += C(t[0][0], t[0][1], t[1] * 0.62, lt(col, 0.28)); });
    return o + a + b + h;
  }
  function brainCoral(c, x, y, s, col) {
    col = col || CORALO; var w = 14 * s, h = 10 * s, d = 'M' + pt([x - w, y]) + 'C' + pt([x - w, y - h * 1.4]) + ' ' + pt([x + w, y - h * 1.4]) + ' ' + pt([x + w, y]) + 'Z', g = '';
    for (var i = 0; i < 4; i++) { var yy = y - h * (0.18 + i * 0.22), ww = w * (0.92 - i * 0.2); g += 'M' + pt([x - ww, yy]) + 'q' + n(ww * 0.25) + ',' + n(-3 * s) + ' ' + n(ww * 0.5) + ',0 q' + n(ww * 0.25) + ',' + n(3 * s) + ' ' + n(ww * 0.5) + ',0 q' + n(ww * 0.25) + ',' + n(-3 * s) + ' ' + n(ww * 0.5) + ',0 q' + n(ww * 0.25) + ',' + n(3 * s) + ' ' + n(ww * 0.5) + ',0'; }
    return E(x, y + 1, w * 1.1, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L(g, dk(col, 0.35), 1.1 * s) + F(pd([[x + w * 0.2, y - h * 1.4], [x + w + 2, y - h * 1.4], [x + w + 2, y + 1], [x + w * 0.3, y + 1]], true), dk(col, 0.25), 0.7), 1.5 * s);
  }
  function fanCoral(c, x, y, s, col) {
    col = col || '#b85aa8'; var R0 = 20 * s, pts = [], lat = '';
    for (var i = 0; i <= 8; i++) { var a = -PI + 0.35 + i * (PI - 0.7) / 8; pts.push([x + Math.cos(a) * R0 * (0.9 + (i % 2) * 0.12), y - 4 * s + Math.sin(a) * R0 * 1.1]); }
    var d = 'M' + pt([x - 2 * s, y]) + pts.map(function (p, i) { return (i ? 'Q' + pt([(p[0] + pts[i - 1][0]) / 2 + (p[0] - x) * 0.08, (p[1] + pts[i - 1][1]) / 2 - 3 * s]) + ' ' : 'L') + pt(p); }).join('') + 'L' + pt([x + 2 * s, y]) + 'Z';
    pts.forEach(function (p) { lat += 'M' + pt([x, y - 2 * s]) + 'L' + pt(p); });
    for (var k = 1; k < 4; k++) lat += 'M' + pts.map(function (p) { return pt([x + (p[0] - x) * k / 4, y - 2 * s + (p[1] - y + 2 * s) * k / 4]); }).join('L');
    return E(x, y + 1, 10 * s, 2 * s, '#000', 0, 0.25) + body(c, d, col, L(lat, dk(col, 0.35), 0.9 * s, 0.9), 1.4 * s) + limb('M' + pt([x, y + 1]) + 'L' + pt([x, y - 5 * s]), dk(col, 0.3), 2 * s);
  }
  function barnacles(seed, cnt, x0, x1, y0, y1, s, col) {
    // small cones with a dark slit on top, in a muted shell colour so a cluster reads as crust, not polka dots
    var r = rng(seed), o = ''; s = s || 1; col = col || BARN;
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (0.7 + r() * 0.9) * s, cc = r() < 0.5 ? col : dk(col, 0.12); o += E(x, y, rr, rr * 0.82, cc, 0.5 * s) + E(x, y - rr * 0.18, rr * 0.42, rr * 0.2, '#4a4a44'); }
    return o;
  }
  // seaweed hanging from points along (x0,y0)-(x1,y1)
  function kelp(c, x0, y0, x1, y1, cnt, len, seed, col, w) {
    col = col || KELP; var r = rng(seed || 3), o = ''; w = w || 4.2;
    for (var i = 0; i < cnt; i++) {
      var t = cnt > 1 ? i / (cnt - 1) : 0.5, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, l = len * (0.6 + r() * 0.6), sw = (r() - 0.5) * 5;
      var T = taper([[x, y], [x + sw * 0.25, y + l * 0.5], [x + sw, y + l]], w, w * 0.3, 5);
      o += P(T.d, c.cel(i % 2 ? col : dk(col, 0.18)), 0.9) + L(along(T, 0.35), lt(col, 0.3), 0.6, 0.7);
    }
    return o;
  }
  // seaweed growing up from the sand
  function kelpTuft(c, x, y, s, col, seed) {
    col = col || KELP; var r = rng(seed || Math.round(x * 3 + y)), o = E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.22);
    for (var i = 0; i < 5; i++) {
      var bx = x + (i - 2) * 3 * s, h = (16 + r() * 14) * s, sw = ((i - 2) * 3 + (r() - 0.5) * 6) * s;
      var T = taper([[bx, y], [bx - sw * 0.3, y - h * 0.4], [bx + sw * 0.6, y - h * 0.75], [bx + sw, y - h]], 4 * s, 1 * s, 4);
      o += P(T.d, c.cel(i % 2 ? col : lt(col, 0.1)), 0.9 * s);
    }
    return o;
  }
  function shell(c, x, y, s, col) {
    col = col || '#f4d8c0'; var d = 'M' + pt([x, y]) + 'L' + pt([x - 5 * s, y - 3 * s]) + 'Q' + pt([x - 5 * s, y - 8 * s]) + ' ' + pt([x, y - 8.5 * s]) + 'Q' + pt([x + 5 * s, y - 8 * s]) + ' ' + pt([x + 5 * s, y - 3 * s]) + 'Z';
    return P(d, c.cel(col), 0.9 * s) + L('M' + pt([x, y]) + 'L' + pt([x - 3 * s, y - 7 * s]) + 'M' + pt([x, y]) + 'L' + pt([x, y - 8 * s]) + 'M' + pt([x, y]) + 'L' + pt([x + 3 * s, y - 7 * s]), dk(col, 0.3), 0.7 * s);
  }
  function starfish(c, x, y, s, col) { return P(starD(x, y, 5 * s, 0.4), c.cel(col || CORALO), 0.9 * s) + C(x, y, 1 * s, lt(col || CORALO, 0.4)); }
  function anemone(c, x, y, s, col) {
    col = col || '#c870b8'; var d = '';
    for (var i = 0; i < 7; i++) { var a = -PI + 0.3 + i * (PI - 0.6) / 6; d += 'M' + pt([x, y - 2 * s]) + 'q' + n(Math.cos(a) * 3 * s) + ',' + n(-4 * s) + ' ' + n(Math.cos(a) * 6 * s) + ',' + n(Math.sin(a) * 6 * s); }
    return E(x, y, 5 * s, 2.6 * s, c.cel(dk(col, 0.2)), 0.9 * s) + L(d, OL, 2.8 * s) + L(d, col, 1.4 * s);
  }
  function shells(c, seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + (y - y0) / ((y1 - y0) || 1) * 0.7; o += r() < 0.7 ? shell(c, x, y, s, r() < 0.5 ? '#f4d8c0' : '#f0b8a8') : starfish(c, x, y, s, r() < 0.5 ? CORALO : '#e86a5a'); }
    return o;
  }
  // one giant rib curving up out of the sand (x, y = root, dir -1 leans left, +1 right)
  function rib(c, x, y, h, w, dir, col) {
    col = col || BONE;
    var T = taper([[x, y], [x + dir * h * 0.08, y - h * 0.45], [x + dir * h * 0.3, y - h * 0.85], [x + dir * h * 0.52, y - h]], w, w * 0.2, 6);
    return body(c, T.d, col, F(ribbonBand(T, dir > 0 ? 0.55 : 0, dir > 0 ? 1 : 0.45), dk(col, 0.25), 0.85) + L(along(T, dir > 0 ? 0.25 : 0.75), lt(col, 0.4), 0.8, 0.7), 1.6);
  }
  // giant beast ribcage half-buried in the sand, receding to the right (x = front pair, y = ground)
  function ribcage(c, x, y, s) {
    var o = E(x + 60 * s, y + 3, 96 * s, 6 * s, '#000', 0, 0.22), cnt = 5;
    for (var i = cnt - 1; i >= 0; i--) {
      var t = i / (cnt - 1), k = 1 - t * 0.55, bx = x + t * 120 * s, by = y - t * 8 * s, h = 88 * s * k, hw = 30 * s * k;
      var cc = mix(BONE, '#a8a090', t * 0.5);
      o += rib(c, bx + hw, by, h, 9 * s * k, -1, dk(cc, 0.12)) + rib(c, bx - hw, by + 2 * s * k, h * 1.02, 10 * s * k, 1, cc);
      o += E(bx - hw, by + 2 * s * k, 8 * s * k, 2 * s * k, lt(SAND, 0.05), 0, 0.9) + E(bx + hw, by, 7 * s * k, 1.8 * s * k, lt(SAND, 0.05), 0, 0.9);
    }
    // the spine, a row of knuckled vertebrae along the tops
    var sp = '';
    for (var j = 0; j < 9; j++) { var tt = j / 8; sp += C(x - 2 * s + tt * 124 * s, y - 86 * s * (1 - tt * 0.55) - tt * 8 * s + 4 * s, (5.4 - tt * 2.4) * s, c.cel(mix(BONE, '#a8a090', tt * 0.5)), 1.3 * s); }
    return o + sp + barnacles(4111, 7, x - 30 * s, x + 20 * s, y - 20 * s, y - 4 * s, 1.1 * s);
  }
  // long-snouted sea-beast skull lying on the sand, snout to the left (x, y = back of the jaw on the ground)
  function beastSkull(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, b = BONE, o = E(x - 30 * s, y + 2, 62 * s, 5 * s, '#000', 0, 0.28), th = '';
    o += P(pd([q(-80, 0), q(-78, -7), q(-30, -11), q(4, -16), q(12, -4), q(8, 0)], true), c.cel(dk(b, 0.1)), 1.8 * s);
    for (var u = -74; u < -26; u += 8) th += 'M' + pt(q(u - 2, -10)) + 'L' + pt(q(u, -3)) + 'L' + pt(q(u + 2, -10)) + 'Z' + 'M' + pt(q(u + 2, -8)) + 'L' + pt(q(u + 4, -14)) + 'L' + pt(q(u + 6, -8)) + 'Z';
    o += P(th, '#f6f0dc', 0.8 * s);
    var cr = 'M' + pt(q(-84, -12)) + 'C' + pt(q(-70, -22)) + ' ' + pt(q(-40, -26)) + ' ' + pt(q(-18, -34)) + 'C' + pt(q(-4, -54)) + ' ' + pt(q(24, -56)) + ' ' + pt(q(32, -34)) + 'C' + pt(q(36, -22)) + ' ' + pt(q(26, -12)) + ' ' + pt(q(12, -13)) + 'L' + pt(q(-30, -14)) + 'L' + pt(q(-82, -9)) + 'Z';
    o += body(c, cr, b, F(pd([q(8, -60), q(40, -60), q(40, -10), q(14, -10)], true), dk(b, 0.28), 0.8) + L('M' + pt(q(-60, -20)) + 'L' + pt(q(-30, -24)) + 'M' + pt(q(-10, -40)) + 'l' + n(6 * s) + ',' + n(8 * s), dk(b, 0.35), 1 * s), 2 * s);
    o += E(q(6, -34)[0], q(6, -34)[1], 9 * s, 8 * s, '#1a1410', 1.4 * s) + E(q(-72, -14)[0], q(-72, -14)[1], 3 * s, 2 * s, '#1a1410');
    return o + barnacles(4121, 9, x - 12 * s, x + 26 * s, y - 50 * s, y - 38 * s, 1.2 * s) + kelp(c, q(-40, -25)[0], q(-40, -25)[1], q(-20, -30)[0], q(-20, -30)[1], 3, 14 * s, 4122);
  }
  // Kessari hut on stilts: woven walls, a tall thatched cone, a ladder (x = centre, y = ground)
  function stiltHut(c, x, y, s, o) {
    o = o || {}; var q = function (u, v) { return [x + u * s, y + v * s]; }, wall = o.wall || '#b8945a', th = o.thatch || '#c8a860';
    var out = E(x, y + 2, 30 * s, 3.6 * s, '#000', 0, 0.28), posts = '';
    [-20, -8, 8, 20].forEach(function (u) { posts += 'M' + pt(q(u, 0)) + 'L' + pt(q(u * 0.9, -30)); });
    out += limb(posts, WOOD, 3 * s) + limb('M' + pt(q(-20, -6)) + 'L' + pt(q(18, -24)) + 'M' + pt(q(20, -6)) + 'L' + pt(q(-18, -24)), dk(WOOD, 0.1), 1.5 * s);
    out += P(pd([q(-28, -30), q(28, -30), q(26, -35), q(-26, -35)], true), c.cel('#8a6a40'), 1.5 * s);
    var wd = pd([q(-19, -35), q(19, -35), q(18, -56), q(-18, -56)], true), wv = '';
    for (var i = 1; i < 5; i++) wv += 'M' + pt(q(-19, -35 - i * 4.2)) + 'L' + pt(q(19, -35 - i * 4.2));
    for (var j = -3; j <= 3; j++) wv += 'M' + pt(q(j * 5.5, -35)) + 'L' + pt(q(j * 5.2, -56));
    out += body(c, wd, wall, L(wv, dk(wall, 0.3), 0.8 * s, 0.8) + F(pd([q(6, -58), q(22, -58), q(22, -33), q(8, -33)], true), dk(wall, 0.3), 0.8), 1.6 * s);
    out += P(pd([q(-6, -35), q(-6, -50), q(6, -50), q(6, -35)], true), '#1e140c', 1.2 * s) + P(pd([q(-6, -50), q(6, -50), q(5, -41), q(0, -44), q(-5, -41)], true), c.cel(o.cloth || HRED), 1 * s);
    var cone = 'M' + pt(q(-2, -94)) + 'L' + pt(q(2, -94)) + 'L' + pt(q(31, -52));
    for (var k = 1; k <= 12; k++) cone += 'L' + pt(q(31 - k * 62 / 12, -52 + (k % 2 ? 4 : 0)));
    cone += 'Z';
    var tl = ''; for (var m = 1; m < 8; m++) tl += 'M' + pt(q(0, -92)) + 'L' + pt(q(-28 + m * 7, -53));
    out += body(c, cone, th, L(tl, dk(th, 0.3), 0.9 * s, 0.8) + F(pd([q(2, -96), q(34, -54), q(34, -46), q(8, -46)], true), dk(th, 0.28), 0.8) + L('M' + pt(q(-22, -64)) + 'L' + pt(q(22, -64)), '#7a3a1e', 1.6 * s), 1.6 * s);
    out += limb('M' + pt(q(0, -94)) + 'L' + pt(q(0, -104)), WOOD, 1.4 * s) + skull(c, x, y - 104 * s, 0.7 * s);
    if (o.ladder !== false) out += limb('M' + pt(q(8, 1)) + 'L' + pt(q(14, -30)) + 'M' + pt(q(16, 1)) + 'L' + pt(q(21, -30)), '#7a5a34', 1.4 * s) + L('M' + pt(q(9, -6)) + 'l' + n(8 * s) + ',0 M' + pt(q(10.5, -13)) + 'l' + n(8 * s) + ',0 M' + pt(q(12, -20)) + 'l' + n(8 * s) + ',0 M' + pt(q(13.4, -27)) + 'l' + n(8 * s) + ',0', '#5a3e22', 1.2 * s);
    return out;
  }
  // tiki torch: a pole with a bound bowl of fire
  function tiki(c, x, y, s) {
    return E(x, y + 1, 4 * s, 1.4 * s, '#000', 0, 0.3) + C(x, y - 30 * s, 20 * s, glow(c, '#ffa040', 0.5)) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 26 * s]), WOOD, 2 * s) +
      P(pd([[x - 4 * s, y - 30 * s], [x + 4 * s, y - 30 * s], [x + 3 * s, y - 24 * s], [x - 3 * s, y - 24 * s]], true), c.cel('#8a6a3a'), 1 * s) + flame(c, x, y - 29 * s, 0.55 * s);
  }
  // Krugar longship moored side-on, prow to the left (x = centre of the waterline)
  function longship(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, hull = '#3e2c22', o = E(x, y + 3 * s, 76 * s, 4 * s, dk(SEAD, 0.2), 0, 0.5);
    o += limb('M' + pt(q(4, -8)) + 'L' + pt(q(4, -100)), '#5a3e28', 3.4 * s);
    o += L('M' + pt(q(4, -98)) + 'L' + pt(q(-60, -16)) + 'M' + pt(q(4, -98)) + 'L' + pt(q(62, -16)), '#2a1e16', 0.9 * s, 0.85);
    var sail = 'M' + pt(q(-30, -88)) + 'Q' + pt(q(4, -82)) + ' ' + pt(q(38, -88)) + 'L' + pt(q(42, -32)) + 'Q' + pt(q(4, -24)) + ' ' + pt(q(-34, -32)) + 'Z', st = '';
    for (var i = 0; i < 4; i++) st += R(q(-34 + i * 20 + 10, -92)[0], q(0, -92)[1], 10 * s, 70 * s, HBLK, 0);
    o += limb('M' + pt(q(-34, -89)) + 'L' + pt(q(42, -89)), '#5a3e28', 2.4 * s);
    o += body(c, sail, HRED, '<g opacity="0.9">' + st + '</g>' + F(pd([q(10, -92), q(46, -92), q(46, -24), q(12, -24)], true), '#000', 0.2) + C(q(4, -58)[0], q(4, -58)[1], 13 * s, HRED, 1.2 * s) + hordeMark(q(4, -59)[0], q(4, -59)[1], 1.3 * s), 1.8 * s);
    var neck = taper([q(-54, -16), q(-66, -26), q(-72, -42), q(-66, -54)], 9 * s, 5 * s, 5), stern = taper([q(54, -16), q(64, -28), q(66, -42), q(58, -48)], 8 * s, 3 * s, 5);
    o += body(c, stern.d, hull, L(bands(stern, 3), dk(hull, 0.4), 0.8 * s), 1.6 * s) + body(c, neck.d, hull, L(bands(neck, 3), dk(hull, 0.4), 0.8 * s), 1.6 * s);
    var hp = q(-66, -54), head = 'M' + pt([hp[0] + 4 * s, hp[1] + 3 * s]) + 'C' + pt([hp[0] + 3 * s, hp[1] - 6 * s]) + ' ' + pt([hp[0] - 6 * s, hp[1] - 7 * s]) + ' ' + pt([hp[0] - 14 * s, hp[1] - 3 * s]) + 'L' + pt([hp[0] - 15 * s, hp[1] + 1 * s]) + 'L' + pt([hp[0] - 6 * s, hp[1] + 1 * s]) + 'L' + pt([hp[0] - 13 * s, hp[1] + 5 * s]) + 'L' + pt([hp[0] - 2 * s, hp[1] + 5 * s]) + 'Z';
    o += P(pd([[hp[0] + 1 * s, hp[1] - 4 * s], [hp[0] + 9 * s, hp[1] - 12 * s], [hp[0] + 5 * s, hp[1] - 2 * s], [hp[0] + 11 * s, hp[1] - 6 * s], [hp[0] + 5 * s, hp[1] + 2 * s]], true), c.cel(HRED), 1 * s) + body(c, head, hull, '', 1.5 * s) + C(hp[0] - 5 * s, hp[1] - 2 * s, 1.2 * s, '#ff5a2a');
    var hd = 'M' + pt(q(-62, -16)) + 'C' + pt(q(-40, -12)) + ' ' + pt(q(40, -12)) + ' ' + pt(q(62, -16)) + 'C' + pt(q(56, -4)) + ' ' + pt(q(40, 2)) + ' ' + pt(q(20, 3)) + 'L' + pt(q(-24, 3)) + 'C' + pt(q(-44, 2)) + ' ' + pt(q(-56, -4)) + ' ' + pt(q(-62, -16)) + 'Z';
    var pl = 'M' + pt(q(-58, -10)) + 'C' + pt(q(-30, -6)) + ' ' + pt(q(30, -6)) + ' ' + pt(q(58, -10)) + 'M' + pt(q(-50, -4)) + 'C' + pt(q(-24, -1)) + ' ' + pt(q(24, -1)) + ' ' + pt(q(50, -4));
    o += body(c, hd, hull, L(pl, dk(hull, 0.45), 1 * s) + F(pd([q(-70, -2), q(70, -2), q(70, 6), q(-70, 6)], true), '#000', 0.3), 1.8 * s);
    for (var k = 0; k < 9; k++) { var sp = q(-44 + k * 11, -14); o += C(sp[0], sp[1], 4.6 * s, c.cel(k % 2 ? HBLK : HRED), 1.2 * s) + C(sp[0], sp[1], 1.3 * s, GOLD); }
    return o + L('M' + pt(q(-60, 2)) + 'q' + n(20 * s) + ',' + n(-3 * s) + ' ' + n(40 * s) + ',0 q' + n(30 * s) + ',' + n(3 * s) + ' ' + n(60 * s) + ',0 q' + n(15 * s) + ',' + n(-3 * s) + ' ' + n(24 * s) + ',0', FOAM, 1.6 * s, 0.8);
  }
  // wooden pier seen running away from the viewer: near end nr = [xLeft, xRight, y], far end fr likewise
  // o: col, seed, planks, posts, depth, rot (chance a plank is missing), sink (0-1: the far part slides under water), sea (water colour)
  function pier(c, nr, fr, o) {
    o = o || {}; var col = o.col || '#8a6a46', r = rng(o.seed || 9), s = '', k = o.planks || 14, np = o.posts || 5, dep = o.depth || 18;
    var lp = function (a, b, t) { return a + (b - a) * t; };
    var sag = function (t) { return o.sink ? Math.max(0, t - (1 - o.sink)) * 18 : 0; };
    var edge = function (sd, t) { return [lp(sd ? nr[1] : nr[0], sd ? fr[1] : fr[0], t), lp(nr[2], fr[2], t) + sag(t)]; };
    var wAt = function (t) { return lp(nr[1] - nr[0], fr[1] - fr[0], t) / (nr[1] - nr[0]); };
    for (var i = np; i >= 0; i--) {
      var t = i / np, kk = wAt(t), lean = o.rot ? (r() - 0.5) * 5 * kk : 0;
      [1, 0].forEach(function (sd) { var p = edge(sd, t); s += limb('M' + pt([p[0], p[1] - 2 * kk]) + 'L' + pt([p[0] + lean, p[1] + dep * kk]), dk(col, 0.28), 4.4 * kk) + E(p[0] + lean, p[1] + dep * kk, 5 * kk, 1.4 * kk, FOAM, 0, 0.6); });
      if (o.rails && i > 0) { var pl = edge(0, t); s += limb('M' + pt([pl[0], pl[1]]) + 'L' + pt([pl[0], pl[1] - 12 * kk]), dk(col, 0.1), 2.6 * kk); }
    }
    var deck = '';
    for (var j = 0; j < k; j++) {
      var t0 = Math.pow(j / k, 1.2), t1 = Math.pow((j + 1) / k, 1.2);
      if (o.rot && r() < o.rot && j > 1) continue;
      var a = edge(0, t0), b = edge(1, t0), cq = edge(1, t1), d = edge(0, t1), cc = r() < 0.5 ? col : dk(col, 0.1);
      deck += P(pd([a, b, cq, d], true), cc, 1.2 * wAt(t0));
    }
    var n0 = edge(0, 0), n1 = edge(1, 0);
    s += deck + P(pd([n0, n1, [n1[0], n1[1] + 5], [n0[0], n0[1] + 5]], true), dk(col, 0.3), 1.2);
    if (o.rails) { var rl = 'M' + pt([edge(0, 0.08)[0], edge(0, 0.08)[1] - 11]) + 'L' + pt([edge(0, 1)[0], edge(0, 1)[1] - 12 * wAt(1)]); s += L(rl, OL, 3.4) + L(rl, dk(col, 0.1), 1.6); }
    if (o.sink) {
      var t2 = 1 - o.sink, w0 = edge(0, t2), w1 = edge(1, t2), f0 = edge(0, 1), f1 = edge(1, 1);
      s += F(pd([[w0[0] - 30, w0[1] + 1], [w1[0] + 30, w1[1] + 1], [f1[0] + 30, f1[1] + 20], [f0[0] - 30, f0[1] + 20]], true), o.sea || '#5a7a78', 0.7) + L('M' + pt([w0[0] - 4, w0[1] + 1]) + 'L' + pt([w1[0] + 4, w1[1] + 1]), FOAM, 1.6, 0.8);
    }
    return s;
  }
  // wooden pier seen side-on, running from the shore end (x0, y0) out to sea (x1, y1); th = deck thickness, h = post
  // length down to the water. o: col, step (post spacing), gaps [[xa, xb]] with no planks, sag {x, k} (past x the deck
  // tips down by k per px into the water), rail, sea (water colour over a sunk section), seaTo (y where that water ends)
  function pierSide(c, x0, y0, x1, y1, th, h, o) {
    o = o || {}; var col = o.col || '#8a6a46', r = rng(o.seed || 9), s = '', step = o.step || 16, dir = x1 < x0 ? -1 : 1, len = Math.abs(x1 - x0);
    var base = function (x) { return y0 + (y1 - y0) * (x - x0) / (x1 - x0); };
    var past = function (x) { return o.sag && (x - o.sag.x) * dir > 0; };
    var yAt = function (x) { return base(x) + (past(x) ? Math.abs(x - o.sag.x) * o.sag.k : 0); };
    var kAt = function (x) { return 1 - Math.abs(x - x0) / len * (o.shrink == null ? 0.3 : o.shrink); };
    var gap = function (x) { return (o.gaps || []).some(function (g) { return x > Math.min(g[0], g[1]) && x < Math.max(g[0], g[1]); }); };
    var rail = '';
    for (var i = Math.floor(len / step); i >= 0; i--) {
      var x = x0 + dir * i * step, k = kAt(x), yt = yAt(x), lean = past(x) ? dir * 5 * k : (r() - 0.5) * 2, wl = base(x) + h * k;
      s += limb('M' + pt([x, yt]) + 'L' + pt([x + lean, wl]), dk(col, 0.32), 4.4 * k) + E(x + lean, wl, 5.4 * k, 1.4 * k, FOAM, 0, 0.7);
      if (o.rail && !gap(x) && i > 0) { s += limb('M' + pt([x, yt - th * k * 0.4]) + 'L' + pt([x - dir * 1, yt - th * k * 0.4 - 12 * k]), dk(col, 0.12), 2.4 * k); }
    }
    var deck = '', seam = '';
    for (var xx = x0; (xx - x1) * dir < -0.1; xx += dir * 7) {
      var xb = (xx + dir * 7 - x1) * dir > 0 ? x1 : xx + dir * 7;
      if (gap((xx + xb) / 2)) continue;
      var ka = kAt(xx), kb = kAt(xb), ya = yAt(xx), yb = yAt(xb), cc = r() < 0.5 ? col : dk(col, 0.1);
      deck += P(pd([[xx, ya - th * ka * 0.5], [xb, yb - th * kb * 0.5], [xb, yb + th * kb * 0.1], [xx, ya + th * ka * 0.1]], true), lt(cc, 0.12), 1) + P(pd([[xx, ya + th * ka * 0.1], [xb, yb + th * kb * 0.1], [xb, yb + th * kb * 0.5], [xx, ya + th * ka * 0.5]], true), dk(cc, 0.25), 1);
      if (o.rail) rail += (rail && !gap(xx - dir * 3) ? 'L' : 'M') + pt([xx, ya - th * ka * 0.4 - 11 * ka]);
    }
    if (o.rail && rail) s += L(rail, OL, 3.4) + L(rail, dk(col, 0.05), 1.6);
    s += deck;
    if (o.sag) {
      var sx = o.sag.x, ex = x1, w0 = base(sx) + h * kAt(sx), w1 = base(ex) + h * kAt(ex), to = o.seaTo || w0 + 20;
      s += F(pd([[sx, w0 - 3], [ex - dir * 6, w1 - 3], [ex - dir * 6, to], [sx, to]], true), o.sea || '#5c7c7a', 0.72) + L('M' + pt([sx, w0 - 3]) + 'L' + pt([ex, w1 - 3]), FOAM, 1.4, 0.8);
    }
    return s;
  }
  // an anchor (x, y = crown on the ground, ang = shank direction, 0 is straight up)
  function anchor(c, x, y, s, ang, col) {
    col = col || '#4a4e56'; var q0 = dirQ([x, y], -PI / 2 + (ang || 0)), q = function (u, v) { return q0(u * s, v * s); }, o = '';
    var sh = 'M' + pt(q(0, 0)) + 'L' + pt(q(46, 0)), stock = 'M' + pt(q(38, -12)) + 'L' + pt(q(38, 12)), arms = 'M' + pt(q(14, -24)) + 'Q' + pt(q(-4, -18)) + ' ' + pt(q(0, 0)) + 'Q' + pt(q(-4, 18)) + ' ' + pt(q(14, 24));
    o += limb(arms, col, 4.4 * s) + limb(sh, col, 4.8 * s) + limb(stock, '#6a4a2e', 4 * s);
    o += P(pd([q(10, -26), q(20, -24), q(12, -18)], true), c.cel(col), 1.2 * s) + P(pd([q(10, 26), q(20, 24), q(12, 18)], true), c.cel(col), 1.2 * s);
    o += L(ellD(q(51, 0)[0], q(51, 0)[1], 5 * s, 5 * s), OL, 5 * s) + L(ellD(q(51, 0)[0], q(51, 0)[1], 5 * s, 5 * s), col, 2.6 * s);
    return o + L(sh, lt(col, 0.35), 1.2 * s, 0.6) + E(q(20, 6)[0], q(20, 6)[1], 3 * s, 2 * s, '#8a5a3a', 0, 0.7);
  }
  // broken ship heeled over in the shallows, bow up to the left (x, y = waterline centre)
  function wreck(c, x, y, s, col) {
    col = col || '#5e554c'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    o += limb('M' + pt(q(-4, -40)) + 'L' + pt(q(26, -104)), '#4a4038', 3.6 * s) + P(pd([q(24, -104), q(30, -112), q(27, -102), q(33, -106), q(28, -98)], true), '#4a4038', 1 * s);
    o += limb('M' + pt(q(-6, -80)) + 'L' + pt(q(38, -64)), '#4a4038', 2.2 * s) + P(pd([q(-2, -78), q(34, -65), q(30, -50), q(22, -44), q(16, -54), q(8, -46), q(2, -60)], true), c.cel('#a8a494'), 1.2 * s);
    var hd = 'M' + pt(q(-62, 0)) + 'C' + pt(q(-66, -22)) + ' ' + pt(q(-56, -48)) + ' ' + pt(q(-38, -56)) + 'L' + pt(q(44, -40)) + 'C' + pt(q(56, -30)) + ' ' + pt(q(58, -12)) + ' ' + pt(q(56, 0)) + 'Z';
    var pl = 'M' + pt(q(-60, -16)) + 'C' + pt(q(-30, -22)) + ' ' + pt(q(20, -18)) + ' ' + pt(q(56, -12)) + 'M' + pt(q(-58, -32)) + 'C' + pt(q(-30, -36)) + ' ' + pt(q(20, -32)) + ' ' + pt(q(52, -26)) + 'M' + pt(q(-60, -6)) + 'L' + pt(q(56, -4));
    var hole = 'M' + pt(q(-8, -30)) + 'L' + pt(q(6, -40)) + 'L' + pt(q(26, -34)) + 'L' + pt(q(22, -14)) + 'L' + pt(q(4, -8)) + 'L' + pt(q(-10, -16)) + 'Z';
    o += body(c, hd, col, L(pl, dk(col, 0.4), 1 * s) + F(pd([q(20, -60), q(60, -60), q(60, 4), q(24, 4)], true), dk(col, 0.3), 0.8) + P(hole, '#141412', 1.2 * s) + L('M' + pt(q(0, -36)) + 'L' + pt(q(-2, -12)) + 'M' + pt(q(10, -38)) + 'L' + pt(q(10, -9)) + 'M' + pt(q(20, -35)) + 'L' + pt(q(18, -12)), '#6a6054', 2.4 * s), 1.8 * s);
    o += P(pd([q(-38, -56), q(-30, -60), q(46, -44), q(44, -40)], true), c.cel(lt(col, 0.1)), 1.2 * s);
    return o + barnacles(4211, 12, x - 60 * s, x + 50 * s, y - 10 * s, y - 2 * s, 1.1 * s) + kelp(c, q(-56, -6)[0], q(-56, -6)[1], q(50, -4)[0], q(50, -4)[1], 7, 8 * s, 4212) + L('M' + pt(q(-70, 0)) + 'q' + n(20 * s) + ',' + n(-3 * s) + ' ' + n(40 * s) + ',0 q' + n(40 * s) + ',' + n(-3 * s) + ' ' + n(92 * s) + ',0', FOAM, 1.6 * s, 0.8);
  }
  // a broken rowboat half-buried in the sand, bow to the left (x, y = keel on the ground)
  function rowboat(c, x, y, s, col) {
    col = col || '#6e6456'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.28);
    o += P(pd([q(-30, -12), q(26, -8), q(20, -4), q(-24, -7)], true), '#2a2622', 1.2 * s);
    var hd = 'M' + pt(q(-34, -14)) + 'C' + pt(q(-26, -2)) + ' ' + pt(q(14, 2)) + ' ' + pt(q(30, -6)) + 'L' + pt(q(28, -10)) + 'L' + pt(q(8, -8)) + 'L' + pt(q(4, -2)) + 'L' + pt(q(-2, -8)) + 'L' + pt(q(-24, -8)) + 'Z';
    o += body(c, hd, col, L('M' + pt(q(-30, -9)) + 'C' + pt(q(-20, -3)) + ' ' + pt(q(10, -1)) + ' ' + pt(q(28, -7)), dk(col, 0.4), 1 * s) + F(pd([q(10, -12), q(34, -12), q(34, 4), q(12, 4)], true), dk(col, 0.3), 0.7), 1.6 * s);
    o += limb('M' + pt(q(-4, -8)) + 'L' + pt(q(18, -26)), '#8a7a60', 2 * s) + P(pd([q(15, -24), q(22, -30), q(24, -22), q(18, -20)], true), c.cel('#8a7a60'), 1 * s);
    return o + barnacles(Math.round(x * 5), 6, x - 26 * s, x + 10 * s, y - 6 * s, y - 2 * s, 0.9 * s) + F(pd([q(-38, -1), q(34, -1), q(34, 3), q(-38, 3)], true), '#aea892', 0.9);
  }
  function mastInSea(c, x, y, h, lean, s, col) {
    col = col || '#4a4440'; var tx = x + lean, ty = y - h, cx = x + lean * 0.7, cy = y - h * 0.72;
    return L('M' + pt([tx, ty]) + 'L' + pt([x - 22 * s, y]) + 'M' + pt([tx, ty]) + 'L' + pt([x + 20 * s, y]) + 'M' + pt([cx - 12 * s, cy + 3 * s]) + 'L' + pt([x - 16 * s, y]), col, 0.8 * s, 0.8) +
      limb('M' + pt([x, y]) + 'L' + pt([tx, ty]), col, 2.6 * s) + limb('M' + pt([cx - 14 * s, cy + 3 * s]) + 'L' + pt([cx + 14 * s, cy - 3 * s]), col, 1.8 * s) + P(pd([[tx - 4 * s, ty + 6 * s], [tx + 4 * s, ty + 5 * s], [tx + 3.4 * s, ty + 10 * s], [tx - 3.4 * s, ty + 11 * s]], true), col, 0.9 * s) +
      P(pd([[cx - 10 * s, cy + 2 * s], [cx + 10 * s, cy - 2 * s], [cx + 8 * s, cy + 14 * s], [cx + 2 * s, cy + 10 * s], [cx - 6 * s, cy + 16 * s]], true), '#9a9688', 0.9 * s) + L('M' + pt([x - 8 * s, y]) + 'q' + n(8 * s) + ',' + n(-2 * s) + ' ' + n(16 * s) + ',0', FOAM, 1.2 * s, 0.8);
  }
  // row of carved wave curls (a stone band)
  function waveBand(x0, x1, y, h, col) {
    var d = '';
    for (var x = x0 + h * 0.2; x < x1 - h * 1.6; x += h * 2.2) d += 'M' + pt([x, y + h * 0.8]) + 'C' + pt([x, y - h]) + ' ' + pt([x + h * 2, y - h]) + ' ' + pt([x + h * 2, y]) + 'C' + pt([x + h * 2, y + h * 0.7]) + ' ' + pt([x + h * 1.1, y + h * 0.7]) + ' ' + pt([x + h, y + h * 0.1]);
    return L(d, col, Math.max(0.8, h * 0.35));
  }
  function mirror(x) { return 'matrix(-1,0,0,1,' + n(2 * x) + ',0)'; }
  // serpent head facing left (x, y = back of the head); eye glows when eye is set
  function serpentHead(c, x, y, s, col, eye) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    o += P(pd([q(-2, -4), q(4, -16), q(6, -7), q(12, -18), q(12, -5), q(18, -12), q(14, 2)], true), c.cel(dk(col, 0.1)), 1.2 * s);
    o += P(pd([q(-4, 6), q(-24, 8), q(-28, 12), q(-20, 13), q(-2, 11)], true), c.cel(dk(col, 0.15)), 1.3 * s);
    var hd = 'M' + pt(q(6, 2)) + 'C' + pt(q(6, -10)) + ' ' + pt(q(-6, -12)) + ' ' + pt(q(-14, -8)) + 'L' + pt(q(-28, -3)) + 'L' + pt(q(-28, 3)) + 'L' + pt(q(-14, 5)) + 'L' + pt(q(0, 7)) + 'C' + pt(q(4, 7)) + ' ' + pt(q(6, 5)) + ' ' + pt(q(6, 2)) + 'Z';
    o += body(c, hd, col, F(pd([q(-4, -14), q(8, -14), q(8, 8), q(-2, 8)], true), dk(col, 0.3), 0.8) + L('M' + pt(q(-24, 0)) + 'L' + pt(q(-10, 1)), dk(col, 0.4), 0.9 * s), 1.6 * s);
    o += P(pd([q(-26, 3), q(-24, 9), q(-22, 3.4)], true), '#f6f0dc', 0.7 * s) + P(pd([q(-17, 4.4), q(-15.6, 10), q(-14, 4.6)], true), '#f6f0dc', 0.7 * s);
    return o + (eye ? glowEye(c, q(-10, -4)[0], q(-10, -4)[1], 1.6 * s, eye) : C(q(-10, -4)[0], q(-10, -4)[1], 1.8 * s, OL));
  }
  // stone idol of the sea loa: a pillar with a serpent wound round it, its fanged head on top (x, y = base)
  function serpentIdol(c, x, y, s, col, eye) {
    col = col || TST; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 17 * s, 3 * s, '#000', 0, 0.3), sc = mix(col, '#5a8a7a', 0.35);
    o += stoneFace(c, x - 13 * s, y, 26 * s, 10 * s, dk(col, 0.1), 5 * s) + waveBand(x - 12 * s, x + 12 * s, y - 5 * s, 2.2 * s, lt(col, 0.2));
    o += stoneFace(c, x - 8 * s, y - 10 * s, 16 * s, 42 * s, col, 11 * s);
    [[-16, -40], [-30, -54]].forEach(function (b, i) {
      var T = taper([q(-10, b[0] + 4), q(-2, b[0] - 1), q(6, b[0] - 5), q(10, b[0] - 9)], 7 * s, 6 * s, 4);
      o += body(c, T.d, sc, L(bands(T, 2, 1), dk(sc, 0.35), 0.8 * s) + F(ribbonBand(T, 0.6, 1), dk(sc, 0.25), 0.8), 1.4 * s);
      if (i === 0) o += P(pd([q(-2, b[0] - 5), q(2, b[0] - 11), q(4, b[0] - 5)], true), c.cel(sc), 0.9 * s);
    });
    var neck = taper([q(8, -44), q(8, -52), q(2, -58), q(-2, -60)], 7 * s, 7 * s, 4);
    o += body(c, neck.d, sc, L(bands(neck, 2, 1), dk(sc, 0.35), 0.8 * s), 1.4 * s) + serpentHead(c, x + 1 * s, y - 60 * s, 0.9 * s, sc, eye);
    return o + barnacles(Math.round(x * 3 + y), 8, x - 12 * s, x + 12 * s, y - 16 * s, y - 2 * s, 0.9 * s) + kelp(c, x - 7 * s, y - 38 * s, x + 6 * s, y - 34 * s, 3, 10 * s, Math.round(x + y), KELP, 3 * s);
  }
  // drowned troll hut: a round stone dome with a broken crown, crusted with barnacles and hung with kelp (x, y = base)
  function drownedHut(c, x, y, s, col) {
    col = col || '#86908a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 32 * s, 4 * s, '#000', 0, 0.3);
    var d = 'M' + pt(q(-28, 0)) + 'L' + pt(q(-28, -18)) + 'C' + pt(q(-28, -38)) + ' ' + pt(q(-16, -46)) + ' ' + pt(q(-6, -47)) + 'L' + pt(q(-2, -40)) + 'L' + pt(q(4, -46)) + 'L' + pt(q(8, -38)) + 'L' + pt(q(12, -45)) + 'C' + pt(q(24, -40)) + ' ' + pt(q(28, -30)) + ' ' + pt(q(28, -18)) + 'L' + pt(q(28, 0)) + 'Z';
    var co = ''; for (var i = 1; i < 6; i++) co += 'M' + pt(q(-28, -i * 7)) + 'C' + pt(q(-14, -i * 7 - 2)) + ' ' + pt(q(14, -i * 7 - 2)) + ' ' + pt(q(28, -i * 7));
    o += body(c, d, col, L(co, dk(col, 0.3), 0.9 * s, 0.85) + F(pd([q(8, -50), q(32, -50), q(32, 2), q(12, 2)], true), dk(col, 0.28), 0.8) + waveBand(x - 26 * s, x + 26 * s, y - 24 * s, 2.4 * s, lt(col, 0.2)), 1.8 * s);
    o += F(pd([q(-6, -47), q(-2, -40), q(4, -46), q(8, -38), q(12, -45), q(10, -36), q(-4, -36)], true), '#1a1a1a', 0.85);
    o += P(arched(x - 4 * s, y, 14 * s, 20 * s), '#141414', 1.3 * s) + L('M' + pt(q(-12, -20)) + 'L' + pt(q(4, -20)), lt(col, 0.1), 1.6 * s);
    return o + kelp(c, x - 26 * s, y - 32 * s, x + 26 * s, y - 32 * s, 6, 14 * s, Math.round(x * 5), KELP, 3.6 * s) + barnacles(Math.round(x * 7 + 3), 14, x - 26 * s, x + 26 * s, y - 12 * s, y - 2 * s, 1.1 * s);
  }
  // tide pool: rocky rim, clear turquoise water, a starfish and an anemone
  function tidePool(c, x, y, rx, ry, seed) {
    var r = rng(seed || 3), o = E(x, y + ry * 0.3, rx + 7, ry + 4, dk(ROCK, 0.1), 1.6);
    o += E(x, y, rx, ry, c.lg([[0, '#1e7a84'], [0.6, '#38b8b0'], [1, '#6ad8c8']]), 1.2) + E(x - rx * 0.3, y - ry * 0.35, rx * 0.4, ry * 0.2, '#e8fff8', 0, 0.3);
    o += starfish(c, x + rx * 0.35, y + ry * 0.1, 0.8 * ry / 8, CORALO) + anemone(c, x - rx * 0.45, y + ry * 0.35, 0.7 * ry / 8, '#c870b8');
    for (var i = 0; i < 6; i++) { var a = PI * (0.9 + r() * 1.2), rr = 3 + r() * 4; o += blackRock(c, x + Math.cos(a) * (rx + 2), y + Math.sin(a) * (ry + 2) * 0.6 + 2, rr * 2, rr * 1.2, seed + i, '#3e3c44'); }
    return o;
  }
  // siren nest on a ledge: woven kelp, bones, fin-feathers and pearly eggs
  function sirenNest(c, x, y, s) {
    var o = E(x, y + 2 * s, 26 * s, 5 * s, '#000', 0, 0.3);
    o += E(x, y - 2 * s, 22 * s, 8 * s, c.cel('#4a5a30'), 1.6 * s) + E(x, y - 3.6 * s, 16 * s, 4.4 * s, '#1e2414');
    [[-8, -5, '#e8eef0'], [0, -7, '#d8e8ec'], [8, -5, '#eef4f4']].forEach(function (e) { o += E(x + e[0] * s, y + e[1] * s, 4.2 * s, 5.2 * s, c.cel(e[2]), 1.1 * s) + E(x + e[0] * s - 1.4 * s, y + e[1] * s - 1.8 * s, 1.2 * s, 1.8 * s, '#ffffff', 0, 0.7); });
    o += P('M' + pt([x - 22 * s, y - 2 * s]) + 'C' + pt([x - 18 * s, y + 6 * s]) + ' ' + pt([x + 18 * s, y + 6 * s]) + ' ' + pt([x + 22 * s, y - 2 * s]) + 'C' + pt([x + 14 * s, y + 1 * s]) + ' ' + pt([x - 14 * s, y + 1 * s]) + ' ' + pt([x - 22 * s, y - 2 * s]) + 'Z', c.cel(KELP), 1.3 * s);
    o += bone(x + 14 * s, y - 1 * s, 16 * s, -0.5, 0.7 * s) + bone(x - 16 * s, y, 12 * s, 0.4, 0.6 * s);
    o += P(pd([[x + 20 * s, y - 4 * s], [x + 30 * s, y - 14 * s], [x + 26 * s, y - 3 * s]], true), c.cel('#3ab8b0'), 0.9 * s) + P(pd([[x - 20 * s, y - 3 * s], [x - 30 * s, y - 10 * s], [x - 24 * s, y - 1 * s]], true), c.cel('#2a8aa0'), 0.9 * s);
    return o;
  }
  // stalactites hanging from the roof line y
  function stalactites(c, seed, x0, x1, y, h0, h1, col) {
    var r = rng(seed), o = '';
    for (var x = x0; x < x1;) { var w = 6 + r() * 12, h = h0 + r() * (h1 - h0); o += P(pd([[x, y - 2], [x + w, y - 2], [x + w * 0.55, y + h]], true), c.cel(col), 1.2) + F(pd([[x + w * 0.55, y - 2], [x + w, y - 2], [x + w * 0.55, y + h]], true), dk(col, 0.3), 0.8); x += w + r() * 18; }
    return o;
  }
  // the temple of Shal'zua: huge stepped tiers and a central stair out of the surf, serpent idols, a dark shrine (x = centre, y = base)
  function templeSteps(c, x, y, s) {
    var col = '#7a8884', o = E(x, y + 3, 170 * s, 8 * s, '#000', 0, 0.25), by = y;
    [[160, 24], [128, 24], [100, 22], [76, 20]].forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s, cc = i % 2 ? col : lt(col, 0.05);
      o += stoneFace(c, x - hw, by, hw * 2, th, cc, 12 * s) + waveBand(x - hw + 4, x + hw - 4, by - th * 0.5, 2.6 * s, dk(cc, 0.35));
      if (i < 2) o += barnacles(4300 + i, 26, x - hw, x + hw, by - th * 0.5, by - 2, 1.2 * s) + kelp(c, x - hw + 4, by - th, x + hw - 4, by - th, 12, 12 * s, 4310 + i, KELP, 3.4 * s);
      by -= th;
    });
    var sw0 = 46 * s, sw1 = 24 * s, top = y - 90 * s, st = '';
    o += P(pd([[x - sw0, y], [x - sw1, top], [x + sw1, top], [x + sw0, y]], true), c.cel(lt(col, 0.14)), 1.8 * s);
    for (var j = 1; j < 15; j++) { var t = j / 15, yy = y - (y - top) * t, hw2 = sw0 + (sw1 - sw0) * t; st += 'M' + pt([x - hw2, yy]) + 'L' + pt([x + hw2, yy]); }
    o += L(st, dk(col, 0.38), 1.1 * s) + F(pd([[x + sw1 * 0.35, top], [x + sw1, top], [x + sw0, y], [x + sw0 * 0.35, y]], true), dk(col, 0.2), 0.6);
    o += barnacles(4320, 16, x - sw0, x + sw0, y - 16 * s, y - 2, 1.1 * s);
    // shrine on the top tier, a serpent face over a dark door glowing teal
    var sy = top;
    o += stoneFace(c, x - 34 * s, sy, 68 * s, 30 * s, col, 10 * s) + P(pd([[x - 42 * s, sy - 30 * s], [x + 42 * s, sy - 30 * s], [x + 36 * s, sy - 40 * s], [x - 36 * s, sy - 40 * s]], true), c.cel(dk(col, 0.05)), 1.6 * s);
    o += C(x, sy - 12 * s, 26 * s, glow(c, DEYE, 0.5)) + P(arched(x, sy, 18 * s, 24 * s), '#08141a', 1.6 * s) + P(arched(x, sy, 12 * s, 18 * s), c.lg([[0, DEYE, 0.7], [1, '#1a6a80', 0.3]]), 0);
    o += serpentHead(c, x - 12 * s, sy - 34 * s, 1.1 * s, lt(col, 0.1), DEYE) + G(serpentHead(c, x + 12 * s, sy - 34 * s, 1.1 * s, lt(col, 0.1), DEYE), mirror(x + 12 * s));
    o += serpentIdol(c, x - sw0 - 14 * s, y, 0.95 * s, col, DEYE) + G(serpentIdol(c, x + sw0 + 14 * s, y, 0.95 * s, col, DEYE), mirror(x + sw0 + 14 * s));
    return o;
  }
  // waves breaking against a base line: spray blobs and foam
  function surf(c, x, y, w, s, seed) {
    var r = rng(seed || 5), o = '';
    for (var i = 0; i < 7; i++) { var bx = x - w / 2 + r() * w, br = (5 + r() * 7) * s; o += C(bx, y - br * 0.6, br, FOAM, 0, 0.55 + r() * 0.3); }
    return o + L('M' + pt([x - w / 2, y]) + 'q' + n(w / 4) + ',' + n(-5 * s) + ' ' + n(w / 2) + ',0 q' + n(w / 4) + ',' + n(-5 * s) + ' ' + n(w / 2) + ',0', FOAM, 2 * s, 0.9) + motes(seed + 1, 10, x - w / 2, x + w / 2, y - 20 * s, y - 2, '#ffffff');
  }

  // ============================================================
  //  SCENES (floor line at y 116-126; the back row stands on open ground right of centre)
  // ============================================================
  var SCENES = {
    bloodtide_landing: function (c) {
      var o = stormSky(c, 3101, { bx: 300, by: 60, rainX: 60 });
      o += farIsle(3102, 170, 280, 104, 14, '#3a4a58', 2) + farIsle(3103, 330, 430, 104, 10, '#44545e', 1);
      o += sea(c, 104, 156, 3104, { gx: 300 });
      o += blackRock(c, 222, 110, 26, 18, 3105, '#2e2c34', true) + blackRock(c, 16, 112, 34, 16, 3113, '#2e2c34', true);
      o += longship(c, 106, 121, 0.8);
      o += beach(c, 152, 118, 3106);
      o += pierSide(c, 200, 134, 24, 126, 6, 12, { seed: 3107, step: 18 });
      o += tiki(c, 30, 124, 0.62) + barrel(c, 150, 128, 0.62, '#6a4a2e') + crate(c, 136, 129, 0.55) + L('M60,122 C70,118 84,116 92,112', OL, 1.6) + L('M60,122 C70,118 84,116 92,112', '#b8a070', 0.8);
      o += stiltHut(c, 250, 122, 0.7, { cloth: HBLK }) + stiltHut(c, 372, 128, 1.02);
      o += flag(c, 292, 124, 52, 0.85, HBLK, HRED, hordeMarkRed) + poleBanner(c, 330, 122, 50, 0.8, FPURP, FTRIM, emForsaken);
      o += flag(c, 214, 150, 64, 1.05, HRED, HBLK, hordeMark);
      o += brazier(c, 316, 130, 0.75) + brazier(c, 236, 154, 0.95);
      o += crate(c, 176, 162, 1.05, '#8a6a40') + crate(c, 190, 157, 0.8, '#7a5a36') + barrel(c, 160, 168, 1);
      o += pebbles(3108, 150, 236, '#b8a070', 20) + shells(c, 3109, 12, 20, 380, 170, 236);
      o += driftwood(c, 170, 214, 52, -0.06, 0.9) + kelpTuft(c, 224, 226, 0.9);
      o += palm(c, 404, 226, 1.05, -30, '#5a9a3a', 3111) + leafClump(c, 4, 244, 1.1, LEAF) + fern(c, 30, 246, 0.9, '#3a7a36');
      return o + motes(3112, 16, 0, 400, 20, 200, '#fff4d0') + vignette(c, '#fff4d8', '#0a1014');
    },
    coralbone_beach: function (c) {
      var o = stormSky(c, 3201, { bx: 110, by: 56, rainX: 330 });
      o += farIsle(3202, -30, 80, 104, 12, '#3a4a58', 1) + farIsle(3203, 250, 330, 104, 8, '#44545e', 1);
      o += sea(c, 104, 126, 3204, { gx: 110 });
      o += blackRock(c, 350, 112, 40, 30, 3205, '#2e2c34', true) + blackRock(c, 380, 116, 22, 14, 3206, '#38363e', true);
      o += beach(c, 126, 120, 3207, '#eed8b4');
      o += beastSkull(c, 392, 124, 0.62);
      o += ribcage(c, 56, 138, 1.0);
      o += coral(c, 226, 130, 1, CORAL, 3208) + brainCoral(c, 256, 132, 0.8) + fanCoral(c, 206, 130, 0.8) + coral(c, 318, 126, 0.75, CORALO, 3209) + coral(c, 184, 136, 0.7, '#e85a7a', 3210);
      o += blackRock(c, 150, 142, 30, 16, 3211, ROCK) + barnacles(3212, 8, 140, 160, 132, 140, 1);
      o += pebbles(3213, 140, 236, '#c8a88a', 18) + shells(c, 3214, 14, 10, 390, 150, 236);
      o += bone(210, 190, 30, 0.2, 1.6) + bone(120, 212, 22, -0.5, 1.3) + skull(c, 96, 224, 1.3);
      o += coral(c, 170, 226, 1.6, CORAL, 3215) + fanCoral(c, 206, 234, 1.3, '#c060a8') + brainCoral(c, 138, 238, 1.2, CORALO) + coral(c, 396, 236, 1.3, '#e85a7a', 3216);
      o += palm(c, 6, 232, 1.15, 30, PALM, 3217);
      return o + motes(3218, 14, 0, 400, 20, 200, '#fff4d0') + vignette(c, '#fff4d8', '#0a1014');
    },
    sunken_pier: function (c) {
      var o = sky(c, '#545e64', '#8a9696', '#c2c8c0') + C(250, 54, 70, glow(c, '#f4f4e4', 0.35)) + overcast(c, 3301, 18, '#6a7476', 7, 1.4) + overcast(c, 3302, 46, '#8a9494', 6, 1);
      o += farIsle(3303, -20, 110, 104, 10, '#6a7878', 0) + mastInSea(c, 176, 104, 34, 6, 0.7, '#6a7070') + mastInSea(c, 250, 106, 24, -8, 0.55, '#747a7a');
      o += sea(c, 104, 136, 3304, { far: '#4e6a6e', mid: '#5c7c7a', near: '#6e8e86', line: '#b8c8c0' });
      o += mist(c, 104, 22, '#dfe4de', 0.6, 3305);
      o += wreck(c, 356, 118, 0.86);
      o += beach(c, 134, 124, 3306, '#aea892', { wet: '#86826e', surf: '#c8d4ce' });
      o += pierSide(c, 222, 132, -8, 110, 8, 16, { seed: 3307, step: 17, gaps: [[130, 146], [84, 93]], sag: { x: 66, k: 0.3 }, rail: true, col: '#7e7466', sea: '#5c7c7a', seaTo: 133, shrink: 0.4 });
      o += limb('M196,126 L198,96', '#5a5248', 3) + L('M192,98 L206,98', OL, 2.6) + E(203, 104, 4.4, 5.4, c.cel('#5a5a44'), 1.3) + C(203, 104, 13, glow(c, DEYE, 0.4)) + E(203, 104, 2.2, 3, DEYE, 0, 0.85);
      o += barrel(c, 236, 150, 0.9, '#6a5a44') + G(barrel(c, 256, 148, 0.8, '#5e5040'), 'rotate(80,256,148)') + crate(c, 280, 146, 0.8, '#7a6a52') + barrel(c, 110, 118, 0.6, '#5e5040');
      o += rowboat(c, 96, 176, 1.1) + E(170, 188, 26, 4, '#6e8e86', 0, 0.45) + E(330, 206, 34, 5, '#6e8e86', 0, 0.4) + driftwood(c, 300, 168, 40, 0.1, 0.8);
      o += anchor(c, 202, 232, 0.9, 0.5) + kelpTuft(c, 150, 226, 1, '#5a6a3a') + kelpTuft(c, 382, 232, 1.1, '#5a6a3a');
      o += pebbles(3308, 150, 236, '#7e7a6a', 22) + shells(c, 3309, 8, 20, 380, 170, 236);
      o += L('M232,196 C250,190 262,200 280,194 C290,190 296,196 300,200', OL, 3.4) + L('M232,196 C250,190 262,200 280,194 C290,190 296,196 300,200', '#a89a78', 1.6);
      o += mist(c, 150, 36, '#d8dcd6', 0.34, 3310) + mist(c, 204, 30, '#d8dcd6', 0.18, 3311);
      return o + vignette(c, '#f0f2ee', '#0e1214');
    },
    screaming_grotto: function (c) {
      var W0 = '#262a34', o = R(0, 0, 400, 240, c.lg([[0, '#10141c'], [1, '#262e38']]));
      // a ragged cave mouth open to the storm and the sea
      var mouth = 'M122,128 L120,106 C112,88 124,66 138,54 L146,40 C160,30 182,22 202,26 L214,20 C236,24 256,38 268,54 L282,70 C292,88 286,108 292,128 Z', mid = c.clip(mouth);
      o += '<g clip-path="url(#' + mid + ')">' + sky(c, '#2a3444', '#6a8290', '#e0d4a0') + C(236, 70, 70, glow(c, '#fff0c0', 0.5)) + overcast(c, 3401, 40, '#2a3240', 5, 1.1) + farIsle(3402, 140, 230, 100, 10, '#3a4a58', 1) + sea(c, 100, 130, 3403, { gx: 236 }) + blackRock(c, 262, 106, 20, 22, 3404, '#2a2830', true) + '</g>';
      o += L(mouth, OL, 3);
      o += P('M-4,-4 L404,-4 L404,132 L292,128 C286,108 292,88 282,70 L268,54 C256,38 236,24 214,20 L202,26 C182,22 160,30 146,40 L138,54 C124,66 112,88 120,106 L122,128 L-4,132 Z', c.lg([[0, '#1e222c'], [0.7, '#343a46'], [1, '#2a2e38']]), 2);
      o += L('M130,112 C126,90 136,68 150,52 M280,104 C284,86 276,66 262,50', '#6a8a94', 2, 0.7) + L('M40,30 C60,60 70,90 64,120 M340,20 C330,60 344,90 336,124 M100,20 C110,40 104,60 112,80 M300,30 C290,50 300,70 296,90', '#4a5260', 1.6, 0.7);
      o += C(206, 90, 120, glow(c, '#6ad8e0', 0.2));
      // floor: wet rock ledges, a light spill from the mouth, sea water running in to a pool on the left
      o += body(c, 'M-4,126 C60,122 140,130 206,127 C270,124 340,121 404,123 L404,242 L-4,242 Z', '#444a56', R(-4, 118, 408, 124, c.lg([[0, '#6a7482', 0.5], [1, '#141820', 0.9]])), 1.8);
      o += F('M128,128 L290,128 L360,242 L60,242 Z', c.lg([[0, '#c8f4ee', 0.22], [1, '#c8f4ee', 0]]));
      o += L('M20,150 C60,146 90,152 120,148 M240,146 C280,142 320,148 380,144 M30,190 C80,184 120,194 160,188 M250,196 C300,190 340,198 390,192', '#6a7684', 1.4, 0.7);
      var pool = 'M132,128 L196,128 C194,134 186,138 178,142 C196,146 196,160 150,164 C100,168 60,162 64,152 C68,144 110,142 128,136 Z';
      o += P(pool, c.lg([[0, '#3ab4b8'], [1, '#155a6a']]), 1.6) + E(140, 150, 36, 3, '#e8f4e0', 0, 0.25) + L('M86,154 q10,-2 20,0 M140,158 q12,-2 24,0 M150,134 q8,-1.6 16,0', SEAL, 1, 0.6);
      o += blackRock(c, 66, 160, 22, 10, 3410, '#30343e') + blackRock(c, 186, 158, 18, 8, 3411, '#30343e') + blackRock(c, 118, 168, 16, 6, 3412, '#30343e');
      // a natural rock arch in the middle distance on the left and a spire on the right
      o += body(c, 'M20,130 C22,90 40,60 70,54 C100,50 118,70 122,96 L124,132 L108,132 C106,104 96,82 78,82 C58,84 50,104 48,132 Z', W0, F('M92,52 L130,52 L130,134 L108,134 C106,104 100,84 92,52 Z', '#000', 0.3) + L('M36,110 C40,86 54,70 70,66', '#5e6a78', 1.6, 0.8) + barnacles(3413, 8, 24, 48, 110, 128, 1, '#8a9aa0'), 2);
      o += body(c, 'M318,128 C316,96 322,70 332,56 C340,70 350,96 350,128 Z', W0, F('M336,54 L356,54 L356,130 L340,130 Z', '#000', 0.3) + L('M324,112 C324,94 328,80 332,68', '#5e6a78', 1.4, 0.8), 2);
      o += P('M292,130 L298,108 L304,130 Z', c.cel('#30343e'), 1.4) + P('M362,128 L370,98 L378,128 Z', c.cel('#30343e'), 1.4) + P('M12,134 L20,110 L28,134 Z', c.cel('#30343e'), 1.4);
      o += sirenNest(c, 78, 50, 0.8) + sirenNest(c, 334, 54, 0.7) + sirenNest(c, 262, 130, 0.62);
      o += stalactites(c, 3405, -4, 404, 0, 10, 34, '#2a2e38') + kelp(c, 160, 26, 196, 24, 4, 20, 3414, '#3a5a3a', 3) + kelp(c, 230, 22, 262, 30, 3, 18, 3415, '#3a5a3a', 3);
      o += bone(250, 178, 24, 0.3, 1.2) + skull(c, 272, 182, 1) + bone(120, 204, 20, -0.4, 1.1) + sirenNest(c, 206, 232, 1.1);
      o += barnacles(3408, 14, 0, 400, 172, 236, 1.1, '#6a7a80') + kelpTuft(c, 380, 230, 1, '#3a5a3a') + kelpTuft(c, 16, 226, 1.1, '#3a5a3a');
      var gl = ''; [[46, 70], [60, 100], [352, 70], [366, 110], [300, 40], [104, 36], [130, 160], [240, 140]].forEach(function (p) { gl += C(p[0], p[1], 7, glow(c, '#6af4e8', 0.6)) + C(p[0], p[1], 1.4, '#c8fff8'); });
      o += gl + blackRock(c, 40, 240, 70, 30, 3416, '#262a32') + barnacles(3417, 8, 16, 60, 222, 236, 1, '#6a7a80') + blackRock(c, 370, 244, 64, 26, 3418, '#262a32');
      o += P(pd([[150, 196], [160, 186], [158, 198]], true), c.cel('#3ab8b0'), 0.9) + P(pd([[300, 212], [312, 204], [308, 216]], true), c.cel('#2a8aa0'), 0.9);
      o += P('M-4,-4 L40,-4 C24,40 20,90 30,140 C36,180 22,214 18,244 L-4,244 Z', '#161a22', 2) + P('M404,-4 L360,-4 C378,40 382,96 372,140 C366,180 380,214 384,244 L404,244 Z', '#161a22', 2);
      return o + motes(3409, 26, 0, 400, 20, 220, '#7aeaea') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.45]]));
    },
    loas_rest: function (c) {
      var o = stormSky(c, 3501, { bx: 90, by: 54, rainX: 300, c1: '#20283a', c2: '#384658' });
      o += F('M300,104 L308,90 L326,90 L330,80 L350,80 L354,70 L372,70 L376,80 L396,80 L400,90 L418,90 L420,104 Z', '#3e4c5a') + C(364, 64, 10, glow(c, DEYE, 0.5));
      o += sea(c, 104, 124, 3502, { gx: 90 });
      o += beach(c, 124, 118, 3503, '#c4bca0', { wet: '#8e8a74' });
      o += drownedHut(c, 330, 118, 0.48) + drownedHut(c, 270, 120, 0.62) + drownedHut(c, 54, 128, 0.95);
      o += shrine(c, 214, 124, 0.8);
      o += serpentIdol(c, 150, 130, 1.02, TST, DEYE) + G(serpentIdol(c, 370, 122, 0.84, TST, DEYE), mirror(370));
      o += tPillarB(c, 106, 132, 18, 40, '#80908a', 3504);
      o += coral(c, 126, 136, 0.7, CORAL, 3506) + brainCoral(c, 250, 128, 0.6) + kelpTuft(c, 312, 126, 0.7) + kelpTuft(c, 86, 138, 0.8);
      o += E(300, 170, 34, 5, '#4a8a8a', 0, 0.35) + E(80, 214, 30, 5, '#4a8a8a', 0, 0.3);
      o += tidePool(c, 170, 198, 46, 12, 3507) + tidePool(c, 250, 228, 32, 8, 3508);
      o += pebbles(3509, 140, 236, '#8a8672', 20) + shells(c, 3510, 10, 10, 390, 150, 236);
      o += blackRock(c, 20, 236, 40, 22, 3511, ROCK) + barnacles(3512, 10, 6, 34, 222, 234, 1.1) + coral(c, 392, 240, 1.2, CORAL, 3513);
      return o + motes(3514, 18, 0, 400, 30, 210, '#9af0e8') + vignette(c, '#e8f4f0', '#0a1014');
    },
    temple_steps: function (c) {
      var o = stormSky(c, 3601, { bx: 200, by: 30, rainX: 340, shaftY: 110 });
      o += sea(c, 104, 138, 3602, { gx: 200 });
      o += templeSteps(c, 200, 128, 0.86);
      o += surf(c, 60, 128, 70, 1, 3603) + surf(c, 340, 128, 70, 1, 3604);
      o += beach(c, 138, 134, 3605, '#dccca0');
      // a stone causeway from the foot of the stair across the shallows to the sand
      var cw = 'M166,127 L234,127 L300,244 L100,244 Z', jn = '';
      for (var j = 0; j < 6; j++) { var t = Math.pow((j + 1) / 7, 1.3), yy = 127 + 117 * t, hw = 34 + 66 * t; jn += 'M' + pt([200 - hw, yy]) + 'L' + pt([200 + hw, yy]); }
      for (var k = -2; k <= 2; k++) jn += 'M' + pt([200 + k * 13, 127]) + 'L' + pt([200 + k * 38, 244]);
      o += body(c, cw, '#8e9892', F('M200,127 L234,127 L300,244 L200,244 Z', '#000', 0.12) + L(jn, '#4e5854', 1.2, 0.85) + E(186, 196, 22, 4, '#3a7a80', 0, 0.45) + E(214, 158, 14, 2.6, '#3a7a80', 0, 0.4), 1.8);
      o += L('M150,138 q8,-3 16,0 M234,136 q8,-3 16,0', FOAM, 1.6, 0.8) + barnacles(3606, 14, 150, 250, 128, 150, 0.9) + kelp(c, 168, 129, 232, 129, 6, 12, 3607, KELP, 2.6);
      // Krugar guard post at the foot of the steps
      o += flag(c, 332, 196, 84, 1.25, HRED, HBLK, hordeMark) + brazier(c, 296, 196, 1.2);
      o += palisade(c, 344, 404, 206, 26, '#7a5634', 3608, true) + crate(c, 372, 212, 1) + barrel(c, 354, 214, 0.9) + tiki(c, 270, 168, 0.8) + tiki(c, 126, 168, 0.8);
      o += coral(c, 30, 236, 1.2, CORAL, 3609) + kelpTuft(c, 60, 212, 0.9) + shells(c, 3610, 8, 10, 390, 160, 236);
      return o + motes(3611, 20, 0, 400, 20, 210, '#fff4d0') + vignette(c, '#fff4d8', '#0a1014');
    }
  };
  // a small stepped shrine to Shal'zua with a carved troll face and offerings (x = centre, y = base)
  function shrine(c, x, y, s) {
    var col = '#86948e', o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.3);
    o += stoneFace(c, x - 30 * s, y, 60 * s, 10 * s, dk(col, 0.08), 5 * s) + stoneFace(c, x - 22 * s, y - 10 * s, 44 * s, 10 * s, col, 5 * s) + waveBand(x - 28 * s, x + 28 * s, y - 5 * s, 2.2 * s, lt(col, 0.2));
    o += carvedFace(c, x, y - 36 * s, 0.62 * s, lt(col, 0.05)) + C(x, y - 36 * s, 22 * s, glow(c, DEYE, 0.25));
    o += shell(c, x - 16 * s, y - 20 * s, 0.9 * s) + shell(c, x + 16 * s, y - 20 * s, 0.9 * s, '#e8b8a8') + conch(c, x + 24 * s, y - 20 * s, 0.4 * s);
    return o + barnacles(Math.round(x * 3), 10, x - 28 * s, x + 28 * s, y - 8 * s, y - 1, 0.9 * s) + kelp(c, x - 20 * s, y - 51 * s, x + 20 * s, y - 51 * s, 4, 14 * s, Math.round(x), KELP, 3 * s);
  }
  // a barnacled troll pillar, broken off (x, y = base left)
  function tPillarB(c, x, y, w, h, col, seed) {
    var r = rng(seed || 9), top = [[0, 4 + r() * 6], [w * 0.3, -2], [w * 0.55, 6 + r() * 6], [w * 0.8, 1], [w, 8]];
    return E(x + w / 2, y + 2, w * 0.8, 3, '#000', 0, 0.25) + stoneFace(c, x, y, w, h, col, 12, top) + waveBand(x + 1, x + w - 1, y - h * 0.55, 2, dk(col, 0.4)) + barnacles(seed + 1, 8, x, x + w, y - 12, y - 2, 1) + kelp(c, x + 2, y - h + 8, x + w - 2, y - h + 6, 3, 12, seed + 2, KELP, 3);
  }
  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- biped rig (facing left; shared copy of art_plaguelands.js, with the digitigrade legs of art_stranglethorn.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function clawHand(p, col, k, clawCol) {
    k = k || 1;
    var d = 'M' + pt([p[0] - 3 * k, p[1] + 2 * k]) + 'q' + n(-5 * k) + ',' + n(2 * k) + ' ' + n(-6 * k) + ',' + n(7 * k) + 'M' + pt([p[0] - 1 * k, p[1] + 4 * k]) + 'q' + n(-3 * k) + ',' + n(3 * k) + ' ' + n(-3 * k) + ',' + n(8 * k) + 'M' + pt([p[0] + 2 * k, p[1] + 4 * k]) + 'q' + n(-1 * k) + ',' + n(4 * k) + ' ' + n(0) + ',' + n(8 * k);
    return C(p[0], p[1], 5 * k, c_(col), 2) + L(d, OL, 3.6 * k) + L(d, clawCol || '#f0e8d8', 1.6 * k);
  }
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    if (o.shadow !== false) s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.forearm || sleeve, armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86, toe = o.feet || boot;
    if (!o.noLegs) {
      var kneeF = o.legF || (o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113');
      var kneeN = o.legN || (o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113');
      var fF = o.footF || [73, 121], fN = o.footN || [52, 121];
      s += limb(kneeF, dk(pants, 0.18), legW) + toe(fF[0], fF[1], o.boots || dk(pants, 0.3));
      s += limb(kneeN, pants, legW) + toe(fN[0], fN[1], o.boots || dk(pants, 0.3));
      if (o.shins) s += o.shins(c);
    }
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L96,40 L96,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#b9b1a0', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 3, hy + 8, 10, 8, c.cel(o.neckCol || sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.forearm || sleeve, armW - 1);
    s += (o.nearHand ? o.nearHand(c, near[near.length - 1]) : hand(near[near.length - 1], c.cel(o.glove || sk)));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf, o.op) : (o.op != null ? G(s, '', o.op) : s);
  }
  function drop(x, y, s) { s = s || 1; return P('M' + pt([x, y - 3 * s]) + 'C' + pt([x + 2 * s, y]) + ' ' + pt([x + 1.6 * s, y + 2 * s]) + ' ' + pt([x, y + 2 * s]) + 'C' + pt([x - 1.6 * s, y + 2 * s]) + ' ' + pt([x - 2 * s, y]) + ' ' + pt([x, y - 3 * s]) + 'Z', DRIP, 0.6 * s); }
  function drops(list) { return list.map(function (p) { return drop(p[0], p[1], p[2] || 1); }).join(''); }
  // a little pink coral growth, the Wavebreaker mark (x, y = root)
  function coralSprig(c, x, y, k, col) {
    col = col || CORAL; k = k || 1;
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 3 * k, y - 9 * k]) + 'L' + pt([x - 7 * k, y - 13 * k]) + 'M' + pt([x - 3 * k, y - 9 * k]) + 'L' + pt([x + 1 * k, y - 15 * k]) + 'M' + pt([x + 2 * k, y - 1 * k]) + 'L' + pt([x + 7 * k, y - 10 * k]) + 'L' + pt([x + 6 * k, y - 15 * k]) + 'M' + pt([x + 7 * k, y - 10 * k]) + 'L' + pt([x + 11 * k, y - 12 * k]);
    return L(d, OL, 5 * k) + L(d, col, 2.6 * k) + [[-7, -13], [1, -15], [6, -15], [11, -12]].map(function (t) { return C(x + t[0] * k, y + t[1] * k, 1.5 * k, lt(col, 0.3)); }).join('');
  }
  // ---- drowned Wavebreaker troll head (facing left), Realm of Loner design: sea-grey, lean face, short nose, modest torn ear,
  //      small chipped tusk, kelp-matted braids tied with shell and bone beads; o.mask puts a scallop shell over the face ----
  function dwHead(c, x, y, o) {
    o = o || {}; var sk = o.skin || DSK, s = '';
    if (o.dreads !== false) {
      [[0, -13, 24, 0.8], [5, -12, 32, 0.45], [10, -9, 36, 0.2], [14, -5, 28, 0]].forEach(function (d, i) {
        var bx = x + d[0], by = y + d[1], l = d[2], sw = d[3] * 10;
        var T = taper([[bx, by], [bx + 9 + sw, by + l * 0.3], [bx + 11 + sw * 0.5, by + l * 0.68], [bx + 7 + sw, by + l]], 6, 1.6, 4);
        s += P(T.d, c.cel(i % 2 ? KELPD : KELP), 1.4) + L(along(T, 0.3), lt(KELP, 0.35), 0.7, 0.7);
        var b = T.s[Math.floor(T.s.length * 0.62)];
        s += L('M' + pt([b[0] - 3, b[1] - 1]) + 'L' + pt([b[0] + 3, b[1] + 1]), OL, 3.2) + L('M' + pt([b[0] - 3, b[1] - 1]) + 'L' + pt([b[0] + 3, b[1] + 1]), '#8a6a3a', 1.6);
        var e = T.s[T.s.length - 1]; s += C(e[0], e[1] + 1.5, 2, c.cel(i % 2 ? '#e8b8a8' : BONE), 1);
      });
    }
    if (o.coral !== false) s += coralSprig(c, x + 3, y - 12, o.coralK || 1);
    // long ear drooping back, torn at the tip
    s += P('M' + pt([x + 7, y - 2]) + 'L' + pt([x + 21, y - 8]) + 'L' + pt([x + 18, y - 3]) + 'L' + pt([x + 20, y + 1]) + 'L' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 11, y - 1]) + 'L' + pt([x + 18, y - 5]) + 'L' + pt([x + 12, y + 3]) + 'Z', dk(sk, 0.3), 0.8) + barnacles(71, 2, x + 13, x + 17, y - 2, y + 2, 0.8);
    // shell earring
    s += L('M' + pt([x + 12, y + 4]) + 'L' + pt([x + 12.5, y + 8]), '#3a2a1a', 1.2) + E(x + 12.5, y + 10, 2, 2.8, c.cel('#e8b8a8'), 1.1);
    var d = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 17]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 12, y + 11]) + 'C' + pt([x - 14, y + 8]) + ' ' + pt([x - 13, y + 6]) + ' ' + pt([x - 11, y + 5]) +
      'L' + pt([x - 16, y + 4]) + 'C' + pt([x - 18, y + 3]) + ' ' + pt([x - 17, y]) + ' ' + pt([x - 15, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
    var mot = E(x + 3, y - 8, 4, 3, DSKD, 0, 0.7) + E(x - 13, y + 2, 2.4, 1.6, DSKD, 0, 0.6) + E(x + 6, y + 8, 3, 4, DSKD, 0, 0.6);
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8) + mot, 2.2);
    s += barnacles(o.seed || 73, 5, x - 4, x + 9, y - 14, y - 9, 0.95);
    // slack jaw, a small chipped yellowed tusk
    s += P('M' + pt([x - 13, y + 9]) + 'L' + pt([x - 1, y + 10]) + 'L' + pt([x - 3, y + 18]) + 'L' + pt([x - 11, y + 17]) + 'Z', '#12201e', 1.3) + L('M' + pt([x - 12, y + 10.5]) + 'l1.2,2 M' + pt([x - 8.5, y + 11]) + 'l1,2 M' + pt([x - 5, y + 11]) + 'l1,2', BONE, 1.1);
    s += P('M' + pt([x - 11, y + 12]) + 'L' + pt([x - 12.5, y + 6.5]) + 'L' + pt([x - 10.4, y + 7.4]) + 'L' + pt([x - 8.5, y + 11.5]) + 'Z', c.cel('#d8cca6'), 1.2);
    if (o.mask) s += shellMask(c, x, y);
    else s += L('M' + pt([x - 13, y - 8]) + 'L' + pt([x - 1, y - 5]), OL, 2.8) + E(x - 6, y - 3, 3.2, 2.6, '#0c1414') + glowEye(c, x - 6, y - 3, 1.9, DEYE);
    return s + drops([[x - 9, y + 21, 0.9], [x - 16, y + 10, 0.7]]);
  }
  // scallop shell tied over the face: hinge at the chin, fan up over the brow, eye holes glowing
  function shellMask(c, x, y) {
    var hx = x - 9, hy = y + 13, pts = [];
    for (var i = 0; i <= 8; i++) { var a = -PI + 0.18 + i * (PI - 0.36) / 8; pts.push([hx + Math.cos(a) * 17, hy + Math.sin(a) * 25]); }
    var d = 'M' + pt([hx - 3, hy + 2]) + pts.map(function (p, i) { return (i ? 'Q' + pt([(p[0] + pts[i - 1][0]) / 2 + (p[0] - hx) * 0.14, (p[1] + pts[i - 1][1]) / 2 + (p[1] - hy) * 0.1]) + ' ' : 'L') + pt(p); }).join('') + 'L' + pt([hx + 3, hy + 2]) + 'Z', rb = '';
    pts.forEach(function (p) { rb += 'M' + pt([hx, hy]) + 'L' + pt([hx + (p[0] - hx) * 0.9, hy + (p[1] - hy) * 0.9]); });
    var s = L('M' + pt([hx + 14, hy - 12]) + 'L' + pt([x + 12, y - 6]), OL, 2.6) + L('M' + pt([hx + 14, hy - 12]) + 'L' + pt([x + 12, y - 6]), '#8a6a3a', 1.2);
    s += body(c, d, '#ecd6b4', L(rb, '#a88262', 1.2) + F(pd([[hx + 5, hy - 28], [hx + 20, hy - 28], [hx + 20, hy + 4], [hx + 5, hy + 4]], true), '#b89878', 0.55) + E(hx - 5, hy - 22, 4, 1.6, '#ffffff', 0, 0.5), 2);
    s += P(pd([[hx - 5, hy + 1], [hx + 5, hy + 1], [hx + 4, hy + 6], [hx - 4, hy + 6]], true), c.cel('#d8b890'), 1.2);
    s += E(hx - 5, hy - 13, 3.2, 2.6, '#0a1212', 1) + E(hx + 4, hy - 14, 2.8, 2.4, '#0a1212', 1) + glowEye(c, hx - 5, hy - 13, 1.5, DEYE) + glowEye(c, hx + 4, hy - 14, 1.3, DEYE);
    return s + L('M' + pt([hx - 7, hy - 4]) + 'q6,3 12,0', '#0a1212', 1.5) + barnacles(77, 3, hx + 4, hx + 12, hy - 22, hy - 16, 0.8);
  }
  // torn sea-teal loincloth under a shell-bead belt, kelp hanging over it
  function kelpLoin(c, col, long) {
    var d = long ? 'M48,84 L80,84 L82,98 L80,116 L74,108 L70,118 L64,108 L58,117 L54,108 L48,114 L46,98 Z' : 'M50,84 L78,84 L76,94 L73,108 L69,102 L66,111 L62,103 L58,109 L54,94 Z';
    var o = body(c, d, col, F('M68,82 L84,82 L84,120 L66,120 Z', dk(col, 0.3), 0.7) + L('M52,96 L76,96', lt(col, 0.2), 1, 0.7), 1.8);
    o += kelp(c, 50, 86, 78, 86, long ? 7 : 5, long ? 24 : 16, 91, KELP, 3.2);
    o += L('M49,86 L79,86', OL, 4.6) + L('M49,86 L79,86', '#6a5a3a', 2.6);
    [53, 60, 67, 74].forEach(function (x, i) { o += shell(c, x, 91, 0.55, i % 2 ? '#f0e0c8' : '#e8b8a8'); });
    return o;
  }
  // an old sea-turtle shell worn as a pauldron, crusted with barnacles
  function shellPad(c, x, y, r) {
    var d = 'M' + pt([x - r, y + 4]) + 'C' + pt([x - r, y - r]) + ' ' + pt([x + r, y - r]) + ' ' + pt([x + r, y + 4]) + 'C' + pt([x + r * 0.4, y + 2]) + ' ' + pt([x - r * 0.4, y + 2]) + ' ' + pt([x - r, y + 4]) + 'Z';
    var pl = 'M' + pt([x - r * 0.62, y - r * 0.05]) + 'L' + pt([x - r * 0.22, y - r * 0.5]) + 'L' + pt([x + r * 0.28, y - r * 0.5]) + 'L' + pt([x + r * 0.66, y - r * 0.05]) + 'M' + pt([x - r * 0.22, y - r * 0.5]) + 'L' + pt([x - r * 0.1, y + 2.4]) + 'M' + pt([x + r * 0.28, y - r * 0.5]) + 'L' + pt([x + r * 0.24, y + 2.2]);
    return body(c, d, '#6a7a42', L(pl, '#2e3a1e', 1.2) + F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 5], [x + r * 0.3, y + 5]], true), '#2e3a1e', 0.4), 1.9) + barnacles(79, 5, x - r * 0.7, x + r * 0.2, y - r * 0.4, y + 1, 1) + kelp(c, x - r + 2, y + 3, x + r - 2, y + 3, 3, 10, 80, KELP, 3);
  }
  function coralSpear(c, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
    var q = function (u, v) { return [b[0] + ux * u + px * v, b[1] + uy * u + py * v]; }, d = 'M' + pt(a) + 'L' + pt(b);
    var o = limb(d, '#8e8676', 3.2) + L(d, '#c0b8a8', 1, 0.6);
    o += L('M' + pt(q(-2, -3)) + 'L' + pt(q(-6, 3)) + 'M' + pt(q(-5, -3)) + 'L' + pt(q(-9, 3)) + 'M' + pt(q(-8, -3)) + 'L' + pt(q(-12, 3)), KELPD, 1.6);
    var head = pd([q(-1, 3), q(5, 4), q(4, 10), q(9, 5), q(13, 3), q(22, 0), q(13, -3), q(10, -8), q(5, -11), q(5, -4), q(-1, -3)], true);
    return o + P(head, c.cel(CORALD), 1.6) + L('M' + pt(q(2, 0)) + 'L' + pt(q(18, 0)) + 'M' + pt(q(6, 1)) + 'L' + pt(q(5, 7)) + 'M' + pt(q(8, -1)) + 'L' + pt(q(6, -8)), lt(CORAL, 0.25), 1, 0.9) + C(q(4, 10)[0], q(4, 10)[1], 1.3, lt(CORAL, 0.3)) + C(q(5, -11)[0], q(5, -11)[1], 1.3, lt(CORAL, 0.3));
  }
  function conch(c, x, y, s, col) {
    col = col || '#f0dcc0';
    var d = 'M' + pt([x - 8 * s, y]) + 'C' + pt([x - 10 * s, y - 8 * s]) + ' ' + pt([x - 4 * s, y - 16 * s]) + ' ' + pt([x, y - 22 * s]) + 'C' + pt([x + 4 * s, y - 16 * s]) + ' ' + pt([x + 10 * s, y - 8 * s]) + ' ' + pt([x + 8 * s, y]) + 'C' + pt([x + 4 * s, y + 4 * s]) + ' ' + pt([x - 4 * s, y + 4 * s]) + ' ' + pt([x - 8 * s, y]) + 'Z';
    var wh = 'M' + pt([x - 7 * s, y - 6 * s]) + 'Q' + pt([x, y - 10 * s]) + ' ' + pt([x + 7 * s, y - 7 * s]) + 'M' + pt([x - 5 * s, y - 12 * s]) + 'Q' + pt([x, y - 15 * s]) + ' ' + pt([x + 5 * s, y - 13 * s]) + 'M' + pt([x - 2.4 * s, y - 17 * s]) + 'Q' + pt([x, y - 19 * s]) + ' ' + pt([x + 2.4 * s, y - 18 * s]);
    return body(c, d, col, L(wh, dk(col, 0.4), 1 * s) + F(pd([[x + 2 * s, y - 24 * s], [x + 12 * s, y - 24 * s], [x + 12 * s, y + 5 * s], [x + 3 * s, y + 5 * s]], true), dk(col, 0.25), 0.7), 1.5 * s) + E(x - 1 * s, y, 5 * s, 2.2 * s, c.cel('#f2a0a0'), 1 * s) + C(x - 6 * s, y - 7 * s, 1.2 * s, lt(col, 0.3)) + C(x + 6 * s, y - 8 * s, 1.2 * s, lt(col, 0.3));
  }
  function conchStaff(c, a, b) {
    var d = 'M' + pt(a) + 'L' + pt(b), o = limb(d, '#8e8676', 3.4) + L(d, '#c0b8a8', 1, 0.6);
    o += L('M' + pt([b[0] - 1, b[1] + 8]) + 'L' + pt([b[0] - 8, b[1] + 20]) + 'M' + pt([b[0] + 1, b[1] + 8]) + 'L' + pt([b[0] + 7, b[1] + 18]), '#6a5a3a', 1);
    o += shell(c, b[0] - 8, b[1] + 26, 0.7) + shell(c, b[0] + 7, b[1] + 24, 0.7, '#e8b8a8') + C(b[0], b[1] + 4, 14, glow(c, DEYE, 0.45));
    return o + kelp(c, b[0] - 3, b[1] + 6, b[0] + 3, b[1] + 6, 2, 14, 85, KELP, 3) + conch(c, b[0], b[1] + 6, 0.95);
  }
  function waterOrb(c, x, y, r) {
    var o = C(x, y, r * 3.2, glow(c, DEYE, 0.6)) + C(x, y, r, c.rg([[0, '#f0fffc'], [0.45, '#8ae8e0'], [1, '#1e8aa8']]), 1.4);
    o += L('M' + pt([x - r * 0.6, y + r * 0.2]) + 'C' + pt([x - r * 0.3, y - r * 0.6]) + ' ' + pt([x + r * 0.5, y - r * 0.4]) + ' ' + pt([x + r * 0.3, y + r * 0.3]), '#ffffff', 1.1, 0.8);
    var sw = 'M' + pt([x - r * 2, y + r * 0.6]) + 'C' + pt([x - r * 1.6, y - r * 1.9]) + ' ' + pt([x + r * 1.8, y - r * 1.9]) + ' ' + pt([x + r * 1.9, y]) + 'M' + pt([x + r * 1.9, y - r * 0.1]) + 'C' + pt([x + r * 1.7, y + r * 1.9]) + ' ' + pt([x - r * 1.4, y + r * 2.1]) + ' ' + pt([x - r * 1.9, y + r * 0.4]);
    return o + L(sw, OL, 3.2, 0.55) + L(sw, '#9af4ec', 1.8, 0.95) + drops([[x - r * 2.3, y - r * 1.3, 0.8], [x + r * 2.2, y - r * 1.5, 0.7], [x + r * 0.4, y + r * 2.6, 0.8]]);
  }
  // kelp-and-cloth foot-wraps over a soft sole
  function wraps(x, y, col) {
    return boot(x, y, col) + L('M' + n(x - 5) + ',' + n(y - 7) + ' L' + n(x + 5) + ',' + n(y - 4) + ' M' + n(x - 6) + ',' + n(y - 3) + ' L' + n(x + 5) + ',' + n(y - 1), lt(col, 0.35), 1.2) + L('M' + n(x - 9) + ',' + n(y + 1) + ' L' + n(x + 6) + ',' + n(y + 1), '#1e2a28', 1.6);
  }
  // ---- drowned Wavebreaker troll (facing left): tall and lean, upright, dripping, feet in kelp wraps ----
  function wbTroll(c, o) {
    var sk = o.skin || DSK;
    return biped(c, {
      skin: sk, shirt: sk, pants: sk, sleeve: sk, forearm: sk, glove: o.glove, feet: wraps, boots: '#3e5a50', legW: o.legW || 9.5, armW: o.armW || 8.5,
      hx: 50, hy: 32, hipY: 86, neckCol: sk, shadowR: 34,
      torsoD: 'M44,54 C48,44 72,42 82,50 L81,68 L77,88 L51,88 L47,72 Z',
      head: function (c, x, y) { return dwHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); },
      back: o.back,
      chest: function (c) { return L('M58,66 Q64,70 70,66 M56,73 Q64,77 72,73', dk(sk, 0.3), 1.3) + E(72, 58, 5, 4, DSKD, 0, 0.6) + E(56, 80, 4, 3, DSKD, 0, 0.5) + barnacles(81, 6, 62, 78, 74, 84, 1) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return kelpLoin(c, o.loin || '#2e5a5a', o.long) + (o.front ? o.front(c) : ''); },
      shins: function (c) { return L('M55,100 l9,2 M53,106 l8,1', OL, 3.4) + L('M55,100 l9,2 M53,106 l8,1', KELP, 1.8) + barnacles(83, 3, 70, 78, 96, 104, 0.9) + (o.shins ? o.shins(c) : ''); },
      pads: o.pads, top: o.top,
      near: o.near || [[46, 58], [36, 76], [30, 92]], far: o.far || [[80, 54], [90, 72], [92, 90]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf || at(0.98, 64, 122)
    });
  }
  // ---- drowned sailor pieces ----
  function bareFoot(x, y, col) { return P('M' + pt([x + 5, y - 7]) + 'L' + pt([x + 6, y + 1]) + 'L' + pt([x - 9, y + 1]) + 'C' + pt([x - 12, y + 1]) + ' ' + pt([x - 12, y - 5]) + ' ' + pt([x - 6, y - 6]) + 'Z', c_(col), 2) + L('M' + pt([x - 8, y - 2]) + 'l0,3 M' + pt([x - 5, y - 2]) + 'l0,3', OL, 1); }
  function sailorHead(c, x, y, sk) {
    var s = E(x + 9, y + 1, 3.2, 4.2, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 12, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 4]) + 'C' + pt([x + 13, y + 8]) + ' ' + pt([x + 6, y + 17]) + ' ' + pt([x - 2, y + 17]) + 'C' + pt([x - 11, y + 17]) + ' ' + pt([x - 16, y + 10]) + ' ' + pt([x - 15, y + 4]) + 'L' + pt([x - 17, y + 1]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 20], [x + 16, y - 20], [x + 16, y + 20], [x + 2, y + 20]], true), dk(sk, 0.22), 0.8) + E(x + 2, y + 9, 5, 3.6, '#8a8aa8', 0, 0.45) + E(x - 8, y + 12, 5, 2.4, dk(sk, 0.2), 0, 0.5) + L('M' + pt([x - 4, y + 14]) + 'Q' + pt([x + 2, y + 16]) + ' ' + pt([x + 6, y + 12]), dk(sk, 0.35), 1), 2);
    // faded knit cap
    s += P('M' + pt([x - 12, y - 6]) + 'C' + pt([x - 14, y - 22]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 13, y - 6]) + 'Z', c.cel('#56626e'), 2) + L('M' + pt([x - 6, y - 7]) + 'L' + pt([x - 5, y - 18]) + 'M' + pt([x, y - 7]) + 'L' + pt([x + 1, y - 20]) + 'M' + pt([x + 6, y - 7]) + 'L' + pt([x + 6, y - 18]), '#3a444e', 1, 0.8);
    s += P(pd([[x - 13, y - 9], [x + 14, y - 9], [x + 14, y - 4], [x - 13, y - 4]], true), c.cel('#4a5460'), 1.6) + C(x + 1, y - 22, 3, c.cel('#4a5460'), 1.2);
    // bulging glowing eyes, mouth open and spilling water
    s += E(x - 7, y - 0.5, 3.6, 3.8, '#e4ece6', 1.2) + glowEye(c, x - 7.6, y - 0.5, 1.6, DEYE) + L('M' + pt([x - 12, y - 4]) + 'L' + pt([x - 3, y - 3.4]), OL, 1.6);
    s += P('M' + pt([x - 14, y + 7]) + 'Q' + pt([x - 9, y + 15]) + ' ' + pt([x - 3, y + 8]) + 'Z', '#2a1a22', 1.2) + P('M' + pt([x - 10, y + 10]) + 'C' + pt([x - 12, y + 15]) + ' ' + pt([x - 12, y + 20]) + ' ' + pt([x - 10, y + 23]) + 'C' + pt([x - 8, y + 20]) + ' ' + pt([x - 8, y + 15]) + ' ' + pt([x - 7, y + 11]) + 'Z', DRIP, 0.8);
    return s + kelp(c, x + 1, y - 14, x + 10, y - 9, 2, 16, 55, KELP, 3.2);
  }
  // ---- siren pieces ----
  // webbed fin-wing: bony spines from the root to each tip, a scalloped membrane between them
  function finWing(c, root, tips, col, col2, spine) {
    var d = 'M' + pt(root) + 'L' + pt(tips[0]), sp = '', mb = '';
    for (var i = 1; i < tips.length; i++) { var a = tips[i - 1], b = tips[i], m = [(a[0] + b[0]) / 2 + (root[0] - (a[0] + b[0]) / 2) * 0.28, (a[1] + b[1]) / 2 + (root[1] - (a[1] + b[1]) / 2) * 0.28]; d += 'Q' + pt(m) + ' ' + pt(b); }
    d += 'Z';
    tips.forEach(function (t) { sp += 'M' + pt(root) + 'L' + pt(t); mb += 'M' + pt(lerp2(root, t, 0.55)); });
    var band = 'M' + tips.map(function (t) { return pt(lerp2(root, t, 0.62)); }).join('L');
    return body(c, d, col, F(d, c.lg([[0, col, 0], [1, col2, 0.85]], 0, 0, 1, 1)) + L(band, lt(col, 0.35), 1.1, 0.7), 1.8) + L(sp, OL, 3.6) + L(sp, spine, 1.7) + tips.map(function (t) { return C(t[0], t[1], 1.6, spine, 0.8); }).join('');
  }
  function talon(x, y, col) {
    var d = 'M' + pt([x + 2, y - 5]) + 'L' + pt([x - 11, y + 1]) + 'M' + pt([x + 2, y - 5]) + 'L' + pt([x - 5, y + 1.5]) + 'M' + pt([x + 2, y - 5]) + 'L' + pt([x + 6, y + 1]);
    return P(pd([[x + 2, y - 5], [x - 11, y + 1], [x - 5, y + 1.5]], true), c_('#3ab8b0'), 1) + L(d, OL, 4.6) + L(d, col, 2.2) + L('M' + pt([x - 11, y + 1]) + 'l-2.6,0.6 M' + pt([x - 5, y + 1.5]) + 'l-2.4,0.6', '#f0e8d8', 1.4);
  }
  function sirenHead(c, x, y, sk) {
    var hair = '#1e3448', fin = '#3ab8b0', s = '';
    s += P('M' + pt([x - 4, y - 12]) + 'C' + pt([x + 10, y - 17]) + ' ' + pt([x + 22, y - 8]) + ' ' + pt([x + 25, y + 4]) + 'C' + pt([x + 29, y + 18]) + ' ' + pt([x + 25, y + 30]) + ' ' + pt([x + 30, y + 42]) + 'C' + pt([x + 21, y + 38]) + ' ' + pt([x + 15, y + 27]) + ' ' + pt([x + 13, y + 16]) + 'C' + pt([x + 11, y + 8]) + ' ' + pt([x + 6, y + 2]) + ' ' + pt([x - 2, y - 2]) + 'Z', c.cel(hair), 2) + L('M' + pt([x + 10, y - 8]) + 'C' + pt([x + 18, y]) + ' ' + pt([x + 20, y + 16]) + ' ' + pt([x + 24, y + 32]), lt(hair, 0.3), 1.1, 0.8);
    s += P(pd([[x - 6, y - 12], [x - 3, y - 27], [x + 3, y - 16], [x + 10, y - 29], [x + 12, y - 15], [x + 21, y - 22], [x + 17, y - 8]], true), c.cel(fin), 1.4) + L('M' + pt([x - 1, y - 13]) + 'L' + pt([x - 3, y - 26]) + 'M' + pt([x + 7, y - 13]) + 'L' + pt([x + 10, y - 28]) + 'M' + pt([x + 13, y - 11]) + 'L' + pt([x + 20, y - 21]), '#f0dca0', 1.1);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 13]) + 'C' + pt([x - 8, y + 12]) + ' ' + pt([x - 10, y + 8]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) + L('M' + pt([x + 1, y + 2]) + 'q2,-1.4 4,0 M' + pt([x + 2, y + 5]) + 'q2,-1.4 4,0', '#3a9a9a', 0.9, 0.8), 2);
    s += P(pd([[x + 6, y - 3], [x + 19, y - 9], [x + 15, y - 1], [x + 19, y + 4], [x + 8, y + 4]], true), c.cel(fin), 1.2) + L('M' + pt([x + 7, y]) + 'L' + pt([x + 18, y - 8]) + 'M' + pt([x + 7, y + 2]) + 'L' + pt([x + 18, y + 3]), '#f0dca0', 0.9);
    s += P('M' + pt([x - 10, y - 6]) + 'C' + pt([x - 8, y - 13]) + ' ' + pt([x + 4, y - 15]) + ' ' + pt([x + 8, y - 8]) + 'C' + pt([x + 2, y - 10]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 6]) + 'Z', c.cel(hair), 1.4);
    s += L('M' + pt([x - 10, y - 5.4]) + 'L' + pt([x - 2, y - 4.8]), OL, 1.8) + glowEye(c, x - 5.4, y - 2, 1.6, '#fff09a');
    s += P('M' + pt([x - 11, y + 5]) + 'C' + pt([x - 11, y + 12]) + ' ' + pt([x - 4, y + 12]) + ' ' + pt([x - 3, y + 5]) + 'Z', '#3a1020', 1.1) + P(pd([[x - 10, y + 5.4], [x - 9.2, y + 8], [x - 8.4, y + 5.6]], true), '#f6f0e0', 0.6) + P(pd([[x - 5.6, y + 5.6], [x - 4.8, y + 8.2], [x - 4, y + 5.6]], true), '#f6f0e0', 0.6);
    return s;
  }
  // ---- Saltbones pieces ----
  function lantern(c, p) {
    var x = p[0], y = p[1] + 4, o = L('M' + pt(p) + 'L' + pt([x, y]), OL, 1.6);
    o += C(x, y + 10, 18, glow(c, DEYE, 0.55)) + P(pd([[x - 5, y + 2], [x + 5, y + 2], [x + 6, y + 16], [x - 6, y + 16]], true), c.lg([[0, '#c8fff6'], [1, '#2ab0c0']]), 1.4);
    o += flame(c, x, y + 14, 0.34, '#3ae8d8', '#e8fffa') + L('M' + pt([x - 2, y + 2]) + 'L' + pt([x - 2.4, y + 16]) + 'M' + pt([x + 2, y + 2]) + 'L' + pt([x + 2.4, y + 16]), '#2a2a26', 1);
    return o + R(x - 7, y, 14, 3, c.cel('#4a4a40'), 1.2) + R(x - 7.6, y + 15, 15.2, 3, c.cel('#4a4a40'), 1.2) + P(pd([[x - 3, y], [x, y - 3], [x + 3, y]], true), '#4a4a40', 1);
  }
  function tricorn(c, x, y) {
    var hat = '#2a2426', d = 'M' + pt([x - 20, y - 8]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 21, y - 9]) + 'C' + pt([x + 16, y - 13]) + ' ' + pt([x + 10, y - 26]) + ' ' + pt([x + 3, y - 25]) + 'C' + pt([x - 4, y - 29]) + ' ' + pt([x - 13, y - 19]) + ' ' + pt([x - 20, y - 8]) + 'Z';
    var o = body(c, d, hat, F(pd([[x + 4, y - 30], [x + 24, y - 30], [x + 24, y - 6], [x + 6, y - 6]], true), '#000', 0.35), 2) + L('M' + pt([x - 19, y - 9]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 20, y - 10]), GOLD, 1.5);
    o += skull(c, x + 1, y - 18, 0.5) + L('M' + pt([x - 3, y - 15]) + 'L' + pt([x + 5, y - 20]) + 'M' + pt([x - 3, y - 20]) + 'L' + pt([x + 5, y - 15]), '#ece4cc', 1);
    return o + kelp(c, x - 16, y - 10, x + 16, y - 11, 3, 9, 97, KELP, 2.6) + barnacles(98, 4, x + 6, x + 16, y - 16, y - 11, 0.9);
  }
  // ---- makrura pieces ----
  // lobster claw on an axis from p along ang; open spreads the fingers
  function pincer(c, p, ang, len, col, open) {
    var q = dirQ(p, ang), w = len * 0.3, o = '';
    var palm = 'M' + pt(q(0, -w * 0.6)) + 'C' + pt(q(len * 0.2, -w * 1.3)) + ' ' + pt(q(len * 0.5, -w * 1.25)) + ' ' + pt(q(len * 0.58, -w * 0.5)) + 'L' + pt(q(len * 0.58, w * 0.5)) + 'C' + pt(q(len * 0.5, w * 1.15)) + ' ' + pt(q(len * 0.2, w * 1.2)) + ' ' + pt(q(0, w * 0.6)) + 'Z';
    var up = taper([q(len * 0.5, -w * 0.5), q(len * 0.78, -w * 0.75 - open * w * 0.5), q(len * 1.02, -w * 0.15 - open * w)], w * 1.05, w * 0.12, 5);
    var lo = taper([q(len * 0.5, w * 0.5), q(len * 0.76, w * 0.7 + open * w * 0.4), q(len * 0.96, w * 0.2 + open * w * 0.8)], w * 0.9, w * 0.12, 5);
    o += body(c, lo.d, dk(col, 0.1), F(ribbonBand(lo, 0.6, 1), dk(col, 0.35), 0.8), 1.6) + body(c, up.d, col, F(ribbonBand(up, 0.6, 1), dk(col, 0.3), 0.8), 1.6);
    var tu = up.s, tl = lo.s, tt = '';
    for (var i = 2; i < tu.length - 2; i += 2) tt += 'M' + pt(lerp2(up.b[i], up.a[i], 0.02)) + 'l' + n((up.b[i][0] - up.a[i][0]) * 0.18) + ',' + n((up.b[i][1] - up.a[i][1]) * 0.18);
    o += L(tt, '#f4e6c8', 1, 0.9);
    o += body(c, palm, col, F(pd([q(len * 0.1, w * 0.3), q(len * 0.6, w * 0.3), q(len * 0.6, w * 1.3), q(len * 0.1, w * 1.3)], true), dk(col, 0.3), 0.8) + C(q(len * 0.25, -w * 0.5)[0], q(len * 0.25, -w * 0.5)[1], w * 0.2, lt(col, 0.35), 0, 0.8) + C(q(len * 0.4, -w * 0.4)[0], q(len * 0.4, -w * 0.4)[1], w * 0.14, lt(col, 0.35), 0, 0.8), 1.8);
    return o + C(tl[tl.length - 1][0], tl[tl.length - 1][1], 1.3, '#3a1a14') + C(tu[tu.length - 1][0], tu[tu.length - 1][1], 1.4, '#3a1a14');
  }
  function segLimb(pts, col, w) { var d = pd(pts); return L(d, OL, w + 3.6) + L(d, col, w) + pts.slice(1, -1).map(function (p) { return C(p[0], p[1], w * 0.62, col, 1.2); }).join(''); }
  function legTip(p, col) { return P(pd([[p[0] - 2, p[1] - 3], [p[0] + 2, p[1] - 3], [p[0] - 1, p[1] + 1.4]], true), col, 1.1); }

  // ============================================================
  //  MOBS (128 x 128, facing left, feet on y 121)
  // ============================================================
  var MOBS = {
    reef_makrura: function (c) {
      var sh = '#c8462e', shd = dk(sh, 0.3), lt1 = '#f07a4a', bel = '#f0d8b0', o = shadow(c, 70, 44);
      // antennae sweeping back over the body
      o += L('M40,30 C60,4 92,0 118,10 M42,32 C70,14 100,16 122,34', OL, 3) + L('M40,30 C60,4 92,0 118,10 M42,32 C70,14 100,16 122,34', '#e89a6a', 1.3);
      // far claw raised up behind
      o += segLimb([[76, 46], [90, 46], [94, 38]], shd, 6) + pincer(c, [94, 38], -PI / 2 - 0.3, 34, dk(sh, 0.12), 0.75);
      // tail: segmented abdomen curling down behind to a fan on the ground
      var tp = [[72, 80], [84, 92], [94, 104], [102, 112], [110, 117]];
      for (var i = 0; i < tp.length - 1; i++) { var a = tp[i], b = tp[i + 1], w = 12 - i * 1.8, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy), px = -dy / l * w, py = dx / l * w; o += body(c, pd([[a[0] - px, a[1] - py], [b[0] - px * 0.85, b[1] - py * 0.85], [b[0] + px * 0.85, b[1] + py * 0.85], [a[0] + px, a[1] + py]], true), i % 2 ? sh : dk(sh, 0.06), F(pd([[a[0] + px * 0.2, a[1] + py * 0.2], [b[0] + px * 0.2, b[1] + py * 0.2], [b[0] + px, b[1] + py], [a[0] + px, a[1] + py]], true), shd, 0.6), 1.7); }
      [[-0.6, 12], [-0.25, 14], [0.1, 14], [0.45, 12]].forEach(function (f) { var a = f[0], q = dirQ([110, 117], a); o += P('M' + pt(q(0, -3)) + 'Q' + pt(q(f[1] * 0.7, -6)) + ' ' + pt(q(f[1], 0)) + 'Q' + pt(q(f[1] * 0.7, 6)) + ' ' + pt(q(0, 3)) + 'Z', c.cel(lt1), 1.3); });
      // walking legs, far then near
      o += segLimb([[76, 88], [88, 100], [92, 118]], shd, 3.4) + legTip([92, 120], shd) + segLimb([[68, 90], [74, 104], [72, 118]], shd, 3.6) + legTip([72, 120], shd);
      o += segLimb([[62, 90], [54, 104], [50, 118]], sh, 4.2) + legTip([50, 120], sh) + segLimb([[56, 86], [42, 100], [36, 118]], sh, 4) + legTip([36, 120], sh);
      // carapace, upright, with pale belly plates and a spiny back ridge
      var cd = 'M44,42 C46,28 66,24 78,32 C90,42 90,66 82,84 L58,92 C46,82 42,60 44,42 Z';
      var plates = F('M46,50 C50,48 58,50 60,54 L62,88 L58,92 C48,82 44,66 46,50 Z', bel, 0.95) + L('M46,58 L61,60 M46,66 L61,68 M48,74 L61,76 M51,82 L61,84', '#b89a70', 1.2);
      o += body(c, cd, sh, F('M70,24 L96,24 L96,96 L74,96 C86,72 86,46 70,24 Z', shd, 0.8) + plates + L('M62,32 C70,34 76,40 80,48', lt1, 1.4, 0.8) + barnacles(301, 6, 70, 82, 56, 72, 1.1), 2.2);
      [[64, 27], [72, 29], [79, 34], [84, 41], [87, 49]].forEach(function (p, i) { o += P(pd([[p[0] - 2.4, p[1] + 1], [p[0] + 1 + i * 0.6, p[1] - 6], [p[0] + 2.6, p[1] + 1.4]], true), c.cel(lt1), 1); });
      // head: rostrum spike forward, stalk eyes, little mouth legs
      o += P(pd([[48, 32], [26, 22], [44, 40]], true), c.cel(sh), 1.6) + P(pd([[36, 27], [33, 22], [39, 28]], true), c.cel(lt1), 0.8);
      o += limb('M44,32 L40,20', sh, 2.6) + limb('M50,30 L50,18', shd, 2.6) + C(40, 18, 3.4, '#1a0e0a', 1.2) + C(50, 16, 3, '#1a0e0a', 1.2) + C(39, 17, 1, '#ffffff') + C(49, 15, 0.9, '#ffffff');
      o += L('M44,42 l-6,4 l1,4 M47,44 l-4,6 l2,3', OL, 2.6) + L('M44,42 l-6,4 l1,4 M47,44 l-4,6 l2,3', lt1, 1.2);
      // near claw, big, snapping forward
      o += segLimb([[54, 54], [40, 72], [30, 62]], sh, 7) + pincer(c, [30, 62], -PI / 2 - 0.42, 42, sh, 0.6);
      return G(o, at(1.0, 64, 122)) + drops([[26, 80], [100, 70]]);
    },
    drowned_wavebreaker: function (c) {
      return wbTroll(c, {
        seed: 101,
        pads: function (c) { return shellPad(c, 44, 57, 13); },
        near: [[46, 58], [38, 72], [34, 63]], far: [[80, 54], [88, 70], [76, 80]],
        wNear: function (c) { return coralSpear(c, [104, 94], [24, 57]); },
        top: function (c) { return drops([[30, 96], [86, 96], [60, 112, 0.8]]) + barnacles(105, 4, 84, 92, 60, 68, 0.9); }
      });
    },
    wavebreaker_hexer: function (c) {
      return wbTroll(c, {
        seed: 103, mask: true, coralK: 1.25, loin: '#244a50', long: true, armW: 8,
        back: function (c) { return body(c, 'M42,50 C36,72 34,96 30,114 L40,110 L46,118 L56,110 L66,118 L76,110 L86,118 L96,112 C92,94 90,70 86,50 Z', '#244846', F('M72,48 L100,48 L100,120 L80,120 C84,94 80,70 72,48 Z', '#000', 0.25), 1.8) + kelp(c, 44, 52, 86, 50, 6, 26, 107, KELPD, 4); },
        chest: function (c) { var o = L('M46,54 Q62,68 80,54', OL, 2.4) + L('M46,54 Q62,68 80,54', '#6a5a3a', 1); [[50, 58], [57, 62], [64, 63], [71, 61]].forEach(function (t, i) { o += shell(c, t[0], t[1] + 5, 0.6, i % 2 ? '#e8b8a8' : '#f0e0c8'); }); return o + coralSprig(c, 74, 70, 0.6, CORALO); },
        far: [[80, 54], [92, 64], [98, 76]], wFar: function (c, p) { return conchStaff(c, [p[0] + 6, p[1] + 44], [p[0] - 4, p[1] - 58]); },
        near: [[46, 58], [34, 66], [22, 58]], wNearFront: function (c, p) { return waterOrb(c, p[0] - 4, p[1] - 15, 6); },
        tf: at(0.97, 64, 122)
      });
    },
    drowned_sailor: function (c) {
      var sk = '#aebcc0', shirt = '#c4bca4';
      return biped(c, {
        skin: sk, shirt: shirt, sleeve: shirt, forearm: sk, pants: '#3e4a5c', glove: sk, feet: bareFoot, boots: dk(sk, 0.12), legW: 11.5, armW: 9.5, hipY: 94, hx: 50, hy: 34, neckCol: sk, shadowR: 38,
        legF: 'M70,94 L73,106 L73,114', legN: 'M56,94 L53,106 L52,114',
        torsoD: 'M42,50 C44,42 80,40 86,50 C98,64 98,88 84,98 L48,98 C34,90 32,64 42,50 Z',
        chest: function (c) {
          var belly = 'M52,58 C60,54 74,56 80,62 C92,74 90,92 78,98 L54,98 C42,90 42,70 52,58 Z';
          return F(belly, c.cel(sk)) + L(belly, OL, 1.6) + E(66, 90, 2, 1.4, dk(sk, 0.4)) + E(74, 72, 6, 5, '#8a8aa8', 0, 0.4) + E(58, 80, 4, 3, dk(sk, 0.18), 0, 0.5) + L('M58,70 Q66,66 74,70', dk(sk, 0.3), 1) +
            L('M44,56 L52,62 M48,50 L54,60 M84,58 L80,64 M88,68 L82,70', dk(shirt, 0.35), 1.2) + barnacles(201, 5, 40, 50, 64, 80, 1) + kelp(c, 76, 48, 86, 52, 3, 26, 203, KELP, 3.6);
        },
        belt: '#8a7a5a', buckle: '#6a5a3a',
        front: function (c) { return L('M50,108 l3,5 M56,108 l1,5 M68,108 l2,5 M74,108 l1,5', OL, 1.4) + drops([[52, 100, 0.8], [80, 100, 0.8]]); },
        head: function (c, x, y) { return sailorHead(c, x, y, sk); },
        near: [[46, 58], [32, 66], [22, 58]], wNearFront: function (c, p) { return cutlass(c, p, -PI / 2 - 0.3); },
        far: [[84, 56], [94, 72], [94, 88]], farHand: function (c, p) { return clawHand(p, sk, 1, '#d8d8c8'); },
        top: function (c) { return barnacles(205, 4, 88, 96, 70, 80, 0.9) + drops([[96, 98], [24, 60, 0.8]]); },
        tf: at(0.98, 64, 122)
      });
    },
    grotto_siren: function (c) {
      var sk = '#ecd2c4', sc = '#2a8a8a', fin = '#3ab8b0', fin2 = '#1e4a80', spine = '#f0dca0';
      return biped(c, {
        skin: sk, shirt: sk, pants: '#3a9a94', sleeve: sk, forearm: sk, glove: sk, feet: talon, boots: '#2a6a6a', digi: true, legW: 7.5, armW: 6.5, hipY: 84, hx: 56, hy: 34, neckCol: sk, shadowR: 30,
        torsoD: 'M50,50 C54,45 72,45 76,50 L73,66 L76,86 L52,86 L55,66 Z',
        back: function (c) {
          return finWing(c, [72, 50], [[92, 8], [108, 4], [120, 14], [124, 32], [114, 48]], dk(fin, 0.18), fin2, spine) + finWing(c, [58, 50], [[40, 6], [22, 4], [8, 14], [4, 32], [14, 46]], fin, fin2, spine);
        },
        chest: function (c) {
          var bd = 'M52,50 C56,47 70,47 74,50 L72,68 L56,68 Z', sca = '';
          for (var j = 0; j < 3; j++) for (var i = 0; i < 4; i++) { var x = 55 + i * 4.4 + (j % 2) * 2.2, y = 53 + j * 5; sca += 'M' + pt([x - 2, y]) + 'q2,3 4,0'; }
          return body(c, bd, sc, L(sca, lt(sc, 0.3), 0.9), 1.6) + C(64, 58, 2, c.cel('#f4f0ff'), 0.8);
        },
        front: function (c) {
          var o = L('M51,84 L77,84', OL, 3.6) + L('M51,84 L77,84', GOLD, 1.8);
          [[52, 0.25], [58, 0.1], [64, 0], [70, -0.1], [76, -0.25]].forEach(function (f, i) { var T = taper([[f[0], 84], [f[0] - f[1] * 10, 94], [f[0] - f[1] * 18, 104]], 6, 1.2, 4); o += P(T.d, c.cel(i % 2 ? fin : dk(fin, 0.15)), 1.2) + L(along(T, 0.5), spine, 0.8, 0.9); });
          return o;
        },
        shins: function (c) { return L('M58,102 q2,2 4,0 M56,108 q2,2 4,0 M72,102 q2,2 4,0 M72,108 q2,2 4,0', '#1e5a5a', 1); },
        head: function (c, x, y) { return sirenHead(c, x, y, sk); },
        near: [[52, 54], [40, 64], [28, 58]], nearHand: function (c, p) { return clawHand(p, sk, 0.9, '#f0e8d8'); },
        far: [[74, 54], [84, 66], [90, 78]], farHand: function (c, p) { return clawHand(p, dk(sk, 0.08), 0.85, '#f0e8d8'); },
        top: function (c) {
          var ring = '';
          [7, 12, 17].forEach(function (r) { ring += 'M' + pt([42 - r * 0.55, 42 - r * 0.8]) + 'Q' + pt([42 - r * 1.15, 42]) + ' ' + pt([42 - r * 0.55, 42 + r * 0.8]); });
          return P(pd([[44, 58], [40, 52], [46, 55]], true), c.cel(fin), 0.9) + P(pd([[42, 66], [34, 64], [40, 61]], true), c.cel(fin), 0.9) + L(ring, '#c8f8f0', 1.4, 0.75);
        },
        tf: at(1.0, 64, 122)
      });
    },
    captain_saltbones: function (c) {
      var coat = '#23596a', coatD = dk(coat, 0.28), b = '#e0d8c0';
      return skeleton(c, {
        bone: b, eye: DEYE, hx: 54, hy: 32, shadowR: 34,
        back: function (c) { return body(c, 'M50,56 C46,80 40,100 34,116 L44,112 L50,119 L60,112 L70,119 L80,112 L90,118 L96,114 C90,96 84,76 78,56 Z', coatD, F('M74,52 L100,52 L100,120 L84,120 C88,96 84,74 74,52 Z', '#000', 0.25) + L('M36,114 L44,110 L50,117 L60,110 L70,117 L80,110 L90,116 L95,112', GOLD, 1.2, 0.8), 1.8) + barnacles(401, 8, 42, 90, 100, 112, 1) + kelp(c, 40, 110, 92, 112, 5, 8, 402, KELP, 3); },
        far: [[72, 52], [82, 64], [86, 76]], wFar: function (c, p) { return lantern(c, p); },
        inside: function (c) { return limb('M72,52 L82,64', coatD, 8); },
        cloth: function (c) {
          var lp = 'M45,48 C43,62 43,76 46,92 L56,92 L57,62 L52,46 Z', rp = 'M68,46 L71,60 L72,92 L82,90 C84,76 84,62 80,48 Z';
          var o = body(c, lp, coat, F('M50,44 L58,44 L58,94 L52,94 Z', dk(coat, 0.2), 0.6), 1.8) + body(c, rp, coat, F('M76,44 L86,44 L86,92 L78,92 Z', coatD, 0.7), 1.8);
          o += L('M52,47 L56,62 L55,92 M69,47 L71,60 L71,92', GOLD, 1.4) + [58, 66, 74, 82].map(function (y) { return C(54, y, 1.3, GOLD, 0.6) + C(73, y, 1.3, GOLD, 0.6); }).join('');
          return o + P('M46,80 L82,80 L82,86 L46,86 Z', c.cel('#7a2a2a'), 1.4) + R(60, 79, 7, 8, c.cel(GOLD), 1.2) + barnacles(403, 4, 76, 82, 64, 74, 0.9);
        },
        pads: function (c) { return E(47, 50, 7, 3.6, c.cel(GOLD), 1.2) + L('M42,52 l-1,5 M45,53 l-0.4,5 M48,53 l0,5 M51,52 l0.4,5', GOLDD, 1.1) + E(73, 48, 6, 3, c.cel(GOLDD), 1.1); },
        headX: function (c, x, y) { return kelp(c, x - 9, y + 8, x + 2, y + 10, 4, 18, 405, KELP, 3.4) + tricorn(c, x + 1, y - 6); },
        near: [[52, 52], [40, 46], [30, 38]], wNearFront: function (c, p) { return limb('M52,52 L42,47', coat, 8.5) + E(42, 47, 3.4, 5, c.cel(GOLD), 1.1) + cutlass(c, p, -PI / 2 - 0.55); },
        top: function (c) { return drops([[40, 74], [90, 100], [62, 108, 0.8]]); },
        tf: at(0.95, 64, 122)
      });
    },
    kragvesh_the_tidebeast: function (c) {
      var sk = '#6e8a98', skd = dk(sk, 0.28), bel = '#9ab2ba', o = shadow(c, 64, 60);
      // far arm, knuckles on the ground behind
      o += limb('M98,44 L114,76', skd, 17) + limb('M114,76 L112,100', skd, 15) + C(112, 108, 12, c.cel(skd), 2.2) + L('M104,114 l0,6 M110,116 l0,5 M116,115 l0,5', dk(skd, 0.45), 1.3) + kelp(c, 106, 70, 120, 74, 3, 18, 501, KELPD, 4);
      // legs, stubby and thick
      o += limb('M84,96 L90,112', skd, 18) + P('M78,121 L102,121 L101,112 L82,111 Z', c.cel(dk(skd, 0.1)), 2) + limb('M58,98 L54,112', sk, 20) + P('M38,121 L64,121 L64,111 L42,111 Z', c.cel(dk(sk, 0.1)), 2);
      // the hunched mass
      var bd = 'M28,56 C24,32 46,12 76,12 C104,12 124,30 122,58 C122,82 110,98 92,102 L46,102 C32,94 28,76 28,56 Z';
      var inner = F('M88,6 L128,6 L128,110 L96,110 C112,86 112,44 88,6 Z', dk(sk, 0.3), 0.85) + F('M40,60 C46,52 70,54 78,66 C82,82 74,98 60,100 L46,100 C38,90 36,72 40,60 Z', bel, 0.9);
      inner += L('M34,40 C46,20 70,14 96,18', lt(sk, 0.35), 2.6, 0.7) + L('M100,40 C106,52 108,66 104,80 M84,30 C90,44 92,56 88,70', dk(sk, 0.35), 1.6, 0.8) + L('M46,72 Q58,68 70,74 M44,84 Q56,80 70,86', dk(bel, 0.3), 1.3) + barnacles(502, 16, 70, 110, 20, 44, 1.5) + barnacles(503, 8, 96, 116, 56, 76, 1.3) + E(62, 30, 12, 6, lt(sk, 0.2), 0, 0.6);
      o += body(c, bd, sk, inner, 2.6);
      o += coral(c, 90, 22, 0.62, CORAL, 504) + coral(c, 106, 30, 0.5, CORALO, 505) + kelp(c, 60, 16, 100, 18, 5, 26, 506, KELP, 4.4);
      // torn sail loincloth and a chain belt
      o += body(c, 'M42,92 L98,92 L94,110 L86,104 L78,114 L70,104 L60,112 L52,104 L44,110 Z', '#c8bea0', F('M76,90 L100,90 L100,112 L80,112 Z', '#8a8270', 0.6) + L('M50,100 L90,100', '#a89a7a', 1, 0.8), 1.8);
      var ch = ''; for (var k = 0; k < 8; k++) ch += L(ellD(46 + k * 7, 93, 3.6, 2.2), OL, 2.6) + L(ellD(46 + k * 7, 93, 3.6, 2.2), '#6a6e76', 1.3);
      o += ch;
      // head sunk low and forward: heavy brow, small hot eyes, great lower tusks
      var hx = 36, hy = 46;
      o += kelp(c, hx - 4, hy - 12, hx + 12, hy - 10, 4, 22, 507, KELPD, 3.6);
      var hd = 'M' + pt([hx + 12, hy - 6]) + 'C' + pt([hx + 10, hy - 18]) + ' ' + pt([hx - 8, hy - 20]) + ' ' + pt([hx - 16, hy - 12]) + 'L' + pt([hx - 20, hy - 3]) + 'C' + pt([hx - 25, hy + 3]) + ' ' + pt([hx - 22, hy + 13]) + ' ' + pt([hx - 14, hy + 15]) + 'L' + pt([hx + 8, hy + 15]) + 'C' + pt([hx + 13, hy + 8]) + ' ' + pt([hx + 14, hy]) + ' ' + pt([hx + 12, hy - 6]) + 'Z';
      o += body(c, hd, sk, F(pd([[hx + 2, hy - 22], [hx + 18, hy - 22], [hx + 18, hy + 18], [hx + 4, hy + 18]], true), dk(sk, 0.28), 0.8) + F('M' + pt([hx - 22, hy + 6]) + 'L' + pt([hx + 10, hy + 6]) + 'L' + pt([hx + 8, hy + 16]) + 'L' + pt([hx - 16, hy + 16]) + 'Z', dk(sk, 0.15), 0.8) + barnacles(508, 5, hx - 8, hx + 8, hy - 16, hy - 10, 1.1), 2.2);
      o += P('M' + pt([hx - 18, hy - 6]) + 'C' + pt([hx - 12, hy - 12]) + ' ' + pt([hx, hy - 12]) + ' ' + pt([hx + 4, hy - 8]) + 'L' + pt([hx + 2, hy - 4]) + 'C' + pt([hx - 4, hy - 7]) + ' ' + pt([hx - 12, hy - 6]) + ' ' + pt([hx - 18, hy - 2]) + 'Z', c.cel(dk(sk, 0.2)), 1.4);
      o += glowEye(c, hx - 10, hy - 3, 1.8, '#ffcc40') + glowEye(c, hx - 1, hy - 3.4, 1.5, '#ffcc40');
      o += L('M' + pt([hx - 20, hy + 7]) + 'L' + pt([hx + 6, hy + 8]), OL, 1.6) + L('M' + pt([hx - 16, hy + 7.5]) + 'l0,-2 M' + pt([hx - 10, hy + 7.8]) + 'l0,-2 M' + pt([hx - 4, hy + 8]) + 'l0,-2', '#f0e8d0', 1.2);
      o += P('M' + pt([hx - 18, hy + 10]) + 'C' + pt([hx - 28, hy + 6]) + ' ' + pt([hx - 31, hy - 8]) + ' ' + pt([hx - 24, hy - 19]) + 'C' + pt([hx - 23, hy - 8]) + ' ' + pt([hx - 18, hy + 2]) + ' ' + pt([hx - 11, hy + 7]) + 'Z', c.cel('#f0e6c8'), 1.6);
      o += P('M' + pt([hx - 4, hy + 11]) + 'C' + pt([hx - 10, hy + 6]) + ' ' + pt([hx - 10, hy - 2]) + ' ' + pt([hx - 6, hy - 8]) + 'C' + pt([hx - 5, hy - 2]) + ' ' + pt([hx - 3, hy + 3]) + ' ' + pt([hx + 1, hy + 7]) + 'Z', c.cel('#e0d6b8'), 1.4);
      // near arm dragging the anchor
      o += anchor(c, 22, 119, 0.76, 0.32, '#4a4e56');
      o += limb('M44,56 L28,76', lt(sk, 0.04), 18) + limb('M28,76 L34,84', sk, 16) + C(34, 86, 10, c.cel(sk), 2.2) + L('M28,90 l3,3 M33,92 l2,3 M38,91 l2,3', dk(sk, 0.4), 1.2);
      o += L('M22,66 C28,62 38,70 32,78 C26,84 36,90 40,84', OL, 4.4) + L('M22,66 C28,62 38,70 32,78 C26,84 36,90 40,84', '#8a8e96', 2.2) + barnacles(509, 6, 30, 46, 56, 70, 1.3) + kelp(c, 20, 76, 34, 78, 3, 14, 510, KELP, 3.6);
      return o + drops([[18, 100], [112, 88], [60, 110, 0.9]]) + motes(511, 8, 10, 120, 10, 60, '#bff4ee');
    }
  };
  // ---- skeleton rig (shared copy of art_plaguelands.js) ----
  function boneLimb(pts, w, col) { var d = pd(pts); return L(d, OL, w + 3.6) + L(d, col, w) + pts.slice(1, -1).map(function (p) { return C(p[0], p[1], w * 0.78, col, 1.4); }).join(''); }
  function boneFoot(x, y, col) {
    return P('M' + n(x + 3) + ',' + n(y - 4) + ' L' + n(x + 4) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 9) + ',' + n(y - 2) + ' ' + n(x - 5) + ',' + n(y - 3) + ' ' + n(x - 2) + ',' + n(y - 4) + ' Z', col, 1.6) +
      L('M' + n(x - 5) + ',' + n(y - 2) + ' L' + n(x - 5) + ',' + n(y + 1) + ' M' + n(x - 2) + ',' + n(y - 3) + ' L' + n(x - 2) + ',' + n(y + 1), OL, 0.9);
  }
  function skullHead(c, x, y, o) {
    var b = o.bone || BONE, eye = o.eye || '#6ad4ff', s = '';
    var d = 'M' + pt([x + 10, y - 2]) + 'C' + pt([x + 11, y - 13]) + ' ' + pt([x - 2, y - 17]) + ' ' + pt([x - 9, y - 10]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 12, y]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 9, y + 7]) + 'L' + pt([x - 2, y + 8]) + 'L' + pt([x + 4, y + 6]) + 'C' + pt([x + 8, y + 5]) + ' ' + pt([x + 10, y + 2]) + ' ' + pt([x + 10, y - 2]) + 'Z';
    s += P('M' + pt([x - 10, y + 6]) + 'L' + pt([x - 9, y + 12]) + 'L' + pt([x + 1, y + 13]) + 'L' + pt([x + 5, y + 6]) + 'L' + pt([x - 2, y + 8]) + 'Z', c.cel(dk(b, 0.08)), 1.6);
    s += body(c, d, b, F(pd([[x + 2, y - 18], [x + 14, y - 18], [x + 14, y + 8], [x + 4, y + 8]], true), dk(b, 0.3), 0.8) + L('M' + pt([x + 2, y - 12]) + 'l3,4 l-1,3', dk(b, 0.45), 0.9), 2);
    s += L('M' + pt([x - 9.6, y + 8.4]) + 'L' + pt([x, y + 9.6]) + 'M' + pt([x - 7, y + 7]) + 'l0,4 M' + pt([x - 4.4, y + 7.6]) + 'l0,4 M' + pt([x - 1.8, y + 8]) + 'l0,4', OL, 1);
    s += E(x - 6, y - 2, 3.6, 3.8, OL) + E(x + 1.6, y - 2.6, 2.6, 3.4, OL) + glowEye(c, x - 6, y - 2, 1.5, eye) + glowEye(c, x + 1.6, y - 2.6, 1.2, eye);
    s += P(pd([[x - 10.5, y + 3], [x - 8.5, y - 0.4], [x - 7.4, y + 3.4]], true), OL, 0.8);
    s += L('M' + pt([x - 10, y - 9]) + 'C' + pt([x - 5, y - 16]) + ' ' + pt([x + 4, y - 16]) + ' ' + pt([x + 8, y - 11]), RIM, 1, 0.6);
    return s;
  }
  function skeleton(c, o) {
    var b = o.bone || BONE, bf = dk(b, 0.22), s = '', hx = o.hx || 56, hy = o.hy || 30;
    s += shadow(c, 64, o.shadowR || 28);
    if (o.back) s += o.back(c);
    var far = o.far || [[72, 52], [84, 42], [82, 28]], near = o.near || [[52, 52], [44, 66], [38, 78]];
    var lf = o.legF || [[68, 86], [72, 103], [72, 117]], ln = o.legN || [[57, 88], [53, 104], [52, 117]];
    s += boneLimb(far, 3.6, bf);
    if (o.wFar) s += o.wFar(c, far[2]);
    s += C(far[2][0], far[2][1], 3.4, c.cel(bf), 1.6);
    s += boneLimb(lf, 4, bf) + boneFoot(lf[2][0] + 1, 121, c.cel(bf));
    s += F('M46,50 C50,44 70,44 72,50 L70,74 C64,80 52,80 48,74 Z', '#0a0c12', 0.55);
    if (o.inside) s += o.inside(c);
    s += L('M64,44 C68,58 62,72 64,86', OL, 7) + L('M64,44 C68,58 62,72 64,86', bf, 3.6);
    for (var i = 0; i < 4; i++) { var ry = 52 + i * 6.4, w = 19 - i * 1.6, rd = 'M' + pt([66, ry]) + 'C' + pt([62 - w * 0.2, ry - 4]) + ' ' + pt([66 - w, ry - 2]) + ' ' + pt([67 - w, ry + 4]); s += L(rd, OL, 5.6) + L(rd, b, 2.8); }
    s += L('M48,52 L49,74', OL, 5) + L('M48,52 L49,74', b, 2.4) + L('M52,48 C56,45 66,45 70,48', OL, 5.6) + L('M52,48 C56,45 66,45 70,48', b, 3);
    if (o.cloth) s += o.cloth(c);
    s += P('M52,82 C56,77 72,77 76,82 L74,90 L66,88 L62,93 L54,90 Z', c.cel(b), 1.8) + C(60, 86, 2, OL, 0, 0.8);
    if (o.hips) s += o.hips(c);
    s += boneLimb(ln, 4, b) + boneFoot(ln[2][0], 121, c.cel(b));
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    s += L('M61,45 L58,38', OL, 6.4) + L('M61,45 L58,38', b, 3.2);
    s += skullHead(c, hx, hy, { bone: b, eye: o.eye });
    if (o.headX) s += o.headX(c, hx, hy);
    s += C(near[0][0], near[0][1], 4, c.cel(b), 1.6);
    if (o.wNear) s += o.wNear(c, near[2]);
    s += boneLimb(near, 3.8, b) + C(near[2][0], near[2][1], 3.6, c.cel(b), 1.6);
    if (o.wNearFront) s += o.wNearFront(c, near[2]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  function cutlass(c, p, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(4, 0)), '#3a2418', 3.4);
    o += L('M' + pt(q(4, -5)) + 'Q' + pt(q(-4, -8)) + ' ' + pt(q(-7, 0)), OL, 3.4) + L('M' + pt(q(4, -5)) + 'Q' + pt(q(-4, -8)) + ' ' + pt(q(-7, 0)), GOLD, 1.8);
    var bl = 'M' + pt(q(4, -3)) + 'Q' + pt(q(22, -5)) + ' ' + pt(q(36, 2)) + 'Q' + pt(q(24, 4)) + ' ' + pt(q(4, 3)) + 'Z';
    return o + P(bl, c.cel('#d4dae2'), 1.6) + L('M' + pt(q(8, -2)) + 'Q' + pt(q(22, -3.6)) + ' ' + pt(q(32, 1)), '#ffffff', 0.9, 0.7);
  }
  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#4a9a94'), 2.5); }
  function phScene(c) { return sky(c, '#27303e', '#587482', '#e6d8a4') + ground(c, 118, SAND, WET); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#4a9a94"/></svg>'; }
    }
  }
  var has = function (t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); };
  var baseScene = typeof ART.scene === 'function' ? ART.scene : function () { var c = new Ctx(); return c.svg(400, 240, phScene(c)); };
  var baseMob = typeof ART.mob === 'function' ? ART.mob : function () { var c = new Ctx(); return c.svg(128, 128, phMob(c)); };
  ART.scene = function (k) { return has(SCENES, k) ? make(SCENES, k, 400, 240, phScene) : baseScene.apply(this, arguments); };
  ART.mob = function (k) { return has(MOBS, k) ? make(MOBS, k, 128, 128, phMob) : baseMob.apply(this, arguments); };
  ART.keys = ART.keys || {};
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  ART.keys.scenes = addKeys(ART.keys.scenes, Object.keys(SCENES));
  ART.keys.mobs = addKeys(ART.keys.mobs, Object.keys(MOBS));
})(typeof window !== 'undefined' ? window : this);
