/* art_redridge.js — Redridge Mountains zone art for Azeroth Solo (Alliance, levels 18-25: Three Corners, Lakeshire,
 * Lake Everstill, the Redridge Canyons, Alther's Mill, Render's Valley, Stonewatch Keep, Galardell Valley) plus
 * the Stockade (Stormwind prison dungeon, levels 22-26).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Redridge keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and rigs (biped, gnoll head, murloc, goretusk, Defias head, orc/human/dwarf heads) are shared copies of
 * art_westfall.js / art_durotar.js / art_barrens.js so the zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix rr<counter>_).
 * Palette: red-rock canyons, rust cliffs, dark pines, deep blue Lake Everstill, warm evening light.
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
  function Ctx() { this.p = 'rr' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  // Defias crate: a red cloth tied over the lid
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
  // Stormwind-style farmhouse: stone ground floor, half-timbered upper, steep shingle roof
  function farmhouse(c, x, y, s, o) {
    o = o || {};
    var plaster = o.wall || PLASTER, beam = BEAM, roofc = o.roof || ROOF, stone = o.stone || STONE, out = '', ruin = o.ruin;
    var win = ruin ? '#2a1a12' : (o.lit ? '#ffd46a' : '#5a6a7a');
    out += E(x, y + 2, 50 * s, 5 * s, '#000', 0, 0.26);
    var w = 38 * s, h = 38 * s;
    var inner = '';
    // chimney + smoke
    if (!ruin) inner += smoke(x + 22 * s, y - h - 44 * s, s, 11, '#b0aaa0', 5);
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
  // murloc hut: tall reed-and-kelp cone with sticks and a hide flap
  function murlocHut(c, x, y, s, col) {
    col = col || '#9a8660';
    var o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.24);
    o += limb('M' + pt([x - 3 * s, y - 54 * s]) + 'L' + pt([x - 12 * s, y - 68 * s]), '#6a5a44', 1.8 * s) + limb('M' + pt([x + 3 * s, y - 54 * s]) + 'L' + pt([x + 10 * s, y - 70 * s]), '#6a5a44', 1.8 * s) + limb('M' + pt([x, y - 54 * s]) + 'L' + pt([x + 1 * s, y - 72 * s]), '#6a5a44', 1.6 * s);
    var d = 'M' + pt([x - 24 * s, y]) + 'C' + pt([x - 24 * s, y - 24 * s]) + ' ' + pt([x - 12 * s, y - 50 * s]) + ' ' + pt([x - 3 * s, y - 58 * s]) + 'L' + pt([x + 3 * s, y - 58 * s]) + 'C' + pt([x + 12 * s, y - 50 * s]) + ' ' + pt([x + 24 * s, y - 24 * s]) + ' ' + pt([x + 24 * s, y]) + 'Z';
    var reeds = '';
    for (var i = -4; i <= 4; i++) reeds += 'M' + pt([x + i * 5.4 * s, y]) + 'Q' + pt([x + i * 4 * s, y - 30 * s]) + ' ' + pt([x + i * 0.6 * s, y - 56 * s]);
    var bands = 'M' + pt([x - 22 * s, y - 16 * s]) + 'Q' + pt([x, y - 12 * s]) + ' ' + pt([x + 22 * s, y - 16 * s]) + 'M' + pt([x - 16 * s, y - 36 * s]) + 'Q' + pt([x, y - 32 * s]) + ' ' + pt([x + 16 * s, y - 36 * s]);
    o += body(c, d, col, L(reeds, dk(col, 0.3), 1 * s) + L(bands, '#5a6a2e', 2.4 * s) + F('M' + pt([x + 6 * s, y - 60 * s]) + 'C' + pt([x + 16 * s, y - 46 * s]) + ' ' + pt([x + 26 * s, y - 24 * s]) + ' ' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'C' + pt([x + 12 * s, y - 24 * s]) + ' ' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 6 * s, y - 60 * s]) + 'Z', dk(col, 0.25), 0.8), 1.8 * s);
    // kelp drape
    o += P('M' + pt([x - 14 * s, y - 40 * s]) + 'Q' + pt([x - 4 * s, y - 36 * s]) + ' ' + pt([x + 6 * s, y - 42 * s]) + 'L' + pt([x + 4 * s, y - 30 * s]) + 'L' + pt([x, y - 34 * s]) + 'L' + pt([x - 6 * s, y - 28 * s]) + 'L' + pt([x - 8 * s, y - 34 * s]) + 'L' + pt([x - 14 * s, y - 30 * s]) + 'Z', c.cel('#5a7a34'), 1.2 * s);
    // door
    o += P('M' + pt([x - 8 * s, y + 1]) + 'L' + pt([x - 8 * s, y - 12 * s]) + 'Q' + pt([x, y - 22 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'Z', '#20180e', 1.6 * s);
    o += P('M' + pt([x + 2 * s, y - 18 * s]) + 'Q' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 8 * s, y + 1]) + 'L' + pt([x + 3 * s, y + 1]) + 'Q' + pt([x + 4 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 18 * s]) + 'Z', c.cel('#b89a70'), 1.2 * s);
    return o;
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  // Riverpaw lean-to: crossed poles, ragged hide, skull on top
  function gnollTent(c, x, y, s, hide, bare) {
    hide = hide || '#9a7a52';
    var o = E(x, y + 1, 30 * s, 5 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 26 * s, y]) + 'L' + pt([x + 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x + 26 * s, y]) + 'L' + pt([x - 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s);
    var d = 'M' + pt([x - 2 * s, y - 42 * s]) + 'L' + pt([x + 3 * s, y - 42 * s]) + 'L' + pt([x + 24 * s, y - 2 * s]) + 'L' + pt([x + 18 * s, y + 1]) + 'L' + pt([x + 14 * s, y - 4 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y + 1]) + 'L' + pt([x - 14 * s, y - 5 * s]) + 'L' + pt([x - 19 * s, y + 1]) + 'L' + pt([x - 24 * s, y - 3 * s]) + 'Z';
    o += body(c, d, hide, E(x - 10 * s, y - 20 * s, 5 * s, 4 * s, dk(hide, 0.2), 0, 0.8) + E(x + 12 * s, y - 14 * s, 4 * s, 3 * s, dk(hide, 0.2), 0, 0.8) + F('M' + pt([x + 1 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'Z', dk(hide, 0.28), 0.8) +
      L('M' + pt([x - 12 * s, y - 24 * s]) + 'l3,2 M' + pt([x + 8 * s, y - 30 * s]) + 'l-2,3', dk(hide, 0.45), 1.2 * s), 1.8 * s);
    o += F('M' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x - 9 * s, y + 1]) + 'Z', '#2a1a10');
    if (!bare) o += skull(c, x, y - 52 * s, 0.9 * s);
    return o;
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
  //  REDRIDGE PIECES
  // ============================================================
  var RR = '#b4502e', RR2 = '#7a2e1c', RRL = '#e08a5a', GR = '#86944a', GR2 = '#5a6a30', GRL = '#b0b862', DIRT = '#b87a4e', DIRT2 = '#8a5436';
  var PINE = '#2e5a3a', PINE2 = '#21452c', LAKE = '#2c5c9c', LAKE2 = '#1c3c70', BR = '#1e1a1c', BRK = '#d8481e', BRO = '#f08a2a';
  // warm evening sky: blue overhead fading into apricot at the horizon
  function rrSky(c, sx, sy, top, mid, bot) { return sky(c, top || '#4a6aa8', mid || '#d8a080', bot || '#f6d49a') + sun(c, sx, sy, 10, '#ffe2a0'); }
  function evening(c) { return R(0, 0, 400, 240, c.lg([[0, '#ff9a50', 0.14], [1, '#ff9a50', 0]], 1, 0, 0, 0)); }
  // jagged crag band (sharp peaks), no outline: for distant ranges
  function crags(c, seed, base, amp, fill, step, x0, x1) {
    var r = rng(seed), x = x0 == null ? -20 : x0, xe = x1 == null ? 420 : x1, d = 'M' + pt([x, base + 60]) + 'L' + pt([x, base - amp * 0.4]);
    while (x < xe) {
      var w = step * (0.6 + 0.8 * r()), top = base - amp * (0.35 + 0.65 * r());
      d += 'L' + pt([x + w * 0.35, top + amp * 0.08]) + 'L' + pt([x + w * 0.45, top]) + 'L' + pt([x + w * 0.7, top + amp * 0.12]) + 'L' + pt([x + w, base - amp * (0.2 + 0.3 * r())]);
      x += w;
    }
    return F(d + 'L' + pt([x, base + 60]) + 'Z', fill);
  }
  // one red-rock butte / cliff block: flat notched top, steep sides, strata, shadowed right face
  function butte(c, x, y, w, h, col, seed, sw) {
    col = col || RR;
    var r = rng(seed || 3), t = y - h, pts = [[x - w / 2, y + 2], [x - w / 2 + w * 0.06, y - h * 0.55], [x - w / 2 + w * 0.02, y - h * 0.62], [x - w / 2 + w * 0.1, t + h * 0.12]];
    var k = 5 + Math.floor(r() * 3);
    for (var i = 0; i <= k; i++) { var px = x - w / 2 + w * 0.12 + (w * 0.76) * i / k; pts.push([px, t + (r() - 0.5) * h * 0.08 + (i % 2 ? h * 0.03 : 0)]); }
    pts.push([x + w / 2 - w * 0.08, t + h * 0.18], [x + w / 2 - w * 0.03, y - h * 0.5], [x + w / 2, y + 2]);
    var d = pd(pts, true), str = '';
    for (var j = 1; j < 5; j++) { var sy = t + h * (0.18 + j * 0.17); str += 'M' + pt([x - w, sy + (r() - 0.5) * 4]) + 'Q' + pt([x, sy + (r() - 0.5) * 8]) + ' ' + pt([x + w, sy + (r() - 0.5) * 4]); }
    var cr = '';
    for (var q = 0; q < 4; q++) { var cx = x - w * 0.3 + r() * w * 0.5, cy = t + h * (0.2 + r() * 0.4); cr += 'M' + pt([cx, cy]) + 'l' + n(r() * 4 - 2) + ',' + n(8 + r() * 12) + 'l' + n(r() * 4 - 2) + ',' + n(6 + r() * 8); }
    return body(c, d, col, L(str, dk(col, 0.22), 1.4, 0.7) + L(cr, dk(col, 0.4), 1.2, 0.8) +
      F(pd([[x + w * 0.16, t - 4], [x + w / 2 + 4, t - 4], [x + w / 2 + 4, y + 4], [x + w * 0.24, y + 4], [x + w * 0.2, y - h * 0.5]], true), dk(col, 0.3), 0.85) +
      F(pd([[x - w / 2, t + h * 0.1], [x + w / 2, t + h * 0.1], [x + w / 2, t - 6], [x - w / 2, t - 6]], true), lt(col, 0.25), 0.7), sw == null ? 2 : sw);
  }
  // a row of overlapping buttes, back to front
  function cliffs(c, list, col) { return list.map(function (b, i) { return butte(c, b[0], b[1], b[2], b[3], b[4] || col, 11 + i * 7, b[5]); }).join(''); }
  // grassy cap over a cliff top
  function grassCap(x, y, w, col) { return F('M' + pt([x - w / 2, y + 3]) + 'Q' + pt([x - w * 0.3, y - 3]) + ' ' + pt([x, y - 2]) + 'Q' + pt([x + w * 0.3, y - 3]) + ' ' + pt([x + w / 2, y + 3]) + 'L' + pt([x + w * 0.3, y + 6]) + 'L' + pt([x, y + 3]) + 'L' + pt([x - w * 0.3, y + 7]) + 'Z', col || GR); }
  // pine tree: trunk + stacked jagged tiers
  function pine(c, x, y, s, col, lean) {
    col = col || PINE; lean = lean || 0;
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x, y]) + 'L' + pt([x + lean * 0.3 * s, y - 14 * s]), '#5a3a24', 3.2 * s);
    var tiers = [[0, 26, 30], [16, 22, 26], [30, 17, 22], [42, 11, 18]];
    tiers.forEach(function (t, i) {
      var by = y - 8 * s - t[0] * s, hw = t[1] * s, th = t[2] * s, tx = x + lean * s * (t[0] + t[2]) / 60, bx = x + lean * s * t[0] / 60;
      var d = 'M' + pt([bx - hw, by]) + 'L' + pt([bx - hw * 0.6, by - th * 0.35]) + 'L' + pt([bx - hw * 0.72, by - th * 0.3]) + 'L' + pt([tx - hw * 0.25, by - th * 0.75]) + 'L' + pt([tx, by - th]) +
        'L' + pt([tx + hw * 0.25, by - th * 0.75]) + 'L' + pt([bx + hw * 0.72, by - th * 0.3]) + 'L' + pt([bx + hw * 0.6, by - th * 0.35]) + 'L' + pt([bx + hw, by]) + 'Q' + pt([bx, by + 4 * s]) + ' ' + pt([bx - hw, by]) + 'Z';
      o += body(c, d, i % 2 ? lt(col, 0.04) : col, F(pd([[tx, by - th - 2], [bx + hw + 2, by + 2], [bx + hw * 0.1, by + 4 * s]], true), dk(col, 0.3), 0.85) + L('M' + pt([bx - hw * 0.5, by - 2 * s]) + 'L' + pt([tx - hw * 0.1, by - th * 0.6]), lt(col, 0.25), 1 * s, 0.6), 1.6 * s);
    });
    return o;
  }
  function pines(c, list, col) { return list.map(function (p) { return pine(c, p[0], p[1], p[2], p[3] || col, p[4]); }).join(''); }
  // distant pine silhouettes along a ridge line
  function farPines(seed, x0, x1, y, s0, s1, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = x0 + r() * (x1 - x0), s = s0 + r() * (s1 - s0), yy = y + r() * 4;
      d += 'M' + pt([x - 5 * s, yy]) + 'L' + pt([x - 3 * s, yy - 6 * s]) + 'L' + pt([x - 4 * s, yy - 6 * s]) + 'L' + pt([x - 1.5 * s, yy - 12 * s]) + 'L' + pt([x - 2.5 * s, yy - 12 * s]) + 'L' + pt([x, yy - 19 * s]) +
        'L' + pt([x + 2.5 * s, yy - 12 * s]) + 'L' + pt([x + 1.5 * s, yy - 12 * s]) + 'L' + pt([x + 4 * s, yy - 6 * s]) + 'L' + pt([x + 3 * s, yy - 6 * s]) + 'L' + pt([x + 5 * s, yy]) + 'Z';
    }
    return F(d, col);
  }
  // crossroads signpost: three blank arrow boards
  function signpost(c, x, y, s) {
    var o = E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 50 * s]), '#6a4a2a', 3 * s);
    [[-44, 1, -4], [-34, -1, 5], [-24, 1, 2]].forEach(function (b) {
      var by = y + b[0] * s, dir = b[1], a = b[2], x1 = x + dir * 26 * s, x0 = x - dir * 6 * s;
      var d = pd([[x0, by - 4.5 * s], [x1, by - 4.5 * s + a * 0.3 * s], [x1 + dir * 6 * s, by + a * 0.3 * s], [x1, by + 4.5 * s + a * 0.3 * s], [x0, by + 4.5 * s]], true);
      o += body(c, d, '#b08a5a', L('M' + pt([x0 + dir * 4 * s, by]) + 'L' + pt([x1 - dir * 4 * s, by + a * 0.3 * s]), '#6a4a2a', 1.2 * s, 0.6) + F(pd([[x0, by + 1 * s], [x1 + dir * 6 * s, by + 1 * s], [x1 + dir * 6 * s, by + 6 * s], [x0, by + 6 * s]], true), '#7a5a36', 0.6), 1.5 * s);
    });
    return o + C(x, y - 51 * s, 2.2 * s, c.cel('#6a4a2a'), 1.2 * s);
  }
  // lake water band with ripples, sky reflection and sun glitter
  function lake(c, y0, y1, seed, sx) {
    var o = R(-2, y0, 404, y1 - y0, c.lg([[0, '#7a9ac4'], [0.12, LAKE], [1, LAKE2]]));
    var r = rng(seed || 5), d = '', g = '';
    for (var i = 0; i < 34; i++) { var y = y0 + 3 + r() * (y1 - y0 - 4), x = r() * 400, w = 5 + (y - y0) * 0.4; d += 'M' + pt([x, y]) + 'q' + n(w * 0.5) + ',' + n(-1.4) + ' ' + n(w) + ',0'; }
    if (sx != null) for (var j = 0; j < 9; j++) { var gy = y0 + 2 + j * (y1 - y0) / 12, gw = 18 - j; g += E(sx + (r() - 0.5) * 10, gy, gw, 1.2, '#ffe2a0', 0, 0.7 - j * 0.06); }
    return o + L(d, '#a8c4e8', 1, 0.55) + g + E(200, y0 + 1, 220, 1.6, '#e8f0ff', 0, 0.35);
  }
  // shoreline lip where land meets water (y = water edge)
  function shore(c, y, col, seed, amp) {
    var r = rng(seed || 3), d = 'M-4,242 L-4,' + n(y), x = -4;
    while (x < 404) { var w = 14 + r() * 22; d += 'Q' + pt([x + w / 2, y + (r() - 0.5) * (amp || 6)]) + ' ' + pt([x + w, y + (r() - 0.5) * 3]); x += w; }
    d += 'L404,242Z';
    return L(d.replace(/L404,242Z$/, '').replace(/^M-4,242 L/, 'M'), '#e8f0f4', 3, 0.6) + P(d, c.lg([[0, col || '#a8904e'], [1, dk(col || '#a8904e', 0.3)]]), 1.8);
  }
  // long arched stone bridge (x0..x1 deck at y, arches reaching down h)
  function stoneBridge(c, x0, x1, y, h, arches, col) {
    col = col || '#b8ac98';
    var o = '', w = x1 - x0, aw = w / arches, deck = 9;
    var d = 'M' + pt([x0, y + h]) + 'L' + pt([x0, y]) + 'L' + pt([x1, y]) + 'L' + pt([x1, y + h]);
    for (var i = arches - 1; i >= 0; i--) {
      var ax = x0 + aw * i, pw = aw * 0.16;
      d += 'L' + pt([ax + aw - pw, y + h]) + 'L' + pt([ax + aw - pw, y + deck + h * 0.35]) + 'Q' + pt([ax + aw / 2, y + deck - 2]) + ' ' + pt([ax + pw, y + deck + h * 0.35]) + 'L' + pt([ax + pw, y + h]);
    }
    d += 'Z';
    var jn = '';
    for (var k = 1; k < 3; k++) jn += 'M' + pt([x0, y + k * 3.2]) + 'L' + pt([x1, y + k * 3.2]);
    for (var m = 0; m < w / 7; m++) jn += 'M' + pt([x0 + m * 7 + (m % 2) * 3, y]) + 'l0,3.2 M' + pt([x0 + m * 7 + 3, y + 3.2]) + 'l0,3.2';
    var sh = F(pd([[x0 - 2, y + deck - 1], [x1 + 2, y + deck - 1], [x1 + 2, y + h + 2], [x0 - 2, y + h + 2]], true), dk(col, 0.25), 0.55) + L(jn, dk(col, 0.35), 0.7, 0.8);
    for (var a = 0; a < arches; a++) { var cx = x0 + aw * a + aw / 2; sh += L('M' + pt([cx - aw * 0.34, y + deck + h * 0.33]) + 'Q' + pt([cx, y + deck - 4]) + ' ' + pt([cx + aw * 0.34, y + deck + h * 0.33]), lt(col, 0.2), 1.6, 0.8); }
    o += body(c, d, col, sh, 1.6);
    // parapet with little merlons
    o += R(x0 - 1, y - 4, w + 2, 4, c.cel(lt(col, 0.08)), 1.2);
    for (var p = 0; p < w / 10; p++) o += R(x0 + p * 10 + 1, y - 7, 5, 3.4, c.cel(lt(col, 0.08)), 0.9);
    return o;
  }
  function pierPosts(x, y, w, s) { var o = ''; for (var i = 0; i <= 3; i++) o += limb('M' + pt([x + i * w / 3, y]) + 'L' + pt([x + i * w / 3, y + 14 * s]), '#4a3220', 2.6 * s); return o; }
  function dock(c, x, y, w, s) {
    var o = pierPosts(x, y, w, s) + E(x + w / 2, y + 15 * s, w * 0.6, 2 * s, '#e8f0ff', 0, 0.35);
    var d = pd([[x - 4 * s, y], [x + w + 6 * s, y - 2 * s], [x + w + 6 * s, y + 4 * s], [x - 4 * s, y + 6 * s]], true), pl = '';
    for (var i = 1; i < w / (6 * s); i++) pl += 'M' + pt([x - 4 * s + i * 6 * s, y - 2 * s]) + 'l0,' + n(8 * s);
    o += body(c, d, '#9a7248', L(pl, '#5a3a22', 0.9 * s) + F(pd([[x - 6 * s, y + 3 * s], [x + w + 8 * s, y + 1 * s], [x + w + 8 * s, y + 8 * s], [x - 6 * s, y + 8 * s]], true), '#5a3a22', 0.6), 1.4 * s);
    return o;
  }
  function rowboat(c, x, y, s, col) {
    col = col || '#8a5a36';
    var d = 'M' + pt([x - 18 * s, y - 6 * s]) + 'L' + pt([x + 18 * s, y - 7 * s]) + 'Q' + pt([x + 14 * s, y + 2 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x - 10 * s, y + 2 * s]) + 'Q' + pt([x - 16 * s, y]) + ' ' + pt([x - 18 * s, y - 6 * s]) + 'Z';
    return E(x, y + 3 * s, 22 * s, 2 * s, '#0c2040', 0, 0.35) + body(c, d, col, L('M' + pt([x - 16 * s, y - 3 * s]) + 'L' + pt([x + 16 * s, y - 4 * s]), dk(col, 0.35), 1 * s) + F(pd([[x - 20 * s, y - 1 * s], [x + 20 * s, y - 2 * s], [x + 20 * s, y + 4 * s], [x - 20 * s, y + 4 * s]], true), dk(col, 0.3), 0.7), 1.4 * s) +
      limb('M' + pt([x - 2 * s, y - 6 * s]) + 'L' + pt([x + 14 * s, y - 14 * s]), '#c8a070', 1.4 * s);
  }
  // cattail reeds clump
  function reeds(c, x, y, s, col) {
    col = col || '#6a7a34';
    var o = '', st = '', heads = '';
    [[-8, -26, -3], [-4, -34, -1], [0, -30, 1], [4, -38, 2], [8, -24, 4], [-11, -18, -5], [11, -20, 6]].forEach(function (q, i) {
      var tx = x + (q[0] + q[2]) * s, ty = y + q[1] * s;
      st += 'M' + pt([x + q[0] * 0.4 * s, y]) + 'Q' + pt([x + q[0] * 0.8 * s, y + q[1] * 0.5 * s]) + ' ' + pt([tx, ty]);
      if (i % 2 === 0) heads += P('M' + pt([tx - 1.8 * s, ty + 1 * s]) + 'L' + pt([tx - 1.8 * s, ty + 8 * s]) + 'Q' + pt([tx, ty + 10 * s]) + ' ' + pt([tx + 1.8 * s, ty + 8 * s]) + 'L' + pt([tx + 1.8 * s, ty + 1 * s]) + 'Q' + pt([tx, ty - 1 * s]) + ' ' + pt([tx - 1.8 * s, ty + 1 * s]) + 'Z', c.cel('#6a4428'), 0.9 * s);
    });
    return E(x, y + 1, 12 * s, 2 * s, '#000', 0, 0.18) + L(st, OL, 3 * s) + L(st, col, 1.4 * s) + heads;
  }
  // dry scrub bush
  function scrub(c, x, y, s, col) {
    col = col || '#7a7a3a';
    var r = rng(Math.round(x * 7 + y * 13)), br = '';
    for (var i = 0; i < 8; i++) { var a = -PI * (0.1 + 0.8 * i / 7) + (r() - 0.5) * 0.2, len = (10 + r() * 8) * s; br += 'M' + pt([x, y]) + 'Q' + pt([x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * len * 0.5]) + ' ' + pt([x + Math.cos(a) * len, y + Math.sin(a) * len]); }
    var blob = '';
    for (var j = 0; j < 6; j++) { var a2 = -PI * (0.15 + 0.7 * j / 5), rr2 = (12 + r() * 4) * s; blob += E(x + Math.cos(a2) * rr2 * 0.8, y + Math.sin(a2) * rr2 * 0.7, 5 * s, 4 * s, j % 2 ? col : lt(col, 0.12), 0, 0.95); }
    return E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.2) + L(br, OL, 3.6 * s) + L(br, '#6a4a2a', 1.6 * s) + blob;
  }
  // gnoll bone totem: pole with a big skull, jaw bones, feathers and a hide strip
  function boneTotem(c, x, y, s, hide) {
    hide = hide || '#a07048';
    var o = E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 58 * s]), '#6a4a2a', 3 * s);
    o += limb('M' + pt([x - 14 * s, y - 40 * s]) + 'L' + pt([x + 14 * s, y - 42 * s]), '#6a4a2a', 2 * s);
    o += bone(x - 12 * s, y - 34 * s, 12 * s, 1.5, s) + bone(x + 12 * s, y - 35 * s, 12 * s, 1.6, s);
    o += body(c, pd([[x - 4 * s, y - 38 * s], [x + 5 * s, y - 38 * s], [x + 6 * s, y - 16 * s], [x + 2 * s, y - 20 * s], [x - 1 * s, y - 14 * s], [x - 5 * s, y - 20 * s]], true), hide, L('M' + pt([x - 3 * s, y - 32 * s]) + 'L' + pt([x + 4 * s, y - 30 * s]), '#8a2a1a', 2 * s), 1.4 * s);
    // big hyena skull with a long snout
    var hx = x, hy = y - 60 * s;
    o += P('M' + pt([hx - 7 * s, hy - 6 * s]) + 'C' + pt([hx - 7 * s, hy - 13 * s]) + ' ' + pt([hx + 8 * s, hy - 13 * s]) + ' ' + pt([hx + 8 * s, hy - 5 * s]) + 'L' + pt([hx + 7 * s, hy + 2 * s]) + 'L' + pt([hx + 3 * s, hy + 13 * s]) + 'L' + pt([hx - 2 * s, hy + 13 * s]) + 'L' + pt([hx - 6 * s, hy + 2 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * s);
    o += E(hx - 3 * s, hy - 4 * s, 2 * s, 2.4 * s, OL) + E(hx + 4 * s, hy - 4 * s, 2 * s, 2.4 * s, OL) + L('M' + pt([hx - 1 * s, hy + 6 * s]) + 'l' + n(3 * s) + ',0 M' + pt([hx - 1 * s, hy + 9 * s]) + 'l' + n(3 * s) + ',0', OL, 1 * s);
    o += feathers(x - 13 * s, y - 42 * s, ['#c83a2a', '#e8c040'], 0.7 * s, 0.2) + feathers(x + 13 * s, y - 43 * s, ['#e8c040', '#c83a2a'], 0.7 * s, -0.6);
    return o;
  }
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  // winding stream band from far (top) to near (bottom)
  function stream(c, pts, w0, w1) {
    var l = [], r = [];
    pts.forEach(function (p, i) { var t = i / (pts.length - 1), w = w0 + (w1 - w0) * t; l.push([p[0] - w, p[1]]); r.push([p[0] + w, p[1]]); });
    var d = 'M' + pt(l[0]);
    for (var i = 1; i < l.length; i++) d += 'L' + pt(l[i]);
    for (var j = r.length - 1; j >= 0; j--) d += 'L' + pt(r[j]);
    d += 'Z';
    var rip = '';
    pts.forEach(function (p, i) { if (i) { var w = w0 + (w1 - w0) * i / (pts.length - 1); rip += 'M' + pt([p[0] - w * 0.5, p[1]]) + 'q' + n(w * 0.3) + ',-1.5 ' + n(w * 0.6) + ',0'; } });
    return P(d, c.lg([[0, '#6a90c0'], [1, LAKE]]), 1.8) + L(rip, '#c8dcf0', 1.1, 0.7);
  }
  // water wheel (burnt: charred, missing paddles)
  function waterwheel(c, x, y, r, burnt) {
    var wd = burnt ? '#4a3428' : '#8a6040', o = '';
    o += C(x, y, r, 'none', 0) + L('M' + pt([x, y]) + 'm' + n(-r) + ',0a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(2 * r) + ',0a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(-2 * r) + ',0', OL, 7) + L('M' + pt([x, y]) + 'm' + n(-r) + ',0a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(2 * r) + ',0a' + n(r) + ',' + n(r) + ' 0 1,0 ' + n(-2 * r) + ',0', wd, 3.4);
    var rim2 = r * 0.72;
    o += L('M' + pt([x, y]) + 'm' + n(-rim2) + ',0a' + n(rim2) + ',' + n(rim2) + ' 0 1,0 ' + n(2 * rim2) + ',0a' + n(rim2) + ',' + n(rim2) + ' 0 1,0 ' + n(-2 * rim2) + ',0', OL, 4.4) + L('M' + pt([x, y]) + 'm' + n(-rim2) + ',0a' + n(rim2) + ',' + n(rim2) + ' 0 1,0 ' + n(2 * rim2) + ',0a' + n(rim2) + ',' + n(rim2) + ' 0 1,0 ' + n(-2 * rim2) + ',0', dk(wd, 0.1), 2);
    for (var i = 0; i < 8; i++) {
      var a = PI * i / 4 + 0.2, ca = Math.cos(a), sa = Math.sin(a);
      o += limb('M' + pt([x, y]) + 'L' + pt([x + ca * r, y + sa * r]), dk(wd, 0.05), 2);
      if (burnt && (i === 2 || i === 5)) continue;
      var px = -sa, py = ca, b = [x + ca * r, y + sa * r];
      o += P(pd([[b[0] - px * 4 - ca * 2, b[1] - py * 4 - sa * 2], [b[0] + px * 4 - ca * 2, b[1] + py * 4 - sa * 2], [b[0] + px * 4 + ca * 7, b[1] + py * 4 + sa * 7], [b[0] - px * 4 + ca * 7, b[1] - py * 4 + sa * 7]], true), c.cel(wd), 1.3);
    }
    return o + C(x, y, 4.4, c.cel('#4a4440'), 1.6);
  }
  function logPile(c, x, y, s, burnt) {
    var o = E(x, y + 1, 26 * s, 3 * s, '#000', 0, 0.25), col = burnt ? '#4a3428' : '#9a6a40';
    [[-14, 0], [0, 0], [14, 0], [-7, -9], [7, -9], [0, -18]].forEach(function (q) {
      var cx = x + q[0] * s, cy = y - 5 * s + q[1] * s;
      o += E(cx, cy, 7.5 * s, 5 * s, c.cel(col), 1.4 * s) + E(cx - 0.5 * s, cy, 4.5 * s, 3 * s, burnt ? '#2a1a12' : '#d8b080', 0.8 * s) + E(cx - 0.5 * s, cy, 1.8 * s, 1.2 * s, burnt ? '#ff7a2a' : '#a07848', 0);
    });
    return o;
  }
  // Blackrock war banner: black cloth, orange-red mountain sigil (two jagged peaks over a red band)
  function sigil(x, y, k) {
    return F(pd([[x - 6 * k, y + 4 * k], [x - 2.5 * k, y - 4 * k], [x - 1 * k, y - 1.5 * k], [x + 1.5 * k, y - 6.5 * k], [x + 6 * k, y + 4 * k]], true), BRO) +
      F(pd([[x + 1.5 * k, y - 6.5 * k], [x + 2.5 * k, y - 2.5 * k], [x + 0.8 * k, y - 3.4 * k]], true), '#ffd070') + F(pd([[x - 6.5 * k, y + 4.5 * k], [x + 6.5 * k, y + 4.5 * k], [x + 6 * k, y + 6.5 * k], [x - 6 * k, y + 6.5 * k]], true), BRK);
  }
  function brBanner(c, x, y, h, s, tatter) {
    var top = y - h, o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 6 * s]), '#3a2a22', 2.4 * s) + limb('M' + pt([x - 10 * s, top]) + 'L' + pt([x + 10 * s, top]), '#3a2a22', 2 * s);
    o += P(pd([[x - 3 * s, top - 6 * s], [x, top - 13 * s], [x + 3 * s, top - 6 * s]], true), '#8a8a90', 1 * s);
    o += P(pd([[x - 12 * s, top - 1 * s], [x - 8 * s, top - 6 * s], [x - 9 * s, top - 1 * s]], true), '#e8dcc0', 0.9 * s) + P(pd([[x + 12 * s, top - 1 * s], [x + 8 * s, top - 6 * s], [x + 9 * s, top - 1 * s]], true), '#e8dcc0', 0.9 * s);
    var bw = 18 * s, bh = h * 0.56, by = top + 2 * s;
    var d = tatter ? pd([[x - bw / 2, by], [x + bw / 2, by], [x + bw / 2, by + bh], [x + bw * 0.25, by + bh - 5 * s], [x + bw * 0.05, by + bh + 2 * s], [x - bw * 0.2, by + bh - 6 * s], [x - bw / 2, by + bh - 1 * s]], true)
      : pd([[x - bw / 2, by], [x + bw / 2, by], [x + bw / 2, by + bh], [x, by + bh - 7 * s], [x - bw / 2, by + bh]], true);
    o += body(c, d, BR, F(pd([[x + 2 * s, by - 1], [x + bw, by - 1], [x + bw, by + bh + 4], [x + 2 * s, by + bh + 4]], true), '#000000', 0.35) + R(x - bw / 2, by + 2 * s, bw, 2 * s, BRK) + sigil(x, by + bh * 0.45, 1.05 * s), 1.6 * s);
    return o;
  }
  // wall-hung Blackrock banner (hangs down from y)
  function wallBanner(c, x, y, w, h) {
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h - w * 0.35], [x - w / 2, y + h]], true);
    return L('M' + pt([x - w / 2 - 2, y]) + 'L' + pt([x + w / 2 + 2, y]), OL, 3) + body(c, d, BR, F(pd([[x + 1, y], [x + w, y], [x + w, y + h + 2], [x + 1, y + h + 2]], true), '#000', 0.35) + R(x - w / 2, y + 2, w, 1.8, BRK) + sigil(x, y + h * 0.42, w / 16), 1.4);
  }
  // cheval-de-frise: sharpened stakes pointing out at an angle
  function stakes(c, x0, x1, y, h, col, step) {
    col = col || '#4a3226'; step = step || 11;
    var o = limb('M' + pt([x0, y - h * 0.35]) + 'L' + pt([x1, y - h * 0.35]), '#2e2018', 3);
    for (var x = x0; x <= x1; x += step) {
      var k = ((x * 13) % 7) / 7, len = h * (0.9 + k * 0.3), a = -PI / 2 - 0.35 + k * 0.2, tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len;
      o += limb('M' + pt([x + 3, y + 1]) + 'L' + pt([tx, ty]), col, 3.2) + P(pd([[tx - 2.4, ty + 3], [tx + Math.cos(a) * 7, ty + Math.sin(a) * 7], [tx + 2.4, ty + 3]], true), '#c8b894', 1.1);
    }
    return o;
  }
  // tall log palisade with sharpened tips, dark wood
  function palisade(c, x1, x2, y, h, col, step) {
    col = col || '#5a3e2c'; step = step || 9;
    var o = '';
    for (var x = x1; x < x2; x += step) {
      var hh = h * (0.9 + ((x * 37) % 10) / 50);
      var d = 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - hh) + ' L' + n(x + step / 2) + ',' + n(y - hh - step * 1.1) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' Z';
      o += P(d, c.cel(col), 1.5) + F('M' + n(x + step * 0.62) + ',' + n(y - hh - step * 0.5) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' L' + n(x + step * 0.62) + ',' + n(y) + ' Z', dk(col, 0.3), 0.75);
    }
    o += limb('M' + n(x1) + ',' + n(y - h * 0.3) + ' L' + n(x2) + ',' + n(y - h * 0.3), '#2e2018', 2.2) + limb('M' + n(x1) + ',' + n(y - h * 0.72) + ' L' + n(x2) + ',' + n(y - h * 0.72), '#2e2018', 2);
    return o;
  }
  // iron fire brazier on a tripod
  function brazier(c, x, y, s) {
    var o = C(x, y - 22 * s, 34 * s, glow(c, '#ff8a2a', 0.5)) + E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.28);
    o += limb('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 2 * s, y - 14 * s]) + 'M' + pt([x + 8 * s, y]) + 'L' + pt([x + 2 * s, y - 14 * s]), '#3a3434', 2 * s);
    o += body(c, 'M' + pt([x - 11 * s, y - 20 * s]) + 'L' + pt([x + 11 * s, y - 20 * s]) + 'L' + pt([x + 7 * s, y - 12 * s]) + 'L' + pt([x - 7 * s, y - 12 * s]) + 'Z', '#4a4444', L('M' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y - 16 * s]), '#2a2424', 1.2 * s), 1.4 * s);
    return o + flame(c, x - 4 * s, y - 19 * s, 0.7 * s) + flame(c, x + 4 * s, y - 19 * s, 0.65 * s) + flame(c, x, y - 18 * s, 1.1 * s);
  }
  // Blackrock war tent: dark hide over poles, spikes on the ridge
  function warTent(c, x, y, s, hide) {
    hide = hide || '#3a302c';
    var o = E(x, y + 1, 34 * s, 5 * s, '#000', 0, 0.26);
    o += body(c, 'M' + pt([x - 32 * s, y]) + 'L' + pt([x - 6 * s, y - 40 * s]) + 'L' + pt([x + 6 * s, y - 40 * s]) + 'L' + pt([x + 32 * s, y]) + 'Z', hide,
      F(pd([[x + 2 * s, y - 42 * s], [x + 34 * s, y + 2], [x + 8 * s, y + 2]], true), dk(hide, 0.4), 0.8) + L('M' + pt([x - 22 * s, y - 14 * s]) + 'L' + pt([x + 22 * s, y - 14 * s]), BRK, 3 * s) + sigil(x - 12 * s, y - 24 * s, 0.9 * s), 1.8 * s);
    o += P(pd([[x - 8 * s, y + 1], [x, y - 20 * s], [x + 8 * s, y + 1]], true), '#140e0c', 1.4 * s);
    [-6, 0, 6].forEach(function (k) { o += P(pd([[x + k * s - 2 * s, y - 39 * s], [x + k * 1.6 * s, y - 52 * s], [x + k * s + 2 * s, y - 39 * s]], true), c.cel('#e0d4b8'), 1.1 * s); });
    return o;
  }
  // dark volcanic rock spire, jagged, with a faint red glow at the root
  function spire(c, x, y, w, h, col) {
    col = col || '#3a3032';
    var d = pd([[x - w / 2, y], [x - w * 0.36, y - h * 0.3], [x - w * 0.42, y - h * 0.36], [x - w * 0.22, y - h * 0.62], [x - w * 0.26, y - h * 0.68], [x - w * 0.08, y - h * 0.9], [x - w * 0.02, y - h], [x + w * 0.06, y - h * 0.86], [x + w * 0.14, y - h * 0.9], [x + w * 0.18, y - h * 0.7], [x + w * 0.3, y - h * 0.5], [x + w * 0.27, y - h * 0.44], [x + w * 0.42, y - h * 0.24], [x + w / 2, y]], true);
    return body(c, d, col, F(pd([[x + w * 0.02, y - h - 4], [x + w * 0.6, y - h * 0.4], [x + w * 0.6, y + 4], [x + w * 0.08, y + 4]], true), dk(col, 0.4), 0.85) +
      L('M' + pt([x - w * 0.2, y - h * 0.3]) + 'L' + pt([x - w * 0.12, y - h * 0.55]) + 'M' + pt([x + w * 0.05, y - h * 0.2]) + 'L' + pt([x - w * 0.02, y - h * 0.6]) + 'M' + pt([x - w * 0.32, y - h * 0.12]) + 'L' + pt([x - w * 0.24, y - h * 0.26]), lt(col, 0.2), 1.3, 0.7) +
      R(x - w, y - h * 0.18, w * 2, h * 0.2, c.lg([[0, '#ff5a1a', 0], [1, '#ff5a1a', 0.35]])), 2);
  }
  // waterfall ribbon from (x, top) to bot with a splash pool
  function waterfall(c, x, top, bot, w) {
    var d = 'M' + pt([x - w / 2, top]) + 'L' + pt([x + w / 2, top]) + 'L' + pt([x + w / 2 + 4, bot]) + 'L' + pt([x - w / 2 - 4, bot]) + 'Z';
    var st = '';
    for (var i = 0; i < 5; i++) { var sx = x - w / 2 + 2 + i * (w - 4) / 4; st += 'M' + pt([sx, top + 2]) + 'L' + pt([sx + (i - 2) * 0.8, bot - 4]); }
    return P(d, c.lg([[0, '#a8c8ec'], [0.5, '#6a9ad0'], [1, '#d8e8f8']]), 1.6) + L(st, '#eef6ff', 1.2, 0.75) +
      E(x, bot, w * 0.9 + 6, 5, '#f4faff', 1.2) + C(x - w * 0.4, bot - 4, 4, '#ffffff', 0, 0.8) + C(x + w * 0.3, bot - 5, 3.4, '#ffffff', 0, 0.8) + C(x, bot - 7, 3, '#ffffff', 0, 0.7);
  }
  // grey stone keep: square tower, crenellations, curtain wall, gate
  function crenels(c, x0, x1, y, col, mw) {
    mw = mw || 6; var o = '';
    for (var x = x0; x < x1 - 1; x += mw * 2) o += R(x, y - mw, mw, mw + 1, c.cel(col), 1.3);
    return o;
  }
  function stoneFace(c, x, y, w, h, col, jointStep) {
    var d = pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true), jn = '', js = jointStep || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
  }
  function arrowSlit(x, y) { return R(x - 1.4, y - 5, 2.8, 10, '#12100e', 0.8); }
  // ruined wizard tower: round, broken jagged top, one glowing window
  function ruinTower(c, x, y, w, h, col, glowCol) {
    col = col || '#8a8494';
    var t = y - h, d = pd([[x - w / 2, y], [x - w / 2 + 2, t + 10], [x - w * 0.3, t + 2], [x - w * 0.18, t + 12], [x - w * 0.02, t - 4], [x + w * 0.12, t + 8], [x + w * 0.28, t + 4], [x + w / 2 - 2, t + 22], [x + w / 2, y]], true), jn = '';
    for (var j = 1; j < h / 8; j++) jn += 'M' + pt([x - w / 2, y - j * 8]) + 'Q' + pt([x, y - j * 8 + 3]) + ' ' + pt([x + w / 2, y - j * 8]);
    var o = body(c, d, col, L(jn, dk(col, 0.3), 0.8, 0.8) + F(pd([[x + w * 0.1, t - 6], [x + w, t - 6], [x + w, y + 2], [x + w * 0.1, y + 2]], true), dk(col, 0.35), 0.75), 1.8);
    o += C(x - 2, y - h * 0.55, 12, glow(c, glowCol || '#b06aff', 0.7)) + P('M' + pt([x - 5, y - h * 0.48]) + 'L' + pt([x - 5, y - h * 0.58]) + 'Q' + pt([x - 2, y - h * 0.64]) + ' ' + pt([x + 1, y - h * 0.58]) + 'L' + pt([x + 1, y - h * 0.48]) + 'Z', glowCol || '#c890ff', 1.2);
    o += rock(c, x + w * 0.6, y + 1, 10, 6, col) + rock(c, x - w * 0.7, y + 1, 8, 5, col);
    return o;
  }
  // small flying black whelp silhouette (for skies)
  function skyWhelp(c, x, y, s, flip) {
    var k = flip ? -1 : 1, q = function (u, v) { return [x + u * s * k, y + v * s]; };
    var wing = pd([q(-2, -2), q(-10, -14), q(-6, -12), q(-2, -16), q(2, -12), q(6, -14), q(4, -4)], true);
    var bd = 'M' + pt(q(-12, 0)) + 'Q' + pt(q(-4, -5)) + ' ' + pt(q(6, -2)) + 'L' + pt(q(14, 2)) + 'L' + pt(q(18, 6)) + 'L' + pt(q(12, 4)) + 'Q' + pt(q(-2, 4)) + ' ' + pt(q(-12, 0)) + 'Z';
    return P(wing, '#2a2226', 1 * s) + P(bd, '#2a2226', 1 * s) + F(pd([q(-8, 1), q(4, 1), q(-2, 3)], true), BRO) + C(q(-10, -1)[0], q(-10, -1)[1], 0.9 * s, '#ffb030');
  }
  // ---- the Stockade ----
  // big fitted-stone wall filling a rect
  function brickWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 12;
    var r = rng(seed || 3), jn = '', sh = '';
    for (var y = y0; y < y1; y += bh) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var off = ((y - y0) / bh) % 2 ? 11 : 0;
      for (var x = x0 - off; x < x1; x += 22) { jn += 'M' + pt([x, y]) + 'l0,' + n(bh); if (r() < 0.22) sh += R(x + 1, y + 1, 20, bh - 2, r() < 0.5 ? dk(col, 0.12) : lt(col, 0.08), 0); }
    }
    return R(x0, y0, x1 - x0, y1 - y0, col) + sh + L(jn, dk(col, 0.4), 1.1, 0.85);
  }
  // wall torch in an iron bracket
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
  // row of iron bars inside an opening (x, y = bottom-left)
  function bars(c, x, y, w, h, bent, col) {
    col = col || '#5a5e66';
    var o = '', k = Math.max(3, Math.round(w / 7));
    for (var i = 1; i < k; i++) {
      var bx = x + w * i / k, d = 'M' + pt([bx, y]) + 'L' + pt([bx, y - h]);
      if (bent && (i === Math.floor(k / 2) || i === Math.floor(k / 2) + 1)) { var dir = i === Math.floor(k / 2) ? -1 : 1; d = 'M' + pt([bx, y]) + 'L' + pt([bx, y - h * 0.25]) + 'Q' + pt([bx + dir * 6, y - h * 0.5]) + ' ' + pt([bx, y - h * 0.8]) + 'L' + pt([bx, y - h]); }
      o += L(d, OL, 4.2) + L(d, col, 2.2) + L(d, lt(col, 0.4), 0.7, 0.7);
    }
    var hz = 'M' + pt([x, y - h + 3]) + 'L' + pt([x + w, y - h + 3]) + 'M' + pt([x, y - h * 0.45]) + 'L' + pt([x + w, y - h * 0.45]);
    return o + L(hz, OL, 4.6) + L(hz, dk(col, 0.1), 2.6);
  }
  // cell: dark arched opening with bars (or a broken door hanging open)
  function cell(c, x, y, w, h, open, col) {
    col = col || '#8a8a88';
    var o = P('M' + pt([x - 4, y]) + 'L' + pt([x - 4, y - h + w * 0.3]) + 'Q' + pt([x + w / 2, y - h - w * 0.25]) + ' ' + pt([x + w + 4, y - h + w * 0.3]) + 'L' + pt([x + w + 4, y]) + 'Z', c.cel(dk(col, 0.05)), 1.6);
    o += P('M' + pt([x, y]) + 'L' + pt([x, y - h + w * 0.3]) + 'Q' + pt([x + w / 2, y - h - w * 0.12]) + ' ' + pt([x + w, y - h + w * 0.3]) + 'L' + pt([x + w, y]) + 'Z', c.lg([[0, '#0c0a0a'], [1, '#221c18']]), 1.4);
    if (open) {
      // door torn off one hinge, swung out and hanging askew
      var dx = x + w + 2, d = pd([[dx, y - 2], [dx + w * 0.45, y + 2], [dx + w * 0.5, y - h * 0.8], [dx + 2, y - h * 0.86]], true), br = '';
      for (var i = 1; i < 4; i++) br += 'M' + pt([dx + w * 0.12 * i, y - 1 + i]) + 'L' + pt([dx + w * 0.12 * i + 1, y - h * 0.84 + i * 0.4]);
      o += L(br + 'M' + pt([dx + 1, y - h * 0.5]) + 'L' + pt([dx + w * 0.48, y - h * 0.4]), OL, 3.6) + L(br + 'M' + pt([dx + 1, y - h * 0.5]) + 'L' + pt([dx + w * 0.48, y - h * 0.4]), '#5a5e66', 1.8) + L(pd([[dx, y - 2], [dx + w * 0.45, y + 2], [dx + w * 0.5, y - h * 0.8], [dx + 2, y - h * 0.86]], true), OL, 4) + L(d, '#6a6e76', 2);
      o += L('M' + pt([x + w * 0.3, y]) + 'L' + pt([x + w * 0.3, y - h * 0.2]) + 'M' + pt([x + w * 0.62, y]) + 'L' + pt([x + w * 0.64, y - h * 0.12]), '#5a5e66', 2, 0.8);
    } else o += bars(c, x, y, w, h - w * 0.1);
    return o;
  }
  function straw(seed, x0, x1, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = (r() - 0.5) * 1.2, l = 4 + r() * 6; d += 'M' + pt([x, y]) + 'l' + n(Math.cos(a) * l) + ',' + n(Math.sin(a) * l); }
    return L(d, OL, 2.6, 0.5) + L(d, col || '#d8b860', 1.3);
  }
  function strawPile(c, x, y, s) {
    return body(c, 'M' + pt([x - 22 * s, y]) + 'Q' + pt([x - 16 * s, y - 10 * s]) + ' ' + pt([x - 2 * s, y - 11 * s]) + 'Q' + pt([x + 16 * s, y - 10 * s]) + ' ' + pt([x + 22 * s, y]) + 'Z', '#c8a450', L('M' + pt([x - 14 * s, y - 4 * s]) + 'l6,-4 M' + pt([x - 2 * s, y - 6 * s]) + 'l5,-3 M' + pt([x + 8 * s, y - 3 * s]) + 'l6,-4', '#8a6a2a', 1) + F(pd([[x + 4 * s, y - 14 * s], [x + 26 * s, y - 14 * s], [x + 26 * s, y + 2], [x + 8 * s, y + 2]], true), '#8a6a2a', 0.5), 1.4) + straw(Math.round(x), x - 26 * s, x + 26 * s, y - 2, y + 4, 10);
  }
  // perspective flagstone floor from yH to the bottom, vanishing at vx
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
  }
  function chain(x, y, len, s, col) {
    var o = '', k = Math.round(len / (6 * s));
    for (var i = 0; i < k; i++) o += E(x, y + i * 6 * s + 3 * s, i % 2 ? 1.2 * s : 2.2 * s, 3.4 * s, 'none', 0) + '<ellipse cx="' + n(x) + '" cy="' + n(y + i * 6 * s + 3 * s) + '" rx="' + n(i % 2 ? 1 * s : 2.2 * s) + '" ry="' + n(3.4 * s) + '" fill="none" stroke="' + (col || '#6a6e76') + '" stroke-width="' + n(1.4 * s) + '"/>';
    return L('M' + pt([x, y]) + 'L' + pt([x, y + len]), OL, 1.2 * s, 0.6) + o;
  }
  // barricade: crates, barrels and planks piled up by rioters
  function barricade(c, x, y, s) {
    var o = E(x, y + 2, 60 * s, 5 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 56 * s, y]) + 'L' + pt([x - 20 * s, y - 38 * s]), '#7a5434', 3.2 * s) + limb('M' + pt([x + 54 * s, y]) + 'L' + pt([x + 18 * s, y - 42 * s]), '#6a4a2e', 3.2 * s);
    o += crate(c, x - 34 * s, y, 1.3 * s, '#9a6a3a') + crate(c, x - 8 * s, y, 1.45 * s, '#a8743e') + barrel(c, x + 22 * s, y, 1.3 * s, '#7a4a2a') + crate(c, x + 44 * s, y, 1.1 * s, '#8a5e34');
    o += crate(c, x - 22 * s, y - 22 * s, 1.2 * s, '#b07a44') + barrel(c, x + 6 * s, y - 24 * s, 1.05 * s, '#8a5a32');
    o += limb('M' + pt([x - 48 * s, y - 20 * s]) + 'L' + pt([x + 40 * s, y - 30 * s]), '#8a6440', 3 * s) + limb('M' + pt([x - 30 * s, y - 44 * s]) + 'L' + pt([x + 30 * s, y - 24 * s]), '#7a5434', 2.6 * s);
    o += P(pd([[x + 12 * s, y - 52 * s], [x + 30 * s, y - 50 * s], [x + 26 * s, y - 36 * s], [x + 20 * s, y - 40 * s], [x + 14 * s, y - 34 * s]], true), c.cel(DEF_RED), 1.3 * s);
    return o;
  }
  function shell(x, y, s, col) {
    col = col || '#f0d8c8';
    return P('M' + pt([x, y]) + 'L' + pt([x - 4 * s, y - 4 * s]) + 'Q' + pt([x, y - 7 * s]) + ' ' + pt([x + 4 * s, y - 4 * s]) + 'Z', col, 1 * s) + L('M' + pt([x, y]) + 'L' + pt([x - 2 * s, y - 5 * s]) + 'M' + pt([x, y]) + 'L' + pt([x + 2 * s, y - 5 * s]), dk(col, 0.3), 0.6 * s);
  }
  function seaweed(x, y, s) {
    return L('M' + pt([x - 8 * s, y]) + 'q' + n(4 * s) + ',' + n(-3 * s) + ' ' + n(8 * s) + ',0 t' + n(8 * s) + ',0', '#4a6a2a', 2 * s, 0.9) + L('M' + pt([x - 4 * s, y + 1]) + 'q' + n(3 * s) + ',' + n(-2 * s) + ' ' + n(7 * s) + ',' + n(-1 * s), '#6a8a3a', 1.4 * s, 0.9);
  }

  // ============================================================
  //  SCENES (400x240)
  // ============================================================
  var LS_BLUE = '#2e56a8', LS_GOLD = '#e8c048';
  function lsBanner(c, x, y, h, s) {
    var o = E(x, y + 1, 6 * s, 1.6 * s, '#000', 0, 0.25), top = y - h;
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4a2a', 2.2 * s) + limb('M' + pt([x - 9 * s, top + 3 * s]) + 'L' + pt([x + 9 * s, top + 3 * s]), '#6a4a2a', 1.8 * s) + C(x, top - 1 * s, 2 * s, LS_GOLD, 1 * s);
    var bw = 16 * s, bh = 28 * s, by = top + 4 * s;
    o += P(pd([[x - bw / 2, by], [x + bw / 2, by], [x + bw / 2, by + bh], [x, by + bh - 7 * s], [x - bw / 2, by + bh]], true), c.cel(LS_BLUE), 1.6 * s) +
      L('M' + pt([x - bw / 2, by + 4 * s]) + 'L' + pt([x + bw / 2, by + 4 * s]), LS_GOLD, 1.2 * s) + P(star(x, by + 14 * s, 8, 5 * s, 3.4 * s), LS_GOLD, 0.8 * s);
    return o;
  }
  function flowerDots(seed, x0, x1, y0, y1, cols, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0); s += C(x0 + r() * (x1 - x0), y, 0.9 + (y - y0) / ((y1 - y0) || 1) * 1.2, cols[i % cols.length]); }
    return s;
  }
  // dirt path given as a centre line with widths
  function path2(c, pts, w0, w1, col, op) {
    var l = [], r = [];
    pts.forEach(function (p, i) { var t = i / (pts.length - 1), w = w0 + (w1 - w0) * t; l.push([p[0], p[1] - w * 0.3]); r.push([p[0], p[1] + w * 0.3]); });
    var d = 'M' + pt(l[0]);
    for (var i = 1; i < l.length; i++) d += 'L' + pt(l[i]);
    for (var j = r.length - 1; j >= 0; j--) d += 'L' + pt(r[j]);
    return F(d + 'Z', col, op == null ? 0.7 : op);
  }
  function innSign(c, x, y, s) {
    return limb('M' + pt([x, y]) + 'L' + pt([x - 16 * s, y]), '#5a3a24', 2 * s) + L('M' + pt([x - 14 * s, y]) + 'l0,' + n(4 * s) + 'M' + pt([x - 4 * s, y]) + 'l0,' + n(4 * s), OL, 1 * s) +
      body(c, pd([[x - 17 * s, y + 4 * s], [x - 1 * s, y + 4 * s], [x - 1 * s, y + 15 * s], [x - 17 * s, y + 15 * s]], true), '#a07040', E(x - 9 * s, y + 9.5 * s, 4 * s, 3 * s, '#e8c048', 0.8 * s) + L('M' + pt([x - 11 * s, y + 8 * s]) + 'l' + n(4 * s) + ',' + n(3 * s), '#8a2a1a', 1.2 * s), 1.4 * s);
  }
  var SCENES = {
    three_corners: function (c) {
      var o = rrSky(c, 318, 70);
      o += cloud(90, 44, 1, 0.8) + cloud(250, 30, 0.7, 0.7);
      o += crags(c, 3, 122, 46, '#b27a7c', 34) + crags(c, 8, 128, 30, '#9a6060', 26);
      o += hills(c, 5, 140, 16, '#788a46', 60) + farPines(4, 0, 200, 138, 0.8, 1.1, '#3e6440', 22);
      o += cliffs(c, [[70, 146, 70, 34, lt(RR, 0.12), 1.6]]) + grassCap(70, 112, 72, '#7a8e44');
      o += cliffs(c, [[392, 160, 90, 104], [322, 158, 100, 76], [262, 152, 46, 30, lt(RR, 0.06)]]) + grassCap(322, 82, 100, '#6f8440') + grassCap(262, 122, 48, '#7a8e44');
      o += farPines(9, 300, 356, 84, 0.6, 0.8, '#2e5236', 8);
      o += ground(c, 148, GR, GR2);
      o += F('M-4,150 Q80,142 160,150 L160,160 Q80,156 -4,164 Z', GRL, 0.35);
      // the Elwynn road coming in from the lower left, forking east and north at the signpost
      o += path2(c, [[-10, 226], [60, 214], [130, 196], [190, 180], [230, 172], [300, 166], [410, 162]], 46, 20, DIRT, 0.72);
      o += path2(c, [[200, 178], [210, 166], [226, 156], [236, 148]], 26, 10, DIRT, 0.72);
      o += grass(12, 150, 240, dk(GR, 0.25), 90, 0.6, 1.6, 1.2);
      o += pines(c, [[152, 150, 0.55], [178, 152, 0.62], [124, 156, 0.7], [20, 190, 1.35], [72, 176, 1.05, PINE2]]);
      o += rock(c, 250, 176, 18, 10, '#9a5a3e') + rock(c, 268, 180, 10, 6, '#a86a48') + rock(c, 352, 206, 30, 16, RR) + rock(c, 376, 212, 16, 8, RRL);
      o += signpost(c, 214, 182, 1.05);
      o += scrub(c, 170, 196, 0.8, '#6a7a36') + scrub(c, 330, 186, 0.7);
      o += tufts(c, [[110, 214, 0.9], [300, 222, 1], [250, 232, 0.8], [30, 236, 1.1], [390, 236, 1]], '#8a9a44');
      o += flowerDots(5, 0, 400, 160, 238, ['#f0e070', '#e8e0f0', '#e07a4a'], 40);
      o += pine(c, 380, 236, 1.5, PINE2, -3);
      return o + evening(c) + vignette(c);
    },
    lakeshire: function (c) {
      var o = rrSky(c, 70, 64, '#5070b0', '#e0a888', '#f8d8a4');
      o += cloud(300, 40, 1, 0.8) + cloud(190, 26, 0.6, 0.7);
      o += crags(c, 21, 104, 40, '#a47a88', 30) + crags(c, 22, 110, 26, '#8a6068', 22);
      o += cliffs(c, [[40, 118, 80, 34, lt(RR, 0.1), 1.4], [110, 118, 50, 20, lt(RR, 0.16), 1.2]]);
      o += hills(c, 23, 118, 8, '#6e7e46', 50) + farPines(24, 0, 400, 118, 0.6, 0.9, '#3a5c3e', 36);
      o += lake(c, 118, 172, 7, 70);
      // the long stone bridge striding across Lake Everstill from the town
      o += stoneBridge(c, -6, 262, 126, 30, 7, '#c4b8a2');
      o += E(120, 158, 150, 3, '#0c2040', 0, 0.25);
      o += rowboat(c, 150, 166, 0.9, '#8a5a36');
      o += F('M200,160 Q260,150 330,152 Q380,152 410,150 L410,176 L200,176 Z', '#8a9650') + L('M200,160 Q260,150 330,152 Q380,152 410,150', '#e8f0f4', 2.4, 0.6);
      o += shore(c, 172, '#8a9650', 31, 4);
      o += ground(c, 176, '#8a9650', '#6a7a3c');
      o += dock(c, 20, 170, 80, 1.1);
      o += path2(c, [[-10, 218], [100, 210], [200, 204], [300, 206], [410, 212]], 44, 44, '#c8a070', 0.75);
      // Lakeshire houses: white plaster, dark beams, red-brown roofs, lit windows
      o += farmhouse(c, 238, 160, 0.6, { wall: PLASTER, roof: dk(ROOF, 0.06), stone: '#b8ab94', lit: true });
      o += farmhouse(c, 396, 170, 0.78, { wall: PLASTER, roof: dk(ROOF, 0.1), stone: '#b0a48c', lit: true });
      o += farmhouse(c, 318, 184, 1.08, { wall: PLASTER, roof: ROOF, stone: '#b8ab94', lit: true });
      o += limb('M262,194 L262,140', '#5a3a24', 2.6) + innSign(c, 262, 146, 1.1);
      o += lsBanner(c, 196, 196, 50, 0.9) + lanternPost(c, 150, 200, 40, 1) + lanternPost(c, 384, 206, 36, 0.9);
      o += fence(c, 110, 176, 194, 12, WOODW, 14) + barrel(c, 226, 206, 1) + crate(c, 212, 208, 0.9) + sack(c, 240, 208, 0.9);
      o += flowerDots(8, 100, 400, 184, 198, ['#e04a4a', '#f0d050', '#ffffff', '#b060d0'], 40);
      o += pine(c, 16, 214, 1.25, PINE2);
      o += grass(33, 196, 240, '#5a6a30', 60, 0.8, 1.6, 1.2);
      o += tufts(c, [[60, 236, 1], [340, 238, 1.1], [250, 234, 0.8]], '#7a8a40');
      return o + evening(c) + vignette(c, '#fff0d0', '#1a1030');
    },
    lake_everstill: function (c) {
      var o = rrSky(c, 250, 84, '#4a6aa8', '#d8a888', '#f6dca8');
      o += cloud(120, 40, 1, 0.8) + cloud(330, 30, 0.7, 0.7);
      o += crags(c, 41, 116, 46, '#a07a8a', 36) + crags(c, 42, 122, 28, '#886070', 24);
      o += hills(c, 43, 126, 12, '#607a44', 50) + farPines(44, 0, 400, 126, 0.7, 1, '#34583c', 40);
      o += lake(c, 126, 206, 9, 250);
      // far island with pines
      o += F('M40,146 Q80,136 130,146 Z', '#5a6e3c') + farPines(45, 50, 120, 146, 0.8, 1.1, '#2e4c34', 10);
      // murloc village on a muddy spit
      o += F('M196,190 Q214,178 250,172 Q300,164 350,168 Q390,170 410,176 L410,194 L196,194 Z', '#8a8250') + L('M196,190 Q214,178 250,172 Q300,164 350,168 Q390,170 410,176', '#e8f0f4', 2.4, 0.6);
      o += murlocHut(c, 262, 178, 0.75, '#9a8660') + murlocHut(c, 318, 176, 0.95, '#8a7a58') + murlocHut(c, 378, 180, 0.7, '#a08c64');
      o += reeds(c, 222, 186, 0.8) + reeds(c, 350, 186, 0.7) + reeds(c, 150, 172, 0.7) + reeds(c, 100, 176, 0.9);
      // the near shore: wet sand with a shallow inlet lapping in between
      o += shore(c, 202, '#a89468', 47, 6);
      o += P('M126,242 C130,226 160,218 200,218 C240,218 272,226 278,242 Z', c.lg([[0, '#4a7ab4'], [1, LAKE2]]), 1.8) + L('M146,232 q10,-2 20,0 M200,226 q12,-2 24,0 M234,236 q8,-2 16,0', '#a8c4e8', 1.1, 0.8) + L('M132,236 C140,224 170,220 200,220 C236,220 266,226 272,238', '#e8f0f4', 2, 0.7);
      o += reeds(c, 132, 228, 1.2) + reeds(c, 276, 232, 1.1, '#5e6e30') + reeds(c, 24, 222, 1.3) + reeds(c, 380, 226, 1.2);
      o += shell(60, 230, 1.4) + shell(320, 222, 1.2, '#e8c8b8') + seaweed(100, 214, 1.2) + seaweed(346, 236, 1);
      o += pebbles(48, 206, 240, '#6a5a3a', 18);
      return o + evening(c) + vignette(c, '#fff0d0', '#10182a');
    },
    redridge_canyons: function (c) {
      var o = rrSky(c, 200, 50, '#5a78b0', '#e0a070', '#f4c888');
      o += cloud(300, 30, 0.8, 0.7);
      o += crags(c, 61, 118, 34, '#b0706a', 30);
      // canyon walls closing in from both sides
      o += cliffs(c, [[150, 150, 80, 48, lt(RR, 0.12), 1.4], [250, 150, 90, 56, lt(RR, 0.1), 1.4]]);
      o += cliffs(c, [[30, 170, 120, 150], [100, 164, 70, 96, dk(RR, 0.05)], [372, 172, 120, 160], [300, 166, 70, 90, dk(RR, 0.05)]]);
      o += grassCap(30, 22, 120, '#6f7e40') + grassCap(372, 14, 120, '#6f7e40');
      o += ground(c, 150, '#c48a58', '#94603c');
      o += cracks(62, 170, 236, dk(DIRT, 0.25), 12);
      o += path2(c, [[140, 158], [200, 176], [220, 204], [200, 242]], 20, 60, '#d8a070', 0.5);
      o += gnollTent(c, 250, 170, 0.8, '#a06a44') + gnollTent(c, 150, 168, 0.66, '#8a5a3a', true);
      o += boneTotem(c, 196, 176, 0.8) + boneTotem(c, 322, 196, 1);
      o += rock(c, 120, 186, 24, 12, RR) + rock(c, 60, 214, 34, 18, dk(RR, 0.05)) + rock(c, 362, 222, 36, 18, RR) + rock(c, 290, 180, 14, 8, RRL);
      o += scrub(c, 90, 196, 0.9, '#7a7a36') + scrub(c, 276, 204, 0.8, '#8a803a') + scrub(c, 380, 190, 0.7);
      o += bone(170, 206, 14, 0.4, 1) + bone(240, 222, 12, -0.3, 1) + skull(c, 110, 226, 1);
      o += tufts(c, [[20, 234, 1], [230, 236, 0.9], [390, 238, 1.1]], '#9a8a44');
      return o + evening(c) + vignette(c, '#fff0d0', '#3a1808');
    },
    althers_mill: function (c) {
      var o = rrSky(c, 330, 66, '#5070a8', '#d8a080', '#f0cc98');
      o += smoke(150, 70, 1.4, 5, '#6a6460', 7);
      o += crags(c, 81, 116, 36, '#a47880', 30);
      o += hills(c, 82, 128, 20, '#56704a', 54) + farPines(83, 0, 400, 128, 0.8, 1.2, '#2c4c34', 50);
      o += hills(c, 84, 146, 12, '#687e44', 44) + farPines(85, 260, 400, 146, 1, 1.3, '#2a4630', 14);
      o += ground(c, 148, GR, GR2);
      o += stream(c, [[230, 146], [250, 160], [236, 176], [270, 196], [320, 216], [352, 242]], 5, 30);
      // Alther's Mill: burnt lumber mill, roof fallen in, the wheel still turning in the stream
      o += farmhouse(c, 150, 176, 1.12, { ruin: true, wall: '#8a7a68', roof: '#3a2a22', stone: '#8a8070' });
      o += limb('M186,146 L236,156', '#3a2a20', 4) + waterwheel(c, 236, 160, 22, true) + E(236, 184, 22, 3, '#e8f0ff', 0, 0.6);
      o += smoke(128, 106, 0.9, 8, '#5a5450', 6) + C(130, 150, 2.4, '#ff8a2a', 0, 0.9) + C(170, 166, 2, '#ffb040', 0, 0.9) + C(112, 172, 2, '#ff7a1a', 0, 0.8);
      o += logPile(c, 60, 194, 1.1, true) + logPile(c, 300, 180, 0.8);
      o += gnollTent(c, 350, 176, 0.72, '#9a6a44');
      o += charLog(c, 110, 204, 1) + charLog(c, 200, 222, 1.2);
      o += pines(c, [[24, 184, 1.1, PINE2], [390, 206, 1.3]]);
      o += grass(86, 160, 240, dk(GR, 0.25), 80, 0.6, 1.5, 1.2);
      o += tufts(c, [[40, 232, 1], [150, 236, 0.9], [270, 238, 1]], '#7a8a40');
      return o + evening(c) + vignette(c, '#fff0d0', '#2a1408');
    },
    renders_valley: function (c) {
      var o = sky(c, '#3a2a3a', '#8a4a3a', '#e08a4a') + sun(c, 70, 110, 12, '#ffb070');
      o += smoke(210, 40, 2.2, 13, '#3a3034', 7) + smoke(60, 60, 1.6, 14, '#4a3a38', 6);
      o += crags(c, 101, 124, 40, '#6a3a3a', 30);
      o += spire(c, 206, 150, 90, 140, '#34292c');
      o += cliffs(c, [[40, 158, 100, 70, dk(RR, 0.3), 1.8], [370, 160, 110, 80, dk(RR, 0.3), 1.8]]);
      o += ground(c, 150, '#5a4038', '#3a2a24');
      o += cracks(102, 160, 236, '#2a1c18', 14) + pebbles(103, 160, 236, '#241814', 20);
      o += R(0, 150, 400, 30, c.lg([[0, '#ff6a2a', 0.18], [1, '#ff6a2a', 0]]));
      o += palisade(c, 110, 300, 166, 30, '#4a3226', 10);
      o += warTent(c, 150, 170, 0.7) + warTent(c, 270, 172, 0.8);
      o += brBanner(c, 104, 182, 58, 1) + brBanner(c, 214, 176, 50, 0.9) + brBanner(c, 316, 184, 60, 1, true);
      o += brazier(c, 190, 190, 1) + campfire(c, 60, 206, 0.9) + campfire(c, 344, 214, 0.8);
      o += stakes(c, 0, 90, 234, 26) + stakes(c, 320, 400, 238, 24);
      o += skull(c, 250, 214, 1.1) + bone(280, 226, 14, 0.3, 1) + rock(c, 140, 224, 20, 10, '#4a3a36');
      return o + vignette(c, '#ffb070', '#140808');
    },
    stonewatch_keep: function (c) {
      var o = rrSky(c, 300, 56, '#4a6aa8', '#d0a090', '#f0d0a0');
      o += cloud(120, 36, 0.9, 0.8) + smoke(290, 60, 1, 16, '#6a6064', 5);
      o += crags(c, 121, 112, 40, '#a07886', 30);
      // cliff with a waterfall on the left
      o += cliffs(c, [[40, 170, 130, 118, RR, 2]]) + grassCap(40, 52, 130, '#6a7e40');
      o += waterfall(c, 90, 64, 170, 16);
      o += hills(c, 122, 150, 34, '#6a7e46', 70) ;
      // the keep on its rise
      o += stoneFace(c, 190, 150, 180, 30, '#9a968e');
      o += crenels(c, 190, 370, 120, '#a8a49c', 6);
      o += stoneFace(c, 232, 146, 70, 96, '#aca89e', 8) + crenels(c, 228, 306, 50, '#b4b0a6', 7) + R(226, 50, 82, 6, c.cel('#9a968e'), 1.4);
      o += stoneFace(c, 196, 150, 26, 50, '#a4a096') + crenels(c, 194, 224, 100, '#aca89e', 5) + stoneFace(c, 330, 150, 30, 58, '#a4a096') + crenels(c, 328, 362, 92, '#aca89e', 5);
      o += P('M252,150 L252,126 Q267,110 282,126 L282,150 Z', '#140e0c', 1.8) + bars(c, 252, 150, 30, 20, false, '#4a4440');
      o += arrowSlit(250, 80) + arrowSlit(286, 80) + arrowSlit(268, 104) + arrowSlit(209, 118) + arrowSlit(345, 112);
      o += wallBanner(c, 244, 58, 14, 34) + wallBanner(c, 292, 58, 14, 34) + wallBanner(c, 209, 126, 10, 20) + wallBanner(c, 345, 118, 10, 22);
      o += brBanner(c, 267, 44, 26, 0.7);
      o += C(320, 110, 3, '#ff8a2a', 0, 0.8) + smoke(318, 100, 0.6, 17, '#5a5054', 4);
      o += ground(c, 170, GR, GR2);
      o += stream(c, [[92, 170], [120, 186], [100, 204], [60, 222], [20, 242]], 16, 34);
      o += pines(c, [[170, 172, 0.8], [376, 176, 0.9], [150, 188, 1.05, PINE2]]);
      o += rock(c, 140, 208, 20, 10, '#8a8680') + rock(c, 330, 204, 16, 9, '#9a9690') + brBanner(c, 206, 202, 42, 0.8, true);
      o += grass(123, 176, 240, dk(GR, 0.25), 70, 0.8, 1.6, 1.2);
      o += tufts(c, [[250, 234, 1], [380, 236, 1.1], [160, 238, 0.9]], '#7a8a40');
      return o + evening(c) + vignette(c);
    },
    galardell_valley: function (c) {
      var o = sky(c, '#2a2a4a', '#6a4a6a', '#c07a6a') + sun(c, 90, 96, 9, '#ffc890');
      o += skyWhelp(c, 190, 50, 1.1) + skyWhelp(c, 236, 70, 0.8, true) + skyWhelp(c, 290, 40, 0.9);
      o += crags(c, 141, 118, 40, '#5a4058', 30) + farPines(142, 0, 400, 120, 0.9, 1.3, '#23332c', 50);
      // the ruined wizard tower on its hill
      o += F('M250,146 Q300,86 360,100 Q400,110 410,150 Z', '#2e4432') + ruinTower(c, 318, 104, 34, 78, '#7a7488') + farPines(143, 250, 290, 140, 1, 1.3, '#1e3026', 6);
      o += hills(c, 144, 150, 14, '#2e4430', 50) + farPines(145, 0, 250, 150, 1.1, 1.5, '#1c2e24', 26);
      o += ground(c, 152, '#3e5634', '#243620');
      o += R(0, 152, 400, 40, c.lg([[0, '#8a7aa8', 0.35], [1, '#8a7aa8', 0]]));
      o += gnollTent(c, 200, 176, 0.8, '#3a3034') + gnollTent(c, 120, 172, 0.6, '#4a3a38', true) + boneTotem(c, 246, 186, 0.8, '#3a3034');
      o += campfire(c, 160, 196, 0.7);
      o += pines(c, [[24, 196, 1.4, '#1e3a2a'], [74, 178, 1.05, '#23402e'], [352, 196, 1.1, '#23402e'], [392, 226, 1.5, '#1a3024']]);
      o += rock(c, 290, 210, 22, 11, '#5a5662') + rock(c, 60, 226, 18, 9, '#5a5662');
      o += grass(146, 170, 240, '#1e2e18', 70, 0.8, 1.6, 1.2);
      o += tufts(c, [[130, 234, 1], [260, 236, 0.9]], '#4a6038');
      return o + vignette(c, '#c0a0ff', '#080812');
    },
    the_stockade: function (c) {
      var st = '#6e6a66', o = R(0, 0, 400, 240, '#1c1816');
      o += brickWall(c, 0, 0, 400, 170, st, 3, 13);
      // vaulted ceiling beams
      o += R(0, 0, 400, 22, c.lg([[0, '#0c0a0a'], [1, '#2a2622']])) + L('M0,22 L400,22', OL, 3);
      [30, 130, 230, 330].forEach(function (x) { o += P(pd([[x - 6, 0], [x + 6, 0], [x + 8, 30], [x - 8, 30]], true), c.cel('#4a3a2c'), 1.6); });
      // cells along the block, one door ripped open, one torn bars
      o += cell(c, 18, 166, 56, 108, false, st) + cell(c, 118, 166, 56, 108, true, st) + cell(c, 238, 166, 56, 108, false, st) + cell(c, 338, 166, 50, 108, false, st);
      o += P('M246,166 L246,94 M252,166 L256,112', 'none', 0);
      o += torch(c, 96, 90, 1) + torch(c, 214, 90, 1) + torch(c, 318, 90, 1);
      o += R(0, 150, 400, 20, c.lg([[0, '#000', 0], [1, '#000', 0.4]]));
      o += flagFloor(c, 166, 200, '#5a5450', 4);
      o += R(0, 166, 400, 6, '#000', 0);
      o += strawPile(c, 46, 184, 1) + strawPile(c, 290, 180, 0.8) + straw(5, 0, 400, 176, 236, 60);
      o += E(200, 214, 40, 6, '#3a4a5a', 0, 0.7) + E(196, 212, 20, 2, '#8aa0b8', 0, 0.5);
      o += chain(152, 150, 16, 1) + E(160, 170, 7, 3, 'none', 0) + L('M146,174 q6,-6 14,0', OL, 3.6) + L('M146,174 q6,-6 14,0', '#6a6e76', 1.8);
      o += crate(c, 372, 206, 1.1, '#7a5434') + barrel(c, 352, 210, 1, '#6a4428');
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.1], [1, '#000', 0.55]]));
    },
    stockade_depths: function (c) {
      var st = '#5e5a58', o = R(0, 0, 400, 240, '#141212');
      o += brickWall(c, 0, 0, 400, 176, st, 9, 14);
      // two big dark arches in the back wall
      [[40, 150, 90, 120], [270, 150, 90, 120]].forEach(function (a) {
        o += P('M' + pt([a[0] - 6, a[1]]) + 'L' + pt([a[0] - 6, a[1] - a[3] + a[2] * 0.5]) + 'Q' + pt([a[0] + a[2] / 2, a[1] - a[3] - a[2] * 0.2]) + ' ' + pt([a[0] + a[2] + 6, a[1] - a[3] + a[2] * 0.5]) + 'L' + pt([a[0] + a[2] + 6, a[1]]) + 'Z', c.cel('#6a6664'), 1.8) +
          P('M' + pt([a[0], a[1]]) + 'L' + pt([a[0], a[1] - a[3] + a[2] * 0.5]) + 'Q' + pt([a[0] + a[2] / 2, a[1] - a[3] - a[2] * 0.06]) + ' ' + pt([a[0] + a[2], a[1] - a[3] + a[2] * 0.5]) + 'L' + pt([a[0] + a[2], a[1]]) + 'Z', c.lg([[0, '#060504'], [1, '#1a1612']]), 1.6);
      });
      o += bars(c, 270, 150, 90, 70, true, '#4e525a');
      // drain grate spilling into the channel
      o += R(170, 110, 60, 50, '#0c0a08', 1.8) + bars(c, 170, 160, 60, 50, false, '#4e525a');
      o += P('M184,150 L216,150 L222,176 L178,176 Z', c.lg([[0, '#6a8aa0'], [1, '#3a5a70']]), 1.2) + L('M188,152 L186,174 M200,152 L200,174 M212,152 L214,174', '#c8dce8', 1, 0.7);
      o += torch(c, 150, 70, 1) + torch(c, 250, 70, 1);
      o += chain(118, 0, 90, 1.2) + chain(372, 0, 70, 1.1) + chain(236, 0, 40, 1);
      o += R(0, 172, 400, 10, '#000', 0) ;
      o += flagFloor(c, 176, 200, '#4e4844', 7);
      // flooded drain channel across the floor
      o += R(-2, 180, 404, 20, c.lg([[0, '#2e4a5a'], [1, '#1a2e3c']])) + L('M-2,180 L402,180', '#8a8680', 3) + L('M-2,200 L402,200', OL, 2.4) + L('M-2,199 L402,199', '#6a6662', 2);
      o += L('M20,188 q8,-2 16,0 M120,192 q10,-2 20,0 M240,186 q8,-2 16,0 M330,192 q10,-2 20,0', '#8ab0c8', 1.1, 0.8);
      o += barricade(c, 330, 222, 0.9);
      o += E(120, 226, 30, 5, '#2a3a48', 0, 0.7) + straw(8, 0, 400, 206, 240, 30, '#a89048');
      o += crate(c, 30, 226, 1, '#6a4a2e') + skull(c, 190, 230, 0.9);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.12], [1, '#000', 0.6]]));
    }
  };
  function cracks(seed, y0, y1, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = r() * 400, y = y0 + r() * (y1 - y0), k = 0.6 + (y - y0) / (y1 - y0);
      d += 'M' + pt([x, y]);
      for (var j = 0; j < 3; j++) { x += (r() - 0.3) * 22 * k; y += (r() - 0.5) * 8 * k; d += 'L' + pt([x, y]); }
    }
    return L(d, col, 1.6);
  }
  function charLog(c, x, y, s) {
    return E(x, y + 2, 20 * s, 2.4 * s, '#000', 0, 0.25) + limb('M' + pt([x - 18 * s, y]) + 'L' + pt([x + 18 * s, y - 3 * s]), '#3a2a22', 5 * s) + L('M' + pt([x - 10 * s, y - 1 * s]) + 'l' + n(4 * s) + ',0 M' + pt([x + 4 * s, y - 2 * s]) + 'l' + n(5 * s) + ',0', '#ff7a2a', 1.4 * s, 0.9);
  }

  // ============================================================
  //  MOB PIECES (shared rigs)
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

  // ---- Defias ----
  // hooded head with the red Defias mask over nose and mouth (facing left)
  function defiasHead(c, x, y, o) {
    var sk = o.skin || '#e4b48a', hood = o.hood || DEF_HOOD, mask = o.mask || DEF_RED, s = '';
    // hood back / cowl hanging behind the neck
    if (!o.bandana) s += P('M' + pt([x - 4, y - 14]) + 'C' + pt([x + 6, y - 20]) + ' ' + pt([x + 18, y - 14]) + ' ' + pt([x + 17, y + 2]) + 'L' + pt([x + 20, y + 20]) + 'L' + pt([x + 6, y + 18]) + 'L' + pt([x + 2, y + 4]) + 'Z', c.cel(dk(hood, 0.12)), 2);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8));
    // eye + angry brow
    s += E(x - 5, y - 3, 2.2, 1.7, '#ffffff', 1) + C(x - 5.6, y - 3, 1.1, OL);
    s += L('M' + pt([x - 9, y - 7.5]) + 'L' + pt([x - 1, y - 5]), OL, 2.2);
    // mask over nose and mouth, knot at the back
    s += body(c, 'M' + pt([x - 14, y + 0.5]) + 'L' + pt([x + 10, y - 1]) + 'L' + pt([x + 10, y + 5]) + 'C' + pt([x + 8, y + 11]) + ' ' + pt([x + 2, y + 15]) + ' ' + pt([x - 4, y + 14]) + 'L' + pt([x - 9, y + 13]) + 'C' + pt([x - 11, y + 9]) + ' ' + pt([x - 12, y + 5]) + ' ' + pt([x - 14, y + 0.5]) + 'Z', mask,
      L('M' + pt([x - 11, y + 5]) + 'Q' + pt([x - 4, y + 7]) + ' ' + pt([x + 4, y + 5]) + 'M' + pt([x - 8, y + 10]) + 'Q' + pt([x - 2, y + 11]) + ' ' + pt([x + 4, y + 9]), dk(mask, 0.35), 1) + F('M' + pt([x + 2, y - 2]) + 'L' + pt([x + 12, y - 2]) + 'L' + pt([x + 12, y + 16]) + 'L' + pt([x, y + 16]) + 'Z', dk(mask, 0.3), 0.7), 1.8);
    s += P('M' + pt([x + 9, y + 1]) + 'L' + pt([x + 17, y + 3]) + 'L' + pt([x + 15, y + 8]) + 'Z', c.cel(mask), 1.4) + P('M' + pt([x + 9, y + 2]) + 'L' + pt([x + 18, y + 9]) + 'L' + pt([x + 13, y + 11]) + 'Z', c.cel(dk(mask, 0.1)), 1.4);
    if (o.bandana) {
      // no hood: an ear, a head-hugging bandana knotted at the back with two tails
      var bd = o.bandana;
      s += E(x + 5, y + 0.5, 2.6, 3.4, c.cel(sk), 1.4) + L('M' + pt([x + 4.4, y - 1]) + 'q1,1.5 0,3', dk(sk, 0.35), 0.9);
      s += P('M' + pt([x + 11, y - 7]) + 'L' + pt([x + 21, y - 4]) + 'L' + pt([x + 19, y + 1]) + 'Z', c.cel(dk(bd, 0.12)), 1.4) + P('M' + pt([x + 11, y - 6]) + 'L' + pt([x + 18, y + 6]) + 'L' + pt([x + 14, y + 7]) + 'Z', c.cel(dk(bd, 0.2)), 1.4);
      s += body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 12, y - 16]) + ' ' + pt([x + 2, y - 20]) + ' ' + pt([x + 10, y - 13]) + 'C' + pt([x + 13, y - 10]) + ' ' + pt([x + 13, y - 5]) + ' ' + pt([x + 12, y - 1]) + 'C' + pt([x + 9, y - 5]) + ' ' + pt([x + 4, y - 7]) + ' ' + pt([x - 2, y - 7]) + 'C' + pt([x - 6, y - 7]) + ' ' + pt([x - 9, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', bd,
        F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 15, y - 20]) + 'L' + pt([x + 15, y]) + 'L' + pt([x + 6, y - 4]) + 'C' + pt([x + 8, y - 10]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(bd, 0.3), 0.75) + L('M' + pt([x - 6, y - 13]) + 'Q' + pt([x, y - 17]) + ' ' + pt([x + 6, y - 15]), lt(bd, 0.25), 1, 0.7) + C(x - 1, y - 11, 1, dk(bd, 0.4), 0, 0.8) + C(x + 5, y - 12, 1, dk(bd, 0.4), 0, 0.8), 2);
      s += C(x + 12, y - 5, 2.6, c.cel(dk(bd, 0.1)), 1.4);
      return s;
    }
    // hood front: frames the face, open to the left
    s += body(c, 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 17]) + ' ' + pt([x, y - 22]) + ' ' + pt([x + 9, y - 18]) + 'C' + pt([x + 15, y - 14]) + ' ' + pt([x + 16, y - 4]) + ' ' + pt([x + 14, y + 6]) + 'L' + pt([x + 8, y + 4]) + 'C' + pt([x + 8, y - 4]) + ' ' + pt([x + 4, y - 10]) + ' ' + pt([x - 3, y - 10]) + 'C' + pt([x - 7, y - 9]) + ' ' + pt([x - 10, y - 7]) + ' ' + pt([x - 12, y - 4]) + 'Z', hood,
      F('M' + pt([x + 4, y - 24]) + 'L' + pt([x + 18, y - 24]) + 'L' + pt([x + 18, y + 8]) + 'L' + pt([x + 9, y + 8]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 4, y - 24]) + 'Z', dk(hood, 0.3), 0.75) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 17]) + ' ' + pt([x + 8, y - 14]), lt(hood, 0.2), 1, 0.7), 2);
    return s;
  }
  // ---- murloc (same family shape as the Elwynn murlocs, facing left) ----
  function murloc(c, o) {
    var f = o.skin, fd = dk(f, 0.28), fin = o.fin, out = '';
    var bd = 'M30,66 C28,50 42,40 58,42 C76,44 90,56 90,76 C90,94 80,108 62,108 C46,108 36,98 34,86 C33,80 31,72 30,66 Z';
    out += shadow(c, 62, 32);
    if (o.back) out += o.back(c);
    out += P('M66,98 C74,90 88,94 88,104 C88,112 80,114 74,112 Z', c.cel(fd), 2.2) + tube([[80, 108], [86, 116], [78, 120]], 6.5, fd) + P('M66,118 L82,118 L86,123 L62,123 Z', c.cel(dk(fin, 0.2)), 2);
    out += tube([[74, 76], [84, 88], [80, 96]], 5.5, fd);
    out += P('M54,43 L56,30 L63,39 L69,27 L74,41 L82,33 L84,49 L93,45 L91,62 C87,54 74,44 54,43 Z', c.cel(fin), 2.2) + L('M60,40 L57,33 M68,40 L69,31 M76,44 L81,37 M84,51 L91,48', dk(fin, 0.35), 1.2);
    out += body(c, bd, f, F('M36,82 C40,98 52,106 64,106 C72,106 80,100 80,92 C68,98 50,94 40,78 Z', o.belly, 0.9) +
      C(66, 56, 3, fd, 0, 0.6) + C(76, 62, 2.4, fd, 0, 0.6) + C(72, 72, 2, fd, 0, 0.5) + C(60, 50, 2, fd, 0, 0.5) + (o.marks ? o.marks(c) : ''), 2.2);
    out += P('M80,60 L92,56 L90,66 L96,68 L86,74 Z', c.cel(fin), 2);
    out += P('M27,67 C36,73 48,73 58,69 C56,79 50,88 40,88 C34,88 29.5,82 28.5,74 Z', c.cel('#7a1a22'), 2.2);
    out += F('M33,82 C37,86 45,86 50,82 C45,80 38,80 33,82 Z', '#d0566a', 0.9);
    out += F('M31,69 l2,4.5 l2,-4 z M36,70.5 l2,4.5 l2,-4.3 z M41,71 l2,4.5 l2,-4.5 z M46,70.5 l2,4.2 l2,-4.5 z M51,69.5 l1.8,4 l1.8,-4.4 z', '#f6f0dc');
    out += F('M36,87.5 l1.6,-3.5 l1.6,3.6 z M42,87.6 l1.6,-3.6 l1.6,3.4 z', '#f6f0dc');
    out += C(55, 47, 5.2, '#f2ecb0', 2) + C(53.5, 47.5, 2.2, '#140c08', 0);
    out += C(42, 51, 6.8, c.cel(o.eyeC || '#f6eeb8'), 2.2) + E(39.5, 51.5, 2, 3.6, '#140c08', 0) + C(40.8, 49, 1.1, '#fff', 0);
    out += L('M35,44 L46,46', OL, 2);
    if (o.fItem) out += o.fItem(c);
    out += tube([[56, 80], [44, 90], [33, 92]], 5.5, f, fd);
    out += P('M34,88 L25,86 L27,90 L22,92 L28,94 L25,98 L34,96 Z', c.cel(lt(f, 0.1)), 1.8);
    if (o.front) out += o.front(c);
    out += P('M52,98 C60,88 76,92 78,102 C80,110 72,114 64,112 Z', c.cel(f), 2.2) + tube([[66, 108], [58, 115], [52, 119]], 7, f, fd) + P('M36,118 L56,118 L60,123 L32,123 L36,121 Z', c.cel(fin), 2.2) + L('M42,119 L40,123 M49,119 L48,123', dk(fin, 0.4), 1);
    return G(out, at(o.scale || 1, 62, 123));
  }

  // ---- goretusk boar (shaggy, facing left) ----
  function goretusk(c, o) {
    var col = o.col, mane = o.mane, tk = o.tusk || 1, s = shadow(c, 64, 50), legFar = dk(col, 0.25);
    s += limb('M54,92 L56,106 L55,116', legFar, 10) + hoofs(55, 122) + limb('M104,90 L108,104 L106,116', legFar, 10) + hoofs(106, 122);
    s += L('M114,76 C123,70 127,80 120,83 C115,84 117,76 122,76', OL, 4.5) + L('M114,76 C123,70 127,80 120,83 C115,84 117,76 122,76', col, 2) + P('M121,82 L126,88 L119,86 Z', dk(mane, 0.1), 1);
    var bd = 'M34,70 C38,56 64,50 90,54 C110,58 120,70 116,86 C112,98 94,100 74,99 C54,100 40,98 34,90 C30,84 30,76 34,70 Z';
    var shag = '', r = rng(o.seed || 3);
    for (var i = 0; i < 26; i++) { var x = 40 + r() * 74, y = 62 + r() * 30; shag += 'M' + pt([x, y]) + 'l' + n(3 + r() * 2) + ',' + n(4 + r() * 3); }
    s += body(c, bd, col, F('M24,88 C50,102 90,102 122,90 L122,104 L24,104 Z', dk(col, 0.3), 0.85) + F('M44,60 C64,54 94,54 110,62 C92,60 64,60 44,68 Z', lt(col, 0.2), 0.5) + L(shag, dk(col, 0.35), 1.2, 0.8) + (o.scars ? L('M72,66 L82,78 M78,64 L88,76', lt(col, 0.45), 1.6) : ''));
    // shaggy belly fringe
    s += P('M40,92 L44,100 L48,94 L53,102 L58,95 L64,103 L70,96 L76,103 L82,96 L88,102 L94,95 L100,100 L104,92 C90,98 60,98 40,92 Z', c.cel(dk(col, 0.18)), 1.6);
    // long bristly mane along the spine
    var md = 'M38,66 L36,50 L46,58 L48,42 L56,54 L62,38 L68,52 L76,38 L80,52 L90,40 L92,54 L102,46 L102,58 L112,56 L108,66 C92,58 60,56 38,66 Z';
    s += body(c, md, mane, L('M48,56 L50,48 M62,52 L63,44 M76,52 L77,44 M90,54 L92,46', lt(mane, 0.25), 1, 0.8), 2);
    var hd = 'M50,58 C40,57 28,64 22,72 L14,80 C10,84 10,92 14,95 L24,97 C32,99 44,97 52,90 C56,82 56,66 50,58 Z';
    s += body(c, hd, col, F('M14,92 C26,96 42,96 54,86 L56,100 L10,100 Z', dk(col, 0.3), 0.85) + F('M30,66 C38,60 46,58 50,60 C44,62 36,66 30,72 Z', lt(col, 0.2), 0.5));
    // brow tuft + ear
    s += P('M26,70 L28,60 L34,66 L38,56 L42,64 L48,58 L50,66 C42,64 34,66 26,70 Z', c.cel(mane), 1.8);
    s += P('M42,60 L46,46 L53,60 Z', c.cel(dk(col, 0.1)), 2) + P('M45,58 L47,51 L50,58 Z', '#8a4a3a', 0);
    // chin beard
    s += P('M22,96 L24,104 L28,98 L32,106 L36,98 L42,104 L44,95 C36,98 28,98 22,96 Z', c.cel(mane), 1.6);
    s += E(13, 88, 4.6, 7, c.cel(o.snout || '#a87a6a'), 2) + E(12, 86, 1, 1.6, OL) + E(12, 91, 1, 1.6, OL);
    s += C(32, 76, 2.4, o.eye || '#ff6a2a', 1.2) + C(31.6, 75.6, 0.8, '#fff', 0) + L('M25,71 L38,75', OL, 2.4);
    var t = 2.2 * tk;
    s += P('M' + pt([24, 93]) + 'C' + pt([22 - 4 * t, 92]) + ' ' + pt([19 - 4 * t, 86 - 4 * t]) + ' ' + pt([21 - 2 * t, 80 - 6 * t]) + 'C' + pt([22, 86]) + ' ' + pt([24, 88]) + ' ' + pt([29, 90]) + 'Z', c.cel('#f4ecd6'), 1.8);
    s += L('M16,95 C22,97 30,96 36,93', OL, 1.4);
    s += limb('M44,90 L42,106 L42,116', col, 11) + hoofs(42, 122) + limb('M96,88 L100,104 L98,116', col, 11) + hoofs(98, 122);
    return G(s, at(o.scale || 1, 64, 122));
  }
  // ---- Riverpaw gnoll: same head as art.js riverpaw_gnoll / hogger (ported, drawn facing right, then mirrored) ----
  function gnollHeadR(c, X, Y, r, o) {
    var f = o.skin, fd = dk(f, 0.3), out = '';
    out += P(pd([[X - r * 0.1, Y - r * 0.95], [X - r * 0.95, Y - r * 0.85], [X - r * 0.75, Y - r * 0.45], [X - r * 1.6, Y - r * 0.15], [X - r * 1.05, Y + r * 0.2], [X - r * 1.7, Y + r * 0.7], [X - r * 0.95, Y + r * 0.9], [X - r * 1.35, Y + r * 1.55], [X - r * 0.3, Y + r * 1.2]], true), c.cel(o.mane || dk(f, 0.45)), 2);
    out += P(pd([[X - r * 0.1, Y - r * 0.7], [X + r * 0.1, Y - r * 1.9], [X + r * 0.55, Y - r * 0.7]], true), fd, 2);
    out += P('M' + pt([X - r, Y + r * 0.1]) + 'C' + pt([X - r, Y - r * 1.1]) + ' ' + pt([X + r * 0.3, Y - r * 1.2]) + ' ' + pt([X + r * 0.75, Y - r * 0.55]) + 'L' + pt([X + r * 1.9, Y - r * 0.15]) + 'C' + pt([X + r * 2.25, Y - r * 0.05]) + ' ' + pt([X + r * 2.3, Y + r * 0.35]) + ' ' + pt([X + r * 2.0, Y + r * 0.5]) + 'L' + pt([X + r * 0.9, Y + r * 0.62]) + 'C' + pt([X + r * 0.4, Y + r * 1.1]) + ' ' + pt([X - r * 0.6, Y + r * 1.05]) + ' ' + pt([X - r, Y + r * 0.1]) + 'Z', c.cel(f), 2.5);
    out += F('M' + pt([X + r * 1.35, Y - r * 0.3]) + 'L' + pt([X + r * 1.9, Y - r * 0.15]) + 'C' + pt([X + r * 2.25, Y - r * 0.05]) + ' ' + pt([X + r * 2.3, Y + r * 0.35]) + ' ' + pt([X + r * 2.0, Y + r * 0.5]) + 'L' + pt([X + r * 1.35, Y + r * 0.56]) + 'Z', dk(f, 0.55), 0.55);
    out += P('M' + pt([X + r * 0.7, Y + r * 0.58]) + 'L' + pt([X + r * 1.85, Y + r * 0.55]) + 'C' + pt([X + r * 1.75, Y + r * 0.98]) + ' ' + pt([X + r * 1.2, Y + r * 1.12]) + ' ' + pt([X + r * 0.55, Y + r * 0.98]) + 'Z', dk(f, 0.2), 2);
    out += F('M' + pt([X + r * 0.95, Y + r * 0.6]) + 'l1.5,2.6 l1.5,-2.6 z M' + pt([X + r * 1.45, Y + r * 0.58]) + 'l1.4,2.4 l1.4,-2.4 z', '#f4ecd6');
    out += E(X + r * 2.1, Y + r * 0.02, 2.5, 2.1, '#140c08', 0);
    out += C(X - r * 0.35, Y - r * 0.35, 1.6, dk(f, 0.45), 0, 0.7) + C(X - r * 0.1, Y + r * 0.5, 1.4, dk(f, 0.45), 0, 0.7) + C(X + r * 0.8, Y - r * 0.55, 1.2, dk(f, 0.45), 0, 0.6);
    out += P('M' + pt([X + r * 0.2, Y - r * 0.4]) + 'Q' + pt([X + r * 0.6, Y - r * 0.62]) + ' ' + pt([X + r * 0.95, Y - r * 0.35]) + 'Q' + pt([X + r * 0.6, Y - r * 0.1]) + ' ' + pt([X + r * 0.2, Y - r * 0.4]) + 'Z', o.eyeC || '#f5c02a', 1.2) + C(X + r * 0.66, Y - r * 0.37, 1.1, '#140c08', 0);
    out += L('M' + pt([X + r * 0.05, Y - r * 0.78]) + 'L' + pt([X + r * 1.05, Y - r * 0.45]), OL, 2.2);
    out += P(pd([[X - r * 0.8, Y - r * 0.5], [X - r * 0.62, Y - r * 2.0], [X + r * 0.02, Y - r * 0.72]], true), f, 2) + F(pd([[X - r * 0.6, Y - r * 0.8], [X - r * 0.58, Y - r * 1.6], [X - r * 0.25, Y - r * 0.85]], true), '#8a4a44', 0.8);
    return out;
  }
  function gnollHead(c, X, Y, r, o) { return G(gnollHeadR(c, X, Y, r, o), 'matrix(-1,0,0,1,' + n(2 * X) + ',0)'); }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function spikedClub(c, p, len, ang, w) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca, bot = [x - ca * 10, y - sa * 10], top = [x + ca * len, y + sa * len];
    var d = 'M' + pt([bot[0] + px * 3, bot[1] + py * 3]) + 'L' + pt([top[0] + px * w, top[1] + py * w]) + 'Q' + pt([top[0] + ca * w * 1.2, top[1] + sa * w * 1.2]) + ' ' + pt([top[0] - px * w, top[1] - py * w]) + 'L' + pt([bot[0] - px * 3, bot[1] - py * 3]) + 'Z';
    var o = '', sp = '';
    [[0.5, 1], [0.62, -1], [0.74, 1], [0.86, -1], [0.97, 1], [0.8, 1], [0.56, -1]].forEach(function (q) {
      var t = q[0], cx = x + ca * len * t, cy = y + sa * len * t, ww = 3 + (w - 3) * t, sx = cx + px * q[1] * ww, sy = cy + py * q[1] * ww;
      sp += P(pd([[sx - ca * 2.4, sy - sa * 2.4], [sx + px * q[1] * 6, sy + py * q[1] * 6], [sx + ca * 2.4, sy + sa * 2.4]], true), c.cel('#b8bcc0'), 1.2);
    });
    sp += P(pd([[top[0] + ca * w - px * 2, top[1] + sa * w - py * 2], [top[0] + ca * (w + 7), top[1] + sa * (w + 7)], [top[0] + ca * w + px * 2, top[1] + sa * w + py * 2]], true), c.cel('#b8bcc0'), 1.2);
    o += sp + body(c, d, '#7a5234', L('M' + pt([x + ca * len * 0.3 + px, y + sa * len * 0.3 + py]) + 'L' + pt([top[0] - ca * 4 + px * w * 0.4, top[1] - sa * 4 + py * w * 0.4]), '#a87a52', 1.2, 0.7) + L('M' + pt([x + ca * len * 0.45 - px * 4, y + sa * len * 0.45 - py * 4]) + 'L' + pt([x + ca * len * 0.45 + px * 4, y + sa * len * 0.45 + py * 4]) + 'M' + pt([x + ca * len * 0.7 - px * 5, y + sa * len * 0.7 - py * 5]) + 'L' + pt([x + ca * len * 0.7 + px * 5, y + sa * len * 0.7 + py * 5]), '#4a3020', 1.4), 2);
    o += L('M' + pt([x - ca * 3 - px * 4, y - sa * 3 - py * 4]) + 'L' + pt([x - ca * 3 + px * 4, y - sa * 3 + py * 4]), '#3a2a1a', 2);
    return o;
  }
  // butcher's cleaver on a short haft: broad blade on the far side (v < 0), notched edge, hanging hole
  function cleaver(c, p, len, ang, bw) {
    var x = p[0], y = p[1], ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
    var q = function (u, v) { return [x + ca * u + px * v, y + sa * u + py * v]; };
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(len * 0.52, 0)), '#6a4428', 3.6) + L('M' + pt(q(-2, -3)) + 'L' + pt(q(0, 3)) + 'M' + pt(q(3, -3)) + 'L' + pt(q(5, 3)) + 'M' + pt(q(8, -3)) + 'L' + pt(q(10, 3)), '#3a2a1a', 1.4);
    var d = pd([q(len * 0.44, 2.5), q(len, 2.5), q(len + 1, -2), q(len - 1, -bw - 1), q(len * 0.66, -bw), q(len * 0.56, -bw + 1.5), q(len * 0.46, -bw * 0.5)], true);
    o += P(d, c.cel('#a0a6ac'), 2) + L('M' + pt(q(len * 0.5, -bw * 0.52)) + 'L' + pt(q(len * 0.66, -bw + 0.8)) + 'L' + pt(q(len - 2, -bw)), '#ffffff', 1.1, 0.6) + L('M' + pt(q(len * 0.46, 1.5)) + 'L' + pt(q(len - 1, 1.5)), '#5a5e64', 1.4);
    o += F(pd([q(len * 0.74, -bw - 0.2), q(len * 0.78, -bw + 2.4), q(len * 0.82, -bw - 0.2)], true), '#c8b07a') + C(q(len * 0.86, -3)[0], q(len * 0.86, -3)[1], 1.9, '#2a1a10', 1) + E(q(len * 0.6, -4)[0], q(len * 0.6, -4)[1], 2.6, 1.8, '#7a4a2a', 0, 0.55);
    return o;
  }
  // ---- heads (facing left, 3/4) ----
  function orcHead(c, x, y, o) {
    var sk = o.skin || '#6a8a3a', s = '';
    s += P('M' + pt([x + 8, y - 2]) + 'L' + pt([x + 20, y - 9]) + 'L' + pt([x + 12, y + 5]) + 'Z', c.cel(sk), 2);
    var d = 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 7]) + 'L' + pt([x + 12, y + 6]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 6, y + 15]) + 'L' + pt([x - 14, y + 12]) + 'C' + pt([x - 16, y + 7]) + ' ' + pt([x - 15, y + 3]) + ' ' + pt([x - 14, y]) + 'L' + pt([x - 16, y - 1]) + 'L' + pt([x - 12, y - 4]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.25), 0.8));
    s += L('M' + pt([x - 14, y - 4]) + 'L' + pt([x - 1, y - 2]), OL, 2.6);
    s += C(x - 7, y + 0.5, 1.7, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 13, y + 9]) + 'L' + pt([x - 3, y + 9]), OL, 1.4);
    s += P('M' + pt([x - 12, y + 10]) + 'L' + pt([x - 13, y + 3]) + 'L' + pt([x - 9, y + 9]) + 'Z', '#f4ecd6', 1.1) + P('M' + pt([x - 6, y + 10]) + 'L' + pt([x - 6.5, y + 4]) + 'L' + pt([x - 3, y + 9]) + 'Z', '#f4ecd6', 1.1);
    if (!o.hood) {
      if (o.bald) s += E(x + 4, y - 15, 4, 3, dk(sk, 0.2), 0, 0.6);
      else s += P('M' + pt([x - 2, y - 16]) + 'C' + pt([x + 2, y - 26]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 10, y - 14]) + 'Z', '#1e1812', 2) +
        P('M' + pt([x + 9, y - 18]) + 'C' + pt([x + 20, y - 16]) + ' ' + pt([x + 24, y - 4]) + ' ' + pt([x + 20, y + 8]) + 'C' + pt([x + 18, y - 2]) + ' ' + pt([x + 14, y - 10]) + ' ' + pt([x + 8, y - 12]) + 'Z', '#1e1812', 2) +
        L('M' + pt([x + 1, y - 19]) + 'L' + pt([x + 10, y - 19]), '#c8a040', 2);
    }
    return s;
  }
  function humanHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', s = '';
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8));
    s += E(x + 5, y + 1, 2.4, 3.4, c.cel(sk), 1.4);
    s += C(x - 5, y - 1, 1.6, '#1a1009') + L('M' + pt([x - 8, y - 5]) + 'L' + pt([x - 2, y - 4.5]), o.hairCol || '#5a3a22', 1.8);
    s += L('M' + pt([x - 8, y + 7]) + 'L' + pt([x - 3, y + 7]), OL, 1.3);
    if (o.beard) s += P('M' + pt([x - 9, y + 5]) + 'C' + pt([x - 8, y + 16]) + ' ' + pt([x + 2, y + 17]) + ' ' + pt([x + 8, y + 7]) + 'L' + pt([x + 6, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 9, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.hat === 'bandana') {
      s += P('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 8, y - 5]) + 'C' + pt([x + 2, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 11, y - 4]) + 'Z', c.cel(o.hatCol || '#2a5aa0'), 2);
      s += P('M' + pt([x + 10, y - 7]) + 'L' + pt([x + 20, y - 2]) + 'L' + pt([x + 16, y + 4]) + 'Z', c.cel(o.hatCol || '#2a5aa0'), 1.6) + C(x + 11, y - 7, 2.4, c.cel(o.hatCol || '#2a5aa0'), 1.4);
    } else if (o.hat === 'helm') {
      s += P('M' + pt([x - 17, y - 4]) + 'C' + pt([x - 10, y - 2]) + ' ' + pt([x + 10, y - 2]) + ' ' + pt([x + 18, y - 4]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x - 12, y - 8]) + ' ' + pt([x - 17, y - 4]) + 'Z', c.cel('#b8c0c8'), 2);
      s += body(c, 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 20]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 11, y - 6]) + 'Z', '#b8c0c8', F('M' + pt([x + 3, y - 22]) + 'L' + pt([x + 12, y - 22]) + 'L' + pt([x + 12, y - 4]) + 'L' + pt([x + 3, y - 4]) + 'Z', '#7a828a', 0.7), 2);
      s += P('M' + pt([x - 2, y - 20]) + 'C' + pt([x + 2, y - 26]) + ' ' + pt([x + 8, y - 26]) + ' ' + pt([x + 12, y - 22]) + 'L' + pt([x + 6, y - 18]) + 'Z', c.cel(o.plume || '#2a5aa0'), 1.6);
    } else if (o.hat === 'tricorne') {
      s += P('M' + pt([x - 20, y - 6]) + 'C' + pt([x - 10, y - 3]) + ' ' + pt([x + 10, y - 3]) + ' ' + pt([x + 20, y - 7]) + 'L' + pt([x + 14, y - 16]) + 'C' + pt([x + 6, y - 24]) + ' ' + pt([x - 8, y - 24]) + ' ' + pt([x - 14, y - 16]) + 'Z', c.cel('#1e2a44'), 2.2);
      s += L('M' + pt([x - 19, y - 7]) + 'C' + pt([x - 10, y - 4]) + ' ' + pt([x + 10, y - 4]) + ' ' + pt([x + 19, y - 8]), '#e0b848', 1.8);
      s += C(x + 2, y - 11, 2.4, '#e0b848', 1.2);
      s += P('M' + pt([x + 8, y - 18]) + 'C' + pt([x + 16, y - 28]) + ' ' + pt([x + 26, y - 26]) + ' ' + pt([x + 28, y - 20]) + 'C' + pt([x + 22, y - 22]) + ' ' + pt([x + 16, y - 20]) + ' ' + pt([x + 12, y - 14]) + 'Z', c.cel('#f4f4f0'), 1.4);
    } else {
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(o.hairCol || '#5a3a22'), 2);
    }
    return s;
  }
  // hood over an orc head
  function hood(c, x, y, col, trim) {
    var d = 'M' + pt([x - 14, y + 2]) + 'C' + pt([x - 18, y - 16]) + ' ' + pt([x - 2, y - 26]) + ' ' + pt([x + 10, y - 22]) + 'C' + pt([x + 22, y - 16]) + ' ' + pt([x + 22, y + 6]) + ' ' + pt([x + 16, y + 18]) + 'L' + pt([x + 6, y + 18]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x - 14, y + 2]) + 'Z';
    return body(_cur, d, col, F('M' + pt([x + 8, y - 24]) + 'L' + pt([x + 24, y - 24]) + 'L' + pt([x + 24, y + 20]) + 'L' + pt([x + 10, y + 20]) + 'Z', dk(col, 0.3), 0.8) + (trim ? L('M' + pt([x - 14, y + 2]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x + 4, y - 8]) + ' ' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y + 18]), trim, 2.4) : ''), 2.2);
  }
  // shadowed face inside a hood: just a dark face with glowing eyes and tusks
  function hoodFace(c, x, y, sk, eye) {
    return P('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 9, y - 11]) + ' ' + pt([x + 1, y - 12]) + ' ' + pt([x + 4, y - 6]) + 'L' + pt([x + 5, y + 12]) + 'L' + pt([x - 6, y + 14]) + 'L' + pt([x - 13, y + 10]) + 'Z', dk(sk, 0.35), 2) +
      L('M' + pt([x - 11, y - 1]) + 'L' + pt([x - 1, y]), OL, 2.2) + C(x - 6, y + 2, 1.7, eye, 0) + C(x - 6, y + 2, 4, glow(c, eye, 0.6)) +
      P('M' + pt([x - 11, y + 11]) + 'L' + pt([x - 12, y + 5]) + 'L' + pt([x - 8, y + 10]) + 'Z', '#f4ecd6', 1.1) + P('M' + pt([x - 5, y + 12]) + 'L' + pt([x - 5, y + 6]) + 'L' + pt([x - 2, y + 11]) + 'Z', '#f4ecd6', 1.1);
  }
  // ---- dwarf (Ironforge, facing left: squat, broad, big braided beard over the chest) ----
  function dwarfHead(c, x, y, o) {
    var sk = o.skin || '#e09c78', hc = o.hair || '#7a4422', band = o.band || '#d6a53c', bl = o.beardLen || 30, s = '';
    s += E(x + 10, y + 1, 3.4, 4.6, c.cel(sk), 1.8);
    var d = 'M' + pt([x - 11, y - 4]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 12, y + 7]) + 'C' + pt([x + 7, y + 13]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x - 11, y + 7]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 14]) + 'L' + pt([x + 2, y + 14]) + 'C' + pt([x + 7, y + 4]) + ' ' + pt([x + 7, y - 8]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.22), 0.8) + (o.scar ? L('M' + pt([x - 8, y - 10]) + 'L' + pt([x - 2, y + 1]), dk(sk, 0.35), 1.2) : ''), 2);
    // braid hanging from the beard
    var bx = x - 2, by = y + bl - 2, br = 'M' + pt([bx, by]) + 'L' + pt([bx - 1, by + 10]);
    s += L(br, OL, 7.4) + L(br, hc, 4.4) + L('M' + pt([bx - 2, by + 2]) + 'l2,2 M' + pt([bx - 2, by + 5]) + 'l2,2', dk(hc, 0.35), 1) + R(bx - 3.4, by + 6, 5.6, 3.4, c.cel(band), 1.2) + P('M' + pt([bx - 4, by + 10]) + 'L' + pt([bx + 2, by + 10]) + 'L' + pt([bx - 1, by + 15]) + 'Z', c.cel(hc), 1.2);
    var bd = 'M' + pt([x + 11, y - 3]) + 'C' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y + bl * 0.62]) + ' ' + pt([x + 8, y + bl]) + 'L' + pt([x + 4, y + bl - 4]) + 'L' + pt([x, y + bl + 1]) + 'L' + pt([x - 4, y + bl - 5]) + 'L' + pt([x - 9, y + bl - 1]) +
      'C' + pt([x - 16, y + bl * 0.62]) + ' ' + pt([x - 17, y + 12]) + ' ' + pt([x - 12, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
    s += body(c, bd, hc, L('M' + pt([x + 7, y + 6]) + 'C' + pt([x + 9, y + 14]) + ' ' + pt([x + 8, y + 20]) + ' ' + pt([x + 5, y + bl - 5]) + 'M' + pt([x - 2, y + 9]) + 'C' + pt([x - 1, y + 16]) + ' ' + pt([x - 2, y + 22]) + ' ' + pt([x - 3, y + bl - 6]) + 'M' + pt([x - 10, y + 10]) + 'C' + pt([x - 12, y + 16]) + ' ' + pt([x - 10, y + 22]) + ' ' + pt([x - 8, y + bl - 4]), dk(hc, 0.3), 1.1) +
      F('M' + pt([x + 4, y - 4]) + 'L' + pt([x + 18, y - 4]) + 'L' + pt([x + 18, y + bl + 4]) + 'L' + pt([x + 4, y + bl + 4]) + 'C' + pt([x + 10, y + 20]) + ' ' + pt([x + 9, y + 8]) + ' ' + pt([x + 4, y - 4]) + 'Z', dk(hc, 0.25), 0.7) + L('M' + pt([x - 12, y + 12]) + 'C' + pt([x - 13, y + 18]) + ' ' + pt([x - 12, y + 22]) + ' ' + pt([x - 10, y + 26]), lt(hc, 0.3), 1, 0.7), 2);
    // droopy moustache, big nose over it
    s += P('M' + pt([x - 3, y + 3]) + 'C' + pt([x - 10, y + 2]) + ' ' + pt([x - 17, y + 6]) + ' ' + pt([x - 18, y + 14]) + 'C' + pt([x - 13, y + 11]) + ' ' + pt([x - 8, y + 10]) + ' ' + pt([x - 2, y + 10]) + 'C' + pt([x + 2, y + 10]) + ' ' + pt([x + 5, y + 6]) + ' ' + pt([x + 2, y + 3]) + 'Z', c.cel(lt(hc, 0.08)), 1.6);
    s += E(x - 12, y + 1, 5, 4.4, c.cel(mix(sk, '#d86a5a', 0.22)), 1.8) + E(x - 13.4, y - 0.4, 1.6, 1.1, '#ffffff', 0, 0.45);
    s += E(x - 5, y - 3.4, 2, 2.2, '#fff8e8', 1) + C(x - 6, y - 3.2, 1.1, OL);
    s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 1, y - 8]) + 'L' + pt([x, y - 6]) + 'C' + pt([x - 4, y - 7]) + ' ' + pt([x - 8, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', c.cel(hc), 1.2);
    if (o.helm) s += o.helm(c, x, y);
    return s;
  }

  // ============================================================
  //  REDRIDGE MOB PIECES
  // ============================================================
  // point helper along a direction: u along ang, v perpendicular (v < 0 = the 'front' side for a raised left-facing weapon)
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function haft(c, p, len, ang, col, w, back) { var q = dirQ(p, ang), d = 'M' + pt(q(-(back == null ? 10 : back), 0)) + 'L' + pt(q(len, 0)); return limb(d, col || '#6a4428', w || 3.4) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }
  // war axe: haft + crescent blade on the front side (+ smaller back spike, or a second blade when dbl)
  function axe(c, p, len, ang, bw, col, dbl, hcol) {
    var q = dirQ(p, ang), o = haft(c, p, len + 4, ang, hcol || '#4a3222', 3.8);
    var blade = function (k, b) {
      return pd([q(len + 3, -1.5 * k), q(len + 6 + b * 0.25, -b * 0.75 * k), q(len + 2, -b * 1.05 * k), q(len - b * 0.55, -b * 1.12 * k), q(len - b * 1.05, -b * 0.8 * k), q(len - b * 0.75, -1.5 * k)], true);
    };
    o += P(blade(1, bw), c.cel(col || '#a8acb2'), 1.9) + L('M' + pt(q(len + 4, -bw * 0.72)) + 'L' + pt(q(len - bw * 0.5, -bw * 1.02)) + 'L' + pt(q(len - bw * 0.95, -bw * 0.74)), '#ffffff', 1.1, 0.6);
    if (dbl) o += P(blade(-1, bw * 0.85), c.cel(dk(col || '#a8acb2', 0.08)), 1.9);
    else o += P(pd([q(len - 2, 1.5), q(len - bw * 0.3, bw * 0.55), q(len - bw * 0.6, 1.5)], true), c.cel(dk(col || '#a8acb2', 0.1)), 1.4);
    return o + R(q(len - bw * 0.3, 0)[0] - 3, q(len - bw * 0.3, 0)[1] - 3, 6, 6, c.cel('#3a3434'), 1.2);
  }
  // knobbly wooden club
  function club(c, p, len, ang, w, col) {
    var q = dirQ(p, ang); col = col || '#8a5a36';
    var d = pd([q(-8, -2.6), q(len * 0.55, -w * 0.55), q(len * 0.85, -w), q(len + w * 0.6, -w * 0.4), q(len + w * 0.6, w * 0.4), q(len * 0.85, w), q(len * 0.55, w * 0.55), q(-8, 2.6)], true);
    return body(c, d, col, C(q(len * 0.7, -w * 0.4)[0], q(len * 0.7, -w * 0.4)[1], 1.8, dk(col, 0.35)) + C(q(len * 0.9, w * 0.3)[0], q(len * 0.9, w * 0.3)[1], 1.6, dk(col, 0.35)) + L('M' + pt(q(len * 0.2, -1.5)) + 'L' + pt(q(len * 0.8, -w * 0.6)), lt(col, 0.3), 1, 0.7), 1.8) +
      L('M' + pt(q(-2, -3)) + 'L' + pt(q(0, 3)) + 'M' + pt(q(3, -3)) + 'L' + pt(q(5, 3)), '#3a2a1a', 1.4);
  }
  // short bow held at its grip (bulging towards the target, left) with a nocked arrow drawn back to `draw`
  function bow(c, p, h, draw, col) {
    col = col || '#7a4e2a';
    var top = [p[0] + 9, p[1] - h / 2], bot = [p[0] + 9, p[1] + h / 2], dp = draw || [p[0] + 9, p[1]];
    var arc = 'M' + pt(top) + 'Q' + pt([p[0] - 8, p[1] - h * 0.3]) + ' ' + pt(p) + 'Q' + pt([p[0] - 8, p[1] + h * 0.3]) + ' ' + pt(bot);
    var o = L('M' + pt(top) + 'L' + pt(dp) + 'L' + pt(bot), OL, 2) + L('M' + pt(top) + 'L' + pt(dp) + 'L' + pt(bot), '#e8e0c8', 0.9);
    o += L(arc, OL, 5.4) + L(arc, col, 3) + L(arc, lt(col, 0.3), 1, 0.6) + L('M' + pt([top[0] - 2, top[1] + 1]) + 'l3,-3 M' + pt([bot[0] - 2, bot[1] - 1]) + 'l3,3', OL, 1.4);
    // arrow
    var ax0 = [dp[0] + 2, dp[1]], ax1 = [p[0] - 16, p[1] - 1];
    o += L('M' + pt(ax0) + 'L' + pt(ax1), OL, 3.2) + L('M' + pt(ax0) + 'L' + pt(ax1), '#c8a070', 1.4) + P(pd([[ax1[0] + 3, ax1[1] - 3], [ax1[0] - 5, ax1[1]], [ax1[0] + 3, ax1[1] + 3]], true), c.cel('#b8bcc0'), 1) +
      P(pd([[ax0[0] - 1, ax0[1]], [ax0[0] + 5, ax0[1] - 3.5], [ax0[0] + 7, ax0[1] - 3.5], [ax0[0] + 3, ax0[1]], [ax0[0] + 7, ax0[1] + 3.5], [ax0[0] + 5, ax0[1] + 3.5]], true), '#c83a2a', 0.9);
    return o;
  }
  function quiver(c, x, y, ang, col) {
    var o = G(body(c, 'M-5,0 L5,0 L6,26 L-6,26 Z', col || '#6a4428', L('M-5,6 L5,6 M-5,20 L6,20', '#3a2414', 1.6), 1.6) +
      L('M-3,0 L-5,-10 M0,0 L1,-11 M3,0 L6,-9', OL, 3) + L('M-3,0 L-5,-10 M0,0 L1,-11 M3,0 L6,-9', '#c8a070', 1.2) + P('M-7,-12 L-4,-8 L-3,-13 Z M-1,-13 L2,-9 L3,-14 Z M4,-11 L7,-8 L8,-12 Z', '#c83a2a', 0.8), 'translate(' + n(x) + ',' + n(y) + ') rotate(' + n(ang) + ')');
    return o;
  }
  // staff topped with a bone fetish and a glowing orb
  function skullStaff(c, top, bot, glowCol, s) {
    s = s || 1;
    var o = limb('M' + pt(top) + 'L' + pt(bot), '#8a6a44', 3.2) + L('M' + pt(top) + 'L' + pt(bot), '#b89a70', 1, 0.6);
    o += bone(top[0] - 4, top[1] + 4, 12 * s, 0.9, 0.8) + bone(top[0] + 4, top[1] + 5, 12 * s, 2.3, 0.8);
    o += feathers(top[0] + 1, top[1] + 12, ['#2f9ab8', '#e8c040', '#c83a2a'], 0.75 * s, -0.5);
    o += C(top[0], top[1] - 6 * s, 12 * s, glow(c, glowCol, 0.8)) + skull(c, top[0], top[1] + 1, 0.9 * s) + C(top[0], top[1] - 8 * s, 3.4 * s, c.rg([[0, '#ffffff'], [0.5, lt(glowCol, 0.4)], [1, glowCol]]), 1.2);
    return o;
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
  // round wooden shield with an iron rim and the Blackrock sigil (seen from the front)
  function roundShield(c, x, y, r, face) {
    return C(x, y, r, c.cel(face || BR), 2.2) + L('M' + pt([x - r + 2, y]) + 'a' + n(r - 2) + ',' + n(r - 2) + ' 0 1,0 ' + n(2 * r - 4) + ',0a' + n(r - 2) + ',' + n(r - 2) + ' 0 1,0 ' + n(-2 * r + 4) + ',0', '#8a8a90', 2) +
      sigil(x, y - 1, r / 13) + C(x, y + r * 0.62, 1.6, '#c8c4bc', 0.8) + C(x - r * 0.62, y, 1.4, '#c8c4bc', 0.8) + C(x + r * 0.62, y, 1.4, '#c8c4bc', 0.8) + E(x - r * 0.35, y - r * 0.45, r * 0.3, r * 0.16, '#ffffff', 0, 0.18);
  }
  function spikePad(c, x, y, r, col, spikes) {
    var o = '';
    (spikes || [[-0.8, -1.1], [0, -1.35], [0.8, -1.1]]).forEach(function (k) { o += P(pd([[x + k[0] * r - 3, y - r * 0.4], [x + k[0] * r * 1.1, y + k[1] * r], [x + k[0] * r + 3, y - r * 0.4]], true), c.cel('#c8c4bc'), 1.2); });
    return o + body(c, 'M' + pt([x - r, y + r * 0.45]) + 'C' + pt([x - r * 1.05, y - r * 0.8]) + ' ' + pt([x + r * 1.05, y - r * 0.8]) + ' ' + pt([x + r, y + r * 0.45]) + 'Z', col, L('M' + pt([x - r * 0.8, y + r * 0.1]) + 'C' + pt([x - r * 0.6, y - r * 0.5]) + ' ' + pt([x + r * 0.6, y - r * 0.5]) + ' ' + pt([x + r * 0.8, y + r * 0.1]), BRK, 1.6) + F(pd([[x + r * 0.2, y - r], [x + r * 1.2, y - r], [x + r * 1.2, y + r], [x + r * 0.3, y + r]], true), dk(col, 0.35), 0.7), 2);
  }
  // iron shackle cuff (+ optional broken chain trailing)
  function shackle(c, p, chainLen, ang) {
    var o = R(p[0] - 5, p[1] - 3.5, 10, 7, c.cel('#6a6e76'), 1.6) + C(p[0], p[1] + 3.5, 1.4, '#3a3c40');
    if (chainLen) {
      var a = ang == null ? PI / 2 : ang, x = p[0], y = p[1] + 4;
      for (var i = 0; i < chainLen; i++) { var cx = x + Math.cos(a) * (i * 5 + 3), cy = y + Math.sin(a) * (i * 5 + 3); o += '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 3) + '" ry="3" transform="rotate(' + n(a * 180 / PI - 90) + ',' + n(cx) + ',' + n(cy) + ')" fill="none" stroke="' + OL + '" stroke-width="3.4"/>' + '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + (i % 2 ? 1.4 : 3) + '" ry="3" transform="rotate(' + n(a * 180 / PI - 90) + ',' + n(cx) + ',' + n(cy) + ')" fill="none" stroke="#8a8e96" stroke-width="1.5"/>'; }
    }
    return o;
  }
  // loose swinging chain from a fist along a quadratic curve, links drawn as short dashes
  function swingChain(c, p, mid, end) {
    var d = 'M' + pt(p) + 'Q' + pt(mid) + ' ' + pt(end);
    return L(d, OL, 5.4) + '<path d="' + d + '" fill="none" stroke="#8a8e96" stroke-width="3" stroke-dasharray="4 2.2"/>' + L(d, '#c8ccd2', 0.8, 0.6) + C(end[0], end[1], 3.6, c.cel('#6a6e76'), 1.4);
  }
  function wrapFist(c, p, skin, wrap) {
    return C(p[0], p[1], 5.2, c.cel(skin), 2) + L('M' + pt([p[0] - 5, p[1] - 2]) + 'L' + pt([p[0] + 5, p[1] - 3]) + 'M' + pt([p[0] - 5, p[1] + 1.5]) + 'L' + pt([p[0] + 5, p[1] + 0.5]), wrap || '#d8cfbc', 2) + L('M' + pt([p[0] - 5, p[1] - 2]) + 'L' + pt([p[0] + 5, p[1] - 3]) + 'M' + pt([p[0] - 5, p[1] + 1.5]) + 'L' + pt([p[0] + 5, p[1] + 0.5]), dk(wrap || '#d8cfbc', 0.35), 0.6, 0.8);
  }
  function hTorch(c, p, len, ang) {
    var q = dirQ(p, ang), t = q(len, 0);
    return C(t[0], t[1] - 6, 18, glow(c, '#ffa040', 0.6)) + haft(c, p, len, ang, '#6a4428', 3.2) + P(pd([q(len - 6, -3.6), q(len + 1, -4), q(len + 1, 4), q(len - 6, 3.6)], true), c.cel('#5a4a3a'), 1.2) + flame(c, t[0], t[1] + 2, 0.72);
  }
  // prison rags: torn hem (a zig-zag bottom edge) as a path helper
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  var RAG = '#8e8a82', RAG2 = '#6e6a64';

  // ---- Redridge gnoll (hunched, digitigrade, same head family as the Riverpaw) ----
  function rrGnoll(c, o) {
    var fur = o.fur, mane = o.mane, spot = o.spot || dk(fur, 0.38);
    var head = function (c, x, y) {
      var s = gnollHead(c, x, y, 12, { skin: fur, mane: mane, eyeC: o.eye || '#ffd03a' });
      if (o.glowEye) s += glowEye(c, x - 7.9, y - 4.4, 1.9, o.glowEye);
      return s + (o.headX ? o.headX(c, x, y) : '');
    };
    return biped(c, {
      skin: fur, shirt: dk(fur, 0.04), pants: o.pants || dk(fur, 0.12), sleeve: fur, glove: fur, boots: dk(fur, 0.3), feet: toes2, digi: true,
      legW: o.legW || 11, armW: o.armW || 10.5, hipY: 88, shadowR: o.shadowR || 34, belt: o.belt, buckle: '#e8dcc0', neck: false,
      torsoD: o.torsoD || 'M38,60 C40,46 70,40 86,50 L90,70 L84,92 L50,92 L42,76 Z',
      back: function (c) { return (o.back ? o.back(c) : '') + P('M56,46 L62,32 L68,44 L76,32 L80,46 L90,40 L90,54 C80,48 68,44 56,48 Z', c.cel(mane), 1.8); },
      chest: function (c) {
        var sp = E(60, 60, 3.4, 2.4, spot, 0, 0.8) + E(72, 70, 3, 2.2, spot, 0, 0.8) + E(54, 76, 2.6, 2, spot, 0, 0.8) + E(78, 58, 2.4, 2, spot, 0, 0.7) + E(66, 84, 3, 2, spot, 0, 0.7);
        return F('M40,66 C46,62 54,64 58,72 C56,82 50,90 44,90 Z', lt(fur, 0.18), 0.6) + sp + (o.chest ? o.chest(c) : '');
      },
      shins: function () { return E(74, 102, 2.4, 1.8, spot, 0, 0.8) + E(60, 100, 2.6, 2, spot, 0, 0.8) + E(56, 108, 2, 1.6, spot, 0, 0.8) + E(72, 110, 2, 1.6, spot, 0, 0.7); },
      front: function (c) { return body(c, 'M50,90 L82,90 L80,106' + rag(80, 52, 106, 6, 5).replace(/^L/, ' L') + ' Z', o.loin || '#6a4a2e', L('M52,94 L80,94', dk(o.loin || '#6a4a2e', 0.4), 1.2), 1.8) + (o.front ? o.front(c) : ''); },
      pads: o.pads, head: head, hx: 44, hy: 38,
      near: o.near || [[48, 60], [38, 74], [30, 86]], far: o.far || [[84, 58], [94, 72], [94, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, top: o.top, tf: o.tf, nearHand: o.nearHand, farHand: o.farHand
    });
  }
  function boneNecklace(c, x, y, w) {
    var s = L('M' + pt([x - w, y - 3]) + 'Q' + pt([x, y + 8]) + ' ' + pt([x + w, y - 4]), '#3a2a1a', 1.4);
    for (var i = -3; i <= 3; i++) { var bx = x + i * w / 3.6, by = y + 3 - Math.abs(i) * 1.6; s += P(pd([[bx - 1.6, by], [bx, by + 7 - Math.abs(i) * 0.6], [bx + 1.6, by]], true), '#f4ecd6', 1); }
    return s + skull(_cur, x, y + 6, 0.55);
  }
  // pelt hood draped over a gnoll head (x, y = head centre), with its own pelt ears
  function peltHood(c, x, y, col) {
    var d = 'M' + pt([x - 14, y - 2]) + 'C' + pt([x - 15, y - 16]) + ' ' + pt([x - 2, y - 22]) + ' ' + pt([x + 10, y - 20]) + 'C' + pt([x + 22, y - 18]) + ' ' + pt([x + 26, y - 4]) + ' ' + pt([x + 24, y + 12]) + 'L' + pt([x + 32, y + 26]) + 'L' + pt([x + 20, y + 24]) + 'L' + pt([x + 14, y + 8]) + 'C' + pt([x + 10, y - 4]) + ' ' + pt([x, y - 10]) + ' ' + pt([x - 14, y - 2]) + 'Z';
    var o = P(pd([[x - 2, y - 18], [x - 4, y - 32], [x + 6, y - 20]], true), c.cel(dk(col, 0.1)), 1.6) + P(pd([[x + 6, y - 20], [x + 10, y - 33], [x + 14, y - 19]], true), c.cel(col), 1.6);
    return o + body(c, d, col, L('M' + pt([x - 8, y - 12]) + 'l3,-2 M' + pt([x + 2, y - 16]) + 'l3,-1 M' + pt([x + 12, y - 12]) + 'l3,1 M' + pt([x + 18, y - 2]) + 'l2,2 M' + pt([x + 20, y + 10]) + 'l3,2', dk(col, 0.35), 1.1) +
      F(pd([[x + 10, y - 24], [x + 34, y - 24], [x + 34, y + 28], [x + 16, y + 28]], true), dk(col, 0.3), 0.7) + L('M' + pt([x - 13, y - 3]) + 'C' + pt([x, y - 10]) + ' ' + pt([x + 10, y - 4]) + ' ' + pt([x + 14, y + 8]), lt(col, 0.3), 1.6, 0.9), 2);
  }

  // ---- Blackrock orc (black leather / mail, the red-orange mountain sigil) ----
  function rrOrc(c, o) {
    var sk = o.skin || '#6a8a3a';
    return biped(c, {
      skin: sk, shirt: o.shirt || BR, pants: o.pants || '#2a2426', sleeve: o.sleeve || sk, forearm: o.forearm, glove: o.glove || '#2a2224', boots: o.boots || '#1a1416', belt: o.belt || '#2a1e1a', buckle: o.buckle || BRO,
      head: function (c, x, y) { return orcHead(c, x, y, { skin: sk, eye: o.eye || '#ffcc30', bald: o.bald, hood: o.hood }) + (o.headX ? o.headX(c, x, y) : ''); }, hx: o.hx || 58, hy: o.hy || 32, neckCol: sk,
      torsoD: o.torsoD || 'M42,50 C50,43 80,43 88,50 L86,70 L82,88 L46,88 L42,70 Z', legW: o.legW || 11.5, armW: o.armW || 10.5, shadowR: o.shadowR || 34,
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, shins: o.shins, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf
    });
  }
  function mail(x0, y0, x1, y1, col) {
    var d = '';
    for (var y = y0; y < y1; y += 4) for (var x = x0 + ((y - y0) / 4 % 2) * 2; x < x1; x += 4) d += 'M' + pt([x, y]) + 'q2,2.6 4,0';
    return L(d, col, 0.9, 0.8);
  }
  // horned great-helm for a Blackrock warlord (x, y = orc head centre)
  function hornHelm(c, x, y, col) {
    col = col || '#2e2a2e';
    var o = P('M' + pt([x + 4, y - 14]) + 'C' + pt([x + 14, y - 24]) + ' ' + pt([x + 26, y - 26]) + ' ' + pt([x + 32, y - 34]) + 'C' + pt([x + 22, y - 30]) + ' ' + pt([x + 14, y - 30]) + ' ' + pt([x + 8, y - 22]) + 'Z', c.cel('#d8ccb0'), 1.6);
    o += body(c, 'M' + pt([x - 14, y + 2]) + 'C' + pt([x - 16, y - 16]) + ' ' + pt([x - 4, y - 24]) + ' ' + pt([x + 6, y - 23]) + 'C' + pt([x + 16, y - 22]) + ' ' + pt([x + 18, y - 8]) + ' ' + pt([x + 16, y + 10]) + 'L' + pt([x + 6, y + 12]) + 'L' + pt([x + 4, y - 2]) + 'L' + pt([x - 6, y - 4]) + 'L' + pt([x - 12, y + 6]) + 'Z', col,
      F(pd([[x + 4, y - 26], [x + 20, y - 26], [x + 20, y + 14], [x + 8, y + 14]], true), dk(col, 0.4), 0.8) + L('M' + pt([x - 10, y - 12]) + 'C' + pt([x - 4, y - 20]) + ' ' + pt([x + 6, y - 20]) + ' ' + pt([x + 12, y - 12]), lt(col, 0.3), 1.4, 0.8) + L('M' + pt([x - 13, y - 6]) + 'L' + pt([x + 16, y - 4]), BRK, 1.8), 2.2);
    o += P('M' + pt([x - 8, y - 16]) + 'C' + pt([x - 18, y - 22]) + ' ' + pt([x - 24, y - 26]) + ' ' + pt([x - 26, y - 34]) + 'C' + pt([x - 18, y - 30]) + ' ' + pt([x - 10, y - 26]) + ' ' + pt([x - 2, y - 22]) + 'Z', c.cel('#ece2c8'), 1.7) + L('M' + pt([x - 16, y - 24]) + 'l3,-2 M' + pt([x - 21, y - 28]) + 'l3,-2', dk('#ece2c8', 0.35), 1);
    o += P(pd([[x + 1, y - 22], [x + 3, y - 32], [x + 6, y - 22]], true), c.cel('#8a8a90'), 1.2);
    return o;
  }
  function ponytail(c, x, y) { return P('M' + pt([x + 6, y - 14]) + 'C' + pt([x + 16, y - 20]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 22, y + 10]) + 'C' + pt([x + 20, y]) + ' ' + pt([x + 16, y - 8]) + ' ' + pt([x + 8, y - 8]) + 'Z', c.cel('#1e1812'), 1.8) + R(x + 14, y - 12, 5, 4, c.cel(BRK), 1); }

  // ---- human prisoner (Stockade) ----
  function prisoner(c, o) {
    var sk = o.skin || '#e0b08a', tun = o.tunic || RAG;
    return biped(c, {
      skin: sk, shirt: tun, pants: o.pants || RAG2, sleeve: o.sleeve || tun, forearm: o.forearm, glove: o.glove || sk, boots: o.boots || '#4a3a2e', belt: o.belt,
      head: o.head || function (c, x, y) { return humanHead(c, x, y, { skin: sk, hairCol: o.hair, beard: o.beard }); }, hx: 60, hy: 30, neckCol: o.neckCol || sk,
      torsoD: o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,88 L50,88 L48,70 Z', legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      chest: function (c) { return L('M58,54 L62,62 L66,54', dk(tun, 0.35), 1.2) + L('M52,70 l4,4 M74,62 l-3,5', dk(tun, 0.4), 1.2) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M49,84 L79,84 L80,96' + rag(80, 48, 96, 7, o.seed || 4).replace(/^L/, ' L') + ' Z', tun, F(pd([[68, 82], [84, 82], [84, 104], [70, 104]], true), dk(tun, 0.25), 0.7), 1.8) + (o.belt ? '' : L('M50,85 L78,85', '#6a5a40', 2.2)) + (o.front ? o.front(c) : ''); },
      back: o.back, pads: o.pads, shins: function () { return L('M49,104 L57,104 M68,106 L76,106', '#4a4640', 1.2, 0.8) + (o.shins ? o.shins() : ''); }, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf
    });
  }
  function stubble(x, y) { return F('M' + pt([x - 10, y + 3]) + 'C' + pt([x - 9, y + 11]) + ' ' + pt([x, y + 13]) + ' ' + pt([x + 8, y + 7]) + 'L' + pt([x + 8, y + 3]) + 'C' + pt([x + 2, y + 8]) + ' ' + pt([x - 4, y + 8]) + ' ' + pt([x - 10, y + 3]) + 'Z', '#4a3a30', 0.35); }
  function shiv(p, ang) {
    var q = dirQ(p, ang);
    return L('M' + pt(q(-4, 0)) + 'L' + pt(q(4, 0)), OL, 5) + L('M' + pt(q(-4, 0)) + 'L' + pt(q(4, 0)), '#d8cfbc', 3) + P(pd([q(4, -2), q(17, -0.5), q(19, 0), q(15, 2), q(4, 2)], true), '#b8bcc4', 1.3);
  }
  // simple warhammer: square head
  function hammer(c, p, len, ang, hw, col) {
    var q = dirQ(p, ang), o = haft(c, p, len + 3, ang, '#5a3a24', 3.6);
    o += P(pd([q(len - hw * 0.6, -hw), q(len + hw * 0.6, -hw), q(len + hw * 0.6, hw * 0.7), q(len - hw * 0.6, hw * 0.7)], true), c.cel(col || '#8a8e96'), 2) + L('M' + pt(q(len - hw * 0.6, -hw * 0.3)) + 'L' + pt(q(len + hw * 0.6, -hw * 0.3)), dk(col || '#8a8e96', 0.35), 1.2);
    return o + P(pd([q(len - 2, -hw), q(len, -hw - 5), q(len + 2, -hw)], true), c.cel('#b8bcc0'), 1.1);
  }
  function ironKnuckle(c, p, skin) {
    var x = p[0], y = p[1], ir = '#6a6e76';
    var o = C(x + 1, y, 5.8, c.cel(skin), 2);
    o += P(pd([[x - 3, y - 7], [x - 8, y - 6.5], [x - 8.5, y + 6.5], [x - 3, y + 7]], true), c.cel(ir), 1.6);
    [-4.4, 0, 4.4].forEach(function (k) { o += R(x - 11.5, y + k - 1.8, 4, 3.6, c.cel('#9a9ea6'), 1); });
    return o;
  }
  function rrDwarf(c, o) {
    var sk = o.skin || '#e09c78';
    var ho = { skin: sk, hair: o.hair, beardLen: o.beardLen, helm: o.helm, band: o.band, scar: o.scar };
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2618', glove: o.glove,
      hx: 56, hy: 44, hipY: 96, legW: 13, armW: 11.5, shadowR: 36, neck: false,
      torsoD: 'M40,60 C44,52 82,52 88,60 L88,82 L85,99 L43,99 L40,82 Z',
      head: function (c, x, y) { return G(dwarfHead(c, x, y, ho) + (o.headX ? o.headX(c, x, y) : ''), at(1.12, x, y + 10)); },
      chest: o.chest, back: o.back, pads: o.pads, top: o.top,
      front: function (c) { return (o.front ? o.front(c) : '') + P('M41,90 L87,90 L86,99 L42,99 Z', c.cel(o.belt || '#4a3020'), 2) + R(58, 88.6, 11, 11.6, c.cel(o.buckle || '#d6a53c'), 1.6) + R(61, 91.6, 5, 5.6, dk(o.belt || '#4a3020', 0.2), 0); },
      near: o.near || [[44, 62], [36, 78], [30, 90]], far: o.far || [[84, 62], [92, 78], [92, 92]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(0.98, 64, 122)
    });
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

  // ---- black dragon whelp (facing left, wings up) ----
  function whelp(c, o) {
    var sc = o.col || '#2a2428', sc2 = lt(sc, 0.14), bel = o.belly || '#e0641e', mem = o.mem || '#b0401e', s = shadow(c, 66, 34);
    // far wing, raised
    var fw = 'M70,58 C74,40 84,22 100,10 L104,26 L114,20 L112,36 L124,34 L114,50 L120,54 L100,60 C90,62 80,64 74,68 Z';
    s += body(c, fw, dk(sc, 0.05), F('M76,62 C86,48 96,34 104,24 L110,34 C100,44 92,52 86,60 Z', mem, 0.85) + F('M88,62 C98,52 108,44 114,38 L116,48 C108,54 100,58 94,62 Z', dk(mem, 0.15), 0.85) + L('M72,62 L102,14 M78,64 L112,24 M86,64 L122,36', OL, 1.4), 2.2);
    // tail curling back
    s += L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', OL, 10) + L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', sc, 5.6) + P('M110,72 L106,62 L116,68 Z', c.cel(mem), 1.3);
    // far legs
    s += limb('M84,92 L90,106 L86,116', dk(sc, 0.1), 8) + P('M78,116 L92,116 L94,122 L76,122 Z', c.cel(dk(sc, 0.1)), 1.6) + L('M78,122 l-3,-1 M84,122 l-2,-1', '#e8e0c8', 1.2);
    var bd = 'M40,78 C42,62 60,56 80,60 C96,64 100,80 94,92 C88,102 70,104 56,100 C44,96 38,88 40,78 Z';
    var scales = '';
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) scales += 'M' + pt([58 + i * 9 + (j % 2) * 4, 66 + j * 7]) + 'q3,3 6,0';
    s += body(c, bd, sc, L(scales, sc2, 1.1, 0.8) + F('M42,84 C50,100 72,104 90,94 C80,92 64,92 50,84 Z', bel) + L('M50,90 q4,3 8,2 M60,94 q5,2 10,1 M72,95 q5,1 10,-2', dk(bel, 0.35), 1) + F('M78,56 C94,62 102,78 96,96 L106,96 L106,56 Z', dk(sc, 0.4), 0.85));
    // neck + head
    s += body(c, 'M40,78 C34,70 32,60 34,52 L48,50 C48,58 50,66 56,72 Z', sc, F('M36,64 C38,72 42,78 46,80 L40,82 C36,76 34,70 34,64 Z', bel, 0.95), 2.2);
    var hx = 30, hy = 46;
    s += P('M' + pt([hx + 6, hy - 8]) + 'C' + pt([hx + 12, hy - 16]) + ' ' + pt([hx + 20, hy - 20]) + ' ' + pt([hx + 26, hy - 20]) + 'C' + pt([hx + 20, hy - 16]) + ' ' + pt([hx + 16, hy - 10]) + ' ' + pt([hx + 12, hy - 4]) + 'Z', c.cel('#d8ccb0'), 1.5);
    s += P('M' + pt([hx + 2, hy - 9]) + 'C' + pt([hx + 6, hy - 18]) + ' ' + pt([hx + 12, hy - 24]) + ' ' + pt([hx + 18, hy - 26]) + 'C' + pt([hx + 12, hy - 20]) + ' ' + pt([hx + 10, hy - 14]) + ' ' + pt([hx + 8, hy - 7]) + 'Z', c.cel('#ece2c8'), 1.5);
    var hd = 'M' + pt([hx + 12, hy - 4]) + 'C' + pt([hx + 12, hy - 12]) + ' ' + pt([hx, hy - 14]) + ' ' + pt([hx - 6, hy - 10]) + 'L' + pt([hx - 20, hy - 5]) + 'C' + pt([hx - 24, hy - 3]) + ' ' + pt([hx - 24, hy + 4]) + ' ' + pt([hx - 20, hy + 5]) + 'L' + pt([hx - 4, hy + 8]) + 'C' + pt([hx + 4, hy + 10]) + ' ' + pt([hx + 12, hy + 6]) + ' ' + pt([hx + 12, hy - 4]) + 'Z';
    s += body(c, hd, sc, F('M' + pt([hx - 24, hy + 1]) + 'L' + pt([hx + 14, hy]) + 'L' + pt([hx + 14, hy + 12]) + 'L' + pt([hx - 24, hy + 12]) + 'Z', dk(sc, 0.3), 0.7) + L('M' + pt([hx - 18, hy - 5]) + 'L' + pt([hx - 4, hy - 9]), sc2, 1.2, 0.8), 2.2);
    s += L('M' + pt([hx - 22, hy + 2]) + 'L' + pt([hx - 6, hy + 4]), OL, 1.4) + P(pd([[hx - 18, hy + 2.5], [hx - 17, hy + 6], [hx - 15.5, hy + 2.8]], true), '#f4ecd6', 0.8) + P(pd([[hx - 11, hy + 3.2], [hx - 10, hy + 6.6], [hx - 8.5, hy + 3.5]], true), '#f4ecd6', 0.8);
    s += C(hx - 21, hy - 2, 0.9, OL) + glowEye(c, hx - 8, hy - 4, 2, o.eye || '#ffc030') + L('M' + pt([hx - 13, hy - 8]) + 'L' + pt([hx - 3, hy - 8]), OL, 2);
    s += P(pd([[hx - 2, hy - 12], [hx + 2, hy - 18], [hx + 4, hy - 11]], true), c.cel(sc2), 1) + P(pd([[hx + 6, hy - 11], [hx + 10, hy - 16], [hx + 11, hy - 8]], true), c.cel(sc2), 1);
    // near legs
    s += limb('M52,92 L46,106 L50,116', sc, 8.4) + P('M38,116 L54,116 L56,122 L34,122 Z', c.cel(sc), 1.6) + L('M34,122 l-3,-1 M40,122 l-2,-1.5 M46,122 l-1,-1.5', '#e8e0c8', 1.2);
    s += limb('M70,96 L74,108 L70,116', sc, 8) + P('M62,116 L76,116 L78,122 L58,122 Z', c.cel(sc), 1.6) + L('M58,122 l-3,-1 M64,122 l-2,-1.5', '#e8e0c8', 1.2);
    // near wing, raised and spread forward-up
    var nw = 'M58,64 C50,46 44,26 50,8 L58,22 L64,10 L68,26 L78,16 L78,34 L88,30 L82,46 C76,54 68,60 64,70 Z';
    s += body(c, nw, sc, F('M58,60 C52,44 50,30 52,16 L58,26 C58,38 60,48 62,56 Z', mem, 0.9) + F('M64,56 C64,44 66,32 70,24 L76,32 C72,40 70,48 68,58 Z', lt(mem, 0.08), 0.9) + F('M70,58 C72,50 78,42 84,36 L84,44 C78,50 74,56 72,62 Z', dk(mem, 0.1), 0.9) + L('M60,66 L50,10 M64,64 L64,12 M66,64 L78,18 M70,64 L86,32', OL, 1.4), 2.2);
    // spine ridge
    s += P('M50,58 L54,50 L58,58 L62,52 L66,60 Z', c.cel(mem), 1.2);
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- tarantula (big hairy brown spider, facing left) ----
  function tarantulaArt(c, o) {
    var col = o.col || '#6a4a30', band = o.band || lt(col, 0.4), hair = lt(col, 0.3), s = '', legF = dk(col, 0.2), legN = col;
    s += shadow(c, 64, 56);
    var hairs = function (l, w) { var d = ''; for (var t = 0.15; t < 1; t += 0.14) { var a = l[1], b = l[2], x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; d += 'M' + pt([x - w, y]) + 'l' + n(-w) + ',-2 M' + pt([x + w, y]) + 'l' + n(w) + ',-2'; } return d; };
    var farL = [[[44, 84], [26, 60], [14, 116]], [[50, 84], [42, 60], [40, 118]], [[58, 84], [80, 58], [92, 118]], [[60, 82], [104, 56], [122, 114]]];
    farL.forEach(function (l) { s += limb(pd(l), legF, 5) + L(hairs(l, 2.6), dk(legF, 0.2), 1, 0.9) + C(l[1][0], l[1][1], 3, c.cel(dk(col, 0.1)), 1.1); });
    var ab = 'M58,76 C58,56 80,46 98,50 C118,56 124,74 118,92 C112,104 92,106 78,102 C64,98 58,88 58,76 Z', fz = '', r = rng(7);
    for (var i = 0; i < 40; i++) { var x = 62 + r() * 56, y = 54 + r() * 46; fz += 'M' + pt([x, y]) + 'l' + n(r() * 3 - 1.5) + ',' + n(-2 - r() * 2); }
    s += body(c, ab, col, L(fz, hair, 1.1, 0.8) + F('M60,94 C80,108 106,106 122,92 L124,110 L58,110 Z', dk(col, 0.35), 0.85) + L('M72,62 Q90,56 108,62 M66,76 Q90,68 118,76 M68,90 Q92,84 116,90', dk(col, 0.35), 2, 0.8) + E(84, 60, 10, 4, lt(col, 0.22), 0, 0.6), 2.4);
    var ce = 'M34,84 C34,70 48,66 58,70 C68,74 68,90 60,96 C48,102 34,98 34,84 Z';
    s += body(c, ce, dk(col, 0.05), F('M32,92 C44,100 58,100 68,92 L68,106 L32,106 Z', dk(col, 0.35), 0.8) + L('M40,76 l-1,-3 M46,72 l0,-3 M54,72 l1,-3 M60,76 l2,-3', hair, 1.1) + E(50, 76, 7, 3, lt(col, 0.22), 0, 0.6), 2.2);
    var nearL = [[[46, 94], [16, 70], [2, 120]], [[50, 96], [32, 72], [24, 122]], [[56, 96], [70, 70], [76, 122]], [[62, 94], [96, 66], [110, 120]]];
    nearL.forEach(function (l) { var kb = [l[1][0] + (l[2][0] - l[1][0]) * 0.12, l[1][1] + (l[2][1] - l[1][1]) * 0.12], ke = [l[1][0] + (l[2][0] - l[1][0]) * 0.26, l[1][1] + (l[2][1] - l[1][1]) * 0.26]; s += limb(pd(l), legN, 6) + L(hairs(l, 3), dk(col, 0.3), 1.1) + L(pd([l[1], l[2]]), lt(col, 0.3), 1.4, 0.6) + L(pd([kb, ke]), band, 6) + C(l[1][0], l[1][1], 3.4, c.cel(col), 1.2); });
    // head + pedipalps + fangs
    s += limb('M34,94 L24,98 L22,106', dk(col, 0.1), 4) + limb('M40,96 L32,104 L32,110', dk(col, 0.1), 4);
    s += E(36, 88, 9, 8, c.cel(dk(col, 0.1)), 2) + E(34, 84, 3.4, 2, lt(col, 0.25), 0, 0.6);
    s += glowEye(c, 31, 85, 1.6, o.eye || '#ffb030') + glowEye(c, 37, 82, 1.3, o.eye || '#ffb030') + C(35, 88, 1, OL) + C(29, 89, 0.9, OL);
    s += P('M28,94 C24,98 25,104 29,106 C29,102 31,98 33,96 Z', '#2a1a12', 1.3) + P('M36,96 C34,100 35,105 38,107 C38,103 39,100 40,98 Z', '#2a1a12', 1.3);
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- Bellygrub: a huge fat boar with a sagging belly (facing left) ----
  function bellygrubArt(c) {
    var col = '#8a5a44', mane = '#3a2218', bel = '#d8a08a', s = shadow(c, 64, 58), legF = dk(col, 0.25);
    s += limb('M58,100 L58,112', legF, 12) + hoofs(58, 122) + limb('M102,98 L104,112', legF, 12) + hoofs(104, 122);
    // curly tail
    s += L('M118,68 C127,62 128,74 121,76 C116,77 118,70 123,70', OL, 4.5) + L('M118,68 C127,62 128,74 121,76 C116,77 118,70 123,70', col, 2);
    var bd = 'M26,66 C30,40 64,32 92,38 C116,44 126,62 122,84 C118,104 96,110 74,110 C50,110 30,104 26,88 C24,80 24,72 26,66 Z';
    var r = rng(21), shag = '';
    for (var i = 0; i < 22; i++) { var x = 40 + r() * 74, y = 46 + r() * 30; shag += 'M' + pt([x, y]) + 'l' + n(3 + r() * 2) + ',' + n(4 + r() * 3); }
    s += body(c, bd, col, L(shag, dk(col, 0.35), 1.2, 0.8) + F('M20,92 C50,112 96,112 128,86 L128,116 L20,116 Z', dk(col, 0.3), 0.85) + F('M44,44 C64,36 94,38 112,48 C92,44 64,46 44,54 Z', lt(col, 0.2), 0.5) + L('M70,52 L78,64 M76,50 L84,62', lt(col, 0.4), 1.6));
    // the belly: big pale sagging bulge nearly scraping the ground
    var bl = 'M38,90 C40,80 56,76 76,78 C98,80 110,88 106,100 C102,112 86,116 70,115 C52,114 38,106 38,90 Z';
    s += body(c, bl, bel, F('M36,102 C50,116 90,118 108,100 L108,120 L36,120 Z', dk(bel, 0.2), 0.8) + L('M56,92 q8,4 16,2 M62,104 q10,3 20,0', dk(bel, 0.3), 1.2) + E(62, 86, 10, 4, lt(bel, 0.3), 0, 0.7) + C(78, 98, 1.6, dk(bel, 0.4)), 2.2);
    // bristly mane
    var md = 'M32,58 L32,42 L42,50 L46,34 L54,46 L62,30 L68,44 L78,30 L82,44 L92,34 L94,46 L104,40 L102,52 L112,52 C92,44 60,42 32,58 Z';
    s += body(c, md, mane, L('M46,48 L48,40 M62,44 L63,36 M78,44 L79,36', lt(mane, 0.25), 1, 0.8), 2);
    // head: broad, low, grinning with a small crown tuft
    var hd = 'M44,54 C34,52 20,58 14,68 L8,76 C4,82 6,92 12,94 L22,96 C32,98 44,96 50,88 C56,78 54,60 44,54 Z';
    s += body(c, hd, col, F('M8,90 C22,96 40,96 52,84 L54,100 L4,100 Z', dk(col, 0.3), 0.85) + F('M24,62 C32,56 40,54 44,56 C38,58 30,62 24,68 Z', lt(col, 0.2), 0.5) + E(30, 84, 5, 3, '#c86a5a', 0, 0.5));
    s += P('M38,56 L42,42 L50,56 Z', c.cel(dk(col, 0.1)), 2) + P('M41,54 L43,47 L47,54 Z', '#8a4a3a', 0);
    s += E(8, 84, 5.4, 7.6, c.cel('#c8907a'), 2) + E(7, 82, 1.1, 1.8, OL) + E(7, 87, 1.1, 1.8, OL);
    // grin + little tusks
    s += L('M12,94 C20,98 30,97 38,92', OL, 1.8) + P('M' + pt([18, 94]) + 'C' + pt([14, 92]) + ' ' + pt([12, 86]) + ' ' + pt([14, 80]) + 'C' + pt([16, 86]) + ' ' + pt([18, 88]) + ' ' + pt([22, 91]) + 'Z', c.cel('#f4ecd6'), 1.6);
    s += C(26, 72, 2.8, '#ff6a2a', 1.2) + C(25.4, 71.4, 0.9, '#fff', 0) + L('M19,66 L33,71', OL, 2.6);
    s += limb('M40,98 L38,112', col, 13) + hoofs(38, 122) + limb('M92,100 L94,112', col, 13) + hoofs(94, 122);
    return G(s, at(1.02, 64, 122));
  }

  // ============================================================
  //  MOBS (128x128, facing left, feet on y=122)
  // ============================================================
  var MOBS = {
    // ---- Redridge gnolls: rust-red hyena fur, dark spots ----
    redridge_mongrel: function (c) {
      return rrGnoll(c, {
        fur: '#a4542e', mane: '#4a2014', loin: '#6a4a2e', armW: 9, legW: 10, shadowR: 30,
        torsoD: 'M42,60 C44,48 68,44 84,52 L86,70 L80,92 L52,92 L46,76 Z',
        chest: function () { return L('M50,64 Q62,70 74,66 M52,72 Q62,76 72,74', '#6a2a14', 1, 0.7); },
        near: [[48,60], [38,70], [30,78]],
        wNear: function (c, p) { return club(c, p, 34, -2.25, 6); },
        tf: at(0.94, 64, 122)
      });
    },
    redridge_poacher: function (c) {
      return rrGnoll(c, {
        fur: '#985a36', mane: '#3e2012', loin: '#5a4a34', armW: 10, legW: 10.5,
        back: function (c) { return quiver(c, 84, 50, 22, '#5a3a22'); },
        chest: function () { return L('M80,48 L50,88', '#3a2616', 3); },
        near: [[48, 60], [34, 66], [20, 68]],
        wNearFront: function (c, p) { return bow(c, p, 46, [32, 68], '#6a4222'); },
        top: function (c) { return peltHood(c, 44, 38, '#8a7458'); }
      });
    },
    redridge_brute: function (c) {
      var fur = '#8e4628';
      return rrGnoll(c, {
        fur: fur, mane: '#34140a', loin: '#5a3a24', armW: 12.5, legW: 13, shadowR: 40, belt: '#3a2618',
        torsoD: 'M34,60 C36,42 72,36 90,48 L94,70 L88,94 L48,94 L38,76 Z',
        chest: function (c) { return L('M46,62 L56,70 M50,58 L62,68 M66,58 L78,66', '#d8341e', 2.6) + L('M84,50 L48,92', '#3a2618', 3.4); },
        pads: function (c) { return body(c, 'M34,58 C32,44 56,40 62,54 L58,62 L38,64 Z', '#e8dcc0', L('M38,52 L58,50 M40,58 L58,56', '#b8a888', 1.2), 2) + P('M36,48 L30,36 L42,46 Z', c.cel('#e8dcc0'), 1.3) + P('M46,44 L46,30 L52,44 Z', c.cel('#e8dcc0'), 1.3); },
        near: [[48, 60], [36, 58], [28, 50]],
        wNear: function (c, p) { return spikedClub(c, p, 34, -2.15, 9); },
        tf: at(1.06, 64, 122)
      });
    },
    redridge_mystic: function (c) {
      return rrGnoll(c, {
        fur: '#b06a3c', mane: '#5a2814', loin: '#7a5a3a', armW: 9.5, legW: 10.5,
        front: function (c) { return body(c, 'M48,88 L84,88 L86,112' + rag(86, 46, 112, 6, 9).replace(/^L/, ' L') + ' Z', '#8a6a44', L('M50,96 L84,96', '#c83a2a', 2) + L('M50,102 L84,102', '#2f9ab8', 1.6) + F(pd([[70, 86], [90, 86], [90, 116], [72, 116]], true), '#4a3420', 0.5), 1.8); },
        chest: function (c) { return L('M52,62 Q64,74 78,62', '#3a2a1a', 1.2) + C(58, 68, 1.8, '#2f9ab8', 0.8) + C(65, 71, 1.8, '#e8c040', 0.8) + C(72, 68, 1.8, '#c83a2a', 0.8); },
        headX: function (c, x, y) { return feathers(x + 10, y - 8, ['#c83a2a', '#e8c040', '#2f9ab8'], 1, 0.4) + L('M' + pt([x - 2, y - 6]) + 'L' + pt([x + 4, y + 2]), '#ece2c8', 1.6); },
        far: [[84, 58], [94, 70], [96, 80]],
        wFar: function (c, p) { return skullStaff(c, [100, 26], [94, 120], '#7cff5a', 1.05); },
        near: [[48, 60], [36, 68], [24, 64]],
        wNearFront: function (c, p) { return handFire(c, [p[0], p[1] - 4], '#6aff4a', '#e8ffc0', 1) + C(p[0], p[1], 4.4, c.cel('#b06a3c'), 2); }
      });
    },
    shadowhide_warrior: function (c) {
      return rrGnoll(c, {
        fur: '#36323c', mane: '#141216', spot: '#1c1a20', eye: '#ff3a1a', glowEye: '#ff3a1a', loin: '#5a1a1a', armW: 11, legW: 11.5, shadowR: 36, belt: '#1e1a1a',
        chest: function (c) { return L('M82,50 L48,90', '#1e1a1a', 3.4) + L('M50,60 L58,66 M56,56 L64,62', '#8a1a14', 2); },
        pads: function (c) { return body(c, 'M36,58 C36,44 60,42 62,56 L58,62 L40,64 Z', '#4a3a36', L('M38,54 C44,48 56,48 60,54', '#8a1a14', 1.6), 1.8); },
        near: [[48, 60], [38, 56], [30, 48]],
        wNear: function (c, p) { return axe(c, p, 34, -2.0, 13, '#9a9ea6'); },
        tf: at(1.04, 64, 122)
      });
    },
    shadowhide_darkweaver: function (c) {
      var pur = '#a650ff';
      return rrGnoll(c, {
        fur: '#3a3444', mane: '#18141e', spot: '#201c26', eye: '#d080ff', glowEye: pur, loin: '#3a2448', armW: 9.5, legW: 10.5,
        front: function (c) { return body(c, 'M48,88 L84,88 L88,114' + rag(88, 44, 114, 7, 13).replace(/^L/, ' L') + ' Z', '#3e2a50', L('M50,96 L86,96', '#8a5ac8', 1.6) + F(pd([[70, 86], [92, 86], [92, 118], [72, 118]], true), '#140c1c', 0.5), 1.8); },
        pads: function (c) { return body(c, 'M36,56 C40,44 70,40 88,50 L90,62 L76,58 L68,66 L58,58 L48,66 L42,60 Z', '#4a3060', L('M40,56 C50,48 70,46 86,54', '#8a5ac8', 1.4), 1.8) + skull(c, 62, 60, 0.6); },
        headX: function (c, x, y) { return L('M' + pt([x - 16, y + 1]) + 'L' + pt([x - 4, y + 2]), '#8a5ac8', 1.4, 0.8); },
        far: [[84, 58], [94, 50], [98, 38]],
        wFar: function (c, p) { return C(p[0], p[1] - 8, 14, glow(c, pur, 0.7)) + swirl(c, p[0], p[1] - 10, 7, '#c890ff'); },
        near: [[48, 60], [36, 66], [24, 60]],
        wNearFront: function (c, p) { return handFire(c, [p[0], p[1] - 4], '#9a40ff', '#f0d8ff', 1.05) + C(p[0], p[1], 4.4, c.cel('#3a3444'), 2); }
      });
    },
    ribchaser: function (c) {
      return rrGnoll(c, {
        fur: '#9a5a2c', mane: '#2a100a', loin: '#6a3a1e', armW: 11, legW: 12, shadowR: 38, eye: '#ff8a1a', belt: '#3a2214',
        chest: function (c) { return L('M58,56 L70,72 M62,54 L74,70', lt('#9a5a2c', 0.45), 1.6) + boneNecklace(c, 58, 50, 16); },
        pads: function (c) { return P('M36,52 L28,40 L42,48 Z', c.cel('#ece2c8'), 1.3) + P('M44,48 L42,34 L50,46 Z', c.cel('#ece2c8'), 1.3) + body(c, 'M34,58 C34,44 60,42 62,56 L58,62 L38,64 Z', '#6a4a30', L('M38,54 C44,48 56,48 60,54', '#ece2c8', 1.4), 1.8); },
        headX: function (c, x, y) { return L('M' + pt([x + 2, y - 10]) + 'L' + pt([x - 4, y + 2]), lt('#9a5a2c', 0.45), 1.4) + E(x + 9, y - 16, 2.4, 3, 'none', 0) + L('M' + pt([x + 7, y - 20]) + 'l3,4 l-3,3', OL, 1.4); },
        near: [[48, 60], [36, 56], [30, 48]],
        wNear: function (c, p) {
          var s = cleaver(c, p, 36, -1.9, 13), q = dirQ(p, -1.9), t = '';
          [0.58, 0.68, 0.78, 0.88].forEach(function (u) { t += pd([q(36 * u, -13), q(36 * u + 2.5, -17), q(36 * u + 5, -13)], true); });
          return s + P(t, c.cel('#a0a6ac'), 1.2);
        },
        tf: at(1.06, 64, 122)
      });
    },
    // ---- Lake Everstill murlocs ----
    murloc_flesheater: function (c) {
      return murloc(c, {
        skin: '#3a6a3c', belly: '#b8c890', fin: '#8e2a26', eyeC: '#ffd0a0', scale: 1.02,
        marks: function () { return E(48, 94, 4, 2.4, '#8a1a1a', 0, 0.8) + E(56, 100, 2.6, 1.6, '#8a1a1a', 0, 0.7) + E(70, 60, 3, 2, '#2a4a2a', 0, 0.7) + L('M40,84 l2,6 M46,86 l1,5', '#8a1a1a', 1.4, 0.8); },
        fItem: function (c) {
          // bone knife: a jagged pale blade lashed to a stick, raised forward
          var q = dirQ([30, 92], -2.2), bl = pd([q(4, -3), q(14, -5), q(20, -3.5), q(24, -5.5), q(30, -2), q(34, 0), q(30, 2.4), q(4, 3)], true);
          return haft(c, [30, 92], 6, -2.2, '#6a4a2a', 3.4, 4) + P(bl, c.cel('#ece2c8'), 1.6) + L('M' + pt(q(8, 0)) + 'L' + pt(q(26, 0)), '#b8a888', 1) + E(q(26, -2)[0], q(26, -2)[1], 2.4, 1.6, '#9a1a1a', 0, 0.85) + L('M' + pt(q(2, -3)) + 'L' + pt(q(5, 3)) + 'M' + pt(q(-1, -3)) + 'L' + pt(q(1, 3)), '#c8a060', 1.4);
        },
        front: function () { return E(26, 94, 2.4, 1.6, '#9a1a1a', 0, 0.8) + C(29, 101, 1.2, '#9a1a1a', 0, 0.8) + E(44, 121, 3, 1.2, '#8a1a1a', 0, 0.7); }
      });
    },
    murloc_tidecaller: function (c) {
      return murloc(c, {
        skin: '#2e8e8c', belly: '#d4ecd8', fin: '#ee8a4a', eyeC: '#e8fff8', scale: 1,
        back: function (c) { return C(64, 80, 58, glow(c, '#6ad8ff', 0.35)) + swirl(c, 96, 60, 10, '#9ae8ff'); },
        marks: function () { return L('M58,56 q4,4 8,0 M68,62 q4,4 8,0 M62,70 q4,4 8,0', '#e8fff8', 1.2, 0.7); },
        fItem: function (c) {
          // driftwood staff crowned with branching coral
          var o = limb('M36,118 L24,40', '#8a7a5a', 3.2) + L('M36,118 L24,40', '#b8a888', 1, 0.6), br = 'M24,42 L18,28 L14,30 M18,28 L20,20 M24,42 L28,30 L34,26 M28,30 L26,22 M22,36 L14,40 L10,36';
          o += L(br, OL, 5.6) + L(br, '#f07a70', 3.2) + L(br, '#ffb0a0', 1, 0.8) + C(24, 30, 14, glow(c, '#8ae8ff', 0.6));
          return o;
        },
        front: function (c) { return swirl(c, 24, 76, 8, '#9ae8ff') + C(16, 64, 2, '#c8f4ff', 1) + C(34, 62, 1.6, '#c8f4ff', 1); }
      });
    },
    squiddic: function (c) {
      var tn = '#b0508a';
      var tent = function (pts, w) { var d = 'M' + pt(pts[0]) + 'C' + pt(pts[1]) + ' ' + pt(pts[2]) + ' ' + pt(pts[3]); return L(d, OL, w + 4) + L(d, tn, w) + L(d, lt(tn, 0.35), w * 0.3, 0.7); };
      return murloc(c, {
        skin: '#56699a', belly: '#dcd8e8', fin: '#7a4a9a', eyeC: '#fff4a0', scale: 1.08,
        back: function (c) { return tent([[70, 36], [90, 30], [104, 44], [110, 64]], 6) + tent([[66, 38], [80, 20], [96, 18], [100, 30]], 5); },
        fItem: function (c) { return spear(c, [20, 42], [36, 118], 14, '#c8c0a8', '#6a5a44'); },
        front: function (c) {
          var o = tent([[58, 40], [52, 24], [40, 22], [36, 30]], 5.4) + tent([[64, 40], [62, 20], [74, 12], [80, 18]], 5) + tent([[62, 42], [70, 50], [80, 50], [84, 60]], 4.4);
          o += body(c, 'M50,44 C50,30 70,28 76,40 C70,44 58,46 50,44 Z', tn, E(60, 36, 4, 2, lt(tn, 0.3), 0, 0.7), 2);
          [[40, 25], [36, 29], [74, 15], [80, 20], [104, 50], [108, 60], [94, 22]].forEach(function (s) { o += C(s[0], s[1], 1.3, '#f0c8e0', 0.8); });
          return o;
        }
      });
    },
    // ---- beasts ----
    tarantula: function (c) { return tarantulaArt(c, { col: '#4e3424', band: '#c89060', eye: '#ffa030', scale: 1 }); },
    great_goretusk: function (c) {
      return goretusk(c, { col: '#3e2a22', mane: '#16100c', snout: '#7a5046', tusk: 1.75, scars: true, scale: 1.08, seed: 17, eye: '#ff3a1a' }) +
        G(P('M' + pt([36, 58]) + 'L' + pt([40, 44]) + 'L' + pt([46, 56]) + 'Z', c.cel('#e8dcc0'), 1.3) + P('M' + pt([60, 52]) + 'L' + pt([64, 36]) + 'L' + pt([68, 52]) + 'Z', c.cel('#e8dcc0'), 1.3) + P('M' + pt([82, 52]) + 'L' + pt([88, 36]) + 'L' + pt([90, 54]) + 'Z', c.cel('#e8dcc0'), 1.3), at(1.08, 64, 122));
    },
    bellygrub: function (c) { return bellygrubArt(c); },
    black_dragon_whelp: function (c) { return whelp(c, { col: '#2a2428', belly: '#e0641e', mem: '#b8401e', eye: '#ffc030', scale: 0.96 }); },
    // ---- Blackrock orcs ----
    blackrock_outrunner: function (c) {
      return rrOrc(c, {
        skin: '#6a8a3a', shirt: '#2e2828', sleeve: '#6a8a3a', pants: '#3a3030', boots: '#1e1818', glove: '#2e2424', legW: 10.5, armW: 9.5,
        chest: function (c) { return L('M50,50 L78,86 M78,50 L52,86', '#1a1416', 2.4) + C(64, 67, 3, c.cel(BRO), 1.2) + L('M50,56 l4,4 M76,56 l-4,4', BRK, 1.6); },
        pads: function (c) { return leatherPadR(c, 48, 52, '#3a3234') + L('M40,64 L48,60 M40,68 L48,64', BRK, 1.6); },
        headX: function (c, x, y) { return ponytail(c, x, y) + L('M' + pt([x - 11, y - 11]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 12, y - 10]), BRK, 3) + L('M' + pt([x - 4, y + 1]) + 'l4,3 M' + pt([x - 2, y - 2]) + 'l4,3', '#c83020', 1.2); },
        near: [[48, 54], [38, 66], [28, 72]],
        wNear: function (c, p) { return spear(c, [12, 34], [44, 118], 15, '#b8b4a8', '#5a3a22'); },
        tf: at(1.02, 64, 122)
      });
    },
    blackrock_renegade: function (c) {
      var m = '#3a3638';
      return rrOrc(c, {
        skin: '#6a8636', shirt: m, sleeve: m, forearm: '#6a8636', pants: '#2a2426',
        chest: function (c) { return mail(46, 48, 86, 88, '#6a6668') + P('M56,48 L72,48 L70,90 L58,90 Z', c.cel('#8e1e16'), 1.4) + sigil(64, 66, 0.9); },
        front: function (c) { return body(c, 'M56,84 L72,84 L72,106 L64,102 L56,106 Z', '#8e1e16', '', 1.6); },
        pads: function (c) { return spikePad(c, 80, 52, 10, '#2e2a2e') + spikePad(c, 46, 52, 11, '#343034'); },
        headX: function (c, x, y) { return body(c, 'M' + pt([x - 11, y - 6]) + 'C' + pt([x - 11, y - 20]) + ' ' + pt([x + 12, y - 21]) + ' ' + pt([x + 13, y - 6]) + 'L' + pt([x + 12, y - 2]) + 'L' + pt([x - 11, y - 3]) + 'Z', '#3a3638', L('M' + pt([x - 10, y - 6]) + 'L' + pt([x + 12, y - 5]), BRK, 1.6), 2) + R(x - 12, y - 8, 4, 12, c.cel('#4a4648'), 1.2); },
        far: [[80, 54], [90, 46], [94, 38]],
        wFar: function (c, p) { return sword(p, 28, -2.0, '#c0c4ca', 1); },
        near: [[48, 54], [38, 66], [34, 76]],
        wNearFront: function (c, p) { return roundShield(c, p[0] - 4, p[1] - 4, 16); }
      });
    },
    blackrock_champion: function (c) {
      var pl = '#2e2a2e';
      return rrOrc(c, {
        skin: '#62803a', shirt: pl, sleeve: pl, forearm: '#3a3638', pants: '#262224', glove: '#1e1a1c', legW: 13, armW: 12, shadowR: 40,
        torsoD: 'M38,50 C46,42 84,42 92,50 L90,72 L86,90 L44,90 L40,72 Z',
        chest: function (c) { return P('M44,52 L86,52 L82,78 L48,78 Z', c.cel('#3a3638'), 1.8) + L('M46,64 L84,64', '#1a1618', 1.4) + L('M46,53 L85,53', BRK, 2) + sigil(64, 66, 1.2) + C(48, 58, 1.2, '#b8b4ac', 0.6) + C(82, 58, 1.2, '#b8b4ac', 0.6); },
        front: function (c) { return body(c, 'M46,86 L84,86 L86,104 L72,100 L66,108 L60,100 L44,104 Z', '#3a3638', L('M46,88 L84,88', BRK, 2), 1.8); },
        shins: function (c) { return P('M46,104 L60,104 L58,116 L48,116 Z', c.cel(pl), 1.6) + P('M66,104 L80,104 L78,116 L68,116 Z', c.cel(dk(pl, 0.15)), 1.6); },
        pads: function (c) { return spikePad(c, 84, 50, 12, '#343034') + spikePad(c, 44, 50, 14, '#3a363a', [[-0.9, -1.2], [-0.2, -1.5], [0.5, -1.4], [1, -1]]); },
        headX: function (c, x, y) { return body(c, 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 12, y - 21]) + ' ' + pt([x + 12, y - 22]) + ' ' + pt([x + 14, y - 4]) + 'L' + pt([x + 14, y + 8]) + 'L' + pt([x + 6, y + 6]) + 'L' + pt([x + 4, y - 3]) + 'L' + pt([x - 12, y - 1]) + 'Z', '#2e2a2e', L('M' + pt([x - 12, y - 6]) + 'L' + pt([x + 13, y - 5]), BRK, 1.8) + F(pd([[x + 4, y - 24], [x + 16, y - 24], [x + 16, y + 10], [x + 6, y + 10]], true), '#000', 0.4), 2) + R(x - 13, y - 6, 4, 13, c.cel('#3a3638'), 1.2) + P(pd([[x - 2, y - 18], [x + 2, y - 30], [x + 6, y - 18]], true), c.cel('#8a8a90'), 1.2); },
        near: [[46, 54], [36, 66], [30, 76]], far: [[82, 54], [80, 68], [60, 78]],
        wNear: function (c, p) { return axe(c, [p[0] + 26, p[1] + 24], 70, -2.18, 20, '#9a9ea6', true, '#3a2a22'); },
        tf: at(1.08, 64, 122)
      });
    },
    blackrock_summoner: function (c) {
      var rb = '#2a2226', fel = '#6aff3a';
      return rrOrc(c, {
        skin: '#6a8a3a', shirt: rb, sleeve: rb, forearm: '#6a8a3a', pants: rb, boots: '#1a1416',
        head: null,
        headX: function (c, x, y) { return hood(c, x, y, '#3a2a2e', BRK) + hoodFace(c, x, y, '#6a8a3a', fel); },
        hood: true,
        chest: function (c) { return P('M58,48 L70,48 L68,88 L60,88 Z', c.cel('#7a1a16'), 1.2) + skull(c, 64, 58, 0.55); },
        front: function (c) { return body(c, 'M46,84 L82,84 L88,120 L40,120 Z', rb, F(pd([[66, 82], [92, 82], [92, 122], [70, 122]], true), '#0a0808', 0.5) + L('M44,110 L86,110', BRK, 2.4) + P('M58,84 L70,84 L72,120 L56,120 Z', c.cel('#7a1a16'), 1.2) + sigil(64, 98, 0.9), 2); },
        pads: function (c) { return body(c, 'M36,56 C38,44 60,42 64,54 L60,60 L40,62 Z', '#3a2a2e', L('M38,54 C44,48 56,48 62,54', BRK, 1.4), 1.8) + skull(c, 48, 52, 0.5); },
        far: [[80, 54], [92, 60], [98, 50]],
        wFar: function (c, p) { return handFire(c, [p[0], p[1] - 3], fel, '#e8ffc0', 0.8); },
        near: [[48, 54], [36, 64], [26, 58]],
        wNearFront: function (c, p) { return handFire(c, [p[0], p[1] - 5], fel, '#e8ffc0', 1.15) + C(p[0], p[1], 4.4, c.cel('#6a8a3a'), 2); }
      });
    },
    gathilzogg: function (c) {
      var pl = '#262226';
      return rrOrc(c, {
        skin: '#5e7c36', shirt: pl, sleeve: pl, forearm: '#34303a', pants: '#222', glove: '#1a1618', legW: 13.5, armW: 12.5, shadowR: 44, eye: '#ff4a1a',
        torsoD: 'M36,50 C44,40 86,40 94,50 L92,72 L88,90 L42,90 L38,72 Z',
        back: function (c) { return body(c, 'M52,46 C70,40 90,44 96,52 C102,76 106,98 110,118 L98,112 L92,120 L84,112 L74,118 C72,94 64,66 52,46 Z', '#6a1612', F(pd([[90, 44], [114, 44], [114, 122], [98, 122]], true), '#3a0a08', 0.6), 2); },
        chest: function (c) { return P('M42,52 L88,52 L84,80 L46,80 Z', c.cel('#34303a'), 1.8) + L('M44,53 L87,53', BRK, 2.2) + sigil(65, 66, 1.4) + L('M46,66 L52,66 M78,66 L84,66', '#1a1618', 1.4) + C(47, 58, 1.3, '#c8a040', 0.6) + C(83, 58, 1.3, '#c8a040', 0.6); },
        front: function (c) { return body(c, 'M44,86 L86,86 L88,106 L74,102 L66,110 L58,102 L42,106 Z', '#34303a', L('M44,88 L86,88', BRK, 2.2), 1.8) + skull(c, 64, 90, 0.8); },
        shins: function (c) { return P('M45,104 L61,104 L59,117 L47,117 Z', c.cel(pl), 1.6) + P('M65,104 L81,104 L79,117 L67,117 Z', c.cel(dk(pl, 0.15)), 1.6); },
        pads: function (c) { return spikePad(c, 86, 48, 13, '#2e2a2e') + spikePad(c, 42, 48, 16, '#34303a', [[-1, -1.1], [-0.35, -1.55], [0.3, -1.6], [0.95, -1.2]]) + skull(c, 42, 50, 0.6); },
        top: function (c) { return hornHelm(c, 58, 35, '#2a262c'); },
        near: [[46, 56], [34, 70], [26, 80]], hy: 35,
        wNear: function (c, p) { return axe(c, p, 44, -1.64, 19, '#a0a4ac', true, '#2e2018'); },
        tf: at(1.06, 64, 122)
      });
    },
    // ---- the Stockade ----
    defias_convict: function (c) {
      var sk = '#e0b08a';
      return prisoner(c, {
        skin: sk, tunic: '#8e8a82', seed: 3,
        head: function (c, x, y) { return defiasHead(c, x, y, { skin: sk, bandana: DEF_RED }); },
        near: [[48, 54], [36, 62], [30, 52]], far: [[80, 54], [90, 62], [88, 50]],
        nearHand: function (c, p) { return wrapFist(c, p, sk); }, farHand: function (c, p) { return wrapFist(c, p, dk(sk, 0.08)); }
      });
    },
    defias_inmate: function (c) {
      var sk = '#d8a47c';
      return prisoner(c, {
        skin: sk, tunic: '#a49a86', pants: '#6e665a', seed: 7, hair: '#3a2a22',
        head: function (c, x, y) { return humanHead(c, x, y, { skin: sk, hairCol: '#3a2a22' }) + stubble(x, y) + L('M' + pt([x - 2, y - 10]) + 'l4,5', '#b07a60', 1.2); },
        chest: function (c) { return R(66, 64, 9, 8, '#8a806e', 1) + L('M66,64 l9,8 M75,64 l-9,8', '#6a604e', 0.8); },
        near: [[48, 54], [40, 68], [30, 72]],
        wNear: function (c, p) { return shiv(p, -2.7); },
        far: [[80, 54], [88, 70], [88, 86]],
        wFar: function (c, p) { return shackle(c, [p[0], p[1] - 7], 5, 1.7); }
      });
    },
    defias_insurgent: function (c) {
      return prisoner(c, {
        skin: '#e4b48a', tunic: '#7e7a72', pants: '#5e5a54', seed: 11, neckCol: DEF_HOOD,
        head: function (c, x, y) { return defiasHead(c, x, y, { skin: '#e4b48a' }); },
        chest: function (c) { return P('M76,48 L82,52 L54,88 L48,86 Z', c.cel(DEF_RED), 1.3); },
        far: [[80, 54], [90, 48], [94, 40]],
        wFar: function (c, p) { return hTorch(c, p, 18, -1.75); },
        near: [[48, 54], [38, 66], [30, 70]],
        wNear: function (c, p) { return club(c, p, 30, -2.4, 5.4, '#7a5234'); }
      });
    },
    defias_captive: function (c) {
      var sk = '#dcae8a';
      return prisoner(c, {
        skin: sk, tunic: '#9a968c', pants: '#76726a', seed: 17, armW: 7.5, legW: 8.5, shadowR: 26,
        torsoD: 'M49,50 C54,46 74,46 79,50 L77,70 L76,88 L52,88 L51,70 Z',
        head: function (c, x, y) { return humanHead(c, x, y, { skin: sk, hairCol: '#6a5038' }) + P('M' + pt([x - 8, y - 12]) + 'L' + pt([x - 12, y - 18]) + 'L' + pt([x - 2, y - 14]) + 'L' + pt([x + 2, y - 20]) + 'L' + pt([x + 6, y - 14]) + 'L' + pt([x + 12, y - 16]) + 'L' + pt([x + 10, y - 8]) + 'Z', c.cel('#6a5038'), 1.4) + E(x - 5, y + 3, 2.4, 1.4, dk(sk, 0.2), 0, 0.6); },
        chest: function () { return L('M56,58 q8,2 16,0 M56,64 q8,2 16,0 M57,70 q7,2 14,0', dk(sk, 0.3), 1, 0.7); },
        near: [[50, 54], [38, 50], [30, 40]],
        wNearFront: function (c, p) { return shackle(c, [p[0] + 3, p[1] + 5]) + swingChain(c, [p[0], p[1] + 2], [4, 30], [10, 66]); },
        far: [[78, 54], [86, 70], [86, 86]],
        wFar: function (c, p) { return shackle(c, [p[0], p[1] - 7], 3, 1.5); },
        tf: 'matrix(0.96,0,0,1.02,' + n(64 - 64 * 0.96) + ',' + n(122 - 122 * 1.02) + ')'
      });
    },
    targorr: function (c) {
      var sk = '#5a7a34';
      return rrOrc(c, {
        skin: sk, shirt: sk, sleeve: sk, pants: RAG2, boots: '#3a2e26', glove: sk, belt: '#5a4a34', buckle: '#8a8e96', legW: 12.5, armW: 12, shadowR: 40, eye: '#ff6a1a',
        torsoD: 'M38,50 C46,42 84,42 92,50 L90,72 L86,90 L44,90 L40,72 Z',
        chest: function (c) { return L('M50,58 L64,74 M56,54 L72,70 M70,74 L80,60 M48,76 L58,84', lt(sk, 0.4), 1.6) + L('M54,64 Q64,70 76,64', dk(sk, 0.3), 1.2) + P('M78,48 L90,50 L88,70 L72,64 Z', c.cel(RAG), 1.4); },
        front: function (c) { return body(c, 'M46,86 L84,86 L86,100' + rag(86, 44, 100, 8, 21).replace(/^L/, ' L') + ' Z', RAG, '', 1.8); },
        headX: function (c, x, y) { return L('M' + pt([x - 10, y - 12]) + 'L' + pt([x - 2, y + 4]) + 'M' + pt([x + 4, y - 14]) + 'L' + pt([x + 8, y - 4]), lt(sk, 0.45), 1.6) + P('M' + pt([x - 2, y - 16]) + 'L' + pt([x + 6, y - 22]) + 'L' + pt([x + 10, y - 14]) + 'Z', '#1e1812', 1.4); },
        bald: true,
        near: [[46, 54], [36, 56], [30, 50]],
        wNear: function (c, p) { return axe(c, p, 32, -2.0, 16, '#8a8e94', false, '#5a3a22') + shackle(c, [p[0] + 3, p[1] + 9], 3, 1.2); },
        far: [[82, 54], [92, 70], [92, 86]],
        wFar: function (c, p) { return shackle(c, [p[0], p[1] - 7], 4, 1.6); },
        tf: at(1.08, 64, 122)
      });
    },
    kam_deepfury: function (c) {
      var sk = '#8a8a96';
      return rrDwarf(c, {
        skin: '#9c9eaa', hair: '#34282c', band: '#c8541e', shirt: RAG, sleeve: RAG, forearm: sk, pants: RAG2, boots: '#2e2622', glove: sk, belt: '#5a4a34', buckle: '#8a8e96', scar: true, beardLen: 28,
        headX: function (c, x, y) { return glowEye(c, x - 5.6, y - 3.2, 1.3, '#ff8a2a'); },
        chest: function (c) { return L('M48,66 l6,6 M78,64 l-5,6', dk(RAG, 0.35), 1.2); },
        near: [[44, 62], [34, 58], [30, 52]],
        wNear: function (c, p) { return hammer(c, p, 30, -1.95, 9, '#7a7e86'); },
        far: [[84, 62], [92, 78], [92, 92]],
        wFar: function (c, p) { return shackle(c, [p[0], p[1] - 7], 3, 1.6); }
      });
    },
    hamhock: function (c) {
      var sk = '#c09070';
      return biped(c, {
        skin: sk, shirt: RAG, pants: RAG2, sleeve: sk, glove: sk, boots: dk(sk, 0.3), feet: toes2, legW: 16, armW: 15, hipY: 98, shadowR: 46, neck: false,
        torsoD: 'M26,56 C28,34 96,30 104,54 L108,84 L98,102 L32,102 L22,84 Z',
        chest: function (c) { return F('M30,74 C40,96 90,98 104,76 L108,104 L24,104 Z', dk(RAG, 0.25), 0.6) + L('M40,60 l6,8 M84,56 l-4,10 M60,84 l8,-6', dk(RAG, 0.4), 1.4) + P('M84,40 L100,52 L96,62 L80,52 Z', c.cel(sk), 1.4); },
        front: function (c) { return L('M28,90 L104,90', '#7a6a4a', 4) + body(c, 'M36,92 L96,92 L98,108' + rag(98, 34, 108, 8, 29).replace(/^L/, ' L') + ' Z', RAG, '', 1.8); },
        head: function (c, x, y) { return ogreHead(c, x, y, { skin: sk, scar: true }); }, hx: 46, hy: 28,
        near: [[36, 58], [24, 74], [20, 90]], far: [[96, 58], [108, 74], [106, 90]],
        nearHand: function (c, p) { return bigFist(c, p, sk, 10) + shackle(c, [p[0] + 2, p[1] - 12]); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 9); },
        tf: at(1.04, 64, 122)
      });
    },
    bazil_thredd: function (c) {
      var lea = '#2a2426';
      return biped(c, {
        skin: '#e4b48a', shirt: lea, pants: '#221c1c', sleeve: lea, glove: '#1a1414', boots: '#141010', belt: '#141010', buckle: '#d8b050', neckCol: DEF_HOOD,
        head: function (c, x, y) { return defiasHead(c, x, y, { skin: '#e4b48a', hood: '#a3252a', mask: '#c02e30' }); }, hx: 60, hy: 30,
        back: function (c) { return body(c, 'M50,46 C66,40 84,44 88,52 C94,72 96,96 98,116 L88,112 L80,117 L72,112 L62,116 C62,90 58,66 50,46 Z', '#8e1c22', F('M84,48 C92,70 96,94 100,118 L86,118 C84,92 82,70 78,48 Z', '#4a0c10', 0.6), 2.2); },
        chest: function (c) { return L('M50,52 L78,86 M78,52 L52,86', '#141010', 2.4) + P('M74,48 L82,52 L56,90 L48,86 Z', c.cel(DEF_RED), 1.3) + C(64, 69, 2.4, c.cel('#d8b050'), 1); },
        pads: function (c) { return leatherPadR(c, 80, 52, '#3a2e2c', DEF_RED) + leatherPadR(c, 48, 52, '#3a3230', DEF_RED); },
        near: [[48, 54], [38, 66], [28, 70]], far: [[80, 54], [90, 60], [96, 50]],
        wNear: function (c, p) { return sword(p, 24, -2.5, '#d8dce2', 0.85); },
        wFar: function (c, p) { return sword(p, 24, -1.3, '#c8ccd2', 0.85); },
        armW: 9, legW: 10.5, shadowR: 30, tf: at(1.04, 64, 122)
      });
    },
    dextren_ward: function (c) {
      var sk = '#d4bca4';
      return prisoner(c, {
        skin: sk, tunic: '#86827a', pants: '#5e5a54', seed: 23, armW: 7.5, legW: 9, shadowR: 28,
        torsoD: 'M49,50 C54,46 74,46 79,50 L78,70 L77,88 L51,88 L50,70 Z',
        head: function (c, x, y) {
          return humanHead(c, x, y, { skin: sk, hairCol: '#b8b4a8' }) + E(x - 5, y - 1, 3.2, 2.6, dk(sk, 0.35), 0, 0.7) + C(x - 5, y - 1, 1.3, '#e8e0a0') + L('M' + pt([x - 8, y + 7]) + 'L' + pt([x - 2, y + 6]), '#6a1a1a', 1.2) + L('M' + pt([x - 3, y + 2]) + 'l2,4', dk(sk, 0.3), 1);
        },
        chest: function (c) { return E(62, 76, 4, 2.6, '#6a1a1a', 0, 0.6) + E(70, 60, 2.4, 1.6, '#6a1a1a', 0, 0.5) + F('M72,48 L80,50 L78,62 Z', '#1a1410', 0.8); },
        near: [[50, 54], [40, 54], [32, 46]],
        wNear: function (c, p) { return cleaver(c, p, 32, -1.9, 12); },
        far: [[78, 54], [84, 70], [82, 84]],
        tf: 'matrix(0.98,0,0,1.04,' + n(64 - 64 * 0.98) + ',' + n(122 - 122 * 1.04) + ')'
      });
    },
    bruegal_ironknuckle: function (c) {
      var sk = '#e0a07a';
      return rrDwarf(c, {
        skin: sk, hair: '#b8541e', band: '#8a8e96', shirt: '#6a4a30', sleeve: sk, forearm: sk, pants: RAG2, boots: '#3a2618', glove: sk, belt: '#3a2818', buckle: '#8a8e96', beardLen: 30,
        chest: function (c) { return P('M46,58 L58,56 L60,92 L46,92 Z', c.cel('#5a3e28'), 1.4) + P('M70,56 L84,58 L84,92 L68,92 Z', c.cel('#4a3220'), 1.4) + L('M56,70 l8,4 M60,62 l6,6', dk(sk, 0.3), 1.2); },
        near: [[44, 62], [32, 70], [26, 60]], far: [[84, 62], [94, 70], [92, 58]],
        nearHand: function (c, p) { return ironKnuckle(c, p, sk); }, farHand: function (c, p) { return ironKnuckle(c, p, dk(sk, 0.08)); },
        tf: at(1.04, 64, 122)
      });
    }
  };
  function leatherPadR(c, x, y, col, trim) { return body(c, 'M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y + 4]) + 'Z', col, trim ? L('M' + pt([x - 8, y + 2]) + 'C' + pt([x - 6, y - 3]) + ' ' + pt([x + 6, y - 4]) + ' ' + pt([x + 9, y + 2]), trim, 1.4) : '', 2) + C(x, y - 1, 1.3, '#9a9aa0', 0.8); }

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#a8603a'), 2.5); }
  function phScene(c) { return sky(c, '#4a6aa8', '#d8a080', '#f6d49a') + ground(c, 150, GR, GR2); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#a8603a"/></svg>'; }
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
