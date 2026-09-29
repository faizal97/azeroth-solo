/* art_razorfen.js — The Thorn Warrens art for Realm of Loner (Krugar dungeon, levels 29-34: the Spinehide's giant thorn warren
 * in the southern Scrublands). Scenes: the thorn gate on the savannah, the winding thorn tunnels, the ritual depths.
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Thorn Warrens keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_wetlands.js. The Spinehide are
 * porcupine-folk (spinefolk / spHead / quillCoat): stocky, round-bellied and short-legged, with a dense coat of slender
 * banded quills (dark base, dusty grey middle, bone tip) over the back, shoulders and crown, a tapered snout with a round
 * black button nose, small beady eyes, small round ears, two small curved jaw tusks and clawed paws. This tribe's own
 * colours: darker umber hide, bone-white skull paint over the eyes, torn ears and slightly heavier tusks.
 * The carved masks on totems, stakes and staffs are Briarmother masks: dark-wood faces of the thorn spirit asleep under the
 * Scrublands (the Warrens are her roots), bound with thorn vine and crowned with banded quills. The great idol is her face.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix rk<counter>_).
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
  function Ctx() { this.p = 'rk' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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


  // ============================================================
  //  SCENE PIECES (shared house style)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
  function cloud(x, y, s, op, col) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, col || '#f4f6f8', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', dk(col || '#f4f6f8', 0.14), 0.9);
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
  function flowers(seed, y0, y1, cols, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), sz = 0.8 + (y - y0) / (y1 - y0 || 1) * 1.4; s += C(r() * 400, y, sz, cols[i % cols.length]); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
  // ---- ribbons (shared copy of art_ashenvale.js) ----
  function lerp2(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  // Catmull-Rom sampling through control points
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
  // tapered ribbon along a smooth curve (tails, necks, tentacles, horns); side a is the left of the travel direction
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
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function shadowSwirl(c, p, r, col) {
    col = col || '#a050f0'; r = r || 1;
    var d = 'M' + pt([p[0] + 8 * r, p[1]]) + 'C' + pt([p[0] + 8 * r, p[1] - 9 * r]) + ' ' + pt([p[0] - 7 * r, p[1] - 10 * r]) + ' ' + pt([p[0] - 8 * r, p[1] - 1 * r]) + 'C' + pt([p[0] - 8 * r, p[1] + 6 * r]) + ' ' + pt([p[0] + 2 * r, p[1] + 7 * r]) + ' ' + pt([p[0] + 4 * r, p[1] + 1 * r]) + 'C' + pt([p[0] + 5 * r, p[1] - 3 * r]) + ' ' + pt([p[0] - 2 * r, p[1] - 5 * r]) + ' ' + pt([p[0] - 3 * r, p[1] - 1 * r]);
    return C(p[0], p[1] - 2 * r, 24 * r, glow(c, col, 0.7)) + L(d, dk(col, 0.4), 4.4 * r) + L(d, lt(col, 0.35), 2 * r) + C(p[0], p[1] - 1 * r, 3 * r, '#f0d8ff');
  }
  function club(c, p, len, ang, col, spikes) {
    var q = dirQ(p, ang); col = col || '#7a5434';
    var o = haft(c, p, len * 0.55, ang, col, 4, 9);
    var hd = 'M' + pt(q(len * 0.4, -4)) + 'C' + pt(q(len * 0.7, -10)) + ' ' + pt(q(len + 2, -10)) + ' ' + pt(q(len + 4, 0)) + 'C' + pt(q(len + 2, 10)) + ' ' + pt(q(len * 0.7, 10)) + ' ' + pt(q(len * 0.4, 4)) + 'Z';
    if (spikes) [[0.66, -9, -1], [0.86, -10, -1], [len ? 1.02 : 1, 0, 0], [0.86, 10, 1], [0.66, 9, 1]].forEach(function (k) { var b = q(len * k[0], k[1]), tp = q(len * k[0] + (k[2] ? 2 : 9), k[1] + k[2] * 7); o += P(pd([q(len * k[0] - 3, k[1] * 0.9), tp, q(len * k[0] + 3, k[1] * 0.9)], true), c.cel('#e8dcc0'), 1.1); });
    return o + body(c, hd, col, L('M' + pt(q(len * 0.6, -3)) + 'l3,2 M' + pt(q(len * 0.8, 3)) + 'l2,-3', dk(col, 0.4), 1.4) + F(pd([q(len * 0.4, 1), q(len + 6, 1), q(len + 6, 12), q(len * 0.4, 12)], true), dk(col, 0.3), 0.7), 2);
  }
  // ---- biped rig (facing left; shared copy of art_ashenvale.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function bearPaw(x, y, col) {
    return P('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 9, y - 1]) + ' ' + pt([x + 7, y + 1.5]) + ' ' + pt([x + 2, y + 1.5]) + 'L' + pt([x - 9, y + 1.5]) + 'C' + pt([x - 12, y + 1.5]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 7, y - 6]) + 'Z', col, 2) +
      L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', OL, 3) + L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', '#efe6cf', 1.3);
  }
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
      var kneeF = o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113';
      var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
      s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
      s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
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
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  // ---- more shared copies of art_redridge.js (feathers, spear, rags, Stoneharrow-style gnoll rig, bone necklace, pelt hood) ----
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
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }

  // ============================================================
  //  RAZORFEN PIECES
  // ============================================================
  var VINE = '#6c5844', THORN = '#dcd0b0', BONE = '#ece4cc', BONED = '#c8bc9c', WOOD = '#6a4a2e', WOODD = '#3e2a1a', OCHRE = '#b0823e', HIDE = '#7a5a3a',
    RFSK = '#6a4a3c', RFMANE = '#857564', NECRO = '#a050f0', GEO = '#f0a040', IRON = '#5a5c62';
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2) + L('M' + n(x - 0.5) + ',' + n(y - 3) + ' L' + n(x - 0.5) + ',' + n(y + 1), OL, 1.2); }
  // flat-topped Scrublands mesas on the horizon, no outline
  function mesas(seed, base, col) {
    var r = rng(seed), o = '', x = -30;
    while (x < 420) {
      var w = 40 + r() * 70, h = 8 + r() * 20, t = base - h;
      o += F(pd([[x, base + 2], [x + w * 0.12, t + 3], [x + w * 0.2, t], [x + w * 0.8, t], [x + w * 0.9, t + 4], [x + w, base + 2]], true), col) +
        F(pd([[x + w * 0.62, t], [x + w * 0.8, t], [x + w * 0.9, t + 4], [x + w, base + 2], [x + w * 0.66, base + 2]], true), dk(col, 0.14), 0.8);
      x += w + r() * 50;
    }
    return o;
  }
  function acacia(c, x, y, s) {
    var tr = '#5a4230';
    var o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x, y]) + 'C' + pt([x + 2 * s, y - 14 * s]) + ' ' + pt([x - 4 * s, y - 24 * s]) + ' ' + pt([x - 2 * s, y - 34 * s]), tr, 3.4 * s) +
      limb('M' + pt([x + 1 * s, y - 16 * s]) + 'C' + pt([x + 8 * s, y - 22 * s]) + ' ' + pt([x + 12 * s, y - 28 * s]) + ' ' + pt([x + 14 * s, y - 36 * s]), tr, 2.4 * s);
    var d = 'M' + pt([x - 30 * s, y - 34 * s]) + 'C' + pt([x - 26 * s, y - 46 * s]) + ' ' + pt([x + 26 * s, y - 50 * s]) + ' ' + pt([x + 34 * s, y - 36 * s]) + 'C' + pt([x + 20 * s, y - 31 * s]) + ' ' + pt([x - 18 * s, y - 30 * s]) + ' ' + pt([x - 30 * s, y - 34 * s]) + 'Z';
    return o + body(c, d, '#7a8a3a', F('M' + pt([x - 32 * s, y - 36 * s]) + 'C' + pt([x - 10 * s, y - 38 * s]) + ' ' + pt([x + 20 * s, y - 40 * s]) + ' ' + pt([x + 36 * s, y - 38 * s]) + 'L' + pt([x + 36 * s, y - 28 * s]) + 'L' + pt([x - 32 * s, y - 28 * s]) + 'Z', '#4e5a26', 0.9), 1.6 * s);
  }
  // giant thorn vine along a smooth curve: tapered, outlined, shaded on its under side, thorns on both edges
  function vine(c, pts, w0, w1, col, seed, tk) {
    col = col || VINE; tk = tk == null ? 1 : tk;
    var T = taper(pts, w0, w1, 6), r = rng(seed || 11), th = '', m = T.s.length, tc = c.cel(THORN);
    var f0 = T.s[0], f1 = T.s[m - 1], score = -(f1[1] - f0[1]) + (f1[0] - f0[0]), shadeA = score >= 0;
    for (var i = 1, ti = 0; i < m - 1; i += (ti % 3 === 2 ? 1 : 2), ti++) {
      var onA = (ti % 2 === 1), side = onA ? T.a : T.b, other = onA ? T.b : T.a;
      var p = side[i], q = other[i], dx = p[0] - q[0], dy = p[1] - q[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      var w = w0 + (w1 - w0) * i / (m - 1), len = (w * (0.62 + r() * 0.5) + 3) * tk;
      var s0 = side[i - 1], s1 = side[i + 1], fx = s1[0] - s0[0], fy = s1[1] - s0[1], fl = Math.sqrt(fx * fx + fy * fy) || 1; fx /= fl; fy /= fl;
      var bw = Math.max(1.6, w * 0.24), lean = r() < 0.5 ? 0.35 : -0.25;
      th += pd([[p[0] - fx * bw - ux * 1.5, p[1] - fy * bw - uy * 1.5], [p[0] + ux * len + fx * len * lean, p[1] + uy * len + fy * len * lean], [p[0] + fx * bw - ux * 1.5, p[1] + fy * bw - uy * 1.5]], true);
    }
    th = th ? P(th, tc, Math.max(0.8, Math.min(1.6, (w0 + w1) * 0.045))) : '';
    var sw = Math.max(1.2, Math.min(3, w0 * 0.12));
    var shade = shadeA ? ribbonBand(T, 0, 0.4) : ribbonBand(T, 0.6, 1), hi = shadeA ? along(T, 0.78) : along(T, 0.22);
    var tex = '', kn = '';
    if (w0 > 7) {
      // bark: twisting grooves and a few knots
      for (var g = 2; g < m - 2; g += 3) { var ga = lerp2(T.a[g], T.b[g], 0.08), gb = lerp2(T.a[g + 2], T.b[g + 2], 0.92); tex += 'M' + pt(ga) + 'Q' + pt(lerp2(T.a[g + 1], T.b[g + 1], 0.35)) + ' ' + pt(gb); }
      tex = L(tex, dk(col, 0.42), Math.max(0.8, w0 * 0.07), 0.7);
      for (var kk = 4; kk < m - 3; kk += 9 + Math.floor(r() * 6)) { var kp = lerp2(T.a[kk], T.b[kk], 0.4 + r() * 0.2), kw = (w0 + (w1 - w0) * kk / (m - 1)) * 0.16; kn += E(kp[0], kp[1], kw * 1.3, kw, dk(col, 0.45), 0, 0.8) + E(kp[0] - kw * 0.3, kp[1] - kw * 0.3, kw * 0.6, kw * 0.4, lt(col, 0.15), 0, 0.7); }
    }
    return th + P(T.d, col, sw) + F(shade, dk(col, 0.34), 0.85) + tex + kn + L(hi, lt(col, 0.2), Math.max(0.8, w0 * 0.12), 0.7);
  }
  // one arch of a thorn tunnel: two twisted vines crossing over from floor to floor
  function thornArch(c, cx, baseY, hw, topY, w, col, seed) {
    var r = rng(seed), j = function (v) { return (r() - 0.5) * v; }, h = baseY - topY;
    var a = [[cx - hw, baseY + 14], [cx - hw * 0.95 + j(8), baseY - h * 0.45], [cx - hw * 0.68 + j(8), topY + h * 0.12 + j(6)], [cx + j(10), topY + j(4)], [cx + hw * 0.68 + j(8), topY + h * 0.12 + j(6)], [cx + hw * 0.95 + j(8), baseY - h * 0.45], [cx + hw, baseY + 14]];
    var b = a.map(function (p, i) { return [p[0] + j(w * 1.4), p[1] + (i % 2 ? 1 : -1) * w * 0.55]; });
    return vine(c, b, w * 0.7, w * 0.6, dk(col, 0.14), seed + 1, 0.8) + vine(c, a, w, w * 0.9, col, seed + 2);
  }
  // front-view Briarmother mask: carved dark-wood face (almond eye holes, long thin nose ridge, small solemn mouth),
  // bound with a thorn vine across the brow, crowned with a fan of banded quills. col = the wood (default WOOD);
  // eye = optional glow in the carved eyes. Same footprint as the old totem heads (about x +-10s, y -22s..+13s).
  function briarMask(c, x, y, s, col, eye) {
    col = col || WOOD;
    var k = Math.max(0.7, s), o = '', i;
    // crown of long banded quills fanning up behind the brow (dark base, pale tip)
    for (i = 0; i < 9; i++) {
      var t = i / 8, a = -PI * 0.92 + t * PI * 0.84, len = (i % 2 ? 10.5 : 14) * s * (1 - Math.abs(t - 0.5) * 0.35);
      o += quill(x + Math.cos(a) * 4 * s, y - 6 * s + Math.sin(a) * 3 * s, a, len + 4 * s, 1.5 * s, '#2a1e14', '#7a6a58', BONE);
    }
    // the carved face: broad brow, long cheeks narrowing to a pointed chin
    var d = 'M' + pt([x - 8.5 * s, y - 7 * s]) + 'C' + pt([x - 9 * s, y - 13.5 * s]) + ' ' + pt([x + 9 * s, y - 13.5 * s]) + ' ' + pt([x + 8.5 * s, y - 7 * s]) +
      'C' + pt([x + 9 * s, y + 1 * s]) + ' ' + pt([x + 5 * s, y + 9 * s]) + ' ' + pt([x, y + 13 * s]) + 'C' + pt([x - 5 * s, y + 9 * s]) + ' ' + pt([x - 9 * s, y + 1 * s]) + ' ' + pt([x - 8.5 * s, y - 7 * s]) + 'Z';
    var grain = 'M' + pt([x - 6.5 * s, y + 1 * s]) + 'Q' + pt([x - 5 * s, y + 5 * s]) + ' ' + pt([x - 2.6 * s, y + 9 * s]) + 'M' + pt([x + 6 * s, y - 9 * s]) + 'Q' + pt([x + 7 * s, y - 3 * s]) + ' ' + pt([x + 5.4 * s, y + 3 * s]);
    o += body(c, d, col, F(pd([[x + 1 * s, y - 15 * s], [x + 11 * s, y - 15 * s], [x + 11 * s, y + 14 * s], [x + 1 * s, y + 14 * s]], true), dk(col, 0.34), 0.8) +
      F(pd([[x - 10 * s, y - 12 * s], [x - 6.5 * s, y - 12 * s], [x - 7.4 * s, y + 2 * s], [x - 10 * s, y + 2 * s]], true), lt(col, 0.16), 0.7) +
      L(grain, dk(col, 0.45), 0.7 * s, 0.8), 1.5 * k);
    // bone-pale paint: brow line and two cheek marks
    o += L('M' + pt([x - 6.5 * s, y - 6.4 * s]) + 'Q' + pt([x - 4 * s, y - 8.4 * s]) + ' ' + pt([x - 1.4 * s, y - 6.6 * s]) + 'M' + pt([x + 1.4 * s, y - 6.6 * s]) + 'Q' + pt([x + 4 * s, y - 8.4 * s]) + ' ' + pt([x + 6.5 * s, y - 6.4 * s]), BONE, 1 * s, 0.9) +
      L('M' + pt([x - 5 * s, y + 1.5 * s]) + 'l' + n(0.6 * s) + ',' + n(3 * s) + 'M' + pt([x + 5 * s, y + 1.5 * s]) + 'l' + n(-0.6 * s) + ',' + n(3 * s), BONED, 1 * s, 0.85);
    // long thin nose ridge, lit on its left face
    o += P(pd([[x - 0.8 * s, y - 7 * s], [x + 0.8 * s, y - 7 * s], [x + 1.7 * s, y + 5 * s], [x, y + 6 * s], [x - 1.7 * s, y + 5 * s]], true), dk(col, 0.2), 0.8 * k) +
      F(pd([[x - 0.8 * s, y - 7 * s], [x, y - 7 * s], [x, y + 6 * s], [x - 1.7 * s, y + 5 * s]], true), lt(col, 0.3), 0.9);
    // almond eye holes, tilted up at the outer corners
    var eyeD = function (sg) {
      return 'M' + pt([x + sg * 1.7 * s, y - 3 * s]) + 'Q' + pt([x + sg * 4 * s, y - 5.4 * s]) + ' ' + pt([x + sg * 7 * s, y - 4.6 * s]) + 'Q' + pt([x + sg * 4.6 * s, y - 1.4 * s]) + ' ' + pt([x + sg * 1.7 * s, y - 3 * s]) + 'Z';
    };
    o += P(eyeD(-1), eye || '#0e0906', 0.9 * k) + P(eyeD(1), eye || '#0e0906', 0.9 * k);
    if (eye) o += C(x, y - 3.4 * s, 12 * s, glow(c, eye, 0.5)) + C(x - 4.2 * s, y - 3.4 * s, 1 * s, lt(eye, 0.6)) + C(x + 4.2 * s, y - 3.4 * s, 1 * s, lt(eye, 0.6));
    // small solemn mouth
    o += L('M' + pt([x - 2.2 * s, y + 8.4 * s]) + 'Q' + pt([x, y + 7.8 * s]) + ' ' + pt([x + 2.2 * s, y + 8.4 * s]), OL, 1.1 * k);
    // thorn vine binding across the brow, trailing past both temples
    var vb = 'M' + pt([x - 11 * s, y - 6 * s]) + 'C' + pt([x - 5 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 12.5 * s]) + ' ' + pt([x + 11 * s, y - 8 * s]) + 'Q' + pt([x + 12 * s, y - 3 * s]) + ' ' + pt([x + 10 * s, y + 1 * s]);
    o += L(vb, OL, 2.8 * s + 1) + L(vb, VINE, 1.4 * s);
    [[-8, -9.2, -1.9], [-3, -11.2, -1.7], [3, -11.4, -1.4], [8, -9.8, -0.9], [11.2, -4, 0.1]].forEach(function (q) {
      var bx = x + q[0] * s, by = y + q[1] * s, ca = Math.cos(q[2]), sa = Math.sin(q[2]);
      o += P(pd([[bx - sa * 1.1 * s, by + ca * 1.1 * s], [bx + ca * 3.2 * s, by + sa * 3.2 * s], [bx + sa * 1.1 * s, by - ca * 1.1 * s]], true), c.cel(THORN), 0.6 * k);
    });
    return o;
  }
  // Thorn Warrens totem: vine-wrapped pole, crossbar with bones and pale rags, a Briarmother mask on top
  function rfTotem(c, x, y, h, s, eye) {
    var top = y - h, o = E(x, y + 1, 12 * s, 3 * s, '#000', 0, 0.28);
    o += limb('M' + pt([x, y]) + 'L' + pt([x + 1 * s, top + 8 * s]), '#5a4230', 4 * s);
    var wr = 'M' + pt([x - 3 * s, y - 4 * s]), seg = (h - 30 * s) / 5;
    for (var k = 0; k < 5; k++) { var yy = y - 6 * s - k * seg; wr += 'Q' + pt([x + 7 * s, yy - seg * 0.25]) + ' ' + pt([x + 3 * s, yy - seg * 0.5]) + 'Q' + pt([x - 7 * s, yy - seg * 0.75]) + ' ' + pt([x - 3 * s, yy - seg]); }
    o += L(wr, OL, 3.6 * s) + L(wr, VINE, 1.8 * s);
    for (var t = 0; t < 4; t++) { var ty = y - 12 * s - t * seg * 1.2, sg = t % 2 ? 1 : -1; o += P(pd([[x + sg * 3 * s, ty - 1.5 * s], [x + sg * 9 * s, ty - 3 * s], [x + sg * 3 * s, ty + 1.5 * s]], true), c.cel(THORN), 0.9 * s); }
    var cy = top + 20 * s;
    o += limb('M' + pt([x - 15 * s, cy]) + 'L' + pt([x + 15 * s, cy - 1 * s]), '#6a5038', 2.6 * s);
    o += L('M' + pt([x - 13 * s, cy]) + 'l0,' + n(12 * s) + 'M' + pt([x + 13 * s, cy]) + 'l0,' + n(10 * s), '#3a2a1a', 1 * s);
    o += bone(x - 13 * s, cy + 15 * s, 8 * s, 1.5, 0.7 * s) + bone(x + 13 * s, cy + 13 * s, 7 * s, 1.6, 0.7 * s);
    o += P(pd([[x - 9 * s, cy + 1 * s], [x - 3 * s, cy + 1 * s], [x - 5 * s, cy + 17 * s], [x - 8 * s, cy + 12 * s]], true), OCHRE, 1 * s) + P(pd([[x + 3 * s, cy], [x + 9 * s, cy], [x + 6 * s, cy + 14 * s]], true), BONED, 1 * s);
    return o + briarMask(c, x + 1 * s, top + 4 * s, 0.95 * s, WOOD, eye);
  }
  // sharpened stake with a Briarmother mask on it
  function maskStake(c, x, y, h, s, eye) {
    var o = E(x, y + 1, 8 * s, 2.4 * s, '#000', 0, 0.28) + limb('M' + pt([x, y]) + 'L' + pt([x, y - h]), '#5a4230', 3.2 * s);
    return o + briarMask(c, x, y - h + 6 * s, 0.8 * s, WOOD, eye);
  }
  function roots(seed, x0, x1, y, len, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, l = len * (0.4 + r() * 0.8); d += 'M' + pt([x, y]) + 'Q' + pt([x + (r() - 0.5) * 12, y + l * 0.5]) + ' ' + pt([x + (r() - 0.5) * 8, y + l]); }
    return L(d, OL, 3.2) + L(d, col, 1.5);
  }
  function dirtFloor(c, yH, top, bot, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, top], [1, bot]])), r = rng(seed || 3), d = '';
    for (var i = 0; i < 24; i++) { var y = yH + 4 + r() * (236 - yH), t = (y - yH) / (240 - yH), w = 6 + t * 22, x = r() * 400; d += 'M' + pt([x - w, y]) + 'Q' + pt([x, y - 1.5 - t * 2]) + ' ' + pt([x + w, y]); }
    return o + L(d, dk(bot, 0.35), 1.1, 0.5) + pebbles((seed || 3) + 1, yH + 4, 236, dk(top, 0.3), 26);
  }
  function litter(c, seed, y0, y1, cnt, x0, x1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + (y - y0) / ((y1 - y0) || 1) * 0.6; o += r() < 0.25 ? skull(c, x, y, 0.5 * s) : bone(x, y, (8 + r() * 6) * s, (r() - 0.5) * 1.2, 0.7 * s); }
    return o;
  }
  function rockChunk(c, x, y, r, col, crack) {
    var d = pd([[x - r, y + r * 0.2], [x - r * 0.5, y - r * 0.8], [x + r * 0.4, y - r], [x + r, y - r * 0.1], [x + r * 0.6, y + r * 0.8], [x - r * 0.4, y + r * 0.9]], true);
    return body(c, d, col, F(pd([[x + r * 0.15, y - r * 1.2], [x + r * 1.3, y - r * 1.2], [x + r * 1.3, y + r * 1.2], [x - r * 0.1, y + r * 1.2]], true), dk(col, 0.3), 0.8), 1.5) +
      (crack ? L('M' + pt([x - r * 0.55, y - r * 0.1]) + 'L' + pt([x - r * 0.05, y + r * 0.2]) + 'L' + pt([x + r * 0.3, y - r * 0.5]), crack, 1.3) : '');
  }
  function floatingStones(c, x, y, s, col) {
    col = col || GEO;
    var o = C(x, y, 28 * s, glow(c, col, 0.6)) + L('M' + pt([x - 17 * s, y + 4 * s]) + 'A' + n(17 * s) + ',' + n(7 * s) + ' 0 0,0 ' + pt([x + 17 * s, y + 4 * s]), col, 1.4, 0.8);
    return o + rockChunk(c, x - 14 * s, y + 1 * s, 4.2 * s, '#8a7a6a', col) + rockChunk(c, x + 14 * s, y - 3 * s, 3.8 * s, '#7a6a5a', col) + rockChunk(c, x + 2 * s, y - 15 * s, 5 * s, '#948472', col) + rockChunk(c, x, y - 1 * s, 6 * s, '#a08a70', lt(col, 0.35));
  }
  // carved stone totem (stacked blocks with a glowing face); y = base
  function stoneTotem(c, x, y, s, gc) {
    var o = C(x, y - 18 * s, 24 * s, glow(c, gc, 0.45));
    o += R(x - 7 * s, y - 12 * s, 14 * s, 12 * s, c.cel('#847a6a'), 1.6 * s, 2) + L('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y - 6 * s]), dk('#847a6a', 0.35), 1 * s);
    o += R(x - 6 * s, y - 25 * s, 12 * s, 13 * s, c.cel('#9a8e7c'), 1.6 * s, 2);
    o += R(x - 4.4 * s, y - 21 * s, 3.2 * s, 2.2 * s, gc) + R(x + 1.2 * s, y - 21 * s, 3.2 * s, 2.2 * s, gc) + L('M' + pt([x - 3 * s, y - 15.5 * s]) + 'L' + pt([x + 3 * s, y - 15.5 * s]), OL, 1.2 * s);
    return o + P(pd([[x - 9 * s, y - 25 * s], [x + 9 * s, y - 25 * s], [x + 6 * s, y - 30 * s], [x - 6 * s, y - 30 * s]], true), c.cel('#766c5e'), 1.4 * s);
  }
  function stoneStaff(c, bot, top, gc) {
    var d = 'M' + pt(bot) + 'L' + pt(top);
    return limb(d, '#5a4028', 3.4) + L(d, '#8a6a48', 1, 0.6) + L('M' + pt([top[0] - 3, top[1] + 10]) + 'l6,2 M' + pt([top[0] - 3, top[1] + 14]) + 'l6,2', OCHRE, 1.6) + stoneTotem(c, top[0], top[1] + 4, 0.8, gc);
  }
  // quick ghostly wisp
  function wisp(c, x, y, s, col) {
    var d = 'M' + pt([x, y]) + 'C' + pt([x - 4 * s, y - 4 * s]) + ' ' + pt([x - 2 * s, y - 9 * s]) + ' ' + pt([x + 2 * s, y - 12 * s]) + 'C' + pt([x + 5 * s, y - 8 * s]) + ' ' + pt([x + 3 * s, y - 4 * s]) + ' ' + pt([x, y]) + 'Z';
    return C(x, y - 6 * s, 10 * s, glow(c, col, 0.5)) + F(d, lt(col, 0.45), 0.85) + C(x + 0.5 * s, y - 5 * s, 1.4 * s, '#ffffff', 0, 0.9);
  }
  function thornBurst(c, x, y, s, col) {
    var o = C(x, y, 24 * s, glow(c, col, 0.65));
    for (var i = 0; i < 7; i++) { var a = PI * 2 * i / 7 + 0.3, ca = Math.cos(a), sa = Math.sin(a), l = (i % 2 ? 11 : 15) * s; o += P(pd([[x + ca * 3 * s - sa * 2 * s, y + sa * 3 * s + ca * 2 * s], [x + ca * l, y + sa * l], [x + ca * 3 * s + sa * 2 * s, y + sa * 3 * s - ca * 2 * s]], true), c.cel(lt(col, 0.3)), 1.1); }
    return o + C(x, y, 3.4 * s, '#fff0e0', 1);
  }

  // ============================================================
  //  THORN WARRENS SPINEHIDE RIG: porcupine-folk (facing left)
  // ============================================================
  // one slender banded quill: dark base, grey middle band, bone tip; outline drawn last so the bands keep it
  function quill(bx, by, a, len, w, base, mid, tip) {
    var ca = Math.cos(a), sa = Math.sin(a), px = -sa * w, py = ca * w, tx = bx + ca * len, ty = by + sa * len;
    var d = pd([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true);
    var band = function (f, col) { var p = [bx + ca * len * f, by + sa * len * f], k = 1 - f; return F(pd([[p[0] + px * k, p[1] + py * k], [tx, ty], [p[0] - px * k, p[1] - py * k]], true), col); };
    return P(d, base, 1.1) + band(0.3, mid) + band(0.6, tip);
  }
  // point + outward angle along a polyline, t in 0..1
  function polyAt(pts, t) {
    var segs = pts.length - 1, f = clamp(t, 0, 1) * segs, i = Math.min(segs - 1, Math.floor(f)), u = f - i;
    return lerp2(pts[i], pts[i + 1], u);
  }
  // the dense coat of slender quills over the shoulders and back, three rows (long dark, mid grey, short pale)
  var SPINE = [[52, 33], [66, 36], [80, 43], [90, 56], [93, 72], [90, 88]];
  function quillCoat(c, mane, tip, k, seed) {
    var s = '', r = rng(seed || 23);
    [[15, 1.12, dk(mane, 0.26), mane, 3], [12, 0.94, dk(mane, 0.12), lt(mane, 0.1), 0], [9, 0.7, dk(mane, 0.04), lt(mane, 0.2), -4]].forEach(function (rw, ri) {
      for (var i = 0; i < rw[0]; i++) {
        var t = (i + (ri === 1 ? 0.5 : 0) + (r() - 0.5) * 0.3) / rw[0], p = polyAt(SPINE, t);
        var a = -1.32 + t * 1.85 + (r() - 0.5) * 0.18, len = (14 + Math.sin(t * PI) * 10 + r() * 5) * rw[1] * k;
        var bx = p[0] - Math.cos(a) * (6 + rw[4]), by = p[1] - Math.sin(a) * (6 + rw[4]);
        s += quill(bx, by, a, len + 6 + rw[4], 2.4 * Math.min(1.25, k), rw[2], rw[3], tip);
      }
    });
    return s;
  }
  // small round ear with a torn notch
  function earD(x, y, r) {
    var p = [];
    for (var i = 0; i < 14; i++) { var a = -PI + i * PI * 2 / 14, f = i === 5 ? 0.45 : 1; p.push([x + Math.cos(a) * r * f, y + Math.sin(a) * r * f]); }
    return pd(p, true);
  }
  // small curved lower tusk rising from the jaw (sz ~1 = small, ~1.9 = the heavy ones)
  function jawTusk(c, bx, by, sz, col) {
    return P('M' + pt([bx + 1.8, by]) + 'C' + pt([bx - 0.4, by + 2.4]) + ' ' + pt([bx - 4 * sz, by - 0.6 * sz]) + ' ' + pt([bx - 3.4 * sz, by - 6 * sz]) +
      'C' + pt([bx - 2.2 * sz, by - 3 * sz]) + ' ' + pt([bx - 1, by - 1.6]) + ' ' + pt([bx + 1.4, by - 1.4]) + 'Z', c.cel(col), 1.3);
  }
  function spHead(c, x, y, o) {
    var sk = o.skin || RFSK, mane = o.mane || RFMANE, tip = o.tip || BONE, sz = clamp(o.tusk || 1.3, 1, 2.2), pc = o.paint || BONE, s = '', big = o.big ? 1.18 : 1, r = rng(o.seed || 11);
    // crest of quills fanning back off the crown (behind the skull)
    if (!o.hood && !o.noCrown) for (var i = 0; i < 8; i++) {
      var t = i / 7, th = -2.25 + t * 2.1, bx = x + 3 + Math.cos(th) * 10, by = y - 1 + Math.sin(th) * 12;
      s += quill(bx, by, th + 0.42 + (r() - 0.5) * 0.1, (12 + Math.sin(t * PI) * 7 + r() * 3) * big, 2.2, dk(mane, 0.2), lt(mane, 0.06), tip);
    }
    if (o.headBack) s += o.headBack(c, x, y);
    // skull with a long tapered snout
    var d = 'M' + pt([x + 15, y - 2]) + 'C' + pt([x + 14, y - 14]) + ' ' + pt([x + 2, y - 18]) + ' ' + pt([x - 8, y - 13]) + 'C' + pt([x - 14, y - 10]) + ' ' + pt([x - 21, y - 4]) + ' ' + pt([x - 28, y]) +
      'C' + pt([x - 32, y + 2]) + ' ' + pt([x - 31, y + 7]) + ' ' + pt([x - 26, y + 8]) + 'C' + pt([x - 20, y + 10]) + ' ' + pt([x - 14, y + 15]) + ' ' + pt([x - 4, y + 16]) + 'C' + pt([x + 6, y + 17]) + ' ' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y - 2]) + 'Z';
    var paint = o.nopaint ? '' : F(pd([[x - 20, y - 5], [x - 14, y - 11], [x - 6, y - 13], [x + 1, y - 9], [x + 2, y - 2], [x - 1, y + 3], [x - 4, y + 1], [x - 7, y + 4], [x - 10, y + 1], [x - 13, y + 3], [x - 16, y + 0.5]], true), pc, 0.95) +
      L('M' + pt([x + 5, y + 1]) + 'L' + pt([x + 8, y + 8]) + 'M' + pt([x + 9, y - 1]) + 'L' + pt([x + 12, y + 5]) + 'M' + pt([x - 24, y + 1.5]) + 'L' + pt([x - 20, y + 3]), pc, 1.6);
    s += body(c, d, sk, F('M' + pt([x + 4, y - 20]) + 'L' + pt([x + 18, y - 20]) + 'L' + pt([x + 18, y + 20]) + 'L' + pt([x + 2, y + 20]) + 'C' + pt([x + 8, y + 8]) + ' ' + pt([x + 8, y - 6]) + ' ' + pt([x + 4, y - 20]) + 'Z', dk(sk, 0.28), 0.8) +
      F('M' + pt([x - 32, y + 4]) + 'C' + pt([x - 22, y + 9]) + ' ' + pt([x - 6, y + 11]) + ' ' + pt([x + 16, y + 6]) + 'L' + pt([x + 16, y + 20]) + 'L' + pt([x - 32, y + 20]) + 'Z', dk(sk, 0.2), 0.7) +
      F('M' + pt([x - 33, y + 3]) + 'C' + pt([x - 26, y - 3]) + ' ' + pt([x - 18, y - 6]) + ' ' + pt([x - 12, y - 6]) + 'L' + pt([x - 12, y + 8]) + 'C' + pt([x - 20, y + 8]) + ' ' + pt([x - 28, y + 7]) + ' ' + pt([x - 33, y + 3]) + 'Z', lt(sk, 0.14), 0.8) +
      paint + (o.scars ? L('M' + pt([x - 2, y - 15]) + 'L' + pt([x - 9, y + 2]) + 'M' + pt([x + 2, y - 13]) + 'L' + pt([x - 3, y + 1]), o.scars, 1.3) : ''), 2.5);
    // short quills growing over the back of the skull
    if (!o.hood) [[5, -9, -0.9, 10], [9, -5, -0.55, 10], [11, 0, -0.2, 9], [11, 5, 0.15, 8]].forEach(function (q) { s += quill(x + q[0], y + q[1], q[2], q[3] * big, 2, dk(mane, 0.12), lt(mane, 0.12), tip); });
    // round, torn ear on the crown, just behind the brow
    if (!o.hood) s += P(earD(x - 1, y - 13, 5), c.cel(dk(sk, 0.04)), 2) + C(x - 1.4, y - 12.6, 2.3, '#3e2622', 0, 0.9);
    // button nose, mouth, beady eye under the skull paint (a hooded one wears a mask instead)
    if (!o.hood) s += C(x - 29.5, y + 2.6, 3, '#140e0c', 1.2) + C(x - 30.4, y + 1.6, 0.9, '#9a9090');
    if (!o.hood) s += L('M' + pt([x - 26, y + 7.5]) + 'C' + pt([x - 21, y + 9.5]) + ' ' + pt([x - 16, y + 11]) + ' ' + pt([x - 11, y + 10]), OL, 1.3);
    if (o.hood) s += '';
    else if (o.shutEye) s += L('M' + pt([x - 13, y - 3]) + 'Q' + pt([x - 10, y - 1]) + ' ' + pt([x - 7, y - 3]), OL, 1.6);
    else s += (o.glowEye ? E(x - 10, y - 3, 3.2, 2.8, '#1a0e0a') + glowEye(c, x - 10, y - 3, 1.7, o.glowEye) : C(x - 10, y - 3, 2.7, '#120a08') + C(x - 10.9, y - 3.9, 0.85, '#ffffff', 0, 0.95));
    if (!o.hood) s += L('M' + pt([x - 16, y - 7]) + 'L' + pt([x - 5, y - 8]), OL, 2.2) + jawTusk(c, x - 11, y + 11, sz * 0.8, '#d8ceb4') + jawTusk(c, x - 17, y + 9.5, sz, '#f4ecd6');
    if (o.whiskers) { var wd = 'M' + pt([x - 22, y + 10]) + 'l-3,7 M' + pt([x - 17, y + 12]) + 'l-1,8 M' + pt([x - 12, y + 13]) + 'l1,7'; s += L(wd, OL, 3) + L(wd, o.whiskers, 1.5); }
    if (o.headX) s += o.headX(c, x, y);
    return s;
  }
  function hideKilt(c, col, beads) {
    var d = 'M47,84 L82,84 L84,104 L77,100 L71,108 L65,100 L59,108 L53,100 L45,104 Z';
    var s = body(c, d, col, L('M49,90 L81,90', dk(col, 0.4), 1.2) + F('M70,82 L90,82 L90,110 L72,110 Z', dk(col, 0.25), 0.7), 1.8);
    if (beads !== false) for (var x = 52; x < 80; x += 6) s += C(x, 87, 1.5, BONE, 0.8);
    return G(s, 'translate(0,4)');
  }
  function ribCage(x, y, w, k) {
    var d = '';
    for (var i = 0; i < k; i++) { var yy = y + i * 6; d += 'M' + pt([x + 2, yy + 3]) + 'Q' + pt([x + w * 0.45, yy - 3]) + ' ' + pt([x + w, yy + 1]); }
    var st = 'M' + pt([x + w * 0.45, y - 3]) + 'L' + pt([x + w * 0.45, y + k * 6 - 2]);
    return L(d + st, OL, 4.8) + L(d, BONE, 2.6) + L(st, BONED, 3);
  }
  function bonePad(c, x, y, s, col) {
    col = col || BONE;
    var o = body(c, 'M' + pt([x - 14 * s, y + 6 * s]) + 'C' + pt([x - 14 * s, y - 8 * s]) + ' ' + pt([x + 8 * s, y - 10 * s]) + ' ' + pt([x + 10 * s, y + 4 * s]) + 'Z', col,
      L('M' + pt([x - 10 * s, y + 2 * s]) + 'Q' + pt([x - 2 * s, y - 4 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]), dk(col, 0.25), 1.2) + F(pd([[x + 1 * s, y - 12 * s], [x + 12 * s, y - 12 * s], [x + 12 * s, y + 8 * s], [x + 3 * s, y + 8 * s]], true), dk(col, 0.22), 0.8), 1.8);
    [[-8, -5, -1.9], [-1, -7, -1.5], [6, -4, -1.1]].forEach(function (t) { var bx = x + t[0] * s, by = y + t[1] * s, a = t[2], len = 9 * s; o += P(pd([[bx - 2.4 * s, by + 1], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 2.4 * s, by]], true), c.cel('#f4ecd6'), 1.2); });
    return o;
  }
  function tuskNecklace(c, x, y, w, col) {
    var s = L('M' + pt([x - w, y - 3]) + 'Q' + pt([x, y + 9]) + ' ' + pt([x + w, y - 4]), '#3a2a1a', 1.4);
    for (var i = -3; i <= 3; i++) { var bx = x + i * w / 3.6, by = y + 3 - Math.abs(i) * 1.6; s += P('M' + pt([bx - 1.8, by]) + 'Q' + pt([bx - 1, by + 6]) + ' ' + pt([bx + 2, by + 8 - Math.abs(i) * 0.5]) + 'Q' + pt([bx + 1, by + 4]) + ' ' + pt([bx + 1.8, by]) + 'Z', col || '#f4ecd6', 1); }
    return s;
  }
  // small clawed paw-foot, bone claws to the front
  function spFoot(x, y, col) {
    var cd = 'M' + pt([x - 8, y + 0.4]) + 'l-2.8,1 M' + pt([x - 4.6, y + 1.2]) + 'l-2.6,1 M' + pt([x - 1.2, y + 1.4]) + 'l-2.2,0.9';
    return P('M' + pt([x + 6, y - 8]) + 'C' + pt([x + 7.5, y - 1]) + ' ' + pt([x + 6, y + 1.6]) + ' ' + pt([x + 2, y + 1.6]) + 'L' + pt([x - 7, y + 1.6]) + 'C' + pt([x - 10, y + 1.6]) + ' ' + pt([x - 10, y - 4]) + ' ' + pt([x - 5, y - 6]) + 'L' + pt([x - 4, y - 8]) + 'Z', c_(col), 2) +
      L(cd, OL, 3) + L(cd, '#efe6cf', 1.3);
  }
  function robeSkirt(c, col, trim, hem) {
    var d = 'M44,82 L84,82 C88,94 92,106 95,118' + rag(95, 33, 118, 4, hem || 7).replace(/^L/, ' L') + ' C36,106 40,94 44,82 Z';
    return spFoot(52, 121, '#3e2a20') + spFoot(75, 121, '#34241c') + body(c, d, col, L('M56,86 L52,116 M68,86 L70,116 M78,88 L86,116', dk(col, 0.35), 1.3) + F('M70,80 L100,80 L100,122 L78,122 C80,108 76,92 70,80 Z', dk(col, 0.3), 0.7) + (trim ? L('M36,112 L94,112', trim, 2.2) : ''), 2);
  }
  // quill mantle over the back of the torso (drawn inside the torso clip)
  function mantle(mane, tip) {
    var s = F('M60,36 C72,50 76,70 70,98 L104,98 L104,36 Z', dk(mane, 0.14), 0.95), d = '', e = '';
    [[66, 46], [74, 44], [70, 56], [80, 52], [76, 64], [86, 60], [74, 76], [84, 72], [80, 86], [88, 82]].forEach(function (p) { d += 'M' + pt(p) + 'l7,-3'; e += 'M' + pt([p[0] + 5, p[1] - 2.1]) + 'l2,-0.9'; });
    return s + L('M60,36 C72,50 76,70 70,98', OL, 1.6) + L(d, dk(mane, 0.45), 1.6) + L(e, tip, 1.5, 0.9);
  }
  function spinefolk(c, o) {
    var sk = o.skin || RFSK, mane = o.mane || RFMANE, tip = o.tip || BONE, k = o.k || 1, shirt = o.shirt || sk;
    var ph = function (c, p) { return clawHand(p, sk, 0.82, '#efe6cf'); };
    return biped(c, {
      skin: sk, shirt: shirt, pants: dk(sk, 0.06), sleeve: o.sleeve || sk, forearm: o.forearm || o.sleeve || sk, glove: o.glove || sk, feet: spFoot, boots: dk(sk, 0.3), legW: o.legW || 13, armW: o.armW || 11, belt: o.belt, buckle: BONE,
      hx: o.hx || 46, hy: o.hy || 42, hipY: 90, shadowR: o.shadowR || 36, neck: false, noLegs: o.noLegs,
      torsoD: o.torsoD || 'M42,56 C46,44 68,40 84,46 C94,54 94,76 88,92 L50,92 C38,88 32,72 42,56 Z',
      back: function (c) { return (o.back ? o.back(c) : '') + quillCoat(c, mane, tip, k, o.seed); },
      head: function (c, x, y) { return spHead(c, x, y, o); },
      chest: function (c) {
        return (shirt === sk ? F('M38,64 C42,56 54,58 58,70 C60,82 54,92 44,92 C36,88 34,74 38,64 Z', lt(sk, 0.16), 0.85) + L('M42,70 l3,2 M46,78 l3,2 M41,84 l3,2', dk(sk, 0.2), 1, 0.8) + mantle(mane, tip) : '') +
          (o.nopaint || shirt !== sk ? '' : L('M48,62 L55,68 L48,74 M58,56 L65,62 L58,68', o.paint || BONE, 2.2, 0.95)) + (o.chest ? o.chest(c) : '');
      },
      front: o.front || function (c) { return hideKilt(c, o.kilt || HIDE); },
      pads: o.pads, shins: o.shins,
      near: o.near || [[48, 58], [40, 74], [32, 84]], far: o.far || [[80, 56], [88, 72], [88, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, top: o.top, tf: o.tf, nearHand: o.nearHand || ph, farHand: o.farHand || ph
    });
  }
  function bracer(p, q, col, w) { var a = lerp2(p, q, 0.25), b = lerp2(p, q, 0.72), d = 'M' + pt(a) + 'L' + pt(b); return L(d, OL, (w || 9) + 4) + L(d, col, w || 9) + L(d, dk(col, 0.3), 1.2, 0.8); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    razorfen_gate: function (c) {
      var o = sky(c, '#dc9e64', '#eec48a', '#f6e0ae') + sun(c, 338, 70, 13, '#fff0c4');
      o += cloud(64, 34, 0.8, 0.5, '#fff0dc') + cloud(206, 20, 0.55, 0.45, '#fff0dc') + cloud(372, 30, 0.6, 0.4, '#fff0dc');
      o += mesas(71, 120, '#d6a47a') + mesas(79, 126, '#c4946a');
      o += ground(c, 124, '#d8b46c', '#a47c3e');
      o += acacia(c, 28, 130, 0.5) + acacia(c, 380, 128, 0.42);
      // low brambles on the horizon
      o += vine(c, [[-10, 132], [26, 116], [62, 120], [92, 132]], 5, 3, '#8a7866', 3, 0.9) + vine(c, [[312, 134], [344, 114], [378, 118], [410, 130]], 5, 3, '#8a7866', 5, 0.9);
      // the earthen mound the warren is dug into
      var md = 'M34,150 C52,104 116,66 190,62 C266,64 332,100 356,150 Z';
      o += body(c, md, '#8e6848', F('M200,58 C270,66 336,104 360,152 L260,152 C262,112 240,80 200,58 Z', '#6a4a32', 0.8) + pebbles(9, 80, 148, '#5a4030', 18, 60, 340), 2.2);
      // tunnel mouth
      var mouth = 'M146,150 L146,118 C146,90 162,76 184,76 C206,76 222,90 222,118 L222,150 Z';
      o += P(mouth, c.lg([[0, '#0c0806'], [0.7, '#1e140e'], [1, '#3a2818']]), 2.4) + F('M160,150 L166,112 C170,98 198,98 202,112 L208,150 Z', '#050302', 0.8);
      o += roots(12, 152, 216, 80, 14, '#4a3a2c', 7);
      // giant vines: the great tangle climbing over the mound, then the arch over the mouth, then vines weaving across
      o += vine(c, [[-6, 162], [2, 112], [26, 70], [66, 42], [96, 34]], 18, 2.5, dk(VINE, 0.04), 21);
      o += vine(c, [[408, 164], [404, 112], [380, 72], [344, 52], [316, 48]], 18, 2.5, dk(VINE, 0.06), 23);
      o += vine(c, [[58, 156], [66, 96], [108, 44], [160, 20], [224, 14], [262, 22]], 26, 3, lt(VINE, 0.04), 13);
      o += vine(c, [[350, 158], [344, 100], [304, 46], [252, 20], [190, 12], [150, 18]], 26, 3, VINE, 17);
      o += vine(c, [[30, 160], [56, 124], [104, 104], [132, 76], [138, 46], [118, 22]], 12, 2.5, dk(VINE, 0.08), 51);
      o += vine(c, [[372, 160], [348, 124], [298, 102], [262, 74], [256, 44], [276, 18]], 12, 2.5, dk(VINE, 0.08), 53);
      o += vine(c, [[126, 156], [118, 104], [140, 60], [184, 50], [230, 60], [250, 104], [244, 156]], 20, 16, lt(VINE, 0.06), 11);
      o += vine(c, [[96, 158], [110, 128], [140, 116], [150, 90], [146, 70]], 11, 2.5, VINE, 31) + vine(c, [[276, 158], [262, 128], [232, 112], [224, 88], [230, 68]], 11, 2.5, VINE, 33);
      o += vine(c, [[62, 78], [110, 62], [168, 40], [220, 36], [286, 50], [330, 70]], 9, 2.5, dk(VINE, 0.12), 35);
      o += vine(c, [[196, 64], [214, 40], [246, 30], [282, 34]], 7, 2, lt(VINE, 0.02), 37) + vine(c, [[172, 64], [152, 44], [120, 38], [92, 46]], 7, 2, lt(VINE, 0.02), 39);
      // bone totems flanking the gate
      o += rfTotem(c, 108, 160, 68, 1) + rfTotem(c, 298, 150, 66, 0.9);
      o += maskStake(c, 142, 156, 30, 0.8) + maskStake(c, 232, 154, 30, 0.8);
      // path worn into the grass
      o += F('M150,150 L218,150 L330,242 L70,242 Z', '#e4c890', 0.55) + F('M166,150 L204,150 L250,242 L130,242 Z', '#ecd4a0', 0.4);
      // ground thorns creeping out
      o += vine(c, [[-8, 214], [30, 200], [66, 208], [96, 226]], 7, 3, '#7a6a58', 41) + vine(c, [[406, 196], [376, 186], [346, 194], [330, 210]], 7, 3, '#7a6a58', 43);
      o += grass(51, 140, 240, '#b89848', 90, 0.8, 1.8, 1.2) + grass(53, 150, 240, '#8a6e34', 40, 0.9, 1.9, 1.1);
      o += tufts(c, [[20, 176, 0.8], [118, 196, 0.9], [190, 232, 1], [248, 176, 0.7], [364, 232, 1.1], [60, 236, 1.1]], '#b89a50');
      o += litter(c, 61, 170, 232, 7, 40, 360);
      return o + vignette(c, '#fff0d0', '#3a2410');
    },
    razorfen_kraul: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#140e0a'], [0.5, '#24180f'], [1, '#2e2014']]));
      var vx = 226, vy = 96;
      // the far bend: warm light spilling round the corner
      o += C(vx, vy, 70, glow(c, '#ffa850', 0.55)) + P('M' + pt([vx - 26, 120]) + 'C' + pt([vx - 26, 84]) + ' ' + pt([vx + 26, 84]) + ' ' + pt([vx + 26, 120]) + 'Z', c.lg([[0, '#6a4a2a'], [1, '#a8784a']]), 1.6);
      o += dirtFloor(c, 116, '#4a3624', '#7e6044', 21);
      // lit path running down the tunnel
      o += F('M' + pt([vx - 22, 118]) + 'L' + pt([vx + 22, 118]) + 'C' + pt([vx + 30, 150]) + ' 330,180 364,242 L16,242 C60,180 ' + pt([vx - 60, 150]) + ' ' + pt([vx - 22, 118]) + 'Z', '#9a7a52', 0.35) + F('M' + pt([vx - 10, 118]) + 'L' + pt([vx + 10, 118]) + 'C' + pt([vx + 10, 150]) + ' 250,190 262,242 L110,242 C130,190 ' + pt([vx - 30, 150]) + ' ' + pt([vx - 10, 118]) + 'Z', '#b08c5e', 0.25);
      // receding thorn arches, dim far, bright near
      [[0.08, 3], [0.26, 5], [0.46, 7], [0.7, 9]].forEach(function (a) {
        var t = a[0], hw = 44 + t * 290, top = 72 - t * 118, base = 118 + t * 96, w = 5 + t * 30, col = mix(VINE, '#1a120c', 0.62 * (1 - t));
        o += thornArch(c, vx - 10 - t * 60, base, hw, top, w, col, 100 + a[1] * 7);
      });
      // wall tangles between the arches
      o += vine(c, [[-4, 150], [30, 128], [70, 126], [110, 116]], 9, 5, '#4a3e34', 71) + vine(c, [[404, 146], [370, 126], [326, 124], [282, 114]], 9, 5, '#4a3e34', 73);
      o += roots(77, 130, 300, 40, 24, '#3e3024', 12);
      // torches on the walls
      o += torch(c, 170, 104, 0.6) + torch(c, 282, 102, 0.6) + torch(c, 52, 118, 1.05) + torch(c, 336, 114, 1);
      o += C(52, 104, 70, glow(c, '#ff9a40', 0.3)) + C(336, 100, 70, glow(c, '#ff9a40', 0.3));
      // bone totems and litter
      o += rfTotem(c, 104, 140, 50, 0.7) + rfTotem(c, 312, 136, 46, 0.65) + maskStake(c, 188, 124, 22, 0.55) + maskStake(c, 262, 122, 20, 0.5);
      o += litter(c, 81, 150, 234, 9, 20, 380);
      // near arch frame in front of everything
      o += vine(c, [[-20, 250], [-6, 150], [10, 60], [60, -10]], 34, 22, lt(VINE, 0.04), 91) + vine(c, [[420, 250], [404, 150], [390, 60], [340, -10]], 34, 22, VINE, 93);
      o += vine(c, [[40, -20], [120, 14], [220, 10], [360, -20]], 20, 20, dk(VINE, 0.1), 95);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.62, '#000', 0.1], [1, '#000', 0.6]]));
    },
    razorfen_depths: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#120c09'], [0.6, '#22170f'], [1, '#2a1c12']]));
      // back wall: a woven mass of dim thorn vines
      for (var i = 0; i < 7; i++) {
        var y = 8 + i * 16, sg = i % 2 ? 1 : -1, col = mix(VINE, '#1a120c', 0.46 - i * 0.03);
        o += vine(c, [[-20, y + 10 * sg], [90, y - 8 * sg], [200, y + 10 * sg], [310, y - 8 * sg], [420, y + 6 * sg]], 9 + i * 0.6, 9, col, 200 + i * 5, 0.7);
      }
      o += C(170, 80, 150, glow(c, '#ff8a30', 0.35));
      // the great Briarmother mask above the platform, held in her own thorn roots
      o += vine(c, [[170, 30], [140, 20], [112, 6], [96, -8]], 9, 3, mix(VINE, '#1a120c', 0.3), 205, 0.7) + vine(c, [[170, 30], [200, 20], [228, 6], [244, -8]], 9, 3, mix(VINE, '#1a120c', 0.3), 206, 0.7) +
        C(170, 40, 44, glow(c, '#b060ff', 0.45)) + briarMask(c, 170, 42, 1.8, '#6e4c30', '#c070ff');
      o += vine(c, [[120, 64], [150, 58], [190, 58], [220, 66]], 6, 4, mix(VINE, '#1a120c', 0.25), 207);
      o += dirtFloor(c, 120, '#4a3624', '#7a5c40', 31);
      // pillar vines at the sides
      o += vine(c, [[20, 170], [8, 110], [30, 50], [10, -10]], 22, 16, mix(VINE, '#1a120c', 0.2), 211) + vine(c, [[380, 170], [396, 110], [372, 50], [392, -10]], 22, 16, mix(VINE, '#1a120c', 0.24), 213);
      o += vine(c, [[64, 120], [52, 80], [70, 40], [56, -6]], 12, 9, mix(VINE, '#1a120c', 0.35), 215) + vine(c, [[336, 120], [350, 80], [330, 40], [344, -6]], 12, 9, mix(VINE, '#1a120c', 0.38), 217);
      o += roots(221, 90, 260, 0, 30, '#3a2c20', 12);
      o += torch(c, 34, 108, 1) + torch(c, 366, 106, 1) + C(34, 94, 60, glow(c, '#ff9a40', 0.3)) + C(366, 92, 60, glow(c, '#ff9a40', 0.3));
      // raised earthen platform
      var top = 'M36,106 C44,94 120,88 168,88 C216,88 290,94 298,106 C270,116 70,116 36,106 Z';
      o += E(168, 138, 140, 10, '#000', 0, 0.3);
      o += body(c, 'M36,106 C70,116 270,116 298,106 L304,134 C250,142 90,142 30,134 Z', '#6e5038', L('M40,118 C100,126 240,126 300,118 M36,127 C100,134 240,134 302,127', dk('#6e5038', 0.35), 1.2) + F('M230,100 L310,100 L310,146 L240,146 Z', dk('#6e5038', 0.3), 0.8) + pebbles(33, 112, 138, '#4a3424', 14, 40, 296), 2.4);
      o += P(top, c.cel('#9a7a56'), 2.2) + L('M60,104 C110,108 230,108 280,104', lt('#9a7a56', 0.2), 1.4, 0.7);
      // earthen steps down the front
      o += P('M140,138 L200,138 L204,146 L136,146 Z', c.cel('#7a5a40'), 1.6) + P('M132,146 L208,146 L212,154 L128,154 Z', c.cel('#846448'), 1.6);
      // bones pressed into the face
      o += bone(62, 124, 12, 0.3, 0.8) + bone(262, 126, 12, -0.4, 0.8) + skull(c, 104, 128, 0.5) + skull(c, 236, 130, 0.5);
      // Briarmother masks on stakes ringing the platform
      o += maskStake(c, 50, 108, 34, 0.9, '#c070ff') + maskStake(c, 286, 108, 34, 0.9, '#c070ff') + maskStake(c, 96, 98, 26, 0.7) + maskStake(c, 244, 98, 26, 0.7);
      // the ritual fire
      var fx = 168, fy = 102;
      o += C(fx, fy - 24, 96, glow(c, '#ff9a3a', 0.5)) + C(fx, fy - 30, 46, glow(c, '#b060ff', 0.35));
      for (var k = 0; k < 9; k++) { var a = PI + PI * k / 8; o += rock(c, fx - 24 * Math.cos(a), fy + 2 + 3 * Math.sin(a), 9, 6, '#7a6a5a'); }
      o += limb('M' + pt([fx - 16, fy]) + 'L' + pt([fx + 14, fy - 7]), '#5a3a22', 3.6) + limb('M' + pt([fx + 16, fy]) + 'L' + pt([fx - 12, fy - 8]), '#6a4428', 3.6);
      o += flame(c, fx - 10, fy - 1, 1.1, '#ff6a1a', '#ffd84a') + flame(c, fx + 10, fy - 1, 1.05, '#ff6a1a', '#ffd84a') + flame(c, fx, fy + 1, 2.1, '#ff7a2a', '#fff0a0');
      for (k = 0; k < 9; k++) { var b = PI * k / 8; o += rock(c, fx - 24 * Math.cos(b), fy + 3 + 3 * Math.sin(b), 9, 6, '#847464'); }
      [[fx - 30, fy - 60, '#ffc060'], [fx + 22, fy - 72, '#d890ff'], [fx - 8, fy - 86, '#ffd080'], [fx + 36, fy - 50, '#ffb050'], [fx - 44, fy - 40, '#d890ff']].forEach(function (e) { o += C(e[0], e[1], 1.6, e[2]) + C(e[0], e[1], 5, glow(c, e[2], 0.6)); });
      // floor lighting and litter
      o += E(fx, 170, 160, 40, glow(c, '#ff9a3a', 0.25)) + litter(c, 41, 156, 234, 8, 20, 380);
      // foreground frame vines
      o += vine(c, [[-24, 250], [-2, 190], [8, 150], [-20, 110]], 30, 20, VINE, 231) + vine(c, [[424, 250], [402, 190], [394, 150], [420, 110]], 30, 20, VINE, 233);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.62, '#000', 0.08], [1, '#000', 0.58]]));
    }
  };

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    razorfen_quilguard: function (c) {
      return spinefolk(c, {
        eye: '#ffb838', belt: '#3a2a1e', kilt: '#7a5634',
        chest: function () { return ribCage(46, 54, 36, 5); },
        pads: function (c) { return bonePad(c, 80, 50, 1); },
        near: [[48, 58], [40, 72], [34, 82]], far: [[80, 56], [90, 70], [92, 84]],
        wNear: function (c, p) {
          var top = [p[0] - 15, p[1] - 66], bot = [p[0] + 12, p[1] + 34];
          return spear(c, top, bot, 18, '#e4dac0', '#5a4028') + L('M' + pt(lerp2(top, bot, 0.08)) + 'L' + pt(lerp2(top, bot, 0.16)), OCHRE, 4.4) +
            feathers(top[0] + 3, top[1] + 12, ['#ece4cc', '#5a4a3a', '#ece4cc'], 0.6, 0.3);
        },
        top: function (c) {
          return bonePad(c, 46, 60, 0.7) + bracer([40, 72], [34, 82], BONED, 8.4) + bracer([90, 70], [92, 84], BONED, 8);
        }
      });
    },
    razorfen_geomancer: function (c) {
      return spinefolk(c, {
        skin: '#6e4c3a', mane: '#7a6a58', glowEye: GEO, belt: '#4a3222',
        back: function (c) { return C(34, 36, 40, glow(c, GEO, 0.3)) + stoneTotem(c, 108, 122, 1.05, GEO); },
        front: function (c) {
          var d = 'M46,82 L84,82 C86,92 88,102 90,112' + rag(90, 38, 112, 5, 9).replace(/^L/, ' L') + ' C40,102 42,92 46,82 Z';
          var s = body(c, d, '#8a6440', L('M52,90 L48,110 M66,90 L66,110 M78,90 L84,110', '#5a3e26', 1.2) + F('M72,80 L96,80 L96,114 L76,114 Z', '#5a3e26', 0.6) + L('M42,104 L88,104', BONE, 1.8, 0.9), 1.8);
          for (var x = 48; x < 86; x += 7) s += R(x - 2, 84, 4, 4, '#9a8e7c', 0.9);
          return s;
        },
        pads: function (c) {
          var s = body(c, 'M36,62 C34,48 60,42 88,50 L90,62 C76,58 56,58 36,62 Z', '#5a4030', L('M40,60 C54,56 74,56 88,60', OCHRE, 1.6), 1.8);
          [[44, 62], [54, 60], [64, 59], [74, 60], [84, 62]].forEach(function (p, i) { s += rockChunk(c, p[0], p[1] + 3, 2.6, i % 2 ? '#948472' : '#7a6a5a'); });
          return s;
        },
        headX: function (c, x, y) {
          return L('M' + pt([x - 14, y - 10]) + 'C' + pt([x - 6, y - 15]) + ' ' + pt([x + 4, y - 15]) + ' ' + pt([x + 12, y - 10]), OL, 4.6) + L('M' + pt([x - 14, y - 10]) + 'C' + pt([x - 6, y - 15]) + ' ' + pt([x + 4, y - 15]) + ' ' + pt([x + 12, y - 10]), '#5a4028', 2.4) +
            rockChunk(c, x - 5, y - 14, 3.6, '#9a8e7c', GEO) + C(x - 5, y - 14, 1.4, GEO);
        },
        near: [[48, 58], [36, 72], [24, 76]], wNearFront: function (c, p) { return floatingStones(c, p[0] - 1, p[1] - 13, 0.9, GEO); },
        far: [[80, 56], [90, 70], [94, 82]], wFar: function (c, p) { return stoneStaff(c, [p[0] + 2, p[1] + 38], [p[0] - 1, p[1] - 52], GEO); }
      });
    },
    kraul_bat: function (c) {
      var fur = '#5e4636', mem = '#8a6250', fing = '#b08a70', s = '';
      s += E(64, 122, 32, 5, c.rg([[0, '#000', 0.4], [1, '#000', 0]]));
      s += C(64, 60, 62, glow(c, '#e0a060', 0.14));
      // far wing (behind, right), spread and drooping
      var fw = 'M72,52 L98,34 L124,40 Q114,54 124,70 Q110,66 108,80 Q100,70 92,80 Q88,70 76,72 Z';
      s += body(c, fw, dk(mem, 0.18), F('M98,34 L124,40 L124,70 L108,80 L100,56 Z', dk(mem, 0.38), 0.5) + F('M112,50 L116,54 L111,57 Z', '#1a1210'), 2.2);
      s += L('M98,34 L124,70 M98,34 L108,80 M98,34 L92,80', dk(fing, 0.2), 1.6) + limb('M72,52 L98,34 L124,40', dk(fur, 0.12), 3.2) + P('M98,34 L101,25 L103,35 Z', '#e8e0c8', 1.1);
      // feet dangling
      s += limb('M58,82 L56,94', dk(fur, 0.15), 3.4) + limb('M70,82 L73,94', dk(fur, 0.15), 3.4) + L('M56,94 l-3,4 M56,94 l0,5 M56,94 l3,4 M73,94 l-3,4 M73,94 l0,5 M73,94 l3,4', OL, 2.6) + L('M56,94 l-3,4 M56,94 l0,5 M56,94 l3,4 M73,94 l-3,4 M73,94 l0,5 M73,94 l3,4', '#e8e0c8', 1.1);
      // body with a shaggy ruff
      var bd = 'M48,56 C48,40 76,38 82,52 C86,66 80,84 66,88 C54,88 46,76 48,56 Z';
      s += body(c, bd, fur, F('M70,36 L92,36 L92,92 L70,92 C78,74 78,52 70,36 Z', dk(fur, 0.3), 0.8) + L('M56,62 l3,3 M62,70 l3,3 M56,76 l3,2 M66,58 l3,3', lt(fur, 0.2), 1.2, 0.8));
      s += P(shag(62, 52, 16, 9, 8, 0.3, 9, 0.2), c.cel(lt(fur, 0.12)), 1.8);
      // near wing (front, left)
      var nw = 'M56,54 L30,36 L2,42 Q12,58 2,74 Q16,72 18,86 Q30,76 36,90 Q44,78 56,76 Z';
      s += body(c, nw, mem, F('M30,36 L2,42 L2,74 L18,86 L28,56 Z', lt(mem, 0.08), 0.5) + F('M28,56 L56,76 L36,90 Z', dk(mem, 0.25), 0.6) + F('M12,50 L18,54 L13,58 Z', '#1a1210') + F('M24,70 L30,72 L26,76 Z', '#1a1210'), 2.4);
      s += L('M30,36 L2,74 M30,36 L18,86 M30,36 L36,90', fing, 1.8) + limb('M56,54 L30,36 L2,42', fur, 3.6) + P('M30,36 L24,27 L27,38 Z', '#e8e0c8', 1.1);
      // head facing left: huge ears, leaf nose, fanged open mouth
      var hx = 46, hy = 46;
      s += P(pd([[hx + 2, hy - 8], [hx + 16, hy - 32], [hx + 14, hy - 4]], true), c.cel(fur), 2) + F(pd([[hx + 5, hy - 9], [hx + 14, hy - 26], [hx + 12, hy - 7]], true), '#b07a6a', 0.9);
      s += body(c, 'M' + pt([hx - 9, hy - 3]) + 'C' + pt([hx - 7, hy - 13]) + ' ' + pt([hx + 11, hy - 13]) + ' ' + pt([hx + 13, hy - 2]) + 'C' + pt([hx + 13, hy + 7]) + ' ' + pt([hx + 4, hy + 12]) + ' ' + pt([hx - 4, hy + 10]) + 'L' + pt([hx - 13, hy + 5]) + 'L' + pt([hx - 11, hy]) + 'Z', fur, F('M' + pt([hx + 4, hy - 14]) + 'L' + pt([hx + 15, hy - 14]) + 'L' + pt([hx + 15, hy + 13]) + 'L' + pt([hx + 2, hy + 13]) + 'Z', dk(fur, 0.28), 0.8));
      s += P(pd([[hx - 5, hy - 8], [hx - 8, hy - 30], [hx + 5, hy - 9]], true), c.cel(fur), 1.8) + F(pd([[hx - 3, hy - 9], [hx - 6, hy - 24], [hx + 2, hy - 9]], true), '#b07a6a', 0.9);
      s += P(pd([[hx - 12, hy - 2], [hx - 15, hy - 8], [hx - 9, hy - 5]], true), c.cel('#7a5048'), 1.2) + E(hx - 12, hy + 1, 3, 2.4, c.cel('#5a3a34'), 1.4);
      s += P('M' + pt([hx - 12, hy + 4]) + 'L' + pt([hx - 2, hy + 6]) + 'L' + pt([hx - 5, hy + 12]) + 'Z', '#6a1a1a', 1.4);
      s += P(pd([[hx - 11, hy + 4], [hx - 10, hy + 10], [hx - 8.5, hy + 4.6]], true), '#f4ecd6', 0.9) + P(pd([[hx - 6, hy + 5.2], [hx - 5.2, hy + 10.5], [hx - 3.6, hy + 5.6]], true), '#f4ecd6', 0.9);
      s += glowEye(c, hx - 4, hy - 3, 1.8, '#ffc030') + L('M' + pt([hx - 9, hy - 7]) + 'L' + pt([hx + 1, hy - 5]), OL, 1.8);
      return G(s, at(1.02, 64, 70));
    },
    death_head_cultist: function (c) {
      var rb = '#3a2842', sk = '#5e4638';
      return spinefolk(c, {
        skin: sk, mane: '#4a3e3a', tip: '#c8b8d8', nopaint: true, hood: true, shirt: rb, sleeve: rb, noLegs: true, eye: '#c080ff',
        back: function (c) { return C(46, 50, 48, glow(c, NECRO, 0.3)); },
        front: function (c) { return robeSkirt(c, rb, '#8a6aa0', 5) + L('M46,84 L84,84', '#b8a88a', 2.4) + skull(c, 58, 90, 0.5); },
        pads: function (c) { return body(c, 'M36,60 C36,48 60,42 88,50 L90,60 C76,56 56,58 36,60 Z', dk(rb, 0.15), L('M40,58 C54,54 74,54 88,58', '#8a6aa0', 1.4), 1.8); },
        headX: function (c, x, y) {
          var hood = 'M' + pt([x - 14, y - 10]) + 'C' + pt([x - 10, y - 24]) + ' ' + pt([x + 12, y - 26]) + ' ' + pt([x + 20, y - 10]) + 'C' + pt([x + 24, y + 2]) + ' ' + pt([x + 22, y + 14]) + ' ' + pt([x + 18, y + 22]) + 'L' + pt([x + 6, y + 18]) + 'C' + pt([x + 8, y + 6]) + ' ' + pt([x + 4, y - 6]) + ' ' + pt([x - 4, y - 10]) + 'Z';
          var mask = 'M' + pt([x - 2, y - 12]) + 'C' + pt([x - 12, y - 14]) + ' ' + pt([x - 21, y - 7]) + ' ' + pt([x - 30, y - 1]) + 'C' + pt([x - 35, y + 1]) + ' ' + pt([x - 35, y + 7]) + ' ' + pt([x - 29, y + 9]) + 'L' + pt([x - 12, y + 13]) + 'C' + pt([x - 4, y + 12]) + ' ' + pt([x + 2, y + 4]) + ' ' + pt([x + 1, y - 5]) + 'Z';
          var hq = '';
          [[14, -12, -1.0, 16], [19, -6, -0.6, 17], [22, 1, -0.2, 15], [22, 8, 0.2, 13]].forEach(function (q) { hq += quill(x + q[0], y + q[1], q[2], q[3], 2.2, '#3a302e', '#6a5e58', '#c8b8d8'); });
          return hq + body(c, hood, rb, F(pd([[x + 8, y - 26], [x + 26, y - 26], [x + 26, y + 24], [x + 12, y + 24]], true), dk(rb, 0.35), 0.8) + L('M' + pt([x - 12, y - 12]) + 'C' + pt([x - 6, y - 20]) + ' ' + pt([x + 8, y - 22]) + ' ' + pt([x + 16, y - 12]), lt(rb, 0.2), 1.4, 0.8), 2.2) +
            body(c, mask, '#e4dcc4', F('M' + pt([x - 36, y + 4]) + 'L' + pt([x + 2, y + 2]) + 'L' + pt([x + 2, y + 14]) + 'L' + pt([x - 36, y + 14]) + 'Z', '#b8ae96', 0.8) + L('M' + pt([x - 6, y - 10]) + 'L' + pt([x - 3, y - 4]) + 'L' + pt([x - 6, y + 1]), '#9a907a', 1) +
              L('M' + pt([x - 27, y + 8.4]) + 'l2,-2 l2,2.4 l2,-2 l2,2.6 l2,-2 l2,2.6 l2,-2', '#6a6250', 1.1), 2) +
            E(x - 10, y - 3, 3.6, 3.4, OL) + glowEye(c, x - 10, y - 3, 1.7, '#d890ff') + E(x - 31, y + 3, 1.8, 1.6, OL) + L('M' + pt([x - 22, y - 6]) + 'L' + pt([x - 17, y - 3]), '#9a907a', 1) +
            jawTusk(c, x - 16, y + 11, 1.2, '#f4ecd6');
        },
        near: [[48, 58], [38, 72], [26, 78]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 6, p[1] - 8], 1.05, NECRO); },
        far: [[80, 56], [88, 70], [86, 84]], wFar: function (c, p) { return C(p[0], p[1] + 2, 14, glow(c, NECRO, 0.5)) + skull(c, p[0] + 1, p[1] + 4, 0.8); }
      });
    },
    aggem_thorncurse: function (c) {
      var red = '#ff5a3a';
      return spinefolk(c, {
        skin: '#664638', mane: '#6e5a48', glowEye: red, belt: '#3a2618', kilt: '#6a4a2c', big: true,
        back: function (c) {
          return C(40, 40, 44, glow(c, red, 0.28)) + body(c, 'M58,44 C84,40 100,56 102,80 L106,112 L90,106 L84,114 L76,104 L66,110 C64,90 60,66 58,44 Z', '#4e3a2c', L('M80,60 L84,104 M92,70 L96,104', '#2e2218', 1.2) + F('M88,44 L110,44 L110,116 L92,116 Z', '#2e2218', 0.6), 2) +
            P(shag(76, 50, 18, 10, 8, 0.3, 17, 0.3), c.cel('#a8987c'), 1.8);
        },
        chest: function (c) { return tuskNecklace(c, 60, 58, 16); },
        front: function (c) { return hideKilt(c, '#6a4a2c') + L('M50,104 l-1,10 M58,108 l0,10 M66,106 l0,10 M74,108 l1,10', OL, 3) + L('M50,104 l-1,10 M58,108 l0,10 M66,106 l0,10 M74,108 l1,10', BONE, 1.6); },
        pads: function (c) { return bonePad(c, 80, 50, 1.05); },
        headX: function (c, x, y) {
          var s = vine(c, [[x - 16, y - 7], [x - 6, y - 15], [x + 6, y - 15], [x + 16, y - 7]], 5.4, 5.4, '#5a4a30', 301, 0.6);
          [[-12, -12, -2.2, 12], [-5, -16, -1.85, 15], [2, -17, -1.55, 16], [9, -15, -1.25, 15], [15, -10, -0.9, 12]].forEach(function (t) { var bx = x + t[0], by = y + t[1], a = t[2], len = t[3]; s += P(pd([[bx - 2.4, by + 1.5], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 2.4, by + 1]], true), c.cel(THORN), 1.3); });
          return s + C(x - 1, y - 15, 2.4, red, 1.2) + C(x - 1, y - 15, 6, glow(c, red, 0.6));
        },
        near: [[48, 58], [38, 72], [26, 78]], wNearFront: function (c, p) { return thornBurst(c, p[0] - 6, p[1] - 6, 0.85, red); },
        far: [[80, 54], [90, 68], [96, 80]],
        wFar: function (c, p) {
          var top = [p[0] - 2, p[1] - 54], bot = [p[0] + 2, p[1] + 42], d = 'M' + pt(bot) + 'L' + pt(top);
          return limb(d, '#5a3e26', 4.4) + L(d, '#8a6440', 1.2, 0.6) + vine(c, [lerp2(bot, top, 0.3), [top[0] - 5, top[1] + 40], [top[0] + 5, top[1] + 26], [top[0] - 4, top[1] + 12]], 3.2, 2.6, '#5a4a30', 303, 0.9) +
            feathers(top[0] - 6, top[1] + 8, ['#c8342a', '#ece4cc', '#3a2a1a'], 0.8, 0.9) + C(top[0], top[1], 18, glow(c, red, 0.55)) + briarMask(c, top[0], top[1], 0.95, WOOD, red);
        },
        tf: at(1.08, 64, 122)
      });
    },
    death_speaker_jargba: function (c) {
      var rb = '#2a1e32', trim = '#e0d6bc', pu = '#b060ff';
      return spinefolk(c, {
        skin: '#5a4034', mane: '#3e3430', tip: '#d8c8e8', glowEye: '#d890ff', shirt: rb, sleeve: rb, noLegs: true,
        back: function (c) { return C(40, 44, 52, glow(c, pu, 0.34)) + body(c, 'M60,46 C86,42 100,60 100,84 L104,118 L92,112 L84,120 L74,110 L64,116 C62,94 60,70 60,46 Z', '#1e1624', F('M88,46 L108,46 L108,122 L92,122 Z', '#0e0a12', 0.6), 2) + wisp(c, 110, 56, 1, pu) + wisp(c, 18, 98, 0.8, pu); },
        front: function (c) { return robeSkirt(c, rb, trim, 11) + P('M58,82 L70,82 L68,118 L60,118 Z', c.cel('#4a2a5a'), 1.4) + skull(c, 64, 94, 0.55); },
        chest: function () { return L('M58,50 L60,86 M70,48 L70,86', trim, 1.6, 0.9); },
        pads: function (c) {
          var s = body(c, 'M36,62 C34,48 60,42 90,50 L92,62 C78,58 56,58 36,62 Z', '#3a2a44', L('M38,60 C54,56 74,56 90,60', trim, 1.6), 1.8);
          [[40, 54, -2.2], [48, 48, -1.9], [58, 46, -1.6], [68, 46, -1.3], [78, 48, -1.0], [86, 52, -0.8]].forEach(function (t) { s += P(pd([[t[0] - 2.4, t[1] + 2], [t[0] + Math.cos(t[2]) * 10, t[1] + Math.sin(t[2]) * 10], [t[0] + 2.4, t[1] + 2]], true), c.cel(trim), 1.1); });
          return s + briarMask(c, 86, 58, 0.55, WOODD, pu);
        },
        headX: function (c, x, y) {
          // a long beast skull worn as a helm, muzzle forward over the brow, fangs hanging
          var sk = 'M' + pt([x + 12, y - 8]) + 'C' + pt([x + 10, y - 22]) + ' ' + pt([x - 6, y - 26]) + ' ' + pt([x - 14, y - 18]) + 'L' + pt([x - 26, y - 14]) + 'C' + pt([x - 30, y - 13]) + ' ' + pt([x - 30, y - 7]) + ' ' + pt([x - 26, y - 6]) + 'L' + pt([x - 12, y - 8]) + 'C' + pt([x - 4, y - 10]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x + 12, y - 8]) + 'Z';
          return body(c, sk, trim, F(pd([[x + 2, y - 28], [x + 16, y - 28], [x + 16, y - 6], [x + 4, y - 6]], true), '#b0a68e', 0.8) + L('M' + pt([x - 24, y - 12]) + 'L' + pt([x - 12, y - 13]), '#b0a68e', 1), 2) +
            E(x - 6, y - 17, 3.2, 2.8, OL) + glowEye(c, x - 6, y - 17, 1.4, '#d890ff') + E(x - 27, y - 10, 0.9, 1.3, OL) +
            P(pd([[x - 24, y - 7], [x - 22.5, y - 1.5], [x - 21, y - 7.4]], true), c.cel('#f4ecd6'), 1.1) + P(pd([[x - 17, y - 7.6], [x - 15.8, y - 3], [x - 14.4, y - 7.8]], true), c.cel('#f4ecd6'), 1.1) +
            P(pd([[x + 4, y - 22], [x + 10, y - 34], [x + 10, y - 20]], true), c.cel('#d8cfb8'), 1.3) + P(pd([[x + 10, y - 18], [x + 20, y - 26], [x + 14, y - 14]], true), c.cel('#d8cfb8'), 1.3);
        },
        near: [[48, 58], [38, 72], [26, 78]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 6, p[1] - 8], 1.1, pu); },
        far: [[80, 54], [92, 66], [98, 78]],
        wFar: function (c, p) {
          var top = [p[0] - 4, p[1] - 50], bot = [p[0] + 2, p[1] + 44], d = 'M' + pt(bot) + 'L' + pt(top);
          return limb(d, '#2a2024', 4) + L(d, '#5a4a52', 1.2, 0.6) + L('M' + pt([top[0] - 8, top[1] + 12]) + 'q-3,10 0,20 M' + pt([top[0] + 8, top[1] + 12]) + 'q3,9 0,18', '#8a5ab0', 2.4) +
            C(top[0], top[1] - 2, 24, glow(c, pu, 0.6)) + briarMask(c, top[0], top[1], 1.15, WOODD, '#e0a8ff') + wisp(c, top[0] + 16, top[1] + 4, 0.7, pu);
        },
        tf: at(1.06, 64, 122)
      });
    },
    overlord_ramtusk: function (c) {
      var ir = IRON;
      return spinefolk(c, {
        skin: '#5e4234', mane: '#5a4c40', tusk: 2.3, eye: '#ff8a30', legW: 14, armW: 13, shadowR: 44, belt: '#2a2020', k: 1.2, big: true, scars: '#b88a78',
        torsoD: 'M34,58 C34,42 70,34 90,44 L94,70 L86,90 L46,90 L38,76 Z',
        chest: function (c) {
          return P('M40,54 C52,48 76,46 90,52 L88,76 C72,82 54,82 42,76 Z', c.cel(ir), 1.8) + L('M44,64 C58,68 74,68 88,63', dk(ir, 0.4), 1.2) +
            [[46, 58], [86, 56], [46, 72], [86, 70]].map(function (q) { return C(q[0], q[1], 1.4, '#b8bcc0', 0.6); }).join('') + briarMask(c, 65, 64, 0.62, WOOD);
        },
        front: function (c) {
          return P('M46,84 L84,84 L86,106 L74,102 L66,108 L58,102 L44,106 Z', c.cel('#4a3a2e'), 1.8) + P('M48,86 L62,86 L60,104 L50,104 Z', c.cel(ir), 1.4) + P('M68,86 L82,86 L82,102 L70,100 Z', c.cel(dk(ir, 0.12)), 1.4) +
            P('M58,80 L72,80 L72,90 L58,90 Z', c.cel(BONE), 1.4) + C(65, 85, 1.6, OL);
        },
        shins: function (c) { return P('M46,102 L60,102 L58,116 L46,116 Z', c.cel(ir), 1.5) + P('M66,102 L80,102 L78,116 L68,116 Z', c.cel(dk(ir, 0.15)), 1.5); },
        pads: function (c) {
          var s = body(c, 'M68,56 C66,40 92,34 100,50 L98,62 Z', ir, L('M72,52 L96,48', dk(ir, 0.4), 1.2) + F('M88,36 L104,36 L104,64 L92,64 Z', dk(ir, 0.3), 0.7), 2);
          [[74, 46, -1.9], [84, 41, -1.5], [94, 42, -1.1]].forEach(function (t) { s += P(pd([[t[0] - 3, t[1] + 2], [t[0] + Math.cos(t[2]) * 13, t[1] + Math.sin(t[2]) * 13], [t[0] + 3, t[1] + 2]], true), c.cel('#f4ecd6'), 1.3); });
          return s;
        },
        headX: function (c, x, y) {
          y -= 4; // the iron cap sits up on the crown, clear of the eye
          var h = 'M' + pt([x - 12, y - 8]) + 'C' + pt([x - 10, y - 20]) + ' ' + pt([x + 8, y - 22]) + ' ' + pt([x + 14, y - 8]) + 'L' + pt([x + 12, y - 4]) + 'C' + pt([x + 4, y - 9]) + ' ' + pt([x - 6, y - 9]) + ' ' + pt([x - 12, y - 4]) + 'Z';
          var s = body(c, h, ir, F(pd([[x + 4, y - 24], [x + 16, y - 24], [x + 16, y - 2], [x + 6, y - 2]], true), dk(ir, 0.3), 0.8) + L('M' + pt([x - 10, y - 8]) + 'L' + pt([x + 12, y - 7]), '#9a9ea4', 1, 0.8), 2);
          [[-6, -16, -2.0], [1, -19, -1.6], [8, -17, -1.2]].forEach(function (t) { s += P(pd([[x + t[0] - 2.6, y + t[1] + 2], [x + t[0] + Math.cos(t[2]) * 10, y + t[1] + Math.sin(t[2]) * 10], [x + t[0] + 2.6, y + t[1] + 2]], true), c.cel('#f4ecd6'), 1.2); });
          return s + P(pd([[x - 12, y - 7], [x - 16, y - 4], [x - 10, y - 3]], true), c.cel(ir), 1.2);
        },
        near: [[46, 58], [36, 72], [30, 80]],
        wNear: function (c, p) { return club(c, p, 34, -2.25, '#6a5a4a', true); },
        far: [[82, 56], [94, 70], [90, 84]],
        top: function (c) { return bonePad(c, 46, 65, 0.8) + bracer([36, 72], [30, 80], ir, 10) + bracer([94, 70], [90, 84], ir, 9.4); },
        tf: at(1.12, 64, 122)
      });
    },
    agathelos: function (c) {
      var fur = '#4e3a30', br = '#342822', tip = '#e8dcc0', bel = '#7a5a48', s = shadow(c, 64, 54);
      // far legs
      s += limb('M44,92 L42,106 L44,116', dk(fur, 0.2), 12) + hoofs(44, 121, '#221a16') + limb('M98,90 L102,106 L100,116', dk(fur, 0.2), 12) + hoofs(100, 121, '#221a16');
      // tail
      s += L('M118,70 C126,66 126,56 120,56', OL, 5.4) + L('M118,70 C126,66 126,56 120,56', fur, 2.6) + P(shag(119, 54, 4, 4, 5, 0.4, 3), c.cel(br), 1.2);
      // back bristles, two rows
      [[br, 1.15, 0], [lt(br, 0.12), 1, 1]].forEach(function (rw) {
        for (var i = 0; i < 12; i++) {
          var t = i / 11, bx = 40 + t * 76 + rw[2] * -2, by = 38 - Math.sin(t * PI) * 8 + t * 18 + rw[2] * 4, a = -1.9 + t * 1.5, len = (20 + Math.sin(t * PI) * 12) * rw[1];
          var tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len, px = -Math.sin(a) * 3.6, py = Math.cos(a) * 3.6;
          s += P(pd([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true), c.cel(rw[0]), 1.5) + F(pd([[bx + (tx - bx) * 0.6 + px * 0.4, by + (ty - by) * 0.6 + py * 0.4], [tx, ty], [bx + (tx - bx) * 0.6 - px * 0.4, by + (ty - by) * 0.6 - py * 0.4]], true), tip);
        }
      });
      // body
      var bd = 'M30,68 C28,44 54,30 82,32 C106,34 122,50 120,74 C118,94 104,104 84,104 L52,104 C36,102 30,88 30,68 Z';
      s += body(c, bd, fur, F('M40,90 C54,102 86,104 110,92 L112,108 L36,108 Z', bel, 0.85) + F('M96,30 C116,40 124,60 120,82 C114,98 102,104 90,106 L126,106 L126,30 Z', dk(fur, 0.35), 0.85) +
        L('M58,50 l6,4 M70,46 l6,4 M84,52 l6,3 M64,66 l6,3 M96,62 l6,3', lt(fur, 0.16), 1.3, 0.8) + L('M76,58 L90,78 M82,56 L96,74', '#a07a68', 1.6, 0.9), 2.6);
      // shaggy hump over the shoulders
      s += P(shag(50, 46, 18, 13, 9, 0.3, 21, 0.2), c.cel(lt(br, 0.08)), 2);
      // near legs
      s += limb('M40,90 L36,106 L38,116', fur, 13) + hoofs(38, 121, '#2a201a') + limb('M92,92 L90,106 L92,116', fur, 13) + hoofs(92, 121, '#2a201a');
      // head, low and charging
      var hd = 'M50,56 C42,44 22,46 14,58 L5,72 C2,78 3,88 9,90 L28,96 C42,98 54,88 54,74 Z';
      s += P(pd([[36, 50], [46, 30], [50, 52]], true), c.cel(fur), 2) + F(pd([[39, 49], [45, 36], [47, 50]], true), '#3a2620', 0.9);
      s += body(c, hd, fur, F('M2,84 C16,92 34,96 56,84 L56,100 L2,100 Z', dk(fur, 0.25), 0.8) + F('M40,44 L58,44 L58,94 L44,94 C50,78 48,58 40,44 Z', dk(fur, 0.3), 0.8) + L('M26,56 L18,72', '#a07a68', 1.4, 0.9), 2.6);
      s += E(6, 80, 4.6, 8, c.cel('#8e6252'), 2) + E(5, 77, 1.1, 1.8, OL) + E(5, 83, 1.1, 1.8, OL);
      s += L('M10,90 C18,93 26,94 34,92', OL, 1.6);
      s += glowEye(c, 26, 64, 2.2, '#ff3a2a') + L('M16,60 L34,60', OL, 3.2) + L('M30,58 L38,52', OL, 2.4);
      // huge tusks
      s += P('M20,92 C8,94 0,84 2,68 C6,76 12,84 22,86 Z', c.cel('#e6dcc2'), 1.6) + P('M30,94 C18,98 8,90 8,74 C12,82 20,88 30,88 Z', c.cel('#f4ecd6'), 1.8);
      // breath
      s += C(-2, 90, 4, '#e8e0d8', 0, 0.5) + C(-4, 96, 3, '#e8e0d8', 0, 0.35);
      return G(s, at(1.02, 64, 122));
    },
    charlga_razorflank: function (c) {
      var gr = '#7aff9a', sk = '#7a6254';
      return spinefolk(c, {
        skin: sk, mane: '#aca496', tip: '#f4f0e4', hair: '#c8c0b0', glowEye: gr, shutEye: false, noLegs: true, shirt: '#5a4636', sleeve: sk, whiskers: '#d8d0c0', scars: '#c89080',
        hx: 42, hy: 48, torsoD: 'M36,64 C34,50 60,42 82,48 L88,70 L82,88 L50,88 L42,78 Z',
        noCrown: true,
        headBack: function (c, x0, y0) {
          // tall bone headdress fanned out behind the head
          var s = '', x = x0 + 4, y = y0 - 8;
          [[-2.55, 22], [-2.2, 30], [-1.85, 34], [-1.5, 34], [-1.15, 30], [-0.8, 24]].forEach(function (t, i) {
            var ca = Math.cos(t[0]), sa = Math.sin(t[0]), ex = x + ca * t[1], ey = y + sa * t[1], px = -sa * 3.2, py = ca * 3.2;
            var d = 'M' + pt([x + px, y + py]) + 'Q' + pt([x + ca * t[1] * 0.55 + px * 1.3, y + sa * t[1] * 0.55 + py * 1.3]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + ca * t[1] * 0.55 - px * 1.3, y + sa * t[1] * 0.55 - py * 1.3]) + ' ' + pt([x - px, y - py]) + 'Z';
            s += P(d, c.cel(i % 2 ? '#f4ecd6' : '#ded2b4'), 1.5) + C(x + ca * t[1] * 0.5, y + sa * t[1] * 0.5, 1.8, i % 2 ? '#3a8a5a' : OCHRE, 0.8);
          });
          return s;
        },
        back: function (c) {
          var s = C(30, 30, 40, glow(c, gr, 0.24)) + body(c, 'M56,52 C84,46 100,62 100,86 L102,118 L88,112 L80,120 L70,110 L62,114 C60,94 58,72 56,52 Z', '#4a3a2c', F('M86,50 L106,50 L106,122 L90,122 Z', '#2a2018', 0.6), 2);
          // the staff of thorns she leans on, standing behind her snout
          var bot = [32, 122], top = [18, 32];
          var st = vine(c, [bot, [30, 96], [22, 66], top], 4.4, 3.6, '#5a4632', 401, 0.8);
          var loop = 'M' + pt(top) + 'C' + pt([top[0] - 13, top[1] - 4]) + ' ' + pt([top[0] - 11, top[1] - 22]) + ' ' + pt([top[0], top[1] - 24]) + 'C' + pt([top[0] + 11, top[1] - 22]) + ' ' + pt([top[0] + 13, top[1] - 4]) + ' ' + pt(top);
          var th = '';
          [[-11, -8, -1], [-10, -18, -1], [10, -18, 1], [11, -8, 1], [0, -24, 0]].forEach(function (k) { var bx = top[0] + k[0], by = top[1] + k[1]; th += P(k[2] ? pd([[bx, by - 2], [bx + k[2] * 6, by - 3], [bx, by + 2]], true) : pd([[bx - 2, by + 1], [bx, by - 6], [bx + 2, by + 1]], true), c.cel(THORN), 1); });
          return s + st + th + L(loop, OL, 5.4) + L(loop, '#5a4632', 3) + orb(c, top[0], top[1] - 12, 4.6, gr);
        },
        front: function (c) { return robeSkirt(c, '#5a4636', OCHRE, 13) + L('M40,100 L90,100', BONE, 1.6, 0.8); },
        pads: function (c) {
          var s = body(c, 'M34,66 C30,52 60,44 90,52 L94,68 C76,62 54,62 34,66 Z', '#8a6640', L('M36,64 C54,58 76,58 92,66', '#5a3e24', 1.4), 1.8);
          for (var x = 38; x < 92; x += 6) s += L('M' + x + ',' + n(64 - Math.sin((x - 34) / 58 * PI) * 3) + ' l-1,7', '#8a6640', 1.6) + C(x - 1, n(71 - Math.sin((x - 34) / 58 * PI) * 3), 1.2, BONE, 0.6);
          return s + tuskNecklace(c, 58, 64, 12);
        },
        headX: function (c, x, y) {
          // headband with a small Briarmother mask mounted on its front
          return L('M' + pt([x - 12, y - 10]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 12, y - 10]), OL, 4) + L('M' + pt([x - 12, y - 10]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 12, y - 10]), OCHRE, 2) +
            briarMask(c, x - 2, y - 15, 0.52, WOOD) + feathers(x + 10, y - 10, ['#ece4cc', '#3a8a5a', '#5a4a3a'], 0.8, 2.2);
        },
        near: [[46, 64], [36, 78], [27, 84]],
        far: [[80, 60], [92, 62], [100, 52]], farHand: function (c, p) { return clawHand(p, sk, 1, '#e8e0c8'); },
        wFar: function (c, p) { return wisp(c, p[0] + 2, p[1] - 8, 0.9, gr) + wisp(c, p[0] + 12, p[1] - 2, 0.6, gr); },
        tf: at(1.04, 64, 122)
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a4a3c'), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, '#2a1c12') + ground(c, 150, '#6a5038', '#3a2a1e'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#6a4a3c"/></svg>'; }
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
