/* art_icons12.js - Fishing and Cooking icons for Realm of Loner (35 keys: the two profession badges, 12 raw fish, 3 raw
 * meats, a spice pouch and 17 cooked dishes).
 * Loads AFTER art.js, art_icons2.js .. art_icons11.js and art_mounts.js and EXTENDS window.ART: ART.icon handles the keys
 * below and falls through to the previous ART.icon for every other key (prototype keys included). Keys are appended to
 * ART.keys.icons. Self-contained: the helpers of the earlier packs are private, so the few needed here are re-implemented
 * (same maths, same look). Never throws. Style matches the art.js / art_icons3.js food and profession icons: 64x64, tinted
 * radial background, bold glyph, #1a1009 outline, vignette + bevel frame, no text, no filters. Dishes that give a buff
 * carry a soft warm glow; plain food has none. Gradient ids use the prefix iZ<counter>_ so they never collide.
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};

  /* ================= helpers (copied from art.js / art_icons3.js / art_icons11.js) ================= */
  var UID = 0;
  var OL = '#1a1009';
  var STEEL = ['#f4f7fa', '#c2cad3', '#7c8793'];
  var ITEM_BG = ['#3a3440', '#0e0c12'];
  var WARM = '#ffb048';
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
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function Ctx() { this.u = 'iZ' + (++UID).toString(36); this.k = 0; this.defs = []; this.cache = {}; }
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

  function stk(sw) { return sw === 0 ? '' : ' stroke="' + OL + '" stroke-width="' + r1(sw || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function opa(o) { return o != null && o !== 1 ? ' opacity="' + o + '"' : ''; }
  function P(d, fill, sw, o) { return '<path d="' + d + '" fill="' + fill + '"' + stk(sw) + opa(o) + '/>'; }
  function F(d, fill, o) { return P(d, fill, 0, o); }
  function S(d, col, w, o) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + r1(w) + '" stroke-linecap="round" stroke-linejoin="round"' + opa(o) + '/>'; }
  function S2(d, col, w, o) { return S(d, OL, w + 2.6, o) + S(d, col, w, o); }
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
  function tr(x, y, a, s) { return 'translate(' + r1(x) + ',' + r1(y) + ')' + (a ? ' rotate(' + r1(a) + ')' : '') + (s != null && s !== 1 ? ' scale(' + s + ')' : ''); }
  function pl(pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + r1(p[0]) + ',' + r1(p[1]); }).join(''); }
  function sparkle(x, y, r, col) { return F(D`M${x},${y - r} Q${x + r * 0.15},${y - r * 0.15} ${x + r},${y} Q${x + r * 0.15},${y + r * 0.15} ${x},${y + r} Q${x - r * 0.15},${y + r * 0.15} ${x - r},${y} Q${x - r * 0.15},${y - r * 0.15} ${x},${y - r} Z`, col); }
  function stem(d, col, w, o) { return S(d, OL, w + 2.4, o) + S(d, col, w, o); }
  function blade(c, x, y, a, s, col, w) {
    w = w || 4;
    return G(P('M0,0 C' + w + ',-6 ' + w + ',-18 0,-26 C-' + w + ',-18 -' + w + ',-6 0,0 Z', c.lg([lt(col, 0.35), col, dk(col, 0.35)], 0, 0, 1, 0), 1.5) + S('M0,-1.5 L0,-22', dk(col, 0.45), 0.9, 0.8), tr(x, y, a, s));
  }
  /* tapering stick from a (width w) to b */
  function taper(ax, ay, bx, by, w, bend) {
    var dx = bx - ax, dy = by - ay, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L, mx = (ax + bx) / 2 + nx * bend, my = (ay + by) / 2 + ny * bend;
    return D`M${ax + nx * w / 2},${ay + ny * w / 2} Q${mx + nx * w * 0.42},${my + ny * w * 0.42} ${bx},${by} Q${mx - nx * w * 0.42},${my - ny * w * 0.42} ${ax - nx * w / 2},${ay - ny * w / 2} Z`;
  }

  /* ---- icon parts ---- */
  function iconWrap(c, bg, glyph) {
    return R(0, 0, 64, 64, c.rg([[0, bg[0]], [1, bg[1]]], 0.42, 0.38, 0.75), 0) + glyph +
      R(0, 0, 64, 64, c.rg([[0.62, '#000', 0], [1, '#000', 0.5]], 0.5, 0.5, 0.72), 0) +
      '<rect x="1.5" y="1.5" width="61" height="61" fill="none" stroke="#0b0806" stroke-width="3"/>' +
      S('M3.8,60.2 L3.8,3.8 L60.2,3.8', '#ffffff', 1.6, 0.4) + S('M3.8,60.2 L60.2,60.2 L60.2,3.8', '#000000', 1.6, 0.55);
  }
  function glow(c, x, y, r, col, o) { return C(x, y, r, c.rg([[0, lt(col, 0.6), o == null ? 0.8 : o], [0.45, col, (o == null ? 0.8 : o) * 0.45], [1, col, 0]]), 0); }
  function item(c, glyph) { return iconWrap(c, ITEM_BG, glyph); }
  /* a dish that gives a buff: the item frame with a soft warm glow behind the glyph */
  function buff(c, glyph, col) { return iconWrap(c, ITEM_BG, glow(c, 32, 36, 30, col || WARM, 0.42) + glyph); }
  function shadow(cx, cy, rx, ry) { return E(cx, cy, rx, ry || 3.6, '#000', 0, 0.38); }

  /* ================= fish (side view, nose on the left at x=L, tail base at x=T, centred on y=0) ================= */
  function fishGeo(o) {
    var L = o.L, T = o.T, px = o.px, hu = o.hu, hd = o.hd, ped = o.ped;
    var top = function (x) {
      if (x <= px) { var t = (px - x) / (px - L); return -hu * Math.sqrt(Math.max(0, 1 - t * t)); }
      var u = Math.min(1, (x - px) / (T - px)), s = u * u * (3 - 2 * u); return -(hu + (ped - hu) * s);
    };
    var bot = function (x) {
      if (x <= px) { var t = (px - x) / (px - L); return hd * Math.sqrt(Math.max(0, 1 - t * t)); }
      var u = Math.min(1, (x - px) / (T - px)), s = u * u * (3 - 2 * u); return hd + (ped - hd) * s;
    };
    return { top: top, bot: bot };
  }
  function fishBodyD(o) {
    var L = o.L, T = o.T, px = o.px, hu = o.hu, hd = o.hd, ped = o.ped, my = o.my || 0;
    var aL = (px - L) * 0.52, aT = (T - px) * 0.5, sx = L + (px - L) * (o.sx || 0.04), bl = o.blunt || 0.78;
    return D`M${L},${my} C${sx},${-hu * bl} ${px - aL},${-hu} ${px},${-hu} C${px + aT},${-hu} ${T - 3},${-ped * 1.3} ${T},${-ped} L${T},${ped} C${T - 3},${ped * 1.3} ${px + aT},${hd} ${px},${hd} C${px - aL},${hd} ${sx},${hd * bl} ${L},${my} Z`;
  }
  function tailD(o) {
    var T = o.T - 2, p = o.ped + 0.4, w = o.tw, h = o.th;
    switch (o.tail) {
      case 'round': return D`M${T},${-p} C${T + w * 0.55},${-h} ${T + w},${-h * 0.75} ${T + w},${0} C${T + w},${h * 0.75} ${T + w * 0.55},${h} ${T},${p} Z`;
      case 'square': return D`M${T},${-p} C${T + w * 0.4},${-p} ${T + w * 0.8},${-h * 0.8} ${T + w},${-h} Q${T + w * 0.8},${0} ${T + w},${h} C${T + w * 0.8},${h * 0.8} ${T + w * 0.4},${p} ${T},${p} Z`;
      case 'crescent': return D`M${T},${-p} C${T + w * 0.35},${-p} ${T + w * 0.7},${-h * 0.6} ${T + w * 1.05},${-h} C${T + w * 0.65},${-h * 0.35} ${T + w * 0.4},${-p * 0.5} ${T + w * 0.38},${0} C${T + w * 0.4},${p * 0.5} ${T + w * 0.65},${h * 0.35} ${T + w * 1.05},${h} C${T + w * 0.7},${h * 0.6} ${T + w * 0.35},${p} ${T},${p} Z`;
      default: return D`M${T},${-p} C${T + w * 0.45},${-p * 1.1} ${T + w * 0.8},${-h * 0.75} ${T + w},${-h} C${T + w * 0.62},${-h * 0.35} ${T + w * 0.58},${h * 0.35} ${T + w},${h} C${T + w * 0.8},${h * 0.75} ${T + w * 0.45},${p * 1.1} ${T},${p} Z`;
    }
  }
  /* a fin on the back (side -1) or belly (side 1) from x0 to x1, h tall; kind 'spiky' gives a row of spines */
  function finD(g, x0, x1, h, side, kind, peak) {
    var edge = side < 0 ? g.top : g.bot, ins = function (x) { return edge(x) - side * 2.6; };
    if (kind === 'spiky') {
      var n = 7, pts = [[x0, ins(x0)]];
      for (var i = 0; i <= n; i++) { var t = i / n, x = x0 + (x1 - x0) * t; pts.push([x, edge(x) + side * h * (1 - 0.45 * t) * (i % 2 ? 0.55 : 1)]); }
      pts.push([x1, ins(x1)]);
      return pl(pts) + 'Z';
    }
    var xt = x0 + (x1 - x0) * (peak == null ? 0.4 : peak), yt = edge(xt) + side * h, e1 = edge(x1);
    return D`M${x0},${ins(x0)} C${x0},${edge(x0) + side * h * 0.6} ${xt - (xt - x0) * 0.45},${yt} ${xt},${yt} C${xt + (x1 - xt) * 0.55},${yt} ${x1},${e1 + side * h * 0.35} ${x1},${ins(x1)} Z`;
  }
  function finFill(c, col, side) { return c.lg([lt(col, 0.25), col, dk(col, 0.3)], 0, side < 0 ? 0 : 1, 0, side < 0 ? 1 : 0); }
  /* fin rays: short strokes from the base outwards, clipped to the fin */
  function finRays(c, d, x0, x1, side, col, n) {
    var o = '';
    n = n || 4;
    for (var i = 0; i < n; i++) { var x = x0 + (x1 - x0) * (i + 0.6) / n; o += D`M${x},${-side * 30} L${x + 3},${side * 30} `; }
    return CG(S(o, col, 0.9, 0.6), c.clip(d));
  }
  /* o: L,T,px,hu,hd,ped (body), tail,tw,th (tail), back,belly,fin (colours), fins [[x0,x1,h,side,kind,col,peak]],
   * pat(c,g) (drawn clipped to the body), pec (pectoral fin), eye [x,y,r,iris], top(c,g) (drawn last) */
  function fish(c, o) {
    var g = fishGeo(o), body = fishBodyD(o), cl = c.clip(body), fc = o.fin || lt(o.back, 0.2), behind = '';
    (o.fins || []).forEach(function (f) {
      var d = finD(g, f[0], f[1], f[2], f[3], f[4], f[6]), col = f[5] || fc;
      behind += P(d, finFill(c, col, f[3]), 1.6) + (f[4] === 'spiky' ? '' : finRays(c, d, f[0], f[1], f[3], dk(col, 0.4)));
    });
    var tl = tailD(o), tc = o.tailCol || fc;
    var gx = o.L + (o.px - o.L) * (o.gill || 0.6);
    var ex = o.eye ? o.eye[0] : o.L + (o.px - o.L) * 0.3, ey = o.eye ? o.eye[1] : -o.hu * 0.2, er = o.eye ? o.eye[2] : 2.4, iris = (o.eye && o.eye[3]) || '#f4ecc8';
    var pec = o.pec === false ? '' : (function () {
      var y = o.hd * 0.28, x = gx + 2, s = o.pecS || 1;
      return P(D`M${x},${y} C${x + 5 * s},${y - 2 * s} ${x + 11 * s},${y + 0.5 * s} ${x + 12 * s},${y + 4.5 * s} C${x + 7 * s},${y + 5.5 * s} ${x + 3 * s},${y + 3.5 * s} ${x},${y} Z`, finFill(c, o.pecCol || fc, 1), 1.3);
    })();
    return behind +
      P(tl, c.lg([lt(tc, 0.2), tc, dk(tc, 0.35)], 0, 0, 1, 0), 1.8) + CG(S(D`M${o.T},0 L${o.T + o.tw},0 M${o.T},0 L${o.T + o.tw},${-o.th * 0.6} M${o.T},0 L${o.T + o.tw},${o.th * 0.6}`, dk(tc, 0.4), 0.9, 0.6), c.clip(tl)) +
      P(body, c.lg([[0, lt(o.back, 0.12)], [0.42, o.back], [0.6, o.belly], [1, dk(o.belly, 0.18)]], 0, 0, 0, 1), 0) +
      CG((o.pat ? o.pat(c, g) : '') +
        S(D`M${o.L + 4},${-o.hu * 0.5} Q${o.px},${-o.hu * 1.02} ${o.T - 5},${-o.ped - 1.2}`, '#ffffff', 1.3, o.shine == null ? 0.45 : o.shine) +
        S(D`M${gx},${g.top(gx) * 0.8} Q${gx + 4.5},0 ${gx},${g.bot(gx) * 0.8}`, dk(o.back, 0.5), 1.4, 0.85), cl) +
      P(body, 'none', 2.2) + pec +
      C(ex, ey, er, iris, 1.2) + C(ex + er * 0.12, ey, er * 0.52, OL, 0) + C(ex - er * 0.25, ey - er * 0.3, Math.max(0.5, er * 0.25), '#ffffff', 0) +
      S(D`M${o.L + 0.4},${(o.my || 0) + 0.6} L${o.L + 4},${(o.my || 0) + 1.6}`, dk(o.back, 0.6), 1.1, 0.9) +
      (o.top ? o.top(c, g) : '');
  }
  /* scale arcs facing the tail over a box */
  function scaleArcs(x0, x1, y0, y1, st, col, w, o) {
    var d = '', row = 0;
    for (var y = y0; y <= y1; y += st * 0.8, row++) for (var x = x0 + (row % 2 ? st / 2 : 0); x <= x1; x += st) d += D`M${x},${y - st * 0.42} Q${x + st * 0.45},${y} ${x},${y + st * 0.42} `;
    return S(d, col, w || 0.8, o == null ? 0.6 : o);
  }
  function dots(seed, n, x0, x1, y0, y1, r0, r1_, col, o) {
    var r = rng(seed), s = '';
    for (var i = 0; i < n; i++) s += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), r0 + r() * (r1_ - r0), col, 0, o);
    return s;
  }
  function whisker(d, col, w) { return S(d, OL, (w || 1.2) + 1.8) + S(d, col, w || 1.2); }

  var FISH = {
    silverfin_minnow: {
      L: -20, T: 12, px: -5, hu: 6.4, hd: 5.6, ped: 2.2, tail: 'fork', tw: 9, th: 6.8, back: '#6e8296', belly: '#f6f9fc', fin: '#dce8f4',
      fins: [[-5, 4, 5, -1], [3, 9, 3.6, 1]], eye: [-14, -1.2, 2.5], pecS: 0.6,
      pat: function () { return S('M-15,0.5 L12,0', '#34404c', 1.5, 0.7) + S('M-15,-1 L12,-1.4', '#ffffff', 1, 0.8); }
    },
    mudbelly_carp: {
      L: -22, T: 13, px: -3, hu: 13, hd: 12, ped: 4.6, tail: 'fork', tw: 11, th: 11, back: '#7a5418', belly: '#f0c858', fin: '#b0682e',
      fins: [[-7, 11, 5.5, -1, 0, 0, 0.25], [-2, 5, 5, 1], [6, 11, 4.6, 1]], eye: [-15, -3, 2.6],
      pat: function () { return scaleArcs(-12, 12, -11, 11, 5, '#4a3008', 1, 0.7) + scaleArcs(-11, 13, -10, 12, 5, '#fff0b0', 0.6, 0.35); },
      top: function () { return whisker('M-21,1.6 C-23,4 -23,6 -21,8', '#c89a58', 0.9); }
    },
    whiskered_pike: {
      L: -30, T: 19, px: -6, hu: 6.6, hd: 6, ped: 3, sx: 0.3, blunt: 0.32, tail: 'fork', tw: 10, th: 8.4, back: '#3a6428', belly: '#e4eaa8', fin: '#7c9838',
      fins: [[7, 15, 6, -1, 0, 0, 0.55], [7, 15, 5, 1, 0, 0, 0.55]], eye: [-21, -2.2, 2.2], gill: 0.55, pecS: 0.8,
      pat: function () {
        var r = rng(7), s = '';
        for (var i = 0; i < 16; i++) { var x = -18 + i * 2.4 + r() * 1.2, y = -3.4 + (i % 3) * 2.6 + r() * 0.8; s += E(x, y, 1.4, 0.8, '#e8e8a0', 0, 0.8, -15); }
        return s;
      },
      top: function () { return whisker('M-28,1.2 C-30,5 -28,8 -24,10', '#d8d890', 1) + whisker('M-27,0.6 C-26,4 -22,6 -18,7', '#d8d890', 0.9); }
    },
    glimmerscale: {
      L: -22, T: 13, px: -4, hu: 11, hd: 10, ped: 3.6, tail: 'fork', tw: 13, th: 12, back: '#b4a8dc', belly: '#ffffff', fin: '#e8dcff', shine: 0.8,
      fins: [[-6, 9, 7, -1, 0, 0, 0.3], [2, 9, 5.5, 1]], eye: [-15, -2.4, 2.6, '#c8f0ff'],
      pat: function (c) {
        return R(-24, -14, 42, 28, c.lg([[0, '#ff9ad0', 0.55], [0.3, '#ffe890', 0.5], [0.55, '#9af0d8', 0.5], [0.8, '#9ab8ff', 0.55], [1, '#e8a0ff', 0.5]], 0, 0, 1, 1), 0) +
          scaleArcs(-12, 12, -9, 9, 4.4, '#ffffff', 0.9, 0.75) + scaleArcs(-11, 13, -8, 10, 4.4, '#7a68b0', 0.6, 0.35);
      }
    },
    speckled_trout: {
      L: -24, T: 14, px: -4, hu: 8.6, hd: 8, ped: 3.4, tail: 'square', tw: 9.5, th: 8.4, back: '#66703c', belly: '#f2e4d4', fin: '#a08a58',
      fins: [[-6, 4, 6, -1], [6, 10, 3.2, -1, 0, 0, 0.5], [-1, 5, 4.5, 1], [6, 11, 4, 1]], eye: [-17, -2, 2.4],
      pat: function () {
        return E(-2, 1, 22, 2.4, '#e8708c', 0, 0.75) + dots(31, 26, -16, 14, -8, -1, 0.7, 1.3, '#1e1a10', 0.9) + dots(37, 6, -6, 12, 2.4, 6, 0.6, 1, '#2a2014', 0.7);
      },
      top: function () { return dots(41, 5, 15, 22, -6, 6, 0.6, 0.9, '#1e1a10', 0.9); }
    },
    reedback_perch: {
      L: -22, T: 13, px: -4, hu: 12.5, hd: 9, ped: 3.6, tail: 'fork', tw: 10, th: 9.5, back: '#6a8c24', belly: '#f2e46a', fin: '#c8a03a',
      fins: [[-9, 3, 8, -1, 'spiky', '#3e4e1c'], [4, 11, 5.5, -1, 0, '#7a8a34', 0.4], [-4, 2, 5.5, 1, 0, '#e8582a'], [4, 10, 5, 1, 0, '#e8582a']],
      eye: [-15, -3, 2.6, '#ffd84a'], pecCol: '#e8822a',
      pat: function () {
        var s = '';
        [-9, -4, 1, 6, 10].forEach(function (x, i) { s += P(D`M${x - 1.6},-14 L${x + 1.6},-14 L${x + 0.8 - i * 0.2},${6 - i * 0.4} L${x - 0.6},${6 - i * 0.4} Z`, '#24300c', 0, 0.75); });
        return s;
      }
    },
    ironjaw_catfish: {
      L: -24, T: 15, px: -10, hu: 8, hd: 9.5, ped: 3.8, my: 2, blunt: 0.95, tail: 'round', tw: 9, th: 7.5, back: '#535b64', belly: '#d6d6cc', fin: '#646c76',
      fins: [[-7, -1, 6, -1, 0, 0, 0.3], [-1, 15, 4.4, 1, 0, 0, 0.3]], eye: [-17, -4, 1.8, '#d8c890'], gill: 0.75,
      pat: function () { return dots(53, 18, -16, 14, -7, 1, 0.8, 1.8, '#2e343a', 0.6); },
      top: function (c) {
        return P('M-25,2 C-25,6 -21,9.5 -14,9.5 C-12,8 -12,6 -14,5 C-18,5 -22,4 -25,2 Z', c.cel('#3e454c'), 1.6) + S('M-24,3.4 C-20,5.2 -17,5.6 -14,5.4', '#c8c8c0', 1.1, 0.8) +
          whisker('M-23,0.6 C-30,-2 -34,4 -31,12 C-30,15 -28,17 -25,19', '#2a2e34', 1.4) + whisker('M-20,0 C-24,-6 -16,-12 -6,-12', '#2a2e34', 1.2) +
          whisker('M-20,9 C-21,13 -19,15 -17,16', '#2a2e34', 1) + whisker('M-16,9.5 C-15,13 -12,14 -10,14.5', '#2a2e34', 1);
      }
    },
    saltfin_snapper: {
      L: -22, T: 13, px: -2, hu: 13, hd: 9, ped: 3.8, my: 1.5, sx: 0.12, blunt: 0.62, tail: 'fork', tw: 10, th: 10, back: '#c42828', belly: '#ffc8b4', fin: '#e8483a',
      fins: [[-10, 5, 7, -1, 'spiky', '#d83a2e'], [5, 11, 5, -1, 0, 0, 0.4], [-2, 4, 5, 1], [4, 10, 5, 1]], eye: [-14, -3.4, 3, '#ff6a4a'],
      pat: function () { return scaleArcs(-10, 12, -10, 7, 4.2, '#7a0e0e', 0.8, 0.45) + S('M-12,-7 C-4,-11 4,-10 10,-6', '#ffd0c0', 1.2, 0.5); }
    },
    greyscale_cod: {
      L: -24, T: 14, px: -6, hu: 9.4, hd: 9, ped: 3.4, tail: 'square', tw: 9, th: 8, back: '#727a84', belly: '#f6f4ec', fin: '#8a929c',
      fins: [[-10, -3, 5.5, -1, 0, 0, 0.4], [-2, 5, 5, -1, 0, 0, 0.4], [6, 12, 4.5, -1, 0, 0, 0.4], [-2, 5, 4.5, 1, 0, 0, 0.4], [6, 12, 4, 1, 0, 0, 0.4]], eye: [-17, -2.6, 2.4],
      pat: function () { return dots(61, 22, -16, 13, -8, -1.5, 0.6, 1.2, '#3e444c', 0.7) + S('M-12,-1 C-4,-4 4,-3 14,-1', '#f6f4ec', 1.3, 0.9); },
      top: function () { return whisker('M-21,5.5 C-21,8 -22,10 -24,11', '#c8c8c0', 1.1); }
    },
    stormback_tuna: {
      L: -26, T: 16, px: -4, hu: 10, hd: 9, ped: 2.2, sx: 0.12, blunt: 0.6, tail: 'crescent', tw: 12, th: 13, back: '#16223c', belly: '#dfe6ee', fin: '#26385a', tailCol: '#1e2c48',
      fins: [[-6, 2, 8, -1, 0, 0, 0.3], [0, 6, 6, 1, 0, '#c8c8d0', 0.4]], eye: [-19, -2.4, 2.4, '#e8eef4'], pecS: 1.3,
      pat: function () {
        return S('M-22,-3 L-14,-5 L-9,-2.6 L-2,-6 L4,-3 L10,-5.4 L16,-3', '#0a1222', 4.6, 0.8) + S('M-22,-3 L-14,-5 L-9,-2.6 L-2,-6 L4,-3 L10,-5.4 L16,-3', '#3ab4ff', 2.6) +
          S('M-22,-3 L-14,-5 L-9,-2.6 L-2,-6 L4,-3 L10,-5.4 L16,-3', '#c8f0ff', 0.9, 0.9);
      },
      top: function (c, g) {
        var s = '';
        for (var i = 0; i < 4; i++) {
          var x = 6 + i * 2.4, t = g.top(x), b = g.bot(x);
          s += P(D`M${x},${t + 0.6} L${x + 1.2},${t - 2.4} L${x + 2},${t + 0.8} Z`, '#ffd23a', 0.9) + P(D`M${x},${b - 0.6} L${x + 1.2},${b + 2.4} L${x + 2},${b - 0.8} Z`, '#ffd23a', 0.9);
        }
        return s;
      }
    }
  };
  function rawFish(c, k, x, y, a, s) { return G(fish(c, FISH[k]), tr(x, y, a, s)); }

  /* a long body along a cubic centre line with width w(t) (eels) */
  function tube(p0, p1, p2, p3, w, n) {
    var L = [], Rr = [];
    n = n || 32;
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      var x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
      var y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
      var dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
      var dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
      var l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l, ww = w(t) / 2;
      L.push([x + nx * ww, y + ny * ww]); Rr.push([x - nx * ww, y - ny * ww]);
    }
    return { d: pl(L.concat(Rr.slice().reverse())) + 'Z', at: function (t) { return [L[Math.round(t * n)], Rr[Math.round(t * n)]]; } };
  }
  function eelW(t) { return t < 0.1 ? 6 + 7 * Math.sqrt(t / 0.1) : 13 * Math.pow(1 - (t - 0.1) / 0.9, 0.8) + 0.8; }
  /* the lantern eel glyph along the cubic p (4 points), width scale ws: dark sinuous body, a lure on a stalk glowing yellow-green */
  function lanternEel(c, cooked, p, ws) {
    var col = cooked ? '#8a4a1e' : '#3a4c6c', belly = cooked ? '#d8923e' : '#8098b8', lure = '#d8ff6a';
    var tb = tube(p[0], p[1], p[2], p[3], function (t) { return eelW(t) * (ws || 1); }), d = tb.d, cl = c.clip(d);
    var h = tb.at(0.08), mid = [(h[0][0] + h[1][0]) / 2, (h[0][1] + h[1][1]) / 2], back = h[1];
    var eye = [mid[0] + (back[0] - mid[0]) * 0.4, mid[1] + (back[1] - mid[1]) * 0.4];
    var b2 = tb.at(0.13)[1], tip = [b2[0] + 4, b2[1] - 10];
    var ridge = '', belt = '';
    for (var i = 2; i <= 30; i++) { var q = tb.at(i / 32); ridge += (i === 2 ? 'M' : 'L') + r1(q[1][0]) + ',' + r1(q[1][1]); belt += (i === 2 ? 'M' : 'L') + r1(q[0][0]) + ',' + r1(q[0][1]); }
    return glow(c, tip[0], tip[1], 15, '#c8ff60', 0.75) +
      P(d, c.lg([lt(col, 0.2), col, belly], 0, 0, 1, 1), 0) +
      CG(S(belt, belly, 4, 0.8) + S(ridge, lt(col, 0.3), 2, 0.7) +
        (cooked ? S('M10,10 L60,60 M0,14 L50,64 M20,0 L70,50 M-10,22 L40,72', '#3a1a08', 1.6, 0.55) : dots(83, 20, 4, 60, 4, 60, 0.6, 1.1, '#a8e0ff', 0.55)), cl) +
      P(d, 'none', 2.2) +
      stem(D`M${back[0]},${back[1]} C${back[0] - 1},${back[1] - 6} ${tip[0] - 4},${tip[1] - 2} ${tip[0]},${tip[1]}`, cooked ? '#5a3a20' : '#3e5068', 1.2) +
      C(tip[0], tip[1], 3, c.rg([[0, '#ffffff'], [0.45, lure], [1, '#7ab820']]), 1.4) + sparkle(tip[0], tip[1], 5.5, '#f4ffd0') +
      C(eye[0], eye[1], 2.1, cooked ? '#e8d8b0' : lure, 1.1) + C(eye[0], eye[1], 1, OL, 0);
  }
  /* the duskglass ray from above: translucent purple wings, a long whip tail, glints */
  function duskRay(c, cooked) {
    var col = '#7a4ab8';
    var d = 'M0,-17 C5,-16 9,-9 25,-2 C16,4 7,10 0,14 C-7,10 -16,4 -25,-2 C-9,-9 -5,-16 0,-17 Z';
    var cl = c.clip(d);
    return S2('M0,13 C2,22 -2,28 4,36', dk(col, 0.2), 1.6) +
      P('M-3,11 C-7,12 -9,16 -6,18 C-4,17 -2,14 -1,12 Z M3,11 C7,12 9,16 6,18 C4,17 2,14 1,12 Z', c.cel(lt(col, 0.1)), 1.3) +
      P(d, c.rg([[0, '#f4d8ff', 0.95], [0.45, lt(col, 0.2), 0.85], [1, dk(col, 0.25), 0.9]], 0.5, 0.4, 0.6), 0) +
      CG(S('M0,-15 L0,12 M-3,-6 C-10,-4 -16,-3 -22,-2 M3,-6 C10,-4 16,-3 22,-2 M-3,2 C-9,4 -13,5 -17,4 M3,2 C9,4 13,5 17,4', '#f8e8ff', 1, 0.55) +
        E(0, -2, 6, 9, '#ffffff', 0, 0.25) + dots(91, 10, -18, 18, -6, 6, 0.5, 1, '#ffffff', 0.85), cl) +
      P(d, 'none', 2.2) + C(-3.2, -9, 1.4, '#2a1040', 0) + C(3.2, -9, 1.4, '#2a1040', 0) +
      C(-3.6, -9.4, 0.5, '#ffffff', 0) + C(2.8, -9.4, 0.5, '#ffffff', 0);
  }

  /* ================= meat ================= */
  /* sweep a top-face path down by th to give it a side; returns outline + side fill, the top is drawn by the caller */
  function extrude(d, th, side, sw, n) {
    var o1 = '', o2 = '';
    n = n || Math.max(4, Math.ceil(th * 1.5));
    for (var i = n; i >= 0; i--) { var tf = 'translate(0,' + r1(th * i / n) + ')'; o1 += G(S(d, OL, (sw || 2.4) * 2), tf); o2 += G(F(d, side), tf); }
    return o1 + o2;
  }
  function slab(c, d, th, topFill, side, extra) {
    return extrude(d, th, side) + P(d, topFill, 2.2) + (extra ? CG(extra, c.clip(d)) + P(d, 'none', 2.2) : '');
  }

  /* ================= dishware ================= */
  function plate(c, cx, cy, rx, ry, col, rim) {
    return shadow(cx, cy + ry + 2.5, rx * 0.92, 3.6) + E(cx, cy + 2.6, rx, ry, dk(col, 0.45), 2.2) +
      E(cx, cy, rx, ry, c.lg([lt(col, 0.35), col, dk(col, 0.12)], 0, 0, 0, 1), 2.2) +
      E(cx, cy + ry * 0.06, rx * 0.74, ry * 0.68, c.lg([dk(col, 0.14), lt(col, 0.12)], 0, 0, 0, 1), 0) +
      (rim ? '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx * 0.87) + '" ry="' + r1(ry * 0.84) + '" fill="none" stroke="' + rim + '" stroke-width="1.4"/>' : '') +
      S(D`M${cx - rx * 0.8},${cy - ry * 0.35} Q${cx - rx * 0.4},${cy - ry * 0.95} ${cx + rx * 0.1},${cy - ry * 0.96}`, '#ffffff', 1.2, 0.55);
  }
  /* bowl: rim ellipse centred at (cx,ty), depth dep; soup is the surface fill, inner(cl) adds things floating in it */
  function bowl(c, cx, ty, rx, ry, dep, col, soup, inner, foot) {
    var body = D`M${cx - rx},${ty} C${cx - rx},${ty + dep * 0.92} ${cx - rx * 0.5},${ty + dep} ${cx},${ty + dep} C${cx + rx * 0.5},${ty + dep} ${cx + rx},${ty + dep * 0.92} ${cx + rx},${ty} Z`;
    var sd = D`M${cx - rx + 2.6},${ty + 0.6} A${rx - 2.6},${ry - 1.8} 0 1 0 ${cx + rx - 2.6},${ty + 0.6} A${rx - 2.6},${ry - 1.8} 0 1 0 ${cx - rx + 2.6},${ty + 0.6} Z`;
    return shadow(cx, ty + dep + 3, rx * 0.85, 3.6) +
      (foot === false ? '' : P(D`M${cx - rx * 0.36},${ty + dep - 3} L${cx - rx * 0.44},${ty + dep + 2.6} L${cx + rx * 0.44},${ty + dep + 2.6} L${cx + rx * 0.36},${ty + dep - 3} Z`, dk(col, 0.3), 2)) +
      P(body, c.lg([[0, lt(col, 0.3)], [0.35, col], [1, dk(col, 0.5)]], 0, 0, 1, 0.3), 2.4) +
      CG(S(D`M${cx - rx + 3.5},${ty + 3} C${cx - rx + 3.5},${ty + dep * 0.6} ${cx - rx * 0.5},${ty + dep * 0.85} ${cx - rx * 0.2},${ty + dep * 0.9}`, '#ffffff', 1.6, 0.4), c.clip(body)) +
      E(cx, ty, rx, ry, c.lg([dk(col, 0.35), lt(col, 0.25)], 0, 0, 0, 1), 2.4) +
      F(sd, soup) + (inner ? CG(inner, c.clip(sd)) : '') + P(sd, 'none', 1.4);
  }
  function steam(x, y, s, o) {
    s = s || 1;
    var d = D`M${x},${y} C${x - 3 * s},${y - 4 * s} ${x + 3 * s},${y - 7 * s} ${x},${y - 11 * s} C${x - 2 * s},${y - 13 * s} ${x},${y - 15 * s} ${x + 1 * s},${y - 16 * s}`;
    return S(d, '#ffffff', 2 * s, o == null ? 0.45 : o);
  }
  function chunk(c, x, y, r, col, seed, sw) {
    var rr = rng(seed), p = [];
    for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + rr() * 0.5, k = 0.75 + rr() * 0.4; p.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * 0.8 * k]); }
    return P(pl(p) + 'Z', c.cel(col), sw == null ? 1.2 : sw) + C(x - r * 0.3, y - r * 0.3, r * 0.22, '#ffffff', 0, 0.45);
  }
  function lemon(c, x, y, a, s) {
    return G(P('M-7,0 A7,7 0 0 0 7,0 Z', c.cel('#f4d430'), 1.6) + P('M-5.4,0.4 A5.4,5.4 0 0 0 5.4,0.4 Z', '#fff6b0', 0) +
      S('M0,0.6 L0,5 M0,0.6 L-3.6,3.6 M0,0.6 L3.6,3.6', '#e8c020', 0.9), tr(x, y, a, s));
  }
  function sprig(c, x, y, a, s) { return G(blade(c, 0, 0, -30, 0.36, '#5aa040', 4) + blade(c, 0, 0, 10, 0.42, '#4a9038', 4) + blade(c, 0, 0, 48, 0.32, '#5aa040', 4), tr(x, y, a, s)); }
  /* boneless fish fillet centred at 0,0, skin edge on top */
  var FILLET = 'M-19,-1 C-15,-8 4,-9.5 16,-6 C21,-4.4 22,0 19,2.6 C9,7 -9,7.4 -17,3.4 C-19.6,2 -20,0.4 -19,-1 Z';
  function fillet(c, col, skin, extra, tail) {
    var cl = c.clip(FILLET);
    return (tail ? P('M16,-1 C20,-3 24,-7 27,-9 C25,-4 25,3 27,8 C24,6 20,3 16,2 Z', c.lg([lt(tail, 0.2), tail, dk(tail, 0.3)], 0, 0, 1, 0), 1.6) + S('M18,0 L26,-6 M18,0.6 L26,5 M18,0.3 L25.6,-0.4', dk(tail, 0.4), 0.8, 0.6) : '') +
      P(FILLET, c.lg([lt(col, 0.3), col, dk(col, 0.25)], 0, 0, 0, 1), 0) +
      CG((skin ? S('M-19,-3 C-12,-9 6,-10.6 20,-5.4', skin, 3.4) : '') +
        S('M-11,-5 C-13,-1 -12,3 -9,5 M-4,-7 C-6,-2 -5,3 -2,6 M3,-7.4 C1,-2 2,3 5,5.6 M10,-6.6 C8,-2 9,2 12,4.4', dk(col, 0.3), 1, 0.75) +
        S('M-14,-2 C-6,-6 6,-6.4 16,-3', '#ffffff', 1.2, 0.45) + (extra || ''), cl) + P(FILLET, 'none', 2.2);
  }
  function skewer(c, x1, y1, x2, y2, pieces) {
    var o = S2(D`M${x1},${y1} L${x2},${y2}`, '#c8a070', 1.8) + S(D`M${x1},${y1} L${x2},${y2}`, '#f0d8a8', 0.6, 0.8);
    pieces.forEach(function (p) { o += p(x1 + (x2 - x1) * p.t, y1 + (y2 - y1) * p.t); });
    return o;
  }
  function at(t, f) { var g = function (x, y) { return f(x, y); }; g.t = t; return g; }
  function grill(d, ang, step, col, w, n) {
    var s = '';
    n = n || 4;
    for (var i = -n; i <= n; i++) s += D`M${-30 + i * step},${-30} L${30 + i * step},${30} `;
    return G(S(s, col || '#2a1206', w || 1.8, 0.85), 'rotate(' + (ang || 0) + ')');
  }
  function flameD(x, y, s) { return D`M${x},${y} C${x - 4 * s},${y} ${x - 5 * s},${y - 5 * s} ${x - 2 * s},${y - 9 * s} C${x - 1.5 * s},${y - 6 * s} ${x},${y - 6 * s} ${x},${y - 11 * s} C${x + 3 * s},${y - 8 * s} ${x + 5 * s},${y - 5 * s} ${x + 4 * s},${y - 2 * s} C${x + 3.4 * s},${y} ${x + 2 * s},${y} ${x},${y} Z`; }
  function flame(c, x, y, s) { return P(flameD(x, y, s), c.lg(['#fff0a0', '#ffa020', '#e04a10'], 0, 0, 0, 1), 1.4) + F(flameD(x + 0.4 * s, y - 0.6 * s, s * 0.5), '#fff8d0', 0.85); }
  function peppercorns(c, seed, n, x0, x1, y0, y1, r) {
    var rr = rng(seed), s = '';
    for (var i = 0; i < n; i++) { var x = x0 + rr() * (x1 - x0), y = y0 + rr() * (y1 - y0); s += C(x, y, r, c.lg(['#6a5040', '#2a1a12', '#140a06'], 0.2, 0, 0.8, 1), 0.9) + C(x - r * 0.35, y - r * 0.35, r * 0.3, '#c8b098', 0, 0.8); }
    return s;
  }

  /* ================= the icons ================= */
  var NEW = {
    /* ---------- profession badges ---------- */
    /* a black iron pot of bubbling stew over little flames, a wooden spoon in it, steam rising */
    prof_cooking: function (c) {
      var pot = 'M10,30 C10,46 18,54 32,54 C46,54 54,46 54,30 Z';
      var spoon = G(P('M-1.8,0 L1.8,0 L1.4,-28 L-1.4,-28 Z', c.cel('#b0783e'), 1.6) + E(0, -32, 4.6, 6, c.cel('#c08848'), 1.6) + E(0, -32.6, 2.8, 4, '#8a5428', 0, 0.6), tr(44, 30, 32));
      return iconWrap(c, ['#7a4418', '#160804'],
        glow(c, 32, 26, 28, '#ffb050', 0.4) +
        flame(c, 22, 60, 0.7) + flame(c, 32, 61, 0.85) + flame(c, 42, 60, 0.7) +
        spoon +
        S2('M10,34 C4,34 4,42 10,42', '#3a3a42', 2) + S2('M54,34 C60,34 60,42 54,42', '#3a3a42', 2) +
        P(pot, c.lg([[0, '#6a6a74'], [0.4, '#3a3a42'], [1, '#141418']], 0, 0, 1, 0.3), 2.4) +
        CG(S('M14,34 C14,44 20,50 26,52', '#ffffff', 1.6, 0.35), c.clip(pot)) +
        E(32, 30, 22, 6.5, c.lg(['#20202a', '#7a7a84'], 0, 0, 0, 1), 2.4) +
        E(32, 30.6, 19, 4.6, c.lg(['#e89a3a', '#b8601e'], 0, 0, 0, 1), 1.2) +
        C(26, 30, 1.6, '#ffd890', 0, 0.9) + C(36, 31, 1.2, '#ffd890', 0, 0.9) + C(31, 29, 2.2, c.cel('#a0502a'), 1) + C(40, 29.4, 1.8, c.cel('#e8782a'), 1) +
        steam(24, 22, 0.9, 0.6) + steam(34, 20, 1.05, 0.65) + steam(44, 22, 0.8, 0.5));
    },
    /* a fishing rod with a reel, its line curving down to a red and white bobber on rippling water */
    prof_fishing: function (c) {
      var rod = taper(12, 58, 52, 8, 4.2, 0);
      return iconWrap(c, ['#1e5a6a', '#041218'],
        glow(c, 44, 46, 18, '#a8f0ff', 0.35) +
        '<ellipse cx="44" cy="50" rx="14" ry="4" fill="none" stroke="#8ae0f0" stroke-width="1.4" opacity="0.7"/>' +
        '<ellipse cx="44" cy="50" rx="8" ry="2.4" fill="none" stroke="#c8f4ff" stroke-width="1.2" opacity="0.8"/>' +
        S('M52,8 C60,20 56,34 44,44', '#f4f4ec', 1, 0.95) +
        P(rod, c.lg(['#c8925a', '#8a5a30', '#5a3418'], 0, 0, 1, 1), 1.8) +
        S('M14,55 L20,47.4', '#e8d0a0', 5.4) + S2('M13,56.4 L21,46.4', '#d8b880', 3.6) + S('M14,53 L16,51 M17,49.4 L19,47.4', '#a08050', 1, 0.8) +
        C(31, 34, 1.3, 'none', 1) + C(40, 23, 1.1, 'none', 0.9) + C(47, 14.6, 0.9, 'none', 0.8) +
        C(22, 49, 4.6, c.lg(STEEL, 0, 0, 1, 1), 1.8) + C(22, 49, 1.6, '#5a626c', 0) + S2('M22,49 L27,52', '#c2cad3', 1.2) +
        P('M38,44 A6,6 0 0 1 50,44 Z', c.cel('#e83a2a'), 1.8) + P('M38,44 A6,6 0 0 0 50,44 Z', c.cel('#f4f0e8'), 1.8) + S2('M44,38 L44,34', '#e83a2a', 1.2) +
        S('M40,41 C41,39.4 43,38.6 45,38.6', '#ffffff', 1.2, 0.7) + sparkle(54, 40, 2.6, '#e8faff'));
    },

    /* ---------- raw fish ---------- */
    /* two small silver minnows with a dark side stripe */
    silverfin_minnow: function (c) {
      return item(c, shadow(32, 55, 20) + rawFish(c, 'silverfin_minnow', 38, 24, 14, 0.9) + rawFish(c, 'silverfin_minnow', 28, 42, 16, 1.12) + sparkle(14, 22, 2.4, '#ffffff'));
    },
    /* a fat deep-bodied carp, brown-gold with big scales and little barbels */
    mudbelly_carp: function (c) { return item(c, shadow(32, 56, 22) + rawFish(c, 'mudbelly_carp', 29, 33, 14, 1.16)); },
    /* a long green pike with pale bean spots, a duck-bill snout and whiskers, fins set far back */
    whiskered_pike: function (c) { return item(c, shadow(32, 56, 24) + rawFish(c, 'whiskered_pike', 31, 33, 30, 1.1)); },
    /* a pearly fish with a rainbow sheen and sparkles (rare) */
    glimmerscale: function (c) {
      return iconWrap(c, ['#4a3c64', '#0e0a16'], glow(c, 32, 32, 28, '#e8d8ff', 0.5) + shadow(32, 56, 22) + rawFish(c, 'glimmerscale', 29, 32, 14, 1.16) +
        sparkle(48, 14, 4.2, '#ffffff') + sparkle(14, 46, 3, '#fff0ff') + sparkle(54, 46, 2.4, '#e0f8ff'));
    },
    /* a trout with a pink side band, peppered with black spots */
    speckled_trout: function (c) { return item(c, shadow(32, 56, 23) + rawFish(c, 'speckled_trout', 29, 33, 20, 1.16)); },
    /* a hump-backed green-yellow perch with dark bars, a spiny dorsal fin and orange belly fins */
    reedback_perch: function (c) { return item(c, shadow(32, 56, 22) + rawFish(c, 'reedback_perch', 29, 34, 12, 1.16)); },
    /* a big grey catfish: broad flat head, heavy undershot jaw, long whiskers */
    ironjaw_catfish: function (c) { return item(c, shadow(32, 56, 24) + rawFish(c, 'ironjaw_catfish', 33, 32, 16, 1.16)); },
    /* a dark eel with a glowing lure light on its head (rare) */
    lantern_eel: function (c) { return iconWrap(c, ['#2a5060', '#06080e'], shadow(34, 56, 22) + lanternEel(c, false, [[9, 32], [28, 0], [34, 64], [57, 40]])); },
    /* a deep red snapper with a spiny back and a big red eye */
    saltfin_snapper: function (c) { return item(c, shadow(32, 56, 22) + rawFish(c, 'saltfin_snapper', 30, 33, 12, 1.16)); },
    /* a grey-white cod with three back fins, a pale side line and a chin barbel */
    greyscale_cod: function (c) { return item(c, shadow(32, 56, 23) + rawFish(c, 'greyscale_cod', 29, 33, 18, 1.16)); },
    /* a big torpedo tuna, blue-black back with a jagged storm-blue stripe, yellow finlets and a crescent tail */
    stormback_tuna: function (c) {
      return item(c, shadow(32, 56, 24) + rawFish(c, 'stormback_tuna', 30, 32, 26, 1.1) + sparkle(50, 12, 2.6, '#c8f0ff'));
    },
    /* a translucent purple ray seen from above, glints across its wings (rare) */
    duskglass_ray: function (c) {
      return iconWrap(c, ['#3a2a5a', '#0a0612'], glow(c, 32, 30, 28, '#c890ff', 0.5) + shadow(32, 56, 20) + G(duskRay(c), tr(32, 30, -28, 1.12)) +
        sparkle(50, 12, 3.6, '#ffffff') + sparkle(14, 18, 2.6, '#f0e0ff') + sparkle(52, 50, 2.2, '#f0e0ff'));
    },

    /* ---------- raw meat ---------- */
    /* a small boneless pink cut with a thin fat edge */
    lean_meat: function (c) {
      var d = 'M15,33 C15,26 23,21 33,21.5 C43,22 50,26 49,32 C48,38 41,42 31,42 C21,42 15,39 15,33 Z';
      return item(c, shadow(32, 50, 18) + slab(c, d, 6, c.rg([[0, '#ffc0c0'], [0.6, '#f07a84'], [1, '#d85a68']], 0.45, 0.4, 0.6), '#b8424e',
        S('M17,28 C22,22 34,19.6 45,23 C48,25 49,28 49,31', '#fbeede', 3.4) + S('M17,28 C22,22 34,19.6 45,23', '#c8a898', 0.8, 0.7) +
        S('M22,34 C28,30 36,30 42,33 M24,38 C30,35 36,35 40,37', '#c04858', 1, 0.6) + S('M20,31 C24,27 30,26 34,26', '#ffffff', 1.2, 0.5)));
    },
    /* a dark red angular chunk streaked with pale gristle */
    tough_meat: function (c) {
      var d = 'M10,30 L18,19 L33,15 L46,19 L54,29 L48,40 L32,44 L16,41 Z';
      return item(c, shadow(32, 55, 22) + slab(c, d, 9, c.lg(['#a8343a', '#7a1a22', '#5a1018'], 0.2, 0, 0.8, 1), '#4a0e14',
        S('M14,30 C20,26 24,32 30,28 C36,24 40,30 48,26', OL, 4) + S('M14,30 C20,26 24,32 30,28 C36,24 40,30 48,26', '#e8dccc', 2.4) +
        S('M22,38 C26,35 30,38 34,35', OL, 3) + S('M22,38 C26,35 30,38 34,35', '#d8c8b4', 1.6) +
        S('M30,20 C34,22 38,20 42,22', '#e8dccc', 1.4, 0.8) + E(42, 35, 3, 2, '#f0e0cc', 0, 0.85) + E(20, 24, 2.2, 1.4, '#f0e0cc', 0, 0.75) +
        S('M18,22 L32,17.4', '#ffffff', 1.2, 0.35)) +
        S('M16,41 L16,49 M32,44 L32,52', dk('#4a0e14', 0.4), 1.2, 0.6) + S('M18,43 C24,45 28,45 31,46', '#e8dccc', 1.4, 0.7));
    },
    /* a big thick marbled steak with a creamy fat cap */
    thick_steak: function (c) {
      var d = 'M7,25 C7,15 21,10 34,11 C48,12 58,18 56,28 C55,34 50,36 44,38 C38,40 36,45 27,45 C15,45 7,37 7,25 Z';
      var marb = 'M14,24 C18,22 20,26 24,24 C28,22 30,26 34,22 M20,32 C24,30 28,34 32,31 C36,28 40,32 44,28 M36,18 C40,20 44,17 48,20 M26,38 C30,36 33,39 36,36 M40,25 C44,24 46,27 50,25 M16,30 L19,33';
      return item(c, shadow(32, 56, 25) + slab(c, d, 10, c.rg([[0, '#e85a5e'], [0.6, '#c8303a'], [1, '#9a1e28']], 0.45, 0.4, 0.65), '#8a2430',
        S('M9,30 C6,18 18,11.4 30,11.6 C42,11.8 52,14.4 55,22', '#f6e8cc', 4.2) + S(marb, '#fbe4e0', 1.1, 0.8) + S(marb, '#ffffff', 0.5, 0.6)) +
        S('M8,31 C10,40 18,47 28,47.6', '#f0dcc0', 2.6, 0.8) + S('M44,40 C48,44 52,42 55,38', '#f0dcc0', 2.4, 0.6));
    },
    /* a little red cloth pouch tied at the neck, full of peppercorns, a few spilled */
    cooking_spices: function (c) {
      var col = '#b04a2a';
      var body = 'M19,34 C11,40 11,53 21,56 C27,58 37,58 43,56 C53,53 53,40 45,34 Z';
      var ruff = 'M14,22 C18,14 46,14 50,22 C47,30 40,34 32,34 C24,34 17,30 14,22 Z';
      return item(c, shadow(32, 57, 22) +
        P(body, c.lg([lt(col, 0.25), col, dk(col, 0.45)], 0, 0, 1, 0.4), 2.4) +
        CG(S('M18,44 C26,47 38,47 46,44 M20,50 C28,53 36,53 44,50', '#e8a060', 1, 0.5) + S('M17,40 C15,46 17,52 21,54', '#ffffff', 1.4, 0.4), c.clip(body)) +
        P(ruff, c.lg([lt(col, 0.35), col, dk(col, 0.25)], 0, 0, 0, 1), 2.2) +
        E(32, 22, 14, 5.4, '#2a120a', 1.4) +
        CG(peppercorns(c, 5, 16, 20, 44, 17, 26, 2.1) + C(26, 20, 1.6, '#c82a1a', 0.8) + C(39, 21, 1.4, '#e8a020', 0.8), c.clip('M18,22 A14,5.4 0 1 0 46,22 A14,5.4 0 1 0 18,22 Z M18,22 L46,22 L46,12 L18,12 Z')) +
        S('M18,34 C24,37 40,37 46,34', OL, 4.4) + S('M18,34 C24,37 40,37 46,34', '#e8d0a0', 2.2) +
        S2('M32,36 C30,40 26,42 24,44 M32,36 C34,40 38,41 40,44', '#e8d0a0', 1.2) +
        peppercorns(c, 9, 4, 48, 56, 50, 56, 1.8) + peppercorns(c, 13, 2, 8, 14, 52, 56, 1.6));
    },

    /* ---------- cooked dishes (plain) ---------- */
    /* two little grilled fish side by side on a plate, a lemon wedge */
    grilled_minnow: function (c) {
      var ck = { L: -20, T: 12, px: -5, hu: 6.4, hd: 5.6, ped: 2.2, tail: 'fork', tw: 9, th: 6.8, back: '#9a5a22', belly: '#e8b060', fin: '#7a3a14', fins: [[-5, 4, 5, -1], [3, 9, 3.6, 1]],
        eye: [-14, -1.2, 2.2, '#f0e8d8'], pec: false, pat: function () { return S('M-14,-6 L-10,6 M-8,-7 L-4,7 M-2,-7 L2,7 M4,-6 L8,6', '#3a1806', 1.6, 0.8); } };
      return item(c, plate(c, 32, 40, 26, 13, '#e8dcc4') + G(fish(c, ck), tr(30, 36, 6, 0.9)) + G(fish(c, ck), tr(34, 45, 6, 0.9)) + lemon(c, 48, 32, -30, 0.9));
    },
    /* a browned roast on a pewter plate, two pink slices cut off, a herb sprig */
    roast_lean_meat: function (c) {
      var roast = 'M14,36 C12,26 22,18 34,19 C46,20 52,28 50,36 C48,42 40,44 32,44 C22,44 15,42 14,36 Z';
      return item(c, plate(c, 32, 42, 27, 12, '#a8adb4') +
        P(roast, c.lg(['#c87a3a', '#8a4416', '#5a280c'], 0.2, 0, 0.8, 1), 2.4) +
        CG(S('M20,26 C24,23 28,24 30,22 M36,22 C40,24 44,25 46,28 M18,34 C22,32 26,34 30,31', '#4a1e06', 1.4, 0.8) + S('M18,28 C22,22 30,20 36,21', '#f0b070', 1.6, 0.6), c.clip(roast)) +
        P('M38,36 C42,30 50,30 52,36 C52,40 46,44 40,42 C38,41 37,38 38,36 Z', c.rg([[0, '#ffc0b0'], [0.7, '#e88a80'], [1, '#a85030']], 0.5, 0.5, 0.6), 2) +
        S('M38,36 C42,30 50,30 52,36', '#8a4416', 2.4) +
        P('M42,44 C46,39 54,40 55,45 C55,49 49,52 44,50 C42,49 41,46 42,44 Z', c.rg([[0, '#ffc0b0'], [0.7, '#e88a80'], [1, '#a85030']], 0.5, 0.5, 0.6), 2) +
        S('M42,44 C46,39 54,40 55,45', '#8a4416', 2.4) +
        sprig(c, 18, 44, -20, 1));
    },
    /* an earthenware bowl of orange-brown fish stew with fish chunks and a carrot coin, steaming */
    carp_stew: function (c) {
      return item(c, bowl(c, 32, 30, 23, 7.5, 24, '#a0582e', c.lg(['#e8963a', '#b8641e'], 0, 0, 0, 1),
        chunk(c, 24, 29, 4.6, '#f4e4c0', 3) + chunk(c, 38, 31, 4.2, '#f0dcb4', 5) + C(31, 27, 2.6, c.cel('#f08a2a'), 1.2) + C(43, 27.4, 2, c.cel('#f08a2a'), 1.1) +
        C(18, 31, 1.4, '#ffd890', 0, 0.8) + C(33, 33, 1.1, '#ffd890', 0, 0.8) + C(28, 33, 1, '#5aa040', 0)) +
        steam(24, 22, 0.85, 0.5) + steam(36, 21, 1, 0.55));
    },
    /* a trout pan-fried golden in a small iron pan, a lemon slice */
    pan_fried_trout: function (c) {
      var ck = { L: -24, T: 14, px: -4, hu: 8.6, hd: 8, ped: 3.4, tail: 'square', tw: 9.5, th: 8.4, back: '#a8641e', belly: '#f0c068', fin: '#8a4a18', fins: [[-6, 4, 6, -1], [-1, 5, 4.5, 1]],
        eye: [-17, -2, 2.2, '#f0e8d8'], pec: false, pat: function () { return dots(31, 14, -16, 14, -8, -1, 0.6, 1, '#4a2208', 0.7) + S('M-12,4 C-4,6 4,6 12,3', '#ffe0a0', 1.4, 0.5); } };
      return item(c, shadow(30, 54, 24) +
        G(R(-3, -1, 6, 26, c.lg(['#5a5a62', '#2a2a30'], 0, 0, 1, 0), 2, null, 2.6) + R(-2, 12, 4, 13, c.cel('#7a4a24'), 1.4, null, 1.6), tr(48, 44, -55)) +
        E(30, 41, 25, 13, c.lg(['#5a5a64', '#26262c'], 0, 0, 0, 1), 2.4) + E(30, 40, 21, 10, c.lg(['#18181c', '#3a3a42'], 0, 0, 0, 1), 1.4) +
        G(fish(c, ck), tr(30, 39, 4, 0.82)) + C(18, 44, 1.2, '#ffe0a0', 0, 0.8) + C(42, 46, 1, '#ffe0a0', 0, 0.8) +
        G(C(0, 0, 5.2, c.cel('#f4d430'), 1.4) + C(0, 0, 3.8, '#fff6b0', 0) + S('M0,-3.6 L0,3.6 M-3.1,-1.8 L3.1,1.8 M-3.1,1.8 L3.1,-1.8', '#e8c020', 0.8), tr(42, 33, 0, 0.9)));
    },
    /* browned meat cubes and green pepper on a wooden skewer */
    meat_skewer: function (c) {
      var cube = function (col, seed) { return function (x, y) { return G(chunk(c, 0, 0, 7.4, col, seed, 2) + S('M-3,-4 L3,4 M-6,-1 L-1,5', '#2a1206', 1.4, 0.75), tr(x, y, 0)); }; };
      var pep = function (x, y) { return G(P('M-4,-5 C0,-7 5,-4 5,0 C5,4 0,6 -4,4 C-2,1 -2,-2 -4,-5 Z', c.cel('#4aa038'), 1.6), tr(x, y, -45)); };
      return item(c, shadow(32, 56, 22) + skewer(c, 10, 56, 54, 10, [at(0.2, cube('#8a4418', 3)), at(0.36, pep), at(0.5, cube('#9a5020', 7)), at(0.64, pep), at(0.79, cube('#844016', 11))]) +
        S('M6,60 L11,55', '#c8a070', 1.6));
    },
    /* a white bowl of creamy chowder with potato cubes, fish and green herb flecks, steaming */
    perch_chowder: function (c) {
      var cube = function (x, y) { return P(D`M${x - 2.6},${y - 2} L${x + 2.6},${y - 2.6} L${x + 3},${y + 2} L${x - 2.4},${y + 2.6} Z`, c.cel('#f4dc8a'), 1.1); };
      return item(c, bowl(c, 32, 30, 23, 7.5, 24, '#dcd8d0', c.rg([[0, '#fffaec'], [1, '#e8d4a0']], 0.5, 0.4, 0.6),
        cube(23, 29) + cube(40, 30) + cube(33, 32.4) + chunk(c, 30, 27.4, 3.4, '#ffffff', 9) + chunk(c, 16, 30, 2.6, '#f8f4ea', 13) +
        C(27, 32, 0.9, '#3a8a2a', 0) + C(36, 27, 0.9, '#3a8a2a', 0) + C(45, 31, 0.8, '#3a8a2a', 0) + C(20, 27.4, 0.8, '#3a8a2a', 0) + C(31, 30, 0.7, '#e86a2a', 0)) +
        steam(26, 22, 0.85, 0.5) + steam(38, 21, 1, 0.55));
    },
    /* white fish chunks with red skin and lemon on a wooden skewer */
    saltfin_skewer: function (c) {
      var piece = function (x, y) { return G(P('M-7,-6 L7,-6 L7,6 L-7,6 Z', c.lg(['#ffffff', '#f4e8d8', '#d8c4a8'], 0, 0, 0, 1), 1.8) + P('M-7,-6 L7,-6 L7,-2.6 L-7,-2.6 Z', c.cel('#d83a2e'), 1.4) + S('M-2,-1 C-3,1 -2,3 -1,4.4 M2.4,-1 C1.4,1 2.4,3 3,4.4', '#c8b090', 0.9, 0.8), tr(x, y, -45)); };
      return item(c, shadow(32, 56, 22) + skewer(c, 54, 56, 10, 10, [at(0.2, piece), at(0.42, piece), at(0.62, function (x, y) { return lemon(c, x, y - 2, -45, 0.85); }), at(0.8, piece)]) +
        S('M58,60 L53,55', '#c8a070', 1.6));
    },
    /* a golden-amber smoked fillet on a wooden plank, grey smoke curling up */
    smoked_cod: function (c) {
      var plank = 'M6,40 L46,28 L58,36 L18,50 Z';
      return item(c, shadow(32, 55, 25) + P('M18,50 L58,36 L58,40 L18,54 Z', '#5a3418', 2) + P('M6,40 L18,50 L18,54 L6,44 Z', '#4a2a12', 2) +
        P(plank, c.lg(['#c08a50', '#8a5a30'], 0, 0, 1, 1), 2) + CG(S('M10,41 L50,30 M14,45 L54,33', '#5a3418', 1, 0.6), c.clip(plank)) +
        G(fillet(c, '#d08a3a', '#7a3a14', S('M-19,0 C-8,4 8,4 21,0', '#5a2808', 6, 0.35), '#8a4a1a'), tr(30, 37, -18, 0.98)) +
        S('M22,26 C18,20 26,16 22,10 M34,22 C30,16 38,12 34,6', '#c8c8cc', 2.4, 0.55) + S('M44,24 C42,20 46,18 44,14', '#c8c8cc', 1.8, 0.45));
    },

    /* ---------- cooked dishes (buff) ---------- */
    /* a pike fillet dusted with red spice on a plate, a red chilli beside it */
    spiced_pike: function (c) {
      return buff(c, plate(c, 32, 40, 27, 13, '#e0d4bc') +
        G(fillet(c, '#e0a048', '#4a6a28', dots(17, 22, -18, 18, -6, 5, 0.5, 0.9, '#c8200e', 0.95) + dots(19, 8, -16, 16, -5, 4, 0.4, 0.7, '#3a1a08', 0.8), '#9a6a2a'), tr(28, 38, -10, 1.04)) +
        G(P('M0,0 C6,-2 14,0 20,6 C14,4 6,4 0,4 Z', c.cel('#e0281a'), 1.6) + P('M0,0 C-3,0 -4,2 -3,4 L0,4 Z', c.cel('#4a8a2a'), 1.2), tr(30, 47, 6, 1)));
    },
    /* a pearly glimmerscale fillet on a fine gold-rimmed plate with sauce and a leaf, a soft glow and sparkles */
    glimmerscale_supper: function (c) {
      return buff(c, plate(c, 32, 40, 27, 13, '#f4f0ec', '#d6a53c') +
        E(32, 42, 15, 5, '#c8784a', 0, 0.55) + E(32, 42, 12, 3.6, '#e8a060', 0, 0.6) +
        G(fillet(c, '#f0e8f8', null, R(-22, -10, 44, 20, c.lg([[0, '#ff9ad0', 0.45], [0.35, '#ffe890', 0.4], [0.65, '#9af0d8', 0.4], [1, '#9ab8ff', 0.45]], 0, 0, 1, 1), 0), '#e0d0f0'), tr(30, 38, -8, 0.88)) +
        blade(c, 46, 36, 60, 0.36, '#5aa040') + blade(c, 46, 36, 100, 0.3, '#4a9038') + C(45, 36, 1.6, '#e83a3a', 0.8) +
        sparkle(18, 22, 3.6, '#ffffff') + sparkle(46, 18, 2.8, '#fff0ff') + sparkle(54, 28, 2, '#e0f8ff'), '#ffe0b0');
    },
    /* a rustic wooden bowl of dark meaty stew with carrot and a wooden spoon */
    hunters_stew: function (c) {
      var bw = '#7a4a24';
      return buff(c, G(P('M-1.8,0 L1.8,0 L1.4,-22 C1.4,-25 -1.4,-25 -1.4,-22 Z', c.cel('#c8925a'), 1.5), tr(42, 30, 28)) +
        bowl(c, 32, 30, 24, 8, 23, bw, c.lg(['#8a4a1e', '#5a2a0e'], 0, 0, 0, 1),
          chunk(c, 22, 29, 4.4, '#5a2a12', 3, 1.4) + chunk(c, 35, 31.4, 4.6, '#6a3014', 7, 1.4) + chunk(c, 44, 28, 3.2, '#5a2a12', 11, 1.2) +
          P('M27,26 L33,25 L33,28 L27,29 Z', c.cel('#f08a2a'), 1.1) + C(41, 33, 2, c.cel('#f08a2a'), 1) + C(29, 32.4, 1.6, '#e8d8a0', 0.9) +
          C(18, 31, 0.9, '#5aa040', 0) + C(38, 26.6, 0.9, '#5aa040', 0)) +
        CG(S('M8,38 C20,44 44,44 56,38 M10,46 C22,52 42,52 54,46', '#3a2210', 1.4, 0.8), c.clip('M8,30 C8,50 20,53 32,53 C44,53 56,50 56,30 Z')) +
        steam(26, 21, 0.8, 0.45));
    },
    /* a dark clay bowl of near-black gumbo with okra rings and catfish pieces */
    catfish_gumbo: function (c) {
      var okra = function (x, y, r) { return C(x, y, r, c.cel('#5a9a30'), 1.1) + C(x, y, r * 0.55, '#c8e090', 0) + C(x, y - r * 0.28, 0.5, '#4a6a20', 0) + C(x + r * 0.26, y + r * 0.16, 0.5, '#4a6a20', 0) + C(x - r * 0.26, y + r * 0.16, 0.5, '#4a6a20', 0); };
      return buff(c, bowl(c, 32, 30, 23, 7.5, 24, '#4a3228', c.lg(['#6a3a14', '#3a1c08'], 0, 0, 0, 1),
        okra(22, 29, 3) + okra(38, 32, 2.8) + okra(44, 27.6, 2.2) + chunk(c, 30, 29, 3.6, '#e8d8c0', 5) + chunk(c, 16, 31, 2.4, '#d8c8b0', 9) +
        C(33, 26.4, 1.4, '#e8402a', 0.8) + C(26, 32.4, 1.1, '#e8402a', 0.8) + S('M18,27 C24,25 30,25 36,26', '#c87a3a', 1, 0.5)) +
        steam(28, 21, 0.85, 0.45), '#ff8a3a');
    },
    /* a baked lantern eel coiled in a terracotta dish, its lure still glowing */
    baked_lantern_eel: function (c) {
      var front = 'M4,36 C4,49 16,55 32,55 C48,55 60,49 60,36 C58,42 46,46 32,46 C18,46 6,42 4,36 Z';
      return buff(c, shadow(32, 58, 26) +
        P('M0,34 C0,30 4,30 6,32 L6,38 C3,39 0,37 0,34 Z M64,34 C64,30 60,30 58,32 L58,38 C61,39 64,37 64,34 Z', c.cel('#b0603a'), 1.8) +
        E(32, 36, 28, 10, c.lg(['#e8a070', '#b0603a'], 0, 0, 0, 1), 2.4) + E(32, 36.6, 24.6, 7.6, c.lg(['#4a1c08', '#7a3414'], 0, 0, 0, 1), 1.2) +
        CG(E(32, 38, 22, 6, '#c86a20', 0, 0.6) + lanternEel(c, true, [[11, 36], [24, 22], [40, 48], [55, 30]], 0.72), c.clip('M0,0 L64,0 L64,40 C50,45 14,45 0,40 Z')) +
        P(front, c.lg(['#d0804a', '#a0502a', '#6a2c14'], 0, 0, 1, 0.3), 2.4) + S('M9,44 C14,50 22,52 28,52.6', '#ffffff', 1.4, 0.35), '#ffc060');
    },
    /* a peppered seared steak on a wooden board, peppercorns scattered */
    peppered_steak: function (c) {
      var board = 'M4,40 C4,34 10,30 18,30 L50,26 C56,26 60,30 60,36 C60,42 56,46 50,46 L18,50 C10,50 4,46 4,40 Z';
      var st = 'M12,34 C12,26 22,22 32,22.6 C44,23 52,28 50,35 C49,40 44,41 38,42 C33,43 31,46 24,46 C16,46 12,41 12,34 Z';
      return buff(c, shadow(32, 56, 27) + extrude(board, 4, '#6a3c1c') + P(board, c.lg(['#c08850', '#8a5a2e'], 0, 0, 1, 1), 2.2) +
        CG(S('M6,38 L58,32 M6,44 L58,38', '#6a3c1c', 1, 0.5), c.clip(board)) + C(56, 34, 1.6, '#3a2010', 0) +
        slab(c, st, 4.4, c.lg(['#9a5028', '#6a2e12', '#4a1e0a'], 0.2, 0, 0.8, 1), '#3a1608',
          G(grill(0, 45, 7, '#1e0a02', 2), 'translate(32,34)') + peppercorns(c, 21, 18, 14, 48, 25, 43, 1.2) + S('M15,30 C19,25 26,23.4 32,23.6', '#e8a060', 1.2, 0.5)) +
        peppercorns(c, 23, 5, 46, 58, 38, 44, 1.4) + peppercorns(c, 29, 2, 6, 12, 40, 46, 1.3), '#ff9a40');
    },
    /* a big iron pot-bowl of red seafood stew: fish, mussels, a crab claw, steam */
    seafarers_stew: function (c) {
      var mussel = function (x, y, a) { return G(P('M0,-4 C4,-4 7,-1 7,1 C4,3 -4,3 -6,1 C-6,-2 -3,-4 0,-4 Z', c.lg(['#4a5a8a', '#1a2040'], 0, 0, 0, 1), 1.2) + E(0, 0.6, 3.6, 1.2, '#f0a060', 0, 0.9), tr(x, y, a)); };
      return buff(c, S2('M5,30 C1,30 1,36 6,37', '#3a3a42', 2) + S2('M59,30 C63,30 63,36 58,37', '#3a3a42', 2) +
        bowl(c, 32, 28, 27, 8.5, 26, '#3c3c46', c.lg(['#e86a3a', '#b03a1a'], 0, 0, 0, 1),
          chunk(c, 22, 27, 4.4, '#f4e4c8', 3) + chunk(c, 38, 30, 4, '#f0dcc0', 7) + mussel(30, 25, -10) + mussel(46, 28, 20) + mussel(14, 30, -20) +
          C(30, 31.6, 1.6, '#5aa040', 0) + C(44, 33, 1.2, '#ffd890', 0, 0.8), false) +
        G(P('M0,0 C-2,-6 0,-12 5,-14 C4,-10 6,-8 9,-8 C8,-4 4,0 0,0 Z', c.cel('#e8502a'), 1.6) + S('M5,-14 L6,-9', OL, 1.2), tr(40, 26, 10)) +
        steam(20, 20, 0.9, 0.5) + steam(32, 18, 1.05, 0.55), '#ffa040');
    },
    /* a thick seared tuna steak, pink in the middle, grill-marked, on a slate with a blue spark */
    stormback_tuna_steak: function (c) {
      var slate = 'M6,42 L44,30 L60,38 L22,52 Z';
      var st = 'M14,34 C14,26 24,22 34,22 C44,22 52,27 51,34 C50,40 42,44 32,44 C22,44 14,41 14,34 Z';
      return buff(c, shadow(32, 56, 26) + extrude(slate, 3.4, '#22242a') + P(slate, c.lg(['#5a5e68', '#34363e'], 0, 0, 1, 1), 2) +
        slab(c, st, 7, c.rg([[0, '#ff98a4'], [0.6, '#e44a60'], [1, '#c0304a']], 0.5, 0.5, 0.55), '#6a4436',
          S(st, '#8a5a48', 6.4) + S(st, '#b88068', 1.2, 0.8) +
          S('M19,30 C23,36 27,36 32,30.6 C37,36 41,36 46,30 M21,37 C25,41 29,41 32,37.4 C35,41 39,41 43,37', '#ffc8d0', 1.2, 0.75) +
          G(grill(0, 50, 11, '#2a1206', 2.2, 1), 'translate(32,33)') + S('M19,29 C23,25.4 28,24.4 34,24.6', '#ffffff', 1.2, 0.45)) +
        S('M14,36 C16,40 22,44 30,45 M50,36 C49,40 44,43 38,44.6', '#ffb0b8', 1.4, 0.5) + sprig(c, 50, 46, 30, 0.8) +
        S('M52,12 L48,18 L52,18 L47,25', '#0a1a30', 3.2) + S('M52,12 L48,18 L52,18 L47,25', '#5ac8ff', 1.6), '#ff9a50');
    },
    /* a feast platter: a purple-glinting duskglass fillet, grapes and herbs on a silver platter (rare) */
    duskglass_feast: function (c) {
      var grapes = function (x, y) {
        var o = '';
        [[0, 0], [4, 0.4], [2, 3.4], [6, 3.6], [4, 7], [-2, 3.2]].forEach(function (p) { o += C(x + p[0], y + p[1], 2.4, c.rg([[0, '#d8a8ff'], [1, '#5a2a8a']], 0.35, 0.35, 0.7), 1.1); });
        return o;
      };
      return iconWrap(c, ITEM_BG, glow(c, 32, 34, 30, '#c890ff', 0.45) + glow(c, 32, 40, 22, WARM, 0.3) +
        plate(c, 32, 40, 29, 14, '#c8ccd4', '#d6a53c') +
        grapes(12, 34) + sprig(c, 50, 46, 40, 1) + lemon(c, 52, 34, -20, 0.8) +
        G(fillet(c, '#c8a0e8', '#5a3a8a', R(-22, -10, 44, 20, c.lg([[0, '#ffffff', 0.35], [0.5, '#c890ff', 0.2], [1, '#ffffff', 0.35]], 0, 0, 1, 1), 0) + dots(43, 8, -16, 16, -5, 4, 0.5, 0.9, '#ffffff', 0.9), '#8a5ac8'), tr(30, 38, -6, 1.0)) +
        sparkle(22, 30, 3.4, '#ffffff') + sparkle(44, 34, 2.6, '#f0e0ff') + sparkle(48, 14, 3.4, '#f0e0ff') + sparkle(14, 18, 2.4, '#ffffff'));
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
