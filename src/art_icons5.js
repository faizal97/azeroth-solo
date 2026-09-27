/* art_icons5.js - more spell icons for Azeroth Solo (24 keys: the level 26 and 28 class abilities, two per class,
 * plus the six missing racial abilities).
 * Loads AFTER art.js, art_icons2.js, art_icons3.js and art_icons4.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Gradient ids use the prefix i5<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i5' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  function stk(sw) { return sw === 0 ? '' : ' stroke="' + OL + '" stroke-width="' + (sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function opa(o) { return o != null && o !== 1 ? ' opacity="' + o + '"' : ''; }
  function P(d, fill, sw, o) { return '<path d="' + d + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function F(d, fill, o) { return P(d, fill, 0, o); }
  function S(d, col, w, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + opa(o) + '/>'; }
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
  function star(cx, cy, n, ro, ri, rot) {
    var d = '', a;
    for (var i = 0; i < n * 2; i++) {
      a = (rot || 0) + i * Math.PI / n - Math.PI / 2;
      var rr = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * rr) + ',' + r1(cy + Math.sin(a) * rr);
    }
    return d + 'Z';
  }
  function ring2(cx, cy, rx, ry, col, w, o) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + OL + '" stroke-width="' + (w + 2.6) + '"' + opa(o) + '/>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"' + opa(o) + '/>';
  }

  /* ---- icon parts ---- */
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75), 0) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72), 0) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      S('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + S('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function glow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]]), 0); }
  function flameD(cx, cy, s) {
    return D`M${cx},${cy - 22 * s} C${cx + 6 * s},${cy - 12 * s} ${cx + 14 * s},${cy - 6 * s} ${cx + 13 * s},${cy + 6 * s} C${cx + 12 * s},${cy + 15 * s} ${cx + 5 * s},${cy + 19 * s} ${cx},${cy + 19 * s} C${cx - 6 * s},${cy + 19 * s} ${cx - 13 * s},${cy + 14 * s} ${cx - 13 * s},${cy + 5 * s} C${cx - 13 * s},${cy - 4 * s} ${cx - 6 * s},${cy - 8 * s} ${cx - 4 * s},${cy - 15 * s} C${cx - 2 * s},${cy - 10 * s} ${cx},${cy - 10 * s} ${cx},${cy - 22 * s} Z`;
  }
  function flameC(cx, cy, s, cols) {
    return P(flameD(cx, cy, s), cols[0], 2) + F(flameD(cx, cy + 5 * s, s * 0.7), cols[1]) + F(flameD(cx, cy + 9 * s, s * 0.42), cols[2]);
  }
  var FIRE = ['#e03c14', '#ff9a1f', '#ffe868'];
  function shard(c, x, y, a, s, col) {
    col = col || '#9fe0ff';
    return G(P('M0,-24 L7,-5 L0,22 L-7,-5 Z', c.lg([lt(col, 0.6), col, dk(col, 0.45)], 0, 0, 1, 0), 2) + F('M0,-24 L0,22 L-7,-5 Z', '#ffffff', 0.35) + S('M0,-20 L0,18', '#ffffff', 1, 0.6),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(a) + ') scale(' + s + ')');
  }
  function burst(c, x, y, ro, ri, n, cols) {
    return P(star(x, y, n, ro, ri), cols[0], 2) + F(star(x, y, n, ro * 0.68, ri * 0.7, 0.2), cols[1]) + F(star(x, y, n, ro * 0.38, ri * 0.4), cols[2]);
  }
  function sparkle(x, y, r, col) { return F(D`M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r} Z`, col); }
  function rays(x, y, n, r0, r1_, col, w, o, a0) {
    var d = '';
    for (var i = 0; i < n; i++) { var a = (a0 || 0) + i / n * Math.PI * 2; d += D`M${x + Math.cos(a) * r0},${y + Math.sin(a) * r0} L${x + Math.cos(a) * r1_},${y + Math.sin(a) * r1_}`; }
    return S(d, col, w, o);
  }
  var WP = {
    sword: function (c) {
      return P('M-3.4,-5 L-3.4,-40 L0,-48 L3.4,-40 L3.4,-5 Z', c.lg(STEEL, 0, 0, 1, 0), 2) + S('M0,-9 L0,-40', '#8e99a5', 1.2) +
        P('M-2.4,-3 L2.4,-3 L2.4,9 L-2.4,9 Z', LEATH, 2) + P('M-11,-7 Q0,-3.5 11,-7 L11,-3 Q0,0.5 -11,-3 Z', c.cel(GOLD), 2) + C(0, 11.5, 3.2, c.cel(GOLD), 2);
    },
    dagger: function (c) {
      return P('M-2.8,-4 L-2.8,-21 L0,-28 L2.8,-21 L2.8,-4 Z', c.lg(STEEL, 0, 0, 1, 0), 2) + P('M-2.2,-2 L2.2,-2 L2.2,7 L-2.2,7 Z', '#3a2a20', 1.8) +
        P('M-7,-5.5 L7,-5.5 L7,-2 L-7,-2 Z', c.cel('#a0a0aa'), 1.8) + C(0, 8.5, 2.4, '#a0a0aa', 1.6);
    },
    greataxe: function (c) {
      return P('M-2.4,16 L-2.4,-36 L2.4,-36 L2.4,16 Z', c.cel(WOOD), 2) + S('M-2.4,6 L2.4,8 M-2.4,11 L2.4,13', LEATH, 1.6) +
        P('M1.5,-36 C10,-46 22,-44 24,-40 C26,-30 24,-18 20,-12 C14,-18 8,-20 1.5,-20 Z', c.lg(STEEL, 0, 0, 1, 0), 2.2) +
        S('M21,-39 C23,-30 22,-20 19,-14', '#ffffff', 1.4, 0.8) +
        P('M-1.5,-34 L-10,-30 L-10,-24 L-1.5,-22 Z', c.lg(STEEL, 0, 0, 1, 0), 1.8) + C(0, -38, 2.6, c.cel(GOLD), 1.6);
    }
  };
  function wpn(c, k, x, y, a, s) { return G((WP[k] || WP.sword)(c), 'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + a + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '')); }
  function arrowG(c, x, y, a, s, head, shaft, fl) {
    return G(S('M0,24 L0,-16', OL, 5) + S('M0,24 L0,-16', shaft || '#c9a878', 2.6) +
      P('M0,-26 L6,-14 L0,-17 L-6,-14 Z', head || c.lg(STEEL, 0, 0, 1, 0), 1.8) +
      P('M0,14 L-6,22 L-6,30 L0,23 Z', fl || '#b8342a', 1.5) + P('M0,14 L6,22 L6,30 L0,23 Z', fl || '#b8342a', 1.5),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(a) + ') scale(' + s + ')');
  }
  function skullG(c, x, y, s, col, eye) {
    var d = 'M-13,-2 C-14,-16 -6,-20 0,-20 C6,-20 14,-16 13,-2 C13,4 10,6 9,8 L9,13 L-9,13 L-9,8 C-10,6 -13,4 -13,-2 Z';
    return G(P(d, c.cel(col), 2.2) + F('M-11,-6 C-11,-15 -5,-18 0,-18 C-6,-15 -9,-10 -9,-4 Z', '#ffffff', 0.35) +
      E(-5.5, -2, 4.2, 4.6, '#140a14', 1.2) + E(5.5, -2, 4.2, 4.6, '#140a14', 1.2) +
      (eye ? C(-5.5, -1.6, 2.2, eye, 0) + C(5.5, -1.6, 2.2, eye, 0) : '') +
      P('M0,3 L-2.4,7.5 L2.4,7.5 Z', '#140a14', 1) + S('M-4.5,9.5 L-4.5,13 M0,9.5 L0,13 M4.5,9.5 L4.5,13', OL, 1.2),
      'translate(' + r1(x) + ',' + r1(y) + ') scale(' + s + ')');
  }
  function drop(x, y, s, col) { return P(D`M${x},${y - 5 * s} C${x - 3 * s},${y} ${x - 3 * s},${y + 3 * s} ${x},${y + 3 * s} C${x + 3 * s},${y + 3 * s} ${x + 3 * s},${y} ${x},${y - 5 * s} Z`, col || '#d8141a', 1.2); }
  function leaf(c, x, y, a, s, col) {
    col = col || '#6ab43a';
    return G(P('M0,0 C5,-4 5,-13 0,-18 C-5,-13 -5,-4 0,0 Z', c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 1, 0), 1.6) + S('M0,-1.5 L0,-15', dk(col, 0.45), 0.9),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + a + ') scale(' + s + ')');
  }
  /* stroked arc of a circle from angle a0 to a1 (degrees, 0 = right, clockwise), outline under a coloured core */
  function arc(cx, cy, r, a0, a1, col, w, o) { return earc(cx, cy, r, r, a0, a1, col, w, o); }
  /* same on an ellipse (rx, ry) */
  function earc(cx, cy, rx, ry, a0, a1, col, w, o) {
    var p0 = [cx + Math.cos(a0 * Math.PI / 180) * rx, cy + Math.sin(a0 * Math.PI / 180) * ry], p1 = [cx + Math.cos(a1 * Math.PI / 180) * rx, cy + Math.sin(a1 * Math.PI / 180) * ry];
    var d = D`M${p0[0]},${p0[1]} A${rx},${ry} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${p1[0]},${p1[1]}`;
    return S(d, OL, w + 2.6, o) + S(d, col, w, o);
  }
  /* merged cloud: every puff outlined first, then filled on top so the inner seams vanish */
  function cloud(c, puffs, col) {
    var a = '', b = '', f = c.cel(col);
    puffs.forEach(function (p) { a += C(p[0], p[1], p[2], OL, 0) + C(p[0], p[1], p[2] + 1.3, OL, 0); b += C(p[0], p[1], p[2], f, 0); });
    return a + b;
  }
  function plusS(x, y, r, col, w) { var d = D`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`; return S(d, OL, w + 2.6) + S(d, col, w); }

  /* ---- batch 5 parts ---- */
  /* smooth open curve through points (Catmull-Rom as cubic Beziers) */
  function smooth(pts) {
    var d = 'M' + r1(pts[0][0]) + ',' + r1(pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += D` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  }
  /* jagged lightning polyline from a to b with n kinks (deterministic offsets) */
  var ZIG = [1, -0.7, 1.15, -1, 0.8, -1.2, 0.9, -0.85];
  function zig(ax, ay, bx, by, n, amp, ph) {
    var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L, d = D`M${ax},${ay}`;
    for (var i = 1; i < n; i++) { var t = i / n, k = ZIG[(i + (ph || 0)) % ZIG.length] * amp; d += D` L${ax + dx * t + nx * k},${ay + dy * t + ny * k}`; }
    return d + D` L${bx},${by}`;
  }
  function bolt(d, w) { return S(d, OL, w + 3) + S(d, '#8ad4ff', w) + S(d, '#ffffff', w * 0.4); }
  /* one chain link: flat (ellipse seen face-on) or edge-on (a short bar) */
  function linkF(x, y, rx, ry, rot) {
    return G('<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + OL + '" stroke-width="5.4"/>' +
      '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#b8c0c8" stroke-width="2.8"/>' +
      S(D`M${-rx * 0.7},${-ry * 0.75} Q0,${-ry * 1.1} ${rx * 0.7},${-ry * 0.75}`, '#ffffff', 1, 0.8), 'translate(' + r1(x) + ',' + r1(y) + ')' + (rot ? ' rotate(' + rot + ')' : ''));
  }
  function linkE(x, y, h, rot) {
    var d = D`M${-h},0 L${h},0`;
    return G(S(d, OL, 5.6) + S(d, '#8a949e', 3) + S(D`M${-h + 1},-0.6 L${h - 1},-0.6`, '#e0e6ec', 0.9, 0.8), 'translate(' + r1(x) + ',' + r1(y) + ')' + (rot ? ' rotate(' + rot + ')' : ''));
  }
  /* filled crescent trail along an ellipse from angle a0 to a1 (degrees), width tapering w0 -> w1 */
  function trailE(cx, cy, rx, ry, a0, a1, w0, w1) {
    var o = [], n = 28, i;
    for (i = 0; i <= n; i++) {
      var t = i / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180, w = (w0 + (w1 - w0) * t) / 2;
      o.push([cx + Math.cos(a) * (rx + w), cy + Math.sin(a) * (ry + w * 0.9), cx + Math.cos(a) * (rx - w), cy + Math.sin(a) * (ry - w * 0.9)]);
    }
    var d = '';
    for (i = 0; i <= n; i++) d += (i ? 'L' : 'M') + r1(o[i][0]) + ',' + r1(o[i][1]);
    for (i = n; i >= 0; i--) d += 'L' + r1(o[i][2]) + ',' + r1(o[i][3]);
    return d + 'Z';
  }
  /* tiny five-point dizzy star */
  function dstar(x, y, r) { return P(star(x, y, 5, r, r * 0.45), '#ffe23a', 1.2); }

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a sword driving straight down through a raised blade, the guard snapping into a V at a red-gold burst */
    overpower: function (c) {
      var bl = c.lg(STEEL, 0, 0, 0, 1);
      var left = G(P('M9,33.2 L29.4,33 L32,35.4 L29.8,36.8 L32.4,39.6 L9,40 Z', bl, 2.2) + S('M11,36.6 L28,36.4', '#8e99a5', 1.1) +
        P('M-3,34.4 L5,34.4 L5,38.8 L-3,38.8 Z', LEATH, 1.8) + P('M5,28 L9.4,28 L9.4,45 L5,45 Z', c.cel(GOLD), 1.8), 'rotate(15 6 36)');
      var right = G(P('M34.6,33 L57,33.4 L66,36.4 L57,39.6 L34.6,39.6 L37,37.4 L34.2,35.4 Z', bl, 2.2) + S('M37,36.4 L60,36.4', '#8e99a5', 1.1), 'rotate(-15 64 36)');
      return iconWrap(c, ['#b8481e', '#1e0604'],
        glow(c, 32, 40, 30, '#ffb050', 0.75) +
        S('M22,4 L22,26 M42,4 L42,26 M16,12 L16,28 M48,12 L48,28', '#fff0d0', 1.8, 0.4) +
        left + right +
        wpn(c, 'sword', 32, 5, 180, 1.08) +
        rays(32, 41, 14, 5, 19, '#fff6c0', 2.2, 0.9, 0.1) +
        burst(c, 32, 41, 11, 4, 9, ['#e8281a', '#ffb030', '#ffffff']) +
        P('M18,52 L21,49 L22,54 Z M44,53 L47,50 L48,55 Z M12,46 L15,44 L16,48 Z M52,47 L55,45 L55,50 Z', '#d8dee4', 1.2) +
        C(54, 30, 1.4, '#ffe868', 0) + C(10, 28, 1.3, '#ffe868', 0) + C(26, 58, 1.2, '#fff6c0', 0) + C(40, 60, 1.2, '#fff6c0', 0));
    },
    /* warrior: a helmeted warrior with a greatsword swung out flat, a tapering ring of blade trail spinning round his waist */
    whirlwind: function (c) {
      var cx = 28, cy = 42, st = c.lg(STEEL, 0.2, 0, 0.8, 1), sk = '#d0986a';
      var sword = function (tf, o) { return G(WP.sword(c), tf, o); };
      var fig = P('M10,64 L14,44 C15,35 21,31 28,31 C35,31 41,35 42,44 L46,64 Z', c.cel('#7a4a2a'), 2.4) +
        S('M28,32 L28,64', dk('#7a4a2a', 0.4), 1.4, 0.8) +
        E(14.5, 35, 7.4, 5.4, st, 2.2) + E(41.5, 35, 7.4, 5.4, st, 2.2) +
        S('M14,38 C15,45 22,47 30,45', OL, 8.6) + S('M14,38 C15,45 22,47 30,45', sk, 5.4) +
        S('M42,38 C42,43 39,45 34,45', OL, 8.6) + S('M42,38 C42,43 39,45 34,45', sk, 5.4) +
        C(28, 22, 9, c.cel(sk), 2.4) +
        P('M18.5,19.5 C18.5,11 23,7 28,7 C33,7 37.5,11 37.5,19.5 L37.5,20.5 L18.5,20.5 Z', st, 2.4) +
        S('M28,8.5 L28,24', OL, 4) + S('M28,8.5 L28,24', '#c2cad3', 1.8) +
        S('M22,23.8 L25.5,24.3 M30.5,24.3 L34,23.8', OL, 2) + S('M24.5,28 L31.5,28', OL, 1.8);
      return iconWrap(c, ['#a8582a', '#1c0804'],
        glow(c, 30, 34, 30, '#ffc890', 0.55) +
        P(trailE(cx, cy, 30, 12, 186, 350, 4.4, 1), '#f4e8d8', 1.2, 0.7) +
        sword('translate(22,45) rotate(-84) scale(1.02)', 0.32) +
        fig +
        P(trailE(cx, cy, 30, 12, 2, 204, 13, 1.2), c.lg(['#ffffff', '#fff6ea', '#f0dcc4']), 2) +
        S(D`M${cx + 30},${cy + 1} A30,12 0 0 1 ${cx - 8},${cy + 11.6}`, '#c8b098', 1.2, 0.7) +
        sword('translate(31,45) rotate(97) scale(1.12)', 1) +
        C(30, 45, 3.4, c.cel(sk), 1.6) + C(34.5, 45.4, 3.2, c.cel(sk), 1.6) +
        S('M58,32 C60,28 60,24 58,20 M4,32 C3,28 4,24 6,21', '#fff4e8', 1.6, 0.6));
    },
    /* mage: a dark storm cloud dropping a slanting rain of ice shards */
    blizzard: function (c) {
      var sh = '', i, pts = [[12, 36, 0.4], [26, 46, 0.46], [42, 36, 0.44], [56, 48, 0.4], [18, 58, 0.34], [36, 60, 0.36], [50, 26, 0.3], [28, 28, 0.3], [6, 52, 0.28]];
      for (i = 0; i < pts.length; i++) sh += shard(c, pts[i][0], pts[i][1], 200, pts[i][2], '#bfeeff');
      var snow = [[8, 30], [20, 40], [34, 30], [46, 44], [58, 36], [14, 50], [30, 54], [44, 58], [58, 60], [24, 36], [54, 18]];
      var sn = ''; for (i = 0; i < snow.length; i++) sn += C(snow[i][0], snow[i][1], 1.3, '#ffffff', 0, 0.85);
      return iconWrap(c, ['#3a7ac8', '#040c24'],
        glow(c, 32, 40, 30, '#bfeeff', 0.5) +
        S('M14,24 L4,52 M30,24 L20,56 M46,24 L36,56 M60,26 L52,50', '#e8fbff', 1.2, 0.35) +
        sh + sn +
        cloud(c, [[8, 12, 9], [20, 7, 10], [34, 8, 11], [48, 8, 10], [60, 12, 8], [14, 18, 8], [28, 18, 8.5], [42, 18, 8.5], [55, 19, 7]], '#4a5876') +
        S('M8,16 C14,12 20,14 24,12 M34,14 C40,10 46,12 50,11', '#8a9ab8', 1.4, 0.8) +
        F('M0,21 C10,24 20,22 32,24 C44,22 54,24 64,21 L64,23 C54,27 44,26 32,27 C20,26 10,27 0,23 Z', '#1a2036', 0.6));
    },
    /* mage: a small white-hot core, a dark gap, then a ring of flame tongues blown outward behind a shock ring */
    blast_wave: function (c) {
      var cx = 32, cy = 32, fl = '', tk = '', i;
      for (i = 0; i < 12; i++) {
        var a = i / 12 * 360 + 15, rad = a * Math.PI / 180, b = rad + Math.PI / 12;
        fl += G(flameC(0, 0, 0.4, FIRE), 'translate(' + r1(cx + Math.cos(rad) * 22) + ',' + r1(cy + Math.sin(rad) * 22) + ') rotate(' + r1(a + 90) + ')');
        tk += D`M${cx + Math.cos(b) * 25},${cy + Math.sin(b) * 25} L${cx + Math.cos(b) * 31},${cy + Math.sin(b) * 31}`;
      }
      return iconWrap(c, ['#a8280a', '#140100'],
        glow(c, cx, cy, 32, '#ff9a3a', 0.6) +
        C(cx, cy, 15, '#2a0600', 0, 0.75) +
        S(tk, '#ffd080', 1.6, 0.7) +
        fl +
        ring2(cx, cy, 15, 15, '#fff4c0', 3.2) +
        C(cx, cy, 7.5, c.rg([[0, '#ffffff'], [0.5, '#fff6c0'], [1, '#ffa030']]), 2) +
        rays(cx, cy, 8, 9, 13, '#ffe0a0', 1.4, 0.8, 0.4));
    },
    /* priest: bright purple tendrils dragged out of a dark head in profile */
    mind_flay: function (c) {
      var head = 'M4,64 L6,56 C1,50 0,42 1,35 C2,24 10,16 20,16 C29,16 35,22 36,30 L37,34 L41.5,40 L37.4,41.5 L38.2,44 L36.6,45.5 L37.6,48 C37,51 34,52 30,51 L29,56 L32,64 Z';
      var t = [
        smooth([[31, 26], [38, 20], [42, 25], [48, 16], [56, 11], [64, 7]]),
        smooth([[33, 33], [40, 32], [45, 37], [51, 29], [58, 26], [65, 24]]),
        smooth([[24, 19], [27, 10], [34, 12], [39, 4], [46, 0], [54, -2]])];
      var tn = c.lg(['#ffe8ff', '#e070ff', '#8a2ad0'], 1, 0, 0, 1), tt = '', i;
      for (i = 0; i < 3; i++) tt += S(t[i], OL, 8.6) + S(t[i], tn, 5.4) + S(t[i], '#fff4ff', 1.6, 0.75);
      var rim = 'M6,56 C1,50 0,42 1,35 C2,24 10,16 20,16 C29,16 35,22 36,30 L37,34 L41.5,40';
      return iconWrap(c, ['#4a1470', '#050108'],
        glow(c, 52, 14, 28, '#e080ff', 0.8) +
        P(head, c.lg(['#4a3a66', '#2a2040', '#120c1e'], 0.2, 0, 0.8, 1), 2.4) +
        S(rim, '#b890e8', 1.3, 0.7) +
        P('M14,32 C11,32 10,36 11,39 C12,42 15,42 16,40 Z', '#2a2040', 1.6) +
        C(31, 32, 5, c.rg([[0, '#ffffff'], [0.4, '#f0a0ff'], [1, '#b040f0', 0]]), 0) + P('M28.5,32 C29.5,30.5 32.5,30.5 33.5,32 C32.5,33.2 29.5,33.2 28.5,32 Z', '#fbe8ff', 1) +
        tt +
        C(31, 26, 3.4, '#ffd8ff', 0, 0.95) + C(33, 33, 3.4, '#ffd8ff', 0, 0.95) + C(24, 19, 3, '#ffd8ff', 0, 0.95) +
        sparkle(56, 40, 3, '#f4d8ff') + sparkle(48, 50, 2.4, '#f4d8ff'));
    },
    /* priest: a sudden round white-gold flash burst (not a cross) with a small gold plus at its heart and speed streaks */
    flash_heal: function (c) {
      var cx = 32, cy = 31;
      return iconWrap(c, ['#e0b040', '#3a2004'],
        glow(c, cx, cy, 34, '#fff8d0', 0.95) +
        S('M4,52 L16,44 M6,62 L22,50 M44,58 L54,50 M44,10 L56,2 M2,24 L10,26', '#ffffff', 1.8, 0.55) +
        P(star(cx, cy, 12, 28, 15, 0.13), '#fff2b8', 1.6, 0.85) +
        P(star(cx, cy, 12, 23, 13), c.rg([[0, '#ffffff'], [0.6, '#fffbe8'], [1, '#ffe48a']]), 2) +
        C(cx, cy, 11.5, c.rg([[0, '#ffffff'], [0.75, '#fffcee'], [1, '#fff0b8']]), 0) +
        P('M29,23.5 L35,23.5 L35,28 L39.5,28 L39.5,34 L35,34 L35,38.5 L29,38.5 L29,34 L24.5,34 L24.5,28 L29,28 Z', c.lg(['#ffe070', '#f0a818', '#b86a08'], 0.2, 0, 0.8, 1), 1.8) +
        sparkle(54, 50, 3.6, '#ffffff') + sparkle(10, 10, 3, '#ffffff'));
    },
    /* rogue: a boot kicking up into a dizzy head, stars circling above it */
    cheap_shot: function (c) {
      var sk = '#e0a878';
      var boot = 'M-18,0 C-18,-6 -11,-8 -4,-8 L3,-8 L3,-24 L16,-24 L16,5 L-14,5 C-17,5 -18,3 -18,0 Z';
      var head = G(C(24, 25, 13, c.cel(sk), 2.2) +
        P('M11,22 C11,13 17,10 24,10 C31,10 37,13 37,22 C33,18 29,17 24,17 C19,17 15,18 11,22 Z', '#4a2a14', 1.8) +
        E(11, 27, 2.6, 4, c.cel(sk), 1.6) + E(37, 27, 2.6, 4, c.cel(sk), 1.6) +
        S('M16,23 L21,28 M21,23 L16,28 M27,23 L32,28 M32,23 L27,28', OL, 2.2) +
        E(24, 33.5, 3.2, 2.4, '#3a0a0a', 1.4) + C(30, 17, 2.6, c.cel('#e89a88'), 1.2), 'rotate(-18 24 25)');
      return iconWrap(c, ['#7a5a3a', '#120a04'],
        glow(c, 30, 30, 28, '#ffd890', 0.55) +
        earc(23, 8, 14, 4, 180, 360, '#ffe868', 1.4, 0.7) +
        head +
        earc(23, 8, 14, 4, 0, 180, '#ffe868', 1.4, 0.8) +
        dstar(9, 9, 4.2) + dstar(25, 12.5, 4.6) + dstar(37, 6, 3.8) +
        S('M40,60 L30,52 M50,62 L40,54 M60,50 L52,44', '#fff0d0', 1.8, 0.5) +
        G(P('M4,-24 L15,-24 L20,-44 L7,-46 Z', c.cel('#4a3a5a'), 2.2) +
          P(boot, c.cel('#a8703a'), 2.4) + P('M-14,5 L16,5 L16,9.5 L-12,9.5 C-14,9.5 -15,7 -14,5 Z', '#2a1a10', 1.8) +
          P('M2,-25 L17,-25 L17,-19 L2,-19 Z', c.cel('#c8904a'), 1.8) + C(9.5, -22, 1.4, GOLD, 0.8) +
          S('M-12,-3 C-8,-6 -3,-6 1,-5', '#ffffff', 1.4, 0.45), 'translate(50,50) rotate(28)') +
        burst(c, 34, 41, 7.5, 3, 8, ['#ff9a2a', '#ffe060', '#ffffff']));
    },
    /* rogue: a hooded figure stepping aside, a blade slashing only through its fading afterimages */
    feint: function (c) {
      var fig = 'M-12,27 C-13,12 -11,1 -9,-6 C-10,-16 -6,-22 0,-22 C6,-22 10,-16 9,-6 C11,1 13,12 12,27 Z';
      var ghost = function (x, o) { return G(F(fig, '#c8c0dc') + F('M-5,-12 C-5,-17 5,-17 5,-12 C5,-7 -5,-7 -5,-12 Z', '#6a6080'), 'translate(' + x + ',38)', o); };
      return iconWrap(c, ['#6a4a34', '#0e0804'],
        glow(c, 30, 34, 30, '#e8d8c0', 0.45) +
        ghost(11, 0.2) + ghost(24, 0.42) +
        S('M16,26 L30,26 M14,40 L30,40 M18,54 L30,54', '#ffffff', 1.6, 0.4) +
        G(P(fig, c.lg(['#4a4058', '#2a2436', '#141018'], 0.2, 0, 0.8, 1), 2.4) +
          F('M-9,20 C-10,8 -8,-2 -6,-7 C-7,-14 -4,-19 1,-20 C-3,-16 -4,-10 -3,-5 C-5,2 -6,10 -5,20 Z', '#ffffff', 0.14) +
          E(0, -12, 5.2, 5.6, '#050308', 0) + C(-2, -12.5, 1.1, '#ffe23a', 0) + C(2.4, -12.5, 1.1, '#ffe23a', 0) +
          S('M-8,4 C-4,8 4,8 9,4', '#141018', 1.6, 0.8), 'translate(45,38)') +
        wpn(c, 'dagger', 54, 38, -30, 0.6) +
        P('M6,14 Q24,30 40,58 Q26,36 4,20 Z', '#ffffff', 1.6, 0.95) +
        sparkle(22, 32, 3.6, '#ffffff'));
    },
    /* paladin: a white-hot gold warhammer hurled through the dusk, a long comet trail behind it */
    hammer_of_wrath: function (c) {
      var hm = P('M-2.6,-6 L-2.6,26 L2.6,26 L2.6,-6 Z', c.cel(WOOD), 2) + S('M-2.6,16 L2.6,18 M-2.6,21 L2.6,23', LEATH, 1.5) + C(0, 28, 3, c.cel(GOLD), 1.6) +
        P('M-15,-19 L15,-19 L17,-11 L15,-3 L-15,-3 L-17,-11 Z', c.lg(['#ffffff', '#ffe070', '#d09010'], 0.2, 0, 0.8, 1), 2.4) +
        P('M-4,-21 L4,-21 L4,-1 L-4,-1 Z', c.cel('#f0b830'), 1.8) + F('M-13,-17 L13,-17 L13,-14 L-13,-14 Z', '#ffffff', 0.6) +
        P(star(0, -11, 4, 3.4, 1.2), '#ffffff', 1);
      return iconWrap(c, ['#8a3a10', '#120300'],
        F('M-6,58 L28,14 C36,6 50,10 50,22 C50,30 44,36 36,40 Z', c.lg([[0, '#ffc040', 0], [0.55, '#ffd860', 0.55], [1, '#ffffff', 0.95]], 0, 1, 0.8, 0.2)) +
        S('M2,56 L30,24 M10,62 L38,34 M-2,46 L22,18', '#fff8d0', 2, 0.55) +
        glow(c, 40, 24, 24, '#fff4b0', 0.95) +
        arc(40, 24, 21, 190, 280, '#fff4c0', 2.2, 0.85) + arc(40, 24, 21, 10, 100, '#fff4c0', 2.2, 0.85) +
        G(hm, 'translate(40,25) rotate(40) scale(1.08)') +
        sparkle(56, 8, 4, '#ffffff') + sparkle(58, 46, 3.4, '#ffffff') + sparkle(22, 8, 2.8, '#fff4c0'));
    },
    /* paladin: a beam of holy light slamming down from a star onto the ground, the impact cracking it open */
    holy_wrath: function (c) {
      var cone = 'M32,6 L62,52 L2,52 Z';
      return iconWrap(c, ['#7a4a10', '#100602'],
        glow(c, 32, 30, 32, '#ffe68a', 0.5) +
        F(cone, c.lg([[0, '#ffffff', 0.2], [0.3, '#fff4c0', 0.55], [0.5, '#ffffff', 0.9], [0.7, '#fff4c0', 0.55], [1, '#ffffff', 0.2]], 0, 0, 1, 0)) +
        F('M32,6 L42,52 L22,52 Z', c.lg([[0, '#ffffff', 0.9], [1, '#ffffff', 0.6]])) +
        S('M32,12 L32,46 M27,22 L20,46 M37,22 L44,46', '#ffffff', 1.4, 0.6) +
        F('M0,50 C16,48 48,48 64,50 L64,64 L0,64 Z', '#2a1606') + S('M0,50 C16,48 48,48 64,50', OL, 2.2) +
        S('M32,53 L22,62 M32,53 L44,64 M32,53 L8,56 M32,53 L58,57', OL, 3.2) + S('M32,53 L22,62 M32,53 L44,64 M32,53 L8,56 M32,53 L58,57', '#ffc040', 1.6) +
        E(32, 51, 24, 5, c.rg([[0, '#ffffff'], [0.5, '#fff0a0', 0.9], [1, '#ffc040', 0]]), 0) +
        P(star(32, 49.5, 8, 12, 4.2, 0.2), '#fffbe0', 1.4) +
        C(10, 42, 1.8, '#6a4424', 1) + C(54, 41, 1.6, '#6a4424', 1) + C(16, 34, 1.3, '#6a4424', 1) + C(49, 33, 1.2, '#6a4424', 1) +
        rays(32, 7, 8, 5, 11, '#ffffff', 1.8, 0.85, 0.2) +
        P(star(32, 7, 4, 7.5, 2.2), '#ffffff', 1.4));
    },
    /* warlock: a horned red demon face screaming, purple shockwaves rolling off it */
    howl_of_terror: function (c) {
      var sk = '#a8302a';
      var w = arc(32, 40, 25, -50, 30, '#c070ff', 2.6) + arc(32, 40, 25, 150, 230, '#c070ff', 2.6) +
        arc(32, 40, 30.5, -45, 25, '#8a3ad0', 2.2, 0.85) + arc(32, 40, 30.5, 155, 225, '#8a3ad0', 2.2, 0.85);
      var horn = c.lg(['#f4ead0', '#c8b890', '#6a5a40'], 0, 0, 0, 1);
      return iconWrap(c, ['#4a1470', '#050108'],
        glow(c, 32, 40, 30, '#b050f0', 0.6) + w +
        P('M24,17 C16,12 12,6 13,-1 C18,6 24,8 30,11 Z M40,17 C48,12 52,6 51,-1 C46,6 40,8 34,11 Z', horn, 2) +
        P('M19,30 L7,22 L12,32 L18,38 Z M45,30 L57,22 L52,32 L46,38 Z', c.cel(dk(sk, 0.1)), 2) +
        P('M18,24 C18,15 24,11 32,11 C40,11 46,15 46,24 C47,34 44,44 39,51 L32,59 L25,51 C20,44 17,34 18,24 Z', c.cel(sk), 2.4) +
        F('M21,40 C19,32 19,22 25,16 C22,24 22,32 24,40 Z', '#ffffff', 0.2) +
        P('M19,24 L30,27.5 L32,30 L34,27.5 L45,24 L45,21 L32,25 L19,21 Z', dk(sk, 0.45), 1.4) +
        P('M21.5,27 L30,29.5 L29,32.5 L22.5,31 Z M42.5,27 L34,29.5 L35,32.5 L41.5,31 Z', '#aaff60', 1.2) +
        C(26, 30, 1.1, '#f4ffe0', 0) + C(38, 30, 1.1, '#f4ffe0', 0) +
        E(32, 45, 7.5, 8.5, '#200406', 2.2) + E(32, 49, 4.5, 3.5, '#8a1a2a', 0) +
        P('M25.5,40 L27.5,45 L29,40.5 Z M38.5,40 L36.5,45 L35,40.5 Z M27,52 L28.5,47 L30,52.5 Z M37,52 L35.5,47 L34,52.5 Z', '#fff4dc', 1));
    },
    /* warlock: a big fel-green and orange fireball with a burning skull inside */
    soul_fire: function (c) {
      var fel = ['#1e8a1a', '#8aff4a', '#e8ffc0'];
      return iconWrap(c, ['#7a2208', '#0e0200'],
        glow(c, 30, 36, 32, '#ffa040', 0.65) +
        P(flameD(31, 34, 1.32), c.lg(['#b8ff6a', '#3ab020', '#0e5a0a'], 0.2, 0, 0.8, 1), 2.4) +
        F(flameD(31, 39, 1.02), '#ff8a1a') + F(flameD(31, 43, 0.72), '#ffd040') +
        C(31, 43, 12.5, c.rg([[0, '#fffbe0'], [0.6, '#ffe070', 0.7], [1, '#ff9a1f', 0]]), 0) +
        skullG(c, 31, 42, 0.68, '#fff2c8', '#4aff3a') +
        flameC(10, 50, 0.3, fel) + flameC(54, 48, 0.28, fel) +
        C(14, 18, 1.6, '#8aff4a', 0) + C(50, 14, 1.4, '#ffe868', 0) + C(56, 30, 1.2, '#8aff4a', 0) + C(8, 34, 1.3, '#ffe868', 0));
    },
    /* hunter: a rain of arrows plunging down out of the sky into the ground */
    volley: function (c) {
      var ar = '', i, pts = [[10, 16, 0.5, 0.55], [24, 10, 0.5, 0.55], [40, 14, 0.5, 0.55], [54, 8, 0.5, 0.55],
        [16, 34, 0.62, 1], [32, 30, 0.66, 1], [48, 34, 0.62, 1]];
      for (i = 0; i < pts.length; i++) ar += G(arrowG(c, pts[i][0], pts[i][1], 196, pts[i][2]), '', pts[i][3]);
      var stuck = function (x, y, a) { return G(S('M0,0 L0,-12', OL, 5) + S('M0,0 L0,-12', '#c9a878', 2.6) + P('M0,-8 L-5,-14 L-5,-19 L0,-14 Z M0,-8 L5,-14 L5,-19 L0,-14 Z', '#b8342a', 1.4), 'translate(' + x + ',' + y + ') rotate(' + a + ')'); };
      return iconWrap(c, ['#7a7a3a', '#101002'],
        glow(c, 32, 28, 30, '#f0f0c0', 0.5) +
        S('M14,2 L8,26 M30,0 L24,24 M46,2 L40,26 M60,0 L54,22', '#fffbe0', 1.2, 0.4) +
        F('M0,52 C16,50 48,50 64,52 L64,64 L0,64 Z', '#3a2a14') + S('M0,52 C16,50 48,50 64,52', OL, 2.2) +
        stuck(10, 57, 14) + stuck(28, 58, -8) + stuck(46, 57, 18) + stuck(58, 59, -6) +
        ar +
        C(20, 53, 1.6, '#c8a878', 0, 0.8) + C(36, 54, 1.4, '#c8a878', 0, 0.8) + C(52, 53, 1.5, '#c8a878', 0, 0.8));
    },
    /* hunter: one golden arrow flying along a thin aim line into a gold crosshair */
    aimed_shot: function (c) {
      var gh = c.lg(['#fffbe0', '#ffd860', '#b07a10'], 0, 0, 1, 0);
      return iconWrap(c, ['#c8901c', '#1e1002'],
        glow(c, 48, 16, 24, '#fff0a0', 0.8) +
        S('M2,62 L20,44', '#fff4c0', 5, 0.25) + S('M4,56 L16,44 M10,62 L22,50', '#fff8d8', 1.4, 0.55) +
        S('M42,22 L51,13', '#fff8d0', 1.6, 0.9) +
        ring2(49, 15, 9, 9, '#ffe070', 2) + ring2(49, 15, 3.4, 3.4, '#fff4c0', 1.4) +
        S('M49,2 L49,9 M49,21 L49,28 M36,15 L43,15 M55,15 L62,15', OL, 3.4) + S('M49,2 L49,9 M49,21 L49,28 M36,15 L43,15 M55,15 L62,15', '#ffe070', 1.6) +
        arrowG(c, 26, 40, 45, 1.12, gh, '#e8c070', '#fff0c0') +
        C(44.5, 21.5, 5, c.rg([[0, '#ffffff'], [1, '#fff0a0', 0]]), 0) +
        sparkle(12, 14, 3.4, '#ffffff') + sparkle(56, 44, 3, '#fff4c8'));
    },
    /* druid: a green-grey storm funnel swirling under a cloud, leaves whipped round it */
    hurricane: function (c) {
      var lv = [[[31, 12], 27], [[33, 20], 21], [[30, 28], 16], [[32, 36], 12], [[35, 44], 8.5], [[33, 51], 5.5], [[30, 57], 3]];
      var L = [], Rr = [], i;
      for (i = 0; i < lv.length; i++) { L.push([lv[i][0][0] - lv[i][1], lv[i][0][1]]); Rr.push([lv[i][0][0] + lv[i][1], lv[i][0][1]]); }
      var outline = smooth(L) + ' L' + Rr[Rr.length - 1].join(',') + smooth(Rr.slice().reverse()).replace(/^M[^C]+/, '') + ' Z';
      var bands = '';
      for (i = 1; i < lv.length - 1; i++) bands += S(D`M${lv[i][0][0] - lv[i][1]},${lv[i][0][1]} A${lv[i][1]},${lv[i][1] * 0.3} 0 0 0 ${lv[i][0][0] + lv[i][1]},${lv[i][0][1]}`, '#eef6e0', 1.8, 0.75);
      return iconWrap(c, ['#4a6a3a', '#060c04'],
        glow(c, 32, 34, 30, '#c8e8b0', 0.45) +
        P(outline, c.lg(['#c8d8b8', '#8aa080', '#4a6040'], 0, 0, 1, 0), 2.4) + bands +
        S('M20,16 C26,22 38,22 44,18 M24,30 C28,34 36,34 40,30', '#ffffff', 1.2, 0.5) +
        cloud(c, [[8, 8, 8], [20, 5, 9], [34, 5, 10], [48, 5, 9], [60, 8, 7]], '#5a6a50') +
        leaf(c, 8, 30, -60, 0.62, '#8ad040') + leaf(c, 56, 26, 70, 0.6, '#b8e04a') + leaf(c, 12, 48, -110, 0.55, '#6ab43a') +
        leaf(c, 52, 46, 130, 0.58, '#8ad040') + leaf(c, 46, 58, 40, 0.45, '#b8e04a') + leaf(c, 20, 60, -30, 0.42, '#6ab43a') +
        S('M4,40 C8,46 14,50 20,50 M60,36 C58,42 52,46 46,48', '#eef6e0', 1.4, 0.55));
    },
    /* druid: a flexed arm sheathed in rough bark, leaves sprouting at the elbow */
    barkskin: function (c) {
      var arm = 'M0,37 C4,35 8,31 14,30 C22,29 28,32 33,37 L34,24 L31,17 C29,11 32,5 38,4 L47,4 C53,5 56,10 54,17 L51,24 L52,44 C52,53 46,58 38,58 L0,59 Z';
      var bark = '#8a5a30', gr = dk(bark, 0.55);
      var tex = S('M0,42 C8,40 16,44 24,42 C30,41 36,46 42,46 M0,48 C10,46 18,50 28,48 C34,47 40,52 48,50 M0,54 C10,52 20,55 30,53 M4,38 C10,36 14,38 20,36', gr, 1.6) +
        S('M38,26 C37,32 39,38 38,44 M44,24 C45,30 43,38 45,46 M49,26 C48,32 50,38 49,44', gr, 1.6) +
        S('M36,8 C38,12 36,14 38,17 M42,6 C43,10 41,14 43,18 M48,7 C49,11 47,14 49,18', gr, 1.3) +
        E(20, 46, 3, 2, gr, 0) + E(44, 36, 1.8, 2.8, gr, 0) + S('M8,44 L12,43 M30,50 L34,51', '#c8905a', 1.2, 0.8) +
        S('M33,20 L52,20', gr, 1.6);
      return iconWrap(c, ['#3a7a1c', '#040c02'],
        glow(c, 34, 30, 32, '#a8f070', 0.6) +
        S(arm, '#b8f080', 5, 0.35) +
        P(arm, c.lg([lt(bark, 0.25), bark, dk(bark, 0.35)], 0.2, 0, 0.8, 1), 2.4) +
        CG(tex, c.clip(arm)) +
        S('M34,24 L34,37', OL, 2) +
        leaf(c, 54, 50, 60, 0.7, '#6ab43a') + leaf(c, 56, 44, 20, 0.6, '#8ad040') + leaf(c, 30, 30, -40, 0.55, '#8ad040') + leaf(c, 8, 34, -20, 0.5, '#6ab43a') +
        sparkle(14, 14, 3.4, '#e8ffc8') + sparkle(22, 22, 2.4, '#e8ffc8'));
    },
    /* shaman: a lightning bolt jumping between three struck points in a zig-zag chain */
    chain_lightning: function (c) {
      var A = [11, 13], B = [51, 27], Cc = [17, 51], D2 = [56, 58];
      var b1 = zig(A[0], A[1], B[0], B[1], 5, 4.5, 0), b2 = zig(B[0], B[1], Cc[0], Cc[1], 5, 4.5, 3), b3 = zig(Cc[0], Cc[1], D2[0], D2[1], 4, 3, 1);
      var hit = function (p, r) { return glow(c, p[0], p[1], r * 2.2, '#9fdcff', 0.9) + burst(c, p[0], p[1], r, r * 0.4, 8, ['#4aa0ff', '#dff4ff', '#ffffff']); };
      return iconWrap(c, ['#2a48a8', '#030618'],
        G(bolt(b3, 2), '', 0.55) + bolt(b1, 3.4) + bolt(b2, 3.4) +
        S(zig(B[0], B[1], 62, 12, 3, 2, 2) + zig(Cc[0], Cc[1], 4, 34, 3, 2, 5), '#bfe8ff', 1.2, 0.8) +
        hit(A, 8) + hit(B, 7.5) + hit(Cc, 7.5) +
        sparkle(34, 8, 2.6, '#ffffff') + sparkle(38, 46, 2.4, '#ffffff'));
    },
    /* shaman: a war axe with white-blue wind ribbons coiling round its haft */
    windfury_weapon: function (c) {
      var ax = 'translate(28,44) rotate(26)';
      var rb = [[-14, 15], [0, 17], [14, 12]];
      var ribbon = function (front) {
        var s = '', i;
        for (i = 0; i < rb.length; i++) s += earc(0, rb[i][0], rb[i][1], rb[i][1] * 0.34, front ? 8 : 188, front ? 172 : 352, front ? '#f4fcff' : '#bfe4ff', front ? 3 : 2.2, front ? 1 : 0.7);
        return G(s, ax);
      };
      var curl = 'M14.8,-15 C21,-19 21,-25 16,-26 M-16.8,0 C-23,-4 -22,-9 -17,-10 M11.8,14 C17,11 17,6 13,5';
      return iconWrap(c, ['#3a84b0', '#03101a'],
        glow(c, 36, 24, 30, '#dff4ff', 0.6) +
        S('M2,20 C10,16 16,18 22,14 M44,60 C50,56 56,58 62,54 M4,50 C8,46 12,48 16,44', '#e8f8ff', 1.4, 0.5) +
        ribbon(false) +
        G(WP.greataxe(c), ax) +
        ribbon(true) +
        G(S(curl, OL, 4.4) + S(curl, '#f4fcff', 2), ax) +
        sparkle(12, 10, 3.4, '#ffffff') + sparkle(56, 38, 2.6, '#ffffff'));
    },
    /* human racial: a set, determined human face above a chain snapping apart */
    every_man: function (c) {
      var sk = '#e8b890';
      var chain = linkF(-1, 55, 5, 3.2) + linkE(7, 55, 3.4) + linkF(15, 55, 5, 3.2) + linkE(23, 55.5, 2.6, 10) +
        linkF(49, 55, 5, 3.2) + linkE(57, 55, 3.4) + linkF(65, 55, 5, 3.2) + linkE(41, 55.5, 2.6, -10);
      return iconWrap(c, ['#2a58b0', '#040a24'],
        glow(c, 32, 28, 30, '#bcd4ff', 0.55) +
        P('M4,64 C6,54 16,49 25,47 L39,47 C48,49 58,54 60,64 Z', c.lg(STEEL, 0.2, 0, 0.8, 1), 2.2) +
        P('M26,40 L38,40 L39,49 L25,49 Z', c.cel(dk(sk, 0.08)), 2) +
        P('M19,22 C19,12 25,8 32,8 C39,8 45,12 45,22 L45,30 C45,40 39,46 32,46 C25,46 19,40 19,30 Z', c.cel(sk), 2.4) +
        E(18.5, 29, 2.6, 4.4, c.cel(sk), 1.8) + E(45.5, 29, 2.6, 4.4, c.cel(sk), 1.8) +
        P('M17,26 C15,12 22,4 32,4 C42,4 49,12 47,26 L45,19 C41,15 36,14 32,16 C28,14 23,15 19,19 Z', c.cel('#6a4020'), 2) +
        P('M22,22.5 L30,25 L30,27 L22,25 Z M42,22.5 L34,25 L34,27 L42,25 Z', '#4a2a14', 1.2) +
        E(26.5, 29.5, 2.8, 1.8, '#ffffff', 1.2) + E(37.5, 29.5, 2.8, 1.8, '#ffffff', 1.2) + C(27, 29.5, 1.3, '#2a4a8a', 0) + C(37, 29.5, 1.3, '#2a4a8a', 0) +
        S('M32,29 L30.5,35 L33,35.5', dk(sk, 0.4), 1.4) + S('M27,39.5 L37,39.5', OL, 2) + S('M26,43 C29,44.5 35,44.5 38,43', dk(sk, 0.2), 1.2, 0.6) +
        chain +
        rays(32, 55, 10, 4, 12, '#fff4c0', 1.8, 0.9, 0.3) + burst(c, 32, 55, 6.5, 2.6, 8, ['#ff9a2a', '#ffe060', '#ffffff']) +
        P('M26,48 L28,46 L29,49 Z M36,49 L38,46 L39,50 Z', '#b8c0c8', 1));
    },
    /* dwarf racial: a bearded dwarf turning to cracked grey stone down one side */
    stoneform: function (c) {
      var dwarf = function (sk, beard, helm, body) {
        return P('M2,64 C4,53 13,47 22,46 L42,46 C51,47 60,53 62,64 Z', c.cel(body), 2.2) +
          P('M18,24 C18,15 24,11 32,11 C40,11 46,15 46,24 L46,34 L18,34 Z', c.cel(sk), 2.2) +
          E(17, 28, 2.6, 4.2, c.cel(sk), 1.8) + E(47, 28, 2.6, 4.2, c.cel(sk), 1.8) +
          P('M15,22 C15,10 23,4 32,4 C41,4 49,10 49,22 Z', c.lg([lt(helm, 0.4), helm, dk(helm, 0.4)], 0.2, 0, 0.8, 1), 2.2) +
          P('M13,20 L51,20 L51,24.5 L13,24.5 Z', c.cel(dk(helm, 0.1)), 2) + S('M32,5 L32,20', dk(helm, 0.45), 1.6) +
          P('M20,26.5 L30,27.5 L30,30 L20,29.5 Z M44,26.5 L34,27.5 L34,30 L44,29.5 Z', c.cel(beard), 1.3) +
          C(26, 31.5, 1.5, '#1a1009', 0) + C(38, 31.5, 1.5, '#1a1009', 0) +
          P('M16,31 C16,43 20,53 26,58 L32,62 L38,58 C44,53 48,43 48,31 C44,37 40,39 32,39 C24,39 20,37 16,31 Z', c.cel(beard), 2.2) +
          S('M24,44 C25,50 27,54 29,57 M32,42 L32,60 M40,44 C39,50 37,54 35,57', dk(beard, 0.4), 1.3) +
          P('M21,39 C25,35 29,35 32,38 C35,35 39,35 43,39 C39,43 35,42 32,41 C29,42 25,43 21,39 Z', c.cel(lt(beard, 0.08)), 1.6) +
          E(32, 34.5, 4.4, 4.2, c.cel(dk(sk, 0.05)), 1.8);
      };
      var split = 'M33,0 L64,0 L64,64 L31,64 L35,56 L30,48 L35,40 L31,32 L36,24 L32,16 L35,8 Z';
      var edge = 'M33,0 L35,8 L32,16 L36,24 L31,32 L35,40 L30,48 L35,56 L31,64';
      var cracks = 'M44,14 L40,20 L43,24 M52,40 L46,44 L48,50 M40,52 L44,58 M56,30 L50,32 M38,30 L42,34';
      return iconWrap(c, ['#8a6a44', '#140c04'],
        glow(c, 32, 30, 30, '#e8dcc8', 0.45) +
        dwarf('#e0a07a', '#c8642a', '#9aa4ae', '#6a4a2a') +
        CG(dwarf('#a8a8a0', '#8a8a84', '#7a7a74', '#6a6a66') +
          C(40, 16, 1.2, '#5a5a56', 0) + C(46, 50, 1.4, '#5a5a56', 0) + C(52, 58, 1.2, '#5a5a56', 0) + C(42, 44, 1, '#dadad2', 0) +
          S(cracks, OL, 1.6), c.clip(split)) +
        S(edge, '#ffffff', 2.4, 0.55) + S(edge, OL, 1) +
        P('M54,60 L57,57 L59,61 Z M58,50 L60,48 L61,51 Z', '#9a9a94', 1));
    },
    /* gnome racial: a little gnome springing up out of a pair of iron manacles that have popped open */
    escape_artist: function (c) {
      var sk = '#f0c098', ir = '#9aa4ae';
      /* manacle: fixed lower half, upper half swung open on its hinge (hinge on the left when dir = 1, right when -1) */
      var cuff = function (x, y, dir) {
        var r = 9, hx = x - r * dir;
        var lower = earc(x, y, r, r, 0, 180, ir, 5);
        var upper = G(earc(0, 0, r, r, 180, 360, ir, 5), 'translate(' + hx + ',' + y + ') rotate(' + (-58 * dir) + ') translate(' + (r * dir) + ',0)');
        return lower + upper + R(x + r * dir - 3, y - 2.5, 6, 5, c.cel('#6a7480'), 1.6) + C(hx, y, 2, c.cel(GOLD), 1.2);
      };
      return iconWrap(c, ['#1a8a80', '#021210'],
        glow(c, 32, 26, 30, '#c8fff0', 0.6) +
        linkE(27, 58, 2.4) + linkF(32, 58, 3.4, 2.3) + linkE(37, 58, 2.4) +
        cuff(16, 55, 1) + cuff(48, 55, -1) +
        S('M20,48 C23,44 25,42 27,38 M44,48 C41,44 39,42 37,38 M32,52 L32,45', '#e8fff8', 1.8, 0.65) +
        S('M29,36 L26,44 M35,36 L38,44', OL, 5.2) + S('M29,36 L26,44 M35,36 L38,44', '#5a3a6a', 2.8) +
        P('M26,24 L38,24 L40.5,37 L23.5,37 Z', c.cel('#e0862a'), 2) + S('M24,32 L40,32', LEATH, 2) +
        S('M27,26 L19,16 M37,26 L45,16', OL, 5.2) + S('M27,26 L19,16 M37,26 L45,16', sk, 2.8) +
        C(19, 15.5, 2.8, c.cel(sk), 1.4) + C(45, 15.5, 2.8, c.cel(sk), 1.4) +
        P('M25,15 L15,9 L23,20 Z M39,15 L49,9 L41,20 Z', c.cel(sk), 1.6) +
        C(32, 16, 8.5, c.cel(sk), 2.2) +
        P('M23,13 C21,4 26,-1 30,4 C31,-1 35,-1 36,4 C40,-1 45,4 41,13 C37,9 27,9 23,13 Z', c.cel('#ff5aa8'), 1.8) +
        C(28.5, 16.5, 1.5, OL, 0) + C(35.5, 16.5, 1.5, OL, 0) + S('M28,20.5 C30,22.5 34,22.5 36,20.5', OL, 1.4) +
        E(32, 19, 1.8, 1.4, c.cel('#f0a080'), 1) +
        sparkle(8, 32, 3.4, '#ffffff') + sparkle(56, 32, 3, '#ffffff') + sparkle(52, 6, 2.6, '#e8fff8'));
    },
    /* night elf racial: a long-eared silhouette sinking into purple shadow under a crescent moon */
    shadowmeld: function (c) {
      var body = 'M6,64 C8,52 16,46 24,44 L22,38 C17,34 16,26 18,20 L6,8 L20,16 C22,11 26,8 31,8 C36,8 40,11 42,16 L56,8 L44,20 C46,26 45,34 40,38 L38,44 C46,46 54,52 56,64 Z';
      var fill = c.lg([[0, '#2a1a44', 1], [0.55, '#1a0e30', 0.95], [0.85, '#1a0e30', 0.45], [1, '#1a0e30', 0]]);
      var rim = c.lg([[0, '#d8c8ff', 1], [0.6, '#a890e0', 0.8], [0.9, '#a890e0', 0]]);
      var moon = 'M50,3 A11,11 0 1 0 61,19 A8.5,8.5 0 1 1 50,3 Z';
      return iconWrap(c, ['#3a2060', '#030108'],
        glow(c, 34, 22, 26, '#c8b0ff', 0.7) +
        glow(c, 50, 13, 16, '#e8e0ff', 0.7) + P(moon, c.lg(['#ffffff', '#e0d8ff', '#a898d8'], 0.2, 0, 0.8, 1), 1.8) +
        P(body, fill, 0) + S(body, rim, 2.2) +
        F('M21,26 C21,20 24,15 29,13 C26,17 25,22 25,28 Z', '#e0d0ff', 0.25) +
        P('M23.5,26 L29,27.5 L28.5,29 L24,28.2 Z M40.5,26 L35,27.5 L35.5,29 L40,28.2 Z', '#e8fbff', 0.8) +
        C(26.5, 27.6, 3.2, c.rg([[0, '#ffffff', 0.7], [1, '#c8f0ff', 0]]), 0) + C(37.5, 27.6, 3.2, c.rg([[0, '#ffffff', 0.7], [1, '#c8f0ff', 0]]), 0) +
        S('M4,56 C10,50 16,54 20,48 M60,56 C54,50 48,54 44,48 M12,62 C18,56 26,60 30,54 M52,62 C46,56 38,60 34,54', '#8a5ad0', 2.2, 0.6) +
        C(10, 46, 2, '#b890f0', 0, 0.5) + C(54, 44, 1.6, '#b890f0', 0, 0.5) + C(16, 38, 1.2, '#b890f0', 0, 0.45) +
        sparkle(12, 12, 2.6, '#e8e0ff') + sparkle(20, 4, 1.8, '#e8e0ff'));
    },
    /* orc racial: a green orc face roaring with tusks bared, a spiky blood-red aura behind */
    blood_fury: function (c) {
      var sk = '#5a8a3a';
      return iconWrap(c, ['#a80e0e', '#140000'],
        glow(c, 32, 34, 32, '#ff3a2a', 0.75) +
        P(star(32, 34, 14, 31, 21, 0.1), c.rg([[0, '#ff5a3a'], [0.7, '#b01008'], [1, '#4a0000']]), 2) +
        P('M29,10 C27,2 30,-2 34,0 C37,3 37,7 36,10 Z', '#1a1410', 1.6) + S('M35,4 C42,2 46,6 48,12', OL, 3.6) + S('M35,4 C42,2 46,6 48,12', '#1a1410', 2) +
        P('M15,30 L4,24 L13,38 Z M49,30 L60,24 L51,38 Z', c.cel(dk(sk, 0.1)), 2) +
        P('M16,22 C16,13 23,9 32,9 C41,9 48,13 48,22 L50,34 C50,46 42,56 32,56 C22,56 14,46 14,34 Z', c.cel(sk), 2.4) +
        F('M18,40 C16,32 16,22 22,15 C20,22 20,32 22,40 Z', '#ffffff', 0.2) +
        P('M15,26 L30,28.5 L32,31 L34,28.5 L49,26 L49,21 L32,25 L15,21 Z', dk(sk, 0.45), 1.6) +
        P('M19,29 L29,31 L28,34 L20,32.5 Z M45,29 L35,31 L36,34 L44,32.5 Z', '#ff3a1a', 1.2) + C(24, 31.5, 1, '#fff0d0', 0) + C(40, 31.5, 1, '#fff0d0', 0) +
        S('M17,36 L22,40 M47,36 L42,40', '#c81a10', 2) +
        P('M28,32 L26,38 C28,39 36,39 38,38 L36,32 Z', c.cel(dk(sk, 0.12)), 1.6) +
        E(32, 45.5, 9, 6.8, '#200404', 2.2) + E(32, 49, 5.5, 3, '#8a1a1a', 0) +
        P('M25,41 L27.5,44 L30,41 L32,44 L34,41 L36.5,44 L39,41 Z', '#fff4dc', 1) +
        P('M22,50 C20,44 20,39 22,35 C24,40 26,44 26.5,48 Z M42,50 C44,44 44,39 42,35 C40,40 38,44 37.5,48 Z', c.lg(['#fffbe8', '#e8dcc0', '#b0a080'], 0, 0, 0, 1), 1.6) +
        drop(8, 52, 1.1) + drop(56, 50, 1) + drop(12, 12, 0.9) + drop(54, 14, 0.9));
    },
    /* troll racial: a blue troll face with long ears, a red mohawk and big tusks, wreathed in frenzied fire */
    berserking: function (c) {
      var sk = '#4a8ab0', fc = ['#c81a0a', '#ff7a1a', '#ffd040'], back = '', i;
      var fp = [[8, 44, 0.46], [56, 44, 0.46], [10, 26, 0.4], [54, 26, 0.4], [18, 10, 0.36], [46, 10, 0.36], [32, 60, 0.4]];
      for (i = 0; i < fp.length; i++) back += flameC(fp[i][0], fp[i][1], fp[i][2], fc);
      return iconWrap(c, ['#d0580c', '#1e0400'],
        glow(c, 32, 34, 32, '#ffb040', 0.8) + back +
        P('M26,13 L22,-1 L29,7 L32,-4 L35,7 L42,-1 L38,13 Z', c.cel('#e0281a'), 1.8) +
        P('M19,27 L1,17 L5,25 L18,36 Z M45,27 L63,17 L59,25 L46,36 Z', c.cel(dk(sk, 0.1)), 2) +
        P('M20,21 C20,13 25,10 32,10 C39,10 44,13 44,21 L46,37 C46,47 40,55 32,55 C24,55 18,47 18,37 Z', c.cel(sk), 2.4) +
        F('M21,40 C20,32 20,22 24,15 C23,24 23,32 24,40 Z', '#ffffff', 0.2) +
        P('M20,25 L30,27 L32,29 L34,27 L44,25 L44,22 L32,25.5 L20,22 Z', dk(sk, 0.45), 1.4) +
        P('M22,27.5 L29.5,29.5 L28.5,32 L22.5,30.5 Z M42,27.5 L34.5,29.5 L35.5,32 L41.5,30.5 Z', '#ffe23a', 1.2) + C(26, 30, 1, '#c81a0a', 0) + C(38, 30, 1, '#c81a0a', 0) +
        P('M30,28 L28,40 C30,41.5 34,41.5 36,40 L34,28 Z', c.cel(dk(sk, 0.12)), 1.6) +
        P('M25,45 C29,48 35,48 39,45 C37,50 27,50 25,45 Z', '#200404', 1.6) + S('M27,46 L37,46', '#fff4dc', 1.4) +
        P('M22,48 C14,42 12,34 14,26 C17,33 21,40 26,45 Z M42,48 C50,42 52,34 50,26 C47,33 43,40 38,45 Z', c.lg(['#fffbe8', '#e8dcc0', '#a89878'], 0, 0, 0, 1), 1.8) +
        C(12, 54, 1.5, '#ffe868', 0) + C(52, 56, 1.3, '#ffe868', 0) + C(58, 36, 1.2, '#fff0a0', 0) + C(4, 36, 1.2, '#fff0a0', 0));
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
  ART.keys = ART.keys || {};
  var list = Array.isArray(ART.keys.icons) ? ART.keys.icons : (ART.keys.icons = []);
  Object.keys(NEW).forEach(function (k) { if (list.indexOf(k) < 0) list.push(k); });
})(typeof window !== 'undefined' ? window : this);
