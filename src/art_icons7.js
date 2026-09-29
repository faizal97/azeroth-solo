/* art_icons7.js - more spell icons for Realm of Loner (18 keys: two more class abilities for every class).
 * Loads AFTER art.js and art_icons2.js .. art_icons6.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons.
 * Self-contained: art.js helpers are private, so the few needed here are re-implemented (same maths, same look).
 * Never throws. Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline,
 * vignette + bevel frame, no text, no filters. Gradient ids use the prefix i7<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i7' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a heavy blade finishing its swing, a deep bloody gash torn open behind its edge */
    mortal_strike: function (c) {
      var gash = lens(4, 59, 39, 39, 11, -3), core = lens(9, 56, 35, 41, 5.2, -3);
      var drips = 'M13,56 L13,61 M22,51 L23,59 M31,46.5 L31,53';
      return iconWrap(c, ['#8a5a3a', '#140804'],
        glow(c, 30, 40, 30, '#ffc8a0', 0.55) +
        S('M2,44 C12,35 24,30 36,28', '#fff4e0', 2.4, 0.55) + S('M6,49 C16,42 26,37 34,35', '#fff4e0', 1.6, 0.45) +
        S(gash, '#ff6a4a', 5, 0.3) +
        P(gash, c.lg(['#ff6a5a', '#c8141a', '#6a0008'], 0.2, 0, 0.8, 1), 2.4) +
        F(core, '#2a0004') + S('M9,55 C18,48 27,42 35,39', '#ff9a8a', 1.1, 0.8) +
        S(drips, OL, 4.8) + S(drips, '#c8141a', 2.6) +
        drop(13, 62, 1) + drop(23, 60, 1.1) + drop(31, 54, 1) +
        drop(50, 46, 0.9) + drop(55, 38, 0.8) + drop(47, 54, 0.7) +
        G(greatsword(c), 'translate(58.4,10.8) rotate(215) scale(0.9,0.66)') +
        sparkle(38, 40, 4.6, '#ffffff') + sparkle(10, 10, 2.6, '#fff4e0'));
    },
    /* warrior: a wild-haired warrior screaming, eyes blazing, jagged red rage lines crackling round the head */
    berserker_rage: function (c) {
      var sk = '#e8906a';
      var head = 'M18,30 C18,17 24,11 32,11 C40,11 46,17 46,30 C47,42 42,53 32,57 C22,53 17,42 18,30 Z';
      var rl = OS(zig(2, 14, 13, 24, 3, 2.2), '#ff4a2a', 2.4) + OS(zig(62, 14, 51, 24, 3, 2.2, 2), '#ff4a2a', 2.4) +
        OS(zig(2, 44, 12, 38, 3, 2), '#ff4a2a', 2.2) + OS(zig(62, 44, 52, 38, 3, 2, 1), '#ff4a2a', 2.2) +
        OS(zig(8, 60, 16, 51, 2, 1.6), '#ff7a3a', 2) + OS(zig(56, 60, 48, 51, 2, 1.6, 1), '#ff7a3a', 2);
      return iconWrap(c, ['#b82a10', '#1a0402'],
        glow(c, 32, 32, 32, '#ff8a3a', 0.8) +
        P(star(32, 33, 14, 31, 21, 0.1), c.rg([[0, '#ffb060'], [0.6, '#e8301a'], [1, '#8a0a04']]), 2) +
        rl +
        P('M22,52 L20,64 L44,64 L42,52 Z', c.cel(dk(sk, 0.15)), 2) +
        E(17, 33, 3, 5, c.cel(sk), 1.8) + E(47, 33, 3, 5, c.cel(sk), 1.8) +
        P(head, c.cel(sk), 2.4) +
        P('M15,30 L12,17 L19,21 L18,8 L25,14 L29,3 L33,12 L40,5 L41,15 L48,11 L46,21 L52,24 L48,30 C45,22 40,19 32,19 C24,19 19,22 15,30 Z', c.cel('#7a2a0a'), 2) +
        S('M22,23 L25,26 L23,28 M42,23 L39,26 L41,28 M20,40 L23,42 M44,40 L41,42', '#b0141a', 1.4, 0.9) +
        E(25.5, 32.5, 3.6, 2.4, '#fff8b0', 1.2) + E(38.5, 32.5, 3.6, 2.4, '#fff8b0', 1.2) + C(25.5, 32.8, 1.2, '#d8141a', 0) + C(38.5, 32.8, 1.2, '#d8141a', 0) +
        P('M19,26 L30,30 L30,33.5 L19,29 Z M45,26 L34,30 L34,33.5 L45,29 Z', OL, 1) +
        P('M24,41 C27,39 37,39 40,41 C41,48 37,54.5 32,54.5 C27,54.5 23,48 24,41 Z', '#3a0404', 2) +
        F('M25,41.5 C28,40 36,40 39,41.5 L38.5,44 L25.5,44 Z', '#fffbe8') + F('M27.5,53 C29,51.5 35,51.5 36.5,53 C35,54.3 29,54.3 27.5,53 Z', '#fffbe8') +
        E(32, 50, 4.2, 2, '#c83a3a', 0));
    },
    /* mage: an open hand raised, violet-pink arcane lightning crackling between its fingertips */
    arcane_power: function (c) {
      var sk = '#f0c8b0';
      var fg = 'M27,35 L24,15 M32,34 L32,11 M37,35 L40,14 M42,38 L48,22 M23,45 L12,35';
      var palm = 'M22,58 L21,44 C20,38 22,34 26,33 L40,33 C44,34 46,38 45,44 L44,58 Z';
      var cr = zig(24, 13, 32, 8, 2, 1.5) + zig(32, 8, 40, 11, 2, 1.5, 1).replace('M', 'L') + zig(40, 11, 49, 19, 2, 1.5, 2).replace('M', 'L');
      return iconWrap(c, ['#9a2ab8', '#12021a'],
        glow(c, 32, 28, 34, '#ff9af8', 0.85) +
        rays(32, 30, 14, 24, 31, '#ffd8fc', 1.6, 0.55, 0.2) +
        zbolt(zig(12, 33, 3, 18, 3, 2.4), 1.8, '#ff7af0') + zbolt(zig(48, 21, 61, 12, 3, 2.4, 1), 1.8, '#ff7af0') +
        zbolt(zig(32, 9, 30, 1, 2, 1.8), 1.6, '#ff7af0') + zbolt(zig(45, 44, 61, 50, 3, 2.2, 2), 1.6, '#ff7af0') +
        S(fg, OL, 8.4) + P(palm, c.cel(sk), 2.4) + S(fg, sk, 5.6) + S(fg, '#ffffff', 1.4, 0.35) +
        S('M27,44 C30,47 36,47 40,43', dk(sk, 0.3), 1.2, 0.7) +
        zbolt(cr, 1.8, '#ff7af0') +
        glow(c, 33, 46, 13, '#ffb8ff', 0.95) + C(33, 46, 4.2, c.rg([[0, '#ffffff'], [0.6, '#ffc8ff'], [1, '#e050f0']]), 1.4) +
        P('M16,56 L48,56 L50,64 L14,64 Z', c.cel('#5a1a8a'), 2) + S('M16.4,58.4 L47.6,58.4', GOLD, 1.8) +
        sparkle(9, 50, 3.2, '#ffe8ff') + sparkle(55, 30, 3, '#ffffff') + sparkle(8, 8, 2.6, '#ffe8ff'));
    },
    /* mage: a dark iron shield with a blazing rim of flame and a burning emblem */
    fire_ward: function (c) {
      var sh = 'M14,14 C22,11 42,11 50,14 L50,34 C50,46 42,54 32,60 C22,54 14,46 14,34 Z';
      var inner = 'M18.5,17.5 C25,15.5 39,15.5 45.5,17.5 L45.5,34 C45.5,43.5 39,50 32,55 C25,50 18.5,43.5 18.5,34 Z';
      var fl = [[16, 14, 0.42, -35], [24, 11, 0.5, -10], [32, 10, 0.58, 0], [40, 11, 0.5, 10], [48, 14, 0.42, 35],
        [11, 28, 0.4, -70], [53, 28, 0.4, 70], [14, 44, 0.36, -115], [50, 44, 0.36, 115]];
      var f = '';
      fl.forEach(function (p) { f += G(flameC(0, 0, p[2], FIRE), 'translate(' + p[0] + ',' + p[1] + ') rotate(' + p[3] + ') translate(0,-8)'); });
      return iconWrap(c, ['#c8400c', '#1a0400'],
        glow(c, 32, 34, 34, '#ffb040', 0.75) +
        f +
        P(sh, c.lg(['#7a2a10', '#4a0c04', '#240402'], 0.2, 0, 0.8, 1), 2.6) +
        S(inner, OL, 4) + S(inner, '#ff9a1a', 2.4) + S(inner, '#fff0a0', 0.9) +
        glow(c, 32, 38, 14, '#ff8a1a', 0.8) +
        flameC(32, 39, 0.72, FIRE) +
        S('M17,15 C24,13 30,12.4 35,12.6', '#ffd080', 1.4, 0.8) +
        C(6, 56, 1.4, '#ffe868', 0) + C(58, 58, 1.3, '#ffe868', 0) + C(8, 8, 1.2, '#ffd040', 0) + C(57, 6, 1.2, '#ffd040', 0));
    },
    /* priest: a hooded priest turned to living shadow, black-violet wisps streaming off a glowing-eyed silhouette */
    shadowform: function (c) {
      var fig = 'M32,9 C24,9 20,16 20,24 C20,26 21,28 21,30 C15,36 11,48 9,64 L55,64 C53,48 49,36 43,30 C43,28 44,26 44,24 C44,16 40,9 32,9 Z';
      var ws = 'M21,32 C12,30 12,21 5,19 M43,32 C52,30 52,21 59,19 M13,56 C6,53 4,46 7,40 M51,56 C58,53 60,46 57,40 M22,20 C16,16 14,10 16,6 M42,20 C48,16 50,10 48,6';
      return iconWrap(c, ['#9a5ad0', '#0e0418'],
        glow(c, 32, 26, 34, '#ecd0ff', 0.9) +
        ring2(32, 6.5, 10, 3, '#3a1458', 2.4) + S('M23,5.4 C27,4 37,4 41,5.4', '#d8a8ff', 1, 0.8) +
        S(ws, OL, 6.6) + S(ws, '#2a1044', 4) + S(ws, '#b080f0', 1.2, 0.7) +
        P(fig, c.lg(['#3a1a5a', '#1a0a2c', '#08040e'], 0.2, 0, 0.8, 1), 2.4) +
        S(fig, '#b070ff', 1.2, 0.55) +
        E(32, 23, 7, 8, '#030106', 1.4) +
        glow(c, 29, 23, 4.5, '#e8a0ff', 0.9) + glow(c, 35, 23, 4.5, '#e8a0ff', 0.9) +
        E(29, 23, 1.8, 1.1, '#ffe0ff', 0) + E(35, 23, 1.8, 1.1, '#ffe0ff', 0) +
        S('M25,33 L32,45 L39,33', '#8a5ac8', 2, 0.75) + S('M32,45 L32,60', '#8a5ac8', 1.6, 0.6) +
        cloud(c, [[10, 62, 6], [22, 63, 6], [34, 63, 6], [46, 63, 6], [56, 62, 6]], '#1a0a2a') +
        S('M8,60 C12,57 16,58 18,60 M40,59 C44,56 48,57 50,59', '#8a5ac8', 1.2, 0.7) +
        sparkle(10, 10, 2.8, '#e8c8ff') + sparkle(55, 34, 2.4, '#e8c8ff'));
    },
    /* priest: two hands pressed together in prayer under a bright golden beam of light from above */
    desperate_prayer: function (c) {
      var sk = '#f0c8a0';
      var hl = 'M32,13 C29,13 27,16 26.5,21 L25,33 C24.4,38 22,41 20,44 L22,53 L32,53 Z';
      return iconWrap(c, ['#b88a30', '#120a02'],
        F('M20,0 L44,0 L54,64 L10,64 Z', c.lg([[0, '#ffffff', 0.95], [0.55, '#fff0a0', 0.4], [1, '#fff0a0', 0]])) +
        glow(c, 32, 2, 26, '#fffbe0', 0.95) +
        S('M22,0 L12,40 M42,0 L52,40 M32,0 L32,8', '#fffbe0', 1.6, 0.6) +
        glow(c, 32, 32, 18, '#fff4c0', 0.7) +
        P(hl, c.cel(sk), 2.2) + G(P(hl, c.cel(sk), 2.2), 'translate(64,0) scale(-1,1)') +
        S('M32,15 L32,52', OL, 1.4) +
        S('M27.3,22 L30.5,24 M26.5,28 L30.5,30 M26,34 L29.5,35.5 M36.7,22 L33.5,24 M37.5,28 L33.5,30 M38,34 L34.5,35.5', dk(sk, 0.35), 1.1, 0.8) +
                P('M12,64 L17,50 L32,54 L32,64 Z', c.cel('#f4ecdc'), 2) + P('M52,64 L47,50 L32,54 L32,64 Z', c.cel('#f4ecdc'), 2) +
        S('M16.6,52.6 L31,56.4 M47.4,52.6 L33,56.4', GOLD, 1.8) +
        S('M28,15 C29,14 30.5,13.5 32,13.6', '#ffffff', 1.2, 0.8) +
        sparkle(18, 14, 3, '#ffffff') + sparkle(47, 20, 2.6, '#ffffff') + sparkle(40, 8, 2, '#fffbe0') + sparkle(22, 28, 2, '#fffbe0'));
    },
    /* rogue: a racing heart hammering fast, a jagged heartbeat line and yellow energy streaks tearing past it */
    adrenaline_rush: function (c) {
      var ht = 'M34,55 C18,45 10,35 12,25 C14,16 25,13 34,22 C43,13 54,16 56,25 C58,35 50,45 34,55 Z';
      var ecg = 'M1,36 L14,36 L18,28 L23,44 L28,18 L34,50 L38,36 L63,36';
      return iconWrap(c, ['#b89018', '#140e02'],
        glow(c, 34, 34, 32, '#ffe870', 0.8) +
        G(F(ht, '#ff5a3a'), 'translate(-9,0)', 0.25) + G(F(ht, '#ff5a3a'), 'translate(-5,0)', 0.35) +
        OS('M1,22 L12,22 M0,30 L9,30 M1,46 L12,46 M3,54 L14,54', '#ffe040', 2.2) +
        P(ht, c.lg(['#ff7a6a', '#d0141a', '#6a0008'], 0.2, 0, 0.8, 1), 2.6) +
        S('M18,25 C19,20 24,18 28,20', '#ffffff', 2, 0.75) +
        S('M8,12 C5,16 5,21 6,25 M60,12 C63,16 63,21 62,25', '#ffe870', 2, 0.8) +
        S(ecg, OL, 5) + S(ecg, '#fff04a', 2.6) + S(ecg, '#ffffff', 0.9) +
        zbolt(zig(44, 3, 58, 13, 3, 2.2), 1.8, '#ffe040') + zbolt(zig(44, 61, 60, 52, 3, 2.2, 2), 1.8, '#ffe040') +
        sparkle(52, 30, 3, '#ffffff') + sparkle(20, 8, 2.6, '#fff8c0'));
    },
    /* rogue: a pale, see-through spectral dagger stabbing in, ghostly afterimages and wisps trailing it */
    ghostly_strike: function (c) {
      var bl = 'M-4.4,-4 L-4.4,-21 L0,-30 L4.4,-21 L4.4,-4 Z', gu = 'M-9,-6 L9,-6 L9,-2 L-9,-2 Z', gr = 'M-2.4,-2 L2.4,-2 L2.4,8 L-2.4,8 Z';
      var g1 = c.lg(['#ffffff', '#a8fff0', '#3ab8a8'], 0, 0, 1, 0);
      var dg = function (tf, o, halo) {
        return G((halo ? S(bl, '#c8fff4', 7, 0.35) : '') + P(bl, g1, 1.8) + S('M0,-8 L0,-25', '#ffffff', 1.2, 0.7) + P(gu, g1, 1.8) + P(gr, '#3a8a88', 1.6) + C(0, 10, 2.8, g1, 1.6), tf, o);
      };
      var wisp = 'M4,58 C10,52 12,46 18,46 C22,46 22,50 20,52 M2,48 C8,42 14,38 20,40 M12,62 C18,58 22,54 28,54';
      return iconWrap(c, ['#2a7a8a', '#020c10'],
        glow(c, 40, 26, 32, '#b0fff0', 0.7) +
        S(wisp, '#c8fff4', 4.4, 0.35) + S(wisp, '#ffffff', 1.4, 0.6) +
        G(P('M3,64 C1,50 6,40 14,40 C22,40 26,50 24,64 L20,60 L16,64 L12,60 L8,64 Z', c.lg(['#ffffff', '#b8fff0']), 1.6) +
          E(10.4, 49, 2, 3, '#0a2a2a', 0) + E(17.6, 49, 2, 3, '#0a2a2a', 0) + E(14, 56, 1.8, 2.4, '#0a2a2a', 0), '', 0.6) +
        dg('translate(18,48) rotate(45) scale(1.35)', 0.16) + dg('translate(23,43) rotate(45) scale(1.35)', 0.3) +
        dg('translate(29,37) rotate(45) scale(1.4)', 0.8, true) +
        rays(58.7, 7.3, 8, 4, 9, '#e8fffa', 1.6, 0.85, 0.2) +
        sparkle(58.7, 7.3, 4.6, '#ffffff') + sparkle(48, 44, 2.6, '#e8fffa') + sparkle(8, 12, 2.4, '#e8fffa'));
    },
    /* paladin: a jewelled golden crown on red velvet, radiant with holy light */
    blessing_kings: function (c) {
      var cr = 'M14,43 L10,21 L19,32 L21,16 L27,29 L32,8 L37,29 L43,16 L45,32 L54,21 L50,43 C40,46 24,46 14,43 Z';
      var band = 'M13,41 C24,45 40,45 51,41 L51,51 C40,55 24,55 13,51 Z';
      return iconWrap(c, ['#c8902a', '#1a0c02'],
        glow(c, 32, 30, 34, '#fff6c8', 0.95) +
        rays(32, 30, 16, 20, 31, '#fffbe8', 2, 0.6, 0.1) +
        P('M15,42 C14,26 22,21 32,21 C42,21 50,26 49,42 Z', c.cel('#a01a3a'), 2) +
        S('M20,38 C20,30 25,26 32,26', '#e05a7a', 1.4, 0.7) +
        P(cr, c.lg(['#fff6b0', '#f0c040', '#a86a10'], 0.2, 0, 0.8, 1), 2.2) +
        S('M12,23 L15,40 M22,19 L24,31 M32,11 L32,27', '#ffffff', 1.2, 0.7) +
        P(band, c.lg(['#fff0a0', '#e0a830', '#8a5a0c'], 0, 0, 0, 1), 2.2) +
        S('M14,43.5 C24,47.5 40,47.5 50,43.5', '#fffbe0', 1.2, 0.8) +
        E(32, 48.5, 4, 3.4, c.cel('#e0141a'), 1.6) + C(21.5, 47.5, 2.6, c.cel('#2a6ae0'), 1.4) + C(42.5, 47.5, 2.6, c.cel('#2a6ae0'), 1.4) +
        C(10, 21, 2.8, c.cel('#ffffff'), 1.4) + C(21, 16, 2.6, c.cel('#ffffff'), 1.4) + C(32, 8, 3, c.cel('#ffffff'), 1.4) + C(43, 16, 2.6, c.cel('#ffffff'), 1.4) + C(54, 21, 2.8, c.cel('#ffffff'), 1.4) +
        sparkle(8, 56, 3, '#ffffff') + sparkle(56, 56, 3, '#ffffff') + sparkle(31, 47.5, 1.6, '#ffffff'));
    },
    /* paladin: great golden angel wings spread wide behind an upright blazing sword */
    avenging_wrath: function (c) {
      var wing = function () {
        var o = '', i, ang = [148, 166, 184, 202, 220, 238, 254], len = [15, 20, 24, 27, 28, 26, 21];
        for (i = 0; i < ang.length; i++) {
          var a = ang[i] * Math.PI / 180, L = len[i];
          o += E(27 + Math.cos(a) * L / 2, 27 + Math.sin(a) * L / 2, L / 2, 4, c.lg(['#ffffff', '#fff0b0', '#e0a830'], 0, 0, 1, 1), 1.8, null, ang[i]);
        }
        for (i = 0; i < 5; i++) {
          var b = (160 + i * 20) * Math.PI / 180, l2 = 12;
          o += E(28 + Math.cos(b) * l2 / 2, 28 + Math.sin(b) * l2 / 2, l2 / 2, 3.4, c.lg(['#fffbe8', '#ffe070', '#c88a18'], 0, 0, 1, 1), 1.6, null, 160 + i * 20);
        }
        return o;
      };
      return iconWrap(c, ['#d8a030', '#1e0e02'],
        glow(c, 32, 26, 34, '#fff4c0', 0.9) +
        rays(32, 22, 18, 16, 31, '#fffbe8', 1.8, 0.5, 0.05) +
        wing() + G(wing(), 'translate(64,0) scale(-1,1)') +
        glow(c, 32, 14, 12, '#ffffff', 0.9) +
        G(greatsword(c), 'translate(32,45) scale(0.75)') +
        sparkle(32, 5, 4, '#ffffff') + sparkle(8, 56, 2.8, '#fffbe0') + sparkle(56, 56, 2.8, '#fffbe0'));
    },
    /* warlock: a horned black skull inside a ticking countdown ring, most of it already burned through */
    curse_of_doom: function (c) {
      var cx = 32, cy = 33, rr = 24;
      var hn = 'M-11,-12 C-16,-16 -18,-22 -15,-28 C-14,-22 -10,-18 -6,-17 Z';
      var tk = '', i;
      for (i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; tk += D`M${cx + Math.cos(a) * 27.5},${cy + Math.sin(a) * 27.5} L${cx + Math.cos(a) * 30.5},${cy + Math.sin(a) * 30.5}`; }
      var end = [cx + Math.cos(Math.PI) * rr, cy];
      return iconWrap(c, ['#5a1a7a', '#050108'],
        glow(c, cx, cy, 30, '#a040ff', 0.7) +
        S(tk, OL, 3.6) + S(tk, '#c890ff', 1.6) +
        ring2(cx, cy, rr, rr, '#2a1238', 4.6) +
        arc(cx, cy, rr, -90, 180, '#e050ff', 4.6) + S(D`M${cx},${cy - rr} A${rr},${rr} 0 1 1 ${end[0]},${end[1]}`, '#ffd0ff', 1.4, 0.8) +
        C(end[0], end[1], 4.2, c.rg([[0, '#ffffff'], [0.6, '#ffb0ff'], [1, '#c030e0']]), 1.6) +
        C(cx, cy - rr, 2.2, '#8a5aa8', 1.2) +
        glow(c, cx, cy, 17, '#c060ff', 0.85) +
        G(P(hn, c.cel('#2a1a2e'), 1.8) + G(P(hn, c.cel('#2a1a2e'), 1.8), 'scale(-1,1)'), 'translate(' + cx + ',' + (cy + 1) + ') scale(0.95)') +
        skullG(c, cx, cy + 2, 0.95, '#4a3a56', '#ff5a1a') +
        glow(c, cx - 5.2, cy + 0.5, 4, '#ff8a3a', 0.8) + glow(c, cx + 5.2, cy + 0.5, 4, '#ff8a3a', 0.8) +
        sparkle(56, 56, 2.6, '#f0c8ff') + sparkle(8, 56, 2.2, '#f0c8ff'));
    },
    /* warlock: a dark figure with arms flung wide, engulfed in a roaring ring of green-orange fel fire */
    hellfire: function (c) {
      var cx = 32, cy = 52, rx = 25, ry = 8, back = '', front = '', i;
      for (i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2 + 0.13, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, isF = Math.sin(a) > 0;
        var f = flameC(x, y - 6, isF ? 0.5 : 0.4, FEL);
        if (isF) front += f; else back += f;
      }
      var fig = 'M26,58 L27.5,41 L19,35 L11,25 L14.5,22.5 L24,30.5 L28.5,31 C26.8,29 26.6,25 27.6,22.4 C28.6,18.4 35.4,18.4 36.4,22.4 C37.4,25 37.2,29 35.5,31 L40,30.5 L49.5,22.5 L53,25 L45,35 L36.5,41 L38,58 Z';
      return iconWrap(c, ['#2a7a14', '#040a02'],
        glow(c, 32, 40, 34, '#b8ff50', 0.7) +
        E(cx, cy, rx + 3, ry + 3, c.rg([[0, '#ffe070'], [0.5, '#ff9a1a', 0.8], [1, '#2a9a14', 0]]), 0) +
        G(flameC(0, 0, 1.25, FEL), 'translate(32,30)') +
        back +
        P(fig, '#140804', 2) + S('M19,35 L11,25 M45,35 L53,25 M27.6,22.4 C28.6,18.4 35.4,18.4 36.4,22.4', '#ffb030', 1.2, 0.85) +
        E(30, 25, 1.4, 0.9, '#c8ff5a', 0) + E(34, 25, 1.4, 0.9, '#c8ff5a', 0) +
        front +
        C(8, 12, 1.4, '#c8ff5a', 0) + C(56, 10, 1.3, '#ffd040', 0) + C(58, 34, 1.2, '#c8ff5a', 0) + C(6, 34, 1.2, '#ffd040', 0));
    },
    /* hunter: a steel trap blown apart by a fireball, its jaws and bits flying out of the blast */
    explosive_trap: function (c) {
      var cx = 32, cy = 34;
      return iconWrap(c, ['#c8500c', '#1a0400'],
        glow(c, cx, cy, 34, '#ffc040', 0.85) +
        cloud(c, [[14, 14, 7], [24, 9, 7], [38, 9, 7], [50, 14, 7], [8, 24, 5], [56, 24, 5]], '#5a3a2a') +
        P(star(cx, cy, 14, 29, 15, 0.1), c.rg([[0, '#fffbe0'], [0.35, '#ffd040'], [0.75, '#ff6a14'], [1, '#c81a0a']]), 2.2) +
        burst(c, cx, cy, 15, 7, 10, ['#ff9a1a', '#ffe868', '#ffffff']) +
        E(cx, 57, 14, 4.2, c.cel('#4a4a52'), 2) + E(cx, 56, 5, 1.8, '#8a9098', 1.2) +
        jaw(c, 11, 49, -40, 9) + jaw(c, 53, 49, 40, 9) +
        P('M47,26 L52,23 L53,28 Z M12,28 L17,26 L15,31 Z M42,50 L46,47 L47,52 Z M18,50 L22,48 L21,53 Z', '#6a6a72', 1.4) +
        S('M20,6 L16,2 M44,6 L48,2 M4,40 L0,42 M60,40 L64,42', '#ffe070', 1.8, 0.8) +
        C(6, 60, 1.4, '#ffe868', 0) + C(58, 60, 1.4, '#ffe868', 0) + C(4, 8, 1.2, '#ffd040', 0) + C(60, 8, 1.2, '#ffd040', 0));
    },
    /* hunter: a raised armoured forearm, two arrows glancing off it in a burst of sparks and flying away crossed */
    deterrence: function (c) {
      var sk = '#e0a878';
      var arm = 'M23,64 C23,52 24,40 25,30 L39,30 C40,40 41,52 41,64 Z';
      var fist = 'M23.5,33 C21,25 22,15 28,12.5 L37.5,12.5 C43,13.5 44,22 41.5,33 Z';
      return iconWrap(c, ['#8a6a3a', '#120a02'],
        glow(c, 32, 30, 32, '#fff0c0', 0.7) +
        earc(32, 40, 27, 27, 196, 344, '#fff4d0', 2.6, 0.7) +
        S('M6,38 C5,30 7,22 12,16 M58,38 C59,30 57,22 52,16', '#fffbe8', 1.4, 0.5) +
        P(arm, c.cel(sk), 2.2) +
        P(fist, c.cel(sk), 2.2) + S('M26,14 L26.5,22 M30.5,13 L31,22 M35,13 L35,22 M39.5,14 L39,22', dk(sk, 0.35), 1.2) +
        S('M24,24 C28,26 36,26 42,24', dk(sk, 0.4), 1.3, 0.8) +
        P('M22.6,34 L41.4,34 L42.2,56 L21.8,56 Z', c.cel(LEATH), 2.2) +
        P('M25,37 L39,37 L39.6,53 L24.4,53 Z', c.lg(STEEL, 0.2, 0, 0.8, 1), 1.8) +
        S('M26.5,39 L26.5,51', '#ffffff', 1.2, 0.7) +
        C(27.5, 40, 1.2, '#5a4a3a', 0) + C(36.5, 40, 1.2, '#5a4a3a', 0) + C(27.5, 50, 1.2, '#5a4a3a', 0) + C(36.5, 50, 1.2, '#5a4a3a', 0) +
        arrowB(c, 48, 59, 7, 9) + arrowB(c, 16, 59, 57, 9) +
        rays(32, 39, 10, 4, 11, '#fffbe0', 1.8, 0.95, 0.15) +
        burst(c, 32, 39, 7, 3, 8, ['#ffb030', '#fff0a0', '#ffffff']) +
        sparkle(18, 36, 2.6, '#ffffff') + sparkle(47, 36, 2.6, '#ffffff'));
    },
    /* druid: a big green leaf with a white plus, a fast bright healing swirl whipping round it */
    swiftmend: function (c) {
      var tf = 'translate(33,34) rotate(-24)';
      var sw = c.lg([[0, '#e8ffc0', 0.2], [1, '#ffffff', 0.95]], 0, 0, 1, 0);
      return iconWrap(c, ['#3a9a2a', '#041002'],
        glow(c, 32, 34, 32, '#c8ff90', 0.75) +
        G(P(trailE(0, 0, 26, 12, 190, 350, 1, 6), sw, 1.6), tf) +
        leaf(c, 20, 54, 40, 2.25, '#5ac83a') +
        F('M23,48 C26,40 32,32 40,26 C34,33 29,40 25,49 Z', '#ffffff', 0.35) +
        G(P(trailE(0, 0, 26, 12, -10, 170, 6, 1.5), sw, 1.6), tf) +
        S('M50,46 L60,44 M48,52 L58,52 M44,57 L52,58', '#f0ffe0', 1.8, 0.8) +
        plusS(16, 17, 8, '#ffffff', 4.4) +
        sparkle(52, 10, 3.2, '#ffffff') + sparkle(8, 40, 2.4, '#e8ffc0') + sparkle(56, 30, 2, '#e8ffc0'));
    },
    /* druid: a roaring bear head with red frenzied eyes, wrapped in a bright green healing glow */
    frenzied_regeneration: function (c) {
      var fur = '#6a4020', mz = '#b08050';
      var ho = 'M13,34 C13,22 21,15 32,15 C43,15 51,22 51,34 C51,46 43,54 32,54 C21,54 13,46 13,34 Z';
      return iconWrap(c, ['#2a8a2a', '#030c02'],
        glow(c, 32, 34, 34, '#aaff70', 0.85) +
        S(ho, '#c8ff90', 9, 0.4) +
        C(17, 19, 6.4, c.cel(fur), 2.2) + C(47, 19, 6.4, c.cel(fur), 2.2) + C(17, 19, 3.2, '#3a2010', 0) + C(47, 19, 3.2, '#3a2010', 0) +
        P(ho, c.cel(fur), 2.4) +
        S('M18,26 L21,28 M46,26 L43,28 M16,36 L19,37 M48,36 L45,37', dk(fur, 0.4), 1.3) +
        P('M22,27 L29,31 L28,33 L21,29 Z M42,27 L35,31 L36,33 L43,29 Z', OL, 1) +
        E(25.5, 32.5, 2.4, 1.8, '#ff4a1a', 1) + E(38.5, 32.5, 2.4, 1.8, '#ff4a1a', 1) +
        E(32, 44, 11, 8.4, c.cel(mz), 2) +
        E(32, 38.6, 4.4, 3, '#1a0a04', 1.4) +
        P('M24,43 C26,53 38,53 40,43 C36,45.4 28,45.4 24,43 Z', '#4a0808', 1.6) +
        P('M25.4,43.8 L27.2,48.4 L28.8,44.6 Z M38.6,43.8 L36.8,48.4 L35.2,44.6 Z', '#fffbe8', 0.9) +
        plusS(8, 10, 4.6, '#e8ffc0', 2.6) + plusS(56, 9, 4, '#e8ffc0', 2.4) + plusS(7, 50, 3.6, '#c8ff90', 2.2) + plusS(57, 50, 4.2, '#e8ffc0', 2.4) +
        S('M4,34 C2,26 6,18 10,20 M60,34 C62,26 58,18 54,20', '#c8ff90', 1.8, 0.7) +
        sparkle(32, 60, 2.6, '#ffffff'));
    },
    /* shaman: a war hammer wrapped in crackling blue lightning, slamming down in a storm burst */
    stormstrike: function (c) {
      var hm = P('M-2.6,30 L-2.6,-16 L2.6,-16 L2.6,30 Z', c.cel(WOOD), 2) + S('M-2.6,18 L2.6,20 M-2.6,23 L2.6,25 M-2.6,28 L2.6,30', LEATH, 1.6) +
        P('M-13,-32 L13,-32 L15,-28 L15,-18 L13,-14 L-13,-14 L-15,-18 L-15,-28 Z', c.lg(STEEL, 0, 0, 1, 0), 2.2) +
        P('M-15,-27 L-19,-25 L-19,-21 L-15,-19 Z M15,-27 L19,-25 L19,-21 L15,-19 Z', c.lg(STEEL, 0, 0, 1, 0), 1.6) +
        S('M-11,-29 L11,-29', '#ffffff', 1.3, 0.8) + R(-3.5, -27, 7, 8, c.cel('#4a8ad8'), 1.4);
      return iconWrap(c, ['#1a4aa8', '#020818'],
        glow(c, 26, 38, 30, '#8ad4ff', 0.85) +
        rays(11, 55, 10, 5, 13, '#e8f8ff', 1.8, 0.9, 0.3) +
        burst(c, 11, 55, 8, 3.4, 8, ['#4aa8ff', '#c8f0ff', '#ffffff']) +
        bolt(zig(18, 44, 10, 55, 2, 2.4), 2.4) + bolt(zig(26, 48, 24, 62, 3, 2.6, 2), 2) + bolt(zig(34, 46, 46, 58, 3, 2.6, 1), 1.8) +
        bolt(zig(56, 2, 38, 22, 4, 3.4), 1.6) +
        G(hm, 'translate(41.8,15.6) rotate(216.9) scale(0.95)') +
        bolt(zig(62, 10, 44, 18, 3, 2.6, 3), 1.6) + bolt(zig(14, 24, 20, 32, 2, 2, 1), 1.6) + bolt(zig(36, 44, 44, 38, 2, 1.8, 2), 1.6) +
        sparkle(50, 46, 3, '#ffffff') + sparkle(8, 10, 2.6, '#c8f0ff'));
    },
    /* shaman: a carved stone totem gushing a great curling blue wave of water from its mouth */
    mana_tide_totem: function (c) {
      var st = c.lg(['#8aa0b8', '#566a82', '#2a3446'], 0.2, 0, 0.8, 1), wv = c.lg(['#e8fbff', '#5ab8ff', '#1a4aa8'], 0, 0, 0.3, 1);
      var body = 'M15,60 L14,24 C14,20 18,18 23,18 C28,18 32,20 32,24 L31,60 Z';
      var wave = 'M28,64 C32,56 36,50 42,45 C48,40 49,32 46,26 C45,21 49,16 54,16 C60,16 63,22 62,29 C61,35 56,37 53,34 C56,32 56,28 53,27 C51,33 54,46 64,51 L64,64 Z';
      return iconWrap(c, ['#1a5ab0', '#020a18'],
        glow(c, 34, 36, 34, '#9ad8ff', 0.8) +
        S('M29,40 C36,38 40,34 44,30', '#c8f0ff', 9, 0.3) +
        P(body, st, 2.4) +
        S('M14.5,47 L31.5,47 M14.8,52 L31.2,52', OL, 1.6) + S('M15,49.5 L31,49.5', '#5ab8ff', 1.6) +
        P('M9,23 C9,14 37,14 37,23 L33,26 L13,26 Z', c.lg(['#a8bcd0', '#6a7e96', '#3a4458'], 0.2, 0, 0.8, 1), 2.2) +
        P('M16,15 L19,9 L23,14 L27,9 L30,15 Z', c.cel('#5ab8ff'), 1.6) +
        P('M16,30 L21,31.5 L21,33 L16,32 Z M30,30 L25,31.5 L25,33 L30,32 Z', OL, 0.8) +
        E(19, 34, 2, 1.3, '#bff4ff', 0.9) + E(27, 34, 2, 1.3, '#bff4ff', 0.9) +
        E(23, 41, 4.4, 3.6, '#0a1a2a', 1.8) +
        P(wave, wv, 2.4) +
        S('M42,45 C48,40 49,32 46,26', '#ffffff', 1.4, 0.7) +
        P('M23,39 C30,36 36,35 42,32 C44,38 40,44 34,46 C30,47 26,45 23,43 Z', wv, 2) +
        S('M26,40 C31,38 36,37 40,35', '#ffffff', 1.2, 0.8) +
        F('M0,60 C8,56 16,62 24,58 C32,54 40,62 48,58 C56,54 60,60 64,58 L64,64 L0,64 Z', c.lg(['#8ad4ff', '#2a6ac8'])) +
        S('M0,60 C8,56 16,62 24,58 C32,54 40,62 48,58 C56,54 60,60 64,58', OL, 1.8) +
        drop(56, 10, 0.9, '#bff4ff') + drop(40, 20, 0.8, '#bff4ff') + drop(8, 40, 0.7, '#bff4ff') +
        sparkle(38, 12, 2.8, '#ffffff') + sparkle(6, 10, 2.4, '#e8fbff'));
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
