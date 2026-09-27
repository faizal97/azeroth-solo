/* art_icons2.js - extra ability icons for Azeroth Solo (34 keys, batch 1 + batch 2, a few per class).
 * Loads AFTER art.js and EXTENDS window.ART: ART.icon handles the keys below and falls through to the previous
 * ART.icon for every other key. Keys are appended to ART.keys.icons. Self-contained: art.js helpers are private,
 * so the few needed here are re-implemented (same maths, same look). Never throws.
 * Style matches art.js icons: 64x64, school-tinted radial background, bold glyph, #1a1009 outline, vignette +
 * bevel frame, no text, no filters. Gradient ids use the prefix i2<counter>_ so they never collide.
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

  function Ctx() { this.u = 'i2' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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
  function mace(c) {
    return P('M-2.6,24 L-2.6,-14 L2.6,-14 L2.6,24 Z', c.cel(WOOD), 2) + S('M-2.6,12 L2.6,14 M-2.6,17 L2.6,19 M-2.6,22 L2.6,24', LEATH, 1.6) + C(0, 26, 3.4, c.cel(GOLD), 1.8) +
      P('M-8,-27 L-16,-22 L-8,-17 Z M8,-27 L16,-22 L8,-17 Z M-4,-29 L0,-38 L4,-29 Z', c.lg(STEEL, 0, 0, 1, 0), 1.8) +
      C(0, -22, 8.5, c.lg(STEEL, 0.2, 0, 0.8, 1), 2.2) + P('M-6,-15 L6,-15 L4,-11 L-4,-11 Z', c.cel(GOLD), 1.6) + C(-2.5, -25, 2.4, '#ffffff', 0, 0.7);
  }
  function stun(x, y, r) { return P(star(x, y, 5, r, r * 0.45), '#ffe23a', 1.4) + F(star(x, y, 5, r * 0.5, r * 0.22), '#fffbd0'); }
  function drip(x, y, len, s) { return S(D`M${x},${y} L${x},${y + len}`, OL, 4.6 * s) + S(D`M${x},${y} L${x},${y + len}`, '#d8141a', 2.4 * s) + drop(x, y + len + 3 * s, s); }

  /* ================= the icons ================= */
  var NEW = {
    /* warrior: blade cut across the back of the calf, shackle and chain at the ankle for the slow */
    hamstring: function (c) {
      var leg = 'M22,2 C14,10 11,20 14,30 C16,38 21,42 22,47 L20,54 C19,59 22,60 26,60 L52,60 C57,60 58,54 53,52 L38,47 C36,40 37,30 39,22 C41,14 41,8 40,2 Z';
      var link = function (x, y, rx, ry) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + OL + '" stroke-width="5.2"/>' +
        '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#d8dde4" stroke-width="2.6"/>'; };
      var body = P(leg, c.cel('#d8a878'), 2.6) +
        CG(F('M0,43 L64,43 L64,64 L0,64 Z', c.cel('#5a3a24')) + S('M0,43 L64,43', OL, 2.2) + F('M22,2 C14,10 11,20 14,30 C16,38 21,42 22,47 L26,47 C22,40 18,30 21,18 C23,10 25,6 27,2 Z', '#ffffff', 0.25) +
          S('M4,18 L44,34', OL, 6.4) + S('M4,18 L44,34', '#e0141c', 3.6) + S('M8,19 L40,32', '#ff9a8a', 1, 0.8), c.clip(leg)) +
        ring2(30, 44, 10.5, 3.6, '#d8dde4', 3.4);
      return iconWrap(c, ['#b04a2a', '#240806'],
        glow(c, 34, 24, 26, '#ffb080', 0.5) +
        G(body, 'translate(10,2) scale(0.92)') +
        S('M2,4 C14,12 30,20 60,28', '#ffffff', 5, 0.35) + swoosh(2, 6, 60, 30, 9, '#ffffff', 7) +
        link(21, 56, 5.4, 3.2) + S('M12,56 L10,56', OL, 5.2) + S('M13.5,56 L8.5,56', '#d8dde4', 2.6) + link(4, 56, 5.4, 3.2) +
        drop(18, 40, 1.1) + drop(24, 46, 0.8));
    },
    /* warrior: a great axe sweeping one arc through two foes */
    cleave: function (c) {
      var foe = function (x) { return P(D`M${x - 12},64 C${x - 12},52 ${x - 8},48 ${x},48 C${x + 8},48 ${x + 12},52 ${x + 12},64 Z`, c.cel('#8a6a64'), 2.2) + C(x, 41, 6.5, c.cel('#8a6a64'), 2.2); };
      var arc = 'M3,48 C8,12 56,12 61,48 C52,26 12,26 3,48 Z';
      return iconWrap(c, ['#c05828', '#2a0a04'],
        glow(c, 32, 24, 28, '#ffc070', 0.55) +
        foe(12) + foe(52) +
        P(arc, c.lg(['#ffffff', '#fff0c0', '#ffb040'], 0, 0, 1, 0), 2.2) + S('M8,40 C14,22 50,22 56,40', '#ffffff', 1.4, 0.8) +
        burst(c, 12, 38, 10, 4, 8, ['#ff9a2a', '#ffd060', '#fff6c0']) + burst(c, 52, 38, 10, 4, 8, ['#ff9a2a', '#ffd060', '#fff6c0']) +
        wpn(c, 'greataxe', 30, 48, 0, 1.0));
    },
    /* mage: ring of ice spikes bursting outward */
    frost_nova: function (c) {
      var sp = '', i, a;
      for (i = 0; i < 8; i++) { a = i * 45 + 22.5; var rr = a / 180 * Math.PI; sp += shard(c, 32 + Math.sin(rr) * 17, 32 - Math.cos(rr) * 17, a, 0.52); }
      for (i = 0; i < 8; i++) { a = i * 45; var rb = a / 180 * Math.PI; sp += shard(c, 32 + Math.sin(rb) * 13, 32 - Math.cos(rb) * 13, a, 0.34, '#d8f6ff'); }
      return iconWrap(c, ['#3a80d0', '#040e28'],
        glow(c, 32, 32, 30, '#9fe0ff', 0.7) + ring2(32, 32, 24, 24, '#bfefff', 1.4, 0.6) + sp +
        C(32, 32, 8, c.rg([[0, '#ffffff'], [0.6, '#dff8ff'], [1, '#7ac8f0']]), 1.8) + sparkle(32, 32, 6, '#ffffff'));
    },
    /* mage: violet shockwave from the centre */
    arcane_explosion: function (c) {
      return iconWrap(c, ['#8a40d8', '#140428'],
        glow(c, 32, 32, 30, '#e0a0ff', 0.8) +
        ring2(32, 32, 26, 26, '#f0a8ff', 1.6, 0.55) + ring2(32, 32, 20, 20, '#e080ff', 2.4, 0.85) +
        rays(32, 32, 12, 9, 29, '#ffe0ff', 1.8, 0.7, 0.13) +
        burst(c, 32, 32, 17, 7, 8, ['#c050ff', '#f0a8ff', '#ffffff']) +
        sparkle(12, 14, 4, '#ffe0ff') + sparkle(52, 50, 4, '#ffe0ff') + sparkle(50, 12, 3, '#ffffff'));
    },
    /* priest: shadow burst inside a head in profile */
    mind_blast: function (c) {
      var head = 'M18,62 L20,50 C12,44 10,34 12,26 C14,14 24,8 34,8 C46,8 52,18 52,28 L56,36 L52,38 L52,44 C52,48 48,49 44,48 L42,56 L44,62 Z';
      var cr = 'M31,24 L22,16 M31,24 L40,14 M31,24 L46,26 M31,24 L20,32 M31,24 L34,38';
      return iconWrap(c, ['#5a2090', '#08020e'],
        glow(c, 32, 28, 30, '#c070ff', 0.5) +
        P(head, c.cel('#4a2a6a'), 2.4) +
        CG(glow(c, 31, 24, 22, '#e0a0ff', 1) + S(cr, OL, 3.4) + S(cr, '#f0c0ff', 1.6), c.clip(head)) +
        burst(c, 31, 24, 11, 5, 8, ['#8a30d0', '#d090ff', '#ffffff']) +
        E(46, 30, 2.4, 1.6, '#f0c0ff', 0) +
        sparkle(12, 12, 3.5, '#e8c8ff') + sparkle(56, 14, 3, '#e8c8ff'));
    },
    /* priest: a golden flame burning in the chest of a glowing figure */
    inner_fire: function (c) {
      var body = 'M8,64 C8,46 16,36 32,36 C48,36 56,46 56,64 Z';
      return iconWrap(c, ['#e0a83a', '#3a1c04'],
        rays(32, 38, 14, 20, 30, '#fff4c0', 2, 0.6) + glow(c, 32, 36, 30, '#fff0a0', 0.8) +
        P(body, c.lg(['#fffbe8', '#ffe08a', '#d89a30'], 0, 0, 0, 1), 2.4) + C(32, 22, 10, c.lg(['#fffbe8', '#ffe08a', '#d89a30'], 0.2, 0, 0.8, 1), 2.4) +
        C(32, 50, 12, c.rg([[0, '#ffffff', 0.9], [1, '#ffd040', 0]]), 0) +
        flameC(32, 50, 0.62, ['#e86a14', '#ffb02a', '#fff4a0']) +
        sparkle(12, 12, 4, '#ffffff') + sparkle(52, 14, 3.5, '#ffffff'));
    },
    /* rogue: dagger driven into a back */
    backstab: function (c) {
      var back = 'M4,64 C4,48 12,40 22,38 C24,34 26,32 32,32 C38,32 40,34 42,38 C52,40 60,48 60,64 Z';
      return iconWrap(c, ['#7a2424', '#140404'],
        glow(c, 34, 40, 24, '#ff6a4a', 0.35) +
        P(back, c.cel('#4a4a58'), 2.4) + C(32, 26, 10, c.cel('#4a4a58'), 2.4) +
        CG(S('M32,40 L32,64 M20,46 C24,50 28,50 30,48 M44,46 C40,50 36,50 34,48', '#2a2a36', 1.6, 0.9) + F('M4,64 C4,48 12,40 22,38 L26,40 C16,44 10,52 10,64 Z', '#ffffff', 0.12), c.clip(back)) +
        burst(c, 38, 48, 9, 4, 8, ['#b8141a', '#ff4a3a', '#ffc0a0']) +
        S('M8,8 L22,22', '#ffd0c0', 3, 0.4) + S('M16,4 L28,16', '#ffd0c0', 2, 0.4) +
        wpn(c, 'dagger', 22, 24, 135, 1.5) + drop(44, 58, 0.9) + drop(30, 58, 0.7));
    },
    /* rogue: a cord looped and pulled tight, blood where it bites */
    garrote: function (c) {
      var cord = 'M8,14 C16,24 36,48 42,44 C52,38 46,20 32,20 C18,20 12,38 22,44 C28,48 48,24 56,14';
      var tog = function (x, y, a) { return G(R(-7, -3, 14, 6, c.cel(WOOD), 1.8, null, 2.5) + S('M-4,-2 L-4,2 M4,-2 L4,2', dk(WOOD, 0.4), 1), 'translate(' + x + ',' + y + ') rotate(' + a + ')'); };
      return iconWrap(c, ['#6a1a1c', '#100204'],
        C(32, 32, 14, c.rg([[0, '#ff3a2a', 0.75], [0.6, '#b0101a', 0.4], [1, '#b0101a', 0]]), 0) +
        S(cord, OL, 7) + S(cord, '#d8c8a4', 3.8) + S(cord, '#fff4dc', 1.2, 0.7) +
        drop(32, 45, 0.9) +
        tog(8, 13, 40) + tog(56, 13, -40) +
        S('M4,24 L10,22 M3,30 L10,27 M60,24 L54,22 M61,30 L54,27', '#ff6a5a', 2, 0.8) +
        drop(28, 54, 1.1) + drop(36, 58, 0.9) + drop(22, 58, 0.7));
    },
    /* paladin: a gauntleted fist raised in golden light */
    blessing_might: function (c) {
      return iconWrap(c, ['#e0a030', '#3a1804'],
        rays(32, 26, 16, 14, 30, '#fff4c0', 2, 0.7) + glow(c, 32, 26, 28, '#ffe68a', 0.9) +
        fistG(c, 32, 30, 1.3, '#c8d0da', GOLD) +
        S('M17,20 L17,28', '#ffffff', 1.6, 0.7) +
        sparkle(12, 12, 4.5, '#ffffff') + sparkle(53, 12, 4, '#ffffff') + sparkle(52, 50, 3, '#fff8d0'));
    },
    /* paladin: two open hands pouring light */
    lay_on_hands: function (c) {
      var hand = 'M-8,16 L-9,0 C-10,-2 -13,-6 -14,-9 C-15,-12 -12,-14 -10,-12 L-6,-6 L-6,-20 C-6,-23 -2,-23 -2,-20 L-2,-9 L-1,-24 C-1,-27 3,-27 3,-24 L3,-9 L4,-22 C4,-25 8,-25 8,-22 L8,-8 L9,-17 C9,-20 13,-20 12.5,-17 L11.5,2 C11.5,8 9,12 8,16 Z';
      var hc = c.lg(['#fffbe8', '#ffe8a0', '#d8a050'], 0.2, 0, 0.8, 1);
      var hd = function (x, y, a, m) { return G(P(hand, hc, 2.2) + S('M-4,-4 L-4,4 M0,-6 L0,4 M4,-5 L4,4', '#c08a40', 1, 0.5), 'translate(' + x + ',' + y + ') rotate(' + a + ')' + (m ? ' scale(-1,1)' : '')); };
      return iconWrap(c, ['#f0c860', '#4a2c06'],
        rays(32, 14, 14, 6, 26, '#ffffff', 2.2, 0.7) + glow(c, 32, 22, 26, '#fff8d0', 1) +
        hd(19, 42, -14, false) + hd(45, 42, 14, true) +
        C(32, 18, 7, c.rg([[0, '#ffffff'], [0.5, '#fff8d0'], [1, '#ffe68a', 0]]), 0) + sparkle(32, 18, 6, '#ffffff') +
        sparkle(10, 12, 3.5, '#ffffff') + sparkle(54, 12, 3.5, '#ffffff'));
    },
    /* warlock: searing fire burning through a skull */
    searing_pain: function (c) {
      var fc = ['#c81e0a', '#ff7a14', '#ffe060'];
      return iconWrap(c, ['#b83a0a', '#1e0400'],
        glow(c, 32, 30, 30, '#ffa040', 0.75) +
        flameC(32, 30, 1.3, fc) + flameC(12, 44, 0.55, fc) + flameC(52, 44, 0.55, fc) +
        skullG(c, 32, 40, 1.05, '#e8d0b0', '#ffe23a') +
        C(26.2, 38.3, 5.5, c.rg([[0, '#fff0a0', 0.9], [1, '#ff7a14', 0]]), 0) + C(37.8, 38.3, 5.5, c.rg([[0, '#fff0a0', 0.9], [1, '#ff7a14', 0]]), 0) +
        S('M18,24 L22,30 M46,24 L42,30', '#fff0a0', 1.4, 0.7));
    },
    /* warlock: a violet ward shield with a void sigil */
    shadow_ward: function (c) {
      var sh = 'M12,10 C22,12 42,12 52,10 L52,28 C52,44 42,54 32,60 C22,54 12,44 12,28 Z';
      return iconWrap(c, ['#4a1e70', '#06020c'],
        '<ellipse cx="32" cy="34" rx="28" ry="28" fill="none" stroke="#c070ff" stroke-width="2" opacity="0.45"/>' +
        glow(c, 32, 34, 30, '#a050e0', 0.55) +
        P(sh, c.lg(['#9a5ad0', '#5a2a90', '#1e0a36'], 0.2, 0, 0.8, 1), 2.6) +
        CG(F('M12,10 L28,11 L12,40 Z', '#ffffff', 0.14), c.clip(sh)) +
        S('M16,14 C24,15.5 40,15.5 48,14 L48,28 C48,41 40,49 32,55 C24,49 16,41 16,28 Z', '#e0a0ff', 1.4, 0.8) +
        ring2(32, 32, 10, 10, '#e0a0ff', 1.8) +
        P('M32,20 L35,29 L44,32 L35,35 L32,44 L29,35 L20,32 L29,29 Z', '#e8c0ff', 1.4) +
        C(32, 32, 4.2, c.rg([[0, '#000000'], [0.7, '#1a0630'], [1, '#b060ff']]), 1.4) +
        sparkle(54, 54, 3, '#e0b0ff') + sparkle(10, 54, 2.6, '#e0b0ff'));
    },
    /* hunter: a spread wing with a slash cutting across the feathers */
    wing_clip: function (c) {
      var fe = '', i, px = 12, py = 52;
      for (i = 0; i < 6; i++) {
        var t = i / 5, a = 8 + t * 70, rr = a / 180 * Math.PI, L = 34 + Math.sin(t * Math.PI) * 10, off = 6;
        fe += G(P(D`M0,0 C5.5,-6 6,${-L * 0.7} 0,${-L} C-6,${-L * 0.7} -5.5,-6 0,0 Z`, c.cel(i % 2 ? '#d8c4a0' : '#efe2c4'), 1.8) + S(D`M0,-2 L0,${-L + 3}`, '#8a7050', 1, 0.8),
          'translate(' + r1(px + Math.sin(rr) * off) + ',' + r1(py - Math.cos(rr) * off) + ') rotate(' + r1(a) + ')');
      }
      return iconWrap(c, ['#b0621e', '#240a02'],
        glow(c, 34, 30, 28, '#ffd090', 0.4) + fe +
        E(18, 46, 12, 7.5, c.cel('#c8a270'), 2.2, null, -45) + S('M11,50 Q14,46 17,48 Q19,43 23,44 M14,44 Q17,40 20,41', '#7a5a38', 1.2, 0.8) +
        swoosh(8, 8, 60, 56, -10, '#ffffff', 8) + S('M14,16 L52,52', OL, 4.2) + S('M14,16 L52,52', '#e0141c', 2.2) +
        G(P('M0,0 C4,-5 4.5,-14 0,-19 C-4.5,-14 -4,-5 0,0 Z', c.cel('#efe2c4'), 1.6), 'translate(52,58) rotate(-70)') +
        drop(40, 50, 0.8) + drop(30, 58, 0.7));
    },
    /* hunter: three arrows fanning out */
    multi_shot: function (c) {
      var ar = '', ox = 10, oy = 56, i, angs = [12, 45, 78];
      for (i = 0; i < 3; i++) {
        var a = angs[i], rr = a / 180 * Math.PI, d = 30;
        ar += arrowG(c, ox + Math.sin(rr) * d, oy - Math.cos(rr) * d, a, 0.95);
      }
      return iconWrap(c, ['#9a6a24', '#180e02'],
        glow(c, 38, 26, 26, '#fff0c0', 0.45) +
        S('M4,48 L10,56 M2,56 L10,58 M10,60 L14,62', '#fff4c8', 1.8, 0.5) +
        S('M18,8 C34,4 54,14 60,34', '#fff4c8', 2, 0.45) + ar +
        sparkle(20, 12, 3.5, '#fff8d8') + sparkle(56, 44, 3.5, '#fff8d8'));
    },
    /* shaman: a jagged bolt of fire ending in a flame burst */
    flame_shock: function (c) {
      var b = pl([[40, 3], [20, 26], [31, 27], [16, 50], [44, 21], [33, 21], [48, 3]]) + 'Z';
      return iconWrap(c, ['#c8440c', '#240400'],
        glow(c, 30, 32, 30, '#ffb040', 0.7) +
        flameC(20, 48, 0.62, ['#e03c14', '#ff9a1f', '#ffe868']) + flameC(34, 50, 0.48, ['#e03c14', '#ff9a1f', '#ffe868']) +
        P(b, c.lg(['#fffbd0', '#ffc030', '#e84a10'], 0, 0, 1, 1), 2.4) + S('M40,7 L26,25 M31,29 L22,44', '#ffffff', 1.4, 0.85) +
        C(40, 50, 1.6, '#ffd060', 0) + C(48, 40, 1.3, '#ffd060', 0) + C(10, 34, 1.3, '#ffd060', 0) + C(52, 54, 1.1, '#ffe868', 0));
    },
    /* shaman: stone totem carrying a raised-fist emblem */
    strength_earth: function (c) {
      var st = '#a08a66';
      var stone = function () { return c.lg([lt(st, 0.3), st, dk(st, 0.42)], 0, 0, 1, 0); };
      return iconWrap(c, ['#8a6224', '#140c02'],
        glow(c, 32, 34, 28, '#ffc860', 0.55) +
        E(32, 58, 18, 4, '#000', 0, 0.35) +
        P('M13,60 L15,50 L49,50 L51,60 Z', c.lg([lt(st, 0.15), dk(st, 0.1), dk(st, 0.5)], 0, 0, 1, 0), 2.4) +
        P('M17,51 L18,18 L46,18 L47,51 Z', stone(), 2.4) +
        P('M20,19 L22,6 L42,6 L44,19 Z', stone(), 2.2) +
        P('M22,10 L29,10 L28,14 L23,14 Z M42,10 L35,10 L36,14 L41,14 Z', OL, 0) + S('M26,17 L38,17', dk(st, 0.5), 1.4) +
        F('M19,20 L27,20 L27,50 L18,50 Z', '#ffffff', 0.12) +
        C(32, 36, 12, c.rg([[0, '#fff0b0', 0.6], [1, '#ffc860', 0]]), 0) +
        fistG(c, 32, 32, 0.78, '#e8a840', '#a0661e') +
        P('M8,30 L16,26 L16,34 Z M56,30 L48,26 L48,34 Z', c.cel(st), 1.8));
    },

    /* ---------- batch 2 ---------- */
    /* warrior: a clenched fist inside a blood-red rage burst, blood flying */
    bloodrage: function (c) {
      return iconWrap(c, ['#b81414', '#200202'],
        glow(c, 32, 30, 30, '#ff5a3a', 0.8) +
        burst(c, 32, 28, 31, 14, 12, ['#8a0a0a', '#e8201c', '#ff9a6a']) + rays(32, 28, 12, 20, 31, '#ffc0a8', 1.6, 0.55, 0.26) +
        fistG(c, 32, 30, 1.12, '#d8a070', '#5a3a22') +
        S('M22,20 L22,27 M32,19 L32,26', '#b01818', 1.3, 0.8) +
        drop(10, 44, 1.3) + drop(54, 46, 1.2) + drop(13, 58, 0.9) + drop(52, 12, 0.9) + drop(11, 14, 0.8) + drop(50, 58, 0.8));
    },
    /* warrior: crossed swords on a ring of outward steel spikes */
    retaliation: function (c) {
      var sp = '', i, g = c.lg(STEEL, 0, 0, 1, 0);
      for (i = 0; i < 12; i++) {
        var a = i / 12 * Math.PI * 2 + Math.PI / 12, b = 0.17;
        sp += P(pl([[32 + Math.cos(a - b) * 17, 32 + Math.sin(a - b) * 17], [32 + Math.cos(a) * 31, 32 + Math.sin(a) * 31], [32 + Math.cos(a + b) * 17, 32 + Math.sin(a + b) * 17]]) + 'Z', g, 1.8);
      }
      return iconWrap(c, ['#a8401e', '#1e0604'],
        glow(c, 32, 32, 30, '#ffa070', 0.6) + sp +
        C(32, 32, 18.5, c.rg([[0, '#7a3a24'], [1, '#2a0e06']]), 2.4) + ring2(32, 32, 15, 15, '#e0a060', 1.2, 0.7) +
        wpn(c, 'sword', 19, 47, 45, 0.8) + wpn(c, 'sword', 45, 47, -45, 0.8) +
        burst(c, 32, 30, 7, 3, 8, ['#ff9a2a', '#ffd060', '#fff6c0']));
    },
    /* mage: a pillar of fire slamming into the ground inside a ring of flame */
    flamestrike: function (c) {
      var back = '', front = '', i;
      for (i = 0; i < 10; i++) {
        var a = i / 10 * Math.PI * 2 + 0.3, x = 32 + Math.cos(a) * 23, y = 51 + Math.sin(a) * 6.5, f = flameC(x, y - 4, 0.36, FIRE);
        if (Math.sin(a) < 0) back += f; else front += f;
      }
      var pil = 'M21,-2 C25,10 19,22 24,34 L25,50 L39,50 L40,34 C45,22 39,10 43,-2 Z';
      return iconWrap(c, ['#d8581a', '#2a0600'],
        glow(c, 32, 30, 30, '#ffb040', 0.7) +
        E(32, 52, 29, 9, '#240600', 0, 0.7) + ring2(32, 51, 23, 6.5, '#ff9a1f', 2.2) + back +
        P(pil, c.lg([[0, '#d8340c'], [0.28, '#ffa02a'], [0.5, '#fffbd0'], [0.72, '#ffa02a'], [1, '#d8340c']], 0, 0, 1, 0), 2.2) +
        S('M32,0 L32,44', '#ffffff', 2.4, 0.7) +
        E(32, 50, 14, 5, c.rg([[0, '#ffffff'], [0.5, '#fff0a0', 0.9], [1, '#ffb040', 0]]), 0) + front);
    },
    /* mage: a shimmering blue-violet bubble with an arcane rune inside */
    mana_shield: function (c) {
      return iconWrap(c, ['#5040d0', '#070422'],
        C(32, 32, 28, c.rg([[0, '#8ad8ff', 0.25], [0.6, '#a898ff', 0.2], [0.84, '#d0c0ff', 0.8], [0.94, '#ffffff', 0.95], [1, '#a080ff', 0]]), 0) +
        ring2(32, 32, 25, 25, '#c8b8ff', 1.6, 0.85) +
        glow(c, 32, 32, 16, '#8ae8ff', 0.8) +
        S('M32,15 L44,32 L32,49 L20,32 Z M32,11 L32,53 M24,32 L40,32', OL, 4.4) + S('M32,15 L44,32 L32,49 L20,32 Z M32,11 L32,53 M24,32 L40,32', '#bff4ff', 2) +
        C(32, 32, 4.2, c.rg([[0, '#ffffff'], [1, '#8ae8ff']]), 1.6) +
        S('M13,24 A20,20 0 0 1 24,12', '#ffffff', 2.8, 0.85) + S('M50,44 A20,20 0 0 1 44,50', '#ffffff', 2, 0.6) +
        sparkle(52, 12, 3.6, '#e8f8ff') + sparkle(12, 52, 3, '#e8e0ff'));
    },
    /* priest: a big golden cross of light, brighter and larger than lesser heal */
    heal: function (c) {
      var cr = 'M25,4 L39,4 L39,25 L60,25 L60,39 L39,39 L39,60 L25,60 L25,39 L4,39 L4,25 L25,25 Z';
      return iconWrap(c, ['#f4bc3a', '#5a2a02'],
        glow(c, 32, 32, 32, '#fff4b0', 1) + rays(32, 32, 8, 14, 31, '#ffffff', 2.4, 0.85, Math.PI / 4) +
        P(cr, c.lg(['#ffffff', '#fff2a0', '#f0a820'], 0.2, 0, 0.8, 1), 2.6) +
        F('M29.5,8 L34.5,8 L34.5,29.5 L56,29.5 L56,34.5 L34.5,34.5 L34.5,56 L29.5,56 L29.5,34.5 L8,34.5 L8,29.5 L29.5,29.5 Z', '#ffffff', 0.85) +
        C(32, 32, 13, c.rg([[0, '#ffffff'], [0.5, '#fffbe0', 0.8], [1, '#fff2a0', 0]]), 0) + sparkle(32, 32, 10, '#ffffff') +
        sparkle(13, 13, 4.5, '#ffffff') + sparkle(51, 13, 4, '#ffffff') + sparkle(51, 51, 4.5, '#ffffff') + sparkle(13, 51, 3.6, '#ffffff'));
    },
    /* priest: a shrieking purple face throwing shockwave rings */
    psychic_scream: function (c) {
      var head = 'M32,9 C44,9 49,19 48,30 C47,42 41,55 32,57 C23,55 17,42 16,30 C15,19 20,9 32,9 Z';
      var w = arc(32, 40, 23, -55, 30, '#f0c0ff', 2.4) + arc(32, 40, 23, 150, 235, '#f0c0ff', 2.4) +
        arc(32, 40, 29, -50, 25, '#d890ff', 2, 0.75) + arc(32, 40, 29, 155, 230, '#d890ff', 2, 0.75);
      return iconWrap(c, ['#7a2ab0', '#0e0218'],
        glow(c, 32, 36, 30, '#d080ff', 0.6) + w +
        P(head, c.cel('#a878d0'), 2.4) + F('M20,26 C20,16 25,12 31,11 C25,15 22,20 22,30 Z', '#ffffff', 0.35) +
        P('M19,27 C22,22 27,23 29,29 C25,31 21,31 19,27 Z', '#14041e', 1.4) + P('M45,27 C42,22 37,23 35,29 C39,31 43,31 45,27 Z', '#14041e', 1.4) +
        C(25, 27.5, 1.6, '#ffe0ff', 0) + C(39, 27.5, 1.6, '#ffe0ff', 0) +
        S('M18,20 L28,24 M46,20 L36,24', OL, 2.4) +
        E(32, 44, 6.5, 9.5, '#14041e', 2.2) + E(32, 47.5, 4, 4.5, '#8a1a4a', 0) + S('M27,39 L29,41 M37,39 L35,41', '#f4e6ff', 1.2, 0.8));
    },
    /* rogue: a jagged open gash across skin, bleeding out */
    rupture: function (c) {
      var g = 'M6,20 L14,18 L18,13 L25,22 L31,19 L36,28 L43,26 L48,35 L58,38 L56,45 L46,42 L40,35 L34,38 L28,30 L22,33 L16,25 L8,27 Z';
      return iconWrap(c, ['#c88262', '#3a0c06'],
        glow(c, 32, 30, 28, '#ffb098', 0.35) +
        P(g, '#4a0206', 2.6) + F('M9,23 L16,21 L20,18 L25,26 L31,24 L36,32 L42,30 L47,38 L55,41', '#e8141c', 0) + S('M9,23 L16,21 L20,18 L25,26 L31,24 L36,32 L42,30 L47,38 L55,41', '#ff5a4a', 1.8, 0.9) +
        S(g, '#f0a090', 1, 0.7) +
        drip(15, 27, 12, 1) + drip(29, 33, 16, 1.1) + drip(44, 42, 8, 1) + drop(22, 56, 1) + drop(52, 56, 0.9) + drop(8, 50, 0.8));
    },
    /* rogue: a fist driving into the lower back, stun stars */
    kidney_shot: function (c) {
      var t = 'M8,0 C10,16 18,28 17,40 C16,48 10,54 8,64 L56,64 C54,54 48,48 47,40 C46,28 54,16 56,0 Z';
      return iconWrap(c, ['#a8742a', '#1a0c02'],
        glow(c, 40, 38, 24, '#fff0a0', 0.4) +
        P(t, c.cel('#4a5062'), 2.4) +
        CG(F('M0,44 L64,44 L64,51 L0,51 Z', '#5a3a22') + S('M0,44 L64,44 M0,51 L64,51', OL, 1.8) + R(28, 43.5, 8, 8, c.cel(GOLD), 1.6) +
          S('M32,4 L32,42', '#2a2e3a', 1.8, 0.8) + F('M8,0 C10,16 18,28 17,40 L22,40 C22,26 16,14 16,0 Z', '#ffffff', 0.12), c.clip(t)) +
        burst(c, 42, 38, 11, 4.5, 9, ['#ffb030', '#fff0a0', '#ffffff']) +
        fistG(c, 55, 38, 1.0, '#d8a878', '#5a3a22', -90) +
        stun(14, 12, 5.5) + stun(32, 7, 4.5) + stun(48, 13, 5));
    },
    /* paladin: a holy sunburst driving a dark wraith out of the frame */
    exorcism: function (c) {
      var wr = 'M8,32 C8,24 14,20 20,20 C28,20 32,26 32,34 C32,42 28,46 26,52 L22,48 L20,56 L16,50 L12,60 L10,50 L4,54 C6,46 8,40 8,32 Z';
      return iconWrap(c, ['#e8b440', '#3a1a04'],
        F('M40,24 L4,40 L20,64 Z', '#ffffff', 0.25) +
        rays(42, 22, 16, 10, 34, '#ffffff', 2.4, 0.8) + glow(c, 42, 22, 26, '#fffbe0', 1) +
        P('M11,24 L7,14 L16,20 Z M28,22 L32,12 L32,26 Z', '#2a0e30', 1.6) +
        P(wr, c.lg(['#5a2a6a', '#2a0e34', '#0c0410'], 0.8, 0, 0.2, 1), 2.4) +
        P('M13,30 L19,31 L18,35 L13,33 Z M27,30 L22,31 L23,35 L27,33 Z', '#ff3a4a', 1) +
        C(34, 30, 2.2, '#2a0e34', 1) + C(36, 40, 1.6, '#2a0e34', 1) + C(38, 24, 1.4, '#2a0e34', 0.8) +
        burst(c, 42, 22, 14, 6, 12, ['#ffc030', '#fff4b0', '#ffffff']) + sparkle(56, 44, 3.5, '#ffffff'));
    },
    /* paladin: a golden aura ring with swords jutting outward from it */
    retribution_aura: function (c) {
      var sw = '', i;
      for (i = 0; i < 4; i++) { var a = i * 90 + 45, rr = a / 180 * Math.PI; sw += wpn(c, 'sword', 32 + Math.sin(rr) * 18, 32 - Math.cos(rr) * 18, a, 0.6); }
      return iconWrap(c, ['#b8401a', '#1e0404'],
        glow(c, 32, 32, 30, '#ffd070', 0.7) + sparkle(32, 7, 3.6, '#fff8d0') + sparkle(32, 57, 3.6, '#fff8d0') + sparkle(7, 32, 3.2, '#fff8d0') + sparkle(57, 32, 3.2, '#fff8d0') +
        ring2(32, 32, 25, 25, '#ffe8a0', 1.2, 0.5) +
        ring2(32, 32, 12.5, 12.5, '#ffd84a', 4) + S('M22,26 A12.5,12.5 0 0 1 30,19.7', '#ffffff', 1.4, 0.8) + sw +
        C(32, 32, 7, c.rg([[0, '#ffffff'], [0.55, '#fff2a0'], [1, '#f2b830']]), 1.8));
    },
    /* warlock: burning meteors falling out of dark clouds */
    rain_of_fire: function (c) {
      var fc = ['#d8300a', '#ff8a1a', '#ffe868'];
      var met = function (x, y, s) {
        return G(P('M-5.5,0 C-5.5,-9 -2,-20 1,-30 C2,-20 5.5,-9 5.5,0 C5.5,5 -5.5,5 -5.5,0 Z', c.lg(['#ffe868', '#ff8a1a', '#d8300a', [1, '#d8300a', 0.2]], 0, 1, 0, 0), 1.8) +
          C(0, 0, 9, c.rg([[0, '#fff0a0', 0.8], [1, '#ff8a1a', 0]]), 0) + C(0, 0, 5.2, c.cel('#6a2a14'), 2) + C(-1.4, -1.4, 2, '#ffd060', 0),
          'translate(' + x + ',' + y + ') rotate(-24) scale(' + s + ')');
      };
      return iconWrap(c, ['#a8340a', '#160200'],
        glow(c, 32, 40, 28, '#ff9a30', 0.55) +
        flameC(14, 58, 0.42, fc) + flameC(40, 60, 0.36, fc) + flameC(56, 58, 0.34, fc) +
        met(20, 40, 1.0) + met(44, 34, 1.05) + met(32, 56, 0.85) + met(55, 52, 0.7) +
        cloud(c, [[4, 10, 8], [15, 8, 9], [28, 6, 10], [42, 8, 10], [56, 7, 9], [22, 15, 7], [36, 16, 7], [50, 16, 6], [9, 17, 5]], '#4e3a52') +
        F('M6,4 C14,2 24,2 30,1 L30,6 C22,6 14,7 6,9 Z', '#ffffff', 0.18) +
        S('M8,22 C16,24 24,24 30,23 M40,24 C46,24 52,23 58,21', '#ff9a50', 1.4, 0.65));
    },
    /* warlock: a spiked black-violet breastplate with a burning demonic sigil */
    demon_armor: function (c) {
      var pl_ = 'M12,17 L24,11 Q32,16 40,11 L52,17 L54,30 L47,34 L47,54 Q32,61 17,54 L17,34 L10,30 Z';
      return iconWrap(c, ['#5a1a70', '#08020e'],
        glow(c, 32, 36, 28, '#b050e0', 0.5) +
        P('M12,18 L2,6 L18,13 Z M52,18 L62,6 L46,13 Z M22,12 L20,2 L28,13 Z M42,12 L44,2 L36,13 Z', c.lg(['#e6dcc6', '#9a8a78', '#5a4a40']), 1.8) +
        P(pl_, c.lg(['#6a4a80', '#301840', '#100814'], 0.2, 0, 0.8, 1), 2.6) +
        CG(F('M10,16 L26,12 L14,44 Z', '#ffffff', 0.14) + S('M17,34 L47,34 M17,45 Q32,50 47,45', '#0a040e', 1.6, 0.9), c.clip(pl_)) +
        S('M14,19 L24,14 Q32,19 40,14 L50,19', '#c890ff', 1.4, 0.6) +
        C(32, 36, 15, c.rg([[0, '#ffe0a0', 0.95], [0.45, '#ff4a2a', 0.55], [1, '#ff4a2a', 0]]), 0) +
        S('M22,22 Q23,32 28,32 M42,22 Q41,32 36,32', OL, 5) + S('M22,22 Q23,32 28,32 M42,22 Q41,32 36,32', '#ffb040', 2.6) +
        ring2(32, 37, 7.5, 7.5, '#ffb040', 2.6) + P('M32,31 L34.5,37 L32,43 L29.5,37 Z', '#fff4c0', 1.2) +
        S('M32,45 L32,52', OL, 5) + S('M32,45 L32,52', '#ffb040', 2.6));
    },
    /* hunter: a bow loosing a stream of arrows with speed lines */
    rapid_fire: function (c) {
      var lim = 'M14,5 C32,18 32,46 14,59';
      return iconWrap(c, ['#b8761e', '#1e0e02'],
        glow(c, 40, 32, 26, '#fff0c0', 0.5) +
        S('M14,5 L20,32 L14,59', '#efe6cf', 1.3, 0.9) +
        S(lim, OL, 7) + S(lim, WOOD, 4.4) + S('M16,8 C29,20 29,44 16,56', '#c89a60', 1.2, 0.8) + R(21.5, 28, 5, 8, LEATH, 1.6, null, 1.5) +
        S('M2,20 L22,20 M4,32 L26,32 M2,44 L22,44 M12,26 L30,26 M12,38 L30,38', '#fff4c8', 1.8, 0.55) +
        arrowG(c, 38, 20, 90, 0.72) + arrowG(c, 44, 32, 90, 0.72) + arrowG(c, 36, 44, 90, 0.72) +
        sparkle(58, 12, 3, '#fff8d8') + sparkle(58, 52, 3, '#fff8d8'));
    },
    /* hunter: a steel jaw trap snapped shut, engulfed in flames */
    immolation_trap: function (c) {
      var th = '', i, angs = [192, 214, 236, 257, 283, 304, 326, 348];
      for (i = 0; i < angs.length; i++) {
        var a = angs[i] * Math.PI / 180, b = 0.15;
        th += pl([[32 + Math.cos(a - b) * 17, 47 + Math.sin(a - b) * 17], [32 + Math.cos(a) * 9, 47 + Math.sin(a) * 9], [32 + Math.cos(a + b) * 17, 47 + Math.sin(a + b) * 17]]) + 'Z';
      }
      return iconWrap(c, ['#c8440a', '#200400'],
        glow(c, 32, 32, 30, '#ffb040', 0.75) +
        flameC(32, 28, 1.3, FIRE) + flameC(10, 40, 0.62, FIRE) + flameC(54, 40, 0.62, FIRE) +
        E(32, 53, 26, 7, '#1a0600', 0, 0.6) +
        P(th, c.lg(STEEL, 0, 0, 1, 0), 1.5) +
        arc(32, 47, 19, 180, 264, '#c2cad3', 3.6) + arc(32, 47, 19, 276, 360, '#c2cad3', 3.6) +
        S('M14.5,43 A18,18 0 0 1 27,29.5', '#ffffff', 1, 0.8) +
        P('M8,46 L56,46 L54,54 L10,54 Z', c.lg(STEEL, 0, 0, 0, 1), 2.2) + E(32, 50, 7, 2.4, c.cel('#8a7050'), 1.5) +
        C(11, 50, 3, c.cel('#7c8793'), 1.5) + C(53, 50, 3, c.cel('#7c8793'), 1.5) +
        flameC(20, 60, 0.34, FIRE) + flameC(44, 60, 0.34, FIRE) + C(48, 14, 1.4, '#ffe868', 0) + C(16, 18, 1.2, '#ffe868', 0));
    },
    /* druid: a sprout curling up into a spiral, a healing glow and green plus sparks */
    regrowth: function (c) {
      var st = 'M30,62 C30,50 20,44 22,32 C24,20 42,18 44,28 C46,36 36,38 34,32 C33,28 37,27 38,30';
      var plus = function (x, y, r) { var d = D`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`; return S(d, OL, r * 0.9 + 2.4) + S(d, '#eaffc0', r * 0.9); };
      return iconWrap(c, ['#3a8a24', '#051202'],
        C(32, 34, 28, c.rg([[0, '#f4ffd0', 0.9], [0.45, '#a8e060', 0.45], [1, '#6ac030', 0]]), 0) +
        E(32, 60, 16, 4, '#1a3008', 0, 0.6) +
        S(st, OL, 6.4) + S(st, '#4a9a24', 3.8) + S('M29,58 C29,50 20,44 21,34', '#b8f080', 1.1, 0.7) +
        leaf(c, 28, 54, -70, 0.95, '#86c84a') + leaf(c, 32, 50, 65, 0.85, '#5aa032') + leaf(c, 22, 38, -45, 0.7, '#b8e060') +
        leaf(c, 42, 22, 60, 0.6, '#86c84a') + leaf(c, 24, 24, -20, 0.55, '#5aa032') +
        plus(50, 46, 5) + plus(12, 16, 4) + plus(52, 12, 3.2) + sparkle(12, 44, 3, '#ffffff'));
    },
    /* druid: three wide claw gashes fanning sideways in one sweep (maul is vertical, with a paw) */
    swipe: function (c) {
      var gash = function (y0, y1, bow) {
        var mx = 36, my = (y0 + y1) / 2 + bow;
        return D`M6,${y0} Q${mx},${my - 5} 60,${y1} Q${mx},${my + 6} 6,${y0} Z`;
      };
      var g = gash(28, 10, -4) + gash(32, 32, 0) + gash(36, 54, 4);
      return iconWrap(c, ['#a8702a', '#1a0c02'],
        glow(c, 38, 32, 28, '#ffd090', 0.5) +
        G(F(g, '#c81c1c', 0.9), 'translate(0,2.4)') + P(g, '#fff4e4', 1.8) +
        S('M4,20 C8,16 12,14 16,13 M4,44 C8,48 12,50 16,51', '#fff0d0', 1.8, 0.5) +
        drop(30, 44, 0.8) + drop(44, 60, 0.9) + drop(48, 24, 0.7) + drop(20, 22, 0.6));
    },
    /* shaman: a jagged ice bolt striking down and bursting into shards */
    frost_shock: function (c) {
      var b = pl([[24, 2], [44, 24], [33, 25], [46, 46], [18, 20], [30, 20], [16, 2]]) + 'Z';
      var sh = '', i, angs = [-120, -80, -40, 0, 40];
      for (i = 0; i < angs.length; i++) { var rr = angs[i] / 180 * Math.PI, L = i % 2 ? 11 : 13; sh += shard(c, 46 + Math.sin(rr) * L, 50 - Math.cos(rr) * L, angs[i], i % 2 ? 0.42 : 0.52, i % 2 ? '#d8f6ff' : '#9fe0ff'); }
      return iconWrap(c, ['#2a78c0', '#030c22'],
        glow(c, 36, 34, 30, '#9fe0ff', 0.7) +
        E(46, 54, 16, 4.5, '#bfefff', 0, 0.5) + sh +
        P(b, c.lg(['#ffffff', '#bfefff', '#3a9ae0'], 0, 0, 1, 1), 2.4) + S('M22,6 L38,24 M33,29 L42,41', '#ffffff', 1.4, 0.85) +
        C(46, 49, 6, c.rg([[0, '#ffffff'], [0.6, '#dff8ff', 0.8], [1, '#9fe0ff', 0]]), 0) + sparkle(46, 49, 5, '#ffffff') +
        sparkle(10, 34, 3.2, '#e8fbff') + sparkle(54, 12, 3.6, '#e8fbff'));
    },
    /* shaman: a flanged mace wreathed in flame */
    flametongue_weapon: function (c) {
      return iconWrap(c, ['#c84a0c', '#240400'],
        glow(c, 40, 24, 30, '#ffb040', 0.8) +
        G(flameC(0, 0, 1.25, FIRE), 'translate(42,22) rotate(38)') + G(flameC(0, 0, 0.62, FIRE), 'translate(26,40) rotate(38)') +
        G(flameC(0, 0, 0.5, FIRE), 'translate(18,48) rotate(38)') +
        G(mace(c), 'translate(26,42) rotate(38) scale(1.1)') +
        flameC(54, 12, 0.3, FIRE) + flameC(56, 32, 0.28, FIRE) + flameC(30, 12, 0.26, FIRE) +
        C(10, 30, 1.4, '#ffd060', 0) + C(50, 50, 1.3, '#ffd060', 0) + C(22, 22, 1.1, '#ffe868', 0));
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
