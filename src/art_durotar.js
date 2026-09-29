/* art_durotar.js — Dunescar zone art for Realm of Loner (orc homeland, Kessari Isles, Saltwall Keep, Vazhrak, The Smoke Pit).
 * Loads AFTER art.js and EXTENDS window.ART: ART.scene / ART.mob handle the Dunescar keys and fall through
 * to the original functions for every other key. Keys are appended to ART.keys.scenes / ART.keys.mobs.
 * Self-contained: no dependency on art.js internals. Never throws.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix counter).
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
  function Ctx() { this.p = 'du' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  // house cel gradient: light top-left, flat base, dark bottom-right
  Ctx.prototype.cel = function (c) {
    var key = 'c' + c; if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + lt(c, 0.3) + '"/><stop offset="0.4" stop-color="' + c + '"/><stop offset="0.72" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.38) + '"/></linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  // generic linear gradient; stops [[offset,color,opacity?]]
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
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
  function at(s, x, y) { return 'matrix(' + n(s * 1000) / 1000 + ',0,0,' + n(s * 1000) / 1000 + ',' + n(x - x * s) + ',' + n(y - y * s) + ')'; }
  function tr(x, y, s) { return 'translate(' + n(x) + ',' + n(y) + ')' + (s && s !== 1 ? ' scale(' + s + ')' : ''); }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  // outlined body with cel fill and clipped flat shading shapes
  function body(c, d, col, shade, sw) {
    var s = P(d, c.cel(col), sw == null ? 2.5 : sw);
    if (shade) s += '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>';
    return s;
  }
  function shadow(c, cx, rx) { return E(cx, 122.5, rx, 8, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])); }
  function spark(x, y, s, col) {
    return L('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x, y - 1 * s]) + 'L' + pt([x - 2 * s, y + 1 * s]) + 'L' + pt([x + 4 * s, y + 7 * s]), '#fff', 3.2 * s) +
      L('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x, y - 1 * s]) + 'L' + pt([x - 2 * s, y + 1 * s]) + 'L' + pt([x + 4 * s, y + 7 * s]), col, 1.6 * s);
  }
  function flame(c, x, y, s, outer, inner) {
    var o = outer || '#ff7a1a', i = inner || '#ffd84a';
    return P('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y]) + ' ' + pt([x - 9 * s, y - 9 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 1 * s, y - 9 * s]) + ' ' + pt([x, y - 20 * s]) +
      'C' + pt([x + 4 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 14 * s]) + ' ' + pt([x + 5 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 9 * s]) + ' ' + pt([x + 8 * s, y]) + ' ' + pt([x, y]) + 'Z', o, 1.6 * Math.max(0.7, s)) +
      F('M' + pt([x, y - 1 * s]) + 'C' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 1 * s, y - 11 * s]) + 'C' + pt([x, y - 7 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 10 * s]) + 'C' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 4 * s, y - 1 * s]) + ' ' + pt([x, y - 1 * s]) + 'Z', i);
  }
  function orb(c, x, y, r, col) { return C(x, y, r * 2.6, glow(c, col, 0.75)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.5, lt(col, 0.4)], [1, col]]), 1.6); }

  // ============================================================
  //  SCENE PIECES
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.5, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff4d0', 0.55)) + C(x, y, r, lt(col || '#fff4d0', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#fff4e0', 0.18], [0.5, '#fff4e0', 0], [1, bot || '#2a1008', 0.22]])); }
  // far flat-topped mesa, no outline (house style for far layers)
  function mesa(x, base, w, h, col, side) {
    var t = base - h, lip = w * 0.12;
    return F(pd([[x, base], [x + lip, t + 6], [x + lip + 4, t], [x + w - lip - 4, t], [x + w - lip, t + 6], [x + w, base]], true), col) +
      F(pd([[x + w * 0.62, t], [x + w - lip - 4, t], [x + w - lip, t + 6], [x + w, base], [x + w * 0.7, base]], true), side, 0.9) +
      L('M' + pt([x + lip + 2, t + h * 0.35]) + 'L' + pt([x + w - lip, t + h * 0.35]), side, 1.4, 0.6);
  }
  // near canyon wall with strata (outlined); pts = top silhouette from left to right, closed to bottom y
  function cliff(c, pts, bot, col, shadeD) {
    var d = pd(pts.concat([[pts[pts.length - 1][0], bot], [pts[0][0], bot]]), true);
    var sh = shadeD ? F(shadeD, dk(col, 0.3), 0.85) : '';
    var strata = '';
    for (var i = 1; i < 6; i++) {
      var y = pts[0][1] + (bot - pts[0][1]) * i / 6 + (i % 2 ? 3 : -2);
      strata += L('M' + (pts[0][0] - 10) + ',' + n(y) + ' Q' + n((pts[0][0] + pts[pts.length - 1][0]) / 2) + ',' + n(y + 6) + ' ' + (pts[pts.length - 1][0] + 10) + ',' + n(y - 2), dk(col, 0.22), 1.6, 0.7);
    }
    return body(c, d, col, sh + strata, 2.2);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  function road(c, y, w1, w2, col) { return F('M' + (200 - w1) + ',' + y + ' L' + (200 + w1) + ',' + y + ' L' + (200 + w2) + ',240 L' + (200 - w2) + ',240 Z', col, 0.55); }
  function pebbles(seed, y0, y1, col, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < (cnt || 14); i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.7); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w * 0.42, y - h * 0.6]) + 'L' + pt([x - w * 0.12, y - h]) + 'L' + pt([x + w * 0.3, y - h * 0.86]) + 'L' + pt([x + w / 2, y - h * 0.3]) + 'L' + pt([x + w * 0.46, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.05, y - h]) + 'L' + pt([x + w * 0.3, y - h * 0.86]) + 'L' + pt([x + w / 2, y - h * 0.3]) + 'L' + pt([x + w * 0.46, y]) + 'L' + pt([x, y]) + 'Z', dk(col, 0.28), 0.85), 1.8);
  }
  // dry thorny brush
  function brush(c, x, y, s, col) {
    col = col || '#6e4a26';
    var r = rng(Math.round(x * 7 + y * 13)), br = '', tw = '';
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI * (0.12 + 0.76 * i / 6) + (r() - 0.5) * 0.2, len = (12 + r() * 9) * s;
      var ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      br += 'M' + pt([x, y]) + 'Q' + pt([x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * len * 0.5]) + ' ' + pt([ex, ey]);
      tw += 'M' + pt([x + Math.cos(a) * len * 0.6, y + Math.sin(a) * len * 0.6]) + 'l' + n((r() - 0.3) * 6 * s) + ',' + n(-3 * s);
    }
    return E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.2) + L(br, OL, 4 * s) + L(tw, OL, 3 * s) + L(br, col, 1.8 * s) + L(tw, lt(col, 0.1), 1.3 * s);
  }
  // round orc hut: wood frame, hide roof, curved tusk spikes
  function orcHut(c, x, y, s, hide) {
    hide = hide || '#c89a62';
    var o = '';
    o += E(x, y + 1, 36 * s, 5 * s, '#000', 0, 0.22);
    // rear spikes
    o += P('M' + pt([x + 18 * s, y - 34 * s]) + 'Q' + pt([x + 30 * s, y - 50 * s]) + ' ' + pt([x + 40 * s, y - 52 * s]) + 'Q' + pt([x + 30 * s, y - 44 * s]) + ' ' + pt([x + 24 * s, y - 30 * s]) + 'Z', '#e8dcc0', 1.6 * s);
    o += P('M' + pt([x - 18 * s, y - 34 * s]) + 'Q' + pt([x - 30 * s, y - 50 * s]) + ' ' + pt([x - 40 * s, y - 52 * s]) + 'Q' + pt([x - 30 * s, y - 44 * s]) + ' ' + pt([x - 24 * s, y - 30 * s]) + 'Z', '#e8dcc0', 1.6 * s);
    // wall
    var wall = 'M' + pt([x - 32 * s, y]) + 'L' + pt([x - 30 * s, y - 16 * s]) + 'L' + pt([x + 30 * s, y - 16 * s]) + 'L' + pt([x + 32 * s, y]) + 'Z';
    var logs = '';
    for (var i = -3; i <= 3; i++) logs += L('M' + pt([x + i * 9 * s, y - 16 * s]) + 'L' + pt([x + i * 9.4 * s, y]), dk('#8a5a32', 0.3), 1.2 * s);
    o += body(c, wall, '#8a5a32', logs + F('M' + pt([x + 12 * s, y - 16 * s]) + 'L' + pt([x + 34 * s, y - 16 * s]) + 'L' + pt([x + 34 * s, y]) + 'L' + pt([x + 14 * s, y]) + 'Z', dk('#8a5a32', 0.3), 0.8), 1.8 * s);
    // roof
    var roof = 'M' + pt([x - 38 * s, y - 12 * s]) + 'C' + pt([x - 34 * s, y - 38 * s]) + ' ' + pt([x - 12 * s, y - 48 * s]) + ' ' + pt([x, y - 48 * s]) + 'C' + pt([x + 12 * s, y - 48 * s]) + ' ' + pt([x + 34 * s, y - 38 * s]) + ' ' + pt([x + 38 * s, y - 12 * s]) +
      'L' + pt([x + 26 * s, y - 16 * s]) + 'L' + pt([x + 14 * s, y - 11 * s]) + 'L' + pt([x, y - 16 * s]) + 'L' + pt([x - 14 * s, y - 11 * s]) + 'L' + pt([x - 26 * s, y - 16 * s]) + 'Z';
    var seams = L('M' + pt([x - 20 * s, y - 42 * s]) + 'Q' + pt([x - 22 * s, y - 28 * s]) + ' ' + pt([x - 26 * s, y - 16 * s]) + 'M' + pt([x + 4 * s, y - 48 * s]) + 'Q' + pt([x + 6 * s, y - 30 * s]) + ' ' + pt([x + 14 * s, y - 11 * s]), dk(hide, 0.3), 1.3 * s) +
      F('M' + pt([x + 10 * s, y - 49 * s]) + 'C' + pt([x + 26 * s, y - 44 * s]) + ' ' + pt([x + 36 * s, y - 34 * s]) + ' ' + pt([x + 40 * s, y - 12 * s]) + 'L' + pt([x + 20 * s, y - 12 * s]) + 'C' + pt([x + 20 * s, y - 30 * s]) + ' ' + pt([x + 16 * s, y - 42 * s]) + ' ' + pt([x + 10 * s, y - 49 * s]) + 'Z', dk(hide, 0.22), 0.85) +
      E(x - 16 * s, y - 36 * s, 6 * s, 4 * s, lt(hide, 0.2), 0, 0.5);
    o += body(c, roof, hide, seams, 2 * s);
    // front spike pair + top pole
    o += L('M' + pt([x, y - 48 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]), OL, 4.5 * s) + L('M' + pt([x, y - 48 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]), '#6a4424', 2.2 * s);
    o += P('M' + pt([x - 8 * s, y - 44 * s]) + 'Q' + pt([x - 14 * s, y - 60 * s]) + ' ' + pt([x - 22 * s, y - 64 * s]) + 'Q' + pt([x - 16 * s, y - 56 * s]) + ' ' + pt([x - 3 * s, y - 42 * s]) + 'Z', '#f0e6cc', 1.6 * s);
    o += P('M' + pt([x + 8 * s, y - 44 * s]) + 'Q' + pt([x + 14 * s, y - 60 * s]) + ' ' + pt([x + 22 * s, y - 64 * s]) + 'Q' + pt([x + 16 * s, y - 56 * s]) + ' ' + pt([x + 3 * s, y - 42 * s]) + 'Z', '#d8ccb0', 1.6 * s);
    // door
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 12 * s]) + 'Q' + pt([x, y - 20 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', '#2a1a10', 1.6 * s);
    return o;
  }
  // horde war banner on a pole (no text; simple spiked emblem)
  function banner(c, x, y, h, col, em) {
    col = col || '#a8201a'; em = em || '#1a1009';
    var top = y - h, o = '';
    o += limb('M' + x + ',' + y + ' L' + x + ',' + n(top - 6), '#6a4424', 2.4);
    o += limb('M' + n(x - 3) + ',' + n(top) + ' L' + n(x + 19) + ',' + n(top), '#6a4424', 2);
    o += P('M' + n(x + 12) + ',' + n(top - 10) + ' L' + n(x + 8) + ',' + n(top - 6) + ' L' + n(x + 16) + ',' + n(top - 6) + ' Z', '#e8dcc0', 1.4);
    var bw = 18, bh = h * 0.52;
    var d = 'M' + n(x - 1) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top + bh) + ' L' + n(x + 8) + ',' + n(top + bh - 6) + ' L' + n(x - 1) + ',' + n(top + bh) + ' Z';
    o += body(c, d, col, F('M' + n(x + 11) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top + bh + 2) + ' L' + n(x + 11) + ',' + n(top + bh) + ' Z', dk(col, 0.3), 0.8), 1.6);
    // emblem: three-pronged horde spike mark
    var ex = x + 8, ey = top + bh * 0.42, k = bw / 18;
    o += F('M' + n(ex - 5 * k) + ',' + n(ey - 5 * k) + ' L' + n(ex - 2 * k) + ',' + n(ey + 5 * k) + ' L' + n(ex + 2 * k) + ',' + n(ey + 5 * k) + ' L' + n(ex + 5 * k) + ',' + n(ey - 5 * k) + ' L' + n(ex + 1.5 * k) + ',' + n(ey) + ' L' + n(ex) + ',' + n(ey - 7 * k) + ' L' + n(ex - 1.5 * k) + ',' + n(ey) + ' Z', em);
    return o;
  }
  function bonfire(c, x, y, s) {
    var o = '';
    o += C(x, y - 18 * s, 70 * s, glow(c, '#ffb040', 0.55));
    o += E(x, y + 2 * s, 26 * s, 6 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = Math.PI * i / 6; o += rock(c, x - 24 * s * Math.cos(a), y + 2 * s + 3 * s * Math.sin(a), 8 * s, 6 * s, '#6e5a4a'); }
    o += limb('M' + pt([x - 18 * s, y]) + 'L' + pt([x + 16 * s, y - 8 * s]), '#6a4424', 4 * s) + limb('M' + pt([x + 18 * s, y]) + 'L' + pt([x - 14 * s, y - 9 * s]), '#7a5030', 4 * s);
    o += flame(c, x - 7 * s, y - 2 * s, 1.1 * s) + flame(c, x + 8 * s, y - 2 * s, 1.05 * s) + flame(c, x, y, 1.7 * s);
    o += C(x - 16 * s, y - 40 * s, 1.5 * s, '#ffd060') + C(x + 12 * s, y - 50 * s, 1.2 * s, '#ffb040') + C(x + 3 * s, y - 60 * s, 1 * s, '#ffe080');
    return o;
  }
  function palisade(c, x1, x2, y, h, col, step) {
    col = col || '#8a5a32'; step = step || 9;
    var o = '';
    for (var x = x1; x < x2; x += step) {
      var hh = h * (0.9 + ((x * 37) % 10) / 50);
      var d = 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - hh) + ' L' + n(x + step / 2) + ',' + n(y - hh - step * 1.1) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' Z';
      o += P(d, c.cel(col), 1.6) + F('M' + n(x + step * 0.62) + ',' + n(y - hh - step * 0.5) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' L' + n(x + step * 0.62) + ',' + n(y) + ' Z', dk(col, 0.3), 0.75);
    }
    o += limb('M' + n(x1) + ',' + n(y - h * 0.35) + ' L' + n(x2) + ',' + n(y - h * 0.35), '#5a3a1e', 2.2);
    return o;
  }
  function watchtower(c, x, y, s) {
    var o = '', wood = '#7a4e2a';
    o += E(x, y + 1, 24 * s, 4 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 10 * s, y - 70 * s]), wood, 4 * s) + limb('M' + pt([x + 16 * s, y]) + 'L' + pt([x + 10 * s, y - 70 * s]), wood, 4 * s);
    o += limb('M' + pt([x - 15 * s, y - 8 * s]) + 'L' + pt([x + 12 * s, y - 60 * s]) + 'M' + pt([x + 15 * s, y - 8 * s]) + 'L' + pt([x - 12 * s, y - 60 * s]), dk(wood, 0.15), 2.4 * s);
    o += limb('M' + pt([x - 14 * s, y - 36 * s]) + 'L' + pt([x + 14 * s, y - 36 * s]), wood, 2.4 * s);
    // platform
    o += body(c, 'M' + pt([x - 20 * s, y - 70 * s]) + 'L' + pt([x + 20 * s, y - 70 * s]) + 'L' + pt([x + 18 * s, y - 84 * s]) + 'L' + pt([x - 18 * s, y - 84 * s]) + 'Z', '#8a5a32', F('M' + pt([x + 6 * s, y - 86 * s]) + 'L' + pt([x + 22 * s, y - 86 * s]) + 'L' + pt([x + 22 * s, y - 68 * s]) + 'L' + pt([x + 6 * s, y - 68 * s]) + 'Z', '#5a3a1e', 0.7), 1.8 * s);
    // hide roof with spikes
    o += limb('M' + pt([x - 16 * s, y - 84 * s]) + 'L' + pt([x - 16 * s, y - 96 * s]) + 'M' + pt([x + 16 * s, y - 84 * s]) + 'L' + pt([x + 16 * s, y - 96 * s]), wood, 2.2 * s);
    o += body(c, 'M' + pt([x - 26 * s, y - 94 * s]) + 'L' + pt([x, y - 116 * s]) + 'L' + pt([x + 26 * s, y - 94 * s]) + 'L' + pt([x + 14 * s, y - 97 * s]) + 'L' + pt([x, y - 93 * s]) + 'L' + pt([x - 14 * s, y - 97 * s]) + 'Z', '#b88a58', F('M' + pt([x, y - 116 * s]) + 'L' + pt([x + 26 * s, y - 94 * s]) + 'L' + pt([x, y - 93 * s]) + 'Z', '#7a5a34', 0.7), 1.8 * s);
    o += L('M' + pt([x, y - 116 * s]) + 'L' + pt([x - 2 * s, y - 128 * s]), OL, 4 * s) + L('M' + pt([x, y - 116 * s]) + 'L' + pt([x - 2 * s, y - 128 * s]), '#e8dcc0', 2 * s);
    o += L('M' + pt([x - 22 * s, y - 96 * s]) + 'L' + pt([x - 30 * s, y - 104 * s]) + 'M' + pt([x + 22 * s, y - 96 * s]) + 'L' + pt([x + 30 * s, y - 104 * s]), OL, 3.6 * s) + L('M' + pt([x - 22 * s, y - 96 * s]) + 'L' + pt([x - 30 * s, y - 104 * s]) + 'M' + pt([x + 22 * s, y - 96 * s]) + 'L' + pt([x + 30 * s, y - 104 * s]), '#e8dcc0', 1.6 * s);
    return o;
  }
  // long spiked barracks
  function barracks(c, x, y, s) {
    var o = '', wood = '#8a5a32';
    o += E(x, y + 1, 56 * s, 5 * s, '#000', 0, 0.22);
    var wall = 'M' + pt([x - 50 * s, y]) + 'L' + pt([x - 50 * s, y - 22 * s]) + 'L' + pt([x + 50 * s, y - 22 * s]) + 'L' + pt([x + 50 * s, y]) + 'Z';
    var logs = '';
    for (var i = -5; i <= 5; i++) logs += L('M' + pt([x + i * 9 * s, y - 22 * s]) + 'L' + pt([x + i * 9 * s, y]), dk(wood, 0.3), 1.2 * s);
    o += body(c, wall, wood, logs + F('M' + pt([x + 30 * s, y - 24 * s]) + 'L' + pt([x + 52 * s, y - 24 * s]) + 'L' + pt([x + 52 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'Z', dk(wood, 0.3), 0.75), 1.8 * s);
    var roof = 'M' + pt([x - 58 * s, y - 18 * s]) + 'L' + pt([x - 44 * s, y - 44 * s]) + 'L' + pt([x + 44 * s, y - 44 * s]) + 'L' + pt([x + 58 * s, y - 18 * s]) + 'Z';
    o += body(c, roof, '#b07a48', F('M' + pt([x + 20 * s, y - 46 * s]) + 'L' + pt([x + 46 * s, y - 46 * s]) + 'L' + pt([x + 60 * s, y - 16 * s]) + 'L' + pt([x + 30 * s, y - 16 * s]) + 'Z', '#6e4a2a', 0.7) + L('M' + pt([x - 52 * s, y - 30 * s]) + 'L' + pt([x + 52 * s, y - 30 * s]), '#6e4a2a', 1.4 * s), 2 * s);
    for (var j = -3; j <= 3; j++) {
      var sx = x + j * 13 * s;
      o += P('M' + pt([sx - 3 * s, y - 44 * s]) + 'L' + pt([sx - 1 * s, y - 58 * s]) + 'L' + pt([sx + 3 * s, y - 44 * s]) + 'Z', '#e8dcc0', 1.4 * s);
    }
    o += P('M' + pt([x - 9 * s, y]) + 'L' + pt([x - 9 * s, y - 15 * s]) + 'L' + pt([x + 9 * s, y - 15 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z', '#2a1a10', 1.6 * s);
    return o;
  }
  function stormcloud(c, x, y, s, col) {
    col = col || '#4a4c5e';
    var d = 'M' + pt([x - 40 * s, y + 10 * s]) + 'C' + pt([x - 50 * s, y]) + ' ' + pt([x - 36 * s, y - 12 * s]) + ' ' + pt([x - 22 * s, y - 8 * s]) + 'C' + pt([x - 18 * s, y - 24 * s]) + ' ' + pt([x + 4 * s, y - 26 * s]) + ' ' + pt([x + 10 * s, y - 12 * s]) +
      'C' + pt([x + 22 * s, y - 22 * s]) + ' ' + pt([x + 42 * s, y - 12 * s]) + ' ' + pt([x + 38 * s, y]) + 'C' + pt([x + 52 * s, y + 2 * s]) + ' ' + pt([x + 50 * s, y + 14 * s]) + ' ' + pt([x + 38 * s, y + 14 * s]) + 'Z';
    return F(d, col) + F('M' + pt([x - 44 * s, y + 8 * s]) + 'C' + pt([x - 20 * s, y + 4 * s]) + ' ' + pt([x + 20 * s, y + 4 * s]) + ' ' + pt([x + 48 * s, y + 8 * s]) + 'L' + pt([x + 38 * s, y + 14 * s]) + 'L' + pt([x - 40 * s, y + 10 * s]) + 'Z', dk(col, 0.35), 0.85) +
      F('M' + pt([x - 20 * s, y - 8 * s]) + 'C' + pt([x - 14 * s, y - 20 * s]) + ' ' + pt([x + 2 * s, y - 22 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'C' + pt([x, y - 16 * s]) + ' ' + pt([x - 12 * s, y - 14 * s]) + ' ' + pt([x - 20 * s, y - 8 * s]) + 'Z', lt(col, 0.2), 0.8);
  }
  function bolt(x, y, s) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 8 * s, y + 22 * s]) + 'L' + pt([x + 2 * s, y + 20 * s]) + 'L' + pt([x - 6 * s, y + 44 * s]) + 'L' + pt([x + 12 * s, y + 14 * s]) + 'L' + pt([x + 2 * s, y + 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z';
    return P(d, '#f4f8ff', 1.6 * s) + F('M' + pt([x + 1 * s, y + 2 * s]) + 'L' + pt([x - 4 * s, y + 18 * s]) + 'L' + pt([x + 3 * s, y + 17 * s]) + 'Z', '#9fd4ff', 0.9);
  }
  function palm(c, x, y, s, lean) {
    lean = lean || 0;
    var tx = x + lean * s, ty = y - 78 * s, o = '';
    o += E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.2);
    var trunk = 'M' + pt([x - 5 * s, y]) + 'Q' + pt([x + lean * 0.2 * s - 4 * s, y - 40 * s]) + ' ' + pt([tx - 3 * s, ty]) + 'L' + pt([tx + 3 * s, ty]) + 'Q' + pt([x + lean * 0.2 * s + 4 * s, y - 40 * s]) + ' ' + pt([x + 5 * s, y]) + 'Z';
    var rings = '';
    for (var i = 1; i < 9; i++) { var t = i / 9, rx = x + (tx - x) * t * t * 0.9 + lean * 0.2 * s * 2 * t * (1 - t), ry = y + (ty - y) * t; rings += L('M' + pt([rx - 5 * s, ry + 1]) + 'L' + pt([rx + 5 * s, ry - 1]), '#6a4a2a', 1.3 * s); }
    o += body(c, trunk, '#9a7248', rings, 1.8 * s);
    var fronds = [[-40, 6], [-30, -14], [-8, -22], [18, -18], [38, -2], [34, 16], [-26, 18]];
    fronds.forEach(function (f, i) {
      var ex = tx + f[0] * s, ey = ty + f[1] * s + 8 * s, mx = tx + f[0] * 0.5 * s, my = ty + Math.min(f[1], 0) * 0.8 * s - 8 * s;
      var d = 'M' + pt([tx, ty]) + 'Q' + pt([mx, my - 4 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([mx, my + 8 * s]) + ' ' + pt([tx, ty + 3 * s]) + 'Z';
      var col = i % 2 ? '#4f9a3a' : '#3f8a32';
      o += P(d, c.cel(col), 1.6 * s) + L('M' + pt([tx, ty + 1]) + 'Q' + pt([mx, my + 2 * s]) + ' ' + pt([ex, ey]), dk(col, 0.35), 1.1 * s);
    });
    o += C(tx - 3 * s, ty + 3 * s, 3.4 * s, '#6a4a2a', 1.4 * s) + C(tx + 3 * s, ty + 4 * s, 3.4 * s, '#5a3a20', 1.4 * s);
    return o;
  }
  // troll hut on stilts (thatch)
  function stiltHut(c, x, y, s, water) {
    var o = '', wood = '#7a5a36';
    for (var i = -1; i <= 1; i++) o += limb('M' + pt([x + i * 16 * s, y]) + 'L' + pt([x + i * 15 * s, y - 26 * s]), wood, 2.6 * s);
    if (water) o += L('M' + pt([x - 22 * s, y]) + 'L' + pt([x - 10 * s, y]) + 'M' + pt([x - 6 * s, y + 1]) + 'L' + pt([x + 6 * s, y + 1]) + 'M' + pt([x + 10 * s, y]) + 'L' + pt([x + 22 * s, y]), '#e0fbff', 1.6 * s, 0.8);
    o += body(c, 'M' + pt([x - 26 * s, y - 24 * s]) + 'L' + pt([x + 26 * s, y - 24 * s]) + 'L' + pt([x + 26 * s, y - 30 * s]) + 'L' + pt([x - 26 * s, y - 30 * s]) + 'Z', '#8a6a42', '', 1.6 * s);
    o += body(c, 'M' + pt([x - 20 * s, y - 30 * s]) + 'L' + pt([x - 20 * s, y - 48 * s]) + 'L' + pt([x + 20 * s, y - 48 * s]) + 'L' + pt([x + 20 * s, y - 30 * s]) + 'Z', '#a07a4a',
      F('M' + pt([x + 8 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 28 * s]) + 'L' + pt([x + 8 * s, y - 28 * s]) + 'Z', '#6a4a2a', 0.7), 1.6 * s);
    o += P('M' + pt([x - 5 * s, y - 30 * s]) + 'L' + pt([x - 5 * s, y - 42 * s]) + 'L' + pt([x + 5 * s, y - 42 * s]) + 'L' + pt([x + 5 * s, y - 30 * s]) + 'Z', '#2a1a10', 1.4 * s);
    var roof = 'M' + pt([x - 32 * s, y - 42 * s]) + 'L' + pt([x, y - 76 * s]) + 'L' + pt([x + 32 * s, y - 42 * s]) + 'L' + pt([x + 22 * s, y - 45 * s]) + 'L' + pt([x + 12 * s, y - 41 * s]) + 'L' + pt([x, y - 45 * s]) + 'L' + pt([x - 12 * s, y - 41 * s]) + 'L' + pt([x - 22 * s, y - 45 * s]) + 'Z';
    o += body(c, roof, '#c8a060', F('M' + pt([x, y - 76 * s]) + 'L' + pt([x + 34 * s, y - 42 * s]) + 'L' + pt([x, y - 44 * s]) + 'Z', '#8a6a3a', 0.7) + L('M' + pt([x - 20 * s, y - 56 * s]) + 'L' + pt([x + 20 * s, y - 56 * s]), '#8a6a3a', 1.2 * s), 1.8 * s);
    o += L('M' + pt([x, y - 76 * s]) + 'L' + pt([x + 2 * s, y - 86 * s]), OL, 3.4 * s) + L('M' + pt([x, y - 76 * s]) + 'L' + pt([x + 2 * s, y - 86 * s]), '#8a6a42', 1.6 * s);
    return o;
  }
  // voodoo totem: carved pole, mask, feathers
  function voodooTotem(c, x, y, s) {
    var o = '';
    o += E(x, y + 1, 12 * s, 3 * s, '#000', 0, 0.22);
    o += body(c, 'M' + pt([x - 6 * s, y]) + 'L' + pt([x - 5 * s, y - 50 * s]) + 'L' + pt([x + 5 * s, y - 50 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#7a5a3a', F('M' + pt([x + 1 * s, y - 52 * s]) + 'L' + pt([x + 8 * s, y - 52 * s]) + 'L' + pt([x + 8 * s, y]) + 'L' + pt([x + 2 * s, y]) + 'Z', '#4a3420', 0.7), 1.8 * s);
    o += L('M' + pt([x - 6 * s, y - 20 * s]) + 'L' + pt([x + 6 * s, y - 20 * s]) + 'M' + pt([x - 6 * s, y - 30 * s]) + 'L' + pt([x + 6 * s, y - 30 * s]), '#c83a2a', 2.2 * s);
    // mask
    var m = 'M' + pt([x - 12 * s, y - 64 * s]) + 'C' + pt([x - 12 * s, y - 76 * s]) + ' ' + pt([x + 12 * s, y - 76 * s]) + ' ' + pt([x + 12 * s, y - 64 * s]) + 'L' + pt([x + 10 * s, y - 50 * s]) + 'L' + pt([x, y - 44 * s]) + 'L' + pt([x - 10 * s, y - 50 * s]) + 'Z';
    o += body(c, m, '#b8864a', F('M' + pt([x + 2 * s, y - 76 * s]) + 'L' + pt([x + 14 * s, y - 76 * s]) + 'L' + pt([x + 14 * s, y - 44 * s]) + 'L' + pt([x + 2 * s, y - 44 * s]) + 'Z', '#7a5430', 0.6), 1.8 * s);
    o += P('M' + pt([x - 8 * s, y - 64 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]) + 'L' + pt([x - 7 * s, y - 59 * s]) + 'Z', '#1a1009', 0) + P('M' + pt([x + 8 * s, y - 64 * s]) + 'L' + pt([x + 2 * s, y - 62 * s]) + 'L' + pt([x + 7 * s, y - 59 * s]) + 'Z', '#1a1009', 0);
    o += C(x - 5 * s, y - 62 * s, 1.2 * s, '#7cff7a') + C(x + 5 * s, y - 62 * s, 1.2 * s, '#7cff7a');
    o += P('M' + pt([x - 6 * s, y - 53 * s]) + 'L' + pt([x + 6 * s, y - 53 * s]) + 'L' + pt([x + 4 * s, y - 49 * s]) + 'L' + pt([x - 4 * s, y - 49 * s]) + 'Z', '#f0e6cc', 1.2 * s);
    o += L('M' + pt([x - 10 * s, y - 68 * s]) + 'L' + pt([x - 4 * s, y - 66 * s]) + 'M' + pt([x + 10 * s, y - 68 * s]) + 'L' + pt([x + 4 * s, y - 66 * s]), '#2f8aa8', 2 * s);
    // feathers
    [[-10, '#d83a2a'], [0, '#f0c040'], [10, '#2f9ab8']].forEach(function (f) {
      var fx = x + f[0] * s;
      o += P('M' + pt([fx, y - 72 * s]) + 'Q' + pt([fx + f[0] * 0.5 * s - 4 * s, y - 86 * s]) + ' ' + pt([fx + f[0] * 0.4 * s, y - 96 * s]) + 'Q' + pt([fx + f[0] * 0.5 * s + 5 * s, y - 84 * s]) + ' ' + pt([fx + 2 * s, y - 72 * s]) + 'Z', f[1], 1.4 * s);
    });
    return o;
  }
  // human stone keep
  function stoneKeep(c, x, y, s) {
    var o = '', st = '#9aa0a6', dkst = '#6a7076';
    function merlons(x0, x1, yy, sz) { var m = ''; for (var q = x0; q < x1 - 1; q += sz * 2) m += R(q, yy - sz, sz, sz, st, 1.6 * s); return m; }
    function bricks(x0, x1, y0, y1) { var b = ''; for (var yy = y0 + 8 * s, r = 0; yy < y1; yy += 8 * s, r++) { b += L('M' + n(x0) + ',' + n(yy) + ' L' + n(x1) + ',' + n(yy), dk(st, 0.28), 1 * s, 0.7); for (var xx = x0 + (r % 2 ? 6 : 12) * s; xx < x1; xx += 14 * s) b += L('M' + n(xx) + ',' + n(yy) + ' L' + n(xx) + ',' + n(yy - 8 * s), dk(st, 0.28), 1 * s, 0.6); } return b; }
    o += E(x, y + 2, 100 * s, 6 * s, '#000', 0, 0.22);
    // curtain wall
    var wx0 = x - 80 * s, wx1 = x + 80 * s, wy = y - 40 * s;
    o += merlons(wx0, wx1, wy, 7 * s);
    o += body(c, 'M' + n(wx0) + ',' + n(y) + ' L' + n(wx0) + ',' + n(wy) + ' L' + n(wx1) + ',' + n(wy) + ' L' + n(wx1) + ',' + n(y) + ' Z', st, bricks(wx0, wx1, wy, y) + F('M' + n(wx0) + ',' + n(y - 10 * s) + ' L' + n(wx1) + ',' + n(y - 10 * s) + ' L' + n(wx1) + ',' + n(y) + ' L' + n(wx0) + ',' + n(y) + ' Z', dkst, 0.5), 2 * s);
    // central keep
    var kx0 = x - 34 * s, kx1 = x + 34 * s, ky = y - 92 * s;
    o += merlons(kx0, kx1, ky, 7 * s);
    o += body(c, 'M' + n(kx0) + ',' + n(y - 30 * s) + ' L' + n(kx0) + ',' + n(ky) + ' L' + n(kx1) + ',' + n(ky) + ' L' + n(kx1) + ',' + n(y - 30 * s) + ' Z', st, bricks(kx0, kx1, ky, y - 30 * s) + F('M' + n(x + 14 * s) + ',' + n(ky - 2) + ' L' + n(kx1 + 2) + ',' + n(ky - 2) + ' L' + n(kx1 + 2) + ',' + n(y) + ' L' + n(x + 14 * s) + ',' + n(y) + ' Z', dkst, 0.55), 2 * s);
    // towers
    [[x - 86 * s, 1], [x + 86 * s, 0.94]].forEach(function (t) {
      var tx0 = t[0] - 16 * s, tx1 = t[0] + 16 * s, ty = y - 76 * s * t[1];
      o += merlons(tx0 - 2 * s, tx1 + 2 * s, ty, 6 * s);
      o += body(c, 'M' + n(tx0) + ',' + n(y) + ' L' + n(tx0) + ',' + n(ty) + ' L' + n(tx1) + ',' + n(ty) + ' L' + n(tx1) + ',' + n(y) + ' Z', st, bricks(tx0, tx1, ty, y) + F('M' + n(t[0] + 5 * s) + ',' + n(ty - 2) + ' L' + n(tx1 + 2) + ',' + n(ty - 2) + ' L' + n(tx1 + 2) + ',' + n(y) + ' L' + n(t[0] + 5 * s) + ',' + n(y) + ' Z', dkst, 0.55), 2 * s);
      o += P('M' + n(t[0] - 3 * s) + ',' + n(ty + 26 * s) + ' L' + n(t[0] - 3 * s) + ',' + n(ty + 14 * s) + ' Q' + n(t[0]) + ',' + n(ty + 10 * s) + ' ' + n(t[0] + 3 * s) + ',' + n(ty + 14 * s) + ' L' + n(t[0] + 3 * s) + ',' + n(ty + 26 * s) + ' Z', '#2a2a34', 1.4 * s);
    });
    // windows on keep
    [-16, 0, 16].forEach(function (dx) { o += P('M' + n(x + dx * s - 3 * s) + ',' + n(ky + 30 * s) + ' L' + n(x + dx * s - 3 * s) + ',' + n(ky + 18 * s) + ' Q' + n(x + dx * s) + ',' + n(ky + 13 * s) + ' ' + n(x + dx * s + 3 * s) + ',' + n(ky + 18 * s) + ' L' + n(x + dx * s + 3 * s) + ',' + n(ky + 30 * s) + ' Z', '#2a2a34', 1.4 * s); });
    // gate
    o += P('M' + n(x - 14 * s) + ',' + n(y) + ' L' + n(x - 14 * s) + ',' + n(y - 22 * s) + ' Q' + n(x) + ',' + n(y - 38 * s) + ' ' + n(x + 14 * s) + ',' + n(y - 22 * s) + ' L' + n(x + 14 * s) + ',' + n(y) + ' Z', '#3a2a1e', 2 * s);
    o += L('M' + n(x - 7 * s) + ',' + n(y) + ' L' + n(x - 7 * s) + ',' + n(y - 28 * s) + ' M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - 31 * s) + ' M' + n(x + 7 * s) + ',' + n(y) + ' L' + n(x + 7 * s) + ',' + n(y - 28 * s) + ' M' + n(x - 13 * s) + ',' + n(y - 12 * s) + ' L' + n(x + 13 * s) + ',' + n(y - 12 * s), '#6a6e76', 1.6 * s);
    // blue banners hanging from the keep + flag on top
    [x - 22 * s, x + 22 * s].forEach(function (bx) { o += kulBanner(c, bx, ky + 6 * s, 24 * s); });
    o += limb('M' + n(x) + ',' + n(ky - 7 * s) + ' L' + n(x) + ',' + n(ky - 34 * s), '#5a4a3a', 1.6 * s);
    o += body(c, 'M' + n(x + 1) + ',' + n(ky - 34 * s) + ' L' + n(x + 24 * s) + ',' + n(ky - 30 * s) + ' L' + n(x + 18 * s) + ',' + n(ky - 26 * s) + ' L' + n(x + 24 * s) + ',' + n(ky - 21 * s) + ' L' + n(x + 1) + ',' + n(ky - 22 * s) + ' Z', '#2a5aa0', '', 1.6 * s);
    return o;
  }
  // Brineholt-style hanging banner: blue with white anchor mark (no text)
  function kulBanner(c, x, y, h) {
    var w = h * 0.55, o = '';
    var d = 'M' + n(x - w / 2) + ',' + n(y) + ' L' + n(x + w / 2) + ',' + n(y) + ' L' + n(x + w / 2) + ',' + n(y + h) + ' L' + n(x) + ',' + n(y + h * 0.82) + ' L' + n(x - w / 2) + ',' + n(y + h) + ' Z';
    o += body(c, d, '#2a5aa0', F('M' + n(x + w * 0.18) + ',' + n(y) + ' L' + n(x + w / 2 + 1) + ',' + n(y) + ' L' + n(x + w / 2 + 1) + ',' + n(y + h + 1) + ' L' + n(x + w * 0.18) + ',' + n(y + h) + ' Z', '#1a3a6e', 0.6) + L('M' + n(x - w / 2) + ',' + n(y + 2) + ' L' + n(x + w / 2) + ',' + n(y + 2), '#e8c060', 1.6), 1.6);
    var k = h / 24, ax = x, ay = y + h * 0.42;
    o += L('M' + n(ax) + ',' + n(ay - 6 * k) + ' L' + n(ax) + ',' + n(ay + 5 * k) + ' M' + n(ax - 3 * k) + ',' + n(ay - 3 * k) + ' L' + n(ax + 3 * k) + ',' + n(ay - 3 * k) + ' M' + n(ax - 5 * k) + ',' + n(ay + 1 * k) + ' Q' + n(ax - 4 * k) + ',' + n(ay + 6 * k) + ' ' + n(ax) + ',' + n(ay + 6 * k) + ' Q' + n(ax + 4 * k) + ',' + n(ay + 6 * k) + ' ' + n(ax + 5 * k) + ',' + n(ay + 1 * k), '#f4f4f0', 1.5 * k);
    o += C(ax, ay - 7 * k, 1.5 * k, 'none') + L('M' + n(ax - 1.5 * k) + ',' + n(ay - 7.5 * k) + ' a' + n(1.5 * k) + ',' + n(1.5 * k) + ' 0 1 1 ' + n(3 * k) + ',0', '#f4f4f0', 1.3 * k);
    return o;
  }
  function ship(c, x, y, s, flip) {
    var o = '';
    var hull = 'M' + pt([x - 40 * s, y - 14 * s]) + 'L' + pt([x + 40 * s, y - 16 * s]) + 'L' + pt([x + 46 * s, y - 24 * s]) + 'L' + pt([x + 32 * s, y]) + 'L' + pt([x - 30 * s, y]) + 'L' + pt([x - 44 * s, y - 20 * s]) + 'Z';
    o += limb('M' + pt([x - 6 * s, y - 14 * s]) + 'L' + pt([x - 6 * s, y - 70 * s]) + 'M' + pt([x + 18 * s, y - 15 * s]) + 'L' + pt([x + 18 * s, y - 56 * s]), '#5a3a22', 2 * s);
    o += body(c, 'M' + pt([x - 26 * s, y - 64 * s]) + 'Q' + pt([x - 6 * s, y - 70 * s]) + ' ' + pt([x + 12 * s, y - 64 * s]) + 'Q' + pt([x + 16 * s, y - 44 * s]) + ' ' + pt([x + 10 * s, y - 24 * s]) + 'Q' + pt([x - 8 * s, y - 28 * s]) + ' ' + pt([x - 24 * s, y - 24 * s]) + 'Q' + pt([x - 18 * s, y - 44 * s]) + ' ' + pt([x - 26 * s, y - 64 * s]) + 'Z', '#f2ede0',
      F('M' + pt([x - 4 * s, y - 68 * s]) + 'L' + pt([x + 16 * s, y - 68 * s]) + 'L' + pt([x + 16 * s, y - 20 * s]) + 'L' + pt([x - 4 * s, y - 20 * s]) + 'Z', '#c8c2b0', 0.8) + L('M' + pt([x - 20 * s, y - 46 * s]) + 'Q' + pt([x - 6 * s, y - 50 * s]) + ' ' + pt([x + 12 * s, y - 46 * s]), '#2a5aa0', 3 * s), 1.6 * s);
    o += body(c, 'M' + pt([x + 20 * s, y - 54 * s]) + 'Q' + pt([x + 36 * s, y - 42 * s]) + ' ' + pt([x + 38 * s, y - 22 * s]) + 'L' + pt([x + 20 * s, y - 22 * s]) + 'Z', '#e8e2d2', '', 1.6 * s);
    o += body(c, 'M' + pt([x - 6 * s, y - 70 * s]) + 'L' + pt([x + 8 * s, y - 74 * s]) + 'L' + pt([x - 6 * s, y - 78 * s]) + 'Z', '#2a5aa0', '', 1.2 * s);
    o += body(c, hull, '#6a4428', F('M' + pt([x - 44 * s, y - 20 * s]) + 'L' + pt([x + 46 * s, y - 24 * s]) + 'L' + pt([x + 44 * s, y - 18 * s]) + 'L' + pt([x - 42 * s, y - 14 * s]) + 'Z', '#2a5aa0', 0.95) + F('M' + pt([x - 44 * s, y - 6 * s]) + 'L' + pt([x + 46 * s, y - 6 * s]) + 'L' + pt([x + 46 * s, y + 2 * s]) + 'L' + pt([x - 44 * s, y + 2 * s]) + 'Z', '#3a2414', 0.7), 1.8 * s);
    for (var i = -2; i <= 2; i++) o += C(x + i * 12 * s, y - 9 * s, 1.8 * s, '#1a1009');
    return flip ? G(o, 'translate(' + n(2 * x) + ',0) scale(-1,1)') : o;
  }
  function brazier(c, x, y, s, fire, inner) {
    var o = '';
    o += C(x, y - 30 * s, 34 * s, glow(c, fire || '#ff6a1a', 0.5));
    o += limb('M' + pt([x - 8 * s, y]) + 'L' + pt([x, y - 16 * s]) + 'L' + pt([x + 8 * s, y]), '#3a3230', 2.4 * s);
    o += body(c, 'M' + pt([x - 13 * s, y - 24 * s]) + 'L' + pt([x + 13 * s, y - 24 * s]) + 'L' + pt([x + 8 * s, y - 14 * s]) + 'L' + pt([x - 8 * s, y - 14 * s]) + 'Z', '#4a4240', F('M' + pt([x + 2 * s, y - 26 * s]) + 'L' + pt([x + 14 * s, y - 26 * s]) + 'L' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 2 * s, y - 12 * s]) + 'Z', '#2a2422', 0.8), 1.8 * s);
    o += P('M' + pt([x - 13 * s, y - 24 * s]) + 'L' + pt([x - 17 * s, y - 30 * s]) + 'L' + pt([x - 9 * s, y - 24 * s]) + 'Z M' + pt([x + 13 * s, y - 24 * s]) + 'L' + pt([x + 17 * s, y - 30 * s]) + 'L' + pt([x + 9 * s, y - 24 * s]) + 'Z', '#4a4240', 1.4 * s);
    o += flame(c, x - 4 * s, y - 24 * s, 0.8 * s, fire, inner) + flame(c, x + 4 * s, y - 24 * s, 0.75 * s, fire, inner) + flame(c, x, y - 24 * s, 1.15 * s, fire, inner);
    return o;
  }
  function candle(c, x, y, h, s) {
    s = s || 1;
    return C(x, y - h - 5 * s, 12 * s, glow(c, '#ff3a2a', 0.6)) +
      P('M' + n(x - 3 * s) + ',' + n(y) + ' L' + n(x - 3 * s) + ',' + n(y - h) + ' Q' + n(x) + ',' + n(y - h - 2 * s) + ' ' + n(x + 3 * s) + ',' + n(y - h) + ' L' + n(x + 3 * s) + ',' + n(y) + ' Z', c.cel('#a8201a'), 1.3 * s) +
      L('M' + n(x - 3 * s) + ',' + n(y - h + 3 * s) + ' q-1,' + n(4 * s) + ' 0,' + n(6 * s), '#d8403a', 1 * s) +
      P('M' + n(x) + ',' + n(y - h - 1) + ' C' + n(x - 3 * s) + ',' + n(y - h - 4 * s) + ' ' + n(x - 1 * s) + ',' + n(y - h - 8 * s) + ' ' + n(x) + ',' + n(y - h - 11 * s) + ' C' + n(x + 1 * s) + ',' + n(y - h - 8 * s) + ' ' + n(x + 3 * s) + ',' + n(y - h - 4 * s) + ' ' + n(x) + ',' + n(y - h - 1) + ' Z', '#ff5a3a', 1 * s) +
      C(x, y - h - 4 * s, 1.2 * s, '#ffd0a0');
  }
  function stalactites(seed, y, col, cnt, len) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var x = (i + r() * 0.6) * 400 / cnt, w = 5 + r() * 8, h = (len || 18) * (0.5 + r()); s += F('M' + n(x - w) + ',' + n(y - 2) + ' L' + n(x) + ',' + n(y + h) + ' L' + n(x + w) + ',' + n(y - 2) + ' Z', col); }
    return s;
  }
  function tent(c, x, y, s, col) {
    col = col || '#b88a58';
    var o = E(x, y + 1, 26 * s, 4 * s, '#000', 0, 0.22);
    o += body(c, 'M' + pt([x - 26 * s, y]) + 'L' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 26 * s, y]) + 'Z', col, F('M' + pt([x, y - 36 * s]) + 'L' + pt([x + 26 * s, y]) + 'L' + pt([x + 6 * s, y]) + 'Z', dk(col, 0.3), 0.8) + L('M' + pt([x - 16 * s, y - 14 * s]) + 'L' + pt([x + 16 * s, y - 14 * s]), '#8a2a1a', 3 * s), 1.8 * s);
    o += L('M' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x - 10 * s, y - 46 * s]) + 'M' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 10 * s, y - 46 * s]), OL, 4 * s) + L('M' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x - 10 * s, y - 46 * s]) + 'M' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 10 * s, y - 46 * s]), '#7a5030', 2 * s);
    o += P('M' + pt([x - 6 * s, y]) + 'L' + pt([x, y - 14 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#2a1a10', 1.4 * s);
    return o;
  }
  function crate(c, x, y, s) {
    return body(c, 'M' + pt([x - 9 * s, y]) + 'L' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z', '#9a6a3a', L('M' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y]) + 'M' + pt([x - 9 * s, y - 8 * s]) + 'L' + pt([x + 9 * s, y - 8 * s]), '#5a3a1e', 1.6 * s) + F('M' + pt([x + 3 * s, y - 17 * s]) + 'L' + pt([x + 10 * s, y - 17 * s]) + 'L' + pt([x + 10 * s, y]) + 'L' + pt([x + 3 * s, y]) + 'Z', '#5a3a1e', 0.5), 1.6 * s);
  }
  function cracks(seed, y0, y1, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = r() * 400, y = y0 + r() * (y1 - y0), k = 0.6 + (y - y0) / (y1 - y0);
      d += 'M' + pt([x, y]);
      for (var j = 0; j < 3; j++) { x += (r() - 0.3) * 22 * k; y += (r() - 0.5) * 8 * k; d += 'L' + pt([x, y]); }
      d += 'M' + pt([x - 8 * k, y]) + 'l' + n(-6 * k) + ',' + n(5 * k);
    }
    return L(d, col, 1.6);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    valley_of_trials: function (c) {
      var o = sky(c, '#e59a58', '#f3c486', '#fbe2b2') + sun(c, 300, 44, 11, '#fff2c8');
      o += mesa(-20, 150, 120, 44, '#d49066', '#b87450') + mesa(120, 150, 90, 30, '#cf8a60', '#b0704c') + mesa(200, 150, 130, 50, '#d49066', '#b87450') + mesa(310, 150, 110, 36, '#cf8a60', '#b0704c');
      o += cliff(c, [[-10, 40], [30, 34], [60, 50], [86, 56], [106, 98], [122, 150]], 158, '#b0502c', 'M60,50 L86,56 L106,98 L122,150 L60,160 Z');
      o += cliff(c, [[292, 150], [306, 104], [326, 64], [360, 50], [410, 44]], 158, '#a84a2a', 'M340,56 L410,48 L410,160 L330,160 Z');
      o += ground(c, 148, '#d08a52', '#b0602e') + road(c, 148, 26, 120, '#e8b07a');
      o += pebbles(11, 160, 236, '#8a4a26', 18);
      o += orcHut(c, 92, 158, 0.9, '#caa068') + orcHut(c, 316, 160, 1.02, '#c29060') + orcHut(c, 236, 150, 0.62, '#caa068');
      o += banner(c, 146, 160, 44) + banner(c, 272, 156, 38);
      o += bonfire(c, 200, 170, 1.05);
      o += brush(c, 20, 196, 1.3) + brush(c, 380, 204, 1.4) + brush(c, 150, 186, 0.8) + brush(c, 264, 222, 0.9);
      o += rock(c, 350, 238, 44, 20, '#9a4a2a') + rock(c, 48, 240, 38, 16, '#a4532e');
      return o + vignette(c);
    },
    burning_blade_coven: function (c) {
      var o = sky(c, '#2a1418', '#4a2020', '#6a2c22');
      o += mesa(-10, 150, 140, 60, '#4a2220', '#3a1a18') + mesa(270, 150, 150, 54, '#4a2220', '#3a1a18');
      // cliff face with cave mouth
      var face = 'M-6,150 L-6,70 C40,40 90,26 140,24 C200,20 260,24 310,40 C350,52 390,70 406,82 L406,150 Z';
      o += body(c, face, '#7a3424', F('M260,26 C320,40 380,62 406,80 L406,150 L300,150 Z', '#5a2418', 0.8) + L('M-6,96 Q120,84 406,104 M-6,124 Q180,112 406,130 M20,70 Q140,54 280,64', '#5a2418', 1.6, 0.7), 2.2);
      o += C(200, 118, 88, glow(c, '#ff2a1a', 0.55));
      var mouth = 'M128,152 C124,110 150,70 200,66 C250,70 276,110 272,152 Z';
      o += P(mouth, c.lg([[0, '#1a0806'], [0.6, '#2a0a08'], [1, '#6a1810']]), 2.4);
      o += '<g clip-path="url(#' + c.clip(mouth) + ')">' + E(200, 150, 60, 34, glow(c, '#ff3a1a', 0.85)) + E(200, 150, 26, 12, '#ff6a3a', 0, 0.5) + '</g>';
      o += C(186, 110, 2.2, '#ff5040') + C(214, 110, 2.2, '#ff5040');
      o += stalactites(3, 68, '#1a0806', 0, 0);
      o += ground(c, 148, '#6a2c1e', '#3a1610');
      // demonic sigil on the ground
      o += E(200, 196, 110, 26, 'none') + '<ellipse cx="200" cy="196" rx="104" ry="24" fill="none" stroke="#ff3a2a" stroke-width="2.6" opacity="0.85"/>' +
        '<ellipse cx="200" cy="196" rx="84" ry="18" fill="none" stroke="#ff3a2a" stroke-width="1.4" opacity="0.7"/>' +
        L('M122,203 L278,189 M140,184 L262,212 M200,172 L200,220 M110,196 L290,196', '#ff3a2a', 1.4, 0.55) + E(200, 196, 110, 26, glow(c, '#ff2a1a', 0.35));
      o += rock(c, 96, 164, 34, 18, '#5a2418') + rock(c, 312, 166, 36, 20, '#5a2418');
      o += candle(c, 92, 150, 14) + candle(c, 104, 152, 10) + candle(c, 300, 152, 16) + candle(c, 316, 154, 10) + candle(c, 140, 166, 12) + candle(c, 262, 168, 13) +
        candle(c, 40, 206, 18, 1.3) + candle(c, 58, 214, 12, 1.3) + candle(c, 356, 208, 20, 1.3) + candle(c, 374, 216, 12, 1.3);
      o += brush(c, 16, 182, 1.2, '#4a2a18') + brush(c, 386, 186, 1.2, '#4a2a18');
      o += pebbles(7, 168, 236, '#2a0e08', 14);
      return o + vignette(c, '#ffb0a0', '#100404');
    },
    razor_hill: function (c) {
      var o = sky(c, '#dc9658', '#f0bf82', '#f8dcaa') + sun(c, 90, 40, 10, '#fff2c8');
      o += mesa(-20, 150, 110, 38, '#d49066', '#b87450') + mesa(80, 150, 120, 52, '#cf8a60', '#b0704c') + mesa(240, 150, 100, 34, '#d49066', '#b87450') + mesa(320, 150, 110, 48, '#cf8a60', '#b0704c');
      o += ground(c, 146, '#d08a52', '#b0602e') + road(c, 146, 22, 110, '#e8b07a');
      o += palisade(c, -6, 170, 150, 22, '#7a4e2a', 8) + palisade(c, 232, 406, 150, 22, '#7a4e2a', 8);
      o += orcHut(c, 150, 150, 0.5) + orcHut(c, 262, 150, 0.46);
      o += barracks(c, 84, 166, 0.95);
      o += watchtower(c, 330, 166, 0.95);
      o += banner(c, 168, 170, 50) + banner(c, 226, 170, 50);
      o += tent(c, 392, 176, 0.6);
      o += crate(c, 262, 184, 1.1) + crate(c, 278, 182, 0.9);
      o += pebbles(21, 170, 236, '#8a4a26', 16);
      o += brush(c, 24, 214, 1.3) + brush(c, 382, 224, 1.2) + brush(c, 140, 230, 0.8);
      return o + vignette(c);
    },
    thunder_ridge: function (c) {
      var o = sky(c, '#3a3e52', '#6a6878', '#a88a78');
      o += F('M-4,-4 L404,-4 L404,20 C340,30 300,14 240,24 C180,34 120,16 60,26 C30,30 10,24 -4,28 Z', '#2e3044');
      o += C(248, 96, 70, glow(c, '#bfe0ff', 0.35));
      o += stormcloud(c, 40, 40, 1.5, '#4a4c60') + stormcloud(c, 160, 30, 1.6, '#44465a') + stormcloud(c, 300, 30, 1.7, '#3e4054') + stormcloud(c, 390, 48, 1.3, '#50526a');
      o += stormcloud(c, 100, 60, 0.9, '#5a5c70') + stormcloud(c, 200, 62, 0.8, '#5a5c70');
      o += bolt(252, 52, 1.5) + bolt(96, 64, 0.8);
      o += L('M30,80 l-6,14 M70,90 l-6,14 M130,78 l-6,14 M190,88 l-6,14 M290,84 l-6,14 M340,74 l-6,14 M380,92 l-6,14 M20,110 l-6,14 M160,108 l-6,14 M370,112 l-6,14', '#c8d0e0', 1.2, 0.45);
      // jagged far ridges
      o += F('M-10,150 L20,110 L40,122 L70,86 L96,112 L120,96 L150,124 L170,150 Z', '#8a4a38') + F('M70,86 L96,112 L120,96 L150,124 L170,150 L90,150 Z', '#6e3a2c', 0.85);
      o += F('M220,150 L250,100 L276,118 L300,80 L330,108 L360,92 L410,126 L410,150 Z', '#8a4a38') + F('M300,80 L330,108 L360,92 L410,126 L410,150 L310,150 Z', '#6e3a2c', 0.85);
      o += cliff(c, [[-10, 120], [20, 70], [44, 86], [66, 60], [92, 96], [118, 110], [140, 152]], 158, '#9a4630', 'M66,60 L92,96 L118,110 L140,152 L70,158 Z');
      o += cliff(c, [[270, 152], [290, 112], [316, 96], [338, 58], [362, 80], [384, 66], [410, 92]], 158, '#94422c', 'M338,58 L362,80 L384,66 L410,92 L410,158 L340,158 Z');
      o += ground(c, 148, '#b0603a', '#7a3a22');
      o += cracks(5, 162, 234, '#4a2012', 14);
      o += rock(c, 180, 164, 30, 18, '#8a4030') + rock(c, 60, 214, 40, 24, '#8a4030') + rock(c, 352, 224, 50, 30, '#8a4030');
      o += E(252, 150, 26, 5, glow(c, '#bfe0ff', 0.6));
      o += brush(c, 240, 178, 0.9, '#5a3a22') + brush(c, 120, 230, 1.1, '#5a3a22');
      return o + vignette(c, '#d0e0ff', '#100808');
    },
    echo_isles: function (c) {
      var o = sky(c, '#5ab0e0', '#9ad4ee', '#dcf2f4') + sun(c, 330, 34, 10, '#fffbe0');
      o += F('M20,40 C30,30 60,30 70,38 C84,34 98,42 94,50 L16,50 Z', '#ffffff', 0.85) + F('M210,56 C220,48 244,48 252,54 C262,50 276,56 272,62 L206,62 Z', '#ffffff', 0.8);
      o += R(-2, 104, 404, 60, c.lg([[0, '#3fc0c8'], [0.6, '#2aa8b8'], [1, '#48d0c8']]));
      o += L('M30,120 L60,120 M140,130 L176,130 M250,116 L280,116 M320,136 L360,136 M90,142 L118,142', '#e0fbff', 1.6, 0.8);
      // distant islands
      o += F('M40,112 C60,98 110,96 136,112 Z', '#d8c890') + F('M56,106 C70,90 100,90 118,104 L118,110 L56,110 Z', '#3f8a4a');
      o += F('M270,114 C290,96 350,94 380,114 Z', '#d8c890') + F('M290,108 C300,88 346,86 360,106 Z', '#3f8a4a');
      o += palm(c, 330, 108, 0.36, 8) + palm(c, 96, 104, 0.3, -6);
      o += stiltHut(c, 300, 150, 0.9, true) + stiltHut(c, 180, 138, 0.6, true);
      // beach
      o += P('M-4,150 C60,142 140,146 210,152 C280,158 340,152 404,148 L404,244 L-4,244 Z', c.lg([[0, '#f0dca4'], [1, '#d4b474']]), 0);
      o += L('M-4,150 C60,142 140,146 210,152 C280,158 340,152 404,148', '#f6fbff', 2.4, 0.9);
      o += pebbles(31, 170, 236, '#b89a5a', 14);
      o += palm(c, 36, 214, 1.1, 18) + palm(c, 380, 200, 0.9, -14);
      o += voodooTotem(c, 204, 180, 0.85);
      o += rock(c, 150, 176, 22, 10, '#9a8a6a');
      o += C(260, 216, 3, '#f4a0a0', 1.2) + C(140, 226, 2.4, '#f8e8d0', 1.2);
      return o + vignette(c, '#fffcf0', '#203030');
    },
    tiragarde_keep: function (c) {
      var o = sky(c, '#7ab0dc', '#b4d4ea', '#e8eef0') + sun(c, 60, 36, 9, '#fffbe8');
      o += F('M250,40 C262,30 292,30 300,38 C314,34 326,42 322,50 L246,50 Z', '#ffffff', 0.85);
      // sea on the east (right)
      o += R(-2, 112, 404, 44, c.lg([[0, '#3a86b8'], [1, '#2a6a9a']]));
      o += L('M300,124 L330,124 M350,136 L384,136 M250,142 L276,142', '#dff0ff', 1.4, 0.8);
      o += ship(c, 330, 140, 0.62) + ship(c, 390, 130, 0.42, true);
      // coast land left
      o += F('M-4,112 C60,106 140,108 230,122 C260,128 270,140 262,156 L-4,156 Z', '#c07a4a') + F('M150,114 C200,118 240,126 262,156 L180,156 Z', '#9a5a36', 0.8);
      o += stoneKeep(c, 128, 154, 0.8);
      // dock
      o += body(c, 'M258,154 L360,150 L360,156 L258,160 Z', '#8a6a42', '', 1.6);
      for (var i = 0; i < 5; i++) o += limb('M' + (266 + i * 22) + ',' + (158 - i) + ' L' + (266 + i * 22) + ',' + (170 - i), '#6a4a2a', 2);
      o += ground(c, 158, '#c48a58', '#a4683c') + road(c, 158, 20, 110, '#dcb08a');
      o += F('M-4,158 L404,152 L404,162 L-4,166 Z', '#c48a58');
      o += pebbles(41, 176, 236, '#7a4a2a', 14);
      o += brush(c, 22, 206, 1.2, '#7a6a3a') + brush(c, 380, 212, 1.2, '#7a6a3a');
      o += crate(c, 196, 176, 0.9) + crate(c, 210, 178, 0.75) + rock(c, 70, 236, 40, 18, '#8a6a52');
      return o + vignette(c, '#ffffff', '#202838');
    },
    orgrimmar: function (c) {
      var o = sky(c, '#d88a4e', '#eeb478', '#f6d4a0');
      // towering red rock walls
      o += cliff(c, [[-10, -4], [60, -4], [84, 20], [96, 70], [120, 110], [136, 156]], 160, '#a0442a', 'M84,20 L96,70 L120,110 L136,156 L70,160 Z');
      o += cliff(c, [[264, 156], [280, 110], [304, 70], [316, 20], [340, -4], [410, -4]], 160, '#9a402a', 'M320,20 L340,-4 L410,-4 L410,160 L330,160 Z');
      // back wall with the great gate
      o += body(c, 'M110,156 L110,62 C150,50 250,50 290,62 L290,156 Z', '#8a3a24', F('M230,54 L292,62 L292,156 L240,156 Z', '#6a2a1a', 0.8) + L('M110,92 Q200,84 290,92 M110,124 Q200,118 290,124', '#6a2a1a', 1.6, 0.7), 2.2);
      var gate = 'M150,156 L150,98 C150,70 250,70 250,98 L250,156 Z';
      o += body(c, gate, '#5a3a22', L('M170,78 L170,156 M190,72 L190,156 M210,72 L210,156 M230,78 L230,156', '#3a2414', 2) + L('M150,110 L250,110 M150,136 L250,136', '#6a6a70', 3.4) + F('M200,70 L250,90 L250,156 L200,156 Z', '#2a1a10', 0.35), 2.4);
      o += C(200, 124, 7, '#8a8a92', 1.8);
      // arch spikes
      for (var i = 0; i < 9; i++) { var a = Math.PI * (0.95 - i * 0.9 / 8), sx = 200 + Math.cos(a) * 58, sy = 100 - Math.sin(a) * 34; o += P('M' + pt([sx - 4, sy]) + 'L' + pt([200 + Math.cos(a) * 80, 100 - Math.sin(a) * 52]) + 'L' + pt([sx + 4, sy]) + 'Z', '#3a3a40', 1.6); }
      o += body(c, 'M140,100 C140,58 260,58 260,100 L250,100 C250,72 150,72 150,100 Z', '#4a4a52', '', 2);
      // banners hanging on the walls
      [[124, 70], [264, 70]].forEach(function (b) { o += body(c, 'M' + (b[0] - 10) + ',' + b[1] + ' L' + (b[0] + 10) + ',' + b[1] + ' L' + (b[0] + 10) + ',' + (b[1] + 60) + ' L' + b[0] + ',' + (b[1] + 52) + ' L' + (b[0] - 10) + ',' + (b[1] + 60) + ' Z', '#a8201a', F('M' + (b[0] + 3) + ',' + b[1] + ' L' + (b[0] + 11) + ',' + b[1] + ' L' + (b[0] + 11) + ',' + (b[1] + 61) + ' L' + (b[0] + 3) + ',' + (b[1] + 56) + ' Z', '#6a1410', 0.8), 1.8) + F('M' + (b[0] - 6) + ',' + (b[1] + 18) + ' L' + (b[0] - 2) + ',' + (b[1] + 32) + ' L' + (b[0] + 2) + ',' + (b[1] + 32) + ' L' + (b[0] + 6) + ',' + (b[1] + 18) + ' L' + (b[0] + 2) + ',' + (b[1] + 24) + ' L' + b[0] + ',' + (b[1] + 13) + ' L' + (b[0] - 2) + ',' + (b[1] + 24) + ' Z', '#1a1009') + limb('M' + (b[0] - 14) + ',' + b[1] + ' L' + (b[0] + 14) + ',' + b[1], '#5a3a22', 2); });
      o += ground(c, 154, '#d89a62', '#b06a36') + road(c, 154, 50, 150, '#ecc08a');
      o += tent(c, 60, 176, 0.9) + tent(c, 344, 178, 0.95, '#a87a4a');
      o += banner(c, 86, 196, 62) + banner(c, 300, 196, 62);
      o += brazier(c, 142, 172, 0.8) + brazier(c, 258, 172, 0.8);
      [[176, 160, 1], [190, 158, 0.9], [222, 161, 1.05], [238, 158, 0.85], [164, 166, 1.1]].forEach(function (f) {
        var x = f[0], y = f[1], k = f[2], col = '#6a3a24';
        o += F('M' + n(x - 4 * k) + ',' + n(y) + ' L' + n(x - 5 * k) + ',' + n(y - 12 * k) + ' C' + n(x - 6 * k) + ',' + n(y - 17 * k) + ' ' + n(x + 6 * k) + ',' + n(y - 17 * k) + ' ' + n(x + 5 * k) + ',' + n(y - 12 * k) + ' L' + n(x + 4 * k) + ',' + n(y) + ' Z', col, 0.85) + C(x - 1 * k, y - 19 * k, 3.4 * k, col, 0, 0.85);
      });
      o += crate(c, 22, 206, 1.1) + crate(c, 38, 210, 0.9) + crate(c, 376, 214, 1.1);
      // dust haze
      o += E(200, 176, 180, 16, '#f6d8a8', 0, 0.35);
      o += pebbles(51, 184, 236, '#9a5a2e', 14);
      return o + vignette(c);
    },
    ragefire_chasm: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#1a0a08'], [0.5, '#3a140c'], [1, '#2a0c08']]));
      // back wall
      o += F('M-4,120 C40,90 80,96 120,80 C160,66 200,74 240,64 C290,56 340,78 404,70 L404,150 L-4,150 Z', '#4a1c12') + F('M240,64 C290,56 340,78 404,70 L404,150 L260,150 Z', '#3a140c', 0.8);
      o += stalactites(9, 0, '#140806', 14, 30) + stalactites(19, 0, '#221008', 10, 18);
      // lavafalls
      [[52, 92, 12], [338, 74, 14]].forEach(function (f) {
        o += C(f[0], 110, 40, glow(c, '#ff6a1a', 0.45));
        o += P('M' + (f[0] - f[2] / 2) + ',' + f[1] + ' C' + (f[0] - f[2] / 2 - 2) + ',110 ' + (f[0] - f[2] / 2 - 4) + ',124 ' + (f[0] - f[2]) + ',132 L' + (f[0] + f[2]) + ',132 C' + (f[0] + f[2] / 2 + 4) + ',124 ' + (f[0] + f[2] / 2 + 2) + ',110 ' + (f[0] + f[2] / 2) + ',' + f[1] + ' Z', c.lg([[0, '#ff8a1a'], [0.5, '#ffc040'], [1, '#ff9a2a']]), 1.8);
        o += L('M' + (f[0] - 1) + ',' + (f[1] + 6) + ' L' + (f[0] - 2) + ',128', '#fff0a0', 1.6, 0.8);
      });
      // lava river
      o += R(-2, 128, 404, 34, c.lg([[0, '#ffd04a'], [0.4, '#ff8a1a'], [1, '#d8401a']]));
      o += R(-2, 60, 404, 110, c.lg([[0, '#ff6a1a', 0], [0.6, '#ff6a1a', 0.35], [1, '#ff6a1a', 0]]));
      o += L('M20,140 Q40,136 60,140 M120,150 Q150,144 176,150 M260,138 Q290,134 312,140 M340,154 Q360,150 384,154', '#fff0a0', 2, 0.8);
      o += C(80, 146, 3, '#fff0a0', 0, 0.8) + C(300, 150, 2.4, '#fff0a0', 0, 0.8);
      // rock bridge
      o += body(c, 'M110,136 C150,112 250,112 290,136 L290,146 C250,124 150,124 110,146 Z', '#4a2a22', F('M110,142 C150,120 250,120 290,142 L290,146 C250,124 150,124 110,146 Z', '#2a1610', 0.9), 2.2);
      o += rock(c, 110, 150, 40, 30, '#4a2a22') + rock(c, 292, 150, 40, 30, '#4a2a22');
      // near floor
      o += P('M-4,158 C60,152 140,160 200,156 C270,152 330,160 404,154 L404,244 L-4,244 Z', c.lg([[0, '#5a2a1c'], [1, '#2a120c']]), 2.2);
      o += L('M40,190 L72,196 L90,188 M300,200 L330,194 L360,204 M170,220 L204,214 L232,224', '#ff7a1a', 2.4, 0.9) + L('M40,190 L72,196 L90,188 M300,200 L330,194 L360,204 M170,220 L204,214 L232,224', '#ffd04a', 1, 0.9);
      o += rock(c, 20, 176, 40, 34, '#3a1c14') + rock(c, 384, 180, 44, 40, '#3a1c14');
      o += brazier(c, 168, 172, 0.95) + brazier(c, 232, 172, 0.95);
      o += pebbles(61, 170, 236, '#1a0806', 14);
      return o + vignette(c, '#ffb070', '#0a0302');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2); }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1), OL, 1.2); }

  // ---- weapons ----
  function curvedDagger(p, s) {
    s = s || 1; var x = p[0], y = p[1];
    return P('M' + pt([x - 2, y - 2]) + 'C' + pt([x - 10 * s, y - 8 * s]) + ' ' + pt([x - 18 * s, y - 18 * s]) + ' ' + pt([x - 16 * s, y - 28 * s]) + 'C' + pt([x - 12 * s, y - 20 * s]) + ' ' + pt([x - 6 * s, y - 12 * s]) + ' ' + pt([x + 2, y - 5]) + 'Z', '#d8dce0', 1.8) +
      L('M' + pt([x - 5, y - 2]) + 'L' + pt([x + 3, y - 8]), OL, 5) + L('M' + pt([x - 5, y - 2]) + 'L' + pt([x + 3, y - 8]), '#c8a040', 2.4);
  }
  function sword(p, len, ang, blade, s) {
    var x = p[0], y = p[1], a = ang, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; s = s || 1;
    var tip = [x + ca * len, y + sa * len], b0 = [x + ca * 7, y + sa * 7];
    var d = 'M' + pt([b0[0] + px * 3 * s, b0[1] + py * 3 * s]) + 'L' + pt([tip[0] + px * 2.5 * s, tip[1] + py * 2.5 * s]) + 'Q' + pt([tip[0] + ca * 4, tip[1] + sa * 4]) + ' ' + pt([tip[0] - px * 3 * s, tip[1] - py * 3 * s]) + 'L' + pt([b0[0] - px * 3 * s, b0[1] - py * 3 * s]) + 'Z';
    return P(d, _cur.cel(blade || '#c8ccd2'), 1.8) + L('M' + pt([b0[0] + ca * 2, b0[1] + sa * 2]) + 'L' + pt([tip[0] - ca * 4, tip[1] - sa * 4]), '#ffffff', 1, 0.6) +
      L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), OL, 5) + L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), '#d8b048', 2.6) +
      L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), OL, 5) + L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), '#5a3a22', 2.6);
  }
  // cutlass: curved wide blade
  function cutlass(p, s) {
    var x = p[0], y = p[1]; s = s || 1;
    return P('M' + pt([x - 3, y - 5]) + 'C' + pt([x - 10 * s, y - 20 * s]) + ' ' + pt([x - 14 * s, y - 32 * s]) + ' ' + pt([x - 12 * s, y - 44 * s]) + 'C' + pt([x - 6 * s, y - 34 * s]) + ' ' + pt([x + 2 * s, y - 20 * s]) + ' ' + pt([x + 3, y - 7]) + 'Z', _cur.cel('#d0d4da'), 1.8) +
      L('M' + pt([x - 8, y - 6]) + 'L' + pt([x + 8, y - 6]), OL, 5) + L('M' + pt([x - 8, y - 6]) + 'L' + pt([x + 8, y - 6]), '#e0b848', 2.6) +
      L('M' + pt([x + 7, y - 6]) + 'Q' + pt([x + 9, y + 4]) + ' ' + pt([x + 1, y + 6]), OL, 3.6) + L('M' + pt([x + 7, y - 6]) + 'Q' + pt([x + 9, y + 4]) + ' ' + pt([x + 1, y + 6]), '#e0b848', 1.4);
  }
  function staff(p, top, bot, col) {
    var d = 'M' + pt(top) + 'L' + pt(bot);
    return limb(d, col || '#6a4424', 3.4) + L(d, lt(col || '#6a4424', 0.3), 1, 0.6);
  }
  function feathers(x, y, cols, s) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = -0.4 + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function skull(x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', _cur.cel('#ece4cc'), 1.6) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, '#1a1009') + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, '#1a1009') + L('M' + pt([x - 1.5 * s, y + 4 * s]) + 'L' + pt([x - 1.5 * s, y + 6 * s]) + 'M' + pt([x + 1.5 * s, y + 4 * s]) + 'L' + pt([x + 1.5 * s, y + 6 * s]), OL, 0.9);
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
  // Kessari troll head (Realm of Loner design): tall lean face, modest ear, short nose, small lower tusks,
  // hair pulled into a topknot with bead-tied braids down the back, bone earring
  function braid(x0, y0, x1, y1, col, bead) {
    var s = '', k, N = 5;
    for (k = 0; k < N; k++) {
      var t = k / (N - 1), bx = x0 + (x1 - x0) * t, by = y0 + (y1 - y0) * t;
      s += E(bx, by, 2.7 - t * 0.5, 2.6, c_(col), 1.2);
    }
    s += L('M' + pt([x1, y1 + 2]) + 'L' + pt([x1 + 0.5, y1 + 6]), col, 1.6);
    return s + C(x1, y1 + 3, 2, bead || '#ece4cc', 1.1);
  }
  function trollHead(c, x, y, o) {
    var sk = o.skin || '#7f9a86', hc = o.hair || '#2e2620', s = '';
    // back braid (behind the head)
    s += braid(x + 10, y, x + 18, y + 24, dk(hc, 0.15), '#ece4cc');
    // ear: moderate and pointed, not the long swept blade
    s += P('M' + pt([x + 7, y - 3]) + 'L' + pt([x + 19, y - 10]) + 'L' + pt([x + 10, y + 5]) + 'Z', c.cel(sk), 2);
    var d = 'M' + pt([x - 8, y - 12]) + 'C' + pt([x - 3, y - 18]) + ' ' + pt([x + 10, y - 16]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 11, y + 8]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 11, y + 11]) + 'C' + pt([x - 13, y + 8]) + ' ' + pt([x - 11, y + 5]) + ' ' + pt([x - 10, y + 4]) + 'L' + pt([x - 16, y + 2]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 12, y - 5]) + ' ' + pt([x - 9, y - 6]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8));
    // bone earring
    s += L('M' + pt([x + 11, y + 2]) + 'Q' + pt([x + 10, y + 7]) + ' ' + pt([x + 13, y + 7]), '#ece4cc', 1.6) + C(x + 13, y + 8, 1.6, '#ece4cc', 1);
    // hair: close cap swept back into a topknot
    if (!o.mask || o.mask === 'wood') {
      s += P('M' + pt([x - 9, y - 9]) + 'C' + pt([x - 6, y - 19]) + ' ' + pt([x + 10, y - 20]) + ' ' + pt([x + 13, y - 7]) + 'L' + pt([x + 13, y + 1]) + 'C' + pt([x + 10, y - 4]) + ' ' + pt([x + 4, y - 10]) + ' ' + pt([x - 9, y - 9]) + 'Z', c.cel(hc), 2);
      s += E(x + 4, y - 20, 4.6, 3.6, c.cel(hc), 1.8) + L('M' + pt([x + 1, y - 17]) + 'L' + pt([x + 7, y - 17]), '#ece4cc', 1.8);
      s += L('M' + pt([x - 4, y - 15]) + 'C' + pt([x + 1, y - 17]) + ' ' + pt([x + 7, y - 15]) + ' ' + pt([x + 11, y - 8]), dk(hc, 0.35), 1, 0.8);
    }
    if (o.mask === 'wood') {
      s += body(c, 'M' + pt([x - 15, y - 11]) + 'C' + pt([x - 12, y - 17]) + ' ' + pt([x + 2, y - 17]) + ' ' + pt([x + 4, y - 9]) + 'L' + pt([x + 3, y + 3]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x - 10, y + 9]) + ' ' + pt([x - 16, y + 3]) + 'Z', '#b8864a', L('M' + pt([x - 13, y - 1]) + 'L' + pt([x + 2, y - 1]) + 'M' + pt([x - 12, y + 3]) + 'L' + pt([x, y + 3]), '#c8302a', 1.6), 2);
      s += P('M' + pt([x - 12, y - 7]) + 'L' + pt([x - 5, y - 5]) + 'L' + pt([x - 11, y - 3]) + 'Z', '#1a1009', 0) + C(x - 9, y - 5, 1.3, o.eye || '#b070ff');
    } else if (o.mask === 'skull') {
      s += body(c, 'M' + pt([x - 16, y - 10]) + 'C' + pt([x - 14, y - 22]) + ' ' + pt([x + 6, y - 22]) + ' ' + pt([x + 7, y - 9]) + 'L' + pt([x + 5, y + 2]) + 'L' + pt([x - 2, y + 6]) + 'L' + pt([x - 10, y + 6]) + 'L' + pt([x - 17, y + 1]) + 'Z', '#ece4cc',
        F('M' + pt([x + 1, y - 22]) + 'L' + pt([x + 10, y - 22]) + 'L' + pt([x + 10, y + 8]) + 'L' + pt([x - 1, y + 8]) + 'Z', '#b8ac90', 0.7), 2);
      s += E(x - 10, y - 6, 3.4, 3.2, '#1a1009') + E(x - 1, y - 6, 3, 3.2, '#1a1009') + C(x - 10, y - 6, 1.3, o.eye || '#7cff5a') + C(x - 1, y - 6, 1.2, o.eye || '#7cff5a');
      s += P('M' + pt([x - 7, y - 1]) + 'L' + pt([x - 5, y + 2]) + 'L' + pt([x - 9, y + 2]) + 'Z', '#1a1009', 0);
      s += L('M' + pt([x - 13, y + 4]) + 'L' + pt([x - 13, y + 7]) + 'M' + pt([x - 9, y + 5]) + 'L' + pt([x - 9, y + 8]) + 'M' + pt([x - 5, y + 5]) + 'L' + pt([x - 5, y + 8]) + 'M' + pt([x - 1, y + 4]) + 'L' + pt([x - 1, y + 7]), OL, 1.2);
      // braided hair falling from under the skull
      s += braid(x + 6, y - 4, x + 9, y + 16, o.hair || '#e8e0d0', '#c8302a');
    } else {
      s += L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 1, y - 5]), OL, 2.4);
      s += C(x - 5, y - 2.5, 1.7, o.eye || '#ffcc30', 1);
      if (o.paint) s += L('M' + pt([x - 3, y + 1]) + 'L' + pt([x + 3, y + 3]) + 'M' + pt([x - 2, y + 5]) + 'L' + pt([x + 3, y + 7]), o.paint, 1.6);
    }
    // mouth and small lower tusks
    s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 3, y + 10]), OL, 1.3);
    s += P('M' + pt([x - 10, y + 11]) + 'L' + pt([x - 11, y + 5.5]) + 'L' + pt([x - 7.5, y + 10.5]) + 'Z', '#f4ecd6', 1.1);
    return s;
  }
  // cowrie-shell and bone-bead necklace
  function shells(x, y) {
    var s = L('M' + (x - 11) + ',' + y + ' Q' + x + ',' + (y + 9) + ' ' + (x + 11) + ',' + y, '#3a2a1a', 1.2);
    [[-7, 3.6, 1], [0, 5.4, 0], [7, 3.6, 1]].forEach(function (b) {
      s += b[2] ? C(x + b[0], y + b[1], 1.9, '#d8c8a8', 1) : E(x + b[0], y + b[1] + 1, 2.6, 3.4, '#f2e6cc', 1.1) + L('M' + n(x + b[0]) + ',' + n(y + b[1] - 1) + ' l0,4', OL, 0.9);
    });
    return s;
  }
  // cloth foot-wraps over a soft sole
  function wraps(x, y, col) {
    return boot(x, y, col) + L('M' + n(x - 5) + ',' + n(y - 7) + ' L' + n(x + 5) + ',' + n(y - 4) + ' M' + n(x - 6) + ',' + n(y - 3) + ' L' + n(x + 5) + ',' + n(y - 1), lt(col, 0.35), 1.2) + L('M' + n(x - 9) + ',' + n(y + 1) + ' L' + n(x + 6) + ',' + n(y + 1), '#3a2a1a', 1.6);
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

  // ---- biped rig (facing left) ----
  // o: skin, shirt, pants, boots, robe, robeTrim, belt, pads, head(c,x,y), hx, hy, near:[pts], far:[pts], wNear(c,p), wFar(c,p),
  //    back(c), front(c), feet:'boot'|'toes', legW, armW, sleeve, loin, chest(c) extra, tf
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
    if (!o.robe) {
      var toe = o.feet === 'toes' ? toes2 : o.feet === 'wrap' ? wraps : boot;
      s += limb('M68,' + hipY + ' L71,103 L72,113', dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
      s += limb('M56,' + hipY + ' L53,103 L52,113', pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    } else {
      s += boot(54, 121, o.boots || '#2d2420') + boot(74, 121, o.boots || '#2d2420');
      var rc = o.robe, rd = 'M49,' + (hipY - 16) + ' L79,' + (hipY - 16) + ' C84,96 88,108 90,118 L78,116 L70,119 L62,116 L52,119 L40,117 C42,106 46,96 49,' + (hipY - 16) + ' Z';
      s += body(c, rd, rc, F('M68,70 L92,70 L92,122 L72,122 C74,104 72,86 68,70 Z', dk(rc, 0.28), 0.85) + L('M60,90 L56,116 M70,92 L70,118', dk(rc, 0.35), 1.4) +
        (o.robeTrim ? L('M40,117 L52,119 L62,116 L70,119 L78,116 L90,118', o.robeTrim, 3) + L('M64,' + (hipY - 14) + ' L62,117', o.robeTrim, 2.6) : ''));
    }
    if (o.loin) s += body(c, 'M52,82 L76,82 L74,100 L68,96 L64,104 L60,96 L54,100 Z', o.loin, L('M56,90 L72,90', dk(o.loin, 0.35), 1.2));
    // torso
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L92,40 L92,96 L70,96 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, '#d8b048', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 3, hy + 8, 10, 8, c.cel(sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    if (o.cuff) s += C(near[1][0], near[1][1], 0.1, 'none');
    s += hand(near[near.length - 1], c.cel(o.glove || sk));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  function shoulderPad(c, x, y, col, spikes) {
    var s = body(c, 'M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y + 4]) + 'Z', col, '', 2);
    if (spikes) s += P('M' + pt([x - 5, y - 3]) + 'L' + pt([x - 7, y - 13]) + 'L' + pt([x - 1, y - 4]) + 'Z', '#e8dcc0', 1.4) + P('M' + pt([x + 2, y - 4]) + 'L' + pt([x + 4, y - 14]) + 'L' + pt([x + 6, y - 3]) + 'Z', '#e8dcc0', 1.4);
    return s;
  }
  function necklace(x, y) { var s = L('M' + (x - 11) + ',' + y + ' Q' + x + ',' + (y + 9) + ' ' + (x + 11) + ',' + y, '#3a2a1a', 1.2); for (var i = -2; i <= 2; i++) s += P('M' + n(x + i * 4.2 - 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.2) + ',' + n(y + 9 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.2 + 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' Z', '#f4ecd6', 1); return s; }

  // ---- quadruped boar ----
  function boar(c, o) {
    var col = o.col, mane = o.mane, s = '';
    s += shadow(c, 64, 50);
    var legFar = dk(col, 0.25);
    s += limb('M54,92 L56,106 L55,116', legFar, 10) + hoofs(55, 122) + limb('M104,90 L108,104 L106,116', legFar, 10) + hoofs(106, 122);
    s += L('M114,74 C123,68 127,78 120,81 C115,82 117,74 122,74', OL, 4.5) + L('M114,74 C123,68 127,78 120,81 C115,82 117,74 122,74', col, 2);
    var bd = 'M34,70 C38,56 64,50 90,54 C110,58 120,70 116,86 C112,98 94,100 74,99 C54,100 40,98 34,90 C30,84 30,76 34,70 Z';
    var spots = '';
    var r = rng(o.seed || 3);
    for (var i = 0; i < 7; i++) spots += E(48 + r() * 60, 64 + r() * 24, 3 + r() * 4, 2 + r() * 3, dk(col, 0.25), 0, 0.7);
    s += body(c, bd, col, F('M24,88 C50,102 90,102 122,90 L122,104 L24,104 Z', dk(col, 0.3), 0.85) + spots + F('M44,60 C64,54 94,54 110,62 C92,60 64,60 44,68 Z', lt(col, 0.2), 0.5));
    // spiky mane
    var m = 'M40,62';
    var sp = o.spikes || 9;
    for (var k = 0; k <= sp; k++) {
      var t = k / sp, bx = 40 + t * 62, by = 60 - Math.sin(t * Math.PI) * 6 + t * 2, hgt = (o.spikeH || 14) * (1 - Math.abs(t - 0.3) * 0.9);
      m += 'L' + pt([bx + 2, by - hgt]) + 'L' + pt([bx + 62 / sp * 0.7, by]);
    }
    m += 'C80,54 56,56 40,66 Z';
    s += body(c, m, mane, F('M40,64 C60,56 84,56 104,62 L104,66 L40,70 Z', dk(mane, 0.3), 0.8), 2);
    // head
    var hd = 'M50,58 C40,57 28,64 22,72 L14,80 C10,84 10,92 14,95 L24,97 C32,99 44,97 52,90 C56,82 56,66 50,58 Z';
    s += body(c, hd, col, F('M14,92 C26,96 42,96 54,86 L56,100 L10,100 Z', dk(col, 0.3), 0.85) + F('M30,66 C38,60 46,58 50,60 C44,62 36,66 30,72 Z', lt(col, 0.2), 0.5));
    s += P('M42,60 L46,46 L53,60 Z', c.cel(mane), 2) + P('M45,58 L47,51 L50,58 Z', '#c07a6a', 0);
    s += E(13, 88, 4.6, 7, c.cel(o.snout || '#c48a7a'), 2) + E(12, 86, 1, 1.6, OL) + E(12, 91, 1, 1.6, OL);
    s += C(32, 74, 2.3, o.eye || '#a0201a', 1.2) + C(31.4, 73.4, 0.7, '#fff');
    s += L('M26,70 L37,72', OL, 2.2);
    var tk = o.tusk || 1;
    s += P('M' + pt([24, 93]) + 'C' + pt([22 - 4 * tk, 92]) + ' ' + pt([19 - 4 * tk, 86 - 4 * tk]) + ' ' + pt([21 - 2 * tk, 80 - 6 * tk]) + 'C' + pt([22, 86]) + ' ' + pt([24, 88]) + ' ' + pt([29, 90]) + 'Z', c.cel('#f4ecd6'), 1.8);
    s += L('M16,95 C22,97 30,96 36,93', OL, 1.4);
    // near legs
    s += limb('M44,90 L42,106 L42,116', col, 11) + hoofs(42, 122) + limb('M96,88 L100,104 L98,116', col, 11) + hoofs(98, 122);
    if (o.scars) s += L('M70,70 L80,80 M76,68 L86,78', lt(col, 0.35), 1.6);
    return s;
  }

  // ---- scorpid ----
  function pincer(c, cx, cy, sc, col) {
    var dcol = dk(col, 0.3), f = function (x, y) { return pt([cx + x * sc, cy + y * sc]); };
    return P('M' + f(-4, -6) + 'C' + f(-12, -14) + ' ' + f(-22, -12) + ' ' + f(-27, -4) + 'C' + f(-20, -5) + ' ' + f(-13, -3) + ' ' + f(-6, -1) + 'Z', c.cel(col), 2) +
      P('M' + f(-5, 2) + 'C' + f(-12, 2) + ' ' + f(-19, 5) + ' ' + f(-23, 10) + 'C' + f(-15, 11) + ' ' + f(-8, 9) + ' ' + f(-2, 6) + 'Z', c.cel(dk(col, 0.1)), 2) +
      body(c, 'M' + f(-7, -7) + 'C' + f(2, -12) + ' ' + f(11, -7) + ' ' + f(11, 0) + 'C' + f(11, 7) + ' ' + f(2, 11) + ' ' + f(-7, 7) + 'C' + f(-10, 3) + ' ' + f(-10, -3) + ' ' + f(-7, -7) + 'Z', col, F('M' + f(-12, 3) + 'L' + f(14, 3) + 'L' + f(14, 14) + 'L' + f(-12, 14) + 'Z', dcol, 0.8), 2);
  }
  function scorpid(c, o) {
    var col = o.col, s = '', dcol = dk(col, 0.3), legF = dk(col, 0.32);
    s += shadow(c, 64, 52);
    // far legs (behind body)
    [[54, 30], [64, 46], [78, 92], [88, 108]].forEach(function (l) { var mx = (l[0] + l[1]) / 2 + (l[1] < l[0] ? -2 : 2); s += limb('M' + l[0] + ',88 L' + n(mx) + ',84 L' + (l[1] + 4) + ',116', legF, 3.6); });
    // far claw
    s += limb('M48,84 L38,76 L30,72', dk(col, 0.2), 6) + pincer(c, 26, 70, 0.8 * (o.clawS || 1), dk(col, 0.2));
    // tail segments
    var tp = [[96, 82], [106, 71], [111, 58], [110, 45], [103, 35], [92, 29], [81, 30]];
    var st = o.tailS || 1;
    tp.forEach(function (p, i) { var r = (10.5 - i * 0.9) * st; s += E(p[0], p[1], r, r * 0.86, c.cel(col), 2.2) + L('M' + pt([p[0] - r * 0.6, p[1] + r * 0.3]) + 'Q' + pt([p[0], p[1] + r * 0.8]) + ' ' + pt([p[0] + r * 0.6, p[1] + r * 0.3]), dcol, 1.2, 0.8); });
    s += P('M80,28 C71,26 66,33 68,42 L61,50 L73,45 C80,40 82,35 80,28 Z', c.cel(o.sting || '#3a2a20'), 2);
    // body
    var bd = 'M36,86 C38,74 54,68 72,68 C90,68 102,76 102,86 C102,96 88,100 70,100 C52,100 36,96 36,86 Z';
    var seg = L('M56,70 Q53,85 56,99 M70,68 Q67,85 70,100 M84,70 Q81,85 84,99', dcol, 1.6) + F('M34,92 C56,102 88,102 104,92 L104,104 L34,104 Z', dcol, 0.8) + F('M44,76 C56,70 84,70 96,76 C84,74 56,74 44,80 Z', lt(col, 0.25), 0.6);
    s += body(c, bd, col, seg);
    if (o.spiky) [50, 63, 77, 90].forEach(function (x) { s += P('M' + (x - 4) + ',72 L' + (x + 1) + ',60 L' + (x + 4) + ',71 Z', c.cel(dk(col, 0.25)), 1.6); });
    // head
    s += body(c, 'M26,86 C26,77 34,73 44,75 L46,95 C36,97 28,95 26,86 Z', col, F('M24,91 C32,96 42,96 48,92 L48,100 L24,100 Z', dcol, 0.8));
    s += C(32, 81, 2, o.eye || '#1a1009') + C(38, 79, 1.7, o.eye || '#1a1009');
    // near legs, splayed out
    [[46, 24], [58, 40], [80, 98], [92, 116]].forEach(function (l) { var mx = (l[0] + l[1]) / 2 + (l[1] < l[0] ? -3 : 3); s += limb('M' + l[0] + ',94 L' + n(mx) + ',90 L' + l[1] + ',118', col, 4.4) + L('M' + l[1] + ',118 l' + (l[1] < l[0] ? -3 : 3) + ',3', OL, 2.6); });
    // near claw (big)
    s += limb('M40,92 L30,98 L22,96', col, 7) + pincer(c, 18, 94, 1.05 * (o.clawS || 1), col);
    return s;
  }

  // ---- trogg (hunched) ----
  function trogg(c, o) {
    var sk = o.skin, s = '';
    s += shadow(c, 64, 36);
    if (o.back) s += o.back(c);
    // far arm
    s += limb('M84,58 L94,76 L92,92', dk(sk, 0.18), 11) + hand([92, 94], c.cel(dk(sk, 0.1)));
    // legs
    s += limb('M74,90 L80,104 L78,114', dk(sk, 0.2), 12) + toes2(79, 121, dk(sk, 0.3));
    s += limb('M58,92 L54,106 L52,114', sk, 12) + toes2(52, 121, dk(sk, 0.3));
    s += body(c, 'M50,86 L80,86 L78,100 L70,96 L64,102 L58,96 L52,100 Z', o.loin || '#6a4a2a', '');
    // torso: big hunched back
    var td = 'M42,64 C42,48 60,38 80,42 C96,46 100,62 94,76 C90,88 80,94 64,94 C52,94 44,86 42,76 Z';
    s += body(c, td, sk, F('M76,38 L104,38 L104,98 L70,98 C82,84 86,60 76,38 Z', dk(sk, 0.25), 0.8) + F('M46,80 C54,90 70,92 90,82 L96,100 L40,100 Z', dk(sk, 0.3), 0.7) + L('M52,66 Q60,72 68,68', dk(sk, 0.3), 1.4));
    // rocky growths on back
    [[70, 42, 8], [82, 44, 9], [90, 54, 7], [60, 44, 6]].forEach(function (g) { s += P('M' + (g[0] - g[2]) + ',' + (g[1] + 3) + ' L' + (g[0] - 2) + ',' + (g[1] - g[2]) + ' L' + (g[0] + g[2]) + ',' + (g[1] + 2) + ' Z', c.cel(o.rock || '#8a8078'), 1.8); });
    if (o.top) s += o.top(c);
    // head, low and forward
    var hx = 34, hy = 52;
    var hd = 'M' + pt([hx - 10, hy - 6]) + 'C' + pt([hx - 8, hy - 16]) + ' ' + pt([hx + 10, hy - 16]) + ' ' + pt([hx + 12, hy - 4]) + 'L' + pt([hx + 12, hy + 6]) + 'C' + pt([hx + 8, hy + 14]) + ' ' + pt([hx - 4, hy + 14]) + ' ' + pt([hx - 10, hy + 10]) + 'L' + pt([hx - 14, hy + 6]) + 'L' + pt([hx - 12, hy]) + 'Z';
    s += body(c, hd, sk, F('M' + pt([hx + 4, hy - 16]) + 'L' + pt([hx + 16, hy - 16]) + 'L' + pt([hx + 16, hy + 16]) + 'L' + pt([hx + 2, hy + 16]) + 'Z', dk(sk, 0.25), 0.8));
    s += P('M' + pt([hx - 12, hy - 5]) + 'C' + pt([hx - 8, hy - 9]) + ' ' + pt([hx, hy - 9]) + ' ' + pt([hx + 4, hy - 5]) + 'L' + pt([hx - 2, hy - 3]) + 'Z', c.cel(dk(sk, 0.2)), 1.6);
    s += C(hx - 5, hy - 2, 1.6, o.eye || '#ffd040', 1);
    s += P('M' + pt([hx - 13, hy + 6]) + 'L' + pt([hx - 2, hy + 8]) + 'L' + pt([hx - 4, hy + 4]) + 'Z', '#2a1010', 1.2) + P('M' + pt([hx - 11, hy + 6]) + 'L' + pt([hx - 10, hy + 2]) + 'L' + pt([hx - 8, hy + 6.5]) + 'Z', '#f4ecd6', 0.8);
    s += P('M' + pt([hx + 6, hy - 6]) + 'L' + pt([hx + 14, hy - 12]) + 'L' + pt([hx + 12, hy]) + 'Z', c.cel(sk), 1.6);
    if (o.crown) s += o.crown(c, hx, hy);
    // near arm with weapon
    if (o.weapon) s += G(o.weapon(c, [30, 96]), 'rotate(' + (o.clubRot == null ? -20 : o.clubRot) + ',30,96)');
    s += limb('M50,66 L40,84 L30,96', sk, 11) + hand([30, 96], c.cel(sk));
    return o.tf ? G(s, o.tf) : s;
  }
  function club(c, p, s, col) {
    s = s || 1; col = col || '#7a5030';
    var x = p[0], y = p[1];
    var d = 'M' + pt([x - 2, y + 4]) + 'L' + pt([x - 10 * s, y - 30 * s]) + 'C' + pt([x - 16 * s, y - 40 * s]) + ' ' + pt([x - 6 * s, y - 48 * s]) + ' ' + pt([x + 2 * s, y - 40 * s]) + 'L' + pt([x + 4, y + 2]) + 'Z';
    return body(c, d, col, F('M' + pt([x - 2 * s, y - 46 * s]) + 'L' + pt([x + 6 * s, y - 46 * s]) + 'L' + pt([x + 6, y + 6]) + 'L' + pt([x + 1, y + 6]) + 'Z', dk(col, 0.3), 0.8), 2) +
      P('M' + pt([x - 12 * s, y - 36 * s]) + 'L' + pt([x - 18 * s, y - 38 * s]) + 'L' + pt([x - 12 * s, y - 32 * s]) + 'Z', '#e8dcc0', 1.4) + P('M' + pt([x - 4 * s, y - 45 * s]) + 'L' + pt([x - 5 * s, y - 52 * s]) + 'L' + pt([x - 1 * s, y - 45 * s]) + 'Z', '#e8dcc0', 1.4);
  }

  function voodooStaff(c, p, glowCol, big) {
    var k = big ? 1.2 : 1, x = p[0], y = p[1];
    var top = [x - 4, y - 62 * k], s = '';
    s += staff(p, top, [x + 3, y + 30]);
    s += feathers(top[0] + 1, top[1] + 10, ['#d83a2a', '#f0c040', '#2f9ab8'], 0.9 * k);
    s += L('M' + pt([top[0] - 1, top[1] + 8]) + 'L' + pt([top[0] + 2, top[1] + 16]), '#3a2a1a', 1.2);
    s += orb(c, top[0], top[1] - 6 * k, 4 * k, glowCol || '#7cff5a');
    s += skull(top[0], top[1] + 5, 0.9 * k);
    return s;
  }

  // ---- mob shared bases ----
  function orcBase(c, o) {
    return biped(c, {
      skin: o.skin || '#6a8a3a', shirt: o.shirt, pants: o.pants || '#5a3a26', boots: o.boots || '#2d2420', robe: o.robe, robeTrim: o.trim, belt: o.belt,
      sleeve: o.sleeve, forearm: o.forearm, bareArms: o.bareArms,
      head: o.head || function (c, x, y) { return orcHead(c, x, y, { skin: o.skin || '#6a8a3a', eye: o.eye, bald: o.bald }); },
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, chest: o.chest, back: o.back, top: o.top, tf: o.tf, hx: o.hx, hy: o.hy, front: o.front, armW: 10, legW: 11
    });
  }
  function hoodedOrc(o) {
    return function (c, x, y) { return hood(c, x, y, o.hoodCol, o.trim) + hoodFace(c, x, y, o.skin || '#6a8a3a', o.eye || '#ff4a2a'); };
  }
  function trollBase(c, o) {
    var sk = o.skin || '#7f9a86';
    return biped(c, {
      skin: sk, shirt: sk, pants: sk, bareArms: true, feet: 'wrap', boots: o.wraps || '#8a7458', loin: o.loin || '#8a5a32', legW: 9, armW: 8.5,
      hx: o.hx || 54, hy: o.hy || 32, hipY: 84,
      torsoD: 'M46,52 C52,46 74,46 80,52 L78,70 L74,86 L52,86 L48,70 Z',
      head: function (c, x, y) { return trollHead(c, x, y, { skin: sk, hair: o.hair, mask: o.mask, eye: o.eye, paint: o.paint }); },
      chest: function (c) { return L('M56,64 Q62,68 68,64', dk(sk, 0.3), 1.4) + L('M48,52 L76,82', '#6a4424', 3) + (o.pads ? '' : shells(62, 52)) + (o.chest ? o.chest(c) : ''); },
      near: o.near || [[48, 56], [38, 72], [30, 82]], far: o.far || [[78, 56], [86, 72], [86, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, back: o.back, top: o.top, tf: o.tf, shadowR: 30
    });
  }
  function humanBase(c, o) {
    return biped(c, {
      skin: o.skin || '#e8b890', shirt: o.shirt, pants: o.pants, boots: o.boots || '#2d2420', belt: o.belt, sleeve: o.sleeve, forearm: o.forearm,
      robe: o.robe, robeTrim: o.trim, glove: o.glove,
      head: function (c, x, y) { return humanHead(c, x, y, o); }, hx: 60, hy: 30,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, chest: o.chest, pads: o.pads, back: o.back, front: o.front, top: o.top, tf: o.tf, armW: 9, legW: 10.5
    });
  }
  function stripes(col) { return L('M44,58 L84,58 M44,66 L84,66 M44,74 L84,74 M46,82 L82,82', col, 3); }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    mottled_boar: function (c) { return G(boar(c, { col: '#9a5a3a', mane: '#5a2a1a', seed: 5 }), at(0.92, 64, 122)); },
    dire_mottled_boar: function (c) { return G(boar(c, { col: '#7a3a26', mane: '#3a1810', seed: 9, spikes: 12, spikeH: 20, tusk: 2, snout: '#a86a5a', eye: '#ff3a1a', scars: true }), at(1.08, 64, 122)); },
    scorpid_worker: function (c) { return G(scorpid(c, { col: '#d4a868', sting: '#5a3a20' }), at(0.9, 64, 122)); },
    scorpid_reaver: function (c) { return G(scorpid(c, { col: '#8a3a26', sting: '#2a1410', eye: '#ffb030', spiky: true, clawS: 1.2, tailS: 1.1 }), at(1.04, 64, 122)); },
    vile_familiar: function (c) {
      var sk = '#c8402a', s = shadow(c, 64, 22);
      // tail
      s += L('M74,104 C90,108 96,96 92,88', OL, 5) + L('M74,104 C90,108 96,96 92,88', sk, 2.4) + P('M92,88 L88,82 L98,84 Z', c.cel(sk), 1.6);
      // legs
      s += limb('M68,100 L74,110 L70,116', dk(sk, 0.2), 6) + toes2(72, 121, '#3a1a12');
      s += limb('M58,100 L54,110 L54,116', sk, 6) + toes2(54, 121, '#3a1a12');
      // body pot-belly
      s += body(c, 'M50,90 C48,76 58,70 66,70 C76,70 80,80 78,92 C76,102 70,106 64,106 C56,106 52,100 50,90 Z', sk, F('M68,68 L84,68 L84,108 L66,108 C74,98 74,80 68,68 Z', dk(sk, 0.28), 0.8) + E(60, 92, 6, 7, lt(sk, 0.2), 0, 0.6));
      // far arm
      s += limb('M74,78 L82,86 L80,94', dk(sk, 0.15), 5.5) + hand([80, 95], c.cel(dk(sk, 0.1)));
      // head
      var hx = 60, hy = 60;
      s += P('M70,56 L92,44 L74,64 Z', c.cel(sk), 2);
      s += P('M58,48 C60,38 70,32 80,34 C72,36 66,42 64,50 Z', c.cel('#3a2a22'), 1.8);
      s += body(c, 'M' + pt([hx - 12, hy - 4]) + 'C' + pt([hx - 10, hy - 14]) + ' ' + pt([hx + 10, hy - 14]) + ' ' + pt([hx + 12, hy - 2]) + 'C' + pt([hx + 12, hy + 8]) + ' ' + pt([hx + 4, hy + 13]) + ' ' + pt([hx - 4, hy + 12]) + 'C' + pt([hx - 10, hy + 11]) + ' ' + pt([hx - 14, hy + 6]) + ' ' + pt([hx - 12, hy - 4]) + 'Z', sk, F('M' + pt([hx + 4, hy - 14]) + 'L' + pt([hx + 14, hy - 14]) + 'L' + pt([hx + 14, hy + 14]) + 'L' + pt([hx + 2, hy + 14]) + 'Z', dk(sk, 0.25), 0.8));
      s += P('M' + pt([hx - 6, hy - 10]) + 'C' + pt([hx - 12, hy - 20]) + ' ' + pt([hx - 8, hy - 26]) + ' ' + pt([hx - 2, hy - 28]) + 'C' + pt([hx - 4, hy - 22]) + ' ' + pt([hx - 2, hy - 16]) + ' ' + pt([hx + 1, hy - 12]) + 'Z', c.cel('#3a2a22'), 1.8);
      s += E(hx - 6, hy - 2, 3, 2.4, '#ffe040', 1.2) + C(hx - 7, hy - 2, 1, OL);
      s += P('M' + pt([hx - 13, hy + 4]) + 'C' + pt([hx - 8, hy + 9]) + ' ' + pt([hx - 2, hy + 9]) + ' ' + pt([hx + 2, hy + 5]) + 'Z', '#2a0a08', 1.4) + P('M' + pt([hx - 10, hy + 5]) + 'L' + pt([hx - 9, hy + 8]) + 'L' + pt([hx - 7, hy + 5.5]) + 'Z M' + pt([hx - 4, hy + 5.5]) + 'L' + pt([hx - 3, hy + 8]) + 'L' + pt([hx - 1, hy + 5]) + 'Z', '#fff', 0);
      // near arm with fireball
      s += limb('M54,78 L44,82 L38,76', sk, 5.5) + hand([38, 75], c.cel(sk));
      s += C(34, 64, 14, glow(c, '#ff8a1a', 0.7)) + flame(c, 35, 72, 0.75, '#ff6a1a', '#ffe060');
      return G(s, at(1.05, 64, 122));
    },
    felstalker: function (c) {
      var col = '#6a3a7a', fel = '#8aee3a', s = shadow(c, 64, 48);
      var legF = dk(col, 0.25);
      s += limb('M56,90 L60,104 L56,116', legF, 9) + paw(56, 121, '#2a1a2a') + limb('M102,88 L108,102 L104,116', legF, 9) + paw(104, 121, '#2a1a2a');
      s += L('M110,74 C122,70 126,58 118,50', OL, 6) + L('M110,74 C122,70 126,58 118,50', col, 3) + P('M118,50 L112,44 L122,46 Z', c.cel(fel), 1.4);
      var bd = 'M40,70 C44,56 70,50 94,56 C110,60 116,72 112,86 C108,96 92,98 74,97 C56,98 44,94 40,86 C38,80 38,76 40,70 Z';
      s += body(c, bd, col, F('M30,86 C52,100 92,100 118,88 L118,104 L30,104 Z', dk(col, 0.3), 0.85) + L('M60,66 L64,86 M72,64 L76,86 M84,64 L88,86', dk(col, 0.25), 1.8));
      // spines
      [[48, 60, 16], [58, 56, 20], [68, 54, 20], [78, 54, 18], [88, 56, 16], [98, 60, 12]].forEach(function (g) { s += P('M' + (g[0] - 4) + ',' + (g[1] + 4) + ' L' + (g[0] + 4) + ',' + (g[1] - g[2]) + ' L' + (g[0] + 5) + ',' + (g[1] + 4) + ' Z', c.cel(fel), 1.8); });
      // tentacles from shoulders
      s += L('M50,62 C40,46 30,48 26,38 C24,32 30,30 32,34', OL, 6.5) + L('M50,62 C40,46 30,48 26,38 C24,32 30,30 32,34', col, 3.2) + C(32, 34, 2.8, c.cel(fel), 1.6);
      s += L('M56,60 C52,40 44,34 40,26', OL, 5.5) + L('M56,60 C52,40 44,34 40,26', dk(col, 0.1), 2.6) + C(40, 26, 2.6, c.cel(fel), 1.6);
      // head (eyeless, big maw)
      var hd = 'M52,62 C42,58 30,62 22,70 L12,78 C8,82 10,90 16,92 L28,96 C38,98 48,94 54,86 C58,78 58,68 52,62 Z';
      s += body(c, hd, col, F('M14,90 C28,96 44,96 56,86 L58,100 L10,100 Z', dk(col, 0.3), 0.85));
      s += P('M12,82 C20,86 34,86 44,82 L42,92 C32,96 20,94 14,90 Z', '#2a0a18', 1.8);
      s += P('M16,83 L18,88 L20,84 L23,89 L25,84 L28,89 L30,84 L33,88 L36,84 Z', '#f4ecd6', 1);
      s += L('M24,70 L40,68', OL, 2.2) + E(30, 72, 5, 2, fel, 0, 0.9) + E(30, 72, 9, 5, glow(c, fel, 0.6));
      s += P('M40,62 L50,46 L52,62 Z', c.cel(dk(col, 0.1)), 2);
      s += limb('M48,88 L44,104 L44,116', col, 10) + paw(44, 121, '#2a1a2a') + limb('M94,86 L98,102 L96,116', col, 10) + paw(96, 121, '#2a1a2a');
      return s;
    },
    yarrog: function (c) {
      var sk = '#6a8a3a';
      return orcBase(c, {
        skin: sk, shirt: '#2e2436', robe: '#2e2436', trim: '#c8302a', belt: '#5a1a14',
        head: hoodedOrc({ hoodCol: '#2e2436', trim: '#c8302a', skin: sk, eye: '#ff4a2a' }), hx: 58, hy: 32,
        near: [[48, 54], [38, 66], [30, 66]], far: [[80, 54], [88, 70], [88, 88]],
        chest: function (c) { return L('M64,48 L64,86', '#c8302a', 2.6) + F('M56,50 L64,62 L72,50 Z', '#1a1418', 0.8); },
        pads: function (c) { return shoulderPad(c, 80, 52, '#3a2a36', true) + shoulderPad(c, 48, 52, '#3a2a36', true); },
        wNearFront: function (c, p) { return C(p[0] - 6, p[1] - 12, 16, glow(c, '#ff3a1a', 0.75)) + flame(c, p[0] - 5, p[1] - 3, 0.85, '#e8201a', '#ffb040'); },
        wFar: function (c, p) { return C(p[0] + 2, p[1] + 2, 8, glow(c, '#ff3a1a', 0.5)); }
      });
    },
    thunder_lizard: function (c) {
      var col = '#6a7e96', s = shadow(c, 64, 54), dcol = dk(col, 0.3);
      s += limb('M58,92 L62,106 L58,116', dk(col, 0.25), 10) + paw(58, 121, '#2a2a34') + limb('M100,90 L108,104 L104,116', dk(col, 0.25), 10) + paw(104, 121, '#2a2a34');
      // tail
      s += body(c, 'M104,76 C116,74 124,82 126,94 C126,100 122,104 120,100 C118,92 112,88 102,92 Z', col, F('M104,90 C112,88 118,92 120,100 L126,104 L100,104 Z', dcol, 0.8));
      var bd = 'M36,74 C40,60 64,54 88,58 C106,60 114,72 110,86 C106,98 90,100 72,99 C54,100 40,96 36,88 Z';
      s += body(c, bd, col, F('M30,88 C52,102 92,102 116,88 L116,104 L30,104 Z', dcol, 0.85) + F('M40,90 C56,98 84,98 104,90 L104,96 C84,102 56,102 40,96 Z', '#c8ccc0', 0.7) + L('M60,62 L62,72 M72,60 L74,72 M84,60 L86,72 M96,64 L98,74', dcol, 1.6));
      // back plates
      [[52, 60], [64, 56], [76, 55], [88, 57], [100, 62]].forEach(function (g) { s += P('M' + (g[0] - 5) + ',' + (g[1] + 3) + ' L' + g[0] + ',' + (g[1] - 7) + ' L' + (g[0] + 5) + ',' + (g[1] + 3) + ' Z', c.cel('#3e4a60'), 1.6); });
      // head
      var hd = 'M48,62 C38,60 26,64 18,70 L10,76 C6,80 8,88 14,90 L26,92 C38,94 48,88 52,80 C54,72 54,66 48,62 Z';
      s += body(c, hd, col, F('M12,88 C26,94 42,92 54,82 L56,98 L8,98 Z', dcol, 0.85));
      s += L('M10,84 C18,86 30,86 40,83', OL, 1.6);
      // horns
      s += P('M40,62 C40,50 46,42 56,40 C50,46 48,54 48,62 Z', c.cel('#e8dcc0'), 1.8) + P('M30,64 C28,56 32,48 38,46 C36,52 36,58 36,64 Z', c.cel('#d8ccb0'), 1.6) + P('M14,74 L10,64 L20,72 Z', c.cel('#e8dcc0'), 1.4);
      s += C(28, 72, 2.2, '#7fd8ff', 1.2) + C(27.4, 71.4, 0.7, '#fff');
      s += limb('M48,88 L44,104 L44,116', col, 11) + paw(44, 121, '#2a2a34') + limb('M92,88 L96,104 L94,116', col, 11) + paw(94, 121, '#2a2a34');
      // crackling sparks
      s += C(70, 52, 22, glow(c, '#7fd0ff', 0.35));
      s += spark(58, 46, 0.9, '#7fd0ff') + spark(86, 44, 1.1, '#9fe0ff') + spark(112, 66, 0.8, '#7fd0ff') + spark(44, 40, 0.7, '#9fe0ff') + spark(26, 58, 0.6, '#7fd0ff');
      return G(s, at(1.02, 64, 122));
    },
    durotar_tiger: function (c) {
      var col = '#d49a4a', dcol = dk(col, 0.3), s = shadow(c, 64, 50), str = '#4a2a14';
      s += limb('M58,90 L62,104 L58,116', dk(col, 0.22), 9) + paw(58, 121, dk(col, 0.35)) + limb('M104,88 L110,102 L106,116', dk(col, 0.22), 9) + paw(106, 121, dk(col, 0.35));
      s += L('M110,72 C124,70 126,54 118,46', OL, 7) + L('M110,72 C124,70 126,54 118,46', col, 3.6) + L('M122,62 l-5,-2 M121,54 l-5,0', str, 2);
      var bd = 'M40,70 C44,58 70,54 94,58 C110,60 116,72 112,84 C108,94 92,96 74,95 C56,96 44,92 40,84 C38,78 38,74 40,70 Z';
      s += body(c, bd, col, F('M30,86 C52,98 92,98 118,86 L118,104 L30,104 Z', '#f0dcb0', 0.9) + L('M58,58 L62,72 M68,56 L70,74 M78,56 L80,72 M88,58 L90,74 M98,60 L100,72', str, 3.2) + F('M60,60 C80,56 100,58 108,66 C90,62 72,62 60,64 Z', lt(col, 0.2), 0.5));
      // head
      s += P('M34,62 L34,46 L44,56 Z', c.cel(col), 2) + P('M36,58 L36,51 L41,56 Z', '#3a2014', 0);
      var hd = 'M50,62 C44,54 28,54 20,62 C16,66 14,68 10,70 C4,72 2,80 4,84 C6,90 12,92 18,92 C26,97 40,96 48,88 C54,80 55,68 50,62 Z';
      s += body(c, hd, col, F('M36,56 L56,56 L56,98 L40,98 C48,86 46,68 36,56 Z', dk(col, 0.25), 0.7) + L('M30,58 L32,66 M38,58 L38,67 M44,62 L42,70', str, 2.4));
      s += P('M46,58 L50,44 L56,60 Z', c.cel(col), 2) + P('M49,56 L50,50 L53,57 Z', '#3a2014', 0);
      s += P('M4,80 C4,74 12,72 18,76 C22,80 22,88 16,90 C10,92 4,88 4,80 Z', '#f4e6c8', 1.6);
      s += P('M18,90 L24,97 L28,91 L33,98 L37,92 L42,96 L44,88 Z', '#f4e6c8', 1.6);
      s += P('M2,76 L8,74 L7,80 Z', '#3a2014', 1.2);
      s += L('M6,84 Q10,87 14,84', OL, 1.4) + P('M9,85 L10,89 L11.5,85.5 Z', '#fff', 0.8);
      s += L('M18,68 L28,69', OL, 2.2) + E(22, 71.5, 2.4, 1.8, '#e8d040', 1) + E(21.5, 71.5, 0.7, 1.4, OL);
      s += L('M12,82 l-10,-3 M12,84 l-10,2', '#ffffff', 0.8);
      s += limb('M48,86 L44,104 L44,116', col, 10) + paw(44, 121, dk(col, 0.35)) + limb('M96,86 L100,102 L98,116', col, 10) + paw(98, 121, dk(col, 0.35));
      s += L('M44,96 l4,0 M44,104 l4,0 M98,96 l4,0', str, 2);
      return s;
    },
    hexed_troll: function (c) {
      return trollBase(c, {
        skin: '#7f9a86', hair: '#6a3226', mask: 'wood', eye: '#c070ff', loin: '#6a3a5a',
        back: function (c) { return C(64, 70, 44, glow(c, '#a050ff', 0.35)); },
        near: [[48, 56], [38, 70], [30, 78]],
        wNear: function (c, p) { return staff(p, [p[0] - 8, p[1] - 44], [p[0] + 6, p[1] + 38], '#6a4424') + P('M' + pt([p[0] - 8, p[1] - 44]) + 'L' + pt([p[0] - 14, p[1] - 58]) + 'L' + pt([p[0] - 3, p[1] - 46]) + 'Z', c.cel('#c8ccd2'), 1.6); },
        chest: function (c) { return L('M60,74 C56,70 60,66 64,70 C68,74 62,78 60,74', '#c070ff', 1.6); },
        top: function (c) { return C(46, 26, 2, '#e0a0ff', 0, 0.9) + C(84, 40, 1.6, '#e0a0ff', 0, 0.9) + C(36, 60, 1.4, '#e0a0ff', 0, 0.9) + L('M40,36 C36,32 40,28 44,30', '#c070ff', 1.4, 0.8); }
      });
    },
    voodoo_troll: function (c) {
      return trollBase(c, {
        skin: '#86a08a', hair: '#2e2620', mask: 'wood', eye: '#7cff5a', loin: '#8a5a32',
        near: [[48, 56], [40, 70], [32, 76]],
        wNear: function (c, p) { return voodooStaff(c, p, '#7cff5a'); },
        pads: function (c) { return necklace(62, 52); },
        top: function (c) { return feathers(50, 18, ['#d83a2a', '#f0c040'], 0.8); }
      });
    },
    zalazane: function (c) {
      return G(trollBase(c, {
        skin: '#78927e', hair: '#e8e0d0', mask: 'skull', eye: '#7cff5a', loin: '#4a2a4a',
        back: function (c) { return C(40, 30, 34, glow(c, '#7cff5a', 0.3)); },
        near: [[48, 56], [40, 70], [32, 76]],
        wNear: function (c, p) { return voodooStaff(c, p, '#7cff5a', true); },
        pads: function (c) { return shoulderPad(c, 78, 54, '#ece4cc', false) + skull(80, 52, 0.9) + necklace(62, 52) + shoulderPad(c, 48, 54, '#8a5a32', true); },
        top: function (c) { return feathers(54, 12, ['#d83a2a', '#f0c040', '#2f9ab8', '#d83a2a'], 1.1); },
        chest: function (c) { return L('M58,74 Q64,78 70,74', '#7cff5a', 1.6) + C(64, 68, 2, '#7cff5a'); }
      }), at(1.12, 64, 122));
    },
    kul_tiras_sailor: function (c) {
      return humanBase(c, {
        skin: '#e8b890', shirt: '#f2f0ea', pants: '#2a4a80', boots: '#3a2a1e', belt: '#5a3a22', sleeve: '#f2f0ea', hat: 'bandana', hatCol: '#2a5aa0', beard: '#6a4a2a', hairCol: '#6a4a2a',
        chest: function (c) { return stripes('#2a5aa0'); },
        near: [[48, 54], [40, 70], [34, 78]],
        wNear: function (c, p) { return cutlass(p, 0.9); }
      });
    },
    kul_tiras_marine: function (c) {
      return humanBase(c, {
        skin: '#e0b088', shirt: '#2a5aa0', pants: '#e8e6e0', boots: '#2d2420', belt: '#3a2a1e', sleeve: '#9aa4ae', forearm: '#9aa4ae', glove: '#5a3a22', hat: 'helm', plume: '#2a5aa0', hairCol: '#3a2a1a',
        chest: function (c) { return F('M58,46 L70,46 L68,88 L60,88 Z', '#f2f0ea') + L('M64,54 L64,64 M60,58 L68,58', '#2a5aa0', 2); },
        pads: function (c) { return shoulderPad(c, 80, 52, '#aab4bc', false) + shoulderPad(c, 48, 52, '#aab4bc', false); },
        near: [[48, 54], [38, 68], [30, 74]],
        wNear: function (c, p) { return sword(p, 40, -2.1, '#d0d4da'); },
        far: [[80, 54], [90, 68], [92, 82]],
        wFar: function (c, p) { return body(c, 'M86,70 L104,70 L104,86 C104,96 96,100 95,102 C94,100 86,96 86,86 Z', '#2a5aa0', L('M95,72 L95,98 M88,80 L102,80', '#e8c060', 2), 2); }
      });
    },
    lieutenant_benedict: function (c) {
      return G(humanBase(c, {
        skin: '#e8b890', shirt: '#1e3a6e', robe: '#1e3a6e', trim: '#e0b848', boots: '#1a1210', belt: '#1a1210', sleeve: '#1e3a6e', hat: 'tricorne', hairCol: '#a8a098', beard: '#a8a098', glove: '#f2f0ea',
        chest: function (c) { return F('M58,46 L70,46 L68,70 L60,70 Z', '#f2f0ea') + C(62, 74, 1.4, '#e0b848') + C(62, 80, 1.4, '#e0b848') + C(66, 74, 1.4, '#e0b848') + C(66, 80, 1.4, '#e0b848'); },
        pads: function (c) {
          var e = function (x) { return P('M' + (x - 10) + ',54 C' + (x - 10) + ',46 ' + (x + 10) + ',46 ' + (x + 10) + ',54 Z', c.cel('#e0b848'), 1.8) + L('M' + (x - 8) + ',54 L' + (x - 8) + ',59 M' + (x - 4) + ',55 L' + (x - 4) + ',60 M' + x + ',55 L' + x + ',60 M' + (x + 4) + ',55 L' + (x + 4) + ',60 M' + (x + 8) + ',54 L' + (x + 8) + ',59', '#e0b848', 1.6); };
          return e(80) + e(48);
        },
        near: [[48, 54], [38, 66], [30, 70]],
        wNear: function (c, p) { return cutlass(p, 1.05); }
      }), at(1.06, 64, 122));
    },
    ragefire_trogg: function (c) {
      return trogg(c, { skin: '#b0503a', rock: '#5a3a30', eye: '#ffd040', weapon: function (c, p) { return club(c, p, 0.9); } });
    },
    searing_blade_cultist: function (c) {
      var sk = '#7a8a3a';
      return orcBase(c, {
        skin: sk, shirt: '#8a1a14', robe: '#8a1a14', trim: '#1a1009', belt: '#2a1a14',
        head: hoodedOrc({ hoodCol: '#8a1a14', trim: '#2a1a14', skin: sk, eye: '#ffb030' }), hx: 58, hy: 34,
        near: [[48, 56], [38, 70], [32, 80]],
        wNear: function (c, p) { return curvedDagger(p, 1); },
        far: [[80, 56], [88, 72], [86, 88]]
      });
    },
    earthborer: function (c) {
      var col = '#b08a6a', s = shadow(c, 64, 48), dcol = dk(col, 0.3);
      // dirt mound back
      s += body(c, 'M44,122 C50,104 88,100 110,110 C120,114 124,120 122,122 Z', '#7a5a3a', F('M44,122 C70,114 100,114 122,122 Z', '#4a3420', 0.8), 2);
      // segmented body arch
      var pts = [[104, 110], [98, 94], [88, 80], [74, 70], [58, 66], [44, 70], [34, 78]];
      pts.forEach(function (p, i) { var r = 13 - i * 0.3; s += E(p[0], p[1], r, r * 0.9, c.cel(i % 2 ? col : dk(col, 0.08)), 2.2) + L('M' + pt([p[0] - r * 0.5, p[1] - r * 0.7]) + 'Q' + pt([p[0] - r * 0.9, p[1]]) + ' ' + pt([p[0] - r * 0.5, p[1] + r * 0.7]), dcol, 1.3, 0.8); });
      // maw head
      s += body(c, 'M36,66 C22,62 10,70 10,84 C10,98 22,104 34,98 C42,94 46,84 44,76 C42,70 40,68 36,66 Z', dk(col, 0.05), F('M12,92 C20,102 34,102 42,92 L44,106 L10,106 Z', dcol, 0.8));
      s += E(16, 84, 7, 12, '#3a0e0a', 2);
      s += P('M12,74 L16,77 L13,80 L17,83 L13,86 L17,89 L13,92 L16,95', 'none', 0) + L('M11,74 L17,77 L11,80 L17,83 L11,86 L17,89 L11,92 L16,95', '#f4ecd6', 1.8);
      s += E(18, 84, 3, 6, '#8a2a1a', 0, 0.8);
      // front mound + dirt clumps
      s += body(c, 'M20,122 C24,110 44,104 64,108 C80,110 90,116 92,122 Z', '#8a6a44', F('M20,122 C40,116 70,116 92,122 Z', '#5a4028', 0.8), 2);
      s += C(28, 104, 3, '#7a5a3a', 1.4) + C(92, 104, 2.4, '#7a5a3a', 1.4) + C(22, 112, 2, '#7a5a3a', 1.2);
      return G(s, at(1.02, 64, 122));
    },
    oggleflint: function (c) {
      return G(trogg(c, {
        skin: '#a8482e', rock: '#4a3028', eye: '#ffe060', loin: '#4a2a1a',
        weapon: function (c, p) { return club(c, p, 1.05, '#6a4020'); }, clubRot: -4,
        crown: function (c, x, y) { return P('M' + pt([x - 10, y - 10]) + 'L' + pt([x - 12, y - 22]) + 'L' + pt([x - 5, y - 14]) + 'L' + pt([x, y - 26]) + 'L' + pt([x + 4, y - 14]) + 'L' + pt([x + 11, y - 22]) + 'L' + pt([x + 10, y - 9]) + 'Z', c.cel('#e8dcc0'), 1.8) + C(x, y - 13, 2, '#e8201a', 1); },
        top: function (c) { return L('M52,58 L90,80', OL, 5.5) + L('M52,58 L90,80', '#6a4424', 3) + skull(74, 70, 0.8); }
      }), at(1.18, 64, 122));
    },
    taragaman: function (c) {
      var sk = '#b0301e', s = shadow(c, 64, 46);
      // wings stubs / back spikes
      s += P('M74,40 L100,14 L96,34 L112,26 L100,48 Z', c.cel('#5a1a12'), 2);
      // far arm
      s += limb('M86,54 L100,72 L98,90', dk(sk, 0.2), 13) + P('M92,88 L104,88 L106,100 L98,96 L94,102 L90,96 Z', c.cel('#e8dcc0'), 1.8);
      // legs (digitigrade with hooves)
      s += limb('M72,92 L82,104 L76,114', dk(sk, 0.22), 13) + hoofs(77, 122, '#1a1210');
      s += limb('M54,92 L48,104 L50,114', sk, 13) + hoofs(50, 122, '#1a1210');
      s += body(c, 'M44,86 L84,86 L82,100 L72,96 L64,104 L56,96 L46,100 Z', '#3a1a12', L('M50,90 L78,90', '#c8a040', 2));
      // torso
      var td = 'M36,48 C42,34 84,30 94,46 C100,58 92,76 84,90 L46,90 C38,76 32,60 36,48 Z';
      s += body(c, td, sk, F('M72,30 L104,30 L104,96 L76,96 C88,78 86,54 72,30 Z', dk(sk, 0.28), 0.8) + L('M54,56 Q64,62 74,56 M56,70 Q64,74 72,70 M58,80 Q64,84 70,80', dk(sk, 0.32), 1.6) + E(52, 48, 8, 5, lt(sk, 0.2), 0, 0.5));
      // head: horns + fanged maw
      var hx = 44, hy = 36;
      s += P('M' + pt([hx + 6, hy - 10]) + 'C' + pt([hx + 16, hy - 24]) + ' ' + pt([hx + 30, hy - 26]) + ' ' + pt([hx + 38, hy - 16]) + 'C' + pt([hx + 28, hy - 18]) + ' ' + pt([hx + 20, hy - 14]) + ' ' + pt([hx + 14, hy - 4]) + 'Z', c.cel('#3a2a22'), 2);
      s += body(c, 'M' + pt([hx - 12, hy - 6]) + 'C' + pt([hx - 10, hy - 16]) + ' ' + pt([hx + 10, hy - 16]) + ' ' + pt([hx + 14, hy - 4]) + 'L' + pt([hx + 14, hy + 8]) + 'C' + pt([hx + 10, hy + 16]) + ' ' + pt([hx - 4, hy + 18]) + ' ' + pt([hx - 12, hy + 14]) + 'L' + pt([hx - 18, hy + 6]) + 'L' + pt([hx - 14, hy]) + 'Z', sk, F('M' + pt([hx + 6, hy - 16]) + 'L' + pt([hx + 18, hy - 16]) + 'L' + pt([hx + 18, hy + 18]) + 'L' + pt([hx + 4, hy + 18]) + 'Z', dk(sk, 0.28), 0.8));
      s += P('M' + pt([hx - 6, hy - 10]) + 'C' + pt([hx - 12, hy - 22]) + ' ' + pt([hx - 22, hy - 26]) + ' ' + pt([hx - 30, hy - 20]) + 'C' + pt([hx - 22, hy - 18]) + ' ' + pt([hx - 16, hy - 12]) + ' ' + pt([hx - 12, hy - 4]) + 'Z', c.cel('#4a3a30'), 2);
      s += L('M' + pt([hx - 14, hy - 3]) + 'L' + pt([hx, hy - 1]), OL, 2.6) + E(hx - 7, hy + 1, 2.6, 1.8, '#ffe040', 1) + C(hx - 7, hy + 1, 5, glow(c, '#ffd040', 0.6));
      s += P('M' + pt([hx - 18, hy + 6]) + 'C' + pt([hx - 12, hy + 16]) + ' ' + pt([hx, hy + 18]) + ' ' + pt([hx + 6, hy + 10]) + 'L' + pt([hx - 4, hy + 6]) + 'Z', '#2a0806', 1.8);
      s += L('M' + pt([hx - 16, hy + 7]) + 'L' + pt([hx - 14, hy + 12]) + 'L' + pt([hx - 11, hy + 7]) + 'L' + pt([hx - 8, hy + 13]) + 'L' + pt([hx - 6, hy + 7]) + 'L' + pt([hx - 2, hy + 12]) + 'L' + pt([hx, hy + 8]), '#f4ecd6', 1.6);
      s += P('M' + pt([hx - 14, hy + 14]) + 'L' + pt([hx - 12, hy + 6]) + 'L' + pt([hx - 9, hy + 13]) + 'Z', '#f4ecd6', 1.2);
      // near arm with claw
      s += limb('M44,56 L30,72 L24,86', sk, 13);
      s += P('M18,84 L30,82 L32,92 L28,100 L26,92 L22,100 L20,92 L14,98 Z', c.cel('#e8dcc0'), 1.8) + C(25, 86, 6, c.cel(sk), 2);
      // fel/fire embers
      s += C(24, 92, 12, glow(c, '#ff7a1a', 0.5)) + C(98, 94, 10, glow(c, '#ff7a1a', 0.4));
      return G(s, at(1.04, 64, 122));
    },
    jergosh: function (c) {
      var sk = '#6a7a3a', fel = '#8aee3a';
      return G(orcBase(c, {
        skin: sk, shirt: '#2a1e2a', robe: '#2a1e2a', trim: fel, belt: '#1a1418', bald: true, eye: '#8aee3a',
        near: [[48, 54], [38, 64], [30, 62]], far: [[80, 54], [90, 70], [90, 86]],
        pads: function (c) { return shoulderPad(c, 80, 52, '#3a3040', true) + skull(80, 50, 0.8) + shoulderPad(c, 48, 52, '#3a3040', true); },
        chest: function (c) { return F('M56,50 L64,64 L72,50 Z', '#1a1418', 0.8) + C(64, 70, 3, fel, 1.2); },
        wNearFront: function (c, p) { return C(p[0] - 4, p[1] - 12, 16, glow(c, fel, 0.75)) + flame(c, p[0] - 4, p[1] - 3, 0.85, '#4ac82a', '#d8ff9a'); },
        wFar: function (c, p) { return staff(p, [p[0] - 2, p[1] - 70], [p[0] + 2, p[1] + 34], '#3a2a2a') + flame(c, p[0] - 2, p[1] - 68, 0.7, '#4ac82a', '#d8ff9a') + C(p[0] - 2, p[1] - 76, 12, glow(c, fel, 0.55)); }
      }), at(1.1, 64, 122));
    },
    bazzalan: function (c) {
      var sk = '#8a3a5a', fur = '#4a2a22', s = shadow(c, 64, 30);
      // tail
      s += L('M80,86 C94,90 100,82 98,74', OL, 5) + L('M80,86 C94,90 100,82 98,74', fur, 2.4) + P('M98,74 L94,66 L104,70 Z', c.cel(fur), 1.6);
      // far arm + blade
      var fh = [90, 80];
      s += limb('M80,52 L90,66 L90,80', dk(sk, 0.18), 8.5);
      s += P('M' + pt([fh[0] + 2, fh[1]]) + 'C' + pt([fh[0] + 14, fh[1] + 4]) + ' ' + pt([fh[0] + 22, fh[1] + 16]) + ' ' + pt([fh[0] + 20, fh[1] + 30]) + 'C' + pt([fh[0] + 14, fh[1] + 20]) + ' ' + pt([fh[0] + 8, fh[1] + 12]) + ' ' + pt([fh[0] - 1, fh[1] + 6]) + 'Z', c.cel('#c8ccd2'), 1.8) + hand(fh, c.cel(sk));
      // goat legs (reverse knee)
      var gl = function (x, col, sgn) { return limb('M' + x + ',84 L' + (x - 6 * sgn) + ',98 L' + (x + 4 * sgn) + ',108 L' + (x + 1 * sgn) + ',116', col, 11) + hoofs(x + 1 * sgn, 122, '#1a1210'); };
      s += gl(72, dk(fur, 0.2), -1) + gl(56, fur, 1);
      // fur hips
      s += body(c, 'M48,74 C48,68 80,68 80,74 L82,90 C74,96 56,96 46,90 Z', fur, F('M68,68 L86,68 L86,98 L70,98 Z', dk(fur, 0.3), 0.8) + L('M52,88 l2,4 M60,90 l1,5 M68,90 l1,5 M76,88 l0,4', dk(fur, 0.4), 1.4));
      // torso
      s += body(c, 'M48,50 C52,44 76,44 80,50 L78,72 L50,72 Z', sk, F('M68,42 L90,42 L90,76 L70,76 C74,64 72,52 68,42 Z', dk(sk, 0.25), 0.8) + L('M56,58 Q62,62 70,58', dk(sk, 0.3), 1.4));
      s += L('M50,50 L78,70', '#3a2a1a', 3);
      // head
      var hx = 58, hy = 32;
      s += P('M' + pt([hx + 8, hy - 2]) + 'L' + pt([hx + 20, hy - 8]) + 'L' + pt([hx + 12, hy + 4]) + 'Z', c.cel(sk), 1.8);
      s += body(c, 'M' + pt([hx - 9, hy - 8]) + 'C' + pt([hx - 6, hy - 15]) + ' ' + pt([hx + 8, hy - 15]) + ' ' + pt([hx + 10, hy - 6]) + 'L' + pt([hx + 10, hy + 4]) + 'C' + pt([hx + 8, hy + 12]) + ' ' + pt([hx - 2, hy + 14]) + ' ' + pt([hx - 8, hy + 10]) + 'L' + pt([hx - 14, hy + 4]) + 'L' + pt([hx - 11, hy - 2]) + 'Z', sk, F('M' + pt([hx + 3, hy - 16]) + 'L' + pt([hx + 14, hy - 16]) + 'L' + pt([hx + 14, hy + 14]) + 'L' + pt([hx + 1, hy + 14]) + 'Z', dk(sk, 0.25), 0.8));
      s += P('M' + pt([hx - 8, hy + 8]) + 'C' + pt([hx - 8, hy + 18]) + ' ' + pt([hx - 2, hy + 22]) + ' ' + pt([hx, hy + 22]) + 'C' + pt([hx, hy + 16]) + ' ' + pt([hx + 2, hy + 12]) + ' ' + pt([hx + 4, hy + 10]) + 'Z', c.cel(fur), 1.6);
      s += L('M' + pt([hx - 11, hy - 4]) + 'L' + pt([hx - 1, hy - 3]), OL, 2.2) + C(hx - 6, hy - 0.5, 1.6, '#b0ff40', 1);
      // curled horns
      s += P('M' + pt([hx - 4, hy - 12]) + 'C' + pt([hx - 2, hy - 26]) + ' ' + pt([hx + 16, hy - 30]) + ' ' + pt([hx + 20, hy - 18]) + 'C' + pt([hx + 22, hy - 10]) + ' ' + pt([hx + 14, hy - 6]) + ' ' + pt([hx + 12, hy - 12]) + 'C' + pt([hx + 14, hy - 16]) + ' ' + pt([hx + 12, hy - 22]) + ' ' + pt([hx + 4, hy - 20]) + 'C' + pt([hx, hy - 18]) + ' ' + pt([hx, hy - 14]) + ' ' + pt([hx + 1, hy - 11]) + 'Z', c.cel('#4a3a30'), 1.8);
      // near arm + blade
      var nh = [34, 70];
      s += limb('M50,52 L40,64 L34,70', sk, 8.5);
      s += P('M' + pt([nh[0] - 2, nh[1] - 2]) + 'C' + pt([nh[0] - 14, nh[1] - 6]) + ' ' + pt([nh[0] - 22, nh[1] - 20]) + ' ' + pt([nh[0] - 18, nh[1] - 34]) + 'C' + pt([nh[0] - 12, nh[1] - 22]) + ' ' + pt([nh[0] - 6, nh[1] - 14]) + ' ' + pt([nh[0] + 3, nh[1] - 7]) + 'Z', c.cel('#c8ccd2'), 1.8) + hand(nh, c.cel(sk));
      return G(s, at(1.1, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#8a6a5a'), 2.5); }
  function phScene(c) { return sky(c, '#d89a5e', '#eec08a', '#f6dcae') + ground(c, 150, '#c8844e', '#a8602e'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#8a6a5a"/></svg>'; }
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
