/* art_icons3.js - profession, material and crafted item icons plus gathering nodes for Realm of Loner.
 * Loads AFTER art.js (and art_icons2.js / zone packs) and EXTENDS window.ART:
 *   ART.icon(key)  handles the keys below and falls through to the previous ART.icon for every other key.
 *                  Keys are appended to ART.keys.icons.
 *   ART.node(key)  NEW: a 96x96 gathering node (ore outcrop or herb clump) on a transparent background with a soft
 *                  ground shadow, meant to sit on a 400x240 zone scene at about 40-50px wide. Unknown keys return a
 *                  neutral placeholder. ART.keys.nodes lists the keys.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js item icons: 64x64, dark radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Node style matches the zone scene art (cel shading, bold outline).
 * Gradient ids use the prefix i3<counter>_ so they never collide.
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};

  /* ================= helpers (copied from art.js) ================= */
  var UID = 0;
  var OL = '#1a1009';
  var GOLD = '#d6a53c', WOOD = '#7a5230', LEATH = '#5a3a22';
  var STEEL = ['#f4f7fa', '#c2cad3', '#7c8793'];
  var ITEM_BG = ['#3a3440', '#0e0c12'];
  function r1(v) { v = +v; return isFinite(v) ? Math.round(v * 10) / 10 : 0; }
  function rgb(c) {
    c = String(c || '').replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var v = parseInt(c, 16); if (isNaN(v)) v = 0x808080;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function hex(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var A = rgb(a), B = rgb(b); return hex([0, 1, 2].map(function (i) { return A[i] + (B[i] - A[i]) * t; })); }
  function lt(c, t) { return mix(c, '#ffffff', t); }
  function dk(c, t) { return mix(c, '#000000', t); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function Ctx() { this.u = 'i3' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.nid = function () { return this.u + '_' + (this.k++).toString(36); };
  function stopsXml(st) {
    return st.map(function (s, i) {
      if (typeof s === 'string') s = [st.length === 1 ? 0 : Math.round(i / (st.length - 1) * 1000) / 1000, s];
      return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>';
    }).join('');
  }
  Ctx.prototype.lg = function (st, x1, y1, x2, y2) {
    if (x1 == null) { x1 = 0; y1 = 0; x2 = 0; y2 = 1; }
    var key = 'l' + JSON.stringify(st) + [x1, y1, x2, y2].join();
    if (this.cache[key]) return this.cache[key];
    var id = this.nid();
    this.defs.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stopsXml(st) + '</linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.rg = function (st, cx, cy, r) {
    if (cx == null) { cx = 0.5; cy = 0.5; r = 0.5; }
    var key = 'r' + JSON.stringify(st) + [cx, cy, r].join();
    if (this.cache[key]) return this.cache[key];
    var id = this.nid();
    this.defs.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stopsXml(st) + '</radialGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.cel = function (c) { return this.lg([[0, lt(c, 0.3)], [0.4, c], [0.72, c], [1, dk(c, 0.38)]], 0.2, 0, 0.8, 1); };
  Ctx.prototype.clip = function (d) { var id = this.nid(); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return 'url(#' + id + ')'; };
  Ctx.prototype.svg = function (w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + body + '</svg>';
  };

  function stk(sw) { return sw === 0 ? '' : ' stroke="' + OL + '" stroke-width="' + r1(sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function opa(o) { return o != null && o !== 1 ? ' opacity="' + o + '"' : ''; }
  function P(d, fill, sw, o) { return '<path d="' + d + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function F(d, fill, o) { return P(d, fill, 0, o); }
  function S(d, col, w, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + r1(w) + '" stroke-linecap="round" stroke-linejoin="round"' + opa(o) + '/>'; }
  function S2(d, col, w, o) { return S(d, OL, w + 2.6, o) + S(d, col, w, o); }
  function C(cx, cy, r, fill, sw, o) { return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, o, rot) {
    return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="' + fill + '"' + stk(sw) + opa(o) +
      (rot ? ' transform="rotate(' + r1(rot) + ' ' + r1(cx) + ' ' + r1(cy) + ')"' : '') + '/>';
  }
  function R(x, y, w, h, fill, sw, o, rx) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + stk(sw) + opa(o) + '/>';
  }
  function G(body, tf, o) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + opa(o) + '>' + body + '</g>'; }
  function CG(body, clip) { return '<g clip-path="' + clip + '">' + body + '</g>'; }
  function tr(x, y, a, s) { return 'translate(' + r1(x) + ',' + r1(y) + ')' + (a ? ' rotate(' + r1(a) + ')' : '') + (s != null && s !== 1 ? ' scale(' + s + ')' : ''); }
  function pl(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join(''); }
  /* closed curve through the midpoints of a polygon (soft lumps) */
  function smooth(pts) {
    var n = pts.length, m = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, s = m(pts[n - 1], pts[0]), d = 'M' + r1(s[0]) + ',' + r1(s[1]);
    for (var i = 0; i < n; i++) { var q = m(pts[i], pts[(i + 1) % n]); d += 'Q' + r1(pts[i][0]) + ',' + r1(pts[i][1]) + ' ' + r1(q[0]) + ',' + r1(q[1]); }
    return d + 'Z';
  }
  /* open smooth stroke path through points */
  function curve(pts) {
    var d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
    if (pts.length === 2) return d + 'L' + r1(pts[1][0]) + ',' + r1(pts[1][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var q = i === pts.length - 2 ? pts[i + 1] : [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      d += 'Q' + r1(pts[i][0]) + ',' + r1(pts[i][1]) + ' ' + r1(q[0]) + ',' + r1(q[1]);
    }
    return d;
  }
  /* irregular ring of points around an ellipse */
  function lump(cx, cy, rx, ry, seed, n, jag, a0) {
    var r = rng(seed), p = [];
    for (var i = 0; i < n; i++) { var a = (a0 || 0) + i / n * Math.PI * 2 + (r() - 0.5) * 0.35, k = 1 - jag / 2 + r() * jag; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return p;
  }
  function star(cx, cy, n, ro, ri, rot) {
    var d = '', a;
    for (var i = 0; i < n * 2; i++) {
      a = (rot || 0) + i * Math.PI / n - Math.PI / 2;
      var rr = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * rr) + ',' + r1(cy + Math.sin(a) * rr);
    }
    return d + 'Z';
  }
  function sparkle(x, y, r, col) {
    return F('M' + r1(x) + ',' + r1(y - r) + ' Q' + r1(x + r * 0.15) + ',' + r1(y - r * 0.15) + ' ' + r1(x + r) + ',' + r1(y) + ' Q' + r1(x + r * 0.15) + ',' + r1(y + r * 0.15) + ' ' + r1(x) + ',' + r1(y + r) +
      ' Q' + r1(x - r * 0.15) + ',' + r1(y + r * 0.15) + ' ' + r1(x - r) + ',' + r1(y) + ' Q' + r1(x - r * 0.15) + ',' + r1(y - r * 0.15) + ' ' + r1(x) + ',' + r1(y - r) + ' Z', col);
  }
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75), 0) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72), 0) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      S('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + S('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function glow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]]), 0); }
  function item(c, glyph) { return iconWrap(c, ITEM_BG, glyph); }

  /* ================= shared item parts ================= */
  /* ore chunk: faceted rock (rock colour) with metal bits drawn by bits(clip) */
  function oreChunk(c, rock, seed, bits) {
    var d = pl(lump(32, 37, 24, 18, seed, 9, 0.24, 0.2)) + 'Z', cl = c.clip(d);
    return E(32, 55, 22, 4, '#000', 0, 0.35) + P(d, c.cel(rock), 2.4) +
      CG(F('M0,0 L64,0 L64,24 L38,28 L22,42 L0,48 Z', lt(rock, 0.2), 0.55) + F('M38,28 L64,24 L64,64 L30,64 L33,46 Z', dk(rock, 0.32), 0.75) +
        S('M38,28 L22,42 M38,28 L33,46 M38,28 L44,16', dk(rock, 0.55), 1.3, 0.8) + (bits || ''), cl);
  }
  /* metal nugget: irregular blob with metal gradient + a white point highlight */
  function nug(c, x, y, r, cols, seed) {
    var d = pl(lump(x, y, r, r * 0.8, seed, 6, 0.4)) + 'Z';
    return P(d, c.lg(cols, 0.2, 0, 0.8, 1), 1.5) + C(x - r * 0.3, y - r * 0.3, Math.max(0.8, r * 0.26), '#ffffff', 0, 0.85);
  }
  function crystal(c, x, y, a, s, col) {
    return G(P('M0,2 L-3.4,-4 L0,-13 L3.4,-4 Z', c.lg([lt(col, 0.6), col, dk(col, 0.35)], 0, 0, 1, 0), 1.4) + F('M0,2 L0,-13 L-3.4,-4 Z', '#ffffff', 0.45), tr(x, y, a, s));
  }
  /* tapered prism in a fixed 3/4 view: bottom half-extents (bx,bz), top half-extents (tx,tz), height h */
  function pj(ox, oy, X, Y, Z) { return [ox + X * 0.94 - Z * 0.55, oy + X * 0.3 + Z * 0.45 - Y]; }
  function prism(c, ox, oy, bx, bz, tx, tz, h, col, sw, deco) {
    var p = function (X, Y, Z) { return pj(ox, oy, X, Y, Z); };
    var front = [p(-bx, 0, bz), p(bx, 0, bz), p(tx, h, tz), p(-tx, h, tz)];
    var side = [p(bx, 0, bz), p(bx, 0, -bz), p(tx, h, -tz), p(tx, h, tz)];
    var top = [p(-tx, h, -tz), p(tx, h, -tz), p(tx, h, tz), p(-tx, h, tz)];
    return P(pl(front) + 'Z', c.lg([lt(col, 0.1), col, dk(col, 0.2)], 0, 0, 1, 0), sw) + P(pl(side) + 'Z', c.lg([dk(col, 0.2), dk(col, 0.42)], 0, 0, 1, 0), sw) +
      P(pl(top) + 'Z', c.lg([lt(col, 0.55), lt(col, 0.25)], 0, 0, 1, 1), sw) + (deco ? deco(p) : '');
  }
  function bar(c, col, mark) {
    var one = function (ox, oy) {
      return prism(c, ox, oy, 19, 8, 14, 5, 9, col, 1.8, function (p) {
        var a = p(-12, 9, 3.6), b = p(11, 9, -3.6);
        return S('M' + r1(p(-13, 9, 4.2)[0]) + ',' + r1(p(-13, 9, 4.2)[1]) + ' L' + r1(p(12, 9, 4.2)[0]) + ',' + r1(p(12, 9, 4.2)[1]), '#ffffff', 1.4, 0.75) +
          S('M' + r1(p(-18, 0.6, 7.8)[0]) + ',' + r1(p(-18, 0.6, 7.8)[1]) + ' L' + r1(p(18, 0.6, 7.8)[0]) + ',' + r1(p(18, 0.6, 7.8)[1]), dk(col, 0.5), 1.2, 0.6) +
          (mark ? mark(p, a, b) : '');
      });
    };
    return E(32, 55, 28, 4.5, '#000', 0, 0.35) + G(one(32, 44), 'matrix(1.3,0,0,1.3,-9.6,-12.4)');
  }
  function glass(c) { return c.lg([[0, '#f2fbff', 0.9], [0.45, '#b8d4e4', 0.55], [1, '#6a8aa0', 0.7]], 0, 0, 1, 0); }
  function bubble(x, y, r) { return C(x, y, r, 'none', 0) + '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="0.9" stroke-opacity="0.8"/>'; }
  function cork(c, x, y, w, h) { return P('M' + r1(x - w / 2) + ',' + r1(y + h) + ' L' + r1(x - w / 2 + 1) + ',' + r1(y) + ' L' + r1(x + w / 2 - 1) + ',' + r1(y) + ' L' + r1(x + w / 2) + ',' + r1(y + h) + ' Z', c.cel('#a8763e'), 1.8) + S('M' + r1(x - w / 2 + 2) + ',' + r1(y + 2) + ' L' + r1(x - w / 2 + 2) + ',' + r1(y + h - 1), '#e0b070', 1, 0.8); }
  /* round-bottom potion flask filled to the shoulder with a glowing liquid */
  var FLASK = 'M28.5,15 L35.5,15 L35.5,27 C43,29.5 48,35.5 48,43 C48,52 41,59 32,59 C23,59 16,52 16,43 C16,35.5 21,29.5 28.5,27 Z';
  function potion(c, liq) {
    var cl = c.clip(FLASK);
    return glow(c, 32, 42, 28, liq[1], 0.55) + E(32, 58, 16, 3.5, '#000', 0, 0.35) +
      F(FLASK, glass(c)) +
      CG(R(10, 31, 44, 30, c.lg([lt(liq[1], 0.35), liq[1], liq[2]], 0, 0, 0, 1), 0) + E(32, 31.5, 15, 3, lt(liq[1], 0.5), 0, 0.9) +
        C(38, 48, 6, c.rg([[0, '#ffffff', 0.55], [1, '#ffffff', 0]]), 0) + bubble(25, 46, 2.2) + bubble(30, 38, 1.5) + bubble(39, 40, 1.2) + bubble(34, 53, 1.6), cl) +
      S(FLASK, OL, 2.4) + S('M21,38 C19,44 20,50 24,54', '#ffffff', 2.2, 0.75) + S('M30.5,17 L30.5,26', '#ffffff', 1.3, 0.7) +
      P('M26.5,13 L37.5,13 L37.5,17 L26.5,17 Z', c.lg(STEEL, 0, 0, 1, 0), 1.6) + cork(c, 32, 5, 9, 8);
  }
  /* tall faceted elixir bottle with a wax-sealed stopper */
  var TALL = 'M21,58 L21,33 L28,25 L28,15 L36,15 L36,25 L43,33 L43,58 Z';
  function elixir(c, liq, extra) {
    var cl = c.clip(TALL);
    return glow(c, 32, 40, 28, liq[1], 0.5) + E(32, 58, 12, 3, '#000', 0, 0.35) +
      F(TALL, glass(c)) +
      CG(R(10, 29, 44, 32, c.lg([lt(liq[1], 0.3), liq[1], liq[2]], 0, 0, 1, 0), 0) + E(32, 29.5, 12, 2.2, lt(liq[1], 0.55), 0, 0.9) +
        F('M29,29 L33,29 L33,60 L29,60 Z', '#ffffff', 0.18) + bubble(35, 44, 1.6) + bubble(29, 50, 1.3) + bubble(35, 54, 1), cl) +
      S(TALL, OL, 2.4) + S('M24.5,36 L24.5,55', '#ffffff', 2, 0.75) + S('M39.5,36 L39.5,56', dk(liq[2], 0.3), 1.2, 0.5) +
      P('M26,11 L38,11 L37,16 L27,16 Z', c.cel(liq[3] || '#8a1a1a'), 1.8) + P('M28,4 L36,4 L37,11 L27,11 Z', c.cel(liq[3] || '#8a1a1a'), 1.8) +
      C(32, 13.5, 2.2, lt(liq[3] || '#8a1a1a', 0.3), 1) + (extra || '');
  }
  /* herb helpers */
  function stem(d, col, w, o) { return S(d, OL, w + 2.4, o) + S(d, col, w, o); }
  function blade(c, x, y, a, s, col, w) {
    w = w || 4;
    return G(P('M0,0 C' + w + ',-6 ' + w + ',-18 0,-26 C-' + w + ',-18 -' + w + ',-6 0,0 Z', c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 1, 0), 1.5) + S('M0,-1.5 L0,-22', dk(col, 0.45), 0.9, 0.8), tr(x, y, a, s));
  }
  function flower5(c, x, y, r, petal, mid, sw) {
    var o = '';
    for (var i = 0; i < 5; i++) { var a = -90 + i * 72, rr = a * Math.PI / 180; o += E(x + Math.cos(rr) * r * 0.55, y + Math.sin(rr) * r * 0.55, r * 0.52, r * 0.36, c.lg([lt(petal, 0.5), petal, dk(petal, 0.18)], 0, 0, 1, 1), sw == null ? 1.4 : sw, null, a); }
    return o + C(x, y, r * 0.32, c.rg([[0, '#fff8b0'], [0.6, mid], [1, dk(mid, 0.25)]]), sw == null ? 1.2 : sw);
  }
  function starFlower(c, x, y, r, col, sw) {
    return P(star(x, y, 6, r, r * 0.42, 0.1), c.lg([lt(col, 0.4), col, dk(col, 0.3)], 0.2, 0, 0.8, 1), sw == null ? 1.5 : sw) +
      F(star(x, y, 6, r * 0.55, r * 0.25, 0.1), lt(col, 0.45)) + C(x, y, r * 0.2, '#fff4c0', 0);
  }
  /* serrated leaf pointing up from the origin */
  function sawLeaf(len, w, teeth) {
    var L = [], Rr = [], i;
    for (i = 1; i <= teeth; i++) {
      var t = i / (teeth + 1), wy = Math.sin(t * Math.PI) * w;
      L.push([-wy * 1.15, -len * t + len * 0.04]); L.push([-wy * 0.7, -len * t - len * 0.05]);
      Rr.push([wy * 1.15, -len * t + len * 0.04]); Rr.push([wy * 0.7, -len * t - len * 0.05]);
    }
    return pl([[0, 0]].concat(L, [[0, -len]], Rr.reverse())) + 'Z';
  }
  function thornVine(c, pts, col, w, thorn) {
    var d = curve(pts), o = S(d, OL, w + 2.6) + S(d, col, w) + S(d, lt(col, 0.35), w * 0.3, 0.7);
    for (var i = 1; i < pts.length - 1; i++) {
      var dx = pts[i + 1][0] - pts[i - 1][0], dy = pts[i + 1][1] - pts[i - 1][1], L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L, sd = i % 2 ? 1 : -1;
      var bx = pts[i][0] + nx * sd * w * 0.4, by = pts[i][1] + ny * sd * w * 0.4, tl = thorn || 5;
      o += P(pl([[bx - dx / L * 2.2, by - dy / L * 2.2], [bx + nx * sd * tl + dx / L * 1.5, by + ny * sd * tl + dy / L * 1.5], [bx + dx / L * 2.2, by + dy / L * 2.2]]) + 'Z', '#f0e0c0', 1.1);
    }
    return o;
  }
  /* cloth bolt: a thick cylinder of cloth, spiral end facing the viewer, tail hanging off the front */
  function bolt(c, col, band, tex) {
    var body = 'M14,22 L42,14 C50,12 56,22 56,32 C56,42 50,50 44,48 L16,56 Z';
    var cl = c.clip(body);
    return E(32, 57, 24, 4, '#000', 0, 0.35) +
      P('M20,52 C22,58 30,60 38,58 L40,48 Z', c.cel(dk(col, 0.08)), 2) +
      P(body, c.lg([lt(col, 0.3), col, dk(col, 0.3)], 0, 0, 0.3, 1), 2.4) +
      CG((tex || '') + S('M14,30 L42,22 M14,38 L43,30 M15,46 L44,38', dk(col, 0.25), 1.2, 0.6) +
        R(26, 10, 7, 50, band, 0) + S('M26,10 L26,60 M33,10 L33,60', OL, 1.4), cl) +
      E(16, 39, 7, 17, c.lg([lt(col, 0.25), dk(col, 0.1)], 0, 0, 1, 1), 2.4, null, -15) +
      '<path d="M16,39 m-1.5,0 a1.5,3 -15 1 1 3,0 a3.2,6.5 -15 1 1 -6,0 a5,11 -15 1 1 9,0" fill="none" stroke="' + dk(col, 0.4) + '" stroke-width="1.2" stroke-linecap="round"/>' +
      C(16, 39, 1.8, dk(col, 0.55), 0) + S('M18,24 C13,28 11,36 12,44', '#ffffff', 1.4, 0.5);
  }
  function bag(c, col, s, tie, extra) {
    var b = 'M22,28 C10,34 8,50 16,57 C22,61 42,61 48,57 C56,50 54,34 42,28 Z';
    return G(E(32, 59, 20, 3.5, '#000', 0, 0.35) + P(b, c.cel(col), 2.4) +
      CG(F('M42,28 C54,34 56,50 48,57 C44,60 38,61 34,61 C42,54 46,42 40,28 Z', dk(col, 0.25), 0.8) + F('M22,32 C16,38 14,46 16,52 C18,44 22,38 26,34 Z', '#ffffff', 0.25) + (extra || ''), c.clip(b)) +
      P('M21,21 L24,14 L28,19 L32,13 L36,19 L40,14 L43,21 L40,28 L24,28 Z', c.cel(lt(col, 0.08)), 2.2) + S('M27,21 L27,27 M32,19 L32,27 M37,21 L37,27', dk(col, 0.35), 1, 0.8) +
      S2('M22,28 C28,31 36,31 42,28', tie, 2.4) + S2('M36,30 L39,40 M36,30 L33,39', tie, 1.6) + C(36, 30, 2.6, tie, 1.4) + C(39, 41, 1.8, tie, 1.2) + C(33, 40, 1.8, tie, 1.2), s && s !== 1 ? 'matrix(' + s + ',0,0,' + s + ',' + r1(32 - 32 * s) + ',' + r1(40 - 40 * s) + ')' : '');
  }
  /* tanned leather: an irregular hide sheet rolled up at the front, tied */
  function leatherRoll(c, col, ties) {
    var sheet = 'M10,40 C8,32 12,26 9,18 L16,12 L22,16 L30,10 L38,15 L46,10 L54,15 C52,24 56,32 54,40 Z';
    var roll = 'M9,36 L52,36 L52,53 L9,53 Z', t = '';
    (ties || []).forEach(function (x) { t += R(x, 35, 5, 19, c.cel(col === '#c8945a' ? '#6a4428' : '#c8a870'), 1.6); });
    return E(32, 55, 26, 4, '#000', 0, 0.35) +
      P(sheet, c.cel(col), 2.4) + CG(F('M34,6 L60,6 L60,40 L40,40 C44,30 40,18 34,6 Z', '#000', 0.18) + S('M14,20 C22,24 30,20 36,24 M18,30 C26,32 36,28 46,30', dk(col, 0.25), 1, 0.6), c.clip(sheet)) +
      E(9, 44.5, 4.5, 8.5, c.cel(dk(col, 0.15)), 2.4) +
      P(roll, c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 0, 1), 2.4) + S('M10,39.5 L51,39.5', '#ffffff', 1.3, 0.45) + t +
      E(52, 44.5, 5, 8.5, c.lg([lt(col, 0.2), dk(col, 0.1)], 0, 0, 1, 1), 2.4) +
      '<path d="M52,44.5 m-1,0 a1,2 0 1 1 2,0 a2,4 0 1 1 -4,0 a3.2,6.4 0 1 1 6,0" fill="none" stroke="' + dk(col, 0.5) + '" stroke-width="1.2"/>';
  }
  /* tools */
  function pickaxe(c) {
    return S2('M0,-6 L0,34', '#8a5a30', 4.4) + S('M1,-4 L1,32', '#b88050', 1.3, 0.7) + S('M-2.2,24 L2.2,26 M-2.2,28 L2.2,30', LEATH, 1.6) +
      P('M-24,2 C-14,-10 14,-10 24,2 L22,5 C12,-3 -12,-3 -22,5 Z', c.lg(STEEL, 0, 0, 0, 1), 2.2) +
      R(-4.5, -9, 9, 9, c.lg(['#8a929c', '#4a525c']), 1.8, null, 1.5) + S('M-18,-1 C-10,-7 10,-7 18,-1', '#ffffff', 1.1, 0.8);
  }
  function hammer(c) {
    return S2('M0,-4 L0,30', '#8a5a30', 4.2) + S('M1,-2 L1,28', '#b88050', 1.2, 0.7) + S('M-2.1,22 L2.1,24 M-2.1,26 L2.1,28', LEATH, 1.6) +
      P('M-13,-16 L13,-16 L14,-3 L-14,-3 Z', c.lg(STEEL, 0, 0, 1, 0), 2.4) + P('M13,-15 L18,-13 L18,-6 L13.6,-4 Z', c.lg(STEEL, 0, 0, 1, 0), 2) +
      S('M-11,-13 L10,-13', '#ffffff', 1.3, 0.8) + R(-3.5, -17, 7, 15, c.cel('#6a727c'), 1.6);
  }
  function knife(c, blade) {
    return P('M-3,0 L3,0 L3.5,15 C3.5,18 -3.5,18 -3.5,15 Z', c.cel('#6a4428'), 2) + S('M-3,5 L3,5 M-3,10 L3,10', dk('#6a4428', 0.5), 1.2) +
      P('M-4.5,-2 L4.5,-2 L4.5,1 L-4.5,1 Z', c.cel('#a0a0aa'), 1.6) +
      P(blade || 'M-3,-2 L-3,-14 C-3,-24 4,-32 14,-36 C10,-26 7,-16 3.2,-2 Z', c.lg(STEEL, 0, 0, 1, 0), 2) + S('M-1,-4 L-1,-15 C-1,-22 4,-28 10,-32', '#ffffff', 1, 0.75);
  }
  function sickle(c) {
    return P('M-3,0 L3,0 L3,16 C3,19 -3,19 -3,16 Z', c.cel('#8a5a30'), 2) + S('M-3,6 L3,6 M-3,11 L3,11', LEATH, 1.3) +
      P('M-2.5,1 C-6,-12 0,-28 18,-30 C28,-30 34,-24 34,-18 C28,-24 20,-24 14,-22 C4,-18 2,-8 2.5,1 Z', c.lg(STEEL, 0, 0, 1, 1), 2) + S('M0,-4 C-2,-16 6,-26 18,-27', '#ffffff', 1.1, 0.75);
  }
  function awl(c) {
    return P('M0,-36 L1.8,-10 L-1.8,-10 Z', c.lg(STEEL, 0, 0, 1, 0), 1.4) + P('M-3,-11 L3,-11 L3.4,-7 L-3.4,-7 Z', c.cel(GOLD), 1.5) +
      P('M-4.5,-7 L4.5,-7 L5,10 C5,14 -5,14 -5,10 Z', c.cel('#8a5a30'), 2) + S('M-2.5,-4 L-2.5,10', '#c89060', 1.4, 0.8) + S('M-4.8,2 L4.8,2', dk('#8a5a30', 0.5), 1.2);
  }
  function needle(c, len) {
    len = len || 40;
    return P('M-1.8,' + (-len / 2) + ' C-1.8,' + (-len / 2 - 3) + ' 1.8,' + (-len / 2 - 3) + ' 1.8,' + (-len / 2) + ' L1.2,' + (len / 2 - 4) + ' L0,' + (len / 2) + ' L-1.2,' + (len / 2 - 4) + ' Z', c.lg(STEEL, 0, 0, 1, 0), 1.4) +
      E(0, -len / 2 + 2.6, 0.7, 1.8, OL, 0);
  }

  /* ================= the icons ================= */
  var NEW = {
    /* ---------- profession badges ---------- */
    prof_mining: function (c) {
      return iconWrap(c, ['#6a4a2a', '#140c06'],
        glow(c, 32, 30, 28, '#ffb060', 0.35) +
        G(oreChunk(c, '#7a6a5c', 7, nug(c, 26, 38, 5, ['#ffc890', '#e07a32', '#8a3a10'], 3) + nug(c, 40, 42, 4, ['#ffc890', '#e07a32', '#8a3a10'], 5)), 'translate(14,20) scale(0.6)') +
        G(pickaxe(c), tr(28, 26, -38, 1.08)) +
        sparkle(50, 42, 4, '#fff0c0') + sparkle(56, 34, 2.6, '#ffe0a0'));
    },
    prof_herbalism: function (c) {
      var lf = blade(c, 20, 54, -40, 0.9, '#5aa040') + blade(c, 22, 56, 10, 1, '#4a9038') + blade(c, 28, 56, 50, 0.8, '#5aa040');
      return iconWrap(c, ['#3a5a2a', '#08120a'],
        glow(c, 26, 26, 26, '#d8ffb0', 0.35) + lf +
        stem('M22,56 C22,44 24,34 24,26', '#4a9038', 2.2) + flower5(c, 24, 22, 15, '#f4f4ec', '#f0c020', 1.8) +
        G(sickle(c), tr(42, 44, 20, 1)));
    },
    prof_skinning: function (c) {
      var hide = 'M10,14 L18,10 L24,15 L40,15 L46,10 L54,14 C55,26 52,32 55,42 L48,54 L40,49 L32,56 L24,49 L16,54 L9,42 C12,32 9,26 10,14 Z';
      return iconWrap(c, ['#6a3a24', '#140604'],
        P(hide, c.cel('#b0845a'), 2.2) + CG(F('M22,22 C28,28 36,28 42,22 L42,44 C36,48 28,48 22,44 Z', '#e0c09a', 0.6), c.clip(hide)) +
        S('M18,18 l3,4 M42,18 l3,4 M20,36 l3,3 M40,38 l3,3', '#5a3a22', 1.3) +
        G(knife(c), tr(28, 44, 30, 1.05)));
    },
    prof_blacksmithing: function (c) {
      var anvil = 'M6,34 L46,34 C52,34 58,31 60,28 L60,36 C54,40 48,42 42,42 L39,48 L46,56 L16,56 L23,48 L20,42 L10,42 C7,40 6,37 6,34 Z';
      return iconWrap(c, ['#3a4656', '#0a0e14'],
        glow(c, 34, 30, 22, '#ffa040', 0.7) +
        P(anvil, c.lg(['#8a929c', '#4e5660', '#2a3038']), 2.4) + S('M8,35.5 L46,35.5 C52,35.5 56,33 59,30', '#c8d0da', 1.4, 0.8) +
        E(34, 34, 8, 2, '#ffd080', 0, 0.8) +
        G(hammer(c), tr(40, 22, 40, 1.05)) +
        sparkle(22, 26, 4.5, '#fff0b0') + sparkle(14, 20, 3, '#ffd070') + sparkle(30, 16, 2.6, '#ffe890') + C(20, 30, 1.3, '#ffc040', 0) + C(26, 20, 1.2, '#ffc040', 0));
    },
    prof_alchemy: function (c) {
      var fl = 'M26,10 L38,10 L38,13 L36,13 L36,26 L50,52 C52,56 50,58 46,58 L18,58 C14,58 12,56 14,52 L28,26 L28,13 L26,13 Z';
      var cl = c.clip(fl);
      return iconWrap(c, ['#2a5048', '#060e0c'],
        glow(c, 32, 44, 26, '#8aff90', 0.55) +
        F(fl, glass(c)) +
        CG(F('M10,38 L54,38 L54,60 L10,60 Z', c.lg(['#b0ff80', '#48c83a', '#1a6a1a'])) + E(32, 38.5, 14, 2.4, '#d8ffb0', 0, 0.9) +
          bubble(26, 50, 2.4) + bubble(34, 46, 1.8) + bubble(38, 53, 1.4) + bubble(30, 42, 1.2), cl) +
        S(fl, OL, 2.4) + S('M24,42 L18,53', '#ffffff', 1.8, 0.7) +
        bubble(34, 6, 2.2) + bubble(28, 4, 1.4) + bubble(40, 2, 1.6) + C(34, 6, 2.2, 'none', 0) +
        S2('M30,20 C34,16 30,12 33,8', '#b0ff80', 1.2, 0.8));
    },
    prof_leatherworking: function (c) {
      var hide = 'M8,20 C14,14 24,16 30,12 C38,8 50,12 54,20 C58,30 54,42 56,50 C46,56 30,52 20,56 C12,58 8,48 10,40 C12,32 4,26 8,20 Z';
      return iconWrap(c, ['#5a3e24', '#120a04'],
        P(hide, c.cel('#a0683a'), 2.4) + CG(F('M36,10 L60,10 L60,60 L40,60 C48,46 44,28 36,10 Z', '#000', 0.2), c.clip(hide)) +
        S('M14,24 C20,20 26,22 32,18 C40,14 48,18 50,24 C53,32 50,42 51,48', '#f0d8b0', 1.6, 0.9) + '<path d="M14,24 C20,20 26,22 32,18 C40,14 48,18 50,24 C53,32 50,42 51,48" fill="none" stroke="#5a3418" stroke-width="1.6" stroke-dasharray="3 3"/>' +
        G(awl(c), tr(28, 36, -35, 1.05)));
    },
    prof_tailoring: function (c) {
      var cloth = 'M6,42 C16,36 30,38 40,34 C48,31 54,34 58,38 L58,56 C48,52 36,56 24,56 C16,56 10,54 6,56 Z';
      var thr = 'M41,14 C52,10 58,22 48,28 C36,36 20,24 14,34 C10,40 16,46 22,44';
      return iconWrap(c, ['#4a2a5a', '#0e0614'],
        P(cloth, c.cel('#8a3a9a'), 2.4) + CG(S('M6,48 C18,44 34,46 58,44', '#c070d0', 1.4, 0.7) + F('M34,38 L58,36 L58,58 L30,58 Z', '#000', 0.2), c.clip(cloth)) +
        S2(thr, '#e83a3a', 1.8) + S(thr, '#ff9a8a', 0.6, 0.8) +
        G(needle(c, 44), tr(36, 26, 40, 1)) + sparkle(18, 14, 3.4, '#f0d8ff'));
    },

    /* ---------- ores: one faceted chunk, bright metal bits ---------- */
    copper_ore: function (c) {
      var cu = ['#ffcb98', '#e0742e', '#7a3208'];
      return item(c, oreChunk(c, '#6e5e50', 11,
        S('M14,30 L26,34 L36,28 L50,34', '#7a3208', 5.2) + S('M14,30 L26,34 L36,28 L50,34', '#e88040', 2.8) +
        nug(c, 24, 40, 5.5, cu, 2) + nug(c, 38, 30, 4.5, cu, 4) + nug(c, 44, 44, 4, cu, 6) + nug(c, 18, 30, 3, cu, 8) +
        C(30, 48, 2, '#5aa888', 1) + C(48, 36, 1.6, '#5aa888', 1)));
    },
    tin_ore: function (c) {
      var col = '#e8eef4';
      return item(c, oreChunk(c, '#4e545c', 21,
        crystal(c, 24, 38, -25, 1.1, col) + crystal(c, 30, 36, 5, 1.3, col) + crystal(c, 36, 38, 30, 1.0, col) +
        crystal(c, 44, 46, 55, 0.8, col) + crystal(c, 18, 46, -60, 0.7, col) + C(40, 28, 2, '#d0d8e0', 1) + C(22, 26, 1.6, '#d0d8e0', 1)) +
        sparkle(28, 22, 3, '#ffffff'));
    },
    silver_ore: function (c) {
      var ag = ['#ffffff', '#d8e4f0', '#7a8aa0'];
      return item(c, glow(c, 30, 32, 24, '#a8d8ff', 0.4) + oreChunk(c, '#3e4250', 33,
        S('M12,40 L24,34 L34,40 L50,30', '#6a7a90', 5.6) + S('M12,40 L24,34 L34,40 L50,30', '#f0f6ff', 3) +
        nug(c, 24, 34, 5.5, ag, 3) + nug(c, 36, 42, 5, ag, 5) + nug(c, 46, 32, 4, ag, 7)) +
        C(24, 32, 7, c.rg([[0, '#dff4ff', 0.9], [1, '#8ad0ff', 0]]), 0) + sparkle(24, 32, 7.5, '#ffffff') + sparkle(46, 30, 4, '#c8ecff') + sparkle(14, 22, 2.6, '#c8ecff'));
    },
    /* ---------- bars: a cast ingot ---------- */
    copper_bar: function (c) { return item(c, glow(c, 32, 38, 26, '#ff9a50', 0.25) + bar(c, '#dc7436')); },
    bronze_bar: function (c) {
      return item(c, bar(c, '#9c7a34', function (p) {
        var m = p(0, 9, 0);
        return E(m[0], m[1], 4.5, 2.4, 'none', 0) + '<ellipse cx="' + r1(m[0]) + '" cy="' + r1(m[1]) + '" rx="4.5" ry="2.4" fill="none" stroke="' + dk('#9c7a34', 0.45) + '" stroke-width="1.3"/>';
      }));
    },
    /* tin: a matte pale grey-white bar, no glow or shine (silver has both) */
    tin_bar: function (c) {
      return item(c, bar(c, '#959b9e', function (p) {
        var a = p(-8, 9, -1), b = p(6, 9, 2), q = p(-3, 4.5, 6.5), s = p(9, 3, 6.8);
        return C(a[0], a[1], 1, '#7a8084', 0, 0.8) + C(b[0], b[1], 1.2, '#7a8084', 0, 0.8) + C(q[0], q[1], 1, '#6e7478', 0, 0.8) + C(s[0], s[1], 0.9, '#6e7478', 0, 0.8);
      }));
    },
    silver_bar: function (c) { return item(c, glow(c, 32, 38, 26, '#b8e0ff', 0.35) + bar(c, '#dde6f2') + sparkle(22, 30, 4.5, '#ffffff') + sparkle(44, 26, 3, '#e0f4ff')); },
    /* ---------- stones: plain rock, no metal ---------- */
    rough_stone: function (c) {
      var col = '#a8a49a';
      var a = smooth(lump(28, 40, 19, 14, 5, 8, 0.2)), b = smooth(lump(46, 50, 10, 7, 9, 7, 0.2));
      return item(c, E(32, 56, 24, 4, '#000', 0, 0.35) +
        P(a, c.cel(col), 2.4) + CG(F('M28,20 L60,20 L60,60 L34,60 C40,48 38,34 28,20 Z', dk(col, 0.25), 0.7) + E(22, 32, 7, 3.5, lt(col, 0.45), 0, 0.7), c.clip(a)) +
        S('M20,44 L26,40 L28,46', dk(col, 0.5), 1.3, 0.8) +
        P(b, c.cel(dk(col, 0.05)), 2.2) + E(44, 47, 4, 1.8, lt(col, 0.45), 0, 0.7));
    },
    coarse_stone: function (c) {
      var col = '#6e685e', r = rng(77), sp = '';
      var chunk = function (cx, cy, rx, ry, seed) {
        var d = pl(lump(cx, cy, rx, ry, seed, 6, 0.35)) + 'Z';
        var dots = '';
        for (var i = 0; i < 9; i++) dots += C(cx + (r() - 0.5) * rx * 1.6, cy + (r() - 0.5) * ry * 1.6, 0.7 + r() * 0.8, r() < 0.5 ? '#b0a898' : '#2a2620', 0, 0.9);
        return P(d, c.cel(col), 2.2) + CG(F('M' + (cx - 2) + ',0 L64,0 L64,64 L' + (cx + 4) + ',64 Z', '#000', 0.22) + dots, c.clip(d));
      };
      return item(c, E(32, 56, 24, 4, '#000', 0, 0.35) + chunk(22, 46, 13, 10, 3) + chunk(44, 46, 12, 10, 8) + chunk(33, 30, 13, 11, 12) + sp);
    },
    /* ---------- herbs ---------- */
    peacebloom: function (c) {
      return item(c, blade(c, 22, 58, -45, 0.85, '#5aa040') + blade(c, 42, 58, 45, 0.85, '#5aa040') + blade(c, 32, 58, 0, 0.7, '#4a9038') +
        stem('M32,58 C30,48 24,40 20,30', '#4a9038', 2) + stem('M32,58 C34,46 40,36 44,26', '#4a9038', 2) + stem('M32,58 C32,52 32,48 31,44', '#4a9038', 2) +
        flower5(c, 19, 26, 14, '#fbfbf2', '#f4c020') + flower5(c, 45, 22, 13, '#fbfbf2', '#f4c020') + flower5(c, 31, 43, 10, '#f4f2e6', '#f4c020'));
    },
    silverleaf: function (c) {
      var col = '#a8c4b0', o = '', a;
      var angs = [-62, -40, -18, 4, 26, 48, 68], L = [0.82, 1.0, 1.15, 1.25, 1.12, 0.98, 0.8];
      for (var i = 0; i < angs.length; i++) { a = angs[i]; o += blade(c, 32, 56, a, L[i], i % 2 ? col : lt(col, 0.12), 4.8); }
      return item(c, glow(c, 32, 30, 26, '#e0fff0', 0.3) + o +
        S('M32,56 L32,26', '#6a8a70', 1.4, 0.8) + sparkle(20, 22, 3.2, '#ffffff') + sparkle(46, 16, 2.6, '#ffffff') + sparkle(42, 34, 2, '#ffffff'));
    },
    earthroot: function (c) {
      var col = '#8a5a30';
      var main = 'M34,10 C30,18 36,24 30,32 C24,40 30,46 24,56';
      return item(c, E(32, 58, 18, 3.5, '#000', 0, 0.35) +
        stem('M30,32 C22,34 16,30 10,34 M28,42 C36,44 42,42 50,48 M31,24 C38,22 44,24 48,18 M26,50 C20,52 16,56 12,56', '#7a4e28', 2.6) +
        S(main, OL, 11) + S(main, col, 8) + S('M33,12 C30,19 35,24 30,31', '#c89060', 2, 0.8) +
        C(32, 22, 3.6, c.cel(col), 1.6) + C(27, 40, 3.2, c.cel(col), 1.6) + C(29, 32, 2.6, c.cel(dk(col, 0.1)), 1.4) +
        S('M10,34 L6,32 M50,48 L54,52 M48,18 L52,14 M12,56 L8,58 M18,31 L16,27 M42,43 L44,39', '#6a4424', 1.2) +
        blade(c, 34, 11, -30, 0.45, '#6ab43a') + blade(c, 34, 11, 25, 0.4, '#5aa040') +
        E(22, 54, 5, 2, '#4a3020', 0, 0.8) + E(38, 50, 3.5, 1.5, '#4a3020', 0, 0.7));
    },
    mageroyal: function (c) {
      var col = '#7060e0';
      return item(c, glow(c, 32, 24, 24, '#b0a8ff', 0.3) +
        blade(c, 26, 58, -35, 0.8, '#4a8a44') + blade(c, 38, 58, 35, 0.8, '#4a8a44') +
        stem('M32,58 C32,44 28,32 24,20', '#3a7a3a', 2) + stem('M32,58 C34,46 40,38 44,30', '#3a7a3a', 2) +
        starFlower(c, 23, 18, 12, col) + starFlower(c, 44, 28, 10, lt(col, 0.1)) + starFlower(c, 36, 12, 7, dk(col, 0.05)));
    },
    briarthorn: function (c) {
      var col = '#b8202a';
      var lfR = function (x, y, a, s) { return G(P('M0,0 C4,-4 4,-10 0,-13 C-4,-10 -4,-4 0,0 Z', c.lg(['#e04848', '#8a1420']), 1.4), tr(x, y, a, s)); };
      return item(c, lfR(18, 24, -60, 1) + lfR(46, 40, 80, 1) + lfR(30, 16, 20, 0.9) +
        thornVine(c, [[10, 58], [16, 44], [28, 38], [40, 44], [46, 34], [40, 22], [28, 20], [22, 12], [30, 6]], col, 3.4, 5) +
        thornVine(c, [[30, 58], [40, 52], [52, 50], [56, 38]], dk(col, 0.1), 2.6, 4));
    },
    bruiseweed: function (c) {
      var o = '', angs = [-60, -30, 0, 30, 60], L = [28, 36, 42, 36, 28];
      for (var i = 0; i < angs.length; i++) {
        var d = sawLeaf(L[i], 8.5, 4);
        o += G(P(d, c.lg(['#8a5aa0', '#5a2a6a', '#2e1238'], 0, 0, 1, 0), 1.6) + S('M0,-1 L0,' + (-L[i] + 3), '#8ab848', 1.4) +
          S('M0,' + (-L[i] * 0.35) + ' L-3,' + (-L[i] * 0.5) + ' M0,' + (-L[i] * 0.35) + ' L3,' + (-L[i] * 0.5) + ' M0,' + (-L[i] * 0.62) + ' L-2.4,' + (-L[i] * 0.75) + ' M0,' + (-L[i] * 0.62) + ' L2.4,' + (-L[i] * 0.75), '#7aa040', 0.9, 0.9), tr(32, 56, angs[i]));
      }
      return item(c, E(32, 58, 18, 3.5, '#000', 0, 0.35) + o + C(32, 55, 3.4, '#4a2a50', 1.4));
    },
    /* ---------- leather, hide, cloth ---------- */
    light_leather: function (c) { return item(c, leatherRoll(c, '#c8945a', [30])); },
    medium_leather: function (c) { return item(c, leatherRoll(c, '#6e4426', [20, 38])); },
    light_hide: function (c) {
      var col = '#9a6a3c';
      var hide = 'M10,20 L14,14 L18,18 L24,12 L28,16 L36,10 L40,15 L48,12 L50,18 L56,20 L53,28 L58,34 L52,40 L55,48 L46,50 L42,56 L34,52 L26,57 L22,50 L12,52 L14,44 L7,38 L12,32 L6,26 Z';
      var cl = c.clip(hide), fur = '', r = rng(41);
      for (var i = 0; i < 16; i++) { var x = 12 + r() * 40, y = 16 + r() * 34; fur += 'M' + r1(x) + ',' + r1(y) + ' l' + r1(1.5 + r()) + ',' + r1(3 + r() * 2); }
      return item(c, E(32, 56, 24, 4, '#000', 0, 0.35) + P(hide, c.cel(col), 2.2) +
        CG(S(fur, dk(col, 0.4), 1.2, 0.8) + S(fur.replace(/M(\d+)/g, function (m, v) { return 'M' + (+v + 2); }), lt(col, 0.3), 0.9, 0.6), cl) +
        P('M36,52 L42,56 L46,50 L55,48 L52,40 C46,42 42,46 36,52 Z', c.lg(['#f4d8c4', '#d8a890']), 1.8) + S('M40,50 C44,46 48,44 51,43', '#b8806a', 1, 0.8));
    },
    linen_bolt: function (c) { return item(c, bolt(c, '#e6dcc0', '#b89060')); },
    wool_cloth: function (c) {
      var col = '#8e8e96';
      var sc = 'M10,22 L14,16 L18,20 L22,14 L30,18 L36,12 L42,17 L50,14 L54,22 L50,28 L56,34 L50,40 L54,48 L46,50 L40,56 L34,50 L26,54 L20,48 L12,50 L14,42 L8,36 L12,30 Z';
      var weave = '';
      for (var i = 0; i < 9; i++) weave += 'M0,' + (10 + i * 6) + ' L64,' + (4 + i * 6) + ' ';
      for (var j = 0; j < 9; j++) weave += 'M' + (8 + j * 6) + ',0 L' + (14 + j * 6) + ',64 ';
      return item(c, E(32, 56, 24, 4, '#000', 0, 0.35) + P(sc, c.cel(col), 2.2) +
        CG(S(weave, dk(col, 0.3), 1, 0.55) + F('M36,12 L60,10 L60,60 L34,60 C42,44 40,28 36,12 Z', '#000', 0.18), c.clip(sc)) +
        S('M14,16 l-2,-3 M22,14 l0,-3 M36,12 l1,-3 M50,14 l2,-3 M56,34 l3,0 M40,56 l1,3 M26,54 l-1,3 M8,36 l-3,0', col, 1.4));
    },
    wool_bolt: function (c) {
      var hatch = '';
      for (var i = 0; i < 12; i++) hatch += 'M' + (10 + i * 4) + ',10 L' + (14 + i * 4) + ',60 ';
      return item(c, bolt(c, '#8e8e98', '#3a5a9a', S(hatch, '#5e5e68', 0.9, 0.5)));
    },
    /* wooden spool wound with rough brown thread, a loose end curling off */
    coarse_thread: function (c) {
      var th = '#8a6038', wd = '#c89a60', wind = '';
      for (var i = 0; i < 7; i++) wind += 'M18,' + (22 + i * 4.6) + ' C26,' + (24.5 + i * 4.6) + ' 38,' + (24.5 + i * 4.6) + ' 46,' + (22 + i * 4.6) + ' ';
      var lo = 'M46,40 C54,40 58,48 52,54 C48,58 40,56 38,60';
      return item(c, E(32, 58, 20, 3.5, '#000', 0, 0.35) +
        E(32, 54, 18, 5.5, c.cel(dk(wd, 0.1)), 2.4) +
        P('M18,20 L46,20 L46,52 C38,56 26,56 18,52 Z', c.lg([lt(th, 0.25), th, dk(th, 0.35)], 0, 0, 1, 0), 2.4) +
        CG(S(wind, dk(th, 0.45), 1.3, 0.8) + S(wind.replace(/,(\d+(\.\d+)?) C/g, function (m, v) { return ',' + (+v + 1.6) + ' C'; }), lt(th, 0.3), 0.8, 0.6), c.clip('M18,20 L46,20 L46,52 C38,56 26,56 18,52 Z')) +
        E(32, 20, 18, 5.5, c.cel(wd), 2.4) + E(32, 20, 5, 1.8, '#3a2412', 1.2) +
        S2(lo, th, 2) + S('M49,41 C53,43 55,48 52,52', lt(th, 0.35), 0.8, 0.7));
    },
    vial: function (c) {
      var v = 'M23,13 L41,13 L40,17 L40,46 C40,58 24,58 24,46 L24,17 Z';
      return item(c, G(E(32, 56, 9, 2.5, '#000', 0, 0.35) + C(32, 36, 22, c.rg([[0, '#c8e8ff', 0.3], [1, '#c8e8ff', 0]]), 0) + F(v, c.lg([[0, '#ffffff', 0.85], [0.5, '#c0dcec', 0.6], [1, '#8aaac0', 0.8]], 0, 0, 1, 0)) + S(v, OL, 3.2) + S(v, '#d8ecf8', 1.1, 0.85) +
        S('M28,19 L28,48', '#ffffff', 2.4, 0.85) + S('M37,20 L37,46', '#8ab0c8', 1.2, 0.6) + E(32, 52, 5, 1.8, '#c8e0f0', 0, 0.5) +
        P('M22,10 L42,10 L42,14 L22,14 Z', c.lg(['#f4fbff', '#a8c4d8'], 0, 0, 1, 0), 1.6) + cork(c, 32, 2, 13, 8) + sparkle(44, 20, 3, '#ffffff'), 'matrix(0.9,0,0,0.9,3.2,5)'));
    },
    /* ---------- crafted ---------- */
    potion_red: function (c) { return item(c, potion(c, ['#ff8070', '#e0202a', '#6a0610'])); },
    potion_blue: function (c) { return item(c, potion(c, ['#80c0ff', '#2a60e8', '#0a1a6a'])); },
    elixir_green: function (c) { return item(c, elixir(c, ['#c0ff90', '#48c040', '#145a14', '#3a5a2a'])); },
    elixir_gold: function (c) { return item(c, elixir(c, ['#fff4a0', '#f0b020', '#8a5006', '#6a3a14'], sparkle(46, 22, 4, '#fff8d0') + sparkle(18, 40, 3, '#fff8d0'))); },
    sharpening_stone: function (c) {
      var col = '#8a9098';
      return item(c, E(32, 52, 24, 4, '#000', 0, 0.35) + G(
        P('M-24,-6 C-24,-9 -22,-9 -20,-9 L20,-9 C23,-9 24,-8 24,-5 L24,5 C24,8 23,9 20,9 L-20,9 C-23,9 -24,8 -24,5 Z', c.lg([lt(col, 0.4), col, dk(col, 0.35)], 0, 0, 0, 1), 2.4) +
        S('M-20,-5 L20,-5', '#ffffff', 1.4, 0.55) + S('M-16,1 L-4,1 M2,3 L16,3 M-12,5 L0,5', dk(col, 0.3), 1, 0.7) +
        R(-5, -10, 9, 20, c.cel('#7a4e2a'), 1.8) + S('M-2,-10 L-2,10', '#a87848', 1, 0.8), tr(32, 38, -28)) +
        G(P('M-2,-2 L30,-2 L34,0 L30,2 L-2,2 Z', c.lg(STEEL, 0, 0, 0, 1), 1.4), tr(26, 20, -58)) +
        sparkle(44, 18, 4.5, '#fff0a0') + sparkle(50, 26, 2.8, '#ffe070') + C(40, 14, 1.2, '#ffd060', 0) + C(52, 18, 1, '#ffd060', 0));
    },
    weightstone: function (c) {
      var col = '#6a6e76';
      return item(c, E(32, 55, 24, 4, '#000', 0, 0.35) + prism(c, 32, 46, 15, 10, 13, 8, 18, col, 2.4, function (p) {
        var f0 = p(-2, 0, 10), f1 = p(-1.6, 18, 8), t1 = p(-1.6, 18, -8), s0 = p(15, 9, 10), s1 = p(15, 9, -10), q = p(-15, 9, 10);
        var line = function (a, b) { return 'M' + r1(a[0]) + ',' + r1(a[1]) + ' L' + r1(b[0]) + ',' + r1(b[1]); };
        var rope = line(f0, f1) + ' ' + line(f1, t1) + ' ' + line(q, s0) + ' ' + line(s0, s1);
        var top = p(0, 18, 0);
        return S(rope, OL, 5) + S(rope, '#c8a870', 2.8) + S(rope, '#8a6a3a', 0.8, 0.8) +
          '<ellipse cx="' + r1(top[0]) + '" cy="' + r1(top[1] - 6) + '" rx="5" ry="6" fill="none" stroke="' + OL + '" stroke-width="5"/>' +
          '<ellipse cx="' + r1(top[0]) + '" cy="' + r1(top[1] - 6) + '" rx="5" ry="6" fill="none" stroke="#c8a870" stroke-width="2.6"/>' +
          C(top[0], top[1], 2.6, c.cel('#c8a870'), 1.4);
      }));
    },
    armor_kit: function (c) {
      var p1 = 'M8,24 L40,18 L44,46 L12,52 Z', p2 = 'M26,30 L54,28 L56,52 L28,56 Z';
      var stitch = function (d) { return '<path d="' + d + '" fill="none" stroke="#f0d8a8" stroke-width="1.2" stroke-dasharray="2.4 2" opacity="0.9"/>'; };
      return item(c, E(32, 56, 24, 4, '#000', 0, 0.35) +
        P(p1, c.cel('#b07a44'), 2.4) + stitch('M11.5,26.5 L37.5,21.5 L41,43.5 L14.5,48.5 Z') +
        P(p2, c.cel('#7a4a28'), 2.4) + stitch('M29,33 L51,31 L53,49.5 L30.5,52.5 Z') +
        C(31, 35, 1.8, c.cel('#c8ced6'), 1) + C(49, 34, 1.8, c.cel('#c8ced6'), 1) + C(33, 50, 1.8, c.cel('#c8ced6'), 1) + C(50, 48, 1.8, c.cel('#c8ced6'), 1) +
        P('M4,40 L24,36 L25,42 L5,46 Z', c.cel('#3e2614'), 1.6) + R(14, 35, 7, 9, 'none', 0) + '<rect x="14" y="35" width="7" height="9" rx="1" fill="none" stroke="' + OL + '" stroke-width="4"/><rect x="14" y="35" width="7" height="9" rx="1" fill="none" stroke="' + GOLD + '" stroke-width="2"/>' +
        G(needle(c, 30), tr(42, 20, 55, 1)) + S2('M30,14 C24,10 22,16 18,14', '#e8dcc0', 1));
    },
    bag_linen: function (c) { return item(c, bag(c, '#e2d6b8', '#9a6a3a', 0.82)); },
    bag_wool: function (c) {
      var col = '#8a8a94';
      return item(c, bag(c, col, '#3a5a9a', 1.05,
        R(32, 38, 12, 10, c.cel('#6a6a78'), 1.6) + '<path d="M33.5,39.5 L42.5,39.5 L42.5,46.5 L33.5,46.5 Z" fill="none" stroke="#c0c0c8" stroke-width="0.9" stroke-dasharray="2 1.6"/>' +
        S('M14,44 L24,42 M16,50 L26,49 M44,54 L50,52', dk(col, 0.3), 1, 0.6)));
    }
  };

  /* ================= gathering nodes (96x96, transparent) ================= */
  var NSW = 3.4;   /* node outline: ~1.6px once the node is shown ~46px wide, close to the scene outlines */
  function nshadow(c, rx) { return E(48, 86, rx || 40, 7, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]]), 0); }
  function flat(pts, y) { return pts.map(function (p) { return [p[0], Math.min(p[1], y)]; }); }
  function nrock(c, cx, cy, rx, ry, seed, col, inner) {
    var d = smooth(flat(lump(cx, cy, rx, ry, seed, 9, 0.22), 86)), cl = c.clip(d);
    return P(d, c.cel(col), NSW) + CG(F('M' + r1(cx - rx * 0.1) + ',0 L96,0 L96,96 L' + r1(cx + rx * 0.2) + ',96 C' + r1(cx + rx * 0.5) + ',' + r1(cy) + ' ' + r1(cx + rx * 0.2) + ',' + r1(cy - ry * 0.5) + ' ' + r1(cx - rx * 0.1) + ',0 Z', dk(col, 0.3), 0.8) +
      E(cx - rx * 0.35, cy - ry * 0.5, rx * 0.3, ry * 0.14, lt(col, 0.35), 0, 0.7) + (inner || ''), cl);
  }
  function nvein(pts, deep, col, w) { var d = pl(pts); return S(d, deep, w + 3) + S(d, col, w) + S(d, lt(col, 0.5), w * 0.35, 0.8); }
  function nnug(c, x, y, r, cols, seed) { var d = pl(lump(x, y, r, r * 0.8, seed, 6, 0.4)) + 'Z'; return P(d, c.lg(cols, 0.2, 0, 0.8, 1), 2) + C(x - r * 0.3, y - r * 0.3, r * 0.3, '#ffffff', 0, 0.9); }
  function oreNode(c, rock, veins, nugs, cols, deep, back) {
    return nshadow(c, 42) +
      nrock(c, 50, 58, 32, 30, back || 3, rock, veins.map(function (v) { return nvein(v, deep, cols[1], 5.5); }).join('') + nugs.map(function (n, i) { return nnug(c, n[0], n[1], n[2], cols, i + 3); }).join('')) +
      nrock(c, 20, 80, 14, 10, 17, dk(rock, 0.08), nnug(c, 20, 76, 3.6, cols, 9)) + nrock(c, 80, 82, 12, 8, 23, lt(rock, 0.05));
  }
  function nblade(c, x, y, a, s, col, w) { return G(P('M0,0 C' + (w || 5) + ',-8 ' + (w || 5) + ',-24 0,-34 C-' + (w || 5) + ',-24 -' + (w || 5) + ',-8 0,0 Z', c.lg([lt(col, 0.3), col, dk(col, 0.35)], 0, 0, 1, 0), 2.2) + S('M0,-2 L0,-28', dk(col, 0.45), 1.2, 0.8), tr(x, y, a, s)); }
  function grassBase(c, col) {
    col = col || '#4e8a3a';
    return nblade(c, 30, 86, -55, 0.7, dk(col, 0.1)) + nblade(c, 66, 86, 55, 0.7, dk(col, 0.1)) + nblade(c, 38, 86, -25, 0.8, col) + nblade(c, 58, 86, 25, 0.8, col) + nblade(c, 48, 86, 0, 0.7, lt(col, 0.1));
  }
  /* point on a quadratic bezier */
  function qpt(a, b, e, t) { var u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * e[0], u * u * a[1] + 2 * u * t * b[1] + t * t * e[1]]; }
  /* filled root/branch tapering from width w0 at a to w1 at e along a quadratic curve */
  function taper(a, b, e, w0, w1) {
    var L = [], Rr = [], n = 12;
    for (var i = 0; i <= n; i++) {
      var t = i / n, p = qpt(a, b, e, t), q = qpt(a, b, e, Math.min(1, t + 0.02)), q0 = qpt(a, b, e, Math.max(0, t - 0.02));
      var dx = q[0] - q0[0], dy = q[1] - q0[1], l = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * t) / 2 * (1 + 0.18 * Math.sin(t * 17));
      L.push([p[0] - dy / l * w, p[1] + dx / l * w]); Rr.push([p[0] + dy / l * w, p[1] - dx / l * w]);
    }
    return pl(L.concat(Rr.reverse())) + 'Z';
  }
  function taperMid(r) { var a = qpt(r[0], r[1], r[2], 0.1), b = qpt(r[0], r[1], r[2], 0.5), e = qpt(r[0], r[1], r[2], 0.8); return 'M' + r1(a[0] - 2) + ',' + r1(a[1]) + ' Q' + r1(b[0] - 2) + ',' + r1(b[1] - 1) + ' ' + r1(e[0]) + ',' + r1(e[1] - 1); }
  function nstem(d, col, w) { return S(d, OL, w + 3) + S(d, col, w); }
  var NODES = {
    copper: function (c) {
      return oreNode(c, '#8a7866', [[[24, 60], [38, 52], [50, 58], [66, 46], [78, 52]], [[40, 76], [52, 68], [62, 72]]],
        [[38, 52, 6], [66, 46, 6.5], [52, 70, 5], [30, 44, 4]], ['#ffcb98', '#e0742e', '#7a3208'], '#5a2408', 5);
    },
    tin: function (c) {
      return oreNode(c, '#7c7a74', [[[22, 56], [36, 48], [50, 54], [62, 42], [76, 48]], [[36, 74], [50, 66], [66, 70]]],
        [[36, 48, 5.5], [62, 42, 6], [50, 66, 5]], ['#f4f4f0', '#cfd3d0', '#80868a'], '#3e3e3a', 11);
    },
    silver: function (c) {
      var n = oreNode(c, '#4e5260', [[[22, 60], [38, 50], [52, 56], [68, 44], [80, 50]], [[36, 76], [50, 68], [64, 72]]],
        [[38, 50, 6.5], [68, 44, 6.5], [50, 68, 5.5]], ['#ffffff', '#e8f0fa', '#8a9ab0'], '#2a3040', 19);
      return n + C(68, 42, 16, c.rg([[0, '#e8f8ff', 0.85], [0.4, '#9ad8ff', 0.4], [1, '#9ad8ff', 0]]), 0) + sparkle(68, 42, 13, '#ffffff') + sparkle(38, 48, 8, '#e0f4ff') + sparkle(80, 22, 5, '#d0ecff');
    },
    peacebloom: function (c) {
      return nshadow(c, 30) + grassBase(c, '#5aa040') +
        nstem('M48,86 C44,72 34,62 28,50', '#4a9038', 2.8) + nstem('M48,86 C52,70 60,58 68,48', '#4a9038', 2.8) + nstem('M48,86 C48,76 48,70 48,64', '#4a9038', 2.8) +
        flower5(c, 27, 46, 19, '#fbfbf2', '#f4c020', 2.2) + flower5(c, 69, 44, 18, '#fbfbf2', '#f4c020', 2.2) + flower5(c, 48, 60, 15, '#f4f2e6', '#f4c020', 2.2);
    },
    silverleaf: function (c) {
      var col = '#a8c4b0', o = '', angs = [-64, -42, -20, 0, 20, 42, 64], L = [0.8, 1.0, 1.2, 1.3, 1.2, 1.0, 0.8];
      for (var i = 0; i < angs.length; i++) o += nblade(c, 48, 86, angs[i], L[i] * 1.25, i % 2 ? col : lt(col, 0.14), 6.5);
      return nshadow(c, 34) + o + sparkle(34, 40, 5, '#ffffff') + sparkle(62, 34, 4, '#ffffff');
    },
    earthroot: function (c) {
      var col = '#8a5a30';
      var mound = 'M14,86 C18,72 34,66 48,66 C62,66 78,72 82,86 Z';
      var roots = [[[30, 80], [14, 46], [40, 48], 13, 3], [[48, 76], [46, 26], [68, 42], 14, 3.2], [[64, 78], [80, 44], [88, 66], 11, 2.6], [[40, 78], [30, 64], [20, 66], 7, 2]];
      var o = '', kn = '';
      roots.forEach(function (r, k) {
        var d = taper(r[0], r[1], r[2], r[3], r[4]);
        o += P(d, c.cel(k % 2 ? dk(col, 0.08) : col), NSW * 0.85);
        var m = qpt(r[0], r[1], r[2], 0.45), m2 = qpt(r[0], r[1], r[2], 0.72);
        kn += C(m[0] + (k % 2 ? 2 : -2), m[1] - 1, r[3] * 0.34, c.cel(lt(col, 0.06)), 2) + S(taperMid(r), '#c89060', 1.8, 0.7) +
          S('M' + r1(m[0]) + ',' + r1(m[1]) + ' l' + (k % 2 ? 7 : -7) + ',-3', '#4a3018', 1.6);
      });
      return nshadow(c, 40) + o + kn +
        P(mound, c.cel('#6a4a2e'), NSW) + CG(F('M50,60 L96,60 L96,96 L54,96 C62,80 58,70 50,60 Z', '#000', 0.25) + C(30, 78, 2, '#3a2818', 0) + C(62, 80, 2.4, '#3a2818', 0) + C(44, 82, 1.6, '#3a2818', 0), c.clip(mound)) +
        nblade(c, 52, 38, 20, 0.5, '#6ab43a') + nblade(c, 52, 38, -30, 0.45, '#5aa040');
    },
    mageroyal: function (c) {
      var col = '#7060e0';
      return nshadow(c, 30) + grassBase(c, '#4a8a44') +
        nstem('M48,86 C46,70 38,54 32,38', '#3a7a3a', 2.8) + nstem('M48,86 C52,70 62,58 68,50', '#3a7a3a', 2.8) + nstem('M48,86 C48,70 50,60 52,30', '#3a7a3a', 2.4) +
        starFlower(c, 31, 34, 15, col, 2.2) + starFlower(c, 68, 46, 14, lt(col, 0.1), 2.2) + starFlower(c, 53, 24, 11, dk(col, 0.05), 2.2);
    },
    briarthorn: function (c) {
      var col = '#b8202a';
      var lfR = function (x, y, a, s) { return G(P('M0,0 C5,-5 5,-13 0,-17 C-5,-13 -5,-5 0,0 Z', c.lg(['#e04848', '#8a1420']), 2), tr(x, y, a, s)); };
      return nshadow(c, 36) + lfR(26, 56, -50, 1) + lfR(70, 54, 60, 1) + lfR(48, 34, 10, 0.9) + lfR(58, 76, 80, 0.8) +
        thornVine(c, [[22, 86], [18, 70], [26, 54], [40, 48], [48, 36], [44, 26]], col, 5, 6.5) +
        thornVine(c, [[50, 86], [58, 72], [72, 64], [78, 50], [70, 40]], dk(col, 0.08), 4.4, 6) +
        thornVine(c, [[36, 86], [40, 74], [52, 66], [60, 56]], lt(col, 0.05), 3.6, 5);
    },
    bruiseweed: function (c) {
      var o = '', angs = [-72, -44, -16, 14, 42, 70], L = [40, 52, 62, 60, 52, 40];
      for (var i = 0; i < angs.length; i++) {
        var d = sawLeaf(L[i], 12, 4);
        o += G(P(d, c.lg(['#9a6ab0', '#6a3478', '#3a1848'], 0, 0, 1, 0), NSW * 0.8) + S('M0,-2 L0,' + (-L[i] + 5), '#9ac850', 2.6) +
          S('M0,' + r1(-L[i] * 0.4) + ' L-5,' + r1(-L[i] * 0.55) + ' M0,' + r1(-L[i] * 0.4) + ' L5,' + r1(-L[i] * 0.55), '#8ab848', 1.6), tr(48, 86, angs[i]));
      }
      return nshadow(c, 36) + o + E(48, 84, 6, 3, '#4a2a50', 2);
    }
  };
  function phNode(c) {
    var d = smooth(flat(lump(48, 68, 24, 20, 5, 8, 0.2), 86));
    return nshadow(c, 30) + P(d, c.cel('#8a8a86'), NSW) + CG(F('M50,40 L96,40 L96,96 L54,96 Z', '#000', 0.2), c.clip(d));
  }

  /* ================= extend the public API ================= */
  var has = function (t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); };
  function phIcon(c) { return iconWrap(c, ['#5a5a62', '#1a1a1e'], C(32, 32, 12, '#8a8a92', 2)); }
  var BLANK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" fill="#444"/></svg>';
  function make(k) {
    try { var c = new Ctx(); return c.svg(64, 64, NEW[k](c)); } catch (e) {
      try { var c2 = new Ctx(); return c2.svg(64, 64, phIcon(c2)); } catch (e2) { return BLANK; }
    }
  }
  var baseIcon = typeof ART.icon === 'function' ? ART.icon : function () { var c = new Ctx(); return c.svg(64, 64, phIcon(c)); };
  ART.icon = function (k) {
    if (has(NEW, k)) return make(k);
    try { return baseIcon.apply(this, arguments); } catch (e) { return make.call(null, '__none__'); }
  };
  var baseNode = typeof ART.node === 'function' ? ART.node : null;
  function makeNode(k) {
    try { var c = new Ctx(); return c.svg(96, 96, (has(NODES, k) ? NODES[k] : phNode)(c)); } catch (e) {
      try { var c2 = new Ctx(); return c2.svg(96, 96, phNode(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"></svg>'; }
    }
  }
  ART.node = function (k) {
    if (has(NODES, k) || !baseNode) return makeNode(k);
    try { return baseNode.apply(this, arguments); } catch (e) { return makeNode('__none__'); }
  };
  ART.keys = ART.keys || {};
  var list = Array.isArray(ART.keys.icons) ? ART.keys.icons : (ART.keys.icons = []);
  Object.keys(NEW).forEach(function (k) { if (list.indexOf(k) < 0) list.push(k); });
  var nlist = Array.isArray(ART.keys.nodes) ? ART.keys.nodes : (ART.keys.nodes = []);
  Object.keys(NODES).forEach(function (k) { if (nlist.indexOf(k) < 0) nlist.push(k); });
})(typeof window !== 'undefined' ? window : this);
