/* art_tanaris.js — Sirocco zone art for Realm of Loner (contested desert, levels 40-46: Coppergulch, Rotten Plank Cove,
 * Pumpworks Field, the Stinging Hive, the Sandbrute Compound, Spinebush Valley, the Dawnstone Ruins and the gate of
 * The Dune Temple; Dustcloak bandits, Blackgull pirates, Hivecrawler hiveborn, Sandbrute ogres, thistleshrubs, dunestalker
 * scorpids, Caliph Stingtail and Captain Rusk Hookhand).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Sirocco keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the human and goblin heads and the house-style scene pieces are shared copies of
 * art_stranglethorn.js. The desert scene pieces, the veiled bandit head, the pirate kit, the silithid, ogre,
 * cactus and scorpid bodies are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix tn<counter>_).
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
  function Ctx() { this.p = 'tn' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  SCENE PIECES (shared house style, copies of art_stranglethorn.js)
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
  function snowRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col) + F('M' + pt([x - w * 0.42, y - h * 0.56]) + 'C' + pt([x - w * 0.3, y - h * 1.06]) + ' ' + pt([x + w * 0.26, y - h * 1.06]) + ' ' + pt([x + w * 0.42, y - h * 0.5]) + 'C' + pt([x + w * 0.2, y - h * 0.66]) + ' ' + pt([x, y - h * 0.58]) + ' ' + pt([x - w * 0.12, y - h * 0.7]) + 'C' + pt([x - w * 0.24, y - h * 0.6]) + ' ' + pt([x - w * 0.34, y - h * 0.62]) + ' ' + pt([x - w * 0.42, y - h * 0.56]) + 'Z', '#f4f8fc', 0.95);
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
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
  function sack(c, x, y, s, col) {
    col = col || '#c8aa76';
    var d = 'M' + pt([x - 9 * s, y]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'C' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, F('M' + pt([x + 2 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + L('M' + pt([x - 4 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 17 * s]), '#6a4a2a', 1.6 * s), 1.5 * s);
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
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
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
  function arrowSlit(x, y, col) { return R(x - 1.6, y - 6, 3.2, 12, col || '#12100e', 0.8); }
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
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
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
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
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  function waves(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, 0.7);
  }
  function swag(x0, y0, x1, y1, sag, w) {
    w = w || 1; var d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, Math.max(y0, y1) + sag]) + ' ' + pt([x1, y1]);
    return L(d, OL, 4 * w) + '<path d="' + d + '" fill="none" stroke="#7a7e86" stroke-width="' + n(2.2 * w) + '" stroke-dasharray="' + n(3.4 * w) + ' ' + n(1.8 * w) + '"/>';
  }
  function brazier(c, x, y, s) {
    var o = C(x, y - 26 * s, 40 * s, glow(c, '#ff9030', 0.45)) + E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x - 2 * s, y - 18 * s]) + 'M' + pt([x + 10 * s, y]) + 'L' + pt([x + 2 * s, y - 18 * s]) + 'M' + pt([x, y + 1]) + 'L' + pt([x, y - 18 * s]), '#2e2a2c', 2.2 * s);
    o += P('M' + pt([x - 13 * s, y - 24 * s]) + 'L' + pt([x + 13 * s, y - 24 * s]) + 'L' + pt([x + 8 * s, y - 16 * s]) + 'L' + pt([x - 8 * s, y - 16 * s]) + 'Z', c.cel('#3e3a3c'), 1.6 * s);
    return o + flame(c, x - 5 * s, y - 23 * s, 0.6 * s) + flame(c, x + 5 * s, y - 23 * s, 0.55 * s) + flame(c, x, y - 23 * s, 0.95 * s);
  }
  // irregular spot blobs for mottled hides, as a mark hook
  function mottle(seed, cnt, x0, y0, x1, y1, dark, light, r0, r1) {
    return function () {
      var r = rng(seed), o = '';
      for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (r0 || 1.6) + r() * ((r1 || 3.4) - (r0 || 1.6)); o += F(shag(x, y, rr * 1.2, rr, 5, 0.3, seed + i * 7), i % 3 === 2 ? light : dark, 0.85); }
      return o;
    };
  }
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [0, 1].map(function (a) { return u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a]; }); }
  // almond leaf path from (x, y): side 1 = right-down, -1 = left-down, 0 = straight down
  function leafD(x, y, side, len) {
    var a = side ? (side > 0 ? 0.5 : PI - 0.5) : PI / 2, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, px = -Math.sin(a) * len * 0.35, py = Math.cos(a) * len * 0.35;
    return 'M' + pt([x, y]) + 'Q' + pt([(x + ex) / 2 + px, (y + ey) / 2 + py]) + ' ' + pt([ex, ey]) + 'Q' + pt([(x + ex) / 2 - px, (y + ey) / 2 - py]) + ' ' + pt([x, y]) + 'Z';
  }
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  // palms, tents and flags (copies of art_stranglethorn.js)
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
  // canvas ridge tent seen from the front-left (x = front pole, y = ground)
  function tent(c, x, y, s, col, trim) {
    col = col || '#d8c89a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x + 18 * s, y + 2, 44 * s, 5 * s, '#000', 0, 0.26);
    o += body(c, pd([q(0, -40), q(46, -36), q(62, -2), q(20, 0)], true), dk(col, 0.1), L('M' + pt(q(12, -39)) + 'L' + pt(q(30, -0.6)) + 'M' + pt(q(26, -38)) + 'L' + pt(q(44, -1.2)) + 'M' + pt(q(38, -37)) + 'L' + pt(q(55, -1.6)), dk(col, 0.3), 0.9 * s) + F(pd([q(30, -40), q(66, -40), q(66, 4), q(40, 4)], true), dk(col, 0.25), 0.8), 1.7 * s);
    o += body(c, pd([q(-24, 0), q(0, -40), q(20, 0)], true), col, F(pd([q(4, -42), q(24, -42), q(24, 2), q(10, 2)], true), dk(col, 0.2), 0.7), 1.8 * s);
    o += P(pd([q(-8, 0), q(0, -28), q(6, 0)], true), '#2a2016', 1.2 * s) + P(pd([q(0, -28), q(6, 0), q(12, -1)], true), c.cel(lt(col, 0.1)), 1.1 * s);
    if (trim) o += L(pd([q(-22, -1.8), q(0, -37.5), q(18, -1.8)]), trim, 1.8 * s);
    return o + limb('M' + pt(q(0, -39)) + 'L' + pt(q(0, -46)), '#6a4a2a', 2 * s) + L('M' + pt(q(0, -44)) + 'L' + pt(q(-34, 2)) + 'M' + pt(q(46, -36)) + 'L' + pt(q(72, 0)), '#5a4a30', 0.9 * s);
  }
  // banner hanging from a crossbar on a pole (x = pole, y = ground)
  function flag(c, x, y, h, s, cloth, trim, mark, swallow) {
    var w = 16 * s, bh = 26 * s, ty = y - h, bx = x + 1.5 * s, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, ty - 4 * s]), '#5a3e24', 2.6 * s) + limb('M' + pt([x - 2 * s, ty]) + 'L' + pt([x + w + 3 * s, ty]), '#5a3e24', 1.8 * s);
    var d = swallow ? pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh - 6 * s], [bx, ty + bh]], true) : pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh + 5 * s], [bx, ty + bh]], true);
    o += body(c, d, cloth, (trim ? L(pd([[bx + 1.8 * s, ty + 1], [bx + 1.8 * s, ty + bh - 1]]) + pd([[bx + w - 1.8 * s, ty + 1], [bx + w - 1.8 * s, ty + bh - 1]]), trim, 1.3 * s) : '') + F(pd([[bx + w * 0.62, ty], [bx + w + 1, ty], [bx + w + 1, ty + bh + 6 * s], [bx + w * 0.62, ty + bh + 6 * s]], true), '#000', 0.22), 1.4 * s);
    if (mark) o += mark(bx + w / 2, ty + bh * 0.45, s);
    return o + C(x, ty - 4 * s, 1.8 * s, c.cel(GOLD), 0.9 * s);
  }
  // original marks: rebel gold star over a chevron; Krugar black fang-crown; Drayke tan crossed blades
  // ---- goblin (Deepgold Company) — copy of the art_stonetalon.js rig, plus goggles, a dented hat and free limb sizes ----
  function gobHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.specs) s += L('M' + pt([x - 1, y - 4]) + 'L' + pt([x + 12, y - 7]), '#4a2e1a', 2.4) + C(x - 5, y - 4, 4.6, c.cel(o.specCol || '#c89a3a'), 1.4) + C(x - 5, y - 4, 3.1, o.lens || '#9ae8f4', 1) + C(x - 6.2, y - 5.2, 1, '#ffffff');
    else s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    if (o.grin) {
      s += P('M' + pt([x - 13, y + 8]) + 'Q' + pt([x - 6, y + 15]) + ' ' + pt([x + 3, y + 8]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 13, y + 8]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 11, y + 9]) + 'L' + pt([x + 1, y + 9]), '#f4ecd6', 1.6) + R(x - 7, y + 8.2, 2.6, 2.6, '#ffd040', 0.8);
    } else s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), OL, 3.6) + L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), '#7a4a2a', 2) + C(x - 21, y + 13.3, 1.3, '#ff8a3a') + smoke(x - 24, y + 6, 0.3, '#c8c8c8', 0.6, -1);
    var st = o.hatStyle || 'hard', hc = o.hat || '#e8b830';
    if (st === 'hard') {
      s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
      s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4), 2);
    } else if (st === 'cap') {
      s += body(c, 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 14, y - 6]) + 'L' + pt([x + 14, y + 4]) + 'L' + pt([x + 9, y + 4]) + 'L' + pt([x + 8, y - 6]) + 'Z', hc, F('M' + pt([x + 3, y - 24]) + 'L' + pt([x + 16, y - 24]) + 'L' + pt([x + 16, y + 6]) + 'L' + pt([x + 5, y + 6]) + 'Z', dk(hc, 0.3), 0.8) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 16]) + ' ' + pt([x + 10, y - 13]), dk(hc, 0.4), 1.2), 1.8);
    } else {
      s += L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', OL, 2.6) + L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', o.hair || '#e8e0d0', 1.2);
    }
    if (o.goggles) s += L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), OL, 3) + L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), '#4a3a2a', 1.6) + C(x - 7, y - 13, 4.2, c.cel('#8a8680'), 1.4) + C(x - 7, y - 13, 2.8, o.goggles, 1) + C(x + 1, y - 14, 3.8, c.cel('#8a8680'), 1.4) + C(x + 1, y - 14, 2.5, o.goggles, 1) + C(x - 8, y - 14.2, 0.9, '#ffffff');
    if (o.dent) s += L('M' + pt([x - 4, y - 22]) + 'q2,3 5,1', dk(hc, 0.45), 1.3) + L('M' + pt([x - 8, y - 17]) + 'l3,-2', '#ffffff', 1, 0.6);
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, hatStyle: o.hatStyle, specs: o.specs, specCol: o.specCol, lens: o.lens, grin: o.grin, cigar: o.cigar, hair: o.hair, goggles: o.goggles, dent: o.dent };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', buckle: o.buckle, glove: o.glove,
      hx: o.hx || 56, hy: o.hy || 32, hipY: 86, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, shins: o.shins,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }
  // ---- human head (facing left) ----
  function hmHead(c, x, y, o) {
    var sk = o.skin || '#e0a880', hc = o.hair || '#4a3020', s = '';
    s += E(x + 7, y + 1, 2.8, 3.8, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.stubble ? F('M' + pt([x - 10, y + 4]) + 'C' + pt([x - 8, y + 12]) + ' ' + pt([x + 4, y + 14]) + ' ' + pt([x + 10, y + 5]) + 'L' + pt([x + 10, y + 14]) + 'L' + pt([x - 10, y + 14]) + 'Z', o.stubble, 0.55) : '') +
      (o.camo ? F(pd([[x - 11, y - 2], [x + 2, y - 3], [x + 3, y], [x - 10, y + 1]], true) + pd([[x - 6, y + 5], [x + 6, y + 3], [x + 6, y + 6], [x - 5, y + 7]], true), o.camo, 0.8) : '') +
      (o.dots ? C(x - 4, y + 3, 0.9, o.dots) + C(x - 1, y + 5, 0.9, o.dots) + C(x + 2, y + 3, 0.9, o.dots) + L('M' + pt([x - 8, y - 3]) + 'l6,0', o.dots, 1.2) : '') +
      (o.scar ? L('M' + pt([x - 3, y - 9]) + 'L' + pt([x + 2, y + 6]), dk(sk, 0.4), 1.3) : ''), 2);
    if (o.patch) s += L('M' + pt([x - 10, y - 5]) + 'L' + pt([x + 10, y - 9]), OL, 1.6) + E(x - 5, y - 2, 3.4, 3, '#1a1414', 1.2);
    else s += C(x - 5, y - 1.6, 1.7, OL) + C(x - 5.5, y - 2.2, 0.5, '#fff');
    s += L('M' + pt([x - 9, y - 5.6]) + 'L' + pt([x - 1, y - 5]), dk(hc, 0.2), 2);
    if (o.beard) s += P('M' + pt([x - 10, y + 5]) + 'C' + pt([x - 9, y + 16]) + ' ' + pt([x + 3, y + 18]) + ' ' + pt([x + 9, y + 7]) + 'L' + pt([x + 7, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 10, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.tache) s += P('M' + pt([x - 12, y + 6]) + 'C' + pt([x - 10, y + 3]) + ' ' + pt([x - 3, y + 3]) + ' ' + pt([x + 1, y + 6]) + 'C' + pt([x - 3, y + 6]) + ' ' + pt([x - 8, y + 6]) + ' ' + pt([x - 12, y + 9]) + 'Z', c.cel(o.tache), 1.2);
    else s += L('M' + pt([x - 9, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    var hat = o.hat;
    if (hat === 'bandana') {
      var bc = o.hatCol || '#3a5a2a';
      s += P('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 11, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 8, y - 5]) + 'C' + pt([x + 2, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 11, y - 4]) + 'Z', c.cel(bc), 2) + C(x - 2, y - 12, 1.2, dk(bc, 0.35)) + C(x + 5, y - 10, 1.2, dk(bc, 0.35)) + C(x - 6, y - 8, 1, dk(bc, 0.35));
      s += P('M' + pt([x + 10, y - 7]) + 'L' + pt([x + 21, y - 3]) + 'L' + pt([x + 18, y + 1]) + 'L' + pt([x + 22, y + 5]) + 'L' + pt([x + 13, y + 1]) + 'Z', c.cel(bc), 1.6) + C(x + 11, y - 7, 2.4, c.cel(bc), 1.4);
    } else if (hat === 'officer') {
      var oc = o.hatCol || '#4a4a2e';
      s += P('M' + pt([x - 11, y - 9]) + 'C' + pt([x - 14, y - 20]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 15, y - 12]) + 'L' + pt([x + 11, y - 6]) + 'L' + pt([x - 10, y - 5]) + 'Z', c.cel(oc), 2) + R(x - 11, y - 9, 23, 3.6, c.cel('#1e1a14'), 1.2);
      s += P('M' + pt([x - 10, y - 5.4]) + 'C' + pt([x - 14, y - 5]) + ' ' + pt([x - 19, y - 3]) + ' ' + pt([x - 20, y - 1]) + 'C' + pt([x - 16, y - 2]) + ' ' + pt([x - 12, y - 3]) + ' ' + pt([x - 6, y - 4]) + 'Z', c.cel('#1a1612'), 1.4) + P(pd([[x - 2, y - 17], [x + 1, y - 21], [x + 4, y - 17], [x + 1, y - 13]], true), c.cel(GOLD), 1) + L('M' + pt([x - 8, y - 18]) + 'L' + pt([x + 10, y - 21]), '#8a2a1a', 1.2, 0.8);
      s += L('M' + pt([x + 13, y - 11]) + 'l4,4 M' + pt([x + 14, y - 16]) + 'l5,1', dk(oc, 0.2), 1.6);
    } else {
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 2);
      if (hat === 'feathers') {
        var fc = o.feathers || ['#c83a2a', '#e8b830', '#3a8a3a', '#2a6ab0', '#c83a2a'];
        fc.forEach(function (fcol, i) { var a = -PI / 2 + 0.9 - i * 0.36; s += feather(c, x + 5 + i * 0.4, y - 10, a, 17 - Math.abs(i - 2) * 1.5, fcol, '#1a1009'); });
        s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 4, y - 11]) + ' ' + pt([x + 6, y - 12]) + ' ' + pt([x + 12, y - 7]) + 'L' + pt([x + 12, y - 4]) + 'C' + pt([x + 6, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 11, y - 4]) + 'Z', c.cel('#b8883a'), 1.2) + C(x - 2, y - 7.6, 1.3, '#3ab0a0', 0.6) + C(x + 5, y - 8.6, 1.3, '#c83a2a', 0.6);
      }
    }
    return s;
  }
  function human(c, o) {
    return biped(c, {
      skin: o.skin || '#e0a880', shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, glove: o.glove, boots: o.boots || '#2a2218', belt: o.belt, buckle: o.buckle,
      head: function (c, x, y) { return hmHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); }, hx: 58, hy: 31, neckCol: o.skin || '#e0a880',
      torsoD: o.torsoD, legW: o.legW || 10.5, armW: o.armW || 9, shadowR: o.shadowR || 32,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      chest: o.chest, pads: o.pads, back: o.back, front: o.front, shins: o.shins, top: o.top, tf: o.tf
    });
  }
  // machete: black grip, wide blade with a clipped tip
  function machete(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(6, 0)), '#1e1a16', 3.6) + R(q(6, 0)[0] - 2.6, q(6, 0)[1] - 2.6, 5.2, 5.2, c.cel('#6a6460'), 1.1);
    var bl = pd([q(8, -2.4), q(len * 0.7, -3.6), q(len, -2.6), q(len + 2, 1), q(len * 0.9, 4.6), q(len * 0.4, 4), q(8, 2.6)], true);
    return o + P(bl, c.cel('#b0b4b8'), 1.7) + L('M' + pt(q(10, 3)) + 'L' + pt(q(len * 0.88, 4)), '#ffffff', 1, 0.7) + L('M' + pt(q(len * 0.3, -1)) + 'L' + pt(q(len * 0.55, -1.6)), '#7a3a2a', 1.2, 0.5);
  }
  function sabre(c, p, len, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(4, 0)), '#3a2a1e', 3.2) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), OL, 4) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), GOLD, 2.2) + L('M' + pt(q(-6, 0)) + 'Q' + pt(q(-2, 7)) + ' ' + pt(q(4, 5)), GOLD, 1.2);
    var bl = 'M' + pt(q(5, -1.8)) + 'Q' + pt(q(len * 0.6, -3.6)) + ' ' + pt(q(len, -6)) + 'Q' + pt(q(len * 0.62, 1.4)) + ' ' + pt(q(5, 1.8)) + 'Z';
    return o + P(bl, c.cel('#c8ccd2'), 1.5) + L('M' + pt(q(8, -0.6)) + 'Q' + pt(q(len * 0.6, -1.8)) + ' ' + pt(q(len * 0.94, -5)), '#ffffff', 0.9, 0.8) + C(q(-6, 0)[0], q(-6, 0)[1], 1.8, c.cel(GOLD), 1);
  }

  // ============================================================
  //  TANARIS PALETTE + DESERT PIECES (new here)
  // ============================================================
  var SAND = '#e8c066', SANDL = '#f6dc94', SANDD = '#c8963e', SST = '#d8aa6c', SSTD = '#b07c44', SKYT = '#a8d0e0', SKYM = '#e6eedc', SKYB = '#faeec4',
    PALM = '#6a9a3a', TRUNK = '#9a7448', GOLD = '#e0b43c', BONE = '#ece0c2', INDIGO = '#34407a', TEAL = '#1c8c8a', CACT = '#5a9a58',
    OOZE = '#c0e040', VIOLET = '#a860f0', FIRE = '#ff8a2a', WOOD = '#8a6440', HIDE = '#9a6a42';
  // bleached desert sky with a white-hot sun
  function dSky(c, sx, sy, top, mid, bot) {
    return sky(c, top || SKYT, mid || SKYM, bot || SKYB) + C(sx, sy, 110, glow(c, '#fffbea', 0.6)) + C(sx, sy, 15, '#fffdf4') + C(sx, sy, 22, '#fffdf4', 0, 0.35);
  }
  // shimmering heat lines
  function heat(c, y0, y1, seed, cnt, op) {
    var r = rng(seed || 3), d = '';
    for (var i = 0; i < (cnt || 8); i++) { var x = r() * 380, y = y0 + r() * (y1 - y0), w = 5 + r() * 5; d += 'M' + pt([x, y]) + 'q' + n(w / 2) + ',-2 ' + n(w) + ',0 t' + n(w) + ',0 t' + n(w) + ',0 t' + n(w) + ',0'; }
    return L(d, '#fffaf0', 1.2, op || 0.4);
  }
  // wind ripples on sand
  function ripples(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), d = ''; x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 5 + t * 16, x = x0 + r() * (x1 - x0); d += 'M' + pt([x - w, y]) + 'q' + n(w * 0.5) + ',' + n(-1.6 - t * 2) + ' ' + n(w) + ',0 q' + n(w * 0.4) + ',' + n(1 + t) + ' ' + n(w * 0.8) + ',0'; }
    return L(d, col, 1.1, 0.75);
  }
  // one dune with a sharp crest: lit windward side, shaded lee side
  function dune(c, x, y, w, h, col, crest) {
    crest = crest == null ? 0.15 : crest; var cx = x + w * crest, cy = y - h;
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.3, y - h * 0.2]) + ' ' + pt([cx - w * 0.25, cy]) + ' ' + pt([cx, cy]) + 'C' + pt([cx + w * 0.08, cy + h * 0.1]) + ' ' + pt([x + w * 0.3, y - h * 0.25]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var sh = 'M' + pt([cx, cy - 1]) + 'C' + pt([cx + w * 0.08, cy + h * 0.1]) + ' ' + pt([x + w * 0.3, y - h * 0.25]) + ' ' + pt([x + w / 2 + 2, y + 2]) + 'L' + pt([cx + w * 0.04, y + 2]) + 'C' + pt([cx + w * 0.06, y - h * 0.4]) + ' ' + pt([cx - 1, cy + h * 0.4]) + ' ' + pt([cx, cy - 1]) + 'Z';
    return body(c, d, col, F(sh, dk(col, 0.2), 0.85) + L('M' + pt([cx - w * 0.28, cy + h * 0.4]) + 'Q' + pt([cx - w * 0.14, cy + h * 0.06]) + ' ' + pt([cx, cy]), lt(col, 0.4), 1.4, 0.8), 1.6);
  }
  // far dune bands (no outlines), lightest furthest away
  function farDunes(c, seed, base, amp, col, step) { return hills(c, seed, base, amp, col, step || 60) + hills(c, seed + 1, base + 1, amp * 0.5, dk(col, 0.08), (step || 60) * 1.4); }
  // sand floor with an undulating lit top edge and ripples
  function sandFloor(c, y, top, bot, seed) {
    var d = 'M-4,' + n(y) + ' C90,' + n(y - 5) + ' 170,' + n(y + 4) + ' 250,' + n(y - 3) + ' C310,' + n(y - 7) + ' 360,' + n(y + 1) + ' 404,' + n(y - 4) + ' L404,242 L-4,242 Z';
    return body(c, d, top, R(-4, y - 8, 408, 250 - y, c.lg([[0, lt(top, 0.18), 0.5], [1, bot, 0.9]])), 1.6) + ripples(seed || 5, y + 8, 236, dk(top, 0.2), 22);
  }
  // saguaro cactus with up to two arms (arm = [side, heightFrac, reach])
  function cactus(c, x, y, s, col, arms) {
    col = col || CACT; var h = 60 * s, w = 12 * s, o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    var spn = function (T) { var d = ''; for (var i = 1; i < T.s.length - 1; i++) { var a = T.a[i], b = T.b[i]; d += 'M' + pt(a) + 'l' + n(-2 * s) + ',' + n(-1 * s) + 'M' + pt(b) + 'l' + n(2 * s) + ',' + n(-1 * s); } return L(d, '#f4ecc8', 0.8 * s, 0.9); };
    (arms || []).forEach(function (a) {
      var k = a[0], by = y - h * a[1], rc = a[2] * s, T = taper([[x, by + 4 * s], [x + k * rc * 0.8, by + 3 * s], [x + k * rc, by - 6 * s], [x + k * rc, by - rc * 1.6]], w * 0.72, w * 0.62, 5);
      o += body(c, T.d, k > 0 ? dk(col, 0.1) : col, L(along(T, 0.5), dk(col, 0.3), 1 * s) + F(ribbonBand(T, 0.62, 1), dk(col, 0.25), 0.7), 1.5 * s) + spn(T) + C(T.s[T.s.length - 1][0], T.s[T.s.length - 1][1], 2.6 * s, c.cel(lt(col, 0.25)), 0.9 * s);
    });
    var M = taper([[x, y], [x, y - h * 0.5], [x, y - h + w * 0.5]], w * 1.02, w * 0.92, 5);
    o += body(c, M.d + 'M' + pt([x - w * 0.46, y - h + w * 0.5]) + 'A' + n(w * 0.46) + ',' + n(w * 0.5) + ' 0 0,1 ' + pt([x + w * 0.46, y - h + w * 0.5]) + 'Z', col,
      L(along(M, 0.25) + along(M, 0.5) + along(M, 0.75), dk(col, 0.3), 1 * s) + F(ribbonBand(M, 0.66, 1), dk(col, 0.26), 0.75) + F(ribbonBand(M, 0, 0.18), lt(col, 0.2), 0.6), 1.6 * s);
    return o + spn(M);
  }
  // prickly-pear clump: stacked pads with spine dots and pink fruit
  function prickly(c, x, y, s, col) {
    col = col || '#7aa84e';
    var pads = [[0, -9, 10, 9, 0], [-12, -12, 8, 7, -0.4], [10, -16, 8, 8, 0.4], [-2, -24, 8, 7, 0.1], [-18, -24, 6, 6, -0.5], [14, -30, 6, 6, 0.5]], o = E(x, y + 1, 20 * s, 3 * s, '#000', 0, 0.22);
    pads.forEach(function (p, i) {
      var px = x + p[0] * s, py = y + p[1] * s, rx = p[2] * s, ry = p[3] * s;
      o += '<g transform="rotate(' + n(p[4] * 57.3) + ' ' + n(px) + ' ' + n(py) + ')">' + body(c, ellD(px, py, rx, ry), i % 2 ? dk(col, 0.08) : col, F(ellD(px + rx * 0.5, py + ry * 0.2, rx * 0.6, ry), dk(col, 0.22), 0.7), 1.3 * s) +
        C(px - rx * 0.4, py - ry * 0.3, 0.6 * s, '#f4ecc8') + C(px + rx * 0.2, py + ry * 0.2, 0.6 * s, '#f4ecc8') + C(px - rx * 0.1, py - ry * 0.7, 0.6 * s, '#f4ecc8') + '</g>';
    });
    return o + E(x + 1 * s, y - 38 * s, 2.6 * s, 3.2 * s, c.cel('#e0508a'), 1 * s) + E(x - 20 * s, y - 31 * s, 2.4 * s, 3 * s, c.cel('#e0508a'), 1 * s) + E(x + 16 * s, y - 37 * s, 2.2 * s, 2.8 * s, c.cel('#e87aa0'), 1 * s);
  }
  // dry thorn scrub
  function thorns(c, x, y, s, col, seed) {
    col = col || '#7a5a3a'; var r = rng(seed || Math.round(x * 7 + y)), d = '', sp = '';
    for (var i = 0; i < 7; i++) {
      var a = -PI + 0.3 + i * (PI - 0.6) / 6 + (r() - 0.5) * 0.2, len = (16 + r() * 10) * s, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len * 0.9, mx = x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 6 * s, my = y + Math.sin(a) * len * 0.5;
      d += 'M' + pt([x, y]) + 'Q' + pt([mx, my]) + ' ' + pt([ex, ey]);
      for (var k = 1; k < 4; k++) { var t = k / 4, bx = x + (ex - x) * t, by = y + (ey - y) * t; sp += 'M' + pt([bx, by]) + 'l' + n((r() - 0.5) * 6 * s) + ',' + n(-3 * s - r() * 2 * s); }
    }
    return E(x, y + 1, 18 * s, 2.6 * s, '#000', 0, 0.2) + L(d + sp, OL, 2.8 * s) + L(d + sp, col, 1.3 * s);
  }
  // bleached horned beast skull half sunk in sand
  function hornSkull(c, x, y, s) {
    var o = E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.22);
    o += P('M' + pt([x - 4 * s, y - 6 * s]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 18 * s, y - 14 * s]) + ' ' + pt([x - 16 * s, y - 20 * s]) + 'C' + pt([x - 14 * s, y - 14 * s]) + ' ' + pt([x - 9 * s, y - 11 * s]) + ' ' + pt([x - 3 * s, y - 10 * s]) + 'Z', c.cel(BONE), 1.2 * s);
    o += P('M' + pt([x + 4 * s, y - 6 * s]) + 'C' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 18 * s, y - 14 * s]) + ' ' + pt([x + 16 * s, y - 20 * s]) + 'C' + pt([x + 14 * s, y - 14 * s]) + ' ' + pt([x + 9 * s, y - 11 * s]) + ' ' + pt([x + 3 * s, y - 10 * s]) + 'Z', c.cel(dk(BONE, 0.08)), 1.2 * s);
    o += P('M' + pt([x - 6 * s, y - 9 * s]) + 'C' + pt([x - 6 * s, y - 13 * s]) + ' ' + pt([x + 6 * s, y - 13 * s]) + ' ' + pt([x + 6 * s, y - 9 * s]) + 'L' + pt([x + 3 * s, y]) + 'L' + pt([x - 3 * s, y]) + 'Z', c.cel(BONE), 1.3 * s);
    return o + E(x - 2.6 * s, y - 8 * s, 1.5 * s, 1.8 * s, OL) + E(x + 2.6 * s, y - 8 * s, 1.5 * s, 1.8 * s, OL) + F(ellD(x, y + 0.5, 8 * s, 1.6 * s), SANDD, 0.9);
  }
  // flat-roofed sandstone house with rounded corners, a dark door and an optional striped awning
  function adobe(c, x, y, w, h, col, awn, seed) {
    col = col || SST; var r = rng(seed || 3), o = E(x + w / 2, y + 2, w * 0.6, 4, '#000', 0, 0.22);
    var d = 'M' + pt([x, y]) + 'L' + pt([x, y - h + 4]) + 'Q' + pt([x, y - h]) + ' ' + pt([x + 4, y - h]) + 'L' + pt([x + w - 4, y - h]) + 'Q' + pt([x + w, y - h]) + ' ' + pt([x + w, y - h + 4]) + 'L' + pt([x + w, y]) + 'Z';
    var cr = ''; for (var i = 0; i < 5; i++) cr += E(x + 6 + r() * (w - 12), y - h * (0.2 + r() * 0.6), 3 + r() * 3, 1.6, dk(col, 0.1), 0, 0.7);
    o += body(c, d, col, cr + F(pd([[x + w * 0.66, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.66, y + 2]], true), dk(col, 0.22), 0.8) + R(x - 2, y - h, w + 4, 4, lt(col, 0.2), 0), 1.7);
    for (var b = x + 6; b < x + w - 4; b += 10) o += R(b, y - h + 5, 3, 3, c.cel(WOOD), 0.9);
    o += P(arched(x + w * 0.3, y, w * 0.2, h * 0.55), '#2a1c14', 1.3) + P(arched(x + w * 0.72, y - h * 0.42, w * 0.13, h * 0.22), '#2a1c14', 1.2);
    if (awn) {
      var ax0 = x + w * 0.14, ax1 = x + w * 0.9, ay = y - h * 0.62, sw = (ax1 - ax0) / 6, st = '';
      for (var k = 0; k < 6; k++) st += F(pd([[ax0 + k * sw, ay], [ax0 + (k + 0.5) * sw, ay], [ax0 + (k + 0.5) * sw - 3, ay + 12], [ax0 + k * sw - 3, ay + 12]], true), '#f4ecd8');
      o += limb('M' + pt([ax0 - 3, ay + 12]) + 'L' + pt([ax0 - 5, y]) + 'M' + pt([ax1 - 3, ay + 12]) + 'L' + pt([ax1 - 5, y]), WOOD, 1.8);
      o += body(c, pd([[ax0, ay], [ax1, ay], [ax1 - 3, ay + 12], [ax0 - 3, ay + 12]], true), awn, st, 1.4) + L(rag(ax1 - 3, ax0 - 3, ay + 12, 3, seed || 5).replace(/^L/, 'M'), OL, 1.2);
    }
    return o;
  }
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.5]) + 'Q' + pt([x - w / 2, top]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top]) + ' ' + pt([x + w / 2, top + w * 0.5]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }
  // goblin water tower: splayed stilts, a banded riveted tank, a cone roof and a spout
  function waterTower(c, x, y, s) {
    var tk = '#8a8e96', o = E(x, y + 2, 34 * s, 5 * s, '#000', 0, 0.25), top = y - 70 * s;
    o += limb('M' + pt([x - 26 * s, y]) + 'L' + pt([x - 18 * s, top]) + 'M' + pt([x + 26 * s, y]) + 'L' + pt([x + 18 * s, top]) + 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 6 * s, top]) + 'M' + pt([x + 8 * s, y]) + 'L' + pt([x + 6 * s, top]), WOOD, 3.4 * s);
    o += L('M' + pt([x - 24 * s, y - 20 * s]) + 'L' + pt([x + 22 * s, y - 44 * s]) + 'M' + pt([x + 24 * s, y - 20 * s]) + 'L' + pt([x - 22 * s, y - 44 * s]) + 'M' + pt([x - 23 * s, y - 30 * s]) + 'L' + pt([x + 23 * s, y - 30 * s]), OL, 3.2 * s) +
      L('M' + pt([x - 24 * s, y - 20 * s]) + 'L' + pt([x + 22 * s, y - 44 * s]) + 'M' + pt([x + 24 * s, y - 20 * s]) + 'L' + pt([x - 22 * s, y - 44 * s]) + 'M' + pt([x - 23 * s, y - 30 * s]) + 'L' + pt([x + 23 * s, y - 30 * s]), lt(WOOD, 0.1), 1.4 * s);
    var tank = 'M' + pt([x - 26 * s, top]) + 'L' + pt([x - 26 * s, top - 34 * s]) + 'C' + pt([x - 26 * s, top - 38 * s]) + ' ' + pt([x + 26 * s, top - 38 * s]) + ' ' + pt([x + 26 * s, top - 34 * s]) + 'L' + pt([x + 26 * s, top]) + 'C' + pt([x + 26 * s, top + 4 * s]) + ' ' + pt([x - 26 * s, top + 4 * s]) + ' ' + pt([x - 26 * s, top]) + 'Z', rv = '';
    for (var i = -3; i <= 3; i++) rv += C(x + i * 7 * s, top - 11.5 * s + Math.abs(i) * 0.2, 0.9 * s, lt(tk, 0.35)) + C(x + i * 7 * s, top - 23.5 * s, 0.9 * s, lt(tk, 0.35));
    o += body(c, tank, tk, L('M' + pt([x - 26 * s, top - 12 * s]) + 'Q' + pt([x, top - 8 * s]) + ' ' + pt([x + 26 * s, top - 12 * s]) + 'M' + pt([x - 26 * s, top - 24 * s]) + 'Q' + pt([x, top - 20 * s]) + ' ' + pt([x + 26 * s, top - 24 * s]), '#5a4a3a', 2.4 * s) + rv +
      F(pd([[x + 10 * s, top - 40 * s], [x + 30 * s, top - 40 * s], [x + 30 * s, top + 6 * s], [x + 10 * s, top + 6 * s]], true), dk(tk, 0.3), 0.75) + F('M' + pt([x - 20 * s, top - 4 * s]) + 'L' + pt([x - 16 * s, top - 30 * s]) + 'L' + pt([x - 12 * s, top - 30 * s]) + 'L' + pt([x - 16 * s, top - 4 * s]) + 'Z', '#ffffff', 0.25), 2 * s);
    o += body(c, pd([[x - 30 * s, top - 34 * s], [x, top - 52 * s], [x + 30 * s, top - 34 * s]], true), '#b8503a', F(pd([[x + 1 * s, top - 53 * s], [x + 32 * s, top - 33 * s], [x + 1 * s, top - 33 * s]], true), '#7a2e20', 0.7), 1.8 * s) + limb('M' + pt([x, top - 52 * s]) + 'L' + pt([x, top - 58 * s]), '#5a5a60', 1.4 * s) + C(x, top - 59 * s, 1.8 * s, GOLD, 0.8 * s);
    o += limb('M' + pt([x - 20 * s, top + 2 * s]) + 'L' + pt([x - 20 * s, top + 12 * s]) + 'L' + pt([x - 32 * s, top + 12 * s]), '#6a6e76', 2.6 * s) + R(x - 36 * s, top + 9 * s, 5 * s, 6 * s, c.cel('#6a6e76'), 1 * s) + F(pd([[x - 34 * s, top + 15 * s], [x - 33 * s, top + 22 * s], [x - 35 * s, top + 22 * s]], true), '#8ad0e8', 0.9);
    return o;
  }
  // pennant string between two points
  function bunting(x0, y0, x1, y1, sag, cols) {
    var d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, Math.max(y0, y1) + sag * 2]) + ' ' + pt([x1, y1]), o = L(d, OL, 1.2), k = 9;
    for (var i = 1; i < k; i++) { var t = i / k, u = 1 - t, px = u * u * x0 + 2 * u * t * (x0 + x1) / 2 + t * t * x1, py = u * u * y0 + 2 * u * t * (Math.max(y0, y1) + sag * 2) + t * t * y1; o += P(pd([[px - 3, py], [px + 3, py], [px, py + 7]], true), cols[i % cols.length], 0.8); }
    return o;
  }
  // goblin bruiser guard standing in a scene: foot at (x, y), s = scale of the 128 mob frame
  function bruiser(c, x, y, s, flip) {
    var g = gob(c, {
      skin: '#6aa84a', shirt: '#a8321e', sleeve: '#a8321e', forearm: '#6aa84a', pants: '#3a3a44', hat: '#8a8e96', hatStyle: 'hard', stripe: '#5a5e66', belt: '#3a2a1a', buckle: GOLD, boots: '#2a2220', legW: 11, armW: 10, shadowR: 34,
      torsoD: 'M42,50 C50,42 78,42 86,50 L86,72 L82,88 L46,88 L42,72 Z',
      pads: function (c) { return pauldronT(c, 82, 50, 10, '#8a8e96') + pauldronT(c, 44, 52, 12, '#8a8e96'); },
      near: [[46, 56], [38, 44], [34, 30]], wNear: function (c, p) { return axe(c, p, 30, -PI / 2 - 0.15, 12, '#b8bcc4', false, '#4a3222'); },
      scale: 0.9
    });
    var m = flip ? 'matrix(' + n(-s) + ',0,0,' + n(s) + ',' + n(x + 64 * s) + ',' + n(y - 122 * s) + ')' : 'matrix(' + n(s) + ',0,0,' + n(s) + ',' + n(x - 64 * s) + ',' + n(y - 122 * s) + ')';
    return G(g, m);
  }
  function pauldronT(c, x, y, r, col) {
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    return body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  // ---- coast pieces ----
  function sea(c, y0, y1, seed) {
    return R(-2, y0, 404, y1 - y0, c.lg([[0, '#3aa8b8'], [0.5, '#2a8aa4'], [1, '#56c0c0']])) + waves(seed || 3, y0 + 3, y1 - 2, 30, '#e8fbf8') + L('M-2,' + n(y0) + 'L402,' + n(y0), '#bcecec', 1.4, 0.8);
  }
  function surf(y, seed) {
    var r = rng(seed || 4), d = 'M-4,' + n(y);
    for (var x = 0; x <= 410; x += 20) d += 'Q' + pt([x - 10, y + 3 + r() * 2]) + ' ' + pt([x, y + (r() - 0.5) * 2]);
    return L(d, '#f4fffc', 3, 0.85) + L(d.replace(/,(\d+(\.\d+)?)/g, function (m, v) { return ',' + n(+v + 4); }), '#f4fffc', 1.2, 0.5);
  }
  // two-masted pirate ship moored side-on (x = middle of the hull, y = waterline)
  function ship(c, x, y, s, flagCol) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, hull = '#6a4428', o = '';
    var hd = 'M' + pt(q(-70, -18)) + 'L' + pt(q(-58, -20)) + 'L' + pt(q(40, -20)) + 'L' + pt(q(46, -34)) + 'L' + pt(q(72, -36)) + 'L' + pt(q(70, -18)) + 'C' + pt(q(66, -2)) + ' ' + pt(q(50, 6)) + ' ' + pt(q(30, 6)) + 'L' + pt(q(-46, 6)) + 'C' + pt(q(-60, 4)) + ' ' + pt(q(-68, -6)) + ' ' + pt(q(-70, -18)) + 'Z';
    // masts and furled sails behind the rail
    [[-22, 108], [22, 96]].forEach(function (m) {
      var mx = x + m[0] * s, top = y - m[1] * s;
      o += limb('M' + pt([mx, y - 18 * s]) + 'L' + pt([mx, top]), '#5a3a22', 3.2 * s) + limb('M' + pt([mx - 24 * s, top + 16 * s]) + 'L' + pt([mx + 24 * s, top + 16 * s]) + 'M' + pt([mx - 20 * s, top + 50 * s]) + 'L' + pt([mx + 20 * s, top + 50 * s]), '#5a3a22', 2 * s);
      var sl = 'M' + pt([mx - 22 * s, top + 17 * s]) + 'L' + pt([mx + 22 * s, top + 17 * s]) + 'C' + pt([mx + 26 * s, top + 30 * s]) + ' ' + pt([mx + 22 * s, top + 42 * s]) + ' ' + pt([mx + 18 * s, top + 49 * s]) + 'L' + pt([mx - 18 * s, top + 49 * s]) + 'C' + pt([mx - 14 * s, top + 40 * s]) + ' ' + pt([mx - 16 * s, top + 28 * s]) + ' ' + pt([mx - 22 * s, top + 17 * s]) + 'Z';
      o += body(c, sl, '#e8dcc0', F(pd([[mx + 4 * s, top + 14 * s], [mx + 28 * s, top + 14 * s], [mx + 28 * s, top + 52 * s], [mx + 4 * s, top + 52 * s]], true), '#b8a888', 0.7) + L('M' + pt([mx - 8 * s, top + 18 * s]) + 'L' + pt([mx - 6 * s, top + 48 * s]) + 'M' + pt([mx + 8 * s, top + 18 * s]) + 'L' + pt([mx + 7 * s, top + 48 * s]), '#a89878', 1 * s) + F(pd([[mx - 22 * s, top + 17 * s], [mx + 22 * s, top + 17 * s], [mx + 20 * s, top + 22 * s], [mx - 20 * s, top + 22 * s]], true), '#8a2a22', 0.9), 1.4 * s);
      o += P(pd([[mx - 7 * s, top + 60 * s], [mx + 7 * s, top + 60 * s], [mx + 5 * s, top + 66 * s], [mx - 5 * s, top + 66 * s]], true), c.cel('#6a4428'), 1.1 * s);
    });
    // flag on the main mast: dark field, bone skull over crossed blades (original)
    var fx = x - 22 * s, fy = y - 108 * s;
    o += limb('M' + pt([fx, fy]) + 'L' + pt([fx, fy - 8 * s]), '#5a3a22', 1.6 * s) + body(c, pd([[fx, fy - 8 * s], [fx - 22 * s, fy - 6 * s], [fx - 18 * s, fy + 2 * s], [fx - 22 * s, fy + 8 * s], [fx, fy + 6 * s]], true), flagCol || '#1e1a1e', '', 1.2 * s) +
      L('M' + pt([fx - 16 * s, fy + 4 * s]) + 'L' + pt([fx - 5 * s, fy - 5 * s]) + 'M' + pt([fx - 16 * s, fy - 5 * s]) + 'L' + pt([fx - 5 * s, fy + 4 * s]), BONE, 1.3 * s) + C(fx - 10.5 * s, fy - 1.5 * s, 3 * s, BONE) + C(fx - 11.5 * s, fy - 2 * s, 0.7 * s, OL) + C(fx - 9.5 * s, fy - 2 * s, 0.7 * s, OL);
    // rigging
    o += L('M' + pt(q(-22, -106)) + 'L' + pt(q(-66, -20)) + 'M' + pt(q(-22, -106)) + 'L' + pt(q(22, -94)) + 'M' + pt(q(22, -94)) + 'L' + pt(q(66, -36)) + 'M' + pt(q(-22, -106)) + 'L' + pt(q(-90, -30)), '#3a2a1e', 0.9 * s, 0.9);
    o += limb('M' + pt(q(-68, -22)) + 'L' + pt(q(-92, -30)), '#5a3a22', 2.2 * s);
    o += body(c, hd, hull, L('M' + pt(q(-64, -8)) + 'L' + pt(q(66, -8)) + 'M' + pt(q(-58, 0)) + 'L' + pt(q(56, 0)), dk(hull, 0.35), 1.2 * s) + R(x - 70 * s, y - 16 * s, 140 * s, 4 * s, '#c8a040', 0) + F(pd([q(10, -40), q(80, -40), q(80, 10), q(20, 10)], true), dk(hull, 0.3), 0.6), 2 * s);
    for (var i = -3; i <= 2; i++) o += R(x + i * 16 * s - 3 * s, y - 13 * s, 6 * s, 5 * s, '#1a1210', 0.9 * s) + C(x + i * 16 * s, y - 10.5 * s, 1.4 * s, '#2a2a30');
    o += R(x + 48 * s, y - 31 * s, 5 * s, 5 * s, '#ffcf6a', 0.9 * s) + R(x + 58 * s, y - 31 * s, 5 * s, 5 * s, '#ffcf6a', 0.9 * s);
    return o + F('M' + pt(q(-66, 4)) + 'L' + pt(q(64, 4)) + 'L' + pt(q(60, 8)) + 'L' + pt(q(-62, 8)) + 'Z', '#0e3a44', 0.5);
  }
  // plank shack on stilts with a lean-to tin roof
  function shanty(c, x, y, w, h, col, seed, roofCol) {
    col = col || '#9a7048'; var r = rng(seed || 5), o = E(x + w / 2, y + 2, w * 0.6, 3.6, '#000', 0, 0.25), pl = '';
    o += limb('M' + pt([x + 3, y]) + 'L' + pt([x + 3, y - 10]) + 'M' + pt([x + w - 3, y]) + 'L' + pt([x + w - 3, y - 10]) + 'M' + pt([x + w / 2, y]) + 'L' + pt([x + w / 2, y - 10]), '#5a3e24', 2.6);
    for (var px = x + 5; px < x + w; px += 6) pl += 'M' + pt([px + (r() - 0.5), y - 10]) + 'L' + pt([px, y - 10 - h]);
    o += body(c, pd([[x, y - 10], [x, y - 10 - h], [x + w, y - 10 - h - 4], [x + w, y - 10]], true), col, L(pl, dk(col, 0.35), 0.9) + F(pd([[x + w * 0.7, y - 20 - h], [x + w + 2, y - 20 - h], [x + w + 2, y - 8], [x + w * 0.7, y - 8]], true), dk(col, 0.25), 0.7) + R(x + w * 0.52, y - 10 - h * 0.62, w * 0.2, h * 0.3, '#2a1c14', 1), 1.6);
    o += P(pd([[x + w * 0.16, y - 10], [x + w * 0.16, y - 10 - h * 0.7], [x + w * 0.38, y - 10 - h * 0.72], [x + w * 0.38, y - 10]], true), '#2a1c14', 1.2);
    o += body(c, pd([[x - 5, y - 8 - h], [x + w + 6, y - 14 - h - 4], [x + w + 6, y - 9 - h - 4], [x - 5, y - 3 - h]], true), roofCol || '#8a8e8a', L('M' + pt([x + w * 0.3, y - 11 - h]) + 'l0,5 M' + pt([x + w * 0.6, y - 13 - h]) + 'l0,5', dk(roofCol || '#8a8e8a', 0.3), 1) + F(pd([[x + w * 0.2, y - 20 - h], [x + w * 0.34, y - 20 - h], [x + w * 0.34, y - 2 - h], [x + w * 0.2, y - 2 - h]], true), '#9a5a2a', 0.6), 1.3);
    return o;
  }
  // wooden pier running from (x0, y) out to x1, planks and posts
  function pier(c, x0, x1, y, s) {
    var o = '', pl = '', d = 'M' + pt([x0, y - 4 * s]) + 'L' + pt([x1, y - 4 * s]) + 'L' + pt([x1 + 4 * s, y + 2 * s]) + 'L' + pt([x0 - 4 * s, y + 2 * s]) + 'Z';
    for (var x = x0 + 6; x < x1; x += 22) o += limb('M' + pt([x, y]) + 'L' + pt([x, y + 14 * s]), '#4a3220', 3 * s);
    for (var px = x0; px < x1; px += 7) pl += 'M' + pt([px, y - 4 * s]) + 'L' + pt([px - 2 * s, y + 2 * s]);
    return o + body(c, d, '#a07a4e', L(pl, '#6a4a2c', 0.9), 1.4 * s);
  }
  // ---- bandit camp pieces ----
  function stripeTent(c, x, y, s, col, band) {
    var o = tent(c, x, y, s, col, band), q = function (u, v) { return [x + u * s, y + v * s]; };
    return o + F(pd([q(-17, -10), q(-12, -20), q(-6, -20), q(-10.8, -10)], true) + pd([q(-9, -26), q(-5, -33), q(-1.4, -33), q(-4, -26)], true), band, 0.85) + F(pd([q(8, -10), q(12, -10), q(9, -20), q(6, -20)], true), band, 0.85);
  }
  function spring(c, x, y, rx, ry) {
    var o = E(x, y + ry * 0.2, rx + 6, ry + 3, '#b8904a', 0, 0.9) + E(x, y, rx, ry, c.lg([[0, '#2a8aa0'], [1, '#6ad0d0']]), 1.6);
    o += E(x - rx * 0.3, y - ry * 0.3, rx * 0.4, ry * 0.2, '#f0fcff', 0, 0.45) + L('M' + pt([x - rx * 0.5, y + ry * 0.2]) + 'q' + n(rx * 0.25) + ',-2 ' + n(rx * 0.5) + ',0 M' + pt([x + rx * 0.1, y + ry * 0.45]) + 'q' + n(rx * 0.2) + ',-2 ' + n(rx * 0.4) + ',0', '#e8fcff', 1, 0.7);
    return o;
  }
  function rushes(c, x, y, s, col) {
    col = col || '#7a9a3a'; var d = '', r = rng(Math.round(x * 3 + y));
    for (var i = 0; i < 6; i++) { var bx = x + (i - 2.5) * 2.4 * s, h = (14 + r() * 12) * s, ln = (i - 2.5) * 2 * s; d += 'M' + pt([bx, y]) + 'Q' + pt([bx + ln * 0.2, y - h * 0.6]) + ' ' + pt([bx + ln, y - h]); }
    return L(d, OL, 2.6 * s) + L(d, col, 1.2 * s);
  }
  // ---- silithid hive pieces ----
  function hiveMound(c, x, y, w, h, col, seed) {
    col = col || '#c8923e'; var r = rng(seed || 7), o = E(x, y + 2, w * 0.62, 5, '#000', 0, 0.28);
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.46, y - h * 0.5]) + ' ' + pt([x - w * 0.22, y - h * 0.9]) + ' ' + pt([x - w * 0.08, y - h]) + 'C' + pt([x, y - h * 1.04]) + ' ' + pt([x + w * 0.1, y - h * 1.02]) + ' ' + pt([x + w * 0.16, y - h * 0.92]) +
      'C' + pt([x + w * 0.3, y - h * 0.7]) + ' ' + pt([x + w * 0.44, y - h * 0.46]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var ribs = '', holes = '';
    for (var i = 1; i < 6; i++) { var t = i / 6, yy = y - h * t, hw = w * 0.5 * (1 - t * 0.82); ribs += 'M' + pt([x - hw, yy + 2]) + 'Q' + pt([x, yy + 6 - t * 4]) + ' ' + pt([x + hw, yy + 2]); }
    for (var k = 0; k < 5; k++) { var hy = y - h * (0.15 + r() * 0.65), sp = w * 0.5 * (1 - (y - hy) / h * 0.82) * 0.7, hx = x + (r() - 0.6) * sp * 2; holes += E(hx, hy, 3 + r() * 3, 2.4 + r() * 2, '#2a1a0c', 1.1) + F(ellD(hx, hy + 2.6, 2.6, 1.2), OOZE, 0.8); }
    o += body(c, d, col, L(ribs, dk(col, 0.3), 1.2) + F(pd([[x + w * 0.02, y - h - 4], [x + w * 0.6, y - h], [x + w * 0.6, y + 4], [x + w * 0.16, y + 4]], true), dk(col, 0.25), 0.8) + holes, 1.8);
    var drip = '';
    for (var j = 0; j < 3; j++) { var dx = x + (r() - 0.5) * w * 0.4, dy = y - h * (0.3 + r() * 0.5), dl = 5 + r() * 6; drip += 'M' + pt([dx - 3, dy]) + 'Q' + pt([dx, dy - 2]) + ' ' + pt([dx + 3, dy]) + 'L' + pt([dx + 1.6, dy + dl]) + 'Q' + pt([dx, dy + dl + 4]) + ' ' + pt([dx - 1.6, dy + dl]) + 'Z'; }
    var sp = '';
    for (var k2 = 0; k2 < 4; k2++) { var t2 = 0.3 + k2 * 0.16, sy = y - h * t2, sx = x + (k2 % 2 ? 1 : -1) * w * 0.5 * (1 - t2 * 0.82) * 0.92, kk = k2 % 2 ? 1 : -1; sp += 'M' + pt([sx, sy + 4]) + 'Q' + pt([sx + kk * 8, sy]) + ' ' + pt([sx + kk * 11, sy - 9]) + 'Q' + pt([sx + kk * 4, sy - 3]) + ' ' + pt([sx - kk * 1, sy - 3]) + 'Z'; }
    return P(sp, c.cel(dk(col, 0.2)), 1.4) + o + P(drip, '#a8cc30', 1) + E(x - w * 0.12, y - h * 0.98, w * 0.1, 3, OOZE, 1, 0.9);
  }
  function eggSacs(c, x, y, s) {
    var o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.25);
    [[-8, -6, 6, 8], [4, -7, 7, 9], [-1, -13, 5, 6], [10, -4, 4, 5]].forEach(function (e, i) { o += E(x + e[0] * s, y + e[1] * s, e[2] * s, e[3] * s, c.cel(i % 2 ? '#d8d08a' : '#e4dc9a'), 1.2 * s) + E(x + e[0] * s - e[2] * s * 0.3, y + e[1] * s - e[3] * s * 0.4, e[2] * s * 0.25, e[3] * s * 0.2, '#fffbe0', 0, 0.7) + F(ellD(x + e[0] * s, y + e[1] * s + e[3] * s * 0.2, e[2] * s * 0.4, e[3] * s * 0.4), '#9aa83a', 0.35); });
    return o;
  }
  function slime(c, x, y, rx, ry) { return E(x, y, rx, ry, c.lg([[0, lt(OOZE, 0.2)], [1, dk(OOZE, 0.25)]]), 1.2) + E(x - rx * 0.3, y - ry * 0.3, rx * 0.3, ry * 0.25, '#fbffe0', 0, 0.6); }
  // ---- ogre camp pieces ----
  // hide tent: a tripod of poles wrapped in patched hides, bone ties
  function hideTent(c, x, y, s, col, seed) {
    col = col || HIDE; var r = rng(seed || 9), q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 40 * s, 5 * s, '#000', 0, 0.28);
    o += limb('M' + pt(q(-6, -62)) + 'L' + pt(q(8, -48)) + 'M' + pt(q(6, -64)) + 'L' + pt(q(-4, -48)) + 'M' + pt(q(0, -66)) + 'L' + pt(q(0, -48)), '#6a4a2a', 2.6 * s);
    var d = pd([q(-36, 0), q(-4, -50), q(4, -50), q(36, 0)], true), pt2 = '';
    for (var i = 0; i < 4; i++) { var u = -18 + r() * 30, v = -10 - r() * 30; pt2 += F(pd([q(u - 6, v - 5), q(u + 6, v - 6), q(u + 7, v + 6), q(u - 5, v + 6)], true), i % 2 ? dk(col, 0.15) : lt(col, 0.1), 0.9) + L('M' + pt(q(u - 6, v - 5)) + 'l' + n(12 * s) + ',' + n(-1 * s) + 'l' + n(1 * s) + ',' + n(12 * s), dk(col, 0.45), 0.8 * s, 0.8); }
    o += body(c, d, col, pt2 + F(pd([q(4, -52), q(40, -52), q(40, 4), q(12, 4)], true), dk(col, 0.28), 0.8) + L('M' + pt(q(-30, -8)) + 'L' + pt(q(30, -8)), dk(col, 0.4), 1 * s), 1.8 * s);
    o += P(pd([q(-10, 0), q(0, -30), q(10, 0)], true), '#2a1a10', 1.3 * s) + P(pd([q(0, -30), q(10, 0), q(16, 0)], true), c.cel(dk(col, 0.1)), 1.1 * s);
    return o + bone(x - 20 * s, y - 16 * s, 10 * s, 0.4, 0.8 * s) + skull(c, x, y - 40 * s, 0.6 * s);
  }
  // huge rib cage of some long-dead beast arching out of the sand
  function ribCage(c, x, y, s) {
    var o = E(x, y + 2, 60 * s, 5 * s, '#000', 0, 0.2), sp = 'M' + pt([x - 56 * s, y - 8 * s]) + 'Q' + pt([x, y - 26 * s]) + ' ' + pt([x + 56 * s, y - 6 * s]);
    o += limb(sp, BONE, 5 * s);
    for (var i = 0; i < 6; i++) { var t = i / 5, bx = x - 44 * s + t * 86 * s, by = y - 8 * s - Math.sin(t * PI) * 10 * s - 6 * s, h = (44 - Math.abs(t - 0.5) * 30) * s, rd = 'M' + pt([bx, by]) + 'C' + pt([bx - 14 * s, by - h * 0.2]) + ' ' + pt([bx - 20 * s, by - h * 0.7]) + ' ' + pt([bx - 8 * s, by - h]); o += limb(rd, i % 2 ? BONE : dk(BONE, 0.08), 3.6 * s); }
    return o + F(ellD(x, y + 1, 58 * s, 3 * s), SANDD, 0.8);
  }
  function tusk(c, x, y, s, flip) {
    var k = flip ? -1 : 1, d = 'M' + pt([x - 5 * s * k, y]) + 'C' + pt([x - 8 * s * k, y - 24 * s]) + ' ' + pt([x + 6 * s * k, y - 46 * s]) + ' ' + pt([x + 24 * s * k, y - 52 * s]) + 'C' + pt([x + 10 * s * k, y - 40 * s]) + ' ' + pt([x + 4 * s * k, y - 22 * s]) + ' ' + pt([x + 6 * s * k, y]) + 'Z';
    return E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.25) + body(c, d, BONE, L('M' + pt([x - 5 * s * k, y - 10 * s]) + 'l' + n(10 * s * k) + ',0 M' + pt([x - 4 * s * k, y - 20 * s]) + 'l' + n(9 * s * k) + ',' + n(-1 * s), dk(BONE, 0.3), 1 * s) + F('M' + pt([x + 2 * s * k, y - 30 * s]) + 'L' + pt([x + 24 * s * k, y - 52 * s]) + 'L' + pt([x + 10 * s * k, y + 2]) + 'Z', dk(BONE, 0.18), 0.7), 1.5 * s);
  }
  // the ogres' standard: a hide on a crossbar with a red fist daubed on it (original mark)
  function fistMark(x, y, s) {
    return F('M' + pt([x - 5 * s, y + 6 * s]) + 'L' + pt([x - 6 * s, y - 2 * s]) + 'C' + pt([x - 6 * s, y - 6 * s]) + ' ' + pt([x + 5 * s, y - 7 * s]) + ' ' + pt([x + 6 * s, y - 2 * s]) + 'L' + pt([x + 5 * s, y + 6 * s]) + 'Z', '#b82a1a') +
      L('M' + pt([x - 3 * s, y - 5 * s]) + 'l0,3 M' + pt([x, y - 6 * s]) + 'l0,3 M' + pt([x + 3 * s, y - 5 * s]) + 'l0,3', '#5a1008', 0.9 * s) + F(pd([[x - 3 * s, y + 6 * s], [x - 1 * s, y + 11 * s], [x + 1 * s, y + 6 * s]], true), '#b82a1a');
  }
  // ---- ruins pieces ----
  function column(c, x, y, w, h, col, broken, seed) {
    col = col || '#d8c49a'; var r = rng(seed || 3), top = y - h;
    var tp = broken ? 'L' + pt([x + w / 2, top + 6]) + 'L' + pt([x + w * 0.2, top + 2]) + 'L' + pt([x, top + 8]) + 'L' + pt([x - w * 0.25, top]) + 'L' + pt([x - w / 2, top + 5]) : 'L' + pt([x + w / 2, top]) + 'L' + pt([x - w / 2, top]);
    var d = 'M' + pt([x - w / 2, y]) + 'L' + pt([x + w / 2, y]) + tp + 'Z', fl = '';
    for (var i = -1; i <= 1; i++) fl += 'M' + pt([x + i * w * 0.24, y]) + 'L' + pt([x + i * w * 0.24, top + 8]);
    var o = body(c, d, col, L(fl, dk(col, 0.22), 1) + F(pd([[x + w * 0.18, top - 2], [x + w / 2 + 2, top - 2], [x + w / 2 + 2, y + 2], [x + w * 0.18, y + 2]], true), dk(col, 0.25), 0.8) + L('M' + pt([x - w / 2, top + h * (0.3 + r() * 0.3)]) + 'l' + n(w * 0.4) + ',' + n(3), dk(col, 0.35), 0.9), 1.6);
    if (!broken) o += R(x - w / 2 - 4, top - 6, w + 8, 6, c.cel(col), 1.5) + R(x - w / 2 - 2, top - 10, w + 4, 4, c.cel(lt(col, 0.08)), 1.3);
    return o;
  }
  // sand drift piled against the foot of something
  function drift(c, x, y, w, h, col) {
    col = col || SAND;
    return P('M' + pt([x - w / 2, y + 1]) + 'C' + pt([x - w * 0.3, y - h]) + ' ' + pt([x + w * 0.2, y - h * 1.1]) + ' ' + pt([x + w / 2, y + 1]) + 'Z', col, 0) + L('M' + pt([x - w / 2, y + 1]) + 'C' + pt([x - w * 0.3, y - h]) + ' ' + pt([x + w * 0.2, y - h * 1.1]) + ' ' + pt([x + w / 2, y + 1]), dk(col, 0.35), 1.3) +
      L('M' + pt([x - w * 0.25, y - h * 0.5]) + 'Q' + pt([x - w * 0.05, y - h * 0.85]) + ' ' + pt([x + w * 0.2, y - h * 0.7]), lt(col, 0.4), 1.2, 0.8);
  }
  // crescent moon carving
  function crescent(x, y, r, col) { return F('M' + pt([x, y - r]) + 'A' + n(r) + ',' + n(r) + ' 0 1,0 ' + pt([x, y + r]) + 'A' + n(r * 0.72) + ',' + n(r * 0.85) + ' 0 1,1 ' + pt([x, y - r]) + 'Z', col); }
  // great stone face of an ancient statue, sunk to the cheekbones
  function stoneHead(c, x, y, s, col) {
    col = col || '#cdb892'; var q = function (u, v) { return [x + u * s, y + v * s]; };
    var d = 'M' + pt(q(-30, 0)) + 'L' + pt(q(-32, -40)) + 'C' + pt(q(-32, -64)) + ' ' + pt(q(30, -66)) + ' ' + pt(q(32, -40)) + 'L' + pt(q(30, 0)) + 'Z';
    var o = body(c, d, col, F(pd([q(6, -70), q(36, -70), q(36, 4), q(10, 4)], true), dk(col, 0.25), 0.8) + L('M' + pt(q(-18, -30)) + 'Q' + pt(q(-10, -34)) + ' ' + pt(q(-4, -30)) + 'M' + pt(q(4, -30)) + 'Q' + pt(q(10, -34)) + ' ' + pt(q(18, -30)), dk(col, 0.45), 2.4 * s) +
      E(x - 11 * s, y - 24 * s, 5 * s, 2.4 * s, dk(col, 0.4)) + E(x + 11 * s, y - 24 * s, 5 * s, 2.4 * s, dk(col, 0.4)) + P(pd([q(-3, -24), q(3, -24), q(5, -8), q(-5, -8)], true), c.cel(dk(col, 0.06)), 1.2 * s) +
      L('M' + pt(q(-20, -48)) + 'L' + pt(q(20, -48)), dk(col, 0.3), 1.2 * s) + L('M' + pt(q(14, -60)) + 'L' + pt(q(22, -44)) + 'L' + pt(q(18, -30)), dk(col, 0.45), 1 * s), 2 * s);
    return o + crescent(x, y - 55 * s, 5 * s, dk(col, 0.35));
  }
  function brokenArch(c, x, y, w, h, col) {
    col = col || '#d4c096'; var o = column(c, x - w / 2, y, 14, h, col, false, 5) + column(c, x + w / 2, y, 14, h * 0.6, col, true, 6);
    var ar = 'M' + pt([x - w / 2 - 11, y - h - 10]) + 'Q' + pt([x - w / 2 + 4, y - h - 46]) + ' ' + pt([x + 4, y - h - 44]) + 'L' + pt([x + 8, y - h - 34]) + 'L' + pt([x + 2, y - h - 30]) + 'Q' + pt([x - w / 2 + 10, y - h - 30]) + ' ' + pt([x - w / 2 + 11, y - h - 10]) + 'Z';
    return o + body(c, ar, col, F('M' + pt([x - w / 2, y - h - 40]) + 'L' + pt([x + 10, y - h - 46]) + 'L' + pt([x + 10, y - h - 28]) + 'L' + pt([x - w / 2 + 6, y - h - 22]) + 'Z', dk(col, 0.2), 0.6), 1.6) + crescent(x - w / 2 + 4, y - h - 24, 3.4, dk(col, 0.35));
  }
  // ---- The Dune Temple pieces ----
  function trollWall(c, x0, x1, yb, h, col, seed) {
    col = col || '#d49a5a'; var o = stoneFace(c, x0, yb, x1 - x0, h, col, 9);
    for (var x = x0; x < x1 - 4; x += 16) o += P(pd([[x, yb - h + 1], [x, yb - h - 6], [x + 3, yb - h - 6], [x + 3, yb - h - 10], [x + 9, yb - h - 10], [x + 9, yb - h - 6], [x + 12, yb - h - 6], [x + 12, yb - h + 1]], true), c.cel(lt(col, 0.05)), 1.3);
    return o + L('M' + pt([x0, yb - h * 0.55]) + 'L' + pt([x1, yb - h * 0.55]), dk(col, 0.4), 2.2) + L('M' + pt([x0, yb - h * 0.55 + 3]) + 'L' + pt([x1, yb - h * 0.55 + 3]), '#2a8a8a', 1.4, 0.8);
  }
  // tiki-style carved troll face with small tusks, framing a gate
  function trollFace(c, x, y, s, col) {
    col = col || '#c88a4a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    o += body(c, pd([q(-20, -22), q(20, -22), q(24, 10), q(14, 22), q(-14, 22), q(-24, 10)], true), col, F(pd([q(4, -24), q(26, -24), q(26, 24), q(6, 24)], true), dk(col, 0.25), 0.75), 1.8 * s);
    o += P(pd([q(-20, -8), q(-4, -12), q(-4, -4), q(-18, -2)], true) + pd([q(20, -8), q(4, -12), q(4, -4), q(18, -2)], true), '#1e1410', 1 * s) + gEye(c, x - 11 * s, y - 7 * s, 1.6 * s, '#5affd8') + gEye(c, x + 11 * s, y - 7 * s, 1.6 * s, '#5affd8');
    o += P(pd([q(-4, -4), q(4, -4), q(6, 6), q(-6, 6)], true), c.cel(dk(col, 0.1)), 1.2 * s) + P(pd([q(-14, 10), q(14, 10), q(10, 18), q(-10, 18)], true), '#2a1410', 1.2 * s);
    o += P(pd([q(-11, 17), q(-13, 9), q(-8, 15)], true) + pd([q(11, 17), q(13, 9), q(8, 15)], true), c.cel(BONE), 1.2 * s);
    return o + L('M' + pt(q(-20, -16)) + 'L' + pt(q(20, -16)), '#2a8a8a', 2 * s) + L('M' + pt(q(-16, -20)) + 'L' + pt(q(-12, -26)) + 'L' + pt(q(-8, -20)) + 'M' + pt(q(8, -20)) + 'L' + pt(q(12, -26)) + 'L' + pt(q(16, -20)), OL, 1.4 * s);
  }
  function stepTower(c, x, yb, w, h, col) {
    col = col || '#d49a5a'; var o = '';
    for (var i = 0; i < 3; i++) { var ww = w * (1 - i * 0.2), hh = h * 0.42, y0 = yb - i * hh * 0.82; o += stoneFace(c, x - ww / 2, y0, ww, hh, i % 2 ? lt(col, 0.04) : col, 8); }
    var tt = yb - h * 0.42 * 0.82 * 2 - h * 0.42;
    return o + P(pd([[x - w * 0.3, tt], [x, tt - 16], [x + w * 0.3, tt]], true), c.cel(dk(col, 0.15)), 1.6) + R(x - 3, yb - h * 0.5, 6, 10, '#1e1410', 1);
  }
  // sandstone headland rising from the sea; side 1 = land on the left, -1 = on the right
  function headland(c, x0, x1, y, h, col, side) {
    var a = side > 0 ? x0 : x1, b = side > 0 ? x1 : x0, k = side > 0 ? 1 : -1, w = Math.abs(x1 - x0);
    var d = 'M' + pt([a, y]) + 'L' + pt([a, y - h]) + 'L' + pt([a + k * w * 0.45, y - h - 4]) + 'L' + pt([a + k * w * 0.62, y - h * 0.8]) + 'L' + pt([a + k * w * 0.8, y - h * 0.62]) + 'L' + pt([b, y - h * 0.3]) + 'L' + pt([b + k * 4, y]) + 'Z';
    var st = 'M' + pt([a, y - h * 0.62]) + 'L' + pt([a + k * w * 0.74, y - h * 0.62]) + 'M' + pt([a, y - h * 0.32]) + 'L' + pt([a + k * w * 0.94, y - h * 0.32]);
    return body(c, d, col, L(st, dk(col, 0.25), 1.2, 0.8) + F(pd([[a + k * w * 0.45, y - h - 6], [b + k * 6, y - h - 6], [b + k * 6, y + 2], [a + k * w * 0.5, y + 2]], true), dk(col, 0.22), 0.75) + R(Math.min(a, b) - 6, y - 6, w + 12, 8, dk(col, 0.35)) + F(pd([[a, y - h], [a + k * w * 0.45, y - h - 4], [a + k * w * 0.45, y - h + 2], [a, y - h + 6]], true), '#e0c890', 0.8), 1.7);
  }
  // tall curved chitin spire, the hive's outer growth
  function hiveSpire(c, x, y, s, col) {
    var T = taper([[x, y], [x + 4 * s, y - 40 * s], [x - 2 * s, y - 80 * s], [x - 14 * s, y - 104 * s]], 22 * s, 3 * s, 6);
    return E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.25) + body(c, T.d, col, L(bands(T, 4, 3), dk(col, 0.35), 1.2 * s) + F(ribbonBand(T, 0.55, 1), dk(col, 0.25), 0.8), 1.6 * s);
  }
  // a low hive mound with a dark ribbed tunnel mouth, ooze pooling out
  function hiveMouth(c, x, y, s) {
    var col = '#b8843a', d = 'M' + pt([x - 42 * s, y]) + 'C' + pt([x - 36 * s, y - 30 * s]) + ' ' + pt([x - 12 * s, y - 42 * s]) + ' ' + pt([x + 4 * s, y - 40 * s]) + 'C' + pt([x + 24 * s, y - 38 * s]) + ' ' + pt([x + 40 * s, y - 24 * s]) + ' ' + pt([x + 44 * s, y]) + 'Z';
    var m = 'M' + pt([x - 16 * s, y]) + 'C' + pt([x - 16 * s, y - 20 * s]) + ' ' + pt([x + 14 * s, y - 22 * s]) + ' ' + pt([x + 16 * s, y]) + 'Z';
    var rib = 'M' + pt([x - 20 * s, y]) + 'C' + pt([x - 20 * s, y - 25 * s]) + ' ' + pt([x + 18 * s, y - 27 * s]) + ' ' + pt([x + 20 * s, y]);
    return E(x, y + 2, 46 * s, 5 * s, '#000', 0, 0.28) + body(c, d, col, F(pd([[x + 6 * s, y - 44 * s], [x + 48 * s, y - 44 * s], [x + 48 * s, y + 4], [x + 14 * s, y + 4]], true), dk(col, 0.25), 0.8) + L('M' + pt([x - 34 * s, y - 14 * s]) + 'Q' + pt([x, y - 30 * s]) + ' ' + pt([x + 36 * s, y - 12 * s]), dk(col, 0.3), 1.2), 1.8) +
      L(rib, OL, 5.4 * s) + L(rib, dk(col, 0.2), 3 * s) + P(m, '#1a1008', 1.4) + C(x - 4 * s, y - 8 * s, 1.4 * s, '#d8ff6a') + C(x + 3 * s, y - 9 * s, 1.4 * s, '#d8ff6a') + slime(c, x, y + 3, 22 * s, 4 * s);
  }
  // back row of columns carrying a broken lintel
  function colonnade(c, x0, x1, y, col) {
    var o = '', n2 = 4, st = (x1 - x0) / (n2 - 1), hs = [50, 50, 30, 50];
    for (var i = 0; i < n2; i++) o += column(c, x0 + i * st, y, 11, hs[i], dk(col, 0.04 * i), i === 2, 1710 + i);
    o += body(c, pd([[x0 - 12, y - 66], [x0 + st * 1.5, y - 66], [x0 + st * 1.38, y - 60], [x0 + st * 1.1, y - 62], [x0 - 12, y - 60]], true), col, L('M' + pt([x0 - 10, y - 63]) + 'L' + pt([x0 + st * 1.2, y - 63]), dk(col, 0.25), 0.9), 1.4);
    return o + body(c, pd([[x1 - 18, y - 66], [x1 + 14, y - 66], [x1 + 14, y - 60], [x1 - 14, y - 60]], true), col, '', 1.4);
  }
  // round carved relief with the eastern crescent, half sunk
  function moonDisc(c, x, y, r, col) {
    var o = body(c, 'M' + pt([x - r, y]) + 'A' + n(r) + ',' + n(r) + ' 0 0,1 ' + pt([x + r, y]) + 'Z', col, F('M' + pt([x + r * 0.2, y - r - 2]) + 'L' + pt([x + r + 2, y - r - 2]) + 'L' + pt([x + r + 2, y + 1]) + 'L' + pt([x + r * 0.2, y + 1]) + 'Z', dk(col, 0.22), 0.8), 1.8);
    o += L('M' + pt([x - r * 0.8, y]) + 'A' + n(r * 0.8) + ',' + n(r * 0.8) + ' 0 0,1 ' + pt([x + r * 0.8, y]), dk(col, 0.3), 1.4);
    return o + crescent(x, y - r * 0.4, r * 0.34, dk(col, 0.35)) + L('M' + pt([x - r * 0.6, y - r * 0.2]) + 'l4,-3 M' + pt([x + r * 0.5, y - r * 0.5]) + 'l3,5', dk(col, 0.4), 1);
  }
  function pennant(c, x, y, h, s, col) {
    var o = limb('M' + pt([x, y]) + 'L' + pt([x, y - h]), '#5a3e24', 2 * s);
    return o + body(c, pd([[x, y - h], [x + 18 * s, y - h + 5 * s], [x, y - h + 10 * s]], true), col, '', 1.2 * s) + C(x, y - h, 1.6 * s, c.cel(GOLD), 0.8 * s);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    gadgetzan: function (c) {
      var o = dSky(c, 318, 34);
      o += farDunes(c, 1101, 118, 20, '#f0d8a0', 50) + heat(c, 104, 122, 1102, 6, 0.35);
      // the town wall across the back, gate in the middle
      o += trollWallG(c);
      o += adobe(c, 196, 142, 54, 34, dk(SST, 0.05), null, 1105);
      o += sandFloor(c, 148, '#e2c088', '#caa266', 1107);
      o += F('M150,150 C200,146 260,146 320,150 L400,242 L80,242 Z', '#d8b47a', 0.6) + ripples(1108, 170, 236, '#b8925a', 10, 120, 360);
      o += waterTower(c, 118, 158, 1.02);
      o += adobe(c, 8, 164, 76, 44, SST, '#c84a2a', 1103) + adobe(c, 302, 162, 90, 50, lt(SST, 0.05), '#2a8a9a', 1104);
      o += bunting(84, 134, 196, 124, 6, ['#e0b43c', '#c84a2a', '#2a8a9a']) + bunting(250, 124, 302, 126, 4, ['#c84a2a', '#e0b43c', '#2a8a9a']);
      o += palm(c, 270, 160, 0.62, -12, PALM, 1106);
      o += bruiser(c, 176, 172, 0.42) + bruiser(c, 350, 176, 0.44, true);
      o += barrel(c, 92, 184, 1, '#7a5a3a') + barrel(c, 106, 190, 0.9, '#6a4a30') + crate(c, 72, 196, 1.1) + crate(c, 244, 178, 0.8, '#b8844a') + sack(c, 262, 182, 0.8);
      o += prickly(c, 24, 232, 0.9) + hornSkull(c, 380, 234, 1) + pebbles(1109, 180, 236, '#b8925a', 14);
      return o + heat(c, 150, 170, 1110, 5, 0.25) + vignette(c, '#fff8e0', '#5a3a14');
    },
    lost_rigger_cove: function (c) {
      var o = dSky(c, 70, 30, '#8ec8e0', '#dcecea', '#f4ecc8');
      o += sea(c, 110, 170, 1201);
      o += headland(c, -6, 96, 150, 48, '#c89058', 1) + headland(c, 300, 406, 150, 58, '#c08652', -1);
      o += ship(c, 196, 150, 0.9);
      o += surf(170, 1202);
      o += sandFloor(c, 172, SAND, SANDD, 1203);
      o += pier(c, 118, 160, 172, 1);
      o += shanty(c, 6, 190, 56, 30, '#9a7048', 1204, '#8a8e8a') + shanty(c, 330, 186, 60, 34, '#8a6440', 1205, '#a86a3a');
      o += palm(c, 74, 188, 0.7, 14, PALM, 1206) + palm(c, 318, 184, 0.58, -16, PALM, 1207);
      o += barrel(c, 300, 200, 1) + barrel(c, 312, 206, 0.9, '#7a4a2a') + crate(c, 76, 214, 1.1) + crate(c, 90, 202, 0.8, '#b8844a');
      o += driftwoodT(c, 180, 226, 40, -0.1) + L('M220,190 q6,-2 12,0 M250,212 q8,-3 16,0', '#b8925a', 1.2);
      o += tufts(c, [[12, 232, 0.8], [392, 236, 0.9]], '#9aa84a');
      return o + vignette(c, '#fff8e0', '#1a3a3a');
    },
    waterspring_field: function (c) {
      var o = dSky(c, 332, 40);
      o += farDunes(c, 1301, 120, 26, '#f2d9a0', 56) + heat(c, 108, 124, 1302, 6, 0.35);
      o += dune(c, 60, 142, 200, 38, '#e8c47a', 0.2) + dune(c, 330, 140, 220, 30, '#e2bc72', 0);
      o += stripeTent(c, 70, 152, 0.9, '#d8c8a0', '#8a2a24') + stripeTent(c, 170, 142, 0.6, '#c8b890', INDIGO);
      o += sandFloor(c, 152, SAND, SANDD, 1303);
      o += spring(c, 252, 170, 40, 10) + rushes(c, 216, 172, 0.8) + rushes(c, 290, 174, 0.9) + rushes(c, 260, 162, 0.6);
      o += palm(c, 300, 166, 0.72, -16, PALM, 1304) + palm(c, 228, 162, 0.56, 12, PALM, 1305);
      o += campfire(c, 132, 190, 0.7) + crate(c, 30, 200, 1) + sack(c, 50, 206, 0.9, '#b89a6a') + sack(c, 16, 214, 0.8);
      o += flagT(c, 114, 168) + pebbles(1306, 190, 236, '#b8925a', 14) + thorns(c, 370, 226, 1) + hornSkull(c, 36, 236, 0.9);
      return o + vignette(c, '#fff8e0', '#5a3a14');
    },
    noxious_lair: function (c) {
      var o = dSky(c, 90, 26, '#d8c88a', '#e8d8a0', '#f0d898');
      o += F('M0,0H400V240H0Z', '#8a6a20', 0.18);
      o += farDunes(c, 1401, 122, 22, '#d8b474', 50);
      o += hiveSpire(c, 250, 132, 0.7, '#a8783a') + hiveSpire(c, 140, 130, 0.55, '#a8783a');
      o += hiveMound(c, 330, 150, 70, 96, '#c08a3a', 1402) + hiveMound(c, 60, 146, 60, 70, '#b8843a', 1403) + hiveMouth(c, 196, 144, 1);
      o += sandFloor(c, 148, '#d4a860', '#a87a3a', 1405);
      o += slime(c, 250, 196, 30, 6) + slime(c, 120, 222, 22, 5) + slime(c, 350, 226, 18, 4);
      o += eggSacs(c, 92, 176, 1) + eggSacs(c, 380, 186, 0.9) + hiveMound(c, 22, 214, 44, 40, '#c8923e', 1406);
      o += bone(210, 230, 20, 0.3, 1) + hornSkull(c, 300, 238, 0.8) + pebbles(1407, 170, 236, '#8a6430', 14);
      o += motes(1408, 24, 0, 400, 20, 200, '#e8ff9a');
      return o + mist(c, 150, 30, '#e8d8a0', 0.25, 1409) + vignette(c, '#fff0c0', '#3a2a08');
    },
    dunemaul_compound: function (c) {
      var o = dSky(c, 60, 30);
      o += farDunes(c, 1501, 120, 24, '#f0d69c', 60) + heat(c, 106, 122, 1502, 6, 0.35);
      o += dune(c, 200, 138, 260, 26, '#e6c078', 0.1);
      o += ribCage(c, 210, 142, 0.9) + hideTent(c, 70, 150, 1.05, HIDE, 1503) + hideTent(c, 340, 144, 0.8, '#8a5a36', 1504);
      o += tusk(c, 150, 150, 0.9) + tusk(c, 268, 148, 0.8, true);
      o += sandFloor(c, 150, '#e0b870', '#c08e48', 1505);
      o += campfire(c, 146, 196, 0.8) + flag(c, 118, 186, 60, 1.1, '#b89066', '#6a4a2a', fistMark);
      o += bone(250, 220, 22, -0.4, 1.1) + bone(300, 200, 16, 0.6, 0.9) + skull(c, 190, 222, 0.9) + hornSkull(c, 372, 230, 1.1) + bone(40, 226, 18, 0.2, 1);
      o += sack(c, 22, 202, 1, '#9a7a4a') + crate(c, 44, 210, 0.9, '#8a6a3a') + pebbles(1506, 180, 236, '#b08050', 12);
      return o + vignette(c, '#fff8e0', '#5a3a14');
    },
    thistleshrub_valley: function (c) {
      var o = dSky(c, 200, 22, '#a4cedc', '#e8eed8', '#f6e6b8');
      // mesa walls closing the valley on both sides
      o += body(c, 'M-4,70 L40,64 L60,76 L96,74 L120,120 L136,152 L-4,160 Z', '#c88a52', F('M80,72 L96,74 L120,120 L136,152 L100,156 C104,120 96,96 80,72 Z', '#9a6436', 0.8) + L('M4,90 L60,92 M10,112 L90,112 M20,132 L110,134', '#9a6436', 1.4, 0.8), 1.8);
      o += body(c, 'M404,60 L360,58 L338,70 L300,72 L282,118 L268,150 L404,158 Z', '#c0824c', F('M404,60 L360,58 L338,70 L350,150 L404,158 Z', '#9a6436', 0.5) + L('M300,94 L396,90 M290,118 L400,116 M280,138 L400,138', '#9a6436', 1.4, 0.8), 1.8);
      o += farDunes(c, 1601, 136, 14, '#eed49a', 50);
      o += cactus(c, 150, 142, 0.8, CACT, [[-1, 0.5, 12], [1, 0.62, 10]]) + cactus(c, 240, 138, 0.62, dk(CACT, 0.05), [[1, 0.5, 11]]);
      o += sandFloor(c, 150, '#e2bc78', '#c0904a', 1602);
      o += cactus(c, 40, 196, 1.45, CACT, [[-1, 0.42, 14], [1, 0.58, 12]]) + cactus(c, 360, 192, 1.3, lt(CACT, 0.04), [[-1, 0.55, 12]]);
      o += prickly(c, 104, 210, 1.1) + prickly(c, 300, 180, 0.8) + thorns(c, 200, 176, 1.2) + thorns(c, 140, 232, 1.3, '#6a4a2e') + thorns(c, 250, 236, 1.1);
      o += cactus(c, 190, 166, 0.5, CACT, [[-1, 0.55, 10]]) + flowers(1603, 170, 236, ['#e0508a', '#f4d040', '#f08a3a'], 16);
      o += hornSkull(c, 280, 214, 0.9) + pebbles(1604, 180, 236, '#a8804a', 12);
      return o + heat(c, 128, 146, 1605, 6, 0.3) + vignette(c, '#fff8e0', '#5a3a14');
    },
    eastmoon_ruins: function (c) {
      var o = dSky(c, 90, 34, '#9ccadc', '#e4ecdc', '#f6e8bc');
      o += C(330, 36, 12, '#f4f4ea', 0, 0.6) + C(334, 34, 11, SKYM, 0, 0.9);
      o += farDunes(c, 1701, 120, 22, '#f0d8a0', 56) + heat(c, 108, 124, 1702, 6, 0.3);
      o += colonnade(c, 196, 318, 132, '#dccaa4') + moonDisc(c, 70, 142, 34, '#d6c29a');
      o += brokenArch(c, 150, 146, 64, 50, '#d8c49c') + column(c, 262, 146, 14, 58, '#d4c098', true, 1703);
      o += stoneHead(c, 344, 152, 0.9) + drift(c, 344, 152, 96, 18, '#e8c47a') + drift(c, 150, 148, 110, 14, '#e8c47a') + drift(c, 70, 144, 90, 16, '#e8c47a');
      o += sandFloor(c, 150, SAND, SANDD, 1704);
      o += column(c, 30, 204, 18, 60, '#d8c49c', true, 1705) + drift(c, 30, 204, 60, 16, SAND) + column(c, 58, 214, 14, 26, '#ccb890', true, 1707) + drift(c, 56, 214, 40, 9, SAND);
      o += body(c, 'M196,214 L252,208 L256,218 L198,224 Z', '#d0bc94', L('M210,212 l0,10 M226,210 l0,10 M240,209 l0,10', dk('#d0bc94', 0.3), 1) + crescent(232, 216, 3, dk('#d0bc94', 0.35)), 1.6) + drift(c, 226, 222, 80, 8, SAND);
      o += R(84, 178, 26, 12, c.cel('#d4c098'), 1.4) + R(112, 184, 18, 8, c.cel('#c8b48c'), 1.3) + thorns(c, 376, 230, 0.9) + pebbles(1706, 180, 236, '#b8925a', 14);
      return o + vignette(c, '#fff8e0', '#5a3a14');
    },
    zul_farrak_gate: function (c) {
      var o = dSky(c, 60, 26, '#a0cadc', '#eaeed8', '#fae8b4');
      o += farDunes(c, 1801, 126, 16, '#f0d69c', 60);
      o += stepTower(c, 70, 128, 70, 100, '#cc9456') + stepTower(c, 330, 128, 70, 100, '#cc9456');
      o += trollWall(c, -4, 150, 138, 56, '#d49a5a') + trollWall(c, 250, 404, 138, 56, '#d49a5a');
      // gatehouse
      o += stoneFace(c, 150, 142, 100, 84, '#d8a060', 9) + crenelsZ(c, 150, 250, 58, '#d8a060');
      o += P(arched(200, 142, 44, 56), '#1e140e', 1.8) + L(arched(200, 142, 50, 60), OL, 1.4) + F(arched(200, 142, 40, 50), '#3a2416', 0.6);
      o += trollFace(c, 200, 76, 0.8) + L('M150,110 L250,110', '#2a8a8a', 2);
      o += pennant(c, 158, 58, 20, 1, '#2a8a8a') + pennant(c, 242, 58, 20, 1, '#b8321e') + pennant(c, 20, 82, 18, 0.9, '#b8321e') + pennant(c, 380, 82, 18, 0.9, '#2a8a8a');
      o += brazier(c, 166, 150, 0.7) + brazier(c, 234, 150, 0.7);
      o += drift(c, 110, 142, 120, 10, '#e8c47a') + drift(c, 300, 142, 130, 12, '#e8c47a');
      o += sandFloor(c, 150, '#e6c07a', '#c4924c', 1802);
      o += F('M176,150 L224,150 L300,242 L100,242 Z', '#dab070', 0.5);
      o += skullSpikeT(c, 120, 196) + skullSpikeT(c, 22, 214) + skullSpikeT(c, 378, 212);
      o += cactus(c, 50, 188, 0.7, CACT, [[1, 0.55, 10]]) + thorns(c, 350, 186, 0.9) + pebbles(1803, 170, 236, '#b8925a', 12) + hornSkull(c, 300, 232, 0.9);
      return o + heat(c, 140, 158, 1804, 6, 0.28) + vignette(c, '#fff8e0', '#5a3a14');
    }
  };
  // gadgetzan's sandstone town wall with a squat gatehouse
  function trollWallG(c) {
    var o = stoneFace(c, -4, 140, 408, 30, '#d6a86a', 8) + crenelsZ(c, -4, 404, 110, '#d6a86a');
    o += stoneFace(c, 250, 140, 40, 52, '#cc9e60', 8) + crenelsZ(c, 250, 290, 88, '#cc9e60') + P(arched(270, 140, 20, 26), '#2a1c14', 1.4);
    return o;
  }
  function crenelsZ(c, x0, x1, y, col) { var o = ''; for (var x = x0; x < x1 - 4; x += 12) o += P('M' + pt([x, y + 1]) + 'L' + pt([x, y - 5]) + 'Q' + pt([x + 3.5, y - 9]) + ' ' + pt([x + 7, y - 5]) + 'L' + pt([x + 7, y + 1]) + 'Z', c.cel(col), 1.3); return o; }
  function driftwoodT(c, x, y, len, ang) {
    var q = dirQ([x, y], ang), col = '#b4aa98';
    return E(x + len / 2, y + 3, len * 0.56, 3, '#000', 0, 0.2) + limb('M' + pt(q(len * 0.3, 0)) + 'L' + pt(q(len * 0.42, -11)), col, 2.2) + limb('M' + pt(q(0, 0)) + 'L' + pt(q(len, 0)), col, 6) + L('M' + pt(q(3, -1.6)) + 'L' + pt(q(len - 2, -1.6)), lt(col, 0.4), 1.1, 0.8);
  }
  function flagT(c, x, y) {
    return flag(c, x, y, 50, 1, '#8a2a24', '#e0b43c', function (fx, fy, s) { return scimMark(fx, fy, s); });
  }
  // the bandits' mark: a crossed pair of curved blades (original)
  function scimMark(x, y, s) {
    var a = 'M' + pt([x - 5 * s, y + 7 * s]) + 'Q' + pt([x - 4 * s, y - 2 * s]) + ' ' + pt([x + 5 * s, y - 7 * s]), b = 'M' + pt([x + 5 * s, y + 7 * s]) + 'Q' + pt([x + 4 * s, y - 2 * s]) + ' ' + pt([x - 5 * s, y - 7 * s]);
    return L(a + b, OL, 3 * s) + L(a + b, '#f0e6c8', 1.6 * s);
  }
  function skullSpikeT(c, x, y) { return E(x, y + 1, 5, 1.6, '#000', 0, 0.3) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 30]), '#6a4a2a', 2.4) + skull(c, x, y - 32, 0.8) + L('M' + pt([x - 4, y - 22]) + 'l8,0', '#2a8a8a', 2); }

  // ============================================================
  //  MOB PIECES (new here)
  // ============================================================
  // veiled desert head (facing left): wrapped turban, a veil over nose and mouth with a tail at the back
  function veilHead(c, x, y, o) {
    var sk = o.skin || '#c89068', tc = o.turban || '#e8d8b0', vc = o.veil || INDIGO, s = '';
    // veil tail hanging behind
    s += body(c, 'M' + pt([x + 6, y + 2]) + 'C' + pt([x + 16, y + 4]) + ' ' + pt([x + 20, y + 14]) + ' ' + pt([x + 22, y + 26]) + 'L' + pt([x + 14, y + 24]) + 'C' + pt([x + 12, y + 16]) + ' ' + pt([x + 8, y + 12]) + ' ' + pt([x + 2, y + 10]) + 'Z', dk(vc, 0.12), '', 1.8);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8), 2);
    if (o.eyeGlow) s += gEye(c, x - 5, y - 2.2, 1.6, o.eyeGlow);
    else s += E(x - 5, y - 2, 2.4, 1.6, '#f4ecd8', 0.8) + C(x - 5.6, y - 2, 1.2, OL);
    s += L('M' + pt([x - 10, y - 5.4]) + 'L' + pt([x - 1, y - 5]), OL, 2);
    // veil across nose and mouth, gathered at the cheek
    var vd = 'M' + pt([x - 14, y + 0.6]) + 'C' + pt([x - 8, y - 0.6]) + ' ' + pt([x + 2, y - 0.4]) + ' ' + pt([x + 11, y - 1]) + 'L' + pt([x + 12, y + 12]) + 'C' + pt([x + 6, y + 18]) + ' ' + pt([x - 4, y + 18]) + ' ' + pt([x - 10, y + 14]) + 'C' + pt([x - 13, y + 10]) + ' ' + pt([x - 14, y + 5]) + ' ' + pt([x - 14, y + 0.6]) + 'Z';
    s += body(c, vd, vc, F(pd([[x + 3, y - 2], [x + 14, y - 2], [x + 14, y + 20], [x + 3, y + 20]], true), dk(vc, 0.3), 0.8) + L('M' + pt([x - 12, y + 6]) + 'Q' + pt([x - 2, y + 8]) + ' ' + pt([x + 8, y + 4]) + 'M' + pt([x - 10, y + 11]) + 'Q' + pt([x, y + 13]) + ' ' + pt([x + 9, y + 9]), dk(vc, 0.3), 1) + (o.veilTrim ? L('M' + pt([x - 13, y + 1.6]) + 'C' + pt([x - 8, y + 0.4]) + ' ' + pt([x + 2, y + 0.6]) + ' ' + pt([x + 10, y]), o.veilTrim, 1.4) : ''), 1.8);
    if (o.helm === 'scorpion') return s + scorpHelm(c, x, y, o);
    // turban: a wrapped dome with a tucked end
    var td = 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 15, y - 16]) + ' ' + pt([x - 4, y - 25]) + ' ' + pt([x + 4, y - 24]) + 'C' + pt([x + 14, y - 23]) + ' ' + pt([x + 17, y - 12]) + ' ' + pt([x + 13, y - 2]) + 'L' + pt([x + 10, y - 4]) + 'C' + pt([x + 2, y - 7]) + ' ' + pt([x - 6, y - 7]) + ' ' + pt([x - 12, y - 4]) + 'Z';
    s += body(c, td, tc, L('M' + pt([x - 13, y - 9]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 8, y - 14]) + ' ' + pt([x + 15, y - 8]) + 'M' + pt([x - 12, y - 15]) + 'C' + pt([x - 2, y - 21]) + ' ' + pt([x + 8, y - 19]) + ' ' + pt([x + 14, y - 14]) + 'M' + pt([x - 10, y - 5]) + 'C' + pt([x - 6, y - 12]) + ' ' + pt([x, y - 18]) + ' ' + pt([x + 6, y - 23]), dk(tc, 0.28), 1.2) +
      F(pd([[x + 5, y - 26], [x + 18, y - 26], [x + 18, y], [x + 7, y]], true), dk(tc, 0.22), 0.8), 2);
    if (o.jewel) s += C(x - 7, y - 11, 2.4, c.cel(o.jewel), 1) + C(x - 7.6, y - 11.6, 0.7, '#fff');
    return s + P('M' + pt([x + 10, y - 16]) + 'C' + pt([x + 16, y - 20]) + ' ' + pt([x + 20, y - 14]) + ' ' + pt([x + 18, y - 8]) + 'L' + pt([x + 13, y - 10]) + 'Z', c.cel(dk(tc, 0.1)), 1.4);
  }
  // bronze helm shaped like a scorpid: pincer brow guards and a segmented tail curling forward over the crown
  function scorpHelm(c, x, y, o) {
    var hc = o.helmCol || '#c8903a', s = '';
    var T = taper([[x + 12, y - 8], [x + 23, y - 12], [x + 26, y - 22], [x + 18, y - 28], [x + 7, y - 27]], 9, 5, 6);
    s += body(c, T.d, hc, L(bands(T, 4, 3), dk(hc, 0.45), 1.3) + F(ribbonBand(T, 0.55, 1), dk(hc, 0.25), 0.7), 1.8);
    var tip = T.s[T.s.length - 1];
    s += P('M' + pt([tip[0] + 2, tip[1] - 3]) + 'C' + pt([tip[0] - 6, tip[1] - 4]) + ' ' + pt([tip[0] - 9, tip[1] + 2]) + ' ' + pt([tip[0] - 8, tip[1] + 8]) + 'C' + pt([tip[0] - 5, tip[1] + 4]) + ' ' + pt([tip[0] - 1, tip[1] + 2]) + ' ' + pt([tip[0] + 2, tip[1] + 3]) + 'Z', c.cel('#e84a2a'), 1.4);
    var hd = 'M' + pt([x - 13, y - 3]) + 'C' + pt([x - 15, y - 18]) + ' ' + pt([x - 2, y - 24]) + ' ' + pt([x + 6, y - 23]) + 'C' + pt([x + 15, y - 21]) + ' ' + pt([x + 17, y - 10]) + ' ' + pt([x + 14, y + 2]) + 'L' + pt([x + 9, y - 2]) + 'C' + pt([x + 2, y - 6]) + ' ' + pt([x - 6, y - 6]) + ' ' + pt([x - 13, y - 3]) + 'Z';
    s += body(c, hd, hc, L('M' + pt([x - 12, y - 10]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 15, y - 10]), dk(hc, 0.45), 1.3) + F(pd([[x + 5, y - 26], [x + 18, y - 26], [x + 18, y + 2], [x + 6, y + 2]], true), dk(hc, 0.3), 0.75) + E(x - 4, y - 18, 4, 1.6, lt(hc, 0.4), 0, 0.7), 2);
    // pincers over the brow
    s += P('M' + pt([x - 10, y - 8]) + 'C' + pt([x - 18, y - 10]) + ' ' + pt([x - 22, y - 4]) + ' ' + pt([x - 20, y + 2]) + 'L' + pt([x - 17, y - 2]) + 'L' + pt([x - 15, y + 1]) + 'C' + pt([x - 15, y - 4]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x - 8, y - 5]) + 'Z', c.cel(dk(hc, 0.05)), 1.5);
    return s + C(x - 3, y - 12, 2.2, c.cel('#e84a2a'), 1) + C(x - 3.6, y - 12.6, 0.6, '#fff');
  }
  function desertHuman(c, o) {
    var t = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) t[k] = o[k];
    t.skin = o.skin || '#c89068'; t.boots = o.boots || '#4a3020'; t.neckCol = o.neckCol || o.veil || INDIGO;
    t.head = function (c, x, y) { return veilHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); };
    t.hx = 58; t.hy = 31;
    return biped(c, t);
  }
  // scimitar: short grip, crossguard, a blade that widens and sweeps back to a clipped point
  function scimitar(c, p, len, ang, col) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-7, 0)) + 'L' + pt(q(4, 0)), '#3a2418', 3.2) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), OL, 4.2) + L('M' + pt(q(4, -5)) + 'L' + pt(q(4, 5)), GOLD, 2.2) + C(q(-8, 0)[0], q(-8, 0)[1], 2, c.cel(GOLD), 1);
    var bl = 'M' + pt(q(5, -1.8)) + 'Q' + pt(q(len * 0.5, -3)) + ' ' + pt(q(len * 0.86, -9)) + 'L' + pt(q(len, -12)) + 'Q' + pt(q(len * 0.9, -2)) + ' ' + pt(q(len * 0.72, 3.6)) + 'Q' + pt(q(len * 0.4, 4.4)) + ' ' + pt(q(5, 2)) + 'Z';
    return o + P(bl, c.cel(col || '#d0d4da'), 1.6) + L('M' + pt(q(8, 1.2)) + 'Q' + pt(q(len * 0.42, 2.6)) + ' ' + pt(q(len * 0.7, 1.6)), '#ffffff', 1, 0.75);
  }
  // loose desert robe skirt drawn over the legs, feet peeking out
  function robeSkirt(c, col, trim, hem, split) {
    hem = hem || 116;
    var s = boot(52, 121, '#4a3020') + boot(74, 121, '#3a2418');
    var d = 'M47,80 L81,80 C85,94 90,104 94,' + hem + ' L34,' + hem + ' C38,104 42,94 47,80 Z';
    s += body(c, d, col, F('M70,78 L98,78 L98,122 L76,122 C78,106 76,92 70,78 Z', dk(col, 0.26), 0.8) + L('M56,90 L48,' + (hem - 2) + ' M64,88 L63,' + (hem - 2) + ' M74,90 L80,' + (hem - 2), dk(col, 0.24), 1.1) +
      (trim ? L('M35,' + (hem - 2.6) + ' L93,' + (hem - 2.6), trim, 3) : '') + (split ? F('M60,96 L68,96 L70,' + hem + ' L58,' + hem + ' Z', split) : ''), 2);
    return s;
  }
  function sash(c, col, knot) {
    return P('M48,78 L80,78 L80,86 L48,86 Z', c.cel(col), 1.8) + (knot ? P('M52,84 L46,100 L52,98 L55,102 L58,85 Z', c.cel(dk(col, 0.1)), 1.4) : '');
  }
  // pirate cutlass: brass basket guard, broad curved blade
  function cutlass(c, p, len, ang, big) {
    var q = dirQ(p, ang), k = big ? 1.3 : 1, o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(4, 0)), '#2a1a12', 3.4 * k);
    o += L('M' + pt(q(5, -5 * k)) + 'Q' + pt(q(-4, -9 * k)) + ' ' + pt(q(-8, -1)), OL, 4.6) + L('M' + pt(q(5, -5 * k)) + 'Q' + pt(q(-4, -9 * k)) + ' ' + pt(q(-8, -1)), '#d8a83a', 2.4) + L('M' + pt(q(4, -6 * k)) + 'L' + pt(q(4, 6 * k)), OL, 4.4) + L('M' + pt(q(4, -6 * k)) + 'L' + pt(q(4, 6 * k)), '#d8a83a', 2.4);
    var bl = 'M' + pt(q(5, -2.4 * k)) + 'Q' + pt(q(len * 0.55, -4 * k)) + ' ' + pt(q(len, -9 * k)) + 'Q' + pt(q(len * 0.95, 1 * k)) + ' ' + pt(q(len * 0.7, 5 * k)) + 'Q' + pt(q(len * 0.36, 5.6 * k)) + ' ' + pt(q(5, 2.6 * k)) + 'Z';
    return o + P(bl, c.cel('#c4c8ce'), 1.7) + L('M' + pt(q(8, -0.6)) + 'Q' + pt(q(len * 0.6, -1.6 * k)) + ' ' + pt(q(len * 0.92, -6.6 * k)), '#ffffff', 1, 0.75) + C(q(-6, 0)[0], q(-6, 0)[1], 2.2 * k, c.cel('#d8a83a'), 1);
  }
  // flared blunderbuss held level (muzzle at mz, pointing along ang)
  function blunderbuss(c, mz, ang) {
    var q = dirQ(mz, ang + PI), o = '';
    o += P(pd([q(30, -3), q(52, -4), q(62, -1), q(64, 8), q(56, 7), q(48, 3), q(30, 3)], true), c.cel('#7a4a28'), 1.8);
    o += P(pd([q(4, -3.4), q(34, -3), q(34, 3), q(4, 3.4)], true), c.cel('#c8943a'), 1.8) + L('M' + pt(q(12, -3.2)) + 'L' + pt(q(12, 3.2)) + 'M' + pt(q(24, -3)) + 'L' + pt(q(24, 3)), '#8a5a1e', 1.6);
    o += P(pd([q(4, -3.4), q(-4, -8), q(-6, -7), q(-6, 7), q(-4, 8), q(4, 3.4)], true), c.cel('#d8a448'), 1.8) + E(q(-5, 0)[0], q(-5, 0)[1], 2.2, 6, '#1a1210', 1);
    o += L('M' + pt(q(36, 4)) + 'q2,5 6,4', OL, 1.8) + P(pd([q(36, -3), q(40, -7), q(43, -3)], true), c.cel('#4a4a50'), 1);
    return o;
  }
  function powderSmoke(c, x, y, s) { var o = ''; [[0, 0, 6], [-7, -3, 5], [-12, 2, 4], [-5, 5, 4]].forEach(function (p) { o += C(x + p[0] * s, y + p[1] * s, p[2] * s, '#e8e4dc', 1, 0.85); }); return C(x, y, 14 * s, glow(c, '#ffc860', 0.5)) + o; }
  function hook(c, p) {
    return R(p[0] - 5, p[1] - 5, 10, 8, c.cel('#4a3020'), 1.8) + L('M' + pt([p[0], p[1] + 3]) + 'L' + pt([p[0], p[1] + 8]) + 'C' + pt([p[0], p[1] + 16]) + ' ' + pt([p[0] - 10, p[1] + 16]) + ' ' + pt([p[0] - 10, p[1] + 9]), OL, 4.6) +
      L('M' + pt([p[0], p[1] + 3]) + 'L' + pt([p[0], p[1] + 8]) + 'C' + pt([p[0], p[1] + 16]) + ' ' + pt([p[0] - 10, p[1] + 16]) + ' ' + pt([p[0] - 10, p[1] + 9]), '#d0d4da', 2.4) + C(p[0] - 10, p[1] + 8.4, 1.2, '#f0f4f8');
  }
  function tricorn(c, x, y, col, trim) {
    col = col || '#1e1a22'; trim = trim || GOLD;
    var d = 'M' + pt([x - 20, y - 6]) + 'C' + pt([x - 12, y - 4]) + ' ' + pt([x - 6, y - 8]) + ' ' + pt([x - 4, y - 14]) + 'C' + pt([x - 2, y - 22]) + ' ' + pt([x + 10, y - 24]) + ' ' + pt([x + 14, y - 16]) + 'C' + pt([x + 18, y - 12]) + ' ' + pt([x + 22, y - 10]) + ' ' + pt([x + 24, y - 4]) +
      'C' + pt([x + 12, y - 4]) + ' ' + pt([x + 4, y - 2]) + ' ' + pt([x - 4, y - 2]) + 'C' + pt([x - 10, y - 2]) + ' ' + pt([x - 16, y - 2]) + ' ' + pt([x - 20, y - 6]) + 'Z';
    return feather(c, x + 10, y - 16, -PI / 2 + 1.3, 22, '#c83a2a', '#f4ecd8') + body(c, d, col, F(pd([[x + 6, y - 26], [x + 26, y - 26], [x + 26, y], [x + 8, y]], true), '#000', 0.3), 2) +
      L('M' + pt([x - 19, y - 6]) + 'C' + pt([x - 12, y - 3.6]) + ' ' + pt([x, y - 3]) + ' ' + pt([x + 23, y - 4.4]), trim, 1.8) + C(x - 3, y - 12, 2.4, c.cel(trim), 1) + L('M' + pt([x - 4, y - 16]) + 'l3,1 M' + pt([x - 4.4, y - 13]) + 'l3,1', '#f4ecd8', 1.2);
  }
  function knitCap(c, x, y, col) {
    return body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 13, y - 19]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 13, y - 6]) + 'L' + pt([x + 20, y - 14]) + 'L' + pt([x + 18, y - 4]) + 'L' + pt([x + 12, y - 2]) + 'Z', col, L('M' + pt([x - 8, y - 12]) + 'l0,6 M' + pt([x - 3, y - 15]) + 'l0,8 M' + pt([x + 2, y - 16]) + 'l0,8 M' + pt([x + 7, y - 14]) + 'l0,7', dk(col, 0.3), 1), 1.8) +
      R(x - 12, y - 8, 25, 5, c.cel(dk(col, 0.15)), 1.4);
  }
  function earring(x, y) { return L(ellD(x, y, 1.8, 2.2), OL, 2.4) + L(ellD(x, y, 1.8, 2.2), GOLD, 1.2); }
  // ---- silithid (facing left) ----
  function bugLeg(c, pts, col, w) { var e = pts[pts.length - 1]; return limb(pd(pts), dk(col, 0.25), w || 2.6) + L('M' + pt(e) + 'l-3,1', OL, 2) ; }
  function silithidStinger(c) {
    var col = '#d8a038', dcol = '#6a3e14', wing = '#f4f0dc', s = shadow(c, 62, 22);
    // far wings, far legs
    s += G(P('M68,52 C74,24 94,6 110,10 C112,24 96,44 72,58 Z', wing, 1.4), '', 0.55) + L('M72,54 C84,36 96,20 106,14', dk(wing, 0.4), 0.9, 0.7);
    s += bugLeg(c, [[70, 74], [80, 92], [78, 106]], dcol, 2.4) + bugLeg(c, [[60, 74], [66, 94], [60, 108]], dcol, 2.4);
    // abdomen curling under, stinger forward
    var A = taper([[74, 62], [90, 68], [100, 84], [96, 100], [82, 108], [68, 106]], 30, 8, 6);
    s += body(c, A.d, col, L(bands(A, 4, 4), dcol, 3) + F(ribbonBand(A, 0.55, 1), dk(col, 0.28), 0.8) + L(along(A, 0.2), lt(col, 0.35), 1.4, 0.8), 2.2);
    var e = A.s[A.s.length - 1];
    s += P(pd([[e[0] + 2, e[1] - 3], [e[0] - 16, e[1] - 4], [e[0] + 2, e[1] + 3]], true), c.cel('#2a1a0c'), 1.6);
    // thorax + near legs
    s += body(c, ellD(62, 64, 15, 13), col, F('M52,68 C60,80 74,78 78,66 L80,82 L50,82 Z', dk(col, 0.3), 0.8) + L('M50,58 Q62,52 74,58', dcol, 2), 2.2);
    s += bugLeg(c, [[56, 72], [46, 86], [44, 100]], '#8a5a24', 2.4) + bugLeg(c, [[64, 74], [60, 92], [64, 104]], '#8a5a24', 2.4) + bugLeg(c, [[72, 72], [84, 88], [88, 100]], '#8a5a24', 2.4);
    // near wings
    s += G(P('M64,50 C62,20 72,0 86,0 C94,12 84,36 68,56 Z', wing, 1.5), '', 0.7) + L('M66,52 C70,32 76,16 84,4 M68,40 L78,34', dk(wing, 0.45), 0.9, 0.8);
    // head: big compound eye, jagged mandibles, antennae
    s += limb('M38,48 C32,34 26,26 16,22', dcol, 1.6) + limb('M44,46 C42,32 40,22 30,14', dcol, 1.6);
    s += body(c, ellD(40, 60, 13, 11), col, F('M42,48 L56,48 L56,74 L44,74 Z', dk(col, 0.3), 0.8), 2.2);
    s += E(38, 56, 6, 5, c.cel('#3a1a0a'), 1.4) + C(36, 54, 1.4, '#ffd070') + C(39, 57.4, 0.8, '#ffd070', 0, 0.8);
    s += P('M32,64 C22,64 18,72 22,78 L25,73 L28,76 C28,70 32,68 36,68 Z', c.cel(dcol), 1.5) + P('M36,68 C30,72 30,80 34,84 L36,79 L39,80 C38,76 40,72 42,70 Z', c.cel(dk(dcol, 0.1)), 1.4);
    return G(s, at(1.02, 64, 122));
  }
  function silithidWorker(c) {
    var col = '#b8843a', dcol = '#5a3a16', s = shadow(c, 64, 40);
    // far legs
    s += bugLeg(c, [[84, 96], [100, 104], [106, 120]], dk(col, 0.2), 3) + bugLeg(c, [[66, 98], [74, 108], [72, 121]], dk(col, 0.2), 3) + bugLeg(c, [[50, 98], [46, 110], [38, 121]], dk(col, 0.2), 3);
    // domed carapace with a centre split and ridge spikes
    var sh = 'M30,96 C30,68 54,52 80,54 C104,56 118,74 116,98 C100,106 50,106 30,96 Z';
    var sp = '';
    [[46, 64], [60, 57], [76, 55], [92, 58], [106, 67]].forEach(function (p, i) { sp += pd([[p[0] - 4, p[1] + 2], [p[0] + (i - 2) * 1.5, p[1] - 8], [p[0] + 4, p[1] + 2]], true); });
    s += P(sp, c.cel(dk(col, 0.1)), 1.4);
    s += body(c, sh, col, L('M36,90 C50,70 80,62 112,78', dcol, 2.2) + L('M44,98 C56,86 80,80 110,90', dk(col, 0.3), 1.2) + F('M78,50 L122,50 L122,108 L90,108 C98,90 94,68 78,50 Z', dk(col, 0.3), 0.8) +
      E(62, 70, 10, 4, lt(col, 0.35), 0, 0.6) + C(90, 70, 2.6, dcol) + C(74, 82, 2.2, dcol) + C(100, 88, 2, dcol), 2.4);
    s += P('M30,96 C50,108 100,108 116,98 L112,104 C96,112 52,112 34,104 Z', c.cel(dk(col, 0.35)), 1.8);
    // head with a pair of big curved mandibles
    s += body(c, ellD(30, 94, 14, 11), dk(col, 0.1), F('M32,84 L46,84 L46,106 L34,106 Z', dk(col, 0.35), 0.8), 2.2);
    s += E(24, 90, 3.4, 3, c.cel('#2a140a'), 1.2) + C(23, 89, 1, '#ffd070');
    s += P('M20,98 C10,94 4,100 6,108 C10,104 14,104 16,106 L14,102 C18,102 20,104 22,104 Z', c.cel('#e8d8a8'), 1.6) + P('M24,104 C16,106 12,114 16,120 C18,114 22,113 25,114 L23,110 C26,110 28,110 30,108 Z', c.cel('#d8c898'), 1.5);
    s += limb('M22,84 C16,74 10,70 4,70', dcol, 1.4) + limb('M28,84 C26,74 22,66 14,62', dcol, 1.4);
    // near legs
    s += bugLeg(c, [[46, 102], [36, 110], [28, 121]], col, 3.6) + bugLeg(c, [[66, 104], [62, 114], [58, 121]], col, 3.6) + bugLeg(c, [[92, 102], [104, 110], [96, 121]], col, 3.6);
    return s;
  }
  // ---- Sandbrute ogre (facing left; body rig after art_arathi.js, head new here) ----
  function dmHead(c, x, y, o) {
    var sk = o.skin, s = '';
    if (o.knot) s += limb('M' + pt([x + 4, y - 20]) + 'Q' + pt([x + 14, y - 30]) + ' ' + pt([x + 20, y - 18]), o.hair || '#3a2414', 4) + C(x + 4, y - 20, 4.4, c.cel(o.hair || '#3a2414'), 1.5);
    s += E(x + 13, y + 2, 4, 5.4, c.cel(sk), 1.8) + L(ellD(x + 14, y + 8, 1.8, 2.4), OL, 2.4) + L(ellD(x + 14, y + 8, 1.8, 2.4), BONE, 1.2);
    var d = 'M' + pt([x - 12, y - 10]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 14, y - 8]) + 'L' + pt([x + 15, y + 8]) + 'C' + pt([x + 14, y + 18]) + ' ' + pt([x + 2, y + 24]) + ' ' + pt([x - 12, y + 23]) + 'C' + pt([x - 20, y + 22]) + ' ' + pt([x - 22, y + 14]) + ' ' + pt([x - 20, y + 8]) + 'L' + pt([x - 14, y + 2]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 4, y - 25], [x + 18, y - 25], [x + 18, y + 25], [x + 2, y + 25]], true), dk(sk, 0.24), 0.8) + E(x - 3, y - 16, 5, 2.2, lt(sk, 0.3), 0, 0.6) +
      (o.paint ? L('M' + pt([x - 15, y - 1]) + 'L' + pt([x - 5, y + 1]) + 'M' + pt([x - 13, y + 5]) + 'L' + pt([x - 5, y + 6]), o.paint, 2.2) + L('M' + pt([x + 2, y - 20]) + 'L' + pt([x + 2, y - 10]), o.paint, 2.4) : ''), 2.2);
    // heavy single brow ridge
    s += P('M' + pt([x - 15, y - 3]) + 'C' + pt([x - 12, y - 9]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 4, y - 6]) + 'L' + pt([x + 3, y - 3]) + 'C' + pt([x - 2, y - 5.5]) + ' ' + pt([x - 10, y - 5]) + ' ' + pt([x - 15, y - 1]) + 'Z', c.cel(dk(sk, 0.14)), 1.3);
    s += (o.glow ? glowEye(c, x - 9, y - 1, 1.7, o.eye) + glowEye(c, x - 2, y - 1.4, 1.5, o.eye) : C(x - 9, y - 1, 1.8, OL) + C(x - 2, y - 1.4, 1.5, OL) + C(x - 9.5, y - 1.6, 0.5, '#fff'));
    // broad flat nose with a bone ring
    s += P('M' + pt([x - 13, y]) + 'C' + pt([x - 21, y + 1]) + ' ' + pt([x - 23, y + 8]) + ' ' + pt([x - 17, y + 9]) + 'C' + pt([x - 14, y + 9]) + ' ' + pt([x - 11, y + 7]) + ' ' + pt([x - 11, y + 3]) + 'Z', c.cel(dk(sk, 0.08)), 1.5) + L(ellD(x - 18, y + 11, 2.2, 1.8), OL, 2.4) + L(ellD(x - 18, y + 11, 2.2, 1.8), BONE, 1.2);
    // underbite with two big tusks
    s += P('M' + pt([x - 21, y + 12]) + 'Q' + pt([x - 8, y + 17]) + ' ' + pt([x + 5, y + 12]) + 'L' + pt([x + 3, y + 17]) + 'Q' + pt([x - 8, y + 21]) + ' ' + pt([x - 20, y + 16]) + 'Z', '#3a1a14', 1.4);
    s += P(pd([[x - 19, y + 16], [x - 23, y + 3], [x - 14, y + 14]], true), c.cel(BONE), 1.3) + P(pd([[x - 2, y + 15], [x - 1, y + 3], [x + 3, y + 14]], true), c.cel(BONE), 1.3);
    return s;
  }
  function bigFist(c, p, skin, r) { r = r || 8; return C(p[0], p[1], r, c.cel(skin), 2.2) + L('M' + pt([p[0] - r * 0.7, p[1] - r * 0.3]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1) + ' M' + pt([p[0] - r * 0.75, p[1] + r * 0.2]) + 'l' + n(r * 0.5) + ',' + n(r * 0.1), dk(skin, 0.4), 1.2); }
  function dmOgre(c, o) {
    var sk = o.skin;
    return biped(c, {
      skin: sk, shirt: sk, pants: o.pants || '#7a5a3a', sleeve: sk, glove: sk, boots: o.boots || '#4a3424', legW: 15, armW: 14, hipY: 96, shadowR: o.shadowR || 46, neck: false, belt: o.belt || '#5a3a22', buckle: o.buckle || BONE,
      torsoD: 'M28,54 C30,34 94,30 102,52 L104,82 L96,98 L34,98 L26,82 Z',
      chest: function (c) { return F('M30,72 C40,92 90,94 102,74 L106,100 L24,100 Z', lt(sk, 0.14), 0.45) + L('M58,70 Q66,74 74,70', dk(sk, 0.3), 1.3) + (o.chest ? o.chest(c) : ''); },
      front: o.front, pads: o.pads, back: o.back, shins: o.shins,
      head: o.head || function (c, x, y) { return dmHead(c, x, y, o); }, hx: 46, hy: 28,
      near: o.near, far: o.far || [[94, 58], [106, 74], [104, 90]], wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      nearHand: function (c, p) { return bigFist(c, p, sk, 8.5); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 8); },
      top: o.top, tf: o.tf
    });
  }
  // giant bleached thigh-bone club
  function boneClub(c, p, len, ang) {
    var q = dirQ(p, ang), e = q(len, 0), b = q(-8, 0), o = '';
    var T = taper([q(-6, 0), q(len * 0.5, 0), q(len - 6, 0)], 8, 11, 4);
    o += body(c, T.d, BONE, F(ribbonBand(T, 0.6, 1), dk(BONE, 0.2), 0.8) + L('M' + pt(q(len * 0.3, -1)) + 'l6,1', dk(BONE, 0.35), 1), 2);
    o += C(q(len - 2, -6)[0], q(len - 2, -6)[1], 8, c.cel(BONE), 2) + C(q(len - 2, 6)[0], q(len - 2, 6)[1], 8, c.cel(dk(BONE, 0.06)), 2);
    o += C(b[0], b[1], 5, c.cel(dk(BONE, 0.08)), 1.8) + L('M' + pt(q(len * 0.55, -6)) + 'l4,-2 M' + pt(q(len * 0.7, 6)) + 'l4,2', OL, 1.8);
    return limb('M' + pt(q(len * 0.12, -6)) + 'L' + pt(q(len * 0.12, 6)), '#6a3a1e', 3) + o;
  }
  function sunStaff(c, bot, top) {
    var d = 'M' + pt(bot) + 'L' + pt(top), x = top[0], y = top[1], rays = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4; rays += pd([[x + Math.cos(a - 0.2) * 7, y + Math.sin(a - 0.2) * 7], [x + Math.cos(a) * 13, y + Math.sin(a) * 13], [x + Math.cos(a + 0.2) * 7, y + Math.sin(a + 0.2) * 7]], true); }
    return limb(d, '#6a4a2a', 3.6) + L(d, '#9a7448', 1, 0.6) + C(x, y, 26, glow(c, FIRE, 0.55)) + P(rays, c.cel(GOLD), 1) + C(x, y, 7, c.cel('#f0c850'), 1.6) + C(x, y, 3, '#fff4c8');
  }
  function fireOrb(c, x, y, r) {
    return C(x, y, r * 3.6, glow(c, FIRE, 0.7)) + flame(c, x, y + r * 0.9, r * 0.14, '#ff6a20', '#ffd84a') + C(x, y, r * 0.8, c.rg([[0, '#fffbe0'], [0.5, '#ffd84a'], [1, '#ff8a2a']]), 1.2);
  }
  // ---- thistleshrub (walking cactus) ----
  function thistleshrub(c) {
    var col = '#4f9a6a', dcol = '#2e6a48', s = shadow(c, 64, 34), spD = '';
    // root feet
    var rt = 'M50,104 C44,112 36,116 28,121 M56,106 C54,114 50,118 46,122 M74,106 C78,114 84,118 92,121 M68,108 C68,114 70,118 72,122';
    s += L(rt, OL, 7) + L(rt, '#7a5a34', 4) + L('M34,119 l-6,1 M88,119 l6,1', OL, 2.4);
    // far arm: down and back
    var FA = taper([[80, 70], [96, 72], [100, 86], [98, 96]], 12, 9, 5);
    s += body(c, FA.d, dk(col, 0.12), L(along(FA, 0.5), dcol, 1) + F(ribbonBand(FA, 0.6, 1), dk(col, 0.3), 0.7), 2);
    // main barrel body
    var bd = 'M42,106 C34,92 34,56 44,42 C50,34 78,34 84,42 C94,56 94,92 86,106 C74,112 54,112 42,106 Z';
    var ribs = 'M50,108 C44,90 44,60 52,40 M64,110 C62,90 62,58 64,36 M78,108 C84,90 84,60 76,40';
    for (var i = 0; i < 9; i++) { var yy = 44 + i * 7.6; spD += 'M' + pt([50 - (i % 2) * 2, yy]) + 'l-4,-2 M' + pt([64, yy + 3]) + 'l-2,-4 M' + pt([79 + (i % 2) * 2, yy]) + 'l4,-2'; }
    s += body(c, bd, col, L(ribs, dcol, 1.6) + F('M70,34 L100,34 L100,114 L80,114 C88,92 88,60 70,34 Z', dk(col, 0.28), 0.8) + F('M40,60 C40,50 44,44 48,42 L50,60 Z', lt(col, 0.25), 0.7), 2.4);
    s += L(spD, OL, 2.2) + L(spD, '#f4ecc8', 1);
    // face: hollow eyes glowing green, a jagged mouth split
    s += P('M40,60 L52,56 L52,62 L42,64 Z', '#10221a', 1) + P('M56,56 L64,56 L63,62 L56,62 Z', '#10221a', 1) + gEye(c, 46, 60, 1.8, '#b8ff5a') + gEye(c, 59.6, 59, 1.6, '#b8ff5a');
    s += P('M40,74 L44,71 L47,75 L51,71 L54,75 L58,72 L60,76 L56,82 L44,82 Z', '#10221a', 1.3);
    // blossom crown
    [[54, 36, '#e0508a'], [66, 32, '#f06aa0'], [76, 38, '#e0508a']].forEach(function (f) {
      var pet = ''; for (var k = 0; k < 5; k++) { var a = -PI / 2 + k * 2 * PI / 5; pet += ellD(f[0] + Math.cos(a) * 3.6, f[1] + Math.sin(a) * 3.6, 3, 3); }
      s += P(pet, f[2], 1.1) + C(f[0], f[1], 2, '#ffd84a', 0.8);
    });
    // near arm raised, root magic at the hand
    var NA = taper([[46, 70], [30, 72], [24, 60], [24, 44]], 13, 10, 5), tp = NA.s[NA.s.length - 1];
    s += body(c, NA.d, col, L(along(NA, 0.5), dcol, 1.1) + F(ribbonBand(NA, 0.62, 1), dk(col, 0.25), 0.7), 2.1);
    var sp2 = ''; for (var j = 1; j < NA.s.length - 1; j += 2) sp2 += 'M' + pt(NA.a[j]) + 'l-3,2 M' + pt(NA.b[j]) + 'l3,-2';
    s += L(sp2, OL, 2) + L(sp2, '#f4ecc8', 0.9);
    var vine = 'M' + pt([tp[0], tp[1] - 4]) + 'C' + pt([tp[0] - 10, tp[1] - 14]) + ' ' + pt([tp[0] + 8, tp[1] - 22]) + ' ' + pt([tp[0] - 4, tp[1] - 30]) + 'M' + pt([tp[0] + 2, tp[1] - 4]) + 'C' + pt([tp[0] + 12, tp[1] - 10]) + ' ' + pt([tp[0] + 6, tp[1] - 20]) + ' ' + pt([tp[0] + 14, tp[1] - 26]);
    s += C(tp[0], tp[1] - 12, 22, glow(c, '#9aff5a', 0.6)) + L(vine, OL, 3.6) + L(vine, '#8ae05a', 1.8) + C(tp[0] - 4, tp[1] - 30, 1.8, '#e8ffb0') + C(tp[0] + 14, tp[1] - 26, 1.6, '#e8ffb0');
    return s;
  }
  // ---- dunestalker scorpid (facing left) ----
  function scorpLeg(pts, col, w) { return limb(pd(pts), col, w); }
  function dunestalker(c) {
    var col = '#6a4424', band = '#e0aa44', dcol = dk(col, 0.35), s = shadow(c, 64, 48);
    // far legs
    [[[70, 96], [82, 90], [92, 116]], [[80, 96], [96, 92], [106, 116]], [[60, 98], [66, 92], [72, 118]], [[52, 98], [52, 92], [56, 118]]].forEach(function (lg) { s += scorpLeg(lg, dk(col, 0.25), 3.4); });
    // tail: from the back, arching high over the body, stinger pointing forward-down
    var T = taper([[94, 90], [108, 80], [114, 58], [106, 38], [90, 28], [76, 32]], 22, 10, 6);
    s += body(c, T.d, col, L(bands(T, 5, 4), band, 2.6) + F(ribbonBand(T, 0.6, 1), dcol, 0.7) + L(along(T, 0.25), lt(col, 0.3), 1.4, 0.8), 2.2);
    var e = T.s[T.s.length - 1];
    s += C(e[0] - 9, e[1] + 9, 7, glow(c, '#ffd040', 0.6)) + P('M' + pt([e[0] + 3, e[1] - 6]) + 'C' + pt([e[0] - 8, e[1] - 8]) + ' ' + pt([e[0] - 12, e[1]]) + ' ' + pt([e[0] - 10, e[1] + 10]) + 'C' + pt([e[0] - 6, e[1] + 4]) + ' ' + pt([e[0] - 2, e[1] + 3]) + ' ' + pt([e[0] + 3, e[1] + 5]) + 'Z', c.cel('#e8b848'), 1.8);
    // body segments
    var bd = 'M28,94 C30,80 48,72 66,74 C86,76 102,82 106,94 C102,106 86,110 66,110 C46,110 30,106 28,94 Z', seg = '';
    for (var i = 0; i < 5; i++) { var x = 46 + i * 12; seg += 'M' + pt([x, 75 + Math.abs(i - 2)]) + 'Q' + pt([x + 3, 92]) + ' ' + pt([x, 109]); }
    s += body(c, bd, col, L(seg, band, 2.4) + L(seg, dcol, 0.8) + F('M26,98 C40,114 90,114 108,98 L108,116 L24,116 Z', dcol, 0.8) + E(58, 81, 13, 3, lt(col, 0.3), 0, 0.7), 2.4);
    // near legs, low and splayed
    [[[48, 104], [38, 100], [28, 120]], [[60, 106], [54, 102], [46, 121]], [[74, 106], [78, 100], [76, 121]], [[88, 104], [98, 98], [102, 120]]].forEach(function (lg) { s += scorpLeg(lg, col, 4.2) + L(pd([lg[1], lg[2]]), band, 1.2, 0.7); });
    // head + eyes
    s += body(c, ellD(30, 92, 12, 9), dk(col, 0.1), F('M30,84 L44,84 L44,102 L32,102 Z', dcol, 0.7), 2.2) + C(26, 87, 1.8, '#ffb030', 1) + C(31, 86, 1.6, '#ffb030', 1);
    // big pincers forward
    var claw = function (sx, sy, ex, ey, k) {
      var arm = 'M' + pt([sx, sy]) + 'Q' + pt([(sx + ex) / 2 + 2, sy + 8 * k]) + ' ' + pt([ex + 8, ey]);
      var cl = 'M' + pt([ex + 10, ey - 7]) + 'C' + pt([ex, ey - 12]) + ' ' + pt([ex - 12, ey - 8]) + ' ' + pt([ex - 16, ey - 2]) + 'C' + pt([ex - 8, ey - 4]) + ' ' + pt([ex - 4, ey - 3]) + ' ' + pt([ex, ey - 1]) + 'L' + pt([ex - 12, ey + 4]) + 'C' + pt([ex - 6, ey + 8]) + ' ' + pt([ex + 4, ey + 8]) + ' ' + pt([ex + 10, ey + 6]) + 'Z';
      return limb(arm, k > 0 ? col : dk(col, 0.2), 6) + body(c, cl, k > 0 ? col : dk(col, 0.15), L('M' + pt([ex + 6, ey - 6]) + 'Q' + pt([ex - 2, ey - 9]) + ' ' + pt([ex - 10, ey - 5]), band, 1.6) + F('M' + pt([ex - 16, ey + 1]) + 'L' + pt([ex + 12, ey + 1]) + 'L' + pt([ex + 12, ey + 10]) + 'L' + pt([ex - 16, ey + 10]) + 'Z', dcol, 0.7), 2);
    };
    s += claw(38, 90, 22, 76, -1) + claw(34, 98, 20, 104, 1);
    return G(s, at(1.02, 64, 122));
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var SEA = '#2a4a6a';
  var MOBS = {
    wastewander_bandit: function (c) {
      var rb = '#d8c49a', sk = '#c89068';
      return desertHuman(c, {
        skin: sk, turban: '#e8dcb8', veil: INDIGO, shirt: rb, sleeve: rb, forearm: '#c8b48a', glove: '#6a4a2a', pants: '#b09a70', boots: '#5a3a22',
        chest: function (c) { return L('M52,48 L62,64 L74,48', dk(rb, 0.35), 1.4) + L('M80,50 L50,84', OL, 5) + L('M80,50 L50,84', '#7a4a28', 3) + R(60, 64, 6, 6, c.cel(GOLD), 1); },
        front: function (c) { return sash(c, INDIGO, true) + body(c, 'M46,84 L82,84 L86,106 L42,106 Z', '#b09a70', L('M56,88 L52,104 M70,88 L74,104', dk('#b09a70', 0.3), 1), 1.8); },
        shins: function (c) { return L('M47,110 L58,110 M66,110 L78,110', '#7a5a3a', 3.2); },
        near: [[48, 54], [38, 44], [30, 32]], wNear: function (c, p) { return scimitar(c, p, 34, -PI / 2 - 0.5); },
        far: [[80, 54], [88, 68], [86, 82]], wFar: function (c, p) { return P(pd([[p[0] - 1, p[1]], [p[0] + 2, p[1] + 14], [p[0] + 4, p[1]]], true), c.cel('#c8ccd2'), 1.2); }
      });
    },
    wastewander_shadow_mage: function (c) {
      var rb = '#4a2a5e', sk = '#b8805a';
      return desertHuman(c, {
        skin: sk, turban: '#3a2448', veil: '#1e1426', veilTrim: GOLD, eyeGlow: '#d890ff', jewel: '#b060ff', shirt: rb, sleeve: rb, forearm: rb, glove: sk, noLegs: true,
        torsoD: 'M48,50 C54,45 74,45 80,50 L78,70 L77,88 L51,88 L50,70 Z',
        back: function (c) { return C(64, 64, 58, glow(c, VIOLET, 0.3)); },
        chest: function (c) { return F('M58,48 L70,48 L68,86 L60,86 Z', '#2a1834') + L('M58,48 L60,86 M70,48 L68,86', GOLD, 1.3) + C(64, 58, 2, c.cel(GOLD), 0.8); },
        front: function (c) { return robeSkirt(c, rb, GOLD, 116, '#2a1834') + sash(c, '#c8a040', false); },
        pads: function (c) { return P('M42,56 C42,46 54,44 58,48 L54,60 Z', c.cel(dk(rb, 0.1)), 1.5) + P('M86,56 C86,46 74,44 70,48 L74,60 Z', c.cel(dk(rb, 0.2)), 1.5); },
        near: [[48, 56], [36, 48], [28, 38]], wNearFront: function (c, p) { return shadowSwirl(c, [p[0] - 6, p[1] - 12], 1, VIOLET); },
        far: [[80, 56], [90, 68], [92, 80]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 3, 121]) + 'L' + pt([p[0] - 3, p[1] - 48]); return limb(d, '#2a1e24', 3.2) + L(d, '#5a4a4a', 1, 0.6) + P(pd([[p[0] - 3, p[1] - 60], [p[0] + 3, p[1] - 50], [p[0] - 3, p[1] - 44], [p[0] - 9, p[1] - 50]], true), c.cel('#8a40d0'), 1.4) + C(p[0] - 3, p[1] - 52, 12, glow(c, VIOLET, 0.6)); }
      });
    },
    southsea_pirate: function (c) {
      var sk = '#a86e48', sh = '#ece0c4', vest = SEA;
      return human(c, {
        skin: sk, hair: '#1e1612', hat: 'bandana', hatCol: TEAL, stubble: '#3a2a1e', shirt: sh, sleeve: sh, forearm: sk, pants: '#5a4030', boots: '#2a1c14', glove: sk,
        headX: function (c, x, y) { return earring(x + 7, y + 6); },
        chest: function (c) { return body(c, 'M46,50 L56,48 L58,88 L48,88 Z', vest, '', 1.6) + body(c, 'M72,48 L82,50 L80,88 L70,88 Z', dk(vest, 0.15), '', 1.6) + L('M58,50 L62,58 L66,50', dk(sh, 0.3), 1.2) + C(51, 62, 1.2, GOLD) + C(51, 72, 1.2, GOLD); },
        front: function (c) { return P('M48,80 L80,80 L80,88 L48,88 Z', c.cel('#e0a830'), 1.8) + P('M74,84 L82,104 L77,102 L74,106 L70,86 Z', c.cel('#c8901e'), 1.4); },
        shins: function (c) { return L('M47,106 L58,106 M66,106 L78,106', '#2a1c14', 3.4); },
        near: [[48, 54], [38, 44], [30, 34]], wNear: function (c, p) { return cutlass(c, p, 34, -PI / 2 - 0.55); },
        far: [[80, 54], [90, 66], [88, 80]]
      });
    },
    southsea_cannoneer: function (c) {
      var sk = '#d49a70', sh = '#7a8a9a', jer = '#6a4a2e';
      return human(c, {
        skin: sk, hair: '#6a3a1e', tache: '#6a3a1e', beard: '#6a3a1e', shirt: sh, sleeve: sh, forearm: sh, pants: '#4a3a30', boots: '#2a1c14', glove: '#5a3a22', legW: 11, shadowR: 36,
        headX: function (c, x, y) { return knitCap(c, x, y, '#c85a24') + earring(x + 7, y + 6); },
        torsoD: 'M44,50 C50,44 78,44 84,50 L84,72 L80,90 L48,90 L44,72 Z',
        chest: function (c) { return body(c, 'M46,52 C52,48 76,48 82,52 L80,88 L48,88 Z', jer, L('M64,52 L64,88', dk(jer, 0.4), 1.2) + C(60, 60, 1.2, '#c8c4bc') + C(60, 70, 1.2, '#c8c4bc') + C(60, 80, 1.2, '#c8c4bc'), 1.6) + L('M50,50 L80,86', OL, 5) + L('M50,50 L80,86', '#3a2a1e', 3) + [0, 1, 2, 3].map(function (i) { return C(54 + i * 7, 55 + i * 8.4, 1.8, '#2a2a30', 0.6); }).join(''); },
        front: function (c) { return P('M48,82 L80,82 L80,90 L48,90 Z', c.cel('#3a2a1e'), 1.8) + R(60, 81, 7, 9, '#c8c4bc', 1.4) + P('M76,88 C86,86 92,92 90,102 L86,101 C86,96 82,93 76,93 Z', c.cel('#c8a878'), 1.3) + L('M88,100 L91,103', OL, 3); },
        near: [[48, 56], [42, 66], [36, 67]], far: [[80, 56], [78, 70], [66, 73]],
        wNear: function (c, p) { return blunderbuss(c, [18, 64], PI - 0.06) + powderSmoke(c, 11, 61, 0.55); },
        tf: at(1.04, 64, 122)
      });
    },
    centipaar_stinger: function (c) { return silithidStinger(c); },
    centipaar_worker: function (c) { return silithidWorker(c); },
    dunemaul_brute: function (c) {
      var sk = '#d8b068';
      return dmOgre(c, {
        skin: sk, pants: '#8a5a34', paint: '#b8321e', knot: true, hair: '#4a2a14',
        chest: function (c) { return L('M40,48 Q64,62 90,48', OL, 3) + L('M40,48 Q64,62 90,48', '#6a4a2a', 1.4) + [48, 56, 64, 72, 80].map(function (x, i) { return P(pd([[x - 2, 52 + (i === 2 ? 3 : Math.abs(i - 2))], [x, 62 + (i === 2 ? 4 : 1)], [x + 2, 52 + (i === 2 ? 3 : Math.abs(i - 2))]], true), BONE, 0.9); }).join('') + L('M70,66 L78,80 M74,64 L84,76', '#b8321e', 2.4, 0.9); },
        front: function (c) { return body(c, 'M40,94 L80,94 L84,114' + rag(84, 38, 114, 7, 21) + 'Z', HIDE, F(shag(62, 104, 6, 4, 5, 0.3, 3), dk(HIDE, 0.3), 0.8) + L('M42,98 L80,98', dk(HIDE, 0.4), 1.2), 1.8); },
        pads: function (c) { return P(pd([[28, 44], [22, 32], [34, 42]], true) + pd([[38, 40], [36, 27], [44, 39]], true), c.cel(BONE), 1.2) + body(c, 'M20,58 C18,40 44,34 50,48 L46,60 L28,64 Z', '#8a5a36', L('M24,52 C30,44 40,42 46,46', dk('#8a5a36', 0.4), 1.2) + F(shag(34, 52, 5, 3, 5, 0.3, 7), '#6a4024', 0.8), 1.8); },
        near: [[36, 56], [24, 64], [22, 54]], wNear: function (c, p) { return boneClub(c, p, 44, -PI / 2 - 0.25); }
      });
    },
    dunemaul_ogre_mage: function (c) {
      var sk = '#d0a868', rb = '#a8401e';
      return dmOgre(c, {
        skin: sk, pants: '#6a2a14', eye: '#ffd060', glow: true,
        head: function (c, x, y) { return G(dmHead(c, x + 22, y - 2, { skin: dk(sk, 0.1), eye: '#ffd060', glow: true, knot: true, hair: '#4a2a14' }), at(0.86, x + 22, y + 14)) + dmHead(c, x - 4, y + 2, { skin: sk, eye: '#ffd060', glow: true, paint: '#f0e0b0' }); },
        chest: function (c) {
          var st = ''; for (var i = 0; i < 4; i++) st += 'M' + pt([36 + i * 18, 56]) + 'L' + pt([30 + i * 18, 96]);
          return body(c, 'M30,56 C40,50 90,50 100,56 L104,96 L28,96 Z', rb, L(st, '#e0b43c', 2.4) + F('M70,52 L106,52 L106,98 L76,98 Z', dk(rb, 0.3), 0.7), 1.8) + L('M46,58 Q64,70 84,58', OL, 2.4) + L('M46,58 Q64,70 84,58', GOLD, 1.2) + C(64, 66, 3, c.cel(GOLD), 1);
        },
        front: function (c) { return body(c, 'M34,94 L94,94 L98,118' + rag(98, 30, 118, 6, 23) + 'Z', rb, F('M70,94 L100,94 L100,120 L74,120 Z', dk(rb, 0.3), 0.7) + L('M34,104 L96,104', '#e0b43c', 2), 1.8); },
        near: [[36, 58], [24, 72], [16, 70]], wNearFront: function (c, p) { return fireOrb(c, p[0] - 2, p[1] - 12, 6); },
        far: [[94, 58], [104, 66], [106, 58]], wFar: function (c, p) { return sunStaff(c, [p[0] + 4, p[1] + 62], [p[0] - 2, p[1] - 44]); },
        tf: at(0.98, 64, 122)
      });
    },
    thistleshrub_rootshaper: function (c) { return thistleshrub(c); },
    scorpid_dunestalker: function (c) { return dunestalker(c); },
    caliph_scorpidsting: function (c) {
      var rb = '#9a1e24', sk = '#c08058', blk = '#2a1a1a';
      return desertHuman(c, {
        skin: sk, veil: blk, veilTrim: GOLD, helm: 'scorpion', helmCol: '#c8903a', shirt: rb, sleeve: rb, forearm: '#6a4a2a', glove: '#3a2418', pants: '#3a2020', boots: '#2a1a14', legW: 11, shadowR: 38,
        back: function (c) { return body(c, 'M52,48 C66,44 82,46 86,52 C96,72 102,94 108,118 L96,114 L88,119 L78,114 L70,118 C68,94 62,70 52,48 Z', blk, F('M86,50 C96,72 104,96 110,120 L94,120 C90,96 86,72 80,50 Z', '#000', 0.4) + L('M72,117 L78,113 L88,118 L96,113 L106,117', GOLD, 1.6), 2); },
        chest: function (c) { return F('M58,48 L70,48 L68,88 L60,88 Z', blk) + L('M58,48 L60,88 M70,48 L68,88', GOLD, 1.4) + P(pd([[60, 56], [68, 56], [64, 64]], true), c.cel(GOLD), 1) + L('M48,64 Q64,70 80,64', dk(rb, 0.35), 1.2); },
        front: function (c) { return sash(c, GOLD, true) + body(c, 'M44,84 L84,84 L90,110' + rag(90, 38, 110, 6, 31) + 'Z', rb, F('M58,84 L70,84 L72,110 L56,110 Z', blk) + L('M58,84 L56,110 M70,84 L72,110', GOLD, 1.3) + F('M72,82 L94,82 L94,114 L76,114 Z', dk(rb, 0.3), 0.7), 1.8); },
        pads: function (c) { return body(c, 'M36,56 C34,44 52,42 58,50 L54,60 L40,62 Z', '#c8903a', L('M38,54 C44,48 52,48 56,52', dk('#c8903a', 0.4), 1.3) + L('M42,58 l4,-6 M48,58 l3,-6', dk('#c8903a', 0.4), 1), 1.8) + P('M36,56 L28,58 L34,52 Z', c.cel('#c8903a'), 1.2); },
        near: [[48, 54], [38, 42], [32, 30]], wNear: function (c, p) { return scimitar(c, p, 42, -PI / 2 - 0.42, '#e0e4ea'); },
        far: [[80, 54], [90, 66], [88, 82]], wFar: function (c, p) { return scimitar(c, p, 22, PI / 2 + 0.3); },
        tf: at(1.02, 64, 122)
      });
    },
    kregg_keelhaul: function (c) {
      var sk = '#d8a07a', coat = '#7a1e2a', hr = '#1a1414';
      return human(c, {
        skin: sk, hair: hr, patch: true, beard: hr, tache: hr, shirt: '#ece0c4', sleeve: coat, forearm: coat, pants: '#2a2230', boots: '#1a1210', glove: '#3a2418', legW: 11.5, armW: 10, shadowR: 40,
        headX: function (c, x, y) { return tricorn(c, x, y - 4, '#1e1a22', GOLD) + earring(x + 7, y + 6); },
        back: function (c) { return body(c, 'M76,54 C88,62 94,86 98,114' + rag(98, 72, 114, 7, 41) + 'L72,60 Z', dk(coat, 0.15), F('M86,58 L104,58 L104,120 L88,120 Z', '#000', 0.28), 2); },
        chest: function (c) {
          return body(c, 'M46,50 L58,48 L60,90 L48,90 Z', coat, L('M56,50 L58,88', GOLD, 1.6), 1.6) + body(c, 'M70,48 L82,50 L80,90 L68,90 Z', dk(coat, 0.15), L('M70,50 L68,88', GOLD, 1.6), 1.6) +
            L('M59,50 L64,60 L69,50', dk('#ece0c4', 0.35), 1.2) + [58, 66, 74, 82].map(function (y) { return C(53, y, 1.5, c.cel(GOLD), 0.6) + C(75, y, 1.5, c.cel(GOLD), 0.6); }).join('') + L('M80,52 L50,82', OL, 5) + L('M80,52 L50,82', '#3a2418', 3);
        },
        front: function (c) { return body(c, 'M44,82 L84,82 L88,110' + rag(88, 40, 110, 7, 43) + 'Z', coat, F('M58,82 L70,82 L68,108 L60,108 Z', '#2a2230') + F('M72,80 L92,80 L92,114 L74,114 Z', dk(coat, 0.3), 0.8) + L('M58,82 L60,108 M70,82 L68,108', GOLD, 1.4), 1.8) + P('M48,82 L80,82 L80,88 L48,88 Z', c.cel('#3a2418'), 1.6) + R(60, 81, 8, 8, c.cel(GOLD), 1.3); },
        pads: function (c) { var ep = function (x, y, w) { var fr = ''; for (var i = 0; i < 5; i++) fr += 'M' + pt([x - w + i * w / 2, y + 2]) + 'l0,5'; return body(c, ellD(x, y, w, 4), GOLD, '', 1.6) + L(fr, OL, 2.4) + L(fr, '#f0d060', 1.2); }; return ep(80, 50, 7) + ep(46, 52, 9); },
        near: [[48, 54], [38, 42], [30, 30]], wNear: function (c, p) { return cutlass(c, p, 44, -PI / 2 - 0.5, true); },
        far: [[80, 54], [92, 62], [100, 64]], farHand: function (c, p) { return hook(c, p); },
        tf: at(1.1, 64, 122)
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(SAND), 2.5); }
  function phScene(c) { return sky(c, SKYT, SKYM, SKYB) + ground(c, 150, SAND, SANDD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#e8c066"/></svg>'; }
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
