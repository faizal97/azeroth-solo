/* art_stonetalon.js — Highcrag Mountains zone art for Realm of Loner (Krugar, levels 18-25: Camp Vosh, Tallstone Retreat,
 * the Silkline Path, Sawtooth Crag, Kettle Lake, the Screaming Vale, Sourhorn Post, Fogwater Lake).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Highcrag keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig, tauren tents/totems, the perch, the voodoo totem and the goblin industry pieces are shared
 * copies of art_barrens.js / art_mulgore.js / art_durotar.js / art_tirisfal.js so the zones match.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix st<counter>_).
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
  function Ctx() { this.p = 'st' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function arc(d, w) { return L(d, '#bfe8ff', (w || 1) * 3.4, 0.55) + L(d, '#ffffff', (w || 1) * 1.3); }
  function vglow(c, x, y, r, col, a) { return C(x, y, r, glow(c, col, a == null ? 0.7 : a)); }
  function handStorm(c, p, k) {
    k = k || 1;
    return vglow(c, p[0], p[1], 24 * k, '#9fd4ff', 0.55) + stormcloud(c, p[0], p[1] - 2 * k, 0.3 * k, '#6e7690') + spark(p[0] - 10 * k, p[1] + 8 * k, 0.9 * k, '#9fe0ff') + spark(p[0] + 9 * k, p[1] + 7 * k, 0.7 * k, '#9fe0ff') + arc('M' + pt([p[0] - 4 * k, p[1] + 4 * k]) + 'L' + pt([p[0] - 1 * k, p[1] + 10 * k]) + 'L' + pt([p[0] - 4 * k, p[1] + 12 * k]) + 'L' + pt([p[0] - 1 * k, p[1] + 18 * k]), 0.7 * k);
  }
  // ---- goblin industry (shared copies of art_barrens.js) ----
  var IRON = '#5e5a54', RUST = '#a0582a', OIL = '#121216';
  function gear(c, x, y, r, col) {
    var d = '', k = 10;
    for (var i = 0; i < k * 2; i++) { var a0 = Math.PI * 2 * i / (k * 2), a1 = Math.PI * 2 * (i + 1) / (k * 2), rr = i % 2 ? r * 0.78 : r; d += (i ? 'L' : 'M') + pt([x + Math.cos(a0) * rr, y + Math.sin(a0) * rr]) + 'L' + pt([x + Math.cos(a1) * rr, y + Math.sin(a1) * rr]); }
    return P(d + 'Z', c.cel(col), 1.6) + C(x, y, r * 0.35, dk(col, 0.35), 1.2) + C(x, y, r * 0.12, OL);
  }
  function smog(x, y, s, col, op) {
    var o = '', r = rng(Math.round(x * 11 + y * 7));
    for (var i = 0; i < 6; i++) o += E(x + (i - 2.5) * 16 * s + (r() - 0.5) * 8 * s, y + (r() - 0.5) * 6 * s, (18 + r() * 12) * s, (7 + r() * 5) * s, col, 0, op);
    return o;
  }
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
  function deadTree(c, x, y, s, col) {
    col = col || '#3a3228';
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]) + 'M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x - 3 * s, y - 60 * s]), col, 1.6 * s);
    return o + L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]), lt(col, 0.18), 1.4 * s, 0.7);
  }
  // lily pad (+ optional flower)
  function place(s, p, ang, sc) { return G(s, 'translate(' + n(p[0]) + ',' + n(p[1]) + ') rotate(' + n(ang) + ')' + (sc && sc !== 1 ? ' scale(' + n(sc) + ')' : '')); }
  // ---- tauren camp pieces (shared copies of art_mulgore.js) ----
  var HIDE = '#e6cfa0', PAINT_R = '#b83a2a', PAINT_B = '#2f7a8a', PAINT_Y = '#e0a83a', WOOD = '#8a5a32';
  // tauren tent: tall painted hide cone with horn-curved poles
  function taurenTent(c, x, y, s, o) {
    o = o || {};
    var hide = o.hide || HIDE, p1 = o.p1 || PAINT_R, p2 = o.p2 || PAINT_B, w = o.w || 1, out = '';
    var hw = 28 * s * w, ht = 56 * s, ax = x, ay = y - ht;
    out += E(x, y + 1, hw + 6 * s, 5 * s, '#000', 0, 0.22);
    [[-13, -18], [-5, -22], [5, -21], [13, -16]].forEach(function (pp) {
      var d = 'M' + pt([ax + pp[0] * 0.12 * s, ay + 8 * s]) + 'Q' + pt([ax + pp[0] * 0.3 * s, ay - 6 * s]) + ' ' + pt([ax + pp[0] * s, ay + pp[1] * s]);
      out += limb(d, '#7a5030', 2 * s);
    });
    var seg = hw * 2 / 6, bot = '';
    for (var k = 0; k < 6; k++) bot += 'Q' + pt([x + hw - seg * k - seg / 2, y + 3 * s]) + ' ' + pt([x + hw - seg * (k + 1), y]);
    var d = 'M' + pt([ax - 4 * s, ay + 2 * s]) + 'L' + pt([ax + 4 * s, ay + 2 * s]) + 'C' + pt([ax + hw * 0.4, ay + ht * 0.3]) + ' ' + pt([x + hw * 0.92, y - ht * 0.28]) + ' ' + pt([x + hw, y]) + bot +
      'C' + pt([x - hw * 0.92, y - ht * 0.28]) + ' ' + pt([ax - hw * 0.4, ay + ht * 0.3]) + ' ' + pt([ax - 4 * s, ay + 2 * s]) + 'Z';
    var b1 = y - ht * 0.34, zz = '', zx = x - hw - 4;
    while (zx < x + hw + 4) { zz += (zz ? 'L' : 'M') + pt([zx, b1 + 2.5 * s]) + 'L' + pt([zx + 4 * s, b1 - 2.5 * s]); zx += 8 * s; }
    var sh = R(x - hw - 6, b1 - 6 * s, hw * 2 + 12, 12 * s, p1) + L(zz, p2, 2 * s) + L('M' + pt([x - hw - 6, b1 - 6 * s]) + 'L' + pt([x + hw + 6, b1 - 6 * s]) + 'M' + pt([x - hw - 6, b1 + 6 * s]) + 'L' + pt([x + hw + 6, b1 + 6 * s]), dk(p1, 0.4), 1.2 * s) +
      R(x - hw - 6, y - ht * 0.1 - 2 * s, hw * 2 + 12, 4 * s, p2) +
      R(x - hw - 6, ay - 2, hw * 2 + 12, ht * 0.14, dk(hide, 0.35)) +
      L('M' + pt([ax - 2 * s, ay + 4 * s]) + 'L' + pt([x - hw * 0.55, y]) + 'M' + pt([ax + 2 * s, ay + 4 * s]) + 'L' + pt([x + hw * 0.5, y]), dk(hide, 0.25), 1.1 * s, 0.8) +
      F('M' + pt([ax + 1 * s, ay]) + 'L' + pt([x + hw + 8 * s, y + 6 * s]) + 'L' + pt([x + hw * 0.3, y + 6 * s]) + 'C' + pt([x + hw * 0.25, y - ht * 0.4]) + ' ' + pt([ax + 3 * s, ay + ht * 0.3]) + ' ' + pt([ax + 1 * s, ay]) + 'Z', dk(hide, 0.25), 0.75);
    // painted emblem: sun disc + hoof marks
    var ey = y - ht * 0.58;
    sh += C(x - 4 * s, ey, 4.2 * s, p1) + C(x - 4 * s, ey, 1.8 * s, PAINT_Y) + L('M' + pt([x - 4 * s, ey - 7 * s]) + 'L' + pt([x - 4 * s, ey - 5.5 * s]) + 'M' + pt([x - 11 * s, ey]) + 'L' + pt([x - 9.5 * s, ey]) + 'M' + pt([x + 1.5 * s, ey]) + 'L' + pt([x + 3 * s, ey]), p1, 1.2 * s);
    out += body(c, d, hide, sh, 2 * s);
    // door flap
    out += P('M' + pt([x - 10 * s, y + 1]) + 'L' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'Z', '#2a1a10', 1.6 * s);
    out += P('M' + pt([x - 3 * s, y - 22 * s]) + 'L' + pt([x + 5 * s, y + 1]) + 'L' + pt([x + 11 * s, y + 1]) + 'Z', c.cel(lt(hide, 0.1)), 1.4 * s);
    return out;
  }
  // tall carved totem pole topped with spread thunderbird wings
  function totem(c, x, y, h, s, o) {
    o = o || {};
    var cols = o.cols || [PAINT_R, PAINT_B, PAINT_Y, WOOD], w = 8 * s, top = y - h, out = E(x, y + 1, 12 * s, 3 * s, '#000', 0, 0.25);
    out += body(c, 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, top + 10 * s]) + 'L' + pt([x + w / 2, top + 10 * s]) + 'L' + pt([x + w / 2, y]) + 'Z', WOOD, F('M' + pt([x + w * 0.1, top]) + 'L' + pt([x + w, top]) + 'L' + pt([x + w, y]) + 'L' + pt([x + w * 0.1, y]) + 'Z', dk(WOOD, 0.3), 0.8), 1.8 * s);
    var nseg = Math.max(1, Math.min(o.seg || 3, Math.floor((h - 16 * s) / (20 * s))));
    for (var i = 0; i < nseg; i++) {
      var sy = top + 14 * s + i * 20 * s, bw = 9 * s, col = cols[i % cols.length];
      out += body(c, 'M' + pt([x - bw, sy]) + 'L' + pt([x + bw, sy]) + 'L' + pt([x + bw * 0.9, sy + 18 * s]) + 'L' + pt([x - bw * 0.9, sy + 18 * s]) + 'Z', col, F('M' + pt([x + bw * 0.25, sy - 2]) + 'L' + pt([x + bw + 2, sy - 2]) + 'L' + pt([x + bw + 2, sy + 20 * s]) + 'L' + pt([x + bw * 0.25, sy + 20 * s]) + 'Z', dk(col, 0.3), 0.8), 1.6 * s);
      // carved face
      out += L('M' + pt([x - 6 * s, sy + 4 * s]) + 'L' + pt([x - 1.5 * s, sy + 5.5 * s]) + 'M' + pt([x + 1.5 * s, sy + 5.5 * s]) + 'L' + pt([x + 6 * s, sy + 4 * s]), OL, 1.4 * s);
      out += R(x - 5 * s, sy + 6.5 * s, 2.6 * s, 2.2 * s, '#f4ecd6') + R(x + 2.4 * s, sy + 6.5 * s, 2.6 * s, 2.2 * s, '#f4ecd6');
      out += (i % 2 ? P('M' + pt([x - 2 * s, sy + 9 * s]) + 'L' + pt([x, sy + 15 * s]) + 'L' + pt([x + 2 * s, sy + 9 * s]) + 'Z', c.cel(PAINT_Y), 1 * s) : R(x - 5 * s, sy + 12 * s, 10 * s, 3 * s, '#2a1a10', 1 * s));
      if (i % 2 === 0) out += P('M' + pt([x - bw, sy + 2 * s]) + 'L' + pt([x - bw - 5 * s, sy - 3 * s]) + 'L' + pt([x - bw, sy + 7 * s]) + 'Z', c.cel(lt(col, 0.1)), 1.2 * s) + P('M' + pt([x + bw, sy + 2 * s]) + 'L' + pt([x + bw + 5 * s, sy - 3 * s]) + 'L' + pt([x + bw, sy + 7 * s]) + 'Z', c.cel(dk(col, 0.1)), 1.2 * s);
    }
    // wings
    var wy = top + 10 * s, wc = o.wing || PAINT_B, tip = o.tip || PAINT_R;
    [-1, 1].forEach(function (sg) {
      var d = 'M' + pt([x, wy + 2 * s]) + 'C' + pt([x + sg * 10 * s, wy - 6 * s]) + ' ' + pt([x + sg * 24 * s, wy - 12 * s]) + ' ' + pt([x + sg * 34 * s, wy - 12 * s]) +
        'L' + pt([x + sg * 30 * s, wy - 6 * s]) + 'L' + pt([x + sg * 32 * s, wy - 3 * s]) + 'L' + pt([x + sg * 25 * s, wy - 1 * s]) + 'L' + pt([x + sg * 26 * s, wy + 3 * s]) + 'L' + pt([x + sg * 18 * s, wy + 3 * s]) + 'L' + pt([x + sg * 17 * s, wy + 7 * s]) + 'L' + pt([x + sg * 8 * s, wy + 6 * s]) + 'Z';
      out += body(c, d, wc, F('M' + pt([x + sg * 22 * s, wy - 16 * s]) + 'L' + pt([x + sg * 38 * s, wy - 16 * s]) + 'L' + pt([x + sg * 38 * s, wy + 10 * s]) + 'L' + pt([x + sg * 22 * s, wy + 10 * s]) + 'Z', tip, 0.95) + L('M' + pt([x + sg * 6 * s, wy + 1 * s]) + 'Q' + pt([x + sg * 16 * s, wy - 4 * s]) + ' ' + pt([x + sg * 28 * s, wy - 8 * s]), lt(wc, 0.3), 1 * s), 1.6 * s);
    });
    // bird head with beak (faces left)
    out += body(c, 'M' + pt([x - 6 * s, wy + 4 * s]) + 'C' + pt([x - 8 * s, wy - 6 * s]) + ' ' + pt([x + 6 * s, wy - 10 * s]) + ' ' + pt([x + 7 * s, wy]) + 'L' + pt([x + 6 * s, wy + 6 * s]) + 'Z', o.headCol || PAINT_Y, '', 1.6 * s);
    out += P('M' + pt([x - 6 * s, wy - 2 * s]) + 'L' + pt([x - 14 * s, wy + 1 * s]) + 'L' + pt([x - 6 * s, wy + 3 * s]) + 'Z', c.cel('#f4ecd6'), 1.2 * s) + C(x - 1 * s, wy - 2 * s, 1.2 * s, OL);
    if (o.feathers !== false) out += L('M' + pt([x - 8 * s, top + 20 * s]) + 'L' + pt([x - 10 * s, top + 32 * s]), OL, 2.4 * s) + P('M' + pt([x - 10 * s, top + 30 * s]) + 'L' + pt([x - 13 * s, top + 40 * s]) + 'L' + pt([x - 8 * s, top + 38 * s]) + 'Z', '#f4f0e0', 1 * s);
    return out;
  }
  // wind-rider roost (shared copy of art_barrens.js perch)
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
  // voodoo totem (shared copy of art_durotar.js)
  function voodooTotem(c, x, y, s) {
    var o = '';
    o += E(x, y + 1, 12 * s, 3 * s, '#000', 0, 0.22);
    o += body(c, 'M' + pt([x - 6 * s, y]) + 'L' + pt([x - 5 * s, y - 50 * s]) + 'L' + pt([x + 5 * s, y - 50 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#7a5a3a', F('M' + pt([x + 1 * s, y - 52 * s]) + 'L' + pt([x + 8 * s, y - 52 * s]) + 'L' + pt([x + 8 * s, y]) + 'L' + pt([x + 2 * s, y]) + 'Z', '#4a3420', 0.7), 1.8 * s);
    o += L('M' + pt([x - 6 * s, y - 20 * s]) + 'L' + pt([x + 6 * s, y - 20 * s]) + 'M' + pt([x - 6 * s, y - 30 * s]) + 'L' + pt([x + 6 * s, y - 30 * s]), '#c83a2a', 2.2 * s);
    // mask
    var m = 'M' + pt([x - 12 * s, y - 64 * s]) + 'C' + pt([x - 12 * s, y - 76 * s]) + ' ' + pt([x + 12 * s, y - 76 * s]) + ' ' + pt([x + 12 * s, y - 64 * s]) + 'L' + pt([x + 10 * s, y - 50 * s]) + 'L' + pt([x, y - 44 * s]) + 'L' + pt([x - 10 * s, y - 50 * s]) + 'Z';
    o += body(c, m, '#b8864a', F('M' + pt([x + 2 * s, y - 76 * s]) + 'L' + pt([x + 14 * s, y - 76 * s]) + 'L' + pt([x + 14 * s, y - 44 * s]) + 'L' + pt([x + 2 * s, y - 44 * s]) + 'Z', '#7a5430', 0.6), 1.8 * s);
    o += P('M' + pt([x - 8 * s, y - 64 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]) + 'L' + pt([x - 7 * s, y - 59 * s]) + 'Z', '#1a1009', 0) + P('M' + pt([x + 8 * s, y - 64 * s]) + 'L' + pt([x + 2 * s, y - 62 * s]) + 'L' + pt([x + 7 * s, y - 59 * s]) + 'Z', '#1a1009', 0);
    o += C(x - 5 * s, y - 62 * s, 1.2 * s, '#7cff7a') + C(x + 5 * s, y - 62 * s, 1.2 * s, '#7cff7a');
    o += P('M' + pt([x - 6 * s, y - 53 * s]) + 'L' + pt([x + 6 * s, y - 53 * s]) + 'L' + pt([x + 4 * s, y - 49 * s]) + 'L' + pt([x - 4 * s, y - 49 * s]) + 'Z', '#f0e6cc', 1.2 * s);
    o += L('M' + pt([x - 10 * s, y - 68 * s]) + 'L' + pt([x - 4 * s, y - 66 * s]) + 'M' + pt([x + 10 * s, y - 68 * s]) + 'L' + pt([x + 4 * s, y - 66 * s]), '#2f8aa8', 2 * s);
    // feathers
    [[-10, '#d83a2a'], [0, '#f0c040'], [10, '#2f9ab8']].forEach(function (f) {
      var fx = x + f[0] * s;
      o += P('M' + pt([fx, y - 72 * s]) + 'Q' + pt([fx + f[0] * 0.5 * s - 4 * s, y - 86 * s]) + ' ' + pt([fx + f[0] * 0.4 * s, y - 96 * s]) + 'Q' + pt([fx + f[0] * 0.5 * s + 5 * s, y - 84 * s]) + ' ' + pt([fx + 2 * s, y - 72 * s]) + 'Z', f[1], 1.4 * s);
    });
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
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // ---- spider web (shared copy of art_tirisfal.js; adds `w`, a strand-width multiplier) ----
  function web(cx, cy, r, a0, a1, spokes, rings, col, op, w) {
    col = col || '#dcdcd4'; w = w || 1;
    var d = '', i, k, pts = [];
    for (i = 0; i <= spokes; i++) { var a = a0 + (a1 - a0) * i / spokes; pts.push([Math.cos(a), Math.sin(a)]); d += 'M' + pt([cx, cy]) + 'L' + pt([cx + pts[i][0] * r, cy + pts[i][1] * r]); }
    for (k = 1; k <= rings; k++) {
      var rr = r * k / (rings + 0.3);
      d += 'M' + pt([cx + pts[0][0] * rr, cy + pts[0][1] * rr]);
      for (i = 1; i < pts.length; i++) {
        var ma = a0 + (a1 - a0) * (i - 0.5) / spokes, sag = rr * 0.86;
        d += 'Q' + pt([cx + Math.cos(ma) * sag, cy + Math.sin(ma) * sag]) + ' ' + pt([cx + pts[i][0] * rr, cy + pts[i][1] * rr]);
      }
    }
    return L(d, '#000', 2.4 * w, 0.25) + L(d, col, w, op == null ? 0.75 : op);
  }
  // ---- mist band + bone necklace (shared copies of art_barrens.js) ----
  function mist(c, y, h, col, op, seed) {
    var o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]])), r = rng(seed || 9);
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.5, 40 + r() * 40, 3 + r() * 3, col, 0, op * 0.8);
    return o;
  }
  function boneNeck(x, y) { var s = L('M' + (x - 12) + ',' + y + ' Q' + x + ',' + (y + 10) + ' ' + (x + 12) + ',' + y, '#3a2a1a', 1.2); for (var i = -2; i <= 2; i++) s += P('M' + n(x + i * 4.4 - 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4) + ',' + n(y + 10 - Math.abs(i) * 1.4) + ' L' + n(x + i * 4.4 + 1.3) + ',' + n(y + 4 - Math.abs(i) * 1.4) + ' Z', '#f4ecd6', 1); return s; }

  // ============================================================
  //  STONETALON PIECES
  // ============================================================
  var GRAN = '#8a8298', GRAND = '#5e5870', PINE = '#2e5a3a', PINED = '#1f4030', MOSS = '#6a7a44', BARK = '#8a4a32', ASH = '#2e2a2c', EMBER = '#ff7a2a', HAZ = '#1e1a16';
  function stSky(c, top, mid, bot) { return sky(c, top || '#6a94c2', mid || '#afc6dc', bot || '#e2e0da'); }
  function gEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.75)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function drop(x, y, r, col) { return P('M' + pt([x, y - 2.2 * r]) + 'C' + pt([x + r, y - 0.6 * r]) + ' ' + pt([x + r, y + r]) + ' ' + pt([x, y + r]) + 'C' + pt([x - r, y + r]) + ' ' + pt([x - r, y - 0.6 * r]) + ' ' + pt([x, y - 2.2 * r]) + 'Z', col, 1); }
  // jagged granite range, no outline: lit face, shadow face, optional snow caps
  function peaks(c, seed, base, hMin, hMax, col, snow, wMin, wMax) {
    var r = rng(seed), x = -40, o = '';
    wMin = wMin || 40; wMax = wMax || 70;
    while (x < 440) {
      var w = wMin + r() * (wMax - wMin), h = hMin + r() * (hMax - hMin), px = x + w * (0.4 + r() * 0.2), top = base - h;
      o += F(pd([[x - w * 0.25, base + 2], [px - w * 0.36, top + h * 0.46], [px - w * 0.2, top + h * 0.32], [px - w * 0.1, top + h * 0.12], [px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.3, top + h * 0.36], [px + w * 0.42, top + h * 0.56], [x + w * 1.25, base + 2]], true), col);
      o += F(pd([[px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.3, top + h * 0.36], [px + w * 0.42, top + h * 0.56], [x + w * 1.25, base + 2], [px + w * 0.14, base + 2], [px + w * 0.06, top + h * 0.55], [px + w * 0.1, top + h * 0.3]], true), dk(col, 0.2), 0.9);
      o += L('M' + pt([px - w * 0.2, top + h * 0.32]) + 'L' + pt([px - w * 0.26, top + h * 0.7]) + 'M' + pt([px - w * 0.04, top + h * 0.2]) + 'L' + pt([px - w * 0.1, top + h * 0.6]), dk(col, 0.12), 1.2, 0.6);
      if (snow) o += F(pd([[px - w * 0.14, top + h * 0.16], [px - w * 0.1, top + h * 0.12], [px, top], [px + w * 0.16, top + h * 0.24], [px + w * 0.1, top + h * 0.28], [px + w * 0.03, top + h * 0.2], [px - w * 0.04, top + h * 0.28], [px - w * 0.08, top + h * 0.22]], true), snow);
      x += w * (0.7 + r() * 0.3);
    }
    return o;
  }
  // silhouette row of conifers, no outline
  function farPines(seed, y, col, cnt, h0, h1, x0, x1) {
    var r = rng(seed), d = '';
    x0 = x0 == null ? -10 : x0; x1 = x1 == null ? 410 : x1;
    for (var i = 0; i < cnt; i++) {
      var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, h = h0 + r() * (h1 - h0), w = h * 0.3;
      d += 'M' + pt([x - w, y + 2]) + 'L' + pt([x - w * 0.45, y - h * 0.34]) + 'L' + pt([x - w * 0.72, y - h * 0.34]) + 'L' + pt([x - w * 0.28, y - h * 0.68]) + 'L' + pt([x - w * 0.48, y - h * 0.68]) + 'L' + pt([x, y - h]) +
        'L' + pt([x + w * 0.48, y - h * 0.68]) + 'L' + pt([x + w * 0.28, y - h * 0.68]) + 'L' + pt([x + w * 0.72, y - h * 0.34]) + 'L' + pt([x + w * 0.45, y - h * 0.34]) + 'L' + pt([x + w, y + 2]) + 'Z';
    }
    return F(d, col) + R(x0, y, x1 - x0, 5, col);
  }
  // outlined layered conifer
  function pine(c, x, y, s, col) {
    col = col || PINE;
    var o = E(x, y + 1, 16 * s, 3.4 * s, '#000', 0, 0.24);
    o += R(x - 3 * s, y - 16 * s, 6 * s, 16 * s, c.cel('#6a4028'), 1.4 * s);
    var tiers = [[0, 24, 26], [16, 20, 24], [30, 15, 22], [42, 10, 20]], by0 = y - 12 * s;
    tiers.forEach(function (t, i) {
      var by = by0 - t[0] * s, hw = t[1] * s, th = t[2] * s, ax = x, ay = by - th;
      var d = 'M' + pt([x - hw, by]) + 'L' + pt([ax, ay]) + 'L' + pt([x + hw, by]) + 'L' + pt([x + hw * 0.5, by - 2.5 * s]) + 'L' + pt([x, by + 1 * s]) + 'L' + pt([x - hw * 0.5, by - 2.5 * s]) + 'Z';
      o += body(c, d, i % 2 ? lt(col, 0.05) : col, F(pd([[ax + 1 * s, ay - 2], [x + hw + 3, by - 2], [x + hw + 3, by + 4 * s], [x + 1 * s, by + 4 * s]], true), dk(col, 0.32), 0.85) +
        L('M' + pt([x - hw * 0.62, by - 3 * s]) + 'L' + pt([x - hw * 0.2, ay + th * 0.4]), lt(col, 0.22), 1.1 * s, 0.7), 1.6 * s);
    });
    return o;
  }
  // tall redwood trunk running up out of frame
  function redwood(c, x, y, s, top) {
    top = top == null ? -10 : top;
    var w0 = 14 * s, w1 = 9 * s, o = E(x, y + 2, 28 * s, 5 * s, '#000', 0, 0.28), r = rng(Math.round(x * 13 + y));
    var d = 'M' + pt([x - w0 - 9 * s, y]) + 'Q' + pt([x - w0, y - 5 * s]) + ' ' + pt([x - w0 + 1, y - 24 * s]) + 'L' + pt([x - w1, top]) + 'L' + pt([x + w1, top]) + 'L' + pt([x + w0 - 1, y - 24 * s]) + 'Q' + pt([x + w0, y - 5 * s]) + ' ' + pt([x + w0 + 9 * s, y]) + 'Z';
    var bark = '';
    for (var i = 0; i < 5; i++) { var bx = x + (i - 2) * w0 * 0.34 + (r() - 0.5) * 2 * s, tx = x + (i - 2) * w1 * 0.34; bark += 'M' + pt([bx, y - 3 * s]) + 'Q' + pt([(bx + tx) / 2 + (r() - 0.5) * 5 * s, (y + top) / 2]) + ' ' + pt([tx, top]); }
    o += body(c, d, BARK, L(bark, dk(BARK, 0.35), 1.4 * s) + F(pd([[x + w1 * 0.25, top - 2], [x + w0 + 12 * s, top - 2], [x + w0 + 12 * s, y + 2], [x + w0 * 0.3, y + 2]], true), dk(BARK, 0.32), 0.85) +
      L('M' + pt([x - w0 * 0.55, y - 10 * s]) + 'L' + pt([x - w1 * 0.55, top]), lt(BARK, 0.25), 2.2 * s, 0.6), 2 * s);
    return o;
  }
  // foliage clump for canopies
  function canopy(c, x, y, s, col) {
    col = col || PINED;
    var d = 'M' + pt([x - 30 * s, y]) + 'C' + pt([x - 42 * s, y - 8 * s]) + ' ' + pt([x - 32 * s, y - 24 * s]) + ' ' + pt([x - 16 * s, y - 18 * s]) + 'C' + pt([x - 12 * s, y - 32 * s]) + ' ' + pt([x + 10 * s, y - 34 * s]) + ' ' + pt([x + 14 * s, y - 18 * s]) +
      'C' + pt([x + 30 * s, y - 26 * s]) + ' ' + pt([x + 44 * s, y - 8 * s]) + ' ' + pt([x + 30 * s, y]) + 'C' + pt([x + 18 * s, y + 9 * s]) + ' ' + pt([x - 18 * s, y + 9 * s]) + ' ' + pt([x - 30 * s, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x - 36 * s, y - 2 * s]) + 'C' + pt([x - 14 * s, y + 2 * s]) + ' ' + pt([x + 14 * s, y + 2 * s]) + ' ' + pt([x + 38 * s, y - 5 * s]) + 'L' + pt([x + 44 * s, y + 12 * s]) + 'L' + pt([x - 44 * s, y + 12 * s]) + 'Z', dk(col, 0.3), 0.85) +
      E(x - 12 * s, y - 20 * s, 9 * s, 4 * s, lt(col, 0.18), 0, 0.7) + E(x + 18 * s, y - 14 * s, 6 * s, 3 * s, lt(col, 0.14), 0, 0.6), 1.8 * s);
  }
  // outlined granite spire / cliff
  function crag(c, x, y, w, h, col, seed) {
    col = col || GRAN;
    var r = rng(seed || Math.round(x * 7 + h)), top = y - h;
    var d = pd([[x - w * 0.5, y], [x - w * 0.44, y - h * 0.42], [x - w * 0.32, y - h * 0.6], [x - w * 0.28, y - h * 0.88], [x - w * 0.1, top], [x + w * 0.12, top + h * 0.04], [x + w * 0.26, y - h * 0.8], [x + w * 0.36, y - h * 0.52], [x + w * 0.44, y - h * 0.3], [x + w * 0.5, y]], true);
    var cr = '';
    for (var i = 0; i < 4; i++) { var cx = x + (r() - 0.5) * w * 0.6, cy = y - h * (0.2 + r() * 0.6); cr += 'M' + pt([cx, cy]) + 'L' + pt([cx + (r() - 0.5) * 6, cy + h * 0.12]) + 'L' + pt([cx + (r() - 0.5) * 8, cy + h * 0.22]); }
    var sh = F(pd([[x + w * 0.0, top - 2], [x + w * 0.12, top + h * 0.04], [x + w * 0.26, y - h * 0.8], [x + w * 0.36, y - h * 0.52], [x + w * 0.44, y - h * 0.3], [x + w * 0.56, y + 2], [x + w * 0.1, y + 2], [x + w * 0.14, y - h * 0.5], [x + w * 0.04, y - h * 0.8]], true), dk(col, 0.28), 0.9) +
      F(pd([[x - w * 0.28, y - h * 0.88], [x - w * 0.1, top], [x - w * 0.06, y - h * 0.7], [x - w * 0.22, y - h * 0.56]], true), lt(col, 0.22), 0.8) +
      L('M' + pt([x - w * 0.44, y - h * 0.42]) + 'L' + pt([x + w * 0.4, y - h * 0.4]) + 'M' + pt([x - w * 0.36, y - h * 0.2]) + 'L' + pt([x + w * 0.46, y - h * 0.18]), dk(col, 0.16), 1.2, 0.6) + L(cr, dk(col, 0.42), 1.2);
    return body(c, d, col, sh, 2);
  }
  function stump(c, x, y, s, col) {
    col = col || '#7a5034';
    var w = 11 * s, h = 9 * s, o = E(x, y + 1, w + 6 * s, 3 * s, '#000', 0, 0.25);
    var d = 'M' + pt([x - w - 4 * s, y]) + 'Q' + pt([x - w, y - 2 * s]) + ' ' + pt([x - w, y - h]) + 'L' + pt([x + w, y - h]) + 'Q' + pt([x + w, y - 2 * s]) + ' ' + pt([x + w + 4 * s, y]) + 'Z';
    o += body(c, d, col, F(pd([[x + w * 0.3, y - h - 2], [x + w + 5 * s, y - h - 2], [x + w + 5 * s, y + 2], [x + w * 0.4, y + 2]], true), dk(col, 0.3), 0.8) + L('M' + pt([x - w * 0.5, y - 1]) + 'L' + pt([x - w * 0.5, y - h]) + 'M' + pt([x + w * 0.1, y]) + 'L' + pt([x + w * 0.1, y - h]), dk(col, 0.3), 1 * s), 1.6 * s);
    o += E(x, y - h, w, 3.4 * s, c.cel('#e0c08a'), 1.6 * s) + L(ellD(x, y - h, w * 0.6, 2 * s) + ellD(x, y - h, w * 0.26, 0.9 * s), '#b08a58', 0.9 * s);
    return o;
  }
  // a single felled log lying across the ground, cut end toward the viewer on the left
  function log(c, x, y, len, r, col) {
    col = col || '#7a4a2e';
    var d = 'M' + pt([x, y - 2 * r]) + 'L' + pt([x + len, y - 2 * r]) + 'Q' + pt([x + len + r * 0.8, y - r]) + ' ' + pt([x + len, y]) + 'L' + pt([x, y]) + 'Z';
    var o = E(x + len / 2, y + 1, len / 2 + 5, 2.6, '#000', 0, 0.22);
    o += body(c, d, col, L('M' + pt([x + len * 0.2, y - r * 1.5]) + 'L' + pt([x + len * 0.6, y - r * 1.5]) + 'M' + pt([x + len * 0.35, y - r * 0.8]) + 'L' + pt([x + len * 0.9, y - r * 0.8]), dk(col, 0.35), 1) + F(pd([[x, y - r * 0.7], [x + len + r, y - r * 0.7], [x + len + r, y + 2], [x, y + 2]], true), dk(col, 0.3), 0.8), 1.6);
    return o + E(x, y - r, r * 0.55, r, c.cel('#e0c08a'), 1.6) + L(ellD(x, y - r, r * 0.3, r * 0.6), '#b08a58', 0.9);
  }
  // stacked logs, cut ends toward the viewer
  function logPile(c, x, y, s) {
    var r = 6 * s, o = E(x + 4 * s, y + 1, 30 * s, 4 * s, '#000', 0, 0.25);
    o += body(c, pd([[x - 3 * r, y], [x - 3 * r + 6 * s, y - 5.4 * r - 3 * s], [x + 3 * r + 12 * s, y - 5.4 * r - 3 * s], [x + 3 * r + 12 * s, y - 3 * s], [x + 3 * r, y]], true), '#6e4228', L('M' + pt([x - 2 * r, y - 3.2 * r]) + 'L' + pt([x + 3 * r + 10 * s, y - 3.4 * r]), dk('#6e4228', 0.35), 1.2 * s), 1.6 * s);
    [[-2, 0], [0, 0], [2, 0], [-1, 1], [1, 1], [0, 2]].forEach(function (q) {
      var cx = x + q[0] * r * 1.02, cy = y - r - q[1] * r * 1.72;
      o += C(cx, cy, r, c.cel('#e0c08a'), 1.6 * s) + L(ellD(cx, cy, r * 0.62, r * 0.62) + ellD(cx, cy, r * 0.26, r * 0.26), '#a8804e', 0.9 * s);
    });
    return o;
  }
  // toothed saw disc (rot in radians)
  function sawBlade(c, x, y, r, rot, col) {
    col = col || '#c8ccd0'; rot = rot || 0;
    var d = '', k = 14;
    for (var i = 0; i < k; i++) {
      var a0 = rot + Math.PI * 2 * i / k, a1 = rot + Math.PI * 2 * (i + 0.7) / k, a2 = rot + Math.PI * 2 * (i + 1) / k;
      d += (i ? 'L' : 'M') + pt([x + Math.cos(a0) * r * 0.82, y + Math.sin(a0) * r * 0.82]) + 'L' + pt([x + Math.cos(a1) * r, y + Math.sin(a1) * r]) + 'L' + pt([x + Math.cos(a2) * r * 0.82, y + Math.sin(a2) * r * 0.82]);
    }
    return P(d + 'Z', c.rg([[0, lt(col, 0.45)], [0.6, col], [1, dk(col, 0.3)]]), 1.6) + L(ellD(x, y, r * 0.6, r * 0.6), dk(col, 0.3), 1.1) +
      L('M' + pt([x - r * 0.55, y - r * 0.2]) + 'A' + n(r * 0.58) + ',' + n(r * 0.58) + ' 0 0 1 ' + pt([x + r * 0.1, y - r * 0.56]), '#ffffff', 1.2, 0.7) +
      C(x, y, r * 0.24, c.cel(IRON), 1.4) + C(x, y, r * 0.08, OL);
  }
  // black/yellow hazard band
  function hazard(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true), st = '';
    for (var k = -h; k < w; k += h * 1.3) st += pd([[x + k, y + h], [x + k + h, y], [x + k + h * 1.65, y], [x + k + h * 0.65, y + h]], true);
    return P(d, '#e0b030', 0) + '<g clip-path="url(#' + c.clip(d) + ')">' + F(st, HAZ) + '</g>' + P(d, 'none', 1.4);
  }
  // rising smoke column
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }
  // goblin steam saw: boiler, stack, gauge, big blade, hazard skirt
  function machine(c, x, y, s) {
    var col = '#c8962e', o = E(x, y + 1, 36 * s, 5 * s, '#000', 0, 0.3);
    o += smoke(x + 14 * s, y - 64 * s, s, '#5e5c5a', 0.8);
    o += R(x + 10 * s, y - 62 * s, 8 * s, 30 * s, c.cel(IRON), 1.6 * s) + R(x + 8 * s, y - 66 * s, 12 * s, 5 * s, c.cel(dk(IRON, 0.2)), 1.4 * s);
    o += sawBlade(c, x - 30 * s, y - 24 * s, 17 * s, 0.2);
    var d = 'M' + pt([x - 26 * s, y - 8 * s]) + 'L' + pt([x - 26 * s, y - 34 * s]) + 'Q' + pt([x - 26 * s, y - 42 * s]) + ' ' + pt([x - 16 * s, y - 42 * s]) + 'L' + pt([x + 18 * s, y - 42 * s]) + 'Q' + pt([x + 28 * s, y - 42 * s]) + ' ' + pt([x + 28 * s, y - 34 * s]) + 'L' + pt([x + 28 * s, y - 8 * s]) + 'Z';
    var rv = '';
    for (var i = 0; i < 6; i++) rv += C(x - 22 * s + i * 9 * s, y - 38 * s, 1.1 * s, '#f0d890');
    o += body(c, d, col, L('M' + pt([x - 14 * s, y - 44 * s]) + 'L' + pt([x - 14 * s, y - 6 * s]) + 'M' + pt([x + 6 * s, y - 44 * s]) + 'L' + pt([x + 6 * s, y - 6 * s]), dk(IRON, 0.1), 2.6 * s) +
      F(pd([[x + 12 * s, y - 44 * s], [x + 30 * s, y - 44 * s], [x + 30 * s, y - 6 * s], [x + 12 * s, y - 6 * s]], true), dk(col, 0.3), 0.8) + E(x - 20 * s, y - 16 * s, 5 * s, 3 * s, RUST, 0, 0.75) + E(x + 18 * s, y - 28 * s, 4 * s, 6 * s, RUST, 0, 0.6) + rv, 1.8 * s);
    o += C(x - 4 * s, y - 28 * s, 5.4 * s, c.cel('#e8e0c8'), 1.4 * s) + L('M' + pt([x - 4 * s, y - 28 * s]) + 'l' + n(3 * s) + ',' + n(-3 * s), '#c83a2a', 1.2 * s);
    o += hazard(c, x - 28 * s, y - 12 * s, 58 * s, 7 * s);
    o += C(x - 16 * s, y - 4 * s, 6 * s, c.cel('#4a4640'), 1.6 * s) + C(x + 16 * s, y - 4 * s, 6 * s, c.cel('#4a4640'), 1.6 * s) + C(x - 16 * s, y - 4 * s, 1.6 * s, '#c8c4bc') + C(x + 16 * s, y - 4 * s, 1.6 * s, '#c8c4bc');
    return o;
  }
  // goblin dam: plank wall, iron posts, walkway, two sluices spilling into the lake
  function dam(c, x0, x1, top, bot) {
    var w = x1 - x0, o = '', d = pd([[x0, bot], [x0 + 5, top], [x1 - 5, top], [x1, bot]], true), planks = '';
    for (var yy = top + 6; yy < bot; yy += 6) planks += 'M' + pt([x0, yy]) + 'L' + pt([x1, yy]);
    o += body(c, d, '#8a6a42', L(planks, '#5a4028', 1.2) + F(pd([[x0 + w * 0.7, top - 2], [x1 + 2, top - 2], [x1 + 2, bot + 2], [x0 + w * 0.72, bot + 2]], true), dk('#8a6a42', 0.3), 0.8) +
      E(x0 + w * 0.2, top + 16, 8, 4, RUST, 0, 0.6) + E(x0 + w * 0.62, bot - 8, 10, 3, '#3a5a3a', 0, 0.5), 2);
    for (var xx = x0 + 12; xx < x1 - 4; xx += 22) o += R(xx - 3, top - 4, 6, bot - top + 4, c.cel(IRON), 1.4) + C(xx, top + 4, 1.2, '#c8c4bc') + C(xx, bot - 6, 1.2, '#c8c4bc');
    o += R(x0 + 2, top - 7, w - 4, 6, c.cel('#6a6660'), 1.6) + L('M' + pt([x0 + 4, top - 16]) + 'L' + pt([x1 - 4, top - 16]), OL, 3) + L('M' + pt([x0 + 4, top - 16]) + 'L' + pt([x1 - 4, top - 16]), '#8a8680', 1.4);
    for (var rx = x0 + 8; rx < x1; rx += 16) o += L('M' + pt([rx, top - 7]) + 'L' + pt([rx, top - 16]), OL, 2.4) + L('M' + pt([rx, top - 7]) + 'L' + pt([rx, top - 16]), '#8a8680', 1);
    [x0 + w * 0.3, x0 + w * 0.72].forEach(function (sx) {
      o += F('M' + pt([sx - 5, top + 16]) + 'C' + pt([sx - 6, top + 30]) + ' ' + pt([sx - 7, bot - 4]) + ' ' + pt([sx - 9, bot + 4]) + 'L' + pt([sx + 9, bot + 4]) + 'C' + pt([sx + 7, bot - 4]) + ' ' + pt([sx + 6, top + 30]) + ' ' + pt([sx + 5, top + 16]) + 'Z', c.lg([[0, '#f0faff'], [1, '#8ac4e8']]), 0.92);
      o += L('M' + pt([sx - 2, top + 20]) + 'L' + pt([sx - 3, bot - 2]) + 'M' + pt([sx + 3, top + 22]) + 'L' + pt([sx + 3, bot]), '#ffffff', 1, 0.7);
      o += R(sx - 7, top + 8, 14, 9, c.cel(IRON), 1.4) + E(sx, top + 14, 4.4, 2.6, '#16161c');
      o += E(sx, bot + 4, 14, 3.4, '#ffffff', 0, 0.85) + C(sx - 9, bot + 1, 3, '#ffffff', 0, 0.8) + C(sx + 9, bot + 2, 3.4, '#ffffff', 0, 0.8);
    });
    return o;
  }
  // big round sun-rock with carved rings and rock-spike rays
  function sunRock(c, x, y, r) {
    var o = C(x, y, r * 2.6, glow(c, '#ffe0a0', 0.4)), st = '#d8945a';
    for (var i = 0; i < 11; i++) {
      var a = Math.PI * (0.96 + 1.08 * i / 10), a1 = a - 0.1, a2 = a + 0.1, L0 = r * (i % 2 ? 1.36 : 1.56);
      o += P(pd([[x + Math.cos(a1) * r * 0.9, y + Math.sin(a1) * r * 0.9], [x + Math.cos(a) * L0, y + Math.sin(a) * L0], [x + Math.cos(a2) * r * 0.9, y + Math.sin(a2) * r * 0.9]], true), c.cel(i % 2 ? '#b86c42' : '#c87a4a'), 1.8);
    }
    var d = ellD(x, y, r, r);
    o += body(c, d, st, F('M' + pt([x + r * 0.2, y - r * 1.1]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x + r * 0.2, y + r * 1.1]) + 'L' + pt([x + r * 1.2, y + r * 1.1]) + 'L' + pt([x + r * 1.2, y - r * 1.1]) + 'Z', dk(st, 0.25), 0.85) +
      L(ellD(x, y, r * 0.7, r * 0.7), dk(st, 0.35), 2.4) + L(ellD(x, y, r * 0.34, r * 0.34), dk(st, 0.35), 2) + C(x, y, r * 0.2, '#f0b870') +
      L('M' + pt([x - r * 0.9, y - r * 0.1]) + 'L' + pt([x - r * 0.5, y + r * 0.05]) + 'L' + pt([x - r * 0.62, y + r * 0.4]) + 'M' + pt([x + r * 0.3, y - r * 0.9]) + 'L' + pt([x + r * 0.18, y - r * 0.56]), dk(st, 0.4), 1.3) +
      E(x - r * 0.4, y - r * 0.5, r * 0.26, r * 0.12, lt(st, 0.3), 0, 0.7), 2.4);
    return o;
  }
  // Kessari hut: round mud wall, tall ragged thatch cone, tusks either side of the door
  function trollHut(c, x, y, s, thatch) {
    thatch = thatch || '#c8a060';
    var wall = '#9a7048', o = E(x, y + 1, 32 * s, 5 * s, '#000', 0, 0.22), i;
    var wl = '';
    for (i = -2; i <= 2; i++) wl += 'M' + pt([x + i * 8 * s, y]) + 'L' + pt([x + i * 7.6 * s, y - 18 * s]);
    o += body(c, pd([[x - 23 * s, y], [x - 21 * s, y - 20 * s], [x + 21 * s, y - 20 * s], [x + 23 * s, y]], true), wall, L(wl, dk(wall, 0.3), 1.1 * s) + F(pd([[x + 8 * s, y - 22 * s], [x + 25 * s, y - 22 * s], [x + 25 * s, y + 2], [x + 9 * s, y + 2]], true), dk(wall, 0.3), 0.8), 1.8 * s);
    var bot = '', k = 9;
    for (i = 0; i <= k; i++) { var bx = x + 32 * s - 64 * s * i / k; bot += 'L' + pt([bx, y - 16 * s + (i % 2 ? 4 : 0) * s]); }
    var roof = 'M' + pt([x - 2 * s, y - 66 * s]) + 'L' + pt([x + 2 * s, y - 66 * s]) + 'L' + pt([x + 32 * s, y - 16 * s]) + bot + 'Z';
    var straw = '';
    for (i = -3; i <= 3; i++) straw += 'M' + pt([x + i * 1.2 * s, y - 60 * s]) + 'L' + pt([x + i * 9 * s, y - 18 * s]);
    o += body(c, roof, thatch, L(straw, dk(thatch, 0.3), 1.1 * s) + F(pd([[x + 1 * s, y - 68 * s], [x + 36 * s, y - 12 * s], [x + 8 * s, y - 12 * s]], true), dk(thatch, 0.28), 0.8) +
      L('M' + pt([x - 18 * s, y - 38 * s]) + 'L' + pt([x + 18 * s, y - 38 * s]), '#6a3a2a', 2.2 * s) + L('M' + pt([x - 12 * s, y - 50 * s]) + 'L' + pt([x + 12 * s, y - 50 * s]), '#2f7a8a', 1.8 * s), 2 * s);
    o += L('M' + pt([x, y - 66 * s]) + 'L' + pt([x + 1 * s, y - 78 * s]), OL, 3.4 * s) + L('M' + pt([x, y - 66 * s]) + 'L' + pt([x + 1 * s, y - 78 * s]), '#8a6a42', 1.6 * s);
    o += P('M' + pt([x - 7 * s, y + 1]) + 'L' + pt([x - 7 * s, y - 10 * s]) + 'Q' + pt([x, y - 17 * s]) + ' ' + pt([x + 7 * s, y - 10 * s]) + 'L' + pt([x + 7 * s, y + 1]) + 'Z', '#2a1a10', 1.4 * s);
    [-1, 1].forEach(function (sg) {
      o += P('M' + pt([x + sg * 10 * s, y + 1]) + 'C' + pt([x + sg * 14 * s, y - 8 * s]) + ' ' + pt([x + sg * 12 * s, y - 18 * s]) + ' ' + pt([x + sg * 4 * s, y - 24 * s]) + 'C' + pt([x + sg * 9 * s, y - 16 * s]) + ' ' + pt([x + sg * 10 * s, y - 8 * s]) + ' ' + pt([x + sg * 7 * s, y + 1]) + 'Z', c.cel('#f0e6cc'), 1.4 * s);
    });
    return o;
  }
  // gateway of two giant curved tusks with a lashed crossbar and a skull charm
  function tuskArch(c, x, y, s) {
    var o = E(x, y + 1, 32 * s, 4 * s, '#000', 0, 0.2);
    [-1, 1].forEach(function (sg) {
      var d = 'M' + pt([x + sg * 26 * s, y]) + 'C' + pt([x + sg * 32 * s, y - 26 * s]) + ' ' + pt([x + sg * 24 * s, y - 52 * s]) + ' ' + pt([x + sg * 4 * s, y - 64 * s]) + 'C' + pt([x + sg * 16 * s, y - 50 * s]) + ' ' + pt([x + sg * 21 * s, y - 26 * s]) + ' ' + pt([x + sg * 17 * s, y]) + 'Z';
      o += body(c, d, '#efe4c8', L('M' + pt([x + sg * 28 * s, y - 12 * s]) + 'L' + pt([x + sg * 19 * s, y - 12 * s]) + 'M' + pt([x + sg * 28 * s, y - 30 * s]) + 'L' + pt([x + sg * 20 * s, y - 28 * s]), '#b8a888', 1.2 * s) +
        L('M' + pt([x + sg * 22 * s, y - 4 * s]) + 'C' + pt([x + sg * 25 * s, y - 26 * s]) + ' ' + pt([x + sg * 20 * s, y - 46 * s]) + ' ' + pt([x + sg * 8 * s, y - 58 * s]), '#ffffff', 1.4 * s, 0.6), 1.8 * s);
      o += L('M' + pt([x + sg * 27 * s, y - 20 * s]) + 'L' + pt([x + sg * 20 * s, y - 20 * s]), '#8a2a1a', 2.6 * s);
    });
    o += limb('M' + pt([x - 22 * s, y - 44 * s]) + 'L' + pt([x + 22 * s, y - 44 * s]), '#6a4424', 2.4 * s);
    o += L('M' + pt([x, y - 44 * s]) + 'L' + pt([x, y - 38 * s]), '#3a2a1a', 1 * s) + skull(c, x, y - 34 * s, 0.8 * s) + feathers(x - 12 * s, y - 42 * s, ['#d83a2a', '#2f9ab8'], 0.6 * s, 0) + feathers(x + 12 * s, y - 42 * s, ['#f0c040', '#d83a2a'], 0.6 * s, -0.3);
    return o;
  }
  // web-wrapped egg sack, optionally hanging from a strand
  function eggSack(c, x, y, s, hang) {
    var o = '';
    if (hang) o += L('M' + pt([x, y - 11 * s - hang]) + 'L' + pt([x, y - 11 * s]), '#000', 2.4, 0.25) + L('M' + pt([x, y - 11 * s - hang]) + 'L' + pt([x, y - 11 * s]), '#ecece4', 1.2, 0.9);
    var d = 'M' + pt([x, y - 12 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 11 * s, y + 6 * s]) + ' ' + pt([x, y + 9 * s]) + 'C' + pt([x - 11 * s, y + 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x, y - 12 * s]) + 'Z';
    o += C(x, y, 18 * s, glow(c, '#c0f080', 0.3));
    o += body(c, d, '#e0dcc8', E(x + 2 * s, y + 1 * s, 5 * s, 6 * s, '#a8d070', 0, 0.45) + L('M' + pt([x - 8 * s, y - 6 * s]) + 'Q' + pt([x, y - 1 * s]) + ' ' + pt([x + 8 * s, y - 8 * s]) + 'M' + pt([x - 9 * s, y + 1 * s]) + 'Q' + pt([x, y + 5 * s]) + ' ' + pt([x + 10 * s, y - 1 * s]) + 'M' + pt([x - 6 * s, y + 7 * s]) + 'Q' + pt([x + 2 * s, y + 2 * s]) + ' ' + pt([x + 7 * s, y + 6 * s]), '#a8a490', 1 * s) +
      F(pd([[x + 3 * s, y - 14 * s], [x + 14 * s, y - 14 * s], [x + 14 * s, y + 10 * s], [x + 3 * s, y + 10 * s]], true), '#8a8674', 0.45), 1.5 * s);
    return o;
  }
  // big twig nest on a crag top, red feathers poking out, a few bones
  function harpyNest(c, x, y, s, feather) {
    feather = feather || '#a83a22';
    var o = '', r = rng(Math.round(x * 5 + y * 3));
    for (var i = 0; i < 5; i++) {
      var fx = x + (i - 2) * 8 * s, a = -0.6 + i * 0.3, tx = fx + Math.sin(a) * 18 * s, ty = y - 6 * s - Math.cos(a) * 18 * s;
      o += P('M' + pt([fx - 2 * s, y - 6 * s]) + 'Q' + pt([(fx + tx) / 2 - 4 * s, (y - 6 * s + ty) / 2]) + ' ' + pt([tx, ty]) + 'Q' + pt([(fx + tx) / 2 + 4 * s, (y - 6 * s + ty) / 2]) + ' ' + pt([fx + 2 * s, y - 6 * s]) + 'Z', c.cel(i % 2 ? feather : dk(feather, 0.25)), 1.2 * s);
    }
    var bowl = 'M' + pt([x - 25 * s, y - 8 * s]) + 'C' + pt([x - 23 * s, y + 4 * s]) + ' ' + pt([x + 23 * s, y + 4 * s]) + ' ' + pt([x + 25 * s, y - 8 * s]) + 'C' + pt([x + 12 * s, y - 4 * s]) + ' ' + pt([x - 12 * s, y - 4 * s]) + ' ' + pt([x - 25 * s, y - 8 * s]) + 'Z', tw = '';
    for (var j = 0; j < 14; j++) { var tx2 = x + (r() - 0.5) * 44 * s, ty2 = y - r() * 8 * s; tw += 'M' + pt([tx2 - 7 * s, ty2]) + 'l' + n(14 * s) + ',' + n((r() - 0.5) * 5 * s); }
    o += body(c, bowl, '#6a4a30', L(tw, '#3a2818', 1.1 * s), 1.6 * s) + L(tw, '#9a7a50', 0.8 * s, 0.8);
    o += L('M' + pt([x - 26 * s, y - 8 * s]) + 'l' + n(-6 * s) + ',' + n(-3 * s) + 'M' + pt([x + 24 * s, y - 6 * s]) + 'l' + n(7 * s) + ',' + n(-4 * s), OL, 2.6 * s) + L('M' + pt([x - 26 * s, y - 8 * s]) + 'l' + n(-6 * s) + ',' + n(-3 * s) + 'M' + pt([x + 24 * s, y - 6 * s]) + 'l' + n(7 * s) + ',' + n(-4 * s), '#9a7a50', 1.2 * s);
    return o + bone(x + 12 * s, y - 2 * s, 10 * s, 0.3, 0.7 * s);
  }
  // burnt tree: black, split, embers at the broken tips
  function ashTree(c, x, y, s) {
    var o = deadTree(c, x, y, s, '#1e1a1a');
    o += L('M' + pt([x - 1 * s, y - 6 * s]) + 'L' + pt([x + 1 * s, y - 18 * s]) + 'L' + pt([x - 1 * s, y - 28 * s]), EMBER, 1.3 * s, 0.9);
    [[-20, -56], [18, -62], [-3, -60]].forEach(function (p) { o += C(x + p[0] * s, y + p[1] * s, 5 * s, glow(c, '#ff8a2a', 0.8)) + C(x + p[0] * s, y + p[1] * s, 1.3 * s, '#ffd070'); });
    return o;
  }
  // glowing ember cracks in ash ground
  function emberCracks(c, seed, y0, y1, cnt) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = r() * 400, y = y0 + r() * (y1 - y0), k = 0.6 + (y - y0) / (y1 - y0);
      d += 'M' + pt([x, y]);
      for (var j = 0; j < 3; j++) { x += (r() - 0.3) * 20 * k; y += (r() - 0.5) * 6 * k; d += 'L' + pt([x, y]); }
    }
    return L(d, '#ff6a1a', 4.4, 0.25) + L(d, '#1a1010', 2.4) + L(d, '#ff9a3a', 1.1);
  }
  function wisps(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), h = 14 + r() * 18; d += 'M' + pt([x, y]) + 'C' + pt([x - 6, y - h * 0.3]) + ' ' + pt([x + 6, y - h * 0.6]) + ' ' + pt([x + 1, y - h]); }
    return L(d, col || '#8a8084', 2.4, 0.45);
  }
  function embers(seed, y0, y1, cnt) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) o += C(r() * 400, y0 + r() * (y1 - y0), 0.8 + r() * 1.2, r() < 0.5 ? '#ffb040' : '#ff6a1a', 0, 0.9);
    return o;
  }
  function lakeRipples(seed, y0, y1, cnt, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 8 + r() * 22 * (0.5 + (y - y0) / (y1 - y0 || 1)); d += 'M' + pt([x - w, y]) + 'Q' + pt([x, y - 1.6]) + ' ' + pt([x + w, y]); }
    return L(d, col || '#e8f4fa', 1.1, 0.7);
  }
  // mossy boulder
  function mossRock(c, x, y, w, h, col) {
    return rock(c, x, y, w, h, col || GRAN) + F('M' + pt([x - w * 0.46, y - h * 0.5]) + 'C' + pt([x - w * 0.3, y - h * 1.08]) + ' ' + pt([x + w * 0.24, y - h * 1.08]) + ' ' + pt([x + w * 0.4, y - h * 0.6]) + 'C' + pt([x + w * 0.2, y - h * 0.74]) + ' ' + pt([x - w * 0.2, y - h * 0.7]) + ' ' + pt([x - w * 0.46, y - h * 0.5]) + 'Z', '#6a8a3a', 0.9);
  }
  function fern(c, x, y, s, col) {
    col = col || '#4a7a3a';
    var o = '';
    [[-1, -0.9], [-0.5, -1.2], [0.2, -1.3], [0.8, -1], [1.2, -0.6]].forEach(function (f) {
      var ex = x + f[0] * 14 * s, ey = y + f[1] * 14 * s, d = 'M' + pt([x, y]) + 'Q' + pt([x + f[0] * 4 * s, y + f[1] * 12 * s]) + ' ' + pt([ex, ey]), lv = '';
      for (var t = 0.3; t < 1; t += 0.2) { var px = x + (ex - x) * t, py = y + (ey - y) * t - 3 * s * t; lv += 'M' + pt([px, py]) + 'l' + n(-3 * s) + ',' + n(-2 * s) + 'M' + pt([px, py]) + 'l' + n(3 * s) + ',' + n(-2 * s); }
      o += L(d + lv, OL, 3.4 * s) + L(d + lv, col, 1.6 * s);
    });
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    malakajin: function (c) {
      var o = stSky(c, '#6f9ac6', '#b8cfe0', '#ece6d4') + sun(c, 60, 38, 10, '#fff6dc') + cloud(170, 34, 0.9, 0.7) + cloud(320, 24, 0.7, 0.65);
      o += peaks(c, 11, 136, 56, 96, '#aca6c2', '#eeeaf4', 50, 80) + peaks(c, 13, 148, 30, 58, '#8e86a4', null, 40, 70);
      o += farPines(15, 148, '#3e5a4a', 26, 12, 24, 170, 420);
      o += ground(c, 146, '#bcae6c', '#8e8a4a');
      // the Scrublands road climbing in from the lower left toward the pass
      o += F('M60,242 C90,210 150,190 210,178 C250,168 290,158 332,148 L350,148 C312,162 272,176 238,186 C182,202 142,222 132,242 Z', '#dcc890', 0.72);
      o += grass(17, 150, 238, '#8a7a34', 90, 0.6, 1.8, 1.1) + grass(19, 152, 238, '#c8c070', 50, 0.6, 1.6, 1) + pebbles(21, 170, 236, '#7a6a48', 14);
      o += crag(c, 18, 180, 64, 104, GRAN, 23) + crag(c, 392, 170, 52, 76, GRAND, 25);
      o += pine(c, 48, 184, 0.9) + pine(c, 370, 178, 1.0, PINED) + pine(c, 396, 196, 0.8);
      o += trollHut(c, 152, 158, 0.46, '#b89858') + trollHut(c, 300, 162, 0.6, '#c0a060') + trollHut(c, 96, 176, 0.76);
      o += tuskArch(c, 222, 176, 0.78) + voodooTotem(c, 262, 172, 0.66) + voodooTotem(c, 184, 172, 0.58);
      o += campfire(c, 340, 200, 0.5) + skull(c, 124, 200, 0.9) + bone(150, 214, 12, 0.4, 0.9);
      o += tufts(c, [[20, 222, 1.1], [390, 228, 1.0], [170, 234, 0.8], [256, 236, 0.9]], '#9a9a4a');
      return o + vignette(c);
    },
    sun_rock_retreat: function (c) {
      var o = stSky(c, '#5c8cc4', '#a8c4e0', '#f2e4c8') + cloud(80, 50, 1.1, 0.8) + cloud(310, 36, 0.9, 0.75);
      o += peaks(c, 31, 150, 50, 100, '#b4aec8', '#f0ecf6', 50, 90);
      // a sea of cloud below the shelf: we are high up
      o += R(-2, 146, 404, 24, c.lg([[0, '#ffffff', 0], [0.5, '#f4f4f8', 0.85], [1, '#e8ecf4', 0.9]])) + cloud(40, 156, 1.6, 0.9) + cloud(150, 160, 1.3, 0.85) + cloud(270, 158, 1.5, 0.9) + cloud(380, 154, 1.2, 0.85);
      o += sunRock(c, 200, 124, 38);
      var sh = '#b09a84';
      o += body(c, 'M-4,242 L-4,168 C40,162 120,160 200,162 C280,160 360,162 404,166 L404,242 Z', sh,
        R(-4, 176, 408, 70, c.lg([[0, sh, 0], [1, dk(sh, 0.35), 0.9]])) + L('M-4,190 C80,186 160,188 240,186 C300,185 360,188 404,190 M-4,214 C100,210 200,214 404,212', dk(sh, 0.2), 1.4, 0.6) +
        F('M-4,168 C40,162 120,160 200,162 C280,160 360,162 404,166 L404,172 C300,168 200,168 100,170 C60,170 20,172 -4,174 Z', lt(sh, 0.2), 0.8), 2.2);
      o += cracks(36, 182, 238, dk(sh, 0.3), 10) + grass(33, 170, 238, '#8a8a4a', 40, 0.6, 1.6, 1) + pebbles(35, 180, 236, '#7a6a60', 12);
      o += rock(c, 104, 176, 22, 10, dk(sh, 0.1)) + rock(c, 300, 180, 18, 8, dk(sh, 0.12));
      o += taurenTent(c, 126, 168, 0.46, { p1: PAINT_B, p2: PAINT_R }) + orcHut(c, 290, 172, 0.46);
      o += totem(c, 162, 178, 58, 0.6) + totem(c, 240, 178, 58, 0.6, { wing: PAINT_R, tip: PAINT_Y });
      o += taurenTent(c, 64, 182, 0.74) + taurenTent(c, 344, 184, 0.7, { hide: '#dcc090', p1: PAINT_B, p2: PAINT_Y });
      o += perch(c, 384, 176, 0.92) + perch(c, 16, 176, 0.8);
      o += banner(c, 262, 196, 42) + banner(c, 124, 196, 42, '#2f7a8a');
      o += barrel(c, 306, 202, 0.8, '#8a5a32') + crate(c, 320, 206, 0.8) + campfire(c, 200, 208, 0.62);
      o += rock(c, 10, 240, 40, 16, dk(sh, 0.15)) + rock(c, 392, 240, 36, 14, dk(sh, 0.15));
      o += tufts(c, [[34, 228, 1], [372, 230, 1], [150, 236, 0.8]], '#9a9a4a');
      return o + vignette(c);
    },
    webwinder_path: function (c) {
      var o = stSky(c, '#5a7a9a', '#98aebc', '#c8ccc4');
      o += peaks(c, 41, 124, 40, 74, '#9a94b0', '#e4e0ec', 40, 60);
      o += farPines(43, 130, '#34503e', 16, 12, 22, 110, 290);
      o += ground(c, 128, '#66683e', '#40422c');
      o += F('M172,130 L228,130 C248,160 296,200 322,242 L78,242 C104,200 152,160 172,130 Z', '#8a7c5a', 0.72);
      o += grass(45, 132, 238, '#4e5a30', 70, 0.6, 1.8, 1.1) + pebbles(47, 150, 236, '#5a5440', 14);
      // the canyon walls
      var lw = 'M-4,178 L-4,-4 L96,-4 C90,30 110,58 102,94 C98,120 118,142 136,162 C100,170 50,174 -4,178 Z';
      var rw = 'M404,178 L404,-4 L302,-4 C308,30 288,62 296,98 C300,124 282,146 264,164 C300,170 350,174 404,178 Z';
      [[lw, GRAN, 1], [rw, dk(GRAN, 0.08), -1]].forEach(function (w) {
        var sg = w[2], x0 = sg > 0 ? 0 : 400, cr = '';
        for (var i = 0; i < 5; i++) cr += 'M' + pt([x0 + sg * (20 + i * 16), 10 + i * 26]) + 'L' + pt([x0 + sg * (26 + i * 16), 40 + i * 26]) + 'L' + pt([x0 + sg * (18 + i * 16), 62 + i * 24]);
        o += body(c, w[0], w[1], F(sg > 0 ? 'M60,-4 L100,-4 C92,30 112,58 104,94 C100,120 120,142 138,164 L60,168 Z' : 'M404,-4 L360,-4 L360,176 L404,178 Z', dk(w[1], 0.28), 0.85) +
          L(cr, dk(w[1], 0.4), 1.3) + L(sg > 0 ? 'M-4,60 C30,56 60,62 96,58 M-4,120 C40,116 80,124 112,120' : 'M404,56 C370,52 330,60 300,56 M404,118 C360,114 320,122 290,118', dk(w[1], 0.18), 1.4, 0.6) +
          F(sg > 0 ? 'M-4,176 C40,170 90,168 136,162 L136,172 L-4,182 Z' : 'M404,176 C360,170 310,168 264,164 L264,174 L404,182 Z', '#4a5a2e', 0.8), 2.4);
      });
      o += pine(c, 20, 32, 0.6, PINED) + pine(c, 70, 12, 0.5) + pine(c, 382, 26, 0.62, PINED) + pine(c, 330, 8, 0.5);
      // thick webs strung between the walls
      o += web(200, 64, 104, 0, Math.PI * 2, 12, 5, '#ecece4', 0.8, 1.5);
      o += web(0, 0, 150, 0, Math.PI / 2, 6, 5, '#ecece4', 0.7, 1.3) + web(400, 0, 150, Math.PI / 2, Math.PI, 6, 5, '#ecece4', 0.7, 1.3);
      o += L('M96,40 L150,54 M104,110 L140,96 M300,40 L252,54 M296,108 L262,96 M200,-4 L200,20', '#000', 3.4, 0.25) + L('M96,40 L150,54 M104,110 L140,96 M300,40 L252,54 M296,108 L262,96 M200,-4 L200,20', '#ecece4', 1.8, 0.85);
      o += eggSack(c, 150, 118, 0.9, 30) + eggSack(c, 250, 112, 0.8, 34) + eggSack(c, 118, 70, 0.7, 20) + eggSack(c, 290, 72, 0.7, 26);
      o += eggSack(c, 44, 190, 1.1) + eggSack(c, 62, 196, 0.9) + eggSack(c, 356, 192, 1.0) + eggSack(c, 380, 196, 0.8);
      o += mist(c, 150, 30, '#c8d0c0', 0.2, 49);
      o += fern(c, 14, 238, 1.2) + fern(c, 388, 238, 1.1) + tufts(c, [[150, 236, 0.8], [260, 234, 0.8]], '#5a6a34');
      return o + R(0, 0, 400, 240, c.lg([[0, '#000', 0.3], [0.35, '#000', 0], [0.8, '#000', 0], [1, '#000', 0.3]])) + vignette(c, '#e0f0d0', '#0a1008');
    },
    windshear_crag: function (c) {
      var o = stSky(c, '#7c96b4', '#b8c2cc', '#dcd6cc') + sun(c, 330, 42, 10, '#fff2d8') + smog(120, 64, 1.2, '#8a8a8a', 0.22);
      o += peaks(c, 51, 128, 44, 84, '#aaa4bc', '#ece8f0', 50, 80);
      // forest edge behind: still standing on the right, cut away on the left
      o += farPines(53, 136, '#2e4a3a', 22, 20, 34, 206, 420) + farPines(55, 140, '#26402f', 14, 16, 26, 250, 420);
      o += hills(c, 57, 150, 14, '#8a847a', 50) + ground(c, 154, '#8c8478', '#665e54');
      o += cracks(59, 170, 238, '#5a544c', 8) + grass(61, 158, 238, '#6a6a4a', 44, 0.6, 1.6, 1) + pebbles(63, 170, 236, '#5a544c', 16) + pebbles(64, 160, 236, '#d8b878', 18);
      o += stump(c, 30, 166, 0.5) + stump(c, 92, 160, 0.4) + stump(c, 236, 162, 0.46) + stump(c, 176, 158, 0.36) + stump(c, 300, 176, 0.56);
      o += pine(c, 392, 172, 1.08, PINED) + pine(c, 356, 160, 0.78);
      o += shack(c, 318, 160, 0.5, '#8a8474', RUST);
      o += G(shredder(c, { parked: true, col: '#b09040' }), 'translate(4,104) scale(0.46)');
      o += machine(c, 150, 178, 0.78);
      o += logPile(c, 232, 188, 0.86);
      o += log(c, 100, 214, 64, 6) + stump(c, 196, 212, 0.82) + stump(c, 372, 212, 0.8) + stump(c, 18, 228, 1.0);
      o += smoke(312, 124, 0.7, '#6a6868', 0.6, -0.5);
      return o + vignette(c, '#fff0e0', '#201810');
    },
    cragpool_lake: function (c) {
      var o = stSky(c, '#6a9ac8', '#b0cce0', '#e6e8e4') + sun(c, 90, 36, 10) + cloud(250, 30, 1, 0.75) + cloud(360, 50, 0.7, 0.7);
      o += peaks(c, 71, 124, 50, 90, '#a8a2c0', '#f0ecf6', 50, 80) + peaks(c, 73, 136, 24, 50, '#8a82a0', null, 40, 60);
      o += farPines(75, 138, '#2e4a3a', 30, 12, 22);
      // the dam across the gorge at the far left holds the upper water back
      o += dam(c, -6, 132, 112, 146);
      o += shack(c, 44, 104, 0.46, '#8a8474', RUST) + gear(c, 104, 100, 8, IRON);
      // the lake
      o += R(-2, 142, 404, 48, c.lg([[0, '#6a9ac0'], [0.5, '#3e6e98'], [1, '#2a5078']]));
      o += F('M160,144 L200,176 L240,144 Z M280,144 L310,166 L340,144 Z', '#9aa4c4', 0.25) + lakeRipples(77, 148, 186, 22);
      // near rocky shore
      o += body(c, 'M-4,242 L-4,188 C60,182 140,180 200,184 C280,188 340,182 404,178 L404,242 Z', MOSS, R(-4, 200, 408, 44, c.lg([[0, MOSS, 0], [1, dk(MOSS, 0.4), 0.9]])) + F('M-4,188 C60,182 140,180 200,184 C280,188 340,182 404,178 L404,186 C340,190 280,196 200,192 C140,188 60,190 -4,196 Z', '#8a8a7a', 0.8), 1.8);
      o += grass(79, 192, 238, '#4a5a2e', 60, 0.6, 1.8, 1.1) + pebbles(81, 196, 236, '#5a5a4a', 14);
      // pumping works on the near shore, pipes up to the dam
      o += limb('M96,190 L96,150 M116,190 L116,150 M96,176 L116,160 M116,176 L96,160', '#6a4a2a', 2.6) + L('M90,186 L122,186', '#e8f4fa', 1.2, 0.8);
      o += pipe(c, [[404, 200], [330, 204], [120, 200], [106, 190], [106, 146]], 6, '#7a746a');
      o += pipe(c, [[330, 218], [150, 220], [40, 212], [22, 204]], 4, '#6a645a');
      o += shack(c, 356, 192, 0.64, '#8a8474', '#c8962e') + gear(c, 330, 178, 9, IRON) + gear(c, 342, 170, 6, '#8a6a3a');
      o += crag(c, 392, 180, 30, 44, GRAND, 83) + mossRock(c, 30, 206, 34, 16) + mossRock(c, 250, 236, 26, 12);
      o += pine(c, 18, 196, 0.8) + tufts(c, [[120, 232, 0.9], [200, 238, 0.8]], '#6a7a3a');
      return o + vignette(c, '#f0f8ff', '#10202a');
    },
    charred_vale: function (c) {
      var o = stSky(c, '#4e4048', '#8a6a62', '#d8946a') + sun(c, 306, 62, 12, '#ffb070');
      o += smog(100, 60, 1.6, '#2a2226', 0.35) + smog(300, 86, 1.4, '#2a2226', 0.3);
      o += peaks(c, 81, 136, 40, 84, '#6a5e6a', null, 50, 80) + peaks(c, 83, 146, 20, 50, '#4a4048', null, 40, 60);
      o += L('M40,146 L42,118 M60,146 L58,124 M140,146 L141,112 M230,146 L228,120 M290,146 L292,114 M350,146 L348,126', '#241e20', 3);
      o += ground(c, 144, '#3a3436', '#1e1a1c');
      o += emberCracks(c, 85, 160, 238, 12) + wisps(87, 160, 236, 14) + pebbles(89, 160, 236, '#5a5456', 18);
      o += E(200, 200, 60, 8, '#5a5456', 0, 0.35) + E(90, 222, 40, 6, '#5a5456', 0, 0.3);
      o += crag(c, 40, 196, 84, 144, '#4a4250', 91) + harpyNest(c, 38, 58, 0.95);
      o += crag(c, 364, 176, 72, 116, '#443c48', 93) + harpyNest(c, 360, 66, 0.85);
      o += ashTree(c, 150, 176, 0.9) + ashTree(c, 262, 162, 0.66) + ashTree(c, 112, 156, 0.5) + ashTree(c, 316, 196, 0.8);
      o += embers(95, 20, 200, 26);
      return o + vignette(c, '#ffb070', '#000000');
    },
    grimtotem_post: function (c) {
      var o = stSky(c, '#343c5e', '#9a6a72', '#e8a070') + sun(c, 330, 120, 12, '#ffd0a0');
      o += peaks(c, 101, 150, 50, 96, '#6e6a8a', null, 60, 90) + peaks(c, 102, 186, 30, 60, '#58546e', null, 50, 70);
      o += farPines(104, 196, '#3a3a4e', 20, 10, 18, 240, 420) + mist(c, 190, 26, '#e8b8a8', 0.4, 103);
      // the cliff shelf; its right side breaks off into the valley below
      var sh = '#6e6878';
      o += body(c, 'M-4,242 L-4,150 C60,146 160,146 236,150 L262,156 L300,172 L330,184 L372,200 L404,206 L404,242 Z', sh,
        R(-4, 160, 408, 84, c.lg([[0, sh, 0], [1, dk(sh, 0.4), 0.9]])) + L('M-4,176 C100,172 200,176 290,178 M-4,204 C120,200 260,206 404,214', dk(sh, 0.2), 1.4, 0.6) +
        F('M-4,150 C60,146 160,146 236,150 L262,156 L300,172 L330,184 L372,200 L404,206 L404,214 L372,208 L330,192 L300,180 L262,164 L236,158 C160,154 60,154 -4,158 Z', lt(sh, 0.18), 0.8), 2.2);
      o += grass(105, 156, 238, '#4a4a3a', 50, 0.6, 1.6, 1) + pebbles(107, 170, 236, '#4a4450', 14);
      var dark = { hide: '#7a7686', p1: '#2a3444', p2: '#8a2a2a' }, dark2 = { hide: '#6a6474', p1: '#8a2a2a', p2: '#2a3444' };
      var tc = { cols: ['#3e4c5c', '#2a3440', '#56606e', '#3a3440'], wing: '#2a3440', tip: '#8a2a2a', headCol: '#56606e' };
      o += taurenTent(c, 160, 156, 0.46, dark2) + taurenTent(c, 250, 158, 0.5, dark);
      o += totem(c, 206, 170, 62, 0.62, tc);
      o += taurenTent(c, 62, 176, 0.76, dark) + taurenTent(c, 322, 206, 0.64, dark2);
      o += totem(c, 116, 188, 70, 0.7, tc) + totem(c, 392, 226, 70, 0.7, tc);
      o += banner(c, 272, 196, 44, '#2a3444', '#8a2a2a');
      o += campfire(c, 200, 208, 0.62) + skull(c, 40, 214, 1) + bone(60, 222, 14, -0.3, 1) + bone(300, 226, 12, 0.5, 0.9);
      o += tufts(c, [[20, 234, 1], [380, 236, 0.9]], '#5a5a44');
      return o + vignette(c, '#c8b8e0', '#0a0810');
    },
    mirkfallon_lake: function (c) {
      var o = stSky(c, '#5a8aa8', '#a0c0c8', '#dce4d8');
      o += peaks(c, 111, 124, 30, 60, '#9a9ab4', '#e8e8f0', 50, 70);
      o += farPines(113, 136, '#2a4a3a', 30, 24, 46);
      o += L('M60,136 L62,60 M120,136 L118,50 M280,136 L282,56 M340,136 L338,66', '#5a3a2a', 5, 0.6);
      o += R(-2, 134, 404, 54, c.lg([[0, '#5a98ac'], [0.5, '#3a7488'], [1, '#26546a']]));
      o += F('M40,136 L80,136 L70,176 Z M110,136 L150,136 L132,172 Z M270,136 L306,136 L290,170 Z', '#1a3a2a', 0.3) + lakeRipples(115, 142, 184, 24);
      o += body(c, 'M-4,242 L-4,188 C60,182 140,184 200,186 C280,188 340,184 404,182 L404,242 Z', '#4e6a38', R(-4, 196, 408, 48, c.lg([[0, '#4e6a38', 0], [1, '#26361c', 0.9]])) + F('M-4,188 C60,182 140,184 200,186 C280,188 340,184 404,182 L404,190 C340,192 280,196 200,194 C140,192 60,190 -4,196 Z', '#6a8a4a', 0.8), 1.8);
      o += grass(117, 192, 238, '#2e4a22', 60, 0.6, 1.8, 1.1);
      // rocks in the lake with wyverns perched on them
      o += rock(c, 164, 160, 46, 18, GRAN) + G(MOBS.pridewing_wyvern(c), 'translate(144,106) scale(0.36)');
      o += rock(c, 250, 154, 36, 14, dk(GRAN, 0.08)) + G(MOBS.pridewing_wyvern(c), 'matrix(-0.28,0,0,0.28,286,112)');
      o += redwood(c, 96, 176, 0.8, -10) + redwood(c, 318, 172, 0.72, -10);
      o += redwood(c, 26, 206, 1.4, -10) + redwood(c, 376, 202, 1.28, -10);
      o += canopy(c, 20, 20, 1.5) + canopy(c, 100, 4, 1.1, PINE) + canopy(c, 310, 6, 1.1, PINE) + canopy(c, 384, 24, 1.4);
      o += fern(c, 60, 226, 1.1) + fern(c, 340, 230, 1) + mossRock(c, 150, 214, 30, 12) + tufts(c, [[200, 236, 0.8], [260, 238, 0.9]], '#4a6a2e');
      return o + vignette(c, '#e8ffe0', '#0a1a10');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- spider (Deepvine, facing left) ----
  function spider(c, o) {
    var col = o.col, mk = o.mark || '#c8c090', legF = dk(col, 0.28), legN = lt(col, 0.06), s = shadow(c, 64, 56);
    if (o.back) s += o.back(c);
    var farL = [[[44, 84], [26, 50], [10, 116]], [[50, 82], [42, 48], [36, 118]], [[58, 82], [82, 46], [94, 118]], [[62, 84], [108, 48], [124, 114]]];
    farL.forEach(function (l) { s += limb(pd(l), legF, 3.6) + C(l[1][0], l[1][1], 2.4, c.cel(dk(col, 0.15)), 1.1); });
    var ab = 'M60,76 C58,54 78,42 98,46 C118,50 128,70 122,88 C116,102 96,106 80,100 C68,96 60,88 60,76 Z';
    s += body(c, ab, col, F('M62,92 C80,106 106,104 124,88 L126,110 L58,110 Z', dk(col, 0.35), 0.85) + E(82, 58, 10, 5, lt(col, 0.2), 0, 0.6) +
      F('M84,62 L94,56 L104,62 L100,70 L94,66 L88,70 Z', mk, 0.9) + F('M86,78 L94,72 L102,78 L98,84 L94,80 L90,84 Z', mk, 0.8) + (o.marks ? o.marks(c) : ''), 2.4);
    if (o.onAb) s += o.onAb(c);
    var ce = 'M34,86 C34,74 46,68 58,72 C68,76 68,92 58,98 C48,102 34,98 34,86 Z';
    s += body(c, ce, col, F('M32,94 C44,102 58,102 70,92 L70,106 L32,106 Z', dk(col, 0.35), 0.8) + E(50, 76, 7, 3, lt(col, 0.22), 0, 0.6));
    var nearL = [[[44, 94], [16, 66], [2, 120]], [[50, 96], [30, 70], [22, 121]], [[56, 96], [74, 68], [80, 121]], [[60, 94], [98, 64], [112, 120]]];
    nearL.forEach(function (l) {
      s += limb(pd(l), legN, 4) + L(pd([l[1], l[2]]), lt(col, 0.35), 1, 0.7);
      if (o.hairy) {
        var hr = '';
        for (var t = 0.2; t < 0.9; t += 0.22) { var px = l[1][0] + (l[2][0] - l[1][0]) * t, py = l[1][1] + (l[2][1] - l[1][1]) * t; hr += 'M' + pt([px, py]) + 'l' + n(l[2][0] > l[1][0] ? 4 : -4) + ',-2'; }
        s += L(hr, OL, 1.4);
      }
      s += C(l[1][0], l[1][1], 2.6, c.cel(col), 1.2);
    });
    s += E(33, 89, 12, 10, c.cel(dk(col, 0.05)), 2.2) + E(30, 84, 5, 2.4, lt(col, 0.25), 0, 0.6);
    var ey = o.eye || '#ff4a2a';
    s += gEye(c, 25, 86, 2.2, ey) + gEye(c, 32, 83, 1.8, ey) + gEye(c, 29, 91, 1.4, ey) + gEye(c, 37, 87, 1.3, ey);
    s += P('M24,96 C18,100 18,108 24,111 C24,106 26,101 29,98 Z', c.cel(o.fang || '#e8e0c8'), 1.4) + P('M33,98 C30,102 31,109 35,112 C35,107 36,102 38,100 Z', c.cel(o.fang || '#d8d0b8'), 1.4);
    if (o.front) s += o.front(c);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- harpy (woman's torso, wing-arms, bird legs; facing left) ----
  function hWing(c, S, Wr, D, len, col, tip, k) {
    k = k || 6;
    var dl = Math.sqrt(D[0] * D[0] + D[1] * D[1]) || 1, dx = D[0] / dl, dy = D[1] / dl, ax = Wr[0] - S[0], ay = Wr[1] - S[1], al = Math.sqrt(ax * ax + ay * ay) || 1, edge = [], veins = '', tl = [];
    // feathers hang along D near the shoulder and sweep out past the wrist as primaries
    function fdir(t) { var w = 0.62 * Math.pow(t, 1.6), fx = dx * (1 - w) + ax / al * w, fy = dy * (1 - w) + ay / al * w, fl = Math.sqrt(fx * fx + fy * fy) || 1; return [fx / fl, fy / fl]; }
    for (var i = 0; i <= k; i++) {
      var t = 1 - i / k * 0.85, bx = S[0] + ax * t, by = S[1] + ay * t, l0 = len * (0.42 + 0.62 * t), fd = fdir(t);
      edge.push([bx + fd[0] * l0, by + fd[1] * l0]);
      if (i < k) { var t2 = t - 0.85 / k * 0.5, nl = len * (0.42 + 0.62 * t2) * 0.7, f2 = fdir(t2); edge.push([S[0] + ax * t2 + f2[0] * nl, S[1] + ay * t2 + f2[1] * nl]); }
      veins += 'M' + pt([bx + fd[0] * l0 * 0.3, by + fd[1] * l0 * 0.3]) + 'L' + pt([bx + fd[0] * l0 * 0.92, by + fd[1] * l0 * 0.92]);
      tl.push([bx + fd[0] * l0 * 0.86, by + fd[1] * l0 * 0.86]);
    }
    var d = 'M' + pt(S) + 'L' + pt(Wr) + edge.map(function (p) { return 'L' + pt(p); }).join('') + 'Z';
    var s = body(c, d, col, L('M' + pt(S) + 'L' + pt(Wr), lt(col, 0.2), len * 0.34) + L(pd(tl), tip, len * 0.24) + L(veins, dk(col, 0.35), 1.1) + L('M' + pt(S) + 'L' + pt(Wr), dk(col, 0.25), 1.2, 0.7), 2);
    var cl = 'M' + pt(Wr) + 'l-4,-3 M' + pt(Wr) + 'l-5,1 M' + pt(Wr) + 'l-3,3';
    return s + L(cl, OL, 3.2) + L(cl, '#ece4cc', 1.3);
  }
  function harpyHead(c, x, y, o) {
    var sk = o.skin, hair = o.hair, s = '';
    var mane = 'M' + pt([x - 6, y - 12]) + 'C' + pt([x + 6, y - 24]) + ' ' + pt([x + 26, y - 20]) + ' ' + pt([x + 30, y - 8]) + 'L' + pt([x + 38, y - 4]) + 'L' + pt([x + 29, y + 1]) + 'L' + pt([x + 36, y + 10]) + 'L' + pt([x + 25, y + 9]) + 'L' + pt([x + 29, y + 20]) + 'L' + pt([x + 17, y + 13]) + 'L' + pt([x + 15, y + 24]) + 'L' + pt([x + 9, y + 12]) + 'C' + pt([x + 3, y + 4]) + ' ' + pt([x - 2, y - 4]) + ' ' + pt([x - 6, y - 12]) + 'Z';
    s += body(c, mane, hair, L('M' + pt([x + 4, y - 14]) + 'Q' + pt([x + 20, y - 12]) + ' ' + pt([x + 30, y - 4]) + 'M' + pt([x + 6, y - 6]) + 'Q' + pt([x + 18, y]) + ' ' + pt([x + 24, y + 8]) + 'M' + pt([x + 6, y + 2]) + 'Q' + pt([x + 12, y + 10]) + ' ' + pt([x + 14, y + 20]), dk(hair, 0.35), 1.2) +
      F(pd([[x + 14, y - 26], [x + 40, y - 26], [x + 40, y + 26], [x + 14, y + 26]], true), dk(hair, 0.25), 0.7), 2);
    if (o.crest) s += o.crest(c, x, y);
    s += P(pd([[x + 3, y - 3], [x + 17, y - 15], [x + 10, y + 3]], true), c.cel(sk), 1.8);
    var d = 'M' + pt([x + 9, y - 9]) + 'C' + pt([x + 2, y - 14]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 10, y - 4]) + 'L' + pt([x - 15, y + 1]) + 'L' + pt([x - 10, y + 3]) + 'C' + pt([x - 11, y + 7]) + ' ' + pt([x - 9, y + 10]) + ' ' + pt([x - 7, y + 11]) +
      'C' + pt([x - 4, y + 14]) + ' ' + pt([x + 2, y + 14]) + ' ' + pt([x + 6, y + 10]) + 'C' + pt([x + 10, y + 6]) + ' ' + pt([x + 11, y - 2]) + ' ' + pt([x + 9, y - 9]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 1, y - 16], [x + 14, y - 16], [x + 14, y + 16], [x + 1, y + 16]], true), dk(sk, 0.22), 0.8) + E(x - 3, y + 5, 2.6, 1.6, '#e07a6a', 0, 0.5), 2);
    s += P(pd([[x - 9.5, y - 3], [x - 3, y - 5], [x - 3.5, y - 1], [x - 8.5, y - 0.5]], true), o.eye || '#ffd040', 1) + C(x - 6, y - 2.4, 0.9, OL);
    if (o.eyeGlow) s += C(x - 6, y - 2.6, 7, glow(c, o.eyeGlow, 0.7));
    s += L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 2, y - 8]), OL, 2.2);
    s += P(pd([[x - 11, y + 5], [x - 5, y + 5], [x - 6.5, y + 9]], true), '#3a1010', 1.2);
    s += P('M' + pt([x - 8, y - 11]) + 'L' + pt([x - 12, y - 6]) + 'L' + pt([x - 4, y - 9]) + 'L' + pt([x - 5, y - 4]) + 'L' + pt([x + 1, y - 9]) + 'L' + pt([x + 2, y - 4]) + 'L' + pt([x + 7, y - 10]) + 'C' + pt([x + 2, y - 15]) + ' ' + pt([x - 5, y - 15]) + ' ' + pt([x - 8, y - 11]) + 'Z', c.cel(hair), 1.5);
    return s;
  }
  function harpy(c, o) {
    var sk = o.skin || '#d8a888', fe = o.fe, fe2 = o.fe2 || dk(fe, 0.22), tip = o.tip || lt(fe, 0.3), leg = o.leg || '#d8b458', hair = o.hair || dk(fe, 0.35), s = shadow(c, 64, 30);
    if (o.back) s += o.back(c);
    var fw = o.farWing || { S: [72, 46], Wr: [98, 12], D: [0.35, 1], len: 38 };
    s += hWing(c, fw.S, fw.Wr, fw.D, fw.len, fe2, dk(tip, 0.15), 6);
    s += limb('M68,86 L75,100 L68,112 L70,117', dk(leg, 0.18), 5.5) + birdFoot(71, 121, dk(leg, 0.25), true);
    s += limb('M58,86 L63,100 L54,112 L55,117', leg, 6) + birdFoot(56, 121, leg, true);
    s += body(c, 'M46,74 L78,74 L81,94 L74,90 L71,101 L64,92 L58,103 L54,92 L47,98 Z', fe, L('M52,82 L50,94 M60,82 L58,98 M68,82 L70,98 M76,80 L78,92', dk(fe, 0.3), 1.2) + F('M66,72 L84,72 L84,104 L70,104 Z', dk(fe, 0.22), 0.75), 2);
    var td = 'M44,48 C48,42 72,42 77,48 L73,62 C70,68 68,72 70,78 L50,78 C52,72 50,66 47,60 Z';
    s += body(c, td, sk, F('M64,40 L82,40 L82,80 L66,80 C68,70 68,56 64,40 Z', dk(sk, 0.25), 0.8) + L('M56,68 Q60,70 64,68', dk(sk, 0.3), 1.1), 2.2);
    s += P('M44,48 C52,54 68,54 77,48 L75,57 C66,63 54,63 46,57 Z', c.cel(o.bodice || fe), 1.6) + L('M50,54 l2,4 M57,56 l2,4 M64,56 l2,4 M70,54 l1,4', dk(o.bodice || fe, 0.35), 1);
    if (o.neck) s += o.neck(c);
    s += harpyHead(c, o.hx || 58, o.hy || 32, { skin: sk, hair: hair, eye: o.eye, eyeGlow: o.eyeGlow, crest: o.crest });
    if (o.top) s += o.top(c);
    var nw = o.nearWing || { S: [47, 50], Wr: [20, 16], D: [-0.12, 1], len: 42 };
    s += hWing(c, nw.S, nw.Wr, nw.D, nw.len, fe, tip, 7);
    if (o.front) s += o.front(c);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- basilisk (low spiny lizard, facing left) ----
  function basilisk(c, o) {
    var col = o.col, bel = o.belly, gc = o.glow, sp = o.spine || dk(col, 0.3), s = shadow(c, 66, 58);
    s += C(64, 92, 64, glow(c, gc, 0.16));
    s += body(c, 'M96,78 C112,80 122,92 127,108 C118,102 108,98 94,98 Z', col, L('M100,84 L106,94 M110,88 L114,98', gc, 1.3), 2);
    s += limb('M88,94 L102,100 L100,114', dk(col, 0.2), 8) + toes2(101, 121, dk(col, 0.25));
    s += limb('M48,92 L60,100 L58,114', dk(col, 0.2), 8) + toes2(59, 121, dk(col, 0.25));
    var p0 = [28, 76], p1 = [42, 60], p2 = [88, 54], p3 = [110, 78];
    for (var i = 1; i < 10; i++) {
      var q = bez(p0, p1, p2, p3, i / 10), nx = -q[2], ny = -q[3], len = 9 + Math.sin(i / 10 * Math.PI) * 8, tx = q[0] + nx * len + 3, ty = q[1] + ny * len;
      var ax = -ny * 3.4, ay = nx * 3.4;
      s += P(pd([[q[0] + ax, q[1] + ay], [tx, ty], [q[0] - ax, q[1] - ay]], true), c.cel(sp), 1.4) + F(pd([[q[0] + (tx - q[0]) * 0.6 + ax * 0.4, q[1] + (ty - q[1]) * 0.6 + ay * 0.4], [tx, ty], [q[0] + (tx - q[0]) * 0.6 - ax * 0.4, q[1] + (ty - q[1]) * 0.6 - ay * 0.4]], true), o.spineTip || gc);
    }
    var bd = 'M26,84 C28,68 56,60 80,62 C98,64 112,74 112,86 C112,98 96,102 76,102 C56,102 32,100 26,84 Z';
    var crk = 'M44,72 L52,80 L48,88 M62,66 L66,76 L76,78 L78,90 M88,68 L92,78 L102,82 M58,92 L68,96 M84,94 L96,92';
    s += body(c, bd, col, F('M28,90 C40,100 70,104 110,94 L112,108 L26,108 Z', bel, 0.9) + F('M84,58 L116,58 L116,104 L92,104 C104,90 100,72 84,58 Z', dk(col, 0.3), 0.8) +
      L(crk, gc, 4, 0.35) + L(crk, lt(gc, 0.3), 1.4) + E(54, 70, 12, 4, lt(col, 0.16), 0, 0.6), 2.4);
    s += limb('M40,96 L28,104 L26,116', col, 9) + toes2(27, 121, dk(col, 0.1));
    s += limb('M82,98 L72,106 L74,116', col, 9) + toes2(75, 121, dk(col, 0.1));
    var hd = 'M44,74 C36,66 20,66 10,74 C4,78 4,84 8,87 L26,92 C38,94 46,88 46,80 Z';
    s += body(c, hd, col, F('M6,84 L30,90 L46,84 L46,96 L6,96 Z', bel, 0.85) + L('M18,74 L26,80 L36,76', gc, 1.2) + F('M30,64 L50,64 L50,92 L36,92 C42,82 40,72 30,64 Z', dk(col, 0.3), 0.8), 2.2);
    s += P(pd([[36, 68], [48, 56], [44, 70]], true), c.cel(sp), 1.3) + P(pd([[28, 67], [34, 54], [36, 68]], true), c.cel(sp), 1.3);
    s += L('M8,87 L26,92', OL, 1.6) + L('M10,87 l1,3 M15,88 l1,3 M20,89 l1,3', '#f0e8d0', 1.2);
    s += gEye(c, 21, 74, 2.2, o.eye || gc) + L('M14,70 L26,71', OL, 2.2) + C(8, 79, 1, OL);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- hornfolk (Sourhorn), Realm of Loner design: big and horned, but curled ram horns and a long goat-like face, no nose ring ----
  // spiral ram horn: root at the top of the head, curling back, down and forward round the ear (dir 1 = curl clockwise)
  function ramHorn(c, cx, cy, R, dir, col) {
    var PI = Math.PI, N = 22, out = [], inn = [], rid = '', a0 = -PI / 2 - 0.35 * dir;
    for (var i = 0; i <= N; i++) {
      var t = i / N, ang = a0 + dir * t * 1.72 * PI, rad = R * (1 - 0.64 * t), w = R * 0.62 * (1 - 0.6 * t) + 0.8;
      var ca = Math.cos(ang), sa = Math.sin(ang);
      out.push([cx + ca * (rad + w / 2), cy + sa * (rad + w / 2)]); inn.push([cx + ca * (rad - w / 2), cy + sa * (rad - w / 2)]);
      if (i > 1 && i < N - 1 && i % 2 === 0) rid += 'M' + pt([cx + ca * (rad + w * 0.42), cy + sa * (rad + w * 0.42)]) + 'L' + pt([cx + ca * (rad - w * 0.42), cy + sa * (rad - w * 0.42)]);
    }
    var d = pd(out.concat(inn.reverse()), true);
    return body(c, d, col, L(rid, dk(col, 0.32), 1) + F(pd([[cx - R * 1.6, cy + R * 0.2], [cx + R * 1.6, cy + R * 0.2], [cx + R * 1.6, cy + R * 1.6], [cx - R * 1.6, cy + R * 1.6]], true), dk(col, 0.2), 0.55), 1.8);
  }
  function taurenHead(c, x, y, o) {
    var fur = o.fur, s = '', hair = o.hair || dk(fur, 0.4), horn = o.horn || '#e8dcc0', mz = o.muzzle || lt(fur, 0.25);
    s += body(c, 'M' + pt([x + 2, y - 12]) + 'C' + pt([x + 18, y - 16]) + ' ' + pt([x + 28, y - 4]) + ' ' + pt([x + 28, y + 10]) + 'L' + pt([x + 33, y + 26]) + 'L' + pt([x + 24, y + 21]) + 'L' + pt([x + 22, y + 32]) + 'L' + pt([x + 15, y + 19]) + 'C' + pt([x + 10, y + 8]) + ' ' + pt([x + 4, y]) + ' ' + pt([x + 2, y - 12]) + 'Z', hair,
      L('M' + pt([x + 10, y - 10]) + 'Q' + pt([x + 22, y]) + ' ' + pt([x + 26, y + 20]) + 'M' + pt([x + 8, y - 2]) + 'Q' + pt([x + 16, y + 8]) + ' ' + pt([x + 18, y + 22]), dk(hair, 0.35), 1.2), 2);
    // far horn, behind the skull
    s += ramHorn(c, x + 14, y - 2, 12, 1, dk(horn, 0.14));
    // long goat-like face: narrow muzzle running forward and down, small chin beard
    var d = 'M' + pt([x + 12, y - 8]) + 'C' + pt([x + 6, y - 16]) + ' ' + pt([x - 8, y - 16]) + ' ' + pt([x - 12, y - 8]) + 'L' + pt([x - 19, y + 6]) + 'C' + pt([x - 23, y + 13]) + ' ' + pt([x - 23, y + 21]) + ' ' + pt([x - 17, y + 23]) + 'L' + pt([x - 9, y + 22]) + 'C' + pt([x + 1, y + 20]) + ' ' + pt([x + 12, y + 13]) + ' ' + pt([x + 14, y + 3]) + 'Z';
    s += P('M' + pt([x - 15, y + 21]) + 'C' + pt([x - 15, y + 28]) + ' ' + pt([x - 12, y + 32]) + ' ' + pt([x - 9, y + 34]) + 'C' + pt([x - 8, y + 29]) + ' ' + pt([x - 6, y + 25]) + ' ' + pt([x - 6, y + 20]) + 'Z', c.cel(hair), 1.6);
    s += body(c, d, fur, F(pd([[x + 3, y - 18], [x + 18, y - 18], [x + 18, y + 24], [x + 1, y + 24]], true), dk(fur, 0.25), 0.8) +
      F('M' + pt([x - 14, y + 4]) + 'C' + pt([x - 19, y + 6]) + ' ' + pt([x - 24, y + 14]) + ' ' + pt([x - 21, y + 22]) + 'L' + pt([x - 11, y + 24]) + 'C' + pt([x - 7, y + 16]) + ' ' + pt([x - 8, y + 8]) + ' ' + pt([x - 14, y + 4]) + 'Z', mz, 0.95) +
      (o.paint ? L('M' + pt([x - 10, y - 10]) + 'L' + pt([x - 5, y + 3]) + 'M' + pt([x - 4, y - 12]) + 'L' + pt([x + 1, y + 1]) + 'M' + pt([x + 4, y - 12]) + 'L' + pt([x + 8, y + 1]), o.paint, 2.4) : ''), 2.2);
    s += E(x - 19.5, y + 15, 1.2, 2, OL) + E(x - 16, y + 14.6, 1, 1.6, OL) + L('M' + pt([x - 20, y + 21]) + 'Q' + pt([x - 16, y + 22.4]) + ' ' + pt([x - 11, y + 21]), OL, 1.3);
    // ear sticking out sideways under the horn
    s += P('M' + pt([x + 6, y - 2]) + 'C' + pt([x + 14, y - 5]) + ' ' + pt([x + 22, y - 2]) + ' ' + pt([x + 24, y + 2]) + 'C' + pt([x + 17, y + 4]) + ' ' + pt([x + 10, y + 3]) + ' ' + pt([x + 6, y + 3]) + 'Z', c.cel(fur), 1.6) + F('M' + pt([x + 10, y - 1]) + 'C' + pt([x + 15, y - 3]) + ' ' + pt([x + 19, y - 1]) + ' ' + pt([x + 21, y + 1]) + 'C' + pt([x + 16, y + 2]) + ' ' + pt([x + 12, y + 2]) + ' ' + pt([x + 10, y + 1]) + 'Z', '#b87a6a', 0.7);
    if (o.mask) {
      s += P('M' + pt([x + 8, y - 12]) + 'C' + pt([x - 2, y - 17]) + ' ' + pt([x - 12, y - 12]) + ' ' + pt([x - 14, y - 6]) + 'L' + pt([x - 19, y + 4]) + 'C' + pt([x - 22, y + 9]) + ' ' + pt([x - 21, y + 13]) + ' ' + pt([x - 17, y + 12]) + 'L' + pt([x - 9, y + 9]) + 'L' + pt([x - 2, y + 10]) + 'L' + pt([x + 8, y + 4]) + 'Z', c.cel('#e8e0cc'), 1.8) +
        P(pd([[x - 12, y - 4], [x - 3, y - 6], [x - 4, y + 1], [x - 11, y + 1]], true), '#10141e', 1) + C(x - 7, y - 2.4, 6, glow(c, o.eyeCol || '#6ab0ff', 0.8)) + C(x - 7, y - 2.4, 1.6, lt(o.eyeCol || '#6ab0ff', 0.4)) +
        L('M' + pt([x - 18, y + 5]) + 'L' + pt([x - 13, y + 6]) + 'M' + pt([x - 2, y - 12]) + 'L' + pt([x - 1, y - 7]) + 'M' + pt([x + 3, y - 12]) + 'L' + pt([x + 3, y - 7]), '#9a927e', 1.2);
    } else {
      s += E(x - 7, y - 3, 2.6, 2, o.eye || '#f4e070', 1) + L('M' + pt([x - 8.6, y - 3]) + 'L' + pt([x - 5.4, y - 3]), OL, 1.2) + L('M' + pt([x - 13, y - 7]) + 'L' + pt([x - 1, y - 6]), OL, 2.6);
    }
    // near horn: a heavy ram curl round the ear
    s += ramHorn(c, x + 8, y + 1, 14, 1, horn);
    return s;
  }
  function tauren(c, o) {
    var fur = o.fur;
    return biped(c, {
      skin: fur, shirt: fur, pants: dk(fur, 0.05), bareArms: true, feet: 'hoof', boots: '#2a2220', loin: o.loin, legW: 15, armW: 12, belt: o.belt, buckle: o.buckle || '#c8c0b0',
      hx: 45, hy: 38, hipY: 88, shadowR: 38, neck: false,
      torsoD: 'M36,54 C38,40 70,36 90,46 L90,64 L82,80 L81,92 L49,92 L47,80 L40,70 Z',
      back: function (c) {
        return (o.back ? o.back(c) : '') + body(c, 'M58,44 C60,28 86,26 94,40 C98,48 94,58 86,60 Z', fur, F('M78,24 L100,24 L100,62 L84,62 Z', dk(fur, 0.25), 0.8) + L('M68,36 Q78,30 88,36', dk(fur, 0.3), 1.2)) +
          body(c, 'M40,44 L64,36 L72,58 L44,62 Z', fur, F('M58,34 L76,34 L76,60 L62,60 Z', dk(fur, 0.25), 0.8));
      },
      head: function (c, x, y) { return taurenHead(c, x, y, { fur: fur, hair: o.hair, horn: o.horn, paint: o.paint, mask: o.mask, eyeCol: o.eyeCol, ring: o.ring, muzzle: o.muzzle }); },
      chest: function (c) { return E(56, 64, 12, 9, lt(fur, 0.14), 0, 0.7) + L('M46,62 Q56,72 70,64 M54,78 L56,86 M64,78 L64,86', dk(fur, 0.3), 1.4) + (o.chest ? o.chest(c) : ''); },
      near: o.near || [[46, 56], [38, 72], [32, 84]], far: o.far || [[84, 52], [96, 68], [96, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, pads: o.pads, top: o.top, front: o.front,
      tf: o.tf || at(1.0, 64, 122)
    });
  }
  // carved totem club: grip at origin, head up
  function totemClub(c, p, ang, sc, col) {
    col = col || '#4a5a6a';
    var s = limb('M0,12 L0,-24', '#5a3a22', 4.4) + L('M-2,-4 L2,-2 M-2,2 L2,4', '#2a1a10', 1.2);
    var hd = 'M-9,-22 L9,-22 L11,-64 L-11,-64 Z';
    s += P('M-11,-60 L-22,-70 L-11,-50 Z', c.cel('#8a2a2a'), 1.4) + P('M11,-60 L22,-70 L11,-50 Z', c.cel('#6a2020'), 1.4);
    s += body(c, hd, col, F('M3,-66 L13,-66 L13,-20 L4,-20 Z', dk(col, 0.35), 0.8) + L('M-10,-40 L10,-40 M-10,-26 L10,-26', dk(col, 0.45), 2) +
      L('M-7,-56 L-2,-54 M2,-54 L7,-56', OL, 1.6) + R(-7, -53, 4, 3, '#e8e0cc') + R(3, -53, 4, 3, '#e8e0cc') + R(-5, -47, 10, 3, '#1a1009') + P('M-2,-36 L0,-30 L2,-36 Z', '#e8e0cc', 0.8), 2);
    s += P('M-6,-64 L0,-76 L6,-64 Z', c.cel('#e8e0cc'), 1.4) + L('M-9,-22 L9,-22', OL, 3);
    return place(s, p, ang, sc);
  }
  function spiritStaff(c, p) {
    var top = [p[0] - 4, p[1] - 44], bot = [p[0] + 5, p[1] + 34];
    var s = staff(top, bot, '#3a2a22', 3.8) + bone(top[0] + 4, top[1] + 16, 9, 1.3, 0.7) + feathers(top[0] - 3, top[1] + 12, ['#2a3a5a', '#e8e0cc'], 0.6, 0);
    s += P('M' + pt([top[0] - 7, top[1] + 4]) + 'C' + pt([top[0] - 10, top[1] - 8]) + ' ' + pt([top[0] - 2, top[1] - 14]) + ' ' + pt([top[0], top[1] - 14]) + 'C' + pt([top[0] + 4, top[1] - 14]) + ' ' + pt([top[0] + 10, top[1] - 8]) + ' ' + pt([top[0] + 7, top[1] + 4]) + 'Z', 'none', 2.4);
    return s + orb(c, top[0], top[1] - 5, 5, '#4a7aff');
  }
  // ---- wyvern (lion body, bat wings, scorpion tail; facing left) ----
  function batWing(c, S, Wr, tips, back, memb, bone2) {
    var d = 'M' + pt(S) + 'L' + pt(Wr) + 'L' + pt(tips[0]), bn = '';
    for (var i = 0; i < tips.length; i++) {
      var nx = i < tips.length - 1 ? tips[i + 1] : back, m = [(tips[i][0] + nx[0]) / 2, (tips[i][1] + nx[1]) / 2];
      d += 'Q' + pt([m[0] + (Wr[0] - m[0]) * 0.32, m[1] + (Wr[1] - m[1]) * 0.32]) + ' ' + pt(nx);
      bn += 'M' + pt(Wr) + 'L' + pt(tips[i]);
    }
    d += 'Z';
    var s = body(c, d, memb, F('M' + pt(Wr) + tips.map(function (t) { return 'L' + pt(t); }).join('') + 'Z', lt(memb, 0.12), 0.6) + L(bn, dk(memb, 0.3), 1.2), 1.8);
    s += L(bn, OL, 3.6) + L(bn, bone2, 1.6) + limb('M' + pt(S) + 'L' + pt(Wr), bone2, 4);
    return s + P(pd([[Wr[0] - 2, Wr[1]], [Wr[0] - 4, Wr[1] - 7], [Wr[0] + 2, Wr[1] - 1]], true), '#ece4cc', 1.2);
  }
  function wyvern(c, o) {
    var fur = o.fur, mane = o.mane, memb = o.memb, dfur = dk(fur, 0.22), s = shadow(c, 66, 52);
    s += batWing(c, [80, 66], [98, 22], [[124, 6], [126, 32], [118, 54]], [98, 76], dk(memb, 0.2), dfur);
    var tail = 'M100,86 C118,86 126,64 120,46 C116,32 102,26 92,32';
    s += L(tail, OL, 13) + L(tail, fur, 9) + L('M112,80 l5,-4 M121,64 l6,0 M118,46 l5,-4 M106,32 l1,-6', dk(fur, 0.35), 1.6);
    s += P('M95,28 C88,24 80,26 76,32 C82,32 86,36 86,44 C90,40 96,36 95,28 Z', c.cel('#4a3226'), 1.6) + P(pd([[78, 31], [72, 38], [81, 34]], true), '#e8e0cc', 1.2);
    s += limb('M92,94 L97,106 L95,116', dfur, 9.5) + paw(97, 121, dk(fur, 0.3));
    s += limb('M52,94 L56,106 L54,116', dfur, 9.5) + paw(56, 121, dk(fur, 0.3));
    var bd = 'M40,80 C40,66 60,62 80,64 C98,66 108,76 106,88 C104,98 92,100 78,100 L56,100 C44,100 40,92 40,80 Z';
    s += body(c, bd, fur, F('M44,92 C56,100 86,102 104,94 L106,106 L42,106 Z', lt(fur, 0.25), 0.8) + F('M86,60 L110,60 L110,104 L92,104 C102,90 100,72 86,60 Z', dk(fur, 0.25), 0.8) + L('M70,70 Q76,68 82,72 M62,74 Q68,72 72,76', dk(fur, 0.3), 1.2), 2.4);
    var mn = '', k = 14;
    for (var i = 0; i <= k; i++) { var a = Math.PI * 2 * i / k - Math.PI * 0.3, rr = i % 2 ? 15 : 22; mn += (i ? 'L' : 'M') + pt([38 + Math.cos(a) * rr, 72 + Math.sin(a) * rr * 0.95]); }
    s += body(c, mn + 'Z', mane, F('M40,50 L64,50 L64,96 L44,96 Z', dk(mane, 0.25), 0.8), 2);
    s += P('M36,58 C44,48 54,44 62,46 C56,50 48,54 42,62 Z', c.cel('#d8c8a0'), 1.5) + P('M30,60 C34,48 40,42 48,40 C44,46 40,52 38,62 Z', c.cel('#c8b890'), 1.5);
    var fc = 'M38,62 C30,58 20,60 14,66 L6,72 C3,76 4,82 9,84 L22,88 C31,90 40,84 41,76 Z';
    s += body(c, fc, fur, F('M4,78 L22,84 L40,78 L42,92 L4,92 Z', lt(fur, 0.2), 0.85) + F('M30,56 L46,56 L46,90 L32,90 C38,80 36,66 30,56 Z', dk(fur, 0.22), 0.8), 2);
    s += E(6, 75, 2.6, 2, '#2a1a14', 1) + L('M8,83 Q16,86 24,84', OL, 1.5) + P(pd([[12, 84], [10, 76], [15, 83]], true), '#f0e8d0', 1);
    s += gEye(c, 22, 68, 1.9, o.eye || '#ffcc30') + L('M15,64 L28,64', OL, 2.4);
    s += limb('M46,92 L40,106 L38,116', fur, 10.5) + paw(39, 121, dk(fur, 0.15));
    s += limb('M86,96 L81,106 L82,116', fur, 10.5) + paw(83, 121, dk(fur, 0.15));
    s += batWing(c, [62, 70], [70, 16], [[40, 0], [22, 18], [30, 40]], [64, 68], memb, fur);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- goblin machines ----
  function stack(c, x, y, h, soot) { return (soot ? smoke(x + 3, y - h - 6, 0.8, soot, 0.75, 0.6) : '') + R(x, y - h, 7, h, c.cel(IRON), 1.4) + R(x - 1.5, y - h - 4, 10, 5, c.cel(dk(IRON, 0.25)), 1.3); }
  function pistonLeg(c, pts, col, w, foot) {
    var d = pd(pts), s = limb(d, dk(IRON, 0.1), w) + L(d, lt(IRON, 0.25), w * 0.3, 0.6);
    for (var i = 0; i < pts.length - 1; i++) s += C(pts[i][0], pts[i][1], w * 0.62, c.cel(col), 1.4) + C(pts[i][0], pts[i][1], w * 0.2, OL);
    var f = pts[pts.length - 1], fw = foot || 1;
    return s + P(pd([[f[0] + 7 * fw, f[1] - 4], [f[0] + 8 * fw, f[1] + 4], [f[0] - 12 * fw, f[1] + 4], [f[0] - 13 * fw, f[1] + 1], [f[0] - 6 * fw, f[1] - 4]], true), c.cel(dk(col, 0.1)), 1.6) + L('M' + pt([f[0] - 12 * fw, f[1] + 4]) + 'l-3,1', OL, 2);
  }
  function rivets(pts, col) { return pts.map(function (p) { return C(p[0], p[1], 1.2, col || '#f0d890') + C(p[0] + 0.4, p[1] + 0.4, 0.5, OL); }).join(''); }
  function dent(x, y, r, col) { return E(x, y, r, r * 0.7, dk(col, 0.3), 0, 0.8) + L('M' + pt([x - r * 0.8, y + r * 0.4]) + 'Q' + pt([x, y + r * 0.9]) + ' ' + pt([x + r * 0.8, y + r * 0.4]), lt(col, 0.35), 1, 0.8); }
  // crawler track: a stadium-shaped tread belt round road wheels (x0..x1 = belt ends, y0 = top, y1 = ground)
  function tracks(c, x0, x1, y0, y1, nw) {
    var r = (y1 - y0) / 2, cy = y0 + r, s = '';
    var d = 'M' + pt([x0 + r, y0]) + 'L' + pt([x1 - r, y0]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x1 - r, y1]) + 'L' + pt([x0 + r, y1]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x0 + r, y0]) + 'Z';
    var tr = '';
    for (var x = x0 + r; x <= x1 - r + 0.1; x += 5) tr += 'M' + pt([x, y0]) + 'l0,2.6 M' + pt([x, y1]) + 'l0,-2.6';
    s += body(c, d, '#3a3632', L(tr, '#141210', 1.4) + F(pd([[x0, cy + r * 0.3], [x1 + 2, cy + r * 0.3], [x1 + 2, y1 + 2], [x0, y1 + 2]], true), '#000', 0.25), 2.2);
    s += P(pd([[x0 + r * 0.7, y0 + 3.4], [x1 - r * 0.7, y0 + 3.4], [x1 - r * 0.7, y1 - 3.4], [x0 + r * 0.7, y1 - 3.4]], true), '#24211e', 0);
    for (var i = 0; i < nw; i++) {
      var wx = x0 + r + (x1 - x0 - 2 * r) * (nw > 1 ? i / (nw - 1) : 0.5), wr = i === 0 || i === nw - 1 ? r * 0.7 : r * 0.56;
      s += C(wx, cy, wr, c.cel('#6e6a62'), 1.4) + C(wx, cy, wr * 0.42, c.cel('#a8a49a'), 1) + C(wx, cy, wr * 0.14, OL);
    }
    return s;
  }
  // goblin driver seated in an open cab, head and shoulders over the cab wall, hands on the levers
  function driver(c, x, y, o) {
    var sk = '#6aa84a', sh = o.shirt || '#b86a3a', s = '';
    s += body(c, pd([[x - 9, y + 6], [x + 9, y + 6], [x + 10, y + 20], [x - 10, y + 20]], true), sh, F(pd([[x + 3, y + 4], [x + 12, y + 4], [x + 12, y + 22], [x + 4, y + 22]], true), dk(sh, 0.25), 0.8));
    s += limb('M' + pt([x - 6, y + 9]) + 'L' + pt([x - 14, y + 16]), sh, 5.4) + C(x - 15, y + 17, 3, c.cel(sk), 1.6);
    s += G(gobHead(c, x, y - 2, { hat: o.hat || '#e8b830', hatStyle: 'hard', specs: o.specs, grin: o.grin, cigar: o.cigar }), at(0.82, x, y + 4));
    return s;
  }
  // compact harvester: a small tracked logging cart, open cab at the back, one big saw on a boom at the front
  function harvester(c, o) {
    var col = o.col || '#b88a34', rust = '#7a3e1a', s = shadow(c, 66, 46);
    s += stack(c, 96, 70, 20, o.parked ? null : '#6a6868');
    // levers and roll bar behind the driver
    s += limb('M72,80 L70,54 L96,54 L98,80', dk(IRON, 0.1), 3.2);
    s += o.parked ? body(c, 'M76,72 L76,62 C76,58 92,58 92,62 L92,72 Z', '#6a4a2a', '', 1.8) : driver(c, 84, 60, { hat: '#e8b830', grin: true });
    s += L('M68,82 L66,72 M72,82 L71,70', OL, 3.2) + L('M68,82 L66,72 M72,82 L71,70', '#8a8680', 1.4) + C(66, 71, 1.8, '#c8302a', 1) + C(71, 69, 1.8, '#3a6ac8', 1);
    var hull = 'M34,82 L102,82 L104,100 L30,100 L28,92 Z';
    s += body(c, hull, col, F('M86,80 L106,80 L106,102 L88,102 Z', dk(col, 0.3), 0.8) + E(90, 92, 6, 3, rust, 0, 0.7) + E(44, 96, 7, 2.4, rust, 0, 0.7) +
      L('M60,82 L60,100', dk(col, 0.35), 1.2) + rivets([[36, 86], [48, 86], [72, 86], [84, 86], [98, 86]]) + dent(70, 93, 3.4, col), 2.2);
    // low cab wall
    s += body(c, 'M64,70 L100,70 L102,84 L62,84 Z', dk(col, 0.06), F('M88,68 L104,68 L104,86 L90,86 Z', dk(col, 0.3), 0.8) + rivets([[68, 74], [96, 74]]), 2);
    s += hazard(c, 30, 94, 40, 6);
    s += tracks(c, 30, 104, 102, 121, 4);
    // headlamp
    s += C(40, 86, 4, c.cel(IRON), 1.4) + C(40, 86, 2.4, o.parked ? '#3a3632' : '#ffd86a', 1) + (o.parked ? '' : C(40, 86, 9, glow(c, '#ffd86a', 0.55)));
    // boom and saw
    s += limb('M44,88 L26,82', IRON, 6) + limb('M44,96 L26,86', dk(IRON, 0.15), 4) + C(44, 90, 3.4, c.cel(col), 1.3);
    s += sawBlade(c, 18, 82, 17, 0.3);
    if (!o.parked) s += L('M0,68 A20,20 0 0 0 2,98', '#ffffff', 1.6, 0.6) + L('M4,72 A15,15 0 0 0 6,94', '#ffffff', 1, 0.5) + E(16, 121, 10, 2.4, '#d8b878', 0, 0.8) + C(10, 117, 1, '#d8b878') + C(24, 115, 0.8, '#d8b878');
    return o.tf ? G(s, o.tf) : s;
  }
  // heavy shredder: an armoured tracked logging cart, open cab up top with a goblin at the levers, a huge saw on a boom at the front
  function shredder(c, o) {
    var col = o.col || '#e0b030', rust = '#8a4a1e', parked = o.parked, s = shadow(c, 64, 56);
    if (!parked) s += C(64, 70, 70, glow(c, '#ff6a2a', 0.22));
    s += stack(c, 100, 50, 22, parked ? null : '#2a2626') + stack(c, 110, 56, 16, parked ? null : '#3a3434');
    // roll cage over the open cab, driver inside
    s += limb('M64,66 L64,34 L100,34 L102,66', dk(IRON, 0.1), 3.6) + limb('M64,40 L100,40', dk(IRON, 0.25), 2.2);
    if (!parked) s += driver(c, 82, 44, { hat: '#e8b830', shirt: '#7a4a2a', specs: true, cigar: true });
    else s += body(c, 'M72,58 L72,46 C72,42 90,42 90,46 L90,58 Z', '#6a4a2a', L('M76,48 L86,48', '#4a3020', 1.2), 1.8);
    s += L('M70,68 L67,56 M75,68 L74,54', OL, 3.4) + L('M70,68 L67,56 M75,68 L74,54', '#8a8680', 1.6) + C(67, 55, 2, '#c8302a', 1) + C(74, 53, 2, '#3a6ac8', 1);
    // armoured hull with a sloped front plate
    var hull = 'M30,70 L60,62 L104,62 L110,70 L112,98 L22,98 L20,86 Z';
    s += body(c, hull, col, F('M90,58 L114,58 L114,100 L92,100 Z', dk(col, 0.3), 0.8) +
      E(96, 86, 8, 5, rust, 0, parked ? 0.9 : 0.65) + E(36, 92, 9, 3, rust, 0, 0.7) + (parked ? E(56, 80, 10, 6, rust, 0, 0.8) + E(84, 70, 5, 4, rust, 0, 0.8) : '') +
      R(70, 76, 16, 12, c.cel('#8a8680'), 1.2) + rivets([[72, 78], [84, 78], [72, 86], [84, 86]], '#d8d4cc') +
      L('M30,70 L44,90 M60,62 L60,98', dk(col, 0.32), 1.2) + dent(48, 80, 4, col) + dent(100, 74, 3.4, col) +
      rivets([[26, 80], [34, 72], [48, 67], [62, 65], [90, 65], [106, 68], [108, 88]]), 2.6);
    // cab wall
    s += body(c, 'M60,58 L104,58 L106,70 L58,70 Z', dk(col, 0.08), F('M92,56 L108,56 L108,72 L94,72 Z', dk(col, 0.3), 0.8) + rivets([[64, 63], [100, 63]], '#d8d4cc'), 2);
    s += hazard(c, 22, 92, 66, 6);
    s += tracks(c, 18, 114, 99, 122, 5);
    // searchlight
    s += C(34, 76, 5.4, c.cel(IRON), 1.6) + C(34, 76, 3.4, parked ? '#2a2622' : '#ff6a3a', 1) + (parked ? '' : C(34, 76, 14, glow(c, '#ff5a2a', 0.65)));
    // boom arms and the huge saw
    s += limb('M40,80 L24,72', dk(IRON, 0.1), 8) + limb('M40,92 L24,78', dk(IRON, 0.2), 5) + C(40, 84, 4.6, c.cel(col), 1.4);
    s += sawBlade(c, 22, 72, 21, 0.1, parked ? '#9a948a' : '#c8ccd0');
    if (!parked) s += L('M-2,56 A24,24 0 0 0 4,92', '#ffffff', 1.8, 0.6) + L('M3,60 A19,19 0 0 0 8,88', '#ffffff', 1.1, 0.5) + spark4(40, 100, 2.4, '#ffd060') + spark4(4, 50, 2, '#ffd060') + E(20, 121, 12, 2.4, '#d8b878', 0, 0.8);
    return o.tf ? G(s, o.tf) : s;
  }
  function spark4(x, y, r, col) { return F('M' + pt([x, y - r * 2]) + 'L' + pt([x + r * 0.4, y - r * 0.4]) + 'L' + pt([x + r * 2, y]) + 'L' + pt([x + r * 0.4, y + r * 0.4]) + 'L' + pt([x, y + r * 2]) + 'L' + pt([x - r * 0.4, y + r * 0.4]) + 'L' + pt([x - r * 2, y]) + 'L' + pt([x - r * 0.4, y - r * 0.4]) + 'Z', col); }
  // ---- goblin tools ----
  function woodAxe(c, p, ang, sc) {
    var s = limb('M0,10 L0,-36', '#8a5a32', 3.2) + L('M-1,8 L-1,-34', lt('#8a5a32', 0.3), 1, 0.6);
    s += body(c, 'M-2,-26 L-17,-34 C-21,-26 -21,-16 -17,-10 L-2,-18 Z', '#b8bcc0', F('M-17,-34 C-21,-26 -21,-16 -17,-10 L-13,-12 C-16,-18 -16,-26 -13,-32 Z', '#eef2f4', 0.9), 1.8);
    s += R(-3, -32, 6, 16, c.cel('#4a4640'), 1.4);
    return place(s, p, ang, sc);
  }
  function wrench(c, p, ang, sc) {
    var s = P('M-3,12 L-3,-22 L3,-22 L3,12 Z', c.cel('#9a9ea4'), 1.6);
    s += P('M-10,-20 C-13,-30 -9,-40 -3,-42 L-3,-33 L3,-33 L3,-42 C9,-40 13,-30 10,-20 Z', c.cel('#b0b4ba'), 1.8) + L('M-7,-24 C-9,-30 -7,-36 -4,-38', '#ffffff', 1, 0.6);
    s += R(-4, 2, 8, 12, c.cel('#c83a2a'), 1.4);
    return place(s, p, ang, sc);
  }
  function megaphone(c, p) {
    var x = p[0], y = p[1];
    return P(pd([[x + 5, y - 4], [x - 22, y - 13], [x - 22, y + 11], [x + 5, y + 3]], true), c.cel('#e0b030'), 1.8) + L('M' + pt([x - 8, y - 8]) + 'L' + pt([x - 8, y + 6]), '#8a5a1a', 1.4) +
      E(x - 22, y - 1, 3.4, 12, c.cel('#b88020'), 1.6) + E(x - 22, y - 1, 1.8, 9, '#3a2a10') + L('M' + pt([x - 30, y - 12]) + 'Q' + pt([x - 34, y - 1]) + ' ' + pt([x - 30, y + 10]) + 'M' + pt([x - 36, y - 16]) + 'Q' + pt([x - 41, y - 1]) + ' ' + pt([x - 36, y + 14]), '#fff4c0', 1.6, 0.8);
  }
  function flameGun(c, p) {
    var x = p[0], y = p[1];
    return G(flame(c, x - 26, y - 1, 1.3, '#ff6a1a', '#ffe070'), 'rotate(-90 ' + n(x - 26) + ' ' + n(y - 1) + ')') + C(x - 34, y - 1, 16, glow(c, '#ff9a3a', 0.6)) +
      P(pd([[x + 4, y - 3], [x - 20, y - 3], [x - 26, y - 5], [x - 26, y + 3], [x - 20, y + 1], [x + 4, y + 3]], true), c.cel('#6a6660'), 1.6) + R(x - 10, y - 5, 4, 8, c.cel('#c89a3a'), 1);
  }
  // ---- goblin (Deepgold Company) — copy of the shared rig with more hat styles, grin and a free torso ----
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
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    var ho = { skin: sk, hat: o.hat, stripe: o.stripe, hatStyle: o.hatStyle, specs: o.specs, specCol: o.specCol, lens: o.lens, grin: o.grin, cigar: o.cigar, hair: o.hair };
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt || '#4a3420', buckle: o.buckle, glove: o.glove,
      hx: 56, hy: 32, hipY: 86, legW: 10, armW: 8.5, shadowR: 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, ho), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    deepmoss_creeper: function (c) {
      return spider(c, {
        col: '#6a5a38', mark: '#c8c07a', eye: '#ffb030', hairy: true,
        onAb: function (c) {
          var s = '';
          [[66, 60, 6], [72, 51, 7], [84, 45, 8], [98, 45, 7], [110, 51, 7], [119, 61, 5.5], [80, 55, 5], [94, 52, 5], [106, 58, 4.5]].forEach(function (m, i) { s += C(m[0], m[1], m[2], c.cel(i % 3 === 1 ? '#7aa844' : '#6a9a3a'), 1.4) + C(m[0] - m[2] * 0.3, m[1] - m[2] * 0.35, m[2] * 0.3, '#a8d070', 0, 0.8); });
          s += L('M72,98 L71,106 M90,102 L91,110 M108,96 L110,103', OL, 3.4) + L('M72,98 L71,106 M90,102 L91,110 M108,96 L110,103', '#6a9a3a', 1.8);
          return s + C(102, 44, 1.6, '#f0e070') + C(88, 42, 1.3, '#f0e070');
        }
      });
    },
    deepmoss_venomspitter: function (c) {
      var v = '#9aff4a';
      return spider(c, {
        col: '#3e4a30', mark: '#a8e05a', eye: v,
        back: function (c) { return C(64, 86, 62, glow(c, v, 0.18)); },
        onAb: function (c) {
          var s = '';
          [[84, 97, 9, 7], [106, 92, 8, 6], [96, 58, 5, 4], [110, 66, 4, 3.4]].forEach(function (b) { s += E(b[0], b[1], b[2] * 2, b[3] * 2, glow(c, v, 0.55)) + E(b[0], b[1], b[2], b[3], c.rg([[0, '#f4ffd0'], [0.5, v], [1, '#4a9a1a']]), 1.6) + E(b[0] - b[2] * 0.3, b[1] - b[3] * 0.4, b[2] * 0.3, b[3] * 0.25, '#ffffff', 0, 0.8); });
          return s;
        },
        front: function (c) {
          return E(28, 121, 12, 2.6, glow(c, v, 0.7)) + drop(25, 113, 2.2, v) + drop(35, 116, 1.8, v) + drop(28, 120.5, 1.2, v) + C(12, 90, 12, glow(c, v, 0.7)) + C(12, 90, 4.4, c.rg([[0, '#ffffff'], [0.5, v], [1, '#4a9a1a']]), 1.4) + L('M17,92 Q21,94 24,97', v, 2, 0.8);
        }
      });
    },
    venture_logger: function (c) {
      return gob(c, {
        skin: '#6aa84a', shirt: '#a8402a', sleeve: '#a8402a', pants: '#6a4e34', hat: '#e8b830', stripe: '#7a4a24', boots: '#3a2818', belt: '#3a2418', glove: '#c8a060',
        chest: function () { return L('M46,60 L82,60 M46,70 L82,70 M46,80 L82,80 M56,50 L56,88 M68,50 L68,88', '#5a1a14', 1.4, 0.8) + L('M54,48 L54,88 M72,48 L72,88', '#e0b030', 3.4); },
        near: [[48, 56], [38, 46], [32, 34]],
        wNear: function (c, p) { return woodAxe(c, p, 24, 1.3); }
      });
    },
    venture_deforester: function (c) {
      return gob(c, {
        skin: '#5e9a44', shirt: '#6e6454', sleeve: '#6e6454', pants: '#4a4238', hat: '#4a3424', hatStyle: 'cap', specs: true, specCol: '#8a8680', lens: '#ffb040', boots: '#2a2018', belt: '#2a1a10', glove: '#3a2a1e',
        back: function (c) {
          return body(c, 'M68,34 C68,28 90,28 90,34 L90,80 C90,86 68,86 68,80 Z', '#b83a2a', hazard(c, 68, 50, 22, 6) + F('M82,28 L92,28 L92,88 L84,88 Z', dk('#b83a2a', 0.3), 0.8) + E(74, 40, 2, 6, '#ffffff', 0, 0.4), 2) +
            C(79, 30, 3.4, c.cel('#c89a3a'), 1.4) + L('M86,82 C88,98 60,100 44,86', OL, 5) + L('M86,82 C88,98 60,100 44,86', '#3a3632', 2.8);
        },
        chest: function () { return F('M50,54 L78,54 L76,88 L52,88 Z', '#8a7a5a') + L('M50,54 L78,54', '#3a2a1e', 1.4) + L('M62,48 L62,56', '#3a2a1e', 2); },
        near: [[48, 56], [40, 70], [36, 78]],
        wNearFront: function (c, p) { return flameGun(c, [p[0], p[1] - 2]); }
      });
    },
    venture_operator: function (c) {
      return gob(c, {
        skin: '#78b458', shirt: '#8a6a3a', sleeve: '#8a6a3a', pants: '#8a6a3a', hatStyle: 'none', hair: '#d8d0b8', specs: true, specCol: '#c89a3a', lens: '#9ae8f4', boots: '#3a2a20', belt: '#4a3020', buckle: '#c8c4bc', glove: '#e0b030',
        chest: function () { return R(56, 58, 14, 10, '#e0b030', 1) + L('M59,62 L67,62 M59,65 L65,65', '#8a5a1a', 1) + L('M52,48 L52,88 M76,48 L76,88', '#6a4e2a', 2) + C(52, 54, 1.4, '#c8c4bc') + C(76, 54, 1.4, '#c8c4bc'); },
        front: function (c) { return R(46, 82, 6, 8, c.cel('#6a6660'), 1) + R(74, 82, 5, 9, c.cel('#c83a2a'), 1) + L('M70,84 L70,94', OL, 2.4) + L('M70,84 L70,94', '#9a9ea4', 1.2); },
        near: [[48, 56], [38, 44], [32, 32]],
        wNear: function (c, p) { return wrench(c, p, -16, 1.2); },
        far: [[80, 56], [88, 68], [90, 80]],
        wFar: function (c, p) { return gear(c, p[0] + 3, p[1] + 4, 6, '#9a9ea4'); }
      });
    },
    compact_harvester: function (c) { return harvester(c, { tf: at(0.86, 64, 122) }); },
    bloodfury_harpy: function (c) {
      return harpy(c, { fe: '#9a3a24', tip: '#d8a060', hair: '#5a1a14', skin: '#d8a888', eye: '#ffd040', tf: at(0.92, 64, 122) });
    },
    bloodfury_storm_witch: function (c) {
      var bl = '#7fd0ff';
      return harpy(c, {
        tf: at(0.92, 64, 122), fe: '#4e4a6e', fe2: '#3a3858', tip: '#8ab8e8', hair: '#c8dcf4', skin: '#c8a8b0', eye: '#dff4ff', eyeGlow: bl, bodice: '#3a3858', leg: '#b8a878',
        back: function (c) { return C(40, 50, 60, glow(c, '#6aa8ff', 0.26)); },
        crest: function (c, x, y) { return feathers(x + 4, y - 14, ['#3a3858', '#8ab8e8', '#4e4a6e'], 1.1, 2.6); },
        nearWing: { S: [47, 52], Wr: [22, 44], D: [-0.05, 1], len: 34 },
        farWing: { S: [72, 46], Wr: [96, 10], D: [0.4, 1], len: 36 },
        neck: function () { return L('M52,48 Q60,54 68,48', '#e8e0cc', 1.4) + C(60, 52, 2, '#7fd0ff', 1); },
        front: function (c) {
          return orb(c, 18, 36, 5.4, bl) + arc('M18,36 L24,24 L20,20 L30,10 L36,14 L44,4', 1) + arc('M18,36 L8,40 L10,46 L2,52', 0.8) + arc('M98,12 L108,20 L104,24 L118,30', 0.8) + spark(24, 60, 0.8, '#9fe0ff') + spark(118, 50, 0.7, '#9fe0ff') + spark(32, 30, 0.6, '#ffffff');
        }
      });
    },
    blackened_basilisk: function (c) {
      return basilisk(c, { col: '#2e2a2c', belly: '#48403e', glow: '#ff8a2a', spine: '#1c1a1c', spineTip: '#ff9a3a', eye: '#ffb040' });
    },
    grimtotem_brute: function (c) {
      var fur = '#5e5250';
      return tauren(c, {
        fur: fur, hair: '#221c1c', horn: '#d8ccb0', paint: '#1a2a44', loin: '#3a4a5a', belt: '#3a2a20', buckle: '#8a2a2a',
        pads: function (c) { return body(c, 'M30,48 C30,38 48,36 56,44 L54,56 C46,54 36,56 30,56 Z', '#4a5a6a', L('M34,46 L50,46', '#2a3440', 1.4), 2) + P('M34,42 L28,30 L40,40 Z', c.cel('#e8e0cc'), 1.3) + P('M44,40 L44,28 L50,40 Z', c.cel('#e8e0cc'), 1.3); },
        chest: function () { return L('M52,70 L72,74 M54,78 L74,82', '#1a2a44', 2.4) + L('M66,50 L50,90', '#3a2a20', 4); },
        near: [[46, 56], [30, 66], [17, 74]],
        wNear: function (c, p) { return totemClub(c, p, -6, 0.86); }
      });
    },
    grimtotem_mystic: function (c) {
      var fur = '#6e6260';
      return tauren(c, {
        fur: fur, hair: '#2a2426', horn: '#c8bca4', mask: true, eyeCol: '#6ab0ff', loin: '#2a3a5a', belt: '#2a2020', buckle: '#6ab0ff',
        back: function (c) { return C(60, 60, 66, glow(c, '#3a5aff', 0.28)); },
        pads: function (c) { return body(c, 'M28,50 C26,38 50,34 58,46 L56,58 C46,56 36,58 28,58 Z', '#2a3a5a', L('M32,52 Q42,48 54,52', '#6ab0ff', 1.2, 0.8), 2) + feathers(34, 56, ['#2a3a5a', '#e8e0cc', '#1a2438'], 0.8, -0.2); },
        chest: function () { return boneNeck(58, 52); },
        front: function (c) { return body(c, 'M50,86 L80,86 L82,114 L72,109 L66,116 L60,109 L50,114 Z', '#2a3a5a', L('M52,94 L80,94', '#6ab0ff', 1.4, 0.8) + P('M62,98 L66,104 L70,98 Z', '#e8e0cc', 0.8) + F('M68,84 L86,84 L86,118 L72,118 Z', '#1a2438', 0.7), 2); },
        near: [[46, 56], [32, 68], [20, 78]],
        wNear: function (c, p) { return spiritStaff(c, p); },
        far: [[84, 52], [98, 42], [102, 28]],
        wFar: function (c, p) { return vglow(c, p[0], p[1] - 8, 20, '#6ab0ff', 0.7) + flame(c, p[0], p[1] - 4, 0.9, '#3a6ae8', '#cfe6ff'); }
      });
    },
    pridewing_wyvern: function (c) { return wyvern(c, { fur: '#c8904a', mane: '#7a4424', memb: '#8a4a2e' }); },
    xt9: function (c) { return shredder(c, { col: '#e0b030' }); },
    sister_riven: function (c) {
      return harpy(c, {
        fe: '#f0ece4', fe2: '#d0cabe', tip: '#c8bca8', hair: '#4a2a44', skin: '#e0b098', eye: '#ffe060', bodice: '#e8e2d6', leg: '#e0c070', tf: at(1.0, 64, 122),
        back: function (c) { return C(60, 40, 60, glow(c, '#fff4c0', 0.3)); },
        farWing: { S: [72, 46], Wr: [96, 10], D: [0.45, 1], len: 36 },
        nearWing: { S: [47, 50], Wr: [24, 12], D: [-0.2, 1], len: 40 },
        neck: function (c) { return L('M50,48 Q60,56 70,48', '#c89a2a', 2) + C(60, 53, 2.6, c.cel('#d83a2a'), 1.2) + C(54, 51, 1.3, '#f0c040') + C(66, 51, 1.3, '#f0c040'); },
        top: function (c) {
          return feathers(58, 16, ['#d83a2a', '#f4f0e8', '#d8a040', '#f4f0e8', '#d83a2a'], 1.35, 2.35) + body(c, 'M44,20 C50,14 64,14 70,18 L70,23 C62,20 52,20 45,25 Z', '#d8a830', C(56, 18, 2.2, '#2f9ab8', 1), 1.5);
        }
      });
    },
    foreman_rigger: function (c) {
      return gob(c, {
        skin: '#6aa04a', shirt: '#e8e0d0', sleeve: '#e8e0d0', pants: '#5a4430', hat: '#f0ece0', stripe: '#d8a830', grin: true, cigar: true, boots: '#2a1a10', belt: '#2a1a10', buckle: '#ffd040', glove: '#6aa04a',
        torsoD: 'M44,52 C50,46 78,46 84,52 C92,62 92,80 82,90 L48,90 C40,80 38,62 44,52 Z',
        chest: function () { return F('M44,52 L56,50 L58,90 L46,90 C40,80 40,62 44,52 Z', '#6a4a2a') + F('M72,50 L84,52 C92,62 92,80 82,90 L70,90 Z', '#6a4a2a') + P('M61,50 L66,50 L67,74 L63.5,79 L60,74 Z', '#b82a2a', 1) + C(58, 70, 1.3, '#ffd040') + C(58, 80, 1.3, '#ffd040'); },
        near: [[48, 56], [38, 52], [30, 46]],
        wNearFront: function (c, p) { return megaphone(c, p); },
        far: [[80, 56], [90, 66], [88, 80]],
        wFar: function (c, p) { return R(p[0] - 4, p[1] - 16, 16, 20, c.cel('#a87a44'), 1.4) + R(p[0] - 2, p[1] - 13, 12, 15, '#f0ece0', 0.8) + L('M' + pt([p[0], p[1] - 9]) + 'l8,0 M' + pt([p[0], p[1] - 5]) + 'l8,0 M' + pt([p[0], p[1] - 1]) + 'l6,0', '#6a6a6a', 1); },
        scale: 0.9
      });
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#8a8298'), 2.5); }
  function phScene(c) { return stSky(c) + ground(c, 150, MOSS, '#4a5634'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#8a8298"/></svg>'; }
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
