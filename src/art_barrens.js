/* art_barrens.js — The Barrens zone art for Azeroth Solo (Horde savanna, levels 10-15: the Crossroads, Far Watch Post,
 * the Forgotten Pools, the Stagnant Oasis, the Razormane grounds, Thorn Hill).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Barrens keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and the biped/quilboar rig are shared copies of art_mulgore.js / art_durotar.js so the zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix br<counter>_).
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
  var OL = '#1a1009';
  var SEQ = 0;

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
  function Ctx() { this.p = 'br' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  // point on a cubic bezier + unit normal
  function bez(p0, p1, p2, p3, t) {
    var u = 1 - t, x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    var dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]), dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    var l = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x, y, -dy / l, dx / l];
  }

  // ============================================================
  //  SCENE PIECES (shared house style)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function sun(c, x, y, r, col) { return C(x, y, r * 4, glow(c, col || '#fff8dc', 0.5)) + C(x, y, r, lt(col || '#fff8dc', 0.5)); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#fff8e0', 0.16], [0.5, '#fff4e0', 0], [1, bot || '#2a1a08', 0.2]])); }
  function cloud(x, y, s, op) {
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 8 * s]) + ' ' + pt([x - 20 * s, y - 13 * s]) + ' ' + pt([x - 11 * s, y - 8 * s]) + 'C' + pt([x - 8 * s, y - 19 * s]) + ' ' + pt([x + 10 * s, y - 20 * s]) + ' ' + pt([x + 13 * s, y - 9 * s]) +
      'C' + pt([x + 22 * s, y - 13 * s]) + ' ' + pt([x + 33 * s, y - 7 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    return F(d, '#ffffff', op || 0.92) + F('M' + pt([x - 30 * s, y]) + 'L' + pt([x + 30 * s, y]) + 'C' + pt([x + 20 * s, y - 4 * s]) + ' ' + pt([x - 20 * s, y - 4 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z', '#cfe2ee', 0.9);
  }
  // rolling hill band (smooth), filled to the bottom
  function hills(c, seed, base, amp, fill, step, sw) {
    var r = rng(seed), p = [], x = -40;
    while (x < 440 + step) { p.push([x, base - amp * (0.25 + 0.75 * r())]); x += step * (0.7 + 0.6 * r()); }
    var d = 'M' + pt([-40, 250]) + 'L' + pt(p[0]);
    for (var i = 0; i < p.length - 1; i++) d += 'Q' + pt(p[i]) + ' ' + pt([(p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2]);
    d += 'L' + pt(p[p.length - 1]) + 'L' + pt([p[p.length - 1][0], 250]) + 'Z';
    return sw ? P(d, fill, sw) : F(d, fill);
  }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  // grass blades scattered, one path per call
  function grass(seed, y0, y1, col, cnt, s0, s1, w, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), s = s0 + (s1 - s0) * t, x = x0 + r() * (x1 - x0);
      d += 'M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-4 * s) + ' ' + n(-4 * s) + ',' + n(-7 * s) + 'M' + pt([x, y]) + 'q' + n(0.5 * s) + ',' + n(-5 * s) + ' ' + n(1 * s) + ',' + n(-9 * s) + 'M' + pt([x, y]) + 'q' + n(2 * s) + ',' + n(-3 * s) + ' ' + n(5 * s) + ',' + n(-6 * s);
    }
    return L(d, col, w || 1.2);
  }
  // outlined foreground tuft
  function tuft(c, x, y, s, col) {
    col = col || '#b4b04a';
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
  function pebbles(seed, y0, y1, col, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < (cnt || 14); i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function flowers(seed, y0, y1, cols, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), sz = 0.8 + (y - y0) / (y1 - y0 || 1) * 1.4; s += C(r() * 400, y, sz, cols[i % cols.length]); }
    return s;
  }
  function road(c, y, w1, w2, col, op) { return F('M' + (200 - w1) + ',' + y + ' C' + (200 - w1) + ',' + (y + 30) + ' ' + (200 - w2) + ',210 ' + (200 - w2) + ',242 L' + (200 + w2) + ',242 C' + (200 + w2) + ',210 ' + (200 + w1) + ',' + (y + 30) + ' ' + (200 + w1) + ',' + y + ' Z', col, op == null ? 0.5 : op); }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.5, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x - w * 0.05, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.5, y - h * 0.5]) + ' ' + pt([x + w / 2, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.08, y - h - 2]) + 'C' + pt([x + w * 0.36, y - h * 0.8]) + ' ' + pt([x + w * 0.4, y - h * 0.3]) + ' ' + pt([x + w * 0.3, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.85) +
      E(x - w * 0.2, y - h * 0.7, w * 0.12, h * 0.1, lt(col, 0.25), 0, 0.6), 1.8);
  }
  // distant flat-topped mesa (no outline), grassy cap
  function farMesa(x, base, w, h, col, side, cap) {
    var t = base - h;
    var d = pd([[x, base], [x + w * 0.05, t + h * 0.35], [x + w * 0.09, t + 3], [x + w * 0.13, t], [x + w * 0.87, t], [x + w * 0.91, t + 3], [x + w * 0.95, t + h * 0.35], [x + w, base]], true);
    return F(d, col) + F(pd([[x + w * 0.66, t], [x + w * 0.87, t], [x + w * 0.91, t + 3], [x + w * 0.95, t + h * 0.35], [x + w, base], [x + w * 0.72, base]], true), side, 0.9) +
      L('M' + pt([x + w * 0.07, t + h * 0.4]) + 'L' + pt([x + w * 0.94, t + h * 0.42]), side, 1.3, 0.5) +
      (cap ? F('M' + pt([x + w * 0.1, t + 3]) + 'L' + pt([x + w * 0.13, t - 1.5]) + 'L' + pt([x + w * 0.87, t - 1.5]) + 'L' + pt([x + w * 0.9, t + 3]) + 'L' + pt([x + w * 0.72, t + 5]) + 'L' + pt([x + w * 0.5, t + 2.5]) + 'L' + pt([x + w * 0.32, t + 6]) + 'Z', cap) : '');
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 14 * s, 50 * s, glow(c, '#ffb040', 0.45)) + E(x, y + 2 * s, 20 * s, 5 * s, '#000', 0, 0.25);
    for (var i = 0; i < 7; i++) { var a = Math.PI * i / 6; o += rock(c, x - 18 * s * Math.cos(a), y + 2 * s + 2.5 * s * Math.sin(a), 7 * s, 5 * s, '#8a8070'); }
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 12 * s, y - 6 * s]), '#6a4424', 3.4 * s) + limb('M' + pt([x + 14 * s, y]) + 'L' + pt([x - 10 * s, y - 7 * s]), '#7a5030', 3.4 * s);
    return o + flame(c, x - 6 * s, y - 2 * s, 0.9 * s) + flame(c, x + 6 * s, y - 2 * s, 0.85 * s) + flame(c, x, y, 1.35 * s);
  }
  // giant thorny bramble vine along a cubic curve
  function bramble(c, p0, p1, p2, p3, w, col, thorn, seed) {
    col = col || '#6a5a36'; thorn = thorn || '#e0d0a8';
    var d = 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3), r = rng(seed || 7), th = '', o = '';
    for (var i = 1; i < 14; i++) {
      var q = bez(p0, p1, p2, p3, i / 14 + (r() - 0.5) * 0.03), sg = i % 2 ? 1 : -1, len = w * (0.9 + r() * 0.6);
      var bx = q[0] + q[2] * sg * w * 0.4, by = q[1] + q[3] * sg * w * 0.4, tx = q[0] + q[2] * sg * (w * 0.4 + len), ty = q[1] + q[3] * sg * (w * 0.4 + len);
      var ax = -q[3] * w * 0.3, ay = q[2] * w * 0.3;
      th += P(pd([[bx + ax, by + ay], [tx - ax * 0.4, ty - ay * 0.4], [bx - ax, by - ay]], true), c.cel(thorn), 1.3);
    }
    o += L(d, OL, w + 4) + th + L(d, col, w) + L(d, lt(col, 0.25), w * 0.28, 0.7);
    return o;
  }
  function brambleClump(c, x, y, s, seed, col) {
    var o = '';
    o += bramble(c, [x - 30 * s, y], [x - 34 * s, y - 40 * s], [x + 6 * s, y - 50 * s], [x + 16 * s, y - 20 * s], 6 * s, col, null, seed);
    o += bramble(c, [x + 30 * s, y], [x + 36 * s, y - 30 * s], [x - 4 * s, y - 44 * s], [x - 14 * s, y - 16 * s], 5 * s, dk(col || '#6a5a36', 0.1), null, seed + 3);
    o += bramble(c, [x - 10 * s, y + 2], [x - 6 * s, y - 20 * s], [x + 14 * s, y - 26 * s], [x + 22 * s, y - 8 * s], 4 * s, col, null, seed + 5);
    return o;
  }
  // quilboar hut: hide dome with thorns and a bone-framed door
  function quilHut(c, x, y, s, hide) {
    hide = hide || '#a8845a';
    var o = E(x, y + 1, 34 * s, 5 * s, '#000', 0, 0.22), r = rng(Math.round(x * 3 + y));
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 32 * s, y - 24 * s]) + ' ' + pt([x - 16 * s, y - 38 * s]) + ' ' + pt([x, y - 38 * s]) + 'C' + pt([x + 16 * s, y - 38 * s]) + ' ' + pt([x + 32 * s, y - 24 * s]) + ' ' + pt([x + 30 * s, y]) + 'Z';
    // thorns poking out
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (1.08 + 0.84 * i / 8), bx = x + Math.cos(a) * 28 * s, by = y - 4 * s + Math.sin(a) * 34 * s, len = (10 + r() * 8) * s;
      o += P(pd([[bx - Math.sin(a) * 3 * s, by + Math.cos(a) * 3 * s], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + Math.sin(a) * 3 * s, by - Math.cos(a) * 3 * s]], true), c.cel('#e0d0a8'), 1.2 * s);
    }
    var patches = L('M' + pt([x - 20 * s, y - 28 * s]) + 'Q' + pt([x - 10 * s, y - 18 * s]) + ' ' + pt([x - 22 * s, y - 4 * s]) + 'M' + pt([x + 4 * s, y - 38 * s]) + 'Q' + pt([x + 8 * s, y - 22 * s]) + ' ' + pt([x + 20 * s, y - 14 * s]) + 'M' + pt([x - 30 * s, y - 14 * s]) + 'Q' + pt([x, y - 10 * s]) + ' ' + pt([x + 30 * s, y - 16 * s]), dk(hide, 0.35), 1.2 * s) +
      E(x - 8 * s, y - 26 * s, 8 * s, 5 * s, dk(hide, 0.12), 0, 0.8) + E(x + 14 * s, y - 8 * s, 8 * s, 5 * s, lt(hide, 0.12), 0, 0.8) +
      F('M' + pt([x + 8 * s, y - 40 * s]) + 'C' + pt([x + 24 * s, y - 34 * s]) + ' ' + pt([x + 34 * s, y - 20 * s]) + ' ' + pt([x + 32 * s, y + 2]) + 'L' + pt([x + 16 * s, y + 2]) + 'C' + pt([x + 20 * s, y - 16 * s]) + ' ' + pt([x + 16 * s, y - 30 * s]) + ' ' + pt([x + 8 * s, y - 40 * s]) + 'Z', dk(hide, 0.25), 0.8);
    o += body(c, d, hide, patches, 2 * s);
    o += P('M' + pt([x - 9 * s, y + 1]) + 'L' + pt([x - 9 * s, y - 12 * s]) + 'Q' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 5 * s, y - 12 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'Z', '#2a1a10', 1.6 * s);
    o += L('M' + pt([x - 11 * s, y + 1]) + 'Q' + pt([x - 12 * s, y - 16 * s]) + ' ' + pt([x - 2 * s, y - 22 * s]) + 'Q' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 7 * s, y + 1]), OL, 4.4 * s) + L('M' + pt([x - 11 * s, y + 1]) + 'Q' + pt([x - 12 * s, y - 16 * s]) + ' ' + pt([x - 2 * s, y - 22 * s]) + 'Q' + pt([x + 8 * s, y - 16 * s]) + ' ' + pt([x + 7 * s, y + 1]), '#ece2c8', 2.2 * s);
    return o;
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
    col = col || '#8a4a2a';
    var d = 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z';
    return E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.25) + body(c, d, col, L('M' + pt([x - 9 * s, y - 5 * s]) + 'L' + pt([x + 9 * s, y - 5 * s]) + 'M' + pt([x - 9 * s, y - 13 * s]) + 'L' + pt([x + 9 * s, y - 13 * s]), '#4a4440', 2 * s) + F('M' + pt([x + 2 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y - 20 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', dk(col, 0.3), 0.7), 1.6 * s) +
      E(x, y - 18 * s, 7 * s, 1.8 * s, dk(col, 0.2), 1.2 * s);
  }
  function crate(c, x, y, s) {
    var d = 'M' + pt([x - 10 * s, y]) + 'L' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'Z';
    return body(c, d, '#a8743e', L('M' + pt([x - 10 * s, y - 16 * s]) + 'L' + pt([x + 10 * s, y]) + 'M' + pt([x - 10 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, y - 8 * s]), '#6a4424', 1.4 * s) + F('M' + pt([x + 4 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y - 18 * s]) + 'L' + pt([x + 12 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', '#6a4424', 0.5), 1.6 * s);
  }
  // ---- Horde pieces (Durotar style) ----
  function brush(c, x, y, s, col) {
    col = col || '#6e4a26';
    var r = rng(Math.round(x * 7 + y * 13)), br = '', tw = '';
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI * (0.12 + 0.76 * i / 6) + (r() - 0.5) * 0.2, len = (12 + r() * 9) * s;
      var ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      br += 'M' + pt([x, y]) + 'Q' + pt([x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * len * 0.5]) + ' ' + pt([ex, ey]);
      tw += 'M' + pt([x + Math.cos(a) * len * 0.6, y + Math.sin(a) * len * 0.6]) + 'l' + n((r() - 0.3) * 6 * s) + ',' + n(-3 * s);
    }
    return E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.2) + L(br, OL, 4 * s) + L(tw, OL, 3 * s) + L(br, col, 1.8 * s) + L(tw, lt(col, 0.1), 1.3 * s);
  }
  function orcHut(c, x, y, s, hide) {
    hide = hide || '#c89a62';
    var o = '';
    o += E(x, y + 1, 36 * s, 5 * s, '#000', 0, 0.22);
    // rear spikes
    o += P('M' + pt([x + 18 * s, y - 34 * s]) + 'Q' + pt([x + 30 * s, y - 50 * s]) + ' ' + pt([x + 40 * s, y - 52 * s]) + 'Q' + pt([x + 30 * s, y - 44 * s]) + ' ' + pt([x + 24 * s, y - 30 * s]) + 'Z', '#e8dcc0', 1.6 * s);
    o += P('M' + pt([x - 18 * s, y - 34 * s]) + 'Q' + pt([x - 30 * s, y - 50 * s]) + ' ' + pt([x - 40 * s, y - 52 * s]) + 'Q' + pt([x - 30 * s, y - 44 * s]) + ' ' + pt([x - 24 * s, y - 30 * s]) + 'Z', '#e8dcc0', 1.6 * s);
    // wall
    var wall = 'M' + pt([x - 32 * s, y]) + 'L' + pt([x - 30 * s, y - 16 * s]) + 'L' + pt([x + 30 * s, y - 16 * s]) + 'L' + pt([x + 32 * s, y]) + 'Z';
    var logs = '';
    for (var i = -3; i <= 3; i++) logs += L('M' + pt([x + i * 9 * s, y - 16 * s]) + 'L' + pt([x + i * 9.4 * s, y]), dk('#8a5a32', 0.3), 1.2 * s);
    o += body(c, wall, '#8a5a32', logs + F('M' + pt([x + 12 * s, y - 16 * s]) + 'L' + pt([x + 34 * s, y - 16 * s]) + 'L' + pt([x + 34 * s, y]) + 'L' + pt([x + 14 * s, y]) + 'Z', dk('#8a5a32', 0.3), 0.8), 1.8 * s);
    // roof
    var roof = 'M' + pt([x - 38 * s, y - 12 * s]) + 'C' + pt([x - 34 * s, y - 38 * s]) + ' ' + pt([x - 12 * s, y - 48 * s]) + ' ' + pt([x, y - 48 * s]) + 'C' + pt([x + 12 * s, y - 48 * s]) + ' ' + pt([x + 34 * s, y - 38 * s]) + ' ' + pt([x + 38 * s, y - 12 * s]) +
      'L' + pt([x + 26 * s, y - 16 * s]) + 'L' + pt([x + 14 * s, y - 11 * s]) + 'L' + pt([x, y - 16 * s]) + 'L' + pt([x - 14 * s, y - 11 * s]) + 'L' + pt([x - 26 * s, y - 16 * s]) + 'Z';
    var seams = L('M' + pt([x - 20 * s, y - 42 * s]) + 'Q' + pt([x - 22 * s, y - 28 * s]) + ' ' + pt([x - 26 * s, y - 16 * s]) + 'M' + pt([x + 4 * s, y - 48 * s]) + 'Q' + pt([x + 6 * s, y - 30 * s]) + ' ' + pt([x + 14 * s, y - 11 * s]), dk(hide, 0.3), 1.3 * s) +
      F('M' + pt([x + 10 * s, y - 49 * s]) + 'C' + pt([x + 26 * s, y - 44 * s]) + ' ' + pt([x + 36 * s, y - 34 * s]) + ' ' + pt([x + 40 * s, y - 12 * s]) + 'L' + pt([x + 20 * s, y - 12 * s]) + 'C' + pt([x + 20 * s, y - 30 * s]) + ' ' + pt([x + 16 * s, y - 42 * s]) + ' ' + pt([x + 10 * s, y - 49 * s]) + 'Z', dk(hide, 0.22), 0.85) +
      E(x - 16 * s, y - 36 * s, 6 * s, 4 * s, lt(hide, 0.2), 0, 0.5);
    o += body(c, roof, hide, seams, 2 * s);
    // front spike pair + top pole
    o += L('M' + pt([x, y - 48 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]), OL, 4.5 * s) + L('M' + pt([x, y - 48 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]), '#6a4424', 2.2 * s);
    o += P('M' + pt([x - 8 * s, y - 44 * s]) + 'Q' + pt([x - 14 * s, y - 60 * s]) + ' ' + pt([x - 22 * s, y - 64 * s]) + 'Q' + pt([x - 16 * s, y - 56 * s]) + ' ' + pt([x - 3 * s, y - 42 * s]) + 'Z', '#f0e6cc', 1.6 * s);
    o += P('M' + pt([x + 8 * s, y - 44 * s]) + 'Q' + pt([x + 14 * s, y - 60 * s]) + ' ' + pt([x + 22 * s, y - 64 * s]) + 'Q' + pt([x + 16 * s, y - 56 * s]) + ' ' + pt([x + 3 * s, y - 42 * s]) + 'Z', '#d8ccb0', 1.6 * s);
    // door
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 12 * s]) + 'Q' + pt([x, y - 20 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z', '#2a1a10', 1.6 * s);
    return o;
  }
  function banner(c, x, y, h, col, em) {
    col = col || '#a8201a'; em = em || '#1a1009';
    var top = y - h, o = '';
    o += limb('M' + x + ',' + y + ' L' + x + ',' + n(top - 6), '#6a4424', 2.4);
    o += limb('M' + n(x - 3) + ',' + n(top) + ' L' + n(x + 19) + ',' + n(top), '#6a4424', 2);
    o += P('M' + n(x + 12) + ',' + n(top - 10) + ' L' + n(x + 8) + ',' + n(top - 6) + ' L' + n(x + 16) + ',' + n(top - 6) + ' Z', '#e8dcc0', 1.4);
    var bw = 18, bh = h * 0.52;
    var d = 'M' + n(x - 1) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top + bh) + ' L' + n(x + 8) + ',' + n(top + bh - 6) + ' L' + n(x - 1) + ',' + n(top + bh) + ' Z';
    o += body(c, d, col, F('M' + n(x + 11) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top + bh + 2) + ' L' + n(x + 11) + ',' + n(top + bh) + ' Z', dk(col, 0.3), 0.8), 1.6);
    // emblem: three-pronged horde spike mark
    var ex = x + 8, ey = top + bh * 0.42, k = bw / 18;
    o += F('M' + n(ex - 5 * k) + ',' + n(ey - 5 * k) + ' L' + n(ex - 2 * k) + ',' + n(ey + 5 * k) + ' L' + n(ex + 2 * k) + ',' + n(ey + 5 * k) + ' L' + n(ex + 5 * k) + ',' + n(ey - 5 * k) + ' L' + n(ex + 1.5 * k) + ',' + n(ey) + ' L' + n(ex) + ',' + n(ey - 7 * k) + ' L' + n(ex - 1.5 * k) + ',' + n(ey) + ' Z', em);
    return o;
  }
  function palisade(c, x1, x2, y, h, col, step) {
    col = col || '#8a5a32'; step = step || 9;
    var o = '';
    for (var x = x1; x < x2; x += step) {
      var hh = h * (0.9 + ((x * 37) % 10) / 50);
      var d = 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - hh) + ' L' + n(x + step / 2) + ',' + n(y - hh - step * 1.1) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' Z';
      o += P(d, c.cel(col), 1.6) + F('M' + n(x + step * 0.62) + ',' + n(y - hh - step * 0.5) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' L' + n(x + step * 0.62) + ',' + n(y) + ' Z', dk(col, 0.3), 0.75);
    }
    o += limb('M' + n(x1) + ',' + n(y - h * 0.35) + ' L' + n(x2) + ',' + n(y - h * 0.35), '#5a3a1e', 2.2);
    return o;
  }
  function watchtower(c, x, y, s) {
    var o = '', wood = '#7a4e2a';
    o += E(x, y + 1, 24 * s, 4 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 10 * s, y - 70 * s]), wood, 4 * s) + limb('M' + pt([x + 16 * s, y]) + 'L' + pt([x + 10 * s, y - 70 * s]), wood, 4 * s);
    o += limb('M' + pt([x - 15 * s, y - 8 * s]) + 'L' + pt([x + 12 * s, y - 60 * s]) + 'M' + pt([x + 15 * s, y - 8 * s]) + 'L' + pt([x - 12 * s, y - 60 * s]), dk(wood, 0.15), 2.4 * s);
    o += limb('M' + pt([x - 14 * s, y - 36 * s]) + 'L' + pt([x + 14 * s, y - 36 * s]), wood, 2.4 * s);
    // platform
    o += body(c, 'M' + pt([x - 20 * s, y - 70 * s]) + 'L' + pt([x + 20 * s, y - 70 * s]) + 'L' + pt([x + 18 * s, y - 84 * s]) + 'L' + pt([x - 18 * s, y - 84 * s]) + 'Z', '#8a5a32', F('M' + pt([x + 6 * s, y - 86 * s]) + 'L' + pt([x + 22 * s, y - 86 * s]) + 'L' + pt([x + 22 * s, y - 68 * s]) + 'L' + pt([x + 6 * s, y - 68 * s]) + 'Z', '#5a3a1e', 0.7), 1.8 * s);
    // hide roof with spikes
    o += limb('M' + pt([x - 16 * s, y - 84 * s]) + 'L' + pt([x - 16 * s, y - 96 * s]) + 'M' + pt([x + 16 * s, y - 84 * s]) + 'L' + pt([x + 16 * s, y - 96 * s]), wood, 2.2 * s);
    o += body(c, 'M' + pt([x - 26 * s, y - 94 * s]) + 'L' + pt([x, y - 116 * s]) + 'L' + pt([x + 26 * s, y - 94 * s]) + 'L' + pt([x + 14 * s, y - 97 * s]) + 'L' + pt([x, y - 93 * s]) + 'L' + pt([x - 14 * s, y - 97 * s]) + 'Z', '#b88a58', F('M' + pt([x, y - 116 * s]) + 'L' + pt([x + 26 * s, y - 94 * s]) + 'L' + pt([x, y - 93 * s]) + 'Z', '#7a5a34', 0.7), 1.8 * s);
    o += L('M' + pt([x, y - 116 * s]) + 'L' + pt([x - 2 * s, y - 128 * s]), OL, 4 * s) + L('M' + pt([x, y - 116 * s]) + 'L' + pt([x - 2 * s, y - 128 * s]), '#e8dcc0', 2 * s);
    o += L('M' + pt([x - 22 * s, y - 96 * s]) + 'L' + pt([x - 30 * s, y - 104 * s]) + 'M' + pt([x + 22 * s, y - 96 * s]) + 'L' + pt([x + 30 * s, y - 104 * s]), OL, 3.6 * s) + L('M' + pt([x - 22 * s, y - 96 * s]) + 'L' + pt([x - 30 * s, y - 104 * s]) + 'M' + pt([x + 22 * s, y - 96 * s]) + 'L' + pt([x + 30 * s, y - 104 * s]), '#e8dcc0', 1.6 * s);
    return o;
  }
  function palm(c, x, y, s, lean) {
    lean = lean || 0;
    var tx = x + lean * s, ty = y - 78 * s, o = '';
    o += E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.2);
    var trunk = 'M' + pt([x - 5 * s, y]) + 'Q' + pt([x + lean * 0.2 * s - 4 * s, y - 40 * s]) + ' ' + pt([tx - 3 * s, ty]) + 'L' + pt([tx + 3 * s, ty]) + 'Q' + pt([x + lean * 0.2 * s + 4 * s, y - 40 * s]) + ' ' + pt([x + 5 * s, y]) + 'Z';
    var rings = '';
    for (var i = 1; i < 9; i++) { var t = i / 9, rx = x + (tx - x) * t * t * 0.9 + lean * 0.2 * s * 2 * t * (1 - t), ry = y + (ty - y) * t; rings += L('M' + pt([rx - 5 * s, ry + 1]) + 'L' + pt([rx + 5 * s, ry - 1]), '#6a4a2a', 1.3 * s); }
    o += body(c, trunk, '#9a7248', rings, 1.8 * s);
    var fronds = [[-40, 6], [-30, -14], [-8, -22], [18, -18], [38, -2], [34, 16], [-26, 18]];
    fronds.forEach(function (f, i) {
      var ex = tx + f[0] * s, ey = ty + f[1] * s + 8 * s, mx = tx + f[0] * 0.5 * s, my = ty + Math.min(f[1], 0) * 0.8 * s - 8 * s;
      var d = 'M' + pt([tx, ty]) + 'Q' + pt([mx, my - 4 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([mx, my + 8 * s]) + ' ' + pt([tx, ty + 3 * s]) + 'Z';
      var col = i % 2 ? '#4f9a3a' : '#3f8a32';
      o += P(d, c.cel(col), 1.6 * s) + L('M' + pt([tx, ty + 1]) + 'Q' + pt([mx, my + 2 * s]) + ' ' + pt([ex, ey]), dk(col, 0.35), 1.1 * s);
    });
    o += C(tx - 3 * s, ty + 3 * s, 3.4 * s, '#6a4a2a', 1.4 * s) + C(tx + 3 * s, ty + 4 * s, 3.4 * s, '#5a3a20', 1.4 * s);
    return o;
  }
  function tent(c, x, y, s, col) {
    col = col || '#b88a58';
    var o = E(x, y + 1, 26 * s, 4 * s, '#000', 0, 0.22);
    o += body(c, 'M' + pt([x - 26 * s, y]) + 'L' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 26 * s, y]) + 'Z', col, F('M' + pt([x, y - 36 * s]) + 'L' + pt([x + 26 * s, y]) + 'L' + pt([x + 6 * s, y]) + 'Z', dk(col, 0.3), 0.8) + L('M' + pt([x - 16 * s, y - 14 * s]) + 'L' + pt([x + 16 * s, y - 14 * s]), '#8a2a1a', 3 * s), 1.8 * s);
    o += L('M' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x - 10 * s, y - 46 * s]) + 'M' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 10 * s, y - 46 * s]), OL, 4 * s) + L('M' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x - 10 * s, y - 46 * s]) + 'M' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x + 10 * s, y - 46 * s]), '#7a5030', 2 * s);
    o += P('M' + pt([x - 6 * s, y]) + 'L' + pt([x, y - 14 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#2a1a10', 1.4 * s);
    return o;
  }
  function cracks(seed, y0, y1, col, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = r() * 400, y = y0 + r() * (y1 - y0), k = 0.6 + (y - y0) / (y1 - y0);
      d += 'M' + pt([x, y]);
      for (var j = 0; j < 3; j++) { x += (r() - 0.3) * 22 * k; y += (r() - 0.5) * 8 * k; d += 'L' + pt([x, y]); }
      d += 'M' + pt([x - 8 * k, y]) + 'l' + n(-6 * k) + ',' + n(5 * k);
    }
    return L(d, col, 1.6);
  }

  // ---- mob pieces (Mulgore rig: biped + quilboar) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function hoofs(x, y, col) { return P('M' + n(x - 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 4.5) + ',' + n(y + 1) + ' L' + n(x - 5.5) + ',' + n(y + 1) + ' Z', col || '#2d2420', 2) + L('M' + n(x - 0.5) + ',' + n(y - 3) + ' L' + n(x - 0.5) + ',' + n(y + 1), OL, 1.2); }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', col, 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2); }
  function birdFoot(x, y, col, big) {
    var k = big ? 1.25 : 1;
    return L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), OL, 5) + L('M' + pt([x, y - 2]) + 'L' + pt([x - 11 * k, y + 1]) + 'M' + pt([x, y - 2]) + 'L' + pt([x - 5 * k, y + 1.5]) + 'M' + pt([x, y - 2]) + 'L' + pt([x + 6 * k, y + 1]), col, 2.2);
  }
  function staff(top, bot, col, w) {
    var d = 'M' + pt(top) + 'L' + pt(bot);
    return limb(d, col || '#6a4424', w || 3.4) + L(d, lt(col || '#6a4424', 0.3), 1, 0.6);
  }
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function spearhead(c, top, bot, len, col) {
    var dx = top[0] - bot[0], dy = top[1] - bot[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, px = -uy, py = ux;
    var tip = [top[0] + ux * len, top[1] + uy * len];
    return P(pd([[top[0] + px * 4.5 - ux * 2, top[1] + py * 4.5 - uy * 2], [top[0] + px * 3 + ux * len * 0.55, top[1] + py * 3 + uy * len * 0.55], tip, [top[0] - px * 3 + ux * len * 0.55, top[1] - py * 3 + uy * len * 0.55], [top[0] - px * 4.5 - ux * 2, top[1] - py * 4.5 - uy * 2]], true), c.cel(col || '#9a948a'), 1.8) +
      L('M' + pt([top[0] + px * 3.5 - ux * 4, top[1] + py * 3.5 - uy * 4]) + 'L' + pt([top[0] - px * 3.5 - ux * 4, top[1] - py * 3.5 - uy * 4]) + 'M' + pt([top[0] + px * 3.5 - ux * 7, top[1] + py * 3.5 - uy * 7]) + 'L' + pt([top[0] - px * 3.5 - ux * 7, top[1] - py * 3.5 - uy * 7]), '#c8a060', 1.6);
  }
  // ---- biped rig (facing left) ----
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    s += shadow(c, 64, o.shadowR || 32);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += hand(far[far.length - 1], c.cel(o.glove || sk));
    var hipY = o.hipY || 86;
    var toe = o.feet === 'toes' ? toes2 : o.feet === 'hoof' ? hoofs : boot;
    var kneeF = o.digi ? 'M68,' + hipY + ' L76,100 L70,112 L73,116' : 'M68,' + hipY + ' L71,103 L72,113';
    var kneeN = o.digi ? 'M56,' + hipY + ' L62,100 L54,112 L52,116' : 'M56,' + hipY + ' L53,103 L52,113';
    s += limb(kneeF, dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
    s += limb(kneeN, pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    if (o.loin) s += body(c, 'M50,' + (hipY - 4) + ' L78,' + (hipY - 4) + ' L76,' + (hipY + 14) + ' L70,' + (hipY + 10) + ' L64,' + (hipY + 18) + ' L58,' + (hipY + 10) + ' L52,' + (hipY + 14) + ' Z', o.loin, L('M54,' + (hipY + 4) + ' L74,' + (hipY + 4), dk(o.loin, 0.35), 1.2));
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,36 L96,36 L96,98 L70,98 C74,78 72,58 68,36 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#d8b048', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 2, hy + 8, 12, 9, c.cel(sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    s += hand(near[near.length - 1], c.cel(o.glove || sk));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- quilboar ----
  function quills(c, cx, cy, mane, tip, k) {
    var s = E(cx, cy, 16 * k, 11 * k, c.cel(mane), 2), list = [[-160, 14], [-140, 20], [-118, 25], [-96, 27], [-74, 26], [-52, 23], [-32, 19], [-12, 14]];
    list.forEach(function (q) {
      var a = q[0] * Math.PI / 180, L0 = q[1] * k, bx = cx + Math.cos(a) * 11 * k, by = cy + Math.sin(a) * 7 * k, b = a + 0.38;
      var tx = bx + Math.cos(b) * L0, ty = by + Math.sin(b) * L0, px = -Math.sin(b) * 3.6 * k, py = Math.cos(b) * 3.6 * k;
      s += P(pd([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true), c.cel(mane), 1.6);
      s += F(pd([[bx + (tx - bx) * 0.55 + px * 0.45, by + (ty - by) * 0.55 + py * 0.45], [tx, ty], [bx + (tx - bx) * 0.55 - px * 0.45, by + (ty - by) * 0.55 - py * 0.45]], true), tip);
    });
    return s;
  }
  function quilHead(c, x, y, o) {
    var sk = o.skin, s = '', mane = o.mane, tk = o.tusk || 1;
    s += P(pd([[x + 3, y - 10], [x + 14, y - 23], [x + 13, y - 5]], true), c.cel(sk), 2) + F(pd([[x + 6, y - 10], [x + 12, y - 18], [x + 11, y - 7]], true), '#8a4a3a', 0.7);
    // crown quills
    [[-4, -12, -0.2], [2, -13, 0.1], [8, -11, 0.4], [12, -6, 0.8]].forEach(function (q) {
      var a = -Math.PI / 2 + q[2], len = 11 * (o.big ? 1.25 : 1), bx = x + q[0], by = y + q[1];
      s += P(pd([[bx - 3, by + 2], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 3, by + 1]], true), c.cel(mane), 1.4) + C(bx + Math.cos(a) * len * 0.85, by + Math.sin(a) * len * 0.85, 1.1, o.tip);
    });
    var d = 'M' + pt([x + 12, y - 4]) + 'C' + pt([x + 10, y - 14]) + ' ' + pt([x - 4, y - 16]) + ' ' + pt([x - 10, y - 9]) + 'L' + pt([x - 19, y - 3]) + 'C' + pt([x - 23, y - 1]) + ' ' + pt([x - 24, y + 8]) + ' ' + pt([x - 20, y + 11]) + 'L' + pt([x - 10, y + 14]) + 'C' + pt([x - 2, y + 17]) + ' ' + pt([x + 8, y + 14]) + ' ' + pt([x + 12, y + 6]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 2, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 6, y + 8]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 2, y - 18]) + 'Z', dk(sk, 0.25), 0.8) +
      F('M' + pt([x - 26, y + 8]) + 'C' + pt([x - 16, y + 12]) + ' ' + pt([x - 4, y + 12]) + ' ' + pt([x + 14, y + 6]) + 'L' + pt([x + 14, y + 20]) + 'L' + pt([x - 26, y + 20]) + 'Z', dk(sk, 0.2), 0.7) +
      (o.paint ? L('M' + pt([x - 4, y - 2]) + 'L' + pt([x + 4, y + 4]) + 'M' + pt([x - 2, y - 8]) + 'L' + pt([x + 6, y - 2]), o.paint, 2) : ''));
    s += E(x - 21, y + 4, 3.6, 5.6, c.cel(o.snout || '#d49a86'), 1.8) + E(x - 22, y + 2, 0.9, 1.4, OL) + E(x - 22, y + 6.5, 0.9, 1.4, OL);
    s += L('M' + pt([x - 15, y - 7]) + 'L' + pt([x - 4, y - 5]), OL, 2.6) + C(x - 9, y - 2.6, 1.8, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 19, y + 11]) + 'C' + pt([x - 14, y + 12]) + ' ' + pt([x - 8, y + 12]) + ' ' + pt([x - 4, y + 10]), OL, 1.4);
    s += P('M' + pt([x - 12, y + 12]) + 'C' + pt([x - 18 - 3 * tk, y + 11]) + ' ' + pt([x - 21 - 3 * tk, y + 4 - 4 * tk]) + ' ' + pt([x - 19 - 2 * tk, y - 2 - 5 * tk]) + 'C' + pt([x - 17, y + 3]) + ' ' + pt([x - 14, y + 6]) + ' ' + pt([x - 8, y + 10]) + 'Z', c.cel('#f4ecd6'), 1.6);
    if (o.crown) {
      s += limb('M' + pt([x - 11, y - 10]) + 'C' + pt([x - 4, y - 16]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 12, y - 9]), '#5a6a32', 3.4);
      [[-9, -12, -2.1], [-3, -15, -1.8], [3, -16, -1.5], [9, -13, -1.1], [-6, -14, -2.5]].forEach(function (t) {
        var a = t[2], bx = x + t[0], by = y + t[1], len = 12;
        s += P(pd([[bx - 2.6, by + 1], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 2.6, by]], true), c.cel('#ece2c0'), 1.4);
      });
      s += C(x + 1, y - 14, 2.2, '#c83a2a', 1.2);
    }
    return s;
  }
  function quilboar(c, o) {
    var sk = o.skin || '#c28a6a', mane = o.mane || '#6a3a26', tip = o.tip || '#ece0bc', k = o.big ? 1.25 : 1;
    var ho = { skin: sk, mane: mane, tip: tip, eye: o.eye, snout: o.snout, tusk: o.tusk, crown: o.crown, paint: o.paint, big: o.big };
    return biped(c, {
      skin: sk, shirt: sk, pants: dk(sk, 0.05), bareArms: true, feet: 'hoof', boots: '#3a2a22', loin: o.loin || '#7a5030', legW: 11.5, armW: 10.5, belt: o.belt, buckle: '#ece0bc',
      hx: 46, hy: 42, hipY: 86, shadowR: 34, neck: false,
      torsoD: 'M42,58 C42,46 66,40 82,48 L86,68 L80,88 L50,88 L44,74 Z',
      back: function (c) { return quills(c, 72, 50, mane, tip, k) + (o.back ? o.back(c) : ''); },
      head: function (c, x, y) { return quilHead(c, x, y, ho); },
      chest: function (c) { return L('M50,66 Q58,72 68,68', dk(sk, 0.3), 1.4) + (o.chest ? o.chest(c) : ''); },
      near: o.near || [[48, 58], [40, 74], [32, 84]], far: o.far || [[80, 56], [88, 72], [88, 88]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top, tf: o.tf
    });
  }
  function thornBelt(y) { var s = L('M48,' + y + ' L80,' + y, '#4a3a22', 3.4); for (var x = 52; x < 80; x += 7) s += P('M' + (x - 2) + ',' + y + ' L' + x + ',' + (y + 6) + ' L' + (x + 2) + ',' + y + ' Z', '#ece2c0', 1); return s; }
  function boneNeck(x, y) { var s = L('M' + (x - 12) + ',' + y + ' Q' + x + ',' + (y + 10) + ' ' + (x + 12) + ',' + y, '#3a2a1a', 1.2); for (var i = -2; i <= 2; i++) s += P('M' + n(x + i * 4.4 - 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4) + ',' + n(y + 10 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4 + 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' Z', '#f4ecd6', 1); return s; }
  // ---- storm pieces (Durotar style) ----
  function spark(x, y, s, col) {
    return L('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x, y - 1 * s]) + 'L' + pt([x - 2 * s, y + 1 * s]) + 'L' + pt([x + 4 * s, y + 7 * s]), '#fff', 3.2 * s) +
      L('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x, y - 1 * s]) + 'L' + pt([x - 2 * s, y + 1 * s]) + 'L' + pt([x + 4 * s, y + 7 * s]), col, 1.6 * s);
  }
  function stormcloud(c, x, y, s, col) {
    col = col || '#4a4c5e';
    var d = 'M' + pt([x - 40 * s, y + 10 * s]) + 'C' + pt([x - 50 * s, y]) + ' ' + pt([x - 36 * s, y - 12 * s]) + ' ' + pt([x - 22 * s, y - 8 * s]) + 'C' + pt([x - 18 * s, y - 24 * s]) + ' ' + pt([x + 4 * s, y - 26 * s]) + ' ' + pt([x + 10 * s, y - 12 * s]) +
      'C' + pt([x + 22 * s, y - 22 * s]) + ' ' + pt([x + 42 * s, y - 12 * s]) + ' ' + pt([x + 38 * s, y]) + 'C' + pt([x + 52 * s, y + 2 * s]) + ' ' + pt([x + 50 * s, y + 14 * s]) + ' ' + pt([x + 38 * s, y + 14 * s]) + 'Z';
    return F(d, col) + F('M' + pt([x - 44 * s, y + 8 * s]) + 'C' + pt([x - 20 * s, y + 4 * s]) + ' ' + pt([x + 20 * s, y + 4 * s]) + ' ' + pt([x + 48 * s, y + 8 * s]) + 'L' + pt([x + 38 * s, y + 14 * s]) + 'L' + pt([x - 40 * s, y + 10 * s]) + 'Z', dk(col, 0.35), 0.85) +
      F('M' + pt([x - 20 * s, y - 8 * s]) + 'C' + pt([x - 14 * s, y - 20 * s]) + ' ' + pt([x + 2 * s, y - 22 * s]) + ' ' + pt([x + 8 * s, y - 12 * s]) + 'C' + pt([x, y - 16 * s]) + ' ' + pt([x - 12 * s, y - 14 * s]) + ' ' + pt([x - 20 * s, y - 8 * s]) + 'Z', lt(col, 0.2), 0.8);
  }
  function bolt(x, y, s) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x - 8 * s, y + 22 * s]) + 'L' + pt([x + 2 * s, y + 20 * s]) + 'L' + pt([x - 6 * s, y + 44 * s]) + 'L' + pt([x + 12 * s, y + 14 * s]) + 'L' + pt([x + 2 * s, y + 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z';
    return P(d, '#f4f8ff', 1.6 * s) + F('M' + pt([x + 1 * s, y + 2 * s]) + 'L' + pt([x - 4 * s, y + 18 * s]) + 'L' + pt([x + 3 * s, y + 17 * s]) + 'Z', '#9fd4ff', 0.9);
  }

  // ============================================================
  //  BARRENS PIECES
  // ============================================================
  var SAV = '#d8b868', SAV2 = '#b08a44', DRY = '#9a7a30', DRYL = '#f0d88a', LEAF = '#7a8a36', CRACK = '#8f6c34', TUFT = '#c4a444';
  function barSky(c, sx, sy) { return sky(c, '#79a9cc', '#b9d0d4', '#f4e4b8') + sun(c, sx, sy, 11, '#fff6d8'); }
  // heat haze band hugging the horizon
  function haze(c, y) { return R(-2, y - 34, 404, 44, c.lg([[0, '#fbf0cc', 0], [0.75, '#fbf0cc', 0.6], [1, '#fbf0cc', 0]])); }
  function farAcacia(x, y, s, col) {
    col = col || '#a4a064';
    return L('M' + pt([x, y]) + 'L' + pt([x, y - 10 * s]) + 'M' + pt([x, y - 7 * s]) + 'L' + pt([x - 6 * s, y - 13 * s]) + 'M' + pt([x, y - 8 * s]) + 'L' + pt([x + 6 * s, y - 13 * s]), col, 1.4 * s) +
      F('M' + pt([x - 15 * s, y - 12 * s]) + 'Q' + pt([x - 11 * s, y - 18 * s]) + ' ' + pt([x, y - 17 * s]) + 'Q' + pt([x + 11 * s, y - 18 * s]) + ' ' + pt([x + 15 * s, y - 12 * s]) + 'Z', col);
  }
  // flat-topped thorn tree: forked trunk, wide umbrella canopy
  function acacia(c, x, y, s, leaf, flip) {
    leaf = leaf || LEAF;
    var f = flip ? -1 : 1, wood = '#6e4a2c';
    function Q(dx, dy) { return [x + dx * s * f, y + dy * s]; }
    var o = E(x + 4 * s * f, y + 2, 38 * s, 5 * s, '#000', 0, 0.2);
    o += limb('M' + pt(Q(0, 0)) + 'C' + pt(Q(-2, -14)) + ' ' + pt(Q(4, -24)) + ' ' + pt(Q(2, -34)), wood, 5.5 * s);
    o += limb('M' + pt(Q(2, -32)) + 'C' + pt(Q(-8, -42)) + ' ' + pt(Q(-20, -48)) + ' ' + pt(Q(-32, -60)), wood, 3.2 * s);
    o += limb('M' + pt(Q(2, -34)) + 'C' + pt(Q(8, -46)) + ' ' + pt(Q(20, -52)) + ' ' + pt(Q(32, -62)), wood, 3.2 * s);
    o += limb('M' + pt(Q(2, -36)) + 'L' + pt(Q(0, -62)) + 'M' + pt(Q(-14, -46)) + 'L' + pt(Q(-12, -60)) + 'M' + pt(Q(16, -48)) + 'L' + pt(Q(14, -62)), wood, 2 * s);
    var top = [[-48, -64], [-36, -72], [-20, -76], [-4, -78], [12, -78], [28, -75], [42, -70]], d = 'M' + pt(Q(-56, -61));
    for (var i = 0; i < top.length; i++) { var p = top[i], q = top[i + 1] || [56, -62]; d += 'Q' + pt(Q(p[0], p[1] - 5)) + ' ' + pt(Q((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)); }
    d += 'L' + pt(Q(56, -62)) + 'C' + pt(Q(34, -56)) + ' ' + pt(Q(-34, -56)) + ' ' + pt(Q(-56, -61)) + 'Z';
    var sh = F('M' + pt(Q(-60, -64)) + 'C' + pt(Q(-30, -60)) + ' ' + pt(Q(30, -60)) + ' ' + pt(Q(60, -66)) + 'L' + pt(Q(60, -50)) + 'L' + pt(Q(-60, -50)) + 'Z', dk(leaf, 0.32), 0.9) +
      E(Q(-22, -72)[0], Q(-22, -72)[1], 14 * s, 3 * s, lt(leaf, 0.3), 0, 0.75) + E(Q(10, -75)[0], Q(10, -75)[1], 12 * s, 2.4 * s, lt(leaf, 0.3), 0, 0.7) +
      L('M' + pt(Q(-40, -66)) + 'l' + n(6 * s * f) + ',-2 M' + pt(Q(-6, -68)) + 'l' + n(7 * s * f) + ',-2 M' + pt(Q(24, -67)) + 'l' + n(6 * s * f) + ',-2', dk(leaf, 0.25), 1.1 * s);
    o += body(c, d, leaf, sh, 1.9 * s);
    return o;
  }
  // termite-mound spire rock
  function mound(c, x, y, s, col) {
    col = col || '#c08452';
    var o = E(x + 2 * s, y + 1, 24 * s, 4 * s, '#000', 0, 0.22);
    var d = 'M' + pt([x - 18 * s, y]) + 'C' + pt([x - 16 * s, y - 14 * s]) + ' ' + pt([x - 10 * s, y - 20 * s]) + ' ' + pt([x - 9 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 42 * s]) + ' ' + pt([x - 5 * s, y - 56 * s]) + ' ' + pt([x - 1 * s, y - 62 * s]) +
      'C' + pt([x + 3 * s, y - 64 * s]) + ' ' + pt([x + 5 * s, y - 58 * s]) + ' ' + pt([x + 5 * s, y - 50 * s]) + 'C' + pt([x + 6 * s, y - 40 * s]) + ' ' + pt([x + 8 * s, y - 34 * s]) + ' ' + pt([x + 11 * s, y - 34 * s]) +
      'C' + pt([x + 14 * s, y - 38 * s]) + ' ' + pt([x + 17 * s, y - 34 * s]) + ' ' + pt([x + 17 * s, y - 24 * s]) + 'C' + pt([x + 18 * s, y - 14 * s]) + ' ' + pt([x + 22 * s, y - 6 * s]) + ' ' + pt([x + 24 * s, y]) + 'Z';
    var sh = F('M' + pt([x + 1 * s, y - 66 * s]) + 'C' + pt([x + 5 * s, y - 50 * s]) + ' ' + pt([x + 3 * s, y - 36 * s]) + ' ' + pt([x + 7 * s, y - 28 * s]) + 'L' + pt([x + 30 * s, y - 30 * s]) + 'L' + pt([x + 30 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'C' + pt([x + 3 * s, y - 20 * s]) + ' ' + pt([x + 1 * s, y - 40 * s]) + ' ' + pt([x + 1 * s, y - 66 * s]) + 'Z', dk(col, 0.28), 0.85) +
      L('M' + pt([x - 14 * s, y - 12 * s]) + 'Q' + pt([x, y - 9 * s]) + ' ' + pt([x + 20 * s, y - 12 * s]) + 'M' + pt([x - 9 * s, y - 28 * s]) + 'Q' + pt([x, y - 25 * s]) + ' ' + pt([x + 16 * s, y - 27 * s]) + 'M' + pt([x - 6 * s, y - 46 * s]) + 'Q' + pt([x - 1 * s, y - 44 * s]) + ' ' + pt([x + 5 * s, y - 46 * s]), dk(col, 0.22), 1.2 * s, 0.8) +
      E(x - 4 * s, y - 36 * s, 1.6 * s, 2.2 * s, dk(col, 0.5)) + E(x + 10 * s, y - 18 * s, 1.4 * s, 2 * s, dk(col, 0.5)) + E(x - 10 * s, y - 8 * s, 1.4 * s, 1.8 * s, dk(col, 0.5)) +
      F('M' + pt([x - 12 * s, y - 6 * s]) + 'C' + pt([x - 10 * s, y - 20 * s]) + ' ' + pt([x - 6 * s, y - 40 * s]) + ' ' + pt([x - 3 * s, y - 56 * s]) + 'L' + pt([x - 5 * s, y - 40 * s]) + 'Z', lt(col, 0.25), 0.6);
    return o + body(c, d, col, sh, 1.8 * s);
  }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // shallow pool with a mud rim, bank shadow, ripples
  function pool(c, x, y, rx, ry, w1, w2, rim) {
    w1 = w1 || '#56aaa4'; w2 = w2 || '#2a6a78'; rim = rim || '#9a7a44';
    var d = ellD(x, y, rx, ry), o = E(x, y + ry * 0.25, rx + 8, ry + 4, rim, 0, 0.6);
    o += P(d, c.lg([[0, w2], [0.5, w1], [1, lt(w1, 0.2)]]), 1.8);
    var r = rng(Math.round(x * 3 + rx)), rip = '';
    for (var i = 0; i < 4; i++) { var px = x + (r() - 0.5) * rx * 1.2, py = y + (r() - 0.2) * ry * 0.7, w = rx * (0.12 + r() * 0.12); rip += 'M' + pt([px - w, py]) + 'L' + pt([px + w, py]); }
    o += '<g clip-path="url(#' + c.clip(d) + ')">' + E(x, y - ry * 0.95, rx * 1.1, ry * 0.55, dk(w2, 0.35), 0, 0.7) + E(x - rx * 0.25, y + ry * 0.2, rx * 0.4, ry * 0.25, '#e8f4f0', 0, 0.35) + L(rip, '#eaf6f2', 1.2, 0.8) + '</g>';
    return o;
  }
  function reeds(c, x, y, s, col) {
    col = col || '#6a8a34';
    var d = '', tops = '', r = rng(Math.round(x * 5 + y * 3));
    for (var i = 0; i < 7; i++) {
      var dx = (i - 3) * 3 * s + (r() - 0.5) * 2 * s, h = (14 + r() * 12) * s, lean = (i - 3) * 1.8 * s, ex = x + dx + lean, ey = y - h;
      d += 'M' + pt([x + dx, y]) + 'Q' + pt([x + dx + lean * 0.3, y - h * 0.6]) + ' ' + pt([ex, ey]);
      if (i % 2) tops += E(ex - lean * 0.08, ey + 4 * s, 1.8 * s, 4 * s, '#7a4a24', 1 * s);
    }
    return E(x, y + 1, 12 * s, 2.4 * s, '#000', 0, 0.18) + L(d, OL, 3.2 * s) + L(d, col, 1.6 * s) + tops;
  }
  // Kolkar centaur tent: patched hide dome, poles through the top, painted band
  function kolkarTent(c, x, y, s, hide) {
    hide = hide || '#c8a878';
    var o = E(x, y + 1, 32 * s, 5 * s, '#000', 0, 0.22);
    o += limb('M' + pt([x - 4 * s, y - 36 * s]) + 'L' + pt([x + 9 * s, y - 56 * s]), '#6a4424', 2 * s) + limb('M' + pt([x + 4 * s, y - 36 * s]) + 'L' + pt([x - 9 * s, y - 56 * s]), '#6a4424', 2 * s) + limb('M' + pt([x, y - 38 * s]) + 'L' + pt([x + 1 * s, y - 58 * s]), '#7a5030', 2 * s);
    var d = 'M' + pt([x - 28 * s, y]) + 'C' + pt([x - 27 * s, y - 18 * s]) + ' ' + pt([x - 12 * s, y - 38 * s]) + ' ' + pt([x - 3 * s, y - 40 * s]) + 'L' + pt([x + 3 * s, y - 40 * s]) + 'C' + pt([x + 12 * s, y - 38 * s]) + ' ' + pt([x + 27 * s, y - 18 * s]) + ' ' + pt([x + 28 * s, y]) + 'Z';
    var by = y - 15 * s, tri = '';
    for (var i = -4; i <= 4; i++) tri += 'M' + pt([x + i * 6.4 * s - 3 * s, by + 3 * s]) + 'L' + pt([x + i * 6.4 * s, by - 3 * s]) + 'L' + pt([x + i * 6.4 * s + 3 * s, by + 3 * s]) + 'Z';
    var sh = R(x - 32 * s, by - 4.5 * s, 64 * s, 9 * s, '#8a3a26') + F(tri, '#ecdcb8') + R(x - 32 * s, y - 5 * s, 64 * s, 2.6 * s, '#3a6a8a') +
      E(x - 12 * s, y - 28 * s, 6 * s, 4 * s, dk(hide, 0.14), 0, 0.9) + E(x + 12 * s, y - 24 * s, 5 * s, 4 * s, lt(hide, 0.12), 0, 0.9) +
      L('M' + pt([x - 18 * s, y - 32 * s]) + 'l2,2 M' + pt([x - 8 * s, y - 24 * s]) + 'l2,2 M' + pt([x + 7 * s, y - 29 * s]) + 'l2,2', dk(hide, 0.4), 1 * s) +
      F('M' + pt([x + 4 * s, y - 41 * s]) + 'C' + pt([x + 14 * s, y - 38 * s]) + ' ' + pt([x + 30 * s, y - 20 * s]) + ' ' + pt([x + 30 * s, y + 2]) + 'L' + pt([x + 12 * s, y + 2]) + 'C' + pt([x + 14 * s, y - 18 * s]) + ' ' + pt([x + 10 * s, y - 32 * s]) + ' ' + pt([x + 4 * s, y - 41 * s]) + 'Z', dk(hide, 0.25), 0.8);
    o += body(c, d, hide, sh, 1.8 * s);
    o += P('M' + pt([x - 7 * s, y + 1]) + 'L' + pt([x - 7 * s, y - 13 * s]) + 'Q' + pt([x, y - 21 * s]) + ' ' + pt([x + 7 * s, y - 13 * s]) + 'L' + pt([x + 7 * s, y + 1]) + 'Z', '#2a1a10', 1.4 * s);
    o += feathers(x + 1 * s, y - 56 * s, ['#c83a2a', '#ece0bc'], 0.55 * s * 1.4, 0.2);
    return o;
  }
  // wind rider perch: pole frame with a resting wind rider (wings up, scorpion tail)
  function perch(c, x, y, s) {
    var o = E(x, y + 1, 22 * s, 4 * s, '#000', 0, 0.22), wood = '#7a4e2a', wy = y - 66 * s;
    o += limb('M' + pt([x - 14 * s, y]) + 'L' + pt([x - 8 * s, wy]) + 'M' + pt([x + 14 * s, y]) + 'L' + pt([x + 8 * s, wy]), wood, 3.4 * s);
    o += limb('M' + pt([x - 13 * s, y - 8 * s]) + 'L' + pt([x + 10 * s, wy + 10 * s]) + 'M' + pt([x + 13 * s, y - 8 * s]) + 'L' + pt([x - 10 * s, wy + 10 * s]), dk(wood, 0.15), 2 * s);
    o += R(x - 16 * s, wy - 3 * s, 32 * s, 6 * s, c.cel('#8a5a32'), 1.6 * s);
    var fur = '#c8904a', wing = '#9a3a28', bx = x + 2 * s, by = wy - 10 * s;
    // far wing
    o += body(c, 'M' + pt([bx + 2 * s, by - 2 * s]) + 'L' + pt([bx + 20 * s, by - 34 * s]) + 'L' + pt([bx + 22 * s, by - 24 * s]) + 'L' + pt([bx + 28 * s, by - 26 * s]) + 'L' + pt([bx + 26 * s, by - 14 * s]) + 'L' + pt([bx + 32 * s, by - 12 * s]) + 'L' + pt([bx + 12 * s, by + 2 * s]) + 'Z', dk(wing, 0.2), '', 1.4 * s);
    // scorpion tail
    o += L('M' + pt([bx + 10 * s, by + 2 * s]) + 'C' + pt([bx + 22 * s, by + 4 * s]) + ' ' + pt([bx + 26 * s, by - 10 * s]) + ' ' + pt([bx + 18 * s, by - 16 * s]), OL, 5 * s) + L('M' + pt([bx + 10 * s, by + 2 * s]) + 'C' + pt([bx + 22 * s, by + 4 * s]) + ' ' + pt([bx + 26 * s, by - 10 * s]) + ' ' + pt([bx + 18 * s, by - 16 * s]), fur, 2.6 * s) +
      P(pd([[bx + 18 * s, by - 16 * s], [bx + 12 * s, by - 16 * s], [bx + 16 * s, by - 21 * s]], true), '#3a2a20', 1 * s);
    // body + legs
    o += E(bx, by + 1 * s, 12 * s, 7 * s, c.cel(fur), 1.6 * s) + limb('M' + pt([bx - 7 * s, by + 5 * s]) + 'L' + pt([bx - 8 * s, by + 10 * s]) + 'M' + pt([bx + 6 * s, by + 5 * s]) + 'L' + pt([bx + 7 * s, by + 10 * s]), fur, 2.4 * s);
    // head with dark mane
    o += C(bx - 11 * s, by - 6 * s, 6 * s, c.cel('#6a3a22'), 1.4 * s) + P('M' + pt([bx - 14 * s, by - 8 * s]) + 'L' + pt([bx - 21 * s, by - 5 * s]) + 'L' + pt([bx - 20 * s, by - 1 * s]) + 'L' + pt([bx - 13 * s, by - 1 * s]) + 'Z', c.cel(fur), 1.3 * s) + C(bx - 16 * s, by - 5 * s, 0.9 * s, OL);
    // near wing
    o += body(c, 'M' + pt([bx - 4 * s, by - 2 * s]) + 'L' + pt([bx + 6 * s, by - 38 * s]) + 'L' + pt([bx + 10 * s, by - 28 * s]) + 'L' + pt([bx + 16 * s, by - 30 * s]) + 'L' + pt([bx + 16 * s, by - 18 * s]) + 'L' + pt([bx + 22 * s, by - 16 * s]) + 'L' + pt([bx + 6 * s, by + 2 * s]) + 'Z', wing, L('M' + pt([bx, by - 4 * s]) + 'L' + pt([bx + 6 * s, by - 34 * s]) + 'M' + pt([bx + 2 * s, by - 2 * s]) + 'L' + pt([bx + 14 * s, by - 26 * s]), dk(wing, 0.35), 0.9 * s), 1.4 * s);
    return o;
  }
  // quilboar bone totem: thorn-wrapped pole, boar skull, hanging bones and red rags
  function boneTotem(c, x, y, h, s) {
    var top = y - h, o = E(x, y + 1, 10 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top + 6 * s]), '#5a3a22', 3.6 * s);
    var wr = '', th = '';
    for (var k = 0; k < 6; k++) { var yy = top + 26 * s + k * (h - 34 * s) / 6; wr += 'M' + pt([x - 3 * s, yy]) + 'L' + pt([x + 3 * s, yy + 5 * s]); th += P(pd([[x + 2 * s, yy + 2 * s], [x + (k % 2 ? 8 : -8) * s, yy - 1 * s], [x + 2 * s, yy + 4 * s]], true), '#e0d0a8', 0.9 * s); }
    o += th + L(wr, '#2a1a10', 1.3 * s);
    var cy = top + 16 * s;
    o += L('M' + pt([x - 14 * s, cy]) + 'L' + pt([x - 14 * s, cy + 14 * s]) + 'M' + pt([x + 14 * s, cy]) + 'L' + pt([x + 14 * s, cy + 12 * s]), '#3a2a1a', 1 * s);
    o += P(pd([[x - 12 * s, cy + 1 * s], [x - 6 * s, cy + 1 * s], [x - 8 * s, cy + 18 * s], [x - 10 * s, cy + 12 * s]], true), '#a8281e', 1 * s) + P(pd([[x + 5 * s, cy + 1 * s], [x + 11 * s, cy + 1 * s], [x + 9 * s, cy + 15 * s]], true), '#a8281e', 1 * s);
    o += bone(x, cy, 32 * s, 0.08, s) + bone(x - 14 * s, cy + 16 * s, 8 * s, 1.4, 0.7 * s) + skull(c, x + 14 * s, cy + 16 * s, 0.5 * s);
    // boar skull with tusks
    o += P('M' + pt([x - 5 * s, top + 4 * s]) + 'C' + pt([x - 11 * s, top + 4 * s]) + ' ' + pt([x - 12 * s, top - 6 * s]) + ' ' + pt([x - 9 * s, top - 10 * s]) + 'C' + pt([x - 8 * s, top - 4 * s]) + ' ' + pt([x - 6 * s, top]) + ' ' + pt([x - 2 * s, top + 1 * s]) + 'Z', c.cel('#f4ecd6'), 1.2 * s) +
      P('M' + pt([x + 5 * s, top + 4 * s]) + 'C' + pt([x + 11 * s, top + 4 * s]) + ' ' + pt([x + 12 * s, top - 6 * s]) + ' ' + pt([x + 9 * s, top - 10 * s]) + 'C' + pt([x + 8 * s, top - 4 * s]) + ' ' + pt([x + 6 * s, top]) + ' ' + pt([x + 2 * s, top + 1 * s]) + 'Z', c.cel('#f4ecd6'), 1.2 * s);
    o += skull(c, x, top, 1.05 * s);
    return o;
  }
  // dark earthen mound buried in giant brambles
  function thornMound(c, x, y, s, seed) {
    var col = '#7a5234', d = 'M' + pt([x - 42 * s, y]) + 'C' + pt([x - 40 * s, y - 30 * s]) + ' ' + pt([x - 18 * s, y - 48 * s]) + ' ' + pt([x, y - 48 * s]) + 'C' + pt([x + 18 * s, y - 48 * s]) + ' ' + pt([x + 40 * s, y - 30 * s]) + ' ' + pt([x + 42 * s, y]) + 'Z';
    var o = E(x, y + 2, 46 * s, 6 * s, '#000', 0, 0.25);
    o += body(c, d, col, F('M' + pt([x + 8 * s, y - 50 * s]) + 'C' + pt([x + 30 * s, y - 40 * s]) + ' ' + pt([x + 44 * s, y - 24 * s]) + ' ' + pt([x + 44 * s, y + 2]) + 'L' + pt([x + 14 * s, y + 2]) + 'Z', dk(col, 0.3), 0.85) + pebbles(seed, y - 40 * s, y, '#4a3020', 8), 2 * s);
    o += bramble(c, [x - 46 * s, y + 2], [x - 34 * s, y - 56 * s], [x + 26 * s, y - 50 * s], [x + 34 * s, y - 18 * s], 6.5 * s, '#5a3a26', '#e4d4a8', seed);
    o += bramble(c, [x + 46 * s, y + 2], [x + 22 * s, y - 70 * s], [x - 30 * s, y - 40 * s], [x - 26 * s, y - 12 * s], 5.5 * s, '#4e3222', '#e4d4a8', seed + 3);
    o += bramble(c, [x - 8 * s, y + 2], [x - 26 * s, y - 44 * s], [x + 2 * s, y - 76 * s], [x + 16 * s, y - 52 * s], 4.5 * s, '#5a3a26', '#e4d4a8', seed + 5);
    o += bramble(c, [x + 20 * s, y + 2], [x + 30 * s, y - 24 * s], [x + 50 * s, y - 30 * s], [x + 56 * s, y - 44 * s], 4 * s, '#4e3222', '#e4d4a8', seed + 7);
    return o;
  }
  // Kolkar war totem: feathered pole, painted round hide shield, kodo horns on top
  function kolkarTotem(c, x, y, h, s) {
    var top = y - h, o = E(x, y + 1, 10 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top]), '#6a4424', 3.4 * s);
    o += P('M' + pt([x - 2 * s, top + 4 * s]) + 'C' + pt([x - 12 * s, top + 2 * s]) + ' ' + pt([x - 16 * s, top - 8 * s]) + ' ' + pt([x - 14 * s, top - 14 * s]) + 'C' + pt([x - 10 * s, top - 6 * s]) + ' ' + pt([x - 6 * s, top - 2 * s]) + ' ' + pt([x, top]) + 'Z', c.cel('#ece2c8'), 1.3 * s) +
      P('M' + pt([x + 2 * s, top + 4 * s]) + 'C' + pt([x + 12 * s, top + 2 * s]) + ' ' + pt([x + 16 * s, top - 8 * s]) + ' ' + pt([x + 14 * s, top - 14 * s]) + 'C' + pt([x + 10 * s, top - 6 * s]) + ' ' + pt([x + 6 * s, top - 2 * s]) + ' ' + pt([x, top]) + 'Z', c.cel('#d8ceb4'), 1.3 * s);
    var sy = top + 22 * s, r = 12 * s;
    o += C(x, sy, r, c.cel('#c8a878'), 1.8 * s) + '<circle cx="' + n(x) + '" cy="' + n(sy) + '" r="' + n(r * 0.7) + '" fill="none" stroke="#8a3a26" stroke-width="' + n(2.4 * s) + '"/>' +
      P(pd([[x - 5 * s, sy + 4 * s], [x, sy - 6 * s], [x + 5 * s, sy + 4 * s]], true), '#3a6a8a', 1 * s) + C(x, sy + 1 * s, 1.6 * s, '#ece0bc');
    o += L('M' + pt([x - r, sy]) + 'L' + pt([x - r - 2 * s, sy + 12 * s]) + 'M' + pt([x + r, sy]) + 'L' + pt([x + r + 2 * s, sy + 12 * s]), '#3a2a1a', 1 * s);
    o += feathers(x - r - 2 * s, sy + 10 * s, ['#c83a2a'], 0.6 * s, 0.1) + feathers(x + r + 2 * s, sy + 10 * s, ['#ece0bc'], 0.6 * s, -0.1);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    crossroads: function (c) {
      var o = barSky(c, 318, 40) + cloud(80, 44, 1.0, 0.75) + cloud(236, 26, 0.8, 0.7);
      o += hills(c, 101, 150, 8, '#cfc79c', 60) + farAcacia(34, 150, 1.1) + farAcacia(372, 148, 0.9) + farAcacia(292, 151, 0.7) + haze(c, 152);
      o += ground(c, 148, SAV, SAV2);
      // the two roads that cross here
      o += road(c, 148, 16, 96, '#ecd298', 0.6);
      o += F('M-4,168 C80,162 150,160 200,160 C260,160 330,162 404,168 L404,184 C330,178 260,174 200,174 C150,174 80,178 -4,184 Z', '#ecd298', 0.5);
      o += cracks(103, 184, 238, CRACK, 12) + grass(105, 150, 238, DRY, 110, 0.6, 1.8, 1.1) + grass(107, 154, 238, DRYL, 60, 0.6, 1.6, 1) + pebbles(109, 178, 236, '#8a6a3a', 14);
      o += palisade(c, -6, 154, 158, 24, '#7a4e2a', 8) + palisade(c, 246, 406, 158, 24, '#7a4e2a', 8);
      o += orcHut(c, 100, 158, 0.52) + orcHut(c, 300, 158, 0.55, '#c29060') + orcHut(c, 368, 160, 0.42, '#caa068');
      o += watchtower(c, 200, 158, 0.95);
      o += banner(c, 152, 172, 50) + banner(c, 230, 172, 50);
      o += perch(c, 34, 176, 0.95);
      o += tent(c, 352, 184, 0.62) + barrel(c, 262, 186, 0.9, '#8a5a32') + crate(c, 276, 188, 0.9);
      o += tufts(c, [[16, 222, 1.1], [388, 226, 1.1], [150, 234, 0.8], [256, 236, 0.9]], TUFT);
      return o + vignette(c);
    },
    far_watch: function (c) {
      var o = barSky(c, 70, 38) + cloud(170, 34, 1.0, 0.75) + cloud(300, 22, 0.7, 0.7);
      o += hills(c, 111, 150, 8, '#cfc79c', 60) + farAcacia(40, 150, 1) + farAcacia(120, 149, 0.8) + haze(c, 152);
      o += farMesa(300, 104, 110, 30, '#d0947a', '#b87c64', null);
      // the red ridge on the Durotar border
      var rk = '#b4623a';
      o += body(c, 'M206,160 C222,150 236,134 248,118 C256,108 262,102 272,100 L406,98 L406,160 Z', rk,
        F('M340,98 L406,98 L406,162 L360,162 C356,140 350,118 340,98 Z', dk(rk, 0.28), 0.85) + L('M236,134 Q300,130 406,128 M222,150 Q300,146 406,146 M256,112 Q320,112 406,112', dk(rk, 0.22), 1.6, 0.7) +
        F('M248,118 C256,108 262,102 272,100 L300,100 C284,106 270,118 262,134 Z', lt(rk, 0.2), 0.6), 2.2);
      o += rock(c, 244, 124, 22, 14, '#a4583a') + rock(c, 392, 100, 26, 14, '#a4583a');
      o += palisade(c, 282, 386, 100, 13, '#7a4e2a', 6);
      o += watchtower(c, 330, 100, 0.55) + banner(c, 296, 100, 30) + banner(c, 366, 100, 30);
      o += ground(c, 156, SAV, SAV2);
      // road heading east up onto the ridge
      o += F('M92,242 C140,210 210,180 262,158 C272,152 280,140 290,120 L306,120 C300,140 292,156 284,164 C240,190 190,216 168,242 Z', '#ecd298', 0.6);
      o += cracks(113, 176, 238, CRACK, 12) + grass(115, 156, 238, DRY, 110, 0.6, 1.8, 1.1) + grass(117, 158, 238, DRYL, 60, 0.6, 1.6, 1) + pebbles(119, 170, 236, '#8a5a3a', 16);
      o += acacia(c, 70, 170, 0.8) + mound(c, 150, 164, 0.6);
      o += rock(c, 220, 178, 30, 14, '#a8603c') + rock(c, 392, 190, 34, 18, '#a8603c');
      o += tufts(c, [[20, 220, 1.1], [382, 232, 1], [140, 234, 0.9]], TUFT);
      return o + vignette(c);
    },
    forgotten_pools: function (c) {
      var o = barSky(c, 300, 36) + cloud(90, 36, 1.1, 0.75) + cloud(250, 50, 0.7, 0.7);
      o += hills(c, 121, 150, 10, '#cfc79c', 60) + farAcacia(60, 150, 0.9) + farAcacia(250, 149, 1) + farAcacia(330, 151, 0.7) + haze(c, 152);
      o += ground(c, 150, '#d4b86a', '#ae8c48');
      o += grass(123, 152, 238, DRY, 90, 0.6, 1.8, 1.1) + grass(125, 154, 238, DRYL, 50, 0.6, 1.6, 1) + cracks(127, 190, 238, CRACK, 8);
      o += mound(c, 332, 156, 0.55);
      o += pool(c, 70, 162, 40, 7) + pool(c, 202, 172, 76, 11) + pool(c, 344, 166, 38, 7) + pool(c, 42, 228, 30, 6) + pool(c, 360, 230, 26, 5);
      o += reeds(c, 36, 162, 0.9) + reeds(c, 132, 176, 1.1) + reeds(c, 272, 174, 1) + reeds(c, 380, 168, 0.8) + reeds(c, 64, 230, 1.1) + reeds(c, 336, 232, 0.9);
      o += acacia(c, 150, 158, 0.62, null, true);
      o += rock(c, 250, 170, 22, 10, '#a89c82') + rock(c, 98, 180, 20, 9, '#a89c82') + rock(c, 16, 196, 30, 14, '#a89c82') + rock(c, 392, 206, 30, 14, '#a89c82');
      o += tufts(c, [[190, 234, 0.8], [290, 238, 0.9]], TUFT);
      return o + vignette(c);
    },
    stagnant_oasis: function (c) {
      var o = sky(c, '#80a8b8', '#c4ceb8', '#eee0b0') + sun(c, 330, 40, 11, '#fff4d0') + cloud(140, 40, 0.9, 0.7);
      o += hills(c, 131, 150, 10, '#c8c498', 60) + farAcacia(40, 150, 0.9) + farAcacia(380, 149, 0.8) + haze(c, 152);
      o += ground(c, 150, '#cfb468', '#a8884a');
      o += grass(133, 152, 238, DRY, 90, 0.6, 1.8, 1.1) + grass(135, 154, 238, DRYL, 40, 0.6, 1.6, 1);
      o += kolkarTent(c, 150, 154, 0.5, '#bca070');
      // murky oasis with a wide mud ring
      o += E(204, 176, 118, 20, '#6a5030', 0, 0.75);
      o += pool(c, 204, 174, 100, 14, '#6a8a44', '#34502a', '#5a4428');
      o += E(170, 172, 10, 2.4, '#8aa84a', 0, 0.8) + E(236, 178, 14, 2.6, '#8aa84a', 0, 0.8) + E(262, 170, 7, 1.8, '#8aa84a', 0, 0.8) + C(150, 176, 1.6, '#c8d870') + C(226, 170, 1.4, '#c8d870') + C(280, 176, 1.4, '#c8d870');
      o += palm(c, 250, 164, 0.72, -8) + palm(c, 110, 176, 0.98, -14) + palm(c, 300, 174, 1.06, 16);
      o += reeds(c, 96, 184, 1) + reeds(c, 316, 186, 1.1) + reeds(c, 196, 190, 0.8);
      o += kolkarTent(c, 44, 170, 0.9) + kolkarTent(c, 368, 168, 0.95, '#b89868');
      o += F('M120,210 C150,204 190,206 210,212 C190,218 140,218 120,210 Z', '#7a5a34', 0.5) + F('M250,224 C280,218 320,220 340,226 C320,232 270,232 250,224 Z', '#7a5a34', 0.5);
      o += bone(150, 224, 14, 0.3, 1) + skull(c, 290, 214, 0.7);
      o += tufts(c, [[16, 226, 1.1], [390, 230, 1]], TUFT);
      return o + vignette(c, '#f4f0d8', '#1a1a08');
    },
    razormane_grounds: function (c) {
      var o = sky(c, '#8aa4b4', '#d2c8a6', '#eecea0') + sun(c, 80, 40, 11, '#fff0c8') + cloud(240, 34, 0.9, 0.6);
      o += hills(c, 141, 150, 10, '#c8b890', 60) + farAcacia(300, 150, 0.9, '#a49468') + haze(c, 152);
      o += ground(c, 148, '#c8a262', '#9a7440');
      o += road(c, 150, 20, 100, '#dcbc84', 0.45);
      o += grass(143, 150, 238, '#7a5a26', 90, 0.6, 1.8, 1.1) + cracks(145, 180, 238, '#7a5a30', 10) + pebbles(147, 160, 236, '#6a4a2a', 16);
      o += thornMound(c, 206, 154, 0.8, 21);
      o += quilHut(c, 146, 160, 0.72, '#7a5a40') + quilHut(c, 268, 158, 0.78, '#6a4a34');
      o += thornMound(c, 56, 170, 1.25, 31) + thornMound(c, 352, 168, 1.3, 41);
      o += boneTotem(c, 112, 190, 66, 1) + boneTotem(c, 296, 186, 60, 0.9);
      o += bramble(c, [-12, 246], [6, 222], [30, 206], [62, 204], 7, '#4e3222', '#e4d4a8', 51) + bramble(c, [412, 244], [396, 220], [372, 208], [342, 210], 7, '#4e3222', '#e4d4a8', 53);
      o += bone(170, 212, 14, 0.4, 1) + bone(246, 222, 12, -0.6, 1) + skull(c, 222, 200, 0.8);
      return o + vignette(c, '#fff0d8', '#1a0c06');
    },
    thorn_hill: function (c) {
      var o = sky(c, '#4a5266', '#8a8a8c', '#d4c49a');
      o += C(300, 70, 80, glow(c, '#cfe4ff', 0.3));
      o += stormcloud(c, 50, 36, 1.4, '#565a6c') + stormcloud(c, 170, 26, 1.6, '#4c5064') + stormcloud(c, 300, 30, 1.7, '#464a5e') + stormcloud(c, 392, 50, 1.2, '#5a5e70') + stormcloud(c, 230, 58, 0.8, '#62667a');
      o += bolt(310, 50, 1.2);
      o += L('M40,74 l-6,14 M110,70 l-6,14 M180,80 l-6,14 M360,78 l-6,14 M390,96 l-6,14 M20,100 l-6,14', '#d0d8e4', 1.2, 0.4);
      o += hills(c, 151, 150, 8, '#b8b08c', 60) + haze(c, 152);
      // the rocky hill, strangled by giant brambles
      var hc = '#a4825a';
      o += body(c, 'M96,160 C110,130 130,104 156,88 C170,78 186,72 206,72 C230,72 252,80 270,94 C296,112 314,136 330,160 Z', hc,
        F('M232,74 C258,82 290,106 310,132 L334,162 L262,162 C262,130 252,100 232,74 Z', dk(hc, 0.28), 0.85) + L('M130,120 Q200,112 300,122 M114,144 Q200,136 320,148 M156,96 Q210,90 262,98', dk(hc, 0.22), 1.6, 0.7) +
        F('M150,94 C168,80 188,74 206,74 C188,82 172,94 162,110 Z', lt(hc, 0.2), 0.6), 2.2);
      o += rock(c, 150, 118, 26, 16, '#948060') + rock(c, 276, 130, 30, 16, '#948060') + rock(c, 208, 80, 22, 12, '#948060');
      o += bramble(c, [104, 160], [120, 112], [168, 84], [200, 92], 6, '#5a4a2e', null, 61) + bramble(c, [326, 160], [304, 110], [256, 82], [220, 94], 6, '#524228', null, 63) + bramble(c, [140, 158], [150, 126], [200, 130], [222, 148], 5, '#5a4a2e', null, 65) +
        bramble(c, [300, 160], [290, 130], [256, 126], [240, 140], 5, '#524228', null, 67) + bramble(c, [176, 128], [168, 108], [150, 104], [138, 110], 4, '#5a4a2e', null, 69) + bramble(c, [262, 128], [272, 104], [292, 108], [300, 118], 4, '#524228', null, 75);
      o += kolkarTent(c, 178, 110, 0.45, '#bca070') + kolkarTent(c, 238, 116, 0.42) + kolkarTotem(c, 208, 104, 34, 0.55);
      o += ground(c, 150, '#ccb06a', '#a4864a');
      o += grass(153, 152, 238, DRY, 100, 0.6, 1.8, 1.1) + grass(155, 154, 238, DRYL, 40, 0.6, 1.6, 1) + cracks(157, 186, 238, CRACK, 10) + pebbles(159, 166, 236, '#7a5a34', 14);
      o += kolkarTent(c, 54, 168, 0.95) + kolkarTent(c, 356, 166, 1, '#b89868');
      o += kolkarTotem(c, 124, 186, 66, 1) + kolkarTotem(c, 292, 182, 62, 0.95);
      o += campfire(c, 208, 180, 0.7);
      o += bramble(c, [-12, 244], [6, 220], [30, 206], [60, 204], 7, '#5a4a2e', null, 71) + bramble(c, [412, 242], [396, 218], [372, 206], [344, 208], 7, '#524228', null, 73);
      o += tufts(c, [[160, 234, 0.8], [256, 238, 0.9]], TUFT);
      return o + vignette(c, '#dde6f4', '#141008');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  function hoofDot(x, y, col) { return E(x, y, 3.6, 3, col || '#2a1e18', 1.6); }
  // crude weapons drawn upright at the origin, then placed at the grip
  function place(s, p, ang, sc) { return G(s, 'translate(' + n(p[0]) + ',' + n(p[1]) + ') rotate(' + n(ang) + ')' + (sc && sc !== 1 ? ' scale(' + n(sc) + ')' : '')); }
  function club(c, p, ang, sc) {
    var s = P('M-2.6,8 L-2.6,-20 L2.6,-20 L2.6,8 Z', c.cel('#6a4424'), 1.8) + L('M-2.6,-4 L2.6,-2 M-2.6,1 L2.6,3', '#3a2a1a', 1.2);
    [[-7, -28, -1], [-8, -38, -1], [7, -32, 1], [7, -42, 1], [0, -50, 0]].forEach(function (k) {
      var bx = k[0], by = k[1], d = k[2];
      s += P(d ? pd([[bx - d * 1, by - 2.4], [bx + d * 6, by - 1], [bx - d * 1, by + 2.4]], true) : pd([[-2.4, by + 2], [0, by - 5], [2.4, by + 2]], true), c.cel('#d0ccc4'), 1.3);
    });
    s += body(c, 'M-4,-18 C-7,-26 -9,-36 -7,-44 C-5,-51 5,-51 7,-44 C9,-36 7,-26 4,-18 Z', '#8a5a32', F('M1,-52 L10,-52 L10,-16 L3,-16 C6,-28 5,-40 1,-52 Z', dk('#8a5a32', 0.3), 0.8) + E(-3, -34, 1.6, 2.4, dk('#8a5a32', 0.45)) + E(2, -26, 1.4, 2, dk('#8a5a32', 0.45)), 1.9);
    return place(s, p, ang, sc);
  }
  function bigAxe(c, p, ang, sc, flip, grip) {
    var s = limb('M0,26 L0,-58', '#5a3a22', 3.8) + L('M0,26 L0,-58', '#8a6040', 1, 0.6);
    s += body(c, 'M-2,-60 C-14,-72 -32,-66 -36,-44 C-30,-49 -18,-48 -2,-38 Z', '#b8bcc0', F('M-36,-44 C-30,-49 -18,-48 -2,-38 L-2,-46 C-16,-52 -28,-52 -36,-44 Z', '#7a7e84', 0.9) + L('M-33,-50 C-30,-60 -20,-66 -10,-64', '#f4f6f8', 1.2, 0.8), 2);
    s += P('M2,-58 C10,-62 16,-56 16,-48 C12,-50 8,-48 2,-42 Z', c.cel('#a0a4aa'), 1.6);
    s += R(-3.4, -62, 6.8, 26, c.cel('#6a4a2a'), 1.4) + L('M-3.4,-54 L3.4,-50 M-3.4,-46 L3.4,-42', '#c8a060', 1.4);
    s += P('M0,-58 L-2,-70 L2,-70 Z', c.cel('#e8e0c8'), 1.2) + L('M3,-40 L6,-26', '#3a2a1a', 1) + P('M6,-28 L3,-16 L9,-18 Z', '#c83a2a', 1);
    if (grip) s = G(s, 'translate(0,' + n(grip) + ')');
    if (flip) s = G(s, 'scale(-1,1)');
    return place(s, p, ang, sc);
  }
  function whip(c, p) {
    var h0 = [p[0] + 3, p[1] + 5], h1 = [p[0] - 5, p[1] - 9];
    var lash = 'M' + pt(h1) + 'C' + pt([h1[0] - 14, h1[1] - 12]) + ' ' + pt([h1[0] - 20, h1[1] + 10]) + ' ' + pt([h1[0] - 10, h1[1] + 26]) + 'C' + pt([h1[0] - 4, h1[1] + 36]) + ' ' + pt([h1[0] - 12, h1[1] + 48]) + ' ' + pt([h1[0] - 16, h1[1] + 52]);
    return L(lash, OL, 3.6) + L(lash, '#8a5a32', 1.6) + limb('M' + pt(h0) + 'L' + pt(h1), '#4a2e1c', 3) + R(h1[0] - 2, h1[1] - 2, 4, 4, '#c8a060', 1);
  }
  function bolas(c, p) {
    var b = [[p[0] - 7, p[1] + 20], [p[0] + 2, p[1] + 24], [p[0] + 9, p[1] + 17]], cords = '';
    b.forEach(function (q) { cords += 'M' + pt([p[0], p[1] + 2]) + 'L' + pt(q); });
    return L(cords, '#3a2a1a', 1.3) + b.map(function (q) { return C(q[0], q[1], 3.4, c.cel('#8a8478'), 1.5); }).join('');
  }
  function centaurHead(c, x, y, o) {
    var sk = o.skin, hair = o.hair, s = '';
    s += body(c, 'M' + pt([x + 2, y - 13]) + 'C' + pt([x + 15, y - 15]) + ' ' + pt([x + 21, y - 2]) + ' ' + pt([x + 19, y + 12]) + 'C' + pt([x + 22, y + 24]) + ' ' + pt([x + 24, y + 34]) + ' ' + pt([x + 18, y + 44]) + 'C' + pt([x + 15, y + 34]) + ' ' + pt([x + 10, y + 26]) + ' ' + pt([x + 5, y + 16]) + 'Z', hair,
      L('M' + pt([x + 12, y - 8]) + 'C' + pt([x + 16, y + 6]) + ' ' + pt([x + 16, y + 20]) + ' ' + pt([x + 20, y + 34]) + 'M' + pt([x + 8, y]) + 'C' + pt([x + 10, y + 12]) + ' ' + pt([x + 12, y + 22]) + ' ' + pt([x + 14, y + 30]), lt(hair, 0.22), 1.2), 2);
    if (o.feather) s += feathers(x + 16, y + 6, o.feather, 0.7, 0.2);
    s += P(pd([[x + 4, y - 3], [x + 17, y - 10], [x + 8, y + 4]], true), c.cel(sk), 1.6);
    var d = 'M' + pt([x + 8, y - 8]) + 'C' + pt([x + 6, y - 14]) + ' ' + pt([x - 6, y - 15]) + ' ' + pt([x - 9, y - 8]) + 'L' + pt([x - 11, y - 2]) + 'L' + pt([x - 15, y + 4]) + 'L' + pt([x - 10, y + 6]) + 'L' + pt([x - 10, y + 9]) + 'C' + pt([x - 8, y + 14]) + ' ' + pt([x - 2, y + 16]) + ' ' + pt([x + 4, y + 13]) + 'C' + pt([x + 8, y + 8]) + ' ' + pt([x + 9, y]) + ' ' + pt([x + 8, y - 8]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 1, y - 16]) + 'L' + pt([x + 12, y - 16]) + 'L' + pt([x + 12, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 4, y + 8]) + ' ' + pt([x + 4, y - 4]) + ' ' + pt([x + 1, y - 16]) + 'Z', dk(sk, 0.25), 0.8) +
      (o.paint ? L('M' + pt([x - 8, y + 1]) + 'L' + pt([x + 3, y + 2]) + 'M' + pt([x - 7, y + 7]) + 'L' + pt([x + 2, y + 7]), o.paint, 1.8) : ''), 2);
    if (o.beard) s += P('M' + pt([x - 9, y + 9]) + 'C' + pt([x - 10, y + 16]) + ' ' + pt([x - 7, y + 24]) + ' ' + pt([x - 2, y + 26]) + 'C' + pt([x, y + 20]) + ' ' + pt([x + 3, y + 16]) + ' ' + pt([x + 5, y + 12]) + 'C' + pt([x, y + 15]) + ' ' + pt([x - 5, y + 13]) + ' ' + pt([x - 9, y + 9]) + 'Z', c.cel(hair), 1.5);
    s += P('M' + pt([x - 10, y - 7]) + 'C' + pt([x - 8, y - 17]) + ' ' + pt([x + 6, y - 19]) + ' ' + pt([x + 11, y - 10]) + 'L' + pt([x + 7, y - 8]) + 'L' + pt([x + 3, y - 12]) + 'L' + pt([x - 1, y - 8]) + 'L' + pt([x - 5, y - 11]) + 'Z', c.cel(hair), 1.6);
    s += L('M' + pt([x - 10, y - 5]) + 'L' + pt([x - 1, y - 3]), OL, 2.6) + C(x - 5, y - 0.8, 1.7, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 10, y + 10]) + 'L' + pt([x - 4, y + 10.5]), OL, 1.4);
    if (o.headdress) s += o.headdress(c, x, y);
    return s;
  }
  // ---- centaur rig (horse body, humanoid torso, facing left) ----
  function centaur(c, o) {
    var fur = o.fur, sk = o.skin, hair = o.hair, dfur = dk(fur, 0.24), hf = '#2a1e18', s = shadow(c, 74, 48);
    s += limb('M104,86 L112,100 L106,116', dfur, 8) + hoofs(106, 122, hf) + limb('M58,88 L54,104 L56,116', dfur, 8) + hoofs(56, 122, hf);
    s += body(c, 'M110,64 C124,66 128,84 124,106 C120,98 116,90 108,82 Z', hair, L('M114,70 C120,78 122,90 122,100 M112,76 C116,82 118,90 118,96', lt(hair, 0.22), 1.1), 2);
    var bd = 'M46,70 C50,58 74,56 98,58 C112,60 118,70 116,82 C113,94 98,96 80,95 C64,96 52,94 47,86 C44,80 44,75 46,70 Z';
    s += body(c, bd, fur, F('M36,86 C56,98 96,98 122,84 L122,104 L36,104 Z', dk(fur, 0.28), 0.85) + F('M60,60 C78,56 100,58 110,66 C92,62 76,62 60,64 Z', lt(fur, 0.22), 0.6) + (o.bodyMark ? o.bodyMark(c) : ''));
    if (o.back) s += o.back(c);
    s += limb('M96,86 L100,102 L98,116', fur, 9) + hoofs(98, 122, hf) + limb('M52,86 L46,102 L48,116', fur, 9) + hoofs(48, 122, hf);
    var u = '', far = o.far || [[58, 40], [66, 54], [66, 66]];
    u += limb(pd(far.slice(0, 2)), dk(sk, 0.1), 8) + limb(pd(far.slice(1)), dk(sk, 0.1), 7);
    if (o.wFar) u += o.wFar(c, far[2]);
    u += hand(far[2], c.cel(dk(sk, 0.1)));
    var td = 'M38,40 C40,31 58,29 62,38 L64,56 C66,66 62,72 56,76 L42,76 C38,68 36,52 38,40 Z';
    u += body(c, td, sk, F('M52,28 L70,28 L70,80 L54,80 C60,66 58,46 52,28 Z', dk(sk, 0.25), 0.8) + L('M41,50 Q47,54 53,50', dk(sk, 0.3), 1.2) + L('M44,60 L53,60 M45,66 L53,66', dk(sk, 0.25), 1) +
      (o.paint ? L('M42,44 L50,46 M42,48 L49,50', o.paint, 1.8) : '') + (o.chest ? o.chest(c) : ''));
    u += P('M37,70 L41,65 L44,71 L48,65 L51,71 L55,65 L58,71 L62,65 L65,71 L64,80 L38,80 Z', c.cel(fur), 1.8);
    if (o.belt) u += P('M38,70 L64,70 L64,75 L38,75 Z', c.cel(o.belt), 1.6) + R(46, 69, 6, 7, o.buckle || '#c8a060', 1.3);
    if (o.pads) u += o.pads(c);
    u += centaurHead(c, 46, 22, o);
    var near = o.near || [[40, 40], [32, 54], [26, 64]];
    if (o.wNear) u += o.wNear(c, near[2]);
    u += limb(pd(near.slice(0, 2)), sk, 8.5) + limb(pd(near.slice(1)), sk, 7.5);
    u += hand(near[2], c.cel(sk));
    if (o.wNearFront) u += o.wNearFront(c, near[2]);
    if (o.top) u += o.top(c);
    s += o.dy ? G(u, 'translate(0,' + n(o.dy) + ')') : u;
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- zhevra (striped antelope, mid-gallop, facing left) ----
  function zhevra(c, o) {
    var col = o.col, st = o.stripe, mane = o.mane, hc = o.horn || '#e0d4b4', s = shadow(c, 66, 42), legF = dk(col, 0.18), leg = col;
    s += limb('M56,78 L44,92 L50,102', legF, 5.5) + hoofDot(51, 104) + limb('M100,76 L112,90 L120,96', legF, 5.5) + hoofDot(121, 97);
    s += body(c, 'M106,62 C114,60 120,64 120,72 C116,70 112,70 108,70 Z', mane, '', 1.6);
    var bd = 'M42,64 C46,52 70,50 92,54 C106,56 112,66 108,76 C104,86 88,88 72,86 C58,86 48,82 44,76 C42,72 41,68 42,64 Z';
    var sd = '';
    for (var x = 54; x <= 106; x += 8) sd += 'M' + x + ',48 Q' + (x - 5) + ',68 ' + (x + 2) + ',92';
    s += body(c, bd, col, L(sd, st, o.sw || 3.4) + F('M36,80 C56,90 92,90 114,78 L114,96 L36,96 Z', o.belly || lt(col, 0.3), 0.9) + F('M60,54 C78,50 98,52 106,60 C90,56 76,56 60,58 Z', lt(col, 0.3), 0.5));
    // neck with stripes
    var nk = 'M44,72 C40,60 34,48 28,38 L40,30 C46,42 54,52 62,58 Z';
    s += body(c, nk, col, L('M30,46 L42,38 M34,54 L46,46 M38,62 L52,54 M42,70 L58,60', st, o.sw || 3.2) + F('M26,40 L34,36 C38,48 42,60 46,72 L40,74 Z', o.belly || lt(col, 0.3), 0.6));
    // mane
    if (o.longMane) {
      s += body(c, 'M36,28 C44,26 54,34 60,46 C66,56 74,60 80,62 C70,66 60,62 54,56 C48,50 42,40 36,34 Z', mane, L('M42,32 C50,40 56,50 70,60 M40,36 C46,44 52,52 62,58', dk(mane, 0.18), 1.1), 1.8);
    } else {
      var md = 'M38,30';
      for (var k = 0; k <= 7; k++) { var t = k / 7, bx = 38 + t * 22, by = 30 + t * 26; md += 'L' + pt([bx + 5, by - 5]) + 'L' + pt([bx + 3, by + 3]); }
      md += 'L62,58 L46,42 Z';
      s += P(md, c.cel(mane), 1.6);
    }
    // near legs: front reaching forward, back planted
    s += limb('M50,78 L38,88 L24,92', leg, 6) + hoofDot(22, 93);
    s += limb('M96,80 L94,98 L90,116', leg, 6.5) + L('M92,102 L90,112', lt(col, 0.4), 2.4) + hoofs(90, 122, '#2a1e18');
    s += L('M40,86 L30,90', st, 2) + L('M95,88 L94,96', st, 2.2);
    // horns sweeping back
    var hl = o.hornLen || 1;
    [[0, dk(hc, 0.12)], [4, hc]].forEach(function (h) {
      var bx = 32 + h[0], by = 26, tx = bx + 16 * hl, ty = by - 22 * hl;
      s += P('M' + pt([bx - 3, by + 2]) + 'C' + pt([bx - 4, by - 10 * hl]) + ' ' + pt([bx + 4 * hl, by - 20 * hl]) + ' ' + pt([tx, ty]) + 'C' + pt([bx + 6 * hl, by - 14 * hl]) + ' ' + pt([bx + 3, by - 6]) + ' ' + pt([bx + 3, by + 1]) + 'Z', c.cel(h[1]), 1.6) +
        L('M' + pt([bx - 3, by - 4]) + 'L' + pt([bx + 2, by - 3]) + 'M' + pt([bx - 2, by - 9 * hl]) + 'L' + pt([bx + 3, by - 8 * hl]), dk(h[1], 0.35), 1);
    });
    // head
    var hd = 'M38,24 C32,20 22,22 18,28 L8,40 C5,44 7,49 12,49 L18,47 C24,45 34,40 40,32 Z';
    s += body(c, hd, col, F('M28,18 L44,18 L44,40 L32,40 C36,34 34,26 28,18 Z', dk(col, 0.22), 0.8) + L('M22,28 L30,34 M16,34 L22,40', st, 2.4) + F('M5,42 C8,46 12,48 18,47 L20,52 L4,52 Z', dk(st, 0.1), 0.9));
    s += P('M36,22 L48,18 L42,28 Z', c.cel(col), 1.6) + P('M39,23 L45,20 L42,26 Z', '#8a5a4a', 0);
    s += E(8.5, 43, 1.4, 1, OL) + L('M17,30 L25,31', OL, 1.8) + C(22, 33, 1.8, o.eye || '#2a1a10', 1) + (o.eyeGlow ? C(22, 33, 5, glow(c, o.eyeGlow, 0.7)) + C(22, 33, 1.2, o.eyeGlow) : C(21.4, 32.4, 0.6, '#fff'));
    s += L('M8,47 L16,46', OL, 1.2);
    return s;
  }
  // ---- lean lioness, crouched to pounce (facing left) ----
  function lioness(c, o) {
    var col = o.col, bel = o.belly || '#f0dcb0', dcol = dk(col, 0.22), s = shadow(c, 64, 54);
    s += limb('M50,90 L40,104 L30,116', dcol, 8) + paw(30, 121, dk(col, 0.4)) + limb('M100,84 L114,98 L104,114', dcol, 9) + paw(104, 121, dk(col, 0.4));
    s += L('M110,76 C122,82 126,98 120,110', OL, 7) + L('M110,76 C122,82 126,98 120,110', col, 3.6) + P('M117,106 C118,112 124,116 126,112 C126,106 124,104 121,104 Z', c.cel(dk(col, 0.55)), 1.5);
    var bd = 'M36,84 C38,72 50,64 62,68 C76,64 98,62 110,70 C118,76 118,88 110,94 C102,98 88,92 74,94 C58,97 42,95 36,88 Z';
    s += body(c, bd, col, F('M28,90 C52,102 92,102 122,90 L122,106 L28,106 Z', bel, 0.9) + F('M64,64 C82,62 100,62 110,68 C94,66 80,66 64,70 Z', lt(col, 0.2), 0.55) + F('M88,62 C100,62 112,66 116,76 L116,82 C108,72 98,68 86,68 Z', dk(col, 0.18), 0.6) +
      L('M72,74 C76,80 76,86 74,92 M84,72 C88,80 88,86 86,92', dk(col, 0.2), 1.3, 0.8));
    // shoulder blade hump
    s += P('M46,76 C48,66 58,62 66,68 C60,70 54,74 52,80 Z', c.cel(col), 1.8);
    var hd = 'M44,80 C42,70 32,66 22,68 C14,70 10,74 8,78 C4,80 2,86 4,90 C6,95 12,97 18,96 C26,99 38,96 43,90 C46,87 46,84 44,80 Z';
    s += P('M24,72 C20,62 28,58 32,64 Z', c.cel(dk(col, 0.1)), 1.8);
    s += body(c, hd, col, F('M32,64 L52,64 L52,100 L38,100 C44,90 42,76 32,64 Z', dk(col, 0.25), 0.7) + F('M4,90 C10,96 20,99 32,97 L32,104 L2,104 Z', bel, 0.9) + L('M8,79 C14,75 22,74 30,76', dk(col, 0.2), 1.2, 0.8));
    s += P('M32,70 C31,58 42,57 44,68 Z', c.cel(col), 1.8) + P('M35,68 C35,62 40,62 41,67 Z', '#5a3020', 0);
    s += P('M3,86 C3,80 10,78 15,81 C18,84 17,90 13,92 C8,94 3,91 3,86 Z', bel, 1.4) + P('M2,81 L8,79.6 L6.6,84.6 Z', '#3a2014', 1.2);
    s += L('M5,91 Q10,94 16,91', OL, 1.4) + P('M8,91.6 L9,96 L10.6,92 Z', '#fff', 0.8) + P('M13,92 L14,96 L15.4,91.6 Z', '#fff', 0.8);
    s += L('M12,75 L24,76.5', OL, 2.4) + E(18.5, 78.6, 3, 2.1, o.eye || '#f0c030', 1) + E(17.8, 78.6, 0.8, 1.6, OL) + L('M16,81 L12,85', dk(col, 0.55), 1.2);
    s += limb('M46,90 L40,104 L24,116', col, 9.5) + paw(24, 121, dk(col, 0.4)) + limb('M92,88 L104,102 L92,116', col, 10.5) + paw(92, 121, dk(col, 0.4));
    return s;
  }
  // ---- small bipedal raptor (facing left) ----
  function raptor(c, o) {
    var col = o.col, st = o.stripe, bel = o.belly, dcol = dk(col, 0.22), s = shadow(c, 62, 36);
    s += E(80, 80, 9, 10, c.cel(dcol), 2) + limb('M80,84 L90,98 L80,110 L82,116', dcol, 5.5) + birdFoot(82, 121, dk(col, 0.4));
    var tl = 'M80,60 C96,56 110,50 118,36 C122,30 126,30 126,34 C124,44 112,62 100,72 C94,76 88,80 82,82 Z';
    s += body(c, tl, col, L('M92,56 L98,68 M102,52 L108,62 M110,46 L116,54', st, 3) + F('M84,80 C96,74 110,62 120,44 L128,50 L128,86 L84,86 Z', dk(col, 0.25), 0.7));
    s += L('M125,32 C127,26 124,20 118,20', OL, 3.4) + L('M125,32 C127,26 124,20 118,20', col, 1.4);
    var bd = 'M40,62 C44,52 60,48 76,52 C88,56 92,68 86,78 C80,86 62,88 52,84 C44,80 40,72 40,62 Z';
    s += body(c, bd, col, L('M56,50 L52,62 M66,50 L62,64 M76,52 L72,66 M84,58 L80,70', st, 3.2) + F('M36,72 C48,84 72,88 92,76 L92,92 L36,92 Z', bel, 0.9));
    var nk = 'M46,66 C40,58 36,52 32,44 L44,38 C46,46 52,52 58,56 Z';
    s += body(c, nk, col, L('M36,48 L44,44 M40,56 L48,50', st, 2.6) + F('M30,46 L36,44 C40,54 44,60 48,66 L44,68 Z', bel, 0.8));
    // crest frill
    s += P('M40,30 L50,20 L48,30 L58,26 L52,36 L60,38 L46,40 Z', c.cel(o.crest || '#c83a2a'), 1.5);
    var hd = 'M42,32 C36,28 24,28 16,34 L6,40 C3,42 4,46 7,47 L18,48 C22,52 30,52 36,50 C42,48 46,42 42,32 Z';
    s += body(c, hd, col, F('M34,24 L50,24 L50,54 L38,54 C44,44 42,34 34,24 Z', dk(col, 0.22), 0.8) + L('M22,32 L28,38 M30,30 L34,36', st, 2.2) + F('M6,45 C12,48 22,50 34,50 L34,56 L4,56 Z', bel, 0.9));
    s += P('M8,46 L18,47 C22,50 28,51 32,50 L30,54 C22,56 12,54 8,50 Z', '#5a1a14', 1.3) + P('M10,46.5 L11,49.5 L12.5,46.8 Z M15,47 L16,50 L17.5,47.2 Z M20,47.6 L21.6,50.6 L22.8,48 Z', '#fff', 0.6);
    s += L('M18,34 L27,35.5', OL, 2.2) + E(23, 37.4, 2.2, 1.7, o.eye || '#ffe040', 1) + E(22.6, 37.4, 0.6, 1.3, OL) + E(6.5, 41.6, 1, 0.8, OL);
    // little clawed arms
    s += limb('M50,66 L40,74 L34,72', col, 3.6) + L('M34,72 L29,70 M34,72 L30,75 M35,73 L32,78', OL, 1.6);
    s += E(64, 76, 11, 11, c.cel(col), 2) + L('M58,70 L66,82 M64,68 L70,78', st, 2.4);
    s += limb('M64,82 L72,98 L60,110 L62,116', col, 6) + birdFoot(62, 121, dk(col, 0.35), true) + P('M58,118 C52,112 54,106 58,106 C58,110 60,114 62,116 Z', c.cel('#f4ecd6'), 1.2);
    return s;
  }
  // ---- snapping turtle with a mossy spiked shell ----
  function turtle(c, o) {
    var sh = o.shell, sk = o.skin, moss = o.moss, s = shadow(c, 70, 56), dsk = dk(sk, 0.22);
    var foot = function (x, cc) { return P('M' + n(x - 7) + ',115 L' + n(x + 6) + ',115 L' + n(x + 7) + ',122 L' + n(x - 9) + ',122 Z', c.cel(cc), 1.8) + L('M' + n(x - 8) + ',122 l-3,1 M' + n(x - 4) + ',122 l-2,1.6 M' + n(x) + ',122 l-2,1.6', OL, 1.6); };
    s += limb('M50,98 L46,116', dsk, 11) + foot(46, dsk) + limb('M104,98 L110,116', dsk, 11) + foot(110, dsk);
    s += P('M114,100 L126,104 L114,108 Z', c.cel(sk), 1.6);
    var dome = 'M28,102 C28,70 50,44 78,44 C106,44 124,68 124,102 Z';
    var sc = L('M52,52 L60,74 L50,100 M78,44 L78,74 M104,52 L96,74 L106,100 M60,74 L96,74 M36,80 L60,74 M96,74 L120,82 M78,74 L78,102', dk(sh, 0.35), 1.8);
    s += body(c, dome, sh, sc + F('M90,42 C112,50 126,72 126,104 L100,104 C104,82 100,60 90,42 Z', dk(sh, 0.28), 0.8) +
      F('M44,60 C54,48 70,44 82,46 C72,50 60,52 52,64 Z', lt(sh, 0.25), 0.6) + E(70, 52, 12, 5, moss, 0, 0.95) + E(46, 70, 8, 5, moss, 0, 0.9) + E(100, 60, 9, 4, moss, 0, 0.9) + E(88, 86, 7, 4, moss, 0, 0.7) + E(58, 90, 6, 3, moss, 0, 0.7), 2.4);
    [[64, 50, -0.35], [78, 44, 0], [94, 50, 0.35], [44, 72, -0.9], [112, 72, 0.9], [78, 70, 0], [60, 74, -0.4], [96, 74, 0.4]].forEach(function (k) {
      var a = k[2] - Math.PI / 2, L0 = 12, bx = k[0], by = k[1] + 3, px = -Math.sin(a) * 4, py = Math.cos(a) * 4;
      s += P(pd([[bx + px, by + py], [bx + Math.cos(a) * L0, by + Math.sin(a) * L0], [bx - px, by - py]], true), c.cel(o.spike || '#d8ccaa'), 1.4);
    });
    s += body(c, 'M24,100 C44,108 108,108 128,100 L126,108 C108,114 44,114 26,108 Z', o.rim || '#c8b27a', L('M40,104 L42,110 M56,106 L57,112 M72,107 L72,113 M88,107 L88,113 M104,106 L103,112', dk(o.rim || '#c8b27a', 0.35), 1.2), 2);
    // neck + snapping head
    s += limb('M40,96 C32,92 28,88 24,86', sk, 13);
    var hd = 'M30,78 C24,74 12,74 6,80 L2,86 C2,88 4,90 6,90 L10,90 L14,88 C20,92 28,94 32,90 C36,86 36,82 30,78 Z';
    s += body(c, hd, sk, F('M20,70 L38,70 L38,96 L26,96 C32,88 30,78 20,70 Z', dsk, 0.7) + L('M14,78 l3,2 M22,76 l2,3', dsk, 1.2), 2);
    s += P('M6,90 L14,88 C18,92 24,96 30,94 C26,100 16,102 8,98 C5,96 5,92 6,90 Z', c.cel(lt(sk, 0.1)), 1.8);
    s += P('M2,86 L8,86 L6,92 Z', c.cel('#e8dcb0'), 1.2) + P('M8,98 L10,93 L13,98 Z', c.cel('#e8dcb0'), 1);
    s += L('M12,78 L21,79', OL, 2.2) + C(17, 81, 2, o.eye || '#ff8a2a', 1) + C(16.6, 81, 0.8, OL) + C(5, 81, 0.8, OL);
    s += limb('M40,100 L34,116', sk, 12) + foot(34, sk) + limb('M92,102 L96,116', sk, 12) + foot(96, sk);
    return s;
  }
  function warBonnet(c, x, y) {
    var s = '', cols = ['#f4efe0', '#f4efe0', '#f4efe0', '#f4efe0', '#f4efe0', '#f4efe0'];
    [[-8, -12, -1.75], [-3, -15, -1.45], [3, -16, -1.15], [8, -14, -0.85], [12, -10, -0.55], [15, -4, -0.25]].forEach(function (f, i) {
      var a = f[2], bx = x + f[0], by = y + f[1], len = 14, ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len, px = -Math.sin(a) * 3.2, py = Math.cos(a) * 3.2;
      var d = 'M' + pt([bx, by]) + 'Q' + pt([bx + Math.cos(a) * len * 0.5 + px, by + Math.sin(a) * len * 0.5 + py]) + ' ' + pt([ex, ey]) + 'Q' + pt([bx + Math.cos(a) * len * 0.5 - px, by + Math.sin(a) * len * 0.5 - py]) + ' ' + pt([bx, by]) + 'Z';
      s += P(d, cols[i], 1.3) + F('M' + pt([bx + Math.cos(a) * len * 0.7 + px * 0.7, by + Math.sin(a) * len * 0.7 + py * 0.7]) + 'L' + pt([ex, ey]) + 'L' + pt([bx + Math.cos(a) * len * 0.7 - px * 0.7, by + Math.sin(a) * len * 0.7 - py * 0.7]) + 'Z', '#c8302a');
    });
    s += limb('M' + pt([x - 10, y - 8]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 12, y - 7]), '#b83a2a', 3.4) + C(x - 9, y - 8, 2.2, '#3a8ac8', 1.2) + C(x + 1, y - 12.6, 1.8, '#e8c040', 1);
    return s;
  }
  function arc(d, w) { return L(d, '#bfe8ff', (w || 1) * 3.4, 0.55) + L(d, '#ffffff', (w || 1) * 1.3); }
  // storm staff: carved pole, bone charms, feathers, crackling blue head
  function stormStaff(c, p) {
    var top = [p[0] - 5, p[1] - 40], bot = [p[0] + 6, p[1] + 34], x = top[0], y = top[1];
    var s = staff(top, bot, '#5a3a22', 3.6);
    s += L('M' + pt([x + 1, y + 14]) + 'L' + pt([x + 6, y + 26]) + 'M' + pt([x + 1, y + 14]) + 'L' + pt([x - 4, y + 24]), '#3a2a1a', 1.1) + bone(x + 6, y + 28, 7, 1.2, 0.6) + feathers(x - 4, y + 23, ['#3a8ac8', '#ece0bc'], 0.6, 0);
    s += P('M' + pt([x - 7, y + 4]) + 'C' + pt([x - 9, y - 4]) + ' ' + pt([x - 4, y - 10]) + ' ' + pt([x, y - 10]) + 'C' + pt([x + 4, y - 10]) + ' ' + pt([x + 9, y - 4]) + ' ' + pt([x + 7, y + 4]) + 'L' + pt([x + 3, y + 8]) + 'L' + pt([x - 3, y + 8]) + 'Z', c.cel('#ece4cc'), 1.6) + C(x - 3, y - 2, 1.5, OL) + C(x + 3, y - 2, 1.5, OL);
    s += P('M' + pt([x - 6, y - 6]) + 'C' + pt([x - 12, y - 10]) + ' ' + pt([x - 14, y - 18]) + ' ' + pt([x - 12, y - 22]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x - 7, y - 12]) + ' ' + pt([x - 3, y - 10]) + 'Z', c.cel('#e0d6bc'), 1.2) +
      P('M' + pt([x + 6, y - 6]) + 'C' + pt([x + 12, y - 10]) + ' ' + pt([x + 14, y - 18]) + ' ' + pt([x + 12, y - 22]) + 'C' + pt([x + 10, y - 16]) + ' ' + pt([x + 7, y - 12]) + ' ' + pt([x + 3, y - 10]) + 'Z', c.cel('#e0d6bc'), 1.2);
    s += orb(c, x, y - 18, 4.4, '#7fd0ff');
    s += arc('M' + pt([x, y - 18]) + 'L' + pt([x - 8, y - 26]) + 'L' + pt([x - 5, y - 30]) + 'L' + pt([x - 14, y - 38])) + arc('M' + pt([x, y - 18]) + 'L' + pt([x + 7, y - 24]) + 'L' + pt([x + 5, y - 29]) + 'L' + pt([x + 13, y - 34]), 0.9) + arc('M' + pt([x - 2, y - 18]) + 'L' + pt([x - 12, y - 16]) + 'L' + pt([x - 14, y - 20]) + 'L' + pt([x - 22, y - 18]), 0.8);
    return s;
  }
  // ---- thunder lizard (Durotar family, heavier) ----
  function thunderLizard(c, o) {
    var col = o.col, dcol = dk(col, 0.3), pl = o.plate, s = shadow(c, 64, 56), ft = '#22242e';
    s += limb('M58,92 L62,106 L58,116', dk(col, 0.25), 11) + paw(58, 121, ft) + limb('M100,90 L108,104 L104,116', dk(col, 0.25), 11) + paw(104, 121, ft);
    s += body(c, 'M102,74 C116,72 126,82 127,96 C127,102 124,106 120,102 C118,94 112,90 100,94 Z', col, F('M104,90 C112,88 118,92 120,100 L128,106 L100,106 Z', dcol, 0.8) + L('M110,78 L112,86 M118,84 L118,92', dcol, 1.4));
    var bd = 'M34,74 C38,58 64,52 88,56 C108,58 116,72 112,86 C108,98 90,101 72,100 C54,101 38,97 34,88 Z';
    s += body(c, bd, col, F('M28,88 C52,103 92,103 118,88 L118,106 L28,106 Z', dcol, 0.85) + F('M40,90 C56,99 84,99 106,90 L106,96 C84,103 56,103 40,96 Z', o.belly || '#c8ccc0', 0.7) +
      L('M60,60 L62,72 M72,58 L74,72 M84,58 L86,72 M96,62 L98,74', dcol, 1.6) + F('M46,62 C60,54 84,52 102,60 C84,58 64,60 48,68 Z', lt(col, 0.25), 0.6));
    var tips = [];
    [[50, 60, 11], [62, 55, 14], [75, 53, 16], [88, 55, 14], [101, 61, 10]].forEach(function (g) {
      s += P('M' + (g[0] - 6) + ',' + (g[1] + 4) + ' C' + (g[0] - 4) + ',' + (g[1] - g[2] * 0.5) + ' ' + (g[0] - 1) + ',' + (g[1] - g[2] * 0.8) + ' ' + (g[0] + 2) + ',' + (g[1] - g[2]) + ' L' + (g[0] + 6) + ',' + (g[1] + 4) + ' Z', c.cel(pl), 1.7);
      tips.push([g[0] + 2, g[1] - g[2]]);
    });
    var hd = 'M48,62 C38,59 24,63 16,70 L8,76 C4,80 6,89 13,91 L26,93 C38,95 49,89 53,80 C55,72 55,66 48,62 Z';
    s += body(c, hd, col, F('M10,88 C26,95 42,93 55,82 L57,100 L6,100 Z', dcol, 0.85) + F('M18,70 C26,64 36,62 44,62 C36,66 28,68 22,74 Z', lt(col, 0.25), 0.6));
    s += L('M8,85 C18,87 30,87 41,83', OL, 1.6) + P('M14,86 L15,89.4 L16.6,86.4 Z M22,86.6 L23,90 L24.6,86.8 Z', '#f4ecd6', 0.7);
    s += P('M40,62 C40,48 47,38 58,36 C51,44 49,52 48,62 Z', c.cel('#e8dcc0'), 1.8) + P('M30,64 C27,55 31,46 38,43 C36,50 36,57 36,64 Z', c.cel('#d8ccb0'), 1.6) + P('M13,74 L8,62 L20,71 Z', c.cel('#e8dcc0'), 1.4);
    s += L('M20,68 L32,69', OL, 2.4) + C(27, 72, 2.4, o.eye || '#7fd8ff', 1.2) + C(26.4, 71.4, 0.7, '#fff') + E(7, 80, 1.2, 1, OL);
    s += limb('M48,88 L44,104 L44,116', col, 12) + paw(44, 121, ft) + limb('M92,88 L96,104 L94,116', col, 12) + paw(94, 121, ft);
    // lightning crackling between the back horns
    s += C(76, 44, 30, glow(c, '#7fd0ff', 0.4));
    for (var i = 0; i < tips.length - 1; i++) { var a = tips[i], b = tips[i + 1], mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 5 - (i % 2) * 3; s += arc('M' + pt(a) + 'L' + pt([mx - 1, my]) + 'L' + pt([mx + 2, my + 4]) + 'L' + pt(b), 0.8); }
    s += arc('M' + pt([58, 36]) + 'L' + pt([54, 28]) + 'L' + pt([58, 26]) + 'L' + pt([54, 18]), 0.8) + spark(112, 60, 0.8, '#7fd0ff') + spark(30, 44, 0.7, '#9fe0ff');
    return s;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    kolkar_drudge: function (c) {
      return centaur(c, {
        fur: '#a0764c', skin: '#c0906a', hair: '#3a2618', paint: '#ece4cc', feather: ['#ece0bc'],
        back: function (c) { return body(c, 'M70,58 C70,46 90,44 96,52 C102,56 100,64 94,66 L74,66 C70,64 70,62 70,58 Z', '#b89a66', L('M76,54 L92,56 M80,50 L82,64', dk('#b89a66', 0.35), 1.2), 1.8) + L('M68,64 C74,70 92,70 100,64', '#4a3020', 2) + L('M84,44 L86,38', '#4a3020', 1.6); },
        chest: function () { return L('M40,42 L62,70', '#5a3a22', 2.6); },
        belt: '#6a4a2a',
        near: [[40, 40], [32, 54], [28, 64]],
        wNear: function (c, p) { return club(c, p, -14, 0.95); },
        tf: at(0.9, 64, 122)
      });
    },
    kolkar_wrangler: function (c) {
      return centaur(c, {
        fur: '#7a5436', skin: '#b08060', hair: '#24160e', paint: '#c83a2a', feather: ['#c83a2a', '#ece0bc'], eye: '#ffb030',
        bodyMark: function () { return L('M58,62 C60,74 60,86 58,94', '#4a2e1c', 3) + L('M58,62 C60,74 60,86 58,94', '#c8a060', 1) ; },
        back: function (c) { return body(c, 'M66,58 C68,54 90,54 94,58 L96,74 C88,78 72,78 66,74 Z', '#8a3a26', L('M68,66 L94,66', '#ece0bc', 1.6) + F('M70,70 L74,76 L78,70 L82,76 L86,70 L90,76 L94,70 L94,78 L68,78 Z', '#5a2418', 0.9), 1.6) + L('M80,58 C78,48 72,44 64,44 C60,46 60,52 64,54', '#6a4a2a', 2.2); },
        chest: function () { return L('M40,40 L62,70 M60,38 L40,68', '#4a2e1c', 3) + C(50, 54, 2.4, '#c8a060', 1.2); },
        pads: function (c) { return body(c, 'M52,36 C54,28 68,28 70,38 L66,46 L54,44 Z', '#6a4a2a', L('M56,36 L66,38', '#c8a060', 1.2), 1.6) + P('M62,30 L64,22 L67,31 Z', c.cel('#e8dcc0'), 1.2); },
        belt: '#3a2418',
        near: [[40, 40], [30, 30], [24, 20]],
        wNear: function (c, p) { return whip(c, p); },
        far: [[58, 40], [66, 54], [68, 64]],
        wFar: function (c, p) { return bolas(c, p); },
        tf: at(0.95, 64, 122)
      });
    },
    barak_kodobane: function (c) {
      return centaur(c, {
        fur: '#5e4030', skin: '#a87858', hair: '#1e140e', paint: '#d8302a', eye: '#ff5a2a', beard: true,
        headdress: warBonnet,
        bodyMark: function () { return L('M66,64 L74,76 M72,62 L80,74 M100,66 L104,76', '#d8302a', 2.2); },
        back: function (c) { return body(c, 'M64,58 C66,52 94,52 98,58 L98,76 C88,80 72,80 64,76 Z', '#3a2a22', F('M64,66 L98,66 L98,70 L64,70 Z', '#c8302a') + L('M70,72 L74,78 M80,72 L84,78 M90,72 L94,78', '#e8dcc0', 1.4), 1.6) + skull(c, 80, 60, 0.7); },
        chest: function () { return L('M40,54 L50,52 L60,54', '#d8302a', 2); },
        pads: function (c) {
          return body(c, 'M50,36 C52,24 72,24 72,38 L68,48 L52,46 Z', '#ece2c8', L('M56,32 L60,44 M64,30 L66,44', '#b8ac90', 1.2), 1.8) + P('M58,28 C56,18 60,10 66,8 C64,14 64,20 66,28 Z', c.cel('#ece2c8'), 1.4) + P('M66,30 C70,22 76,18 80,20 C76,24 74,28 72,34 Z', c.cel('#e0d6bc'), 1.4) + boneNeck(46, 36);
        },
        belt: '#2a1a12', buckle: '#e8dcc0',
        near: [[40, 40], [32, 54], [28, 64]], dy: 10,
        far: [[58, 40], [70, 46], [78, 40]],
        wFar: function (c, p) { return bigAxe(c, p, 12, 0.82, true, 22); },
        wNear: function (c, p) { return R(p[0] + 1, p[1] - 10, 8, 6, c.cel('#ece2c8'), 1.4); }
      });
    },
    kolkar_stormer: function (c) {
      return centaur(c, {
        fur: '#8a6444', skin: '#b88a66', hair: '#2a1a12', paint: '#5ab0e8', feather: ['#3a8ac8', '#ece0bc', '#c83a2a'], eye: '#9fe0ff',
        back: function (c) { return body(c, 'M66,58 C68,54 90,54 94,58 L96,72 C88,76 72,76 66,72 Z', '#3a5a7a', L('M68,64 L94,64', '#ece0bc', 1.4) + F('M72,68 L76,74 L80,68 L84,74 L88,68 L92,74 L92,76 L70,76 Z', '#23384e', 0.9), 1.6) + C(50, 22, 30, glow(c, '#7fd0ff', 0.2)); },
        pads: function () { return boneNeck(50, 36); },
        chest: function () { return L('M42,56 L48,52 L54,56 M44,62 L48,58 L52,62', '#5ab0e8', 1.8); },
        belt: '#3a2418', buckle: '#ece0bc',
        near: [[40, 40], [32, 54], [28, 62]],
        wNear: function (c, p) { return stormStaff(c, p); },
        far: [[58, 40], [68, 50], [74, 58]],
        wFar: function (c, p) { return C(p[0], p[1], 10, glow(c, '#7fd0ff', 0.6)) + arc('M' + pt([p[0], p[1]]) + 'L' + pt([p[0] + 6, p[1] - 6]) + 'L' + pt([p[0] + 4, p[1] - 10]), 0.7); },
        dy: 4, tf: at(0.95, 64, 122)
      });
    },
    stormsnout: function (c) { return G(thunderLizard(c, { col: '#4e70a6', plate: '#2c3e6a', belly: '#b8c8dc', eye: '#bff0ff' }), 'matrix(1.03,0,0,1.12,' + n(-66 * 0.03) + ',' + n(-122 * 0.12) + ')'); },
    zhevra_runner: function (c) { return G(zhevra(c, { col: '#e2c898', stripe: '#5a3622', mane: '#3a2418', belly: '#f4e8d0', sw: 4.4 }), at(0.96, 64, 122)); },
    swiftmane: function (c) {
      return G(C(52, 62, 60, glow(c, '#dfe8ff', 0.35)) + zhevra(c, { col: '#f6f2ea', stripe: '#1e1418', mane: '#e8eef8', belly: '#ffffff', horn: '#f0e8d0', hornLen: 1.25, longMane: true, eyeGlow: '#7ac8ff', sw: 4 }), at(1.08, 64, 122));
    },
    savannah_prowler: function (c) { return lioness(c, { col: '#c89a5a', belly: '#f0dcb0' }); },
    sunscale_lashtail: function (c) { return G(raptor(c, { col: '#e89a30', stripe: '#8a3a18', belly: '#f6dc98', crest: '#c8302a' }), at(0.92, 64, 122)); },
    oasis_snapjaw: function (c) { return turtle(c, { shell: '#5e6a3a', skin: '#8a8a60', moss: '#86a83e', spike: '#d8ccaa', rim: '#c8b27a' }); },
    razormane_quilboar: function (c) {
      return quilboar(c, {
        skin: '#9c7462', mane: '#2a1a16', tip: '#c8342a', loin: '#5a2a20', paint: '#c8342a', snout: '#c08a7a', eye: '#ff7a2a', belt: '#3a2418',
        chest: function () { return L('M48,60 L56,66 M48,68 L56,74 M72,56 L78,64', '#c8342a', 2.2); },
        pads: function (c) { return body(c, 'M68,54 C68,44 88,42 90,54 Z', '#6a4a3a', L('M72,50 L86,50', '#c8342a', 1.6), 1.8) + P('M74,46 L76,36 L80,46 Z', c.cel('#ece2c8'), 1.3) + P('M82,46 L88,38 L87,50 Z', c.cel('#ece2c8'), 1.3); },
        top: function () { return thornBelt(82); },
        wNear: function (c, p) { var top = [p[0] - 12, p[1] - 62], bot = [p[0] + 10, p[1] + 32]; return staff(top, bot, '#4a2e1c') + spearhead(c, top, bot, 16, '#e0d6bc') + feathers(top[0] + 4, top[1] + 18, ['#c8342a', '#1e1410', '#c8342a'], 0.65, 0.2) + L('M' + pt([top[0] + 1, top[1] + 12]) + 'L' + pt([top[0] + 5, top[1] + 20]), '#c8342a', 3); }
      });
    },
    razormane_thornweaver: function (c) {
      return quilboar(c, {
        skin: '#94705e', mane: '#261a16', tip: '#9ad84a', loin: '#3a4a2a', paint: '#6ad04a', snout: '#b8887a', crown: true, eye: '#b8ff5a',
        back: function (c) { return C(40, 24, 34, glow(c, '#7cff5a', 0.28)); },
        pads: function () { return boneNeck(54, 56); },
        top: function (c) { return thornBelt(82) + feathers(52, 30, ['#c8342a', '#ece0bc', '#3a2a1a'], 0.8, 2.3); },
        wNear: function (c, p) {
          var top = [p[0] - 6, p[1] - 54], bot = [p[0] + 6, p[1] + 32], x = top[0], y = top[1], th = '';
          var vine = 'M' + pt([x + 2, y + 50]) + 'C' + pt([x - 6, y + 40]) + ' ' + pt([x + 8, y + 30]) + ' ' + pt([x, y + 20]) + 'C' + pt([x - 6, y + 12]) + ' ' + pt([x + 6, y + 4]) + ' ' + pt([x, y]);
          [[x - 3, y + 42, -1], [x + 4, y + 33, 1], [x - 3, y + 22, -1], [x + 3, y + 12, 1], [x - 2, y + 5, -1]].forEach(function (k) { th += P(pd([[k[0], k[1] - 2], [k[0] + k[2] * 7, k[1] - 4], [k[0], k[1] + 2]], true), c.cel('#e0d0a8'), 1); });
          var loop = 'M' + pt([x, y]) + 'C' + pt([x - 14, y - 4]) + ' ' + pt([x - 12, y - 24]) + ' ' + pt([x, y - 26]) + 'C' + pt([x + 12, y - 24]) + ' ' + pt([x + 14, y - 4]) + ' ' + pt([x, y]);
          var lt_ = '';
          [[-11, -8, -1], [-10, -20, -1], [10, -20, 1], [11, -8, 1], [0, -26, 0]].forEach(function (k) { var bx = x + k[0], by = y + k[1]; lt_ += P(k[2] ? pd([[bx, by - 2], [bx + k[2] * 6, by - 3], [bx, by + 2]], true) : pd([[bx - 2, by + 1], [bx, by - 6], [bx + 2, by + 1]], true), c.cel('#e0d0a8'), 1); });
          return staff(top, bot, '#4a3a22', 3.8) + th + L(vine, OL, 5) + L(vine, '#5a8a2a', 2.6) + lt_ + L(loop, OL, 5.4) + L(loop, '#4a3a22', 3) +
            orb(c, x, y - 13, 5, '#7cff5a') + P(pd([[x - 18, y - 30], [x - 14, y - 36], [x - 12, y - 30]], true), '#9ad84a', 1) + P(pd([[x + 12, y - 36], [x + 16, y - 42], [x + 18, y - 35]], true), '#9ad84a', 1) + P(pd([[x - 20, y - 10], [x - 25, y - 14], [x - 19, y - 16]], true), '#9ad84a', 1);
        },
        wFar: function (c, p) { return C(p[0], p[1], 9, glow(c, '#7cff5a', 0.5)); }
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#a88a5a'), 2.5); }
  function phScene(c) { return sky(c, '#79a9cc', '#b9d0d4', '#f4e4b8') + ground(c, 150, SAV, SAV2); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#a88a5a"/></svg>'; }
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
