/* art_icons10.js - more spell icons for Azeroth Solo (18 keys: two more class abilities for every class).
 * Loads AFTER art.js, art_icons2.js .. art_icons9.js and art_mounts.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key (prototype keys included). Keys are appended to
 * ART.keys.icons. Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths,
 * same look). Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009
 * outline, vignette + bevel frame, no text, no filters. Gradient ids use the prefix iX<counter>_ so they never collide.
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

  function Ctx() { this.u = 'iX' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  /* ---- batch 6 parts ---- */
  /* outline stroke under a coloured stroke (for thick glowing lines) */
  function OS(d, col, w, o) { return S(d, OL, w + 2.6, o) + S(d, col, w, o); }
  /* a two-handed greatsword pointing up (-y), crossguard at y -5, pommel at +17 */
  function greatsword(c) {
    return P('M-4.6,-6 L-4.6,-44 L0,-54 L4.6,-44 L4.6,-6 Z', c.lg(STEEL, 0, 0, 1, 0), 2.2) + S('M0,-10 L0,-46', '#8e99a5', 1.4) +
      P('M-2.8,-4 L2.8,-4 L2.8,14 L-2.8,14 Z', LEATH, 2) + S('M-2.8,0 L2.8,2 M-2.8,5 L2.8,7 M-2.8,10 L2.8,12', '#2a1a0e', 1.1) +
      P('M-14,-10 L-10,-6 L10,-6 L14,-10 L14,-4 L10,-1 L-10,-1 L-14,-4 Z', c.cel(GOLD), 2) + C(0, 17, 3.6, c.cel(GOLD), 2);
  }
  /* a plain humanoid bust (head + shoulders), origin at the neck */
  function bust(c, fill, sw) {
    return P('M-15,24 C-15,10 -9,4 0,4 C9,4 15,10 15,24 Z', fill, sw) + C(0, -5, 8, fill, sw);
  }

  /* ---- batch 7 parts ---- */
  /* a curved lens (wound, gash) from a to b, w = bulge width, bend = how far the centreline bows */
  function lens(ax, ay, bx, by, w, bend) {
    var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L;
    var mx = (ax + bx) / 2 + nx * (bend || 0), my = (ay + by) / 2 + ny * (bend || 0);
    return D`M${ax},${ay} Q${mx + nx * w},${my + ny * w} ${bx},${by} Q${mx - nx * w},${my - ny * w} ${ax},${ay} Z`;
  }
  /* a coloured lightning stroke (outline, colour, white core) */
  function zbolt(d, w, col) { return S(d, OL, w + 3) + S(d, col, w) + S(d, '#ffffff', w * 0.4); }
  /* a bold arrow from its tail (tx,ty) to its head (hx,hy): thick shaft, big steel head, red fletching */
  function arrowB(c, tx, ty, hx, hy) {
    var dx = hx - tx, dy = hy - ty, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
    var bx = hx - ux * 11, by = hy - uy * 11;
    var head = D`M${hx},${hy} L${bx + px * 5.2},${by + py * 5.2} L${bx + ux * 2.6},${by + uy * 2.6} L${bx - px * 5.2},${by - py * 5.2} Z`;
    var fl = function (k) {
      return D`M${tx + ux * 10},${ty + uy * 10} L${tx + ux * 3 + px * 5 * k},${ty + uy * 3 + py * 5 * k} L${tx - ux * 1 + px * 5 * k},${ty - uy * 1 + py * 5 * k} L${tx + ux * 3},${ty + uy * 3} Z`;
    };
    return OS(D`M${tx},${ty} L${bx + ux * 2},${by + uy * 2}`, '#d8b888', 3) +
      P(fl(1) + fl(-1), '#c8342a', 1.5) + P(head, c.lg(STEEL, 0, 0, 1, 0), 2) + S(D`M${hx - ux * 2},${hy - uy * 2} L${bx + ux * 3},${by + uy * 3}`, '#ffffff', 1, 0.7);
  }
  /* one steel trap jaw: a half ring with teeth pointing into its centre */
  function jaw(c, x, y, rot, r) {
    var d = D`M${-r},0 A${r},${r} 0 0 1 ${r},0`, t = '', i;
    for (i = 1; i < 6; i++) {
      var a = Math.PI + i / 6 * Math.PI, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      t += D`M${ca * r + px * 2.2},${sa * r + py * 2.2} L${ca * (r - 6.5)},${sa * (r - 6.5)} L${ca * r - px * 2.2},${sa * r - py * 2.2} Z`;
    }
    return G(P(t, c.lg(['#ffffff', '#c2cad3', '#7c8793'], 0, 0, 1, 1), 1.3) + S(d, OL, 6.4) + S(d, '#8a949e', 3.6) + S(d, '#e0e6ec', 1, 0.8),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(rot) + ')');
  }
  var FEL = ['#2a9a14', '#a8f03a', '#ffb030'];

  /* ---- batch 10 parts ---- */
  /* a closed band along a polyline of [x, y, width] samples (for spirals, tapering tails) */
  function band(pts) {
    var L = [], Rr = [], i;
    for (i = 0; i < pts.length; i++) {
      var p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l, w = p[2] / 2;
      L.push([p[0] + nx * w, p[1] + ny * w]); Rr.push([p[0] - nx * w, p[1] - ny * w]);
    }
    var d = '';
    for (i = 0; i < L.length; i++) d += (i ? 'L' : 'M') + r1(L[i][0]) + ',' + r1(L[i][1]);
    for (i = Rr.length - 1; i >= 0; i--) d += 'L' + r1(Rr[i][0]) + ',' + r1(Rr[i][1]);
    return d + 'Z';
  }
  /* a pointed-hat mage silhouette, origin at the feet, about 52 tall */
  function mageG(c, x, y, s, robe, o, flat) {
    var hat = 'M-10,-33 L1,-54 L10,-33 Z', brim = 'M-14,-32 C-8,-35 8,-35 14,-32 C8,-29 -8,-29 -14,-32 Z';
    var body = 'M-6,-26 C-10,-16 -13,-4 -15,2 L15,2 C13,-4 10,-16 6,-26 Z';
    var f = flat ? robe : c.cel(robe);
    return G(S('M12,-38 L12,2', OL, 4.4) + S('M12,-38 L12,2', flat ? robe : WOOD, 2) +
      P(body, f, 2) + C(0, -27, 5.4, flat ? robe : '#f0c8a0', 2) + P(hat, f, 2) + P(brim, f, 1.8) +
      (flat ? '' : S('M-12.5,1 L12.5,1', GOLD, 1.6) + S('M0,-24 L0,1', GOLD, 1.4) + E(-2, -27, 1, 1.2, OL, 0) + E(2.2, -27, 1, 1.2, OL, 0)) +
      C(12, -40, 3.2, flat ? lt(robe, 0.5) : c.rg([[0, '#ffffff'], [0.6, '#b8e8ff'], [1, '#4a8ae0']]), 1.4),
      'translate(' + r1(x) + ',' + r1(y) + ') scale(' + s + ')', o);
  }
  /* a music note made of light: tilted head, stem, one flag */
  function noteG(c, x, y, s, rot) {
    var fl = 'M4.4,-19 C6,-14 12.5,-13 11,-5 C10,-9.6 7,-11.6 4.4,-12.4 Z';
    return G(S('M4.4,-1.4 L4.4,-19', OL, 4.8) + P(fl, '#ffe070', 1.6) + S('M4.4,-1.4 L4.4,-18.6', '#fff4c0', 2.2) +
      E(0, 0, 5.4, 3.8, c.lg(['#fff4b0', '#f0b020', '#a86a08'], 0, 0, 1, 1), 2, null, -22) + E(-1.6, -1.2, 1.8, 0.9, '#ffffff', 0, 0.8, -22),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + (rot || 0) + ') scale(' + s + ')');
  }
  /* a hooded rogue bust (afterimage), origin at the neck */
  function hoodG(fill, x, y, s, o) {
    return G(P('M-15,22 C-15,9 -9,3 0,3 C9,3 15,9 15,22 Z', fill, 2) +
      P('M0,-15 C-7,-13 -10,-6 -9,1 C-8,5 -4,7 0,7 C4,7 8,5 9,1 C10,-6 7,-13 0,-15 Z', fill, 2) +
      E(0, -2, 5, 4.4, '#050204', 0) + E(-2, -2.4, 1.2, 0.8, '#ff6a5a', 0) + E(2, -2.4, 1.2, 0.8, '#ff6a5a', 0),
      'translate(' + r1(x) + ',' + r1(y) + ') scale(' + s + ')', o);
  }
  /* a slash: bright lens with a coloured glow under it */
  function slash(ax, ay, bx, by, w, bend, glowCol, o) {
    var d = lens(ax, ay, bx, by, w, bend), core = lens(ax, ay, bx, by, w * 0.45, bend);
    return S(d, glowCol, 4, (o || 1) * 0.45) + P(d, '#ffe8e0', 1.6, o) + F(core, '#ffffff', o);
  }
  /* a wyvern-ish serpent head pointing +x, jaws open */
  function beastHead(c, x, y, rot, s, col) {
    return G(P('M-9,-2 C-8,-7 -2,-9 4,-8 C8,-7 11,-5 13,-3 L4,-1.5 C2,-1 0,0 -2,1 Z', c.cel(col), 1.8) +
      P('M-9,-1 C-6,1 -2,1 1,1.5 L11,4 C8,7 1,8 -4,6 C-7,5 -9,3 -9,-1 Z', c.cel(dk(col, 0.15)), 1.8) +
      P('M-6,-7 L-12,-12 L-5,-9 Z M-2,-8 L-6,-14 L0,-9 Z', '#e8f0c0', 1.2) +
      P('M5,-2.6 L6.4,0.4 L7.8,-2.4 Z M9,-2.2 L10,0.4 L11,-1.8 Z', '#ffffff', 0.6) +
      E(0, -4.6, 1.8, 1.3, '#ffe040', 0.8) + C(0.4, -4.6, 0.6, OL, 0),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(rot) + ') scale(' + s + ')');
  }
  /* flared (pattee) cross, centred at the origin */
  function crossP(c, s) {
    var d = 'M-3,-4 L-6,-16 L6,-16 L3,-4 L4,-3 L16,-6 L16,6 L4,3 L3,4 L6,16 L-6,16 L-3,4 L-4,3 L-16,6 L-16,-6 L-4,-3 Z';
    return G(P(d, c.lg(['#fff8c8', '#f0c040', '#a86a10'], 0.2, 0, 0.8, 1), 2.2) + S('M-4.6,-14.4 L4.6,-14.4 M-14.4,-4.6 L-14.4,4.6', '#ffffff', 1, 0.7) +
      C(0, 0, 4.4, c.cel('#2a6ae0'), 1.6) + C(-1.2, -1.2, 1.2, '#ffffff', 0, 0.8), 'scale(' + s + ')');
  }

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a warrior spinning with two blades held out, inside a red tornado of flying blades */
    bladestorm: function (c) {
      var wind = c.lg([[0, '#fff0e8', 0.95], [1, '#f0a080', 0.7]], 0, 0, 1, 0);
      var bands = [[56, 8, 2.2, 2.4], [44, 15, 3.6, 3], [31, 22, 5, 3.4], [17, 27, 6.6, 3.6]];
      var back = '', front = '';
      bands.forEach(function (b, i) {
        back += F(trailE(32, b[0], b[1], b[2], 185, 355, b[3] * 0.5, b[3]), '#ffd8c0', 0.45);
        front += P(trailE(32, b[0], b[1], b[2], 15 + i * 8, 95 + i * 6, b[3], b[3] * 0.3), wind, 1.2) +
          P(trailE(32, b[0], b[1], b[2], 120 + i * 4, 172, b[3] * 0.9, b[3] * 0.3), wind, 1.2);
      });
      var sw = function (x, y, a) { return wpn(c, 'sword', x, y, a, 0.34); };
      var fig = 'M27,55 L28.5,42 L26,34 C26,31 29,30 32,30 C35,30 38,31 38,34 L35.5,42 L37,55 L33.6,55 L32,45 L30.4,55 Z';
      return iconWrap(c, ['#a8401a', '#160402'],
        glow(c, 32, 36, 32, '#ffb080', 0.7) +
        F('M3,14 C18,6 46,6 61,14 L40,60 L24,60 Z', c.lg([[0, '#ffc8a8', 0.45], [1, '#ff8a5a', 0.1]]), 1) +
        back +
        G(
        S('M27,33.5 L17,30 M37,33.5 L47,30', OL, 5.4) + S('M27,33.5 L17,30 M37,33.5 L47,30', '#5a3a2a', 2.8) +
        G(greatsword(c), 'translate(17,30) rotate(-75) scale(0.42)') + G(greatsword(c), 'translate(47,30) rotate(75) scale(0.42)') +
        P(fig, c.cel('#4a3a36'), 2) + C(32, 26, 4.6, c.cel('#8a929c'), 2) + S('M28,26 L36,26', OL, 1.4) + P('M27.6,24 L24.6,19 L29.6,22.6 Z M36.4,24 L39.4,19 L34.4,22.6 Z', '#f0e0c0', 1.1),
          'translate(32,40) scale(1.2) translate(-32,-40)') +
        front +
        sw(14, 14, -120) + sw(50, 13, 110) + sw(9, 38, -150) + sw(55, 36, 160) + sw(20, 57, -30) + sw(45, 57, 40) +
        sparkle(32, 5, 2.6, '#ffffff'));
    },
    /* warrior: a red war banner raised high on its pole, golden shout rings bursting out around it */
    rallying_cry: function (c) {
      var ban = 'M18,13 L46,13 L46,44 L32,37 L18,44 Z';
      var rings = arc(32, 26, 24, 200, 340, '#ffd860', 2.4, 0.95) + arc(32, 26, 29, 205, 335, '#ffe890', 1.8, 0.6) +
        arc(32, 26, 24, 110, 160, '#ffd860', 2.4, 0.8) + arc(32, 26, 24, 20, 70, '#ffd860', 2.4, 0.8) +
        arc(32, 26, 29, 115, 150, '#ffe890', 1.8, 0.5) + arc(32, 26, 29, 30, 65, '#ffe890', 1.8, 0.5);
      return iconWrap(c, ['#c8702a', '#1a0802'],
        glow(c, 32, 26, 32, '#ffe8a0', 0.8) +
        rays(32, 26, 16, 18, 31, '#fff4c8', 1.6, 0.45, 0.1) +
        rings +
        S('M32,64 L32,9', OL, 6) + S('M32,64 L32,9', c.cel(WOOD), 3.4) +
        S('M16,13 L48,13', OL, 5) + S('M16,13 L48,13', GOLD, 2.6) + C(16, 13, 2.2, c.cel(GOLD), 1.4) + C(48, 13, 2.2, c.cel(GOLD), 1.4) +
        P(ban, c.lg(['#e8403a', '#b01818', '#600808'], 0.2, 0, 0.8, 1), 2.2) +
        S('M20.6,15.5 L43.4,15.5 L43.4,40 L32,34.4 L20.6,40 Z', GOLD, 1.6) +
        P('M32,18 L35,24 L41,24.6 L36.4,28.6 L38,34.6 L32,31.4 L26,34.6 L27.6,28.6 L23,24.6 L29,24 Z', c.cel(GOLD), 1.4) +
        P('M26,4 L32,-2 L38,4 L32,11 Z', c.lg(STEEL, 0, 0, 1, 0), 1.8) +
        P('M26,50 C26,47 28,46 30,46 L37,46 C39,47 39,50 37,51 C39,52 39,55 37,56 C38,57 38,59 36,60 L28,60 C26,60 25,58 25,56 Z', c.cel('#e0a878'), 2) +
        S('M29,51 L36,51 M29,55.5 L36,55.5', '#a06a40', 1.2) +
        sparkle(9, 50, 2.8, '#ffffff') + sparkle(55, 52, 2.8, '#ffffff'));
    },
    /* mage: a concentrated violet-pink arcane orb bursting apart, shockwave ring and shards flying out */
    arcane_blast: function (c) {
      var sh = '', i;
      for (i = 0; i < 8; i++) {
        var a = (i / 8 + 0.06) * 360;
        sh += G(P('M0,-3 L2.4,0 L0,5 L-2.4,0 Z', '#ffd8ff', 1.2), 'rotate(' + a + ' 32 32) translate(32,5) rotate(180)');
      }
      return iconWrap(c, ['#b02aa8', '#140218'],
        glow(c, 32, 32, 34, '#ff9af0', 0.9) +
        P(star(32, 32, 12, 29, 11, 0.13), c.rg([[0, '#ffffff'], [0.35, '#ffb0f4'], [0.8, '#d040d0'], [1, '#7a1a9a']]), 2) +
        ring2(32, 32, 20, 20, '#ffc8fa', 2, 0.9) +
        sh +
        glow(c, 32, 32, 18, '#ffffff', 0.8) +
        C(32, 32, 11, c.rg([[0, '#ffffff'], [0.45, '#ffc8ff'], [0.85, '#e050e8'], [1, '#9a20b8']], 0.4, 0.38, 0.62), 2.2) +
        E(28, 28, 3.6, 2.4, '#ffffff', 0, 0.85, -35) +
        sparkle(32, 32, 5, '#ffffff') +
        sparkle(9, 9, 2.6, '#ffe8ff') + sparkle(55, 56, 2.6, '#ffe8ff'));
    },
    /* mage: three identical pointed-hat mages side by side, the outer two pale see-through copies */
    mirror_image: function (c) {
      return iconWrap(c, ['#5a3ad0', '#06041c'],
        glow(c, 32, 34, 34, '#b8c8ff', 0.8) +
        E(32, 60, 28, 3.4, '#d8e4ff', 0, 0.35) +
        mageG(c, 15, 60, 0.84, '#b8dcff', 0.62, true) + mageG(c, 49, 60, 0.84, '#b8dcff', 0.62, true) +
        S('M5,24 C4,30 4,36 6,42 M59,24 C60,30 60,36 58,42', '#d8e8ff', 1.6, 0.6) +
        mageG(c, 32, 61, 0.98, '#7a3ad8', 1) +
        sparkle(22, 12, 2.8, '#ffffff') + sparkle(43, 12, 2.8, '#ffffff') + sparkle(32, 3, 2, '#e0e8ff'));
    },
    /* priest: a lance of holy light driving straight down and bursting against the ground */
    penance: function (c) {
      var beam = c.lg([[0, '#ffffff'], [0.4, '#fff8d0'], [1, '#ffd860']], 0, 0, 1, 0);
      return iconWrap(c, ['#c8902a', '#1a0c02'],
        glow(c, 32, 30, 32, '#fff4c0', 0.7) +
        F('M22,0 L42,0 L39,50 L25,50 Z', '#fff0a0', 0.35) +
        P('M26,0 L38,0 L35.5,48 L28.5,48 Z', beam, 2) +
        F('M30,0 L34,0 L33,47 L31,47 Z', '#ffffff') +
        S('M24,0 L18,30 M40,0 L46,30', '#fffbe0', 1.4, 0.55) +
        E(32, 52, 26, 7, c.rg([[0, '#fff8d0', 0.9], [0.6, '#ffc840', 0.5], [1, '#ffc840', 0]]), 0) +
        ring2(32, 52, 22, 6, '#ffe070', 2, 0.9) + ring2(32, 52, 12, 3.4, '#fff8d0', 1.6, 0.9) +
        rays(32, 50, 14, 7, 17, '#fffbe0', 1.8, 0.8, 0.1) +
        burst(c, 32, 50, 12, 5, 10, ['#ffc840', '#fff4b0', '#ffffff']) +
        P('M14,40 L17,36 L18,41 Z M50,40 L47,36 L46,41 Z M8,50 L12,48 L11,52 Z M56,50 L52,48 L53,52 Z', '#fff4b0', 1.2) +
        sparkle(12, 14, 2.8, '#ffffff') + sparkle(52, 16, 2.8, '#ffffff'));
    },
    /* priest: a golden choir radiance, ribbons of light curling up out of it into glowing music notes */
    divine_hymn: function (c) {
      var rib = 'M32,44 C24,40 18,44 12,40 C7,37 6,31 9,28 M32,44 C40,40 46,44 52,40 C57,37 58,31 55,28';
      return iconWrap(c, ['#d8b050', '#1a1004'],
        glow(c, 32, 40, 34, '#fffbe0', 0.95) +
        rays(32, 44, 18, 16, 32, '#fffbe8', 1.8, 0.55, 0.08) +
        S(rib, OL, 6) + S(rib, '#ffd860', 3.6) + S(rib, '#ffffff', 1.2, 0.9) +
        ring2(32, 50, 17, 5, '#ffe070', 2.2) +
        glow(c, 32, 46, 14, '#ffffff', 0.95) +
        C(32, 46, 6.4, c.rg([[0, '#ffffff'], [0.6, '#fff4b0'], [1, '#f0b830']]), 1.8) +
        noteG(c, 14, 24, 1.1, -12) + noteG(c, 30, 20, 1.25, 0) + noteG(c, 46, 25, 1.1, 12) +
        sparkle(22, 8, 2.4, '#ffffff') + sparkle(52, 8, 2.4, '#ffffff'));
    },
    /* rogue: a rogue blinking between targets, three faded afterimages behind a flurry of crossing slashes */
    killing_spree: function (c) {
      return iconWrap(c, ['#5a1024', '#080204'],
        glow(c, 32, 32, 32, '#ff6a6a', 0.6) +
        hoodG('#9a6a88', 13, 38, 0.8, 0.35) + hoodG('#9a6a88', 51, 38, 0.8, 0.35) +
        hoodG(c.cel('#5a3a50'), 32, 42, 1, 1) +
        slash(4, 12, 60, 44, 3.4, -4, '#ff3a3a', 0.95) + slash(6, 52, 58, 10, 3.4, 4, '#ff3a3a', 0.95) +
        slash(20, 3, 44, 62, 2.6, 4, '#ff5a3a', 0.9) + slash(2, 30, 62, 26, 2.4, -3, '#ff5a3a', 0.85) +
        S('M8,17 L56,48 M10,56 L58,15', '#ffffff', 1, 0.3) +
        drop(12, 58, 0.9) + drop(52, 58, 0.8) + drop(56, 8, 0.7) +
        sparkle(32, 31, 4, '#ffffff'));
    },
    /* rogue: a rogue silhouette spinning mid-dance, daggers out, wrapped in whirling purple shadow */
    shadow_dance: function (c) {
      var ink = '#140820', rim = '#c890ff';
      var limbs = 'M31,24 L22,17 L14,9 M37,26 L45,31 L54,28 M31,38 L28,48 L26,59 M35,38 L44,44 L53,48';
      var torso = 'M29,22 C31,19 37,19 39,23 L37,39 L30,39 Z';
      var dg = function (x, y, a) { return G(P('M-2.2,0 L-2.2,-11 L0,-15 L2.2,-11 L2.2,0 Z', c.lg(['#ffffff', '#d8c0ff', '#7a5aa8'], 0, 0, 1, 0), 1.4) + R(-4.6, -0.6, 9.2, 2.2, '#6a4a8a', 1.2) + R(-1.4, 1.6, 2.8, 4, '#2a1a3a', 1), 'translate(' + x + ',' + y + ') rotate(' + a + ')'); };
      return iconWrap(c, ['#6a2ab0', '#08021a'],
        glow(c, 32, 32, 34, '#d8a8ff', 0.8) +
        P(trailE(32, 40, 26, 9, 190, 350, 1, 7), '#3a1a5a', 1.4, 0.9) +
        dg(13, 8, -45) + dg(56, 27, 80) +
        S(limbs, OL, 8) + S(limbs, ink, 5.4) + S(limbs, rim, 1, 0.6) +
        P(torso, ink, 2) +
        P('M34,8 C28,9 26,14 27,18 C28,22 31,23 34,23 C38,23 40,20 40,16 C40,12 38,9 34,8 Z M34,8 L41,5 L38,11 Z', ink, 2) +
        S('M29,12 C31,9 35,8.4 38,9.6', rim, 1.1, 0.7) +
        E(33, 16, 1.6, 1, '#f0c8ff', 0) + E(37.4, 16, 1.6, 1, '#f0c8ff', 0) +
        P(trailE(32, 40, 26, 9, 0, 170, 7, 1), c.lg([[0, '#d8a8ff', 0.95], [1, '#7a3ac8', 0.8]], 0, 0, 1, 0), 1.4) +
        S('M4,46 C8,52 14,55 20,56 M60,34 C60,28 57,24 52,21', '#e8c8ff', 1.4, 0.6) +
        sparkle(10, 56, 2.6, '#f0d8ff') + sparkle(52, 8, 2.8, '#ffffff'));
    },
    /* paladin: an upright holy sword at the heart of a spinning golden whirlwind of light */
    divine_storm: function (c) {
      var gw = c.lg([[0, '#fffbe0', 0.95], [1, '#f0b030', 0.85]], 0, 0, 1, 0);
      var bands = [[18, 22, 5.4, 5], [32, 25, 6.2, 6], [46, 21, 5.4, 5]];
      var back = '', front = '';
      bands.forEach(function (b, i) {
        var tf = 'rotate(' + (i === 1 ? 8 : -8) + ' 32 ' + b[0] + ')';
        back += G(F(trailE(32, b[0], b[1], b[2], 180, 360, b[3] * 0.4, b[3]), '#ffe8a0', 0.4), tf);
        front += G(P(trailE(32, b[0], b[1], b[2], 0, 175, b[3], b[3] * 0.3), gw, 1.5), tf);
      });
      return iconWrap(c, ['#d8a030', '#1e0e02'],
        glow(c, 32, 32, 34, '#fff4c0', 0.9) +
        rays(32, 30, 16, 20, 32, '#fffbe8', 1.6, 0.5, 0.1) +
        back +
        glow(c, 32, 14, 12, '#ffffff', 0.8) +
        G(greatsword(c), 'translate(32,45) scale(0.78)') +
        front +
        sparkle(32, 4, 3.6, '#ffffff') + sparkle(8, 34, 2.4, '#fffbe0') + sparkle(56, 34, 2.4, '#fffbe0') + sparkle(10, 58, 2.4, '#fffbe0') + sparkle(54, 58, 2.4, '#fffbe0'));
    },
    /* paladin: a golden holy cross emblem with rings of golden aura expanding out from it */
    aura_mastery: function (c) {
      return iconWrap(c, ['#c89030', '#140a02'],
        glow(c, 32, 32, 34, '#fff0b0', 0.85) +
        ring2(32, 32, 28, 28, '#ffe890', 1.6, 0.4) +
        ring2(32, 32, 23, 23, '#ffd860', 2.2, 0.7) +
        ring2(32, 32, 18, 18, '#ffe070', 3, 1) +
        S('M32,14.6 A17.4,17.4 0 0 1 49.4,32', '#ffffff', 1.1, 0.8) +
        rays(32, 32, 12, 30, 33, '#fffbe0', 1.4, 0.5, 0.26) +
        glow(c, 32, 32, 16, '#ffffff', 0.9) +
        G(crossP(c, 0.82), 'translate(32,32)') +
        sparkle(9, 9, 2.8, '#ffffff') + sparkle(55, 9, 2.8, '#ffffff') + sparkle(9, 55, 2.4, '#fffbe0') + sparkle(55, 55, 2.4, '#fffbe0'));
    },
    /* warlock: a ghostly skull soul streaking forward, a green-and-violet spirit tail trailing behind it */
    haunt: function (c) {
      var tail = band([[3, 5, 1], [10, 9, 5], [16, 16, 9], [20, 23, 13], [26, 28, 18], [34, 34, 22]]);
      var tail2 = band([[2, 22, 1], [9, 25, 3], [15, 28, 6], [22, 32, 9], [28, 35, 12]]);
      return iconWrap(c, ['#4a1a6a', '#040208'],
        glow(c, 40, 38, 30, '#b0ffb0', 0.6) +
        S('M4,40 C10,42 16,44 20,48 M8,54 C14,54 20,54 26,56 M16,4 C20,10 24,14 30,18', '#c890ff', 1.8, 0.6) +
        P(tail2, c.lg([[0, '#8a3ac8', 0], [1, '#a860e8', 0.85]], 0, 0, 1, 0.5), 1.2) +
        P(tail, c.lg([[0, '#9af07a', 0], [0.6, '#b8ffa0', 0.7], [1, '#e8ffe0', 0.95]], 0, 0, 1, 0.8), 1.4) +
        S('M10,10 C16,16 22,24 30,30', '#ffffff', 1.4, 0.6) +
        glow(c, 40, 38, 18, '#d8ffd0', 0.8) +
        G(skullG(c, 0, 0, 1.08, '#d8f8d0', '#3aff5a'), 'translate(40,38) rotate(-18)') +
        glow(c, 34, 36, 4.6, '#6aff6a', 0.9) + glow(c, 45.6, 32.6, 4.6, '#6aff6a', 0.9) +
        sparkle(56, 12, 2.8, '#e8ffe0') + sparkle(58, 56, 2.4, '#d8b0ff'));
    },
    /* warlock: a horned demon with great bat wings spread and fel-green eyes, burning in green fire */
    metamorphosis: function (c) {
      var wing = 'M24,40 C20,28 13,17 4,8 C6,16 5,22 2,28 C6,28 8,31 8,36 C11,34 14,35 15,40 C17,38 20,39 21,43 Z';
      var bones = 'M24,40 L5,9 M24,40 L3,28 M24,40 L8,36 M24,40 L15,40';
      var horn = 'M26,22 C22,18 19,12 20,4 C24,10 27,14 30,17 Z';
      var head = 'M24,26 C24,18 28,15 32,15 C36,15 40,18 40,26 C40,34 36,40 32,42 C28,40 24,34 24,26 Z';
      var skin = '#6a3a8a', wm = c.lg(['#5a2a7a', '#2a0e3a'], 0, 0, 1, 1);
      var wingL = P(wing, wm, 2) + S(bones, OL, 3) + S(bones, '#8a5aa8', 1.4);
      return iconWrap(c, ['#4a1a6a', '#060208'],
        glow(c, 32, 30, 34, '#a8ff60', 0.55) +
        wingL + G(wingL, 'translate(64,0) scale(-1,1)') +
        flameC(12, 56, 0.45, FEL) + flameC(52, 56, 0.45, FEL) +
        P('M13,64 C13,50 21,43 32,43 C43,43 51,50 51,64 Z', c.cel(skin), 2.2) +
        S('M22,52 C26,50 28,54 32,53 C36,54 38,50 42,52 M24,58 L28,56 M40,58 L36,56', '#8aff4a', 1.4, 0.9) +
        P(horn, c.cel('#2a1a24'), 1.8) + G(P(horn, c.cel('#2a1a24'), 1.8), 'translate(64,0) scale(-1,1)') +
        P(head, c.cel(skin), 2.2) +
        P('M25,24 L31,27.6 L30.6,29.4 L25,26.4 Z M39,24 L33,27.6 L33.4,29.4 L39,26.4 Z', OL, 1) +
        glow(c, 28, 28.4, 5, '#8aff3a', 0.95) + glow(c, 36, 28.4, 5, '#8aff3a', 0.95) +
        E(28, 28.6, 2.2, 1.2, '#e8ffb0', 0) + E(36, 28.6, 2.2, 1.2, '#e8ffb0', 0) +
        P('M27,34 C30,33 34,33 37,34 C36,38 34,39.6 32,39.6 C30,39.6 28,38 27,34 Z', '#1a040a', 1.4) +
        P('M28.4,34.4 L29.6,37.4 L30.6,34.6 Z M35.6,34.4 L34.4,37.4 L33.4,34.6 Z', '#fffbe8', 0.8) +
        S('M29,19 L30,22 M35,19 L34,22', '#8aff4a', 1.2, 0.8) +
        C(32, 3, 1.4, '#c8ff5a', 0) + C(6, 46, 1.2, '#c8ff5a', 0) + C(58, 46, 1.2, '#c8ff5a', 0));
    },
    /* hunter: an arrow in flight with a two-headed green chimera spirit surging along behind it */
    chimera_shot: function (c) {
      var n1 = smooth([[4, 60], [12, 50], [16, 38], [24, 28]]), n2 = smooth([[4, 60], [16, 54], [28, 50], [38, 42]]);
      return iconWrap(c, ['#2a7a3a', '#020c04'],
        glow(c, 34, 30, 32, '#b0ff90', 0.7) +
        S(n1, OL, 10.6) + S(n2, OL, 10.6) + S(n1, '#4ab83a', 8, 0.95) + S(n2, '#3a9a7a', 8, 0.95) +
        S(n1, '#c8ffa0', 2, 0.7) + S(n2, '#a8ffe0', 2, 0.7) +
        arrowB(c, 10, 54, 58, 6) +
        beastHead(c, 26, 26, -48, 1.05, '#6ad04a') + beastHead(c, 40, 40, -32, 1.05, '#4ab89a') +
        S('M50,22 L60,20 M44,12 L48,4', '#e8ffd0', 1.6, 0.8) +
        sparkle(56, 34, 2.6, '#ffffff') + sparkle(10, 10, 2.4, '#e8ffd0'));
    },
    /* hunter: three arrows in a tight line along the same path, one right behind the other, speed lines streaming */
    rapid_killing: function (c) {
      var sp = 'M2,34 L10,26 M2,58 L12,48 M8,62 L16,54 M30,62 L40,52 M44,48 L52,40 M50,56 L58,48';
      return iconWrap(c, ['#b0501a', '#140602'],
        glow(c, 34, 30, 32, '#ffd090', 0.7) +
        S(sp, '#fff0d0', 1.8, 0.7) +
        G(arrowB(c, 4, 44, 30, 18), '', 0.6) +
        G(arrowB(c, 18, 60, 44, 34), '', 0.6) +
        arrowB(c, 14, 48, 56, 6) +
        S('M4,58 L12,50 M26,36 L36,26', '#ffffff', 1, 0.5) +
        rays(56, 6, 8, 3, 8, '#ffffff', 1.6, 0.9, 0.2) +
        sparkle(10, 10, 2.6, '#fff4e0') + sparkle(58, 24, 2.4, '#fff4e0'));
    },
    /* druid: a great wall of wind and water spiralling round on itself, spray flying off its edge */
    typhoon: function (c) {
      var pts = [], i, n = 40;
      for (i = 0; i <= n; i++) {
        var t = i / n, a = 0.5 + t * Math.PI * 3.1, rr = 3 + 25 * t;
        pts.push([31 + Math.cos(a) * rr, 32 + Math.sin(a) * rr * 0.9, 1.5 + 11 * t]);
      }
      var wl = [], j;
      for (j = 4; j <= n; j++) { var t2 = j / n, a2 = 0.5 + t2 * Math.PI * 3.1, r2 = 3 + 25 * t2 - (1.5 + 11 * t2) * 0.25; wl.push([31 + Math.cos(a2) * r2, 32 + Math.sin(a2) * r2 * 0.9]); }
      return iconWrap(c, ['#1a7a9a', '#020a12'],
        glow(c, 31, 32, 32, '#a8f0ff', 0.75) +
        P(band(pts), c.rg([[0, '#ffffff'], [0.35, '#8ae0ff'], [0.75, '#2a8ad0'], [1, '#0a3a7a']], 0.48, 0.5, 0.55), 2.2) +
        S(smooth(wl), '#ffffff', 1.6, 0.8) +
        S('M2,20 C8,18 12,19 16,21 M1,30 C5,29 8,30 10,31 M2,52 C8,50 14,52 18,54', '#e8fbff', 1.8, 0.7) +
        drop(58, 12, 0.9, '#bff4ff') + drop(60, 24, 0.7, '#bff4ff') + drop(48, 5, 0.7, '#bff4ff') + drop(56, 58, 0.8, '#bff4ff') +
        C(31, 32, 3, '#e8fbff', 1.4) +
        sparkle(10, 8, 2.6, '#ffffff') + sparkle(8, 42, 2.2, '#e8fbff'));
    },
    /* druid: a green flower opening in full bloom, healing light pouring from its heart */
    lifebloom: function (c) {
      var pet = 'M0,0 C7,-6 7,-17 0,-24 C-7,-17 -7,-6 0,0 Z', pet2 = 'M0,0 C5,-5 5,-12 0,-16 C-5,-12 -5,-5 0,0 Z';
      var o1 = '', o2 = '', i;
      for (i = 0; i < 8; i++) o1 += G(P(pet, c.lg(['#e8ffc0', '#6ad03a', '#2a7a1a'], 0, 1, 0, 0), 1.8) + S('M0,-3 L0,-19', '#2a7a1a', 0.9, 0.7), 'translate(32,33) rotate(' + (i * 45 + 22.5) + ')');
      for (i = 0; i < 8; i++) o2 += G(P(pet2, c.lg(['#ffffff', '#c8ff90', '#6ac83a'], 0, 1, 0, 0), 1.6), 'translate(32,33) rotate(' + (i * 45) + ')');
      return iconWrap(c, ['#3a9a2a', '#041002'],
        glow(c, 32, 33, 34, '#d0ff9a', 0.85) +
        leaf(c, 12, 58, 55, 1.2, '#4ab02a') + leaf(c, 52, 58, -55, 1.2, '#4ab02a') +
        o1 + o2 +
        glow(c, 32, 33, 12, '#ffffff', 0.95) +
        C(32, 33, 5, c.rg([[0, '#ffffff'], [0.6, '#fff8a0'], [1, '#e8c030']]), 1.6) +
        plusS(8, 9, 3.6, '#ffffff', 2.2) + plusS(56, 10, 3.2, '#e8ffc0', 2) +
        sparkle(56, 40, 2.4, '#ffffff') + sparkle(8, 36, 2.2, '#ffffff'));
    },
    /* shaman: a black storm cloud hurling lightning down onto the ground all round in a blazing ring */
    thunderstorm: function (c) {
      var cx = 32, cy = 50, rx = 23, ry = 7;
      var hits = [[200, 1.4], [340, 1.4], [150, 2], [30, 2], [90, 2.2]];
      var bl = '', bu = '';
      hits.forEach(function (h, i) {
        var a = h[0] * Math.PI / 180, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
        bl += bolt(zig(32 + (x - 32) * 0.35, 18, x, y, 3, 2.4, i), h[1]);
        bu += burst(c, x, y, 5 + h[1], 2.4, 7, ['#4aa8ff', '#c8f0ff', '#ffffff']);
      });
      return iconWrap(c, ['#2a3a9a', '#04061a'],
        glow(c, 32, 46, 32, '#8ad4ff', 0.7) +
        E(cx, cy, rx + 5, ry + 3, c.rg([[0, '#8ad4ff', 0.1], [0.7, '#8ad4ff', 0.55], [1, '#8ad4ff', 0]]), 0) +
        ring2(cx, cy, rx, ry, '#8ad4ff', 2.4) + S(D`M${cx - rx + 3},${cy + 2} A${rx},${ry} 0 0 0 ${cx + rx - 3},${cy + 2}`, '#ffffff', 1, 0.8) +
        bl + bu +
        cloud(c, [[12, 14, 8], [22, 9, 9], [34, 8, 10], [46, 10, 9], [54, 16, 7], [30, 17, 8], [42, 18, 7], [18, 19, 6]], '#4a5470') +
        S('M14,10 C18,6 24,4 30,5', '#a8b8d8', 1.4, 0.7) +
        sparkle(6, 34, 2.4, '#e8f8ff') + sparkle(58, 32, 2.4, '#e8f8ff'));
    },
    /* shaman: a red-skinned face in profile roaring forward, a heartbeat line and red speed streaks tearing past */
    bloodlust: function (c) {
      var sk = '#d04a34';
      var head = 'M22,46 C17,38 17,24 25,16 C31,10 42,10 47,16 L50,22 L48.4,24.6 L53,30 L50,32.6 L57,35.6 L55,46.4 C50,51 43,53 37,52 L36,60 L21,60 Z';
      var ecg = 'M0,56 L10,56 L13,50 L17,62 L21,44 L25,58 L27,55 L36,55';
      return iconWrap(c, ['#c01a14', '#1a0202'],
        glow(c, 36, 32, 32, '#ff8a5a', 0.8) +
        OS('M1,16 L16,16 M0,24 L12,24 M1,34 L14,34 M2,42 L14,42', '#ff9a6a', 2.2) +
        S('M14,8 C8,14 5,22 5,30 M9,4 C3,10 0,18 0,26', '#ffc8a0', 1.6, 0.6) +
        P('M22,26 L10,17 L20,31 Z', c.cel(sk), 1.8) +
        P(head, c.cel(sk), 2.4) +
        P('M26,16 C24,10 28,6 33,7 C31,9 31,11 33,12 Z', '#1a0a06', 1.6) +
        S('M40,20 L49,23', OL, 2.4) + E(44.6, 25, 2.4, 1.4, '#fff4a0', 1) + C(45.4, 25.2, 0.8, '#d8141a', 0) +
        P('M57,35.6 L45,38.4 L55,46.4 Z', '#3a0404', 1.6) +
        P('M49,37 L50.4,39.6 L52,36.4 Z M53,36.2 L54,38.6 L55.4,35.8 Z', '#fffbe8', 0.7) +
        P('M49,44.4 C52,43 53.6,40 53,36.8 C51.6,39.6 50.2,41 48,42 Z', '#fffbe8', 1.2) +
        S('M30,40 C33,43 36,44 40,44 M31,30 L34,34', dk(sk, 0.35), 1.3, 0.8) +
        S(ecg, OL, 5) + S(ecg, '#ff3a3a', 2.6) + S(ecg, '#ffffff', 0.9) +
        sparkle(58, 8, 2.8, '#fff0e0') + sparkle(60, 56, 2.4, '#fff0e0'));
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
