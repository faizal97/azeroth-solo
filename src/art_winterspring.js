/* art_winterspring.js — Winterspring zone art for Azeroth Solo (contested, levels 57-60: the goblin trading town of
 * Everlook, Frostsaber Rock, Winterfall Village, Lake Kel'Theril and the Starfall ruins, the Ice Thistle Hills,
 * Frostwhisper Gorge and the blue-dragon caverns of Mazthoril; Winterfall furbolgs, frostsabers, Ice Thistle yetis,
 * Chillwind chimaera, Highborne apparitions, Cobalt scalebanes, Grizzle Snowpaw and the elite Rak'shiri).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Winterspring keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, blade/pauldron and the crystal/cave pieces are shared copies of art_maraudon.js; the props,
 * flag and goblin rig are copies of art_tanaris.js; the furbolg rig and totem staff are copies of art_ashenvale.js.
 * The snow pieces (peaks, pines, drifts, icicles, aurora, crag, gorge walls, frozen lake, highborne ruins, hide huts,
 * ice thistles, dragon-scale panels and runes), the sabercat, knuckle-walking yeti, chimaera, dragonspawn and
 * Highborne ghost bodies are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix ws<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
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
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids, defs) ----------
  function Ctx() { this.p = 'ws' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
  Ctx.prototype.id = function () { return this.p + (this.k++).toString(36); };
  Ctx.prototype.cel = function (c) {
    var key = 'c' + c; if (this.cache[key]) return this.cache[key];
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="' + lt(c, 0.3) + '"/><stop offset="0.4" stop-color="' + c + '"/><stop offset="0.72" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.38) + '"/></linearGradient>');
    return (this.cache[key] = 'url(#' + id + ')');
  };
  Ctx.prototype.lg = function (stops, x1, y1, x2, y2) {
    var id = this.id();
    this.defs.push('<linearGradient id="' + id + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stopsS(stops) + '</linearGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.rg = function (stops) {
    var id = this.id();
    this.defs.push('<radialGradient id="' + id + '" cx="0.5" cy="0.5" r="0.5">' + stopsS(stops) + '</radialGradient>');
    return 'url(#' + id + ')';
  };
  Ctx.prototype.clip = function (d) { var id = this.id(); this.defs.push('<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'); return id; };
  Ctx.prototype.svg = function (w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      (this.defs.length ? '<defs>' + this.defs.join('') + '</defs>' : '') + body + '</svg>';
  };
  function stopsS(st) {
    return st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  function glow(c, col, a) { return c.rg([[0, col, a == null ? 0.6 : a], [0.35, col, (a == null ? 0.6 : a) * 0.4], [1, col, 0]]); }

  // ---------- primitives ----------
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
  function at(s, x, y) { return 'matrix(' + n(s * 1000) / 1000 + ',0,0,' + n(s * 1000) / 1000 + ',' + n(x - x * s) + ',' + n(y - y * s) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function body(c, d, col, shade, sw) {
    var s = P(d, c.cel(col), sw == null ? 2.5 : sw);
    if (shade) s += '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>';
    return s;
  }
  function shadow(c, cx, rx) { return E(cx, 122.5, rx, 8, c.rg([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]])); }
  function flame(c, x, y, s, outer, inner) {
    var o = outer || '#ff7a1a', i = inner || '#ffd84a';
    return P('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y]) + ' ' + pt([x - 9 * s, y - 9 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 1 * s, y - 9 * s]) + ' ' + pt([x, y - 20 * s]) +
      'C' + pt([x + 4 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 14 * s]) + ' ' + pt([x + 5 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 9 * s]) + ' ' + pt([x + 8 * s, y]) + ' ' + pt([x, y]) + 'Z', o, 1.6 * Math.max(0.7, s)) +
      F('M' + pt([x, y - 1 * s]) + 'C' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 1 * s, y - 11 * s]) + 'C' + pt([x, y - 7 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 10 * s]) + 'C' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 4 * s, y - 1 * s]) + ' ' + pt([x, y - 1 * s]) + 'Z', i);
  }
  function orb(c, x, y, r, col) { return C(x, y, r * 2.6, glow(c, col, 0.75)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.5, lt(col, 0.4)], [1, col]]), 1.6); }
  function gEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // shaggy blob outline: points alternate between an outer and an inner ellipse, joined by soft curves
  function shag(cx, cy, rx, ry, k, jag, seed, a0) {
    var r = rng(seed || 7), d = '', pts = [];
    a0 = a0 || 0;
    for (var i = 0; i < k * 2; i++) {
      var a = a0 + PI * 2 * i / (k * 2), f = i % 2 ? 1 - jag * (0.7 + r() * 0.5) : 1 + jag * r() * 0.3;
      pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
    }
    d = 'M' + pt(pts[0]);
    for (var j = 1; j <= pts.length; j++) { var p = pts[j % pts.length], q = pts[j - 1]; d += 'Q' + pt([(p[0] + q[0]) / 2 + (r() - 0.5) * 2, (p[1] + q[1]) / 2 + (r() - 0.5) * 2]) + ' ' + pt(p); }
    return d + 'Z';
  }
  // point helper along a direction: u along ang, v perpendicular
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function haft(c, p, len, ang, col, w, back) { var q = dirQ(p, ang), d = 'M' + pt(q(-(back == null ? 10 : back), 0)) + 'L' + pt(q(len, 0)); return limb(d, col || '#6a4428', w || 3.4) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }


  // ============================================================
  //  SCENE PIECES (shared house style, copies of art_scarlet.js)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  function pebbles(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), s = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < (cnt || 14); i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
  // ---- ribbons (shared copy of art_ashenvale.js) ----
  function lerp2(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
  // Catmull-Rom sampling through control points
  function spline(pts, k) {
    var out = [], i, j; k = k || 6;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      for (j = 0; j < k; j++) {
        var t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (a) { return 0.5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3); }));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // tapered ribbon along a smooth curve (tails, necks, tentacles, horns); side a is the left of the travel direction
  function taper(pts, w0, w1, k) {
    var s = spline(pts, k), A = [], B = [], m = s.length;
    for (var i = 0; i < m; i++) {
      var a = s[Math.max(0, i - 1)], b = s[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, t = i / (m - 1), w = (w0 + (w1 - w0) * t) / 2;
      A.push([s[i][0] - dy / d * w, s[i][1] + dx / d * w]); B.push([s[i][0] + dy / d * w, s[i][1] - dx / d * w]);
    }
    return { d: pd(A.concat(B.slice().reverse()), true), a: A, b: B, s: s };
  }
  function bands(T, every, from) { var d = ''; for (var i = from || 2; i < T.s.length - 1; i += every) d += 'M' + pt(T.a[i]) + 'L' + pt(T.b[i]); return d; }
  function along(T, f) { var p = []; for (var i = 0; i < T.s.length; i++) p.push(lerp2(T.a[i], T.b[i], f)); return 'M' + p.map(pt).join('L'); }
  function ribbonBand(T, f0, f1) { var P0 = [], P1 = []; for (var i = 0; i < T.s.length; i++) { P0.push(lerp2(T.a[i], T.b[i], f0)); P1.push(lerp2(T.a[i], T.b[i], f1)); } return pd(P0.concat(P1.reverse()), true); }
  // ---- biped rig (facing left; shared copy of art_ashenvale.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function bearPaw(x, y, col) {
    return P('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 9, y - 1]) + ' ' + pt([x + 7, y + 1.5]) + ' ' + pt([x + 2, y + 1.5]) + 'L' + pt([x - 9, y + 1.5]) + 'C' + pt([x - 12, y + 1.5]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 7, y - 6]) + 'Z', col, 2) +
      L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', OL, 3) + L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', '#efe6cf', 1.3);
  }
  function clawHand(p, col, k, clawCol) {
    k = k || 1;
    var d = 'M' + pt([p[0] - 3 * k, p[1] + 2 * k]) + 'q' + n(-5 * k) + ',' + n(2 * k) + ' ' + n(-6 * k) + ',' + n(7 * k) + 'M' + pt([p[0] - 1 * k, p[1] + 4 * k]) + 'q' + n(-3 * k) + ',' + n(3 * k) + ' ' + n(-3 * k) + ',' + n(8 * k) + 'M' + pt([p[0] + 2 * k, p[1] + 4 * k]) + 'q' + n(-1 * k) + ',' + n(4 * k) + ' ' + n(0) + ',' + n(8 * k);
    return C(p[0], p[1], 5 * k, c_(col), 2) + L(d, OL, 3.6 * k) + L(d, clawCol || '#f0e8d8', 1.6 * k);
  }
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    if (o.shadow !== false) s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.forearm || sleeve, armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86, toe = o.feet || boot;
    if (!o.noLegs) {
      var kneeF = o.digi ? 'M68,' + hipY + ' L77,100 L71,112 L74,116' : 'M68,' + hipY + ' L71,103 L72,113';
      var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
      if (o.legF) kneeF = o.legF; if (o.legN) kneeN = o.legN;
      var fF = o.footF || [73, 121], fN = o.footN || [52, 121];
      s += limb(kneeF, dk(pants, 0.18), legW) + toe(fF[0], fF[1], o.boots || dk(pants, 0.3));
      s += limb(kneeN, pants, legW) + toe(fN[0], fN[1], o.boots || dk(pants, 0.3));
      if (o.shins) s += o.shins(c);
    }
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L96,40 L96,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#b9b1a0', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 3, hy + 8, 10, 8, c.cel(o.neckCol || sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.forearm || sleeve, armW - 1);
    s += (o.nearHand ? o.nearHand(c, near[near.length - 1]) : hand(near[near.length - 1], c.cel(o.glove || sk)));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf, o.op) : (o.op != null ? G(s, '', o.op) : s);
  }
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  // ---- weapons and cave pieces (shared copies of art_maraudon.js) ----
  function blade(c, p, len, ang, w, col, grip) {
    var q = dirQ(p, ang); col = col || '#d0d6de'; w = w || 3.2;
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(3, 0)), grip || '#5a2a1a', 3.4) + C(q(-11, 0)[0], q(-11, 0)[1], 2.6, c.cel(GOLD), 1.1);
    var g = 'M' + pt(q(3, -w * 2.2)) + 'L' + pt(q(3, w * 2.2));
    o += L(g, OL, 5.4) + L(g, GOLD, 3.2);
    o += P(pd([q(5, -w), q(len - w * 2, -w), q(len, 0), q(len - w * 2, w), q(5, w)], true), c.cel(col), 1.6) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - w * 2.6, 0)), dk(col, 0.3), 1) + L('M' + pt(q(8, -w * 0.55)) + 'L' + pt(q(len - w * 2.6, -w * 0.55)), '#ffffff', 0.9, 0.75);
    return o;
  }
  function pauldron(c, x, y, r, col, trim) {
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  // one crystal prism growing from (x, y) along ang; light from the upper left
  function crystal(c, x, y, h, w, ang, col) {
    var q = dirQ([x, y], ang), hw = w / 2;
    var d = pd([q(-2, -hw), q(h * 0.76, -hw), q(h, 0), q(h * 0.76, hw), q(-2, hw)], true);
    return F(d, c.cel(col)) + F(pd([q(-2, 0), q(h, 0), q(h * 0.76, hw), q(-2, hw)], true), dk(col, 0.3)) +
      F(pd([q(0, -hw * 0.72), q(h * 0.7, -hw * 0.72), q(h * 0.9, -hw * 0.2), q(0, -hw * 0.34)], true), lt(col, 0.5), 0.85) + L(d, OL, Math.max(1, Math.min(2, w * 0.2)));
  }
  // a clump of prisms; down=true hangs it from a ceiling
  function cluster(c, x, y, s, col, seed, o) {
    o = o || {};
    var r = rng(seed || 3), base = o.down ? PI / 2 : -PI / 2, k = o.down ? 1 : -1, out = '';
    if (o.glow !== 0) out += C(x, y + k * 14 * s, 36 * s, glow(c, lt(col, 0.2), o.glow == null ? 0.5 : o.glow));
    if (!o.down) out += E(x, y + 1, 20 * s, 4 * s, '#000', 0, 0.3);
    var list = [];
    for (var i = 0; i < 5; i++) { var t = i / 4 - 0.5; list.push({ a: base - k * t * 1.2 + (r() - 0.5) * 0.25, h: (20 + r() * 12) * s * (1 - Math.abs(t) * 0.9), w: (7 + r() * 3) * s * (1 - Math.abs(t) * 0.45), dx: t * 18 * s, c: i % 2 ? dk(col, 0.1) : col }); }
    [0, 4, 1, 3, 2].forEach(function (i) { var q = list[i]; out += crystal(c, x + q.dx, y, q.h, q.w, q.a, q.c); });
    out += crystal(c, x - 8 * s, y + k * -2 * s, 9 * s, 5 * s, base - k * 0.95, lt(col, 0.12)) + crystal(c, x + 9 * s, y + k * -2 * s, 8 * s, 4.6 * s, base + k * 0.95, col);
    return out;
  }
  function stalac(c, x, y, len, w, col, up) {
    var k = up ? -1 : 1;
    var d = 'M' + pt([x - w / 2, y]) + 'Q' + pt([x - w * 0.2, y + k * len * 0.5]) + ' ' + pt([x + w * 0.05, y + k * len]) + 'Q' + pt([x + w * 0.25, y + k * len * 0.45]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F(pd([[x + w * 0.1, y - k * 2], [x + w, y - k * 2], [x + w, y + k * len], [x + w * 0.1, y + k * len]], true), dk(col, 0.3), 0.8), 1.5);
  }
  // jagged ceiling hanging from the top, the mirror of hills()
  function ceiling(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base + amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, -10]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], -10]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function stalacRow(c, seed, xs, y, col, lenMin, lenMax, up) {
    var r = rng(seed), o = '';
    xs.forEach(function (x) { o += stalac(c, x + (r() - 0.5) * 8, y + (r() - 0.5) * 4, lenMin + r() * (lenMax - lenMin), 8 + r() * 7, col, up); });
    return o;
  }
  // cave floor: gradient, flat slabs, cracks, a dark lip where it meets the wall
  function caveFloor(c, y, top, bot, seed) {
    var r = rng(seed || 8), o = ground(c, y, top, bot), cr = '';
    for (var i = 0; i < 9; i++) {
      var yy = y + 8 + r() * (236 - y), t = (yy - y) / (240 - y), w = 14 + t * 40;
      o += E(r() * 400, yy, w, w * 0.16, r() < 0.5 ? lt(top, 0.1) : dk(bot, 0.1), 0, 0.55);
    }
    for (var j = 0; j < 7; j++) { var x = r() * 400, yc = y + 10 + r() * (220 - y); cr += 'M' + pt([x, yc]) + 'l' + n(8 + r() * 10) + ',' + n(2 + r() * 3) + 'l' + n(6 + r() * 8) + ',' + n(-1 - r() * 2); }
    return o + L(cr, dk(bot, 0.4), 1.1, 0.7) + R(0, y - 2, 400, 10, c.lg([[0, '#000', 0.45], [1, '#000', 0]]));
  }
  function boulder(c, cx, cy, rx, ry, col, seed, o) {
    o = o || {};
    var r = rng(seed || 5), pts = [], k = o.k || 9;
    for (var i = 0; i < k; i++) { var a = -PI / 2 + PI * 2 * i / k + (r() - 0.5) * 0.3, f = 0.88 + r() * 0.14; pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]); }
    var d = pd(pts, true);
    var sh = F(pd([[cx + rx * 0.25, cy - ry * 1.3], [cx + rx * 1.3, cy - ry * 1.3], [cx + rx * 1.3, cy + ry * 1.3], [cx - rx * 1.3, cy + ry * 1.3], [cx - rx * 1.3, cy + ry * 0.55], [cx + rx * 0.15, cy + ry * 0.3]], true), dk(col, 0.28), 0.85);
    var hl = F(pd([[cx - rx * 0.62, cy - ry * 0.5], [cx - rx * 0.12, cy - ry * 0.78], [cx + rx * 0.02, cy - ry * 0.5], [cx - rx * 0.44, cy - ry * 0.22]], true), lt(col, 0.22), 0.8);
    var fc = L('M' + pt(pts[1]) + 'L' + pt([cx + rx * 0.15, cy + ry * 0.3]) + 'L' + pt(pts[Math.floor(k / 2) + 1]) + 'M' + pt([cx + rx * 0.15, cy + ry * 0.3]) + 'L' + pt(pts[k - 2]), dk(col, 0.42), Math.max(0.8, Math.min(1.4, rx * 0.08)), 0.8);
    return body(c, d, col, sh + hl + fc + (o.inner ? o.inner : ''), o.sw || Math.max(1.4, Math.min(2.4, rx * 0.16)));
  }
  function crack(d, col, w) { w = w || 1.6; return L(d, OL, w + 1.8) + L(d, col, w) + L(d, '#ffffff', w * 0.35, 0.6); }
  // ---- props, goblins and furbolgs (shared copies of art_tanaris.js and art_ashenvale.js) ----
  function cloud(x, y, s, op, col) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, col || '#f4f6f8', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', dk(col || '#f4f6f8', 0.14), 0.9);
  }
  function tuft(c, x, y, s, col) {
    col = col || '#6a8a3a';
    var tips = [[-13, -8], [-9, -17], [-4, -12], [0, -23], [4, -13], [9, -18], [13, -7]], d = 'M' + pt([x - 11 * s, y]), inner = '';
    tips.forEach(function (t, i) {
      d += 'Q' + pt([x + (t[0] - 1) * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * s, y + t[1] * s]);
      if (i < tips.length - 1) d += 'Q' + pt([x + (t[0] + 1.5) * s, y + t[1] * 0.45 * s]) + ' ' + pt([x + (t[0] + tips[i + 1][0]) * 0.5 * s, y - 5 * s]);
      if (i % 2) inner += 'M' + pt([x + t[0] * 0.5 * s, y - 1 * s]) + 'Q' + pt([x + t[0] * 0.7 * s, y + t[1] * 0.5 * s]) + ' ' + pt([x + t[0] * 0.92 * s, y + t[1] * 0.85 * s]);
    });
    d += 'L' + pt([x + 11 * s, y]) + 'Z';
    return E(x, y + 1, 13 * s, 2.6 * s, '#000', 0, 0.16) + body(c, d, col, L(inner, dk(col, 0.3), 1 * s) + F('M' + pt([x + 2 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y - 26 * s]) + 'L' + pt([x + 16 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.22), 0.8), 1.3 * s);
  }
  function tufts(c, list, col) { return list.map(function (t) { return tuft(c, t[0], t[1], t[2], col); }).join(''); }
  function snowRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col) + F('M' + pt([x - w * 0.42, y - h * 0.56]) + 'C' + pt([x - w * 0.3, y - h * 1.06]) + ' ' + pt([x + w * 0.26, y - h * 1.06]) + ' ' + pt([x + w * 0.42, y - h * 0.5]) + 'C' + pt([x + w * 0.2, y - h * 0.66]) + ' ' + pt([x, y - h * 0.58]) + ' ' + pt([x - w * 0.12, y - h * 0.7]) + 'C' + pt([x - w * 0.24, y - h * 0.6]) + ' ' + pt([x - w * 0.34, y - h * 0.62]) + ' ' + pt([x - w * 0.42, y - h * 0.56]) + 'Z', '#f4f8fc', 0.95);
  }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#8a5a32';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  function crate(c, x, y, s, col) {
    col = col || '#a8743e';
    var d = 'M' + pt([x - 10 * s, y]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'Z';
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, L('M' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), dk(col, 0.4), 1.4 * s) + F('M' + pt([x + 4 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(col, 0.4), 0.5), 1.6 * s);
  }
  function sack(c, x, y, s, col) {
    col = col || '#c8aa76';
    var d = 'M' + pt([x - 9 * s, y]) + 'C' + pt([x - 12 * s, y - 8 * s]) + ' ' + pt([x - 8 * s, y - 16 * s]) + ' ' + pt([x - 3 * s, y - 17 * s]) + 'L' + pt([x - 4 * s, y - 21 * s]) + 'L' + pt([x + 4 * s, y - 21 * s]) + 'L' + pt([x + 3 * s, y - 17 * s]) + 'C' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z';
    return E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.22) + body(c, d, col, F('M' + pt([x + 2 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + L('M' + pt([x - 4 * s, y - 17 * s]) + 'L' + pt([x + 4 * s, y - 17 * s]), '#6a4a2a', 1.6 * s), 1.5 * s);
  }
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function club(c, p, len, ang, col, spikes) {
    var q = dirQ(p, ang); col = col || '#7a5434';
    var o = haft(c, p, len * 0.55, ang, col, 4, 9);
    var hd = 'M' + pt(q(len * 0.4, -4)) + 'C' + pt(q(len * 0.7, -10)) + ' ' + pt(q(len + 2, -10)) + ' ' + pt(q(len + 4, 0)) + 'C' + pt(q(len + 2, 10)) + ' ' + pt(q(len * 0.7, 10)) + ' ' + pt(q(len * 0.4, 4)) + 'Z';
    if (spikes) [[0.66, -9, -1], [0.86, -10, -1], [len ? 1.02 : 1, 0, 0], [0.86, 10, 1], [0.66, 9, 1]].forEach(function (k) { var b = q(len * k[0], k[1]), tp = q(len * k[0] + (k[2] ? 2 : 9), k[1] + k[2] * 7); o += P(pd([q(len * k[0] - 3, k[1] * 0.9), tp, q(len * k[0] + 3, k[1] * 0.9)], true), c.cel('#e8dcc0'), 1.1); });
    return o + body(c, hd, col, L('M' + pt(q(len * 0.6, -3)) + 'l3,2 M' + pt(q(len * 0.8, 3)) + 'l2,-3', dk(col, 0.4), 1.4) + F(pd([q(len * 0.4, 1), q(len + 6, 1), q(len + 6, 12), q(len * 0.4, 12)], true), dk(col, 0.3), 0.7), 2);
  }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function axe(c, p, len, ang, bw, col, dbl, hcol) {
    var q = dirQ(p, ang), o = haft(c, p, len + 4, ang, hcol || '#4a3222', 3.8);
    var blade = function (k, b) {
      return pd([q(len + 3, -1.5 * k), q(len + 6 + b * 0.25, -b * 0.75 * k), q(len + 2, -b * 1.05 * k), q(len - b * 0.55, -b * 1.12 * k), q(len - b * 1.05, -b * 0.8 * k), q(len - b * 0.75, -1.5 * k)], true);
    };
    o += P(blade(1, bw), c.cel(col || '#a8acb2'), 1.9) + L('M' + pt(q(len + 4, -bw * 0.72)) + 'L' + pt(q(len - bw * 0.5, -bw * 1.02)) + 'L' + pt(q(len - bw * 0.95, -bw * 0.74)), '#ffffff', 1.1, 0.6);
    if (dbl) o += P(blade(-1, bw * 0.85), c.cel(dk(col || '#a8acb2', 0.08)), 1.9);
    else o += P(pd([q(len - 2, 1.5), q(len - bw * 0.3, bw * 0.55), q(len - bw * 0.6, 1.5)], true), c.cel(dk(col || '#a8acb2', 0.1)), 1.4);
    return o + R(q(len - bw * 0.3, 0)[0] - 3, q(len - bw * 0.3, 0)[1] - 3, 6, 6, c.cel('#3a3434'), 1.2);
  }
  function rag(x0, x1, y, depth, seed) {
    var r = rng(seed || 3), d = '', k = 6;
    for (var i = 0; i <= k; i++) { var x = x0 + (x1 - x0) * i / k; d += 'L' + pt([x, y + (i % 2 ? depth * (0.4 + r() * 0.6) : 0)]); }
    return d;
  }
  // banner hanging from a crossbar on a pole (x = pole, y = ground)
  function flag(c, x, y, h, s, cloth, trim, mark, swallow) {
    var w = 16 * s, bh = 26 * s, ty = y - h, bx = x + 1.5 * s, o = E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, ty - 4 * s]), '#5a3e24', 2.6 * s) + limb('M' + pt([x - 2 * s, ty]) + 'L' + pt([x + w + 3 * s, ty]), '#5a3e24', 1.8 * s);
    var d = swallow ? pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh - 6 * s], [bx, ty + bh]], true) : pd([[bx, ty], [bx + w, ty], [bx + w, ty + bh], [bx + w / 2, ty + bh + 5 * s], [bx, ty + bh]], true);
    o += body(c, d, cloth, (trim ? L(pd([[bx + 1.8 * s, ty + 1], [bx + 1.8 * s, ty + bh - 1]]) + pd([[bx + w - 1.8 * s, ty + 1], [bx + w - 1.8 * s, ty + bh - 1]]), trim, 1.3 * s) : '') + F(pd([[bx + w * 0.62, ty], [bx + w + 1, ty], [bx + w + 1, ty + bh + 6 * s], [bx + w * 0.62, ty + bh + 6 * s]], true), '#000', 0.22), 1.4 * s);
    if (mark) o += mark(bx + w / 2, ty + bh * 0.45, s);
    return o + C(x, ty - 4 * s, 1.8 * s, c.cel(GOLD), 0.9 * s);
  }
  // ---- goblin (Venture Co.) — copy of the art_stonetalon.js rig, plus goggles, a dented hat and free limb sizes ----
  function gobHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.specs) s += L('M' + pt([x - 1, y - 4]) + 'L' + pt([x + 12, y - 7]), '#4a2e1a', 2.4) + C(x - 5, y - 4, 4.6, c.cel(o.specCol || '#c89a3a'), 1.4) + C(x - 5, y - 4, 3.1, o.lens || '#9ae8f4', 1) + C(x - 6.2, y - 5.2, 1, '#ffffff');
    else s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    if (o.grin) {
      s += P('M' + pt([x - 13, y + 8]) + 'Q' + pt([x - 6, y + 15]) + ' ' + pt([x + 3, y + 8]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 13, y + 8]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 11, y + 9]) + 'L' + pt([x + 1, y + 9]), '#f4ecd6', 1.6) + R(x - 7, y + 8.2, 2.6, 2.6, '#ffd040', 0.8);
    } else s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), OL, 3.6) + L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), '#7a4a2a', 2) + C(x - 21, y + 13.3, 1.3, '#ff8a3a') + smoke(x - 24, y + 6, 0.3, '#c8c8c8', 0.6, -1);
    var st = o.hatStyle || 'hard', hc = o.hat || '#e8b830';
    if (st === 'hard') {
      s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
      s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4), 2);
    } else if (st === 'cap') {
      s += body(c, 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 12, y - 22]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 14, y - 6]) + 'L' + pt([x + 14, y + 4]) + 'L' + pt([x + 9, y + 4]) + 'L' + pt([x + 8, y - 6]) + 'Z', hc, F('M' + pt([x + 3, y - 24]) + 'L' + pt([x + 16, y - 24]) + 'L' + pt([x + 16, y + 6]) + 'L' + pt([x + 5, y + 6]) + 'Z', dk(hc, 0.3), 0.8) + L('M' + pt([x - 8, y - 12]) + 'Q' + pt([x, y - 16]) + ' ' + pt([x + 10, y - 13]), dk(hc, 0.4), 1.2), 1.8);
    } else {
      s += L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', OL, 2.6) + L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', o.hair || '#e8e0d0', 1.2);
    }
    if (o.goggles) s += L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), OL, 3) + L('M' + pt([x - 11, y - 12]) + 'L' + pt([x + 12, y - 15]), '#4a3a2a', 1.6) + C(x - 7, y - 13, 4.2, c.cel('#8a8680'), 1.4) + C(x - 7, y - 13, 2.8, o.goggles, 1) + C(x + 1, y - 14, 3.8, c.cel('#8a8680'), 1.4) + C(x + 1, y - 14, 2.5, o.goggles, 1) + C(x - 8, y - 14.2, 0.9, '#ffffff');
    if (o.dent) s += L('M' + pt([x - 4, y - 22]) + 'q2,3 5,1', dk(hc, 0.45), 1.3) + L('M' + pt([x - 8, y - 17]) + 'l3,-2', '#ffffff', 1, 0.6);
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, hatStyle: o.hatStyle, specs: o.specs, specCol: o.specCol, lens: o.lens, grin: o.grin, cigar: o.cigar, hair: o.hair, goggles: o.goggles, dent: o.dent };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', buckle: o.buckle, glove: o.glove,
      hx: o.hx || 56, hy: o.hy || 32, hipY: 86, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, shins: o.shins,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }
  // pennant string between two points
  function bunting(x0, y0, x1, y1, sag, cols) {
    var d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, Math.max(y0, y1) + sag * 2]) + ' ' + pt([x1, y1]), o = L(d, OL, 1.2), k = 9;
    for (var i = 1; i < k; i++) { var t = i / k, u = 1 - t, px = u * u * x0 + 2 * u * t * (x0 + x1) / 2 + t * t * x1, py = u * u * y0 + 2 * u * t * (Math.max(y0, y1) + sag * 2) + t * t * y1; o += P(pd([[px - 3, py], [px + 3, py], [px, py + 7]], true), cols[i % cols.length], 0.8); }
    return o;
  }
  // goblin bruiser guard standing in a scene: foot at (x, y), s = scale of the 128 mob frame
  function bruiser(c, x, y, s, flip) {
    var g = gob(c, {
      skin: '#6aa84a', shirt: '#a8321e', sleeve: '#a8321e', forearm: '#6aa84a', pants: '#3a3a44', hat: '#8a8e96', hatStyle: 'hard', stripe: '#5a5e66', belt: '#3a2a1a', buckle: GOLD, boots: '#2a2220', legW: 11, armW: 10, shadowR: 34,
      torsoD: 'M42,50 C50,42 78,42 86,50 L86,72 L82,88 L46,88 L42,72 Z',
      pads: function (c) { return pauldronT(c, 82, 50, 10, '#8a8e96') + pauldronT(c, 44, 52, 12, '#8a8e96'); },
      near: [[46, 56], [38, 44], [34, 30]], wNear: function (c, p) { return axe(c, p, 30, -PI / 2 - 0.15, 12, '#b8bcc4', false, '#4a3222'); },
      scale: 0.9
    });
    var m = flip ? 'matrix(' + n(-s) + ',0,0,' + n(s) + ',' + n(x + 64 * s) + ',' + n(y - 122 * s) + ')' : 'matrix(' + n(s) + ',0,0,' + n(s) + ',' + n(x - 64 * s) + ',' + n(y - 122 * s) + ')';
    return G(g, m);
  }
  function pauldronT(c, x, y, r, col) {
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    return body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  // ---- furbolg (bear-folk biped, facing left) ----
  function furHead(c, x, y, o) {
    var fur = o.fur, mz = o.muzzle || lt(fur, 0.35), s = '', k = o.headK || 0.9;
    if (o.headBack) s += o.headBack(c);
    s += C(22, 49, 5.6, c.cel(dk(fur, 0.1)), 2) + C(22, 49, 2.4, dk(fur, 0.4));
    var hd = 'M42,62 C44,50 32,44 22,48 C14,50 10,56 10,62 L4,68 C0,72 1,79 6,81 L14,83 C20,89 36,89 42,83 C48,77 46,70 42,62 Z';
    s += body(c, hd, fur, F('M32,44 L52,44 L52,92 L36,92 C44,80 42,62 32,44 Z', dk(fur, 0.25), 0.7) + F('M1,72 C6,68 14,68 20,72 C22,78 20,84 14,86 L1,86 Z', mz, 0.95) +
      (o.paint ? L('M26,54 L30,64 M31,54 L34,62', o.paint, 2.2) : '') + L('M30,70 l3,3 M26,76 l3,2 M34,62 l3,2', dk(fur, 0.35), 1.1), 2.4);
    s += C(34, 50, 6, c.cel(fur), 2) + C(34, 50, 2.6, dk(fur, 0.45));
    s += E(3.6, 71, 3.4, 2.8, '#140c0a', 1.2);
    s += o.roar ? P('M4,80 C10,78 16,79 20,81 L16,88 C12,89 7,88 5,85 Z', '#4a1014', 1.3) + P('M7,80.4 L8,84 L9.4,80.6 Z M14,80.6 L15,84.4 L16.4,81 Z', '#f4ecd6', 0.7) : L('M5,80 Q10,83 18,81', OL, 1.4) + P('M9,81 L10,84.6 L11.4,81.4 Z', '#f4ecd6', 0.7);
    s += (o.eyeGlow ? gEye(c, 19, 62, 1.8, o.eyeGlow) : E(19, 62, 2.3, 2.1, o.eye || '#2a1a10', 1) + C(18.4, 61.4, 0.7, '#ffffff')) + L('M13,58 L25,55', OL, 2.4);
    if (o.eyeScar) s += L('M14,52 L24,70 M18,51 L27,66', lt(fur, 0.55), 1.6);
    s += P(pd([[36, 76], [32, 90], [39, 84], [42, 94], [46, 82]], true), c.cel(fur), 1.6);
    if (o.feathers) o.feathers.forEach(function (f, i) { s += feather(c, 34 + i * 3, 48 - i, -PI / 2 + 0.5 + i * 0.35, 13, '#f0ece2', f); });
    if (o.headTop) s += o.headTop(c);
    return G(s, 'matrix(' + k + ',0,0,' + k + ',' + n(x - 26 * k) + ',' + n(y - 66 * k) + ')');
  }
  function furbolg(c, o) {
    var fur = o.fur, fd = dk(fur, 0.22), rng2 = rng(o.seed || 5);
    var tex = ''; for (var i = 0; i < 12; i++) { var fx = 44 + rng2() * 38, fy = 52 + rng2() * 34; tex += 'M' + pt([fx, fy]) + 'q' + n(-1 - rng2() * 2) + ',3 ' + n(-1) + ',' + n(6 + rng2() * 2); }
    return biped(c, {
      skin: fur, shirt: fur, pants: o.pants || fd, sleeve: fur, glove: fur, boots: dk(fur, 0.35), feet: function (x, y, col) { return bearPaw(x, y, c_(col)); }, legW: 14, armW: 12, shadowR: o.shadowR || 38, hipY: 88, neck: false,
      torsoD: o.torsoD || 'M36,54 C38,38 84,34 92,50 C96,64 90,80 84,92 L46,92 C38,82 34,68 36,54 Z',
      back: function (c) { return (o.back ? o.back(c) : '') + P(shag(72, 50, 24, 16, 9, 0.24, o.seed || 5, -0.3), c.cel(dk(fur, 0.12)), 2); },
      chest: function (c) { return E(58, 74, 14, 14, lt(fur, 0.14), 0, 0.7) + L(tex, dk(fur, 0.3), 1.1, 0.85) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M46,84 L84,84 L86,102 L78,98 L72,106 L66,98 L58,106 L54,98 L44,102 Z', o.loin || '#6a4a2a', L('M47,88 L85,88', dk(o.loin || '#6a4a2a', 0.4), 1.2), 1.8) + (o.front ? o.front(c) : ''); },
      head: function (c, x, y) { return furHead(c, x, y, o); }, hx: o.hx || 40, hy: o.hy || 40,
      near: o.near || [[44, 56], [32, 72], [24, 84]], far: o.far || [[84, 54], [96, 70], [98, 86]],
      nearHand: function (c, p) { return clawHand(p, fur, 1.25); }, farHand: function (c, p) { return clawHand(p, fd, 1.15); },
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top,
      tf: at(o.scale || 1, 64, 122)
    });
  }
  function beadNecklace(x, y, w, cols) {
    var o = L('M' + pt([x - w, y]) + 'Q' + pt([x, y + w * 0.7]) + ' ' + pt([x + w, y]), '#3a2a1a', 1.1);
    for (var i = 0; i <= 6; i++) { var t = i / 6, bx = x - w + 2 * w * t, by = y + 4 * t * (1 - t) * w * 0.7 / 1; o += C(bx, by, 1.8, cols[i % cols.length], 0.8); }
    return o;
  }
  function totemStaff(c, top, bot, glowCol) {
    var d = 'M' + pt(top) + 'L' + pt(bot), o = limb(d, '#7a5434', 3.6) + L(d, '#a87a4a', 1, 0.6), x = top[0], y = top[1];
    o += orb(c, x, y - 24, 4.4, glowCol || '#7aff5a');
    o += C(x - 6, y - 15, 3, c.cel('#9a6a3a'), 1.2) + C(x + 6, y - 15, 3, c.cel('#9a6a3a'), 1.2);
    o += body(c, pd([[x - 7, y + 2], [x - 8, y - 15], [x + 8, y - 15], [x + 7, y + 2]], true), '#a8743e', C(x - 3, y - 9, 1.3, OL) + C(x + 3, y - 9, 1.3, OL) + E(x, y - 4, 3, 2, '#5a3a20') + F(pd([[x + 2, y - 16], [x + 9, y - 16], [x + 9, y + 3], [x + 2, y + 3]], true), '#000', 0.25), 1.5);
    o += L('M' + pt([x - 7, y + 2]) + 'L' + pt([x - 9, y + 12]) + 'M' + pt([x + 7, y + 2]) + 'L' + pt([x + 9, y + 10]), '#3a2a20', 0.9) + feather(c, x - 9, y + 11, PI / 2 + 0.2, 10, '#f0ece2', '#3a8a4a') + feather(c, x + 9, y + 9, PI / 2 - 0.2, 9, '#f0ece2', '#c8a030');
    return o;
  }

  // ============================================================
  //  WINTERSPRING: palette
  // ============================================================
  var GOLD = '#e0b43c', SNOW = '#f2f6fb', SNOWM = '#d8e4f0', SNOWS = '#afc2da', SNOWD = '#8298b8',
    PINE = '#2e4e4a', PINED = '#1e3434', ICE = '#9fd4f0', ICEL = '#e2f6ff', ICED = '#5a96c4', CRAG = '#7e8ea8',
    AUR1 = '#62f0c0', AUR2 = '#9a86ff', WOOD = '#8a6440', WOODD = '#5e4028', HIDE = '#b8966e', LANT = '#ffc462',
    ARC = '#b890ff', FROST = '#8ae8ff', GHOST = '#8ad8f4', ELF = '#c8c4dc', COBALT = '#3a66b4', TAINT = '#6af0c8';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  function stars(seed, cnt, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var x = r() * 400, y = r() * y1, s = 0.5 + r() * 0.9; o += C(x, y, s, col || '#ffffff', 0, 0.45 + r() * 0.5); } return o; }
  function flakes(seed, cnt, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), s = 0.7 + (y - y0) / ((y1 - y0) || 1) * 1.3 + r() * 0.5; o += C(r() * 400, y, s, col || '#ffffff', 0, 0.55 + r() * 0.4); } return o; }
  // aurora: a curtain hanging from a wavy top edge, faded top and bottom, with light streaks
  function aurora(c, seed, yc, amp, h, col, op) {
    var r = rng(seed), ph = r() * 6, ph2 = r() * 6, top = [], st = '';
    for (var x = -20; x <= 420; x += 16) top.push([x, yc + amp * Math.sin(x / 70 + ph) + amp * 0.45 * Math.sin(x / 27 + ph2)]);
    var bot = top.map(function (p, i) { return [p[0] + 6, p[1] + h * (0.7 + 0.3 * Math.sin(i * 0.9 + ph))]; });
    var o = F(pd(top.concat(bot.slice().reverse()), true), c.lg([[0, col, 0], [0.18, col, op], [0.55, col, op * 0.45], [1, col, 0]]));
    for (var i = 0; i < top.length; i += 1) if (r() < 0.6) st += 'M' + pt([top[i][0] + r() * 8, top[i][1] + 3]) + 'l' + n(3) + ',' + n(h * (0.3 + r() * 0.5));
    return o + L(st, lt(col, 0.4), 1.6, op * 0.3);
  }
  // snowy peaks: zigzag ridge with snow caps and shaded right faces
  function peaks(c, seed, base, amp, col, snow, step) {
    var r = rng(seed), p = [], x = -40, up = true;
    while (x < 460) { p.push([x, up ? base - amp * (0.55 + 0.45 * r()) : base - amp * (0.08 + 0.3 * r())]); x += step * (0.35 + 0.35 * r()); up = !up; }
    var o = F('M' + pt([-40, base + 40]) + 'L' + p.map(pt).join('L') + 'L' + pt([p[p.length - 1][0], base + 40]) + 'Z', col);
    for (var i = 1; i < p.length - 1; i++) {
      var P0 = p[i], V1 = p[i - 1], V2 = p[i + 1];
      if (P0[1] > V1[1] || P0[1] > V2[1]) continue;
      o += F(pd([P0, V2, [P0[0] + (V2[0] - P0[0]) * 0.3, base + 40], [P0[0], base + 40]], true), dk(col, 0.22), 0.7);
      var A = lerp2(P0, V1, 0.34), B = lerp2(P0, V2, 0.3), m1 = lerp2(A, B, 0.3), m2 = lerp2(A, B, 0.55), m3 = lerp2(A, B, 0.8);
      o += F(pd([P0, B, [m3[0], m3[1] + 4], [m2[0], m2[1] - 2], [m1[0], m1[1] + 5], A], true), snow);
      o += F(pd([P0, B, [m3[0], m3[1] + 4], [P0[0] + 1, P0[1] + (B[1] - P0[1]) * 0.8]], true), dk(snow, 0.14), 0.8);
    }
    return o;
  }
  // a snow-laden pine: stacked drooping tiers, snow along each tier's upper edges
  function pine(c, x, y, s, col, snow) {
    col = col || PINE; snow = snow || SNOW;
    var o = E(x, y + 1, 16 * s, 3 * s, '#1a2a3a', 0, 0.25) + R(x - 2.6 * s, y - 14 * s, 5.2 * s, 15 * s, c.cel('#5a3e2a'), 1.2 * s);
    for (var i = 0; i < 5; i++) {
      var w = (24 - i * 4.2) * s, yb = y - 10 * s - i * 14 * s, tp = yb - 26 * s, hh = yb - tp;
      var d = pd([[x, tp], [x + w * 0.5, tp + hh * 0.55], [x + w, yb], [x + w * 0.62, yb - 3 * s], [x + w * 0.32, yb + 1.5 * s], [x, yb - 3 * s], [x - w * 0.32, yb + 1.5 * s], [x - w * 0.62, yb - 3 * s], [x - w, yb], [x - w * 0.5, tp + hh * 0.55]], true);
      o += body(c, d, col, F(pd([[x + 1 * s, tp - 2], [x + w + 4, yb], [x + w + 4, yb + 4], [x + 1 * s, yb + 4]], true), dk(col, 0.35), 0.7), 1.3 * s);
      o += P(pd([[x, tp - 0.5], [x + w * 0.46, tp + hh * 0.5], [x + w * 0.34, tp + hh * 0.56], [x + w * 0.16, tp + hh * 0.44], [x - w * 0.1, tp + hh * 0.6], [x - w * 0.3, tp + hh * 0.48], [x - w * 0.5, tp + hh * 0.6], [x - w * 0.44, tp + hh * 0.48]], true), snow, 0.9 * s);
    }
    return o;
  }
  // far forest: flat silhouettes of snowy pines along a line
  function pineRow(seed, y, x0, x1, cnt, h0, h1, col, snow) {
    var r = rng(seed), o = '', list = [];
    for (var i = 0; i < cnt; i++) list.push([x0 + r() * (x1 - x0), h0 + r() * (h1 - h0)]);
    list.sort(function (a, b) { return a[1] - b[1]; });
    list.forEach(function (t) {
      var x = t[0], h = t[1], w = h * 0.3, d = 'M' + pt([x, y - h]);
      for (var k = 0; k < 3; k++) { var yy = y - h + h * (k + 1) / 3.3, ww = w * (0.5 + k * 0.25); d += 'L' + pt([x + ww, yy]) + 'L' + pt([x + ww * 0.45, yy - 1]); }
      d += 'L' + pt([x + w * 0.12, y]) + 'L' + pt([x - w * 0.12, y]);
      for (var j = 2; j >= 0; j--) { var y2 = y - h + h * (j + 1) / 3.3, w2 = w * (0.5 + j * 0.25); d += 'L' + pt([x - w2 * 0.45, y2 - 1]) + 'L' + pt([x - w2, y2]); }
      o += F(d + 'Z', col) + (snow ? F(pd([[x, y - h], [x + w * 0.22, y - h + h * 0.18], [x - w * 0.26, y - h + h * 0.2]], true), snow, 0.9) : '');
    });
    return o;
  }
  // snowfield: gradient, soft drift lumps, glints; a pale seam where it meets the far land
  function snowField(c, y, top, bot, seed) {
    var r = rng(seed || 8), o = ground(c, y, top, bot);
    for (var i = 0; i < 10; i++) { var yy = y + 6 + r() * (234 - y), t = (yy - y) / (240 - y), w = 18 + t * 50; o += E(r() * 400, yy, w, w * 0.12, r() < 0.5 ? '#ffffff' : dk(bot, 0.08), 0, 0.5); }
    return o + R(0, y - 1, 400, 4, lt(top, 0.5), 0) + motes((seed || 8) + 3, 16, 0, 400, y + 10, 236, '#ffffff');
  }
  // snow drift: a soft mound, outlined along the crest only so it melts into the field
  function drift(c, x, y, w, h, col) {
    col = col || SNOW;
    var top = 'M' + pt([x - w / 2, y + 1]) + 'C' + pt([x - w * 0.36, y - h * 1.1]) + ' ' + pt([x + w * 0.1, y - h * 1.2]) + ' ' + pt([x + w / 2, y + 1]);
    return E(x + w * 0.06, y + 1, w * 0.52, Math.max(1.6, h * 0.35), SNOWS, 0, 0.55) + F(top + 'Z', c.lg([[0, '#ffffff'], [1, col]])) +
      F('M' + pt([x + w * 0.1, y - h * 1.05]) + 'C' + pt([x + w * 0.3, y - h * 0.7]) + ' ' + pt([x + w * 0.42, y - h * 0.3]) + ' ' + pt([x + w / 2, y + 1]) + 'L' + pt([x + w * 0.1, y + 1]) + 'Z', SNOWS, 0.4) + L(top, SNOWD, 1.1, 0.9);
  }
  // hanging icicles under an edge from x0 to x1: thin, uneven, in clusters
  function icicles(c, x0, x1, y, len, seed, col) {
    var r = rng(seed || 4), o = '', x = x0 + r() * 3;
    col = col || ICEL;
    while (x < x1) {
      if (r() < 0.22) { x += 4 + r() * 6; continue; }
      var w = 1.6 + r() * 2.4, l = len * (0.2 + r() * r() * 0.8 + r() * 0.2);
      o += P(pd([[x, y - 1], [x + w, y - 1], [x + w * 0.62, y + l * 0.55], [x + w * 0.5, y + l]], true), col, 0.7) + L('M' + pt([x + w * 0.3, y]) + 'L' + pt([x + w * 0.45, y + l * 0.6]), '#ffffff', 0.6, 0.85);
      x += w + 0.6 + r() * 2.6;
    }
    return o;
  }
  function pawPrints(seed, pts) { var o = ''; pts.forEach(function (p, i) { var s = p[2] || 1; o += E(p[0], p[1], 2.6 * s, 1.2 * s, SNOWD, 0, 0.55) + E(p[0] - 3 * s, p[1] - 1.8 * s, 0.9 * s, 0.6 * s, SNOWD, 0, 0.5) + E(p[0] - 1 * s, p[1] - 2.6 * s, 0.9 * s, 0.6 * s, SNOWD, 0, 0.5) + E(p[0] + 1.6 * s, p[1] - 2.4 * s, 0.9 * s, 0.6 * s, SNOWD, 0, 0.5); }); return o; }
  // hanging lantern with a warm glow
  function lantern(c, x, y, s) {
    return C(x, y + 5 * s, 16 * s, glow(c, LANT, 0.6)) + L('M' + pt([x, y - 4 * s]) + 'L' + pt([x, y]), OL, 1 * s) +
      P(pd([[x - 3.4 * s, y], [x + 3.4 * s, y], [x + 4 * s, y + 8 * s], [x - 4 * s, y + 8 * s]], true), '#ffe7a0', 1.1 * s) + R(x - 4.6 * s, y - 1.4 * s, 9.2 * s, 2 * s, c.cel('#4a3a2a'), 0.9 * s) + R(x - 4.6 * s, y + 7.6 * s, 9.2 * s, 2 * s, c.cel('#4a3a2a'), 0.9 * s) + L('M' + pt([x, y + 0.6 * s]) + 'L' + pt([x, y + 7.6 * s]), '#8a5a2a', 0.8 * s);
  }
  // string of lanterns between two points
  function lanternLine(c, x0, y0, x1, y1, sag, cnt, s) {
    var my = Math.max(y0, y1) + sag * 2, d = 'M' + pt([x0, y0]) + 'Q' + pt([(x0 + x1) / 2, my]) + ' ' + pt([x1, y1]), o = L(d, OL, 1.1);
    for (var i = 1; i <= cnt; i++) { var t = i / (cnt + 1), u = 1 - t, px = u * u * x0 + 2 * u * t * (x0 + x1) / 2 + t * t * x1, py = u * u * y0 + 2 * u * t * my + t * t * y1; o += lantern(c, px, py + 3, s || 0.8); }
    return o;
  }
  // goblin gear sign (no text): a toothed wheel on a hanging board
  function gearD(x, y, r) { var d = ''; for (var i = 0; i < 16; i++) { var a = PI * 2 * i / 16, rr = i % 2 ? r : r * 1.3; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }
  function gearSign(c, x, y, s) {
    return L('M' + pt([x - 7 * s, y - 6 * s]) + 'L' + pt([x - 6 * s, y]) + 'M' + pt([x + 7 * s, y - 6 * s]) + 'L' + pt([x + 6 * s, y]), OL, 1 * s) + R(x - 9 * s, y, 18 * s, 13 * s, c.cel('#a8743e'), 1.3 * s) +
      P(gearD(x, y + 6.5 * s, 3.4 * s), c.cel(GOLD), 0.9 * s) + C(x, y + 6.5 * s, 1.3 * s, '#4a3a2a');
  }
  // wooden house with a steep snow-laden roof; o: {roof, chimney, win, door, sign, wall}
  function woodHouse(c, x, y, w, h, o) {
    o = o || {};
    var wall = o.wall || WOOD, roof = o.roof || '#5a3a30', s = '', ry = y - h, ap = [x + w / 2, ry - w * 0.42];
    s += E(x + w / 2, y + 2, w * 0.62, 4, '#1a2a3a', 0, 0.25);
    if (o.chimney != null) { var cx = x + w * o.chimney; s += body(c, pd([[cx - 5, ry - w * 0.1], [cx - 5, ry - w * 0.46], [cx + 6, ry - w * 0.46], [cx + 6, ry - w * 0.1]], true), '#8a8a92', L('M' + pt([cx - 5, ry - w * 0.3]) + 'L' + pt([cx + 6, ry - w * 0.3]) + 'M' + pt([cx, ry - w * 0.46]) + 'L' + pt([cx, ry - w * 0.3]), '#5a5a64', 0.9), 1.5) + E(cx + 0.5, ry - w * 0.47, 7, 2.4, SNOW, 1) + smoke(cx + 1, ry - w * 0.5, 0.9, '#c8ccd6', 0.6, 0.7); }
    var lg = ''; for (var yy = y - 6; yy > ry + 2; yy -= 6) lg += 'M' + pt([x, yy]) + 'L' + pt([x + w, yy]);
    s += body(c, pd([[x, y], [x + w, y], [x + w, ry], [x, ry]], true), wall, L(lg, dk(wall, 0.35), 1, 0.9) + F(pd([[x + w * 0.66, ry - 2], [x + w + 2, ry - 2], [x + w + 2, y + 2], [x + w * 0.66, y + 2]], true), dk(wall, 0.25), 0.8), 1.8);
    // gable triangle + roof slabs
    s += body(c, pd([[x + 2, ry], ap, [x + w - 2, ry]], true), dk(wall, 0.08), L('M' + pt([x + w / 2, ap[1] + 4]) + 'L' + pt([x + w / 2, ry]), dk(wall, 0.35), 1), 1.5);
    s += P(pd([[x - 7, ry + 3], [ap[0], ap[1] - 3], [ap[0] + 2, ap[1] + 3], [x - 1, ry + 6]], true), c.cel(roof), 1.6) + P(pd([[x + w + 7, ry + 3], [ap[0], ap[1] - 3], [ap[0] - 2, ap[1] + 3], [x + w + 1, ry + 6]], true), c.cel(dk(roof, 0.2)), 1.6);
    var snowL = 'M' + pt([x - 10, ry + 1]) + 'Q' + pt([x + w * 0.2, ap[1] + (ry - ap[1]) * 0.35 - 6]) + ' ' + pt([ap[0], ap[1] - 9]) + 'L' + pt([ap[0], ap[1] - 1]) + 'L' + pt([x - 1, ry + 5]) + 'Q' + pt([x - 3, ry + 10]) + ' ' + pt([x - 6, ry + 7]) + 'Z';
    var snowR = 'M' + pt([x + w + 10, ry + 1]) + 'Q' + pt([x + w * 0.8, ap[1] + (ry - ap[1]) * 0.35 - 6]) + ' ' + pt([ap[0], ap[1] - 9]) + 'L' + pt([ap[0], ap[1] - 1]) + 'L' + pt([x + w + 1, ry + 5]) + 'Q' + pt([x + w + 3, ry + 11]) + ' ' + pt([x + w + 6, ry + 7]) + 'Z';
    s += P(snowL, SNOW, 1.2) + P(snowR, SNOWM, 1.2) + icicles(c, x - 4, x + w + 4, ry + 6, 7, Math.round(x + w), ICEL);
    // windows (lit) and door
    (o.win || [[0.24, 0.45]]).forEach(function (q) { var wx = x + w * q[0], wy = y - h * q[1]; s += C(wx, wy, 14, glow(c, LANT, 0.45)) + R(wx - 5, wy - 5, 10, 10, '#ffd889', 1.4) + L('M' + pt([wx, wy - 5]) + 'L' + pt([wx, wy + 5]) + 'M' + pt([wx - 5, wy]) + 'L' + pt([wx + 5, wy]), '#6a4a2a', 1.1) + R(wx - 6.4, wy + 5, 12.8, 2.2, SNOW, 0.9); });
    if (o.door != null) { var dx = x + w * o.door; s += P(pd([[dx - 7, y], [dx - 7, y - 18], [dx + 7, y - 18], [dx + 7, y]], true), '#3a2618', 1.4) + L('M' + pt([dx, y - 18]) + 'L' + pt([dx, y]), '#5a3a24', 1) + C(dx + 4, y - 9, 0.9, GOLD); }
    if (o.sign != null) s += gearSign(c, x + w * o.sign, y - h * 0.86, 0.9);
    return s + drift(c, x + w * 0.1, y + 1, w * 0.34, 5) + drift(c, x + w * 0.86, y + 1, w * 0.3, 4);
  }
  // row of sharpened stakes, snow on the tips
  function palisade(c, x0, x1, y, h, seed) {
    var r = rng(seed || 5), o = '', x = x0;
    o += limb('M' + pt([x0, y - h * 0.62]) + 'L' + pt([x1, y - h * 0.62]), WOODD, 2.6);
    while (x < x1) { var w = 7 + r() * 2, hh = h * (0.9 + r() * 0.16), c0 = r() < 0.5 ? WOOD : dk(WOOD, 0.1); o += P(pd([[x, y], [x, y - hh + 4], [x + w / 2, y - hh - 2], [x + w, y - hh + 4], [x + w, y]], true), c.cel(c0), 1.2) + P(pd([[x + 0.6, y - hh + 3], [x + w / 2, y - hh - 1.6], [x + w - 0.6, y - hh + 3], [x + w / 2, y - hh + 5]], true), SNOW, 0.7); x += w; }
    return o + limb('M' + pt([x0, y - h * 0.28]) + 'L' + pt([x1, y - h * 0.28]), WOODD, 2.6);
  }
  // furbolg lodge: a pole frame covered in stitched hides, snow on top, a bear skull over the door
  function hideHut(c, x, y, s, hide) {
    hide = hide || HIDE;
    var w = 30 * s, h = 40 * s, o = E(x, y + 2, w + 8 * s, 4 * s, '#1a2a3a', 0, 0.3);
    o += limb('M' + pt([x - 6 * s, y - h + 2 * s]) + 'L' + pt([x - 14 * s, y - h - 12 * s]) + 'M' + pt([x + 5 * s, y - h + 2 * s]) + 'L' + pt([x + 12 * s, y - h - 13 * s]) + 'M' + pt([x, y - h]) + 'L' + pt([x + 1 * s, y - h - 14 * s]), '#6a4a2e', 2.4 * s);
    var d = 'M' + pt([x - w, y]) + 'C' + pt([x - w * 0.9, y - h * 0.5]) + ' ' + pt([x - w * 0.35, y - h * 0.95]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.35, y - h * 0.95]) + ' ' + pt([x + w * 0.9, y - h * 0.5]) + ' ' + pt([x + w, y]) + 'Z';
    var st = 'M' + pt([x - w * 0.55, y - h * 0.72]) + 'Q' + pt([x - w * 0.3, y - h * 0.3]) + ' ' + pt([x - w * 0.42, y]) + 'M' + pt([x + w * 0.5, y - h * 0.76]) + 'Q' + pt([x + w * 0.3, y - h * 0.3]) + ' ' + pt([x + w * 0.5, y]) + 'M' + pt([x - w * 0.9, y - h * 0.34]) + 'Q' + pt([x, y - h * 0.5]) + ' ' + pt([x + w * 0.9, y - h * 0.36]);
    var stitch = ''; for (var i = 0; i < 6; i++) { var t = i / 5; stitch += 'M' + pt([x - w * 0.52 + t * 4 * s, y - h * (0.66 - t * 0.5) - 1.5 * s]) + 'l' + n(3 * s) + ',' + n(2 * s); }
    o += body(c, d, hide, L(st, dk(hide, 0.4), 1.3 * s) + L(stitch, '#3a2a1a', 0.9 * s) + F(pd([[x + w * 0.2, y - h - 2], [x + w + 4, y - h - 2], [x + w + 4, y + 2], [x + w * 0.2, y + 2]], true), dk(hide, 0.28), 0.8) + E(x - w * 0.5, y - h * 0.5, w * 0.2, h * 0.12, lt(hide, 0.18), 0, 0.6), 2 * s);
    o += P('M' + pt([x - w * 0.62, y - h * 0.62]) + 'C' + pt([x - w * 0.4, y - h * 1.02]) + ' ' + pt([x + w * 0.42, y - h * 1.04]) + ' ' + pt([x + w * 0.62, y - h * 0.6]) + 'C' + pt([x + w * 0.4, y - h * 0.7]) + ' ' + pt([x + w * 0.2, y - h * 0.62]) + ' ' + pt([x, y - h * 0.7]) + 'C' + pt([x - w * 0.2, y - h * 0.62]) + ' ' + pt([x - w * 0.42, y - h * 0.7]) + ' ' + pt([x - w * 0.62, y - h * 0.62]) + 'Z', SNOW, 1.2 * s);
    o += P('M' + pt([x - 9 * s, y]) + 'L' + pt([x - 8 * s, y - 18 * s]) + 'Q' + pt([x, y - 24 * s]) + ' ' + pt([x + 8 * s, y - 18 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z', '#20140e', 1.5 * s) + C(x, y - 8 * s, 10 * s, glow(c, '#ffa040', 0.4));
    o += bearSkull(c, x, y - 27 * s, 0.7 * s);
    return o + drift(c, x - w * 0.8, y + 1, w * 0.6, 5 * s) + drift(c, x + w * 0.9, y + 1, w * 0.5, 4 * s);
  }
  function bearSkull(c, x, y, s) {
    return P('M' + pt([x - 8 * s, y - 2 * s]) + 'C' + pt([x - 9 * s, y - 10 * s]) + ' ' + pt([x + 9 * s, y - 10 * s]) + ' ' + pt([x + 8 * s, y - 2 * s]) + 'L' + pt([x + 5 * s, y + 6 * s]) + 'L' + pt([x - 5 * s, y + 6 * s]) + 'Z', c.cel('#ece4cc'), 1.4 * s) +
      C(x - 7 * s, y - 8 * s, 2.4 * s, c.cel('#ece4cc'), 1 * s) + C(x + 7 * s, y - 8 * s, 2.4 * s, c.cel('#ece4cc'), 1 * s) + E(x - 3.2 * s, y - 2.4 * s, 2 * s, 2.2 * s, OL) + E(x + 3.2 * s, y - 2.4 * s, 2 * s, 2.2 * s, OL) + E(x, y + 3 * s, 1.4 * s, 1 * s, OL) +
      P(pd([[x - 4 * s, y + 5.6 * s], [x - 3 * s, y + 9 * s], [x - 2 * s, y + 5.6 * s]], true), '#f4ecd6', 0.6 * s) + P(pd([[x + 2 * s, y + 5.6 * s], [x + 3 * s, y + 9 * s], [x + 4 * s, y + 5.6 * s]], true), '#f4ecd6', 0.6 * s);
  }
  // Winterfall totem: carved bear heads painted white and blue, a crown of antlers, spirit beads
  function wTotem(c, x, y, s) {
    var o = E(x, y + 1, 10 * s, 2.4 * s, '#1a2a3a', 0, 0.3), wd = '#8a6440';
    o += L('M' + pt([x - 9 * s, y - 60 * s]) + 'Q' + pt([x - 16 * s, y - 70 * s]) + ' ' + pt([x - 20 * s, y - 80 * s]) + 'M' + pt([x - 14 * s, y - 70 * s]) + 'L' + pt([x - 22 * s, y - 70 * s]) + 'M' + pt([x + 9 * s, y - 60 * s]) + 'Q' + pt([x + 16 * s, y - 70 * s]) + ' ' + pt([x + 20 * s, y - 80 * s]) + 'M' + pt([x + 14 * s, y - 70 * s]) + 'L' + pt([x + 22 * s, y - 72 * s]), OL, 4.4 * s) +
      L('M' + pt([x - 9 * s, y - 60 * s]) + 'Q' + pt([x - 16 * s, y - 70 * s]) + ' ' + pt([x - 20 * s, y - 80 * s]) + 'M' + pt([x - 14 * s, y - 70 * s]) + 'L' + pt([x - 22 * s, y - 70 * s]) + 'M' + pt([x + 9 * s, y - 60 * s]) + 'Q' + pt([x + 16 * s, y - 70 * s]) + ' ' + pt([x + 20 * s, y - 80 * s]) + 'M' + pt([x + 14 * s, y - 70 * s]) + 'L' + pt([x + 22 * s, y - 72 * s]), '#e8dcc0', 2.2 * s);
    [[0, wd, '#e8ecf2'], [1, lt(wd, 0.1), '#3a78c8'], [2, dk(wd, 0.08), '#e8ecf2']].forEach(function (b) {
      var by = y - b[0] * 20 * s, bc = b[1], pc = b[2];
      o += body(c, pd([[x - 9 * s, by], [x - 9 * s, by - 20 * s], [x + 9 * s, by - 20 * s], [x + 9 * s, by]], true), bc, F(pd([[x - 9 * s, by - 20 * s], [x + 9 * s, by - 20 * s], [x + 9 * s, by - 15 * s], [x - 9 * s, by - 15 * s]], true), pc, 0.85) + F(pd([[x + 3 * s, by - 22 * s], [x + 11 * s, by - 22 * s], [x + 11 * s, by + 2], [x + 3 * s, by + 2]], true), '#000', 0.22), 1.6 * s);
      o += C(x - 9 * s, by - 17 * s, 3 * s, c.cel(bc), 1 * s) + C(x + 9 * s, by - 17 * s, 3 * s, c.cel(bc), 1 * s);
      o += C(x - 3.6 * s, by - 12 * s, 1.5 * s, OL) + C(x + 3.6 * s, by - 12 * s, 1.5 * s, OL) + E(x, by - 6 * s, 5 * s, 3.4 * s, lt(bc, 0.25), 0.9 * s) + E(x, by - 7.4 * s, 1.8 * s, 1.2 * s, OL) + L('M' + pt([x - 4 * s, by - 3 * s]) + 'L' + pt([x + 4 * s, by - 3 * s]), OL, 1 * s);
    });
    o += E(x, y - 60 * s, 11 * s, 2.6 * s, SNOW, 1 * s);
    return o + beadNecklace(x, y - 40 * s, 10 * s, [TAINT, '#e8e0c8', '#3a78c8']);
  }
  // frozen lake: glossy ice with a dark rim, reflected sky light and cracks
  function frozenLake(c, cx, cy, rx, ry, seed, tint) {
    var r = rng(seed || 9), cr = '', t = tint || AUR1;
    var o = E(cx, cy, rx + 4, ry + 3, SNOWS, 1.6) + E(cx, cy + 1, rx, ry, c.lg([[0, '#3a5a8a'], [0.5, '#6a9ac4'], [1, '#a8d0ea']]), 0);
    o += E(cx - rx * 0.2, cy - ry * 0.2, rx * 0.6, ry * 0.24, t, 0, 0.2) + E(cx + rx * 0.3, cy + ry * 0.2, rx * 0.34, ry * 0.12, '#ffffff', 0, 0.3);
    for (var i = 0; i < 7; i++) { var a = r() * PI * 2, x = cx + Math.cos(a) * rx * 0.6 * r(), y = cy + Math.sin(a) * ry * 0.6 * r(); cr += 'M' + pt([x, y]) + 'l' + n(8 + r() * 14) + ',' + n((r() - 0.5) * 5) + 'l' + n(6 + r() * 10) + ',' + n((r() - 0.5) * 4) + 'M' + pt([x, y]) + 'l' + n(-6 - r() * 10) + ',' + n((r() - 0.5) * 4); }
    return o + L(cr, '#e8f6ff', 1, 0.8) + L('M' + pt([cx - rx * 0.7, cy - ry * 0.4]) + 'l' + n(rx * 0.3) + ',-2 M' + pt([cx + rx * 0.1, cy + ry * 0.5]) + 'l' + n(rx * 0.4) + ',-2', '#ffffff', 1.4, 0.7);
  }
  // highborne stone: slender fluted column with a crescent capital; broken = snapped top
  function elfColumn(c, x, y, h, s, broken, col) {
    col = col || ELF;
    var w = 7 * s, o = E(x, y + 1, 12 * s, 2.6 * s, '#101828', 0, 0.3), top = y - h;
    o += P(pd([[x - w - 3 * s, y], [x - w - 3 * s, y - 5 * s], [x + w + 3 * s, y - 5 * s], [x + w + 3 * s, y]], true), c.cel(dk(col, 0.1)), 1.4 * s);
    var sd = broken ? pd([[x - w, y - 5 * s], [x - w, top + 6 * s], [x - w * 0.3, top], [x + w * 0.2, top + 7 * s], [x + w, top + 3 * s], [x + w, y - 5 * s]], true) : pd([[x - w, y - 5 * s], [x - w * 0.8, top + 6 * s], [x + w * 0.8, top + 6 * s], [x + w, y - 5 * s]], true);
    o += body(c, sd, col, L('M' + pt([x - w * 0.35, y - 6 * s]) + 'L' + pt([x - w * 0.3, top + 8 * s]) + 'M' + pt([x + w * 0.3, y - 6 * s]) + 'L' + pt([x + w * 0.25, top + 8 * s]), dk(col, 0.3), 1 * s) + F(pd([[x + w * 0.2, top - 2], [x + w + 2, top - 2], [x + w + 2, y], [x + w * 0.2, y]], true), dk(col, 0.28), 0.8), 1.6 * s);
    if (!broken) {
      o += P('M' + pt([x - w * 2.2, top - 4 * s]) + 'Q' + pt([x, top + 10 * s]) + ' ' + pt([x + w * 2.2, top - 4 * s]) + 'Q' + pt([x + w * 1.2, top + 4 * s]) + ' ' + pt([x, top + 5 * s]) + 'Q' + pt([x - w * 1.2, top + 4 * s]) + ' ' + pt([x - w * 2.2, top - 4 * s]) + 'Z', c.cel(lt(col, 0.1)), 1.4 * s);
      o += R(x - w * 1.2, top + 5 * s, w * 2.4, 3 * s, c.cel(col), 1.2 * s) + E(x, top - 1 * s, w * 1.6, 2 * s, SNOW, 0.9 * s);
    } else o += P(pd([[x - w, top + 6 * s], [x - w * 0.3, top], [x + w * 0.2, top + 7 * s], [x + w, top + 3 * s], [x + w * 0.4, top + 9 * s]], true), SNOW, 0.9 * s);
    return o;
  }
  // ruined highborne arch with a moon motif in the keystone
  // ruined highborne arch: two columns, a round arch band broken short of the far column, a moon in the keystone
  function elfArch(c, x, y, w, h, s, col) {
    col = col || ELF;
    var x0 = x - w / 2, x1 = x + w / 2, top = y - h, rr = w / 2;
    var o = elfColumn(c, x0, y, h, s, false, col) + elfColumn(c, x1, y, h, s, false, dk(col, 0.06));
    var a0 = PI, a1 = PI * 1.72, arc = 'M' + pt([x + Math.cos(a0) * rr, top + Math.sin(a0) * rr]) + 'A' + n(rr) + ',' + n(rr * 0.9) + ' 0 0,1 ' + pt([x + Math.cos(a1) * rr, top + Math.sin(a1) * rr * 0.9]);
    o += L(arc, OL, 12 * s) + L(arc, col, 8.4 * s) + L(arc, dk(col, 0.25), 2 * s, 0.6);
    var e = [x + Math.cos(a1) * rr, top + Math.sin(a1) * rr * 0.9];
    o += P(pd([[e[0] - 3 * s, e[1] - 5 * s], [e[0] + 4 * s, e[1] - 2 * s], [e[0] + 1 * s, e[1] + 1 * s], [e[0] + 4 * s, e[1] + 4 * s], [e[0] - 2 * s, e[1] + 5 * s]], true), c.cel(col), 1.2 * s);
    o += L('M' + pt([x1 - 3 * s, top - 2 * s]) + 'Q' + pt([x1 - 4 * s, top - 10 * s]) + ' ' + pt([x1 - 10 * s, top - 16 * s]), OL, 12 * s) + L('M' + pt([x1 - 3 * s, top - 2 * s]) + 'Q' + pt([x1 - 4 * s, top - 10 * s]) + ' ' + pt([x1 - 10 * s, top - 16 * s]), dk(col, 0.06), 8.4 * s);
    o += L('M' + pt([x0 - 2, top - rr * 0.35]) + 'Q' + pt([x0 + rr * 0.3, top - rr * 0.86]) + ' ' + pt([x - 2, top - rr * 0.92]), SNOW, 3.4 * s);
    var mx = x - rr * 0.36, my = top - rr * 0.8;
    return o + C(mx, my, 12 * s, glow(c, GHOST, 0.7)) + F('M' + pt([mx, my - 5 * s]) + 'A' + n(5 * s) + ',' + n(5 * s) + ' 0 1,0 ' + pt([mx, my + 5 * s]) + 'A' + n(6.5 * s) + ',' + n(6.5 * s) + ' 0 0,1 ' + pt([mx, my - 5 * s]) + 'Z', '#eaffff');
  }
  // highborne pavilion: a dais, columns under a beam, a shallow dome broken open on one side
  function pavilion(c, x, y, s, col) {
    col = col || ELF;
    var o = P(pd([[x - 40 * s, y], [x - 38 * s, y - 6 * s], [x + 38 * s, y - 6 * s], [x + 40 * s, y]], true), c.cel(dk(col, 0.12)), 1.4 * s), bt = y - 6 * s - 30 * s;
    o += elfColumn(c, x - 30 * s, y - 6 * s, 30 * s, 0.62 * s, false, col) + elfColumn(c, x - 10 * s, y - 6 * s, 30 * s, 0.62 * s, false, dk(col, 0.08)) + elfColumn(c, x + 10 * s, y - 6 * s, 30 * s, 0.62 * s, false, col) + elfColumn(c, x + 30 * s, y - 6 * s, 16 * s, 0.62 * s, true, dk(col, 0.05));
    o += P(pd([[x - 38 * s, bt], [x + 18 * s, bt], [x + 22 * s, bt - 3 * s], [x + 17 * s, bt - 6 * s], [x - 38 * s, bt - 6 * s]], true), c.cel(lt(col, 0.05)), 1.5 * s);
    var d = 'M' + pt([x - 34 * s, bt - 6 * s]) + 'C' + pt([x - 32 * s, bt - 26 * s]) + ' ' + pt([x - 4 * s, bt - 32 * s]) + ' ' + pt([x + 8 * s, bt - 22 * s]) + 'L' + pt([x + 4 * s, bt - 18 * s]) + 'L' + pt([x + 10 * s, bt - 14 * s]) + 'L' + pt([x + 6 * s, bt - 10 * s]) + 'L' + pt([x + 12 * s, bt - 6 * s]) + 'Z';
    o += body(c, d, col, F(pd([[x - 14 * s, bt - 34 * s], [x + 14 * s, bt - 34 * s], [x + 14 * s, bt], [x - 14 * s, bt]], true), dk(col, 0.22), 0.7) + L('M' + pt([x - 24 * s, bt - 8 * s]) + 'Q' + pt([x - 20 * s, bt - 22 * s]) + ' ' + pt([x - 6 * s, bt - 27 * s]) + 'M' + pt([x - 10 * s, bt - 7 * s]) + 'Q' + pt([x - 6 * s, bt - 20 * s]) + ' ' + pt([x + 2 * s, bt - 22 * s]), dk(col, 0.3), 1 * s), 1.6 * s);
    o += P('M' + pt([x - 33 * s, bt - 14 * s]) + 'C' + pt([x - 28 * s, bt - 28 * s]) + ' ' + pt([x - 6 * s, bt - 33 * s]) + ' ' + pt([x + 6 * s, bt - 24 * s]) + 'L' + pt([x, bt - 22 * s]) + 'C' + pt([x - 10 * s, bt - 26 * s]) + ' ' + pt([x - 26 * s, bt - 22 * s]) + ' ' + pt([x - 33 * s, bt - 14 * s]) + 'Z', SNOW, 1 * s);
    o += C(x - 20 * s, bt - 40 * s, 3 * s, glow(c, GHOST, 0.8)) + P(pd([[x - 22 * s, bt - 30 * s], [x - 20 * s, bt - 42 * s], [x - 18 * s, bt - 30 * s]], true), c.cel(lt(col, 0.1)), 1 * s);
    return o + drift(c, x + 30 * s, y, 22 * s, 5 * s) + drift(c, x - 36 * s, y, 18 * s, 4 * s);
  }
  function wisp(c, x, y, s) {
    return C(x, y, 12 * s, glow(c, GHOST, 0.7)) + P('M' + pt([x - 3 * s, y]) + 'C' + pt([x - 3 * s, y - 4 * s]) + ' ' + pt([x + 3 * s, y - 4 * s]) + ' ' + pt([x + 3 * s, y]) + 'C' + pt([x + 3 * s, y + 4 * s]) + ' ' + pt([x + 6 * s, y + 7 * s]) + ' ' + pt([x + 9 * s, y + 9 * s]) + 'C' + pt([x + 3 * s, y + 8 * s]) + ' ' + pt([x - 3 * s, y + 4 * s]) + ' ' + pt([x - 3 * s, y]) + 'Z', '#e8fcff', 0);
  }
  // ice thistle: a spiky blue-green bush with frosted spines and pale violet flower heads
  function iceThistle(c, x, y, s, seed) {
    var r = rng(seed || Math.round(x * 7 + y)), o = E(x, y + 1, 18 * s, 3 * s, '#1a2a3a', 0, 0.22), lv = '', fl = '';
    var col = '#4a8a90';
    for (var i = 0; i < 9; i++) {
      var a = -PI / 2 + (i / 8 - 0.5) * 2.4, len = (12 + r() * 9) * s, q = dirQ([x + (i / 8 - 0.5) * 12 * s, y], a);
      lv += P(pd([q(0, -2.6 * s), q(len * 0.5, -3.4 * s), q(len * 0.55, -6 * s), q(len * 0.7, -2.6 * s), q(len, 0), q(len * 0.7, 2.6 * s), q(len * 0.55, 6 * s), q(len * 0.5, 3.4 * s), q(0, 2.6 * s)], true), c.cel(i % 2 ? col : dk(col, 0.14)), 1 * s) + L('M' + pt(q(1, 0)) + 'L' + pt(q(len * 0.9, 0)), ICEL, 0.8 * s, 0.9);
      if (i % 2 === 0) { var tp = q(len + 3 * s, 0); fl += L('M' + pt(q(len * 0.6, 0)) + 'L' + pt(tp), OL, 2.2 * s) + L('M' + pt(q(len * 0.6, 0)) + 'L' + pt(tp), '#6a9a8a', 1 * s) + E(tp[0], tp[1], 3 * s, 3.2 * s, c.cel('#6a9a9a'), 0.9 * s) + P(pd([[tp[0] - 3.4 * s, tp[1] - 2], [tp[0] - 1.6 * s, tp[1] - 7 * s], [tp[0], tp[1] - 2.6 * s], [tp[0] + 1.8 * s, tp[1] - 7.4 * s], [tp[0] + 3.4 * s, tp[1] - 2]], true), c.cel('#b8a8f0'), 0.8 * s); }
    }
    return o + lv + fl + drift(c, x + 2 * s, y + 1, 26 * s, 3 * s);
  }
  // tall icy crag: jagged profile, shaded right, ice sheets on the lit faces, snow ledges and icicles
  function crag(c, x, y, w, h, seed, col) {
    col = col || CRAG;
    var r = rng(seed || 7), Lp = [], Rp = [], M = [], k = 9;
    for (var i = 0; i <= k; i++) {
      var t = i / k, yy = y - h * t, hw = w / 2 * (1 - t * 0.8) * (0.82 + r() * 0.3), step = i % 3 === 1 ? 6 : 0;
      Lp.push([x - hw - step - (i === k ? 0 : r() * 3), yy]); Rp.push([x + hw * 0.92 + r() * 5, yy - (i === k ? 8 : 0)]); M.push([x - hw * 0.1 + (r() - 0.5) * hw * 0.5, yy]);
    }
    var d = pd(Lp.concat(Rp.slice().reverse()), true);
    // lit left faces, shadowed right faces split along a crooked ridge, with facet lines
    var sh = F(pd(M.concat([[x + w, y - h - 12], [x + w, y + 4]]), true), dk(col, 0.3), 0.85), fac = '';
    for (var j = 1; j < k; j++) { fac += 'M' + pt(M[j]) + 'L' + pt(lerp2(Lp[j + 1], M[j + 1], 0.5)) + 'M' + pt(M[j]) + 'L' + pt(lerp2(M[j - 1], Rp[j - 1], 0.6)); }
    // ice flows streaming down the lit faces
    var ice = '';
    [[0.28, 0.9, 0.35], [0.55, 0.62, 0.3], [0.8, 0.3, 0.22]].forEach(function (q, qi) {
      var yt = y - h * q[0], yb = Math.min(y, yt + h * q[2]), hwt = w / 2 * (1 - q[0] * 0.8), xl = x - hwt * q[1];
      ice += F('M' + pt([xl, yt]) + 'L' + pt([xl + hwt * 0.4, yt - 2]) + 'C' + pt([xl + hwt * 0.44, yt + (yb - yt) * 0.5]) + ' ' + pt([xl + hwt * 0.3, yb - 6]) + ' ' + pt([xl + hwt * 0.22, yb]) + 'L' + pt([xl + hwt * 0.12, yb - 8]) + 'L' + pt([xl + hwt * 0.04, yb - 2]) + 'C' + pt([xl - 2, yt + (yb - yt) * 0.5]) + ' ' + pt([xl - 1, yt + 6]) + ' ' + pt([xl, yt]) + 'Z', c.lg([[0, ICEL, 0.9], [1, ICE, 0.6]])) +
        L('M' + pt([xl + hwt * 0.12, yt + 3]) + 'L' + pt([xl + hwt * 0.14, yb - 10]), '#ffffff', 1.2, 0.85);
    });
    // short snow ledges on alternating sides
    var ledge = '', ic = '';
    [[2, -1], [4, 1], [6, -1], [7, 1]].forEach(function (q) {
      var j2 = q[0], p = q[1] < 0 ? Lp[j2] : Rp[j2], len2 = w / 2 * (1 - j2 / k * 0.8) * 0.8, x0 = q[1] < 0 ? p[0] - 2 : p[0] - len2, x1 = x0 + len2 + 2, yy2 = p[1];
      ledge += P('M' + pt([x0, yy2]) + 'Q' + pt([(x0 + x1) / 2, yy2 - 6]) + ' ' + pt([x1, yy2 - 1]) + 'L' + pt([x1 - 3, yy2 + 3]) + 'Q' + pt([(x0 + x1) / 2, yy2 + 1]) + ' ' + pt([x0 + 2, yy2 + 3]) + 'Z', SNOW, 1.1);
      ic += icicles(c, x0 + 3, x1 - 4, yy2 + 2.5, 9, seed + j2, ICEL);
    });
    return body(c, d, col, sh + ice + L(fac, dk(col, 0.42), 1.2, 0.9), 2) + ledge + ic +
      P(pd([Lp[k], [Lp[k][0] + 4, Lp[k][1] - 5], [Rp[k][0] - 2, Rp[k][1] - 3], Rp[k], [x + 2, y - h + 9]], true), SNOW, 1.2) + drift(c, x - w * 0.3, y + 1, w * 0.5, 7) + drift(c, x + w * 0.34, y + 1, w * 0.4, 5);
  }
  // canyon wall as an arbitrary outline, with rock bands, ice sheets and icicles hanging from overhang points
  // canyon wall: rock plates in two tones clipped to the outline, cracks, snow caps on chosen edge spans with icicles under them
  function gorgeWall(c, pts, col, seed, caps, dark) {
    var d = pd(pts, true), r = rng(seed || 5), plates = '', cr = '';
    var bx0 = 400, bx1 = 0; pts.forEach(function (p) { bx0 = Math.min(bx0, p[0]); bx1 = Math.max(bx1, p[0]); });
    bx0 = Math.max(-10, bx0); bx1 = Math.min(410, bx1);
    for (var i = 0; i < 24; i++) {
      var gx = i % 3, gy = Math.floor(i / 3), px = bx0 + (bx1 - bx0) * gx / 3 + (r() - 0.5) * 20 + (gy % 2 ? 12 : -12), py = gy * 34 - 12 + (r() - 0.5) * 14, pw = (bx1 - bx0) / 3 + r() * 16, ph = 26 + r() * 18, sk = (r() - 0.5) * 30;
      var q = [[px, py], [px + pw * 0.55, py - 6 + sk * 0.2], [px + pw, py + ph * 0.35], [px + pw * 0.85 + sk, py + ph], [px + sk * 0.5, py + ph * 0.85]];
      plates += F(pd(q, true), r() < 0.5 ? lt(col, 0.1) : dk(col, 0.08), 0.9) + F(pd([q[1], q[2], q[3], [px + pw * 0.55, py + ph * 0.55]], true), dk(col, 0.26), 0.6) + L('M' + pt(q[4]) + 'L' + pt(q[0]) + 'L' + pt(q[1]), lt(col, 0.3), 1.1, 0.8) + L('M' + pt(q[2]) + 'L' + pt(q[3]) + 'L' + pt(q[4]), dk(col, 0.4), 1.2, 0.85);
      if (i % 3 === 0) cr += 'M' + pt([px + pw * 0.3, py + ph * 0.2]) + 'l' + n(4 + r() * 6) + ',' + n(8 + r() * 8) + 'l' + n(-3) + ',' + n(8 + r() * 8);
    }
    var o = body(c, d, col, plates + L(cr, dk(col, 0.45), 1.2, 0.9) + (dark ? F(dark, dk(col, 0.3), 0.55) : ''), 2);
    (caps || []).forEach(function (q) {
      var a = pts[q[0]], b = pts[q[1]], m = lerp2(a, b, 0.5), up = q[3] || -1;
      o += P('M' + pt([a[0] - 2, a[1] + 1]) + 'Q' + pt([m[0] - 3, m[1] - 11]) + ' ' + pt([b[0] + 2, b[1] - 1]) + 'Q' + pt([b[0] - 1, b[1] + 5]) + ' ' + pt(lerp2(b, a, 0.2)) + 'Q' + pt([m[0], m[1] + 4]) + ' ' + pt(lerp2(a, b, 0.2)) + 'Q' + pt([a[0] + 1, a[1] + 5]) + ' ' + pt([a[0] - 2, a[1] + 1]) + 'Z', SNOW, 1.2) + L('M' + pt(lerp2(a, b, 0.25)) + 'Q' + pt([m[0], m[1] - 1]) + ' ' + pt(lerp2(a, b, 0.75)), SNOWS, 1.2, 0.7);
      var tip = a[1] > b[1] ? a : b;
      if (q[2]) o += icicles(c, tip[0] - 9, tip[0] + 3, tip[1] + 1, q[2], seed + q[0] * 7, ICEL);
    });
    return o;
  }
  // translucent sheet of ice with glints (no hard frame)
  function iceSheet(c, pts, op) {
    var a = pts[0], b = pts[Math.floor(pts.length / 2)];
    return F(pd(pts, true), c.lg([[0, ICEL, op || 0.75], [1, ICE, (op || 0.75) * 0.5]], 0, 0, 1, 1)) + L(pd(pts, true), '#ffffff', 0.8, 0.35) +
      L('M' + pt(lerp2(a, b, 0.2)) + 'L' + pt(lerp2(a, b, 0.45)) + 'M' + pt(lerp2(a, b, 0.55)) + 'L' + pt(lerp2(a, b, 0.62)), '#ffffff', 1.4, 0.8);
  }
  // frozen seep down a rock face: wavy top, dripping bottom, glassy streaks
  function iceFlow(c, x, yt, w, h, seed) {
    var r = rng(seed || 5), d = 'M' + pt([x, yt]) + 'Q' + pt([x + w * 0.5, yt - 4]) + ' ' + pt([x + w, yt + 2]) + 'L' + pt([x + w * 0.96, yt + h * 0.8]), k = 4;
    for (var i = k; i >= 0; i--) { var xx = x + w * i / k * 0.96, dy = i % 2 ? h * (0.9 + r() * 0.25) : h * (0.72 + r() * 0.1); d += 'L' + pt([xx + 2, yt + dy * 0.9]) + 'L' + pt([xx, yt + dy]) + 'L' + pt([xx - 2, yt + dy * 0.9]); }
    d += 'Z';
    return F(d, c.lg([[0, ICEL, 0.85], [1, ICE, 0.55]])) + L(d, '#ffffff', 0.8, 0.5) + L('M' + pt([x + w * 0.25, yt + 4]) + 'L' + pt([x + w * 0.22, yt + h * 0.7]) + 'M' + pt([x + w * 0.6, yt + 6]) + 'L' + pt([x + w * 0.62, yt + h * 0.5]), '#ffffff', 1.3, 0.85);
  }
  // fallen ice shards on the floor
  function shards(c, x, y, s, seed) { var r = rng(seed || 3); return E(x, y + 1, 10 * s, 2.4 * s, '#1a2a3a', 0, 0.22) + crystal(c, x - 4 * s, y, 9 * s, 4 * s, -PI / 2 - 0.5 - r() * 0.3, ICEL) + crystal(c, x + 3 * s, y, 12 * s, 5 * s, -PI / 2 + 0.2, ICE) + crystal(c, x + 8 * s, y, 7 * s, 3.4 * s, -PI / 2 + 0.8, ICEL); }
  // wind-blown snow streaks
  function gusts(seed, cnt, y0, y1, op) { var r = rng(seed), d = ''; for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 20 + r() * 40; d += 'M' + pt([x, y]) + 'q' + n(w * 0.5) + ',' + n(-4) + ' ' + n(w) + ',' + n(-1); } return L(d, '#ffffff', 1.3, op || 0.5); }
  // dragon scales carved into a wall: rows of overlapping arcs inside a panel
  function scalePanel(c, x0, y0, x1, y1, col, glowCol) {
    var o = '', row = 0, d = '', sw = 12;
    for (var y = y0; y < y1; y += 8) { for (var x = x0 + (row % 2 ? sw / 2 : 0); x < x1; x += sw) d += 'M' + pt([x - sw / 2, y]) + 'Q' + pt([x - sw / 2, y + 8]) + ' ' + pt([x, y + 9]) + 'Q' + pt([x + sw / 2, y + 8]) + ' ' + pt([x + sw / 2, y]); row++; }
    o += L(d, dk(col, 0.35), 1.3, 0.85) + L(d.replace(/Q/g, 'Q'), lt(col, 0.2), 0.5, 0.35);
    return o + (glowCol ? C((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.5, glow(c, glowCol, 0.18)) : '');
  }
  // glowing rune: a few strokes within a circle of radius r (no letters, just marks)
  function rune(c, x, y, r, col, k) {
    // dragon-eye lens, clawed branch, crescent with a spine, three-point star (marks, not letters)
    var ds = [
      'M' + pt([x - r, y]) + 'Q' + pt([x, y - r * 1.1]) + ' ' + pt([x + r, y]) + 'Q' + pt([x, y + r * 1.1]) + ' ' + pt([x - r, y]) + 'Z M' + pt([x, y - r * 0.4]) + 'L' + pt([x, y + r * 0.4]),
      'M' + pt([x - r * 0.9, y - r * 0.6]) + 'Q' + pt([x - r * 0.3, y - r * 0.1]) + ' ' + pt([x - r * 0.5, y + r]) + 'M' + pt([x - r * 0.1, y - r]) + 'Q' + pt([x + r * 0.4, y - r * 0.2]) + ' ' + pt([x + r * 0.1, y + r * 0.8]) + 'M' + pt([x + r * 0.6, y - r * 0.7]) + 'Q' + pt([x + r * 1.0, y]) + ' ' + pt([x + r * 0.7, y + r * 0.6]),
      'M' + pt([x + r * 0.5, y - r]) + 'A' + n(r) + ',' + n(r) + ' 0 1,0 ' + pt([x + r * 0.5, y + r]) + 'M' + pt([x + r * 0.2, y - r * 0.2]) + 'L' + pt([x + r * 0.2, y + r * 0.2]) + 'M' + pt([x + r * 0.8, y - r * 0.5]) + 'L' + pt([x + r * 0.8, y - r * 0.2]) + 'M' + pt([x + r * 0.8, y + r * 0.2]) + 'L' + pt([x + r * 0.8, y + r * 0.5]),
      'M' + pt([x, y]) + 'L' + pt([x, y - r]) + 'M' + pt([x, y]) + 'L' + pt([x - r * 0.9, y + r * 0.6]) + 'M' + pt([x, y]) + 'L' + pt([x + r * 0.9, y + r * 0.6]) + 'M' + pt([x - r * 0.4, y - r * 0.5]) + 'L' + pt([x + r * 0.4, y - r * 0.5])
    ];
    var d = ds[(k || 0) % ds.length];
    return C(x, y, r * 2.4, glow(c, col, 0.55)) + L(d, dk(col, 0.4), 3) + L(d, lt(col, 0.45), 1.4);
  }
  // runic floor circle seen in perspective
  function runeRing(c, x, y, rx, ry, col) {
    var o = E(x, y, rx * 1.3, ry * 1.6, glow(c, col, 0.4)) + E(x, y, rx, ry, 'none', 0) + L(ellD(x, y, rx, ry), dk(col, 0.3), 3.2) + L(ellD(x, y, rx, ry), lt(col, 0.4), 1.4) + L(ellD(x, y, rx * 0.72, ry * 0.72), lt(col, 0.3), 1, 0.8), d = '';
    for (var i = 0; i < 12; i++) { var a = PI * 2 * i / 12, x0 = x + Math.cos(a) * rx * 0.76, y0 = y + Math.sin(a) * ry * 0.76, x1 = x + Math.cos(a) * rx * 0.96, y1 = y + Math.sin(a) * ry * 0.96; d += 'M' + pt([x0, y0]) + 'L' + pt([x1, y1]); }
    return o + L(d, lt(col, 0.5), 1.2);
  }
  // carved dragon head relief on a cave wall (facing the viewer), glowing eyes
  function dragonRelief(c, x, y, s, col) {
    var o = '', q = function (a) { return a.map(function (p) { return [x + p[0] * s, y + p[1] * s]; }); };
    o += P(pd(q([[-18, -14], [-34, -40], [-26, -10]]), true), c.cel(dk(col, 0.1)), 1.4) + P(pd(q([[18, -14], [34, -40], [26, -10]]), true), c.cel(dk(col, 0.2)), 1.4);
    o += body(c, pd(q([[-24, -18], [-12, -26], [12, -26], [24, -18], [22, 4], [12, 26], [0, 32], [-12, 26], [-22, 4]]), true), col, F(pd(q([[2, -30], [30, -30], [30, 36], [2, 36]]), true), dk(col, 0.25), 0.7) + L(pd(q([[-10, -18], [0, -8], [10, -18]])) + pd(q([[-8, 10], [0, 18], [8, 10]])), dk(col, 0.4), 1.3), 1.8);
    o += gEye(c, x - 10 * s, y - 8 * s, 2.4 * s, FROST) + gEye(c, x + 10 * s, y - 8 * s, 2.4 * s, FROST) + E(x - 4 * s, y + 22 * s, 1.6 * s, 1.2 * s, OL) + E(x + 4 * s, y + 22 * s, 1.6 * s, 1.2 * s, OL);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  function wSky(c, top, mid, bot) { return sky(c, top || '#86acd8', mid || '#c8dcf0', bot || '#eef4fa'); }
  var SCENES = {
    everlook: function (c) {
      var o = wSky(c, '#7ea4d4', '#d4e0f0', '#f8e8dc') + C(318, 70, 90, glow(c, '#ffe8c8', 0.55)) + C(318, 70, 12, '#fff6e6');
      o += cloud(90, 40, 1.1, 0.8, '#f4f6fa') + cloud(250, 28, 0.8, 0.7, '#f8f2ee');
      o += peaks(c, 2101, 108, 64, '#98a8c4', '#f4f8fc', 110) + peaks(c, 2102, 118, 36, '#8294b4', '#eef4fa', 80);
      o += pineRow(2103, 124, -10, 410, 34, 16, 30, '#46626a', '#e8f0f6');
      o += snowField(c, 122, '#eef4fa', '#b8cadf', 2104);
      // the town wall and its gate
      o += palisade(c, -4, 150, 124, 30, 2105) + palisade(c, 214, 404, 124, 30, 2106);
      o += limb('M150,126 L150,84 M214,126 L214,84', WOODD, 5) + P('M144,86 L220,86 L220,78 L182,70 L144,78 Z', c.cel(WOOD), 1.8) + P('M142,79 L182,69 L222,79 L222,76 L182,66 L142,76 Z', SNOW, 1.2) + lantern(c, 156, 88, 0.9) + lantern(c, 208, 88, 0.9) + gearSign(c, 182, 72, 0.8);
      o += F('M154,124 L210,124 L240,150 L130,150 Z', SNOWM, 0.7);
      // the inn on the left, a smithy on the right
      o += woodHouse(c, 10, 150, 116, 52, { chimney: 0.78, win: [[0.18, 0.5], [0.46, 0.5], [0.82, 0.5]], door: 0.64, sign: 0.34, roof: '#5a3a30' });
      o += woodHouse(c, 318, 128, 78, 40, { chimney: 0.3, win: [[0.28, 0.52]], door: 0.7, roof: '#4a3a3a', wall: dk(WOOD, 0.05) });
      o += woodHouse(c, 236, 122, 52, 30, { win: [[0.5, 0.5]], roof: '#5a4034', wall: lt(WOOD, 0.05) });
      o += lanternLine(c, 126, 104, 238, 96, 6, 3, 0.8) + lanternLine(c, 288, 96, 318, 92, 3, 1, 0.8);
      // goblin guards in fur caps
      o += guard(c, 164, 134, 0.34) + guard(c, 204, 134, 0.34, true);
      o += barrel(c, 132, 172, 1, '#7a5a3a') + barrel(c, 146, 178, 0.9, '#6a4a30') + crate(c, 116, 186, 1.1) + sack(c, 272, 160, 0.8) + crate(c, 292, 164, 0.8, '#b8844a');
      o += drift(c, 30, 238, 70, 12) + drift(c, 372, 236, 80, 14) + drift(c, 200, 214, 60, 5);
      return o + flakes(2107, 40, 0, 236) + vignette(c, '#fff8f0', '#2a3a5a');
    },
    frostsaber_rock: function (c) {
      var o = wSky(c, '#6e9ad0', '#bcd4ee', '#eef4fa') + sun(c, 330, 36, 11, '#fffaf0') + cloud(70, 34, 1, 0.8) + cloud(236, 50, 0.7, 0.7);
      o += peaks(c, 2201, 106, 70, '#9eb0cc', '#f6f9fc', 120) + pineRow(2202, 122, -10, 410, 30, 20, 38, '#3c5a60', '#e8f0f6');
      o += snowField(c, 120, '#eef4fa', '#b4c6dc', 2203);
      // the crag
      o += crag(c, 150, 128, 120, 118, 2204) + crag(c, 88, 126, 48, 58, 2205, dk(CRAG, 0.05));
      o += pine(c, 36, 132, 0.95) + pine(c, 214, 130, 0.72) + pine(c, 240, 126, 0.55) + pine(c, 386, 136, 1.05) + pine(c, 350, 124, 0.6);
      o += snowRock(c, 262, 150, 30, 12, '#7a869c') + snowRock(c, 190, 148, 24, 10, '#7a869c') + snowRock(c, 22, 176, 34, 14, '#6e7a92');
      o += pawPrints(2206, [[196, 206, 1.3], [210, 196, 1.3], [226, 188, 1.2], [238, 178, 1.1], [254, 172, 1.05], [266, 164, 1], [282, 160, 0.95], [296, 154, 0.9]]);
      o += drift(c, 110, 238, 90, 12) + drift(c, 330, 236, 70, 10) + pine(c, 16, 240, 1.25);
      return o + flakes(2207, 36, 0, 236) + vignette(c, '#f4f8ff', '#1e2e4a');
    },
    winterfall_village: function (c) {
      var o = sky(c, '#2a3264', '#6a6aa0', '#d8b8c4') + stars(2301, 30, 70) + aurora(c, 2302, 22, 10, 44, AUR1, 0.5) + aurora(c, 2303, 38, 8, 30, AUR2, 0.35);
      o += peaks(c, 2304, 104, 56, '#56608a', '#c8d0e8', 110) + pineRow(2305, 126, -10, 410, 40, 26, 50, '#243a44', '#b8c8dc') + pineRow(2306, 128, -10, 410, 22, 34, 58, '#1c2e36', '#a8b8d0');
      o += snowField(c, 124, '#c8d4ea', '#8a9cc0', 2307);
      o += F('M120,130 C180,128 240,134 280,142 L330,242 L110,242 Z', '#b0bedc', 0.55);
      o += hideHut(c, 196, 128, 0.78, dk(HIDE, 0.05)) + wTotem(c, 132, 132, 0.8) + wTotem(c, 262, 128, 0.72);
      o += hideHut(c, 62, 144, 1.18) + hideHut(c, 360, 130, 0.9, lt(HIDE, 0.06));
      o += pine(c, 8, 150, 1.1, PINED, '#d8e0f0') + pine(c, 398, 160, 1.2, PINED, '#d8e0f0');
      o += campfire(c, 170, 170, 0.9) + barrel(c, 120, 184, 0.85, '#6a4a30') + barrel(c, 106, 190, 0.75, '#5a3e28') + bone(236, 176, 12, 0.4, 1) + bearSkull(c, 300, 200, 0.7);
      o += drift(c, 40, 238, 90, 12) + drift(c, 360, 236, 80, 10);
      return o + flakes(2308, 30, 0, 236, '#eef2ff') + R(0, 0, 400, 240, c.lg([[0, '#1a1840', 0.12], [0.6, '#1a1840', 0], [1, '#1a1840', 0.3]]));
    },
    lake_keltheril: function (c) {
      var o = sky(c, '#0e1636', '#26386a', '#5a6ea4') + stars(2401, 60, 110) + aurora(c, 2402, 14, 12, 60, AUR1, 0.6) + aurora(c, 2403, 34, 10, 40, AUR2, 0.45);
      o += C(66, 36, 30, glow(c, '#e8f4ff', 0.6)) + F('M66,24 A12,12 0 1,0 66,48 A15,15 0 0,1 66,24 Z', '#f4faff');
      o += peaks(c, 2404, 106, 58, '#3a4a7a', '#b8c8e4', 120) + pineRow(2405, 122, -10, 410, 34, 16, 32, '#1c2a44', '#90a4c8');
      o += snowField(c, 120, '#b8c8e4', '#7a90bc', 2406);
      // the frozen lake with the aurora in it
      o += frozenLake(c, 248, 144, 190, 24, 2407) + E(248, 140, 150, 8, AUR1, 0, 0.12) + E(230, 150, 90, 5, AUR2, 0, 0.12);
      o += pavilion(c, 190, 124, 0.9) + elfColumn(c, 326, 126, 38, 0.7, true) + elfColumn(c, 370, 136, 52, 0.8, false);
      o += elfArch(c, 60, 176, 70, 66, 1);
      o += wisp(c, 150, 96, 1) + wisp(c, 300, 108, 0.8) + wisp(c, 232, 70, 0.7) + wisp(c, 96, 130, 0.9) + wisp(c, 352, 90, 0.7);
      o += snowRock(c, 150, 186, 30, 12, '#56648a') + drift(c, 300, 236, 110, 12) + drift(c, 20, 238, 60, 10);
      return o + motes(2408, 30, 20, 380, 60, 200, '#c8fcff') + flakes(2409, 18, 0, 236, '#e8f0ff') + R(0, 0, 400, 240, c.lg([[0, '#0a0a2a', 0], [0.6, '#0a0a2a', 0], [1, '#0a0a2a', 0.35]]));
    },
    ice_thistle_hills: function (c) {
      var o = wSky(c, '#9ab8dc', '#d4e2f2', '#f2f6fb') + cloud(96, 30, 1.2, 0.85) + cloud(292, 44, 1, 0.8) + cloud(370, 22, 0.6, 0.7);
      o += peaks(c, 2501, 100, 50, '#a8b8d2', '#f6f9fc', 130);
      o += hills(c, 2502, 116, 30, '#dfe8f4', 70, 1.4) + hills(c, 2503, 124, 20, '#eaf0f8', 90, 1.4);
      o += pineRow(2504, 118, 20, 160, 7, 14, 24, '#4a6670', '#eef4f8');
      o += snowField(c, 124, '#f0f5fa', '#b6c8de', 2505);
      // the yeti cave in the near hill
      o += P('M250,130 C262,92 322,86 350,112 C362,122 368,128 372,132 Z', c.cel('#e8eff7'), 1.8) + P('M288,130 C288,112 318,110 320,130 Z', c.lg([[0, '#101624'], [1, '#2a3448']]), 1.6) + icicles(c, 290, 318, 116, 8, 2506, ICEL) + skull(c, 334, 134, 0.6);
      o += snowRock(c, 84, 134, 36, 16, '#7a869c') + snowRock(c, 200, 140, 26, 11, '#7e8aa0') + snowRock(c, 376, 150, 40, 18, '#6e7a92');
      o += iceThistle(c, 130, 142, 0.9) + iceThistle(c, 236, 136, 0.7) + iceThistle(c, 30, 170, 1.2) + iceThistle(c, 364, 186, 1.1) + iceThistle(c, 184, 208, 1.3);
      o += pine(c, 16, 142, 0.8) + drift(c, 90, 238, 100, 12) + drift(c, 300, 238, 80, 10);
      return o + flakes(2507, 34, 0, 236) + vignette(c, '#f8fbff', '#243450');
    },
    frostwhisper_gorge: function (c) {
      var o = wSky(c, '#a0c0e0', '#d8e6f4', '#eef4fa');
      // the far end: a frozen fall between the walls
      o += P('M110,126 L120,56 L160,46 L200,54 L240,44 L290,58 L304,126 Z', c.lg([[0, '#b8d8ee'], [1, '#e4f2fb']]), 1.4) + L('M140,60 L136,124 M170,52 L168,124 M206,56 L210,124 M236,50 L240,124 M266,56 L272,124', '#ffffff', 1.4, 0.8) + L('M152,58 L150,124 M190,54 L188,124 M252,52 L256,124', ICED, 1, 0.5);
      o += snowField(c, 124, '#e6eef8', '#a4b8d4', 2601) + mist(c, 122, 16, '#ffffff', 0.35, 2613);
      o += F('M110,124 L310,124 L360,242 L40,242 Z', '#f0f5fb', 0.6) + E(206, 156, 52, 7, '#a8d4f0', 0, 0.45) + E(200, 154, 40, 3, '#ffffff', 0, 0.5) + E(126, 206, 44, 8, '#a8d4f0', 0, 0.4) + E(120, 204, 30, 3, '#ffffff', 0, 0.5);
      // the walls
      var lw = [[-10, -10], [128, -10], [116, 22], [136, 44], [118, 70], [128, 98], [112, 126], [100, 156], [56, 196], [14, 232], [-10, 250]];
      var rw = [[410, -10], [270, -10], [288, 20], [266, 46], [284, 72], [274, 100], [318, 124], [372, 142], [410, 156]];
      o += gorgeWall(c, lw, '#6e7e9c', 2602, [[2, 3, 14], [4, 5, 10], [6, 7, 0]], 'M84,-20 L150,-20 L150,260 L40,260 C80,200 100,120 84,-20 Z');
      o += gorgeWall(c, rw, '#6a7a98', 2603, [[2, 3, 14], [4, 5, 10], [6, 7, 0]], 'M400,-20 L420,-20 L420,260 L380,260 C396,190 404,120 400,-20 Z');
      o += iceFlow(c, 30, 30, 44, 70, 2614) + iceFlow(c, 306, 30, 40, 64, 2615) + iceFlow(c, 12, 140, 46, 50, 2616) + iceFlow(c, 350, 84, 36, 40, 2617);
      o += icicles(c, 112, 132, 0, 30, 2604) + icicles(c, 266, 292, 0, 32, 2605);
      o += shards(c, 176, 192, 1, 2610) + shards(c, 250, 170, 0.8, 2611) + shards(c, 70, 214, 1.1, 2612) + snowRock(c, 150, 136, 20, 8, '#6e7e9c') + snowRock(c, 262, 140, 16, 7, '#6e7e9c');
      o += drift(c, 110, 140, 50, 8) + drift(c, 322, 134, 44, 7) + drift(c, 60, 206, 70, 10) + boulder(c, 292, 150, 10, 6, '#6a7a98', 2618);
      o += drift(c, 200, 238, 110, 10) + drift(c, 380, 238, 60, 12);
      return o + gusts(2608, 18, 60, 220, 0.55) + flakes(2609, 40, 0, 236) + vignette(c, '#f4faff', '#1a2a48');
    },
    mazthoril: function (c) {
      var o = R(0, 0, 400, 240, '#0c1426') + R(0, 0, 400, 124, c.lg([[0, '#0a1020'], [0.6, '#1a2a4a'], [1, '#182644']]));
      o += C(200, 76, 170, glow(c, '#5aa8ff', 0.3));
      o += hills(c, 2701, 122, 70, '#1a2846', 26, 1.2) + hills(c, 2702, 122, 40, '#22345a', 36, 1.4);
      o += scalePanel(c, 40, 50, 160, 116, '#22345a', FROST) + scalePanel(c, 240, 44, 370, 116, '#22345a', FROST);
      o += dragonRelief(c, 200, 70, 1.1, '#3a5484') + rune(c, 70, 84, 7, FROST, 0) + rune(c, 130, 70, 6, ARC, 1) + rune(c, 276, 72, 6, ARC, 2) + rune(c, 334, 86, 7, FROST, 3);
      o += cluster(c, 98, 118, 1.0, '#6ab8ff', 2703) + cluster(c, 300, 116, 1.1, '#8ad0ff', 2704) + cluster(c, 158, 120, 0.55, '#a8e0ff', 2705) + cluster(c, 250, 120, 0.6, '#6ab8ff', 2706);
      o += ceiling(c, 2707, 18, 26, '#0a1020', 30, 1.6) + stalacRow(c, 2708, [26, 90, 150, 240, 290, 352, 390], 22, '#2a3e64', 16, 34) + icicles(c, 60, 140, 26, 16, 2709) + icicles(c, 250, 340, 24, 18, 2710);
      o += cluster(c, 120, 28, 0.7, '#6ab8ff', 2711, { down: true }) + cluster(c, 300, 32, 0.8, '#8ad0ff', 2712, { down: true });
      o += caveFloor(c, 118, '#34507c', '#162440', 2713);
      o += F('M160,118 L240,118 L320,242 L80,242 Z', '#4a6a9a', 0.35) + E(130, 196, 44, 6, '#8ac8f0', 0, 0.22) + E(290, 212, 52, 7, '#8ac8f0', 0, 0.2) + E(250, 132, 30, 3.4, '#8ac8f0', 0, 0.25);
      o += boulder(c, 60, 150, 12, 7, '#2e4468', 2718) + boulder(c, 346, 150, 14, 8, '#2e4468', 2719) + shards(c, 150, 214, 0.9, 2720) + shards(c, 330, 196, 0.8, 2721) + pebbles(2722, 130, 236, '#4a6488', 18);
      o += runeRing(c, 200, 150, 62, 11, FROST) + E(200, 150, 40, 6, FROST, 0, 0.18);
      o += cluster(c, 8, 240, 1.2, '#6ab8ff', 2714) + cluster(c, 394, 238, 1.3, '#8ad0ff', 2715) + cluster(c, 40, 196, 0.6, '#a8e0ff', 2716);
      return o + motes(2717, 30, 20, 380, 30, 220, '#c8ecff') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    }
  };
  // Everlook guard: a goblin in a fur-trimmed coat and fur cap, standing in a scene; foot at (x, y)
  function guard(c, x, y, s, flip) {
    var g = gob(c, {
      skin: '#6aa84a', shirt: '#8a2e22', sleeve: '#8a2e22', forearm: '#8a2e22', pants: '#3a3a44', hat: '#6a4a34', hatStyle: 'cap', belt: '#3a2a1a', buckle: GOLD, boots: '#2a2220', legW: 11, armW: 10, shadowR: 34,
      torsoD: 'M42,50 C50,42 78,42 86,50 L88,74 L86,92 L42,92 L40,74 Z',
      front: function (c) { return P(shag(64, 90, 24, 4, 10, 0.3, 61), c.cel('#e8e0d0'), 1.4); },
      pads: function (c) { return P(shag(64, 48, 22, 6, 10, 0.3, 62), c.cel('#e8e0d0'), 1.5); },
      near: [[46, 56], [38, 44], [34, 30]], wNear: function (c, p) { return axe(c, p, 30, -PI / 2 - 0.15, 12, '#b8bcc4', false, '#4a3222'); },
      scale: 0.9
    });
    var m = flip ? 'matrix(' + n(-s) + ',0,0,' + n(s) + ',' + n(x + 64 * s) + ',' + n(y - 122 * s) + ')' : 'matrix(' + n(s) + ',0,0,' + n(s) + ',' + n(x - 64 * s) + ',' + n(y - 122 * s) + ')';
    return G(g, m);
  }

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // firewater jug hanging from a hand
  function jug(c, p) {
    var x = p[0], y = p[1] + 4;
    return L('M' + pt([x, y - 4]) + 'L' + pt([x, y + 2]), OL, 1.2) + P('M' + pt([x - 5, y + 3]) + 'C' + pt([x - 9, y + 8]) + ' ' + pt([x - 8, y + 17]) + ' ' + pt([x, y + 18]) + 'C' + pt([x + 8, y + 17]) + ' ' + pt([x + 9, y + 8]) + ' ' + pt([x + 5, y + 3]) + 'Z', c.cel('#a8845a'), 1.5) + R(x - 3, y, 6, 4, c.cel('#6a4a2a'), 1) + E(x, y + 11, 5, 2.4, '#5a3e24', 0.8) + C(x + 2, y + 15, 5, glow(c, TAINT, 0.5));
  }
  // winter totem staff: carved pole, bear skull, a frost crystal in the jaws, bead strings
  function frostStaff(c, top, bot) {
    var d = 'M' + pt(top) + 'L' + pt(bot), o = limb(d, '#7a5434', 3.6) + L(d, '#a87a4a', 1, 0.6), x = top[0], y = top[1];
    o += C(x, y - 16, 16, glow(c, FROST, 0.6)) + crystal(c, x, y - 6, 16, 7, -PI / 2, '#a8e4ff');
    o += bearSkull(c, x, y - 2, 0.9) + L('M' + pt([x - 7, y + 4]) + 'Q' + pt([x - 10, y + 12]) + ' ' + pt([x - 8, y + 18]) + 'M' + pt([x + 7, y + 4]) + 'Q' + pt([x + 10, y + 10]) + ' ' + pt([x + 9, y + 16]), '#3a2a1a', 0.9);
    [[x - 9, y + 10], [x - 8.4, y + 15], [x + 9.6, y + 9], [x + 9, y + 14]].forEach(function (b, i) { o += C(b[0], b[1], 1.8, i % 2 ? '#e8e0c8' : '#3a78c8', 0.7); });
    return o + feather(c, x - 8, y + 18, PI / 2 + 0.2, 10, '#f0ece2', '#3a78c8');
  }
  function snowClump(c, x, y, w) { return P(shag(x, y, w, w * 0.4, 6, 0.3, Math.round(x * 3 + y)), SNOW, 1.2) + E(x + w * 0.3, y + w * 0.1, w * 0.4, w * 0.12, SNOWS, 0, 0.6); }
  // ---- sabercat (facing left) ----
  function catHead(c, x, y, o) {
    var fur = o.fur, st = o.stripe, k = o.k || 1, s = '', ruff = o.ruff || lt(fur, 0.3);
    // far ear, cheek ruff, head
    s += P(pd([[2, -14], [7, -28], [12, -11]], true), c.cel(dk(fur, 0.15)), 1.6) + L('M7,-28 l0.6,-3', OL, 1.4);
    s += P(shag(6, 4, 11, 10, 7, 0.3, o.seed || 3, 0.4), c.cel(ruff), 1.6);
    var hd = 'M13,-8 C11,-17 0,-19 -8,-15 C-14,-12 -17,-7 -19,-1 L-21,2 C-22,6 -18,9 -13,9 L2,11 C10,9 15,2 13,-8 Z';
    s += body(c, hd, fur, F('M3,-20 L18,-20 L18,14 L2,14 C8,4 8,-10 3,-20 Z', dk(fur, 0.22), 0.8) + E(-14, 4, 7, 4.4, lt(fur, 0.35), 0, 0.9) +
      L('M-2,-17 l-2,6 M3,-17 l-1,6 M8,-14 l-2,5 M6,-2 q-4,2 -6,6 M10,-4 q-3,3 -4,7', st, 1.8), 2.2);
    if (o.roar) {
      s += P('M-20,4 C-16,6 -8,7 -2,6 L-4,18 C-10,20 -17,17 -20,12 Z', c.cel(lt(fur, 0.2)), 1.8) + P('M-19,5 C-14,7 -8,8 -3,7 L-5,14 C-10,15 -15,13 -18,10 Z', '#5a1018', 1.2);
      s += P(pd([[-17, 5], [-16, 14], [-14.4, 5.6]], true), '#f4f0e4', 0.8) + P(pd([[-9, 6.6], [-8.4, 13], [-7, 6.8]], true), '#f4f0e4', 0.8) + P(pd([[-16, 16], [-15, 11], [-14, 16]], true), '#f4f0e4', 0.6);
    } else {
      s += L('M-20,5 Q-14,8 -6,7', OL, 1.4);
      s += P('M-16.6,5.6 C-16.6,10 -15.6,14 -14,17 C-13.6,13 -13.6,9 -13.6,6.2 Z', '#f4f0e4', 1) + P('M-10.6,6.6 C-10.6,10 -10,13 -9,15 C-8.4,12 -8.4,9 -8.4,6.8 Z', '#e4e0d4', 0.9);
    }
    s += E(-20, 0.6, 2.2, 1.7, OL) + (o.glowEye ? gEye(c, -8, -5, 1.9, o.eye) : E(-8, -5, 2.6, 1.9, o.eye, 0.9) + E(-8, -5, 0.7, 1.7, OL)) + L('M-14,-8 L-3,-10', OL, 2);
    if (o.scar) s += L('M-12,-14 L-4,2', lt(fur, 0.6), 1.4) + L('M-12,-14 L-4,2', dk(fur, 0.4), 0.6);
    // near ear with a tuft; torn = notched
    s += o.torn ? P(pd([[-3, -14], [-2, -24], [1, -21], [2, -27], [7, -15]], true), c.cel(fur), 1.6) : P(pd([[-3, -14], [-1, -28], [7, -15]], true), c.cel(fur), 1.6) + P(pd([[-1.6, -16], [-0.6, -24], [4, -16]], true), '#c8a8b0', 0) + L('M-1,-28 l-0.6,-3', OL, 1.4);
    if (o.crown) s += o.crown(c);
    return G(s, 'matrix(' + k + ',0,0,' + k + ',' + n(x) + ',' + n(y) + ')' + (o.rot ? ' rotate(' + o.rot + ')' : ''));
  }
  function catPaw(x, y, col, claws) { return P('M' + pt([x + 5, y - 6]) + 'C' + pt([x + 6, y]) + ' ' + pt([x + 4, y + 1.5]) + ' ' + pt([x, y + 1.5]) + 'L' + pt([x - 7, y + 1.5]) + 'C' + pt([x - 10, y + 1.5]) + ' ' + pt([x - 10, y - 4]) + ' ' + pt([x - 5, y - 5]) + 'Z', col, 1.8) + (claws ? L('M' + pt([x - 8, y]) + 'l-2.6,1.4 M' + pt([x - 5, y + 1]) + 'l-2.4,1.2', '#f4f0e4', 1.2) : L('M' + pt([x - 3, y - 1]) + 'l0,2.5 M' + pt([x - 6, y - 1]) + 'l0,2.5', OL, 1)); }
  function catLeg(c, pts, w0, w1, col) { var T = taper(pts, w0, w1, 5); return body(c, T.d, col, F(ribbonBand(T, 0.62, 1), dk(col, 0.2), 0.6), 1.9); }
  function stalker(c, o) {
    var fur = o.fur, fd = dk(fur, 0.16), st = o.stripe, bel = o.belly || lt(fur, 0.35), s = shadow(c, 66, 50);
    if (o.aura) s += C(64, 80, 66, glow(c, o.aura, 0.35));
    var tail = taper([[98, 70], [112, 72], [122, 60], [121, 44], [113, 34]], 10, 4, 6);
    s += body(c, tail.d, fur, L(bands(tail, 5, 4), st, 2.4) + F(ribbonBand(tail, 0.55, 1), fd, 0.7), 2) + E(113, 34, 3.4, 4, c.cel(st), 1.2);
    s += catLeg(c, [[86, 76], [81, 96], [85, 108], [81, 119]], 14, 6, fd) + catPaw(81, 121, c.cel(fd));
    s += catLeg(c, [[54, 74], [52, 96], [47, 119]], 12, 6, fd) + catPaw(47, 121, c.cel(fd));
    var bd = 'M30,74 C30,62 38,53 50,53 C62,53 70,62 84,60 C98,58 110,62 108,76 C106,88 96,95 88,95 C76,97 60,95 48,93 C38,91 30,84 30,74 Z';
    var stripes = ''; [[52, 54], [61, 57], [70, 61], [80, 60], [90, 59], [100, 62]].forEach(function (p, i) { stripes += 'M' + pt([p[0], p[1] - 2]) + 'q' + n(-3 + i * 0.4) + ',8 ' + n(-1) + ',' + n(15 - Math.abs(i - 3)); });
    s += body(c, bd, fur, F('M30,86 C44,100 80,100 110,84 L112,100 L28,100 Z', bel, 0.95) + F('M78,46 L116,46 L116,100 L88,100 C104,86 100,66 78,46 Z', fd, 0.55) + L(stripes, st, 3) + (o.scars ? L('M60,66 l10,10 M64,64 l10,10', '#e89a9a', 1.6) + L('M60,66 l10,10 M64,64 l10,10', '#8a2a2a', 0.6) : ''), 2.4);
    if (o.spikes) s += o.spikes(c);
    // near hind leg with haunch, near foreleg
    s += body(c, shag(96, 76, 15, 15, 8, 0.1, 23, 0.3), fur, L('M92,66 q-4,8 -2,16 M100,66 q-2,8 0,14', st, 2.6) + F('M100,58 L114,58 L114,94 L100,94 Z', fd, 0.5), 2);
    s += catLeg(c, [[96, 80], [102, 98], [97, 110], [96, 119]], 13, 6.5, fur) + catPaw(96, 121, c.cel(fur), o.claws);
    s += catLeg(c, [[42, 68], [39, 94], [32, 119]], 14, 7, fur) + catPaw(32, 121, c.cel(fur), o.claws) + L('M36,88 l5,2 M35,98 l4,1', st, 2);
    s += catHead(c, 27, 74, { fur: fur, stripe: st, eye: o.eye, seed: 25, ruff: o.ruff, k: 1.14 });
    return G(s, at(o.scale || 1, 64, 122));
  }
  // ---- yeti: knuckle-walking, hunched, head thrust forward (facing left) ----
  function burr(c, x, y, r) { var d = ''; for (var i = 0; i < 8; i++) { var a = PI * 2 * i / 8; d += 'M' + pt([x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6]) + 'L' + pt([x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5]); } return L(d, OL, 1.4) + L(d, '#8ad0c0', 0.7) + C(x, y, r, c.cel('#4a8a90'), 0.9); }
  function yetiLimb(c, pts, w0, w1, col) { var T = taper(pts, w0, w1, 5); return body(c, T.d, col, F(ribbonBand(T, 0.6, 1), dk(col, 0.18), 0.6) + L(along(T, 0.3), lt(col, 0.3), 1, 0.6), 2); }
  function fist(c, x, y, col) { return P('M' + pt([x - 9, y - 6]) + 'C' + pt([x - 12, y + 2]) + ' ' + pt([x - 8, y + 7]) + ' ' + pt([x, y + 7]) + 'C' + pt([x + 8, y + 7]) + ' ' + pt([x + 10, y]) + ' ' + pt([x + 7, y - 6]) + 'C' + pt([x + 2, y - 9]) + ' ' + pt([x - 5, y - 9]) + ' ' + pt([x - 9, y - 6]) + 'Z', c.cel(col), 2) + L('M' + pt([x - 6, y]) + 'l0,6 M' + pt([x - 1, y - 1]) + 'l0,7 M' + pt([x + 4, y - 1]) + 'l0,7', dk(col, 0.4), 1.1); }
  function yetiK(c, o) {
    var fur = o.fur, fd = mix(fur, '#5a5a8a', 0.34), face = o.face, s = shadow(c, 66, 54), r = rng(o.seed || 4), hand_ = dk(face, 0.02);
    // far arm to the knuckles, far leg
    s += yetiLimb(c, [[64, 46], [50, 76], [42, 108]], 17, 12, fd) + P(shag(50, 78, 10, 8, 10, 0.16, 41), c.cel(fd), 1.5) + fist(c, 41, 114, dk(hand_, 0.12));
    s += yetiLimb(c, [[86, 86], [90, 104], [90, 116]], 18, 13, fd) + E(92, 119, 11, 4.4, c.cel(dk(hand_, 0.12)), 1.8);
    // body: high shoulders sloping down to a low rump
    var bd = 'M28,62 C26,40 42,26 60,26 C80,26 96,38 106,56 C114,72 110,90 96,94 L60,96 C42,94 30,82 28,62 Z', fl = '';
    for (var i = 0; i < 18; i++) { var fx = 44 + r() * 58, fy = 36 + r() * 52; fl += 'M' + pt([fx, fy]) + 'q' + n(-1 - r() * 2) + ',3 ' + n(-1) + ',' + n(6 + r() * 3); }
    s += body(c, bd, fur, E(56, 70, 16, 12, lt(fur, 0.25), 0, 0.8) + F('M80,22 L116,22 L116,100 L92,100 C104,80 100,50 80,22 Z', fd, 0.6) + F('M20,84 C44,96 80,98 116,80 L116,100 L20,100 Z', fd, 0.55) + L(fl, fd, 1.2, 0.9), 2.4);
    s += P(shag(60, 30, 24, 8, 14, 0.18, (o.seed || 4) + 2, -0.2), c.cel(fur), 1.8) + P(shag(84, 94, 22, 5, 12, 0.22, (o.seed || 4) + 5), c.cel(fur), 1.6);
    s += icicles(c, 68, 100, 97, 7, 44, '#d8f0ff');
    // near leg
    s += yetiLimb(c, [[100, 82], [104, 102], [102, 116]], 19, 14, fur) + E(104, 119, 12, 4.6, c.cel(hand_), 1.8) + L('M94,121 l-3,0.8 M98,122 l-3,0.8', '#efe6cf', 1.2);
    if (o.burrs) o.burrs.forEach(function (b) { s += burr(c, b[0], b[1], 2.4); });
    // head thrust low and forward under the hump, small horns
    var hx = o.hx || 30, hy = o.hy || 58, hs = '';
    if (o.horns !== false) hs += P('M' + pt([hx + 8, hy - 12]) + 'C' + pt([hx + 12, hy - 22]) + ' ' + pt([hx + 22, hy - 22]) + ' ' + pt([hx + 21, hy - 13]) + 'C' + pt([hx + 18, hy - 16]) + ' ' + pt([hx + 14, hy - 14]) + ' ' + pt([hx + 12, hy - 9]) + 'Z', c.cel('#a89e88'), 1.5);
    hs += body(c, shag(hx + 4, hy, 16, 15, 14, 0.12, (o.seed || 4) + 3, 0.3), fur, F(pd([[hx + 8, hy - 18], [hx + 22, hy - 18], [hx + 22, hy + 18], [hx + 10, hy + 18]], true), fd, 0.6), 2);
    var fcd = 'M' + pt([hx - 10, hy - 6]) + 'C' + pt([hx - 8, hy - 12]) + ' ' + pt([hx + 4, hy - 12]) + ' ' + pt([hx + 6, hy - 5]) + 'L' + pt([hx + 6, hy + 6]) + 'C' + pt([hx + 2, hy + 13]) + ' ' + pt([hx - 10, hy + 14]) + ' ' + pt([hx - 17, hy + 9]) + 'C' + pt([hx - 20, hy + 4]) + ' ' + pt([hx - 18, hy - 1]) + ' ' + pt([hx - 10, hy - 6]) + 'Z';
    hs += body(c, fcd, face, F(pd([[hx - 1, hy - 14], [hx + 8, hy - 14], [hx + 8, hy + 16], [hx - 1, hy + 16]], true), dk(face, 0.25), 0.7) + E(hx - 12, hy + 6, 6, 4.4, lt(face, 0.2), 0, 0.9), 2);
    hs += E(hx - 17.6, hy + 2.4, 2.2, 1.7, '#101014', 0.9) + E(hx - 7, hy - 3, 2.2, 2, o.eye || '#fff4c8', 0.9) + C(hx - 7.6, hy - 3, 1, OL) + L('M' + pt([hx - 12, hy - 5.4]) + 'L' + pt([hx - 1, hy - 8.4]), OL, 2.4);
    hs += P('M' + pt([hx - 18, hy + 8]) + 'C' + pt([hx - 14, hy + 6]) + ' ' + pt([hx - 7, hy + 6]) + ' ' + pt([hx - 4, hy + 8]) + 'C' + pt([hx - 6, hy + 13]) + ' ' + pt([hx - 15, hy + 14]) + ' ' + pt([hx - 18, hy + 8]) + 'Z', '#4a1420', 1.3) + P(pd([[hx - 16, hy + 8], [hx - 15, hy + 12], [hx - 13.8, hy + 8.2]], true), '#f4ecd6', 0.7) + P(pd([[hx - 9, hy + 7.6], [hx - 8, hy + 11.6], [hx - 7, hy + 7.8]], true), '#f4ecd6', 0.7);
    if (o.horns !== false) hs += P('M' + pt([hx + 1, hy - 13]) + 'C' + pt([hx + 3, hy - 25]) + ' ' + pt([hx + 14, hy - 27]) + ' ' + pt([hx + 15, hy - 17]) + 'C' + pt([hx + 11, hy - 20]) + ' ' + pt([hx + 7, hy - 18]) + ' ' + pt([hx + 6, hy - 12]) + 'Z', c.cel('#d8ccb0'), 1.5);
    s += G(hs, at(1.22, hx - 6, hy + 4));
    // near arm, long and heavy, down to the knuckles
    s += yetiLimb(c, [[50, 44], [32, 76], [20, 106]], 20, 13, fur) + P(shag(31, 78, 9, 7, 12, 0.16, 45), c.cel(fur), 1.4) + icicles(c, 24, 40, 86, 6, 46, '#d8f0ff') + fist(c, 19, 112, hand_);
    if (o.burrsFront) o.burrsFront.forEach(function (b) { s += burr(c, b[0], b[1], 2.4); });
    return G(s, at(o.scale || 1, 64, 122));
  }
  // ---- chimaera: two long-necked horned heads, bat wings, clawed quadruped body ----
  function chimHead(c, x, y, o) {
    var col = o.col, s = '';
    s += P('M' + pt([x + 6, y - 6]) + 'C' + pt([x + 12, y - 16]) + ' ' + pt([x + 24, y - 16]) + ' ' + pt([x + 28, y - 6]) + 'C' + pt([x + 22, y - 10]) + ' ' + pt([x + 16, y - 9]) + ' ' + pt([x + 12, y - 2]) + 'Z', c.cel('#e8e0cc'), 1.4);
    var d = 'M' + pt([x + 10, y - 4]) + 'C' + pt([x + 6, y - 10]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x - 10, y - 6]) + 'L' + pt([x - 20, y - 2]) + 'C' + pt([x - 23, y]) + ' ' + pt([x - 22, y + 4]) + ' ' + pt([x - 18, y + 4]) + 'L' + pt([x - 6, y + 6]) + 'C' + pt([x + 4, y + 8]) + ' ' + pt([x + 12, y + 4]) + ' ' + pt([x + 10, y - 4]) + 'Z';
    s += body(c, d, col, F(pd([[x + 2, y - 12], [x + 14, y - 12], [x + 14, y + 10], [x + 2, y + 10]], true), dk(col, 0.22), 0.8) + L('M' + pt([x - 18, y + 2.6]) + 'L' + pt([x - 4, y + 4]), OL, 1.2), 1.8);
    if (o.open) s += P('M' + pt([x - 20, y + 2]) + 'L' + pt([x - 6, y + 4]) + 'L' + pt([x - 14, y + 10]) + 'Z', '#3a1a2a', 1.2) + P(pd([[x - 16, y + 2.6], [x - 15, y + 5], [x - 14, y + 3]], true), '#f4ecd6', 0.5);
    s += gEye(c, x - 6, y - 3, 1.5, FROST) + L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 2, y - 7]), OL, 1.6) + E(x - 20, y - 0.4, 1, 0.8, OL);
    s += P('M' + pt([x + 2, y - 7]) + 'C' + pt([x + 6, y - 20]) + ' ' + pt([x + 18, y - 22]) + ' ' + pt([x + 22, y - 12]) + 'C' + pt([x + 16, y - 16]) + ' ' + pt([x + 10, y - 14]) + ' ' + pt([x + 7, y - 5]) + 'Z', c.cel('#f4ecd8'), 1.4) + L('M' + pt([x + 6, y - 14]) + 'l2,2 M' + pt([x + 11, y - 18]) + 'l1,3 M' + pt([x + 16, y - 18]) + 'l-1,3', '#a8a088', 0.9);
    return s;
  }
  function batWing(c, root, tips, col, mem, far) {
    var d = 'M' + pt(root);
    tips.forEach(function (t, i) { d += 'L' + pt(t); if (i < tips.length - 1) { var nx = tips[i + 1]; d += 'Q' + pt([(t[0] + nx[0]) / 2 - 2, (t[1] + nx[1]) / 2 + 8]) + ' ' + pt(nx); } });
    d += 'Q' + pt([root[0] + 6, root[1] + 12]) + ' ' + pt([root[0] - 4, root[1] + 6]) + 'Z';
    var bones = ''; tips.forEach(function (t) { bones += 'M' + pt(tips[0]) + 'L' + pt(t); });
    return body(c, d, mem, F(pd([[root[0], root[1] - 60], [root[0] + 80, root[1] - 60], [root[0] + 80, root[1] + 20], [root[0] + 20, root[1] + 20]], true), dk(mem, 0.25), far ? 0.5 : 0.35), 1.8) + limb('M' + pt(root) + 'L' + pt(tips[0]), col, far ? 3.4 : 4) + L(bones, OL, 3.4) + L(bones, col, 1.6) + C(tips[0][0], tips[0][1], 2, c.cel(col), 1.2);
  }
  // ---- dragonspawn: dragon body below, armoured torso above (facing left) ----
  function halberd(c, bot, top, col) {
    var ang = Math.atan2(top[1] - bot[1], top[0] - bot[0]), len = Math.sqrt((top[0] - bot[0]) * (top[0] - bot[0]) + (top[1] - bot[1]) * (top[1] - bot[1])), q = dirQ(bot, ang);
    var o = limb('M' + pt(bot) + 'L' + pt(top), '#3a3a5a', 3.4) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - 20, 0)), '#6a6a8a', 1, 0.6);
    o += P(pd([q(len - 22, 1), q(len - 26, 12), q(len - 16, 17), q(len - 6, 14), q(len - 4, 1)], true), c.cel(col), 1.6) + L('M' + pt(q(len - 24, 11)) + 'Q' + pt(q(len - 15, 17)) + ' ' + pt(q(len - 6, 13)), '#ffffff', 1, 0.7);
    o += P(pd([q(len - 14, -1), q(len - 12, -8), q(len - 8, -1)], true), c.cel(dk(col, 0.1)), 1.2) + P(pd([q(len - 4, -2), q(len + 10, 0), q(len - 4, 2)], true), c.cel(col), 1.3);
    return o + L('M' + pt(q(len - 20, 4)) + 'L' + pt(q(len - 10, 6)), FROST, 1.4, 0.9) + R(q(len - 4, 0)[0] - 2.6, q(len - 4, 0)[1] - 2.6, 5.2, 5.2, c.cel(GOLD), 1);
  }
  function scaleRows(x0, y0, x1, y1, col, sw) { var d = '', row = 0; sw = sw || 7; for (var y = y0; y < y1; y += 5) { for (var x = x0 + (row % 2 ? sw / 2 : 0); x < x1; x += sw) d += 'M' + pt([x - sw / 2, y]) + 'Q' + pt([x, y + 5]) + ' ' + pt([x + sw / 2, y]); row++; } return L(d, col, 0.9, 0.8); }
  // ---- highborne ghost pieces ----
  function hbHead(c, x, y, o) {
    var sk = o.skin, hc = o.hair, s = '';
    // tall crescent headdress behind the head
    s += P('M' + pt([x - 3, y - 10]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x - 12, y - 26]) + ' ' + pt([x - 6, y - 31]) + 'C' + pt([x - 5, y - 24]) + ' ' + pt([x, y - 18]) + ' ' + pt([x + 7, y - 13]) + 'Z', c.cel(o.crown), 1.5);
    s += P('M' + pt([x + 6, y - 10]) + 'C' + pt([x + 12, y - 22]) + ' ' + pt([x + 22, y - 27]) + ' ' + pt([x + 32, y - 29]) + 'C' + pt([x + 24, y - 22]) + ' ' + pt([x + 18, y - 16]) + ' ' + pt([x + 12, y - 7]) + 'Z', c.cel(dk(o.crown, 0.1)), 1.5) + C(x + 2, y - 16, 2.4, c.cel(ARC), 1);
    s += body(c, 'M' + pt([x - 4, y - 12]) + 'C' + pt([x + 12, y - 18]) + ' ' + pt([x + 22, y - 4]) + ' ' + pt([x + 22, y + 12]) + 'C' + pt([x + 24, y + 26]) + ' ' + pt([x + 30, y + 36]) + ' ' + pt([x + 38, y + 44]) + 'L' + pt([x + 20, y + 38]) + 'C' + pt([x + 12, y + 26]) + ' ' + pt([x + 8, y + 10]) + ' ' + pt([x, y]) + 'Z', hc, L('M' + pt([x + 10, y - 8]) + 'C' + pt([x + 16, y + 6]) + ' ' + pt([x + 18, y + 22]) + ' ' + pt([x + 28, y + 36]), lt(hc, 0.3), 1.1, 0.8), 1.8);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 9, y - 16]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 11, y + 5]) + 'C' + pt([x + 9, y + 12]) + ' ' + pt([x + 1, y + 15]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 12]) + ' ' + pt([x - 11, y + 8]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 14, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8), 1.8);
    s += P('M' + pt([x + 4, y - 2]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x + 26, y - 18]) + ' ' + pt([x + 34, y - 26]) + 'C' + pt([x + 26, y - 12]) + ' ' + pt([x + 16, y - 1]) + ' ' + pt([x + 8, y + 5]) + 'Z', c.cel(sk), 1.4);
    s += gEye(c, x - 5, y - 2, 1.6, '#ffffff') + L('M' + pt([x - 11, y - 5]) + 'L' + pt([x - 1, y - 7]), dk(hc, 0.3), 1.8) + L('M' + pt([x - 9, y + 8]) + 'Q' + pt([x - 6, y + 10]) + ' ' + pt([x - 3, y + 8]), dk(sk, 0.45), 1.1);
    s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 7, y - 6]) + 'C' + pt([x + 2, y - 10]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.6);
    s += L('M' + pt([x - 11, y - 9]) + 'Q' + pt([x, y - 14]) + ' ' + pt([x + 12, y - 9]), OL, 3.2) + L('M' + pt([x - 11, y - 9]) + 'Q' + pt([x, y - 14]) + ' ' + pt([x + 12, y - 9]), o.crown, 1.6) + C(x - 3, y - 12, 2.2, glow(c, ARC, 0.9)) + C(x - 3, y - 12, 1.3, '#f4e8ff', 0.6);
    return s;
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  var MOBS = {
    winterfall_ursa: function (c) {
      return furbolg(c, {
        fur: '#a8adba', muzzle: '#e6e2da', paint: '#2e6ac0', seed: 13, loin: '#44567a', scale: 0.98,
        chest: function (c) { return L('M40,56 L82,90', OL, 5.4) + L('M40,56 L82,90', '#4a3a2a', 3.2) + beadNecklace(60, 58, 13, [TAINT, '#e8e0c8', TAINT, '#3a78c8']) + C(60, 66, 9, glow(c, TAINT, 0.35)); },
        top: function (c) { return snowClump(c, 78, 40, 9) + snowClump(c, 40, 40, 6); },
        near: [[46, 58], [36, 66], [28, 60]], wNear: function (c, p) { return axe(c, p, 36, -PI / 2 - 0.1, 12, '#8a98b0', false, '#5a4028'); },
        far: [[84, 56], [100, 66], [106, 78]], wFar: function (c, p) { return jug(c, p); }
      });
    },
    winterfall_shaman: function (c) {
      return furbolg(c, {
        fur: '#c6c2c0', muzzle: '#f2eee8', paint: '#3a86d0', seed: 15, loin: '#2a4a7a', eyeGlow: FROST, scale: 0.92,
        headTop: function (c) { var a = 'M28,46 L24,30 L16,22 M25,35 L32,26 M38,46 L42,30 L50,24 M41,36 L36,26'; return L(a, OL, 5) + L(a, '#e8dcc0', 2.8) + P('M16,54 C18,44 30,40 40,44 C38,48 30,48 24,50 C20,52 18,54 16,54 Z', c.cel('#3a5a8a'), 1.4); },
        chest: function (c) { return beadNecklace(60, 56, 14, ['#e8e0c8', '#3a78c8', TAINT]) + beadNecklace(60, 64, 12, ['#3a78c8', '#e8e0c8']); },
        near: [[44, 56], [34, 66], [28, 74]], wNear: function (c, p) { return frostStaff(c, [p[0] - 2, p[1] - 50], [p[0] + 2, p[1] + 46]); },
        far: [[84, 54], [96, 48], [102, 36]], wFar: function (c, p) { return orb(c, p[0] + 2, p[1] - 10, 5, FROST) + motes(47, 6, p[0] - 10, p[0] + 14, p[1] - 26, p[1] - 2, '#e8fcff'); }
      });
    },
    grizzle_snowpaw: function (c) {
      var mane = '#eef0f4', grz = '#9a9aa6';
      return furbolg(c, {
        fur: '#56525e', muzzle: '#a8a2a4', seed: 17, eyeScar: true, roar: true, eyeGlow: '#bff4ff', scale: 1.04, shadowR: 46, loin: '#2a2430', headK: 0.94,
        headBack: function (c) { return P(shag(30, 64, 24, 27, 16, 0.12, 71, 0.2), c.cel(mane), 2) + L('M16,50 q4,10 2,20 M28,42 q4,12 0,24 M40,44 q2,12 -2,22 M48,58 q-2,10 -6,18', grz, 1.3, 0.9); },
        back: function (c) { return P(shag(76, 48, 30, 18, 16, 0.12, 72, -0.2), c.cel(mane), 2) + L('M62,36 q4,10 2,20 M76,32 q2,12 -2,22 M90,38 q-2,10 -4,16', grz, 1.3, 0.9); },
        headTop: function (c) { return P(shag(34, 88, 12, 6, 10, 0.14, 74, 0.3), c.cel(mane), 1.5); },
        pads: function (c) { return P(shag(56, 52, 24, 11, 16, 0.13, 73, 0.3), c.cel(mane), 1.8) + L('M42,48 q2,6 0,10 M54,46 q2,7 -1,12 M66,48 q0,6 -2,10', grz, 1.2, 0.9); },
        chest: function (c) { return L('M50,66 L62,80 M58,64 L70,78 M72,70 L80,82', '#d88a8a', 1.8) + L('M50,66 L62,80 M58,64 L70,78', '#6a2a2a', 0.6); },
        near: [[48, 60], [38, 74], [30, 80]], wNearFront: function (c, p) { var q = dirQ(p, PI / 2 + 0.55); return club(c, p, 30, PI / 2 + 0.55, '#6a5040', true) + crystal(c, q(30, -6)[0], q(30, -6)[1], 9, 5, PI + 0.4, '#bfe8ff') + crystal(c, q(24, 8)[0], q(24, 8)[1], 8, 4.4, 0.2, '#bfe8ff'); },
        far: [[84, 56], [98, 66], [102, 80]]
      });
    },
    frostsaber_stalker: function (c) {
      return stalker(c, { fur: '#eef2f7', stripe: '#4a78b8', belly: '#ffffff', ruff: '#ffffff', eye: '#8ad8ff', scale: 1 });
    },
    rakshiri: function (c) {
      var fur = '#d8e2ee', st = '#1e3e84', fd = dk(fur, 0.2), s = shadow(c, 66, 56), eye = '#6afcff';
      s += C(62, 70, 70, glow(c, '#8ae0ff', 0.45)) + E(66, 118, 58, 8, '#e8f8ff', 0, 0.5);
      // lashing tail
      var tail = taper([[98, 84], [114, 80], [124, 62], [118, 40], [108, 30]], 11, 4, 6);
      s += body(c, tail.d, fur, L(bands(tail, 4, 3), st, 2.6) + F(ribbonBand(tail, 0.55, 1), fd, 0.7), 2) + crystal(c, 108, 30, 9, 5, -PI / 2 - 0.9, '#bff0ff');
      // far legs
      s += catLeg(c, [[88, 88], [82, 104], [86, 113], [82, 119]], 15, 7, fd) + catPaw(82, 121, c.cel(fd), true);
      s += catLeg(c, [[58, 68], [56, 96], [48, 119]], 13, 7, fd) + catPaw(48, 121, c.cel(fd), true);
      // body rising to the shoulders
      var bd = 'M34,62 C34,48 44,40 56,42 C68,44 76,56 90,62 C104,68 112,76 108,90 C104,100 92,104 84,102 C70,100 58,94 48,86 C40,80 34,72 34,62 Z';
      var stripes = ''; [[54, 43], [64, 48], [74, 54], [84, 60], [94, 65], [102, 72]].forEach(function (p, i) { stripes += 'M' + pt([p[0], p[1] - 2]) + 'q-4,8 -2,' + n(16 - Math.abs(i - 2)); });
      s += body(c, bd, fur, F('M36,74 C50,96 80,108 110,92 L112,108 L30,108 Z', '#ffffff', 0.9) + F('M80,50 L116,50 L116,106 L90,106 C104,90 100,70 80,50 Z', fd, 0.55) + L(stripes, st, 3.2) +
        L('M58,58 l12,12 M62,54 l12,12 M66,52 l10,10', '#f0a8a8', 1.8) + L('M58,58 l12,12 M62,54 l12,12 M66,52 l10,10', '#7a1a2a', 0.7), 2.6);
      // ice crystals grown along the spine
      [[48, 42, -2.0, 12], [58, 42, -1.7, 15], [68, 46, -1.45, 16], [78, 52, -1.25, 15], [88, 58, -1.05, 13], [98, 64, -0.85, 10]].forEach(function (k) { s += crystal(c, k[0], k[1] + 3, k[3], 5.6, k[2], '#bff0ff'); });
      // near haunch + hind leg planted
      s += body(c, shag(96, 90, 15, 14, 8, 0.1, 81, 0.3), fur, L('M92,80 q-4,8 -2,16 M100,80 q-2,8 0,14', st, 2.8) + F('M100,72 L114,72 L114,106 L100,106 Z', fd, 0.5), 2);
      s += catLeg(c, [[96, 94], [102, 108], [97, 116], [96, 119]], 14, 7, fur) + catPaw(96, 121, c.cel(fur), true);
      // near foreleg raised, claws out
      s += catLeg(c, [[44, 56], [32, 68], [18, 70]], 15, 9, fur) + L('M32,64 l3,6 M25,66 l2,6', st, 2.2);
      s += P('M6,64 C4,70 8,76 14,76 C20,76 22,70 20,66 C16,62 10,62 6,64 Z', c.cel(fur), 1.8) + L('M5,66 q-4,1 -5,5 M6,71 q-4,2 -4,6 M10,75 q-2,3 -1,6', OL, 3) + L('M5,66 q-4,1 -5,5 M6,71 q-4,2 -4,6 M10,75 q-2,3 -1,6', '#f8f6ee', 1.4);
      // roaring head, raised, ice crown
      s += catHead(c, 28, 48, { fur: fur, stripe: st, eye: eye, glowEye: true, roar: true, torn: true, scar: true, seed: 83, ruff: '#ffffff', k: 1.16, rot: -12,
        crown: function (c) { return crystal(c, 4, -18, 14, 5, -PI / 2 - 0.2, '#bff0ff') + crystal(c, 10, -14, 11, 4.6, -PI / 2 + 0.3, '#9ae4ff') + crystal(c, -2, -16, 9, 4, -PI / 2 - 0.7, '#dff8ff'); } });
      s += C(2, 60, 10, glow(c, '#e8fcff', 0.6)) + motes(84, 10, 0, 16, 50, 70, '#ffffff');
      return G(s, at(1.02, 64, 122));
    },
    ice_thistle_yeti: function (c) {
      return yetiK(c, { fur: '#eef0f6', face: '#56607a', seed: 7, burrs: [[90, 52], [98, 70], [72, 40]], burrsFront: [[40, 60], [26, 94]], scale: 1 });
    },
    chillwind_chimaera: function (c) {
      var col = '#9cc4e2', bel = '#e6f2fa', mem = '#4a6a9e', dc = dk(col, 0.2), s = shadow(c, 70, 50);
      // far wing, raised behind
      s += batWing(c, [72, 60], [[70, 20], [78, 4], [96, 6], [108, 22]], dc, dk(mem, 0.15), true);
      // tail with a barbed tip
      var tail = taper([[104, 86], [116, 92], [124, 104], [118, 114]], 8, 3, 6);
      s += body(c, tail.d, col, F(ribbonBand(tail, 0.55, 1), dc, 0.7), 1.8) + P(pd([[114, 112], [124, 116], [116, 122], [112, 116]], true), c.cel('#e8e0cc'), 1.3);
      // far legs
      s += limb('M92,94 L96,108 L92,119', dc, 8) + L('M92,120 l-5,1 M92,120 l-3,2.6', OL, 2.4) + limb('M56,94 L52,108 L48,119', dc, 8) + L('M48,120 l-5,1 M48,120 l-3,2.6', OL, 2.4);
      // far neck + head (the upper one)
      var n1 = taper([[52, 76], [44, 58], [40, 42], [44, 28]], 13, 8, 5);
      s += body(c, n1.d, dc, F(ribbonBand(n1, 0, 0.35), lt(bel, 0), 0.8) + L(bands(n1, 3, 2), dk(dc, 0.3), 1), 1.8);
      s += chimHead(c, 40, 24, { col: dc });
      s += C(18, 26, 12, glow(c, '#e8fcff', 0.6)) + P('M16,26 C8,22 2,26 0,30 C4,28 8,30 6,34 C10,32 14,30 16,28 Z', '#f4fcff', 0) + motes(91, 8, 0, 18, 18, 36, '#ffffff');
      // body
      var bd = 'M40,82 C40,70 52,64 66,66 C80,66 94,68 104,76 C112,84 108,98 96,100 C82,104 62,104 50,100 C42,96 40,90 40,82 Z';
      s += body(c, bd, col, F('M42,92 C56,104 90,104 108,90 L110,106 L40,106 Z', bel, 0.95) + F('M80,58 L114,58 L114,104 L92,104 C104,90 100,72 80,58 Z', dc, 0.5) + L('M64,68 q-2,8 0,14 M76,68 q-2,8 0,14 M88,70 q-2,8 0,12', dk(col, 0.3), 1.6), 2.4);
      // near legs
      s += limb('M96,90 L104,104 L100,119', col, 10) + L('M100,120 l-6,1 M100,120 l-4,3 M100,120 l-1,3', OL, 3) + L('M100,120 l-6,1 M100,120 l-4,3', '#e8e0cc', 1.3);
      s += limb('M52,90 L42,104 L38,119', col, 10) + L('M38,120 l-6,1 M38,120 l-4,3 M38,120 l-1,3', OL, 3) + L('M38,120 l-6,1 M38,120 l-4,3', '#e8e0cc', 1.3);
      // near neck + head (the lower one)
      var n2 = taper([[50, 84], [38, 78], [28, 66], [24, 56]], 15, 9, 5);
      s += body(c, n2.d, col, F(ribbonBand(n2, 0, 0.4), bel, 0.9) + L(bands(n2, 3, 2), dk(col, 0.3), 1), 2);
      s += chimHead(c, 24, 52, { col: col, open: true });
      // near wing, swept up and back over the body
      s += batWing(c, [66, 66], [[82, 22], [104, 6], [122, 16], [125, 40], [110, 60]], col, mem, false);
      return G(s, at(0.98, 64, 122));
    },
    highborne_apparition: function (c) {
      var gh = GHOST, robe = '#7a8ae8', trim = '#e8f0c8', s = '';
      s += E(64, 122, 26, 5, c.rg([[0, gh, 0.45], [1, gh, 0]])) + C(62, 64, 64, glow(c, gh, 0.35));
      var g = '';
      // trailing wisps below the hem
      g += P('M44,96 C40,110 54,116 70,114 C84,116 100,120 116,112 C102,112 94,106 88,98 Z', c.cel(lt(gh, 0.2)), 1.4) + L('M58,108 C70,114 90,116 108,112 M50,102 C60,110 72,110 84,108', '#ffffff', 1, 0.7);
      // far sleeve hanging
      g += P('M80,52 C90,58 96,72 100,88 C94,90 86,88 82,84 C84,74 82,64 76,58 Z', c.cel(dk(robe, 0.15)), 1.8) + hand([96, 86], c.cel(gh));
      // gown flaring from the waist
      var gown = 'M48,52 C52,46 76,46 82,52 L84,70 C92,84 96,94 98,102 C84,106 60,106 38,102 C40,92 44,82 46,70 Z';
      g += body(c, gown, robe, F('M68,44 L104,44 L104,108 L74,108 C80,84 76,62 68,44 Z', dk(robe, 0.25), 0.8) + L('M64,54 L64,104', trim, 1.8) + L('M40,100 C60,104 84,104 96,100', trim, 1.6) + L('M56,60 C52,76 48,90 44,100 M72,60 C76,76 82,90 88,100', lt(robe, 0.25), 1.1, 0.7), 2);
      g += P('M50,64 L80,64 L78,70 L52,70 Z', c.cel(trim), 1.4) + C(65, 67, 2.4, c.cel(ARC), 1);
      g += P('M44,52 C44,44 54,42 60,46 L56,58 C52,58 46,56 44,52 Z', c.cel(trim), 1.4) + P('M84,52 C84,44 74,42 70,46 L74,58 C78,58 82,56 84,52 Z', c.cel(dk(trim, 0.1)), 1.4);
      g += R(57, 42, 10, 8, c.cel(gh), 1.6) + hbHead(c, 60, 33, { skin: gh, hair: '#e8f8ff', crown: trim });
      // near arm raised with the arcane orb
      g += P('M50,54 C42,52 34,50 28,48 L30,58 C36,60 44,62 50,62 Z', c.cel(robe), 1.8) + hand([28, 52], c.cel(gh));
      g += orb(c, 22, 42, 6, ARC) + motes(95, 10, 8, 40, 26, 58, '#f0e8ff');
      s += G(g, '', 0.8);
      return s + motes(96, 12, 20, 110, 20, 118, '#e8fcff');
    },
    cobalt_scalebane: function (c) {
      var sc = COBALT, scl = lt(sc, 0.2), bel = '#b8d0ea', arm = '#c8d4e4', trim = '#4a5a8a', s = shadow(c, 70, 50);
      // tail on the ground
      var tail = taper([[104, 88], [118, 94], [124, 108], [112, 118], [100, 118]], 13, 3, 6);
      s += body(c, tail.d, sc, F(ribbonBand(tail, 0.55, 1), dk(sc, 0.3), 0.7) + L(bands(tail, 3, 2), dk(sc, 0.35), 1), 1.8);
      // far legs
      s += limb('M94,96 L100,108 L96,119', dk(sc, 0.2), 9) + L('M96,120 l-5,1 M96,120 l-3,2.6', OL, 2.4) + limb('M62,96 L56,108 L54,119', dk(sc, 0.2), 9) + L('M54,120 l-5,1 M54,120 l-3,2.6', OL, 2.4);
      // lower body
      var lb = 'M48,84 C50,74 62,72 76,74 C92,74 106,78 110,88 C112,98 104,104 92,104 C78,106 62,104 54,100 C48,96 46,90 48,84 Z';
      s += body(c, lb, sc, F('M50,96 C64,106 94,106 110,94 L112,108 L48,108 Z', bel, 0.9) + scaleRows(56, 76, 108, 94, dk(sc, 0.35), 7) + F('M86,66 L116,66 L116,106 L94,106 C106,92 102,78 86,66 Z', dk(sc, 0.25), 0.55), 2.4);
      // back spines
      [[66, 74, -1.9], [76, 74, -1.6], [86, 75, -1.35], [96, 78, -1.1]].forEach(function (k) { var q = dirQ([k[0], k[1] + 1], k[2]); s += P(pd([q(0, -3), q(8, 0), q(0, 3)], true), c.cel('#dfe8f4'), 1); });
      // far arm resting on the flank
      s += limb('M66,48 L76,64 L72,76', dk(sc, 0.15), 8.5) + clawHand([72, 78], dk(sc, 0.15), 1, '#e8e0cc');
      // upper torso rising from the front
      var td = 'M40,50 C44,40 66,40 72,48 L70,64 C68,74 66,80 64,86 L46,88 C44,78 40,68 40,50 Z';
      s += body(c, td, sc, F('M44,56 L62,56 L62,86 L48,86 Z', bel, 0.9) + L('M46,62 L62,62 M46,68 L62,68 M47,74 L62,74 M48,80 L62,80', dk(bel, 0.3), 1.1) + F('M60,40 L80,40 L80,90 L62,90 C68,74 68,56 60,40 Z', dk(sc, 0.25), 0.6), 2.4);
      s += P('M42,76 L68,76 L68,82 L42,82 Z', c.cel(trim), 1.6) + R(51, 74, 8, 10, c.cel(arm), 1.2) + C(55, 79, 1.8, FROST);
      // pauldrons with a glowing rune
      s += pauldron(c, 70, 46, 10, arm, trim) + pauldron(c, 42, 48, 12, arm, trim) + L('M38,44 l4,-3 l4,3 M42,41 l0,6', FROST, 1.2, 0.95) + C(42, 44, 6, glow(c, FROST, 0.5));
      // head: horned dragon head
      var hx = 40, hy = 31;
      s += P('M' + pt([hx + 6, hy - 6]) + 'C' + pt([hx + 12, hy - 16]) + ' ' + pt([hx + 24, hy - 20]) + ' ' + pt([hx + 32, hy - 16]) + 'C' + pt([hx + 24, hy - 14]) + ' ' + pt([hx + 16, hy - 10]) + ' ' + pt([hx + 12, hy - 2]) + 'Z', c.cel(dk('#dfe8f4', 0.12)), 1.4);
      s += R(hx - 2, hy + 6, 12, 14, c.cel(sc), 1.8);
      var hd = 'M' + pt([hx + 12, hy - 4]) + 'C' + pt([hx + 8, hy - 12]) + ' ' + pt([hx - 4, hy - 12]) + ' ' + pt([hx - 10, hy - 7]) + 'L' + pt([hx - 22, hy - 3]) + 'C' + pt([hx - 26, hy - 1]) + ' ' + pt([hx - 25, hy + 4]) + ' ' + pt([hx - 21, hy + 5]) + 'L' + pt([hx - 8, hy + 8]) + 'C' + pt([hx + 4, hy + 12]) + ' ' + pt([hx + 14, hy + 6]) + ' ' + pt([hx + 12, hy - 4]) + 'Z';
      s += body(c, hd, sc, F(pd([[hx + 2, hy - 14], [hx + 16, hy - 14], [hx + 16, hy + 12], [hx + 2, hy + 12]], true), dk(sc, 0.25), 0.8) + F('M' + pt([hx - 22, hy + 3]) + 'L' + pt([hx - 6, hy + 5]) + 'L' + pt([hx + 6, hy + 10]) + 'L' + pt([hx - 8, hy + 9]) + 'Z', bel, 0.85) + L('M' + pt([hx - 20, hy + 3.4]) + 'L' + pt([hx - 4, hy + 5]), OL, 1.2), 1.8);
      s += P('M' + pt([hx + 2, hy - 9]) + 'C' + pt([hx + 8, hy - 22]) + ' ' + pt([hx + 20, hy - 26]) + ' ' + pt([hx + 28, hy - 24]) + 'C' + pt([hx + 20, hy - 20]) + ' ' + pt([hx + 12, hy - 14]) + ' ' + pt([hx + 8, hy - 6]) + 'Z', c.cel('#dfe8f4'), 1.4);
      s += P('M' + pt([hx + 10, hy + 2]) + 'L' + pt([hx + 20, hy - 2]) + 'L' + pt([hx + 16, hy + 4]) + 'L' + pt([hx + 22, hy + 6]) + 'L' + pt([hx + 12, hy + 8]) + 'Z', c.cel(scl), 1.2);
      s += gEye(c, hx - 6, hy - 4, 1.8, FROST) + L('M' + pt([hx - 12, hy - 7]) + 'L' + pt([hx - 1, hy - 9]), OL, 2) + E(hx - 22, hy - 0.4, 1.2, 0.9, OL) + P(pd([[hx - 18, hy + 4.4], [hx - 17, hy + 7.6], [hx - 16, hy + 4.6]], true), '#f4ecd6', 0.6);
      // near arm gripping the halberd
      s += halberd(c, [38, 120], [19, 9], '#d0dcec');
      s += limb('M44,52 L34,66 L26,66', sc, 9) + clawHand([26, 66], sc, 1.1, '#e8e0cc');
      // near legs
      s += limb('M98,92 L106,106 L102,119', sc, 10) + L('M102,120 l-6,1 M102,120 l-4,3', OL, 3) + L('M102,120 l-6,1 M102,120 l-4,3', '#e8e0cc', 1.3);
      s += limb('M58,92 L50,106 L46,119', sc, 10) + L('M46,120 l-6,1 M46,120 l-4,3', OL, 3) + L('M46,120 l-6,1 M46,120 l-4,3', '#e8e0cc', 1.3);
      return G(s, at(0.98, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#9ab8d8'), 2.5); }
  function phScene(c) { return wSky(c) + ground(c, 122, SNOW, SNOWS); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#9ab8d8"/></svg>'; }
    }
  }
  var has = function (t, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(t, k); };
  var baseScene = typeof ART.scene === 'function' ? ART.scene : function () { var c = new Ctx(); return c.svg(400, 240, phScene(c)); };
  var baseMob = typeof ART.mob === 'function' ? ART.mob : function () { var c = new Ctx(); return c.svg(128, 128, phMob(c)); };
  ART.scene = function (k) { return has(SCENES, k) ? make(SCENES, k, 400, 240, phScene) : baseScene.apply(this, arguments); };
  ART.mob = function (k) { return has(MOBS, k) ? make(MOBS, k, 128, 128, phMob) : baseMob.apply(this, arguments); };
  ART.keys = ART.keys || {};
  function addKeys(list, keys) { var a = Array.isArray(list) ? list : []; keys.forEach(function (k) { if (a.indexOf(k) < 0) a.push(k); }); return a; }
  ART.keys.scenes = addKeys(ART.keys.scenes, Object.keys(SCENES));
  ART.keys.mobs = addKeys(ART.keys.mobs, Object.keys(MOBS));
})(typeof window !== 'undefined' ? window : this);
