/* art_scarlet.js — Scarlet Monastery art for Azeroth Solo (dungeon, levels 33-40: the fortress-abbey of the Scarlet
 * Crusade in north-east Tirisfal; the gate outside, the Library and the Cathedral, its monks, chaplains, myrmidons,
 * abbots, champions and wizards, and the bosses Interrogator Vishas, Houndmaster Loksey, Arcanist Doan, Herod,
 * High Inquisitor Fairbanks, Scarlet Commander Mograine and High Inquisitor Whitemane).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Scarlet Monastery keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_stranglethorn.js (the rig gains
 * optional legF/legN/footF/footN for wide stances). The monastery head, robes, plate and the gold sunburst-and-flame
 * sigil of the order are new here; the look carries on from the scarlet_* mobs of art_tirisfal.js (red and white,
 * flame crest) and adds gold trim for the higher ranks.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix sm<counter>_).
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
  function Ctx() { this.p = 'sm' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  SCENE PIECES (shared house style, copies of art_stranglethorn.js)
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
  function deadTree(c, x, y, s, col) {
    col = col || '#3a3228';
    var o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.25);
    o += limb('M' + pt([x, y]) + 'C' + pt([x - 2 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 34 * s]) + ' ' + pt([x + 1 * s, y - 50 * s]), col, 5 * s);
    o += limb('M' + pt([x + 1 * s, y - 30 * s]) + 'C' + pt([x - 8 * s, y - 36 * s]) + ' ' + pt([x - 14 * s, y - 44 * s]) + ' ' + pt([x - 20 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'C' + pt([x + 10 * s, y - 44 * s]) + ' ' + pt([x + 16 * s, y - 52 * s]) + ' ' + pt([x + 18 * s, y - 62 * s]), col, 2.8 * s);
    o += limb('M' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 56 * s]) + 'M' + pt([x + 12 * s, y - 50 * s]) + 'L' + pt([x + 22 * s, y - 52 * s]) + 'M' + pt([x + 1 * s, y - 50 * s]) + 'L' + pt([x - 3 * s, y - 60 * s]), col, 1.6 * s);
    return o + L('M' + pt([x + 1.5 * s, y - 4 * s]) + 'C' + pt([x + 1 * s, y - 20 * s]) + ' ' + pt([x + 4 * s, y - 32 * s]) + ' ' + pt([x + 2 * s, y - 46 * s]), lt(col, 0.18), 1.4 * s, 0.7);
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
  function crenels(c, x0, x1, y, col, mw) {
    mw = mw || 6; var o = '';
    for (var x = x0; x < x1 - 1; x += mw * 2) o += R(x, y - mw, mw, mw + 1, c.cel(col), 1.3);
    return o;
  }
  function stoneFace(c, x, y, w, h, col, js, top) {
    // top: optional list of [dx, dy] points (relative to x, y-h) replacing the flat top edge, for broken walls
    var d = top ? 'M' + pt([x, y]) + 'L' + pt([x + w, y]) + top.slice().reverse().map(function (q) { return 'L' + pt([x + q[0], y - h + q[1]]); }).join('') + 'Z' : pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true);
    var jn = ''; js = js || 7;
    for (var j = 1; j < h / js; j++) { var jy = y - j * js; jn += 'M' + pt([x, jy]) + 'L' + pt([x + w, jy]); for (var q = 0; q < w / 12; q++) jn += 'M' + pt([x + q * 12 + (j % 2 ? 6 : 0), jy]) + 'l0,' + n(js); }
    return body(c, d, col, L(jn, dk(col, 0.28), 0.8, 0.8) + F(pd([[x + w * 0.62, y - h - 30], [x + w + 2, y - h - 30], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(col, 0.25), 0.7), 1.8);
  }
  function arrowSlit(x, y, col) { return R(x - 1.6, y - 6, 3.2, 12, col || '#12100e', 0.8); }
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
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

  // ============================================================
  //  THE ORDER: palette + sigil
  // ============================================================
  var RED = '#b81e1e', REDD = '#7a1012', WHT = '#f0ece2', GOLD = '#e2b23c', GOLDD = '#a8781e', STEEL = '#b8bec8', DSTEEL = '#7e8490', LEATH = '#6a4228';
  var HOLY = '#ffe28a', FIRE = '#ff7a1a', ARC = '#8ab8ff', STONE = '#d8d2c6', SLATE = '#4a5262';
  function flameD(x, y, k) {
    return 'M' + pt([x, y + 5 * k]) + 'C' + pt([x - 5 * k, y + 5 * k]) + ' ' + pt([x - 5.2 * k, y - 1 * k]) + ' ' + pt([x - 2.6 * k, y - 4.2 * k]) + 'C' + pt([x - 2.4 * k, y - 1.6 * k]) + ' ' + pt([x - 1.2 * k, y - 1 * k]) + ' ' + pt([x - 0.7 * k, y - 1.3 * k]) +
      'C' + pt([x - 1.8 * k, y - 4.2 * k]) + ' ' + pt([x - 0.6 * k, y - 6.4 * k]) + ' ' + pt([x + 0.6 * k, y - 8.4 * k]) + 'C' + pt([x + 1.6 * k, y - 5.8 * k]) + ' ' + pt([x + 3.6 * k, y - 4.2 * k]) + ' ' + pt([x + 2.2 * k, y - 0.9 * k]) +
      'C' + pt([x + 3 * k, y - 1.6 * k]) + ' ' + pt([x + 3.6 * k, y - 2.6 * k]) + ' ' + pt([x + 3.8 * k, y - 3.6 * k]) + 'C' + pt([x + 5.8 * k, y - 1 * k]) + ' ' + pt([x + 5.2 * k, y + 5 * k]) + ' ' + pt([x, y + 5 * k]) + 'Z';
  }
  // the order's sigil: a gold sunburst of twelve rays with a flame on its heart (original design)
  function sigil(c, x, y, k, flameCol, rayCol) {
    rayCol = rayCol || GOLD; var d = '';
    for (var i = 0; i < 12; i++) {
      var a = -PI / 2 + i * PI / 6, r = (i % 2 ? 7.4 : 10.6) * k, w = i % 2 ? 0.2 : 0.17, r0 = 4.4 * k;
      d += 'M' + pt([x + Math.cos(a - w) * r0, y + Math.sin(a - w) * r0]) + 'L' + pt([x + Math.cos(a) * r, y + Math.sin(a) * r]) + 'L' + pt([x + Math.cos(a + w) * r0, y + Math.sin(a + w) * r0]) + 'Z';
    }
    return P(d, rayCol, 0.9 * k) + C(x, y, 5.6 * k, c.cel(rayCol), 1.1 * k) + P(flameD(x, y + 0.6 * k, 0.62 * k), flameCol || RED, 0.7 * k);
  }

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  function candelabra(c, x, y, s) {
    var o = C(x, y - 20 * s, 26 * s, glow(c, '#ffc860', 0.45)), g = '#c8a048';
    o += limb('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]) + 'M' + pt([x - 9 * s, y - 12 * s]) + 'Q' + pt([x, y - 6 * s]) + ' ' + pt([x + 9 * s, y - 12 * s]), g, 1.6 * s) + P(pd([[x - 5 * s, y], [x + 5 * s, y], [x + 2 * s, y - 3 * s], [x - 2 * s, y - 3 * s]], true), c.cel(g), 1 * s);
    [-9, 0, 9].forEach(function (dx) { var cy = y - (dx ? 12 : 16) * s; o += R(x + dx * s - 1.6 * s, cy - 7 * s, 3.2 * s, 7 * s, '#f0e8d0', 0.9 * s) + flame(c, x + dx * s, cy - 7 * s, 0.32 * s); });
    return o;
  }
  // tall standing candelabrum on a tripod foot
  function standCandle(c, x, y, h, s) {
    var g = '#c8a048', top = y - h, o = E(x, y + 1, 10 * s, 2.4 * s, '#000', 0, 0.3) + C(x, top - 8 * s, 34 * s, glow(c, '#ffc860', 0.4));
    o += limb('M' + pt([x - 7 * s, y]) + 'L' + pt([x, y - 8 * s]) + 'L' + pt([x + 7 * s, y]) + 'M' + pt([x, y - 8 * s]) + 'L' + pt([x, top]), g, 1.8 * s);
    o += C(x, y - h * 0.5, 2.2 * s, c.cel(g), 1 * s);
    return o + candelabra(c, x, top + 1, s);
  }
  function banner(c, x, y, w, h, col, trim, k) {
    col = col || RED; trim = trim || GOLD; k = k || 1;
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h - w * 0.4], [x - w / 2, y + h]], true);
    var o = limb('M' + pt([x - w / 2 - 4, y]) + 'L' + pt([x + w / 2 + 4, y]), '#8a6a2a', 2.2) + C(x - w / 2 - 4, y, 2, GOLD, 1) + C(x + w / 2 + 4, y, 2, GOLD, 1);
    o += body(c, d, col, F(pd([[x + w * 0.18, y - 2], [x + w / 2 + 2, y - 2], [x + w / 2 + 2, y + h + 2], [x + w * 0.18, y + h - w * 0.3]], true), dk(col, 0.35), 0.6) +
      L(pd([[x - w / 2 + 2.4, y + 1], [x - w / 2 + 2.4, y + h - 3], [x, y + h - w * 0.4 - 2.4], [x + w / 2 - 2.4, y + h - 3], [x + w / 2 - 2.4, y + 1]]), trim, 1.6), 1.6);
    return o + sigil(c, x, y + h * 0.36, w / 26 * k, WHT);
  }
  function pillar(c, x, w, y0, y1, col) {
    col = col || STONE;
    var o = R(x - w / 2, y0, w, y1 - y0, c.lg([[0, lt(col, 0.1)], [0.35, col], [0.6, col], [0.61, dk(col, 0.2)], [1, dk(col, 0.34)]], 0, 0, 1, 0));
    o += L('M' + pt([x - w / 2, y0]) + 'L' + pt([x - w / 2, y1]) + 'M' + pt([x + w / 2, y0]) + 'L' + pt([x + w / 2, y1]), OL, 1.8);
    o += L('M' + pt([x - w * 0.18, y0]) + 'L' + pt([x - w * 0.18, y1]) + 'M' + pt([x + w * 0.18, y0]) + 'L' + pt([x + w * 0.18, y1]), dk(col, 0.22), 1, 0.7);
    o += R(x - w / 2 - 4, y1 - 8, w + 8, 8, c.cel(col), 1.6) + R(x - w / 2 - 2, y1 - 13, w + 4, 5, c.cel(lt(col, 0.05)), 1.4);
    return o;
  }
  // leaded glass inside a pointed arch, with the sigil in the middle
  function stainedGlass(c, x, yb, w, h, seed, noSigil) {
    var r = rng(seed || 9), top = yb - h;
    var arch = 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.55]) + 'Q' + pt([x - w / 2, top + w * 0.05]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top + w * 0.05]) + ' ' + pt([x + w / 2, top + w * 0.55]) + 'L' + pt([x + w / 2, yb]) + 'Z';
    var cols = ['#c8282a', '#e8b83a', '#2a5ab8', '#3a8a5a', '#a82a8a', '#e86a2a', '#f0e0a0'], panes = '', lead = '';
    var cw = w / 4, ch = cw * 1.25;
    for (var yy = top - 2; yy < yb; yy += ch) for (var xx = x - w / 2; xx < x + w / 2; xx += cw) {
      var col = cols[Math.floor(r() * cols.length)];
      panes += R(xx, yy, cw, ch, col, 0);
      lead += 'M' + pt([xx, yy]) + 'L' + pt([xx + cw, yy + ch]);
    }
    for (var gy = top; gy < yb; gy += ch) lead += 'M' + pt([x - w / 2, gy]) + 'L' + pt([x + w / 2, gy]);
    for (var gx = x - w / 2 + cw; gx < x + w / 2 - 1; gx += cw) lead += 'M' + pt([gx, top]) + 'L' + pt([gx, yb]);
    var id = c.clip(arch);
    var o = P(arch, '#2a2420', 0) + '<g clip-path="url(#' + id + ')">' + panes + R(x - w / 2, top, w, h, c.lg([[0, '#fff8e0', 0.35], [0.5, '#fff8e0', 0.08], [1, '#000', 0.25]]), 0) + L(lead, '#2a2020', 1.2, 0.9) +
      (noSigil ? '' : C(x, top + h * 0.42, w * 0.3, '#fff4c8', 0, 0.35) + sigil(c, x, top + h * 0.42, w / 34, RED)) + '</g>';
    return o + L(arch, OL, 2.2);
  }
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.55]) + 'Q' + pt([x - w / 2, top + w * 0.05]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top + w * 0.05]) + ' ' + pt([x + w / 2, top + w * 0.55]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }
  function bookshelf(c, x, w, y0, y1, seed) {
    var r = rng(seed || 3), wood = '#5a3620', o = P(pd([[x, y1], [x, y0], [x + w, y0], [x + w, y1]], true), c.cel(wood), 1.8), sh = 15;
    o += R(x + 3, y0 + 4, w - 6, y1 - y0 - 8, '#1e140e', 0);
    var bc = ['#8a1e1e', '#a82a22', '#5a3a22', '#2e4a6a', '#3a5a3a', '#b8903a', '#6a2a4a', '#c8b88a', '#4a2a1a'];
    for (var yy = y0 + 4 + sh; yy <= y1 - 3; yy += sh) {
      var bx = x + 4;
      while (bx < x + w - 6) {
        var bw = 2.6 + r() * 2.8, bh = sh - 3 - r() * 4, col = bc[Math.floor(r() * bc.length)];
        if (r() < 0.08) { o += P(pd([[bx, yy], [bx + bh * 0.5, yy - bh * 0.9], [bx + bh * 0.5 + bw, yy - bh * 0.9 + 1], [bx + bw, yy]], true), col, 0.7); bx += bw + bh * 0.5 + 1; continue; }
        o += R(bx, yy - bh, bw, bh, col, 0.7) + (r() < 0.5 ? L('M' + pt([bx + 0.4, yy - bh * 0.7]) + 'l' + n(bw - 0.8) + ',0', GOLD, 0.7, 0.8) : '');
        bx += bw + 0.3;
      }
      o += R(x + 2, yy, w - 4, 3, c.cel('#6e4428'), 1);
    }
    o += R(x - 2, y0 - 4, w + 4, 6, c.cel('#6e4428'), 1.6);
    return o + F(pd([[x + w * 0.7, y0], [x + w, y0], [x + w, y1], [x + w * 0.7, y1]], true), '#000', 0.22);
  }
  function openBook(c, x, y, s, glowCol) {
    var o = glowCol ? C(x, y - 2 * s, 16 * s, glow(c, glowCol, 0.55)) : '';
    o += P(pd([[x - 11 * s, y + 1 * s], [x, y + 3 * s], [x + 11 * s, y + 1 * s], [x + 10 * s, y - 4 * s], [x, y - 2 * s], [x - 10 * s, y - 4 * s]], true), c.cel('#6a1a1a'), 1.1 * s);
    o += P('M' + pt([x, y - 2 * s]) + 'Q' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 10 * s, y - 4.4 * s]) + 'L' + pt([x - 10 * s, y]) + 'Q' + pt([x - 5 * s, y - 2 * s]) + ' ' + pt([x, y + 1.6 * s]) + 'Z', '#f4ecd4', 0.9 * s);
    o += P('M' + pt([x, y - 2 * s]) + 'Q' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 10 * s, y - 4.4 * s]) + 'L' + pt([x + 10 * s, y]) + 'Q' + pt([x + 5 * s, y - 2 * s]) + ' ' + pt([x, y + 1.6 * s]) + 'Z', '#e4dcc0', 0.9 * s);
    return o + L('M' + pt([x - 8 * s, y - 3 * s]) + 'l5,1 M' + pt([x - 8 * s, y - 1.4 * s]) + 'l5,1 M' + pt([x + 3 * s, y - 2 * s]) + 'l5,-1 M' + pt([x + 3 * s, y - 0.4 * s]) + 'l5,-1', glowCol || '#6a5a4a', 0.7 * s, 0.8);
  }
  function bookPile(c, x, y, s, seed) {
    var r = rng(seed || 5), o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.3), yy = y, bc = ['#8a1e1e', '#2e4a6a', '#5a3a22', '#3a5a3a', '#b8903a'];
    for (var i = 0; i < 4; i++) { var w = (22 - i * 2 + r() * 4) * s, dx = (r() - 0.5) * 5 * s, col = bc[Math.floor(r() * bc.length)]; o += R(x - w / 2 + dx, yy - 5 * s, w, 5 * s, c.cel(col), 1.1 * s) + R(x - w / 2 + dx + 2 * s, yy - 4 * s, w - 4 * s, 1.4 * s, '#f0e8d0', 0, 0.8); yy -= 5 * s; }
    return o;
  }
  function readingTable(c, x0, x1, y, s, seed) {
    var o = E((x0 + x1) / 2, y + 2, (x1 - x0) * 0.56, 3, '#000', 0, 0.3), wood = '#6a4028';
    o += limb('M' + pt([x0 + 4, y - 12 * s]) + 'L' + pt([x0 + 4, y]) + 'M' + pt([x1 - 4, y - 12 * s]) + 'L' + pt([x1 - 4, y]), dk(wood, 0.2), 2.6 * s);
    o += P(pd([[x0, y - 12 * s], [x1, y - 12 * s], [x1 - 2, y - 16 * s], [x0 + 2, y - 16 * s]], true), c.cel(lt(wood, 0.12)), 1.4) + R(x0, y - 12 * s, x1 - x0, 3 * s, c.cel(wood), 1.2);
    return o + openBook(c, x0 + (x1 - x0) * 0.3, y - 16 * s, 0.7 * s) + bookPile(c, x0 + (x1 - x0) * 0.72, y - 15 * s, 0.5 * s, seed) + candelabra(c, x0 + (x1 - x0) * 0.52, y - 16 * s, 0.7 * s);
  }
  function pew(c, x0, x1, y, s) {
    var wood = '#5a3420', o = E((x0 + x1) / 2, y + 1, (x1 - x0) * 0.55, 2.4 * s, '#000', 0, 0.3);
    o += P(pd([[x0, y - 8 * s], [x1, y - 8 * s], [x1, y - 20 * s], [x0, y - 20 * s]], true), c.cel(dk(wood, 0.1)), 1.2 * s);
    o += R(x0 - 1, y - 8 * s, x1 - x0 + 2, 3 * s, c.cel(lt(wood, 0.1)), 1.1 * s);
    o += limb('M' + pt([x0 + 2, y - 7 * s]) + 'L' + pt([x0 + 2, y]) + 'M' + pt([x1 - 2, y - 7 * s]) + 'L' + pt([x1 - 2, y]), dk(wood, 0.3), 1.6 * s);
    return o + P(pd([[x0 - 2, y], [x0 - 2, y - 22 * s], [x0 + 3, y - 24 * s], [x0 + 3, y]], true), c.cel(wood), 1.1 * s) + P(pd([[x1 - 3, y], [x1 - 3, y - 24 * s], [x1 + 2, y - 22 * s], [x1 + 2, y]], true), c.cel(wood), 1.1 * s);
  }
  function lightShaft(c, x0, x1, y0, x2, x3, y1, col, op) { return F(pd([[x0, y0], [x1, y0], [x3, y1], [x2, y1]], true), c.lg([[0, col, op], [1, col, 0]])); }
  // conical slate roof with a gold finial
  function spireRoof(c, x, y, w, h, col) {
    col = col || SLATE;
    var d = pd([[x - w / 2 - 3, y], [x, y - h], [x + w / 2 + 3, y]], true), tl = '';
    for (var i = 1; i < 5; i++) { var t = i / 5; tl += 'M' + pt([x - (w / 2 + 3) * t, y - h + h * t]) + 'L' + pt([x + (w / 2 + 3) * t, y - h + h * t]); }
    return body(c, d, col, F(pd([[x, y - h - 2], [x + w / 2 + 6, y + 2], [x + 1, y + 2]], true), dk(col, 0.3), 0.8) + L(tl, dk(col, 0.35), 0.9, 0.8), 1.7) +
      limb('M' + pt([x, y - h]) + 'L' + pt([x, y - h - 7]), GOLD, 1.2) + C(x, y - h - 8, 2, GOLD, 1);
  }
  function tower(c, x, yb, w, h, roofH, seed, lit) {
    var o = stoneFace(c, x - w / 2, yb, w, h, STONE, 8) + crenels(c, x - w / 2 - 2, x + w / 2 + 3, yb - h, STONE, 5);
    o += archWin(x, yb - h * 0.62, 7, 13, lit ? '#ffc860' : '#1e1a20', 1.4) + (lit ? C(x, yb - h * 0.62 - 6, 10, glow(c, '#ffc860', 0.4)) : '');
    o += archWin(x, yb - h * 0.3, 6, 10, '#1e1a20', 1.2);
    return o + spireRoof(c, x, yb - h - 5, w, roofH);
  }
  function gate(c, x, yb, w, h) {
    var arch = arched(x, yb, w + 10, h + 10), door = arched(x, yb, w, h), o = P(arch, c.cel(lt(STONE, 0.1)), 1.8);
    for (var i = 0; i < 7; i++) { var a = PI + PI * i / 6, rr = w / 2 + 5; o += L('M' + pt([x + Math.cos(a) * (w / 2), yb - h + w / 2 + Math.sin(a) * (w / 2) * 0.9]) + 'L' + pt([x + Math.cos(a) * rr, yb - h + w / 2 + Math.sin(a) * rr * 0.95]), dk(STONE, 0.3), 1); }
    var dd = '', st = '';
    for (var j = 1; j < 6; j++) dd += 'M' + pt([x - w / 2 + w * j / 6, yb - h - 2]) + 'L' + pt([x - w / 2 + w * j / 6, yb]);
    for (var k = 0; k < 4; k++) for (var m = 0; m < 5; m++) st += C(x - w / 2 + w * (m + 0.8) / 6 + (m > 1 ? w / 6 : 0), yb - h * (0.2 + k * 0.2), 1, GOLD, 0);
    o += body(c, door, '#5a2e1a', L(dd, '#3a1c10', 1.4) + L('M' + pt([x - w / 2, yb - h * 0.3]) + 'L' + pt([x + w / 2, yb - h * 0.3]) + 'M' + pt([x - w / 2, yb - h * 0.62]) + 'L' + pt([x + w / 2, yb - h * 0.62]), '#2e2a2a', 2.6) + st + L('M' + pt([x, yb - h]) + 'L' + pt([x, yb]), OL, 1.6) + F(pd([[x + 2, yb - h - 4], [x + w / 2 + 2, yb - h - 4], [x + w / 2 + 2, yb], [x + 2, yb]], true), '#000', 0.25), 1.8);
    return o + C(x - 4, yb - h * 0.45, 2, c.cel(GOLD), 0.9) + C(x + 4, yb - h * 0.45, 2, c.cel(GOLD), 0.9);
  }
  function overcast(c, seed, y, col, cnt, s) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) o += cloud(-20 + 440 * (i + r() * 0.6) / cnt, y + (r() - 0.5) * 10, (s || 1) * (0.8 + r() * 0.6), 0.9, col);
    return o;
  }
  function crows(seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + r() * 0.6; d += 'M' + pt([x - 5 * s, y - 2 * s]) + 'Q' + pt([x - 2 * s, y - 3 * s]) + ' ' + pt([x, y]) + 'Q' + pt([x + 2 * s, y - 3 * s]) + ' ' + pt([x + 5 * s, y - 2 * s]); }
    return L(d, '#1e1c20', 1.3);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    scarlet_monastery_gate: function (c) {
      var o = sky(c, '#343a3e', '#5a645c', '#8e9888');
      o += overcast(c, 901, 16, '#4a524e', 7, 1.2) + overcast(c, 902, 44, '#5e6862', 6, 1) + crows(903, 5, 40, 360, 20, 60);
      o += hills(c, 904, 116, 24, '#4e5a4a', 40) + mist(c, 110, 24, '#a8b4a4', 0.3, 905);
      // the hill the abbey crowns
      o += body(c, 'M-4,150 C40,128 70,116 110,110 C160,104 250,104 300,110 C340,114 370,124 404,136 L404,242 L-4,242 Z', '#56604c', F('M-4,150 C40,128 70,116 110,110 C160,104 250,104 300,110 L300,116 C240,112 170,112 120,118 C80,124 40,138 -4,156 Z', lt('#56604c', 0.1), 0.8), 1.6);
      // cathedral block and spire behind the curtain wall
      o += stoneFace(c, 214, 84, 78, 34, dk(STONE, 0.08), 8) + P(pd([[210, 50], [253, 26], [296, 50]], true), c.cel(SLATE), 1.6);
      o += stainedGlass(c, 253, 76, 16, 22, 906, true);
      o += stoneFace(c, 262, 70, 20, 50, dk(STONE, 0.04), 8) + spireRoof(c, 272, 20, 20, 16);
      o += stoneFace(c, 124, 84, 58, 26, dk(STONE, 0.1), 8) + P(pd([[120, 58], [153, 42], [186, 58]], true), c.cel(dk(SLATE, 0.08)), 1.6);
      // curtain wall, towers and the gate
      o += stoneFace(c, 70, 114, 270, 32, STONE, 8) + crenels(c, 70, 340, 82, STONE, 6);
      o += tower(c, 80, 116, 26, 56, 26, 907, false) + tower(c, 330, 116, 26, 52, 24, 908, true);
      o += tower(c, 164, 116, 30, 72, 30, 909, true) + tower(c, 246, 116, 30, 72, 30, 910, false);
      o += gate(c, 205, 116, 34, 34) + sigil(c, 205, 70, 1.05, RED);
      o += banner(c, 124, 84, 14, 30) + banner(c, 288, 84, 14, 30) + banner(c, 164, 58, 12, 22) + banner(c, 246, 58, 12, 22);
      o += torch(c, 182, 106, 0.6) + torch(c, 228, 106, 0.6);
      // steps and the road down the hill
      o += P('M186,116 L224,116 L236,124 L174,124 Z', c.cel('#b8b2a6'), 1.4) + L('M182,119 L228,119 M178,122 L232,122', dk(STONE, 0.35), 1);
      o += F('M174,124 L236,124 C260,150 300,190 330,242 L130,242 C150,200 168,160 174,124 Z', '#8a8676', 0.9) + L('M174,124 C168,160 150,200 130,242 M236,124 C260,150 300,190 330,242', '#3e3e34', 1.4, 0.7);
      o += pebbles(911, 130, 238, '#6a685c', 18, 150, 310);
      o += mist(c, 150, 30, '#b8c4b4', 0.2, 912);
      o += deadTree(c, 28, 170, 1.5, '#2a2622') + deadTree(c, 372, 176, 1.3, '#2a2622') + deadTree(c, 110, 136, 0.6, '#3a3630') + deadTree(c, 350, 134, 0.55, '#3a3630');
      o += grass(913, 150, 238, '#3e4832', 44, 0.6, 1.4, 1.1) + tufts(c, [[60, 214, 1], [344, 222, 1.1], [16, 236, 1.2], [392, 238, 0.9]], '#5a6a44');
      o += rock(c, 90, 230, 34, 12, '#6a6a60') + rock(c, 380, 208, 22, 9, '#6a6a60');
      return o + mist(c, 214, 20, '#c8d0c0', 0.14, 914) + vignette(c, '#d8e0d0', '#0c100c');
    },
    sm_library: function (c) {
      var o = R(0, 0, 400, 240, '#1a1210');
      o += R(0, 0, 400, 124, c.lg([[0, '#2a1c16'], [1, '#3a2820']]));
      // vault ribs across the top
      for (var vx = 0; vx <= 400; vx += 100) o += L('M' + pt([vx - 50, 20]) + 'Q' + pt([vx, -14]) + ' ' + pt([vx + 50, 20]), '#8a8276', 3.4) + L('M' + pt([vx - 50, 20]) + 'Q' + pt([vx, -14]) + ' ' + pt([vx + 50, 20]), OL, 1, 0.6);
      o += bookshelf(c, 8, 74, 22, 124, 921) + bookshelf(c, 96, 74, 22, 124, 922) + bookshelf(c, 230, 74, 22, 124, 923) + bookshelf(c, 318, 74, 22, 124, 924);
      // tall window over the middle, the order's banner beneath
      o += P(arched(200, 124, 52, 118), c.cel('#2e2420'), 1.6) + stainedGlass(c, 200, 70, 30, 58, 925);
      o += C(200, 46, 50, glow(c, '#ffe0a0', 0.2)) + banner(c, 200, 78, 26, 40);
      [4, 88, 176, 224, 312, 396].forEach(function (x) { o += pillar(c, x, 10, 16, 124, STONE); });
      o += R(0, 12, 400, 8, c.cel('#6e645a'), 1.6);
      // ladder against a shelf
      o += limb('M334,124 L352,30 M348,124 L366,30', '#7a5030', 2) + L('M337,110 L351,110 M340,94 L354,94 M343,78 L357,78 M346,62 L360,62 M349,46 L363,46', '#7a5030', 2);
      // floor + carpet
      o += flagFloor(c, 124, 200, '#6e645c', 926);
      o += F('M176,124 L224,124 L292,242 L108,242 Z', '#7a1418', 0.95) + L('M182,124 L120,242 M218,124 L280,242', GOLD, 1.8, 0.85) + F('M176,124 L224,124 L232,138 L168,138 Z', '#000', 0.2);
      o += R(0, 120, 400, 6, c.lg([[0, '#000', 0.4], [1, '#000', 0]]));
      o += readingTable(c, 30, 130, 136, 1, 927) + readingTable(c, 270, 370, 136, 1, 928);
      o += standCandle(c, 160, 132, 36, 1) + standCandle(c, 240, 132, 36, 1);
      o += bookPile(c, 24, 232, 1.2, 929) + bookPile(c, 382, 226, 1, 930) + openBook(c, 356, 236, 0.9) + L('M18,206 l14,-2', '#f0e8d0', 2, 0.8);
      return o + motes(931, 20, 80, 320, 20, 200, '#ffe8b0') + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    sm_cathedral: function (c) {
      var o = R(0, 0, 400, 240, '#2a2422');
      o += R(0, 0, 400, 124, c.lg([[0, '#8a8278'], [0.5, '#b8b0a4'], [1, '#9a9286']]));
      // ribbed vault
      for (var vx = -40; vx <= 440; vx += 80) o += L('M' + pt([vx - 40, 30]) + 'Q' + pt([vx, -20]) + ' ' + pt([vx + 40, 30]), '#6e665c', 5) + L('M' + pt([vx - 40, 30]) + 'Q' + pt([vx, -20]) + ' ' + pt([vx + 40, 30]), OL, 1.2, 0.6);
      // windows: great central lancet and two side lancets, with the light they throw
      o += P(arched(200, 100, 70, 96), c.cel('#8a8276'), 1.8) + stainedGlass(c, 200, 96, 56, 88, 941);
      o += stainedGlass(c, 90, 96, 30, 70, 942, true) + stainedGlass(c, 310, 96, 30, 70, 943, true);
      o += lightShaft(c, 176, 224, 60, 150, 250, 240, '#ffe8b0', 0.22) + lightShaft(c, 78, 102, 60, 90, 150, 200, '#ff8a8a', 0.14) + lightShaft(c, 298, 322, 60, 250, 310, 200, '#a8c0ff', 0.14);
      [30, 150, 250, 370].forEach(function (x) { o += pillar(c, x, 16, 10, 126, STONE); });
      o += banner(c, 30, 40, 20, 46) + banner(c, 370, 40, 20, 46);
      // floor
      o += flagFloor(c, 124, 200, '#a49c90', 944);
      o += F('M178,124 L222,124 L300,242 L100,242 Z', '#8a1418', 0.95) + L('M184,124 L112,242 M216,124 L288,242', GOLD, 1.8, 0.85);
      // dais, altar and its golden sigil
      o += P('M140,126 L260,126 L254,120 L146,120 Z', c.cel('#cfc8bc'), 1.4) + P('M150,120 L250,120 L245,114 L155,114 Z', c.cel('#dcd6ca'), 1.4) + P('M160,114 L240,114 L236,108 L164,108 Z', c.cel('#e6e0d4'), 1.4);
      o += F('M186,126 L214,126 L212,108 L188,108 Z', '#8a1418', 0.9);
      o += limb('M200,108 L200,86', GOLD, 2.4) + C(200, 62, 34, glow(c, '#ffe08a', 0.6)) + sigil(c, 200, 62, 2.1, RED);
      o += P('M172,108 L228,108 L226,92 L174,92 Z', c.cel(WHT), 1.6) + P('M170,92 L230,92 L230,98 L170,98 Z', c.cel(RED), 1.4) + L('M170,98 L230,98', GOLD, 1.4) + P(pd([[194, 98], [206, 98], [200, 106]], true), GOLD, 1);
      o += candelabra(c, 180, 92, 0.8) + candelabra(c, 220, 92, 0.8);
      o += standCandle(c, 134, 124, 34, 0.9) + standCandle(c, 266, 124, 34, 0.9);
      // pews, clear of the central aisle
      o += pew(c, 8, 120, 140, 0.9) + pew(c, 280, 392, 140, 0.9) + pew(c, -6, 100, 168, 1.1) + pew(c, 312, 406, 168, 1.1);
      o += R(0, 120, 400, 6, c.lg([[0, '#000', 0.3], [1, '#000', 0]]));
      return o + motes(945, 26, 120, 280, 30, 220, '#fff4c8') + R(0, 0, 400, 240, c.rg([[0, '#fff0c0', 0], [0.7, '#000', 0.1], [1, '#000', 0.5]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // monastery head (facing left) — face from art_stranglethorn.js hmHead, with hoods, mitre, helms, long hair
  function smHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', hc = o.hair || '#5a3a22', s = '', hat = o.hat;
    if (o.longHair) { var T = taper([[x + 4, y - 12], [x + 14, y - 4], [x + 18, y + 12], [x + 24, y + 30], [x + 28, y + 46]], 18, 5, 5); s += body(c, T.d, hc, L(along(T, 0.45), dk(hc, 0.18), 1.1) + L(along(T, 0.75), dk(hc, 0.14), 1), 2); }
    if (hat === 'hood' || hat === 'cowl') s += P('M' + pt([x - 6, y - 14]) + 'C' + pt([x + 8, y - 22]) + ' ' + pt([x + 20, y - 10]) + ' ' + pt([x + 18, y + 14]) + 'L' + pt([x + 4, y + 16]) + 'Z', c.cel(dk(o.hoodCol || RED, 0.15)), 2);
    if (hat === 'greathelm') {
      var hm = o.helmCol || STEEL, tr = o.helmTrim || GOLD;
      if (o.crest) s += P('M' + pt([x - 6, y - 17]) + 'C' + pt([x + 2, y - 30]) + ' ' + pt([x + 20, y - 28]) + ' ' + pt([x + 26, y - 12]) + 'C' + pt([x + 22, y - 10]) + ' ' + pt([x + 22, y - 2]) + ' ' + pt([x + 18, y + 2]) + 'C' + pt([x + 14, y - 10]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x, y - 14]) + 'Z', c.cel(o.crest), 1.8);
      var hd = 'M' + pt([x - 13, y + 13]) + 'L' + pt([x - 14, y - 7]) + 'C' + pt([x - 14, y - 19]) + ' ' + pt([x + 11, y - 21]) + ' ' + pt([x + 13, y - 8]) + 'L' + pt([x + 13, y + 13]) + 'Z';
      s += body(c, hd, hm, F(pd([[x + 3, y - 22], [x + 16, y - 22], [x + 16, y + 16], [x + 3, y + 16]], true), dk(hm, 0.3), 0.75) + L('M' + pt([x - 14, y - 8]) + 'L' + pt([x + 13, y - 8]), tr, 2.2) + L('M' + pt([x - 8, y - 19]) + 'L' + pt([x - 8, y + 13]), tr, 2), 2);
      s += R(x - 14, y - 3.2, 12, 3, '#120c0a', 0) + (o.eyeGlow ? C(x - 9, y - 1.7, 3, glow(c, o.eyeGlow, 0.8)) : '');
      s += C(x - 11, y + 5, 0.9, '#120c0a') + C(x - 11, y + 8.4, 0.9, '#120c0a') + C(x - 8, y + 6.6, 0.9, '#120c0a');
      return s + L('M' + pt([x - 13, y + 13]) + 'L' + pt([x + 13, y + 13]), OL, 2);
    }
    s += E(x + 7, y + 1, 2.8, 3.8, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.stubble ? F('M' + pt([x - 10, y + 4]) + 'C' + pt([x - 8, y + 12]) + ' ' + pt([x + 4, y + 14]) + ' ' + pt([x + 10, y + 5]) + 'L' + pt([x + 10, y + 14]) + 'L' + pt([x - 10, y + 14]) + 'Z', o.stubble, 0.5) : '') +
      (o.gaunt ? E(x - 2, y + 5, 3.4, 2.4, dk(sk, 0.3), 0, 0.8) + E(x - 5, y - 1.4, 3.4, 2.6, dk(sk, 0.4), 0, 0.85) : '') +
      (o.old ? L('M' + pt([x - 9, y + 1]) + 'l2.4,1.4 M' + pt([x - 6, y - 10]) + 'l7,-0.6 M' + pt([x - 5, y - 12.4]) + 'l5,-0.4', dk(sk, 0.32), 0.9) : '') +
      (o.scar ? L('M' + pt([x - 3, y - 9]) + 'L' + pt([x + 2, y + 6]), dk(sk, 0.45), 1.4) + L('M' + pt([x - 2, y - 5]) + 'l2.6,-0.6 M' + pt([x, y + 1]) + 'l2.6,-0.6', dk(sk, 0.45), 0.9) : ''), 2);
    if (o.glowEye) s += gEye(c, x - 5, y - 1.6, 1.5, o.glowEye);
    else s += C(x - 5, y - 1.6, 1.7, OL) + C(x - 5.5, y - 2.2, 0.5, '#fff');
    s += o.cruel ? L('M' + pt([x - 10, y - 7]) + 'L' + pt([x - 1, y - 4]), dk(hc, 0.2), 2.2) : L('M' + pt([x - 9, y - 5.6]) + 'L' + pt([x - 1, y - 5]), o.brow || dk(hc, 0.2), 2);
    if (o.longBeard) s += body(c, 'M' + pt([x - 11, y + 4]) + 'C' + pt([x - 13, y + 18]) + ' ' + pt([x - 7, y + 32]) + ' ' + pt([x - 3, y + 40]) + 'C' + pt([x + 1, y + 30]) + ' ' + pt([x + 7, y + 20]) + ' ' + pt([x + 9, y + 6]) + 'L' + pt([x + 7, y + 3]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 11, y + 4]) + 'Z', o.longBeard,
      L('M' + pt([x - 6, y + 12]) + 'Q' + pt([x - 6, y + 24]) + ' ' + pt([x - 3, y + 34]) + 'M' + pt([x, y + 12]) + 'Q' + pt([x + 1, y + 22]) + ' ' + pt([x - 1, y + 30]), dk(o.longBeard, 0.2), 1) + F('M' + pt([x + 1, y + 2]) + 'L' + pt([x + 12, y + 2]) + 'L' + pt([x + 6, y + 30]) + 'Z', dk(o.longBeard, 0.18), 0.8), 1.6);
    else if (o.beard) s += P('M' + pt([x - 10, y + 5]) + 'C' + pt([x - 9, y + 16]) + ' ' + pt([x + 3, y + 18]) + ' ' + pt([x + 9, y + 7]) + 'L' + pt([x + 7, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 10, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.tache) s += P('M' + pt([x - 12, y + 6]) + 'C' + pt([x - 10, y + 3]) + ' ' + pt([x - 3, y + 3]) + ' ' + pt([x + 1, y + 6]) + 'C' + pt([x - 3, y + 6]) + ' ' + pt([x - 8, y + 6]) + ' ' + pt([x - 12, y + 9]) + 'Z', c.cel(o.tache), 1.2);
    else if (!o.longBeard) s += o.grin ? P('M' + pt([x - 10, y + 6]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 1, y + 5]) + 'Z', '#f4ecd8', 1.1) : L('M' + pt([x - 9, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    if (hat === 'hood' || hat === 'cowl') {
      var hcol = o.hoodCol || RED, htr = o.hoodTrim || GOLD;
      var hood = 'M' + pt([x - 12, y - 3]) + 'C' + pt([x - 13, y - 20]) + ' ' + pt([x + 12, y - 23]) + ' ' + pt([x + 16, y - 6]) + 'L' + pt([x + 17, y + 13]) + 'C' + pt([x + 12, y + 17]) + ' ' + pt([x + 6, y + 17]) + ' ' + pt([x + 3, y + 15]) + 'C' + pt([x + 7, y + 4]) + ' ' + pt([x + 5, y - 9]) + ' ' + pt([x - 4, y - 10]) + 'C' + pt([x - 8, y - 10]) + ' ' + pt([x - 11, y - 7]) + ' ' + pt([x - 12, y - 3]) + 'Z';
      s += body(c, hood, hcol, F(pd([[x + 6, y - 24], [x + 20, y - 24], [x + 20, y + 18], [x + 8, y + 18]], true), dk(hcol, 0.3), 0.8), 2);
      s += L('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 10, y - 8]) + ' ' + pt([x - 7, y - 9]) + ' ' + pt([x - 4, y - 9]) + 'C' + pt([x + 4, y - 8]) + ' ' + pt([x + 6, y + 4]) + ' ' + pt([x + 4, y + 14]), htr, 1.8);
      if (hat === 'hood') s += P(pd([[x + 1, y - 22.4], [x + 3.6, y - 25], [x + 6, y - 22], [x + 3.4, y - 19.6]], true), GOLD, 0.8);
      return s;
    }
    if (hat === 'mitre') {
      var mc = o.mitreCol || WHT;
      s += L('M' + pt([x + 8, y - 6]) + 'L' + pt([x + 13, y + 14]) + 'M' + pt([x + 11, y - 6]) + 'L' + pt([x + 16, y + 12]), OL, 4.6) + L('M' + pt([x + 8, y - 6]) + 'L' + pt([x + 13, y + 14]) + 'M' + pt([x + 11, y - 6]) + 'L' + pt([x + 16, y + 12]), RED, 2.6);
      if (!o.bald) s += P('M' + pt([x - 10, y - 4]) + 'C' + pt([x - 10, y - 9]) + ' ' + pt([x + 10, y - 10]) + ' ' + pt([x + 11, y - 1]) + 'L' + pt([x + 8, y + 2]) + 'C' + pt([x + 6, y - 4]) + ' ' + pt([x - 2, y - 6]) + ' ' + pt([x - 10, y - 4]) + 'Z', c.cel(hc), 1.6);
      var md = 'M' + pt([x - 11, y - 5]) + 'L' + pt([x - 13, y - 20]) + 'Q' + pt([x - 7, y - 26]) + ' ' + pt([x + 1, y - 30]) + 'Q' + pt([x + 7, y - 26]) + ' ' + pt([x + 14, y - 20]) + 'L' + pt([x + 12, y - 5]) + 'Z';
      s += body(c, md, mc, F(pd([[x + 4, y - 32], [x + 16, y - 32], [x + 16, y - 3], [x + 5, y - 3]], true), dk(mc, 0.2), 0.8) + L('M' + pt([x + 0.5, y - 30]) + 'L' + pt([x + 0.5, y - 5]), GOLD, 2.4) + R(x - 14, y - 10, 28, 5, GOLD, 0) + L('M' + pt([x - 14, y - 10]) + 'L' + pt([x + 14, y - 10]) + 'M' + pt([x - 14, y - 5]) + 'L' + pt([x + 14, y - 5]), OL, 1), 2);
      return s + sigil(c, x - 4, y - 19, 0.42, RED) + C(x - 6, y - 7.5, 1.3, RED, 0.6) + C(x + 4, y - 7.5, 1.3, RED, 0.6);
    }
    if (hat === 'sallet') {
      var hc2 = o.helmCol || STEEL;
      s += P('M' + pt([x + 2, y - 18]) + 'C' + pt([x + 8, y - 30]) + ' ' + pt([x + 24, y - 28]) + ' ' + pt([x + 28, y - 16]) + 'C' + pt([x + 24, y - 14]) + ' ' + pt([x + 26, y - 6]) + ' ' + pt([x + 22, y - 2]) + 'C' + pt([x + 18, y - 12]) + ' ' + pt([x + 12, y - 16]) + ' ' + pt([x + 8, y - 14]) + 'Z', c.cel(o.plume || RED), 1.8);
      var sd = 'M' + pt([x - 12, y - 4]) + 'C' + pt([x - 13, y - 20]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 13, y - 8]) + 'L' + pt([x + 20, y + 2]) + 'L' + pt([x + 10, y + 4]) + 'L' + pt([x + 9, y - 2]) + 'L' + pt([x - 11, y - 1]) + 'Z';
      s += body(c, sd, hc2, F(pd([[x + 3, y - 24], [x + 22, y - 24], [x + 22, y + 6], [x + 3, y + 6]], true), dk(hc2, 0.32), 0.75) + L('M' + pt([x - 12, y - 3]) + 'L' + pt([x + 10, y - 3]), GOLD, 1.8) + L('M' + pt([x - 1, y - 20]) + 'L' + pt([x - 2, y - 4]), GOLD, 1.6), 2);
      return s;
    }
    if (!o.bald) s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(hc), 2);
    else if (o.fringe) s += P('M' + pt([x + 3, y - 7]) + 'C' + pt([x + 8, y - 9]) + ' ' + pt([x + 12, y - 5]) + ' ' + pt([x + 11, y + 2]) + 'L' + pt([x + 8, y + 0]) + 'C' + pt([x + 7, y - 3]) + ' ' + pt([x + 5, y - 5]) + ' ' + pt([x + 3, y - 7]) + 'Z', c.cel(o.fringe), 1.2);
    if (o.topknot) s += C(x + 6, y - 14, 3.4, c.cel(hc), 1.4);
    if (hat === 'band') s += L('M' + pt([x - 10, y - 8]) + 'Q' + pt([x, y - 12]) + ' ' + pt([x + 10, y - 8]), OL, 4.6) + L('M' + pt([x - 10, y - 8]) + 'Q' + pt([x, y - 12]) + ' ' + pt([x + 10, y - 8]), o.bandCol || RED, 2.8) +
      P(pd([[x + 9, y - 9], [x + 20, y - 4], [x + 17, y - 1], [x + 21, y + 4], [x + 11, y - 3]], true), c.cel(o.bandCol || RED), 1.3);
    if (hat === 'cap') s += P('M' + pt([x - 12, y - 6]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x + 10, y - 20]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x - 16, y - 4]) + 'Z', c.cel(o.capCol || LEATH), 1.8) + L('M' + pt([x - 12, y - 7]) + 'L' + pt([x + 11, y - 7]), RED, 1.6) + feather(c, x + 8, y - 12, -PI / 2 + 1.1, 16, RED, WHT);
    if (hat === 'circlet') s += L('M' + pt([x - 10, y - 7]) + 'Q' + pt([x, y - 10]) + ' ' + pt([x + 10, y - 7]), OL, 3.4) + L('M' + pt([x - 10, y - 7]) + 'Q' + pt([x, y - 10]) + ' ' + pt([x + 10, y - 7]), GOLD, 1.8) + P(pd([[x - 5, y - 8], [x - 3, y - 12], [x - 1, y - 8]], true), c.cel(RED), 0.9);
    return s;
  }
  function smHuman(c, o) {
    var t = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) t[k] = o[k];
    t.skin = o.skin || '#e8b890'; t.boots = o.boots || '#3a2a1e'; t.neckCol = o.neckCol || t.skin;
    t.head = function (c, x, y) { return smHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); };
    t.hx = o.hx == null ? 58 : o.hx; t.hy = o.hy == null ? 31 : o.hy;
    return biped(c, t);
  }
  // robe skirt from the hips to the ankles, feet peeking out; drawn in `front`
  function robe(c, col, trim, o) {
    o = o || {};
    var hem = o.hem || 117, s = boot(52, 121, o.boots || '#3a2a1e') + boot(74, 121, dk(o.boots || '#3a2a1e', 0.15));
    var d = 'M47,80 L81,80 C85,94 90,106 93,' + hem + ' L35,' + hem + ' C38,106 42,94 47,80 Z';
    s += body(c, d, col, F('M70,78 L98,78 L98,122 L76,122 C78,106 76,92 70,78 Z', dk(col, 0.26), 0.8) + L('M56,90 L48,' + (hem - 2) + ' M64,90 L63,' + (hem - 2) + ' M74,90 L80,' + (hem - 2), dk(col, 0.24), 1.1) +
      (trim ? L('M36,' + (hem - 2.4) + ' L92,' + (hem - 2.4), trim, 3) : '') + (o.panel ? F(pd([[58, 80], [70, 80], [72, hem], [56, hem]], true), o.panel) + (trim ? L('M58,80 L56,' + hem + ' M70,80 L72,' + hem, trim, 1.4) : '') : ''), 2);
    return s;
  }
  function tabard(c, col, trim, y1, sig) {
    y1 = y1 || 106;
    var d = 'M53,48 L75,48 L77,' + y1 + ' L64,' + (y1 + 5) + ' L51,' + y1 + ' Z';
    return body(c, d, col, F('M68,44 L80,44 L80,' + (y1 + 8) + ' L68,' + (y1 + 8) + ' Z', dk(col, 0.28), 0.7) + L(pd([[55, 49], [55, y1 - 1.6], [64, y1 + 2.6], [73, y1 - 1.6], [73, 49]]), trim || GOLD, 1.5), 1.8) + (sig === false ? '' : sigil(c, 64, 66, 0.9, WHT));
  }
  function pauldron(c, x, y, r, col, trim) {
    col = col || STEEL;
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function knees(c, col, trim, pN, pF) { pN = pN || [53, 101]; pF = pF || [71, 101]; return C(pF[0], pF[1], 4.4, c.cel(dk(col, 0.12)), 1.4) + C(pN[0], pN[1], 5, c.cel(col), 1.6) + (trim ? C(pN[0], pN[1], 1.6, trim, 0.6) : ''); }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
  function wrapFist(sk) { return function (c, p) { return C(p[0], p[1], 5, c.cel('#ece4d2'), 2) + L('M' + pt([p[0] - 4, p[1] - 1.6]) + 'l8,0 M' + pt([p[0] - 4, p[1] + 1.6]) + 'l8,0', '#b8a888', 1) + C(p[0] - 2, p[1] - 3.4, 1.2, sk, 0.6); }; }
  function blade(c, p, len, ang, w, col, grip) {
    var q = dirQ(p, ang); col = col || '#d0d6de'; w = w || 3.2;
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(3, 0)), grip || '#5a2a1a', 3.4) + C(q(-11, 0)[0], q(-11, 0)[1], 2.6, c.cel(GOLD), 1.1);
    var g = 'M' + pt(q(3, -w * 2.2)) + 'L' + pt(q(3, w * 2.2));
    o += L(g, OL, 5.4) + L(g, GOLD, 3.2);
    o += P(pd([q(5, -w), q(len - w * 2, -w), q(len, 0), q(len - w * 2, w), q(5, w)], true), c.cel(col), 1.6) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - w * 2.6, 0)), dk(col, 0.3), 1) + L('M' + pt(q(8, -w * 0.55)) + 'L' + pt(q(len - w * 2.6, -w * 0.55)), '#ffffff', 0.9, 0.75);
    return o;
  }
  function staff(c, bot, top, col) { var d = 'M' + pt(bot) + 'L' + pt(top); return limb(d, col || '#6a4428', 3.2) + L(d, lt(col || '#6a4428', 0.3), 1, 0.55); }
  function holyOrb(c, x, y, r, col) {
    col = col || HOLY; var d = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4 + 0.2; d += 'M' + pt([x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5]) + 'L' + pt([x + Math.cos(a) * r * 2.6, y + Math.sin(a) * r * 2.6]); }
    return C(x, y, r * 4, glow(c, col, 0.7)) + L(d, lt(col, 0.3), 1.4, 0.9) + C(x, y, r, c.rg([[0, '#ffffff'], [0.55, lt(col, 0.4)], [1, col]]), 1.2);
  }
  function fireball(c, x, y, s) {
    return C(x, y, 22 * s, glow(c, FIRE, 0.7)) + flame(c, x + 1 * s, y + 8 * s, 1.1 * s, '#ff5a1a', '#ffd84a') + C(x, y + 2 * s, 4 * s, '#fff4c0', 0, 0.9);
  }
  function tome(c, x, y, s, col) {
    var o = C(x, y, 22 * s, glow(c, col, 0.65));
    o += P(pd([[x - 12 * s, y + 3 * s], [x, y + 6 * s], [x + 12 * s, y + 3 * s], [x + 11 * s, y - 5 * s], [x, y - 2 * s], [x - 11 * s, y - 5 * s]], true), c.cel('#4a1a4a'), 1.4 * s);
    o += P('M' + pt([x, y - 2 * s]) + 'Q' + pt([x - 5 * s, y - 7 * s]) + ' ' + pt([x - 11 * s, y - 5.4 * s]) + 'L' + pt([x - 11 * s, y + 1 * s]) + 'Q' + pt([x - 5 * s, y - 1 * s]) + ' ' + pt([x, y + 3 * s]) + 'Z', '#f4ecd4', 1 * s);
    o += P('M' + pt([x, y - 2 * s]) + 'Q' + pt([x + 5 * s, y - 7 * s]) + ' ' + pt([x + 11 * s, y - 5.4 * s]) + 'L' + pt([x + 11 * s, y + 1 * s]) + 'Q' + pt([x + 5 * s, y - 1 * s]) + ' ' + pt([x, y + 3 * s]) + 'Z', '#e4dcc0', 1 * s);
    var ru = 'M' + pt([x - 8 * s, y - 3 * s]) + 'l2,-2 l2,2 M' + pt([x - 7 * s, y]) + 'l4,-1 M' + pt([x + 3 * s, y - 3 * s]) + 'l2,2 l2,-2 M' + pt([x + 4 * s, y]) + 'l4,-1';
    o += L(ru, col, 1.2 * s);
    return o + C(x - 2 * s, y - 10 * s, 1.4 * s, lt(col, 0.5), 0, 0.9) + C(x + 4 * s, y - 14 * s, 1 * s, lt(col, 0.5), 0, 0.8) + C(x - 6 * s, y - 16 * s, 0.9 * s, lt(col, 0.5), 0, 0.7);
  }
  function ward(c, x, y, rx, ry, col) {
    var o = E(x, y, rx, ry, c.rg([[0, col, 0.05], [0.8, col, 0.22], [1, col, 0.5]])) + '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="none" stroke="' + lt(col, 0.3) + '" stroke-width="1.6"/>';
    o += '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(rx - 5) + '" ry="' + n(ry - 5) + '" fill="none" stroke="' + lt(col, 0.5) + '" stroke-width="1" stroke-dasharray="3 4" opacity="0.8"/>';
    for (var i = 0; i < 6; i++) { var a = -PI / 2 + i * PI / 3, px = x + Math.cos(a) * (rx - 2.5), py = y + Math.sin(a) * (ry - 2.5); o += P(pd([[px, py - 3], [px + 2.4, py], [px, py + 3], [px - 2.4, py]], true), lt(col, 0.6), 0.6); }
    return o;
  }
  function crossbow(c, p, ang) {
    var q = dirQ(p, ang), wood = '#6a4428', o = '';
    o += limb('M' + pt(q(-22, 0)) + 'L' + pt(q(26, 0)), wood, 5) + L('M' + pt(q(-20, -1.4)) + 'L' + pt(q(24, -1.4)), lt(wood, 0.3), 1, 0.6);
    o += P(pd([q(-24, -4), q(-14, -3), q(-14, 4), q(-26, 6)], true), c.cel(dk(wood, 0.1)), 1.4);
    var bow = 'M' + pt(q(18, -17)) + 'Q' + pt(q(28, -8)) + ' ' + pt(q(25, 0)) + 'Q' + pt(q(28, 8)) + ' ' + pt(q(18, 17));
    o += L('M' + pt(q(18, -17)) + 'L' + pt(q(6, 0)) + 'L' + pt(q(18, 17)), '#e8e0c8', 1);
    o += L(bow, OL, 5.4) + L(bow, DSTEEL, 3.2) + L(bow, lt(STEEL, 0.3), 1, 0.7);
    o += L('M' + pt(q(6, 0)) + 'L' + pt(q(32, 0)), OL, 2.6) + L('M' + pt(q(6, 0)) + 'L' + pt(q(32, 0)), '#c8a878', 1.2) + P(pd([q(32, -2.4), q(38, 0), q(32, 2.4)], true), c.cel(STEEL), 0.9) + P(pd([q(6, 0), q(9, -3), q(11, 0)], true), RED, 0.7);
    return o + limb('M' + pt(q(-4, 1)) + 'L' + pt(q(-6, 6)), '#3a3434', 1.4);
  }
  function whip(c, p) {
    var o = limb('M' + pt([p[0] + 3, p[1] + 4]) + 'L' + pt([p[0] - 4, p[1] - 8]), '#3a2418', 3.6) + C(p[0] + 3, p[1] + 5, 2, c.cel(GOLD), 0.9);
    var T = taper([[p[0] - 4, p[1] - 8], [p[0] - 14, p[1] - 14], [p[0] - 22, p[1] - 4], [p[0] - 16, p[1] + 12], [p[0] - 24, p[1] + 26], [p[0] - 18, p[1] + 38], [p[0] - 26, p[1] + 44]], 3.6, 1, 6);
    return o + P(T.d, c.cel('#5a3420'), 1.2) + L(bands(T, 3), dk('#5a3420', 0.4), 0.7);
  }
  function hammer(c, p, len, ang, head, glowCol) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-14, 0)) + 'L' + pt(q(len, 0)), '#5a3420', 3.8) + L('M' + pt(q(-2, 0)) + 'L' + pt(q(2, 0)) + 'M' + pt(q(len - 12, 0)) + 'L' + pt(q(len - 8, 0)), GOLD, 3.6);
    if (glowCol) o += C(q(len + 2, 0)[0], q(len + 2, 0)[1], 26, glow(c, glowCol, 0.6));
    var hd = pd([q(len - 6, -13), q(len + 8, -13), q(len + 9, -9), q(len + 9, 9), q(len + 8, 13), q(len - 6, 13), q(len - 7, 9), q(len - 7, -9)], true);
    o += P(hd, c.cel(head || '#c8ccd4'), 1.9) + L('M' + pt(q(len - 7, -6)) + 'L' + pt(q(len + 9, -6)) + 'M' + pt(q(len - 7, 6)) + 'L' + pt(q(len + 9, 6)), GOLD, 2);
    var m = q(len + 1, -13), m2 = q(len + 1, 13);
    return o + sigil(c, m[0] + (m2[0] - m[0]) * 0.5, m[1] + (m2[1] - m[1]) * 0.5, 0.5, RED) + C(q(len + 10, 0)[0], q(len + 10, 0)[1], 2.2, c.cel(GOLD), 1);
  }
  function kite(c, x, y, s, col) {
    col = col || RED;
    var d = function (k) { return 'M' + pt([x - 14 * k, y - 20 * k]) + 'L' + pt([x + 14 * k, y - 20 * k]) + 'C' + pt([x + 15 * k, y - 2 * k]) + ' ' + pt([x + 8 * k, y + 14 * k]) + ' ' + pt([x, y + 24 * k]) + 'C' + pt([x - 8 * k, y + 14 * k]) + ' ' + pt([x - 15 * k, y - 2 * k]) + ' ' + pt([x - 14 * k, y - 20 * k]) + 'Z'; };
    return P(d(s), c.cel(GOLD), 2) + G(body(c, d(s), col, F(pd([[x + 2 * s, y - 24 * s], [x + 18 * s, y - 24 * s], [x + 18 * s, y + 26 * s], [x + 2 * s, y + 26 * s]], true), dk(col, 0.3), 0.7), 1), at(0.84, x, y - 1 * s)) +
      sigil(c, x, y - 4 * s, 1.05 * s, WHT) + C(x - 9 * s, y - 16 * s, 1.3, '#fff', 0, 0.7);
  }
  function sigilStaff(c, bot, top, col) {
    return staff(c, bot, top, col || '#8a6a2a') + C(top[0], top[1], 18, glow(c, HOLY, 0.55)) + sigil(c, top[0], top[1], 1.05, RED) + L('M' + pt([top[0], top[1] + 7]) + 'L' + pt([top[0] + (bot[0] - top[0]) * 0.1, top[1] + (bot[1] - top[1]) * 0.1]), OL, 4.4) + L('M' + pt([top[0], top[1] + 7]) + 'L' + pt([top[0] + (bot[0] - top[0]) * 0.1, top[1] + (bot[1] - top[1]) * 0.1]), GOLD, 2.4);
  }
  function stole(col, trim) { return function (c) { return P('M52,48 L58,48 L58,108 L52,108 Z', c.cel(col), 1.4) + P('M70,48 L76,48 L76,108 L70,108 Z', c.cel(dk(col, 0.15)), 1.4) + (trim ? sigil(c, 55, 96, 0.32, RED, trim) : ''); }; }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    scarlet_monk: function (c) {
      var sk = '#e0a878';
      return smHuman(c, {
        skin: sk, bald: true, topknot: true, hair: '#3a2418', hat: 'band', cruel: true,
        shirt: WHT, sleeve: RED, forearm: sk, pants: '#a81c1c', boots: '#e4dcc8', belt: GOLD, buckle: RED,
        legN: 'M56,86 L44,100 L40,113', footN: [40, 121], legF: 'M70,86 L80,100 L86,113', footF: [88, 121], shadowR: 38,
        chest: function (c) { return F('M48,48 L64,72 L80,48 L74,48 L64,62 L54,48 Z', RED) + L('M48,48 L64,72 L80,48', OL, 1.2) + L('M64,72 L64,84', dk(WHT, 0.3), 1) + sigil(c, 72, 70, 0.42, RED); },
        front: function (c) { return P('M60,86 L66,86 L64,102 L58,100 Z', c.cel(GOLD), 1.4) + P('M64,86 L70,86 L72,98 L66,100 Z', c.cel(dk(GOLD, 0.12)), 1.4); },
        shins: function (c) { return L('M36,108 L46,110 M36,112 L46,114 M82,108 L92,110 M82,112 L92,114', '#ece4d2', 2.4) + L('M36,108 L46,110 M36,112 L46,114', OL, 0.6, 0.6); },
        near: [[48, 54], [34, 60], [20, 56]], nearHand: wrapFist(sk),
        far: [[80, 54], [92, 44], [88, 30]], farHand: wrapFist(sk),
        top: function (c) { return L('M28,56 L32,58 M26,62 L31,62', '#ece4d2', 2) + L('M8,50 l-5,-2 M8,56 l-6,0 M8,62 l-5,2', WHT, 1.4, 0.7); }
      });
    },
    scarlet_chaplain: function (c) {
      var sk = '#e8b890';
      return smHuman(c, {
        skin: sk, hair: '#8a6a4a', hat: 'cowl', hoodCol: RED, hoodTrim: GOLD, noLegs: true,
        shirt: WHT, sleeve: WHT, forearm: WHT, glove: sk, armW: 10,
        chest: function (c) { return F('M58,48 L70,48 L70,84 L58,84 Z', RED) + L('M58,48 L58,84 M70,48 L70,84', GOLD, 1.3) + sigil(c, 64, 62, 0.55, WHT); },
        front: function (c) { return robe(c, WHT, GOLD, { panel: RED }) + sigil(c, 64, 100, 0.5, WHT); },
        near: [[48, 54], [38, 48], [30, 38]], wNearFront: function (c, p) { return holyOrb(c, p[0] - 3, p[1] - 9, 4.4); },
        far: [[80, 54], [88, 68], [86, 80]], wFar: function (c, p) { return P(pd([[p[0] - 6, p[1] - 6], [p[0] + 6, p[1] - 8], [p[0] + 8, p[1] + 6], [p[0] - 4, p[1] + 8]], true), c.cel(REDD), 1.4) + L('M' + pt([p[0] - 5, p[1] - 4]) + 'L' + pt([p[0] + 7, p[1] - 6]), GOLD, 1.2); }
      });
    },
    scarlet_myrmidon: function (c) {
      var sk = '#d8a080';
      return smHuman(c, {
        skin: sk, hair: '#4a2e1a', beard: '#4a2e1a', hat: 'sallet', plume: RED, cruel: true,
        shirt: STEEL, sleeve: STEEL, forearm: STEEL, glove: DSTEEL, pants: STEEL, boots: DSTEEL, legW: 11.5, armW: 10, shadowR: 36,
        front: function (c) { return tabard(c, RED, GOLD, 104); },
        shins: function (c) { return knees(c, STEEL, GOLD); },
        pads: function (c) { return pauldron(c, 82, 50, 11, STEEL, GOLD) + pauldron(c, 46, 52, 13, STEEL, GOLD); },
        near: [[48, 56], [40, 70], [34, 78]], nearHand: gauntlet(DSTEEL),
        far: [[80, 56], [66, 72], [42, 78]], farHand: gauntlet(dk(DSTEEL, 0.1)),
        wNear: function (c, p) { return blade(c, [p[0] + 3, p[1]], 60, -PI / 2 - 0.58, 4.2, '#d4dae2'); }
      });
    },
    scarlet_abbot: function (c) {
      var sk = '#e4b494';
      return G(smHuman(c, {
        skin: sk, hair: '#e8e4dc', old: true, longBeard: '#eeeae2', hat: 'mitre', noLegs: true, hx: 55, hy: 35,
        shirt: RED, sleeve: RED, forearm: RED, glove: sk, armW: 10,
        chest: stole(WHT, GOLD),
        front: function (c) { return robe(c, RED, GOLD, { panel: WHT }) + sigil(c, 64, 104, 0.45, RED); },
        near: [[48, 56], [40, 68], [34, 74]], wNear: function (c, p) { return sigilStaff(c, [p[0] + 3, 120], [p[0] - 4, 14]); },
        far: [[80, 56], [86, 70], [82, 80]]
      }), at(1.02, 64, 122));
    },
    scarlet_champion: function (c) {
      return G(smHuman(c, {
        hat: 'greathelm', helmCol: STEEL, helmTrim: GOLD, crest: RED, neck: false,
        shirt: STEEL, sleeve: STEEL, forearm: STEEL, glove: DSTEEL, pants: STEEL, boots: DSTEEL, legW: 12, armW: 10.5, shadowR: 38,
        back: function (c) { return body(c, 'M50,46 C66,42 82,44 86,50 C98,70 104,94 112,120 L100,116 L92,121 L82,116 L72,120 C70,96 62,70 50,46 Z', RED, F('M86,48 C98,70 106,96 114,122 L96,122 C92,96 88,70 80,48 Z', '#5a0e0e', 0.55) + L('M80,60 C88,80 92,100 94,118', REDD, 1.4) + L('M74,119 L82,115 L92,120 L100,115 L110,119', GOLD, 1.6), 2.2); },
        chest: function (c) { return L('M50,62 Q64,68 78,62', dk(STEEL, 0.35), 1.2) + L('M52,74 Q64,79 76,74', dk(STEEL, 0.35), 1.2); },
        front: function (c) { return tabard(c, RED, GOLD, 102, false); },
        shins: function (c) { return knees(c, STEEL, GOLD); },
        pads: function (c) { return pauldron(c, 82, 50, 12, STEEL, GOLD) + pauldron(c, 46, 52, 14, STEEL, GOLD); },
        far: [[80, 54], [92, 40], [96, 26]], farHand: gauntlet(dk(DSTEEL, 0.1)), wFar: function (c, p) { return blade(c, p, 38, -PI / 2 - 0.95, 3.4); },
        near: [[48, 56], [40, 70], [38, 80]], nearHand: gauntlet(DSTEEL), wNearFront: function (c, p) { return kite(c, p[0] - 4, p[1] - 2, 1.05); }
      }), at(1.04, 64, 122));
    },
    scarlet_wizard: function (c) {
      var sk = '#e8b890';
      return smHuman(c, {
        skin: sk, hair: '#3a2418', beard: '#3a2418', hat: 'hood', hoodCol: '#a01818', hoodTrim: GOLD, noLegs: true,
        shirt: '#a01818', sleeve: '#a01818', forearm: '#a01818', glove: sk, armW: 10.5,
        chest: function (c) { return L('M64,48 L64,86', GOLD, 1.8) + L('M50,58 Q64,64 78,58', GOLD, 1.4) + sigil(c, 64, 68, 0.45, WHT); },
        front: function (c) { return robe(c, '#a01818', GOLD, { panel: '#7a1010' }) + P('M47,80 L81,80 L81,86 L47,86 Z', c.cel(GOLD), 1.4); },
        near: [[48, 56], [36, 50], [28, 40]], wNearFront: function (c, p) { return fireball(c, p[0] - 4, p[1] - 12, 0.9); },
        far: [[80, 56], [88, 70], [88, 82]], wFar: function (c, p) { return staff(c, [p[0] + 3, 120], [p[0] - 3, 18], '#4a2a1a') + C(p[0] - 3, 16, 14, glow(c, FIRE, 0.6)) + P(pd([[p[0] - 3, 8], [p[0] + 1, 16], [p[0] - 3, 24], [p[0] - 7, 16]], true), c.rg([[0, '#ffe07a'], [1, '#e8401a']]), 1.4) + flame(c, p[0] - 3, 10, 0.5); }
      });
    },
    interrogator_vishas: function (c) {
      var sk = '#dcb098', ap = '#5a3a24';
      return G(smHuman(c, {
        skin: sk, bald: true, fringe: '#3a2a20', stubble: '#6a5a50', scar: true, cruel: true, grin: true, hair: '#3a2a20',
        shirt: '#2a2226', sleeve: sk, forearm: sk, glove: '#3a2418', pants: '#3a2e2a', boots: '#241a14', legW: 11.5, armW: 10, shadowR: 36,
        torsoD: 'M44,50 C50,44 78,44 84,50 L82,70 L80,88 L48,88 L46,70 Z',
        chest: function (c) { return L('M50,50 L60,62 M78,50 L68,62', OL, 3.2) + L('M50,50 L60,62 M78,50 L68,62', '#4a3020', 1.8); },
        front: function (c) {
          var d = 'M52,58 L76,58 L80,110 L48,110 Z';
          return body(c, d, ap, F('M66,56 L84,56 L84,112 L70,112 Z', dk(ap, 0.3), 0.8) + E(58, 80, 4, 3, '#6a1a14', 0, 0.7) + E(70, 96, 3, 2.4, '#6a1a14', 0, 0.6) + E(55, 100, 2, 1.6, '#6a1a14', 0, 0.6) + L('M48,108 L80,108', dk(ap, 0.4), 1.4), 1.8) +
            L('M52,86 L76,86', OL, 3) + L('M52,86 L76,86', '#3a2418', 1.6) + R(60, 83, 8, 6, c.cel(STEEL), 1.1) + sigil(c, 64, 66, 0.42, RED);
        },
        top: function (c) { return R(26, 70, 10, 7, c.cel('#3a2418'), 1.2) + R(84, 42, 9, 6, c.cel('#3a2418'), 1.1); },
        near: [[48, 56], [38, 68], [32, 78]], wNearFront: function (c, p) { return whip(c, p); },
        far: [[80, 56], [92, 46], [96, 34]], wFar: function (c, p) { var d = 'M' + pt([p[0] + 3, p[1] + 6]) + 'L' + pt([p[0] - 8, p[1] - 24]); return limb(d, '#3a3434', 2.6) + C(p[0] - 9, p[1] - 26, 10, glow(c, '#ff8a2a', 0.7)) + P(pd([[p[0] - 13, p[1] - 30], [p[0] - 5, p[1] - 30], [p[0] - 5, p[1] - 22], [p[0] - 13, p[1] - 22]], true), c.rg([[0, '#fff0a0'], [0.6, '#ff8a2a'], [1, '#c8301a']]), 1.2); }
      }), at(1.08, 64, 122));
    },
    houndmaster_loksey: function (c) {
      var sk = '#dca888', jer = '#7a5236';
      return G(smHuman(c, {
        skin: sk, hair: '#8a3a1a', beard: '#8a3a1a', tache: '#7a3216', hat: 'cap', capCol: '#5a3a24', cruel: true,
        shirt: jer, sleeve: '#8a1818', forearm: jer, glove: '#3a2418', pants: '#4a3a2a', boots: '#2a1e16', belt: '#3a2418', buckle: GOLD, legW: 12, armW: 10.5, shadowR: 38,
        torsoD: 'M42,50 C50,43 80,43 86,50 L84,70 L80,88 L48,88 L44,70 Z',
        back: function (c) { return L('M78,52 Q96,62 90,84', OL, 3) + L('M78,52 Q96,62 90,84', '#4a3020', 1.4) + P('M84,90 C88,84 96,82 100,74 L106,78 C102,90 94,94 86,94 Z', c.cel('#e8dcc0'), 1.6) + E(103, 76, 3.4, 4.4, c.cel(GOLD), 1.3) + L('M90,88 l2,4 M95,85 l2,4', GOLDD, 1.2); },
        chest: function (c) { return tabard(c, RED, GOLD, 84, true) + L('M50,52 L78,84', OL, 4.6) + L('M50,52 L78,84', '#4a3020', 2.6); },
        pads: function (c) { return P('M40,54 C38,40 58,38 66,44 C74,38 90,42 88,54 C80,48 70,50 64,52 C56,48 46,50 40,54 Z', c.cel('#8a8478'), 1.8) + L('M46,48 l3,3 M56,44 l2,4 M74,44 l-1,4 M82,48 l-2,3', dk('#8a8478', 0.35), 1.1); },
        shins: function (c) { return L('M46,104 L58,104 M66,104 L78,104', '#3a2418', 2.2); },
        near: [[48, 56], [40, 68], [30, 70]], far: [[80, 56], [72, 70], [52, 72]],
        wNearFront: function (c, p) { return crossbow(c, [p[0] + 12, p[1] + 1], PI - 0.04); }
      }), at(1.08, 64, 122));
    },
    arcanist_doan: function (c) {
      var sk = '#e4b494', rb = '#8a1a2a';
      return G(smHuman(c, {
        skin: sk, bald: true, fringe: '#e8e4dc', old: true, longBeard: '#eeeae2', hair: '#e8e4dc', brow: '#d8d4cc', noLegs: true, hx: 56, hy: 33,
        shirt: rb, sleeve: rb, forearm: rb, glove: sk, armW: 10.5,
        back: function (c) { return P('M44,52 C40,36 46,24 54,22 L60,44 Z', c.cel(dk(rb, 0.1)), 1.8) + P('M84,52 C90,38 84,24 76,20 L70,44 Z', c.cel(dk(rb, 0.25)), 1.8) + L('M46,50 C42,36 48,26 54,23 M82,50 C88,38 83,26 76,21', GOLD, 1.4); },
        chest: stole('#4a2a6a', GOLD),
        front: function (c) { return robe(c, rb, GOLD, { panel: '#4a2a6a' }); },
        near: [[48, 56], [38, 66], [28, 70]], wNearFront: function (c, p) { return tome(c, p[0] - 4, p[1] - 6, 0.9, '#b87aff'); },
        far: [[80, 56], [90, 44], [92, 30]], wFar: function (c, p) { return C(p[0], p[1] - 6, 14, glow(c, ARC, 0.8)) + P(pd([[p[0], p[1] - 16], [p[0] + 5, p[1] - 6], [p[0], p[1] + 2], [p[0] - 5, p[1] - 6]], true), c.rg([[0, '#ffffff'], [1, ARC]]), 1.2); },
        top: function (c) { return ward(c, 30, 76, 24, 44, ARC); }
      }), at(1.06, 64, 122));
    },
    herod: function (c) {
      var pl = '#9a2a26', tr = GOLD;
      return G(smHuman(c, {
        hat: 'greathelm', helmCol: '#c8ccd4', helmTrim: GOLD, crest: GOLD, neck: false, eyeGlow: '#ffb040', hy: 34,
        shirt: pl, sleeve: pl, forearm: '#b8bec8', glove: DSTEEL, pants: '#b8bec8', boots: '#6a6e78', legW: 13, armW: 12, shadowR: 42,
        torsoD: 'M38,50 C48,40 82,40 90,50 L88,70 L82,90 L46,90 L42,70 Z', hipY: 88,
        legN: 'M56,88 L48,102 L46,113', footN: [46, 121], legF: 'M72,88 L80,102 L82,113', footF: [84, 121],
        chest: function (c) { return L('M46,60 Q64,70 82,60', tr, 2) + L('M48,74 Q64,82 80,74', tr, 1.6) + sigil(c, 64, 62, 0.8, WHT); },
        front: function (c) { return P('M46,86 L82,86 L86,106 L74,104 L64,110 L54,104 L42,106 Z', c.cel(pl), 1.8) + L('M46,88 L82,88', tr, 2); },
        shins: function (c) { return knees(c, '#c8ccd4', GOLD, [47, 102], [80, 102]); },
        pads: function (c) { return pauldron(c, 86, 48, 14, pl, tr) + pauldron(c, 42, 50, 17, pl, tr) + P(pd([[36, 40], [30, 30], [42, 38]], true), c.cel('#c8ccd4'), 1.2) + P(pd([[46, 36], [44, 26], [50, 35]], true), c.cel('#c8ccd4'), 1.2); },
        near: [[46, 58], [38, 70], [32, 76]], nearHand: gauntlet(DSTEEL),
        far: [[82, 58], [68, 74], [42, 80]], farHand: gauntlet(dk(DSTEEL, 0.1)),
        wNear: function (c, p) { return axe(c, [p[0] + 6, p[1] + 2], 48, -PI / 2 - 0.22, 18, '#c8ccd4', true, '#4a2a1a'); }
      }), at(1.12, 64, 122));
    },
    high_inquisitor_fairbanks: function (c) {
      var sk = '#d6ceb4';
      return G(smHuman(c, {
        skin: sk, bald: true, fringe: '#d8d4c8', gaunt: true, old: true, hair: '#b8b4a8', brow: '#8a8478', noLegs: true, hx: 55, hy: 34,
        shirt: WHT, sleeve: WHT, forearm: WHT, glove: sk, armW: 8.5,
        torsoD: 'M48,50 C54,46 74,46 80,50 L78,70 L77,88 L51,88 L50,70 Z',
        back: function (c) { return P('M50,50 C50,36 60,30 70,32 C80,34 84,44 80,54 Z', c.cel(dk(WHT, 0.1)), 1.8); },
        chest: function (c) { return L('M56,48 L56,86 M72,48 L72,86', RED, 2.6) + sigil(c, 64, 60, 0.5, RED); },
        front: function (c) { return robe(c, WHT, RED, {}) + L('M58,82 L55,115 M70,82 L73,115', RED, 2.6); },
        near: [[48, 56], [36, 56], [24, 50]], nearHand: function (c, p) { return C(p[0], p[1], 3.8, c.cel(sk), 1.8) + L('M' + pt([p[0] - 2, p[1] - 1]) + 'l-8,-3', OL, 4) + L('M' + pt([p[0] - 2, p[1] - 1]) + 'l-8,-3', sk, 2); },
        wNearFront: function (c, p) { return C(p[0] - 12, p[1] - 5, 8, glow(c, HOLY, 0.7)); },
        far: [[80, 56], [86, 70], [84, 80]], wFar: function (c, p) { return staff(c, [p[0] + 2, 120], [p[0] - 2, 40], '#8a6a2a') + sigil(c, p[0] - 2, 38, 0.6, RED); }
      }), at(1.08, 64, 122));
    },
    scarlet_commander_mograine: function (c) {
      var sk = '#e4b090', pl = '#d4a23a';
      return G(smHuman(c, {
        skin: sk, hair: '#a8421e', beard: '#a8421e', neckCol: pl,
        shirt: pl, sleeve: pl, forearm: pl, glove: dk(pl, 0.25), pants: pl, boots: dk(pl, 0.35), legW: 12, armW: 10.5, shadowR: 40,
        legN: 'M56,86 L50,102 L48,113', footN: [48, 121],
        back: function (c) { return body(c, 'M50,46 C66,42 82,44 86,50 C98,70 106,94 114,120 L102,116 L94,121 L84,116 L74,120 C72,96 62,70 50,46 Z', RED, F('M86,48 C98,70 108,96 116,122 L98,122 C94,96 88,70 80,48 Z', '#5a0e0e', 0.55) + L('M76,119 L84,115 L94,120 L102,115 L112,119', GOLD, 1.8), 2.2); },
        chest: function (c) { return L('M50,62 Q64,68 78,62', dk(pl, 0.4), 1.2); },
        front: function (c) { return tabard(c, RED, WHT, 106, true); },
        shins: function (c) { return knees(c, pl, RED, [51, 101]); },
        pads: function (c) { return pauldron(c, 82, 50, 12, pl, RED) + pauldron(c, 46, 52, 15, pl, RED) + sigil(c, 46, 48, 0.4, RED, lt(pl, 0.3)); },
        near: [[48, 56], [38, 68], [30, 76]], nearHand: gauntlet(dk(pl, 0.25)),
        far: [[80, 56], [64, 72], [38, 80]], farHand: gauntlet(dk(pl, 0.35)),
        wNear: function (c, p) { return hammer(c, [p[0] + 4, p[1] + 2], 42, -PI / 2 - 0.2, '#e0e4ea', HOLY); }
      }), at(1.1, 64, 122));
    },
    high_inquisitor_whitemane: function (c) {
      var sk = '#f0c8a8', hr = '#f4f2ee';
      return G(smHuman(c, {
        skin: sk, hair: hr, longHair: true, hat: 'circlet', brow: '#c8c4c0', noLegs: true,
        shirt: WHT, sleeve: WHT, forearm: WHT, glove: sk, armW: 9.5,
        torsoD: 'M48,50 C54,45 74,45 80,50 L78,70 L77,88 L51,88 L50,70 Z',
        back: function (c) { return C(64, 60, 60, glow(c, HOLY, 0.45)) + body(c, 'M52,48 C44,70 38,96 32,118 L96,118 C90,96 84,70 76,48 Z', REDD, F('M70,48 L100,48 L100,120 L80,120 Z', '#000', 0.25), 2); },
        chest: function (c) { return F('M58,48 L70,48 L68,86 L60,86 Z', RED) + L('M58,48 L60,86 M70,48 L68,86', GOLD, 1.3) + sigil(c, 64, 60, 0.5, WHT); },
        front: function (c) { return robe(c, WHT, GOLD, { panel: RED }) + sigil(c, 64, 100, 0.5, WHT) + P('M49,80 L79,80 L79,85 L49,85 Z', c.cel(GOLD), 1.3); },
        pads: function (c) { return P('M44,54 C44,46 54,44 58,48 L54,58 Z', c.cel(RED), 1.4) + P('M84,54 C84,46 74,44 70,48 L74,58 Z', c.cel(dk(RED, 0.15)), 1.4); },
        near: [[48, 56], [36, 48], [30, 36]], wNearFront: function (c, p) { return holyOrb(c, p[0] - 4, p[1] - 10, 5); },
        far: [[80, 56], [90, 66], [92, 78]], wFar: function (c, p) {
          var top = [p[0] - 4, 12];
          return staff(c, [p[0] + 4, 120], top, '#e8e0cc') + C(top[0], top[1], 20, glow(c, HOLY, 0.7)) + L('M' + pt([top[0] - 10, top[1] - 6]) + 'Q' + pt([top[0] - 12, top[1] + 8]) + ' ' + pt([top[0], top[1] + 10]) + 'Q' + pt([top[0] + 12, top[1] + 8]) + ' ' + pt([top[0] + 10, top[1] - 6]), OL, 5) +
            L('M' + pt([top[0] - 10, top[1] - 6]) + 'Q' + pt([top[0] - 12, top[1] + 8]) + ' ' + pt([top[0], top[1] + 10]) + 'Q' + pt([top[0] + 12, top[1] + 8]) + ' ' + pt([top[0] + 10, top[1] - 6]), GOLD, 2.8) + sigil(c, top[0], top[1], 0.62, RED);
        }
      }), at(1.08, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#b81e1e'), 2.5); }
  function phScene(c) { return sky(c, '#343a3e', '#5a645c', '#8e9888') + ground(c, 150, '#56604c', '#2e3428'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#b81e1e"/></svg>'; }
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
