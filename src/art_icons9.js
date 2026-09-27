/* art_icons9.js - more spell icons for Azeroth Solo (18 keys: two more class abilities for every class).
 * Loads AFTER art.js and art_icons2.js .. art_icons8.js (and art_mounts.js) and EXTENDS window.ART: ART.icon handles the
 * keys below and falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Gradient ids use the prefix i9<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i9' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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


  /* ---- batch 9 parts ---- */
  /* a heater shield pointing down, origin at its centre, face colour + rim colour */
  var HEATER = 'M-16,-18 C-8,-21 8,-21 16,-18 L16,-2 C16,10 8,18 0,24 C-8,18 -16,10 -16,-2 Z';
  var HEATER_IN = 'M-12,-14.6 C-6,-16.8 6,-16.8 12,-14.6 L12,-2 C12,7.6 6,13.6 0,18.6 C-6,13.6 -12,7.6 -12,-2 Z';
  /* a five-point star falling along direction (dx,dy) with a tapering glowing tail */
  function fstar(c, x, y, r, len, dx, dy, col) {
    var L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
    var tx = x - ux * len, ty = y - uy * len;
    var tail = D`M${x + px * r * 0.8},${y + py * r * 0.8} L${tx},${ty} L${x - px * r * 0.8},${y - py * r * 0.8} Z`;
    return F(tail, c.lg([[0, col, 0], [1, lt(col, 0.5), 0.9]], ux < 0 ? 1 : 0, uy < 0 ? 1 : 0, ux < 0 ? 0 : 1, uy < 0 ? 0 : 1)) +
      S(D`M${x},${y} L${x - ux * len * 0.7},${y - uy * len * 0.7}`, '#ffffff', r * 0.35, 0.6) +
      glow(c, x, y, r * 2.2, col, 0.8) + P(star(x, y, 5, r, r * 0.45, 0.3), c.rg([[0, '#ffffff'], [0.5, lt(col, 0.6)], [1, col]]), 1.4);
  }

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a red heater shield driven edge-first into the ground, an impact ring and burst where its point lands */
    shield_slam: function (c) {
      var sh = G(P(HEATER, c.lg(STEEL, 0.1, 0, 0.9, 1), 2.4) + P(HEATER_IN, c.lg(['#e8604a', '#a8261a', '#4a0a06'], 0.2, 0, 0.8, 1), 1.6) +
        S('M-12,-6 L0,4 L12,-6', OL, 6) + S('M-12,-6 L0,4 L12,-6', GOLD, 3.4) + S('M-12,-6.6 L0,3.4 L12,-6.6', '#fff0a0', 0.9, 0.8) +
        C(0, -9, 3.4, c.cel(GOLD), 1.6) + S('M-14,-16 C-8,-19 2,-19.4 8,-19', '#ffffff', 1.4, 0.8), 'translate(35,26) rotate(35) scale(0.88)');
      return iconWrap(c, ['#a4501c', '#160602'],
        glow(c, 22, 47, 30, '#ffd090', 0.8) +
        OS('M44,3 C52,7 57,14 59,22 M58,30 C59,36 58,42 56,46', '#fff0d0', 2) +
        ring2(22, 51, 19, 6, '#fff0c0', 2.2, 0.9) + ring2(22, 51, 29, 9.2, '#ffd090', 1.8, 0.55) +
        F('M0,56 C10,53 34,53 64,56 L64,64 L0,64 Z', c.lg(['#6a3a1a', '#2a1206'])) +
        S('M22,54 L14,60 L10,64 M22,54 L30,61 M22,54 L20,62', OL, 1.8) +
        sh +
        rays(22, 47, 10, 5, 13, '#fffbe0', 2, 0.95, 0.2) + burst(c, 22, 47, 8, 3.4, 8, ['#ffb030', '#fff0a0', '#ffffff']) +
        rock(c, 6, 44, 0.45, '#8a6a4a', 20) + rock(c, 40, 46, 0.4, '#8a6a4a', -30) + rock(c, 10, 34, 0.32, '#8a6a4a', 60) +
        dstar(52, 40, 3.2) + dstar(6, 14, 2.6));
    },
    /* warrior: a battered, bloodied warrior planted on his greatsword, refusing to fall, a red-gold glow flaring behind him */
    last_stand: function (c) {
      var ar = '#7e8894', ard = dk(ar, 0.35);
      var legs = 'M27,42 L22,52 L18,61 M37,42 L42,52 L46,61';
      var arms = 'M20,27 L24,34 L29,37 M44,27 L40,34 L35,37';
      var bl = '#c8141a';
      return iconWrap(c, ['#b83014', '#140402'],
        glow(c, 32, 30, 34, '#ffc850', 0.9) +
        P(star(32, 30, 18, 31, 18, 0.05), c.rg([[0, '#fff0a0'], [0.5, '#ff9a2a', 0.8], [1, '#c8200a', 0.2]]), 0) +
        rays(32, 30, 18, 20, 31, '#fff4c0', 1.4, 0.55, 0.14) +
        S('M20,26 L44,26 L42,42 L22,42 Z', '#ffe080', 9, 0.3) +
        F('M0,58 C12,56 52,56 64,58 L64,64 L0,64 Z', c.lg(['#5a2a14', '#1a0804'])) +
        S(legs, OL, 9) + S(legs, ard, 6.4) + S('M22,52 L18,61 M42,52 L46,61', '#3a2a1e', 6.4) +
        P('M21,24 C25,22 39,22 43,24 L41,43 C36,45 28,45 23,43 Z', c.cel(ar), 2.2) +
        P('M26,32 L38,32 L37,46 L32,50 L27,46 Z', c.cel('#a8201a'), 1.8) + S('M32,33 L32,48', GOLD, 1.6) +
        S(arms, OL, 8.4) + S(arms, ar, 5.8) +
        C(19, 25, 6.2, c.cel(ar), 2.2) + C(45, 25, 6.2, c.cel(ar), 2.2) +
        G(greatsword(c), 'translate(32,40) rotate(180) scale(0.52)') +
        C(32, 37, 3.6, c.cel('#e0a878'), 1.6) +
        P('M24.5,17 C24.5,9 28,6 32,6 C36,6 39.5,9 39.5,17 L39,22 L25,22 Z', c.cel(ar), 2.2) +
        P('M26.5,14 L37.5,14 L37,17 L27,17 Z', '#1a0a06', 1.2) + P('M31,11 L33,11 L33,21 L31,21 Z', ard, 1) +
        E(28.6, 15.6, 1.4, 0.8, '#ffe070', 0) + E(35.4, 15.6, 1.4, 0.8, '#ffe070', 0) +
        
        S('M36,24 L30,31 M40,28 L37,32 M24,29 L27,35', bl, 2) + S('M22,20 L26,22', bl, 1.6) +
        drop(34, 30, 0.8, bl) + drop(25, 50, 0.8, bl) + drop(44, 44, 0.7, bl) + drop(21, 36, 0.7, bl) +
        C(33, 57, 2.4, bl, 0) + E(38, 58, 3, 1, bl, 0) +
        sparkle(9, 12, 2.8, '#fff4c0') + sparkle(56, 14, 2.6, '#fff4c0'));
    },
    /* mage: a glowing violet spellbook open in the air, a bright arcane star above it and its light pouring down on a crowd */
    arcane_brilliance: function (c) {
      var sil = c.lg(['#7a4aa8', '#3a1a5a', '#1a0a2a'], 0.2, 0, 0.8, 1);
      var head = function (x, y, s) { return G(bust(c, sil, 2.2) + S('M-6.5,-10 C-4.5,-12.6 -1.5,-13.4 1,-13', '#f0c8ff', 1.6, 0.9), 'translate(' + x + ',' + y + ') scale(' + s + ')'); };
      var lp = 'M32,40 C25,36 17,36 9,39 L11,23 C19,20 26,21 32,25 Z';
      return iconWrap(c, ['#8a3ac8', '#0e0218'],
        F('M14,38 L50,38 L64,64 L0,64 Z', c.lg([[0, '#f0c8ff', 0.75], [1, '#c890ff', 0]])) +
        glow(c, 32, 26, 30, '#e8b0ff', 0.9) +
        head(9, 55, 0.7) + head(55, 55, 0.7) + head(20, 58, 0.78) + head(44, 58, 0.78) + head(32, 60, 0.86) +
        P('M32,43 C24,39 15,39 6,42 L8,24 L32,28 L56,24 L58,42 C49,39 40,39 32,43 Z', c.cel('#4a1a7a'), 2.2) +
        P(lp, c.lg(['#ffffff', '#f0dcff', '#c8a0f0'], 0, 0, 1, 1), 2) + G(P(lp, c.lg(['#ffffff', '#f0dcff', '#c8a0f0'], 1, 0, 0, 1), 2), 'translate(64,0) scale(-1,1)') +
        S('M14,27 C19,25 24,26 28,28 M14,31 C19,29 24,30 28,32 M36,28 C40,26 45,25 50,27 M36,32 C40,30 45,29 50,31', '#9a6ac8', 1.2, 0.8) +
        S('M32,25 L32,40', OL, 1.4) +
        glow(c, 32, 13, 16, '#ffffff', 0.95) +
        rays(32, 13, 8, 6, 13, '#ffffff', 1.6, 0.8, 0.39) +
        P(star(32, 13, 4, 11, 3.2), c.rg([[0, '#ffffff'], [0.6, '#f4d8ff'], [1, '#c060ff']]), 1.8) +
        sparkle(12, 12, 2.8, '#ffe8ff') + sparkle(53, 10, 2.6, '#ffe8ff') + sparkle(47, 20, 2, '#ffffff') + sparkle(17, 20, 2, '#ffffff'));
    },
    /* mage: a horned dragon head in profile, jaws wide, roaring a widening cone of fire across the icon */
    dragons_breath: function (c) {
      var sc = '#8a1a1e', hn = c.lg(['#fffbe8', '#e8d8b0', '#8a7a5a'], 0, 0, 1, 1);
      var cone = 'M27,34 C38,24 50,14 64,6 L64,62 C50,56 38,48 27,40 Z';
      var fl = '', i, pts = [[62, 8, 0.36, 62], [63, 20, 0.34, 80], [63, 34, 0.38, 90], [63, 48, 0.34, 100], [62, 60, 0.36, 118]];
      for (i = 0; i < pts.length; i++) fl += G(flameC(0, 0, pts[i][2], FIRE), 'translate(' + pts[i][0] + ',' + pts[i][1] + ') rotate(' + pts[i][3] + ') translate(0,-6)');
      return iconWrap(c, ['#c8440c', '#180400'],
        glow(c, 44, 36, 32, '#ffc040', 0.8) +
        P(cone, c.lg([[0, '#ffffff'], [0.2, '#ffe868'], [0.6, '#ff9a1f'], [1, '#e03c14']], 0, 0, 1, 0), 2.2) + fl +
        F('M29,36 C40,30 50,26 62,22 L62,48 C50,44 40,42 29,38 Z', '#fff8c0', 0.6) +
        S('M36,33 C44,30 50,28 58,26 M38,39 C46,41 52,43 58,46', '#ffffff', 1.4, 0.7) +
        P('M0,34 C4,40 8,46 8,64 L0,64 Z', c.cel(dk(sc, 0.2)), 2) +
        P('M10,19 C4,12 0,10 -4,10 C1,14 3,18 5,24 Z', hn, 1.8) + P('M16,16 C12,8 8,4 3,3 C7,8 9,13 10,19 Z', hn, 1.8) +
        P('M6,44 C12,40 20,38 27,39 L35,44 L32,47 C24,48 14,50 8,55 C4,52 3,48 6,44 Z', c.cel(dk(sc, 0.1)), 2.2) +
        P('M-2,32 C0,22 8,15 17,15 C22,15 26,18 36,23 L38,28 L30,30 L20,32 C12,33 6,36 2,42 Z', c.cel(sc), 2.4) +
        P('M22,30 L24,34.5 L26,29.6 Z M27,29.4 L29,34 L31,29 Z M32,28.8 L33.8,32.6 L35.6,28.4 Z', '#fffbe8', 1) +
        P('M22,41.6 L24,37.4 L26,41 Z M27,41.8 L29,38 L31,42.4 Z', '#fffbe8', 1) +
        S('M6,24 C12,19 20,18 28,21', '#e05a5a', 1.4, 0.7) + S('M8,30 L12,28 M4,36 L8,34 M12,48 L16,46', dk(sc, 0.5), 1.2) +
        P('M13,18 L24,20 L22,23 Z', '#3a0808', 1.2) +
        E(19, 22.4, 2.6, 1.8, '#ffe23a', 1.2) + E(19.4, 22.4, 0.6, 1.6, '#1a0a04', 0) +
        C(35, 24.6, 1, '#1a0a04', 0) +
        C(54, 10, 1.4, '#ffe868', 0) + C(46, 58, 1.3, '#ffe868', 0) + C(8, 8, 1.2, '#ffd040', 0));
    },
    /* priest: a shadowy hooded form wrapping its dark arms round a red heart, life streaming up out of it into the shadow */
    vampiric_embrace: function (c) {
      var ht = 'M32,56 C20,49 14,42 15,34 C16,28 24,26 32,32 C40,26 48,28 49,34 C50,42 44,49 32,56 Z';
      var armL = 'M22,24 C10,26 4,38 7,49 C10,58 22,62 31,58 C24,57 17,53 15,46 C13,38 17,31 25,29 Z';
      var streams = 'M28,36 C24,31 30,27 28,21 M36,36 C40,31 34,27 36,21 M32,34 C32,29 33,26 32,21';
      return iconWrap(c, ['#5a1a7a', '#080210'],
        glow(c, 32, 40, 30, '#ff4a6a', 0.6) + glow(c, 32, 16, 20, '#c080ff', 0.6) +
        S('M3,20 C8,26 10,30 14,33 M61,20 C56,26 54,30 50,33 M4,62 C10,58 14,56 18,52 M60,62 C54,58 50,56 46,52', '#e0202a', 2, 0.55) +
        drop(6, 26, 0.7, '#e0202a') + drop(58, 26, 0.7, '#e0202a') +
        P('M32,4 C23,4 18,10 18,18 C18,23 20,26 22,28 L42,28 C44,26 46,23 46,18 C46,10 41,4 32,4 Z', c.lg(['#4a2a6a', '#1e0c30', '#0a0414'], 0.2, 0, 0.8, 1), 2.2) +
        E(32, 17, 7.4, 7.6, '#040108', 1.2) +
        glow(c, 28.6, 16.4, 4, '#ff8aff', 0.9) + glow(c, 35.4, 16.4, 4, '#ff8aff', 0.9) +
        E(28.6, 16.4, 1.8, 1, '#ffe0ff', 0) + E(35.4, 16.4, 1.8, 1, '#ffe0ff', 0) +
        S(streams, OL, 4.6) + S(streams, '#e8202a', 2.6) + S(streams, '#ffa0a0', 0.8, 0.8) +
        glow(c, 32, 42, 18, '#ff3a4a', 0.85) +
        P(ht, c.lg(['#ff7a7a', '#d0141a', '#6a0008'], 0.2, 0, 0.8, 1), 2.4) +
        S('M20,35 C21,31 25,30 28,32', '#ffffff', 1.6, 0.7) +
        P(armL, c.lg(['#5a2a7a', '#2a0c3e', '#0e0418'], 0, 0, 1, 1), 2.2) +
        G(P(armL, c.lg(['#5a2a7a', '#2a0c3e', '#0e0418'], 1, 0, 0, 1), 2.2), 'translate(64,0) scale(-1,1)') +
        
        S('M11,36 C9,42 11,50 17,54 M53,36 C55,42 53,50 47,54', '#b070ff', 1.2, 0.6) +
        P('M29,57 L33,53.4 L32,56 L35,55.6 Z M35,57 L31,53.4 L32,56 L29,55.6 Z', '#2a0c3e', 1) +
        sparkle(56, 8, 2.4, '#f0c8ff') + sparkle(8, 8, 2.2, '#f0c8ff'));
    },
    /* priest: an open hand raised in a golden ward, holding back a dark crashing wave that breaks against its light */
    pain_suppression: function (c) {
      var sk = '#f6dcc0';
      var fg = 'M19,35 L17,19 M24,33 L24,14 M29,33 L30,16 M34,36 L37,23 M16,45 L8,37';
      var palm = 'M15,62 L14,45 C13,39 15,34 19,33 L32,33 C36,34 38,38 37,45 L36,62 Z';
      var wave = 'M64,0 L64,64 L52,64 C46,56 44,46 46,38 C48,30 46,22 40,18 C36,16 33,18 35,21 C31,20 30,12 36,8 C44,2 54,1 64,0 Z';
      return iconWrap(c, ['#c8a040', '#140c02'],
        glow(c, 22, 40, 32, '#fff4c0', 0.95) + glow(c, 42, 30, 24, '#fffbe0', 0.9) +
        P(wave, c.lg(['#6a3a8a', '#2e1044', '#0c0416'], 1, 0, 0, 1), 2.6) +
        S('M40,18 C36,16 33,18 35,21 C31,20 30,12 36,8 C44,2 54,1 62,1', '#f0e0ff', 2.2, 0.85) + S('M46,24 C48,30 46,38 46,46', '#d0b0f0', 1.6, 0.8) +
        S('M62,12 C56,12 52,16 54,22 M60,34 C56,40 56,50 60,58', '#b080e0', 1.4, 0.7) +
        arc(21, 44, 20, -85, 75, '#fff0a0', 3.2) + S(D`M${21 + Math.cos(-1.2) * 20},${44 + Math.sin(-1.2) * 20} A20,20 0 0 1 ${21 + Math.cos(1.1) * 20},${44 + Math.sin(1.1) * 20}`, '#ffffff', 1.2, 0.9) +
        rays(41, 40, 7, 2, 7, '#ffffff', 1.4, 0.9, 0.5) + rays(39, 55, 7, 2, 6, '#ffffff', 1.4, 0.9, 0.1) +
        C(33, 26, 1.6, '#f0e0ff', 0) + C(44, 48, 1.4, '#f0e0ff', 0) + C(40, 30, 1.4, '#f0e0ff', 0) +
        G(S(fg, OL, 8) + P(palm, c.cel(sk), 2.4) + S(fg, sk, 5.4) + S(fg, '#ffffff', 1.4, 0.4) +
        S('M20,45 C23,48 29,48 33,44', dk(sk, 0.3), 1.2, 0.7) +
        glow(c, 26, 44, 12, '#fff0a0', 0.9), 'translate(0,10) scale(0.8)') +
        sparkle(8, 10, 3, '#ffffff') + sparkle(10, 56, 2.4, '#fffbe0') + sparkle(28, 6, 2.2, '#fffbe0'));
    },
    /* rogue: a ring of throwing knives flung outward from one point, spin trails whirling between them */
    fan_of_knives: function (c) {
      var k = '', i, tr = '';
      for (i = 0; i < 8; i++) {
        var a = i * 45 - 90 + 22.5, ar = a * Math.PI / 180;
        k += G(WP.dagger(c), 'translate(' + r1(32 + Math.cos(ar) * 14) + ',' + r1(32 + Math.sin(ar) * 14) + ') rotate(' + r1(a + 90) + ') scale(0.62)');
        tr += D`M${32 + Math.cos(ar - 0.62) * 25},${32 + Math.sin(ar - 0.62) * 25} A25,25 0 0 1 ${32 + Math.cos(ar - 0.12) * 25},${32 + Math.sin(ar - 0.12) * 25}`;
      }
      return iconWrap(c, ['#6a7a4a', '#060a02'],
        glow(c, 32, 32, 32, '#f0ffd0', 0.7) +
        S(tr, '#ffffff', 2.4, 0.45) + S(tr, '#ffffff', 1, 0.8) +
        k +
        burst(c, 32, 32, 7, 3, 8, ['#c8d0d8', '#ffffff', '#ffffff']) +
        sparkle(32, 32, 3, '#ffffff'));
    },
    /* rogue: an empty hooded cloak thrown open, a vortex of violet shadow whirling round it and spells glancing off */
    cloak_of_shadows: function (c) {
      var ck = 'M32,9 C25,9 21,15 21,22 C15,31 9,44 6,58 C12,55 17,59 22,55 C26,59 30,58 32,55 C34,58 38,59 42,55 C47,59 52,55 58,58 C55,44 49,31 43,22 C43,15 39,9 32,9 Z';
      var lin = 'M32,24 C27,30 24,42 22,54 C26,57 30,56 32,53 C34,56 38,57 42,54 C40,42 37,30 32,24 Z';
      var sw = c.lg([[0, '#c890ff', 0.1], [1, '#f0d8ff', 0.95]], 0, 0, 1, 0);
      var tf = 'translate(32,38) rotate(-14)';
      return iconWrap(c, ['#4a1a6a', '#050208'],
        glow(c, 32, 34, 32, '#b070ff', 0.8) +
        G(P(trailE(0, 0, 28, 11, 190, 350, 1, 6), sw, 1.6), tf) +
        P(ck, c.lg(['#3a3444', '#1a1622', '#08060c'], 0.2, 0, 0.8, 1), 2.4) +
        P(lin, c.lg(['#8a3ac8', '#4a1a7a', '#1e0830'], 0, 0, 0, 1), 1.8) +
        S('M16,40 C14,46 12,52 11,57 M48,40 C50,46 52,52 53,57', '#5a5068', 1.4, 0.8) +
        E(32, 20, 6.4, 7, '#020104', 1.2) + S('M24,18 C25,12 29,10 33,10', '#8a80a0', 1.4, 0.8) +
        G(P(trailE(0, 0, 28, 11, -10, 170, 6, 1), sw, 1.6), tf) +
        C(8, 16, 3.2, c.rg([[0, '#ffffff'], [0.5, '#ff9a3a'], [1, '#c83a0a']]), 1.4) + S('M11,18 L16,22 M11,14 L16,10', '#ffd090', 1.4, 0.9) +
        C(56, 14, 3, c.rg([[0, '#ffffff'], [0.5, '#8ad4ff'], [1, '#2a6ac8']]), 1.4) + S('M53,16 L48,20 M53,12 L48,8', '#c8f0ff', 1.4, 0.9) +
        C(57, 50, 2.6, c.rg([[0, '#ffffff'], [0.5, '#a8f03a'], [1, '#2a9a14']]), 1.4) +
        sparkle(32, 3.6, 2.2, '#f0d8ff') + sparkle(8, 42, 2.4, '#f0d8ff'));
    },
    /* paladin: a silver heater shield with a blazing gold cross, sharp spikes of holy light bursting out all round it */
    holy_shield: function (c) {
      var spikes = star(32, 33, 12, 31, 13, 0.13), sp2 = star(32, 33, 12, 24, 12, 0.39);
      var cross = 'M-3,-13 L3,-13 L3,-5 L9,-5 L9,1 L3,1 L3,13 L-3,13 L-3,1 L-9,1 L-9,-5 L-3,-5 Z';
      return iconWrap(c, ['#d89a2a', '#1a0e02'],
        glow(c, 32, 33, 34, '#fff4c0', 0.95) +
        P(spikes, c.rg([[0, '#ffffff'], [0.45, '#fff0a0'], [1, '#e8a830']]), 1.8) +
        F(sp2, '#ffffff', 0.7) +
        G(P(HEATER, c.lg(['#fff6c8', '#e8b440', '#8a5a10'], 0.1, 0, 0.9, 1), 2.4) +
          P(HEATER_IN, c.lg(['#ffffff', '#dfe6ee', '#9aa6b4'], 0.2, 0, 0.8, 1), 1.6) +
          glow(c, 0, -2, 12, '#fff0a0', 0.95) +
          P(cross, c.lg(['#fff6b0', '#f0c040', '#a86a10'], 0.2, 0, 0.8, 1), 1.6) +
          S('M-14,-16 C-8,-19 2,-19.4 8,-19', '#ffffff', 1.4, 0.9), 'translate(32,33) scale(0.95)') +
        sparkle(9, 9, 3, '#ffffff') + sparkle(55, 56, 3, '#ffffff') + sparkle(55, 9, 2.4, '#ffffff'));
    },
    /* paladin: a great golden hammer smashing straight down, a ring of holy light rippling out from the blow */
    hammer_righteous: function (c) {
      var gd = c.lg(['#fff6b0', '#f0c040', '#a86a10'], 0.2, 0, 0.8, 1), gd2 = c.lg(['#e8b440', '#a86a10', '#6a3a08'], 0.2, 0, 0.8, 1);
      var hm = P('M-2.8,-4 L-2.8,-44 L2.8,-44 L2.8,-4 Z', c.cel(WOOD), 2) + S('M-2.8,-34 L2.8,-32 M-2.8,-29 L2.8,-27 M-2.8,-24 L2.8,-22', LEATH, 1.6) +
        C(0, -45, 3.4, gd, 1.8) +
        P('M-13,-2 L13,-2 L13,18 L-13,18 Z', gd, 2.4) +
        P('M-13,-5 L-19,-2 L-21,2 L-21,14 L-19,18 L-13,21 Z M13,-5 L19,-2 L21,2 L21,14 L19,18 L13,21 Z', gd2, 2.2) +
        S('M-19,0 L-19,16 M19,0 L19,16', '#fff0a0', 1.2, 0.7) +
        P('M-5,-7 L5,-7 L6,-2 L-6,-2 Z', gd2, 1.6) +
        S('M-11,1 L11,1', '#ffffff', 1.4, 0.85) +
        C(0, 8, 4.6, c.rg([[0, '#ffffff'], [0.6, '#fff4b0'], [1, '#f0a020']]), 1.6) + rays(0, 8, 8, 5.6, 8.4, '#fffbe8', 1, 0.8);
      return iconWrap(c, ['#c8761a', '#160802'],
        glow(c, 32, 50, 32, '#fff0a0', 0.9) +
        F('M0,54 C16,51 48,51 64,54 L64,64 L0,64 Z', c.lg(['#8a5a2a', '#2a1206'])) +
        ring2(30, 56, 29, 7.6, '#ffe070', 2.2, 0.7) + ring2(30, 56, 19, 5, '#fff4b0', 2.6) +
        rays(30, 54, 14, 14, 30, '#fffbe0', 1.8, 0.55, 0.1) +
        OS('M8,14 C6,22 7,30 10,36 M54,12 C58,20 58,28 55,34', '#fff4c0', 1.8, 0.8) +
        G(hm, 'translate(31,35) rotate(-14)') +
        burst(c, 28, 55, 8, 3.4, 10, ['#ffd040', '#fff4b0', '#ffffff']) +
        sparkle(9, 50, 2.6, '#ffffff') + sparkle(56, 46, 2.6, '#ffffff') + sparkle(48, 8, 2.2, '#fffbe0'));
    },
    /* warlock: a white-hot searing beam of fire lancing down from a blazing orb, setting its target alight */
    incinerate: function (c) {
      var bm = 'M10,10 C22,20 32,30 50,50';
      var lick = '', i;
      for (i = 1; i < 5; i++) {
        var t = i / 5, x = 10 + 40 * t, y = 10 + 40 * t;
        lick += G(flameC(0, 0, 0.26, FIRE), 'translate(' + r1(x - 5) + ',' + r1(y + 5) + ') rotate(-135) translate(0,-4)') +
          G(flameC(0, 0, 0.24, FIRE), 'translate(' + r1(x + 5) + ',' + r1(y - 5) + ') rotate(45) translate(0,-4)');
      }
      return iconWrap(c, ['#c8500c', '#1a0400'],
        glow(c, 32, 32, 34, '#ffb040', 0.8) +
        S('M2,24 C10,30 16,36 22,44 M24,2 C30,10 36,16 44,22', '#ffe070', 1.2, 0.5) +
        lick +
        S(bm, '#ff6a14', 17, 0.35) + S(bm, OL, 13) + S(bm, '#ff6a14', 10.4) + S(bm, '#ffd040', 6.6) + S(bm, '#ffffff', 3) +
        glow(c, 50, 50, 16, '#fff4a0', 0.95) +
        burst(c, 50, 50, 12, 5, 10, ['#ff6a14', '#ffd040', '#ffffff']) +
        flameC(54, 44, 0.42, FIRE) + flameC(44, 56, 0.34, FIRE) +
        glow(c, 10, 10, 12, '#ffffff', 0.95) + C(10, 10, 5.4, c.rg([[0, '#ffffff'], [0.5, '#ffe868'], [1, '#ff6a14']]), 1.8) +
        C(58, 28, 1.4, '#ffe868', 0) + C(28, 58, 1.4, '#ffe868', 0) + C(60, 60, 1.2, '#ffd040', 0) + C(40, 8, 1.2, '#ffd040', 0));
    },
    /* warlock: a horned demon silhouette crumbling into motes that stream into a glowing purple orb */
    demonic_sacrifice: function (c) {
      var hn = 'M-6,-11 C-11,-15 -14,-21 -12,-28 C-9,-22 -6,-19 -2,-17 Z';
      var dm = c.lg([[0, '#5a2a62', 1], [0.55, '#3e1848', 1], [1, '#3e1848', 0.1]], 0, 0, 1, 0.3);
      var demon = G(P(hn, dm, 1.8) + P('M6,-11 C11,-15 14,-21 12,-28 C9,-22 6,-19 2,-17 Z', dm, 1.8) + bust(c, dm, 2.2) +
        P('M-15,24 C-18,16 -22,10 -24,4 C-19,8 -16,10 -12,10 Z', dm, 1.8) +
        E(-3.2, -5, 1.8, 1.1, '#b8ff5a', 0) + E(3.2, -5, 1.8, 1.1, '#b8ff5a', 0), 'translate(20,26) scale(1.25)') + S('M8,52 C8,42 12,36 17,34 M14,16 C15,11 19,9 23,10', '#e0a0ff', 1.6, 0.8);
      var mote = [[30, 20, 2.4], [34, 27, 2], [30, 33, 2.6], [38, 22, 1.6], [37, 34, 1.8], [42, 30, 1.6], [28, 42, 2], [34, 40, 1.4], [26, 28, 1.8]];
      var m = '';
      mote.forEach(function (p, i) { m += P(D`M${p[0]},${p[1] - p[2]} L${p[0] + p[2]},${p[1]} L${p[0]},${p[1] + p[2]} L${p[0] - p[2]},${p[1]} Z`, i % 2 ? '#d890ff' : '#8a4ac8', 1); });
      var strm = 'M26,22 C36,20 42,26 44,36 M22,36 C30,36 36,40 40,44';
      return iconWrap(c, ['#6a1a8a', '#08020e'],
        glow(c, 46, 46, 26, '#e090ff', 0.9) + glow(c, 20, 26, 20, '#8a3ac8', 0.5) +
        S(strm, '#c070ff', 6, 0.35) + S(strm, '#f0c8ff', 1.4, 0.8) +
        demon + S('M4,22 C6,17 10,14 14,13', '#c080ff', 1.4, 0.7) +
        m +
        rays(46, 46, 12, 12, 17, '#f0d8ff', 1.4, 0.6, 0.2) +
        C(46, 46, 10.5, c.rg([[0, '#ffffff'], [0.3, '#f0c0ff'], [0.75, '#a040e0'], [1, '#5a0a8a']], 0.4, 0.38, 0.7), 2.2) +
        S('M40,42 C41,38 44,36 48,36', '#ffffff', 1.6, 0.8) +
        sparkle(56, 30, 2.6, '#ffffff') + sparkle(34, 58, 2.4, '#f0d8ff') + sparkle(8, 56, 2.2, '#f0c8ff'));
    },
    /* hunter: a snarling grey wolf's head in profile under a blazing golden command arrow pointing it at the prey */
    kill_command: function (c) {
      var fur = '#8a8e98';
      var head = 'M4,64 C2,52 6,40 12,32 L12,16 L20,25 L25,23 L29,12 L33,25 C38,27 44,30 50,33 L58,36 C61,38 60,42 57,43 L47,45 C43,49 37,52 31,52 C25,56 20,60 17,64 Z';
      var arw = 'M34,9 L46,9 L46,3 L60,14 L46,25 L46,19 L34,19 Z';
      return iconWrap(c, ['#8a6a2a', '#120a02'],
        glow(c, 46, 14, 20, '#ffe070', 0.9) + glow(c, 30, 40, 28, '#ffd8a0', 0.45) +
        P(head, c.cel(fur), 2.4) +
        F('M14,20 L19,26 L15,30 Z M29,16 L31,25 L27,24 Z', '#e8a8a8', 0.8) +
        S('M10,48 C12,42 16,38 22,36 M8,58 C12,52 18,48 26,48', dk(fur, 0.35), 1.4, 0.8) +
        S('M30,30 C38,30 46,33 56,37', '#ffffff', 1.3, 0.55) +
        P('M47,44.4 C42,43 37,43 33,45 C36,48 42,48.6 47,47 Z', '#4a0808', 1.4) +
        P('M49,43.4 L50,47 L51.4,43 Z M44,44 L45,47.6 L46.4,44 Z M39,44.4 L40,47.2 L41.2,44.6 Z', '#fffbe8', 0.8) +
        E(58.2, 37.4, 2.2, 1.8, '#140a08', 1) +
        P('M26,28 L36,30 L35,32.4 L25,30.4 Z', OL, 1) + E(31.8, 32.2, 2.4, 1.5, '#ff3a1a', 1) +
        P(arw, c.lg(['#fffbe0', '#ffd040', '#c8781a'], 0, 0, 1, 1), 2.2) +
        S('M36,11.6 L47.4,11.6 L47.4,7.4', '#ffffff', 1.3, 0.8) +
        S('M28,10 L31,10 M26,14 L30,14 M28,18 L31,18', '#fff4b0', 2, 0.8) +
        sparkle(60, 26, 2.4, '#ffffff') + sparkle(8, 10, 2.4, '#fff4c0'));
    },
    /* hunter: a black beast roaring head-on, fangs bared and eyes blazing, wreathed in a red aura of rage */
    bestial_wrath: function (c) {
      var fur = '#3a2a2a';
      var head = 'M14,24 C16,15 23,11 32,11 C41,11 48,15 50,24 L55,28 L51,32 L56,38 L50,41 L52,48 L45,49 C42,55 37,59 32,59 C27,59 22,55 19,49 L12,48 L14,41 L8,38 L13,32 L9,28 Z';
      var fl = '', i;
      for (i = 0; i < 11; i++) {
        var a = -90 + (i - 5) * 25;
        fl += G(flameC(0, 0, 0.44, ['#a80a04', '#ff3a1a', '#ffb050']), 'translate(32,36) rotate(' + (a + 90) + ') translate(0,-27)');
      }
      return iconWrap(c, ['#b01c0c', '#140202'],
        glow(c, 32, 34, 34, '#ff6a2a', 0.85) +
        fl +
        P('M14,24 L10,6 L24,14 Z M50,24 L54,6 L40,14 Z', c.cel(fur), 2.2) + F('M14,18 L12.6,10 L19,14 Z M50,18 L51.4,10 L45,14 Z', '#a85a4a', 0.9) +
        P(head, c.cel(fur), 2.4) +
        S('M18,22 C22,16 28,14 32,14', '#8a6a6a', 1.4, 0.7) +
        P('M19,24 L29,29 L28,31.6 L18.6,27.6 Z M45,24 L35,29 L36,31.6 L45.4,27.6 Z', OL, 1) +
        P('M20,29 L28,31.6 L26,34 L21,33 Z M44,29 L36,31.6 L38,34 L43,33 Z', '#ffe23a', 1) +
        E(25, 32.2, 0.8, 1.6, '#1a0a04', 0) + E(39, 32.2, 0.8, 1.6, '#1a0a04', 0) +
        P('M28.4,35 L35.6,35 L32,39 Z', '#140808', 1.2) +
        P('M21,41 C26,39 38,39 43,41 C44,50 39,56.4 32,56.4 C25,56.4 20,50 21,41 Z', '#4a0404', 2) +
        P('M23,41 L25.4,50 L27.6,40.4 Z M41,41 L38.6,50 L36.4,40.4 Z', '#fffbe8', 1) +
        P('M26,55 L27.4,49.6 L29,55.4 Z M38,55 L36.6,49.6 L35,55.4 Z', '#fffbe8', 1) +
        E(32, 51, 4.2, 2, '#c83a3a', 0) +
        S('M14,36 L6,34 M14,40 L7,42 M50,36 L58,34 M50,40 L57,42', '#c8b8a8', 1, 0.8));
    },
    /* druid: a night sky raining shooting stars, each streaking down to the dark hills below */
    starfall: function (c) {
      var col = '#bfa8ff';
      return iconWrap(c, ['#3a3aa0', '#02040e'],
        C(10, 8, 0.9, '#ffffff', 0) + C(24, 5, 0.7, '#ffffff', 0) + C(44, 20, 0.8, '#ffffff', 0) + C(6, 30, 0.7, '#ffffff', 0) + C(58, 34, 0.8, '#ffffff', 0) + C(30, 22, 0.6, '#ffffff', 0) +
        glow(c, 32, 60, 30, '#9a8aff', 0.6) +
        fstar(c, 16, 22, 3.6, 18, -1, 1.1, col) + fstar(c, 44, 12, 3, 14, -1, 1.1, col) +
        fstar(c, 30, 36, 4.6, 22, -1, 1.1, col) + fstar(c, 54, 30, 3.4, 16, -1, 1.1, col) +
        fstar(c, 14, 46, 3, 14, -1, 1.1, col) + fstar(c, 46, 48, 4.2, 20, -1, 1.1, col) +
        P('M0,56 C10,50 20,52 30,56 C40,52 52,50 64,54 L64,64 L0,64 Z', c.lg(['#2a2a5a', '#0a0a1a']), 2) +
        rays(22, 56, 6, 2, 6, '#e8e0ff', 1.2, 0.8, 0.3) + sparkle(22, 56, 2.6, '#ffffff') + sparkle(56, 55, 2.2, '#ffffff'));
    },
    /* druid: a glowing seed bursting into vines that curl out in every direction, healing sparkles at their tips */
    wild_growth: function (c) {
      var vg = '#4a9a2a', v = '', lv = '', tips = '', i;
      for (i = 0; i < 6; i++) {
        var a = (i * 60 - 60) * Math.PI / 180, b = a + 0.5;
        var p1 = [32 + Math.cos(a) * 13, 34 + Math.sin(a) * 13], p2 = [32 + Math.cos(b) * 24, 34 + Math.sin(b) * 24];
        v += tube(c, [32, 34], p1, p2, 3.2, 1.6, vg, 14);
        var cx = p2[0] + Math.cos(b + 1.6) * 3, cy = p2[1] + Math.sin(b + 1.6) * 3;
        tips += S(D`M${p2[0]},${p2[1]} A3,3 0 1 1 ${cx + Math.cos(b + 1.6) * 3 - 0.1},${cy + Math.sin(b + 1.6) * 3}`, OL, 4) +
          S(D`M${p2[0]},${p2[1]} A3,3 0 1 1 ${cx + Math.cos(b + 1.6) * 3 - 0.1},${cy + Math.sin(b + 1.6) * 3}`, '#8ad84a', 1.6);
        lv += leaf(c, 32 + Math.cos(a + 0.2) * 13, 34 + Math.sin(a + 0.2) * 13, (a + 0.2) * 180 / Math.PI + 90 + 55, 0.85, '#7ad04a') +
          leaf(c, 32 + Math.cos(a + 0.45) * 20, 34 + Math.sin(a + 0.45) * 20, (a + 0.45) * 180 / Math.PI + 90 - 60, 0.7, '#9ae05a');
        tips += sparkle(32 + Math.cos(b + 0.1) * 29, 34 + Math.sin(b + 0.1) * 29, 3, '#f0ffc0');
      }
      return iconWrap(c, ['#3aa02a', '#041002'],
        glow(c, 32, 34, 32, '#c8ff90', 0.8) +
        v + lv + tips +
        glow(c, 32, 34, 12, '#ffffc0', 0.95) +
        C(32, 34, 5.4, c.rg([[0, '#ffffff'], [0.5, '#e8ffa0'], [1, '#6ac83a']]), 1.8) +
        sparkle(32, 34, 3, '#ffffff'));
    },
    /* shaman: the ground heaving apart into tilted slabs over a deep fissure, boulders tumbling down from above */
    earthquake: function (c) {
      var top = '#a07a4a', side = '#5a3a1e';
      return iconWrap(c, ['#b8801e', '#140a02'],
        glow(c, 32, 40, 30, '#ffd890', 0.6) +
        F('M20,34 L44,34 L40,64 L24,64 Z', '#140804') +
        glow(c, 32, 52, 10, '#ff8a2a', 0.5) +
        P('M0,40 L24,33 L28,40 L0,48 Z', c.cel(top), 2) + P('M0,48 L28,40 L27,47 L0,56 Z', c.cel(side), 2) +
        P('M0,56 L27,47 L31,55 L26,64 L0,64 Z', c.cel(dk(side, 0.2)), 2) +
        P('M64,36 L40,31 L36,39 L64,46 Z', c.cel(top), 2) + P('M64,46 L36,39 L37,44 L64,52 Z', c.cel(side), 2) +
        P('M64,52 L37,44 L34,54 L39,64 L64,64 Z', c.cel(dk(side, 0.2)), 2) +
        S('M6,43 L12,41 L16,44 M48,38 L54,40 L58,38 M8,58 L14,55 M50,56 L56,59', dk(side, 0.5), 1.4) +
        S('M2,30 C0,34 0,38 2,42 M62,26 C64,30 64,34 62,38 M6,28 C4,32 4,36 6,40 M58,24 C60,28 60,32 58,36', '#fff0d0', 1.6, 0.8) +
        S('M18,4 L20,12 M32,2 L32,10 M46,6 L44,14', '#fff0d0', 1.4, 0.6) +
        rock(c, 22, 18, 0.9, '#8a7a6a', 20) + rock(c, 40, 22, 0.7, '#8a7a6a', -30) + rock(c, 31, 8, 0.5, '#8a7a6a', 60) +
        rock(c, 12, 30, 0.4, '#8a7a6a', 10) + rock(c, 52, 28, 0.42, '#8a7a6a', 80) +
        C(30, 32, 1.4, '#a07a4a', 0) + C(35, 30, 1.1, '#a07a4a', 0));
    },
    /* shaman: a carved fire totem with a living fire elemental rising out of its top, arms raised and eyes blazing */
    fire_elemental_totem: function (c) {
      var wd = c.lg(['#a8703a', '#6a4020', '#3a2010'], 0.2, 0, 0.8, 1);
      var armL = G(flameC(0, 0, 0.5, FIRE), 'translate(18,26) rotate(-50)'), armR = G(flameC(0, 0, 0.5, FIRE), 'translate(46,26) rotate(50)');
      return iconWrap(c, ['#c8440c', '#180400'],
        glow(c, 32, 26, 34, '#ffc040', 0.85) +
        armL + armR +
        G(flameC(0, 0, 1.1, FIRE), 'translate(32,30)') +
        G(flameC(0, 0, 0.62, ['#ff6a14', '#ffd040', '#ffffff']), 'translate(32,18)') +
        P('M26.4,16 L30.6,18 L30,20 L26,18.4 Z M37.6,16 L33.4,18 L34,20 L38,18.4 Z', '#fffbe8', 1) +
        P('M29,23.6 C31,22.8 33,22.8 35,23.6 L34,25.4 L30,25.4 Z', '#8a1a04', 0.9) +
        P('M22,46 L42,46 L41,64 L23,64 Z', wd, 2.4) +
        P('M19,42 C19,39 45,39 45,42 L43,47 L21,47 Z', c.cel('#8a5a2a'), 2) +
        P('M26,51 L30,52.4 L30,54 L26,53 Z M38,51 L34,52.4 L34,54 L38,53 Z', OL, 0.8) + E(28, 54.6, 1.4, 1, '#ffd040', 0.6) + E(36, 54.6, 1.4, 1, '#ffd040', 0.6) +
        E(32, 59, 3.4, 2.4, '#1a0804', 1.2) + S('M23,49 L41,49', '#e03c14', 1.6) +
        C(8, 10, 1.4, '#ffe868', 0) + C(56, 8, 1.4, '#ffe868', 0) + C(10, 50, 1.2, '#ffd040', 0) + C(54, 52, 1.2, '#ffd040', 0));
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
