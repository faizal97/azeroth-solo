/* art_legends.js — Legend characters for Azeroth Solo. First legend: Lyveus Cloveus, the Exiled Knight, a high elf
 * paladin (an original character by a friend of the developer, redrawn from his reference drawing in the game's style).
 *   legend  lyveus               ART.legend(key): a party / world sprite in exactly the ART.hero format
 *                                (128x128, facing RIGHT, feet on y=122, shadow at y=122.5). ART.legend.keys lists the keys.
 *                                Unknown keys return ART.hero({ cls: 'paladin', race: 'human' }).
 *   actors  lyveus, vyn          ART.story.actor: 160x160 transparent, facing LEFT, feet on the bottom edge
 *   scene   silverleaf_lodge     ART.scene: 400x240, the high elf lodge in the Arathi pines, burned two years ago, at sunset
 *   mob     lord_cassius_marrow  ART.mob: 128x128, facing LEFT, feet on y=122 (open-world elite, Lady Prestor's cabal)
 *   icons   legend_lyveus, oathbound_strike, ancients_bulwark, silverleaf_aegis   ART.icon: 64x64
 * Loads AFTER every other art pack (art_story.js and art_story2.js included) and EXTENDS window.ART: ART.scene, ART.mob,
 * ART.icon and ART.story.scene / ART.story.actor handle the keys above and fall through to the previous functions for
 * every other key (prototype keys included). Keys are appended to ART.keys.scenes / mobs / icons and
 * ART.story.keys.actors. Self-contained: helpers are copies of the zone packs'. Never throws.
 * Lyveus's look (from the reference): pale skin, long swept-back pointed ears, short swept mint hair, eager open mouth;
 * sage-green padded vest with a high dark collar and a cross-laced front, grey-green shoulder guards, white sleeves and
 * leggings, brown strapped gloves, grey-green greaves with pointed knee guards; a long dark-steel sword with white
 * glints; a pale green-gold kite shield with a leaf emblem and a pearl at its centre.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients, no text, no images, no filters,
 * ids unique per call (prefix lg<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = (W.ART && (typeof W.ART === 'object' || typeof W.ART === 'function')) ? W.ART : {};
  try { if (W.ART !== ART) W.ART = ART; } catch (e) { }
  var OL = '#1a1009';
  var SEQ = 0;
  var SWM = 1; // stroke multiplier, lowered while a figure is drawn scaled up (story actors, portrait)
  var PI = Math.PI;

  // ---------- colour + number helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var v = parseInt(h, 16);
    if (isNaN(v)) v = 0x808080;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function hex(a) { return '#' + a.map(function (v) { var s = Math.round(clamp(v, 0, 255)).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lt(c, t) { return mix(c, '#ffffff', t); }
  function dk(c, t) { return mix(c, '#000000', t); }
  function n(v) { v = +v; return isFinite(v) ? Math.round(v * 10) / 10 : 0; }
  function pt(p) { return n(p[0]) + ',' + n(p[1]); }
  function pd(a, close) { return 'M' + a.map(pt).join('L') + (close ? 'Z' : ''); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids, defs) ----------
  function Ctx() { this.p = 'lg' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  function stopsS(st) {
    return st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  Ctx.prototype.lg = function (st, x1, y1, x2, y2) {
    if (x1 == null) { x1 = 0; y1 = 0; x2 = 0; y2 = 1; }
    var key = 'l' + JSON.stringify(st) + [x1, y1, x2, y2].join();
    if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' + stopsS(st) + '</linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.rg = function (st, cx, cy, r) {
    if (cx == null) { cx = 0.5; cy = 0.5; r = 0.5; }
    var key = 'r' + JSON.stringify(st) + [cx, cy, r].join();
    if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' + stopsS(st) + '</radialGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.cel = function (col) { return this.lg([[0, lt(col, 0.3)], [0.4, col], [0.72, col], [1, dk(col, 0.38)]], 0.2, 0, 0.8, 1); };
  Ctx.prototype.clip = function (d) { var id = this.id(); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return 'url(#' + id + ')'; };
  Ctx.prototype.svg = function (w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + body + '</svg>';
  };
  function glow(c, col, a) { a = a == null ? 0.6 : a; return c.rg([[0, col, a], [0.4, col, a * 0.45], [1, col, 0]]); }

  // ---------- primitives ----------
  function stk(w) { return w ? ' stroke="' + OL + '" stroke-width="' + n(w * SWM) + '" stroke-linejoin="round" stroke-linecap="round"' : ''; }
  function opa(o) { return o != null && o < 1 ? ' opacity="' + o + '"' : ''; }
  function P(d, fill, w, o) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + stk(w) + opa(o) + '/>'; }
  function F(d, fill, o) { return P(d, fill, 0, o); }
  function L(d, col, w, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + opa(o) + '/>'; }
  function E(cx, cy, rx, ry, fill, w, o, rot) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + stk(w) + opa(o) +
      (rot ? ' transform="rotate(' + n(rot) + ' ' + n(cx) + ' ' + n(cy) + ')"' : '') + '/>';
  }
  function C(cx, cy, r, fill, w, o) { return E(cx, cy, r, r, fill, w, o); }
  function R(x, y, w, h, fill, sw, o) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function G(s, tf, o) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + opa(o) + '>' + s + '</g>'; }
  function CG(s, clip) { return '<g clip-path="' + clip + '">' + s + '</g>'; }
  // outlined limb: dark stroke under a coloured stroke, optional shade stripe
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.4 * SWM) + L(d, col, w) + (sh ? '<path transform="translate(' + n(w * 0.24) + ',' + n(w * 0.08) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.36) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' : '');
  }
  function shadow(c, cx, rx, y) { return E(cx, y || 122.5, rx, Math.max(3, rx * 0.16), c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])); }
  function sparkle(x, y, r, col, o) { return F('M' + n(x) + ',' + n(y - r) + 'Q' + n(x + r * 0.15) + ',' + n(y - r * 0.15) + ' ' + n(x + r) + ',' + n(y) + 'Q' + n(x + r * 0.15) + ',' + n(y + r * 0.15) + ' ' + n(x) + ',' + n(y + r) + 'Q' + n(x - r * 0.15) + ',' + n(y + r * 0.15) + ' ' + n(x - r) + ',' + n(y) + 'Q' + n(x - r * 0.15) + ',' + n(y - r * 0.15) + ' ' + n(x) + ',' + n(y - r) + 'Z', col, o); }
  // a leaf pointing along -y from (0,0), length s*10
  function leafD(s) { return 'M0,0 C' + n(-4 * s) + ',' + n(-2 * s) + ' ' + n(-4.4 * s) + ',' + n(-7 * s) + ' 0,' + n(-10.5 * s) + ' C' + n(4.4 * s) + ',' + n(-7 * s) + ' ' + n(4 * s) + ',' + n(-2 * s) + ' 0,0 Z'; }
  function leaf(c, x, y, a, s, col) {
    col = col || '#8ad05a';
    return G(P(leafD(s), c.lg([[0, lt(col, 0.35)], [1, dk(col, 0.25)]], 0, 0, 1, 0), 1.1) + L('M0,' + n(-1 * s) + ' L0,' + n(-8.6 * s), dk(col, 0.35), 0.7), 'translate(' + n(x) + ',' + n(y) + ') rotate(' + n(a) + ')');
  }

  // =====================================================================
  // LYVEUS: one rig, drawn FACING RIGHT in hero-sprite coordinates (128 box, feet on 122).
  // The story actor is the same rig in another pose, mirrored and scaled.
  // =====================================================================
  var LY = {
    skin: '#f5e1d6', skinD: '#d8b4ae', hair: '#9fe3c9', hairD: '#58ab96', hairL: '#e0fff3',
    vest: '#8da585', vestD: '#627a5e', collar: '#3c5848', guard: '#a4b59c', white: '#f2f4f3', whiteD: '#c2cad3',
    glove: '#71472a', strap: '#3a2414', greave: '#7f917c', eye: '#34a484'
  };
  // the sprite pose (party slot, town)
  var POSE_SPRITE = {
    head: [69, 27, 10.5], bSh: [57, 48], bEl: [50, 60], bHd: [51, 70], fSh: [76, 48], fEl: [86, 57], fHd: [93, 63],
    bHip: [61, 80], bKn: [57.5, 99], bFt: [54, 117], fHip: [68, 80], fKn: [73.5, 99], fFt: [77, 117],
    shield: [44, 71, 0.84, -8], sword: [30, 56], tail: 0
  };
  // the story pose: sword raised high and forward, shield up, a wide heroic stance
  var POSE_ACTOR = {
    head: [70, 27, 10.5], bSh: [57, 48], bEl: [49, 59], bHd: [55, 66], fSh: [76, 48], fEl: [87, 44], fHd: [97, 44],
    bHip: [61, 80], bKn: [52, 99], bFt: [44, 117], fHip: [68, 80], fKn: [82, 96], fFt: [86, 117],
    shield: [48, 66, 0.9, -4], sword: [42, 54], tail: 1
  };

  function kiteD() { return 'M-12,-15 C-5,-18.5 5,-18.5 12,-15 L12.5,-4 C12,7 6,14 0,21 C-6,14 -12,7 -12.5,-4 Z'; }
  // the leaf-and-pearl kite shield, centred on (0,0), about 25 x 40 at scale 1
  function kite(c) {
    var inner = 'M-9.6,-12.8 C-4,-15.6 4,-15.6 9.6,-12.8 L10,-4 C9.6,5.6 4.8,11.6 0,17.4 C-4.8,11.6 -9.6,5.6 -10,-4 Z';
    var o = P(kiteD(), c.lg([[0, '#9aa852'], [0.55, '#76853a'], [1, '#4e5a24']], 0.2, 0, 0.8, 1), 2.4);
    o += P(inner, c.lg([[0, '#fafbdc'], [0.35, '#e6edaa'], [0.7, '#cbd889'], [1, '#a4b663']], 0.15, 0, 0.85, 1), 1.1);
    o += CG(F('M-11,-2 L-1,-17 L4.5,-17 L-11,8 Z', '#ffffff', 0.5) + F('M-11,12 L7,-17 L8.6,-17 L-11,15 Z', '#ffffff', 0.35), c.clip(inner));
    // the leaf emblem, flame-like, cupping the pearl
    var lf = 'M0,-12.5 C2.6,-9.6 6.4,-7 6.6,-2 C6.8,1.6 5.4,4.4 3.4,5.8 L5.6,8 C3,8 1.4,8.6 0,10.4 C-1.4,8.6 -3,8 -5.6,8 L-3.4,5.8 C-5.4,4.4 -6.8,1.6 -6.6,-2 C-6.4,-7 -2.6,-9.6 0,-12.5 Z';
    o += P(lf, c.lg([[0, '#ffffff'], [0.6, '#eef4c8'], [1, '#bccb7c']], 0, 0, 0, 1), 1.1);
    o += L('M0,-10 L0,-2.5 M0,-7 L-2.6,-8.8 M0,-7 L2.6,-8.8 M0,-4 L-3.6,-6 M0,-4 L3.6,-6', '#7f9046', 0.8);
    o += C(0, 2.2, 3.7, c.rg([[0, '#ffffff'], [0.5, '#eef1f8'], [1, '#98a6c4']], 0.36, 0.34, 0.72), 1.3) + C(-1.2, 1, 1.05, '#ffffff');
    return o;
  }
  // long straight sword along -y from the grip centre (0,0): dark steel blade, white glints, a crossguard
  function lsword(c, len) {
    var bw = 2.8, o = '';
    var blade = 'M' + n(-bw) + ',-6 L' + n(-bw * 0.86) + ',' + n(-len + 7) + ' L0,' + n(-len) + ' L' + n(bw * 0.86) + ',' + n(-len + 7) + ' L' + n(bw) + ',-6 Z';
    o += P(blade, c.lg([[0, '#a4adb8'], [0.4, '#626a76'], [0.6, '#4a515b'], [1, '#2a2e35']], 0, 0, 1, 0), 1.9);
    o += L('M0,-9 L0,' + n(-len + 9), '#262a30', 1, 0.9);
    [0.3, 0.62].forEach(function (t) {
      var y = -6 - (len - 12) * t;
      o += F('M' + n(-bw + 0.6) + ',' + n(y + 2.4) + ' L' + n(bw - 0.6) + ',' + n(y - 2.2) + ' L' + n(bw - 0.6) + ',' + n(y - 0.9) + ' L' + n(-bw + 0.6) + ',' + n(y + 3.7) + ' Z', '#ffffff', 0.95);
    });
    o += L('M' + n(-bw * 0.55) + ',-10 L' + n(-bw * 0.5) + ',' + n(-len + 12), '#ffffff', 0.7, 0.5);
    o += F('M' + n(-bw * 0.5) + ',' + n(-len + 8) + ' L0,' + n(-len + 1.5) + ' L0,' + n(-len + 8) + ' Z', '#ffffff', 0.8);
    o += R(-2.1, -4.6, 4.2, 10.6, '#5a3a22', 1.5) + L('M-2,-2.2 L2,-0.8 M-2,1 L2,2.4 M-2,4 L2,5.2', '#2e1c10', 0.9);
    o += P('M-10.5,-8.4 C-6,-7.2 6,-7.2 10.5,-8.4 L11.4,-5.4 C6,-4.2 -6,-4.2 -11.4,-5.4 Z', c.lg([[0, '#9aa0a8'], [1, '#4e535a']]), 1.6);
    o += C(-11.2, -6.9, 1.6, '#6a6f76', 1.1) + C(11.2, -6.9, 1.6, '#6a6f76', 1.1) + P('M-2.4,-8 L0,-11.2 L2.4,-8 Z', '#6a6f76', 1.1);
    o += C(0, 7.6, 2.7, c.cel('#8a9098'), 1.4);
    return o;
  }
  function strap(a, b, t, w) {
    var p = lerp(a, b, t), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l * w, py = dx / l * w;
    return L('M' + n(p[0] - px) + ',' + n(p[1] - py) + ' L' + n(p[0] + px) + ',' + n(p[1] + py), LY.strap, 1.7) + R(p[0] + px * 0.3 - 0.9, p[1] + py * 0.3 - 0.9, 1.8, 1.8, '#c8b27a');
  }
  function lyvArm(c, sh, el, hd, back) {
    var o = tube([sh, el, hd], 8, back ? LY.whiteD : LY.white, back ? null : LY.whiteD);
    var g0 = lerp(el, hd, 0.3);
    o += tube([g0, hd], 9, back ? dk(LY.glove, 0.15) : LY.glove);
    o += strap(el, hd, 0.46, 4.6) + strap(el, hd, 0.72, 4.6);
    return o;
  }
  function lyvHand(c, hd, back) { return C(hd[0], hd[1], 4.7, c.cel(back ? dk(LY.glove, 0.15) : LY.glove), 2.1) + L('M' + n(hd[0] - 2) + ',' + n(hd[1] + 1.8) + ' L' + n(hd[0] + 2.4) + ',' + n(hd[1] + 1.2), LY.strap, 1); }
  function lyvLeg(c, h, kn, f, back) {
    var gr = back ? dk(LY.greave, 0.16) : LY.greave, o = '';
    o += tube([h, kn], 9.8, back ? LY.whiteD : LY.white, back ? null : LY.whiteD);
    var ax = f[0] + 1, ay = f[1] - 3, dx = ax - kn[0], dy = ay - kn[1], l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l, py = dx / l;
    function q(t, w) { return [kn[0] + dx * t + px * w, kn[1] + dy * t + py * w]; }
    o += P(pd([q(0.02, -5.4), q(0.4, -6.5), q(1, -4.8), q(1, 4.8), q(0.4, 6.5), q(0.02, 5.4)], true), c.cel(gr), 2.1);
    o += L(pd([q(0.2, -2.6), q(0.95, -2)]), lt(gr, 0.35), 1.2, 0.8);
    // pointed sabaton
    var x = f[0], y = f[1] + 5;
    o += P('M' + n(x - 5.2) + ',' + n(y - 10) + ' L' + n(x + 3) + ',' + n(y - 10) + ' C' + n(x + 6) + ',' + n(y - 6.4) + ' ' + n(x + 11) + ',' + n(y - 4) + ' ' + n(x + 12.5) + ',' + n(y) + ' L' + n(x - 5.6) + ',' + n(y) + ' Z', c.cel(dk(gr, 0.12)), 2.1);
    o += L('M' + n(x - 4.6) + ',' + n(y - 6) + ' L' + n(x + 4.6) + ',' + n(y - 6), dk(gr, 0.45), 1, 0.8);
    // pointed knee guard, tip up the thigh
    var kx = kn[0] + px * 0.6, ky = kn[1];
    o += P('M' + n(kx + 0.8) + ',' + n(ky - 8) + ' L' + n(kx + 5.4) + ',' + n(ky - 0.8) + ' C' + n(kx + 5) + ',' + n(ky + 3.8) + ' ' + n(kx - 3.6) + ',' + n(ky + 4) + ' ' + n(kx - 4.2) + ',' + n(ky - 0.8) + ' Z', c.cel(lt(gr, 0.14)), 1.9);
    o += L('M' + n(kx + 0.8) + ',' + n(ky - 5.6) + ' L' + n(kx + 0.7) + ',' + n(ky + 2.2), lt(gr, 0.5), 1, 0.8);
    return o;
  }
  function guard(c, x, y, rx, col) {
    var o = P('M' + n(x - rx * 0.92) + ',' + n(y + 3) + ' C' + n(x - rx * 0.8) + ',' + n(y + 8.4) + ' ' + n(x + rx * 0.8) + ',' + n(y + 8.4) + ' ' + n(x + rx * 0.92) + ',' + n(y + 3) + ' Z', c.cel(dk(col, 0.12)), 1.8);
    o += P('M' + n(x - rx) + ',' + n(y + 3) + ' C' + n(x - rx) + ',' + n(y - rx * 0.95) + ' ' + n(x + rx) + ',' + n(y - rx * 0.95) + ' ' + n(x + rx) + ',' + n(y + 3) + ' C' + n(x + rx * 0.5) + ',' + n(y + 5.2) + ' ' + n(x - rx * 0.5) + ',' + n(y + 5.2) + ' ' + n(x - rx) + ',' + n(y + 3) + ' Z', c.cel(col), 2.1);
    o += L('M' + n(x - rx * 0.55) + ',' + n(y - rx * 0.35) + ' Q' + n(x) + ',' + n(y - rx * 0.72) + ' ' + n(x + rx * 0.5) + ',' + n(y - rx * 0.4), lt(col, 0.55), 1.3, 0.8);
    return o;
  }
  function lyvHead(c, X, Y, r) {
    function q(u, v) { return n(X + r * u) + ',' + n(Y + r * v); }
    var o = '';
    var face = 'M' + q(-1, 0.05) + ' C' + q(-1, -1.3) + ' ' + q(0.95, -1.3) + ' ' + q(1, -0.15) + ' L' + q(1.22, 0.28) + ' L' + q(0.98, 0.46) +
      ' C' + q(0.97, 0.86) + ' ' + q(0.5, 1.1) + ' ' + q(0.02, 1.06) + ' C' + q(-0.7, 0.98) + ' ' + q(-1, 0.55) + ' ' + q(-1, 0.05) + ' Z';
    o += P(face, c.cel(LY.skin), 2.1);
    o += CG(F('M' + q(-1.1, -0.2) + ' L' + q(-0.25, -0.2) + ' C' + q(-0.4, 0.4) + ' ' + q(-0.2, 0.8) + ' ' + q(0.2, 1.2) + ' L' + q(-1.1, 1.2) + ' Z', LY.skinD, 0.55), c.clip(face));
    // eye (bright green), eager raised brow
    var ex = X + r * 0.5, ey = Y - r * 0.04;
    o += E(ex, ey, 2.3, 1.9, '#fbf8f2') + C(ex + 0.6, ey + 0.15, 1.35, LY.eye) + C(ex + 0.85, ey + 0.15, 0.6, '#10302a') + C(ex + 0.2, ey - 0.45, 0.45, '#ffffff');
    o += L('M' + n(ex - 2.3) + ',' + n(ey - 1.1) + ' Q' + n(ex) + ',' + n(ey - 2.5) + ' ' + n(ex + 2.5) + ',' + n(ey - 1.2), OL, 1.1);
    o += L('M' + n(ex - 3) + ',' + n(ey - 4.4) + ' Q' + n(ex) + ',' + n(ey - 6.2) + ' ' + n(ex + 3.2) + ',' + n(ey - 4.8), dk(LY.hairD, 0.2), 1.5);
    // open, eager mouth
    o += P('M' + q(0.5, 0.56) + ' Q' + q(0.73, 0.5) + ' ' + q(0.94, 0.53) + ' Q' + q(0.9, 0.92) + ' ' + q(0.64, 0.86) + ' Q' + q(0.5, 0.74) + ' ' + q(0.5, 0.56) + ' Z', '#6a2228', 1.1);
    o += F('M' + q(0.6, 0.8) + ' Q' + q(0.76, 0.7) + ' ' + q(0.88, 0.8) + ' Q' + q(0.78, 0.9) + ' ' + q(0.6, 0.8) + ' Z', '#e07a80');
    o += F('M' + q(0.56, 0.57) + ' L' + q(0.92, 0.55) + ' L' + q(0.9, 0.62) + ' L' + q(0.58, 0.64) + ' Z', '#ffffff', 0.9);
    o += E(X + r * 0.22, Y + r * 0.42, 2, 1.2, '#f0a0a0', 0, 0.35);
    // short swept mint hair
    var hair = 'M' + q(0.92, -0.42) + ' C' + q(1.02, -0.9) + ' ' + q(0.78, -1.36) + ' ' + q(0.36, -1.62) + ' L' + q(0.14, -1.26) + ' L' + q(-0.34, -1.78) + ' L' + q(-0.42, -1.3) +
      ' L' + q(-1.08, -1.56) + ' L' + q(-0.96, -1.02) + ' L' + q(-1.58, -0.84) + ' L' + q(-1.08, -0.42) + ' L' + q(-1.36, -0.04) + ' L' + q(-0.97, 0.22) +
      ' C' + q(-0.82, -0.2) + ' ' + q(-0.56, -0.42) + ' ' + q(-0.2, -0.5) + ' C' + q(0.2, -0.56) + ' ' + q(0.5, -0.34) + ' ' + q(0.66, -0.16) + ' L' + q(0.92, -0.42) + ' Z';
    o += P(hair, c.lg([[0, LY.hairL], [0.35, LY.hair], [0.72, LY.hair], [1, LY.hairD]], 0.7, 0, 0.2, 1), 2);
    o += L('M' + q(0.7, -0.62) + ' C' + q(0.4, -1.0) + ' ' + q(-0.1, -1.2) + ' ' + q(-0.6, -1.12) + ' M' + q(0.3, -0.62) + ' C' + q(-0.1, -0.9) + ' ' + q(-0.6, -0.9) + ' ' + q(-1.05, -0.7), LY.hairD, 1, 0.85);
    o += L('M' + q(0.78, -0.84) + ' C' + q(0.5, -1.2) + ' ' + q(0.1, -1.38) + ' ' + q(-0.2, -1.4), LY.hairL, 1.1, 0.9);
    // long ear swept back and up, over the side of the hair
    var ear = 'M' + q(-0.22, -0.06) + ' C' + q(-0.72, -0.34) + ' ' + q(-1.36, -0.86) + ' ' + q(-2.02, -1.32) + ' C' + q(-1.66, -0.56) + ' ' + q(-1.16, 0.2) + ' ' + q(-0.42, 0.5) + ' Z';
    o += P(ear, c.cel(LY.skin), 1.8);
    o += F('M' + q(-0.46, 0.14) + ' C' + q(-0.96, -0.16) + ' ' + q(-1.42, -0.68) + ' ' + q(-1.76, -1.04) + ' C' + q(-1.42, -0.42) + ' ' + q(-1.02, 0.12) + ' ' + q(-0.52, 0.32) + ' Z', LY.skinD, 0.85);
    return o;
  }
  // torso pieces (fixed in the rig; only the limbs move between poses)
  var VEST = 'M53,45 Q66,40 80,45 C81.5,56 76,66 73.5,75 L57,75 C55.5,66 51.5,56 53,45 Z';
  function lyvTorso(c, tail) {
    var o = '';
    // white under-tunic and the vest's tails
    o += P(tail ? 'M57,73 L63,74 L56,88 L44,95 L49,85 Z' : 'M57,73 L63,74 L58,87 L50,91 L52,83 Z', c.cel(dk(LY.vest, 0.12)), 1.9);
    o += P('M57.5,73 L73.5,73 L75,83.5 Q66,86.5 56.4,83.5 Z', c.cel(LY.white), 1.9) + L('M62,76 L61.4,84.6 M68,76 L68.6,85.4', LY.whiteD, 1.1);
    o += P('M66,73 L74,73 L77,87.5 L70.5,84 Z', c.cel(LY.vest), 1.9);
    o += P(VEST, c.cel(LY.vest), 2.2);
    o += CG(F('M48,40 L59.5,40 L61,80 L48,80 Z', LY.vestD, 0.55) + F('M74,40 L84,40 L84,80 L72,80 Z', '#ffffff', 0.12), c.clip(VEST));
    // quilted padding seams and the cross-laced front
    o += L('M59,48 C60,58 60,66 60,74 M76.5,50 C75.5,60 74,67 72.5,74', LY.vestD, 1, 0.9);
    o += L('M68.6,46 L67.2,74.5', '#2c3a2a', 1.3);
    [51, 57, 63, 69].forEach(function (y) { var x = 68.4 - (y - 46) * 0.05; o += L('M' + n(x - 2) + ',' + n(y - 2) + ' L' + n(x + 2) + ',' + n(y + 2) + ' M' + n(x + 2) + ',' + n(y - 2) + ' L' + n(x - 2) + ',' + n(y + 2), '#243022', 1.3); });
    o += P('M56.6,72 L74,72 L73.5,75.6 L57,75.6 Z', dk(LY.vest, 0.3), 1.4);
    // high dark collar
    o += P('M59.5,35.5 Q67,33 74.5,35 L75.8,44.5 Q67,48 58.6,44.5 Z', c.cel(LY.collar), 2);
    o += L('M60.2,37.4 Q67,35 74,37', lt(LY.collar, 0.35), 1.1, 0.8) + L('M67.4,36 L67.8,46.6', dk(LY.collar, 0.3), 1);
    return o;
  }
  // full figure in sprite coordinates; opts.upper: head, torso and guards only (portrait)
  function lyvRig(c, J, opts) {
    opts = opts || {};
    var o = '';
    if (!opts.upper) {
      o += lyvArm(c, J.bSh, J.bEl, J.bHd, true) + lyvHand(c, J.bHd, true);
      o += lyvLeg(c, J.bHip, J.bKn, J.bFt, true);
      o += lyvLeg(c, J.fHip, J.fKn, J.fFt, false);
    }
    o += guard(c, 56.5, 46.5, 7.6, dk(LY.guard, 0.12));
    o += lyvTorso(c, J.tail);
    o += lyvHead(c, J.head[0], J.head[1], J.head[2]);
    if (!opts.upper) {
      var S = J.shield;
      o += G(kite(c), 'translate(' + n(S[0]) + ',' + n(S[1]) + ') rotate(' + n(S[3]) + ') scale(' + S[2] + ')');
    }
    o += guard(c, 77.5, 47.5, 9.2, LY.guard);
    if (!opts.upper) {
      o += lyvArm(c, J.fSh, J.fEl, J.fHd, false);
      o += G(lsword(c, J.sword[1]), 'translate(' + n(J.fHd[0]) + ',' + n(J.fHd[1]) + ') rotate(' + n(J.sword[0]) + ')');
      o += lyvHand(c, J.fHd, false);
    }
    return o;
  }
  function lyveusSprite(c) { return shadow(c, 64, 28) + G(lyvRig(c, POSE_SPRITE), 'matrix(1.05,0,0,1.05,-3.2,-6.1)'); }
  function lyveusActor(c) {
    var keep = SWM; SWM = 0.8;
    try { return E(96, 155, 40, 5, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])) + G(lyvRig(c, POSE_ACTOR), 'matrix(-1.25,0,0,1.25,176,2.5)'); } finally { SWM = keep; }
  }

  // =====================================================================
  // VYN: Lyveus's comrade, a young Stormwind guard in blue-and-gold plate, his helm under his arm.
  // Same sprite-coordinate rig idea, mirrored into the 160 actor box.
  // =====================================================================
  var VY = { skin: '#f0c4a0', hair: '#7a4e2c', steel: '#b9c3cd', blue: '#2f5eb2', gold: '#e0b44a', leather: '#5a3a22' };
  function plateLeg(c, h, kn, f, back) {
    var st = back ? dk(VY.steel, 0.18) : VY.steel, o = '';
    o += tube([h, kn, [f[0], f[1] - 3]], 9.4, st, back ? null : dk(st, 0.25));
    o += C(kn[0] + 1, kn[1], 4.6, c.cel(lt(st, 0.1)), 1.8) + C(kn[0] + 1, kn[1], 1.6, c.cel(VY.gold), 1);
    var x = f[0], y = f[1] + 5;
    o += P('M' + n(x - 5.2) + ',' + n(y - 10) + ' L' + n(x + 3) + ',' + n(y - 10) + ' C' + n(x + 6) + ',' + n(y - 6) + ' ' + n(x + 11.5) + ',' + n(y - 4.4) + ' ' + n(x + 11.5) + ',' + n(y - 1) + ' L' + n(x + 11.5) + ',' + n(y) + ' L' + n(x - 5.6) + ',' + n(y) + ' Z', c.cel(dk(st, 0.08)), 2.1);
    o += L('M' + n(x - 4.8) + ',' + n(y - 5.6) + ' L' + n(x + 5) + ',' + n(y - 5.6), dk(st, 0.4), 1, 0.8);
    return o;
  }
  function plateArm(c, sh, el, hd, back) {
    var st = back ? dk(VY.steel, 0.18) : VY.steel;
    return tube([sh, el, hd], 8.4, st, back ? null : dk(st, 0.25)) + C(el[0], el[1], 3.8, c.cel(VY.gold), 1.6);
  }
  function gauntlet(c, hd, back) { return C(hd[0], hd[1], 5, c.cel(back ? dk(VY.steel, 0.2) : lt(VY.steel, 0.05)), 2.1) + L('M' + n(hd[0] - 2.6) + ',' + n(hd[1] - 1) + ' L' + n(hd[0] + 2.8) + ',' + n(hd[1] - 1.6), dk(VY.steel, 0.4), 1); }
  function lionCrest(c, x, y, r) {
    var sp = '';
    for (var i = 0; i < 10; i++) {
      var a = i / 10 * PI * 2, a2 = a + PI / 10, a3 = a - PI / 10;
      sp += (i ? ' L' : 'M') + n(x + Math.cos(a3) * r) + ',' + n(y + Math.sin(a3) * r) + ' L' + n(x + Math.cos(a) * r * 1.55) + ',' + n(y + Math.sin(a) * r * 1.55) + ' L' + n(x + Math.cos(a2) * r) + ',' + n(y + Math.sin(a2) * r);
    }
    return P(sp + ' Z', c.cel(VY.gold), 1) + C(x, y, r * 0.82, lt(VY.gold, 0.2), 1) + E(x - r * 0.22, y - r * 0.1, r * 0.3, r * 0.22, dk(VY.gold, 0.35));
  }
  function vynHelm(c, x, y) {
    // open-faced Stormwind guard helm seen from the side (face opening to the right): steel dome, gold brow band,
    // a flared neck guard behind, a cheek guard, and a blue crest along the top
    var o = '';
    o += P('M' + n(x - 9) + ',' + n(y - 7) + ' C' + n(x - 6) + ',' + n(y - 15) + ' ' + n(x + 5) + ',' + n(y - 16) + ' ' + n(x + 9) + ',' + n(y - 10) + ' L' + n(x + 6.4) + ',' + n(y - 8.6) + ' C' + n(x + 3) + ',' + n(y - 12) + ' ' + n(x - 4) + ',' + n(y - 11) + ' ' + n(x - 6.6) + ',' + n(y - 5.4) + ' Z', c.cel(VY.blue), 1.6);
    o += L('M' + n(x - 5) + ',' + n(y - 12) + ' L' + n(x - 3.4) + ',' + n(y - 9.6) + ' M' + n(x - 1) + ',' + n(y - 14) + ' L' + n(x) + ',' + n(y - 11) + ' M' + n(x + 3.4) + ',' + n(y - 14) + ' L' + n(x + 3) + ',' + n(y - 11), dk(VY.blue, 0.35), 0.9);
    var dome = 'M' + n(x - 11) + ',' + n(y + 4) + ' C' + n(x - 12) + ',' + n(y - 10) + ' ' + n(x + 9) + ',' + n(y - 13) + ' ' + n(x + 10.4) + ',' + n(y + 0.4) + ' L' + n(x + 3.6) + ',' + n(y + 0.8) + ' L' + n(x + 3.2) + ',' + n(y + 7) + ' L' + n(x - 1.6) + ',' + n(y + 11.4) + ' L' + n(x - 4.4) + ',' + n(y + 6.6) + ' L' + n(x - 12.6) + ',' + n(y + 9) + ' Z';
    o += P(dome, c.cel(VY.steel), 2);
    o += F('M' + n(x + 3.6) + ',' + n(y + 0.8) + ' L' + n(x + 10.4) + ',' + n(y + 0.4) + ' L' + n(x + 9.4) + ',' + n(y + 7) + ' L' + n(x + 3.2) + ',' + n(y + 7) + ' Z', '#1e1e28', 0.95);
    o += L('M' + n(x - 11.4) + ',' + n(y + 1) + ' C' + n(x - 6) + ',' + n(y - 1) + ' ' + n(x + 4) + ',' + n(y - 1.4) + ' ' + n(x + 10.4) + ',' + n(y + 0.4), OL, 3.6) + L('M' + n(x - 11.4) + ',' + n(y + 1) + ' C' + n(x - 6) + ',' + n(y - 1) + ' ' + n(x + 4) + ',' + n(y - 1.4) + ' ' + n(x + 10.4) + ',' + n(y + 0.4), VY.gold, 1.9);
    o += C(x - 3.6, y + 4.6, 1.5, c.cel(VY.gold), 0.9) + L('M' + n(x - 7) + ',' + n(y - 6.6) + ' Q' + n(x - 2) + ',' + n(y - 9.4) + ' ' + n(x + 4) + ',' + n(y - 7.6), '#ffffff', 1.2, 0.75);
    return o;
  }
  function vynHead(c, X, Y, r) {
    function q(u, v) { return n(X + r * u) + ',' + n(Y + r * v); }
    var o = '', sk = VY.skin, hc = VY.hair;
    var face = 'M' + q(-1, 0.05) + ' C' + q(-1, -1.3) + ' ' + q(0.95, -1.3) + ' ' + q(1, -0.15) + ' L' + q(1.2, 0.3) + ' L' + q(0.98, 0.5) +
      ' C' + q(0.96, 0.95) + ' ' + q(0.35, 1.12) + ' ' + q(-0.15, 1.04) + ' C' + q(-0.8, 0.96) + ' ' + q(-1, 0.5) + ' ' + q(-1, 0.05) + ' Z';
    o += P(face, c.cel(sk), 2.1);
    o += C(X - r * 0.36, Y + r * 0.14, r * 0.26, c.cel(sk), 1.4);
    // short brown beard along the jaw and chin
    o += P('M' + q(-0.62, 0.2) + ' C' + q(-0.5, 0.74) + ' ' + q(-0.1, 1.06) + ' ' + q(0.36, 1.12) + ' C' + q(0.72, 1.12) + ' ' + q(0.98, 0.9) + ' ' + q(0.99, 0.56) +
      ' L' + q(0.84, 0.62) + ' C' + q(0.66, 0.46) + ' ' + q(0.46, 0.5) + ' ' + q(0.34, 0.66) + ' C' + q(0.1, 0.62) + ' ' + q(-0.2, 0.46) + ' ' + q(-0.46, 0.14) + ' Z', c.cel(hc), 1.6);
    // kind smile over the beard, rosy cheek
    o += P('M' + q(0.42, 0.64) + ' Q' + q(0.66, 0.66) + ' ' + q(0.94, 0.58) + ' Q' + q(0.84, 0.92) + ' ' + q(0.62, 0.9) + ' Q' + q(0.46, 0.84) + ' ' + q(0.42, 0.64) + ' Z', '#5a1a18', 1) +
      F('M' + q(0.47, 0.66) + ' Q' + q(0.66, 0.68) + ' ' + q(0.9, 0.6) + ' L' + q(0.86, 0.7) + ' Q' + q(0.66, 0.76) + ' ' + q(0.5, 0.74) + ' Z', '#ffffff', 0.95);
    o += E(X + r * 0.3, Y + r * 0.34, 2.2, 1.3, '#f08a78', 0, 0.45);
    var ex = X + r * 0.5, ey = Y - r * 0.04;
    o += E(ex, ey, 2.1, 1.9, '#fbf6ee') + C(ex + 0.6, ey + 0.2, 1.3, '#4a7ab8') + C(ex + 0.8, ey + 0.2, 0.6, '#101828') + C(ex + 0.2, ey - 0.4, 0.45, '#ffffff');
    o += L('M' + n(ex - 2.4) + ',' + n(ey - 1) + ' Q' + n(ex) + ',' + n(ey - 2.4) + ' ' + n(ex + 2.4) + ',' + n(ey - 1.1), OL, 1);
    // short tousled brown hair
    o += P('M' + q(0.9, -0.62) + ' C' + q(0.9, -1.36) + ' ' + q(-0.4, -1.58) + ' ' + q(-1.05, -0.9) + ' C' + q(-1.25, -0.5) + ' ' + q(-1.2, 0) + ' ' + q(-1.04, 0.3) +
      ' L' + q(-0.72, 0.1) + ' C' + q(-0.6, -0.24) + ' ' + q(-0.46, -0.5) + ' ' + q(-0.2, -0.62) + ' L' + q(0.06, -0.5) + ' L' + q(0.2, -0.74) + ' L' + q(0.44, -0.54) + ' L' + q(0.6, -0.76) + ' L' + q(0.9, -0.62) + ' Z', c.cel(hc), 2);
    o += L('M' + n(ex - 3) + ',' + n(ey - 3.4) + ' Q' + n(ex - 0.4) + ',' + n(ey - 5) + ' ' + n(ex + 2.8) + ',' + n(ey - 4), dk(hc, 0.2), 1.6);

    o += L('M' + q(-0.6, -0.9) + ' C' + q(-0.2, -1.15) + ' ' + q(0.2, -1.12) + ' ' + q(0.5, -0.9), lt(hc, 0.35), 1.3, 0.8);
    o += L('M' + q(-0.98, -0.1) + ' C' + q(-0.9, 0.3) + ' ' + q(-0.8, 0.5) + ' ' + q(-0.66, 0.6), hc, 2.4) ;
    return o;
  }
  function vynRig(c) {
    var o = '';
    var bSh = [57, 49], bEl = [50.5, 63], bHd = [54, 75.5], fSh = [76, 49], fEl = [85, 61], fHd = [90, 73];
    // sword sheathed at the back hip, his hand resting on the hilt
    o += P('M53.4,80.6 L59,81.6 L43.6,109.6 L39,107.2 Z', c.cel(dk(VY.blue, 0.35)), 1.8) + L('M50.4,88 L55,89.4 M45.6,97 L50,98.6', VY.gold, 1.4) + P('M39,107.2 L43.6,109.6 L40,114.6 L37,111 Z', c.cel(VY.gold), 1.4);
    o += P('M49.4,79.4 L62.8,82.2 L62.2,84.8 L48.8,82 Z', c.cel(VY.gold), 1.4) + L('M56,81.4 L54.2,72', OL, 5.6) + L('M56,81.4 L54.2,72', '#5a3a22', 3.2);
    o += plateArm(c, bSh, bEl, bHd, true);
    o += gauntlet(c, bHd, true) + C(53.4, 69.8, 2.6, c.cel(VY.gold), 1.3);
    o += plateLeg(c, [61, 80], [59, 99], [56, 117], true);
    o += plateLeg(c, [68, 80], [71.5, 99], [74, 117], false);
    // faulds, the blue tabard strip, belt
    o += P('M56,74 L75,74 L78,88 Q66,91 53,88 Z', c.cel(VY.steel), 2) + L('M55,80.6 Q66,83 76.6,80.6 M54,85.4 Q66,88 77.6,85.4', dk(VY.steel, 0.35), 1.1);
    o += P('M62,76 L71,76 L72,97 L66.5,94 L61,97 Z', c.cel(VY.blue), 1.8) + L('M63,78 L63.4,94.6 M70,78 L70.6,94.6', VY.gold, 1.2);
    o += guard(c, 55.4, 46.5, 9.6, dk(VY.blue, 0.1));
    // breastplate: blue enamel, gold trim, the lion crest
    var bp = 'M52,46 Q66,40 81,46 C82,58 77,68 74.5,76 L56.5,76 C55,68 51,58 52,46 Z';
    o += P(bp, c.cel(VY.blue), 2.2) + CG(F('M47,40 L58.6,40 L60,80 L47,80 Z', '#000000', 0.25) + F('M70,42 Q78,52 76,66 L73,66 Q74,52 68,43 Z', '#ffffff', 0.25), c.clip(bp));
    o += L('M53.4,48.6 Q66,43 79.6,48.6', VY.gold, 1.8) + L('M69,47 L67.6,74', dk(VY.blue, 0.35), 1.1);
    o += lionCrest(c, 68.6, 58, 3.6);
    o += P('M55.6,72.6 L75.4,72.6 L75,77 L56,77 Z', c.cel(VY.leather), 1.6) + R(64.8, 71.8, 5.4, 5.8, c.cel(VY.gold), 1.3);
    // gorget, neck, head
    o += P('M59.6,37 Q67,34.4 74.4,36.6 L75.4,44.6 Q67,47.4 58.8,44.6 Z', c.cel(VY.steel), 1.9) + L('M60,41.4 Q67,39.4 75,41.2', VY.gold, 1.2);
    o += vynHead(c, 68, 27.5, 11);
    // the helm tucked under his near arm, held from below
    o += plateArm(c, fSh, fEl, fHd, false);
    o += guard(c, 78, 47.5, 11.4, VY.blue) + L('M67.8,50.6 C71,45.6 84.6,45.6 88.6,50.6', VY.gold, 1.7);
    o += G(vynHelm(c, 0, 0), 'translate(89,67) rotate(-8) scale(1.2)');
    o += gauntlet(c, [92, 79], false);
    return o;
  }
  function vynActor(c) {
    var keep = SWM; SWM = 0.8;
    try { return E(82, 155, 36, 5, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])) + G(vynRig(c), 'matrix(-1.32,0,0,1.32,170,-6)'); } finally { SWM = keep; }
  }

  // =====================================================================
  // LORD CASSIUS MARROW: court noble of Lady Prestor's cabal, drawn facing right then mirrored (mobs face left).
  // Fencer's stance: silver rapier thrust forward, the back hand raised, short cape flaring behind.
  // =====================================================================
  var CM = { skin: '#e8c8b0', hair: '#1c1822', black: '#2c2636', purple: '#50246e', silver: '#cfd4de', lining: '#6a2e8e' };
  function cassiusRig(c) {
    var o = '';
    var bSh = [57.5, 48], bEl = [47, 43], bHd = [41, 32], fSh = [76.5, 49], fEl = [87, 54], fHd = [97, 56];
    // short cape flaring out behind, purple lining showing
    o += P('M58,43 C48,50 38,62 30,80 L38,77 L41,86 L48,78 L55,85 L60,68 Z', c.lg([[0, CM.lining], [1, dk(CM.lining, 0.4)]], 0, 0, 1, 1), 2.2);
    o += P('M59,43 C52,52 46,62 42,78 L48,76 L50,82 L56,76 L60,80 L63,60 Z', c.cel(CM.black), 2);
    o += L('M42,78 L48,76 L50,82 L56,76 L60,80', CM.silver, 1.2);
    // back arm raised behind, black glove
    o += tube([bSh, bEl, bHd], 7.2, dk(CM.black, 0.1));
    o += tube([lerp(bEl, bHd, 0.55), bHd], 8.2, '#141018') + L('M' + n(lerp(bEl, bHd, 0.55)[0] - 3.6) + ',' + n(lerp(bEl, bHd, 0.55)[1] + 1.6) + ' L' + n(lerp(bEl, bHd, 0.55)[0] + 3.4) + ',' + n(lerp(bEl, bHd, 0.55)[1] - 2.2), CM.silver, 1.4);
    o += P('M' + n(bHd[0] - 3.6) + ',' + n(bHd[1] + 2) + ' C' + n(bHd[0] - 5.4) + ',' + n(bHd[1] - 2) + ' ' + n(bHd[0] - 3) + ',' + n(bHd[1] - 7.4) + ' ' + n(bHd[0] + 0.6) + ',' + n(bHd[1] - 7) + ' C' + n(bHd[0] + 4.4) + ',' + n(bHd[1] - 6.4) + ' ' + n(bHd[0] + 5) + ',' + n(bHd[1] - 1) + ' ' + n(bHd[0] + 3.2) + ',' + n(bHd[1] + 2.4) + ' Z', c.cel('#2a2230'), 2) +
      L('M' + n(bHd[0] - 1.6) + ',' + n(bHd[1] - 6.6) + ' L' + n(bHd[0] - 1.2) + ',' + n(bHd[1] - 3) + ' M' + n(bHd[0] + 1) + ',' + n(bHd[1] - 6.8) + ' L' + n(bHd[0] + 1) + ',' + n(bHd[1] - 3.2), '#4a4056', 0.9);
    // legs: black breeches, tall boots with silver cuffs, a lunge
    function legC(h, kn, f, back) {
      var col = back ? '#16121c' : CM.black, s = tube([h, kn], 8.4, back ? '#2c2434' : '#3a3044');
      s += tube([kn, [f[0], f[1] - 3]], 8.8, col, back ? null : '#3e3448');
      var x = f[0], y = f[1] + 5;
      s += P('M' + n(x - 5) + ',' + n(y - 9) + ' L' + n(x + 3) + ',' + n(y - 9) + ' C' + n(x + 6) + ',' + n(y - 6) + ' ' + n(x + 11) + ',' + n(y - 4) + ' ' + n(x + 11.5) + ',' + n(y) + ' L' + n(x - 5.5) + ',' + n(y) + ' Z', c.cel(col), 2.1);
      s += P('M' + n(kn[0] - 6) + ',' + n(kn[1] - 1) + ' L' + n(kn[0] + 6) + ',' + n(kn[1] - 3) + ' L' + n(kn[0] + 6.4) + ',' + n(kn[1] + 3) + ' L' + n(kn[0] - 5.6) + ',' + n(kn[1] + 4) + ' Z', c.cel(col), 1.8) + L('M' + n(kn[0] - 5.4) + ',' + n(kn[1] + 3.4) + ' L' + n(kn[0] + 6) + ',' + n(kn[1] + 2.4), CM.silver, 1.3);
      return s;
    }
    o += legC([60, 82], [51, 100], [44, 117], true);
    o += legC([69, 82], [80, 98], [86, 117], false);
    // the doublet: black with a deep purple front, silver trim, a flared peplum
    o += P('M55.5,79 L76,79 L81,91 L71,88 L66,92 L60,88 L50,91 Z', c.cel(CM.black), 2) + L('M51.4,89.6 L60,87 L66,90.6 L71,87 L79.6,89.6', CM.silver, 1.2);
    var dbl = 'M54,46 Q67,40.5 80.5,46 C81.5,58 77,70 75,81 L57,81 C56,70 52.5,58 54,46 Z';
    o += P(dbl, c.cel(CM.black), 2.2);
    o += CG(F('M65,40 L82,44 L79,82 L64.4,82 Z', c.cel(CM.purple)) + F('M49,40 L58,40 L60,82 L49,82 Z', '#000000', 0.3), c.clip(dbl));
    o += L('M65,42 L64.4,81', CM.silver, 1.6) + L('M65,42 L64.4,81', OL, 0.5);
    [50, 56, 62, 68, 74].forEach(function (y) { o += C(66.6, y, 0.95, CM.silver, 0.6); });
    o += L('M68,48 C71,54 74,56 78,56 M68,58 C71,63 74,64 77,64', lt(CM.purple, 0.25), 1, 0.7);
    // silver chain across the chest from the dragon brooch
    o += L('M72.6,51 Q66,58 58.4,56', CM.silver, 1.2) + L('M72.6,51 Q66,58 58.4,56', OL, 0.4, 0.5);
    o += P('M55.6,77.4 L76,77.4 L75.6,81.4 L56.2,81.4 Z', '#18141e', 1.4) + R(63.4, 76.8, 5, 5, c.cel(CM.silver), 1.2);
    // high stiff collar rising behind the head, purple inside
    o += P('M59,44 C54,38 52,30 54,22 C58,28 63,33 68,38 L66,44 Z', c.lg([[0, CM.lining], [1, dk(CM.purple, 0.3)]], 0, 0, 1, 1), 1.9) + L('M54,22 C53,30 55,38 59,44', CM.silver, 1.3);
    o += P('M60,37 Q67,34.5 74,36.5 L75,44.4 Q67,47 59,44.4 Z', c.cel(CM.black), 1.8) + L('M60.4,43.6 Q67,46.2 74.6,43.6', CM.silver, 1.2);
    // the small black dragon brooch, the cabal's sign
    o += C(73, 50.6, 3.8, c.cel(CM.silver), 1.2);
    o += P('M70.4,52.6 C71,50 72.6,48.6 74.6,48.6 L76.4,47.2 L75.8,49.4 C75.2,51 73.8,52 72.4,52 L74,53.8 L71.8,53.2 Z M71.6,50.4 L69.8,47.8 L72.8,49.2 Z', '#0c0a10', 0.6) + C(74.8, 49.2, 0.4, '#ff3a3a');
    // head: lean, cruel, slicked dark hair greying at the temple, a thin beard
    var X = 70.5, Y = 25, r = 10;
    function q(u, v) { return n(X + r * u) + ',' + n(Y + r * v); }
    o += P('M' + q(-0.7, -0.9) + ' C' + q(-1.4, -0.7) + ' ' + q(-1.6, 0.2) + ' ' + q(-1.3, 0.72) + ' L' + q(-0.8, 0.46) + ' Z', c.cel(CM.hair), 1.8);
    var face = 'M' + q(-1, 0.05) + ' C' + q(-1, -1.3) + ' ' + q(0.95, -1.3) + ' ' + q(1, -0.2) + ' L' + q(1.34, 0.36) + ' L' + q(1.02, 0.5) +
      ' C' + q(0.98, 0.96) + ' ' + q(0.5, 1.2) + ' ' + q(0.1, 1.14) + ' C' + q(-0.7, 1.02) + ' ' + q(-1, 0.55) + ' ' + q(-1, 0.05) + ' Z';
    o += P(face, c.cel(CM.skin), 2.1);
    o += CG(F('M' + q(-1.1, -0.1) + ' L' + q(-0.2, -0.1) + ' C' + q(-0.3, 0.5) + ' ' + q(0, 0.9) + ' ' + q(0.4, 1.3) + ' L' + q(-1.1, 1.3) + ' Z', dk(CM.skin, 0.3), 0.45), c.clip(face));
    o += L('M' + q(0.12, 0.32) + ' C' + q(0.2, 0.52) + ' ' + q(0.3, 0.62) + ' ' + q(0.42, 0.66), dk(CM.skin, 0.4), 1, 0.8);
    o += C(X - r * 0.36, Y + r * 0.12, r * 0.24, c.cel(CM.skin), 1.3);
    // thin beard along the jaw to a pointed chin, thin moustache, a smirk
    o += P('M' + q(-0.46, 0.4) + ' C' + q(-0.26, 0.9) + ' ' + q(0.1, 1.1) + ' ' + q(0.44, 1.14) + ' L' + q(0.6, 1.46) + ' L' + q(0.78, 1.08) + ' C' + q(0.86, 1.02) + ' ' + q(0.9, 0.96) + ' ' + q(0.9, 0.9) +
      ' C' + q(0.7, 0.98) + ' ' + q(0.5, 1.02) + ' ' + q(0.38, 1.0) + ' C' + q(0.08, 0.96) + ' ' + q(-0.2, 0.8) + ' ' + q(-0.4, 0.38) + ' Z', CM.hair, 0.9);
    o += P('M' + q(0.5, 0.68) + ' C' + q(0.66, 0.6) + ' ' + q(0.9, 0.6) + ' ' + q(1.04, 0.64) + ' L' + q(1.0, 0.72) + ' C' + q(0.86, 0.68) + ' ' + q(0.68, 0.72) + ' ' + q(0.52, 0.78) + ' Z', CM.hair, 0.8);
    o += L('M' + q(0.58, 0.86) + ' Q' + q(0.78, 0.86) + ' ' + q(0.96, 0.76), '#4a1a1a', 1.1);
    var ex = X + r * 0.52, ey = Y - r * 0.04;
    o += P('M' + n(ex - 2.4) + ',' + n(ey) + ' Q' + n(ex) + ',' + n(ey - 1.6) + ' ' + n(ex + 2.6) + ',' + n(ey - 0.2) + ' Q' + n(ex) + ',' + n(ey + 1.3) + ' ' + n(ex - 2.4) + ',' + n(ey) + ' Z', '#f4efe6', 0.8);
    o += C(ex + 0.7, ey - 0.1, 1, '#5a4a7a') + C(ex + 0.8, ey - 0.1, 0.45, '#0a0810');
    o += P('M' + n(ex - 3.4) + ',' + n(ey - 4.4) + ' L' + n(ex + 3.2) + ',' + n(ey - 1.6) + ' L' + n(ex + 3) + ',' + n(ey - 2.9) + ' L' + n(ex - 3) + ',' + n(ey - 5.6) + ' Z', CM.hair, 0.8);
    // slicked-back hair, a grey streak at the temple, widow's peak
    o += P('M' + q(0.9, -0.5) + ' C' + q(0.9, -1.3) + ' ' + q(-0.4, -1.5) + ' ' + q(-1.08, -0.9) + ' C' + q(-1.3, -0.5) + ' ' + q(-1.2, 0) + ' ' + q(-1.0, 0.28) +
      ' L' + q(-0.66, 0.1) + ' C' + q(-0.56, -0.2) + ' ' + q(-0.4, -0.4) + ' ' + q(-0.1, -0.5) + ' L' + q(0.46, -0.3) + ' Z', c.lg([[0, '#4a4058'], [0.4, CM.hair], [1, '#0a080c']], 0.7, 0, 0.3, 1), 1.9);
    o += L('M' + q(0.6, -0.8) + ' C' + q(0.1, -1.1) + ' ' + q(-0.5, -1.0) + ' ' + q(-0.95, -0.6) + ' M' + q(0.7, -0.6) + ' C' + q(0.2, -0.8) + ' ' + q(-0.3, -0.76) + ' ' + q(-0.8, -0.4), '#6a6078', 1, 0.8);
    o += L('M' + q(-0.1, -0.44) + ' C' + q(-0.4, -0.5) + ' ' + q(-0.7, -0.3) + ' ' + q(-0.86, 0.02), '#a8a8b4', 1.4, 0.95);
    // the rapier: thin silver blade thrust forward, a swept hilt round the hand
    var blade = 'M' + n(fHd[0] + 3) + ',' + n(fHd[1] - 1.2) + ' L124.6,49.6 L' + n(fHd[0] + 3.4) + ',' + n(fHd[1] + 0.8) + ' Z';
    o += P(blade, c.lg([[0, '#ffffff'], [0.5, '#c8d0dc'], [1, '#7a8494']], 0, 0, 0, 1), 1.3) + L('M' + n(fHd[0] + 4) + ',' + n(fHd[1] - 0.5) + ' L121,50.6', '#ffffff', 0.7, 0.9);
    o += tube([fSh, fEl, fHd], 7.6, CM.black, '#3e3448');
    o += E(fSh[0] + 1.5, fSh[1] + 1, 7.2, 6, c.cel(CM.purple), 2) + L('M' + n(fSh[0] - 3) + ',' + n(fSh[1] - 2.6) + ' Q' + n(fSh[0] + 1) + ',' + n(fSh[1] + 3) + ' ' + n(fSh[0] + 1) + ',' + n(fSh[1] + 7), CM.silver, 1.2);
    o += tube([lerp(fEl, fHd, 0.5), fHd], 8.2, '#141018') + L('M' + n(lerp(fEl, fHd, 0.5)[0] - 0.6) + ',' + n(lerp(fEl, fHd, 0.5)[1] - 4) + ' L' + n(lerp(fEl, fHd, 0.5)[0] + 0.4) + ',' + n(lerp(fEl, fHd, 0.5)[1] + 4), CM.silver, 1.5);
    o += C(fHd[0], fHd[1], 4.4, c.cel('#2a2230'), 2);
    o += L('M' + n(fHd[0] + 1.6) + ',' + n(fHd[1] - 6.4) + ' C' + n(fHd[0] + 6) + ',' + n(fHd[1] - 6) + ' ' + n(fHd[0] + 6) + ',' + n(fHd[1] + 4) + ' ' + n(fHd[0] + 1) + ',' + n(fHd[1] + 6.4), OL, 3.4) +
      L('M' + n(fHd[0] + 1.6) + ',' + n(fHd[1] - 6.4) + ' C' + n(fHd[0] + 6) + ',' + n(fHd[1] - 6) + ' ' + n(fHd[0] + 6) + ',' + n(fHd[1] + 4) + ' ' + n(fHd[0] + 1) + ',' + n(fHd[1] + 6.4), CM.silver, 1.6);
    o += L('M' + n(fHd[0] + 4.2) + ',' + n(fHd[1] - 5) + ' L' + n(fHd[0] + 4.6) + ',' + n(fHd[1] + 3.4), OL, 3.6) + L('M' + n(fHd[0] + 4.2) + ',' + n(fHd[1] - 5) + ' L' + n(fHd[0] + 4.6) + ',' + n(fHd[1] + 3.4), CM.silver, 1.8);
    o += C(fHd[0] - 3.2, fHd[1] + 1.4, 1.8, c.cel(CM.silver), 1.1);
    return o;
  }
  function cassiusMob(c) { return shadow(c, 64, 30) + G(cassiusRig(c), 'matrix(-1,0,0,1,128,0)'); }

  // =====================================================================
  // SCENE: silverleaf_lodge (400 x 240)
  // =====================================================================
  function pine(c, x, base, h, w, col, rim, burnt, seed) {
    var r = rng(seed || 3), o = '', tr = burnt === 2 ? '#1c1614' : '#3a2a22';
    o += P('M' + n(x - w * 0.09) + ',' + n(base) + ' L' + n(x - 0.8) + ',' + n(base - h) + ' L' + n(x + 0.8) + ',' + n(base - h) + ' L' + n(x + w * 0.09) + ',' + n(base) + ' Z', tr, 1.2);
    if (burnt === 2) {
      // bare charred snag: stubby broken branches
      var br = '';
      for (var i = 0; i < 9; i++) { var y = base - h * (0.25 + i * 0.075), s = i % 2 ? 1 : -1, len = w * (0.5 - i * 0.04) * (0.6 + r() * 0.5); br += 'M' + n(x) + ',' + n(y) + ' L' + n(x + s * len) + ',' + n(y - len * 0.3 + r() * 3); }
      return o + L(br, OL, 3.2) + L(br, '#2a201c', 1.6);
    }
    var tiers = Math.max(4, Math.round(h / 12));
    for (var t = 0; t < tiers; t++) {
      var f = t / tiers, ty = base - h * 0.2 - h * 0.8 * f, tw = w * (1 - f * 0.82) * (0.9 + r() * 0.2), th = h * 0.8 / tiers * 1.9;
      var cc = burnt === 1 && t < tiers * 0.45 ? '#2a221e' : col;
      o += P('M' + n(x - tw) + ',' + n(ty + 3) + ' Q' + n(x - tw * 0.45) + ',' + n(ty - th * 0.3) + ' ' + n(x) + ',' + n(ty - th) + ' Q' + n(x + tw * 0.45) + ',' + n(ty - th * 0.3) + ' ' + n(x + tw) + ',' + n(ty + 3) +
        ' Q' + n(x + tw * 0.5) + ',' + n(ty) + ' ' + n(x) + ',' + n(ty + 2) + ' Q' + n(x - tw * 0.5) + ',' + n(ty) + ' ' + n(x - tw) + ',' + n(ty + 3) + ' Z', cc, 1.3);
      if (rim && cc === col) o += L('M' + n(x + tw * 0.15) + ',' + n(ty - th * 0.7) + ' Q' + n(x + tw * 0.55) + ',' + n(ty - th * 0.2) + ' ' + n(x + tw * 0.92) + ',' + n(ty + 2), rim, 1.2, 0.7);
    }
    return o;
  }
  function tuft(x, y, s, col) { return F('M' + n(x - 3 * s) + ',' + n(y) + ' L' + n(x - 2.2 * s) + ',' + n(y - 5 * s) + ' L' + n(x - 0.9 * s) + ',' + n(y - 1.2 * s) + ' L' + n(x + 0.2 * s) + ',' + n(y - 7 * s) + ' L' + n(x + 0.9 * s) + ',' + n(y - 1.2 * s) + ' L' + n(x + 2.4 * s) + ',' + n(y - 5.4 * s) + ' L' + n(x + 3 * s) + ',' + n(y) + ' Z', col); }
  function lodgeScene(c) {
    var r = rng(4117), s = '';
    var CH = '#2a201c', CHL = '#4a3428', WOODL = '#b8986e', STONE = '#9a938a';
    // muted sunset sky
    s += R(0, 0, 400, 240, c.lg([[0, '#3e3e5e'], [0.25, '#665672'], [0.43, '#a8767a'], [0.53, '#d89a78'], [0.6, '#eab88a']]));
    s += C(300, 112, 120, glow(c, '#ffd6a0', 0.6));
    s += C(300, 116, 16, c.rg([[0, '#fff4dc'], [0.7, '#ffd8a4'], [1, '#f6b478']]));
    // long thin clouds, lit from below
    [[40, 34, 110, 5], [150, 22, 90, 4], [230, 58, 130, 5], [60, 76, 80, 4], [320, 40, 70, 3.5]].forEach(function (q) {
      var x = q[0], y = q[1], w = q[2], h = q[3];
      s += F('M' + x + ',' + y + ' Q' + n(x + w * 0.3) + ',' + n(y - h * 1.6) + ' ' + n(x + w * 0.6) + ',' + n(y - h) + ' Q' + n(x + w * 0.85) + ',' + n(y - h * 1.8) + ' ' + (x + w) + ',' + y + ' Q' + n(x + w * 0.5) + ',' + n(y + h) + ' ' + x + ',' + y + ' Z', '#8a6a80', 0.85);
      s += L('M' + n(x + w * 0.1) + ',' + n(y + h * 0.3) + ' Q' + n(x + w * 0.5) + ',' + n(y + h * 0.9) + ' ' + n(x + w * 0.9) + ',' + n(y + h * 0.2), '#f0b494', 1.3, 0.8);
    });
    // soft sun rays
    s += F('M300,116 L180,0 L222,0 Z M300,116 L262,0 L290,0 Z M300,116 L360,0 L398,0 Z', '#fff0d0', 0.08);
    // far highland hills
    s += F('M0,118 C40,108 84,104 132,110 C184,116 222,100 272,104 C320,108 360,100 400,106 L400,150 L0,150 Z', '#7a6c88');
    s += F('M0,126 C60,116 110,122 160,118 C220,114 262,124 312,118 C352,114 382,120 400,118 L400,150 L0,150 Z', '#5f6474');
    // far treeline of pines
    var tl = '';
    for (var x = -4; x < 406; x += 6 + r() * 5) { var h = 12 + r() * 16, w = 3 + r() * 2.5, b = 134 + r() * 2; tl += 'M' + n(x - w) + ',' + n(b) + ' L' + n(x) + ',' + n(b - h) + ' L' + n(x + w) + ',' + n(b) + ' Z'; }
    s += F(tl, '#3c4640') + R(0, 130, 400, 8, '#3c4640');
    // ground: scorched meadow, warm sunset light
    s += P('M0,132 C80,128 160,134 240,130 C300,127 350,131 400,129 L400,240 L0,240 Z', c.lg([[0, '#6e5e42'], [0.35, '#54463a'], [1, '#2e2622']]), 0);
    // burned patches and ash
    [[60, 170, 46, 8], [256, 150, 54, 6], [150, 206, 64, 10], [330, 198, 46, 8], [210, 176, 32, 5]].forEach(function (q, i) {
      var x = q[0], y = q[1], w = q[2], h = q[3], d = 'M' + (x - w) + ',' + y;
      for (var k = 1; k <= 8; k++) { var a = PI + k / 8 * PI * 2, rr = 0.7 + r() * 0.45; d += ' Q' + n(x + Math.cos(a - PI / 8) * w * 1.05) + ',' + n(y + Math.sin(a - PI / 8) * h * 1.1) + ' ' + n(x + Math.cos(a) * w * rr) + ',' + n(y + Math.sin(a) * h * rr); }
      s += F(d + ' Z', '#1e1816', 0.42) + L('M' + n(x - w * 0.5) + ',' + n(y - h * 0.1) + ' Q' + n(x) + ',' + n(y - h * 0.5) + ' ' + n(x + w * 0.45) + ',' + n(y), '#8a8278', 1.6, 0.4);
    });
    // back pines, a burned snag
    s += pine(c, 226, 134, 96, 12, '#2c3c34', null, 2, 9);
    s += pine(c, 244, 132, 70, 16, '#34463a', '#b08a5a', 1, 5);
    // the small pavilion behind (right): swept spire roof, burned through
    s += R(262, 124, 60, 6, STONE, 1.3);
    [268, 292, 316].forEach(function (px, i) { s += R(px - 2, i === 2 ? 110 : 100, 4, i === 2 ? 14 : 24, CH, 1.1); });
    s += P('M258,100 C272,96 284,82 292,54 C300,82 312,96 326,100 Q292,105 258,100 Z', c.lg([[0, '#6a3c38'], [1, '#2e2226']]), 1.6);
    s += P('M300,72 L310,88 L306,92 L318,98 L304,100 L296,90 Z', '#140e0e', 0);
    s += L('M300,74 L312,62 M304,84 L318,80 M306,94 L322,106', CH, 2.4) + L('M258,100 Q272,99 286,101', '#a88a50', 1.4) + P('M292,54 C290,46 291,40 294,34 C295,40 295,48 292,54 Z', '#8a7040', 1.1);
    // the main hall (left): elven timber, graceful curved roof, the right half fallen in
    s += P('M34,138 L174,138 L170,131 L38,131 Z', c.cel(STONE), 1.5);
    s += F('M44,131 L44,94 Q80,88 120,90 L164,98 L164,131 Z', '#1a1412');
    s += L('M52,96 L52,131 M60,96 L60,131 M88,95 L88,131 M96,95 L96,131', '#2e2420', 1.4, 0.9);
    [[48, 92, 131], [76, 94, 131], [104, 94, 131], [132, 106, 131], [160, 116, 131]].forEach(function (q, i) {
      var x0 = q[0], y0 = q[1];
      s += P('M' + (x0 - 3) + ',131 L' + (x0 - 3) + ',' + (y0 + (i > 2 ? 3 : 0)) + ' L' + (x0 - 1) + ',' + y0 + ' L' + (x0 + 1) + ',' + (y0 + (i > 2 ? 4 : 0)) + ' L' + (x0 + 3) + ',' + (y0 + (i > 2 ? 1 : 0)) + ' L' + (x0 + 3) + ',131 Z', CH, 1.3);
      s += L('M' + (x0 + 2) + ',' + (y0 + 5) + ' L' + (x0 + 2) + ',129', '#9a5a38', 0.9, 0.7);
    });
    // curved elven brackets between the standing posts, part burned
    s += L('M51,108 Q62,96 73,108 M79,108 Q90,96 101,108', OL, 4.6) + L('M51,108 Q62,96 73,108', WOODL, 2.6) + L('M79,108 Q90,96 101,108', CHL, 2.6);
    // roof
    var roof = 'M20,84 C34,94 64,98 92,97 L126,96 L120,89 L128,83 L118,77 L124,69 L116,65 L82,61 L46,59 C40,61 30,71 20,84 Z';
    s += P(roof, c.lg([[0, '#74403a'], [0.55, '#4a2c2c'], [1, '#2a1e20']], 0, 0, 0.3, 1), 1.8);
    s += CG(L('M28,80 C50,88 80,90 124,88 M36,72 C56,79 84,80 122,79 M42,65 C60,70 84,70 118,70', '#2a1a1a', 1.2, 0.8) +
      F('M64,74 L78,72 L84,80 L70,84 Z', '#120c0c') + F('M92,64 L108,66 L114,90 L100,92 L96,78 Z', '#161010', 0.9) + F('M20,84 L60,90 L90,74 L50,60 Z', '#9a4a3e', 0.25), c.clip(roof));
    s += L('M68,76 L80,82 M96,70 L104,88', CH, 2);
    s += L('M20,84 C34,94 64,98 92,97', '#b0924e', 1.8) + L('M20,84 C22,80 22,76 18,72', OL, 3.4) + L('M20,84 C22,80 22,76 18,72', '#b0924e', 1.6);
    s += L('M46,59 C62,59 84,61 116,65', '#a88a50', 1.3, 0.8);
    // a torn, faded crimson-and-gold banner still hanging under the eave
    s += P('M57,96 L69,96.6 L68.6,117 L66,113 L63.6,120 L61,114 L58,118 Z', c.lg([[0, '#9a4038'], [1, '#5a2624']]), 1.4);
    s += L('M57.6,99 L68.8,99.6', '#c8a050', 1.4) + G(P(leafD(0.55), '#c8a050', 0.7), 'translate(63.2,110)');
    // gable finial: a tall leaf spire
    s += P('M46,59 C41,50 41,42 45,32 C49,42 51,50 48,59 Z', c.lg([[0, '#c8a860'], [1, '#6a5430']], 0, 0, 1, 0), 1.3);
    // bare rafters where the roof fell, beams down on the plinth
    var raf = 'M118,66 L148,58 M122,77 L154,70 M126,86 L150,104 M134,96 L162,124 M140,131 L172,120 M110,64 L136,52';
    s += L(raf, OL, 4.6) + L(raf, CH, 2.6) + L('M120,67 L146,60 M124,78 L150,72', '#7a4a34', 0.9, 0.8);
    s += F('M128,131 L136,122 L146,126 L152,118 L162,124 L170,120 L174,131 Z', '#1e1816') + F('M134,131 L140,126 L150,129 L160,126 L168,131 Z', '#6e6860', 0.6);
    // the grove shrine, still standing, its leaf symbol faintly lit
    var SX = 192;
    s += C(SX, 114, 26, glow(c, '#c8f0a0', 0.4));
    s += P('M172,142 L212,142 L209,136 L175,136 Z', c.cel('#a8a294'), 1.4) + P('M177,136 L207,136 L205,131 L179,131 Z', c.cel('#b4ae9e'), 1.4);
    var up = 'M181,131 C175,118 178,104 192,89 C186,104 186,118 188,131 Z', up2 = 'M203,131 C209,118 206,104 192,89 C198,104 198,118 196,131 Z';
    s += P(up, c.cel('#c4beac'), 1.6) + P(up2, c.cel('#c4beac'), 1.6);
    s += F('M181,128 C179,122 179,118 181,114 L184,120 L185,128 Z M203,127 C205,121 205,117 204,113 L201,120 L200,127 Z', '#6a9a4a', 0.8);
    s += C(SX, 114, 7, c.cel('#cfc9b8'), 1.4) + C(SX, 114, 11, glow(c, '#d8ffb0', 0.55));
    s += G(P(leafD(1), c.lg([[0, '#f0ffd8'], [1, '#98d870']], 0, 0, 1, 0), 0.9) + L('M0,-1.2 L0,-8.6', '#5a9a3a', 0.7), 'translate(' + SX + ',119) scale(0.95)');
    // new growth: shoots through the ash, a few flowers
    var tf = '';
    for (var i = 0; i < 70; i++) {
      var tx = r() * 400, ty = 134 + Math.pow(r(), 0.8) * 104, sc = 0.45 + (ty - 134) / 104 * 0.9;
      tf += tuft(tx, ty, sc, r() < 0.5 ? '#6aa844' : '#8cc85a');
    }
    s += tf;
    for (var j = 0; j < 26; j++) { var fx = r() * 400, fy = 138 + r() * 96; s += C(fx, fy, 0.9 + r() * 0.8, r() < 0.5 ? '#f0f0d8' : '#f4d060', 0, 0.9); }
    [[178, 142, 1.2], [206, 143, 1.1], [168, 140, 0.8], [214, 141, 0.9]].forEach(function (q) { s += tuft(q[0], q[1], q[2], '#9ad866'); });
    // tall highland pines framing the lodge
    s += pine(c, 14, 150, 170, 26, '#2a3a30', '#b89060', 0, 11);
    s += pine(c, 352, 140, 130, 20, '#2e3e34', '#c09a66', 1, 13);
    s += pine(c, 388, 152, 180, 28, '#26352c', '#b89060', 0, 17);
    // foreground: a charred stump and a fallen beam at the edges, ash in the grass
    s += P('M2,236 L4,214 L10,210 L14,216 L18,212 L20,236 Z', CH, 1.6) + L('M8,214 L8,234', CHL, 1);
    s += P('M330,232 L398,220 L400,228 L334,240 Z', CH, 1.6) + L('M336,234 L396,223', '#5a3a2c', 1.2);
    s += tuft(24, 236, 1.6, '#7ab84e') + tuft(340, 238, 1.5, '#8cc85a') + tuft(396, 236, 1.4, '#6aa844');
    // light motes drifting in the low sun
    for (var m = 0; m < 16; m++) s += C(120 + r() * 270, 60 + r() * 110, 0.8 + r() * 0.8, '#fff0c8', 0, 0.55);
    // warm haze and vignette
    s += R(0, 0, 400, 240, c.lg([[0, '#1a1428', 0.28], [0.35, '#1a1428', 0], [0.75, '#2a1a10', 0.05], [1, '#140c08', 0.35]]));
    s += R(0, 0, 400, 240, c.rg([[0.6, '#000', 0], [1, '#000', 0.35]], 0.55, 0.5, 0.75));
    return s;
  }

  // =====================================================================
  // ICONS (64 x 64, the art.js / art_icons10.js frame)
  // =====================================================================
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75)) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72)) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      L('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + L('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function iglow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]])); }
  var ICONS = {
    legend_lyveus: function (c) {
      var keep = SWM, g;
      SWM = 0.9;
      try { g = G(lyvRig(c, POSE_SPRITE, { upper: true }), 'matrix(1.22,0,0,1.22,-51,0.5)') + G(kite(c), 'translate(9,56) rotate(-14) scale(0.95)'); } finally { SWM = keep; }
      return iconWrap(c, ['#7cc4aa', '#0e2a24'], iglow(c, 40, 24, 30, '#d8fff0', 0.35) + g);
    },
    oathbound_strike: function (c) {
      var arc = 'M6,54 C14,30 32,12 58,6 C38,18 24,32 14,58 Z';
      var lv = [[12, 18, -40, 0.75, '#8ad05a'], [50, 42, 60, 0.7, '#a8e068'], [20, 40, -110, 0.6, '#6ab846'], [44, 16, 20, 0.6, '#b8e878'], [56, 28, 100, 0.55, '#8ad05a']];
      var o = iglow(c, 34, 30, 30, '#ffe08a', 0.85);
      o += P(arc, c.lg([[0, '#fff6c0', 0.95], [0.5, '#ffd24a', 0.85], [1, '#e89a20', 0.6]], 0, 1, 1, 0), 0) + F('M10,52 C18,32 34,16 54,9 C38,20 26,34 16,54 Z', '#ffffff', 0.7);
      o += L('M16,48 L54,10', '#ffe070', 11, 0.5) + L('M16,48 L54,10', '#fff8d0', 5, 0.6) + G(lsword(c, 50), 'translate(17,47) rotate(45) scale(1.08)');
      lv.forEach(function (q) { o += leaf(c, q[0], q[1], q[2], q[3], q[4]); });
      return iconWrap(c, ['#d8b048', '#1c2408'], o + sparkle(52, 10, 3.6, '#ffffff') + sparkle(10, 34, 2.6, '#fff4c0') + sparkle(40, 54, 2.4, '#fff4c0'));
    },
    ancients_bulwark: function (c) {
      var o = iglow(c, 32, 33, 34, '#e8f8a0', 0.75);
      var ray = '';
      for (var i = 0; i < 16; i++) { var a = i / 16 * PI * 2; ray += 'M' + n(32 + Math.cos(a) * 22) + ',' + n(33 + Math.sin(a) * 22) + ' L' + n(32 + Math.cos(a) * 31) + ',' + n(33 + Math.sin(a) * 31); }
      o += L(ray, '#f4ffc0', 1.6, 0.7);
      o += E(32, 33, 25, 25, 'none', 0).replace('fill="none"', 'fill="none" stroke="#e0f890" stroke-width="3" opacity="0.8"') + E(32, 33, 20.5, 20.5, 'none', 0).replace('fill="none"', 'fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.7"');
      o += C(32, 33, 19, c.rg([[0, '#f0ffc0', 0.05], [0.8, '#c8f070', 0.35], [1, '#f4ffd0', 0.6]]));
      o += leaf(c, 10, 14, -50, 0.6, '#9ad860') + leaf(c, 55, 50, 130, 0.6, '#9ad860') + leaf(c, 54, 14, 40, 0.5, '#b8e878') + leaf(c, 9, 52, -140, 0.5, '#b8e878');
      o += G(kite(c), 'translate(32,31) scale(1.02)');
      return iconWrap(c, ['#88c450', '#0c2008'], o + sparkle(32, 5.5, 3, '#ffffff') + sparkle(58, 33, 2.4, '#ffffff'));
    },
    silverleaf_aegis: function (c) {
      var o = iglow(c, 32, 28, 26, '#e8f0b8', 0.4);
      o += E(32, 57, 16, 3, '#000', 0, 0.35) + G(kite(c), 'translate(32,30) rotate(-6) scale(1.28)');
      return iconWrap(c, ['#5e6e4a', '#10140c'], o + sparkle(21, 14, 3, '#ffffff') + sparkle(46, 48, 2, '#ffffff', 0.8));
    }
  };

  // =====================================================================
  // INSTALL: extend ART.legend / ART.mob / ART.scene / ART.icon / ART.story
  // =====================================================================
  function has(t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); }
  function blank(w, h, col) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (col ? '<rect width="' + w + '" height="' + h + '" fill="' + col + '"/>' : '') + '</svg>'; }
  function phFig(c) { return shadow(c, 64, 26) + P('M44,122 C42,96 46,70 64,62 C82,70 86,96 84,122 Z', '#8a8a92', 2.5, 0.8) + C(64, 50, 14, '#9a9aa2', 2.5, 0.8); }
  function phScene(c) { return R(0, 0, 400, 240, c.lg([[0, '#6a5a70'], [1, '#d89a78']])) + R(0, 132, 400, 108, '#4a3e32'); }
  function phIcon(c) { return iconWrap(c, ['#5a5a62', '#1a1a1e'], C(32, 32, 12, '#8a8a92', 2)); }
  function phActor(c) { return E(80, 155, 36, 5, c.rg([[0, '#000', 0.45], [1, '#000', 0]])) + P('M58,154 C58,110 64,70 80,70 C96,70 102,110 102,154 Z', c.cel('#7a7a84'), 2) + E(80, 50, 16, 17, c.cel('#8a8a94'), 2); }
  function make(fn, w, h, ph, bg) {
    var keep = SWM;
    try { var c = new Ctx(); var out = c.svg(w, h, fn(c)); SWM = keep; return out; } catch (e) {
      SWM = keep;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return blank(w, h, bg); }
    }
  }
  function callBase(base, self, args, fn, w, h, ph, bg) {
    try { if (typeof base === 'function') { var s = base.apply(self, args); if (typeof s === 'string' && s) return s; } } catch (e) { }
    return make(fn || ph, w, h, ph, bg);
  }
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }

  var LEGENDS = { lyveus: lyveusSprite };
  var MOBS = { lord_cassius_marrow: cassiusMob };
  var SCENES = { silverleaf_lodge: lodgeScene };
  var ACTORS = { lyveus: lyveusActor, vyn: vynActor };
  var KEYS = ART.keys;
  try { if (!KEYS || typeof KEYS !== 'object') { KEYS = {}; ART.keys = KEYS; } } catch (e) { KEYS = {}; }
  function keyList(name, keys) {
    try { KEYS[name] = addKeys(KEYS[name], keys); if (KEYS[name].indexOf(keys[0]) < 0) throw new Error('read-only'); } catch (e) { try { KEYS[name] = addKeys(Array.isArray(KEYS[name]) ? KEYS[name].slice() : [], keys); } catch (e2) { } }
  }

  // ---- legend sprites ----
  try {
    var legend = function (key) {
      if (has(LEGENDS, key)) return make(LEGENDS[key], 128, 128, phFig);
      try { var A = W.ART || ART; if (A && typeof A.hero === 'function') { var s = A.hero({ cls: 'paladin', race: 'human' }); if (typeof s === 'string' && s) return s; } } catch (e) { }
      return make(phFig, 128, 128, phFig);
    };
    legend.keys = Object.keys(LEGENDS);
    ART.legend = legend;
  } catch (e) { }

  // ---- mobs, scenes, icons ----
  try {
    var baseMob = ART.mob;
    ART.mob = function (k) { return has(MOBS, k) ? make(MOBS[k], 128, 128, phFig) : callBase(baseMob, this, arguments, null, 128, 128, phFig); };
    keyList('mobs', Object.keys(MOBS));
  } catch (e) { }
  try {
    var baseScene = ART.scene;
    ART.scene = function (k) { return has(SCENES, k) ? make(SCENES[k], 400, 240, phScene, '#5a4a40') : callBase(baseScene, this, arguments, null, 400, 240, phScene, '#5a4a40'); };
    keyList('scenes', Object.keys(SCENES));
  } catch (e) { }
  try {
    var baseIcon = ART.icon;
    ART.icon = function (k) { return has(ICONS, k) ? make(ICONS[k], 64, 64, phIcon, '#444') : callBase(baseIcon, this, arguments, null, 64, 64, phIcon, '#444'); };
    keyList('icons', Object.keys(ICONS));
  } catch (e) { }

  // ---- story actors (the art_story2.js wrapping, extended in place when it can be) ----
  try {
    var prev = (ART.story && (typeof ART.story === 'object' || typeof ART.story === 'function')) ? ART.story : {};
    var bScene = typeof prev.scene === 'function' ? prev.scene : null;
    var bActor = typeof prev.actor === 'function' ? prev.actor : null;
    // no story scenes here: an existing ART.story.scene is left exactly as it is
    var sceneFn = bScene || function () { return make(function (c) { return R(0, 0, 480, 270, c.lg([[0, '#5a5a62'], [1, '#2e2e34']])); }, 480, 270, function () { return ''; }, '#444'); };
    var actorFn = function (key) { return has(ACTORS, key) ? make(ACTORS[key], 160, 160, phActor) : callBase(bActor, this, arguments, null, 160, 160, phActor); };
    try {
      var K0 = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
      K0.scenes = addKeys(K0.scenes, []);
      K0.actors = addKeys(K0.actors, Object.keys(ACTORS));
      prev.keys = K0; prev.scene = sceneFn; prev.actor = actorFn;
      if (prev.scene !== sceneFn || prev.actor !== actorFn || prev.keys !== K0 || K0.actors.indexOf('vyn') < 0) throw new Error('read-only');
      ART.story = prev;
    } catch (e) {
      var pk = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
      ART.story = { scene: sceneFn, actor: actorFn, keys: { scenes: addKeys(Array.isArray(pk.scenes) ? pk.scenes.slice() : [], []), actors: addKeys(Array.isArray(pk.actors) ? pk.actors.slice() : [], Object.keys(ACTORS)) } };
    }
  } catch (e) { }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
