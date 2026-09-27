/* art_tidewatch.js — Tidewatch Coast art for Azeroth Solo (expansion "The Drowned Crown", Alliance zone, level 60: the
 * Stormveil Isle, risen from the sea after ten thousand years; the Highborne city of Sael'anor, overgrown with coral,
 * barnacles and kelp. The Kul Tiran expedition camp at Brightwater Landing, the Saltmarsh Shallows, the Kelpwood, the
 * Drowned Orchards, the Archive Steps and the Sael'anor Outskirts; reefclaw snappers, tidebound husks, kelp horrors,
 * tidebound sentinels and sorceresses, the rare crab Old Brinescale and the elite Warden Ithrael).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Tidewatch keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, tents, crates, banners and the house-style scene pieces are shared copies of
 * art_plaguelands.js; waves, reeds, driftwood, starfish and light shafts are copies of art_stranglethorn.js.
 * New here: the drowned-elf (Tidebound) head and gear, Highborne spires and arches, coral, barnacles, kelp stalks,
 * tide pools, the Kul Tiran ship, pier and anchor banner, the crab rig and the kelp mass.
 * The Tidebound are an original faction: pale sea-green skin, teal glowing eyes, coral and pearl accents, solid (not
 * ghostly), with legs (not naga tails).
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix tw<counter>_).
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
  function Ctx() { this.p = 'tw' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }

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

  // ============================================================
  //  PALETTE
  // ============================================================
  // sea and shore
  var SEA = '#4e8e96', SEAD = '#2a5a66', SEAL = '#a6ccc8', FOAM = '#f2faf4', SAND = '#cdbb8e';
  // Highborne stone, teal roofs, moon silver
  var STONE = '#dcd8c8', TEAL = '#3e8c8a', TEALL = '#7ccac0', MOONC = '#eef4e2';
  // coral, pearl, kelp, barnacles
  var CORAL = '#ee7a62', CORALD = '#b84a44', CORALL = '#ffb4a0', CORALP = '#e87aa0', PEARL = '#f4f0e4', KELP = '#6a7a2e', BARN = '#dcd8c6';
  // the Kul Tiran expedition
  var NAVY = '#23386a', KGOLD = '#e0b040', CANVAS = '#e6e0cc', WOOD = '#6a4a2e', ABLUE = '#2a4a9e';
  // the Tidebound (drowned elves)
  var DSK = '#a6d4c2', DEYE = '#3cf4dc', DARM = '#4f8a92', DROBE = '#2c5e6e', TGOLD = '#c8a458', WATER = '#8ee0ea';

  // ============================================================
  //  SCENE PIECES (shared house style, copies of art_plaguelands.js)
  // ============================================================
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
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
  function stoneFace(c, x, y, w, h, col, js, top) {
    // top: optional list of [dx, dy] points (relative to x, y-h) replacing the flat top edge, for broken walls
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.22), 0.8, 0.7) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.2), 0.6), 1.8);
  }
  function ruinTop(w, h, seed) { var r = rng(seed), top = [], k = Math.max(3, Math.round(w / 11)); for (var i = 0; i <= k; i++) top.push([w * i / k, r() < 0.4 ? h * (0.25 + r() * 0.5) : r() * h * 0.15]); return top; }
  function tent(c, x, y, s, col, trim) {
    col = col || CANVAS; trim = trim || NAVY;
    var o = E(x + 8 * s, y + 1, 36 * s, 4 * s, '#000', 0, 0.3);
    o += L('M' + pt([x, y - 36 * s]) + 'L' + pt([x - 34 * s, y + 1]) + 'M' + pt([x + 34 * s, y - 30 * s]) + 'L' + pt([x + 56 * s, y + 1]), '#6a5a44', 0.9 * s);
    o += P(pd([[x, y - 36 * s], [x + 34 * s, y - 30 * s], [x + 46 * s, y], [x + 22 * s, y]], true), c.cel(dk(col, 0.2)), 1.6 * s) + L('M' + pt([x + 12 * s, y - 34 * s]) + 'L' + pt([x + 30 * s, y]) + 'M' + pt([x + 24 * s, y - 32 * s]) + 'L' + pt([x + 38 * s, y]), dk(col, 0.35), 0.9 * s, 0.7);
    var d = pd([[x - 26 * s, y], [x, y - 36 * s], [x + 26 * s, y]], true);
    o += body(c, d, col, F(pd([[x + 2 * s, y - 38 * s], [x + 30 * s, y + 2], [x + 6 * s, y + 2]], true), dk(col, 0.14), 0.7) + L('M' + pt([x - 24 * s, y - 3.4 * s]) + 'L' + pt([x + 24 * s, y - 3.4 * s]), trim, 3 * s) + L('M' + pt([x - 21 * s, y - 7.4 * s]) + 'L' + pt([x + 21 * s, y - 7.4 * s]), KGOLD, 1 * s), 1.8 * s);
    o += P(pd([[x - 8 * s, y], [x, y - 20 * s], [x + 8 * s, y]], true), '#2a2420', 1.2 * s) + P(pd([[x, y - 20 * s], [x + 3 * s, y - 18 * s], [x + 12 * s, y], [x + 8 * s, y]], true), c.cel(lt(col, 0.06)), 1 * s);
    return o + limb('M' + pt([x, y - 36 * s]) + 'L' + pt([x, y - 44 * s]), '#6a4a2a', 1.3 * s) + P(pd([[x, y - 44 * s], [x + 9 * s, y - 42 * s], [x, y - 40 * s]], true), trim, 0.8 * s);
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
  function sack(c, x, y, s) {
    var col = '#c8b88a';
    return E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.3) + P('M' + pt([x - 8 * s, y]) + 'C' + pt([x - 10 * s, y - 10 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + ' ' + pt([x - 2 * s, y - 14 * s]) + 'L' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'L' + pt([x + 2 * s, y - 14 * s]) + 'C' + pt([x + 4 * s, y - 14 * s]) + ' ' + pt([x + 10 * s, y - 10 * s]) + ' ' + pt([x + 8 * s, y]) + 'Z', c.cel(col), 1.3 * s) +
      L('M' + pt([x - 3 * s, y - 14 * s]) + 'L' + pt([x + 3 * s, y - 14 * s]), '#6a4a2a', 1.2 * s);
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 8 * s, 30 * s, glow(c, '#ffa040', 0.5)) + E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x + 8 * s, y - 5 * s]), '#5a3a22', 2.8 * s) + limb('M' + pt([x + 10 * s, y]) + 'L' + pt([x - 8 * s, y - 5 * s]), '#6a4428', 2.8 * s);
    o += flame(c, x, y - 2 * s, 0.9 * s);
    for (var i = 0; i < 5; i++) { var a = PI * (0.1 + 0.8 * i / 4); o += E(x + Math.cos(a) * 12 * s, y + Math.sin(a) * 2.6 * s, 3.4 * s, 2.3 * s, c.cel('#76746c'), 1 * s); }
    return o;
  }
  function brazier(c, x, y, s, fo, fi) {
    var o = E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.3) + C(x, y - 20 * s, 30 * s, glow(c, fo || '#ff9a3a', 0.5));
    o += limb('M' + pt([x - 6 * s, y]) + 'L' + pt([x, y - 12 * s]) + 'L' + pt([x + 6 * s, y]) + 'M' + pt([x, y - 12 * s]) + 'L' + pt([x, y]), '#3a3434', 1.5 * s);
    o += flame(c, x, y - 15 * s, 0.8 * s, fo, fi);
    return o + P('M' + pt([x - 8 * s, y - 17 * s]) + 'L' + pt([x + 8 * s, y - 17 * s]) + 'L' + pt([x + 5 * s, y - 11 * s]) + 'L' + pt([x - 5 * s, y - 11 * s]) + 'Z', c.cel('#4a4444'), 1.3 * s) + L('M' + pt([x - 7 * s, y - 15 * s]) + 'L' + pt([x + 7 * s, y - 15 * s]), '#6a6464', 0.9 * s);
  }
  // pole banner, cloth hanging to the right of the pole
  function poleBanner(c, x, y, h, s, col, trim, em) {
    var top = y - h, w = 14 * s, bh = 30 * s;
    var o = E(x, y + 1, 5 * s, 1.4 * s, '#000', 0, 0.3) + limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), '#5a3e24', 2 * s) + C(x, top - 5 * s, 2.2 * s, c.cel(KGOLD), 1 * s);
    o += limb('M' + pt([x - 2 * s, top]) + 'L' + pt([x + w + 3 * s, top]), '#5a3e24', 1.4 * s);
    var bx = x + 1.5 * s, d = pd([[bx, top], [bx + w, top], [bx + w, top + bh], [bx + w / 2, top + bh - 6 * s], [bx, top + bh]], true);
    o += body(c, d, col, F(pd([[bx + w * 0.62, top - 2], [bx + w + 2, top - 2], [bx + w + 2, top + bh + 2], [bx + w * 0.62, top + bh]], true), dk(col, 0.3), 0.6) +
      L(pd([[bx + 2 * s, top + 1], [bx + 2 * s, top + bh - 2.6 * s], [bx + w / 2, top + bh - 8 * s], [bx + w - 2 * s, top + bh - 2.6 * s], [bx + w - 2 * s, top + 1]]), trim, 1.2 * s), 1.4 * s);
    return o + (em ? em(c, bx + w / 2, top + bh * 0.42, s) : '');
  }
  // banner emblems (x, y = centre): the Kul Tiran anchor, the Alliance crown (copy of art_plaguelands.js emCrown)
  function emAnchor(c, x, y, k) {
    var d = 'M' + pt([x, y - 4.6 * k]) + 'L' + pt([x, y + 6 * k]) + 'M' + pt([x - 3.6 * k, y - 2.4 * k]) + 'L' + pt([x + 3.6 * k, y - 2.4 * k]) + 'M' + pt([x - 5.4 * k, y + 1.4 * k]) + 'Q' + pt([x - 4.6 * k, y + 6.4 * k]) + ' ' + pt([x, y + 6.2 * k]) + 'Q' + pt([x + 4.6 * k, y + 6.4 * k]) + ' ' + pt([x + 5.4 * k, y + 1.4 * k]);
    var ring = ellD(x, y - 6.4 * k, 1.8 * k, 1.8 * k);
    return L(d + ring, OL, 3.2 * k) + L(d + ring, KGOLD, 1.6 * k) + P(pd([[x - 6.6 * k, y + 2.6 * k], [x - 5.4 * k, y - 0.2 * k], [x - 3.8 * k, y + 2.4 * k]], true), KGOLD, 0.6 * k) + P(pd([[x + 6.6 * k, y + 2.6 * k], [x + 5.4 * k, y - 0.2 * k], [x + 3.8 * k, y + 2.4 * k]], true), KGOLD, 0.6 * k);
  }
  function emCrown(c, x, y, k) { return C(x, y, 7 * k, c.cel(KGOLD), 1 * k) + P(pd([[x - 4.4 * k, y + 3 * k], [x - 5 * k, y - 3 * k], [x - 2 * k, y - 0.4 * k], [x, y - 4.4 * k], [x + 2 * k, y - 0.4 * k], [x + 5 * k, y - 3 * k], [x + 4.4 * k, y + 3 * k]], true), ABLUE, 0.8 * k); }

  // ============================================================
  //  SCENE PIECES: water and shore (waves, reeds, driftwood, shafts are copies of art_stranglethorn.js)
  // ============================================================
  function seaSky(c, top, mid, bot) { return sky(c, top || '#7fa6b4', mid || '#c2d8d8', bot || '#eef0e4'); }
  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#eef4f0', op || 0.3, Math.round(y * 3 + h)); }
  function waves(seed, y0, y1, cnt, col, op) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, op == null ? 0.7 : op);
  }
  function sea(c, y0, y1, seed, top, bot) {
    return R(-2, y0, 404, y1 - y0 + 2, c.lg([[0, top || SEAL], [0.45, SEA], [1, bot || SEAD]])) + F(pd([[-2, y0], [402, y0], [402, y0 + 1.6], [-2, y0 + 1.6]], true), FOAM, 0.7) + waves(seed, y0 + 3, y1 - 1, 30, FOAM, 0.55);
  }
  function foamLine(d, w) { return L(d, FOAM, w || 2.2, 0.85) + L(d, '#ffffff', (w || 2.2) * 0.4, 0.9); }
  function reeds(c, x, y, s, col, seed) {
    col = col || '#8a9a4a'; s = s || 1;
    var r = rng(seed || Math.round(x * 7 + y * 3)), d = '', hd = '';
    for (var i = 0; i < 7; i++) {
      var bx = x + (i - 3) * 2.4 * s, h = (20 + r() * 18) * s, lean = ((i - 3) * 2 + (r() - 0.5) * 6) * s;
      d += 'M' + pt([bx, y]) + 'Q' + pt([bx + lean * 0.2, y - h * 0.6]) + ' ' + pt([bx + lean, y - h]);
      if (i % 2 === 0 && r() < 0.85) hd += E(bx + lean * 0.62, y - h * 0.78, 1.9 * s, 4.6 * s, c.cel('#6a4424'), 1.1 * s);
    }
    var lv = P('M' + pt([x - 2 * s, y]) + 'Q' + pt([x - 12 * s, y - 12 * s]) + ' ' + pt([x - 17 * s, y - 25 * s]) + 'Q' + pt([x - 8 * s, y - 12 * s]) + ' ' + pt([x + 1 * s, y]) + 'Z', c.cel(dk(col, 0.12)), 1.1 * s) +
      P('M' + pt([x + 1 * s, y]) + 'Q' + pt([x + 10 * s, y - 10 * s]) + ' ' + pt([x + 16 * s, y - 21 * s]) + 'Q' + pt([x + 6 * s, y - 10 * s]) + ' ' + pt([x + 3 * s, y]) + 'Z', c.cel(col), 1.1 * s);
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.2) + L(d, OL, 2.8 * s) + L(d, col, 1.3 * s) + lv + hd;
  }
  function driftwood(c, x, y, len, ang, s) {
    s = s || 1; var q = dirQ([x, y], ang), col = '#b4aa98', e = q(0, 0);
    var o = E(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2 + 3 * s, len * 0.56, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt(q(len * 0.3, 0)) + 'L' + pt(q(len * 0.42, -13 * s)) + 'M' + pt(q(len * 0.7, 0)) + 'L' + pt(q(len * 0.8, -9 * s)) + 'L' + pt(q(len * 0.92, -13 * s)), col, 2.4 * s);
    o += limb('M' + pt(q(0, 0)) + 'L' + pt(q(len, 0)), col, 7 * s) + L('M' + pt(q(3, -1.8 * s)) + 'L' + pt(q(len - 2, -1.8 * s)), lt(col, 0.4), 1.2 * s, 0.8) + L('M' + pt(q(len * 0.2, 1.6 * s)) + 'L' + pt(q(len * 0.5, 1.9 * s)) + 'M' + pt(q(len * 0.6, 1 * s)) + 'L' + pt(q(len * 0.86, 1.7 * s)), dk(col, 0.35), 0.9 * s);
    return o + E(e[0], e[1], 2.6 * s, 4 * s, c.cel('#d8d0bc'), 1.2 * s) + L(ellD(e[0], e[1], 1.2 * s, 2 * s), '#8a806e', 0.6 * s);
  }
  function shafts(c, seed, cnt, op, col, y1) {
    var r = rng(seed), o = ''; y1 = y1 || 200;
    for (var i = 0; i < cnt; i++) { var x = 10 + r() * 360, w = 10 + r() * 22, sk = 30 + r() * 30; o += F(pd([[x, -2], [x + w, -2], [x + w + sk, y1], [x + sk - w * 0.3, y1]], true), c.lg([[0, col || '#fff4c0', op || 0.3], [1, col || '#fff4c0', 0]])); }
    return o;
  }
  // wet sand: a ground band with glossy wet patches
  function wetSand(c, y, seed, top, bot) {
    var r = rng(seed), o = ground(c, y, top || '#bcae88', bot || '#7a6c50');
    for (var i = 0; i < 14; i++) { var yy = y + 6 + r() * (234 - y), t = (yy - y) / (240 - y), w = 16 + t * 58; o += E(r() * 400, yy, w, w * 0.12, i % 3 ? '#8a8e80' : '#e4dcc4', 0, 0.35); }
    return o + R(0, y - 1, 400, 5, c.lg([[0, '#000', 0.2], [1, '#000', 0]]));
  }
  // a thin sheet of standing sea water on the flats, with a sky glint and ripples
  function shallows(c, x, y, rx, ry, col) {
    col = col || '#6aa8aa';
    var rp = 'M' + pt([x - rx * 0.6, y - ry * 0.05]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.35) + ' ' + n(rx * 0.4) + ',0' + 'M' + pt([x + rx * 0.1, y + ry * 0.4]) + 'q' + n(rx * 0.18) + ',' + n(-ry * 0.3) + ' ' + n(rx * 0.36) + ',0';
    return E(x, y + ry * 0.18, rx + 3, ry + 1.6, '#8a7e5e', 0, 0.45) + E(x, y, rx, ry, c.lg([[0, dk(col, 0.18)], [0.6, col], [1, lt(col, 0.3)]]), 0) + E(x - rx * 0.2, y - ry * 0.3, rx * 0.5, ry * 0.22, '#f0f8f4', 0, 0.4) + L(rp, lt(col, 0.55), 0.9, 0.8);
  }
  function puddle(c, x, y, rx, ry, col) { col = col || '#6a9a8a'; return E(x, y, rx, ry, c.lg([[0, dk(col, 0.25)], [1, lt(col, 0.2)]]), 0, 0.85) + E(x - rx * 0.25, y - ry * 0.25, rx * 0.45, ry * 0.2, '#f0f8f0', 0, 0.35); }

  // ============================================================
  //  SCENE PIECES: the sea and its growths (new here)
  // ============================================================
  // branching coral (x, y = base)
  function coral(c, x, y, s, col, seed, k) {
    var r = rng(seed || 5), d = '', tips = [], w = 2.6 * s;
    k = k || 5; col = col || CORAL;
    for (var i = 0; i < k; i++) {
      var a = -PI / 2 + (i - (k - 1) / 2) * 0.42 + (r() - 0.5) * 0.3, len = (9 + r() * 7) * s;
      var m = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5], e = [x + Math.cos(a) * len, y + Math.sin(a) * len];
      d += 'M' + pt([x, y]) + 'Q' + pt([m[0] + (r() - 0.5) * 3 * s, m[1]]) + ' ' + pt(e); tips.push(e);
      var b = a + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.3), bl = len * 0.55, be = [m[0] + Math.cos(b) * bl, m[1] + Math.sin(b) * bl];
      d += 'M' + pt(m) + 'L' + pt(be); tips.push(be);
    }
    return E(x, y + 1, 8 * s, 1.8 * s, '#000', 0, 0.2) + L(d, OL, w + 2.4 * Math.max(0.6, s)) + L(d, col, w) + L(d, lt(col, 0.3), w * 0.35, 0.7) + tips.map(function (t) { return C(t[0], t[1], w * 0.6, lt(col, 0.35)); }).join('');
  }
  // round brain coral
  function brainCoral(c, x, y, rx, ry, col) {
    col = col || CORALP; var d = '';
    for (var i = 0; i < 3; i++) { var yy = y - ry * 0.5 + i * ry * 0.45; d += 'M' + pt([x - rx * 0.7, yy]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.3) + ' ' + n(rx * 0.4) + ',0 t' + n(rx * 0.4) + ',0 t' + n(rx * 0.4) + ',0'; }
    return P(ellD(x, y, rx, ry), c.cel(col), 1.2) + L(d, dk(col, 0.3), 0.8, 0.85) + E(x - rx * 0.3, y - ry * 0.45, rx * 0.3, ry * 0.2, lt(col, 0.4), 0, 0.7);
  }
  function barnacles(seed, cnt, x0, x1, y0, y1, s) {
    var r = rng(seed), o = ''; s = s || 1;
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (1.1 + r() * 1.3) * s; o += C(x, y, rr, BARN, 0.7 * s) + C(x, y - rr * 0.1, rr * 0.42, '#4a4a44'); }
    return o;
  }
  function kelpHang(x, y, len, seed, col, w) {
    var r = rng(seed), d = 'M' + pt([x, y]), yy = y, xx = x; w = w || 1.6;
    for (var i = 0; i < 4; i++) { var dy = len / 4, side = i % 2 ? 1 : -1; d += 'q' + n(side * (2 + r() * 2)) + ',' + n(dy * 0.5) + ' ' + n((r() - 0.5) * 2) + ',' + n(dy); yy += dy; }
    return L(d, OL, w + 2) + L(d, col || '#5e7a34', w);
  }
  function shell(c, x, y, s, col) {
    col = col || '#f0d8c0';
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 6 * s, y - 4 * s]) + 'C' + pt([x - 7.4 * s, y - 10 * s]) + ' ' + pt([x + 7.4 * s, y - 10 * s]) + ' ' + pt([x + 6 * s, y - 4 * s]) + 'Z', rd = '';
    for (var k = -2; k <= 2; k++) rd += 'M' + pt([x, y]) + 'L' + pt([x + k * 2.6 * s, y - 8.4 * s]);
    return E(x, y + 0.5, 6 * s, 1.4 * s, '#000', 0, 0.2) + P(d, c.cel(col), 0.9 * s) + L(rd, dk(col, 0.3), 0.6 * s);
  }
  function starfish(c, x, y, r, col) { return P(starD(x, y, r, 0.42), c.cel(col || '#e8783a'), Math.max(0.6, r * 0.14)) + C(x, y, r * 0.2, lt(col || '#e8783a', 0.3)); }
  function anemone(c, x, y, s, col) {
    col = col || CORALP; var d = '';
    for (var i = 0; i < 7; i++) { var a = -PI + PI * (i + 0.5) / 7; d += 'M' + pt([x, y - 2 * s]) + 'Q' + pt([x + Math.cos(a) * 4 * s, y - 2 * s + Math.sin(a) * 6 * s]) + ' ' + pt([x + Math.cos(a) * 6.4 * s, y - 3 * s + Math.sin(a) * 7 * s]); }
    return E(x, y, 4 * s, 2.4 * s, c.cel(dk(col, 0.2)), 0.9 * s) + L(d, OL, 2.6 * s) + L(d, col, 1.4 * s) + L(d, lt(col, 0.4), 0.5 * s, 0.8);
  }
  function tidePool(c, x, y, rx, ry, seed) {
    var r = rng(seed || 7), o = E(x, y + 1, rx + 7, ry + 3.6, '#000', 0, 0.2) + E(x, y, rx + 5, ry + 3, c.cel('#76726a'), 1.2);
    o += E(x, y + 0.4, rx, ry, c.lg([[0, '#1e4a52'], [1, '#6aaaa6']]), 1) + E(x - rx * 0.3, y - ry * 0.35, rx * 0.38, ry * 0.16, '#e8f4f0', 0, 0.35);
    o += starfish(c, x + rx * 0.35, y + ry * 0.15, Math.min(6, rx * 0.22)) + anemone(c, x - rx * 0.45, y + ry * 0.3, Math.min(1, rx / 22), CORALP);
    for (var i = 0; i < 5; i++) { var a = PI * (0.1 + 0.2 * i) + (i > 2 ? PI : 0), w = (5 + r() * 5) * (rx / 18); o += rock(c, x + Math.cos(a) * (rx + 3), y + Math.sin(a) * (ry + 2) + 2, w, w * 0.6, '#8a867a'); }
    return o + barnacles(seed + 1, 5, x - rx, x + rx, y - ry - 2, y - ry + 1, 0.8);
  }
  function burrow(c, x, y, s) {
    var o = E(x, y, 12 * s, 4.2 * s, c.cel('#c8b88e'), 1 * s) + E(x, y - 0.4 * s, 5.4 * s, 2.1 * s, '#241c14') + E(x - 1 * s, y - 1 * s, 3.6 * s, 0.9 * s, '#5a4a36', 0, 0.8);
    [[-9, 2], [8, 2.6], [11, -1], [-6, 3.6], [3, 4]].forEach(function (p) { o += C(x + p[0] * s, y + p[1] * s, 1.1 * s, '#d8ccaa', 0.5 * s); });
    return o;
  }
  // a giant kelp stalk rising from wet ground; flat = distant silhouette
  function kelpStalk(c, x, yb, ytop, w, col, seed, o) {
    o = o || {};
    var r = rng(seed), pts = [], k = 7, s = '', ph = r() * PI * 2, sway = o.sway == null ? 10 : o.sway;
    for (var i = 0; i <= k; i++) { var t = i / k; pts.push([x + Math.sin(ph + t * 3.2) * sway * t + (o.lean || 0) * t, yb - (yb - ytop) * t]); }
    var T = taper(pts, w, w * 0.55, 5), bl = '', bd = '', m = T.s.length;
    for (var j = 3; j < m - 1; j += 3) {
      var p = T.s[j], side = (j / 3) % 2 ? 1 : -1, len = (14 + r() * 10) * (w / 7), droop = (6 + r() * 10) * (w / 7);
      var B = taper([[p[0], p[1]], [p[0] + side * len * 0.4, p[1] - 3 * w / 7], [p[0] + side * len * 0.8, p[1] + droop * 0.4], [p[0] + side * len, p[1] + droop]], w * 0.95, 1, 4);
      if (o.flat) bl += F(B.d, lt(col, 0.05));
      else { bl += body(c, B.d, lt(col, 0.1), L(along(B, 0.5), dk(col, 0.28), 0.8), 1.1); bd += E(p[0] + side * w * 0.45, p[1] + 0.5, w * 0.34, w * 0.44, c.cel(o.bladder || '#b8a040'), 1); }
    }
    if (o.flat) return bl + F(T.d, col) + E(x, yb, w * 1.4, w * 0.4, col);
    s += bl + body(c, T.d, col, F(ribbonBand(T, 0.62, 1), dk(col, 0.28), 0.8) + L(bands(T, 4, 2), dk(col, 0.32), 0.8, 0.7) + F(ribbonBand(T, 0.08, 0.22), lt(col, 0.3), 0.5), 1.4) + bd;
    // holdfast: a clump of gripping roots
    var hf = '';
    for (var h = 0; h < 5; h++) { var a = PI * (0.12 + 0.19 * h); hf += 'M' + pt([x, yb - w * 0.4]) + 'Q' + pt([x + Math.cos(a) * w * 0.9, yb - w * 0.3]) + ' ' + pt([x + Math.cos(a) * w * 1.5, yb + Math.sin(a) * w * 0.3]); }
    return E(x, yb + 1, w * 1.8, w * 0.35, '#000', 0, 0.3) + s + L(hf, OL, w * 0.4 + 2) + L(hf, dk(col, 0.15), w * 0.4);
  }

  // ============================================================
  //  SCENE PIECES: Highborne ruins (new here)
  // ============================================================
  // crescent moon, horns to the right
  function moonD(x, y, r) { return 'M' + pt([x, y - r]) + 'A' + n(r) + ',' + n(r) + ' 0 0,0 ' + pt([x, y + r]) + 'A' + n(r * 0.55) + ',' + n(r) + ' 0 0,1 ' + pt([x, y - r]) + 'Z'; }
  function moon(c, x, y, r, col, gl) { return (gl ? C(x, y, r * 3, glow(c, gl, 0.5)) : '') + P(moonD(x, y, r), c.cel(col || MOONC), Math.max(0.6, r * 0.2)); }
  function roundel(c, x, y, r, col) { return C(x, y, r, c.cel(dk(col, 0.06)), 1) + F(moonD(x - r * 0.12, y, r * 0.62), TEAL, 0.9); }
  // an ogee spire top (bulging, then drawn to a needle) over a tapering tower
  function spireTopD(x, top, tw, sh) {
    return 'M' + pt([x - tw / 2 - 1, top]) + 'C' + pt([x - tw * 0.95, top - sh * 0.3]) + ' ' + pt([x - tw * 0.12, top - sh * 0.55]) + ' ' + pt([x, top - sh]) + 'C' + pt([x + tw * 0.12, top - sh * 0.55]) + ' ' + pt([x + tw * 0.95, top - sh * 0.3]) + ' ' + pt([x + tw / 2 + 1, top]) + 'Z';
  }
  function elfSpire(c, x, yb, w, h, col, o) {
    o = o || {};
    var top = yb - h, tw = w * 0.78, rf = o.roof || TEAL, s = '', rings = '';
    var shaft = pd([[x - w / 2, yb], [x + w / 2, yb], [x + tw / 2, top], [x - tw / 2, top]], true);
    for (var j = 1; j < 4; j++) { var yy = yb - h * j / 4, hw = (w + (tw - w) * j / 4) / 2; rings += 'M' + pt([x - hw, yy]) + 'L' + pt([x + hw, yy]); }
    var brk = o.broken ? pd([[x - tw / 2 - 2, top + 8], [x - tw * 0.2, top - 4], [x, top + 6], [x + tw * 0.25, top - 2], [x + tw / 2 + 2, top + 10], [x + w, top + 10], [x + w, top - 20], [x - w, top - 20]], true) : '';
    s += body(c, shaft, col, F(pd([[x + w * 0.12, top - 2], [x + w / 2 + 2, top - 2], [x + w / 2 + 2, yb + 2], [x + w * 0.16, yb + 2]], true), dk(col, 0.2), 0.7) + L(rings, TEAL, 1.6, 0.9) + (brk ? F(brk, o.sky || '#c8d8d6') : ''), 1.6);
    if (o.broken) s += L(pd([[x - tw / 2 - 2, top + 8], [x - tw * 0.2, top - 4], [x, top + 6], [x + tw * 0.25, top - 2], [x + tw / 2 + 2, top + 10]]), OL, 1.6);
    s += archWin(x, top + h * 0.4, w * 0.24, h * 0.18, o.win || '#1e3a40', 1) + (o.winGlow ? C(x, top + h * 0.34, w * 0.5, glow(c, o.winGlow, 0.45)) : '') + archWin(x, top + h * 0.78, w * 0.2, h * 0.12, '#1e3a40', 1);
    if (!o.broken) {
      var sh = w * (o.k || 2.4);
      s += R(x - tw / 2 - 3, top - 2, tw + 6, 4, c.cel(lt(col, 0.1)), 1.1);
      s += body(c, spireTopD(x, top - 2, tw, sh), rf, F(pd([[x, top - sh - 2], [x + tw, top - sh - 2], [x + tw, top + 2], [x, top + 2]], true), dk(rf, 0.3), 0.7) + L('M' + pt([x - tw * 0.3, top - 2]) + 'Q' + pt([x - tw * 0.3, top - sh * 0.45]) + ' ' + pt([x, top - sh]) + 'M' + pt([x + tw * 0.25, top - 2]) + 'Q' + pt([x + tw * 0.25, top - sh * 0.45]) + ' ' + pt([x, top - sh]), lt(rf, 0.3), 0.9, 0.8), 1.4);
      s += L('M' + pt([x, top - sh]) + 'L' + pt([x, top - sh - w * 0.3]), OL, 2.4) + L('M' + pt([x, top - sh]) + 'L' + pt([x, top - sh - w * 0.3]), MOONC, 1) + moon(c, x, top - sh - w * 0.3 - w * 0.2, Math.max(2, w * 0.2), MOONC, o.moonGlow);
    }
    if (o.coral) s += coral(c, x - w * 0.3, yb, w / 30, CORAL, o.seed || 11, 4) + brainCoral(c, x + w * 0.35, yb - 3, w * 0.2, w * 0.13, CORALP) + barnacles((o.seed || 11) + 1, Math.round(w / 3), x - w / 2 + 2, x + w / 2 - 2, yb - h * 0.3, yb - 2, 0.8);
    return s;
  }
  // flat, far spire silhouette
  function spireSil(x, yb, w, h, col) {
    var top = yb - h, tw = w * 0.78;
    return F(pd([[x - w / 2, yb], [x + w / 2, yb], [x + tw / 2, top], [x - tw / 2, top]], true), col) + F(spireTopD(x, top, tw, w * 2.4), col) + F(moonD(x, top - w * 2.4 - w * 0.3, w * 0.24), col);
  }
  // pointed Highborne arch on two slim pillars; o.broken drops the right half, o.over adds coral and kelp
  function elfArch(c, x, yb, w, h, col, o) {
    o = o || {};
    var pw = o.pw || w * 0.16, s = '', top = yb - h, ap = top - w * 0.72;
    var lA = 'M' + pt([x - w / 2, top + 2]) + 'C' + pt([x - w / 2, top - w * 0.42]) + ' ' + pt([x - w * 0.22, ap + w * 0.1]) + ' ' + pt([x, ap]);
    var rA = o.broken ? 'M' + pt([x + w / 2, top + 2]) + 'Q' + pt([x + w / 2, top - w * 0.3]) + ' ' + pt([x + w * 0.34, top - w * 0.46]) : 'M' + pt([x + w / 2, top + 2]) + 'C' + pt([x + w / 2, top - w * 0.42]) + ' ' + pt([x + w * 0.22, ap + w * 0.1]) + ' ' + pt([x, ap]);
    [-1, 1].forEach(function (sd) {
      var px = x + sd * w / 2, ph = sd > 0 && o.broken ? h * 0.62 : h, pt0 = yb - ph;
      var pdd = sd > 0 && o.broken ? pd([[px - pw / 2, yb], [px + pw / 2, yb], [px + pw / 2, pt0 + 4], [px + pw * 0.1, pt0], [px - pw / 2, pt0 + 6]], true) : pd([[px - pw / 2, yb], [px + pw / 2, yb], [px + pw / 2, pt0], [px - pw / 2, pt0]], true);
      s += body(c, pdd, col, F(pd([[px + pw * 0.1, pt0 - 2], [px + pw / 2 + 2, pt0 - 2], [px + pw / 2 + 2, yb + 2], [px + pw * 0.1, yb + 2]], true), dk(col, 0.22), 0.75) + L('M' + pt([px - pw * 0.2, pt0 + 4]) + 'L' + pt([px - pw * 0.2, yb - 4]), dk(col, 0.18), 0.8), 1.5);
      s += R(px - pw / 2 - 2.4, yb - 4, pw + 4.8, 4, c.cel(lt(col, 0.05)), 1.1);
      if (!(sd > 0 && o.broken)) s += R(px - pw / 2 - 2, pt0 - 3, pw + 4, 4, c.cel(TEAL), 1.1);
    });
    s += L(lA, OL, pw + 3) + L(lA, col, pw) + L(lA, TEAL, pw * 0.26, 0.85);
    s += L(rA, OL, pw + 3) + L(rA, dk(col, 0.08), pw) + L(rA, TEAL, pw * 0.26, 0.85);
    if (!o.broken) s += moon(c, x, ap - pw * 0.2, Math.max(2.2, pw * 0.62), MOONC, o.moonGlow);
    if (o.over) {
      s += coral(c, x - w / 2 - pw * 0.2, yb - 2, pw / 9, CORAL, o.seed || 21, 4) + coral(c, x + w / 2 + pw * 0.3, yb - 1, pw / 11, CORALP, (o.seed || 21) + 1, 3);
      s += brainCoral(c, x - w * 0.3, top - w * 0.3, pw * 0.5, pw * 0.34, CORALL) + barnacles((o.seed || 21) + 2, Math.round(h / 3), x - w / 2 - pw / 2, x - w / 2 + pw / 2, top, yb - 6, 0.8);
      s += kelpHang(x - w * 0.18, ap + w * 0.16, h * 0.4, (o.seed || 21) + 3, '#5e7a34') + kelpHang(x + w * 0.1, ap + w * 0.12, h * 0.28, (o.seed || 21) + 4, '#6a843a') + kelpHang(x - w * 0.4, top - w * 0.12, h * 0.3, (o.seed || 21) + 5, '#56722e');
    }
    return s;
  }
  function archSil(x, yb, w, h, col, broken) {
    var pw = w * 0.16, top = yb - h, ap = top - w * 0.72;
    var lA = 'M' + pt([x - w / 2, top + 2]) + 'C' + pt([x - w / 2, top - w * 0.42]) + ' ' + pt([x - w * 0.22, ap + w * 0.1]) + ' ' + pt([x, ap]);
    var rA = broken ? '' : 'M' + pt([x + w / 2, top + 2]) + 'C' + pt([x + w / 2, top - w * 0.42]) + ' ' + pt([x + w * 0.22, ap + w * 0.1]) + ' ' + pt([x, ap]);
    return R(x - w / 2 - pw / 2, top, pw, h, col) + R(x + w / 2 - pw / 2, broken ? yb - h * 0.5 : top, pw, broken ? h * 0.5 : h, col) + L(lA + rA, col, pw);
  }
  // a distant sea citadel of spires on a rock
  function farCitadel(c, x, y, s, col, win) {
    var o = F('M' + pt([x - 84 * s, y + 2]) + 'C' + pt([x - 60 * s, y - 12 * s]) + ' ' + pt([x + 60 * s, y - 14 * s]) + ' ' + pt([x + 88 * s, y + 2]) + 'Z', dk(col, 0.12));
    o += F(pd([[x - 58 * s, y - 6 * s], [x + 58 * s, y - 6 * s], [x + 54 * s, y - 24 * s], [x - 54 * s, y - 24 * s]], true), dk(col, 0.04));
    var sp = [[-50, 9, 30], [-32, 11, 48], [-14, 13, 64], [0, 17, 88], [16, 13, 60], [34, 11, 44], [52, 9, 28]];
    sp.forEach(function (q, i) { o += spireSil(x + q[0] * s, y - 20 * s, q[1] * s, q[2] * s, i % 2 ? col : lt(col, 0.07)); });
    sp.forEach(function (q) { var wx = x + q[0] * s, wy = y - 20 * s - q[2] * s * 0.55; o += C(wx, wy, 5 * s + 2, glow(c, win, 0.6)) + R(wx - 1 * s - 0.4, wy - 2.4 * s, 2 * s + 0.8, 4.4 * s, win); });
    return o + C(x, y - 20 * s - 88 * s - 17 * s * 2.4 - 6 * s, 10 * s + 4, glow(c, win, 0.5));
  }
  // robed Highborne statue, facing front (x, yb = feet)
  function statue(c, x, yb, s, col, headless) {
    col = col || STONE;
    var q = function (a, b) { return [x + a * s, yb + b * s]; }, o = '';
    var rb = 'M' + pt(q(-13, 0)) + 'C' + pt(q(-11, -20)) + ' ' + pt(q(-10, -40)) + ' ' + pt(q(-9, -52)) + 'L' + pt(q(9, -52)) + 'C' + pt(q(10, -40)) + ' ' + pt(q(11, -20)) + ' ' + pt(q(13, 0)) + 'Z';
    o += body(c, rb, col, L('M' + pt(q(-4, -40)) + 'L' + pt(q(-6, -1)) + 'M' + pt(q(3, -40)) + 'L' + pt(q(5, -1)) + 'M' + pt(q(0, -36)) + 'L' + pt(q(0, -1)), dk(col, 0.22), 0.9 * s) + F(pd([q(3, -54), q(15, -54), q(15, 2), q(5, 2)], true), dk(col, 0.2), 0.6), 1.5 * s);
    o += P('M' + pt(q(-10, -52)) + 'C' + pt(q(-12, -58)) + ' ' + pt(q(12, -58)) + ' ' + pt(q(10, -52)) + 'Z', c.cel(lt(col, 0.05)), 1.3 * s);
    o += C(q(0, -42)[0], q(0, -42)[1], 5 * s, c.cel(lt(col, 0.1)), 1.1 * s) + F(moonD(q(-0.6, -42)[0], q(0, -42)[1], 3.2 * s), TEAL, 0.9);
    o += limb('M' + pt(q(-9, -50)) + 'L' + pt(q(-5, -42)) + 'M' + pt(q(9, -50)) + 'L' + pt(q(5, -42)), col, 3 * s);
    if (!headless) {
      o += P(pd([q(-4, -62), q(-14, -65), q(-4, -58)], true), c.cel(col), 1 * s) + P(pd([q(4, -62), q(14, -65), q(4, -58)], true), c.cel(dk(col, 0.08)), 1 * s);
      o += body(c, ellD(q(0, -61)[0], q(0, -61)[1], 5.4 * s, 6.6 * s), col, F(pd([q(1, -69), q(7, -69), q(7, -54), q(1.6, -54)], true), dk(col, 0.2), 0.6), 1.3 * s);
      o += P(moonD(q(0, -70)[0], q(0, -70)[1], 3 * s), c.cel(lt(col, 0.1)), 0.8 * s) + L('M' + pt(q(-3, -61)) + 'l2,0.4 M' + pt(q(1.4, -61)) + 'l2,-0.4', dk(col, 0.4), 0.8 * s);
    } else o += P(pd([q(-4, -58), q(-2, -61), q(1, -59), q(4, -62), q(4, -57)], true), c.cel(dk(col, 0.1)), 1 * s);
    return o;
  }

  // ============================================================
  //  SCENE PIECES: the Kul Tiran expedition (new here)
  // ============================================================
  // a two-and-a-half-masted ship moored bow-left; y = waterline
  function ship(c, x, y, s) {
    var q = function (a, b) { return [x + a * s, y + b * s]; }, hull = '#5a3a26', o = '';
    o += F(pd([q(-70, 1), q(70, 1), q(62, 16), q(-56, 13)], true), '#1a3a44', 0.35) + L('M' + pt(q(-54, 6)) + 'l' + n(30 * s) + ',0 M' + pt(q(-4, 9)) + 'l' + n(40 * s) + ',0 M' + pt(q(20, 4)) + 'l' + n(30 * s) + ',0', FOAM, 1, 0.5);
    var rig = 'M' + pt(q(-98, -44)) + 'L' + pt(q(-30, -104)) + 'L' + pt(q(8, -122)) + 'L' + pt(q(50, -94)) + 'L' + pt(q(68, -40)) +
      'M' + pt(q(-30, -104)) + 'L' + pt(q(-58, -24)) + 'M' + pt(q(-30, -104)) + 'L' + pt(q(-6, -24)) + 'M' + pt(q(8, -122)) + 'L' + pt(q(-16, -24)) + 'M' + pt(q(8, -122)) + 'L' + pt(q(34, -24)) + 'M' + pt(q(50, -94)) + 'L' + pt(q(38, -40)) + 'M' + pt(q(50, -94)) + 'L' + pt(q(64, -40));
    o += L(rig, '#3a3028', Math.max(0.6, 0.8 * s), 0.85);
    // masts and yards
    [[-30, -22, -106], [8, -22, -124], [50, -38, -96]].forEach(function (m) { o += limb('M' + pt(q(m[0], m[1])) + 'L' + pt(q(m[0], m[2])), '#6a4a2e', 2.2 * s); });
    var yards = [[-30, -64, 22], [-30, -90, 16], [8, -54, 32], [8, -92, 24], [8, -112, 16], [50, -70, 14]];
    yards.forEach(function (yd) { o += limb('M' + pt(q(yd[0] - yd[2], yd[1])) + 'L' + pt(q(yd[0] + yd[2], yd[1])), '#6a4a2e', 1.4 * s); });
    // furled sails
    [[-30, -64, 20], [-30, -90, 14], [8, -112, 14], [50, -70, 12]].forEach(function (f) { o += R(q(f[0] - f[2], 0)[0], q(0, f[1] + 1)[1], f[2] * 2 * s, 4.4 * s, c.cel(CANVAS), 1 * s, 2); });
    // main course set, navy band and anchor
    var sail = 'M' + pt(q(-22, -91)) + 'L' + pt(q(30, -91)) + 'C' + pt(q(38, -80)) + ' ' + pt(q(40, -66)) + ' ' + pt(q(38, -55)) + 'L' + pt(q(-26, -55)) + 'C' + pt(q(-24, -66)) + ' ' + pt(q(-22, -80)) + ' ' + pt(q(-22, -91)) + 'Z';
    o += body(c, sail, CANVAS, F(pd([q(-30, -80), q(46, -80), q(46, -68), q(-30, -68)], true), NAVY, 0.95) + F(pd([q(14, -94), q(46, -94), q(46, -52), q(20, -52)], true), dk(CANVAS, 0.18), 0.55) + L('M' + pt(q(-8, -90)) + 'L' + pt(q(-10, -56)) + 'M' + pt(q(16, -90)) + 'L' + pt(q(18, -56)), dk(CANVAS, 0.2), 0.8 * s), 1.3 * s);
    o += emAnchor(c, q(6, -74)[0], q(6, -74)[1], 0.9 * s);
    o += P(pd([q(8, -124), q(36, -120), q(8, -115)], true), c.cel(NAVY), 1 * s) + L('M' + pt(q(10, -120)) + 'L' + pt(q(30, -120)), KGOLD, 0.9 * s);
    // hull
    var hd = 'M' + pt(q(-72, -27)) + 'L' + pt(q(-58, -22)) + 'L' + pt(q(38, -22)) + 'L' + pt(q(42, -37)) + 'L' + pt(q(68, -39)) + 'L' + pt(q(71, -29)) + 'C' + pt(q(69, -13)) + ' ' + pt(q(64, -4)) + ' ' + pt(q(58, 0)) + 'L' + pt(q(-44, 0)) + 'C' + pt(q(-56, -4)) + ' ' + pt(q(-64, -14)) + ' ' + pt(q(-72, -27)) + 'Z';
    var gp = ''; for (var g = -40; g <= 30; g += 12) gp += R(q(g, 0)[0], q(0, -15.4)[1], 3.4 * s, 3 * s, '#141010', 0.7 * s);
    o += body(c, hd, hull, F(pd([q(-80, -18), q(80, -18), q(80, -9), q(-80, -9)], true), NAVY) + L('M' + pt(q(-80, -18)) + 'L' + pt(q(80, -18)) + 'M' + pt(q(-80, -9)) + 'L' + pt(q(80, -9)), KGOLD, 1.1 * s) + gp +
      L('M' + pt(q(-50, -4)) + 'L' + pt(q(60, -4)), dk(hull, 0.35), 0.9 * s) + F(pd([q(30, -44), q(80, -44), q(80, 2), q(40, 2)], true), dk(hull, 0.25), 0.6) + R(q(48, 0)[0], q(0, -34)[1], 4 * s, 4 * s, KGOLD, 0.6 * s) + R(q(57, 0)[0], q(0, -34)[1], 4 * s, 4 * s, KGOLD, 0.6 * s), 1.6 * s);
    o += L('M' + pt(q(-62, -27)) + 'L' + pt(q(38, -27)) + 'M' + pt(q(42, -42)) + 'L' + pt(q(68, -44)), '#3a2618', 1.3 * s) + L('M' + pt(q(-40, -22)) + 'l0,' + n(-5 * s) + 'M' + pt(q(-20, -22)) + 'l0,' + n(-5 * s) + 'M' + pt(q(0, -22)) + 'l0,' + n(-5 * s) + 'M' + pt(q(20, -22)) + 'l0,' + n(-5 * s), '#3a2618', 1 * s);
    o += limb('M' + pt(q(-72, -27)) + 'L' + pt(q(-98, -44)), '#6a4a2e', 1.8 * s) + L('M' + pt(q(-60, -20)) + 'L' + pt(q(-60, -8)), '#4a4448', 0.8 * s) + emAnchor(c, q(-60, -4)[0], q(-60, -4)[1], 0.55 * s);
    return o + L('M' + pt(q(-46, 0)) + 'L' + pt(q(60, 0)), FOAM, 1.6 * s, 0.8);
  }
  // a side-on plank jetty from the beach (x1) out along the water to x0, deck top at y
  function jetty(c, x0, x1, y) {
    var o = '', pl = '', col = '#8a6a44';
    for (var x = x0 + 4; x <= x1 - 4; x += 15) o += limb('M' + pt([x, y + 5]) + 'L' + pt([x, y + 18]), '#4a3422', 3.2) + E(x, y + 18, 5, 1.4, FOAM, 0, 0.7);
    for (var px = x0 + 6; px < x1; px += 7) pl += 'M' + pt([px, y - 4]) + 'L' + pt([px + 1.6, y]);
    o += P(pd([[x0, y], [x1, y], [x1 + 4, y - 5], [x0 + 3, y - 5]], true), c.cel(col), 1.3) + L(pl, '#4a3422', 0.8, 0.9) + P(pd([[x0, y], [x1, y], [x1, y + 5], [x0, y + 5]], true), c.cel('#5a3e26'), 1.2);
    o += limb('M' + pt([x0 + 3, y - 4]) + 'L' + pt([x0 + 3, y - 12]), '#5a3e26', 2.4) + limb('M' + pt([x0 + 40, y - 4]) + 'L' + pt([x0 + 40, y - 11]), '#5a3e26', 2.2) + L(ellD(x0 + 3, y - 8, 3.4, 1.4), '#c8b080', 1.1);
    o += L('M' + pt([x0 - 12, y - 30]) + 'Q' + pt([x0 - 6, y - 12]) + ' ' + pt([x0 + 3, y - 10]), '#c8b080', 1);
    return o;
  }
  function rowboat(c, x, y, s) {
    return E(x, y + 2, 26 * s, 3.4 * s, '#000', 0, 0.3) + P('M' + pt([x - 26 * s, y - 8 * s]) + 'C' + pt([x - 20 * s, y + 1 * s]) + ' ' + pt([x + 18 * s, y + 1 * s]) + ' ' + pt([x + 26 * s, y - 8 * s]) + 'L' + pt([x + 22 * s, y - 10 * s]) + 'L' + pt([x - 22 * s, y - 10 * s]) + 'Z', c.cel('#6a4a2e'), 1.5 * s) +
      L('M' + pt([x - 22 * s, y - 7 * s]) + 'L' + pt([x + 22 * s, y - 7 * s]), NAVY, 2 * s) + L('M' + pt([x - 22 * s, y - 10 * s]) + 'L' + pt([x + 22 * s, y - 10 * s]), '#3a2618', 1 * s) + limb('M' + pt([x - 8 * s, y - 12 * s]) + 'L' + pt([x + 20 * s, y - 20 * s]), '#8a6a44', 1.4 * s);
  }
  function ropeCoil(c, x, y, s) { return E(x, y, 9 * s, 3.2 * s, c.cel('#c8a878'), 1.2 * s) + L(ellD(x, y - 0.4 * s, 6 * s, 2 * s) + ellD(x, y - 0.6 * s, 3 * s, 1 * s), '#8a6a44', 0.9 * s); }
  function bigAnchor(c, x, y, s) {
    var g = limb('M' + pt([x - 16 * s, y - 2 * s]) + 'L' + pt([x + 18 * s, y - 6 * s]), '#4a4a50', 3 * s) + limb('M' + pt([x + 10 * s, y - 14 * s]) + 'L' + pt([x + 12 * s, y + 2 * s]), '#4a4a50', 2.2 * s) +
      limb('M' + pt([x - 20 * s, y - 12 * s]) + 'Q' + pt([x - 22 * s, y + 1 * s]) + ' ' + pt([x - 14 * s, y + 3 * s]), '#4a4a50', 2.4 * s) + L(ellD(x + 22 * s, y - 7 * s, 3 * s, 3 * s), OL, 3.4 * s) + L(ellD(x + 22 * s, y - 7 * s, 3 * s, 3 * s), '#6a6a70', 1.8 * s);
    return E(x, y + 2, 24 * s, 3 * s, '#000', 0, 0.25) + g + barnacles(71, 4, x - 14 * s, x + 6 * s, y - 5 * s, y - 1 * s, 0.7 * s);
  }

  // ============================================================
  //  SCENES (floor line at y 116-122, the back row stands on open ground right of centre)
  // ============================================================
  var SCENES = {
    brightwater_landing: function (c) {
      var o = seaSky(c, '#7fa6b4', '#c2d8d8', '#eef0e4') + sun(c, 300, 42, 11, '#fffbea') + overcast(c, 3101, 22, '#f0f4f2', 5, 1) + overcast(c, 3102, 54, '#dde8e6', 4, 0.7);
      o += farCitadel(c, 204, 98, 0.3, '#a6bec0', '#9af4e6');
      o += sea(c, 96, 146, 3103);
      o += haze(c, 99, 12, 0.5);
      o += ship(c, 80, 122, 0.78);
      var shore = 'M-4,148 C40,144 110,140 170,136 C230,130 300,120 404,116';
      o += body(c, shore + ' L404,242 L-4,242 Z', SAND, R(-4, 114, 408, 130, c.lg([[0, '#f0e4c0', 0.4], [0.35, SAND, 0], [1, '#6a5a3a', 0.7]])) + F(shore + ' L404,124 C300,128 230,138 170,144 C110,148 40,152 -4,156 Z', '#9a8a68', 0.55) + pebbles(3104, 150, 236, '#a8966e', 22), 1.4);
      o += foamLine(shore, 2.4);
      o += jetty(c, 118, 224, 124);
      o += tent(c, 286, 132, 0.62) + tent(c, 350, 130, 0.72);
      o += poleBanner(c, 250, 138, 58, 0.9, NAVY, KGOLD, emAnchor) + poleBanner(c, 326, 142, 62, 0.95, NAVY, KGOLD, emAnchor) + poleBanner(c, 376, 146, 56, 0.85, ABLUE, KGOLD, emCrown);
      o += crate(c, 196, 160, 1) + crate(c, 210, 158, 0.8, '#7a5a36') + crate(c, 202, 147, 0.75) + barrel(c, 228, 156, 0.9) + barrel(c, 184, 166, 0.75) + sack(c, 242, 160, 0.9) + sack(c, 254, 158, 0.75);
      o += campfire(c, 318, 168, 0.85) + ropeCoil(c, 150, 174, 1) + bigAnchor(c, 272, 198, 1);
      o += rowboat(c, 356, 208, 1.1) + shell(c, 150, 214, 1.1) + shell(c, 300, 228, 0.9, '#f4c8b8') + starfish(c, 226, 222, 5) + driftwood(c, 16, 228, 50, -0.08, 0.9);
      o += grass(3105, 168, 238, '#8a9a5a', 26, 0.7, 1.5, 1.2, 250, 400) + grass(3106, 160, 238, '#8a9a5a', 12, 0.8, 1.5, 1.2, 0, 60);
      return o + motes(3107, 30, 0, 400, 20, 200, '#ffffff') + vignette(c, '#f0f8f8', '#14201c');
    },
    saltmarsh_shallows: function (c) {
      var o = seaSky(c, '#86a6b0', '#c6d8d4', '#ecefe2') + sun(c, 110, 40, 10, '#fffbea') + overcast(c, 3201, 26, '#eef2f0', 5, 1);
      o += archSil(56, 104, 26, 16, '#98b0b0', true) + spireSil(92, 106, 7, 22, '#a0b6b6') + archSil(150, 104, 18, 10, '#a6baba');
      o += sea(c, 98, 120, 3202);
      o += haze(c, 102, 12, 0.5);
      o += wetSand(c, 116, 3203, '#b4aa88', '#7c7258');
      o += shallows(c, 70, 128, 80, 5) + shallows(c, 258, 134, 96, 6) + shallows(c, 150, 152, 84, 6) + shallows(c, 334, 172, 74, 7) + shallows(c, 88, 198, 96, 8) + shallows(c, 262, 218, 116, 9);
      o += tidePool(c, 134, 178, 22, 7, 3204) + tidePool(c, 372, 146, 16, 5, 3205);
      o += burrow(c, 214, 142, 0.8) + burrow(c, 300, 156, 0.9) + burrow(c, 190, 172, 1) + burrow(c, 356, 198, 1.1) + burrow(c, 232, 196, 1.2);
      o += reeds(c, 18, 136, 0.9) + reeds(c, 34, 132, 0.7) + reeds(c, 190, 126, 0.55) + reeds(c, 390, 132, 0.8) + reeds(c, 392, 228, 1.3) + reeds(c, 10, 236, 1.2);
      o += shell(c, 170, 136, 0.7) + shell(c, 318, 144, 0.8, '#f4c8b8') + shell(c, 60, 176, 1) + shell(c, 280, 236, 1.2) + starfish(c, 250, 164, 4) + starfish(c, 170, 224, 5.4, '#e86a4a');
      o += driftwood(c, 40, 214, 56, -0.1, 1) + rock(c, 238, 128, 16, 7, '#8a867a') + barnacles(3206, 5, 232, 244, 122, 127, 0.8);
      o += coral(c, 320, 234, 1, CORAL, 3207, 5) + brainCoral(c, 344, 232, 8, 5, CORALP);
      o += pebbles(3208, 124, 236, '#8a7e62', 26);
      return o + haze(c, 132, 18, 0.25) + motes(3209, 24, 0, 400, 20, 180, '#ffffff') + vignette(c, '#f0f8f8', '#141c18');
    },
    kelpwood: function (c) {
      var o = sky(c, '#183430', '#2a5846', '#58885e') + C(220, 10, 170, glow(c, '#d0ffb8', 0.28)) + shafts(c, 3301, 7, 0.22, '#e0ffc8', 170);
      o += kelpStalk(c, 30, 116, -10, 7, '#2c5440', 3302, { flat: true }) + kelpStalk(c, 80, 114, -10, 6, '#2e5842', 3303, { flat: true }) + kelpStalk(c, 176, 114, -10, 6, '#2e5842', 3304, { flat: true }) + kelpStalk(c, 236, 112, -10, 5, '#305a44', 3305, { flat: true }) + kelpStalk(c, 300, 114, -10, 6, '#2e5842', 3306, { flat: true }) + kelpStalk(c, 362, 116, -10, 7, '#2c5440', 3307, { flat: true });
      o += haze(c, 104, 36, 0.3, '#b0e0a8');
      o += ground(c, 116, '#3e5a36', '#1a2818') + R(0, 115, 400, 6, c.lg([[0, '#000', 0.25], [1, '#000', 0]]));
      o += puddle(c, 90, 132, 40, 4, '#5a8a6a') + puddle(c, 250, 140, 56, 5, '#5a8a6a') + puddle(c, 150, 178, 60, 6, '#5a8a6a') + puddle(c, 320, 196, 50, 6, '#5a8a6a') + puddle(c, 70, 216, 60, 7, '#5a8a6a');
      o += kelpStalk(c, 128, 124, -14, 9, '#4a7a48', 3308, { sway: 12, bladder: '#a8b84a' }) + kelpStalk(c, 204, 120, -14, 7, '#467444', 3309, { sway: 8, lean: -6, bladder: '#a8b84a' }) + kelpStalk(c, 352, 122, -14, 9, '#4a7a48', 3310, { sway: 10, bladder: '#a8b84a' });
      o += rock(c, 172, 136, 22, 9, '#4a5a48') + barnacles(3311, 6, 164, 180, 128, 134, 0.8) + shell(c, 262, 132, 0.8) + coral(c, 290, 130, 0.6, '#c86a5a', 3312, 4);
      o += kelpStalk(c, 22, 238, -16, 16, '#4e8048', 3313, { sway: 14, bladder: '#a8b84a' }) + kelpStalk(c, 402, 236, -16, 14, '#4a7a46', 3314, { sway: 8, lean: -4, bladder: '#a8b84a' }) + kelpStalk(c, 168, 206, -14, 11, '#528448', 3315, { sway: 10, lean: 8, bladder: '#a8b84a' });
      o += grass(3316, 126, 236, '#4a6a34', 30, 0.6, 1.4, 1.1) + shell(c, 240, 226, 1.1) + rock(c, 300, 234, 30, 11, '#4a5a48') + coral(c, 286, 226, 0.9, '#c86a5a', 3317, 5);
      o += mist(c, 150, 40, '#a8e0a0', 0.16, 3318) + motes(3319, 40, 0, 400, 10, 220, '#d8ffa0') + motes(3320, 16, 60, 340, 40, 160, '#ffffff');
      return o + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.45]])) + vignette(c, '#c8ffc0', '#050a06');
    },
    drowned_orchards: function (c) {
      var o = seaSky(c, '#8aa2a6', '#bac8c2', '#dadfd2') + sun(c, 270, 46, 10, '#fffbe8') + overcast(c, 3401, 24, '#e8eeea', 5, 1);
      o += hills(c, 3402, 108, 22, '#94aaa4', 40) + archSil(60, 106, 22, 14, '#a4b8b4') + archSil(120, 104, 22, 14, '#a4b8b4') + archSil(180, 106, 22, 14, '#a4b8b4', true) + spireSil(236, 106, 8, 26, '#a0b4b0');
      o += G(orchardTree(c, 36, 112, 0.34, 3403) + orchardTree(c, 92, 112, 0.32, 3404) + orchardTree(c, 150, 112, 0.34, 3423) + orchardTree(c, 290, 112, 0.34, 3405) + orchardTree(c, 346, 112, 0.32, 3406) + orchardTree(c, 396, 112, 0.34, 3424), '', 0.55);
      o += ground(c, 114, '#8c9478', '#4e5642') + R(0, 113, 400, 5, c.lg([[0, '#000', 0.2], [1, '#000', 0]]));
      o += puddle(c, 120, 134, 44, 4) + puddle(c, 270, 150, 50, 5) + puddle(c, 190, 184, 60, 6) + puddle(c, 340, 212, 60, 7);
      o += stoneFace(c, 150, 122, 256, 16, STONE, 8, ruinTop(256, 16, 3407)) + roundel(c, 200, 114, 4.6, STONE) + roundel(c, 272, 115, 4.6, STONE) + roundel(c, 344, 114, 4.6, STONE) + barnacles(3408, 16, 152, 404, 116, 121, 0.8);
      o += orchardTree(c, 164, 122, 0.6, 3409) + orchardTree(c, 236, 120, 0.52, 3425) + orchardTree(c, 372, 124, 0.7, 3410);
      o += R(82, 124, 28, 7, c.cel(dk(STONE, 0.08)), 1.2) + statue(c, 96, 124, 0.9, STONE) + coral(c, 88, 124, 0.5, CORAL, 3411, 3) + barnacles(3426, 6, 88, 104, 100, 120, 0.8);
      o += orchardTree(c, 36, 178, 1.15, 3412);
      o += E(214, 228, 52, 6, '#000', 0, 0.28) + G(stoneHead(c, 0, 0, 1.8, dk(STONE, 0.02)) + coral(c, 14, -18, 0.7, CORAL, 3413, 4) + barnacles(3414, 10, 2, 20, -26, 0, 0.8), 'translate(210,212) rotate(16)') + body(c, 'M160,234 C170,220 196,222 214,226 C236,230 256,222 270,234 Z', '#737b62', L('M176,228 q10,-3 20,0 M226,228 q12,-4 24,0', '#8a927a', 1, 0.8), 1.2) + brainCoral(c, 250, 228, 6, 3.6, CORALP) + coral(c, 176, 230, 0.7, CORALP, 3427, 3);
      o += coral(c, 262, 170, 0.8, CORALP, 3415, 4) + shell(c, 150, 150, 0.8) + shell(c, 312, 176, 0.9, '#f4c8b8') + starfish(c, 120, 196, 4.4) + C(200, 150, 2, c.cel('#6a5040'), 0.8) + C(290, 196, 2.2, c.cel('#6a5040'), 0.8) + C(140, 214, 2.4, c.cel('#5a4a3a'), 0.8);
      o += rock(c, 390, 234, 34, 14, '#7a7a70') + coral(c, 378, 222, 1, CORAL, 3417, 5) + barnacles(3418, 8, 376, 404, 222, 232, 1);
      o += grass(3419, 128, 236, '#56603e', 34, 0.6, 1.4, 1.1);
      return o + mist(c, 130, 26, '#e8f0ec', 0.28, 3420) + mist(c, 196, 34, '#e8f0ec', 0.14, 3421) + motes(3422, 18, 0, 400, 40, 200, '#ffffff') + vignette(c, '#eef4f0', '#12180e');
    },
    archive_steps: function (c) {
      var ST = '#d6d4c6', ST2 = '#c4c2b2', o = seaSky(c, '#7a9aa6', '#b4c8c6', '#d8ded2') + sun(c, 86, 34, 9, '#fffbea') + overcast(c, 3501, 20, '#e8eeea', 4, 1);
      // the library facade
      o += stoneFace(c, -4, 118, 408, 66, ST2, 9);
      o += F(pd([[-4, 52], [404, 52], [404, 58], [-4, 58]], true), TEAL, 0.9) + L('M-4,52 L404,52', OL, 1.4);
      [62, 110, 290, 338].forEach(function (wx) { o += archWin(wx, 104, 12, 34, '#1e3a40', 1.2) + L('M' + pt([wx, 104]) + 'L' + pt([wx, 76]), '#3e6a6a', 1); });
      o += elfSpire(c, 22, 118, 32, 62, ST, { k: 1.5 }) + elfSpire(c, 378, 118, 32, 62, ST, { k: 1.5 }) + elfSpire(c, 140, 52, 18, 18, ST, { k: 2.6 }) + elfSpire(c, 260, 52, 18, 18, ST, { k: 2.6 });
      var gab = 'M146,58 C150,34 186,14 200,4 C214,14 250,34 254,58 Z';
      o += body(c, gab, ST, F('M200,0 L260,0 L260,60 L204,60 Z', dk(ST, 0.18), 0.6) + L('M156,56 C162,38 188,20 200,12 C212,20 238,38 244,56', TEAL, 2, 0.9), 1.8) + roundel(c, 200, 34, 9, ST) + moon(c, 200, 34, 5, MOONC, '#9af4e6');
      var door = 'M160,118 L160,82 C160,62 184,50 200,42 C216,50 240,62 240,82 L240,118 Z';
      o += P('M150,118 L150,80 C150,56 180,42 200,32 C220,42 250,56 250,80 L250,118 Z', c.cel(ST), 1.8) + P(door, c.lg([[0, '#0e2226'], [0.6, '#1e4448'], [1, '#2e6a6a']]), 1.6);
      o += C(200, 96, 34, glow(c, '#6af0dc', 0.35)) + L('M172,100 L228,100 M168,108 L232,108 M164,116 L236,116', '#3e7a78', 1.2, 0.8);
      o += barnacles(3502, 40, -4, 404, 98, 112, 0.9) + F(pd([[-4, 106], [404, 106], [404, 118], [-4, 118]], true), '#5a6a50', 0.35);
      o += kelpHang(154, 58, 22, 3503) + kelpHang(246, 58, 18, 3504) + kelpHang(96, 58, 16, 3505) + kelpHang(304, 58, 20, 3506) + coral(c, 150, 118, 0.8, CORAL, 3507, 4) + coral(c, 252, 118, 0.7, CORALP, 3508, 4) + brainCoral(c, 8, 114, 8, 5, CORALL);
      // the flooded court
      o += R(-4, 112, 408, 22, c.lg([[0, '#2e5e66'], [1, '#6a9c9a']])) + F(pd([[164, 112], [236, 112], [244, 132], [156, 132]], true), '#12302e', 0.5) + waves(3509, 114, 132, 20, FOAM, 0.5);
      // side platforms and the terrace (our level)
      o += body(c, pd([[-4, 128], [150, 128], [94, 170], [-4, 170]], true), ST, L('M-4,140 L136,140 M-4,154 L116,154', dk(ST, 0.2), 0.9, 0.8), 1.5) + body(c, pd([[250, 128], [404, 128], [404, 170], [306, 170]], true), ST, L('M264,140 L404,140 M284,154 L404,154', dk(ST, 0.2), 0.9, 0.8), 1.5);
      o += L('M-4,128 L150,128 M250,128 L404,128', lt(ST, 0.4), 1.4);
      // the steps, going down to the water
      var steps = '', ys = [];
      for (var i = 0; i <= 8; i++) ys.push(170 - 44 * (1 - Math.pow(1 - i / 8, 1.5)));
      var xl = function (y) { return 94 + (y - 170) / (126 - 170) * (152 - 94); }, xr = function (y) { return 306 - (y - 170) / (126 - 170) * (306 - 248); };
      for (var j = 0; j < 8; j++) {
        var y0 = ys[j], y1 = ys[j + 1], hh = (y0 - y1) * 0.34;
        steps += P(pd([[xl(y0), y0], [xr(y0), y0], [xr(y1), y1], [xl(y1), y1]], true), c.cel(j % 2 ? ST : lt(ST, 0.05)), 1) + F(pd([[xl(y1), y1], [xr(y1), y1], [xr(y1 + hh), y1 + hh], [xl(y1 + hh), y1 + hh]], true), dk(ST, 0.32), 0.8) + L('M' + pt([xl(y1), y1]) + 'L' + pt([xr(y1), y1]), lt(ST, 0.5), 1);
      }
      o += steps + F(pd([[xl(140), 140], [xr(140), 140], [248, 126], [152, 126]], true), '#3e7478', 0.6) + L('M' + pt([xl(140), 140]) + 'L' + pt([xr(140), 140]), FOAM, 1.4, 0.8) + waves(3510, 128, 139, 8, FOAM, 0.6);
      o += coral(c, 170, 140, 0.6, CORAL, 3511, 4) + coral(c, 230, 142, 0.55, CORALP, 3512, 3) + barnacles(3513, 12, 150, 250, 136, 146, 0.8) + shell(c, 214, 150, 0.7);
      // balustrades along the stairwell
      var bal = function (xa, ya, xb, yb2) { return P(pd([[xa, ya], [xb, yb2], [xb, yb2 - 7], [xa, ya - 12]], true), c.cel(ST), 1.4) + L('M' + pt([xa, ya - 12]) + 'L' + pt([xb, yb2 - 7]), lt(ST, 0.4), 1.2); };
      o += bal(94, 170, 152, 128) + bal(306, 170, 248, 128);
      [[94, 170, 12], [123, 149, 9], [152, 128, 7], [306, 170, 12], [277, 149, 9], [248, 128, 7]].forEach(function (p) { o += R(p[0] - p[2] * 0.3, p[1] - p[2] * 1.9, p[2] * 0.6, p[2] * 1.9, c.cel(ST), 1.1) + moon(c, p[0], p[1] - p[2] * 2.3, p[2] * 0.32, MOONC); });
      o += ground(c, 170, '#cac6b4', '#8a8676') + L('M-4,170 L404,170', OL, 1.4) + L('M-4,172 L404,172', lt(ST, 0.4), 1.2);
      var fl = ''; for (var k = -6; k <= 6; k++) fl += 'M' + pt([200 + k * 18, 172]) + 'L' + pt([200 + k * 60, 242]); fl += 'M-4,186 L404,186 M-4,206 L404,206 M-4,232 L404,232';
      o += L(fl, '#8a8676', 1, 0.7);
      // the Alliance guard post at the top of the steps
      o += poleBanner(c, 128, 190, 66, 1, NAVY, KGOLD, emAnchor) + poleBanner(c, 268, 190, 66, 1, ABLUE, KGOLD, emCrown);
      o += brazier(c, 100, 184, 1) + brazier(c, 300, 184, 1) + crate(c, 344, 198, 1) + crate(c, 360, 196, 0.8, '#7a5a36') + barrel(c, 378, 204, 0.9);
      o += limb('M326,196 L322,160 M334,196 L336,158 M342,196 L348,162', '#6a4a2e', 1.4) + P('M318,176 L352,176 L352,180 L318,180 Z', c.cel('#5a3e26'), 1.1) + P(pd([[320, 158], [322, 152], [324, 158]], true), '#c8d0d8', 0.8) + P(pd([[334, 156], [336, 150], [338, 156]], true), '#c8d0d8', 0.8) + P(pd([[346, 160], [348, 154], [350, 160]], true), '#c8d0d8', 0.8);
      o += shell(c, 240, 228, 1) + kelpHang(20, 170, 10, 3514) + barnacles(3515, 8, 0, 80, 172, 180, 0.9);
      return o + haze(c, 118, 20, 0.3) + motes(3516, 20, 0, 400, 20, 200, '#ffffff') + vignette(c, '#eef4f0', '#12180e');
    },
    sael_anor_outskirts: function (c) {
      var ST = '#d2d0c2', o = seaSky(c, '#6e8e9c', '#aac0c2', '#d6dace') + sun(c, 150, 50, 10, '#f8fbe8') + overcast(c, 3601, 22, '#dfe8e6', 5, 1.1);
      o += sea(c, 90, 118, 3602, '#b8d0cc', '#3e6e76');
      o += farCitadel(c, 290, 94, 0.64, '#8aa6ae', '#8af4e4');
      o += F('M404,112 L404,106 L360,98 L332,92 L332,96 L358,102 Z', '#86a2a8') + L('M372,104 l0,6 M386,106 l0,6 M398,108 l0,5 M346,97 l0,4', '#6a868c', 3);
      o += haze(c, 96, 20, 0.5);
      o += archSil(24, 114, 24, 14, '#a4b6b4') + archSil(64, 112, 20, 12, '#a4b6b4', true) + spireSil(196, 114, 7, 20, '#a8b8b6') + archSil(140, 114, 22, 12, '#a4b6b4');
      o += ground(c, 114, '#b8b2a0', '#6e6a5c') + R(0, 113, 400, 5, c.lg([[0, '#000', 0.2], [1, '#000', 0]]));
      var pav = 'M170,118 L230,118 L300,242 L100,242 Z';
      o += F(pav, '#cac4b0', 0.8) + L('M176,122 L224,122 M166,134 L234,134 M156,150 L244,150 M142,172 L258,172 M124,202 L276,202 M200,118 L200,242 M185,118 L150,242 M215,118 L250,242', '#8a8472', 1, 0.7);
      o += puddle(c, 270, 150, 40, 4) + puddle(c, 120, 168, 40, 5) + E(330, 186, 60, 7, '#e4dcc4', 0, 0.35) + pebbles(3603, 120, 236, '#8a8472', 24);
      o += elfArch(c, 96, 124, 56, 44, ST, { over: true, seed: 3604, moonGlow: '#9af4e6' });
      o += elfSpire(c, 380, 124, 28, 62, ST, { broken: true, coral: true, seed: 3605, sky: '#b8cac8' });
      o += R(174, 104, 14, 18, c.cel(ST), 1.4) + R(171, 102, 20, 4, c.cel(TEAL), 1.1) + coral(c, 180, 122, 0.6, CORAL, 3606, 4) + barnacles(3607, 6, 174, 188, 106, 120, 0.8);
      o += coral(c, 250, 126, 0.7, CORALP, 3608, 4) + brainCoral(c, 330, 128, 7, 4.4, CORAL) + shell(c, 300, 136, 0.8) + coral(c, 140, 140, 0.8, CORAL, 3609, 5);
      o += E(208, 232, 64, 6, '#000', 0, 0.25) + P('M146,226 L268,218 L270,232 L148,238 Z', c.cel(ST), 1.6) + E(147, 232, 4, 6, c.cel(dk(ST, 0.1)), 1.3) + L('M180,224 L182,236 M214,222 L216,234 M246,220 L248,232', dk(ST, 0.3), 1.1) + coral(c, 200, 224, 0.8, CORAL, 3610, 4) + barnacles(3611, 10, 150, 266, 222, 232, 0.9);
      o += coral(c, 388, 236, 1.1, CORAL, 3612, 5) + brainCoral(c, 364, 234, 9, 5.4, CORALP) + kelpHang(20, 180, 12, 3613) + shell(c, 60, 226, 1.1, '#f4c8b8');
      o += grass(3614, 128, 236, '#7a8a5a', 20, 0.6, 1.3, 1.1, 0, 160) + grass(3615, 128, 236, '#7a8a5a', 20, 0.6, 1.3, 1.1, 250, 400);
      return o + mist(c, 126, 22, '#e8f0ec', 0.3, 3616) + motes(3617, 22, 0, 400, 20, 200, '#bff8f0') + vignette(c, '#eef4f0', '#10160e');
    }
  };
  // a dead Highborne fruit tree: a short trunk forking into a vase of bare limbs, bleached and crusted with coral
  function orchardTree(c, x, y, s, seed, o) {
    o = o || {};
    var col = o.col || '#8e8676', r = rng(seed), out = E(x + 2 * s, y + 1, 24 * s, 3.6 * s, '#000', 0, 0.25), fk = [x + 2 * s, y - 28 * s];
    out += P(pd([[x - 9 * s, y + 1], [x - 3 * s, y - 8 * s], [x + 4 * s, y - 8 * s], [x + 10 * s, y + 1]], true), c.cel(col), 1.3 * s);
    var twigs = '', tips = [], lb = '', sb = '';
    [[-30, -58, -9], [-10, -72, -5], [12, -70, 5], [32, -56, 9]].forEach(function (m, i) {
      var e = [x + m[0] * s, y + m[1] * s], md = [(fk[0] + e[0]) / 2 + m[2] * s, (fk[1] + e[1]) / 2 + 3 * s], side = i < 2 ? -1 : 1;
      var T = taper([fk, md, e], 7 * s, 1.8 * s, 5);
      lb += body(c, T.d, col, F(ribbonBand(T, 0.6, 1), dk(col, 0.25), 0.8) + L(along(T, 0.2), lt(col, 0.25), 0.8 * s, 0.6), 1.3 * s);
      var sp = T.s[Math.round(T.s.length * 0.55)], se = [sp[0] + side * (11 + r() * 5) * s, sp[1] - (9 + r() * 5) * s];
      var S2 = taper([sp, [sp[0] + side * 7 * s, sp[1] - 3 * s], se], 3.6 * s, 1.2 * s, 4);
      sb += body(c, S2.d, col, F(ribbonBand(S2, 0.6, 1), dk(col, 0.25), 0.8), 1.1 * s);
      [e, se].forEach(function (p) { twigs += 'M' + pt(p) + 'q' + n(-1 * s) + ',' + n(-3 * s) + ' ' + n(-4 * s) + ',' + n(-6 * s) + 'M' + pt(p) + 'q' + n(2 * s) + ',' + n(-2 * s) + ' ' + n(4 * s) + ',' + n(-5 * s) + 'M' + pt(p) + 'q' + n(side * 3 * s) + ',0 ' + n(side * 6 * s) + ',' + n(-1.6 * s); tips.push(p); });
    });
    out += limb(twigs, col, 0.9 * s) + sb + lb;
    var tr = taper([[x, y], [x - 3 * s, y - 12 * s], [x + 4 * s, y - 22 * s], fk], 11 * s, 7 * s, 5);
    out += body(c, tr.d, col, F(ribbonBand(tr, 0.62, 1), dk(col, 0.25), 0.8) + L(along(tr, 0.25), lt(col, 0.3), 1.2 * s, 0.6) + L('M' + pt([x - 2 * s, y - 6 * s]) + 'q' + n(2 * s) + ',' + n(-6 * s) + ' 0,' + n(-12 * s), dk(col, 0.35), 0.8 * s), 1.4 * s);
    out += coral(c, fk[0], fk[1] + 2 * s, 0.6 * s, o.coral || CORAL, seed + 3, 5) + coral(c, tips[2][0], tips[2][1] + 4 * s, 0.34 * s, CORALL, seed + 7, 3) + coral(c, tips[6][0], tips[6][1] + 5 * s, 0.34 * s, CORALP, seed + 8, 3);
    out += barnacles(seed + 5, 9, x - 4 * s, x + 6 * s, y - 24 * s, y - 4 * s, Math.max(0.5, 0.9 * s));
    out += kelpHang(tips[0][0] + 6 * s, tips[0][1] + 10 * s, 18 * s, seed + 9, '#5e7a34', 1.3 * Math.max(0.6, s)) + kelpHang(tips[5][0] - 4 * s, tips[5][1] + 10 * s, 14 * s, seed + 11, '#6a843a', 1.2 * Math.max(0.6, s));
    [tips[1], tips[4], tips[7]].forEach(function (p) { out += L('M' + pt(p) + 'l0,' + n(4 * s), OL, 0.8 * s) + C(p[0], p[1] + 6 * s, 2.2 * s, c.cel('#6a5040'), 0.8 * s); });
    return out;
  }
  // a colossal Highborne head in profile, facing left (drawn upright; rotate it to topple it)
  function stoneHead(c, x, y, k, col) {
    col = col || STONE;
    var q = function (a, b) { return [x + a * k, y + b * k]; }, o = '';
    o += P(pd([q(-3, 12), q(10, 8), q(13, 18), q(7, 16), q(3, 20), q(-4, 17)], true), c.cel(dk(col, 0.1)), 1.2 * k);
    var d = 'M' + pt(q(-9, -8)) + 'C' + pt(q(-8, -15)) + ' ' + pt(q(9, -16)) + ' ' + pt(q(11, -6)) + 'L' + pt(q(11, 5)) + 'C' + pt(q(9, 12)) + ' ' + pt(q(1, 15)) + ' ' + pt(q(-5, 14)) + 'C' + pt(q(-10, 12)) + ' ' + pt(q(-11, 8)) + ' ' + pt(q(-11, 3)) + 'L' + pt(q(-14, 1)) + 'L' + pt(q(-10, -2)) + 'Z';
    o += body(c, d, col, F(pd([q(3, -16), q(14, -16), q(14, 16), q(1, 16)], true), dk(col, 0.18), 0.7) + L('M' + pt(q(-4, -15)) + 'L' + pt(q(-1, -6)) + 'L' + pt(q(-4, 2)) + 'L' + pt(q(0, 8)), dk(col, 0.35), 0.8 * k), 1.2 * k);
    o += body(c, 'M' + pt(q(4, -2)) + 'C' + pt(q(12, -7)) + ' ' + pt(q(20, -14)) + ' ' + pt(q(25, -20)) + 'C' + pt(q(22, -12)) + ' ' + pt(q(18, -6)) + ' ' + pt(q(8, 5)) + 'Z', col, F(pd([q(16, -24), q(30, -24), q(30, 0), q(14, 0)], true), dk(col, 0.15), 0.6), 1 * k);
    o += L('M' + pt(q(-8, -2)) + 'Q' + pt(q(-5, 0)) + ' ' + pt(q(-2, -2)), OL, 0.9 * k) + L('M' + pt(q(-11, -5.4)) + 'L' + pt(q(-1, -6.8)), dk(col, 0.4), 1 * k) + L('M' + pt(q(-9, 8)) + 'Q' + pt(q(-6, 9.4)) + ' ' + pt(q(-3, 8)), dk(col, 0.4), 0.8 * k);
    o += L('M' + pt(q(-10, -10)) + 'Q' + pt(q(0, -15)) + ' ' + pt(q(11, -10)), OL, 1.6 * k) + L('M' + pt(q(-10, -10)) + 'Q' + pt(q(0, -15)) + ' ' + pt(q(11, -10)), lt(col, 0.2), 0.8 * k) + P(moonD(q(-1, -17)[0], q(-1, -17)[1], 3.4 * k), c.cel(lt(col, 0.1)), 0.6 * k);
    return o;
  }

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- biped rig (facing left; shared copy of art_plaguelands.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
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
      var kneeF = 'M68,' + hipY + ' L71,103 L72,113', kneeN = 'M56,' + hipY + ' L53,103 L52,113';
      if (o.legF) kneeF = o.legF; if (o.legN) kneeN = o.legN;
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
  function pauldron(c, x, y, r, col, trim) {
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function robe(c, col, trim, o) {
    o = o || {};
    var hem = o.hem || 117, s = boot(52, 121, o.boots || '#3a2a1e') + boot(74, 121, dk(o.boots || '#3a2a1e', 0.15));
    var d = 'M47,80 L81,80 C85,94 90,106 93,' + hem + ' L35,' + hem + ' C38,106 42,94 47,80 Z';
    s += body(c, d, col, F('M70,78 L98,78 L98,122 L76,122 C78,106 76,92 70,78 Z', dk(col, 0.26), 0.8) + L('M56,90 L48,' + (hem - 2) + ' M64,90 L63,' + (hem - 2) + ' M74,90 L80,' + (hem - 2), dk(col, 0.24), 1.1) +
      (trim ? L('M36,' + (hem - 2.4) + ' L92,' + (hem - 2.4), trim, o.trimW || 3) : '') + (o.panel ? F(pd([[58, 80], [70, 80], [72, hem], [56, hem]], true), o.panel) + (trim ? L('M58,80 L56,' + hem + ' M70,80 L72,' + hem, trim, 1.4) : '') : ''), 2);
    return s;
  }
  // ---- the Tidebound (drowned Highborne): head, gear, water magic ----
  // head facing left; o.hair 'float' | 'husk', o.helm 'fin' | 'crest', o.circlet, o.jaw, o.blotch
  function deHead(c, x, y, o) {
    var sk = o.skin || DSK, s = '', hc = o.hairCol || '#f2f6f2';
    if (o.hair === 'float') {
      var hd = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 14, y - 18]) + ' ' + pt([x - 6, y - 28]) + ' ' + pt([x + 6, y - 30]) + 'C' + pt([x + 14, y - 32]) + ' ' + pt([x + 20, y - 27]) + ' ' + pt([x + 26, y - 31]) + 'C' + pt([x + 27, y - 24]) + ' ' + pt([x + 30, y - 20]) + ' ' + pt([x + 37, y - 19]) +
        'C' + pt([x + 32, y - 12]) + ' ' + pt([x + 34, y - 6]) + ' ' + pt([x + 38, y - 1]) + 'C' + pt([x + 30, y + 1]) + ' ' + pt([x + 26, y + 6]) + ' ' + pt([x + 23, y + 15]) + 'C' + pt([x + 18, y + 6]) + ' ' + pt([x + 12, y - 2]) + ' ' + pt([x + 4, y - 8]) + 'Z';
      var sl = 'M' + pt([x - 4, y - 12]) + 'C' + pt([x, y - 22]) + ' ' + pt([x + 10, y - 26]) + ' ' + pt([x + 20, y - 25]) + 'M' + pt([x + 4, y - 10]) + 'C' + pt([x + 12, y - 16]) + ' ' + pt([x + 22, y - 16]) + ' ' + pt([x + 30, y - 12]) + 'M' + pt([x + 10, y - 4]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 26, y - 2]) + ' ' + pt([x + 30, y + 2]);
      var fl = 'M' + pt([x + 25, y - 31]) + 'q3,-5 9,-5 M' + pt([x + 37, y - 19]) + 'q5,-2 7,-7 M' + pt([x + 38, y - 1]) + 'q5,0 7,-4';
      s += C(x + 14, y - 12, 30, glow(c, '#e8fff8', 0.3)) + body(c, hd, hc, L(sl, '#aacfd6', 1, 0.9), 1.6) + L(fl, OL, 3) + L(fl, hc, 1.4);
      [[[x - 6, y - 10], [x - 7, y - 22], [x - 1, y - 30], [x + 7, y - 33]], [[x, y - 12], [x + 6, y - 24], [x + 16, y - 30], [x + 25, y - 34]], [[x + 4, y - 8], [x + 14, y - 16], [x + 27, y - 20], [x + 38, y - 22]], [[x + 6, y - 4], [x + 18, y - 6], [x + 29, y - 4], [x + 40, y - 9]], [[x + 8, y + 2], [x + 17, y + 6], [x + 24, y + 13], [x + 33, y + 14]]].forEach(function (lk, i) {
        var T = taper(lk, 10 - i * 0.6, 1.2, 5); s += body(c, T.d, i % 2 ? lt(hc, 0.1) : dk(hc, 0.04), L(along(T, 0.55), '#aacfd6', 0.8, 0.9), 1.3);
      });
    }
    if (o.hair === 'husk') {
      var st = 'M' + pt([x + 2, y - 12]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x + 12, y + 10]) + ' ' + pt([x + 15, y + 24]) + 'M' + pt([x + 6, y - 13]) + 'C' + pt([x + 14, y - 6]) + ' ' + pt([x + 18, y + 8]) + ' ' + pt([x + 22, y + 20]) + 'M' + pt([x + 9, y - 10]) + 'C' + pt([x + 18, y - 2]) + ' ' + pt([x + 22, y + 8]) + ' ' + pt([x + 28, y + 12]);
      s += L(st, OL, 4) + L(st, o.hairCol || '#3e5e3e', 2.2);
    }
    if (o.helm === 'fin') {
      var fin = 'M' + pt([x - 6, y - 15]) + 'C' + pt([x - 6, y - 30]) + ' ' + pt([x + 12, y - 38]) + ' ' + pt([x + 30, y - 34]) + 'C' + pt([x + 25, y - 28]) + ' ' + pt([x + 23, y - 20]) + ' ' + pt([x + 16, y - 11]) + 'Z';
      s += body(c, fin, TEALL, L('M' + pt([x - 2, y - 16]) + 'L' + pt([x + 2, y - 31]) + 'M' + pt([x + 3, y - 15]) + 'L' + pt([x + 12, y - 34]) + 'M' + pt([x + 8, y - 13]) + 'L' + pt([x + 21, y - 33]) + 'M' + pt([x + 12, y - 12]) + 'L' + pt([x + 26, y - 28]), dk(TEALL, 0.3), 1) + L('M' + pt([x - 6, y - 26]) + 'C' + pt([x + 2, y - 36]) + ' ' + pt([x + 16, y - 38]) + ' ' + pt([x + 30, y - 34]), CORAL, 1.8), 1.5);
    }
    if (o.helm === 'crest') {
      s += coral(c, x + 4, y - 16, 1.25, CORAL, 91, 5) + coral(c, x + 12, y - 12, 0.8, CORALD, 92, 3);
    }
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 9, y - 16]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 11, y + 5]) + 'C' + pt([x + 9, y + 12]) + ' ' + pt([x + 1, y + 15]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 12]) + ' ' + pt([x - 11, y + 8]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 14, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.blotch ? E(x - 4, y + 7, 4, 3, dk(sk, 0.2), 0, 0.7) + E(x + 2, y - 10, 3.4, 2.2, dk(sk, 0.16), 0, 0.7) + C(x - 1, y - 6, 1.3, BARN, 0.6) : '') + L('M' + pt([x - 12, y - 6]) + 'C' + pt([x - 10, y - 13]) + ' ' + pt([x - 2, y - 16]) + ' ' + pt([x + 6, y - 14]), lt(sk, 0.5), 1, 0.7), 1.8);
    s += L('M' + pt([x + 2, y + 7]) + 'q2.4,2 1.4,4.6 M' + pt([x + 5, y + 6]) + 'q2.4,2 1.4,4.6 M' + pt([x + 8, y + 4.6]) + 'q2.4,2 1.4,4.6', dk(sk, 0.45), 1);
    if (o.hair === 'float') s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 7, y - 7]) + 'C' + pt([x + 2, y - 11]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.5);
    if (o.helm) {
      var hc2 = o.helmCol || DARM, hm = 'M' + pt([x - 12, y - 3]) + 'C' + pt([x - 13, y - 18]) + ' ' + pt([x + 8, y - 22]) + ' ' + pt([x + 14, y - 9]) + 'L' + pt([x + 15, y + 9]) + 'C' + pt([x + 11, y + 12]) + ' ' + pt([x + 8, y + 7]) + ' ' + pt([x + 7, y + 2]) + 'L' + pt([x - 2, y - 4]) + 'L' + pt([x - 12, y - 1]) + 'Z';
      s += body(c, hm, hc2, F(pd([[x + 3, y - 24], [x + 18, y - 24], [x + 18, y + 12], [x + 5, y + 12]], true), dk(hc2, 0.3), 0.75) + L('M' + pt([x - 12, y - 2]) + 'L' + pt([x - 2, y - 5]) + 'L' + pt([x + 7, y + 1]), o.trim || TGOLD, 1.4) + L('M' + pt([x - 8, y - 14]) + 'C' + pt([x - 2, y - 19]) + ' ' + pt([x + 6, y - 19]) + ' ' + pt([x + 10, y - 14]), lt(hc2, 0.4), 1, 0.8), 1.8);
      s += P(pd([[x - 11, y - 4], [x - 7.4, y - 4], [x - 8.6, y + 3], [x - 10.6, y + 2]], true), c.cel(hc2), 1) + C(x - 5, y - 12, 1.9, c.cel(PEARL), 0.7);
      if (o.helm === 'crest') s += moon(c, x + 2, y - 12, 3, TGOLD);
    }
    var ear = 'M' + pt([x + 4, y - 2]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x + 26, y - 18]) + ' ' + pt([x + 34, y - 26]) + 'C' + pt([x + 28, y - 16]) + ' ' + pt([x + 22, y - 8]) + ' ' + pt([x + 8, y + 5]) + 'Z';
    s += body(c, ear, sk, L('M' + pt([x + 11, y - 3]) + 'l6,-3 M' + pt([x + 16, y - 7]) + 'l6,-4 M' + pt([x + 21, y - 11]) + 'l6,-5', dk(sk, 0.32), 0.8), 1.4) + C(x + 8, y + 6, 1.8, c.cel(PEARL), 0.7);
    s += E(x - 5, y - 2, 3.2, 2.3, '#082222') + gEye(c, x - 5, y - 2, o.eyeR || 1.6, DEYE);
    s += L('M' + pt([x - 11, y - 5.6]) + 'L' + pt([x - 1, y - 6.8]), dk(sk, 0.5), 1.4);
    s += o.jaw ? P('M' + pt([x - 11, y + 6]) + 'Q' + pt([x - 7, y + 14]) + ' ' + pt([x - 2, y + 7]) + 'Z', '#12302a', 1) : L('M' + pt([x - 9, y + 8]) + 'Q' + pt([x - 6, y + 9.4]) + ' ' + pt([x - 3, y + 8]), dk(sk, 0.5), 1.1);
    if (o.circlet) { var ci = 'M' + pt([x - 11, y - 8]) + 'Q' + pt([x, y - 13]) + ' ' + pt([x + 11, y - 9]); s += L(ci, OL, 3.2) + L(ci, TGOLD, 1.6) + C(x - 6, y - 10.4, 2, c.cel(PEARL), 0.7); }
    return s;
  }
  function webFoot(x, y, col) {
    return P('M' + n(x + 4) + ',' + n(y - 7) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 11) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 1) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 6) + ',' + n(y - 3) + ' L' + n(x - 2) + ',' + n(y - 6) + ' Z', c_(col), 1.8) +
      L('M' + n(x - 11) + ',' + n(y + 1) + ' l-1.5,-1 M' + n(x - 7) + ',' + n(y + 1) + ' l-1,-2 M' + n(x - 3) + ',' + n(y + 1) + ' l-0.6,-2.4', OL, 1);
  }
  function fingers(col) { return function (c, p) { return L('M' + pt([p[0] - 2, p[1] - 2]) + 'l-7,-2 M' + pt([p[0] - 2, p[1]]) + 'l-8,1 M' + pt([p[0] - 1, p[1] + 2]) + 'l-6,4', OL, 3.6) + L('M' + pt([p[0] - 2, p[1] - 2]) + 'l-7,-2 M' + pt([p[0] - 2, p[1]]) + 'l-8,1 M' + pt([p[0] - 1, p[1] + 2]) + 'l-6,4', col, 1.8) + C(p[0], p[1], 4.2, c.cel(col), 1.8); }; }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
  function waterOrb(c, x, y, r) {
    var sw = 'M' + pt([x - r * 0.6, y + r * 0.1]) + 'C' + pt([x - r * 0.5, y - r * 0.6]) + ' ' + pt([x + r * 0.5, y - r * 0.6]) + ' ' + pt([x + r * 0.4, y]) + 'C' + pt([x + r * 0.3, y + r * 0.4]) + ' ' + pt([x - r * 0.2, y + r * 0.4]) + ' ' + pt([x - r * 0.1, y]);
    return C(x, y, r * 3, glow(c, WATER, 0.7)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.45, '#c8f6fa'], [1, '#3aa8bc']]), 1.4) + L(sw, '#ffffff', 1, 0.85) + C(x - r * 0.4, y - r * 0.45, r * 0.22, '#ffffff', 0, 0.9) +
      C(x + r * 1.4, y - r * 1.1, 1.2, '#e8fcff', 0.6) + C(x - r * 1.5, y - r * 0.6, 0.9, '#e8fcff', 0.5) + C(x + r * 0.6, y - r * 1.8, 1, '#e8fcff', 0.5);
  }
  function waterRibbon(c, pts, w0, w1, op) {
    var T = taper(pts, w0, w1, 6), e = T.s[T.s.length - 1];
    return G(body(c, T.d, WATER, F(ribbonBand(T, 0, 0.35), '#ffffff', 0.6) + L(along(T, 0.72), dk(WATER, 0.28), 0.8, 0.7), 1.2), '', op == null ? 0.92 : op) + C(e[0], e[1], 1.3, '#f0feff', 0.5) + C(e[0] + 4, e[1] + 2, 0.9, '#f0feff', 0.5);
  }
  // crescent-bladed halberd, blade to the left of the haft top
  function halberd(c, top, bot) {
    var ang = Math.atan2(top[1] - bot[1], top[0] - bot[0]), q = dirQ(top, ang), hd = 'M' + pt(bot) + 'L' + pt(top), bc = '#cfe4e0';
    var o = limb(hd, '#3e4e4e', 3.4) + L(hd, '#6a8080', 1, 0.6) + C(q(-60, 0)[0], q(-60, 0)[1], 2.2, c.cel(PEARL), 0.8);
    var bl = 'M' + pt(q(-2, -2)) + 'C' + pt(q(-3, -22)) + ' ' + pt(q(-31, -22)) + ' ' + pt(q(-32, -2)) + 'C' + pt(q(-26, -12)) + ' ' + pt(q(-8, -12)) + ' ' + pt(q(-2, -2)) + 'Z';
    o += P(bl, c.cel(bc), 1.6) + L('M' + pt(q(-4, -8)) + 'C' + pt(q(-8, -17)) + ' ' + pt(q(-26, -17)) + ' ' + pt(q(-30, -7)), '#ffffff', 0.9, 0.8) + L('M' + pt(q(-3, -4)) + 'C' + pt(q(-4, -19.6)) + ' ' + pt(q(-30, -19.6)) + ' ' + pt(q(-31, -4)), TEAL, 0.8, 0.6);
    o += P(pd([q(0, -2.4), q(15, 0), q(0, 2.4)], true), c.cel(bc), 1.2) + P(pd([q(-10, 1.6), q(-7, 9), q(-15, 1.6)], true), c.cel(dk(bc, 0.1)), 1.1);
    o += R(q(-18, 0)[0] - 2.6, q(-18, 0)[1] - 5, 5.2, 10, c.cel(TGOLD), 1) + C(q(-18, 0)[0], q(-18, 0)[1], 2, c.cel(PEARL), 0.7) + coral(c, q(-22, 3)[0], q(-22, 3)[1], 0.36, CORAL, 51, 3);
    return o;
  }
  // long glaive: a single curved blade on a haft, edge forward
  function glaive(c, top, bot) {
    var ang = Math.atan2(top[1] - bot[1], top[0] - bot[0]), q = dirQ(top, ang), hd = 'M' + pt(bot) + 'L' + pt(top), bc = '#e4f2ee';
    var o = limb(hd, '#2e3e44', 3.6) + L(hd, '#5a7478', 1, 0.6) + C(bot[0], bot[1], 3, c.cel(TGOLD), 1.1);
    var bl = 'M' + pt(q(-3, 3)) + 'L' + pt(q(18, 3.4)) + 'C' + pt(q(23, 3)) + ' ' + pt(q(27, 1)) + ' ' + pt(q(29, -5)) + 'C' + pt(q(22, -8)) + ' ' + pt(q(10, -9)) + ' ' + pt(q(-3, -5)) + 'Z';
    o += C(q(14, -2)[0], q(14, -2)[1], 16, glow(c, DEYE, 0.35)) + P(bl, c.cel(bc), 1.6) + L('M' + pt(q(-1, -5.6)) + 'C' + pt(q(10, -8)) + ' ' + pt(q(22, -7)) + ' ' + pt(q(28, -4.4)), DEYE, 1.2, 0.9) + L('M' + pt(q(0, 1.4)) + 'L' + pt(q(18, 1.6)), dk(bc, 0.2), 0.8);
    o += P(pd([q(3, 3), q(7, 10), q(10, 3)], true), c.cel(dk(bc, 0.1)), 1.1) + R(q(-5, 0)[0] - 3, q(-5, 0)[1] - 3, 6, 6, c.cel(TGOLD), 1) + C(q(-5, 0)[0], q(-5, 0)[1], 2.2, c.cel(PEARL), 0.7);
    return o + coral(c, q(-9, -2)[0], q(-9, -2)[1], 0.4, CORAL, 61, 3);
  }
  // ---- crab rig (facing left) ----
  function crabLeg(c, l, col, w) {
    var t = l[2];
    var m1 = lerp2(l[1], t, 0.45), dx = t[0] - l[1][0], dy = t[1] - l[1][1], dl = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / dl * w * 0.5, py = dx / dl * w * 0.5;
    return limb(pd([l[0], l[1]]), col, w) + limb(pd([l[1], [t[0], t[1] - 3]]), dk(col, 0.06), w * 0.78) + L('M' + pt([m1[0] - px, m1[1] - py]) + 'L' + pt([m1[0] + px, m1[1] + py]), OL, 1) + C(l[1][0], l[1][1], w * 0.55, c.cel(lt(col, 0.12)), 1.1) +
      P(pd([[t[0] - w * 0.4, t[1] - 4], [t[0], t[1] + 1], [t[0] + w * 0.4, t[1] - 4]], true), '#e8dcc8', 0.9);
  }
  // pincer: palm at p, fingers pointing along ang; the movable finger sits on the +v side
  function chela(c, p, s, ang, col, gap, o) {
    o = o || {};
    var q = dirQ(p, ang), g = gap || 0;
    var palm = 'M' + pt(q(-12 * s, 0)) + 'C' + pt(q(-12 * s, 11 * s)) + ' ' + pt(q(4 * s, 13 * s)) + ' ' + pt(q(10 * s, 7 * s)) + 'L' + pt(q(10 * s, -7 * s)) + 'C' + pt(q(4 * s, -12 * s)) + ' ' + pt(q(-12 * s, -10 * s)) + ' ' + pt(q(-12 * s, 0)) + 'Z';
    var fA = 'M' + pt(q(6 * s, 5 * s)) + 'C' + pt(q(14 * s, (10 + g) * s)) + ' ' + pt(q(25 * s, (8 + g) * s)) + ' ' + pt(q(30 * s, (1.5 + g * 0.5) * s)) + 'C' + pt(q(24 * s, (2.5 + g * 0.4) * s)) + ' ' + pt(q(15 * s, 3 * s)) + ' ' + pt(q(8 * s, 1 * s)) + 'Z';
    var fB = 'M' + pt(q(6 * s, -6 * s)) + 'C' + pt(q(14 * s, -9.5 * s)) + ' ' + pt(q(23 * s, -7 * s)) + ' ' + pt(q(28 * s, -1.5 * s)) + 'C' + pt(q(22 * s, -2 * s)) + ' ' + pt(q(14 * s, -1 * s)) + ' ' + pt(q(8 * s, -1 * s)) + 'Z';
    var teeth = '';
    [13, 18, 23].forEach(function (u) { teeth += P(pd([q((u - 1.4) * s, -1.6 * s), q(u * s, 1.2 * s), q((u + 1.4) * s, -1.6 * s)], true), '#f4ecdc', 0.6 * s); });
    var tip = o.tip || dk(col, 0.45);
    return P(fB, c.cel(dk(col, 0.06)), 1.8 * Math.max(0.7, s)) + teeth + F(pd([q(22 * s, -6 * s), q(29 * s, -1.4 * s), q(24 * s, -1.6 * s)], true), tip, 0.9) +
      body(c, palm, col, F(pd([q(-14 * s, -14 * s), q(12 * s, -14 * s), q(12 * s, -3 * s), q(-14 * s, -3 * s)], true), dk(col, 0.25), 0.7) + E(q(-4 * s, 6 * s)[0], q(-4 * s, 6 * s)[1], 5 * s, 2.6 * s, lt(col, 0.35), 0, 0.7) + (o.palm ? o.palm(q) : ''), 2 * Math.max(0.7, s)) +
      P(fA, c.cel(col), 1.8 * Math.max(0.7, s)) + F(pd([q(24 * s, (6 + g) * s), q(30 * s, (1.5 + g * 0.5) * s), q(25 * s, (2.4 + g * 0.4) * s)], true), tip, 0.9);
  }
  function crab(c, o) {
    var sh = o.shell, leg = o.leg || dk(sh, 0.1), legF = dk(leg, 0.22), s = shadow(c, 66, o.shadowR || 54), top = 56 - (o.dome || 0);
    if (o.back) s += o.back(c);
    [[[90, 80], [110, 66], [116, 120]], [[94, 86], [118, 76], [124, 119]], [[92, 92], [116, 90], [112, 121]], [[84, 97], [102, 102], [100, 121]]].forEach(function (l) { s += crabLeg(c, l, legF, o.legW || 5.2); });
    // far claw, raised
    var fc = o.farClaw || [28, 42];
    s += limb('M50,72 L38,58 L' + pt(fc), legF, 7.4) + chela(c, fc, o.farK || 0.66, o.farAng == null ? -PI * 0.64 : o.farAng, legF, o.farGap == null ? 5 : o.farGap);
    // eye stalks
    var eyes = o.eyes || [[40, 50], [51, 46]];
    s += limb('M44,' + (top + 12) + ' L' + pt(eyes[0]), leg, 2.4) + limb('M52,' + (top + 8) + ' L' + pt(eyes[1]), dk(leg, 0.1), 2.4);
    eyes.forEach(function (e, i) { if (o.eyeFn) s += o.eyeFn(c, e, i); else s += C(e[0], e[1], 3.3, '#141414', 1.3) + C(e[0] - 1, e[1] - 1, 1, '#ffffff'); });
    // the shell
    var sd = 'M28,86 C26,' + (top + 12) + ' 44,' + top + ' 66,' + top + ' C90,' + top + ' 106,' + (top + 12) + ' 106,86 C106,96 94,101 66,101 C42,101 30,97 28,86 Z';
    var grooves = 'M46,' + (top + 12) + ' Q66,' + (top + 24) + ' 88,' + (top + 12) + ' M60,' + (top + 3) + ' Q64,' + (top + 14) + ' 62,' + (top + 26) + ' M36,' + (top + 22) + ' Q48,' + (top + 30) + ' 58,' + (top + 28) + ' M96,' + (top + 18) + ' Q86,' + (top + 28) + ' 76,' + (top + 28);
    var inner = F('M76,30 L118,30 L118,104 L84,104 C98,84 96,60 76,30 Z', dk(sh, 0.28), 0.75) + F('M20,88 C40,98 90,100 114,86 L114,106 L20,106 Z', dk(sh, 0.35), 0.85) + E(46, top + 10, 12, 5, lt(sh, 0.3), 0, 0.6) + L(grooves, dk(sh, 0.35), 1.2, 0.8) + (o.inner ? o.inner(c, top) : '');
    s += body(c, sd, sh, inner, 2.4) + L('M32,' + (top + 22) + ' C38,' + (top + 8) + ' 52,' + (top + 1.6) + ' 70,' + (top + 1.6), lt(sh, 0.5), 1.3, 0.75);
    [[29, 80], [31, 72], [35, 65], [42, 60]].forEach(function (p, i) { var a = PI + 0.9 - i * 0.45, q = dirQ(p, a); s += P(pd([q(0, -2.4), q(5, 0), q(0, 2.4)], true), c.cel(lt(sh, 0.1)), 1); });
    if (o.shellTop) s += o.shellTop(c, top);
    s += P('M34,92 L46,92 L45,99 L36,99 Z', c.cel(dk(sh, 0.2)), 1.2) + L('M38,93 l0,5 M42,93 l0,5', OL, 0.8);
    // near legs, under the front
    [[[48, 96], [30, 96], [22, 121]], [[56, 99], [40, 104], [36, 121]], [[66, 100], [56, 108], [52, 121]]].forEach(function (l) { s += crabLeg(c, l, leg, o.legW || 5.6); });
    // near claw
    var nc = o.nearClaw || [32, 92];
    s += limb('M50,90 L40,100 L' + pt(nc), leg, 9) + chela(c, nc, o.nearK || 0.8, o.nearAng == null ? PI + 0.22 : o.nearAng, leg, o.nearGap == null ? 6 : o.nearGap, o.nearOpt);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  var MOBS = {
    reefclaw_snapper: function (c) {
      return crab(c, {
        shell: '#dc5a36', leg: '#c24c30',
        shellTop: function (c, top) {
          return coral(c, 74, top + 4, 0.72, '#f6b0c0', 81, 5) + coral(c, 90, top + 9, 0.5, CORALL, 82, 4) + brainCoral(c, 56, top + 5, 6, 4, '#f4d8c8') + anemone(c, 100, top + 16, 0.7, '#ffd07a') +
            barnacles(83, 9, 40, 100, top + 6, top + 30, 0.9);
        }
      });
    },
    old_brinescale: function (c) {
      var sh = '#7a8594';
      return crab(c, {
        shell: sh, leg: '#666e7c', dome: 10, shadowR: 58, nearK: 1.02, nearGap: 3, nearClaw: [38, 90], nearAng: PI + 0.28, farK: 0.58, legW: 6,
        eyes: [[40, 44], [50, 40]],
        eyeFn: function (c, e, i) { return i === 0 ? C(e[0], e[1], 3.4, '#d8e4d8', 1.3) + C(e[0] - 0.8, e[1], 1.3, '#5a6a60') : C(e[0], e[1], 3.4, '#141414', 1.3) + C(e[0] - 1, e[1] - 1, 1, '#ffffff'); },
        inner: function (c, top) {
          return L('M44,' + (top + 8) + ' L60,' + (top + 30) + ' M52,' + (top + 5) + ' L68,' + (top + 26) + ' M82,' + (top + 10) + ' L98,' + (top + 24), '#2a3038', 3) + L('M44,' + (top + 8) + ' L60,' + (top + 30) + ' M52,' + (top + 5) + ' L68,' + (top + 26) + ' M82,' + (top + 10) + ' L98,' + (top + 24), '#c8ccd0', 1.2, 0.9) +
            E(62, top + 16, 20, 9, '#6a7462', 0, 0.35) + E(88, top + 20, 12, 6, '#8a8466', 0, 0.35);
        },
        shellTop: function (c, top) {
          var o = barnacles(84, 26, 34, 106, top + 4, top + 34, 1.35) + brainCoral(c, 72, top + 4, 7, 4.6, '#9a8a86') + coral(c, 94, top + 8, 0.55, '#a86a60', 85, 4);
          var kp = 'M58,' + (top + 1) + ' q-6,8 -1,15 q5,7 -2,14 q-6,7 -3,16 M67,' + top + ' q5,8 1,15 q-4,7 2,14 q5,8 1,15 M98,' + (top + 12) + ' q5,7 1,13 q-4,7 3,13 q5,6 2,12';
          o += L(kp, OL, 5.4) + L(kp, '#4e6a2c', 3.2) + L(kp, '#7a9a3e', 1, 0.8);
          var ch = 'M84,' + (top + 1) + ' L90,' + (top + 8) + ' L86,' + (top + 12) + ' L92,' + (top + 18) + ' L100,' + (top + 14) + ' L96,' + (top + 6) + ' Z';
          o += P(ch, dk(sh, 0.45), 1.1) + L('M84,' + (top + 1) + ' L90,' + (top + 8) + ' L86,' + (top + 12) + ' L92,' + (top + 18), lt(sh, 0.4), 0.8, 0.9);
          return o;
        },
        nearOpt: { tip: '#1e2228', palm: function (q) { return L('M' + pt(q(-8, -6)) + 'L' + pt(q(4, 4)) + 'M' + pt(q(-2, -8)) + 'L' + pt(q(8, 0)), '#c8ccd0', 1.2, 0.85) + barnacles(86, 6, q(-8, 0)[0] - 4, q(-8, 0)[0] + 8, q(0, 6)[1] - 4, q(0, 6)[1] + 4, 1); } },
        top: function (c) { return L('M16,58 l-4,-3 M14,66 l-5,0', '#e8f0f0', 1.2, 0.7); }
      });
    },
    tidebound_husk: function (c) {
      var sk = '#9ecabb', rag = '#4a7a7e';
      return biped(c, {
        skin: sk, shirt: sk, sleeve: sk, forearm: sk, glove: sk, pants: sk, legW: 8.5, armW: 8, shadowR: 36, hx: 44, hy: 40, neck: false, hipY: 90,
        torsoD: 'M42,54 C46,44 72,42 80,48 C94,58 96,78 86,92 L52,94 C40,86 36,68 42,54 Z',
        legN: 'M58,90 L52,105 L50,114', footN: [51, 121], legF: 'M72,90 L77,105 L77,114', footF: [79, 121], feet: webFoot, boots: dk(sk, 0.22),
        back: function (c) { return kelpHang(88, 52, 60, 101, '#4e6e30', 2.4) + kelpHang(80, 56, 50, 102, '#5e7a34', 1.8); },
        chest: function (c) {
          return E(62, 74, 20, 14, lt(sk, 0.18), 0, 0.5) + E(54, 64, 5, 3.4, dk(sk, 0.2), 0, 0.7) + E(76, 80, 6, 3.6, dk(sk, 0.18), 0, 0.7) + E(66, 86, 4, 2.4, '#6a8a7e', 0, 0.6) +
            barnacles(103, 8, 48, 80, 58, 86, 1) + L('M44,58 C54,62 66,72 70,92', OL, 4.4) + L('M44,58 C54,62 66,72 70,92', '#5e7a34', 2.4);
        },
        front: function (c) {
          var rg = 'M48,84 L86,84 L88,102 L82,98 L78,108 L72,100 L66,110 L60,100 L54,106 L50,98 L46,102 Z';
          return body(c, rg, rag, F('M72,80 L92,80 L92,110 L74,110 Z', dk(rag, 0.3), 0.7) + E(62, 96, 3, 2.4, '#1e3032', 0, 0.9) + L('M50,88 L86,88', lt(rag, 0.25), 1.2, 0.8), 1.8) + kelpHang(58, 92, 26, 104, '#5e7a34', 1.8);
        },
        pads: function (c) { return coral(c, 78, 50, 0.6, CORAL, 105, 4) + barnacles(106, 7, 40, 56, 48, 58, 1.1) + brainCoral(c, 46, 52, 5, 3.4, CORALP); },
        head: function (c, x, y) { return deHead(c, x, y, { skin: sk, hair: 'husk', jaw: true, blotch: true, eyeR: 1.5 }); },
        near: [[46, 58], [32, 64], [20, 68]], nearHand: fingers(sk),
        far: [[80, 54], [90, 70], [88, 86]], farHand: fingers(dk(sk, 0.1)),
        top: function (c) { return kelpHang(30, 66, 36, 107, '#4e6e30', 2) + kelpHang(26, 68, 24, 108, '#6a843a', 1.4) + C(22, 80, 1.3, WATER, 0.5) + C(28, 90, 1, WATER, 0.5) + C(34, 104, 1.2, WATER, 0.5); }
      });
    },
    kelp_horror: function (c) {
      var k1 = '#5a5e26', k2 = '#76782e', k3 = '#46481e', k4 = '#8a8434', eye = '#ffcc3a', s = shadow(c, 64, 46);
      var frond = function (pts, w, col) { var T = taper(pts, w, 1.4, 5); return body(c, T.d, col, L(along(T, 0.5), dk(col, 0.35), 0.8, 0.8) + F(ribbonBand(T, 0.65, 1), dk(col, 0.25), 0.6), 1.4); };
      // fronds sticking out of the back of the mass
      s += frond([[70, 30], [86, 14], [100, 12], [110, 22]], 9, k3) + frond([[86, 42], [104, 34], [116, 44], [120, 60]], 9, k1) + frond([[56, 30], [50, 12], [38, 8], [30, 16]], 8, k3);
      // far arm: a bundle of strands hanging from the right shoulder
      s += frond([[90, 52], [106, 66], [110, 88], [106, 108]], 11, dk(k1, 0.15)) + frond([[94, 60], [112, 74], [118, 94], [116, 112]], 7, k3);
      var lf = taper([[76, 90], [80, 106], [82, 119]], 17, 14, 4), ln = taper([[52, 90], [48, 106], [44, 119]], 18, 15, 4);
      var roots = function (x, col) { var d = 'M' + pt([x - 2, 118]) + 'q-6,1 -9,4 M' + pt([x, 119]) + 'q-2,2 -3,3 M' + pt([x + 3, 118]) + 'q5,1 8,4'; return L(d, OL, 4.4) + L(d, col, 2.2); };
      s += body(c, lf.d, dk(k1, 0.22), L(along(lf, 0.3) + along(lf, 0.7), dk(k1, 0.5), 1), 1.8) + roots(82, dk(k1, 0.22));
      s += body(c, ln.d, k1, L(along(ln, 0.3) + along(ln, 0.7), dk(k1, 0.4), 1), 1.8) + roots(44, k1);
      // the mass
      var md = shag(64, 60, 36, 36, 11, 0.22, 71, -0.3);
      var inner = F('M74,16 L112,16 L112,104 L84,104 C100,80 96,40 74,16 Z', dk(k1, 0.3), 0.75);
      [[[46, 24], [38, 50], [42, 76], [36, 96]], [[62, 22], [60, 50], [66, 76], [62, 98]], [[80, 28], [86, 54], [80, 78], [86, 98]], [[32, 44], [28, 66], [34, 88]], [[94, 40], [100, 66], [94, 90]]].forEach(function (b, i) {
        var T = taper(b, 12, 5, 5), col = i % 2 ? k2 : k3;
        inner += F(T.d, col, 0.95) + L(along(T, 0.5), dk(col, 0.35), 0.8, 0.8) + L(along(T, 0.15), lt(col, 0.3), 0.8, 0.6);
      });
      [[58, 40], [76, 58], [46, 76], [86, 80], [64, 88]].forEach(function (b) { inner += E(b[0], b[1], 3.2, 4, c.cel('#b8a040'), 1); });
      s += body(c, md, k1, inner, 2.2);
      var fr = '';
      for (var i = 0; i < 9; i++) { var x0 = 34 + i * 7, l = 10 + (i * 7 % 5) * 3; fr += 'M' + pt([x0, 92]) + 'q' + n(-2 + (i % 3)) + ',' + n(l * 0.5) + ' ' + n(-1 + (i % 2) * 2) + ',' + n(l); }
      s += L(fr, OL, 4.6) + L(fr, k1, 2.6) + L(fr, lt(k1, 0.2), 0.9, 0.7);
      // fronds draped over the top of the mass, drooping to both sides
      s += frond([[62, 28], [48, 22], [36, 28], [28, 42]], 10, k2) + frond([[66, 28], [80, 20], [94, 26], [102, 40]], 10, k4) + frond([[64, 28], [64, 14], [72, 6], [80, 8]], 7, k2);
      s += L('M30,50 C34,34 48,26 62,26', '#c8e08a', 1.1, 0.6);
      // hollow face and glowing eyes
      s += E(48, 54, 15, 10, '#0e1206', 0, 0.9) + glowEye(c, 41, 53, 2.8, eye) + glowEye(c, 55, 51, 2.4, eye) + L('M38,64 q5,3 10,1 q4,-1 7,1', '#0e1206', 2.2);
      // near arm: three strands reaching forward, splaying like fingers
      s += frond([[36, 66], [26, 80], [22, 96], [24, 110]], 9, k1) + frond([[36, 62], [24, 70], [14, 82], [8, 96]], 11, k2) + frond([[36, 60], [22, 62], [10, 66], [4, 76]], 8, k4);
      s += shell(c, 80, 70, 0.9) + barnacles(72, 6, 56, 92, 34, 50, 1) + P('M90,64 l8,-2 l-1,4 Z M92,66 l0,-4 M95,66 l0,-4', '#e8e0cc', 0.8);
      return s + C(30, 104, 1.4, '#a8d890', 0, 0.8) + C(72, 110, 1.2, '#a8d890', 0, 0.8) + motes(73, 6, 20, 110, 20, 100, '#e8ffb0');
    },
    tidebound_sentinel: function (c) {
      var sk = DSK, pl = DARM, pl2 = dk(pl, 0.2);
      return G(biped(c, {
        skin: sk, shirt: pl, sleeve: pl2, forearm: pl, glove: pl2, pants: pl2, boots: dk(pl, 0.4), legW: 11, armW: 9.5, shadowR: 40, neckCol: pl2, hx: 58, hy: 32,
        legN: 'M56,86 L47,102 L43,113', footN: [43, 121], legF: 'M69,86 L75,102 L77,113', footF: [78, 121],
        chest: function (c) { return L('M50,56 q7,4 14,0 q7,4 14,0 M50,64 q7,4 14,0 q7,4 14,0 M50,72 q7,4 14,0 q7,4 14,0', dk(pl, 0.35), 1) + L('M64,48 L64,84', lt(pl, 0.3), 1.2) + coral(c, 72, 70, 0.4, CORAL, 111, 3) + C(64, 60, 2.6, c.cel(PEARL), 0.8); },
        front: function (c) {
          var sk2 = 'M48,82 L80,82 L84,104 L74,100 L66,106 L58,100 L46,104 Z';
          return body(c, sk2, pl2, L('M50,90 L82,90 M49,97 L83,97', dk(pl2, 0.35), 1) + F('M68,80 L88,80 L88,108 L70,108 Z', dk(pl2, 0.3), 0.7), 1.8) + P('M48,78 L80,78 L80,84 L48,84 Z', c.cel(TGOLD), 1.5) + C(64, 81, 2.6, c.cel(PEARL), 0.8);
        },
        shins: function (c) { return P('M38,104 L50,104 L49,114 L39,114 Z', c.cel(pl), 1.4) + P('M72,104 L82,104 L82,114 L73,114 Z', c.cel(pl2), 1.4) + coral(c, 44, 106, 0.45, CORAL, 112, 3) + barnacles(113, 3, 72, 82, 106, 112, 0.8); },
        pads: function (c) { return pauldron(c, 81, 51, 9, pl2, TGOLD) + pauldron(c, 47, 53, 12, pl, TGOLD) + coral(c, 44, 46, 0.55, CORAL, 114, 4) + barnacles(115, 4, 40, 54, 48, 54, 0.9) + C(52, 50, 1.8, c.cel(PEARL), 0.7); },
        head: function (c, x, y) { return deHead(c, x, y, { skin: sk, helm: 'fin' }); },
        far: [[80, 54], [86, 70], [82, 84]], farHand: gauntlet(pl2),
        wNear: function (c) { return halberd(c, [22, 14], [38, 121]); },
        near: [[48, 56], [38, 66], [31, 72]], nearHand: gauntlet(pl2)
      }), at(1.03, 64, 122));
    },
    tidebound_sorceress: function (c) {
      var sk = DSK, rb = DROBE;
      return G(biped(c, {
        skin: sk, shirt: rb, sleeve: lt(rb, 0.1), forearm: rb, glove: sk, noLegs: true, armW: 8.5, hx: 58, hy: 36, neckCol: sk,
        torsoD: 'M48,52 C54,47 74,47 80,52 L78,70 L77,88 L51,88 L50,70 Z',
        back: function (c) { return C(64, 66, 58, glow(c, WATER, 0.25)) + waterRibbon(c, [[26, 116], [14, 100], [18, 80], [30, 70]], 2, 6, 0.8); },
        chest: function (c) { return F('M58,50 L70,50 L68,88 L60,88 Z', lt(rb, 0.14), 0.9) + L('M52,52 Q64,60 76,52', OL, 3.4) + [[54, 54], [58, 56.4], [62, 57.4], [66, 57.4], [70, 56.4], [74, 54]].map(function (p) { return C(p[0], p[1], 1.6, c.cel(PEARL), 0.6); }).join('') + coral(c, 64, 70, 0.36, CORAL, 121, 3); },
        front: function (c) { return robe(c, rb, PEARL, { trimW: 3, panel: lt(rb, 0.14), boots: '#1e3a40' }) + P('M48,80 L80,80 L80,86 L48,86 Z', c.cel(CORALD), 1.5) + C(64, 83, 2.6, c.cel(PEARL), 0.8) + L('M40,108 C52,112 76,112 88,108', lt(rb, 0.3), 1, 0.8) + barnacles(122, 4, 40, 90, 110, 115, 0.7); },
        pads: function (c) { return shell(c, 80, 56, 1.4, '#e8d8c8') + shell(c, 47, 58, 1.7, '#f0e0d0'); },
        head: function (c, x, y) { return deHead(c, x, y, { skin: sk, hair: 'float', circlet: true }); },
        near: [[48, 57], [36, 62], [26, 54]], far: [[80, 56], [94, 60], [104, 48]],
        top: function (c) { return waterOrb(c, 20, 46, 6.4) + waterRibbon(c, [[104, 56], [114, 48], [112, 34], [100, 30], [96, 40], [104, 44]], 7, 1.4) + C(116, 26, 1.3, '#e8fcff', 0.5) + C(92, 24, 1, '#e8fcff', 0.5); }
      }), at(1.0, 64, 122));
    },
    warden_ithrael: function (c) {
      var sk = DSK, pl = '#36687a', pl2 = dk(pl, 0.18), tr = TGOLD;
      return G(biped(c, {
        skin: sk, shirt: pl, sleeve: pl2, forearm: pl, glove: pl2, pants: pl2, boots: dk(pl, 0.4), legW: 12, armW: 10, shadowR: 46, neckCol: pl2, hx: 58, hy: 32,
        legN: 'M56,86 L45,101 L40,113', footN: [40, 121], legF: 'M70,86 L78,102 L82,113', footF: [83, 121],
        back: function (c) {
          var cp = 'M54,46 C78,44 92,50 98,60 C104,80 110,100 116,118 L106,113 L98,120 L90,112 L80,118 C78,96 72,70 54,46 Z';
          return C(64, 66, 64, glow(c, WATER, 0.3)) + waterRibbon(c, [[112, 112], [120, 88], [112, 66], [118, 44], [112, 30]], 9, 2, 0.85) +
            body(c, cp, DROBE, F('M88,40 L120,40 L120,122 L100,122 C104,90 98,60 88,40 Z', dk(DROBE, 0.3), 0.7) + L('M82,117 L90,111 L98,119 L106,112 L115,117', tr, 1.8), 2) +
            waterRibbon(c, [[14, 110], [30, 102], [64, 98], [100, 100], [116, 108]], 3, 8, 0.8);
        },
        chest: function (c) { return L('M52,56 C58,60 70,60 76,56', lt(pl, 0.35), 1.2) + moon(c, 64, 66, 6, tr) + C(64, 66, 10, glow(c, DEYE, 0.3)) + C(68, 66, 1.8, c.cel(PEARL), 0.6) + L('M50,76 L78,76', tr, 1.4); },
        front: function (c) {
          var sk2 = 'M47,82 L81,82 L86,108 L75,103 L66,110 L57,103 L44,108 Z';
          return body(c, sk2, pl2, L('M49,90 L83,90 M48,98 L84,98', dk(pl2, 0.35), 1) + L('M47,106 L57,101 L66,108 L75,101 L85,106', tr, 1.4) + F('M68,80 L90,80 L90,112 L70,112 Z', dk(pl2, 0.3), 0.7), 1.8) +
            P('M47,78 L81,78 L81,84 L47,84 Z', c.cel(tr), 1.5) + C(64, 81, 2.8, c.cel(PEARL), 0.8) + coral(c, 80, 96, 0.4, CORAL, 131, 3);
        },
        shins: function (c) { return P('M34,103 L47,103 L46,114 L35,114 Z', c.cel(pl), 1.4) + P('M76,103 L87,103 L87,114 L77,114 Z', c.cel(pl2), 1.4) + L('M34,105 L47,105 M76,105 L87,105', tr, 1.2) + coral(c, 40, 104, 0.45, CORAL, 132, 3); },
        pads: function (c) { return pauldron(c, 82, 50, 10, pl2, tr) + pauldron(c, 46, 52, 14, pl, tr) + coral(c, 42, 44, 0.7, CORAL, 133, 5) + coral(c, 86, 44, 0.45, CORALD, 134, 3) + C(52, 49, 2.2, c.cel(PEARL), 0.7) + C(38, 51, 1.8, c.cel(PEARL), 0.6) + barnacles(135, 4, 40, 54, 50, 55, 0.9); },
        head: function (c, x, y) { return deHead(c, x, y, { skin: sk, helm: 'crest', helmCol: '#2e5a6c', eyeR: 1.9 }); },
        far: [[80, 54], [90, 66], [86, 80]], farHand: gauntlet(pl2),
        wNear: function (c) { return glaive(c, [22, 34], [60, 122]); },
        near: [[48, 56], [40, 66], [38, 72]], nearHand: gauntlet(pl2),
        top: function (c) { return waterRibbon(c, [[116, 108], [106, 118], [64, 122], [26, 118], [10, 106]], 8, 2, 0.75) + C(12, 96, 1.4, '#e8fcff', 0.6) + C(118, 96, 1.2, '#e8fcff', 0.6) + C(8, 116, 1, '#e8fcff', 0.5) + motes(136, 10, 8, 120, 20, 118, '#c8f8ff'); }
      }), at(1.04, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#4f8a92'), 2.5); }
  function phScene(c) { return sky(c, '#7fa6b4', '#c2d8d8', '#eef0e4') + ground(c, 118, '#bcae88', '#7a6c50'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#4f8a92"/></svg>'; }
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
