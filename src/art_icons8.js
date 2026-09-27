/* art_icons8.js - more spell icons for Azeroth Solo (18 keys: two more class abilities for every class).
 * Loads AFTER art.js and art_icons2.js .. art_icons7.js (and art_mounts.js) and EXTENDS window.ART: ART.icon handles the
 * keys below and falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Gradient ids use the prefix i8<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i8' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  /* ---- batch 8 parts ---- */
  /* a comet: glowing head at (x,y) travelling in direction a (degrees), a tapering tail len long behind it */
  function comet(c, x, y, a, len, r, cols) {
    var d = D`M0,${-r} C${-len * 0.35},${-r * 0.95} ${-len * 0.75},${-r * 0.3} ${-len},0 C${-len * 0.75},${r * 0.3} ${-len * 0.35},${r * 0.95} 0,${r} A${r},${r} 0 0 0 0,${-r} Z`;
    return G(P(d, c.lg([[0, cols[1], 0.15], [0.55, cols[1], 0.85], [1, cols[0]]], 0, 0, 1, 0), 2) +
      S(D`M${-len * 0.8},0 C${-len * 0.5},${-r * 0.2} ${-len * 0.25},${-r * 0.35} 0,${-r * 0.45}`, '#ffffff', 1, 0.45) +
      glow(c, 0, 0, r * 1.9, cols[0], 0.8) +
      C(0, 0, r, c.rg([[0, '#ffffff'], [0.35, cols[0]], [0.8, cols[1]], [1, cols[2]]], 0.4, 0.4, 0.65), 2) +
      S(D`M${-r * 0.5},${-r * 0.1} C${-r * 0.3},${-r * 0.6} ${r * 0.35},${-r * 0.55} ${r * 0.4},0 C${r * 0.4},${r * 0.35} 0,${r * 0.45} ${-r * 0.15},${r * 0.2}`, cols[2], 1.4, 0.8),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(a) + ')');
  }
  /* an irregular boulder */
  function rock(c, x, y, s, col, rot) {
    return G(P('M-6,-3 L-2,-7 L5,-6 L7.5,-1 L4.5,5 L-3,6.5 L-7.5,2 Z', c.cel(col), 2 / s) + F('M-6,-3 L-2,-7 L5,-6 L1,-2.5 L-4,-1 Z', '#ffffff', 0.3) +
      S('M-1,1 L3,3 M-4,3 L-2,4.5', dk(col, 0.45), 1 / s), 'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(rot || 0) + ') scale(' + s + ')');
  }
  /* a big glossy drop with a gradient and a highlight */
  function gdrop(c, x, y, s, cols) {
    var d = D`M${x},${y - 7 * s} C${x - 4.4 * s},${y - 1 * s} ${x - 4.6 * s},${y + 4 * s} ${x},${y + 4.2 * s} C${x + 4.6 * s},${y + 4 * s} ${x + 4.4 * s},${y - 1 * s} ${x},${y - 7 * s} Z`;
    return P(d, c.lg([cols[0], cols[1], cols[2]], 0.2, 0, 0.8, 1), 1.8) + E(x - 1.6 * s, y + 0.2 * s, 1 * s, 1.8 * s, '#ffffff', 0, 0.75, 20);
  }
  /* a tapered tube along a quadratic curve, radius r0 at p0 -> r1 at p2 (outline first so seams vanish) */
  function tube(c, p0, p1, p2, r0, r1_, col, n) {
    var a = '', b = '', f = c.cel(col), i;
    for (i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t, x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1], r = r0 + (r1_ - r0) * t;
      a += C(x, y, r + 1.3, OL, 0); b += C(x, y, r, f, 0);
    }
    return a + b;
  }

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: an armoured warrior leaping in behind a big round shield, speed lines behind, dizzy stars at the impact */
    intercept: function (c) {
      var ar = '#8894a2', ard = dk(ar, 0.3);
      return iconWrap(c, ['#a8521e', '#160602'],
        glow(c, 42, 30, 30, '#ffd090', 0.75) +
        OS('M1,30 L15,26 M2,40 L14,37 M3,50 L15,50 M8,20 L18,17', '#fff0d0', 2.2) +
        OS('M22,41 L12,46 L2,45', ard, 6.4) + OS('M30,29 L20,24 L12,26', ard, 5) +
        P('M17,43 C16,34 22,26 31,23.5 C36,23 39,27 37.5,32 L30,45 C26,48 19,48 17,43 Z', c.cel(ar), 2.2) +
        S('M20,40 C21,33 25,28 31,26', '#ffffff', 1.2, 0.6) +
        OS('M23,43 L33,48 L27,58', ar, 6.4) +
        C(35.5, 19, 6, c.cel(ar), 2.2) + P('M30,19 C30,13 41,13 41,19 Z', c.cel('#a8321a'), 1.6) + S('M36,18 L41.5,19', OL, 1.6) +
        E(45, 32, 12, 16, c.lg(['#e8604a', '#a8261a', '#4a0a06'], 0.2, 0, 0.8, 1), 2.4, null, -12) +
        '<ellipse cx="45" cy="32" rx="9" ry="12.6" fill="none" stroke="' + GOLD + '" stroke-width="2.4" transform="rotate(-12 45 32)"/>' +
        S('M38,22 C40,19 44,17 47,17', '#ffffff', 1.4, 0.7) +
        C(45, 32, 4, c.cel(GOLD), 1.8) + C(44, 31, 1.2, '#ffffff', 0, 0.8) +
        rays(57, 32, 8, 3, 8, '#fffbe0', 1.8, 0.9, 0.2) + burst(c, 57, 32, 5.6, 2.4, 8, ['#ffb030', '#fff0a0', '#ffffff']) +
        dstar(54, 11, 4) + dstar(60, 49, 3.6) + dstar(46, 55, 3));
    },
    /* warrior: a snarling steel war-mask with burning red eyes over two crossed blood-red blades */
    recklessness: function (c) {
      var rb = c.lg(['#ffc0b0', '#e8201a', '#6a0004'], 0, 0, 1, 0);
      var blade = function () {
        return S('M0,-6 L0,-66', '#ff3a1a', 11, 0.35) + P('M-3.8,-5 L-3.8,-64 L0,-72 L3.8,-64 L3.8,-5 Z', rb, 2) + S('M0,-9 L0,-64', '#fff0e8', 1.3, 0.9) +
          P('M-2.4,-3 L2.4,-3 L2.4,9 L-2.4,9 Z', '#2a1a14', 2) + P('M-12,-9 L12,-9 L10,-3 L-10,-3 Z', c.cel(GOLD), 2) + C(0, 11.5, 3.2, c.cel(GOLD), 2);
      };
      var helm = 'M16,33 C16,17 23,10 32,10 C41,10 48,17 48,33 C48,45 45,53 40,58 L24,58 C19,53 16,45 16,33 Z';
      var slot = 'M19.5,26 L44.5,26 L43.5,33 L38.5,34.5 L38,55 L26,55 L25.5,34.5 L20.5,33 Z';
      return iconWrap(c, ['#9a0c0c', '#100202'],
        glow(c, 32, 32, 34, '#ff5a2a', 0.8) +
        G(blade(), 'translate(10,58) rotate(45)') + G(blade(), 'translate(54,58) rotate(-45)') +
        G(P(helm, c.lg(['#9aa4b0', '#4e5660', '#1e2228'], 0.2, 0, 0.8, 1), 2.4) +
        S('M20,30 C19,20 24,13 31,12', '#ffffff', 1.4, 0.5) +
        P('M29.5,10.4 L32,3 L34.5,10.4 L34,24 L30,24 Z', c.cel('#c8201a'), 1.6) +
        P(slot, '#1a0404', 2) +
        glow(c, 26, 30, 7, '#ff5a2a', 0.9) + glow(c, 38, 30, 7, '#ff5a2a', 0.9) +
        P('M20.5,27.2 L30,30 L29.4,32.4 L21.2,31 Z', '#ffe070', 1) + P('M43.5,27.2 L34,30 L34.6,32.4 L42.8,31 Z', '#ffe070', 1) +
        P('M17,23 L31,27.5 L31,25 L18,19.5 Z M47,23 L33,27.5 L33,25 L46,19.5 Z', c.cel('#6a727c'), 1.6) +
        F('M26.4,37 L37.6,37 L37.4,51 L26.6,51 Z', '#6a0808') +
        P('M26.4,37 L37.6,37 L37.6,40.5 L36.2,44 L34.6,40.5 L32,42 L29.4,40.5 L27.8,44 L26.4,40.5 Z', '#fffbe8', 1) +
        P('M26.6,51 L37.4,51 L37.4,48 L35.8,44.8 L34.4,48 L32,46.6 L29.6,48 L28.2,44.8 L26.6,48 Z', '#fffbe8', 1) +
        C(20, 42, 1.4, '#c8d0d8', 0.8) + C(44, 42, 1.4, '#c8d0d8', 0.8) + C(21.5, 49, 1.3, '#c8d0d8', 0.8) + C(42.5, 49, 1.3, '#c8d0d8', 0.8),
          'translate(32,30) scale(0.82) translate(-32,-30)') +
        C(5, 32, 1.4, '#ff8a3a', 0) + C(59, 32, 1.4, '#ff8a3a', 0) + C(32, 61, 1.2, '#ff8a3a', 0));
    },
    /* mage: a thick faceted dome of ice sealed over a caster, frost crystals round its base */
    ice_barrier: function (c) {
      var dome = 'M6,54 C6,28 17,11 32,11 C47,11 58,28 58,54 Z', inner = 'M13,54 C13,33 21,19 32,19 C43,19 51,33 51,54 Z';
      return iconWrap(c, ['#2a7ac8', '#020a1a'],
        glow(c, 32, 34, 34, '#bff0ff', 0.75) +
        E(32, 55, 29, 6.4, c.lg(['#e8fbff', '#6ab8e8', '#1a4a8a']), 2.2) +
        P(dome, c.lg(['#ffffff', '#9ae0ff', '#3a8ad8'], 0.1, 0, 0.9, 1), 2.6) +
        F(inner, c.rg([[0, '#d8f6ff'], [0.7, '#5ab0e8'], [1, '#2a70c0']], 0.45, 0.45, 0.7)) +
        G(bust(c, '#1a3a6a', 1.6), 'translate(32,38) scale(0.72)', 0.55) +
        F(inner, '#e8fbff', 0.25) +
        S(inner, '#ffffff', 1.4, 0.85) + S(inner, OL, 0.8, 0.35) +
        S('M32,11 L32,19 M13,40 L6.8,42 M51,40 L57.2,42 M19,24 L13,21 M45,24 L51,21 M24,15.4 L26,20.6 M40,15.4 L38,20.6', '#ffffff', 1.4, 0.8) +
        S('M10,36 C10,24 18,15 27,13', '#ffffff', 3, 0.7) + S('M14,48 C13,40 14,33 16,29', '#ffffff', 1.6, 0.6) +
        shard(c, 8, 52, -25, 0.42) + shard(c, 56, 52, 25, 0.42) + shard(c, 18, 57, -8, 0.3) + shard(c, 46, 57, 8, 0.3) + shard(c, 32, 59, 0, 0.26) +
        sparkle(46, 26, 3.6, '#ffffff') + sparkle(9, 10, 2.6, '#e8fbff') + sparkle(56, 8, 2.2, '#e8fbff'));
    },
    /* mage: a white-hot fire core with curling flame tongues flaring out of it like a spinning pinwheel */
    combustion: function (c) {
      var t = '', e = '', i;
      for (i = 0; i < 5; i++) {
        var a = i * 72 + 10, tf = 'translate(32,33) rotate(' + r1(a) + ')';
        t += G(P('M-9,-8 C-14,-20 -4,-30 16,-31 C6,-26 8,-16 7,-8 Z', c.lg(['#ffd040', '#ff6a14', '#b8200a'], 0, 1, 0, 0), 2.2), tf);
        e += G(F('M-4.6,-10 C-7,-18 -1,-24 9,-27 C3,-22 4.6,-15 4,-10 Z', '#ffe868', 0.9), tf);
      }
      return iconWrap(c, ['#b8260a', '#160100'],
        glow(c, 32, 33, 30, '#ff9a30', 0.7) +
        t + e +
        glow(c, 32, 33, 22, '#fff4c0', 0.95) +
        C(32, 33, 12.5, c.rg([[0, '#ffffff'], [0.4, '#fff4a0'], [0.75, '#ffb020'], [1, '#e04a10']]), 2.2) +
        S('M24,30 C25,25 31,22.4 36,24 M40,36 C39,41 33,43.6 28,42', '#fffbe0', 1.6, 0.9) +
        C(32, 33, 5, '#ffffff', 0) +
        C(7, 9, 1.5, '#ffe868', 0) + C(58, 58, 1.5, '#ffe868', 0) + C(58, 10, 1.2, '#ffd040', 0) + C(6, 56, 1.2, '#ffd040', 0));
    },
    /* priest: a blazing golden figure, arms flung up, surging forward with speed lines streaming off it */
    power_infusion: function (c) {
      var gd = c.lg(['#fffbe0', '#ffd040', '#c88a10'], 0.2, 0, 0.8, 1);
      var limbs = 'M29.5,25 L23,17 L20,7 M38.5,25 L45,17 L48,7 M31,39 L26.5,50 L23,60 M37,39 L41.5,50 L45,60';
      var fig = S(limbs, OL, 9.2) + S(limbs, '#ffd040', 6.4) + S(limbs, '#fffbe0', 2, 0.8) +
        P('M27.5,23 C29,21.5 39,21.5 40.5,23 L38.8,39 C38,42.4 30,42.4 29.2,39 Z', gd, 2.2) +
        C(34, 14.5, 6, gd, 2.2) + S('M30.5,12.5 C31,10.5 33,9.5 35,9.6', '#ffffff', 1.4, 0.9);
      return iconWrap(c, ['#6a3ab8', '#0a0418'],
        glow(c, 34, 32, 34, '#ffe890', 0.9) +
        OS('M1,14 L17,14 M2,24 L14,24 M1,34 L19,34 M3,44 L15,44 M1,54 L17,54', '#fff4b0', 2.2) +
        G(S(limbs, '#fff4b0', 17, 0.35) + S('M34,14 L34,40', '#fff4b0', 20, 0.35), 'translate(6,0) skewX(-10)') +
        G(fig, 'translate(6,0) skewX(-10)') +
        rays(38, 26, 12, 22, 29, '#fff4c0', 1.6, 0.5, 0.25) +
        sparkle(55, 38, 3.4, '#ffffff') + sparkle(57, 12, 2.6, '#fffbe0') + sparkle(48, 58, 2.4, '#fffbe0'));
    },
    /* priest: three silhouettes of a party standing together under a bright white blessing from above */
    prayer_of_fortitude: function (c) {
      var sil = c.lg(['#6a7a9a', '#2e3854', '#141a2c'], 0.2, 0, 0.8, 1);
      var rim = S('M-6.5,-10 C-4.5,-12.6 -1.5,-13.4 1,-13', '#ffffff', 1.6, 0.9) + S('M-13.5,17 C-12.5,11 -8,6.4 -3,5.2', '#ffffff', 1.4, 0.75);
      var man = function (tf) { return G(bust(c, sil, 2.2) + rim, tf); };
      return iconWrap(c, ['#8a96b0', '#080a14'],
        F('M16,0 L48,0 L62,64 L2,64 Z', c.lg([[0, '#ffffff', 0.9], [0.6, '#e8f0ff', 0.35], [1, '#e8f0ff', 0]])) +
        glow(c, 32, 4, 30, '#ffffff', 1) +
        rays(32, 2, 14, 6, 26, '#ffffff', 1.6, 0.55, 0.1) +
        man('translate(14,37) scale(0.8)') + man('translate(50,37) scale(0.8)') + man('translate(32,43)') +
        sparkle(32, 8, 5, '#ffffff') + sparkle(14, 12, 2.6, '#ffffff') + sparkle(51, 13, 2.6, '#ffffff'));
    },
    /* rogue: a frost-rimed dagger pointing down, an icy blue drop of blood falling from its tip */
    cold_blood: function (c) {
      var ice = c.lg(['#ffffff', '#bfe8ff', '#5a8ab8'], 0, 0, 1, 0);
      var dag = P('M-3.6,-4 L-3.6,-24 L0,-32 L3.6,-24 L3.6,-4 Z', ice, 2) + S('M0,-8 L0,-26', '#ffffff', 1.1, 0.8) +
        P('M-3.6,-10 L-6,-12 L-3.6,-14 Z M3.6,-16 L6,-18 L3.6,-20 Z M-3.6,-20 L-5.4,-22 L-3.6,-23.4 Z', '#e8fbff', 1) +
        P('M-2.3,-2 L2.3,-2 L2.3,8 L-2.3,8 Z', '#1a2a3a', 1.8) + P('M-8,-5.5 L8,-5.5 L8,-2 L-8,-2 Z', c.cel('#7a9ab8'), 1.8) + C(0, 9.6, 2.6, c.cel('#7a9ab8'), 1.6);
      var bc = ['#e8fbff', '#5ac8ff', '#1a4aa8'];
      return iconWrap(c, ['#1a4a8a', '#02060e'],
        glow(c, 30, 40, 30, '#9ae0ff', 0.7) +
        F('M0,56 C10,52 20,58 32,54 C44,50 54,56 64,52 L64,64 L0,64 Z', '#bfe8ff', 0.25) +
        G(dag, 'translate(48,11) rotate(220) scale(1.15)') +
        glow(c, 24, 50, 18, '#bff0ff', 0.95) +
        gdrop(c, 24, 51.5, 2, bc) +
        rays(44, 18, 6, 1, 4.6, '#ffffff', 1.3, 0.9) + rays(34, 30, 6, 1, 3.6, '#ffffff', 1.1, 0.9, 0.5) +
        sparkle(12, 18, 3.4, '#e8fbff') + sparkle(52, 44, 3, '#ffffff') + sparkle(10, 44, 2.2, '#e8fbff') + sparkle(56, 58, 2, '#e8fbff'));
    },
    /* rogue: a deep open gash pouring blood, a serrated blade beside it with its bloody tip dripping */
    hemorrhage: function (c) {
      var gash = lens(8, 12, 36, 46, 14, 2), core = lens(12.4, 17.6, 32, 41, 6.6, 2);
      var bl = 'M-3.4,0 C-4.4,-14 -3.4,-27 1.6,-41 C5,-30 6,-15 4.4,0 Z', teeth = '', i;
      for (i = 0; i < 6; i++) { var y = -4 - i * 5.6, x = -3.8 + i * 0.22 - (i > 3 ? (i - 3) * 0.6 : 0); teeth += D`M${x},${y} L${x - 3.2},${y - 1.6} L${x + 0.2},${y - 4.4} Z`; }
      var blade = P(teeth, c.lg(STEEL, 0, 0, 1, 0), 1.3) + P(bl, c.lg(STEEL, 0, 0, 1, 0), 2) + S('M1,-4 C1.5,-16 1.4,-28 1.4,-36', '#ffffff', 1, 0.7) +
        P('M-3.9,-22 C-3.3,-30 -1.4,-35.6 1.6,-41 C4.2,-34 5.4,-28 5.6,-22 C4.4,-19 3.4,-23 2.2,-19 C1,-23 -1,-18 -1.8,-22 C-2.6,-20 -3.4,-20 -3.9,-22 Z', '#c8141a', 1.4) +
        P('M-2.6,2 L2.6,2 L2.6,12 L-2.6,12 Z', LEATH, 1.8) + P('M-8,-1 L8,-1 L7,3 L-7,3 Z', c.cel('#8a8a94'), 1.8) + C(0, 13.6, 2.6, c.cel('#8a8a94'), 1.6);
      var st = 'M17,34 C16,40 17.4,44 16.6,50 M24,41 C24.6,46 23.8,49 24.2,53 M31,43.6 C31.8,47 31,49 31.4,52';
      return iconWrap(c, ['#8a1414', '#120202'],
        glow(c, 26, 30, 30, '#ff8a7a', 0.55) +
        E(25, 61, 17, 4.6, c.cel('#8a0a0e'), 2) +
        S(gash, '#ff6a5a', 6, 0.35) +
        P(gash, c.lg(['#ff9a8a', '#d8323a', '#7a0810'], 0.2, 0, 0.8, 1), 2.4) +
        S(core, '#ffb0a0', 2.4, 0.55) + P(core, c.lg(['#6a0008', '#2a0004', '#140002'], 0, 0, 1, 0), 1.4) +
        S('M14,14 C20,18 26,24 31,31', '#ffd0c8', 1.2, 0.7) +
        S(st, OL, 5.4) + S(st, '#c8141a', 3.2) +
        drop(16.6, 53, 1.2) + drop(24.2, 56, 1) + drop(31.4, 55, 1.1) +
        G(blade, 'translate(50,55) rotate(-16)') +
        drop(38, 28, 1.1) + drop(41, 38, 0.9) + drop(8, 44, 0.8) + drop(50, 12, 0.8) +
        sparkle(46, 10, 2.6, '#fff0e8'));
    },
    /* paladin: a hooded penitent kneeling with bowed head as a shaft of golden light falls on them */
    repentance: function (c) {
      var robe = c.lg(['#5a4a6a', '#2e2438', '#140e1a'], 0.2, 0, 0.8, 1);
      var body = 'M9,59 C9,48 13,39 20,32 C24,28 29,25.5 34,26 C38,26.5 40,29 40.4,32 C42,38 44,44 48,50 C50,53 52,56 54,59 Z';
      var hood = 'M31,28 C31,20 36,17 41,18 C46,19 48,24 47,29 C46.4,33 45,35 43,36 C41,33 37,31.5 33,31 Z';
      return iconWrap(c, ['#c89a3a', '#140a02'],
        F('M22,0 L48,0 L60,58 L12,58 Z', c.lg([[0, '#ffffff', 0.9], [0.6, '#fff0a0', 0.4], [1, '#fff0a0', 0.05]])) +
        glow(c, 35, 2, 28, '#fffbe0', 1) +
        S('M24,0 L16,40 M46,0 L54,40 M35,0 L35,12', '#fffbe0', 1.6, 0.6) +
        glow(c, 33, 38, 22, '#fff0a0', 0.75) +
        E(32, 59, 25, 4, c.rg([[0, '#fff0a0', 0.8], [1, '#c89a3a', 0]]), 0) +
        P(body, robe, 2.4) +
        S('M11,56 C11,46 15,38 22,31.6 C26,28.4 30,26.6 34,26.8', '#fff0a0', 1.8, 0.85) +
        P(hood, robe, 2.2) + F('M36,31.5 C39,31 42,33 43,35.6 C42,36.4 40,36.6 38.6,36 C37.4,34 36.6,33 36,31.5 Z', '#0a060e') +
        S('M32,28.6 C32.4,22 36,18.6 41,18.8', '#fff0a0', 1.8, 0.9) +
        OS('M36,33 C38,39 40,43 44,46', '#3a2e48', 5) +
        C(45, 46.6, 3, c.cel('#f0c8a0'), 1.6) +
        S('M24,40 C28,44 32,50 34,58', '#0a060e', 1.2, 0.6) +
        sparkle(20, 16, 3, '#ffffff') + sparkle(52, 22, 2.6, '#ffffff') + sparkle(42, 8, 2, '#fffbe0') + sparkle(14, 44, 2, '#fffbe0'));
    },
    /* paladin: a sword inside a golden halo slashing down, a holy trail behind it and a burst of light where it lands */
    crusader_strike: function (c) {
      var tr = c.lg([[0, '#fff0a0', 0.1], [1, '#ffffff', 0.95]], 0, 0, 1, 1);
      return iconWrap(c, ['#b0301a', '#160402'],
        glow(c, 38, 24, 32, '#ffe890', 0.8) +
        P(trailE(44, 20, 30, 30, 196, 128, 1, 8), tr, 1.4) +
        glow(c, 48, 16, 16, '#fff4c0', 0.95) +
        ring2(48, 16, 11.5, 11.5, '#ffd040', 3.2) + S('M39,10 C41.4,6.6 45,5 48.6,4.8', '#fffbe0', 1.2, 0.9) +
        wpn(c, 'sword', 44, 20, 225, 0.95) +
        rays(12, 52, 12, 4, 13, '#fffbe0', 1.8, 0.9, 0.2) +
        burst(c, 12, 52, 9, 4, 10, ['#ffb030', '#fff0a0', '#ffffff']) +
        sparkle(26, 58, 2.6, '#fffbe0') + sparkle(56, 44, 2.6, '#fffbe0') + sparkle(10, 10, 2.4, '#fff0c0'));
    },
    /* warlock: a violet blast erupting from a crater in the ground, shockwave rings rolling out across it */
    shadowfury: function (c) {
      var er = 'M19,46 L21,32 L25.5,40 L27,20 L31.5,36 L35,15 L37.5,37 L42,26 L44.4,40 L46,34 L46,46 Z';
      return iconWrap(c, ['#5a1a8a', '#06020c'],
        glow(c, 32, 34, 34, '#c070ff', 0.8) +
        E(32, 50, 36, 16, c.rg([[0, '#6a2a9a'], [0.7, '#2a0e40'], [1, '#12061c']]), 0) +
        S('M-4,42 C10,38 54,38 68,42', OL, 2, 0.6) +
        S('M4,56 L12,53 L16,55 M60,56 L52,53 L48,55.6 M18,62 L22,57 M46,62 L42,57 M2,48 L8,47', '#e0a0ff', 1.4, 0.8) +
        ring2(32, 47, 29, 10.4, '#b060f0', 2, 0.65) +
        ring2(32, 47, 21, 7.4, '#d890ff', 2.6, 0.9) +
        E(32, 47, 13, 4.6, c.rg([[0, '#ffffff'], [0.5, '#e0a0ff'], [1, '#6a1a9a']]), 2.2) +
        glow(c, 32, 36, 16, '#f0c0ff', 0.9) +
        P(er, c.lg(['#ffffff', '#e0a0ff', '#9a3ae0'], 0, 0, 0, 1), 2) +
        F('M26,45 L28.6,30 L31.6,40 L35,24 L37,40 L39,45 Z', '#ffffff', 0.6) +
        rock(c, 9, 26, 0.55, '#5a4a66', 20) + rock(c, 55, 22, 0.6, '#5a4a66', -30) + rock(c, 50, 34, 0.4, '#5a4a66', 60) + rock(c, 14, 36, 0.4, '#5a4a66', 10) +
        sparkle(22, 12, 2.6, '#f0c8ff') + sparkle(48, 10, 2.2, '#f0c8ff'));
    },
    /* warlock: three shadow bolts fanning out from one dark source, each trailing a violet tail */
    shadow_bolt_volley: function (c) {
      var cols = ['#f0c8ff', '#9a3ae0', '#2a0a4a'], src = [32, 58], o = '';
      [[12, 19, 5.8], [52, 19, 5.8], [32, 12, 6.6]].forEach(function (h) {
        var dx = h[0] - src[0], dy = h[1] - src[1], L = Math.sqrt(dx * dx + dy * dy);
        o += comet(c, h[0], h[1], Math.atan2(dy, dx) * 180 / Math.PI, L * 0.86, h[2], cols);
      });
      return iconWrap(c, ['#4a1a7a', '#06020c'],
        glow(c, 32, 36, 32, '#a050f0', 0.6) +
        glow(c, 32, 58, 18, '#e0a0ff', 0.9) +
        o +
        C(32, 58, 5, c.rg([[0, '#ffffff'], [0.6, '#e0a0ff'], [1, '#6a1a9a']]), 1.8) +
        sparkle(22, 32, 2.4, '#f0c8ff') + sparkle(43, 32, 2.4, '#f0c8ff') + sparkle(8, 54, 2.2, '#e0b0ff') + sparkle(56, 52, 2.2, '#e0b0ff'));
    },
    /* hunter: a strike (red arrow) stopped cold on an upright blade, then turned round into a riposte (gold U-turn arrow) */
    counterattack: function (c) {
      var ret = 'M42,30 C56,30 56,48 42,48 L16,48';
      return iconWrap(c, ['#6e6a2a', '#0a0a02'],
        glow(c, 38, 34, 32, '#fff0b0', 0.7) +
        OS(ret, '#ffd040', 6.4) + S('M42,31.6 C53,32.4 53.4,45 43,46.4 L17,46.4', '#fffbe0', 1.4, 0.8) +
        P('M4,48 L17,39 L17,57 Z', c.cel('#ffd040'), 2.2) +
        wpn(c, 'sword', 44.5, 57, -6, 0.9) +
        P('M2,17 L22,17 L22,11 L37,22 L22,33 L22,27 L2,27 Z', c.lg(['#ff8a6a', '#d8281a', '#7a0a06'], 0, 0, 0, 1), 2.2) +
        S('M4,18.6 L22.6,18.6', '#ffc8b8', 1.2, 0.8) +
        rays(39, 22, 9, 3, 9, '#fffbe0', 1.8, 0.95, 0.2) +
        burst(c, 39, 22, 6.4, 2.8, 8, ['#ffb030', '#fff0a0', '#ffffff']) +
        S('M6,36 L14,36 M8,58 L14,58', '#fff4d0', 1.8, 0.7) +
        sparkle(58, 12, 2.6, '#ffffff') + sparkle(58, 58, 2.4, '#fff4d0'));
    },
    /* hunter: a wyvern's leathery tail curling in to a barbed stinger dripping glowing green venom, a sleepy moon above */
    wyvern_sting: function (c) {
      var ven = ['#e8ffc0', '#6ae83a', '#1a7a14'];
      var barb = 'M0,-2 C4,3 11,7 12.5,12 L5.4,10.6 C4.4,17 2.4,22 0,30 C-2.4,22 -4.4,17 -5.4,10.6 L-12.5,12 C-11,7 -4,3 0,-2 Z';
      var sp = '', i;
      for (i = 0; i < 4; i++) { var t = 0.15 + i * 0.2, u = 1 - t, x = u * u * 68 + 2 * u * t * 44 + t * t * 30, y = u * u * 4 + 2 * u * t * 8 + t * t * 28; sp += D`M${x - 2.6},${y - 5.6} L${x + 1.6},${y - 11 + i * 1.2} L${x + 3.6},${y - 4.4} Z`; }
      return iconWrap(c, ['#5a2a6a', '#0a0410'],
        glow(c, 26, 42, 30, '#b8ff70', 0.55) +
        P('M17,5 C9,6 5,12 5,18 C5,25 11,30 18,29 C13,26 11,22 11,17 C11,12 13,8 17,5 Z', c.cel('#fff0b0'), 1.6) +
        sparkle(22, 12, 2.2, '#fffbe0') + sparkle(24, 22, 1.6, '#fffbe0') +
        P(sp, c.cel('#d8c0a0'), 1.3) +
        tube(c, [68, 4], [44, 8], [30, 28], 7.4, 3.6, '#7a4a3a', 22) +
        S('M58,4.6 C50,6 44,9 40,14', '#e8b89a', 1.4, 0.6) +
        G(P(barb, c.lg(['#fffbe8', '#c8b8a8', '#6a5a50'], 0, 0, 1, 1), 2) + S('M0,1 L0,26', '#ffffff', 1, 0.6) +
          F('M-4.6,13 C-3,17 -1.4,18 0,15 C1.4,18 3,17 4.6,13 C3.4,19 1.8,24 0,30 C-1.8,24 -3.4,19 -4.6,13 Z', ven[1], 0.95), 'translate(30,28) rotate(35) scale(0.86)') +
        glow(c, 15.6, 52, 13, '#c8ff70', 0.95) +
        gdrop(c, 15.4, 54, 1.25, ven) + gdrop(c, 24, 58, 0.6, ven) + gdrop(c, 7, 58, 0.5, ven) +
        C(40, 36, 1.4, '#c8ff70', 0) + C(8, 40, 1.2, '#c8ff70', 0));
    },
    /* druid: a bear in full charge seen from the side, head down, kicking up a trail of dust behind it */
    feral_charge: function (c) {
      var fur = '#6e4222', far = dk(fur, 0.3), mz = '#b08050';
      return iconWrap(c, ['#a8641e', '#140802'],
        glow(c, 36, 34, 32, '#ffd890', 0.7) +
        OS('M1,22 L13,22 M1,30 L9,30 M2,38 L8,38', '#fff0d0', 2) +
        cloud(c, [[5, 50, 6], [13, 55, 5.4], [4, 59, 5], [18, 60, 3.6], [9, 43, 3.4]], '#c8a070') +
        OS('M18,44 L12,52 L5,53', far, 6.6) + OS('M40,44 L47,52 L56,52', far, 6.2) +
        P('M9,42 C8,32 13,26 21,25 C25,20 33,17.4 40,20.4 C45,22.6 48,27 49,32 C50,40 46,48 38,49 L21,49 C13,49 9.4,47 9,42 Z', c.cel(fur), 2.4) +
        S('M12,33 C14,28 18,26 22,26 C26,21 33,19 39,21.6', '#d8a070', 1.6, 0.75) +
        S('M18,32 L21,34.4 M25,27 L27,29.6 M32,24 L33.4,27 M14,40 L17,41', dk(fur, 0.4), 1.2) +
        OS('M22,44 L17,55 L8,58', fur, 7) + OS('M39,43 L48,55 L58,56.6', fur, 7) +
        S('M7,56.4 L4.6,59 M10,57.6 L8.4,60.4 M57,54.6 L60.6,54 M57,58 L60.6,59', '#fffbe8', 1.2) +
        C(45, 23.6, 3.8, c.cel(fur), 1.8) + C(45, 23.6, 1.7, '#3a2010', 0) + C(52, 22, 3.6, c.cel(fur), 1.8) + C(52, 22, 1.6, '#3a2010', 0) +
        P('M40,32 C40,25 46,22 51,23 C55,24 58,27 59,31 L62,34 C63.4,36.6 62,40 59,40.6 L56,43 C51,46 44,44.4 41,39.6 C40,37.4 40,34.4 40,32 Z', c.cel(fur), 2.2) +
        E(58, 36.4, 4.4, 3.4, c.cel(mz), 1.4) + E(61.4, 34.8, 1.8, 1.4, '#1a0a04', 0) +
        P('M49.6,41.4 L59,40.6 L57,45.4 L52,46 Z', '#4a0808', 1.2) + P('M52.4,41.2 L53.4,44 L54.6,41 Z M56.4,40.8 L56.8,43.2 L57.8,40.7 Z', '#fffbe8', 0.8) +
        P('M46.4,28.4 L53.4,30 L53,31.6 L46.2,30.2 Z', OL, 0.8) + C(51, 31.4, 1.1, '#ff5a1a', 0) +
        sparkle(30, 10, 2.6, '#fff4d0') + sparkle(56, 12, 2.2, '#fff4d0'));
    },
    /* druid: a glowing green paw print inside a leafy wreath, shining over a group of three companions */
    gift_of_the_wild: function (c) {
      var cx = 32, cy = 25, rr = 17, lv = '', i;
      for (i = 0; i < 14; i++) {
        var a = i / 14 * 360, ra = a * Math.PI / 180, x = cx + Math.cos(ra) * rr, y = cy + Math.sin(ra) * rr;
        lv += leaf(c, x, y, r1(a + 180 + (i % 2 ? 22 : -22)), 0.46, i % 2 ? '#5ac83a' : '#3a9a2a');
      }
      var sil = c.lg(['#3a5a3a', '#1a2a1a', '#0a120a'], 0.2, 0, 0.8, 1);
      var rim = S('M-6.5,-10 C-4.5,-12.6 -1.5,-13.4 1,-13', '#c8ff90', 1.6, 0.9) + S('M-13.5,17 C-12.5,11 -8,6.4 -3,5.2', '#c8ff90', 1.4, 0.75);
      var pal = c.lg(['#f0ffd0', '#8aff5a', '#2a9a1a'], 0.2, 0, 0.8, 1);
      return iconWrap(c, ['#2a7a2a', '#020a02'],
        glow(c, cx, cy, 30, '#c8ff90', 0.85) +
        ring2(cx, cy, rr, rr, '#7a5a2a', 1.8) +
        lv +
        glow(c, cx, cy + 1, 13, '#f0ffd0', 0.9) +
        E(cx, cy + 4, 6.4, 5.4, pal, 2) +
        C(cx - 7.6, cy - 3.4, 2.9, pal, 1.8) + C(cx - 3, cy - 7.4, 2.9, pal, 1.8) + C(cx + 3, cy - 7.4, 2.9, pal, 1.8) + C(cx + 7.6, cy - 3.4, 2.9, pal, 1.8) +
        G(bust(c, sil, 2.2) + rim, 'translate(14,50) scale(0.62)') + G(bust(c, sil, 2.2) + rim, 'translate(50,50) scale(0.62)') +
        G(bust(c, sil, 2.2) + rim, 'translate(32,52) scale(0.72)') +
        sparkle(8, 8, 2.6, '#f0ffd0') + sparkle(56, 8, 2.6, '#f0ffd0'));
    },
    /* shaman: a figure guarded by a ring of floating boulders orbiting round it */
    earth_shield: function (c) {
      var cx = 32, cy = 42, rx = 27, ry = 9, back = '', front = '', i;
      for (i = 0; i < 7; i++) {
        var a = (i / 7 * 360 + 12) * Math.PI / 180, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, f = Math.sin(a) > 0;
        var r = glow(c, x, y, f ? 9 : 7, '#f0ffb0', 0.6) + rock(c, x, y, f ? 1.02 : 0.74, f ? '#c0a070' : '#9a8460', i * 47);
        if (f) front += r; else back += r;
      }
      return iconWrap(c, ['#5a6a1e', '#060802'],
        glow(c, 32, 32, 32, '#e8f0a0', 0.75) +
        earc(cx, cy, rx, ry, 180, 360, '#f0ffb0', 1.6, 0.7) +
        back +
        glow(c, 32, 28, 18, '#f0ffc0', 0.8) +
        G(bust(c, c.lg(['#8aa05a', '#4a5a2a', '#1e2610'], 0.2, 0, 0.8, 1), 2.4) +
          S('M-6.5,-10 C-4.5,-12.6 -1.5,-13.4 1,-13 M-13.5,17 C-12.5,11 -8,6.4 -3,5.2', '#f0ffc0', 1.4, 0.8), 'translate(32,33) scale(1.05)') +
        earc(cx, cy, rx, ry, 0, 180, '#f0ffb0', 1.8, 0.85) +
        front +
        sparkle(10, 12, 2.6, '#f0ffc0') + sparkle(54, 14, 2.6, '#f0ffc0'));
    },
    /* shaman: four elemental orbs (fire, water, earth, air) set round a golden ring, bright power at its centre */
    elemental_mastery: function (c) {
      var orb = function (x, y, cols) { return glow(c, x, y, 14, cols[0], 0.8) + C(x, y, 9.4, c.rg([[0, '#ffffff'], [0.35, cols[0]], [0.8, cols[1]], [1, cols[2]]], 0.38, 0.35, 0.7), 2.2); };
      var sw = 'M8,32 C8,28 13,26 15,29.6 C16.4,32.4 12.4,34 11.6,31.6 M9.6,36 C12,37.6 16,37 18,34.6';
      return iconWrap(c, ['#3a3a8a', '#04040e'],
        glow(c, 32, 32, 32, '#c8c8ff', 0.6) +
        ring2(32, 32, 19, 19, '#ffd040', 2.2) +
        rays(32, 32, 8, 3, 11, '#ffffff', 1.6, 0.8, 0.39) +
        glow(c, 32, 32, 10, '#ffffff', 1) + sparkle(32, 32, 6, '#ffffff') +
        orb(32, 13, ['#ffe070', '#ff6a14', '#8a1a04']) + flameC(32, 14.6, 0.3, FIRE) +
        orb(51, 32, ['#c8f0ff', '#3a8ae8', '#0a2a6a']) + gdrop(c, 51, 33, 0.9, ['#ffffff', '#8ad4ff', '#1a5ab8']) +
        orb(32, 51, ['#e8d0a0', '#8a6a3a', '#3a2410']) + rock(c, 32, 51, 0.72, '#6a8a3a', -10) +
        orb(13, 32, ['#ffffff', '#b8e8f0', '#4a8a9a']) + S(sw, OL, 3.4) + S(sw, '#ffffff', 1.6) +
        sparkle(8, 8, 2.6, '#e8e8ff') + sparkle(56, 56, 2.6, '#e8e8ff') + sparkle(56, 8, 2, '#e8e8ff') + sparkle(8, 56, 2, '#e8e8ff'));
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
