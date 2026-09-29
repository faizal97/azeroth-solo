/* art_shalzua.js — Temple of Shal'zua art for Realm of Loner (expansion "The Drowned Crown", Krugar dungeon, level 60:
 * the Wavebreaker trolls' temple to the sea spirit Shal'zua, drowned for ten thousand years and risen with the Skullreef
 * Isles; the flooded courtyard of sacred tide pools under a storm sky, the drowned shrine hall with its serpent idols,
 * shell mosaic and offerings, and the loa's altar set in the lower jaw of a giant carved sea-serpent head over dark
 * water; the Wavebreaker zealots and spiritcallers and the tide serpents, and the bosses Hexmother Oyala, Tidefang,
 * High Priest Zan'jin and the Avatar of Shal'zua).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Shal'zua keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_scholomance.js; the troll rig,
 * toes, stone faces and merlons are copies of art_zulfarrak.js. The drowned troll head, the shells, barnacles, kelp,
 * coral, tide pools, clam lamps, serpent idols and the carved serpent maw are new here.
 * The Wavebreaker look is kept apart from the saturated teal Vinewild trolls and the sand-coloured Duneskin:
 * pale washed-out teal skin with darker drowned mottles, barnacles on ears, cheeks, tusks and shoulders, dark green
 * seaweed dreads with kelp floats, teal glowing eyes, kelp skirts, shell and pearl jewellery and coral weapons.
 * The Avatar is a water body (not a naga's flesh) with abyssal violet veins and extra violet eyes.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix sz<counter>_).
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
  function Ctx() { this.p = 'sz' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
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
  function torch(c, x, y, s) {
    return C(x, y - 12 * s, 30 * s, glow(c, '#ffa040', 0.55)) + limb('M' + pt([x, y + 8 * s]) + 'L' + pt([x, y - 4 * s]), '#6a4a2a', 2.6 * s) +
      R(x - 4 * s, y + 1 * s, 8 * s, 3 * s, c.cel('#4a4444'), 1 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 4 * s, c.cel('#5a3a24'), 1 * s) + flame(c, x, y - 4 * s, 0.75 * s);
  }
  function brickWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 12;
    var r = rng(seed || 3), jn = '', sh = '';
    for (var y = y0; y < y1; y += bh) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var off = ((y - y0) / bh) % 2 ? 11 : 0;
      for (var x = x0 - off; x < x1; x += 22) { jn += 'M' + pt([x, y]) + 'l0,' + n(bh); if (r() < 0.22) sh += R(x + 1, y + 1, 20, bh - 2, r() < 0.5 ? dk(col, 0.12) : lt(col, 0.08), 0); }
    }
    return R(x0, y0, x1 - x0, y1 - y0, col) + sh + L(jn, dk(col, 0.4), 1.1, 0.85);
  }
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
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
  function feather(c, x, y, ang, len, col, tip) {
    var q = dirQ([x, y], ang), d = 'M' + pt(q(0, 0)) + 'Q' + pt(q(len * 0.5, len * 0.26)) + ' ' + pt(q(len, 0)) + 'Q' + pt(q(len * 0.5, -len * 0.26)) + ' ' + pt(q(0, 0)) + 'Z';
    return P(d, col, 0.9) + (tip ? F('M' + pt(q(len * 0.66, len * 0.2)) + 'L' + pt(q(len, 0)) + 'L' + pt(q(len * 0.66, -len * 0.2)) + 'Z', tip) : '') + L('M' + pt(q(-1, 0)) + 'L' + pt(q(len * 0.9, 0)), dk(col, 0.4), 0.7);
  }
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  function pauldron(c, x, y, r, col, trim) {
    col = col || '#b8bec8';
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }

  // ============================================================
  //  SCENE PIECES (copies of art_brd.js)
  // ============================================================
  function ring(x, y, rx, ry, col, w) { return L(ellD(x, y, rx, ry), OL, w + 1.8) + L(ellD(x, y, rx, ry), col, w); }
  function chainLine(a, b, sag, s, col) {
    s = s || 1; col = col || IRONL;
    var len = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])), k = Math.max(2, Math.round(len / (5 * s))), p = [], o = '';
    for (var i = 0; i <= k; i++) { var t = i / k; p.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
    o += L(pd(p), OL, 3.4 * s) + L(pd(p), dk(col, 0.25), 1.4 * s);
    for (var j = 0; j <= k; j += 2) o += ring(p[j][0], p[j][1], 2.3 * s, 2.9 * s, col, 1.2 * s);
    return o;
  }
  function darkFloor(c, y, col, seed) { return flagFloor(c, y, 200, col, seed) + R(0, y - 2, 400, 8, c.lg([[0, '#000', 0.4], [1, '#000', 0]])); }

  // ============================================================
  //  SHARED COPIES (art_zulfarrak.js, which copied art_stranglethorn.js)
  // ============================================================
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function stoneFace(c, x, y, w, h, col, js, top) {
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
  }
  function stepMerlons(c, x0, x1, y, col, w) {
    w = w || 10; var o = '';
    for (var x = x0; x < x1 - w * 0.5; x += w * 1.6) o += P(pd([[x, y], [x, y - w * 0.4], [x + w * 0.2, y - w * 0.4], [x + w * 0.2, y - w * 0.8], [x + w * 0.8, y - w * 0.8], [x + w * 0.8, y - w * 0.4], [x + w, y - w * 0.4], [x + w, y]], true), c.cel(col), 1.2);
    return o;
  }
  function lightShaft(c, x0, x1, y0, x2, x3, y1, col, op) { return F(pd([[x0, y0], [x1, y0], [x3, y1], [x2, y1]], true), c.lg([[0, col, op], [1, col, 0]])); }

  // ============================================================
  //  THE DROWNED TEMPLE: palette
  // ============================================================
  var ST = '#434f4b', STL = '#5c6c66', STD = '#262e2c', MOSS = '#56733e';
  var SEA = '#0c3440', SEAM = '#1c6a78', SEAL = '#56c8c8', FOAM = '#dafaf4', TEAL = '#5affe0';
  var KELP = '#3e5c26', KELPL = '#6e8c36', BULB = '#8a9a3a';
  var CORAL = '#f27a8c', CORALL = '#ffb0bc', CORALD = '#c24a66';
  var BARN = '#dcd6c2', BARND = '#7a7462', NACRE = '#e4e0f0', PEARL = '#f6f2e6', SHELL = '#ecc4aa';
  var WSKIN = '#a4cdc2', WSKD = '#6e9c96', WHAIR = '#56722e', WHAIRD = '#324a1c', WEYE = '#5cf4e2', DRIP = '#8ae8e0', BONE = '#e8e0c8', DRIFT = '#7a6e5a', ROPE = '#6a5a40';
  var VIO = '#9a44f0', VIOL = '#d4a0ff', VIOD = '#3a1262', ABYSS = '#070a18';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // one barnacle: a pale cone with a dark mouth
  function barn(x, y, r) { return '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(r) + '" ry="' + n(r * 0.82) + '" fill="' + BARN + '" stroke="' + OL + '" stroke-width="' + n(Math.max(0.5, r * 0.34)) + '"/>' + E(x + r * 0.08, y - r * 0.08, r * 0.42, r * 0.32, BARND); }
  function barns(seed, x, y, cnt, sx, sy, r0) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += barn(x + (r() - 0.5) * sx, y + (r() - 0.5) * sy, r0 * (0.6 + r() * 0.6)); return o; }
  // a kelp strand hanging down (up = false) or growing up (up = true)
  function kelp(c, x, y, len, up, w, seed, col) {
    var r = rng(seed), pts = [], ph = r() * PI * 2, amp = 3 + r() * 4;
    for (var i = 0; i <= 5; i++) { var t = i / 5; pts.push([x + Math.sin(ph + t * 3.6) * amp * t, y + (up ? -1 : 1) * len * t]); }
    var T = taper(pts, w, w * 0.3, 3); col = col || KELP;
    return P(T.d, c.cel(col), 1.2) + L(along(T, 0.5), lt(col, 0.3), 0.8, 0.7) + (up ? '' : E(pts[5][0], pts[5][1] + 1, w * 0.36, w * 0.5, BULB, 1));
  }
  // curling wave crests carved into a stone band
  function waveFrieze(c, x0, x1, y, h, col) {
    var o = R(x0, y, x1 - x0, h, c.cel(col), 1.3), d = '', u = h * 1.9;
    for (var x = x0 + 1; x < x1 - u * 0.4; x += u) d += 'M' + pt([x, y + h * 0.82]) + 'Q' + pt([x + u * 0.45, y + h * 0.82]) + ' ' + pt([x + u * 0.62, y + h * 0.3]) + 'Q' + pt([x + u * 0.78, y + h * 0.08]) + ' ' + pt([x + u * 0.9, y + h * 0.36]) + 'L' + pt([x + u, y + h * 0.82]);
    return o + L(d, dk(col, 0.5), Math.max(0.8, h * 0.14)) + L('M' + pt([x0, y + h * 0.2]) + 'L' + pt([x1, y + h * 0.2]), lt(col, 0.2), Math.max(0.5, h * 0.06), 0.6);
  }
  // fan shell: hinge at x,y, opening along ang
  function scallop(c, x, y, r, ang, col) {
    col = col || SHELL;
    var q = dirQ([x, y], ang), a = [], rb = '';
    for (var i = 0; i <= 8; i++) { var t = -1.05 + i * 2.1 / 8, rr = r * (i % 2 ? 0.93 : 1); a.push(q(Math.cos(t) * rr, Math.sin(t) * rr)); }
    for (var j = 1; j < 8; j += 2) rb += 'M' + pt(q(r * 0.18, 0)) + 'L' + pt(a[j]);
    return P('M' + pt(q(0, 0)) + a.map(function (p) { return 'L' + pt(p); }).join('') + 'Z', c.cel(col), Math.max(0.6, r * 0.2)) + L(rb, dk(col, 0.35), Math.max(0.4, r * 0.1)) + E(q(0, 0)[0], q(0, 0)[1], r * 0.2, r * 0.16, dk(col, 0.2));
  }
  // spiral shell (nautilus), aperture towards dir (-1 = left)
  function spiralD(x, y, r0, turns, dir) {
    var p = [];
    for (var i = 0; i <= turns * 14; i++) { var t = i / 14 * PI * 2, rr = r0 * Math.exp(-0.2 * t); p.push([x + dir * Math.cos(t) * rr, y + Math.sin(t) * rr]); }
    return 'M' + p.map(pt).join('L');
  }
  function nautilus(c, x, y, r, dir, col) {
    dir = dir || -1; col = col || '#f2e6d0';
    var o = C(x, y, r, c.cel(col), Math.max(0.8, r * 0.14)), st = '';
    for (var k = 0; k < 6; k++) { var a = PI * 0.9 + k * 0.42, ca = Math.cos(a) * dir, sa = Math.sin(a); st += 'M' + pt([x + ca * r * 0.98, y + sa * r * 0.98]) + 'Q' + pt([x + ca * r * 0.7 + sa * r * 0.2, y + sa * r * 0.7]) + ' ' + pt([x + ca * r * 0.45, y + sa * r * 0.5]); }
    o += L(st, '#a8603a', Math.max(0.6, r * 0.14), 0.9) + L(spiralD(x, y, r * 0.82, 2, dir), dk(col, 0.45), Math.max(0.5, r * 0.08));
    return o + E(x + dir * r * 0.72, y + r * 0.2, r * 0.3, r * 0.5, '#6a3a2a', Math.max(0.5, r * 0.08));
  }
  function starfish(c, x, y, s, col, rot) {
    var a = [], r0 = rot || 0;
    for (var i = 0; i < 10; i++) { var t = r0 - PI / 2 + i * PI / 5, rr = (i % 2 ? 2.6 : 7) * s; a.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr * 0.6]); }
    return P(pd(a, true), c.cel(col || '#e8783a'), 1 * s) + C(x, y, 1 * s, lt(col || '#e8783a', 0.4));
  }
  // branching coral growing up from x,y
  function coral(c, x, y, s, col, seed) {
    col = col || CORAL; var r = rng(seed || 1), o = '', d = '';
    function br(p, a, len, depth) {
      var e = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
      d += 'M' + pt(p) + 'L' + pt(e);
      if (depth > 0) { br(e, a - 0.45 - r() * 0.3, len * 0.72, depth - 1); br(e, a + 0.4 + r() * 0.3, len * 0.7, depth - 1); }
      else o += C(e[0], e[1], 1.5 * s, lt(col, 0.35), 0.8 * s);
    }
    br([x, y], -PI / 2 - 0.1, 11 * s, 2); br([x - 2 * s, y], -PI / 2 - 0.7, 8 * s, 1); br([x + 2 * s, y], -PI / 2 + 0.6, 8 * s, 1);
    return L(d, OL, 4.6 * s) + L(d, col, 2.6 * s) + o;
  }
  function anemone(c, x, y, s, col) {
    col = col || '#e070b0'; var d = '';
    for (var i = 0; i < 7; i++) { var a = -PI + 0.3 + i * (PI - 0.6) / 6; d += 'M' + pt([x, y - 3 * s]) + 'Q' + pt([x + Math.cos(a) * 5 * s, y - 3 * s + Math.sin(a) * 7 * s]) + ' ' + pt([x + Math.cos(a) * 8 * s, y - 3 * s + Math.sin(a) * 8 * s]); }
    return E(x, y, 5 * s, 3 * s, c.cel(dk(col, 0.2)), 1 * s) + L(d, OL, 3 * s) + L(d, col, 1.6 * s);
  }
  // wavy caustic light net over a wall
  function caustics(seed, x0, x1, y0, y1, col, op) {
    var r = rng(seed), d = '';
    for (var y = y0; y < y1; y += 13) { d += 'M' + pt([x0, y + r() * 4]); for (var x = x0; x < x1; x += 18) d += 'Q' + pt([x + 9, y + (r() - 0.5) * 12]) + ' ' + pt([x + 18, y + (r() - 0.5) * 6]); }
    return L(d, col || TEAL, 1.2, op || 0.14);
  }
  // shallow water over a stone floor: tint, reflections, ripples
  function shallows(c, y, seed, col) {
    var r = rng(seed), rp = '', o = R(0, y, 400, 240 - y, c.lg([[0, col || SEAL, 0.24], [1, col || SEAL, 0.07]]));
    for (var i = 0; i < 12; i++) { var x = r() * 400, yy = y + 6 + r() * (234 - y), w = 8 + (yy - y) * 0.2 + r() * 10; rp += 'M' + pt([x - w, yy]) + 'Q' + pt([x, yy - 2]) + ' ' + pt([x + w, yy]); }
    return o + L(rp, FOAM, 1.1, 0.55);
  }
  // tide pool sunk into the floor: stone rim, glowing water, ripples, an anemone and a starfish
  function tidePool(c, cx, cy, rx, ry, seed) {
    var r = rng(seed), o = C(cx, cy - ry, rx * 0.9, glow(c, TEAL, 0.28));
    o += E(cx, cy + 3, rx + 6, ry + 4, c.cel(STD), 1.8) + E(cx, cy, rx + 6, ry + 4, c.lg([[0, STL], [1, ST]]), 1.8);
    o += E(cx, cy, rx, ry, c.lg([[0, '#0a3a4a'], [0.55, '#1a8a98'], [1, '#6ae8e0']]), 1.4);
    o += E(cx + rx * 0.1, cy + ry * 0.1, rx * 0.5, ry * 0.36, '#e8fff8', 0, 0.22) + L('M' + pt([cx - rx * 0.6, cy]) + 'q' + n(rx * 0.14) + ',-2 ' + n(rx * 0.28) + ',0 M' + pt([cx + rx * 0.15, cy + ry * 0.3]) + 'q' + n(rx * 0.16) + ',-2 ' + n(rx * 0.32) + ',0', FOAM, 1.1, 0.8);
    o += barns(seed + 1, cx - rx * 0.7, cy + ry + 1, 4, rx * 0.3, 3, 1.6) + barns(seed + 2, cx + rx * 0.8, cy + ry * 0.4, 3, rx * 0.2, 3, 1.5);
    if (r() < 0.8) o += anemone(c, cx + rx * 0.55, cy - ry * 0.7, 0.8);
    return o + starfish(c, cx - rx * 0.35, cy + ry + 2, 0.7, r() < 0.5 ? '#e8783a' : '#d85a8a', r());
  }
  // giant clam on a stone stand, gaping open round a glowing pearl lamp (x = centre, y = ground)
  function clamLamp(c, x, y, s, h) {
    h = (h == null ? 18 : h) * s;
    var ty = y - h, o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.3) + C(x, ty - 10 * s, 34 * s, glow(c, TEAL, 0.5)), sc = '#8eb0a6';
    o += stoneFace(c, x - 5 * s, y, 10 * s, h, STL, 6 * s) + R(x - 9 * s, y - 4 * s, 18 * s, 4 * s, c.cel(ST), 1.2 * s);
    o += scallop(c, x, ty - 1 * s, 17 * s, -PI / 2, sc);
    o += C(x, ty - 5.5 * s, 5.6 * s, c.rg([[0, '#ffffff'], [0.5, '#aefff0'], [1, '#3ad0c0']]), 1.2 * s) + C(x - 1.8 * s, ty - 7.4 * s, 1.6 * s, '#ffffff', 0, 0.9);
    var bw = 'M' + pt([x - 16 * s, ty - 2 * s]) + 'Q' + pt([x - 12 * s, ty + 1 * s]) + ' ' + pt([x - 8 * s, ty - 1 * s]) + 'Q' + pt([x - 4 * s, ty + 1.4 * s]) + ' ' + pt([x, ty - 1 * s]) + 'Q' + pt([x + 4 * s, ty + 1.4 * s]) + ' ' + pt([x + 8 * s, ty - 1 * s]) + 'Q' + pt([x + 12 * s, ty + 1 * s]) + ' ' + pt([x + 16 * s, ty - 2 * s]) + 'C' + pt([x + 14 * s, ty + 9 * s]) + ' ' + pt([x - 14 * s, ty + 9 * s]) + ' ' + pt([x - 16 * s, ty - 2 * s]) + 'Z';
    o += body(c, bw, lt(sc, 0.08), L('M' + pt([x - 8 * s, ty]) + 'L' + pt([x - 5 * s, ty + 6 * s]) + 'M' + pt([x, ty]) + 'L' + pt([x, ty + 6.6 * s]) + 'M' + pt([x + 8 * s, ty]) + 'L' + pt([x + 5 * s, ty + 6 * s]), dk(sc, 0.35), 1 * s), 1.5 * s);
    return o + barns(Math.round(x * 7), x, ty + 5 * s, 3, 16 * s, 3 * s, 1.5 * s);
  }
  // stone serpent-head water spout on a wall, facing dir, pouring down to yb
  function spout(c, x, y, dir, yb) {
    var q = function (u, v) { return [x + dir * u, y + v]; }, o = '';
    o += F(pd([q(-12, 2), q(-9, 2), q(-6, yb - y), q(-18, yb - y)], true), c.lg([[0, '#bff8f0', 0.9], [1, SEAL, 0.5]])) + L('M' + pt(q(-12, 6)) + 'L' + pt(q(-12, yb - y - 4)) + 'M' + pt(q(-15, 10)) + 'L' + pt(q(-16, yb - y - 2)), FOAM, 1, 0.8);
    o += E(q(-12, yb - y)[0], yb, 10, 2.6, FOAM, 0, 0.7);
    o += P(pd([q(0, -9), q(-10, -6), q(-18, -1), q(-19, 1), q(-8, 2), q(-18, 4), q(-16, 7), q(0, 8)], true), c.cel(STL), 1.4) + C(q(-9, -3)[0], q(-9, -3)[1], 1.4, TEAL) + P(pd([q(-4, -8), q(2, -16), q(4, -8)], true), c.cel(ST), 1);
    return o;
  }
  // stepped drowned ziggurat (x = centre, y = base)
  function ziggurat(c, x, y, s) {
    var o = E(x, y + 3, 100 * s, 6 * s, '#000', 0, 0.25), by = y;
    [[94, 18], [76, 17], [58, 16], [42, 15]].forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s;
      o += stoneFace(c, x - hw, by, hw * 2, th, i % 2 ? ST : lt(ST, 0.07), 7 * s) + waveFrieze(c, x - hw, x + hw, by - th, 4.4 * s, STL);
      o += barns(3200 + i, x - hw + 12 * s, by - 5 * s, 4, 16 * s, 5 * s, 1.7 * s) + barns(3210 + i, x + hw - 12 * s, by - 6 * s, 4, 14 * s, 5 * s, 1.7 * s);
      o += kelp(c, x - hw + 5 * s, by - th + 3 * s, 10 * s + i * 2, false, 3.4 * s, 3220 + i) + kelp(c, x + hw - 6 * s, by - th + 3 * s, 12 * s, false, 3.4 * s, 3230 + i, KELPL);
      by -= th;
    });
    var sw0 = 22 * s, sw1 = 12 * s, st = '', top = by;
    o += P(pd([[x - sw0 - 4 * s, y], [x - sw1 - 3 * s, top], [x + sw1 + 3 * s, top], [x + sw0 + 4 * s, y]], true), c.cel(STD), 1.5 * s);
    o += P(pd([[x - sw0, y], [x - sw1, top], [x + sw1, top], [x + sw0, y]], true), c.cel(STL), 1.3 * s);
    for (var j = 1; j < 15; j++) { var tt = j / 15, yy = y - (y - top) * tt, hw2 = sw0 + (sw1 - sw0) * tt; st += 'M' + pt([x - hw2, yy]) + 'L' + pt([x + hw2, yy]); }
    o += L(st, dk(STL, 0.4), 1 * s) + F(pd([[x - 6 * s, top], [x + 6 * s, top], [x + 10 * s, y], [x - 10 * s, y]], true), c.lg([[0, '#c8fff4', 0.7], [1, SEAL, 0.35]]));
    o += L('M' + pt([x - 3 * s, top + 6]) + 'L' + pt([x - 5 * s, y - 4]) + 'M' + pt([x + 3 * s, top + 10]) + 'L' + pt([x + 6 * s, y - 8]), FOAM, 1, 0.8);
    // shrine: a serpent maw for a door
    o += stoneFace(c, x - 28 * s, top, 56 * s, 24 * s, ST, 8 * s) + stepMerlons(c, x - 28 * s, x + 28 * s, top - 24 * s, STL, 8 * s);
    o += C(x, top - 8 * s, 18 * s, glow(c, TEAL, 0.55)) + P(pd([[x - 8 * s, top], [x - 8 * s, top - 12 * s], [x, top - 17 * s], [x + 8 * s, top - 12 * s], [x + 8 * s, top]], true), '#0a2a2c', 1.3 * s);
    o += serpentMaw(c, x, top - 30 * s, 0.2 * s, TEAL, true);
    return o;
  }
  // front-facing carved sea-serpent head, x = centre, y = top of the skull; the lower jaw is drawn apart (jaw())
  function serpentMaw(c, x, y, s, eye, small) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '', sw = Math.max(0.8, 2 * s);
    [-1, 1].forEach(function (k) {
      var fin = [q(k * 56, 10), q(k * 108, -6), q(k * 96, 12), q(k * 116, 22), q(k * 98, 32), q(k * 108, 50), q(k * 84, 48), q(k * 60, 58)];
      o += P(pd(fin, true), c.cel(k < 0 ? dk(ST, 0.08) : dk(ST, 0.2)), sw);
      o += L('M' + pt(q(k * 58, 20)) + 'L' + pt(q(k * 108, -6)) + 'M' + pt(q(k * 60, 30)) + 'L' + pt(q(k * 116, 22)) + 'M' + pt(q(k * 60, 42)) + 'L' + pt(q(k * 108, 50)), dk(ST, 0.45), sw * 0.8);
    });
    var d = 'M' + pt(q(-64, -40)) + 'L' + pt(q(64, -40)) + 'L' + pt(q(62, 0)) + 'C' + pt(q(70, 30)) + ' ' + pt(q(56, 50)) + ' ' + pt(q(36, 70)) + 'L' + pt(q(-36, 70)) + 'C' + pt(q(-56, 50)) + ' ' + pt(q(-70, 30)) + ' ' + pt(q(-62, 0)) + 'Z';
    var sc = '';
    if (!small) for (var r0 = 0; r0 < 4; r0++) for (var i = -3; i <= 3; i++) { var cx = i * 16 + (r0 % 2 ? 8 : 0), cy = -30 + r0 * 11; if (Math.abs(cx) < 58 - r0 * 2) sc += 'M' + pt(q(cx - 8, cy)) + 'Q' + pt(q(cx, cy + 8)) + ' ' + pt(q(cx + 8, cy)); }
    o += body(c, d, ST, F(pd([q(14, -44), q(74, -44), q(74, 74), q(20, 74)], true), dk(ST, 0.25), 0.7) + (sc ? L(sc, dk(ST, 0.35), 1.2) : '') + L('M' + pt(q(0, -40)) + 'L' + pt(q(0, 46)), dk(ST, 0.3), sw), sw * 1.1);
    [-1, 1].forEach(function (k) {
      o += P(pd([q(k * 58, 22), q(k * 18, 28), q(k * 22, 36), q(k * 54, 34)], true), c.cel(lt(ST, 0.1)), sw * 0.8);
      o += P(pd([q(k * 48, 38), q(k * 28, 40), q(k * 34, 48), q(k * 46, 46)], true), '#0a0e10', sw * 0.6) + gEye(c, q(k * 38, 43)[0], q(k * 38, 43)[1], 3.4 * s, eye || VIO);
      o += E(q(k * 12, 60)[0], q(k * 12, 60)[1], 4 * s, 2.6 * s, '#0a0e10');
      o += P(pd([q(k * 34, 68), q(k * 26, 68), q(k * 27, 100), q(k * 31, 102)], true), c.cel(BONE), sw * 0.7);
      for (var t = 0; t < 2; t++) o += P(pd([q(k * (8 + t * 9), 69), q(k * (15 + t * 9), 69), q(k * (11.5 + t * 9), 80)], true), c.cel(BONE), sw * 0.5);
    });
    return o + barns(Math.round(x + y), x - 40 * s, y - 20 * s, small ? 0 : 6, 30 * s, 16 * s, 2.4 * s) + barns(Math.round(x * 3 + y), x + 36 * s, y + 8 * s, small ? 0 : 5, 24 * s, 16 * s, 2.2 * s);
  }
  // stone sea-serpent idol rearing on a plinth; faces dir (1 = right)
  function serpentIdol(c, x, y, s, dir, eye) {
    var q = function (u, v) { return [x + dir * u * s, y + v * s]; }, o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.3);
    o += stoneFace(c, x - 20 * s, y, 40 * s, 14 * s, dk(ST, 0.06), 7 * s) + waveFrieze(c, x - 20 * s, x + 20 * s, y - 14 * s, 4 * s, STL);
    var T = taper([q(-10, -16), q(-14, -40), q(4, -58), q(-2, -84), q(8, -100)], 16 * s, 11 * s, 5);
    var fin = [], k;
    for (k = 3; k < T.s.length - 2; k += 2) { var a = T.b[k], b2 = T.s[k]; fin.push([a[0] + (a[0] - b2[0]) * 0.9, a[1] + (a[1] - b2[1]) * 0.9 - 2 * s]); fin.push(T.b[k + 1]); }
    o += P(pd([T.b[3]].concat(fin), true), c.cel(dk(ST, 0.15)), 1.3 * s);
    o += body(c, T.d, STL, L(bands(T, 2), dk(STL, 0.35), 1 * s) + L(along(T, 0.2), lt(STL, 0.2), 1.6 * s, 0.7), 1.6 * s);
    var hd = pd([q(0, -106), q(14, -108), q(30, -102), q(34, -97), q(18, -96), q(32, -92), q(28, -88), q(12, -88), q(2, -92)], true);
    o += body(c, hd, STL, F(pd([q(-4, -96), q(34, -96), q(34, -84), q(-4, -84)], true), dk(STL, 0.2), 0.6), 1.5 * s);
    o += gEye(c, q(12, -102)[0], q(12, -102)[1], 1.8 * s, eye || TEAL) + P(pd([q(4, -106), q(-6, -118), q(8, -110)], true), c.cel(ST), 1.1 * s) + P(pd([q(22, -95), q(24, -91), q(26, -95)], true), c.cel(BONE), 0.8 * s);
    o += barns(Math.round(x * 5), q(-6, -30)[0], q(-6, -30)[1], 5, 12 * s, 14 * s, 1.6 * s) + kelp(c, q(4, -60)[0], q(4, -60)[1], 22 * s, false, 3.4 * s, Math.round(x));
    return o;
  }
  // offerings: open clams with pearls, a conch, a fish skeleton, coral
  function clamPearl(c, x, y, s) { return scallop(c, x, y, 6 * s, -PI / 2 - 0.3, '#b8c8c0') + scallop(c, x, y, 6 * s, -PI / 2 + 0.25, '#d0dcd4') + C(x, y - 2.4 * s, 2.4 * s, c.rg([[0, '#ffffff'], [1, PEARL]]), 0.8 * s) + C(x, y - 3 * s, 8 * s, glow(c, '#fff8e0', 0.4)); }
  function conch(c, x, y, s, dir) {
    var q = function (u, v) { return [x + dir * u * s, y + v * s]; };
    return P(pd([q(-10, 0), q(-4, -6), q(6, -7), q(12, -3), q(8, 1), q(-2, 2)], true), c.cel(SHELL), 1 * s) + P(pd([q(-10, 0), q(-16, -3), q(-14, -6), q(-6, -5)], true), c.cel(lt(SHELL, 0.1)), 0.9 * s) +
      L('M' + pt(q(-4, -6)) + 'L' + pt(q(-2, 1)) + 'M' + pt(q(2, -7)) + 'L' + pt(q(3, 1)), dk(SHELL, 0.3), 0.7 * s) + E(q(7, -3)[0], q(7, -3)[1], 3 * s, 2 * s, '#f0a0a0', 0.6 * s);
  }
  function fishBones(x, y, s) {
    var d = 'M' + pt([x - 9 * s, y]) + 'L' + pt([x + 8 * s, y]), r = '';
    for (var i = -6; i <= 5; i += 3) r += 'M' + pt([x + i * s, y - 3 * s]) + 'L' + pt([x + (i + 1) * s, y]) + 'L' + pt([x + i * s, y + 3 * s]);
    return L(d + r, OL, 2.6 * s) + L(d + r, BONE, 1.2 * s) + P(pd([[x - 9 * s, y], [x - 14 * s, y - 3 * s], [x - 14 * s, y + 3 * s]], true), BONE, 0.8 * s) + P(pd([[x + 8 * s, y - 3 * s], [x + 13 * s, y], [x + 8 * s, y + 3 * s]], true), BONE, 0.8 * s);
  }
  // great shell-mosaic disc on a wall: rings of shell chips around a nautilus
  function mosaic(c, cx, cy, r) {
    var o = C(cx, cy, r * 1.4, glow(c, TEAL, 0.3)) + C(cx, cy, r + 5, c.cel(STL), 2) + C(cx, cy, r, c.rg([[0, '#1a5a64'], [1, '#0c2a30']]), 1.6);
    var cols = [NACRE, SHELL, '#9ad8d0', PEARL];
    [[0.82, 16, 0.2], [0.58, 11, 0.16]].forEach(function (rg, ri) {
      for (var i = 0; i < rg[1]; i++) { var a = i / rg[1] * PI * 2 + ri * 0.2; o += scallop(c, cx + Math.cos(a) * r * (rg[0] - 0.14), cy + Math.sin(a) * r * (rg[0] - 0.14), r * rg[2], a, cols[(i + ri) % 4]); }
    });
    return o + nautilus(c, cx, cy, r * 0.3, -1) + ring(cx, cy, r * 0.94, r * 0.94, PEARL, 1.2);
  }
  function stormSky(c) {
    var o = sky(c, '#142430', '#2e5862', '#86b2aa') + C(304, 34, 80, glow(c, '#e8fff6', 0.4)), r = rng(3101);
    for (var i = 0; i < 10; i++) { var x = r() * 420 - 10, y = 6 + r() * 40, w = 36 + r() * 46, h = 8 + r() * 6; o += E(x, y, w, h, i % 2 ? '#1e3038' : '#2a444c', 0, 0.9) + E(x - w * 0.1, y - h * 0.4, w * 0.7, h * 0.4, '#5a8488', 0, 0.35); }
    return o;
  }
  // stone platform lip with teeth: the carved lower jaw that holds the altar
  function lowerJaw(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    var d = 'M' + pt(q(-92, 0)) + 'L' + pt(q(92, 0)) + 'C' + pt(q(100, -14)) + ' ' + pt(q(102, -30)) + ' ' + pt(q(96, -40)) + 'C' + pt(q(88, -26)) + ' ' + pt(q(80, -14)) + ' ' + pt(q(62, -12)) + 'L' + pt(q(-62, -12)) + 'C' + pt(q(-80, -14)) + ' ' + pt(q(-88, -26)) + ' ' + pt(q(-96, -40)) + 'C' + pt(q(-102, -30)) + ' ' + pt(q(-100, -14)) + ' ' + pt(q(-92, 0)) + 'Z';
    o += body(c, d, ST, F(pd([q(20, -44), q(104, -44), q(104, 2), q(26, 2)], true), dk(ST, 0.25), 0.7) + L('M' + pt(q(-90, -6)) + 'L' + pt(q(90, -6)), dk(ST, 0.35), 1), 1.8);
    [[-80, -17, 16], [-58, -12, 10], [-40, -12, 8], [40, -12, 8], [58, -12, 10], [80, -17, 16]].forEach(function (t) { var k = t[0] < 0 ? 1 : -1; o += P(pd([q(t[0] - 4, t[1] + 1), q(t[0] + 4, t[1] + 1), q(t[0] + k * 1.5, t[1] - t[2])], true), c.cel(BONE), 1.3); });
    return o;
  }
  function altar(c, x, y) {
    var o = stoneFace(c, x - 50, y, 100, 8, ST, 8) + stoneFace(c, x - 40, y - 8, 80, 10, lt(ST, 0.05), 10);
    o += P(pd([[x - 34, y - 18], [x + 34, y - 18], [x + 30, y - 26], [x - 30, y - 26]], true), c.cel(STL), 1.8);
    o += F('M' + pt([x - 16, y - 18]) + 'C' + pt([x - 14, y - 12]) + ' ' + pt([x - 10, y - 12]) + ' ' + pt([x - 10, y - 18]) + 'Z M' + pt([x + 6, y - 18]) + 'C' + pt([x + 8, y - 8]) + ' ' + pt([x + 12, y - 10]) + ' ' + pt([x + 12, y - 18]) + 'Z', '#3a1a40', 0.9);
    o += waveFrieze(c, x - 40, x + 40, y - 16, 5, STL);
    o += C(x, y - 34, 26, glow(c, VIO, 0.55)) + scallop(c, x, y - 26, 12, -PI / 2, '#c8d0dc') + C(x, y - 32, 5, c.rg([[0, '#ffffff'], [0.5, VIOL], [1, VIO]]), 1.2);
    o += fishBones(x - 24, y - 28, 0.7) + clamPearl(c, x + 24, y - 27, 0.8);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    shalzua_pools: function (c) {
      var o = stormSky(c);
      // the grey sea behind the walls
      o += R(0, 66, 400, 58, c.lg([[0, '#3a6a70'], [1, '#1a3a44']])) + L('M0,70 L400,70', '#a8d8d0', 1, 0.6) + L('M20,78 q10,-3 20,0 M150,84 q12,-3 24,0 M250,76 q10,-3 20,0 M330,90 q12,-3 24,0', FOAM, 1, 0.5);
      o += ziggurat(c, 200, 122, 0.98);
      // courtyard walls with a wave frieze, merlons, a serpent relief and water spouts
      [[0, 1], [282, -1]].forEach(function (w, i) {
        var x0 = w[0], k = w[1];
        o += stoneFace(c, x0, 122, 118, 64, i ? dk(ST, 0.05) : ST, 9) + stepMerlons(c, x0 + 2, x0 + 118, 58, STL, 9) + R(x0, 56, 118, 5, c.cel(STL), 1.4);
        o += waveFrieze(c, x0, x0 + 118, 64, 7, STL) + waveFrieze(c, x0, x0 + 118, 108, 6, dk(STL, 0.06));
        o += caustics(3102 + i, x0, x0 + 118, 72, 106, TEAL, 0.16);
        o += barns(3104 + i, x0 + 30, 100, 8, 40, 10, 2) + barns(3106 + i, x0 + 90, 80, 6, 20, 16, 2);
        for (var j = 0; j < 4; j++) o += kelp(c, x0 + 12 + j * 30 + (i ? 6 : 0), 60, 14 + (j % 2) * 12, false, 4, 3110 + j + i * 7, j % 2 ? KELPL : KELP);
        o += spout(c, k > 0 ? 114 : 286, 86, -k, 138);
      });
      o += flagFloor(c, 122, 200, '#36423e', 3120) + R(0, 120, 400, 6, c.lg([[0, '#000', 0.35], [1, '#000', 0]])) + L('M-2,122 L402,122', OL, 1.4);
      o += shallows(c, 124, 3121);
      o += tidePool(c, 100, 140, 30, 5.5, 3130) + tidePool(c, 300, 140, 30, 5.5, 3131) + tidePool(c, 200, 176, 64, 10, 3132);
      o += coral(c, 36, 150, 0.9, CORAL, 3140) + coral(c, 44, 152, 0.7, '#e8709a', 3141) + anemone(c, 360, 158, 1) + starfish(c, 250, 212, 1, '#e8783a', 0.4) + starfish(c, 118, 226, 0.9, '#d85a8a', 1.1);
      o += clamLamp(c, 24, 186, 1.15, 20) + clamLamp(c, 380, 192, 1.15, 20);
      o += barns(3150, 160, 226, 6, 60, 8, 2.2) + pebbles(3151, 150, 236, '#243432', 14, 10, 390) + kelp(c, 330, 236, 26, true, 5, 3152) + kelp(c, 342, 238, 20, true, 4, 3153, KELPL);
      return o + motes(3160, 20, 0, 400, 20, 200, '#bffff0') + R(0, 0, 400, 240, c.rg([[0, '#60ffe0', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    },
    shalzua_shrine: function (c) {
      var o = R(0, 0, 400, 240, '#0e1a1c');
      o += brickWall(c, 0, 0, 400, 124, dk(ST, 0.08), 3301, 14);
      o += R(0, 0, 400, 124, c.lg([[0, '#040a0c', 0.85], [0.5, '#040a0c', 0.35], [1, TEAL, 0.06]]));
      o += caustics(3302, 0, 400, 20, 118, TEAL, 0.12);
      o += lightShaft(c, 178, 222, 0, 130, 270, 150, '#bffff0', 0.2);
      o += waveFrieze(c, 0, 400, 12, 8, STL) + waveFrieze(c, 0, 400, 100, 7, STL);
      o += mosaic(c, 200, 56, 36);
      o += serpentIdol(c, 118, 124, 0.9, 1) + serpentIdol(c, 282, 124, 0.9, -1);
      [[0, 26], [374, 26]].forEach(function (p, i) { o += stoneFace(c, p[0], 124, p[1], 124, dk(ST, 0.02 + i * 0.04), 12) + waveFrieze(c, p[0], p[0] + p[1], 58, 6, STL) + barns(3310 + i, p[0] + 13, 90, 7, 18, 30, 1.8); });
      for (var j = 0; j < 6; j++) o += kelp(c, 30 + j * 68 + (j % 2) * 10, 0, 16 + (j % 3) * 10, false, 4, 3320 + j, j % 2 ? KELPL : KELP);
      // offering step under the mosaic
      o += stoneFace(c, 164, 124, 72, 10, STL, 10) + clamPearl(c, 180, 113, 1) + conch(c, 218, 113, 1, -1) + fishBones(200, 111, 0.8) + coral(c, 168, 114, 0.5, CORAL, 3330) + coral(c, 232, 114, 0.5, '#e8709a', 3331);
      o += flagFloor(c, 122, 200, '#303a38', 3340) + R(0, 120, 400, 6, c.lg([[0, '#000', 0.4], [1, '#000', 0]])) + L('M-2,122 L402,122', OL, 1.4);
      o += shallows(c, 124, 3341, '#3ab8b8');
      o += tidePool(c, 74, 148, 30, 5.5, 3350) + tidePool(c, 326, 150, 28, 5, 3351);
      o += clamLamp(c, 150, 136, 0.8, 14) + clamLamp(c, 250, 136, 0.8, 14);
      o += clamLamp(c, 24, 180, 1.15, 22) + clamLamp(c, 378, 188, 1.15, 22);
      o += conch(c, 120, 214, 1.2, 1) + clamPearl(c, 290, 226, 1.1) + starfish(c, 70, 222, 1, '#e8783a', 0.3) + coral(c, 356, 228, 0.9, CORAL, 3360) + barns(3361, 200, 220, 6, 70, 10, 2) + pebbles(3362, 150, 236, '#1e2c2a', 14, 10, 390);
      return o + motes(3370, 22, 0, 400, 10, 200, '#bffff0') + R(0, 0, 400, 240, c.rg([[0, '#60ffe0', 0], [0.7, '#000', 0.15], [1, '#000', 0.55]]));
    },
    shalzua_sanctum: function (c) {
      var o = R(0, 0, 400, 240, '#060a10');
      // the cave vault and the dark water beyond the altar
      o += R(0, 0, 400, 70, c.lg([[0, '#04060a'], [1, '#16222a']])) + caustics(3401, 0, 400, 6, 60, VIOL, 0.08);
      o += R(0, 64, 400, 60, c.lg([[0, '#0c1c2a'], [0.4, '#081424'], [1, ABYSS]]));
      o += L('M0,66 L400,66', '#5a6a9a', 1.2, 0.6) + L('M20,76 q12,-2 24,0 M90,90 q14,-2 28,0 M300,82 q12,-2 24,0 M340,100 q14,-2 28,0 M60,108 q12,-2 24,0', VIOL, 1, 0.35);
      o += P('M30,66 L38,40 L50,34 L60,48 L66,66 Z', '#0c1418', 1.2) + P('M334,66 L342,30 L354,24 L364,44 L372,66 Z', '#0c1418', 1.2);
      o += C(200, 96, 84, glow(c, VIO, 0.42));
      // stepped side walls
      [[0, 1], [336, -1]].forEach(function (w, i) {
        var x0 = w[0];
        o += stoneFace(c, x0, 124, 64, 124, i ? dk(ST, 0.12) : dk(ST, 0.06), 11) + waveFrieze(c, x0, x0 + 64, 40, 7, STL) + waveFrieze(c, x0, x0 + 64, 90, 6, STL);
        o += barns(3410 + i, x0 + 32, 70, 8, 44, 30, 2) + kelp(c, x0 + 14, 0, 30, false, 4.4, 3412 + i) + kelp(c, x0 + 44, 0, 20, false, 4, 3414 + i, KELPL);
      });
      // the lower jaw is the altar's dais; the great carved head looms over it
      o += R(110, 64, 180, 60, c.lg([[0, '#1a0c2a', 0.2], [1, '#2a1040', 0.6]]));
      o += serpentMaw(c, 200, -2, 0.92, VIO);
      o += flagFloor(c, 122, 200, '#343e3e', 3420) + R(0, 120, 400, 6, c.lg([[0, '#000', 0.45], [1, '#000', 0]])) + L('M-2,122 L402,122', OL, 1.4);
      o += lowerJaw(c, 200, 126, 1) + altar(c, 200, 124);
      o += shallows(c, 126, 3421, '#6a58c8');
      o += E(88, 176, 50, 8, c.lg([[0, '#0a0a1a'], [1, '#2a1a4a']]), 1.4) + L('M58,176 q10,-2 20,0 M96,179 q10,-2 20,0', VIOL, 1, 0.6);
      o += clamLamp(c, 24, 182, 1.15, 22) + clamLamp(c, 378, 190, 1.15, 22);
      o += fishBones(300, 214, 1.2) + conch(c, 142, 222, 1.1, -1) + coral(c, 340, 230, 0.8, CORALD, 3430) + barns(3431, 220, 222, 6, 80, 10, 2) + pebbles(3432, 150, 236, '#1a2222', 14, 10, 390);
      return o + motes(3440, 18, 0, 400, 20, 200, VIOL) + motes(3441, 12, 0, 400, 60, 220, '#bffff0') + R(0, 0, 400, 240, c.rg([[0, VIO, 0], [0.7, '#000', 0.2], [1, '#000', 0.6]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- copies of art_skullreef.js (the Wavebreaker mark and the drips, so both packs match) ----
  function drop(x, y, s) { s = s || 1; return P('M' + pt([x, y - 3 * s]) + 'C' + pt([x + 2 * s, y]) + ' ' + pt([x + 1.6 * s, y + 2 * s]) + ' ' + pt([x, y + 2 * s]) + 'C' + pt([x - 1.6 * s, y + 2 * s]) + ' ' + pt([x - 2 * s, y]) + ' ' + pt([x, y - 3 * s]) + 'Z', DRIP, 0.6 * s); }
  function drops(list) { return list.map(function (p) { return drop(p[0], p[1], p[2] || 1); }).join(''); }
  function coralSprig(c, x, y, k, col) {
    col = col || CORAL; k = k || 1;
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 3 * k, y - 9 * k]) + 'L' + pt([x - 7 * k, y - 13 * k]) + 'M' + pt([x - 3 * k, y - 9 * k]) + 'L' + pt([x + 1 * k, y - 15 * k]) + 'M' + pt([x + 2 * k, y - 1 * k]) + 'L' + pt([x + 7 * k, y - 10 * k]) + 'L' + pt([x + 6 * k, y - 15 * k]) + 'M' + pt([x + 7 * k, y - 10 * k]) + 'L' + pt([x + 11 * k, y - 12 * k]);
    return L(d, OL, 5 * k) + L(d, col, 2.6 * k) + [[-7, -13], [1, -15], [6, -15], [11, -12]].map(function (t) { return C(x + t[0] * k, y + t[1] * k, 1.5 * k, lt(col, 0.3)); }).join('');
  }
  // ---- Wavebreaker troll head (facing left): the troll profile, drowned: pale teal skin, mottles, barnacles, seaweed dreads, teal glowing eyes ----
  function wtHead(c, x, y, o) {
    var sk = o.skin || WSKIN, s = '', hc = o.hair || WHAIR, hat = o.hat;
    if (hat === 'shell') s += shellCrown(c, x, y);
    var dd = o.dreads == null ? 4 : o.dreads, dl = o.dreadLen || 30;
    for (var i = 0; i < dd; i++) {
      var l = dl + (i % 2) * 7 - i, bx = x + 1 + 3 * i, by = y - 13 + 2.2 * i;
      var T = taper([[bx, by], [bx + 12, by + 1], [bx + 19 + i, by + l * 0.42], [bx + 15 + 3 * i, by + l * 0.72], [bx + 19 + 2 * i, by + l]], 6.4, 2.4, 4);
      s += P(T.d, c.cel(i % 2 ? (o.hair ? dk(hc, 0.14) : WHAIRD) : hc), 1.5) + L(along(T, 0.5), lt(hc, 0.3), 0.8, 0.7);
      if (i % 2 === 0 && !o.noBulb) { var e = T.s[T.s.length - 1]; s += E(e[0], e[1] + 1.4, 2.2, 3, c.cel(BULB), 1); }
    }
    // ear: long, drooping back, torn, crusted with barnacles
    s += P('M' + pt([x + 6, y - 3]) + 'L' + pt([x + 31, y - 9]) + 'L' + pt([x + 27, y - 4]) + 'L' + pt([x + 24, y - 5]) + 'L' + pt([x + 25, y - 1]) + 'L' + pt([x + 10, y + 7]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 11, y]) + 'L' + pt([x + 26, y - 6]) + 'L' + pt([x + 12, y + 4]) + 'Z', dk(sk, 0.3), 0.8);
    s += barn(x + 18, y - 3, 1.6) + barn(x + 14, y + 1, 1.3);
    if (o.earShell) s += L('M' + pt([x + 20, y - 1]) + 'L' + pt([x + 20, y + 5]), OL, 1) + scallop(c, x + 20, y + 5, 4.4, PI / 2, o.earShell);
    var d = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 17]) + ' ' + pt([x + 11, y - 14]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 11, y + 9]) + 'C' + pt([x + 8, y + 15]) + ' ' + pt([x, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'L' + pt([x - 12, y + 11]) + 'C' + pt([x - 14, y + 8]) + ' ' + pt([x - 13, y + 6]) + ' ' + pt([x - 11, y + 5]) +
      'L' + pt([x - 22, y + 6]) + 'C' + pt([x - 27, y + 6]) + ' ' + pt([x - 26, y + 1]) + ' ' + pt([x - 21, y - 1]) + 'L' + pt([x - 9, y - 5]) + 'Z';
    var mot = E(x + 3, y - 8, 4, 3, WSKD, 0, 0.7) + E(x - 16, y + 2, 3, 1.8, WSKD, 0, 0.6) + E(x + 6, y + 8, 3, 4, WSKD, 0, 0.6);
    if (o.paint) mot += F(pd([[x - 10, y - 9], [x + 6, y - 11], [x + 7, y - 8], [x - 9, y - 6]], true), o.paint, 0.9) + F(pd([[x - 1, y + 2], [x + 8, y + 1], [x + 8, y + 3.4], [x - 1, y + 4.4]], true), o.paint, 0.9);
    if (o.wrinkle) mot += L('M' + pt([x - 2, y + 4]) + 'q3,2 6,0 M' + pt([x - 4, y + 8]) + 'q3,2 6,0 M' + pt([x - 9, y - 8]) + 'q4,-1.6 8,0', dk(sk, 0.4), 0.9);
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8) + mot, 2.2);
    s += P('M' + pt([x - 22, y + 5]) + 'C' + pt([x - 23, y + 10]) + ' ' + pt([x - 19, y + 11]) + ' ' + pt([x - 17, y + 6]) + 'Z', c.cel(dk(sk, 0.1)), 1.3);
    s += barn(x + 6, y + 4, 1.7) + barn(x + 3, y + 7.4, 1.2);
    s += L('M' + pt([x - 13, y - 8]) + 'L' + pt([x - 1, y - 5]), OL, 2.6) + E(x - 6, y - 3, 3.2, 2.6, '#0c1414') + glowEye(c, x - 6, y - 3, 1.9, o.eye || WEYE);
    if (o.jaw) s += P('M' + pt([x - 12, y + 10]) + 'L' + pt([x - 2, y + 11]) + 'L' + pt([x - 4, y + 19]) + 'L' + pt([x - 11, y + 17]) + 'Z', '#12242a', 1.3) + L('M' + pt([x - 11, y + 12]) + 'l1.4,2 M' + pt([x - 8, y + 12]) + 'l1,2 M' + pt([x - 5, y + 12]) + 'l1,2', BONE, 1.1);
    else s += L('M' + pt([x - 12, y + 11]) + 'L' + pt([x - 2, y + 11]), OL, 1.4);
    var tk = o.tusk || 1;
    s += P('M' + pt([x - 7, y + 12.5]) + 'C' + pt([x - 7 - 7 * tk, y + 13]) + ' ' + pt([x - 7 - 12 * tk, y + 12.5 - 6 * tk]) + ' ' + pt([x - 7 - 11 * tk, y + 12.5 - 13 * tk]) + 'C' + pt([x - 7 - 8 * tk, y + 12.5 - 7 * tk]) + ' ' + pt([x - 7 - 4 * tk, y + 12.5 - 5 * tk]) + ' ' + pt([x - 3, y + 9.5]) + 'Z', c.cel(o.tuskCol || '#e0dcc0'), 1.6) + barn(x - 10 - 4 * tk, y + 12 - 2 * tk, 1.2);
    if (o.coral !== false && hat !== 'shell' && hat !== 'nautilus') s += coralSprig(c, x + 1, y - 13, o.coralK || 1);
    if (hat === 'band') {
      var bd = 'M' + pt([x - 7, y - 12]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]);
      s += L(bd, OL, 4.4) + L(bd, ROPE, 2.6) + scallop(c, x + 7, y - 12, 4, -PI / 2 + 0.4, SHELL);
    } else if (hat === 'nautilus') {
      var bd2 = 'M' + pt([x - 8, y - 11]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]);
      s += nautilus(c, x + 3, y - 22, 11, -1) + L(bd2, OL, 4.4) + L(bd2, PEARL, 2.4) + C(x - 6, y - 12.2, 1.4, PEARL, 0.7) + C(x, y - 13.6, 1.4, PEARL, 0.7);
    } else if (hat === 'shell') {
      var bd3 = 'M' + pt([x - 8, y - 11]) + 'Q' + pt([x + 3, y - 16]) + ' ' + pt([x + 12, y - 8]);
      s += L(bd3, OL, 4.8) + L(bd3, NACRE, 3) + C(x - 4, y - 12.6, 2.2, c.rg([[0, '#ffffff'], [1, '#9ad8d0']]), 1) + L('M' + pt([x - 9, y - 9]) + 'Q' + pt([x - 12, y - 2]) + ' ' + pt([x - 8, y + 2]), PEARL, 1.2, 0.9);
    }
    return s + drops([[x - 9, y + 21, 0.9], [x - 20, y + 12, 0.7]]);
  }
  // tall scallop-fan headdress with pearl tips and an inner teal fan (behind the head)
  function shellCrown(c, x, y) {
    var cx = x + 5, cy = y - 9, o = '', a = [], rb = '', R0 = 29;
    for (var i = 0; i <= 12; i++) { var t = -PI / 2 - 1 + i * 2 / 12, rr = R0 * (i % 2 ? 0.9 : 1); a.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]); }
    for (var j = 0; j <= 12; j += 2) rb += 'M' + pt([cx, cy - 3]) + 'L' + pt(a[j]);
    o += P('M' + pt([cx, cy]) + a.map(function (p) { return 'L' + pt(p); }).join('') + 'Z', c.lg([[0, '#fff0f0'], [0.5, '#f0b8b0'], [1, '#c87a7a']]), 2) + L(rb, '#a86060', 1.1);
    for (var k = 0; k <= 12; k += 2) o += C(a[k][0], a[k][1], 2.3, c.rg([[0, '#ffffff'], [1, PEARL]]), 1);
    return o + scallop(c, cx, cy - 1, 16, -PI / 2, '#8ad8d0');
  }
  // kelp skirt on a cord, with shells
  function kelpSkirt(c, col, len, shells) {
    col = col || KELP; len = len || 24; var o = '';
    [[51, 0.85, -2], [57, 1, 1.4], [63, 0.92, -1.2], [69, 1.05, 2], [75, 0.8, 0]].forEach(function (k, i) {
      var l = len * k[1], T = taper([[k[0], 84], [k[0] + k[2], 84 + l * 0.5], [k[0] - k[2] * 0.6, 84 + l]], 7.4, 2.6, 4);
      o += P(T.d, c.cel(i % 2 ? dk(col, 0.14) : col), 1.4) + L(along(T, 0.5), lt(col, 0.3), 0.7, 0.6);
    });
    o += L('M49,86 L79,86', OL, 4.6) + L('M49,86 L79,86', ROPE, 2.8);
    if (shells !== false) [54, 64, 74].forEach(function (x, i) { o += scallop(c, x, 86, 3.6, PI / 2, i % 2 ? SHELL : NACRE); });
    return o;
  }
  // long robe skirt with troll toes peeking out
  function robe(c, col, trim) {
    var d = 'M48,84 L80,84 C84,98 90,110 94,118 L32,118 C38,108 44,98 48,84 Z';
    var o = toes2(46, 121, dk(WSKIN, 0.25)) + toes2(70, 121, dk(WSKIN, 0.3));
    o += body(c, d, col, F('M66,82 L98,82 L98,122 L70,122 C72,106 70,94 66,82 Z', dk(col, 0.3), 0.8) + L('M58,88 L48,116 M70,88 L78,116', dk(col, 0.35), 1.1) + L('M33,115 L93,115', trim || NACRE, 2.2), 2.2);
    for (var x = 38; x < 92; x += 9) o += C(x, 118.4, 1.6, PEARL, 0.7);
    return o + L('M49,86 L79,86', OL, 4.6) + L('M49,86 L79,86', trim || NACRE, 2.8);
  }
  // ---- Wavebreaker troll (facing left): the troll rig of art_zulfarrak.js, drowned ----
  function wTroll(c, o) {
    var sk = o.skin || WSKIN;
    return biped(c, {
      skin: sk, shirt: o.shirt || sk, pants: sk, sleeve: o.sleeve || sk, forearm: o.forearm || sk, glove: o.glove, feet: toes2, boots: dk(sk, 0.25), digi: true, legW: o.legW || 9.5, armW: o.armW || 8.5,
      hx: o.hx || 44, hy: o.hy || 38, hipY: 86, neckCol: sk, shadowR: o.shadowR || 34, noLegs: o.noLegs,
      torsoD: o.torsoD || 'M42,56 C44,44 70,40 82,48 L82,68 L76,88 L52,88 L46,72 Z',
      head: function (c, x, y) { return wtHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); },
      back: o.back, chest: function (c) { return L('M58,66 Q64,70 70,66', dk(o.shirt || sk, 0.3), 1.4) + E(72, 60, 3, 2, dk(sk, 0.2), 0, 0.8) + E(56, 76, 2.6, 1.8, dk(sk, 0.2), 0, 0.8) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return (o.skirt ? o.skirt(c) : kelpSkirt(c, o.kelp)) + (o.front ? o.front(c) : ''); },
      pads: o.pads, top: o.top, shins: o.shins || function (c) { return barn(58, 104, 1.6) + barn(76, 100, 1.4); },
      near: o.near || [[46, 58], [36, 76], [30, 92]], far: o.far || [[80, 54], [90, 72], [92, 90]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand || function (c, p) { return clawHand(p, sk, 0.9, '#d8e8e0'); }, tf: o.tf || at(0.98, 64, 122)
    });
  }
  // coral-bladed glaive: driftwood haft, branching coral head
  function coralGlaive(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, DRIFT, 3.4, 14);
    var T = taper([q(len - 4, 0), q(len + 6, -1.5), q(len + 18, 0)], 8, 1.4, 4), br = '';
    [[len + 4, 1, 9, -0.9], [len + 9, -1, 8, 0.8], [len + 1, -1, 6, 1.1]].forEach(function (b) { var a0 = q(b[0], 0), dd = dirQ(a0, ang + b[3]); br += 'M' + pt(a0) + 'L' + pt(dd(b[2], 0)); });
    o += L(br, OL, 5) + L(br, CORAL, 2.8) + P(T.d, c.cel(CORAL), 1.6) + L(along(T, 0.3), CORALL, 1, 0.8);
    o += L('M' + pt(q(len - 7, -3)) + 'L' + pt(q(len - 3, 3)) + 'M' + pt(q(len - 4, -3)) + 'L' + pt(q(len, 3)), ROPE, 1.6) + barn(q(len * 0.55, 1.5)[0], q(len * 0.55, 1.5)[1], 1.5);
    return o;
  }
  function spiritOrb(c, x, y, r) {
    var fish = 'M' + pt([x - r * 0.5, y]) + 'Q' + pt([x, y - r * 0.45]) + ' ' + pt([x + r * 0.4, y]) + 'L' + pt([x + r * 0.62, y - r * 0.22]) + 'L' + pt([x + r * 0.62, y + r * 0.22]) + 'L' + pt([x + r * 0.4, y]) + 'Q' + pt([x, y + r * 0.45]) + ' ' + pt([x - r * 0.5, y]) + 'Z';
    return C(x, y, r * 3, glow(c, TEAL, 0.8)) + C(x, y, r, c.rg([[0, '#ffffff'], [0.45, '#b8fff0'], [1, '#2ac8c0']]), 1.6) + F(fish, '#1a8a8a', 0.75) +
      L('M' + pt([x - r * 1.6, y + r * 0.6]) + 'Q' + pt([x - r * 1.2, y - r * 1.5]) + ' ' + pt([x + r * 0.3, y - r * 1.6]), '#c8fff4', 1.2, 0.8) + C(x + r * 1.5, y + r * 0.6, 1.2, '#dffff8') + C(x - r * 1.2, y - r * 1.3, 1, '#dffff8');
  }
  function conchStaff(c, bot, top) {
    var d = 'M' + pt(bot) + 'L' + pt(top), o = limb(d, DRIFT, 3.2) + L(d, lt(DRIFT, 0.3), 1, 0.55);
    o += conch(c, top[0] + 1, top[1] - 2, 1.1, -1) + kelp(c, top[0] + 3, top[1] + 2, 16, false, 3, 4401) + L('M' + pt([top[0] - 2, top[1] + 4]) + 'L' + pt([top[0] + 2, top[1] + 8]), ROPE, 1.8);
    return o + C(top[0] - 4, top[1] + 12, 1.8, PEARL, 0.8) + C(top[0] - 3, top[1] + 16, 1.6, PEARL, 0.8);
  }
  // hag's bone fetish: a long bone staff crowned with a fish skull, strings of shells and teeth, a little bone doll
  function boneFetish(c, bot, top) {
    var d = 'M' + pt(bot) + 'L' + pt(top), o = L(d, OL, 6.4) + L(d, BONE, 3.8) + L(d, '#fffaf0', 1, 0.6) + C(bot[0], bot[1], 2.6, c.cel(BONE), 1.2);
    var x = top[0], y = top[1];
    o += L('M' + pt([x - 2, y + 8]) + 'Q' + pt([x - 12, y + 16]) + ' ' + pt([x - 10, y + 30]) + 'M' + pt([x + 2, y + 8]) + 'Q' + pt([x + 10, y + 18]) + ' ' + pt([x + 8, y + 30]), OL, 1.6);
    [[-11.4, 14], [-12, 21], [-10.4, 28], [9.4, 16], [10, 23], [8.2, 29]].forEach(function (k, i) { o += i % 3 === 1 ? P(pd([[x + k[0] - 1.4, y + k[1]], [x + k[0], y + k[1] + 5], [x + k[0] + 1.4, y + k[1]]], true), c.cel(BONE), 0.8) : scallop(c, x + k[0], y + k[1], 3.2, PI / 2, i % 2 ? SHELL : NACRE); });
    // fish skull
    o += P(pd([[x + 8, y + 4], [x + 6, y - 6], [x - 2, y - 10], [x - 12, y - 6], [x - 16, y], [x - 8, y + 1], [x - 14, y + 5], [x - 4, y + 7]], true), c.cel(BONE), 1.5) + C(x - 1, y - 4, 3, '#1a1009') + C(x - 1, y - 4, 1.2, TEAL);
    o += L('M' + pt([x - 14, y + 1]) + 'l2,2 M' + pt([x - 11, y + 1]) + 'l1.6,2.2 M' + pt([x - 8, y + 1.4]) + 'l1.4,2', OL, 1) + L('M' + pt([x + 4, y - 8]) + 'L' + pt([x + 12, y - 16]) + 'M' + pt([x + 7, y - 5]) + 'L' + pt([x + 15, y - 10]) + 'M' + pt([x + 1, y - 9]) + 'L' + pt([x + 5, y - 18]), OL, 2.2) + L('M' + pt([x + 4, y - 8]) + 'L' + pt([x + 12, y - 16]) + 'M' + pt([x + 7, y - 5]) + 'L' + pt([x + 15, y - 10]) + 'M' + pt([x + 1, y - 9]) + 'L' + pt([x + 5, y - 18]), BONE, 1);
    // bone doll bound to the staff
    var dy = y + 22;
    o += L('M' + pt([x - 3, dy]) + 'L' + pt([x + 3, dy]) + 'M' + pt([x, dy - 2]) + 'L' + pt([x - 2, dy + 8]) + 'M' + pt([x, dy - 2]) + 'L' + pt([x + 2, dy + 8]), OL, 2.4) + L('M' + pt([x - 3, dy]) + 'L' + pt([x + 3, dy]) + 'M' + pt([x, dy - 2]) + 'L' + pt([x - 2, dy + 8]) + 'M' + pt([x, dy - 2]) + 'L' + pt([x + 2, dy + 8]), BONE, 1.1) + C(x, dy - 4, 2.4, c.cel(BONE), 1) + L('M' + pt([x - 3, dy + 3]) + 'L' + pt([x + 3, dy + 5]), ROPE, 1.6);
    return o;
  }
  function sacKnife(c, p, ang) {
    var q = dirQ(p, ang), o = '';
    o += L('M' + pt(q(-7, 0)) + 'L' + pt(q(4, 0)), OL, 5.2) + L('M' + pt(q(-7, 0)) + 'L' + pt(q(4, 0)), ROPE, 3) + nautilus(c, q(-8, 0)[0], q(-8, 0)[1], 3.2, 1);
    o += P(pd([q(3, -6), q(3, 5), q(10, 6), q(20, 4), q(28, -3), q(30, -9), q(20, -5), q(10, -6)], true), c.lg([[0, '#f4fbff'], [0.5, '#b8d4dc'], [1, '#6a8a9a']], 0, 0, 1, 1), 1.7);
    o += L('M' + pt(q(5, -2)) + 'L' + pt(q(24, -4)), '#ffffff', 1, 0.75) + F(pd([q(20, 4), q(28, -3), q(30, -9), q(24, -2)], true), '#5a1a4a', 0.9) + P(pd([q(1, -7), q(5, -7), q(5, 7), q(1, 7)], true), c.cel(CORAL), 1.2);
    return o + C(q(22, -3)[0], q(22, -3)[1], 15, glow(c, '#e8fff8', 0.35));
  }
  function shellNecklace(c, pts, cols) { var o = L(pd(pts), OL, 2) + L(pd(pts), ROPE, 1); pts.forEach(function (p, i) { if (i && i < pts.length - 1) o += scallop(c, p[0], p[1], 3.2, PI / 2, cols[i % cols.length]); }); return o; }
  function cowries(pts) { var o = L(pd(pts), OL, 1.6); pts.forEach(function (p) { o += E(p[0], p[1], 1.9, 1.4, PEARL, 0.7) + L('M' + pt([p[0] - 1, p[1]]) + 'L' + pt([p[0] + 1, p[1]]), '#8a7a60', 0.6); }); return o; }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    wavebreaker_zealot: function (c) {
      return wTroll(c, {
        hat: 'band', jaw: true, dreads: 4,
        back: function (c) { return ''; },
        chest: function (c) { return L('M48,52 Q62,62 80,50', OL, 3) + L('M48,52 Q62,62 80,50', ROPE, 1.6) + P(pd([[56, 56], [59, 63], [62, 56]], true), c.cel(BONE), 1) + P(pd([[66, 56], [69, 62], [72, 55]], true), c.cel(BONE), 1) + barns(4102, 70, 72, 4, 8, 6, 1.6) + L('M50,66 l8,6 M52,63 l8,6', dk(WSKIN, 0.4), 1); },
        pads: function (c) { return P('M34,58 C32,46 44,42 54,48 L50,60 C46,56 40,56 34,58 Z', c.cel('#6a8a84'), 1.8) + barns(4101, 43, 51, 6, 14, 6, 2.2) + barns(4103, 82, 50, 4, 8, 5, 1.8); },
        near: [[46, 58], [34, 70], [26, 62]], wNear: function (c, p) { return coralGlaive(c, [p[0] + 2, p[1] + 4], 36, -PI / 2 - 0.34); },
        far: [[80, 54], [92, 64], [98, 72]], wFar: function (c, p) { return nautilus(c, p[0] + 4, p[1] - 2, 14, 1, '#e8dcc4') + barns(4104, p[0] + 8, p[1] + 6, 3, 8, 6, 1.8); }
      });
    },
    wavebreaker_spiritcaller: function (c) {
      return wTroll(c, {
        hat: 'nautilus', dreads: 5, dreadLen: 34, earShell: NACRE,
        skirt: function (c) { return kelpSkirt(c, '#2e5a4a', 32); },
        chest: function (c) { return shellNecklace(c, [[48, 50], [54, 58], [62, 62], [70, 60], [78, 50]], [NACRE, SHELL, '#9ad8d0']) + L('M78,50 L54,86', OL, 5) + L('M78,50 L54,86', '#1e3e38', 3) + L('M78,50 L54,86', PEARL, 0.8, 0.8); },
        pads: function (c) { return barns(4201, 44, 52, 4, 10, 5, 1.8) + barns(4202, 82, 50, 3, 8, 5, 1.6); },
        near: [[46, 58], [34, 62], [26, 52]], wNearFront: function (c, p) { return spiritOrb(c, p[0] - 4, p[1] - 12, 7); },
        far: [[80, 54], [90, 70], [92, 86]], wFar: function (c, p) { return conchStaff(c, [p[0] + 3, 121], [p[0] - 2, 14]); }
      });
    },
    tide_serpent: function (c) {
      var o = shadow(c, 70, 36), bc = '#2a7aa0', belly = '#e6e0a8', fn = '#f09038';
      o += E(76, 118, 38, 6, c.lg([[0, '#6ae8e0'], [1, '#1a6a80']]), 1.4) + L('M44,118 q8,-2 16,0 M88,119 q8,-2 16,0', FOAM, 1.2, 0.8);
      // tail loop behind, dipping into the water
      var Tt = taper([[104, 118], [116, 104], [120, 92], [112, 86]], 12, 3, 4);
      o += P(Tt.d, c.cel(dk(bc, 0.15)), 1.8) + L(bands(Tt, 3), dk(bc, 0.45), 1);
      var T = taper([[88, 120], [98, 100], [84, 80], [64, 74], [58, 58], [66, 42], [60, 28], [48, 22]], 17, 10, 5);
      // back frill
      var fr = [], i;
      for (i = 2; i < T.s.length - 2; i += 2) { var a = T.a[i], b = T.s[i], k = 1 + (i % 4 ? 0.3 : 0.9); fr.push([a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k]); fr.push(T.a[Math.min(T.s.length - 1, i + 1)]); }
      o += P(pd([T.a[2]].concat(fr), true), c.cel(fn), 1.4);
      o += body(c, T.d, bc, P(ribbonBand(T, 0.62, 1), belly, 0) + L(bands(T, 3), dk(bc, 0.4), 1) + L(along(T, 0.25), lt(bc, 0.35), 1.6, 0.7), 2.2);
      o += L(along(T, 0.62), dk(belly, 0.35), 1, 0.9);
      // head: long sea-dragon snout, mouth open, ear fins, barbels
      o += P('M52,12 L64,2 L62,12 L72,8 L64,20 Z', c.cel(fn), 1.4) + L('M54,13 L63,4 M58,16 L70,9', dk(fn, 0.35), 0.9);
      o += P('M44,30 L16,33 L12,40 L18,42 L42,38 Z', '#3a0e18', 1.6) + L('M17,34 l2,3 M22,34 l2,3 M27,34 l1.6,3 M18,40 l2,-2.6 M24,39.4 l2,-2.6', '#f4ecd8', 1.2);
      o += body(c, 'M58,16 C50,10 34,12 20,18 L8,24 C5,27 7,31 12,31 L32,31 L44,31 C52,32 60,26 58,16 Z', bc, F('M40,8 L62,8 L62,34 L44,34 Z', dk(bc, 0.3), 0.6) + F('M10,27 L40,28 L40,31 L12,31 Z', belly, 0.9), 2);
      o += body(c, 'M42,36 L20,40 C14,41 13,45 18,46 L40,43 C46,42 48,37 42,36 Z', bc, F('M18,42 L40,40 L40,44 L18,46 Z', belly, 0.9), 1.6);
      o += L('M10,28 Q2,34 6,44 M13,30 Q8,38 12,48', OL, 2.2) + L('M10,28 Q2,34 6,44 M13,30 Q8,38 12,48', lt(bc, 0.4), 1);
      o += C(15, 23, 1.2, OL) + glowEye(c, 38, 19, 2.2, '#ffd040') + L('M32,16 L44,14', OL, 1.6);
      return o;
    },
    hexmother_oyala: function (c) {
      var sk = '#98b8ae';
      return wTroll(c, {
        skin: sk, hx: 38, hy: 46, dreads: 6, dreadLen: 46, hair: '#b4c4b4', noBulb: true, wrinkle: true, earShell: SHELL, tusk: 0.8, legW: 8, armW: 7,
        torsoD: 'M38,62 C38,48 62,44 80,52 L82,70 L76,88 L52,88 L44,76 Z', shadowR: 32,
        back: function (c) { var d = 'M36,58 C48,46 76,44 88,54 L92,96 L80,92 L70,98 L60,92 L48,96 Z', net = ''; for (var k = 0; k < 10; k++) net += 'M' + (34 + k * 7) + ',46 L' + (54 + k * 7) + ',100 M' + (94 - k * 7) + ',46 L' + (74 - k * 7) + ',100'; return body(c, d, '#3a4a44', L(net, '#8a9a84', 0.9, 0.9), 2) + barns(4301, 84, 70, 4, 8, 20, 1.6) + scallop(c, 80, 92, 3.4, PI / 2, SHELL) + scallop(c, 60, 92, 3.2, PI / 2, NACRE); },
        chest: function (c) { return cowries([[46, 56], [52, 64], [60, 68], [68, 66], [76, 58]]) + cowries([[48, 62], [54, 72], [62, 76], [70, 74], [76, 66]]) + nautilus(c, 62, 80, 4, -1); },
        skirt: function (c) { return kelpSkirt(c, '#4a5a34', 30, false); },
        near: [[44, 62], [32, 68], [22, 60]], nearHand: function (c, p) { return C(p[0] - 4, p[1] - 6, 14, glow(c, '#8affc8', 0.7)) + clawHand(p, sk, 0.85, '#e0e8e0') + L('M' + pt([p[0] - 2, p[1] + 3]) + 'l2,5', PEARL, 2.4) + L('M' + pt([p[0] - 12, p[1] - 8]) + 'q4,-7 10,-3 q4,4 -2,8', '#c8ffe8', 1.3, 0.9) + C(p[0] - 5, p[1] - 12, 1.3, '#e8fff4'); },
        far: [[80, 56], [92, 66], [98, 76]], wFar: function (c, p) { return boneFetish(c, [p[0] + 3, 121], [p[0] - 1, 18]); }, farHand: function (c, p) { return clawHand(p, sk, 0.85, '#e0e8e0'); }
      });
    },
    tidefang: function (c) {
      var o = shadow(c, 70, 44), mc = '#66702e', sp = '#e2d470', dd = '#3a4220', r = rng(4501);
      var spots = function (pts, cnt, spread) { var s = ''; for (var i = 0; i < cnt; i++) { var q2 = pts[Math.floor(r() * pts.length)]; s += E(q2[0] + (r() - 0.5) * spread, q2[1] + (r() - 0.5) * spread, 1.6 + r() * 1.8, 1.2 + r() * 1.3, r() < 0.3 ? dd : sp, 0, 0.95); } return s; };
      o += E(72, 118, 48, 7, c.lg([[0, '#6ae8e0'], [1, '#1a6a80']]), 1.4) + L('M32,117 q10,-3 20,0 M92,119 q10,-3 20,0', FOAM, 1.3, 0.85);
      var Tt = taper([[86, 121], [106, 117], [118, 106], [118, 94], [110, 90]], 18, 4, 4);
      o += body(c, Tt.d, dk(mc, 0.12), spots(Tt.s, 6, 10), 2);
      var T = taper([[74, 123], [90, 102], [92, 80], [82, 62], [66, 52], [54, 48]], 32, 24, 5), fin = [], i;
      for (i = 1; i < T.s.length - 3; i++) { var a = T.a[i], b = T.s[i], k = 0.32 + (i % 2) * 0.1; fin.push([a[0] + (a[0] - b[0]) * k, a[1] + (a[1] - b[1]) * k]); }
      o += P(pd([T.a[1]].concat(fin).concat([T.a[T.s.length - 3]]), true), c.cel(dk(mc, 0.2)), 1.6);
      o += body(c, T.d, mc, spots(T.s.slice(2), 24, 22), 2.4);
      o += L('M76,120 q6,-4 14,-2', FOAM, 2, 0.9);
      // head: huge blunt moray head, the jaws gaping wide
      var mouth = 'M34,47 L6,44 L9,56 L14,68 L36,56 Z';
      o += P(mouth, '#3a0e18', 1.6) + F('M30,50 L14,50 L20,62 Z', '#6a1a2a', 0.9);
      var up = 'M66,34 C58,22 36,20 20,26 L4,34 C1,37 2,42 7,44 L34,47 L60,56 C68,50 70,42 66,34 Z';
      o += body(c, up, mc, spots([[40, 30], [52, 36], [26, 32], [58, 46]], 12, 16) + F('M6,40 L40,44 L60,54 L62,60 L30,50 Z', dk(mc, 0.15), 0.6), 2.4);
      var lo = 'M60,56 L36,55 L14,66 C9,69 10,75 16,75 L42,71 C56,68 64,62 60,56 Z';
      o += body(c, lo, dk(mc, 0.06), spots([[40, 64], [26, 69]], 5, 10) + F('M16,72 L42,68 L58,62 L60,66 L44,72 L16,76 Z', dk(mc, 0.25), 0.6), 2.2);
      o += L('M9,44 l1.4,5.4 M14,45 l1.2,6 M19,45.6 l1,6 M24,46.2 l0.8,5.4 M29,46.8 l0.6,4.6 M17,66 l2,-5 M22,63.6 l2,-5.4 M27,61 l2,-5 M32,58.4 l1.6,-4', '#f4ecd8', 1.5);
      o += C(40, 32, 4.4, c.cel('#e8d060'), 1.4) + E(39, 32, 1.2, 3, OL) + C(40, 32, 11, glow(c, '#ffe060', 0.4)) + L('M30,26 L50,28', OL, 1.8) + E(62, 62, 3, 4.4, dd, 1) + C(9, 37, 1.4, OL);
      return G(o, 'translate(3,0)');
    },
    high_priest_zanjin: function (c) {
      return wTroll(c, {
        hat: 'shell', dreads: 3, dreadLen: 26, noLegs: true, hy: 42, earShell: NACRE, jaw: true, paint: '#f4f0e6', shirt: WSKIN,
        skirt: function (c) { return robe(c, '#1e4658', NACRE); },
        back: function (c) { return body(c, 'M50,50 C66,44 86,46 92,56 C100,76 104,96 108,118 L96,114 L88,119 L78,114 L70,118 C68,96 62,72 50,50 Z', '#2a3e2e', L('M60,60 L96,112 M76,56 L102,100 M90,60 L74,116', '#6a8a5a', 0.9, 0.8) + L('M72,117 L80,113 L88,118 L96,113 L106,117', PEARL, 1.4), 2.2); },
        chest: function (c) { return shellNecklace(c, [[46, 52], [52, 60], [60, 64], [68, 62], [76, 54]], [PEARL, NACRE]) + C(64, 72, 7, c.rg([[0, '#ffffff'], [0.5, NACRE], [1, '#8ab8c8']]), 1.8) + L(spiralD(64, 72, 5, 2, -1), '#6a8aa0', 0.9); },
        pads: function (c) { return scallop(c, 82, 56, 10, -PI / 2 + 0.3, NACRE) + scallop(c, 44, 58, 13, -PI / 2 - 0.3, '#f0dcd0'); },
        near: [[46, 58], [36, 44], [28, 28]], nearHand: function (c, p) { return hand(p, c.cel(WSKIN)) + sacKnife(c, [p[0], p[1] - 2], -PI / 2 - 0.75); },
        far: [[80, 56], [92, 66], [98, 60]], farHand: function (c, p) { return hand(p, c.cel(WSKIN)) + scallop(c, p[0] - 1, p[1] + 2, 9, -PI / 2, '#c8d0dc') + C(p[0] - 1, p[1] - 4, 12, glow(c, TEAL, 0.6)) + E(p[0] - 1, p[1] - 3, 6, 2, '#6ae8e0', 1); }
      });
    },
    avatar_of_shalzua: function (c) {
      // a towering water body in the shape of the sea loa: serpent below, woman above, a breaking wave for hair,
      // a nacre loa mask for a face; something from the deep wears her (violet veins, a great eye, extra eyes)
      var o = '', WL = '#d8feff', WM = '#56d6e2', WD = '#1a86b0', WX = '#10527e';
      var wat = function (a, b) { return c.lg([[0, WL], [0.28, WM], [0.72, WD], [1, WX]], a == null ? 0.2 : a, 0, b == null ? 0.6 : b, 1); };
      var wb = function (d, fill, shade, sw) { return P(d, fill, sw == null ? 2.2 : sw) + (shade ? '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>' : ''); };
      var vein = function (d, w) { return L(d, VIOD, (w || 1) * 2.4) + L(d, VIO, (w || 1) * 1, 0.95); };
      var eye = function (x, y, r) { return C(x, y, r * 3, glow(c, VIO, 0.7)) + E(x, y, r * 1.6, r * 1.05, '#1a0630', 0.8) + E(x, y, r * 1.05, r * 0.9, VIOL) + E(x, y, r * 0.32, r * 0.8, '#1a0630'); };
      var bub = function (seed, pts, cnt) { var r = rng(seed), s = ''; for (var i = 0; i < cnt; i++) { var p = pts[Math.floor(r() * pts.length)]; s += '<circle cx="' + n(p[0] + (r() - 0.5) * 10) + '" cy="' + n(p[1] + (r() - 0.5) * 10) + '" r="' + n(0.8 + r() * 1.4) + '" fill="none" stroke="#e8ffff" stroke-width="0.8" opacity="0.8"/>'; } return s; };
      var foam = function (T, from, to, side) { var s = '', r = rng(4605); for (var i = from; i < to; i += 2) { var p = side ? T.b[i] : T.a[i], m = T.s[i], k = r() * 0.4; s += C(p[0] + (p[0] - m[0]) * k, p[1] + (p[1] - m[1]) * k, 1.2 + r() * 1.8, FOAM, 0.8); } return s; };
      // the abyssal pool and the violet tar climbing out of it
      o += shadow(c, 66, 46) + E(66, 118, 54, 8, c.lg([[0, '#3a2a6a'], [1, '#0a0a24']]), 1.6) + L('M22,118 q10,-3 20,0 M84,120 q10,-3 20,0', VIOL, 1.2, 0.7);
      // hair: a great breaking wave behind the head
      var wave = 'M70,22 C80,8 100,2 112,8 C122,14 124,28 114,32 C118,24 112,18 104,20 C110,30 108,48 98,58 L86,54 C90,44 86,34 76,32 Z';
      o += wb(wave, wat(0, 1), L('M80,24 C92,14 104,12 112,16 M86,34 C96,28 100,38 98,50', '#e8ffff', 1.2, 0.8) + bub(4601, [[96, 30], [104, 40], [90, 20]], 5), 2);
      [[98, 4.6], [104, 4], [110, 6], [115, 9], [119, 14], [121, 20]].forEach(function (k) { o += C(k[0], k[1], 2.8, FOAM, 1); });
      o += L('M115,32 Q112,26 106,26', OL, 2.4) + L('M115,32 Q112,26 106,26', FOAM, 1.2);
      // far arm raised into the wave
      o += limb('M84,56 L96,44 L104,30', WD, 9) + L('M88,52 Q96,44 102,32', '#c8f8ff', 1.2, 0.7);
      // the serpent tail: a coil behind, rising out of the pool, and a sweep in front along the water
      var Tb = taper([[104, 121], [116, 106], [110, 90], [94, 84], [78, 88]], 16, 24, 5);
      o += wb(Tb.d, wat(0, 1), L(bands(Tb, 3), WX, 1, 0.6) + L(along(Tb, 0.3), '#e8ffff', 1.2, 0.7) + bub(4602, Tb.s, 6) + vein('M108,116 Q112,104 106,94', 0.9) + E(108, 122, 18, 9, c.lg([[0, '#2a1050', 0], [0.5, '#2a1050', 0.7], [1, '#0a0418', 0.95]])) + L('M100,116 Q104,108 102,100 M110,118 Q114,110 112,104', '#2a1050', 2.4, 0.8));
      o += eye(110, 100, 2);
      // torso rising from the coil
      var td = 'M60,98 C62,88 62,80 60,74 C54,68 50,60 50,52 C56,46 76,44 86,50 C86,60 82,68 80,74 C78,82 80,90 84,98 Z';
      o += wb(td, wat(0.2, 0.9), F('M72,44 L92,44 L92,104 L76,104 C80,86 78,64 72,44 Z', WX, 0.5) + L('M58,62 Q60,72 64,80 M72,84 Q70,90 72,98', '#e8ffff', 1.1, 0.7) + bub(4603, [[62, 70], [70, 84], [66, 94]], 6) +
        vein('M68,72 L60,62 L54,54 M68,72 L78,62 L84,52 M68,72 L62,84 L64,98 M68,72 L76,82 L78,98 M60,62 L64,54', 1), 2.2);
      o += eye(68, 72, 3.6);
      o += scallop(c, 60, 60, 6.4, PI / 2 + 0.5, '#f0d8e0') + scallop(c, 74, 60, 6.4, PI / 2 - 0.5, '#e8c8d0');
      o += L('M52,52 Q66,60 84,52', OL, 2.8) + L('M52,52 Q66,60 84,52', CORAL, 1.5);
      [56, 62, 68, 74, 80].forEach(function (x) { o += C(x, 54.4 + (x > 58 && x < 78 ? 2.6 : 0.6), 1.7, PEARL, 0.8); });
      var Tf = taper([[64, 94], [52, 106], [34, 114], [16, 116], [6, 110], [8, 102]], 22, 5, 5);
      o += wb(Tf.d, wat(0, 1), L(bands(Tf, 3), WX, 1, 0.55) + P(ribbonBand(Tf, 0.66, 1), '#a8f0f8', 0) + bub(4604, Tf.s, 6) + vein('M58,100 Q46,110 30,112 L20,112', 0.9));
      o += foam(Tf, 3, Tf.s.length - 4, false) + P('M8,102 L2,92 L10,96 L12,88 L16,100 Z', c.cel('#8ae8f4'), 1.4) + eye(38, 112, 1.6);
      // head: nacre loa mask over a water face, fin ear, coral crown, eyes that are not hers
      o += P('M60,42 L70,40 L72,52 L62,54 Z', WM, 2);
      o += P('M70,26 L90,18 L86,28 L96,30 L84,36 L72,38 Z', wat(0, 1), 1.6) + L('M74,28 L88,20 M74,34 L92,30', '#e8ffff', 1, 0.8);
      var hd = 'M53,22 C56,12 72,10 78,20 C82,28 80,38 72,43 C68,46 62,46 58,44 L55,41 L56,39 L53,37 L55,35 L51,31 L53,28 Z';
      o += wb(hd, wat(0.2, 0.9), F('M68,10 L84,10 L84,48 L66,48 C72,38 72,22 68,10 Z', WX, 0.45), 2);
      var mk = 'M52,24 C56,17 66,16 70,22 L70,34 C66,40 60,40 55,38 L52,34 L54,31 L51,31 Z';
      o += P(mk, c.lg([[0, '#ffffff'], [0.6, NACRE], [1, '#a8b8d0']]), 1.6) + L('M54,26 Q60,23 68,26', '#8a90b0', 1) + L('M56,36 Q62,39 68,35', '#8a90b0', 0.9);
      o += P('M56,37 C52,37 50,34 51,31 C53,34 55,35 57,35 Z', c.cel(BONE), 1);
      o += eye(59, 29, 1.9) + eye(63, 20, 1.4) + eye(67, 30, 1.2) + vein('M63,20 L66,14 M67,30 L72,36', 0.7);
      [[56, 16, -2.2, 10], [61, 13, -1.8, 13], [67, 13, -1.35, 13], [73, 16, -0.95, 10]].forEach(function (k) { var e = [k[0] + Math.cos(k[2]) * k[3], k[1] + Math.sin(k[2]) * k[3]]; o += L('M' + pt([k[0], k[1]]) + 'L' + pt(e), OL, 4.6) + L('M' + pt([k[0], k[1]]) + 'L' + pt(e), CORAL, 2.6) + C(e[0], e[1], 1.7, CORALL, 0.8); });
      o += L('M53,17 Q65,10 77,17', OL, 3.6) + L('M53,17 Q65,10 77,17', PEARL, 2) + C(65, 12.6, 2.2, c.rg([[0, '#ffffff'], [1, VIOL]]), 0.9);
      // a lock of water hair falling over the shoulder
      var Th = taper([[70, 20], [62, 30], [58, 42], [60, 54]], 8, 2, 4);
      o += wb(Th.d, wat(0, 1), L(along(Th, 0.4), '#e8ffff', 1, 0.8), 1.6) + C(60, 55, 1.8, FOAM, 0.8);
      // near arm reaching out, webbed claws dripping
      o += limb('M54,56 L42,70 L28,66', WM, 9) + L('M50,60 L40,68', '#e8ffff', 1.2, 0.7) + vein('M52,58 L42,68 L32,66', 0.8);
      o += P('M30,60 L14,56 L20,62 L8,64 L20,67 L12,73 L30,71 Z', c.cel('#78e0ee'), 1.6) + L('M26,64 L14,64', '#e8ffff', 0.9, 0.8);
      o += L('M14,68 Q10,78 14,86', '#bff4ff', 2, 0.85) + C(14, 90, 1.8, FOAM) + C(12, 96, 1.3, FOAM) + C(24, 76, 1.4, FOAM);
      return o;
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(SEAM), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, STD) + ground(c, 150, ST, STD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#2e3b38"/></svg>'; }
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
