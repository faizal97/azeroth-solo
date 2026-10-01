/* art_worldbosses.js — the level-60 WORLD BOSSES of Realm of Loner: huge open-world enemies a 10-player group fights,
 * drawn to read bigger and more important than any elite (they fill the whole frame, a small head on a giant mass,
 * fine detail on a large body), and to stand on their zone's existing scene.
 *   mobs    ashwing           Ashwing, Broodwarden of the Fen (Scorched Fen, scene scorched_fen): the old great drake of
 *                             the black brood, on all fours, wings half spread; a heavy horned head with a chipped horn,
 *                             black scales, ash-grey wings with smouldering trailing edges, glowing cracks along the
 *                             throat and the belly plates, gold coins stuck in the scales, smoke from the nostrils.
 *           hollow_colossus   The Hollow Colossus (Ruins of Elmsworth, West Rotmoor, scene andorhal): a towering construct
 *                             of the risen plague dead stitched by the Hollow Host: patchwork grey-green dead flesh, iron
 *                             bands, rivets and chains, bone spines on the back, a caged head, a lantern of sickly green
 *                             light behind the ribs of its open chest, a ship's anchor for a weapon, the Host's hollow
 *                             ring on a tattered loincloth. Grotesque, not gory: stitches and iron, no blood.
 *           rimefather        Old Rimefather (Hoarwind Gorge, Icewold, scene frostwhisper_gorge): an ancient frost giant:
 *                             blue-white skin, white hair and brows, a beard of icicles, a fur cloak with snow on the
 *                             shoulders, a great jagged club of ice resting on his far shoulder, frost on his breath.
 * ART.mob: 128x128, facing LEFT, feet on y=122. Loads AFTER art.js (and the other zone packs) and EXTENDS window.ART:
 * ART.mob handles the keys above and falls through to the previous function for every other key (prototype keys
 * included). Keys are appended to ART.keys.mobs. Self-contained: helpers are copies of art_bromli.js's. Never throws.
 * Our own designs, not any other game's dragons, giants or abominations.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients, no text, no images, no filters,
 * ids unique per call (prefix wb<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = (W.ART && (typeof W.ART === 'object' || typeof W.ART === 'function')) ? W.ART : {};
  try { if (W.ART !== ART) W.ART = ART; } catch (e) { }
  var OL = '#1a1009';
  var SEQ = 0;
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
  function perp(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1; return [-dy / l, dx / l]; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids, defs) ----------
  function Ctx() { this.p = 'wb' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function stk(w) { return w ? ' stroke="' + OL + '" stroke-width="' + n(w) + '" stroke-linejoin="round" stroke-linecap="round"' : ''; }
  function opa(o) { return o != null && o < 1 ? ' opacity="' + o + '"' : ''; }
  function P(d, fill, w, o) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + stk(w) + opa(o) + '/>'; }
  function F(d, fill, o) { return P(d, fill, 0, o); }
  function L(d, col, w, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + opa(o) + '/>'; }
  function E(cx, cy, rx, ry, fill, w, o, rot) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + stk(w) + opa(o) +
      (rot ? ' transform="rotate(' + n(rot) + ' ' + n(cx) + ' ' + n(cy) + ')"' : '') + '/>';
  }
  function C(cx, cy, r, fill, w, o) { return E(cx, cy, r, r, fill, w, o); }
  function G(s, tf, o) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + opa(o) + '>' + s + '</g>'; }
  function CG(s, clip) { return '<g clip-path="' + clip + '">' + s + '</g>'; }
  // a filled shape: cel fill, details clipped inside it, the dark outline on top
  function body(c, d, col, inner, w) { return F(d, typeof col === 'string' && col.charAt(0) === '#' ? c.cel(col) : col) + (inner ? CG(inner, c.clip(d)) : '') + L(d, OL, w == null ? 2.2 : w); }
  // outlined limb: dark stroke under a coloured stroke, optional shade stripe
  function tube(pts, w, col, sh) {
    var d = pd(pts);
    return L(d, OL, w + 4.4) + L(d, col, w) + (sh ? '<path transform="translate(' + n(w * 0.22) + ',' + n(w * 0.1) + ')" d="' + d + '" fill="none" stroke="' + sh + '" stroke-width="' + n(w * 0.34) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>' : '');
  }
  function shadow(c, cx, rx, y) { return E(cx, y || 122.5, rx, Math.max(3, rx * 0.13), c.rg([[0, '#000', 0.5], [0.65, '#000', 0.28], [1, '#000', 0]])); }
  // Catmull-Rom through the points, k samples per segment
  function spline(p, k) {
    if (p.length < 3) return p.slice();
    var out = [], i, t;
    for (i = 0; i < p.length - 1; i++) {
      var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      for (t = 0; t < k; t++) {
        var u = t / k, u2 = u * u, u3 = u2 * u;
        out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
      }
    }
    out.push(p[p.length - 1]);
    return out;
  }
  // a tapering ribbon along the points (a tail, a horn, a neck): returns the outline path and both edges
  function taper(pts, w0, w1, k) {
    var s = spline(pts, k || 6), a = [], b = [];
    for (var i = 0; i < s.length; i++) {
      var p0 = s[Math.max(0, i - 1)], p1 = s[Math.min(s.length - 1, i + 1)], q = perp(p0, p1), w = (w0 + (w1 - w0) * i / (s.length - 1)) / 2;
      a.push([s[i][0] + q[0] * w, s[i][1] + q[1] * w]); b.push([s[i][0] - q[0] * w, s[i][1] - q[1] * w]);
    }
    return { d: pd(a.concat(b.reverse()), true), a: a, b: b.slice().reverse(), c: s };
  }
  function embers(seed, k, x0, x1, y0, y1, col) {
    var r = rng(seed), s = '';
    for (var i = 0; i < k; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = 0.5 + r() * 0.9; s += C(x, y, rr, r() < 0.5 ? (col || '#ffb040') : '#ff6a1a', 0, 0.55 + r() * 0.4); }
    return s;
  }
  function sparkle(x, y, r, col, o) { return F('M' + n(x) + ',' + n(y - r) + 'Q' + n(x + r * 0.15) + ',' + n(y - r * 0.15) + ' ' + n(x + r) + ',' + n(y) + 'Q' + n(x + r * 0.15) + ',' + n(y + r * 0.15) + ' ' + n(x) + ',' + n(y + r) + 'Q' + n(x - r * 0.15) + ',' + n(y + r * 0.15) + ' ' + n(x - r) + ',' + n(y) + 'Q' + n(x - r * 0.15) + ',' + n(y - r * 0.15) + ' ' + n(x) + ',' + n(y - r) + 'Z', col, o); }
  // a soft puff of smoke or frost: a lumpy blob
  function puff(x, y, w, h, col, o, seed) {
    var r = rng(seed), d = 'M' + n(x - w / 2) + ',' + n(y), k = 5;
    for (var i = 0; i < k; i++) { var x0 = x - w / 2 + w * i / k, x1 = x - w / 2 + w * (i + 1) / k; d += ' Q' + n((x0 + x1) / 2) + ',' + n(y - h * (0.7 + r() * 0.6)) + ' ' + n(x1) + ',' + n(y); }
    return F(d + ' Q' + n(x) + ',' + n(y + h * 0.7) + ' ' + n(x - w / 2) + ',' + n(y) + ' Z', col, o);
  }

  // =====================================================================
  // ASHWING, Broodwarden of the Fen: the old great drake, on all fours, facing left
  // =====================================================================
  var AW = {
    sc: '#2a2428', scL: '#4a4048', scD: '#141014',
    bel: '#5c3a2a', belL: '#8a5a3a',
    mem: '#55494f', memD: '#352c32', bone: '#3a3236',
    horn: '#c8b894', hornD: '#7a6a50',
    lava: '#ff6a1a', lavaH: '#ffa030', lavaW: '#ffe08a',
    gold: '#f0c040', goldD: '#a87818', goldL: '#fff0a8',
    eye: '#ffb030', ash: '#8a8288', scar: '#7a6a70'
  };
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.7)) + E(x, y, r * 1.3, r, '#fff4c0', 0.9) + E(x - r * 0.25, y, r * 0.35, r * 0.85, OL); }
  // a smouldering crack: a dark rift with a glowing core
  function crack(d, w) { w = w || 1; return L(d, '#3a0e06', 2.6 * w) + L(d, AW.lava, 1.5 * w) + L(d, AW.lavaW, 0.6 * w, 0.95); }
  function coin(c, x, y, r, tilt) {
    return E(x, y, r, r * 0.82, c.rg([[0, AW.goldL], [0.5, AW.gold], [1, AW.goldD]], 0.38, 0.32, 0.75), 1.1, null, tilt || 0) +
      E(x, y, r * 0.58, r * 0.46, 'none', 0, null, tilt || 0).replace('fill="none"', 'fill="none" stroke="' + AW.goldD + '" stroke-width="0.7"') + C(x - r * 0.35, y - r * 0.3, r * 0.22, '#fffbe0');
  }
  function talon(c, x, y, col, s) {
    s = s || 1;
    var foot = 'M' + n(x + 7 * s) + ',' + n(y - 8 * s) + ' L' + n(x + 8 * s) + ',' + n(y) + ' L' + n(x - 9 * s) + ',' + n(y) + ' C' + n(x - 12 * s) + ',' + n(y - 4 * s) + ' ' + n(x - 7 * s) + ',' + n(y - 8 * s) + ' ' + n(x - 3 * s) + ',' + n(y - 8 * s) + ' Z';
    var cl = 'M' + n(x - 9 * s) + ',' + n(y - 0.4) + ' l' + n(-5 * s) + ',0.6 M' + n(x - 3 * s) + ',' + n(y - 0.4) + ' l' + n(-4.4 * s) + ',0.8 M' + n(x + 3 * s) + ',' + n(y - 0.4) + ' l' + n(-4 * s) + ',0.8';
    return P(foot, c.cel(col), 2) + L('M' + n(x - 6 * s) + ',' + n(y - 4 * s) + ' l' + n(10 * s) + ',' + n(-1 * s), dk(col, 0.4), 1, 0.8) + L(cl, OL, 3.2) + L(cl, '#e8dcc0', 1.4);
  }
  function scaleRows(x0, y0, x1, y1, col, sw, sh) { var d = '', row = 0; sw = sw || 7; sh = sh || 5; for (var y = y0; y < y1; y += sh) { for (var x = x0 + (row % 2 ? sw / 2 : 0); x < x1; x += sw) d += 'M' + pt([x - sw / 2, y]) + 'Q' + pt([x, y + sh]) + ' ' + pt([x + sw / 2, y]); row++; } return L(d, col, 0.9, 0.85); }
  // a membrane wing: root, wrist, finger tips (outermost first); ember glow along the scalloped trailing edge
  function awWing(c, root, wrist, tips, mem, bone, seed) {
    var r = rng(seed);
    var edge = 'M' + pt(tips[0]);
    for (var i = 1; i < tips.length; i++) { var a = tips[i - 1], b = tips[i], mid = lerp(a, b, 0.5); edge += 'Q' + pt(lerp(mid, wrist, 0.26)) + ' ' + pt(b); }
    var last = tips[tips.length - 1], back = 'Q' + pt(lerp(lerp(last, root, 0.5), wrist, 0.2)) + ' ' + pt(root);
    var m = 'M' + pt(root) + 'L' + pt(wrist) + 'L' + pt(tips[0]) + edge.slice(edge.indexOf('Q')) + back + 'Z';
    var panels = '';
    for (var j = 0; j < tips.length - 1; j++) if (j % 2 === 0) panels += F(pd([wrist, tips[j], lerp(tips[j], tips[j + 1], 0.5), tips[j + 1]], true), dk(mem, 0.22), 0.8);
    var holes = '';
    for (var h = 0; h < 3; h++) { var t0 = lerp(wrist, tips[1 + (h % (tips.length - 1))], 0.55 + r() * 0.25); holes += E(t0[0] + (r() - 0.5) * 6, t0[1] + (r() - 0.5) * 6, 1.2 + r() * 1.2, 0.8 + r() * 0.8, OL, 0, 0.85, r() * 180); }
    var fb = ''; tips.forEach(function (t) { fb += 'M' + pt(wrist) + 'L' + pt(t); });
    var o = F(m, c.lg([[0, lt(mem, 0.12)], [0.5, mem], [1, dk(mem, 0.3)]], 0, 0, 1, 1));
    o += CG(panels + L(fb, dk(mem, 0.45), 4, 0.5) + holes + L(edge, AW.lava, 3.4, 0.55) + L(edge, AW.lavaH, 1.2, 0.8), c.clip(m));
    o += L(m, OL, 2) + L(edge, AW.lava, 0.9, 0.9);
    o += L(fb, OL, 3.6) + L(fb, bone, 1.8);
    o += L('M' + pt(root) + 'L' + pt(wrist), OL, 6) + L('M' + pt(root) + 'L' + pt(wrist), bone, 3) + L('M' + pt(lerp(root, wrist, 0.1)) + 'L' + pt(lerp(root, wrist, 0.85)), lt(bone, 0.25), 0.9, 0.8) + C(wrist[0], wrist[1], 3, c.cel(lt(bone, 0.1)), 1.4);
    var cw = [wrist[0] - 2, wrist[1] - 6];
    o += P(pd([[wrist[0] - 2.6, wrist[1] - 1], cw, [wrist[0] + 2, wrist[1] - 1.6]], true), AW.horn, 1);
    tips.forEach(function (t) { o += P(pd([[t[0] - 1.6, t[1] + 0.6], [t[0] + 2, t[1] - 2], [t[0] + 1, t[1] + 1.6]], true), AW.horn, 0.8); });
    return o;
  }
  function hornT(c, pts, w0, col, chip) {
    var H = taper(pts, w0, chip ? w0 * 0.42 : 1, 6), rings = '';
    for (var i = 2; i < H.a.length - 3; i += 3) rings += 'M' + pt(H.a[i]) + 'L' + pt(H.b[i]);
    return body(c, H.d, col, L(rings, dk(col, 0.4), 0.9, 0.85) + L(pd(H.a.slice(1, -2)), lt(col, 0.35), 1.1, 0.8), 1.7) +
      (chip ? L('M' + pt(H.a[H.a.length - 1]) + 'L' + pt(lerp(H.a[H.a.length - 1], H.b[H.b.length - 1], 0.5)) + 'L' + pt(H.b[H.b.length - 1]), dk(col, 0.5), 1) : '');
  }
  // the head in its own frame (snout to the left at x=2, skull back at x=40, eye at 20,29), placed by ashwing()
  function awHead(c) {
    var o = '', sc = AW.sc;
    // the great horns: one swept back and up, the lower one broken off short long ago
    o += hornT(c, [[33, 30], [44, 21], [56, 17], [66, 19], [72, 12]], 9.6, AW.horn);
    o += hornT(c, [[34, 37], [45, 37], [53, 41], [57, 47]], 7, dk(AW.horn, 0.12), true);
    // the frill behind the jaw
    o += P('M33,38 L46,41 L37,45 Z M32,44 L43,50 L32,50 Z', c.cel(AW.mem), 1.1);
    var jaw = 'M32,40 L18,44 L6,46 C2,47 2,51 5,52 L20,52 C28,51 34,47 32,40 Z';
    o += P('M30,36 L6,40 L6,48 L28,46 Z', '#4a120c', 1.2) + F('M26,40 L8,42 L8,47 L24,45 Z', AW.lava, 0.9) + F('M20,41 L10,42.4 L10,45.4 L19,44 Z', AW.lavaW, 0.9) + E(14, 44, 10, 6, glow(c, AW.lava, 0.7));
    o += body(c, jaw, dk(sc, 0.08), F('M2,49 L34,47 L34,56 L2,56 Z', AW.bel, 0.9) + crack('M8,51 L16,50 L22,51', 0.6), 2);
    var th = '';
    for (var t = 0; t < 4; t++) th += pd([[8 + t * 4.6, 46.4], [9.6 + t * 4.6, 43], [11.2 + t * 4.6, 46.2]], true);
    o += P(th, '#f0e6cc', 0.7);
    var H = 'M38,30 C36,20 26,17 18,21 L6,28 C1,31 0,37 3,39 L8,41 L30,38 C36,37 39,34 38,30 Z';
    o += body(c, H, sc, F('M-2,36 L40,33 L40,44 L-2,44 Z', AW.scD, 0.6) + F('M4,29 C10,24 18,20 26,19 C20,22 12,26 6,32 Z', AW.ash, 0.75) + L('M8,30 L22,23', lt(AW.ash, 0.3), 1.2, 0.8) + scaleRows(22, 22, 40, 36, AW.scL, 5, 3.6) + L('M28,24 l5,6 M31,22 l4,5', AW.scar, 1, 0.8), 2.3);
    var tt = '';
    for (var u = 0; u < 4; u++) tt += pd([[6 + u * 5, 39.6], [7.4 + u * 5, 43.4], [9 + u * 5, 39.4]], true);
    o += P(tt, '#f0e6cc', 0.7);
    // the brow ridge and its spikes, the nose horn, the eye
    o += P('M12,27 C17,20 28,18 33,23 L31,28 C25,25 18,26 13,30 Z', c.cel(dk(sc, 0.05)), 1.6);
    o += P('M19,21 L20,12 L25,20 Z M26,20 L31,12 L32,22 Z', c.cel(AW.horn), 1.1) + P('M6,29 L5,21 L10,27 Z', c.cel(AW.horn), 1);
    o += C(20, 29, 7, glow(c, AW.eye, 0.55)) + glowEye(c, 20, 29, 2.1, AW.eye) + L('M14,27.4 L25,25.2', OL, 2.2);
    o += C(4, 33, 0.9, OL) + crack('M30,30 l-3,4', 0.5);
    // chin spikes
    o += P('M10,52 L8,58 L13,53 Z M16,52 L15,59 L19,52.6 Z M23,51 L23,57 L26,50.4 Z', c.cel(AW.hornD), 0.9);
    return o;
  }
  function ashwing(c) {
    var o = '', sc = AW.sc;
    o += shadow(c, 68, 62);
    // the far wing: half spread, rising behind the back to the upper right
    o += awWing(c, [84, 56], [102, 5], [[123, 0], [127, 22], [126, 44], [114, 60]], dk(AW.mem, 0.24), dk(AW.bone, 0.15), 11);
    // the tail lying along the ground, a row of spikes, a spade of a tip
    var T = taper([[104, 82], [118, 92], [125, 106], [118, 117], [100, 120], [86, 119]], 20, 3, 6), spk = '';
    for (var i = 4; i < T.a.length - 6; i += 4) { var p0 = T.a[i], p1 = T.a[i + 2], q = perp(p0, p1); spk += pd([p0, [lerp(p0, p1, 0.5)[0] - q[0] * 6, lerp(p0, p1, 0.5)[1] - q[1] * 6], p1], true); }
    o += P(spk, c.cel(AW.hornD), 1.2);
    o += body(c, T.d, sc, scaleRows(90, 84, 128, 122, AW.scL, 6, 4) + F(pd(T.b.concat(T.c.slice().reverse()), true), AW.bel, 0.9) + L(pd(T.b.slice(2, -2)), AW.lava, 1, 0.5), 2.2);
    o += P('M88,116 L80,112 L84,120 Z', c.cel(AW.hornD), 1.2);
    // the far legs, darker
    o += tube([[64, 86], [62, 104], [64, 116]], 12, dk(sc, 0.28)) + talon(c, 63, 121, dk(sc, 0.28), 0.9);
    o += tube([[104, 90], [113, 104], [109, 116]], 13, dk(sc, 0.28)) + talon(c, 107, 121, dk(sc, 0.28), 0.95);
    // the great barrel of a body, the chest held high
    var B = 'M40,62 C46,50 66,48 90,54 C110,58 120,70 117,86 C114,100 100,107 80,107 L58,107 C46,105 38,96 36,84 C35,76 36,68 40,62 Z';
    var belly = 'M30,84 C46,104 90,112 120,92 L122,114 L28,114 Z', plates = '';
    for (var k = 0; k < 4; k++) plates += 'M' + n(38 + k * 2) + ',' + n(91 + k * 3.6) + ' Q78,' + n(107 + k * 2) + ' ' + n(116 - k * 2) + ',' + n(92 + k * 3.6);
    o += body(c, B, sc, scaleRows(40, 52, 118, 92, AW.scL, 7, 5) +
      F('M92,50 C114,56 124,76 116,100 L126,100 L126,50 Z', AW.scD, 0.7) + F('M46,56 C58,50 74,50 92,54 C76,56 60,60 50,66 Z', AW.ash, 0.5) +
      F(belly, c.lg([[0, AW.belL], [0.45, AW.bel], [1, dk(AW.bel, 0.4)]])) + L(plates, dk(AW.bel, 0.5), 1.1, 0.9) +
      crack('M50,95 L56,99 L61,96 L68,103 M74,103 L80,99 L86,105 M92,101 L100,97 L104,101', 1) + crack('M61,96 L63,91 M80,99 L82,94', 0.7) +
      E(78, 103, 28, 7, glow(c, AW.lava, 0.5)) +
      L('M70,62 l7,6 M74,60 l6,5 M58,72 l7,2', AW.scar, 1.2, 0.8) + crack('M86,72 l4,5 l-2,5', 0.7), 2.6);
    // spines down the back
    var sp = '';
    [[62, 50, 6], [72, 49, 7], [82, 50, 7.4], [92, 52, 7], [102, 56, 6], [110, 62, 5], [116, 70, 4]].forEach(function (q) { sp += pd([[q[0] - 3.4, q[1] + 2.4], [q[0] + 1.4, q[1] - q[2]], [q[0] + 3.8, q[1] + 2.4]], true); });
    o += P(sp, c.cel(AW.hornD), 1.2);
    // the near wing, half spread: up from the shoulder, the fingers fanning back over the far one
    var pro = 'M64,58 L84,10 C76,22 66,30 58,38 C60,46 62,52 64,58 Z';
    o += body(c, pro, c.lg([[0, lt(AW.mem, 0.08)], [1, dk(AW.mem, 0.3)]], 0, 0, 1, 1), L('M84,10 C76,22 66,30 58,38', AW.lava, 2.6, 0.5), 1.8);
    o += awWing(c, [70, 58], [86, 8], [[103, 2], [117, 18], [121, 40], [111, 57], [95, 64]], AW.mem, AW.bone, 23);
    // the near hind leg: a great haunch, the shin, a clawed foot
    o += body(c, 'M78,82 C80,70 100,68 106,80 C110,90 106,99 100,103 L86,105 C80,99 77,92 78,82 Z', sc, scaleRows(78, 72, 108, 104, AW.scL, 6, 4.4) + F('M96,70 C108,74 112,92 104,106 L112,106 L112,70 Z', AW.scD, 0.6) + F('M82,74 C88,70 96,70 100,72 C92,74 86,78 82,84 Z', AW.ash, 0.5), 2.4);
    o += tube([[94, 99], [100, 108], [95, 116]], 13, sc, AW.scD) + talon(c, 93, 121, sc, 1.05);
    // gold coins stuck in the belly plates and the flank
    [[48, 92, 2.8, -10], [58, 99, 3, 8], [70, 103, 2.6, -4], [88, 105, 2.8, -14], [100, 98, 2.6, 12], [78, 98, 2.2, 0], [108, 92, 2.2, 6], [64, 88, 2, 14], [92, 64, 2.2, 20], [80, 58, 2, -8]].forEach(function (q) { o += coin(c, q[0], q[1], q[2], q[3]); });
    // the neck: thick, rearing up to a head held high, glowing cracks along the throat plates
    var N = 'M64,60 C58,46 52,34 46,24 L28,28 C30,42 30,62 34,84 C46,84 58,76 64,60 Z';
    var throat = 'M26,28 C29,44 28,62 33,86 L42,84 C37,64 37,46 34,26 Z';
    o += body(c, N, sc, scaleRows(28, 22, 66, 82, AW.scL, 6, 4.4) + F('M48,20 C58,34 66,48 66,62 L70,62 L70,20 Z', AW.scD, 0.6) + F('M44,24 C50,32 54,42 56,52 C52,44 48,36 40,28 Z', AW.ash, 0.45) +
      F(throat, AW.bel) + L('M27,36 l8,-2 M28,43 l8,-2 M28,50 l8,-2 M29,57 l8,-2 M30,64 l8,-2 M31,71 l8,-2 M32,78 l8,-2', dk(AW.bel, 0.5), 1.1, 0.9) +
      crack('M30,34 L32,41 L30,48 L33,55 L32,62 L35,70 L35,78', 1) + crack('M32,41 l4,-1 M33,55 l4,-1 M35,70 l4,-1', 0.6) + E(32, 56, 9, 24, glow(c, AW.lava, 0.45)), 2.4);
    o += coin(c, 38, 80, 2.4, -16) + coin(c, 44, 70, 1.8, 10);
    // the near foreleg: a heavy shoulder, the elbow, a clawed foot planted in front
    o += body(c, 'M36,70 C38,60 54,58 60,66 C64,76 60,88 54,92 L42,92 C36,86 34,78 36,70 Z', sc, scaleRows(34, 60, 62, 94, AW.scL, 6, 4.4) + F('M54,60 C62,66 64,82 56,94 L64,94 L64,60 Z', AW.scD, 0.6) + F('M40,64 C46,60 52,60 56,62 C50,64 44,68 40,74 Z', AW.ash, 0.5), 2.4);
    o += tube([[48, 86], [40, 102], [36, 116]], 13, sc, AW.scD) + talon(c, 34, 121, sc, 1.1);
    o += P('M45,98 L38,95 L42,102 Z', c.cel(AW.hornD), 1);
    // the head, held high and a little larger than the frame it is drawn in
    o += G(awHead(c), 'translate(23,24) scale(1.06) translate(-20,-33)');
    // smoke curling up from the nostrils, embers drifting
    var sm = 'M5,26 C1,22 6,18 3,13 C0,9 5,5 3,1';
    o += L(sm, '#5a5458', 3.4, 0.5) + L(sm, '#8a8488', 1.4, 0.6) + L('M8,25 C10,21 7,17 10,13', '#6a6468', 2, 0.45);
    o += embers(77, 16, 10, 124, 4, 100);
    return o;
  }

  // =====================================================================
  // THE HOLLOW COLOSSUS: a towering stitched construct of the plague dead, facing left
  // =====================================================================
  var HC = {
    fl: '#9aa88c', flD: '#6a7a60', flL: '#c4cfb2', fl2: '#a8a894', fl3: '#869a80',
    stitch: '#2e2a22', iron: '#4e4c54', ironD: '#2e2c34', ironL: '#8a8a96', rust: '#8a5a3a',
    bone: '#dcd4bc', boneD: '#a89c80',
    green: '#9aff5a', greenH: '#d0ff9a', greenD: '#3a8a2a',
    cloth: '#3e3446', clothD: '#241e2a'
  };
  // a stitched seam: the cut line and the cross stitches over it
  function seam(pts, k, len) {
    var d = pd(pts), st = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], q = perp(a, b);
      for (var j = 0; j < k; j++) { var m = lerp(a, b, (j + 0.5) / k); st += 'M' + pt([m[0] - q[0] * len, m[1] - q[1] * len]) + 'L' + pt([m[0] + q[0] * len, m[1] + q[1] * len]); }
    }
    return L(d, HC.stitch, 1.1, 0.9) + L(st, HC.stitch, 0.9, 0.95);
  }
  function rivets(list, r) { var s = ''; list.forEach(function (p) { s += C(p[0], p[1], r || 1.1, HC.ironL, 0.6); }); return s; }
  // an iron band across a limb between a and b at t
  function band(c, a, b, t, w, h) {
    var q = perp(a, b), m = lerp(a, b, t), dx = (b[0] - a[0]), dy = (b[1] - a[1]), l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l * h / 2, uy = dy / l * h / 2;
    var d = pd([[m[0] - q[0] * w - ux, m[1] - q[1] * w - uy], [m[0] + q[0] * w - ux, m[1] + q[1] * w - uy], [m[0] + q[0] * w + ux, m[1] + q[1] * w + uy], [m[0] - q[0] * w + ux, m[1] - q[1] * w + uy]], true);
    return P(d, c.cel(HC.iron), 1.5) + C(m[0] - q[0] * w * 0.5, m[1] - q[1] * w * 0.5, 0.9, HC.ironL, 0.5);
  }
  function chain(pts, s) {
    // links along a polyline: alternating flat ovals and edge-on bars
    var o = '', sp = spline(pts, 8), acc = 0, step = 3.6 * (s || 1), i = 0;
    for (var j = 1; j < sp.length; j++) {
      var a = sp[j - 1], b = sp[j], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy);
      acc += l;
      if (acc >= step) {
        acc = 0; var ang = Math.atan2(dy, dx) * 180 / PI;
        o += i % 2 ? E(b[0], b[1], 2.4 * (s || 1), 0.9 * (s || 1), HC.iron, 1, null, ang) : E(b[0], b[1], 2.4 * (s || 1), 1.6 * (s || 1), 'none', 0, null, ang).replace('fill="none"', 'fill="none" stroke="' + OL + '" stroke-width="2.6"') + E(b[0], b[1], 2.4 * (s || 1), 1.6 * (s || 1), 'none', 0, null, ang).replace('fill="none"', 'fill="none" stroke="' + HC.ironL + '" stroke-width="1"');
        i++;
      }
    }
    return o;
  }
  function boneSpike(c, a, b, w) {
    var T = taper([a, lerp(a, b, 0.5), b], w, 1.2, 4);
    return body(c, T.d, HC.bone, L(pd(T.b), HC.boneD, 1.6, 0.8), 1.6) + E(a[0], a[1], w * 0.55, w * 0.42, c.cel(HC.bone), 1.4);
  }
  // the ship's anchor, drawn upright from its ring (0,0) to its crown (0,62) and turned by the caller
  function anchor(c) {
    var o = '', ir = '#5e5650', irD = '#3a3430';
    o += C(0, -4, 4.6, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + OL + '" stroke-width="4.8"') + C(0, -4, 4.6, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + ir + '" stroke-width="2.2"');
    o += tube([[0, 0], [0, 60]], 7, ir, irD) + L('M-1,6 L-1,56', '#8a7a6a', 1.2, 0.7);
    o += P('M-15,6 L15,5 L15,10 L-15,11 Z', c.cel(ir), 1.6) + C(-15, 8.5, 2.4, c.cel(ir), 1.2) + C(15, 7.5, 2.4, c.cel(ir), 1.2);
    var arms = 'M-17,44 C-17,57 -9,64 0,64 C9,64 17,57 17,44';
    o += L(arms, OL, 10.4) + L(arms, ir, 6.4) + L('M-15,48 C-13,57 -7,61 0,61', '#8a7a6a', 1.2, 0.6);
    o += P('M-21,47 L-17,33 L-12,46 Z', c.cel(ir), 1.6) + P('M12,46 L17,33 L21,47 Z', c.cel(ir), 1.6) + C(0, 63, 4.2, c.cel(ir), 1.6);
    // rust and old barnacles
    o += E(-9, 57, 2.2, 1.2, HC.rust, 0, 0.85) + E(10, 54, 1.8, 1, HC.rust, 0, 0.85) + E(0, 26, 1.2, 3.4, HC.rust, 0, 0.75) + C(7, 60, 1.1, '#c8c0b0', 0.5) + C(4, 62.4, 0.9, '#c8c0b0', 0.5) + C(-13, 50, 0.9, '#c8c0b0', 0.5);
    return o;
  }
  function colossus(c) {
    var o = '', fl = HC.fl;
    o += shadow(c, 64, 60);
    // bone spines jutting from the back over the far shoulder
    o += boneSpike(c, [86, 30], [96, 4], 6.4) + boneSpike(c, [96, 36], [116, 16], 6) + boneSpike(c, [76, 26], [78, 6], 5.2) + boneSpike(c, [102, 46], [122, 38], 5);
    // the far arm, hanging, a manacle and a dragging chain
    var fS = [96, 44], fE = [110, 68], fH = [108, 88];
    o += tube([fS, fE, fH], 18, dk(fl, 0.22), dk(HC.flD, 0.2)) + band(c, fE, fH, 0.62, 10.6, 5);
    o += chain([[108, 84], [114, 98], [116, 110], [110, 120]], 1) + C(108, 95, 9, c.cel(dk(fl, 0.2)), 2.2) + L('M102,92 L114,94 M102,97 L113,99', dk(HC.flD, 0.3), 1.1);
    // the legs: thick pillars, iron bands, wrapped feet
    [[[82, 88], [88, 104], [92, 114]], [[52, 88], [46, 104], [42, 114]]].forEach(function (lg, i) {
      var col = i ? fl : dk(fl, 0.2), f = lg[2];
      o += tube(lg, 20, col, i ? HC.flD : null) + band(c, lg[1], lg[2], 0.4, 11.2, 5) + (i ? seam([[lg[0][0] - 4, lg[0][1] + 2], [lg[1][0] - 5, lg[1][1]]], 3, 2.2) : '');
      o += P('M' + n(f[0] - 13) + ',122 C' + n(f[0] - 14) + ',' + n(f[1] + 1) + ' ' + n(f[0] - 8) + ',' + n(f[1] - 3) + ' ' + n(f[0] - 2) + ',' + n(f[1] - 3) + ' L' + n(f[0] + 10) + ',' + n(f[1] - 2) + ' L' + n(f[0] + 11) + ',122 Z', c.cel(i ? '#6a6250' : '#56503f'), 2.1) +
        L('M' + n(f[0] - 11) + ',118 L' + n(f[0] + 10) + ',117 M' + n(f[0] - 6) + ',' + n(f[1] - 2) + ' L' + n(f[0] - 4) + ',121', '#2e2a22', 1.1, 0.8);
    });
    // the loincloth: the Hollow Host's tattered cloth, the hollow ring on it
    var lc = 'M40,86 L90,86 L92,104 L86,100 L82,110 L76,102 L70,112 L64,102 L58,110 L52,102 L46,108 L42,100 Z';
    o += body(c, lc, HC.cloth, F('M70,86 L92,86 L92,112 L72,112 Z', HC.clothD, 0.5) + L('M48,92 L84,92', HC.clothD, 1.2), 1.9);
    o += C(64, 96, 4.2, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + HC.greenD + '" stroke-width="2.4"') + C(64, 96, 4.2, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + HC.green + '" stroke-width="1" opacity="0.85"');
    // the torso: huge, hunched, patchwork dead flesh, iron bands, the open chest with the lantern inside
    var T = 'M28,46 C28,30 46,22 64,22 C86,22 104,30 106,48 C106,62 98,76 90,90 L42,90 C34,76 28,62 28,46 Z';
    var patches = F('M28,30 L52,30 L50,48 L36,60 L26,58 Z', HC.fl2, 0.9) + F('M80,60 L106,56 L104,80 L86,90 L78,78 Z', HC.fl3, 0.9) + F('M50,70 L66,72 L64,90 L46,90 Z', lt(HC.fl2, 0.08), 0.85);
    var seams = seam([[28, 30], [52, 30], [50, 48], [36, 60], [26, 58]], 3, 1.8) + seam([[80, 60], [106, 56]], 5, 1.8) + seam([[80, 60], [78, 78], [86, 90]], 4, 1.8) + seam([[50, 70], [66, 72], [64, 90]], 4, 1.8);
    o += body(c, T, fl, patches + seams + F('M84,22 C102,30 108,50 100,70 L92,90 L110,90 L110,22 Z', HC.flD, 0.7) + F('M36,30 C46,24 58,22 68,24 C56,28 46,32 40,40 Z', HC.flL, 0.6) +
      L('M44,80 Q64,74 88,80', HC.flD, 1.2, 0.7), 2.6);
    // the open chest: a dark hollow, the lantern of green light hung inside it, two ribs left either side
    var cav = 'M48,36 C48,28 82,28 84,36 L84,60 C82,70 50,70 48,60 Z';
    o += body(c, cav, '#10160c', C(66, 50, 22, glow(c, HC.green, 0.75)), 2.4);
    var ribs = 'M48,42 Q54,38 59,40 M48,50 Q54,46 58,48 M48,58 Q54,54 58,56 M84,42 Q78,38 73,40 M84,50 Q78,46 74,48 M84,58 Q78,54 74,56';
    o += L(ribs, OL, 4.6) + L(ribs, HC.bone, 2.6);
    // the lantern: a hook and chain from the top of the hollow, a cap, an iron frame round panes of green light
    o += L('M66,29 L66,36', OL, 3) + L('M66,29 L66,36', HC.ironL, 1.2) + C(66, 37, 1.8, 'none', 0).replace('fill="none"', 'fill="none" stroke="' + HC.ironL + '" stroke-width="1"');
    var lb = 'M58,44 L74,44 L76,48 L76,58 L73,62 L59,62 L56,58 L56,48 Z';
    o += P('M57,44 L66,38.4 L75,44 Z', c.cel(HC.iron), 1.6);
    o += F(lb, c.rg([[0, '#f4ffd8'], [0.35, HC.greenH], [0.75, HC.green], [1, HC.greenD]], 0.5, 0.55, 0.6));
    o += P('M66,60 C61,58 61,52 64,48 C64,51 65,52 66,52 C66,49 67,47 69,45 C69,49 72,52 71,56 C70,59 68,60 66,60 Z', c.lg([[0, '#ffffff'], [0.5, HC.greenH], [1, HC.green]], 0, 0, 0, 1), 0.7);
    o += L(lb + ' M61,44 L61,62 M71,44 L71,62 M56,53 L76,53', OL, 2.6) + L(lb + ' M61,44 L61,62 M71,44 L71,62 M56,53 L76,53', '#6a6a72', 1.1);
    o += P('M58,62 L74,62 L72,66 L60,66 Z', c.cel(HC.iron), 1.4);
    // the light spilling onto the dead flesh round the hollow
    o += C(66, 52, 34, glow(c, HC.green, 0.28));
    // iron bands bolted round the belly and a strap across the chest
    var b1 = 'M34,70 Q64,62 98,70 L96,77 Q64,69 36,77 Z', b2 = 'M38,82 Q64,76 92,82 L90,89 Q64,83 40,89 Z';
    o += P(b1, c.cel(HC.iron), 1.8) + P(b2, c.cel(HC.iron), 1.8) + rivets([[40, 73], [52, 69.6], [76, 69.4], [90, 72], [44, 85], [56, 81.6], [74, 81.4], [86, 84]]);
    var strap = 'M30,40 L36,36 L94,82 L88,86 Z';
    o += P(strap, c.cel(dk(HC.iron, 0.05)), 1.6) + rivets([[40, 44], [50, 52], [82, 76]]);
    // drips of green light seeping from the seams
    o += E(46, 62, 1.2, 2.6, HC.green, 0, 0.8) + E(84, 88, 1, 2.2, HC.green, 0, 0.7) + E(92, 62, 0.9, 2, HC.green, 0, 0.7);
    // the head: small and low between the shoulders, an iron muzzle over the jaw, a spiked band round the brow, green eyes
    var Hd = 'M40,16 C40,6 56,4 60,10 L61,24 C58,32 44,32 40,26 Z';
    o += body(c, Hd, HC.fl2, F('M52,4 L64,4 L64,32 L54,32 C58,24 58,12 52,4 Z', HC.flD, 0.6) + seam([[43, 8], [50, 5.4], [58, 8]], 3, 1.4) + seam([[56, 14], [59, 22]], 2, 1.2), 2.2);
    o += P('M39,11 Q50,7 61,11 L61,13.6 Q50,10 39,13.6 Z', c.cel(HC.iron), 1.3) + P('M46,8.6 L47,4.4 L49,8.2 Z M55,8.6 L57,4.6 L58,9.2 Z', c.cel(HC.ironL), 0.9) + rivets([[42, 12], [52, 10.2]], 0.8);
    o += C(45, 18, 4, glow(c, HC.green, 0.95)) + C(53, 18.4, 3.6, glow(c, HC.green, 0.9)) + E(45, 18, 1.8, 1.3, HC.greenH, 0.8) + E(53, 18.4, 1.5, 1.2, HC.greenH, 0.8);
    var mz = 'M38,22 Q50,19 62,22 L61,29 Q50,34 40,30 Z';
    o += P(mz, c.cel(HC.iron), 1.6) + CG(L('M42,21 L42,32 M46,20 L46,33 M50,20 L50,33 M54,20 L54,33 M58,21 L58,31', HC.ironD, 1.3), c.clip(mz)) + rivets([[39.6, 24], [60.4, 24]], 1);
    // the near arm, the shoulder plate over it with bone spikes, chains draped from it
    var nS = [30, 44], nE = [18, 64], nH = [22, 80];
    o += tube([nS, nE, nH], 19, fl, HC.flD) + band(c, nE, nH, 0.5, 11, 5) + seam([[24, 52], [17, 62]], 3, 2.2);
    o += boneSpike(c, [28, 30], [16, 12], 5.6) + boneSpike(c, [38, 26], [36, 6], 5);
    var pl = 'M14,42 C14,28 30,24 42,30 C46,34 46,42 42,48 C34,52 20,52 14,42 Z';
    o += body(c, pl, HC.iron, F('M14,42 C22,46 36,46 44,40 L44,54 L14,54 Z', HC.ironD, 0.6) + L('M20,34 Q28,28 38,32', HC.ironL, 1.3, 0.8), 2.2) + rivets([[20, 42], [28, 45], [38, 42]], 1.2);
    o += chain([[40, 46], [52, 64], [66, 70], [82, 66], [96, 52]], 1);
    // the anchor, held by its shank, its crown and flukes swinging just above the ground
    o += G(anchor(c), 'translate(30,55) rotate(16)');
    o += chain([[30, 51], [24, 62], [20, 74]], 0.8);
    o += P('M13,74 C10,80 13,88 21,90 C29,90 33,84 31,76 C29,70 17,68 13,74 Z', c.cel(fl), 2.1) + L('M14,80 L30,78.6 M15,85 L30,84', dk(HC.flD, 0.2), 1.2);
    return o;
  }

  // =====================================================================
  // OLD RIMEFATHER: an ancient frost giant, facing left
  // =====================================================================
  var RF = {
    sk: '#a8c6e2', skD: '#6a8cbc', skL: '#e0f0fc',
    ice: '#cfeefc', iceD: '#7ab4e0', iceL: '#ffffff', iceC: '#9ad8f4',
    fur: '#8e8274', furD: '#5a5048', furL: '#c0b4a2', snow: '#f4f8fc', snowD: '#c8d8ea',
    hair: '#eef4fa', hairD: '#a8b8cc', hide: '#6a4e36', hideD: '#43301f',
    eye: '#bff4ff'
  };
  function icicle(c, x, y, w, len, lean) {
    lean = lean || 0;
    var d = 'M' + n(x - w / 2) + ',' + n(y) + ' L' + n(x + w / 2) + ',' + n(y) + ' L' + n(x + lean) + ',' + n(y + len) + ' Z';
    return P(d, c.lg([[0, RF.iceL], [0.45, RF.ice], [1, RF.iceD]], 0, 0, 1, 0), 1.3) + L('M' + n(x - w * 0.2) + ',' + n(y + 1) + ' L' + n(x + lean * 0.6 - w * 0.05) + ',' + n(y + len * 0.7), '#ffffff', 0.8, 0.85);
  }
  function crystal(c, x, y, w, h, ang) {
    // one shard of ice: a long hexagon, lit on one face
    var d = 'M0,0 L' + n(w / 2) + ',' + n(-h * 0.18) + ' L' + n(w / 2) + ',' + n(-h * 0.8) + ' L0,' + n(-h) + ' L' + n(-w / 2) + ',' + n(-h * 0.8) + ' L' + n(-w / 2) + ',' + n(-h * 0.18) + ' Z';
    return G(P(d, c.lg([[0, RF.iceL], [0.4, RF.ice], [0.62, RF.iceC], [1, RF.iceD]], 0, 0, 1, 0), 1.5) + L('M0,-1 L0,' + n(-h + 1), '#ffffff', 0.9, 0.9) + F('M' + n(-w / 2) + ',' + n(-h * 0.2) + ' L0,0 L0,' + n(-h) + ' L' + n(-w / 2) + ',' + n(-h * 0.8) + ' Z', '#ffffff', 0.3), 'translate(' + n(x) + ',' + n(y) + ') rotate(' + n(ang) + ')');
  }
  function iceClub(c) {
    // drawn along the club's axis from the pommel (0,0) out to +x: a long grip bound in hide, the jagged head from x=56 to x=96
    var o = '';
    o += P('M-2,-3.4 L62,-4.6 L62,4.6 L-2,3.4 Z', c.lg([[0, RF.iceL], [0.4, RF.iceC], [1, RF.iceD]]), 1.8);
    o += L('M4,-3 L8,3 M10,-3 L14,3 M16,-3 L20,3 M22,-3 L26,3', OL, 2.6) + L('M4,-3 L8,3 M10,-3 L14,3 M16,-3 L20,3 M22,-3 L26,3', RF.hide, 1.4);
    o += C(-2, 0, 4.2, c.cel(RF.iceC), 1.6);
    var head = 'M56,-7 L64,-12 L68,-21 L75,-13 L82,-18 L85,-9 L96,-5 L90,1 L97,8 L85,10 L81,19 L73,12 L66,18 L62,9 L56,7 Z';
    o += body(c, head, c.lg([[0, RF.iceL], [0.35, RF.ice], [0.7, RF.iceC], [1, RF.iceD]], 0, 0, 0.3, 1),
      F('M56,2 L97,2 L97,22 L56,22 Z', RF.iceD, 0.45) + L('M60,-5 L72,0 L86,-4 M72,0 L73,12 M72,0 L69,-19 M72,0 L92,4', '#ffffff', 1.1, 0.8) + F('M64,-11 L68,-20 L71,-3 Z', '#ffffff', 0.5), 2.2);
    o += sparkle(67, -9, 3, '#ffffff', 0.95) + sparkle(88, 4, 2.2, '#ffffff', 0.9);
    return o;
  }
  function rimefather(c) {
    var o = '', sk = RF.sk;
    o += shadow(c, 66, 60);
    // the cloak hanging down his back, fur hem, snow along its top
    var ck = 'M70,22 C96,22 116,36 118,56 L122,106 L112,112 L106,104 L98,112 L92,104 L86,110 L84,60 Z';
    o += body(c, ck, RF.furD, F('M100,30 C114,40 120,60 122,104 L126,104 L126,30 Z', dk(RF.furD, 0.35), 0.7) + L('M98,48 L104,100 M108,52 L114,104', dk(RF.furD, 0.3), 1.4, 0.8), 2.2);
    // the far arm reaching up to hold the club on the shoulder
    var fS = [96, 52], fE = [112, 72], fH = [104, 92];
    o += tube([fS, fE, fH], 17, dk(sk, 0.2), dk(RF.skD, 0.2));
    o += P('M96,86 C94,94 98,100 106,100 C113,100 116,94 113,87 C110,82 99,80 96,86 Z', c.cel(dk(sk, 0.18)), 2.1) + L('M98,90 L112,89 M98,94.6 L112,94', dk(RF.skD, 0.25), 1.1) + icicle(c, 103, 100, 2.4, 6, 0) + icicle(c, 109, 99.4, 2, 5, 0.6);
    // the legs: fur-wrapped to the knee, big feet
    [[[82, 92], [88, 106], [92, 114]], [[54, 92], [50, 106], [44, 114]]].forEach(function (lg, i) {
      var col = i ? sk : dk(sk, 0.18), f = lg[2];
      o += tube([lg[0], lg[1]], 20, col, i ? RF.skD : null);
      var wr = 'M' + n(lg[1][0] - 12) + ',' + n(lg[1][1] - 4) + ' L' + n(lg[1][0] + 12) + ',' + n(lg[1][1] - 4) + ' L' + n(f[0] + 12) + ',' + n(f[1] + 2) + ' L' + n(f[0] - 12) + ',' + n(f[1] + 2) + ' Z';
      o += body(c, wr, i ? RF.fur : dk(RF.fur, 0.18), L('M' + n(lg[1][0] - 11) + ',' + n(lg[1][1] + 2) + ' L' + n(lg[1][0] + 11) + ',' + n(lg[1][1] + 1) + ' M' + n(f[0] - 11) + ',' + n(f[1] - 3) + ' L' + n(f[0] + 11) + ',' + n(f[1] - 4), RF.hideD, 1.6, 0.9), 2);
      o += P('M' + n(lg[1][0] - 13) + ',' + n(lg[1][1] - 3) + ' L' + n(lg[1][0] - 10) + ',' + n(lg[1][1] - 8) + ' L' + n(lg[1][0] - 5) + ',' + n(lg[1][1] - 4) + ' L' + n(lg[1][0]) + ',' + n(lg[1][1] - 9) + ' L' + n(lg[1][0] + 5) + ',' + n(lg[1][1] - 4) + ' L' + n(lg[1][0] + 10) + ',' + n(lg[1][1] - 8) + ' L' + n(lg[1][0] + 13) + ',' + n(lg[1][1] - 3) + ' Z', c.cel(i ? RF.furL : RF.fur), 1.4);
      o += P('M' + n(f[0] - 16) + ',122 C' + n(f[0] - 17) + ',' + n(f[1] + 2) + ' ' + n(f[0] - 10) + ',' + n(f[1] - 1) + ' ' + n(f[0] - 4) + ',' + n(f[1]) + ' L' + n(f[0] + 11) + ',' + n(f[1]) + ' L' + n(f[0] + 12) + ',122 Z', c.cel(i ? RF.fur : dk(RF.fur, 0.18)), 2.1) + L('M' + n(f[0] - 14) + ',119 L' + n(f[0] + 11) + ',119', RF.hideD, 1.2, 0.8);
    });
    // fur loincloth and the hide belt with a buckle of ice
    var lc = 'M44,90 L90,90 L92,108 L86,104 L80,110 L74,104 L68,112 L62,104 L56,110 L50,104 L44,108 Z';
    o += body(c, lc, RF.fur, F('M72,90 L94,90 L94,112 L74,112 Z', RF.furD, 0.5) + L('M50,96 l2,6 M60,96 l1,7 M70,96 l0,8 M80,96 l-1,7', RF.furD, 1.2, 0.8), 1.9);
    // the torso: old, broad, a little stooped; frost on the skin
    var T = 'M34,54 C38,40 90,38 100,50 C102,62 98,78 92,94 L46,94 C40,82 36,68 34,54 Z';
    o += body(c, T, sk, F('M84,40 C98,46 104,62 98,80 L92,96 L106,96 L106,40 Z', RF.skD, 0.65) + F('M40,46 C52,40 66,40 76,42 C62,44 50,48 44,56 Z', RF.skL, 0.6) +
      L('M52,66 Q62,70 72,66 M54,76 Q64,80 76,76 M64,56 Q74,60 84,56', RF.skD, 1.2, 0.75) + L('M80,70 l6,-2 M82,78 l5,-1', RF.skD, 1, 0.7) +
      F('M82,58 l4,-3 l3,3 l4,-2 l-1,5 l3,3 l-5,1 l-2,4 l-3,-4 l-4,0 Z', '#ffffff', 0.55), 2.6);
    o += P('M44,86 Q68,82 94,86 L94,93 Q68,89 44,93 Z', c.cel(RF.hide), 1.7);
    o += crystal(c, 68, 96, 7, 11, 0) + C(68, 89.6, 1.2, '#ffffff', 0);
    // the near arm: the hand gripping the club's handle in front of the chest
    var nS = [40, 54], nE = [28, 76], nH = [42, 80];
    o += tube([nS, nE, nH], 18, sk, RF.skD) + P('M' + n(nE[0] - 9) + ',' + n(nE[1] - 2) + ' L' + n(nE[0] + 8) + ',' + n(nE[1] - 6) + ' L' + n(nE[0] + 10) + ',' + n(nE[1] + 2) + ' L' + n(nE[0] - 7) + ',' + n(nE[1] + 6) + ' Z', c.cel(RF.hide), 1.5);
    // the fur mantle over both shoulders, snow piled on top
    var mt = 'M22,52 C22,36 40,28 58,28 C80,28 100,32 108,48 C110,56 108,62 104,64 L98,58 L92,64 L86,58 L80,62 L74,56 L66,60 L60,54 L52,60 L46,54 L38,62 L32,56 L26,62 Z';
    o += body(c, mt, RF.fur, F('M84,28 C100,34 110,48 106,64 L112,64 L112,28 Z', RF.furD, 0.6) + L('M30,44 l3,8 M40,38 l2,9 M70,36 l1,9 M84,38 l-1,9 M96,42 l-2,8', RF.furD, 1.3, 0.8) + L('M36,40 l2,6 M56,34 l1,8 M78,34 l0,7', RF.furL, 1.1, 0.8), 2.3);
    var snow = 'M24,44 C26,32 44,26 60,27 C80,27 98,30 106,42 C100,40 96,44 90,41 C84,44 78,40 72,42 C64,39 58,43 50,40 C42,43 36,40 30,44 Z';
    o += body(c, snow, RF.snow, F('M24,40 L108,40 L108,46 L24,46 Z', RF.snowD, 0.7), 1.6);
    o += icicle(c, 34, 59, 3, 7, 0) + icicle(c, 62, 57, 2.6, 6, 0) + icicle(c, 92, 61, 3, 7, 0.6);
    // the club of ice resting on the far shoulder, the near hand on its grip
    o += G(iceClub(c), 'translate(38,86) rotate(-50)');
    o += P('M36,72 C32,78 36,88 44,88 C52,88 54,80 51,74 C48,68 39,68 36,72 Z', c.cel(sk), 2.1) + L('M38,77 L51,75 M38,82 L51,80', RF.skD, 1.1);
    // the head: big brow, white hair blown back, an ear, a long nose
    var hx = 42, hy = 28;
    o += P('M52,10 C62,8 74,14 78,24 L86,26 L78,30 L84,36 L74,36 C70,32 62,30 56,32 Z', c.lg([[0, RF.hair], [0.6, lt(RF.hairD, 0.3)], [1, RF.hairD]], 0, 0, 1, 1), 1.8);
    var H = 'M30,24 C30,12 44,6 54,12 C60,16 62,24 60,32 C58,40 52,44 44,44 C36,44 30,38 30,24 Z';
    o += body(c, H, sk, F('M50,6 L66,6 L66,46 L50,46 C58,34 58,18 50,6 Z', RF.skD, 0.6) + L('M36,22 l4,-1 M36,26 l3,0', RF.skD, 0.9, 0.7), 2.2);
    o += P('M56,22 C62,18 66,24 62,30 C60,32 57,30 56,28 Z', c.cel(sk), 1.5);
    o += P('M28,14 C34,4 52,2 58,12 L52,12 L48,8 L46,13 L40,8 L38,14 L32,11 Z', c.cel(RF.hair), 1.6);
    // a crown of ice spikes grown into the hair
    o += crystal(c, 38, 9, 3.6, 8, -16) + crystal(c, 45, 6, 4, 11, -4) + crystal(c, 52, 7, 3.4, 8, 10);
    // heavy white brows over glowing pale eyes, a long hooked nose
    o += P('M26,22 C30,16 40,15 46,18 L44,22 C38,20 32,21 28,25 Z', c.cel(RF.hair), 1.3) + P('M27,21 C24,21 22,23 21,26 C24,25 26,25 28,24 Z', RF.hair, 1);
    o += C(36, 23.6, 4, glow(c, RF.eye, 0.9)) + E(36, 23.6, 2, 1.3, '#ffffff', 0.8) + C(43.6, 24, 3, glow(c, RF.eye, 0.8)) + E(43.4, 24, 1.3, 1, '#ffffff', 0.6);
    // the beard of icicles: a frosted jaw, long icicles hanging to the belly
    o += P('M29,37 C28,45 31,50 35,52 L53,52 C57,46 57,41 55,36 Z', c.lg([[0, RF.iceL], [0.5, RF.ice], [1, RF.iceC]], 0, 0, 1, 1), 1.6);
    [[31, 50, 5.4, 16, -1], [36, 51, 6, 30, -0.4], [42, 51.4, 6.4, 36, 0.6], [48, 51, 6, 26, 1.2], [53, 49, 5, 15, 1.6], [33.5, 51, 4, 22, -1.2], [45, 52, 4, 18, 0.4], [39, 52, 3.4, 26, 0.2], [51, 50.6, 3, 21, 1]].forEach(function (q) { o += icicle(c, q[0], q[1], q[2], q[3], q[4]); });
    // the mouth, the drooping white moustache, a long hooked nose
    o += P('M30,40 Q36,43 42,41 L40,44 Q35,45 31,43 Z', '#2a3a5a', 1);
    o += P('M25,40 C26,34 33,32 38,34 C43,32 51,33 54,38 C51,40 48,39 46,38 C42,40 39,40 37,39 C34,42 31,45 27,46 C27,44 26,42 25,40 Z', c.lg([[0, '#ffffff'], [0.6, RF.hair], [1, RF.hairD]], 0, 0, 0, 1), 1.5);
    o += L('M30,40 C33,37 36,37 38,36 M44,36 C47,35 50,36 52,37', RF.hairD, 0.9, 0.8);
    o += P('M34,24 C29,26 24,31 25,35 C26,37 30,37 33,35 C35,33 36,30 36,27 Z', c.cel(sk), 1.6) + C(27.6, 34, 0.9, RF.skD) + L('M33,27 C31,30 30,32 31,34', RF.skL, 0.9, 0.8);
    // frost on his breath, rolling out from under the moustache
    o += puff(16, 45, 18, 6, '#e8f6ff', 0.8, 31) + puff(6, 41, 11, 5, '#e8f6ff', 0.6, 32) + puff(21, 43, 9, 4, '#ffffff', 0.9, 33);
    o += L('M24,44 C18,42 12,44 6,42 M22,47 C16,48 10,47 4,48', '#9ad8f4', 1.1, 0.8);
    o += sparkle(9, 47, 2, '#ffffff', 0.95) + sparkle(15, 38, 1.6, '#ffffff', 0.85);
    // snowflakes drifting off him
    var r = rng(91);
    for (var i = 0; i < 12; i++) o += C(6 + r() * 118, 4 + r() * 100, 0.6 + r() * 0.7, '#ffffff', 0, 0.7);
    return o;
  }

  var MOBS = { ashwing: ashwing, hollow_colossus: colossus, rimefather: rimefather };

  // =====================================================================
  // INSTALL: extend ART.mob
  // =====================================================================
  function has(t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); }
  function blank(w, h, col) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (col ? '<rect width="' + w + '" height="' + h + '" fill="' + col + '"/>' : '') + '</svg>'; }
  function phFig(c) { return shadow(c, 64, 26) + P('M44,122 C42,96 46,70 64,62 C82,70 86,96 84,122 Z', '#8a8a92', 2.5, 0.8) + C(64, 50, 14, '#9a9aa2', 2.5, 0.8); }
  function make(fn, w, h, ph, bg) {
    try { var c = new Ctx(); return c.svg(w, h, fn(c)); } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return blank(w, h, bg); }
    }
  }
  var _cur = null;
  function callBase(base, self, args, w, h, ph, bg) {
    try { if (typeof base === 'function') { var s = base.apply(self, args); if (typeof s === 'string' && s) return s; } } catch (e) { }
    return make(ph, w, h, ph, bg);
  }
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  var KEYS = ART.keys;
  try { if (!KEYS || typeof KEYS !== 'object') { KEYS = {}; ART.keys = KEYS; } } catch (e) { KEYS = {}; }
  function keyList(name, keys) {
    try { KEYS[name] = addKeys(KEYS[name], keys); if (KEYS[name].indexOf(keys[0]) < 0) throw new Error('read-only'); } catch (e) { try { KEYS[name] = addKeys(Array.isArray(KEYS[name]) ? KEYS[name].slice() : [], keys); } catch (e2) { } }
  }
  try {
    var baseMob = ART.mob;
    ART.mob = function (k) { return has(MOBS, k) ? make(MOBS[k], 128, 128, phFig) : callBase(baseMob, this, arguments, 128, 128, phFig); };
    keyList('mobs', Object.keys(MOBS));
  } catch (e) { }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
