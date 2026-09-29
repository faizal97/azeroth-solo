/* art_zulfarrak.js — The Dune Temple art for Realm of Loner (dungeon, levels 44-48: the sandstone city of the Duneskin desert
 * trolls in Sirocco; the courtyard below the pyramid temple and the temple with its sacred pool, the blood drinkers,
 * shadowcasters and bandaged dead of the city, and the bosses Antuzz, Vessa the Martyr, Witch Doctor Zogo,
 * Grumblescale, Sergeant Kipp and Chief Uzzak).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * The Dune Temple keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_scarlet.js; toes, skull, feathers,
 * smoke, voodoo, the carved troll face and the goblin rig are copies of art_stranglethorn.js. The desert troll head,
 * the sandstone city pieces, the idols, the pool and the hydra are new here. The Duneskin look is deliberately apart
 * from the teal jungle trolls and the green forest trolls: sand-coloured skin, bleached hair swept back or in dreads,
 * red and gold paint, turquoise and gold jewellery.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix zf<counter>_).
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
  function Ctx() { this.p = 'zf' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  SCENE PIECES (shared house style, copies of art_scarlet.js)
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
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
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
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
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
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
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
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }

  // ---- more shared copies (art_stranglethorn.js) ----
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
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
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  function voodoo(c, x, y, r, col) {
    col = col || VOO; r = r || 1;
    var d = 'M' + pt([x + 7 * r, y]) + 'C' + pt([x + 7 * r, y - 8 * r]) + ' ' + pt([x - 6 * r, y - 9 * r]) + ' ' + pt([x - 7 * r, y - 1 * r]) + 'C' + pt([x - 7 * r, y + 5 * r]) + ' ' + pt([x + 2 * r, y + 6 * r]) + ' ' + pt([x + 3 * r, y + 1 * r]) + 'C' + pt([x + 4 * r, y - 3 * r]) + ' ' + pt([x - 2 * r, y - 4 * r]) + ' ' + pt([x - 2 * r, y]);
    return C(x, y, 22 * r, glow(c, col, 0.65)) + L(d, dk(col, 0.45), 4 * r) + L(d, lt(col, 0.35), 1.8 * r) + C(x, y, 2.6 * r, '#f0ffe0') +
      C(x - 9 * r, y - 11 * r, 1.4 * r, lt(col, 0.3)) + C(x + 8 * r, y - 14 * r, 1.1 * r, lt(col, 0.3)) + skull(c, x + 1 * r, y - 17 * r, 0.45 * r);
  }

  // ============================================================
  //  THE CITY: palette
  // ============================================================
  var SAND = '#e4be82', SANDM = '#d0a062', SANDD = '#a8723e', SANDX = '#7a4a26', DUNE = '#f2d294';
  var RED = '#b8261c', REDD = '#7a1410', GOLD = '#e8b43a', GOLDD = '#a8761e', TURQ = '#2aa89a', BONE = '#ece0c4';
  var TSKIN = '#d8b27e', THAIR = '#f0e2b4', SHADOW = '#a066ff', VOO = '#7aff5a', ICE = '#78c4ee', FROST = '#dcf6ff', BRONZE = '#c08a3a';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // red painted band with a gold zigzag, the city's trim on every tier and wall
  function paintBand(c, x0, x1, y, h, col, zig) {
    var o = R(x0, y, x1 - x0, h, col || RED, 0), z = 'M' + pt([x0, y + h * 0.75]), i = 1;
    for (var x = x0 + h; x <= x1 + 0.1; x += h, i++) z += 'L' + pt([Math.min(x, x1), y + (i % 2 ? h * 0.25 : h * 0.75)]);
    return o + L(z, zig || GOLD, Math.max(0.9, h * 0.24)) + L('M' + pt([x0, y]) + 'L' + pt([x1, y]) + 'M' + pt([x0, y + h]) + 'L' + pt([x1, y + h]), OL, 1);
  }
  // stepped troll merlons along a wall top
  function stepMerlons(c, x0, x1, y, col, w) {
    w = w || 10; var o = '';
    for (var x = x0; x < x1 - w * 0.5; x += w * 1.6) o += P(pd([[x, y], [x, y - w * 0.4], [x + w * 0.2, y - w * 0.4], [x + w * 0.2, y - w * 0.8], [x + w * 0.8, y - w * 0.8], [x + w * 0.8, y - w * 0.4], [x + w, y - w * 0.4], [x + w, y]], true), c.cel(col), 1.2);
    return o;
  }
  // a troll face carved into a stone block (x, y = centre of the face); copy of art_stranglethorn.js with painted eyes
  function carvedFace(c, x, y, s, col, eyeCol) {
    col = col || SANDM; var q = function (u, v) { return [x + u * s, y + v * s]; }, dd = dk(col, 0.5), o = '';
    o += body(c, pd([q(-20, -24), q(20, -24), q(22, 24), q(-22, 24)], true), col, F(pd([q(8, -26), q(24, -26), q(24, 26), q(10, 26)], true), dk(col, 0.25), 0.8) + L('M' + pt(q(-21, -17)) + 'L' + pt(q(21, -17)) + 'M' + pt(q(-21.6, 21)) + 'L' + pt(q(21.6, 21)), dk(col, 0.3), 0.9 * s), 1.8 * s);
    o += P(pd([q(-17, -14), q(-3, -8), q(3, -8), q(17, -14), q(17, -9), q(3, -3), q(-3, -3), q(-17, -9)], true), c.cel(lt(col, 0.1)), 1.3 * s);
    o += P(pd([q(-15, -6), q(-4, -2), q(-6, 2), q(-14, 0)], true), eyeCol || dd, 1 * s) + P(pd([q(15, -6), q(4, -2), q(6, 2), q(14, 0)], true), eyeCol || dd, 1 * s);
    o += P(pd([q(-3, -4), q(3, -4), q(5, 8), q(0, 10), q(-5, 8)], true), c.cel(lt(col, 0.06)), 1.2 * s);
    o += P(pd([q(-12, 12), q(12, 12), q(10, 19), q(-10, 19)], true), dd, 1 * s) + L('M' + pt(q(-6, 12)) + 'L' + pt(q(-6, 19)) + 'M' + pt(q(0, 12)) + 'L' + pt(q(0, 19)) + 'M' + pt(q(6, 12)) + 'L' + pt(q(6, 19)), lt(col, 0.1), 1 * s);
    o += P(pd([q(-12, 16), q(-18, 1), q(-8, 13)], true), c.cel(BONE), 1.1 * s) + P(pd([q(12, 16), q(18, 1), q(8, 13)], true), c.cel(dk(BONE, 0.08)), 1.1 * s);
    return o;
  }
  // standing troll idol, seen from the front, on a painted plinth (x = centre, y = ground)
  function trollStatue(c, x, y, s, col, eyeGlow) {
    col = col || SANDM; var yb = y - 14 * s, q = function (u, v) { return [x + u * s, yb + v * s]; }, o = E(x, y + 2, 30 * s, 4 * s, '#000', 0, 0.3), sh = dk(col, 0.26);
    var shade = function (x0) { return F(pd([q(x0, -120), q(40, -120), q(40, 10), q(x0, 10)], true), sh, 0.75); };
    o += stoneFace(c, x - 22 * s, y, 44 * s, 14 * s, dk(col, 0.1), 7 * s) + paintBand(c, x - 22 * s, x + 22 * s, yb - 1 * s, 4 * s);
    // headdress fan behind the head
    for (var i = 0; i < 5; i++) { var a = -PI / 2 + (i - 2) * 0.36, tx = x + Math.cos(a) * 28 * s, ty = yb - 72 * s + Math.sin(a) * 28 * s; o += P(pd([q(-4 + (i - 2) * 3, -76), [tx - Math.sin(a) * 5 * s, ty + Math.cos(a) * 5 * s], [tx + Math.cos(a) * 3 * s, ty + Math.sin(a) * 3 * s], [tx + Math.sin(a) * 5 * s, ty - Math.cos(a) * 5 * s], q(4 + (i - 2) * 3, -76)], true), c.cel(i % 2 ? col : lt(col, 0.08)), 1.3 * s) + C(tx, ty, 2.2 * s, i % 2 ? GOLD : RED, 0.9 * s); }
    // legs, loin panel, torso and arms folded over the chest
    o += body(c, pd([q(-15, 0), q(-4, 0), q(-5, -24), q(-16, -24)], true), col, '', 1.6 * s) + body(c, pd([q(4, 0), q(15, 0), q(16, -24), q(5, -24)], true), col, shade(6), 1.6 * s);
    o += L('M' + pt(q(-13, -1)) + 'l0,-3 M' + pt(q(-9, -1)) + 'l0,-3 M' + pt(q(9, -1)) + 'l0,-3 M' + pt(q(13, -1)) + 'l0,-3', dk(col, 0.45), 1 * s);
    o += body(c, pd([q(-18, -22), q(18, -22), q(21, -52), q(-21, -52)], true), col, shade(6) + L('M' + pt(q(-12, -44)) + 'Q' + pt(q(0, -40)) + ' ' + pt(q(12, -44)), dk(col, 0.35), 1 * s), 1.7 * s);
    o += P(pd([q(-7, -24), q(7, -24), q(6, -6), q(0, -2), q(-6, -6)], true), c.cel(RED), 1.2 * s) + L('M' + pt(q(-6, -10)) + 'L' + pt(q(0, -6)) + 'L' + pt(q(6, -10)), GOLD, 1.1 * s);
    o += body(c, pd([q(-21, -52), q(-28, -48), q(-25, -30), q(-18, -26)], true), lt(col, 0.05), '', 1.5 * s) + body(c, pd([q(21, -52), q(28, -48), q(25, -30), q(18, -26)], true), dk(col, 0.1), '', 1.5 * s);
    o += P(pd([q(-24, -36), q(10, -30), q(10, -24), q(-22, -30)], true), c.cel(lt(col, 0.06)), 1.3 * s) + P(pd([q(24, -38), q(-10, -32), q(-10, -26), q(22, -32)], true), c.cel(dk(col, 0.06)), 1.3 * s);
    o += C(x - 6 * s, yb - 29 * s, 2 * s, GOLD, 0.8 * s) + C(x + 6 * s, yb - 31 * s, 2 * s, GOLD, 0.8 * s);
    // ears and the carved head
    o += P(pd([q(-14, -74), q(-34, -84), q(-26, -76), q(-15, -62)], true), c.cel(col), 1.3 * s) + P(pd([q(14, -74), q(34, -84), q(26, -76), q(15, -62)], true), c.cel(dk(col, 0.12)), 1.3 * s);
    o += carvedFace(c, x, yb - 68 * s, 0.7 * s, lt(col, 0.04), RED);
    if (eyeGlow) o += C(x - 6.5 * s, yb - 70 * s, 1.6 * s, eyeGlow, 0, 0.9) + C(x + 6.5 * s, yb - 70 * s, 1.6 * s, eyeGlow, 0, 0.9) + C(x - 6.5 * s, yb - 70 * s, 8 * s, glow(c, eyeGlow, 0.5)) + C(x + 6.5 * s, yb - 70 * s, 8 * s, glow(c, eyeGlow, 0.5));
    return o;
  }
  // bronze brazier on a tripod (x = centre, y = ground, h = stand height)
  function brazier(c, x, y, s, h) {
    h = (h == null ? 16 : h) * s;
    var bw = 11 * s, by = y - h, o = E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.3) + C(x, by - 10 * s, 34 * s, glow(c, '#ffa040', 0.5));
    o += limb('M' + pt([x - 8 * s, y]) + 'L' + pt([x, by]) + 'L' + pt([x + 8 * s, y]) + 'M' + pt([x, y]) + 'L' + pt([x, by]), BRONZE, 2 * s);
    o += flame(c, x - 5 * s, by - 5 * s, 0.55 * s) + flame(c, x + 5 * s, by - 5 * s, 0.5 * s) + flame(c, x, by - 5 * s, 0.85 * s);
    var d = 'M' + pt([x - bw, by - 6 * s]) + 'L' + pt([x + bw, by - 6 * s]) + 'C' + pt([x + bw * 0.8, by + 3 * s]) + ' ' + pt([x - bw * 0.8, by + 3 * s]) + ' ' + pt([x - bw, by - 6 * s]) + 'Z';
    o += body(c, d, BRONZE, L('M' + pt([x - bw, by - 3.4 * s]) + 'L' + pt([x + bw, by - 3.4 * s]), RED, 1.8 * s) + F(pd([[x + bw * 0.3, by - 8 * s], [x + bw + 2, by - 8 * s], [x + bw + 2, by + 4 * s], [x + bw * 0.3, by + 4 * s]], true), dk(BRONZE, 0.3), 0.7), 1.5 * s);
    return o + E(x, by - 6 * s, bw, 1.8 * s, dk(BRONZE, 0.25), 1.2 * s) + flame(c, x - 2 * s, by - 6 * s, 0.4 * s, '#ffb030', '#fff0a0');
  }
  // wind-blown sand drift: a soft mound with a lit crest line
  function drift(c, x0, x1, y, h, col) {
    col = col || DUNE; var w = x1 - x0;
    var d = 'M' + pt([x0, y]) + 'C' + pt([x0 + w * 0.22, y - h]) + ' ' + pt([x0 + w * 0.55, y - h * 1.1]) + ' ' + pt([x1, y]) + 'Z';
    return F(d, col, 0.96) + F('M' + pt([x0 + w * 0.5, y - h * 0.8]) + 'C' + pt([x0 + w * 0.7, y - h * 0.7]) + ' ' + pt([x0 + w * 0.85, y - h * 0.3]) + ' ' + pt([x1, y]) + 'L' + pt([x0 + w * 0.62, y]) + 'Z', dk(col, 0.14), 0.8) +
      L('M' + pt([x0 + w * 0.04, y - h * 0.16]) + 'C' + pt([x0 + w * 0.22, y - h]) + ' ' + pt([x0 + w * 0.55, y - h * 1.1]) + ' ' + pt([x0 + w * 0.96, y - h * 0.1]), dk(col, 0.4), 1.2, 0.8) +
      L('M' + pt([x0 + w * 0.2, y - h * 0.55]) + 'Q' + pt([x0 + w * 0.36, y - h * 0.82]) + ' ' + pt([x0 + w * 0.5, y - h * 0.8]), lt(col, 0.5), 1.4, 0.8);
  }
  // clay pot, painted, sometimes broken
  function urn(c, x, y, s, broken) {
    var d = 'M' + pt([x - 5 * s, y]) + 'C' + pt([x - 11 * s, y - 6 * s]) + ' ' + pt([x - 10 * s, y - 15 * s]) + ' ' + pt([x - 4 * s, y - 18 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 18 * s]) + 'C' + pt([x + 10 * s, y - 15 * s]) + ' ' + pt([x + 11 * s, y - 6 * s]) + ' ' + pt([x + 5 * s, y]) + 'Z';
    if (broken) d = 'M' + pt([x - 5 * s, y]) + 'C' + pt([x - 11 * s, y - 6 * s]) + ' ' + pt([x - 10 * s, y - 13 * s]) + ' ' + pt([x - 6 * s, y - 15 * s]) + 'L' + pt([x - 2 * s, y - 10 * s]) + 'L' + pt([x + 2 * s, y - 14 * s]) + 'L' + pt([x + 5 * s, y - 9 * s]) + 'L' + pt([x + 9 * s, y - 12 * s]) + 'C' + pt([x + 11 * s, y - 6 * s]) + ' ' + pt([x + 8 * s, y - 2 * s]) + ' ' + pt([x + 5 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.2 * s, '#000', 0, 0.3) + body(c, d, '#b86a3a', L('M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), OL, 2.6 * s) + L('M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), GOLD, 1.2 * s) + F(pd([[x + 2 * s, y - 22 * s], [x + 12 * s, y - 22 * s], [x + 12 * s, y + 1], [x + 3 * s, y + 1]], true), '#000', 0.22), 1.4 * s) +
      (broken ? P(pd([[x + 12 * s, y], [x + 16 * s, y - 4 * s], [x + 20 * s, y - 1 * s], [x + 18 * s, y + 1]], true), c.cel('#b86a3a'), 1.1 * s) : '');
  }
  // stepped pyramid temple with a painted central stair and a carved-face shrine (x = centre, y = base)
  function pyramid(c, x, y, s) {
    var o = E(x, y + 3, 118 * s, 7 * s, '#000', 0, 0.25), by = y;
    [[104, 21], [84, 20], [64, 19], [46, 18]].forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s;
      o += stoneFace(c, x - hw, by, hw * 2, th, i % 2 ? SAND : lt(SAND, 0.06), 8 * s) + paintBand(c, x - hw, x + hw, by - th, 4 * s);
      o += carvedFace(c, x - hw + 12 * s, by - th * 0.44, 0.24 * s, SAND, RED) + carvedFace(c, x + hw - 12 * s, by - th * 0.44, 0.24 * s, dk(SAND, 0.12), RED);
      by -= th;
    });
    var sw0 = 24 * s, sw1 = 13 * s, st = '', top = by;
    o += P(pd([[x - sw0 - 5 * s, y], [x - sw1 - 4 * s, top], [x + sw1 + 4 * s, top], [x + sw0 + 5 * s, y]], true), c.cel(SANDD), 1.6 * s);
    o += P(pd([[x - sw0, y], [x - sw1, top], [x + sw1, top], [x + sw0, y]], true), c.cel(lt(SAND, 0.14)), 1.4 * s);
    for (var j = 1; j < 16; j++) { var t = j / 16, yy = y - (y - top) * t, hw2 = sw0 + (sw1 - sw0) * t; st += 'M' + pt([x - hw2, yy]) + 'L' + pt([x + hw2, yy]); }
    o += L(st, dk(SAND, 0.38), 1 * s) + F(pd([[x + sw1 * 0.3, top], [x + sw1, top], [x + sw0, y], [x + sw0 * 0.3, y]], true), dk(SAND, 0.2), 0.55);
    o += F(pd([[x - 5 * s, y], [x - 3 * s, top], [x + 3 * s, top], [x + 5 * s, y]], true), RED, 0.85);
    // shrine
    o += stoneFace(c, x - 30 * s, top, 60 * s, 30 * s, SANDM, 9 * s) + paintBand(c, x - 30 * s, x + 30 * s, top - 30 * s, 4 * s);
    o += P(pd([[x - 36 * s, top - 30 * s], [x + 36 * s, top - 30 * s], [x + 32 * s, top - 38 * s], [x - 32 * s, top - 38 * s]], true), c.cel(lt(SANDM, 0.06)), 1.6 * s);
    o += stepMerlons(c, x - 32 * s, x + 32 * s, top - 38 * s, SANDM, 8 * s);
    o += P(pd([[x - 8 * s, top], [x - 8 * s, top - 14 * s], [x, top - 20 * s], [x + 8 * s, top - 14 * s], [x + 8 * s, top]], true), '#2a1610', 1.4 * s) + C(x, top - 8 * s, 10 * s, glow(c, '#ff8a3a', 0.45));
    o += carvedFace(c, x - 19 * s, top - 14 * s, 0.34 * s, SANDM, RED) + carvedFace(c, x + 19 * s, top - 14 * s, 0.34 * s, dk(SANDM, 0.1), RED);
    return o + brazier(c, x - 34 * s, top, 0.6 * s, 6) + brazier(c, x + 34 * s, top, 0.6 * s, 6);
  }
  // square sandstone pillar with a zigzag band, a carved face and a cap slab (x = left edge, y = ground)
  function sandPillar(c, x, y, w, h, col, face) {
    col = col || SANDM;
    var o = E(x + w / 2, y + 2, w * 0.8, 3.4, '#000', 0, 0.25) + stoneFace(c, x, y, w, h, col, 14);
    o += paintBand(c, x, x + w, y - h * 0.52, 6) + paintBand(c, x, x + w, y - 18, 5);
    o += R(x - 4, y - h - 7, w + 8, 8, c.cel(lt(col, 0.06)), 1.6) + R(x - 2, y - h - 1, w + 4, 4, c.cel(dk(col, 0.08)), 1.2);
    if (face) o += carvedFace(c, x + w / 2, y - h * 0.76, w / 48, col, RED);
    return o;
  }
  // bronze gong on a wooden frame, mallet leaning on it (x = centre, y = ground)
  function gong(c, x, y, s) {
    var wood = '#6a4424', o = E(x, y + 2, 30 * s, 4 * s, '#000', 0, 0.3), cy = y - 30 * s;
    o += limb('M' + pt([x - 22 * s, y]) + 'L' + pt([x - 22 * s, y - 54 * s]) + 'M' + pt([x + 22 * s, y]) + 'L' + pt([x + 22 * s, y - 54 * s]), wood, 4 * s);
    o += P(pd([[x - 30 * s, y - 52 * s], [x + 30 * s, y - 52 * s], [x + 34 * s, y - 60 * s], [x + 24 * s, y - 57 * s], [x - 24 * s, y - 57 * s], [x - 34 * s, y - 60 * s]], true), c.cel(wood), 1.6 * s) + paintBand(c, x - 22 * s, x + 22 * s, y - 56 * s, 3 * s);
    o += L('M' + pt([x - 8 * s, y - 52 * s]) + 'L' + pt([x - 6 * s, cy - 16 * s]) + 'M' + pt([x + 8 * s, y - 52 * s]) + 'L' + pt([x + 6 * s, cy - 16 * s]), OL, 1.2 * s);
    o += C(x, cy, 30 * s, glow(c, '#ffc860', 0.25)) + C(x, cy, 18 * s, c.rg([[0, lt(BRONZE, 0.4)], [0.55, BRONZE], [1, dk(BRONZE, 0.3)]]), 2 * s);
    o += '<circle cx="' + n(x) + '" cy="' + n(cy) + '" r="' + n(12 * s) + '" fill="none" stroke="' + dk(BRONZE, 0.35) + '" stroke-width="' + n(1.2 * s) + '"/>' + C(x, cy, 5 * s, c.cel(GOLD), 1.2 * s) + E(x - 6 * s, cy - 7 * s, 4 * s, 2 * s, '#fff4c0', 0, 0.6);
    o += limb('M' + pt([x + 26 * s, y]) + 'L' + pt([x + 34 * s, y - 34 * s]), '#8a5a30', 2 * s) + E(x + 35 * s, y - 37 * s, 5 * s, 4 * s, c.cel('#e8dcc0'), 1.3 * s);
    return o;
  }
  function lightShaft(c, x0, x1, y0, x2, x3, y1, col, op) { return F(pd([[x0, y0], [x1, y0], [x3, y1], [x2, y1]], true), c.lg([[0, col, op], [1, col, 0]])); }
  // desert haze sky with a white-hot sun
  function desertSky(c) { return sky(c, '#2c66b4', '#78b4dc', '#f6dca6') + sun(c, 74, 34, 12, '#fffbe8'); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    zf_courtyard: function (c) {
      var o = desertSky(c);
      o += cloud(300, 30, 0.8, 0.5, '#fff8ec') + cloud(190, 18, 0.5, 0.4, '#fff8ec');
      o += hills(c, 951, 108, 20, '#f0d09a', 46) + hills(c, 952, 116, 16, '#e4ba7c', 40);
      // the city wall behind the courtyard, and side blocks framing it
      o += stoneFace(c, -2, 124, 404, 34, SANDM, 9) + paintBand(c, -2, 402, 94, 5) + stepMerlons(c, -2, 402, 90, SANDM, 10);
      o += stoneFace(c, -2, 124, 58, 76, SANDD, 10) + paintBand(c, -2, 56, 56, 5) + stepMerlons(c, -2, 58, 48, SANDD, 9) + carvedFace(c, 26, 92, 0.5, SANDD, RED);
      o += stoneFace(c, 344, 124, 60, 76, SANDD, 10) + paintBand(c, 344, 404, 56, 5) + stepMerlons(c, 344, 404, 48, SANDD, 9) + carvedFace(c, 374, 92, 0.5, dk(SANDD, 0.08), RED);
      o += P(pd([[18, 124], [18, 110], [26, 104], [34, 110], [34, 124]], true), '#2a1610', 1.4) + P(pd([[366, 124], [366, 110], [374, 104], [382, 110], [382, 124]], true), '#2a1610', 1.4);
      o += pyramid(c, 200, 124, 1);
      o += trollStatue(c, 100, 124, 0.66, SANDM) + trollStatue(c, 300, 124, 0.66, dk(SANDM, 0.06));
      // courtyard floor: flagstones half-buried in blown sand
      o += flagFloor(c, 124, 200, '#d4a468', 953);
      o += R(0, 122, 400, 6, c.lg([[0, '#000', 0.25], [1, '#000', 0]]));
      o += drift(c, 36, 96, 127, 5) + drift(c, 296, 372, 127, 4) + drift(c, 150, 176, 126, 3);
      o += brazier(c, 158, 132, 1, 18) + brazier(c, 242, 132, 1, 18);
      o += F('M176,124 L224,124 L262,242 L138,242 Z', '#e8c48a', 0.35);
      o += drift(c, -20, 150, 244, 30) + drift(c, 250, 420, 244, 22, lt(DUNE, 0.04)) + drift(c, 120, 200, 196, 7);
      o += pebbles(954, 140, 236, '#8a5a30', 18, 20, 380);
      o += urn(c, 42, 152, 1) + urn(c, 60, 156, 0.8, true) + urn(c, 352, 150, 0.9);
      o += bone(96, 214, 16, 0.4, 1) + skull(c, 112, 210, 0.9) + bone(300, 204, 14, -0.3, 0.9);
      o += rock(c, 386, 232, 26, 10, SANDD);
      return o + motes(955, 16, 0, 400, 130, 230, '#fff4d0') + vignette(c, '#fff4d8', '#3a1a08');
    },
    zf_temple: function (c) {
      var o = R(0, 0, 400, 240, '#3a2216');
      // back wall of great blocks, dim at the top, warm near the fire
      o += brickWall(c, 0, 0, 400, 124, '#946038', 961, 16);
      o += R(0, 0, 400, 124, c.lg([[0, '#1a0c06', 0.7], [0.5, '#1a0c06', 0.25], [1, '#ffa050', 0.08]]));
      o += paintBand(c, 0, 400, 14, 7) + paintBand(c, 0, 400, 108, 5);
      // the light from the roof opening
      o += lightShaft(c, 170, 230, 0, 120, 250, 160, '#fff0c0', 0.3);
      // the great idol on the back wall and its two guardians
      o += R(150, 28, 100, 80, c.cel(dk(SANDD, 0.1)), 2) + paintBand(c, 150, 250, 28, 5);
      o += carvedFace(c, 200, 70, 1.35, SANDM, '#3a0e08') + gEye(c, 191, 67, 2.4, '#ff5a2a') + gEye(c, 209, 67, 2.4, '#ff5a2a');
      o += trollStatue(c, 124, 122, 0.8, dk(SANDM, 0.08), '#ff7a2a') + trollStatue(c, 276, 122, 0.8, dk(SANDM, 0.14), '#ff7a2a');
      o += sandPillar(c, 4, 124, 30, 104, SANDD, true) + sandPillar(c, 366, 124, 30, 104, dk(SANDD, 0.06), true);
      // floor
      o += flagFloor(c, 124, 200, '#a8703e', 962);
      o += R(0, 122, 400, 6, c.lg([[0, '#000', 0.35], [1, '#000', 0]]));
      // the sacred pool: stepped rim, turquoise water, the light on it
      o += E(182, 143, 74, 14, c.cel(SANDD), 2) + E(182, 138, 74, 13, c.lg([[0, lt(SAND, 0.1)], [1, SANDM]]), 2);
      o += E(182, 138, 64, 9.5, c.lg([[0, '#1a6a80'], [0.5, '#2aa0b0'], [1, '#6ad8d8']]), 1.6);
      o += E(190, 139, 30, 5, '#e8fff8', 0, 0.3) + L('M140,138 q8,-2 16,0 M204,141 q10,-2 20,0 M168,135 q6,-1.4 12,0 M216,135 q6,-1.4 12,0', '#dffcff', 1.2, 0.8);
      o += L('M110,138 L254,138', OL, 0.8, 0.4);
      o += gong(c, 82, 136, 0.72) + brazier(c, 272, 140, 1, 24) + brazier(c, 44, 150, 1, 30) + brazier(c, 356, 150, 1, 30);
      o += drift(c, -20, 110, 244, 20, '#d8a868') + drift(c, 300, 420, 244, 16, '#d8a868');
      o += urn(c, 330, 206, 1) + urn(c, 22, 206, 0.9, true) + bone(120, 222, 16, 0.5, 1) + skull(c, 300, 226, 0.9) + pebbles(963, 170, 236, '#5a3218', 14, 20, 380);
      return o + motes(964, 22, 120, 280, 10, 150, '#fff0c0') + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- desert troll head (facing left): long hooked nose, drooping ringed ears, bleached hair swept back or in dreads ----
  function dtHead(c, x, y, o) {
    var sk = o.skin || TSKIN, s = '', pc = o.paintCol || RED, hc = o.hair || THAIR, hat = o.hat;
    if (hat === 'scarab') {
      // turquoise-and-gold wing fan behind the head
      [[-0.9, 26], [-0.45, 30], [0, 30], [0.45, 26]].forEach(function (w, i) {
        var a = -PI / 2 + 0.5 + w[0], tx = x + 4 + Math.cos(a) * w[1], ty = y - 8 + Math.sin(a) * w[1];
        s += P('M' + pt([x + 2, y - 8]) + 'Q' + pt([x + 4 + Math.cos(a - 0.3) * w[1] * 0.7, y - 8 + Math.sin(a - 0.3) * w[1] * 0.7]) + ' ' + pt([tx, ty]) + 'Q' + pt([x + 4 + Math.cos(a + 0.3) * w[1] * 0.7, y - 8 + Math.sin(a + 0.3) * w[1] * 0.7]) + ' ' + pt([x + 6, y - 6]) + 'Z', c.cel(i % 2 ? TURQ : lt(TURQ, 0.2)), 1.5) +
          L('M' + pt([x + 4, y - 7]) + 'L' + pt([tx, ty]), GOLD, 1.2);
      });
    }
    if (hat === 'skullmask') s += feathers(x + 6, y - 14, [RED, '#1a1009', GOLD, RED, '#f0e8d0'], 1.25, 2.1);
    if (o.dreads) {
      var dd = o.dreads === true ? 3 : o.dreads;
      for (var i = 0; i < dd; i++) {
        var T = taper([[x + 2 * i, y - 13 + 2 * i], [x + 12 + 2 * i, y - 13 + 3 * i], [x + 24 + 3 * i, y - 8 + 5 * i], [x + 32 + 2 * i, y + 2 + 7 * i]], 7, 3, 5);
        s += P(T.d, c.cel(i % 2 ? dk(hc, 0.1) : hc), 1.6) + L(bands(T, 4), dk(hc, 0.35), 1) + C(T.s[T.s.length - 4][0], T.s[T.s.length - 4][1], 2.2, i % 2 ? RED : GOLD, 0.9);
      }
    }
    // ear: long, drooping back, pierced with gold rings
    s += P('M' + pt([x + 6, y - 3]) + 'L' + pt([x + 31, y - 9]) + 'L' + pt([x + 27, y - 2]) + 'L' + pt([x + 10, y + 7]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 11, y]) + 'L' + pt([x + 27, y - 6]) + 'L' + pt([x + 12, y + 4]) + 'Z', dk(sk, 0.3), 0.8);
    if (o.earring !== false) s += L(ellD(x + 22, y - 2, 2, 2.6), OL, 2.4) + L(ellD(x + 22, y - 2, 2, 2.6), GOLD, 1.2) + L(ellD(x + 17, y + 1, 1.8, 2.3), OL, 2.2) + L(ellD(x + 17, y + 1, 1.8, 2.3), GOLD, 1.1);
    if (o.crest) s += P(pd([[x - 8, y - 11], [x + 2, y - 22], [x + 6, y - 15], [x + 16, y - 24], [x + 16, y - 15], [x + 28, y - 22], [x + 22, y - 10], [x + 32, y - 12], [x + 14, y - 4]], true), c.cel(hc), 2) + L('M' + pt([x + 2, y - 14]) + 'L' + pt([x + 14, y - 19]) + 'M' + pt([x + 10, y - 10]) + 'L' + pt([x + 24, y - 15]), dk(hc, 0.3), 1.1);
    var d = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 17]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 12, y + 11]) + 'C' + pt([x - 14, y + 8]) + ' ' + pt([x - 13, y + 6]) + ' ' + pt([x - 11, y + 5]) +
      'L' + pt([x - 22, y + 6]) + 'C' + pt([x - 27, y + 6]) + ' ' + pt([x - 26, y + 1]) + ' ' + pt([x - 21, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
    var paint = '', p = o.paint;
    if (p === 'blood') paint = F(pd([[x - 16, y - 7], [x + 6, y - 9], [x + 7, y - 2], [x - 13, y]], true), pc, 0.95) + F(pd([[x - 11, y + 10], [x - 4, y + 12], [x - 5, y + 16], [x - 7, y + 13], [x - 9, y + 17], [x - 11, y + 13]], true), pc, 0.9);
    else if (p === 'white') paint = C(x + 2, y + 4, 1.3, '#f4eee0') + C(x + 5, y + 7, 1.3, '#f4eee0') + C(x + 2, y + 10, 1.3, '#f4eee0') + F(pd([[x - 8, y - 12], [x - 3, y - 7], [x + 2, y - 13], [x + 2, y - 10], [x - 3, y - 4], [x - 8, y - 9]], true), '#f4eee0', 0.9);
    else if (p === 'gold') paint = F(pd([[x - 12, y - 7], [x + 4, y - 8], [x + 4, y - 6], [x - 12, y - 5]], true) + pd([[x, y + 2], [x + 8, y + 1], [x + 8, y + 3], [x, y + 4]], true), GOLD, 0.95) + C(x - 16, y - 2, 1.2, GOLD);
    else if (p === 'war') paint = F(pd([[x - 14, y - 8], [x + 8, y - 10], [x + 9, y - 4], [x - 12, y - 1]], true), pc, 0.95) + F(pd([[x + 1, y + 1], [x + 10, y - 1], [x + 10, y + 3], [x + 2, y + 5]], true) + pd([[x + 1, y + 7], [x + 10, y + 5], [x + 9, y + 9], [x + 2, y + 10]], true), GOLD, 0.95);
    else if (p === 'dead') paint = E(x - 5, y - 3, 5, 4.2, dk(sk, 0.45), 0, 0.9) + L('M' + pt([x + 2, y - 10]) + 'l3,6 M' + pt([x + 5, y + 2]) + 'l4,3', dk(sk, 0.4), 1);
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8) + paint, 2.2);
    s += P('M' + pt([x - 22, y + 5]) + 'C' + pt([x - 23, y + 10]) + ' ' + pt([x - 19, y + 11]) + ' ' + pt([x - 17, y + 6]) + 'Z', c.cel(dk(sk, 0.1)), 1.3);
    if (o.noseRing) s += L(ellD(x - 20, y + 8, 2, 2), OL, 2.2) + L(ellD(x - 20, y + 8, 2, 2), GOLD, 1.1);
    if (hat !== 'skullmask') {
      s += L('M' + pt([x - 13, y - 8]) + 'L' + pt([x - 1, y - 5]), OL, 2.6);
      s += o.glow ? glowEye(c, x - 6, y - 3, 1.8, o.eye) : C(x - 6, y - 3, 1.9, o.eye || '#ffcc30', 1) + C(x - 6.4, y - 3.4, 0.6, '#fff');
    }
    if (o.jaw) s += P('M' + pt([x - 12, y + 10]) + 'L' + pt([x - 2, y + 11]) + 'L' + pt([x - 4, y + 19]) + 'L' + pt([x - 11, y + 17]) + 'Z', '#2a140e', 1.3) + L('M' + pt([x - 11, y + 12]) + 'l1.4,2 M' + pt([x - 8, y + 12]) + 'l1,2 M' + pt([x - 5, y + 12]) + 'l1,2', BONE, 1.1);
    else s += L('M' + pt([x - 12, y + 11]) + 'L' + pt([x - 2, y + 11]), OL, 1.4);
    var tk = o.tusk || 1;
    s += P('M' + pt([x - 7, y + 12.5]) + 'C' + pt([x - 7 - 7 * tk, y + 13]) + ' ' + pt([x - 7 - 12 * tk, y + 12.5 - 6 * tk]) + ' ' + pt([x - 7 - 11 * tk, y + 12.5 - 13 * tk]) + 'C' + pt([x - 7 - 8 * tk, y + 12.5 - 7 * tk]) + ' ' + pt([x - 7 - 4 * tk, y + 12.5 - 5 * tk]) + ' ' + pt([x - 3, y + 9.5]) + 'Z', c.cel(o.tuskCol || BONE), 1.6);
    if (o.tuskCap) s += P(pd([[x - 7 - 11 * tk, y + 12.5 - 13 * tk], [x - 7 - 12.6 * tk, y + 12.5 - 8 * tk], [x - 7 - 9 * tk, y + 12.5 - 8.6 * tk]], true), c.cel(GOLD), 1);
    // headgear
    if (hat === 'band') s += L('M' + pt([x - 7, y - 12]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]), OL, 4.8) + L('M' + pt([x - 7, y - 12]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]), o.bandCol || RED, 3) + C(x - 1, y - 13.4, 2.4, c.cel(GOLD), 1) +
      P(pd([[x + 11, y - 9], [x + 22, y - 3], [x + 19, y], [x + 24, y + 6], [x + 13, y - 3]], true), c.cel(o.bandCol || RED), 1.3);
    else if (hat === 'crown') {
      var cd = pd([[x - 10, y - 10], [x - 12, y - 24], [x - 6, y - 16], [x - 2, y - 30], [x + 3, y - 17], [x + 8, y - 28], [x + 10, y - 15], [x + 15, y - 22], [x + 14, y - 7]], true);
      s += body(c, cd, GOLD, F(pd([[x + 4, y - 32], [x + 18, y - 32], [x + 18, y - 4], [x + 5, y - 4]], true), GOLDD, 0.75) + L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 14, y - 9.4]), dk(GOLD, 0.45), 1.2), 1.8);
      s += E(x - 3, y - 13, 2.4, 2.8, c.cel(RED), 1) + C(x + 6, y - 12.4, 1.8, c.cel(TURQ), 0.9) + C(x - 2, y - 29, 1.5, RED, 0.8) + C(x + 8, y - 27, 1.4, RED, 0.8);
    } else if (hat === 'scarab') {
      s += L('M' + pt([x - 7, y - 11]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 7]), OL, 4.4) + L('M' + pt([x - 7, y - 11]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 7]), GOLD, 2.6);
      s += scarab(c, x - 2, y - 17, 0.62, 0);
    } else if (hat === 'hood') {
      var hcol = o.hoodCol || '#4a1e3a';
      var hood = 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 14, y - 22]) + ' ' + pt([x + 14, y - 26]) + ' ' + pt([x + 22, y - 8]) + 'L' + pt([x + 26, y + 18]) + 'C' + pt([x + 18, y + 20]) + ' ' + pt([x + 10, y + 18]) + ' ' + pt([x + 8, y + 14]) + 'C' + pt([x + 10, y + 2]) + ' ' + pt([x + 6, y - 10]) + ' ' + pt([x - 4, y - 11]) + 'C' + pt([x - 8, y - 11]) + ' ' + pt([x - 11, y - 8]) + ' ' + pt([x - 12, y - 4]) + 'Z';
      s += body(c, hood, hcol, F(pd([[x + 8, y - 28], [x + 30, y - 28], [x + 30, y + 22], [x + 12, y + 22]], true), dk(hcol, 0.35), 0.8), 2) + L('M' + pt([x - 11, y - 5]) + 'C' + pt([x - 9, y - 9]) + ' ' + pt([x - 6, y - 10]) + ' ' + pt([x - 3, y - 10]) + 'C' + pt([x + 5, y - 9]) + ' ' + pt([x + 9, y + 3]) + ' ' + pt([x + 8, y + 14]), GOLD, 1.6);
      s += P(pd([[x + 2, y - 23], [x + 5, y - 30], [x + 8, y - 22]], true), c.cel(GOLD), 1) + C(x + 5, y - 21, 1.6, SHADOW, 0.7);
    } else if (hat === 'spikes') {
      s += L('M' + pt([x - 7, y - 12]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]), OL, 4.8) + L('M' + pt([x - 7, y - 12]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]), '#6a7a5a', 3);
      [[-4, -14, -0.5, 16], [2, -15, 0.1, 19], [8, -12, 0.7, 16]].forEach(function (b) { var a = -PI / 2 + b[2], ex = x + b[0] + Math.cos(a) * b[3], ey = y + b[1] + Math.sin(a) * b[3]; s += P(pd([[x + b[0] - 2.4, y + b[1]], [ex, ey], [x + b[0] + 2.4, y + b[1]]], true), c.cel(BONE), 1.3); });
      s += C(x + 1, y - 14.4, 2.2, c.cel(TURQ), 1);
    } else if (hat === 'skullmask') {
      // a bleached troll skull worn over the face, snout forward
      var md = 'M' + pt([x - 8, y - 14]) + 'C' + pt([x, y - 22]) + ' ' + pt([x + 14, y - 18]) + ' ' + pt([x + 14, y - 4]) + 'L' + pt([x + 12, y + 6]) + 'L' + pt([x - 2, y + 8]) + 'L' + pt([x - 12, y + 10]) + 'L' + pt([x - 27, y + 6]) + 'C' + pt([x - 30, y + 3]) + ' ' + pt([x - 28, y - 1]) + ' ' + pt([x - 23, y - 3]) + 'L' + pt([x - 12, y - 8]) + 'Z';
      s += body(c, md, BONE, F(pd([[x + 3, y - 24], [x + 18, y - 24], [x + 18, y + 12], [x + 4, y + 12]], true), '#b8a888', 0.7) + L('M' + pt([x - 2, y - 17]) + 'L' + pt([x + 1, y - 8]) + 'L' + pt([x - 2, y - 2]), '#a8987a', 1), 2.2);
      s += P(pd([[x - 12, y - 6], [x - 2, y - 7], [x - 3, y + 1], [x - 10, y + 1]], true), '#1a0e08', 1.2) + glowEye(c, x - 7, y - 3, 1.8, VOO);
      s += E(x - 22, y + 1, 2, 1.4, '#1a0e08') + L('M' + pt([x - 26, y + 6]) + 'L' + pt([x - 8, y + 8]), OL, 1.4) + L('M' + pt([x - 23, y + 5]) + 'l0,3 M' + pt([x - 19, y + 5.6]) + 'l0,3 M' + pt([x - 15, y + 6.2]) + 'l0,3 M' + pt([x - 11, y + 6.8]) + 'l0,3', OL, 1);
      s += F(pd([[x - 6, y - 18], [x + 4, y - 20], [x + 4, y - 17], [x - 6, y - 15]], true), RED, 0.9) + F(pd([[x - 20, y - 2], [x - 14, y - 5], [x - 14, y - 2]], true), RED, 0.85);
    }
    return s;
  }
  // loincloth: belt of gold discs and a long flap; `rag` gives a torn hem
  function loin(c, col, trim, rag) {
    var d = rag ? 'M50,84 L78,84 L76,94 L73,108 L69,102 L66,111 L62,103 L58,109 L54,94 Z' : 'M50,84 L78,84 L76,94 L71,110 L57,110 L52,94 Z';
    var o = body(c, d, col, F('M68,82 L82,82 L82,112 L66,112 Z', dk(col, 0.3), 0.7) + (trim ? L('M54,100 L57,106 L64,102 L71,106 L74,100', trim, 1.6) : ''), 1.8);
    o += L('M49,86 L79,86', OL, 4.6) + L('M49,86 L79,86', rag ? '#5a4a36' : '#6a3a1e', 2.8);
    if (!rag) [54, 64, 74].forEach(function (x) { o += C(x, 86, 2.4, c.cel(GOLD), 1); });
    return o;
  }
  // ---- desert troll (facing left): tall, hunched, bent digitigrade legs, long arms ----
  function dTroll(c, o) {
    var sk = o.skin || TSKIN;
    return biped(c, {
      skin: sk, shirt: o.shirt || sk, pants: sk, sleeve: o.sleeve || sk, forearm: o.forearm || sk, glove: o.glove, feet: toes2, boots: o.boots || dk(sk, 0.25), digi: true, legW: o.legW || 9.5, armW: o.armW || 8.5,
      hx: o.hx || 44, hy: o.hy || 38, hipY: 86, neckCol: sk, shadowR: o.shadowR || 34,
      torsoD: o.torsoD || 'M42,56 C44,44 70,40 82,48 L82,68 L76,88 L52,88 L46,72 Z',
      head: function (c, x, y) { return dtHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); },
      back: o.back, chest: function (c) { return L('M58,66 Q64,70 70,66', dk(o.shirt || sk, 0.3), 1.4) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return (o.skirt ? o.skirt(c) : loin(c, o.loin || RED, o.loinTrim === undefined ? GOLD : o.loinTrim, o.rag)) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top, shins: o.shins,
      near: o.near || [[46, 58], [36, 76], [30, 92]], far: o.far || [[80, 54], [90, 72], [92, 90]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf || at(0.98, 64, 122)
    });
  }
  // gold scarab, wings spread by `open` (0 closed .. 1 wide), facing up
  function scarab(c, x, y, s, open) {
    var o = '', w = open || 0;
    if (w) {
      o += P('M' + pt([x - 2 * s, y]) + 'C' + pt([x - 12 * s * w - 4 * s, y - 10 * s]) + ' ' + pt([x - 22 * s * w - 4 * s, y - 2 * s]) + ' ' + pt([x - 20 * s * w - 4 * s, y + 6 * s]) + 'C' + pt([x - 12 * s * w, y + 4 * s]) + ' ' + pt([x - 6 * s, y + 6 * s]) + ' ' + pt([x - 2 * s, y + 4 * s]) + 'Z', c.cel(TURQ), 1.3 * s);
      o += P('M' + pt([x + 2 * s, y]) + 'C' + pt([x + 12 * s * w + 4 * s, y - 10 * s]) + ' ' + pt([x + 22 * s * w + 4 * s, y - 2 * s]) + ' ' + pt([x + 20 * s * w + 4 * s, y + 6 * s]) + 'C' + pt([x + 12 * s * w, y + 4 * s]) + ' ' + pt([x + 6 * s, y + 6 * s]) + ' ' + pt([x + 2 * s, y + 4 * s]) + 'Z', c.cel(dk(TURQ, 0.1)), 1.3 * s);
      o += L('M' + pt([x - 4 * s, y + 1 * s]) + 'Q' + pt([x - 12 * s * w - 4 * s, y - 4 * s]) + ' ' + pt([x - 18 * s * w - 4 * s, y + 3 * s]) + 'M' + pt([x + 4 * s, y + 1 * s]) + 'Q' + pt([x + 12 * s * w + 4 * s, y - 4 * s]) + ' ' + pt([x + 18 * s * w + 4 * s, y + 3 * s]), GOLD, 1 * s);
    }
    o += L('M' + pt([x - 4 * s, y + 2 * s]) + 'l' + n(-4 * s) + ',' + n(3 * s) + 'M' + pt([x + 4 * s, y + 2 * s]) + 'l' + n(4 * s) + ',' + n(3 * s) + 'M' + pt([x - 4 * s, y + 6 * s]) + 'l' + n(-4 * s) + ',' + n(4 * s) + 'M' + pt([x + 4 * s, y + 6 * s]) + 'l' + n(4 * s) + ',' + n(4 * s), OL, 1.4 * s);
    o += E(x, y + 5 * s, 5.6 * s, 7 * s, c.cel(GOLD), 1.4 * s) + L('M' + pt([x, y + 0 * s]) + 'L' + pt([x, y + 12 * s]), GOLDD, 1 * s);
    o += E(x, y - 3 * s, 4 * s, 3 * s, c.cel(GOLDD), 1.2 * s) + L('M' + pt([x - 2 * s, y - 5 * s]) + 'l' + n(-2 * s) + ',' + n(-3 * s) + 'M' + pt([x + 2 * s, y - 5 * s]) + 'l' + n(2 * s) + ',' + n(-3 * s), OL, 1 * s);
    return o + C(x - 1.6 * s, y + 3 * s, 1.2 * s, '#fff4c0', 0, 0.8);
  }
  function shadowOrb(c, x, y, r) {
    var o = C(x, y, r * 4, glow(c, SHADOW, 0.75)), d = '';
    for (var i = 0; i < 5; i++) { var a = i * PI * 2 / 5 + 0.4; d += 'M' + pt([x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1]) + 'Q' + pt([x + Math.cos(a + 0.6) * r * 2.2, y + Math.sin(a + 0.6) * r * 2.2]) + ' ' + pt([x + Math.cos(a + 1.1) * r * 2.8, y + Math.sin(a + 1.1) * r * 2.8]); }
    return o + L(d, '#2a0a3a', 2.6) + L(d, lt(SHADOW, 0.2), 1.1) + C(x, y, r, c.rg([[0, '#f0e0ff'], [0.4, SHADOW], [1, '#2a0a4a']]), 1.4);
  }
  function staff(c, bot, top, col) { var d = 'M' + pt(bot) + 'L' + pt(top); return limb(d, col || '#6a4428', 3.2) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }
  // a hooked serpent staff for the shadowcasters
  function serpentStaff(c, bot, top) {
    var x = top[0], y = top[1], o = staff(c, bot, top, '#4a2a1e');
    var T = taper([[x, y + 4], [x - 2, y - 6], [x - 10, y - 12], [x - 16, y - 6], [x - 13, y + 1]], 4.4, 2.6, 5);
    o += P(T.d, c.cel('#5a3a2a'), 1.4) + L(bands(T, 3), GOLD, 1);
    return o + C(x - 8, y - 4, 12, glow(c, SHADOW, 0.6)) + P(pd([[x - 8, y - 9], [x - 4, y - 4], [x - 8, y + 1], [x - 12, y - 4]], true), c.rg([[0, '#f0e0ff'], [1, SHADOW]]), 1.2);
  }
  function skullStaff(c, bot, top, col) {
    var d = 'M' + pt(bot) + 'L' + pt(top), x = top[0], y = top[1];
    var o = limb(d, '#6a4a2a', 3.4) + L(d, '#9a7a50', 1, 0.6) + C(x, y - 6, 22, glow(c, col, 0.55));
    o += P(pd([[x - 6, y - 8], [x - 12, y - 22], [x - 3, y - 12]], true), c.cel('#e8dcc0'), 1.1) + P(pd([[x + 6, y - 8], [x + 12, y - 22], [x + 3, y - 12]], true), c.cel('#e8dcc0'), 1.1);
    o += skull(c, x, y - 4, 1.3) + gEye(c, x - 3.4, y - 5.3, 1.1, col) + gEye(c, x + 3.4, y - 5.3, 1.1, col);
    return o + feathers(x - 1, y + 4, [RED, '#1a1009', GOLD], 0.6, 0.2) + L('M' + pt([x - 3, y + 6]) + 'L' + pt([x + 3, y + 8]), OL, 1.4);
  }
  // staff of basilisk vertebrae crowned with a basilisk skull (facing left)
  function basiliskStaff(c, bot, top) {
    var x = top[0], y = top[1], dx = top[0] - bot[0], dy = top[1] - bot[1], o = limb('M' + pt(bot) + 'L' + pt(top), '#d8ccac', 3.4);
    for (var i = 1; i < 9; i++) { var t = i / 9; o += E(bot[0] + dx * t, bot[1] + dy * t, 3.4, 2.2, c.cel(BONE), 1.1); }
    o += C(x - 6, y - 2, 20, glow(c, '#9aff6a', 0.4));
    var sk = 'M' + pt([x + 8, y - 6]) + 'C' + pt([x + 2, y - 13]) + ' ' + pt([x - 10, y - 12]) + ' ' + pt([x - 18, y - 6]) + 'L' + pt([x - 26, y - 2]) + 'C' + pt([x - 28, y + 1]) + ' ' + pt([x - 26, y + 3]) + ' ' + pt([x - 22, y + 3]) + 'L' + pt([x - 6, y + 3]) + 'C' + pt([x + 2, y + 4]) + ' ' + pt([x + 8, y + 2]) + ' ' + pt([x + 8, y - 6]) + 'Z';
    o += P(pd([[x - 4, y + 3], [x - 22, y + 6], [x - 18, y + 9], [x + 2, y + 6]], true), c.cel(dk(BONE, 0.1)), 1.4);
    o += body(c, sk, BONE, F(pd([[x - 2, y - 14], [x + 10, y - 14], [x + 10, y + 5], [x, y + 5]], true), '#b8a888', 0.7), 1.8);
    o += L('M' + pt([x - 24, y + 3]) + 'l1.4,2.4 M' + pt([x - 20, y + 3]) + 'l1,2.6 M' + pt([x - 16, y + 3]) + 'l1,2.6 M' + pt([x - 12, y + 3]) + 'l1,2.4', OL, 1.1);
    [[2, -10, -0.2], [-4, -12, -0.5], [-10, -10, -0.8]].forEach(function (b) { var a = -PI / 2 + b[2]; o += P(pd([[x + b[0] - 2.2, y + b[1] + 1], [x + b[0] + Math.cos(a) * 10 + 3, y + b[1] + Math.sin(a) * 10], [x + b[0] + 2.2, y + b[1] + 1]], true), c.cel('#8aa06a'), 1.1); });
    o += E(x - 8, y - 5, 3.2, 2.6, '#1a0e08', 1) + gEye(c, x - 8, y - 5, 1.3, '#9aff6a');
    return o;
  }
  function wrapStrip(d) { return L(d, OL, 4.2) + L(d, '#e6dabc', 2.4); }

  // ---- goblin — copy of the art_stranglethorn.js rig, with a captain's hat and an eyepatch ----
  function gobHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    s += L(ellD(x + 22, y - 7, 1.8, 2.2), OL, 2.2) + L(ellD(x + 22, y - 7, 1.8, 2.2), GOLD, 1.1);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8) + (o.scar ? L('M' + pt([x + 2, y - 2]) + 'L' + pt([x + 8, y + 10]), dk(sk, 0.45), 1.3) : ''));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.patch) s += L('M' + pt([x - 11, y - 8]) + 'L' + pt([x + 12, y - 1]), OL, 1.6) + E(x - 5, y - 4, 3.6, 3.2, '#1a1414', 1.2);
    else s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    if (o.grin) s += P('M' + pt([x - 13, y + 8]) + 'Q' + pt([x - 6, y + 15]) + ' ' + pt([x + 3, y + 8]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 13, y + 8]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 11, y + 9]) + 'L' + pt([x + 1, y + 9]), '#f4ecd6', 1.6) + R(x - 7, y + 8.2, 2.6, 2.6, '#ffd040', 0.8);
    else s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), OL, 3.6) + L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), '#7a4a2a', 2) + C(x - 21, y + 13.3, 1.3, '#ff8a3a') + smoke(x - 24, y + 6, 0.3, '#c8c8c8', 0.6, -1);
    var hc = o.hat || '#3a2a22';
    // captain's hat: wide cocked brim, low crown, a red plume
    s += feather(c, x + 8, y - 16, -PI / 2 + 1.2, 22, o.plume || RED, '#f4ecd6');
    s += body(c, 'M' + pt([x - 10, y - 10]) + 'C' + pt([x - 10, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 10]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.3), 0.8) + L('M' + pt([x - 10, y - 13]) + 'L' + pt([x + 13, y - 13]), GOLD, 2), 2);
    s += P('M' + pt([x - 22, y - 12]) + 'C' + pt([x - 14, y - 7]) + ' ' + pt([x + 12, y - 6]) + ' ' + pt([x + 24, y - 12]) + 'C' + pt([x + 20, y - 8]) + ' ' + pt([x + 8, y - 10]) + ' ' + pt([x + 1, y - 10]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 16, y - 8]) + ' ' + pt([x - 22, y - 12]) + 'Z', c.cel(dk(hc, 0.1)), 1.6);
    s += L('M' + pt([x - 21, y - 11.4]) + 'C' + pt([x - 14, y - 8]) + ' ' + pt([x + 12, y - 7.4]) + ' ' + pt([x + 23, y - 11.4]), GOLD, 1.1) + C(x - 1, y - 14, 1.8, c.cel(GOLD), 0.8);
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', buckle: o.buckle, glove: o.glove,
      hx: o.hx || 56, hy: o.hy || 32, hipY: 86, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, o), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top, legN: o.legN, legF: o.legF, footN: o.footN, footF: o.footF,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, shins: o.shins,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }
  function blunderbuss(c, p) {
    var q0 = dirQ(p, PI + 0.06), q = function (u, v) { return q0(u, -v); }, wood = '#6a3e22', o = '';
    o += P(pd([q(-4, -3), q(-20, -3), q(-26, 2), q(-24, 7), q(-14, 5), q(-4, 3)], true), c.cel(wood), 1.6);
    o += limb('M' + pt(q(-6, -1)) + 'L' + pt(q(30, -1)), BRONZE, 4.2) + L('M' + pt(q(-4, -2.4)) + 'L' + pt(q(30, -2.4)), lt(BRONZE, 0.4), 1, 0.7);
    o += P(pd([q(28, -4), q(38, -8), q(38, 6), q(28, 2)], true), c.cel(BRONZE), 1.6) + E(q(38, -1)[0], q(38, -1)[1], 1.6, 6.6, '#2a1a10', 1.2);
    return o + L('M' + pt(q(6, -3.6)) + 'L' + pt(q(6, 1.6)) + 'M' + pt(q(18, -3.6)) + 'L' + pt(q(18, 1.6)), GOLDD, 1.6) + L('M' + pt(q(-2, 2)) + 'Q' + pt(q(-4, 7)) + ' ' + pt(q(-8, 3)), OL, 1.4);
  }
  function cutlass(c, p, ang) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-6, 0)) + 'L' + pt(q(4, 0)), '#3a2418', 3.4);
    o += L('M' + pt(q(4, -5)) + 'Q' + pt(q(-4, -8)) + ' ' + pt(q(-7, 0)), OL, 3.4) + L('M' + pt(q(4, -5)) + 'Q' + pt(q(-4, -8)) + ' ' + pt(q(-7, 0)), GOLD, 1.8);
    var bl = 'M' + pt(q(4, -3)) + 'Q' + pt(q(22, -5)) + ' ' + pt(q(36, 2)) + 'Q' + pt(q(24, 4)) + ' ' + pt(q(4, 3)) + 'Z';
    return o + P(bl, c.cel('#d4dae2'), 1.6) + L('M' + pt(q(8, -2)) + 'Q' + pt(q(22, -3.6)) + ' ' + pt(q(32, 1)), '#ffffff', 0.9, 0.7);
  }

  // ---- the hydra (facing left) ----
  function hydraHead(c, x, y, s, open, col) {
    col = col || ICE; open = open == null ? 1 : open;
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '', m = 6 * open;
    // frost frill behind the head
    [[2, -7, -1.2, 12], [7, -5, -0.7, 13], [10, 0, -0.2, 10]].forEach(function (f) { var a = f[2] - PI / 2 + 0.9, t = q(f[0] + Math.cos(a) * f[3], f[1] + Math.sin(a) * f[3]); o += P(pd([q(f[0] - 2.4, f[1] + 1.4), t, q(f[0] + 2.4, f[1] - 1)], true), c.cel(FROST), 1.3 * s); });
    o += P(pd([q(-4, 1), q(-25, 1), q(-22, 5 + m)], true), '#4a1a2a', 1 * s);
    var jaw = 'M' + pt(q(2, 2)) + 'L' + pt(q(-22, 4 + m)) + 'C' + pt(q(-25, 7 + m)) + ' ' + pt(q(-19, 9 + m)) + ' ' + pt(q(-14, 8 + m)) + 'L' + pt(q(4, 7)) + 'Z';
    o += L('M' + pt(q(-20, 3.6 + m)) + 'l1.2,-2.6 M' + pt(q(-15, 3 + m * 0.8)) + 'l1.2,-2.6 M' + pt(q(-10, 2.6 + m * 0.6)) + 'l1,-2.4', '#ffffff', 1.3 * s);
    o += body(c, jaw, dk(col, 0.08), F(pd([q(-26, 7 + m), q(6, 5), q(6, 10), q(-26, 12 + m)], true), FROST, 0.55), 1.6 * s);
    var hd = 'M' + pt(q(6, -6)) + 'C' + pt(q(-2, -12)) + ' ' + pt(q(-14, -11)) + ' ' + pt(q(-21, -6)) + 'L' + pt(q(-28, -2)) + 'C' + pt(q(-30, 1)) + ' ' + pt(q(-28, 2.4)) + ' ' + pt(q(-25, 2)) + 'L' + pt(q(-6, 2)) + 'C' + pt(q(0, 4)) + ' ' + pt(q(7, 3)) + ' ' + pt(q(7, -2)) + 'Z';
    o += body(c, hd, col, F(pd([q(-2, -14), q(10, -14), q(10, 6), q(0, 6)], true), dk(col, 0.25), 0.8) + F(pd([q(-28, 0), q(-6, 0), q(-6, 3), q(-28, 3)], true), FROST, 0.5), 1.8 * s);
    o += L('M' + pt(q(-24, 2)) + 'l1.4,2.6 M' + pt(q(-19, 2)) + 'l1.2,2.8 M' + pt(q(-14, 2)) + 'l1.2,2.8 M' + pt(q(-9, 2)) + 'l1,2.4', OL, 2.4 * s) + L('M' + pt(q(-24, 2)) + 'l1.4,2.6 M' + pt(q(-19, 2)) + 'l1.2,2.8 M' + pt(q(-14, 2)) + 'l1.2,2.8 M' + pt(q(-9, 2)) + 'l1,2.4', '#ffffff', 1.1 * s);
    o += E(q(-26, -2)[0], q(-26, -2)[1], 1 * s, 0.8 * s, OL);
    o += L('M' + pt(q(-16, -9)) + 'L' + pt(q(-6, -8)), OL, 2.4 * s) + C(q(-11, -5)[0], q(-11, -5)[1], 2.4 * s, '#ffe060', 1 * s) + E(q(-11, -5)[0], q(-11, -5)[1], 0.7 * s, 1.8 * s, OL);
    return o + P(pd([q(-17, -9), q(-13, -16), q(-10, -9)], true), c.cel(FROST), 1.1 * s);
  }
  function iceSpikes(c, T, from, to, every, h) {
    var o = '';
    for (var i = from; i < to; i += every) { var a = T.a[i], b = T.a[Math.min(T.a.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1; o += P(pd([a, [a[0] - dy / d * h + dx / d * 2, a[1] + dx / d * h + dy / d * 2], b], true), c.cel(FROST), 1.2); }
    return o;
  }


  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    sandfury_blood_drinker: function (c) {
      var sk = TSKIN;
      return dTroll(c, {
        paint: 'blood', crest: true, hat: 'band', noseRing: true, legW: 10, armW: 9,
        loin: RED, loinTrim: GOLD,
        chest: function (c) { return F('M50,52 L60,50 L64,72 L58,74 Z', RED, 0.85) + F('M66,50 L74,52 L70,66 Z', RED, 0.7) + L('M48,50 Q62,62 80,50', OL, 3) + L('M48,50 Q62,62 80,50', '#6a3a1e', 1.6) + P(pd([[56, 56], [60, 62], [64, 56]], true), c.cel(BONE), 1) + P(pd([[66, 56], [70, 61], [73, 55]], true), c.cel(BONE), 1); },
        pads: function (c) { return P('M34,58 C32,46 44,42 54,48 L50,60 C46,56 40,56 34,58 Z', c.cel('#8a5a34'), 1.8) + P(pd([[36, 50], [30, 42], [40, 47]], true), c.cel(BONE), 1.1) + P(pd([[44, 46], [42, 37], [48, 45]], true), c.cel(BONE), 1.1) + C(44, 53, 1.6, GOLD, 0.7); },
        shins: function (c) { return L('M58,106 l6,2 M54,111 l6,1', GOLD, 2) + L('M74,102 l6,-1', GOLD, 2); },
        near: [[46, 58], [34, 70], [24, 62]], wNear: function (c, p) { return axe(c, [p[0] + 3, p[1] + 5], 28, -PI / 2 - 0.62, 11, '#c8ccd2', false, '#5a2a1a'); },
        far: [[80, 54], [94, 50], [100, 38]], wFar: function (c, p) { return axe(c, [p[0] + 1, p[1] + 5], 26, -PI / 2 + 0.2, 10, '#b8bcc4', false, '#4a2216'); }
      });
    },
    sandfury_shadowcaster: function (c) {
      var rb = '#5a1e36';
      return dTroll(c, {
        hat: 'hood', hoodCol: '#3e1a34', dreads: 2, paint: 'white', glow: true, eye: SHADOW,
        shirt: rb, sleeve: rb, forearm: TSKIN, armW: 9,
        chest: function (c) { return L('M52,48 L64,62 L78,48', GOLD, 1.8) + C(64, 64, 2.6, c.cel(TURQ), 1) + L('M50,76 L78,76', GOLD, 1.4); },
        skirt: function (c) {
          var d = 'M49,82 L79,82 C84,92 88,100 90,108 L38,108 C40,100 44,92 49,82 Z';
          return body(c, d, rb, F('M68,80 L94,80 L94,112 L74,112 C74,98 72,90 68,80 Z', dk(rb, 0.3), 0.8) + L('M39,105 L89,105', GOLD, 2.4) + L('M56,88 L50,104 M64,88 L64,104 M72,88 L78,104', dk(rb, 0.3), 1.1), 2) + L('M48,84 L80,84', OL, 4.4) + L('M48,84 L80,84', GOLD, 2.4);
        },
        near: [[46, 60], [32, 68], [20, 58]], wNearFront: function (c, p) { return shadowOrb(c, p[0] - 5, p[1] - 11, 5.4); },
        far: [[80, 54], [90, 70], [90, 86]], wFar: function (c, p) { return serpentStaff(c, [p[0] + 3, 121], [p[0] - 3, 16]); }
      });
    },
    zul_farrak_zombie: function (c) {
      var sk = '#a8a084';
      return dTroll(c, {
        skin: sk, hair: '#8a8472', dreads: 2, paint: 'dead', jaw: true, earring: false, glow: true, eye: '#d8ff6a', tusk: 0.8,
        loin: '#6a5a44', loinTrim: null, rag: true, boots: dk(sk, 0.3),
        tf: 'matrix(0.98,0,0,0.98,1.3,2.4) rotate(-5 64 122)',
        chest: function (c) { return L('M52,60 Q60,63 70,60 M52,66 Q60,69 70,66 M54,72 Q61,74 70,72', dk(sk, 0.45), 1.3) + wrapStrip('M44,54 L80,74') + wrapStrip('M46,78 L78,64') + wrapStrip('M48,84 L76,82'); },
        shins: function (c) { return wrapStrip('M55,94 l8,2 M57,101 l8,1') + wrapStrip('M52,108 l6,2'); },
        top: function (c) { return wrapStrip('M26,62 l2,7 M32,62 l2,7') + L('M36,70 Q30,80 34,90', OL, 3.6) + L('M36,70 Q30,80 34,90', '#e6dabc', 2) + wrapStrip('M86,76 l7,-2 M88,84 l7,-1'); },
        near: [[46, 58], [30, 64], [16, 62]], nearHand: function (c, p) { return clawHand(p, sk, 1, '#e0d8c0'); },
        far: [[80, 54], [90, 72], [90, 88]], farHand: function (c, p) { return clawHand(p, dk(sk, 0.1), 0.9, '#e0d8c0'); }
      });
    },
    antu_sul: function (c) {
      var hide = '#6a8a62';
      return G(dTroll(c, {
        hat: 'spikes', dreads: 3, paint: 'white', noseRing: true, legW: 10.5, armW: 9.5, shadowR: 38, tusk: 1.15,
        loin: '#6a3a1e', loinTrim: TURQ,
        back: function (c) {
          var d = 'M48,46 C66,40 86,44 92,54 C100,74 104,96 108,118 L96,114 L88,120 L80,113 L72,118 C72,96 64,70 48,46 Z';
          var sc = ''; for (var yy = 60; yy < 116; yy += 8) for (var xx = 70 + (yy % 16 ? 4 : 0); xx < 106; xx += 8) sc += 'M' + pt([xx - 4, yy]) + 'Q' + pt([xx, yy + 5]) + ' ' + pt([xx + 4, yy]);
          return body(c, d, hide, L(sc, dk(hide, 0.35), 1) + F('M88,50 C98,72 104,96 110,120 L94,120 C90,96 86,72 80,50 Z', dk(hide, 0.3), 0.6), 2.2);
        },
        chest: function (c) { return L('M48,52 Q64,66 80,52', OL, 3.2) + L('M48,52 Q64,66 80,52', '#6a3a1e', 1.8) + P(pd([[58, 58], [62, 66], [66, 58]], true), c.cel(BONE), 1) + C(70, 60, 2.2, c.cel(TURQ), 1) + C(54, 58, 2, c.cel(GOLD), 1); },
        pads: function (c) {
          var p = 'M32,60 C28,44 44,38 56,46 L52,60 C46,56 38,56 32,60 Z', sc = 'M36,52 q3,3 6,0 M42,48 q3,3 6,0 M40,56 q3,3 6,0';
          return body(c, p, hide, L(sc, dk(hide, 0.4), 1), 1.8) + P(pd([[34, 50], [26, 44], [36, 46]], true), c.cel(BONE), 1.1) + P(pd([[40, 45], [36, 36], [44, 43]], true), c.cel(BONE), 1.1) + P(pd([[48, 43], [48, 34], [52, 43]], true), c.cel(BONE), 1.1);
        },
        near: [[46, 58], [34, 68], [22, 66]], nearHand: function (c, p) { return C(p[0], p[1], 4.4, c.cel(TSKIN), 2) + L('M' + pt([p[0] - 3, p[1] - 3]) + 'l-6,-5 M' + pt([p[0] - 4, p[1]]) + 'l-8,-2 M' + pt([p[0] - 3, p[1] + 3]) + 'l-7,2', OL, 3.4) + L('M' + pt([p[0] - 3, p[1] - 3]) + 'l-6,-5 M' + pt([p[0] - 4, p[1]]) + 'l-8,-2 M' + pt([p[0] - 3, p[1] + 3]) + 'l-7,2', TSKIN, 1.6) + C(p[0] - 14, p[1] - 2, 9, glow(c, '#9aff6a', 0.55)); },
        far: [[80, 54], [90, 64], [94, 74]], wFar: function (c, p) { return basiliskStaff(c, [p[0] + 6, 121], [p[0] + 2, 16]); }
      }), at(1.08, 64, 122));
    },
    theka_the_martyr: function (c) {
      return G(dTroll(c, {
        hat: 'scarab', paint: 'gold', glow: true, eye: '#ffd84a', armW: 8, legW: 9,
        torsoD: 'M44,56 C46,45 70,42 80,48 L80,68 L75,88 L53,88 L48,72 Z',
        chest: function (c) {
          var col = 'M44,52 C52,64 74,64 80,50 L78,58 C70,70 52,70 46,60 Z';
          return P(col, c.cel(GOLD), 1.6) + L('M47,57 C54,65 72,65 78,55', TURQ, 1.8) + L('M50,56 l1,4 M56,60 l0,4 M63,61 l0,4 M70,60 l0,4 M76,56 l-1,4', OL, 1) + scarab(c, 62, 70, 0.7, 0.7);
        },
        skirt: function (c) {
          var d = 'M49,82 L79,82 L84,104 L44,104 Z';
          return body(c, d, '#f0e6cc', F('M68,80 L88,80 L88,106 L70,106 Z', '#b8a888', 0.7) + L('M52,86 L48,102 M58,86 L56,102 M64,86 L64,102 M70,86 L72,102 M76,86 L80,102', '#b8a888', 1) + L('M45,101 L83,101', TURQ, 2.4), 1.8) + L('M48,84 L80,84', OL, 4.4) + L('M48,84 L80,84', GOLD, 2.6) + P(pd([[58, 84], [70, 84], [68, 100], [64, 104], [60, 100]], true), c.cel(TURQ), 1.2) + L('M60,90 L64,98 L68,90', GOLD, 1.2);
        },
        near: [[46, 60], [30, 68], [18, 58]], wNearFront: function (c, p) {
          return C(p[0] - 8, p[1] - 8, 20, glow(c, GOLD, 0.45)) + G(scarab(c, p[0] - 14, p[1] - 16, 0.5, 0.8), 'rotate(-30 ' + n(p[0] - 14) + ' ' + n(p[1] - 16) + ')') + G(scarab(c, p[0] - 4, p[1] - 22, 0.42, 0.9), 'rotate(10 ' + n(p[0] - 4) + ' ' + n(p[1] - 22) + ')') + G(scarab(c, p[0] - 18, p[1] - 2, 0.4, 0.6), 'rotate(-70 ' + n(p[0] - 18) + ' ' + n(p[1] - 2) + ')');
        },
        far: [[80, 54], [90, 68], [90, 84]], wFar: function (c, p) { var top = [p[0] - 4, 14]; return staff(c, [p[0] + 3, 121], top, GOLDD) + L('M' + pt([p[0], 60]) + 'L' + pt([p[0] - 1, 50]) + 'M' + pt([p[0] - 1.6, 40]) + 'L' + pt([p[0] - 2.4, 30]), TURQ, 3.2) + C(top[0], top[1], 20, glow(c, GOLD, 0.55)) + C(top[0], top[1] - 2, 9, c.cel('#ff9a2a'), 1.6) + scarab(c, top[0], top[1] - 2, 0.85, 1); },
        top: function (c) { return scarab(c, 44, 116, 0.34, 0) + scarab(c, 98, 118, 0.3, 0); }
      }), at(1.04, 64, 122));
    },
    witch_doctor_zumrah: function (c) {
      return G(dTroll(c, {
        hat: 'skullmask', dreads: 3, hair: '#e8e0c8', earring: true, legW: 9.5, armW: 8.5,
        loinTrim: null,
        skirt: function (c) {
          var d = 'M49,82 L79,82 L84,106 L78,102 L74,108 L68,102 L64,109 L60,102 L54,108 L50,102 L44,106 Z';
          return body(c, d, '#8a8a3a', F('M68,80 L88,80 L88,110 L70,110 Z', '#4a4a1e', 0.6) + L('M52,86 L48,102 M58,86 L56,104 M64,86 L64,106 M70,86 L72,104 M76,86 L80,102', '#5a5a24', 1.1), 1.8) + L('M48,84 L80,84', OL, 4.4) + L('M48,84 L80,84', '#6a3a1e', 2.6) + skull(c, 64, 90, 0.7);
        },
        chest: function (c) {
          var nk = 'M48,52 Q64,68 80,52', o = L(nk, OL, 2.4) + L(nk, '#6a4a2a', 1.2);
          [[52, 57], [58, 61], [64, 62], [70, 61], [76, 57]].forEach(function (b, i) { o += i === 2 ? skull(c, b[0], b[1] + 3, 0.6) : P(pd([[b[0] - 1.6, b[1]], [b[0], b[1] + 6], [b[0] + 1.6, b[1]]], true), c.cel(BONE), 0.9); });
          return o + F('M68,70 l3,-4 l2,5 l3,-3 l0,6 l-8,1 Z', VOO, 0.75);
        },
        pads: function (c) { return P('M34,58 C32,46 44,42 54,48 L50,60 C46,56 40,56 34,58 Z', c.cel('#e0d4b4'), 1.8) + L('M38,52 l4,2 M44,48 l2,4', '#a8987a', 1) + skull(c, 42, 50, 0.6); },
        near: [[46, 58], [34, 60], [24, 52]], wNearFront: function (c, p) { return voodoo(c, p[0] - 8, p[1] - 10, 0.95, VOO); },
        far: [[80, 54], [90, 68], [92, 82]], wFar: function (c, p) { return skullStaff(c, [p[0] + 3, 121], [p[0] - 3, 24], VOO); }
      }), at(1.04, 64, 122));
    },
    gahz_rilla: function (c) {
      var col = ICE, dcol = dk(ICE, 0.2), o = shadow(c, 70, 48);
      // tail
      var TT = taper([[104, 104], [118, 96], [124, 80], [118, 66], [110, 62]], 16, 3, 6);
      o += body(c, TT.d, dcol, L(bands(TT, 3), dk(col, 0.45), 1) + F(ribbonBand(TT, 0.6, 1), FROST, 0.4), 2) + iceSpikes(c, TT, 3, 20, 5, 6);
      // far legs
      o += limb('M96,100 L104,112 L100,118', dk(col, 0.3), 12) + bearPaw(100, 121, dk(col, 0.4)) + limb('M60,100 L66,112 L62,118', dk(col, 0.3), 12) + bearPaw(62, 121, dk(col, 0.4));
      // far neck and head (top)
      var N3 = taper([[80, 78], [86, 56], [80, 34], [70, 22]], 17, 10, 6);
      o += body(c, N3.d, dk(col, 0.12), L(bands(N3, 3), dk(col, 0.45), 1) + F(ribbonBand(N3, 0.65, 1), FROST, 0.35), 2) + iceSpikes(c, N3, 2, 18, 4, 6);
      o += hydraHead(c, 72, 20, 0.9, 0.6, dk(col, 0.1));
      // body
      var bd = 'M44,96 C44,74 64,66 88,68 C108,70 118,84 116,100 C114,114 98,120 78,120 C58,120 44,112 44,96 Z';
      o += body(c, bd, col, F('M86,62 L124,62 L124,124 L92,124 C104,110 104,84 86,62 Z', dk(col, 0.25), 0.8) + F('M48,104 C58,116 88,120 110,110 L110,124 L44,124 Z', FROST, 0.55) + L('M60,86 q6,-4 12,0 M76,80 q6,-4 12,0 M92,82 q6,-4 12,0 M68,96 q6,-4 12,0 M86,94 q6,-4 12,0', dk(col, 0.35), 1.1), 2.4);
      [[58, 72, 8], [72, 66, 10], [88, 66, 11], [104, 72, 9]].forEach(function (k) { o += P(pd([[k[0] - 5, k[1] + 4], [k[0] + 1, k[1] - k[2]], [k[0] + 5, k[1] + 4]], true), c.cel(FROST), 1.4) + L('M' + pt([k[0], k[1] + 2]) + 'L' + pt([k[0] + 1, k[1] - k[2] + 3]), '#ffffff', 0.9, 0.8); });
      // mid neck and head
      var N2 = taper([[62, 82], [52, 60], [40, 46], [30, 40]], 18, 11, 6);
      o += body(c, N2.d, col, L(bands(N2, 3), dk(col, 0.4), 1) + F(ribbonBand(N2, 0.62, 1), FROST, 0.45), 2) + iceSpikes(c, N2, 2, 18, 4, 6);
      o += hydraHead(c, 32, 38, 1, 0.9, col);
      // near legs
      o += limb('M84,104 L92,114 L86,118', col, 13) + bearPaw(86, 121, dk(col, 0.25)) + limb('M52,104 L48,114 L40,118', col, 13) + bearPaw(40, 121, dk(col, 0.25));
      // low neck and head breathing frost
      var N1 = taper([[58, 98], [42, 90], [28, 80], [22, 76]], 18, 11, 6);
      o += body(c, N1.d, lt(col, 0.05), L(bands(N1, 3), dk(col, 0.4), 1) + F(ribbonBand(N1, 0.6, 1), FROST, 0.5), 2);
      o += C(4, 80, 12, glow(c, '#bfefff', 0.6)) + hydraHead(c, 28, 74, 1, 1.2, lt(col, 0.05));
      return G(o + motes(981, 10, 10, 120, 20, 110, '#ffffff'), at(0.94, 70, 122));
    },
    sergeant_bly: function (c) {
      var coat = '#8a2a1e', sk = '#6aa84a';
      return G(gob(c, {
        skin: sk, patch: true, cigar: true, scar: true, hat: '#2e2622', plume: RED,
        shirt: coat, sleeve: coat, forearm: coat, glove: '#3a2418', pants: '#4a3a2e', boots: '#2a1e16', belt: '#3a2418', buckle: GOLD, legW: 11, armW: 9.5, shadowR: 32, scale: 0.9,
        back: function (c) { return body(c, 'M50,64 L82,64 C88,80 92,96 96,112 L84,110 L80,114 L70,108 L60,112 C58,96 54,80 50,64 Z', dk(coat, 0.15), F('M82,62 L100,62 L100,116 L84,116 Z', '#000', 0.25) + L('M62,111 L70,107 L80,113 L84,109 L95,111', GOLD, 1.4), 2); },
        chest: function (c) { return L('M58,50 L58,86', OL, 1.4) + C(62, 58, 1.6, GOLD, 0.7) + C(62, 66, 1.6, GOLD, 0.7) + C(62, 74, 1.6, GOLD, 0.7) + L('M48,52 L78,84', OL, 5.6) + L('M48,52 L78,84', '#5a3a22', 3.6) + L('M54,58 l2,-2 M60,64 l2,-2 M66,70 l2,-2 M72,76 l2,-2', '#e8c060', 2); },
        pads: function (c) { return P('M42,56 C40,46 52,44 58,50 L54,58 Z', c.cel(GOLD), 1.4) + P('M86,56 C88,46 76,44 70,50 L74,58 Z', c.cel(GOLDD), 1.4) + L('M44,58 l0,4 M48,58 l0,4 M52,58 l0,4', GOLD, 1.2); },
        near: [[48, 58], [40, 70], [32, 72]], wNear: function (c, p) { return blunderbuss(c, [p[0] + 2, p[1] - 1]); },
        far: [[80, 56], [92, 46], [96, 34]], wFar: function (c, p) { return cutlass(c, p, -PI / 2 - 0.4); }
      }), at(1.02, 64, 122));
    },
    chief_ukorz_sandscalp: function (c) {
      return G(dTroll(c, {
        hat: 'crown', dreads: 3, paint: 'war', tuskCap: true, tusk: 1.25, earring: true, noseRing: true, legW: 11.5, armW: 10.5, shadowR: 42, hy: 42,
        torsoD: 'M38,58 C40,44 72,40 86,48 L86,68 L78,88 L50,88 L44,74 Z',
        loin: RED, loinTrim: GOLD,
        back: function (c) { return body(c, 'M48,50 C66,44 84,46 90,54 C100,74 106,96 112,120 L100,116 L92,121 L82,116 L72,120 C70,98 62,72 48,50 Z', RED, F('M90,52 C100,74 108,96 114,122 L96,122 C92,96 88,72 82,52 Z', '#5a0e0e', 0.55) + L('M74,119 L82,115 L92,120 L100,115 L110,119', GOLD, 1.8), 2.2); },
        chest: function (c) { return L('M44,54 L76,86 M84,52 L60,84', OL, 5) + L('M44,54 L76,86 M84,52 L60,84', '#6a3a1e', 3) + C(66, 70, 5.4, c.cel(GOLD), 1.6) + C(66, 70, 2.2, c.cel(RED), 1) + F('M50,62 l6,-2 l1,4 Z M74,58 l6,1 l-2,4 Z', RED, 0.9); },
        pads: function (c) {
          var o = pauldron(c, 84, 50, 12, GOLD, RED) + pauldron(c, 44, 54, 15, GOLD, RED);
          [[34, 46, -0.7], [42, 42, -0.25], [50, 42, 0.2]].forEach(function (b) { var a = -PI / 2 + b[2]; o += P(pd([[b[0] - 2.6, b[1] + 2], [b[0] + Math.cos(a) * 13, b[1] + Math.sin(a) * 13], [b[0] + 2.6, b[1] + 2]], true), c.cel(BONE), 1.2); });
          return o;
        },
        shins: function (c) { return L('M58,104 l6,2 M54,110 l6,1 M74,102 l6,-1', GOLD, 2.4); },
        near: [[46, 60], [42, 74], [40, 82]], nearHand: gauntlet('#6a3a1e'),
        far: [[82, 56], [76, 70], [62, 70]], farHand: gauntlet('#5a3018'),
        wNear: function (c, p) { return axe(c, [p[0], p[1]], 60, -PI / 2 + 0.74, 20, '#c8ccd2', true, '#4a2216') + (function () { var q = dirQ([p[0], p[1]], -PI / 2 + 0.74); return L('M' + pt(q(20, 0)) + 'L' + pt(q(26, 0)) + 'M' + pt(q(34, 0)) + 'L' + pt(q(40, 0)), OL, 5.6) + L('M' + pt(q(20, 0)) + 'L' + pt(q(26, 0)) + 'M' + pt(q(34, 0)) + 'L' + pt(q(40, 0)), RED, 3.6); })(); }
      }), at(1.12, 64, 122));
    }
  };
  function pauldron(c, x, y, r, col, trim) {
    col = col || '#b8bec8';
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(SANDM), 2.5); }
  function phScene(c) { return desertSky(c) + ground(c, 150, SANDM, SANDD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#d0a062"/></svg>'; }
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
