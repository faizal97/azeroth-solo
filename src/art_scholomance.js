/* art_scholomance.js — The Blackcloister art for Realm of Loner (dungeon, levels 57-60: the Hollow Host's school of
 * necromancy in the crypts under Castle Ardmore; the great hall with its classrooms and green braziers, the ossuary with
 * its bone walls, sarcophagus and flesh-construct vat, and the headmaster's study; the acolytes, necromancers and risen
 * constructs, and the bosses Skreel the Herald, Mirela Varga, Bonecrunch, Morvish the Frozen, Instructor Grimsby,
 * Lord Anton Varga and Headmaster Sallow).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * The Blackcloister keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_brd.js. The human head, hood,
 * robe skirt, gothic windows, bookshelves, bone wall, vat, desk and arcane circle are new here.
 * Kept apart from the other undead: the necromancer is a living bald man (not the hooded skull of the Wraithwood
 * skeletal mage), the construct is mauve stitched flesh with bone (not the green Patchwork abomination), Ras is an
 * armoured ice lich crowned with icicles, Mirela is a lilac ghost with two illusion doubles, Anton wears a
 * bottle-green frock coat (not Ashcroft's blue), and Headmaster Sallow is tall and bald with a huge standing collar.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix sc<counter>_).
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
  function Ctx() { this.p = 'sc' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  SCHOLOMANCE: palette
  // ============================================================
  var ST = '#36353f', STL = '#54536a', STD = '#24232b', IRON = '#34343c', IRONL = '#686872';
  var GR = '#46f08a', GRL = '#c8ffd8', GRD = '#1a8a4a', GRX = '#0c2e1c';
  var BONE = '#e4dac0', BONED = '#b0a07e', BONEX = '#6e6250';
  var WD = '#4a2c1c', WDL = '#6e4630', WDD = '#2a180e';
  var PUR = '#3a2448', PURL = '#5a3a70', CRIM = '#6a1a24', GOLD = '#d0a040', GOLDD = '#8a6420', CAND = '#efe4c4';
  var ICE = '#a8dcf4', ICEL = '#eafaff', ICED = '#3a6a9a', NAVY = '#1c2a46';

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
  //  SCENE PIECES (new here)
  // ============================================================
  function gFlame(c, x, y, s) { return flame(c, x, y, s, '#2ed06a', '#d8ffe0'); }
  // front-facing skull with a colour (x = centre)
  function skullC(c, x, y, s, col) {
    col = col || '#ece4cc';
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel(col), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + F(pd([[x - 0.8 * s, y + 1.6 * s], [x + 0.8 * s, y + 1.6 * s], [x, y + 0.2 * s]], true), OL);
  }
  // pointed gothic arch (x = left, y = bottom)
  function archD(x, y, w, h) {
    var s = y - h + w * 0.6;
    return 'M' + pt([x, y]) + 'L' + pt([x, s]) + 'Q' + pt([x + w * 0.02, y - h + w * 0.14]) + ' ' + pt([x + w / 2, y - h]) + 'Q' + pt([x + w * 0.98, y - h + w * 0.14]) + ' ' + pt([x + w, s]) + 'L' + pt([x + w, y]) + 'Z';
  }
  // lancet window with green light, tracery and diamond leading (x = left, y = sill)
  function lancet(c, x, y, w, h) {
    var o = C(x + w / 2, y - h * 0.5, w * 1.2, glow(c, GR, 0.26));
    o += P(archD(x - 5, y + 4, w + 10, h + 9), c.cel(STL), 1.8);
    var g = archD(x, y, w, h), lead = '';
    o += P(g, c.lg([[0, '#9affc0'], [0.45, '#3ad07a'], [1, '#0e4a2a']]), 1.6);
    for (var k = -h; k < w + h; k += 9) lead += 'M' + pt([x + k, y]) + 'L' + pt([x + k + h, y - h]) + 'M' + pt([x + k, y - h]) + 'L' + pt([x + k + h, y]);
    o += '<g clip-path="url(#' + c.clip(g) + ')">' + L(lead, GRX, 0.8, 0.55) + R(x, y - h * 0.4, w, h * 0.4, GRX, 0) + '</g>';
    var tr = 'M' + pt([x + w / 2, y]) + 'L' + pt([x + w / 2, y - h + w * 0.62]) + 'M' + pt([x, y - h * 0.4]) + 'L' + pt([x + w, y - h * 0.4]);
    o += L(tr, OL, 4.2) + L(tr, STL, 2.4) + ring(x + w / 2, y - h + w * 0.42, w * 0.18, w * 0.18, STL, 2);
    return o + R(x - 8, y, w + 16, 5, c.cel(STL), 1.6);
  }
  // clustered gothic pier (x = left, y = floor)
  function pier(c, x, y, w, h) {
    var o = body(c, pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true), STL, F(pd([[x + w * 0.62, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(STL, 0.38), 0.8) +
      L('M' + pt([x + w * 0.3, y - h]) + 'L' + pt([x + w * 0.3, y]) + 'M' + pt([x + w * 0.62, y - h]) + 'L' + pt([x + w * 0.62, y]), dk(STL, 0.32), 1.2) + L('M' + pt([x + 2, y - h]) + 'L' + pt([x + 2, y]), lt(STL, 0.15), 1.2, 0.7), 1.8);
    return o + body(c, pd([[x - 4, y], [x + w + 4, y], [x + w + 4, y - 12], [x - 4, y - 12]], true), ST, F(pd([[x + w * 0.62, y - 14], [x + w + 6, y - 14], [x + w + 6, y + 2], [x + w * 0.62, y + 2]], true), dk(ST, 0.35), 0.8), 1.6);
  }
  function candle(c, x, y, s, h) {
    h = (h || 10) * s;
    return C(x, y - h - 4 * s, 12 * s, glow(c, '#ffd070', 0.5)) + R(x - 2 * s, y - h, 4 * s, h, c.cel(CAND), 1 * s) +
      F(pd([[x - 2 * s, y - h], [x + 2 * s, y - h], [x + 2 * s, y - h + 3 * s], [x + 1 * s, y - h + 2 * s], [x, y - h + 4.5 * s], [x - 1 * s, y - h + 2 * s], [x - 2 * s, y - h + 3.4 * s]], true), '#fffaf0', 0.9) +
      flame(c, x, y - h - 0.6 * s, 0.3 * s, '#ffb040', '#fff4c0');
  }
  function candelabra(c, x, y, s) {
    var o = E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.35);
    o += P(pd([[x - 6 * s, y], [x + 6 * s, y], [x + 2 * s, y - 4 * s], [x - 2 * s, y - 4 * s]], true), c.cel(IRON), 1.2 * s) + limb('M' + pt([x, y - 4 * s]) + 'L' + pt([x, y - 26 * s]), IRON, 2 * s);
    o += L('M' + pt([x - 10 * s, y - 20 * s]) + 'Q' + pt([x - 10 * s, y - 26 * s]) + ' ' + pt([x, y - 26 * s]) + 'Q' + pt([x + 10 * s, y - 26 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]), OL, 3.6 * s) + L('M' + pt([x - 10 * s, y - 20 * s]) + 'Q' + pt([x - 10 * s, y - 26 * s]) + ' ' + pt([x, y - 26 * s]) + 'Q' + pt([x + 10 * s, y - 26 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]), IRONL, 1.6 * s);
    return o + candle(c, x - 10 * s, y - 20 * s, s, 7) + candle(c, x + 10 * s, y - 20 * s, s, 7) + candle(c, x, y - 26 * s, s, 9);
  }
  // bookshelf (x = left, y = floor): shelves of random spines, the odd skull or candle
  function shelf(c, x, y, w, h, seed) {
    var r = rng(seed), o = P(pd([[x - 4, y], [x + w + 4, y], [x + w + 4, y - h], [x - 4, y - h]], true), c.cel(WDD), 1.8);
    var rows = Math.max(1, Math.round(h / 23)), sh = h / rows, cols = ['#5a2230', '#2a3a5a', '#3a4a2a', '#6a4a22', '#4a2a4a', '#26262a', '#6a5a3a', '#1e3a3a', '#7a3a2a'];
    for (var i = 0; i < rows; i++) {
      var yy = y - i * sh - 3;
      o += R(x, yy - sh + 4, w, sh - 4, '#140b07');
      var bx = x + 1, sp = '';
      while (bx < x + w - 4) {
        var bw = 3 + r() * 3.6, bh = (sh - 4) * (0.55 + r() * 0.38), col = cols[Math.floor(r() * cols.length)], roll = r();
        if (roll < 0.06 && bx < x + w - 13) { o += skullC(c, bx + 6, yy - 5, 0.62); bx += 13; continue; }
        if (roll < 0.1 && bx < x + w - 10) { o += candle(c, bx + 4, yy, 0.8, 7); bx += 9; continue; }
        if (roll < 0.2 && bx < x + w - 12) { o += P(pd([[bx, yy], [bx + 3, yy], [bx + 11, yy - bh * 0.85], [bx + 7, yy - bh * 0.95]], true), col, 0.9); bx += 12; continue; }
        o += R(bx, yy - bh, bw, bh, col, 0.9); sp += 'M' + pt([bx + 0.7, yy - bh * 0.72]) + 'l' + n(bw - 1.4) + ',0 M' + pt([bx + 0.7, yy - bh * 0.3]) + 'l' + n(bw - 1.4) + ',0';
        bx += bw + 0.4;
      }
      o += L(sp, GOLD, 0.6, 0.6) + R(x - 4, yy - 1, w + 8, 4.4, c.cel(WDL), 1.2);
    }
    o += R(x - 4, y - h + 1, w + 8, 3, WDD) + R(x - 7, y - h - 5, w + 14, 7, c.cel(WDL), 1.6) + L('M' + pt([x - 4, y - h]) + 'L' + pt([x - 4, y]) + 'M' + pt([x + w + 4, y - h]) + 'L' + pt([x + w + 4, y]), OL, 2.4);
    return o + R(x - 2, y - h, w + 4, h, c.lg([[0, '#000', 0.35], [0.5, '#000', 0], [1, '#000', 0.25]], 0, 0, 1, 0));
  }
  // teacher's lectern, front view, an open book glowing green (x = centre, y = floor)
  function lectern(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 15 * s, 3 * s, '#000', 0, 0.35);
    o += body(c, pd([q(-12, 0), q(12, 0), q(8, -5), q(-8, -5)], true), WD, '', 1.4 * s);
    o += body(c, pd([q(-3.4, -5), q(3.4, -5), q(3.4, -26), q(-3.4, -26)], true), WDL, F(pd([q(0.6, -28), q(5, -28), q(5, -3), q(0.6, -3)], true), dk(WDL, 0.35), 0.8), 1.4 * s);
    o += body(c, pd([q(-15, -26), q(15, -26), q(13, -32), q(-13, -32)], true), WD, L('M' + pt(q(-12, -29)) + 'L' + pt(q(12, -29)), GOLDD, 1 * s), 1.5 * s);
    o += C(q(0, -38)[0], q(0, -38)[1], 16 * s, glow(c, GR, 0.6));
    o += P(pd([q(0, -32), q(-13, -33), q(-13, -39), q(0, -37)], true), c.cel('#e8dcb8'), 1.2 * s) + P(pd([q(0, -32), q(13, -33), q(13, -39), q(0, -37)], true), c.cel('#d8cca8'), 1.2 * s);
    return o + L('M' + pt(q(-10, -35)) + 'l7,0.6 M' + pt(q(-10, -36.6)) + 'l6,0.4 M' + pt(q(3, -35.4)) + 'l7,-0.6 M' + pt(q(3, -37)) + 'l6,-0.4', GRD, 0.8 * s) + C(q(-6, -35)[0], q(-6, -35)[1], 1.2 * s, GR);
  }
  // iron brazier burning green (x = centre, y = floor)
  function greenBrazier(c, x, y, s, h) {
    h = (h == null ? 18 : h) * s; var by = y - h, bw = 12 * s;
    var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.35) + C(x, by - 10 * s, 44 * s, glow(c, GR, 0.5));
    o += P(pd([[x - 9 * s, y + 1], [x - 5 * s, y - 4 * s], [x + 5 * s, y - 4 * s], [x + 9 * s, y + 1]], true), c.cel(IRON), 1.4 * s) + P(pd([[x - 4 * s, y - 4 * s], [x - 2.4 * s, by], [x + 2.4 * s, by], [x + 4 * s, y - 4 * s]], true), c.cel(IRON), 1.4 * s);
    o += gFlame(c, x - 5 * s, by - 5 * s, 0.6 * s) + gFlame(c, x + 5 * s, by - 5 * s, 0.55 * s) + gFlame(c, x, by - 5 * s, 1 * s);
    o += body(c, pd([[x - bw, by - 7 * s], [x + bw, by - 7 * s], [x + bw * 0.7, by + 2 * s], [x - bw * 0.7, by + 2 * s]], true), IRON, F(pd([[x + bw * 0.25, by - 9 * s], [x + bw + 2, by - 9 * s], [x + bw + 2, by + 4 * s], [x + bw * 0.25, by + 4 * s]], true), dk(IRON, 0.35), 0.8) + skullC(c, x - 3 * s, by - 2.4 * s, 0.4 * s, BONED), 1.6 * s);
    return o + E(x, by - 7 * s, bw, 1.8 * s, '#7affa8', 1.1 * s) + gFlame(c, x - 2 * s, by - 7 * s, 0.45 * s);
  }
  // hanging Hollow Host banner: violet cloth, green trim, a skull sigil
  function cultBanner(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - 12], [x, y + h]], true);
    return R(x - 4, y - 3, w + 8, 4.4, c.cel(IRON), 1.2) + body(c, d, PUR, F(pd([[x + w * 0.62, y], [x + w + 2, y], [x + w + 2, y + h + 2], [x + w * 0.62, y + h]], true), dk(PUR, 0.35), 0.7) +
      L('M' + pt([x + 3, y + 2]) + 'L' + pt([x + 3, y + h - 3]) + 'M' + pt([x + w - 3, y + 2]) + 'L' + pt([x + w - 3, y + h - 3]), GR, 1.3, 0.85), 1.6) +
      C(x + w / 2, y + h * 0.4, w * 0.4, glow(c, GR, 0.4)) + L('M' + pt([x + w * 0.22, y + h * 0.62]) + 'L' + pt([x + w * 0.78, y + h * 0.22]) + 'M' + pt([x + w * 0.22, y + h * 0.22]) + 'L' + pt([x + w * 0.78, y + h * 0.62]), OL, 2.6) + L('M' + pt([x + w * 0.22, y + h * 0.62]) + 'L' + pt([x + w * 0.78, y + h * 0.22]) + 'M' + pt([x + w * 0.22, y + h * 0.22]) + 'L' + pt([x + w * 0.78, y + h * 0.62]), BONE, 1.2) + skullC(c, x + w / 2, y + h * 0.4, w / 26, '#cfe8d4');
  }
  // ossuary wall: alternating rows of skulls and stacked long bones
  function boneWall(c, x0, y0, x1, y1, seed, skip) {
    var r = rng(seed), o = R(x0, y0, x1 - x0, y1 - y0, '#1c1814'), row = 0;
    for (var y = y0 + 8; y < y1 - 3; y += 11, row++) {
      if (row % 2 === 0) { for (var x = x0 + 6 + (row % 4 ? 7 : 0); x < x1 - 4; x += 14) { var sz = 0.66 + r() * 0.1, cl = r() < 0.5 ? BONE : BONED; if (!skip || !skip(x, y)) o += '<path d="M' + pt([x - 6 * sz, y + 2 * sz]) + 'C' + pt([x - 7 * sz, y - 8 * sz]) + ' ' + pt([x + 7 * sz, y - 8 * sz]) + ' ' + pt([x + 6 * sz, y + 2 * sz]) + 'L' + pt([x + 4 * sz, y + 6 * sz]) + 'L' + pt([x - 4 * sz, y + 6 * sz]) + 'Z" fill="' + cl + '" stroke="' + OL + '" stroke-width="1.1"/>' + P('M' + pt([x - 2.6 * sz, y - 1]) + 'm-1.8,0a1.8,2 0 1,0 3.6,0a1.8,2 0 1,0 -3.6,0M' + pt([x + 2.6 * sz, y - 1]) + 'm-1.8,0a1.8,2 0 1,0 3.6,0a1.8,2 0 1,0 -3.6,0', OL); } }
      else {
        var d = '', k = '';
        for (var xx = x0 - 4; xx < x1; xx += 11) { var yy = y - 1 + r() * 2, dy = (r() - 0.5) * 2; if (skip && skip(xx + 5, y)) continue; d += 'M' + pt([xx, yy]) + 'L' + pt([xx + 10, yy + dy]); k += 'M' + pt([xx, yy - 1.4]) + 'l0,2.8'; }
        o += L(d, OL, 5.4) + L(d, BONED, 3.2) + L(k, BONE, 2.4);
      }
    }
    return o;
  }
  function bonePile(c, x, y, s, seed) {
    var r = rng(seed), o = E(x, y + 1, 22 * s, 4 * s, '#000', 0, 0.35);
    for (var i = 0; i < 7; i++) o += bone(x + (r() - 0.5) * 30 * s, y - r() * 6 * s, (10 + r() * 8) * s, (r() - 0.5) * 2.4, s * 0.9);
    return o + skullC(c, x - 6 * s, y - 7 * s, 0.9 * s) + skullC(c, x + 7 * s, y - 5 * s, 0.75 * s, BONED);
  }
  // stone sarcophagus with a carved lid, green light leaking from a crack (x = centre, y = floor)
  function sarcophagus(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 62 * s, 5 * s, '#000', 0, 0.45);
    o += body(c, pd([q(-58, 0), q(58, 0), q(58, -8), q(-58, -8)], true), ST, F(pd([q(20, -10), q(60, -10), q(60, 2), q(20, 2)], true), dk(ST, 0.35), 0.8), 1.8 * s);
    o += body(c, pd([q(-50, -8), q(50, -8), q(50, -34), q(-50, -34)], true), STL, F(pd([q(22, -36), q(52, -36), q(52, -6), q(22, -6)], true), dk(STL, 0.35), 0.8) +
      L('M' + pt(q(-44, -12)) + 'L' + pt(q(-44, -30)) + 'L' + pt(q(-18, -30)) + 'L' + pt(q(-18, -12)) + 'Z M' + pt(q(18, -12)) + 'L' + pt(q(18, -30)) + 'L' + pt(q(44, -30)) + 'L' + pt(q(44, -12)) + 'Z', dk(STL, 0.4), 1.3), 1.9 * s);
    o += C(q(0, -21)[0], q(0, -21)[1], 14 * s, glow(c, GR, 0.5)) + skullC(c, q(0, -21)[0], q(0, -21)[1], 1.2 * s, lt(STL, 0.3));
    o += body(c, pd([q(-54, -34), q(54, -34), q(48, -42), q(-48, -42)], true), lt(STL, 0.06), '', 1.8 * s);
    // the effigy lying on the lid: a hooded head, folded hands
    o += P('M' + pt(q(-40, -41)) + 'C' + pt(q(-42, -50)) + ' ' + pt(q(-28, -52)) + ' ' + pt(q(-26, -42)) + 'Z', c.cel(STL), 1.4 * s) + P('M' + pt(q(-26, -41)) + 'C' + pt(q(-10, -48)) + ' ' + pt(q(30, -48)) + ' ' + pt(q(44, -41)) + 'Z', c.cel(dk(STL, 0.05)), 1.4 * s) + E(q(0, -45)[0], q(0, -45)[1], 5 * s, 2.4 * s, c.cel(lt(STL, 0.1)), 1.1 * s);
    var cr = 'M' + pt(q(12, -34)) + 'l3,5 l-2,6 l5,7 l-1,6';
    return o + L(cr, GRD, 3, 0.9) + L(cr, GR, 1.4) + L(cr, GRL, 0.6) + L('M' + pt(q(-6, -42)) + 'l4,-1', GR, 1, 0.8);
  }
  // flesh-construct vat: iron-banded glass tank of green fluid with a hunched body inside, pipes to the ceiling (x = centre, y = floor)
  function vat(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, w = 28, top = -86, o = C(q(0, -46)[0], q(0, -46)[1], 62 * s, glow(c, GR, 0.35));
    o += limb('M' + pt(q(-12, top)) + 'L' + pt(q(-12, -200)), IRON, 5 * s) + limb('M' + pt(q(14, top)) + 'L' + pt(q(14, top - 12)) + 'L' + pt(q(40, top - 12)) + 'L' + pt(q(40, -200)), IRON, 4 * s);
    o += E(x, y + 2, 38 * s, 4 * s, '#000', 0, 0.45);
    var g = pd([q(-w, -14), q(w, -14), q(w, top + 8), q(-w, top + 8)], true);
    o += P(g, c.lg([[0, '#7affb0'], [0.35, '#2ec872'], [1, '#0e5a32']]), 2 * s);
    o += '<g clip-path="url(#' + c.clip(g) + ')">' +
      F('M' + pt(q(-12, -14)) + 'C' + pt(q(-16, -30)) + ' ' + pt(q(-14, -52)) + ' ' + pt(q(-4, -58)) + 'C' + pt(q(-10, -62)) + ' ' + pt(q(-8, -74)) + ' ' + pt(q(0, -74)) + 'C' + pt(q(8, -74)) + ' ' + pt(q(10, -64)) + ' ' + pt(q(4, -58)) + 'C' + pt(q(16, -54)) + ' ' + pt(q(18, -34)) + ' ' + pt(q(12, -14)) + 'Z', '#0a3a20', 0.75) +
      C(q(-16, -30)[0], q(-16, -30)[1], 2.2 * s, GRL, 0, 0.7) + C(q(-10, -48)[0], q(-10, -48)[1], 1.6 * s, GRL, 0, 0.7) + C(q(16, -40)[0], q(16, -40)[1], 2.6 * s, GRL, 0, 0.6) + C(q(12, -66)[0], q(12, -66)[1], 1.8 * s, GRL, 0, 0.7) + C(q(-18, -70)[0], q(-18, -70)[1], 1.4 * s, GRL, 0, 0.7) +
      R(q(-w, top + 8)[0], q(0, top + 8)[1], 2 * w * s, 6 * s, '#ffffff', 0) + '</g>';
    o += L('M' + pt(q(-w + 6, -20)) + 'L' + pt(q(-w + 6, top + 16)), '#ffffff', 2.2 * s, 0.35) + L('M' + pt(q(-w + 11, -24)) + 'L' + pt(q(-w + 11, top + 30)), '#ffffff', 1 * s, 0.3);
    [-14, -50].forEach(function (v) { o += body(c, pd([q(-w - 3, v), q(w + 3, v), q(w + 3, v - 6), q(-w - 3, v - 6)], true), IRON, C(q(-w + 2, v - 3)[0], q(0, v - 3)[1], 1.1 * s, IRONL) + C(q(w - 2, v - 3)[0], q(0, v - 3)[1], 1.1 * s, IRONL), 1.5 * s); });
    o += body(c, pd([q(-w - 6, 0), q(w + 6, 0), q(w + 3, -14), q(-w - 3, -14)], true), IRON, F(pd([q(8, -16), q(w + 8, -16), q(w + 8, 2), q(8, 2)], true), dk(IRON, 0.35), 0.8), 1.8 * s);
    o += body(c, 'M' + pt(q(-w - 4, top + 8)) + 'C' + pt(q(-w, top - 4)) + ' ' + pt(q(w, top - 4)) + ' ' + pt(q(w + 4, top + 8)) + 'Z', IRON, F(pd([q(8, top - 8), q(w + 8, top - 8), q(w + 8, top + 10), q(8, top + 10)], true), dk(IRON, 0.35), 0.8), 1.8 * s);
    return o + R(q(w + 3, -40)[0], q(0, -40)[1], 8 * s, 4 * s, c.cel(IRONL), 1 * s) + limb('M' + pt(q(w + 11, -38)) + 'L' + pt(q(w + 18, -38)) + 'L' + pt(q(w + 18, -4)), IRON, 3 * s);
  }
  // the headmaster's chair: tall gothic back with finials, a horned skull on the crest (x = centre, y = seat level)
  function skullChair(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = C(q(0, -70)[0], q(0, -70)[1], 30 * s, glow(c, GR, 0.4));
    var back = pd([q(-26, 0), q(-26, -60), q(-30, -66), q(-22, -70), q(-14, -78), q(0, -74), q(14, -78), q(22, -70), q(30, -66), q(26, -60), q(26, 0)], true);
    o += body(c, back, WDD, F(pd([q(8, -90), q(40, -90), q(40, 4), q(8, 4)], true), dk(WDD, 0.4), 0.7) + L(pd([q(-22, -2), q(-22, -58), q(-18, -66), q(-12, -72), q(0, -68), q(12, -72), q(18, -66), q(22, -58), q(22, -2)]), GOLDD, 1.4 * s), 2 * s);
    o += P(pd([q(-17, -4), q(-17, -56), q(0, -64), q(17, -56), q(17, -4)], true), c.lg([[0, PURL], [1, PUR]]), 1.6 * s) + L('M' + pt(q(-10, -48)) + 'L' + pt(q(0, -58)) + 'L' + pt(q(10, -48)) + 'M' + pt(q(0, -58)) + 'L' + pt(q(0, -8)), dk(PUR, 0.4), 1 * s);
    [-1, 1].forEach(function (k) { o += limb('M' + pt(q(k * 29, 0)) + 'L' + pt(q(k * 29, -64)), WD, 4 * s) + P(pd([q(k * 29 - 3, -64), q(k * 29 + 3, -64), q(k * 29, -76)], true), c.cel(GOLDD), 1.2 * s); });
    o += P(pd([q(-7, -78), q(-16, -92), q(-8, -84)], true) + pd([q(7, -78), q(16, -92), q(8, -84)], true), c.cel(BONED), 1.3 * s);
    return o + skullC(c, q(0, -80)[0], q(0, -80)[1], 1.25 * s) + C(q(-3.2, -81)[0], q(0, -81)[1], 1.2 * s, GR) + C(q(3.2, -81)[0], q(0, -81)[1], 1.2 * s, GR);
  }
  // the headmaster's desk, front view, with its clutter (x = centre, y = floor)
  function desk(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 72 * s, 5 * s, '#000', 0, 0.45);
    o += body(c, pd([q(-62, 0), q(62, 0), q(62, -22), q(-62, -22)], true), WD, F(pd([q(24, -24), q(64, -24), q(64, 2), q(24, 2)], true), dk(WD, 0.35), 0.8) +
      L('M' + pt(q(-56, -4)) + 'L' + pt(q(-56, -18)) + 'L' + pt(q(-22, -18)) + 'L' + pt(q(-22, -4)) + 'Z M' + pt(q(22, -4)) + 'L' + pt(q(22, -18)) + 'L' + pt(q(56, -18)) + 'L' + pt(q(56, -4)) + 'Z M' + pt(q(-16, -18)) + 'L' + pt(q(16, -18)), dk(WD, 0.45), 1.3 * s) +
      C(q(-39, -11)[0], q(0, -11)[1], 1.6 * s, GOLD) + C(q(39, -11)[0], q(0, -11)[1], 1.6 * s, GOLD), 1.9 * s);
    o += skullC(c, x, q(0, -9)[1], 0.9 * s, BONED);
    o += body(c, pd([q(-68, -22), q(68, -22), q(66, -28), q(-66, -28)], true), WDL, L('M' + pt(q(-64, -25)) + 'L' + pt(q(64, -25)), lt(WDL, 0.2), 1, 0.7), 1.8 * s);
    // book stack, a skull with a candle, an open grimoire, a candelabrum, ink and quill
    o += R(q(-56, -34)[0], q(0, -34)[1], 22 * s, 6 * s, c.cel('#5a2230'), 1.1 * s) + R(q(-54, -39)[0], q(0, -39)[1], 19 * s, 5 * s, c.cel('#2a3a5a'), 1.1 * s) + R(q(-55, -43)[0], q(0, -43)[1], 16 * s, 4 * s, c.cel('#3a4a2a'), 1.1 * s);
    o += skullC(c, q(-22, -34)[0], q(0, -34)[1], 1 * s) + candle(c, q(-22, -40)[0], q(0, -40)[1], s, 7);
    o += C(q(6, -32)[0], q(0, -32)[1], 14 * s, glow(c, GR, 0.55)) + P(pd([q(6, -28), q(-10, -29), q(-10, -34), q(6, -32)], true), c.cel('#e8dcb8'), 1.1 * s) + P(pd([q(6, -28), q(22, -29), q(22, -34), q(6, -32)], true), c.cel('#d8cca8'), 1.1 * s) + L('M' + pt(q(-7, -31)) + 'l11,0.6 M' + pt(q(9, -30.6)) + 'l10,-0.4', GRD, 0.9 * s);
    o += candelabra(c, q(44, -28)[0], q(0, -28)[1], 0.8 * s);
    o += R(q(28, -33)[0], q(0, -33)[1], 6 * s, 5 * s, c.cel('#1e1e28'), 1 * s) + L('M' + pt(q(31, -33)) + 'Q' + pt(q(34, -42)) + ' ' + pt(q(40, -48)), OL, 2.2 * s) + L('M' + pt(q(31, -33)) + 'Q' + pt(q(34, -42)) + ' ' + pt(q(40, -48)), '#e8e0d0', 1 * s);
    return o;
  }
  // glowing arcane circle on the floor: two rings, glyph ticks, a pentagram
  function arcaneCircle(c, cx, cy, rx, ry) {
    var o = E(cx, cy, rx * 1.2, ry * 1.6, glow(c, GR, 0.38));
    o += L(ellD(cx, cy, rx, ry), GRD, 4.4, 0.8) + L(ellD(cx, cy, rx, ry), GR, 1.6) + L(ellD(cx, cy, rx * 0.8, ry * 0.8), GRD, 3, 0.7) + L(ellD(cx, cy, rx * 0.8, ry * 0.8), GR, 1.1);
    var g = '';
    for (var i = 0; i < 20; i++) {
      var a = i * PI * 2 / 20, x = cx + Math.cos(a) * rx * 0.9, y = cy + Math.sin(a) * ry * 0.9, k = i % 4, sc = 0.6 + 0.4 * (Math.sin(a) + 1) / 2;
      g += k === 0 ? 'M' + pt([x - 2.4 * sc, y - 1.2 * sc]) + 'l' + n(4.8 * sc) + ',' + n(2.4 * sc) : k === 1 ? 'M' + pt([x - 1, y - 2 * sc]) + 'l0,' + n(3.4 * sc) + ' l' + n(2.6 * sc) + ',-1' : k === 2 ? 'M' + pt([x - 2.4 * sc, y + 1]) + 'l' + n(2.4 * sc) + ',' + n(-2 * sc) + ' l' + n(2.4 * sc) + ',' + n(2 * sc) : 'M' + pt([x - 2 * sc, y - 1.2]) + 'l' + n(4 * sc) + ',0 l' + n(-4 * sc) + ',' + n(2.4 * sc);
    }
    o += L(g, GRL, 1.1, 0.9);
    var p = [];
    for (var j = 0; j < 5; j++) { var a2 = -PI / 2 + j * PI * 2 / 5; p.push([cx + Math.cos(a2) * rx * 0.8, cy + Math.sin(a2) * ry * 0.8]); }
    return o + L('M' + pt(p[0]) + 'L' + pt(p[2]) + 'L' + pt(p[4]) + 'L' + pt(p[1]) + 'L' + pt(p[3]) + 'Z', GR, 1.2, 0.85) + L(ellD(cx, cy, rx * 0.28, ry * 0.28), GR, 1.1, 0.8);
  }
  function sconce(c, x, y) { return P(pd([[x - 5, y + 6], [x + 5, y + 6], [x + 3, y + 10], [x - 3, y + 10]], true), c.cel(IRON), 1.2) + L('M' + pt([x, y + 10]) + 'L' + pt([x, y + 15]), OL, 2.2) + candle(c, x, y + 6, 1.1, 8); }
  function ribs(c, d) { return L(d, OL, 7) + L(d, STL, 3.6) + L(d, lt(STL, 0.15), 1, 0.7); }
  function scatter(c, seed, y0, y1, cnt, x0, x1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), t = 0.6 + (y - y0) / (y1 - y0) * 0.6; o += r() < 0.25 ? skullC(c, x, y, 0.7 * t, BONED) : bone(x, y, 12 * t, (r() - 0.5) * 2.4, 0.8 * t); }
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    scholo_hall: function (c) {
      var o = R(0, 0, 400, 240, '#141319');
      o += brickWall(c, 0, 0, 400, 124, ST, 2101, 12);
      o += R(0, 0, 400, 124, c.lg([[0, '#07060b', 0.85], [0.55, '#07060b', 0.3], [1, GR, 0.06]]));
      // vault ribs springing from the piers
      o += ribs(c, 'M10,40 Q66,-14 129,40 M129,40 Q200,-30 271,40 M271,40 Q334,-14 390,40');
      // the tall lancets over the bookshelves, the great arch in the middle with the Cult banner
      o += lancet(c, 42, 66, 48, 56) + lancet(c, 310, 66, 48, 56);
      o += P(archD(148, 124, 104, 114), c.cel(STL), 2) + P(archD(158, 124, 84, 102), c.lg([[0, '#06100a'], [0.7, '#0a2a18'], [1, '#1a5a34']]), 1.6);
      o += C(200, 118, 50, glow(c, GR, 0.45)) + cultBanner(c, 180, 34, 40, 62) + L('M158,124 L242,124', OL, 1.4);
      o += pier(c, 0, 124, 20, 124) + pier(c, 120, 124, 18, 124) + pier(c, 262, 124, 18, 124) + pier(c, 380, 124, 20, 124);
      o += sconce(c, 129, 60) + sconce(c, 271, 60);
      o += chainLine([108, 0], [112, 44], 3, 1) + chainLine([292, 0], [288, 36], 3, 1) + L('M112,44 l0,5 q-5,2 -2,7', OL, 3) + L('M112,44 l0,5 q-5,2 -2,7', IRONL, 1.4);
      o += shelf(c, 26, 122, 80, 44, 2102) + shelf(c, 294, 122, 80, 44, 2103);
      // floor and the violet runner out of the arch
      o += darkFloor(c, 122, '#3c3a46', 2104) + L('M-2,122 L402,122', OL, 1.6);
      o += P('M170,122 L230,122 L290,244 L110,244 Z', c.lg([[0, dk(PUR, 0.2)], [1, PURL]]), 1.6) + L('M175,122 L120,244 M225,122 L280,244', GR, 1.4, 0.6);
      o += greenBrazier(c, 146, 130, 0.9, 16) + greenBrazier(c, 254, 130, 0.9, 16);
      o += lectern(c, 96, 140, 0.9) + candelabra(c, 346, 134, 0.9);
      o += greenBrazier(c, 22, 176, 1.15, 22) + greenBrazier(c, 380, 184, 1.15, 22);
      o += scatter(c, 2106, 150, 232, 6, 20, 120) + pebbles(2107, 150, 236, '#22202a', 14, 10, 390);
      return o + motes(2105, 22, 0, 400, 10, 200, '#a0ffc0') + R(0, 0, 400, 240, c.rg([[0, '#40ff80', 0], [0.7, '#000', 0.15], [1, '#000', 0.55]]));
    },
    scholo_crypt: function (c) {
      var o = R(0, 0, 400, 240, '#121014');
      o += boneWall(c, 0, 0, 400, 124, 2201, function (x, y) { return x < 14 || (x > 122 && x < 132) || (x > 268 && x < 278) || x > 386 || (x > 150 && x < 250 && y > 30) || (x > 42 && x < 86 && y > 40); });
      o += R(0, 0, 400, 124, c.lg([[0, '#050406', 0.85], [0.5, '#050406', 0.5], [1, '#050406', 0.3]]));
      // low vault and piers in dark stone
      o += ribs(c, 'M8,44 Q60,-8 118,44 M282,44 Q340,-8 392,44') + pier(c, 0, 124, 18, 124) + pier(c, 118, 124, 18, 124) + pier(c, 264, 124, 18, 124) + pier(c, 382, 124, 18, 124);
      // the sarcophagus recess
      o += P(archD(140, 124, 120, 110), c.cel(ST), 2) + P(archD(150, 124, 100, 98), c.lg([[0, '#060808'], [1, '#12301e']]), 1.6) + C(200, 110, 60, glow(c, GR, 0.35));
      o += chainLine([160, 30], [240, 30], 14, 1) + skullC(c, 200, 60, 1.3) + gFlame(c, 200, 50, 0.4);
      o += sarcophagus(c, 200, 124, 0.9);
      // the flesh vat at the left, bone piles and candles on skulls
      o += vat(c, 64, 124, 0.95);
      o += chainLine([300, 0], [306, 60], 3, 1) + chainLine([356, 0], [350, 48], 3, 1) + L('M306,60 l0,5 q-5,2 -2,7 M350,48 l0,5 q-5,2 -2,7', OL, 3) + L('M306,60 l0,5 q-5,2 -2,7 M350,48 l0,5 q-5,2 -2,7', IRONL, 1.4);
      o += darkFloor(c, 122, '#3a3432', 2202) + L('M-2,122 L402,122', OL, 1.6);
      o += bonePile(c, 118, 130, 0.9, 2203) + bonePile(c, 284, 128, 0.8, 2204);
      o += skullC(c, 140, 126, 0.9) + candle(c, 140, 120, 0.9, 6) + skullC(c, 262, 126, 0.9) + candle(c, 262, 120, 0.9, 6);
      o += greenBrazier(c, 22, 176, 1.15, 22) + greenBrazier(c, 380, 184, 1.15, 22);
      o += bonePile(c, 60, 226, 1.1, 2205) + scatter(c, 2206, 140, 234, 12, 10, 390) + pebbles(2207, 150, 236, '#1e1a18', 14, 10, 390);
      return o + motes(2208, 20, 0, 400, 20, 200, '#a0ffc0') + R(0, 0, 400, 240, c.rg([[0, '#40ff80', 0], [0.7, '#000', 0.18], [1, '#000', 0.6]]));
    },
    scholo_study: function (c) {
      var o = R(0, 0, 400, 240, '#16121a');
      o += brickWall(c, 0, 0, 400, 124, '#383240', 2301, 12);
      o += R(0, 0, 400, 124, c.lg([[0, '#07050a', 0.85], [0.6, '#07050a', 0.3], [1, '#07050a', 0.1]]));
      // wood wainscot under the window
      o += R(0, 90, 400, 34, c.lg([[0, WDL], [1, WDD]])) + L('M0,90 L400,90', OL, 2) + L('M0,92 L400,92', lt(WDL, 0.2), 1, 0.6);
      var pn = ''; for (var px = 112; px < 290; px += 24) pn += 'M' + px + ',97 L' + (px + 18) + ',97 L' + (px + 18) + ',118 L' + px + ',118 Z';
      o += L(pn, dk(WDD, 0.3), 1.3);
      // the great window behind the chair, violet drapes
      o += lancet(c, 158, 84, 84, 78);
      [[146, 1], [254, -1]].forEach(function (d) { var x = d[0], k = d[1]; o += body(c, 'M' + (x - 12) + ',0 L' + (x + 12) + ',0 C' + (x + 12 + k * 4) + ',30 ' + (x + 6 + k * 10) + ',60 ' + (x + 8 * k + 6) + ',96 L' + (x - 10 + k * 6) + ',96 C' + (x - 14) + ',60 ' + (x - 12) + ',30 ' + (x - 12) + ',0 Z', PURL, L('M' + (x - 4) + ',2 C' + (x - 4) + ',40 ' + (x - 2) + ',70 ' + x + ',94 M' + (x + 5) + ',2 C' + (x + 5) + ',40 ' + (x + 6) + ',70 ' + (x + 7) + ',94', dk(PURL, 0.4), 1.2), 1.8) + C(x + k * 2, 70, 3, c.cel(GOLD), 1.2); });
      o += R(126, -2, 148, 7, c.cel(IRON), 1.4);
      o += shelf(c, 8, 122, 92, 110, 2302) + shelf(c, 300, 122, 92, 110, 2303);
      o += skullChair(c, 200, 108, 1) + desk(c, 200, 130, 1);
      o += darkFloor(c, 122, '#3a3038', 2304) + L('M-2,122 L402,122', OL, 1.6);
      o += arcaneCircle(c, 268, 196, 112, 26) + arcaneCircle(c, 96, 148, 42, 9);
      o += candelabra(c, 120, 132, 1) + greenBrazier(c, 22, 180, 1.15, 22) + greenBrazier(c, 382, 184, 1.15, 22);
      o += R(116, 214, 16, 5, c.cel('#5a2230'), 1) + R(118, 210, 13, 4, c.cel('#2a3a5a'), 1) + P('M40,210 L70,206 L72,212 L42,216 Z', c.cel('#e8dcb8'), 1.2);
      return o + motes(2305, 20, 0, 400, 10, 200, '#a0ffc0') + R(0, 0, 400, 240, c.rg([[0, '#40ff80', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- human head (facing left). hair: 'cap' | 'bald' | 'bun' | 'lank' | 'updo' | 'none' ----
  function hHead(c, x, y, o) {
    var sk = o.skin || '#d8c8b8', s = '', tp = o.tall || 0, ch = o.chin || 0, hc = o.hairCol || '#2a1e18';
    if (o.backHair) s += o.backHair(c, x, y);
    if (o.hair === 'bun') s += C(x + 8, y - 15, 6.4, c.cel(hc), 1.8) + L('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 15, y - 12]), GOLD, 1.2);
    if (o.hair === 'lank') { var T = taper([[x + 6, y - 12], [x + 13, y - 6], [x + 14, y + 6], [x + 15, y + 18]], 9, 3, 5); s += P(T.d, c.cel(hc), 1.6) + L(along(T, 0.5), lt(hc, 0.2), 0.8, 0.8); }
    if (o.hair === 'updo') s += body(c, 'M' + pt([x - 8, y - 10]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 4, y - 30]) + ' ' + pt([x + 14, y - 24]) + 'C' + pt([x + 20, y - 20]) + ' ' + pt([x + 18, y - 6]) + ' ' + pt([x + 12, y - 2]) + 'Z', hc, L('M' + pt([x - 6, y - 16]) + 'C' + pt([x - 4, y - 26]) + ' ' + pt([x + 8, y - 30]) + ' ' + pt([x + 13, y - 22]) + 'M' + pt([x, y - 12]) + 'C' + pt([x + 2, y - 20]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 15, y - 14]), dk(hc, 0.25), 1), 1.8) + C(x + 7, y - 25, 2.4, c.cel('#b8f0ff'), 1);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 9, y - 15 - tp]) + ' ' + pt([x + 8, y - 17 - tp]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13 + ch]) + ' ' + pt([x - 4, y + 12 + ch]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    var sh = F('M' + pt([x + 3, y - 20 - tp]) + 'L' + pt([x + 14, y - 20 - tp]) + 'L' + pt([x + 14, y + 16 + ch]) + 'L' + pt([x + 1, y + 16 + ch]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 20 - tp]) + 'Z', dk(sk, 0.22), 0.8);
    if (o.gaunt) sh += F('M' + pt([x - 8, y + 3]) + 'C' + pt([x - 5, y + 2]) + ' ' + pt([x - 1, y + 3]) + ' ' + pt([x + 2, y + 9]) + 'C' + pt([x - 2, y + 9]) + ' ' + pt([x - 6, y + 8]) + ' ' + pt([x - 8, y + 3]) + 'Z', dk(sk, 0.35), 0.85) + E(x - 5, y - 1, 3.6, 3, dk(sk, 0.45), 0, 0.9);
    if (o.rot) sh += F(ellD(x + 2, y - 9 - tp * 0.5, 3.4, 2.2), dk(sk, 0.4), 0.8) + F(ellD(x - 4, y + 6, 3, 2), dk(sk, 0.5), 0.8);
    if (o.face) sh += o.face;
    if (o.hair === 'bald') sh += E(x - 1, y - 11 - tp, 4.4, 2.2, lt(sk, 0.35), 0, 0.7);
    s += body(c, d, sk, sh, 2);
    if (o.pointEar) s += P(pd([[x + 3, y - 1], [x + 16, y - 7], [x + 7, y + 5]], true), c.cel(sk), 1.4);
    else if (o.hair !== 'none') s += E(x + 5, y + 1, 2.4, 3.4, c.cel(sk), 1.4);
    s += o.glowEye ? glowEye(c, x - 5, y - 1, 1.5, o.eye) : C(x - 5, y - 1, 1.6, o.eye || OL);
    s += L('M' + pt([x - 8.5, y - 5]) + 'L' + pt([x - 2, y - 4.4 - (o.arch || 0)]), o.brow || dk(sk, 0.55), 1.6);
    if (o.rot) s += R(x - 10, y + 5.6, 8, 3.4, c.cel('#e0d4b0'), 1) + L('M' + pt([x - 8, y + 5.6]) + 'l0,3.4 M' + pt([x - 6, y + 5.6]) + 'l0,3.4 M' + pt([x - 4, y + 5.6]) + 'l0,3.4', OL, 0.7);
    else if (o.lips) s += P('M' + pt([x - 9.4, y + 7]) + 'q3.4,-1.2 6.4,0.2 q-3,2.4 -6.4,-0.2 Z', o.lips, 1);
    else s += L('M' + pt([x - 8.6, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    if (o.hair === 'cap' || o.hair === 'bun' || o.hair === 'lank') s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 2]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 1.8);
    if (o.hair === 'updo') s += P('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 13, y - 18]) + ' ' + pt([x + 8, y - 22]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 8, y - 3]) + 'C' + pt([x + 4, y - 12]) + ' ' + pt([x - 4, y - 12]) + ' ' + pt([x - 7, y - 6]) + 'Z', c.cel(hc), 1.6) + L('M' + pt([x + 9, y - 3]) + 'c3,3 -1,6 1,9 c2,3 -1,5 0,7', OL, 3.4) + L('M' + pt([x + 9, y - 3]) + 'c3,3 -1,6 1,9 c2,3 -1,5 0,7', hc, 1.8);
    if (o.specs) s += ring(x - 6, y - 0.6, 3.4, 3.2, GOLD, 0.9) + L('M' + pt([x - 2.6, y - 1]) + 'L' + pt([x + 4, y - 2]), GOLD, 0.9) + C(x - 7, y - 1.8, 0.9, '#ffffff', 0, 0.9);
    if (o.top) s += o.top(c, x, y);
    return s;
  }
  // deep hood over a living face, the upper face in shadow
  function hoodHead(c, x, y, o) {
    var col = o.col, s = '';
    s += body(c, 'M' + pt([x - 6, y - 14]) + 'C' + pt([x, y - 26]) + ' ' + pt([x + 20, y - 22]) + ' ' + pt([x + 21, y - 4]) + 'C' + pt([x + 22, y + 10]) + ' ' + pt([x + 18, y + 18]) + ' ' + pt([x + 12, y + 22]) + 'L' + pt([x - 6, y + 18]) + 'Z', dk(col, 0.2), '', 2);
    s += hHead(c, x, y, { skin: o.skin, hair: 'none', eye: o.eye, glowEye: o.glowEye });
    s += F('M' + pt([x - 14, y - 4]) + 'C' + pt([x - 8, y - 8]) + ' ' + pt([x + 2, y - 8]) + ' ' + pt([x + 8, y]) + 'L' + pt([x + 8, y - 18]) + 'L' + pt([x - 14, y - 18]) + 'Z', '#000', 0.42);
    var d = 'M' + pt([x - 15, y + 2]) + 'C' + pt([x - 19, y - 16]) + ' ' + pt([x - 2, y - 27]) + ' ' + pt([x + 10, y - 23]) + 'C' + pt([x + 22, y - 17]) + ' ' + pt([x + 22, y + 6]) + ' ' + pt([x + 16, y + 18]) + 'L' + pt([x + 6, y + 18]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x - 15, y + 2]) + 'Z';
    return s + body(c, d, col, F('M' + pt([x + 8, y - 26]) + 'L' + pt([x + 24, y - 26]) + 'L' + pt([x + 24, y + 20]) + 'L' + pt([x + 10, y + 20]) + 'Z', dk(col, 0.3), 0.8) +
      L('M' + pt([x - 15, y + 2]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x + 4, y - 8]) + ' ' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y + 18]), o.trim || lt(col, 0.2), 2.2), 2.2);
  }
  // front-facing-ish lich skull (facing left)
  function skullHead(c, x, y, o) {
    var bc = o.bone || '#dfe6ea', s = '';
    var d = 'M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 9, y - 19]) + ' ' + pt([x + 11, y - 6]) + 'C' + pt([x + 12, y + 2]) + ' ' + pt([x + 8, y + 6]) + ' ' + pt([x + 4, y + 7]) + 'L' + pt([x + 2, y + 11]) + 'L' + pt([x - 8, y + 11]) + 'L' + pt([x - 10, y + 6]) + 'L' + pt([x - 13, y + 2]) + 'L' + pt([x - 11, y - 1]) + 'Z';
    s += body(c, d, bc, F(pd([[x + 3, y - 21], [x + 15, y - 21], [x + 15, y + 13], [x + 2, y + 13]], true), dk(bc, 0.3), 0.8) + L('M' + pt([x - 9, y + 4]) + 'C' + pt([x - 4, y + 2]) + ' ' + pt([x + 2, y + 3]) + ' ' + pt([x + 5, y + 6]), dk(bc, 0.4), 1.1), 2);
    s += E(x - 5, y - 1.4, 3.8, 3.4, '#101828', 1.2) + glowEye(c, x - 5, y - 1.4, 1.5, o.eye || '#8ae8ff') + F(pd([[x - 12.4, y + 2], [x - 10, y + 0.4], [x - 10, y + 4]], true), OL);
    s += R(x - 10, y + 6.4, 11, 4.4, c.cel(bc), 1.1) + L('M' + pt([x - 7.4, y + 6.4]) + 'l0,4.4 M' + pt([x - 4.6, y + 6.4]) + 'l0,4.4 M' + pt([x - 1.8, y + 6.4]) + 'l0,4.4 M' + pt([x - 10, y + 8.6]) + 'l11,0', OL, 0.8);
    return s;
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
  function openBook(c, x, y, s, glowCol) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, g = glowCol || GR;
    return C(x, y - 4 * s, 14 * s, glow(c, g, 0.6)) + P(pd([q(0, 2), q(-11, 0), q(-12, -6), q(0, -4)], true), c.cel('#e8dcb8'), 1.3 * s) + P(pd([q(0, 2), q(11, 0), q(12, -6), q(0, -4)], true), c.cel('#d6c8a0'), 1.3 * s) +
      P(pd([q(-12, 0.4), q(0, 2.6), q(12, 0.4), q(12, 2.4), q(0, 4.4), q(-12, 2.4)], true), c.cel('#4a2230'), 1.2 * s) + L('M' + pt(q(-9, -3)) + 'l7,1 M' + pt(q(-9, -1)) + 'l6,1 M' + pt(q(3, -2)) + 'l6,-1', dk(g, 0.4), 0.9 * s) + C(q(5, 0)[0], q(5, 0)[1], 1.2 * s, g);
  }
  function tome(c, x, y, col) {
    return P(pd([[x - 7, y - 9], [x + 7, y - 10], [x + 8, y + 9], [x - 6, y + 10]], true), c.cel(col || '#3a1a2a'), 1.6) + L('M' + pt([x - 5, y - 8]) + 'L' + pt([x - 4, y + 9]), GOLD, 1.2) + skullC(c, x + 1.6, y, 0.5, BONE);
  }
  function necroOrb(c, x, y, r, col) {
    col = col || GR;
    var o = C(x, y, r * 4, glow(c, col, 0.75)), d = '';
    for (var i = 0; i < 5; i++) { var a = i * PI * 2 / 5 + 0.4; d += 'M' + pt([x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1]) + 'Q' + pt([x + Math.cos(a + 0.6) * r * 2.2, y + Math.sin(a + 0.6) * r * 2.2]) + ' ' + pt([x + Math.cos(a + 1.1) * r * 2.8, y + Math.sin(a + 1.1) * r * 2.8]); }
    return o + L(d, dk(col, 0.6), 2.6) + L(d, lt(col, 0.3), 1.1) + C(x, y, r, c.rg([[0, '#ffffff'], [0.4, lt(col, 0.3)], [1, dk(col, 0.4)]]), 1.4);
  }
  // staff topped with a skull between two bone horns and a green flame
  function skullStaff(c, p, len) {
    var t = [p[0], p[1] - len], o = haft(c, p, len, -PI / 2, '#3a2a22', 3.4, 118 - p[1]);
    o += C(t[0], t[1] - 8, 16, glow(c, GR, 0.7)) + gFlame(c, t[0], t[1] - 8, 0.5);
    o += P('M' + pt([t[0] - 3, t[1] + 3]) + 'C' + pt([t[0] - 12, t[1]]) + ' ' + pt([t[0] - 12, t[1] - 10]) + ' ' + pt([t[0] - 9, t[1] - 16]) + 'C' + pt([t[0] - 8, t[1] - 8]) + ' ' + pt([t[0] - 5, t[1] - 4]) + ' ' + pt([t[0], t[1] - 2]) + 'Z', c.cel(BONE), 1.3);
    o += P('M' + pt([t[0] + 3, t[1] + 3]) + 'C' + pt([t[0] + 12, t[1]]) + ' ' + pt([t[0] + 12, t[1] - 10]) + ' ' + pt([t[0] + 9, t[1] - 16]) + 'C' + pt([t[0] + 8, t[1] - 8]) + ' ' + pt([t[0] + 5, t[1] - 4]) + ' ' + pt([t[0], t[1] - 2]) + 'Z', c.cel(BONED), 1.3);
    return o + skullC(c, t[0], t[1] + 1, 1.05) + C(t[0] - 2.7, t[1], 1.1, GR) + C(t[0] + 2.7, t[1], 1.1, GR) + ring(t[0], t[1] + 9, 3, 2, GOLDD, 1.1);
  }
  // three curved bone spikes rising from a dark shoulder guard
  function bonePad(c, x, y, s, col, lean) {
    var o = '';
    lean = lean || 0;
    [[-7, -1, -2.0, 10], [0, -3, -1.55, 13], [7, -1, -1.1, 10]].forEach(function (k) {
      var b = [x + k[0] * s, y + k[1] * s], a = k[2] + lean, L0 = k[3] * s, T = taper([b, [b[0] + Math.cos(a) * L0 * 0.55 + 1, b[1] + Math.sin(a) * L0 * 0.55], [b[0] + Math.cos(a - 0.25) * L0, b[1] + Math.sin(a - 0.25) * L0]], 4.6 * s, 0.6, 4);
      o += P(T.d, c.cel(BONE), 1.3);
    });
    return o + pauldron(c, x, y + 3, 9 * s, col || '#3a3440', BONED);
  }
  // stitched seam: a line with cross ticks
  function seam(pts, col, w) {
    var t = ''; col = col || '#3a141c';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], dd = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.max(1, Math.round(dd / 5)), nx = -dy / dd * 2.6, ny = dx / dd * 2.6;
      for (var j = 0; j < k; j++) { var f = (j + 0.5) / k, x = a[0] + dx * f, y = a[1] + dy * f; t += 'M' + pt([x - nx, y - ny]) + 'L' + pt([x + nx, y + ny]); }
    }
    return L(pd(pts), col, w || 1.5) + L(t, col, 1);
  }
  function wing(c, sh, wr, tips, mem, bc) {
    var d = 'M' + pt(sh) + 'L' + pt(wr) + 'L' + pt(tips[0]);
    for (var i = 1; i < tips.length; i++) { var a = tips[i - 1], b = tips[i]; d += 'Q' + pt([(a[0] + b[0]) / 2 * 0.72 + wr[0] * 0.28, (a[1] + b[1]) / 2 * 0.72 + wr[1] * 0.28]) + ' ' + pt(b); }
    var last = tips[tips.length - 1], end = [sh[0] + (last[0] - sh[0]) * 0.1, sh[1] + 16];
    d += 'Q' + pt([(last[0] + end[0]) / 2 * 0.8 + wr[0] * 0.2, (last[1] + end[1]) / 2 * 0.8 + wr[1] * 0.2]) + ' ' + pt(end) + 'Z';
    var o = P(d, c.lg([[0, lt(mem, 0.12)], [1, dk(mem, 0.25)]]), 2) + limb(pd([sh, wr]), bc, 5.4);
    tips.forEach(function (t) { o += L(pd([wr, t]), OL, 3.8) + L(pd([wr, t]), lt(bc, 0.1), 2); });
    return o + P(pd([[wr[0] - 2, wr[1] + 1], [wr[0] + (wr[0] < sh[0] ? -3 : 3), wr[1] - 8], [wr[0] + 2, wr[1] + 1]], true), c.cel('#e8dcc8'), 1.2);
  }
  function talon(x, y, col) {
    return P('M' + pt([x + 6, y - 6]) + 'C' + pt([x + 7, y - 1]) + ' ' + pt([x + 5, y + 1]) + ' ' + pt([x + 1, y + 1]) + 'L' + pt([x - 7, y + 1]) + 'C' + pt([x - 9, y]) + ' ' + pt([x - 8, y - 4]) + ' ' + pt([x - 4, y - 5]) + 'Z', c_(col), 2) +
      L('M' + pt([x - 7, y]) + 'l-4,1.4 M' + pt([x - 3, y + 0.6]) + 'l-3.6,1.2 M' + pt([x + 4, y - 1]) + 'l3.4,1.6', OL, 3) + L('M' + pt([x - 7, y]) + 'l-4,1.4 M' + pt([x - 3, y + 0.6]) + 'l-3.6,1.2 M' + pt([x + 4, y - 1]) + 'l3.4,1.6', '#efe6cf', 1.3);
  }
  // bundled bones for Bonecrunch: a thick bone limb with a groove, iron bands at the joints
  function boneLimb(c, pts, col, w) {
    var d = pd(pts), o = limb(d, col, w) + L(d, dk(col, 0.3), w * 0.18, 0.9) + L(pd(pts.map(function (p) { return [p[0] - w * 0.25, p[1] - w * 0.1]; })), lt(col, 0.25), w * 0.14, 0.8);
    for (var i = 1; i < pts.length - 1; i++) o += E(pts[i][0], pts[i][1], w * 0.66, w * 0.56, c.cel(lt(col, 0.05)), 2) + E(pts[i][0] + w * 0.25, pts[i][1] + w * 0.2, w * 0.2, w * 0.16, dk(col, 0.35)) + L('M' + pt([pts[i][0] - w * 0.6, pts[i][1] - w * 0.35]) + 'l' + n(w * 1.2) + ',' + n(w * 0.7), OL, 3.6) + L('M' + pt([pts[i][0] - w * 0.6, pts[i][1] - w * 0.35]) + 'l' + n(w * 1.2) + ',' + n(w * 0.7), '#5a3a2a', 1.8);
    return o;
  }
  function skullFist(c, x, y, r, col) {
    return C(x, y, r * 1.1, c.cel(dk(col, 0.1)), 2.2) + skullC(c, x - r * 0.45, y - r * 0.3, r / 11, col) + skullC(c, x + r * 0.4, y - r * 0.35, r / 12, dk(col, 0.08)) + skullC(c, x, y + r * 0.35, r / 10, col) + L('M' + pt([x - r, y - r * 0.2]) + 'Q' + pt([x, y + r * 0.2]) + ' ' + pt([x + r, y - r * 0.3]), OL, 3.6) + L('M' + pt([x - r, y - r * 0.2]) + 'Q' + pt([x, y + r * 0.2]) + ' ' + pt([x + r, y - r * 0.3]), '#5a3a2a', 1.8);
  }
  // ice pauldron with icicle spikes
  function icePauldron(c, x, y, r) {
    var o = '';
    [[-0.6, -2.2, 1], [0, -1.6, 1.3], [0.6, -1.0, 1]].forEach(function (k) { var b = [x + k[0] * r, y - r * 0.4], a = k[1], l = r * 1.3 * k[2]; o += P(pd([[b[0] - Math.sin(a) * 3.4, b[1] + Math.cos(a) * 3.4], [b[0] + Math.cos(a) * l, b[1] + Math.sin(a) * l], [b[0] + Math.sin(a) * 3.4, b[1] - Math.cos(a) * 3.4]], true), c.cel(ICEL), 1.3); });
    return o + pauldron(c, x, y, r, ICE, ICEL) + L('M' + pt([x - r * 0.5, y - r * 0.2]) + 'l' + n(r * 0.5) + ',' + n(-r * 0.3), '#ffffff', 1.2, 0.8);
  }
  function iceCrown(c, x, y) {
    var sp = [[-10, -6, 8, -0.35], [-5, -12, 12, -0.15], [1, -15, 16, 0.05], [7, -13, 12, 0.25], [11, -8, 9, 0.5]], o = C(x + 1, y - 22, 18, glow(c, '#9ae8ff', 0.6));
    sp.forEach(function (k) { var b = [x + k[0], y + k[1]], a = -PI / 2 + k[3], l = k[2]; o += P(pd([[b[0] - 3.2, b[1] + 1], [b[0] + Math.cos(a) * l, b[1] + Math.sin(a) * l], [b[0] + 3.2, b[1] + 1]], true), c.lg([[0, '#ffffff'], [0.6, ICE], [1, '#5aa0d0']]), 1.3) + L('M' + pt([b[0] - 0.6, b[1]]) + 'L' + pt([b[0] + Math.cos(a) * l * 0.8, b[1] + Math.sin(a) * l * 0.8]), '#ffffff', 0.8, 0.8); });
    var band = 'M' + pt([x - 12, y - 5]) + 'C' + pt([x - 6, y - 12]) + ' ' + pt([x + 6, y - 15]) + ' ' + pt([x + 12, y - 9]);
    return o + L(band, OL, 5.4) + L(band, '#6ab8e0', 3.4) + L(band, ICEL, 1) + C(x - 1, y - 11.4, 2.2, c.cel('#c8f8ff'), 1);
  }
  function iceStaff(c, p, len) {
    var t = [p[0], p[1] - len], o = haft(c, p, len, -PI / 2, NAVY, 3.4, 118 - p[1]);
    o += C(t[0], t[1] - 6, 18, glow(c, '#9ae8ff', 0.75));
    [[0, -22, 5.4], [-6, -14, 4], [6, -15, 4]].forEach(function (k) { var b = [t[0] + k[0], t[1] + 2], tip = [t[0] + k[0] * 1.6, t[1] + k[1]]; o += P(pd([b, [b[0] - k[2], (b[1] + tip[1]) / 2 + 3], tip, [b[0] + k[2], (b[1] + tip[1]) / 2 + 3]], true), c.lg([[0, '#ffffff'], [0.5, ICE], [1, '#4a8ac0']]), 1.4); });
    return o + R(t[0] - 5, t[1], 10, 4, c.cel('#6a8ab0'), 1.2);
  }
  function frostOrb(c, x, y, r) {
    var o = C(x, y, r * 4, glow(c, '#9ae8ff', 0.8)), d = '';
    for (var i = 0; i < 6; i++) { var a = i * PI / 3, e = [x + Math.cos(a) * r * 2.4, y + Math.sin(a) * r * 2.4], m = [x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6]; d += 'M' + pt([x, y]) + 'L' + pt(e) + 'M' + pt([m[0] + Math.cos(a + 1) * 2, m[1] + Math.sin(a + 1) * 2]) + 'L' + pt(m) + 'L' + pt([m[0] + Math.cos(a - 1) * 2, m[1] + Math.sin(a - 1) * 2]); }
    return o + L(d, '#2a5a8a', 2.6) + L(d, ICEL, 1.2) + C(x, y, r, c.rg([[0, '#ffffff'], [0.5, ICE], [1, '#4a8ac0']]), 1.3);
  }
  function boneHand(col) { return function (c, p) { return clawHand(p, col, 0.8, col); }; }
  function drain(c, pts, col) {
    var T = taper(pts, 6, 1, 6), cl = 'M' + T.s.map(pt).join('L'), tip = pts[pts.length - 1];
    return L(cl, col, 9, 0.25) + P(T.d, c.lg([[0, lt(col, 0.3), 0.9], [1, col, 0.5]], 0, 0, 1, 0), 1) + L(cl, lt(col, 0.5), 0.9, 0.9) + C(tip[0], tip[1], 9, glow(c, col, 0.85)) + C(tip[0], tip[1], 2.2, '#ffe8e0');
  }
  function fan(c, p) {
    var o = '', r = 15, a0 = PI + 0.9, a1 = PI * 1.5 + 0.5, pts = [];
    for (var i = 0; i <= 6; i++) { var a = a0 + (a1 - a0) * i / 6; pts.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]); }
    o += P('M' + pt(p) + 'L' + pts.map(pt).join('L') + 'Z', c.lg([[0, '#f4f0ff'], [1, '#a890e0']]), 1.4);
    pts.forEach(function (q) { o += L('M' + pt(p) + 'L' + pt(q), '#7a64b0', 0.8, 0.9); });
    return o + L('M' + pts.map(pt).join('L'), '#ffffff', 1, 0.8);
  }
  function wisp(c, x, y, s, col) {
    var d = 'M' + pt([x, y]) + 'c' + n(-6 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-12 * s) + ' ' + n(2 * s) + ',' + n(-12 * s) + 'c' + n(5 * s) + ',0 ' + n(5 * s) + ',' + n(6 * s) + ' ' + n(1 * s) + ',' + n(6 * s);
    return L(d, col, 3 * s, 0.35) + L(d, lt(col, 0.5), 1.2 * s, 0.9);
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    scholomance_acolyte: function (c) {
      var rb = '#6a5a4a', sk = '#dcbfa6';
      return robeRig(c, {
        robe: rb, sleeve: rb, skin: sk, rope: '#c8a868', hem: dk(rb, 0.4), flare: [36, 92],
        head: function (c, x, y) { return hoodHead(c, x, y, { col: lt(rb, 0.04), skin: sk, trim: dk(rb, 0.3) }); },
        chest: function (c) { return L('M52,48 L64,60 L76,48', dk(rb, 0.4), 1.4) + L('M64,60 L64,82', dk(rb, 0.3), 1.2); },
        near: [[48, 54], [42, 68], [38, 72]], wNearFront: function (c, p) { return cuff(c, [42, 68], p, rb) + openBook(c, p[0] - 4, p[1] - 5, 1.05); },
        far: [[80, 54], [92, 64], [94, 50]], farHand: function (c, p) { return candle(c, p[0], p[1] - 3, 1.3, 9) + hand(p, c.cel(sk)); },
        tf: at(0.94, 64, 122)
      });
    },
    scholomance_necromancer: function (c) {
      var rb = '#332d3e', sk = '#d2c8be';
      return robeRig(c, {
        robe: rb, sleeve: rb, skin: sk, panel: CRIM, trim: BONE, hem: BONED, sash: '#1a1418', flare: [32, 96],
        panelX: function (c, m, y0) { return skullC(c, m - 1, y0 + 18, 0.6, BONE); },
        head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: 'bald', gaunt: true, eye: GR, glowEye: true, brow: '#1e1a1e', face: L('M' + pt([x - 6, y - 13]) + 'L' + pt([x - 2, y - 9]) + 'L' + pt([x + 3, y - 13]) + 'M' + pt([x - 2, y - 9]) + 'L' + pt([x - 1, y - 5]), '#1e5a3a', 1.3) }); },
        chest: function (c) { return L('M48,50 L64,62 L80,50', OL, 4) + L('M48,50 L64,62 L80,50', BONED, 2) + P(pd([[57, 62], [71, 62], [69, 86], [59, 86]], true), c.cel(CRIM), 1.4); },
        pads: function (c) { return bonePad(c, 82, 51, 0.95, '', 0.45) + bonePad(c, 46, 52, 1.15, '', -0.45); },
        near: [[48, 54], [40, 68], [32, 64]], wNear: function (c, p) { return skullStaff(c, p, 38); }, wNearFront: function (c, p) { return cuff(c, [40, 68], p, rb, BONED); },
        far: [[80, 54], [94, 50], [100, 38]], farHand: function (c, p) { return hand(p, c.cel(sk)) + necroOrb(c, p[0] - 2, p[1] - 11, 4.4); }
      });
    },
    risen_construct: function (c) {
      var fl = '#a6848e', fld = dk(fl, 0.28), o = shadow(c, 64, 46);
      o += limb('M92,56 L110,76 L108,92', fld, 15) + seam([[100, 64], [106, 72]]) + E(107, 99, 10, 9, c.cel(fld), 2) + L('M114,102 q6,6 0,12 q-4,2 -6,-2', OL, 3.6) + L('M114,102 q6,6 0,12 q-4,2 -6,-2', IRONL, 1.8);
      o += limb('M78,94 L84,108 L84,114', fld, 15) + P('M72,113 L94,113 L96,122 L70,122 Z', c.cel(dk(fl, 0.38)), 2) + limb('M50,94 L45,108 L44,114', fl, 16) + P('M30,113 L56,113 L58,122 L27,122 Z', c.cel(dk(fl, 0.3)), 2);
      [[74, 34, -1.35, 22], [90, 38, -0.85, 20], [102, 50, -0.35, 15]].forEach(function (k) { var T = taper([[k[0], k[1] + 4], [k[0] + Math.cos(k[2]) * k[3] * 0.5, k[1] + Math.sin(k[2]) * k[3] * 0.5], [k[0] + Math.cos(k[2] - 0.2) * k[3], k[1] + Math.sin(k[2] - 0.2) * k[3]]], 7, 1, 4); o += P(T.d, c.cel(BONE), 1.6); });
      o += limb('M84,40 L96,20 L110,18', '#4a4a50', 4) + C(110, 18, 5, c.cel(IRON), 1.4) + L('M86,38 L96,20 L108,18', GR, 1.6, 0.9);
      var td = 'M28,64 C24,42 50,28 78,30 C100,32 110,50 106,72 C104,90 88,100 64,100 C44,100 30,88 28,64 Z';
      var cav = 'M40,58 C40,50 60,48 66,54 L66,84 C58,90 46,88 40,78 Z', rb = '';
      [60, 66, 72, 78].forEach(function (y) { rb += 'M42,' + y + ' Q54,' + (y - 5) + ' 66,' + (y - 1); });
      o += body(c, td, fl, F('M80,24 L112,24 L112,104 L84,104 C98,84 96,50 80,24 Z', dk(fl, 0.32), 0.8) + F('M28,84 C40,100 80,104 104,86 L104,106 L28,106 Z', dk(fl, 0.25), 0.6) +
        P(cav, '#3a1620', 1.8) + C(54, 70, 12, glow(c, GR, 0.6)) + L(rb, OL, 4.4) + L(rb, BONE, 2.4) + L('M66,54 L66,86', OL, 4) + L('M66,54 L66,86', BONED, 2) +
        seam([[70, 34], [74, 52], [70, 70], [76, 92]]) + seam([[84, 60], [100, 66]]) + seam([[32, 72], [40, 92]]) +
        P('M78,40 C84,34 98,38 100,48 C92,50 84,50 78,40 Z', c.cel(BONED), 1.4) + C(88, 44, 1.3, IRONL) + C(95, 45, 1.3, IRONL), 2.6);
      var hd = 'M14,52 C12,40 28,33 40,38 C47,42 48,54 44,60 C38,67 20,67 14,60 Z';
      o += body(c, hd, lt(fl, 0.04), F('M34,32 L52,32 L52,68 L40,68 C46,56 44,42 34,32 Z', dk(fl, 0.3), 0.8) + seam([[24, 36], [28, 46], [40, 48]]), 2.2);
      o += glowEye(c, 22, 49, 2.1, GR) + L('M30,44 l5,5 M35,44 l-5,5', OL, 1.6);
      o += P('M14,58 C20,64 36,64 43,60 L41,66 C33,70 21,70 15,64 Z', c.cel(dk(fl, 0.2)), 1.8) + P(pd([[18, 61], [20, 57], [22, 61]], true) + pd([[28, 62], [30, 57.6], [32, 62]], true) + pd([[36, 61], [38, 57], [40, 60.6]], true), c.cel(BONE), 0.9);
      o += limb('M40,58 L26,76', fl, 15) + E(26, 77, 8, 7, c.cel(fl), 1.8) + seam([[20, 74], [32, 78]]);
      var B = taper([[26, 80], [18, 94], [12, 106], [6, 116]], 12, 1.4, 5);
      o += P(B.d, c.cel(BONE), 1.8) + L(along(B, 0.3), BONED, 1.2) + L('M20,80 L32,82', OL, 4) + L('M20,80 L32,82', IRONL, 2);
      return G(o, at(1.0, 64, 122));
    },
    kirtonos_the_herald: function (c) {
      var sk = '#6e6488', skd = dk(sk, 0.28), mem = '#7a3446', o = shadow(c, 64, 40);
      o += wing(c, [76, 54], [98, 16], [[124, 10], [124, 40], [110, 64]], dk(mem, 0.15), skd);
      o += wing(c, [52, 54], [30, 14], [[4, 12], [4, 40], [18, 62]], mem, sk);
      var T = taper([[84, 90], [104, 106], [118, 104], [120, 90]], 7, 2, 5);
      o += P(T.d, c.cel(skd), 1.6) + P(pd([[120, 92], [124, 82], [116, 86]], true), c.cel(skd), 1.4);
      o += limb('M78,88 L88,100 L80,112 L82,117', skd, 11) + talon(82, 121, skd);
      o += limb('M54,88 L44,100 L52,112 L50,117', sk, 12) + talon(50, 121, sk);
      var td = 'M42,58 C44,46 82,44 88,56 L86,78 L80,92 L50,92 L44,80 Z';
      o += body(c, td, sk, F('M72,42 L96,42 L96,96 L76,96 C82,78 80,58 72,42 Z', dk(sk, 0.3), 0.8) + L('M52,62 C58,66 62,66 66,62 M52,72 L62,74 M54,80 L62,81', dk(sk, 0.4), 1.2), 2.4);
      o += P('M48,84 L82,84 L80,90 L78,106 L70,98 L64,108 L58,98 L50,104 Z', c.cel('#4a1a24'), 1.8) + L('M48,86 L82,86', GOLD, 1.6);
      // head: swept horns, a pointed ear, a fanged muzzle
      var H1 = taper([[58, 26], [70, 14], [82, 14], [86, 24]], 7, 1.2, 5), H2 = taper([[52, 24], [58, 10], [68, 4], [76, 6]], 6, 1, 5);
      o += P(H2.d, c.cel('#3a3040'), 1.6) + P(H1.d, c.cel('#4a4050'), 1.6);
      o += P(pd([[62, 32], [80, 26], [66, 40]], true), c.cel(skd), 1.6);
      o += body(c, 'M40,32 C40,22 56,18 64,26 C68,32 66,42 60,46 L44,50 C38,48 30,48 28,44 L26,36 Z', sk, F('M56,20 L70,20 L70,50 L58,50 C64,40 62,28 56,20 Z', dk(sk, 0.3), 0.8), 2.2);
      o += P('M26,44 L44,46 L42,53 L30,52 Z', '#2a0e14', 1.6) + P(pd([[29, 44], [31, 49.4], [33, 44.4]], true) + pd([[38, 45.2], [40, 50.4], [42, 45.6]], true), '#f0e8d8', 0.9);
      o += P(pd([[30, 30], [46, 26], [50, 31], [34, 34]], true), c.cel(skd), 1.4) + glowEye(c, 38, 35, 1.9, '#ffb030') + C(27, 38, 1, OL);
      // near arm and the herald's staff
      o += haft(c, [30, 68], 52, -PI / 2, '#2a2230', 3.4, 50);
      o += C(30, 12, 12, glow(c, '#ff6a3a', 0.8)) + L('M30,20 C22,18 20,8 26,4 C32,0 38,6 34,10', OL, 5) + L('M30,20 C22,18 20,8 26,4 C32,0 38,6 34,10', '#8a7a94', 2.6) + C(30, 13, 3.2, c.rg([[0, '#fff0c0'], [0.5, '#ff7a3a'], [1, '#8a1a0a']]), 1.2);
      o += limb('M46,58 L36,74', sk, 9) + limb('M36,74 L30,68', sk, 8) + clawHand([30, 68], sk, 0.9);
      o += limb('M84,58 L98,70', skd, 9) + limb('M98,70 L102,84', skd, 8) + clawHand([102, 86], skd, 0.9);
      return G(o, at(1.0, 64, 122));
    },
    jandice_barov: function (c) {
      var gh = '#d6ccf2', sk = '#eee8fa', hc = '#9a88d0';
      var fig = function (c) {
        return biped(c, {
          skin: sk, shirt: gh, sleeve: gh, glove: sk, noLegs: true, shadow: false, hx: 62, hy: 33, neck: true, neckCol: sk,
          torsoD: 'M50,48 C54,44 74,44 78,48 L76,64 L72,82 L56,82 L52,64 Z',
          chest: function (c) { return P('M50,48 C56,54 72,54 78,48 L78,52 C72,58 56,58 50,52 Z', c.cel('#ffffff'), 1.2) + L('M56,74 L64,66 L72,74', '#8a74c0', 1.3) + C(64, 57, 2, c.cel('#b8f0ff'), 1); },
          front: function (c) {
            var d = 'M56,80 L72,80 C82,90 96,104 104,118 L96,121 L88,117 L80,121 L72,117 L64,121 L56,117 L48,121 L40,117 L32,121 L24,118 C32,104 46,90 56,80 Z';
            return body(c, d, gh, F('M70,78 L108,78 L108,124 L76,124 C80,104 76,90 70,78 Z', '#9a88cc', 0.7) + L('M36,108 C50,104 78,104 96,108 M30,114 C50,110 80,110 100,114', '#ffffff', 1.4, 0.7) + L('M60,84 L50,116 M68,84 L78,116', '#9a88cc', 1.1), 2) + P('M54,78 L74,78 L72,84 L56,84 Z', c.cel('#9a80d8'), 1.4);
          },
          pads: function (c) { return E(78, 52, 7, 6, c.cel(lt(gh, 0.1)), 1.8) + E(50, 53, 8, 7, c.cel(lt(gh, 0.2)), 1.8); },
          head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: 'updo', hairCol: hc, eye: '#ffffff', glowEye: true, lips: '#b890d8', brow: '#a898c8', arch: 1 }); },
          near: [[50, 54], [40, 66], [32, 62]], nearHand: function (c, p) { return fan(c, p) + hand(p, c.cel(sk)); },
          far: [[78, 54], [90, 48], [96, 36]], farHand: function (c, p) { return hand(p, c.cel(sk)) + C(p[0], p[1] - 8, 12, glow(c, '#d8b8ff', 0.8)) + wisp(c, p[0] - 2, p[1] - 4, 1, '#c8a8ff'); }
        });
      };
      var o = C(64, 70, 58, glow(c, '#c8b0ff', 0.35)) + E(64, 121, 34, 5, glow(c, '#c8b0ff', 0.5));
      o += G(fig(c), at(0.72, 22, 122), 0.26) + G(fig(c), at(0.72, 108, 122), 0.26);
      o += G(fig(c), '', 0.86);
      return o + wisp(c, 16, 70, 1.2, '#c8a8ff') + wisp(c, 110, 60, 1, '#c8a8ff') + wisp(c, 30, 100, 0.8, '#c8a8ff') + motes(3101, 12, 10, 118, 10, 110, '#f0e8ff');
    },
    rattlegore: function (c) {
      var b = BONE, bd = BONED, o = shadow(c, 64, 56);
      o += boneLimb(c, [[96, 46], [114, 68], [112, 90]], bd, 14) + skullFist(c, 112, 100, 12, bd);
      o += boneLimb(c, [[82, 90], [90, 104], [88, 112]], bd, 15) + P('M76,111 L100,111 L102,122 L74,122 Z', c.cel(dk(bd, 0.1)), 2);
      o += boneLimb(c, [[50, 90], [44, 104], [44, 112]], b, 16) + P('M28,111 L56,111 L58,122 L25,122 Z', c.cel(bd), 2) + L('M30,116 L56,116', dk(bd, 0.3), 1.2);
      // spine spikes and shoulder blades behind
      [[70, 24, -1.3, 16], [84, 26, -0.9, 16], [96, 34, -0.5, 14], [104, 46, -0.1, 12]].forEach(function (k) { var T = taper([[k[0], k[1] + 5], [k[0] + Math.cos(k[2]) * k[3], k[1] + Math.sin(k[2]) * k[3]]], 7, 1, 4); o += P(T.d, c.cel(bd), 1.5); });
      // pelvis
      o += body(c, 'M40,84 C44,78 60,80 64,86 C68,80 84,78 90,84 C94,92 86,100 76,98 L64,94 L52,98 C42,100 36,92 40,84 Z', bd, E(52, 90, 4, 3, OL) + E(76, 90, 4, 3, OL), 2.2);
      // ribcage: dark hollow, green heart-glow, spine, heavy ribs, sternum
      var td = 'M26,50 C24,34 54,24 84,28 C106,32 110,52 104,70 C100,84 86,90 64,90 C44,90 28,78 26,50 Z';
      o += P(td, '#241e1a', 2.6) + C(66, 58, 26, glow(c, GR, 0.7)) + C(66, 58, 5, c.rg([[0, '#ffffff'], [0.5, GR], [1, GRD]]), 1.2);
      o += boneLimb(c, [[92, 30], [96, 60], [86, 88]], bd, 8);
      [[34, 0], [47, 1], [60, 2], [73, 3]].forEach(function (k) { var y = k[0], d = 'M94,' + y + ' C80,' + (y - 6) + ' 50,' + (y - 4) + ' 36,' + (y + 10 + k[1] * 1.5); o += L(d, OL, 9.4) + L(d, k[1] % 2 ? bd : b, 5.8) + L(d, lt(b, 0.3), 1.4, 0.7); });
      o += L('M34,40 L38,86', OL, 9) + L('M34,40 L38,86', b, 5.4);
      o += body(c, 'M84,22 C98,18 112,30 110,44 C104,46 92,42 84,22 Z', bd, '', 2) + body(c, 'M20,46 C14,32 28,22 44,26 C40,36 32,44 20,46 Z', b, '', 2);
      // the horned skull, low and forward
      var H = taper([[40, 12], [56, 2], [70, 8], [68, 20]], 9, 2, 5);
      o += P(H.d, c.cel(bd), 1.8) + L(bands(H, 3, 2), dk(bd, 0.3), 1);
      o += body(c, 'M12,30 C10,14 34,6 48,14 C56,20 56,32 50,38 L46,44 L24,46 L14,40 Z', b, F('M40,8 L60,8 L60,48 L46,48 C52,34 50,20 40,8 Z', dk(b, 0.28), 0.8) + L('M26,12 L30,20 L28,26', dk(b, 0.35), 1.2), 2.4);
      o += E(20, 28, 5, 4.6, '#1a120e', 1.4) + E(34, 27, 4.4, 4.2, '#1a120e', 1.4) + glowEye(c, 20, 28, 2, GR) + glowEye(c, 34, 27, 1.8, GR) + F(pd([[25, 34], [29, 34], [27, 38]], true), OL);
      o += P('M14,40 L48,40 L46,52 L18,52 Z', c.cel(bd), 2) + L('M18,40 L18,46 M23,40 L23,47 M28,40 L28,47 M33,40 L33,47 M38,40 L38,47 M43,40 L43,46 M16,46 L46,46', OL, 1.1);
      o += boneLimb(c, [[36, 50], [18, 72], [18, 90]], b, 15) + skullFist(c, 18, 100, 13, b);
      return G(o + chainLine([30, 64], [48, 88], 3, 0.8), at(1.03, 64, 122));
    },
    ras_frostwhisper: function (c) {
      var pl = '#8ec4e6', rb = '#243a60', bn = '#d8e6ee';
      return C(64, 60, 56, glow(c, '#8ad8ff', 0.3)) + robeRig(c, {
        robe: rb, sleeve: '#34507c', forearm: '#34507c', skin: bn, glove: bn, hem: ICEL, flare: [30, 98], shadowR: 38, hx: 60, hy: 34, neck: false,
        torsoD: 'M40,50 C46,43 82,43 88,50 L86,70 L82,88 L46,88 L42,70 Z',
        chest: function (c) { return body(c, 'M44,52 C52,46 76,46 84,52 L82,74 L64,84 L46,74 Z', pl, F('M66,44 L90,44 L90,86 L66,86 Z', ICED, 0.55) + L('M64,50 L64,82 M48,62 L80,62', ICED, 1.4) + L('M48,54 C56,50 64,50 70,52', '#ffffff', 1.4, 0.8), 2) + C(64, 66, 9, glow(c, '#bff4ff', 0.8)) + P(pd([[64, 59], [69, 66], [64, 73], [59, 66]], true), c.cel('#dffaff'), 1.2); },
        front: function (c) { var o = ''; [[42, 0], [56, 1], [70, 0]].forEach(function (t, i) { o += body(c, pd([[t[0], 86], [t[0] + 16, 86], [t[0] + 15, 104 - t[1] * 3], [t[0] + 1, 106 - t[1] * 3]], true), i === 1 ? lt(pl, 0.06) : pl, F(pd([[t[0] + 10, 84], [t[0] + 18, 84], [t[0] + 18, 108], [t[0] + 10, 108]], true), ICED, 0.5), 1.6) + P(pd([[t[0] + 5, 104 - t[1] * 3], [t[0] + 8, 112 - t[1] * 3], [t[0] + 11, 104 - t[1] * 3]], true), c.cel(ICEL), 1); }); return o + P(pd([[40, 84], [88, 84], [88, 90], [40, 90]], true), c.cel(NAVY), 1.8) + C(64, 87, 2.6, c.cel('#bff4ff'), 1); },
        pads: function (c) { return icePauldron(c, 84, 52, 11) + icePauldron(c, 44, 52, 14); },
        head: function (c, x, y) { return skullHead(c, x, y, { bone: bn, eye: '#8ae8ff' }) + P(pd([[x - 9, y + 11], [x - 7, y + 19], [x - 5, y + 11]], true) + pd([[x - 4, y + 11], [x - 2, y + 22], [x, y + 11]], true) + pd([[x + 1, y + 11], [x + 2.4, y + 17], [x + 4, y + 11]], true), c.cel(ICE), 1) + iceCrown(c, x, y); },
        near: [[46, 54], [38, 68], [32, 64]], wNear: function (c, p) { return iceStaff(c, p, 36); }, nearHand: boneHand(bn), wNearFront: function (c, p) { return cuff(c, [38, 68], [p[0] + 3, p[1] + 2], '#34507c', ICEL); },
        far: [[82, 54], [96, 48], [102, 36]], farHand: function (c, p) { return clawHand(p, bn, 0.8, bn) + frostOrb(c, p[0] - 2, p[1] - 11, 4.4); }
      }) + P(pd([[20, 122], [24, 110], [28, 122]], true) + pd([[98, 122], [103, 108], [108, 122]], true) + pd([[106, 122], [109, 114], [112, 122]], true), c.cel(ICE), 1.2) + motes(3201, 14, 8, 120, 8, 100, '#e8faff');
    },
    instructor_malicia: function (c) {
      var rb = '#6a1a26', blk = '#2a1e28', sk = '#ecd6c6';
      return robeRig(c, {
        robe: blk, sleeve: rb, forearm: rb, skin: sk, glove: '#241a20', panel: rb, trim: GOLD, hem: rb, waist: [52, 76], flare: [36, 92], shoe: '#120c10',
        torsoD: 'M48,50 C52,46 76,46 80,50 L78,66 L76,86 L52,86 L50,66 Z', hy: 32, neckCol: sk,
        chest: function (c) { return P(pd([[56, 52], [72, 52], [70, 84], [58, 84]], true), c.cel(rb), 1.4) + L('M60,58 l8,4 M68,58 l-8,4 M60,66 l8,4 M68,66 l-8,4 M60,74 l8,4 M68,74 l-8,4', GOLD, 1) + P('M54,44 L74,44 L72,50 L56,50 Z', c.cel(blk), 1.4) + skullC(c, 64, 52, 0.45, BONE); },
        pads: function (c) { return pauldron(c, 80, 52, 8, blk, rb) + pauldron(c, 49, 53, 10, blk, rb); },
        head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: 'bun', hairCol: '#1a1216', specs: true, lips: '#8a2a3a', brow: '#1a1216', arch: 1.2 }); },
        near: [[50, 54], [38, 60], [26, 54]], wNearFront: function (c, p) { var e = [p[0] - 14, p[1] - 10]; return L('M' + pt(p) + 'L' + pt(e), OL, 3.6) + L('M' + pt(p) + 'L' + pt(e), '#2a1a14', 2) + C(e[0], e[1], 1.4, GOLD) + necroOrb(c, e[0] - 4, e[1] - 4, 3.6, '#9a50e0') + cuff(c, [38, 60], [p[0] + 4, p[1] + 1], rb, GOLD); },
        far: [[78, 54], [88, 68], [86, 80]], farHand: function (c, p) { return tome(c, p[0] + 3, p[1] - 4) + hand(p, c.cel('#241a20')); }
      });
    },
    lord_alexei_barov: function (c) {
      var coat = '#1e4a3c', sk = '#9aa488', br = '#2a2426';
      return G(biped(c, {
        skin: sk, shirt: coat, sleeve: coat, forearm: coat, glove: '#d8d0bc', pants: br, boots: '#141012', shadowR: 34,
        back: function (c) { return body(c, 'M52,78 L86,78 C92,92 98,104 104,116 L94,112 L88,118 L80,108 C72,96 60,88 52,78 Z', coat, F('M84,76 L110,76 L110,120 L92,120 C94,100 90,88 84,76 Z', dk(coat, 0.35), 0.7) + L('M94,112 L104,116', GOLD, 1.4), 2); },
        chest: function (c) { return P(pd([[56, 50], [72, 50], [72, 84], [56, 84]], true), c.cel('#5a1a22'), 1.4) + C(64, 62, 1.4, GOLD) + C(64, 70, 1.4, GOLD) + C(64, 78, 1.4, GOLD) + P('M46,50 L56,50 L58,84 L48,88 Z', c.cel(coat), 1.6) + P('M72,50 L82,50 L80,88 L70,84 Z', c.cel(dk(coat, 0.1)), 1.6) + L('M56,50 L58,84 M72,50 L70,84', GOLD, 1.4) + P('M56,46 C58,52 62,58 64,62 C66,58 70,52 72,46 C68,48 60,48 56,46 Z', c.cel('#ece4d0'), 1.4) + L('M60,50 l2,4 M68,50 l-2,4', '#b8b0a0', 0.8); },
        front: function (c) { return body(c, 'M46,86 L60,86 L56,106 L40,104 Z', coat, L('M42,102 L56,104', GOLD, 1.4) + C(54, 92, 1.2, GOLD), 1.8) + body(c, 'M68,86 L82,86 L86,104 L72,106 Z', dk(coat, 0.08), L('M72,104 L86,102', GOLD, 1.4), 1.8); },
        belt: '#1a1416', buckle: GOLD, hipY: 86,
        pads: function (c) { return pauldron(c, 82, 52, 8, GOLDD, GOLD) + pauldron(c, 47, 53, 10, GOLD, GOLDD) + L('M40,56 l-1,6 M43,57 l-0.6,6 M46,57 l0,6 M49,57 l0.4,6 M52,56 l0.8,6', GOLD, 1.2); },
        shins: function (c) { return P('M44,104 L60,104 L59,108 L45,108 Z', c.cel('#2a2224'), 1.4) + P('M64,104 L80,104 L79,108 L65,108 Z', c.cel('#221c1e'), 1.4); },
        head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: 'lank', hairCol: '#1e1a1a', gaunt: true, rot: true, eye: '#ff5a3a', glowEye: true, brow: '#2a2a22' }); },
        near: [[48, 54], [38, 62], [28, 54]], wNearFront: function (c, p) { return cuff(c, [38, 62], [p[0] + 3, p[1] + 2], coat, GOLD) + drain(c, [[p[0] - 3, p[1] - 4], [p[0] - 10, p[1] - 14], [p[0] - 4, p[1] - 24], [p[0] - 14, p[1] - 32]], '#e03a3a'); },
        far: [[82, 54], [92, 72], [92, 86]], wFar: function (c, p) { return haft(c, [p[0] + 1, p[1]], 6, -PI / 2, '#1a1414', 2.6, 34) + C(p[0] + 1, p[1] - 6, 3.4, c.cel(GOLD), 1.2); }
      }), at(1.02, 64, 122));
    },
    darkmaster_gandling: function (c) {
      var rb = '#2e2242', rbl = '#4e3868', sk = '#aca6b6';
      return G(robeRig(c, {
        robe: rb, sleeve: rb, skin: sk, glove: sk, panel: rbl, trim: GR, hem: GR, waist: [52, 76], flare: [30, 98], shadowR: 36, sash: '#120c18',
        panelX: function (c, m, y0) { return L('M' + pt([m - 1, y0 + 6]) + 'L' + pt([m - 1, y0 + 30]) + 'M' + pt([m - 5, y0 + 14]) + 'l4,-4 l4,4 l-4,4 Z', GR, 1.2, 0.9) + ring(m - 1, y0 + 24, 2.6, 2.6, GR, 0.8); },
        torsoD: 'M50,48 C54,44 74,44 78,48 L78,68 L76,86 L52,86 L50,68 Z', hx: 58, hy: 31, neck: false, armW: 8,
        back: function (c) {
          var outer = 'M46,52 L32,18 Q40,20 46,26 L52,42 L70,42 L74,22 Q84,10 94,6 L86,54 Z', inner = 'M48,48 L38,24 Q43,26 48,32 L54,42 L68,42 L76,26 Q83,16 90,12 L83,50 Z';
          return body(c, outer, '#3a2a54', F('M72,0 L100,0 L100,56 L78,56 Z', dk(rb, 0.3), 0.8), 2.2) + P(inner, c.lg([[0, '#6a4a8e'], [1, '#1e5034']]), 1.4) + L('M33,19 L46,52 M93,7 L85,53 M33,19 Q40,21 46,26 M93,7 Q84,12 76,24', GR, 1.3, 0.95);
        },
        chest: function (c) { return L('M52,50 L64,60 L76,50', GR, 1.3) + P(pd([[58, 60], [70, 60], [68, 84], [60, 84]], true), c.cel(rbl), 1.3) + C(64, 58, 3.4, c.cel('#1e2a22'), 1.2) + C(64, 58, 1.8, GR); },
        pads: function (c) { return pauldron(c, 78, 50, 8, rbl, GR) + pauldron(c, 51, 51, 9, rbl, GR); },
        head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: 'bald', tall: 8, chin: 4, gaunt: true, eye: GR, glowEye: true, brow: '#3a3440', arch: 2, pointEar: true }); },
        near: [[50, 52], [42, 66], [36, 62]], wNear: function (c, p) {
          var t = [p[0], p[1] - 42], o = haft(c, p, 42, -PI / 2, '#1a1420', 3.2, 118 - p[1]);
          o += C(t[0], t[1] - 6, 16, glow(c, GR, 0.8)) + L('M' + pt([t[0], t[1] + 6]) + 'C' + pt([t[0] - 10, t[1] + 2]) + ' ' + pt([t[0] - 10, t[1] - 10]) + ' ' + pt([t[0] - 3, t[1] - 14]) + 'M' + pt([t[0], t[1] + 6]) + 'C' + pt([t[0] + 10, t[1] + 2]) + ' ' + pt([t[0] + 10, t[1] - 10]) + ' ' + pt([t[0] + 3, t[1] - 14]), OL, 4.4) + L('M' + pt([t[0], t[1] + 6]) + 'C' + pt([t[0] - 10, t[1] + 2]) + ' ' + pt([t[0] - 10, t[1] - 10]) + ' ' + pt([t[0] - 3, t[1] - 14]) + 'M' + pt([t[0], t[1] + 6]) + 'C' + pt([t[0] + 10, t[1] + 2]) + ' ' + pt([t[0] + 10, t[1] - 10]) + ' ' + pt([t[0] + 3, t[1] - 14]), '#6a6078', 2.2);
          return o + C(t[0], t[1] - 5, 4.6, c.rg([[0, '#ffffff'], [0.45, GR], [1, GRD]]), 1.4) + skullC(c, t[0], t[1] + 9, 0.7, BONED);
        },
        wNearFront: function (c, p) { return cuff(c, [42, 66], [p[0] + 3, p[1] + 2], rb, GR); },
        far: [[78, 52], [92, 46], [98, 34]], farHand: function (c, p) { return C(p[0], p[1] - 8, 16, glow(c, GR, 0.8)) + gFlame(c, p[0], p[1] - 3, 0.62) + clawHand(p, sk, 0.85, sk); }
      }), at(1.0, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(PUR), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, STD) + ground(c, 150, ST, STD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#36353f"/></svg>'; }
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
