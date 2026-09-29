/* art_brd.js — Cinderpeak Depths art for Realm of Loner (dungeon, levels 51-55: the Slagborn capital deep inside Cinderpeak
 * Mountain; the detention block, Ashforge City with its lava moat and iron kings, and the Imperial Seat before the
 * lava fall; the Slagguard wardens, Ashforge flame keepers and Ragereaver golems, and the bosses High Interrogator
 * Brisa, Lord Stonebrand, Magmagor, General Ashhelm, Golemsmith Kragg, Slagmaw and Emperor Haldor Grimmark).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Cinderpeak Depths keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_zulfarrak.js; the dwarf rig follows
 * art_gnomeregan.js / art_wetlands.js proportions with a new Slagborn head (braided, forked, block and beardless
 * variants). The BRD Slagborns are told apart from the spiked-helm Greenfen and Gearhollow ones by their gear: the
 * warden's kettle hat, the keeper's flame mitre, the general's crested helm, the engineer's lens cap and the crown.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix bd<counter>_).
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
  function Ctx() { this.p = 'bd' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  BLACKROCK DEPTHS: palette
  // ============================================================
  var BAS = '#2c2629', BASM = '#3c3438', BASL = '#564a4c', IRON = '#3c3c44', IRONL = '#686872', IRONX = '#24232a';
  var LAVA = '#ff6a14', LAVAY = '#ffc83a', LAVAD = '#b8260a', EMB = '#ff8a2a', GOLD = '#d8a23a', GOLDD = '#946414';
  var DSK = '#6a6672', DHAIR = '#1e1a1c', RED = '#9a1e14', REDD = '#5e0e0a', SHAD = '#a860ff', BRASS = '#c09040';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  function ring(x, y, rx, ry, col, w) { return L(ellD(x, y, rx, ry), OL, w + 1.8) + L(ellD(x, y, rx, ry), col, w); }
  // a chain from a to b sagging by `sag`: a dark cord with round links on it
  function chainLine(a, b, sag, s, col) {
    s = s || 1; col = col || IRONL;
    var len = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])), k = Math.max(2, Math.round(len / (5 * s))), p = [], o = '';
    for (var i = 0; i <= k; i++) { var t = i / k; p.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
    o += L(pd(p), OL, 3.4 * s) + L(pd(p), dk(col, 0.25), 1.4 * s);
    for (var j = 0; j <= k; j += 2) o += ring(p[j][0], p[j][1], 2.3 * s, 2.9 * s, col, 1.2 * s);
    return o;
  }
  // lava between x0..x1, y0..y1: hot gradient, dark crust rafts, bright ripples, optional glow rising above
  function lava(c, x0, y0, x1, y1, seed, glowH) {
    var r = rng(seed || 11), w = x1 - x0, h = y1 - y0, o = '', rp = '';
    if (glowH) o += R(x0, y0 - glowH, w, glowH, c.lg([[0, LAVA, 0], [1, LAVA, 0.42]]));
    o += R(x0, y0, w, h, c.lg([[0, LAVAY], [0.45, LAVA], [1, LAVAD]]));
    for (var i = 0; i < w / 22; i++) { var x = x0 + r() * w, y = y0 + h * (0.3 + r() * 0.55), rw = 4 + r() * 10; o += E(x, y, rw, Math.max(1.2, h * 0.12 + r()), '#3a1408', 0, 0.55); }
    for (var j = 0; j < w / 14; j++) { var xx = x0 + r() * (w - 12), yy = y0 + h * (0.12 + r() * 0.7), l = 4 + r() * 8; rp += 'M' + pt([xx, yy]) + 'q' + n(l / 2) + ',-1.4 ' + n(l) + ',0'; }
    return o + L(rp, '#fff0a0', 1.1, 0.85) + L('M' + pt([x0, y0]) + 'L' + pt([x1, y0]), OL, 1.4);
  }
  function lavaCracks(seed, y0, y1, cnt, x0, x1) {
    var r = rng(seed), d = ''; x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), l = (10 + r() * 18) * (0.6 + t * 0.8), dir = r() < 0.5 ? -1 : 1;
      d += 'M' + pt([x, y]) + 'l' + n(l * 0.4 * dir) + ',' + n(1 + r() * 2) + 'l' + n(l * 0.5) + ',' + n(-1 - r() * 1.5) + 'l' + n(l * 0.3 * dir) + ',' + n(2);
    }
    return L(d, LAVAD, 3.4, 0.9) + L(d, LAVA, 1.8) + L(d, LAVAY, 0.7);
  }
  // wall of big basalt blocks with lit top edges (full-width walls only: blocks may run past x1)
  function blockWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 20; var r = rng(seed || 4), o = R(x0, y0, x1 - x0, y1 - y0, col), jn = '', hl = '';
    for (var y = y0, row = 0; y < y1; y += bh, row++) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var x = x0 - (row % 2 ? bh * 0.9 : 0);
      while (x < x1) {
        var bw = bh * (1.4 + r() * 1.4);
        if (r() < 0.32) o += R(Math.max(x0, x + 1), y + 1, Math.max(1, Math.min(bw - 2, x1 - x - 1)), Math.min(bh - 2, y1 - y - 1), r() < 0.55 ? dk(col, 0.2) : lt(col, 0.06));
        jn += 'M' + pt([x, y]) + 'l0,' + n(Math.min(bh, y1 - y)); hl += 'M' + pt([x + 2, y + 2]) + 'l' + n(Math.max(0, bw - 5)) + ',0'; x += bw;
      }
    }
    return o + L(hl, lt(col, 0.2), 1, 0.7) + L(jn, dk(col, 0.5), 1.4, 0.9);
  }
  // square dwarven pillar: base block, shaft, two-step capital (x = left edge, y = ground)
  function diPillar(c, x, y, w, h, col, lit) {
    col = col || BASL;
    var o = E(x + w / 2, y + 2, w * 0.8, 3.4, '#000', 0, 0.3);
    o += body(c, pd([[x - 4, y], [x + w + 4, y], [x + w + 4, y - 10], [x - 4, y - 10]], true), dk(col, 0.1), F(pd([[x + w * 0.62, y - 12], [x + w + 6, y - 12], [x + w + 6, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.35), 0.8), 1.6);
    o += body(c, pd([[x, y - 10], [x + w, y - 10], [x + w, y - h + 14], [x, y - h + 14]], true), col, F(pd([[x + w * 0.62, y - h], [x + w + 2, y - h], [x + w + 2, y], [x + w * 0.62, y]], true), dk(col, 0.35), 0.8) + L('M' + pt([x + w * 0.3, y - h + 16]) + 'L' + pt([x + w * 0.3, y - 12]), lt(col, 0.15), 1.2, 0.7), 1.8);
    o += body(c, pd([[x - 3, y - h + 14], [x + w + 3, y - h + 14], [x + w + 7, y - h + 6], [x - 7, y - h + 6]], true), dk(col, 0.05), '', 1.5) + body(c, pd([[x - 7, y - h + 6], [x + w + 7, y - h + 6], [x + w + 7, y - h], [x - 7, y - h]], true), lt(col, 0.05), F(pd([[x + w * 0.6, y - h - 2], [x + w + 9, y - h - 2], [x + w + 9, y - h + 8], [x + w * 0.6, y - h + 8]], true), dk(col, 0.3), 0.7), 1.5);
    if (lit) o += L('M' + pt([x + 1.5, y - h + 16]) + 'L' + pt([x + 1.5, y - 12]), lit, 1.6, 0.7);
    return o;
  }
  // barred prison cell in the wall: chamfered dwarven opening, bars, a lock (x = left, y = bottom)
  function cell(c, x, y, w, h, inside) {
    var ch = w * 0.22, d = pd([[x, y], [x, y - h + ch], [x + ch, y - h], [x + w - ch, y - h], [x + w, y - h + ch], [x + w, y]], true);
    var o = P(pd([[x - 6, y], [x - 6, y - h + ch - 2], [x + ch - 3, y - h - 6], [x + w - ch + 3, y - h - 6], [x + w + 6, y - h + ch - 2], [x + w + 6, y]], true), c.cel(BASL), 1.8);
    o += P(d, c.lg([[0, '#140c0c'], [1, '#4a2418']]), 1.6);
    if (inside) o += inside;
    var bars = '';
    for (var bx = x + 6; bx < x + w - 2; bx += 8) { var u = bx - x; bars += 'M' + pt([bx, y]) + 'L' + pt([bx, y - h + Math.max(0, ch - u) + Math.max(0, u - (w - ch))]); }
    bars += 'M' + pt([x, y - h * 0.55]) + 'L' + pt([x + w, y - h * 0.55]) + 'M' + pt([x, y - 8]) + 'L' + pt([x + w, y - 8]);
    o += L(bars, OL, 4.4) + L(bars, IRONL, 2.2);
    return o + R(x + w - 14, y - h * 0.55 - 1, 9, 10, c.cel(GOLDD), 1.2) + C(x + w - 9.5, y - h * 0.55 + 5, 1.3, OL);
  }
  // a skeleton chained sitting in a cell
  function prisoner(c, x, y) {
    return chainLine([x - 12, y - 40], [x - 7, y - 26], 2, 0.7) + chainLine([x + 12, y - 40], [x + 7, y - 26], 2, 0.7) +
      bone(x - 6, y - 6, 16, 0.2, 0.9) + bone(x + 7, y - 5, 16, -0.3, 0.9) + L('M' + pt([x, y - 24]) + 'L' + pt([x, y - 8]), OL, 3) + L('M' + pt([x, y - 24]) + 'L' + pt([x, y - 8]), '#ece4cc', 1.4) +
      L('M' + pt([x - 5, y - 20]) + 'q5,2 10,0 M' + pt([x - 5, y - 16]) + 'q5,2 10,0 M' + pt([x - 4, y - 12]) + 'q4,2 8,0', '#ece4cc', 1.2) + skull(c, x + 1, y - 30, 0.8);
  }
  function wheel(c, x, y, r, col) {
    var sp = '';
    for (var i = 0; i < 6; i++) { var a = i * PI / 3 + 0.3; sp += 'M' + pt([x, y]) + 'L' + pt([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return ring(x, y, r, r, col, 2.4) + L(sp, OL, 3) + L(sp, col, 1.4) + C(x, y, r * 0.25, c.cel(IRONL), 1.2);
  }
  // torture rack: a slanted plank on posts, a spoked winding wheel, shackles and ropes
  function rack(c, x, y, s) {
    var wood = '#5e3c24', o = E(x + 30 * s, y + 2, 42 * s, 4 * s, '#000', 0, 0.4);
    o += limb('M' + pt([x, y]) + 'L' + pt([x + 2 * s, y - 22 * s]) + 'M' + pt([x + 60 * s, y]) + 'L' + pt([x + 58 * s, y - 28 * s]), dk(wood, 0.15), 4 * s);
    o += body(c, pd([[x - 4 * s, y - 18 * s], [x + 64 * s, y - 24 * s], [x + 64 * s, y - 31 * s], [x - 4 * s, y - 25 * s]], true), wood, L('M' + pt([x + 10 * s, y - 21 * s]) + 'l0,-6 M' + pt([x + 30 * s, y - 23 * s]) + 'l0,-6 M' + pt([x + 50 * s, y - 25 * s]) + 'l0,-6', dk(wood, 0.4), 1), 1.6 * s);
    o += L('M' + pt([x + 4 * s, y - 25 * s]) + 'L' + pt([x + 54 * s, y - 30 * s]), '#c8b080', 1.2 * s, 0.9);
    o += ring(x + 2 * s, y - 27 * s, 3 * s, 2.4 * s, IRONL, 1.3 * s) + ring(x + 8 * s, y - 28 * s, 3 * s, 2.4 * s, IRONL, 1.3 * s);
    return o + wheel(c, x + 62 * s, y - 30 * s, 12 * s, '#7a5434') + limb('M' + pt([x + 62 * s, y - 30 * s]) + 'L' + pt([x + 76 * s, y - 38 * s]), '#7a5434', 2 * s);
  }
  // iron brazier on a pedestal with rim spikes (x = centre, y = ground)
  function ironBrazier(c, x, y, s, h) {
    h = (h == null ? 18 : h) * s; var by = y - h, bw = 12 * s;
    var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.35) + C(x, by - 10 * s, 40 * s, glow(c, EMB, 0.5));
    o += P(pd([[x - 9 * s, y + 1], [x - 5 * s, y - 4 * s], [x + 5 * s, y - 4 * s], [x + 9 * s, y + 1]], true), c.cel(IRON), 1.4 * s) + P(pd([[x - 4 * s, y - 4 * s], [x - 2.4 * s, by], [x + 2.4 * s, by], [x + 4 * s, y - 4 * s]], true), c.cel(IRON), 1.4 * s);
    o += flame(c, x - 5 * s, by - 5 * s, 0.6 * s) + flame(c, x + 5 * s, by - 5 * s, 0.55 * s) + flame(c, x, by - 5 * s, 0.95 * s);
    o += body(c, pd([[x - bw, by - 7 * s], [x + bw, by - 7 * s], [x + bw * 0.7, by + 2 * s], [x - bw * 0.7, by + 2 * s]], true), IRON, F(pd([[x + bw * 0.25, by - 9 * s], [x + bw + 2, by - 9 * s], [x + bw + 2, by + 4 * s], [x + bw * 0.25, by + 4 * s]], true), dk(IRON, 0.35), 0.8) + L('M' + pt([x - bw, by - 3.5 * s]) + 'L' + pt([x + bw, by - 3.5 * s]), EMB, 1.2 * s, 0.8), 1.6 * s);
    o += P(pd([[x - bw - 1 * s, by - 7 * s], [x - bw - 4 * s, by - 13 * s], [x - bw + 3 * s, by - 7 * s]], true), c.cel(IRONL), 1.1 * s) + P(pd([[x + bw + 1 * s, by - 7 * s], [x + bw + 4 * s, by - 13 * s], [x + bw - 3 * s, by - 7 * s]], true), c.cel(IRON), 1.1 * s);
    return o + E(x, by - 7 * s, bw, 1.8 * s, '#ffb030', 1.1 * s) + flame(c, x - 2 * s, by - 7 * s, 0.45 * s, '#ffb030', '#fff0a0');
  }
  // anvil on a stump block (x = centre, y = ground), horn to the left
  function anvil(c, x, y, s) {
    var o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.35);
    o += body(c, pd([[x - 9 * s, y], [x + 9 * s, y], [x + 7 * s, y - 10 * s], [x - 7 * s, y - 10 * s]], true), BASL, '', 1.4 * s);
    o += body(c, pd([[x - 5 * s, y - 10 * s], [x + 5 * s, y - 10 * s], [x + 4 * s, y - 15 * s], [x - 4 * s, y - 15 * s]], true), IRON, '', 1.4 * s);
    o += body(c, 'M' + pt([x - 22 * s, y - 20 * s]) + 'C' + pt([x - 14 * s, y - 16 * s]) + ' ' + pt([x - 11 * s, y - 15 * s]) + ' ' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 12 * s, y - 15 * s]) + 'L' + pt([x + 14 * s, y - 21 * s]) + 'L' + pt([x - 8 * s, y - 21 * s]) + 'Z', IRONL, F(pd([[x + 4 * s, y - 23 * s], [x + 16 * s, y - 23 * s], [x + 16 * s, y - 13 * s], [x + 4 * s, y - 13 * s]], true), dk(IRONL, 0.35), 0.8), 1.5 * s);
    return o + L('M' + pt([x - 8 * s, y - 20.4 * s]) + 'L' + pt([x + 12 * s, y - 20.4 * s]), '#c8c8d0', 1 * s, 0.8);
  }
  // wall forge: stone block with a glowing angular mouth under a hood and chimney
  function forge(c, x, y, w, h) {
    var o = C(x + w / 2, y - h * 0.3, w, glow(c, LAVA, 0.4));
    o += body(c, pd([[x + w * 0.2, y - h], [x + w * 0.8, y - h], [x + w * 0.72, 0], [x + w * 0.28, 0]], true), BAS, L('M' + pt([x + w * 0.3, y - h - 20]) + 'L' + pt([x + w * 0.7, y - h - 20]) + 'M' + pt([x + w * 0.28, y - h - 50]) + 'L' + pt([x + w * 0.72, y - h - 50]), dk(BAS, 0.5), 1.2), 1.8);
    o += body(c, pd([[x - 4, y - h * 0.6], [x + w + 4, y - h * 0.6], [x + w * 0.8, y - h], [x + w * 0.2, y - h]], true), IRON, L('M' + pt([x, y - h * 0.62]) + 'L' + pt([x + w, y - h * 0.62]), EMB, 1.2, 0.7), 1.8);
    o += body(c, pd([[x, y], [x + w, y], [x + w, y - h * 0.6], [x, y - h * 0.6]], true), BASL, F(pd([[x + w * 0.66, y - h], [x + w + 2, y - h], [x + w + 2, y + 2], [x + w * 0.66, y + 2]], true), dk(BASL, 0.35), 0.8), 1.8);
    var m = pd([[x + w * 0.22, y - 3], [x + w * 0.22, y - h * 0.34], [x + w * 0.36, y - h * 0.48], [x + w * 0.64, y - h * 0.48], [x + w * 0.78, y - h * 0.34], [x + w * 0.78, y - 3]], true);
    o += P(m, c.lg([[0, LAVAY], [0.6, LAVA], [1, LAVAD]]), 1.6) + flame(c, x + w * 0.4, y - 4, 0.5) + flame(c, x + w * 0.58, y - 4, 0.6);
    return o;
  }
  // front-facing iron statue of a Slagborn king, hands on a hammer, on a plinth (x = centre, y = ground)
  function ironStatue(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, col = '#45434e', sh = dk(col, 0.42), o = '', b = -25;
    var shd = function (u0) { return F(pd([q(u0, -200), q(60, -200), q(60, 10), q(u0, 10)], true), sh, 0.8); };
    o += body(c, pd([q(-30, 0), q(30, 0), q(30, -18), q(-30, -18)], true), BASM, shd(12) + L('M' + pt(q(-30, -9)) + 'L' + pt(q(30, -9)), dk(BASM, 0.5), 1), 1.8 * s) + body(c, pd([q(-35, -18), q(35, -18), q(31, -25), q(-31, -25)], true), BASL, shd(14), 1.6 * s);
    o += body(c, pd([q(-21, b), q(-4, b), q(-5, b - 24), q(-19, b - 24)], true), col, '', 1.6 * s) + body(c, pd([q(4, b), q(21, b), q(19, b - 24), q(5, b - 24)], true), col, shd(8), 1.6 * s);
    o += body(c, pd([q(-10, b), q(10, b), q(10, b - 15), q(-10, b - 15)], true), dk(col, 0.1), shd(3) + L('M' + pt(q(-10, b - 7.5)) + 'L' + pt(q(10, b - 7.5)), GOLDD, 1.6 * s), 1.6 * s) + limb('M' + pt(q(0, b - 15)) + 'L' + pt(q(0, b - 40)), dk(col, 0.1), 4 * s);
    o += body(c, pd([q(-26, b - 22), q(26, b - 22), q(30, b - 66), q(-30, b - 66)], true), col, shd(10) + L('M' + pt(q(-27, b - 28)) + 'L' + pt(q(27, b - 28)), OL, 2.4 * s) + L('M' + pt(q(-20, b - 58)) + 'L' + pt(q(0, b - 46)) + 'L' + pt(q(20, b - 58)), dk(col, 0.4), 1.4 * s), 1.8 * s);
    o += body(c, pd([q(-46, b - 56), q(-28, b - 72), q(-18, b - 64), q(-30, b - 46)], true), lt(col, 0.06), '', 1.6 * s) + body(c, pd([q(46, b - 56), q(28, b - 72), q(18, b - 64), q(30, b - 46)], true), dk(col, 0.12), '', 1.6 * s);
    // head: horned helm, face, a square beard over the chest
    o += body(c, pd([q(-12, b - 88), q(12, b - 88), q(12, b - 70), q(-12, b - 70)], true), dk(col, 0.05), shd(4), 1.6 * s);
    o += body(c, pd([q(-15, b - 76), q(15, b - 76), q(12, b - 50), q(0, b - 42), q(-12, b - 50)], true), col, shd(3) + L('M' + pt(q(-7, b - 72)) + 'L' + pt(q(-5, b - 50)) + 'M' + pt(q(0, b - 72)) + 'L' + pt(q(0, b - 46)) + 'M' + pt(q(7, b - 72)) + 'L' + pt(q(5, b - 50)), dk(col, 0.45), 1.2 * s), 1.6 * s);
    o += P(pd([q(-15, b - 84), q(-14, b - 96), q(0, b - 102), q(14, b - 96), q(15, b - 84)], true), c.cel(col), 1.6 * s) + P(pd([q(-16, b - 84), q(16, b - 84), q(16, b - 88), q(-16, b - 88)], true), c.cel(GOLDD), 1.2 * s);
    o += P(pd([q(-14, b - 90), q(-30, b - 104), q(-24, b - 88)], true), c.cel(lt(col, 0.1)), 1.3 * s) + P(pd([q(14, b - 90), q(30, b - 104), q(24, b - 88)], true), c.cel(dk(col, 0.1)), 1.3 * s);
    o += gEye(c, q(-5, b - 80)[0], q(-5, b - 80)[1], 1.5 * s, EMB) + gEye(c, q(5, b - 80)[0], q(5, b - 80)[1], 1.5 * s, EMB);
    // arms down, both fists on the haft
    o += limb('M' + pt(q(-32, b - 54)) + 'L' + pt(q(-18, b - 34)) + 'L' + pt(q(-5, b - 38)), col, 9 * s) + limb('M' + pt(q(32, b - 54)) + 'L' + pt(q(18, b - 34)) + 'L' + pt(q(5, b - 38)), dk(col, 0.1), 9 * s);
    o += R(q(-7, b - 44)[0], q(-7, b - 44)[1], 14 * s, 12 * s, c.cel(col), 1.6 * s, 2);
    // lava light from below
    return o + L('M' + pt(q(-30, -1)) + 'L' + pt(q(12, -1)) + 'M' + pt(q(-20, b - 1)) + 'L' + pt(q(-5, b - 1)) + 'M' + pt(q(-29, b - 23)) + 'L' + pt(q(8, b - 23)), LAVA, 1.4 * s, 0.8);
  }
  // Ashforge façade: stepped basalt tiers with lit slit windows, a glowing gate and a carved Slagborn face
  function facade(c, x, y, s) {
    var o = '', by = y;
    [[118, 26], [92, 22], [68, 20], [46, 16]].forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s, win = '';
      o += body(c, pd([[x - hw, by], [x + hw, by], [x + hw - 4 * s, by - th], [x - hw + 4 * s, by - th]], true), i % 2 ? BAS : BASM, F(pd([[x + hw * 0.5, by - th - 2], [x + hw + 2, by - th - 2], [x + hw + 2, by + 2], [x + hw * 0.5, by + 2]], true), dk(BAS, 0.4), 0.7), 1.6 * s);
      for (var wx = x - hw + 14 * s; wx < x + hw - 10 * s; wx += 14 * s) if (Math.abs(wx - x) > 20 * s) win += R(wx - 2 * s, by - th * 0.7, 4 * s, th * 0.45, i % 2 ? LAVA : LAVAY, 0);
      o += win + L('M' + pt([x - hw + 4 * s, by - th]) + 'L' + pt([x + hw - 4 * s, by - th]), EMB, 1, 0.6);
      by -= th;
    });
    var gd = pd([[x - 18 * s, y], [x - 18 * s, y - 30 * s], [x - 10 * s, y - 40 * s], [x + 10 * s, y - 40 * s], [x + 18 * s, y - 30 * s], [x + 18 * s, y]], true);
    o += C(x, y - 18 * s, 44 * s, glow(c, LAVA, 0.5)) + P(pd([[x - 24 * s, y], [x - 24 * s, y - 32 * s], [x - 13 * s, y - 46 * s], [x + 13 * s, y - 46 * s], [x + 24 * s, y - 32 * s], [x + 24 * s, y]], true), c.cel(BASL), 1.6 * s);
    o += P(gd, c.lg([[0, LAVAY], [0.7, LAVA], [1, LAVAD]]), 1.6 * s) + L('M' + pt([x - 9 * s, y]) + 'L' + pt([x - 9 * s, y - 38 * s]) + 'M' + pt([x, y]) + 'L' + pt([x, y - 40 * s]) + 'M' + pt([x + 9 * s, y]) + 'L' + pt([x + 9 * s, y - 38 * s]) + 'M' + pt([x - 18 * s, y - 20 * s]) + 'L' + pt([x + 18 * s, y - 20 * s]), IRONX, 2 * s);
    // carved face on the top tier
    var fy = by;
    o += body(c, pd([[x - 20 * s, fy], [x - 20 * s, fy - 20 * s], [x - 10 * s, fy - 30 * s], [x + 10 * s, fy - 30 * s], [x + 20 * s, fy - 20 * s], [x + 20 * s, fy]], true), BASM, F(pd([[x + 6 * s, fy - 32 * s], [x + 22 * s, fy - 32 * s], [x + 22 * s, fy + 2], [x + 6 * s, fy + 2]], true), dk(BAS, 0.3), 0.7), 1.6 * s);
    o += P(pd([[x - 14 * s, fy - 12 * s], [x + 14 * s, fy - 12 * s], [x + 10 * s, fy + 8 * s], [x, fy + 14 * s], [x - 10 * s, fy + 8 * s]], true), c.cel(BASL), 1.5 * s) + L('M' + pt([x - 5 * s, fy - 8 * s]) + 'L' + pt([x - 4 * s, fy + 8 * s]) + 'M' + pt([x + 5 * s, fy - 8 * s]) + 'L' + pt([x + 4 * s, fy + 8 * s]), dk(BASL, 0.45), 1 * s);
    return o + gEye(c, x - 7 * s, fy - 18 * s, 2 * s, LAVAY) + gEye(c, x + 7 * s, fy - 18 * s, 2 * s, LAVAY);
  }
  // falling lava sheet with streaks and a splash glow at the bottom
  function lavaFall(c, x0, x1, y0, y1, seed) {
    var r = rng(seed || 21), w = x1 - x0, o = E((x0 + x1) / 2, (y0 + y1) / 2, w * 0.9, (y1 - y0) * 0.7, glow(c, LAVA, 0.55));
    o += R(x0, y0, w, y1 - y0, c.lg([[0, LAVAD], [0.25, LAVA], [0.5, LAVAY], [0.75, LAVA], [1, LAVAD]], 0, 0, 1, 0));
    var st = '', dkS = '';
    for (var i = 0; i < w / 6; i++) { var x = x0 + 3 + r() * (w - 6), ya = y0 + r() * (y1 - y0) * 0.5, yb = ya + 20 + r() * 50; (r() < 0.6 ? (st += 'M' + pt([x, ya]) + 'L' + pt([x + (r() - 0.5) * 2, Math.min(y1, yb)])) : (dkS += 'M' + pt([x, ya]) + 'L' + pt([x, Math.min(y1, yb)]))); }
    return o + L(st, '#fff4b0', 1.3, 0.8) + L(dkS, LAVAD, 2, 0.6) + E((x0 + x1) / 2, y1, w * 0.6, 6, glow(c, LAVAY, 0.8));
  }
  // the Imperial Seat: tall spiked iron back, red panel with an anvil emblem, armrests, cushion (x = centre, y = seat base)
  function throne(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 58 * s, 5 * s, '#000', 0, 0.45), sh = function (u0, top) { return F(pd([q(u0, top || -120), q(60, top || -120), q(60, 10), q(u0, 10)], true), dk(IRON, 0.4), 0.8); };
    var back = pd([q(-34, -18), q(-34, -62), q(-44, -70), q(-30, -74), q(-26, -92), q(-14, -86), q(0, -106), q(14, -86), q(26, -92), q(30, -74), q(44, -70), q(34, -62), q(34, -18)], true);
    o += body(c, back, IRON, sh(10) + L(pd([q(-30, -20), q(-30, -64), q(-24, -70), q(-22, -86), q(-12, -80), q(0, -98), q(12, -80), q(22, -86), q(24, -70), q(30, -64), q(30, -20)]), GOLD, 1.6 * s), 2.2 * s);
    o += P(pd([q(-21, -24), q(-21, -62), q(0, -80), q(21, -62), q(21, -24)], true), c.cel(REDD), 1.6 * s);
    // emblem: an anvil under a flame
    o += P(pd([q(-12, -44), q(12, -44), q(10, -48), q(-6, -48), q(-10, -46)], true), c.cel(GOLD), 1.2 * s) + P(pd([q(-4, -44), q(4, -44), q(6, -36), q(-6, -36)], true), c.cel(GOLD), 1.2 * s) + flame(c, q(0, -50)[0], q(0, -50)[1], 0.8 * s, LAVA, LAVAY);
    o += C(q(0, -92)[0], q(0, -92)[1], 12 * s, glow(c, LAVAY, 0.8)) + P(pd([q(0, -97), q(4, -92), q(0, -87), q(-4, -92)], true), c.cel(LAVAY), 1.2 * s);
    // seat and cushion
    o += body(c, pd([q(-36, 0), q(36, 0), q(36, -20), q(-36, -20)], true), IRON, sh(14) + L('M' + pt(q(-36, -6)) + 'L' + pt(q(36, -6)), GOLD, 1.4 * s), 2 * s);
    o += P('M' + pt(q(-30, -20)) + 'C' + pt(q(-30, -28)) + ' ' + pt(q(30, -28)) + ' ' + pt(q(30, -20)) + 'Z', c.cel(RED), 1.6 * s);
    // armrests ending in fists
    [-1, 1].forEach(function (k) {
      o += body(c, pd([q(k * 36, 0), q(k * 50, 0), q(k * 50, -28), q(k * 36, -28)], true), k < 0 ? lt(IRON, 0.05) : dk(IRON, 0.1), '', 1.8 * s);
      o += body(c, pd([q(k * 34, -28), q(k * 54, -28), q(k * 52, -36), q(k * 36, -36)], true), IRON, L('M' + pt(q(k * 35, -30)) + 'L' + pt(q(k * 53, -30)), GOLD, 1.2 * s), 1.6 * s);
      o += R(q(k * 52 - (k < 0 ? 0 : 10), -44)[0], q(0, -44)[1], 10 * s, 9 * s, c.cel(IRONL), 1.4 * s, 2);
    });
    return o;
  }
  function wallTorch(c, x, y) {
    return C(x, y - 8, 30, glow(c, EMB, 0.5)) + P(pd([[x - 5, y], [x + 5, y], [x + 3, y + 8], [x - 3, y + 8]], true), c.cel(IRON), 1.3) + L('M' + pt([x, y + 8]) + 'L' + pt([x, y + 14]), OL, 2.4) + flame(c, x, y, 0.8);
  }
  function banner(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - 10], [x, y + h]], true);
    return R(x - 3, y - 3, w + 6, 4, c.cel(IRON), 1.2) + body(c, d, RED, F(pd([[x + w * 0.6, y], [x + w + 2, y], [x + w + 2, y + h + 2], [x + w * 0.6, y + h]], true), REDD, 0.7) + L('M' + pt([x + 3, y + 2]) + 'L' + pt([x + 3, y + h - 3]) + 'M' + pt([x + w - 3, y + 2]) + 'L' + pt([x + w - 3, y + h - 3]), GOLD, 1.2), 1.6) +
      P(pd([[x + w * 0.2, y + h * 0.4], [x + w * 0.8, y + h * 0.4], [x + w * 0.7, y + h * 0.34], [x + w * 0.3, y + h * 0.34]], true), c.cel(GOLD), 1) + P(pd([[x + w * 0.42, y + h * 0.4], [x + w * 0.58, y + h * 0.4], [x + w * 0.62, y + h * 0.52], [x + w * 0.38, y + h * 0.52]], true), c.cel(GOLD), 1) + flame(c, x + w / 2, y + h * 0.32, 0.45, LAVA, LAVAY);
  }
  function darkFloor(c, y, col, seed) { return flagFloor(c, y, 200, col, seed) + R(0, y - 2, 400, 8, c.lg([[0, '#000', 0.4], [1, '#000', 0]])); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    brd_prison: function (c) {
      var o = R(0, 0, 400, 240, '#1a1214');
      o += blockWall(c, 0, 0, 400, 116, BASM, 1101, 18);
      o += R(0, 0, 400, 116, c.lg([[0, '#0a0608', 0.8], [0.55, '#0a0608', 0.25], [1, LAVA, 0.16]]));
      o += R(-2, 0, 404, 12, c.cel(BAS), 1.8) + L('M0,12 L400,12', EMB, 1, 0.4);
      o += cell(c, 50, 108, 76, 74, prisoner(c, 80, 106)) + cell(c, 166, 108, 68, 74, chainLine([176, 42], [224, 42], 16, 0.8) + gEye(c, 192, 80, 1.3, EMB) + gEye(c, 200, 80, 1.3, EMB)) + cell(c, 274, 108, 76, 74, chainLine([290, 38], [290, 76], 0, 0.8) + ring(290, 80, 4, 3, IRONL, 1.6) + bone(318, 100, 16, 0.1, 0.9) + skull(c, 332, 100, 0.8));
      o += diPillar(c, 136, 116, 22, 110, BASL, EMB) + diPillar(c, 242, 116, 22, 110, BASL, EMB) + diPillar(c, 4, 116, 26, 112, BASL) + diPillar(c, 368, 116, 26, 112, BASL);
      o += wallTorch(c, 147, 58) + wallTorch(c, 253, 58);
      o += chainLine([30, 12], [30, 70], 0, 1) + chainLine([380, 12], [380, 60], 0, 1) + L('M30,70 L30,76 q-6,2 -3,8', OL, 3) + L('M30,70 L30,76 q-6,2 -3,8', IRONL, 1.4);
      // the lava channel along the foot of the wall
      o += lava(c, 0, 114, 400, 122, 1102, 26) + R(0, 121, 400, 3, IRONX);
      o += darkFloor(c, 122, '#4a3c3e', 1103) + lavaCracks(1104, 134, 236, 9);
      o += L('M-2,122 L402,122', OL, 1.6);
      // grate over a floor pit, the rack and its wheel
      o += P(pd([[150, 206], [250, 206], [262, 232], [138, 232]], true), c.lg([[0, LAVA], [1, LAVAD]]), 1.8) + L('M162,206 L154,232 M178,206 L174,232 M194,206 L192,232 M210,206 L210,232 M226,206 L228,232 M242,206 L246,232 M145,219 L256,219', OL, 3.6) + L('M162,206 L154,232 M178,206 L174,232 M194,206 L192,232 M210,206 L210,232 M226,206 L228,232 M242,206 L246,232 M145,219 L256,219', IRONL, 1.8);
      o += rack(c, 146, 146, 0.8);
      o += ironBrazier(c, 116, 134, 0.9, 16) + ironBrazier(c, 280, 134, 0.9, 16);
      o += chainLine([20, 200], [80, 214], 6, 1) + chainLine([330, 216], [392, 204], 6, 1) + skull(c, 356, 226, 0.9) + bone(40, 226, 16, 0.4, 1);
      o += pebbles(1105, 150, 236, '#1e1618', 16, 10, 390);
      return o + motes(1106, 18, 0, 400, 20, 200, '#ffb060') + R(0, 0, 400, 240, c.rg([[0, '#ff8040', 0], [0.7, '#000', 0.15], [1, '#000', 0.55]]));
    },
    brd_city: function (c) {
      var o = R(0, 0, 400, 240, '#140e10');
      o += blockWall(c, 0, 0, 400, 106, BAS, 1201, 16);
      o += R(0, 0, 400, 106, c.lg([[0, '#08040a', 0.85], [0.6, '#08040a', 0.2], [1, LAVA, 0.25]]));
      // vault ribs
      o += L('M0,30 L60,0 M400,30 L340,0 M120,0 L150,40 M280,0 L250,40', OL, 6) + L('M0,30 L60,0 M400,30 L340,0 M120,0 L150,40 M280,0 L250,40', BASL, 3);
      o += facade(c, 200, 104, 0.84);
      o += forge(c, 6, 104, 50, 50) + forge(c, 344, 104, 50, 50);
      // the lava moat and the two iron kings rising out of it
      o += lava(c, 0, 102, 400, 124, 1202, 36);
      o += ironStatue(c, 96, 116, 0.8) + ironStatue(c, 304, 116, 0.8);
      o += chainLine([60, 0], [70, 58], 6, 1.1) + chainLine([340, 0], [330, 58], 6, 1.1);
      // the floor platform with a lip over the moat
      o += darkFloor(c, 124, '#463a3c', 1203);
      o += R(-2, 122, 404, 6, c.cel(BASL), 1.6) + L('M0,128 L400,128', EMB, 1, 0.5);
      o += lavaCracks(1204, 140, 236, 7) + F('M176,128 L224,128 L262,242 L138,242 Z', LAVA, 0.08);
      o += anvil(c, 142, 150, 1) + anvil(c, 262, 146, 0.9) + ironBrazier(c, 26, 170, 1.1, 22) + ironBrazier(c, 376, 176, 1.1, 22);
      o += pebbles(1205, 150, 236, '#1e1618', 14, 10, 390);
      return o + motes(1206, 24, 0, 400, 10, 140, '#ffc070') + R(0, 0, 400, 240, c.rg([[0, '#ff8040', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    },
    brd_throne: function (c) {
      var o = R(0, 0, 400, 240, '#160e0e');
      o += blockWall(c, 0, 0, 400, 124, BAS, 1301, 18);
      o += R(0, 0, 400, 124, c.lg([[0, '#08040a', 0.7], [0.6, '#08040a', 0.2], [1, LAVA, 0.18]]));
      // the lava fall in its great angular arch
      o += P(pd([[112, 124], [112, 22], [140, 0], [260, 0], [288, 22], [288, 124]], true), c.cel(BASL), 2);
      o += lavaFall(c, 128, 272, -2, 112, 1302);
      o += P(pd([[112, 124], [112, 22], [140, -2], [128, -2], [128, 124]], true), c.cel(BASM), 1.6) + P(pd([[288, 124], [288, 22], [260, -2], [272, -2], [272, 124]], true), c.cel(dk(BASM, 0.1)), 1.6);
      o += lava(c, 128, 106, 272, 116, 1303);
      // dais steps and the throne
      [[132, 124], [116, 116], [100, 108]].forEach(function (t, i) { o += body(c, pd([[200 - t[0], t[1]], [200 + t[0], t[1]], [200 + t[0] - 6, t[1] - 8], [200 - t[0] + 6, t[1] - 8]], true), i % 2 ? BASM : BASL, F(pd([[240, t[1] - 10], [340, t[1] - 10], [340, t[1] + 2], [240, t[1] + 2]], true), dk(BASM, 0.3), 0.6) + L('M' + pt([200 - t[0] + 6, t[1] - 8]) + 'L' + pt([200 + t[0] - 6, t[1] - 8]), GOLDD, 1.2), 1.6); });
      o += throne(c, 200, 100, 0.88);
      o += diPillar(c, 40, 124, 26, 124, BASL, EMB) + diPillar(c, 334, 124, 26, 124, BASL, EMB) + banner(c, 76, 20, 26, 60) + banner(c, 298, 20, 26, 60);
      o += ironBrazier(c, 88, 124, 1, 22) + ironBrazier(c, 312, 124, 1, 22);
      o += chainLine([8, 0], [8, 90], 0, 1.1) + chainLine([392, 0], [392, 80], 0, 1.1);
      // polished floor, the red carpet down from the dais
      o += darkFloor(c, 124, '#3e3234', 1304) + L('M-2,124 L402,124', OL, 1.6);
      o += P('M170,124 L230,124 L284,244 L116,244 Z', c.lg([[0, REDD], [1, RED]]), 1.6) + L('M175,124 L124,244 M225,124 L276,244', GOLD, 1.6);
      o += lavaCracks(1305, 140, 236, 5, 0, 110) + lavaCracks(1306, 140, 236, 5, 290, 400);
      return o + motes(1307, 22, 100, 300, 0, 140, '#ffd080') + R(0, 0, 400, 240, c.rg([[0, '#ff8040', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- Slagborn head (facing left). beard: 'full' | 'braids' | 'fork' | 'block' | 'none' (the women) ----
  function diHead(c, x, y, o) {
    var sk = o.skin || DSK, hc = o.hair || DHAIR, bl = o.beardLen || 28, st = o.beard || 'full', s = '', fem = st === 'none';
    if (o.backHair) s += o.backHair(c, x, y);
    s += E(x + 10, y + 1, 3.4, 4.6, c.cel(sk), 1.8);
    var d = fem ? 'M' + pt([x - 9, y - 6]) + 'C' + pt([x - 11, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 11, y + 6]) + 'C' + pt([x + 6, y + 13]) + ' ' + pt([x - 2, y + 14]) + ' ' + pt([x - 7, y + 11]) + 'C' + pt([x - 9, y + 10]) + ' ' + pt([x - 10, y + 8]) + ' ' + pt([x - 9, y + 6]) + 'L' + pt([x - 10, y + 4]) + 'L' + pt([x - 14, y + 2.5]) + 'L' + pt([x - 10, y - 2]) + 'Z'
      : 'M' + pt([x - 11, y - 4]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 12, y + 7]) + 'C' + pt([x + 7, y + 13]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x - 11, y + 7]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 14]) + 'L' + pt([x + 2, y + 14]) + 'C' + pt([x + 7, y + 4]) + ' ' + pt([x + 7, y - 8]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.24), 0.8) + (o.scar ? L('M' + pt([x - 8, y - 10]) + 'L' + pt([x - 2, y + 1]), dk(sk, 0.4), 1.2) : '') + (o.facePaint || ''), 2);
    var bd = '', str = '', b2 = st === 'braids' ? bl * 0.7 : bl;
    if (st === 'full' || st === 'braids') {
      bd = 'M' + pt([x + 11, y - 3]) + 'C' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y + b2 * 0.62]) + ' ' + pt([x + 8, y + b2]) + 'L' + pt([x + 4, y + b2 - 4]) + 'L' + pt([x, y + b2 + 1]) + 'L' + pt([x - 4, y + b2 - 5]) + 'L' + pt([x - 9, y + b2 - 1]) + 'C' + pt([x - 16, y + b2 * 0.62]) + ' ' + pt([x - 17, y + 12]) + ' ' + pt([x - 12, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
      str = 'M' + pt([x + 7, y + 6]) + 'C' + pt([x + 9, y + 12]) + ' ' + pt([x + 8, y + b2 * 0.7]) + ' ' + pt([x + 5, y + b2 - 5]) + 'M' + pt([x - 2, y + 9]) + 'C' + pt([x - 1, y + 14]) + ' ' + pt([x - 2, y + b2 * 0.7]) + ' ' + pt([x - 3, y + b2 - 6]) + 'M' + pt([x - 10, y + 10]) + 'C' + pt([x - 12, y + 14]) + ' ' + pt([x - 10, y + b2 * 0.7]) + ' ' + pt([x - 8, y + b2 - 4]);
    } else if (st === 'fork') {
      bd = 'M' + pt([x + 11, y - 3]) + 'C' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y + bl * 0.6]) + ' ' + pt([x + 10, y + bl * 0.8]) + 'L' + pt([x + 6, y + bl + 6]) + 'L' + pt([x + 1, y + bl * 0.74]) + 'L' + pt([x - 3, y + bl * 0.78]) + 'L' + pt([x - 9, y + bl + 8]) + 'C' + pt([x - 15, y + bl * 0.6]) + ' ' + pt([x - 17, y + 12]) + ' ' + pt([x - 12, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
      str = 'M' + pt([x + 7, y + 6]) + 'C' + pt([x + 9, y + 14]) + ' ' + pt([x + 8, y + bl * 0.7]) + ' ' + pt([x + 6, y + bl + 2]) + 'M' + pt([x - 9, y + 10]) + 'C' + pt([x - 11, y + 16]) + ' ' + pt([x - 10, y + bl * 0.7]) + ' ' + pt([x - 8, y + bl + 3]);
    } else if (st === 'block') {
      bd = 'M' + pt([x + 12, y - 3]) + 'C' + pt([x + 18, y + 8]) + ' ' + pt([x + 19, y + bl * 0.7]) + ' ' + pt([x + 16, y + bl]) + 'L' + pt([x + 8, y + bl + 3]) + 'L' + pt([x, y + bl]) + 'L' + pt([x - 8, y + bl + 3]) + 'L' + pt([x - 18, y + bl]) + 'C' + pt([x - 21, y + bl * 0.7]) + ' ' + pt([x - 19, y + 12]) + ' ' + pt([x - 13, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
      str = 'M' + pt([x + 10, y + 6]) + 'L' + pt([x + 12, y + bl - 2]) + 'M' + pt([x + 2, y + 9]) + 'L' + pt([x + 3, y + bl - 2]) + 'M' + pt([x - 6, y + 9]) + 'L' + pt([x - 6, y + bl - 2]) + 'M' + pt([x - 13, y + 10]) + 'L' + pt([x - 15, y + bl - 2]);
    }
    if (bd) {
      var lit = o.lit ? L('M' + pt([x - 16, y + 12]) + 'C' + pt([x - 19, y + bl * 0.5]) + ' ' + pt([x - 18, y + bl * 0.8]) + ' ' + pt([x - 16, y + bl]) + 'M' + pt([x - 10, y + 14]) + 'L' + pt([x - 11, y + bl - 4]) + 'M' + pt([x - 3, y + 14]) + 'L' + pt([x - 3, y + bl - 6]), o.lit, 2.2, 0.95) + L('M' + pt([x - 13, y + 5]) + 'C' + pt([x - 20, y + 12]) + ' ' + pt([x - 21, y + bl * 0.7]) + ' ' + pt([x - 18, y + bl]), lt(o.lit, 0.3), 1.4) : '';
      s += body(c, bd, hc, L(str, dk(hc, 0.45), 1.1) + L(str, lt(hc, 0.14), 0.6, 0.7) + F('M' + pt([x + 5, y - 4]) + 'L' + pt([x + 22, y - 4]) + 'L' + pt([x + 22, y + bl + 8]) + 'L' + pt([x + 5, y + bl + 8]) + 'C' + pt([x + 11, y + 20]) + ' ' + pt([x + 10, y + 8]) + ' ' + pt([x + 5, y - 4]) + 'Z', dk(hc, 0.3), 0.7) + lit, 2);
    }
    if (st === 'braids') [[x - 8, 0.9], [x + 5, 1]].forEach(function (b) {
      var bx = b[0], by0 = y + b2 * 0.62, by1 = y + bl + 6, br = 'M' + pt([bx, by0]) + 'L' + pt([bx - 1, by1]);
      s += L(br, OL, 7.4) + L(br, hc, 4.4) + L('M' + pt([bx - 2, by0 + 3]) + 'l2,2 M' + pt([bx - 2, by0 + 7]) + 'l2,2', lt(hc, 0.2), 1) + R(bx - 4, by1 - 8, 6.6, 4, c.cel(o.band || IRONL), 1.2) + P(pd([[bx - 3.4, by1], [bx + 2, by1], [bx - 1, by1 + 5]], true), c.cel(o.band || IRONL), 1.1);
    });
    if (st === 'fork') s += R(x + 2.5, y + bl - 1, 7, 3.6, c.cel(o.band || IRONL), 1.1) + R(x - 11.5, y + bl, 7, 3.6, c.cel(o.band || IRONL), 1.1) + (o.tips ? F(pd([[x + 3.6, y + bl + 3], [x + 8.4, y + bl + 3], [x + 6, y + bl + 6]], true) + pd([[x - 10.6, y + bl + 4], [x - 6, y + bl + 4], [x - 9, y + bl + 8]], true), o.tips) : '');
    if (st === 'block') [0.5, 0.8].forEach(function (f) { var yy = y + bl * f, bb = 'M' + pt([x - 19, yy]) + 'L' + pt([x + 18, yy]); s += L(bb, OL, 5) + L(bb, o.band || GOLD, 2.8) + C(x - 1, yy, 2, c.cel(o.gem || LAVAY), 0.9); });
    if (!fem) s += P('M' + pt([x - 3, y + 3]) + 'C' + pt([x - 10, y + 2]) + ' ' + pt([x - 17, y + 6]) + ' ' + pt([x - 18, y + 14]) + 'C' + pt([x - 13, y + 11]) + ' ' + pt([x - 8, y + 10]) + ' ' + pt([x - 2, y + 10]) + 'C' + pt([x + 2, y + 10]) + ' ' + pt([x + 5, y + 6]) + ' ' + pt([x + 2, y + 3]) + 'Z', c.cel(lt(hc, 0.08)), 1.6);
    if (fem) s += L('M' + pt([x - 11, y + 3]) + 'L' + pt([x - 9, y + 3.6]), dk(sk, 0.4), 1) + P('M' + pt([x - 9.4, y + 8]) + 'q3.4,-1.2 6.4,0.2 q-3,2.6 -6.4,-0.2 Z', '#7a3a4a', 1.1) + E(x - 3, y + 4, 2.6, 1.6, '#a07080', 0, 0.35);
    else s += E(x - 12, y + 1, 5, 4.4, c.cel(mix(sk, '#c86a5a', 0.16)), 1.8) + E(x - 13.4, y - 0.4, 1.6, 1.1, '#ffffff', 0, 0.35);
    s += glowEye(c, x - 5, y - 3.2, 1.5, o.eye || '#ff8a2a');
    if (fem) s += L('M' + pt([x - 10, y - 7]) + 'L' + pt([x - 1, y - 8.6]), OL, 1.8);
    else s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 1, y - 8]) + 'L' + pt([x, y - 6]) + 'C' + pt([x - 4, y - 7]) + ' ' + pt([x - 8, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', c.cel(hc), 1.2);
    if (o.helm) s += o.helm(c, x, y);
    return s;
  }
  // ---- Slagborn dwarf rig (facing left): the Greenfen / Gearhollow proportions with its own head ----
  function dwarfRig(c, o) {
    var sk = o.skin || DSK;
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#1e1a1a', glove: o.glove,
      hx: 56, hy: o.hy || 44, hipY: 96, legW: o.legW || 13, armW: o.armW || 11.5, shadowR: o.shadowR || 36, neck: false,
      torsoD: o.torsoD || 'M40,60 C44,52 82,52 88,60 L88,82 L85,99 L43,99 L40,82 Z',
      head: function (c, x, y) { return G(diHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''), at(o.headS || 1.12, x, y + 10)); },
      chest: o.chest, back: o.back, pads: o.pads, top: o.top, shins: o.shins,
      front: function (c) { return (o.front ? o.front(c) : '') + P('M41,90 L87,90 L86,99 L42,99 Z', c.cel(o.belt || '#2a2222'), 2) + R(58, 88.6, 11, 11.6, c.cel(o.buckle || '#6a6870'), 1.6) + R(61, 91.6, 5, 5.6, o.buckleIn || dk(o.belt || '#2a2222', 0.2), 0) + (o.frontTop ? o.frontTop(c) : ''); },
      near: o.near || [[44, 62], [36, 78], [30, 90]], far: o.far || [[84, 62], [92, 78], [92, 92]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand,
      tf: o.tf || at(0.98, 64, 122)
    });
  }
  // ---- headgear ----
  function kettleHelm(c, x, y) {
    var d = 'M' + pt([x - 11, y - 6]) + 'C' + pt([x - 11, y - 21]) + ' ' + pt([x + 11, y - 22]) + ' ' + pt([x + 12, y - 6]) + 'Z';
    var s = body(c, d, IRON, F(pd([[x + 3, y - 24], [x + 14, y - 24], [x + 14, y - 5], [x + 4, y - 5]], true), dk(IRON, 0.35), 0.8) + L('M' + pt([x - 10, y - 12]) + 'L' + pt([x + 11, y - 12]), dk(IRON, 0.45), 1), 1.8);
    s += C(x, y - 21.5, 2.4, c.cel(IRONL), 1.2) + C(x - 6, y - 14.6, 0.9, lt(IRONL, 0.3)) + C(x, y - 15.6, 0.9, lt(IRONL, 0.3)) + C(x + 6, y - 14.6, 0.9, lt(IRONL, 0.3));
    s += P(pd([[x - 19, y - 4], [x + 17, y - 4], [x + 14, y - 9], [x - 15, y - 9]], true), c.cel(IRONL), 1.6) + L('M' + pt([x - 17, y - 5]) + 'L' + pt([x + 15, y - 5]), dk(IRONL, 0.4), 0.9);
    return s;
  }
  function mitre(c, x, y) {
    var d = 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 12, y - 20]) + ' ' + pt([x - 6, y - 32]) + ' ' + pt([x + 4, y - 42]) + 'C' + pt([x + 5, y - 34]) + ' ' + pt([x + 12, y - 26]) + ' ' + pt([x + 13, y - 6]) + 'Z';
    var s = C(x, y - 22, 18, glow(c, EMB, 0.35)) + body(c, d, RED, F(pd([[x + 3, y - 44], [x + 16, y - 44], [x + 16, y - 4], [x + 5, y - 4]], true), REDD, 0.8) + L('M' + pt([x - 10, y - 16]) + 'C' + pt([x - 6, y - 28]) + ' ' + pt([x, y - 34]) + ' ' + pt([x + 4, y - 40]), GOLD, 1.4), 1.8);
    s += P(pd([[x - 12, y - 4], [x + 13, y - 4], [x + 13, y - 10], [x - 12, y - 10]], true), c.cel(IRON), 1.5) + L('M' + pt([x - 11, y - 7]) + 'L' + pt([x + 12, y - 7]), GOLD, 1);
    return s + flame(c, x - 3, y - 12, 0.55, LAVA, LAVAY) + C(x + 4.5, y - 42, 1.8, c.cel(LAVAY), 0.9);
  }
  function crestHelm(c, x, y) {
    var col = '#3a3a48', s = '';
    var T = taper([[x + 2, y - 26], [x + 14, y - 28], [x + 26, y - 20], [x + 32, y - 6]], 9, 2, 5);
    s += P(T.d, c.cel(RED), 1.6) + L(along(T, 0.5), lt(RED, 0.3), 1, 0.8);
    var d = 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 20]) + ' ' + pt([x + 12, y - 21]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 11, y + 8]) + 'L' + pt([x + 3, y + 6]) + 'L' + pt([x + 2, y - 4]) + 'Z';
    s += body(c, d, col, F(pd([[x + 3, y - 24], [x + 16, y - 24], [x + 16, y + 10], [x + 5, y + 10]], true), dk(col, 0.35), 0.8) + L('M' + pt([x + 3, y + 5]) + 'L' + pt([x + 11, y + 7]), GOLD, 1.4), 1.8);
    s += P(pd([[x - 8, y - 16], [x - 4, y - 28], [x + 6, y - 31], [x + 10, y - 20], [x + 4, y - 17]], true), c.cel(GOLD), 1.5) + L('M' + pt([x - 3, y - 19]) + 'L' + pt([x + 1, y - 28]) + 'M' + pt([x + 2, y - 18]) + 'L' + pt([x + 5, y - 28]), GOLDD, 1);
    s += P(pd([[x - 14, y - 5], [x + 13, y - 5], [x + 12, y - 10], [x - 13, y - 10]], true), c.cel(GOLD), 1.4) + P(pd([[x - 12, y - 6], [x - 8, y - 6], [x - 10, y + 2]], true), c.cel(GOLD), 1.2);
    return s + P(pd([[x + 8, y - 13], [x + 24, y - 24], [x + 12, y - 8]], true), c.cel('#d8ccb0'), 1.3);
  }
  function engCap(c, x, y) {
    var lea = '#5a3a24', s = '';
    s += body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 12, y - 19]) + ' ' + pt([x + 11, y - 20]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 12, y + 3]) + 'L' + pt([x + 6, y - 2]) + 'L' + pt([x - 2, y - 7]) + 'Z', lea, F(pd([[x + 3, y - 22], [x + 16, y - 22], [x + 16, y + 4], [x + 4, y + 4]], true), dk(lea, 0.35), 0.8) + L('M' + pt([x, y - 19]) + 'L' + pt([x + 2, y - 7]), dk(lea, 0.4), 1), 1.8);
    s += L('M' + pt([x - 11, y - 10]) + 'L' + pt([x + 12, y - 8]), OL, 3.4) + L('M' + pt([x - 11, y - 10]) + 'L' + pt([x + 12, y - 8]), '#3a2a1e', 2);
    s += C(x + 3, y - 13, 4.2, c.cel(BRASS), 1.4) + C(x + 3, y - 13, 2.4, '#6ad0e8', 0.8) + C(x + 2.2, y - 13.8, 0.8, '#fff', 0, 0.9);
    s += L('M' + pt([x - 1, y - 3]) + 'L' + pt([x + 8, y - 7]), OL, 2.4) + L('M' + pt([x - 1, y - 3]) + 'L' + pt([x + 8, y - 7]), BRASS, 1.2);
    return s + C(x - 5, y - 3.2, 10, glow(c, '#ffb040', 0.55)) + C(x - 5, y - 3.2, 4.6, c.cel(BRASS), 1.5) + C(x - 5, y - 3.2, 3.2, c.rg([[0, '#fff6c0'], [0.5, '#ffb040'], [1, '#c05a10']]), 0.8) + C(x - 6, y - 4.4, 0.9, '#fff', 0, 0.9);
  }
  function crown(c, x, y) {
    var pts = [[-12, -14], [-11, -30], [-6, -15], [-2, -38], [3, -15], [7, -34], [10, -14], [14, -28], [13, -12]];
    var d = 'M' + pt([x - 13, y - 12]) + pts.map(function (p) { return 'L' + pt([x + p[0], y + p[1]]); }).join('') + 'Z', s = C(x, y - 22, 20, glow(c, LAVAY, 0.35));
    s += body(c, d, '#3a3a46', F(pd([[x + 4, y - 40], [x + 18, y - 40], [x + 18, y - 8], [x + 5, y - 8]], true), IRONX, 0.8) + L(pd([[x - 11, y - 16], [x - 10.4, y - 27], [x - 6, y - 17], [x - 2, y - 34], [x + 3, y - 17], [x + 7, y - 30], [x + 10, y - 16], [x + 13, y - 25]]), GOLD, 1.2), 1.6);
    s += P(pd([[x - 13, y - 6], [x + 13, y - 5], [x + 13, y - 13], [x - 13, y - 14]], true), c.cel(GOLD), 1.6) + L('M' + pt([x - 12, y - 10]) + 'L' + pt([x + 12, y - 9]), GOLDD, 1);
    s += E(x - 3, y - 9.6, 2.6, 3, c.cel(RED), 1) + C(x + 6, y - 9.4, 1.8, c.cel(LAVAY), 0.9) + C(x - 10, y - 10, 1.6, c.cel(LAVAY), 0.9);
    [[-11, -30], [-2, -38], [7, -34], [14, -28]].forEach(function (p) { s += C(x + p[0], y + p[1], 5, glow(c, LAVAY, 0.8)) + C(x + p[0], y + p[1], 1.5, '#fff0a0'); });
    return s;
  }
  function gHair(c, x, y) {
    var T = taper([[x + 8, y - 11], [x + 18, y - 8], [x + 23, y + 4], [x + 24, y + 20], [x + 29, y + 32]], 10, 3, 5);
    return P(T.d, c.cel('#1e161c'), 1.8) + L(along(T, 0.4), '#4a3a48', 1, 0.8) + ring(x + 16, y - 8, 2.6, 3.4, IRONL, 1.4);
  }
  function gHelm(c, x, y) {
    var s = body(c, 'M' + pt([x - 11, y - 5]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x + 11, y - 20]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 15, y + 16]) + 'L' + pt([x + 5, y + 14]) + 'C' + pt([x + 5, y + 4]) + ' ' + pt([x + 3, y - 6]) + ' ' + pt([x - 2, y - 8]) + 'C' + pt([x - 6, y - 8]) + ' ' + pt([x - 9, y - 7]) + ' ' + pt([x - 11, y - 5]) + 'Z', '#1e161c', L('M' + pt([x - 6, y - 12]) + 'C' + pt([x, y - 16]) + ' ' + pt([x + 8, y - 14]) + ' ' + pt([x + 10, y - 2]), '#4a3a48', 1, 0.8), 1.8);
    return s + L('M' + pt([x - 11, y - 9]) + 'L' + pt([x + 12, y - 8]), OL, 3.4) + L('M' + pt([x - 11, y - 9]) + 'L' + pt([x + 12, y - 8]), IRONL, 1.8) + P(pd([[x - 7, y - 9], [x - 4, y - 15], [x - 1, y - 9]], true), c.cel(IRONL), 1) + C(x - 4, y - 10.4, 1.6, SHAD, 0.8) + C(x - 4, y - 10.4, 5, glow(c, SHAD, 0.7));
  }
  // ---- weapons and props ----
  function mace(c, p, len, ang, col) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#4a3222', 3.6), h = q(len, 0);
    col = col || IRONL;
    for (var i = 0; i < 6; i++) { var a = ang + i * PI / 3, ca = Math.cos(a), sa = Math.sin(a); o += P(pd([[h[0] + ca * 3 - sa * 3.4, h[1] + sa * 3 + ca * 3.4], [h[0] + ca * 11, h[1] + sa * 11], [h[0] + ca * 3 + sa * 3.4, h[1] + sa * 3 - ca * 3.4]], true), c.cel(i % 2 ? col : dk(col, 0.18)), 1.3); }
    return o + C(h[0], h[1], 6, c.cel(col), 1.6) + C(h[0] - 1.6, h[1] - 1.6, 1.6, '#fff', 0, 0.5) + ring(q(-8, 0)[0], q(-8, 0)[1], 2, 2, GOLDD, 1);
  }
  function keyRing(c, x, y) {
    var o = '';
    [[-5, 0.35], [0, 0], [5, -0.3]].forEach(function (k) {
      var q = dirQ([x + k[0] * 0.7, y + 4], PI / 2 + k[1]), d = 'M' + pt(q(0, 0)) + 'L' + pt(q(13, 0)), t = 'M' + pt(q(9, 0)) + 'L' + pt(q(9, 3)) + 'M' + pt(q(12, 0)) + 'L' + pt(q(12, 3));
      o += L(d, OL, 3.8) + L(t, OL, 3.2) + L(d, GOLD, 2) + L(t, GOLD, 1.4) + ring(q(1, 0)[0], q(1, 0)[1], 2, 2, GOLD, 1.2);
    });
    return o + ring(x, y, 5.4, 5, GOLD, 1.8);
  }
  function shackles(c, p) {
    var e = [p[0] + 3, p[1] + 20];
    return chainLine(p, e, 3, 0.8) + ring(e[0], e[1] + 4, 4.6, 3.6, IRONL, 2) + ring(e[0] + 7, e[1] + 9, 4.2, 3.2, IRONL, 2) + chainLine([e[0] + 2, e[1] + 6], [e[0] + 5, e[1] + 8], 0, 0.6);
  }
  function censer(c, p) {
    var e = [p[0] - 6, p[1] + 26], o = chainLine(p, [e[0], e[1] - 8], 2, 0.7);
    o += C(e[0], e[1], 18, glow(c, EMB, 0.65));
    o += smoke(e[0] - 2, e[1] - 12, 0.32, '#7a6a66', 0.5, -0.6) + flame(c, e[0], e[1] - 8, 0.55);
    o += body(c, pd([[e[0] - 8, e[1] - 4], [e[0] + 8, e[1] - 4], [e[0] + 6, e[1] + 7], [e[0] - 6, e[1] + 7]], true), IRON, R(e[0] - 5, e[1] - 1, 2.4, 5, LAVAY) + R(e[0] - 1.2, e[1] - 1, 2.4, 5, LAVAY) + R(e[0] + 2.6, e[1] - 1, 2.4, 5, LAVAY), 1.6);
    return o + P('M' + pt([e[0] - 8, e[1] - 4]) + 'Q' + pt([e[0], e[1] - 13]) + ' ' + pt([e[0] + 8, e[1] - 4]) + 'Z', c.cel(IRONL), 1.4) + C(e[0], e[1] - 9.4, 1.8, c.cel(GOLD), 0.9) + P(pd([[e[0] - 3, e[1] + 7], [e[0] + 3, e[1] + 7], [e[0], e[1] + 12]], true), c.cel(IRON), 1.1);
  }
  function fireHand(c, p) { return C(p[0] - 1, p[1] - 8, 16, glow(c, EMB, 0.7)) + flame(c, p[0] - 1, p[1] - 3, 0.85) + C(p[0], p[1], 4.4, c.cel('#3a2a22'), 2); }
  function whip(c, pts) {
    var T = taper(pts, 3.8, 1, 6), cl = 'M' + T.s.map(pt).join('L'), tip = T.s[T.s.length - 1], sp = '';
    for (var i = 0; i < 6; i++) { var a = i * PI / 3 + 0.2; sp += 'M' + pt([tip[0] + Math.cos(a) * 2, tip[1] + Math.sin(a) * 2]) + 'L' + pt([tip[0] + Math.cos(a) * 6.4, tip[1] + Math.sin(a) * 6.4]); }
    return L(cl, SHAD, 8, 0.3) + P(T.d, '#3a2230', 1.2) + L(cl, lt(SHAD, 0.35), 0.9, 0.9) + C(tip[0], tip[1], 11, glow(c, SHAD, 0.85)) + L(sp, lt(SHAD, 0.5), 1.1) + C(tip[0], tip[1], 1.6, '#f4e8ff');
  }
  function shadowOrb(c, x, y, r) {
    var o = C(x, y, r * 4, glow(c, SHAD, 0.75)), d = '';
    for (var i = 0; i < 5; i++) { var a = i * PI * 2 / 5 + 0.4; d += 'M' + pt([x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1]) + 'Q' + pt([x + Math.cos(a + 0.6) * r * 2.2, y + Math.sin(a + 0.6) * r * 2.2]) + ' ' + pt([x + Math.cos(a + 1.1) * r * 2.8, y + Math.sin(a + 1.1) * r * 2.8]); }
    return o + L(d, '#2a0a3a', 2.6) + L(d, lt(SHAD, 0.2), 1.1) + C(x, y, r, c.rg([[0, '#f0e0ff'], [0.4, SHAD], [1, '#2a0a4a']]), 1.4);
  }
  function bigAxe(c, p, len, ang, bw, col, hcol, back) {
    var q = dirQ(p, ang), o = haft(c, p, len + 4, ang, hcol || '#3a2418', 4.2, back);
    var blade = function (k, b) { return pd([q(len + 3, -1.5 * k), q(len + 6 + b * 0.25, -b * 0.75 * k), q(len + 2, -b * 1.05 * k), q(len - b * 0.55, -b * 1.12 * k), q(len - b * 1.05, -b * 0.8 * k), q(len - b * 0.75, -1.5 * k)], true); };
    o += P(blade(1, bw), c.cel(col), 1.9) + P(blade(-1, bw), c.cel(dk(col, 0.1)), 1.9);
    o += L('M' + pt(q(len + 4, -bw * 0.72)) + 'L' + pt(q(len - bw * 0.5, -bw * 1.02)) + 'L' + pt(q(len - bw * 0.95, -bw * 0.74)) + 'M' + pt(q(len + 4, bw * 0.72)) + 'L' + pt(q(len - bw * 0.5, bw * 1.02)), '#ffffff', 1.1, 0.6);
    o += L('M' + pt(q(len - bw * 0.1, -bw * 0.3)) + 'L' + pt(q(len - bw * 0.5, -bw * 0.62)) + 'M' + pt(q(len - bw * 0.1, bw * 0.3)) + 'L' + pt(q(len - bw * 0.5, bw * 0.62)), OL, 3) + L('M' + pt(q(len - bw * 0.1, -bw * 0.3)) + 'L' + pt(q(len - bw * 0.5, -bw * 0.62)) + 'M' + pt(q(len - bw * 0.1, bw * 0.3)) + 'L' + pt(q(len - bw * 0.5, bw * 0.62)), EMB, 1.5);
    return o + P(pd([q(len - bw * 0.6, -4), q(len + 2, -4), q(len + 2, 4), q(len - bw * 0.6, 4)], true), c.cel(GOLD), 1.3) + P(pd([q(len + 3, -3), q(len + 15, 0), q(len + 3, 3)], true), c.cel(col), 1.3);
  }
  function warHammer(c, p, len, ang, hw, hh, back) {
    var q = dirQ(p, ang), o = C(q(len, 0)[0], q(len, 0)[1], hw * 2.6, glow(c, EMB, 0.45)) + haft(c, p, len, ang, '#3a2a20', 4.6, back), u0 = len - hh / 2, u1 = len + hh / 2;
    o += L('M' + pt(q(-4, -3)) + 'L' + pt(q(-4, 3)) + 'M' + pt(q(2, -3)) + 'L' + pt(q(2, 3)) + 'M' + pt(q(-(back || 10) + 2, -3)) + 'L' + pt(q(-(back || 10) + 2, 3)), GOLD, 1.6);
    var head = pd([q(u0, -hw), q(u1, -hw), q(u1, hw), q(u0, hw)], true), rune = 'M' + pt(q(u0 + 3, -hw * 0.3)) + 'L' + pt(q(len, -hw * 0.05)) + 'L' + pt(q(u1 - 3, -hw * 0.3)) + 'M' + pt(q(u0 + 3, hw * 0.3)) + 'L' + pt(q(len, hw * 0.05)) + 'L' + pt(q(u1 - 3, hw * 0.3));
    o += body(c, head, IRON, F(pd([q(u0 - 2, hw * 0.1), q(u1 + 2, hw * 0.1), q(u1 + 2, hw + 2), q(u0 - 2, hw + 2)], true), dk(IRON, 0.35), 0.75) + L('M' + pt(q(u0, -hw * 0.62)) + 'L' + pt(q(u1, -hw * 0.62)) + 'M' + pt(q(u0, hw * 0.62)) + 'L' + pt(q(u1, hw * 0.62)), GOLD, 2) + L(rune, LAVA, 2.4) + L(rune, LAVAY, 1), 2);
    o += P(pd([q(u0 - 2, -hw - 3.4), q(u1 + 2, -hw - 3.4), q(u1 + 2, -hw), q(u0 - 2, -hw)], true), c.cel(IRONL), 1.5) + P(pd([q(u0 - 2, hw), q(u1 + 2, hw), q(u1 + 2, hw + 3.4), q(u0 - 2, hw + 3.4)], true), c.cel(dk(IRONL, 0.15)), 1.5);
    return o + P(pd([q(u1, -3), q(u1 + 8, 0), q(u1, 3)], true), c.cel(GOLD), 1.3);
  }
  function wrench(c, p, len, ang) {
    var q = dirQ(p, ang), d = 'M' + pt(q(-6, 0)) + 'L' + pt(q(len, 0));
    return limb(d, IRONL, 4.6) + P(pd([q(len - 4, -5), q(len + 6, -8), q(len + 11, -4), q(len + 4, -2), q(len + 4, 2), q(len + 11, 4), q(len + 6, 8), q(len - 4, 5)], true), c.cel(IRONL), 1.6) + L('M' + pt(q(-4, 0)) + 'L' + pt(q(8, 0)), '#6a3a1e', 3);
  }
  function mailRows(x0, y0, x1, y1, col) { var d = ''; for (var y = y0, r = 0; y < y1; y += 4, r++) for (var x = x0 + (r % 2 ? 2 : 0); x < x1; x += 4) d += 'M' + pt([x - 2, y]) + 'q2,2.4 4,0'; return L(d, col, 0.8, 0.85); }
  function crust(d, w) { return L(d, LAVAD, w + 2.6) + L(d, LAVA, w + 1) + L(d, LAVAY, w * 0.5); }
  function rockPoly(x, y, r, k, seed, sq) { var rr = rng(seed), p = []; for (var i = 0; i < k; i++) { var a = PI * 2 * i / k + rr() * 0.4, f = 0.78 + rr() * 0.3; p.push([x + Math.cos(a) * r * f, y + Math.sin(a) * r * f * (sq || 1)]); } return pd(p, true); }
  function rockChunk(c, x, y, r, col, seed, sq) {
    var d = rockPoly(x, y, r, 7, seed, sq);
    return body(c, d, col, F(pd([[x + r * 0.1, y - r * 1.4], [x + r * 1.5, y - r * 1.4], [x + r * 1.5, y + r * 1.4], [x + r * 0.2, y + r * 1.4]], true), dk(col, 0.35), 0.75) + F(pd([[x - r, y - r], [x + r * 0.1, y - r], [x - r * 0.2, y - r * 0.2], [x - r, y - r * 0.1]], true), lt(col, 0.18), 0.6), 2);
  }
  function blockFist(c, x, y, r, col, seamCol) {
    return body(c, pd([[x - r, y - r * 0.8], [x + r * 0.9, y - r * 0.9], [x + r, y + r * 0.8], [x - r * 0.9, y + r * 0.9]], true), col, F(pd([[x + r * 0.2, y - r * 1.2], [x + r * 1.4, y - r * 1.2], [x + r * 1.4, y + r * 1.2], [x + r * 0.3, y + r * 1.2]], true), dk(col, 0.35), 0.8) + L('M' + pt([x - r, y - r * 0.2]) + 'L' + pt([x + r * 0.2, y - r * 0.25]) + 'M' + pt([x - r, y + r * 0.3]) + 'L' + pt([x + r * 0.2, y + r * 0.3]), dk(col, 0.5), 1.2) + (seamCol ? L('M' + pt([x + r * 0.2, y - r * 0.9]) + 'L' + pt([x + r * 0.25, y + r * 0.9]), seamCol, 1.4) : ''), 2.2);
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    anvilrage_warden: function (c) {
      var mail = '#5c5c66', lea = '#7a3420';
      return dwarfRig(c, {
        beard: 'braids', beardLen: 26, helm: kettleHelm, scar: true,
        shirt: mail, sleeve: mail, forearm: '#4a2a1a', pants: '#2e2626', glove: '#3a2418', belt: '#2a1a14', buckle: IRONL, buckleIn: EMB, boots: '#221a18',
        chest: function (c) { return mailRows(38, 54, 90, 100, dk(mail, 0.45)) + body(c, 'M48,54 L80,54 L84,92 L44,92 Z', lea, F('M70,50 L90,50 L90,94 L74,94 Z', dk(lea, 0.35), 0.8) + L('M60,62 l8,4 M68,62 l-8,4 M60,70 l8,4 M68,70 l-8,4 M60,78 l8,4 M68,78 l-8,4', '#d8b890', 1.2), 1.8); },
        frontTop: function (c) { return keyRing(c, 78, 102); },
        pads: function (c) { return pauldron(c, 83, 60, 11, IRON) + pauldron(c, 45, 62, 13, lt(IRON, 0.05)) + C(45, 58, 1.4, IRONL); },
        shins: function (c) { return P('M44,106 L58,106 L58,116 L44,116 Z', c.cel(IRON), 1.4) + P('M66,106 L80,106 L80,116 L66,116 Z', c.cel(dk(IRON, 0.1)), 1.4); },
        near: [[44, 62], [34, 56], [28, 44]], wNear: function (c, p) { return mace(c, [p[0] + 1, p[1] + 3], 30, -PI / 2 - 0.5); },
        far: [[84, 62], [94, 76], [96, 90]], wFar: function (c, p) { return shackles(c, [p[0] + 1, p[1] + 3]); }
      });
    },
    shadowforge_flame_keeper: function (c) {
      var rb = '#8a1a12';
      return dwarfRig(c, {
        beard: 'fork', beardLen: 30, hair: '#2a1c1a', tips: EMB, band: GOLDD, helm: mitre,
        shirt: rb, sleeve: rb, forearm: rb, glove: '#3a2a22', pants: '#3a1410', belt: IRON, buckle: GOLD, buckleIn: EMB, boots: '#1e1614',
        chest: function (c) { return L('M42,58 L64,74 L86,58', OL, 5.4) + L('M42,58 L64,74 L86,58', IRONX, 3.4) + L('M44,60 L64,74 L84,60', GOLD, 1) + flame(c, 64, 88, 0.55, LAVA, LAVAY); },
        front: function (c) { var d = 'M42,94 L86,94 C90,104 92,112 95,119 L33,119 C36,112 38,104 42,94 Z'; return body(c, d, rb, F('M72,92 L98,92 L98,122 L78,122 C78,108 76,100 72,92 Z', dk(rb, 0.35), 0.8) + L('M34,115 L94,115', OL, 5) + L('M34,115 L94,115', IRONX, 3.4) + L('M36,114 L92,114', EMB, 1) + L('M50,100 L46,112 M64,100 L64,112 M78,100 L82,112', dk(rb, 0.35), 1.1), 2); },
        pads: function (c) { return pauldron(c, 83, 60, 10, IRONX, GOLD) + pauldron(c, 45, 62, 12, IRON, GOLD); },
        near: [[44, 62], [34, 74], [28, 82]], wNearFront: function (c, p) { return censer(c, p); },
        far: [[84, 62], [96, 56], [102, 44]], farHand: fireHand
      });
    },
    ragereaver_golem: function (c) {
      var ir = '#4a4852', ird = '#302e36', o = shadow(c, 64, 46);
      var seam = function (d, w) { return crust(d, w || 1.2); };
      o += smoke(84, 16, 0.4, '#5a5058', 0.5, 1) + smoke(96, 22, 0.32, '#5a5058', 0.45, 1);
      o += R(80, 16, 8, 20, c.cel(ird), 1.6) + R(93, 22, 7, 16, c.cel(ird), 1.6) + R(79, 14, 10, 4, c.cel(IRONL), 1.3) + R(92, 20, 9, 4, c.cel(IRONL), 1.3);
      o += limb('M94,54 L108,74 L104,92', ird, 17) + C(108, 74, 5, c.cel(IRONL), 1.6) + blockFist(c, 104, 100, 11, ird, LAVA);
      o += limb('M80,96 L84,110', ird, 16) + P('M72,112 L96,112 L99,122 L69,122 Z', c.cel(ird), 2) + limb('M52,96 L48,110', ir, 17) + P('M32,112 L60,112 L62,122 L29,122 Z', c.cel(ir), 2);
      var td = 'M30,56 C30,38 90,32 102,48 L100,84 C98,98 84,104 64,104 C44,104 32,98 32,84 Z';
      var riv = ''; [[40, 50], [56, 44], [74, 42], [90, 46], [38, 90], [92, 90]].forEach(function (r) { riv += C(r[0], r[1], 1.6, lt(ir, 0.3), 0.8); });
      o += body(c, td, ir, F('M78,30 L110,30 L110,110 L82,110 C94,90 94,56 78,30 Z', dk(ir, 0.35), 0.8) + seam('M31,66 C50,70 80,70 101,62') + seam('M64,38 L64,76') + riv, 2.6);
      o += C(61, 86, 22, glow(c, LAVA, 0.6)) + P(pd([[46, 76], [76, 76], [74, 98], [48, 98]], true), c.rg([[0, '#fff4b0'], [0.4, LAVAY], [1, LAVAD]]), 2) + L('M53,76 L53,98 M61,76 L61,98 M69,76 L69,98 M47,87 L75,87', OL, 2.6) + L('M53,76 L53,98 M61,76 L61,98 M69,76 L69,98 M47,87 L75,87', IRONL, 1.2);
      o += body(c, pd([[34, 46], [36, 26], [48, 20], [62, 24], [62, 46]], true), ir, F(pd([[52, 18], [66, 18], [66, 48], [54, 48]], true), dk(ir, 0.35), 0.8), 2.2);
      o += P(pd([[33, 30], [52, 24], [60, 28], [40, 34]], true), c.cel(IRONL), 1.6) + C(42, 36, 12, glow(c, LAVAY, 0.8)) + P(pd([[35, 34], [56, 33], [56, 37], [35, 39]], true), LAVAY, 1.2) + L('M38,42 L56,41 M40,45 L55,44', dk(ir, 0.5), 1.4);
      o += body(c, 'M18,64 C12,44 34,34 52,44 L48,62 C40,58 28,58 18,64 Z', lt(ir, 0.06), F('M40,36 L60,36 L60,66 L44,66 Z', dk(ir, 0.3), 0.7) + seam('M20,58 C28,52 40,52 48,56', 0.9), 2.2) + C(28, 48, 1.6, lt(ir, 0.3), 0.8) + C(38, 44, 1.6, lt(ir, 0.3), 0.8);
      o += limb('M36,60 L24,80 L22,94', ir, 18) + C(24, 80, 5.4, c.cel(IRONL), 1.6) + blockFist(c, 22, 102, 13, ir, LAVA);
      return G(o, at(1.02, 64, 122));
    },
    high_interrogator_gerstahn: function (c) {
      var lea = '#2e2230';
      return G(dwarfRig(c, {
        beard: 'none', backHair: gHair, helm: gHelm, eye: '#c890ff', skin: '#6e6a78',
        shirt: lea, sleeve: lea, forearm: '#6e6a78', glove: '#3a2438', pants: '#2a2028', belt: '#1e161c', buckle: IRONL, buckleIn: SHAD, boots: '#1a1418', legW: 12, armW: 10.5,
        torsoD: 'M44,62 C48,54 80,54 84,62 L83,80 L80,99 L48,99 L45,80 Z',
        chest: function (c) { return L('M48,66 L80,88 M80,66 L48,88', OL, 4) + L('M48,66 L80,88 M80,66 L48,88', '#5a2a6a', 2.2) + C(64, 77, 3, c.cel(IRONL), 1.2) + L('M52,60 L76,60', IRONL, 1.4) + C(64, 77, 7, glow(c, SHAD, 0.5)); },
        front: function (c) { var o = ''; [[44, 0], [52, 1], [60, 0], [68, 1], [76, 0]].forEach(function (t, i) { o += P(pd([[t[0], 96], [t[0] + 9, 96], [t[0] + 8, 112 - t[1] * 3], [t[0] + 1, 112 - t[1] * 3]], true), c.cel(i % 2 ? '#3a2a3a' : lea), 1.4) + L('M' + n(t[0] + 1.6) + ',' + n(109 - t[1] * 3) + ' L' + n(t[0] + 7.4) + ',' + n(109 - t[1] * 3), SHAD, 1, 0.9); }); return o; },
        pads: function (c) { return pauldron(c, 82, 62, 9, IRONX) + pauldron(c, 47, 63, 11, IRON, SHAD) + P(pd([[42, 58], [38, 46], [48, 56]], true), c.cel(IRONL), 1.2); },
        shins: function (c) { return L('M46,108 l12,0 M68,108 l12,0', SHAD, 1.2, 0.8); },
        near: [[46, 62], [36, 72], [26, 68]], wNearFront: function (c, p) { return limb('M' + pt(p) + 'L' + pt([p[0] - 5, p[1] - 6]), '#4a2a3a', 3) + whip(c, [[p[0] - 4, p[1] - 6], [p[0] - 12, p[1] - 20], [p[0] - 22, p[1] - 12], [p[0] - 20, p[1] + 10], [p[0] - 10, p[1] + 28], [p[0] - 18, p[1] + 44]]); },
        far: [[84, 62], [96, 54], [100, 42]], farHand: function (c, p) { return C(p[0], p[1], 4.4, c.cel('#3a2438'), 2) + shadowOrb(c, p[0] - 1, p[1] - 11, 5.2); }
      }), at(1.06, 64, 122));
    },
    lord_roccor: function (c) {
      var rk = '#433e4e', rkd = '#2a2632', rkl = '#625a74', o = shadow(c, 64, 52), cols = '';
      o += body(c, shag(64, 114, 52, 11, 9, 0.3, 1401), rkd, F('M64,100 L120,100 L120,130 L64,130 Z', '#000', 0.3), 2) + rockChunk(c, 18, 116, 7, rk, 1402) + rockChunk(c, 108, 118, 8, rkd, 1403);
      [[64, 58, 15, 18, -0.5], [78, 52, 17, 38, -0.18], [94, 52, 15, 28, 0.14], [105, 64, 12, 16, 0.5]].forEach(function (k, i) {
        var q = dirQ([k[0], k[1]], -PI / 2 + k[4]), w = k[2] / 2, h = k[3], col = i % 2 ? rk : lt(rk, 0.05);
        cols += body(c, pd([q(0, -w), q(h, -w), q(h, w), q(0, w)], true), col, F(pd([q(-2, w * 0.15), q(h + 6, w * 0.15), q(h + 6, w + 3), q(-2, w + 3)], true), dk(col, 0.4), 0.85) + L('M' + pt(q(2, -w * 0.45)) + 'L' + pt(q(h - 3, -w * 0.45)), lt(col, 0.2), 1.2, 0.8), 1.8);
        cols += P(pd([q(h, -w), q(h + 4, -w * 0.45), q(h + 4, w * 0.6), q(h, w)], true), c.cel(rkl), 1.4);
      });
      o += cols;
      o += rockChunk(c, 98, 66, 10, rkd, 1404) + rockChunk(c, 106, 84, 9, rkd, 1405) + rockChunk(c, 104, 102, 13, rkd, 1406);
      var td = pd([[30, 110], [26, 80], [36, 58], [58, 46], [84, 48], [100, 64], [102, 90], [96, 110]], true);
      o += body(c, td, rk, F(pd([[58, 46], [84, 48], [74, 70], [52, 66]], true), rkl, 0.55) + F(pd([[84, 48], [100, 64], [104, 92], [96, 112], [78, 82]], true), rkd, 0.85) + F(pd([[26, 80], [52, 66], [60, 90], [30, 110]], true), lt(rk, 0.08), 0.5) + L('M52,66 L60,90 L56,110 M74,70 L78,82 L96,112 M60,90 L78,82', dk(rk, 0.5), 1.4) + L('M60,90 L66,98 L63,106', '#d8401a', 1.6, 0.9) + C(64, 98, 8, glow(c, '#ff4a1a', 0.45)), 2.6);
      var hd = pd([[24, 58], [28, 38], [44, 30], [60, 34], [64, 50], [56, 64], [36, 66]], true);
      o += body(c, hd, rk, F(pd([[44, 30], [60, 34], [64, 50], [48, 46]], true), rkl, 0.5) + F(pd([[48, 46], [64, 50], [56, 64], [44, 60]], true), rkd, 0.8), 2.4);
      o += P(pd([[22, 46], [48, 40], [52, 47], [28, 52]], true), c.cel(rkd), 1.8) + gEye(c, 32, 51, 1.9, '#ff4a2a') + gEye(c, 44, 49, 1.7, '#ff4a2a') + L('M28,60 L36,57 L44,60 L50,58', OL, 2.2) + L('M30,58.6 L36,56 L44,58.8', '#ff6a2a', 0.9, 0.8);
      o += rockChunk(c, 36, 68, 11, rk, 1407) + rockChunk(c, 26, 84, 10, rk, 1408) + rockChunk(c, 18, 102, 14, lt(rk, 0.04), 1409);
      return G(o + C(20, 110, 1, '#fff', 0, 0.7) + C(90, 70, 1, '#fff', 0, 0.6), at(1.04, 64, 122));
    },
    bael_gar: function (c) {
      var ck = '#2e1a14', mol = '#f06a14', o = E(64, 118, 60, 10, glow(c, LAVA, 0.75)) + E(64, 119, 56, 6, c.lg([[0, LAVAY], [1, LAVA]]), 1.8);
      // far arm down to a fist on the ground, stubby legs
      o += limb('M96,58 L112,84 L110,104', dk(mol, 0.18), 18) + E(110, 110, 11, 8, c.cel(dk(mol, 0.12)), 2) + P(pd([[102, 64], [114, 76], [110, 84], [100, 74]], true), c.cel(ck), 1.4);
      o += limb('M70,100 L70,113', dk(mol, 0.22), 16) + limb('M90,98 L92,113', dk(mol, 0.28), 15);
      // hunched body with crust plates
      var bd = 'M30,104 C20,80 28,46 54,34 C78,24 106,34 114,58 C120,76 112,96 100,106 L60,110 Z', plates = '';
      [[72, 44, 13, 1], [98, 54, 11, 2], [102, 82, 9, 3], [78, 72, 8, 4]].forEach(function (p) { var d = rockPoly(p[0], p[1], p[2], 6, 1510 + p[3], 0.8); plates += L(d, LAVAY, 5, 0.5) + P(d, c.cel(ck), 1.6) + L('M' + pt([p[0] - p[2] * 0.5, p[1] - p[2] * 0.4]) + 'L' + pt([p[0] + p[2] * 0.2, p[1] - p[2] * 0.55]), '#6a4a3a', 1.2, 0.8); });
      o += body(c, bd, mol, C(60, 80, 30, glow(c, LAVAY, 0.9)) + plates + F('M84,20 L124,20 L124,120 L96,120 C114,90 110,50 84,20 Z', LAVAD, 0.45) + F('M20,98 C40,110 80,114 112,100 L112,124 L20,124 Z', LAVAD, 0.4), 2.6);
      // spikes along the back ridge
      [[54, 36, -0.6, 13], [68, 30, -0.25, 18], [84, 30, 0.12, 20], [100, 38, 0.5, 16], [110, 52, 0.9, 12]].forEach(function (k) { var a = -PI / 2 + k[2], ca = Math.cos(a), sa = Math.sin(a); o += P(pd([[k[0] - sa * 5, k[1] + ca * 5], [k[0] + ca * k[3], k[1] + sa * k[3]], [k[0] + sa * 5, k[1] - ca * 5]], true), c.cel(ck), 1.5); });
      // the head, low and forward: crust brow, white-hot eyes, a glowing maw
      var hd = 'M8,62 C8,46 24,38 40,42 C52,46 56,58 50,70 C44,82 22,86 12,78 C8,74 7,68 8,62 Z';
      o += body(c, hd, lt(mol, 0.06), C(28, 64, 16, glow(c, LAVAY, 0.7)) + F('M36,36 L60,36 L60,86 L42,86 C50,70 48,52 36,36 Z', LAVAD, 0.4), 2.4);
      o += P(pd([[5, 54], [22, 44], [44, 46], [52, 55], [40, 59], [22, 57]], true), c.cel(ck), 1.8) + P(pd([[30, 46], [36, 34], [42, 46]], true), c.cel(ck), 1.4) + gEye(c, 19, 61, 2.3, '#fff4b0') + gEye(c, 34, 60, 2.1, '#fff4b0');
      o += P('M9,70 C18,66 36,66 47,70 C42,83 18,85 9,70 Z', '#3a0e06', 2) + E(28, 75, 12, 3.4, c.lg([[0, LAVA], [1, LAVAY]])) + P(pd([[13, 69], [16, 74], [19, 69]], true) + pd([[36, 69], [39, 74], [42, 70]], true), c.cel(ck), 1.1);
      o += P('M18,80 C17,86 19,90 21,90 C23,90 24,86 22,80 Z', LAVAY, 1.2) + P('M34,81 C33,85 34,88 36,88 C38,88 38,85 37,81 Z', LAVAY, 1.1);
      // near arm to a molten fist on the ground
      o += limb('M52,76 L42,94 L38,106', mol, 20) + crust('M48,84 L42,94 L40,102', 0.9) + E(36, 110, 13, 9, c.cel(mol), 2) + P(pd([[44, 70], [58, 72], [56, 84], [44, 82]], true), c.cel(ck), 1.4);
      o += P('M26,112 C25,117 26,121 28,121 C30,121 31,117 30,112 Z', LAVAY, 1) + P('M114,112 C113,117 114,121 116,121 C118,121 118,117 117,112 Z', LAVAY, 1);
      return G(o + motes(1501, 10, 10, 120, 10, 60, '#ffe080'), at(1.0, 64, 122));
    },
    general_angerforge: function (c) {
      var pl = '#3a3a48';
      return G(dwarfRig(c, {
        beard: 'braids', beardLen: 30, hair: '#1a1618', band: GOLD, helm: crestHelm,
        shirt: pl, sleeve: pl, forearm: pl, glove: pl, pants: '#2a2830', boots: '#1e1c22', belt: '#2a1a14', buckle: GOLD, buckleIn: RED, shadowR: 40,
        back: function (c) { return body(c, 'M52,60 L86,58 C94,76 100,96 106,118 L94,114 L86,120 L76,114 L66,118 C64,96 58,78 52,60 Z', RED, F('M86,56 L110,56 L110,122 L92,122 C92,96 90,76 86,56 Z', REDD, 0.6) + L('M66,117 L76,113 L86,119 L94,113 L105,117', GOLD, 1.6), 2); },
        chest: function (c) { return L('M42,60 L64,68 L86,60', GOLD, 1.8) + L('M64,68 L64,88', dk(pl, 0.5), 1.4) + P(pd([[54, 76], [74, 76], [72, 73], [58, 73], [56, 74]], true), c.cel(GOLD), 1.1) + P(pd([[61, 76], [67, 76], [69, 82], [59, 82]], true), c.cel(GOLD), 1.1) + C(48, 66, 1.3, IRONL) + C(80, 66, 1.3, IRONL) + C(48, 84, 1.3, IRONL) + C(80, 84, 1.3, IRONL); },
        front: function (c) { return P('M42,96 L62,96 L60,112 L44,110 Z', c.cel(pl), 1.6) + P('M66,96 L86,96 L84,110 L68,112 Z', c.cel(dk(pl, 0.1)), 1.6) + L('M43,109 L60,111 M68,111 L84,109', GOLD, 1.6); },
        pads: function (c) { return pauldron(c, 84, 60, 13, dk(pl, 0.05), GOLD) + pauldron(c, 84, 53, 9, pl, GOLD) + pauldron(c, 44, 62, 16, pl, GOLD) + pauldron(c, 44, 54, 11, lt(pl, 0.05), GOLD) + C(44, 50, 2.2, c.cel(RED), 1); },
        shins: function (c) { return P('M43,104 L59,104 L59,116 L43,116 Z', c.cel(pl), 1.4) + P('M65,104 L81,104 L81,116 L65,116 Z', c.cel(dk(pl, 0.1)), 1.4) + E(51, 104, 5, 3.4, c.cel(GOLD), 1.2) + E(73, 104, 5, 3.4, c.cel(GOLD), 1.2); },
        near: [[44, 62], [32, 58], [28, 48]], wNear: function (c, p) { return bigAxe(c, p, 30, -PI / 2 - 0.22, 17, '#b8bcc6', '#3a2418', 30); }, nearHand: gauntlet(pl),
        far: [[84, 62], [94, 76], [92, 90]], farHand: gauntlet(dk(pl, 0.1))
      }), at(1.1, 64, 122));
    },
    golem_lord_argelmach: function (c) {
      var sh = '#3a3438', lea = '#6a4a2e';
      var arm = function (c, pts, tipFn) { var o = ''; for (var i = 0; i < pts.length - 1; i++) o += limb(pd([pts[i], pts[i + 1]]), i % 2 ? IRONL : IRON, 5.4 - i * 0.6) + L(pd([pts[i], pts[i + 1]]), BRASS, 1, 0.6); pts.forEach(function (p, i) { if (i < pts.length - 1) o += C(p[0], p[1], 3.4, c.cel(BRASS), 1.3); }); return o + tipFn(pts[pts.length - 1]); };
      return G(dwarfRig(c, {
        beard: 'fork', beardLen: 24, hair: '#262022', tips: '#ff9a3a', band: BRASS, helm: engCap,
        shirt: sh, sleeve: sh, forearm: '#5a4a3a', glove: '#4a3020', pants: '#2e2a2a', belt: '#3a2618', buckle: BRASS, buckleIn: EMB, boots: '#1e1a18',
        back: function (c) {
          var o = body(c, 'M72,52 L100,50 L104,86 L78,88 Z', IRON, R(84, 60, 12, 16, c.rg([[0, '#fff4b0'], [0.5, LAVAY], [1, LAVA]]), 1.4) + L('M76,58 L102,56 M77,80 L103,80', BRASS, 1.4), 2) + R(88, 40, 6, 12, c.cel(IRONX), 1.4) + smoke(91, 36, 0.3, '#6a6068', 0.5, 1);
          o += arm(c, [[82, 52], [96, 28], [74, 12], [52, 12]], function (p) { return P(pd([[p[0] + 2, p[1] - 3], [p[0] - 10, p[1] - 8], [p[0] - 6, p[1] - 2]], true), c.cel(IRONL), 1.3) + P(pd([[p[0] + 2, p[1] + 3], [p[0] - 10, p[1] + 8], [p[0] - 6, p[1] + 2]], true), c.cel(IRONL), 1.3) + C(p[0], p[1], 3, c.cel(BRASS), 1.2); });
          o += arm(c, [[98, 62], [114, 50], [116, 30]], function (p) { return C(p[0], p[1] - 4, 12, glow(c, '#8ae8ff', 0.8)) + P(pd([[p[0] - 3, p[1]], [p[0] + 3, p[1]], [p[0] + 2, p[1] - 5], [p[0] - 2, p[1] - 5]], true), c.cel(BRASS), 1.2) + flame(c, p[0], p[1] - 4, 0.45, '#5ac8ff', '#e8fcff'); });
          return o;
        },
        chest: function (c) { return body(c, 'M48,60 L80,60 L82,94 L46,94 Z', lea, F('M70,56 L90,56 L90,96 L74,96 Z', dk(lea, 0.35), 0.8) + R(54, 70, 12, 9, c.cel(dk(lea, 0.15)), 1.2) + L('M57,64 L57,74 M61,63 L62,74', IRONL, 1.6) + C(52, 60, 1.6, c.cel(BRASS), 0.8) + C(76, 60, 1.6, c.cel(BRASS), 0.8), 1.8); },
        front: function (c) { return body(c, 'M46,94 L82,94 L84,112 L44,112 Z', lea, F('M72,92 L90,92 L90,114 L76,114 Z', dk(lea, 0.35), 0.8) + L('M48,108 L82,108', dk(lea, 0.4), 1.2), 1.8) + wrench(c, [80, 100], 10, PI / 2 - 0.2); },
        pads: function (c) { return pauldron(c, 83, 60, 10, IRON, BRASS) + pauldron(c, 45, 62, 12, IRONL, BRASS); },
        near: [[44, 62], [34, 74], [28, 84]], wNear: function (c, p) { return wrench(c, [p[0] + 2, p[1] + 4], 30, -PI / 2 - 0.34); },
        far: [[84, 62], [92, 76], [94, 88]], farHand: function (c, p) { return C(p[0], p[1], 4.4, c.cel('#4a3020'), 2) + C(p[0] + 1, p[1] - 7, 12, glow(c, LAVA, 0.7)) + C(p[0] + 1, p[1] - 7, 5, c.rg([[0, '#fff4b0'], [0.5, LAVAY], [1, LAVAD]]), 1.4) + ring(p[0] + 1, p[1] - 7, 6.4, 6.4, BRASS, 1.2); }
      }), at(1.06, 64, 122));
    },
    magmus: function (c) {
      var cr = '#2e2426', crl = '#443638', o = shadow(c, 64, 52);
      o += C(106, 18, 20, glow(c, LAVA, 0.8)) + flame(c, 106, 20, 0.9) + flame(c, 99, 22, 0.5) + flame(c, 113, 22, 0.5);
      o += limb('M86,50 L104,46 L106,34', cr, 17) + crust('M92,49 L100,47 M105,42 L106,36', 0.9) + blockFist(c, 106, 28, 10, cr, LAVA) + P(pd([[98, 36], [114, 36], [114, 42], [98, 42]], true), c.cel(IRON), 1.6) + C(102, 39, 1.1, IRONL) + C(110, 39, 1.1, IRONL);
      o += limb('M76,90 L84,106 L82,114', cr, 18) + crust('M80,96 L83,106', 0.9) + P('M70,114 L94,114 L96,122 L68,122 Z', c.cel(cr), 2) + limb('M52,90 L46,106 L46,114', crl, 19) + crust('M50,94 L47,106', 1) + P('M32,114 L58,114 L60,122 L29,122 Z', c.cel(crl), 2);
      var td = 'M28,58 C30,40 58,32 84,38 C100,42 104,58 100,76 L90,96 L42,98 L32,80 Z';
      o += body(c, td, cr, F('M80,30 L110,30 L110,100 L86,100 C98,80 96,50 80,30 Z', '#000', 0.3) + crust('M34,62 L50,70 L46,86 M50,70 L64,64 L78,72 L74,90 M64,64 L66,50 L84,44 M78,72 L96,66', 1.2) + C(64, 70, 20, glow(c, LAVAY, 0.6)) + F(pd([[64, 56], [67, 64], [75, 62], [69, 68], [74, 76], [66, 72], [62, 80], [61, 72], [53, 74], [58, 67], [53, 60], [61, 63]], true), LAVAY, 0.95) + C(64, 68, 3, '#fff8d0'), 2.8);
      o += P(pd([[22, 58], [36, 46], [52, 48], [44, 62], [28, 66]], true), c.cel(crl), 2) + crust('M28,58 L40,54', 0.8);
      o += P(pd([[34, 44], [18, 30], [28, 50]], true) + pd([[50, 36], [44, 12], [58, 32]], true), c.cel('#1e1618'), 1.6);
      o += body(c, pd([[26, 40], [30, 24], [44, 18], [58, 24], [60, 38], [50, 48], [32, 50]], true), crl, F(pd([[46, 18], [62, 18], [62, 50], [50, 50]], true), dk(crl, 0.4), 0.8), 2.2);
      o += P(pd([[48, 22], [52, 6], [62, 18], [58, 26]], true), c.cel('#1e1618'), 1.6) + P(pd([[30, 26], [18, 10], [36, 22]], true), c.cel('#1e1618'), 1.6);
      o += P(pd([[24, 32], [46, 28], [48, 34], [26, 38]], true), c.cel(cr), 1.6) + gEye(c, 32, 37, 2, LAVAY) + gEye(c, 42, 36, 1.8, LAVAY) + P(pd([[28, 44], [46, 42], [44, 46], [30, 47]], true), LAVA, 1.2);
      o += limb('M38,56 L24,76 L20,92', crl, 18) + crust('M30,66 L24,76 L22,86', 1) + blockFist(c, 20, 100, 12, crl, LAVA) + P(pd([[12, 84], [30, 84], [30, 91], [12, 91]], true), c.cel(IRON), 1.6) + C(16, 87.5, 1.1, IRONL) + C(26, 87.5, 1.1, IRONL) + chainLine([22, 91], [36, 116], 5, 0.9);
      return G(o + motes(1601, 12, 10, 120, 0, 60, '#ffe080'), at(1.0, 64, 122));
    },
    emperor_dagran_thaurissan: function (c) {
      var pl = '#3a3a46', rb = RED;
      return G(dwarfRig(c, {
        beard: 'block', beardLen: 32, hair: '#44424e', lit: '#ffa040', band: GOLD, gem: LAVAY, helm: crown,
        shirt: pl, sleeve: rb, forearm: pl, glove: GOLDD, pants: '#2a2830', boots: '#1e1c22', belt: GOLDD, buckle: GOLD, buckleIn: RED, shadowR: 42,
        back: function (c) { return body(c, 'M46,58 L90,56 C98,76 104,98 110,120 L96,116 L88,121 L78,116 L68,120 C62,98 54,78 46,58 Z', rb, F('M88,54 L114,54 L114,122 L94,122 C94,98 92,76 88,54 Z', REDD, 0.6) + L('M68,119 L78,115 L88,120 L96,115 L109,119', GOLD, 2), 2.2); },
        chest: function (c) { return L('M40,62 L64,72 L88,62', GOLD, 2) + C(64, 80, 4.4, c.cel(GOLD), 1.4) + C(64, 80, 2.2, c.cel(LAVAY), 0.9) + L('M50,86 L78,86', GOLD, 1.4); },
        front: function (c) { return body(c, 'M52,96 L76,96 L80,119 L48,119 Z', rb, F('M68,94 L84,94 L84,121 L70,121 Z', REDD, 0.6) + L('M50,116 L78,116', GOLD, 2) + L('M54,98 L50,116 M74,98 L78,116', GOLD, 1.4) + flame(c, 64, 112, 0.5, LAVA, LAVAY), 1.8); },
        pads: function (c) {
          var fur = shag(64, 60, 30, 9, 11, 0.3, 1701);
          return body(c, fur, '#2e2624', L('M40,60 l3,4 M48,56 l2,5 M56,58 l2,5 M72,58 l-1,5 M80,56 l-2,5 M88,60 l-3,4', '#4a3e3a', 1.2), 2) + pauldron(c, 86, 62, 11, pl, GOLD) + pauldron(c, 42, 64, 13, lt(pl, 0.05), GOLD) + C(42, 60, 2, c.cel(LAVAY), 0.9);
        },
        shins: function (c) { return E(51, 104, 5, 3.4, c.cel(GOLD), 1.2) + E(73, 104, 5, 3.4, c.cel(GOLD), 1.2); },
        near: [[44, 64], [32, 62], [24, 54]], wNear: function (c, p) { return warHammer(c, p, 24, -PI / 2 - 0.3, 11, 18, 26); }, nearHand: gauntlet(GOLDD),
        far: [[84, 64], [94, 78], [92, 92]], farHand: gauntlet(dk(GOLDD, 0.1))
      }), at(1.08, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(IRON), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, BAS) + ground(c, 150, BASM, BAS); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#3c3438"/></svg>'; }
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
