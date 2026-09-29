/* art_barrens.js — The Scrublands zone art for Realm of Loner (Krugar savanna, levels 10-15: Dustfort, Hollow Tower,
 * the Silent Pools, the Sourwater Oasis, the Snoutspike grounds, Hoofbreak Hill).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Scrublands keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers and the biped rig are shared copies of art_mulgore.js / art_durotar.js so the zones match. The spinehide
 * rig (quill/quillFan/quilHead/quilboar) draws them as porcupine-folk: banded quill coat, pointed snout, small tusks.
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
  // ---- Krugar pieces (Dunescar style) ----
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

  // ---- mob pieces (Greensward rig: biped + quilboar) ----
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
    var toe = typeof o.feet === 'function' ? o.feet : o.feet === 'toes' ? toes2 : o.feet === 'hoof' ? hoofs : boot;
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

  // ---- spinehide (porcupine-folk; data ids still say quilboar) ----
  // one slender banded quill: dark base, optional paint band, pale tip
  function quill(c, bx, by, a, len, w, base, band, tip) {
    var ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
    function q(t, k) { var h = w * (1 - t) * (k == null ? 1 : k); return [[bx + ux * len * t + px * h, by + uy * len * t + py * h], [bx + ux * len * t - px * h, by + uy * len * t - py * h]]; }
    var b0 = q(0), tp = [bx + ux * len, by + uy * len];
    var s = P(pd([b0[0], tp, b0[1]], true), base, 1.25);
    if (band) { var m0 = q(0.46, 0.62), m1 = q(0.62, 0.62); s += F(pd([m0[0], m1[0], m1[1], m0[1]], true), band); }
    var t0 = q(0.66, 0.62);
    s += F(pd([t0[0], tp, t0[1]], true), tip);
    return s;
  }
  // a fan of quills rooted on an ellipse, each leaning back by `lean` (radians)
  function quillFan(c, cx, cy, rx, ry, a0, a1, cnt, l0, l1, w, lean, cols, seed) {
    var r = rng(seed), s = '';
    for (var i = 0; i < cnt; i++) {
      var t = cnt < 2 ? 0.5 : i / (cnt - 1), a = (a0 + (a1 - a0) * t + (r() - 0.5) * 0.12) * Math.PI / 180;
      var len = (l0 + (l1 - l0) * Math.pow(Math.sin(Math.PI * (0.15 + t * 0.7)), 0.8)) * (0.82 + r() * 0.3);
      s += quill(c, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, a + lean, len, w, cols.base, cols.band && (i % (cols.every || 1) === 0) ? cols.band : null, cols.tip);
    }
    return s;
  }
  function paws(c, p, col) {
    var x = p[0], y = p[1], s = '';
    [[-4.2, 1.8, 2.3], [-2.6, 3.8, 2.1], [0, 4.6, 1.9]].forEach(function (k) {
      s += P(pd([[x + k[0] - 1.1, y + k[1] - 1.3], [x + k[0] - 2.2 - k[2], y + k[1] + 1.2], [x + k[0] + 1, y + k[1] - 0.2]], true), col || '#efe4c4', 0.9);
    });
    return s;
  }
  function pawFoot(x, y, col) {
    var s = P('M' + n(x + 6) + ',' + n(y - 8) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 8) + ',' + n(y + 1) + ' C' + n(x - 11) + ',' + n(y + 1) + ' ' + n(x - 10) + ',' + n(y - 5) + ' ' + n(x - 5) + ',' + n(y - 7) + ' Z', c_(col), 2);
    [[-8.5, -0.2], [-6, 0.4], [-3.2, 0.8]].forEach(function (k) { s += P(pd([[x + k[0] + 1.2, y - 1.2 + k[1]], [x + k[0] - 3.4, y + 1.6], [x + k[0] + 1.6, y + 1.2]], true), '#efe4c4', 0.9); });
    return s + L('M' + n(x - 3) + ',' + n(y - 3) + ' l0,3 M' + n(x + 1) + ',' + n(y - 3) + ' l0,3', OL, 1);
  }
  function quilHead(c, x, y, o) {
    var sk = o.skin, s = '', tk = o.tusk || 1, mask = o.mask, qc = { base: c.cel(o.mane), band: o.band, tip: o.tip, every: 2 };
    // quills over the crown and the back of the head, lying back
    s += quillFan(c, x + 3, y - 1, 9, 9, -128, -18, 7, 11, 17, 2.1, 0.42, qc, 71);
    // small round ear
    var d = 'M' + pt([x + 12, y + 2]) + 'C' + pt([x + 12, y - 11]) + ' ' + pt([x + 1, y - 15]) + ' ' + pt([x - 7, y - 11]) + 'C' + pt([x - 13, y - 8]) + ' ' + pt([x - 19, y - 3]) + ' ' + pt([x - 24, y + 1]) +
      'C' + pt([x - 27, y + 3]) + ' ' + pt([x - 26, y + 8]) + ' ' + pt([x - 22, y + 8.5]) + 'C' + pt([x - 16, y + 9.5]) + ' ' + pt([x - 10, y + 13.5]) + ' ' + pt([x - 2, y + 13.5]) + 'C' + pt([x + 6, y + 13.5]) + ' ' + pt([x + 12, y + 9]) + ' ' + pt([x + 12, y + 2]) + 'Z';
    s += body(c, d, sk,
      F('M' + pt([x - 30, y - 3]) + 'C' + pt([x - 20, y - 4]) + ' ' + pt([x - 13, y - 9]) + ' ' + pt([x - 6, y - 5]) + 'C' + pt([x - 1, y]) + ' ' + pt([x - 1, y + 9]) + ' ' + pt([x + 3, y + 18]) + 'L' + pt([x - 30, y + 18]) + 'Z', c.cel(mask)) +
      F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 2, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.25), 0.8) +
      F('M' + pt([x - 30, y + 9]) + 'C' + pt([x - 18, y + 11]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x + 14, y + 8]) + 'L' + pt([x + 14, y + 20]) + 'L' + pt([x - 30, y + 20]) + 'Z', dk(mask, 0.2), 0.6) +
      (o.paint ? L('M' + pt([x - 16, y + 2]) + 'L' + pt([x - 5, y + 4]) + 'M' + pt([x - 14, y + 6.5]) + 'L' + pt([x - 4, y + 8.5]) + 'M' + pt([x - 3, y - 9]) + 'L' + pt([x + 2, y - 3]), o.paint, 2) : ''));
    s += C(x + 6.5, y - 10.5, 3.4, c.cel(sk), 1.7) + C(x + 6.2, y - 10.2, 1.6, dk(sk, 0.5));
    // button nose, beady eye with a hard brow
    s += C(x - 24.5, y + 4, 3.3, '#1a1210', 1.3) + C(x - 25.6, y + 3, 1, '#ffffff', 0, 0.55);
    s += C(x - 10, y - 2.2, 2.3, dk(o.eye || '#2a1a12', 0.78), 1) + C(x - 10.8, y - 3, 0.75, '#ffffff') + C(x - 9.2, y - 1.6, 0.5, o.eye || '#ffffff', 0, 0.9);
    s += L('M' + pt([x - 15, y - 6]) + 'L' + pt([x - 5, y - 5.5]), OL, 2.2);
    s += L('M' + pt([x - 21, y + 8.5]) + 'C' + pt([x - 17, y + 10]) + ' ' + pt([x - 12, y + 11.5]) + ' ' + pt([x - 7, y + 11]), OL, 1.3);
    // two small lower tusks
    s += P('M' + pt([x - 17.5, y + 9]) + 'C' + pt([x - 18.5, y + 7]) + ' ' + pt([x - 19.5 - tk, y + 5 - tk]) + ' ' + pt([x - 20 - tk, y + 3.5 - 1.5 * tk]) + 'C' + pt([x - 17, y + 5]) + ' ' + pt([x - 16, y + 7]) + ' ' + pt([x - 15.5, y + 9.5]) + 'Z', c.cel('#f4ecd6'), 1.2);
    s += P('M' + pt([x - 11.5, y + 11.5]) + 'C' + pt([x - 12.5, y + 9]) + ' ' + pt([x - 14 - tk, y + 6.5 - tk]) + ' ' + pt([x - 14.5 - tk, y + 4.5 - 1.5 * tk]) + 'C' + pt([x - 11.5, y + 6]) + ' ' + pt([x - 10, y + 8.5]) + ' ' + pt([x - 9.3, y + 11.5]) + 'Z', c.cel('#f4ecd6'), 1.3);
    if (o.crown) {
      s += limb('M' + pt([x - 12, y - 8]) + 'C' + pt([x - 6, y - 14]) + ' ' + pt([x + 4, y - 15]) + ' ' + pt([x + 11, y - 8]), '#5a6a32', 3.2);
      [[-9, -10.5, -2.2], [-4, -13, -1.9], [2, -14, -1.5], [8, -11.5, -1.1]].forEach(function (t) {
        var a = t[2], bx = x + t[0], by = y + t[1], len = 7;
        s += P(pd([[bx - 2, by + 1], [bx + Math.cos(a) * len, by + Math.sin(a) * len], [bx + 2, by]], true), c.cel('#ece2c0'), 1.1);
      });
      s += C(x - 1, y - 13.5, 2.2, '#c83a2a', 1.2);
    }
    return s;
  }
  // stocky, round-bellied porcupine-folk on the shared biped rig
  function quilboar(c, o) {
    var sk = o.skin || '#8a6a52', mane = o.mane || '#3a2a20', tip = o.tip || '#efe4c4', band = o.band || null;
    var belly = o.belly || mix(sk, '#f2dfc2', 0.5), mask = o.mask || mix(sk, '#f2dfc2', 0.55);
    var ho = { skin: sk, mane: mane, tip: tip, band: band, mask: mask, eye: o.eye, tusk: o.tusk, crown: o.crown, paint: o.paint };
    var cp = [], i, a;
    for (i = 0; i <= 14; i++) { a = (-128 + 200 * i / 14) * Math.PI / 180; cp.push([75 + Math.cos(a) * 19, 63 + Math.sin(a) * 27]); }
    var e0 = cp[cp.length - 1], e3 = cp[0];
    for (i = 1; i < 14; i++) { var b = bez(e0, [74, 78], [67, 58], e3, i / 14); cp.push(i % 2 ? [b[0] - 3.2, b[1] + 4.2] : [b[0], b[1]]); }
    var coat = pd(cp, true), qcol = mix(mane, sk, 0.5);
    return biped(c, {
      skin: sk, shirt: sk, pants: dk(sk, 0.08), bareArms: true, feet: pawFoot, boots: dk(sk, 0.45), loin: o.loin || '#7a5030', legW: 13, armW: 10.5, belt: o.belt, buckle: '#ece0bc',
      hx: 46, hy: 45, hipY: 90, shadowR: 36, neck: false,
      torsoD: 'M44,54 C47,45 60,42 72,45 C84,48 90,60 88,74 C87,84 80,93 66,93 L54,93 C44,93 38,85 38,75 C38,67 40,60 44,54 Z',
      back: function (c) {
        return (o.back ? o.back(c) : '') +
          quillFan(c, 74, 62, 17, 24, -132, 78, 17, 13, 24, 2.5, 0.36, { base: c.cel(dk(mane, 0.12)), band: band, tip: tip, every: 2 }, 11) +
          E(75, 63, 19, 27, c.cel(mane), 2.4);
      },
      head: function (c, x, y) { return quilHead(c, x, y, ho); },
      chest: function (c) { return E(52, 75, 12, 17, c.cel(belly)) + L('M44,66 Q48,63 54,64', dk(belly, 0.25), 1.2) + L('M44,82 Q50,86 58,85', dk(belly, 0.25), 1.2) + (o.chest ? o.chest(c) : ''); },
      front: function (c) {
        return body(c, coat, mane, F('M80,30 L100,30 L100,100 L82,100 Z', dk(mane, 0.3), 0.7)) +
          quillFan(c, 78, 64, 11, 20, -120, 64, 10, 12, 17, 2.1, 0.45, { base: c.cel(qcol), band: band, tip: tip, every: 2 }, 23) +
          quillFan(c, 74, 64, 4, 13, -130, 60, 8, 9, 13, 1.9, 0.5, { base: c.cel(lt(qcol, 0.12)), band: band, tip: tip, every: 2 }, 37) +
          (o.front ? o.front(c) : '');
      },
      near: o.near || [[48, 58], [40, 74], [32, 84]], far: o.far || [[80, 56], [88, 72], [88, 88]],
      wNear: o.wNear, wFar: o.wFar, pads: o.pads, top: o.top, tf: o.tf,
      wNearFront: function (c, p) { return paws(c, p, '#efe4c4') + (o.wNearFront ? o.wNearFront(c, p) : ''); }
    });
  }
  function thornBelt(y) { var s = L('M48,' + y + ' L80,' + y, '#4a3a22', 3.4); for (var x = 52; x < 80; x += 7) s += P('M' + (x - 2) + ',' + y + ' L' + x + ',' + (y + 6) + ' L' + (x + 2) + ',' + y + ' Z', '#ece2c0', 1); return s; }
  function boneNeck(x, y) { var s = L('M' + (x - 12) + ',' + y + ' Q' + x + ',' + (y + 10) + ' ' + (x + 12) + ',' + y, '#3a2a1a', 1.2); for (var i = -2; i <= 2; i++) s += P('M' + n(x + i * 4.4 - 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4) + ',' + n(y + 10 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4 + 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' Z', '#f4ecd6', 1); return s; }
  // ---- storm pieces (Dunescar style) ----
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
  // Galloran centaur tent: patched hide dome, poles through the top, painted band
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
  // Briarmother totem: thorn-wrapped pole, hanging bones and red rags, topped with a carved dark-wood Briarmother
  // mask (almond eyes, long nose ridge, solemn mouth) bound in thorn vine and crowned with a fan of banded quills
  function briarQuill(x, y, a, len, w, sw) {
    var ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux, tip = [x + ux * len, y + uy * len];
    var b1 = [x + px * w, y + py * w], b2 = [x - px * w, y - py * w];
    var m = function (t, k) { return [x + ux * len * t + px * w * k, y + uy * len * t + py * w * k]; };
    return P(pd([b1, m(0.55, 0.85), tip, m(0.55, -0.85), b2], true), '#f2e6c4', sw) +
      F(pd([b1, m(0.42, 0.9), m(0.42, -0.9), b2], true), '#3a2416') +
      F(pd([m(0.58, 0.82), m(0.66, 0.72), m(0.66, -0.72), m(0.58, -0.82)], true), '#3a2416');
  }
  function briarMask(c, x, y, s) {
    var o = '', wood = '#5e3a22', r = rng(Math.round(x * 5 + y));
    // crown: a fan of long banded quills behind the mask
    for (var q = 0; q < 7; q++) {
      var a = -Math.PI * (0.86 - 0.72 * q / 6), len = (q === 3 ? 21 : q === 2 || q === 4 ? 19 : q === 1 || q === 5 ? 16.5 : 13.5) * s;
      o += briarQuill(x + Math.cos(a) * 3 * s, y - 5 * s + Math.sin(a) * 3 * s, a + (r() - 0.5) * 0.06, len, 2 * s, 1 * s);
    }
    // the carved face: long almond shape, pointed chin
    var d = 'M' + pt([x, y - 11 * s]) + 'C' + pt([x + 7 * s, y - 11 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 8.5 * s, y - 1 * s]) + 'C' + pt([x + 8 * s, y + 5 * s]) + ' ' + pt([x + 4 * s, y + 9 * s]) + ' ' + pt([x, y + 11 * s]) +
      'C' + pt([x - 4 * s, y + 9 * s]) + ' ' + pt([x - 8 * s, y + 5 * s]) + ' ' + pt([x - 8.5 * s, y - 1 * s]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 7 * s, y - 11 * s]) + ' ' + pt([x, y - 11 * s]) + 'Z';
    var shade = F('M' + pt([x + 1.5 * s, y - 12 * s]) + 'C' + pt([x + 9 * s, y - 10 * s]) + ' ' + pt([x + 10 * s, y + 2 * s]) + ' ' + pt([x + 2 * s, y + 12 * s]) + 'L' + pt([x + 10 * s, y + 12 * s]) + 'L' + pt([x + 10 * s, y - 12 * s]) + 'Z', dk(wood, 0.35), 0.9) +
      L('M' + pt([x - 6 * s, y - 7 * s]) + 'Q' + pt([x - 7 * s, y]) + ' ' + pt([x - 4 * s, y + 6 * s]), lt(wood, 0.22), 1 * s, 0.8) +
      // red tribe paint running down from the eyes
      L('M' + pt([x - 4.6 * s, y + 0.5 * s]) + 'L' + pt([x - 5 * s, y + 5 * s]) + 'M' + pt([x + 4.6 * s, y + 0.5 * s]) + 'L' + pt([x + 5 * s, y + 5 * s]), '#b8281e', 1.3 * s);
    o += body(c, d, wood, shade, 1.9 * s);
    // brow line, almond eye holes, long thin nose ridge, small solemn mouth
    o += L('M' + pt([x - 6.5 * s, y - 4.6 * s]) + 'Q' + pt([x - 3.4 * s, y - 6.4 * s]) + ' ' + pt([x - 0.8 * s, y - 5 * s]) + 'M' + pt([x + 6.5 * s, y - 4.6 * s]) + 'Q' + pt([x + 3.4 * s, y - 6.4 * s]) + ' ' + pt([x + 0.8 * s, y - 5 * s]), OL, 1 * s);
    o += F('M' + pt([x - 6.4 * s, y - 2.2 * s]) + 'Q' + pt([x - 4 * s, y - 4.4 * s]) + ' ' + pt([x - 1.4 * s, y - 2.6 * s]) + 'Q' + pt([x - 4 * s, y - 0.8 * s]) + ' ' + pt([x - 6.4 * s, y - 2.2 * s]) + 'Z', '#120804') +
      F('M' + pt([x + 6.4 * s, y - 2.2 * s]) + 'Q' + pt([x + 4 * s, y - 4.4 * s]) + ' ' + pt([x + 1.4 * s, y - 2.6 * s]) + 'Q' + pt([x + 4 * s, y - 0.8 * s]) + ' ' + pt([x + 6.4 * s, y - 2.2 * s]) + 'Z', '#120804');
    o += L('M' + pt([x, y - 7 * s]) + 'L' + pt([x, y + 3.4 * s]), dk(wood, 0.5), 1.9 * s) + L('M' + pt([x - 0.4 * s, y - 7 * s]) + 'L' + pt([x - 0.4 * s, y + 3 * s]), lt(wood, 0.35), 0.7 * s);
    o += L('M' + pt([x - 2.2 * s, y + 6.2 * s]) + 'L' + pt([x + 2.2 * s, y + 6.2 * s]), OL, 1.1 * s);
    // thorn vine binding the mask: a band across the forehead, and one from the cheek under the chin down the pole
    var v1 = 'M' + pt([x - 9.5 * s, y - 5 * s]) + 'Q' + pt([x - 2 * s, y - 11 * s]) + ' ' + pt([x + 9.5 * s, y - 8 * s]);
    var v2 = 'M' + pt([x - 8.8 * s, y + 0.5 * s]) + 'C' + pt([x - 7.5 * s, y + 8 * s]) + ' ' + pt([x - 2 * s, y + 12 * s]) + ' ' + pt([x + 2 * s, y + 12.5 * s]) + 'C' + pt([x + 5.5 * s, y + 13 * s]) + ' ' + pt([x + 4 * s, y + 17 * s]) + ' ' + pt([x + 0.5 * s, y + 19 * s]);
    var th = '', tp = [[x - 6 * s, y - 7.4 * s, -0.4, -1], [x + 1 * s, y - 9.3 * s, 0.2, -1], [x + 7 * s, y - 8.6 * s, 0.6, -1], [x - 8.4 * s, y + 4 * s, -1, 0.2], [x - 3 * s, y + 11 * s, -0.5, 1], [x + 4.6 * s, y + 14.5 * s, 1, 0.1]];
    tp.forEach(function (t) { var l = 4.2 * s; th += P(pd([[t[0] - t[3] * 1.4 * s, t[1] + t[2] * 1.4 * s], [t[0] + t[2] * l, t[1] + t[3] * l], [t[0] + t[3] * 1.4 * s, t[1] - t[2] * 1.4 * s]], true), '#e8d8ac', 0.8 * s); });
    o += L(v1 + v2, OL, 3.6 * s) + th + L(v1 + v2, '#5a5a2a', 1.8 * s) + L(v1 + v2, lt('#5a5a2a', 0.3), 0.6 * s, 0.7);
    return o;
  }
  function briarTotem(c, x, y, h, s) {
    var top = y - h, o = E(x, y + 1, 10 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top + 6 * s]), '#5a3a22', 3.6 * s);
    var wr = '', th = '';
    for (var k = 0; k < 6; k++) { var yy = top + 26 * s + k * (h - 34 * s) / 6; wr += 'M' + pt([x - 3 * s, yy]) + 'L' + pt([x + 3 * s, yy + 5 * s]); th += P(pd([[x + 2 * s, yy + 2 * s], [x + (k % 2 ? 8 : -8) * s, yy - 1 * s], [x + 2 * s, yy + 4 * s]], true), '#e0d0a8', 0.9 * s); }
    o += th + L(wr, '#2a1a10', 1.3 * s);
    var cy = top + 16 * s;
    o += L('M' + pt([x - 14 * s, cy]) + 'L' + pt([x - 14 * s, cy + 14 * s]) + 'M' + pt([x + 14 * s, cy]) + 'L' + pt([x + 14 * s, cy + 12 * s]), '#3a2a1a', 1 * s);
    o += P(pd([[x - 12 * s, cy + 1 * s], [x - 6 * s, cy + 1 * s], [x - 8 * s, cy + 18 * s], [x - 10 * s, cy + 12 * s]], true), '#a8281e', 1 * s) + P(pd([[x + 5 * s, cy + 1 * s], [x + 11 * s, cy + 1 * s], [x + 9 * s, cy + 15 * s]], true), '#a8281e', 1 * s);
    o += bone(x, cy, 32 * s, 0.08, s) + bone(x - 14 * s, cy + 16 * s, 8 * s, 1.4, 0.7 * s) + skull(c, x + 14 * s, cy + 16 * s, 0.5 * s);
    // the Briarmother mask on top
    o += briarMask(c, x, top, 1.05 * s);
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
  // Galloran war totem: feathered pole, painted round hide shield, kodo horns on top
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
  //  SOUTHERN BARRENS PIECES (Slick, Greenwell Oasis, Stonegrave Dig)
  // ============================================================
  var IRON = '#5e5a54', RUST = '#a0582a', OIL = '#121216';
  // (gear / rails / minecart are shared copies of art_mulgore.js)
  function gear(c, x, y, r, col) {
    var d = '', k = 10;
    for (var i = 0; i < k * 2; i++) { var a0 = Math.PI * 2 * i / (k * 2), a1 = Math.PI * 2 * (i + 1) / (k * 2), rr = i % 2 ? r * 0.78 : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a0) * rr, y + Math.sin(a0) * rr]) + 'L' + pt([x + Math.cos(a1) * rr, y + Math.sin(a1) * rr]); }
    return P(d + 'Z', c.cel(col), 1.6) + C(x, y, r * 0.35, dk(col, 0.35), 1.2) + C(x, y, r * 0.12, OL);
  }
  function rails(x0, y0, x1, y1, w0, w1) {
    var d = 'M' + pt([x0, y0 - w0]) + 'L' + pt([x1, y1 - w1]) + 'M' + pt([x0, y0 + w0]) + 'L' + pt([x1, y1 + w1]), ties = '';
    for (var i = 0; i <= 10; i++) { var t = i / 10, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = (w0 + (w1 - w0) * t) * 1.5; ties += 'M' + pt([x - w * 0.25, y - w]) + 'L' + pt([x + w * 0.25, y + w]); }
    return L(ties, '#5a3a22', 3) + L(d, OL, 3) + L(d, '#8a8680', 1.4);
  }
  function minecart(c, x, y, s, load) {
    load = load || '#7a7068';
    var d = 'M' + pt([x - 16 * s, y - 20 * s]) + 'L' + pt([x + 16 * s, y - 20 * s]) + 'L' + pt([x + 12 * s, y - 4 * s]) + 'L' + pt([x - 12 * s, y - 4 * s]) + 'Z';
    var o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.25);
    [[x - 7 * s, y - 22 * s, 6], [x + 3 * s, y - 24 * s, 7], [x + 10 * s, y - 21 * s, 5]].forEach(function (g) { o += C(g[0], g[1], g[2] * s, c.cel(load), 1.4 * s); });
    o += body(c, d, '#6a625a', L('M' + pt([x - 14 * s, y - 14 * s]) + 'L' + pt([x + 14 * s, y - 14 * s]), '#4a4440', 1.4 * s) + F('M' + pt([x + 4 * s, y - 22 * s]) + 'L' + pt([x + 18 * s, y - 22 * s]) + 'L' + pt([x + 18 * s, y]) + 'L' + pt([x + 4 * s, y]) + 'Z', '#3a3632', 0.6), 1.8 * s);
    o += C(x - 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s) + C(x + 8 * s, y - 3 * s, 3.6 * s, c.cel('#4a4440'), 1.4 * s);
    return o;
  }
  // soft smog bank: overlapping blobs, no outline
  function smog(x, y, s, col, op) {
    var o = '', r = rng(Math.round(x * 11 + y * 7));
    for (var i = 0; i < 6; i++) o += E(x + (i - 2.5) * 16 * s + (r() - 0.5) * 8 * s, y + (r() - 0.5) * 6 * s, (18 + r() * 12) * s, (7 + r() * 5) * s, col, 0, op);
    return o;
  }
  // distant derrick silhouette, no outline
  function farDerrick(x, y, s, col) {
    var h = 46 * s, d = 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 1.5 * s, y - h]) + 'M' + pt([x + 8 * s, y]) + 'L' + pt([x + 1.5 * s, y - h]) +
      'M' + pt([x - 6 * s, y - 12 * s]) + 'L' + pt([x + 4.5 * s, y - 26 * s]) + 'M' + pt([x + 6 * s, y - 12 * s]) + 'L' + pt([x - 4.5 * s, y - 26 * s]) + 'M' + pt([x - 4 * s, y - 28 * s]) + 'L' + pt([x + 3 * s, y - 40 * s]);
    return L(d, col, 1.6 * s) + R(x - 3 * s, y - h - 3 * s, 6 * s, 4 * s, col);
  }
  // Deepgold Company oil derrick: tapered iron lattice, crown block, drill floor, tar stains (+ optional gusher)
  function derrick(c, x, y, s, gush) {
    var col = '#4e4a44', h = 112 * s, w0 = 22 * s, w1 = 5 * s, o = E(x, y + 2, 32 * s, 5 * s, '#000', 0, 0.3);
    var legs = 'M' + pt([x - w0, y]) + 'L' + pt([x - w1, y - h]) + 'M' + pt([x + w0, y]) + 'L' + pt([x + w1, y - h]), br = '';
    for (var i = 0; i < 6; i++) {
      var t0 = i / 6, t1 = (i + 1) / 6, ya = y - h * t0, yb = y - h * t1, wa = w0 + (w1 - w0) * t0, wb = w0 + (w1 - w0) * t1;
      br += 'M' + pt([x - wa, ya]) + 'L' + pt([x + wb, yb]) + 'M' + pt([x + wa, ya]) + 'L' + pt([x - wb, yb]) + 'M' + pt([x - wb, yb]) + 'L' + pt([x + wb, yb]);
    }
    if (gush) {
      var gx = x, gy = y - h - 10 * s, top = gy - 34 * s, sp = '';
      [[-30, 4, 0.9], [-20, 14, 0.7], [-10, 8, 0.5], [12, 10, 0.5], [22, 16, 0.7], [32, 6, 0.9]].forEach(function (q) { sp += 'M' + pt([gx + q[0] * 0.15 * s, top + 2 * s]) + 'Q' + pt([gx + q[0] * 0.8 * s, top - 6 * s * q[2]]) + ' ' + pt([gx + q[0] * s, top + (18 + q[1]) * s]); });
      o += L(sp, OIL, 2.6 * s, 0.95) + F('M' + pt([gx - 4 * s, gy]) + 'C' + pt([gx - 6 * s, gy - 14 * s]) + ' ' + pt([gx - 4 * s, gy - 24 * s]) + ' ' + pt([gx - 5 * s, top]) + 'Q' + pt([gx, top - 8 * s]) + ' ' + pt([gx + 5 * s, top]) + 'C' + pt([gx + 4 * s, gy - 24 * s]) + ' ' + pt([gx + 6 * s, gy - 14 * s]) + ' ' + pt([gx + 4 * s, gy]) + 'Z', OIL) +
        E(gx - 2 * s, top + 2 * s, 3 * s, 1.4 * s, '#6a6a80', 0, 0.6) + L('M' + pt([gx - 1.4 * s, gy - 4 * s]) + 'L' + pt([gx - 2 * s, top + 6 * s]), '#5a5a70', 1.2 * s, 0.7);
      [[-33, 28, 2.4], [-24, 38, 1.8], [-14, 30, 1.6], [16, 26, 1.6], [26, 40, 1.8], [35, 26, 2.4], [-30, 50, 1.4], [32, 52, 1.4]].forEach(function (q) { o += C(gx + q[0] * s, top + q[1] * s, q[2] * s, OIL); });
    }
    o += L(legs + br, OL, 4.4 * s) + L(br, dk(col, 0.1), 1.8 * s) + L(legs, col, 3 * s) + L('M' + pt([x + w0 - 1, y]) + 'L' + pt([x + w1 - 0.5, y - h]), lt(col, 0.2), 1 * s, 0.7);
    o += R(x - 9 * s, y - h - 9 * s, 18 * s, 10 * s, c.cel(RUST), 1.6 * s) + C(x, y - h - 4 * s, 3.4 * s, c.cel('#8a8680'), 1.3 * s);
    o += L('M' + pt([x - 1 * s, y - h]) + 'L' + pt([x - 1 * s, y - 24 * s]), '#262424', 1.2 * s) + R(x - 4 * s, y - 34 * s, 8 * s, 10 * s, c.cel('#6a6460'), 1.2 * s);
    // drill floor + well-head box
    o += R(x - 27 * s, y - 18 * s, 54 * s, 6 * s, c.cel('#6a4a2c'), 1.6 * s);
    o += body(c, 'M' + pt([x - 12 * s, y]) + 'L' + pt([x - 12 * s, y - 12 * s]) + 'L' + pt([x + 12 * s, y - 12 * s]) + 'L' + pt([x + 12 * s, y]) + 'Z', RUST, F('M' + pt([x + 3 * s, y - 14 * s]) + 'L' + pt([x + 14 * s, y - 14 * s]) + 'L' + pt([x + 14 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(RUST, 0.3), 0.8) + R(x - 8 * s, y - 9 * s, 7 * s, 5 * s, '#e0a830', 1 * s), 1.6 * s);
    // tar stains run down the legs, puddle at the foot
    o += F('M' + pt([x - w0 * 0.6, y - h * 0.4]) + 'l' + n(-1.6 * s) + ',' + n(12 * s) + 'l' + n(1.4 * s) + ',' + n(3 * s) + 'l' + n(1.2 * s) + ',' + n(-5 * s) + 'Z' + 'M' + pt([x + w0 * 0.45, y - h * 0.55]) + 'l' + n(1.4 * s) + ',' + n(16 * s) + 'l' + n(1.4 * s) + ',' + n(2 * s) + 'l' + n(0.6 * s) + ',' + n(-8 * s) + 'Z', OIL, 0.85);
    o += E(x + 4 * s, y + 1, 24 * s, 3.4 * s, OIL, 0, 0.8) + E(x - 2 * s, y, 8 * s, 1 * s, '#7a6aa8', 0, 0.5);
    return o;
  }
  // nodding-donkey pump jack: A-frame, walking beam, horse head (left), crank + counterweight (right)
  function pumpjack(c, x, y, s) {
    var o = E(x, y + 2, 40 * s, 5 * s, '#000', 0, 0.28), px = x, py = y - 40 * s;
    o += R(x - 40 * s, y - 6 * s, 72 * s, 6 * s, c.cel('#4a4640'), 1.6 * s);
    o += limb('M' + pt([x - 12 * s, y - 6 * s]) + 'L' + pt([px, py]) + 'L' + pt([x + 12 * s, y - 6 * s]), RUST, 3.4 * s) + limb('M' + pt([x - 7 * s, y - 20 * s]) + 'L' + pt([x + 7 * s, y - 20 * s]), dk(RUST, 0.2), 2 * s);
    // gearbox + crank + counterweight
    o += body(c, 'M' + pt([x + 14 * s, y - 6 * s]) + 'L' + pt([x + 14 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 22 * s]) + 'L' + pt([x + 30 * s, y - 6 * s]) + 'Z', '#6a625a', F('M' + pt([x + 24 * s, y - 24 * s]) + 'L' + pt([x + 32 * s, y - 24 * s]) + 'L' + pt([x + 32 * s, y - 4 * s]) + 'L' + pt([x + 24 * s, y - 4 * s]) + 'Z', '#3a3632', 0.6), 1.6 * s);
    o += limb('M' + pt([x + 22 * s, y - 14 * s]) + 'L' + pt([x + 34 * s, y - 24 * s]), '#3a3632', 2.6 * s) + P('M' + pt([x + 30 * s, y - 20 * s]) + 'L' + pt([x + 40 * s, y - 30 * s]) + 'L' + pt([x + 44 * s, y - 22 * s]) + 'L' + pt([x + 36 * s, y - 14 * s]) + 'Z', c.cel(RUST), 1.4 * s) + C(x + 22 * s, y - 14 * s, 2.4 * s, '#8a8680', 1 * s);
    o += limb('M' + pt([x + 34 * s, y - 24 * s]) + 'L' + pt([x + 30 * s, y - 44 * s]), '#3a3632', 1.8 * s);
    // walking beam, tipped nose-down
    var b0 = [x - 30 * s, py + 6 * s], b1 = [x + 32 * s, py - 6 * s];
    o += limb('M' + pt(b0) + 'L' + pt(b1), '#e0a830', 4.6 * s) + L('M' + pt([b0[0], b0[1] - 1 * s]) + 'L' + pt([b1[0], b1[1] - 1 * s]), '#f4d070', 1.2 * s, 0.7);
    o += L('M' + pt([b0[0] + 8 * s, b0[1] - 2 * s]) + 'L' + pt([b0[0] + 12 * s, b0[1] + 1 * s]) + 'M' + pt([b0[0] + 20 * s, b0[1] - 4 * s]) + 'L' + pt([b0[0] + 24 * s, b0[1] - 1 * s]) + 'M' + pt([b0[0] + 44 * s, b0[1] - 9 * s]) + 'L' + pt([b0[0] + 48 * s, b0[1] - 6 * s]), OL, 1.6 * s, 0.8);
    // horse head
    var hx = b0[0], hy = b0[1];
    o += body(c, 'M' + pt([hx + 4 * s, hy - 6 * s]) + 'C' + pt([hx - 6 * s, hy - 8 * s]) + ' ' + pt([hx - 14 * s, hy]) + ' ' + pt([hx - 12 * s, hy + 14 * s]) + 'L' + pt([hx - 6 * s, hy + 14 * s]) + 'C' + pt([hx - 7 * s, hy + 4 * s]) + ' ' + pt([hx - 2 * s, hy]) + ' ' + pt([hx + 4 * s, hy + 3 * s]) + 'Z', '#e0a830', F('M' + pt([hx - 14 * s, hy + 6 * s]) + 'L' + pt([hx - 4 * s, hy + 6 * s]) + 'L' + pt([hx - 4 * s, hy + 16 * s]) + 'L' + pt([hx - 14 * s, hy + 16 * s]) + 'Z', '#a07018', 0.6), 1.6 * s);
    o += C(px, py, 2.6 * s, '#3a3632', 1 * s);
    // polished rod + stuffing box
    o += L('M' + pt([hx - 9 * s, hy + 14 * s]) + 'L' + pt([hx - 9 * s, y - 10 * s]), '#c8c4bc', 1.4 * s) + R(hx - 14 * s, y - 12 * s, 10 * s, 12 * s, c.cel(RUST), 1.4 * s) + E(hx - 9 * s, y, 12 * s, 2 * s, OIL, 0, 0.7);
    return o;
  }
  // corrugated goblin shack: patched sheet walls, lean-to roof, lit porthole, stovepipe with smoke
  function shack(c, x, y, s, col, roof) {
    col = col || '#8a8474'; roof = roof || RUST;
    var o = E(x, y + 1, 34 * s, 5 * s, '#000', 0, 0.25), r = rng(Math.round(x * 3 + y));
    // stovepipe + smoke
    for (var i = 0; i < 5; i++) { var t = i / 4; o += C(x + 18 * s + t * 22 * s + r() * 4, y - 50 * s - t * 26 * s, (4 + t * 8) * s, i % 2 ? '#6a665e' : '#7e7a70', 0, 0.7 - t * 0.4); }
    o += limb('M' + pt([x + 18 * s, y - 30 * s]) + 'L' + pt([x + 18 * s, y - 48 * s]), '#4a4640', 3 * s) + R(x + 15 * s, y - 50 * s, 6 * s, 3 * s, '#3a3632', 1 * s);
    var wall = 'M' + pt([x - 26 * s, y]) + 'L' + pt([x - 25 * s, y - 26 * s]) + 'L' + pt([x + 26 * s, y - 32 * s]) + 'L' + pt([x + 26 * s, y]) + 'Z', rib = '';
    for (var k = -24; k <= 24; k += 4.5) rib += 'M' + pt([x + k * s, y]) + 'L' + pt([x + k * s, y - 34 * s]);
    var sh = L(rib, dk(col, 0.22), 1 * s) + R(x - 22 * s, y - 22 * s, 12 * s, 10 * s, '#9a5a30', 1 * s) + R(x + 12 * s, y - 16 * s, 12 * s, 12 * s, '#5e6e74', 1 * s) +
      L('M' + pt([x - 20 * s, y - 21 * s]) + 'L' + pt([x - 12 * s, y - 13 * s]), '#6a3a1e', 1 * s, 0.7) + F('M' + pt([x + 10 * s, y - 36 * s]) + 'L' + pt([x + 28 * s, y - 36 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 10 * s, y + 2]) + 'Z', dk(col, 0.3), 0.75) +
      F('M' + pt([x - 26 * s, y - 6 * s]) + 'L' + pt([x + 26 * s, y - 6 * s]) + 'L' + pt([x + 26 * s, y + 2]) + 'L' + pt([x - 26 * s, y + 2]) + 'Z', OIL, 0.35);
    o += body(c, wall, col, sh, 1.8 * s);
    // roof slab
    var rf = 'M' + pt([x - 32 * s, y - 23 * s]) + 'L' + pt([x - 31 * s, y - 29 * s]) + 'L' + pt([x + 32 * s, y - 38 * s]) + 'L' + pt([x + 32 * s, y - 32 * s]) + 'Z', rr = '';
    for (var q = -28; q <= 28; q += 6) rr += 'M' + pt([x + q * s, y - 25.5 * s - (q + 32) * 0.145 * s]) + 'L' + pt([x + q * s, y - 31 * s - (q + 32) * 0.145 * s]);
    o += body(c, rf, roof, L(rr, dk(roof, 0.3), 1 * s), 1.6 * s);
    // door + porthole
    o += P('M' + pt([x - 2 * s, y + 1]) + 'L' + pt([x - 2 * s, y - 19 * s]) + 'L' + pt([x + 9 * s, y - 20 * s]) + 'L' + pt([x + 9 * s, y + 1]) + 'Z', '#2a1e16', 1.4 * s) + C(x + 6.4 * s, y - 9 * s, 1 * s, '#e0a830');
    o += C(x - 14 * s, y - 13 * s, 9 * s, glow(c, '#ffd060', 0.5)) + C(x - 14 * s, y - 13 * s, 4.6 * s, '#ffd870', 1.6 * s) + L('M' + pt([x - 14 * s, y - 17.6 * s]) + 'L' + pt([x - 14 * s, y - 8.4 * s]) + 'M' + pt([x - 18.6 * s, y - 13 * s]) + 'L' + pt([x - 9.4 * s, y - 13 * s]), '#6a4a2a', 1 * s);
    return o;
  }
  // pipeline along a polyline, with flanges at each joint and mid-span
  function pipe(c, pts, w, col) {
    col = col || '#7a746a';
    var d = pd(pts), o = L(d, OL, w + 4) + L(d, col, w) + G(L(d, lt(col, 0.3), w * 0.3, 0.7), 'translate(0,' + n(-w * 0.28) + ')') + G(L(d, dk(col, 0.35), w * 0.28, 0.7), 'translate(0,' + n(w * 0.3) + ')');
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l * w * 0.85, py = dx / l * w * 0.85;
      [0.5, i === pts.length - 2 ? 0.96 : 1].forEach(function (t) {
        var m = [a[0] + dx * t, a[1] + dy * t], fd = 'M' + pt([m[0] + px, m[1] + py]) + 'L' + pt([m[0] - px, m[1] - py]);
        o += L(fd, OL, w * 0.55 + 3) + L(fd, dk(col, 0.1), w * 0.55);
      });
    }
    // a rusty leak
    var lm = [(pts[0][0] + pts[1][0]) / 2 + 8, (pts[0][1] + pts[1][1]) / 2];
    return o + E(lm[0], lm[1] + w * 0.6, w * 0.4, w * 0.3, RUST, 0, 0.8);
  }
  // pool of black oily sludge: tar rim, dark bank shadow, oil-sheen swirls, bubbles
  function sludge(c, x, y, rx, ry, seed) {
    var d = ellD(x, y, rx, ry), o = E(x, y + ry * 0.25, rx + 9, ry + 4, '#2a2618', 0, 0.75), r = rng(seed || Math.round(x * 7 + rx));
    o += P(d, c.lg([[0, '#040406'], [0.55, '#1a1a20'], [1, '#34323c']]), 1.8);
    var sw = '', sw2 = '', sw3 = '';
    for (var i = 0; i < 4; i++) {
      var sx = x + (r() - 0.5) * rx * 1.3, sy = y + (r() - 0.3) * ry * 0.8, w = rx * (0.15 + r() * 0.15);
      sw += 'M' + pt([sx - w, sy]) + 'Q' + pt([sx, sy - ry * 0.35]) + ' ' + pt([sx + w, sy]);
      sw2 += 'M' + pt([sx - w * 0.7, sy + 1.6]) + 'Q' + pt([sx, sy - ry * 0.2 + 1.6]) + ' ' + pt([sx + w * 0.7, sy + 1.6]);
      sw3 += 'M' + pt([sx - w * 0.4, sy + 3]) + 'Q' + pt([sx, sy + 3 - ry * 0.1]) + ' ' + pt([sx + w * 0.4, sy + 3]);
    }
    o += '<g clip-path="url(#' + c.clip(d) + ')">' + E(x, y - ry * 0.95, rx * 1.1, ry * 0.55, '#000', 0, 0.6) + L(sw, '#9a6ad0', 1.4, 0.6) + L(sw2, '#4ab8a0', 1.2, 0.55) + L(sw3, '#d8c050', 1, 0.45) + E(x - rx * 0.3, y + ry * 0.25, rx * 0.3, ry * 0.18, '#8a88a0', 0, 0.3) + '</g>';
    for (var b = 0; b < 3; b++) { var bx = x + (r() - 0.5) * rx * 1.2, by = y + (r() - 0.4) * ry * 0.7, br = 1.4 + r() * 1.8; o += C(bx, by, br, '#2a2a32', 1) + C(bx - br * 0.35, by - br * 0.35, br * 0.3, '#b8b4d0'); }
    return o;
  }
  // gnarled dead tree, black and oil-soaked
  function deadTree(c, x, y, s, col) {
    col = col || '#3a3228';
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]) + 'M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x - 3 * s, y - 60 * s]), col, 1.6 * s);
    return o + L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]), lt(col, 0.18), 1.4 * s, 0.7);
  }
  // lily pad (+ optional flower)
  function lily(x, y, s, flower) {
    var d = 'M' + pt([x, y]) + 'L' + pt([x + 6 * s, y - 1.4 * s]) + 'A' + n(7 * s) + ',' + n(2.6 * s) + ' 0 1,1 ' + pt([x + 6 * s, y + 1.2 * s]) + 'Z';
    return P(d, '#5a9a3a', 1 * s) + L('M' + pt([x - 4 * s, y - 0.6 * s]) + 'L' + pt([x + 1 * s, y]), '#3a7a2a', 0.8 * s) + (flower ? C(x - 2 * s, y - 1.6 * s, 1.6 * s, '#f4a8c8', 0.8 * s) + C(x - 2 * s, y - 1.8 * s, 0.6 * s, '#ffe070') : '');
  }
  // crocolisk resting on a bank (scene prop, facing left unless flip)
  function bankCroc(c, x, y, s, flip, col) {
    col = col || '#5e6e38';
    var f = flip ? -1 : 1, bel = '#c8c08a';
    function Q(dx, dy) { return [x + dx * s * f, y + dy * s]; }
    var o = E(x + 6 * s * f, y + 1, 40 * s, 3.6 * s, '#000', 0, 0.25);
    o += L('M' + pt(Q(14, -4)) + 'C' + pt(Q(28, -3)) + ' ' + pt(Q(40, 0)) + ' ' + pt(Q(52, -6)), OL, 9 * s) + L('M' + pt(Q(14, -4)) + 'C' + pt(Q(28, -3)) + ' ' + pt(Q(40, 0)) + ' ' + pt(Q(52, -6)), col, 5 * s);
    var bd = 'M' + pt(Q(-20, -2)) + 'C' + pt(Q(-16, -10)) + ' ' + pt(Q(4, -12)) + ' ' + pt(Q(18, -8)) + 'C' + pt(Q(24, -6)) + ' ' + pt(Q(22, 0)) + ' ' + pt(Q(16, 0)) + 'L' + pt(Q(-20, 0)) + 'Z';
    o += body(c, bd, col, F('M' + pt(Q(-24, -3)) + 'L' + pt(Q(24, -3)) + 'L' + pt(Q(24, 2)) + 'L' + pt(Q(-24, 2)) + 'Z', bel, 0.7) + L('M' + pt(Q(-12, -9)) + 'l' + n(2 * s * f) + ',' + n(-2 * s) + 'M' + pt(Q(-4, -11)) + 'l' + n(2 * s * f) + ',' + n(-2 * s) + 'M' + pt(Q(4, -11)) + 'l' + n(2 * s * f) + ',' + n(-2 * s) + 'M' + pt(Q(12, -9)) + 'l' + n(2 * s * f) + ',' + n(-2 * s), dk(col, 0.4), 1.4 * s), 1.4 * s);
    o += P('M' + pt(Q(-18, -7)) + 'C' + pt(Q(-26, -8)) + ' ' + pt(Q(-36, -6)) + ' ' + pt(Q(-42, -3)) + 'L' + pt(Q(-42, 0)) + 'L' + pt(Q(-18, 0)) + 'Z', c.cel(col), 1.4 * s) + L('M' + pt(Q(-40, -1.4)) + 'L' + pt(Q(-20, -1.6)), OL, 0.9 * s);
    o += E(Q(-20, -8)[0], Q(-20, -8)[1], 2.2 * s, 1.6 * s, '#ffd040', 0.9 * s) + E(Q(-20, -8)[0], Q(-20, -8)[1], 0.5 * s, 1.2 * s, OL);
    o += L('M' + pt(Q(-12, -2)) + 'l' + n(-4 * s * f) + ',' + n(3 * s) + 'M' + pt(Q(10, -2)) + 'l' + n(-4 * s * f) + ',' + n(3 * s), OL, 4 * s) + L('M' + pt(Q(-12, -2)) + 'l' + n(-4 * s * f) + ',' + n(3 * s) + 'M' + pt(Q(10, -2)) + 'l' + n(-4 * s * f) + ',' + n(3 * s), col, 2 * s);
    return o;
  }
  // a crocolisk lurking: eyes and snout above the water line
  function lurker(c, x, y, s) {
    var col = '#4e6030';
    return E(x, y + 1, 16 * s, 2 * s, '#1a4a6a', 0, 0.35) + P('M' + pt([x - 14 * s, y]) + 'C' + pt([x - 13 * s, y - 2.6 * s]) + ' ' + pt([x - 8 * s, y - 2.8 * s]) + ' ' + pt([x - 6 * s, y - 1.4 * s]) + 'L' + pt([x - 6 * s, y]) + 'Z', c.cel(col), 1 * s) +
      E(x + 2 * s, y - 1.2 * s, 3 * s, 2.6 * s, c.cel(col), 1.1 * s) + E(x + 8 * s, y - 1.2 * s, 3 * s, 2.6 * s, c.cel(col), 1.1 * s) + C(x + 1.4 * s, y - 1.8 * s, 1 * s, '#ffd040') + C(x + 7.4 * s, y - 1.8 * s, 1 * s, '#ffd040') +
      L('M' + pt([x - 18 * s, y + 1]) + 'L' + pt([x - 12 * s, y + 1]) + 'M' + pt([x + 13 * s, y + 1]) + 'L' + pt([x + 20 * s, y + 1]), '#e8f6ff', 1 * s, 0.8);
  }
  // raptor nest: twig bowl with speckled eggs
  function nest(c, x, y, s) {
    var o = E(x, y + 1, 18 * s, 4 * s, '#000', 0, 0.22), r = rng(Math.round(x * 5 + y));
    [[-5, -6, 4.6], [3, -7, 5], [0, -4, 4.4]].forEach(function (e, i) {
      o += E(x + e[0] * s, y + e[1] * s, e[2] * 0.8 * s, e[2] * s, c.cel(i === 1 ? '#e8e0c4' : '#f0e8d0'), 1.3 * s) + C(x + (e[0] - 1) * s, y + (e[1] - 1) * s, 0.8 * s, '#8a6a3a') + C(x + (e[0] + 1.4) * s, y + (e[1] + 1) * s, 0.7 * s, '#8a6a3a');
    });
    var bowl = 'M' + pt([x - 16 * s, y - 5 * s]) + 'C' + pt([x - 14 * s, y + 2 * s]) + ' ' + pt([x + 14 * s, y + 2 * s]) + ' ' + pt([x + 16 * s, y - 5 * s]) + 'C' + pt([x + 8 * s, y - 2 * s]) + ' ' + pt([x - 8 * s, y - 2 * s]) + ' ' + pt([x - 16 * s, y - 5 * s]) + 'Z', tw = '';
    for (var i = 0; i < 9; i++) { var tx = x + (r() - 0.5) * 30 * s, ty = y - (r() * 5) * s; tw += 'M' + pt([tx - 5 * s, ty]) + 'l' + n(10 * s) + ',' + n((r() - 0.5) * 4 * s); }
    return o + body(c, bowl, '#8a6a3a', L(tw, '#5a3e22', 1 * s), 1.5 * s) + L(tw, '#b08a54', 0.8 * s, 0.8);
  }
  // Keldrun banner: iron pole, gold finial, blue cloth with gold border + anvil emblem
  function dwBanner(c, x, y, h, col) {
    col = col || '#2a4a8e';
    var top = y - h, o = '', bw = 18, bh = h * 0.56, gold = '#e0b040';
    o += limb('M' + x + ',' + y + ' L' + x + ',' + n(top - 4), '#4a4a50', 2.4) + limb('M' + n(x - 3) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top), '#4a4a50', 2) + C(x, top - 6, 2.8, c.cel(gold), 1.3) + C(x + 20, top, 1.8, c.cel(gold), 1.1);
    var d = 'M' + n(x) + ',' + n(top) + ' L' + n(x + bw) + ',' + n(top) + ' L' + n(x + bw) + ',' + n(top + bh) + ' L' + n(x + bw / 2) + ',' + n(top + bh + 7) + ' L' + n(x) + ',' + n(top + bh) + ' Z';
    var ex = x + bw / 2, ey = top + bh * 0.46;
    o += body(c, d, col, F('M' + n(x + 12) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top) + ' L' + n(x + 20) + ',' + n(top + bh + 8) + ' L' + n(x + 12) + ',' + n(top + bh + 4) + ' Z', dk(col, 0.3), 0.75) +
      L('M' + n(x + 2) + ',' + n(top + 2) + ' L' + n(x + 2) + ',' + n(top + bh - 1) + ' L' + n(x + bw / 2) + ',' + n(top + bh + 4.6) + ' L' + n(x + bw - 2) + ',' + n(top + bh - 1) + ' L' + n(x + bw - 2) + ',' + n(top + 2), gold, 1.2) +
      F('M' + n(ex - 6) + ',' + n(ey - 3) + ' L' + n(ex + 6) + ',' + n(ey - 3) + ' L' + n(ex + 4) + ',' + n(ey) + ' L' + n(ex + 2) + ',' + n(ey) + ' L' + n(ex + 3) + ',' + n(ey + 4) + ' L' + n(ex - 3) + ',' + n(ey + 4) + ' L' + n(ex - 2) + ',' + n(ey) + ' L' + n(ex - 4) + ',' + n(ey) + ' Z', gold), 1.6);
    return o;
  }
  // dwarven stone bunker: squat block walls, merlons, iron-bound arched door, carved lintel
  function bunker(c, x, y, s) {
    var st = '#8e887c', o = E(x, y + 2, 64 * s, 6 * s, '#000', 0, 0.25);
    // side wing walls
    [-1, 1].forEach(function (sg) {
      var wx = x + sg * 58 * s, d = 'M' + pt([wx - 16 * s, y]) + 'L' + pt([wx - 15 * s, y - 20 * s]) + 'L' + pt([wx + 15 * s, y - 20 * s]) + 'L' + pt([wx + 16 * s, y]) + 'Z', j = '';
      for (var k = 1; k < 3; k++) j += 'M' + pt([wx - 16 * s, y - k * 7 * s]) + 'L' + pt([wx + 16 * s, y - k * 7 * s]);
      for (var q = -2; q <= 2; q++) j += 'M' + pt([wx + (q * 7 + (q % 2 ? 3 : 0)) * s, y - 7 * s]) + 'L' + pt([wx + (q * 7 + (q % 2 ? 3 : 0)) * s, y - 14 * s]);
      o += body(c, d, dk(st, 0.06), L(j, dk(st, 0.35), 1 * s) + (sg > 0 ? F('M' + pt([wx + 2 * s, y - 22 * s]) + 'L' + pt([wx + 18 * s, y - 22 * s]) + 'L' + pt([wx + 18 * s, y + 2]) + 'L' + pt([wx + 2 * s, y + 2]) + 'Z', dk(st, 0.28), 0.8) : ''), 1.6 * s);
    });
    // main block
    var bd = 'M' + pt([x - 44 * s, y]) + 'L' + pt([x - 42 * s, y - 40 * s]) + 'L' + pt([x + 42 * s, y - 40 * s]) + 'L' + pt([x + 44 * s, y]) + 'Z', jn = '';
    for (var row = 1; row < 5; row++) jn += 'M' + pt([x - 44 * s, y - row * 8 * s]) + 'L' + pt([x + 44 * s, y - row * 8 * s]);
    for (var rr = 0; rr < 5; rr++) for (var cc = -5; cc <= 5; cc++) { var jx = x + (cc * 9 + (rr % 2 ? 4.5 : 0)) * s; jn += 'M' + pt([jx, y - rr * 8 * s]) + 'L' + pt([jx, y - (rr + 1) * 8 * s]); }
    o += body(c, bd, st, L(jn, dk(st, 0.32), 1 * s) + F('M' + pt([x + 22 * s, y - 42 * s]) + 'L' + pt([x + 46 * s, y - 42 * s]) + 'L' + pt([x + 46 * s, y + 2]) + 'L' + pt([x + 22 * s, y + 2]) + 'Z', dk(st, 0.28), 0.8) +
      E(x - 26 * s, y - 30 * s, 8 * s, 3 * s, lt(st, 0.25), 0, 0.6) + F('M' + pt([x - 46 * s, y - 6 * s]) + 'L' + pt([x + 46 * s, y - 6 * s]) + 'L' + pt([x + 46 * s, y + 2]) + 'L' + pt([x - 46 * s, y + 2]) + 'Z', '#7a6040', 0.4), 2 * s);
    // merlons
    for (var m = -4; m <= 4; m++) { var mx = x + m * 10 * s; o += P('M' + pt([mx - 4 * s, y - 39 * s]) + 'L' + pt([mx - 4 * s, y - 47 * s]) + 'L' + pt([mx + 4 * s, y - 47 * s]) + 'L' + pt([mx + 4 * s, y - 39 * s]) + 'Z', c.cel(m > 1 ? dk(st, 0.2) : st), 1.5 * s); }
    // arched iron-bound door
    var dd = 'M' + pt([x - 11 * s, y + 1]) + 'L' + pt([x - 11 * s, y - 18 * s]) + 'Q' + pt([x, y - 30 * s]) + ' ' + pt([x + 11 * s, y - 18 * s]) + 'L' + pt([x + 11 * s, y + 1]) + 'Z';
    o += body(c, dd, '#5a3a22', L('M' + pt([x - 11 * s, y - 14 * s]) + 'L' + pt([x + 11 * s, y - 14 * s]) + 'M' + pt([x - 11 * s, y - 5 * s]) + 'L' + pt([x + 11 * s, y - 5 * s]), '#3a3a40', 2.2 * s) + L('M' + pt([x, y - 25 * s]) + 'L' + pt([x, y + 1]), '#2a1a10', 1.2 * s) + C(x - 3 * s, y - 9 * s, 1.2 * s, '#e0b040') + C(x + 3 * s, y - 9 * s, 1.2 * s, '#e0b040'), 1.8 * s);
    o += L('M' + pt([x - 14 * s, y + 1]) + 'L' + pt([x - 14 * s, y - 19 * s]) + 'Q' + pt([x, y - 35 * s]) + ' ' + pt([x + 14 * s, y - 19 * s]) + 'L' + pt([x + 14 * s, y + 1]), OL, 7 * s) + L('M' + pt([x - 14 * s, y + 1]) + 'L' + pt([x - 14 * s, y - 19 * s]) + 'Q' + pt([x, y - 35 * s]) + ' ' + pt([x + 14 * s, y - 19 * s]) + 'L' + pt([x + 14 * s, y + 1]), lt(st, 0.12), 4.4 * s);
    // carved keystone with a gold anvil
    o += P('M' + pt([x - 5 * s, y - 33 * s]) + 'L' + pt([x + 5 * s, y - 33 * s]) + 'L' + pt([x + 4 * s, y - 25 * s]) + 'L' + pt([x - 4 * s, y - 25 * s]) + 'Z', c.cel(lt(st, 0.1)), 1.4 * s) + F('M' + pt([x - 3 * s, y - 31 * s]) + 'L' + pt([x + 3 * s, y - 31 * s]) + 'L' + pt([x + 1 * s, y - 29 * s]) + 'L' + pt([x + 2 * s, y - 27 * s]) + 'L' + pt([x - 2 * s, y - 27 * s]) + 'L' + pt([x - 1 * s, y - 29 * s]) + 'Z', '#c8962a');
    // slit windows with lamplight
    [-28, 28].forEach(function (wx) { o += C(x + wx * s, y - 24 * s, 7 * s, glow(c, '#ffc860', 0.45)) + R(x + (wx - 2.4) * s, y - 30 * s, 4.8 * s, 12 * s, '#ffcf70', 1.3 * s); });
    return o;
  }
  // wooden scaffold: posts, cross-braces, plank decks, ladder, pulley arm with a bucket
  function scaffold(c, x, y, w, h, s) {
    var wood = '#8a5e34', o = E(x + w / 2, y + 2, w * 0.6, 4 * s, '#000', 0, 0.2), cols = [x, x + w * 0.5, x + w], lv = [y - h * 0.5, y - h];
    var posts = '', braces = '';
    cols.forEach(function (px) { posts += 'M' + pt([px, y]) + 'L' + pt([px, y - h - 6 * s]); });
    for (var i = 0; i < 2; i++) { var yb = i ? lv[0] : y, yt = lv[i]; braces += 'M' + pt([cols[0], yb]) + 'L' + pt([cols[1], yt]) + 'M' + pt([cols[1], yb]) + 'L' + pt([cols[2], yt]); }
    o += limb(braces, dk(wood, 0.18), 2 * s) + limb(posts, wood, 3.2 * s);
    lv.forEach(function (ly) { o += R(x - 6 * s, ly - 3 * s, w + 12 * s, 5 * s, c.cel('#a8743e'), 1.4 * s) + L('M' + pt([x + w * 0.2, ly - 3 * s]) + 'L' + pt([x + w * 0.2, ly + 2 * s]) + 'M' + pt([x + w * 0.66, ly - 3 * s]) + 'L' + pt([x + w * 0.66, ly + 2 * s]), dk('#a8743e', 0.4), 1 * s); });
    // ladder
    var lx = x + w * 0.74, rungs = 'M' + pt([lx, y]) + 'L' + pt([lx + 2 * s, lv[0] - 3 * s]) + 'M' + pt([lx + 7 * s, y]) + 'L' + pt([lx + 9 * s, lv[0] - 3 * s]);
    for (var k = 1; k < 6; k++) { var ry = y - (y - lv[0]) * k / 6; rungs += 'M' + pt([lx + 0.4 * s * k, ry]) + 'L' + pt([lx + 7 * s + 0.4 * s * k, ry]); }
    o += L(rungs, OL, 3.2 * s) + L(rungs, '#c8965a', 1.4 * s);
    // pulley arm + rope + bucket
    var ax = x + w + 18 * s, ay = y - h - 4 * s;
    o += limb('M' + pt([x + w, y - h - 4 * s]) + 'L' + pt([ax, ay]), wood, 2.6 * s) + C(ax, ay + 2 * s, 2.4 * s, '#6a6460', 1 * s) + L('M' + pt([ax + 1, ay + 3 * s]) + 'L' + pt([ax + 1, y - h * 0.3]), '#3a2a1a', 1 * s);
    o += body(c, 'M' + pt([ax - 5 * s, y - h * 0.3]) + 'L' + pt([ax + 6 * s, y - h * 0.3]) + 'L' + pt([ax + 4 * s, y - h * 0.3 + 9 * s]) + 'L' + pt([ax - 3 * s, y - h * 0.3 + 9 * s]) + 'Z', '#7a5030', '', 1.4 * s) + E(ax + 0.5 * s, y - h * 0.3, 5.5 * s, 1.4 * s, '#8a6a44', 1 * s);
    return o;
  }
  // excavation pit: raised spoil rim, terraced dark hole, ladder poking out
  function pit(c, x, y, rx, ry, ladder) {
    var o = E(x, y + ry * 0.3, rx + 8, ry + 4, '#9a7446', 0, 0.7), r = rng(Math.round(x * 3 + rx));
    for (var i = 0; i < 7; i++) { var a = Math.PI * (1.05 + 0.9 * i / 6), cx = x + Math.cos(a) * (rx + 3), cy = y + Math.sin(a) * (ry + 1.5), w = 5 + r() * 5; o += P('M' + pt([cx - w, cy + 1]) + 'Q' + pt([cx, cy - w * 0.7]) + ' ' + pt([cx + w, cy + 1]) + 'Z', c.cel('#b89058'), 1.2); }
    var d = ellD(x, y, rx, ry);
    o += P(d, c.lg([[0, '#2a1a10'], [0.6, '#4a3020'], [1, '#6a4a2c']]), 1.8);
    o += '<g clip-path="url(#' + c.clip(d) + ')">' + E(x, y - ry * 0.55, rx * 0.9, ry * 0.6, '#1a100a', 0, 0.9) + L('M' + pt([x - rx * 0.8, y + ry * 0.1]) + 'Q' + pt([x, y + ry * 0.55]) + ' ' + pt([x + rx * 0.8, y + ry * 0.1]), '#8a6a44', 1.6, 0.8) + E(x + rx * 0.3, y + ry * 0.55, rx * 0.35, ry * 0.25, '#7a5a38', 0, 0.8) + '</g>';
    if (ladder) {
      var lx = x + rx * 0.3, lr = 'M' + pt([lx, y + ry * 0.3]) + 'L' + pt([lx - 3, y - ry - 14]) + 'M' + pt([lx + 7, y + ry * 0.3]) + 'L' + pt([lx + 4, y - ry - 14]);
      for (var k = 0; k < 4; k++) { var t = k / 4, yy = y + ry * 0.3 - t * (ry * 1.3 + 14); lr += 'M' + pt([lx - 3 * t, yy]) + 'L' + pt([lx + 7 - 3 * t, yy]); }
      o += L(lr, OL, 3) + L(lr, '#c8965a', 1.4);
    }
    return o;
  }
  // spoil heap with a pick stuck in it
  function dirtPile(c, x, y, s, pick) {
    var col = '#b08450', d = 'M' + pt([x - 20 * s, y]) + 'C' + pt([x - 16 * s, y - 10 * s]) + ' ' + pt([x - 6 * s, y - 16 * s]) + ' ' + pt([x + 2 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 16 * s]) + ' ' + pt([x + 18 * s, y - 8 * s]) + ' ' + pt([x + 22 * s, y]) + 'Z';
    var o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.22);
    if (pick) o += limb('M' + pt([x + 2 * s, y - 12 * s]) + 'L' + pt([x + 12 * s, y - 32 * s]), '#7a5030', 2.2 * s) + P('M' + pt([x + 1 * s, y - 36 * s]) + 'Q' + pt([x + 12 * s, y - 38 * s]) + ' ' + pt([x + 22 * s, y - 28 * s]) + 'L' + pt([x + 20 * s, y - 26 * s]) + 'Q' + pt([x + 12 * s, y - 33 * s]) + ' ' + pt([x + 2 * s, y - 33 * s]) + 'Z', c.cel('#9a9690'), 1.3 * s);
    return o + body(c, d, col, F('M' + pt([x + 4 * s, y - 18 * s]) + 'C' + pt([x + 14 * s, y - 14 * s]) + ' ' + pt([x + 20 * s, y - 6 * s]) + ' ' + pt([x + 24 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(col, 0.25), 0.8) + E(x - 8 * s, y - 6 * s, 2.4 * s, 1.2 * s, '#7a5a34') + E(x + 6 * s, y - 4 * s, 2 * s, 1 * s, '#7a5a34') + E(x - 2 * s, y - 12 * s, 2 * s, 1 * s, lt(col, 0.2)), 1.6 * s);
  }

  // ============================================================
  //  WAILING CAVERNS PIECES (caves under the oasis: glowing fungi, purple vines, twisting roots)
  // ============================================================
  var WCG = '#8aff6a', WCP = '#c07aff', ROOT = '#5a4630';
  // outlined stalactites hanging from y (list of [x, w, h])
  function stalac(c, y, list, col) {
    var o = '';
    list.forEach(function (q) {
      var x = q[0], w = q[1], h = q[2], d = 'M' + pt([x - w, y]) + 'Q' + pt([x - w * 0.45, y + h * 0.55]) + ' ' + pt([x, y + h]) + 'Q' + pt([x + w * 0.35, y + h * 0.5]) + ' ' + pt([x + w, y]) + 'Z';
      o += body(c, d, col, F('M' + pt([x + w * 0.1, y - 2]) + 'L' + pt([x + w + 2, y - 2]) + 'L' + pt([x + 2, y + h + 2]) + 'Z', dk(col, 0.3), 0.85) + L('M' + pt([x - w * 0.5, y + 2]) + 'Q' + pt([x - w * 0.35, y + h * 0.4]) + ' ' + pt([x - 1, y + h * 0.8]), lt(col, 0.2), 1.2, 0.7), 1.6);
    });
    return o;
  }
  // flat distant stalactites (no outline)
  function farDrips(seed, y, col, cnt, maxH) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = -10 + 420 * (i + r() * 0.8) / cnt, w = 4 + r() * 8, h = maxH * (0.35 + r() * 0.65); d += 'M' + pt([x - w, y - 2]) + 'Q' + pt([x - w * 0.3, y + h * 0.5]) + ' ' + pt([x, y + h]) + 'Q' + pt([x + w * 0.3, y + h * 0.5]) + ' ' + pt([x + w, y - 2]) + 'Z'; }
    return F(d, col);
  }
  // twisting root: thick outlined stroke with a thinner root spiralling round it
  function wcRoot(c, p0, p1, p2, p3, w, col, seed) {
    col = col || ROOT;
    var d = 'M' + pt(p0) + 'C' + pt(p1) + ' ' + pt(p2) + ' ' + pt(p3), tw = '', tw2 = '', r = rng(seed || 3), ph = r() * 3;
    for (var i = 0; i <= 28; i++) {
      var t = i / 28, q = bez(p0, p1, p2, p3, t), a = Math.sin(t * Math.PI * 5 + ph) * w * 0.55, b = Math.sin(t * Math.PI * 5 + ph + Math.PI) * w * 0.55;
      tw += (i ? 'L' : 'M') + pt([q[0] + q[2] * a, q[1] + q[3] * a]); tw2 += (i ? 'L' : 'M') + pt([q[0] + q[2] * b, q[1] + q[3] * b]);
    }
    var nubs = '';
    for (var k = 1; k < 4; k++) { var q2 = bez(p0, p1, p2, p3, k / 4 + (r() - 0.5) * 0.1), sg = k % 2 ? 1 : -1, len = w * (1.4 + r()); nubs += 'M' + pt([q2[0], q2[1]]) + 'q' + n(q2[2] * sg * len * 0.6 + 2) + ',' + n(q2[3] * sg * len * 0.6 + 3) + ' ' + n(q2[2] * sg * len) + ',' + n(q2[3] * sg * len + 6); }
    return L(nubs, OL, w * 0.45 + 3) + L(nubs, dk(col, 0.1), w * 0.45) + L(d, OL, w + 4) + L(d, col, w) + L(tw2, dk(col, 0.35), w * 0.3, 0.9) + L(tw, OL, w * 0.42 + 2.4) + L(tw, lt(col, 0.12), w * 0.42) + L(d, lt(col, 0.28), w * 0.16, 0.6);
  }
  // hanging purple vine with leaves and a glowing bulb at the tip
  function vine(c, x, y, len, seed, col) {
    col = col || '#7a3aa8';
    var r = rng(seed || 5), sw = (r() - 0.5) * 16, d = 'M' + pt([x, y]) + 'C' + pt([x + sw, y + len * 0.3]) + ' ' + pt([x - sw, y + len * 0.65]) + ' ' + pt([x + sw * 0.4, y + len]), lv = '';
    var p0 = [x, y], p1 = [x + sw, y + len * 0.3], p2 = [x - sw, y + len * 0.65], p3 = [x + sw * 0.4, y + len];
    for (var i = 1; i < 6; i++) {
      var q = bez(p0, p1, p2, p3, i / 6.4), sg = i % 2 ? 1 : -1, lx = q[0] + sg * 7, ly = q[1] + 3;
      lv += P('M' + pt([q[0], q[1]]) + 'Q' + pt([q[0] + sg * 4, q[1] - 3]) + ' ' + pt([lx, ly]) + 'Q' + pt([q[0] + sg * 2, q[1] + 4]) + ' ' + pt([q[0], q[1]]) + 'Z', i % 2 ? '#5a8a3a' : '#4a7a34', 1);
    }
    return L(d, OL, 4.2) + L(d, col, 2) + lv + C(p3[0], p3[1] + 2, 9, glow(c, WCP, 0.7)) + C(p3[0], p3[1] + 2, 2.8, lt(WCP, 0.4), 1.2);
  }
  // cluster of glowing mushrooms (list of [dx, h, capW]) around x,y
  function shrooms(c, x, y, s, cap, list, stem) {
    cap = cap || WCG; stem = stem || '#d8dcc0';
    list = list || [[-10, 12, 7], [0, 20, 10], [9, 9, 6], [15, 14, 5]];
    var o = C(x, y - 10 * s, 34 * s, glow(c, cap, 0.42)) + E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.25);
    list.forEach(function (m) {
      var mx = x + m[0] * s, h = m[1] * s, w = m[2] * s, cy = y - h;
      o += P('M' + pt([mx - w * 0.22, y]) + 'C' + pt([mx - w * 0.28, y - h * 0.5]) + ' ' + pt([mx - w * 0.1, y - h * 0.8]) + ' ' + pt([mx - w * 0.12, cy]) + 'L' + pt([mx + w * 0.16, cy]) + 'C' + pt([mx + w * 0.12, y - h * 0.6]) + ' ' + pt([mx + w * 0.3, y - h * 0.3]) + ' ' + pt([mx + w * 0.26, y]) + 'Z', c.cel(stem), 1.3 * Math.max(0.7, s));
      var cd = 'M' + pt([mx - w, cy + w * 0.12]) + 'C' + pt([mx - w, cy - w * 0.9]) + ' ' + pt([mx + w, cy - w * 0.9]) + ' ' + pt([mx + w, cy + w * 0.12]) + 'Q' + pt([mx, cy - w * 0.12]) + ' ' + pt([mx - w, cy + w * 0.12]) + 'Z';
      o += body(c, cd, cap, F('M' + pt([mx + w * 0.2, cy - w]) + 'L' + pt([mx + w * 1.2, cy - w]) + 'L' + pt([mx + w * 1.2, cy + w * 0.3]) + 'L' + pt([mx + w * 0.3, cy + w * 0.3]) + 'Z', dk(cap, 0.3), 0.7) + E(mx - w * 0.4, cy - w * 0.36, w * 0.24, w * 0.14, '#ffffff', 0, 0.7) + C(mx + w * 0.1, cy - w * 0.5, w * 0.1, lt(cap, 0.6)), 1.3 * Math.max(0.7, s));
    });
    return o;
  }
  // giant cave mushroom: curved stem, broad glowing cap with gills and spots
  function bigShroom(c, x, y, s, cap, lean, stem) {
    cap = cap || '#9a5ae0'; stem = stem || '#cfd2b4'; lean = lean || 0;
    var h = 96 * s, tx = x + lean * s, ty = y - h, w = 40 * s, o = E(x, y + 2, 20 * s, 4 * s, '#000', 0, 0.3);
    var sd = 'M' + pt([x - 8 * s, y]) + 'C' + pt([x - 6 * s, y - h * 0.4]) + ' ' + pt([tx - 10 * s, ty + h * 0.3]) + ' ' + pt([tx - 6 * s, ty]) + 'L' + pt([tx + 6 * s, ty]) + 'C' + pt([tx + 2 * s, ty + h * 0.3]) + ' ' + pt([x + 8 * s, y - h * 0.4]) + ' ' + pt([x + 10 * s, y]) + 'Z';
    o += body(c, sd, stem, F('M' + pt([x + 2 * s, y + 2]) + 'C' + pt([x + 2 * s, y - h * 0.4]) + ' ' + pt([tx - 2 * s, ty + h * 0.3]) + ' ' + pt([tx + 1 * s, ty - 2]) + 'L' + pt([tx + 20 * s, ty]) + 'L' + pt([x + 20 * s, y + 2]) + 'Z', dk(stem, 0.28), 0.85) +
      L('M' + pt([x - 4 * s, y - h * 0.2]) + 'l' + n(3 * s) + ',' + n(-6 * s) + 'M' + pt([x - 5 * s, y - h * 0.5]) + 'l' + n(3 * s) + ',' + n(-5 * s), dk(stem, 0.3), 1.2 * s), 2 * s);
    o += E(tx, ty + 4 * s, w * 0.8, 6 * s, c.cel(dk(cap, 0.45)), 1.6 * s);
    var gl = '';
    for (var i = -5; i <= 5; i++) gl += 'M' + pt([tx, ty + 6 * s]) + 'L' + pt([tx + i * w * 0.14, ty + 2 * s]);
    o += L(gl, dk(cap, 0.65), 1 * s, 0.8);
    var cd = 'M' + pt([tx - w, ty + 2 * s]) + 'C' + pt([tx - w * 1.02, ty - w * 0.62]) + ' ' + pt([tx - w * 0.4, ty - w * 0.78]) + ' ' + pt([tx, ty - w * 0.78]) + 'C' + pt([tx + w * 0.4, ty - w * 0.78]) + ' ' + pt([tx + w * 1.02, ty - w * 0.62]) + ' ' + pt([tx + w, ty + 2 * s]) + 'C' + pt([tx + w * 0.6, ty - 4 * s]) + ' ' + pt([tx - w * 0.6, ty - 4 * s]) + ' ' + pt([tx - w, ty + 2 * s]) + 'Z';
    var sp = '';
    [[-0.55, -0.4, 0.13], [-0.1, -0.6, 0.1], [0.35, -0.45, 0.12], [0.7, -0.2, 0.08], [-0.8, -0.12, 0.07], [0.05, -0.25, 0.07]].forEach(function (q) { sp += E(tx + q[0] * w, ty + q[1] * w, q[2] * w, q[2] * w * 0.7, lt(cap, 0.55), 1 * s); });
    o += body(c, cd, cap, F('M' + pt([tx + w * 0.25, ty - w]) + 'C' + pt([tx + w * 0.7, ty - w * 0.7]) + ' ' + pt([tx + w * 1.1, ty - w * 0.4]) + ' ' + pt([tx + w * 1.1, ty + 4 * s]) + 'L' + pt([tx + w * 0.3, ty + 4 * s]) + 'Z', dk(cap, 0.3), 0.8) + sp + E(tx - w * 0.5, ty - w * 0.52, w * 0.2, w * 0.08, '#ffffff', 0, 0.6), 2 * s);
    return C(tx, ty - 6 * s, w * 1.9, glow(c, cap, 0.45)) + o;
  }
  // cave waterfall from a ledge into a pool
  function waterfall(c, x, top, bot, w) {
    var d = 'M' + pt([x - w * 0.5, top]) + 'C' + pt([x - w * 0.55, top + (bot - top) * 0.4]) + ' ' + pt([x - w * 0.75, bot - 20]) + ' ' + pt([x - w * 0.8, bot]) + 'L' + pt([x + w * 0.8, bot]) + 'C' + pt([x + w * 0.75, bot - 20]) + ' ' + pt([x + w * 0.55, top + (bot - top) * 0.4]) + ' ' + pt([x + w * 0.5, top]) + 'Z';
    var st = '', r = rng(Math.round(x + top));
    for (var i = 0; i < 7; i++) { var sx = x + (i / 6 - 0.5) * w * 0.9, k = (i / 6 - 0.5) * 0.4; st += 'M' + pt([sx, top + 4 + r() * 10]) + 'L' + pt([sx + k * w * 0.8, bot - 4 - r() * 20]); }
    var o = C(x, bot - 10, w * 2.4, glow(c, '#bfffe0', 0.4)) + P(d, c.lg([[0, '#cfffe8'], [0.4, '#7ae8c0'], [1, '#48c8a0']], 0, 0, 1, 0), 1.8);
    o += '<g clip-path="url(#' + c.clip(d) + ')">' + L(st, '#ffffff', 1.4, 0.7) + F('M' + pt([x + w * 0.15, top]) + 'L' + pt([x + w, top]) + 'L' + pt([x + w, bot]) + 'L' + pt([x + w * 0.3, bot]) + 'Z', '#1a6a5a', 0.3) + '</g>';
    o += E(x, bot - 2, w * 1.3, 7, '#e8fff4', 0, 0.45) + E(x - w * 0.5, bot - 4, w * 0.5, 5, '#ffffff', 0, 0.5) + E(x + w * 0.5, bot - 3, w * 0.45, 4, '#ffffff', 0, 0.5) + E(x, bot, w * 1.1, 3, '#ffffff', 0, 0.8);
    return o;
  }
  // mossy boulder with a glow rim
  function mossRock(c, x, y, w, h, col) {
    col = col || '#3e4640';
    return rock(c, x, y, w, h, col) + F('M' + pt([x - w * 0.45, y - h * 0.62]) + 'C' + pt([x - w * 0.3, y - h * 1.02]) + ' ' + pt([x + w * 0.1, y - h * 1.04]) + ' ' + pt([x + w * 0.3, y - h * 0.88]) + 'C' + pt([x + w * 0.1, y - h * 0.8]) + ' ' + pt([x - w * 0.2, y - h * 0.78]) + ' ' + pt([x - w * 0.45, y - h * 0.62]) + 'Z', '#5a8a3a', 0.9);
  }
  // low mist: soft horizontal band plus a few long faint wisps
  function mist(c, y, h, col, op, seed) {
    var o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]])), r = rng(seed || 9);
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.5, 40 + r() * 40, 3 + r() * 3, col, 0, op * 0.8);
    return o;
  }
  function caveFloor(c, y, top, bot, seed) {
    var o = ground(c, y, top, bot), r = rng(seed);
    for (var i = 0; i < 9; i++) o += E(r() * 400, y + 10 + r() * 80, 20 + r() * 30, 3 + r() * 4, '#3e6a34', 0, 0.35);
    return o + pebbles(seed + 1, y + 10, 236, '#0e140e', 18) + cracks(seed + 2, y + 30, 238, '#0e1410', 8);
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
      // the red ridge on the Dunescar border
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
      o += briarTotem(c, 112, 190, 66, 1) + briarTotem(c, 296, 186, 60, 0.9);
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
    },
    sludge_fen: function (c) {
      var o = sky(c, '#6a6656', '#958c6a', '#bca87a') + C(304, 48, 44, glow(c, '#f4dc90', 0.4)) + C(304, 48, 10, '#ecdca4', 0, 0.85);
      o += smog(84, 40, 1.4, '#4a463a', 0.3) + smog(236, 28, 1.2, '#524c3e', 0.28) + smog(370, 74, 1, '#5a5444', 0.3);
      o += hills(c, 161, 150, 12, '#6e6a4c', 50);
      o += farDerrick(28, 150, 1, '#4e4a3a') + farDerrick(128, 148, 0.8, '#57523f') + farDerrick(226, 150, 0.9, '#4e4a3a') + farDerrick(392, 148, 0.7, '#57523f');
      o += smog(200, 148, 1.8, '#8a8468', 0.4);
      o += ground(c, 150, '#5e5634', '#3a3420');
      o += grass(163, 152, 238, '#34341c', 80, 0.6, 1.8, 1.1) + grass(165, 154, 238, '#6e6e36', 40, 0.6, 1.6, 1) + pebbles(167, 164, 236, '#2a2618', 16);
      o += F('M-4,200 C60,194 120,198 150,206 C110,214 40,214 -4,212 Z', '#2a2618', 0.45) + F('M404,204 C340,198 290,204 262,212 C300,220 360,220 404,216 Z', '#2a2618', 0.45);
      o += pipe(c, [[-6, 163], [84, 163], [98, 157], [226, 157], [240, 163], [406, 163]], 5, '#7a746a');
      o += shack(c, 148, 160, 0.8) + shack(c, 272, 158, 0.72, '#7e8886', '#8a4a2a');
      o += pumpjack(c, 212, 170, 0.74);
      o += derrick(c, 62, 174, 1, true) + derrick(c, 346, 172, 0.92);
      o += barrel(c, 116, 176, 0.75, '#4a4a40') + barrel(c, 128, 180, 0.75, RUST) + crate(c, 300, 180, 0.8) + barrel(c, 286, 182, 0.75, '#5a5a4e');
      o += sludge(c, 204, 192, 72, 9, 171) + sludge(c, 34, 226, 34, 6, 173) + sludge(c, 372, 230, 30, 5, 175);
      o += reeds(c, 136, 194, 0.9, '#5a6a2a') + reeds(c, 276, 196, 0.8, '#5a6a2a') + reeds(c, 8, 226, 1, '#4a5a24');
      o += deadTree(c, 98, 186, 0.75) + deadTree(c, 392, 206, 0.95);
      o += pipe(c, [[-6, 240], [26, 240], [44, 250]], 6, '#6a645a');
      return o + vignette(c, '#e0d8b0', '#0a0806');
    },
    lushwater_oasis: function (c) {
      var o = barSky(c, 86, 36) + cloud(200, 30, 1.1, 0.8) + cloud(336, 50, 0.8, 0.75);
      o += hills(c, 181, 150, 10, '#b4c08c', 60) + farAcacia(30, 150, 0.9, '#8a9a54') + farAcacia(236, 149, 1, '#8a9a54') + farAcacia(372, 151, 0.8, '#8a9a54') + haze(c, 152);
      o += ground(c, 150, '#bab860', '#8c8e40');
      o += grass(183, 152, 238, '#687a2a', 110, 0.6, 1.8, 1.1) + grass(185, 154, 238, '#a8c060', 60, 0.6, 1.6, 1) + flowers(187, 196, 236, ['#f4e070', '#ffffff', '#e86a4a'], 16);
      // green bank ring + clear blue water
      o += E(200, 172, 152, 22, '#5e8e36', 0, 0.85);
      o += pool(c, 200, 170, 136, 15, '#5cc4e4', '#1e6ea8', '#5a7a32');
      o += lily(116, 174, 1.2, true) + lily(146, 178, 1) + lily(264, 175, 1.1, true) + lily(292, 168, 0.9);
      o += lurker(c, 196, 172, 1.1) + lurker(c, 250, 164, 0.8);
      o += palm(c, 272, 162, 0.62, 8) + palm(c, 70, 170, 0.9, 12) + palm(c, 332, 168, 1, -10);
      o += reeds(c, 88, 180, 1.1, '#5a8a2a') + reeds(c, 316, 182, 1.1, '#5a8a2a') + reeds(c, 168, 184, 0.8, '#5a8a2a') + reeds(c, 234, 186, 0.8, '#5a8a2a');
      o += bankCroc(c, 132, 190, 0.74) + bankCroc(c, 292, 192, 0.78, true);
      o += palm(c, 18, 190, 1.1, 18) + palm(c, 388, 192, 1.05, -16);
      o += nest(c, 44, 222, 1) + nest(c, 360, 228, 0.9);
      o += tufts(c, [[160, 236, 0.8], [252, 238, 0.9]], '#8aa040');
      return o + vignette(c, '#fff8e0', '#10200a');
    },
    baeldun_digsite: function (c) {
      var o = barSky(c, 330, 40) + cloud(120, 36, 1, 0.7) + cloud(240, 22, 0.7, 0.65);
      o += farMesa(-10, 150, 130, 34, '#c8946a', '#b07c58', null) + farMesa(270, 150, 150, 24, '#c29272', '#a87a5a', null);
      o += hills(c, 191, 152, 16, '#c8b080', 50) + haze(c, 154);
      // dry hillside the dig cuts into
      var hc = '#b88a58';
      o += body(c, 'M-4,168 C16,142 52,124 94,122 C128,120 156,138 176,168 Z', hc, F('M110,120 C140,128 160,148 178,170 L140,170 C132,150 124,134 110,120 Z', dk(hc, 0.25), 0.85) + F('M40,142 C60,134 84,132 100,136 L104,168 L36,168 Z', '#6a4a2c', 0.55) + L('M20,156 Q90,150 160,156', dk(hc, 0.2), 1.4, 0.7), 2);
      o += ground(c, 158, '#d4b474', '#a88a4c');
      o += scaffold(c, 38, 170, 72, 44, 1);
      o += F('M60,184 C120,176 200,176 250,184 C210,194 110,196 60,184 Z', '#a07a48', 0.45) + F('M280,226 C320,218 380,220 404,226 L404,238 C360,240 300,236 280,226 Z', '#a07a48', 0.4);
      o += cracks(193, 190, 238, CRACK, 10) + grass(195, 160, 238, DRY, 70, 0.6, 1.8, 1.1) + grass(197, 162, 238, DRYL, 30, 0.6, 1.6, 1) + pebbles(199, 170, 236, '#8a6a3a', 18);
      o += bunker(c, 310, 174, 0.95);
      o += dwBanner(c, 244, 176, 50) + dwBanner(c, 364, 176, 50);
      o += rails(300, 184, 120, 196, 2.4, 3.4);
      o += pit(c, 172, 182, 34, 6, true) + pit(c, 30, 220, 22, 5);
      o += dirtPile(c, 124, 184, 0.9, true) + dirtPile(c, 232, 186, 0.75);
      o += minecart(c, 262, 190, 0.9, '#9a7a50');
      o += crate(c, 386, 200, 0.9) + crate(c, 374, 206, 0.8) + barrel(c, 206, 176, 0.7, '#6a5a44');
      o += tufts(c, [[16, 236, 1], [390, 238, 1], [160, 236, 0.8]], TUFT);
      return o + vignette(c);
    },
    // The Dreaming Caves: the cave network under the oasis (dungeon: party left, enemies right, lower-middle kept open)
    wailing_caverns: function (c) {
      var st = '#343c36', o = R(0, 0, 400, 240, c.lg([[0, '#0c1410'], [0.5, '#1a2820'], [1, '#0e1610']]));
      o += C(200, 118, 170, glow(c, '#3a8a5a', 0.3));
      // far wall + the passage leading deeper
      o += F('M-4,156 C30,122 58,116 88,100 C118,84 150,96 178,88 C214,78 248,90 282,82 C322,74 362,98 404,92 L404,164 L-4,164 Z', '#223028');
      o += E(214, 128, 34, 30, '#070c09') + E(214, 136, 22, 18, glow(c, '#7affb0', 0.5));
      o += F('M170,158 C176,124 192,100 214,98 C236,100 252,124 258,158 Z', '#101a14', 0.5);
      o += farDrips(301, 60, '#1a241e', 22, 30);
      // back-wall glows: fungus on the far ledges
      o += shrooms(c, 118, 150, 0.6, WCG) + shrooms(c, 300, 146, 0.55, WCP, [[-8, 10, 6], [2, 16, 8], [10, 8, 5]]);
      // side walls framing the chamber
      o += body(c, 'M-4,-4 L84,-4 C70,24 86,52 66,78 C50,100 64,124 44,146 C30,160 14,164 -4,166 Z', st, F('M40,-4 L90,-4 C76,24 90,52 70,80 C56,102 68,126 48,148 L20,166 L50,166 C64,130 58,104 70,80 Z', dk(st, 0.3), 0.8) + E(20, 60, 16, 30, lt(st, 0.08), 0, 0.5), 2.2);
      o += body(c, 'M404,-4 L318,-4 C334,26 318,50 338,76 C354,98 340,124 360,144 C372,156 388,160 404,162 Z', st, F('M404,-4 L360,-4 C372,30 360,60 380,90 C392,110 384,140 404,150 Z', dk(st, 0.3), 0.8) + E(344, 40, 10, 22, lt(st, 0.08), 0, 0.5), 2.2);
      // ceiling with stalactites
      o += body(c, 'M-4,-4 L404,-4 L404,30 C384,40 364,26 344,34 C318,44 300,26 276,32 C250,38 236,22 212,26 C188,30 168,18 146,28 C122,38 104,24 84,30 C60,38 40,22 18,32 L-4,38 Z', '#2a322c', F('M-4,20 C60,30 120,16 200,22 C280,28 340,16 404,22 L404,34 C340,30 280,40 200,32 C120,26 60,40 -4,32 Z', '#1a201c', 0.7), 2);
      o += stalac(c, 28, [[104, 7, 26], [150, 6, 20], [232, 8, 30], [286, 6, 18], [60, 6, 22], [338, 7, 24]], '#2e3630');
      // twisting roots through the rock
      o += wcRoot(c, [70, -6], [96, 30], [52, 64], [74, 110], 7, ROOT, 11) + wcRoot(c, [334, -6], [310, 40], [352, 70], [330, 118], 7, '#4e3c2a', 13) + wcRoot(c, [180, 20], [186, 40], [172, 52], [178, 70], 3.6, ROOT, 15);
      o += vine(c, 126, 28, 52, 21) + vine(c, 160, 22, 34, 23) + vine(c, 250, 28, 60, 25) + vine(c, 300, 26, 40, 27) + vine(c, 40, 30, 70, 29) + vine(c, 372, 26, 64, 31);
      // floor
      o += caveFloor(c, 158, '#26382a', '#101812', 41);
      o += pool(c, 206, 168, 78, 9, '#5ad8a8', '#14463e', '#1e2e22') + E(206, 160, 70, 14, glow(c, '#8affc8', 0.5));
      o += E(170, 169, 8, 1.8, '#7ab85a', 0, 0.8) + E(236, 167, 10, 2, '#7ab85a', 0, 0.8);
      o += mossRock(c, 120, 176, 30, 16) + mossRock(c, 296, 174, 34, 18) + mossRock(c, 32, 176, 40, 26, '#343c36') + mossRock(c, 376, 176, 44, 28, '#343c36');
      o += shrooms(c, 46, 162, 1, WCG) + shrooms(c, 360, 160, 0.95, WCG, [[-12, 10, 6], [-2, 18, 9], [8, 12, 7], [15, 7, 4]]) + shrooms(c, 138, 170, 0.6, WCP, [[-6, 10, 6], [4, 14, 7]]);
      o += mist(c, 164, 22, '#aef0cc', 0.22, 71) + mist(c, 200, 30, '#aef0cc', 0.12, 73);
      // foreground corners (outside the fight band)
      o += wcRoot(c, [-8, 208], [20, 196], [40, 224], [70, 244], 8, '#4e3c2a', 17) + wcRoot(c, [408, 204], [380, 196], [364, 222], [336, 244], 8, '#4e3c2a', 19);
      o += shrooms(c, 18, 238, 1.2, WCG, [[-8, 14, 8], [4, 22, 11], [14, 10, 6]]) + shrooms(c, 386, 240, 1.15, WCP, [[-12, 10, 6], [-2, 20, 10], [10, 14, 7]]);
      return o + R(0, 0, 400, 240, c.lg([[0, '#000', 0.4], [0.3, '#000', 0], [0.8, '#000', 0], [1, '#000', 0.35]])) + vignette(c, '#aaffcc', '#000000');
    },
    // the deeper grotto: tall chamber, a waterfall into a glowing pool, giant mushrooms, purple light
    wailing_caverns_deep: function (c) {
      var st = '#2e2c3a', o = R(0, 0, 400, 240, c.lg([[0, '#0c0a14'], [0.5, '#1e1a2e'], [1, '#0e1210']]));
      o += C(90, 70, 150, glow(c, '#9a4ae0', 0.45)) + C(320, 64, 140, glow(c, '#b05af0', 0.4)) + C(204, 150, 150, glow(c, '#4ae0a0', 0.4));
      // far chamber wall, layered, lit purple
      o += F('M-4,150 C20,110 40,70 70,56 C100,42 130,60 150,52 C180,40 230,42 260,54 C290,66 320,40 350,50 C380,60 390,100 404,120 L404,160 L-4,160 Z', '#2a2440');
      o += F('M-4,156 C30,126 60,110 100,104 C140,98 170,112 200,108 C240,102 270,110 300,104 C340,98 370,120 404,128 L404,164 L-4,164 Z', '#1e1c2e');
      o += farDrips(401, 40, '#221e34', 18, 40);
      // ledge + waterfall
      o += body(c, 'M128,-4 L286,-4 C276,20 262,40 248,58 C240,68 226,72 206,70 C186,72 172,68 164,58 C150,40 136,20 128,-4 Z', '#2e2a3c', F('M232,-4 L290,-4 C280,24 262,48 246,64 L222,72 C240,50 252,24 232,-4 Z', '#1e1a2a', 0.85) + F('M166,58 C178,68 234,68 246,58 L250,64 C238,76 176,76 162,64 Z', '#4e7a3a', 0.8) + L('M150,20 Q170,30 186,26 M226,30 Q244,24 262,24', '#1e1a2a', 1.6, 0.7), 2.2);
      o += waterfall(c, 206, 64, 154, 30);
      o += stalac(c, 50, [[176, 5, 14], [236, 5, 12]], '#3a3448');
      // high ceiling
      o += body(c, 'M-4,-4 L404,-4 L404,20 C380,28 360,16 336,22 C300,32 280,14 250,18 C220,22 200,8 170,16 C140,24 120,10 90,18 C60,26 30,12 -4,24 Z', '#221e2c', '', 2);
      o += stalac(c, 16, [[40, 7, 30], [124, 6, 24], [300, 8, 34], [360, 6, 22], [210, 5, 14]], '#2a2636');
      o += vine(c, 140, 16, 58, 41) + vine(c, 270, 18, 50, 43) + vine(c, 320, 20, 74, 45) + vine(c, 80, 18, 44, 47);
      // pool
      o += caveFloor(c, 160, '#24302c', '#0e1412', 61);
      o += E(204, 166, 142, 20, '#1a2a22', 0, 0.8);
      o += pool(c, 204, 162, 128, 13, '#6affc4', '#127060', '#1a2a22') + E(204, 154, 120, 22, glow(c, '#8affd0', 0.55));
      o += L('M120,164 Q150,160 176,164 M232,166 Q262,162 290,166 M160,170 Q190,168 214,171', '#e0fff0', 1.2, 0.7);
      o += mist(c, 160, 24, '#c8fff0', 0.24, 75);
      // giant mushrooms at the sides + mid-size ones on the far bank
      o += bigShroom(c, 118, 156, 0.46, '#5ad890', 6) + bigShroom(c, 300, 154, 0.5, '#c07aff', -8);
      o += bigShroom(c, 34, 176, 1.02, '#a45af0', 12) + bigShroom(c, 372, 174, 1.08, '#4ad89a', -14, '#d8d4bc');
      o += vine(c, 14, 64, 40, 49) + vine(c, 72, 70, 30, 51) + vine(c, 334, 66, 36, 53) + vine(c, 396, 60, 44, 55);
      o += wcRoot(c, [-8, 120], [16, 110], [10, 150], [30, 170], 6, '#4a3a2e', 57) + wcRoot(c, [408, 116], [392, 112], [396, 146], [372, 168], 6, '#4a3a2e', 59);
      o += mossRock(c, 150, 180, 26, 12, '#34303e') + mossRock(c, 268, 178, 30, 14, '#34303e');
      o += shrooms(c, 88, 180, 0.8, WCG, [[-8, 10, 6], [2, 16, 8], [10, 8, 5]]) + shrooms(c, 318, 178, 0.8, WCP, [[-8, 12, 6], [2, 18, 9], [11, 9, 5]]);
      o += mist(c, 204, 30, '#d0b8ff', 0.12, 77);
      o += shrooms(c, 16, 240, 1.2, WCP, [[-8, 14, 8], [4, 22, 11], [14, 10, 6]]) + shrooms(c, 388, 240, 1.1, WCG, [[-12, 10, 6], [-2, 20, 10], [10, 14, 7]]);
      return o + R(0, 0, 400, 240, c.lg([[0, '#000', 0.35], [0.3, '#000', 0], [0.8, '#000', 0], [1, '#000', 0.35]])) + vignette(c, '#e0c8ff', '#000000');
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
  // ---- stripeback (striped antelope with straight ringed horns, mid-gallop, facing left) ----
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
    // horns: long, straight and ringed, raked up and back (oryx-like)
    var hl = o.hornLen || 1;
    [[0, dk(hc, 0.12), 0.5], [4, hc, 0]].forEach(function (h) {
      var bx = 32 + h[0], by = 26, tx = bx + 12 * hl + h[2] * 3, ty = by - 22 * hl, hL = Math.sqrt((tx - bx) * (tx - bx) + (ty - by) * (ty - by)), ux = (tx - bx) / hL, uy = (ty - by) / hL, rg = '';
      s += P('M' + pt([bx - 2.2, by + 2]) + 'L' + pt([tx - 0.5, ty]) + 'L' + pt([tx + 0.5, ty + 0.4]) + 'L' + pt([bx + 2.2, by + 1]) + 'Z', c.cel(h[1]), 1.4);
      for (var k = 1; k <= 5; k++) { var f = k * hL / 6.4, w = 2 * (1 - k / 7); rg += 'M' + pt([bx + ux * f - w, by + uy * f + 0.4]) + 'L' + pt([bx + ux * f + w, by + uy * f - 0.2]); }
      s += L(rg, dk(h[1], 0.38), 1);
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
    var col = o.col, st = o.stripe, bel = o.belly, dcol = dk(col, 0.22), s = o.noShadow ? '' : shadow(c, 62, 36), ff = o.farFoot || [82, 121], nf = o.nearFoot || [62, 121];
    var mir = function (str, x) { return o.footMirror ? G(str, 'matrix(-1,0,0,1,' + n(2 * x) + ',0)') : str; };
    s += E(80, 80, 9, 10, c.cel(dcol), 2) + limb(o.farLeg || 'M80,84 L90,98 L80,110 L82,116', dcol, 5.5) + mir(birdFoot(ff[0], ff[1], dk(col, 0.4), o.talons), ff[0]);
    var tl = 'M80,60 C96,56 110,50 118,36 C122,30 126,30 126,34 C124,44 112,62 100,72 C94,76 88,80 82,82 Z';
    s += body(c, tl, col, L('M92,56 L98,68 M102,52 L108,62 M110,46 L116,54', st, 3) + F('M84,80 C96,74 110,62 120,44 L128,50 L128,86 L84,86 Z', dk(col, 0.25), 0.7));
    s += L('M125,32 C127,26 124,20 118,20', OL, 3.4) + L('M125,32 C127,26 124,20 118,20', col, 1.4);
    var bd = 'M40,62 C44,52 60,48 76,52 C88,56 92,68 86,78 C80,86 62,88 52,84 C44,80 40,72 40,62 Z';
    s += body(c, bd, col, L('M56,50 L52,62 M66,50 L62,64 M76,52 L72,66 M84,58 L80,70', st, 3.2) + F('M36,72 C48,84 72,88 92,76 L92,92 L36,92 Z', bel, 0.9) + (o.bodyMark ? o.bodyMark(c) : ''));
    var nk = 'M46,66 C40,58 36,52 32,44 L44,38 C46,46 52,52 58,56 Z';
    s += body(c, nk, col, L('M36,48 L44,44 M40,56 L48,50', st, 2.6) + F('M30,46 L36,44 C40,54 44,60 48,66 L44,68 Z', bel, 0.8));
    // crest frill
    s += P(o.bigCrest ? 'M38,32 L44,12 L48,26 L58,14 L56,30 L68,26 L58,38 L66,42 L46,42 Z' : 'M40,30 L50,20 L48,30 L58,26 L52,36 L60,38 L46,40 Z', c.cel(o.crest || '#c83a2a'), 1.5);
    var hd = 'M42,32 C36,28 24,28 16,34 L6,40 C3,42 4,46 7,47 L18,48 C22,52 30,52 36,50 C42,48 46,42 42,32 Z';
    s += body(c, hd, col, F('M34,24 L50,24 L50,54 L38,54 C44,44 42,34 34,24 Z', dk(col, 0.22), 0.8) + L('M22,32 L28,38 M30,30 L34,36', st, 2.2) + F('M6,45 C12,48 22,50 34,50 L34,56 L4,56 Z', bel, 0.9) + (o.headMark ? o.headMark(c) : ''));
    s += P('M8,46 L18,47 C22,50 28,51 32,50 L30,54 C22,56 12,54 8,50 Z', '#5a1a14', 1.3) + P('M10,46.5 L11,49.5 L12.5,46.8 Z M15,47 L16,50 L17.5,47.2 Z M20,47.6 L21.6,50.6 L22.8,48 Z', '#fff', 0.6);
    s += L('M18,34 L27,35.5', OL, 2.2) + E(23, 37.4, 2.2, 1.7, o.eye || '#ffe040', 1) + E(22.6, 37.4, 0.6, 1.3, OL) + E(6.5, 41.6, 1, 0.8, OL);
    // little clawed arms
    if (o.talons) { var ah = o.armHand || [34, 72], tl = 'M' + pt(ah) + 'l-7,-4 M' + pt(ah) + 'l-6,3 M' + pt([ah[0] + 1, ah[1] + 1]) + 'l-3,7'; s += limb(o.arm || 'M50,66 L40,74 L34,72', col, 4.2) + L(tl, OL, 3.6) + L(tl, '#f4ecd6', 1.6); }
    else s += limb('M50,66 L40,74 L34,72', col, 3.6) + L('M34,72 L29,70 M34,72 L30,75 M35,73 L32,78', OL, 1.6);
    s += E(64, 76, 11, 11, c.cel(col), 2) + L('M58,70 L66,82 M64,68 L70,78', st, 2.4);
    if (o.sickleK) {
      var k = o.sickleK, x = nf[0], y = nf[1];
      s += limb(o.nearLeg || 'M64,82 L72,98 L60,110 L62,116', col, 6.4) + mir(birdFoot(x, y, dk(col, 0.35), true) +
        P('M' + pt([x - 4, y - 3]) + 'C' + pt([x - 4 - 7 * k, y - 3 - 6 * k]) + ' ' + pt([x - 4 - 5 * k, y - 3 - 13 * k]) + ' ' + pt([x - 4 + 1 * k, y - 3 - 13 * k]) + 'C' + pt([x - 4 + 0.4 * k, y - 3 - 8 * k]) + ' ' + pt([x - 3 + 1.6 * k, y - 3 - 4 * k]) + ' ' + pt([x, y - 5]) + 'Z', c.cel('#f4ecd6'), 1.4), x);
    } else s += limb('M64,82 L72,98 L60,110 L62,116', col, 6) + birdFoot(62, 121, dk(col, 0.35), true) + P('M58,118 C52,112 54,106 58,106 C58,110 60,114 62,116 Z', c.cel('#f4ecd6'), 1.2);
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
  // ---- thunder lizard (Dunescar family, heavier) ----
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

  // ---- goblin (shared copy of the art_mulgore.js Deepgold Company rig; adds `specs`: round goggles worn over the eye) ----
  function goblinHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8) + (o.scar ? L('M' + pt([x - 2, y - 12]) + 'L' + pt([x + 4, y + 2]), lt(sk, 0.35), 1.2) : ''));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.specs) s += L('M' + pt([x - 1, y - 4]) + 'L' + pt([x + 10, y - 7]), '#4a2e1a', 2.4) + C(x - 5, y - 4, 4.6, c.cel('#c89a3a'), 1.4) + C(x - 5, y - 4, 3.1, '#9ae8f4', 1) + C(x - 6.2, y - 5.2, 1, '#ffffff');
    else s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
    s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    var hc = o.hat || '#e8b830';
    s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
    s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4), 2);
    if (o.lamp !== false) s += C(x - 11, y - 14, 7, glow(c, '#fff0a0', 0.6)) + R(x - 14, y - 17, 5, 6, c.cel('#6a6460'), 1.2) + C(x - 14, y - 14, 1.8, '#fff6c0', 0.8);
    return s;
  }
  function goblin(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, lamp: o.lamp, specs: o.specs, scar: o.scar };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', glove: o.glove,
      hx: 56, hy: 32, hipY: 86, legW: 10, armW: 8.5, shadowR: 30,
      torsoD: 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(goblinHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(0.84, 64, 122)
    });
  }
  // flared goblin blunderbuss, grip at the origin, muzzle pointing left
  function blunderbuss(c, p, ang, sc) {
    var wd = '#7a4a26', s = '';
    s += body(c, 'M0,-3 L16,-4 C22,-4 28,-1 30,5 L30,12 C24,10 18,7 12,6 L2,6 Z', wd, F('M0,2 L32,6 L32,14 L2,8 Z', dk(wd, 0.3), 0.8), 1.8);
    s += body(c, 'M3,-4.4 L-30,-5.4 L-30,1.2 L3,1.2 Z', '#6a6660', L('M2,-3.4 L-29,-4.2', '#c8c4bc', 1, 0.8), 1.8);
    s += P('M-28,-5.4 L-41,-12 L-44,-11 L-44,7 L-41,8 L-28,1.2 Z', c.cel('#c89a3a'), 1.8) + E(-43.4, -2, 1.5, 7.4, '#2a1a10');
    s += R(-12, -6.4, 3.4, 8.6, c.cel('#c89a3a'), 1) + R(-22, -6.6, 3.4, 8.8, c.cel('#c89a3a'), 1);
    s += L('M4,6 Q6,12 11,7', OL, 1.6) + P('M3,-4 L5,-10 L9,-9 L8,-4 Z', c.cel('#4a4640'), 1.2);
    return place(s, p, ang, sc);
  }
  // geologist's rock hammer: grip at origin, head at the far end (down)
  function rockHammer(c, p, ang, sc) {
    var s = limb('M0,-6 L0,20', '#8a5a32', 2.8) + P('M-10,19 L4,18 L6,20 L6,26 L4,27 L-4,25 L-12,22 Z', c.cel('#9a968e'), 1.6) + L('M-9,20.6 L3,20', '#e0ded8', 1, 0.8);
    return place(s, p, ang, sc);
  }
  // raw glowing crystal (pointed prism) with sparkles
  function crystal(c, x, y, col) {
    col = col || '#c07aff';
    var d = 'M' + pt([x, y - 14]) + 'L' + pt([x + 5, y - 6]) + 'L' + pt([x + 4, y + 5]) + 'L' + pt([x, y + 8]) + 'L' + pt([x - 5, y + 4]) + 'L' + pt([x - 5, y - 6]) + 'Z';
    return C(x, y - 2, 20, glow(c, col, 0.7)) + P(d, c.lg([[0, '#ffffff'], [0.35, lt(col, 0.35)], [1, dk(col, 0.25)]]), 1.6) +
      L('M' + pt([x, y - 14]) + 'L' + pt([x - 0.6, y + 8]) + 'M' + pt([x - 5, y - 6]) + 'L' + pt([x - 0.4, y - 2]) + 'L' + pt([x + 5, y - 6]), '#ffffff', 0.9, 0.7) +
      spark4(x - 10, y - 12, 2.6, lt(col, 0.4)) + spark4(x + 10, y - 16, 2, '#ffffff') + spark4(x + 9, y + 4, 1.8, lt(col, 0.4));
  }
  function spark4(x, y, r, col) { return F('M' + pt([x, y - r * 2]) + 'L' + pt([x + r * 0.4, y - r * 0.4]) + 'L' + pt([x + r * 2, y]) + 'L' + pt([x + r * 0.4, y + r * 0.4]) + 'L' + pt([x, y + r * 2]) + 'L' + pt([x - r * 0.4, y + r * 0.4]) + 'L' + pt([x - r * 2, y]) + 'L' + pt([x - r * 0.4, y - r * 0.4]) + 'Z', col); }

  // ---- dwarf (Keldrun, facing left: squat, broad, big braided beard over the chest) ----
  function dwarfHead(c, x, y, o) {
    var sk = o.skin || '#e09c78', hc = o.hair || '#7a4422', band = o.band || '#d6a53c', bl = o.beardLen || 30, s = '';
    s += E(x + 10, y + 1, 3.4, 4.6, c.cel(sk), 1.8);
    var d = 'M' + pt([x - 11, y - 4]) + 'C' + pt([x - 12, y - 15]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 5]) + 'L' + pt([x + 12, y + 7]) + 'C' + pt([x + 7, y + 13]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x - 11, y + 7]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 16, y - 18]) + 'L' + pt([x + 16, y + 14]) + 'L' + pt([x + 2, y + 14]) + 'C' + pt([x + 7, y + 4]) + ' ' + pt([x + 7, y - 8]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.22), 0.8) + (o.scar ? L('M' + pt([x - 8, y - 10]) + 'L' + pt([x - 2, y + 1]), dk(sk, 0.35), 1.2) : ''), 2);
    // braid hanging from the beard
    var bx = x - 2, by = y + bl - 2, br = 'M' + pt([bx, by]) + 'L' + pt([bx - 1, by + 10]);
    s += L(br, OL, 7.4) + L(br, hc, 4.4) + L('M' + pt([bx - 2, by + 2]) + 'l2,2 M' + pt([bx - 2, by + 5]) + 'l2,2', dk(hc, 0.35), 1) + R(bx - 3.4, by + 6, 5.6, 3.4, c.cel(band), 1.2) + P('M' + pt([bx - 4, by + 10]) + 'L' + pt([bx + 2, by + 10]) + 'L' + pt([bx - 1, by + 15]) + 'Z', c.cel(hc), 1.2);
    var bd = 'M' + pt([x + 11, y - 3]) + 'C' + pt([x + 15, y + 10]) + ' ' + pt([x + 15, y + bl * 0.62]) + ' ' + pt([x + 8, y + bl]) + 'L' + pt([x + 4, y + bl - 4]) + 'L' + pt([x, y + bl + 1]) + 'L' + pt([x - 4, y + bl - 5]) + 'L' + pt([x - 9, y + bl - 1]) +
      'C' + pt([x - 16, y + bl * 0.62]) + ' ' + pt([x - 17, y + 12]) + ' ' + pt([x - 12, y + 4]) + 'C' + pt([x - 6, y + 6]) + ' ' + pt([x + 2, y + 5]) + ' ' + pt([x + 6, y - 1]) + 'Z';
    s += body(c, bd, hc, L('M' + pt([x + 7, y + 6]) + 'C' + pt([x + 9, y + 14]) + ' ' + pt([x + 8, y + 20]) + ' ' + pt([x + 5, y + bl - 5]) + 'M' + pt([x - 2, y + 9]) + 'C' + pt([x - 1, y + 16]) + ' ' + pt([x - 2, y + 22]) + ' ' + pt([x - 3, y + bl - 6]) + 'M' + pt([x - 10, y + 10]) + 'C' + pt([x - 12, y + 16]) + ' ' + pt([x - 10, y + 22]) + ' ' + pt([x - 8, y + bl - 4]), dk(hc, 0.3), 1.1) +
      F('M' + pt([x + 4, y - 4]) + 'L' + pt([x + 18, y - 4]) + 'L' + pt([x + 18, y + bl + 4]) + 'L' + pt([x + 4, y + bl + 4]) + 'C' + pt([x + 10, y + 20]) + ' ' + pt([x + 9, y + 8]) + ' ' + pt([x + 4, y - 4]) + 'Z', dk(hc, 0.25), 0.7) + L('M' + pt([x - 12, y + 12]) + 'C' + pt([x - 13, y + 18]) + ' ' + pt([x - 12, y + 22]) + ' ' + pt([x - 10, y + 26]), lt(hc, 0.3), 1, 0.7), 2);
    // droopy moustache, big nose over it
    s += P('M' + pt([x - 3, y + 3]) + 'C' + pt([x - 10, y + 2]) + ' ' + pt([x - 17, y + 6]) + ' ' + pt([x - 18, y + 14]) + 'C' + pt([x - 13, y + 11]) + ' ' + pt([x - 8, y + 10]) + ' ' + pt([x - 2, y + 10]) + 'C' + pt([x + 2, y + 10]) + ' ' + pt([x + 5, y + 6]) + ' ' + pt([x + 2, y + 3]) + 'Z', c.cel(lt(hc, 0.08)), 1.6);
    s += E(x - 12, y + 1, 5, 4.4, c.cel(mix(sk, '#d86a5a', 0.22)), 1.8) + E(x - 13.4, y - 0.4, 1.6, 1.1, '#ffffff', 0, 0.45);
    s += E(x - 5, y - 3.4, 2, 2.2, '#fff8e8', 1) + C(x - 6, y - 3.2, 1.1, OL);
    s += P('M' + pt([x - 11, y - 7]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 2, y - 10]) + ' ' + pt([x + 1, y - 8]) + 'L' + pt([x, y - 6]) + 'C' + pt([x - 4, y - 7]) + ' ' + pt([x - 8, y - 6]) + ' ' + pt([x - 11, y - 5]) + 'Z', c.cel(hc), 1.2);
    if (o.helm) s += o.helm(c, x, y);
    return s;
  }
  function dwarf(c, o) {
    var sk = o.skin || '#e09c78';
    var ho = { skin: sk, hair: o.hair, beardLen: o.beardLen, helm: o.helm, band: o.band, scar: o.scar };
    return biped(c, {
      skin: sk, shirt: o.shirt, pants: o.pants, sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2618', glove: o.glove,
      hx: 56, hy: 44, hipY: 96, legW: 13, armW: 11.5, shadowR: 36, neck: false,
      torsoD: 'M40,60 C44,52 82,52 88,60 L88,82 L85,99 L43,99 L40,82 Z',
      head: function (c, x, y) { return G(dwarfHead(c, x, y, ho), at(1.12, x, y + 10)); },
      chest: o.chest, back: o.back, pads: o.pads, top: o.top,
      front: function (c) { return (o.front ? o.front(c) : '') + P('M41,90 L87,90 L86,99 L42,99 Z', c.cel(o.belt || '#4a3020'), 2) + R(58, 88.6, 11, 11.6, c.cel(o.buckle || '#d6a53c'), 1.6) + R(61, 91.6, 5, 5.6, dk(o.belt || '#4a3020', 0.2), 0); },
      near: o.near || [[44, 62], [36, 78], [30, 90]], far: o.far || [[84, 62], [92, 78], [92, 92]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: o.tf || at(0.98, 64, 122)
    });
  }
  // miner's helmet: riveted iron dome, leather brim, candle-lamp on the front
  function minerHelm(c, x, y) {
    var hc = '#8a7a5e', s = '';
    s += P('M' + pt([x - 16, y - 6]) + 'C' + pt([x - 8, y - 3]) + ' ' + pt([x + 10, y - 3]) + ' ' + pt([x + 16, y - 6]) + 'L' + pt([x + 15, y - 9]) + 'C' + pt([x + 6, y - 10]) + ' ' + pt([x - 8, y - 10]) + ' ' + pt([x - 15, y - 9]) + 'Z', c.cel('#6a4a2c'), 1.8);
    s += body(c, 'M' + pt([x - 13, y - 8]) + 'C' + pt([x - 13, y - 25]) + ' ' + pt([x + 13, y - 26]) + ' ' + pt([x + 14, y - 8]) + 'Z', hc, F('M' + pt([x + 3, y - 27]) + 'L' + pt([x + 15, y - 27]) + 'L' + pt([x + 15, y - 7]) + 'L' + pt([x + 5, y - 7]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x - 13, y - 12]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 14, y - 12]), '#5a4a36', 2) + C(x - 6, y - 12.6, 0.9, '#d6c8a0') + C(x + 2, y - 13.2, 0.9, '#d6c8a0') + C(x + 9, y - 12.8, 0.9, '#d6c8a0'), 2);
    s += C(x - 12, y - 17, 9, glow(c, '#fff0a0', 0.6)) + R(x - 16, y - 21, 6, 7, c.cel('#c89a3a'), 1.2) + C(x - 14.5, y - 17.5, 1.8, '#fff6c0', 0.8);
    return s;
  }
  // horned war helm: steel dome, brass band, nasal guard, two ivory horns
  function hornedHelm(c, x, y) {
    var st = '#a2a8b0', s = '';
    // far horn (behind, sweeping back)
    s += P('M' + pt([x + 6, y - 20]) + 'C' + pt([x + 14, y - 26]) + ' ' + pt([x + 20, y - 30]) + ' ' + pt([x + 19, y - 37]) + 'C' + pt([x + 24, y - 31]) + ' ' + pt([x + 22, y - 24]) + ' ' + pt([x + 12, y - 14]) + 'Z', c.cel('#d8ceb4'), 1.6);
    s += body(c, 'M' + pt([x - 14, y - 6]) + 'C' + pt([x - 15, y - 25]) + ' ' + pt([x + 13, y - 27]) + ' ' + pt([x + 15, y - 6]) + 'Z', st, F('M' + pt([x + 3, y - 28]) + 'L' + pt([x + 16, y - 28]) + 'L' + pt([x + 16, y - 5]) + 'L' + pt([x + 5, y - 5]) + 'Z', dk(st, 0.3), 0.8) + E(x - 6, y - 18, 4, 2.4, '#ffffff', 0, 0.45), 2);
    s += P('M' + pt([x - 15, y - 5]) + 'C' + pt([x - 8, y - 3]) + ' ' + pt([x + 8, y - 3]) + ' ' + pt([x + 16, y - 5]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel('#d6a53c'), 1.6) + C(x - 9, y - 7.4, 1, dk('#d6a53c', 0.4)) + C(x + 1, y - 8, 1, dk('#d6a53c', 0.4)) + C(x + 10, y - 7.6, 1, dk('#d6a53c', 0.4));
    s += P('M' + pt([x - 12, y - 6]) + 'L' + pt([x - 8, y - 6]) + 'L' + pt([x - 9, y + 2]) + 'L' + pt([x - 12, y + 1]) + 'Z', c.cel(st), 1.3);
    // near horn (in front, curling forward and up)
    s += P('M' + pt([x - 10, y - 16]) + 'C' + pt([x - 20, y - 18]) + ' ' + pt([x - 28, y - 24]) + ' ' + pt([x - 27, y - 35]) + 'C' + pt([x - 22, y - 29]) + ' ' + pt([x - 16, y - 28]) + ' ' + pt([x - 6, y - 26]) + 'Z', c.cel('#ece2c8'), 1.7) +
      L('M' + pt([x - 18, y - 19]) + 'L' + pt([x - 15, y - 26]) + 'M' + pt([x - 23, y - 25]) + 'L' + pt([x - 19, y - 30]), '#b8ac90', 1.1);
    return s;
  }
  // digging shovel, grip at origin: T-handle end down/right, blade up/left after rotation
  function shovel(c, p, ang, sc) {
    var s = limb('M0,30 L0,-26', '#8a5a32', 3.2) + L('M0,30 L0,-26', '#b8845a', 1, 0.6) + limb('M-5,31 L5,31', '#6a4424', 2.6);
    s += body(c, 'M-3,-24 L3,-24 L9,-28 L9,-42 C6,-50 -6,-50 -9,-42 L-9,-28 Z', '#9a968e', F('M1,-52 L10,-52 L10,-26 L2,-26 Z', '#6a6660', 0.8) + L('M-7,-42 C-4,-47 0,-47 2,-46', '#e0ded8', 1.1, 0.8) + F('M-9,-30 L9,-30 L9,-26 L-9,-26 Z', '#8a6a44', 0.7), 1.8);
    return place(s, p, ang, sc);
  }
  // long dwarven rifle, grip at origin, muzzle pointing left; brass scope and bands
  function rifle(c, p, ang, sc) {
    var wd = '#8a5230', s = '';
    s += body(c, 'M0,-3 L18,-3 L34,1 L34,11 L24,7 L4,5 Z', wd, F('M0,2 L36,6 L36,13 L2,7 Z', dk(wd, 0.3), 0.8) + L('M8,0 L26,2', lt(wd, 0.25), 1, 0.7), 1.8);
    s += body(c, 'M3,-4.4 L-46,-4 L-46,0.4 L3,0.6 Z', '#5e5a58', L('M2,-3.6 L-45,-3.2', '#c8c4bc', 0.9, 0.8), 1.7);
    s += R(-49, -5.4, 4, 7, c.cel('#4a4644'), 1.2) + P('M-43,-4 L-42,-8 L-40,-8 L-40,-4 Z', '#4a4644', 1);
    s += R(-30, -5.6, 3, 7, c.cel('#d6a53c'), 1) + R(-14, -5.6, 3, 7, c.cel('#d6a53c'), 1);
    s += R(-12, -11, 16, 4.4, c.cel('#d6a53c'), 1.3) + L('M-8,-6.6 L-8,-4 M0,-6.6 L0,-4', OL, 1.2) + E(-12, -8.8, 1, 2, '#9ae8f4');
    s += L('M4,5 Q6,11 11,6', OL, 1.6);
    return place(s, p, ang, sc);
  }

  // ---- crocolisk (short-legged crocodile, jaws open, facing left) ----
  function crocolisk(c, o) {
    var col = o.col, bel = o.belly, dcol = dk(col, 0.25), sc = o.scute || dk(col, 0.35), s = shadow(c, 64, 60);
    var foot = function (x, y, cc) { return P('M' + n(x + 5) + ',' + n(y - 5) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 11) + ',' + n(y - 2) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 3) + ',' + n(y - 5) + ' Z', c.cel(cc), 1.8) + L('M' + n(x - 9) + ',' + n(y + 1) + ' l-3,1.4 M' + n(x - 5) + ',' + n(y + 1) + ' l-2,2 M' + n(x - 1) + ',' + n(y + 1) + ' l-1,2', OL, 1.4); };
    s += limb('M50,100 L46,110 L44,116', dcol, 9) + foot(44, 121, dcol) + limb('M94,98 L102,108 L102,116', dcol, 9) + foot(102, 121, dcol);
    // tail, tip curling up
    var tl = 'M88,80 C102,80 112,80 118,72 C122,66 126,62 127,68 C127,80 116,96 98,102 L88,100 Z';
    s += body(c, tl, col, F('M90,96 C104,92 116,84 124,72 L130,76 L130,106 L90,106 Z', dcol, 0.75) + L('M98,84 L100,92 M106,82 L108,90 M114,78 L116,86', sc, 1.6));
    [[98, 80], [106, 79], [113, 76.4], [119, 72]].forEach(function (k, i) { var h = 5 - i * 0.8; s += P(pd([[k[0] - 3, k[1] + 1], [k[0], k[1] - h], [k[0] + 3, k[1] + 1]], true), c.cel(sc), 1.3); });
    // low long body
    var bd = 'M30,88 C34,78 58,72 78,74 C94,75 102,84 100,96 C98,104 82,108 62,108 C46,108 34,104 31,97 Z';
    var dots = '';
    for (var i = 0; i < 6; i++) for (var j = 0; j < 2; j++) dots += 'M' + pt([44 + i * 9 + j * 4, 84 + j * 7]) + 'l4,0 l0,3 l-4,0 Z';
    s += body(c, bd, col, F(dots, dk(col, 0.18), 0.8) + F('M26,98 C48,110 84,110 106,94 L106,114 L26,114 Z', bel, 0.95) + L('M44,103 L44,109 M54,104 L54,110 M64,104 L64,110 M74,104 L74,110 M84,102 L84,108', dk(bel, 0.3), 1.1) + F('M50,76 C64,72 82,72 94,78 C80,76 66,76 52,80 Z', lt(col, 0.22), 0.6));
    [[44, 79], [52, 76], [60, 74.4], [68, 73.6], [76, 73.8], [84, 75], [92, 77.6]].forEach(function (k) { s += P(pd([[k[0] - 3.4, k[1] + 1.6], [k[0], k[1] - 5], [k[0] + 3.4, k[1] + 1.6]], true), c.cel(sc), 1.3); });
    // open jaws: red mouth, lower jaw, teeth, then upper head
    s += F('M42,90 C30,82 18,77 7,74 L6,92 C18,91 30,90 42,90 Z', '#7a2420');
    s += F('M38,89 C30,86 22,86 16,88 L14,91 C24,90 32,90 38,90 Z', '#c05a50', 0.9);
    var lj = 'M48,94 C38,97 20,100 6,98 C2,97 2,92 5,91 C16,91 30,89 42,87 Z';
    s += body(c, lj, col, F('M2,96 C18,100 36,98 50,94 L50,104 L2,104 Z', bel, 0.95));
    var lt_ = '';
    for (var a = 0; a < 6; a++) { var tx = 9 + a * 5.2, ty = 91 - a * 0.5; lt_ += 'M' + pt([tx - 1.6, ty + 0.6]) + 'L' + pt([tx, ty - 4]) + 'L' + pt([tx + 1.6, ty + 0.4]) + 'Z'; }
    s += P(lt_, '#f6f0dc', 0.9);
    var uj = 'M54,82 C52,72 44,68 34,70 C24,68 12,64 5,64 C1,64 0,69 3,71 L10,74 C20,76 30,80 38,90 L50,92 Z';
    var ut = '';
    for (var b = 0; b < 6; b++) { var ux = 9 + b * 5, uy = 73.4 + b * 1.1; ut += 'M' + pt([ux - 1.6, uy - 0.8]) + 'L' + pt([ux + 0.4, uy + 4.2]) + 'L' + pt([ux + 1.8, uy - 0.2]) + 'Z'; }
    s += P(ut, '#f6f0dc', 0.9);
    s += body(c, uj, col, F('M40,62 L60,62 L60,94 L46,94 C50,84 48,72 40,62 Z', dk(col, 0.22), 0.8) + L('M14,68 l3,-1 M22,68 l3,-1 M30,70 l3,-1', dk(col, 0.35), 1.1) + F('M6,64 C16,64 28,66 36,70 C26,68 16,68 6,68 Z', lt(col, 0.25), 0.6));
    s += E(6, 64.6, 2.8, 2, c.cel(col), 1.3) + E(5.4, 64, 0.8, 0.6, OL);
    s += E(40, 70, 5.4, 4, c.cel(col), 1.6) + E(39.4, 70.4, 2.8, 2.2, o.eye || '#ffd040', 1) + E(39.4, 70.4, 0.7, 1.8, OL) + L('M34,67 L44,66', OL, 1.6);
    // near legs, splayed
    s += limb('M48,100 L38,108 L32,116', col, 10) + foot(32, 121, col) + limb('M88,100 L94,108 L90,116', col, 10) + foot(90, 121, col);
    return s;
  }

  // ============================================================
  //  WAILING CAVERNS MOB PIECES (Druids of the Coil, deviate beasts)
  // ============================================================
  function vglow(c, x, y, r, col, a) { return C(x, y, r, glow(c, col, a == null ? 0.7 : a)); }
  // green nightmare-lightning arc
  function garc(d, w) { return L(d, '#8aff6a', (w || 1) * 3.6, 0.55) + L(d, '#f4ffe8', (w || 1) * 1.3); }
  // ---- night elf head in profile, facing left: long ear swept back, glowing eyes ----
  function nelfHead(c, x, y, o) {
    var sk = o.skin, eye = o.eye || '#9cff5a', f = o.female, s = '';
    var d = f ? 'M' + pt([x + 9, y - 6]) + 'C' + pt([x + 8, y - 13]) + ' ' + pt([x - 2, y - 15]) + ' ' + pt([x - 8, y - 10]) + 'L' + pt([x - 10, y - 4]) + 'L' + pt([x - 13, y + 2]) + 'L' + pt([x - 10, y + 4]) + 'L' + pt([x - 10.5, y + 7]) + 'L' + pt([x - 8.5, y + 8]) + 'C' + pt([x - 8.5, y + 11]) + ' ' + pt([x - 6, y + 13]) + ' ' + pt([x - 3, y + 13]) + 'C' + pt([x + 3, y + 12]) + ' ' + pt([x + 7, y + 8]) + ' ' + pt([x + 9, y + 3]) + 'Z'
      : 'M' + pt([x + 9, y - 6]) + 'C' + pt([x + 8, y - 13]) + ' ' + pt([x - 2, y - 15]) + ' ' + pt([x - 8, y - 10]) + 'L' + pt([x - 10, y - 4]) + 'L' + pt([x - 15, y + 2]) + 'L' + pt([x - 10, y + 4]) + 'L' + pt([x - 11, y + 7]) + 'L' + pt([x - 9, y + 8]) + 'C' + pt([x - 9, y + 11]) + ' ' + pt([x - 7, y + 14]) + ' ' + pt([x - 4, y + 15]) + 'C' + pt([x + 2, y + 13]) + ' ' + pt([x + 7, y + 9]) + ' ' + pt([x + 9, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 2, y - 18]) + 'L' + pt([x + 14, y - 18]) + 'L' + pt([x + 14, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 5, y + 8]) + ' ' + pt([x + 5, y - 6]) + ' ' + pt([x + 2, y - 18]) + 'Z', dk(sk, 0.25), 0.8) +
      L('M' + pt([x - 7, y + 5]) + 'L' + pt([x - 1, y + 9]), dk(sk, 0.3), 1.1) + (o.scales ? L('M' + pt([x - 2, y + 2]) + 'q2,2 4,0 M' + pt([x, y + 6]) + 'q2,2 4,0 M' + pt([x + 3, y - 1]) + 'q2,2 4,0', o.scales, 1.2) : ''), 2);
    if (o.beard) s += P('M' + pt([x - 9, y + 9]) + 'C' + pt([x - 10, y + 16]) + ' ' + pt([x - 8, y + 22]) + ' ' + pt([x - 5, y + 27]) + 'C' + pt([x - 3, y + 20]) + ' ' + pt([x + 1, y + 16]) + ' ' + pt([x + 4, y + 12]) + 'C' + pt([x, y + 14]) + ' ' + pt([x - 5, y + 13]) + ' ' + pt([x - 9, y + 9]) + 'Z', c.cel(o.hair || '#2e8a6a'), 1.5);
    if (o.fangs) s += P('M' + pt([x - 11, y + 7]) + 'L' + pt([x - 3, y + 7]) + 'L' + pt([x - 5, y + 11]) + 'L' + pt([x - 9, y + 11]) + 'Z', '#4a1420', 1.2) + P('M' + pt([x - 10, y + 7]) + 'L' + pt([x - 9.4, y + 11]) + 'L' + pt([x - 8.4, y + 7]) + 'Z M' + pt([x - 6, y + 7]) + 'L' + pt([x - 5.6, y + 10.4]) + 'L' + pt([x - 4.6, y + 7]) + 'Z', '#f4f0dc', 0.7);
    else s += L('M' + pt([x - 10.5, y + 7.4]) + 'L' + pt([x - 6, y + 7.8]), f ? '#6a2a5a' : OL, 1.2);
    // glowing eye
    s += vglow(c, x - 5, y - 2, 8, eye, 0.85) + P('M' + pt([x - 8.4, y - 1.6]) + 'Q' + pt([x - 5.4, y - 4.4]) + ' ' + pt([x - 1.4, y - 2.8]) + 'Q' + pt([x - 4.6, y]) + ' ' + pt([x - 8.4, y - 1.6]) + 'Z', lt(eye, 0.55), 1.1);
    if (o.slit) s += E(x - 4.8, y - 2.2, 0.6, 1.4, OL);
    s += f ? L('M' + pt([x - 9, y - 4.6]) + 'Q' + pt([x - 5, y - 6.6]) + ' ' + pt([x - 1, y - 5.4]), OL, 1.4) + L('M' + pt([x - 1.4, y - 2.8]) + 'l1.6,-1.2', OL, 1)
      : L('M' + pt([x - 10, y - 5.6]) + 'L' + pt([x - 1, y - 7.2]), OL, 2);
    // long upswept brow
    s += L('M' + pt([x - 2, y - 7]) + 'Q' + pt([x + 3, y - 9]) + ' ' + pt([x + 7, y - 13]), OL, 3) + L('M' + pt([x - 2, y - 7]) + 'Q' + pt([x + 3, y - 9]) + ' ' + pt([x + 7, y - 13]), o.hair || '#2e8a6a', 1.4);
    return s;
  }
  function nelfEar(c, x, y, sk, k) {
    k = k || 1;
    var d = 'M' + pt([x + 3, y - 1]) + 'C' + pt([x + 12 * k, y - 7 * k]) + ' ' + pt([x + 22 * k, y - 14 * k]) + ' ' + pt([x + 31 * k, y - 22 * k]) + 'C' + pt([x + 25 * k, y - 10 * k]) + ' ' + pt([x + 16 * k, y - 1]) + ' ' + pt([x + 5, y + 6]) + 'Z';
    return body(c, d, sk, L('M' + pt([x + 6, y + 1]) + 'C' + pt([x + 14 * k, y - 5 * k]) + ' ' + pt([x + 20 * k, y - 10 * k]) + ' ' + pt([x + 26 * k, y - 16 * k]), dk(sk, 0.3), 1.2), 1.8);
  }
  // snake-head hood: cape behind the head (back part) and the snake skull over the brow (top part)
  function hoodBack(c, x, y, col) {
    return body(c, 'M' + pt([x - 2, y - 14]) + 'C' + pt([x + 12, y - 16]) + ' ' + pt([x + 18, y - 4]) + ' ' + pt([x + 17, y + 8]) + 'C' + pt([x + 19, y + 16]) + ' ' + pt([x + 24, y + 22]) + ' ' + pt([x + 28, y + 28]) + 'L' + pt([x + 2, y + 26]) + 'C' + pt([x + 4, y + 18]) + ' ' + pt([x + 2, y + 12]) + ' ' + pt([x - 2, y + 8]) + 'Z', dk(col, 0.2),
      L('M' + pt([x + 6, y - 6]) + 'q2.5,3 5,0 M' + pt([x + 8, y + 2]) + 'q2.5,3 5,0 M' + pt([x + 10, y + 10]) + 'q2.5,3 5,0 M' + pt([x + 12, y + 18]) + 'q2.5,3 5,0', dk(col, 0.45), 1.1), 2);
  }
  function hoodTop(c, x, y, o) {
    var col = o.hood, bel = o.hoodBelly || '#dcd490', s = '';
    if (o.crest) [[4, -18, -1.9], [9, -16, -1.4], [13, -11, -0.9], [16, -5, -0.4]].forEach(function (q) {
      var a = q[2], bx = x + q[0], by = y + q[1], len = 9, ex = bx + Math.cos(a) * len, ey = by + Math.sin(a) * len;
      s += P(pd([[bx - 3, by + 1], [ex, ey], [bx + 3, by + 1]], true), c.cel(o.crest), 1.3);
    });
    var d = 'M' + pt([x + 13, y - 3]) + 'C' + pt([x + 13, y - 14]) + ' ' + pt([x + 4, y - 20]) + ' ' + pt([x - 4, y - 19]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x - 20, y - 15]) + ' ' + pt([x - 26, y - 11]) + 'C' + pt([x - 29, y - 9]) + ' ' + pt([x - 29, y - 4]) + ' ' + pt([x - 25, y - 3]) +
      'C' + pt([x - 19, y - 4]) + ' ' + pt([x - 13, y - 5]) + ' ' + pt([x - 9, y - 5]) + 'C' + pt([x - 4, y - 8]) + ' ' + pt([x + 5, y - 8]) + ' ' + pt([x + 13, y - 3]) + 'Z';
    s += body(c, d, col, F('M' + pt([x + 2, y - 22]) + 'L' + pt([x + 16, y - 22]) + 'L' + pt([x + 16, y]) + 'L' + pt([x + 4, y]) + 'C' + pt([x + 6, y - 8]) + ' ' + pt([x + 5, y - 16]) + ' ' + pt([x + 2, y - 22]) + 'Z', dk(col, 0.28), 0.8) +
      F('M' + pt([x - 27, y - 4]) + 'C' + pt([x - 20, y - 6]) + ' ' + pt([x - 13, y - 7]) + ' ' + pt([x - 8, y - 7]) + 'L' + pt([x - 8, y - 4]) + 'L' + pt([x - 27, y - 2]) + 'Z', bel, 0.95) +
      L('M' + pt([x - 2, y - 15]) + 'q2.5,3 5,0 M' + pt([x + 4, y - 12]) + 'q2.5,3 5,0 M' + pt([x - 8, y - 13]) + 'q2.5,3 5,0 M' + pt([x + 1, y - 9]) + 'q2.5,3 5,0', dk(col, 0.4), 1.1), 2);
    // snake eye + brow ridge, nostril, fangs hanging over the face
    s += L('M' + pt([x - 20, y - 13]) + 'L' + pt([x - 10, y - 15]), OL, 2) + E(x - 14, y - 11.6, 2.8, 2, o.hoodEye || '#ffd040', 1) + E(x - 14, y - 11.6, 0.6, 1.6, OL) + C(x - 25, y - 8, 0.9, OL);
    s += P('M' + pt([x - 24, y - 3.4]) + 'C' + pt([x - 24, y]) + ' ' + pt([x - 23, y + 2]) + ' ' + pt([x - 21.4, y + 3.6]) + 'C' + pt([x - 21.6, y + 1]) + ' ' + pt([x - 21.4, y - 1.4]) + ' ' + pt([x - 21, y - 3.6]) + 'Z', '#f4f0dc', 1) +
      P('M' + pt([x - 17, y - 4]) + 'C' + pt([x - 17, y - 1.4]) + ' ' + pt([x - 16.4, y]) + ' ' + pt([x - 15.2, y + 1]) + 'C' + pt([x - 15.2, y - 1]) + ' ' + pt([x - 15, y - 2.6]) + ' ' + pt([x - 14.6, y - 4.2]) + 'Z', '#f4f0dc', 1);
    return s;
  }
  // snake-topped staff: gnarled wood, a serpent coiled round the head, rearing left with a nightmare glow
  function snakeStaff(c, p, o) {
    o = o || {};
    var top = [p[0] - 4, p[1] - 44], bot = [p[0] + 5, p[1] + 48], x = top[0], y = top[1], sc = o.col || '#5a9a3a', band = o.band || '#2a4a1e';
    var s = staff(top, bot, '#5a3a22', 3.8) + L('M' + pt([x + 1, y + 30]) + 'l2,4 M' + pt([x + 3, y + 60]) + 'l-2,4', OL, 1.4);
    var coil = '';
    for (var i = 0; i <= 20; i++) { var t = i / 20, yy = y + 34 - t * 32, xx = x + (bot[0] - top[0]) * (yy - y) / (bot[1] - top[1]) + Math.sin(t * Math.PI * 3) * 6; coil += (i ? 'L' : 'M') + pt([xx, yy]); }
    var neck = 'M' + pt([x, y + 2]) + 'C' + pt([x + 2, y - 6]) + ' ' + pt([x - 2, y - 12]) + ' ' + pt([x - 8, y - 14]);
    s += L(coil, OL, 7.4) + L(coil, sc, 3.6) + L(coil, band, 3.6, 0.9).replace('stroke-linecap="round"', 'stroke-dasharray="2.4 5"') + L(neck, OL, 7.8) + L(neck, sc, 4.2);
    s += snakeHead(c, x - 9, y - 15, 0.36, { col: sc, eye: o.eye || '#b8ff5a', open: true, tongue: false });
    if (o.orb) s += vglow(c, x - 19, y - 11, 22, o.orb, 0.85) + C(x - 19, y - 11, o.orbR || 2.6, c.rg([[0, '#ffffff'], [0.5, lt(o.orb, 0.5)], [1, o.orb]]), 1.2);
    return s;
  }
  // snake head in profile facing left (k = scale)
  function snakeHead(c, x, y, k, o) {
    var col = o.col, bel = o.belly || '#dcd490', s = '';
    function Q(dx, dy) { return pt([x + dx * k, y + dy * k]); }
    if (o.open) {
      s += P('M' + Q(-21, 0) + 'L' + Q(-8, 1) + 'L' + Q(6, 5) + 'L' + Q(-6, 12) + 'L' + Q(-20, 12) + 'Z', '#5a1420', 2 * k);
      s += body(c, 'M' + Q(6, 5) + 'C' + Q(4, 12) + ' ' + Q(-8, 16) + ' ' + Q(-19, 15) + 'C' + Q(-23, 14) + ' ' + Q(-23, 11) + ' ' + Q(-20, 10) + 'L' + Q(-6, 9) + 'Z', col, F('M' + Q(-24, 13) + 'L' + Q(8, 8) + 'L' + Q(8, 18) + 'L' + Q(-24, 18) + 'Z', bel, 0.9), 2 * k);
      s += P('M' + Q(-19, 10) + 'L' + Q(-18, 7) + 'L' + Q(-16.6, 10) + 'Z M' + Q(-13, 9.6) + 'L' + Q(-12.2, 7) + 'L' + Q(-11, 9.4) + 'Z', '#f4f0dc', 0.8 * k);
      if (o.tongue !== false) { var tg = 'M' + Q(-12, 8) + 'C' + Q(-18, 8) + ' ' + Q(-22, 7) + ' ' + Q(-27, 7) + 'M' + Q(-27, 7) + 'L' + Q(-31, 3.6) + 'M' + Q(-27, 7) + 'L' + Q(-31, 10); s += L(tg, OL, 3.4 * k) + L(tg, '#e0304a', 1.6 * k); }
    }
    var hd = 'M' + Q(10, 4) + 'C' + Q(12, -8) + ' ' + Q(2, -14) + ' ' + Q(-6, -13) + 'C' + Q(-14, -12) + ' ' + Q(-21, -9) + ' ' + Q(-25, -4) + 'C' + Q(-26, -2) + ' ' + Q(-25, 1) + ' ' + Q(-21, 1) + 'L' + Q(-8, 2) + 'C' + Q(-2, 3) + ' ' + Q(4, 5) + ' ' + Q(10, 6) + 'Z';
    s += body(c, hd, col, F('M' + Q(0, -16) + 'L' + Q(14, -16) + 'L' + Q(14, 8) + 'L' + Q(2, 8) + 'C' + Q(5, 0) + ' ' + Q(4, -8) + ' ' + Q(0, -16) + 'Z', dk(col, 0.28), 0.8) +
      F('M' + Q(-26, -1) + 'C' + Q(-18, -1) + ' ' + Q(-6, 0) + ' ' + Q(10, 4) + 'L' + Q(10, 8) + 'L' + Q(-26, 8) + 'Z', bel, 0.9) + (o.band ? L('M' + Q(-2, -13) + 'L' + Q(-4, 4) + 'M' + Q(6, -10) + 'L' + Q(4, 5), o.band, 3 * k) : '') +
      L('M' + Q(-14, -8) + 'q' + n(2.5 * k) + ',' + n(3 * k) + ' ' + n(5 * k) + ',0 M' + Q(-4, -9) + 'q' + n(2.5 * k) + ',' + n(3 * k) + ' ' + n(5 * k) + ',0', dk(col, 0.4), 1.1 * k), 2 * Math.max(0.55, k));
    if (o.open) s += P('M' + Q(-20, 0.6) + 'C' + Q(-20, 4) + ' ' + Q(-19, 7) + ' ' + Q(-17.4, 9) + 'C' + Q(-17.4, 6) + ' ' + Q(-17.2, 3) + ' ' + Q(-16.6, 0.8) + 'Z M' + Q(-12, 1.4) + 'C' + Q(-12, 4) + ' ' + Q(-11.4, 6) + ' ' + Q(-10.2, 7.4) + 'C' + Q(-10.2, 5) + ' ' + Q(-10, 3) + ' ' + Q(-9.4, 1.6) + 'Z', '#f4f0dc', 0.9 * k);
    var ex = x - 9 * k, ey = y - 6 * k;
    s += vglow(c, ex, ey, 9 * k, o.eye || '#b8ff5a', 0.8) + E(ex, ey, 3.2 * k, 2.6 * k, lt(o.eye || '#b8ff5a', 0.3), 1.2 * k) + E(ex, ey, 0.8 * k, 2.2 * k, OL);
    s += L('M' + Q(-15, -9.6) + 'L' + Q(-4, -11), OL, 2.2 * k) + C(x - 22 * k, y - 4 * k, 0.9 * k, OL);
    return s;
  }
  // serpent body tube along chained cubics (tapering w0 -> w1): outline, underside shade, belly strip, cross bands, highlight
  function tube(c, segs, w0, w1, col, o) {
    o = o || {};
    var q = [], steps = o.steps || 12;
    segs.forEach(function (sg, si) { for (var i = si ? 1 : 0; i <= steps; i++) q.push(bez(sg[0], sg[1], sg[2], sg[3], i / steps)); });
    var N = q.length, lf = [], rt = [], ws = [], sd = o.side || 1;
    q.forEach(function (p, i) { var w = (w0 + (w1 - w0) * i / (N - 1)) / 2; ws.push(w); lf.push([p[0] + p[2] * w, p[1] + p[3] * w]); rt.push([p[0] - p[2] * w, p[1] - p[3] * w]); });
    function off(a, b) { var r = []; q.forEach(function (p, i) { r.push([p[0] + p[2] * ws[i] * sd * a, p[1] + p[3] * ws[i] * sd * b]); }); return r; }
    function strip(a, b) { return pd(off(a, a).concat(off(b, b).reverse()), true); }
    var outline = pd(lf.concat(rt.slice().reverse()), true), inner = '';
    if (o.band) { var every = o.bandEvery || 4, bd = ''; for (var i = o.bandStart || 2; i < N - 1; i += every) bd += pd([lf[i], lf[i + 1], rt[i + 1], rt[i]], true); inner += F(bd, o.band, 0.95); }
    inner += F(strip(0.15, 1.05), dk(col, 0.26), 0.8);
    if (o.belly) inner += F(strip(0.45, 1.05), o.belly, 0.92);
    var hl = off(-0.5, -0.5);
    inner += L(pd(hl), lt(col, 0.3), Math.max(1, (w0 + w1) * 0.06), 0.8);
    return F(outline, col) + '<g clip-path="url(#' + c.clip(outline) + ')">' + inner + '</g>' + '<path d="' + outline + '" fill="none" stroke="' + OL + '" stroke-width="' + n(o.sw || 2.4) + '" stroke-linejoin="round"/>';
  }
  // cobra hood flare centred on the neck top (x,y)
  function cobraHood(c, x, y, w, h, col, mark, edge) {
    var d = 'M' + pt([x, y + h * 0.55]) + 'C' + pt([x - w * 0.34, y + h * 0.4]) + ' ' + pt([x - w * 0.56, y + h * 0.08]) + ' ' + pt([x - w * 0.5, y - h * 0.22]) + 'C' + pt([x - w * 0.44, y - h * 0.46]) + ' ' + pt([x - w * 0.18, y - h * 0.5]) + ' ' + pt([x, y - h * 0.44]) +
      'C' + pt([x + w * 0.18, y - h * 0.5]) + ' ' + pt([x + w * 0.44, y - h * 0.46]) + ' ' + pt([x + w * 0.5, y - h * 0.22]) + 'C' + pt([x + w * 0.56, y + h * 0.08]) + ' ' + pt([x + w * 0.34, y + h * 0.4]) + ' ' + pt([x, y + h * 0.55]) + 'Z';
    var rib = '';
    [-0.36, -0.2, 0.2, 0.36].forEach(function (k) { rib += 'M' + pt([x + k * w * 0.3, y + h * 0.4]) + 'Q' + pt([x + k * w * 1.1, y]) + ' ' + pt([x + k * w * 0.9, y - h * 0.38]); });
    var inner = F('M' + pt([x + w * 0.1, y - h]) + 'L' + pt([x + w, y - h]) + 'L' + pt([x + w, y + h]) + 'L' + pt([x + w * 0.1, y + h]) + 'Z', dk(col, 0.25), 0.8) + L(rib, dk(col, 0.35), 1.3) +
      (mark ? E(x - w * 0.24, y - h * 0.06, w * 0.09, h * 0.1, mark, 1.2) + E(x + w * 0.24, y - h * 0.06, w * 0.09, h * 0.1, mark, 1.2) + E(x - w * 0.24, y - h * 0.06, w * 0.035, h * 0.045, OL) + E(x + w * 0.24, y - h * 0.06, w * 0.035, h * 0.045, OL) : '');
    var s = body(c, d, col, inner, 2.2);
    if (edge) s += L(d, edge, 1.4, 0.9);
    return s;
  }
  // scale-arc texture over a box
  function scaleTex(x0, y0, x1, y1, col, dx, dy) {
    dx = dx || 6; dy = dy || 5;
    var d = '', row = 0;
    for (var y = y0; y < y1; y += dy, row++) for (var x = x0 + (row % 2) * dx / 2; x < x1; x += dx) d += 'M' + pt([x, y]) + 'q' + n(dx / 2) + ',' + n(dy * 0.7) + ' ' + n(dx) + ',0';
    return L(d, col, 1);
  }
  // ---- Druid of the Fang rig (night elf in a serpent-scale robe, facing left) ----
  function fangDruid(c, o) {
    var sk = o.skin || '#8a6ab8', rb = o.robe || '#3f7040', tr = o.trim || '#7a4e2a', bel = o.belly || '#d8cc84', hx = o.hx || 56, hy = o.hy || 26, s = shadow(c, 64, o.shadowR || 30);
    if (o.back) s += o.back(c);
    if (o.hood) s += hoodBack(c, hx, hy, o.hood);
    if (o.hairBack) s += o.hairBack(c, hx, hy);
    var far = o.far || [[78, 48], [88, 62], [90, 76]];
    if (o.wFarBack) s += o.wFarBack(c, far[2]);
    s += limb(pd(far.slice(0, 2)), dk(rb, 0.22), 8.5) + limb(pd(far.slice(1)), dk(rb, 0.22), 8);
    s += hand(far[2], c.cel(dk(sk, 0.1)));
    if (o.wFar) s += o.wFar(c, far[2]);
    if (!o.noFeet) s += boot(78, 121, o.boots || '#3a2a1a') + boot(54, 121, o.boots || '#3a2a1a');
    var rd = o.robeD || 'M48,42 C54,37 74,37 80,42 L84,66 L94,110 L90,116 L84,112 L78,117 L72,113 L66,118 L60,113 L54,118 L48,113 L42,117 L36,110 L44,66 Z';
    s += body(c, rd, rb, scaleTex(30, 44, 100, 120, dk(rb, 0.32)) + F('M53,40 L63,40 L65,120 L51,120 Z', bel, 0.95) + L('M52,50 L64,50 M52,58 L64,58 M52,66 L64,66 M52,82 L65,82 M51,92 L65,92 M51,102 L65,102 M51,112 L65,112', dk(bel, 0.35), 1.1) +
      F('M70,36 L102,36 L102,122 L78,122 C80,92 76,60 70,36 Z', dk(rb, 0.3), 0.8) + (o.chest ? o.chest(c) : ''));
    s += P('M43,68 L85,68 L86,75 L42,75 Z', c.cel(tr), 2) + E(58, 71.4, 4.4, 3.4, c.cel(o.buckle || '#d6a53c'), 1.4) + C(56.6, 71, 0.9, OL);
    // scale mantle over the shoulders, jagged hem
    var md = 'M42,44 C48,36 78,35 86,43 L88,54 L83,52 L79,57 L74,53 L69,58 L64,53 L59,58 L54,53 L49,57 L44,52 L40,54 Z';
    s += body(c, md, o.mantle || o.hood || '#5a8a3a', scaleTex(38, 40, 92, 58, dk(o.mantle || o.hood || '#5a8a3a', 0.4), 5, 4) + F('M70,34 L92,34 L92,60 L74,60 Z', dk(o.mantle || o.hood || '#5a8a3a', 0.28), 0.8));
    s += R(hx - 3, hy + 9, 10, 8, c.cel(sk), 2);
    s += nelfHead(c, hx, hy, o);
    if (o.hood) s += hoodTop(c, hx, hy, o);
    if (o.crown) s += o.crown(c, hx, hy);
    s += nelfEar(c, hx + 3, hy - 1, sk, o.earK);
    var near = o.near || [[48, 48], [40, 62], [34, 72]];
    if (o.wNear) s += o.wNear(c, near[2]);
    s += limb(pd(near.slice(0, 2)), rb, 9) + limb(pd(near.slice(1)), rb, 8.5);
    var a = near[1], b = near[2], dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / ln, uy = dy / ln, px = -uy * 6.4, py = ux * 6.4, cx0 = b[0] - ux * 7, cy0 = b[1] - uy * 7;
    s += P(pd([[cx0 + px * 0.7, cy0 + py * 0.7], [cx0 + ux * 4 + px, cy0 + uy * 4 + py], [cx0 + ux * 4 - px, cy0 + uy * 4 - py], [cx0 - px * 0.7, cy0 - py * 0.7]], true), c.cel(tr), 1.6);
    s += hand(near[2], c.cel(sk));
    if (o.wNearFront) s += o.wNearFront(c, near[2]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  // storm cloud puff around a hand, with little bolts
  function handStorm(c, p, k) {
    k = k || 1;
    return vglow(c, p[0], p[1], 24 * k, '#9fd4ff', 0.55) + stormcloud(c, p[0], p[1] - 2 * k, 0.3 * k, '#6e7690') + spark(p[0] - 10 * k, p[1] + 8 * k, 0.9 * k, '#9fe0ff') + spark(p[0] + 9 * k, p[1] + 7 * k, 0.7 * k, '#9fe0ff') + arc('M' + pt([p[0] - 4 * k, p[1] + 4 * k]) + 'L' + pt([p[0] - 1 * k, p[1] + 10 * k]) + 'L' + pt([p[0] - 4 * k, p[1] + 12 * k]) + 'L' + pt([p[0] - 1 * k, p[1] + 18 * k]), 0.7 * k);
  }
  // spined fin: spines from base points to tips with a webbed membrane
  function finFan(c, pts, col, spine) {
    var mem = 'M' + pt(pts[0][0]);
    pts.forEach(function (q) { mem += 'L' + pt(q[1]); });
    mem += 'L' + pt(pts[pts.length - 1][0]) + 'Z';
    var sp = '';
    pts.forEach(function (q) { sp += 'M' + pt(q[0]) + 'L' + pt(q[1]); });
    return P(mem, c.cel(col), 2) + L(sp, OL, 3) + L(sp, spine || '#e0d8c0', 1.4);
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
      return G(C(52, 62, 60, glow(c, '#dfe8ff', 0.35)) + zhevra(c, { col: '#f6f2ea', stripe: '#1e1418', mane: '#e8eef8', belly: '#ffffff', horn: '#f0e8d0', hornLen: 0.8, longMane: true, eyeGlow: '#7ac8ff', sw: 4 }), at(1.08, 64, 122));
    },
    savannah_prowler: function (c) { return lioness(c, { col: '#c89a5a', belly: '#f0dcb0' }); },
    sunscale_lashtail: function (c) { return G(raptor(c, { col: '#e89a30', stripe: '#8a3a18', belly: '#f6dc98', crest: '#c8302a' }), at(0.92, 64, 122)); },
    oasis_snapjaw: function (c) { return turtle(c, { shell: '#5e6a3a', skin: '#8a8a60', moss: '#86a83e', spike: '#d8ccaa', rim: '#c8b27a' }); },
    razormane_quilboar: function (c) {
      return quilboar(c, {
        skin: '#8e6650', mane: '#3a2620', band: '#c8342a', tip: '#efe4c4', loin: '#5a2a20', paint: '#c8342a', eye: '#ff7a2a', belt: '#3a2418',
        chest: function () { return L('M42,70 L50,74 M42,78 L50,82', '#c8342a', 2.2); },
        pads: function (c) {
          var st = 'M60,47 Q50,68 46,90', s = limb(st, '#4a2e1c', 3.2);
          [[57, 56], [53, 66], [49, 77]].forEach(function (q) { s += P('M' + (q[0] - 2) + ',' + q[1] + ' L' + (q[0] - 5) + ',' + (q[1] + 5) + ' L' + (q[0] + 1) + ',' + (q[1] + 2) + ' Z', c.cel('#ece2c8'), 1.1); });
          return s + L('M58,51 L55,50 M50,72 L47,71', '#c8342a', 1.8);
        },
        top: function () { return thornBelt(88); },
        wNear: function (c, p) { var top = [p[0] - 24, p[1] - 58], bot = [p[0] + 10, p[1] + 32]; return staff(top, bot, '#4a2e1c') + spearhead(c, top, bot, 16, '#e0d6bc') + feathers(top[0] + 4, top[1] + 18, ['#c8342a', '#1e1410', '#c8342a'], 0.65, 0.2) + L('M' + pt([top[0] + 1, top[1] + 12]) + 'L' + pt([top[0] + 5, top[1] + 20]), '#c8342a', 3); }
      });
    },
    razormane_thornweaver: function (c) {
      return quilboar(c, {
        skin: '#86685a', mane: '#2e2420', band: '#8ad040', tip: '#efe4c4', loin: '#3a4a2a', paint: '#6ad04a', crown: true, eye: '#b8ff5a',
        // the staff is drawn behind the head so the snout stays clear; the near paw still grips it
        back: function (c) { return C(40, 24, 34, glow(c, '#7cff5a', 0.28)) + thornStaff(c, [32, 84]); },
        pads: function () { return boneNeck(50, 59); },
        top: function (c) { return thornBelt(88) + feathers(50, 32, ['#c8342a', '#ece0bc', '#3a2a1a'], 0.8, 2.3); },
        wFar: function (c, p) { return C(p[0], p[1], 9, glow(c, '#7cff5a', 0.5)); }
      });
      function thornStaff(c, p) {
        var top = [p[0] - 6, p[1] - 54], bot = [p[0] + 6, p[1] + 32], x = top[0], y = top[1], th = '';
        var vine = 'M' + pt([x + 2, y + 50]) + 'C' + pt([x - 6, y + 40]) + ' ' + pt([x + 8, y + 30]) + ' ' + pt([x, y + 20]) + 'C' + pt([x - 6, y + 12]) + ' ' + pt([x + 6, y + 4]) + ' ' + pt([x, y]);
        [[x - 3, y + 42, -1], [x + 4, y + 33, 1], [x - 3, y + 22, -1], [x + 3, y + 12, 1], [x - 2, y + 5, -1]].forEach(function (k) { th += P(pd([[k[0], k[1] - 2], [k[0] + k[2] * 7, k[1] - 4], [k[0], k[1] + 2]], true), c.cel('#e0d0a8'), 1); });
        var loop = 'M' + pt([x, y]) + 'C' + pt([x - 14, y - 4]) + ' ' + pt([x - 12, y - 24]) + ' ' + pt([x, y - 26]) + 'C' + pt([x + 12, y - 24]) + ' ' + pt([x + 14, y - 4]) + ' ' + pt([x, y]);
        var lt_ = '';
        [[-11, -8, -1], [-10, -20, -1], [10, -20, 1], [11, -8, 1], [0, -26, 0]].forEach(function (k) { var bx = x + k[0], by = y + k[1]; lt_ += P(k[2] ? pd([[bx, by - 2], [bx + k[2] * 6, by - 3], [bx, by + 2]], true) : pd([[bx - 2, by + 1], [bx, by - 6], [bx + 2, by + 1]], true), c.cel('#e0d0a8'), 1); });
        return staff(top, bot, '#4a3a22', 3.8) + th + L(vine, OL, 5) + L(vine, '#5a8a2a', 2.6) + lt_ + L(loop, OL, 5.4) + L(loop, '#4a3a22', 3) +
          orb(c, x, y - 13, 5, '#7cff5a') + P(pd([[x - 18, y - 30], [x - 14, y - 36], [x - 12, y - 30]], true), '#9ad84a', 1) + P(pd([[x + 12, y - 36], [x + 16, y - 42], [x + 18, y - 35]], true), '#9ad84a', 1) + P(pd([[x - 20, y - 10], [x - 25, y - 14], [x - 19, y - 16]], true), '#9ad84a', 1);
      }
    },
    venture_mercenary: function (c) {
      return goblin(c, {
        skin: '#64a046', shirt: '#cdbf98', sleeve: '#cdbf98', pants: '#5a5040', hat: '#6e7262', stripe: '#e0b030', lamp: false, scar: true, boots: '#2a2018', belt: '#3a2418', glove: '#6a4424',
        chest: function () {
          var sh = '';
          for (var i = 0; i < 6; i++) { var t = 0.08 + i * 0.16; sh += C(50 + 28 * t, 52 + 34 * t, 2, '#d6a53c', 0.9); }
          return F('M44,50 L58,50 L60,90 L46,90 Z', '#7a4a26') + F('M70,50 L84,50 L82,90 L68,90 Z', '#7a4a26') + L('M58,50 L60,90 M70,50 L68,90', '#3a2212', 1.4) + L('M50,52 L78,86', '#3a2414', 5) + sh;
        },
        near: [[48, 56], [46, 70], [44, 78]],
        wNear: function (c, p) { return blunderbuss(c, p, 4, 1.08); }
      });
    },
    venture_geologist: function (c) {
      return goblin(c, {
        skin: '#74b054', shirt: '#7a7e4a', sleeve: '#7a7e4a', pants: '#6a5a3e', hat: '#d8c48a', stripe: '#8a5a2a', lamp: false, specs: true, belt: '#4a3020', boots: '#4a3020',
        back: function (c) { return C(26, 56, 36, glow(c, '#c07aff', 0.32)); },
        chest: function () { return F('M44,50 L58,50 L58,90 L46,90 Z', '#666a3a') + R(68, 60, 10, 8, '#5e6236', 1) + L('M80,50 L50,84', '#5a3a22', 3) + R(66, 74, 5, 8, '#d8d0b8', 0.8); },
        near: [[48, 58], [36, 66], [24, 66]],
        wNearFront: function (c, p) { return crystal(c, p[0] - 1, p[1] - 12); },
        wFar: function (c, p) { return rockHammer(c, p, 16); }
      });
    },
    sunscale_scytheclaw: function (c) { return raptor(c, { col: '#c4562a', stripe: '#5a180e', belly: '#eec08a', crest: '#7a1410', eye: '#ffd040', sickleK: 1.8, talons: true, bigCrest: true }); },
    oasis_crocolisk: function (c) { return crocolisk(c, { col: '#6a7a3c', belly: '#d2c690', scute: '#44522a', eye: '#ffd040' }); },
    takk_the_leaper: function (c) {
      var paint = '#f4f0e0', scar = '#e8c4b4';
      var r = raptor(c, {
        col: '#6a7690', stripe: '#262c40', belly: '#bab4a2', crest: '#e0a028', eye: '#ff4a2a', noShadow: true, sickleK: 1.2, talons: true, bigCrest: true, footMirror: true,
        farLeg: 'M80,84 L94,92 L106,90 L114,96', farFoot: [115, 99],
        nearLeg: 'M64,82 L78,96 L92,98 L100,106', nearFoot: [101, 109],
        arm: 'M50,66 L38,62 L28,56', armHand: [28, 56],
        bodyMark: function () { return L('M48,62 L54,56 L60,62 L66,56 L72,62 L78,58', '#c8302a', 3) + C(60, 70, 1.8, paint) + C(68, 71, 1.8, paint) + C(76, 70, 1.8, paint) + L('M52,74 L60,60 M58,78 L66,62', scar, 1.4); },
        headMark: function () { return E(23, 37.4, 6, 4.4, '#c8302a', 0, 0.85) + L('M10,42 L20,40 M12,46 L24,44', paint, 2) + L('M30,28 L26,46', scar, 1.4); }
      });
      return E(58, 122.5, 34, 5, c.rg([[0, '#000', 0.35], [0.7, '#000', 0.15], [1, '#000', 0]])) + C(60, 60, 64, glow(c, '#ffe08a', 0.42)) + G(r, 'matrix(0.86,0,0,0.86,2,-8) rotate(12,64,84)');
    },
    baeldun_excavator: function (c) {
      return dwarf(c, {
        skin: '#eaa884', hair: '#9a5226', band: '#b8b8c0', shirt: '#5e7aa2', sleeve: '#5e7aa2', forearm: '#eaa884', glove: '#8a6a44', pants: '#6e5a44', boots: '#4a3020', belt: '#5a3a22', buckle: '#b8b8c0',
        helm: minerHelm,
        chest: function () { return L('M46,56 L46,98 M80,56 L82,98', '#6a4424', 3.4) + E(50, 74, 7, 5, '#d0c0a0', 0, 0.5) + E(80, 86, 7, 5, '#d0c0a0', 0, 0.45) + R(74, 64, 9, 8, '#4e6a90', 1); },
        near: [[44, 62], [34, 72], [28, 66]],
        wNear: function (c, p) { return shovel(c, p, -24, 1); }
      });
    },
    baeldun_soldier: function (c) {
      var blue = '#2a4a8e', gold = '#e0b040', mail = '#8e949c';
      return dwarf(c, {
        skin: '#d8906c', hair: '#3a2416', band: gold, shirt: mail, sleeve: mail, forearm: '#6a4a2c', glove: '#5a3a22', pants: '#4a4a56', boots: '#3a2a20', belt: '#3a2418', buckle: gold, beardLen: 28,
        helm: hornedHelm,
        chest: function () {
          var d = '';
          for (var y = 56; y < 100; y += 4) for (var x = 38 + ((y / 4) % 2) * 2.5; x < 90; x += 5) d += 'M' + pt([x, y]) + 'q2.5,3 5,0';
          return L(d, dk(mail, 0.35), 1);
        },
        front: function (c) {
          return body(c, 'M50,58 L80,58 L80,108 L65,116 L50,108 Z', blue, F('M68,56 L82,56 L82,118 L68,118 Z', dk(blue, 0.3), 0.8) + L('M53,58 L53,106 L65,113 L77,106 L77,58', gold, 1.4) +
            F('M59,102 L71,102 L69,105 L67,105 L68,109 L62,109 L63,105 L61,105 Z', gold), 1.8);
        },
        pads: function (c) { return body(c, 'M76,58 C78,50 92,50 95,60 L93,68 L80,66 Z', '#a2a8b0', F('M86,48 L98,48 L98,70 L88,70 Z', dk('#a2a8b0', 0.3), 0.8), 1.8); },
        top: function (c) { return body(c, 'M32,64 C32,53 48,50 54,58 L52,67 L36,70 Z', '#a2a8b0', E(40, 58, 5, 2.4, '#ffffff', 0, 0.45) + L('M34,66 C40,64 46,64 52,65', gold, 1.4), 1.8); },
        near: [[44, 62], [38, 76], [44, 86]],
        wNear: function (c, p) { return rifle(c, p, 30, 0.95); }
      });
    },
    // ---------------- The Dreaming Caves ----------------
    druid_of_the_fang: function (c) {
      return fangDruid(c, {
        skin: '#c8a07a', robe: '#3f7040', hood: '#5a8a3a', hoodBelly: '#dcd490', eye: '#9cff5a', hair: '#3a2e24', trim: '#6a4424',
        far: [[78, 48], [88, 62], [94, 72]],
        wFar: function (c, p) { return vglow(c, p[0], p[1], 14, WCG, 0.7) + C(p[0] + 1, p[1] - 5, 2, lt(WCG, 0.5), 0.8); },
        wNear: function (c, p) { return snakeStaff(c, p, { col: '#6aa040', band: '#2a4a1e', orb: WCG }); },
        tf: at(1.02, 64, 122)
      });
    },
    deviate_ravager: function (c) {
      var col = '#5a9a40', pur = '#7a3aa8', sp = '';
      [[44, 56, -2.2, 10], [52, 51, -1.95, 13], [61, 49, -1.7, 15], [70, 49, -1.45, 15], [79, 52, -1.2, 13], [90, 56, -1.0, 12], [99, 53, -0.8, 12], [107, 48, -0.6, 11], [114, 41, -0.4, 9], [36, 42, -2.5, 9], [42, 38, -2.2, 8]].forEach(function (q) {
        var a = q[2], bx = q[0], by = q[1] + 3, len = q[3], px = -Math.sin(a) * 3.4, py = Math.cos(a) * 3.4, tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len;
        sp += P(pd([[bx + px, by + py], [tx, ty], [bx - px, by - py]], true), c.cel('#d8c8e8'), 1.4) + F(pd([[bx + (tx - bx) * 0.5 + px * 0.5, by + (ty - by) * 0.5 + py * 0.5], [tx, ty], [bx + (tx - bx) * 0.5 - px * 0.5, by + (ty - by) * 0.5 - py * 0.5]], true), pur);
      });
      var r = raptor(c, {
        col: col, stripe: pur, belly: '#c8dc8a', crest: '#9a4ad0', eye: '#d8ff5a', bigCrest: true, talons: true, sickleK: 1.5,
        bodyMark: function () { return C(58, 64, 3.4, '#b88ae0', 1.2) + C(70, 70, 2.4, '#b88ae0', 1) + C(80, 62, 2.8, '#b88ae0', 1.1) + C(66, 58, 1.6, '#d8b8f4'); },
        headMark: function () { return C(30, 44, 2, '#b88ae0', 1); }
      });
      return G(C(52, 54, 44, glow(c, '#b86af0', 0.3)) + sp + r + vglow(c, 23, 37.4, 9, '#d8ff5a', 0.9) + C(23, 37.4, 1.4, '#ffffff'), at(1.02, 64, 122));
    },
    deviate_viper: function (c) {
      var col = '#5aa03a', band = '#6a2a8a', bel = '#dcd890', s = shadow(c, 80, 44);
      s += C(40, 44, 44, glow(c, '#b86af0', 0.25));
      // ground coils: back halves, then front halves
      s += tube(c, [[[46, 110], [48, 98], [116, 98], [118, 110]]], 15, 15, dk(col, 0.12), { band: dk(band, 0.1), bandEvery: 3, side: -1 });
      s += tube(c, [[[56, 100], [58, 90], [110, 90], [112, 100]]], 13, 13, dk(col, 0.06), { band: dk(band, 0.05), bandEvery: 3, side: -1 });
      s += tube(c, [[[118, 110], [120, 100], [128, 98], [124, 88]]], 11, 3, col, { band: band, bandEvery: 3, belly: bel });
      s += tube(c, [[[118, 110], [118, 124], [46, 124], [46, 110]]], 15, 15, col, { band: band, bandEvery: 3, belly: bel, side: -1, steps: 16 });
      s += tube(c, [[[112, 100], [112, 111], [58, 111], [56, 100]]], 13, 13, col, { band: band, bandEvery: 3, belly: bel, side: -1, steps: 16 });
      // cobra hood, then the rearing neck and head
      s += cobraHood(c, 42, 50, 50, 50, dk(col, 0.05), '#e0c040', null);
      s += tube(c, [[[62, 104], [48, 96], [52, 76], [44, 62]], [[44, 62], [40, 54], [38, 48], [36, 44]]], 17, 12, col, { band: band, bandEvery: 3, belly: bel, side: 1, steps: 10 });
      s += snakeHead(c, 34, 40, 1.05, { col: col, belly: bel, eye: '#d8ff5a', open: true, band: dk(col, 0.2) });
      return G(s, 'matrix(0.96,0,0,0.96,4.6,4.9)');
    },
    lady_anacondra: function (c) {
      var gold = '#e0b040', hair = '#2a9a86';
      return fangDruid(c, {
        female: true, skin: '#f1d3b8', robe: '#23704e', mantle: '#1e5a40', belly: '#d8b850', trim: '#8a3ab0', buckle: gold, eye: '#9cff5a', hair: hair, hy: 31, noFeet: true,
        robeD: 'M49,44 C55,39 73,39 79,44 L82,66 C86,88 94,104 106,110 C114,114 122,114 126,112 L124,121 L34,121 L38,108 L45,66 Z',
        back: function (c) { return C(60, 60, 66, glow(c, '#7aff5a', 0.32)) + cobraHood(c, 66, 38, 62, 52, '#1e5a40', '#b86af0', gold); },
        hairBack: function (c, x, y) { return body(c, 'M' + pt([x - 6, y - 12]) + 'C' + pt([x + 10, y - 18]) + ' ' + pt([x + 18, y - 4]) + ' ' + pt([x + 18, y + 12]) + 'C' + pt([x + 20, y + 30]) + ' ' + pt([x + 30, y + 44]) + ' ' + pt([x + 36, y + 58]) + 'C' + pt([x + 22, y + 52]) + ' ' + pt([x + 10, y + 36]) + ' ' + pt([x + 4, y + 16]) + 'Z', hair, L('M' + pt([x + 10, y - 4]) + 'C' + pt([x + 14, y + 14]) + ' ' + pt([x + 20, y + 32]) + ' ' + pt([x + 30, y + 50]), lt(hair, 0.25), 1.2), 2); },
        chest: function () { return L('M50,40 L58,56 L66,40', gold, 1.6) + L('M56,40 L57,120 M62,40 L64,120', gold, 1.2, 0.9) + L('M40,108 L124,114', gold, 1.4, 0.8); },
        crown: function (c, x, y) {
          var s = '';
          [[-6, -13, -2.0, 8], [0, -15, -1.65, 10], [6, -14, -1.3, 8]].forEach(function (q) { var a = q[2], bx = x + q[0], by = y + q[1]; s += P(pd([[bx - 2.4, by + 1.6], [bx + Math.cos(a) * q[3], by + Math.sin(a) * q[3]], [bx + 2.4, by + 1.2]], true), c.cel(gold), 1.3); });
          s += P('M' + pt([x - 10, y - 9]) + 'C' + pt([x - 4, y - 14]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 11, y - 9]) + 'L' + pt([x + 11, y - 5]) + 'C' + pt([x + 6, y - 9]) + ' ' + pt([x - 4, y - 9]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(gold), 1.6);
          var sn = 'M' + pt([x - 8, y - 9]) + 'C' + pt([x - 13, y - 13]) + ' ' + pt([x - 9, y - 17]) + ' ' + pt([x - 13, y - 20]);
          s += L(sn, OL, 5.4) + L(sn, gold, 2.8) + P(pd([[x - 11, y - 18.6], [x - 19, y - 21], [x - 12, y - 24]], true), c.cel(gold), 1.2) + C(x - 14, y - 21.4, 0.9, '#3aff6a');
          return s + vglow(c, x, y - 10, 7, '#3aff8a', 0.8) + C(x, y - 10.6, 2, '#3aff8a', 1);
        },
        near: [[48, 48], [36, 52], [22, 48]],
        wNearFront: function (c, p) {
          var x = p[0], y = p[1];
          return vglow(c, x - 2, y, 20, WCG, 0.8) + garc('M' + pt([x - 4, y]) + 'L' + pt([x - 10, y - 6]) + 'L' + pt([x - 8, y - 10]) + 'L' + pt([x - 16, y - 16]) + 'L' + pt([x - 20, y - 26])) +
            garc('M' + pt([x - 4, y + 1]) + 'L' + pt([x - 12, y + 2]) + 'L' + pt([x - 11, y + 6]) + 'L' + pt([x - 21, y + 8])) + garc('M' + pt([x - 3, y + 3]) + 'L' + pt([x - 7, y + 12]) + 'L' + pt([x - 11, y + 13]) + 'L' + pt([x - 14, y + 22]), 0.8) + C(x - 3, y, 3, '#f4ffe8');
        },
        far: [[76, 48], [90, 40], [100, 28]],
        wFar: function (c, p) { return vglow(c, p[0], p[1] - 4, 16, WCG, 0.8) + garc('M' + pt([p[0] - 6, p[1] - 4]) + 'Q' + pt([p[0], p[1] - 14]) + ' ' + pt([p[0] + 6, p[1] - 4]), 0.7) + C(p[0], p[1] - 6, 2.4, '#f4ffe8'); },
        tf: at(1.0, 64, 122)
      });
    },
    lord_cobrahn: function (c) {
      var sk = '#b08868', col = '#7a9a30', band = '#34461a', bel = '#e0d890', s = shadow(c, 76, 48);
      function claws(p, a) { var d = ''; [-0.5, 0, 0.5].forEach(function (k) { var b = a + k, bx = p[0] + Math.cos(b) * 3.4, by = p[1] + Math.sin(b) * 3.4; d += 'M' + pt([bx, by]) + 'L' + pt([bx + Math.cos(b) * 5, by + Math.sin(b) * 5]); }); return L(d, OL, 3.6) + L(d, '#f4ecd6', 1.6); }
      s += C(60, 56, 64, glow(c, '#b8ff5a', 0.28));
      // tail coils behind, then the snake lower body from the waist
      s += tube(c, [[[52, 112], [54, 100], [116, 98], [118, 110]]], 16, 16, dk(col, 0.14), { band: dk(band, 0.1), bandEvery: 3, side: -1 });
      s += cobraHood(c, 62, 36, 56, 52, col, '#e0c040', null);
      var far = [[78, 48], [90, 40], [96, 28]];
      s += limb(pd(far.slice(0, 2)), dk(sk, 0.12), 8) + limb(pd(far.slice(1)), dk(sk, 0.12), 7) + hand(far[2], c.cel(dk(sk, 0.12))) + claws(far[2], -1.9) + vglow(c, far[2][0], far[2][1] - 4, 14, WCG, 0.6);
      s += tube(c, [[[64, 76], [62, 92], [48, 102], [54, 114]], [[54, 114], [60, 124], [104, 124], [114, 114]], [[114, 114], [122, 106], [126, 96], [118, 86]]], 26, 4, col, { band: band, bandEvery: 4, belly: bel, side: 1, steps: 12 });
      // torso: bare nelf chest under an open scale vest
      var td = 'M46,44 C52,38 76,38 82,44 L82,70 C76,78 52,78 46,70 Z';
      s += body(c, td, sk, F('M70,36 L90,36 L90,80 L72,80 C76,64 74,50 70,36 Z', dk(sk, 0.25), 0.8) + L('M52,52 Q58,56 64,52 M54,62 L62,62', dk(sk, 0.3), 1.2) + scaleTex(58, 60, 84, 78, '#5a7a2a', 5, 4));
      s += body(c, 'M44,46 C46,40 54,38 56,42 L54,76 L44,72 Z', '#4e6a24', scaleTex(40, 40, 58, 78, dk('#4e6a24', 0.35), 5, 4), 1.8) + body(c, 'M76,40 C82,38 88,42 86,48 L84,74 L72,78 Z', '#4e6a24', scaleTex(70, 36, 90, 80, dk('#4e6a24', 0.35), 5, 4), 1.8);
      s += P('M42,68 L86,68 L88,82 L82,80 L78,86 L72,81 L66,87 L60,81 L54,87 L48,81 L42,84 Z', c.cel('#6a4424'), 2) + E(62, 72, 4, 3, c.cel('#d6a53c'), 1.3);
      s += R(53, 34, 10, 9, c.cel(sk), 2);
      s += nelfHead(c, 56, 26, { skin: sk, eye: '#e0ff40', hair: '#3a6a2a', fangs: true, slit: true, scales: '#5a8a2a' });
      s += nelfEar(c, 59, 25, sk, 0.9);
      var near = [[48, 48], [36, 58], [22, 56]];
      s += limb(pd(near.slice(0, 2)), sk, 8.5) + limb(pd(near.slice(1)), sk, 8) + L('M40,52 q2,3 4,0 M36,56 q2,3 4,0', '#5a8a2a', 1.2) + hand(near[2], c.cel(sk)) + claws(near[2], Math.PI + 0.1);
      return G(s, at(1.02, 64, 122));
    },
    kresh: function (c) {
      var t = turtle(c, { shell: '#4a5234', skin: '#7c8266', moss: '#5e8e34', spike: '#bcb48e', rim: '#8a8458', eye: '#ffb030' });
      var s = C(70, 70, 70, glow(c, '#8aff6a', 0.18)) + t;
      // hanging moss off the rim, cracks and barnacles on the shell
      s += L('M40,58 L52,64 L50,72 M104,56 L96,64 M72,86 L80,94 L76,100', dk('#4a5234', 0.5), 1.4, 0.9);
      [[34, 104, 10], [48, 108, 8], [66, 110, 12], [86, 110, 9], [104, 108, 11], [120, 104, 7]].forEach(function (m) { s += P('M' + (m[0] - 4) + ',' + m[1] + ' C' + (m[0] - 5) + ',' + (m[1] + m[2] * 0.6) + ' ' + (m[0] - 1) + ',' + (m[1] + m[2] * 0.8) + ' ' + m[0] + ',' + (m[1] + m[2]) + ' C' + (m[0] + 1) + ',' + (m[1] + m[2] * 0.7) + ' ' + (m[0] + 4) + ',' + (m[1] + m[2] * 0.4) + ' ' + (m[0] + 4) + ',' + m[1] + ' Z', c.cel('#5e8e34'), 1.2); });
      [[56, 80], [96, 88], [84, 58], [110, 80]].forEach(function (b) { s += C(b[0], b[1], 2.6, c.cel('#d8d0b0'), 1.2) + C(b[0], b[1], 0.9, OL); });
      // fungus grove growing on the shell
      s += shrooms(c, 62, 50, 0.9, WCG, [[-8, 10, 6], [1, 17, 8], [9, 8, 5]]) + shrooms(c, 98, 54, 0.85, WCP, [[-6, 12, 6], [4, 20, 9], [12, 9, 5]]) + shrooms(c, 40, 72, 0.6, WCP, [[-4, 10, 6], [5, 7, 4]]);
      s += L('M80,46 C84,40 78,34 84,28', OL, 3.4) + L('M80,46 C84,40 78,34 84,28', '#5a8a3a', 1.6) + P('M84,28 Q90,26 90,32 Q86,32 84,28 Z', '#5a9a3a', 1);
      return G(s, 'matrix(1.04,0,0,1.06,' + n(-64 * 0.04) + ',' + n(-122 * 0.06) + ')');
    },
    lord_pythas: function (c) {
      return fangDruid(c, {
        skin: '#8c5e3c', robe: '#1e4a30', mantle: '#2a4a26', hood: '#2e5a2a', hoodBelly: '#c8c878', crest: '#9ac040', beard: true, hair: '#5a4a38', eye: '#b8ff6a', trim: '#3a2a1a', belly: '#9aa860', buckle: '#8ab8ff',
        back: function (c) { return C(60, 56, 64, glow(c, '#6aa8ff', 0.26)); },
        chest: function () { return L('M44,96 L92,100 M40,104 L94,108', '#8ab8ff', 1.2, 0.6); },
        far: [[78, 46], [90, 40], [98, 26]],
        wFar: function (c, p) { return handStorm(c, [p[0] + 2, p[1] - 6], 1.3) + vglow(c, p[0], p[1], 12, '#bfe8ff', 0.6); },
        wNear: function (c, p) { return snakeStaff(c, p, { col: '#4a7a2e', band: '#1e3014', orb: '#9fe8ff', orbR: 4, eye: '#9aff6a' }) + handStorm(c, [p[0] - 10, p[1] + 10], 1.15); },
        tf: at(1.05, 64, 122)
      });
    },
    mutanus: function (c) {
      // a giant mutated mireling (marsh newt): bloated, upright, frilled collar, round eyes on top of the head, small mouth, long tail, webbed hands
      var col = '#7e8c76', dcol = dk(col, 0.3), bel = '#d6c888', fin = '#6a4a7a', eye = '#e4ff5a', s = E(66, 122, 58, 7, c.rg([[0, '#000', 0.5], [0.7, '#000', 0.25], [1, '#000', 0]]));
      s += C(64, 60, 70, glow(c, '#9aff5a', 0.22));
      // long tail sweeping out behind and curling up
      var td = 'M92,98 C104,110 118,116 126,108 C132,100 130,82 120,74 C124,86 124,96 118,100 C110,104 100,94 94,86 Z';
      s += body(c, td, col, F('M96,96 C106,104 118,108 124,104 L126,112 L96,112 Z', dcol, 0.7) + F('M100,90 C108,96 116,98 120,94', lt(col, 0.2), 0.5), 2.2);
      // far leg + far arm with a webbed hand
      s += limb('M88,104 L96,116', dcol, 12) + P('M86,116 L104,116 L108,122 L82,122 Z', c.cel(dcol), 1.8);
      s += limb('M88,68 L100,82 L102,92', dcol, 9) + P('M96,92 L100,102 L104,94 L108,101 L108,90 Z', c.cel(dk(dcol, 0.1)), 1.5);
      // bloated upright body, pale spotted belly, mutated warts
      var bd = 'M40,62 C38,44 52,34 68,36 C88,38 102,56 102,78 C104,102 92,118 72,120 L54,120 C38,118 32,102 34,86 C34,76 38,68 40,62 Z';
      var warts = '';
      [[86, 48, 3.2], [96, 66, 2.6], [76, 42, 2], [98, 86, 3], [90, 104, 2.4], [70, 50, 1.6]].forEach(function (w) { warts += C(w[0], w[1], w[2], '#9a6ab0', 1) + C(w[0] - w[2] * 0.3, w[1] - w[2] * 0.3, w[2] * 0.35, '#d8b8f0'); });
      var spots = C(52, 86, 2.2, dk(bel, 0.35)) + C(60, 98, 1.8, dk(bel, 0.35)) + C(48, 104, 2, dk(bel, 0.35)) + C(66, 110, 1.6, dk(bel, 0.35)) + C(58, 78, 1.4, dk(bel, 0.35));
      s += body(c, bd, col, F('M84,34 C100,44 108,62 108,80 C108,104 96,122 74,124 L112,124 L112,30 Z', dcol, 0.8) + F('M38,74 C40,98 50,114 68,118 C78,104 76,84 66,70 C56,62 44,64 38,74 Z', bel, 0.95) + spots +
        L('M40,88 Q48,90 56,88 M42,100 Q52,102 62,100', dk(bel, 0.25), 1.1, 0.8) + warts, 2.6);
      // frilled collar behind the head: a ruff of rounded lobes
      var fr = '', cx = 60, cy = 46;
      for (var i = 0; i < 7; i++) {
        var a0 = -2.2 + i * 0.5, a1 = a0 + 0.5, r0 = 12, r1 = 27 - (i % 2) * 4;
        fr += 'M' + pt([cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0]) + 'Q' + pt([cx + Math.cos(a0) * r1 * 1.05, cy + Math.sin(a0) * r1 * 1.05]) + ' ' + pt([cx + Math.cos(a0 + 0.26) * r1, cy + Math.sin(a0 + 0.26) * r1]) + 'Q' + pt([cx + Math.cos(a1) * r1 * 1.05, cy + Math.sin(a1) * r1 * 1.05]) + ' ' + pt([cx + Math.cos(a1) * r0, cy + Math.sin(a1) * r0]) + 'L' + pt([cx, cy]) + 'Z';
      }
      s += P(fr, c.cel(fin), 1.8);
      var rib = '';
      for (var j = 0; j < 7; j++) { var aa = -2.2 + j * 0.5 + 0.25; rib += 'M' + pt([cx + Math.cos(aa) * 13, cy + Math.sin(aa) * 13]) + 'L' + pt([cx + Math.cos(aa) * 24, cy + Math.sin(aa) * 24]); }
      s += L(rib, lt(fin, 0.35), 1.1, 0.9);
      // broad flat head, round eyes set on top, small mouth
      var hd = 'M12,50 C10,38 24,28 42,27 C58,26 70,32 72,42 C73,52 62,60 46,61 C30,62 14,60 12,50 Z';
      s += body(c, hd, col, F('M14,52 C22,60 42,62 60,58 C66,56 70,52 72,46 L74,64 L10,64 Z', bel, 0.9) + F('M56,24 L76,24 L76,62 L60,62 C66,50 64,36 56,24 Z', dcol, 0.6) + C(40, 40, 1.6, dcol) + C(58, 44, 2, '#9a6ab0'), 2.4);
      s += L('M14,51 C22,55 32,56 42,53', OL, 1.8) + L('M40,53.4 l2.4,-1.4', OL, 1.4) + C(15, 43, 1.1, OL) + C(20, 42, 1, OL);
      // eyes: two big round ones on top, a small extra mutated one behind
      [[26, 27, 7.2], [46, 25, 6.4], [62, 30, 4]].forEach(function (e) { s += vglow(c, e[0], e[1], e[2] * 2.2, eye, 0.7) + C(e[0], e[1] + 1, e[2] + 1.6, c.cel(col), 2) + C(e[0], e[1], e[2], c.cel(lt(eye, 0.15)), 1.4) + C(e[0] - 0.6, e[1] + 0.4, e[2] * 0.45, OL) + C(e[0] - e[2] * 0.35, e[1] - e[2] * 0.35, e[2] * 0.2, '#ffffff'); });
      // near arm reaching out with a webbed three-fingered hand
      s += limb('M60,74 L44,86 L30,80', col, 11);
      s += P('M28,74 L18,68 L22,75 L12,77 L22,81 L17,88 L28,86 L32,82 Z', c.cel(col), 1.6) + L('M26,76 L19,76 M27,82 L21,85', dk(col, 0.35), 1) + L('M18,68 l-2,-1.6 M12,77 l-2.4,0 M17,88 l-1.6,1.8', OL, 2.4) + L('M18,68 l-2,-1.6 M12,77 l-2.4,0 M17,88 l-1.6,1.8', '#efe8cc', 1);
      // near leg with a webbed foot
      s += limb('M60,106 L56,116', col, 13) + P('M42,116 L64,116 L68,122 L38,122 Z', c.cel(col), 1.8) + L('M46,122 L44,117 M53,122 L52,117 M60,122 L60,117', OL, 1.2);
      return s;
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
