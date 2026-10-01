/* art_rumhook.js — Rumhook Bay art for Realm of Loner (the southern Vinewild, levels 35-40: the neutral goblin port of
 * Rumhook Bay, the Saltpenny Wharf grain docks, Thunderhowl Rise, Blackgull Cove, the Bonegrin Warcamp, the Black
 * Ledger's Bonded Yard and the Bloodsand Arena; and the surf crawler, a big shore crab).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Rumhook Bay keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and the house-style scene pieces are shared copies of art_coinworks.js (which also gives the Black Ledger's
 * claw mark, strongboxes, ledgers, lanterns, lamp posts, chains and the desk); the jungle pieces (sky, far jungle,
 * canopy, vines, palms, ferns, leaves, floor, troll ruins, tents, flags, palisade, watch tower) are copies of
 * art_stranglethorn.js; the sea and pier are copies of art_tanaris.js, whose pirate ship grows a sail
 * colour, a sail mark and a tilt here; the crab rig, barnacles and shells are copies of art_tidewatch.js. The port
 * pieces (lighthouse-crane, stilt huts, rope bridges, bunting, cargo nets, boardwalk, sealed grain sacks), the cove
 * (cannons, rum kegs, the Blackgull's white gull), the warcamp (tusk totems, hide tents, skull heaps, ruined steps),
 * the warehouse and the arena (seating tiers, gates, banners, the chest on its plinth) are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix rh<counter>_).
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
  function Ctx() { this.p = 'rh' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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

  // ---------- primitives (shared copies) ----------
  // ---------- primitives ----------
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + n(sw) + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
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
  var _cur = null;

  // ============================================================
  //  SCENE PIECES (shared house style, copies of art_coinworks.js)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#f0f4ff', 0.14], [0.5, '#f0f4ff', 0], [1, bot || '#1a2010', 0.22]])); }
  function cloud(x, y, s, op, col) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, col || '#f4f6f8', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', dk(col || '#f4f6f8', 0.14), 0.9);
  }
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  function grass(seed, y0, y1, col, cnt, s0, s1, w, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), s = s0 + (s1 - s0) * t, x = x0 + r() * (x1 - x0);
      d += 'M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-7 * s) + 'M' + pt([x, y]) + 'q' + n(0.5 * s) + ',' + n(-5 * s) + ' ' + n(1 * s) + ',' + n(-9 * s) + 'M' + pt([x, y]) + 'q' + n(2 * s) + ',' + n(-3 * s) + ' ' + n(5 * s) + ',' + n(-6 * s);
    }
    return L(d, col, w || 1.2);
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
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
  }
  function stoneFace(c, x, y, w, h, col, js, top) {
    // top: optional list of [dx, dy] points (relative to x, y-h) replacing the flat top edge, for broken walls
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
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
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
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
  function barrel(c, x, y, s, col) {
    col = col || '#8a5a32';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  // ---- the Black Ledger pieces (copies of art_coinworks.js) ----
  // the Black Ledger's mark: three curved claw slashes (x, y = centre), filled blades
  function clawD(x, y, s) {
    var d = '';
    [-1, 0, 1].forEach(function (k) {
      var ox = x + k * 4.6 * s, oy = y + k * 0.6 * s, top = [ox + 4.2 * s, oy - 8.5 * s], bot = [ox - 4.2 * s, oy + 8.5 * s];
      d += 'M' + pt(top) + 'Q' + pt([ox + 1.9 * s, oy + 0.4 * s]) + ' ' + pt(bot) + 'Q' + pt([ox - 1.1 * s, oy - 1.2 * s]) + ' ' + pt(top) + 'Z';
    });
    return d;
  }
  function claw(x, y, s, col, emboss) { return (emboss ? F(clawD(x + 0.7 * s, y + 0.7 * s, s), emboss) : '') + F(clawD(x, y, s), col || OL); }
  function rivet(x, y, r, col) { return C(x, y, r, col || lt(BRASS, 0.2), Math.max(0.6, r * 0.55)) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#fff6d8', 0, 0.8); }
  function rivetLine(x0, y0, x1, y1, k, r, col) { var o = ''; for (var i = 0; i <= k; i++) { var t = i / k; o += rivet(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, col); } return o; }
  // iron strongbox with an arched lid, straps, a lock and the claw mark (x = centre, y = ground)
  function strongbox(c, x, y, w, h, col) {
    col = col || IRON; var hw = w / 2, lid = h * 0.34, o = E(x, y + 2, hw * 1.1, 3.4, '#000', 0, 0.32);
    var bx = 'M' + pt([x - hw, y]) + 'L' + pt([x - hw, y - h + lid]) + 'L' + pt([x + hw, y - h + lid]) + 'L' + pt([x + hw, y]) + 'Z';
    var ld = 'M' + pt([x - hw - 1, y - h + lid]) + 'L' + pt([x - hw - 1, y - h + lid * 0.4]) + 'Q' + pt([x - hw, y - h]) + ' ' + pt([x, y - h]) + 'Q' + pt([x + hw, y - h]) + ' ' + pt([x + hw + 1, y - h + lid * 0.4]) + 'L' + pt([x + hw + 1, y - h + lid]) + 'Z';
    var sh = F(pd([[x + hw * 0.4, y - h - 2], [x + hw + 3, y - h - 2], [x + hw + 3, y + 2], [x + hw * 0.4, y + 2]], true), dk(col, 0.35), 0.7);
    o += body(c, bx, col, sh, 1.8) + body(c, ld, lt(col, 0.06), sh + L('M' + pt([x - hw + 2, y - h + lid * 0.5]) + 'Q' + pt([x, y - h + 2]) + ' ' + pt([x + hw - 2, y - h + lid * 0.5]), lt(col, 0.3), 1, 0.6), 1.8);
    [-0.7, 0.7].forEach(function (k) { var sx = x + k * hw; o += R(sx - 2.4, y - h + 2, 4.8, h - 2, c.cel(BRASSD), 1.2) + rivet(sx, y - h + lid + 3, 1.1) + rivet(sx, y - 4, 1.1); });
    o += R(x - hw * 0.28, y - h + lid - 3, hw * 0.56, h * 0.5, c.cel(dk(col, 0.25)), 1.3) + claw(x, y - h + lid + h * 0.2, h * 0.034, GOLD, OL);
    return o + P(pd([[x - 3, y - h + lid - 4], [x + 3, y - h + lid - 4], [x + 2, y - h + lid + 1], [x - 2, y - h + lid + 1]], true), c.cel(BRASS), 1);
  }
  // ledger book: closed (x, y = bottom centre of the spine side) or lying open
  function ledger(c, x, y, s, col, open) {
    col = col || LEDG; var o = '';
    if (open) {
      o += P(pd([[x - 24 * s, y], [x - 22 * s, y - 8 * s], [x, y - 6 * s], [x + 22 * s, y - 8 * s], [x + 24 * s, y], [x, y + 2 * s]], true), c.cel(col), 1.4 * s);
      o += P('M' + pt([x, y - 5 * s]) + 'Q' + pt([x - 10 * s, y - 12 * s]) + ' ' + pt([x - 21 * s, y - 9 * s]) + 'L' + pt([x - 22 * s, y - 2 * s]) + 'Q' + pt([x - 10 * s, y - 4 * s]) + ' ' + pt([x, y]) + 'Z', c.cel('#f4ead0'), 1.2 * s);
      o += P('M' + pt([x, y - 5 * s]) + 'Q' + pt([x + 10 * s, y - 12 * s]) + ' ' + pt([x + 21 * s, y - 9 * s]) + 'L' + pt([x + 22 * s, y - 2 * s]) + 'Q' + pt([x + 10 * s, y - 4 * s]) + ' ' + pt([x, y]) + 'Z', c.cel('#e8dcbc'), 1.2 * s);
      var ln = ''; for (var i = 0; i < 3; i++) ln += 'M' + pt([x - 18 * s, y - (7 - i * 1.8) * s]) + 'q' + n(8 * s) + ',' + n(-1.4 * s) + ' ' + n(15 * s) + ',' + n(1.2 * s) + 'M' + pt([x + 3 * s, y - (6 - i * 1.8) * s]) + 'q' + n(8 * s) + ',' + n(-2 * s) + ' ' + n(15 * s) + ',' + n(-1 * s);
      return o + L(ln, '#6a5a4a', 0.7 * s) + L('M' + pt([x + 12 * s, y - 4 * s]) + 'L' + pt([x + 16 * s, y - 5 * s]), LEDR, 1 * s);
    }
    var w = 20 * s, h = 7 * s;
    o += R(x - w / 2, y - h, w, h, c.cel('#efe4c8'), 1.2 * s) + L('M' + pt([x - w / 2 + 2 * s, y - h * 0.5]) + 'L' + pt([x + w / 2 - 2, y - h * 0.5]), '#b8a888', 0.7 * s);
    o += P(pd([[x - w / 2 - 1.5 * s, y - h], [x + w / 2 + 1 * s, y - h], [x + w / 2 + 1 * s, y - h - 2 * s], [x - w / 2 - 1.5 * s, y - h - 2 * s]], true), c.cel(col), 1.1 * s) + R(x - w / 2 - 1.5 * s, y - 1.6 * s, w + 2.5 * s, 1.6 * s, col, 0.8 * s);
    return o + R(x - w / 2 - 1.6 * s, y - h - 2 * s, 2.6 * s, h + 2 * s, c.cel(LEDR), 0.9 * s);
  }
  // goblin lantern: brass cage, glowing glass, cap and ring (x = ring point, y = top)
  function lantern(c, x, y, s, col) {
    col = col || '#ffc050'; var o = C(x, y + 12 * s, 26 * s, glow(c, '#ffa040', 0.55));
    o += L(ellD(x, y + 1 * s, 1.8 * s, 1.8 * s), OL, 2 * s) + L(ellD(x, y + 1 * s, 1.8 * s, 1.8 * s), BRASS, 1 * s);
    o += P(pd([[x - 5 * s, y + 6 * s], [x, y + 2.6 * s], [x + 5 * s, y + 6 * s]], true), c.cel(BRASS), 1.1 * s);
    o += R(x - 4.4 * s, y + 6 * s, 8.8 * s, 11 * s, c.rg([[0, '#fffbe0'], [0.5, col], [1, dk(col, 0.25)]]), 1.1 * s, n(1.5 * s));
    o += L('M' + pt([x - 1.5 * s, y + 6 * s]) + 'L' + pt([x - 1.5 * s, y + 17 * s]) + 'M' + pt([x + 1.5 * s, y + 6 * s]) + 'L' + pt([x + 1.5 * s, y + 17 * s]), BRASSD, 0.9 * s);
    return o + R(x - 5.4 * s, y + 16 * s, 10.8 * s, 2.6 * s, c.cel(BRASS), 1 * s) + C(x, y + 20 * s, 1.2 * s, c.cel(BRASS), 0.8 * s);
  }
  // iron lamp post with a hooked arm and a hanging lantern (x = foot, y = ground; arm points `dir`)
  function lampPost(c, x, y, h, s, dir) {
    dir = dir || -1; var top = y - h, o = E(x, y + 1, 7 * s, 2 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), IROND, 2.6 * s) + L('M' + pt([x - 0.6 * s, y - 4]) + 'L' + pt([x - 0.6 * s, top + 2]), lt(IRON, 0.3), 0.8 * s, 0.7);
    o += limb('M' + pt([x, top + 2 * s]) + 'L' + pt([x + dir * 14 * s, top + 2 * s]) + 'Q' + pt([x + dir * 18 * s, top + 2 * s]) + ' ' + pt([x + dir * 17 * s, top + 6 * s]), IROND, 1.6 * s);
    o += limb('M' + pt([x, top + 10 * s]) + 'L' + pt([x + dir * 8 * s, top + 2 * s]), IROND, 1.2 * s) + R(x - 3 * s, y - 5 * s, 6 * s, 5 * s, c.cel(IRON), 1 * s) + C(x, top, 2 * s, c.cel(BRASS), 1 * s);
    return o + lantern(c, x + dir * 17 * s, top + 6 * s, s);
  }
  // chain of links from p to q (ends at q), s = link size
  function chain(p, q, s, col) {
    col = col || '#7a7880'; var dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.max(1, Math.round(len / (5 * s))), ang = Math.atan2(dy, dx) * 180 / PI, o = '';
    for (var i = 0; i < k; i++) {
      var t = (i + 0.5) / k, x = p[0] + dx * t, y = p[1] + dy * t, tf = ' transform="rotate(' + n(ang) + ' ' + n(x) + ' ' + n(y) + ')"';
      if (i % 2) o += '<rect x="' + n(x - 3.4 * s) + '" y="' + n(y - 0.9 * s) + '" width="' + n(6.8 * s) + '" height="' + n(1.8 * s) + '" rx="' + n(0.9 * s) + '" fill="' + col + '" stroke="' + OL + '" stroke-width="' + n(0.9 * s) + '"' + tf + '/>';
      else o += '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(3.4 * s) + '" ry="' + n(1.9 * s) + '" fill="none" stroke="' + OL + '" stroke-width="' + n(2.2 * s) + '"' + tf + '/><ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(3.4 * s) + '" ry="' + n(1.9 * s) + '" fill="none" stroke="' + col + '" stroke-width="' + n(1 * s) + '"' + tf + '/>';
    }
    return o;
  }
  function hook(x, y, s) { var d = 'M' + pt([x, y]) + 'L' + pt([x, y + 6 * s]) + 'C' + pt([x, y + 11 * s]) + ' ' + pt([x - 7 * s, y + 11 * s]) + ' ' + pt([x - 7 * s, y + 6 * s]); return L(d, OL, 3.4 * s) + L(d, '#8a8890', 1.6 * s) + P(pd([[x - 7 * s, y + 6 * s], [x - 8.6 * s, y + 3 * s], [x - 5.6 * s, y + 5 * s]], true), '#8a8890', 0.8 * s); }
  // wooden counting desk (x = centre, y = floor)
  function desk(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 44 * s, 4 * s, '#000', 0, 0.3);
    o += limb('M' + pt(q(-34, -24)) + 'L' + pt(q(-34, 0)) + 'M' + pt(q(34, -24)) + 'L' + pt(q(34, 0)), dk(WOOD, 0.2), 3 * s);
    o += body(c, pd([q(-40, -30), q(40, -30), q(40, -24), q(-40, -24)], true), WOOD, '', 1.6 * s) + body(c, pd([q(-34, -24), q(34, -24), q(34, -16), q(-34, -16)], true), dk(WOOD, 0.15), L('M' + pt(q(0, -24)) + 'L' + pt(q(0, -16)), OL, 1 * s), 1.4 * s);
    o += C(q(-16, -20)[0], q(-16, -20)[1], 1.2 * s, c.cel(BRASS), 0.6 * s) + C(q(16, -20)[0], q(16, -20)[1], 1.2 * s, c.cel(BRASS), 0.6 * s);
    return o;
  }
  // ---- jungle pieces (copies of art_stranglethorn.js) ----
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  // ---- more shared copies of art_redridge.js (feathers, spear, rags, Stoneharrow-style gnoll rig, bone necklace, pelt hood) ----
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function mossRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col || STONE) + F('M' + pt([x - w * 0.44, y - h * 0.5]) + 'C' + pt([x - w * 0.32, y - h * 1.04]) + ' ' + pt([x + w * 0.24, y - h * 1.04]) + ' ' + pt([x + w * 0.4, y - h * 0.52]) + 'C' + pt([x + w * 0.28, y - h * 0.6]) + ' ' + pt([x + w * 0.2, y - h * 0.46]) + ' ' + pt([x + w * 0.1, y - h * 0.62]) + 'C' + pt([x - w * 0.04, y - h * 0.5]) + ' ' + pt([x - w * 0.2, y - h * 0.64]) + ' ' + pt([x - w * 0.3, y - h * 0.46]) + 'Z', MOSS, 0.95) +
      C(x - w * 0.12, y - h * 0.82, w * 0.05 + 0.6, lt(MOSS, 0.28), 0, 0.85) + C(x + w * 0.14, y - h * 0.72, w * 0.04 + 0.5, MOSSD, 0, 0.8);
  }
  function driftwood(c, x, y, len, ang, s) {
    s = s || 1; var q = dirQ([x, y], ang), col = '#b4aa98', e = q(0, 0);
    var o = E(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2 + 3 * s, len * 0.56, 3 * s, '#000', 0, 0.2);
    o += limb('M' + pt(q(len * 0.3, 0)) + 'L' + pt(q(len * 0.42, -13 * s)) + 'M' + pt(q(len * 0.7, 0)) + 'L' + pt(q(len * 0.8, -9 * s)) + 'L' + pt(q(len * 0.92, -13 * s)), col, 2.4 * s);
    o += limb('M' + pt(q(0, 0)) + 'L' + pt(q(len, 0)), col, 7 * s) + L('M' + pt(q(3, -1.8 * s)) + 'L' + pt(q(len - 2, -1.8 * s)), lt(col, 0.4), 1.2 * s, 0.8) + L('M' + pt(q(len * 0.2, 1.6 * s)) + 'L' + pt(q(len * 0.5, 1.9 * s)) + 'M' + pt(q(len * 0.6, 1 * s)) + 'L' + pt(q(len * 0.86, 1.7 * s)), dk(col, 0.35), 0.9 * s);
    return o + E(e[0], e[1], 2.6 * s, 4 * s, c.cel('#d8d0bc'), 1.2 * s) + L(ellD(e[0], e[1], 1.2 * s, 2 * s), '#8a806e', 0.6 * s);
  }
  function waves(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 6 + t * 16, x = r() * 400; d += 'M' + pt([x - w, y]) + 'q' + n(w / 2) + ',' + n(-2 - t * 2) + ' ' + n(w) + ',0'; }
    return L(d, col || '#e8f0ec', 1.1, 0.7);
  }
  function haze(c, y, h, op, col) { return mist(c, y, h, col || '#c8d0c8', op || 0.3, Math.round(y * 3)); }
  function svSky(c, top, mid, bot) { return sky(c, top || '#8ab69a', mid || '#cdd790', bot || '#f2dc8c'); }
  function bez(p0, p1, p2, p3, t) { var u = 1 - t; return [0, 1].map(function (a) { return u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a]; }); }
  // almond leaf path from (x, y): side 1 = right-down, -1 = left-down, 0 = straight down
  function leafD(x, y, side, len) {
    var a = side ? (side > 0 ? 0.5 : PI - 0.5) : PI / 2, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, px = -Math.sin(a) * len * 0.35, py = Math.cos(a) * len * 0.35;
    return 'M' + pt([x, y]) + 'Q' + pt([(x + ex) / 2 + px, (y + ey) / 2 + py]) + ' ' + pt([ex, ey]) + 'Q' + pt([(x + ex) / 2 - px, (y + ey) / 2 - py]) + ' ' + pt([x, y]) + 'Z';
  }
  function starD(x, y, r, k) { var d = ''; for (var i = 0; i < 10; i++) { var a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * (k || 0.45) : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return d + 'Z'; }
  // humid golden light shafts falling through the canopy
  function shafts(c, seed, cnt, op, col, y1) {
    var r = rng(seed), o = ''; y1 = y1 || 200;
    for (var i = 0; i < cnt; i++) { var x = 10 + r() * 360, w = 10 + r() * 22, sk = 30 + r() * 30; o += F(pd([[x, -2], [x + w, -2], [x + w + sk, y1], [x + sk - w * 0.3, y1]], true), c.lg([[0, col || '#fff4c0', op || 0.3], [1, col || '#fff4c0', 0]])); }
    return o;
  }
  // far jungle: a lumpy canopy silhouette with a few palms poking out (no outlines)
  function farJungle(seed, y, col, cnt, h0, h1, palms, x0, x1) {
    var part = x0 != null, a0 = part ? x0 : -20, a1 = part ? x1 : 420, r = rng(seed), o = part ? '' : R(-2, y - h0 * 0.5, 404, h0 * 0.5 + 10, col);
    for (var i = 0; i < cnt; i++) { var x = a0 + (a1 - a0) * (i + r() * 0.7) / cnt, h = h0 + r() * (h1 - h0), w = 12 + r() * 14; o += E(x, y - h * 0.62, w, h * 0.46, col) + E(x - w * 0.7, y - h * 0.42, w * 0.8, h * 0.34, col) + E(x + w * 0.8, y - h * 0.36, w * 0.7, h * 0.3, col); }
    for (var k = 0; k < (palms || 0); k++) {
      var px = a0 + 30 + r() * (a1 - a0 - 60), ph = h1 * (1.15 + r() * 0.5), lean = (r() - 0.5) * 18, tx = px + lean, ty = y - ph;
      o += L('M' + pt([px, y]) + 'Q' + pt([px + lean * 0.2, y - ph * 0.5]) + ' ' + pt([tx, ty]), col, 2.4);
      for (var f = 0; f < 6; f++) { var a = -PI + f * PI / 5 + (r() - 0.5) * 0.3, len = 14 + r() * 6; o += F(taper([[tx, ty], [tx + Math.cos(a) * len * 0.55, ty + Math.sin(a) * len * 0.4 - 3], [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.3 + len * 0.35]], 5, 0.4, 4).d, col); }
    }
    return o;
  }
  // dark leafy canopy mass framing the top edge
  function canopyTop(c, seed, col, depth) {
    var r = rng(seed), d = depth || 22, o = ''; col = col || '#244a26';
    o += R(-2, -2, 404, d * 0.5, col);
    for (var i = 0; i < 12; i++) { var x = -10 + 420 * (i + r() * 0.6) / 12, ry = d * (0.5 + r() * 0.6); o += E(x, 0, 26 + r() * 14, ry, i % 2 ? col : lt(col, 0.06)); }
    for (var k = 0; k < 16; k++) o += F(leafD(r() * 400, d * (0.4 + r() * 0.7), k % 3 - 1, 8 + r() * 6), k % 2 ? lt(col, 0.14) : lt(col, 0.07));
    return o;
  }
  // hanging vines from the top edge, with leaves
  function vines(c, seed, cnt, x0, x1, l0, l1, col) {
    var r = rng(seed), d = '', lv = ''; col = col || '#4a7a2e';
    for (var i = 0; i < cnt; i++) {
      var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, len = l0 + r() * (l1 - l0), sw = (r() - 0.5) * 16;
      var p0 = [x, -4], p1 = [x + sw, len * 0.35], p2 = [x - sw, len * 0.65], p3 = [x + sw * 0.4, len];
      d += 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3);
      for (var k = 1; k < 6; k++) { var b = bez(p0, p1, p2, p3, k / 6); lv += leafD(b[0], b[1], k % 2 ? 1 : -1, 5 + r() * 2.5); }
      lv += leafD(p3[0], p3[1], 0, 6);
    }
    return L(d, OL, 3.4) + L(d, col, 1.6) + P(lv, c.cel(lt(col, 0.12)), 0.9);
  }
  // outlined palm: curved ringed trunk, crown of serrated fronds, coconuts
  function palm(c, x, y, s, lean, col, seed) {
    col = col || PALM; lean = lean || 0;
    var r = rng(seed || Math.round(x * 3 + y)), h = 96 * s, tx = x + lean * s, ty = y - h;
    var T = taper([[x, y], [x + lean * 0.15 * s, y - h * 0.35], [x + lean * 0.6 * s, y - h * 0.75], [tx, ty]], 10 * s, 5 * s, 6);
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    var fr = function (a, len, cc) {
      var p1 = [tx + Math.cos(a) * len * 0.5, ty + Math.sin(a) * len * 0.5 - len * 0.12], p2 = [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.5 + len * 0.3];
      var F1 = taper([[tx, ty], p1, p2], 11 * s, 1 * s, 5);
      return body(c, F1.d, cc, L(bands(F1, 1, 1), dk(cc, 0.38), 0.9 * s) + F(ribbonBand(F1, 0.55, 1), dk(cc, 0.2), 0.7), 1.3 * s) + L(along(F1, 0.5), lt(cc, 0.25), 0.8 * s, 0.8);
    };
    [-2.6, -1.6, -0.6].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (40 + r() * 8) * s, dk(col, 0.2)); });
    o += body(c, T.d, TRUNK, L(bands(T, 3, 2), dk(TRUNK, 0.4), 1.2 * s) + F(ribbonBand(T, 0.55, 1), dk(TRUNK, 0.3), 0.8), 1.6 * s);
    o += C(tx - 3 * s, ty + 4 * s, 3.4 * s, c.cel('#6a4a24'), 1.2 * s) + C(tx + 3 * s, ty + 5 * s, 3.4 * s, c.cel('#7a5428'), 1.2 * s) + C(tx, ty + 7 * s, 3.2 * s, c.cel('#5a3e20'), 1.2 * s);
    [-3.0, -2.1, -1.1, -0.2, 0.3].forEach(function (a) { o += fr(a + (r() - 0.5) * 0.2, (42 + r() * 10) * s, col); });
    return o;
  }
  // giant fern: a fan of arching serrated fronds
  function fern(c, x, y, s, col, seed) {
    col = col || LEAF; var r = rng(seed || Math.round(x * 5 + y * 7)), o = E(x, y + 1, 22 * s, 3.4 * s, '#000', 0, 0.22), fr = [];
    for (var i = 0; i < 7; i++) fr.push([-PI + 0.25 + i * (PI - 0.5) / 6 + (r() - 0.5) * 0.15, (26 + r() * 10) * s * (i === 0 || i === 6 ? 0.9 : 1)]);
    [0, 6, 1, 5, 2, 4, 3].forEach(function (k, j) {
      var a = fr[k][0], len = fr[k][1], cc = j < 2 ? dk(col, 0.18) : j < 4 ? col : lt(col, 0.07);
      var T = taper([[x, y], [x + Math.cos(a) * len * 0.45, y + Math.sin(a) * len * 0.8], [x + Math.cos(a) * len, y + Math.sin(a) * len * 0.55 + len * 0.3]], 8 * s, 0.6 * s, 5);
      o += body(c, T.d, cc, L(bands(T, 1, 1), dk(cc, 0.4), 0.8 * s), 1.2 * s) + L(along(T, 0.5), lt(cc, 0.3), 0.7 * s, 0.8);
    });
    return o;
  }
  // broad banana / elephant-ear leaf growing from (x, y) along ang
  function bigLeaf(c, x, y, s, ang, col) {
    col = col || LEAF; var q = dirQ([x, y], ang), Ln = 44 * s, Wd = 15 * s;
    var d = 'M' + pt(q(6 * s, 0)) + 'C' + pt(q(Ln * 0.3, -Wd)) + ' ' + pt(q(Ln * 0.85, -Wd * 0.9)) + ' ' + pt(q(Ln, 0)) + 'C' + pt(q(Ln * 0.85, Wd * 0.9)) + ' ' + pt(q(Ln * 0.3, Wd)) + ' ' + pt(q(6 * s, 0)) + 'Z';
    var v = '';
    for (var i = 1; i < 6; i++) { var u = Ln * (0.12 + i * 0.13), k = Wd * 0.75 * (1 - i * 0.1); v += 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, -k)) + 'M' + pt(q(u, 0)) + 'L' + pt(q(u + 8 * s, k)); }
    var half = pd([q(4 * s, 0), q(Ln + 2, 0), q(Ln, Wd * 1.2), q(4 * s, Wd * 1.2)], true);
    return limb('M' + pt([x, y]) + 'L' + pt(q(8 * s, 0)), dk(col, 0.2), 2.4 * s) + body(c, d, col, F(half, dk(col, 0.22), 0.8) + L(v, dk(col, 0.35), 0.9 * s), 1.5 * s) + L('M' + pt(q(7 * s, 0)) + 'L' + pt(q(Ln * 0.92, 0)), lt(col, 0.3), 1.1 * s, 0.85);
  }
  function leafClump(c, x, y, s, col, flip) {
    var k = flip ? -1 : 1;
    return bigLeaf(c, x, y, s, -PI / 2 - 0.9 * k, dk(col || LEAF, 0.12)) + bigLeaf(c, x, y, s * 1.1, -PI / 2 - 0.25 * k, col) + bigLeaf(c, x, y, s * 0.9, -PI / 2 + 0.5 * k, lt(col || LEAF, 0.06));
  }
  // jungle floor with a lit top edge and leaf litter
  function floor(c, y, top, bot, seed) {
    var r = rng(seed || 4), o = body(c, 'M-4,' + n(y) + ' C80,' + n(y - 4) + ' 160,' + n(y + 3) + ' 240,' + n(y - 2) + ' C300,' + n(y - 6) + ' 360,' + n(y + 2) + ' 404,' + n(y - 3) + ' L404,242 L-4,242 Z', top,
      R(-4, y - 8, 408, 250 - y, c.lg([[0, lt(top, 0.12), 0.4], [1, bot, 0.9]])), 1.8), lv = '';
    for (var i = 0; i < 26; i++) { var yy = y + 6 + r() * (236 - y), sz = 2 + (yy - y) / (240 - y) * 4; lv += 'M' + pt([r() * 400, yy]) + 'l' + n(sz) + ',' + n(-sz * 0.4) + 'l' + n(sz * 0.6) + ',' + n(sz * 0.7) + 'Z'; }
    return o + F(lv, dk(top, 0.25), 0.7);
  }
  // ---- troll ruins ----
  function mossTop(x0, x1, y, seed, col) {
    var r = rng(seed || 5), d = 'M' + pt([x0 - 1, y - 2.5]);
    for (var x = x0; x <= x1; x += 5) d += 'L' + pt([x, y - 3 - r() * 1.6]);
    d += 'L' + pt([x1 + 1, y + 2]);
    for (var x2 = x1; x2 >= x0; x2 -= 4) d += 'L' + pt([x2, y + 1 + (r() < 0.3 ? r() * 9 : r() * 2)]);
    return P(d + 'Z', col || MOSS, 1.1);
  }
  // square troll pillar with a carved zigzag band; broken tops are jagged
  function tPillar(c, x, y, w, h, col, seed, broken) {
    col = col || TST; var r = rng(seed || 9);
    var top = broken ? [[0, 4 + r() * 6], [w * 0.3, -2], [w * 0.55, 6 + r() * 6], [w * 0.8, 1], [w, 8]] : null;
    var o = E(x + w / 2, y + 2, w * 0.8, 3.4, '#000', 0, 0.25) + stoneFace(c, x, y, w, h, col, 14, top);
    var zy = y - h * 0.55, z = 'M' + pt([x + 1, zy]);
    for (var i = 1; i <= 6; i++) z += 'L' + pt([x + w * i / 6, zy + (i % 2 ? -4 : 0)]);
    o += L(z, dk(col, 0.45), 1.6) + L('M' + pt([x, zy + 4]) + 'L' + pt([x + w, zy + 4]) + 'M' + pt([x, zy - 8]) + 'L' + pt([x + w, zy - 8]), dk(col, 0.4), 1.1);
    if (!broken) o += R(x - 4, y - h - 6, w + 8, 7, c.cel(lt(col, 0.05)), 1.6) + mossTop(x - 4, x + w + 4, y - h - 6, seed);
    else o += mossTop(x, x + w, y - h + 5, seed);
    return o;
  }
  function rubble(c, x, y, s, col, seed) {
    var r = rng(seed || 3), o = '';
    for (var i = 0; i < 4; i++) { var bx = x + (i - 1.5) * 12 * s + (r() - 0.5) * 4, bw = (10 + r() * 6) * s, bh = (6 + r() * 5) * s, tilt = (r() - 0.5) * 4; o += body(c, pd([[bx - bw / 2, y], [bx - bw / 2 + tilt, y - bh], [bx + bw / 2 + tilt, y - bh - 1], [bx + bw / 2, y]], true), i % 2 ? col : lt(col, 0.06), F(pd([[bx + bw * 0.15, y - bh - 3], [bx + bw, y - bh - 3], [bx + bw, y + 1], [bx + bw * 0.2, y + 1]], true), dk(col, 0.25), 0.8), 1.4); }
    return o + F('M' + pt([x - 20 * s, y - 2]) + 'q' + n(8 * s) + ',' + n(-6 * s) + ' ' + n(16 * s) + ',' + n(-4 * s) + 'l' + n(-2 * s) + ',' + n(5 * s) + 'Z', MOSS, 0.9);
  }
  // canvas ridge tent seen from the front-left (x = front pole, y = ground)
  function tent(c, x, y, s, col, trim) {
    col = col || '#d8c89a'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x + 18 * s, y + 2, 44 * s, 5 * s, '#000', 0, 0.26);
    o += body(c, pd([q(0, -40), q(46, -36), q(62, -2), q(20, 0)], true), dk(col, 0.1), L('M' + pt(q(12, -39)) + 'L' + pt(q(30, -0.6)) + 'M' + pt(q(26, -38)) + 'L' + pt(q(44, -1.2)) + 'M' + pt(q(38, -37)) + 'L' + pt(q(55, -1.6)), dk(col, 0.3), 0.9 * s) + F(pd([q(30, -40), q(66, -40), q(66, 4), q(40, 4)], true), dk(col, 0.25), 0.8), 1.7 * s);
    o += body(c, pd([q(-24, 0), q(0, -40), q(20, 0)], true), col, F(pd([q(4, -42), q(24, -42), q(24, 2), q(10, 2)], true), dk(col, 0.2), 0.7), 1.8 * s);
    o += P(pd([q(-8, 0), q(0, -28), q(6, 0)], true), '#2a2016', 1.2 * s) + P(pd([q(0, -28), q(6, 0), q(12, -1)], true), c.cel(lt(col, 0.1)), 1.1 * s);
    if (trim) o += L(pd([q(-22, -1.8), q(0, -37.5), q(18, -1.8)]), trim, 1.8 * s);
    return o + limb('M' + pt(q(0, -39)) + 'L' + pt(q(0, -46)), '#6a4a2a', 2 * s) + L('M' + pt(q(0, -44)) + 'L' + pt(q(-34, 2)) + 'M' + pt(q(46, -36)) + 'L' + pt(q(72, 0)), '#5a4a30', 0.9 * s);
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
  // log palisade with pointed tops and two rope bands; spikes angle outward
  function palisade(c, x0, x1, y, h, col, seed, spikes) {
    col = col || '#8a6a44'; var r = rng(seed || 11), o = '', lw = 9;
    for (var x = x0; x < x1; x += lw) {
      var hh = h * (0.9 + r() * 0.18);
      o += body(c, pd([[x, y], [x, y - hh + 5], [x + lw / 2, y - hh - 4], [x + lw, y - hh + 5], [x + lw, y]], true), r() < 0.5 ? col : lt(col, 0.07), F(pd([[x + lw * 0.6, y - hh - 6], [x + lw + 1, y - hh - 6], [x + lw + 1, y + 1], [x + lw * 0.6, y + 1]], true), dk(col, 0.3), 0.8), 1.4);
    }
    var rl = 'M' + pt([x0, y - h * 0.28]) + 'L' + pt([x1, y - h * 0.3]) + 'M' + pt([x0, y - h * 0.7]) + 'L' + pt([x1, y - h * 0.72]);
    o += L(rl, OL, 3.6) + L(rl, '#b8a070', 1.8);
    if (spikes) for (var sx = x0 + 10; sx < x1 - 4; sx += 20) { var sy = y - h * 0.45; o += P(pd([[sx, sy - 2.5], [sx - 15, sy + 6], [sx + 1, sy + 3]], true), c.cel('#ddd2b8'), 1.2); }
    return o;
  }
  // wooden watch platform on stilts with a thatched roof and a ladder
  function watchTower(c, x, y, s, roof, flagCol, mark) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#7a5a36', o = E(x, y + 2, 26 * s, 4 * s, '#000', 0, 0.26);
    o += limb('M' + pt(q(-16, 0)) + 'L' + pt(q(-12, -56)) + 'M' + pt(q(16, 0)) + 'L' + pt(q(12, -56)), wood, 3.2 * s) + limb('M' + pt(q(-15, -4)) + 'L' + pt(q(12, -30)) + 'M' + pt(q(15, -4)) + 'L' + pt(q(-12, -30)) + 'M' + pt(q(-14, -30)) + 'L' + pt(q(12, -52)) + 'M' + pt(q(14, -30)) + 'L' + pt(q(-12, -52)), dk(wood, 0.15), 1.8 * s);
    var lad = 'M' + pt(q(18, 0)) + 'L' + pt(q(16, -56)) + 'M' + pt(q(25, 0)) + 'L' + pt(q(23, -56));
    for (var j = 1; j < 8; j++) lad += 'M' + pt(q(18 - j * 0.28, -j * 7)) + 'L' + pt(q(25 - j * 0.28, -j * 7));
    o += L(lad, OL, 3.2 * s) + L(lad, lt(wood, 0.1), 1.5 * s);
    o += P(pd([q(-22, -56), q(22, -56), q(21, -50), q(-21, -50)], true), c.cel(wood), 1.6 * s);
    var rail = 'M' + pt(q(-20, -56)) + 'L' + pt(q(-20, -68)) + 'M' + pt(q(20, -56)) + 'L' + pt(q(20, -68)) + 'M' + pt(q(0, -56)) + 'L' + pt(q(0, -68)) + 'M' + pt(q(-20, -66)) + 'L' + pt(q(20, -66));
    o += L(rail, OL, 3.4 * s) + L(rail, lt(wood, 0.1), 1.7 * s);
    if (flagCol) o += body(c, pd([q(-18, -65), q(-4, -65), q(-4, -48), q(-11, -44), q(-18, -48)], true), flagCol, F(pd([q(-10, -66), q(-3, -66), q(-3, -44), q(-10, -44)], true), '#000', 0.25), 1.2 * s) + (mark ? mark(x - 11 * s, y - 58 * s, 0.6 * s) : '');
    o += limb('M' + pt(q(-18, -56)) + 'L' + pt(q(-18, -80)) + 'M' + pt(q(18, -56)) + 'L' + pt(q(18, -80)), wood, 2 * s);
    roof = roof || '#b89a56';
    var th = '';
    for (var k = -3; k <= 3; k++) th += 'M' + pt(q(k * 7, -76)) + 'L' + pt(q(k * 2, -92));
    return o + body(c, pd([q(-28, -76), q(0, -96), q(28, -76)], true), roof, L(th, dk(roof, 0.35), 0.9 * s) + F(pd([q(2, -98), q(30, -98), q(30, -74), q(8, -74)], true), dk(roof, 0.25), 0.8), 1.6 * s) +
      L('M' + pt(q(-28, -76)) + 'l' + n(-2 * s) + ',' + n(5 * s) + 'M' + pt(q(-16, -76)) + 'l' + n(-1 * s) + ',' + n(5 * s) + 'M' + pt(q(16, -76)) + 'l' + n(1 * s) + ',' + n(5 * s) + 'M' + pt(q(28, -76)) + 'l' + n(2 * s) + ',' + n(5 * s), dk(roof, 0.2), 1.6 * s);
  }
  // ---- coast pieces (copies of art_tanaris.js) ----
  // ---- coast pieces ----
  function sea(c, y0, y1, seed) {
    return R(-2, y0, 404, y1 - y0, c.lg([[0, '#3aa8b8'], [0.5, '#2a8aa4'], [1, '#56c0c0']])) + waves(seed || 3, y0 + 3, y1 - 2, 30, '#e8fbf8') + L('M-2,' + n(y0) + 'L402,' + n(y0), '#bcecec', 1.4, 0.8);
  }
  // wooden pier running from (x0, y) out to x1, planks and posts
  function pier(c, x0, x1, y, s) {
    var o = '', pl = '', d = 'M' + pt([x0, y - 4 * s]) + 'L' + pt([x1, y - 4 * s]) + 'L' + pt([x1 + 4 * s, y + 2 * s]) + 'L' + pt([x0 - 4 * s, y + 2 * s]) + 'Z';
    for (var x = x0 + 6; x < x1; x += 22) o += limb('M' + pt([x, y]) + 'L' + pt([x, y + 14 * s]), '#4a3220', 3 * s);
    for (var px = x0; px < x1; px += 7) pl += 'M' + pt([px, y - 4 * s]) + 'L' + pt([px - 2 * s, y + 2 * s]);
    return o + body(c, d, '#a07a4e', L(pl, '#6a4a2c', 0.9), 1.4 * s);
  }
  // ---- shore pieces and the crab rig (copies of art_tidewatch.js; the crab faces left) ----
  function barnacles(seed, cnt, x0, x1, y0, y1, s) {
    var r = rng(seed), o = ''; s = s || 1;
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (1.1 + r() * 1.3) * s; o += C(x, y, rr, BARN, 0.7 * s) + C(x, y - rr * 0.1, rr * 0.42, '#4a4a44'); }
    return o;
  }
  function shell(c, x, y, s, col) {
    col = col || '#f0d8c0';
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 6 * s, y - 4 * s]) + 'C' + pt([x - 7.4 * s, y - 10 * s]) + ' ' + pt([x + 7.4 * s, y - 10 * s]) + ' ' + pt([x + 6 * s, y - 4 * s]) + 'Z', rd = '';
    for (var k = -2; k <= 2; k++) rd += 'M' + pt([x, y]) + 'L' + pt([x + k * 2.6 * s, y - 8.4 * s]);
    return E(x, y + 0.5, 6 * s, 1.4 * s, '#000', 0, 0.2) + P(d, c.cel(col), 0.9 * s) + L(rd, dk(col, 0.3), 0.6 * s);
  }
  function starfish(c, x, y, r, col) { return P(starD(x, y, r, 0.42), c.cel(col || '#e8783a'), Math.max(0.6, r * 0.14)) + C(x, y, r * 0.2, lt(col || '#e8783a', 0.3)); }
  // ---- crab rig (facing left) ----
  function crabLeg(c, l, col, w) {
    var t = l[2];
    var m1 = lerp2(l[1], t, 0.45), dx = t[0] - l[1][0], dy = t[1] - l[1][1], dl = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / dl * w * 0.5, py = dx / dl * w * 0.5;
    return limb(pd([l[0], l[1]]), col, w) + limb(pd([l[1], [t[0], t[1] - 3]]), dk(col, 0.06), w * 0.78) + L('M' + pt([m1[0] - px, m1[1] - py]) + 'L' + pt([m1[0] + px, m1[1] + py]), OL, 1) + C(l[1][0], l[1][1], w * 0.55, c.cel(lt(col, 0.12)), 1.1) +
      P(pd([[t[0] - w * 0.4, t[1] - 4], [t[0], t[1] + 1], [t[0] + w * 0.4, t[1] - 4]], true), '#e8dcc8', 0.9);
  }
  // pincer: palm at p, fingers pointing along ang; the movable finger sits on the +v side
  function chela(c, p, s, ang, col, gap, o) {
    o = o || {};
    var q = dirQ(p, ang), g = gap || 0;
    var palm = 'M' + pt(q(-12 * s, 0)) + 'C' + pt(q(-12 * s, 11 * s)) + ' ' + pt(q(4 * s, 13 * s)) + ' ' + pt(q(10 * s, 7 * s)) + 'L' + pt(q(10 * s, -7 * s)) + 'C' + pt(q(4 * s, -12 * s)) + ' ' + pt(q(-12 * s, -10 * s)) + ' ' + pt(q(-12 * s, 0)) + 'Z';
    var fA = 'M' + pt(q(6 * s, 5 * s)) + 'C' + pt(q(14 * s, (10 + g) * s)) + ' ' + pt(q(25 * s, (8 + g) * s)) + ' ' + pt(q(30 * s, (1.5 + g * 0.5) * s)) + 'C' + pt(q(24 * s, (2.5 + g * 0.4) * s)) + ' ' + pt(q(15 * s, 3 * s)) + ' ' + pt(q(8 * s, 1 * s)) + 'Z';
    var fB = 'M' + pt(q(6 * s, -6 * s)) + 'C' + pt(q(14 * s, -9.5 * s)) + ' ' + pt(q(23 * s, -7 * s)) + ' ' + pt(q(28 * s, -1.5 * s)) + 'C' + pt(q(22 * s, -2 * s)) + ' ' + pt(q(14 * s, -1 * s)) + ' ' + pt(q(8 * s, -1 * s)) + 'Z';
    var teeth = '';
    [13, 18, 23].forEach(function (u) { teeth += P(pd([q((u - 1.4) * s, -1.6 * s), q(u * s, 1.2 * s), q((u + 1.4) * s, -1.6 * s)], true), '#f4ecdc', 0.6 * s); });
    var tip = o.tip || dk(col, 0.45);
    return P(fB, c.cel(dk(col, 0.06)), 1.8 * Math.max(0.7, s)) + teeth + F(pd([q(22 * s, -6 * s), q(29 * s, -1.4 * s), q(24 * s, -1.6 * s)], true), tip, 0.9) +
      body(c, palm, col, F(pd([q(-14 * s, -14 * s), q(12 * s, -14 * s), q(12 * s, -3 * s), q(-14 * s, -3 * s)], true), dk(col, 0.25), 0.7) + E(q(-4 * s, 6 * s)[0], q(-4 * s, 6 * s)[1], 5 * s, 2.6 * s, lt(col, 0.35), 0, 0.7) + (o.palm ? o.palm(q) : ''), 2 * Math.max(0.7, s)) +
      P(fA, c.cel(col), 1.8 * Math.max(0.7, s)) + F(pd([q(24 * s, (6 + g) * s), q(30 * s, (1.5 + g * 0.5) * s), q(25 * s, (2.4 + g * 0.4) * s)], true), tip, 0.9);
  }
  function crab(c, o) {
    var sh = o.shell, leg = o.leg || dk(sh, 0.1), legF = dk(leg, 0.22), s = shadow(c, 66, o.shadowR || 54), top = 56 - (o.dome || 0);
    if (o.back) s += o.back(c);
    [[[90, 80], [110, 66], [116, 120]], [[94, 86], [118, 76], [124, 119]], [[92, 92], [116, 90], [112, 121]], [[84, 97], [102, 102], [100, 121]]].forEach(function (l) { s += crabLeg(c, l, legF, o.legW || 5.2); });
    // far claw, raised
    var fc = o.farClaw || [28, 42];
    s += limb('M50,72 L38,58 L' + pt(fc), legF, 7.4) + chela(c, fc, o.farK || 0.66, o.farAng == null ? -PI * 0.64 : o.farAng, legF, o.farGap == null ? 5 : o.farGap);
    // eye stalks
    var eyes = o.eyes || [[40, 50], [51, 46]];
    s += limb('M44,' + (top + 12) + ' L' + pt(eyes[0]), leg, 2.4) + limb('M52,' + (top + 8) + ' L' + pt(eyes[1]), dk(leg, 0.1), 2.4);
    eyes.forEach(function (e, i) { if (o.eyeFn) s += o.eyeFn(c, e, i); else s += C(e[0], e[1], 3.3, '#141414', 1.3) + C(e[0] - 1, e[1] - 1, 1, '#ffffff'); });
    // the shell
    var sd = 'M28,86 C26,' + (top + 12) + ' 44,' + top + ' 66,' + top + ' C90,' + top + ' 106,' + (top + 12) + ' 106,86 C106,96 94,101 66,101 C42,101 30,97 28,86 Z';
    var grooves = 'M46,' + (top + 12) + ' Q66,' + (top + 24) + ' 88,' + (top + 12) + ' M60,' + (top + 3) + ' Q64,' + (top + 14) + ' 62,' + (top + 26) + ' M36,' + (top + 22) + ' Q48,' + (top + 30) + ' 58,' + (top + 28) + ' M96,' + (top + 18) + ' Q86,' + (top + 28) + ' 76,' + (top + 28);
    var inner = F('M76,30 L118,30 L118,104 L84,104 C98,84 96,60 76,30 Z', dk(sh, 0.28), 0.75) + F('M20,88 C40,98 90,100 114,86 L114,106 L20,106 Z', dk(sh, 0.35), 0.85) + E(46, top + 10, 12, 5, lt(sh, 0.3), 0, 0.6) + L(grooves, dk(sh, 0.35), 1.2, 0.8) + (o.inner ? o.inner(c, top) : '');
    s += body(c, sd, sh, inner, 2.4) + L('M32,' + (top + 22) + ' C38,' + (top + 8) + ' 52,' + (top + 1.6) + ' 70,' + (top + 1.6), lt(sh, 0.5), 1.3, 0.75);
    [[29, 80], [31, 72], [35, 65], [42, 60]].forEach(function (p, i) { var a = PI + 0.9 - i * 0.45, q = dirQ(p, a); s += P(pd([q(0, -2.4), q(5, 0), q(0, 2.4)], true), c.cel(lt(sh, 0.1)), 1); });
    if (o.shellTop) s += o.shellTop(c, top);
    s += P('M34,92 L46,92 L45,99 L36,99 Z', c.cel(dk(sh, 0.2)), 1.2) + L('M38,93 l0,5 M42,93 l0,5', OL, 0.8);
    // near legs, under the front
    [[[48, 96], [30, 96], [22, 121]], [[56, 99], [40, 104], [36, 121]], [[66, 100], [56, 108], [52, 121]]].forEach(function (l) { s += crabLeg(c, l, leg, o.legW || 5.6); });
    // near claw
    var nc = o.nearClaw || [32, 92];
    s += limb('M50,90 L40,100 L' + pt(nc), leg, 9) + chela(c, nc, o.nearK || 0.8, o.nearAng == null ? PI + 0.22 : o.nearAng, leg, o.nearGap == null ? 6 : o.nearGap, o.nearOpt);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ============================================================
  //  RUMHOOK BAY: palette
  // ============================================================
  var MOSS = '#5e8a36', MOSSD = '#3e6428', STONE = '#8a9686', TST = '#8c9a86', LEAF = '#4a8e3a', PALM = '#5c9c3c', TRUNK = '#8a6a44', SAND = '#dcc48c', BONE = '#e0d6bc';
  var BRASS = '#c8963a', BRASSD = '#8a5e22', IRON = '#5e5c64', IROND = '#3a3840', GOLD = '#e8b840', LEDG = '#2a2430', LEDR = '#8a1e24', WOOD = '#8a6440', BARN = '#dcd8c6';
  var PLANK = '#9a7048', PLANKD = '#5a3e26', ROPE = '#c8a878', MUD = '#7a5a3a', WAX = '#b8281e', GRAIN = '#d6b67a', HIDE = '#a87a4e', RSAND = '#c0644a';
  var BUNT = ['#d8402e', '#f0c030', '#2e8ab8', '#4aa04a', '#e8782a'];

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  function quad(p0, c0, p2, t) { var u = 1 - t; return [u * u * p0[0] + 2 * u * t * c0[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c0[1] + t * t * p2[1]]; }
  // goblin bunting: a sagging rope from (x0, y0) to (x1, y1) with triangular pennants
  function bunting(x0, y0, x1, y1, sag, s, cols) {
    cols = cols || BUNT; s = s || 1;
    var p0 = [x0, y0], p2 = [x1, y1], cc = [(x0 + x1) / 2, (y0 + y1) / 2 + sag * 2], d = 'M' + pt(p0) + 'Q' + pt(cc) + ' ' + pt(p2), o = L(d, OL, 2.2 * s) + L(d, ROPE, 1 * s);
    var k = Math.max(2, Math.round(Math.abs(x1 - x0) / (11 * s)));
    for (var i = 1; i < k; i++) { var q = quad(p0, cc, p2, i / k); o += P(pd([[q[0] - 3.6 * s, q[1]], [q[0] + 3.6 * s, q[1]], [q[0], q[1] + 8.4 * s]], true), cols[i % cols.length], 0.9 * s); }
    return o;
  }
  // rope bridge between two deck points: planks on a sagging rope with a hand line
  function ropeBridge(c, x0, y0, x1, y1, sag) {
    var p0 = [x0, y0], p2 = [x1, y1], cc = [(x0 + x1) / 2, (y0 + y1) / 2 + sag * 2], hc = [(x0 + x1) / 2, (y0 + y1) / 2 - 12 + sag * 1.2], h0 = [x0, y0 - 12], h2 = [x1, y1 - 12];
    var k = Math.max(4, Math.round(Math.abs(x1 - x0) / 5.4)), o = '', vt = '', pl = '';
    var hl = 'M' + pt(h0) + 'Q' + pt(hc) + ' ' + pt(h2), dl = 'M' + pt(p0) + 'Q' + pt(cc) + ' ' + pt(p2);
    o += L(hl, OL, 2.4) + L(hl, ROPE, 1);
    for (var i = 0; i <= k; i++) {
      var q = quad(p0, cc, p2, i / k);
      if (i % 3 === 0) { var h = quad(h0, hc, h2, i / k); vt += 'M' + pt(h) + 'L' + pt(q); }
      pl += P(pd([[q[0] - 2.3, q[1] - 1.4], [q[0] + 2.3, q[1] - 1.4], [q[0] + 2.3, q[1] + 2], [q[0] - 2.3, q[1] + 2]], true), i % 2 ? PLANK : lt(PLANK, 0.1), 0.8);
    }
    return o + L(vt, OL, 2) + L(vt, ROPE, 0.8) + L(dl, OL, 2.4) + pl;
  }
  // plank hut on tall stilts (x = left, y = water / ground line, st = stilt height); lit = warm window
  function stiltHut(c, x, y, w, h, st, col, roof, seed, lit) {
    var r = rng(seed || 5), fy = y - st, o = E(x + w / 2, y + 2, w * 0.6, 3, '#000', 0, 0.22), pl = '', step = (w - 6) / 3;
    o += L('M' + pt([x + 3, y - 2]) + 'L' + pt([x + w - 3, fy + 5]) + 'M' + pt([x + w - 3, y - 2]) + 'L' + pt([x + 3, fy + 5]), OL, 3) + L('M' + pt([x + 3, y - 2]) + 'L' + pt([x + w - 3, fy + 5]) + 'M' + pt([x + w - 3, y - 2]) + 'L' + pt([x + 3, fy + 5]), PLANKD, 1.4);
    for (var i = 0; i <= 3; i++) { var sx = x + 3 + i * step; o += limb('M' + pt([sx, y + 3]) + 'L' + pt([sx, fy]), PLANKD, 2.6); }
    o += P(pd([[x - 5, fy], [x + w + 5, fy], [x + w + 5, fy + 4.4], [x - 5, fy + 4.4]], true), c.cel(PLANK), 1.3);
    for (var px = x + 5; px < x + w - 1; px += 5.5) pl += 'M' + pt([px + (r() - 0.5), fy]) + 'L' + pt([px + (r() - 0.5), fy - h]);
    var wall = pd([[x, fy], [x, fy - h], [x + w, fy - h], [x + w, fy]], true);
    o += body(c, wall, col, L(pl, dk(col, 0.35), 0.9) + F(pd([[x + w * 0.7, fy - h - 4], [x + w + 2, fy - h - 4], [x + w + 2, fy + 2], [x + w * 0.7, fy + 2]], true), dk(col, 0.28), 0.7), 1.6);
    var wx = x + w * 0.54, wy = fy - h * 0.7, ww = w * 0.24, wh = h * 0.34;
    if (lit) o += C(wx + ww / 2, wy + wh / 2, ww * 1.7, glow(c, '#ffc060', 0.6));
    o += R(wx, wy, ww, wh, lit ? '#ffd27a' : '#2a1c14', 1.1) + L('M' + pt([wx + ww / 2, wy]) + 'L' + pt([wx + ww / 2, wy + wh]) + 'M' + pt([wx, wy + wh / 2]) + 'L' + pt([wx + ww, wy + wh / 2]), OL, 0.8);
    o += R(x + w * 0.12, fy - h * 0.72, w * 0.24, h * 0.72, '#2a1c14', 1.2);
    var ap = [x + w / 2, fy - h - w * 0.4], rd = pd([[x - 6, fy - h + 3], ap, [x + w + 6, fy - h + 3]], true), rib = '';
    for (var k = 1; k < 5; k++) { var t = k / 5; rib += 'M' + pt([x - 6 + (w + 12) * t, fy - h + 3]) + 'L' + pt(lerp2([x - 6 + (w + 12) * t, fy - h + 3], ap, 0.55)); }
    o += body(c, rd, roof, L(rib, dk(roof, 0.3), 0.9) + F(pd([ap, [x + w + 8, fy - h + 5], [ap[0], fy - h + 5]], true), dk(roof, 0.25), 0.75) + R(x + w * 0.1, fy - h - 4, w * 0.18, 5, lt(roof, 0.15), 0, 0) , 1.6);
    return o;
  }
  // a ship's mast seen over the piers: pole, yards with furled canvas, crow's nest and a pennant (x = foot, y = foot)
  function mast(c, x, y, h, s, pen) {
    var top = y - h, o = limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#5a3a22', 2.6 * s);
    [[0.2, 22], [0.52, 17]].forEach(function (yd) {
      var yy = top + h * yd[0], w = yd[1] * s;
      o += limb('M' + pt([x - w, yy]) + 'L' + pt([x + w, yy]), '#5a3a22', 1.6 * s) + R(x - w + 1, yy + 1, w * 2 - 2, 4 * s, c.cel('#e8dcc0'), 1 * s, 2);
    });
    o += P(pd([[x - 6 * s, top + h * 0.34], [x + 6 * s, top + h * 0.34], [x + 5 * s, top + h * 0.34 + 5 * s], [x - 5 * s, top + h * 0.34 + 5 * s]], true), c.cel('#6a4428'), 1 * s);
    o += L('M' + pt([x, top + 2]) + 'L' + pt([x - 26 * s, y]) + 'M' + pt([x, top + 2]) + 'L' + pt([x + 26 * s, y]), '#3a2a1e', 0.8 * s, 0.8);
    return o + P(pd([[x, top - 1], [x + 16 * s, top + 2.5 * s], [x, top + 6 * s]], true), pen || BUNT[0], 0.9 * s);
  }
  // cargo net bundle: crates and a sack wrapped in a rope net (x = centre, y = bottom)
  function cargoNet(c, x, y, s) {
    var d = 'M' + pt([x, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 26 * s]) + ' ' + pt([x - 18 * s, y - 18 * s]) + ' ' + pt([x - 17 * s, y - 6 * s]) + 'C' + pt([x - 16 * s, y]) + ' ' + pt([x + 16 * s, y]) + ' ' + pt([x + 17 * s, y - 6 * s]) + 'C' + pt([x + 18 * s, y - 18 * s]) + ' ' + pt([x + 8 * s, y - 26 * s]) + ' ' + pt([x, y - 30 * s]) + 'Z';
    var o = F(d, '#3a2a1a', 0.55) + crate(c, x - 7 * s, y - 1 * s, 0.7 * s, '#a8743e') + crate(c, x + 7 * s, y - 1.5 * s, 0.65 * s, '#9a6a38') + sack(c, x, y - 11 * s, 0.6 * s, GRAIN);
    var net = '', cl = c.clip(d);
    for (var i = -5; i <= 5; i++) net += 'M' + pt([x + i * 6 * s - 20 * s, y + 2]) + 'L' + pt([x + i * 6 * s + 20 * s, y - 32 * s]) + 'M' + pt([x + i * 6 * s + 20 * s, y + 2]) + 'L' + pt([x + i * 6 * s - 20 * s, y - 32 * s]);
    o += '<g clip-path="url(#' + cl + ')">' + L(net, OL, 2 * s) + L(net, ROPE, 0.9 * s) + '</g>' + L(d, OL, 1.6 * s);
    return o;
  }
  // the lighthouse-crane: a tapering timber trestle with a lamp room on top and a jib arm (dir 1 = right) hoisting a cargo net
  function lightCrane(c, x, y, s, dir) {
    dir = dir || 1; var q = function (u, v) { return [x + u * dir * s, y + v * s]; }, wood = '#7a5634', H = 132, o = E(x, y + 3, 32 * s, 5 * s, '#000', 0, 0.3), br = '';
    for (var j = 0; j < 6; j++) { var y0 = -j * H / 6, y1 = -(j + 1) * H / 6, w0 = 22 - 11 * j / 6, w1 = 22 - 11 * (j + 1) / 6; br += 'M' + pt(q(-w0, y0)) + 'L' + pt(q(w1, y1)) + 'M' + pt(q(w0, y0)) + 'L' + pt(q(-w1, y1)) + 'M' + pt(q(-w1, y1)) + 'L' + pt(q(w1, y1)); }
    o += L(br, OL, 4 * s) + L(br, lt(wood, 0.12), 1.8 * s);
    o += limb('M' + pt(q(-22, 0)) + 'L' + pt(q(-11, -H)) + 'M' + pt(q(22, 0)) + 'L' + pt(q(11, -H)), wood, 3.6 * s);
    // jib arm, its stay and the hoist rope
    var jb = q(-6, -H * 0.62), tip = q(78, -H * 0.86), hookP = [tip[0], tip[1] + 44 * s];
    o += limb('M' + pt(jb) + 'L' + pt(tip), wood, 3.4 * s) + L('M' + pt(q(14, -H * 0.72)) + 'L' + pt(q(68, -H * 0.84)), OL, 1.2 * s) + limb('M' + pt(q(8, -H * 0.62)) + 'L' + pt(q(30, -H * 0.73)), dk(wood, 0.1), 1.6 * s);
    o += L('M' + pt(q(0, -H - 4)) + 'L' + pt(tip), '#3a2a1e', 1 * s) + C(tip[0], tip[1], 3 * s, c.cel(IRON), 1 * s);
    o += L('M' + pt(tip) + 'L' + pt(hookP), OL, 1.8 * s) + L('M' + pt(tip) + 'L' + pt(hookP), ROPE, 0.8 * s);
    o += L('M' + pt([hookP[0], hookP[1]]) + 'L' + pt([hookP[0] - 14 * s, hookP[1] + 8 * s]) + 'M' + pt(hookP) + 'L' + pt([hookP[0] + 14 * s, hookP[1] + 8 * s]), ROPE, 1 * s) + cargoNet(c, hookP[0], hookP[1] + 32 * s, 0.95 * s);
    // winch drum at the foot
    o += R(q(16, -14)[0] - 7 * s, q(0, -14)[1] - 6 * s, 14 * s, 12 * s, c.cel(PLANKD), 1.3 * s) + C(q(16, -8)[0], q(0, -8)[1], 5 * s, c.cel(ROPE), 1.2 * s) + L(ellD(q(16, -8)[0], q(0, -8)[1], 2.6 * s, 2.6 * s), dk(ROPE, 0.3), 0.8 * s);
    // gallery, lamp room, roof
    var ty = y - H * s;
    o += P(pd([[x - 20 * s, ty], [x + 20 * s, ty], [x + 18 * s, ty + 5 * s], [x - 18 * s, ty + 5 * s]], true), c.cel(PLANK), 1.5 * s);
    var rl = 'M' + pt([x - 18 * s, ty]) + 'L' + pt([x - 18 * s, ty - 8 * s]) + 'M' + pt([x + 18 * s, ty]) + 'L' + pt([x + 18 * s, ty - 8 * s]) + 'M' + pt([x - 18 * s, ty - 7 * s]) + 'L' + pt([x + 18 * s, ty - 7 * s]);
    o += C(x, ty - 18 * s, 46 * s, glow(c, '#ffd070', 0.55));
    o += R(x - 11 * s, ty - 26 * s, 22 * s, 26 * s, c.cel(PLANKD), 1.6 * s) + R(x - 8 * s, ty - 23 * s, 16 * s, 17 * s, c.rg([[0, '#fffbe0'], [0.5, '#ffd060'], [1, '#e8902a']]), 1.2 * s) + L('M' + pt([x - 2.6 * s, ty - 23 * s]) + 'L' + pt([x - 2.6 * s, ty - 6 * s]) + 'M' + pt([x + 2.6 * s, ty - 23 * s]) + 'L' + pt([x + 2.6 * s, ty - 6 * s]), OL, 1 * s);
    o += L(rl, OL, 3 * s) + L(rl, lt(wood, 0.12), 1.4 * s);
    o += body(c, pd([[x - 16 * s, ty - 25 * s], [x, ty - 44 * s], [x + 16 * s, ty - 25 * s]], true), '#c84a2e', F(pd([[x, ty - 46 * s], [x + 18 * s, ty - 24 * s], [x, ty - 24 * s]], true), dk('#c84a2e', 0.3), 0.75), 1.6 * s);
    o += limb('M' + pt([x, ty - 44 * s]) + 'L' + pt([x, ty - 52 * s]), IROND, 1.2 * s) + P(pd([[x, ty - 52 * s], [x + 12 * s, ty - 49 * s], [x, ty - 46 * s]], true), BUNT[1], 0.9 * s);
    return o;
  }
  // plank boardwalk floor from y to the bottom edge, planks running across in perspective (vx = joint vanishing x)
  function deck(c, y, col, seed, vx) {
    var r = rng(seed || 3), o = R(-2, y, 404, 242 - y, c.lg([[0, dk(col, 0.25)], [0.3, col], [1, dk(col, 0.12)]])), d = '', nails = '', sh = '';
    vx = vx == null ? 200 : vx;
    var ys = []; for (var j = 0; j <= 9; j++) { var t = j / 9; ys.push(y + (242 - y) * t * t * 0.7 + (242 - y) * t * 0.3); }
    for (var k = 0; k < ys.length - 1; k++) {
      var y0 = ys[k], y1 = ys[k + 1], hgt = y1 - y0, off = r() * 60;
      d += 'M-2,' + n(y0) + 'L402,' + n(y0 + (r() - 0.5));
      if (r() < 0.5) sh += R(-2, y0 + 0.6, 404, hgt - 1.2, k % 2 ? dk(col, 0.06) : lt(col, 0.05), 0);
      for (var x = -20 + off; x < 420; x += 70 + hgt * 6) { d += 'M' + pt([x, y0]) + 'L' + pt([x + (x - vx) * 0.02, y1]); nails += C(x + 3, y0 + hgt * 0.5, 0.4 + hgt * 0.06, '#3a2a1a', 0, 0.7) + C(x - 3, y0 + hgt * 0.5, 0.4 + hgt * 0.06, '#3a2a1a', 0, 0.7); }
    }
    return o + sh + L(d, dk(col, 0.45), 1.1, 0.85) + nails + R(-2, y - 1, 404, 3, lt(col, 0.2), 0);
  }
  // a pier post with a rope coil on top (mooring bollard)
  function bollard(c, x, y, s) { return E(x, y + 1, 7 * s, 2 * s, '#000', 0, 0.3) + R(x - 4 * s, y - 14 * s, 8 * s, 14 * s, c.cel(PLANKD), 1.4 * s) + E(x, y - 14 * s, 4 * s, 1.6 * s, lt(PLANKD, 0.2), 1 * s) + L('M' + pt([x - 4 * s, y - 9 * s]) + 'L' + pt([x + 4 * s, y - 7 * s]) + 'M' + pt([x - 4 * s, y - 7 * s]) + 'L' + pt([x + 4 * s, y - 5 * s]), ROPE, 1.6 * s); }
  function ropeCoil(c, x, y, s) { return E(x, y, 9 * s, 3.2 * s, c.cel(ROPE), 1.2 * s) + L(ellD(x, y - 0.4 * s, 6 * s, 2 * s) + ellD(x, y - 0.6 * s, 3 * s, 1 * s), dk(ROPE, 0.3), 0.9 * s); }
  // grain sack lying on its side, the neck tied, a wax seal on the front (claw = the Black Ledger's mark pressed in it)
  function bag(c, x, y, s, col, seal, claw_) {
    col = col || GRAIN; var w = 12 * s, h = 12 * s, e = 2.6 * s;
    var d = 'M' + pt([x - w - e, y + 0.6 * s]) + 'C' + pt([x - w - 0.4 * s, y - h * 0.35]) + ' ' + pt([x - w - 0.4 * s, y - h * 0.7]) + ' ' + pt([x - w - e, y - h - 0.6 * s]) +
      'C' + pt([x - w * 0.4, y - h - 2.2 * s]) + ' ' + pt([x + w * 0.4, y - h - 2.2 * s]) + ' ' + pt([x + w + e, y - h - 0.6 * s]) +
      'C' + pt([x + w + 0.4 * s, y - h * 0.7]) + ' ' + pt([x + w + 0.4 * s, y - h * 0.35]) + ' ' + pt([x + w + e, y + 0.6 * s]) +
      'C' + pt([x + w * 0.4, y + 2 * s]) + ' ' + pt([x - w * 0.4, y + 2 * s]) + ' ' + pt([x - w - e, y + 0.6 * s]) + 'Z';
    var st = 'M' + pt([x - w * 0.62, y - h - 1.4 * s]) + 'L' + pt([x - w * 0.62, y + 1.2 * s]) + 'M' + pt([x - w * 0.46, y - h - 1.6 * s]) + 'L' + pt([x - w * 0.46, y + 1.4 * s]) + 'M' + pt([x + w * 0.62, y - h - 1.4 * s]) + 'L' + pt([x + w * 0.62, y + 1.2 * s]);
    var o = body(c, d, col, L(st, '#5a6e8e', 1.3 * s, 0.75) + F(pd([[x - w - 4 * s, y - h * 0.3], [x + w + 4 * s, y - h * 0.3], [x + w + 4 * s, y + 3 * s], [x - w - 4 * s, y + 3 * s]], true), dk(col, 0.24), 0.8) +
      F(pd([[x + w * 0.5, y - h - 3 * s], [x + w + 4 * s, y - h - 3 * s], [x + w + 4 * s, y + 3 * s], [x + w * 0.5, y + 3 * s]], true), dk(col, 0.16), 0.6) + L('M' + pt([x - w * 0.8, y - h * 0.82]) + 'Q' + pt([x - w * 0.2, y - h * 0.98]) + ' ' + pt([x + w * 0.3, y - h * 0.86]), lt(col, 0.35), 1 * s, 0.8), 1.4 * s);
    if (seal) {
      var sx = x + w * 0.12, sy = y - h * 0.48;
      o += P(pd([[sx - 1.2 * s, sy + 2], [sx - 3 * s, sy + 7 * s], [sx - 0.8 * s, sy + 5.6 * s], [sx + 0.4 * s, sy + 2]], true), dk(seal, 0.12), 0.6 * s) + P(pd([[sx + 0.6 * s, sy + 2], [sx + 3.2 * s, sy + 6.6 * s], [sx + 1 * s, sy + 5.8 * s], [sx - 0.2 * s, sy + 2]], true), seal, 0.6 * s);
      o += P(shag(sx, sy, 3.6 * s, 3.3 * s, 6, 0.14, Math.round(x * 3 + y)), c.cel(seal), 0.9 * s) + (claw_ ? claw(sx, sy, 0.15 * s, lt(seal, 0.45)) : L(ellD(sx, sy, 1.8 * s, 1.7 * s), dk(seal, 0.35), 0.8 * s)) + E(sx - 1.4 * s, sy - 1.6 * s, 0.9 * s, 0.5 * s, '#ffffff', 0, 0.55);
    }
    return o;
  }
  // a neat pyramid of lying sacks (x = centre, y = ground), rows from the bottom
  function bagStack(c, x, y, s, rows, col, seal, claw_, seed) {
    var r = rng(seed || 7), o = E(x, y + 2, rows * 14 * s, 3.4 * s, '#000', 0, 0.3);
    for (var j = 0; j < rows; j++) { var k = rows - j; for (var i = 0; i < k; i++) { var bx = x + (i - (k - 1) / 2) * 25 * s + (r() - 0.5) * 1.6 * s, by = y - j * 11 * s; o += bag(c, bx, by, s, r() < 0.3 ? lt(col || GRAIN, 0.06) : (col || GRAIN), seal, claw_); } }
    return o;
  }
  // the Blackgull: a white gull in flight (x, y = body)
  function gullD(x, y, s) { return 'M' + pt([x - 11 * s, y + 1 * s]) + 'Q' + pt([x - 6 * s, y - 7 * s]) + ' ' + pt([x, y + 1 * s]) + 'Q' + pt([x + 6 * s, y - 7 * s]) + ' ' + pt([x + 11 * s, y + 1 * s]) + 'Q' + pt([x + 6 * s, y - 3.2 * s]) + ' ' + pt([x, y + 4.4 * s]) + 'Q' + pt([x - 6 * s, y - 3.2 * s]) + ' ' + pt([x - 11 * s, y + 1 * s]) + 'Z'; }
  function gullMark(x, y, s, col) { return F(gullD(x, y, s), col || '#f4f0e6'); }
  function birds(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), d = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.25 + r() * 0.25; d += 'M' + pt([x - 11 * s, y + 1 * s]) + 'Q' + pt([x - 6 * s, y - 6 * s]) + ' ' + pt([x, y + 1 * s]) + 'Q' + pt([x + 6 * s, y - 6 * s]) + ' ' + pt([x + 11 * s, y + 1 * s]); } return L(d, col || '#3a3a40', 1.1); }
  // ship moored side-on (x = middle of the hull, y = waterline); o: sail, band, mark(x, y, s), flag, flagMark, tilt (deg), furl
  function ship(c, x, y, s, o) {
    o = o || {}; var q = function (u, v) { return [x + u * s, y + v * s]; }, hull = o.hull || '#6a4428', cloth = o.sail || '#e8dcc0', out = '';
    var hd = 'M' + pt(q(-70, -18)) + 'L' + pt(q(-58, -20)) + 'L' + pt(q(40, -20)) + 'L' + pt(q(46, -34)) + 'L' + pt(q(72, -36)) + 'L' + pt(q(70, -18)) + 'C' + pt(q(66, -2)) + ' ' + pt(q(50, 6)) + ' ' + pt(q(30, 6)) + 'L' + pt(q(-46, 6)) + 'C' + pt(q(-60, 4)) + ' ' + pt(q(-68, -6)) + ' ' + pt(q(-70, -18)) + 'Z';
    out += L('M' + pt(q(-22, -106)) + 'L' + pt(q(-66, -20)) + 'M' + pt(q(-22, -106)) + 'L' + pt(q(22, -94)) + 'M' + pt(q(22, -94)) + 'L' + pt(q(66, -36)) + 'M' + pt(q(-22, -106)) + 'L' + pt(q(-90, -30)), '#3a2a1e', 0.9 * s, 0.9);
    [[-22, 108, 1], [22, 96, 0.9]].forEach(function (m, mi) {
      var mx = x + m[0] * s, top = y - m[1] * s, k = m[2];
      out += limb('M' + pt([mx, y - 18 * s]) + 'L' + pt([mx, top]), '#5a3a22', 3.2 * s) + limb('M' + pt([mx - 24 * s * k, top + 16 * s]) + 'L' + pt([mx + 24 * s * k, top + 16 * s]) + 'M' + pt([mx - 20 * s * k, top + 52 * s]) + 'L' + pt([mx + 20 * s * k, top + 52 * s]), '#5a3a22', 2 * s);
      if (o.furl) { out += R(mx - 22 * s * k, top + 17 * s, 44 * s * k, 5 * s, c.cel(cloth), 1.1 * s, 2) + R(mx - 18 * s * k, top + 53 * s, 36 * s * k, 4.4 * s, c.cel(cloth), 1.1 * s, 2); }
      else {
        var sl = 'M' + pt([mx - 22 * s * k, top + 17 * s]) + 'L' + pt([mx + 22 * s * k, top + 17 * s]) + 'C' + pt([mx + 27 * s * k, top + 30 * s]) + ' ' + pt([mx + 23 * s * k, top + 43 * s]) + ' ' + pt([mx + 18 * s * k, top + 51 * s]) + 'L' + pt([mx - 18 * s * k, top + 51 * s]) + 'C' + pt([mx - 14 * s * k, top + 41 * s]) + ' ' + pt([mx - 16 * s * k, top + 28 * s]) + ' ' + pt([mx - 22 * s * k, top + 17 * s]) + 'Z';
        out += body(c, sl, cloth, F(pd([[mx + 5 * s, top + 14 * s], [mx + 30 * s, top + 14 * s], [mx + 30 * s, top + 54 * s], [mx + 5 * s, top + 54 * s]], true), dk(cloth, 0.22), 0.7) + L('M' + pt([mx - 8 * s, top + 18 * s]) + 'L' + pt([mx - 6 * s, top + 50 * s]) + 'M' + pt([mx + 8 * s, top + 18 * s]) + 'L' + pt([mx + 7 * s, top + 50 * s]), dk(cloth, 0.28), 1 * s) + (o.band ? F(pd([[mx - 24 * s, top + 17 * s], [mx + 24 * s, top + 17 * s], [mx + 22 * s, top + 23 * s], [mx - 22 * s, top + 23 * s]], true), o.band, 0.95) : '') + (o.patch ? R(mx - 14 * s, top + 34 * s, 8 * s, 7 * s, lt(cloth, 0.12), 0.8 * s) : ''), 1.4 * s);
        if (o.mark && mi === 0) out += o.mark(mx + 1 * s, top + 36 * s, 1.15 * s * k);
      }
      out += P(pd([[mx - 7 * s, top + 62 * s], [mx + 7 * s, top + 62 * s], [mx + 5 * s, top + 68 * s], [mx - 5 * s, top + 68 * s]], true), c.cel('#6a4428'), 1.1 * s);
    });
    var fx = x - 22 * s, fy = y - 108 * s;
    out += limb('M' + pt([fx, fy]) + 'L' + pt([fx, fy - 8 * s]), '#5a3a22', 1.6 * s) + body(c, pd([[fx, fy - 8 * s], [fx - 22 * s, fy - 6 * s], [fx - 18 * s, fy + 2 * s], [fx - 22 * s, fy + 8 * s], [fx, fy + 6 * s]], true), o.flag || '#1e1a1e', '', 1.2 * s) + (o.flagMark ? o.flagMark(fx - 10.5 * s, fy, 0.5 * s) : '');
    out += limb('M' + pt(q(-68, -22)) + 'L' + pt(q(-92, -30)), '#5a3a22', 2.2 * s);
    out += body(c, hd, hull, L('M' + pt(q(-64, -8)) + 'L' + pt(q(66, -8)) + 'M' + pt(q(-58, 0)) + 'L' + pt(q(56, 0)), dk(hull, 0.35), 1.2 * s) + R(x - 70 * s, y - 16 * s, 140 * s, 4 * s, o.trim || '#c8a040', 0) + F(pd([q(10, -40), q(80, -40), q(80, 10), q(20, 10)], true), dk(hull, 0.3), 0.6), 2 * s);
    for (var i = -3; i <= 2; i++) out += R(x + i * 16 * s - 3 * s, y - 13 * s, 6 * s, 5 * s, '#1a1210', 0.9 * s) + C(x + i * 16 * s, y - 10.5 * s, 1.4 * s, '#2a2a30');
    out += R(x + 48 * s, y - 31 * s, 5 * s, 5 * s, '#ffcf6a', 0.9 * s) + R(x + 58 * s, y - 31 * s, 5 * s, 5 * s, '#ffcf6a', 0.9 * s);
    return o.tilt ? G(out, 'rotate(' + n(o.tilt) + ' ' + n(x) + ' ' + n(y) + ')') : out;
  }
  // iron cannon on a wooden carriage, muzzle towards dir (x = carriage centre, y = ground)
  function cannon(c, x, y, s, dir) {
    dir = dir || -1; var q = function (u, v) { return [x + u * dir * s, y + v * s]; }, o = E(x, y + 1, 20 * s, 3 * s, '#000', 0, 0.3);
    o += P(pd([q(-12, -4), q(12, -4), q(10, -14), q(-4, -14)], true), c.cel(WOOD), 1.4 * s);
    var bl = pd([q(-14, -15), q(20, -21), q(21, -15), q(-13, -9)], true);
    o += body(c, bl, '#3a3a42', L('M' + pt(q(-12, -14)) + 'L' + pt(q(19, -19.5)), '#7a7a84', 1 * s, 0.8) + F(pd([q(-16, -12), q(24, -18), q(24, -12), q(-16, -6)], true), '#16161a', 0.5), 1.6 * s);
    o += C(q(-14, -12)[0], q(-14, -12)[1], 3 * s, c.cel('#3a3a42'), 1.2 * s) + R(Math.min(q(18, 0)[0], q(21.6, 0)[0]), q(0, -22)[1], 3.6 * s, 8 * s, c.cel('#4a4a52'), 1.1 * s) + L('M' + pt(q(4, -18.2)) + 'L' + pt(q(5, -12.6)), '#1a1a1e', 1.6 * s);
    [-6, 6].forEach(function (u) { var p = q(u, -3); o += C(p[0], p[1], 4.4 * s, c.cel(PLANKD), 1.2 * s) + C(p[0], p[1], 1.3 * s, IRON, 0.6 * s); });
    return o;
  }
  function balls(c, x, y, s) { var o = E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.3); [[-5, 0], [0, 0], [5, 0], [-2.5, -4.4], [2.5, -4.4], [0, -8.8]].forEach(function (b) { o += C(x + b[0] * s, y - 2.4 * s + b[1] * s, 2.6 * s, c.cel('#3a3a42'), 1 * s); }); return o; }
  // rum barrel lying on a cradle, a spigot in the head
  function rumKeg(c, x, y, s) {
    var o = E(x, y + 1, 14 * s, 2.6 * s, '#000', 0, 0.3) + limb('M' + pt([x - 9 * s, y]) + 'L' + pt([x - 6 * s, y - 6 * s]) + 'M' + pt([x + 9 * s, y]) + 'L' + pt([x + 6 * s, y - 6 * s]), PLANKD, 2 * s);
    var d = 'M' + pt([x - 12 * s, y - 4 * s]) + 'C' + pt([x - 6 * s, y - 6 * s]) + ' ' + pt([x + 6 * s, y - 6 * s]) + ' ' + pt([x + 12 * s, y - 4 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'C' + pt([x + 6 * s, y - 20 * s]) + ' ' + pt([x - 6 * s, y - 20 * s]) + ' ' + pt([x - 12 * s, y - 18 * s]) + 'Z';
    o += body(c, d, '#7a4a2a', L('M' + pt([x - 7 * s, y - 19 * s]) + 'L' + pt([x - 7 * s, y - 5 * s]) + 'M' + pt([x + 7 * s, y - 19 * s]) + 'L' + pt([x + 7 * s, y - 5 * s]), '#3a3434', 2 * s) + F(pd([[x - 14 * s, y - 9 * s], [x + 14 * s, y - 9 * s], [x + 14 * s, y - 2 * s], [x - 14 * s, y - 2 * s]], true), '#000', 0.25), 1.5 * s);
    o += E(x - 12 * s, y - 11 * s, 3 * s, 7 * s, c.cel('#8a5a32'), 1.2 * s) + R(x - 17 * s, y - 11 * s, 5 * s, 2.4 * s, c.cel(BRASS), 0.9 * s) + C(x - 17.6 * s, y - 8.4 * s, 0.9 * s, '#c87a2a', 0, 0.9);
    return o;
  }
  // tusk and bone totem: a hide-wrapped pole, two great tusks, hanging bones, a horned skull on top (x = foot, y = ground)
  function tuskTotem(c, x, y, s, paint) {
    paint = paint || '#b8281e'; var q = function (u, v) { return [x + u * s, y + v * s]; }, wood = '#6a4a2a', o = E(x, y + 2, 14 * s, 3 * s, '#000', 0, 0.28);
    o += body(c, pd([q(-4.6, 0), q(-3.6, -78), q(3.6, -78), q(4.6, 0)], true), wood, F(pd([q(1.6, -80), q(6, -80), q(6, 2), q(2, 2)], true), dk(wood, 0.3), 0.8) + R(x - 6 * s, y - 30 * s, 12 * s, 4 * s, paint, 0) + R(x - 6 * s, y - 22 * s, 12 * s, 2.4 * s, paint, 0), 1.7 * s);
    o += R(x - 5.6 * s, y - 46 * s, 11.2 * s, 10 * s, c.cel(HIDE), 1.2 * s) + L('M' + pt(q(-5, -43)) + 'L' + pt(q(5, -40)) + 'M' + pt(q(-5, -39)) + 'L' + pt(q(5, -36)), dk(HIDE, 0.4), 0.9 * s);
    // the tusks curve out and up from the binding
    [-1, 1].forEach(function (k) {
      var T = taper([[x + k * 3 * s, y - 42 * s], [x + k * 16 * s, y - 40 * s], [x + k * 25 * s, y - 52 * s], [x + k * 24 * s, y - 68 * s]], 7 * s, 1.2 * s, 5);
      o += body(c, T.d, '#efe4c8', F(ribbonBand(T, k > 0 ? 0 : 0.55, k > 0 ? 0.45 : 1), '#c8b890', 0.8) + L(bands(T, 4, 3), '#b8a880', 0.8 * s), 1.5 * s);
    });
    // crossbar with hanging bones
    o += limb('M' + pt(q(-14, -60)) + 'L' + pt(q(14, -62)), wood, 2 * s);
    [[-11, -60], [0, -61], [11, -62]].forEach(function (b, i) { o += L('M' + pt(q(b[0], b[1])) + 'L' + pt(q(b[0], b[1] + 8)), '#3a2a1a', 0.8 * s) + bone(x + b[0] * s, y + (b[1] + 12) * s, 7 * s, PI / 2 + (i - 1) * 0.15, 0.6 * s); });
    o += feathers(x - 4 * s, y - 50 * s, [paint, '#1a1009'], 0.5 * s, 0.4);
    // horned skull on top
    o += P(pd([q(-4, -84), q(-13, -98), q(-1, -88)], true), c.cel('#e8dcc0'), 1 * s) + P(pd([q(4, -84), q(13, -98), q(1, -88)], true), c.cel('#d8ccb0'), 1 * s) + skull(c, x, y - 82 * s, 1.15 * s) + F(pd([q(-5.6, -83), q(-2.4, -81), q(-5, -79)], true), paint, 0.8);
    return o;
  }
  // a cartoon heap of skulls (x = centre, y = ground)
  function skullPile(c, x, y, s) {
    var o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.28);
    [[-9, -4], [0, -3.4], [9, -4], [-4.5, -11], [4.5, -11], [0, -18]].forEach(function (k, i) { o += skull(c, x + k[0] * s, y + k[1] * s, (i < 3 ? 0.9 : 0.85) * s); });
    return o + bone(x - 14 * s, y - 1 * s, 10 * s, 0.2, 0.7 * s);
  }
  // conical hide tent with poles crossing at the top, a door flap and painted marks (x = centre, y = ground)
  function hideTent(c, x, y, s, col, paint) {
    col = col || HIDE; paint = paint || '#b8281e'; var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 30 * s, 4.4 * s, '#000', 0, 0.3);
    o += limb('M' + pt(q(-6, -44)) + 'L' + pt(q(4, -60)) + 'M' + pt(q(6, -44)) + 'L' + pt(q(-4, -60)) + 'M' + pt(q(0, -44)) + 'L' + pt(q(1, -62)), '#5a3a22', 2 * s);
    var d = pd([q(-28, 0), q(-4, -46), q(4, -46), q(28, 0)], true), st = '';
    for (var i = 1; i < 4; i++) st += 'M' + pt(lerp2(q(-4, -46), q(-28, 0), i / 4)) + 'L' + pt(lerp2(q(4, -46), q(28, 0), i / 4 + 0.04));
    st += 'M' + pt(q(-2, -46)) + 'L' + pt(q(-14, 0)) + 'M' + pt(q(2, -46)) + 'L' + pt(q(12, 0));
    o += body(c, d, col, L(st, dk(col, 0.35), 0.9 * s) + F(pd([q(2, -48), q(30, -48), q(30, 2), q(10, 2)], true), dk(col, 0.25), 0.75) + F(pd([q(-20, -14), q(-16, -22), q(-12, -14), q(-8, -22), q(-4, -14)], true), paint, 0.85), 1.8 * s);
    o += P(pd([q(-7, 0), q(0, -24), q(7, 0)], true), '#24160c', 1.2 * s) + P(pd([q(0, -24), q(7, 0), q(13, -2)], true), c.cel(lt(col, 0.1)), 1.1 * s);
    o += skull(c, x, y - 40 * s, 0.6 * s);
    return o;
  }
  // tall pole torch (taller than torch, for camps)
  function poleTorch(c, x, y, h, s) {
    var top = y - h; return E(x, y + 1, 5 * s, 1.6 * s, '#000', 0, 0.3) + C(x, top - 8 * s, 32 * s, glow(c, '#ffa040', 0.5)) + limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#5a3a22', 2.4 * s) +
      P(pd([[x - 5 * s, top], [x + 5 * s, top], [x + 3 * s, top + 7 * s], [x - 3 * s, top + 7 * s]], true), c.cel('#4a3a2a'), 1.1 * s) + L('M' + pt([x - 4 * s, top + 3 * s]) + 'L' + pt([x + 4 * s, top + 4 * s]), ROPE, 1.2 * s) + flame(c, x, top + 1 * s, 0.9 * s);
  }
  // a broken flight of ruined steps up to a pair of broken pillars (x = centre, y = foot)
  function ruinSteps(c, x, y, s, col, seed) {
    col = col || TST; var o = E(x, y + 3, 80 * s, 6 * s, '#000', 0, 0.25), by = y, r = rng(seed || 9);
    for (var i = 0; i < 5; i++) {
      var hw = (78 - i * 12) * s, th = 12 * s, brk = i === 4 ? [[0, 0], [hw * 0.4, 0], [hw * 0.55, 5 * s], [hw * 0.8, 2 * s], [hw * 1.3, 0], [hw * 1.5, 6 * s], [hw * 1.7, 3 * s], [2 * hw, 7 * s]] : (i === 2 ? [[0, 4 * s], [hw * 0.2, 0], [2 * hw, 0]] : null);
      o += stoneFace(c, x - hw, by, hw * 2, th, i % 2 ? col : lt(col, 0.06), 12, brk) + R(x - hw + 1, by - th + 1, hw * 2 - 2, 2.4, lt(col, 0.22), 0);
      if (i % 2 === 0) o += mossLip(x - hw + hw * r() * 0.6, x - hw + hw * (0.9 + r() * 0.8), by - th, (seed || 9) + i);
      by -= th;
    }
    o += tPillar(c, x - 50 * s, by + 12, 16 * s, 64 * s, col, (seed || 9) + 11, true) + tPillar(c, x + 36 * s, by + 12, 16 * s, 46 * s, col, (seed || 9) + 12, true);
    return o + rubble(c, x + 70 * s, y, 0.7 * s, col, (seed || 9) + 13);
  }
  // a thin moss lip along a ledge top, a few short tufts hanging over
  function mossLip(x0, x1, y, seed) {
    var r = rng(seed || 5), d = 'M' + pt([x0, y + 1]);
    for (var x = x0; x <= x1; x += 4) d += 'L' + pt([x, y - 1.6 - r() * 1.4]);
    d += 'L' + pt([x1, y + 1.4]);
    for (var x2 = x1; x2 >= x0; x2 -= 5) d += 'L' + pt([x2, y + 1.4 + (r() < 0.25 ? r() * 4 : r())]);
    return P(d + 'Z', MOSS, 1);
  }
  // muddy road: a ribbon from (x0, y0) narrowing up to (x1, y1) with ruts and puddles
  function mudRoad(c, pts, w0, w1, seed) {
    var T = taper(pts, w0, w1, 8), r = rng(seed || 5), o = body(c, T.d, MUD, F(ribbonBand(T, 0.62, 1), dk(MUD, 0.2), 0.8) + F(ribbonBand(T, 0, 0.12), lt(MUD, 0.15), 0.7) + L(along(T, 0.3) + along(T, 0.72), dk(MUD, 0.35), 1.6, 0.8), 1.6);
    [3, 9, 22, 34].forEach(function (i) { if (i >= T.s.length - 2) return; var p = lerp2(T.a[i], T.b[i], 0.28 + r() * 0.44), ww = Math.sqrt(Math.pow(T.a[i][0] - T.b[i][0], 2) + Math.pow(T.a[i][1] - T.b[i][1], 2)), wd = ww * 0.14 + 3; o += F(shag(p[0], p[1] + 0.6, wd + 2.4, wd * 0.34 + 1.4, 5, 0.12, i + 1), dk(MUD, 0.38), 0.9) + F(shag(p[0], p[1], wd, wd * 0.34, 5, 0.12, i + 1), c.lg([[0, '#6a6a5a'], [0.5, '#9aaaa0'], [1, '#c8d4c8']])) + L('M' + pt([p[0] - wd * 0.6, p[1] - wd * 0.06]) + 'L' + pt([p[0] + wd * 0.2, p[1] - wd * 0.1]), '#f0f6ee', 0.9, 0.8); });
    for (var k = 1; k < T.s.length - 2; k += 3) { var pp = lerp2(T.a[k], T.b[k], 0.15 + r() * 0.7); o += E(pp[0], pp[1], 1.6 + r() * 2, 0.8 + r(), dk(MUD, 0.3), 0, 0.6); }
    return o;
  }
  // iron-banded warehouse with a slate roof, a hoist beam and great double doors marked with the claw (x = left, y = ground)
  function warehouse(c, x, y, w, h, col) {
    col = col || '#6a6a6e'; var o = E(x + w / 2, y + 3, w * 0.56, 5, '#000', 0, 0.3), cx = x + w / 2;
    o += stoneFace(c, x, y, w, h, col, 10);
    var ap = [cx, y - h - w * 0.32];
    o += body(c, pd([[x - 10, y - h + 2], ap, [x + w + 10, y - h + 2]], true), '#3e4450', F(pd([ap, [x + w + 12, y - h + 4], [cx, y - h + 4]], true), '#000', 0.28) + L((function () { var d = ''; for (var k = 1; k < 7; k++) { var t = k / 7; d += 'M' + pt(lerp2([x - 10, y - h + 2], ap, t)) + 'L' + pt(lerp2([x + w + 10, y - h + 2], ap, t)); } return d; })(), '#2a2e38', 1, 0.8), 2);
    // gable loft door with the hoist beam, chain and hook
    o += C(cx - 34, y - h - 14, 10, c.cel(dk(col, 0.2)), 1.4) + claw(cx - 34, y - h - 14, 0.5, '#d8d0c0', OL) + R(cx - 9, y - h - 26, 18, 22, c.cel(PLANKD), 1.4) + L('M' + pt([cx, y - h - 26]) + 'L' + pt([cx, y - h - 4]), OL, 1) + limb('M' + pt([cx, y - h - 30]) + 'L' + pt([cx + 24, y - h - 30]), PLANKD, 2.4) + chain([cx + 22, y - h - 29], [cx + 22, y - h + 12], 0.8) + hook(cx + 22, y - h + 12, 0.9);
    // barred high windows
    [x + w * 0.16, x + w * 0.84].forEach(function (wx) { o += R(wx - 7, y - h * 0.82, 14, 12, '#141418', 1.2) + L('M' + pt([wx - 3, y - h * 0.82]) + 'l0,12 M' + pt([wx + 2, y - h * 0.82]) + 'l0,12', '#6a6a72', 1.4); });
    // the doors
    var dw = w * 0.34, dh = h * 0.72, dx = cx - dw / 2, dy = y - dh;
    o += P(arched(cx, y, dw + 10, dh + 6), c.cel(dk(col, 0.25)), 1.8);
    var leaf = function (x0, x1, cc) { var s = R(x0, dy, x1 - x0, dh, c.lg([[0, lt(cc, 0.1)], [0.5, cc], [1, dk(cc, 0.3)]], 0, 0, 1, 0), 1.6), pl = ''; for (var px = x0 + 5; px < x1; px += 5) pl += 'M' + pt([px, dy + 2]) + 'L' + pt([px, y - 1]); s += L(pl, dk(cc, 0.35), 0.8); [0.18, 0.5, 0.82].forEach(function (t) { var by = dy + dh * t; s += R(x0, by - 2.4, x1 - x0, 4.8, c.cel(IROND), 1.1) + rivetLine(x0 + 3, by, x1 - 3, by, 3, 0.9, '#9a98a0'); }); return s; };
    var clipId = c.clip(arched(cx, y, dw, dh));
    o += '<g clip-path="url(#' + clipId + ')">' + leaf(dx, cx, '#5a4632') + leaf(cx, dx + dw, '#4e3c2a') + '</g>' + P(arched(cx, y, dw, dh), 'none', 1.8);
    o += claw(cx - dw * 0.25, dy + dh * 0.32, 0.86, '#b8b0a0', OL) + claw(cx + dw * 0.25, dy + dh * 0.32, 0.86, '#b8b0a0', OL);
    // bar across the doors and a heavy padlock
    o += R(dx - 6, dy + dh * 0.6, dw + 12, 6, c.cel(IRON), 1.4) + rivet(dx - 2, dy + dh * 0.6 + 3, 1.2, '#9a98a0') + rivet(dx + dw + 2, dy + dh * 0.6 + 3, 1.2, '#9a98a0');
    o += L(ellD(cx, dy + dh * 0.6 + 4, 3.4, 4), OL, 3) + L(ellD(cx, dy + dh * 0.6 + 4, 3.4, 4), '#8a8890', 1.4) + R(cx - 5, dy + dh * 0.6 + 5, 10, 9, c.cel(BRASSD), 1.2) + C(cx, dy + dh * 0.6 + 9, 1.2, OL);
    return o;
  }
  // a wooden fighting-pit chest with gold bands on a stepped stone plinth (x = centre, y = ground)
  function chestPlinth(c, x, y, s) {
    var o = E(x, y + 2, 30 * s, 4 * s, '#000', 0, 0.3);
    o += stoneFace(c, x - 28 * s, y, 56 * s, 8 * s, '#b0a28a', 8) + stoneFace(c, x - 20 * s, y - 8 * s, 40 * s, 12 * s, '#a09078', 6);
    var cy = y - 20 * s, hw = 14 * s, ch = 12 * s, lid = 'M' + pt([x - hw - 1, cy - ch]) + 'Q' + pt([x - hw, cy - ch - 9 * s]) + ' ' + pt([x, cy - ch - 9 * s]) + 'Q' + pt([x + hw, cy - ch - 9 * s]) + ' ' + pt([x + hw + 1, cy - ch]) + 'Z';
    o += C(x, cy - ch, 34 * s, glow(c, '#ffd060', 0.4));
    o += body(c, pd([[x - hw, cy], [x - hw, cy - ch], [x + hw, cy - ch], [x + hw, cy]], true), '#8a4a2a', F(pd([[x + hw * 0.4, cy - ch - 2], [x + hw + 2, cy - ch - 2], [x + hw + 2, cy + 2], [x + hw * 0.4, cy + 2]], true), '#000', 0.25), 1.6 * s) + body(c, lid, '#9a5430', F(pd([[x + hw * 0.4, cy - ch - 10 * s], [x + hw + 2, cy - ch - 10 * s], [x + hw + 2, cy - ch], [x + hw * 0.4, cy - ch]], true), '#000', 0.25), 1.6 * s);
    [-0.66, 0.66].forEach(function (k) { o += R(x + k * hw - 2 * s, cy - ch - 8 * s, 4 * s, ch + 8 * s, c.cel(GOLD), 1 * s); });
    o += R(x - 3.4 * s, cy - ch - 2 * s, 6.8 * s, 7 * s, c.cel(GOLD), 1 * s) + C(x, cy - ch + 1.6 * s, 1 * s, OL) + glint(x - 8 * s, cy - ch - 8 * s, 2 * s) + glint(x + 10 * s, cy - ch - 2 * s, 1.6 * s);
    return o;
  }
  function glint(x, y, s, col) { return F('M' + pt([x, y - s * 2]) + 'Q' + pt([x + s * 0.25, y - s * 0.25]) + ' ' + pt([x + s * 2, y]) + 'Q' + pt([x + s * 0.25, y + s * 0.25]) + ' ' + pt([x, y + s * 2]) + 'Q' + pt([x - s * 0.25, y + s * 0.25]) + ' ' + pt([x - s * 2, y]) + 'Q' + pt([x - s * 0.25, y - s * 0.25]) + ' ' + pt([x, y - s * 2]) + 'Z', col || '#fffbe0', 0.95); }
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.5]) + 'Q' + pt([x - w / 2, top]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top]) + ' ' + pt([x + w / 2, top + w * 0.5]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }
  // arena gate: a stone arch in the pit wall with a raised portcullis (x = centre, y = floor)
  function arenaGate(c, x, y, w, h, col) {
    col = col || TST; var o = stoneFace(c, x - w / 2 - 12, y, w + 24, h + 14, col, 10) + P(arched(x, y, w + 8, h + 4), c.cel(lt(col, 0.1)), 1.8) + P(arched(x, y, w, h), '#1a1210', 1.6);
    var cl = c.clip(arched(x, y, w, h)), bars = '';
    for (var bx = x - w / 2 + 4; bx < x + w / 2; bx += 7) bars += 'M' + pt([bx, y - h - 4]) + 'L' + pt([bx, y - h * 0.42]);
    for (var by = y - h + 4; by < y - h * 0.42; by += 9) bars += 'M' + pt([x - w / 2, by]) + 'L' + pt([x + w / 2, by]);
    o += '<g clip-path="url(#' + cl + ')">' + R(x - w / 2, y - h * 0.5, w, h * 0.5, c.lg([[0, '#2a1a14'], [1, '#5a3a24']]), 0) + L(bars, OL, 3.4) + L(bars, '#5a5c62', 1.8) + P(pd([[x - w / 2, y - h * 0.42], [x + w / 2, y - h * 0.42], [x + w / 2, y - h * 0.42 + 3]], true), '#3a3c42', 0) + '</g>';
    for (var k = 0; k < 6; k++) o += P(pd([[x - w / 2 + 4 + k * (w - 8) / 5 - 2, y - h * 0.42], [x - w / 2 + 4 + k * (w - 8) / 5, y - h * 0.42 + 5], [x - w / 2 + 4 + k * (w - 8) / 5 + 2, y - h * 0.42]], true), '#8a8c92', 0.8);
    return o + P(pd([[x - 6, y - h - 6], [x + 6, y - h - 6], [x + 4, y - h + 4], [x - 4, y - h + 4]], true), c.cel(lt(col, 0.15)), 1.4);
  }
  // long hanging banner (x = centre, y = top)
  function banner(c, x, y, w, h, cloth, trim, mark) {
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h - w * 0.4], [x - w / 2, y + h]], true);
    return limb('M' + pt([x - w / 2 - 3, y]) + 'L' + pt([x + w / 2 + 3, y]), '#5a3a22', 1.8) + body(c, d, cloth, F(pd([[x + w * 0.15, y], [x + w / 2 + 1, y], [x + w / 2 + 1, y + h + 1], [x + w * 0.15, y + h + 1]], true), '#000', 0.22) + (trim ? L(pd([[x - w / 2 + 2, y + 2], [x - w / 2 + 2, y + h - 2]]) + pd([[x + w / 2 - 2, y + 2], [x + w / 2 - 2, y + h - 2]]), trim, 1.2) : ''), 1.4) + (mark ? mark(x, y + h * 0.42, w / 16) : '');
  }
  // crossed blades on a sun disc: the Bloodsand mark (original)
  function brawlMark(x, y, s) { var d = 'M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y + 6 * s]) + 'M' + pt([x + 5 * s, y - 6 * s]) + 'L' + pt([x - 5 * s, y + 6 * s]); return C(x, y, 5 * s, GOLD, 0.8 * s) + L(d, OL, 3 * s) + L(d, '#e8e4dc', 1.4 * s); }
  // stone seating tier: a band from x0 to x1 at y (top), h tall, gently curved, blocks and a lit top edge
  function tier(c, x0, x1, y, h, bow, col, seed) {
    var r = rng(seed || 3), d = 'M' + pt([x0, y]) + 'Q' + pt([(x0 + x1) / 2, y + bow]) + ' ' + pt([x1, y]) + 'L' + pt([x1, y + h]) + 'Q' + pt([(x0 + x1) / 2, y + h + bow]) + ' ' + pt([x0, y + h]) + 'Z', jn = '';
    for (var k = 0; k <= 24; k++) { var t = k / 24, p = quad([x0, y], [(x0 + x1) / 2, y + bow], [x1, y], t); if (k % 2 === (seed % 2)) jn += 'M' + pt(p) + 'l0,' + n(h); }
    var top = 'M' + pt([x0, y + 1.6]) + 'Q' + pt([(x0 + x1) / 2, y + bow + 1.6]) + ' ' + pt([x1, y + 1.6]);
    var riser = 'M' + pt([x0, y + h * 0.42]) + 'Q' + pt([(x0 + x1) / 2, y + h * 0.42 + bow]) + ' ' + pt([x1, y + h * 0.42]) + 'L' + pt([x1, y + h + 2]) + 'Q' + pt([(x0 + x1) / 2, y + h + 2 + bow]) + ' ' + pt([x0, y + h + 2]) + 'Z';
    return body(c, d, col, F(riser, dk(col, 0.3), 0.9) + L(jn, dk(col, 0.42), 0.9, 0.8) + L(top, lt(col, 0.3), 1.6, 0.8), 1.6);
  }

  // ============================================================
  //  SCENES (floor line at y 150-170; the lower middle stays open for the people standing in front)
  // ============================================================
  function ledgerFlag(x, y, s) { return claw(x, y, s * 1.1, '#d8d0c0'); }
  function gullFlag(x, y, s) { return gullMark(x, y, s * 0.62); }
  var SCENES = {
    rumhook_bay: function (c) {
      var o = svSky(c, '#78b4c4', '#e4dca4', '#f6c27a') + sun(c, 296, 54, 14, '#fff0b0') + cloud(120, 30, 0.8, 0.75, '#fff8e8') + cloud(236, 20, 0.55, 0.6, '#fff8e8');
      o += birds(3601, 7, 130, 290, 16, 56);
      // the far shore of the bay
      o += hills(c, 3602, 106, 22, '#7aa48a', 50) + farJungle(3603, 114, '#55895e', 15, 16, 30, 3) + haze(c, 110, 14, 0.35, '#f4eccc');
      o += sea(c, 112, 170, 3604);
      // a ship at the far pier
      o += ship(c, 196, 148, 0.56, { furl: true, flag: BUNT[0], hull: '#7a4e2c', trim: '#e8b840' });
      o += pier(c, 120, 286, 152, 1);
      // the lighthouse-crane on its rock, hoisting a net of cargo over the water
      o += rock(c, 50, 176, 100, 28, '#8a8070') + rock(c, 96, 176, 40, 14, '#7a7062');
      o += lightCrane(c, 46, 168, 0.84, 1);
      // stilt houses over the water, joined by rope bridges
      o += stiltHut(c, 236, 172, 34, 24, 32, '#b07a4a', '#3a8aa8', 3605, true);
      o += stiltHut(c, 300, 174, 40, 30, 42, '#9a6a3e', '#c84a2e', 3606, true);
      o += stiltHut(c, 367, 176, 36, 26, 26, '#a8744a', '#e0a830', 3607, false);
      o += ropeBridge(c, 274, 140, 295, 132, 5) + ropeBridge(c, 345, 132, 362, 150, 4);
      o += lantern(c, 242, 116, 0.7) + lantern(c, 336, 102, 0.7);
      // bunting from the crane to the houses
      o += bunting(62, 84, 300, 96, 18, 1) + bunting(330, 96, 404, 112, 8, 1, BUNT.slice().reverse());
      o += palm(c, 396, 150, 0.8, -22, PALM, 3608);
      // the boardwalk
      o += deck(c, 170, '#a07a4e', 3609, 200);
      o += R(-2, 168, 404, 5, c.lg([[0, '#2a1a10', 0.6], [1, '#2a1a10', 0]]));
      // lamp posts
      o += lampPost(c, 150, 180, 56, 1, 1) + lampPost(c, 300, 180, 56, 1, -1);
      // crates, barrels and sacks at the sides
      o += crate(c, 18, 196, 1.2) + crate(c, 42, 196, 1, '#9a6a38') + crate(c, 28, 177, 0.95, '#b07a42') + barrel(c, 66, 198, 1.05, '#7a5a3a') + barrel(c, 82, 192, 0.85);
      o += bagStack(c, 362, 200, 0.9, 2, GRAIN, WAX, false, 3610) + barrel(c, 394, 206, 1.1, '#7a4a2a') + crate(c, 336, 196, 0.9, '#a8743e') + ropeCoil(c, 140, 186, 0.9) + bollard(c, 158, 184, 0.9) + bollard(c, 250, 184, 0.9);
      o += fern(c, 4, 244, 1.1, LEAF, 3611) + fern(c, 404, 246, 1, LEAF, 3612);
      return o + motes(3613, 18, 0, 400, 20, 170, '#fff4d0') + vignette(c, '#fff4d8', '#1a1006');
    },
    saltpenny_wharf: function (c) {
      var o = svSky(c, '#86bccc', '#dce8d4', '#f4e0a8') + sun(c, 80, 44, 12, '#fffbe8') + cloud(200, 30, 0.9, 0.8, '#fbfcf8') + cloud(340, 50, 0.6, 0.65, '#fbfcf8') + birds(3621, 6, 120, 360, 16, 70);
      o += hills(c, 3622, 100, 16, '#8ab094', 60) + farJungle(3623, 104, '#6a9a74', 14, 10, 20, 2) + haze(c, 102, 10, 0.4, '#f4f4e0');
      o += sea(c, 102, 172, 3624);
      // the cargo ship moored at the end of the wharf
      o += ship(c, 262, 142, 0.8, { furl: true, flag: '#2e6a8a', hull: '#6a4428', trim: '#d8b040' });
      o += pier(c, 118, 352, 148, 1);
      // a cargo derrick on the wharf swinging a net of sacks over to the ship
      o += limb('M184,172 L178,70', PLANKD, 3.4) + limb('M190,172 L180,96', PLANKD, 2) + limb('M180,150 L246,64', '#7a5634', 3) + L('M178,72 L244,64', '#3a2a1e', 1) + C(246, 64, 2.6, c.cel(IRON), 1);
      o += L('M246,64 L246,92', OL, 1.8) + L('M246,64 L246,92', ROPE, 0.8) + L('M246,92 L234,100 M246,92 L258,100', ROPE, 1) + cargoNet(c, 246, 124, 0.95);
      o += R(176, 154, 16, 12, c.cel(PLANKD), 1.3) + C(184, 160, 4.6, c.cel(ROPE), 1.1);
      // the wharf deck; the shallows break over rocks on the right
      o += deck(c, 166, '#a88458', 3625, 120);
      var sh = 'M334,166 L404,166 L404,242 L376,242 Z';
      var shc = c.clip(sh);
      o += F(sh, c.lg([[0, '#3aa4b4'], [0.45, '#5abcbc'], [0.8, '#a8d4b8'], [1, '#dcc890']])) + '<g clip-path="url(#' + shc + ')">' + waves(3626, 172, 238, 40, '#f4fffc') + E(372, 204, 30, 5, '#e8d4a0', 0, 0.6) + '</g>';
      o += P(pd([[330, 166], [372, 242], [378, 242], [337, 166]], true), c.cel(PLANKD), 1.4) + limb('M346,190 L346,206 M362,218 L362,238', PLANKD, 3.2) + E(347, 206, 6, 1.8, '#f4fffc', 0, 0.85) + E(363, 238, 6, 1.8, '#f4fffc', 0, 0.85) + L('M338,168 L380,242', '#f4fffc', 2.2, 0.8);
      o += rock(c, 392, 206, 30, 18, '#7a7468') + rock(c, 376, 228, 22, 12, '#8a8476') + barnacles(3627, 8, 382, 402, 192, 204, 0.9) + E(392, 208, 20, 3, '#f4fffc', 0, 0.75) + E(376, 229, 14, 2.4, '#f4fffc', 0, 0.75);
      o += shell(c, 386, 236, 1) + starfish(c, 398, 226, 4.4);
      // grain stacked and sealed for loading
      o += bagStack(c, 46, 178, 1, 3, GRAIN, WAX, false, 3628) + bagStack(c, 116, 174, 0.9, 2, lt(GRAIN, 0.05), WAX, false, 3629);
      o += crate(c, 300, 178, 1.1) + crate(c, 322, 176, 0.9, '#9a6a38') + crate(c, 310, 160, 0.85, '#b07a42') + barrel(c, 280, 180, 0.9);
      o += bollard(c, 150, 178, 1) + bollard(c, 236, 178, 1) + ropeCoil(c, 214, 186, 1);
      o += bag(c, 12, 214, 1.1, GRAIN, WAX) + bag(c, 30, 236, 1.2, lt(GRAIN, 0.06), WAX);
      return o + motes(3630, 14, 0, 400, 20, 160, '#ffffff') + vignette(c, '#f0f8f8', '#14201c');
    },
    thunderhowl_rise: function (c) {
      var o = svSky(c, '#8ab4b4', '#d4dab4', '#ecdca4') + sun(c, 318, 46, 12, '#fff6d8') + cloud(240, 26, 0.8, 0.7, '#f8f8f0');
      // the misty valley behind: ridges fading into haze
      o += hills(c, 3641, 112, 46, '#a4c0b2', 64) + haze(c, 112, 26, 0.5, '#f2f2e4');
      o += hills(c, 3642, 132, 36, '#82a892', 56) + haze(c, 132, 22, 0.45, '#f2f2e4');
      o += farJungle(3643, 150, '#5e8e68', 14, 18, 34, 3, 150, 420) + haze(c, 150, 18, 0.45, '#f2f2e4');
      // the steep ridge climbing away to the left, jungle on its crest, and the floor of the pass in front
      o += farJungle(3645, 64, '#3e6c44', 6, 30, 56, 2, -20, 120) + palm(c, 40, 52, 0.5, 8, '#4e8a3a', 3655) + palm(c, 96, 84, 0.42, -6, '#4e8a3a', 3656);
      var gr = 'M-4,246 L-4,32 C40,36 84,58 124,88 C166,118 222,148 300,162 C340,168 370,166 404,164 L404,246 Z';
      o += body(c, gr, '#6a7a3e', F('M-4,32 C40,36 84,58 124,88 C166,118 222,148 300,162 C340,168 370,166 404,164 L404,174 C370,176 340,178 300,172 C222,158 166,128 124,98 C84,68 40,46 -4,42 Z', '#8a9a4a', 0.8) +
        F('M-4,150 C80,164 200,176 404,176 L404,246 L-4,246 Z', '#7a6a40', 0.9) + R(-4, 170, 410, 80, c.lg([[0, '#3a3420', 0], [1, '#3a3420', 0.6]])) + grass(3646, 50, 160, '#4e6a2e', 30, 0.6, 1.2, 1.1, 0, 290) + grass(3657, 176, 236, '#5a5a2e', 24, 0.8, 1.6, 1.2), 1.8);
      // the mud road coming up from below and winding up the ridge
      o += mudRoad(c, [[206, 252], [200, 222], [176, 200], [134, 180], [100, 152], [74, 118], [42, 84], [4, 48]], 128, 10, 3647);
      o += tufts(c, [[236, 226, 1.1], [268, 206, 0.9], [130, 214, 1], [88, 196, 0.9], [150, 160, 0.7], [118, 120, 0.6], [24, 112, 0.6], [56, 160, 0.8], [210, 152, 0.7]], '#5a8a36');
      // broken boulders
      o += mossRock(c, 336, 182, 58, 34, '#8a8a7a') + rock(c, 366, 186, 24, 12, '#7a7a6c') + L('M330,150 L338,164 L332,176', OL, 1.4) + rock(c, 104, 104, 30, 18, '#8a8a7a') + rock(c, 120, 106, 14, 8, '#7a7a6c') + rock(c, 262, 170, 20, 10, '#8a8a7a');
      o += mossRock(c, 32, 140, 34, 22, '#7e8070') + L('M28,120 L34,132 L30,140', OL, 1.2);
      // ferns, leaves and vines
      o += fern(c, 286, 172, 0.9, '#55943e', 3648) + fern(c, 16, 246, 1.3, LEAF, 3649) + fern(c, 392, 248, 1.25, '#3e7e34', 3650) + leafClump(c, 404, 212, 1, LEAF, true) + leafClump(c, 186, 128, 0.6, '#5a9a40');
      o += canopyTop(c, 3651, '#2a4a28', 18) + vines(c, 3652, 6, 0, 150, 30, 80) + vines(c, 3653, 3, 330, 400, 20, 50);
      return o + motes(3654, 14, 0, 400, 30, 170, '#fff8d8') + vignette(c, '#f4f8e8', '#141a0c');
    },
    blackgull_cove: function (c) {
      var o = svSky(c, '#6aa4bc', '#d4dcc4', '#f2d094') + sun(c, 214, 44, 12, '#fff6d8') + cloud(170, 24, 0.7, 0.6, '#fbfaf2') + birds(3661, 4, 150, 270, 16, 50);
      o += sea(c, 104, 166, 3662);
      // the beached ship, black sails with the white gull
      o += ship(c, 236, 160, 0.78, { sail: '#2a2630', mark: gullMark, flag: '#1e1a1e', flagMark: gullFlag, tilt: -7, hull: '#4e3420', trim: '#8a2a22', patch: true });
      // cliffs closing the cove on both sides
      var lc = 'M-4,-2 L54,-2 C62,24 84,44 88,74 C92,104 112,136 124,172 L-4,180 Z', rc = 'M404,-2 L340,-2 C334,30 316,50 314,82 C312,112 296,140 286,170 L404,178 Z';
      var strata = function (x0, x1, seed) { var r = rng(seed), d = ''; for (var j = 0; j < 8; j++) { var yy = 20 + j * 20 + r() * 6; d += 'M' + pt([x0, yy]) + 'Q' + pt([(x0 + x1) / 2, yy + (r() - 0.5) * 10]) + ' ' + pt([x1, yy + 4]); } return d; };
      o += body(c, lc, '#9a7e66', L(strata(-4, 120, 3663), '#6a5444', 1.1, 0.8) + F('M40,-4 C50,30 70,60 74,90 C80,120 96,150 104,180 L130,180 L130,-4 Z', '#5a4636', 0.55), 2);
      o += body(c, rc, '#9a7e66', L(strata(290, 404, 3664), '#6a5444', 1.1, 0.8) + F('M404,-4 L360,-4 C352,30 340,60 336,90 C332,120 320,150 310,178 L404,178 Z', '#5a4636', 0.4), 2);
      o += fern(c, 70, 40, 0.7, LEAF, 3667) + fern(c, 330, 46, 0.6, LEAF, 3668) + leafClump(c, 20, 18, 0.7, '#4a8a3a') + leafClump(c, 384, 22, 0.66, '#4a8a3a', true);
      o += vines(c, 3669, 3, 40, 90, 30, 70) + vines(c, 3670, 3, 316, 360, 30, 70);
      // the beach
      var bch = 'M-4,182 C60,172 140,166 210,166 C280,166 340,170 404,178 L404,242 L-4,242 Z';
      o += body(c, bch, SAND, R(-4, 160, 408, 86, c.lg([[0, '#f0e0b0', 0.4], [0.4, SAND, 0], [1, '#6a5434', 0.65]])) + pebbles(3671, 180, 236, '#a8966e', 18), 1.4);
      o += L('M-4,182 C60,172 140,166 210,166 C280,166 340,170 404,178', '#f4fffc', 2.4, 0.8);
      o += F('M150,170 C190,160 270,158 310,168 Z', '#c8ae76', 0.9);
      // the camp: tents, rum, cannons, a fire and the gull flag
      o += tent(c, 40, 194, 0.84, '#c8b890', '#8a2a22') + tent(c, 336, 190, 0.72, '#b8a888', '#2a2630');
      o += cannon(c, 132, 190, 1, -1) + balls(c, 108, 196, 0.9) + cannon(c, 304, 196, 0.95, 1) + balls(c, 326, 202, 0.8);
      o += rumKeg(c, 82, 204, 1) + barrel(c, 384, 210, 1.1, '#6a3a22') + barrel(c, 398, 202, 0.9, '#7a4a2a') + barrel(c, 370, 214, 0.85, '#6a3a22') + crate(c, 18, 212, 1, '#8a6038');
      o += flag(c, 200, 186, 62, 1, '#1e1a1e', '#f4f0e6', gullFlag, true) + campfire(c, 240, 194, 0.6);
      o += driftwood(c, 140, 228, 46, -0.06, 0.8) + shell(c, 250, 230, 1) + starfish(c, 300, 236, 4.6);
      return o + motes(3672, 16, 0, 400, 20, 180, '#fff8e0') + vignette(c, '#fff4e0', '#140e06');
    },
    bonegrin_warcamp: function (c) {
      var o = svSky(c, '#7aa498', '#ccd094', '#eab87a') + sun(c, 96, 44, 11, '#fff0c0');
      o += farJungle(3681, 104, '#6a9474', 16, 26, 48, 4) + haze(c, 100, 22, 0.35, '#eee8c0');
      o += farJungle(3682, 132, '#3e6c44', 13, 30, 58, 3) + shafts(c, 3683, 5, 0.22, '#fff0c0', 170);
      o += floor(c, 154, '#8a6a42', '#3a2a18', 3684);
      // ruined stone steps at the head of the camp
      o += ruinSteps(c, 200, 158, 0.9, TST, 3685);
      // spiked palisade either side
      o += palisade(c, -6, 136, 158, 46, '#7a5634', 3686, true) + palisade(c, 266, 410, 158, 46, '#7a5634', 3687, true);
      // hide tents, totems, skulls, torches
      o += hideTent(c, 56, 178, 0.92, HIDE) + hideTent(c, 350, 176, 0.86, '#9a6a44', '#2a2430');
      o += tuskTotem(c, 122, 172, 0.82) + tuskTotem(c, 280, 172, 0.82) + skullPile(c, 102, 176, 0.8) + skullPile(c, 300, 176, 0.75);
      o += poleTorch(c, 160, 170, 46, 1) + poleTorch(c, 240, 170, 46, 1);
      o += bone(166, 210, 14, 0.4, 0.8) + bone(250, 222, 12, -0.6, 0.8) + skull(c, 222, 202, 0.8) + pebbles(3688, 180, 236, '#5a4228', 16);
      o += canopyTop(c, 3689, '#28482a', 18) + vines(c, 3690, 8, 0, 400, 20, 52);
      o += fern(c, 8, 248, 1.2, LEAF, 3691) + leafClump(c, 404, 236, 1, '#3e7a34', true);
      return o + motes(3692, 14, 0, 400, 30, 160, '#ffd090') + vignette(c, '#fff0d0', '#120a04');
    },
    bonded_yard: function (c) {
      var o = sky(c, '#3a465e', '#7c8a9e', '#c2c2b8') + cloud(90, 34, 1, 0.35, '#c8ccd4') + cloud(300, 22, 0.8, 0.3, '#c8ccd4') + C(352, 40, 9, '#e6eaee', 0, 0.85) + C(352, 40, 26, glow(c, '#e6eaee', 0.3));
      // the far shore and the cold water of the bay
      o += hills(c, 3701, 112, 14, '#4e5a62', 60) + R(-2, 112, 404, 50, c.lg([[0, '#5a7482'], [1, '#2e3e4a']])) + waves(3702, 116, 158, 20, '#a8bcc4');
      // a moored ship's mast and the pier beyond the yard
      o += mast(c, 262, 140, 96, 0.9, '#2a2430') + pier(c, 240, 404, 150, 1);
      o += watchTower(c, 376, 170, 0.7, '#4a4e58', '#2a2430', ledgerFlag);
      // the bonded warehouse
      o += warehouse(c, 26, 160, 208, 76, '#6e6e74');
      o += lantern(c, 66, 104, 0.8) + lantern(c, 196, 104, 0.8);
      // the yard: cold flagstones
      o += flagFloor(c, 160, 150, '#7a7a78', 3703) + R(-2, 158, 404, 5, c.lg([[0, '#000', 0.4], [1, '#000', 0]]));
      // sealed grain, stacked neatly, and the strongboxes
      o += bagStack(c, 50, 182, 0.9, 3, '#c8ae7a', '#3a2430', true, 3704) + bagStack(c, 110, 176, 0.8, 2, '#c4aa76', '#3a2430', true, 3705);
      o += strongbox(c, 182, 182, 30, 22) + strongbox(c, 214, 184, 28, 20, '#56545c') + strongbox(c, 198, 164, 26, 18, '#625f68');
      // the tally desk under its lamp, and chains between the posts on the waterfront
      o += bollard(c, 246, 164, 0.9) + bollard(c, 318, 164, 0.9) + bollard(c, 398, 164, 0.9) + chain([246, 154], [282, 160], 0.8) + chain([282, 160], [318, 154], 0.8) + chain([318, 154], [358, 160], 0.8) + chain([358, 160], [398, 154], 0.8);
      o += desk(c, 286, 190, 0.8) + ledger(c, 278, 166, 0.7, LEDG, true) + ledger(c, 302, 166, 0.6, LEDR) + lampPost(c, 314, 194, 66, 1, -1);
      o += R(0, 0, 400, 240, c.rg([[0, '#ffd080', 0], [0.7, '#0a0e18', 0.12], [1, '#0a0e18', 0.5]]));
      return o + vignette(c, '#c8d0e0', '#0a0c14');
    },
    bloodsand_arena: function (c) {
      var o = svSky(c, '#7ab0a8', '#d8d29c', '#f0bc7c') + sun(c, 330, 26, 10, '#fff4d0');
      o += farJungle(3721, 38, '#3e6c44', 18, 22, 40, 4) + palm(c, 28, 76, 0.66, 10, '#4e8a3a', 3730) + palm(c, 376, 72, 0.62, -12, '#4e8a3a', 3731) + palm(c, 210, 70, 0.5, 6, '#3e7a34', 3732);
      // tiered stone seats curving round the pit
      var cols = ['#a89a84', '#9a8c76', '#a89a84', '#968872', '#a29480'];
      for (var i = 0; i < 5; i++) o += tier(c, -10, 410, 26 + i * 20, 21, 18 + i * 4, cols[i], 3722 + i);
      o += banner(c, 64, 34, 18, 44, '#a8241a', GOLD, brawlMark) + banner(c, 146, 38, 16, 40, '#2a2430', GOLD) + banner(c, 254, 38, 16, 40, '#2a2430', GOLD) + banner(c, 336, 34, 18, 44, '#a8241a', GOLD, brawlMark);
      // the pit wall, with a gate at each end, torches and the prize on its plinth
      o += stoneFace(c, -4, 158, 408, 34, '#8a7a66', 11) + R(-4, 124, 408, 4, c.cel('#b0a28c'), 1.2);
      o += arenaGate(c, 32, 158, 40, 52, '#8c7e6a') + arenaGate(c, 368, 158, 40, 52, '#8c7e6a');
      o += torch(c, 96, 140, 1.1) + torch(c, 304, 140, 1.1) + torch(c, 154, 142, 0.9) + torch(c, 246, 142, 0.9);
      o += chestPlinth(c, 200, 160, 1.25);
      // red sand
      var sd = 'M-4,160 C90,156 170,162 250,158 C310,155 360,160 404,157 L404,242 L-4,242 Z';
      o += body(c, sd, RSAND, R(-4, 152, 408, 92, c.lg([[0, lt(RSAND, 0.18), 0.5], [1, '#5a2418', 0.85]])), 1.6) + waves(3727, 168, 236, 22, '#e08a6a') + pebbles(3728, 170, 236, '#8a3a28', 16);
      o += E(200, 200, 120, 26, '#5a2418', 0, 0.18) + F('M-4,160 C60,166 120,168 200,166 C280,164 340,168 404,162 L404,172 C340,176 280,172 200,174 C120,176 60,174 -4,170 Z', '#6a2a1c', 0.35);
      o += vines(c, 3733, 5, 0, 400, 20, 46, '#3e6a2a');
      return o + motes(3729, 12, 0, 400, 20, 150, '#fff0c0') + vignette(c, '#fff0d8', '#1a0806');
    }
  };

  // ============================================================
  //  MOBS (facing left, like every other mob sprite)
  // ============================================================
  var MOBS = {
    surf_crawler: function (c) {
      var sh = '#c8844a';
      return crab(c, {
        shell: sh, leg: '#b06a38', dome: 4, shadowR: 58, legW: 5.8,
        nearK: 1.16, nearGap: 7, nearClaw: [40, 92], farK: 0.96, farGap: 6, farClaw: [30, 42],
        inner: function (c, top) {
          var r = rng(3741), o = '';
          for (var i = 0; i < 16; i++) o += E(36 + r() * 66, top + 8 + r() * 30, 1.6 + r() * 2, 1 + r(), r() < 0.5 ? '#e8b878' : '#8a5428', 0, 0.75);
          return o + F('M30,86 C50,96 90,98 104,86 L104,92 C90,100 50,100 30,92 Z', '#e8c890', 0.6);
        },
        shellTop: function (c, top) { return barnacles(3742, 18, 52, 100, top + 3, top + 26, 1.25) + barnacles(3743, 5, 36, 52, top + 16, top + 28, 0.9) + L('M86,' + (top + 2) + ' q4,6 0,12 q-4,6 1,12', OL, 3) + L('M86,' + (top + 2) + ' q4,6 0,12 q-4,6 1,12', '#5e7a34', 1.6); },
        nearOpt: { palm: function (q) { var p = q(-6, -6), p2 = q(-1, -8); return C(p[0], p[1], 2, BARN, 0.8) + C(p[0], p[1] - 0.2, 0.8, '#4a4a44') + C(p2[0], p2[1], 1.5, BARN, 0.7) + C(p2[0], p2[1], 0.6, '#4a4a44'); }, tip: '#5a2a14' }
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#c8844a'), 2.5); }
  function phScene(c) { return svSky(c) + ground(c, 150, SAND, '#a88a50'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#9a7048"/></svg>'; }
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
