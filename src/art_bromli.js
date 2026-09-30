/* art_bromli.js — the third Legend for Realm of Loner: Bromli Beerhammer, the Unsung, a mountain dwarf warrior (an
 * original character by a friend of the developer, redrawn from his two reference pictures in the game's style).
 *   legend  bromli               ART.legend(key): a party / world sprite in exactly the ART.hero format
 *                                (128x128, facing RIGHT, feet on y=122, shadow at y=122.5). Appended to ART.legend.keys;
 *                                every other key falls through to the previous ART.legend (art_legends.js).
 *   actor   bromli               ART.story.actor: 160x160 transparent, facing LEFT, feet on the bottom edge
 *   icons   legend_bromli, beerhammer_charge, tavern_brawl, beerhammer_cloak   ART.icon: 64x64
 *   mobs    duneback             ART.mob: 128x128, facing LEFT, feet on y=122. Old Duneback, a sand giant of Sirocco:
 *                                hunched sandstone, cracks and strata, sand pouring from the joints, a boulder club,
 *                                a bird's nest on his head. Old and grumpy, not evil.
 *           thudd              Thudd the Unbeaten, champion of the Smokebelly fire pit: the Smokebelly ogre build
 *                                (art_steppes.js: round belly, small head low at the front, black topknot, tusks, a
 *                                ragged loincloth), grey-green and soot-stained, a champion's belt with a big brass
 *                                buckle, chain-wrapped fists raised, scars, a grin with teeth missing.
 *   scene   smokebelly_pit       ART.scene: 400x240, the ogres' fire-pit arena in the Cinderfields: a sunken ring of
 *                                stones inside a trench of glowing embers, crude wooden stands with torches, a big gong,
 *                                hide banners, a volcano glowing on the horizon under a red-black smoky sky.
 * Loads AFTER art_legends.js and EXTENDS window.ART: ART.legend, ART.scene, ART.mob, ART.icon and ART.story.actor handle
 * the keys above and fall through to the previous functions for every other key (prototype keys included). Keys are
 * appended to ART.legend.keys, ART.keys.scenes / mobs / icons and ART.story.keys.actors. Self-contained: helpers are
 * copies of art_legends.js's. Never throws.
 * Bromli's look (from the references): short and very broad, a big head; tanned skin; gold-rimmed aviator sunglasses
 * with dark brown lenses and a glint; swept-back tousled brown hair; a full brown beard with lighter streaks and a big
 * moustache, ending at the collarbone; scaled, hammered grey-silver plate with gold trim on every edge, round rivets,
 * layered pauldrons, banded arm plates, a breastplate with a central ridge and a gorget; a round gold compass-star
 * badge (an 8-point star in a circle) with a small buckle strap on the near pauldron (his left shoulder in the actor,
 * which faces left); a torn red cloak that also wraps round his neck like a scarf; brown leather belts with gold
 * buckles, pouches, a red tabard strip; armoured boots and gauntlets; a two-handed greatsword (grey blade with a light
 * edge line, gold cross-guard with small curls, leather grip, round gold pommel), resting on his shoulder.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients, no text, no images, no filters,
 * ids unique per call (prefix bm<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = (W.ART && (typeof W.ART === 'object' || typeof W.ART === 'function')) ? W.ART : {};
  try { if (W.ART !== ART) W.ART = ART; } catch (e) { }
  var OL = '#1a1009';
  var SEQ = 0;
  var SWM = 1; // stroke multiplier, lowered while a figure is drawn scaled up (story actor, icons)
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
  function Ctx() { this.p = 'bm' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function ring(x, y, r, col, w, o) { return L('M' + n(x - r) + ',' + n(y) + ' A' + n(r) + ',' + n(r) + ' 0 1 0 ' + n(x + r) + ',' + n(y) + ' A' + n(r) + ',' + n(r) + ' 0 1 0 ' + n(x - r) + ',' + n(y), col, w, o); }
  // a gold-trimmed plate: the fill, then a dark line with a gold line down its middle along the whole edge
  function trimmed(d, fill, gold, w) { w = w || 1; return F(d, fill) + L(d, OL, 4.2 * SWM * w) + L(d, gold || BR.gold, 1.7 * w); }
  // a thin gold line with a dark edge, for one open edge of a plate
  function trimLine(d, w) { w = w || 1; return L(d, OL, 3.8 * SWM * w) + L(d, BR.gold, 1.5 * w); }
  function perp(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [-dy / l, dx / l]; }
  // dark and light specks for the hammered-steel look, inside the current clip
  function specks(x0, y0, w, h, k, seed) {
    var r = rng(seed), s = '';
    for (var i = 0; i < k; i++) { var x = x0 + r() * w, y = y0 + r() * h; s += C(x, y, 0.35 + r() * 0.35, r() < 0.55 ? BR.fleck : BR.steelL, 0, 0.75); }
    return s;
  }
  // the 8-point compass star in a gold ring, centred on (x, y), outer radius r
  function compass(c, x, y, r, w) {
    w = w == null ? 1 : w;
    var st = '';
    for (var i = 0; i < 16; i++) { var a = -PI / 2 + i / 16 * PI * 2, rr = i % 4 === 0 ? r * 0.8 : i % 2 === 0 ? r * 0.58 : r * 0.24; st += (i ? ' L' : 'M') + n(x + Math.cos(a) * rr) + ',' + n(y + Math.sin(a) * rr); }
    return C(x, y, r, c.cel(BR.goldD), 1.6 * w) + C(x, y, r * 0.86, c.rg([[0, lt(BR.gold, 0.2)], [0.7, BR.gold], [1, BR.goldD]], 0.4, 0.35, 0.7), 0.9 * w) +
      P(st + ' Z', c.lg([[0, BR.goldL], [0.5, BR.gold], [1, BR.goldD]], 0.2, 0, 0.8, 1), 0.8 * w) + C(x, y, r * 0.14, BR.goldL, 0.6 * w);
  }

  // =====================================================================
  // BROMLI: one rig, drawn FACING RIGHT in hero-sprite coordinates (128 box, feet on 122).
  // A dwarf: head top near y=37, shoulders at y=62, the belt at y=90, short thick legs; pauldrons from x=38 to x=99.
  // The story actor is the same rig in another pose (arms crossed), mirrored and scaled.
  // =====================================================================
  var BR = {
    skin: '#d99f70', skinD: '#b0774a', skinL: '#f0c49c',
    hair: '#7a4a26', hairD: '#46280f', hairL: '#b07a44',
    steel: '#a4abb4', steelD: '#6a717b', steelL: '#e2e6ec', fleck: '#474c55',
    gold: '#e6b33c', goldD: '#9a6816', goldL: '#fde38c',
    red: '#b3191f', redD: '#6a0b10', redL: '#d9444a',
    leather: '#6b4226', leatherD: '#3c2311', lens: '#2a1a12', grip: '#5a3a22'
  };
  // the sprite pose: both hands on the greatsword's grip in front of his belly, the blade up over his far shoulder
  var BPOSE_SPRITE = {
    head: [67, 49, 12.6],
    bSh: [49, 66], bEl: [54, 84], bHd: [75.9, 81.2], fSh: [88, 66], fEl: [99, 80], fHd: [82, 86.3],
    bHip: [60, 94], bKn: [56, 106], bFt: [53, 117], fHip: [74, 94], fKn: [77, 106], fFt: [79, 117],
    sword: [78.2, 83.1, -50.2, 62], cross: false
  };
  // the story pose: arms crossed, the greatsword planted point-down beside him
  var BPOSE_ACTOR = {
    head: [67, 49, 12.6], grin: true,
    bSh: [49, 66], bEl: [53, 85], bHd: [84, 78], fSh: [88, 66], fEl: [95, 86], fHd: [62, 81],
    bHip: [60, 94], bKn: [55, 106], bFt: [51, 117], fHip: [74, 94], fKn: [79, 106], fFt: [82, 117],
    planted: [107, 64, 180, 57], cross: true
  };

  // ---- the greatsword, drawn along -y from the grip centre (0,0): guard at y=-8, grip to y=+8.5, pommel at +11 ----
  function gsBlade(c, len) {
    var bw = 3.6, o = '';
    var blade = 'M' + n(-bw) + ',-8 L' + n(-bw * 0.92) + ',' + n(-len + 9) + ' L0,' + n(-len) + ' L' + n(bw * 0.92) + ',' + n(-len + 9) + ' L' + n(bw) + ',-8 Z';
    o += P(blade, c.lg([[0, '#dfe4ea'], [0.35, '#a6aeb8'], [0.62, '#7e8692'], [1, '#4c525c']], 0, 0, 1, 0), 2.1);
    // the fuller, the light edge line, two glints
    o += L('M0,-12 L0,' + n(-len + 14), '#5a616c', 1.4, 0.9);
    o += L('M' + n(-bw + 0.9) + ',-11 L' + n(-bw * 0.9 + 0.9) + ',' + n(-len + 10) + ' L0,' + n(-len + 2), '#ffffff', 0.9, 0.9);
    [0.34, 0.66].forEach(function (t) {
      var y = -10 - (len - 16) * t;
      o += F('M' + n(-bw + 0.7) + ',' + n(y + 2.6) + ' L' + n(bw - 0.7) + ',' + n(y - 2.4) + ' L' + n(bw - 0.7) + ',' + n(y - 1) + ' L' + n(-bw + 0.7) + ',' + n(y + 4) + ' Z', '#ffffff', 0.85);
    });
    return o;
  }
  function gsHilt(c) {
    var o = '';
    // leather-wrapped grip
    o += R(-2.3, -7, 4.6, 15.6, BR.grip, 1.6) + L('M-2.2,-4.6 L2.2,-3 M-2.2,-1.4 L2.2,0.2 M-2.2,1.8 L2.2,3.4 M-2.2,5 L2.2,6.6', '#2e1c10', 1);
    // gold cross-guard with small curls at the ends and a diamond at its heart
    o += P('M-11,-9.6 C-6,-8.4 6,-8.4 11,-9.6 L11.6,-6.6 C6,-5.6 -6,-5.6 -11.6,-6.6 Z', c.lg([[0, BR.goldL], [0.45, BR.gold], [1, BR.goldD]]), 1.7);
    o += L('M-11.2,-8 C-14,-8.4 -15,-11.4 -12.6,-12.4 C-11,-13 -10.2,-11.2 -11.6,-10.6', OL, 3.4) + L('M-11.2,-8 C-14,-8.4 -15,-11.4 -12.6,-12.4 C-11,-13 -10.2,-11.2 -11.6,-10.6', BR.gold, 1.6);
    o += L('M11.2,-8 C14,-8.4 15,-11.4 12.6,-12.4 C11,-13 10.2,-11.2 11.6,-10.6', OL, 3.4) + L('M11.2,-8 C14,-8.4 15,-11.4 12.6,-12.4 C11,-13 10.2,-11.2 11.6,-10.6', BR.gold, 1.6);
    o += P('M0,-12.4 L3,-8 L0,-4.4 L-3,-8 Z', c.cel(BR.gold), 1.3) + C(0, -8.2, 1, BR.red, 0.6);
    // round gold pommel
    o += C(0, 11, 3.4, c.rg([[0, BR.goldL], [0.55, BR.gold], [1, BR.goldD]], 0.38, 0.34, 0.7), 1.7) + C(-1, 10, 0.9, '#fff6d0');
    return o;
  }
  function greatsword(c, len) { return gsBlade(c, len) + gsHilt(c); }
  function swTf(S) { return 'translate(' + n(S[0]) + ',' + n(S[1]) + ') rotate(' + n(S[2]) + ')'; }

  // ---- limbs ----
  // banded plate arm: steel tube, dark bands across it, a gold-rimmed elbow cop
  function bands(a, b, ts, w, col, lw) {
    var p = perp(a, b), s = '';
    ts.forEach(function (t) { var q = lerp(a, b, t); s += 'M' + n(q[0] - p[0] * w) + ',' + n(q[1] - p[1] * w) + ' L' + n(q[0] + p[0] * w) + ',' + n(q[1] + p[1] * w); });
    return L(s, col, lw || 1.2);
  }
  // part: 'upper' (shoulder to elbow), 'fore' (elbow cop, forearm, cuff), or both; from: where the upper arm starts
  function brArm(c, sh, el, hd, back, part, from) {
    var st = back ? dk(BR.steel, 0.2) : BR.steel, o = '';
    if (part !== 'fore') {
      o += tube([lerp(sh, el, from || 0), el], 9.4, st, back ? null : BR.steelD);
      o += bands(sh, el, [0.5, 0.7, 0.88], 4.6, dk(st, 0.45));
      if (part === 'upper') return o;
    }
    o += tube([el, lerp(el, hd, 0.72)], 8.8, st, back ? null : BR.steelD);
    o += bands(el, hd, [0.28, 0.48], 4.4, dk(st, 0.45));
    // gauntlet cuff, flared, gold-trimmed
    var p = perp(el, hd), q = lerp(el, hd, 0.6), q2 = lerp(el, hd, 0.8);
    o += P(pd([[q[0] - p[0] * 5, q[1] - p[1] * 5], [q2[0] - p[0] * 6.2, q2[1] - p[1] * 6.2], [q2[0] + p[0] * 6.2, q2[1] + p[1] * 6.2], [q[0] + p[0] * 5, q[1] + p[1] * 5]], true), c.cel(back ? dk(BR.steel, 0.15) : BR.steelL), 1.7);
    // elbow cop
    o += C(el[0], el[1], 4.2, c.cel(back ? dk(BR.steel, 0.1) : lt(BR.steel, 0.12)), 1.8) + C(el[0], el[1], 1, BR.goldL, 0.5);
    return o;
  }
  function brFist(c, p, back) {
    var col = back ? dk(BR.steel, 0.18) : BR.steel;
    return C(p[0], p[1], 5.2, c.cel(col), 2.1) + L('M' + n(p[0] - 3) + ',' + n(p[1] - 1.4) + ' L' + n(p[0] + 3) + ',' + n(p[1] - 2) + ' M' + n(p[0] - 3) + ',' + n(p[1] + 1.2) + ' L' + n(p[0] + 3) + ',' + n(p[1] + 0.6), dk(col, 0.45), 1) +
      C(p[0] + 1.6, p[1] - 2.6, 0.8, BR.goldL, 0.5);
  }
  function brLeg(c, h, kn, f, back) {
    var st = back ? dk(BR.steel, 0.2) : BR.steel, o = '';
    // thigh in leather under the tassets, a plate greave on the shin
    o += tube([h, kn], 12, back ? dk(BR.leather, 0.2) : BR.leather, back ? null : BR.leatherD);
    var ax = f[0] + 1, ay = f[1] - 3, dx = ax - kn[0], dy = ay - kn[1], l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l, py = dx / l;
    function q(t, w) { return [kn[0] + dx * t + px * w, kn[1] + dy * t + py * w]; }
    o += P(pd([q(-0.05, -6.4), q(0.5, -7), q(1.05, -6), q(1.05, 6), q(0.5, 7), q(-0.05, 6.4)], true), c.cel(st), 2.1);
    o += L(pd([q(0.15, -3), q(0.95, -2.6)]), lt(st, 0.45), 1.2, 0.8) + L(pd([q(0.62, -6.6), q(0.62, 6.6)]), dk(st, 0.4), 1, 0.8);
    // broad armoured boot
    var x = f[0], y = f[1] + 5;
    var boot = 'M' + n(x - 7) + ',' + n(y - 9) + ' L' + n(x + 4) + ',' + n(y - 9.4) + ' C' + n(x + 8) + ',' + n(y - 7.4) + ' ' + n(x + 12.6) + ',' + n(y - 5) + ' ' + n(x + 13) + ',' + n(y - 1.2) + ' L' + n(x + 13) + ',' + n(y) + ' L' + n(x - 7.4) + ',' + n(y) + ' Z';
    o += P(boot, c.cel(dk(st, 0.08)), 2.2) + R(x - 7.4, y - 2.6, 20.4, 2.6, dk(BR.leather, 0.3), 1.2);
    o += L('M' + n(x - 6.4) + ',' + n(y - 5.8) + ' L' + n(x + 5) + ',' + n(y - 6.2) + ' M' + n(x + 5.6) + ',' + n(y - 8.6) + ' C' + n(x + 8) + ',' + n(y - 6.2) + ' ' + n(x + 11) + ',' + n(y - 4.6) + ' ' + n(x + 12.4) + ',' + n(y - 3), dk(st, 0.45), 1.1, 0.85);
    // round knee cop with a rivet
    o += C(kn[0] + 1.4, kn[1], 5, c.cel(lt(st, 0.12)), 1.9) + ring(kn[0] + 1.4, kn[1], 3.4, BR.gold, 1) + C(kn[0] + 1.4, kn[1], 1.1, BR.goldL, 0.6);
    return o;
  }

  // ---- pauldron: three layered lames, gold edges and rivets; x,y = the top of the arm, r = half width ----
  function pauldron(c, x, y, r, back, badge) {
    var st = back ? dk(BR.steel, 0.18) : BR.steel, o = '';
    function lame(yy, rr, h) {
      var d = 'M' + n(x - rr) + ',' + n(yy + 2) + ' C' + n(x - rr) + ',' + n(yy - h) + ' ' + n(x + rr) + ',' + n(yy - h) + ' ' + n(x + rr) + ',' + n(yy + 2) +
        ' C' + n(x + rr * 0.5) + ',' + n(yy + 4.6) + ' ' + n(x - rr * 0.5) + ',' + n(yy + 4.6) + ' ' + n(x - rr) + ',' + n(yy + 2) + ' Z';
      return trimmed(d, c.cel(st), BR.gold, 0.9);
    }
    o += lame(y + 9, r * 0.84, 6) + lame(y + 4.6, r * 0.94, 8);
    var top = 'M' + n(x - r) + ',' + n(y + 2) + ' C' + n(x - r) + ',' + n(y - r * 1.02) + ' ' + n(x + r) + ',' + n(y - r * 1.02) + ' ' + n(x + r) + ',' + n(y + 2) +
      ' C' + n(x + r * 0.5) + ',' + n(y + 5) + ' ' + n(x - r * 0.5) + ',' + n(y + 5) + ' ' + n(x - r) + ',' + n(y + 2) + ' Z';
    o += F(top, c.cel(st)) + CG(specks(x - r, y - r, r * 2, r + 6, 14, 7 + (back ? 3 : 0)) + L('M' + n(x - r * 0.62) + ',' + n(y - r * 0.4) + ' Q' + n(x - r * 0.1) + ',' + n(y - r * 0.78) + ' ' + n(x + r * 0.46) + ',' + n(y - r * 0.5), BR.steelL, 1.5, 0.85), c.clip(top));
    o += L(top, OL, 4.2 * SWM) + L(top, BR.gold, 1.7);
    [[-0.7, 0.9], [0.7, 0.9]].forEach(function (k) { o += C(x + r * k[0], y + k[1], 1.05, BR.goldL, 0.6); });
    if (badge) {
      // the buckle strap across the top of the pauldron, and the compass-star badge on it
      o += L('M' + n(x - r * 0.9) + ',' + n(y - r * 0.2) + ' Q' + n(x) + ',' + n(y - r * 0.92) + ' ' + n(x + r * 0.86) + ',' + n(y - r * 0.3), OL, 3.8 * SWM) + L('M' + n(x - r * 0.9) + ',' + n(y - r * 0.2) + ' Q' + n(x) + ',' + n(y - r * 0.92) + ' ' + n(x + r * 0.86) + ',' + n(y - r * 0.3), BR.leather, 2.2);
      o += R(x - r * 0.62 - 1.3, y - r * 0.58 - 1.3, 2.6, 2.6, BR.gold, 0.8);
      o += compass(c, x + r * 0.12, y - r * 0.24, r * 0.46, 0.8);
    }
    return o;
  }

  // ---- the cloak, the scarf wrap and the torso ----
  function rags(pts, y0, depth, seed) {
    // a shredded hem through the given x points: every other point drops into a long tatter
    var r = rng(seed), d = '';
    pts.forEach(function (x, i) { d += ' L' + n(x + (r() - 0.5) * 1.6) + ',' + n(y0 + (i % 2 ? -1 - r() * 2 : depth * (0.5 + r() * 0.7))); });
    return d;
  }
  function brCloak(c, J) {
    var o = '';
    var d = 'M54,58 C44,68 34,86 27,108' + rags([30, 34, 38, 42, 46, 50, 54, 58, 62, 66], 110, 8, 11) + ' L68,106 C72,90 74,72 76,60 Z';
    o += P(d, c.lg([[0, BR.redL], [0.3, BR.red], [0.75, BR.red], [1, BR.redD]], 0, 0, 1, 1), 2.2);
    o += CG(L('M44,72 C38,86 35,98 34,110 M52,70 C48,86 46,98 46,112 M60,74 C58,88 58,100 58,112', BR.redD, 1.6, 0.9) +
      L('M40,76 C36,88 33,98 31,108', BR.redL, 1.1, 0.6) + F('M60,56 L80,56 L80,116 L62,116 Z', '#000', 0.25) +
      // a couple of holes torn right through it
      E(41, 94, 1.4, 3, OL, 0, 0.9, 16) + E(52, 101, 1.2, 2.6, OL, 0, 0.9, 6), c.clip(d));
    return o;
  }
  function brScarf(c, X, Y, r, flow) {
    // the cloak wrapped round the neck: a thick red band under the chin, its torn tail flying back
    var o = '';
    o += P('M' + n(X - r * 1.1) + ',' + n(Y + r * 0.95) + ' C' + n(X - r * 1.9) + ',' + n(Y + r * 1.1) + ' ' + n(X - r * 2.5 - flow) + ',' + n(Y + r * 1.5) + ' ' + n(X - r * 2.9 - flow) + ',' + n(Y + r * 2.2) +
      ' L' + n(X - r * 2.5 - flow) + ',' + n(Y + r * 2.0) + ' L' + n(X - r * 2.6 - flow) + ',' + n(Y + r * 2.5) + ' L' + n(X - r * 2.1 - flow * 0.6) + ',' + n(Y + r * 2.0) +
      ' L' + n(X - r * 2.0 - flow * 0.5) + ',' + n(Y + r * 2.35) + ' C' + n(X - r * 1.7) + ',' + n(Y + r * 1.9) + ' ' + n(X - r * 1.3) + ',' + n(Y + r * 1.7) + ' ' + n(X - r * 0.9) + ',' + n(Y + r * 1.7) + ' Z',
      c.cel(BR.red), 1.9);
    var band = 'M' + n(X - r * 1.15) + ',' + n(Y + r * 0.8) + ' Q' + n(X) + ',' + n(Y + r * 0.95) + ' ' + n(X + r * 1.12) + ',' + n(Y + r * 0.7) + ' L' + n(X + r * 1.2) + ',' + n(Y + r * 1.5) +
      ' Q' + n(X) + ',' + n(Y + r * 1.9) + ' ' + n(X - r * 1.2) + ',' + n(Y + r * 1.6) + ' Z';
    o += P(band, c.cel(BR.red), 2) + CG(L('M' + n(X - r * 1.1) + ',' + n(Y + r * 1.15) + ' Q' + n(X) + ',' + n(Y + r * 1.4) + ' ' + n(X + r * 1.1) + ',' + n(Y + r * 1.05), BR.redD, 1.3, 0.9) +
      L('M' + n(X - r * 1.0) + ',' + n(Y + r * 0.95) + ' Q' + n(X - r * 0.2) + ',' + n(Y + r * 1.1) + ' ' + n(X + r * 0.6) + ',' + n(Y + r * 0.9), BR.redL, 1, 0.7), c.clip(band));
    return o;
  }
  var TORSO = 'M48,64 Q67,56 88,63 C92,72 91,83 88,92 L50,92 C46,83 45,72 48,64 Z';
  function brTorso(c, J) {
    var o = '';
    // the plate skirt (tassets) over the thighs, the red tabard strip between the legs
    var tas = 'M50,90 L88,90 L90,99 Q80,102 70,100 Q60,102 49,99 Z';
    o += F(tas, c.cel(dk(BR.steel, 0.06))) + CG(L('M50,94.4 L89,94.4 M69.4,91 L69.6,101', dk(BR.steel, 0.45), 1.1) + specks(48, 90, 42, 11, 10, 31), c.clip(tas)) + L(tas, OL, 4.2 * SWM) + L(tas, BR.gold, 1.6);
    var tab = 'M64,92 L76,92 L77,106 L75,111 L73,107.6 L71,113 L69,108 L66.6,112 L64.8,106.4 Z';
    o += P(tab, c.lg([[0, BR.redL], [0.4, BR.red], [1, BR.redD]], 0, 0, 1, 0), 1.8) + L('M67,95 L67.4,106 M73.4,95 L73.8,106', BR.redD, 1, 0.8);
    // the breastplate: scales, hammered specks, a central ridge, gold edges
    o += F(TORSO, c.lg([[0, BR.steelL], [0.3, BR.steel], [0.78, BR.steel], [1, BR.steelD]], 0.2, 0, 0.8, 1));
    var sc = '';
    for (var row = 0; row < 6; row++) {
      var yy = 66 + row * 4.4;
      for (var x = 45 + (row % 2) * 2.6; x < 92; x += 5.2) sc += 'M' + n(x) + ',' + n(yy) + ' q2.6,3.4 5.2,0';
    }
    o += CG(L(sc, BR.steelD, 0.9, 0.85) + specks(45, 58, 47, 34, 34, 17) +
      F('M44,58 L59,58 C57,70 57,82 58,94 L44,94 Z', '#000', 0.2) + F('M80,58 L94,58 L94,94 L82,94 C84,80 83,68 80,58 Z', '#ffffff', 0.14) +
      L('M70.2,60 L69.4,90', BR.steelL, 2.4, 0.9) + L('M71.8,60.4 L71,90', BR.steelD, 1.1, 0.9), c.clip(TORSO));
    o += L(TORSO, OL, 4.4 * SWM) + L(TORSO, BR.gold, 1.7);
    // rivets down the edges
    [[51, 68], [50, 76], [50.4, 84], [86, 68], [87, 76], [86.4, 84]].forEach(function (p) { o += C(p[0], p[1], 1, BR.goldL, 0.6); });
    // belts: two brown leather belts, gold buckles, a pouch on the hip
    o += P('M49,84.6 Q69,88 89,84.6 L89,89.4 Q69,92.6 49,89.4 Z', c.cel(BR.leather), 1.6);
    o += P('M50,89.6 Q69,92.4 88.6,89 L88.8,92.6 Q69,95.8 50.4,93.2 Z', c.cel(dk(BR.leather, 0.12)), 1.4);
    o += R(76, 84.6, 6.4, 5.8, c.cel(BR.gold), 1.3) + R(77.8, 86.2, 2.8, 2.6, BR.leatherD, 0.6) + R(60, 90.6, 4.6, 4, c.cel(BR.gold), 1.1);
    o += P('M48.6,88 C47,88 46.4,89.4 46.6,91 L47.4,98 C47.6,99.4 48.6,100 50,100 L55.2,99.6 C56.4,99.5 57,98.6 56.8,97.4 L56,90.4 C55.8,89 55,88.4 53.8,88.4 Z', c.cel(BR.leather), 1.6) +
      P('M48.2,88.2 L56,88.6 L56.4,92.4 C53,93.4 50,93.4 47,92.4 Z', c.cel(lt(BR.leather, 0.12)), 1.2) + C(51.6, 92, 0.9, BR.gold, 0.5);
    return o;
  }
  function brGorget(c, X, Y, r) {
    var d = 'M' + n(X - r * 1.05) + ',' + n(Y + r * 1.25) + ' Q' + n(X + r * 0.1) + ',' + n(Y + r * 0.95) + ' ' + n(X + r * 1.2) + ',' + n(Y + r * 1.2) + ' L' + n(X + r * 1.3) + ',' + n(Y + r * 1.75) +
      ' Q' + n(X + r * 0.1) + ',' + n(Y + r * 1.45) + ' ' + n(X - r * 1.15) + ',' + n(Y + r * 1.8) + ' Z';
    return trimmed(d, c.cel(BR.steel), BR.gold, 0.9);
  }

  // ---- the head: big, three-quarters to the right so both lenses of the aviator sunglasses show; swept-back hair;
  // a full beard with lighter streaks and a big moustache; a round nose; a grin ----
  function brHead(c, X, Y, r, J) {
    function q(u, v) { return n(X + r * u) + ',' + n(Y + r * v); }
    var o = '';
    // hair at the back of the head, behind the face, swept back into tufts
    var back = 'M' + q(0.2, -1.5) + ' C' + q(-0.5, -1.62) + ' ' + q(-1.1, -1.35) + ' ' + q(-1.3, -0.95) + ' L' + q(-1.86, -1.0) + ' L' + q(-1.42, -0.66) + ' L' + q(-1.92, -0.46) + ' L' + q(-1.38, -0.26) +
      ' L' + q(-1.66, 0.06) + ' L' + q(-1.1, 0.14) + ' C' + q(-1.02, 0.5) + ' ' + q(-0.86, 0.66) + ' ' + q(-0.6, 0.6) + ' L' + q(0.2, -0.4) + ' Z';
    o += P(back, c.lg([[0, BR.hairL], [0.4, BR.hair], [1, BR.hairD]], 0.8, 0, 0.2, 1), 2);
    // the face
    var face = 'M' + q(-0.96, -0.2) + ' C' + q(-1.0, -1.3) + ' ' + q(0.96, -1.36) + ' ' + q(1.04, -0.3) + ' C' + q(1.1, 0.3) + ' ' + q(1.0, 0.92) + ' ' + q(0.4, 1.08) +
      ' C' + q(-0.3, 1.12) + ' ' + q(-0.92, 0.62) + ' ' + q(-0.96, -0.2) + ' Z';
    o += P(face, c.cel(BR.skin), 2.1);
    o += CG(F('M' + q(-1.1, -0.6) + ' L' + q(-0.5, -0.6) + ' C' + q(-0.62, 0.0) + ' ' + q(-0.5, 0.6) + ' ' + q(-0.2, 1.2) + ' L' + q(-1.1, 1.2) + ' Z', BR.skinD, 0.5), c.clip(face));
    // the ear, then the beard from the sideburn round the jaw down to the collarbone
    o += E(X - r * 0.86, Y + r * 0.02, r * 0.19, r * 0.3, c.cel(BR.skin), 1.6) + L('M' + q(-0.86, -0.14) + ' Q' + q(-0.76, 0.02) + ' ' + q(-0.86, 0.16), BR.skinD, 0.9);
    var beard = 'M' + q(-0.74, -0.34) + ' C' + q(-1.0, 0.4) + ' ' + q(-0.98, 1.2) + ' ' + q(-0.62, 1.7) + ' L' + q(-0.5, 2.02) + ' L' + q(-0.24, 1.84) + ' L' + q(0.0, 2.2) + ' L' + q(0.28, 1.94) + ' L' + q(0.56, 2.2) +
      ' L' + q(0.8, 1.86) + ' L' + q(1.02, 1.98) + ' C' + q(1.26, 1.5) + ' ' + q(1.3, 1.0) + ' ' + q(1.16, 0.5) + ' L' + q(1.02, 0.34) + ' C' + q(0.7, 0.56) + ' ' + q(0.3, 0.58) + ' ' + q(0.0, 0.5) +
      ' C' + q(-0.26, 0.42) + ' ' + q(-0.46, 0.2) + ' ' + q(-0.54, -0.34) + ' Z';
    o += P(beard, c.lg([[0, BR.hairL], [0.3, BR.hair], [0.8, BR.hair], [1, BR.hairD]], 0.7, 0, 0.3, 1), 2.1);
    o += CG(L('M' + q(-0.66, 0.3) + ' C' + q(-0.72, 0.9) + ' ' + q(-0.56, 1.4) + ' ' + q(-0.36, 1.8) + ' M' + q(-0.1, 0.9) + ' C' + q(-0.12, 1.3) + ' ' + q(-0.04, 1.7) + ' ' + q(0.04, 2.0) + ' M' + q(0.64, 1.0) + ' C' + q(0.7, 1.4) + ' ' + q(0.7, 1.7) + ' ' + q(0.66, 1.96), BR.hairD, 1.1, 0.85) +
      L('M' + q(-0.44, 0.5) + ' C' + q(-0.46, 1.0) + ' ' + q(-0.36, 1.4) + ' ' + q(-0.2, 1.74) + ' M' + q(0.3, 1.0) + ' C' + q(0.34, 1.34) + ' ' + q(0.38, 1.6) + ' ' + q(0.4, 1.86) + ' M' + q(0.96, 0.9) + ' C' + q(1.04, 1.2) + ' ' + q(1.0, 1.46) + ' ' + q(0.92, 1.7), BR.hairL, 1, 0.8), c.clip(beard));
    // the grin under the moustache
    var gw = J.grin ? 1 : 0.8;
    o += P('M' + q(0.6 - 0.44 * gw, 0.78) + ' Q' + q(0.6, 0.78 + 0.34 * gw) + ' ' + q(0.6 + 0.46 * gw, 0.76) + ' Q' + q(0.6, 0.9) + ' ' + q(0.6 - 0.44 * gw, 0.78) + ' Z', '#5a1a16', 1.2);
    o += F('M' + q(0.64 - 0.36 * gw, 0.8) + ' Q' + q(0.62, 0.96) + ' ' + q(0.6 + 0.4 * gw, 0.79) + ' Q' + q(0.62, 0.88) + ' ' + q(0.64 - 0.36 * gw, 0.8) + ' Z', '#fffaf0');
    // the moustache: two big lobes sweeping out from under the nose
    var mo = 'M' + q(0.62, 0.38) + ' C' + q(0.36, 0.3) + ' ' + q(0.04, 0.44) + ' ' + q(-0.1, 0.92) + ' C' + q(0.12, 0.74) + ' ' + q(0.38, 0.7) + ' ' + q(0.62, 0.68) +
      ' C' + q(0.84, 0.7) + ' ' + q(1.06, 0.76) + ' ' + q(1.24, 0.9) + ' C' + q(1.18, 0.52) + ' ' + q(0.9, 0.3) + ' ' + q(0.62, 0.38) + ' Z';
    o += P(mo, c.lg([[0, BR.hairL], [0.45, BR.hair], [1, BR.hairD]], 0.3, 0, 0.7, 1), 1.9);
    o += L('M' + q(0.5, 0.44) + ' C' + q(0.3, 0.46) + ' ' + q(0.12, 0.58) + ' ' + q(0.0, 0.78) + ' M' + q(0.76, 0.46) + ' C' + q(0.92, 0.5) + ' ' + q(1.04, 0.6) + ' ' + q(1.12, 0.74), BR.hairL, 0.9, 0.8);
    // a big round nose under the bridge of the glasses
    o += E(X + r * 0.64, Y + r * 0.2, r * 0.3, r * 0.26, c.cel(BR.skin), 1.7) + C(X + r * 0.56, Y + r * 0.12, r * 0.07, '#ffe6cc', 0, 0.8);
    // the swept-back hair over the crown: volume on top, short at the side, a tuft standing up
    var hair = 'M' + q(1.06, -0.46) + ' C' + q(1.14, -1.04) + ' ' + q(0.8, -1.46) + ' ' + q(0.28, -1.6) + ' L' + q(0.2, -1.92) + ' L' + q(-0.1, -1.6) + ' C' + q(-0.5, -1.62) + ' ' + q(-0.9, -1.4) + ' ' + q(-1.08, -1.1) +
      ' L' + q(-1.6, -1.14) + ' L' + q(-1.16, -0.78) + ' C' + q(-1.12, -0.5) + ' ' + q(-1.02, -0.3) + ' ' + q(-0.9, -0.14) + ' L' + q(-0.74, -0.42) + ' C' + q(-0.56, -0.68) + ' ' + q(-0.2, -0.8) + ' ' + q(0.2, -0.8) +
      ' C' + q(0.6, -0.8) + ' ' + q(0.9, -0.68) + ' ' + q(1.06, -0.46) + ' Z';
    o += P(hair, c.lg([[0, BR.hairL], [0.4, BR.hair], [0.75, BR.hair], [1, BR.hairD]], 0.7, 0, 0.3, 1), 2);
    o += L('M' + q(0.8, -0.86) + ' C' + q(0.4, -1.2) + ' ' + q(-0.2, -1.3) + ' ' + q(-0.8, -1.1) + ' M' + q(0.5, -0.84) + ' C' + q(0.1, -1.04) + ' ' + q(-0.4, -1.0) + ' ' + q(-0.9, -0.76), BR.hairD, 1, 0.85);
    o += L('M' + q(0.92, -1.0) + ' C' + q(0.6, -1.36) + ' ' + q(0.1, -1.5) + ' ' + q(-0.3, -1.46), BR.hairL, 1.2, 0.9);
    // bushy brows over the glasses
    o += P('M' + q(-0.36, -0.36) + ' C' + q(-0.1, -0.64) + ' ' + q(0.3, -0.66) + ' ' + q(0.56, -0.46) + ' L' + q(0.5, -0.32) + ' C' + q(0.24, -0.46) + ' ' + q(-0.06, -0.44) + ' ' + q(-0.3, -0.24) + ' Z', BR.hairD, 1.1);
    o += P('M' + q(0.74, -0.44) + ' C' + q(0.9, -0.6) + ' ' + q(1.08, -0.56) + ' ' + q(1.14, -0.44) + ' L' + q(1.1, -0.32) + ' C' + q(1.0, -0.42) + ' ' + q(0.9, -0.42) + ' ' + q(0.78, -0.3) + ' Z', BR.hairD, 1);
    // gold-rimmed aviator sunglasses: two teardrop lenses (the far one foreshortened), a bridge, a temple arm to the ear
    var k = r / 11.5, ly = Y + r * 0.02, nx = X + r * 0.16, fx = X + r * 0.96;
    function lens(cx, cy, s, sx) {
      return 'M' + n(cx - 4.8 * s * sx) + ',' + n(cy - 3.1 * s) + ' L' + n(cx + 4.4 * s * sx) + ',' + n(cy - 3.3 * s) + ' C' + n(cx + 5.6 * s * sx) + ',' + n(cy - 0.8 * s) + ' ' + n(cx + 4.6 * s * sx) + ',' + n(cy + 3.9 * s) + ' ' + n(cx + 0.8 * s * sx) + ',' + n(cy + 4.1 * s) +
        ' C' + n(cx - 2.8 * s * sx) + ',' + n(cy + 4.2 * s) + ' ' + n(cx - 5.4 * s * sx) + ',' + n(cy + 1.4 * s) + ' ' + n(cx - 4.8 * s * sx) + ',' + n(cy - 3.1 * s) + ' Z';
    }
    var near = lens(nx, ly, k * 1.04, 1), far = lens(fx, ly - 0.2 * k, k, 0.62);
    var lensFill = c.lg([[0, '#0c0605'], [0.6, BR.lens], [1, '#4a2e1e']], 0, 0, 0, 1);
    var arm = 'M' + n(nx - 4.9 * k) + ',' + n(ly - 2.6 * k) + ' L' + q(-0.8, -0.14);
    var bridge = 'M' + n(nx + 4.4 * k) + ',' + n(ly - 2.6 * k) + ' Q' + n((nx + fx) / 2 + 0.4) + ',' + n(ly - 4 * k) + ' ' + n(fx - 2.6 * k) + ',' + n(ly - 2.8 * k);
    o += L(arm, OL, 3.2 * SWM) + L(arm, BR.gold, 1.4);
    [far, near].forEach(function (d, i) {
      var cx = i ? nx : fx, w = i ? 1 : 0.62;
      o += F(d, lensFill) + CG(F('M' + n(cx - 5.4 * k * w) + ',' + n(ly + 0.8 * k) + ' L' + n(cx - 1.4 * k * w) + ',' + n(ly - 4 * k) + ' L' + n(cx + 0.6 * k * w) + ',' + n(ly - 4 * k) + ' L' + n(cx - 4.4 * k * w) + ',' + n(ly + 2.8 * k) + ' Z', '#ffffff', 0.85) +
        F('M' + n(cx + 1 * k * w) + ',' + n(ly - 4 * k) + ' L' + n(cx + 2 * k * w) + ',' + n(ly - 4 * k) + ' L' + n(cx - 2.2 * k * w) + ',' + n(ly + 3.2 * k) + ' L' + n(cx - 2.9 * k * w) + ',' + n(ly + 2.6 * k) + ' Z', '#ffffff', 0.45), c.clip(d));
      o += L(d, OL, 3.9 * SWM) + L(d, BR.gold, 1.9);
    });
    o += L(bridge, OL, 3 * SWM) + L(bridge, BR.gold, 1.4) + C(nx - 4.6 * k, ly - 2.8 * k, 0.8 * k, BR.goldL);
    return o;
  }

  // ---- the whole figure in sprite coordinates; opts.upper: head, scarf, torso top and pauldrons only (icon) ----
  function brRig(c, J, opts) {
    opts = opts || {};
    var o = '', X = J.head[0], Y = J.head[1], r = J.head[2];
    if (!opts.upper) {
      o += brCloak(c, J);
      if (J.planted) o += G(greatsword(c, J.planted[3]), swTf(J.planted));
      o += brArm(c, J.bSh, J.bEl, J.bHd, true, 'upper');
    }
    o += pauldron(c, J.bSh[0] - 2, J.bSh[1] - 3, 12, true);
    if (!opts.upper) {
      o += brLeg(c, J.bHip, J.bKn, J.bFt, true);
      o += brLeg(c, J.fHip, J.fKn, J.fFt, false);
    }
    o += brTorso(c, J);
    if (!opts.upper) {
      o += brArm(c, J.bSh, J.bEl, J.bHd, true, 'fore');
      if (J.cross) o += brFist(c, J.bHd, true) + brArm(c, J.fSh, J.fEl, J.fHd, false) + brFist(c, J.fHd, false);
      if (J.sword) o += G(gsBlade(c, J.sword[3]), swTf(J.sword));
    }
    o += pauldron(c, J.fSh[0] + 1, J.fSh[1] - 3, 13, false, true);
    o += brGorget(c, X, Y, r);
    o += brScarf(c, X, Y, r, J.cross ? 0 : 2);
    o += brHead(c, X, Y, r, J);
    if (!opts.upper && !J.cross) {
      o += brArm(c, J.fSh, J.fEl, J.fHd, false, null, 0.34);
      o += G(gsHilt(c), swTf(J.sword));
      o += brFist(c, J.bHd, true) + brFist(c, J.fHd, false);
    }
    return o;
  }
  function bromliSprite(c) { return shadow(c, 66, 30) + brRig(c, BPOSE_SPRITE); }
  function bromliActor(c) {
    var keep = SWM; SWM = 0.8;
    try { return E(84, 155, 44, 5, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])) + G(brRig(c, BPOSE_ACTOR), 'matrix(-1.3,0,0,1.3,166,-2.6)'); } finally { SWM = keep; }
  }

  // =====================================================================
  // ICONS (64 x 64, the art.js / art_legends.js frame)
  // =====================================================================
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75)) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72)) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      L('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + L('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function iglow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]])); }
  function ol(d, col, w, o) { return L(d, OL, w + 2.4, o) + L(d, col, w, o); }
  // a wooden tankard with iron hoops, foam spilling over, centred on (0,0), about 20 x 24
  function tankard(c) {
    var o = '';
    o += L('M8,-6 C15,-6 15,6 8,6', OL, 6.2) + L('M8,-6 C15,-6 15,6 8,6', '#7a4a26', 3.4);
    var body = 'M-9,-9 L9,-9 L8,11 C4,12.4 -4,12.4 -8,11 Z';
    o += P(body, c.lg([[0, '#c88a4e'], [0.45, '#9a5e2e'], [1, '#5e3416']], 0, 0, 1, 0), 2.1);
    o += CG(L('M-3,-9 L-3,12 M3,-9 L3,12', '#5e3416', 1, 0.8) + L('M-10,-3.6 L10,-3.6 M-10,6 L10,6', OL, 3.2) + L('M-10,-3.6 L10,-3.6 M-10,6 L10,6', '#a8adb4', 1.8), c.clip(body));
    o += P('M-10.6,-8 C-12,-12 -8,-15.4 -4.6,-13.6 C-3,-16.6 2.6,-16.8 4,-13.8 C7.4,-15.6 12,-12.4 10.4,-8.4 C11,-6 9,-5 8,-6.4 C7,-4.6 4.6,-4.8 4,-6.4 C3,-4.4 -0.6,-4.6 -1,-6.4 C-2.4,-4.2 -6,-4.6 -6.4,-6.4 C-8,-5 -11,-5.6 -10.6,-8 Z', '#fbf4e0', 1.8);
    o += F('M-7,-12 C-5,-13.6 -2,-13.4 -0.6,-12 C-2.6,-12.6 -5,-12.6 -7,-12 Z', '#ffffff', 0.9) + E(-7.2, -3, 1.3, 2.4, '#fbf4e0', 1.2) + C(-7.2, 0.4, 1, '#fbf4e0', 1);
    return o;
  }
  var ICONS = {
    // his face: the sunglasses, the swept-back hair, the big beard, the star badge on his shoulder
    legend_bromli: function (c) {
      var keep = SWM, g;
      SWM = 0.8;
      try { g = G(brRig(c, BPOSE_ACTOR, { upper: true }), 'matrix(1.06,0,0,1.06,-37.2,-19.4)'); } finally { SWM = keep; }
      return iconWrap(c, ['#e8a048', '#3a1008'], iglow(c, 34, 26, 30, '#ffe0a0', 0.4) + g);
    },
    // Beerhammer Charge: Bromli rushing in behind his near shoulder, greatsword first, dust and speed behind him
    beerhammer_charge: function (c) {
      var keep = SWM, g, o = '', J = BPOSE_SPRITE, X = J.head[0], Y = J.head[1], r = J.head[2];
      o += iglow(c, 52, 26, 22, '#ffe08a', 0.85);
      o += ol('M3,14 L18,14 M2,24 L14,24 M3,34 L16,34 M5,44 L15,44', '#fff4d0', 2, 0.85);
      o += E(16, 58, 12, 4.6, '#c8a06a', 1.4, 0.9) + E(6, 54, 6, 4, '#d8b680', 1.2, 0.9) + E(30, 60, 8, 3.4, '#b89060', 1.2, 0.9);
      SWM = 0.72;
      try {
        // head down, the near pauldron with its star badge leading the charge
        g = brScarf(c, X, Y, r, 3) + brHead(c, X, Y, r, { grin: true }) + pauldron(c, J.fSh[0] + 4, J.fSh[1] - 6, 14, false, true);
        o += G(g, 'translate(-15.8,-29) rotate(16) scale(0.9)');
      } finally { SWM = keep; }
      // the greatsword thrust out ahead of him
      o += G(greatsword(c, 42), 'translate(11,55) rotate(78) scale(0.86)');
      o += sparkle(58, 12, 4.6, '#ffffff') + sparkle(60, 34, 2.6, '#fff4c0');
      return iconWrap(c, ['#c86a2a', '#2a0c06'], o);
    },
    // Tavern Brawl: a greatsword spinning in a ring of swooshes, a full tankard flying out of the spin
    tavern_brawl: function (c) {
      var o = iglow(c, 30, 34, 28, '#ffd070', 0.6);
      o += P('M8,40 C6,22 22,8 40,10 C28,12 16,22 14,38 Z', '#fff6d8', 1.4, 0.9) + P('M56,28 C58,46 42,60 24,58 C36,56 48,46 50,30 Z', '#fff6d8', 1.4, 0.9);
      o += L('M12,46 C10,30 22,16 36,14 M52,22 C54,38 42,52 28,54', '#ffe7a0', 1.2, 0.8);
      o += G(greatsword(c, 38), 'translate(30,36) rotate(-38) scale(0.92)');
      o += G(tankard(c), 'translate(47,15) rotate(24) scale(0.78)');
      o += C(38, 6, 1.6, '#fbf4e0', 1) + C(58, 30, 1.3, '#fbf4e0', 1) + C(34, 12, 1.1, '#fbf4e0', 0.9);
      return iconWrap(c, ['#a84a24', '#1e0a06'], o);
    },
    // the Beerhammer Cloak: the torn red cloak hanging from the gold compass-star clasp
    beerhammer_cloak: function (c) {
      var o = iglow(c, 32, 28, 26, '#ffb070', 0.35);
      var d = 'M22,12 C16,22 11,38 9,54' + rags([12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52], 55, 6, 5) + ' L55,54 C53,38 48,22 42,12 Z';
      o += P(d, c.lg([[0, BR.redL], [0.3, BR.red], [0.75, BR.red], [1, BR.redD]], 0, 0, 1, 1), 2.2);
      o += CG(L('M24,20 C20,32 18,44 17,56 M32,18 L32,58 M40,20 C44,32 46,44 47,56', BR.redD, 1.8, 0.9) + L('M28,20 C26,32 25,44 24,54 M36,20 C38,32 39,44 40,54', BR.redL, 1.1, 0.6) +
        E(20, 44, 1.4, 3.2, OL, 0, 0.9, 12) + E(43, 49, 1.2, 2.8, OL, 0, 0.9, -8) + F('M42,8 L60,8 L60,60 L46,60 C50,40 48,22 42,8 Z', '#000', 0.2), c.clip(d));
      // the collar folded over, the scarf end, the clasp
      o += P('M18,14 C24,9 40,9 46,14 L47,20 C40,17 24,17 17,20 Z', c.cel(BR.red), 2) + L('M20,17 C26,14 38,14 44,17', BR.redD, 1.1, 0.9);
      o += compass(c, 32, 16, 7.4, 1);
      return iconWrap(c, ['#6a2a2a', '#140606'], o + sparkle(47, 30, 2.2, '#ffffff', 0.8));
    }
  };
  // =====================================================================
  // MOBS (128 x 128, facing LEFT, feet on y=122)
  // =====================================================================
  // ---- Thudd the Unbeaten: the Smokebelly ogre build, grey-green and sooty, a champion ----
  var GV = { skin: '#b04832', skinD: '#7a2c1e', skinL: '#d8765e', soot: '#26221e', scar: '#c8c8b0', pants: '#3e2c22', boot: '#221a16', belt: '#5a3620', brass: '#d8a640', brassD: '#8a6020', chain: '#9aa0a8', hair: '#1e1614', tusk: '#efe6cc' };
  function gvTube(pts, w, col) { return tube(pts, w, col, dk(col, 0.22)); }
  // a chain wound round a fist and wrist: overlapping links
  function chainWrap(c, a, b, k, w) {
    // a chain wound round a forearm and fist: links lying across the limb, alternately face-on and edge-on
    var o = '', p = perp(a, b), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / PI;
    w = w || 7;
    for (var i = 0; i < k; i++) {
      var q = lerp(a, b, k > 1 ? i / (k - 1) : 0.5);
      for (var j = -1; j <= 1; j++) {
        var x = q[0] + p[0] * j * w * 0.6, y = q[1] + p[1] * j * w * 0.6, face = (i + j) % 2 === 0;
        var rx = face ? 2.6 : 2.4, ry = face ? 1.7 : 0.8;
        o += E(x, y, rx, ry, 'none', 0, null, ang + 90).replace('fill="none"', 'fill="none" stroke="' + OL + '" stroke-width="2.6"') +
          E(x, y, rx, ry, 'none', 0, null, ang + 90).replace('fill="none"', 'fill="none" stroke="' + (face ? '#c4c9d0' : GV.chain) + '" stroke-width="1.2"');
      }
    }
    return o;
  }
  function gvFist(c, p, r, col) { return C(p[0], p[1], r, c.cel(col), 2.2) + L('M' + n(p[0] - r * 0.6) + ',' + n(p[1] - r * 0.3) + ' l' + n(r * 0.6) + ',' + n(-r * 0.2) + ' M' + n(p[0] - r * 0.7) + ',' + n(p[1] + r * 0.25) + ' l' + n(r * 0.6) + ',' + n(-r * 0.15), dk(col, 0.4), 1.2); }
  function gvHead(c, x, y) {
    var sk = GV.skin, o = '';
    // pointed ear at the back, the black topknot with a gold ring
    o += P(pd([[x + 12, y - 4], [x + 25, y - 13], [x + 19, y + 3]], true), c.cel(sk), 2);
    o += P('M' + pt([x - 2, y - 18]) + 'C' + pt([x - 2, y - 30]) + ' ' + pt([x + 12, y - 32]) + ' ' + pt([x + 12, y - 20]) + 'Z', c.cel(GV.hair), 2) +
      P('M' + pt([x + 8, y - 30]) + 'C' + pt([x + 18, y - 38]) + ' ' + pt([x + 26, y - 30]) + ' ' + pt([x + 22, y - 20]) + 'C' + pt([x + 20, y - 26]) + ' ' + pt([x + 14, y - 28]) + ' ' + pt([x + 10, y - 26]) + 'Z', c.cel(GV.hair), 1.8) +
      L('M' + pt([x + 3, y - 27]) + 'L' + pt([x + 11, y - 27]), GV.brass, 2.2);
    var d = 'M' + pt([x - 18, y - 6]) + 'C' + pt([x - 16, y - 20]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 18, y - 6]) + 'L' + pt([x + 17, y + 10]) + 'C' + pt([x + 14, y + 20]) + ' ' + pt([x + 2, y + 25]) + ' ' + pt([x - 12, y + 23]) +
      'L' + pt([x - 24, y + 17]) + 'C' + pt([x - 27, y + 12]) + ' ' + pt([x - 26, y + 7]) + ' ' + pt([x - 22, y + 5]) + 'L' + pt([x - 22, y]) + 'Z';
    o += P(d, c.cel(sk), 2.2) + CG(F('M' + pt([x + 4, y - 26]) + 'L' + pt([x + 22, y - 26]) + 'L' + pt([x + 22, y + 26]) + 'L' + pt([x + 2, y + 26]) + 'C' + pt([x + 10, y + 12]) + ' ' + pt([x + 10, y - 8]) + ' ' + pt([x + 4, y - 26]) + 'Z', GV.skinD, 0.75) +
      // soot smeared over the brow and down one cheek, an old scar across the nose
      F(pd([[x - 20, y - 3], [x + 6, y - 6], [x + 7, y - 1], [x - 18, y + 3]], true), GV.soot, 0.55) + F('M' + pt([x + 2, y + 2]) + 'C' + pt([x + 8, y + 6]) + ' ' + pt([x + 8, y + 16]) + ' ' + pt([x + 2, y + 20]) + 'L' + pt([x - 2, y + 14]) + 'Z', GV.soot, 0.4) +
      L('M' + pt([x - 16, y - 8]) + 'L' + pt([x - 4, y + 6]), GV.scar, 1.5, 0.9), c.clip(d));
    // heavy brow, a small mean-happy eye
    o += P(pd([[x - 23, y - 5], [x - 6, y - 11], [x + 8, y - 8], [x + 6, y - 3], [x - 8, y - 5], [x - 22, y]], true), c.cel(dk(sk, 0.16)), 1.6);
    o += C(x - 10, y, 2, '#ffcc30', 1) + C(x - 10.5, y - 0.5, 0.6, '#fff');
    // the big grin, teeth with gaps, two tusks (one snapped)
    o += P('M' + pt([x - 27, y + 8]) + 'Q' + pt([x - 14, y + 24]) + ' ' + pt([x + 1, y + 11]) + 'Q' + pt([x - 13, y + 13]) + ' ' + pt([x - 27, y + 8]) + 'Z', '#3a1410', 1.5);
    [[-24, 10.4, -20.4], [-17.6, 12.4, -13.8], [-8.6, 12.6, -5]].forEach(function (t) { o += P(pd([[x + t[0], y + t[1]], [x + t[2], y + t[1] + 0.4], [x + (t[0] + t[2]) / 2 + 0.3, y + t[1] + 4]], true), '#f6eed8', 0.8); });
    o += F(pd([[x - 20, y + 19], [x - 10, y + 19], [x - 14, y + 16.4]], true), '#f6eed8', 0.9);
    o += P('M' + pt([x - 21, y + 16]) + 'Q' + pt([x - 25, y + 8]) + ' ' + pt([x - 21, y + 2]) + 'L' + pt([x - 17, y + 14]) + 'Z', c.cel(GV.tusk), 1.2) +
      P('M' + pt([x - 7, y + 16]) + 'L' + pt([x - 8, y + 10]) + 'L' + pt([x - 5.4, y + 9.4]) + 'L' + pt([x - 4, y + 15]) + 'Z', c.cel(GV.tusk), 1.2);
    return o;
  }
  function thuddRig(c) {
    var sk = GV.skin, o = '';
    o += shadow(c, 64, 46);
    // the far arm raised, flexing: the fist up behind his head
    var fS = [92, 52], fE = [112, 44], fH = [102, 20];
    o += gvTube([fS, fE], 15, dk(sk, 0.1)) + gvTube([fE, fH], 14, dk(sk, 0.1)) + chainWrap(c, lerp(fE, fH, 0.55), lerp(fE, fH, 0.78), 3, 12) + gvFist(c, fH, 9, dk(sk, 0.08)) + chainWrap(c, [fH[0] - 1, fH[1] - 3], [fH[0] - 1, fH[1] + 3], 2, 13);
    // legs: dark trousers into boots
    [[[84, 94], [88, 106], [86, 116]], [[48, 94], [44, 106], [44, 116]]].forEach(function (lg, i) {
      var f = lg[2];
      o += tube([lg[0], lg[1], [f[0], f[1] - 6]], 16, i ? GV.pants : dk(GV.pants, 0.2));
      o += P('M' + n(f[0] + 9) + ',' + n(f[1] - 5) + ' L' + n(f[0] - 3) + ',' + n(f[1] - 5) + ' C' + n(f[0] - 8) + ',' + n(f[1] - 3) + ' ' + n(f[0] - 13) + ',' + n(f[1] + 1) + ' ' + n(f[0] - 13) + ',' + n(f[1] + 6) + ' L' + n(f[0] + 9) + ',' + n(f[1] + 6) + ' Z', c.cel(i ? GV.boot : dk(GV.boot, 0.1)), 2.1);
    });
    // the body: round belly, sooty chest, scars
    var T = 'M28,54 C30,34 94,30 102,52 L104,82 L96,98 L34,98 L26,82 Z';
    o += P(T, c.cel(sk), 2.4);
    o += CG(F('M30,72 C40,92 90,94 102,74 L106,100 L24,100 Z', GV.skinL, 0.4) + F('M84,30 L110,30 L110,100 L90,100 C98,80 96,50 84,30 Z', GV.skinD, 0.6) +
      F('M40,40 C50,36 62,40 60,50 C52,56 40,54 36,48 Z', GV.soot, 0.4) + F('M72,56 C80,52 90,58 86,66 C80,70 72,66 72,56 Z', GV.soot, 0.35) + F('M34,64 C38,62 42,66 40,72 C36,74 32,70 34,64 Z', GV.soot, 0.3) +
      L('M58,70 Q66,74 74,70', dk(sk, 0.3), 1.3) + L('M40,62 l6,6 M44,58 l5,7', dk(sk, 0.35), 1.2, 0.8) +
      L('M52,46 L70,62 M60,44 L66,50 M78,48 L88,40 M84,62 L96,70', GV.scar, 1.6, 0.85) + L('M53,49 l3,-2 M58,53 l3,-2 M63,57.6 l3,-2', GV.scar, 1, 0.8), c.clip(T));
    // ragged loincloth under the belt
    o += P('M40,92 L82,92 L84,110 L78,106 L74,113 L68,106 L62,113 L56,106 L50,112 L46,106 L40,110 Z', c.cel('#4a3226'), 1.8) + L('M44,96 L80,96', dk('#4a3226', 0.4), 1.2);
    // the champion's belt: wide leather, side plates, a huge brass buckle with a flame worked into it
    o += P('M26,80 Q64,90 104,80 L104,92 Q64,102 26,92 Z', c.cel(GV.belt), 2);
    [[34, 86], [92, 86]].forEach(function (p) { o += R(p[0] - 4, p[1] - 4.4, 8, 9, c.cel(GV.brass), 1.4) + C(p[0], p[1], 1, '#fff2c0', 0.5); });
    o += E(58, 88, 16, 12, c.rg([[0, '#fbe08a'], [0.55, GV.brass], [1, GV.brassD]], 0.38, 0.32, 0.72), 2.4);
    o += E(58, 88, 12, 8.6, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + GV.brassD + '" stroke-width="1.4"');
    o += P('M58,80.4 C61,83 64,85 63.4,89 C63,92.6 60.6,94.4 58,94.6 C55.4,94.4 53,92.6 52.6,89 C52.4,86.6 54,85 55.4,84 C55.4,86 56.4,87 57.4,87.4 C56.4,85 57,82.4 58,80.4 Z', c.cel('#e8401e'), 1.2);
    [[44, 88], [72, 88], [58, 77.6], [58, 98.4]].forEach(function (p) { o += C(p[0], p[1], 1.3, '#fff2c0', 0.7); });
    // the near arm up in a fighter's guard: the upper arm behind the head, the forearm and chain-wrapped fist in front
    var nS = [38, 60], nE = [22, 86], nH = [13, 64];
    o += gvTube([nS, nE], 15, sk);
    o += gvHead(c, 46, 35);
    o += gvTube([nE, nH], 14, sk) + chainWrap(c, lerp(nE, nH, 0.55), lerp(nE, nH, 0.78), 3, 12) + gvFist(c, nH, 9.4, sk) + chainWrap(c, [nH[0] - 1, nH[1] - 3], [nH[0] - 1, nH[1] + 3], 2, 13);
    return o;
  }

  // ---- Old Duneback: a hunched old sand giant, sandstone skin, sand running from his joints, a nest on his head ----
  var DB = { sand: '#d6ae74', sandD: '#a47c48', sandL: '#f2d8a4', crack: '#5a3a1e', grain: '#e8c890', wood: '#6e4a28', stone: '#9a8a74', stoneD: '#645646', nest: '#8a6436' };
  function sandFall(c, x, y, len, seed) {
    // a thin stream of sand pouring from a joint, grains scattering at its foot
    var r = rng(seed), o = F('M' + n(x - 1.8) + ',' + n(y) + ' C' + n(x - 1.4) + ',' + n(y + len * 0.5) + ' ' + n(x - 0.6) + ',' + n(y + len * 0.8) + ' ' + n(x) + ',' + n(y + len) + ' C' + n(x + 0.6) + ',' + n(y + len * 0.8) + ' ' + n(x + 1.4) + ',' + n(y + len * 0.5) + ' ' + n(x + 1.8) + ',' + n(y) + ' Z', DB.grain, 0.9);
    for (var i = 0; i < 6; i++) o += C(x + (r() - 0.5) * 6, y + len * (0.3 + r() * 0.8), 0.5 + r() * 0.5, DB.grain, 0, 0.9);
    return o;
  }
  function strata(x0, y0, w, h, k, seed) {
    var r = rng(seed), d = '';
    for (var i = 0; i < k; i++) {
      var y = y0 + (i + 0.5) * h / k, s = 'M' + n(x0) + ',' + n(y);
      for (var x = x0; x <= x0 + w; x += 10) s += ' Q' + n(x + 5) + ',' + n(y + (r() - 0.5) * 4) + ' ' + n(x + 10) + ',' + n(y + (r() - 0.5) * 2);
      d += s;
    }
    return d;
  }
  function crackD(x, y, seed, len) {
    var r = rng(seed), d = 'M' + n(x) + ',' + n(y), px = x, py = y;
    for (var i = 0; i < 4; i++) { px += (r() - 0.5) * 7; py += len / 4; d += ' L' + n(px) + ',' + n(py); if (i === 1) d += ' M' + n(px) + ',' + n(py) + ' l' + n(4 + r() * 3) + ',' + n(3 + r() * 2) + ' M' + n(px) + ',' + n(py); }
    return d;
  }
  function stoneTube(c, pts, w, col, seed) {
    var o = tube(pts, w, col, dk(col, 0.2));
    o += L(crackD(pts[0][0] + 1, pts[0][1] + 2, seed, Math.abs(pts[pts.length - 1][1] - pts[0][1]) * 0.7), DB.crack, 1.1, 0.8);
    return o;
  }
  function dbHead(c, hx, hy) {
    var o = '';
    var H = 'M' + n(hx - 12) + ',' + n(hy - 10) + ' C' + n(hx - 10) + ',' + n(hy - 22) + ' ' + n(hx + 14) + ',' + n(hy - 22) + ' ' + n(hx + 18) + ',' + n(hy - 8) + ' L' + n(hx + 18) + ',' + n(hy + 10) + ' C' + n(hx + 14) + ',' + n(hy + 20) + ' ' + n(hx) + ',' + n(hy + 22) + ' ' + n(hx - 8) + ',' + n(hy + 18) +
      ' L' + n(hx - 14) + ',' + n(hy + 10) + ' Z';
    o += P(H, c.cel(DB.sand), 2.3) + CG(F('M' + n(hx + 6) + ',' + n(hy - 24) + ' L' + n(hx + 24) + ',' + n(hy - 24) + ' L' + n(hx + 24) + ',' + n(hy + 24) + ' L' + n(hx + 4) + ',' + n(hy + 24) + ' C' + n(hx + 12) + ',' + n(hy + 8) + ' ' + n(hx + 12) + ',' + n(hy - 8) + ' ' + n(hx + 6) + ',' + n(hy - 24) + ' Z', DB.sandD, 0.6) +
      L(strata(hx - 16, hy - 14, 36, 34, 3, 61), DB.sandD, 1.1, 0.7) + L(crackD(hx + 4, hy - 16, 62, 12), DB.crack, 1.1, 0.9), c.clip(H));
    // an ear like a worn ledge of rock
    o += P('M' + n(hx + 12) + ',' + n(hy - 4) + ' C' + n(hx + 20) + ',' + n(hy - 8) + ' ' + n(hx + 22) + ',' + n(hy + 2) + ' ' + n(hx + 14) + ',' + n(hy + 6) + ' Z', c.cel(dk(DB.sand, 0.1)), 1.6);
    // heavy brow ridge over small, tired, grumpy eyes
    o += P('M' + n(hx - 15) + ',' + n(hy - 4) + ' C' + n(hx - 10) + ',' + n(hy - 12) + ' ' + n(hx + 4) + ',' + n(hy - 12) + ' ' + n(hx + 10) + ',' + n(hy - 7) + ' L' + n(hx + 8) + ',' + n(hy - 2) + ' C' + n(hx + 2) + ',' + n(hy - 6) + ' ' + n(hx - 8) + ',' + n(hy - 6) + ' ' + n(hx - 14) + ',' + n(hy) + ' Z', c.cel(dk(DB.sand, 0.12)), 1.8);
    o += E(hx - 5.6, hy - 0.4, 4.2, 2.6, '#6a4a28', 0, 0.8) + E(hx - 6, hy - 0.2, 2.4, 1.6, '#1e1208') + C(hx - 6.8, hy - 0.6, 0.9, '#f4c860') + L('M' + n(hx - 9.6) + ',' + n(hy - 1.8) + ' L' + n(hx - 2.4) + ',' + n(hy - 2.4), OL, 1.6);
    // big craggy nose, the mouth turned down, a crumbling stone beard
    o += P('M' + n(hx - 8) + ',' + n(hy - 2) + ' C' + n(hx - 16) + ',' + n(hy + 2) + ' ' + n(hx - 18) + ',' + n(hy + 8) + ' ' + n(hx - 12) + ',' + n(hy + 9) + ' C' + n(hx - 8) + ',' + n(hy + 10) + ' ' + n(hx - 5) + ',' + n(hy + 6) + ' ' + n(hx - 4) + ',' + n(hy + 2) + ' Z', c.cel(DB.sand), 1.7);
    o += P('M' + n(hx - 12) + ',' + n(hy + 15.4) + ' Q' + n(hx - 6) + ',' + n(hy + 11) + ' ' + n(hx + 2) + ',' + n(hy + 15.4) + ' Q' + n(hx - 6) + ',' + n(hy + 13.4) + ' ' + n(hx - 12) + ',' + n(hy + 15.4) + ' Z', '#3a2210', 1.4) + L('M' + n(hx - 2) + ',' + n(hy + 9) + ' l3,2 M' + n(hx - 14) + ',' + n(hy + 12) + ' l-2,2', DB.sandD, 1.1);
    o += P('M' + n(hx - 12) + ',' + n(hy + 17) + ' L' + n(hx + 6) + ',' + n(hy + 17.4) + ' L' + n(hx + 4) + ',' + n(hy + 24) + ' L' + n(hx) + ',' + n(hy + 21) + ' L' + n(hx - 3) + ',' + n(hy + 27) + ' L' + n(hx - 6) + ',' + n(hy + 21) + ' L' + n(hx - 10) + ',' + n(hy + 24) + ' Z', c.cel(dk(DB.sand, 0.08)), 1.6);
    // the bird's nest on his head, a small bird looking out of it, two eggs
    o += P('M' + n(hx - 10) + ',' + n(hy - 17) + ' C' + n(hx - 10) + ',' + n(hy - 10) + ' ' + n(hx + 12) + ',' + n(hy - 10) + ' ' + n(hx + 12) + ',' + n(hy - 17) + ' Z', c.cel(DB.nest), 1.8);
    o += L('M' + n(hx - 12) + ',' + n(hy - 17) + ' L' + n(hx + 14) + ',' + n(hy - 16) + ' M' + n(hx - 9) + ',' + n(hy - 14) + ' L' + n(hx + 10) + ',' + n(hy - 12.6) + ' M' + n(hx - 13) + ',' + n(hy - 15) + ' l-3,-2 M' + n(hx + 12) + ',' + n(hy - 15) + ' l4,-3', '#4a3218', 1.2);
    o += C(hx + 4, hy - 21, 4, c.cel('#6a8ab8'), 1.6) + P('M' + n(hx) + ',' + n(hy - 22) + ' L' + n(hx - 3.6) + ',' + n(hy - 21) + ' L' + n(hx) + ',' + n(hy - 20) + ' Z', '#f0b030', 1) + C(hx + 2.4, hy - 22.4, 0.8, OL);
    o += C(hx - 4, hy - 17.6, 2, c.cel('#f4ecdc'), 1.1) + C(hx + 9, hy - 17.4, 1.8, c.cel('#e8f0f4'), 1);
    return o;
  }
  function dunebackRig(c) {
    var o = '';
    o += shadow(c, 66, 52);
    // far arm hanging behind
    o += stoneTube(c, [[100, 54], [112, 80], [108, 102]], 18, dk(DB.sand, 0.18), 3) + C(108, 104, 9.6, c.cel(dk(DB.sand, 0.18)), 2.2) + sandFall(c, 113, 82, 20, 5);
    // legs: short pillars, flat stone feet, sand trickling from the knees
    [[[90, 94], [94, 116]], [[56, 94], [52, 116]]].forEach(function (lg, i) {
      var col = i ? DB.sand : dk(DB.sand, 0.14);
      var f = lg[1];
      o += stoneTube(c, [lg[0], [f[0], f[1] - 8]], 21, col, 11 + i);
      o += P('M' + n(f[0] + 12) + ',' + n(f[1] - 4) + ' L' + n(f[0] - 6) + ',' + n(f[1] - 5) + ' C' + n(f[0] - 12) + ',' + n(f[1] - 3) + ' ' + n(f[0] - 16) + ',' + n(f[1] + 1) + ' ' + n(f[0] - 16) + ',' + n(f[1] + 6) + ' L' + n(f[0] + 12) + ',' + n(f[1] + 6) + ' Z', c.cel(dk(col, 0.06)), 2.2) +
        L('M' + n(f[0] - 10) + ',' + n(f[1] + 6) + ' l0,-3 M' + n(f[0] - 4) + ',' + n(f[1] + 6) + ' l0,-3.4', DB.crack, 1, 0.8);
      o += sandFall(c, f[0] + 4, lg[0][1] + 8, 11, 21 + i);
    });
    // the hunched body: a great sandstone back rising high above the head, a belly underneath
    var B = pd([[30, 72], [31, 52], [40, 36], [55, 25], [73, 18], [92, 18], [108, 26], [118, 40], [121, 58], [118, 77], [110, 92], [98, 101], [48, 102], [37, 94]], true);
    o += P(B, c.cel(DB.sand), 2.6);
    o += CG(L(strata(20, 26, 106, 72, 6, 41), DB.sandD, 1.4, 0.7) + F('M96,16 L126,16 L126,104 L104,104 C116,80 112,40 96,16 Z', DB.sandD, 0.55) + F('M44,26 C60,18 78,16 92,20 C74,24 58,30 46,40 Z', DB.sandL, 0.75) +
      F('M44,80 C56,92 80,98 102,90 L104,104 L40,104 Z', DB.sandL, 0.45) + L('M48,86 C62,94 82,96 100,90', DB.sandD, 1.2, 0.8) +
      L(crackD(74, 24, 51, 30) + crackD(100, 40, 52, 28) + crackD(62, 50, 53, 22), DB.crack, 1.4, 0.9) +
      L('M73,18 L78,40 L64,60 M92,18 L96,44 L118,58 M78,40 L96,44 M64,60 L86,70 L118,77 M86,70 L96,44', dk(DB.sandD, 0.15), 1.1, 0.55) + F('M96,44 L118,58 L118,77 L86,70 Z', DB.sandD, 0.35) + F('M55,25 L73,18 L78,40 L64,60 L40,36 Z', DB.sandL, 0.35) +
      E(86, 30, 6, 3, '#8a9a5a', 0, 0.8) + E(62, 26, 4, 2, '#9aaa66', 0, 0.8), c.clip(B));
    // weathered ridge rocks along his spine, a tuft of desert flowers growing between them
    [[64, 20, 7], [80, 17, 8], [96, 22, 7], [108, 32, 6]].forEach(function (q, i) {
      o += P('M' + n(q[0] - q[2]) + ',' + n(q[1] + 3) + ' L' + n(q[0] - q[2] * 0.4) + ',' + n(q[1] - q[2] * 0.8) + ' L' + n(q[0] + q[2] * 0.5) + ',' + n(q[1] - q[2] * 0.6) + ' L' + n(q[0] + q[2]) + ',' + n(q[1] + 3) + ' Z', c.cel(i % 2 ? DB.sandD : lt(DB.sandD, 0.2)), 1.8);
    });
    o += L('M88,14 l-2,-6 M88,14 l3,-5 M88,14 l0,-7', '#6a8a3a', 1.6) + C(88, 7, 1.4, '#e87a9a', 0.7) + C(84.6, 8.6, 1.1, '#f0c040', 0.6);
    // the near shoulder: a boulder of a joint, sand pouring from under it
    o += C(46, 58, 16, c.cel(DB.sand), 2.4) + CG(L(strata(30, 44, 32, 28, 3, 91), DB.sandD, 1.2, 0.7) + L(crackD(48, 46, 92, 18), DB.crack, 1.2, 0.9), c.clip('M30,58 A16,16 0 1 0 62,58 A16,16 0 1 0 30,58 Z'));
    // the long near arm hanging to his boulder club, sand pouring from the elbow
    var sS = [48, 70], sE = [32, 92], sH = [24, 104];
    o += stoneTube(c, [sS, sE], 21, DB.sand, 81) + stoneTube(c, [sE, sH], 19, DB.sand, 82);
    o += sandFall(c, sE[0] - 6, sE[1] + 3, 14, 83) + sandFall(c, 60, 74, 10, 84);
    // the head: low and forward under the hunch
    o += G(dbHead(c, 38, 41), 'translate(38,41) scale(1.34) translate(-38,-41)');
    // the boulder club: a stripped trunk, a boulder lashed to its foot with rope, resting on the ground
    o += tube([[26, 98], [14, 110]], 7.4, DB.wood, dk(DB.wood, 0.3));
    o += P('M4,112 C3,102 12,96 20,98 C28,100 30,108 28,114 C26,120 16,122 10,121 C5,120 4,116 4,112 Z', c.cel(DB.stone), 2.2) +
      L('M9,104 l5,4 M18,112 l6,-3 M11,116 l4,2', DB.stoneD, 1.2) + L('M13,99 C18,104 20,110 18,118 M22,99 C24,104 24,108 22,116', OL, 3) + L('M13,99 C18,104 20,110 18,118 M22,99 C24,104 24,108 22,116', '#c8a870', 1.6);
    o += C(24, 105, 10, c.cel(DB.sand), 2.2) + L('M17,104 l7,-2.4 M17,108.4 l7,-1.8', DB.sandD, 1.3);
    return o;
  }
  // Thudd is drawn a little smaller about his feet, as art_steppes.js draws the Smokebelly ogres, so his topknot and fists stay in the frame
  function thuddMob(c) { return G(thuddRig(c), 'translate(64,122) scale(0.94) translate(-64,-122)'); }
  var MOBS_FN = { duneback: dunebackRig, thudd: thuddMob };
  // =====================================================================
  // SCENE (400 x 240): the Smokebelly fire pit in the Cinderfields
  // =====================================================================
  function cloud(x, y, w, h, col, o, seed) {
    var r = rng(seed), d = 'M' + n(x - w / 2) + ',' + n(y), k = 6;
    for (var i = 0; i < k; i++) { var x0 = x - w / 2 + w * i / k, x1 = x - w / 2 + w * (i + 1) / k; d += ' Q' + n((x0 + x1) / 2) + ',' + n(y - h * (0.6 + r() * 0.6)) + ' ' + n(x1) + ',' + n(y); }
    return F(d + ' Q' + n(x) + ',' + n(y + h * 0.35) + ' ' + n(x - w / 2) + ',' + n(y) + ' Z', col, o);
  }
  function flameD(x, y, s, lean) {
    lean = lean || 0;
    return 'M' + n(x - 4 * s) + ',' + n(y) + ' C' + n(x - 6 * s) + ',' + n(y - 6 * s) + ' ' + n(x - 2 * s + lean * 0.4) + ',' + n(y - 8 * s) + ' ' + n(x + lean) + ',' + n(y - 16 * s) +
      ' C' + n(x + 2 * s + lean * 0.5) + ',' + n(y - 9 * s) + ' ' + n(x + 6 * s) + ',' + n(y - 7 * s) + ' ' + n(x + 4 * s) + ',' + n(y) + ' Z';
  }
  function fire(c, x, y, s, lean) {
    return C(x, y - 8 * s, 22 * s, glow(c, '#ff8a2a', 0.55)) + P(flameD(x, y, s, lean), c.lg([[0, '#ffe890'], [0.5, '#ff9a2a'], [1, '#e0401a']], 0, 1, 0, 0), 1.3) + F(flameD(x, y - 0.5 * s, s * 0.55, lean * 0.5), '#fff6c8', 0.95);
  }
  function torch(c, x, y, h) {
    return L('M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h), OL, 4.6) + L('M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - h), '#5a3a22', 2.6) +
      P('M' + n(x - 4) + ',' + n(y - h) + ' L' + n(x + 4) + ',' + n(y - h) + ' L' + n(x + 2.6) + ',' + n(y - h + 5) + ' L' + n(x - 2.6) + ',' + n(y - h + 5) + ' Z', '#3a2a22', 1.2) + fire(c, x, y - h, 0.9, 1);
  }
  function banner(c, x, y, h, col, mark) {
    // a stretched hide banner on a crooked pole, a ragged hem, a simple painted mark (a fist or a flame)
    var o = L('M' + n(x) + ',' + n(y + h + 34) + ' L' + n(x + 1) + ',' + n(y - 6), OL, 4) + L('M' + n(x) + ',' + n(y + h + 34) + ' L' + n(x + 1) + ',' + n(y - 6), '#4a3020', 2.2);
    o += L('M' + n(x - 12) + ',' + n(y) + ' L' + n(x + 13) + ',' + n(y - 1), OL, 3.6) + L('M' + n(x - 12) + ',' + n(y) + ' L' + n(x + 13) + ',' + n(y - 1), '#5a3a22', 2);
    var d = 'M' + n(x - 10) + ',' + n(y) + ' L' + n(x + 11) + ',' + n(y - 0.6) + ' L' + n(x + 10) + ',' + n(y + h) + ' L' + n(x + 6) + ',' + n(y + h - 4) + ' L' + n(x + 2) + ',' + n(y + h + 3) + ' L' + n(x - 3) + ',' + n(y + h - 3) + ' L' + n(x - 7) + ',' + n(y + h + 2) + ' L' + n(x - 10) + ',' + n(y + h - 2) + ' Z';
    o += P(d, c.lg([[0, lt(col, 0.2)], [0.6, col], [1, dk(col, 0.35)]], 0, 0, 1, 1), 1.6);
    var mx = x + 0.4, my = y + h * 0.45;
    if (mark === 'fist') o += P('M' + n(mx - 5) + ',' + n(my - 3) + ' C' + n(mx - 5) + ',' + n(my - 7) + ' ' + n(mx + 5) + ',' + n(my - 7) + ' ' + n(mx + 5) + ',' + n(my - 3) + ' L' + n(mx + 4) + ',' + n(my + 3) + ' L' + n(mx + 2) + ',' + n(my + 8) + ' L' + n(mx - 2) + ',' + n(my + 8) + ' L' + n(mx - 4) + ',' + n(my + 3) + ' Z', '#c8281a', 0.9) + L('M' + n(mx - 4) + ',' + n(my - 3) + ' L' + n(mx + 4) + ',' + n(my - 3) + ' M' + n(mx - 1.4) + ',' + n(my - 6) + ' L' + n(mx - 1.4) + ',' + n(my - 3) + ' M' + n(mx + 1.6) + ',' + n(my - 6) + ' L' + n(mx + 1.6) + ',' + n(my - 3), '#6a1008', 0.8);
    else o += F(flameD(mx, my + 7, 0.72, 1), '#d8401a', 0.95) + F(flameD(mx, my + 6, 0.36, 0.6), '#f4b040', 0.95);
    return o;
  }
  function stands(c, x0, x1, yTop, yBase, seed, flip) {
    // crude tiered wooden stands: posts, three rows of planks, lashings, a few spectators' silhouettes
    var r = rng(seed), o = '', w = x1 - x0, tiers = 3;
    for (var i = 0; i <= 6; i++) { var px = x0 + w * i / 6 + (r() - 0.5) * 3; o += L('M' + n(px) + ',' + n(yBase) + ' L' + n(px + (r() - 0.5) * 2) + ',' + n(yTop - 4), OL, 4.4) + L('M' + n(px) + ',' + n(yBase) + ' L' + n(px + (r() - 0.5) * 2) + ',' + n(yTop - 4), '#4a3020', 2.6); }
    o += L('M' + n(x0) + ',' + n(yBase - 2) + ' L' + n(x0 + w / 3) + ',' + n(yTop + 6) + ' M' + n(x0 + w / 3) + ',' + n(yBase - 2) + ' L' + n(x0 + w * 2 / 3) + ',' + n(yTop + 6) + ' M' + n(x0 + w * 2 / 3) + ',' + n(yBase - 2) + ' L' + n(x1) + ',' + n(yTop + 6), '#3a2418', 1.8, 0.9);
    for (var t = 0; t < tiers; t++) {
      var y = yTop + (yBase - yTop) * t / tiers, tw = 0.86 + t * 0.07, xa = x0 + w * (1 - tw) / 2, xb = x1 - w * (1 - tw) / 2;
      // spectators on this tier
      for (var k = 0; k < 7; k++) {
        if (r() < 0.35) continue;
        var sx = xa + (xb - xa) * (k + 0.5) / 7 + (r() - 0.5) * 6, sz = 5 + t * 0.8 + r() * 1.6;
        var sc = r() < 0.5 ? '#24140f' : '#1a0e0b';
        if (r() < 0.45) o += L('M' + n(sx + sz * 0.9) + ',' + n(y - sz * 0.5) + ' L' + n(sx + sz * 1.3) + ',' + n(y - sz * 1.9), sc, 3.2) + C(sx + sz * 1.35, y - sz * 2.1, sz * 0.42, sc);
        o += F('M' + n(sx - sz * 1.3) + ',' + n(y + 1) + ' C' + n(sx - sz * 1.4) + ',' + n(y - sz * 1.3) + ' ' + n(sx + sz * 1.4) + ',' + n(y - sz * 1.3) + ' ' + n(sx + sz * 1.3) + ',' + n(y + 1) + ' Z', sc) + C(sx - sz * 0.2, y - sz * 1.3, sz * 0.66, sc);
        o += L('M' + n(sx - sz * 0.8) + ',' + n(y - sz * 1.5) + ' Q' + n(sx - sz * 0.2) + ',' + n(y - sz * 2.2) + ' ' + n(sx + sz * 0.4) + ',' + n(y - sz * 1.7) + ' M' + n(sx + sz * 0.6) + ',' + n(y - sz * 0.9) + ' Q' + n(sx + sz * 1.1) + ',' + n(y - sz * 0.8) + ' ' + n(sx + sz * 1.3) + ',' + n(y - sz * 0.1), '#ff8a3a', 1, 0.6);
      }
      o += P('M' + n(xa) + ',' + n(y) + ' L' + n(xb) + ',' + n(y + (r() - 0.5) * 2) + ' L' + n(xb) + ',' + n(y + 5) + ' L' + n(xa) + ',' + n(y + 5.4) + ' Z', c.lg([[0, '#9a6a3e'], [0.5, '#7a5030'], [1, '#4a3020']]), 1.5);
      o += L('M' + n(xa + 2) + ',' + n(y + 2.4) + ' L' + n(xb - 2) + ',' + n(y + 2.2), '#5a3a22', 0.8, 0.8);
      for (var j = 1; j < 6; j++) { var lx = xa + (xb - xa) * j / 6; o += L('M' + n(lx - 1.6) + ',' + n(y - 0.6) + ' L' + n(lx + 1.6) + ',' + n(y + 5.6) + ' M' + n(lx + 1.6) + ',' + n(y - 0.6) + ' L' + n(lx - 1.6) + ',' + n(y + 5.6), '#c8a870', 0.9, 0.8); }
    }
    return o;
  }
  function pitScene(c) {
    var s = '', r = rng(4242);
    // a red-black smoky sky
    s += R(0, 0, 400, 240, c.lg([[0, '#140709'], [0.3, '#2e0e10'], [0.5, '#5e1c12'], [0.62, '#8a3416'], [1, '#8a3416']]));
    s += C(300, 96, 130, glow(c, '#ff5a1a', 0.35));
    [[60, 30, 150, 22, 1], [220, 20, 170, 26, 2], [360, 40, 120, 20, 3], [130, 60, 140, 16, 4], [300, 64, 110, 14, 5]].forEach(function (q) {
      s += cloud(q[0], q[1], q[2], q[3], '#1a0c0c', 0.75, q[4]) + L('M' + n(q[0] - q[2] * 0.3) + ',' + n(q[1] + 1) + ' Q' + n(q[0]) + ',' + n(q[1] + q[3] * 0.3) + ' ' + n(q[0] + q[2] * 0.3) + ',' + n(q[1] + 1), '#c04a1e', 1.4, 0.35);
    });
    // the volcano on the horizon, glowing, smoking
    s += cloud(300, 40, 80, 40, '#241212', 0.8, 7) + cloud(286, 22, 60, 24, '#2a1414', 0.7, 8);
    s += P('M214,118 L262,62 C270,56 276,54 282,56 L292,52 C300,50 306,54 312,60 L372,118 Z', c.lg([[0, '#3a1a16'], [1, '#1a0c0c']]), 2);
    s += L('M284,58 C282,72 276,86 268,100 M298,56 C302,72 310,88 320,104 M290,56 L290,70', '#ff7a1a', 2.2, 0.85) + L('M284,58 C282,72 276,86 268,100 M298,56 C302,72 310,88 320,104', '#ffd060', 0.8, 0.9);
    s += E(292, 54, 14, 4, c.rg([[0, '#fff0a0'], [0.4, '#ff8a2a'], [1, '#ff4a1a', 0]]));
    // far ridges
    s += F('M0,106 L30,96 L60,102 L96,90 L130,100 L170,94 L214,108 L240,104 L372,112 L400,100 L400,130 L0,130 Z', '#2a1210');
    s += F('M0,116 L50,110 L100,114 L150,108 L210,116 L270,112 L330,118 L400,112 L400,134 L0,134 Z', '#1e0e0c');
    // the stands on both sides of the pit, the gong between them
    s += stands(c, 4, 160, 82, 124, 91) + stands(c, 240, 396, 82, 124, 92, true);
    // the gong: a timber frame, a great brass disc, the beater leaning against a post
    s += L('M176,128 L178,58 M224,128 L222,58', OL, 6.4) + L('M176,128 L178,58 M224,128 L222,58', '#5a3a22', 4.2);
    s += P('M168,60 C184,54 216,54 232,60 L233,66 C216,61 184,61 167,66 Z', c.cel('#6a4428'), 1.8) + L('M170,58 l-4,-5 M230,58 l4,-5', '#4a3020', 3);
    s += L('M190,63 L192,70 M210,63 L208,70', '#2a1a10', 1.4);
    s += C(200, 92, 23, c.rg([[0, '#ffe8a0'], [0.3, '#e6b040'], [0.75, '#b07a22'], [1, '#6a4410']], 0.38, 0.32, 0.72), 2.4);
    s += ring(200, 92, 16, '#8a5a18', 1.2, 0.8) + ring(200, 92, 9, '#8a5a18', 1.2, 0.8) + C(200, 92, 4.6, c.cel('#d8a040'), 1.2) + L('M186,82 Q192,76 200,75', '#fff6c8', 1.6, 0.8);
    s += L('M226,128 L238,98', OL, 4) + L('M226,128 L238,98', '#6a4428', 2.2) + E(239.6, 94.6, 4.4, 5.4, c.cel('#7a5a3a'), 1.4, null, 22);
    // hide banners and torches
    s += banner(c, 40, 50, 22, '#b89060', 'fist') + banner(c, 140, 58, 20, '#a88050', 'flame') + banner(c, 262, 58, 20, '#a88050', 'flame') + banner(c, 362, 50, 22, '#b89060', 'fist');
    s += torch(c, 12, 128, 44) + torch(c, 166, 126, 38) + torch(c, 234, 126, 38) + torch(c, 390, 128, 44);
    // ground outside the pit
    s += R(0, 124, 400, 116, c.lg([[0, '#2a1814'], [1, '#3a241c']]));
    // the pit: the trench of embers round it, a ring of stones on its inner edge, the fighting floor inside
    var cx = 200, cy = 206, rx = 312, ry = 80;
    function ell(a, b) { return 'M' + n(cx - a) + ',' + n(cy) + ' A' + n(a) + ',' + n(b) + ' 0 1 1 ' + n(cx + a) + ',' + n(cy) + ' A' + n(a) + ',' + n(b) + ' 0 1 1 ' + n(cx - a) + ',' + n(cy) + ' Z'; }
    s += F(ell(rx + 14, ry + 6), '#1a0e0a');
    s += F(ell(rx + 8, ry + 3), c.rg([[0.86, '#ff6a1a'], [0.93, '#ffb040'], [0.975, '#ff7a1a'], [1, '#7a1e0a']], 0.5, 0.5, 0.5));
    s += E(cx, cy - ry - 1, 220, 10, glow(c, '#ffa040', 0.45));
    // coals in the trench
    for (var i = 0; i < 70; i++) {
      var a = PI + (i / 70) * PI, px = cx + Math.cos(a) * (rx + 3), py = cy + Math.sin(a) * (ry + 1.5);
      if (px < -8 || px > 408) continue;
      s += E(px + (r() - 0.5) * 3, py + (r() - 0.5) * 1.6, 2.2 + r() * 1.6, 1.2 + r() * 0.6, r() < 0.5 ? '#3a120a' : '#fff0a0', 0, 0.85);
    }
    // the floor: packed ash and earth, warm near the embers
    var fl = ell(rx - 4, ry - 4);
    s += F(fl, c.lg([[0, '#6a4434'], [0.25, '#5a3a2e'], [1, '#4a3026']]));
    s += CG(E(cx, cy - ry + 6, 300, 16, glow(c, '#ff9a4a', 0.35)) +
      L('M120,168 q12,-3 24,0 M252,160 q10,-3 20,0 M186,196 q14,-3 28,0 M70,210 q14,-3 28,0 M300,206 q14,-3 28,0 M140,226 q12,-3 24,0 M250,230 q12,-2 24,0', '#3a241c', 1.6, 0.7) +
      L('M40,190 L60,188 M320,176 L346,174 M200,150 L222,149 M100,150 L118,149', '#7a5444', 1.4, 0.6), c.clip(fl));
    // a few pebbles, a dropped bone, a broken chain on the floor
    [[96, 176, 3], [292, 186, 3.4], [214, 214, 2.6], [58, 226, 3], [352, 222, 3.2], [150, 146, 2.2], [262, 144, 2.4]].forEach(function (q) { s += E(q[0], q[1], q[2], q[2] * 0.6, c.cel('#6a5a50'), 1.1); });
    s += P('M168,178 L186,174 L187,176.6 L169,180.6 Z', '#e8dcc0', 1.1) + C(167, 180, 2, '#e8dcc0', 1.1) + C(188, 174.4, 2, '#e8dcc0', 1.1);
    [[318, 160], [323, 161.6], [328, 162.4], [333, 162]].forEach(function (p, j) { s += E(p[0], p[1], 2.6, j % 2 ? 0.9 : 1.6, 'none', 0).replace('fill="none"', 'fill="none" stroke="#9aa0a8" stroke-width="1.2"'); });
    // the stones round the inner edge of the trench (the back arc)
    for (var k = 0; k <= 30; k++) {
      var b = PI + (k / 30) * PI, sx = cx + Math.cos(b) * (rx - 5), sy = cy + Math.sin(b) * (ry - 3);
      if (sx < -10 || sx > 410) continue;
      var sw = 8 + r() * 4, sh = 4 + r() * 2;
      s += E(sx, sy, sw * 0.6, sh * 0.6, c.lg([[0, '#9a8478'], [0.5, '#6a5a52'], [1, '#3a2e2a']]), 1.4) + L('M' + n(sx - sw * 0.35) + ',' + n(sy - sh * 0.35) + ' Q' + n(sx) + ',' + n(sy - sh * 0.6) + ' ' + n(sx + sw * 0.3) + ',' + n(sy - sh * 0.4), '#ffb070', 0.9, 0.6);
    }
    // sparks drifting up from the embers
    for (var m = 0; m < 26; m++) { var ex = 10 + r() * 380, ey = 30 + r() * 110; s += C(ex, ey, 0.7 + r() * 0.9, r() < 0.5 ? '#ffd070' : '#ff8a3a', 0, 0.6 + r() * 0.35); }
    // haze and vignette
    s += R(0, 0, 400, 240, c.lg([[0, '#100406', 0.3], [0.4, '#100406', 0], [0.8, '#200a06', 0.05], [1, '#0c0404', 0.3]]));
    s += R(0, 0, 400, 240, c.rg([[0.6, '#000', 0], [1, '#000', 0.4]], 0.5, 0.5, 0.75));
    return s;
  }
  var SCENES_FN = { smokebelly_pit: pitScene };

  // =====================================================================
  // INSTALL: extend ART.legend / ART.mob / ART.scene / ART.icon / ART.story.actor
  // =====================================================================
  function has(t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); }
  function blank(w, h, col) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (col ? '<rect width="' + w + '" height="' + h + '" fill="' + col + '"/>' : '') + '</svg>'; }
  function phFig(c) { return shadow(c, 64, 26) + P('M44,122 C42,96 46,70 64,62 C82,70 86,96 84,122 Z', '#8a8a92', 2.5, 0.8) + C(64, 50, 14, '#9a9aa2', 2.5, 0.8); }
  function phScene(c) { return R(0, 0, 400, 240, c.lg([[0, '#6a5a70'], [1, '#d89a78']])) + R(0, 132, 400, 108, '#4a3e32'); }
  function phIcon(c) { return R(0, 0, 64, 64, '#2a2a30') + C(32, 32, 12, '#8a8a92', 2); }
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

  var LEGENDS = { bromli: bromliSprite };
  var MOBS = MOBS_FN;
  var SCENES = SCENES_FN;
  var ACTORS = { bromli: bromliActor };
  var KEYS = ART.keys;
  try { if (!KEYS || typeof KEYS !== 'object') { KEYS = {}; ART.keys = KEYS; } } catch (e) { KEYS = {}; }
  function keyList(name, keys) {
    try { KEYS[name] = addKeys(KEYS[name], keys); if (KEYS[name].indexOf(keys[0]) < 0) throw new Error('read-only'); } catch (e) { try { KEYS[name] = addKeys(Array.isArray(KEYS[name]) ? KEYS[name].slice() : [], keys); } catch (e2) { } }
  }

  // ---- legend sprites: ours, then the previous ART.legend (art_legends.js), then the paladin hero ----
  try {
    var baseLegend = typeof ART.legend === 'function' ? ART.legend : null;
    var prevKeys = baseLegend && Array.isArray(baseLegend.keys) ? baseLegend.keys.slice() : [];
    var legend = function (key) {
      if (has(LEGENDS, key)) return make(LEGENDS[key], 128, 128, phFig);
      try { if (baseLegend) { var s0 = baseLegend.apply(this, arguments); if (typeof s0 === 'string' && s0) return s0; } } catch (e) { }
      try { var A = W.ART || ART; if (A && typeof A.hero === 'function') { var s = A.hero({ cls: 'paladin', race: 'human' }); if (typeof s === 'string' && s) return s; } } catch (e) { }
      return make(phFig, 128, 128, phFig);
    };
    legend.keys = addKeys(prevKeys, Object.keys(LEGENDS));
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
    ART.scene = function (k) { return has(SCENES, k) ? make(SCENES[k], 400, 240, phScene, '#3a2420') : callBase(baseScene, this, arguments, null, 400, 240, phScene, '#3a2420'); };
    keyList('scenes', Object.keys(SCENES));
  } catch (e) { }
  try {
    var baseIcon = ART.icon;
    ART.icon = function (k) { return has(ICONS, k) ? make(ICONS[k], 64, 64, phIcon, '#444') : callBase(baseIcon, this, arguments, null, 64, 64, phIcon, '#444'); };
    keyList('icons', Object.keys(ICONS));
  } catch (e) { }

  // ---- story actor (extended in place when it can be, as art_legends.js does) ----
  try {
    var prev = (ART.story && (typeof ART.story === 'object' || typeof ART.story === 'function')) ? ART.story : {};
    var bActor = typeof prev.actor === 'function' ? prev.actor : null;
    var actorFn = function (key) { return has(ACTORS, key) ? make(ACTORS[key], 160, 160, phActor) : callBase(bActor, this, arguments, null, 160, 160, phActor); };
    try {
      var K0 = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
      K0.actors = addKeys(K0.actors, Object.keys(ACTORS));
      prev.keys = K0; prev.actor = actorFn;
      if (prev.actor !== actorFn || prev.keys !== K0 || K0.actors.indexOf('bromli') < 0) throw new Error('read-only');
      ART.story = prev;
    } catch (e) {
      var pk = (prev.keys && typeof prev.keys === 'object') ? prev.keys : {};
      var sc0 = typeof prev.scene === 'function' ? prev.scene : function () { return blank(480, 270, '#444'); };
      ART.story = { scene: sc0, actor: actorFn, keys: { scenes: Array.isArray(pk.scenes) ? pk.scenes.slice() : [], actors: addKeys(Array.isArray(pk.actors) ? pk.actors.slice() : [], Object.keys(ACTORS)) } };
    }
  } catch (e) { }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
