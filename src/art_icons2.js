/* art_icons2.js - extra ability icons for Azeroth Solo (16 keys, one or two per class).
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
