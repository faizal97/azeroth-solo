/* art_duskwood.js — Wraithwood zone art for Realm of Loner (Accord, levels 24-30: Lanternby, Hollin Grove,
 * the Blackreed Bank, Harlow Cemetery, Cobb's Rest, Gruk's Mound, the Crookapple Orchard).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Wraithwood keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and rigs (biped, ogre head, spider, farmhouse, lanterns) are shared copies of art_redridge.js so the
 * zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix dw<counter>_).
 * Palette: eternal night under a huge pale moon, blue-violet sky, black twisted trees, cold blue-green ground fog,
 * warm orange lamplight only in Lanternby. Figures get a cold moon rim so they separate from the dark.
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
  function Ctx() { this.p = 'dw' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function rot(a, x, y) { return 'rotate(' + n(a) + ',' + n(x) + ',' + n(y) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.5) + L(d, col, w) +
      (sh ? '<path transform="translate(' + n(w * 0.24) + ',' + n(w * 0.08) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.36) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' : '');
  }
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
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  // many-pointed star (used for a lion-head crest and gear teeth)
  function star(cx, cy, k, r0, r1) {
    var d = '';
    for (var i = 0; i < k * 2; i++) { var a = -PI / 2 + PI * i / k, r = i % 2 ? r1 : r0; d += (i ? 'L' : 'M') + pt([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return d + 'Z';
  }

  // ---------- palette ----------
  var DEF_RED = '#b82d31', DEF_HOOD = '#a3252a', STONE = '#b0a288', BEAM = '#5a3a24', PLASTER = '#ece2cc', ROOF = '#8e3e2a', WOODW = '#8e7456', WOOD = '#8a5a32';

  // ============================================================
  //  SCENE PIECES (shared house style)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 5, glow(c, col || '#ffe6a8', 0.55)) + C(x, y, r, lt(col || '#ffe6a8', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#fff0d0', 0.14], [0.5, '#fff0d0', 0], [1, bot || '#3a1e08', 0.22]])); }
  // warm late-afternoon light washing in from one side
  function warmth(c, left) { return R(0, 0, 400, 240, c.lg([[0, '#ffb060', left ? 0.16 : 0], [1, '#ffb060', left ? 0 : 0.16]], 0, 0, 1, 0)); }
  function cloud(x, y, s, op) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, '#fff8ec', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', '#f0c8a0', 0.85);
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
    col = col || '#c0a044';
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
  // dusty road narrowing into the distance; cx = where it meets the horizon
  function road(c, y, w1, w2, col, op, cx, bx) {
    cx = cx == null ? 200 : cx; bx = bx == null ? 200 : bx;
    return F('M' + (cx - w1) + ',' + y + ' C' + (cx - w1) + ',' + (y + 30) + ' ' + (bx - w2) + ',210 ' + (bx - w2) + ',242 L' + (bx + w2) + ',242 C' + (bx + w2) + ',210 ' + (cx + w1) + ',' + (y + 30) + ' ' + (cx + w1) + ',' + y + ' Z', col, op == null ? 0.55 : op);
  }
  function ruts(y0, cx, bx, w1, w2, col) {
    var d = '';
    [-0.45, 0.45].forEach(function (k) { d += 'M' + pt([cx + w1 * k, y0]) + 'C' + pt([cx + w1 * k, y0 + 30]) + ' ' + pt([bx + w2 * k, 210]) + ' ' + pt([bx + w2 * k, 242]); });
    return L(d, col, 1.4, 0.45);
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function smoke(x, y, s, seed, col, len) {
    var r = rng(seed || 4), o = '', k = len || 6;
    for (var i = 0; i < k; i++) { var t = i / (k - 1), sx = x + t * 46 * s + r() * 5, sy = y - t * 60 * s - r() * 5, rr = (5 + t * 12) * s; o += C(sx, sy, rr, i % 2 ? (col || '#8a8680') : lt(col || '#8a8680', 0.15), 0, 0.72 - t * 0.5); }
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#8a5a32';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  function crate(c, x, y, s, col) {
    col = col || '#a8743e';
    var d = 'M' + pt([x - 10 * s, y]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'Z';
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, L('M' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), dk(col, 0.4), 1.4 * s) + F('M' + pt([x + 4 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.4), 0.5), 1.6 * s);
  }
  // Grey Hood crate: a red cloth tied over the lid
  function defCrate(c, x, y, s) {
    return crate(c, x, y, s, '#9a6a3a') + P('M' + pt([x - 11 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 8 * s]) + 'L' + pt([x, y - 10 * s]) + 'L' + pt([x - 4 * s, y - 6 * s]) + 'L' + pt([x - 7 * s, y - 11 * s]) + 'L' + pt([x - 11 * s, y - 9 * s]) + 'Z', c.cel(DEF_RED), 1.3 * s);
  }
  function sack(c, x, y, s, col) {
    col = col || '#c8aa76';
    var d = 'M' + pt([x - 9 * s, y]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'C' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, F('M' + pt([x + 2 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + L('M' + pt([x - 4 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 17 * s]), '#6a4a2a', 1.6 * s), 1.5 * s);
  }
  function fence(c, x1, x2, y, h, col, step) {
    col = col || WOODW;
    var o = '', posts = '';
    for (var x = x1; x <= x2; x += (step || 18)) posts += 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h);
    var rl = 'M' + x1 + ',' + n(y - h * 0.7) + ' L' + x2 + ',' + n(y - h * 0.72) + ' M' + x1 + ',' + n(y - h * 0.3) + ' L' + x2 + ',' + n(y - h * 0.32);
    o += L(posts + rl, OL, 5) + L(rl, lt(col, 0.1), 2) + L(posts, col, 2.6);
    return o;
  }
  // Kingsmere-style farmhouse: stone ground floor, half-timbered upper, steep shingle roof
  function farmhouse(c, x, y, s, o) {
    o = o || {};
    var plaster = o.wall || PLASTER, beam = BEAM, roofc = o.roof || ROOF, stone = o.stone || STONE, out = '', ruin = o.ruin;
    var win = ruin ? '#2a1a12' : (o.lit ? '#ffd46a' : '#5a6a7a');
    out += E(x, y + 2, 50 * s, 5 * s, '#000', 0, 0.26);
    var w = 38 * s, h = 38 * s;
    var inner = '';
    // chimney + smoke
    if (!ruin) inner += smoke(x + 22 * s, y - h - 44 * s, s, 11, o.smoke || '#b0aaa0', 5);
    inner += body(c, 'M' + pt([x + 16 * s, y - h - 14 * s]) + 'L' + pt([x + 17 * s, y - h - 38 * s]) + 'L' + pt([x + 27 * s, y - h - 38 * s]) + 'L' + pt([x + 26 * s, y - h - 8 * s]) + 'Z', stone, F('M' + pt([x + 22 * s, y - h - 40 * s]) + 'L' + pt([x + 30 * s, y - h - 40 * s]) + 'L' + pt([x + 30 * s, y - h]) + 'L' + pt([x + 22 * s, y - h]) + 'Z', dk(stone, 0.28), 0.8), 1.8 * s);
    // stone ground floor
    var wall = 'M' + pt([x - w, y]) + 'L' + pt([x - w, y - h * 0.5]) + 'L' + pt([x + w, y - h * 0.5]) + 'L' + pt([x + w, y]) + 'Z';
    var joints = '';
    for (var j = 1; j < 3; j++) { var jy = y - h * 0.5 * j / 3; joints += 'M' + pt([x - w, jy]) + 'L' + pt([x + w, jy]); for (var q = -3; q <= 3; q++) joints += 'M' + pt([x + (q * 11 + (j % 2 ? 5 : 0)) * s, jy]) + 'l0,' + n(h * 0.5 / 3); }
    inner += body(c, wall, stone, F('M' + pt([x + w * 0.45, y - h]) + 'L' + pt([x + w + 2, y - h]) + 'L' + pt([x + w + 2, y + 2]) + 'L' + pt([x + w * 0.45, y + 2]) + 'Z', dk(stone, 0.28), 0.7) + L(joints, dk(stone, 0.3), 0.9 * s, 0.8), 2 * s);
    // timber upper storey (overhangs)
    var up = 'M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x - w - 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'Z';
    var beams = L('M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'M' + pt([x - w, y - h]) + 'L' + pt([x - w, y - h * 0.5]) + 'M' + pt([x - w * 0.33, y - h]) + 'L' + pt([x - w * 0.33, y - h * 0.5]) + 'M' + pt([x + w * 0.33, y - h]) + 'L' + pt([x + w * 0.33, y - h * 0.5]) + 'M' + pt([x + w, y - h]) + 'L' + pt([x + w, y - h * 0.5]) +
      'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x - w * 0.33, y - h]) + 'M' + pt([x + w * 0.33, y - h * 0.5]) + 'L' + pt([x + w, y - h]), beam, 2.6 * s);
    var ush = F('M' + pt([x + w * 0.45, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h * 0.5 + 2]) + 'L' + pt([x + w * 0.45, y - h * 0.5 + 2]) + 'Z', dk(plaster, 0.25), 0.8);
    if (ruin) ush += F('M' + pt([x - w * 0.9, y - h]) + 'L' + pt([x - w * 0.4, y - h]) + 'L' + pt([x - w * 0.55, y - h * 0.78]) + 'L' + pt([x - w * 0.8, y - h * 0.72]) + 'Z', '#3a2a20', 0.9) + E(x + w * 0.2, y - h * 0.75, 10 * s, 5 * s, '#4a3a2a', 0, 0.45);
    inner += body(c, up, plaster, ush + beams, 2 * s);
    // steep roof
    var roof = 'M' + pt([x - w - 12 * s, y - h + 2 * s]) + 'L' + pt([x - 2 * s, y - h - 34 * s]) + 'L' + pt([x + 2 * s, y - h - 34 * s]) + 'L' + pt([x + w + 12 * s, y - h + 2 * s]) + 'Z';
    var rsh = F('M' + pt([x + 2 * s, y - h - 36 * s]) + 'L' + pt([x + w + 14 * s, y - h + 4 * s]) + 'L' + pt([x + 12 * s, y - h + 4 * s]) + 'Z', dk(roofc, 0.3), 0.8);
    for (var i = 1; i < 5; i++) rsh += L('M' + pt([x - w - 12 * s + i * 5 * s, y - h + 2 * s - i * 7 * s]) + 'L' + pt([x + w + 12 * s - i * 5 * s, y - h + 2 * s - i * 7 * s]), dk(roofc, 0.3), 1 * s, 0.8);
    if (ruin) rsh += F('M' + pt([x - 22 * s, y - h - 6 * s]) + 'L' + pt([x - 10 * s, y - h - 22 * s]) + 'L' + pt([x + 2 * s, y - h - 14 * s]) + 'L' + pt([x + 8 * s, y - h - 22 * s]) + 'L' + pt([x + 18 * s, y - h - 6 * s]) + 'L' + pt([x + 4 * s, y - h]) + 'L' + pt([x - 14 * s, y - h]) + 'Z', '#1e140e');
    inner += body(c, roof, roofc, rsh, 2.2 * s);
    if (ruin) for (var k = 0; k < 4; k++) inner += limb('M' + pt([x - 16 * s + k * 9 * s, y - h - 2 * s]) + 'L' + pt([x - 12 * s + k * 8 * s + (k % 2 ? 3 : -2) * s, y - h - (20 - k * 2) * s]), '#4a3424', 1.4 * s);
    // windows + door
    var win1 = R(x - w * 0.82, y - h * 0.92, 9 * s, 9 * s, win, 1.6 * s), win2 = R(x + w * 0.46, y - h * 0.92, 9 * s, 9 * s, win, 1.6 * s);
    inner += win1 + win2 + L('M' + pt([x - w * 0.82 + 4.5 * s, y - h * 0.92]) + 'l0,' + n(9 * s) + 'M' + pt([x + w * 0.46 + 4.5 * s, y - h * 0.92]) + 'l0,' + n(9 * s), BEAM, 1.2 * s);
    if (o.lit && !ruin) inner += C(x - w * 0.82 + 4.5 * s, y - h * 0.88, 14 * s, glow(c, '#ffc860', 0.4)) + C(x + w * 0.46 + 4.5 * s, y - h * 0.88, 14 * s, glow(c, '#ffc860', 0.4));
    inner += R(x - w * 0.75, y - h * 0.4, 8 * s, 8 * s, win, 1.4 * s);
    if (ruin) inner += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#140e0a', 1.6 * s) + P('M' + pt([x + 6 * s, y]) + 'L' + pt([x + 12 * s, y - 2 * s]) + 'L' + pt([x + 9 * s, y - 14 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'Z', c.cel('#6a4a30'), 1.4 * s);
    else inner += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', c.cel('#6a4428'), 1.6 * s) + C(x + 3 * s, y - 7 * s, 1 * s, '#e0b848');
    // broken corner rubble
    if (ruin) inner += rock(c, x + w + 6 * s, y + 2, 14 * s, 7 * s, stone) + rock(c, x - w - 4 * s, y + 2, 10 * s, 6 * s, stone);
    return out + inner;
  }
  function hangLantern(c, x, y, s) {
    return C(x, y + 6 * s, 12 * s, glow(c, '#ffc040', 0.6)) + L('M' + pt([x, y - 4 * s]) + 'L' + pt([x, y + 1 * s]), OL, 1.2 * s) + R(x - 3 * s, y + 1 * s, 6 * s, 8 * s, '#ffd060', 1.2 * s) + R(x - 3.6 * s, y, 7.2 * s, 2 * s, '#4a3a2a', 1 * s);
  }
  function lanternPost(c, x, y, h, s) {
    var top = y - h;
    return E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x, top + 2 * s]) + 'L' + pt([x - 10 * s, top + 2 * s]), '#6a4a2a', 2 * s) + hangLantern(c, x - 9 * s, top + 6 * s, s);
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  // bare dead tree, forked limbs
  function deadTree(c, x, y, s, col) {
    col = col || '#6e5a48';
    var o = E(x, y + 2, 20 * s, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x - 2 * s, y - 44 * s]) + 'L' + pt([x - 18 * s, y - 62 * s]) + 'L' + pt([x - 28 * s, y - 62 * s]), col, 3 * s) + limb('M' + pt([x - 14 * s, y - 58 * s]) + 'L' + pt([x - 14 * s, y - 72 * s]), col, 2 * s);
    o += limb('M' + pt([x + 2 * s, y - 46 * s]) + 'L' + pt([x + 12 * s, y - 70 * s]) + 'L' + pt([x + 20 * s, y - 76 * s]), col, 3 * s) + limb('M' + pt([x + 10 * s, y - 64 * s]) + 'L' + pt([x + 2 * s, y - 78 * s]), col, 1.8 * s);
    o += limb('M' + pt([x + 2 * s, y - 28 * s]) + 'L' + pt([x + 20 * s, y - 38 * s]) + 'L' + pt([x + 26 * s, y - 48 * s]), col, 2.6 * s) + limb('M' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x - 14 * s, y - 30 * s]), col, 2 * s);
    var tr = 'M' + pt([x - 6 * s, y]) + 'C' + pt([x - 3 * s, y - 18 * s]) + ' ' + pt([x - 6 * s, y - 34 * s]) + ' ' + pt([x - 2 * s, y - 48 * s]) + 'L' + pt([x + 3 * s, y - 48 * s]) + 'C' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + ' ' + pt([x + 8 * s, y]) + 'Z';
    o += body(c, tr, col, F('M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x + 10 * s, y - 50 * s]) + 'L' + pt([x + 10 * s, y + 2]) + 'L' + pt([x + 2 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8) + L('M' + pt([x - 2 * s, y - 10 * s]) + 'l1,' + n(-10 * s), dk(col, 0.4), 1 * s), 1.8 * s);
    return o;
  }
  function pike(c, x, y, h, s) { return limb('M' + pt([x, y]) + 'L' + pt([x, y - h]), '#6a4a2a', 2.2 * s) + skull(c, x, y - h - 3 * s, 0.9 * s); }

  // ============================================================
  //  MOB PIECES (shared rigs, copied from art_redridge.js)
  // ============================================================
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2) + L('M' + n(x - 0.5) + ',' + n(y - 3) + ' L' + n(x - 0.5) + ',' + n(y + 1), OL, 1.2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function sword(p, len, ang, blade, s) {
    var x = p[0], y = p[1], a = ang, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; s = s || 1;
    var tip = [x + ca * len, y + sa * len], b0 = [x + ca * 7, y + sa * 7];
    var d = 'M' + pt([b0[0] + px * 3 * s, b0[1] + py * 3 * s]) + 'L' + pt([tip[0] + px * 2.5 * s, tip[1] + py * 2.5 * s]) + 'Q' + pt([tip[0] + ca * 4, tip[1] + sa * 4]) + ' ' + pt([tip[0] - px * 3 * s, tip[1] - py * 3 * s]) + 'L' + pt([b0[0] - px * 3 * s, b0[1] - py * 3 * s]) + 'Z';
    var o = P(d, c_(blade || '#c8ccd2'), 1.8) + L('M' + pt([b0[0] + ca * 2, b0[1] + sa * 2]) + 'L' + pt([tip[0] - ca * 4, tip[1] - sa * 4]), '#ffffff', 1, 0.6);
    o += L('M' + pt([x + ca * 6 + px * 6, y + sa * 6 + py * 6]) + 'L' + pt([x + ca * 6 - px * 6, y + sa * 6 - py * 6]), OL, 5) + L('M' + pt([x + ca * 6 + px * 6, y + sa * 6 + py * 6]) + 'L' + pt([x + ca * 6 - px * 6, y + sa * 6 - py * 6]), '#8a8a90', 2.6) +
      L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), OL, 5) + L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), '#5a3a22', 2.6);
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
  // ---- biped rig (facing left) ----
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.forearm || sleeve, armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86, toe = o.feet || boot;
    var kneeF = o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113';
    var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
    s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
    s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    if (o.shins) s += o.shins(c);
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L92,40 L92,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
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
    return o.tf ? G(s, o.tf) : s;
  }

  // point helper along a direction: u along ang, v perpendicular (v < 0 = the 'front' side for a raised left-facing weapon)
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function haft(c, p, len, ang, col, w, back) { var q = dirQ(p, ang), d = 'M' + pt(q(-(back == null ? 10 : back), 0)) + 'L' + pt(q(len, 0)); return limb(d, col || '#6a4428', w || 3.4) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }
  // knobbly wooden club
  function club(c, p, len, ang, w, col) {
    var q = dirQ(p, ang); col = col || '#8a5a36';
    var d = pd([q(-8, -2.6), q(len * 0.55, -w * 0.55), q(len * 0.85, -w), q(len + w * 0.6, -w * 0.4), q(len + w * 0.6, w * 0.4), q(len * 0.85, w), q(len * 0.55, w * 0.55), q(-8, 2.6)], true);
    return body(c, d, col, C(q(len * 0.7, -w * 0.4)[0], q(len * 0.7, -w * 0.4)[1], 1.8, dk(col, 0.35)) + C(q(len * 0.9, w * 0.3)[0], q(len * 0.9, w * 0.3)[1], 1.6, dk(col, 0.35)) + L('M' + pt(q(len * 0.2, -1.5)) + 'L' + pt(q(len * 0.8, -w * 0.6)), lt(col, 0.3), 1, 0.7), 1.8) +
      L('M' + pt(q(-2, -3)) + 'L' + pt(q(0, 3)) + 'M' + pt(q(3, -3)) + 'L' + pt(q(5, 3)), '#3a2a1a', 1.4);
  }
  // magic handful: swirling flame/energy over a palm
  function handFire(c, p, col, core, s) {
    s = s || 1;
    return C(p[0], p[1] - 6 * s, 16 * s, glow(c, col, 0.8)) + flame(c, p[0], p[1] - 1 * s, 0.85 * s, col, core || lt(col, 0.6)) + C(p[0] - 7 * s, p[1] - 14 * s, 1.6 * s, lt(col, 0.5), 0, 0.9) + C(p[0] + 6 * s, p[1] - 18 * s, 1.2 * s, lt(col, 0.5), 0, 0.8);
  }
  function swirl(c, x, y, r, col) {
    var d = 'M' + pt([x - r, y]) + 'C' + pt([x - r, y - r * 1.2]) + ' ' + pt([x + r, y - r * 1.2]) + ' ' + pt([x + r * 0.9, y - r * 0.1]) + 'C' + pt([x + r * 0.8, y + r * 0.8]) + ' ' + pt([x - r * 0.5, y + r * 0.9]) + ' ' + pt([x - r * 0.4, y + r * 0.1]) + 'C' + pt([x - r * 0.3, y - r * 0.5]) + ' ' + pt([x + r * 0.4, y - r * 0.4]) + ' ' + pt([x + r * 0.3, y + r * 0.1]);
    return L(d, OL, 4.4, 0.8) + L(d, col, 2.4) + L(d, '#ffffff', 0.8, 0.7);
  }
  // prison rags: torn hem (a zig-zag bottom edge) as a path helper
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  // ---- ogre (one head, huge fists, prison rags; facing left) ----
  function ogreHead(c, x, y, o) {
    var sk = o.skin, s = '';
    s += E(x + 13, y + 1, 4, 5.4, c.cel(sk), 1.8) + E(x + 13, y + 1, 1.6, 2.6, dk(sk, 0.35));
    var d = 'M' + pt([x - 13, y - 6]) + 'C' + pt([x - 13, y - 19]) + ' ' + pt([x + 12, y - 21]) + ' ' + pt([x + 14, y - 6]) + 'L' + pt([x + 14, y + 10]) + 'C' + pt([x + 10, y + 20]) + ' ' + pt([x - 8, y + 21]) + ' ' + pt([x - 17, y + 14]) + 'L' + pt([x - 17, y + 4]) + 'L' + pt([x - 14, y + 1]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 4, y - 22], [x + 18, y - 22], [x + 18, y + 22], [x + 2, y + 22]], true), dk(sk, 0.25), 0.8) + E(x - 2, y - 14, 4, 2, dk(sk, 0.2), 0, 0.6) + (o.scar ? L('M' + pt([x + 2, y - 16]) + 'L' + pt([x + 8, y - 4]), lt(sk, 0.4), 1.4) : ''), 2.2);
    // heavy brow, small angry eyes, flat nose
    s += P('M' + pt([x - 16, y - 5]) + 'C' + pt([x - 12, y - 10]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 3, y - 7]) + 'L' + pt([x + 2, y - 4]) + 'C' + pt([x - 4, y - 6]) + ' ' + pt([x - 11, y - 5]) + ' ' + pt([x - 16, y - 2]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    s += C(x - 8, y - 2, 1.8, '#ffcc30', 1) + C(x - 1, y - 2, 1.5, '#ffcc30', 1);
    s += E(x - 16, y + 3, 3.6, 2.8, c.cel(dk(sk, 0.08)), 1.4) + C(x - 17.5, y + 3.6, 0.8, OL);
    // underbite with tusks
    s += P('M' + pt([x - 17, y + 10]) + 'C' + pt([x - 12, y + 14]) + ' ' + pt([x - 2, y + 14]) + ' ' + pt([x + 4, y + 11]) + 'L' + pt([x + 3, y + 16]) + 'C' + pt([x - 4, y + 20]) + ' ' + pt([x - 12, y + 19]) + ' ' + pt([x - 17, y + 14]) + 'Z', c.cel(lt(sk, 0.05)), 1.6);
    s += P(pd([[x - 14, y + 11], [x - 15, y + 3], [x - 11, y + 10]], true), '#f4ecd6', 1.2) + P(pd([[x - 3, y + 12], [x - 3, y + 5], [x + 1, y + 11]], true), '#f4ecd6', 1.2);
    s += P('M' + pt([x - 4, y - 18]) + 'C' + pt([x - 2, y - 24]) + ' ' + pt([x + 4, y - 24]) + ' ' + pt([x + 6, y - 18]) + 'Z', c.cel('#3a2a1e'), 1.2);
    return s;
  }
  function bigFist(c, p, skin, r) { r = r || 8; return C(p[0], p[1], r, c.cel(skin), 2.2) + L('M' + pt([p[0] - r * 0.7, p[1] - r * 0.3]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1) + ' M' + pt([p[0] - r * 0.75, p[1] + r * 0.2]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1), dk(skin, 0.4), 1.2); }
  // ---- tarantula (big hairy brown spider, facing left) ----
  function tarantulaArt(c, o) {
    var col = o.col || '#6a4a30', band = o.band || lt(col, 0.4), hair = lt(col, 0.3), s = '', legN = o.leg || col, legF = dk(legN, 0.25);
    s += shadow(c, 64, 56);
    var hairs = function (l, w) { var d = ''; for (var t = 0.15; t < 1; t += 0.14) { var a = l[1], b = l[2], x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; d += 'M' + pt([x - w, y]) + 'l' + n(-w) + ',-2 M' + pt([x + w, y]) + 'l' + n(w) + ',-2'; } return d; };
    var farL = [[[44, 84], [26, 60], [14, 116]], [[50, 84], [42, 60], [40, 118]], [[58, 84], [80, 58], [92, 118]], [[60, 82], [104, 56], [122, 114]]];
    farL.forEach(function (l) { s += limb(pd(l), legF, 4) + L(hairs(l, 2.6), dk(legF, 0.3), 1, 0.9) + C(l[1][0], l[1][1], 3, c.cel(dk(band, 0.35)), 1.1); });
    var ab = 'M58,76 C58,56 80,46 98,50 C118,56 124,74 118,92 C112,104 92,106 78,102 C64,98 58,88 58,76 Z', fz = '', r = rng(7);
    for (var i = 0; i < 40; i++) { var x = 62 + r() * 56, y = 54 + r() * 46; fz += 'M' + pt([x, y]) + 'l' + n(r() * 3 - 1.5) + ',' + n(-2 - r() * 2); }
    s += body(c, ab, col, L(fz, hair, 1.1, 0.8) + F('M60,94 C80,108 106,106 122,92 L124,110 L58,110 Z', dk(col, 0.35), 0.85) + L('M72,62 Q90,56 108,62 M66,76 Q90,68 118,76 M68,90 Q92,84 116,90', dk(col, 0.35), 2, 0.8) + E(84, 60, 10, 4, lt(col, 0.22), 0, 0.6), 2.4);
    var ce = 'M34,84 C34,70 48,66 58,70 C68,74 68,90 60,96 C48,102 34,98 34,84 Z';
    s += body(c, ce, dk(col, 0.05), F('M32,92 C44,100 58,100 68,92 L68,106 L32,106 Z', dk(col, 0.35), 0.8) + L('M40,76 l-1,-3 M46,72 l0,-3 M54,72 l1,-3 M60,76 l2,-3', hair, 1.1) + E(50, 76, 7, 3, lt(col, 0.22), 0, 0.6), 2.2);
    var nearL = [[[46, 94], [16, 70], [2, 120]], [[50, 96], [32, 72], [24, 122]], [[56, 96], [70, 70], [76, 122]], [[62, 94], [96, 66], [110, 120]]];
    nearL.forEach(function (l) { var kb = [l[1][0] + (l[2][0] - l[1][0]) * 0.12, l[1][1] + (l[2][1] - l[1][1]) * 0.12], ke = [l[1][0] + (l[2][0] - l[1][0]) * 0.26, l[1][1] + (l[2][1] - l[1][1]) * 0.26]; s += limb(pd(l), legN, 5) + L(hairs(l, 3), dk(col, 0.3), 1.1) + L(pd([l[1], l[2]]), lt(col, 0.3), 1.4, 0.6) + L(pd([kb, ke]), band, 4.4) + C(l[1][0], l[1][1], 3.6, c.cel(band), 1.2); });
    // head + pedipalps + fangs
    s += limb('M34,94 L24,98 L22,106', dk(col, 0.1), 4) + limb('M40,96 L32,104 L32,110', dk(col, 0.1), 4);
    s += E(36, 88, 9, 8, c.cel(dk(col, 0.1)), 2) + E(34, 84, 3.4, 2, lt(col, 0.25), 0, 0.6);
    s += glowEye(c, 31, 85, 1.6, o.eye || '#ffb030') + glowEye(c, 37, 82, 1.3, o.eye || '#ffb030') + C(35, 88, 1, OL) + C(29, 89, 0.9, OL);
    s += P('M28,94 C24,98 25,104 29,106 C29,102 31,98 33,96 Z', '#2a1a12', 1.3) + P('M36,96 C34,100 35,105 38,107 C38,103 39,100 40,98 Z', '#2a1a12', 1.3);
    return G(s, at(o.scale || 1, 64, 122));
  }


  // ============================================================
  //  DUSKWOOD PIECES
  // ============================================================
  var INK = '#1a1c28', RIM = '#9cb0e4', FOG = '#a4ccc8', LAMP = '#ffac44', LAMPL = '#ffe2a0';
  var STN = '#7a849c', STN2 = '#565e76', DG = '#33453f', DG2 = '#1a2624', DIRTD = '#4e4538', MOSS = '#4a6a4c';
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  // smooth path through points (quadratic curves through the midpoints)
  function sm(a, close) {
    var d, i;
    if (close) {
      d = 'M' + pt(mid(a[a.length - 1], a[0]));
      for (i = 0; i < a.length; i++) d += 'Q' + pt(a[i]) + ' ' + pt(mid(a[i], a[(i + 1) % a.length]));
      return d + 'Z';
    }
    d = 'M' + pt(a[0]);
    for (i = 1; i < a.length - 1; i++) d += 'Q' + pt(a[i]) + ' ' + pt(i === a.length - 2 ? a[a.length - 1] : mid(a[i], a[i + 1]));
    if (a.length === 2) d += 'L' + pt(a[1]);
    return d;
  }
  function ring(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(2 * rx) + ',0a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(-2 * rx) + ',0'; }
  // night sky: deep blue-violet with a star field
  function dwSky(c, seed, top, midc, bot) {
    var o = sky(c, top || '#0e1132', midc || '#272b5e', bot || '#4a5486');
    var r = rng(seed || 7), st = '';
    for (var i = 0; i < 48; i++) { var x = r() * 400, y = r() * 118, rr = 0.4 + r() * 0.8; st += ring(x, y, rr, rr); }
    return o + F(st, '#e8ecff', 0.7);
  }
  // the huge pale moon with a cold halo
  function moon(c, x, y, r) {
    var o = C(x, y, r * 3.6, glow(c, '#b0c4ff', 0.4)) + C(x, y, r * 1.7, glow(c, '#e4ecff', 0.45));
    o += C(x, y, r, c.lg([[0, '#fcfcf2'], [0.55, '#eceee0'], [1, '#c8ccc6']], 0.2, 0, 0.8, 1));
    o += E(x - r * 0.3, y - r * 0.18, r * 0.22, r * 0.18, '#cdd0c4', 0, 0.8) + E(x + r * 0.26, y + r * 0.32, r * 0.3, r * 0.2, '#d2d4c8', 0, 0.75) +
      E(x + r * 0.42, y - r * 0.36, r * 0.12, r * 0.1, '#c8ccc0', 0, 0.8) + E(x - r * 0.46, y + r * 0.42, r * 0.14, r * 0.1, '#ccd0c4', 0, 0.7) +
      F('M' + pt([x + r * 0.2, y - r * 0.98]) + 'A' + n(r) + ',' + n(r) + ' 0 0,1 ' + pt([x - r * 0.6, y + r * 0.8]) + 'A' + n(r * 1.1) + ',' + n(r * 1.1) + ' 0 0,0 ' + pt([x + r * 0.2, y - r * 0.98]) + 'Z', '#b8bcc4', 0.35);
    return o;
  }
  function wisp(x, y, w, col, op) {
    return F('M' + pt([x - w, y]) + 'Q' + pt([x - w * 0.4, y - 5]) + ' ' + pt([x, y - 3]) + 'Q' + pt([x + w * 0.5, y - 6]) + ' ' + pt([x + w, y]) + 'Q' + pt([x, y + 3]) + ' ' + pt([x - w, y]) + 'Z', col || '#2a2c5c', op == null ? 0.75 : op);
  }
  // distant forest band: rounded crowns with the odd bare snag
  function farWoods(seed, base, amp, col, step) {
    var r = rng(seed), x = -20, d = 'M-20,250 L-20,' + n(base);
    step = step || 16;
    while (x < 420) {
      var w = step * (0.6 + 0.8 * r()), h = amp * (0.4 + 0.6 * r());
      if (r() < 0.22) d += 'L' + pt([x + w * 0.42, base - h * 0.3]) + 'L' + pt([x + w * 0.3, base - h * 1.25]) + 'L' + pt([x + w * 0.5, base - h * 0.8]) + 'L' + pt([x + w * 0.66, base - h * 1.15]) + 'L' + pt([x + w * 0.6, base - h * 0.3]) + 'L' + pt([x + w, base - h * 0.25]);
      else d += 'Q' + pt([x + w * 0.05, base - h]) + ' ' + pt([x + w * 0.5, base - h]) + 'Q' + pt([x + w * 0.95, base - h]) + ' ' + pt([x + w, base - h * 0.3]);
      x += w;
    }
    return F(d + 'L' + pt([x, 250]) + 'Z', col);
  }
  // a dark leaf clump with a moonlit top edge
  function clump(c, x, y, r, col, seed) {
    var rr = rng(seed || 3), a = [];
    for (var i = 0; i < 16; i++) { var t = i / 16 * 2 * PI, k = r * (i % 2 ? 0.72 : 0.95 + rr() * 0.3); a.push([x + Math.cos(t) * k * 1.3, y + Math.sin(t) * k * 0.82]); }
    return P(sm(a, true), c.lg([[0, lt(col || '#1a262c', 0.12)], [0.5, col || '#1a262c'], [1, dk(col || '#1a262c', 0.3)]]), 1.6) + L('M' + pt([x - r * 1.0, y - r * 0.3]) + 'Q' + pt([x - r * 0.4, y - r * 0.95]) + ' ' + pt([x + r * 0.5, y - r * 0.7]), RIM, 1, 0.45);
  }
  // black twisted tree: gnarled trunk, flared roots, clawing branches, cold rim light
  function gnarl(c, x, y, s, o) {
    o = o || {};
    var col = o.col || INK, f = o.flip ? -1 : 1, out = '', rim = o.rim || RIM;
    var q = function (dx, dy) { return [x + dx * s * f, y - dy * s]; };
    var line = function (a) { return 'M' + a.map(function (p) { return pt(q(p[0], p[1])); }).join('L'); };
    out += E(x, y + 2 * s, 30 * s, 4 * s, '#000', 0, 0.3);
    var br = o.branches || [
      [[0, 76], [14, 92], [30, 97], [44, 114]], [[16, 93], [18, 110], [12, 120]], [[30, 97], [46, 94], [54, 98]],
      [[-2, 72], [-14, 88], [-30, 92], [-46, 104]], [[-22, 90], [-26, 108], [-20, 116]], [[-32, 93], [-48, 86]],
      [[2, 82], [-2, 104], [6, 126]], [[4, 54], [20, 62], [34, 58], [44, 66]], [[-6, 46], [-20, 52], [-30, 46]]
    ];
    br.forEach(function (b, i) {
      var d = line(b), w = (i % 3 === 0 ? 4.2 : 2.6) * s;
      out += L(d, OL, w + 3.4 * s) + L(d, col, w) + L(line(b.map(function (p) { return [p[0] - 0.9 * f, p[1] + 0.9]; })), rim, 0.9 * s, 0.5);
    });
    if (o.leaves) (o.leaves === true ? [[44, 114, 12], [-46, 104, 13], [6, 126, 11], [54, 98, 9], [-20, 116, 9], [44, 66, 9]] : o.leaves).forEach(function (l, i) { var p = q(l[0], l[1]); out += clump(c, p[0], p[1], l[2] * s, o.leafCol, i + 3); });
    var tr = sm([q(-22, 0), q(-9, 6), q(-7, 18), q(-11, 32), q(-7, 46), q(-2, 60), q(-6, 72), q(-3, 84), q(4, 86), q(5, 72), q(2, 60), q(8, 46), q(10, 32), q(7, 18), q(10, 6), q(24, 0), q(10, 1), q(2, -1), q(-8, 1)], true);
    var bark = L('M' + pt(q(-5, 8)) + 'C' + pt(q(4, 20)) + ' ' + pt(q(-6, 34)) + ' ' + pt(q(3, 48)) + 'M' + pt(q(2, 56)) + 'C' + pt(q(-4, 64)) + ' ' + pt(q(2, 72)) + ' ' + pt(q(-1, 80)), dk(col, 0.5), 1.4 * s, 0.9) +
      F(sm([q(2, -2), q(12, 4), q(8, 20), q(10, 34), q(6, 48), q(4, 62), q(3, 84), q(12, 84), q(14, -2)], true), dk(col, 0.45), 0.8) + E(q(-2, 38)[0], q(-2, 38)[1], 2.6 * s, 4 * s, '#07080c', 0, 0.9);
    out += body(c, tr, col, bark, 2 * s);
    out += L(sm([q(-20, 1), q(-9, 6), q(-7, 18), q(-11, 32), q(-7, 46), q(-2, 60), q(-6, 72), q(-3, 84)]), rim, 1.2 * s, 0.7);
    if (o.claws) out += claws(q(-2, o.claws === true ? 30 : o.claws)[0], q(0, o.claws === true ? 30 : o.claws)[1], 0.9 * s);
    return out;
  }
  // three raking worgen claw marks gouged into wood (pale inside, dark edge)
  function claws(x, y, s) {
    var d = '';
    for (var i = 0; i < 3; i++) d += 'M' + pt([x - 5 * s + i * 3.4 * s, y - 8 * s]) + 'Q' + pt([x - 3 * s + i * 3.4 * s, y]) + ' ' + pt([x - 5.5 * s + i * 3.4 * s, y + 9 * s]);
    return L(d, '#07080c', 2.6 * s) + L(d, '#c8b08a', 1.2 * s);
  }
  // cold ground fog: soft rolling band, densest near its top edge
  function fogBand(c, y, h, seed, op, col) {
    col = col || FOG;
    var r = rng(seed || 3), d = 'M-10,' + n(y + h) + 'L-10,' + n(y), x = -10;
    while (x < 410) { var w = 30 + r() * 40; d += 'Q' + pt([x + w / 2, y - 5 - r() * 9]) + ' ' + pt([x + w, y + (r() - 0.5) * 4]); x += w; }
    d += 'L410,' + n(y + h) + 'Z';
    var a = op == null ? 0.34 : op;
    return F(d, c.lg([[0, col, a * 0.7], [0.3, col, a], [1, col, 0]]));
  }
  function nightGround(c, y, top, bot) { return ground(c, y, top || DG, bot || DG2); }
  // moonlight wash + dark vignette
  function night(c, mx) {
    return R(0, 0, 400, 240, c.lg([[0, '#8aa0ff', mx < 200 ? 0.1 : 0], [1, '#8aa0ff', mx < 200 ? 0 : 0.1]], 0, 0, 1, 0)) +
      R(0, 0, 400, 240, c.lg([[0, '#000010', 0.1], [0.45, '#000010', 0], [1, '#02030a', 0.34]]));
  }
  // tombstone: 'round' | 'cross' | 'slab' | 'obelisk'
  function tomb(c, x, y, s, kind, tilt, col) {
    col = col || STN;
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, d;
    if (kind === 'cross') d = pd([q(-2.6, 1), q(-2.6, -17), q(-8, -17), q(-8, -22), q(-2.6, -22), q(-2.6, -29), q(2.6, -29), q(2.6, -22), q(8, -22), q(8, -17), q(2.6, -17), q(2.6, 1)], true);
    else if (kind === 'slab') d = pd([q(-8, 1), q(-8, -15), q(-6, -18), q(6, -18), q(8, -15), q(8, 1)], true);
    else if (kind === 'obelisk') d = pd([q(-6, 1), q(-5, -26), q(0, -34), q(5, -26), q(6, 1)], true);
    else d = 'M' + pt(q(-7, 1)) + 'L' + pt(q(-7, -13)) + 'C' + pt(q(-7, -23)) + ' ' + pt(q(7, -23)) + ' ' + pt(q(7, -13)) + 'L' + pt(q(7, 1)) + 'Z';
    var sh = F(pd([q(1.5, -36), q(10, -36), q(10, 3), q(1.5, 3)], true), dk(col, 0.35), 0.8) + L('M' + pt(q(-3, -12)) + 'l' + n(2 * s) + ',' + n(4 * s) + 'l' + n(-1 * s) + ',' + n(4 * s), dk(col, 0.45), 0.9 * s) + E(x - 2 * s, y, 7 * s, 2.6 * s, MOSS, 0, 0.85);
    if (kind !== 'cross') sh += L('M' + pt(q(-4, -8)) + 'L' + pt(q(3, -8)) + 'M' + pt(q(-4, -5)) + 'L' + pt(q(2, -5)), dk(col, 0.3), 0.8 * s, 0.7);
    var g = body(c, d, col, sh, 1.6 * Math.max(0.7, s)) + L('M' + pt(q(kind === 'cross' ? -2 : -6.2, -1)) + 'L' + pt(q(kind === 'cross' ? -2 : -6.2, kind === 'obelisk' ? -24 : -13)), RIM, 1 * s, 0.6);
    return E(x, y + 1.5 * s, 11 * s, 2.6 * s, '#000', 0, 0.3) + G(g, tilt ? rot(tilt, x, y) : '');
  }
  function tombs(c, list) { return list.map(function (t) { return tomb(c, t[0], t[1], t[2], t[3], t[4], t[5]); }).join(''); }
  // stone crypt with a pediment and an ajar door leaking cold light
  function crypt(c, x, y, s, glowCol) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2 * s, 44 * s, 5 * s, '#000', 0, 0.35);
    o += P(pd([q(-31, 1), q(-31, -5), q(31, -5), q(31, 1)], true), c.cel(STN2), 1.6 * s);
    var joints = '';
    for (var j = 1; j < 5; j++) { var jy = -5 - j * 7; joints += 'M' + pt(q(-26, jy)) + 'L' + pt(q(26, jy)); for (var k = -3; k <= 3; k++) joints += 'M' + pt(q(k * 8 + (j % 2 ? 4 : 0), jy)) + 'l0,' + n(7 * s); }
    o += body(c, pd([q(-26, -5), q(-26, -40), q(26, -40), q(26, -5)], true), STN, L(joints, dk(STN, 0.3), 0.8 * s, 0.7) + F(pd([q(8, -42), q(28, -42), q(28, -3), q(8, -3)], true), dk(STN, 0.35), 0.75) + E(q(-18, -8)[0], q(-18, -8)[1], 9 * s, 4 * s, MOSS, 0, 0.8), 2 * s);
    o += body(c, pd([q(-32, -39), q(0, -60), q(32, -39)], true), lt(STN, 0.06), F(pd([q(0, -62), q(34, -38), q(0, -38)], true), dk(STN, 0.3), 0.8), 2 * s);
    o += P(pd([q(-34, -36), q(34, -36), q(34, -41), q(-34, -41)], true), c.cel(STN2), 1.6 * s);
    [-20, 20].forEach(function (cx) { o += body(c, pd([q(cx - 4, -5), q(cx - 4, -36), q(cx + 4, -36), q(cx + 4, -5)], true), lt(STN, 0.12), L('M' + pt(q(cx, -34)) + 'L' + pt(q(cx, -7)), dk(STN, 0.25), 1 * s), 1.6 * s); });
    var door = 'M' + pt(q(-10, -5)) + 'L' + pt(q(-10, -22)) + 'Q' + pt(q(0, -34)) + ' ' + pt(q(10, -22)) + 'L' + pt(q(10, -5)) + 'Z';
    o += P(door, '#07080c', 1.8 * s) + C(x - 2 * s, y - 14 * s, 18 * s, glow(c, glowCol || '#6ae0b0', 0.4)) + P(pd([q(3, -5), q(10, -5), q(10, -22), q(5, -27)], true), c.cel('#3a3c44'), 1.2 * s);
    o += skull(c, x, y - 53 * s, 0.6 * s);
    o += L('M' + pt(q(-32, -39)) + 'L' + pt(q(0, -60)) + 'M' + pt(q(-26, -35)) + 'L' + pt(q(-26, -6)), RIM, 1.2 * s, 0.7);
    return o;
  }
  // perched raven (f = 1 faces left, -1 faces right)
  function raven(x, y, s, f) {
    f = f || 1;
    var q = function (dx, dy) { return pt([x + dx * s * f, y + dy * s]); };
    var d = 'M' + q(-8, -9) + 'L' + q(-13, -8) + 'L' + q(-8, -7) + 'C' + q(-8, -3) + ' ' + q(-5, 0) + ' ' + q(0, 1) + 'L' + q(10, 7) + 'L' + q(11, 4) + 'L' + q(6, -1) + 'C' + q(5, -5) + ' ' + q(1, -7) + ' ' + q(-3, -7) + 'C' + q(-3, -11) + ' ' + q(-7, -12) + ' ' + q(-8, -9) + 'Z';
    return L('M' + q(-2, 0) + 'L' + q(-3, 3) + 'M' + q(1, 1) + 'L' + q(1, 3), '#0a0a10', 1 * s) + F(d, '#0a0a12') +
      L('M' + q(-8, -10) + 'C' + q(-6, -12) + ' ' + q(-3, -10) + ' ' + q(-3, -7) + 'C' + q(1, -7) + ' ' + q(5, -5) + ' ' + q(6, -1), RIM, 0.8 * s, 0.75) + C(x - 6.5 * s * f, y - 9 * s, 0.8 * s, '#e0e8ff');
  }
  function flyRaven(x, y, s) {
    var d = 'M' + pt([x - 12 * s, y - 4 * s]) + 'Q' + pt([x - 6 * s, y - 7 * s]) + ' ' + pt([x - 1 * s, y]) + 'Q' + pt([x + 5 * s, y - 8 * s]) + ' ' + pt([x + 12 * s, y - 5 * s]) + 'Q' + pt([x + 5 * s, y - 3 * s]) + ' ' + pt([x + 1 * s, y + 3 * s]) + 'L' + pt([x - 1 * s, y + 3 * s]) + 'Q' + pt([x - 5 * s, y - 2 * s]) + ' ' + pt([x - 12 * s, y - 4 * s]) + 'Z';
    return F(d, '#0a0a14');
  }
  // spider web: spokes + sagging spiral rings, optional anchor threads to points
  function web(cx, cy, r, k, seed, anchors) {
    var rr = rng(seed || 5), sp = [], d = '', i;
    for (i = 0; i < k; i++) { var a = i / k * 2 * PI + rr() * 0.25, l = r * (0.8 + rr() * 0.35); sp.push([cx + Math.cos(a) * l, cy + Math.sin(a) * l * 0.9]); d += 'M' + pt([cx, cy]) + 'L' + pt(sp[i]); }
    for (var g = 1; g <= 6; g++) {
      var t = g / 6.3;
      for (i = 0; i < k; i++) {
        var p0 = sp[i], p1 = sp[(i + 1) % k], a0 = [cx + (p0[0] - cx) * t, cy + (p0[1] - cy) * t], a1 = [cx + (p1[0] - cx) * t, cy + (p1[1] - cy) * t];
        d += 'M' + pt(a0) + 'Q' + pt([mid(a0, a1)[0] * 0.88 + cx * 0.12, mid(a0, a1)[1] * 0.88 + cy * 0.12]) + ' ' + pt(a1);
      }
    }
    (anchors || []).forEach(function (a) { var near = sp[0], best = 1e9; sp.forEach(function (p) { var dd = (p[0] - a[0]) * (p[0] - a[0]) + (p[1] - a[1]) * (p[1] - a[1]); if (dd < best) { best = dd; near = p; } }); d += 'M' + pt(near) + 'L' + pt(a); });
    return L(d, '#06070c', 1.8, 0.4) + L(d, '#e4ecf6', 0.8, 0.8);
  }
  // silk-wrapped victim hanging on a thread
  function cocoon(c, x, y, s, len) {
    var top = y - (len || 20) * s, o = L('M' + pt([x, top]) + 'L' + pt([x, y - 10 * s]), '#dfe6f0', 0.8, 0.8);
    var d = 'M' + pt([x, y - 11 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x - 6 * s, y + 8 * s]) + ' ' + pt([x, y + 11 * s]) + 'C' + pt([x + 6 * s, y + 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x, y - 11 * s]) + 'Z';
    return o + body(c, d, '#d8dce0', L('M' + pt([x - 5 * s, y - 5 * s]) + 'L' + pt([x + 5 * s, y - 2 * s]) + 'M' + pt([x - 6 * s, y + 1 * s]) + 'L' + pt([x + 6 * s, y + 4 * s]) + 'M' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x + 4 * s, y + 8 * s]), '#9aa0aa', 1 * s) + F(pd([[x + 1 * s, y - 12 * s], [x + 8 * s, y - 12 * s], [x + 8 * s, y + 12 * s], [x + 1 * s, y + 12 * s]], true), '#8a909c', 0.6), 1.4 * s);
  }
  // open grave: dirt pile, dark pit, shovel
  function grave(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = '';
    o += body(c, 'M' + pt(q(-4, -4)) + 'C' + pt(q(0, -16)) + ' ' + pt(q(22, -20)) + ' ' + pt(q(32, -8)) + 'L' + pt(q(36, -3)) + 'Z', DIRTD, F(pd([q(16, -22), q(40, -22), q(40, 0), q(20, 0)], true), dk(DIRTD, 0.35), 0.8) + pebbles(3, y - 12 * s, y - 5 * s, dk(DIRTD, 0.4), 5, x + 4 * s, x + 30 * s), 1.6 * s);
    o += haft(c, q(14, -12), 26 * s, -1.2, '#6a4a30', 2.6) + P(pd([q(21, -35), q(27, -38), q(30, -30), q(25, -27)], true), c.cel('#8a8e96'), 1.2);
    o += P(pd([q(-22, -6), q(20, -6), q(27, 9), q(-29, 9)], true), '#050608', 1.8 * s) + F(pd([q(-21, -5), q(19, -5), q(18, 2), q(-21, 2)], true), dk(DIRTD, 0.3), 0.95) + L('M' + pt(q(-18, 0)) + 'l' + n(4 * s) + ',' + n(1 * s) + 'M' + pt(q(4, -1)) + 'l' + n(5 * s) + ',0', dk(DIRTD, 0.5), 1 * s);
    o += F(pd([q(-31, 9), q(29, 9), q(27, 13), q(-29, 12)], true), dk(DIRTD, 0.1), 0.9);
    return o;
  }
  function wheel(c, x, y, r, col, broken, ry) {
    ry = ry || r; col = col || '#6a4a30';
    var sp = '';
    for (var i = 0; i < 8; i++) { if (broken && (i === 1 || i === 2 || i === 5)) continue; var a = i * PI / 4; sp += 'M' + pt([x, y]) + 'L' + pt([x + Math.cos(a) * r, y + Math.sin(a) * ry]); }
    var rg = ring(x, y, r, ry);
    return L(sp, OL, 4.2) + L(sp, lt(col, 0.12), 1.8) + L(rg, OL, 6) + L(rg, col, 3.2) + L(rg, lt(col, 0.3), 0.8, 0.6) + E(x, y, r * 0.2, ry * 0.2, c.cel('#4a4a50'), 1.2);
  }
  // wrecked wagon: bed tipped onto the ground, one wheel off, spilled cargo, claw marks
  function wagon(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2 * s, 50 * s, 6 * s, '#000', 0, 0.3), wd = '#6e5034';
    o += wheel(c, q(26, -16)[0], q(26, -16)[1], 15 * s, dk(wd, 0.1));
    var bed = pd([q(-44, 0), q(-42, -16), q(32, -38), q(36, -24)], true);
    var planks = 'M' + pt(q(-43, -5)) + 'L' + pt(q(34, -29)) + 'M' + pt(q(-42, -10)) + 'L' + pt(q(33, -33));
    o += body(c, bed, wd, L(planks, dk(wd, 0.4), 1.2 * s) + F(pd([q(-44, 0), q(36, -24), q(36, -20), q(-44, 4)], true), dk(wd, 0.35), 0.8) + claws(q(-6, -16)[0], q(-6, -16)[1], 0.8 * s), 1.8 * s);
    o += P(pd([q(-42, -16), q(-38, -28), q(-30, -30), q(-26, -26), q(-18, -34), q(-8, -30), q(4, -38), q(10, -36), q(20, -44), q(32, -38)], true), c.cel(lt(wd, 0.06)), 1.6 * s);
    o += limb('M' + pt(q(-46, -2)) + 'L' + pt(q(-74, 2)), wd, 3.2 * s) + limb('M' + pt(q(-74, 2)) + 'L' + pt(q(-82, 0)), dk(wd, 0.1), 2.6 * s);
    o += wheel(c, q(56, 2)[0], q(56, 2)[1], 15 * s, wd, true, 5 * s);
    o += crate(c, q(-58, 4)[0], q(-58, 4)[1], 0.9 * s, '#7a5a3a') + sack(c, q(-30, 6)[0], q(-30, 6)[1], 0.9 * s, '#8a7a5e') + barrel(c, q(12, 6)[0], q(12, 6)[1], 0.8 * s, '#5a4a36');
    return o;
  }
  // iron lamp post with a warm lantern and a pool of light on the ground
  function lampPost(c, x, y, h, s) {
    var top = y - h;
    var o = E(x, y + 1, 34 * s, 8 * s, glow(c, LAMP, 0.45)) + C(x, top + 4 * s, 40 * s, glow(c, LAMP, 0.45)) + E(x, y + 1, 7 * s, 1.8 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top + 10 * s]), '#262830', 2.4 * s) + P(pd([[x - 4 * s, y + 1], [x - 3 * s, y - 6 * s], [x + 3 * s, y - 6 * s], [x + 4 * s, y + 1]], true), '#2a2c34', 1.2 * s);
    o += P(pd([[x - 5 * s, top + 10 * s], [x - 6.5 * s, top], [x + 6.5 * s, top], [x + 5 * s, top + 10 * s]], true), LAMPL, 1.4 * s) + L('M' + pt([x, top]) + 'L' + pt([x, top + 10 * s]), '#262830', 1 * s) +
      P(pd([[x - 9 * s, top + 1 * s], [x, top - 6 * s], [x + 9 * s, top + 1 * s]], true), '#2a2c34', 1.4 * s) + C(x, top - 7 * s, 1.5 * s, '#2a2c34') + C(x, top + 5 * s, 3 * s, '#fff4d0', 0, 0.9);
    return o;
  }
  function litWin(c, x, y, w, h, s, arch) {
    var d = arch ? 'M' + pt([x, y + h]) + 'L' + pt([x, y + w / 2]) + 'Q' + pt([x + w / 2, y - w * 0.3]) + ' ' + pt([x + w, y + w / 2]) + 'L' + pt([x + w, y + h]) + 'Z' : pd([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    return C(x + w / 2, y + h / 2, (w + h) * 0.9, glow(c, LAMP, 0.4)) + P(d, c.lg([[0, '#ffe8a0'], [1, '#ffa840']]), 1.4 * s) + L('M' + pt([x + w / 2, y + (arch ? w * 0.1 : 0)]) + 'L' + pt([x + w / 2, y + h]) + 'M' + pt([x, y + h * 0.5]) + 'L' + pt([x + w, y + h * 0.5]), BEAM, 1 * s);
  }
  // Lanternby clock tower: stone shaft, timber belfry, slate spire, pale lit clock face
  function clockTower(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.3);
    var joints = '';
    for (var j = 1; j < 12; j++) { var jy = -j * 8; joints += 'M' + pt(q(-16, jy)) + 'L' + pt(q(16, jy)); for (var k = -1; k <= 1; k++) joints += 'M' + pt(q(k * 10 + (j % 2 ? 5 : 0), jy)) + 'l0,' + n(8 * s); }
    o += body(c, pd([q(-17, 0), q(-14, -100), q(14, -100), q(17, 0)], true), '#6e7488', L(joints, '#4a4e60', 0.8 * s, 0.7) + F(pd([q(4, -102), q(20, -102), q(20, 2), q(5, 2)], true), '#3a3e50', 0.8), 2 * s);
    o += litWin(c, q(-4, -48)[0], q(-4, -48)[1], 8 * s, 12 * s, s, true) + litWin(c, q(-4, -72)[0], q(-4, -72)[1], 8 * s, 10 * s, s, true);
    o += P(pd([q(-7, 0), q(-7, -14), q(7, -14), q(7, 0)], true), c.cel('#4a3424'), 1.6 * s);
    o += body(c, pd([q(-18, -100), q(-18, -122), q(18, -122), q(18, -100)], true), '#8a8070', L('M' + pt(q(-18, -100)) + 'L' + pt(q(18, -100)) + 'M' + pt(q(-18, -122)) + 'L' + pt(q(18, -122)), BEAM, 2.4 * s) + F(pd([q(6, -124), q(20, -124), q(20, -98), q(6, -98)], true), '#4a4440', 0.7), 2 * s);
    o += P('M' + pt(q(-12, -103)) + 'L' + pt(q(-12, -114)) + 'Q' + pt(q(-8, -119)) + ' ' + pt(q(-4, -114)) + 'L' + pt(q(-4, -103)) + 'Z', '#0a0a10', 1.2 * s) + P('M' + pt(q(4, -103)) + 'L' + pt(q(4, -114)) + 'Q' + pt(q(8, -119)) + ' ' + pt(q(12, -114)) + 'L' + pt(q(12, -103)) + 'Z', '#0a0a10', 1.2 * s);
    o += body(c, pd([q(-23, -120), q(-1, -164), q(1, -164), q(23, -120)], true), '#3e3c56', F(pd([q(1, -166), q(25, -118), q(6, -118)], true), '#262438', 0.85) + L('M' + pt(q(-18, -128)) + 'L' + pt(q(18, -128)) + 'M' + pt(q(-13, -138)) + 'L' + pt(q(13, -138)) + 'M' + pt(q(-8, -148)) + 'L' + pt(q(8, -148)), '#2a2840', 1 * s), 2 * s);
    o += L('M' + pt(q(-23, -120)) + 'L' + pt(q(-1, -164)), RIM, 1.2 * s, 0.7) + limb('M' + pt(q(0, -164)) + 'L' + pt(q(0, -174)), '#2a2c34', 1.4 * s);
    var cx = q(0, -88);
    o += C(cx[0], cx[1], 20 * s, glow(c, '#ffe0a0', 0.4)) + C(cx[0], cx[1], 9 * s, c.lg([[0, '#fff4d0'], [1, '#f0c870']]), 1.8 * s);
    for (var t = 0; t < 12; t++) { var a = t * PI / 6; o += C(cx[0] + Math.cos(a) * 7 * s, cx[1] + Math.sin(a) * 7 * s, 0.6 * s, OL); }
    o += L('M' + pt(cx) + 'L' + pt([cx[0], cx[1] - 6 * s]) + 'M' + pt(cx) + 'L' + pt([cx[0] + 4 * s, cx[1] + 2 * s]), OL, 1.3 * s);
    return o;
  }
  // Lanternby town hall: stone ground floor, timber upper, big roof, central gable over lit double doors
  function townHall(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2, 66 * s, 6 * s, '#000', 0, 0.3), stone = '#6e7080', plast = '#a49c8a', roofc = '#4a3446';
    var w = 56, joints = '';
    for (var j = 1; j < 3; j++) { var jy = -j * 9; joints += 'M' + pt(q(-w, jy)) + 'L' + pt(q(w, jy)); for (var k = -5; k <= 5; k++) joints += 'M' + pt(q(k * 11 + (j % 2 ? 5 : 0), jy)) + 'l0,' + n(9 * s); }
    o += body(c, pd([q(-w, 0), q(-w, -26), q(w, -26), q(w, 0)], true), stone, L(joints, dk(stone, 0.3), 0.8 * s, 0.7) + F(pd([q(20, -28), q(w + 2, -28), q(w + 2, 2), q(20, 2)], true), dk(stone, 0.3), 0.7), 2 * s);
    var beams = 'M' + pt(q(-w - 4, -26)) + 'L' + pt(q(w + 4, -26)) + 'M' + pt(q(-w - 4, -50)) + 'L' + pt(q(w + 4, -50));
    for (var b = -4; b <= 4; b++) beams += 'M' + pt(q(b * 14, -26)) + 'L' + pt(q(b * 14, -50));
    o += body(c, pd([q(-w - 4, -26), q(-w - 4, -50), q(w + 4, -50), q(w + 4, -26)], true), plast, F(pd([q(20, -52), q(w + 6, -52), q(w + 6, -24), q(20, -24)], true), dk(plast, 0.3), 0.8) + L(beams, BEAM, 2.4 * s), 2 * s);
    o += body(c, pd([q(-w - 12, -48), q(-w + 14, -84), q(w - 14, -84), q(w + 12, -48)], true), roofc, F(pd([q(10, -86), q(w - 12, -86), q(w + 14, -46), q(18, -46)], true), dk(roofc, 0.3), 0.8) + L('M' + pt(q(-w - 4, -58)) + 'L' + pt(q(w + 4, -58)) + 'M' + pt(q(-w + 4, -70)) + 'L' + pt(q(w - 4, -70)), dk(roofc, 0.35), 1 * s), 2.2 * s);
    o += L('M' + pt(q(-w - 12, -48)) + 'L' + pt(q(-w + 14, -84)) + 'L' + pt(q(w - 14, -84)), RIM, 1.2 * s, 0.6);
    // chimneys
    o += body(c, pd([q(-36, -80), q(-36, -96), q(-28, -96), q(-28, -76)], true), stone, '', 1.6 * s) + smoke(q(-32, -100)[0], q(-32, -100)[1], 0.5 * s, 21, '#5a5e70', 4);
    // central gable
    o += body(c, pd([q(-18, 0), q(-18, -60), q(18, -60), q(18, 0)], true), plast, L('M' + pt(q(-18, -26)) + 'L' + pt(q(18, -26)) + 'M' + pt(q(-18, -60)) + 'L' + pt(q(18, -60)) + 'M' + pt(q(-18, -60)) + 'L' + pt(q(0, -44)) + 'L' + pt(q(18, -60)), BEAM, 2.4 * s), 2 * s);
    o += body(c, pd([q(-24, -58), q(0, -94), q(24, -58)], true), roofc, F(pd([q(0, -96), q(26, -56), q(0, -56)], true), dk(roofc, 0.3), 0.8), 2.2 * s);
    o += L('M' + pt(q(-24, -58)) + 'L' + pt(q(0, -94)), RIM, 1.2 * s, 0.7);
    o += litWin(c, q(-5, -84)[0], q(-5, -84)[1], 10 * s, 10 * s, s, true);
    // doors + windows
    o += C(x, y - 12 * s, 26 * s, glow(c, LAMP, 0.45)) + P('M' + pt(q(-10, 0)) + 'L' + pt(q(-10, -16)) + 'Q' + pt(q(0, -26)) + ' ' + pt(q(10, -16)) + 'L' + pt(q(10, 0)) + 'Z', c.lg([[0, '#ffd070'], [1, '#e08830']]), 1.8 * s) + L('M' + pt(q(0, -22)) + 'L' + pt(q(0, 0)), '#6a4424', 1.6 * s);
    [-44, -30, 30, 44].forEach(function (wx) { o += litWin(c, q(wx - 4, -44)[0], q(wx - 4, -44)[1], 8 * s, 10 * s, s) + litWin(c, q(wx - 4, -20)[0], q(wx - 4, -20)[1], 8 * s, 9 * s, s); });
    o += litWin(c, q(-12, -46)[0], q(-12, -46)[1], 8 * s, 12 * s, s) + litWin(c, q(4, -46)[0], q(4, -46)[1], 8 * s, 12 * s, s);
    o += P(pd([q(-16, 1), q(-16, -3), q(16, -3), q(16, 1)], true), c.cel(stone), 1.2 * s);
    return o;
  }
  // wooden watch post on stilts with a hanging lantern
  function watchPost(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2, 22 * s, 3.4 * s, '#000', 0, 0.3), wd = '#5e4430';
    o += limb('M' + pt(q(-12, 0)) + 'L' + pt(q(-9, -54)) + 'M' + pt(q(12, 0)) + 'L' + pt(q(9, -54)), wd, 3.2 * s) + limb('M' + pt(q(-11, -4)) + 'L' + pt(q(10, -30)) + 'M' + pt(q(11, -4)) + 'L' + pt(q(-10, -30)) + 'M' + pt(q(-10, -30)) + 'L' + pt(q(9, -52)), dk(wd, 0.1), 2 * s);
    o += limb('M' + pt(q(-22, 0)) + 'L' + pt(q(-14, -52)) + 'M' + pt(q(-16, 0)) + 'L' + pt(q(-9, -52)), '#7a5a3a', 1.6 * s) + L('M' + pt(q(-21, -8)) + 'L' + pt(q(-15, -8)) + 'M' + pt(q(-20, -18)) + 'L' + pt(q(-13, -18)) + 'M' + pt(q(-18, -28)) + 'L' + pt(q(-12, -28)) + 'M' + pt(q(-17, -38)) + 'L' + pt(q(-11, -38)), '#7a5a3a', 1.6 * s);
    o += body(c, pd([q(-16, -52), q(-16, -58), q(16, -58), q(16, -52)], true), wd, '', 1.6 * s);
    o += body(c, pd([q(-15, -58), q(-15, -68), q(15, -68), q(15, -58)], true), '#7a5a3a', L('M' + pt(q(-5, -58)) + 'L' + pt(q(-5, -68)) + 'M' + pt(q(5, -58)) + 'L' + pt(q(5, -68)), dk(wd, 0.3), 1.2 * s), 1.6 * s);
    o += limb('M' + pt(q(-13, -68)) + 'L' + pt(q(-13, -80)) + 'M' + pt(q(13, -68)) + 'L' + pt(q(13, -80)), wd, 2 * s);
    o += body(c, pd([q(-20, -78), q(0, -94), q(20, -78)], true), '#4a3446', F(pd([q(0, -96), q(22, -76), q(2, -76)], true), '#2a1e2a', 0.8), 1.8 * s) + L('M' + pt(q(-20, -78)) + 'L' + pt(q(0, -94)), RIM, 1 * s, 0.7);
    o += hangLantern(c, q(0, -76)[0], q(0, -76)[1], 1.1 * s) + C(q(0, -70)[0], q(0, -70)[1], 30 * s, glow(c, LAMP, 0.35));
    return o;
  }
  // earthen ogre mound: grassy dome, cave mouth lit by a fire inside, bones and skulls
  function ogreMound(c, x, y, w, h) {
    var o = E(x, y + 3, w * 0.55, 8, '#000', 0, 0.35), col = '#54483a';
    var d = 'M' + pt([x - w / 2, y + 2]) + 'C' + pt([x - w * 0.46, y - h * 0.7]) + ' ' + pt([x - w * 0.2, y - h]) + ' ' + pt([x + w * 0.02, y - h]) + 'C' + pt([x + w * 0.26, y - h]) + ' ' + pt([x + w * 0.48, y - h * 0.62]) + ' ' + pt([x + w / 2, y + 2]) + 'Z';
    var r = rng(41), st = '';
    for (var i = 0; i < 14; i++) st += E(x - w * 0.38 + r() * w * 0.76, y - h * 0.1 - r() * h * 0.6, 3 + r() * 4, 2 + r() * 2, dk(col, 0.25), 0, 0.8);
    o += body(c, d, col, st + F('M' + pt([x + w * 0.08, y - h - 4]) + 'C' + pt([x + w * 0.3, y - h * 0.8]) + ' ' + pt([x + w * 0.34, y - h * 0.3]) + ' ' + pt([x + w * 0.28, y + 4]) + 'L' + pt([x + w / 2 + 4, y + 4]) + 'L' + pt([x + w / 2 + 4, y - h - 4]) + 'Z', dk(col, 0.35), 0.8) +
      F('M' + pt([x - w * 0.44, y - h * 0.5]) + 'C' + pt([x - w * 0.3, y - h * 1.05]) + ' ' + pt([x + w * 0.3, y - h * 1.05]) + ' ' + pt([x + w * 0.46, y - h * 0.45]) + 'L' + pt([x + w * 0.46, y - h * 1.2]) + 'L' + pt([x - w * 0.44, y - h * 1.2]) + 'Z', '#2e4030', 0.95), 2.4);
    o += L('M' + pt([x - w * 0.42, y - h * 0.55]) + 'C' + pt([x - w * 0.3, y - h * 0.98]) + ' ' + pt([x - w * 0.05, y - h]) + ' ' + pt([x + w * 0.1, y - h * 0.98]), RIM, 1.4, 0.6);
    // cave mouth
    var cx = x - w * 0.06, cy = y;
    o += C(cx, cy - 18, 40, glow(c, '#ff8a30', 0.45));
    o += P('M' + pt([cx - 22, cy + 1]) + 'C' + pt([cx - 24, cy - 26]) + ' ' + pt([cx - 10, cy - 40]) + ' ' + pt([cx + 2, cy - 40]) + 'C' + pt([cx + 16, cy - 40]) + ' ' + pt([cx + 26, cy - 24]) + ' ' + pt([cx + 24, cy + 1]) + 'Z', c.lg([[0, '#1a0e08'], [0.7, '#5a2a10'], [1, '#c8581a']]), 2.2);
    o += limb('M' + pt([cx - 24, cy]) + 'L' + pt([cx - 22, cy - 34]) + 'L' + pt([cx + 2, cy - 44]) + 'L' + pt([cx + 26, cy - 32]) + 'L' + pt([cx + 26, cy]), '#6a5238', 3.4);
    o += skull(c, cx + 2, cy - 48, 0.9) + bone(cx - 14, cy - 42, 12, 0.5, 0.9) + bone(cx + 18, cy - 40, 12, -0.6, 0.9);
    return o;
  }
  // crude outward-leaning sharpened log fence, lashed with rope
  function spikeFence(c, x0, x1, y, h, step, seed, col) {
    col = col || '#6a5236';
    var r = rng(seed || 5), o = '', rope = '';
    for (var x = x0; x <= x1; x += step) {
      var hh = h * (0.8 + r() * 0.35), lean = (r() - 0.5) * 6 - 4, tx = x + lean, w = 3.2 + r();
      o += P(pd([[x - w, y + 1], [tx - w, y - hh + 6], [tx, y - hh], [tx + w, y - hh + 6], [x + w, y + 1]], true), c.cel(r() < 0.5 ? col : dk(col, 0.12)), 1.6) + L('M' + pt([tx - w + 1, y - hh + 7]) + 'L' + pt([x - w + 1, y]), RIM, 0.8, 0.45);
    }
    rope = 'M' + pt([x0 - 4, y - h * 0.35]) + 'L' + pt([x1 + 4, y - h * 0.38]) + 'M' + pt([x0 - 4, y - h * 0.62]) + 'L' + pt([x1 + 4, y - h * 0.6]);
    return o + L(rope, OL, 3.6) + L(rope, '#a8906a', 1.6);
  }
  // iron cauldron on a fire with a bubbling grey-green stew and a bone poking out
  function cookPot(c, x, y, s) {
    var o = campfire(c, x, y + 4 * s, 0.9 * s);
    o += limb('M' + pt([x - 26 * s, y + 4 * s]) + 'L' + pt([x - 20 * s, y - 36 * s]) + 'M' + pt([x + 26 * s, y + 4 * s]) + 'L' + pt([x + 20 * s, y - 36 * s]), '#4a3a2a', 2.6 * s) + limb('M' + pt([x - 22 * s, y - 34 * s]) + 'L' + pt([x + 22 * s, y - 34 * s]), '#5a4630', 2.4 * s);
    o += L('M' + pt([x - 10 * s, y - 20 * s]) + 'L' + pt([x, y - 34 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]), OL, 1.4 * s);
    var d = 'M' + pt([x - 18 * s, y - 20 * s]) + 'C' + pt([x - 22 * s, y - 6 * s]) + ' ' + pt([x - 12 * s, y + 2 * s]) + ' ' + pt([x, y + 2 * s]) + 'C' + pt([x + 12 * s, y + 2 * s]) + ' ' + pt([x + 22 * s, y - 6 * s]) + ' ' + pt([x + 18 * s, y - 20 * s]) + 'Z';
    o += body(c, d, '#34363e', F(pd([[x + 4 * s, y - 22 * s], [x + 24 * s, y - 22 * s], [x + 24 * s, y + 4 * s], [x + 6 * s, y + 4 * s]], true), '#1a1a20', 0.8) + E(x - 10 * s, y - 12 * s, 3 * s, 5 * s, '#6a6e78', 0, 0.5), 2 * s);
    o += E(x, y - 20 * s, 18 * s, 4 * s, '#2a2a30', 2 * s) + E(x, y - 20 * s, 15 * s, 2.8 * s, '#7a8a44') + C(x - 6 * s, y - 20.5 * s, 1.6 * s, '#aab860') + C(x + 5 * s, y - 20 * s, 1.2 * s, '#aab860');
    o += bone(x + 8 * s, y - 25 * s, 14 * s, -1.0, 0.9 * s) + smoke(x - 4 * s, y - 28 * s, 0.6 * s, 17, '#7a8a8a', 5);
    return o;
  }
  // iron-barred pen with a ghoul pressed against the bars
  function ghoulPen(c, x, y, s) {
    var q = function (dx, dy) { return [x + dx * s, y + dy * s]; }, o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.35);
    o += P(pd([q(-30, 0), q(-30, -40), q(30, -40), q(30, 0)], true), '#0c0e12', 1.6 * s);
    // ghoul inside: hunched grey-green body, glowing eyes, clawed hand on a bar
    o += P(sm([q(-18, 0), q(-20, -16), q(-10, -30), q(6, -28), q(16, -16), q(14, 0)], true), c.cel('#5e7a58'), 1.6 * s);
    o += P(sm([q(-14, -22), q(-22, -30), q(-14, -38), q(-4, -34), q(-4, -24)], true), c.cel('#6a8a60'), 1.6 * s) + glowEye(c, q(-16, -31)[0], q(-16, -31)[1], 1.2 * s, '#d8ff60') + glowEye(c, q(-10, -32)[0], q(-10, -32)[1], 1.1 * s, '#d8ff60');
    o += L('M' + pt(q(-18, -26)) + 'l' + n(4 * s) + ',' + n(1 * s), OL, 1.2 * s);
    var bars = '';
    for (var i = 0; i < 7; i++) { var bx = -27 + i * 9; bars += 'M' + pt(q(bx, 2)) + 'L' + pt(q(bx, -42)); }
    o += L(bars, OL, 4.6 * s) + L(bars, '#565a64', 2.2 * s) + L(bars, RIM, 0.6 * s, 0.4);
    o += C(q(-5, -20)[0], q(-5, -20)[1], 3 * s, c.cel('#6a8a60'), 1.2 * s) + L('M' + pt(q(-7, -22)) + 'l' + n(-2 * s) + ',' + n(-4 * s) + 'M' + pt(q(-4, -23)) + 'l0,' + n(-5 * s), '#e8e0cc', 1 * s);
    o += body(c, pd([q(-33, -40), q(-33, -46), q(33, -46), q(33, -40)], true), '#5a4430', '', 1.6 * s) + body(c, pd([q(-33, 0), q(-33, 4), q(33, 4), q(33, 0)], true), '#5a4430', '', 1.6 * s);
    o += R(q(22, -24)[0], q(22, -24)[1], 6 * s, 7 * s, c.cel('#8a7a4a'), 1.2 * s);
    return o;
  }
  // dead orchard apple tree: short gnarled trunk, wide crooked limbs, a few rotten apples still hanging
  function appleTree(c, x, y, s, seed, o) {
    o = o || {};
    var r = rng(seed || 3), f = r() < 0.5 ? 1 : -1, col = o.col || '#2a2426';
    var br = [[[0, 30], [-14, 44], [-30, 50], [-40, 60]], [[-14, 44], [-18, 62]], [[0, 34], [10, 52], [26, 58], [36, 70]], [[10, 52], [8, 70]], [[2, 38], [0, 56], [-6, 72]], [[-30, 50], [-44, 48]], [[26, 58], [40, 54]]];
    var out = gnarl(c, x, y, s * 0.9, { col: col, flip: f < 0, branches: br.map(function (b) { return b.map(function (p) { return [p[0] * (0.9 + r() * 0.2), p[1]]; }); }), claws: o.claws ? 20 : false });
    var hang = [[-40, 60], [-18, 62], [36, 70], [8, 70], [-6, 72], [40, 54]];
    hang.forEach(function (h, i) { if (r() < 0.55) { var p = [x + h[0] * s * 0.9 * f, y - h[1] * s * 0.9]; out += L('M' + pt(p) + 'L' + pt([p[0], p[1] + 5 * s]), OL, 0.8) + C(p[0], p[1] + 7 * s, 3 * s, c.cel(i % 2 ? '#5a2e24' : '#48401f'), 1.1) + C(p[0] + 1 * s, p[1] + 8 * s, 1 * s, '#1a1410'); } });
    return out;
  }
  function apples(seed, x0, x1, y0, y1, cnt, s) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), k = (s || 1) * (0.7 + (y - y0) / ((y1 - y0) || 1) * 0.6); o += E(x, y + 1.5 * k, 3.6 * k, 1.2 * k, '#000', 0, 0.3) + C(x, y, 2.6 * k, i % 3 ? '#4e2a22' : '#3e3a22', 1 * k) + E(x + 0.6 * k, y + 0.6 * k, 1.2 * k, 0.8 * k, '#2a1a12'); }
    return o;
  }
  // wrought-iron cemetery fence with spear tips
  function ironFence(x0, x1, y, h, step, broken) {
    var d = '', tips = '';
    for (var x = x0, i = 0; x <= x1; x += step, i++) {
      if (broken && broken.indexOf(i) >= 0) continue;
      var lean = broken ? ((i * 37) % 7 - 3) * 0.6 : 0;
      d += 'M' + pt([x, y]) + 'L' + pt([x + lean, y - h]);
      tips += 'M' + pt([x + lean - 2, y - h + 1]) + 'L' + pt([x + lean, y - h - 5]) + 'L' + pt([x + lean + 2, y - h + 1]) + 'Z';
    }
    var rails = 'M' + pt([x0, y - h * 0.25]) + 'L' + pt([x1, y - h * 0.25]) + 'M' + pt([x0, y - h * 0.8]) + 'L' + pt([x1, y - h * 0.8]);
    return L(d + rails, OL, 4) + L(d + rails, '#2a2c36', 1.8) + P(tips, '#2a2c36', 1) + L(rails, RIM, 0.6, 0.4);
  }
  // still black water with a moon streak
  function blackWater(c, y0, y1, mx, seed) {
    var o = R(-2, y0, 404, y1 - y0, c.lg([[0, '#2a3456'], [0.25, '#141a2e'], [1, '#07090f']]));
    var r = rng(seed || 5), d = '', g = '';
    for (var i = 0; i < 22; i++) { var y = y0 + 3 + r() * (y1 - y0 - 4), x = r() * 400, w = 6 + (y - y0) * 0.4; d += 'M' + pt([x, y]) + 'q' + n(w * 0.5) + ',' + n(-1) + ' ' + n(w) + ',0'; }
    for (var j = 0; j < 10; j++) { var gy = y0 + 2 + j * (y1 - y0) / 11, gw = 20 - j * 1.2; g += E(mx + (r() - 0.5) * 8, gy, gw, 1.1, '#dfe6ff', 0, 0.55 - j * 0.04); }
    return o + L(d, '#6a7aa8', 0.9, 0.45) + g + E(200, y0 + 1, 220, 1.4, '#c8d4ff', 0, 0.3);
  }
  // cattails / dead reeds in dark silhouette
  function reeds(x, y, s, col) {
    var d = '', heads = '';
    [[-6, 22, -3], [-2, 30, 0], [2, 26, 2], [6, 18, 4], [-9, 14, -5]].forEach(function (k) { d += 'M' + pt([x + k[0] * s, y]) + 'Q' + pt([x + k[0] * s, y - k[1] * s * 0.6]) + ' ' + pt([x + (k[0] + k[2]) * s, y - k[1] * s]); if (k[1] > 20) heads += 'M' + pt([x + (k[0] + k[2] * 0.9) * s, y - k[1] * s * 0.95]) + 'l0,' + n(6 * s); });
    return L(d, col || '#10141c', 1.6 * s) + L(heads, OL, 3.6 * s) + L(heads, '#3a2e26', 2.2 * s);
  }
  // pale glowing mushrooms
  function shrooms(c, x, y, s) {
    var o = C(x, y - 4 * s, 12 * s, glow(c, '#a0e8d8', 0.35));
    [[-4, 0, 1], [3, 1, 0.8], [0, -1, 0.6]].forEach(function (m) { var mx = x + m[0] * s, my = y + m[1] * s, k = m[2] * s; o += limb('M' + pt([mx, my]) + 'L' + pt([mx, my - 6 * k]), '#d8e0d0', 1.6 * k) + P('M' + pt([mx - 5 * k, my - 5 * k]) + 'Q' + pt([mx, my - 12 * k]) + ' ' + pt([mx + 5 * k, my - 5 * k]) + 'Z', c.cel('#b8e8dc'), 1.1 * k); });
    return o;
  }
  // cobblestones scattered over a square
  function cobbles(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 3 + t * 5, x = x0 + r() * (x1 - x0); d += ring(x, y, w, w * 0.45); }
    return L(d, col, 0.9, 0.6);
  }
  function dirtPath(pts, w0, w1, col, op) {
    var a = [], b = [];
    pts.forEach(function (p, i) { var t = i / (pts.length - 1), w = (w0 + (w1 - w0) * t) / 2; a.push([p[0], p[1] - w]); b.unshift([p[0], p[1] + w]); });
    return F(sm(a.concat(b), true), col, op == null ? 0.7 : op);
  }
  // hanging lantern + hand-drawn glow halo for Lanternby homes
  function porchLamp(c, x, y, s) { return C(x, y + 6 * s, 26 * s, glow(c, LAMP, 0.45)) + hangLantern(c, x, y, s); }

  // ============================================================
  //  SCENES (400x240)
  // ============================================================
  var HOUSE = { wall: '#a49c8a', roof: '#4a3446', stone: '#6e7080', lit: true, smoke: '#4a4e6c' };
  var SCENES = {
    darkshire: function (c) {
      var o = dwSky(c, 11) + moon(c, 64, 50, 28) + wisp(84, 62, 52, '#262a58', 0.8) + wisp(260, 36, 64, '#242858', 0.6);
      o += farWoods(12, 124, 34, '#1e2442', 14) + farWoods(13, 138, 26, '#151a2e', 12);
      o += gnarl(c, 380, 140, 0.55, { leaves: true, col: '#141620', flip: true }) + gnarl(c, 12, 140, 0.5, { leaves: true, col: '#141620' });
      o += clockTower(c, 150, 148, 0.8);
      o += townHall(c, 256, 150, 0.74);
      o += farmhouse(c, 56, 154, 0.66, HOUSE);
      o += watchPost(c, 350, 156, 0.72);
      o += fogBand(c, 136, 26, 14, 0.26);
      o += nightGround(c, 150, '#3a3c48', '#1e2028');
      o += cobbles(15, 156, 240, '#5a5c6a', 70);
      o += dirtPath([[-10, 220], [80, 206], [180, 196], [280, 200], [410, 214]], 50, 60, '#4a4a56', 0.8);
      o += cobbles(16, 186, 236, '#6a6c7a', 50, 0, 400);
      o += farmhouse(c, 392, 172, 0.86, HOUSE);
      o += fence(c, 6, 90, 176, 12, '#5a4a3a', 14);
      o += lampPost(c, 110, 180, 48, 1) + lampPost(c, 212, 184, 50, 1) + lampPost(c, 322, 196, 52, 1.05);
      o += barrel(c, 170, 204, 1, '#5a4430') + crate(c, 154, 206, 0.9, '#6a5036') + sack(c, 186, 206, 0.85, '#8a7a5e');
      o += porchLamp(c, 232, 156, 0.8) + porchLamp(c, 280, 156, 0.8);
      o += grass(17, 160, 240, '#2a3a34', 40, 0.6, 1.4, 1.1);
      o += tufts(c, [[40, 234, 0.9], [300, 236, 1], [120, 230, 0.8]], '#3e5a48');
      return o + night(c, 64);
    },
    brightwood_grove: function (c) {
      var o = dwSky(c, 21, '#0c1030', '#222858', '#3c4676') + moon(c, 300, 58, 32) + wisp(290, 70, 64, '#20245a', 0.8) + wisp(120, 34, 50, '#20245a', 0.6);
      o += farWoods(22, 116, 42, '#1e2444', 18) + farWoods(23, 130, 34, '#161b32', 16);
      o += gnarl(c, 70, 138, 0.62, { leaves: true, col: '#161822' }) + gnarl(c, 206, 132, 0.56, { leaves: true, flip: true, col: '#161822' }) + gnarl(c, 330, 136, 0.6, { leaves: true, col: '#161822' });
      o += fogBand(c, 128, 40, 24, 0.42);
      o += nightGround(c, 144, '#34463e', '#18221f');
      o += dirtPath([[-10, 210], [90, 196], [180, 176], [250, 160], [300, 148]], 46, 14, '#4a4034', 0.75);
      o += gnarl(c, 132, 162, 0.9, { leaves: true, claws: 34 }) + gnarl(c, 272, 156, 0.8, { leaves: true, flip: true, claws: 30 });
      o += fogBand(c, 150, 30, 25, 0.28);
      o += wagon(c, 180, 206, 0.95);
      o += grass(26, 160, 240, '#1e2e28', 70, 0.7, 1.5, 1.2);
      o += shrooms(c, 250, 214, 1) + shrooms(c, 60, 196, 0.8);
      o += gnarl(c, 12, 250, 1.45, { leaves: [[44, 114, 13], [54, 98, 10], [6, 126, 12]], claws: 42 }) + gnarl(c, 396, 250, 1.4, { flip: true, leaves: [[44, 114, 13], [-46, 104, 12], [6, 126, 12]], claws: 40 });
      o += tufts(c, [[110, 234, 1], [330, 238, 1], [220, 236, 0.9]], '#34503e');
      o += pebbles(27, 200, 240, '#2a3430', 16);
      return o + night(c, 300);
    },
    the_hushed_bank: function (c) {
      var o = dwSky(c, 31, '#0c1030', '#252a5c', '#46507e') + moon(c, 110, 54, 30) + wisp(130, 66, 56, '#22265a', 0.8);
      o += farWoods(32, 130, 30, '#1a2040', 14) + farWoods(33, 138, 20, '#121628', 12);
      o += blackWater(c, 138, 188, 110, 34);
      o += reeds(250, 142, 0.7, '#0c1018') + reeds(330, 140, 0.6, '#0c1018') + reeds(20, 142, 0.6, '#0c1018');
      o += fogBand(c, 146, 30, 35, 0.3);
      o += F('M-10,190 Q60,180 140,186 Q240,192 320,182 Q370,178 410,184 L410,250 L-10,250 Z', c.lg([[0, '#3a4640'], [1, '#161e1c']])) + L('M-10,190 Q60,180 140,186 Q240,192 320,182 Q370,178 410,184', '#6a7aa8', 1.4, 0.6);
      o += reeds(150, 192, 1.1) + reeds(290, 190, 1) + reeds(380, 190, 1.1);
      // dead trees on the near bank with huge webs strung between them
      var bare = [[0, 76], [14, 92], [30, 97], [44, 114]], b2 = [[16, 93], [18, 110], [12, 120]], b3 = [[-2, 72], [-14, 88], [-30, 92], [-46, 104]], b4 = [[2, 82], [-2, 104], [6, 126]], b5 = [[4, 54], [20, 62], [34, 58]];
      o += gnarl(c, 36, 202, 1.1, { branches: [bare, b2, b3, b4, b5, [[-6, 46], [-20, 52], [-30, 46]]] }) + gnarl(c, 176, 192, 0.86, { flip: true, branches: [bare, b2, b3, b4, b5] });
      o += web(106, 104, 44, 11, 36, [[64, 88], [148, 90], [100, 176], [58, 150]]);
      o += gnarl(c, 300, 190, 0.8, { branches: [bare, b2, b3, b4, b5] }) + gnarl(c, 398, 214, 1.25, { flip: true, branches: [bare, b2, b3, b4, b5, [[-6, 46], [-20, 52], [-30, 46]]] });
      o += web(346, 86, 38, 10, 37, [[320, 118], [376, 116], [336, 44], [362, 136]]);
      o += cocoon(c, 90, 52, 0.9, 18) + cocoon(c, 196, 104, 0.8, 22) + cocoon(c, 330, 50, 0.8, 14);
      o += rock(c, 240, 212, 26, 12, '#3a4248') + rock(c, 258, 216, 12, 6, '#4a525a') + rock(c, 110, 222, 18, 9, '#3a4248') + rock(c, 380, 234, 22, 10, '#3a4248');
      o += limb('M60,214 C90,208 120,210 150,204', '#262830', 5) + limb('M96,210 L104,200 L112,202', '#262830', 2.6) + L('M62,211 C90,205 120,207 148,201', RIM, 1, 0.5);
      o += web(80, 226, 14, 7, 38, [[60, 214], [104, 214]]);
      o += bone(210, 226, 14, 0.4, 1) + skull(c, 228, 230, 0.9) + bone(150, 234, 12, -0.3, 1) + shrooms(c, 300, 214, 0.8) + reeds(20, 214, 1.2) + reeds(206, 204, 0.9);
      o += grass(38, 196, 240, '#16201e', 40, 0.7, 1.4, 1.2);
      o += fogBand(c, 196, 30, 39, 0.2);
      return o + night(c, 110);
    },
    raven_hill_cemetery: function (c) {
      var o = dwSky(c, 41, '#0c1030', '#262a5e', '#48527e') + moon(c, 312, 62, 36) + wisp(300, 78, 70, '#22265a', 0.7) + wisp(90, 40, 50, '#22265a', 0.6);
      o += flyRaven(250, 40, 0.8) + flyRaven(210, 28, 0.6) + flyRaven(140, 52, 0.7);
      o += farWoods(42, 150, 30, '#1a2040', 16);
      // the hill
      var hill = 'M-10,178 C60,160 140,118 230,112 C300,108 360,126 410,138 L410,250 L-10,250 Z';
      o += F(hill, c.lg([[0, '#3a4c46'], [0.5, '#27352f'], [1, '#141c1a']])) + L('M-10,178 C60,160 140,118 230,112 C300,108 360,126 410,138', RIM, 1.6, 0.55);
      o += grass(43, 118, 170, '#1e2a26', 40, 0.4, 0.9, 1);
      // dead tree against the moon, ravens on its branches
      o += gnarl(c, 322, 128, 1.05);
      o += raven(354, 25, 1, -1) + raven(290, 30, 1.1, 1) + raven(343, 64, 0.9, -1) + raven(368, 5, 0.8, -1);
      o += crypt(c, 212, 118, 0.78);
      o += ironFence(98, 176, 142, 18, 8) + ironFence(250, 290, 122, 16, 8);
      o += tombs(c, [[120, 150, 0.6, 'round', -8], [150, 142, 0.55, 'cross', 6], [272, 126, 0.55, 'slab', -6], [298, 134, 0.6, 'round', 10], [180, 140, 0.5, 'obelisk', 3]]);
      o += fogBand(c, 146, 30, 44, 0.34);
      o += tombs(c, [[40, 196, 0.9, 'cross', -10], [96, 184, 0.8, 'round', 8], [250, 170, 0.8, 'slab', -12], [370, 178, 0.95, 'round', 6], [330, 160, 0.7, 'obelisk', -4]]);
      o += grave(c, 178, 206, 0.9) + grave(c, 300, 196, 0.7);
      o += tombs(c, [[18, 238, 1.3, 'round', 14], [230, 236, 1.2, 'cross', -8], [392, 240, 1.3, 'slab', 10]]);
      o += grass(45, 180, 240, '#1a2622', 50, 0.8, 1.5, 1.2);
      o += fogBand(c, 206, 30, 46, 0.2);
      return o + night(c, 312);
    },
    tranquil_gardens: function (c) {
      var o = dwSky(c, 51, '#0e1232', '#282e5c', '#4a5a80') + moon(c, 64, 52, 26) + wisp(70, 62, 48, '#22285a', 0.8) + wisp(250, 38, 60, '#22285a', 0.6);
      o += farWoods(52, 124, 36, '#1c2440', 16) + farWoods(53, 136, 26, '#141a2c', 12);
      o += farmhouse(c, 314, 146, 0.8, { wall: '#7a7466', roof: '#3a3440', stone: '#60646e', ruin: true });
      var ivy = 'M284,146 C282,132 290,124 286,112 M292,146 C296,136 290,128 296,118 M340,146 C344,134 338,126 346,116 C350,110 346,104 352,98';
      o += L(ivy, '#1e3222', 2.4) + [[285, 136], [289, 124], [294, 132], [296, 120], [342, 136], [340, 126], [347, 114], [351, 102]].map(function (v) { return E(v[0], v[1], 3, 1.8, '#2e4a30', 0.8); }).join('');
      o += gnarl(c, 390, 150, 0.7, { leaves: true, flip: true, col: '#161822' }) + gnarl(c, 220, 140, 0.5, { leaves: true, col: '#161822' });
      o += fogBand(c, 132, 30, 54, 0.32);
      o += nightGround(c, 146, '#34483a', '#18241c');
      o += ironFence(0, 130, 162, 20, 9, [3, 4, 9]) + ironFence(200, 400, 160, 20, 9, [6, 7, 15, 16]);
      o += tufts(c, [[30, 166, 0.7], [70, 164, 0.6], [240, 164, 0.7], [300, 166, 0.6], [370, 166, 0.7]], '#3a5a40');
      o += tombs(c, [[40, 174, 0.7, 'round', 12], [100, 178, 0.66, 'slab', -8], [240, 172, 0.64, 'cross', -14], [288, 176, 0.7, 'round', 6], [352, 170, 0.62, 'slab', 10]]);
      o += ghoulPen(c, 168, 190, 0.9);
      o += tufts(c, [[130, 194, 0.8], [206, 196, 0.9], [60, 186, 0.8], [340, 192, 0.9]], '#34503a');
      o += tombs(c, [[30, 226, 1.1, 'cross', 10], [250, 214, 0.9, 'round', -16], [370, 230, 1.1, 'slab', -6]]);
      o += grass(56, 170, 240, '#243a2a', 110, 0.8, 1.8, 1.2);
      o += tufts(c, [[20, 240, 1.2], [120, 238, 1.1], [220, 240, 1.2], [300, 240, 1.1], [396, 240, 1.2]], '#2e4a36');
      o += shrooms(c, 212, 226, 0.9);
      o += fogBand(c, 196, 34, 57, 0.24);
      return o + night(c, 64);
    },
    vulgol_ogre_mound: function (c) {
      var o = dwSky(c, 61, '#0e1030', '#2a2a5a', '#4a4c7a') + moon(c, 336, 50, 30) + wisp(330, 60, 60, '#24265a', 0.8);
      o += farWoods(62, 124, 38, '#1e2240', 16) + farWoods(63, 136, 28, '#151a2c', 14);
      o += gnarl(c, 40, 134, 0.6, { leaves: true, col: '#161822' }) + gnarl(c, 268, 132, 0.62, { leaves: true, flip: true, col: '#161822' });
      o += fogBand(c, 126, 30, 64, 0.3);
      o += nightGround(c, 144, '#3a3a34', '#1c1c1a');
      o += ogreMound(c, 150, 160, 250, 84);
      o += pike(c, 36, 168, 30, 1) + pike(c, 268, 162, 34, 1) + pike(c, 300, 158, 28, 0.9);
      o += spikeFence(c, 8, 90, 180, 30, 9, 65) + spikeFence(c, 226, 330, 170, 26, 9, 66);
      o += dirtPath([[-10, 222], [100, 208], [200, 200], [300, 196], [410, 204]], 50, 50, '#4a4236', 0.7);
      o += cookPot(c, 196, 208, 1);
      o += bone(120, 214, 14, 0.5, 1) + bone(268, 212, 14, -0.4, 1) + skull(c, 104, 222, 0.9) + bone(340, 228, 16, 0.2, 1) + bone(60, 232, 12, 1.1, 1);
      o += barrel(c, 140, 198, 0.9, '#5a4430') + sack(c, 250, 202, 0.9, '#7a6a52');
      o += grass(67, 176, 240, '#262a24', 40, 0.7, 1.4, 1.2);
      o += tufts(c, [[20, 238, 1], [380, 236, 1], [300, 240, 0.9]], '#3a4a36');
      o += fogBand(c, 210, 30, 68, 0.18);
      return o + night(c, 336);
    },
    the_rotting_orchard: function (c) {
      var o = dwSky(c, 71, '#0e1030', '#282a5c', '#4a5080') + moon(c, 84, 56, 30) + wisp(90, 66, 56, '#22265a', 0.8);
      o += farWoods(72, 128, 32, '#1c2240', 16) + farWoods(73, 138, 22, '#141a2c', 12);
      o += farmhouse(c, 268, 144, 0.82, { wall: '#4e4844', roof: '#2a2226', stone: '#56565e', ruin: true });
      o += E(250, 112, 22, 9, '#080606', 0, 0.55) + E(290, 118, 14, 8, '#080606', 0, 0.5) + E(242, 132, 10, 6, '#080606', 0, 0.5) + E(300, 136, 9, 7, '#080606', 0, 0.45);
      o += C(268, 136, 14, glow(c, '#ff6a20', 0.6)) + C(246, 118, 8, glow(c, '#ff6a20', 0.5)) + C(268, 139, 2, '#ffb040') + C(248, 120, 1.4, '#ffb040');
      o += smoke(254, 84, 0.6, 74, '#1a1a26', 5);
      o += fogBand(c, 130, 28, 75, 0.3);
      o += nightGround(c, 144, '#3a4038', '#1c201a');
      o += appleTree(c, 40, 150, 0.5, 1) + appleTree(c, 150, 148, 0.48, 2) + appleTree(c, 360, 150, 0.5, 3);
      o += fence(c, 0, 140, 166, 12, '#4a3e32', 16) + fence(c, 300, 400, 166, 12, '#4a3e32', 16);
      o += appleTree(c, 96, 184, 0.72, 4, { claws: true }) + appleTree(c, 230, 178, 0.66, 5) + appleTree(c, 330, 186, 0.7, 6, { claws: true });
      o += apples(77, 20, 380, 176, 196, 12, 1);
      o += fogBand(c, 176, 26, 78, 0.24);
      o += appleTree(c, 176, 234, 1.05, 7, { claws: true });
      o += apples(79, 0, 400, 200, 238, 14, 1.3);
      o += grass(80, 170, 240, '#232a22', 60, 0.8, 1.6, 1.2);
      o += tufts(c, [[20, 238, 1.1], [380, 238, 1.1], [290, 232, 0.9]], '#3a4a34');
      return o + night(c, 84);
    }
  };

  // ============================================================
  //  DUSKWOOD MOB PIECES
  // ============================================================
  // claw hand: a paw with four hooked talons pointing along ang
  function clawHand(c, p, ang, col, len, r) {
    len = len || 9; r = r || 5.2;
    var s = '';
    [-0.5, -0.17, 0.17, 0.5].forEach(function (k) {
      var a = ang + k, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      var b = [p[0] + ca * (r - 1), p[1] + sa * (r - 1)], tip = [p[0] + ca * (r - 1 + len) + px * len * 0.25, p[1] + sa * (r - 1 + len) + py * len * 0.25];
      s += P(pd([[b[0] + px * 1.9, b[1] + py * 1.9], [tip[0] + px * 0.6, tip[1] + py * 0.6], tip, [b[0] - px * 1.9, b[1] - py * 1.9]], true), '#ece4d0', 1.1);
    });
    return s + C(p[0], p[1], r, c.cel(col), 2);
  }
  // long clawed paw on the ground: hock h -> toes t
  function wolfFoot(c, h, t, fur) {
    var d = 'M' + pt([h[0] + 4, h[1] - 3]) + 'L' + pt([h[0] + 4, t[1] + 1]) + 'L' + pt([t[0] - 2, t[1] + 1]) + 'C' + pt([t[0] - 5, t[1] - 3]) + ' ' + pt([t[0] - 1, t[1] - 6]) + ' ' + pt([t[0] + 3, t[1] - 6]) + 'L' + pt([h[0] - 4, h[1] - 1]) + 'Z';
    return P(d, c.cel(fur), 2) + P(pd([[t[0] - 1, t[1] - 2], [t[0] - 7, t[1] + 1], [t[0] - 1, t[1] + 1]], true), '#ece4d0', 0.9) + P(pd([[t[0] + 3, t[1] - 1], [t[0] - 2, t[1] + 1.4], [t[0] + 3, t[1] + 1.4]], true), '#ece4d0', 0.9);
  }
  // digitigrade worgen leg (hip, knee, hock, toe) with torn trouser leg ending mid-shin
  function wolfLeg(c, pts, fur, pants, w) {
    var hip = pts[0], knee = pts[1], hock = pts[2], toe = pts[3], s = '';
    w = w || 13;
    s += limb(pd([knee, hock]), fur, w * 0.66) + wolfFoot(c, hock, toe, fur);
    if (pants) {
      var t = 0.42, e = [knee[0] + (hock[0] - knee[0]) * t, knee[1] + (hock[1] - knee[1]) * t];
      var dx = hock[0] - knee[0], dy = hock[1] - knee[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux, k = w * 0.58;
      s += limb(pd([hip, knee, e]), pants, w);
      var hem = pd([[e[0] + px * k - ux * 4, e[1] + py * k - uy * 4], [e[0] + px * k + ux * 6, e[1] + py * k + uy * 6], [e[0] + px * k * 0.3 + ux * 2, e[1] + py * k * 0.3 + uy * 2], [e[0] - px * k * 0.1 + ux * 9, e[1] - py * k * 0.1 + uy * 9], [e[0] - px * k * 0.5 + ux * 3, e[1] - py * k * 0.5 + uy * 3], [e[0] - px * k + ux * 6, e[1] - py * k + uy * 6], [e[0] - px * k - ux * 4, e[1] - py * k - uy * 4]], true);
      s += P(hem, c.cel(pants), 1.6);
    } else s += limb(pd([hip, knee]), fur, w);
    return s;
  }
  // wolf head, facing left: long muzzle, tall ears, open jaws, cheek ruff
  function wolfHead(c, x, y, o) {
    var f = o.fur, f2 = o.mane || dk(f, 0.3), s = '', rim = o.rim || RIM;
    var ear = function (pts, col, inner) { return P(pd(pts, true), c.cel(col), 1.8) + (inner ? F(pd([[pts[0][0] + 2, pts[0][1] - 1], [pts[1][0] + 0.6, pts[1][1] + 6], [pts[2][0] - 2, pts[2][1] - 1]], true), inner, 0.9) : ''); };
    s += ear([[x + 4, y - 8], [x + 13, y - 25], [x + 14, y - 5]], dk(f, 0.18));
    s += P('M' + pt([x - 4, y + 5]) + 'L' + pt([x - 21, y + 7]) + 'C' + pt([x - 24, y + 8]) + ' ' + pt([x - 23, y + 12]) + ' ' + pt([x - 19, y + 12]) + 'L' + pt([x - 2, y + 12]) + 'Z', c.cel(dk(f, 0.1)), 1.8);
    s += F(pd([[x - 20, y + 6], [x - 4, y + 5], [x - 4, y + 9], [x - 19, y + 9]], true), '#5a1a1e');
    s += P(pd([[x - 19, y + 9.4], [x - 18, y + 5.6], [x - 16.4, y + 9.4]], true), '#f4ecd6', 0.9) + P(pd([[x - 11, y + 9.4], [x - 10, y + 6], [x - 8.4, y + 9.4]], true), '#f4ecd6', 0.9);
    var d = 'M' + pt([x + 12, y - 3]) + 'C' + pt([x + 12, y - 12]) + ' ' + pt([x + 2, y - 14]) + ' ' + pt([x - 6, y - 10]) + 'C' + pt([x - 12, y - 8]) + ' ' + pt([x - 18, y - 6]) + ' ' + pt([x - 24, y - 4]) + 'C' + pt([x - 28, y - 3]) + ' ' + pt([x - 28, y + 3]) + ' ' + pt([x - 24, y + 4]) + 'L' + pt([x - 8, y + 5]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x + 8, y + 10]) + ' ' + pt([x + 13, y + 5]) + 'Z';
    s += body(c, d, f, F(pd([[x + 2, y - 16], [x + 16, y - 16], [x + 16, y + 12], [x + 3, y + 12]], true), dk(f, 0.28), 0.8) + F(pd([[x - 28, y + 1], [x - 6, y + 2], [x - 6, y + 7], [x - 28, y + 7]], true), dk(f, 0.3), 0.7) +
      L('M' + pt([x - 22, y - 5]) + 'C' + pt([x - 14, y - 8]) + ' ' + pt([x - 8, y - 10]) + ' ' + pt([x - 2, y - 12]), lt(f, 0.35), 1.4, 0.8), 2.2);
    s += P(pd([[x - 21.4, y + 3.8], [x - 20, y + 8.8], [x - 18.6, y + 4.2]], true), '#f4ecd6', 0.9) + P(pd([[x - 13.4, y + 4.6], [x - 12, y + 8.8], [x - 10.6, y + 4.9]], true), '#f4ecd6', 0.9);
    s += E(x - 25, y - 1.6, 3.4, 2.7, '#18141a', 1) + C(x - 26.2, y - 2.6, 0.8, '#9a9aaa');
    if (o.glow) s += glowEye(c, x - 8, y - 4, 1.9, o.glow); else s += E(x - 8, y - 4, 2.3, 1.6, o.eye || '#e8a030', 0.9) + C(x - 8.8, y - 4.2, 0.8, OL);
    s += L('M' + pt([x - 14, y - 5]) + 'L' + pt([x - 3, y - 9]), OL, 2.4);
    s += P('M' + pt([x + 2, y + 6]) + 'L' + pt([x + 5, y + 17]) + 'L' + pt([x + 10, y + 10]) + 'L' + pt([x + 16, y + 15]) + 'L' + pt([x + 15, y + 5]) + 'L' + pt([x + 21, y + 3]) + 'L' + pt([x + 12, y - 4]) + 'Z', c.cel(f2), 1.6);
    s += o.notch ? ear([[x - 2, y - 9], [x + 1, y - 20], [x + 4, y - 17], [x + 3, y - 25], [x + 8, y - 9]], f, '#4a2e30') : ear([[x - 2, y - 9], [x + 2, y - 27], [x + 8, y - 9]], f, '#4a2e30');
    s += L('M' + pt([x - 23, y - 5.5]) + 'C' + pt([x - 13, y - 10]) + ' ' + pt([x - 5, y - 12]) + ' ' + pt([x - 2, y - 10]) + 'L' + pt([x + 2, y - 27]), rim, 1.1, 0.75);
    if (o.scar) s += L('M' + pt([x - 13, y - 12]) + 'L' + pt([x - 4, y + 3]) + 'M' + pt([x - 11, y - 8]) + 'l3.4,-1.4 M' + pt([x - 8.6, y - 3.6]) + 'l3.4,-1.4', '#e0a098', 1.4);
    return s;
  }
  // worgen: hunched wolf-man, digitigrade, shaggy ruff, torn trousers; o.pose 'run' = lunging sprint
  function worgen(c, o) {
    var f = o.fur, f2 = o.mane || dk(f, 0.3), pants = o.pants, rim = o.rim || RIM, run = o.pose === 'run', aw = o.armW || 11, s = shadow(c, run ? 60 : 64, o.shadowR || 36);
    var far = o.far || [[80, 50], [94, 58], [100, 44]], near = o.near || [[46, 54], [30, 66], [16, 62]];
    var farLeg = o.farLeg || (run ? [[78, 84], [90, 96], [106, 104], [100, 121]] : [[76, 84], [70, 100], [80, 112], [70, 121]]);
    var nearLeg = o.nearLeg || (run ? [[56, 84], [40, 94], [36, 110], [22, 121]] : [[58, 86], [50, 101], [58, 113], [46, 121]]);
    if (o.back) s += o.back(c);
    s += limb(pd(far.slice(0, 2)), dk(f, 0.18), aw) + limb(pd(far.slice(1)), dk(f, 0.18), aw - 2);
    s += o.farHand ? o.farHand(c, far[2]) : clawHand(c, far[2], o.farAng == null ? -1.9 : o.farAng, dk(f, 0.18));
    s += wolfLeg(c, farLeg, dk(f, 0.18), pants ? dk(pants, 0.2) : null, o.legW);
    var td = o.torsoD || (run ? 'M24,60 C30,44 62,36 86,46 C98,54 96,72 86,84 L58,90 C46,84 32,76 24,66 Z' : 'M36,50 C42,36 72,32 88,44 C98,52 96,72 86,86 L58,90 C48,84 40,72 36,60 Z');
    var r = rng(o.seed || 9), fz = '';
    for (var i = 0; i < 16; i++) { var fx = 44 + r() * 44, fy = 48 + r() * 34; fz += 'M' + pt([fx, fy]) + 'l' + n(2 + r() * 2) + ',' + n(3 + r() * 2); }
    s += body(c, td, f, L(fz, dk(f, 0.32), 1.1, 0.8) + F(run ? 'M26,62 C34,56 48,60 52,70 C50,80 42,84 34,78 Z' : 'M34,56 C42,52 54,56 56,68 C54,78 48,86 40,84 Z', lt(f, 0.18), 0.7) + F('M74,30 L104,30 L104,96 L78,96 C88,76 86,52 74,30 Z', dk(f, 0.28), 0.8) + (o.chest ? o.chest(c) : ''));
    if (pants) s += body(c, 'M54,80 C66,77 80,77 92,79 L92,90 L54,94 Z', pants, L('M55,84 C66,81 80,81 91,83', dk(pants, 0.45), 2), 1.8);
    s += wolfLeg(c, nearLeg, f, pants, o.legW);
    if (o.front) s += o.front(c);
    var ru = o.ruff || (run ? 'M26,48 L28,36 L36,42 L42,30 L48,40 L56,30 L60,40 L70,34 L72,44 L82,42 L80,52 C68,46 48,44 30,54 Z' : 'M40,44 L42,30 L50,38 L55,24 L62,34 L70,24 L74,36 L84,30 L84,42 L94,42 L90,52 C78,44 58,40 42,50 Z');
    s += body(c, ru, f2, L(run ? 'M40,40 l2,-5 M54,36 l2,-6 M66,40 l2,-5' : 'M46,40 l2,-5 M60,34 l2,-6 M72,34 l2,-5', lt(f2, 0.3), 1, 0.8), 1.8);
    s += L(o.rimD || (run ? 'M36,40 L42,30 L48,40 L56,30 L60,40 L70,34 L72,44 L82,42' : 'M50,38 L55,24 L62,34 L70,24 L74,36 L84,30 L84,42 L94,42'), rim, 1.1, 0.8);
    var hx = o.hx != null ? o.hx : (run ? 24 : 34), hy = o.hy != null ? o.hy : (run ? 50 : 44);
    s += wolfHead(c, hx, hy, { fur: f, mane: f2, eye: o.eye, glow: o.glowEye, scar: o.scar, notch: o.notch, rim: rim });
    if (o.headX) s += o.headX(c, hx, hy);
    if (o.wNear) s += o.wNear(c, near[2]);
    s += limb(pd(near.slice(0, 2)), f, aw) + limb(pd(near.slice(1)), f, aw - 2) + L(pd([[near[0][0] - 1, near[0][1] - 3], [near[1][0] - 1, near[1][1] - 3]]), rim, 1, 0.5);
    s += o.nearHand ? o.nearHand(c, near[2]) : clawHand(c, near[2], o.nearAng == null ? -2.7 : o.nearAng, f);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- skeletons ----
  var BONE = '#ddd6be';
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
    s += boneLimb(far, 3.6, bf);
    if (o.wFar) s += o.wFar(c, far[2]);
    s += C(far[2][0], far[2][1], 3.4, c.cel(bf), 1.6);
    s += boneLimb([[68, 86], [72, 103], [72, 117]], 4, bf) + boneFoot(73, 121, c.cel(bf));
    // chest cavity, spine, ribs, pelvis
    s += F('M46,50 C50,44 70,44 72,50 L70,74 C64,80 52,80 48,74 Z', '#0a0c12', 0.55);
    s += L('M64,44 C68,58 62,72 64,86', OL, 7) + L('M64,44 C68,58 62,72 64,86', bf, 3.6);
    for (var i = 0; i < 4; i++) { var ry = 52 + i * 6.4, w = 19 - i * 1.6, rd = 'M' + pt([66, ry]) + 'C' + pt([62 - w * 0.2, ry - 4]) + ' ' + pt([66 - w, ry - 2]) + ' ' + pt([67 - w, ry + 4]); s += L(rd, OL, 5.6) + L(rd, b, 2.8); }
    s += L('M48,52 L49,74', OL, 5) + L('M48,52 L49,74', b, 2.4) + L('M52,48 C56,45 66,45 70,48', OL, 5.6) + L('M52,48 C56,45 66,45 70,48', b, 3);
    if (o.cloth) s += o.cloth(c);
    s += P('M52,82 C56,77 72,77 76,82 L74,90 L66,88 L62,93 L54,90 Z', c.cel(b), 1.8) + C(60, 86, 2, OL, 0, 0.8);
    s += boneLimb([[57, 88], [53, 104], [52, 117]], 4, b) + boneFoot(52, 121, c.cel(b));
    if (o.front) s += o.front(c);
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
  // rusty sword (blade with rust blotches)
  function rustSword(c, p, len, ang) {
    var q = dirQ(p, ang), o = sword(p, len, ang, '#a8987e', 1);
    return o + C(q(len * 0.45, 0.5)[0], q(len * 0.45, 0.5)[1], 1.8, '#8a4a22', 0, 0.9) + C(q(len * 0.7, -1)[0], q(len * 0.7, -1)[1], 1.4, '#8a4a22', 0, 0.9) + C(q(len * 0.3, -1)[0], q(len * 0.3, -1)[1], 1.2, '#7a3e1c', 0, 0.9) + P(pd([q(len * 0.58, 2.6), q(len * 0.62, 1), q(len * 0.66, 2.6)], true), '#1a1c28', 0);
  }
  // dented round shield, front view
  function dentShield(c, x, y, r, col) {
    col = col || '#6e727c';
    var a = [];
    for (var i = 0; i < 14; i++) { var t = i / 14 * 2 * PI, k = (i === 3 || i === 9) ? 0.84 : 1; a.push([x + Math.cos(t) * r * k, y + Math.sin(t) * r * 1.05 * k]); }
    var d = sm(a, true);
    return body(c, d, col, L(ring(x, y, r * 0.78, r * 0.82), dk(col, 0.35), 1.6) + E(x + r * 0.35, y - r * 0.2, r * 0.22, r * 0.14, dk(col, 0.4), 0, 0.8) + E(x - r * 0.3, y + r * 0.45, r * 0.18, r * 0.12, dk(col, 0.4), 0, 0.8) +
      E(x - r * 0.45, y - r * 0.3, r * 0.2, r * 0.26, '#8a4a22', 0, 0.8) + E(x + r * 0.2, y + r * 0.55, r * 0.26, r * 0.16, '#8a4a22', 0, 0.7) + L('M' + pt([x - r * 0.6, y + r * 0.1]) + 'l' + n(r * 0.5) + ',' + n(-r * 0.3) + ' M' + pt([x + r * 0.1, y + r * 0.3]) + 'l' + n(r * 0.4) + ',' + n(r * 0.2), '#d0d4dc', 1, 0.7) +
      E(x - r * 0.35, y - r * 0.5, r * 0.3, r * 0.14, '#ffffff', 0, 0.2), 2.2) + C(x, y, r * 0.24, c.cel('#8a8e96'), 1.6);
  }
  // two-handed greatsword with a ghostly edge
  function greatSword(c, p, len, ang, w) {
    var q = dirQ(p, ang); w = w || 5;
    var blade = pd([q(10, -w), q(len - 8, -w * 0.9), q(len, 0), q(len - 8, w * 0.9), q(10, w)], true);
    var o = P(pd([q(len * 0.2, -w * 3.4), q(len, 0), q(len * 0.2, w * 3.4)], true), glow(c, '#60c0ff', 0.4));
    o += P(blade, c.lg([[0, '#b8c8d8'], [0.5, '#8a96a6'], [0.51, '#6a7686'], [1, '#4a5666']]), 2) + L('M' + pt(q(14, 0)) + 'L' + pt(q(len - 10, 0)), '#dff4ff', 1.2, 0.8) + L('M' + pt(q(16, -w + 1)) + 'L' + pt(q(len - 10, -w * 0.8 + 1)), '#9ad8ff', 1, 0.8);
    o += C(q(len * 0.4, w * 0.6)[0], q(len * 0.4, w * 0.6)[1], 1.6, '#7a4a2a', 0, 0.8) + C(q(len * 0.62, -w * 0.4)[0], q(len * 0.62, -w * 0.4)[1], 1.3, '#7a4a2a', 0, 0.8);
    o += P(pd([q(7, -w * 3.2), q(11, -w * 3.4), q(11, w * 3.4), q(7, w * 3.2)], true), c.cel('#5a5e68'), 1.6) + limb('M' + pt(q(-12, 0)) + 'L' + pt(q(7, 0)), '#3a2e2a', 3.4) + C(q(-13, 0)[0], q(-13, 0)[1], 3, c.cel('#5a5e68'), 1.2);
    return o;
  }
  // hood of rotted cloth around a skull (x, y = skull centre)
  function ragHood(c, x, y, col) {
    var d = 'M' + pt([x - 13, y + 4]) + 'C' + pt([x - 16, y - 14]) + ' ' + pt([x - 2, y - 24]) + ' ' + pt([x + 10, y - 20]) + 'C' + pt([x + 20, y - 14]) + ' ' + pt([x + 22, y + 4]) + ' ' + pt([x + 18, y + 16]) + 'L' + pt([x + 14, y + 12]) + 'L' + pt([x + 10, y + 18]) + 'L' + pt([x + 7, y + 10]) + 'C' + pt([x + 7, y - 2]) + ' ' + pt([x + 2, y - 12]) + ' ' + pt([x - 4, y - 12]) + 'C' + pt([x - 9, y - 11]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 13, y + 4]) + 'Z';
    return body(c, d, col, F(pd([[x + 6, y - 26], [x + 26, y - 26], [x + 26, y + 20], [x + 8, y + 20]], true), dk(col, 0.35), 0.8), 2) + L('M' + pt([x - 13, y + 3]) + 'C' + pt([x - 15, y - 12]) + ' ' + pt([x - 2, y - 22]) + ' ' + pt([x + 8, y - 20]), RIM, 1, 0.6);
  }

  // ---- ghoul (hunched, long-clawed, rotten green) ----
  function ghoulHead(c, x, y, o) {
    var sk = o.skin, s = '';
    // long pointed ear swept back
    s += P(pd([[x + 4, y - 5], [x + 20, y - 14], [x + 10, y + 3]], true), c.cel(dk(sk, 0.1)), 1.6) + F(pd([[x + 7, y - 4], [x + 16, y - 11], [x + 10, y], [x + 8, y]], true), '#5a3a3a', 0.7);
    // hanging lower jaw
    s += P('M' + pt([x - 11, y + 5]) + 'L' + pt([x - 13, y + 16]) + 'C' + pt([x - 8, y + 19]) + ' ' + pt([x, y + 18]) + ' ' + pt([x + 4, y + 13]) + 'L' + pt([x + 5, y + 5]) + 'Z', c.cel(dk(sk, 0.1)), 1.6);
    s += F(pd([[x - 10, y + 5], [x + 3, y + 5], [x + 2, y + 12], [x - 10, y + 14]], true), '#2a0e12');
    s += P(pd([[x - 11, y + 14.6], [x - 10, y + 10.4], [x - 8.4, y + 14.2]], true), '#e8e0c4', 0.8) + P(pd([[x - 6, y + 14], [x - 5, y + 10], [x - 3.4, y + 13.6]], true), '#e8e0c4', 0.8) + P(pd([[x - 1, y + 13], [x, y + 9.6], [x + 1.4, y + 12.6]], true), '#e8e0c4', 0.8);
    // gaunt skull-like head: high brow, sunken cheek, bony nose
    var d = 'M' + pt([x + 9, y - 3]) + 'C' + pt([x + 10, y - 14]) + ' ' + pt([x - 3, y - 17]) + ' ' + pt([x - 9, y - 11]) + 'C' + pt([x - 12, y - 8]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 12, y - 1]) + 'L' + pt([x - 15, y + 2]) + 'L' + pt([x - 11, y + 4]) + 'L' + pt([x - 11, y + 6]) + 'L' + pt([x + 5, y + 6]) + 'C' + pt([x + 8, y + 4]) + ' ' + pt([x + 9, y + 1]) + ' ' + pt([x + 9, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 1, y - 18], [x + 14, y - 18], [x + 14, y + 8], [x + 2, y + 8]], true), dk(sk, 0.3), 0.8) + F('M' + pt([x - 8, y + 1]) + 'C' + pt([x - 5, y + 4]) + ' ' + pt([x, y + 4]) + ' ' + pt([x + 2, y]) + 'L' + pt([x + 2, y + 6]) + 'L' + pt([x - 9, y + 6]) + 'Z', dk(sk, 0.3), 0.7), 2);
    s += P(pd([[x - 11, y + 5.6], [x - 10, y + 9], [x - 8.6, y + 5.8]], true), '#e8e0c4', 0.8) + P(pd([[x - 6.6, y + 5.8], [x - 5.6, y + 9.4], [x - 4.2, y + 6]], true), '#e8e0c4', 0.8) + P(pd([[x - 2.4, y + 5.9], [x - 1.4, y + 9], [x, y + 6]], true), '#e8e0c4', 0.8);
    s += L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 1, y - 8]), OL, 2.2);
    s += E(x - 6, y - 3, 3.2, 2.6, '#10140c') + glowEye(c, x - 6, y - 3, 1.5, o.eye || '#d8ff50');
    s += L('M' + pt([x + 4, y - 14]) + 'C' + pt([x + 10, y - 10]) + ' ' + pt([x + 12, y]) + ' ' + pt([x + 10, y + 8]) + 'M' + pt([x, y - 15]) + 'C' + pt([x + 6, y - 12]) + ' ' + pt([x + 6, y - 2]) + ' ' + pt([x + 5, y + 4]), '#2a2a22', 1.1);
    s += L('M' + pt([x - 12, y - 4]) + 'C' + pt([x - 11, y - 12]) + ' ' + pt([x - 2, y - 16]) + ' ' + pt([x + 6, y - 13]), RIM, 1, 0.6);
    return s;
  }
  function ghoul(c, o) {
    var sk = o.skin, sk2 = dk(sk, 0.2), s = shadow(c, 62, o.shadowR || 40);
    s += limb('M70,62 L80,82 L70,98', sk2, 7) + clawHand(c, [70, 98], 2.0, sk2, 13, 4.4);
    s += limb('M76,86 L88,98 L82,112', sk2, 8.5) + wolfFoot(c, [82, 112], [74, 121], sk2);
    var td = 'M34,64 C38,46 72,40 90,58 C98,68 96,84 86,92 L62,94 C50,88 40,78 34,64 Z';
    var rib = 'M52,70 q6,4 12,2 M50,76 q7,4 14,2 M52,82 q6,3 12,1';
    s += body(c, td, sk, F('M76,40 L104,40 L104,98 L80,98 C90,80 88,58 76,40 Z', dk(sk, 0.3), 0.8) + L(rib, dk(sk, 0.4), 1.4) + E(78, 66, 5, 3.4, '#6a3a44', 0, 0.9) + E(78, 66, 2.6, 1.6, '#3a1a20') + E(60, 58, 4, 2.4, dk(sk, 0.28), 0, 0.8) + F('M36,66 C42,62 50,66 52,76 C48,82 42,82 38,76 Z', lt(sk, 0.15), 0.6));
    s += [[46, 47], [54, 43], [62, 41.5], [70, 42.5], [78, 46], [85, 51]].map(function (v) { return C(v[0], v[1], 2.3, c.cel('#b8b498'), 1.1); }).join('') + L('M40,52 C52,42 72,40 88,54', RIM, 1.1, 0.6);
    s += body(c, 'M60,88 L88,86 L88,96' + rag(88, 58, 100, 7, 17).replace(/^L/, ' L') + ' Z', o.rag || '#4a4436', '', 1.6);
    s += limb('M62,90 L48,102 L56,113', sk, 9) + wolfFoot(c, [56, 113], [46, 121], sk);
    s += ghoulHead(c, 28, 62, o);
    s += limb('M46,64 L36,84 L26,100', sk, 8) + clawHand(c, [26, 100], 2.2, sk, 14, 4.8) + L('M44,62 L34,82', RIM, 1, 0.5);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- zombie head (slack jaw, sunken eye, patchy hair) ----
  function zombieHead(c, x, y, o) {
    var sk = o.skin, s = '';
    s += P('M' + pt([x - 9, y + 5]) + 'L' + pt([x - 10, y + 14]) + 'C' + pt([x - 4, y + 16]) + ' ' + pt([x + 2, y + 14]) + ' ' + pt([x + 5, y + 8]) + 'Z', c.cel(dk(sk, 0.1)), 1.6) + F(pd([[x - 9, y + 6], [x + 2, y + 7], [x - 1, y + 12], [x - 8, y + 12]], true), '#2a1418');
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 8, y + 9]) + ' ' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 7]) + 'L' + pt([x - 10, y + 5]) + 'L' + pt([x - 12, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 10]) + 'L' + pt([x + 1, y + 10]) + 'C' + pt([x + 6, y + 4]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.25), 0.8) + E(x + 4, y + 2, 3, 2, '#6a4a6a', 0, 0.6), 2);
    s += E(x - 5, y - 2, 3, 2.6, '#1a1418') + glowEye(c, x - 5, y - 2, 1.3, o.eye || '#e8ff70') + E(x + 2, y - 2.6, 1.6, 1.4, '#2a2020');
    s += L('M' + pt([x - 9, y - 6]) + 'L' + pt([x - 2, y - 5]), OL, 1.6);
    s += P('M' + pt([x - 8, y - 9]) + 'C' + pt([x - 6, y - 16]) + ' ' + pt([x + 6, y - 17]) + ' ' + pt([x + 10, y - 8]) + 'L' + pt([x + 6, y - 11]) + 'L' + pt([x + 3, y - 8]) + 'L' + pt([x, y - 12]) + 'L' + pt([x - 3, y - 9]) + 'Z', c.cel('#3a3430'), 1.4);
    s += L('M' + pt([x - 10, y - 4]) + 'C' + pt([x - 9, y - 12]) + ' ' + pt([x - 2, y - 15]) + ' ' + pt([x + 4, y - 15]), RIM, 1, 0.6);
    return s;
  }

  // ---- spider rig (facing left): thin or thick legs, abdomen marking hook, venom ----
  function spiderArt(c, o) {
    var col = o.col, leg = o.leg || col, legF = dk(leg, 0.3), lw = o.legW || 3, s = shadow(c, 64, o.shadowR || 54), rim = o.rim || RIM;
    var tk = o.tuck || 1, tuck = function (L2) { return L2.map(function (l) { return [l[0], [64 + (l[1][0] - 64) * (1 - (1 - tk) * 0.5), l[1][1]], [64 + (l[2][0] - 64) * tk, l[2][1]]]; }); };
    var farL = tuck([[[44, 84], [28, 58], [14, 118]], [[50, 84], [44, 56], [40, 120]], [[58, 84], [78, 54], [90, 120]], [[60, 82], [102, 52], [122, 116]]]);
    farL.forEach(function (l) { s += limb(pd(l), legF, lw) + C(l[1][0], l[1][1], lw * 0.7 + 1, c.cel(legF), 1); });
    var ab = o.abD || 'M58,76 C56,54 80,42 100,46 C120,52 126,72 120,90 C114,104 94,106 80,102 C66,98 58,90 58,76 Z';
    s += body(c, ab, col, F('M60,94 C80,108 106,106 122,92 L124,112 L58,112 Z', dk(col, 0.38), 0.85) + E(86, 58, 11, 4.5, lt(col, 0.22), 0, 0.6) + (o.mark ? o.mark(c) : ''), 2.4);
    s += L('M62,66 C68,52 88,44 104,48 C114,51 120,58 122,66', rim, 1.3, 0.7);
    var ce = 'M34,84 C34,70 48,66 58,70 C68,74 68,90 60,96 C48,102 34,98 34,84 Z';
    s += body(c, ce, dk(col, 0.06), F('M32,92 C44,100 58,100 68,92 L68,106 L32,106 Z', dk(col, 0.38), 0.8) + E(50, 76, 7, 3, lt(col, 0.22), 0, 0.6), 2.2) + L('M38,76 C44,69 52,68 58,71', rim, 1, 0.6);
    var nearL = tuck([[[46, 94], [18, 68], [2, 120]], [[50, 96], [34, 70], [24, 122]], [[56, 96], [70, 68], [76, 122]], [[62, 94], [98, 64], [110, 120]]]);
    nearL.forEach(function (l) { s += limb(pd(l), leg, lw + 1) + L(pd([[l[1][0] - 0.8, l[1][1] - 1.4], [l[0][0] - 0.8, l[0][1] - 1.4]]), rim, 0.9, 0.5) + C(l[1][0], l[1][1], lw * 0.7 + 1.6, c.cel(o.knee || leg), 1.2) + (o.bands ? L(pd([[l[1][0] + (l[2][0] - l[1][0]) * 0.12, l[1][1] + (l[2][1] - l[1][1]) * 0.12], [l[1][0] + (l[2][0] - l[1][0]) * 0.26, l[1][1] + (l[2][1] - l[1][1]) * 0.26]]), o.bands, lw + 0.6) : ''); });
    s += limb('M34,94 L24,98 L22,106', dk(col, 0.1), lw + 0.6) + limb('M40,96 L32,104 L32,110', dk(col, 0.1), lw + 0.6);
    s += E(36, 88, 9, 8, c.cel(dk(col, 0.1)), 2) + E(34, 84, 3.4, 2, lt(col, 0.25), 0, 0.6);
    var eye = o.eye || '#ff5040';
    s += glowEye(c, 31, 85, 1.7, eye) + glowEye(c, 37, 82, 1.4, eye) + C(35, 88, 1, eye) + C(29, 89, 0.9, eye);
    var fang = o.fang || '#2a1a12';
    s += P('M28,94 C24,98 25,104 29,106 C29,102 31,98 33,96 Z', fang, 1.3) + P('M36,96 C34,100 35,105 38,107 C38,103 39,100 40,98 Z', fang, 1.3);
    if (o.venom) s += C(30, 108, 8, glow(c, o.venom, 0.7)) + P('M29,106 C27,110 28,114 30,114 C32,114 32,110 29,106 Z', o.venom, 1) + C(38, 110, 1.6, o.venom, 0.8) + E(24, 121, 6, 1.4, o.venom, 0, 0.6);
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- ogre gear ----
  function whip(c, p) {
    var lash = 'M' + pt(p) + 'C' + pt([p[0] + 4, p[1] - 28]) + ' ' + pt([p[0] - 18, p[1] - 42]) + ' ' + pt([p[0] - 16, p[1] - 16]) + 'C' + pt([p[0] - 14, p[1]]) + ' ' + pt([p[0] - 6, p[1] + 8]) + ' ' + pt([p[0] - 12, p[1] + 30]);
    var e = [p[0] - 12, p[1] + 30];
    return L(lash, OL, 4.8) + L(lash, '#5a3a22', 2.6) + L(lash, '#8a6a44', 0.8, 0.7) + L('M' + pt(e) + 'l-4,4 M' + pt(e) + 'l1,6 M' + pt(e) + 'l4,3', '#e8d0a0', 1.3) + haft(c, p, 12, -1.6, '#3a2a1a', 3.8, 2);
  }
  function spikedPauldron(c, x, y, r, col) {
    var o = '';
    [[-0.9, -1.1], [-0.3, -1.45], [0.35, -1.45], [0.9, -1.1]].forEach(function (k) { o += P(pd([[x + k[0] * r - 3, y - r * 0.4], [x + k[0] * r * 1.15, y + k[1] * r], [x + k[0] * r + 3, y - r * 0.4]], true), c.cel('#c8c4bc'), 1.2); });
    return o + body(c, 'M' + pt([x - r, y + r * 0.45]) + 'C' + pt([x - r * 1.05, y - r * 0.85]) + ' ' + pt([x + r * 1.05, y - r * 0.85]) + ' ' + pt([x + r, y + r * 0.45]) + 'Z', col, L('M' + pt([x - r * 0.8, y + r * 0.1]) + 'C' + pt([x - r * 0.6, y - r * 0.5]) + ' ' + pt([x + r * 0.6, y - r * 0.5]) + ' ' + pt([x + r * 0.8, y + r * 0.1]), dk(col, 0.4), 1.6) + C(x - r * 0.4, y - r * 0.1, 1.4, '#c8c4bc') + C(x + r * 0.4, y - r * 0.1, 1.4, '#c8c4bc') + F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), dk(col, 0.35), 0.7), 2);
  }
  // crude stitch marks along a path
  function stitchLine(pts, col) {
    var d = '', x = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.max(1, Math.round(l / 5)), px = -dy / l * 3, py = dx / l * 3;
      d += 'M' + pt(a) + 'L' + pt(b);
      for (var j = 0; j <= k; j++) { var t = j / k, cx = a[0] + dx * t, cy = a[1] + dy * t; x += 'M' + pt([cx - px, cy - py]) + 'L' + pt([cx + px, cy + py]); }
    }
    return L(d, dk(col || '#3a2a2a', 0.1), 1.2) + L(x, col || '#2a1e1e', 1.2);
  }
  function ooze(c, x, y, len, s) {
    s = s || 1;
    return P('M' + pt([x - 3 * s, y]) + 'C' + pt([x - 3 * s, y + len * 0.6]) + ' ' + pt([x - 4 * s, y + len]) + ' ' + pt([x, y + len]) + 'C' + pt([x + 4 * s, y + len]) + ' ' + pt([x + 3 * s, y + len * 0.6]) + ' ' + pt([x + 3 * s, y]) + 'Z', c.cel('#8ae040'), 1.2) + C(x - 1 * s, y + len * 0.7, 0.9 * s, '#e0ffb0');
  }
  function hook(c, p, chainEnd) {
    var d = 'M' + pt(p) + 'Q' + pt([p[0] + 6, (p[1] + chainEnd[1]) / 2]) + ' ' + pt(chainEnd);
    var h = chainEnd, hd = 'M' + pt([h[0], h[1]]) + 'L' + pt([h[0], h[1] + 8]) + 'C' + pt([h[0], h[1] + 18]) + ' ' + pt([h[0] - 14, h[1] + 18]) + ' ' + pt([h[0] - 12, h[1] + 8]);
    return L(d, OL, 5) + '<path d="' + d + '" fill="none" stroke="#8a8e96" stroke-width="2.8" stroke-dasharray="3.6 2"/>' + L(hd, OL, 6.4) + L(hd, '#9a9ea8', 3.6) + L(hd, '#e0e4ec', 1, 0.7) + P(pd([[h[0] - 12, h[1] + 8], [h[0] - 15, h[1] + 3], [h[0] - 9, h[1] + 6]], true), '#9a9ea8', 1.2);
  }
  function bigCleaver(c, p, len, ang, bw) {
    var q = dirQ(p, ang), o = haft(c, p, len * 0.45, ang, '#4a3222', 4, 6);
    var d = pd([q(len * 0.32, -1.5), q(len, -1.5), q(len + 2, -bw * 0.5), q(len - 1, -bw), q(len * 0.3, -bw * 0.94)], true);
    return o + P(d, c.cel('#9aa0a8'), 2) + L('M' + pt(q(len * 0.34, -bw * 0.9)) + 'L' + pt(q(len - 1, -bw * 0.96)), '#e8ecf0', 1.2, 0.7) + C(q(len * 0.82, -bw * 0.3)[0], q(len * 0.82, -bw * 0.3)[1], 1.8, OL) + E(q(len * 0.55, -bw * 0.6)[0], q(len * 0.55, -bw * 0.6)[1], 3, 2, '#6a2a22', 0, 0.7);
  }
  function stitchHead(c, x, y, sk) {
    var s = E(x + 11, y + 1, 3.4, 4.4, c.cel(dk(sk, 0.08)), 1.6);
    var d = 'M' + pt([x - 13, y]) + 'C' + pt([x - 13, y - 14]) + ' ' + pt([x + 10, y - 16]) + ' ' + pt([x + 12, y - 2]) + 'L' + pt([x + 12, y + 7]) + 'C' + pt([x + 6, y + 14]) + ' ' + pt([x - 8, y + 14]) + ' ' + pt([x - 15, y + 8]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 18], [x + 16, y - 18], [x + 16, y + 16], [x + 3, y + 16]], true), dk(sk, 0.28), 0.8) + F('M' + pt([x - 14, y - 16]) + 'L' + pt([x, y - 16]) + 'L' + pt([x - 2, y - 4]) + 'L' + pt([x - 14, y - 2]) + 'Z', '#8e9ea4', 0.8), 2.2);
    s += stitchLine([[x - 12, y - 3], [x - 2, y - 5], [x, y - 15]]);
    s += glowEye(c, x - 8, y - 1, 2, '#d8ff50') + C(x - 1, y - 1.5, 1.4, '#e8e0a0', 1);
    s += P('M' + pt([x - 15, y + 5]) + 'C' + pt([x - 10, y + 9]) + ' ' + pt([x - 2, y + 9]) + ' ' + pt([x + 3, y + 6]) + 'L' + pt([x + 2, y + 11]) + 'C' + pt([x - 4, y + 14]) + ' ' + pt([x - 12, y + 13]) + ' ' + pt([x - 15, y + 9]) + 'Z', c.cel(lt(sk, 0.05)), 1.4);
    s += P(pd([[x - 13, y + 6], [x - 12.4, y + 1.4], [x - 10.6, y + 6]], true), '#f0e8cc', 1) + P(pd([[x - 5, y + 6.6], [x - 4, y + 2.4], [x - 2.6, y + 6.4]], true), '#f0e8cc', 1);
    s += L('M' + pt([x - 12, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 2, y - 15]) + ' ' + pt([x + 8, y - 11]), RIM, 1, 0.6);
    return s;
  }

  // ============================================================
  //  MOBS (128x128, facing left, feet on y=122)
  // ============================================================
  var MOBS = {
    // ---- the Gloomfang worgen ----
    nightbane_worgen: function (c) {
      return worgen(c, { fur: '#7c6e5e', mane: '#4a4036', pants: '#4a5270', seed: 11 });
    },
    nightbane_shadow_weaver: function (c) {
      var pur = '#a860ff', robe = '#30243e', trim = '#8a60c8';
      return worgen(c, {
        fur: '#5e5868', mane: '#302c3a', glowEye: '#d098ff', seed: 13,
        chest: function (c) { return F('M28,62 L50,58 L60,74 L72,52 L104,50 L104,100 L28,100 Z', robe) + L('M50,58 L60,74 L72,52', trim, 1.6) + L('M36,86 L96,84', '#6a5a3a', 2.4) + F('M80,52 L104,52 L104,100 L84,100 Z', '#140c1c', 0.5); },
        front: function (c) { return body(c, 'M50,80 L92,78 L98,110' + rag(98, 44, 114, 8, 31).replace(/^L/, ' L') + ' L44,110 Z', robe, L('M50,90 L94,88', trim, 1.4) + F('M76,78 L100,78 L100,116 L80,116 Z', '#140c1c', 0.5) + F('M58,96 L64,94 L62,104 Z', '#0a0610', 0.9), 1.8) + L('M50,82 L92,80', OL, 2) + L('M50,82 L92,80', '#8a7a4a', 1.2); },
        far: [[80, 50], [94, 46], [98, 32]],
        farHand: function (c, p) { return C(p[0], p[1] - 10, 16, glow(c, pur, 0.75)) + swirl(c, p[0], p[1] - 11, 7, '#d0a0ff') + clawHand(c, p, -1.6, '#4a4654', 7); },
        near: [[46, 54], [32, 64], [22, 58]],
        nearHand: function (c, p) { return handFire(c, [p[0] - 2, p[1] - 5], '#9a40ff', '#f0d8ff', 1.1) + clawHand(c, p, -2.8, '#5e5868', 7); },
        top: function (c) { return limb('M46,54 L36,62', robe, 12) + P('M30,58 L36,68 L38,62 L42,68 L42,58 Z', c.cel(robe), 1.4) + C(92, 20, 2, '#d0a0ff', 0, 0.8) + C(104, 30, 1.4, '#d0a0ff', 0, 0.7); }
      });
    },
    nightbane_dark_runner: function (c) {
      return worgen(c, {
        fur: '#30303c', mane: '#18181f', pants: '#3e3450', pose: 'run', glowEye: '#ff6040', rim: '#b0c2f4', armW: 10, legW: 12, shadowR: 40, seed: 15,
        far: [[74, 52], [88, 62], [102, 58]], farAng: -0.2,
        near: [[40, 58], [26, 70], [12, 76]], nearAng: -2.9,
        back: function () { return L('M96,72 l20,0 M100,82 l18,0 M94,92 l22,0 M104,62 l12,0', RIM, 1.6, 0.55); }
      });
    },
    nightbane_vile_fang: function (c) {
      return worgen(c, {
        fur: '#5e4a3c', mane: '#2c2018', pants: '#3a3432', glowEye: '#ffe040', scar: true, notch: true, armW: 13, legW: 15, shadowR: 40, seed: 17,
        chest: function () { return L('M42,60 L58,74 M46,56 L62,70 M70,58 L78,72', '#e0a098', 1.6) + L('M42,60 L58,74 M46,56 L62,70', '#7a3a34', 0.6); },
        far: [[80, 50], [96, 54], [104, 40]], near: [[46, 54], [28, 62], [14, 54]],
        top: function () { return L('M32,62 L40,70', '#e0a098', 1.4); },
        tf: at(1.12, 64, 122)
      });
    },
    // ---- spiders ----
    green_recluse: function (c) {
      return spiderArt(c, {
        col: '#9ab86e', leg: '#86a45e', legW: 2.2, eye: '#ff4a3a', fang: '#3a4a22', scale: 0.84,
        mark: function () { return L('M76,58 Q92,52 110,58 M72,72 Q92,64 116,72 M72,86 Q94,80 116,86', '#6a8a48', 1.8, 0.8) + E(96, 64, 4, 2.4, '#d8e8a8', 0, 0.6); }
      });
    },
    venom_web_spider: function (c) {
      return spiderArt(c, {
        col: '#34323c', leg: '#3a3844', legW: 3.4, knee: '#4a4a56', eye: '#a0ff50', fang: '#1a1a20', venom: '#8aff40', scale: 1.02, tuck: 0.9, bands: '#6a8a3a',
        mark: function (c) { return C(94, 66, 18, glow(c, '#8aff40', 0.35)) + E(86, 62, 4, 3, '#8aff40', 1) + E(100, 70, 4.4, 3.2, '#8aff40', 1) + E(90, 80, 3.4, 2.6, '#8aff40', 1) + E(106, 58, 3, 2.2, '#8aff40', 1); }
      });
    },
    naraxis: function (c) {
      return spiderArt(c, {
        col: '#1e1c24', leg: '#24222a', legW: 4.2, knee: '#3a3844', eye: '#ff3a3a', fang: '#6a1a1a', scale: 1.12, tuck: 0.8, rim: '#b8c8f8', shadowR: 56,
        abD: 'M56,76 C54,48 82,34 102,40 C124,46 128,72 122,92 C116,106 94,108 78,104 C62,100 56,90 56,76 Z',
        mark: function (c) { return C(96, 58, 16, glow(c, '#ff2a2a', 0.4)) + P('M88,46 L104,46 L98,58 L104,70 L88,70 L94,58 Z', c.cel('#e0241e'), 1.6) + E(78, 84, 3, 2, '#e0241e', 0, 0.8) + E(110, 86, 2.6, 1.8, '#e0241e', 0, 0.8); }
      });
    },
    // ---- undead ----
    skeletal_warrior: function (c) {
      return skeleton(c, {
        eye: '#6ad4ff',
        cloth: function (c) { return body(c, 'M50,80 L78,80 L78,86 L50,86 Z', '#4a3a2a', '', 1.6) + P('M52,86 L62,86 L60,100 L56,96 L53,102 Z', c.cel('#5a4a3a'), 1.4) + P('M66,86 L76,86 L76,98 L71,94 L68,99 Z', c.cel('#4a3c2e'), 1.4) + R(60, 79, 6, 8, c.cel('#8a6a3a'), 1.2); },
        headX: function (c, x, y) { return P('M' + pt([x - 12, y - 5]) + 'C' + pt([x - 12, y - 19]) + ' ' + pt([x + 10, y - 21]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 8, y - 7]) + 'C' + pt([x + 4, y - 11]) + ' ' + pt([x - 6, y - 11]) + ' ' + pt([x - 12, y - 5]) + 'Z', c.cel('#7a7068'), 1.8) + E(x + 2, y - 14, 3, 1.6, '#8a4a22', 0, 0.9) + L('M' + pt([x - 2, y - 18]) + 'l2,4', OL, 1); },
        far: [[72, 52], [86, 48], [88, 36]], wFar: function (c, p) { return rustSword(c, p, 30, -2.3); },
        near: [[52, 52], [46, 66], [40, 76]], wNearFront: function (c) { return dentShield(c, 34, 80, 15); }
      });
    },
    skeletal_mage: function (c) {
      var robe = '#26343e', trim = '#4ac0a8', mag = '#30e0b0';
      return skeleton(c, {
        eye: '#5affd0',
        front: function (c) { return body(c, 'M46,50 C52,42 70,42 76,48 L80,80 L88,112' + rag(88, 40, 116, 9, 41).replace(/^L/, ' L') + ' L40,112 L46,80 Z', robe, L('M52,48 L60,70 L70,46', trim, 1.4) + F('M68,40 L96,40 L96,118 L74,118 C80,90 76,60 68,40 Z', '#0c1218', 0.5) + P('M52,86 C56,82 62,84 62,92 C60,98 54,98 52,92 Z', '#0a0c10', 1) + L('M53,88 q4,2 8,0 M53,92 q4,2 8,0', BONE, 1.2) + L('M44,82 L80,80', '#5a4a3a', 2.2), 1.8); },
        headX: function (c, x, y) { return ragHood(c, x + 1, y - 1, robe); },
        far: [[72, 52], [86, 46], [90, 34]],
        wFar: function (c, p) { return C(p[0], p[1] - 8, 16, glow(c, mag, 0.7)) + swirl(c, p[0], p[1] - 9, 6, '#a0ffe0'); },
        near: [[52, 52], [42, 62], [30, 60]],
        wNearFront: function (c, p) { return handFire(c, [p[0] - 1, p[1] - 5], mag, '#e0fff4', 1.05) + C(p[0], p[1], 3.6, c.cel(BONE), 1.6); },
        top: function (c) { return limb('M52,52 L45,59', robe, 11) + P('M40,56 L44,66 L46,60 L50,64 L50,54 Z', c.cel(robe), 1.3); }
      });
    },
    mor_ladim: function (c) {
      var pl = '#5c606c', rust = '#8a5230';
      return skeleton(c, {
        eye: '#7ad8ff', shadowR: 36,
        back: function (c) { return C(64, 66, 64, glow(c, '#58b0ff', 0.5)) + body(c, 'M58,44 L88,48 L100,112' + rag(100, 62, 118, 9, 51).replace(/^L/, ' L') + ' L60,108 Z', '#262a36', F('M80,46 L104,46 L104,120 L86,120 Z', '#10121a', 0.6), 1.8) + L('M88,50 L98,108', RIM, 1, 0.5); },
        cloth: function (c) { return body(c, 'M44,48 C50,40 72,40 76,48 L74,74 C66,82 52,82 46,74 Z', pl, E(66, 62, 5, 4, rust, 0, 0.9) + E(52, 70, 3, 2.4, rust, 0, 0.9) + P('M54,54 C58,52 62,54 62,60 C60,64 56,64 54,60 Z', '#0a0c12', 1) + L('M55,56 q3,1.4 6,0 M55,59 q3,1.4 6,0', BONE, 1) + F('M64,40 L80,40 L80,82 L66,82 Z', dk(pl, 0.35), 0.8) + L('M50,48 L70,46', '#aab4c4', 1.2, 0.8), 2) + body(c, 'M48,76 L74,76 L78,92 L66,90 L62,96 L50,92 Z', dk(pl, 0.1), E(56, 84, 3, 2, rust, 0, 0.8), 1.8); },
        front: function (c) { return P('M48,100 L58,100 L57,114 L49,114 Z', c.cel(pl), 1.6) + E(53, 106, 2, 3, rust, 0, 0.8) + F('M40,122 C42,112 50,108 54,116 C58,108 66,112 68,122 Z', '#8ad0ff', 0.35) + F('M62,122 C64,114 72,112 76,118 C80,112 86,116 86,122 Z', '#8ad0ff', 0.3); },
        headX: function (c, x, y) { return P('M' + pt([x - 13, y - 3]) + 'C' + pt([x - 13, y - 19]) + ' ' + pt([x + 11, y - 22]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 12, y + 8]) + 'L' + pt([x + 5, y + 8]) + 'L' + pt([x + 5, y - 4]) + 'C' + pt([x, y - 9]) + ' ' + pt([x - 7, y - 9]) + ' ' + pt([x - 13, y - 3]) + 'Z', c.cel(pl), 2) + P(pd([[x - 4, y - 16], [x - 2, y - 30], [x + 2, y - 17]], true), c.cel('#9aa0aa'), 1.3) + P(pd([[x + 3, y - 18], [x + 7, y - 29], [x + 8, y - 16]], true), c.cel('#9aa0aa'), 1.3) + E(x + 6, y - 10, 3, 2, rust, 0, 0.9) + L('M' + pt([x - 12, y - 6]) + 'C' + pt([x - 8, y - 18]) + ' ' + pt([x + 4, y - 20]) + ' ' + pt([x + 10, y - 14]), RIM, 1.1, 0.7); },
        far: [[72, 52], [60, 66], [48, 78]], near: [[52, 52], [46, 68], [42, 80]],
        wNear: function (c) { return greatSword(c, [44, 80], 78, -2.02, 5); },
        top: function (c) { return spikedPauldron(c, 50, 52, 11, pl) + E(46, 52, 3, 2, rust, 0, 0.8); },
        tf: at(1.1, 64, 122)
      });
    },
    plague_spreader: function (c) {
      return ghoul(c, {
        skin: '#7c9a68', eye: '#d8ff50', rag: '#4a4436',
        top: function (c) { return C(30, 108, 12, glow(c, '#9aff50', 0.45)) + ooze(c, 24, 104, 8, 0.8) + C(56, 50, 10, glow(c, '#9aff50', 0.3)) + C(50, 44, 2, '#b0ff70', 0, 0.8) + C(60, 38, 1.4, '#b0ff70', 0, 0.7); }
      });
    },
    rotted_one: function (c) {
      var sk = '#9aa88c';
      return biped(c, {
        skin: sk, shirt: sk, pants: '#4a4858', sleeve: '#6a6452', forearm: sk, glove: sk, boots: '#3a3430', legW: 12, armW: 10, hipY: 98, shadowR: 38, neckCol: sk,
        torsoD: 'M40,50 C46,38 78,38 84,50 C98,62 100,92 86,100 L46,100 C30,92 30,62 40,50 Z',
        chest: function (c) { return E(56, 80, 18, 14, lt(sk, 0.14), 0, 0.7) + C(56, 84, 1.6, dk(sk, 0.45)) + E(70, 70, 5, 3.6, '#7a6a8a', 0, 0.75) + E(44, 88, 4, 3, '#6a5a7a', 0, 0.7) + L('M60,70 q-6,4 -4,10 M72,84 q4,4 2,8', '#5a6a7a', 1, 0.8) + F('M34,42 L92,42 L92,60' + rag(92, 34, 60, 8, 61).replace(/^L/, ' L') + ' Z', '#6a6452') + L('M40,58 L52,62', dk('#6a6452', 0.35), 1.2); },
        head: function (c, x, y) { return G(zombieHead(c, x, y, { skin: sk }), rot(-14, x, y + 8)); }, hx: 56, hy: 30,
        near: [[46, 56], [30, 58], [14, 58]], far: [[80, 56], [86, 74], [84, 90]],
        nearHand: function (c, p) { return C(p[0], p[1], 4.6, c.cel(sk), 2) + L('M' + pt([p[0] - 3, p[1] - 3]) + 'l-5,-1 M' + pt([p[0] - 4, p[1]]) + 'l-6,0 M' + pt([p[0] - 3, p[1] + 3]) + 'l-5,1', OL, 3.4) + L('M' + pt([p[0] - 3, p[1] - 3]) + 'l-5,-1 M' + pt([p[0] - 4, p[1]]) + 'l-6,0 M' + pt([p[0] - 3, p[1] + 3]) + 'l-5,1', sk, 1.8); },
        top: function (c) { return L('M40,54 L20,55', RIM, 1, 0.5) + L('M44,44 C54,38 72,38 84,46', RIM, 1.1, 0.6); },
        tf: at(1.04, 64, 122)
      });
    },
    // ---- Knotjaw ogres ----
    splinter_fist_warrior: function (c) {
      var sk = '#b48a64';
      return biped(c, {
        skin: sk, shirt: sk, pants: '#5a4a3a', sleeve: sk, glove: sk, boots: '#3a2e24', legW: 15, armW: 14, hipY: 96, shadowR: 44, neck: false, belt: '#4a3424', buckle: '#8a8e96',
        torsoD: 'M28,54 C30,34 94,30 102,52 L104,82 L96,98 L34,98 L26,82 Z',
        chest: function (c) { return F('M30,72 C40,92 90,94 102,74 L106,100 L24,100 Z', lt(sk, 0.12), 0.5) + L('M40,40 L94,90', OL, 5.4) + L('M40,40 L94,90', '#5a3e28', 3.4) + P('M50,52 L70,50 L72,68 L52,70 Z', c.cel('#7a7e86'), 1.6) + C(54, 55, 1, '#c8ccd2') + C(67, 54, 1, '#c8ccd2') + C(55, 66, 1, '#c8ccd2') + C(68, 65, 1, '#c8ccd2') + L('M60,76 l6,4', dk(sk, 0.35), 1.2); },
        front: function (c) { return body(c, 'M44,94 L74,94 L72,110 L60,106 L48,110 Z', '#6a4a30', L('M46,98 L72,98', dk('#6a4a30', 0.4), 1.2), 1.8); },
        pads: function (c) { return body(c, 'M26,54 C24,38 46,34 50,48 L46,58 L30,62 Z', '#6a4a30', L('M28,50 C32,42 42,40 48,46', dk('#6a4a30', 0.4), 1.2) + C(38, 46, 1.4, '#9a9ea6'), 1.8); },
        head: function (c, x, y) { return ogreHead(c, x, y, { skin: sk }); }, hx: 46, hy: 28,
        near: [[36, 56], [26, 50], [26, 36]], wNear: function (c, p) { return club(c, p, 38, -1.75, 8, '#7a5230') + C(dirQ(p, -1.75)(34, -5)[0], dirQ(p, -1.75)(34, -5)[1], 1.6, '#c8ccd2', 0.8) + C(dirQ(p, -1.75)(40, 4)[0], dirQ(p, -1.75)(40, 4)[1], 1.6, '#c8ccd2', 0.8); },
        far: [[94, 58], [106, 74], [104, 90]],
        nearHand: function (c, p) { return bigFist(c, p, sk, 8.5); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 8); },
        top: function () { return L('M36,40 C50,30 80,30 98,44', RIM, 1.1, 0.6); }
      });
    },
    splinter_fist_taskmaster: function (c) {
      var sk = '#9a7258';
      return biped(c, {
        skin: sk, shirt: sk, pants: '#3e3630', sleeve: sk, glove: sk, boots: '#2a221e', legW: 16, armW: 15, hipY: 96, shadowR: 46, neck: false, belt: '#2e241e', buckle: '#c8c4bc',
        torsoD: 'M26,54 C28,32 96,28 104,52 L106,84 L98,98 L32,98 L24,84 Z',
        chest: function (c) { return F('M28,72 C40,94 92,96 104,74 L108,100 L22,100 Z', lt(sk, 0.1), 0.5) + L('M34,48 C50,60 80,60 100,48', OL, 5) + L('M34,48 C50,60 80,60 100,48', '#4a3424', 3) + L('M52,70 l10,4 M74,64 l6,8', dk(sk, 0.35), 1.3); },
        front: function (c) { var m = ''; for (var i = 0; i < 5; i++) m += 'M' + (44 + i * 6) + ',96 l0,14'; return body(c, 'M40,94 L78,94 L80,112 L38,112 Z', '#6a6e78', L(m, '#4a4e58', 1.2) + L('M40,102 L80,102', '#4a4e58', 1), 1.8) + skull(c, 61, 94, 0.55); },
        head: function (c, x, y) { return ogreHead(c, x, y, { skin: sk, scar: true }) + P('M' + pt([x - 14, y - 8]) + 'C' + pt([x - 14, y - 24]) + ' ' + pt([x + 12, y - 26]) + ' ' + pt([x + 14, y - 8]) + 'Z', c.cel('#5a5e68'), 2) + P(pd([[x + 8, y - 18], [x + 22, y - 25], [x + 13, y - 12]], true), c.cel('#e8dcc0'), 1.4) + L('M' + pt([x - 14, y - 9]) + 'L' + pt([x + 14, y - 9]), '#3a3e48', 2); }, hx: 46, hy: 28,
        near: [[36, 58], [24, 68], [22, 58]], wNearFront: function (c, p) { return whip(c, p); },
        far: [[96, 58], [108, 72], [100, 86]],
        nearHand: function (c, p) { return bigFist(c, p, sk, 8.5); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 8.5); },
        top: function (c) { return spikedPauldron(c, 28, 63, 12, '#6a6e78') + L('M40,38 C54,28 84,28 100,44', RIM, 1.1, 0.6); },
        tf: at(1.05, 64, 122)
      });
    },
    // ---- Patchwork: the abomination that walks the Wraithwood road ----
    stitches: function (c) {
      var sk = '#a4b08e', p2 = '#8e9ea8', p3 = '#bca88e', s = shadow(c, 66, 58);
      // extra arm sprouting from the back
      s += limb('M90,40 L106,24 L118,28', dk(sk, 0.2), 9) + clawHand(c, [118, 28], -0.5, dk(sk, 0.2), 7, 4.6);
      // far arm swinging a meat hook on a chain
      s += limb('M98,52 L112,66 L112,80', dk(sk, 0.15), 13) + hook(c, [112, 82], [114, 100]) + bigFist(c, [112, 80], dk(sk, 0.15), 8);
      s += limb('M84,100 L88,113', dk(sk, 0.2), 16) + P('M78,114 L98,114 L98,122 L76,122 Z', c.cel('#5a5048'), 1.8);
      var bd = 'M30,58 C28,34 56,22 80,26 C104,30 116,52 114,78 C112,104 94,112 68,112 C42,112 24,100 26,82 C26,74 28,66 30,58 Z';
      var sh = F('M28,30 L66,26 L60,56 L26,62 Z', p2, 0.9) + F('M84,70 L118,64 L118,112 L90,112 Z', p3, 0.9) +
        F('M86,24 L120,24 L120,114 L94,114 C108,90 104,50 86,24 Z', dk(sk, 0.3), 0.7) +
        E(58, 88, 26, 18, lt(sk, 0.14), 0, 0.8) + E(84, 50, 5, 3, '#7a4a4a', 0, 0.8) + E(40, 72, 4, 3, '#6a5a6a', 0, 0.7);
      s += body(c, bd, sk, sh, 2.6);
      s += stitchLine([[28, 60], [60, 56], [66, 26]]) + stitchLine([[84, 70], [96, 67], [114, 64]]) + stitchLine([[84, 70], [90, 111]]);
      // the belly seam, oozing
      s += L('M34,90 C46,98 70,100 86,92', OL, 3) + stitchLine([[34, 90], [48, 96], [66, 98], [86, 92]]) + C(58, 100, 14, glow(c, '#8ae040', 0.4)) + ooze(c, 50, 96, 10) + ooze(c, 66, 98, 14) + ooze(c, 78, 95, 8, 0.8);
      // bones poking out
      s += P(pd([[98, 40], [106, 36], [100, 46]], true), '#ece4cc', 1.2) + P(pd([[102, 50], [110, 48], [104, 56]], true), '#ece4cc', 1.2);
      s += L('M36,40 C50,26 74,22 92,30', RIM, 1.3, 0.6);
      s += limb('M48,102 L44,114', sk, 16) + P('M32,114 L52,114 L54,122 L30,122 Z', c.cel('#5a5048'), 1.8) + L('M34,118 L52,117', '#3a3430', 1.2);
      s += stitchHead(c, 36, 36, sk);
      // near arm raising the cleaver
      s += limb('M44,54 L24,60', sk, 14) + limb('M24,60 L18,44', sk, 12) + bigCleaver(c, [18, 44], 30, -1.35, 16) + bigFist(c, [18, 44], sk, 8) + stitchLine([[30, 54], [34, 64]]);
      return G(s, at(1.04, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a6e80'), 2.5); }
  function phScene(c) { return dwSky(c, 3) + nightGround(c, 150); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#2a2c44"/></svg>'; }
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
