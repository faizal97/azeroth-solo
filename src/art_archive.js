/* art_archive.js — The Sunken Archive art for Realm of Loner (expansion "The Drowned Crown", Accord dungeon, level 60:
 * the great library of the Starborn city Sael'anor, drowned for ten thousand years and still kept by its dead).
 * Scenes: the flooded stacks (towering shelves), the domed reading hall (lecterns, a round window onto the sea) and the
 * sanctum scriptorium (a giant open book on a dais, a quill, rising ink). Mobs: the Archive Wardkeeper, Inkbound Wisp
 * and Drowned Scholar, and the bosses Curator Ellaris, the Inkbound Horror, Lorekeeper Nerathil and Lady Vessaria
 * the Tidescribe.
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the Archive
 * keys and fall through to the previous functions for every other key. Keys are appended to ART.keys.scenes /
 * ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, the robe rig and the head are copies of art_scholomance.js (itself copying art_brd.js).
 * New here: coral, pools, pages, ink clouds and ribbons, elven shelves, columns and arches, the sea window, the giant
 * book and quill, and the drowned Starborn look: pale sea-green skin, teal glowing eyes, long ears, gill lines,
 * pearl and coral accents, white hair floating as if under water.
 * Kept apart from The Blackcloister's undead (no bone, no green gloom light) and from the Icewold Starborn apparitions
 * (those are translucent blue-violet gowns with crescent headdresses; here only Ellaris is a ghost, and he is teal).
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix ar<counter>_).
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
  function Ctx() { this.p = 'ar' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function ring(x, y, rx, ry, col, w) { return L(ellD(x, y, rx, ry), OL, w + 1.8) + L(ellD(x, y, rx, ry), col, w); }
  function darkFloor(c, y, col, seed) { return flagFloor(c, y, 200, col, seed) + R(0, y - 2, 400, 8, c.lg([[0, '#000', 0.4], [1, '#000', 0]])); }

  // ============================================================
  //  SUNKEN ARCHIVE: palette
  // ============================================================
  var SKIN = '#a6d4c2', HAIR = '#eefaf6', EYE = '#3cf4dc';
  var TEAL = '#2ec8b8', TEALL = '#9ff4ea', TEALD = '#0e5a60', DEEP = '#0a2a34';
  var GOLD = '#e0b24e', GOLDD = '#8a6a24', PEARL = '#f6f2ea';
  var CORAL = '#ee6c5a', CORALP = '#e0709e', CORALO = '#f09a4a';
  var STONE = '#5a7a80', STONEL = '#86aaac', STONED = '#2e464e', CASE = '#42524c';
  var INK = '#15112c', INKL = '#342a66', INKS = '#8a7ae6';
  var PAGE = '#efe6cc', PAGED = '#b8a47a';
  var SPINES = ['#2e5e62', '#5a2a36', '#7a6230', '#2a3660', '#46603a', '#5a3e5e', '#8a7a52', '#1e4652', '#6a4030'];

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  function hollow(x, y, r, col, w, op) { return '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  // crescent moon opening to the right (k = inner curve depth 0..1)
  function moonR(x, y, r, k) { return 'M' + pt([x, y - r]) + 'A' + n(r) + ',' + n(r) + ' 0 1,0 ' + pt([x, y + r]) + 'A' + n(r * k) + ',' + n(r) + ' 0 1,1 ' + pt([x, y - r]) + 'Z'; }
  // crescent moon lying on its back, horns up
  function moonU(x, y, r, k) { return 'M' + pt([x - r, y]) + 'A' + n(r) + ',' + n(r) + ' 0 0,0 ' + pt([x + r, y]) + 'A' + n(r) + ',' + n(r * k) + ' 0 0,1 ' + pt([x - r, y]) + 'Z'; }
  // elven arch: tall sides and a soft pointed crown (x = left, y = bottom)
  function elfArch(x, y, w, h) {
    var s = y - h + w * 0.5;
    return 'M' + pt([x, y]) + 'L' + pt([x, s]) + 'C' + pt([x, y - h + w * 0.12]) + ' ' + pt([x + w * 0.36, y - h + w * 0.04]) + ' ' + pt([x + w / 2, y - h]) +
      'C' + pt([x + w * 0.64, y - h + w * 0.04]) + ' ' + pt([x + w, y - h + w * 0.12]) + ' ' + pt([x + w, s]) + 'L' + pt([x + w, y]) + 'Z';
  }
  // branching coral (x, y = root)
  function coral(c, x, y, s, col, seed, lean) {
    var r = rng(seed), segs = [[], [], [], []], tips = [];
    (function grow(p, a, len, d) {
      var q = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
      segs[d].push('M' + pt(p) + 'Q' + pt([(p[0] + q[0]) / 2 + (r() - 0.5) * len * 0.35, (p[1] + q[1]) / 2]) + ' ' + pt(q));
      if (d < 3) {
        grow(q, a - 0.3 - r() * 0.35, len * (0.62 + r() * 0.18), d + 1);
        grow(q, a + 0.3 + r() * 0.35, len * (0.62 + r() * 0.18), d + 1);
        if (d < 2 && r() < 0.3) grow(q, a + (r() - 0.5) * 0.2, len * 0.6, d + 1);
      } else tips.push(q);
    })([x, y], -PI / 2 + (lean || 0), 14 * s, 0);
    var o = '', w = [5.2, 3.8, 2.8, 2], d;
    for (d = 0; d < 4; d++) if (segs[d].length) o += L(segs[d].join(''), OL, w[d] * s + 2.6);
    for (d = 0; d < 4; d++) if (segs[d].length) o += L(segs[d].join(''), d < 2 ? col : lt(col, 0.12), w[d] * s);
    o += L(segs[0].concat(segs[1]).join(''), lt(col, 0.4), Math.max(0.6, w[1] * s * 0.3), 0.8);
    tips.forEach(function (q) { o += C(q[0], q[1], 1.3 * s + 0.5, lt(col, 0.35)); });
    return o;
  }
  // brain coral: a few round knobs with a wiggle groove
  function knobs(c, x, y, s, col) {
    return E(x + 8 * s, y - 5 * s, 8 * s, 6 * s, c.cel(dk(col, 0.1)), 1.6) + E(x - 5 * s, y - 6 * s, 10 * s, 7.4 * s, c.cel(col), 1.6) +
      L('M' + pt([x - 12 * s, y - 6 * s]) + 'q3,-3 5,0 t5,0 t5,0', dk(col, 0.35), 1, 0.8) + E(x + 2 * s, y - 2 * s, 6 * s, 3.4 * s, c.cel(lt(col, 0.1)), 1.4);
  }
  function barn(x, y, r) { return C(x, y, r, '#d8d4c4', 0.9) + C(x, y, r * 0.42, '#2a3a3a'); }
  function kelp(c, x, y, h, col, seed) {
    var r = rng(seed), p = [[x, y]];
    for (var i = 1; i <= 4; i++) p.push([x + (i % 2 ? 1 : -1) * (3 + r() * 3), y - h * i / 4]);
    var T = taper(p, 5, 1.2, 5);
    return P(T.d, c.cel(col), 1.3);
  }
  function pool(c, x, y, rx, ry) {
    return E(x, y, rx, ry, c.lg([[0, '#5adcd0', 0.5], [1, '#0a3a46', 0.75]]), 0) + L(ellD(x, y, rx, ry), '#9ff4ea', 1, 0.5) +
      L(ellD(x - rx * 0.1, y + ry * 0.1, rx * 0.55, ry * 0.45), '#c8fff6', 0.8, 0.4) + L('M' + pt([x - rx * 0.6, y - ry * 0.3]) + 'Q' + pt([x - rx * 0.3, y - ry * 0.65]) + ' ' + pt([x + rx * 0.15, y - ry * 0.45]), '#ffffff', 1, 0.55);
  }
  function inkPool(c, x, y, rx, ry) { return E(x, y, rx, ry, c.lg([[0, INKL, 0.85], [1, INK, 0.95]]), 0) + L('M' + pt([x - rx * 0.6, y - ry * 0.25]) + 'Q' + pt([x - rx * 0.2, y - ry * 0.6]) + ' ' + pt([x + rx * 0.3, y - ry * 0.35]), INKS, 1, 0.7); }
  function shaftL(c, x0, w0, x1, w1, y1, col, op) { return F(pd([[x0 - w0 / 2, -2], [x0 + w0 / 2, -2], [x1 + w1 / 2, y1], [x1 - w1 / 2, y1]], true), c.lg([[0, col, op], [1, col, 0]])); }
  function bubbles(seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = 0.8 + r() * 1.8; o += hollow(x, y, rr, '#c8fff4', 0.7, 0.75) + C(x - rr * 0.35, y - rr * 0.35, rr * 0.3, '#ffffff', 0, 0.8); }
    return o;
  }
  // loose page drifting (lines only, never glyphs)
  function page(c, x, y, ang, s) {
    var q = dirQ([x, y], ang);
    var d = 'M' + pt(q(-6 * s, -4.4 * s)) + 'Q' + pt(q(0, -6 * s)) + ' ' + pt(q(6 * s, -4.4 * s)) + 'L' + pt(q(6 * s, 4.4 * s)) + 'Q' + pt(q(0, 2.8 * s)) + ' ' + pt(q(-6 * s, 4.4 * s)) + 'Z';
    return P(d, PAGE, 0.9) + L('M' + pt(q(-4 * s, -2.4 * s)) + 'L' + pt(q(4 * s, -2.4 * s)) + 'M' + pt(q(-4 * s, -0.2 * s)) + 'L' + pt(q(3.4 * s, -0.2 * s)) + 'M' + pt(q(-4 * s, 2 * s)) + 'L' + pt(q(2 * s, 2 * s)), PAGED, 0.6 * s + 0.2);
  }
  function pages(c, seed, cnt, x0, x1, y0, y1, s) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += page(c, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), (r() - 0.5) * 1.6, (s || 1) * (0.7 + r() * 0.5)); return o; }
  function inkCloud(c, x, y, s, seed) {
    var r = rng(seed), o = '';
    for (var i = 0; i < 6; i++) o += C(x + (r() - 0.5) * 30 * s, y + (r() - 0.5) * 12 * s, (5 + r() * 8) * s, i % 2 ? INK : INKL, 0, 0.45 + r() * 0.2);
    var sw = 'M' + pt([x - 14 * s, y + 2 * s]) + 'c' + n(4 * s) + ',' + n(-8 * s) + ' ' + n(14 * s) + ',' + n(-8 * s) + ' ' + n(14 * s) + ',' + n(-1 * s) + 'c0,' + n(5 * s) + ' ' + n(-7 * s) + ',' + n(5 * s) + ' ' + n(-6 * s) + ',' + n(0);
    return o + L(sw, INKS, 1.1, 0.55);
  }
  // an ink ribbon along a curve
  function inkRibbon(c, pts, w0, w1, op) {
    var T = taper(pts, w0, w1, 6);
    return G(P(T.d, c.lg([[0, INKL], [1, INK]], 0, 0, 1, 1), 1.4) + L(along(T, 0.25), INKS, 1, 0.8), '', op);
  }
  // elven bookshelf with an arched top and a crescent crest (x = left, y = floor)
  function aShelf(c, x, y, w, h, seed) {
    var r = rng(seed), top = y - h, s = '', books = '', boards = '';
    var cas = 'M' + pt([x - 5, y]) + 'L' + pt([x + w + 5, y]) + 'L' + pt([x + w + 5, top + 12]) + 'Q' + pt([x + w / 2, top - 14]) + ' ' + pt([x - 5, top + 12]) + 'Z';
    var inner = 'M' + pt([x, y - 3]) + 'L' + pt([x + w, y - 3]) + 'L' + pt([x + w, top + 14]) + 'Q' + pt([x + w / 2, top - 5]) + ' ' + pt([x, top + 14]) + 'Z';
    s += P(cas, c.cel(CASE), 1.8) + P(inner, '#06121a', 1.2);
    var rows = Math.max(1, Math.round((h - 8) / 22)), sh = (h - 8) / rows;
    for (var i = 0; i < rows; i++) {
      var yy = y - 3 - i * sh, bx = x + 1;
      if (i) boards += 'M' + pt([x, yy]) + 'L' + pt([x + w, yy]);
      while (bx < x + w - 3) {
        var bw = 3 + r() * 3.4, bh = (sh - 5) * (0.55 + r() * 0.4), col = SPINES[Math.floor(r() * SPINES.length)], roll = r();
        if (roll < 0.07) { bx += 4 + r() * 6; continue; }
        if (roll < 0.13 && bx < x + w - 14) { books += P(pd([[bx, yy], [bx + 4, yy], [bx + 12, yy - bh * 0.85], [bx + 8, yy - bh * 0.9]], true), col, 0.8); bx += 13; continue; }
        if (roll < 0.18 && bx < x + w - 12) { books += R(bx, yy - 4, 11, 4, col, 0.7) + R(bx + 1, yy - 8, 10, 4, SPINES[(Math.floor(r() * 9))], 0.7); bx += 12; continue; }
        books += R(bx, yy - bh, bw, bh, col) + (r() < 0.5 ? R(bx, yy - bh + 2, bw, 1, lt(col, 0.35)) : '');
        bx += bw + 0.3;
      }
    }
    books += F('M' + pt([x + w * 0.66, top - 10]) + 'L' + pt([x + w + 4, top - 10]) + 'L' + pt([x + w + 4, y + 2]) + 'L' + pt([x + w * 0.66, y + 2]) + 'Z', '#000', 0.35);
    s += '<g clip-path="url(#' + c.clip(inner) + ')">' + books + '</g>';
    if (boards) s += L(boards, OL, 3.4) + L(boards, CASE, 1.8);
    s += L('M' + pt([x - 2, y]) + 'L' + pt([x - 2, top + 12]), lt(CASE, 0.25), 1.2, 0.7);
    s += P(moonU(x + w / 2, top - 5, 5.4, 0.45), c.cel(GOLD), 1.2);
    return s + barn(x - 2, y - h * 0.3, 1.8) + barn(x + w + 2, y - h * 0.55, 2.2) + barn(x + w + 1, y - h * 0.5, 1.4);
  }
  // slender fluted elven column with a crescent capital (x = left, y = floor)
  function column(c, x, y, w, h) {
    var sh = pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var o = body(c, sh, STONEL, F(pd([[x + w * 0.62, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(STONEL, 0.4), 0.8) +
      L('M' + pt([x + w * 0.33, y - h]) + 'L' + pt([x + w * 0.33, y]) + 'M' + pt([x + w * 0.62, y - h]) + 'L' + pt([x + w * 0.62, y]), dk(STONEL, 0.3), 1.1) + L('M' + pt([x + 2, y - h]) + 'L' + pt([x + 2, y]), lt(STONEL, 0.2), 1.1, 0.7), 1.8);
    o += P(pd([[x - 5, y], [x + w + 5, y], [x + w + 3, y - 7], [x - 3, y - 7]], true), c.cel(STONE), 1.6);
    o += P('M' + pt([x - 7, y - h]) + 'L' + pt([x + w + 7, y - h]) + 'L' + pt([x + w, y - h + 6]) + 'L' + pt([x, y - h + 6]) + 'Z', c.cel(STONE), 1.6);
    o += P(moonU(x + w / 2, y - h - 1, w * 0.8, 0.5), c.cel(GOLD), 1.3);
    return o + L('M' + pt([x - 2, y - h + 10]) + 'L' + pt([x + w + 2, y - h + 10]), GOLD, 1.3, 0.9);
  }
  function openBookA(c, x, y, s, g) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }; g = g || TEAL;
    return C(x, y - 4 * s, 15 * s, glow(c, g, 0.6)) + P(pd([q(0, 2), q(-11, 0), q(-12, -6), q(0, -4)], true), c.cel('#efe6c8'), 1.3 * s) + P(pd([q(0, 2), q(11, 0), q(12, -6), q(0, -4)], true), c.cel('#dccfa6'), 1.3 * s) +
      P(pd([q(-12, 0.4), q(0, 2.6), q(12, 0.4), q(12, 2.4), q(0, 4.4), q(-12, 2.4)], true), c.cel('#1e4652'), 1.2 * s) + L('M' + pt(q(-9, -3)) + 'l' + n(7 * s) + ',' + n(1 * s) + 'M' + pt(q(-9, -1)) + 'l' + n(6 * s) + ',' + n(1 * s) + 'M' + pt(q(3, -2)) + 'l' + n(6 * s) + ',' + n(-1 * s), PAGED, 0.8 * s);
  }
  function lectern(c, x, y, s) {
    var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.35);
    o += P(pd([[x - 9 * s, y], [x + 9 * s, y], [x + 4 * s, y - 4 * s], [x - 4 * s, y - 4 * s]], true), c.cel(STONEL), 1.3);
    o += R(x - 2.4 * s, y - 25 * s, 4.8 * s, 21 * s, c.cel(STONEL), 1.2) + R(x - 3.4 * s, y - 16 * s, 6.8 * s, 2.4 * s, c.cel(GOLD), 1);
    o += P(pd([[x - 13 * s, y - 23 * s], [x + 13 * s, y - 29 * s], [x + 14 * s, y - 25 * s], [x - 12 * s, y - 19 * s]], true), c.cel(CASE), 1.3);
    return o + openBookA(c, x, y - 28 * s, s);
  }
  // hanging lantern with a teal flame (x, y = top hook)
  function lantern(c, x, y, s, g) {
    g = g || TEAL;
    var o = C(x, y + 12 * s, 20 * s, glow(c, g, 0.6));
    o += P(pd([[x - 5 * s, y + 4 * s], [x + 5 * s, y + 4 * s], [x + 7 * s, y + 10 * s], [x + 5 * s, y + 18 * s], [x - 5 * s, y + 18 * s], [x - 7 * s, y + 10 * s]], true), c.rg([[0, '#ffffff'], [0.4, lt(g, 0.4)], [1, dk(g, 0.3)]]), 1.3);
    o += L('M' + pt([x, y + 4 * s]) + 'L' + pt([x, y + 18 * s]) + 'M' + pt([x - 7 * s, y + 10 * s]) + 'L' + pt([x + 7 * s, y + 10 * s]), GOLDD, 1 * s, 0.9);
    o += P(pd([[x - 6 * s, y + 4 * s], [x + 6 * s, y + 4 * s], [x + 3 * s, y], [x - 3 * s, y]], true), c.cel(GOLD), 1.1) + P(pd([[x - 6 * s, y + 18 * s], [x + 6 * s, y + 18 * s], [x, y + 23 * s]], true), c.cel(GOLD), 1.1);
    return o;
  }
  function bookPile(c, x, y, s, seed) {
    var r = rng(seed), o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.35), yy = y;
    for (var i = 0; i < 4; i++) { var w = (18 + r() * 8) * s, h = (4 + r() * 2) * s, dx = (r() - 0.5) * 6 * s, col = SPINES[Math.floor(r() * SPINES.length)]; o += R(x - w / 2 + dx, yy - h, w, h, c.cel(col), 1.2) + R(x - w / 2 + dx + 1.5, yy - h + 1, w - 3, 1.2, PAGE, 0, 0.8); yy -= h; }
    return o + page(c, x + 14 * s, y - 1, 0.1, 0.9 * s);
  }
  function ladder(c, x, y, h) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x + 10, y - h]) + 'M' + pt([x + 14, y]) + 'L' + pt([x + 24, y - h]), rg = '';
    for (var i = 1; i < 9; i++) { var t = i / 9; rg += 'M' + pt([x + 10 * t, y - h * t]) + 'L' + pt([x + 14 + 10 * t, y - h * t]); }
    return L(rg, OL, 3.6) + L(rg, '#5a4a38', 1.8) + L(d, OL, 5) + L(d, '#6a5640', 3) + L(d, lt('#6a5640', 0.25), 1, 0.6);
  }
  // round window onto the sea: light rays, distant spires, kelp, fish, radial tracery
  function seaWindow(c, cx, cy, r) {
    var o = C(cx, cy, r * 1.7, glow(c, TEAL, 0.32)), g = ellD(cx, cy, r, r), inner = '', i;
    o += C(cx, cy, r + 10, c.cel(STONEL), 2) + hollow(cx, cy, r + 5, GOLD, 1.4, 0.8);
    o += P(g, c.lg([[0, '#48c8c8'], [0.45, '#136a76'], [1, '#062836']]), 1.8);
    for (i = 0; i < 4; i++) { var x0 = cx - r * 0.7 + i * r * 0.45; inner += F(pd([[x0, cy - r], [x0 + 8, cy - r], [x0 + 26, cy + r], [x0 + 12, cy + r]], true), '#dffff6', 0.14); }
    inner += F('M' + pt([cx - r, cy + r * 0.55]) + 'L' + pt([cx - r * 0.7, cy + r * 0.5]) + 'L' + pt([cx - r * 0.66, cy + r * 0.2]) + 'Q' + pt([cx - r * 0.6, cy + r * 0.05]) + ' ' + pt([cx - r * 0.54, cy + r * 0.2]) + 'L' + pt([cx - r * 0.5, cy + r * 0.5]) + 'L' + pt([cx - r * 0.2, cy + r * 0.48]) + 'L' + pt([cx - r * 0.16, cy - r * 0.05]) + 'L' + pt([cx - r * 0.12, cy - r * 0.3]) + 'L' + pt([cx - r * 0.08, cy - r * 0.05]) + 'L' + pt([cx - r * 0.04, cy + r * 0.46]) +
      'L' + pt([cx + r * 0.3, cy + r * 0.5]) + 'Q' + pt([cx + r * 0.42, cy + r * 0.25]) + ' ' + pt([cx + r * 0.54, cy + r * 0.5]) + 'L' + pt([cx + r, cy + r * 0.56]) + 'L' + pt([cx + r, cy + r]) + 'L' + pt([cx - r, cy + r]) + 'Z', '#0a3a4a', 0.9);
    [[-0.5, 0.2, 1], [0.35, -0.2, -1], [0.1, 0.1, 1]].forEach(function (f, k) { var fx = cx + f[0] * r, fy = cy + f[1] * r, sd = f[2], sz = k === 2 ? 0.7 : 1; inner += F(ellD(fx, fy, 7 * sz, 2.6 * sz), '#08323e', 0.85) + F(pd([[fx + sd * 6 * sz, fy], [fx + sd * 11 * sz, fy - 3 * sz], [fx + sd * 11 * sz, fy + 3 * sz]], true), '#08323e', 0.85); });
    inner += kelp(c, cx - r * 0.85, cy + r, r * 0.8, '#0c4a3a', 51) + kelp(c, cx + r * 0.75, cy + r, r * 0.95, '#0c4a3a', 52) + bubbles(53, 8, cx - r * 0.6, cx + r * 0.6, cy - r * 0.8, cy + r * 0.4);
    o += '<g clip-path="url(#' + c.clip(g) + ')">' + inner + '</g>';
    var sp = '';
    for (i = 0; i < 8; i++) { var a = i * PI / 4 + PI / 8; sp += 'M' + pt([cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42]) + 'L' + pt([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    o += L(sp, OL, 4.6) + L(sp, STONEL, 2.6) + ring(cx, cy, r * 0.42, r * 0.42, STONEL, 2.4) + L(ellD(cx, cy, r * 0.42, r * 0.42), GOLD, 0.9, 0.9);
    return o + P(moonR(cx - 3, cy, r * 0.22, 0.45), c.cel(GOLD), 1.3);
  }
  // giant open book (x = spine, y = bottom of the pages)
  function bigBook(c, x, y, s) {
    var q = function (u, v) { return pt([x + u * s, y + v * s]); }, o = C(x, y - 20 * s, 76 * s, glow(c, '#ffeeb0', 0.5));
    o += P('M' + q(-62, -2) + 'L' + q(0, 6) + 'L' + q(62, -2) + 'L' + q(62, 3) + 'L' + q(0, 11) + 'L' + q(-62, 3) + 'Z', c.cel('#3a1e38'), 1.8) + L('M' + q(-60, 0) + 'L' + q(0, 8) + 'L' + q(60, 0), GOLD, 1.3);
    var lp = 'M' + q(0, 2) + 'C' + q(-20, -8) + ' ' + q(-40, -8) + ' ' + q(-58, -2) + 'L' + q(-56, -34) + 'C' + q(-40, -40) + ' ' + q(-20, -40) + ' ' + q(0, -30) + 'Z';
    var rp = 'M' + q(0, 2) + 'C' + q(20, -8) + ' ' + q(40, -8) + ' ' + q(58, -2) + 'L' + q(56, -34) + 'C' + q(40, -40) + ' ' + q(20, -40) + ' ' + q(0, -30) + 'Z';
    o += P(lp, c.lg([[0, '#fff8e2'], [1, '#e6d4a4']], 1, 0, 0, 1), 1.8) + P(rp, c.lg([[0, '#fff4d8'], [1, '#d8c490']], 0, 0, 1, 1), 1.8);
    var ln = '';
    for (var i = 0; i < 6; i++) { var v = -28 + i * 4.6, k = i < 5 ? 1 : 0.6; ln += 'M' + q(-50, v + 1) + 'C' + q(-36, v - 4) + ' ' + q(-18, v - 3) + ' ' + q(-6 * k - 2 * (1 - k) * 20, v + 3) + 'M' + q(6, v + 3) + 'C' + q(18, v - 3) + ' ' + q(36, v - 4) + ' ' + q(50 * k, v + 1); }
    o += L(ln, '#8a7244', 1.1 * s, 0.7) + L('M' + q(0, 2) + 'L' + q(0, -30), dk(PAGED, 0.3), 1.2);
    return o + L('M' + q(-58, -2) + 'L' + q(-56, -34) + 'M' + q(-60, 0) + 'L' + q(-58, -32) + 'M' + q(58, -2) + 'L' + q(56, -34) + 'M' + q(60, 0) + 'L' + q(58, -32), PAGED, 1);
  }
  // a quill from its nib (tip) to the end of its feather (top); vane from f0 to 1 along it
  function quill(c, tip, top, w, f0, vane) {
    var dx = top[0] - tip[0], dy = top[1] - tip[1], len = Math.sqrt(dx * dx + dy * dy) || 1, q = dirQ(tip, Math.atan2(dy, dx)), o = '';
    f0 = f0 == null ? 0.3 : f0; vane = vane || ['#ffffff', '#8ae8dc'];
    var vd = 'M' + pt(q(len * f0, 0)) + 'C' + pt(q(len * (f0 + 0.1), -w)) + ' ' + pt(q(len * 0.82, -w * 1.15)) + ' ' + pt(q(len, 0)) + 'C' + pt(q(len * 0.84, w * 0.7)) + ' ' + pt(q(len * (f0 + 0.15), w * 0.62)) + ' ' + pt(q(len * f0, 0)) + 'Z';
    o += P(vd, c.lg([[0, vane[0]], [0.6, vane[1]], [1, dk(vane[1], 0.3)]], 0, 0, 1, 1), 1.6);
    var br = '';
    for (var i = 1; i < 9; i++) { var t = f0 + (1 - f0) * i / 9, u = len * t; br += 'M' + pt(q(u, 0)) + 'L' + pt(q(u + len * 0.06, -w * 0.8 * Math.sin(PI * i / 9))) + 'M' + pt(q(u, 0)) + 'L' + pt(q(u + len * 0.05, w * 0.5 * Math.sin(PI * i / 9))); }
    o += L(br, dk(vane[1], 0.35), 0.8, 0.8) + F(pd([q(len * 0.5, -w * 0.9), q(len * 0.56, -w * 1.1), q(len * 0.6, -w * 0.9)], true), '#06121a');
    var sh = 'M' + pt(q(len * 0.1, 0)) + 'L' + pt(q(len * 0.99, 0));
    o += L(sh, OL, 3.6) + L(sh, '#f6eed8', 1.8);
    o += P(pd([q(0, 0), q(len * 0.13, -2.8), q(len * 0.15, 0), q(len * 0.13, 2.8)], true), c.cel(GOLD), 1.2) + L('M' + pt(q(1, 0)) + 'L' + pt(q(len * 0.09, 0)), OL, 0.8);
    return o + R(q(len * 0.15, 0)[0] - 2.4, q(len * 0.15, 0)[1] - 2.4, 4.8, 4.8, c.cel(GOLDD), 1);
  }
  function inkwell(c, x, y, s) {
    return E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.4) + P('M' + pt([x - 9 * s, y]) + 'C' + pt([x - 11 * s, y - 10 * s]) + ' ' + pt([x - 6 * s, y - 13 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'L' + pt([x + 4 * s, y - 14 * s]) + 'C' + pt([x + 6 * s, y - 13 * s]) + ' ' + pt([x + 11 * s, y - 10 * s]) + ' ' + pt([x + 9 * s, y]) + 'Z', c.cel('#1e3a4a'), 1.4) +
      R(x - 5 * s, y - 17 * s, 10 * s, 3.6 * s, c.cel(GOLD), 1.1) + E(x, y - 17 * s, 4 * s, 1.4 * s, INK) + L('M' + pt([x - 8 * s, y - 6 * s]) + 'L' + pt([x + 8 * s, y - 6 * s]), GOLD, 1.1, 0.8);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  function floorWater(c, seed) { return darkFloor(c, 122, '#2c4a52', seed) + L('M-2,122 L402,122', OL, 1.6) + R(0, 122, 400, 118, c.lg([[0, TEAL, 0.08], [1, TEAL, 0]])); }
  function finish(c, seed) { return bubbles(seed, 14, 10, 390, 10, 200) + motes(seed + 1, 18, 0, 400, 10, 200, '#c8fff0') + R(0, 0, 400, 240, c.rg([[0, TEAL, 0], [0.7, '#000', 0.14], [1, '#000', 0.55]])); }
  var SCENES = {
    archive_stacks: function (c) {
      var o = R(0, 0, 400, 240, '#07141c');
      o += brickWall(c, 0, 0, 400, 124, '#22404a', 4101, 14);
      o += R(0, 0, 400, 124, c.lg([[0, '#03080c', 0.88], [0.6, '#03080c', 0.4], [1, TEAL, 0.08]]));
      // the far arch at the end of the stacks, lit from the surface
      o += P(elfArch(146, 124, 108, 116), c.cel(STONE), 2) + P(elfArch(156, 124, 88, 104), c.lg([[0, '#08222c'], [0.6, '#0e4650'], [1, '#2a8a86']]), 1.6);
      o += aShelf(c, 166, 124, 26, 60, 4102) + aShelf(c, 208, 124, 26, 60, 4103) + R(156, 60, 88, 64, c.lg([[0, '#0e4650', 0.1], [1, '#2a8a86', 0.45]]));
      o += P(moonR(200, 18, 7, 0.45), c.cel(GOLD), 1.3);
      o += shaftL(c, 200, 50, 200, 170, 170, '#cffff0', 0.2);
      // mid stacks and the towering side stacks
      o += aShelf(c, 112, 124, 30, 98, 4104) + aShelf(c, 258, 124, 30, 98, 4105);
      o += aShelf(c, 2, 124, 96, 140, 4106) + aShelf(c, 302, 124, 96, 140, 4107);
      o += ladder(c, 70, 124, 96);
      o += coral(c, 104, 124, 0.9, CORAL, 4108, -0.2) + coral(c, 296, 124, 0.8, CORALP, 4109, 0.2) + coral(c, 150, 124, 0.5, CORALO, 4118) + knobs(c, 262, 126, 0.8, '#c8805a');
      o += coral(c, 20, 18, 0.55, CORALP, 4119, 0.5) + coral(c, 380, 30, 0.6, CORAL, 4120, -0.5) + knobs(c, 312, 16, 0.7, '#b8706a');
      o += floorWater(c, 4110);
      o += pool(c, 200, 146, 86, 10) + pool(c, 96, 190, 64, 11) + pool(c, 318, 206, 76, 13);
      o += bookPile(c, 148, 136, 0.85, 4111) + bookPile(c, 44, 222, 1.1, 4112) + page(c, 236, 140, 0.2, 1) + page(c, 180, 226, -0.3, 1.2);
      o += coral(c, 8, 206, 1.1, CORAL, 4113, 0.2) + knobs(c, 24, 214, 1, '#c8705a') + coral(c, 394, 214, 1.1, CORALP, 4114, -0.2);
      o += pages(c, 4115, 7, 20, 380, 20, 110, 1) + inkCloud(c, 150, 64, 1, 4116) + inkCloud(c, 332, 44, 0.8, 4117);
      return o + finish(c, 4121);
    },
    archive_hall: function (c) {
      var o = R(0, 0, 400, 240, '#061218');
      // the dome: ribs converging overhead, a band of gold crescents
      o += P('M-10,124 L-10,40 Q200,-100 410,40 L410,124 Z', c.lg([[0, '#0a2832'], [1, '#143a44']]), 0);
      var rb = '';
      [-60, 20, 100, 170, 230, 300, 380, 460].forEach(function (x) { rb += 'M200,-60 Q' + n((200 + x) / 2) + ',' + n(10) + ' ' + n(x) + ',84'; });
      o += L(rb, OL, 5.4) + L(rb, '#2e5a62', 3.2) + L(rb, GOLDD, 0.9, 0.8);
      o += L('M-10,30 Q200,-44 410,30', OL, 4.6) + L('M-10,30 Q200,-44 410,30', GOLDD, 2.4);
      [[40, 16], [110, 3], [290, 3], [360, 16]].forEach(function (p) { o += P(moonU(p[0], p[1], 5, 0.45), c.cel(GOLD), 1.1); });
      o += R(0, 84, 400, 40, c.lg([[0, STONED], [1, '#1a2e34']])) + L('M0,84 L400,84', OL, 2) + L('M0,86.5 L400,86.5', GOLD, 1, 0.7);
      o += seaWindow(c, 200, 62, 49);
      o += shaftL(c, 200, 100, 200, 220, 200, '#bff8ec', 0.1);
      o += aShelf(c, 30, 124, 72, 50, 4201) + aShelf(c, 298, 124, 72, 50, 4202);
      o += column(c, 114, 124, 16, 112) + column(c, 270, 124, 16, 112) + column(c, 4, 124, 12, 104) + column(c, 384, 124, 12, 104);
      o += coral(c, 112, 124, 0.7, CORAL, 4204, -0.3) + coral(c, 288, 124, 0.62, CORALP, 4205, 0.3) + knobs(c, 132, 124, 0.6, '#c8805a') + coral(c, 16, 60, 0.45, CORALO, 4206, 0.6) + coral(c, 384, 70, 0.45, CORAL, 4207, -0.6);
      o += kelp(c, 262, 124, 40, '#2a6a4a', 4208) + kelp(c, 138, 124, 34, '#2a6a4a', 4209);
      o += floorWater(c, 4203);
      o += F('M150,124 L250,124 L330,240 L70,240 Z', c.lg([[0, TEALL, 0.16], [1, TEALL, 0]]));
      o += pool(c, 200, 150, 70, 9) + pool(c, 120, 206, 72, 12) + pool(c, 320, 188, 56, 10);
      o += lectern(c, 152, 138, 0.9) + lectern(c, 64, 152, 1.05) + bookPile(c, 344, 138, 0.8, 4210);
      o += coral(c, 10, 214, 1.1, CORALP, 4211, 0.2) + coral(c, 392, 210, 1.1, CORAL, 4212, -0.2) + knobs(c, 378, 222, 1, '#b8706a');
      o += pages(c, 4213, 8, 20, 380, 10, 120, 1) + inkCloud(c, 330, 40, 0.9, 4214) + inkCloud(c, 70, 50, 0.7, 4215);
      return o + finish(c, 4216);
    },
    archive_sanctum: function (c) {
      var o = R(0, 0, 400, 240, '#070f18');
      o += brickWall(c, 0, 0, 400, 124, '#243a48', 4301, 14);
      o += R(0, 0, 400, 124, c.lg([[0, '#03070c', 0.85], [0.6, '#03070c', 0.35], [1, TEAL, 0.06]]));
      // shelf niches on both sides
      o += P(elfArch(6, 124, 104, 118), c.cel(STONE), 2) + aShelf(c, 16, 124, 84, 100, 4302);
      o += P(elfArch(290, 124, 104, 118), c.cel(STONE), 2) + aShelf(c, 300, 124, 84, 100, 4303);
      o += column(c, 118, 124, 12, 104) + column(c, 270, 124, 12, 104);
      // the moon behind the dais, the ink rising from the great book around it
      o += C(200, 52, 84, glow(c, '#ffe6a8', 0.32)) + C(200, 52, 44, c.rg([[0, '#fbf6e4'], [0.7, '#d4e2d6'], [1, '#86a8a0']]), 2) + F(moonR(214, 52, 40, 0.6), '#5a8a86', 0.45) + hollow(200, 52, 49, GOLD, 2, 0.9);
      o += inkRibbon(c, [[176, 96], [146, 74], [146, 34], [174, 8], [214, 2], [246, 16], [240, 34], [226, 28]], 11, 2) + inkRibbon(c, [[226, 96], [256, 80], [262, 50], [252, 30], [238, 36]], 9, 1.6);
      o += lantern(c, 142, 18, 1) + lantern(c, 258, 18, 1) + L('M142,0 L142,18 M258,0 L258,18', OL, 1.6);
      o += floorWater(c, 4304);
      o += L(ellD(200, 160, 150, 22), GOLD, 1.4, 0.6) + L(ellD(200, 160, 120, 17), GOLD, 1, 0.45);
      // the dais
      o += E(200, 138, 92, 13, c.cel(STONED), 2) + E(200, 131, 78, 10.5, c.cel(STONE), 2) + E(200, 125, 64, 8.5, c.cel(STONEL), 2) + L('M122,131 Q200,146 278,131', GOLD, 1.2, 0.8);
      o += P('M170,124 L230,124 L222,108 L178,108 Z', c.cel(CASE), 1.8) + L('M176,116 L224,116', GOLD, 1.2);
      o += bigBook(c, 200, 108, 1);
      o += inkRibbon(c, [[182, 88], [175, 74], [184, 62], [177, 48], [186, 34]], 7, 0.8) + inkRibbon(c, [[214, 86], [222, 72], [215, 60], [223, 46]], 5, 0.8) + C(160, 60, 1.8, INK, 1) + C(236, 40, 1.6, INK, 1);
      o += quill(c, [226, 90], [270, 18], 12, 0.3);
      o += inkwell(c, 152, 126, 1) + C(248, 128, 6, glow(c, TEAL, 0.5)) + barn(250, 124, 2) + coral(c, 256, 128, 0.5, CORAL, 4305, 0.3);
      o += inkPool(c, 116, 184, 40, 7) + inkPool(c, 300, 214, 50, 9) + pool(c, 60, 208, 50, 9);
      o += coral(c, 8, 210, 1.1, CORAL, 4306, 0.2) + coral(c, 394, 206, 1, CORALP, 4307, -0.2) + knobs(c, 22, 222, 0.9, '#b8706a');
      o += pages(c, 4308, 9, 20, 380, 10, 120, 1) + inkCloud(c, 90, 60, 0.8, 4309) + inkCloud(c, 330, 90, 0.8, 4310);
      return o + finish(c, 4311);
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- head (facing left; copy of art_scholomance.js hHead, with longer ears, bigger spectacles and outlined brows) ----
  function hHead(c, x, y, o) {
    var sk = o.skin || '#d8c8b8', s = '', tp = o.tall || 0, ch = o.chin || 0, hc = o.hairCol || '#2a1e18', el = o.earL || 0;
    if (o.backHair) s += o.backHair(c, x, y);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 9, y - 15 - tp]) + ' ' + pt([x + 8, y - 17 - tp]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13 + ch]) + ' ' + pt([x - 4, y + 12 + ch]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    var sh = F('M' + pt([x + 3, y - 20 - tp]) + 'L' + pt([x + 14, y - 20 - tp]) + 'L' + pt([x + 14, y + 16 + ch]) + 'L' + pt([x + 1, y + 16 + ch]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 20 - tp]) + 'Z', dk(sk, 0.22), 0.8);
    if (o.gaunt) sh += F('M' + pt([x - 8, y + 3]) + 'C' + pt([x - 5, y + 2]) + ' ' + pt([x - 1, y + 3]) + ' ' + pt([x + 2, y + 9]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x - 6, y + 8]) + ' ' + pt([x - 8, y + 3]) + 'Z', dk(sk, 0.3), 0.8) + E(x - 5, y - 1, 3.6, 3, dk(sk, 0.4), 0, 0.85);
    if (o.face) sh += o.face;
    if (o.hair === 'bald') sh += E(x - 1, y - 11 - tp, 4.4, 2.2, lt(sk, 0.35), 0, 0.7);
    s += body(c, d, sk, sh, 2);
    if (o.pointEar) s += P(pd([[x + 3, y - 1], [x + 16 + el, y - 7 - el * 0.8], [x + 7, y + 5]], true), c.cel(sk), 1.4);
    else if (o.hair !== 'none' && !o.elfEar) s += E(x + 5, y + 1, 2.4, 3.4, c.cel(sk), 1.4);
    if (o.socket) s += E(x - 5, y - 1.4, 3.2, 2.3, '#082222');
    s += o.glowEye ? glowEye(c, x - 5, y - 1, 1.5, o.eye) : C(x - 5, y - 1, 1.6, o.eye || OL);
    var bw = 'M' + pt([x - 8.5, y - 5]) + 'L' + pt([x - 2, y - 4.4 - (o.arch || 0)]);
    s += o.browW ? L(bw, OL, o.browW + 1.6) + L(bw, o.brow || HAIR, o.browW) : L(bw, o.brow || dk(sk, 0.55), 1.6);
    if (o.lips) s += P('M' + pt([x - 9.4, y + 7]) + 'q3.4,-1.2 6.4,0.2 q-3,2.4 -6.4,-0.2 Z', o.lips, 1);
    else s += L('M' + pt([x - 8.6, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    if (o.hair === 'cap') s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 2]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.8);
    if (o.elfEar) s += elfEar(c, x, y, sk);
    if (o.specs) s += ring(x - 6, y - 0.8, 3.9, 3.6, GOLD, 1.1) + L('M' + pt([x - 2.2, y - 1.4]) + 'L' + pt([x + 5, y - 2.6]), GOLD, 1.1) + C(x - 7.4, y - 2.2, 1, '#ffffff', 0, 0.9);
    if (o.top) s += o.top(c, x, y);
    return s;
  }
  // long swept ear with ridges and a pearl stud (the Tidebound ear of art_tidewatch.js)
  function elfEar(c, x, y, sk) {
    var ear = 'M' + pt([x + 4, y - 2]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x + 26, y - 18]) + ' ' + pt([x + 34, y - 26]) + 'C' + pt([x + 28, y - 16]) + ' ' + pt([x + 22, y - 8]) + ' ' + pt([x + 8, y + 5]) + 'Z';
    return body(c, ear, sk, L('M' + pt([x + 11, y - 3]) + 'l6,-3 M' + pt([x + 16, y - 7]) + 'l6,-4 M' + pt([x + 21, y - 11]) + 'l6,-5', dk(sk, 0.32), 0.8), 1.4) + C(x + 8, y + 6, 1.8, c.cel(PEARL), 0.7);
  }
  // floating drowned hair: one mass drifting back from b, with finer strands fanning over it
  function hairFloat(c, b, o) {
    var r = rng(o.seed || 17), len = o.len || 28, a = o.a0 == null ? -0.2 : o.a0, w = o.hw || 15, px = -Math.sin(a), py = Math.cos(a), s = '', k = o.strands || 4;
    function line(off, L0, da, w0, w1, wv) {
      var c2 = Math.cos(a + da), s2 = Math.sin(a + da), q = [b[0] + px * off, b[1] + py * off];
      return taper([q, [q[0] + c2 * L0 * 0.35 + px * wv, q[1] + s2 * L0 * 0.35 + py * wv], [q[0] + c2 * L0 * 0.7 - px * wv, q[1] + s2 * L0 * 0.7 - py * wv], [q[0] + c2 * L0 + px * wv * 0.5, q[1] + s2 * L0 + py * wv * 0.5]], w0, w1, 6);
    }
    var M = line(0, len, 0, w, 3, 3.4);
    s += P(M.d, c.cel(HAIR), 1.5) + L(along(M, 0.3) + along(M, 0.68), '#b0d4d0', 0.9, 0.9);
    for (var i = 0; i < k; i++) {
      var f = k > 1 ? i / (k - 1) - 0.5 : 0, T = line(f * w * 1.15, len * (0.85 + r() * 0.35), f * 0.45 + (r() - 0.5) * 0.12, 3.6, 0.5, 2.6 + r() * 2.4);
      s += P(T.d, c.cel(i % 2 ? '#d0eae8' : HAIR), 1.1);
    }
    return s;
  }
  // drowned Starborn head: sea-green skin, teal eyes, long ears, gill lines, a pearl earring, floating white hair
  function eHead(c, x, y, o) {
    var sk = o.skin || SKIN;
    return hHead(c, x, y, {
      skin: sk, hair: o.hair || 'cap', hairCol: HAIR, eye: EYE, glowEye: true, elfEar: true, socket: true,
      brow: o.brow, browW: o.browW, arch: o.arch, lips: o.lips, specs: o.specs, gaunt: o.gaunt, tall: o.tall, chin: o.chin,
      backHair: function (c, x, y) { return o.float === false ? '' : hairFloat(c, [x + 6, y - 6], o); },
      face: L('M' + pt([x + 2, y + 7]) + 'q2.4,2 1.4,4.6 M' + pt([x + 5, y + 6]) + 'q2.4,2 1.4,4.6 M' + pt([x + 8, y + 4.6]) + 'q2.4,2 1.4,4.6', dk(sk, 0.45), 1) + C(x - 2, y - 9, 0.9, lt(sk, 0.4), 0, 0.8) + C(x + 1, y - 7, 0.7, lt(sk, 0.4), 0, 0.8),
      top: o.top
    });
  }
  // ---- robe rig (facing left): the biped with no legs and a floor-length skirt over shoe tips ----
  function robeSkirt(c, o) {
    var w0 = o.waist || [48, 80], fl = o.flare || [34, 94], y0 = o.skirtY || 84, rb = o.skirt || o.robe, mid = (w0[0] + w0[1]) / 2, s = '';
    s += E(fl[0] + 8, 121, 7, 2.8, c.cel(o.shoe || '#221a18'), 1.6) + E(fl[0] + 28, 121.4, 7, 2.8, c.cel(o.shoe || '#221a18'), 1.6);
    var d = 'M' + pt([w0[0], y0]) + 'L' + pt([w0[1], y0]) + 'C' + pt([w0[1] + 4, y0 + 14]) + ' ' + pt([fl[1] - 4, 110]) + ' ' + pt([fl[1], 120]) + 'L' + pt([fl[0], 120]) + 'C' + pt([fl[0] + 4, 110]) + ' ' + pt([w0[0] - 4, y0 + 14]) + ' ' + pt([w0[0], y0]) + 'Z';
    var sh = F(pd([[mid + 8, y0 - 2], [fl[1] + 4, y0 - 2], [fl[1] + 4, 124], [(fl[0] + fl[1]) / 2 + 12, 124]], true), dk(rb, 0.3), 0.8) +
      L('M' + pt([mid - 6, y0 + 4]) + 'L' + pt([fl[0] + 14, 116]) + 'M' + pt([mid + 7, y0 + 4]) + 'L' + pt([fl[1] - 14, 116]), dk(rb, 0.35), 1.1);
    if (o.panel) sh += P(pd([[mid - 7, y0], [mid + 7, y0], [mid + 10, 121], [mid - 12, 121]], true), c.cel(o.panel), 1.4) + (o.trim ? L('M' + pt([mid - 7, y0 + 1]) + 'L' + pt([mid - 11, 120]) + 'M' + pt([mid + 7, y0 + 1]) + 'L' + pt([mid + 9, 120]), o.trim, 1.2, 0.9) : '') + (o.panelX ? o.panelX(c, mid, y0) : '');
    sh += L('M' + pt([fl[0] + 1, 117.4]) + 'L' + pt([fl[1] - 1, 117.4]), o.hem || dk(rb, 0.4), 2.4);
    s += body(c, d, rb, sh, 2.2);
    if (o.rope) { var rp = 'M' + pt([w0[0], y0 + 1]) + 'Q' + pt([mid, y0 + 4]) + ' ' + pt([w0[1], y0 + 1]); s += L(rp, OL, 4.4) + L(rp, o.rope, 2.6) + limb('M' + pt([mid - 6, y0 + 3]) + 'L' + pt([mid - 8, y0 + 18]), o.rope, 1.6) + C(mid - 6, y0 + 3, 2.4, c.cel(o.rope), 1.2); }
    if (o.sash) s += P(pd([[w0[0], y0 - 3], [w0[1], y0 - 3], [w0[1], y0 + 3], [w0[0], y0 + 3]], true), c.cel(o.sash), 1.8);
    return s;
  }
  function robeRig(c, o) {
    return biped(c, {
      skin: o.skin, shirt: o.robe, sleeve: o.sleeve || o.robe, forearm: o.forearm, glove: o.glove || o.skin, noLegs: true, hipY: 86, shadowR: o.shadowR || 32,
      torsoD: o.torsoD, hx: o.hx, hy: o.hy, neck: o.neck, neckCol: o.neckCol, armW: o.armW, shadow: o.shadow,
      back: o.back, chest: o.chest, pads: o.pads, top: o.top,
      front: function (c) { return robeSkirt(c, o) + (o.front ? o.front(c) : ''); },
      head: o.head, near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf, op: o.op
    });
  }
  // wide bell cuff at the end of a sleeve (p = hand, q = elbow)
  function cuff(c, q, p, col, trim) {
    var dx = p[0] - q[0], dy = p[1] - q[1], d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, m = [p[0] - ux * 5, p[1] - uy * 5], w = 8;
    var sh = pd([[m[0] - uy * 4.4, m[1] + ux * 4.4], [m[0] + uy * 4.4, m[1] - ux * 4.4], [p[0] + uy * w + ux * 1, p[1] - ux * w + uy * 1], [p[0] - uy * w + ux * 1, p[1] + ux * w + uy * 1]], true);
    return P(sh, c.cel(col), 1.8) + (trim ? L('M' + pt([p[0] + uy * w + ux, p[1] - ux * w + uy]) + 'L' + pt([p[0] - uy * w + ux, p[1] + ux * w + uy]), trim, 1.6) : '');
  }
  // ---- props ----
  function spiralD(x, y, r, turns, a0) { var p = [], k = Math.round(turns * 14); for (var i = 0; i <= k; i++) { var t = i / k, a = (a0 || 0) + t * turns * PI * 2, rr = r * (0.15 + 0.85 * t); p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return 'M' + p.map(pt).join('L'); }
  function swirl(c, x, y, r, col) { col = col || TEALL; var d = spiralD(x, y, r, 1.8); return L(d, dk(col, 0.65), 3.4, 0.85) + L(d, col, 1.6); }
  function inkEye(c, x, y, r) {
    return C(x, y, r * 2.2, glow(c, TEAL, 0.7)) + E(x, y, r, r * 0.86, c.rg([[0, '#ffffff'], [0.6, '#d8fff6'], [1, '#6ae8d8']]), 1.8) + C(x - r * 0.18, y, r * 0.56, c.rg([[0, '#fff2b0'], [0.5, GOLD], [1, '#8a5a1a']]), 1.2) +
      E(x - r * 0.18, y, r * 0.14, r * 0.44, OL) + C(x - r * 0.42, y - r * 0.32, r * 0.18, '#ffffff', 0, 0.9);
  }
  function tiara(c, x, y) {
    var band = 'M' + pt([x - 11, y - 9]) + 'Q' + pt([x, y - 15]) + ' ' + pt([x + 11, y - 9]);
    return coral(c, x - 6, y - 11, 0.24, CORAL, 5711, -0.4) + coral(c, x + 1, y - 13, 0.3, CORAL, 5712, 0) + coral(c, x + 8, y - 11, 0.24, CORAL, 5713, 0.4) +
      L(band, OL, 4) + L(band, GOLD, 2.2) + C(x - 6, y - 11, 1.6, PEARL, 0.8) + C(x + 1, y - 12.8, 2, PEARL, 0.8) + C(x + 7.6, y - 11.2, 1.6, PEARL, 0.8);
  }
  function key(c, x, y, ang, s) {
    var q = dirQ([x, y], ang), sh = 'M' + pt(q(3.4 * s, 0)) + 'L' + pt(q(20 * s, 0));
    var bit = pd([q(13 * s, 0), q(13 * s, 5 * s), q(16 * s, 5 * s), q(16 * s, 3 * s), q(19 * s, 3 * s), q(19 * s, 0)], true);
    return L(sh, OL, 2 * s + 2) + L(sh, GOLD, 2 * s) + P(bit, c.cel(GOLD), 1) + ring(x, y, 3.6 * s, 3.6 * s, GOLD, 1.6 * s) + C(x, y, 1.2 * s, TEAL);
  }
  function keyRing(c, p) {
    var o = ring(p[0], p[1] + 5, 5.2, 5.2, GOLD, 1.3);
    for (var i = 0; i < 4; i++) o += key(c, p[0] - 3.4 + i * 2.3, p[1] + 9.4, PI / 2 + (1.5 - i) * 0.34, 0.74);
    return o;
  }
  function tomeA(c, x, y, s) {
    s = s || 1;
    return P(pd([[x - 9 * s, y - 11 * s], [x + 8 * s, y - 12 * s], [x + 9 * s, y + 10 * s], [x - 8 * s, y + 11 * s]], true), c.cel('#1e4a5a'), 1.6) +
      P(pd([[x + 8 * s, y - 12 * s], [x + 11 * s, y - 10 * s], [x + 12 * s, y + 9 * s], [x + 9 * s, y + 10 * s]], true), PAGE, 1.2) + L('M' + pt([x - 6.6 * s, y - 10 * s]) + 'L' + pt([x - 5.6 * s, y + 10 * s]), GOLD, 1.3) +
      P(moonR(x + 1, y, 4.2 * s, 0.5), c.cel(GOLD), 1) + coral(c, x - 7 * s, y + 10 * s, 0.24 * s, CORAL, 5391, -0.7) + barn(x + 5 * s, y - 8 * s, 1.4);
  }
  // halberd whose head is a teal lantern, a crescent blade and a spike
  function lanternHalberd(c, p, len) {
    var t = [p[0], p[1] - len], o = haft(c, p, len - 8, -PI / 2, '#2e4650', 3.4, 118 - p[1]);
    o += R(t[0] - 3, t[1] + 30, 6, 3, c.cel(GOLD), 1) + R(t[0] - 3, p[1] + 26, 6, 3, c.cel(GOLD), 1);
    o += P(moonR(t[0] - 1, t[1] + 16, 13, 0.52), c.lg([[0, '#f4fffc'], [0.6, '#b8d8d4'], [1, '#6a8a8a']], 0, 0, 1, 1), 1.6) + L('M' + pt([t[0] - 2, t[1] + 4]) + 'A13,13 0 0,0 ' + pt([t[0] - 12, t[1] + 12]), '#ffffff', 1, 0.8);
    o += P(pd([[t[0] + 3, t[1] + 16], [t[0] + 13, t[1] + 12], [t[0] + 6, t[1] + 21]], true), c.cel('#b8d8d4'), 1.2);
    o += P(pd([[t[0] - 3, t[1] + 4], [t[0], t[1] - 8], [t[0] + 3, t[1] + 4]], true), c.cel('#d8f0ec'), 1.3);
    return o + lantern(c, t[0], t[1] + 3, 0.8);
  }
  // gnarled driftwood staff with coral knots, a gold crescent cradling a pearl
  function coralStaff(c, p, len) {
    var t = [p[0], p[1] - len], sh = 'M' + pt([p[0] + 1, 118]) + 'C' + pt([p[0] - 3, p[1] - 8]) + ' ' + pt([p[0] + 3, t[1] + 30]) + ' ' + pt([t[0], t[1] + 8]), o = '';
    o += L(sh, OL, 7.4) + L(sh, '#8a7a62', 4) + L(sh, '#bcae90', 1.2, 0.7);
    o += coral(c, t[0] + 2, t[1] + 30, 0.3, CORAL, 5691, 0.9) + barn(p[0] + 1, p[1] - 22, 1.6) + barn(p[0] - 1, p[1] + 20, 1.8);
    return o + C(t[0], t[1], 17, glow(c, TEAL, 0.75)) + P(moonU(t[0], t[1] + 3, 10, 0.5), c.cel(GOLD), 1.5) + C(t[0], t[1] - 1, 4.8, c.rg([[0, '#ffffff'], [0.6, PEARL], [1, '#a8c8c0']]), 1.4);
  }
  function floatBook(c, x, y) {
    return C(x, y, 22, glow(c, '#ffe6a0', 0.75)) + openBookA(c, x, y + 4, 1.25, '#ffd870') + page(c, x - 12, y - 12, -0.5, 0.9) + page(c, x + 8, y - 18, 0.4, 0.8) +
      L('M' + pt([x - 8, y + 10]) + 'q2,6 -1,10 M' + pt([x + 6, y + 10]) + 'q-2,6 1,10', '#ffe6a0', 1.2, 0.6);
  }
  function beard(c, x, y) {
    var d = 'M' + pt([x - 11, y + 3]) + 'C' + pt([x - 13, y + 16]) + ' ' + pt([x - 9, y + 30]) + ' ' + pt([x - 3, y + 42]) + 'C' + pt([x + 1, y + 50]) + ' ' + pt([x + 9, y + 54]) + ' ' + pt([x + 17, y + 55]) + 'C' + pt([x + 10, y + 48]) + ' ' + pt([x + 8, y + 36]) + ' ' + pt([x + 8, y + 22]) + 'C' + pt([x + 8, y + 14]) + ' ' + pt([x + 6, y + 8]) + ' ' + pt([x + 4, y + 4]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x - 7, y + 8]) + ' ' + pt([x - 11, y + 3]) + 'Z';
    var st = 'M' + pt([x - 7, y + 10]) + 'C' + pt([x - 7, y + 24]) + ' ' + pt([x - 2, y + 36]) + ' ' + pt([x + 8, y + 50]) + 'M' + pt([x, y + 10]) + 'C' + pt([x + 1, y + 24]) + ' ' + pt([x + 3, y + 34]) + ' ' + pt([x + 9, y + 44]);
    return body(c, d, HAIR, L(st, '#a8ccc8', 1.1), 1.8) + P('M' + pt([x - 10, y + 5]) + 'C' + pt([x - 7, y + 3]) + ' ' + pt([x - 3, y + 4]) + ' ' + pt([x - 1, y + 6]) + 'C' + pt([x - 5, y + 9]) + ' ' + pt([x - 12, y + 11]) + ' ' + pt([x - 16, y + 9]) + 'Z', c.cel(HAIR), 1.2) + C(x + 2, y + 30, 1.8, PEARL, 0.8) + C(x + 6, y + 40, 1.6, CORAL, 0.8);
  }
  // Vessaria's gown: teal water at the waist darkening to ink at the hem, curls of current, drips
  function vSkirt(c) {
    var d = 'M52,84 L76,84 C84,96 96,106 108,114 C102,116 98,121 90,120 C84,124 76,118 70,122 C63,124 58,118 50,122 C43,124 37,118 30,120 C26,118 24,116 19,116 C30,106 44,96 52,84 Z';
    var sh = F('M68,80 L112,80 L112,126 L76,126 C80,104 76,92 68,80 Z', '#000', 0.25) + L(spiralD(44, 106, 6, 1.4, 2) + spiralD(86, 108, 5, 1.4, 1), TEALL, 1.2, 0.75) +
      L('M56,90 C50,100 42,108 34,114 M70,90 C78,100 88,108 98,112 M63,92 L63,114', '#4ac8c0', 1.1, 0.6);
    var o = P(d, c.lg([[0, '#1e8a8a'], [0.4, '#16506a'], [0.78, '#1c1844'], [1, INK]]), 2.2) + '<g clip-path="url(#' + c.clip(d) + ')">' + sh + '</g>';
    o += L('M30,120 q-1,3 0,5 M50,122 q1,3 -1,4 M90,120 q1,3 0,5', INK, 2.2) + C(24, 124, 1.6, INK) + C(100, 124, 1.8, INK);
    return o + P(pd([[51, 82], [77, 82], [77, 88], [51, 88]], true), c.cel(GOLD), 1.6) + C(64, 85, 2.4, PEARL, 1);
  }
  // quill-staff: a quill as tall as she is, nib to the floor, ink dripping into a pool
  function quillStaff(c, p) {
    var tip = [p[0] - 2, 119];
    return inkPool(c, tip[0] - 1, 121.4, 11, 2.6) + quill(c, tip, [p[0] + 7, 8], 14, 0.46, ['#ffffff', '#6ad8d0']) + C(tip[0] - 1, 116, 1.6, INK);
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  // rounded keeper's helm crowned with an upturned gold crescent; the ears pass through slots
  function helmHead(c, x, y) {
    var hm = '#b4d2ce', s = hairFloat(c, [x + 12, y + 2], { len: 22, strands: 3, hw: 10, seed: 5102, a0: 0.35 });
    s += hHead(c, x, y, { skin: SKIN, hair: 'none', eye: EYE, glowEye: true, socket: true, face: L('M' + pt([x + 2, y + 7]) + 'q2.4,2 1.4,4.6 M' + pt([x + 5, y + 6]) + 'q2.4,2 1.4,4.6', dk(SKIN, 0.45), 1) });
    s += P(moonU(x + 1, y - 21, 11, 0.5), c.cel(GOLD), 1.6) + C(x + 1, y - 19, 2.4, c.cel(PEARL), 1);
    var hd = 'M' + pt([x - 11, y - 2]) + 'C' + pt([x - 13, y - 19]) + ' ' + pt([x + 10, y - 23]) + ' ' + pt([x + 13, y - 6]) + 'L' + pt([x + 13, y + 10]) + 'C' + pt([x + 9, y + 13]) + ' ' + pt([x + 6, y + 9]) + ' ' + pt([x + 5, y + 2]) + 'L' + pt([x - 1, y - 5]) + 'L' + pt([x - 11, y - 1]) + 'Z';
    s += body(c, hd, hm, F(pd([[x + 4, y - 24], [x + 18, y - 24], [x + 18, y + 14], [x + 6, y + 14]], true), dk(hm, 0.3), 0.8) + L('M' + pt([x - 8, y - 14]) + 'C' + pt([x - 2, y - 19]) + ' ' + pt([x + 6, y - 19]) + ' ' + pt([x + 10, y - 14]), '#ffffff', 1.1, 0.7), 1.8);
    s += L('M' + pt([x - 11, y - 2]) + 'L' + pt([x - 1, y - 5]) + 'L' + pt([x + 5, y + 2]), GOLD, 1.5) + L('M' + pt([x - 12, y - 8]) + 'C' + pt([x - 4, y - 12]) + ' ' + pt([x + 6, y - 12]) + ' ' + pt([x + 13, y - 7]), GOLD, 1.3) + barn(x + 9, y - 16, 1.6) + barn(x + 11, y + 4, 1.3);
    return s + elfEar(c, x, y, SKIN);
  }
  // pole with a hooked crook at the top: a lantern hangs from the hook, an axe blade and a spike on the far side
  function lanternHalberd(c, p, len) {
    var t = [p[0], p[1] - len], o = haft(c, p, len, -PI / 2, '#2e4650', 3.4, 118 - p[1]);
    var hk = 'M' + pt([t[0], t[1] + 2]) + 'C' + pt([t[0], t[1] - 10]) + ' ' + pt([t[0] - 18, t[1] - 10]) + ' ' + pt([t[0] - 18, t[1] + 4]);
    o += L(hk, OL, 6.4) + L(hk, '#b8d8d4', 3.2) + L(hk, '#ffffff', 1, 0.6) + C(t[0] - 18, t[1] + 5, 2, c.cel(GOLD), 1);
    o += P(pd([[t[0] + 2, t[1] + 6], [t[0] + 14, t[1] + 2], [t[0] + 16, t[1] + 18], [t[0] + 2, t[1] + 16]], true), c.lg([[0, '#f4fffc'], [0.6, '#b8d8d4'], [1, '#6a8a8a']], 0, 0, 1, 1), 1.5) + L('M' + pt([t[0] + 14, t[1] + 3]) + 'L' + pt([t[0] + 16, t[1] + 17]), '#ffffff', 1, 0.8);
    o += R(t[0] - 3, t[1] + 20, 6, 3, c.cel(GOLD), 1) + R(t[0] - 3, p[1] + 26, 6, 3, c.cel(GOLD), 1);
    o += L('M' + pt([t[0] - 18, t[1] + 6]) + 'L' + pt([t[0] - 18, t[1] + 12]), OL, 1.6);
    return o + lantern(c, t[0] - 18, t[1] + 12, 0.85);
  }
  var MOBS = {
    archive_wardkeeper: function (c) {
      var ar = '#8cb8b4', arl = '#bcdcd8', tab = '#1c2e52';
      return biped(c, {
        skin: SKIN, shirt: ar, sleeve: dk(ar, 0.12), pants: '#1e3048', boots: '#4a6a70', glove: arl, belt: '#23282e', buckle: GOLD, armW: 9,
        shins: function (c) { return E(71, 103, 6.4, 5, c.cel(arl), 1.6) + E(53, 103, 6.4, 5, c.cel(arl), 1.6) + L('M68,103 l6,0 M50,103 l6,0', GOLD, 1) + barn(55, 110, 1.8) + barn(74, 112, 1.4); },
        chest: function (c) { return L('M47,52 Q64,64 81,52', GOLD, 1.6) + P(pd([[57, 58], [71, 58], [71, 90], [57, 90]], true), c.cel(tab), 1.4) + P(moonR(64, 70, 5.4, 0.5), c.cel(GOLD), 1.1) + barn(76, 66, 2) + barn(78, 72, 1.4); },
        front: function (c) { var d = 'M48,84 L80,84 L84,108 L74,106 L66,110 L58,106 L46,108 Z'; return body(c, d, tab, F('M68,80 L90,80 L90,112 L70,112 C72,100 70,90 68,80 Z', '#000', 0.3) + L('M64,86 L66,108', '#000', 1, 0.4), 1.8) + L('M47,106 L58,104 L66,108 L74,104 L83,106', GOLD, 1.3) + P(moonU(64, 96, 4, 0.5), c.cel(GOLD), 1); },
        pads: function (c) { return pauldron(c, 80, 50, 8, arl, GOLD) + pauldron(c, 49, 51, 10, arl, GOLD) + knobs(c, 46, 47, 0.32, '#e07a6a') + barn(44, 50, 1.8) + barn(53, 47, 1.3); },
        head: function (c, x, y) { return helmHead(c, x, y); },
        near: [[48, 54], [40, 68], [34, 76]], wNear: function (c, p) { return lanternHalberd(c, p, 60); },
        far: [[80, 54], [88, 70], [90, 84]]
      });
    },
    inkbound_wisp: function (c) {
      var cx = 62, cy = 58, o = E(64, 121, 20, 4.5, c.rg([[0, '#000', 0.4], [1, '#000', 0]]));
      o += C(cx, cy, 54, glow(c, '#6a5ae0', 0.32)) + C(cx - 6, cy - 2, 30, glow(c, TEAL, 0.35));
      o += inkRibbon(c, [[cx + 12, cy + 12], [cx + 26, cy + 24], [cx + 28, cy + 40], [cx + 40, cy + 50]], 10, 1.2) + inkRibbon(c, [[cx - 4, cy + 18], [cx - 10, cy + 32], [cx - 2, cy + 44], [cx - 8, cy + 56]], 9, 1) +
        inkRibbon(c, [[cx + 18, cy - 4], [cx + 32, cy - 12], [cx + 44, cy - 6], [cx + 50, cy - 18]], 8, 1);
      var bd = shag(cx, cy, 27, 25, 9, 0.12, 5201);
      o += P(bd, c.lg([[0, '#4e40a0'], [0.45, INKL], [1, INK]], 0, 0, 0.6, 1), 2.4) + L('M' + pt([cx - 23, cy - 4]) + 'C' + pt([cx - 22, cy - 18]) + ' ' + pt([cx - 8, cy - 26]) + ' ' + pt([cx + 8, cy - 24]), INKS, 2.2, 0.9);
      o += page(c, cx + 18, cy + 12, 0.7, 1.2) + E(cx + 21, cy + 16, 5, 4, INK, 0, 0.95);
      o += inkEye(c, cx - 8, cy - 3, 11);
      o += P('M' + pt([cx - 18, cy + 18]) + 'q-2,8 1,12 q3,-4 3,-10 Z', INK, 1.2) + E(cx - 16, cy + 38, 2.2, 3, INK, 1.2) + C(cx - 32, cy + 26, 2.6, INK, 1.2) + C(cx + 38, cy + 34, 2, INK, 1.2) + C(cx - 26, cy - 30, 2.2, INK, 1.2) + C(cx + 30, cy - 30, 1.6, INK, 1.2);
      return o + bubbles(5202, 5, 20, 110, 20, 100);
    },
    drowned_scholar: function (c) {
      var rb = '#5e4468', sk = SKIN;
      return robeRig(c, {
        robe: rb, sleeve: rb, skin: sk, panel: '#3a2a48', trim: GOLD, hem: GOLD, sash: '#10282e', flare: [34, 94],
        panelX: function (c, m, y0) { return P(moonR(m, y0 + 14, 4.4, 0.5), c.cel(GOLD), 1) + barn(m + 4, y0 + 27, 1.6); },
        chest: function (c) {
          var o = P('M46,49 C54,58 74,58 82,49 L81,57 C72,65 56,65 47,57 Z', c.cel('#4a7a5a'), 1.4) + L('M50,59 Q64,69 78,59', GOLD, 1.2);
          [[52, 61], [57, 63.6], [62, 64.6], [67, 64.2], [72, 62.6]].forEach(function (q) { o += C(q[0], q[1], 1.5, PEARL, 0.7); });
          return o;
        },
        pads: function (c) { return coral(c, 82, 50, 0.36, CORALP, 5301, 0.5) + barn(79, 55, 1.8) + barn(48, 56, 1.6); },
        head: function (c, x, y) { return eHead(c, x, y, { seed: 5302, len: 32, strands: 4, a0: -0.1 }); },
        near: [[48, 54], [44, 66], [42, 72]], nearHand: function (c, p) { return tomeA(c, p[0] + 1, p[1] - 5, 1.05) + hand(p, c.cel(sk)); }, wNearFront: function (c, p) { return cuff(c, [44, 66], [p[0] + 2, p[1] - 2], rb, GOLD); },
        far: [[80, 54], [92, 62], [96, 50]], farHand: function (c, p) { return hand(p, c.cel(sk)) + C(p[0] - 2, p[1] - 12, 13, glow(c, TEAL, 0.75)) + swirl(c, p[0] - 2, p[1] - 12, 6) + page(c, p[0] - 14, p[1] - 22, -0.4, 0.9); }
      });
    },
    curator_ellaris: function (c) {
      var gs = '#bff4e4', coat = '#3a7472', vest = '#1e3e4a';
      var fig = biped(c, {
        skin: gs, shirt: coat, sleeve: coat, glove: gs, noLegs: true, shadow: false, hx: 60, hy: 32, neckCol: gs, armW: 8.6,
        torsoD: 'M48,49 C54,45 74,45 80,49 L80,68 L78,86 L50,86 L48,68 Z',
        chest: function (c) {
          return P(pd([[57, 48], [71, 48], [70, 88], [58, 88]], true), c.cel(vest), 1.3) + C(64, 58, 1.5, PEARL, 0.7) + C(64, 66, 1.5, PEARL, 0.7) + C(64, 74, 1.5, PEARL, 0.7) +
            F(ellD(52, 72, 4, 3), INK, 0.8) + F(ellD(76, 60, 3, 4), INK, 0.7) + C(74, 66, 1.2, INK, 0, 0.8) + L('M58,76 Q64,82 72,78', GOLD, 1.1) + L('M48,50 L58,58 M80,50 L70,58', lt(coat, 0.25), 1.6);
        },
        front: function (c) {
          var d = 'M48,84 L80,84 C86,94 92,104 86,110 C80,116 72,110 66,114 C60,118 62,124 50,122 C42,121 36,117 40,112 C46,112 50,108 48,102 C46,96 44,90 48,84 Z';
          return body(c, d, coat, F('M68,80 L96,80 L96,126 L66,126 C74,104 74,92 68,80 Z', dk(coat, 0.3), 0.8) + L('M52,92 C56,100 54,108 48,114 M66,90 C70,98 74,104 80,108', TEALL, 1.2, 0.7) + L(spiralD(60, 112, 4, 1.3, 1), TEALL, 1, 0.8), 2) +
            P(pd([[50, 82], [78, 82], [78, 88], [50, 88]], true), c.cel('#2a2a30'), 1.6) + key(c, 74, 90, PI / 2 + 0.2, 0.8);
        },
        pads: function (c) { return E(78, 51, 7, 6, c.cel(lt(coat, 0.1)), 1.8) + E(50, 52, 8, 7, c.cel(lt(coat, 0.15)), 1.8); },
        head: function (c, x, y) { return eHead(c, x, y, { skin: gs, specs: true, seed: 5401, len: 24, hw: 12, strands: 3, a0: -0.25, gaunt: true, chin: 2, brow: '#f4fffc', browW: 1.8 }); },
        near: [[50, 54], [42, 66], [34, 58]], nearHand: function (c, p) { return key(c, p[0] - 1, p[1] - 3, -PI / 2 - 0.45, 1.35) + hand(p, c.cel(gs)); },
        far: [[78, 54], [90, 64], [94, 76]], farHand: function (c, p) { return hand(p, c.cel(gs)) + keyRing(c, p); }
      });
      var o = C(64, 66, 62, glow(c, TEAL, 0.34)) + E(64, 121, 30, 5, glow(c, TEAL, 0.5));
      o += G(fig, '', 0.84);
      return o + L(spiralD(18, 70, 6, 1.4) + spiralD(110, 44, 5, 1.4, 2) + spiralD(106, 100, 4, 1.3, 1), TEALL, 1.2, 0.7) + bubbles(5402, 6, 16, 112, 20, 110) + motes(5403, 12, 10, 118, 10, 118, '#e0fff8');
    },
    the_inkbound_horror: function (c) {
      var cx = 66, cy = 70, o = shadow(c, 64, 52);
      o += C(cx, cy, 70, glow(c, '#6a5ae0', 0.3));
      [
        [[cx - 18, cy - 20], [cx - 30, cy - 40], [cx - 46, cy - 46], [cx - 52, cy - 60], [cx - 42, cy - 64]],
        [[cx + 8, cy - 30], [cx + 16, cy - 48], [cx + 34, cy - 56], [cx + 42, cy - 50]],
        [[cx + 28, cy - 12], [cx + 44, cy - 22], [cx + 52, cy - 38], [cx + 46, cy - 48]],
        [[cx + 32, cy + 14], [cx + 46, cy + 16], [cx + 54, cy + 6], [cx + 52, cy - 6]],
        [[cx - 30, cy - 6], [cx - 46, cy - 12], [cx - 54, cy - 26], [cx - 56, cy - 38]]
      ].forEach(function (t) { o += inkRibbon(c, t, 12, 1.4); });
      o += inkPool(c, 64, 118, 58, 7);
      o += P('M' + pt([cx - 52, 120]) + 'C' + pt([cx - 44, 104]) + ' ' + pt([cx - 40, 96]) + ' ' + pt([cx - 34, 88]) + 'L' + pt([cx + 36, 88]) + 'C' + pt([cx + 42, 98]) + ' ' + pt([cx + 46, 108]) + ' ' + pt([cx + 54, 120]) + 'Z', c.lg([[0, INKL], [1, INK]]), 2.2);
      o += P(shag(cx, cy, 42, 38, 11, 0.1, 5501), c.lg([[0, '#4e40a0'], [0.45, INKL], [1, INK]], 0, 0, 0.6, 1), 2.4) + L('M' + pt([cx - 38, cy - 4]) + 'C' + pt([cx - 36, cy - 26]) + ' ' + pt([cx - 16, cy - 40]) + ' ' + pt([cx + 12, cy - 38]), INKS, 2.4, 0.9);
      [[cx - 28, cy - 22, -0.6], [cx + 28, cy - 20, 0.5], [cx + 30, cy + 16, 1.2], [cx - 36, cy + 18, -1.1], [cx + 8, cy + 32, 0.2], [cx - 2, cy - 34, -0.2]].forEach(function (p) {
        var q = dirQ([p[0], p[1]], p[2]), b = q(5, 0);
        o += page(c, p[0], p[1], p[2], 1.35) + E(b[0], b[1], 4.6, 5.2, INK, 0, 0.95);
      });
      var mw = 'M' + pt([cx - 28, cy + 8]) + 'C' + pt([cx - 18, cy + 3]) + ' ' + pt([cx + 2, cy + 3]) + ' ' + pt([cx + 12, cy + 10]) + 'C' + pt([cx + 4, cy + 26]) + ' ' + pt([cx - 18, cy + 26]) + ' ' + pt([cx - 28, cy + 8]) + 'Z', th = '';
      for (var i = 0; i < 6; i++) { var u = cx - 24 + i * 6; th += 'M' + pt([u, cy + 6 - (i === 0 ? -1 : 0)]) + 'L' + pt([u + 3, cy + 12]) + 'L' + pt([u + 6, cy + 5.4]) + 'Z'; if (i < 5) th += 'M' + pt([u + 2, cy + 22 - Math.abs(i - 2) * 1.2]) + 'L' + pt([u + 5, cy + 16]) + 'L' + pt([u + 8, cy + 22 - Math.abs(i - 1.6) * 1.2]) + 'Z'; }
      o += P(mw, c.rg([[0, '#8afff0'], [0.5, TEALD], [1, '#05161a']]), 2) + '<g clip-path="url(#' + c.clip(mw) + ')">' + P(th, PAGE, 0.9) + '</g>';
      o += inkEye(c, cx - 16, cy - 14, 8.5) + inkEye(c, cx + 10, cy - 22, 5.4) + inkEye(c, cx + 24, cy - 4, 4.4) + inkEye(c, cx - 33, cy - 2, 3.8);
      o += inkRibbon(c, [[cx - 30, cy + 26], [cx - 44, cy + 38], [cx - 56, cy + 44], [cx - 58, cy + 32]], 11, 1.4) + inkRibbon(c, [[cx + 22, cy + 34], [cx + 34, cy + 46], [cx + 46, cy + 48], [cx + 50, cy + 40]], 10, 1.4);
      return o + C(cx - 46, cy - 50, 2.4, INK, 1.2) + C(cx + 50, cy - 56, 2, INK, 1.2) + C(cx + 56, cy + 30, 2.2, INK, 1.2) + bubbles(5502, 5, 10, 118, 10, 60);
    },
    lorekeeper_nerathil: function (c) {
      var rb = '#22385c', sk = '#98c8b8', mant = '#3a6a4e';
      return robeRig(c, {
        robe: rb, sleeve: rb, skin: sk, panel: '#152646', trim: GOLD, hem: GOLD, sash: '#101c30', flare: [30, 96], hx: 57, hy: 34, shadowR: 34,
        panelX: function (c, m, y0) { return P(moonR(m, y0 + 12, 4.4, 0.5), c.cel(GOLD), 1) + P(moonR(m, y0 + 24, 3.4, 0.5), c.cel(GOLD), 1); },
        back: function (c) { return body(c, 'M52,46 C62,42 80,44 88,52 C96,70 100,94 106,116 L98,112 L92,118 L86,110 L80,116 L76,100 C74,80 68,60 52,46 Z', mant, L('M84,60 C88,78 92,96 96,112 M78,60 C82,80 84,96 86,108', dk(mant, 0.35), 1.2), 2) + kelp(c, 100, 118, 26, '#2a5a3a', 5603); },
        chest: function (c) { return L('M48,50 L64,62 L80,50', GOLD, 1.4) + P(pd([[58, 62], [70, 62], [69, 86], [59, 86]], true), c.cel('#152646'), 1.3) + barn(74, 58, 1.8) + barn(77, 63, 1.3); },
        pads: function (c) { return E(79, 51, 7.4, 6.2, c.cel(mant), 1.8) + coral(c, 84, 50, 0.3, CORALO, 5601, 0.5) + E(49, 52, 8.6, 7, c.cel(mant), 1.8) + barn(47, 50, 1.8) + barn(52, 48, 1.2); },
        head: function (c, x, y) {
          return eHead(c, x, y, { skin: sk, hair: 'bald', seed: 5602, len: 34, hw: 14, strands: 4, a0: 0.25, gaunt: true, tall: 2, brow: '#f4fffc', browW: 2.6, arch: -1.4,
            top: function (c, x, y) { var band = 'M' + pt([x - 10, y - 9]) + 'Q' + pt([x, y - 14]) + ' ' + pt([x + 11, y - 9]); return beard(c, x, y) + L(band, OL, 3.4) + L(band, GOLD, 1.8) + C(x - 4, y - 11.6, 2, PEARL, 0.8); } });
        },
        near: [[48, 54], [40, 66], [34, 70]], wNear: function (c, p) { return coralStaff(c, p, 56); }, wNearFront: function (c, p) { return cuff(c, [40, 66], p, rb, GOLD); },
        far: [[80, 54], [94, 58], [100, 48]], farHand: function (c, p) { return hand(p, c.cel(sk)) + floatBook(c, p[0] - 4, p[1] - 18); }
      });
    },
    lady_vessaria: function (c) {
      var rb = '#1e7a80', sk = SKIN;
      var o = C(64, 70, 62, glow(c, TEAL, 0.28));
      return o + biped(c, {
        skin: sk, shirt: rb, sleeve: '#1a5a6e', glove: sk, noLegs: true, hipY: 86, shadowR: 40, hx: 60, hy: 33, armW: 8.4,
        torsoD: 'M50,48 C54,44 74,44 78,48 L77,66 L74,86 L54,86 L51,66 Z',
        back: function (c) { var col = 'M52,50 C48,40 52,30 56,24 L62,40 L70,40 C74,30 82,24 88,24 C88,34 84,44 78,50 Z'; return inkRibbon(c, [[80, 96], [96, 110], [110, 117], [122, 114]], 12, 2) + inkRibbon(c, [[74, 100], [88, 116], [104, 121], [114, 121]], 8, 1.4) + P(col, c.lg([[0, INKL], [1, INK]]), 1.8) + L('M56,25 L62,40 M88,25 C88,34 84,44 78,50 M56,25 C52,32 50,40 52,50', GOLD, 1.2, 0.9); },
        chest: function (c) {
          var o = P('M50,48 C56,56 72,56 78,48 L77,54 C72,61 56,61 51,54 Z', c.cel(PEARL), 1.2) + P(moonR(64, 70, 4.6, 0.5), c.cel(GOLD), 1) + L('M56,80 Q64,74 72,80', GOLD, 1.2);
          [[54, 58], [59, 60.6], [64, 61.4], [69, 60.6], [74, 58]].forEach(function (q) { o += C(q[0], q[1], 1.4, '#ffb0a0', 0.7); });
          return o;
        },
        front: function (c) { return vSkirt(c); },
        pads: function (c) { return pauldron(c, 79, 52, 8, '#d8b060', PEARL) + pauldron(c, 49, 53, 10, '#e0b860', PEARL) + P(moonU(49, 46, 7, 0.45), c.cel(GOLD), 1.3) + C(49, 50, 1.8, PEARL, 0.8); },
        head: function (c, x, y) { return eHead(c, x, y, { seed: 5701, len: 42, strands: 5, hw: 19, a0: 0.2, lips: '#4a8a90', arch: 1.4, chin: 1, top: function (c, x, y) { return tiara(c, x, y); } }); },
        near: [[50, 54], [42, 66], [36, 70]], wNear: function (c, p) { return quillStaff(c, p); }, wNearFront: function (c, p) { return cuff(c, [42, 66], p, '#1a5a6e', GOLD); },
        far: [[78, 54], [94, 64], [104, 58]], farHand: function (c, p) { return hand(p, c.cel(sk)) + C(p[0] - 1, p[1] - 11, 17, glow(c, TEAL, 0.8)) + swirl(c, p[0] - 1, p[1] - 11, 7.4) + C(p[0] - 1, p[1] - 11, 2.4, '#ffffff'); },
        tf: at(1.02, 64, 122)
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(TEALD), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, DEEP) + ground(c, 150, STONE, STONED); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#0a2a34"/></svg>'; }
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
