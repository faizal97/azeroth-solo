/* art_icons4.js - more spell icons for Realm of Loner (18 keys, two per class: the level 20 and 24 abilities).
 * Loads AFTER art.js, art_icons2.js and art_icons3.js and EXTENDS window.ART: ART.icon handles the keys below and
 * falls through to the previous ART.icon for every other key. Keys are appended to ART.keys.icons. Self-contained:
 * art.js helpers are private, so the few needed here are re-implemented (same maths, same look). Never throws.
 * Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline, vignette +
 * bevel frame, no text, no filters. Gradient ids use the prefix i4<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i4' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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
  function pl(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join(''); }
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
  /* fist, knuckles up; col = glove/skin, cuff = wrist band */
  function fistG(c, x, y, s, col, cuff, rot) {
    return G(P('M-12,-8 C-12,-14 12,-14 13,-8 L14,8 C14,14 8,16 0,16 C-8,16 -13,12 -13,6 Z', c.cel(col), 2.2) +
      S('M-6,-12 L-6,-2 M0,-13 L0,-2 M6,-12 L6,-2', dk(col, 0.45), 1.4) + P('M-13,2 C-8,-2 2,-1 6,3 C4,7 -6,7 -13,6 Z', c.cel(lt(col, 0.1)), 1.8) +
      P('M-10,14 L10,14 L9,24 L-9,24 Z', c.cel(cuff || '#6a4a2e'), 2), 'translate(' + r1(x) + ',' + r1(y) + ')' + (rot ? ' rotate(' + rot + ')' : '') + ' scale(' + s + ')');
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
    /* broad two-handed axe (bigger bit than art.js's axe, so it reads as a cleaving swing) */
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
  /* crescent blade trail from a to b, bowing by k (outline + white core) */
  function swoosh(ax, ay, bx, by, k, col, w) {
    var mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / L, ny = dx / L;
    var c1x = mx + nx * k, c1y = my + ny * k, c2x = mx + nx * (k - w), c2y = my + ny * (k - w);
    var d = D`M${ax},${ay} Q${c1x},${c1y} ${bx},${by} Q${c2x},${c2y} ${ax},${ay} Z`;
    return P(d, col || '#fff4e8', 1.8);
  }
  /* ---- batch 2 parts ---- */
  function leaf(c, x, y, a, s, col) {
    col = col || '#6ab43a';
    return G(P('M0,0 C5,-4 5,-13 0,-18 C-5,-13 -5,-4 0,0 Z', c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 1, 0), 1.6) + S('M0,-1.5 L0,-15', dk(col, 0.45), 0.9),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + a + ') scale(' + s + ')');
  }
  /* stroked arc of a circle from angle a0 to a1 (degrees, 0 = right, clockwise), outline under a coloured core */
  function arc(cx, cy, r, a0, a1, col, w, o) {
    var p0 = [cx + Math.cos(a0 * Math.PI / 180) * r, cy + Math.sin(a0 * Math.PI / 180) * r], p1 = [cx + Math.cos(a1 * Math.PI / 180) * r, cy + Math.sin(a1 * Math.PI / 180) * r];
    var d = D`M${p0[0]},${p0[1]} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${p1[0]},${p1[1]}`;
    return S(d, OL, w + 2.6, o) + S(d, col, w, o);
  }
  /* merged cloud: every puff outlined first, then filled on top so the inner seams vanish */
  function cloud(c, puffs, col) {
    var a = '', b = '', f = c.cel(col);
    puffs.forEach(function (p) { a += C(p[0], p[1], p[2], OL, 0) + C(p[0], p[1], p[2] + 1.3, OL, 0); b += C(p[0], p[1], p[2], f, 0); });
    return a + b;
  }

  /* ---- batch 4 parts ---- */
  function plusS(x, y, r, col, w) { var d = D`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`; return S(d, OL, w + 2.6) + S(d, col, w); }
  /* small insect: dark body, two pale wings */
  function bug(x, y, a, s) {
    return G(E(-2.8, -1.4, 3, 1.6, '#f4ffe8', 0.7, 0.9, -40) + E(2.8, -1.4, 3, 1.6, '#f4ffe8', 0.7, 0.9, 40) +
      E(0, 0.6, 1.9, 2.8, '#1a2208', 0.9) + S('M-1.6,0.8 L1.6,0.8', '#d8f040', 0.9) + C(0, -2.8, 1.3, '#1a2208', 0),
      'translate(' + r1(x) + ',' + r1(y) + ') rotate(' + r1(a) + ') scale(' + s + ')');
  }
  /* open hand, fingers up (palm facing the viewer) */
  var HAND = 'M-8,16 L-9,0 C-10,-2 -13,-6 -14,-9 C-15,-12 -12,-14 -10,-12 L-6,-6 L-6,-20 C-6,-23 -2,-23 -2,-20 L-2,-9 L-1,-24 C-1,-27 3,-27 3,-24 L3,-9 L4,-22 C4,-25 8,-25 8,-22 L8,-8 L9,-17 C9,-20 13,-20 12.5,-17 L11.5,2 C11.5,8 9,12 8,16 Z';

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: a round steel-rimmed shield catching a sword blow, sparks at the rim */
    shield_block: function (c) {
      var cx = 28, cy = 39, r = 22, wd = '#b07a44';
      var face = D`M${cx - r},${cy} A${r},${r} 0 1 1 ${cx + r},${cy} A${r},${r} 0 1 1 ${cx - r},${cy} Z`;
      return iconWrap(c, ['#a8682c', '#1e0c04'],
        glow(c, 36, 24, 26, '#fff0b0', 0.55) +
        C(cx + 2.5, cy + 3, r, '#000', 0, 0.4) +
        C(cx, cy, r, c.cel(wd), 0) +
        CG(S('M13,10 L13,64 M21,10 L21,64 M29,10 L29,64 M37,10 L37,64 M45,10 L45,64', dk(wd, 0.5), 1.8, 0.9) +
          F(D`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx},${cy - r} L${cx},${cy - r + 6} A${r - 6},${r - 6} 0 0 0 ${cx - r + 6},${cy} Z`, '#ffffff', 0.22), c.clip(face)) +
        ring2(cx, cy, r - 1.6, r - 1.6, '#d0d6de', 3.2) + S('M8.5,32 A20.4,20.4 0 0 1 19,20', '#ffffff', 1.2, 0.85) +
        C(cx, cy, 8, c.lg(STEEL, 0.2, 0, 0.8, 1), 2.4) + C(cx - 2.2, cy - 2.2, 2.2, '#ffffff', 0, 0.85) +
        wpn(c, 'sword', 72, 0, -125, 0.95) +
        rays(34, 27, 10, 4, 15, '#fff6c0', 2, 0.95, 0.2) +
        burst(c, 34, 27, 8.5, 3.2, 8, ['#ff9a2a', '#ffe060', '#ffffff']) +
        C(50, 30, 1.5, '#ffe868', 0) + C(44, 14, 1.3, '#ffe868', 0) + C(54, 22, 1.1, '#fff6c0', 0) + C(24, 12, 1.2, '#fff6c0', 0) + C(16, 16, 1, '#ffe868', 0));
    },
    /* warrior: a horned helm, fanged mouth wide open in a roar, red shockwave rings */
    intimidating_shout: function (c) {
      var w = arc(32, 44, 24, -60, 20, '#ff5a3a', 2.6) + arc(32, 44, 24, 160, 240, '#ff5a3a', 2.6) +
        arc(32, 44, 30, -55, 15, '#e02a1a', 2.2, 0.8) + arc(32, 44, 30, 165, 235, '#e02a1a', 2.2, 0.8);
      var jaw = 'M17,28 L47,28 C49,40 45,54 32,58 C19,54 15,40 17,28 Z';
      return iconWrap(c, ['#b02a18', '#1a0302'],
        glow(c, 32, 44, 30, '#ff7050', 0.55) + w +
        P('M16,22 C10,20 6,14 5,4 C10,10 14,12 20,14 Z M48,22 C54,20 58,14 59,4 C54,10 50,12 44,14 Z', c.lg(['#fff4dc', '#d8c8a4', '#8a7a5a'], 0, 0, 0, 1), 2) +
        P(jaw, c.cel('#c8905a'), 2.4) +
        P('M14,28 C14,14 22,8 32,8 C42,8 50,14 50,28 L50,31 L14,31 Z', c.lg(STEEL, 0.2, 0, 0.8, 1), 2.4) +
        S('M32,9 L32,30', '#7c8793', 1.6) + F('M17,26 C17,16 23,11 30,10 C24,14 21,19 21,27 Z', '#ffffff', 0.4) +
        P('M19,33 L29,36 L28,39 L20,37 Z M45,33 L35,36 L36,39 L44,37 Z', '#2a0806', 1.2) + C(25, 37, 1.3, '#ff3a2a', 0) + C(39, 37, 1.3, '#ff3a2a', 0) +
        E(32, 48, 9, 7.5, '#240404', 2.2) + E(32, 51, 5.5, 3.5, '#8a1a1a', 0) +
        P('M24,43 L27,47 L29,43 L32,47 L35,43 L37,47 L40,43 Z', '#fff4dc', 1) +
        P('M25,54 L26.5,47 L28.5,54 Z M39,54 L37.5,47 L35.5,54 Z', '#fff4dc', 1.2));
    },
    /* mage: an open hand throwing a widening fan of frost */
    cone_of_cold: function (c) {
      var ax = 20, ay = 44, a0 = -80 * Math.PI / 180, a1 = -8 * Math.PI / 180, L = 58;
      var p0 = [ax + Math.cos(a0) * L, ay + Math.sin(a0) * L], p1 = [ax + Math.cos(a1) * L, ay + Math.sin(a1) * L];
      var cone = D`M${ax},${ay} L${p0[0]},${p0[1]} A${L},${L} 0 0 1 ${p1[0]},${p1[1]} Z`;
      var streaks = '', fl = '', i;
      for (i = 0; i < 6; i++) { var a = (-72 + i * 12.5) * Math.PI / 180; streaks += D`M${ax + Math.cos(a) * 8},${ay + Math.sin(a) * 8} L${ax + Math.cos(a) * 52},${ay + Math.sin(a) * 52}`; }
      var sp = [[-62, 30, 0.34], [-40, 38, 0.4], [-18, 30, 0.34], [-52, 18, 0.26], [-28, 20, 0.26]];
      for (i = 0; i < sp.length; i++) { var b = sp[i][0] * Math.PI / 180; fl += shard(c, ax + Math.cos(b) * sp[i][1], ay + Math.sin(b) * sp[i][1], sp[i][0] + 90, sp[i][2], '#d8f6ff'); }
      return iconWrap(c, ['#3a80d0', '#040e28'],
        glow(c, 40, 22, 30, '#9fe0ff', 0.6) +
        P(cone, c.rg([[0, '#ffffff', 0.95], [0.35, '#bfefff', 0.8], [0.8, '#6ac0f0', 0.35], [1, '#6ac0f0', 0.1]], 0, 1, 1.1), 2.2) +
        S(streaks, '#ffffff', 1.4, 0.55) + fl +
        sparkle(46, 12, 4, '#ffffff') + sparkle(54, 30, 3.4, '#ffffff') + sparkle(32, 8, 3, '#e8fbff') +
        G(P(HAND, c.lg(['#e8f6ff', '#b8d8f0', '#6a90b8'], 0.2, 0, 0.8, 1), 2.2) + S('M-4,-4 L-4,4 M0,-6 L0,4 M4,-5 L4,4', '#5a7ea8', 1, 0.6) +
          P('M-9,14 L9,14 L8,24 L-8,24 Z', c.cel('#4a5ab0'), 2), 'translate(16,50) rotate(44) scale(0.82)') +
        C(ax + 2, ay - 2, 6, c.rg([[0, '#ffffff'], [1, '#bfefff', 0]]), 0));
    },
    /* mage: a small white-hot blast searing a scorched patch into the ground */
    scorch: function (c) {
      var gr = 'M0,36 C16,34 48,34 64,36 L64,64 L0,64 Z';
      var cr = 'M32,46 L18,56 L10,54 M32,46 L42,57 L40,64 M32,46 L54,50 L62,56 M32,46 L4,44 M32,46 L26,62 M32,46 L60,41';
      var lick = flameC(12, 44, 0.3, FIRE) + flameC(52, 44, 0.3, FIRE) + flameC(20, 50, 0.26, FIRE) + flameC(45, 51, 0.26, FIRE);
      return iconWrap(c, ['#c0440e', '#1e0400'],
        glow(c, 32, 40, 28, '#ffb040', 0.55) +
        S('M16,26 C14,22 18,19 16,15 M48,26 C46,22 50,19 48,15 M32,20 C30,16 34,13 32,9 M24,16 C22,12 26,10 24,6 M40,16 C38,12 42,10 40,6', '#ffe0a0', 1.8, 0.6) +
        P(gr, c.lg(['#5a3a2a', '#3a2418', '#1e120c']), 2.2) +
        E(32, 46, 27, 9.5, '#0e0604', 0, 0.95) +
        CG(S(cr, OL, 3.6) + S(cr, '#ff8a1a', 1.8), c.clip(gr)) +
        E(32, 46, 21, 7, c.rg([[0, '#ffffff'], [0.3, '#fff0a0'], [0.65, '#ff9a1f'], [1, '#c8300a']]), 2) +
        lick +
        C(32, 42, 11, c.rg([[0, '#ffffff'], [0.4, '#fff6c0', 0.9], [1, '#ffb040', 0]]), 0) +
        P(star(32, 42, 6, 8, 3.2, 0.25), '#fffbe0', 1.4) +
        C(10, 26, 1.5, '#ffe868', 0) + C(54, 24, 1.4, '#ffe868', 0) + C(20, 32, 1.1, '#ffd060', 0) + C(44, 30, 1.2, '#ffd060', 0) + C(36, 24, 1, '#ffe868', 0));
    },
    /* priest: a tall white-gold flame inside a holy sunburst and halo */
    holy_fire: function (c) {
      var hf = ['#f0a020', '#ffe070', '#ffffff'];
      return iconWrap(c, ['#c8901c', '#2a1402'],
        rays(32, 34, 16, 18, 31, '#fff4c0', 2.2, 0.75) + glow(c, 32, 34, 30, '#fff0a0', 0.9) +
        ring2(32, 32, 21, 21, '#fff2a0', 2.2, 0.9) +
        flameC(32, 38, 1.2, hf) +
        S('M32,16 C35,24 38,28 38,36', '#ffffff', 1.6, 0.8) +
        flameC(14, 50, 0.4, hf) + flameC(50, 50, 0.4, hf) +
        sparkle(12, 12, 4.5, '#ffffff') + sparkle(53, 12, 4, '#ffffff') + sparkle(32, 55, 3, '#ffffff'));
    },
    /* priest: a pale silhouette that fades out to the right and breaks into drifting mist */
    fade: function (c) {
      var body = 'M8,64 C8,46 16,38 28,38 C40,38 48,46 48,64 Z';
      var fill = c.lg([[0, '#f0ecff', 0.95], [0.4, '#c8bcf0', 0.75], [0.8, '#9888c8', 0.18], [1, '#9888c8', 0]], 0, 0, 1, 0);
      var line = c.lg([[0, OL, 1], [0.45, OL, 0.8], [0.85, OL, 0]], 0, 0, 1, 0);
      var bits = '', i, pts = [[40, 26, 2.4, 0.6], [46, 20, 2, 0.5], [50, 30, 1.8, 0.45], [44, 44, 2.2, 0.5], [52, 40, 1.6, 0.4], [56, 22, 1.4, 0.35],
        [48, 52, 1.8, 0.4], [56, 48, 1.3, 0.3], [58, 34, 1.2, 0.3], [40, 14, 1.6, 0.4], [52, 12, 1.1, 0.3]];
      for (i = 0; i < pts.length; i++) bits += C(pts[i][0], pts[i][1], pts[i][2], '#e8e0ff', 0, pts[i][3]);
      return iconWrap(c, ['#5a4a80', '#07050e'],
        glow(c, 28, 32, 28, '#c8b8ff', 0.45) +
        P(body, fill, 0) + C(28, 24, 11, fill, 0) +
        S(body, line, 2.4) + '<circle cx="28" cy="24" r="11" fill="none" stroke="' + line + '" stroke-width="2.4"/>' +
        F('M11,62 C12,48 18,42 26,40 C20,44 16,52 16,62 Z M19,20 C20,15 24,13 28,13 C24,16 22,19 21,24 Z', '#ffffff', 0.45) +
        S('M36,30 C44,28 48,22 58,24 M38,46 C46,44 50,50 60,46 M34,58 C42,56 48,60 58,58 M36,16 C42,12 48,16 56,12', '#e8e0ff', 2, 0.4) +
        bits);
    },
    /* rogue: yellow eyes glinting under a hood in the dark, a dagger lunging out */
    ambush: function (c) {
      var hood = 'M2,50 C2,26 10,6 26,6 C40,6 46,18 46,30 C46,40 40,46 34,50 Z';
      return iconWrap(c, ['#4a3450', '#050306'],
        glow(c, 46, 48, 20, '#c8c0e0', 0.4) +
        P(hood, c.lg(['#3a3046', '#1e1826', '#0a080e'], 0.2, 0, 0.8, 1), 2.4) +
        F('M10,40 C10,26 16,16 26,16 C36,16 40,24 40,32 C40,40 34,44 28,46 Z', '#050308', 0.95) +
        F('M6,40 C6,24 12,12 24,9 C16,16 12,26 12,40 Z', '#ffffff', 0.12) +
        C(24, 29, 9, c.rg([[0, '#ffe060', 0.55], [1, '#ffe060', 0]]), 0) +
        P('M16,28 C18,25 22,25 23,29 C21,31 18,31 16,28 Z M26,29 C27,25 31,25 33,28 C31,31 28,31 26,29 Z', '#ffe23a', 1.2) +
        C(20, 28.4, 1.1, '#140a00', 0) + C(29, 28.4, 1.1, '#140a00', 0) +
        S('M14,52 L30,60 M20,46 L36,56 M30,40 L42,46', '#e0d8f0', 1.6, 0.45) +
        wpn(c, 'dagger', 29, 39, 125, 1.4) +
        sparkle(50, 52, 5.5, '#ffffff'));
    },
    /* rogue: two crossed blades whirling, afterimages and spin arcs around them */
    blade_flurry: function (c) {
      var sw = wpn(c, 'sword', 18, 47, 45, 0.9) + wpn(c, 'sword', 46, 47, -45, 0.9);
      return iconWrap(c, ['#a0402a', '#1a0404'],
        glow(c, 32, 30, 30, '#ffb080', 0.55) +
        G(sw, 'rotate(-36 32 32)', 0.16) + G(sw, 'rotate(-24 32 32)', 0.28) + G(sw, 'rotate(-12 32 32)', 0.45) +
        swoosh(4, 36, 36, 3, 13, '#ffffff', 7) + swoosh(60, 28, 28, 61, 13, '#ffffff', 7) +
        sw + burst(c, 32, 29, 6, 2.5, 8, ['#ff9a2a', '#ffd060', '#fff6c0']));
    },
    /* paladin: a ring of glowing holy runes laid flat on the ground, light rising from it */
    consecration: function (c) {
      var cx = 32, cy = 46, rx = 26, ry = 10;
      var runes = '', i, R_ = ['M-2,-3 L-2,3 M-2,-3 L2,-1 L-2,1', 'M-2,-3 L2,3 M2,-3 L-2,3', 'M0,-3 L0,3 M-2,-1 L2,-1', 'M-2,3 L0,-3 L2,3', 'M-2,-3 L2,-3 L-2,3 L2,3', 'M0,-3 L0,3 M0,-1 L2,-3 M0,1 L-2,3'];
      for (i = 0; i < 10; i++) {
        var a = i / 10 * Math.PI * 2 + 0.2, x = cx + Math.cos(a) * (rx - 5), y = cy + Math.sin(a) * (ry - 2), d = R_[i % R_.length], s = 0.9 + Math.sin(a) * 0.25;
        runes += G(S(d, OL, 2.8) + S(d, '#fff6c0', 1.3), 'translate(' + r1(x) + ',' + r1(y) + ') scale(' + r1(s * 1.2) + ',' + r1(s * 0.8) + ')');
      }
      return iconWrap(c, ['#d09a30', '#2a1402'],
        glow(c, 32, 30, 30, '#ffe68a', 0.6) +
        F('M0,34 C16,32 48,32 64,34 L64,64 L0,64 Z', '#2a1606', 0.75) +
        F(D`M${cx - rx + 2},${cy} L${cx - rx + 8},6 L${cx + rx - 8},6 L${cx + rx - 2},${cy} Z`, c.lg([[0, '#fffbe0', 0], [0.6, '#fff4c0', 0.35], [1, '#fff4c0', 0.6]]), 1) +
        S('M16,44 L14,16 M26,48 L25,10 M38,48 L39,12 M48,44 L50,18', '#ffffff', 1.8, 0.5) +
        E(cx, cy, rx, ry, c.rg([[0, '#ffffff', 0.95], [0.4, '#fff0a0', 0.8], [0.85, '#ffc040', 0.55], [1, '#ffc040', 0.2]]), 0) +
        ring2(cx, cy, rx, ry, '#ffe060', 2.6) + ring2(cx, cy, rx - 11, ry - 4.5, '#fff4b0', 1.6, 0.9) +
        runes + P(star(cx, cy, 4, 5, 1.6), '#ffffff', 1.2) +
        sparkle(12, 12, 4, '#ffffff') + sparkle(52, 14, 3.5, '#ffffff') + sparkle(32, 22, 3, '#ffffff'));
    },
    /* paladin: an open book of scripture with a blue mana glow and gold light rising from its pages */
    blessing_wisdom: function (c) {
      var pg = c.lg(['#fffbee', '#f0e2c0', '#c8b088'], 0, 0, 0, 1);
      return iconWrap(c, ['#2a5ab8', '#050c26'],
        rays(32, 26, 14, 10, 30, '#ffe68a', 2, 0.7) + glow(c, 32, 26, 30, '#8ad8ff', 0.8) +
        P('M4,44 C14,40 24,42 32,48 C40,42 50,40 60,44 L60,54 C50,50 40,52 32,58 C24,52 14,50 4,54 Z', c.cel('#2a3a8a'), 2.2) +
        P('M7,42 C16,37 25,39 32,45 L32,54 C25,48 16,46 7,50 Z', pg, 2) + P('M57,42 C48,37 39,39 32,45 L32,54 C39,48 48,46 57,50 Z', pg, 2) +
        S('M12,43 C17,41 22,42 27,45 M12,46.5 C17,44.5 22,45.5 27,48.5 M37,45 C42,42 47,41 52,43 M37,48.5 C42,45.5 47,44.5 52,46.5', '#a08a60', 1.1, 0.8) +
        S('M32,45 L32,54', '#8a7050', 1.2) +
        C(32, 26, 11, c.rg([[0, '#ffffff'], [0.45, '#bfefff', 0.95], [1, '#3a9ae0', 0]]), 0) +
        C(32, 26, 6.5, c.rg([[0, '#ffffff'], [0.6, '#dff8ff'], [1, '#6ac8ff']]), 1.8) + sparkle(32, 26, 5, '#ffffff') +
        S('M26,40 C24,36 28,34 26,30 M38,40 C40,36 36,34 38,30', '#bff4ff', 1.6, 0.8) +
        sparkle(12, 14, 4, '#ffe68a') + sparkle(52, 14, 4, '#ffe68a') + sparkle(16, 30, 2.6, '#bff4ff') + sparkle(48, 30, 2.6, '#bff4ff'));
    },
    /* warlock: a spiky burst of violet shadow flame with green embers */
    shadowburn: function (c) {
      var sf = ['#5a148a', '#b04af0', '#f0c8ff'];
      return iconWrap(c, ['#3a1060', '#040108'],
        glow(c, 32, 34, 30, '#b050f0', 0.7) +
        burst(c, 32, 36, 30, 12, 11, ['#200630', '#6a1aa0', '#b04af0']) +
        flameC(32, 32, 1.12, sf) + flameC(16, 44, 0.5, sf) + flameC(48, 44, 0.5, sf) +
        C(32, 44, 6.5, c.rg([[0, '#e8ffd0'], [0.5, '#80ff60', 0.8], [1, '#40c030', 0]]), 0) +
        C(12, 18, 2, '#8aff5a', 1) + C(52, 16, 1.8, '#8aff5a', 1) + C(56, 34, 1.5, '#b0ff90', 0) + C(8, 34, 1.5, '#b0ff90', 0) + C(22, 10, 1.3, '#b0ff90', 0) + C(44, 58, 1.4, '#8aff5a', 0));
    },
    /* warlock: a shadow coil spiralling out into a flying skull */
    death_coil: function (c) {
      var pts = [], i, n = 40, cx = 26, cy = 38;
      for (i = 0; i <= n; i++) { var t = i / n, a = t * Math.PI * 2.6 + 2.2, r = 2 + t * 17; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      var sp = pts.map(function (p, j) { return (j ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join('');
      var end = pts[n];
      return iconWrap(c, ['#3a1458', '#040108'],
        glow(c, 28, 36, 28, '#a050e0', 0.55) +
        S(sp, OL, 8) + S(sp, c.lg(['#e0a0ff', '#8a30d0', '#3a0a60'], 1, 0, 0, 1), 5) + S(sp, '#f4d8ff', 1.4, 0.7) +
        S(D`M${end[0]},${end[1]} C${end[0] + 6},${end[1] - 6} 40,18 44,18`, OL, 8) + S(D`M${end[0]},${end[1]} C${end[0] + 6},${end[1] - 6} 40,18 44,18`, '#c070ff', 5) +
        C(46, 18, 14, c.rg([[0, '#e0a0ff', 0.8], [1, '#8a30d0', 0]]), 0) +
        skullG(c, 46, 20, 0.78, '#e8dcf0', '#c070ff') +
        S('M34,6 L40,10 M58,30 L54,32 M60,12 L56,14', '#e0a0ff', 1.6, 0.7));
    },
    /* hunter: a hawk's head in profile, hooked beak, on amber */
    aspect_hawk: function (c) {
      var head = 'M56,64 C58,50 56,34 48,22 C42,12 32,8 24,10 C18,12 14,16 12,20 L20,32 C22,40 24,46 28,52 C30,56 30,60 30,64 Z';
      var beak = 'M24,14 C14,12 6,18 5,28 C5,32 6,35 8,37 C9,33 12,30 17,31 L24,30 Z';
      return iconWrap(c, ['#d08a1c', '#241002'],
        glow(c, 30, 28, 30, '#ffd070', 0.7) +
        P(head, c.lg(['#a86a34', '#7a4a22', '#4a2a12'], 0.2, 0, 0.8, 1), 2.4) +
        P('M16,26 C22,30 30,32 34,40 C30,44 28,50 30,58 C24,48 20,38 16,26 Z', c.cel('#f0e2c4'), 1.8) +
        S('M40,30 C44,38 46,46 46,56 M48,26 C52,34 54,44 54,54 M36,40 C38,46 38,52 38,60', '#3a200c', 1.4, 0.7) +
        P(beak, c.lg(['#ffe070', '#f0b030', '#a86a14'], 0, 0, 1, 1), 2.2) + S('M8,34 C10,30 14,28 20,28', '#6a4010', 1.2, 0.8) + S('M22,20 L20,22', OL, 1.4) +
        P('M22,18 C28,12 38,14 42,18 C36,17 30,18 26,22 Z', '#3a200c', 1.2) +
        C(31, 22, 4.6, c.rg([[0, '#ffe860'], [1, '#e89a10']]), 1.8) + C(31.5, 22, 2.2, '#140800', 0) + C(30, 20.8, 0.9, '#ffffff', 0) +
        sparkle(52, 10, 3.6, '#fff4c8'));
    },
    /* hunter: a grey figure lying still on the ground, a small skull hovering over it */
    feign_death: function (c) {
      var fig = 'M13,38 L20,38 C24,35 30,35 36,36 L50,37 C54,37 57,39 58,41 L58,44 L36,45 C30,46 24,46 20,44 L13,44 Z';
      return iconWrap(c, ['#6a6a5a', '#0e0e0a'],
        glow(c, 34, 28, 28, '#d8e0d0', 0.4) +
        F('M0,44 C16,42 48,42 64,44 L64,64 L0,64 Z', '#2a2418', 0.85) + E(34, 46, 26, 4, '#000', 0, 0.45) +
        G(P(fig, c.cel('#8a8a82'), 2.2) + S('M36,36.5 L36,45 M20,38 L20,44', '#5a5a52', 1.2, 0.8) +
          C(11, 40, 6, c.cel('#a8a89e'), 2.2) + S('M8,37 L11,40 M11,37 L8,40', OL, 1.4) +
          S('M52,37 C54,33 56,33 58,34', OL, 2.4) + S('M52,37 C54,33 56,33 58,34', '#8a8a82', 1), 'translate(35,43) scale(1.02,1.3) translate(-35,-41)') +
        S('M24,30 C22,26 26,24 24,20 M30,30 C28,26 32,24 30,20', '#e0e8d8', 1.4, 0.5) +
        C(40, 17, 12, c.rg([[0, '#e8f0d8', 0.6], [1, '#c8d0b8', 0]]), 0) +
        skullG(c, 40, 18, 0.6, '#e8e4d8', null));
    },
    /* druid: a falling star trailing violet-pink starlight */
    starfire: function (c) {
      var tr = 'M14,36 C28,20 44,8 64,-2 L66,8 C48,16 34,30 26,50 Z';
      return iconWrap(c, ['#8a3ac0', '#10041c'],
        glow(c, 22, 42, 28, '#ffc0f0', 0.7) +
        P(tr, c.lg([[0, '#ffe0f8', 0.95], [0.5, '#e070e0', 0.6], [1, '#8a3ac0', 0]], 0, 1, 1, 0), 0) +
        S('M20,40 C32,26 46,14 62,4', '#ffffff', 1.8, 0.7) + S('M24,46 C36,32 48,20 62,12', '#ffc8f4', 1.2, 0.6) +
        rays(20, 42, 10, 15, 24, '#ffe8fc', 1.6, 0.6, 0.1) +
        P(star(20, 42, 5, 14, 6, 0.3), c.lg(['#ffffff', '#ffd8f8', '#e070d0'], 0.2, 0, 0.8, 1), 2.4) +
        F(star(20, 42, 5, 7, 3, 0.3), '#ffffff', 0.9) +
        sparkle(40, 22, 3.5, '#ffffff') + sparkle(52, 34, 3, '#ffe0fa') + sparkle(34, 10, 2.6, '#ffe0fa') + sparkle(54, 54, 3, '#ffe0fa') + sparkle(8, 12, 2.6, '#ffffff'));
    },
    /* druid: a green haze full of buzzing insects */
    insect_swarm: function (c) {
      var bugs = [[16, 18, 30, 1.1], [28, 12, -20, 1], [42, 16, 50, 1.2], [52, 26, 10, 1], [22, 30, -40, 1.3], [36, 28, 20, 1.5], [48, 40, -60, 1.2],
        [12, 42, 70, 1], [26, 46, 0, 1.2], [40, 50, 40, 1], [54, 52, -30, 0.9], [32, 38, -80, 1.1], [18, 56, 20, 0.9], [8, 28, -10, 0.8], [56, 12, 30, 0.8], [44, 34, 90, 0.9]];
      var b = '', i; for (i = 0; i < bugs.length; i++) b += bug(bugs[i][0], bugs[i][1], bugs[i][2], bugs[i][3]);
      return iconWrap(c, ['#3a7a1c', '#040c02'],
        C(32, 34, 28, c.rg([[0, '#c8f080', 0.5], [0.5, '#8ad040', 0.3], [1, '#4a8a24', 0]]), 0) +
        S('M8,36 C14,20 30,16 40,24 C48,30 44,42 34,40 M56,48 C50,58 34,60 24,52', '#e8ffc0', 1.6, 0.45) + b);
    },
    /* shaman: a small curling wave under a big green-white healing plus */
    lesser_healing_wave: function (c) {
      var wv = 'M0,50 C8,42 18,38 28,42 C36,45 38,52 32,55 C28,57 24,54 27,51 C34,56 44,56 50,50 C54,46 58,45 64,46 L64,64 L0,64 Z';
      return iconWrap(c, ['#10789a', '#020e18'],
        glow(c, 32, 26, 28, '#c0f4ff', 0.8) +
        P(wv, c.lg(['#bff4ff', '#3aa8d8', '#0a4a7a']), 2.2) + S('M4,48 C12,42 20,40 28,43', '#ffffff', 1.6, 0.85) + S('M36,54 C42,54 46,52 50,49', '#ffffff', 1.2, 0.7) +
        C(12, 40, 1.6, '#dff8ff', 0.8) + C(20, 36, 1.2, '#dff8ff', 0.8) + C(54, 42, 1.3, '#dff8ff', 0.8) +
        P('M27,8 L37,8 L37,19 L48,19 L48,29 L37,29 L37,40 L27,40 L27,29 L16,29 L16,19 L27,19 Z', c.lg(['#ffffff', '#bff4ff', '#3ab0e0'], 0.2, 0, 0.8, 1), 2.4) +
        F('M30,11 L34,11 L34,22 L45,22 L45,26 L34,26 L34,37 L30,37 L30,26 L19,26 L19,22 L30,22 Z', '#ffffff', 0.7) +
        sparkle(10, 14, 3.4, '#ffffff') + sparkle(54, 12, 3, '#ffffff'));
    },
    /* shaman: a squat carved stone totem at the heart of an expanding ring of fire */
    fire_nova_totem: function (c) {
      var back = '', front = '', i, st = '#9a5a3a';
      for (i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2 + 0.26, x = 32 + Math.cos(a) * 27, y = 48 + Math.sin(a) * 9, f = flameC(x, y - 4, 0.42, FIRE);
        if (Math.sin(a) < 0) back += f; else front += f;
      }
      var stone = c.lg([lt(st, 0.3), st, dk(st, 0.45)], 0, 0, 1, 0);
      return iconWrap(c, ['#c8400c', '#200400'],
        glow(c, 32, 40, 30, '#ffb040', 0.75) +
        E(32, 48, 30, 10, '#240600', 0, 0.6) + ring2(32, 48, 27, 9, '#ff9a1f', 2.6) + ring2(32, 48, 19, 6, '#ffe868', 1.6, 0.7) + back +
        P('M22,50 L23,22 L41,22 L42,50 Z', stone, 2.4) +
        P('M20,24 L22,12 L42,12 L44,24 Z', stone, 2.2) +
        P('M24,16 L30,16 L29,20 L25,20 Z M40,16 L34,16 L35,20 L39,20 Z', '#ffd040', 1) + S('M26,23 L38,23', dk(st, 0.5), 1.4) +
        S('M26,30 L38,30 M26,38 L38,38', dk(st, 0.5), 1.4) + C(32, 34, 3.2, c.rg([[0, '#ffffff'], [0.5, '#ffe060'], [1, '#ff7a14']]), 1.4) +
        P('M14,18 L20,20 L20,26 Z M50,18 L44,20 L44,26 Z', c.cel(st), 1.6) +
        F('M23,24 L28,24 L28,48 L23,48 Z', '#ffffff', 0.14) +
        flameC(32, 10, 0.34, FIRE) + front);
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
