/* art_maraudon.js — The Gemfall Caves art for Realm of Loner (dungeon, levels 46-50: the sacred caverns of the centaur and the
 * earth beneath Mournwaste, corrupted by the elemental princess Ghesra; the purple-crystal caverns with their
 * poison vines, the orange-crystal falls, and the deep throne chamber with its dark pool; the Putridus tricksters,
 * constrictor vines and cavern lurkers, and the bosses Sludgewell, Thornlash, Lord Venomlip, Faolan the Cursed,
 * Landslide and Ghesra, the Stone Duchess).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * The Gemfall Caves keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_scarlet.js; the satyr rig
 * (goat legs, horns) is a copy of art_ashenvale.js so the Putridus satyrs read as kin of the Sourheart ones.
 * The crystal clusters, cave shell, vines, boulder bodies, slime and the earth-hair of Ghesra are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix md<counter>_).
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
  function Ctx() { this.p = 'md' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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

  // ============================================================
  //  MARAUDON: palette
  // ============================================================
  var CRY = '#a864ec', CRYG = '#c89aff', ORA = '#f0902a', ORAG = '#ffb048', TOX = '#8ae83a', TOXL = '#e0ff90';
  var VINE = '#4e7e2a', LEAF = '#6a9a34', THORN = '#e6dcae', EMER = '#4aff8a', GOLD = '#d8a838', FEL = '#4af03a';

  // ---- satyr pieces (shared copy of art_ashenvale.js) ----
  function hoof(x, y, col) {
    return P('M' + n(x + 4) + ',' + n(y - 7) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 7) + ',' + n(y + 1) + ' C' + n(x - 8) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 6) + ' ' + n(x - 2) + ',' + n(y - 7) + ' Z', c_(col), 2) + L('M' + n(x - 1) + ',' + n(y - 3) + ' L' + n(x) + ',' + n(y + 1), OL, 1.2);
  }
  function satyrHead(c, x, y, o) {
    var sk = o.skin, s = '', hc = o.hair || '#2a1a24';
    var horn = function (dx, dy, col, far) {
      var pts = o.horns === 'swept' ? [[x - 2 + dx, y - 11 + dy], [x + 6 + dx, y - 22 + dy], [x + 18 + dx, y - 29 + dy], [x + 33 + dx, y - 31 + dy]] : [[x - 2 + dx, y - 11 + dy], [x + 3 + dx, y - 23 + dy], [x + 16 + dx, y - 25 + dy], [x + 22 + dx, y - 14 + dy], [x + 17 + dx, y - 4 + dy], [x + 11 + dx, y - 7 + dy]];
      var T = taper(pts, o.horns === 'swept' ? 8 : 10, o.horns === 'swept' ? 1.4 : 3, 5);
      return body(c, T.d, col, L(bands(T, 2, 2), dk(col, 0.35), 1.1) + (far ? '' : F(ribbonBand(T, 0, 0.35), lt(col, 0.15), 0.7)), 1.8);
    };
    s += horn(7, 2, dk(o.hornCol || '#3a2a2a', 0.2), true);
    s += P(shag(x + 9, y - 1, 11, 13, 7, 0.25, 21), c.cel(hc), 1.8);
    var d = 'M' + pt([x - 8, y - 9]) + 'C' + pt([x - 6, y - 15]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 5]) + 'C' + pt([x + 8, y + 12]) + ' ' + pt([x, y + 15]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 9, y + 12]) + ' ' + pt([x - 11, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'L' + pt([x - 16, y]) + 'L' + pt([x - 11, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 16], [x + 14, y - 16], [x + 14, y + 16], [x + 2, y + 16]], true), dk(sk, 0.22), 0.8) + (o.veins ? L('M' + pt([x - 2, y + 4]) + 'l3,4 M' + pt([x + 3, y - 10]) + 'l-2,4', o.veins, 1.2) : ''), 2);
    s += P('M' + pt([x - 10, y + 10]) + 'C' + pt([x - 9, y + 20]) + ' ' + pt([x - 5, y + 26]) + ' ' + pt([x - 2, y + 29]) + 'C' + pt([x - 1, y + 22]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x + 3, y + 12]) + 'Z', c.cel(hc), 1.4);
    s += P(pd([[x + 5, y - 3], [x + 22, y - 10], [x + 8, y + 4]], true), c.cel(sk), 1.6) + F(pd([[x + 8, y - 2], [x + 18, y - 8], [x + 9, y + 1]], true), dk(sk, 0.3), 0.8);
    s += gEye(c, x - 5, y - 3, 1.6, o.eye || FEL) + L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 1, y - 9]), OL, 2.2);
    s += L('M' + pt([x - 12, y + 6]) + 'L' + pt([x - 4, y + 6]), OL, 1.4) + P(pd([[x - 10, y + 6.4], [x - 9, y + 9.6], [x - 8, y + 6.6]], true), '#f4ecd6', 0.7) + E(x - 15, y - 0.6, 1, 0.8, OL);
    s += horn(0, 0, o.hornCol || '#3a2a2a', false);
    return s;
  }
  function satyr(c, o) {
    var sk = o.skin, fur = o.fur;
    return biped(c, {
      skin: sk, shirt: sk, pants: fur, sleeve: sk, glove: sk, boots: '#1e1418', digi: true, feet: hoof, legW: 11, armW: o.armW || 9, shadowR: 32, hipY: 84, neckCol: sk,
      torsoD: o.torsoD || 'M44,50 C50,42 78,42 84,50 L80,68 L76,86 L52,86 L48,68 Z', hx: o.hx || 56, hy: o.hy || 32,
      back: function (c) { var t = 'M76,84 C92,84 100,96 96,108'; return (o.back ? o.back(c) : '') + L(t, OL, 5) + L(t, sk, 2.6) + P(shag(96, 110, 4, 5, 5, 0.3, 31), c.cel(fur), 1.2); },
      shins: function (c) { return P(shag(76, 100, 7, 7, 6, 0.3, 33), c.cel(dk(fur, 0.18)), 1.4) + P(shag(62, 100, 8, 7, 6, 0.3, 35), c.cel(fur), 1.5); },
      chest: function (c) { return L('M52,56 Q60,62 68,56 M54,68 Q60,71 66,68 M56,77 Q60,79 64,77', dk(sk, 0.3), 1.3) + (o.veins ? L('M50,60 l6,6 l-2,6 M72,56 l-4,8 l3,6', o.veins, 1.3, 0.9) : '') + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return P(shag(64, 84, 18, 6, 9, 0.3, 37), c.cel(fur), 1.6) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top,
      head: function (c, x, y) { return satyrHead(c, x, y, o); },
      near: o.near || [[48, 54], [36, 62], [26, 60]], far: o.far || [[80, 54], [94, 58], [100, 48]],
      nearHand: o.nearHand || function (c, p) { return clawHand(p, sk, 1.1, '#2a1a1a'); }, farHand: o.farHand || function (c, p) { return clawHand(p, dk(sk, 0.1), 1, '#2a1a1a'); },
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(o.scale || 1, 64, 122)
    });
  }
  // ---- weapons (blade + pauldron are shared copies of art_scarlet.js) ----
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
  // curved satyr blade; the edge (the +v side) carries a venom sheen
  function scimitar(c, p, len, ang, col, edge) {
    var q = dirQ(p, ang); col = col || '#c8ccd8';
    var o = limb('M' + pt(q(-9, 0)) + 'L' + pt(q(2, 0)), '#3a1e2a', 3.4) + C(q(-10, 0)[0], q(-10, 0)[1], 2.5, c.cel(GOLD), 1.1);
    var g = 'M' + pt(q(2, -6)) + 'L' + pt(q(2, 6));
    o += L(g, OL, 5.6) + L(g, GOLD, 3.2);
    var d = 'M' + pt(q(4, -2.6)) + 'Q' + pt(q(len * 0.6, -3.4)) + ' ' + pt(q(len, -len * 0.2)) + 'Q' + pt(q(len * 0.72, len * 0.16)) + ' ' + pt(q(4, 3)) + 'Z';
    o += P(d, c.cel(col), 1.6) + L('M' + pt(q(8, 2.2)) + 'Q' + pt(q(len * 0.7, len * 0.12)) + ' ' + pt(q(len - 3, -len * 0.16)), edge || '#9aff5a', 1.4, 0.9) + L('M' + pt(q(8, -1.4)) + 'Q' + pt(q(len * 0.6, -2)) + ' ' + pt(q(len * 0.9, -len * 0.14)), '#ffffff', 0.9, 0.7);
    return o;
  }
  function drop(c, x, y, s, col) {
    col = col || TOX;
    var d = 'M' + pt([x, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 1 * s]) + ' ' + pt([x + 2.6 * s, y + 1 * s]) + ' ' + pt([x, y + 3 * s]) + 'C' + pt([x - 2.6 * s, y + 1 * s]) + ' ' + pt([x - 1 * s, y - 1 * s]) + ' ' + pt([x, y - 4 * s]) + 'Z';
    return C(x, y, 5 * s, glow(c, col, 0.5)) + P(d, lt(col, 0.2), 0.8 * s) + C(x - 0.8 * s, y, 0.7 * s, '#ffffff', 0, 0.8);
  }
  function vial(c, p, col) {
    var x = p[0], y = p[1] - 8;
    return C(x, y, 11, glow(c, col, 0.6)) + E(x, y + 2, 5, 5.4, c.rg([[0, '#ffffff'], [0.45, lt(col, 0.3)], [1, col]]), 1.6) + R(x - 2, y - 7, 4, 5, c.cel('#c8d8c8'), 1.2) + R(x - 2.6, y - 9, 5.2, 2.6, c.cel('#6a4428'), 1) + C(x - 1.6, y + 0.6, 1.2, '#ffffff', 0, 0.8);
  }

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
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
  function leaf(c, x, y, ang, len, col) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.45, -len * 0.42)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, len * 0.36)) + ' ' + pt(q(0, 0)) + 'Z';
    return F(d, c.cel(col)) + F('M' + pt(q(len * 0.08, 0)) + 'L' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, len * 0.36)) + ' ' + pt(q(len * 0.08, 0)) + 'Z', dk(col, 0.28)) +
      L(d, OL, Math.max(0.8, Math.min(1.6, len * 0.1))) + L('M' + pt(q(0, 0)) + 'L' + pt(q(len * 0.85, 0)), dk(col, 0.42), Math.max(0.6, len * 0.05));
  }
  // thick tapered vine along a curve, with thorns and leaves; o.drip hangs a poison drop at the tip
  function vine(c, pts, w0, w1, col, seed, o) {
    o = o || {};
    var T = taper(pts, w0, w1, 6), r = rng(seed || 4);
    var s = body(c, T.d, col, F(ribbonBand(T, 0.55, 1), dk(col, 0.3), 0.85) + L(bands(T, 3, 2), dk(col, 0.38), Math.max(0.7, w0 * 0.1)) + L(along(T, 0.25), lt(col, 0.22), Math.max(0.7, w0 * 0.12), 0.7), Math.max(1.2, Math.min(2.2, w0 * 0.2)));
    var m = T.s.length, lv = '', th = '';
    for (var i = 2; i < m - 1; i += o.every || 3) {
      var side = r() < 0.5, p = side ? T.a[i] : T.b[i], q = T.s[i], ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
      if (o.thorns !== false && (o.leaves === false || r() < 0.55)) { var tq = dirQ(p, ang), tw = Math.max(1.2, (w0 + (w1 - w0) * i / m) * 0.2); th += P(pd([tq(-1, -tw), tq(Math.max(3, (w0 + (w1 - w0) * i / m) * 0.55), 0), tq(-1, tw)], true), o.thornCol || THORN, 0.8); }
      else if (o.leaves !== false) lv += leaf(c, p[0], p[1], ang + (r() - 0.5) * 0.6, (o.leafLen || 10) * (1 - 0.4 * i / m), o.leafCol || LEAF);
    }
    var tip = T.s[m - 1];
    return s + th + lv + (o.drip ? drop(c, tip[0], tip[1] + 5, o.drip, o.dripCol) : '');
  }
  function shroom(c, x, y, s, cap, gcol) {
    var o = gcol ? C(x, y - 12 * s, 20 * s, glow(c, gcol, 0.5)) : '';
    o += E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.3);
    o += P('M' + pt([x - 2.4 * s, y]) + 'Q' + pt([x - 1.6 * s, y - 6 * s]) + ' ' + pt([x - 1.4 * s, y - 11 * s]) + 'L' + pt([x + 1.6 * s, y - 11 * s]) + 'Q' + pt([x + 1.8 * s, y - 6 * s]) + ' ' + pt([x + 2.6 * s, y]) + 'Z', c.cel('#d8d0b8'), 1.2 * s);
    var cd = 'M' + pt([x - 10 * s, y - 10 * s]) + 'C' + pt([x - 10 * s, y - 21 * s]) + ' ' + pt([x + 10 * s, y - 21 * s]) + ' ' + pt([x + 10 * s, y - 10 * s]) + 'Q' + pt([x, y - 13 * s]) + ' ' + pt([x - 10 * s, y - 10 * s]) + 'Z';
    o += body(c, cd, cap, F(pd([[x + 2 * s, y - 23 * s], [x + 12 * s, y - 23 * s], [x + 12 * s, y - 8 * s], [x + 2 * s, y - 8 * s]], true), dk(cap, 0.28), 0.8), 1.3 * s);
    return o + C(x - 4 * s, y - 15.5 * s, 1.6 * s, lt(cap, 0.55), 0, 0.9) + C(x + 3 * s, y - 17 * s, 1.2 * s, lt(cap, 0.55), 0, 0.9) + C(x + 6 * s, y - 13.5 * s, 1 * s, lt(cap, 0.5), 0, 0.8);
  }
  function waterfall(c, x0, x1, y0, y1, seed) {
    var r = rng(seed || 6), w = x1 - x0, mx = (x0 + x1) / 2;
    var d = 'M' + pt([x0 + 4, y0]) + 'L' + pt([x1 - 4, y0]) + 'C' + pt([x1 - 2, y0 + (y1 - y0) * 0.4]) + ' ' + pt([x1 + 4, y1 - 20]) + ' ' + pt([x1 + 8, y1]) + 'L' + pt([x0 - 8, y1]) + 'C' + pt([x0 - 4, y1 - 20]) + ' ' + pt([x0 + 2, y0 + (y1 - y0) * 0.4]) + ' ' + pt([x0 + 4, y0]) + 'Z';
    var st = '';
    for (var i = 0; i < 9; i++) { var xx = x0 + 6 + (w - 12) * (i + r() * 0.5) / 9, ya = y0 + r() * 24, yb = ya + 24 + r() * (y1 - y0 - 34); st += 'M' + pt([xx, ya]) + 'L' + pt([xx + (xx - mx) * 0.14, yb]); }
    var o = C(mx, y1 - 16, w * 1.5, glow(c, '#bfefff', 0.3));
    o += body(c, d, '#5ab4d8', R(x0 + w * 0.58, y0 - 2, w, y1 - y0 + 4, '#2a7aa8', 0.45) + L(st, '#e4f8ff', 1.5, 0.8) + R(x0, y0, w, 8, '#1a4a6a', 0.5), 1.6);
    return o + P(shag(mx, y1, w / 2 + 14, 6, 8, 0.3, (seed || 6) + 1), '#eef9ff', 1.3) + E(mx - 6, y1 - 2, w * 0.3, 2, '#ffffff', 0, 0.9);
  }
  function pool(c, cx, cy, rx, ry, col, glint) {
    var o = E(cx, cy, rx + 3, ry + 2.4, dk(col, 0.45), 1.8) + E(cx, cy + ry * 0.1, rx, ry, c.lg([[0, dk(col, 0.25)], [0.45, col], [1, lt(col, 0.12)]]), 0);
    return o + L('M' + pt([cx - rx * 0.6, cy - ry * 0.1]) + 'q' + n(rx * 0.2) + ',-2 ' + n(rx * 0.4) + ',0 M' + pt([cx + rx * 0.1, cy + ry * 0.4]) + 'q' + n(rx * 0.2) + ',-2 ' + n(rx * 0.4) + ',0 M' + pt([cx - rx * 0.2, cy + ry * 0.55]) + 'q' + n(rx * 0.1) + ',-1.4 ' + n(rx * 0.2) + ',0', glint || lt(col, 0.5), 1.2, 0.8);
  }
  function throne(c, x, y, s) {
    var st = '#6e6c5c', o = E(x, y + 2, 56 * s, 6 * s, '#000', 0, 0.4), Q = function (a) { return a.map(function (p) { return [x + p[0] * s, y + p[1] * s]; }); };
    // steps
    o += P(pd(Q([[-52, 0], [52, 0], [46, -7], [-46, -7]]), true), c.cel(dk(st, 0.1)), 1.6) + P(pd(Q([[-44, -7], [44, -7], [40, -13], [-40, -13]]), true), c.cel(st), 1.5);
    // tall back with a jagged crown
    var back = pd(Q([[-30, -18], [-33, -66], [-25, -82], [-17, -72], [-9, -94], [0, -80], [9, -94], [17, -72], [25, -82], [33, -66], [30, -18]]), true);
    o += body(c, back, st, F(pd(Q([[4, -100], [40, -100], [40, -14], [4, -14]]), true), dk(st, 0.28), 0.8) +
      F(pd(Q([[-20, -24], [-21, -62], [-9, -76], [9, -76], [21, -62], [20, -24]]), true), dk(st, 0.4), 0.9) +
      L(pd(Q([[-26, -40], [-18, -46], [-22, -56]])) + pd(Q([[24, -34], [16, -42], [22, -50]])), dk(st, 0.5), 1.2), 2);
    // moss draped over the crown
    o += P(pd(Q([[-33, -64], [-25, -80], [-17, -70], [-12, -66], [-14, -58], [-20, -62], [-24, -54], [-28, -60]]), true), c.cel('#5a7a34'), 1.2);
    // the green heart-stone set in the crown
    o += C(x, y - 70 * s, 22 * s, glow(c, EMER, 0.7)) + crystal(c, x, y - 60 * s, 18 * s, 9 * s, -PI / 2, EMER);
    // seat + arms
    o += P(pd(Q([[-34, -13], [34, -13], [36, -24], [-36, -24]]), true), c.cel(lt(st, 0.08)), 1.8) + F(pd(Q([[4, -24], [36, -24], [34, -13], [4, -13]]), true), dk(st, 0.25), 0.8);
    o += P(pd(Q([[-44, -13], [-30, -13], [-30, -36], [-46, -38]]), true), c.cel(st), 1.8) + P(pd(Q([[30, -13], [44, -13], [46, -38], [30, -36]]), true), c.cel(dk(st, 0.2)), 1.8);
    o += P(pd(Q([[-48, -36], [-28, -34], [-30, -41], [-47, -43]]), true), c.cel(lt(st, 0.12)), 1.4) + P(pd(Q([[28, -34], [48, -36], [47, -43], [30, -41]]), true), c.cel(dk(st, 0.1)), 1.4);
    return o + crystal(c, x - 38 * s, y - 42 * s, 9 * s, 5 * s, -PI / 2 - 0.2, EMER) + crystal(c, x + 38 * s, y - 42 * s, 9 * s, 5 * s, -PI / 2 + 0.2, EMER);
  }
  // rough column of living rock from ceiling to floor
  function rockPillar(c, x, w, y0, y1, col, seed) {
    var r = rng(seed || 5), L0 = [], R0 = [], k = 7;
    for (var i = 0; i <= k; i++) { var y = y0 + (y1 - y0) * i / k, pinch = 1 - 0.28 * Math.sin(PI * i / k); L0.push([x - w / 2 * pinch - r() * 5, y]); R0.push([x + w / 2 * pinch + r() * 5, y]); }
    L0[k][0] -= 10; R0[k][0] += 10; L0[0][0] -= 8; R0[0][0] += 8;
    var d = pd(L0.concat(R0.reverse()), true), ln = '';
    for (var j = 1; j < 6; j++) { var yy = y0 + (y1 - y0) * j / 6; ln += 'M' + pt([x - w * 0.3, yy]) + 'l' + n(w * 0.25) + ',' + n(3 + r() * 3) + 'l' + n(w * 0.2) + ',-2'; }
    return body(c, d, col, F(pd([[x + w * 0.1, y0 - 4], [x + w, y0 - 4], [x + w, y1 + 4], [x + w * 0.16, y1 + 4]], true), dk(col, 0.32), 0.85) + L(ln, dk(col, 0.45), 1.1), 1.8);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    maraudon_caverns: function (c) {
      var o = R(0, 0, 400, 240, '#1c1420');
      o += R(0, 0, 400, 124, c.lg([[0, '#1a1220'], [0.6, '#3a2844'], [1, '#2e2236']]));
      o += C(200, 86, 170, glow(c, CRY, 0.28));
      o += hills(c, 1101, 122, 64, '#2a1e32', 22, 1.2) + hills(c, 1102, 122, 36, '#3a2c44', 34, 1.4);
      o += L('M0,70 Q100,62 200,72 T400,66 M0,92 Q120,84 220,94 T400,88', '#241a2c', 2, 0.8) + cluster(c, 96, 92, 1.0, CRYG, 1122) + cluster(c, 288, 86, 1.1, CRY, 1123) + stalacRow(c, 1124, [34, 186, 226, 366], 120, '#3a2c44', 14, 26, true) + cluster(c, 70, 118, 0.75, CRY, 1103) + cluster(c, 322, 116, 0.85, CRY, 1104) + cluster(c, 150, 120, 0.5, CRYG, 1105) + cluster(c, 250, 120, 0.55, CRY, 1106);
      o += ceiling(c, 1107, 20, 26, '#140e18', 30, 1.6);
      o += stalacRow(c, 1108, [24, 92, 150, 238, 284, 352, 392], 22, '#2e2234', 16, 34);
      o += cluster(c, 118, 28, 0.7, CRY, 1109, { down: true }) + cluster(c, 306, 34, 0.8, CRYG, 1110, { down: true });
      // poison vines hanging from the roof
      o += vine(c, [[40, 4], [48, 34], [38, 62], [46, 90]], 7, 2.6, VINE, 1111, { drip: 0.9 }) + vine(c, [[196, 2], [188, 26], [200, 46]], 6, 2.4, VINE, 1112, { drip: 0.8 });
      o += vine(c, [[364, 4], [356, 38], [368, 70], [360, 100]], 7, 2.6, VINE, 1113, { drip: 0.9 }) + vine(c, [[250, 0], [258, 20], [252, 34]], 5, 2, dk(VINE, 0.1), 1114);
      // floor
      o += caveFloor(c, 118, '#4a3848', '#261c28', 1115);
      o += F('M168,118 L232,118 L310,242 L90,242 Z', '#5a4858', 0.55);
      o += pool(c, 204, 152, 34, 6, '#5a9a2a', TOXL) + C(204, 152, 40, glow(c, TOX, 0.3));
      o += pebbles(1116, 124, 236, '#6a5a6a', 22);
      o += shroom(c, 104, 126, 0.8, '#8a4ac8', CRYG) + shroom(c, 116, 128, 0.55, '#a05ad8', CRYG) + shroom(c, 290, 128, 0.7, '#8a4ac8', CRYG) + shroom(c, 26, 136, 1, '#7a3ab8', CRYG);
      // creeping vines at the floor edges
      o += vine(c, [[-6, 142], [26, 150], [52, 144], [80, 156]], 8, 3, VINE, 1117, { leafLen: 9 }) + vine(c, [[406, 136], [376, 146], [354, 140], [334, 150]], 8, 3, VINE, 1118, { leafLen: 9 });
      o += cluster(c, 6, 240, 1.1, CRY, 1119) + cluster(c, 396, 238, 1.2, CRYG, 1120);
      return o + motes(1121, 26, 20, 380, 30, 220, '#e0c0ff') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    maraudon_falls: function (c) {
      var o = R(0, 0, 400, 240, '#1e1612');
      o += R(0, 0, 400, 124, c.lg([[0, '#22180f'], [0.55, '#5a3e28'], [1, '#48321f']]));
      o += C(200, 80, 150, glow(c, ORAG, 0.25));
      o += hills(c, 1201, 122, 56, '#3e2c1e', 24, 1.2) + hills(c, 1202, 122, 30, '#553c28', 36, 1.4);
      o += ceiling(c, 1203, 18, 24, '#160f0a', 28, 1.6);
      o += stalacRow(c, 1204, [20, 84, 134, 268, 312, 380], 20, '#3a2a1c', 16, 36);
      // the falls pour from a cleft in the roof
      o += waterfall(c, 178, 222, 18, 118, 1205) + P('M168,8 C180,24 220,24 232,8 L232,-4 L168,-4 Z', '#160f0a', 1.6);
      o += cluster(c, 60, 26, 0.9, ORA, 1206, { down: true }) + cluster(c, 336, 24, 0.8, ORA, 1207, { down: true });
      // orange crystal formations on the far shore
      o += cluster(c, 66, 120, 1.5, ORA, 1208) + cluster(c, 124, 118, 0.8, ORAG, 1209) + cluster(c, 282, 118, 0.9, ORAG, 1210) + cluster(c, 340, 120, 1.6, ORA, 1211);
      o += caveFloor(c, 118, '#7a5a3e', '#3a2a1c', 1212);
      // pool and the stream running forward
      o += P('M190,129 C184,150 208,166 198,186 C188,206 162,222 152,244 L214,244 C222,226 240,208 234,188 C228,168 206,150 210,129 Z', c.lg([[0, '#3a8ab0'], [1, '#4aa4cc']]), 1.6) + L('M194,146 q5,-2 10,0 M200,174 q8,-2 16,0 M186,204 q10,-3 20,0 M172,230 q10,-3 20,0', '#e4f8ff', 1.3, 0.8);
      o += pool(c, 200, 124, 50, 7, '#3a8ab0', '#d8f4ff');
      o += mist(c, 116, 22, '#e0f4ff', 0.28, 1213);
      o += E(96, 150, 30, 5, '#5a7a34', 0, 0.6) + E(318, 160, 36, 6, '#5a7a34', 0, 0.55) + E(40, 206, 34, 6, '#5a7a34', 0, 0.5) + E(356, 222, 30, 5, '#5a7a34', 0, 0.5);
      o += pebbles(1214, 126, 236, '#9a7a5a', 22) + rock(c, 128, 142, 22, 10, '#6a5040') + rock(c, 276, 144, 26, 11, '#6a5040');
      o += shroom(c, 110, 132, 0.6, '#c8702a', ORAG) + shroom(c, 296, 134, 0.7, '#c8702a', ORAG);
      o += cluster(c, 8, 240, 1.1, ORA, 1215) + cluster(c, 394, 238, 1.2, ORAG, 1216);
      return o + motes(1217, 24, 20, 380, 30, 220, '#ffe0a0') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    maraudon_throne: function (c) {
      var o = R(0, 0, 400, 240, '#120e14');
      o += R(0, 0, 400, 124, c.lg([[0, '#100c12'], [0.6, '#2a2230'], [1, '#221a26']]));
      // the great hollow behind the throne, lit green from a crack in the roof
      o += P('M100,122 C100,60 140,24 200,22 C260,24 300,60 300,122 Z', c.lg([[0, '#0c0a0e'], [1, '#1c1a1e']]), 1.6);
      o += F('M186,0 L214,0 L268,122 L132,122 Z', c.lg([[0, '#b8ffb0', 0.22], [1, '#b8ffb0', 0.02]]));
      o += C(200, 70, 120, glow(c, EMER, 0.22));
      o += ceiling(c, 1301, 16, 22, '#0c080e', 26, 1.6) + stalacRow(c, 1302, [30, 80, 128, 272, 322, 374], 18, '#2a2230', 14, 30);
      // hanging roots, some gone purple with the corruption
      o += vine(c, [[150, 0], [144, 22], [152, 44]], 5, 2, '#5a3a24', 1303, { leaves: false, thornCol: '#8a6a4a' }) + vine(c, [[250, 0], [258, 26], [248, 50]], 5, 2, '#5a3a24', 1304, { leaves: false, thornCol: '#8a6a4a' });
      o += vine(c, [[110, 4], [118, 30], [108, 56], [114, 74]], 5, 2, '#5a2e5a', 1305, { leaves: false, drip: 0.8, dripCol: '#c05aff' }) + vine(c, [[296, 6], [288, 34], [296, 62]], 5, 2, '#5a2e5a', 1306, { leaves: false, drip: 0.8, dripCol: '#c05aff' });
      o += rockPillar(c, 46, 30, 0, 124, '#4a3e44', 1307) + rockPillar(c, 354, 30, 0, 124, '#4a3e44', 1308);
      o += vine(c, [[30, 20], [60, 40], [34, 64], [62, 90], [40, 118]], 5, 3, VINE, 1309, { leafLen: 8 }) + vine(c, [[370, 16], [340, 42], [368, 70], [338, 98], [360, 120]], 5, 3, VINE, 1310, { leafLen: 8 });
      o += C(62, 66, 18, glow(c, EMER, 0.5)) + crystal(c, 56, 74, 16, 7, -1.0, EMER) + crystal(c, 58, 76, 11, 6, -0.4, dk(EMER, 0.1)) + C(338, 76, 18, glow(c, EMER, 0.5)) + crystal(c, 344, 84, 16, 7, PI + 1.0, EMER) + crystal(c, 342, 86, 11, 6, PI + 0.4, dk(EMER, 0.1));
      o += caveFloor(c, 118, '#3e3440', '#1a141c', 1311);
      o += throne(c, 200, 120, 1.12);
      o += cluster(c, 118, 122, 0.8, EMER, 1312) + cluster(c, 284, 122, 0.9, EMER, 1313);
      // the dark pool at the foot of the dais
      o += pool(c, 200, 152, 96, 13, '#18282c', '#6affa8') + E(200, 150, 10, 3, EMER, 0, 0.5) + E(200, 150, 26, 5, glow(c, EMER, 0.5));
      o += rock(c, 74, 148, 30, 14, '#4a3e44') + rock(c, 332, 150, 34, 15, '#4a3e44') + pebbles(1314, 130, 236, '#5a4e58', 20);
      o += cluster(c, 6, 240, 1, EMER, 1315) + cluster(c, 396, 238, 1.1, EMER, 1316);
      return o + motes(1317, 26, 20, 380, 20, 220, '#b0ffc8') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.66, '#000', 0.16], [1, '#000', 0.62]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
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
  function mossCap(c, cx, cy, rx, ry, seed) { return P(shag(cx, cy, rx, ry, 7, 0.3, seed), c.cel('#5e8636'), 1.2); }
  // forward-curving thorn: base at p, pointing along ang
  function spike(c, p, len, ang, w, col) {
    var q = dirQ(p, ang); col = col || THORN;
    var d = 'M' + pt(q(0, -w)) + 'Q' + pt(q(len * 0.6, -w * 0.6)) + ' ' + pt(q(len, w * 0.5)) + 'Q' + pt(q(len * 0.5, w * 0.6)) + ' ' + pt(q(0, w)) + 'Z';
    return P(d, c.cel(col), 1.3) + F('M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.55, w * 0.1)) + ' ' + pt(q(len, w * 0.5)) + 'Q' + pt(q(len * 0.5, w * 0.6)) + ' ' + pt(q(0, w)) + 'Z', dk(col, 0.3), 0.8);
  }
  // elf head facing left with branch antlers (Faolan)
  function antler(c, x, y, col) {
    var d = 'M' + pt([x, y]) + 'Q' + pt([x + 2, y - 11]) + ' ' + pt([x + 12, y - 18]) + 'M' + pt([x + 1, y - 7]) + 'L' + pt([x - 6, y - 14]) + 'L' + pt([x - 7, y - 19]) + 'M' + pt([x + 6, y - 14]) + 'L' + pt([x + 5, y - 22]) + 'M' + pt([x + 12, y - 18]) + 'L' + pt([x + 21, y - 20]) + 'M' + pt([x + 12, y - 18]) + 'L' + pt([x + 15, y - 25]);
    return L(d, OL, 5.6) + L(d, col, 3) + L(d, lt(col, 0.25), 0.9, 0.6);
  }
  function elfHead(c, x, y, o) {
    var sk = o.skin, s = '', hc = o.hair;
    s += antler(c, x + 9, y - 8, dk(o.bark, 0.2)) + leaf(c, x + 28, y - 30, -0.5, 8, '#8a6a2a');
    s += P(shag(x + 8, y, 12, 14, 7, 0.25, 41), c.cel(hc), 1.8);
    var d = 'M' + pt([x - 8, y - 10]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 8, y + 12]) + ' ' + pt([x, y + 14]) + ' ' + pt([x - 5, y + 12]) + 'L' + pt([x - 9, y + 8]) + 'L' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 3, y - 16], [x + 14, y - 16], [x + 14, y + 16], [x + 2, y + 16]], true), dk(sk, 0.24), 0.8) + L('M' + pt([x + 2, y - 12]) + 'l3,5 l-2,5', o.vein, 1.1, 0.9), 2);
    // long ear swept back
    s += P(pd([[x + 3, y - 3], [x + 26, y - 15], [x + 8, y + 4]], true), c.cel(sk), 1.6) + F(pd([[x + 7, y - 2], [x + 20, y - 11], [x + 9, y + 1]], true), dk(sk, 0.3), 0.8);
    // mossy beard of roots
    s += P('M' + pt([x - 9, y + 7]) + 'C' + pt([x - 8, y + 18]) + ' ' + pt([x - 4, y + 26]) + ' ' + pt([x + 1, y + 30]) + 'C' + pt([x + 2, y + 22]) + ' ' + pt([x + 6, y + 16]) + ' ' + pt([x + 8, y + 10]) + 'C' + pt([x + 2, y + 14]) + ' ' + pt([x - 4, y + 12]) + ' ' + pt([x - 9, y + 7]) + 'Z', c.cel(hc), 1.4) + L('M' + pt([x - 5, y + 14]) + 'l2,8 M' + pt([x, y + 14]) + 'l1,9', dk(hc, 0.35), 1);
    s += gEye(c, x - 5, y - 3, 1.7, EMER) + L('M' + pt([x - 11, y - 7]) + 'L' + pt([x - 1, y - 8]), OL, 2.2);
    return s + antler(c, x + 2, y - 10, o.bark) + leaf(c, x - 5, y - 30, -2.2, 7, '#6a8a30');
  }
  // one strand of Ghesra's flowing earth hair
  function earthStrand(c, pts, w0, w1, col, seed) {
    var T = taper(pts, w0, w1, 6), r = rng(seed || 3), m = T.s.length;
    var o = body(c, T.d, col, F(ribbonBand(T, 0.6, 1), dk(col, 0.3), 0.85) + F(ribbonBand(T, 0.1, 0.2), '#7a9a40', 0.6) + L(along(T, 0.3), lt(col, 0.22), 1.4, 0.85) + L(bands(T, 5, 4), dk(col, 0.4), 1.1, 0.8), 1.8);
    var tip = T.s[m - 1], pv = T.s[m - 3], dx = tip[0] - pv[0], dy = tip[1] - pv[1], dd = Math.sqrt(dx * dx + dy * dy) || 1;
    for (var i = 1; i <= 3; i++) o += boulder(c, tip[0] + dx / dd * 5 * i + (r() - 0.5) * 3, tip[1] + dy / dd * 5 * i, 2.4 - i * 0.4, 2 - i * 0.3, '#9a8a74', seed + i, { k: 6, sw: 0.9 });
    return o;
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  var MOBS = {
    putridus_trickster: function (c) {
      return satyr(c, {
        skin: '#86b048', fur: '#3a2c1e', hair: '#1e2e14', horns: 'ram', hornCol: '#4a3828', veins: '#e0ff70', eye: '#ffe23a', scale: 0.9,
        chest: function (c) { return L('M48,50 L78,82', OL, 4.4) + L('M48,50 L78,82', '#5a3a22', 2.6) + R(60, 62, 6, 5, c.cel('#6a4a2a'), 1); },
        near: [[48, 54], [38, 64], [28, 58]], far: [[80, 54], [92, 64], [98, 58]],
        wNearFront: function (c, p) { return blade(c, [p[0] + 1, p[1] + 1], 24, -PI / 2 - 0.62, 2.6, '#c8d4b0', '#3a2a1a') + drop(c, p[0] - 16, p[1] - 14, 0.7); },
        wFar: function (c, p) { return vial(c, p, TOX); }
      });
    },
    constrictor_vine: function (c) {
      var o = shadow(c, 64, 34);
      o += P(shag(66, 116, 30, 8, 8, 0.3, 51), c.cel('#5a4028'), 1.8) + L('M44,118 l-8,4 M52,120 l-4,3 M86,118 l8,4 M80,120 l4,3', '#3a2818', 2.2);
      o += vine(c, [[80, 114], [98, 98], [106, 76], [98, 58], [106, 42], [116, 38]], 12, 3, dk(VINE, 0.15), 52, { drip: 0.8 });
      o += vine(c, [[56, 114], [40, 108], [22, 106], [12, 94], [18, 82], [28, 84]], 11, 3, VINE, 53, { leafLen: 11 });
      o += vine(c, [[70, 118], [82, 98], [76, 76], [62, 60], [50, 50]], 17, 10, lt(VINE, 0.06), 54, { leafLen: 13, every: 2 });
      // the flower-maw at the tip
      var pc = '#b04ab8';
      o += leaf(c, 54, 42, -1.3, 16, pc) + leaf(c, 56, 46, -0.35, 17, dk(pc, 0.1)) + leaf(c, 54, 52, 0.5, 15, pc) + leaf(c, 48, 36, -2.0, 12, dk(pc, 0.12));
      o += P(pd([[11, 38], [32, 46], [13, 57]], true), '#2a0e20', 1.2) + C(26, 47, 10, glow(c, TOX, 0.8)) + C(28, 47, 3, TOXL);
      var hd = 'M52,40 C52,28 36,26 26,32 L10,37 L30,46 L12,57 C22,64 44,64 54,52 Z';
      o += body(c, hd, '#8a3a96', F('M40,20 L60,20 L60,68 L42,68 C48,56 48,34 40,20 Z', dk('#8a3a96', 0.3), 0.8) + E(34, 34, 6, 3, lt('#8a3a96', 0.3), 0, 0.7), 2);
      o += P(pd([[14, 38.6], [17, 43], [19, 39.8]], true), THORN, 0.8) + P(pd([[21, 41], [23, 45], [25, 42.6]], true), THORN, 0.8) + P(pd([[15, 55.4], [18, 50], [20, 54]], true), THORN, 0.8) + P(pd([[22, 52.6], [24, 48.6], [26, 51.4]], true), THORN, 0.8);
      o += gEye(c, 34, 38, 1.6, '#ffe23a') + L('M28,34 L38,33', OL, 1.8);
      return o + drop(c, 16, 62, 0.8);
    },
    cavern_lurker: function (c) {
      var col = '#7c6c80', dc = dk(col, 0.22), o = shadow(c, 66, 44);
      o += boulder(c, 100, 108, 12, 14, dc, 61);
      // crystals on the back (drawn first so the hide hides their roots)
      o += C(80, 38, 26, glow(c, CRY, 0.5)) + crystal(c, 64, 48, 13, 6, -PI / 2 - 0.6, CRY) + crystal(c, 76, 44, 22, 8, -PI / 2 - 0.15, CRYG) + crystal(c, 90, 46, 17, 7, -PI / 2 + 0.3, CRY) + crystal(c, 102, 56, 12, 6, -PI / 2 + 0.75, CRYG);
      // far arm
      o += boulder(c, 56, 84, 10, 15, dc, 62) + boulder(c, 54, 112, 12, 9, dc, 63);
      o += boulder(c, 76, 72, 36, 30, col, 64, { k: 11 });
      o += mossCap(c, 74, 44, 16, 5, 65) + mossCap(c, 100, 56, 7, 3, 66);
      o += boulder(c, 86, 110, 13, 13, col, 67);
      // head sunk low between the shoulders, jaw hanging
      o += boulder(c, 34, 86, 13, 7, dc, 68) + P(pd([[24, 84], [26, 79], [28, 84]], true), THORN, 0.8) + P(pd([[32, 84], [34, 79], [36, 84]], true), THORN, 0.8) + P(pd([[40, 84], [42, 80], [44, 84]], true), THORN, 0.8);
      o += boulder(c, 38, 70, 16, 14, col, 69);
      o += P('M22,64 L40,58 L52,62 L48,66 L26,68 Z', c.cel(dk(col, 0.1)), 1.6) + gEye(c, 30, 70, 2.2, CRYG) + gEye(c, 41, 69, 1.8, CRYG);
      // near arm, knuckles down
      o += boulder(c, 42, 92, 12, 16, col, 70) + boulder(c, 28, 112, 16, 11, col, 71) + L('M18,108 l0,6 M24,106 l0,7 M30,106 l0,7', dk(col, 0.45), 1.2);
      return G(o, at(1.06, 60, 122));
    },
    noxxion: function (c) {
      var g = '#7cbc34', o = shadow(c, 64, 50);
      o += C(64, 62, 64, glow(c, TOX, 0.35));
      o += P(shag(64, 117, 54, 7, 11, 0.25, 71), c.cel(dk(g, 0.12)), 1.8);
      // far arm raised behind
      var fa = taper([[86, 58], [100, 46], [108, 30], [104, 18]], 17, 10, 5);
      o += body(c, fa.d, dk(g, 0.14), F(ribbonBand(fa, 0.5, 1), dk(g, 0.4), 0.7), 2) + P(shag(104, 16, 10, 9, 6, 0.3, 72), c.cel(dk(g, 0.1)), 1.8) + drop(c, 112, 30, 0.8);
      var bd = 'M16,118 C22,104 30,96 34,82 C28,62 32,36 48,24 C58,14 78,14 88,24 C100,36 100,62 94,80 C98,96 106,106 112,118 Z';
      var inside = F('M72,8 L122,8 L122,122 L84,122 C92,100 88,86 92,72 C96,52 90,30 72,8 Z', dk(g, 0.3), 0.8) + E(44, 32, 9, 5, lt(g, 0.45), 0, 0.75) + E(28, 96, 5, 8, lt(g, 0.35), 0, 0.6);
      inside += P('M60,96 l10,-3 l2,3 l-10,3 Z M58,95 a2,2 0 1,0 0.1,0 M73,92 a2,2 0 1,0 0.1,0', '#d8d0a0', 0.8) + E(40, 104, 5, 4, '#5a5a3a', 0.8, 0.8) + E(84, 100, 4, 3, '#5a5a3a', 0.8, 0.8);
      [[46, 78, 3], [70, 70, 4], [58, 108, 2.6], [80, 50, 2.4], [34, 102, 2.2], [88, 84, 3], [66, 34, 2]].forEach(function (b) { inside += C(b[0], b[1], b[2], lt(g, 0.35), 0.9) + C(b[0] - b[2] * 0.35, b[1] - b[2] * 0.35, b[2] * 0.35, '#ffffff', 0, 0.8); });
      o += body(c, bd, g, inside, 2.4);
      // face: slit eyes and a gaping maw
      o += P('M38,40 L50,38 L48,44 Z', '#2a3a10', 1.2) + P('M56,37 L68,38 L64,43 Z', '#2a3a10', 1.2) + gEye(c, 45, 41, 2.2, '#f4ff4a') + gEye(c, 62, 40, 2, '#f4ff4a');
      o += P('M38,54 C42,50 62,48 68,54 C66,64 58,70 50,70 C42,70 38,62 38,54 Z', '#1e2a0c', 1.8) + L('M44,56 L44,66 M52,54 L53,68 M60,55 L59,64', lt(g, 0.3), 1.4, 0.8) + P(pd([[44, 55], [46, 60], [48, 54]], true), '#e8e0b0', 0.7) + P(pd([[56, 54], [58, 59], [60, 55]], true), '#e8e0b0', 0.7);
      // near arm reaching forward
      var na = taper([[42, 70], [28, 74], [18, 68], [12, 60]], 16, 10, 5);
      o += body(c, na.d, g, F(ribbonBand(na, 0.6, 1), dk(g, 0.3), 0.8), 2) + P(shag(11, 57, 8, 8, 6, 0.35, 73), c.cel(g), 1.8);
      o += L('M6,52 l-4,-4 M10,50 l-2,-6 M15,50 l1,-6', OL, 3.6) + L('M6,52 l-4,-4 M10,50 l-2,-6 M15,50 l1,-6', g, 1.8);
      o += drop(c, 20, 82, 0.9) + drop(c, 52, 76, 0.8) + drop(c, 10, 70, 0.7);
      return o + motes(74, 10, 10, 118, 6, 60, TOXL);
    },
    razorlash: function (c) {
      var bk = '#56762c', dbk = dk(bk, 0.25), o = shadow(c, 66, 50);
      o += vine(c, [[98, 84], [114, 74], [120, 56], [112, 42], [102, 46]], 10, 3, dbk, 81, { leaves: false, every: 2 });
      // far legs
      o += limb('M90,90 L102,106 L104,119', dk(dbk, 0.15), 8) + limb('M46,92 L42,108 L36,119', dk(dbk, 0.15), 8) + L('M104,119 l6,2 M36,119 l-6,2', OL, 2.4);
      // leaf frill behind the head
      o += leaf(c, 40, 62, -2.4, 22, '#6a9a34') + leaf(c, 42, 60, -1.7, 24, '#5a8a2c') + leaf(c, 44, 62, -1.0, 22, '#6a9a34') + leaf(c, 42, 70, 2.3, 18, '#5a8a2c');
      var bd = 'M30,70 C34,52 60,44 82,48 C102,52 112,68 106,86 C100,98 72,102 52,98 C38,96 30,86 30,70 Z';
      o += body(c, bd, bk, F('M70,40 L120,40 L120,106 L60,106 C80,94 90,70 70,40 Z', dbk, 0.8) + L('M44,64 Q60,58 78,62 M50,78 Q66,72 90,76 M58,90 Q74,86 96,88', dk(bk, 0.45), 1.4) + E(48, 60, 8, 4, lt(bk, 0.25), 0, 0.7), 2.4);
      // thorns along the back
      [[44, 54, -2.1, 14], [54, 49, -1.9, 17], [65, 47, -1.7, 19], [76, 47, -1.45, 19], [87, 50, -1.2, 17], [97, 56, -0.95, 15], [104, 66, -0.7, 12]].forEach(function (t) { o += spike(c, [t[0], t[1] + 3], t[3], t[2] + 0.35, 3.4); });
      o += spike(c, [60, 76], 9, -2.4, 2.4) + spike(c, [80, 80], 9, -2.2, 2.4) + spike(c, [72, 64], 8, -2.0, 2.2);
      // near legs
      o += limb('M56,94 L52,108 L46,119', bk, 9) + limb('M92,92 L96,108 L94,119', bk, 9) + L('M46,119 l-7,2 M46,119 l-3,3 M94,119 l-7,2 M94,119 l-2,3', OL, 3) + L('M46,119 l-7,2 M94,119 l-7,2', '#8a6a3a', 1.4);
      // head: a seed-pod jaw full of thorns
      o += P('M12,64 L34,70 L14,80 Z', '#3a0e10', 1.2) + C(26, 72, 8, glow(c, '#ff6a2a', 0.5));
      var up = 'M44,64 C42,54 30,50 20,54 L4,62 L12,65 L30,68 L44,72 Z', lo = 'M42,74 L30,72 L14,80 L8,84 C18,90 34,88 44,82 Z';
      o += body(c, up, bk, F('M32,46 L50,46 L50,74 L34,74 Z', dbk, 0.7) + E(26, 56, 6, 2.6, lt(bk, 0.25), 0, 0.7), 2);
      o += body(c, lo, dk(bk, 0.1), F('M8,84 L44,80 L44,90 L8,90 Z', dbk, 0.7), 2);
      [[8, 64], [14, 66], [20, 67], [26, 68]].forEach(function (p) { o += P(pd([[p[0] - 2, p[1] - 0.5], [p[0], p[1] + 5], [p[0] + 2, p[1] + 0.4]], true), THORN, 0.8); });
      [[12, 81], [18, 79], [24, 77], [30, 75]].forEach(function (p) { o += P(pd([[p[0] - 2, p[1] + 0.5], [p[0], p[1] - 5], [p[0] + 2, p[1] - 0.4]], true), THORN, 0.8); });
      o += gEye(c, 28, 58, 2.2, '#ff7a2a') + L('M20,54 L34,55', OL, 2);
      return G(o, at(0.98, 64, 122));
    },
    lord_vyletongue: function (c) {
      var arm = '#3e2e46';
      return satyr(c, {
        skin: '#8e62aa', fur: '#2a1a2a', hair: '#e2d8ec', horns: 'swept', hornCol: '#2a1e20', eye: '#ffe23a', scale: 0.96, armW: 10,
        chest: function (c) { return L('M46,52 L80,80 M82,52 L50,80', OL, 4.4) + L('M46,52 L80,80 M82,52 L50,80', '#4a2a3a', 2.4) + C(64, 66, 4.4, c.cel(GOLD), 1.4) + C(64, 66, 1.8, '#9aff5a'); },
        front: function (c) { return P('M50,82 L78,82 L74,104 L64,108 L54,104 Z', c.cel(arm), 1.8) + L('M52,86 L76,86', GOLD, 1.6) + P(pd([[60, 92], [68, 92], [64, 100]], true), GOLD, 1); },
        pads: function (c) { return pauldron(c, 82, 50, 11, arm, GOLD) + P(pd([[80, 42], [86, 30], [88, 44]], true), THORN, 1.1) + pauldron(c, 46, 52, 13, arm, GOLD) + P(pd([[40, 44], [36, 30], [46, 42]], true), THORN, 1.1) + P(pd([[50, 42], [52, 30], [55, 43]], true), THORN, 1.1); },
        near: [[48, 56], [36, 66], [26, 70]], far: [[80, 54], [94, 50], [102, 40]],
        wNearFront: function (c, p) { return scimitar(c, [p[0] + 1, p[1]], 32, -PI / 2 - 0.62, '#d0d0dc'); },
        wFar: function (c, p) { return scimitar(c, [p[0], p[1] + 1], 30, -PI / 2 + 0.22, '#b8b8c8'); }
      });
    },
    celebras_the_cursed: function (c) {
      var sk = '#a494c8', bark = '#6e4c30', moss = '#5a8a3a', vein = '#6aff9a';
      return biped(c, {
        skin: sk, shirt: sk, sleeve: sk, glove: sk, noLegs: true, hipY: 84, shadowR: 42, armW: 9, hx: 58, hy: 32, neckCol: sk,
        torsoD: 'M44,50 C50,42 78,42 84,50 L80,68 L78,86 L50,86 L48,68 Z',
        back: function (c) { var T = taper([[62, 22], [80, 30], [88, 50], [86, 74]], 14, 5, 5); return C(64, 60, 58, glow(c, EMER, 0.25)) + body(c, T.d, moss, F(ribbonBand(T, 0.55, 1), dk(moss, 0.3), 0.8), 1.8); },
        chest: function (c) { return F('M66,42 L90,42 L90,90 L62,90 C70,74 62,58 66,42 Z', bark) + L('M68,46 C72,58 66,70 70,88 M76,46 C80,60 74,74 78,88', dk(bark, 0.4), 1.4) + L('M66,42 C62,58 70,74 62,90', OL, 1.6) + L('M52,56 Q58,62 64,56 M54,66 Q58,69 62,66', dk(sk, 0.3), 1.2) + L('M56,72 l4,6 l-3,6 M60,50 l3,6', vein, 1.3, 0.9); },
        front: function (c) {
          var tr = 'M46,80 L52,84 L58,78 L64,84 L72,78 L80,83 C84,96 90,108 102,116 L110,121 L88,121 L82,116 L76,122 L60,122 L54,116 L48,122 L24,121 L34,114 C42,104 46,94 46,80 Z';
          return body(c, tr, bark, F('M66,74 L112,74 L112,124 L72,124 C74,104 70,90 66,74 Z', dk(bark, 0.3), 0.8) + L('M52,88 C50,100 46,110 40,118 M60,86 C60,100 58,110 58,120 M70,86 C72,100 76,110 82,118', dk(bark, 0.45), 1.4) + E(62, 100, 3, 4, dk(bark, 0.5), 1) + crack('M50,96 l6,6 l-2,8', vein, 1.3), 2.2) +
            mossCap(c, 58, 82, 12, 3, 91) + leaf(c, 34, 114, PI - 0.3, 10, '#6a8a30') + leaf(c, 98, 114, -0.3, 9, '#8a6a2a');
        },
        pads: function (c) { return leaf(c, 44, 48, -2.6, 13, '#8a6a2a') + leaf(c, 46, 46, -1.9, 12, moss) + leaf(c, 84, 46, -0.8, 11, '#7a8a2a') + P(shag(46, 52, 9, 6, 6, 0.3, 92), c.cel(moss), 1.4) + P(shag(84, 50, 8, 5, 6, 0.3, 93), c.cel(dk(bark, 0.05)), 1.4); },
        head: function (c, x, y) { return elfHead(c, x, y, { skin: sk, hair: moss, bark: bark, vein: vein }); },
        near: [[48, 56], [40, 70], [34, 80]],
        wNear: function (c, p) { return limb('M' + pt([p[0] + 3, 121]) + 'C' + pt([p[0] - 3, 90]) + ' ' + pt([p[0] + 4, 50]) + ' ' + pt([p[0] - 4, 22]), dk(bark, 0.1), 3.4) + limb('M' + pt([p[0] - 4, 22]) + 'l-5,-6 M' + pt([p[0] - 4, 22]) + 'l5,-7', dk(bark, 0.1), 2) + C(p[0] - 4, 14, 14, glow(c, EMER, 0.7)) + crystal(c, p[0] - 4, 22, 13, 7, -PI / 2, EMER); },
        far: [[80, 54], [92, 62], [100, 54]], forearm: bark,
        farHand: function (c, p) { return C(p[0], p[1] - 4, 10, glow(c, EMER, 0.6)) + clawHand(p, bark, 1.05, '#c8b88a'); },
        tf: at(0.97, 64, 122)
      });
    },
    landslide: function (c) {
      var st = '#8e6e4c', dst = dk(st, 0.22), am = '#ffa630', o = shadow(c, 64, 50);
      o += C(64, 64, 62, glow(c, ORAG, 0.28));
      o += boulder(c, 82, 108, 13, 14, dst, 101) + P('M70,120 L96,120 L96,114 L72,114 Z', c.cel(dk(dst, 0.1)), 1.6);
      // far arm
      o += boulder(c, 102, 72, 12, 16, dst, 102) + boulder(c, 106, 98, 15, 14, dst, 103, { inner: crack('M100,96 l6,4 l6,-3', am, 1.2) });
      o += boulder(c, 94, 46, 16, 14, dst, 104) + crystal(c, 92, 38, 16, 7, -PI / 2 + 0.3, ORA) + crystal(c, 100, 42, 11, 6, -PI / 2 + 0.8, ORAG);
      o += boulder(c, 50, 108, 14, 15, st, 105) + P('M34,121 L62,121 L62,114 L36,114 Z', c.cel(st), 1.6);
      o += boulder(c, 66, 64, 33, 30, st, 106, { k: 11, inner: crack('M50,52 l8,8 l-2,10 l8,8 M72,48 l-4,10 l8,6', am, 1.8) + C(60, 66, 10, glow(c, am, 0.6)) });
      o += mossCap(c, 68, 36, 14, 4, 107);
      // head sunk between the shoulders
      o += boulder(c, 52, 32, 15, 12, st, 108) + P('M36,28 L54,22 L66,26 L62,31 L40,33 Z', c.cel(dk(st, 0.12)), 1.6) + gEye(c, 44, 33, 2.3, am) + gEye(c, 56, 32, 2, am) + L('M42,40 L56,39', OL, 1.8);
      o += boulder(c, 36, 50, 17, 14, st, 109) + crystal(c, 30, 40, 18, 8, -PI / 2 - 0.35, ORA) + crystal(c, 40, 38, 13, 6, -PI / 2 + 0.1, ORAG) + mossCap(c, 36, 40, 8, 3, 110);
      // near arm: huge fist
      o += boulder(c, 28, 74, 13, 16, st, 111) + boulder(c, 24, 100, 19, 16, st, 112, { inner: crack('M14,96 l6,4 l8,-2', am, 1.2) }) + L('M10,98 l4,0 M10,104 l5,0', dk(st, 0.45), 1.2);
      // debris floating round the fists
      o += boulder(c, 6, 82, 3.4, 3, st, 113, { k: 6, sw: 1.1 }) + boulder(c, 46, 86, 3, 2.6, st, 114, { k: 6, sw: 1.1 }) + boulder(c, 120, 86, 3.4, 3, dst, 115, { k: 6, sw: 1.1 }) + boulder(c, 116, 112, 2.6, 2.4, dst, 116, { k: 6, sw: 1 });
      return o;
    },
    princess_theradras: function (c) {
      var st = '#8e7a60', dst = dk(st, 0.2), hr = '#8a6038', moss = '#6e8e3a', o = shadow(c, 66, 54), b = '', h = '';
      o += C(58, 44, 62, glow(c, EMER, 0.32));
      // flowing earth hair: one mane streaming back from the crown in wavy lobes, loose grit falling off it
      var mane = 'M44,20 C50,6 76,0 98,8 C114,14 122,28 120,44 C126,52 124,62 116,66 C126,74 124,88 112,92 C122,100 116,112 102,112 C94,106 90,96 90,86 C84,72 80,56 74,46 C68,40 60,38 52,36 Z';
      o += body(c, mane, hr, F('M96,0 L130,0 L130,116 L100,116 C112,98 116,70 108,50 C104,30 100,14 96,0 Z', dk(hr, 0.3), 0.85) +
        L('M58,14 C80,8 104,18 110,40 C114,56 106,70 108,86 M62,26 C82,22 96,34 98,52 C100,66 94,80 100,98 M74,36 C86,44 88,60 88,74', dk(hr, 0.42), 1.5) +
        L('M56,10 C76,4 96,10 104,24', lt(hr, 0.25), 1.6, 0.8) + L('M66,22 C82,20 92,30 94,40 M80,52 C84,60 84,66 82,72', '#7a9a40', 2, 0.75), 2.2);
      o += boulder(c, 124, 72, 2.4, 2, '#9a8a74', 140, { k: 6, sw: 0.9 }) + boulder(c, 120, 98, 2.6, 2.2, '#9a8a74', 141, { k: 6, sw: 0.9 }) + boulder(c, 110, 120, 2.2, 1.8, '#9a8a74', 142, { k: 6, sw: 0.9 }) + boulder(c, 124, 108, 1.8, 1.6, '#9a8a74', 143, { k: 6, sw: 0.8 });
      // body, drawn a size down so the head can be large
      b += body(c, 'M8,122 C12,108 26,100 40,96 C46,90 52,86 56,82 L78,82 C82,88 90,94 100,98 C112,104 120,112 122,122 Z', dst, F('M66,78 L126,78 L126,124 L74,124 C80,104 74,92 66,78 Z', dk(dst, 0.3), 0.8), 2.2);
      b += boulder(c, 22, 114, 13, 8, st, 124) + boulder(c, 104, 113, 14, 9, dst, 125) + boulder(c, 62, 113, 17, 10, st, 126) + boulder(c, 42, 102, 10, 7, st, 127) + boulder(c, 86, 101, 11, 7, dst, 128) + mossCap(c, 62, 104, 10, 3, 129);
      b += limb('M88,46 L100,66 L102,88', dk(dst, 0.2), 12) + boulder(c, 95, 56, 9, 11, dst, 130) + boulder(c, 101, 77, 8, 11, dst, 131) + boulder(c, 103, 93, 10, 9, dst, 132);
      var td = 'M38,46 C44,36 84,36 92,46 L86,62 C80,72 78,78 78,86 L54,86 C54,78 50,72 44,62 Z';
      b += body(c, td, st, F('M68,34 L96,34 L96,90 L70,90 C74,70 72,54 68,34 Z', dk(st, 0.28), 0.85) + L('M50,58 L64,64 L80,56 M56,72 L64,78 L74,72', dk(st, 0.42), 1.4) + crack('M62,66 l2,6 l-4,6 M74,60 l4,8', EMER, 1.4), 2.4);
      b += L('M44,46 Q64,60 86,46', OL, 3.2) + L('M44,46 Q64,60 86,46', '#4a3a2a', 1.8) + crystal(c, 64, 53, 10, 6, PI / 2, EMER) + crystal(c, 54, 51, 7, 4.4, PI / 2 + 0.3, EMER) + crystal(c, 74, 51, 7, 4.4, PI / 2 - 0.3, EMER);
      b += crystal(c, 92, 38, 14, 7, -PI / 2 + 0.4, EMER) + boulder(c, 88, 44, 12, 10, dst, 133);
      b += boulder(c, 40, 48, 13, 11, st, 135) + crystal(c, 34, 40, 13, 6, -PI / 2 - 0.4, EMER);
      b += limb('M40,50 L26,62 L16,48', dst, 11) + boulder(c, 32, 58, 9, 10, st, 136) + boulder(c, 20, 56, 7, 10, st, 137);
      b += L('M12,42 l-3,-8 M16,40 l0,-9 M20,42 l3,-7', OL, 4.6) + L('M12,42 l-3,-8 M16,40 l0,-9 M20,42 l3,-7', st, 2.4) + boulder(c, 16, 45, 7, 6, lt(st, 0.05), 138);
      b += C(14, 20, 16, glow(c, EMER, 0.8)) + C(14, 20, 5.6, c.rg([[0, '#ffffff'], [0.5, '#b8ffd0'], [1, EMER]]), 1.4);
      o += G(b, at(0.92, 64, 122));
      // head, drawn large: crown of green crystal, stone face, glowing eyes
      var x = 52, y = 34;
      o += R(x - 5, y + 10, 12, 12, c.cel(dst), 1.8);
      h += C(x, y - 16, 14, glow(c, EMER, 0.5)) + crystal(c, x - 5, y - 10, 9, 4.4, -PI / 2 - 0.5, EMER) + crystal(c, x + 1, y - 12, 12, 5.4, -PI / 2 - 0.1, EMER) + crystal(c, x + 8, y - 10, 9, 4.4, -PI / 2 + 0.35, dk(EMER, 0.1));
      var fd = 'M' + pt([x - 8, y - 10]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 8, y + 11]) + ' ' + pt([x + 2, y + 15]) + ' ' + pt([x - 4, y + 16]) + 'L' + pt([x - 7, y + 11]) + 'L' + pt([x - 9, y + 6]) + 'L' + pt([x - 10, y + 1]) + 'L' + pt([x - 13, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
      h += body(c, fd, lt(st, 0.1), F(pd([[x + 3, y - 16], [x + 14, y - 16], [x + 14, y + 18], [x + 1, y + 18]], true), dk(st, 0.25), 0.8) + L('M' + pt([x + 4, y - 12]) + 'l-2,6 l3,4', dk(st, 0.35), 0.9), 1.8);
      h += P('M' + pt([x - 9, y - 9]) + 'C' + pt([x - 4, y - 17]) + ' ' + pt([x + 10, y - 16]) + ' ' + pt([x + 11, y - 4]) + 'L' + pt([x + 6, y - 8]) + 'C' + pt([x + 2, y - 12]) + ' ' + pt([x - 4, y - 12]) + ' ' + pt([x - 9, y - 9]) + 'Z', c.cel(hr), 1.2);
      h += gEye(c, x - 6, y - 2, 2, EMER) + gEye(c, x + 3, y - 2.6, 1.7, EMER) + L('M' + pt([x - 10, y - 5.6]) + 'L' + pt([x - 2, y - 6.2]) + 'M' + pt([x + 1, y - 6.4]) + 'L' + pt([x + 7, y - 6]), OL, 1.4) + L('M' + pt([x - 8, y + 9]) + 'L' + pt([x - 3, y + 8.6]), OL, 1.2);
      o += G(h, at(1.22, x, y));
      // a lock of hair falling in front of the shoulder
      o += earthStrand(c, [[x - 4, y - 12], [x - 14, y - 4], [x - 15, y + 10], [x - 21, y + 24], [x - 17, y + 38], [x - 21, y + 50]], 12, 4, hr, 134);
      return o + motes(139, 10, 4, 124, 4, 70, '#b0ffc8');
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#6a4a8a'), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, '#241a2a') + ground(c, 118, '#4a3848', '#261c28'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#6a4a8a"/></svg>'; }
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
