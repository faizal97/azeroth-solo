/* art_icons6.js - more spell icons for Azeroth Solo (18 keys: two more class abilities for every class).
 * Loads AFTER art.js and art_icons2.js .. art_icons5.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Gradient ids use the prefix i6<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i6' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a tall iron-rimmed tower shield braced upright, a cold steel aura blazing round its edge */
    shield_wall: function (c) {
      var sh = 'M14,10 C22,6 42,6 50,10 L50,43 C50,52 41,57 32,61 C23,57 14,52 14,43 Z';
      var inner = 'M19,14 C25,11 39,11 45,14 L45,42 C45,49 38,53 32,56 C26,53 19,49 19,42 Z';
      var bands = R(10, 21, 44, 4.5, c.cel('#7c8793'), 1.6) + R(10, 39, 44, 4.5, c.cel('#7c8793'), 1.6) + R(29.8, 8, 4.4, 52, c.cel('#8c96a2'), 1.6);
      var rv = '', i, pts = [[22, 23.2], [42, 23.2], [22, 41.2], [42, 41.2], [32, 16], [32, 50]];
      for (i = 0; i < pts.length; i++) rv += C(pts[i][0], pts[i][1], 1.3, '#e8eef4', 0.9);
      return iconWrap(c, ['#8a6a4a', '#120a04'],
        glow(c, 32, 33, 32, '#d8ecff', 0.8) +
        rays(32, 33, 18, 27, 34, '#eef6ff', 2, 0.55, 0.12) +
        S(sh, '#a8d4ff', 10, 0.3) + S(sh, '#e4f4ff', 5.5, 0.6) +
        P(sh, c.lg(STEEL, 0.2, 0, 0.8, 1), 2.6) +
        P(inner, c.lg(['#c0502a', '#8a2a18', '#4a1008'], 0.2, 0, 0.8, 1), 1.8) +
        CG(bands + rv, c.clip(inner)) +
        C(32, 32.2, 6.4, c.cel('#c2cad3'), 2) + C(30.4, 30.6, 2.2, '#ffffff', 0, 0.85) +
        S('M17,13 C23,9 31,8.4 36,8.6', '#ffffff', 1.6, 0.85) +
        F('M4,60 C14,57 50,57 60,60 L60,64 L4,64 Z', '#1a1009', 0.55) +
        P('M8,58 L11,55 L12,59 Z M52,59 L55,56 L57,60 Z', '#9a8a78', 1) +
        sparkle(9, 12, 3.4, '#ffffff') + sparkle(55, 20, 2.8, '#ffffff'));
    },
    /* warrior: a greatsword hacked down from above into the ground, the earth cracking open under the blow */
    slam: function (c) {
      var hx = 48, hy = 8, ix = 19.4, iy = 53;
      var cr = 'M20,54 L13,57 L9,56 L2,62 M20,54 L25,59 L33,58 L38,64 M20,54 L29,55 L38,54 L46,58 L56,57 L63,60';
      return iconWrap(c, ['#9a6a3a', '#140a04'],
        glow(c, 24, 46, 28, '#ffd8a0', 0.7) +
        P(trailE(hx, hy, 50, 50, 118, 190, 18, 1), c.lg([[0, '#ffffff', 0.1], [0.6, '#fff4e0', 0.7], [1, '#ffffff', 0.95]], 0, 0, 0.3, 1), 0, 0.9) +
        S(D`M${hx + Math.cos(2.3) * 40},${hy + Math.sin(2.3) * 40} A40,40 0 0 1 ${hx + Math.cos(3.0) * 40},${hy + Math.sin(3.0) * 40}`, '#fff4e0', 1.8, 0.7) +
        F('M0,52 C12,50 40,51 64,53 L64,64 L0,64 Z', c.lg(['#5a3a1c', '#2a1808'])) + S('M0,52 C12,50 40,51 64,53', OL, 2.2) +
        S(cr, OL, 4.6) + S(cr, '#ffc860', 2.2) + S(cr, '#fff6d0', 0.8) +
        G(greatsword(c), 'translate(' + hx + ',' + hy + ') rotate(212) scale(1.02)') +
        rays(ix, iy, 10, 6, 16, '#fff6d8', 2.2, 0.9, 0.3) +
        burst(c, ix, iy - 1, 10, 4, 8, ['#e8a050', '#fff0c8', '#ffffff']) +
        P('M5,43 L10,38 L12,45 Z M33,41 L38,38 L38,45 Z M2,52 L6,48 L9,53 Z M38,49 L42,46 L43,51 Z', '#8a6a4a', 1.4) +
        C(12, 36, 1.4, '#e8d0b0', 0) + C(34, 34, 1.2, '#e8d0b0', 0));
    },
    /* mage: a figure frozen stiff inside a clear, glinting block of ice */
    ice_block: function (c) {
      var front = 'M9,22 L44,22 L44,58 L9,58 Z', top = 'M9,22 L21,10 L56,10 L44,22 Z', side = 'M44,22 L56,10 L56,46 L44,58 Z';
      var sk = '#b8d4ec';
      var fig = G(P('M-14,20 C-14,8 -8,3 0,3 C8,3 14,8 14,20 Z', c.cel('#4a6aa8'), 2) +
        S('M-8,8 C-4,12 4,12 8,8', dk('#4a6aa8', 0.4), 1.4, 0.8) +
        C(0, -6, 8.4, c.cel(sk), 2) +
        P('M-8.6,-8 C-9,-15 -4,-17 0,-17 C4,-17 9,-15 8.6,-8 C6,-11 3,-12 0,-12 C-3,-12 -6,-11 -8.6,-8 Z', '#6a8ab8', 1.6) +
        S('M-5.6,-5 L-2,-4.4 M2,-4.4 L5.6,-5', OL, 1.6) + S('M-2.6,1 L2.6,1', OL, 1.4), 'translate(26.5,38)');
      return iconWrap(c, ['#4a8ad0', '#040c24'],
        glow(c, 32, 34, 32, '#dff6ff', 0.6) +
        F(side, c.lg([[0, '#9ad8ff', 0.75], [1, '#4a90d0', 0.75]], 0, 0, 1, 1)) +
        F(top, c.lg(['#ffffff', '#c8f0ff'], 0, 0, 1, 1), 0.85) +
        fig +
        F(front, c.lg([[0, '#e8fbff', 0.62], [0.5, '#9adcff', 0.34], [1, '#5aa8e8', 0.55]], 0, 0, 1, 1)) +
        S('M13,34 L25,24 M13,46 L34,26 M30,56 L42,44', '#ffffff', 1.8, 0.7) +
        S('M40,26 L36,32 L38,36', '#ffffff', 1, 0.8) +
        S(front + top.replace('M9,22', 'M9,22') + side, OL, 2.4) +
        S('M11,24 L11,56 M11,24 L42,24', '#ffffff', 1.2, 0.8) + S('M46,23 L54,15', '#ffffff', 1.2, 0.7) +
        sparkle(47, 16, 3.6, '#ffffff') + sparkle(14, 52, 2.8, '#ffffff') + sparkle(58, 54, 2.6, '#e8fbff') +
        C(6, 12, 1.2, '#ffffff', 0) + C(60, 32, 1.1, '#ffffff', 0));
    },
    /* mage: a huge molten boulder wrapped in a blazing comet of flame, streaking in from the corner */
    pyroblast: function (c) {
      var cx = 38, cy = 38, r = 16;
      var rock = 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 1 0 ' + (cx + r) + ',' + cy + ' A' + r + ',' + r + ' 0 1 0 ' + (cx - r) + ',' + cy + ' Z';
      var lava = 'M26,34 L32,37 L30,44 L36,48 M32,37 L40,33 L44,38 L50,36 M40,33 L38,26 M44,38 L42,46 L46,51 M30,44 L24,46';
      return iconWrap(c, ['#c83a0c', '#1a0200'],
        glow(c, 34, 34, 34, '#ffb040', 0.7) +
        F('M-2,-2 C14,6 34,14 49.3,26.7 L26.7,49.3 C14,34 6,14 -2,-2 Z', c.lg([[0, '#ffe068', 0], [0.6, '#ff8a1a', 0.6], [1, '#ffd040', 0.95]], 0, 0, 1, 1)) +
        F('M6,6 C18,14 30,20 44,31 L31,44 C20,30 14,18 6,6 Z', c.lg([[0, '#ffffff', 0], [1, '#fff4c0', 0.85]], 0, 0, 1, 1)) +
        G(flameC(0, 0, 1.35, FIRE), 'translate(33,33) rotate(-45)') +
        P(rock, c.rg([[0, '#8a3a18'], [0.6, '#4a1608'], [1, '#1e0602']], 0.62, 0.62, 0.62), 2.4) +
        CG(S(lava, OL, 4) + S(lava, '#ff8a1a', 2.6) + S(lava, '#fff0a0', 1), c.clip(rock)) +
        S(D`M${cx - 12},${cy - 9} A${r - 2},${r - 2} 0 0 1 ${cx + 3},${cy - 14}`, '#ffd060', 2.2, 0.85) +
        C(56, 56, 1.6, '#ffe868', 0) + C(58, 22, 1.4, '#ffd040', 0) + C(20, 58, 1.3, '#ffd040', 0) + C(12, 30, 1.5, '#ffe868', 0) + C(28, 8, 1.2, '#ffe868', 0));
    },
    /* priest: a bright golden ring of light blasting outward from a small core, rays flying off in every direction */
    holy_nova: function (c) {
      var cx = 32, cy = 32;
      return iconWrap(c, ['#d8a030', '#2a1604'],
        glow(c, cx, cy, 34, '#fff4c0', 0.85) +
        rays(cx, cy, 16, 21, 31, OL, 5, 0.9, 0) + rays(cx, cy, 16, 21, 31, '#fff2b0', 2.6, 1, 0) +
        rays(cx, cy, 16, 22, 27, OL, 3.6, 0.8, Math.PI / 16) + rays(cx, cy, 16, 22, 27, '#ffffff', 1.6, 1, Math.PI / 16) +
        C(cx, cy, 16, c.rg([[0, '#fff8d8'], [0.5, '#e8a830'], [1, '#8a5210']]), 0) +
        ring2(cx, cy, 16.5, 16.5, '#fff0a0', 5.4) + S(D`M${cx - 16.5},${cy} A16.5,16.5 0 1 1 ${cx + 16.5},${cy} A16.5,16.5 0 1 1 ${cx - 16.5},${cy}`, '#ffffff', 1.8, 0.9) +
        ring2(cx, cy, 25, 25, '#fff4c0', 1.4, 0.55) +
        C(cx, cy, 5.5, c.rg([[0, '#ffffff'], [0.6, '#fff6c0'], [1, '#ffd060']]), 1.6) +
        sparkle(cx, cy, 8, '#ffffff') +
        sparkle(8, 8, 3, '#ffffff') + sparkle(56, 56, 3, '#ffffff') + sparkle(56, 8, 2.4, '#fff4c0') + sparkle(8, 56, 2.4, '#fff4c0'));
    },
    /* priest: a big glowing golden plus floating above a pair of cupped open hands */
    greater_heal: function (c) {
      var sk = '#f0c8a0';
      var fg = 'M-6,-17 L-6.6,-28 M-2,-18 L-2,-32.5 M2,-18 L2.4,-32 M5.6,-17 L6.6,-28.5 M6,-8 L12.6,-16.5';
      var palm = 'M-8.5,-2 C-9.5,-8 -9,-14 -8,-18 C-4,-20 4,-20 8,-18 C9,-13 9.5,-8 8.5,-2 Z';
      var hand = function (tf) {
        return G(S(fg, OL, 7.2) + P(palm, c.cel(sk), 2.2) + S(fg, sk, 4.4) + S('M-2,-30 L-2,-27 M2.3,-29.5 L2.3,-26.5', '#ffffff', 1, 0.5) +
          S('M-4.5,-10 C-1.5,-8 2,-9 5,-12.5', dk(sk, 0.35), 1, 0.7) +
          P('M-9.5,-3 L9.5,-3 L11,8 L-11,8 Z', c.cel('#f4ecdc'), 2) + S('M-9.8,-0.6 L9.8,-0.6', GOLD, 1.8), tf);
      };
      var plus = 'M27,5 L37,5 L37,15 L47,15 L47,25 L37,25 L37,35 L27,35 L27,25 L17,25 L17,15 L27,15 Z';
      return iconWrap(c, ['#e0b040', '#2a1604'],
        glow(c, 32, 22, 32, '#fff6c8', 0.95) +
        rays(32, 20, 12, 18, 30, '#fffbe8', 1.8, 0.6, 0.26) +
        E(32, 44, 14, 12, c.rg([[0, '#ffffff', 0.8], [1, '#fff4c0', 0]]), 0) +
        S(plus, '#fff4c0', 7, 0.45) +
        P(plus, c.lg(['#fffbe0', '#ffd860', '#d09010'], 0.2, 0, 0.8, 1), 2.4) +
        F('M29.2,7.2 L34.8,7.2 L34.8,17.2 L44.8,17.2 L44.8,22.8 L34.8,22.8 L34.8,32.8 L29.2,32.8 L29.2,22.8 L19.2,22.8 L19.2,17.2 L29.2,17.2 Z', '#ffffff', 0.55) +
        hand('translate(16,60) rotate(-14) scale(1.05)') + hand('translate(48,60) rotate(14) scale(-1.05,1.05)') +
        sparkle(8, 10, 3.4, '#ffffff') + sparkle(56, 10, 3, '#ffffff') + sparkle(32, 46, 3, '#ffffff'));
    },
    /* rogue: a pouch of powder flung into a face, a choking cloud of dust over its eyes */
    blind: function (c) {
      var sk = '#e0a878';
      var puffs = [[21, 30, 6], [29, 27, 7], [39, 27, 7], [47, 30, 6], [34, 33, 6.5], [25, 35, 5], [44, 35, 5]];
      return iconWrap(c, ['#7a5a6a', '#10080c'],
        glow(c, 34, 32, 30, '#f0e0c0', 0.5) +
        E(18, 38, 3, 5, c.cel(sk), 1.8) + E(50, 38, 3, 5, c.cel(sk), 1.8) +
        C(34, 36, 16, c.cel(sk), 2.4) +
        P('M18,32 C17,20 24,16 34,16 C44,16 51,20 50,32 C46,24 40,22 34,22 C28,22 22,24 18,32 Z', '#4a2a14', 2) +
        E(34, 47, 4.6, 3.6, '#3a0a0a', 1.6) + S('M31,49 C33,48 35,48 37,49', '#e89a88', 1.2) +
        S('M26,41 L25,45 M42,41 L43,45', '#8ad0ff', 1.8, 0.85) +
        S('M2,62 C10,54 14,44 22,36', '#e8e0c8', 7, 0.35) + S('M4,60 C10,54 14,46 20,40', '#fff8e0', 2.4, 0.6) +
        cloud(c, puffs, '#d8ccb0') +
        S('M24,28 C28,25 32,26 34,28 M38,26 C42,24 46,27 47,29', '#fffbe8', 1.4, 0.8) +
        C(52, 22, 1.5, '#e8dcc0', 0) + C(56, 30, 1.2, '#e8dcc0', 0) + C(16, 22, 1.4, '#e8dcc0', 0) + C(12, 30, 1.1, '#e8dcc0', 0) +
        C(20, 46, 1.3, '#e8dcc0', 0) + C(14, 48, 1.1, '#e8dcc0', 0) +
        G(P('M-6,-2 C-8,4 -6,10 0,10 C6,10 8,4 6,-2 L3,-5 L-3,-5 Z', c.cel('#8a5a30'), 2) + S('M-3.4,-4 L3.4,-4', GOLD, 1.6) +
          P('M-3,-5 L-5,-9 L0,-7 L5,-9 L3,-5 Z', c.cel('#a8703a'), 1.4), 'translate(9,55) rotate(40)'));
    },
    /* rogue: a burst of smoke with only an empty, fading hooded cloak left where the rogue stood */
    vanish: function (c) {
      var hood = 'M17,50 C16,36 19,24 22,18 C24,10 28,6 32,6 C36,6 40,10 42,18 C45,24 48,36 47,50 Z';
      var face = 'M26,20 C26,14 29,11 32,11 C35,11 38,14 38,20 C38,25 35,28 32,28 C29,28 26,25 26,20 Z';
      var puffs = [[12, 52, 9], [25, 47, 11], [39, 47, 11], [52, 52, 9], [20, 58, 9], [34, 58, 10], [48, 60, 8], [6, 60, 7], [58, 60, 7], [32, 40, 8]];
      return iconWrap(c, ['#3a3a5c', '#05050c'],
        glow(c, 32, 34, 30, '#b8b0e0', 0.5) +
        G(P(hood, c.lg([[0, '#6a6088', 1], [0.6, '#3a3456', 0.7], [1, '#3a3456', 0]]), 0) +
          S(hood, '#d8d0f8', 1.6) + P(face, '#07050c', 0) + C(29.5, 20, 1, '#8a80a8', 0) + C(34.5, 20, 1, '#8a80a8', 0), '', 0.55) +
        '<path d="' + hood + '" fill="none" stroke="#f0ecff" stroke-width="1.4" stroke-dasharray="3 3" opacity="0.7"/>' +
        cloud(c, puffs, '#8a84a0') +
        S('M18,46 C20,42 24,42 26,44 M36,43 C38,40 42,40 44,43 M10,54 C12,51 16,51 17,53', '#d8d4ec', 1.6, 0.8) +
        S('M12,38 C6,32 10,26 16,28 M52,38 C58,32 54,26 48,28 M22,36 C18,30 20,26 24,26', '#c8c4e0', 2, 0.6) +
        sparkle(10, 14, 3, '#e8e4ff') + sparkle(55, 14, 2.6, '#e8e4ff'));
    },
    /* paladin: a single golden lightning-bolt of holy light striking down, sparks flying off its tip */
    holy_shock: function (c) {
      var bl = 'M33,2 L51,2 L39,23 L50,23 L20,62 L28,33 L16,33 Z';
      return iconWrap(c, ['#c89020', '#1e1002'],
        glow(c, 34, 30, 32, '#fff0a0', 0.85) +
        S('M6,10 L14,14 M4,26 L12,26 M54,40 L62,44 M52,54 L60,60 M58,28 L63,26', '#fff8d0', 1.8, 0.6) +
        S(bl, '#fff4c0', 8, 0.4) +
        P(bl, c.lg(['#ffffff', '#fff0a0', '#e8a818'], 0.2, 0, 0.8, 1), 2.4) +
        S('M35,5 L25,23 M37,26 L27,48', '#ffffff', 1.8, 0.85) +
        rays(22, 58, 10, 5, 13, '#fffbe0', 1.8, 0.9, 0.2) +
        burst(c, 22, 58, 8, 3.2, 8, ['#ffc030', '#fff6c0', '#ffffff']) +
        sparkle(12, 44, 3.6, '#ffffff') + sparkle(52, 12, 3, '#ffffff') + sparkle(56, 34, 2.4, '#fff4c0'));
    },
    /* paladin: an upright sword before a glowing golden triangle seal ringed with runes */
    seal_command: function (c) {
      var cx = 32, cy = 30, R0 = 21, tri = '', tk = '', i;
      for (i = 0; i < 3; i++) { var a = -Math.PI / 2 + i * Math.PI * 2 / 3; tri += (i ? 'L' : 'M') + r1(cx + Math.cos(a) * R0) + ',' + r1(cy + Math.sin(a) * R0); }
      tri += 'Z';
      for (i = 0; i < 18; i++) { var b = i / 18 * Math.PI * 2 + 0.17, l = i % 3 ? 3 : 5; tk += D`M${cx + Math.cos(b) * (R0 + 3)},${cy + Math.sin(b) * (R0 + 3)} L${cx + Math.cos(b) * (R0 + 3 + l)},${cy + Math.sin(b) * (R0 + 3 + l)}`; }
      var dots = '';
      for (i = 0; i < 3; i++) { var a2 = -Math.PI / 2 + i * Math.PI * 2 / 3; dots += C(cx + Math.cos(a2) * R0, cy + Math.sin(a2) * R0, 3.2, c.cel('#fff0a0'), 1.6); }
      return iconWrap(c, ['#c8701c', '#1e0802'],
        glow(c, cx, cy, 32, '#ffe890', 0.85) +
        C(cx, cy, R0, c.rg([[0, '#fff4c0', 0.5], [1, '#ffb030', 0.15]]), 0) +
        S(tk, OL, 3.6) + S(tk, '#ffe070', 1.8) +
        ring2(cx, cy, R0, R0, '#ffd860', 2.6) +
        S(tri, OL, 5.4) + S(tri, '#fff0a0', 2.8) + S(tri, '#ffffff', 1, 0.8) +
        dots +
        wpn(c, 'sword', 32, 53, 0, 1) +
        sparkle(10, 10, 3, '#ffffff') + sparkle(54, 54, 3, '#fff4c0'));
    },
    /* warlock: twined green and purple streams of life drawn up out of a slumped figure into a glowing orb */
    siphon_life: function (c) {
      var s1 = smooth([[19, 44], [24, 34], [22, 24], [32, 18], [42, 22], [50, 14]]);
      var s2 = smooth([[17, 44], [14, 34], [22, 28], [30, 26], [40, 14], [50, 14]]);
      var g1 = c.lg(['#e8ffc0', '#6aff3a', '#1a8a1a'], 1, 0, 0, 1), g2 = c.lg(['#f4d8ff', '#c060ff', '#6a1aa8'], 1, 0, 0, 1);
      return iconWrap(c, ['#3a1450', '#050108'],
        glow(c, 50, 14, 22, '#aaff70', 0.8) + glow(c, 18, 46, 18, '#8aff5a', 0.45) +
        G(P('M2,64 C3,52 7,46 12,44 C9,40 9,34 12,31 C14,28 20,28 22,31 C25,34 25,40 22,44 C28,46 32,52 33,64 Z', c.lg(['#9a88c0', '#5e4c88', '#2a2046'], 0.2, 0, 0.8, 1), 2.2) +
          S('M9,40 C10,34 14,31 17,31 M5,60 C6,52 9,47 12,45', '#e0d0ff', 1.4, 0.8) + S('M13,37 L15,36 M19,36 L21,37', '#c0ffa0', 1.4, 0.9), 'rotate(8 17 50)') +
        S(s2, OL, 7.6) + S(s2, g2, 4.6) + S(s1, OL, 7.6) + S(s1, g1, 4.6) + S(s1, '#f4ffe8', 1.4, 0.8) +
        C(18, 45, 4, c.rg([[0, '#ffffff'], [0.5, '#c0ff90', 0.8], [1, '#6aff3a', 0]]), 0) +
        C(50, 14, 7.5, c.rg([[0, '#ffffff'], [0.45, '#b8ff80'], [1, '#2aa01a']]), 2) +
        C(47.6, 11.6, 2, '#ffffff', 0, 0.9) +
        C(28, 30, 1.5, '#e8ffc0', 0) + C(38, 20, 1.4, '#f4d8ff', 0) + C(24, 22, 1.2, '#e8ffc0', 0) + C(44, 26, 1.3, '#f4d8ff', 0) +
        sparkle(58, 34, 2.8, '#e8ffc0') + sparkle(34, 8, 2.4, '#f4d8ff'));
    },
    /* warlock: a burning target caught in the heart of a fire explosion, flame tongues blowing out all round */
    conflagrate: function (c) {
      var cx = 32, cy = 34, fl = '', i;
      for (i = 0; i < 9; i++) {
        var a = i / 9 * 360 + 10, rad = a * Math.PI / 180;
        fl += G(flameC(0, 0, 0.44, FIRE), 'translate(' + r1(cx + Math.cos(rad) * 22) + ',' + r1(cy + Math.sin(rad) * 22) + ') rotate(' + r1(a + 90) + ')');
      }
      return iconWrap(c, ['#8a1a24', '#140004'],
        glow(c, cx, cy, 34, '#ff8a3a', 0.8) +
        fl +
        P(star(cx, cy, 12, 26, 14, 0.13), c.rg([[0, '#fffbe0'], [0.45, '#ffc040'], [0.8, '#ff5a14'], [1, '#c81a0a']]), 2.2) +
        C(cx, cy, 11, c.rg([[0, '#ffffff'], [0.7, '#fff4c0', 0.9], [1, '#ffd060', 0]]), 0) +
        G(P('M-10,14 C-10,6 -6,3 0,3 C6,3 10,6 10,14 Z', '#3a0c06', 1.8) + C(0, -3.5, 5, '#3a0c06', 1.8) +
          S('M-9,12 C-9,7 -6,4.5 -2,4', '#ff8a1a', 1.2, 0.9) + S('M-4,-6 C-3,-8 -1,-8.5 1,-8.5', '#ff8a1a', 1.2, 0.9) +
          flameC(-5, 0, 0.22, FIRE) + flameC(5, 2, 0.2, FIRE) + flameC(0, -8, 0.24, FIRE), 'translate(' + cx + ',' + (cy - 2) + ')') +
        S('M6,8 L12,14 M58,8 L52,14 M4,60 L10,54 M60,60 L54,54', '#ffd080', 1.8, 0.75) +
        C(8, 34, 1.5, '#ffe868', 0) + C(56, 34, 1.4, '#ffe868', 0) + C(32, 4, 1.3, '#ffe868', 0) + C(32, 62, 1.3, '#ffe868', 0));
    },
    /* hunter: a blunt-tipped arrow thumping into a head in profile, stars bursting out the back of it */
    scatter_shot: function (c) {
      var sk = '#e0a878';
      var head = 'M24,26 C24,16 32,11 40,11 C50,11 57,19 57,30 C57,38 53,44 48,47 L48,56 L32,56 L32,50 C28,50 26,47 26,44 L23,43 L25,39 L22,37 L25,33 Z';
      return iconWrap(c, ['#6a7a3a', '#0c1002'],
        glow(c, 32, 30, 30, '#f0f0b0', 0.55) +
        P(head, c.cel(sk), 2.4) +
        P('M24,26 C24,16 32,11 40,11 C50,11 57,19 57,30 C54,24 50,21 44,21 C38,21 33,20 28,24 Z', '#4a2a14', 2) +
        E(46, 32, 3.2, 4.6, c.cel(dk(sk, 0.08)), 1.6) +
        S('M29,30 L34,35 M34,30 L29,35', OL, 2.2) +
        S('M27,45 C29,44 31,44 32,45', OL, 1.6) +
        S('M0,40 L20,33', OL, 5.4) + S('M0,40 L20,33', '#c9a878', 2.8) +
        P('M4,36 L-2,33 L-4,40 L2,40 Z M4,42 L-2,43 L-2,48 L4,43 Z', '#b8342a', 1.4) +
        C(21, 32.6, 4.4, c.cel('#8a6a4a'), 2) +
        burst(c, 23.5, 30, 6.5, 2.6, 8, ['#ffb030', '#ffe868', '#ffffff']) +
        S('M50,16 L58,8 M56,24 L63,20 M44,12 L46,4', '#fff8c0', 1.6, 0.8) +
        dstar(56, 8, 4.4) + dstar(60, 22, 3.8) + dstar(46, 5, 3.6) + dstar(36, 5, 3) + dstar(62, 36, 3));
    },
    /* hunter: a drawn bow and arrow with a golden aura ring orbiting it, light rising all around */
    trueshot_aura: function (c) {
      var bw = 'M36,3 C56,14 56,50 36,61', gh = c.lg(['#fffbe0', '#ffd860', '#b07a10'], 0, 0, 1, 0);
      var bow = G(S(bw, OL, 8) + S(bw, c.lg([lt(WOOD, 0.35), WOOD, dk(WOOD, 0.3)], 0, 0, 1, 0), 5) + S('M38,6 C53,16 53,30 52,32', lt(WOOD, 0.5), 1.2, 0.8) +
        S('M36,3 L22,32 L36,61', OL, 3.2) + S('M36,3 L22,32 L36,61', '#f4ead0', 1.4) +
        R(49.5, 26.5, 6, 11, c.cel(LEATH), 1.8) + C(36, 3, 2.2, c.cel(GOLD), 1.3) + C(36, 61, 2.2, c.cel(GOLD), 1.3) +
        S('M18,32 L55,32', '#fff4c0', 8, 0.4) + S('M18,32 L55,32', OL, 6) + S('M18,32 L55,32', '#f0c860', 3.4) +
        P('M66,32 L54,25.5 L57,32 L54,38.5 Z', gh, 2) +
        P('M26,32 L19,25 L14,25 L21,32 Z M26,32 L19,39 L14,39 L21,32 Z', '#fff0c0', 1.5), 'rotate(-42 32 32) translate(-4,1)');
      return iconWrap(c, ['#8a7a20', '#121002'],
        glow(c, 32, 34, 32, '#fff0a0', 0.8) +
        S('M10,50 L10,24 M54,50 L54,24', '#fff8d0', 2.2, 0.35) +
        earc(32, 46, 27, 8.5, 180, 360, '#ffe070', 3.6, 0.8) +
        bow +
        earc(32, 46, 27, 8.5, 0, 180, '#fff0a0', 4.2) + S(D`M${5},${46} A27,8.5 0 0 0 ${59},${46}`, '#ffffff', 1.2, 0.8) +
        sparkle(8, 10, 3, '#ffffff') + sparkle(58, 58, 2.8, '#ffffff') + sparkle(10, 36, 2.2, '#fff4c0') + sparkle(56, 34, 2.2, '#fff4c0'));
    },
    /* druid: a huge clawed bear paw smashing down into the ground, stars bursting from the blow */
    bash: function (c) {
      var fur = '#8a5a30', fd = dk(fur, 0.45);
      var arm = P('M-11,-52 L11,-52 L12,-42 L15,-38 L13,-32 L16,-26 L14,-20 L17,-13 L-17,-13 L-14,-20 L-16,-26 L-13,-32 L-15,-38 L-12,-42 Z',
        c.lg([lt(fur, 0.2), fur, dk(fur, 0.35)], 0, 0, 1, 0), 2.2) +
        S('M-7,-44 L-5,-38 M1,-46 L2,-40 M7,-40 L8,-34 M-9,-30 L-7,-24 M2,-32 L3,-26 M9,-24 L10,-18', fd, 1.3);
      var paw = P('M-18,-14 C-21,0 -15,12 0,12 C15,12 21,0 18,-14 Z', c.cel(fur), 2.4) +
        S('M-18,-14 L-14,-11 L-11,-15 L-7,-11 L-3,-15 L1,-11 L5,-15 L9,-11 L13,-15 L18,-14', fd, 1.4) +
        S('M-10,-5 L-8,1 M-2,-7 L-1,-1 M6,-6 L7,0', fd, 1.3);
      var claws = '', toes = '', i, xs = [-12, -4.2, 4.2, 12];
      for (i = 0; i < 4; i++) {
        toes += C(xs[i], 10, 4.6, c.cel(lt(fur, 0.05)), 1.8);
        claws += P(D`M${xs[i] - 2.8},${12} C${xs[i] - 3.2},${19} ${xs[i] - 1.4},${23} ${xs[i] + 1.6},${26} C${xs[i] + 0.8},${21} ${xs[i] + 3},${17} ${xs[i] + 2.8},${12} Z`, c.lg(['#ffffff', '#ece2c8', '#a89878'], 0, 0, 0, 1), 1.5);
      }
      return iconWrap(c, ['#b0702a', '#160a02'],
        glow(c, 24, 50, 30, '#ffd890', 0.7) +
        F('M0,54 C14,52 50,52 64,54 L64,64 L0,64 Z', '#2a1808') + S('M0,54 C14,52 50,52 64,54', OL, 2.2) +
        S('M2,48 L8,50 M40,50 L50,48 M2,40 L8,44 M42,44 L50,40', '#fff0d0', 1.8, 0.7) +
        burst(c, 22, 55, 13, 4.6, 10, ['#ff9a2a', '#ffe060', '#ffffff']) +
        G(arm + claws + paw + toes, 'translate(29,33) rotate(25)') +
        dstar(6, 30, 4.4) + dstar(50, 34, 4.2) + dstar(12, 16, 3.4) + dstar(56, 48, 3.4) + dstar(40, 44, 3));
    },
    /* druid: a glowing blue-green spirit leaf over a figure's heart, energy filling it up from below */
    innervate: function (c) {
      var fig = 'M8,64 C9,50 14,42 22,40 C18,36 17,30 18,24 C19,16 25,12 32,12 C39,12 45,16 46,24 C47,30 46,36 42,40 C50,42 55,50 56,64 Z';
      var lvl = 'M0,64 L0,44 C8,40 16,46 24,42 C32,38 40,44 48,40 C54,37 60,40 64,42 L64,64 Z';
      return iconWrap(c, ['#1a7a6a', '#020e0c'],
        glow(c, 32, 40, 32, '#9affe0', 0.7) +
        P(fig, c.lg(['#2a4a5a', '#1a3040', '#0c1820'], 0.2, 0, 0.8, 1), 2.4) +
        CG(F(lvl, c.lg(['#c8fff0', '#3affc0', '#0a9a8a'])) + S('M0,44 C8,40 16,46 24,42 C32,38 40,44 48,40 C54,37 60,40 64,42', '#ffffff', 1.6, 0.9), c.clip(fig)) +
        S(fig, '#8affe0', 1.2, 0.6) +
        S('M6,56 C2,44 8,32 16,26 M58,56 C62,44 56,32 48,26', '#a0fff0', 2, 0.6) +
        S('M12,20 C10,14 14,10 18,10 M52,20 C54,14 50,10 46,10', '#a0fff0', 1.6, 0.5) +
        glow(c, 32, 40, 14, '#e8fff8', 0.9) +
        leaf(c, 32, 52, 0, 1.4, '#4ae8b0') +
        F('M32,48 C30,44 30,36 32,31 C31,37 31,43 32,48 Z', '#ffffff', 0.6) +
        sparkle(14, 12, 3, '#e8fff8') + sparkle(50, 8, 2.6, '#e8fff8') + sparkle(56, 34, 2.4, '#c8fff0') + sparkle(8, 36, 2.4, '#c8fff0') +
        C(26, 30, 1.3, '#ffffff', 0) + C(40, 26, 1.2, '#ffffff', 0));
    },
    /* shaman: a squat stone totem with lava pouring out of its mouth into burning pools at its base */
    magma_totem: function (c) {
      var st = c.lg(['#8a8078', '#5a524c', '#2a2420'], 0.2, 0, 0.8, 1), lav = c.lg(['#fff0a0', '#ff8a1a', '#d02a08']);
      var body = 'M17,55 L14,30 C14,26 20,23 32,23 C44,23 50,26 50,30 L47,55 Z';
      return iconWrap(c, ['#a8300a', '#140200'],
        glow(c, 32, 50, 32, '#ff9a3a', 0.75) +
        E(32, 57, 26, 6, c.rg([[0, '#fff0a0'], [0.4, '#ff9a1a'], [0.8, '#d0300a'], [1, '#6a0a00']]), 2) +
        P(body, st, 2.4) +
        S('M18,34 L21,40 L19,46 M45,32 L42,38 L44,44', OL, 3) + S('M18,34 L21,40 L19,46 M45,32 L42,38 L44,44', '#ff8a1a', 1.4) +
        P('M11,26 C11,20 19,16 32,16 C45,16 53,20 53,26 L53,29 L11,29 Z', c.lg(['#9a9088', '#6a605a', '#3a322c'], 0.2, 0, 0.8, 1), 2.2) +
        P('M22,17 L26,11 L30,16 L34,9 L38,16 L42,12 L44,18 Z', lav, 1.6) +
        P('M19,32 L28,34 L27,37 L20,36 Z M45,32 L36,34 L37,37 L44,36 Z', '#ffc030', 1.4) +
        E(32, 42, 7, 4.6, '#1a0604', 2) + E(32, 43, 5, 3, '#ff6a10', 0) +
        P('M27,43 C27,48 25,52 23,58 L41,58 C39,52 37,48 37,43 C35,45 29,45 27,43 Z', lav, 1.8) +
        S('M31,46 L30,56 M34,46 L35,54', '#fff6c0', 1.3, 0.8) +
        E(8, 58, 6, 2.6, '#ff8a1a', 1.4) + E(57, 59, 6, 2.6, '#ff8a1a', 1.4) +
        flameC(8, 54, 0.3, FIRE) + flameC(57, 55, 0.32, FIRE) + flameC(18, 56, 0.2, FIRE) + flameC(47, 56, 0.2, FIRE) +
        C(8, 20, 1.4, '#ffe868', 0) + C(56, 14, 1.3, '#ffe868', 0) + C(58, 36, 1.2, '#ffd040', 0));
    },
    /* shaman: a flowing blue-green healing stream arcing between three glowing healing orbs */
    chain_heal: function (c) {
      var A = [11, 47], B = [32, 17], Cc = [53, 45];
      var a1 = D`M${A[0]},${A[1]} Q${6},${20} ${B[0]},${B[1]}`, a2 = D`M${B[0]},${B[1]} Q${60},${16} ${Cc[0]},${Cc[1]}`;
      var st = c.lg(['#e8fff8', '#4ae8c8', '#1a88b0'], 0, 0, 1, 1);
      var orb = function (p, r) {
        return glow(c, p[0], p[1], r * 2.3, '#9affe8', 0.9) + C(p[0], p[1], r, c.rg([[0, '#ffffff'], [0.45, '#8affe0'], [1, '#1a8ab0']]), 2) +
          plusS(p[0], p[1], r * 0.55, '#ffffff', r * 0.3);
      };
      return iconWrap(c, ['#1a6a8a', '#020c14'],
        S(a1, '#c8fff0', 9, 0.3) + S(a2, '#c8fff0', 9, 0.3) +
        S(a1, OL, 7.6) + S(a1, st, 5) + S(a1, '#ffffff', 1.4, 0.85) +
        S(a2, OL, 6.6) + S(a2, st, 4) + S(a2, '#ffffff', 1.2, 0.85) +
        drop(12, 30, 0.8, '#bff8ff') + drop(22, 20, 0.7, '#bff8ff') + drop(46, 20, 0.7, '#bff8ff') + drop(54, 30, 0.6, '#bff8ff') +
        orb(A, 8.5) + orb(B, 7.5) + orb(Cc, 6.5) +
        S('M4,60 C10,56 16,60 22,57 C28,54 34,60 40,57 C46,54 52,60 60,57', '#a0f0ff', 1.8, 0.55) +
        sparkle(52, 8, 3, '#ffffff') + sparkle(28, 40, 2.6, '#e8fff8'));
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
