/* art_icons11.js - Expert-tier crafting material icons for Realm of Loner (22 keys: ores, stone, bars, herbs, leather,
 * silk, coal, thread and a sturdy vial for the level 25-45 profession tier), plus 10 gathering nodes (ART.node: iron, gold,
 * embersilver veins and the seven new herbs; 96x96, transparent, same style as the art_icons3.js nodes; other keys fall
 * through to the previous ART.node, and the keys are appended to ART.keys.nodes).
 * Loads AFTER art.js, art_icons2.js .. art_icons10.js and art_mounts.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key (prototype keys included). Keys are appended to
 * ART.keys.icons. Self-contained: art.js / art_icons3.js helpers are private, so the few needed here are re-implemented
 * (same maths, same look). Never throws. Style matches the art_icons3.js material icons: 64x64, dark radial item
 * background, bold glyph, #1a1009 outline, vignette + bevel frame, no text, no filters. Gradient ids use the prefix
 * iY<counter>_ so they never collide.
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};

  /* ================= helpers (copied from art.js / art_icons3.js) ================= */
  var UID = 0;
  var OL = '#1a1009';
  var GOLD = '#d6a53c', LEATH = '#5a3a22';
  var STEEL = ['#f4f7fa', '#c2cad3', '#7c8793'];
  var ITEM_BG = ['#3a3440', '#0e0c12'];
  function r1(v) { v = +v; return isFinite(v) ? Math.round(v * 10) / 10 : 0; }
  function D(s) {
    var o = s[0];
    for (var i = 1; i < arguments.length; i++) { var v = arguments[i]; o += (typeof v === 'number' ? r1(v) : v) + s[i]; }
    return o;
  }
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

  function Ctx() { this.u = 'iY' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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
  /* dashed stroke (stitching) */
  function SD(d, col, w, dash, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + r1(w) + '" stroke-dasharray="' + dash + '" stroke-linecap="round"' + opa(o) + '/>'; }
  function C(cx, cy, r, fill, sw, o) { return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, o, rot) {
    return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="' + fill + '"' + stk(sw) + opa(o) +
      (rot ? ' transform="rotate(' + rot + ' ' + r1(cx) + ' ' + r1(cy) + ')"' : '') + '/>';
  }
  function R(x, y, w, h, fill, sw, o, rx) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + stk(sw) + opa(o) + '/>';
  }
  function G(body, tf, o) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + opa(o) + '>' + body + '</g>'; }
  function CG(body, clip) { return '<g clip-path="' + clip + '">' + body + '</g>'; }
  function tr(x, y, a, s) { return 'translate(' + r1(x) + ',' + r1(y) + ')' + (a ? ' rotate(' + r1(a) + ')' : '') + (s != null && s !== 1 ? ' scale(' + s + ')' : ''); }
  function pl(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join(''); }
  /* closed curve through the midpoints of a polygon (soft lumps) */
  function blob(pts) {
    var n = pts.length, m = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }, s = m(pts[n - 1], pts[0]), d = 'M' + r1(s[0]) + ',' + r1(s[1]);
    for (var i = 0; i < n; i++) { var q = m(pts[i], pts[(i + 1) % n]); d += 'Q' + r1(pts[i][0]) + ',' + r1(pts[i][1]) + ' ' + r1(q[0]) + ',' + r1(q[1]); }
    return d + 'Z';
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
  function sparkle(x, y, r, col) { return F(D`M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r} Z`, col); }

  /* ---- icon parts ---- */
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75), 0) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72), 0) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      S('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + S('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function glow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]]), 0); }
  function item(c, glyph) { return iconWrap(c, ITEM_BG, glyph); }

  /* ore chunk: faceted rock (rock colour) with metal bits drawn by bits (clipped to the rock) */
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
  function seg(a, b) { return 'M' + r1(a[0]) + ',' + r1(a[1]) + ' L' + r1(b[0]) + ',' + r1(b[1]); }
  /* a cast ingot (same shape as the copper/silver bars); mark(p) adds stamps or glow on top */
  function bar(c, col, mark) {
    var one = function (ox, oy) {
      return prism(c, ox, oy, 19, 8, 14, 5, 9, col, 1.8, function (p) {
        return S(seg(p(-13, 9, 4.2), p(12, 9, 4.2)), '#ffffff', 1.4, 0.75) + S(seg(p(-18, 0.6, 7.8), p(18, 0.6, 7.8)), dk(col, 0.5), 1.2, 0.6) + (mark ? mark(p) : '');
      });
    };
    return E(32, 55, 28, 4.5, '#000', 0, 0.35) + G(one(32, 44), 'matrix(1.3,0,0,1.3,-9.6,-12.4)');
  }
  function cork(c, x, y, w, h) { return P('M' + r1(x - w / 2) + ',' + r1(y + h) + ' L' + r1(x - w / 2 + 1) + ',' + r1(y) + ' L' + r1(x + w / 2 - 1) + ',' + r1(y) + ' L' + r1(x + w / 2) + ',' + r1(y + h) + ' Z', c.cel('#a8763e'), 1.8) + S('M' + r1(x - w / 2 + 2) + ',' + r1(y + 2) + ' L' + r1(x - w / 2 + 2) + ',' + r1(y + h - 1), '#e0b070', 1, 0.8); }
  /* herb parts */
  function stem(d, col, w, o) { return S(d, OL, w + 2.4, o) + S(d, col, w, o); }
  function blade(c, x, y, a, s, col, w) {
    w = w || 4;
    return G(P('M0,0 C' + w + ',-6 ' + w + ',-18 0,-26 C-' + w + ',-18 -' + w + ',-6 0,0 Z', c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 1, 0), 1.5) + S('M0,-1.5 L0,-22', dk(col, 0.45), 0.9, 0.8), tr(x, y, a, s));
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
  /* cloth bolt: a thick cylinder of cloth, spiral end facing the viewer, tail hanging off the front */
  function clothBolt(c, col, band, tex) {
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
  /* a tanned hide sheet (sheet path) rolled up into a fat roll in front, y0..y1 is the roll height; the spiral end on the
   * right shows how many layers thick it is. Same family as art_icons3 leatherRoll, scaled up for heavier grades. */
  function hideRoll(c, col, sheet, y0, y1, layers) {
    var h = y1 - y0, ry = h / 2, cy = y0 + ry, rx = ry * 0.5, x0 = 10, x1 = 52;
    var body = D`M${x0},${y0} L${x1},${y0} L${x1},${y1} L${x0},${y1} Z`, sp = '';
    for (var i = 1; i <= layers; i++) { var k = i / (layers + 0.6); sp += '<ellipse cx="' + r1(x1) + '" cy="' + r1(cy) + '" rx="' + r1(rx * k) + '" ry="' + r1(ry * k) + '" fill="none" stroke="' + dk(col, 0.55) + '" stroke-width="1.3"/>'; }
    return E(32, y1 + 2, 26, 4, '#000', 0, 0.35) +
      P(sheet, c.cel(col), 2.4) + CG(F('M34,0 L64,0 L64,' + y0 + ' L40,' + y0 + ' C44,' + (y0 - 10) + ' 40,10 34,0 Z', '#000', 0.2) +
        S('M12,' + (y0 - 12) + ' C22,' + (y0 - 8) + ' 30,' + (y0 - 13) + ' 38,' + (y0 - 9) + ' M16,' + (y0 - 5) + ' C26,' + (y0 - 3) + ' 38,' + (y0 - 7) + ' 48,' + (y0 - 4), dk(col, 0.3), 1, 0.6), c.clip(sheet)) +
      E(x0, cy, rx, ry, c.cel(dk(col, 0.15)), 2.4) +
      P(body, c.lg([[0, lt(col, 0.35)], [0.35, col], [0.75, dk(col, 0.15)], [1, dk(col, 0.42)]], 0, 0, 0, 1), 2.4) +
      CG(S(D`M${x0},${y0 + h * 0.2} L${x1},${y0 + h * 0.2}`, '#ffffff', 1.4, 0.4), c.clip(body)) +
      E(x1, cy, rx, ry, c.lg([lt(col, 0.2), dk(col, 0.1)], 0, 0, 1, 1), 2.4) + sp + C(x1, cy, 1.2, dk(col, 0.6), 0);
  }
  /* hermit's beard tuft: top edge at y 16 between x 15 and 48, tip at (31,61) */
  var BEARD = 'M15,16 C16,22 15,28 18,34 C20,40 22,46 26,52 C28,55 30,58 31,61 C33,56 34,52 36,48 C39,42 41,36 44,30 C46,24 47,20 48,16 Z';
  var BEARD_ST = 'M19,18 C20,28 22,38 28,52 M24,18 C25,30 27,42 31,58 M30,18 C30,30 31,42 33,54 M36,18 C36,28 35,38 36,46 M42,18 C42,26 40,32 39,40';
  function beardBody(c, sw) {
    var col = '#d8d6cc';
    return P(BEARD, c.lg([lt(col, 0.5), col, dk(col, 0.25)], 0, 0, 1, 1), sw) +
      S(BEARD_ST, dk(col, 0.28), 1.1, 0.85) + S(BEARD_ST.replace(/M(\d+)/g, function (m, v) { return 'M' + (+v + 2); }), '#ffffff', 0.9, 0.6);
  }
  /* tiny six-arm rime crystal */
  function flake(x, y, r) {
    var d = '';
    for (var i = 0; i < 3; i++) { var a = i * Math.PI / 3 + Math.PI / 6; d += D`M${x - Math.cos(a) * r},${y - Math.sin(a) * r} L${x + Math.cos(a) * r},${y + Math.sin(a) * r} `; }
    return S(d, '#2a4a6a', 2.2, 0.8) + S(d, '#ffffff', 1.1);
  }
  /* tapering root from a (wide, width w) to b (tip), bowed by bend */
  function taper(ax, ay, bx, by, w, bend) {
    var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L, mx = (ax + bx) / 2 + nx * bend, my = (ay + by) / 2 + ny * bend;
    return D`M${ax + nx * w / 2},${ay + ny * w / 2} Q${mx + nx * w * 0.42},${my + ny * w * 0.42} ${bx},${by} Q${mx - nx * w * 0.42},${my - ny * w * 0.42} ${ax - nx * w / 2},${ay - ny * w / 2} Z`;
  }

  /* ================= the icons ================= */
  var NEW = {
    /* ---------- ores ---------- */
    /* two dark blue-grey chunks peppered with grey metal flecks, a dull metal seam and faint rust patches (no glow, no sparkle) */
    iron_ore: function (c) {
      var fe = ['#e8ecf0', '#98a0aa', '#40464e'], r = rng(91);
      var fl = function (n, x0, y0, w, h) {
        var o = '';
        for (var i = 0; i < n; i++) o += nug(c, x0 + r() * w, y0 + r() * h, 1.8 + r() * 1.8, fe, 10 + i);
        return o;
      };
      var rv = 'M10,40 L20,36 L28,42 L38,38 L50,44', rust = S(rv, '#7c8794', 3.4, 0.9) + S(rv, '#d8dee6', 1.2, 0.9) + E(22, 44, 3.6, 2.2, '#7a3a1e', 0, 0.55) + E(44, 32, 2.8, 1.8, '#7a3a1e', 0, 0.5);
      return item(c, G(oreChunk(c, '#4c5158', 41, rust + fl(11, 12, 24, 36, 24)), 'translate(-3,-4) scale(0.92)') +
        G(oreChunk(c, '#43474e', 57, S('M14,38 L26,34 L40,40', '#a8b2be', 2.4, 0.8) + E(30, 44, 4, 2.4, '#7a3a1e', 0, 0.55) + fl(4, 18, 26, 26, 20)), 'translate(31,27) scale(0.5)'));
    },
    /* warm grey-brown rock split by bright branching gold veins, gold nuggets and a soft yellow glow */
    gold_ore: function (c) {
      var au = ['#fffbd0', '#ffcc1e', '#9a6a00'];
      var v1 = 'M10,40 L20,34 L28,38 L38,30 L52,34', v2 = 'M28,38 L32,48 L42,52 M38,30 L40,22';
      return item(c, glow(c, 32, 34, 26, '#ffd040', 0.35) + oreChunk(c, '#6a6056', 63,
        S(v1 + ' ' + v2, '#5a3c00', 6) + S(v1 + ' ' + v2, '#ffcc1e', 3.2) + S(v1, '#fff6b0', 1.1, 0.9) +
        nug(c, 20, 34, 4.5, au, 2) + nug(c, 38, 30, 5, au, 4) + nug(c, 34, 47, 4, au, 6) + nug(c, 46, 40, 3, au, 8)) +
        sparkle(38, 28, 5, '#fffbe0') + sparkle(18, 22, 2.8, '#fff2a0') + sparkle(50, 46, 2.4, '#fff2a0'));
    },
    /* near-black rock with silver nuggets, split by glowing ember-orange cracks, sparks rising */
    embersilver_ore: function (c) {
      var ag = ['#ffffff', '#d8e0ea', '#6a7484'];
      var cr = 'M10,34 L18,38 L24,32 L30,40 L38,36 L44,44 L54,40 M30,40 L28,50 M38,36 L40,26';
      return item(c, glow(c, 32, 40, 28, '#ff6a1a', 0.5) + oreChunk(c, '#34323a', 71,
        glow(c, 30, 40, 16, '#ff5a10', 0.55) +
        S(cr, '#4a0e00', 5.4) + S(cr, '#ff6a14', 3) + S(cr, '#ffe08a', 1.1) +
        nug(c, 20, 30, 4.5, ag, 3) + nug(c, 44, 32, 4.5, ag, 5) + nug(c, 36, 48, 4, ag, 7) + nug(c, 18, 46, 3.2, ag, 9)) +
        C(22, 16, 1.6, '#ffb040', 0) + C(40, 12, 1.3, '#ffd070', 0) + C(48, 20, 1.1, '#ff8a2a', 0) + C(30, 9, 1, '#ffb040', 0, 0.8) +
        sparkle(44, 30, 3.4, '#ffffff'));
    },
    /* one big angular quarried block, dark dense grey, chipped edges and cracks, a broken chip beside it */
    heavy_stone: function (c) {
      var col = '#55575d', r = rng(23), dots = '';
      var top = 'M9,23 L15,19 L22,17 L28,14 L36,12 L42,15 L47,15 L56,20 L44,25 L31,29 L20,26 Z';
      var left = 'M9,23 L20,26 L31,29 L31,42 L30,55 L24,51 L18,50 L10,46 L12,40 L10,33 L12,28 Z';
      var right = 'M31,29 L44,25 L56,20 L54,27 L55,34 L53,40 L56,45 L48,48 L43,51 L36,52 L30,55 L31,42 Z';
      var all = 'M9,23 L15,19 L22,17 L28,14 L36,12 L42,15 L47,15 L56,20 L54,27 L55,34 L53,40 L56,45 L48,48 L43,51 L36,52 L30,55 L24,51 L18,50 L10,46 L12,40 L10,33 L12,28 Z';
      for (var i = 0; i < 22; i++) dots += C(12 + r() * 42, 16 + r() * 36, 0.6 + r() * 0.7, r() < 0.5 ? '#9a9ca2' : '#2a2a2e', 0, 0.8);
      return item(c, E(33, 55, 25, 4.5, '#000', 0, 0.4) +
        F(top, c.lg([lt(col, 0.45), lt(col, 0.22)], 0, 0, 1, 1)) + F(left, c.lg([lt(col, 0.05), dk(col, 0.12)], 0, 0, 1, 0)) + F(right, c.lg([dk(col, 0.3), dk(col, 0.5)], 0, 0, 1, 0)) +
        CG(dots + S('M38,16 L34,22 L37,26', dk(col, 0.6), 1.3, 0.9) + S('M18,30 L22,38 L19,44', dk(col, 0.6), 1.3, 0.9) + S('M46,30 L42,38 L46,44', '#1e1e22', 1.3, 0.9), c.clip(all)) +
        S('M20,26 L31,29 L44,25 M31,29 L31,42 L30,54', OL, 1.6) + S('M11,23 L15,20 L22,18 L28,15 L36,13', '#ffffff', 1.2, 0.45) +
        P(all, 'none', 2.6) +
        P('M6,52 L10,46 L16,47 L18,53 L12,56 Z', c.cel(dk(col, 0.1)), 1.8) + F('M10,47 L16,47.6 L13,50 Z', lt(col, 0.35), 0.8));
    },
    /* ---------- bars ---------- */
    /* dark grey, slightly hammered, no shine or glow */
    iron_bar: function (c) {
      return item(c, bar(c, '#4e535a', function (p) {
        var a = p(-7, 9, -1), b = p(5, 9, 2), q = p(-6, 4, 7.4), s = p(8, 5, 7);
        return E(a[0], a[1], 2.2, 1.1, dk('#4e535a', 0.35), 0, 0.8) + E(b[0], b[1], 1.8, 0.9, dk('#4e535a', 0.35), 0, 0.8) +
          E(q[0], q[1], 1.6, 1.2, dk('#4e535a', 0.4), 0, 0.7) + E(s[0], s[1], 1.4, 1, dk('#4e535a', 0.4), 0, 0.7);
      }));
    },
    /* cool bright blue steel, a crisp diagonal shine and a stamped diamond, faint blue glow */
    steel_bar: function (c) {
      var col = '#7aa2d2';
      return item(c, glow(c, 32, 38, 26, '#7ab8ff', 0.3) + bar(c, col, function (p) {
        var m = p(0, 9, 0), d = 'M' + r1(m[0]) + ',' + r1(m[1] - 2.4) + ' L' + r1(m[0] + 4) + ',' + r1(m[1]) + ' L' + r1(m[0]) + ',' + r1(m[1] + 2.4) + ' L' + r1(m[0] - 4) + ',' + r1(m[1]) + ' Z';
        return '<path d="' + d + '" fill="none" stroke="' + dk(col, 0.5) + '" stroke-width="1.3"/>' +
          S(seg(p(-15, 1.5, 7.6), p(-9, 7.5, 5.4)), '#ffffff', 2.2, 0.85) + S(seg(p(-11, 1.5, 7.6), p(-7, 5.5, 6)), '#ffffff', 1, 0.7);
      }) + sparkle(20, 34, 2.6, '#e8f4ff'));
    },
    /* bright yellow gold, warm glow and sparkles */
    gold_bar: function (c) {
      return item(c, glow(c, 32, 38, 28, '#ffd040', 0.45) + bar(c, '#f2b818', function (p) {
        return S(seg(p(-15, 1.5, 7.6), p(-9, 7.5, 5.4)), '#fffbe0', 2, 0.8);
      }) + sparkle(22, 30, 4.5, '#fffbe0') + sparkle(46, 26, 3, '#fff2a0') + sparkle(50, 48, 2.2, '#fff2a0'));
    },
    /* a silver ingot with every edge glowing ember orange, sparks drifting up */
    embersilver_bar: function (c) {
      var col = '#cfd7e2';
      return item(c, glow(c, 32, 40, 30, '#ff6a1a', 0.55) + bar(c, col, function (p) {
        var ed = seg(p(-19, 0, 8), p(19, 0, 8)) + ' ' + seg(p(19, 0, 8), p(19, 0, -8)) + ' ' + seg(p(-19, 0, 8), p(-14, 9, 5)) + ' ' +
          seg(p(19, 0, 8), p(14, 9, 5)) + ' ' + seg(p(19, 0, -8), p(14, 9, -5)) + ' ' + seg(p(-14, 9, 5), p(14, 9, 5)) + ' ' + seg(p(14, 9, 5), p(14, 9, -5));
        return S(ed, '#ff6a14', 2.6, 0.75) + S(ed, '#ffd890', 0.9, 0.9);
      }) + C(18, 22, 1.5, '#ffb040', 0) + C(30, 14, 1.2, '#ffd070', 0) + C(46, 18, 1.4, '#ff8a2a', 0) + C(52, 28, 1, '#ffb040', 0, 0.8) + sparkle(24, 31, 3, '#ffffff'));
    },
    /* ---------- herbs ---------- */
    /* a thistle: spiky grey-green leaves, a scaly bulb and a brush of steel-blue florets, a small bud beside it */
    ironthistle: function (c, nd) {
      var lc = '#6e8a6c', bc = '#7a9470', fl = '#5a8ad0';
      var leafS = function (x, y, a, len) { return G(P(sawLeaf(len, 7, 4), c.lg([lt(lc, 0.3), lc, dk(lc, 0.35)], 0, 0, 1, 0), 1.6) + S('M0,-1 L0,' + (-len + 3), lt(lc, 0.4), 1, 0.8), tr(x, y, a)); };
      var brush = function (x, y, s) {
        var o = '', d = '';
        for (var i = 0; i < 9; i++) { var a = (-155 + i * 16.25) * Math.PI / 180; d += D`M${x},${y} L${x + Math.cos(a) * 14 * s},${y + Math.sin(a) * 14 * s} `; }
        o += S(d, OL, 4.6 * s + 1) + S(d, fl, 3.4 * s) + S(d, lt(fl, 0.5), 1.1 * s, 0.8);
        return o;
      };
      var bulb = function (x, y, s) {
        var d = D`M${x - 9 * s},${y - 2 * s} C${x - 10 * s},${y + 6 * s} ${x - 5 * s},${y + 10 * s} ${x},${y + 10 * s} C${x + 5 * s},${y + 10 * s} ${x + 10 * s},${y + 6 * s} ${x + 9 * s},${y - 2 * s} Z`;
        var sc = D`M${x - 7 * s},${y + 1 * s} L${x - 3 * s},${y + 5 * s} L${x + 1 * s},${y + 1 * s} L${x + 5 * s},${y + 5 * s} L${x + 8 * s},${y + 1 * s} M${x - 5 * s},${y + 7 * s} L${x - 1 * s},${y + 3 * s} L${x + 3 * s},${y + 8 * s}`;
        var sp = D`M${x - 9 * s},${y + 2 * s} L${x - 14 * s},${y + 1 * s} M${x + 9 * s},${y + 2 * s} L${x + 14 * s},${y + 1 * s} M${x - 7 * s},${y + 7 * s} L${x - 11 * s},${y + 10 * s} M${x + 7 * s},${y + 7 * s} L${x + 11 * s},${y + 10 * s}`;
        return S(sp, OL, 2.6) + S(sp, '#d8e0d0', 1.2) + P(d, c.cel(bc), 2) + S(sc, dk(bc, 0.45), 1.1, 0.9);
      };
      var g = leafS(30, 58, -58, 22) + leafS(34, 58, 58, 22) + leafS(32, 58, -18, 16) +
        stem('M32,58 C32,48 31,38 31,30', '#5e7a5a', 2.6) + stem('M32,48 C38,44 42,40 46,36', '#5e7a5a', 2) +
        brush(31, 24, 1) + bulb(31, 24, 1) + brush(47, 32, 0.55) + bulb(47, 32, 0.55);
      return nd ? g : item(c, glow(c, 32, 20, 20, '#8ab8ff', 0.3) + g);
    },
    /* a broad deep-red leaf wrapped round the stem like a hooded cape, a golden spike inside */
    redmantle: function (c, nd) {
      var col = '#b0182a';
      var inner = 'M13,26 C12,14 22,6 34,5 C30,8 46,10 50,22 C52,34 44,48 32,57 C22,48 14,38 13,26 Z';
      var lf = 'M13,24 C11,38 20,51 32,58 C33,48 30,38 23,31 C20,28 16,26 13,24 Z';
      var rf = 'M50,21 C53,36 45,50 32,58 C31,48 34,37 41,30 C44,27 47,24 50,21 Z';
      var g = blade(c, 30, 60, -62, 0.55, '#4a8a38') + blade(c, 34, 60, 62, 0.55, '#4a8a38') +
        P(inner, c.lg([dk(col, 0.25), dk(col, 0.6)], 0, 0, 1, 1), 2.4) +
        stem('M32,56 L32,30', '#4a7a30', 2.6) + P('M29,32 C28,22 30,14 32,12 C34,14 36,22 35,32 Z', c.cel('#f0c840'), 1.6) +
        S('M31,16 L31,29', '#fff4b0', 1, 0.8) +
        P(lf, c.cel(col), 2.2) + P(rf, c.cel(dk(col, 0.08)), 2.2) +
        S('M16,30 C18,40 24,48 31,55 M21,34 C22,40 26,46 30,50', lt(col, 0.35), 1, 0.7) +
        S('M47,27 C46,38 40,47 33,55 M42,33 C40,40 37,46 34,50', lt(col, 0.3), 1, 0.6) +
        S('M14,25 C16,27 19,29 22,30', '#ff9a9a', 1.2, 0.6);
      return nd ? g : item(c, E(32, 59, 14, 3, '#000', 0, 0.35) + g);
    },
    /* a fat bundle of three gnarled brown roots tied with twine, a small leaf tuft on top */
    stoutroot: function (c) {
      var col = '#7a4a2a', l = dk(col, 0.08);
      var r1_ = taper(25, 24, 13, 55, 12, -2), r2_ = taper(32, 25, 32, 61, 15, 1.5), r3_ = taper(39, 24, 52, 54, 12, 2);
      var knob = function (x, y, r) { return C(x, y, r, c.cel(lt(col, 0.05)), 1.4) + S(D`M${x - r * 0.4},${y - r * 0.2} A${r * 0.5},${r * 0.5} 0 0 1 ${x + r * 0.3},${y - r * 0.4}`, lt(col, 0.4), 0.8, 0.8); };
      var hair = 'M14,52 L10,55 M15,48 L10,48 M51,51 L56,53 M49,46 L54,45 M30,58 L27,62 M35,57 L38,61 M22,40 L17,42 M43,39 L48,41';
      return item(c, E(32, 59, 20, 3.5, '#000', 0, 0.35) + S(hair, '#5a3418', 1.2) +
        P(r1_, c.cel(l), 2.2) + P(r3_, c.cel(l), 2.2) + P(r2_, c.cel(col), 2.4) +
        S('M20,38 C19,40 19,42 20,44 M45,38 C46,40 47,42 46,44 M30,42 C32,44 34,44 35,42 M31,51 C32,52 33,52 34,51', dk(col, 0.45), 1.1, 0.9) +
        S('M29,30 C29,38 30,46 31,54', lt(col, 0.35), 1.6, 0.7) +
        knob(18, 44, 2.6) + knob(37, 46, 2.8) + knob(46, 43, 2.2) +
        P('M17,27 C24,32 40,32 47,27 L48,32 C40,37 24,37 16,32 Z', c.cel('#c8a868'), 1.8) + S('M22,30 L24,35 M31,31 L32,36 M40,30 L39,35', dk('#c8a868', 0.4), 1, 0.8) +
        P('M24,26 C26,20 38,20 40,26 C36,28 28,28 24,26 Z', c.cel(dk(col, 0.15)), 1.8) +
        blade(c, 32, 22, -38, 0.5, '#6ab43a') + blade(c, 32, 22, 4, 0.58, '#5aa040') + blade(c, 32, 22, 42, 0.46, '#6ab43a'));
    },
    /* broad translucent purple-grey leaves, overlaps showing through, under a pale dusk crescent */
    dimleaf: function (c, nd) {
      var col = nd ? '#8e74ae' : '#8a7c9e';
      var leafD = 'M0,0 C11,-6 14,-22 0,-33 C-14,-22 -11,-6 0,0 Z';
      var vein = 'M0,-2 L0,-29 M0,-10 L-7,-15 M0,-10 L7,-15 M0,-18 L-6,-23 M0,-18 L6,-23';
      var lf = function (x, y, a, s, cc) {
        return G(P(leafD, c.lg([[0, lt(cc, 0.3), 0.8], [0.5, cc, 0.72], [1, dk(cc, 0.35), 0.82]], 0, 0, 1, 0), 1.7) + S(vein, lt(cc, 0.55), 1, 0.85), tr(x, y, a, s));
      };
      var g = stem('M32,58 C31,53 28,49 26,47 M32,58 C33,53 36,49 38,47 M32,58 L32,44', '#5a5068', 1.8) +
        lf(26, 47, -34, 0.84, col) + lf(38, 47, 34, 0.84, dk(col, 0.06)) + lf(32, 45, 0, 1.02, lt(col, 0.05)) +
        C(28, 30, 1.4, '#f0e8ff', 0, 0.8) + C(44, 30, 1.1, '#f0e8ff', 0, 0.7);
      return nd ? g : item(c, glow(c, 30, 30, 28, '#9a7ac8', 0.35) +
        P('M46,8 C40,8 37,14 38,19 C40,24 46,26 51,23 C46,23 42,19 43,14 C43,11 44,9 46,8 Z', c.lg(['#f0e8ff', '#c8b8e8'], 0, 0, 1, 1), 1.4) +
        C(14, 14, 1, '#e8e0ff', 0, 0.8) + C(56, 34, 0.9, '#e8e0ff', 0, 0.7) + C(20, 8, 0.8, '#e8e0ff', 0, 0.7) + g);
    },
    /* a slim green stem studded with big curved golden spurs, smaller towards the top */
    goldspur: function (c, nd) {
      var g = '#f0b418';
      var spur = function (x, y, dir, s, a) {
        return G(P('M0,-5 C6,-5 11,-8 14,-13.5 C13.6,-6 8.4,0 0,5 Z', c.lg(['#fff8b0', g, '#a86a00'], 0, 0, 1, 1), 1.3) +
          S('M2,-3 C6,-3.4 10,-6 12.4,-10.4', '#fffbe0', 1, 0.8),
          'translate(' + r1(x) + ',' + r1(y) + ') scale(' + (dir * s) + ',' + s + ') rotate(' + (a || 0) + ')');
      };
      var st = 'M30,60 C30,52 34,46 32,38 C30,30 34,24 33,16 L34,8';
      var g = blade(c, 30, 60, -50, 0.5, '#5a9a3a') + blade(c, 30, 60, 50, 0.5, '#5a9a3a') +
        stem(st, '#8a9a34', 2.6) +
        spur(31, 51, -1, 1.25, 4) + spur(33, 42, 1, 1.15, 2) + spur(31, 33, -1, 1.05) + spur(33, 24, 1, 0.92) + spur(33, 16, -1, 0.78) + spur(33.5, 10, 1, 0.6) +
        E(34, 8, 2.4, 3.4, c.cel('#ffd040'), 1.4);
      return nd ? g : item(c, glow(c, 32, 30, 26, '#ffd040', 0.35) + E(30, 60, 12, 2.6, '#000', 0, 0.35) + g +
        sparkle(48, 14, 2.8, '#fffbe0') + sparkle(14, 26, 2.2, '#fff2a0'));
    },
    /* a long pale wispy tuft hanging from a dark twig, like an old hermit's beard */
    hermits_beard: function (c) {
      var col = '#d8d6cc';
      return item(c, glow(c, 32, 36, 24, '#e8f0e0', 0.25) +
        S('M10,40 C10,46 12,50 11,54 M53,30 C54,36 52,40 53,46', OL, 3) + S('M10,40 C10,46 12,50 11,54 M53,30 C54,36 52,40 53,46', col, 1.4) +
        beardBody(c, 2.2) +
        S('M44,30 C48,36 50,42 48,50 M18,34 C14,40 14,46 16,50', col, 1.2, 0.9) +
        S2('M4,15 C14,13 24,16 34,14 C42,12 50,15 60,12', '#5a3a22', 3.2) + S2('M42,13 L48,6', '#5a3a22', 2) +
        S('M8,13.6 C18,12 28,14.6 36,12.8', '#8a6040', 1, 0.8) + blade(c, 48, 7, 40, 0.3, '#7a9a5a'));
    },
    /* broad icy blue-white leaves with frosted rims and rime crystals */
    rimeleaf: function (c, nd) {
      var col = '#9ccbea';
      var leafD = 'M0,0 C9,-5 12,-18 0,-31 C-12,-18 -9,-5 0,0 Z', rim = 'M0,-2.5 C7,-6 9.6,-17 0,-27.5 C-9.6,-17 -7,-6 0,-2.5 Z';
      var lf = function (x, y, a, s, cc) {
        return G(P(leafD, c.lg([lt(cc, 0.55), cc, dk(cc, 0.25)], 0, 0, 1, 0), 1.7) + S(rim, '#ffffff', 1.3, 0.85) + S('M0,-2 L0,-26 M0,-11 L-5,-16 M0,-11 L5,-16', '#5a8ab0', 0.9, 0.8) +
          '<path d="M-8,-12 l-2.2,-1 M8,-12 l2.2,-1 M-6,-21 l-2,-1.6 M6,-21 l2,-1.6 M-3,-28 l-1,-1.8 M3,-28 l1,-1.8" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>', tr(x, y, a, s));
      };
      var g = stem('M32,60 C32,55 30,51 27,48 M32,60 C33,55 35,51 38,48 M32,58 L32,42', '#6a8aa0', 1.8) +
        lf(27, 48, -46, 0.84, col) + lf(38, 48, 44, 0.84, dk(col, 0.06)) + lf(32, 43, 0, 1.02, lt(col, 0.08)) +
        flake(32, 24, 3.6) + flake(21, 35, 2.4) + flake(44, 35, 2.4);
      return nd ? g : item(c, glow(c, 32, 30, 28, '#b8e8ff', 0.45) + E(32, 59, 14, 3, '#000', 0, 0.3) + g + sparkle(50, 14, 3, '#ffffff') + sparkle(14, 18, 2.4, '#e8f8ff'));
    },
    /* ---------- leather, cloth ---------- */
    /* a dark reddish-brown hide rolled into a fat roll (fatter than medium leather), tied with knotted dark thongs */
    heavy_leather: function (c) {
      var col = '#58301c', th = '#24130a';
      var sheet = 'M9,38 C7,30 11,25 7,17 L14,13 L19,17 L26,9 L33,14 L41,8 L47,14 L56,11 C53,21 57,29 55,38 Z';
      var tie = function (x) { return R(x, 29, 4, 27, c.cel(th), 1.5) + E(x + 2, 42, 3.2, 2.4, c.cel(lt(th, 0.15)), 1.4) + S2(D`M${x + 1},44 L${x - 1},50 M${x + 3},44 L${x + 5},50`, lt(th, 0.12), 1.2); };
      return item(c, G(hideRoll(c, col, sheet, 30, 55, 3) + tie(20) + tie(37), 'matrix(0.92,0,0,0.92,2.6,3.4)'));
    },
    /* a very fat near-black hide roll, a wide stitched hem along the roll and the hide edge, one thong tie */
    thick_leather: function (c) {
      var col = '#3c2216', st = '#e0b880';
      var sheet = 'M10,28 C9,22 12,18 9,12 L17,8 L27,11 L37,7 L47,11 L55,8 C54,16 56,22 54,28 Z';
      return item(c, G(hideRoll(c, col, sheet, 22, 56, 4) +
        SD('M12,14 L18,11.4 L27,14 L37,10.4 L47,14 L52,11.6', st, 1.3, '2.4 2', 0.95) +
        S('M10,48 L52,48', dk(col, 0.6), 1.6) + SD('M12,51.5 L49,51.5 M12,44.5 L49,44.5', st, 1.3, '2.6 2.2') +
        R(29, 21, 4.4, 36, c.cel('#1e100a'), 1.5) + S('M30.4,23 L30.4,55', '#5a3a26', 0.9, 0.8), 'matrix(0.88,0,0,0.88,3.8,3.6)'));
    },
    /* a neatly folded stack of shiny lilac silk: rounded folds at the front, a sheen across the top */
    silk_cloth: function (c) {
      var col = '#cc8ad6';
      var top = 'M7,30 C7,27 9,26 11,25.4 L37,17.6 C39,17 41,17 43,17.6 L56,22.6 C59,24 58,26.6 55.6,27.4 L29,36.2 C27,36.8 25,36.8 23,36.2 Z';
      var front = 'M7,30 L23,36.2 C25,36.8 27,36.8 29,36.2 L29,52.2 C27,52.8 25,52.8 23,52.2 L7,46 Z';
      var side = 'M29,36.2 L55.6,27.4 L55.6,43.4 L29,52.2 Z';
      var folds = '';
      for (var i = 0; i < 3; i++) { var y = 36.2 + i * 5.33; folds += D`M7,${30 + i * 5.33} L23,${y} C25,${y + 0.6} 27,${y + 0.6} 29,${y} `; }
      return item(c, glow(c, 32, 34, 26, '#f0b8f8', 0.3) + E(32, 54, 26, 4.5, '#000', 0, 0.4) +
        P(side, c.lg([dk(col, 0.2), dk(col, 0.45)], 0, 0, 1, 0), 2.2) + S('M29,41.5 L55.6,32.7 M29,46.9 L55.6,38.1', dk(col, 0.6), 1.1, 0.8) +
        P(front, c.lg([lt(col, 0.1), dk(col, 0.15)], 0, 0, 1, 0), 2.2) +
        CG(S(folds.replace(/M7,30 [^M]*/, ''), OL, 1.6) + S('M8,33 L23,39 M8,38.4 L23,44.4 M8,43.7 L23,49.7', '#ffffff', 1, 0.45), c.clip(front)) +
        P(top, c.lg([[0, lt(col, 0.5)], [0.5, col], [1, dk(col, 0.1)]], 0, 0, 1, 1), 2.2) +
        S('M14,27.6 L38,20.4 M20,30.6 L46,22.4', '#ffffff', 2, 0.55) + S('M26,33.8 L52,25.4', '#ffffff', 1, 0.5) +
        sparkle(22, 26, 3.6, '#ffffff') + sparkle(48, 12, 2.4, '#fff0ff'));
    },
    /* the same lilac silk wound on a bolt, a gold band and a sheen streak */
    silk_bolt: function (c) {
      return item(c, glow(c, 34, 34, 26, '#f0b8f8', 0.25) + clothBolt(c, '#cc8ad6', '#e8b830', S('M14,26 L42,18', '#ffffff', 2.4, 0.5) + S('M14,34 L43,26', '#ffffff', 1, 0.45)) +
        sparkle(46, 20, 3.4, '#ffffff'));
    },
    /* glossy black faceted coal lumps over a faint red ember glow */
    smithing_coal: function (c) {
      var col = '#2a2a30';
      var lumpC = function (pts, hi) {
        var d = pl(pts) + 'Z';
        return P(d, c.lg([lt(col, 0.18), col, dk(col, 0.5)], 0.2, 0, 0.8, 1), 2.2) + F(pl(hi) + 'Z', '#8a8a9c', 0.55) +
          S(pl([hi[0], hi[1]]), '#d0d0e0', 1, 0.8);
      };
      return item(c, glow(c, 32, 48, 26, '#ff3a1a', 0.55) + E(32, 56, 24, 4, '#000', 0, 0.4) +
        lumpC([[10, 46], [14, 36], [22, 33], [28, 40], [26, 52], [14, 54]], [[14, 37], [22, 34], [20, 40], [15, 42]]) +
        lumpC([[36, 42], [42, 34], [52, 35], [56, 44], [50, 54], [38, 52]], [[42, 35], [51, 36], [48, 41], [43, 41]]) +
        lumpC([[20, 26], [28, 16], [40, 15], [46, 24], [42, 38], [26, 40]], [[28, 17], [39, 16], [35, 24], [27, 24]]) +
        lumpC([[24, 50], [30, 44], [38, 46], [40, 54], [32, 58], [25, 56]], [[30, 45], [37, 47], [34, 50], [29, 49]]) +
        S('M30,52 L33,49 L36,53', '#ff5a2a', 1.4, 0.85) + S('M44,46 L48,44 L50,48', '#ff5a2a', 1.2, 0.75) + S('M32,30 L36,28', '#ff7a3a', 1, 0.5));
    },
    /* a slim dark spool densely wound with fine pale thread, a needle threaded on the loose end */
    fine_thread: function (c) {
      var th = '#efe4c8', wd = '#5a3420', wind = '';
      for (var i = 0; i < 14; i++) wind += 'M22,' + r1(17 + i * 2.5) + ' C27,' + r1(18.6 + i * 2.5) + ' 37,' + r1(18.6 + i * 2.5) + ' 42,' + r1(17 + i * 2.5) + ' ';
      var body = 'M22,15 L42,15 L42,52 C36,55 28,55 22,52 Z';
      var lo = 'M42,36 C50,34 56,30 55,22 C54,16 50,14 48,12';
      return item(c, E(32, 58, 16, 3, '#000', 0, 0.35) +
        G(P('M-1.6,-22 C-1.6,-25 1.6,-25 1.6,-22 L1.1,18 L0,22 L-1.1,18 Z', c.lg(STEEL, 0, 0, 1, 0), 1.4) + E(0, -20, 0.7, 2, OL, 0), tr(46, 34, 28)) +
        E(32, 53, 13, 4.2, c.cel(dk(wd, 0.1)), 2.2) +
        P(body, c.lg([lt(th, 0.4), th, dk(th, 0.28)], 0, 0, 1, 0), 2.2) +
        CG(S(wind, dk(th, 0.22), 0.8, 0.8), c.clip(body)) + S('M26,18 L26,50', '#ffffff', 1.6, 0.6) +
        E(32, 15, 13, 4.2, c.cel(wd), 2.2) + E(32, 15, 3.4, 1.3, '#1a0e06', 1) +
        S(lo, OL, 2.2) + S(lo, th, 1) + S('M48,12 C50,13 52,15 52,17', th, 0.9, 0.9) +
        sparkle(16, 24, 2.6, '#ffffff'));
    },
    /* a squat thick-walled glass vial with two riveted iron bands and a cork */
    sturdy_vial: function (c) {
      var v = 'M19,20 L45,20 L45,47 C45,59 19,59 19,47 Z';
      var band = function (y, h) {
        return R(17, y, 30, h, c.lg(['#c0c8d0', '#7a838d', '#4a525c'], 0, 0, 0, 1), 1.8, null, 1.2) + S('M18.6,' + (y + 1.2) + ' L45.4,' + (y + 1.2), '#ffffff', 0.9, 0.7) +
          C(20.5, y + h / 2, 0.9, '#2a2e34', 0) + C(43.5, y + h / 2, 0.9, '#2a2e34', 0);
      };
      return item(c, E(32, 58, 15, 3, '#000', 0, 0.35) + C(32, 38, 24, c.rg([[0, '#c8e8ff', 0.25], [1, '#c8e8ff', 0]]), 0) +
        F(v, c.lg([[0, '#ffffff', 0.8], [0.5, '#b8d4e4', 0.55], [1, '#7898b0', 0.8]], 0, 0, 1, 0)) + S(v, OL, 4) + S(v, '#cfe6f4', 2, 0.8) +
        S('M24,26 L24,50', '#ffffff', 2.6, 0.85) + S('M40.5,28 L40.5,48', '#8ab0c8', 1.4, 0.6) +
        P('M24,12 L40,12 L40,20 L24,20 Z', c.lg(['#f4fbff', '#a8c4d8'], 0, 0, 1, 0), 1.8) + cork(c, 32, 4, 14, 9) +
        band(16, 6) + band(39, 5) + sparkle(50, 24, 3, '#ffffff'));
    }
  };

  /* ================= gathering nodes (96x96, transparent; same style as the art_icons3.js nodes) ================= */
  var NSW = 3.4;   /* node outline: ~1.6px once the node is shown ~46px wide */
  function nshadow(c, rx) { return E(48, 86, rx || 40, 7, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]]), 0); }
  function flat(pts, y) { return pts.map(function (p) { return [p[0], Math.min(p[1], y)]; }); }
  function nrock(c, cx, cy, rx, ry, seed, col, inner) {
    var d = blob(flat(lump(cx, cy, rx, ry, seed, 9, 0.22), 86)), cl = c.clip(d);
    return P(d, c.cel(col), NSW) + CG(F('M' + r1(cx - rx * 0.1) + ',0 L96,0 L96,96 L' + r1(cx + rx * 0.2) + ',96 C' + r1(cx + rx * 0.5) + ',' + r1(cy) + ' ' + r1(cx + rx * 0.2) + ',' + r1(cy - ry * 0.5) + ' ' + r1(cx - rx * 0.1) + ',0 Z', dk(col, 0.3), 0.8) +
      E(cx - rx * 0.35, cy - ry * 0.5, rx * 0.3, ry * 0.14, lt(col, 0.35), 0, 0.7) + (inner || ''), cl);
  }
  function nvein(pts, deep, col, w) { var d = pl(pts); return S(d, deep, w + 3) + S(d, col, w) + S(d, lt(col, 0.5), w * 0.35, 0.8); }
  function nnug(c, x, y, r, cols, seed) { var d = pl(lump(x, y, r, r * 0.8, seed, 6, 0.4)) + 'Z'; return P(d, c.lg(cols, 0.2, 0, 0.8, 1), 2) + C(x - r * 0.3, y - r * 0.3, r * 0.3, '#ffffff', 0, 0.9); }
  /* big outcrop (inner drawn clipped to it) plus two small loose rocks */
  function outcrop(c, rock, seed, inner, small) {
    return nshadow(c, 42) + nrock(c, 50, 58, 32, 30, seed, rock, inner) +
      nrock(c, 20, 80, 14, 10, 17, dk(rock, 0.08), small || '') + nrock(c, 80, 82, 12, 8, 23, lt(rock, 0.05));
  }
  function nblade(c, x, y, a, s, col, w) { return G(P('M0,0 C' + (w || 5) + ',-8 ' + (w || 5) + ',-24 0,-34 C-' + (w || 5) + ',-24 -' + (w || 5) + ',-8 0,0 Z', c.lg([lt(col, 0.3), col, dk(col, 0.35)], 0, 0, 1, 0), 2.2) + S('M0,-2 L0,-28', dk(col, 0.45), 1.2, 0.8), tr(x, y, a, s)); }
  function nstem(d, col, w) { return S(d, OL, w + 3) + S(d, col, w); }
  /* an item-icon herb glyph (base at 32,59 in the 64 box) planted at the node's ground line (48,86), scale s */
  function plant(g, s, dx) { return G(g, 'matrix(' + s + ',0,0,' + s + ',' + r1(48 + (dx || 0) - 32 * s) + ',' + r1(86 - 59 * s) + ')'); }
  function phNode(c) {
    var d = blob(flat(lump(48, 68, 24, 20, 5, 8, 0.2), 86));
    return nshadow(c, 30) + P(d, c.cel('#8a8a86'), NSW) + CG(F('M50,40 L96,40 L96,96 L54,96 Z', '#000', 0.2), c.clip(d));
  }
  var NODES = {
    /* dark blue-grey outcrop with dull steel seams, many grey metal flecks and rust patches; no shine (silver has it) */
    iron: function (c) {
      var fe = ['#e8ecf0', '#98a0aa', '#40464e'], r = rng(19), fl = '';
      for (var i = 0; i < 14; i++) fl += nnug(c, 26 + r() * 46, 38 + r() * 40, 2.6 + r() * 2.4, fe, 30 + i);
      return outcrop(c, '#4a5260', 29,
        E(34, 70, 9, 5, '#7a3a1e', 0, 0.55) + E(64, 48, 8, 4, '#7a3a1e', 0, 0.5) + E(58, 78, 6, 3.4, '#8a4424', 0, 0.5) +
        nvein([[22, 60], [36, 54], [50, 60], [64, 50], [80, 56]], '#2a3038', '#8a949e', 3.6) + fl,
        nnug(c, 18, 77, 3, fe, 9) + nnug(c, 24, 80, 2.4, fe, 11));
    },
    /* warm grey outcrop split by bright branching gold veins and nuggets, a soft yellow glow and glints */
    gold: function (c) {
      var au = ['#fffbd0', '#ffcc1e', '#9a6a00'];
      return C(52, 52, 34, c.rg([[0, '#ffd040', 0.35], [1, '#ffd040', 0]]), 0) +
        outcrop(c, '#7a6e62', 41,
          nvein([[20, 62], [34, 52], [46, 58], [58, 44], [80, 50]], '#5a3c00', '#ffcc1e', 5) + nvein([[46, 58], [52, 72], [66, 78]], '#5a3c00', '#ffcc1e', 4) +
          nvein([[58, 44], [62, 32]], '#5a3c00', '#ffcc1e', 3.4) +
          nnug(c, 34, 52, 6, au, 3) + nnug(c, 58, 44, 7, au, 5) + nnug(c, 52, 71, 5, au, 7) + nnug(c, 72, 62, 4, au, 9),
          nnug(c, 20, 77, 3.6, au, 11)) +
        sparkle(58, 42, 9, '#fffbe0') + sparkle(34, 50, 5, '#fff2a0') + sparkle(80, 30, 4, '#fff2a0');
    },
    /* near-black outcrop with silver nuggets, cracked open by glowing ember-orange fissures, sparks rising */
    embersilver: function (c) {
      var ag = ['#ffffff', '#d8e0ea', '#6a7484'];
      var cr = [[[20, 56], [30, 62], [38, 54], [48, 64], [58, 56], [68, 66], [82, 58]], [[48, 64], [46, 80]], [[58, 56], [62, 40], [56, 32]]];
      return C(50, 58, 36, c.rg([[0, '#ff6a1a', 0.45], [1, '#ff6a1a', 0]]), 0) +
        outcrop(c, '#36343c', 53,
          C(48, 62, 22, c.rg([[0, '#ff5a10', 0.5], [1, '#ff5a10', 0]]), 0) +
          cr.map(function (v) { return nvein(v, '#4a0e00', '#ff6a14', 4); }).join('') + cr.map(function (v) { return S(pl(v), '#ffe08a', 1.4); }).join('') +
          nnug(c, 34, 46, 6, ag, 3) + nnug(c, 68, 48, 6, ag, 5) + nnug(c, 56, 76, 5, ag, 7) + nnug(c, 30, 74, 4.4, ag, 9),
          S('M14,78 L20,80 L26,76', '#ff6a14', 2, 0.9)) +
        C(36, 22, 2, '#ffb040', 0) + C(58, 16, 1.7, '#ffd070', 0) + C(70, 26, 1.5, '#ff8a2a', 0) + C(46, 10, 1.3, '#ffb040', 0, 0.8) +
        sparkle(68, 46, 6, '#ffffff');
    },
    /* the item thistle grown big: spiky grey-green leaves, scaly bulbs with steel-blue brushes */
    ironthistle: function (c) {
      return nshadow(c, 32) + nblade(c, 26, 86, -62, 0.55, '#5e7a5a') + nblade(c, 70, 86, 62, 0.55, '#5e7a5a') + plant(NEW.ironthistle(c, true), 1.42);
    },
    /* the red hooded mantle leaf with its golden spike, a smaller second mantle beside it */
    redmantle: function (c) {
      return nshadow(c, 32) + plant(NEW.redmantle(c, true), 0.8, 20) + plant(NEW.redmantle(c, true), 1.3, -6);
    },
    /* fat gnarled roots arching out of a dark soil mound and diving back in, round a knobbly crown with a leaf tuft */
    stoutroot: function (c) {
      var col = '#8a5430', mound = 'M16,86 C20,78 34,73 48,73 C62,73 76,78 80,86 Z';
      var lr = taper(40, 72, 10, 84, 16, 22), rr = taper(56, 72, 88, 82, 15, -22), br = taper(36, 78, 26, 62, 8, 4);
      var knob = function (x, y, r) { return C(x, y, r, c.cel(lt(col, 0.06)), 2) + S(D`M${x - r * 0.5},${y - r * 0.2} A${r * 0.55},${r * 0.55} 0 0 1 ${x + r * 0.3},${y - r * 0.5}`, lt(col, 0.4), 1.2, 0.8); };
      return nshadow(c, 42) +
        P(br, c.cel(dk(col, 0.1)), NSW * 0.8) + P(lr, c.cel(dk(col, 0.04)), NSW) + P(rr, c.cel(dk(col, 0.04)), NSW) +
        P(mound, c.cel('#4e3220'), NSW) + CG(F('M52,60 L96,60 L96,96 L56,96 C64,80 60,70 52,60 Z', '#000', 0.25) + C(30, 82, 2, '#24160c', 0) + C(66, 83, 2.2, '#24160c', 0) + C(48, 84, 1.6, '#24160c', 0), c.clip(mound)) +
        P('M34,74 C31,60 36,48 48,46 C60,48 65,60 62,74 C54,78 42,78 34,74 Z', c.cel(col), NSW) +
        S('M37,62 C44,65 52,65 59,62 M36,69 C44,72 52,72 60,69 M40,54 C45,56 51,56 56,54', dk(col, 0.45), 1.6, 0.9) + S('M40,52 C38,58 38,64 39,70', lt(col, 0.35), 2.2, 0.7) +
        S('M20,66 C22,64 24,64 26,65 M70,64 C72,63 74,63 76,65', dk(col, 0.45), 1.6, 0.9) +
        knob(22, 70, 3.4) + knob(74, 69, 3.2) + knob(58, 58, 2.8) +
        E(13, 84, 6, 2.6, c.cel('#5a3a22'), 2) + E(85, 83, 6, 2.6, c.cel('#5a3a22'), 2) +
        nblade(c, 48, 48, -34, 0.62, '#6ab43a') + nblade(c, 48, 48, 4, 0.72, '#5aa040') + nblade(c, 48, 48, 40, 0.58, '#6ab43a');
    },
    /* broad translucent purple-grey leaves fanned from the ground, faint pale motes */
    dimleaf: function (c) {
      return nshadow(c, 36) + plant(NEW.dimleaf(c, true), 1.6) + C(22, 34, 1.6, '#e8e0ff', 0, 0.8) + C(76, 30, 1.4, '#e8e0ff', 0, 0.7) + C(60, 14, 1.2, '#e8e0ff', 0, 0.7);
    },
    /* two slim stems studded with big golden spurs, smaller towards the tops */
    goldspur: function (c) {
      return nshadow(c, 30) + plant(NEW.goldspur(c, true), 1.0, 16) + plant(NEW.goldspur(c, true), 1.4, -6) + sparkle(30, 30, 4, '#fffbe0') + sparkle(70, 40, 3.4, '#fff2a0');
    },
    /* a low twisted dark shrub with long pale wispy beards of strands hanging from its branches */
    hermits_beard: function (c) {
      var wd = '#5a3a22', br = 'M48,86 C44,78 52,70 47,62 C43,56 49,50 47,44 M47,62 C38,56 28,50 14,44 M47,52 C56,46 66,40 82,36 M47,44 C46,36 50,30 56,22 M26,50 C24,44 26,38 22,32 M66,42 C68,36 66,30 70,24';
      /* a beard of wavy pale strands hanging from x0..x1 at height y (tilted by dy), longest in the middle and drawing
       * together towards the tip; drawn under the branches so it hangs from them, outlines first so the strands merge */
      var rr = rng(7);
      var beard = function (x0, x1, y, dy, len, n) {
        var d = '', hi = '', m = (x0 + x1) / 2;
        for (var i = 0; i < n; i++) {
          var t = i / (n - 1), x = x0 + (x1 - x0) * t, y0 = y + dy * (t - 0.5), L = len * (0.45 + 0.55 * Math.sin(Math.PI * t)) * (0.85 + rr() * 0.3), sw = (i % 2 ? 1 : -1) * (1.2 + rr() * 1.4), ex = x + (m - x) * 0.5;
          d += D`M${x},${y0} C${x - sw},${y0 + L * 0.35} ${ex + sw},${y0 + L * 0.7} ${ex},${y0 + L} `;
          if (i % 2) hi += D`M${x + 0.5},${y0 + 3} C${x - sw + 0.5},${y0 + L * 0.35} ${ex + sw},${y0 + L * 0.55} ${ex + 0.5},${y0 + L * 0.65} `;
        }
        return S(d, OL, 5) + S(d, '#d6d4ca', 2.6) + S(hi, '#ffffff', 1, 0.8);
      };
      return nshadow(c, 36) + beard(14, 38, 48, 7, 34, 9) + beard(56, 82, 40, -7, 42, 10) +
        nstem(br, wd, 4.6) + S('M46,82 C44,76 50,70 46,62', '#8a6040', 1.4, 0.8) +
        nblade(c, 22, 32, -20, 0.3, '#7a9a5a') + nblade(c, 70, 24, 20, 0.3, '#7a9a5a') + nblade(c, 56, 22, 30, 0.32, '#7a9a5a') + nblade(c, 14, 44, -60, 0.26, '#7a9a5a') + nblade(c, 82, 36, 60, 0.26, '#7a9a5a');
    },
    /* icy blue-white leaves with frosted rims and rime crystals over a patch of frost */
    rimeleaf: function (c) {
      return nshadow(c, 34) + E(48, 85, 28, 5, c.rg([[0, '#f0faff', 0.85], [1, '#c8e8ff', 0]]), 0) +
        plant(NEW.rimeleaf(c, true), 1.45) + flake(20, 80, 3) + flake(78, 81, 2.6) + sparkle(74, 30, 4, '#ffffff') + sparkle(22, 40, 3.4, '#e8f8ff');
    }
  };

  /* ================= extend the public API ================= */
  var has = function (t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); };
  function phIcon(c) { return iconWrap(c, ['#5a5a62', '#1a1a1e'], C(32, 32, 12, '#8a8a92', 2)); }
  function make(k) {
    try { var c = new Ctx(); return c.svg(64, 64, NEW[k](c)); } catch (e) {
      try { var c2 = new Ctx(); return c2.svg(64, 64, phIcon(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" fill="#444"/></svg>'; }
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
