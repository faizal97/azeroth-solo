/* art_mulgore.js — Greensward zone art for Realm of Loner (tauren homeland: Calf Hill Camp, Thornrift Ravine,
 * Ossa Village, Ashpelt Rock, the Deepgold Company mine, the Sunwheat Plains, Hornwind Mesa).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Greensward keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix mu<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
  var OL = '#1a1009';
  var SEQ = 0;

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
  function Ctx() { this.p = 'mu' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  // point on a cubic bezier + unit normal
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t, x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    var dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]), dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    var l = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x, y, -dy / l, dx / l];
  }

  // ---------- palette ----------
  var GOLD = '#d6be62', GOLD2 = '#b09a40', GRASSD = '#a48a34', GRASSL = '#f2dc86', GREEN = '#86a846', MESA = '#c27a4a', CAP = '#8aaa48';
  var HIDE = '#e6cfa0', PAINT_R = '#b83a2a', PAINT_B = '#2f7a8a', PAINT_Y = '#e0a83a', WOOD = '#8a5a32';

  // ============================================================
  //  SCENE PIECES
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#fff8e0', 0.16], [0.5, '#fff4e0', 0], [1, bot || '#2a1a08', 0.2]])); }
  function cloud(x, y, s, op) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, '#ffffff', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', '#cfe2ee', 0.9);
  }
  // rolling hill band (smooth), filled to the bottom
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  // grass blades scattered, one path per call
  function grass(seed, y0, y1, col, cnt, s0, s1, w, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), s = s0 + (s1 - s0) * t, x = x0 + r() * (x1 - x0);
      d += 'M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-7 * s) + 'M' + pt([x, y]) + 'q' + n(0.5 * s) + ',' + n(-5 * s) + ' ' + n(1 * s) + ',' + n(-9 * s) + 'M' + pt([x, y]) + 'q' + n(2 * s) + ',' + n(-3 * s) + ' ' + n(5 * s) + ',' + n(-6 * s);
    }
    return L(d, col, w || 1.2);
  }
  // outlined foreground tuft
  function tuft(c, x, y, s, col) {
    col = col || '#b4b04a';
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
  function pebbles(seed, y0, y1, col, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < (cnt || 14); i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function flowers(seed, y0, y1, cols, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), sz = 0.8 + (y - y0) / (y1 - y0 || 1) * 1.4; s += C(r() * 400, y, sz, cols[i % cols.length]); }
    return s;
  }
  function road(c, y, w1, w2, col, op) { return F('M' + (200 - w1) + ',' + y + ' C' + (200 - w1) + ',' + (y + 30) + ' ' + (200 - w2) + ',210 ' + (200 - w2) + ',242 L' + (200 + w2) + ',242 C' + (200 + w2) + ',210 ' + (200 + w1) + ',' + (y + 30) + ' ' + (200 + w1) + ',' + y + ' Z', col, op == null ? 0.5 : op); }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  // distant flat-topped mesa (no outline), grassy cap
  function farMesa(x, base, w, h, col, side, cap) {
    var t = base - h;
    var d = pd([[x, base], [x + w * 0.05, t + h * 0.35], [x + w * 0.09, t + 3], [x + w * 0.13, t], [x + w * 0.87, t], [x + w * 0.91, t + 3], [x + w * 0.95, t + h * 0.35], [x + w, base]], true);
    return F(d, col) + F(pd([[x + w * 0.66, t], [x + w * 0.87, t], [x + w * 0.91, t + 3], [x + w * 0.95, t + h * 0.35], [x + w, base], [x + w * 0.72, base]], true), side, 0.9) +
      L('M' + pt([x + w * 0.07, t + h * 0.4]) + 'L' + pt([x + w * 0.94, t + h * 0.42]), side, 1.3, 0.5) +
      (cap ? F('M' + pt([x + w * 0.1, t + 3]) + 'L' + pt([x + w * 0.13, t - 1.5]) + 'L' + pt([x + w * 0.87, t - 1.5]) + 'L' + pt([x + w * 0.9, t + 3]) + 'L' + pt([x + w * 0.72, t + 5]) + 'L' + pt([x + w * 0.5, t + 2.5]) + 'L' + pt([x + w * 0.32, t + 6]) + 'Z', cap) : '');
  }
  // near mesa with strata, outlined, grassy cap with drips
  function bigMesa(c, x, base, w, h, col, cap, seed) {
    var t = base - h, r = rng(seed || 1);
    var d = 'M' + pt([x, base]) + 'C' + pt([x + w * 0.05, base - h * 0.4]) + ' ' + pt([x + w * 0.02, t + h * 0.25]) + ' ' + pt([x + w * 0.08, t + 4]) + 'L' + pt([x + w * 0.12, t]) + 'L' + pt([x + w * 0.88, t]) + 'L' + pt([x + w * 0.92, t + 4]) +
      'C' + pt([x + w * 0.98, t + h * 0.25]) + ' ' + pt([x + w * 0.95, base - h * 0.4]) + ' ' + pt([x + w, base]) + 'Z';
    var sh = F('M' + pt([x + w * 0.68, t]) + 'L' + pt([x + w * 0.95, t]) + 'L' + pt([x + w + 6, base + 4]) + 'L' + pt([x + w * 0.74, base + 4]) + 'C' + pt([x + w * 0.78, base - h * 0.4]) + ' ' + pt([x + w * 0.7, t + h * 0.3]) + ' ' + pt([x + w * 0.68, t]) + 'Z', dk(col, 0.28), 0.85);
    var st = '';
    for (var i = 1; i < 7; i++) { var y = t + h * i / 7 + (r() - 0.5) * 4; st += 'M' + pt([x - 4, y]) + 'Q' + pt([x + w * 0.5, y + 4 + r() * 4]) + ' ' + pt([x + w + 4, y - 2]); }
    var cr = '';
    for (var j = 0; j < 5; j++) { var cx = x + w * (0.15 + r() * 0.7), cy = t + h * (0.15 + r() * 0.5); cr += 'M' + pt([cx, cy]) + 'l' + n(r() * 4 - 2) + ',' + n(8 + r() * 10) + 'l' + n(r() * 4 - 2) + ',' + n(6 + r() * 8); }
    var o = body(c, d, col, sh + L(st, dk(col, 0.2), 1.6, 0.7) + L(cr, dk(col, 0.35), 1.2, 0.7) + F('M' + pt([x + w * 0.1, t + 6]) + 'L' + pt([x + w * 0.4, t + 6]) + 'L' + pt([x + w * 0.3, t + h * 0.5]) + 'L' + pt([x + w * 0.08, t + h * 0.55]) + 'Z', lt(col, 0.15), 0.5), 2.2);
    // grassy cap
    var cd = 'M' + pt([x + w * 0.06, t + 6]) + 'L' + pt([x + w * 0.1, t - 3]) + 'L' + pt([x + w * 0.9, t - 3]) + 'L' + pt([x + w * 0.94, t + 6]);
    var k = 9;
    for (var q = k; q >= 0; q--) { var qx = x + w * (0.06 + 0.88 * q / k), dy = (q % 3 === 0) ? 12 : (q % 2 ? 5 : 8); cd += 'L' + pt([qx + w * 0.02, t + dy]) + 'L' + pt([qx, t + 4]); }
    o += body(c, cd + 'Z', cap || CAP, F('M' + pt([x + w * 0.62, t - 4]) + 'L' + pt([x + w * 0.96, t - 4]) + 'L' + pt([x + w * 0.96, t + 14]) + 'L' + pt([x + w * 0.62, t + 14]) + 'Z', dk(cap || CAP, 0.25), 0.8), 1.8);
    return o;
  }
  // tauren tent: tall painted hide cone with horn-curved poles
  function taurenTent(c, x, y, s, o) {
    o = o || {};
    var hide = o.hide || HIDE, p1 = o.p1 || PAINT_R, p2 = o.p2 || PAINT_B, w = o.w || 1, out = '';
    var hw = 28 * s * w, ht = 56 * s, ax = x, ay = y - ht;
    out += E(x, y + 1, hw + 6 * s, 5 * s, '#000', 0, 0.22);
    [[-13, -18], [-5, -22], [5, -21], [13, -16]].forEach(function (pp) {
      var d = 'M' + pt([ax + pp[0] * 0.12 * s, ay + 8 * s]) + 'Q' + pt([ax + pp[0] * 0.3 * s, ay - 6 * s]) + ' ' + pt([ax + pp[0] * s, ay + pp[1] * s]);
      out += limb(d, '#7a5030', 2 * s);
    });
    var seg = hw * 2 / 6, bot = '';
    for (var k = 0; k < 6; k++) bot += 'Q' + pt([x + hw - seg * k - seg / 2, y + 3 * s]) + ' ' + pt([x + hw - seg * (k + 1), y]);
    var d = 'M' + pt([ax - 4 * s, ay + 2 * s]) + 'L' + pt([ax + 4 * s, ay + 2 * s]) + 'C' + pt([ax + hw * 0.4, ay + ht * 0.3]) + ' ' + pt([x + hw * 0.92, y - ht * 0.28]) + ' ' + pt([x + hw, y]) + bot +
      'C' + pt([x - hw * 0.92, y - ht * 0.28]) + ' ' + pt([ax - hw * 0.4, ay + ht * 0.3]) + ' ' + pt([ax - 4 * s, ay + 2 * s]) + 'Z';
    var b1 = y - ht * 0.34, zz = '', zx = x - hw - 4;
    while (zx < x + hw + 4) { zz += (zz ? 'L' : 'M') + pt([zx, b1 + 2.5 * s]) + 'L' + pt([zx + 4 * s, b1 - 2.5 * s]); zx += 8 * s; }
    var sh = R(x - hw - 6, b1 - 6 * s, hw * 2 + 12, 12 * s, p1) + L(zz, p2, 2 * s) + L('M' + pt([x - hw - 6, b1 - 6 * s]) + 'L' + pt([x + hw + 6, b1 - 6 * s]) + 'M' + pt([x - hw - 6, b1 + 6 * s]) + 'L' + pt([x + hw + 6, b1 + 6 * s]), dk(p1, 0.4), 1.2 * s) +
      R(x - hw - 6, y - ht * 0.1 - 2 * s, hw * 2 + 12, 4 * s, p2) +
      R(x - hw - 6, ay - 2, hw * 2 + 12, ht * 0.14, dk(hide, 0.35)) +
      L('M' + pt([ax - 2 * s, ay + 4 * s]) + 'L' + pt([x - hw * 0.55, y]) + 'M' + pt([ax + 2 * s, ay + 4 * s]) + 'L' + pt([x + hw * 0.5, y]), dk(hide, 0.25), 1.1 * s, 0.8) +
      F('M' + pt([ax + 1 * s, ay]) + 'L' + pt([x + hw + 8 * s, y + 6 * s]) + 'L' + pt([x + hw * 0.3, y + 6 * s]) + 'C' + pt([x + hw * 0.25, y - ht * 0.4]) + ' ' + pt([ax + 3 * s, ay + ht * 0.3]) + ' ' + pt([ax + 1 * s, ay]) + 'Z', dk(hide, 0.25), 0.75);
    // painted emblem: sun disc + hoof marks
    var ey = y - ht * 0.58;
    sh += C(x - 4 * s, ey, 4.2 * s, p1) + C(x - 4 * s, ey, 1.8 * s, PAINT_Y) + L('M' + pt([x - 4 * s, ey - 7 * s]) + 'L' + pt([x - 4 * s, ey - 5.5 * s]) + 'M' + pt([x - 11 * s, ey]) + 'L' + pt([x - 9.5 * s, ey]) + 'M' + pt([x + 1.5 * s, ey]) + 'L' + pt([x + 3 * s, ey]), p1, 1.2 * s);
    out += body(c, d, hide, sh, 2 * s);
    // door flap
    out += P('M' + pt([x - 10 * s, y + 1]) + 'L' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'Z', '#2a1a10', 1.6 * s);
    out += P('M' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'L' + pt([x + 11 * s, y + 1]) + 'Z', c.cel(lt(hide, 0.1)), 1.4 * s);
    return out;
  }
  // tall carved totem pole topped with spread thunderbird wings
  function totem(c, x, y, h, s, o) {
    o = o || {};
    var cols = o.cols || [PAINT_R, PAINT_B, PAINT_Y, WOOD], w = 8 * s, top = y - h, out = E(x, y + 1, 12 * s, 3 * s, '#000', 0, 0.25);
    out += body(c, 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, top + 10 * s]) + 'L' + pt([x + w / 2, top + 10 * s]) + 'L' + pt([x + w / 2, y]) + 'Z', WOOD, F('M' + pt([x + w * 0.1, top]) + 'L' + pt([x + w, top]) + 'L' + pt([x + w, y]) + 'L' + pt([x + w * 0.1, y]) + 'Z', dk(WOOD, 0.3), 0.8), 1.8 * s);
    var nseg = Math.max(1, Math.min(o.seg || 3, Math.floor((h - 16 * s) / (20 * s))));
    for (var i = 0; i < nseg; i++) {
      var sy = top + 14 * s + i * 20 * s, bw = 9 * s, col = cols[i % cols.length];
      out += body(c, 'M' + pt([x - bw, sy]) + 'L' + pt([x + bw, sy]) + 'L' + pt([x + bw * 0.9, sy + 18 * s]) + 'L' + pt([x - bw * 0.9, sy + 18 * s]) + 'Z', col, F('M' + pt([x + bw * 0.25, sy - 2]) + 'L' + pt([x + bw + 2, sy - 2]) + 'L' + pt([x + bw + 2, sy + 20 * s]) + 'L' + pt([x + bw * 0.25, sy + 20 * s]) + 'Z', dk(col, 0.3), 0.8), 1.6 * s);
      // carved face
      out += L('M' + pt([x - 6 * s, sy + 4 * s]) + 'L' + pt([x - 1.5 * s, sy + 5.5 * s]) + 'M' + pt([x + 1.5 * s, sy + 5.5 * s]) + 'L' + pt([x + 6 * s, sy + 4 * s]), OL, 1.4 * s);
      out += R(x - 5 * s, sy + 6.5 * s, 2.6 * s, 2.2 * s, '#f4ecd6') + R(x + 2.4 * s, sy + 6.5 * s, 2.6 * s, 2.2 * s, '#f4ecd6');
      out += (i % 2 ? P('M' + pt([x - 2 * s, sy + 9 * s]) + 'L' + pt([x, sy + 15 * s]) + 'L' + pt([x + 2 * s, sy + 9 * s]) + 'Z', c.cel(PAINT_Y), 1 * s) : R(x - 5 * s, sy + 12 * s, 10 * s, 3 * s, '#2a1a10', 1 * s));
      if (i % 2 === 0) out += P('M' + pt([x - bw, sy + 2 * s]) + 'L' + pt([x - bw - 5 * s, sy - 3 * s]) + 'L' + pt([x - bw, sy + 7 * s]) + 'Z', c.cel(lt(col, 0.1)), 1.2 * s) + P('M' + pt([x + bw, sy + 2 * s]) + 'L' + pt([x + bw + 5 * s, sy - 3 * s]) + 'L' + pt([x + bw, sy + 7 * s]) + 'Z', c.cel(dk(col, 0.1)), 1.2 * s);
    }
    // wings
    var wy = top + 10 * s, wc = o.wing || PAINT_B, tip = o.tip || PAINT_R;
    [-1, 1].forEach(function (sg) {
      var d = 'M' + pt([x, wy + 2 * s]) + 'C' + pt([x + sg * 10 * s, wy - 6 * s]) + ' ' + pt([x + sg * 24 * s, wy - 12 * s]) + ' ' + pt([x + sg * 34 * s, wy - 12 * s]) +
        'L' + pt([x + sg * 30 * s, wy - 6 * s]) + 'L' + pt([x + sg * 32 * s, wy - 3 * s]) + 'L' + pt([x + sg * 25 * s, wy - 1 * s]) + 'L' + pt([x + sg * 26 * s, wy + 3 * s]) + 'L' + pt([x + sg * 18 * s, wy + 3 * s]) + 'L' + pt([x + sg * 17 * s, wy + 7 * s]) + 'L' + pt([x + sg * 8 * s, wy + 6 * s]) + 'Z';
      out += body(c, d, wc, F('M' + pt([x + sg * 22 * s, wy - 16 * s]) + 'L' + pt([x + sg * 38 * s, wy - 16 * s]) + 'L' + pt([x + sg * 38 * s, wy + 10 * s]) + 'L' + pt([x + sg * 22 * s, wy + 10 * s]) + 'Z', tip, 0.95) + L('M' + pt([x + sg * 6 * s, wy + 1 * s]) + 'Q' + pt([x + sg * 16 * s, wy - 4 * s]) + ' ' + pt([x + sg * 28 * s, wy - 8 * s]), lt(wc, 0.3), 1 * s), 1.6 * s);
    });
    // bird head with beak (faces left)
    out += body(c, 'M' + pt([x - 6 * s, wy + 4 * s]) + 'C' + pt([x - 8 * s, wy - 6 * s]) + ' ' + pt([x + 6 * s, wy - 10 * s]) + ' ' + pt([x + 7 * s, wy]) + 'L' + pt([x + 6 * s, wy + 6 * s]) + 'Z', o.headCol || PAINT_Y, '', 1.6 * s);
    out += P('M' + pt([x - 6 * s, wy - 2 * s]) + 'L' + pt([x - 14 * s, wy + 1 * s]) + 'L' + pt([x - 6 * s, wy + 3 * s]) + 'Z', c.cel('#f4ecd6'), 1.2 * s) + C(x - 1 * s, wy - 2 * s, 1.2 * s, OL);
    if (o.feathers !== false) out += L('M' + pt([x - 8 * s, top + 20 * s]) + 'L' + pt([x - 10 * s, top + 32 * s]), OL, 2.4 * s) + P('M' + pt([x - 10 * s, top + 30 * s]) + 'L' + pt([x - 13 * s, top + 40 * s]) + 'L' + pt([x - 8 * s, top + 38 * s]) + 'Z', '#f4f0e0', 1 * s);
    return out;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = Math.PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  function well(c, x, y, s) {
    var o = E(x, y + 2, 26 * s, 6 * s, '#000', 0, 0.22), st = '#a8a090';
    o += limb('M' + pt([x - 15 * s, y - 16 * s]) + 'L' + pt([x - 15 * s, y - 50 * s]), WOOD, 3 * s) + limb('M' + pt([x + 15 * s, y - 16 * s]) + 'L' + pt([x + 15 * s, y - 50 * s]), WOOD, 3 * s);
    var d = 'M' + pt([x - 19 * s, y - 20 * s]) + 'L' + pt([x - 19 * s, y]) + 'Q' + pt([x, y + 8 * s]) + ' ' + pt([x + 19 * s, y]) + 'L' + pt([x + 19 * s, y - 20 * s]) + 'Z';
    var stones = '';
    for (var r = 0; r < 3; r++) { var yy = y - 14 * s + r * 6 * s; stones += 'M' + pt([x - 20 * s, yy]) + 'Q' + pt([x, yy + 7 * s]) + ' ' + pt([x + 20 * s, yy]); for (var k = -2; k <= 2; k++) stones += 'M' + pt([x + (k * 8 + (r % 2 ? 4 : 0)) * s, yy + 2 * s]) + 'l0,' + n(-6 * s); }
    o += body(c, d, st, L(stones, dk(st, 0.35), 1.1 * s) + F('M' + pt([x + 8 * s, y - 24 * s]) + 'L' + pt([x + 22 * s, y - 24 * s]) + 'L' + pt([x + 22 * s, y + 8 * s]) + 'L' + pt([x + 8 * s, y + 8 * s]) + 'Z', dk(st, 0.25), 0.8), 1.8 * s);
    o += E(x, y - 20 * s, 19 * s, 5 * s, c.cel(lt(st, 0.1)), 1.8 * s) + E(x, y - 20 * s, 14.5 * s, 3.2 * s, '#2a4a6a') + E(x - 3 * s, y - 21 * s, 6 * s, 1 * s, '#6a9ac8', 0, 0.8);
    o += limb('M' + pt([x - 18 * s, y - 44 * s]) + 'L' + pt([x + 18 * s, y - 44 * s]), '#7a5030', 2.4 * s) + L('M' + pt([x + 2 * s, y - 44 * s]) + 'L' + pt([x + 2 * s, y - 32 * s]), '#3a2a1a', 1 * s);
    o += P('M' + pt([x - 2 * s, y - 32 * s]) + 'L' + pt([x + 6 * s, y - 32 * s]) + 'L' + pt([x + 5 * s, y - 25 * s]) + 'L' + pt([x - 1 * s, y - 25 * s]) + 'Z', c.cel('#9a6a3a'), 1.2 * s);
    o += body(c, 'M' + pt([x - 25 * s, y - 45 * s]) + 'L' + pt([x, y - 62 * s]) + 'L' + pt([x + 25 * s, y - 45 * s]) + 'L' + pt([x + 18 * s, y - 43 * s]) + 'L' + pt([x, y - 55 * s]) + 'L' + pt([x - 18 * s, y - 43 * s]) + 'Z', HIDE, F('M' + pt([x, y - 64 * s]) + 'L' + pt([x + 28 * s, y - 64 * s]) + 'L' + pt([x + 28 * s, y - 40 * s]) + 'Z', dk(HIDE, 0.25), 0.8) + L('M' + pt([x - 20 * s, y - 47 * s]) + 'L' + pt([x, y - 59 * s]) + 'L' + pt([x + 20 * s, y - 47 * s]), PAINT_R, 1.6 * s), 1.6 * s);
    return o;
  }
  // distant dustback silhouettes: armoured scute back, small brow horn, clubbed tail
  function kodoSil(x, y, s, col, flip) {
    var d = 'M' + pt([x - 11 * s, y - 5 * s]) + 'C' + pt([x - 12 * s, y - 13 * s]) + ' ' + pt([x - 4 * s, y - 17 * s]) + ' ' + pt([x + 3 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 15 * s]) + ' ' + pt([x + 15 * s, y - 11 * s]) + ' ' + pt([x + 14 * s, y - 5 * s]) +
      'L' + pt([x + 13 * s, y]) + 'L' + pt([x + 10 * s, y]) + 'L' + pt([x + 10 * s, y - 3 * s]) + 'L' + pt([x + 6 * s, y - 3 * s]) + 'L' + pt([x + 6 * s, y]) + 'L' + pt([x + 3 * s, y]) + 'L' + pt([x + 3 * s, y - 3 * s]) +
      'L' + pt([x - 4 * s, y - 3 * s]) + 'L' + pt([x - 4 * s, y]) + 'L' + pt([x - 7 * s, y]) + 'L' + pt([x - 7 * s, y - 3 * s]) + 'L' + pt([x - 8 * s, y - 3 * s]) + 'L' + pt([x - 8 * s, y]) + 'L' + pt([x - 11 * s, y]) + 'Z' +
      'M' + pt([x - 9 * s, y - 12 * s]) + 'C' + pt([x - 15 * s, y - 13 * s]) + ' ' + pt([x - 20 * s, y - 9 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + 'L' + pt([x - 15 * s, y - 2 * s]) + 'L' + pt([x - 9 * s, y - 5 * s]) + 'Z' +
      'M' + pt([x - 13 * s, y - 11 * s]) + 'C' + pt([x - 13.5 * s, y - 13.5 * s]) + ' ' + pt([x - 14.5 * s, y - 15 * s]) + ' ' + pt([x - 16 * s, y - 15.5 * s]) + 'C' + pt([x - 15.4 * s, y - 13.6 * s]) + ' ' + pt([x - 15.4 * s, y - 12 * s]) + ' ' + pt([x - 15.4 * s, y - 10 * s]) + 'Z' +
      'M' + pt([x + 14 * s, y - 9 * s]) + 'L' + pt([x + 17 * s, y - 4 * s]) + 'L' + pt([x + 15 * s, y - 3 * s]) + 'Z' + ellD(x + 17.4 * s, y - 3.4 * s, 2.2 * s, 1.8 * s);
    // armoured back: a row of scute bumps along the top line
    [[-6, -15.4], [-1, -16.6], [4, -16.4], [9, -14.8], [12.6, -12]].forEach(function (b) { d += ellD(x + b[0] * s, y + b[1] * s, 2.4 * s, 1.6 * s); });
    return G(E(x, y, 16 * s, 1.6 * s, '#000', 0, 0.15) + F(d, col) + F('M' + pt([x - 6 * s, y - 15 * s]) + 'C' + pt([x, y - 17 * s]) + ' ' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 12 * s]) + 'L' + pt([x + 4 * s, y - 13 * s]) + 'Z', lt(col, 0.2), 0.7), flip ? 'matrix(-1,0,0,1,' + n(2 * x) + ',0)' : '');
  }
  // savanna tree: twisted trunk, flat wide canopy
  function tree(c, x, y, s, leaf) {
    leaf = leaf || '#6a9a3a';
    var o = E(x, y + 2, 34 * s, 5 * s, '#000', 0, 0.2);
    var tr = 'M' + pt([x - 6 * s, y]) + 'C' + pt([x - 3 * s, y - 16 * s]) + ' ' + pt([x - 8 * s, y - 28 * s]) + ' ' + pt([x - 4 * s, y - 40 * s]) + 'L' + pt([x - 18 * s, y - 52 * s]) + 'L' + pt([x - 14 * s, y - 54 * s]) + 'L' + pt([x - 1 * s, y - 44 * s]) + 'L' + pt([x + 2 * s, y - 58 * s]) + 'L' + pt([x + 6 * s, y - 58 * s]) +
      'L' + pt([x + 5 * s, y - 44 * s]) + 'L' + pt([x + 20 * s, y - 54 * s]) + 'L' + pt([x + 22 * s, y - 51 * s]) + 'L' + pt([x + 7 * s, y - 38 * s]) + 'C' + pt([x + 4 * s, y - 26 * s]) + ' ' + pt([x + 8 * s, y - 14 * s]) + ' ' + pt([x + 8 * s, y]) + 'Z';
    o += body(c, tr, '#7a5434', F('M' + pt([x + 1 * s, y - 60 * s]) + 'L' + pt([x + 24 * s, y - 60 * s]) + 'L' + pt([x + 24 * s, y + 2]) + 'L' + pt([x + 2 * s, y + 2]) + 'Z', '#4a3020', 0.6), 1.8 * s);
    var bl = [[-24, -58, 20, 8], [0, -66, 24, 10], [24, -58, 20, 8], [-10, -58, 18, 7], [12, -60, 18, 7]];
    bl.forEach(function (b) { o += E(x + b[0] * s, y + b[1] * s, b[2] * s, b[3] * s, leaf, 2.2 * s); });
    bl.forEach(function (b) { o += E(x + b[0] * s, y + b[1] * s, b[2] * s, b[3] * s, c.cel(leaf)); });
    o += E(x - 4 * s, y - 55 * s, 36 * s, 4 * s, dk(leaf, 0.3), 0, 0.7) + E(x + 22 * s, y - 53 * s, 14 * s, 3 * s, dk(leaf, 0.3), 0, 0.7);
    o += E(x - 6 * s, y - 70 * s, 12 * s, 3 * s, lt(leaf, 0.3), 0, 0.7) + E(x - 26 * s, y - 62 * s, 8 * s, 2.4 * s, lt(leaf, 0.3), 0, 0.6) + E(x + 20 * s, y - 62 * s, 8 * s, 2.4 * s, lt(leaf, 0.3), 0, 0.6);
    return o;
  }
  // giant thorny bramble vine along a cubic curve
  function bramble(c, p0, p1, p2, p3, w, col, thorn, seed) {
    col = col || '#6a5a36'; thorn = thorn || '#e0d0a8';
    var d = 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3), r = rng(seed || 7), th = '', o = '';
    for (var i = 1; i < 14; i++) {
      var q = bez(p0, p1, p2, p3, i / 14 + (r() - 0.5) * 0.03), sg = i % 2 ? 1 : -1, len = w * (0.9 + r() * 0.6);
      var bx = q[0] + q[2] * sg * w * 0.4, by = q[1] + q[3] * sg * w * 0.4, tx = q[0] + q[2] * sg * (w * 0.4 + len), ty = q[1] + q[3] * sg * (w * 0.4 + len);
      var ax = -q[3] * w * 0.3, ay = q[2] * w * 0.3;
      th += P(pd([[bx + ax, by + ay], [tx - ax * 0.4, ty - ay * 0.4], [bx - ax, by - ay]], true), c.cel(thorn), 1.3);
    }
    o += L(d, OL, w + 4) + th + L(d, col, w) + L(d, lt(col, 0.25), w * 0.28, 0.7);
    return o;
  }
  function brambleClump(c, x, y, s, seed, col) {
    var o = '';
    o += bramble(c, [x - 30 * s, y], [x - 34 * s, y - 40 * s], [x + 6 * s, y - 50 * s], [x + 16 * s, y - 20 * s], 6 * s, col, null, seed);
    o += bramble(c, [x + 30 * s, y], [x + 36 * s, y - 30 * s], [x - 4 * s, y - 44 * s], [x - 14 * s, y - 16 * s], 5 * s, dk(col || '#6a5a36', 0.1), null, seed + 3);
    o += bramble(c, [x - 10 * s, y + 2], [x - 6 * s, y - 20 * s], [x + 14 * s, y - 26 * s], [x + 22 * s, y - 8 * s], 4 * s, col, null, seed + 5);
    return o;
  }
  // quilboar hut: hide dome with thorns and a bone-framed door
  function quilHut(c, x, y, s, hide) {
    hide = hide || '#a8845a';
    var o = E(x, y + 1, 34 * s, 5 * s, '#000', 0, 0.22), r = rng(Math.round(x * 3 + y));
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 24 * s]) + ' ' + pt([x - 16 * s, y - 38 * s]) + ' ' + pt([x, y - 38 * s]) + 'C' + pt([x + 16 * s, y - 38 * s]) + ' ' + pt([x + 32 * s, y - 24 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    // thorns poking out
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (1.08 + 0.84 * i / 8), bx = x + Math.cos(a) * 28 * s, by = y - 4 * s + Math.sin(a) * 34 * s, len = (10 + r() * 8) * s;
      o += P(pd([[bx - Math.sin(a) * 3 * s, by + Math.cos(a) * 3 * s], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + Math.sin(a) * 3 * s, by - Math.cos(a) * 3 * s]], true), c.cel('#e0d0a8'), 1.2 * s);
    }
    var patches = L('M' + pt([x - 20 * s, y - 28 * s]) + 'Q' + pt([x - 10 * s, y - 18 * s]) + ' ' + pt([x - 22 * s, y - 4 * s]) + 'M' + pt([x + 4 * s, y - 38 * s]) + 'Q' + pt([x + 8 * s, y - 22 * s]) + ' ' + pt([x + 20 * s, y - 14 * s]) + 'M' + pt([x - 30 * s, y - 14 * s]) + 'Q' + pt([x, y - 10 * s]) + ' ' + pt([x + 30 * s, y - 16 * s]), dk(hide, 0.35), 1.2 * s) +
      E(x - 8 * s, y - 26 * s, 8 * s, 5 * s, dk(hide, 0.12), 0, 0.8) + E(x + 14 * s, y - 8 * s, 8 * s, 5 * s, lt(hide, 0.12), 0, 0.8) +
      F('M' + pt([x + 8 * s, y - 40 * s]) + 'C' + pt([x + 24 * s, y - 34 * s]) + ' ' + pt([x + 34 * s, y - 20 * s]) + ' ' + pt([x + 32 * s, y + 2]) + 'L' + pt([x + 16 * s, y + 2]) + 'C' + pt([x + 20 * s, y - 16 * s]) + ' ' + pt([x + 16 * s, y - 30 * s]) + ' ' + pt([x + 8 * s, y - 40 * s]) + 'Z', dk(hide, 0.25), 0.8);
    o += body(c, d, hide, patches, 2 * s);
    o += P('M' + pt([x - 9 * s, y + 1]) + 'L' + pt([x - 9 * s, y - 12 * s]) + 'Q' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 5 * s, y - 12 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'Z', '#2a1a10', 1.6 * s);
    o += L('M' + pt([x - 11 * s, y + 1]) + 'Q' + pt([x - 12 * s, y - 16 * s]) + ' ' + pt([x - 2 * s, y - 22 * s]) + 'Q' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 7 * s, y + 1]), OL, 4.4 * s) + L('M' + pt([x - 11 * s, y + 1]) + 'Q' + pt([x - 12 * s, y - 16 * s]) + ' ' + pt([x - 2 * s, y - 22 * s]) + 'Q' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 7 * s, y + 1]), '#ece2c8', 2.2 * s);
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
  // gnoll lean-to: crossed poles, ragged hide
  function gnollTent(c, x, y, s, hide) {
    hide = hide || '#9a7a52';
    var o = E(x, y + 1, 30 * s, 5 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 26 * s, y]) + 'L' + pt([x + 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s) + limb('M' + pt([x + 26 * s, y]) + 'L' + pt([x - 8 * s, y - 50 * s]), '#6a4a2a', 2.6 * s);
    var d = 'M' + pt([x - 2 * s, y - 42 * s]) + 'L' + pt([x + 3 * s, y - 42 * s]) + 'L' + pt([x + 24 * s, y - 2 * s]) + 'L' + pt([x + 18 * s, y + 1]) + 'L' + pt([x + 14 * s, y - 4 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y + 1]) + 'L' + pt([x - 14 * s, y - 5 * s]) + 'L' + pt([x - 19 * s, y + 1]) + 'L' + pt([x - 24 * s, y - 3 * s]) + 'Z';
    o += body(c, d, hide, E(x - 10 * s, y - 20 * s, 5 * s, 4 * s, dk(hide, 0.2), 0, 0.8) + E(x + 12 * s, y - 14 * s, 4 * s, 3 * s, dk(hide, 0.2), 0, 0.8) + F('M' + pt([x + 1 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y - 44 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'Z', dk(hide, 0.28), 0.8) +
      L('M' + pt([x - 12 * s, y - 24 * s]) + 'l3,2 M' + pt([x + 8 * s, y - 30 * s]) + 'l-2,3', dk(hide, 0.45), 1.2 * s), 1.8 * s);
    o += F('M' + pt([x - 4 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x - 9 * s, y + 1]) + 'Z', '#2a1a10');
    o += skull(c, x, y - 52 * s, 0.9 * s);
    return o;
  }
  // tanning rack: frame with a stretched hide
  function rack(c, x, y, s) {
    var o = E(x, y + 1, 20 * s, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 14 * s, y - 40 * s]), '#6a4a2a', 2.4 * s) + limb('M' + pt([x + 16 * s, y]) + 'L' + pt([x + 14 * s, y - 40 * s]), '#6a4a2a', 2.4 * s) + limb('M' + pt([x - 18 * s, y - 36 * s]) + 'L' + pt([x + 18 * s, y - 36 * s]), '#6a4a2a', 2.2 * s);
    var hd = 'M' + pt([x - 10 * s, y - 34 * s]) + 'C' + pt([x - 4 * s, y - 32 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 10 * s, y - 34 * s]) + 'L' + pt([x + 12 * s, y - 24 * s]) + 'L' + pt([x + 8 * s, y - 18 * s]) + 'L' + pt([x + 11 * s, y - 8 * s]) + 'L' + pt([x + 4 * s, y - 10 * s]) + 'L' + pt([x, y - 6 * s]) + 'L' + pt([x - 4 * s, y - 10 * s]) + 'L' + pt([x - 11 * s, y - 8 * s]) + 'L' + pt([x - 8 * s, y - 18 * s]) + 'L' + pt([x - 12 * s, y - 24 * s]) + 'Z';
    o += body(c, hd, '#c8a070', E(x, y - 22 * s, 4 * s, 7 * s, '#a07a4a', 0, 0.6), 1.6 * s);
    o += L('M' + pt([x - 12 * s, y - 24 * s]) + 'L' + pt([x - 14 * s, y - 24 * s]) + 'M' + pt([x + 12 * s, y - 24 * s]) + 'L' + pt([x + 14 * s, y - 24 * s]) + 'M' + pt([x - 11 * s, y - 8 * s]) + 'L' + pt([x - 15 * s, y - 6 * s]) + 'M' + pt([x + 11 * s, y - 8 * s]) + 'L' + pt([x + 15 * s, y - 6 * s]), '#3a2a1a', 1 * s);
    return o;
  }
  function gear(c, x, y, r, col) {
    var d = '', k = 10;
    for (var i = 0; i < k * 2; i++) { var a0 = Math.PI * 2 * i / (k * 2), a1 = Math.PI * 2 * (i + 1) / (k * 2), rr = i % 2 ? r * 0.78 : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a0) * rr, y + Math.sin(a0) * rr]) + 'L' + pt([x + Math.cos(a1) * rr, y + Math.sin(a1) * rr]); }
    return P(d + 'Z', c.cel(col), 1.6) + C(x, y, r * 0.35, dk(col, 0.35), 1.2) + C(x, y, r * 0.12, OL);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#8a4a2a';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  function smokestack(c, x, y, h, s, seed) {
    var col = '#8a5a3a', o = '', r = rng(seed || 4), top = y - h;
    for (var i = 0; i < 6; i++) { var t = i / 5, sx = x + 4 * s + t * 50 * s + r() * 6, sy = top - 8 * s - t * 36 * s - r() * 6, rr = (7 + t * 12) * s; o += C(sx, sy, rr, i % 2 ? '#8a8680' : '#a09c96', 0, 0.75 - t * 0.45); }
    o += body(c, 'M' + pt([x - 6 * s, y]) + 'L' + pt([x - 5 * s, top]) + 'L' + pt([x + 5 * s, top]) + 'L' + pt([x + 6 * s, y]) + 'Z', col, F('M' + pt([x + 1 * s, top - 2]) + 'L' + pt([x + 8 * s, top - 2]) + 'L' + pt([x + 8 * s, y + 2]) + 'L' + pt([x + 1 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8) +
      E(x - 2 * s, top + h * 0.3, 2 * s, 4 * s, '#b8702a', 0, 0.6) + E(x + 2 * s, top + h * 0.6, 2.4 * s, 5 * s, '#5a3a2a', 0, 0.5), 1.8 * s);
    for (var k = 0; k < 3; k++) { var yy = top + 6 * s + k * h * 0.3; o += R(x - 7 * s, yy, 14 * s, 3.5 * s, c.cel('#6a6460'), 1.2 * s); }
    o += R(x - 8 * s, top - 3 * s, 16 * s, 5 * s, c.cel('#5a5450'), 1.4 * s);
    return o;
  }
  // goblin drill rig: iron derrick + boxy rusty engine
  function drillRig(c, x, y, s) {
    var ir = '#6a625a', rust = '#a0582a', o = E(x, y + 2, 44 * s, 6 * s, '#000', 0, 0.25);
    var tw = 'M' + pt([x - 16 * s, y - 20 * s]) + 'L' + pt([x - 4 * s, y - 96 * s]) + 'M' + pt([x + 16 * s, y - 20 * s]) + 'L' + pt([x + 4 * s, y - 96 * s]);
    var br = '';
    for (var i = 0; i < 5; i++) { var y0 = y - 20 * s - i * 15 * s, y1 = y0 - 15 * s, w0 = 16 - i * 2.4, w1 = 16 - (i + 1) * 2.4; br += 'M' + pt([x - w0 * s, y0]) + 'L' + pt([x + w1 * s, y1]) + 'M' + pt([x + w0 * s, y0]) + 'L' + pt([x - w1 * s, y1]) + 'M' + pt([x - w1 * s, y1]) + 'L' + pt([x + w1 * s, y1]); }
    o += L(tw + br, OL, 4.6 * s) + L(br, dk(ir, 0.1), 1.8 * s) + L(tw, ir, 2.8 * s);
    o += R(x - 6 * s, y - 102 * s, 12 * s, 8 * s, c.cel(rust), 1.6 * s);
    o += limb('M' + pt([x, y - 94 * s]) + 'L' + pt([x, y - 10 * s]), '#9a9690', 2.2 * s);
    // engine
    var eg = 'M' + pt([x - 44 * s, y]) + 'L' + pt([x - 44 * s, y - 30 * s]) + 'L' + pt([x - 36 * s, y - 36 * s]) + 'L' + pt([x - 14 * s, y - 36 * s]) + 'L' + pt([x - 14 * s, y]) + 'Z';
    o += body(c, eg, rust, F('M' + pt([x - 26 * s, y - 38 * s]) + 'L' + pt([x - 12 * s, y - 38 * s]) + 'L' + pt([x - 12 * s, y + 2]) + 'L' + pt([x - 26 * s, y + 2]) + 'Z', dk(rust, 0.3), 0.8) +
      E(x - 34 * s, y - 14 * s, 5 * s, 3 * s, '#6a4a3a', 0, 0.5) + L('M' + pt([x - 44 * s, y - 22 * s]) + 'L' + pt([x - 14 * s, y - 22 * s]), dk(rust, 0.4), 1.4 * s), 1.8 * s);
    for (var k = 0; k < 4; k++) o += C(x - 40 * s + k * 7 * s, y - 32 * s, 1.1 * s, '#3a2a20');
    o += gear(c, x - 30 * s, y - 40 * s, 10 * s, '#8a8078') + gear(c, x - 14 * s, y - 48 * s, 7 * s, '#b0702a');
    o += limb('M' + pt([x - 20 * s, y - 12 * s]) + 'Q' + pt([x - 4 * s, y - 14 * s]) + ' ' + pt([x - 2 * s, y - 4 * s]), '#6a6460', 3 * s);
    o += R(x - 20 * s, y - 20 * s, 40 * s, 8 * s, c.cel('#5a524a'), 1.6 * s);
    o += C(x - 22 * s, y - 28 * s, 3 * s, '#ffcc40', 1.2 * s) + C(x - 22 * s, y - 28 * s, 7 * s, glow(c, '#ffcc40', 0.6));
    return o;
  }
  function mineEntrance(c, x, y, s) {
    var o = '';
    var hill = 'M' + pt([x - 80 * s, y + 4]) + 'C' + pt([x - 70 * s, y - 50 * s]) + ' ' + pt([x - 30 * s, y - 74 * s]) + ' ' + pt([x + 10 * s, y - 72 * s]) + 'C' + pt([x + 50 * s, y - 70 * s]) + ' ' + pt([x + 80 * s, y - 40 * s]) + ' ' + pt([x + 96 * s, y + 4]) + 'Z';
    o += body(c, hill, '#9a8a5a', F('M' + pt([x + 20 * s, y - 76 * s]) + 'C' + pt([x + 60 * s, y - 60 * s]) + ' ' + pt([x + 84 * s, y - 34 * s]) + ' ' + pt([x + 100 * s, y + 6]) + 'L' + pt([x + 40 * s, y + 6]) + 'Z', '#7a6a44', 0.8) +
      F('M' + pt([x - 70 * s, y - 40 * s]) + 'C' + pt([x - 40 * s, y - 76 * s]) + ' ' + pt([x + 20 * s, y - 80 * s]) + ' ' + pt([x + 60 * s, y - 56 * s]) + 'L' + pt([x + 70 * s, y - 50 * s]) + 'C' + pt([x + 30 * s, y - 66 * s]) + ' ' + pt([x - 30 * s, y - 64 * s]) + ' ' + pt([x - 60 * s, y - 34 * s]) + 'Z', '#8aa84a', 0.9) +
      pebbles(9, y - 40 * s, y, '#6a5a3a', 10), 2.2);
    o += P('M' + pt([x - 18 * s, y + 2]) + 'L' + pt([x - 18 * s, y - 34 * s]) + 'Q' + pt([x, y - 46 * s]) + ' ' + pt([x + 18 * s, y - 34 * s]) + 'L' + pt([x + 18 * s, y + 2]) + 'Z', c.lg([[0, '#0e0806'], [1, '#2a1a10']]), 2);
    o += limb('M' + pt([x - 20 * s, y + 2]) + 'L' + pt([x - 20 * s, y - 38 * s]), WOOD, 5 * s) + limb('M' + pt([x + 20 * s, y + 2]) + 'L' + pt([x + 20 * s, y - 38 * s]), WOOD, 5 * s) + limb('M' + pt([x - 26 * s, y - 38 * s]) + 'L' + pt([x + 26 * s, y - 38 * s]), '#7a4e2a', 5 * s);
    o += L('M' + pt([x - 24 * s, y - 20 * s]) + 'L' + pt([x - 16 * s, y - 36 * s]) + 'M' + pt([x + 24 * s, y - 20 * s]) + 'L' + pt([x + 16 * s, y - 36 * s]), dk(WOOD, 0.3), 2 * s);
    o += C(x + 26 * s, y - 28 * s, 10 * s, glow(c, '#ffc040', 0.6)) + R(x + 23 * s, y - 32 * s, 6 * s, 8 * s, '#ffd060', 1.2 * s);
    return o;
  }
  function rails(x0, y0, x1, y1, w0, w1) {
    var d = 'M' + pt([x0 - w0, y0]) + 'L' + pt([x1 - w1, y1]) + 'M' + pt([x0 + w0, y0]) + 'L' + pt([x1 + w1, y1]), ties = '';
    for (var i = 0; i <= 8; i++) { var t = i / 8, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = (w0 + (w1 - w0) * t) * 1.4; ties += 'M' + pt([x - w, y]) + 'L' + pt([x + w, y]); }
    return L(ties, '#5a3a22', 3) + L(d, OL, 3) + L(d, '#8a8680', 1.4);
  }
  function minecart(c, x, y, s) {
    var d = 'M' + pt([x - 16 * s, y - 20 * s]) + 'L' + pt([x + 16 * s, y - 20 * s]) + 'L' + pt([x + 12 * s, y - 4 * s]) + 'L' + pt([x - 12 * s, y - 4 * s]) + 'Z';
    var o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.25);
    o += C(x - 18 * s + 16 * s, y - 16 * s, 0.1, 'none');
    [[x - 6 * s, y - 22 * s, 6], [x + 4 * s, y - 23 * s, 7], [x + 10 * s, y - 21 * s, 5]].forEach(function (g) { o += C(g[0], g[1], g[2] * s, c.cel('#7a7068'), 1.4 * s); });
    o += C(x + 2 * s, y - 24 * s, 2 * s, '#e0b848');
    o += body(c, d, '#6a625a', L('M' + pt([x - 14 * s, y - 14 * s]) + 'L' + pt([x + 14 * s, y - 14 * s]), '#4a4440', 1.4 * s), 1.8 * s);
    o += C(x - 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s) + C(x + 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s);
    return o;
  }
  function crate(c, x, y, s) {
    var d = 'M' + pt([x - 10 * s, y]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'Z';
    return body(c, d, '#a8743e', L('M' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), '#6a4424', 1.4 * s) + F('M' + pt([x + 4 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', '#6a4424', 0.5), 1.6 * s);
  }
  function ropeBridge(c, x1, y1, x2, y2, sag, s) {
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, cy = my + sag * 2, cyr = my + sag * 2 - 14 * s;
    var deck = 'M' + pt([x1, y1]) + 'Q' + pt([mx, cy]) + ' ' + pt([x2, y2]);
    var rail = 'M' + pt([x1, y1 - 10 * s]) + 'Q' + pt([mx, cyr + 6 * s]) + ' ' + pt([x2, y2 - 10 * s]);
    var planks = '', ver = '';
    for (var i = 1; i < 16; i++) {
      var t = i / 16, u = 1 - t, px = u * u * x1 + 2 * u * t * mx + t * t * x2, py = u * u * y1 + 2 * u * t * cy + t * t * y2, ry = u * u * (y1 - 10 * s) + 2 * u * t * (cyr + 6 * s) + t * t * (y2 - 10 * s);
      planks += 'M' + pt([px, py - 1.6 * s]) + 'L' + pt([px, py + 2 * s]);
      if (i % 3 === 0) ver += 'M' + pt([px, py]) + 'L' + pt([px, ry]);
    }
    return L(deck, OL, 5 * s) + L(deck, '#8a5a32', 3 * s) + L(planks, '#5a3a22', 1 * s) + L(ver, '#4a3420', 0.9 * s) + L(rail, '#4a3420', 1.2 * s);
  }
  // elevator lift running down a mesa face
  function lift(c, x, ytop, ybot, s) {
    var yp = ytop + (ybot - ytop) * 0.52, o = '';
    o += L('M' + pt([x - 9 * s, yp]) + 'L' + pt([x - 9 * s, ybot - 16 * s]) + 'M' + pt([x + 9 * s, yp]) + 'L' + pt([x + 9 * s, ybot - 16 * s]), '#3a2a1a', 1 * s, 0.8) + F('M' + pt([x - 13 * s, ytop]) + 'L' + pt([x + 13 * s, ytop]) + 'L' + pt([x + 13 * s, ybot]) + 'L' + pt([x - 13 * s, ybot]) + 'Z', '#000', 0.08);
    o += limb('M' + pt([x - 12 * s, ytop + 2]) + 'L' + pt([x - 12 * s, ytop - 14 * s]) + 'M' + pt([x + 12 * s, ytop + 2]) + 'L' + pt([x + 12 * s, ytop - 14 * s]), WOOD, 2.4 * s) + limb('M' + pt([x - 16 * s, ytop - 14 * s]) + 'L' + pt([x + 16 * s, ytop - 14 * s]), '#7a5030', 2.6 * s) +
      C(x - 9 * s, ytop - 12 * s, 2.4 * s, c.cel('#6a6460'), 1.2 * s) + C(x + 9 * s, ytop - 12 * s, 2.4 * s, c.cel('#6a6460'), 1.2 * s);
    o += limb('M' + pt([x + 12 * s, ybot]) + 'L' + pt([x + 12 * s, ybot - 16 * s]) + 'M' + pt([x - 12 * s, ybot]) + 'L' + pt([x - 12 * s, ybot - 16 * s]), WOOD, 2.4 * s) + limb('M' + pt([x - 14 * s, ybot - 16 * s]) + 'L' + pt([x + 14 * s, ybot - 16 * s]), WOOD, 2.2 * s);
    o += L('M' + pt([x - 9 * s, ytop - 10 * s]) + 'L' + pt([x - 9 * s, yp - 14 * s]) + 'M' + pt([x + 9 * s, ytop - 10 * s]) + 'L' + pt([x + 9 * s, yp - 14 * s]), '#2a1a10', 1.2 * s);
    // platform cage
    o += limb('M' + pt([x - 11 * s, yp]) + 'L' + pt([x - 11 * s, yp - 14 * s]) + 'M' + pt([x + 11 * s, yp]) + 'L' + pt([x + 11 * s, yp - 14 * s]), '#7a5030', 1.6 * s);
    o += limb('M' + pt([x - 13 * s, yp - 14 * s]) + 'L' + pt([x + 13 * s, yp - 14 * s]), '#7a5030', 1.8 * s);
    o += L('M' + pt([x - 11 * s, yp - 6 * s]) + 'L' + pt([x + 11 * s, yp - 6 * s]), '#5a3a22', 1.4 * s);
    o += R(x - 14 * s, yp, 28 * s, 4 * s, c.cel('#8a5a32'), 1.4 * s);
    o += P('M' + pt([x - 16 * s, yp - 14 * s]) + 'L' + pt([x, yp - 22 * s]) + 'L' + pt([x + 16 * s, yp - 14 * s]) + 'Z', c.cel(HIDE), 1.4 * s) + L('M' + pt([x - 12 * s, yp - 15 * s]) + 'L' + pt([x + 12 * s, yp - 15 * s]), PAINT_R, 1.4 * s);
    return o;
  }
  function fence(c, x1, x2, y, h, col) {
    col = col || '#7a5030';
    var o = '', posts = '';
    for (var x = x1; x <= x2; x += 18) posts += 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h);
    var rl = 'M' + x1 + ',' + n(y - h * 0.7) + ' L' + x2 + ',' + n(y - h * 0.72) + ' M' + x1 + ',' + n(y - h * 0.3) + ' L' + x2 + ',' + n(y - h * 0.32);
    o += L(posts + rl, OL, 5) + L(rl, lt(col, 0.1), 2) + L(posts, col, 2.6);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var BLUE = ['#4a92d4', '#8cc4ea', '#e4f2f2'];
  function mulSky(c, sx, sy) { return sky(c, BLUE[0], BLUE[1], BLUE[2]) + sun(c, sx, sy, 10); }
  var SCENES = {
    camp_narache: function (c) {
      var o = mulSky(c, 318, 38) + cloud(70, 48, 1.1) + cloud(230, 30, 0.9) + cloud(370, 70, 0.7, 0.85);
      // the world far below the mesa: hazy plains and distant mesa tops
      o += hills(c, 3, 156, 10, '#b4cdb0', 50) + farMesa(20, 158, 70, 34, '#c8a890', '#b4927c', '#a8c098') + farMesa(300, 158, 90, 44, '#c8a890', '#b4927c', '#a8c098');
      o += hills(c, 8, 164, 8, '#a4c090', 60);
      // mesa top ground with a cliff lip at the horizon
      o += P('M-4,150 C60,146 120,150 180,148 C260,146 330,150 404,146 L404,242 L-4,242 Z', c.lg([[0, '#cfb45a'], [0.4, GOLD], [1, GOLD2]]), 2.2);
      o += L('M-4,152 C60,148 120,152 180,150 C260,148 330,152 404,148', '#8a7a3a', 1.4, 0.7);
      o += road(c, 150, 20, 90, '#e8d49a', 0.6);
      o += grass(12, 154, 238, GRASSD, 140, 0.6, 1.8, 1.1) + grass(14, 156, 238, GRASSL, 80, 0.6, 1.6, 1);
      o += taurenTent(c, 236, 150, 0.52, { p1: PAINT_B, p2: PAINT_R }) + taurenTent(c, 150, 150, 0.46, { hide: '#dcc494' });
      o += totem(c, 116, 176, 86, 0.72) + totem(c, 290, 174, 78, 0.66, { wing: PAINT_R, tip: PAINT_Y, cols: [PAINT_B, PAINT_Y, PAINT_R] });
      o += taurenTent(c, 62, 172, 1.0) + taurenTent(c, 350, 170, 1.05, { hide: '#e0c696', p1: PAINT_B, p2: PAINT_Y });
      o += campfire(c, 200, 176, 0.9);
      o += tufts(c, [[18, 206, 1.1], [384, 212, 1.2], [150, 222, 0.8], [262, 230, 0.9], [100, 236, 1.2], [330, 236, 1]]);
      o += rock(c, 36, 240, 40, 16, '#a88a6a') + rock(c, 372, 242, 34, 14, '#a88a6a');
      return o + vignette(c);
    },
    brambleblade_ravine: function (c) {
      var o = sky(c, '#5a98d0', '#96c4e2', '#e6eee2') + cloud(200, 40, 0.9);
      o += hills(c, 5, 152, 12, '#9ab880', 50);
      o += bramble(c, [120, 150], [130, 100], [190, 86], [210, 126], 5, '#7a6a44', null, 3) + bramble(c, [170, 150], [196, 96], [260, 100], [280, 148], 5, '#6e5e3a', null, 9);
      // ravine walls
      o += body(c, 'M-6,-4 L70,-4 C84,30 96,70 104,100 C112,126 120,142 128,158 L-6,158 Z', '#b0784c', F('M60,-4 L80,-4 C92,40 104,90 130,160 L96,160 C92,110 76,50 60,-4 Z', dk('#b0784c', 0.28), 0.85) + L('M-6,30 Q40,36 78,30 M-6,62 Q50,70 92,64 M-6,96 Q60,104 104,98 M-6,128 Q60,134 118,130', dk('#b0784c', 0.2), 1.6, 0.7), 2.2);
      o += F('M-6,-4 L70,-4 C66,4 58,8 48,6 C36,4 28,10 16,8 C8,7 0,10 -6,10 Z', CAP);
      o += body(c, 'M406,-4 L330,-4 C318,30 306,70 298,100 C290,126 282,142 272,158 L406,158 Z', '#a8704a', F('M406,-4 L360,-4 C350,60 334,110 330,160 L406,160 Z', dk('#a8704a', 0.28), 0.85) + L('M406,34 Q360,40 324,34 M406,66 Q350,74 310,68 M406,100 Q340,108 298,102 M406,132 Q340,138 282,134', dk('#a8704a', 0.2), 1.6, 0.7), 2.2);
      o += F('M406,-4 L330,-4 C336,4 344,8 356,6 C368,4 378,10 392,8 C398,7 402,10 406,10 Z', CAP);
      o += ground(c, 150, '#c8aa5a', '#9a7e3a') + road(c, 150, 26, 110, '#d8c08a', 0.5);
      o += grass(21, 152, 238, '#7a6224', 120, 0.6, 1.7, 1.1) + pebbles(23, 160, 236, '#7a5a34', 18);
      o += quilHut(c, 116, 164, 0.8) + quilHut(c, 296, 160, 0.9, '#9a7a50');
      o += brambleClump(c, 196, 156, 0.8, 31);
      // big foreground brambles on both sides
      o += bramble(c, [-10, 180], [30, 150], [60, 176], [80, 214], 9, '#6a5a36', null, 41) + bramble(c, [-10, 230], [20, 196], [50, 206], [58, 240], 7, '#5e5030', null, 43);
      o += bramble(c, [410, 176], [370, 150], [340, 178], [330, 216], 9, '#6a5a36', null, 45) + bramble(c, [410, 226], [382, 200], [356, 212], [352, 242], 7, '#5e5030', null, 47);
      o += bone(150, 200, 14, 0.4, 1) + bone(264, 214, 12, -0.6, 1) + skull(c, 240, 190, 0.8);
      o += tufts(c, [[120, 232, 0.9], [284, 236, 1]], '#a88a3a');
      return o + vignette(c, '#fff4e0', '#1a1008');
    },
    bloodhoof_village: function (c) {
      var o = mulSky(c, 80, 40) + cloud(200, 44, 1.2) + cloud(340, 30, 0.8);
      o += farMesa(250, 150, 120, 52, '#c0a08a', '#a88a76', '#9ab890') + farMesa(-20, 150, 90, 36, '#c0a08a', '#a88a76', '#9ab890');
      o += hills(c, 11, 146, 18, '#94b878', 70) + hills(c, 13, 154, 14, c.lg([[0, '#9ab85a'], [1, '#b4b454']]), 90, 1.8);
      o += ground(c, 160, '#cfb85e', GOLD2);
      o += road(c, 156, 24, 100, '#e0c890', 0.65);
      o += grass(31, 150, 240, '#7a8a2c', 130, 0.6, 1.8, 1.1) + grass(33, 156, 240, GRASSL, 70, 0.6, 1.6, 1) + flowers(35, 170, 236, ['#f4f0e0', '#e8c040'], 26);
      o += taurenTent(c, 132, 154, 0.6, { w: 1.1 }) + taurenTent(c, 280, 152, 0.55, { p1: PAINT_B, p2: PAINT_R });
      o += fence(c, 150, 250, 158, 12);
      o += taurenTent(c, 54, 176, 1.3, { w: 1.15, p1: PAINT_R, p2: PAINT_B }) + taurenTent(c, 352, 174, 1.25, { w: 1.1, hide: '#dcc090', p1: PAINT_B, p2: PAINT_Y });
      o += totem(c, 200, 166, 120, 0.95, { seg: 4 });
      o += well(c, 250, 186, 0.8);
      o += barrel(c, 108, 188, 1, '#8a6a3a') + crate(c, 96, 190, 0.9);
      o += tufts(c, [[20, 214, 1.1], [384, 216, 1.2], [140, 232, 0.9], [300, 234, 0.9]], '#b8a844');
      return o + vignette(c);
    },
    palemane_rock: function (c) {
      var o = mulSky(c, 330, 44) + cloud(100, 36, 1) + cloud(240, 56, 0.7);
      o += hills(c, 41, 148, 14, '#a4c294', 60) + hills(c, 43, 156, 10, '#9ab87a', 80);
      // the outcrop
      var ro = '#b0a48a';
      o += body(c, 'M196,160 C200,130 214,108 236,96 C250,70 276,56 304,62 C326,50 356,56 370,76 C392,84 408,104 408,130 L408,160 Z', ro,
        F('M330,56 C362,58 392,84 408,110 L408,162 L330,162 C340,130 344,90 330,56 Z', dk(ro, 0.3), 0.85) + L('M236,96 C250,110 262,118 280,120 M304,62 C300,82 306,100 322,110 M370,76 C360,92 362,110 376,120 M220,130 C240,136 270,138 300,134', dk(ro, 0.35), 1.6) +
        F('M244,94 C256,78 274,68 296,68 C280,76 266,86 256,100 Z', lt(ro, 0.25), 0.7) + F('M306,66 C318,60 340,60 352,66 C338,66 324,68 314,74 Z', lt(ro, 0.25), 0.7), 2.4);
      o += F('M300,60 C310,54 332,52 346,58 C334,58 318,60 300,64 Z', '#9ab85a');
      o += rock(c, 180, 162, 40, 26, '#a89c82') + rock(c, 30, 158, 50, 28, '#a89c82');
      o += ground(c, 156, '#d4b85e', GOLD2);
      o += grass(51, 156, 238, GRASSD, 130, 0.6, 1.8, 1.1) + grass(53, 158, 238, GRASSL, 60, 0.6, 1.5, 1) + pebbles(55, 164, 236, '#8a7a5a', 14);
      o += gnollTent(c, 250, 164, 0.9) + gnollTent(c, 336, 168, 1.05, '#8a6a46') + gnollTent(c, 96, 160, 0.72, '#a08058');
      o += rack(c, 146, 172, 0.9);
      o += campfire(c, 200, 180, 0.7);
      o += bone(120, 204, 14, 0.3, 1) + bone(286, 216, 16, -0.4, 1.1) + skull(c, 300, 200, 0.9) + skull(c, 70, 214, 0.8);
      o += tufts(c, [[22, 210, 1.1], [384, 222, 1.1], [168, 236, 0.9]]);
      o += rock(c, 364, 242, 44, 18, '#a89c82');
      return o + vignette(c);
    },
    venture_mine: function (c) {
      var o = sky(c, '#6a9ac8', '#a8c8dc', '#e8ecde') + sun(c, 60, 40, 9) + cloud(160, 40, 0.9, 0.8);
      o += hills(c, 61, 150, 14, '#a8c09a', 60);
      o += mineEntrance(c, 80, 156, 1);
      o += ground(c, 154, '#cdb05a', '#a88a3c');
      // churned dirt yard
      o += F('M60,160 C120,152 300,152 380,162 C400,190 380,230 300,238 C200,244 80,240 30,220 C10,200 30,168 60,160 Z', '#a0784a', 0.55);
      o += grass(63, 156, 238, GRASSD, 70, 0.6, 1.8, 1.1, 0, 60) + grass(64, 156, 238, GRASSD, 70, 0.6, 1.8, 1.1, 330, 400);
      o += pebbles(65, 164, 236, '#6a4a2a', 22);
      o += smokestack(c, 346, 164, 96, 1, 3) + smokestack(c, 376, 162, 74, 0.8, 5);
      o += drillRig(c, 270, 172, 1);
      o += rails(96, 162, 150, 238, 3, 12);
      o += minecart(c, 126, 202, 1);
      o += barrel(c, 186, 184, 1, '#6a6a5a') + barrel(c, 200, 188, 1, '#8a4a2a') + crate(c, 170, 190, 1);
      o += E(220, 222, 26, 6, '#2a2420', 0, 0.8) + E(214, 220, 8, 1.4, '#6a6a8a', 0, 0.7);
      o += crate(c, 22, 196, 1.1) + crate(c, 36, 192, 0.9);
      o += tufts(c, [[384, 226, 1.1], [14, 234, 1]]);
      return o + vignette(c, '#fff4e0', '#2a1a08');
    },
    golden_plains: function (c) {
      var o = mulSky(c, 70, 34) + cloud(180, 36, 1.3) + cloud(330, 52, 1) + cloud(40, 80, 0.6, 0.8);
      o += farMesa(260, 146, 80, 38, '#c4a896', '#b0927e', '#a4c09a') + farMesa(30, 146, 60, 26, '#c4a896', '#b0927e', '#a4c09a');
      o += hills(c, 71, 146, 10, '#aac8a0', 50) + hills(c, 73, 152, 8, '#c8c070', 80);
      o += ground(c, 152, '#dcc066', GOLD2);
      o += hills(c, 75, 162, 8, '#c4bc62', 110);
      o += kodoSil(62, 160, 1.15, '#7a7864') + kodoSil(96, 163, 0.95, '#7a7864', true) + kodoSil(128, 158, 0.8, '#868470') + kodoSil(196, 156, 0.6, '#9a9884') + kodoSil(372, 162, 1.2, '#747260', true);
      o += grass(81, 156, 240, GRASSD, 190, 0.5, 2, 1.1) + grass(83, 160, 240, GRASSL, 110, 0.5, 1.8, 1) + grass(85, 170, 240, '#a8b048', 60, 0.8, 1.8, 1.1) + flowers(87, 172, 236, ['#f4f0e0', '#e8c040', '#d86a3a'], 24);
      o += tree(c, 312, 176, 1.15);
      o += rock(c, 60, 196, 34, 16, '#b0a088');
      o += tufts(c, [[20, 216, 1.2], [380, 222, 1.1], [150, 206, 0.8], [240, 232, 1], [110, 238, 1.1]]);
      return o + vignette(c);
    },
    thunder_bluff: function (c) {
      var o = mulSky(c, 360, 30) + cloud(60, 26, 0.9) + cloud(300, 90, 0.8, 0.8) + cloud(140, 110, 0.6, 0.7);
      o += hills(c, 91, 152, 12, '#a8c4a4', 50);
      o += farMesa(330, 156, 70, 64, '#c8a692', '#b0907c', '#9ab894');
      o += bigMesa(c, -30, 172, 156, 112, MESA, CAP, 3);
      o += bigMesa(c, 344, 172, 90, 96, '#b87048', CAP, 7);
      o += bigMesa(c, 198, 172, 132, 124, '#c8804e', CAP, 5);
      // rope bridges between mesa tops
      o += ropeBridge(c, 112, 62, 212, 50, 10, 1) + ropeBridge(c, 318, 50, 352, 78, 6, 0.9);
      // on the tops
      o += taurenTent(c, 20, 62, 0.34) + taurenTent(c, 72, 62, 0.4, { p1: PAINT_B, p2: PAINT_R }) + totem(c, 100, 62, 44, 0.42, { seg: 1 }) + totem(c, 46, 62, 40, 0.38, { seg: 1, wing: PAINT_R, tip: PAINT_Y });
      o += taurenTent(c, 228, 48, 0.36) + taurenTent(c, 284, 48, 0.4, { p1: PAINT_B, p2: PAINT_Y }) + totem(c, 256, 48, 44, 0.5, { seg: 1 });
      o += taurenTent(c, 390, 76, 0.34, { p1: PAINT_B, p2: PAINT_R });
      o += lift(c, 306, 50, 166, 0.9);
      o += ground(c, 158, '#cfb85e', GOLD2);
      o += F('M-4,160 C80,154 160,160 240,156 C300,154 360,160 404,156 L404,166 L-4,166 Z', '#b4a04a', 0.6);
      o += grass(93, 158, 240, GRASSD, 120, 0.6, 1.8, 1.1) + grass(95, 160, 240, GRASSL, 70, 0.6, 1.6, 1);
      o += road(c, 162, 22, 90, '#e0c88e', 0.6);
      o += taurenTent(c, 250, 172, 0.6, { w: 1.1 }) + taurenTent(c, 90, 176, 0.62, { p1: PAINT_B, p2: PAINT_Y });
      o += totem(c, 16, 210, 100, 0.8, { seg: 3 }) + totem(c, 386, 208, 96, 0.78, { seg: 3, wing: PAINT_R, tip: PAINT_Y, cols: [PAINT_B, PAINT_Y, PAINT_R] });
      o += tufts(c, [[150, 232, 0.9], [300, 236, 1], [60, 236, 1]]);
      return o + vignette(c);
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2) + L('M' + n(x - 0.5) + ',' + n(y - 3) + ' L' + n(x - 0.5) + ',' + n(y + 1), OL, 1.2); }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2); }
  function birdFoot(x, y, col, big) {
    var k = big ? 1.25 : 1;
    return L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), OL, 5) + L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), col, 2.2);
  }
  function staff(top, bot, col, w) {
    var d = 'M' + pt(top) + 'L' + pt(bot);
    return limb(d, col || '#6a4424', w || 3.4) + L(d, lt(col || '#6a4424', 0.3), 1, 0.6);
  }
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function spearhead(c, top, bot, len, col) {
    var dx = top[0] - bot[0], dy = top[1] - bot[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
    var tip = [top[0] + ux * len, top[1] + uy * len];
    return P(pd([[top[0] + px * 4.5 - ux * 2, top[1] + py * 4.5 - uy * 2], [top[0] + px * 3 + ux * len * 0.55, top[1] + py * 3 + uy * len * 0.55], tip, [top[0] - px * 3 + ux * len * 0.55, top[1] - py * 3 + uy * len * 0.55], [top[0] - px * 4.5 - ux * 2, top[1] - py * 4.5 - uy * 2]], true), c.cel(col || '#9a948a'), 1.8) +
      L('M' + pt([top[0] + px * 3.5 - ux * 4, top[1] + py * 3.5 - uy * 4]) + 'L' + pt([top[0] - px * 3.5 - ux * 4, top[1] - py * 3.5 - uy * 4]) + 'M' + pt([top[0] + px * 3.5 - ux * 7, top[1] + py * 3.5 - uy * 7]) + 'L' + pt([top[0] - px * 3.5 - ux * 7, top[1] - py * 3.5 - uy * 7]), '#c8a060', 1.6);
  }

  // ---- biped rig (facing left) ----
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += hand(far[far.length - 1], c.cel(o.glove || sk));
    var hipY = o.hipY || 86;
    var toe = o.feet === 'toes' ? toes2 : o.feet === 'hoof' ? hoofs : boot;
    var kneeF = o.digi ? 'M68,' + hipY + ' L76,100 L70,112 L73,116' : 'M68,' + hipY + ' L71,103 L72,113';
    var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
    s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
    s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    if (o.loin) s += body(c, 'M50,' + (hipY - 4) + ' L78,' + (hipY - 4) + ' L76,' + (hipY + 14) + ' L70,' + (hipY + 10) + ' L64,' + (hipY + 18) + ' L58,' + (hipY + 10) + ' L52,' + (hipY + 14) + ' Z', o.loin, L('M54,' + (hipY + 4) + ' L74,' + (hipY + 4), dk(o.loin, 0.35), 1.2));
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,36 L96,36 L96,98 L70,98 C74,78 72,58 68,36 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#d8b048', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 2, hy + 8, 12, 9, c.cel(sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    s += hand(near[near.length - 1], c.cel(o.glove || sk));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- quilboar ----
  function quills(c, cx, cy, mane, tip, k) {
    var s = E(cx, cy, 16 * k, 11 * k, c.cel(mane), 2), list = [[-160, 14], [-140, 20], [-118, 25], [-96, 27], [-74, 26], [-52, 23], [-32, 19], [-12, 14]];
    list.forEach(function (q) {
      var a = q[0] * Math.PI / 180, L0 = q[1] * k, bx = cx + Math.cos(a) * 11 * k, by = cy + Math.sin(a) * 7 * k, b = a + 0.38;
      var tx = bx + Math.cos(b) * L0, ty = by + Math.sin(b) * L0, px = -Math.sin(b) * 3.6 * k, py = Math.cos(b) * 3.6 * k;
      s += P(pd([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true), c.cel(mane), 1.6);
      s += F(pd([[bx + (tx - bx) * 0.55 + px * 0.45, by + (ty - by) * 0.55 + py * 0.45], [tx, ty], [bx + (tx - bx) * 0.55 - px * 0.45, by + (ty - by) * 0.55 - py * 0.45]], true), tip);
    });
    return s;
  }
  function quilHead(c, x, y, o) {
    var sk = o.skin, s = '', mane = o.mane, tk = o.tusk || 1;
    s += P(pd([[x + 3, y - 10], [x + 14, y - 23], [x + 13, y - 5]], true), c.cel(sk), 2) + F(pd([[x + 6, y - 10], [x + 12, y - 18], [x + 11, y - 7]], true), '#8a4a3a', 0.7);
    // crown quills
    [[-4, -12, -0.2], [2, -13, 0.1], [8, -11, 0.4], [12, -6, 0.8]].forEach(function (q) {
      var a = -Math.PI / 2 + q[2], len = 11 * (o.big ? 1.25 : 1), bx = x + q[0], by = y + q[1];
      s += P(pd([[bx - 3, by + 2], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 3, by + 1]], true), c.cel(mane), 1.4) + C(bx + Math.cos(a) * len * 0.85, by + Math.sin(a) * len * 0.85, 1.1, o.tip);
    });
    var d = 'M' + pt([x + 12, y - 4]) + 'C' + pt([x + 10, y - 14]) + ' ' + pt([x - 4, y - 16]) + ' ' + pt([x - 10, y - 9]) + 'L' + pt([x - 19, y - 3]) + 'C' + pt([x - 23, y - 1]) + ' ' + pt([x - 24, y + 8]) + ' ' + pt([x - 20, y + 11]) + 'L' + pt([x - 10, y + 14]) + 'C' + pt([x - 2, y + 17]) + ' ' + pt([x + 8, y + 14]) + ' ' + pt([x + 12, y + 6]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 2, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 6, y + 8]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 2, y - 18]) + 'Z', dk(sk, 0.25), 0.8) +
      F('M' + pt([x - 26, y + 8]) + 'C' + pt([x - 16, y + 12]) + ' ' + pt([x - 4, y + 12]) + ' ' + pt([x + 14, y + 6]) + 'L' + pt([x + 14, y + 20]) + 'L' + pt([x - 26, y + 20]) + 'Z', dk(sk, 0.2), 0.7) +
      (o.paint ? L('M' + pt([x - 4, y - 2]) + 'L' + pt([x + 4, y + 4]) + 'M' + pt([x - 2, y - 8]) + 'L' + pt([x + 6, y - 2]), o.paint, 2) : ''));
    s += E(x - 21, y + 4, 3.6, 5.6, c.cel(o.snout || '#d49a86'), 1.8) + E(x - 22, y + 2, 0.9, 1.4, OL) + E(x - 22, y + 6.5, 0.9, 1.4, OL);
    s += L('M' + pt([x - 15, y - 7]) + 'L' + pt([x - 4, y - 5]), OL, 2.6) + C(x - 9, y - 2.6, 1.8, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 19, y + 11]) + 'C' + pt([x - 14, y + 12]) + ' ' + pt([x - 8, y + 12]) + ' ' + pt([x - 4, y + 10]), OL, 1.4);
    s += P('M' + pt([x - 12, y + 12]) + 'C' + pt([x - 18 - 3 * tk, y + 11]) + ' ' + pt([x - 21 - 3 * tk, y + 4 - 4 * tk]) + ' ' + pt([x - 19 - 2 * tk, y - 2 - 5 * tk]) + 'C' + pt([x - 17, y + 3]) + ' ' + pt([x - 14, y + 6]) + ' ' + pt([x - 8, y + 10]) + 'Z', c.cel('#f4ecd6'), 1.6);
    if (o.crown) {
      s += limb('M' + pt([x - 11, y - 10]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 12, y - 9]), '#5a6a32', 3.4);
      [[-9, -12, -2.1], [-3, -15, -1.8], [3, -16, -1.5], [9, -13, -1.1], [-6, -14, -2.5]].forEach(function (t) {
        var a = t[2], bx = x + t[0], by = y + t[1], len = 12;
        s += P(pd([[bx - 2.6, by + 1], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 2.6, by]], true), c.cel('#ece2c0'), 1.4);
      });
      s += C(x + 1, y - 14, 2.2, '#c83a2a', 1.2);
    }
    return s;
  }
  function quilboar(c, o) {
    var sk = o.skin || '#c28a6a', mane = o.mane || '#6a3a26', tip = o.tip || '#ece0bc', k = o.big ? 1.25 : 1;
    var ho = { skin: sk, mane: mane, tip: tip, eye: o.eye, snout: o.snout, tusk: o.tusk, crown: o.crown, paint: o.paint, big: o.big };
    return biped(c, {
      skin: sk, shirt: sk, pants: dk(sk, 0.05), bareArms: true, feet: 'hoof', boots: '#3a2a22', loin: o.loin || '#7a5030', legW: 11.5, armW: 10.5, belt: o.belt, buckle: '#ece0bc',
      hx: 46, hy: 42, hipY: 86, shadowR: 34, neck: false,
      torsoD: 'M42,58 C42,46 66,40 82,48 L86,68 L80,88 L50,88 L44,74 Z',
      back: function (c) { return quills(c, 72, 50, mane, tip, k) + (o.back ? o.back(c) : ''); },
      head: function (c, x, y) { return quilHead(c, x, y, ho); },
      chest: function (c) { return L('M50,66 Q58,72 68,68', dk(sk, 0.3), 1.4) + (o.chest ? o.chest(c) : ''); },
      near: o.near || [[48, 58], [40, 74], [32, 84]], far: o.far || [[80, 56], [88, 72], [88, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top, tf: o.tf
    });
  }
  function thornBelt(y) { var s = L('M48,' + y + ' L80,' + y, '#4a3a22', 3.4); for (var x = 52; x < 80; x += 7) s += P('M' + (x - 2) + ',' + y + ' L' + x + ',' + (y + 6) + ' L' + (x + 2) + ',' + y + ' Z', '#ece2c0', 1); return s; }
  function boneNeck(x, y) { var s = L('M' + (x - 12) + ',' + y + ' Q' + x + ',' + (y + 10) + ' ' + (x + 12) + ',' + y, '#3a2a1a', 1.2); for (var i = -2; i <= 2; i++) s += P('M' + n(x + i * 4.4 - 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4) + ',' + n(y + 10 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4 + 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' Z', '#f4ecd6', 1); return s; }

  // ---- gnoll ----
  function gnollHead(c, x, y, o) {
    var fur = o.fur, s = '', sp = o.spot;
    s += P('M' + pt([x + 2, y - 14]) + 'L' + pt([x + 8, y - 20]) + 'L' + pt([x + 12, y - 12]) + 'L' + pt([x + 18, y - 14]) + 'L' + pt([x + 17, y - 4]) + 'L' + pt([x + 24, y - 2]) + 'L' + pt([x + 18, y + 6]) + 'L' + pt([x + 22, y + 14]) + 'L' + pt([x + 10, y + 12]) + 'Z', c.cel(o.mane), 2);
    s += P('M' + pt([x + 1, y - 10]) + 'C' + pt([x - 2, y - 20]) + ' ' + pt([x + 4, y - 28]) + ' ' + pt([x + 8, y - 26]) + 'C' + pt([x + 12, y - 22]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 8, y - 8]) + 'Z', c.cel(fur), 2) + F('M' + pt([x + 3, y - 12]) + 'C' + pt([x + 2, y - 18]) + ' ' + pt([x + 5, y - 23]) + ' ' + pt([x + 7, y - 22]) + 'C' + pt([x + 8, y - 18]) + ' ' + pt([x + 8, y - 14]) + ' ' + pt([x + 6, y - 10]) + 'Z', '#8a5a4a', 0.7);
    var d = 'M' + pt([x + 11, y - 4]) + 'C' + pt([x + 9, y - 14]) + ' ' + pt([x - 4, y - 15]) + ' ' + pt([x - 9, y - 9]) + 'L' + pt([x - 22, y - 4]) + 'C' + pt([x - 27, y - 3]) + ' ' + pt([x - 28, y + 3]) + ' ' + pt([x - 25, y + 5]) + 'L' + pt([x - 13, y + 12]) + 'C' + pt([x - 5, y + 15]) + ' ' + pt([x + 6, y + 14]) + ' ' + pt([x + 11, y + 6]) + 'Z';
    s += body(c, d, fur, F('M' + pt([x + 2, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 6, y + 8]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 2, y - 18]) + 'Z', dk(fur, 0.25), 0.8) +
      E(x - 2, y - 8, 2.4, 1.8, sp, 0, 0.8) + E(x + 4, y + 2, 2, 1.6, sp, 0, 0.8) + E(x - 14, y - 4, 1.6, 1.2, sp, 0, 0.8) + F('M' + pt([x - 22, y - 5]) + 'C' + pt([x - 18, y - 6]) + ' ' + pt([x - 14, y - 8]) + ' ' + pt([x - 10, y - 9]) + 'L' + pt([x - 10, y - 4]) + 'Z', dk(fur, 0.35), 0.7));
    s += E(x - 25.5, y - 1.5, 3, 2.4, '#2a1a14', 1);
    s += L('M' + pt([x - 13, y - 8]) + 'L' + pt([x - 3, y - 6]), OL, 2.4) + C(x - 7, y - 3.6, 1.7, o.eye || '#ff5a2a', 1);
    s += L('M' + pt([x - 25, y + 5]) + 'L' + pt([x - 10, y + 9]), OL, 1.5);
    s += P('M' + pt([x - 22, y + 5]) + 'L' + pt([x - 21, y + 1.5]) + 'L' + pt([x - 19.5, y + 5.5]) + 'Z', '#f4ecd6', 0.8) + P('M' + pt([x - 16, y + 7]) + 'L' + pt([x - 15, y + 3.5]) + 'L' + pt([x - 13.5, y + 7.6]) + 'Z', '#f4ecd6', 0.8);
    return s;
  }
  function gnoll(c, o) {
    var fur = o.fur || '#dcd0b0', sp = o.spot || '#8a7a5a', mane = o.mane || '#7a6a4e';
    return biped(c, {
      skin: fur, shirt: fur, pants: fur, bareArms: true, feet: 'toes', boots: dk(fur, 0.2), digi: true, legW: 10, armW: 9, loin: o.loin || '#7a5a3a', belt: o.belt,
      hx: 44, hy: 40, hipY: 84, shadowR: 32,
      torsoD: 'M44,56 C46,46 70,42 82,50 L82,70 L78,86 L50,86 L46,72 Z',
      back: o.back,
      head: function (c, x, y) { return gnollHead(c, x, y, { fur: fur, spot: sp, mane: mane, eye: o.eye }); },
      chest: function (c) { return E(56, 62, 3, 2.2, sp, 0, 0.8) + E(70, 70, 3, 2.4, sp, 0, 0.8) + E(62, 78, 2.4, 2, sp, 0, 0.8) + E(76, 58, 2.4, 2, sp, 0, 0.8) + (o.chest ? o.chest(c) : ''); },
      near: o.near || [[48, 58], [40, 74], [32, 86]], far: o.far || [[80, 56], [88, 72], [88, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top, tf: o.tf
    });
  }

  // ---- goblin ----
  function goblinHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    // big ear swept back
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    // far ear peeking
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    if (o.goggles) s += R(x - 10, y - 14, 18, 5, '#5a3a22', 1.4) + C(x - 5, y - 11.5, 3, '#8ad0e0', 1.4);
    s += L('M' + pt([x - 11, y - 8.5]) + 'L' + pt([x - 1, y - 7.5]), OL, 2);
    s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += limb('M' + pt([x - 6, y + 11]) + 'L' + pt([x - 16, y + 13]), '#6a4424', 2) + C(x - 17, y + 13.2, 1.6, '#ff7a2a') + C(x - 18, y + 8, 2.4, '#b8b4b0', 0, 0.6) + C(x - 20, y + 3, 3, '#c8c4c0', 0, 0.45);
    // hard hat
    var hc = o.hat || '#e8b830';
    s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
    s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4), 2);
    if (o.lamp !== false) s += C(x - 11, y - 14, 7, glow(c, '#fff0a0', 0.6)) + R(x - 14, y - 17, 5, 6, c.cel('#6a6460'), 1.2) + C(x - 14, y - 14, 1.8, '#fff6c0', 0.8);
    return s;
  }
  function goblin(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, lamp: o.lamp, goggles: o.goggles, cigar: o.cigar };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', glove: o.glove,
      hx: 56, hy: 32, hipY: 86, legW: 10, armW: 8.5, shadowR: 30,
      torsoD: 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(goblinHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(0.84, 64, 122)
    });
  }
  function pickaxe(c, p) {
    var top = [p[0] - 8, p[1] - 38], bot = [p[0] + 6, p[1] + 16];
    return staff(top, bot, '#7a5030', 3.2) + P('M' + pt([top[0] - 20, top[1] + 10]) + 'Q' + pt([top[0] - 6, top[1] - 8]) + ' ' + pt([top[0] + 18, top[1] - 2]) + 'L' + pt([top[0] + 16, top[1] + 3]) + 'Q' + pt([top[0] - 4, top[1] - 2]) + ' ' + pt([top[0] - 17, top[1] + 12]) + 'Z', c.cel('#9a9690'), 1.8) + R(top[0] - 3, top[1] - 3, 6, 7, c.cel('#6a6460'), 1.4);
  }

  // ---- quadrupeds ----
  function wolf(c, o) {
    var col = o.col, bel = o.belly || lt(col, 0.35), mane = o.mane || dk(col, 0.15), s = shadow(c, 62, 48);
    var fl = dk(col, 0.22);
    s += limb('M58,88 L60,104 L56,116', fl, 8.5) + paw(56, 121, dk(col, 0.35)) + limb('M100,84 L108,98 L102,110 L102,116', fl, 8.5) + paw(102, 121, dk(col, 0.35));
    // bushy tail
    s += body(c, 'M104,66 C116,64 124,74 124,88 C124,96 120,102 116,104 C116,96 114,88 108,82 C104,78 100,74 104,66 Z', col, F('M114,84 C120,90 120,98 116,104 L126,104 L126,84 Z', dk(col, 0.3), 0.8) + F('M116,96 C118,100 118,102 116,104 L124,104 L124,94 Z', bel, 0.9), 2.2);
    var bd = 'M40,68 C44,56 70,54 94,58 C108,60 114,70 110,82 C106,92 92,94 76,93 C58,94 46,90 40,82 C38,76 38,72 40,68 Z';
    s += body(c, bd, col, F('M30,84 C52,96 92,96 118,84 L118,104 L30,104 Z', bel, 0.85) + F('M56,58 C76,54 98,56 106,64 C88,60 72,60 56,62 Z', lt(col, 0.2), 0.5) + F('M70,56 C82,54 96,56 104,62 L104,72 C92,66 80,64 70,66 Z', dk(col, 0.2), 0.6) + (o.scars ? L('M72,66 L84,76 M78,64 L90,74', lt(col, 0.4), 1.6) : ''));
    // neck ruff
    s += P('M36,52 L44,46 L46,52 L54,48 L54,56 L60,56 L56,64 L62,70 L54,74 L58,82 L48,82 L46,90 L40,82 Z', c.cel(mane), 2);
    // head
    s += P('M34,56 L32,38 L44,52 Z', c.cel(dk(col, 0.1)), 2);
    var hd = 'M46,58 C42,50 30,48 24,54 L10,64 C5,66 3,72 6,76 L16,80 C22,86 36,86 44,80 C50,74 50,64 46,58 Z';
    s += body(c, hd, col, F('M36,50 L56,50 L56,92 L40,92 C48,80 46,64 36,50 Z', dk(col, 0.25), 0.7) + F('M6,74 C14,80 26,84 40,82 L40,92 L4,92 Z', bel, 0.85) + F('M10,64 C16,60 22,57 30,56 L28,62 C20,62 14,64 10,66 Z', dk(col, 0.25), 0.7));
    s += P('M40,54 L42,34 L52,54 Z', c.cel(col), 2) + P('M43,50 L44,40 L48,51 Z', '#5a3a30', 0);
    s += E(5.5, 69, 3.2, 2.6, '#1a1210', 1.2);
    s += L('M16,60 L27,61', OL, 2.2) + E(21.5, 63.5, 2.4, 1.7, o.eye || '#f0c040', 1) + E(21, 63.5, 0.7, 1.3, OL);
    s += L('M6,76 L22,78', OL, 1.4) + P('M10,76.4 L11,80 L12.5,76.8 Z', '#fff', 0.8) + P('M17,77.4 L18,80.6 L19.5,77.8 Z', '#fff', 0.8);
    s += limb('M48,84 L44,102 L44,116', col, 9.5) + paw(44, 121, dk(col, 0.35)) + limb('M92,82 L100,96 L94,108 L94,116', col, 9.5) + paw(94, 121, dk(col, 0.35));
    return s;
  }
  // ---- longneck: an emu-like flightless runner, shaggy drooping plumage, long bare neck, short flat beak, thick scaly legs ----
  function plainstrider(c, o) {
    var col = o.col, wing = o.wing, leg = o.leg || '#c8a070', s = shadow(c, 62, 30), k = o.big ? 1.12 : 1;
    var scale = function (x0, y0, x1, y1) { var d = ''; for (var i = 1; i < 5; i++) { var t = i / 5; d += 'M' + pt([x0 + (x1 - x0) * t - 2.4, y0 + (y1 - y0) * t]) + 'l4.8,0'; } return L(d, dk(leg, 0.4), 1, 0.8); };
    // far leg
    s += limb('M74,84 L80,100 L74,116', dk(leg, 0.2), 5.6) + scale(80, 100, 74, 116) + birdFoot(74, 121, dk(leg, 0.2), o.big);
    // shaggy drooping tail tuft
    s += body(c, 'M92,62 C104,60 114,66 118,76 L114,78 L117,86 L110,84 L110,92 L104,86 L100,92 L98,82 Z', o.tail || dk(wing, 0.1), L('M98,68 C106,70 110,76 112,84 M96,72 C102,76 104,82 104,88', dk(o.tail || wing, 0.35), 1.1), 2);
    // body: a rounded mound of loose hanging feathers with a ragged hem
    var hem = '', xs = [100, 94, 88, 82, 76, 70, 64, 58, 52, 46, 40];
    xs.forEach(function (x, i) { hem += 'L' + pt([x, (i % 2 ? 84 : 90) + (i === 0 || i === xs.length - 1 ? -6 : 0)]); });
    var bd = 'M40,66 C40,50 62,42 82,44 C98,46 106,58 102,76' + hem + 'C38,78 40,72 40,66 Z';
    var fs = '';
    [[50, 56, 46, 74], [58, 52, 54, 78], [66, 50, 64, 80], [74, 50, 74, 80], [82, 50, 84, 78], [90, 54, 94, 74]].forEach(function (f) { fs += 'M' + pt([f[0], f[1]]) + 'Q' + pt([f[0] - 2, (f[1] + f[3]) / 2]) + ' ' + pt([f[2], f[3]]); });
    s += body(c, bd, col, F('M38,74 C52,84 86,86 104,72 L104,94 L38,94 Z', dk(col, 0.22), 0.8) + L(fs, dk(col, 0.32), 1.2) + F('M50,50 C60,44 76,44 86,48 C74,48 62,50 52,56 Z', lt(col, 0.25), 0.6) + F('M60,56 C70,54 84,56 92,64 C82,64 70,64 60,62 Z', wing, 0.7), 2.4);
    // shaggy ruff where the neck meets the body
    s += P('M46,58 L40,52 L46,52 L42,44 L50,48 L50,40 L56,48 L60,44 L60,56 Z', c.cel(dk(col, 0.08)), 1.6);
    // long bare neck
    var nk = 'M52,56 C44,50 40,38 40,26';
    s += L(nk, OL, 10.5) + L(nk, o.neck || lt(col, 0.18), 6.6) + L('M50,52 C44,46 42,38 42,28', lt(o.neck || col, 0.3), 2, 0.6);
    // head: small and rounded, short flat beak, big eye under a heavy brow
    var hx = o.hx || 40, hy = o.hy || 21;
    if (o.crest) s += L('M' + pt([hx + 2, hy - 7]) + 'q2,-6 6,-7 M' + pt([hx + 4, hy - 6]) + 'q4,-4 8,-3 M' + pt([hx, hy - 7]) + 'q0,-6 3,-9', OL, 3) + L('M' + pt([hx + 2, hy - 7]) + 'q2,-6 6,-7 M' + pt([hx + 4, hy - 6]) + 'q4,-4 8,-3 M' + pt([hx, hy - 7]) + 'q0,-6 3,-9', o.crest, 1.4);
    s += body(c, 'M' + pt([hx - 7, hy - 1]) + 'C' + pt([hx - 6, hy - 8]) + ' ' + pt([hx + 6, hy - 9]) + ' ' + pt([hx + 8, hy - 1]) + 'C' + pt([hx + 8, hy + 5]) + ' ' + pt([hx + 3, hy + 8]) + ' ' + pt([hx - 2, hy + 8]) + 'C' + pt([hx - 6, hy + 8]) + ' ' + pt([hx - 8, hy + 4]) + ' ' + pt([hx - 7, hy - 1]) + 'Z', o.neck || lt(col, 0.18), F('M' + pt([hx + 2, hy - 10]) + 'L' + pt([hx + 10, hy - 10]) + 'L' + pt([hx + 10, hy + 10]) + 'L' + pt([hx + 2, hy + 10]) + 'Z', dk(col, 0.22), 0.7), 2);
    s += P('M' + pt([hx - 6, hy - 1]) + 'C' + pt([hx - 12, hy - 2]) + ' ' + pt([hx - 17, hy]) + ' ' + pt([hx - 18, hy + 3]) + 'C' + pt([hx - 16, hy + 6]) + ' ' + pt([hx - 10, hy + 6]) + ' ' + pt([hx - 5, hy + 5]) + 'Z', c.cel(o.beak || '#e0a848'), 1.8) + L('M' + pt([hx - 5, hy + 2.4]) + 'L' + pt([hx - 16, hy + 3.2]), OL, 1.1);
    s += C(hx - 1, hy - 1, 2.6, '#fff8e0', 1.1) + C(hx - 1.6, hy - 1, 1.3, OL) + L('M' + pt([hx - 5, hy - 4]) + 'L' + pt([hx + 3, hy - 4.6]), OL, 1.8);
    // near leg
    s += limb('M60,84 L66,100 L58,116', leg, 6.2) + scale(66, 100, 58, 116) + birdFoot(58, 121, leg, o.big);
    s += E(62, 82, 8, 5, c.cel(dk(col, 0.1)), 1.8);
    return s;
  }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // ---- dustback: a huge horned lizard-beast with an armoured, scaled back (ankylosaur-like), small brow horns and a clubbed tail ----
  function kodoAncient(c) {
    var col = '#968c80', dcol = dk(col, 0.3), bone = '#ece2c8', arm = '#7a6e62', s = shadow(c, 64, 60);
    var legF = dk(col, 0.22);
    var foot = function (x, cc) { return P('M' + n(x - 9) + ',116 L' + n(x + 9) + ',116 L' + n(x + 10) + ',123 L' + n(x - 10) + ',123 Z', c.cel(cc), 2) + E(x - 6, 122, 2.4, 1.6, bone, 1) + E(x - 1, 122.4, 2.4, 1.6, bone, 1) + E(x + 4, 122.4, 2.4, 1.6, bone, 1); };
    s += limb('M50,90 L48,116', legF, 15) + foot(48, legF) + limb('M104,88 L108,116', legF, 15) + foot(108, legF);
    // thick tail ending in a bony club
    var bd = 'M30,58 C36,34 64,24 92,28 C114,32 126,48 125,70 C124,90 112,100 94,100 C74,102 54,102 40,98 C28,94 24,78 30,58 Z';
    var wr = L('M58,70 C60,78 60,86 58,94 M76,72 C78,80 78,88 76,96 M94,70 C96,78 96,86 94,94', dcol, 1.4, 0.7);
    s += body(c, bd, col, F('M22,82 C50,100 96,102 128,84 L128,106 L22,106 Z', dcol, 0.85) + wr);
    s += limb('M112,78 C120,82 124,90 122,100', col, 7) + body(c, 'M114,100 C114,94 122,92 126,96 C129,100 127,108 121,109 C116,109 114,105 114,100 Z', arm, E(121, 99, 2, 1.4, lt(arm, 0.4), 0, 0.8) + P('M114,101 L110,99 L114,97 Z', bone, 0), 2);
    // armoured carapace over the back: rows of scutes, a spiked rim along the flank
    var cp = 'M32,60 C36,36 64,24 92,27 C114,30 126,46 125,66 C110,62 90,60 70,62 C56,63 44,64 32,66 Z';
    var sc = '';
    [[46, 50, 7, 5], [60, 42, 8, 5.4], [76, 38, 8.4, 5.6], [92, 38, 8.4, 5.6], [108, 44, 7.6, 5.2], [118, 56, 5.6, 4.4], [52, 60, 6, 3.4], [68, 56, 7, 3.8], [86, 54, 7.4, 3.8], [104, 56, 6.6, 3.6]].forEach(function (q) { sc += L(ellD(q[0], q[1], q[2], q[3]), OL, 1.4) + C(q[0], q[1] - 0.6, q[3] * 0.34, lt(arm, 0.35), 0, 0.9); });
    s += body(c, cp, arm, sc + F('M92,24 L128,24 L128,68 L100,64 C112,52 108,36 92,24 Z', dk(arm, 0.28), 0.7) + F('M40,44 C58,30 86,26 108,34 C88,32 62,36 46,50 Z', lt(arm, 0.2), 0.6), 2.2);
    [[40, 65], [54, 64], [68, 62], [82, 61], [96, 61], [110, 63], [121, 66]].forEach(function (g, i) { s += P('M' + (g[0] - 5) + ',' + (g[1] - 1) + ' L' + (g[0] - 1) + ',' + (g[1] + 8 - (i % 2) * 2) + ' L' + (g[0] + 5) + ',' + (g[1] - 1) + ' Z', c.cel(bone), 1.5); });
    // far brow horn
    s += P('M37,50 C39,44 42,40 46,37 C45,42 44,46 43,52 Z', c.cel(dk(bone, 0.15)), 1.8);
    // long, low reptile head
    var hd = 'M46,50 C36,44 20,46 12,54 L3,64 C0,70 1,80 7,83 L24,88 C34,90 44,86 48,78 C52,70 52,58 46,50 Z';
    s += body(c, hd, col, F('M34,42 L56,42 L56,94 L38,94 C48,84 46,60 34,42 Z', dcol, 0.75) + F('M3,78 C10,86 28,90 46,84 L46,96 L1,96 Z', dcol, 0.8) + L('M16,62 C20,64 22,68 22,72', dcol, 1.4, 0.8));
    // small armour plates over the brow and snout
    s += body(c, 'M12,56 C18,48 32,44 42,50 L38,58 C30,55 20,57 14,62 Z', arm, L(ellD(22, 54, 4, 2.4) + ellD(33, 51, 4, 2.4), OL, 1.1) + F('M30,44 L46,44 L46,60 L34,60 Z', dk(arm, 0.25), 0.8), 1.8);
    // near brow horn: short, swept back
    s += P('M27,52 C29,45 33,40 39,36 C38,42 37,47 36,52 Z', c.cel(bone), 2) + L('M30,46 L35,47', dk(bone, 0.3), 1.1);
    s += L('M12,66 L24,66', OL, 3) + C(18, 69, 2, '#ffd040', 1.2);
    s += E(4, 70, 1.4, 2, OL);
    s += L('M3,78 C12,82 24,84 36,82', OL, 1.4);
    s += limb('M40,90 L38,116', col, 16) + foot(38, col) + limb('M92,90 L94,116', col, 16) + foot(94, col);
    return s;
  }
  function bigCat(c, o) {
    var col = o.col, dcol = dk(col, 0.3), bel = '#f0dcb0', s = shadow(c, 64, 52);
    s += limb('M58,88 L62,104 L58,116', dk(col, 0.22), 9.5) + paw(58, 121, dk(col, 0.35)) + limb('M104,86 L112,100 L106,116', dk(col, 0.22), 9.5) + paw(106, 121, dk(col, 0.35));
    s += L('M110,70 C126,68 126,50 116,42', OL, 8) + L('M110,70 C126,68 126,50 116,42', col, 4.4) + C(116, 42, 3.6, c.cel(dk(col, 0.35)), 1.6);
    var bd = 'M40,66 C44,52 70,48 94,52 C112,54 118,68 114,82 C110,94 92,96 74,95 C56,96 44,92 40,84 C38,76 38,72 40,66 Z';
    s += body(c, bd, col, F('M30,86 C52,98 92,98 120,86 L120,104 L30,104 Z', bel, 0.9) + F('M60,54 C80,50 100,52 110,62 C90,58 72,58 60,60 Z', lt(col, 0.2), 0.5) + F('M62,52 C80,48 100,50 112,58 L112,64 C96,58 78,56 62,58 Z', dk(col, 0.18), 0.6) +
      L('M70,62 L84,76 M76,60 L90,74 M82,58 L94,70', '#f4e2c0', 2) + L('M70,62 L84,76 M76,60 L90,74 M82,58 L94,70', '#8a3a2a', 0.8));
    // head
    s += P('M32,60 L32,44 L42,54 Z', c.cel(col), 2) + P('M34,56 L34,50 L39,54 Z', '#5a3020', 0);
    var hd = 'M50,60 C44,50 28,50 20,58 C16,62 14,64 10,66 C4,68 2,76 4,80 C6,86 12,88 18,88 C26,93 40,92 48,84 C54,76 55,66 50,60 Z';
    s += body(c, hd, col, F('M36,52 L56,52 L56,94 L40,94 C48,82 46,64 36,52 Z', dk(col, 0.25), 0.7) + F('M4,78 C10,86 20,90 32,90 L32,96 L2,96 Z', bel, 0.9) +
      L('M26,58 L36,72', '#f4e2c0', 2) + L('M26,58 L36,72', '#8a3a2a', 0.8));
    // torn ear
    s += P('M44,56 L48,40 L51,46 L54,44 L56,58 Z', c.cel(col), 2) + P('M47,54 L48,46 L52,55 Z', '#5a3020', 0);
    s += P('M4,76 C4,70 12,68 18,72 C22,76 22,84 16,86 C10,88 4,84 4,76 Z', bel, 1.6);
    s += P('M18,86 L24,93 L28,87 L33,94 L37,88 L42,92 L44,84 Z', bel, 1.6);
    s += P('M2,72 L8,70 L7,76 Z', '#3a2014', 1.2);
    s += L('M6,80 Q10,83 14,80', OL, 1.4) + P('M8,81 L9,86 L10.5,81.5 Z', '#fff', 0.8);
    s += L('M18,64 L28,65.5', OL, 2.4) + E(22, 67.5, 2.4, 1.8, '#e8d040', 1) + E(21.5, 67.5, 0.7, 1.4, OL);
    s += L('M12,78 l-10,-3 M12,80 l-10,2', '#ffffff', 0.8);
    s += limb('M48,84 L44,104 L44,116', col, 11) + paw(44, 121, dk(col, 0.35)) + limb('M96,84 L102,100 L98,116', col, 11) + paw(98, 121, dk(col, 0.35));
    return s;
  }
  function armoredBoar(c, o) {
    var col = o.col, mane = o.mane, pl = o.plate, s = shadow(c, 64, 50);
    var legFar = dk(col, 0.25);
    s += limb('M54,92 L56,106 L55,116', legFar, 10) + hoofs(55, 122) + limb('M104,90 L108,104 L106,116', legFar, 10) + hoofs(106, 122);
    s += L('M114,74 C123,68 127,78 120,81 C115,82 117,74 122,74', OL, 4.5) + L('M114,74 C123,68 127,78 120,81 C115,82 117,74 122,74', col, 2);
    var bd = 'M34,70 C38,56 64,50 90,54 C110,58 120,70 116,86 C112,98 94,100 74,99 C54,100 40,98 34,90 C30,84 30,76 34,70 Z';
    s += body(c, bd, col, F('M24,88 C50,102 90,102 122,90 L122,104 L24,104 Z', dk(col, 0.3), 0.85) + F('M44,60 C64,54 94,54 110,62 C92,60 64,60 44,68 Z', lt(col, 0.2), 0.5));
    // armour plates along the back
    [[46, 60, 12], [60, 55, 13], [75, 53, 14], [90, 55, 13], [104, 61, 11]].forEach(function (g) {
      var d = 'M' + (g[0] - g[2]) + ',' + (g[1] + 8) + ' C' + (g[0] - g[2]) + ',' + (g[1] - 4) + ' ' + (g[0] + g[2]) + ',' + (g[1] - 6) + ' ' + (g[0] + g[2]) + ',' + (g[1] + 6) + ' L' + (g[0] + g[2] - 2) + ',' + (g[1] + 12) + ' L' + (g[0] - g[2] + 2) + ',' + (g[1] + 13) + ' Z';
      s += body(c, d, pl, F('M' + g[0] + ',' + (g[1] - 6) + ' L' + (g[0] + g[2] + 2) + ',' + (g[1] - 6) + ' L' + (g[0] + g[2] + 2) + ',' + (g[1] + 14) + ' L' + g[0] + ',' + (g[1] + 14) + ' Z', dk(pl, 0.3), 0.8), 2) + P('M' + (g[0] - 3) + ',' + (g[1] - 2) + ' L' + g[0] + ',' + (g[1] - 10) + ' L' + (g[0] + 3) + ',' + (g[1] - 2) + ' Z', c.cel('#e8dcc0'), 1.4);
    });
    var hd = 'M50,58 C40,57 28,64 22,72 L14,80 C10,84 10,92 14,95 L24,97 C32,99 44,97 52,90 C56,82 56,66 50,58 Z';
    s += body(c, hd, col, F('M14,92 C26,96 42,96 54,86 L56,100 L10,100 Z', dk(col, 0.3), 0.85) + F('M30,66 C38,60 46,58 50,60 C44,62 36,66 30,72 Z', lt(col, 0.2), 0.5));
    // head plate
    s += body(c, 'M24,70 C30,60 42,56 52,60 L50,70 C42,68 34,70 28,76 Z', pl, '', 2);
    s += P('M42,60 L46,46 L53,60 Z', c.cel(mane), 2) + P('M45,58 L47,51 L50,58 Z', '#c07a6a', 0);
    s += E(13, 88, 4.6, 7, c.cel(o.snout || '#b88a7a'), 2) + E(12, 86, 1, 1.6, OL) + E(12, 91, 1, 1.6, OL);
    s += C(32, 76, 2.3, o.eye || '#ffb030', 1.2) + L('M26,72 L37,74', OL, 2.2);
    var tk = 2.2;
    s += P('M' + pt([24, 93]) + 'C' + pt([22 - 4 * tk, 92]) + ' ' + pt([19 - 4 * tk, 86 - 4 * tk]) + ' ' + pt([21 - 2 * tk, 80 - 6 * tk]) + 'C' + pt([22, 86]) + ' ' + pt([24, 88]) + ' ' + pt([29, 90]) + 'Z', c.cel('#f4ecd6'), 1.8);
    s += L('M16,95 C22,97 30,96 36,93', OL, 1.4);
    s += limb('M44,90 L42,106 L42,116', col, 11) + hoofs(42, 122) + limb('M96,88 L100,104 L98,116', col, 11) + hoofs(98, 122);
    return s;
  }
  function hawk(c, o) {
    var br = o.col || '#8a5a32', wg = o.wing || '#6e4426', ch = o.chest || '#ecd8aa', tipc = o.tipc || '#3a2618', leg = '#e0b040', s = shadow(c, 64, 34);
    var fw = 'M74,58 C84,40 100,22 124,6 C122,16 118,22 120,28 C114,32 112,38 114,44 C106,46 102,52 102,58 C94,60 88,66 84,72 Z';
    s += body(c, fw, dk(wg, 0.12), F('M104,0 L128,0 L128,50 L110,50 C112,34 110,18 104,0 Z', tipc, 0.9) + L('M80,62 C92,46 104,32 118,16', dk(wg, 0.4), 1.2), 2.2);
    s += body(c, 'M82,88 L112,110 L108,114 L102,109 L100,117 L93,111 L88,116 L80,100 Z', dk(br, 0.1), L('M86,96 L104,112 M84,100 L94,112', dk(br, 0.4), 1.2), 2);
    var nw = 'M60,62 C48,48 28,28 4,14 C8,20 12,24 10,28 C16,32 18,36 16,42 C24,44 28,50 28,54 C36,58 42,66 50,74 Z';
    s += body(c, nw, wg, F('M-2,8 L20,8 C22,22 24,40 22,56 L-2,56 Z', tipc, 0.9) + L('M54,64 C42,52 28,40 12,24 M48,68 C40,60 32,52 22,44', dk(wg, 0.4), 1.2) + F('M40,46 C48,52 54,58 58,64 L52,66 C46,60 40,54 34,50 Z', lt(wg, 0.2), 0.6), 2.2);
    s += limb('M76,92 L80,110 L79,117', leg, 3.6) + L('M79,117 L72,121 M79,117 L76,122 M79,117 L84,121', OL, 2.6);
    var bd = 'M46,62 C48,48 64,42 78,48 C92,54 94,74 88,88 C82,100 64,102 54,94 C46,86 44,74 46,62 Z';
    s += body(c, bd, br, F('M44,64 C50,56 58,54 62,60 C64,74 62,90 56,98 C48,92 42,78 44,64 Z', ch, 0.95) + L('M48,70 l4,3 l4,-3 M48,78 l4,3 l4,-3 M50,86 l4,3 l4,-3', dk(ch, 0.35), 1.1) + F('M72,46 C86,50 94,64 92,80 L100,80 L100,40 Z', dk(br, 0.25), 0.8));
    s += limb('M58,94 L56,110 L55,117', leg, 3.8) + L('M55,117 L47,121 M55,117 L51,122.5 M55,117 L60,121', OL, 2.8);
    // head
    var hx = 40, hy = 38;
    s += body(c, 'M' + pt([hx + 12, hy + 14]) + 'C' + pt([hx + 6, hy + 12]) + ' ' + pt([hx - 4, hy + 8]) + ' ' + pt([hx - 7, hy + 1]) + 'C' + pt([hx - 9, hy - 8]) + ' ' + pt([hx - 2, hy - 14]) + ' ' + pt([hx + 6, hy - 12]) + 'C' + pt([hx + 14, hy - 10]) + ' ' + pt([hx + 16, hy]) + ' ' + pt([hx + 16, hy + 8]) + 'Z', o.head || ch,
      F('M' + pt([hx + 6, hy - 16]) + 'L' + pt([hx + 20, hy - 16]) + 'L' + pt([hx + 20, hy + 16]) + 'L' + pt([hx + 8, hy + 16]) + 'Z', dk(o.head || ch, 0.25), 0.8) + P('M' + pt([hx + 4, hy - 12]) + 'L' + pt([hx + 18, hy - 16]) + 'L' + pt([hx + 12, hy - 8]) + 'L' + pt([hx + 20, hy - 6]) + 'L' + pt([hx + 14, hy]) + 'Z', dk(br, 0.1), 0), 2);
    s += P('M' + pt([hx - 6, hy - 3]) + 'C' + pt([hx - 12, hy - 5]) + ' ' + pt([hx - 18, hy - 2]) + ' ' + pt([hx - 19, hy + 5]) + 'C' + pt([hx - 18, hy + 8]) + ' ' + pt([hx - 16, hy + 8]) + ' ' + pt([hx - 15, hy + 5]) + 'C' + pt([hx - 12, hy + 3]) + ' ' + pt([hx - 9, hy + 4]) + ' ' + pt([hx - 5, hy + 5]) + 'Z', c.cel('#e8b840'), 1.8);
    s += P('M' + pt([hx - 18, hy + 3]) + 'C' + pt([hx - 19, hy + 6]) + ' ' + pt([hx - 18, hy + 8]) + ' ' + pt([hx - 16, hy + 8]) + 'L' + pt([hx - 15.5, hy + 5]) + 'Z', '#2a1a14', 0);
    s += L('M' + pt([hx - 8, hy - 6]) + 'L' + pt([hx + 2, hy - 5]), OL, 2.6) + C(hx - 3, hy - 2.5, 1.9, '#ffb030', 1) + C(hx - 3.5, hy - 2.5, 0.8, OL);
    return s;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    plainstrider: function (c) { return G(plainstrider(c, { col: '#8a6e4e', wing: '#6a5038', leg: '#8a7a6a', tail: '#5a4632', beak: '#3a3430', neck: '#9aa0b0' }), at(0.94, 64, 122)); },
    adult_plainstrider: function (c) { return G(plainstrider(c, { col: '#5e4a3a', wing: '#4a3a2c', leg: '#7a6e62', tail: '#3e3028', crest: '#2e2620', beak: '#2e2a26', neck: '#7a8ea8', big: true }), at(1.08, 64, 122)); },
    prairie_wolf: function (c) { return G(wolf(c, { col: '#a88c68', belly: '#e0d0b0', mane: '#8a7050' }), at(0.9, 64, 122)); },
    prairie_stalker: function (c) { return wolf(c, { col: '#5e5044', belly: '#9a8a74', mane: '#3e342c', eye: '#ffd02a', scars: true }); },
    battleboar: function (c) { return G(armoredBoar(c, { col: '#8a6a52', mane: '#4a3428', plate: '#6e6258' }), at(0.98, 64, 122)); },
    swoop: function (c) { return hawk(c, { col: '#8a5a32', wing: '#74482a', chest: '#ecd8aa', head: '#f0e4c4' }); },
    bristleback_quilboar: function (c) {
      return quilboar(c, {
        skin: '#c48c6c', mane: '#6a3a26', loin: '#7a5030',
        chest: function () { return L('M46,56 L80,80', '#5a3a22', 3); },
        top: function () { return thornBelt(82); },
        wNear: function (c, p) { var top = [p[0] - 12, p[1] - 62], bot = [p[0] + 10, p[1] + 32]; return staff(top, bot, '#7a5030') + spearhead(c, top, bot, 14) + feathers(top[0] + 4, top[1] + 18, ['#c83a2a', '#ece0bc'], 0.6, 0.2); }
      });
    },
    bristleback_shaman: function (c) {
      return quilboar(c, {
        skin: '#b88064', mane: '#4a3a2a', loin: '#5a6a3a', paint: '#3a9ac8', tip: '#d8e8c0',
        back: function (c) { return C(40, 20, 30, glow(c, '#7cff5a', 0.25)); },
        pads: function () { return boneNeck(54, 56); },
        top: function () { return thornBelt(82); },
        wNear: function (c, p) {
          var top = [p[0] - 6, p[1] - 52], bot = [p[0] + 6, p[1] + 32], x = top[0], y = top[1];
          return staff(top, bot, '#5a4a2a', 3.6) + feathers(x + 2, y + 14, ['#c83a2a', '#e0a83a', '#3a9ac8'], 0.8, -0.2) + L('M' + pt([x - 1, y + 12]) + 'L' + pt([x + 2, y + 22]), '#3a2a1a', 1.4) +
            P('M' + pt([x - 10, y - 2]) + 'C' + pt([x - 12, y - 12]) + ' ' + pt([x + 8, y - 14]) + ' ' + pt([x + 8, y - 2]) + 'L' + pt([x + 4, y + 6]) + 'L' + pt([x - 6, y + 6]) + 'Z', c.cel('#ece4cc'), 1.6) +
            C(x - 4, y - 4, 1.8, OL) + C(x + 3, y - 4, 1.8, OL) + P('M' + pt([x - 10, y + 2]) + 'C' + pt([x - 16, y]) + ' ' + pt([x - 16, y - 8]) + ' ' + pt([x - 14, y - 12]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 10, y - 4]) + ' ' + pt([x - 6, y - 2]) + 'Z', '#f4ecd6', 1.2) +
            orb(c, x - 1, y - 18, 3.6, '#7cff5a');
        }
      });
    },
    chief_sharptusk: function (c) {
      return quilboar(c, {
        skin: '#b4785a', mane: '#4a2618', loin: '#8a3a2a', crown: true, big: true, tusk: 1.5, eye: '#ff5a2a', belt: '#4a3a22',
        pads: function (c) { return body(c, 'M68,56 C68,44 90,42 92,56 Z', '#ece2c8', L('M74,48 L76,56 M82,46 L84,56', '#b8ac90', 1.2), 2) + P('M76,46 L78,34 L82,46 Z', c.cel('#ece2c8'), 1.4) + P('M84,46 L90,36 L89,50 Z', c.cel('#ece2c8'), 1.4) + boneNeck(52, 58); },
        wNear: function (c, p) {
          var top = [p[0] - 2, p[1] - 42], bot = [p[0] + 8, p[1] + 30], x = top[0], y = top[1];
          return staff(top, bot, '#6a4424', 4.2) + P('M' + pt([x - 2, y + 10]) + 'C' + pt([x - 22, y + 8]) + ' ' + pt([x - 26, y - 14]) + ' ' + pt([x - 12, y - 24]) + 'C' + pt([x - 14, y - 10]) + ' ' + pt([x - 8, y]) + ' ' + pt([x + 2, y + 2]) + 'Z', c.cel('#b8bcc0'), 1.8) +
            L('M' + pt([x - 3, y + 2]) + 'L' + pt([x + 3, y + 8]) + 'M' + pt([x - 3, y + 6]) + 'L' + pt([x + 3, y + 12]), '#c8a060', 1.8);
        },
        tf: at(1.05, 64, 122)
      });
    },
    snagglespear: function (c) {
      return quilboar(c, {
        skin: '#a88068', mane: '#5a3a30', loin: '#4a5a3a', tusk: 1.3, eye: '#ffe040', tip: '#f4ecd6',
        top: function () { return thornBelt(82) + L('M46,58 L80,82', '#3a2a1a', 3); },
        wNear: function (c, p) {
          var top = [p[0] - 6, p[1] - 48], bot = [p[0] + 12, p[1] + 34], x = top[0], y = top[1];
          return staff(top, bot, '#5a3a22', 4) +
            P('M' + pt([x + 2, y + 10]) + 'C' + pt([x - 20, y + 6]) + ' ' + pt([x - 26, y - 16]) + ' ' + pt([x - 10, y - 30]) + 'C' + pt([x - 15, y - 16]) + ' ' + pt([x - 8, y - 4]) + ' ' + pt([x + 6, y]) + 'Z', c.cel('#f4ecd6'), 2) +
            L('M' + pt([x - 14, y - 4]) + 'C' + pt([x - 18, y - 12]) + ' ' + pt([x - 16, y - 20]) + ' ' + pt([x - 12, y - 26]), '#c8b890', 1.2) +
            L('M' + pt([x - 2, y + 4]) + 'L' + pt([x + 5, y + 10]) + 'M' + pt([x - 1, y + 9]) + 'L' + pt([x + 6, y + 15]), '#8a3a2a', 2.2) + feathers(x + 5, y + 18, ['#c83a2a', '#3a2a1a'], 0.6, 0.3);
        },
        tf: at(1.02, 64, 122)
      });
    },
    palemane_tanner: function (c) {
      return gnoll(c, {
        fur: '#e0d4b8', spot: '#9a8a6a', mane: '#8a7a5a', loin: '#8a5a3a',
        chest: function () { return F('M48,64 L80,64 L78,90 L50,90 Z', '#8a5a36', 0.95) + L('M50,64 L78,64', '#5a3a22', 1.6) + L('M52,56 L64,64 M76,56 L66,64', '#5a3a22', 2); },
        pads: function (c) { return body(c, 'M70,48 C78,42 92,46 94,56 L92,74 L88,66 L84,76 L80,64 L74,70 Z', '#b88a5a', L('M78,52 L86,58', '#8a6a42', 1.2), 1.8); },
        wNear: function (c, p) { var x = p[0], y = p[1]; return P('M' + pt([x - 3, y - 3]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x - 20, y - 26]) + ' ' + pt([x - 30, y - 24]) + 'C' + pt([x - 24, y - 16]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x + 3, y - 6]) + 'Z', c.cel('#d0d4da'), 1.8) + L('M' + pt([x - 6, y - 7]) + 'C' + pt([x - 12, y - 14]) + ' ' + pt([x - 18, y - 20]) + ' ' + pt([x - 26, y - 23]), '#ffffff', 1, 0.6) + limb('M' + pt([x - 2, y - 2]) + 'L' + pt([x + 7, y + 5]), '#5a3a22', 3); }
      });
    },
    palemane_poacher: function (c) {
      return gnoll(c, {
        fur: '#d8ccae', spot: '#8a7a58', mane: '#6a5a44', loin: '#5a6a3a', eye: '#ffb030',
        back: function (c) { return body(c, 'M78,34 L88,32 L96,70 L86,72 Z', '#7a5030', L('M80,40 L92,62', '#5a3a22', 1.2), 1.8) + P('M78,34 L74,24 L82,30 Z', '#e8e0c8', 1.2) + P('M84,32 L84,22 L88,30 Z', '#c83a2a', 1.2); },
        chest: function () { return L('M48,54 L80,84', '#5a3a22', 3); },
        near: [[48, 58], [36, 70], [26, 74]],
        wNear: function (c, p) {
          var x = p[0], y = p[1], d = 'M' + pt([x + 2, y - 40]) + 'C' + pt([x - 16, y - 24]) + ' ' + pt([x - 16, y + 24]) + ' ' + pt([x + 2, y + 40]);
          return L('M' + pt([x + 2, y - 40]) + 'L' + pt([x + 2, y + 40]), '#e8e0c8', 1) + limb(d, '#7a5030', 3.4) + L(d, '#a8784a', 1, 0.7) + L('M' + pt([x + 1, y - 42]) + 'L' + pt([x + 4, y - 38]) + 'M' + pt([x + 1, y + 42]) + 'L' + pt([x + 4, y + 38]), OL, 2.4);
        }
      });
    },
    venture_worker: function (c) {
      return goblin(c, {
        shirt: '#b8703a', pants: '#5a6a8a', sleeve: '#b8703a',
        chest: function () { return F('M50,64 L78,64 L80,90 L48,90 Z', '#5a6a8a') + L('M54,50 L54,66 M74,50 L74,66', '#5a6a8a', 3) + C(54, 66, 1.4, '#d8b048') + C(74, 66, 1.4, '#d8b048'); },
        wNear: function (c, p) { return pickaxe(c, p); }
      });
    },
    venture_supervisor: function (c) {
      return goblin(c, {
        shirt: '#ece4d4', pants: '#4a3a2a', sleeve: '#ece4d4', hat: '#c8402a', stripe: '#f0d040', lamp: false, goggles: true, cigar: true, belt: '#2a1a14',
        chest: function () { return F('M46,50 L58,50 L62,88 L48,88 Z', '#2a4a7a') + F('M70,50 L82,50 L80,88 L66,88 Z', '#2a4a7a') + F('M62,50 L66,50 L66,72 L64,76 L62,72 Z', '#b83a2a') + L('M52,70 Q58,76 50,80', '#e0b848', 1.4) + C(50, 80, 1.8, '#e0b848', 1); },
        wNear: function (c, p) { var x = p[0], y = p[1]; return limb('M' + pt([x + 4, y + 6]) + 'L' + pt([x - 12, y - 26]), '#3a2a20', 4) + C(x - 13, y - 28, 4, c.cel('#d8b048'), 1.6) + L('M' + pt([x - 2, y - 6]) + 'L' + pt([x - 4, y - 10]), '#d8b048', 2); }
      });
    },
    mazzranache: function (c) { return bigCat(c, { col: '#c8904a' }); },
    arrachea: function (c) { return kodoAncient(c); }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#a88a5a'), 2.5); }
  function phScene(c) { return sky(c, BLUE[0], BLUE[1], BLUE[2]) + ground(c, 150, GOLD, GOLD2); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#a88a5a"/></svg>'; }
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
