/* art_steppes.js — Burning Steppes art for Azeroth Solo (contested zone, levels 52-55: scorched black earth split by
 * lava, an ash-grey sky lit red from below, smoke columns, and Blackrock Mountain looming over it all with its lava
 * falls and chains). Scenes: Morgan's Vigil (Alliance hub), Flame Crest (Horde hub), Dreadmaul Rock, the Ruins of
 * Thaurissan, Blackrock Stronghold, the Terror Wing path and the gate of Blackrock Mountain. Mobs: Firegut ogres and
 * brutes, Blackrock battlemasters and flamecallers, black broodlings and dragonspawn, flamekin spitters, blazing
 * elementals, the rare Gorlash and the elite Volchan.
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Burning Steppes keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_zulfarrak.js (itself copying
 * art_scarlet.js / art_stranglethorn.js); blaze() and chunk() are copies of art_arathi.js. Everything else is new.
 * Kept apart from their cousins: the Firegut ogres are red-skinned (Boulderfist grey, Dunemaul tan); the
 * battlemaster wears a horned great-helm and lava-seamed plate (the Redridge Blackrock wear plain black with an
 * orange sigil); the flamecaller is unhooded with a skull headdress and orange fire (the summoner is hooded, fel
 * green); the broodling lunges with purple-black wings (the Redridge whelp stands, orange wings); the fire
 * elementals are a squat spitter, a vortex-bodied blazing elemental with obsidian plates, and Volchan's black crust
 * over molten lava (the Arathi exile is a plain column of flame).
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix bs<counter>_).
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
  function Ctx() { this.p = 'bs' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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

  // ---- more shared copies (art_stranglethorn.js) ----
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1) + ' M' + n(x - 8) + ',' + n(y - 1) + ' L' + n(x - 8) + ',' + n(y + 1), OL, 1.2) + L('M' + n(x - 11) + ',' + n(y + 1) + ' l-2,0.5', '#efe6cf', 1.2); }
  function skull(c, x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL);
  }
  function bone(x, y, len, ang, s) {
    var ca = Math.cos(ang) * len / 2, sa = Math.sin(ang) * len / 2, d = 'M' + pt([x - ca, y - sa]) + 'L' + pt([x + ca, y + sa]);
    return L(d, OL, 4.4 * s) + C(x - ca, y - sa, 2.2 * s, '#ece4cc', 1 * s) + C(x + ca, y + sa, 2.2 * s, '#ece4cc', 1 * s) + L(d, '#ece4cc', 2.2 * s);
  }
  function feathers(x, y, cols, s, a0) {
    s = s || 1; var o = '';
    cols.forEach(function (col, i) {
      var a = (a0 == null ? -0.4 : a0) + i * 0.35, ex = x + Math.sin(a) * 14 * s, ey = y + Math.cos(a) * 14 * s;
      o += P('M' + pt([x, y]) + 'Q' + pt([x + Math.sin(a) * 6 * s - 3 * s, y + Math.cos(a) * 8 * s]) + ' ' + pt([ex, ey]) + 'Q' + pt([x + Math.sin(a) * 8 * s + 3 * s, y + Math.cos(a) * 6 * s]) + ' ' + pt([x, y]) + 'Z', col, 1.3);
    });
    return o;
  }
  function smoke(x, y, s, col, op, lean) {
    var o = '', r = rng(Math.round(x * 13 + y * 5));
    lean = lean == null ? 1 : lean;
    for (var i = 0; i < 6; i++) { var t = i / 5; o += C(x + t * 18 * s * lean + (r() - 0.5) * 4 * s, y - t * 44 * s, (4 + t * 9) * s, col || '#8a8a8a', 0, (op || 0.7) * (1 - t * 0.6)); }
    return o;
  }

  // ---- more shared copies (art_arathi.js): tongued flame silhouette and faceted rock chunk ----
  function blaze(cx, y0, y1, wf, k, seed, lean) {
    var r = rng(seed || 5), Lp = [], Rp = [], d, i;
    lean = lean || 0;
    for (i = 0; i <= k; i++) { var t = i / k, y = y0 + (y1 - y0) * t, w = wf(t), x = cx + lean * t * t; Lp.push([x - w, y]); Rp.push([x + w, y]); }
    var seg = (y0 - y1) / k;
    d = 'M' + pt(Lp[0]);
    for (i = 1; i <= k; i++) { var a = Lp[i - 1], b = Lp[i], out = wf(i / k) * (0.35 + r() * 0.35); d += 'Q' + pt([a[0] - out * 0.5, (a[1] + b[1]) / 2]) + ' ' + pt([b[0] - out, b[1] - seg * 0.7]) + 'Q' + pt([b[0] - out * 0.2, b[1] - seg * 0.1]) + ' ' + pt([b[0], b[1]]); }
    var tip = [cx + lean + (r() - 0.5) * 4, y1 - seg * 1.6];
    d += 'Q' + pt([Lp[k][0] + 2, y1 - seg * 0.6]) + ' ' + pt(tip) + 'Q' + pt([Rp[k][0] - 2, y1 - seg * 0.4]) + ' ' + pt(Rp[k]);
    for (i = k - 1; i >= 0; i--) { var a2 = Rp[i + 1], b2 = Rp[i], out2 = wf(i / k) * (0.35 + r() * 0.35); d += 'Q' + pt([a2[0] + out2 * 0.2, a2[1] + seg * 0.2]) + ' ' + pt([a2[0] + out2, a2[1] - seg * 0.5]) + 'Q' + pt([b2[0] + out2 * 0.5, (a2[1] + b2[1]) / 2]) + ' ' + pt(b2); }
    return d + 'Z';
  }
  function chunk(c, pts, col, crack) {
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    var sh = pd([[mx + (x1 - x0) * 0.08, y0 - 2], [x1 + 2, y0 - 2], [x1 + 2, y1 + 2], [x0 - 2, y1 + 2], [x0 - 2, my + (y1 - y0) * 0.22]], true);
    var li = pd([[x0 - 2, y0 - 2], [mx - (x1 - x0) * 0.05, y0 - 2], [x0 + (x1 - x0) * 0.2, my - (y1 - y0) * 0.05], [x0 - 2, my]], true);
    return body(c, pd(pts, true), col, F(sh, dk(col, 0.28), 0.85) + F(li, lt(col, 0.2), 0.8) + (crack || ''), 2.2);
  }
  // ragged hem from x0 to x1 around y (path continuation)
  function rag(x0, x1, y, k, seed) { var r = rng(seed || 3), s = ''; for (var i = 1; i <= k; i++) s += 'L' + pt([x0 + (x1 - x0) * (i - 0.5) / k, y + 3 + r() * 3]) + 'L' + pt([x0 + (x1 - x0) * i / k, y - r() * 2]); return s; }

  // ============================================================
  //  THE STEPPES: palette
  // ============================================================
  var CHAR = '#2e2624', CHARM = '#44382f', SOOT = '#1a1210';
  var LAVA = '#ff6a1a', LAVAH = '#ffb42e', LAVAW = '#fff2a8', LAVAD = '#b8260e';
  var DSTONE = '#7a6a5e', IRON = '#34323a', IRONL = '#6a6a74', STONE = '#8a8078';
  var ABLUE = '#2a5eb8', GOLD = '#e8c050', HRED = '#b0241a', BONE = '#ece0c4', WOOD = '#6a4424', WOODD = '#4a2e18', HIDE = '#a8784a';
  var BRK = '#e0561e', BLK = '#3a3542', BMEM = '#6a2a4a', BELLY = '#b0703a';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // ash-grey sky with a red-orange glow low down and heavy dark clouds
  function steppeSky(c, gx, hot) {
    var o = sky(c, '#262024', hot ? '#6a3a2c' : '#5a3e36', hot ? '#e0642a' : '#c85a2c');
    o += C(gx == null ? 200 : gx, 140, 170, glow(c, '#ff7a2a', hot ? 0.55 : 0.4));
    o += cloud(70, 30, 1.3, 0.8, '#43363a') + cloud(236, 18, 1.7, 0.75, '#3a2e30') + cloud(356, 44, 1, 0.7, '#54423e') + cloud(160, 58, 0.8, 0.45, '#6a4a40');
    return o;
  }
  // billowing smoke column rising from (x, y), leaning with the wind
  function plume(c, x, y, h, s, lean, seed) {
    var r = rng(seed || 3), o = '', k = 9;
    for (var i = 0; i < k; i++) {
      var t = i / (k - 1), px = x + lean * h * t * t + (r() - 0.5) * 6 * s, py = y - h * t, rad = (4 + t * 15) * s * (0.8 + r() * 0.4);
      o += C(px, py, rad, i < 2 ? '#5a3a2e' : '#342a2a', 0, 0.9 - t * 0.4) + C(px - rad * 0.3, py - rad * 0.3, rad * 0.55, i < 2 ? '#8a4a2e' : '#4e4240', 0, 0.8 - t * 0.35);
    }
    return o;
  }
  function embers(seed, cnt, x0, x1, y0, y1) { return motes(seed, cnt, x0, x1, y0, y1, '#ffb040') + motes(seed + 7, Math.round(cnt * 0.7), x0, x1, y0, y1, '#b0a49c'); }
  // glowing lava ribbon through a list of points
  function lavaStream(c, pts, w) {
    var d = pd(spline(pts, 6));
    return L(d, LAVA, w * 3.2, 0.22) + L(d, SOOT, w + 2.4) + L(d, LAVAD, w) + L(d, LAVA, w * 0.62) + L(d, LAVAH, w * 0.26);
  }
  // cracks in the black ground with lava showing through
  function cracks(seed, y0, y1, cnt, x0, x1, k0) {
    var r = rng(seed), o = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) {
      var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), k = (k0 || 1) * (0.55 + t * 0.8), x = x0 + r() * (x1 - x0), len = (18 + r() * 30) * k;
      var p = [[x, y]], seg = 3 + Math.floor(r() * 3);
      for (var j = 1; j <= seg; j++) p.push([x + len * j / seg, y + (r() - 0.5) * 6 * k]);
      var b = p[1 + Math.floor(r() * (seg - 1))];
      var d = pd(p) + 'M' + pt(b) + 'l' + n((r() - 0.3) * 10 * k) + ',' + n((r() - 0.5) * 8 * k);
      o += L(d, LAVA, 6 * k, 0.2) + L(d, SOOT, 3.2 * k) + L(d, LAVAD, 2 * k) + L(d, LAVAH, 0.9 * k);
    }
    return o;
  }
  function charGround(c, y, seed, top, bot) {
    var o = ground(c, y, top || '#4a3c34', bot || '#1e1816'), r = rng(seed || 9);
    for (var i = 0; i < 14; i++) { var yy = y + 6 + r() * (236 - y), t = (yy - y) / (240 - y); o += E(r() * 400, yy, (14 + r() * 30) * (0.5 + t), (2 + r() * 3) * (0.5 + t), i % 3 ? '#62564e' : '#221a18', 0, 0.45); }
    return o + R(0, y - 1, 400, 6, c.lg([[0, '#000', 0.3], [1, '#000', 0]]));
  }
  function lavaPool(c, x, y, rx, ry, seed) {
    var r = rng(seed || 4), o = E(x, y, rx * 1.5, ry * 2.6, glow(c, LAVA, 0.55)) + E(x + 1, y + 1.5, rx + 3, ry + 2.4, SOOT) + E(x, y, rx, ry, c.lg([[0, LAVAD], [0.45, LAVA], [1, LAVAH]]), 1.8);
    for (var i = 0; i < 5; i++) {
      var a = r() * PI * 2, dd = 0.2 + r() * 0.45, cx = x + Math.cos(a) * rx * dd, cy = y + Math.sin(a) * ry * dd, w = rx * (0.08 + r() * 0.1);
      o += E(cx, cy, w, w * ry / rx * 1.1, '#3a2620', 1) + L('M' + pt([cx - w * 0.6, cy - w * ry / rx * 0.4]) + 'l' + n(w * 0.6) + ',-0.6', '#6a4a3a', 0.9);
    }
    return o + L('M' + pt([x - rx * 0.6, y - ry * 0.2]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.2) + ' ' + n(rx * 0.4) + ',0 M' + pt([x + rx * 0.1, y + ry * 0.4]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.2) + ' ' + n(rx * 0.4) + ',0', LAVAW, 1.2, 0.8);
  }
  // pouring lava: a wide glowing band down a face, with a splash pool at the foot
  function lavaFall(c, x, y0, y1, w, wig) {
    wig = wig || 3;
    var pts = [[x, y0], [x + wig, y0 + (y1 - y0) * 0.3], [x - wig, y0 + (y1 - y0) * 0.65], [x + wig * 0.5, y1]];
    var T = taper(pts, w * 0.7, w * 1.3, 5);
    return R(x - w * 2.4, y0, w * 4.8, y1 - y0, c.lg([[0, LAVA, 0], [0.5, LAVA, 0.2], [1, LAVA, 0.3]], 0, 0, 1, 0)).replace(/<rect/, '<rect opacity="0.8"') +
      P(T.d, c.lg([[0, LAVAD], [0.35, LAVA], [0.6, LAVAH], [1, LAVA]], 0, 0, 1, 0), 1.6) + L(along(T, 0.42), LAVAW, w * 0.18, 0.8) + L(along(T, 0.75), LAVAD, w * 0.12, 0.7) +
      E(x, y1, w * 1.6, w * 0.4, glow(c, LAVAH, 0.8)) + E(x, y1, w * 1.1, w * 0.3, LAVAH, 1.2);
  }
  // jagged rock spike with strata and a lit edge
  function spire(c, x, y, w, h, col, seed) {
    var r = rng(seed || 6), L0 = [], R0 = [], k = 5;
    for (var i = 0; i <= k; i++) { var t = i / k, hw = w / 2 * (1 - t * 0.82); L0.push([x - hw + (r() - 0.5) * w * 0.14, y - h * t]); R0.push([x + hw + (r() - 0.5) * w * 0.14, y - h * t]); }
    var tip = [x + (r() - 0.5) * w * 0.2, y - h * 1.08];
    var d = pd(L0.concat([tip]).concat(R0.slice().reverse()), true);
    var sh = pd([[x + w * 0.06, y - h * 1.2], [x + w, y - h * 1.2], [x + w, y + 2], [x + w * 0.12, y + 2]], true), strata = '';
    for (var j = 1; j < 5; j++) { var yy = y - h * j / 5.5, hw2 = w / 2 * (1 - j / 5.5 * 0.82); strata += 'M' + pt([x - hw2 * 0.8, yy]) + 'l' + n(hw2 * 0.9) + ',' + n(-2 - r() * 3); }
    return body(c, d, col, F(sh, dk(col, 0.36), 0.8) + L(strata, dk(col, 0.45), 1.1) + L(pd(L0.slice(0, 4)), lt(col, 0.22), 1.4, 0.8), 1.8);
  }
  // low jagged crag
  function crag(c, x, y, w, h, col, seed) {
    var r = rng(seed || 8), top = [], k = 6;
    for (var i = 0; i <= k; i++) { var t = i / k; top.push([x - w / 2 + w * t, y - h * (0.3 + 0.7 * Math.sin(PI * (0.1 + t * 0.8))) * (0.7 + r() * 0.35)]); }
    var d = pd([[x - w / 2 - 2, y]].concat(top).concat([[x + w / 2 + 2, y]]), true);
    return E(x, y + 1, w * 0.55, 3, '#000', 0, 0.3) + body(c, d, col, F(pd([[x + w * 0.08, y - h - 4], [x + w, y - h - 4], [x + w, y + 2], [x + w * 0.18, y + 2]], true), dk(col, 0.34), 0.8) + F(pd([[x - w / 2, y - h * 0.25], [x - w * 0.12, y - h * 0.85], [x - w * 0.22, y - h * 0.35]], true), lt(col, 0.18), 0.7), 1.8);
  }
  function burntTree(c, x, y, s) { return deadTree(c, x, y, s, '#241a16') + C(x - 20 * s, y - 56 * s, 1.4 * s, LAVAH) + C(x + 18 * s, y - 62 * s, 1.3 * s, LAVA) + C(x - 3 * s, y - 60 * s, 1.2 * s, LAVAH) + L('M' + pt([x - 1 * s, y - 14 * s]) + 'l' + n(2 * s) + ',' + n(-6 * s), LAVA, 1 * s, 0.8); }
  // heavy chain hanging along a sagging curve from p0 to p1
  function chain(c, p0, p1, sag, w, col) {
    col = col || '#4a4650';
    var mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + sag], o = '', dx0 = p1[0] - p0[0], dy0 = p1[1] - p0[1];
    var cnt = Math.max(3, Math.round((Math.sqrt(dx0 * dx0 + dy0 * dy0) + Math.abs(sag)) / (w * 2.1)));
    for (var i = 0; i <= cnt; i++) {
      var t = i / cnt, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, e = t * t;
      var x = a * p0[0] + b * mid[0] + e * p1[0], y = a * p0[1] + b * mid[1] + e * p1[1];
      var tx = 2 * (1 - t) * (mid[0] - p0[0]) + 2 * t * (p1[0] - mid[0]), ty = 2 * (1 - t) * (mid[1] - p0[1]) + 2 * t * (p1[1] - mid[1]);
      var ang = Math.atan2(ty, tx) * 180 / PI, ring = ellD(0, 0, w * 1.3, w * 0.66);
      var link = i % 2 ? L(ring, OL, w * 0.5 + 2) + L(ring, col, w * 0.5) + L('M' + pt([-w * 0.9, -w * 0.5]) + 'L' + pt([w * 0.5, -w * 0.62]), lt(col, 0.35), w * 0.16) :
        L('M' + pt([-w * 1.25, 0]) + 'L' + pt([w * 1.25, 0]), OL, w * 0.62 + 2) + L('M' + pt([-w * 1.25, 0]) + 'L' + pt([w * 1.25, 0]), lt(col, 0.1), w * 0.62);
      o += G(link, 'translate(' + n(x) + ',' + n(y) + ') rotate(' + n(ang) + ')');
    }
    return o;
  }
  // banners: Alliance blue with a gold shield and star, Horde red with a black tusked jaw, Blackrock with the burning peak, ogre hide with a red eye
  function embAlliance(c, x, y, s) { return P('M' + pt([x - 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y - 6 * s]) + 'L' + pt([x + 5 * s, y]) + 'Q' + pt([x + 4 * s, y + 5 * s]) + ' ' + pt([x, y + 7 * s]) + 'Q' + pt([x - 4 * s, y + 5 * s]) + ' ' + pt([x - 5 * s, y]) + 'Z', c.cel(GOLD), 1 * s) + P(pd([[x, y - 4 * s], [x + 1.2 * s, y - 0.4 * s], [x + 3.6 * s, y], [x + 1.2 * s, y + 0.8 * s], [x, y + 4.4 * s], [x - 1.2 * s, y + 0.8 * s], [x - 3.6 * s, y], [x - 1.2 * s, y - 0.4 * s]], true), '#f8f4e0', 0.6 * s); }
  function embHorde(c, x, y, s) { return P(pd([[x, y - 7 * s], [x + 6 * s, y], [x, y + 7 * s], [x - 6 * s, y]], true), '#1e1614', 1 * s) + P('M' + pt([x - 3 * s, y + 3 * s]) + 'Q' + pt([x - 7 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 7 * s]) + 'L' + pt([x - 2 * s, y - 1 * s]) + 'Z', BONE, 0.8 * s) + P('M' + pt([x + 3 * s, y + 3 * s]) + 'Q' + pt([x + 7 * s, y - 1 * s]) + ' ' + pt([x + 5 * s, y - 7 * s]) + 'L' + pt([x + 2 * s, y - 1 * s]) + 'Z', BONE, 0.8 * s); }
  function embRock(c, x, y, s) { return P(pd([[x - 7 * s, y + 5 * s], [x - 2 * s, y - 3 * s], [x, y - 1 * s], [x + 2 * s, y - 5 * s], [x + 7 * s, y + 5 * s]], true), '#1e1a1e', 1 * s) + flame(c, x + 1.6 * s, y - 3 * s, 0.34 * s, BRK, LAVAH) + L('M' + pt([x - 7 * s, y + 7 * s]) + 'L' + pt([x + 7 * s, y + 7 * s]), '#1e1a1e', 1.4 * s); }
  function embOgre(c, x, y, s) { return E(x, y, 5 * s, 3.6 * s, '#f0e4c8', 1 * s) + C(x, y, 2.2 * s, '#b0241a', 0.6 * s) + L('M' + pt([x - 5 * s, y + 5 * s]) + 'l' + n(2 * s) + ',' + n(4 * s) + 'M' + pt([x, y + 5 * s]) + 'l0,' + n(4.6 * s) + 'M' + pt([x + 5 * s, y + 5 * s]) + 'l' + n(-2 * s) + ',' + n(4 * s), '#b0241a', 1.4 * s); }
  function banner(c, x, y, h, col, trim, emb, s, pole) {
    s = s || 1; var w = 16 * s, top = y - h, o = E(x, y + 1, 5 * s, 1.5 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), pole || WOODD, 2.2 * s) + limb('M' + pt([x - 2 * s, top]) + 'L' + pt([x + w + 3 * s, top]), pole || WOODD, 1.6 * s);
    var fy = top + 1.5 * s, fh = 30 * s;
    var d = 'M' + pt([x + 1 * s, fy]) + 'L' + pt([x + w + 1 * s, fy]) + 'L' + pt([x + w + 2 * s, fy + fh]) + 'L' + pt([x + w / 2 + 1 * s, fy + fh - 7 * s]) + 'L' + pt([x + 1 * s, fy + fh + 1 * s]) + 'Z';
    o += body(c, d, col, F(pd([[x + w * 0.62, fy - 2], [x + w + 4 * s, fy - 2], [x + w + 4 * s, fy + fh + 2], [x + w * 0.62, fy + fh + 2]], true), dk(col, 0.3), 0.7) + L('M' + pt([x + 1 * s, fy + 3 * s]) + 'L' + pt([x + w + 1 * s, fy + 3 * s]), trim, 1.4 * s), 1.4 * s);
    if (emb) o += emb(c, x + w / 2 + 1 * s, fy + fh * 0.42, s);
    return o + C(x, top - 5 * s, 2 * s, c.cel(trim), 1 * s);
  }
  // long banner hung flat on a wall (x = centre, y = top)
  function wallBanner(c, x, y, w, h, col, emb, trim) {
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h + w * 0.4], [x - w / 2, y + h]], true);
    return R(x - w / 2 - 3, y - 3, w + 6, 4, c.cel(IRONL), 1.2) + body(c, d, col, F(pd([[x + w * 0.2, y], [x + w, y], [x + w, y + h + w], [x + w * 0.2, y + h + w]], true), dk(col, 0.3), 0.7) + L('M' + pt([x - w / 2 + 2, y + 2]) + 'L' + pt([x - w / 2 + 2, y + h]) + 'M' + pt([x + w / 2 - 2, y + 2]) + 'L' + pt([x + w / 2 - 2, y + h]), trim || '#1e1a1e', 1.6), 1.6) + (emb ? emb(c, x, y + h * 0.45, w / 16) : '');
  }
  function crate(c, x, y, s) {
    var w = 16 * s;
    return E(x, y + 1, w * 0.7, 2.4 * s, '#000', 0, 0.3) + body(c, pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - w], [x - w / 2, y - w]], true), '#8a6036', L('M' + pt([x - w / 2, y - w]) + 'L' + pt([x + w / 2, y]) + 'M' + pt([x - w / 2, y - w / 2]) + 'L' + pt([x + w / 2, y - w / 2]), dk('#8a6036', 0.4), 1.1 * s) + F(pd([[x + w * 0.2, y - w - 1], [x + w, y - w - 1], [x + w, y + 1], [x + w * 0.2, y + 1]], true), '#000', 0.2), 1.4 * s);
  }
  function barrel(c, x, y, s) {
    var d = 'M' + pt([x - 6 * s, y]) + 'C' + pt([x - 8 * s, y - 6 * s]) + ' ' + pt([x - 8 * s, y - 12 * s]) + ' ' + pt([x - 6 * s, y - 18 * s]) + 'L' + pt([x + 6 * s, y - 18 * s]) + 'C' + pt([x + 8 * s, y - 12 * s]) + ' ' + pt([x + 8 * s, y - 6 * s]) + ' ' + pt([x + 6 * s, y]) + 'Z';
    return E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.3) + body(c, d, '#7a5230', L('M' + pt([x - 7.6 * s, y - 5 * s]) + 'L' + pt([x + 7.6 * s, y - 5 * s]) + 'M' + pt([x - 7.6 * s, y - 13 * s]) + 'L' + pt([x + 7.6 * s, y - 13 * s]), IRONL, 1.6 * s) + F(pd([[x + 2 * s, y - 19 * s], [x + 9 * s, y - 19 * s], [x + 9 * s, y + 1], [x + 2 * s, y + 1]], true), '#000', 0.22), 1.3 * s) + E(x, y - 18 * s, 6 * s, 1.6 * s, c.cel('#5a3a20'), 1 * s);
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 8 * s, 44 * s, glow(c, '#ff9a3a', 0.5)) + E(x, y + 1, 16 * s, 4 * s, '#000', 0, 0.35);
    for (var i = 0; i < 7; i++) { var a = PI * (0.05 + i * 0.15); o += E(x + Math.cos(a) * 13 * s, y + 2 * s - Math.sin(a) * 2 * s, 3.4 * s, 2.4 * s, c.cel('#5a524c'), 1 * s); }
    o += limb('M' + pt([x - 9 * s, y + 1 * s]) + 'L' + pt([x + 7 * s, y - 4 * s]) + 'M' + pt([x + 9 * s, y + 1 * s]) + 'L' + pt([x - 7 * s, y - 4 * s]), '#4a2e1a', 2.6 * s);
    o += flame(c, x - 4 * s, y - 1 * s, 0.7 * s) + flame(c, x + 4 * s, y - 1 * s, 0.65 * s) + flame(c, x, y, 1.05 * s);
    for (i = 0; i < 7; i++) { var r = rng(Math.round(x * 7 + i)); o += C(x + (r() - 0.5) * 20 * s, y - 20 * s - r() * 26 * s, 0.9 * s, i % 2 ? LAVAH : LAVA); }
    for (i = 0; i < 7; i++) { var a2 = PI * (1.05 + i * 0.15); o += E(x + Math.cos(a2) * 13 * s, y + 2 * s - Math.sin(a2) * 2 * s, 3.4 * s, 2.4 * s, c.cel('#6a625c'), 1 * s); }
    return o;
  }
  // pale canvas tent with a blue stripe (Alliance)
  function tent(c, x, y, w, h, col, stripe) {
    var d = pd([[x - w / 2, y], [x, y - h], [x + w / 2, y]], true);
    return E(x, y + 1, w * 0.6, 3, '#000', 0, 0.3) + limb('M' + pt([x, y - h]) + 'l0,-6', WOODD, 1.6) + body(c, d, col, F(pd([[x, y - h - 2], [x + w / 2 + 2, y + 2], [x, y + 2]], true), dk(col, 0.25), 0.8) + (stripe ? L('M' + pt([x - w * 0.38, y - h * 0.24]) + 'L' + pt([x + w * 0.38, y - h * 0.24]), stripe, 3) : ''), 1.6) +
      P(pd([[x - w * 0.13, y], [x, y - h * 0.58], [x + w * 0.13, y]], true), '#2a1a10', 1.2) + L('M' + pt([x - w / 2, y]) + 'l-5,1 M' + pt([x + w / 2, y]) + 'l5,1', '#d8c8a8', 0.8);
  }
  function stoneWall(c, x0, x1, y, h, col) { return stoneFace(c, x0, y, x1 - x0, h, col, 8) + crenels(c, x0, x1, y - h, col, 6); }
  // square watchtower with a pointed roof (x = left, y = base)
  function watchtower(c, x, y, w, h, col, roof, winGlow) {
    var o = E(x + w / 2, y + 2, w * 0.8, 3.4, '#000', 0, 0.3) + stoneFace(c, x, y, w, h, col, 8);
    o += R(x - 4, y - h - 6, w + 8, 7, c.cel(lt(col, 0.05)), 1.6) + crenels(c, x - 4, x + w + 4, y - h - 6, col, 5);
    var rp = pd([[x - 7, y - h - 10], [x + w / 2, y - h - 46], [x + w + 7, y - h - 10]], true);
    o += limb('M' + pt([x + 2, y - h - 10]) + 'l0,-4 M' + pt([x + w - 2, y - h - 10]) + 'l0,-4', WOODD, 1.6);
    o += body(c, rp, roof, F(pd([[x + w / 2, y - h - 48], [x + w + 9, y - h - 8], [x + w / 2, y - h - 8]], true), dk(roof, 0.3), 0.8) + L('M' + pt([x + w * 0.2, y - h - 18]) + 'L' + pt([x + w * 0.8, y - h - 18]) + 'M' + pt([x + w * 0.1, y - h - 13]) + 'L' + pt([x + w * 0.9, y - h - 13]), dk(roof, 0.35), 1), 1.8);
    o += archWin(x + w / 2, y - h * 0.5, 7, 13, winGlow || '#ffc860') + arrowSlit(x + w * 0.3, y - h * 0.8) + arrowSlit(x + w * 0.7, y - h * 0.8);
    if (winGlow !== '#1a1210') o += C(x + w / 2, y - h * 0.5 - 5, 12, glow(c, '#ffc860', 0.4));
    return o;
  }
  // orc hide tent: patched dome, poles sticking out, tusks at the door
  function hideTent(c, x, y, s, col) {
    col = col || HIDE; var q = function (u, v) { return [x + u * s, y + v * s]; };
    var d = 'M' + pt(q(-30, 0)) + 'C' + pt(q(-27, -20)) + ' ' + pt(q(-13, -38)) + ' ' + pt(q(0, -42)) + 'C' + pt(q(13, -38)) + ' ' + pt(q(27, -20)) + ' ' + pt(q(30, 0)) + 'Z';
    var o = E(x, y + 1, 34 * s, 4 * s, '#000', 0, 0.3) + limb('M' + pt(q(-4, -38)) + 'L' + pt(q(-12, -56)) + 'M' + pt(q(4, -38)) + 'L' + pt(q(12, -54)) + 'M' + pt(q(0, -40)) + 'L' + pt(q(1, -60)), WOOD, 2.2 * s);
    o += body(c, d, col, F(pd([q(4, -46), q(34, -46), q(34, 4), q(12, 4)], true), dk(col, 0.28), 0.8) + F(pd([q(-22, -16), q(-10, -20), q(-9, -8), q(-21, -5)], true) + pd([q(8, -30), q(18, -26), q(17, -16), q(7, -19)], true), dk(col, 0.18), 0.9) +
      L('M' + pt(q(0, -42)) + 'Q' + pt(q(-12, -22)) + ' ' + pt(q(-16, 0)) + 'M' + pt(q(0, -42)) + 'Q' + pt(q(12, -22)) + ' ' + pt(q(16, 0)) + 'M' + pt(q(-22, -16)) + 'l1,2 l1,-2 l1,2 M' + pt(q(8, -30)) + 'l2,1 l1,-2', dk(col, 0.45), 1 * s) + L('M' + pt(q(-26, -8)) + 'Q' + pt(q(0, -14)) + ' ' + pt(q(26, -8)), HRED, 2.4 * s), 1.8 * s);
    o += P('M' + pt(q(-9, 0)) + 'C' + pt(q(-8, -12)) + ' ' + pt(q(-4, -18)) + ' ' + pt(q(0, -18)) + 'C' + pt(q(4, -18)) + ' ' + pt(q(8, -12)) + ' ' + pt(q(9, 0)) + 'Z', '#2a1810', 1.4 * s);
    o += P('M' + pt(q(-10, 0)) + 'Q' + pt(q(-16, -8)) + ' ' + pt(q(-13, -18)) + 'L' + pt(q(-11, -8)) + 'Z', c.cel(BONE), 1.1 * s) + P('M' + pt(q(10, 0)) + 'Q' + pt(q(16, -8)) + ' ' + pt(q(13, -18)) + 'L' + pt(q(11, -8)) + 'Z', c.cel(dk(BONE, 0.08)), 1.1 * s);
    return o;
  }
  // sharpened log wall
  function palisade(c, x0, x1, y, h, seed) {
    var r = rng(seed || 2), o = E((x0 + x1) / 2, y + 2, (x1 - x0) * 0.55, 4, '#000', 0, 0.3), band = '';
    for (var x = x0; x < x1; x += 9) {
      var hh = h * (0.85 + r() * 0.25), col = r() < 0.5 ? WOOD : '#5a3a20';
      o += body(c, pd([[x, y], [x + 9, y], [x + 9, y - hh + 6], [x + 4.5, y - hh - 4], [x, y - hh + 6]], true), col, F(pd([[x + 5, y - hh - 6], [x + 10, y - hh - 6], [x + 10, y + 2], [x + 5, y + 2]], true), dk(col, 0.3), 0.8) + F(pd([[x + 4.5, y - hh - 4], [x + 9, y - hh + 6], [x + 4.5, y - hh + 3], [x, y - hh + 6]], true), '#1a1210', 0.55), 1.4);
      band += 'M' + pt([x, y - h * 0.35]) + 'l9,0.6 M' + pt([x, y - h * 0.7]) + 'l9,-0.6';
    }
    return o + L(band, OL, 3) + L(band, '#8a6a44', 1.4);
  }
  // skull on a spiked pole
  function skullPole(c, x, y, s, big) {
    var o = E(x, y + 1, 7 * s, 2 * s, '#000', 0, 0.3) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 44 * s]), WOODD, 2.4 * s);
    o += limb('M' + pt([x - 10 * s, y - 34 * s]) + 'L' + pt([x + 10 * s, y - 38 * s]), WOODD, 1.8 * s) + skull(c, x, y - 46 * s, (big ? 1.6 : 1) * s);
    return o + L('M' + pt([x - 9 * s, y - 34 * s]) + 'l-1,' + n(8 * s) + 'M' + pt([x + 9 * s, y - 38 * s]) + 'l1,' + n(8 * s), '#c8b89a', 1.2 * s) + L('M' + pt([x - 2 * s, y - 30 * s]) + 'L' + pt([x + 2 * s, y - 26 * s]), HRED, 2 * s);
  }
  // the Blackrock peak: jagged crown, ridges, lava falls from its flanks
  function mountain(c, x, y, s, col, falls) {
    col = col || '#2a2224';
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    var pts = [[-175, 0], [-132, -34], [-106, -48], [-90, -80], [-72, -90], [-60, -124], [-48, -118], [-38, -146], [-26, -136], [-12, -162], [2, -146], [14, -158], [26, -130], [40, -138], [52, -104], [70, -92], [92, -58], [124, -38], [175, 0]];
    var d = pd(pts.map(function (p) { return q(p[0], p[1]); }), true);
    var sh = pd([q(-8, -172), q(190, -172), q(190, 4), q(64, 4), q(38, -60), q(18, -100)], true);
    var ridges = 'M' + pt(q(-38, -146)) + 'L' + pt(q(-46, -100)) + 'L' + pt(q(-62, -60)) + 'M' + pt(q(-12, -162)) + 'L' + pt(q(-16, -110)) + 'L' + pt(q(-26, -70)) + 'L' + pt(q(-22, -30)) + 'M' + pt(q(14, -158)) + 'L' + pt(q(18, -110)) + 'L' + pt(q(34, -70)) + 'M' + pt(q(-90, -80)) + 'L' + pt(q(-102, -40)) + 'M' + pt(q(70, -92)) + 'L' + pt(q(84, -50));
    var o = C(x, y - 150 * s, 60 * s, glow(c, '#ff6a2a', 0.45)) + body(c, d, col, F(sh, dk(col, 0.38), 0.8) + L(ridges, lt(col, 0.2), 1.4 * s, 0.8), 2 * s);
    if (falls !== false) {
      o += lavaStream(c, [q(-30, -128), q(-34, -90), q(-30, -50), q(-40, -4)], 2.4 * s) + lavaStream(c, [q(4, -140), q(0, -100), q(8, -60), q(4, -4)], 2.8 * s) + lavaStream(c, [q(34, -122), q(40, -80), q(52, -40), q(60, -4)], 2.2 * s);
      o += E(x, y, 120 * s, 10 * s, glow(c, LAVA, 0.6));
    }
    return o;
  }
  // square dwarven column with a stepped base and capital (x = left, y = ground); broken columns end in a jagged top
  function dwColumn(c, x, y, w, h, col, broken, seed) {
    var o = E(x + w / 2, y + 2, w * 0.9, 3, '#000', 0, 0.3), r = rng(seed || 5);
    o += R(x - 5, y - 8, w + 10, 8, c.cel(dk(col, 0.1)), 1.6) + R(x - 3, y - 14, w + 6, 6, c.cel(col), 1.4);
    if (broken) {
      var top = [[0, -2], [w * 0.25, -8 - r() * 6], [w * 0.5, 2], [w * 0.75, -6 - r() * 8], [w, 0]];
      o += stoneFace(c, x, y - 14, w, h - 14, col, 12, top);
    } else {
      o += stoneFace(c, x, y - 14, w, h - 30, col, 12) + R(x - 3, y - h - 2, w + 6, 6, c.cel(col), 1.4) + R(x - 6, y - h - 10, w + 12, 9, c.cel(lt(col, 0.06)), 1.6);
    }
    var cx = x + w / 2, cy = y - h * 0.5;
    o += L('M' + pt([cx, cy - 12]) + 'L' + pt([cx, cy + 12]) + 'M' + pt([cx - 5, cy - 6]) + 'L' + pt([cx, cy - 11]) + 'L' + pt([cx + 5, cy - 6]) + 'M' + pt([cx - 5, cy + 2]) + 'L' + pt([cx, cy - 3]) + 'L' + pt([cx + 5, cy + 2]), dk(col, 0.45), 1.4);
    return o;
  }
  // great stone arch: two columns and a stepped lintel (x = centre)
  function dwArch(c, x, y, w, h, col, broken) {
    var cw = 20, o = dwColumn(c, x - w / 2, y, cw, h, col, false, 3);
    o += broken ? dwColumn(c, x + w / 2 - cw, y, cw, h * 0.6, dk(col, 0.06), true, 4) : dwColumn(c, x + w / 2 - cw, y, cw, h, dk(col, 0.06), false, 4);
    var ly = y - h - 10, x0 = x - w / 2 - 6, x1 = broken ? x + w * 0.15 : x + w / 2 + 6;
    var top = broken ? null : [[0, 0], [x1 - x0, 0]];
    o += stoneFace(c, x0, ly, x1 - x0, 16, col, 8);
    if (broken) o += P(pd([[x1, ly], [x1 + 8, ly - 6], [x1 + 2, ly - 12], [x1 + 6, ly - 16], [x1, ly - 16]], true), c.cel(col), 1.4);
    else o += stoneFace(c, x - 24, ly - 16, 48, 12, lt(col, 0.05), 6) + stoneFace(c, x - 12, ly - 28, 24, 12, col, 6);
    return o + (top ? '' : '');
  }
  // giant stone dwarf head toppled from a statue, tilted and half-buried (x = centre, y = ground)
  function statueHead(c, x, y, s, col) {
    col = col || DSTONE; var q = function (u, v) { return [x + u * s, y + v * s]; }, dd = dk(col, 0.5), sh = dk(col, 0.26), o = E(x, y + 2, 48 * s, 6 * s, '#000', 0, 0.35), g = '';
    // beard spreading onto the ground, braided, ending in two ringed braids
    var bd = 'M' + pt(q(-24, -34)) + 'C' + pt(q(-30, -18)) + ' ' + pt(q(-34, -6)) + ' ' + pt(q(-38, 0)) + 'L' + pt(q(38, 0)) + 'C' + pt(q(34, -6)) + ' ' + pt(q(30, -18)) + ' ' + pt(q(24, -34)) + 'Z';
    g += body(c, bd, col, L('M' + pt(q(-16, -30)) + 'Q' + pt(q(-20, -14)) + ' ' + pt(q(-24, 0)) + 'M' + pt(q(-6, -30)) + 'Q' + pt(q(-8, -14)) + ' ' + pt(q(-9, 0)) + 'M' + pt(q(6, -30)) + 'Q' + pt(q(7, -14)) + ' ' + pt(q(8, 0)) + 'M' + pt(q(16, -30)) + 'Q' + pt(q(20, -14)) + ' ' + pt(q(24, 0)), dd, 1.3 * s) + F(pd([q(10, -40), q(40, -40), q(40, 2), q(16, 2)], true), sh, 0.7), 1.8 * s);
    g += R(x - 16 * s, y - 8 * s, 8 * s, 5 * s, c.cel(lt(col, 0.1)), 1.2 * s) + R(x + 8 * s, y - 8 * s, 8 * s, 5 * s, c.cel(col), 1.2 * s);
    // face: cheeks, deep-set eyes under a heavy brow, big nose, sweeping moustache
    g += body(c, 'M' + pt(q(-24, -34)) + 'C' + pt(q(-28, -48)) + ' ' + pt(q(-24, -58)) + ' ' + pt(q(-20, -60)) + 'L' + pt(q(20, -60)) + 'C' + pt(q(24, -58)) + ' ' + pt(q(28, -48)) + ' ' + pt(q(24, -34)) + 'Z', lt(col, 0.06), F(pd([q(8, -62), q(30, -62), q(30, -32), q(12, -32)], true), sh, 0.7), 1.8 * s);
    g += P(pd([q(-22, -56), q(22, -56), q(20, -50), q(-20, -50)], true), c.cel(dk(col, 0.1)), 1.4 * s) + E(x - 10 * s, y - 47 * s, 5 * s, 2.4 * s, dd) + E(x + 10 * s, y - 47 * s, 5 * s, 2.4 * s, dd);
    g += P('M' + pt(q(-4, -52)) + 'L' + pt(q(4, -52)) + 'C' + pt(q(9, -42)) + ' ' + pt(q(8, -36)) + ' ' + pt(q(0, -36)) + 'C' + pt(q(-8, -36)) + ' ' + pt(q(-9, -42)) + ' ' + pt(q(-4, -52)) + 'Z', c.cel(lt(col, 0.12)), 1.4 * s);
    g += P('M' + pt(q(0, -37)) + 'C' + pt(q(-8, -40)) + ' ' + pt(q(-18, -38)) + ' ' + pt(q(-26, -28)) + 'C' + pt(q(-16, -31)) + ' ' + pt(q(-8, -31)) + ' ' + pt(q(0, -32)) + 'C' + pt(q(8, -31)) + ' ' + pt(q(16, -31)) + ' ' + pt(q(26, -28)) + 'C' + pt(q(18, -38)) + ' ' + pt(q(8, -40)) + ' ' + pt(q(0, -37)) + 'Z', c.cel(col), 1.4 * s);
    // helm: dome, rim band, crest and swept wings
    g += P(pd([q(-26, -64), q(-44, -80), q(-40, -70), q(-46, -74), q(-30, -58)], true) + pd([q(26, -64), q(44, -80), q(40, -70), q(46, -74), q(30, -58)], true), c.cel(dk(col, 0.06)), 1.4 * s);
    g += body(c, 'M' + pt(q(-26, -60)) + 'C' + pt(q(-26, -88)) + ' ' + pt(q(26, -88)) + ' ' + pt(q(26, -60)) + 'Z', col, F(pd([q(8, -92), q(30, -92), q(30, -58), q(10, -58)], true), sh, 0.7) + L('M' + pt(q(-6, -84)) + 'L' + pt(q(-6, -61)) + 'M' + pt(q(6, -84)) + 'L' + pt(q(6, -61)), dd, 1.2 * s), 1.8 * s);
    g += R(x - 28 * s, y - 64 * s, 56 * s, 6 * s, c.cel(dk(col, 0.08)), 1.6 * s) + P(pd([q(-4, -58), q(4, -58), q(2, -48), q(-2, -48)], true), c.cel(dk(col, 0.1)), 1.2 * s);
    // cracks and a broken-off chunk of the helm
    g += L('M' + pt(q(-14, -80)) + 'L' + pt(q(-8, -70)) + 'L' + pt(q(-12, -62)) + 'M' + pt(q(18, -46)) + 'L' + pt(q(12, -38)) + 'M' + pt(q(-20, -20)) + 'L' + pt(q(-14, -12)), OL, 1.2 * s) + P(pd([q(14, -86), q(24, -72), q(26, -84)], true), '#2a2220', 1 * s);
    return o + G(g, 'rotate(-9 ' + n(x) + ' ' + n(y) + ')');
  }
  // small background fire elemental: a flame with eyes and stubby arms
  function fireSprite(c, x, y, s) {
    var o = C(x, y - 12 * s, 26 * s, glow(c, '#ff8a2a', 0.5)) + E(x, y + 1, 8 * s, 2 * s, LAVA, 0, 0.5);
    o += L('M' + pt([x - 5 * s, y - 12 * s]) + 'Q' + pt([x - 11 * s, y - 14 * s]) + ' ' + pt([x - 12 * s, y - 20 * s]) + 'M' + pt([x + 5 * s, y - 12 * s]) + 'Q' + pt([x + 11 * s, y - 14 * s]) + ' ' + pt([x + 12 * s, y - 20 * s]), OL, 4.6 * s) + L('M' + pt([x - 5 * s, y - 12 * s]) + 'Q' + pt([x - 11 * s, y - 14 * s]) + ' ' + pt([x - 12 * s, y - 20 * s]) + 'M' + pt([x + 5 * s, y - 12 * s]) + 'Q' + pt([x + 11 * s, y - 14 * s]) + ' ' + pt([x + 12 * s, y - 20 * s]), LAVA, 2.4 * s);
    o += flame(c, x, y, 1.3 * s, '#ff5a1a', LAVAH) + E(x - 2.4 * s, y - 12 * s, 1.1 * s, 1.5 * s, '#fff8d0') + E(x + 2.4 * s, y - 12 * s, 1.1 * s, 1.5 * s, '#fff8d0');
    return o;
  }
  // black iron wall with spikes along its top (x0..x1, y = base)
  function spikeWall(c, x0, x1, y, h, col, seed) {
    col = col || '#3a3436';
    var o = stoneFace(c, x0, y, x1 - x0, h, col, 10), sp = '';
    o += R(x0, y - h - 5, x1 - x0, 6, c.cel(IRON), 1.4);
    for (var x = x0 + 4; x < x1 - 2; x += 11) sp += pd([[x - 3.4, y - h - 4], [x, y - h - 18], [x + 3.4, y - h - 4]], true);
    o += P(sp, c.cel(IRONL), 1.2);
    for (var x2 = x0 + 20; x2 < x1 - 10; x2 += 40) o += C(x2, y - h * 0.3, 1.6, IRONL, 0.8) + C(x2, y - h * 0.75, 1.6, IRONL, 0.8);
    return o;
  }
  // tall Blackrock tower: tapering black block, spikes jutting out, glowing slit windows (x = centre, y = base)
  function spikeTower(c, x, y, w, h, col) {
    col = col || '#322c30';
    var d = pd([[x - w / 2, y], [x + w / 2, y], [x + w * 0.38, y - h], [x - w * 0.38, y - h]], true), o = E(x, y + 2, w * 0.8, 4, '#000', 0, 0.35);
    var jn = ''; for (var j = 1; j < h / 12; j++) jn += 'M' + pt([x - w / 2 + j * 0.8, y - j * 12]) + 'L' + pt([x + w / 2 - j * 0.8, y - j * 12]);
    o += body(c, d, col, L(jn, dk(col, 0.4), 0.9) + F(pd([[x + w * 0.1, y - h - 2], [x + w, y - h - 2], [x + w, y + 2], [x + w * 0.12, y + 2]], true), dk(col, 0.35), 0.8), 1.8);
    o += R(x - w * 0.5, y - h - 8, w, 9, c.cel(IRON), 1.6);
    var sp = '';
    for (var i = 0; i < 5; i++) { var sx = x - w * 0.44 + i * w * 0.22; sp += pd([[sx - 3.4, y - h - 7], [sx + (i - 2) * 2, y - h - 26 + Math.abs(i - 2) * 5], [sx + 3.4, y - h - 7]], true); }
    [[0.35, -1], [0.6, 1], [0.8, -1]].forEach(function (k) { var yy = y - h * k[0], hw = w / 2 - (w * 0.12) * k[0]; sp += pd([[x + k[1] * hw, yy - 4], [x + k[1] * (hw + 14), yy - 8], [x + k[1] * hw, yy + 3]], true); });
    o += P(sp, c.cel(IRONL), 1.2);
    [0.45, 0.72].forEach(function (k) { var yy = y - h * k; o += C(x, yy, 12, glow(c, LAVA, 0.5)) + R(x - 2, yy - 6, 4, 12, LAVAH, 1); });
    return o;
  }
  // black dragon egg, glossy, with a glowing crack
  function egg(c, x, y, s, lit) {
    var d = 'M' + pt([x, y]) + 'C' + pt([x - 9 * s, y]) + ' ' + pt([x - 9 * s, y - 14 * s]) + ' ' + pt([x - 5 * s, y - 20 * s]) + 'C' + pt([x - 2 * s, y - 24 * s]) + ' ' + pt([x + 2 * s, y - 24 * s]) + ' ' + pt([x + 5 * s, y - 20 * s]) + 'C' + pt([x + 9 * s, y - 14 * s]) + ' ' + pt([x + 9 * s, y]) + ' ' + pt([x, y]) + 'Z';
    var o = E(x, y, 9 * s, 2.4 * s, '#000', 0, 0.35) + body(c, d, '#2e2436', F(pd([[x + 1 * s, y - 26 * s], [x + 12 * s, y - 26 * s], [x + 12 * s, y + 2], [x + 3 * s, y + 2]], true), '#140e18', 0.7) + L('M' + pt([x - 7 * s, y - 6 * s]) + 'q' + n(7 * s) + ',' + n(3 * s) + ' ' + n(14 * s) + ',0 M' + pt([x - 6 * s, y - 13 * s]) + 'q' + n(6 * s) + ',' + n(3 * s) + ' ' + n(12 * s) + ',0', '#5a3a6a', 1 * s), 1.5 * s);
    o += E(x - 3.4 * s, y - 16 * s, 1.6 * s, 3 * s, '#b89ad0', 0, 0.6);
    if (lit) { var cr = 'M' + pt([x + 1 * s, y - 19 * s]) + 'L' + pt([x + 3 * s, y - 14 * s]) + 'L' + pt([x + 1 * s, y - 10 * s]) + 'L' + pt([x + 4 * s, y - 6 * s]); o += C(x + 2 * s, y - 12 * s, 9 * s, glow(c, LAVA, 0.5)) + L(cr, SOOT, 2.2 * s) + L(cr, LAVAH, 1 * s); }
    return o;
  }
  // dragon skull lying on its side, facing left (x, y = back of the skull on the ground)
  function dragonSkull(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x - 20 * s, y + 2, 34 * s, 4 * s, '#000', 0, 0.35), bn = '#d8ccb0';
    o += P('M' + pt(q(6, -24)) + 'C' + pt(q(18, -34)) + ' ' + pt(q(30, -40)) + ' ' + pt(q(42, -36)) + 'C' + pt(q(32, -34)) + ' ' + pt(q(22, -26)) + ' ' + pt(q(14, -14)) + 'Z', c.cel(bn), 1.6 * s);
    var d = 'M' + pt(q(10, 0)) + 'C' + pt(q(14, -14)) + ' ' + pt(q(8, -28)) + ' ' + pt(q(-6, -28)) + 'L' + pt(q(-36, -18)) + 'L' + pt(q(-54, -12)) + 'C' + pt(q(-58, -10)) + ' ' + pt(q(-58, -6)) + ' ' + pt(q(-54, -5)) + 'L' + pt(q(-30, -6)) + 'L' + pt(q(-10, 0)) + 'Z';
    o += body(c, d, bn, F(pd([q(-4, -32), q(16, -32), q(16, 2), q(-2, 2)], true), dk(bn, 0.25), 0.8), 1.8 * s);
    o += E(x - 8 * s, y - 16 * s, 6 * s, 5 * s, '#2a1c16', 1.2 * s) + E(x - 38 * s, y - 13 * s, 3 * s, 1.8 * s, '#2a1c16', 1 * s) + E(x - 22 * s, y - 8 * s, 6 * s, 3 * s, '#2a1c16', 0);
    var t = ''; for (var i = 0; i < 6; i++) t += pd([q(-50 + i * 6, -5), q(-48 + i * 6, 0), q(-46 + i * 6, -5)], true);
    o += P(t, '#efe6cf', 0.8 * s);
    // lower jaw, fallen open
    o += P('M' + pt(q(-4, 2)) + 'L' + pt(q(-52, 4)) + 'C' + pt(q(-56, 5)) + ' ' + pt(q(-54, 8)) + ' ' + pt(q(-50, 8)) + 'L' + pt(q(-2, 7)) + 'Z', c.cel(dk(bn, 0.05)), 1.4 * s);
    return o;
  }
  // arching ribs along a spine (x0..x1 at ground y)
  function ribcage(c, x0, x1, y, h) {
    var o = E((x0 + x1) / 2, y + 2, (x1 - x0) * 0.55, 4, '#000', 0, 0.35), k = 6, bn = '#d8ccb0', sp = 'M' + pt([x0 - 10, y - 4]) + 'Q' + pt([(x0 + x1) / 2, y - h * 0.25]) + ' ' + pt([x1 + 16, y - 2]);
    o += L(sp, OL, 8) + L(sp, bn, 5) + L(sp, dk(bn, 0.3), 1.2, 0.8);
    for (var i = 0; i < k; i++) {
      var t = i / (k - 1), x = x0 + (x1 - x0) * t, hh = h * (0.55 + 0.45 * Math.sin(PI * (0.15 + t * 0.7))), bx = x + 6, rd = 'M' + pt([bx, y - h * 0.2 + 2]) + 'C' + pt([bx - 10, y - hh * 0.7]) + ' ' + pt([x - 12, y - hh]) + ' ' + pt([x - 4, y - hh * 1.02]) + 'M' + pt([bx, y - h * 0.2 + 2]) + 'C' + pt([bx + 4, y - hh * 0.5]) + ' ' + pt([bx + 4, y - hh * 0.2]) + ' ' + pt([bx + 2, y]);
      o += L(rd, OL, 6) + L(rd, i % 2 ? bn : dk(bn, 0.06), 3.4);
    }
    return o;
  }
  // ogre mound hut: squat hide dome with bones and a skull on top
  function ogreHut(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, col = '#8a6a4a';
    var d = 'M' + pt(q(-36, 0)) + 'C' + pt(q(-34, -24)) + ' ' + pt(q(-16, -34)) + ' ' + pt(q(0, -34)) + 'C' + pt(q(16, -34)) + ' ' + pt(q(34, -24)) + ' ' + pt(q(36, 0)) + 'Z';
    var o = E(x, y + 1, 40 * s, 4 * s, '#000', 0, 0.3) + body(c, d, col, F(pd([q(6, -38), q(40, -38), q(40, 4), q(12, 4)], true), dk(col, 0.28), 0.8) + L('M' + pt(q(-30, -12)) + 'Q' + pt(q(0, -20)) + ' ' + pt(q(30, -12)) + 'M' + pt(q(-20, -26)) + 'Q' + pt(q(0, -32)) + ' ' + pt(q(20, -26)), dk(col, 0.45), 1.2 * s), 1.8 * s);
    o += P('M' + pt(q(-11, 0)) + 'C' + pt(q(-10, -14)) + ' ' + pt(q(-5, -20)) + ' ' + pt(q(0, -20)) + 'C' + pt(q(5, -20)) + ' ' + pt(q(10, -14)) + ' ' + pt(q(11, 0)) + 'Z', '#2a1810', 1.4 * s);
    o += bone(x - 18 * s, y - 22 * s, 16 * s, -0.5, 0.9 * s) + bone(x + 18 * s, y - 22 * s, 16 * s, 0.5, 0.9 * s) + skull(c, x, y - 36 * s, 1.1 * s);
    return o;
  }
  // wooden plank platform on posts (x0..x1 at height y, posts down to ground g)
  function platform(c, x0, x1, y, g) {
    var o = limb('M' + pt([x0 + 6, y]) + 'L' + pt([x0 + 4, g]) + 'M' + pt([x1 - 6, y]) + 'L' + pt([x1 - 4, g]) + 'M' + pt([x0 + 6, y + 10]) + 'L' + pt([x1 - 6, g - 4]), WOODD, 2.6);
    o += body(c, pd([[x0, y], [x1, y], [x1 + 2, y + 5], [x0 - 2, y + 5]], true), WOOD, L('M' + pt([x0 + 10, y]) + 'l0,5 M' + pt([x0 + 22, y]) + 'l0,5 M' + pt([x1 - 12, y]) + 'l0,5', dk(WOOD, 0.4), 1), 1.4);
    return o;
  }
  function ladder(x, y0, y1) { var d = 'M' + pt([x - 5, y0]) + 'L' + pt([x - 4, y1]) + 'M' + pt([x + 5, y0]) + 'L' + pt([x + 4, y1]); for (var y = y0 + 6; y < y1; y += 7) d += 'M' + pt([x - 5, y]) + 'L' + pt([x + 5, y]); return L(d, OL, 3.4) + L(d, '#8a6036', 1.6); }
  function brazierIron(c, x, y, s) {
    var o = C(x, y - 24 * s, 34 * s, glow(c, '#ff8a2a', 0.5)) + E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.35);
    o += limb('M' + pt([x - 7 * s, y]) + 'L' + pt([x, y - 16 * s]) + 'L' + pt([x + 7 * s, y]), IRON, 2 * s);
    o += flame(c, x - 4 * s, y - 20 * s, 0.6 * s) + flame(c, x + 4 * s, y - 20 * s, 0.55 * s) + flame(c, x, y - 20 * s, 0.9 * s);
    return o + P(pd([[x - 11 * s, y - 22 * s], [x + 11 * s, y - 22 * s], [x + 7 * s, y - 15 * s], [x - 7 * s, y - 15 * s]], true), c.cel(IRON), 1.4 * s) + P(pd([[x - 11 * s, y - 22 * s], [x - 13 * s, y - 27 * s], [x - 8 * s, y - 22 * s]], true) + pd([[x + 11 * s, y - 22 * s], [x + 13 * s, y - 27 * s], [x + 8 * s, y - 22 * s]], true), c.cel(IRONL), 1 * s);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    morgans_vigil: function (c) {
      var o = steppeSky(c, 300);
      o += mountain(c, 318, 124, 0.56, '#3e3034');
      o += R(0, 70, 400, 60, c.lg([[0, '#b0584a', 0], [1, '#c8704a', 0.35]]));
      // the valley far below the cliff, with a lava river
      o += hills(c, 101, 128, 8, '#40302c', 34) + lavaStream(c, [[196, 131], [250, 127], [300, 130], [350, 126], [404, 128]], 1.8);
      o += plume(c, 262, 128, 70, 0.9, 0.4, 104);
      // the plateau, edged by a cliff on the right
      o += charGround(c, 134, 102, '#5a4a40', '#2a2220');
      var edge = [[318, 134], [334, 148], [352, 160], [374, 174], [404, 184]];
      o += P('M318,134 L404,134 L404,184 ' + edge.slice().reverse().map(function (p) { return 'L' + pt(p); }).join(' ') + 'Z', c.lg([[0, '#8a5040'], [1, '#6a3a30']]), 0) + R(318, 134, 86, 60, c.lg([[0, '#ff8a4a', 0.25], [1, '#ff8a4a', 0]]));
      o += hills(c, 110, 158, 8, '#5a3430', 20).replace(/<path/, '<path clip-path="url(#' + c.clip('M318,134 L404,134 L404,184 L374,174 L352,160 L334,148 Z') + ')"') + lavaStream(c, [[330, 140], [352, 146], [376, 150], [404, 148]], 1.4);
      o += P(pd(edge) + 'L404,200 L378,190 L352,176 L330,162 L310,144 Z', c.cel('#3e322e'), 2) + L(pd(edge), lt('#4a3c36', 0.35), 1.6) + pebbles(111, 150, 196, '#1a1412', 8, 320, 400);
      o += crag(c, 336, 138, 30, 10, '#524440', 105);
      // the outpost: wall, gate, watchtowers, flags
      o += stoneWall(c, 0, 176, 136, 30, STONE);
      o += P('M60,136 L60,120 Q72,108 84,120 L84,136 Z', '#2a1a10', 1.6) + L('M64,136 L64,122 M72,136 L72,116 M80,136 L80,122', '#6a4424', 2) + L('M58,121 Q72,106 86,121', OL, 3) + L('M58,121 Q72,106 86,121', lt(STONE, 0.1), 1.4);
      o += watchtower(c, -6, 138, 28, 58, dk(STONE, 0.06), ABLUE) + watchtower(c, 140, 140, 34, 78, STONE, ABLUE);
      o += banner(c, 38, 106, 34, ABLUE, GOLD, embAlliance, 0.8) + banner(c, 100, 106, 34, ABLUE, GOLD, embAlliance, 0.8) + banner(c, 157, 20, 12, ABLUE, GOLD, embAlliance, 0.7);
      // camp in front of the wall
      o += tent(c, 222, 150, 52, 36, '#d8ccb0', ABLUE) + tent(c, 286, 146, 40, 28, '#cfc2a4', ABLUE);
      o += crate(c, 250, 158, 1) + crate(c, 262, 156, 0.8) + barrel(c, 196, 160, 1) + barrel(c, 304, 160, 0.8);
      o += campfire(c, 238, 190, 1.1);
      o += torch(c, 124, 140, 1) + torch(c, 318, 162, 0.9);
      o += crag(c, 400, 234, 70, 22, '#3a2e2a', 106) + crag(c, 6, 240, 60, 14, '#3a2e2a', 107) + pebbles(108, 150, 236, '#1a1412', 16, 20, 380);
      return o + embers(109, 14, 0, 400, 10, 200) + vignette(c, '#ffb080', '#120a08');
    },
    flame_crest: function (c) {
      var o = steppeSky(c, 200, true);
      o += mountain(c, 70, 118, 0.5, '#3a2c2e');
      // the burning ridge behind the camp
      var ridge = [[-10, 116], [40, 102], [90, 108], [140, 94], [190, 100], [240, 88], [290, 98], [340, 90], [410, 104]], rd = 'M-10,140L' + ridge.map(pt).join('L') + 'L410,140Z';
      o += P(rd, c.lg([[0, '#3a2a26'], [1, '#1e1614']]), 1.8);
      ridge.forEach(function (p, i) { if (i && i < ridge.length - 1) o += C(p[0], p[1] - 8, 26, glow(c, '#ff7a2a', 0.45)) + flame(c, p[0] - 7, p[1] + 2, 0.7) + flame(c, p[0] + 6, p[1] + 3, 0.6) + flame(c, p[0], p[1] + 2, 0.95); });
      o += plume(c, 140, 86, 80, 1, 0.5, 201) + plume(c, 290, 84, 70, 0.9, 0.6, 202);
      o += charGround(c, 132, 203, '#4e3e34', '#241c18');
      o += palisade(c, -4, 118, 138, 36, 204) + palisade(c, 286, 406, 138, 36, 205);
      o += hideTent(c, 170, 140, 1) + hideTent(c, 246, 138, 0.82, '#9a6a44');
      o += banner(c, 124, 138, 60, HRED, '#1e1614', embHorde, 1.1) + banner(c, 272, 138, 60, HRED, '#1e1614', embHorde, 1.1);
      o += skullPole(c, 330, 150, 1) + skullPole(c, 64, 152, 0.9);
      o += campfire(c, 208, 180, 1.35);
      o += limb('M330,196 L346,160 M338,198 L348,164', WOODD, 2) + P('M344,158 L350,150 L350,162 Z M346,162 L352,154 L352,166 Z', c.cel('#b8bcc4'), 1);
      o += cracks(206, 150, 236, 5, 20, 380, 0.9) + crag(c, 396, 236, 60, 16, '#3a2e2a', 207) + crag(c, 2, 238, 50, 12, '#3a2e2a', 208);
      return o + embers(209, 22, 0, 400, 20, 200) + vignette(c, '#ffb080', '#120a08');
    },
    dreadmaul_rock: function (c) {
      var o = steppeSky(c, 210);
      o += mountain(c, 360, 120, 0.44, '#3a2c30');
      o += hills(c, 301, 126, 16, '#34282a', 40);
      // the rock spire with ogre platforms and a hut on its top
      o += spire(c, 150, 142, 56, 74, '#62524a', 303) + spire(c, 286, 142, 46, 56, '#584a44', 309) + spire(c, 214, 144, 150, 116, '#5a4a44', 302);
      o += platform(c, 180, 248, 44, 70) + ogreHut(c, 214, 44, 0.66) + banner(c, 244, 44, 30, '#8a6a4a', '#5a3a22', embOgre, 0.8, '#3a2616');
      o += platform(c, 236, 298, 96, 140) + ladder(288, 100, 140) + ladder(240, 50, 96) + ogreHut(c, 262, 96, 0.44);
      o += limb('M150,70 L140,40', WOODD, 2) + skull(c, 140, 36, 0.9);
      o += charGround(c, 136, 304, '#4a3a32', '#211816');
      o += ogreHut(c, 96, 144, 1) + ogreHut(c, 318, 142, 0.8);
      o += skullPole(c, 150, 150, 1.1, true) + skullPole(c, 268, 146, 0.8);
      o += campfire(c, 200, 176, 1.2);
      o += bone(120, 204, 18, 0.4, 1) + bone(300, 214, 14, -0.3, 1) + skull(c, 138, 200, 1);
      o += cracks(305, 160, 236, 6, 20, 380, 1);
      o += lavaPool(c, 214, 222, 40, 7, 306);
      o += plume(c, 80, 132, 60, 0.8, 0.5, 307);
      return o + embers(308, 18, 0, 400, 10, 200) + vignette(c, '#ffb080', '#120a08');
    },
    ruins_of_thaurissan: function (c) {
      var o = steppeSky(c, 200, true);
      o += mountain(c, 290, 118, 0.5, '#3a2a2c');
      o += hills(c, 401, 124, 12, '#3a2c2a', 36);
      // ruined city behind the lava river
      o += dwColumn(c, 22, 126, 18, 70, DSTONE, true, 11) + dwArch(c, 200, 128, 110, 70, DSTONE, false) + dwColumn(c, 300, 126, 18, 56, dk(DSTONE, 0.08), true, 12) + dwColumn(c, 350, 126, 20, 80, DSTONE, false, 13);
      o += stoneFace(c, 60, 128, 60, 26, dk(DSTONE, 0.1), 8, [[0, 0], [14, -6], [26, 2], [40, -10], [60, 0]]) + stoneFace(c, 260, 128, 44, 18, dk(DSTONE, 0.14), 8, [[0, 0], [16, -8], [30, 2], [44, -4]]);
      o += R(166, 90, 68, 38, '#1a1210') + C(200, 116, 30, glow(c, '#ff7a2a', 0.55)) + fireSprite(c, 200, 126, 0.8);
      o += fireSprite(c, 92, 108, 0.7) + fireSprite(c, 322, 104, 0.6);
      // the lava river and its broken bridge
      o += R(-2, 128, 404, 12, c.lg([[0, LAVAD], [0.4, LAVA], [1, LAVAH]]));
      o += R(-2, 124, 404, 22, glow(c, LAVA, 0.3));
      o += L('M0,132 q20,-2 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0', LAVAW, 1, 0.7) + L('M-2,128 L402,128 M-2,140 L402,140', OL, 1.6);
      o += charGround(c, 140, 402, '#4e3e36', '#221a16');
      o += P('M170,140 L176,126 L232,126 L238,140 Z', c.cel(dk(DSTONE, 0.1)), 1.6) + L('M184,126 L182,140 M198,126 L198,140 M214,126 L216,140', dk(DSTONE, 0.5), 1);
      o += statueHead(c, 62, 176, 0.86);
      o += chunk(c, [[250, 170], [268, 164], [276, 176], [258, 180]], DSTONE) + chunk(c, [[120, 196], [140, 190], [146, 204], [124, 206]], dk(DSTONE, 0.06)) + chunk(c, [[340, 226], [366, 218], [376, 234], [344, 238]], DSTONE);
      o += cracks(403, 150, 236, 7, 10, 390, 1) + lavaPool(c, 300, 196, 26, 5, 404);
      return o + embers(405, 24, 0, 400, 20, 220) + vignette(c, '#ffb080', '#120a08');
    },
    blackrock_stronghold: function (c) {
      var o = steppeSky(c, 200, true);
      o += mountain(c, 200, 110, 0.9, '#2e2428', false);
      o += plume(c, 60, 100, 90, 1, 0.5, 503) + plume(c, 330, 96, 80, 0.9, 0.4, 505);
      o += spikeWall(c, -4, 404, 132, 40, '#3a3236');
      // the gate
      o += R(168, 76, 64, 56, c.cel('#2e282c'), 1.8) + P('M176,132 L176,100 Q200,82 224,100 L224,132 Z', '#140c0a', 1.6) + C(200, 116, 26, glow(c, LAVA, 0.5));
      var pc = ''; for (var gx = 180; gx <= 220; gx += 8) pc += 'M' + gx + ',' + (gx > 184 && gx < 216 ? 92 : 100) + ' L' + gx + ',132'; for (var gy = 104; gy <= 128; gy += 8) pc += 'M176,' + gy + ' L224,' + gy;
      o += L(pc, OL, 3) + L(pc, IRONL, 1.4) + P(pd([[164, 76], [170, 58], [176, 76]], true) + pd([[194, 76], [200, 52], [206, 76]], true) + pd([[224, 76], [230, 58], [236, 76]], true), c.cel(IRONL), 1.2);
      o += spikeTower(c, 108, 134, 42, 96) + spikeTower(c, 292, 134, 42, 96);
      o += chain(c, [124, 60], [174, 84], 16, 2.4) + chain(c, [276, 60], [226, 84], 16, 2.4);
      o += wallBanner(c, 40, 100, 20, 30, HRED, embRock) + wallBanner(c, 150, 96, 16, 26, HRED, embRock) + wallBanner(c, 250, 96, 16, 26, HRED, embRock) + wallBanner(c, 360, 100, 20, 30, HRED, embRock);
      o += charGround(c, 134, 501, '#3e322e', '#1a1412');
      o += lavaStream(c, [[-4, 142], [100, 140], [200, 143], [300, 140], [404, 142]], 3);
      o += brazierIron(c, 160, 150, 1) + brazierIron(c, 240, 150, 1);
      o += cracks(502, 158, 236, 6, 20, 380, 1);
      o += P('M18,238 L24,196 L30,238 Z M40,240 L44,208 L50,240 Z M360,238 L366,200 L372,238 Z', c.cel(IRONL), 1.4);
      return o + embers(504, 22, 0, 400, 10, 220) + vignette(c, '#ffb080', '#120a08');
    },
    terror_wing_path: function (c) {
      var o = steppeSky(c, 280);
      o += mountain(c, 310, 132, 0.9, '#2e2428');
      o += spire(c, 30, 136, 70, 90, '#3a302e', 601) + spire(c, 390, 138, 60, 64, '#3a302e', 602);
      o += charGround(c, 134, 603, '#463830', '#1e1614');
      // the path climbing to the mountain
      o += F('M150,242 C170,200 210,176 240,160 C262,148 282,140 300,132 L318,132 C304,142 290,154 272,168 C250,186 250,210 290,242 Z', '#6a5a52', 0.9) + L('M150,242 C170,200 210,176 240,160 C262,148 282,140 300,132 M318,132 C304,142 290,154 272,168 C250,186 250,210 290,242', '#2a201c', 1.6, 0.8);
      o += ribcage(c, 40, 140, 148, 44) + dragonSkull(c, 196, 164, 0.8);
      o += egg(c, 340, 152, 0.9, true) + egg(c, 354, 156, 0.7) + egg(c, 328, 158, 0.6) + egg(c, 36, 226, 1.3, true) + egg(c, 58, 232, 1) + egg(c, 16, 234, 0.8);
      o += bone(110, 196, 18, 0.3, 1) + bone(360, 210, 16, -0.5, 1);
      o += cracks(604, 160, 236, 6, 10, 390, 1) + crag(c, 396, 236, 60, 16, '#3a2e2a', 605);
      o += plume(c, 240, 150, 80, 1, 0.3, 606);
      return o + embers(607, 18, 0, 400, 10, 220) + vignette(c, '#ffb080', '#120a08');
    },
    blackrock_mountain: function (c) {
      var o = steppeSky(c, 200, true);
      // the mountain face fills the sky
      var face = 'M-4,136 L-4,40 L30,24 L60,34 L90,6 L130,16 L160,-4 L240,-4 L270,14 L310,4 L340,30 L372,20 L404,34 L404,136 Z';
      o += body(c, face, '#2e2628', F('M210,-6 L406,-6 L406,138 L240,138 Z', '#000', 0.3) + L('M60,34 L50,90 L60,136 M130,16 L120,70 M310,4 L320,70 L310,136 M372,20 L380,90', '#4a3e3e', 1.6, 0.8), 2);
      o += crag(c, 96, 60, 60, 16, '#3a3032', 711) + crag(c, 300, 56, 64, 18, '#3a3032', 712) + crag(c, 110, 110, 40, 10, '#3a3032', 713) + crag(c, 294, 104, 44, 12, '#342c2e', 714);
      o += lavaStream(c, [[100, 70], [106, 90], [98, 112]], 1.2) + lavaStream(c, [[304, 66], [298, 86], [306, 100]], 1.2);
      o += lavaFall(c, 44, 28, 132, 12) + lavaFall(c, 356, 26, 132, 12);
      // the great doorway: stepped frame of dark stone
      o += stoneFace(c, 128, 136, 144, 112, '#463c3a', 12) + stoneFace(c, 146, 24, 108, 10, '#524644', 6) + stoneFace(c, 164, 14, 72, 10, '#463c3a', 6);
      o += P('M150,136 L150,56 L166,40 L234,40 L250,56 L250,136 Z', '#120a08', 2) + R(150, 40, 100, 96, c.lg([[0, '#ff7a2a', 0], [1, '#ff7a2a', 0.45]]));
      o += C(200, 124, 50, glow(c, LAVA, 0.6)) + L('M150,56 L166,40 L234,40 L250,56', lt('#463c3a', 0.2), 1.4);
      for (var fx = 0; fx < 6; fx++) o += L('M' + (156 + fx * 16) + ',32 l6,-6 l6,6', '#2a2224', 1.6);
      [132, 262].forEach(function (x) { o += stoneFace(c, x, 136, 8, 112, lt('#463c3a', 0.06), 12); });
      // colossal chains from the gate to anchors in the ground
      o += chain(c, [140, 32], [22, 170], 20, 6) + chain(c, [260, 32], [378, 170], 20, 6);
      o += flagFloor(c, 136, 200, '#4a3e38', 701);
      o += R(0, 134, 400, 8, c.lg([[0, '#000', 0.4], [1, '#000', 0]]));
      o += E(44, 136, 30, 5, LAVAH, 1.4) + E(356, 136, 30, 5, LAVAH, 1.4);
      o += R(4, 162, 36, 18, c.cel(IRON), 1.8) + R(360, 162, 36, 18, c.cel(IRON), 1.8) + C(22, 168, 5, IRONL, 1.4) + C(378, 168, 5, IRONL, 1.4);
      o += brazierIron(c, 118, 156, 1.2) + brazierIron(c, 282, 156, 1.2);
      o += cracks(702, 170, 236, 5, 20, 380, 1);
      return o + embers(703, 26, 0, 400, 10, 220) + vignette(c, '#ffb080', '#120a08');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  function bigFist(c, p, col, r) { return C(p[0], p[1], r, c.cel(col), 2.2) + L('M' + pt([p[0] - r * 0.7, p[1] - r * 0.2]) + 'l' + n(r * 0.5) + ',' + n(-r * 0.3) + 'M' + pt([p[0] - r * 0.7, p[1] + r * 0.3]) + 'l' + n(r * 0.5) + ',' + n(-r * 0.2), dk(col, 0.4), 1.1); }
  // ---- Firegut ogre head (facing left): low heavy brow, flat nose, underbite with upturned tusks, black topknot ----
  function ogHead(c, x, y, o) {
    var sk = o.skin, s = '';
    s += P(pd([[x + 12, y - 4], [x + 25, y - 13], [x + 19, y + 3]], true), c.cel(sk), 2);
    if (o.topknot !== false) s += P('M' + pt([x - 2, y - 18]) + 'C' + pt([x - 2, y - 30]) + ' ' + pt([x + 12, y - 32]) + ' ' + pt([x + 12, y - 20]) + 'Z', c.cel('#1e1614'), 2) + P('M' + pt([x + 8, y - 30]) + 'C' + pt([x + 18, y - 38]) + ' ' + pt([x + 26, y - 30]) + ' ' + pt([x + 22, y - 20]) + 'C' + pt([x + 20, y - 26]) + ' ' + pt([x + 14, y - 28]) + ' ' + pt([x + 10, y - 26]) + 'Z', c.cel('#1e1614'), 1.8) + L('M' + pt([x + 3, y - 27]) + 'L' + pt([x + 11, y - 27]), GOLD, 2);
    var d = 'M' + pt([x - 18, y - 6]) + 'C' + pt([x - 16, y - 20]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 18, y - 6]) + 'L' + pt([x + 17, y + 10]) + 'C' + pt([x + 14, y + 20]) + ' ' + pt([x + 2, y + 24]) + ' ' + pt([x - 10, y + 22]) + 'L' + pt([x - 23, y + 16]) + 'C' + pt([x - 26, y + 12]) + ' ' + pt([x - 25, y + 7]) + ' ' + pt([x - 21, y + 5]) + 'L' + pt([x - 22, y]) + 'Z';
    var paint = o.soot ? F(pd([[x - 18, y - 2], [x + 4, y - 4], [x + 5, y + 1], [x - 16, y + 3]], true), '#1e1614', 0.8) + L('M' + pt([x - 4, y + 8]) + 'l4,8 M' + pt([x + 2, y + 6]) + 'l4,8', '#1e1614', 1.8, 0.7) : '';
    s += body(c, d, sk, F('M' + pt([x + 4, y - 26]) + 'L' + pt([x + 22, y - 26]) + 'L' + pt([x + 22, y + 26]) + 'L' + pt([x + 2, y + 26]) + 'C' + pt([x + 10, y + 12]) + ' ' + pt([x + 10, y - 8]) + ' ' + pt([x + 4, y - 26]) + 'Z', dk(sk, 0.26), 0.8) + paint, 2.2);
    s += P(pd([[x - 22, y - 5], [x - 6, y - 10], [x + 8, y - 7], [x + 6, y - 2], [x - 8, y - 4], [x - 21, y]], true), c.cel(dk(sk, 0.16)), 1.6);
    s += o.glow ? glowEye(c, x - 10, y, 1.8, o.eye || '#ffcc30') : C(x - 10, y, 1.9, o.eye || '#ffcc30', 1) + C(x - 10.4, y - 0.4, 0.6, '#fff');
    s += P('M' + pt([x - 21, y + 1]) + 'C' + pt([x - 28, y + 2]) + ' ' + pt([x - 28, y + 9]) + ' ' + pt([x - 21, y + 8]) + 'Z', c.cel(dk(sk, 0.08)), 1.4);
    s += L('M' + pt([x - 22, y + 13]) + 'Q' + pt([x - 12, y + 11]) + ' ' + pt([x - 4, y + 14]), OL, 1.6);
    s += P('M' + pt([x - 20, y + 15]) + 'Q' + pt([x - 24, y + 8]) + ' ' + pt([x - 21, y + 3]) + 'L' + pt([x - 17, y + 13]) + 'Z', c.cel(BONE), 1.2) + P('M' + pt([x - 9, y + 16]) + 'Q' + pt([x - 11, y + 9]) + ' ' + pt([x - 8, y + 5]) + 'L' + pt([x - 6, y + 14]) + 'Z', c.cel(BONE), 1.2);
    if (o.helm) {
      s += body(c, 'M' + pt([x - 22, y - 6]) + 'C' + pt([x - 22, y - 26]) + ' ' + pt([x + 14, y - 32]) + ' ' + pt([x + 20, y - 8]) + 'L' + pt([x + 18, y - 2]) + 'L' + pt([x - 22, y - 1]) + 'Z', IRON, F(pd([[x + 4, y - 34], [x + 22, y - 34], [x + 22, y], [x + 6, y]], true), '#000', 0.35) + L('M' + pt([x - 22, y - 5]) + 'L' + pt([x + 19, y - 5]), IRONL, 1.6), 2.2);
      s += P(pd([[x - 12, y - 20], [x - 22, y - 36], [x - 6, y - 24]], true) + pd([[x + 6, y - 26], [x + 8, y - 44], [x + 14, y - 24]], true), c.cel(BONE), 1.4) + C(x - 16, y - 7, 1.3, IRONL, 0.6) + C(x + 12, y - 8, 1.3, IRONL, 0.6);
    }
    return s;
  }
  function ogre(c, o) {
    var sk = o.skin;
    return biped(c, {
      skin: sk, shirt: sk, pants: o.pants || '#4a3226', sleeve: sk, glove: sk, boots: o.boots || '#2a1e18', legW: 15, armW: 14, hipY: 96, shadowR: o.shadowR || 46, neck: false, belt: o.belt || '#3a2418', buckle: o.buckle || IRONL,
      torsoD: 'M28,54 C30,34 94,30 102,52 L104,82 L96,98 L34,98 L26,82 Z',
      chest: function (c) { return F('M30,72 C40,92 90,94 102,74 L106,100 L24,100 Z', lt(sk, 0.12), 0.45) + L('M58,70 Q66,74 74,70', dk(sk, 0.3), 1.3) + L('M40,62 l6,6 M44,58 l5,7 M84,64 l-4,7', dk(sk, 0.35), 1.2, 0.8) + (o.chest ? o.chest(c) : ''); },
      front: o.front, pads: o.pads, back: o.back, shins: o.shins,
      head: function (c, x, y) { return ogHead(c, x, y, o); }, hx: o.hx || 46, hy: o.hy || 28,
      near: o.near, far: o.far || [[94, 58], [106, 74], [104, 90]], wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront,
      nearHand: function (c, p) { return bigFist(c, p, sk, 8.5); }, farHand: function (c, p) { return bigFist(c, p, dk(sk, 0.08), 8); },
      top: o.top, tf: o.tf
    });
  }
  // knobbly club, its head on fire
  function burningClub(c, p, len, ang) {
    var col = '#5a3a22', q = dirQ(p, ang);
    var T = taper([q(-8, 0), q(len * 0.35, 0), q(len * 0.75, 1), q(len, 0)], 7, 22, 5), e = q(len, 0);
    var o = body(c, T.d, col, L(along(T, 0.3) + along(T, 0.66), dk(col, 0.3), 1.1) + F(ribbonBand(T, 0.62, 1), dk(col, 0.28), 0.8) + F(ribbonBand(T, 0, 0.4), '#1e1410', 0.55), 2.2);
    o += L('M' + pt(q(len * 0.7, -8)) + 'l3,-3 M' + pt(q(len * 0.85, 8)) + 'l3,3', LAVAH, 1.6) + E(e[0], e[1], 5, 10.5, c.cel('#2a1a12'), 1.8) + E(e[0], e[1], 2.4, 5.6, LAVA);
    o += C(e[0], e[1] - 8, 30, glow(c, '#ff8a2a', 0.6)) + flame(c, e[0] - 6, e[1] + 2, 0.75) + flame(c, e[0] + 6, e[1] + 2, 0.7) + flame(c, e[0], e[1] + 4, 1.2);
    return o;
  }
  // spiked iron maul
  function spikeMaul(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#3a2618', 4.6, 14), sp = '';
    var hd = pd([q(len - 12, -14), q(len + 12, -14), q(len + 12, 14), q(len - 12, 14)], true);
    [[-14, -1, -6], [-14, -1, 6], [14, 1, -6], [14, 1, 6], [-14, -1, 0], [14, 1, 0]].forEach(function (k) { sp += pd([q(len + k[2] - 3.2, k[0]), q(len + k[2], k[0] + k[1] * 10), q(len + k[2] + 3.2, k[0])], true); });
    sp += pd([q(len + 12, -5), q(len + 22, 0), q(len + 12, 5)], true);
    return o + P(sp, c.cel('#a8acb4'), 1.3) + body(c, hd, IRON, L('M' + pt(q(len - 5, -14)) + 'L' + pt(q(len - 5, 14)) + 'M' + pt(q(len + 5, -14)) + 'L' + pt(q(len + 5, 14)), '#1e1c22', 2) + F(pd([q(len - 13, 3), q(len + 13, 3), q(len + 13, 15), q(len - 13, 15)], true), '#000', 0.3), 2) +
      C(q(len - 8, -10)[0], q(len - 8, -10)[1], 1.3, '#d0d4da') + C(q(len + 8, -10)[0], q(len + 8, -10)[1], 1.3, '#d0d4da') + C(q(len - 8, 10)[0], q(len - 8, 10)[1], 1.3, '#d0d4da');
  }
  function spikePad(c, x, y, r, col, trim) {
    var d = 'M' + pt([x - r, y + 4]) + 'C' + pt([x - r, y - r]) + ' ' + pt([x + r, y - r]) + ' ' + pt([x + r, y + 4]) + 'C' + pt([x + r * 0.4, y + 2]) + ' ' + pt([x - r * 0.4, y + 2]) + ' ' + pt([x - r, y + 4]) + 'Z';
    var sp = ''; [[-0.9, -1.1], [-0.25, -1.45], [0.4, -1.35]].forEach(function (k) { var bx = x + k[0] * r * 0.7, by = y - r * 0.55; sp += pd([[bx - 3, by + 2], [bx + k[0] * r * 0.5, by + k[1] * r * 0.6], [bx + 3, by + 2]], true); });
    return P(sp, c.cel('#b8bcc4'), 1.2) + body(c, d, col, F(pd([[x + r * 0.2, y - r - 2], [x + r + 2, y - r - 2], [x + r + 2, y + 5], [x + r * 0.3, y + 5]], true), '#000', 0.35), 1.8) + (trim ? L('M' + pt([x - r + 1.8, y + 2]) + 'C' + pt([x - r + 1.4, y - r * 0.6]) + ' ' + pt([x + r - 1.4, y - r * 0.6]) + ' ' + pt([x + r - 1.8, y + 2]), trim, 1.6) : '');
  }
  // ---- orc (facing left) ----
  function orcHead(c, x, y, o) {
    var sk = o.skin || '#5e7a34', s = '';
    s += P('M' + pt([x + 8, y - 2]) + 'L' + pt([x + 21, y - 10]) + 'L' + pt([x + 12, y + 5]) + 'Z', c.cel(sk), 2);
    var d = 'M' + pt([x - 11, y - 7]) + 'C' + pt([x - 11, y - 17]) + ' ' + pt([x + 10, y - 19]) + ' ' + pt([x + 12, y - 7]) + 'L' + pt([x + 12, y + 6]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 2, y + 17]) + ' ' + pt([x - 7, y + 16]) + 'L' + pt([x - 15, y + 12]) + 'C' + pt([x - 17, y + 7]) + ' ' + pt([x - 16, y + 3]) + ' ' + pt([x - 14, y]) + 'L' + pt([x - 17, y - 1]) + 'L' + pt([x - 12, y - 4]) + 'Z';
    var paint = o.paint ? F(pd([[x - 15, y - 3], [x + 2, y - 5], [x + 3, y + 1], [x - 14, y + 2]], true), o.paint, 0.9) + F(pd([[x - 8, y + 9], [x - 2, y + 8], [x - 3, y + 16], [x - 7, y + 15]], true), o.paint, 0.85) : '';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.25), 0.8) + paint);
    s += L('M' + pt([x - 15, y - 4]) + 'L' + pt([x - 1, y - 2]), OL, 2.8);
    s += o.glow ? glowEye(c, x - 7, y + 0.5, 1.7, o.eye) : C(x - 7, y + 0.5, 1.7, o.eye || '#ffcc30', 1);
    s += L('M' + pt([x - 14, y + 9]) + 'L' + pt([x - 3, y + 9]), OL, 1.4);
    s += P('M' + pt([x - 13, y + 10]) + 'Q' + pt([x - 16, y + 4]) + ' ' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y + 9]) + 'Z', '#f4ecd6', 1.1) + P('M' + pt([x - 6, y + 10]) + 'Q' + pt([x - 8, y + 5]) + ' ' + pt([x - 6, y + 2]) + 'L' + pt([x - 3, y + 9]) + 'Z', '#f4ecd6', 1.1);
    if (o.mohawk) s += P('M' + pt([x - 6, y - 15]) + 'L' + pt([x - 4, y - 26]) + 'L' + pt([x + 2, y - 20]) + 'L' + pt([x + 5, y - 30]) + 'L' + pt([x + 9, y - 20]) + 'L' + pt([x + 15, y - 26]) + 'L' + pt([x + 12, y - 12]) + 'C' + pt([x + 6, y - 17]) + ' ' + pt([x, y - 17]) + ' ' + pt([x - 6, y - 15]) + 'Z', c.cel(o.mohawk), 1.8);
    return s;
  }
  function orc(c, o) {
    var sk = o.skin || '#5e7a34';
    return biped(c, {
      skin: sk, shirt: o.shirt || sk, pants: o.pants || '#2a2426', sleeve: o.sleeve || sk, forearm: o.forearm, glove: o.glove || sk, boots: o.boots || '#1a1416', belt: o.belt || '#2a1e1a', buckle: o.buckle || IRONL,
      head: function (c, x, y) { return (o.headBack ? o.headBack(c, x, y) : '') + orcHead(c, x, y, o) + (o.headX ? o.headX(c, x, y) : ''); }, hx: o.hx || 58, hy: o.hy || 32, neckCol: sk,
      torsoD: o.torsoD || 'M40,50 C48,42 82,42 90,50 L88,70 L84,90 L46,90 L42,70 Z', legW: o.legW || 12, armW: o.armW || 11, shadowR: o.shadowR || 36,
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, shins: o.shins, top: o.top,
      near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, tf: o.tf
    });
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 5, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
  // blazing fireball held in a hand
  function fireball(c, x, y, r) { return C(x, y, r * 3.2, glow(c, '#ff8a2a', 0.75)) + flame(c, x + r * 0.2, y + r * 0.9, r * 0.13, '#ff5a1a', LAVAH) + C(x, y, r * 0.55, '#fff6c0') + C(x + r * 1.4, y - r * 1.2, r * 0.18, LAVAH) + C(x - r * 1.2, y - r * 1.6, r * 0.14, LAVAH); }
  // ---- dragonkin pieces ----
  function wing(c, root, wrist, tips, bone, mem) {
    var m = 'M' + pt(root) + 'L' + pt(wrist) + 'L' + pt(tips[0]);
    for (var i = 1; i < tips.length; i++) { var a = tips[i - 1], b = tips[i], mid = lerp2(a, b, 0.5); m += 'Q' + pt(lerp2(mid, wrist, 0.3)) + ' ' + pt(b); }
    var last = tips[tips.length - 1]; m += 'Q' + pt(lerp2(lerp2(last, root, 0.5), wrist, 0.25)) + ' ' + pt(root) + 'Z';
    var fb = ''; tips.forEach(function (t) { fb += 'M' + pt(wrist) + 'L' + pt(t); });
    var o = body(c, m, mem, F(pd([wrist, tips[0], lerp2(tips[0], tips[1], 0.5)], true), lt(mem, 0.12), 0.6) + L(fb, dk(mem, 0.35), 3.4, 0.6), 1.8);
    o += L(fb, OL, 3.4) + L(fb, bone, 1.6) + limb('M' + pt(root) + 'L' + pt(wrist), bone, 3.8) + C(wrist[0], wrist[1], 2.8, c.cel(bone), 1.2);
    var cw = [wrist[0] - 1, wrist[1] - 5];
    return o + P(pd([[wrist[0] - 2, wrist[1] - 1], cw, [wrist[0] + 2, wrist[1] - 1]], true), '#efe6cf', 0.9);
  }
  // long-snouted dragon head facing left (x, y = centre of the skull); o.open opens the jaw, o.horns 'swept' | 'ram'
  function drakeHead(c, x, y, o) {
    var sc = o.col || BLK, s = '', hc = o.hornCol || '#d8ccb0', k = o.k || 1, q = function (u, v) { return [x + u * k, y + v * k]; };
    if (o.horns === 'ram') {
      var H = taper([q(4, -8), q(18, -18), q(28, -8), q(24, 6), q(14, 6)], 10 * k, 3 * k, 5);
      s += body(c, H.d, hc, L(bands(H, 3), dk(hc, 0.4), 1), 1.8);
    } else {
      var H1 = taper([q(2, -8), q(14, -16), q(28, -20), q(38, -18)], 7 * k, 1.5 * k, 5), H2 = taper([q(6, -4), q(18, -8), q(30, -8)], 5 * k, 1.2 * k, 4);
      s += P(H2.d, c.cel(dk(hc, 0.1)), 1.4) + P(H1.d, c.cel(hc), 1.5);
    }
    // frill spikes behind the jaw
    s += P(pd([q(8, 2), q(20, 4), q(10, 8)], true) + pd([q(6, 8), q(16, 14), q(4, 12)], true), c.cel(o.mem || BMEM), 1.2);
    var jaw = o.open ? 'M' + pt(q(4, 6)) + 'L' + pt(q(-12, 10)) + 'L' + pt(q(-24, 18)) + 'C' + pt(q(-26, 19)) + ' ' + pt(q(-25, 22)) + ' ' + pt(q(-22, 21)) + 'L' + pt(q(-4, 16)) + 'L' + pt(q(6, 12)) + 'Z' : 'M' + pt(q(4, 6)) + 'L' + pt(q(-24, 8)) + 'C' + pt(q(-26, 9)) + ' ' + pt(q(-25, 12)) + ' ' + pt(q(-22, 12)) + 'L' + pt(q(-2, 13)) + 'L' + pt(q(6, 11)) + 'Z';
    if (o.open) s += P('M' + pt(q(2, 4)) + 'L' + pt(q(-22, 5)) + 'L' + pt(q(-22, 19)) + 'L' + pt(q(-4, 14)) + 'Z', '#6a1a14', 1.2) + F(pd([q(-4, 6), q(-20, 7), q(-20, 16), q(-6, 12)], true), LAVA, 0.8);
    s += body(c, jaw, dk(sc, 0.05), F(pd([q(-26, 12), q(8, 12), q(8, 24), q(-26, 24)], true), o.belly || BELLY, 0.8), 1.8);
    var d = 'M' + pt(q(10, -2)) + 'C' + pt(q(10, -12)) + ' ' + pt(q(0, -14)) + ' ' + pt(q(-6, -10)) + 'L' + pt(q(-22, -3)) + 'C' + pt(q(-28, -1)) + ' ' + pt(q(-30, 4)) + ' ' + pt(q(-26, 6)) + 'L' + pt(q(-4, 7)) + 'C' + pt(q(4, 8)) + ' ' + pt(q(10, 6)) + ' ' + pt(q(10, -2)) + 'Z';
    s += body(c, d, sc, F(pd([q(-30, 3), q(12, 2), q(12, 12), q(-30, 12)], true), dk(sc, 0.4), 0.7) + L('M' + pt(q(-20, -3)) + 'L' + pt(q(-6, -8)), lt(sc, 0.25), 1.2, 0.8), 2);
    var th = ''; for (var i = 0; i < 4; i++) th += pd([q(-24 + i * 5, 6), q(-23 + i * 5, 9.5), q(-21.5 + i * 5, 6)], true);
    s += P(th, '#f4ecd6', 0.7);
    s += P(pd([q(-10, -9), q(-6, -16), q(-3, -10)], true) + pd([q(-18, -5), q(-16, -10), q(-13, -6)], true), c.cel(hc), 1);
    s += C(q(-25, 0)[0], q(-25, 0)[1], 0.9 * k, OL) + L('M' + pt(q(-14, -6)) + 'L' + pt(q(-3, -7)), OL, 2.2 * k) + glowEye(c, q(-8, -4)[0], q(-8, -4)[1], 1.9 * k, o.eye || '#ffb030');
    return s;
  }
  function talon(x, y, col) {
    return P('M' + n(x + 6) + ',' + n(y - 6) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 8) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 6) + ',' + n(y - 5) + ' ' + n(x - 3) + ',' + n(y - 6) + ' Z', c_(col), 2) +
      L('M' + n(x - 8) + ',' + n(y + 1) + ' l-4,0.4 M' + n(x - 3) + ',' + n(y + 1) + ' l-3.4,0.6 M' + n(x + 2) + ',' + n(y + 1) + ' l-3,0.6', OL, 3) + L('M' + n(x - 8) + ',' + n(y + 1) + ' l-4,0.4 M' + n(x - 3) + ',' + n(y + 1) + ' l-3.4,0.6 M' + n(x + 2) + ',' + n(y + 1) + ' l-3,0.6', '#efe6cf', 1.3);
  }
  function halberd(c, p, len, ang) {
    var q = dirQ(p, ang), o = haft(c, p, len, ang, '#3a2a22', 3.4, 30);
    var bl = pd([q(len - 22, -2), q(len - 26, -16), q(len - 16, -22), q(len - 6, -14), q(len - 4, -2)], true);
    o += P(bl, c.cel('#9aa0a8'), 1.6) + L('M' + pt(q(len - 24, -15)) + 'L' + pt(q(len - 15, -20)) + 'L' + pt(q(len - 7, -13)), '#e8ecf0', 1, 0.8);
    o += P(pd([q(len - 16, 2), q(len - 22, 12), q(len - 10, 2)], true), c.cel('#8a9098'), 1.4) + P(pd([q(len - 4, -3), q(len + 16, 0), q(len - 4, 3)], true), c.cel('#b0b6be'), 1.4);
    o += R(q(len - 4, 0)[0] - 3, q(len - 4, 0)[1] - 3, 6, 6, c.cel(BRK), 1.2) + L('M' + pt(q(len - 30, 0)) + 'L' + pt(q(len - 36, 0)), OL, 5) + L('M' + pt(q(len - 30, 0)) + 'L' + pt(q(len - 36, 0)), BMEM, 3);
    return o;
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var OGSK = '#c0503a', OGSK2 = '#9a3a2a';
  var MOBS = {
    firegut_ogre: function (c) {
      var sk = OGSK;
      return ogre(c, {
        skin: sk, pants: '#4a3226', soot: true, tf: at(0.94, 64, 122),
        chest: function (c) { return L('M34,42 L96,92', OL, 6) + L('M34,42 L96,92', '#4a3020', 4) + C(66, 68, 4, c.cel(IRONL), 1.4) + E(80, 60, 5, 3, '#6a1e14', 0, 0.5) + L('M44,80 q4,-3 8,0', '#1e1614', 1.4, 0.6); },
        front: function (c) { return body(c, 'M42,94 L80,94 L82,112' + rag(82, 40, 112, 6, 9) + 'Z', '#3a2a22', L('M44,98 L80,98', dk('#3a2a22', 0.4), 1.2) + L('M50,104 l4,6 M66,104 l-3,6', '#c0503a', 1.4, 0.6), 1.8); },
        pads: function (c) { return spikePad(c, 94, 52, 13, IRON); },
        near: [[36, 56], [24, 66], [24, 58]], wNear: function (c, p) { return burningClub(c, p, 32, -PI / 2 - 0.12); }
      });
    },
    firegut_brute: function (c) {
      var sk = OGSK2;
      return ogre(c, {
        skin: sk, pants: '#2e2622', boots: '#1e1816', helm: true, topknot: false, belt: IRON, buckle: '#b8bcc4', shadowR: 50,
        chest: function (c) {
          var ch = ''; for (var i = 0; i < 9; i++) ch += 'M' + pt([36 + i * 7, 46 + i * 5.4]) + 'l4,3';
          return L('M34,44 L98,92', OL, 5.4) + L('M34,44 L98,92', '#5a5a64', 3.2) + L(ch, '#8a8a94', 1.4) + E(76, 70, 6, 3, '#1e1614', 0, 0.5) + L('M50,74 l10,2 M52,80 l8,2', '#f0c0a8', 1.2, 0.5);
        },
        front: function (c) { return body(c, 'M40,94 L84,94 L86,114' + rag(86, 38, 114, 7, 13) + 'Z', '#2e2a2e', L('M42,98 L84,98', IRONL, 1.4) + C(62, 104, 3.4, c.cel(IRONL), 1.2), 1.8); },
        pads: function (c) { return spikePad(c, 96, 52, 14, IRON, BRK) + spikePad(c, 32, 52, 15, dk(IRON, 0.05), BRK); },
        shins: function (c) { return R(46, 102, 16, 10, c.cel(IRON), 1.6) + R(64, 100, 16, 10, c.cel(dk(IRON, 0.1)), 1.6); },
        near: [[34, 58], [30, 76], [44, 84]], far: [[94, 58], [98, 74], [82, 82]],
        nearHand: null,
        wNearFront: function (c, p) { return spikeMaul(c, [p[0] + 2, p[1] + 2], 64, -PI / 2 - 0.62) + bigFist(c, p, sk, 8.5); }
      });
    },
    blackrock_battlemaster: function (c) {
      var pl = '#2a2630', tab = '#8a1a14';
      return orc(c, {
        skin: '#5a6e30', shirt: pl, sleeve: pl, forearm: '#34303a', pants: '#1e1a20', glove: '#1a161c', legW: 13, armW: 12, shadowR: 42, eye: LAVAH, glow: true,
        torsoD: 'M36,50 C44,40 86,40 94,50 L92,72 L88,92 L42,92 L38,72 Z',
        back: function (c) { return body(c, 'M50,52 L86,52 C94,74 100,96 106,118 L94,114 L86,120 L76,114 L66,118 C62,96 56,74 50,52 Z', '#6a1410', F('M84,52 L108,52 L108,122 L90,122 Z', '#000', 0.3), 2); },
        chest: function (c) { return P('M42,52 L88,52 L84,80 L46,80 Z', c.cel('#34303a'), 1.8) + L('M44,53 L87,53 M46,79 L84,79', LAVA, 1.6) + L('M44,66 L86,66', '#16121a', 1.4) + embRock(c, 65, 64, 1.1) + C(48, 58, 1.3, IRONL, 0.6) + C(82, 58, 1.3, IRONL, 0.6); },
        front: function (c) { return body(c, 'M54,86 L76,86 L78,116 L65,110 L52,116 Z', tab, L('M56,90 L74,90', '#1e1a1e', 1.6) + L('M57,90 L57,112 M73,90 L73,112', GOLD, 1.2), 1.8) + P('M42,86 L54,86 L52,104 L42,102 Z M76,86 L88,86 L88,102 L78,104 Z', c.cel(pl), 1.6); },
        shins: function (c) { return P('M46,104 L60,104 L58,116 L48,116 Z', c.cel(pl), 1.6) + P('M66,104 L80,104 L78,116 L68,116 Z', c.cel(dk(pl, 0.15)), 1.6) + L('M47,106 L59,106 M67,106 L79,106', LAVA, 1.2); },
        pads: function (c) { return spikePad(c, 86, 48, 13, '#34303a', LAVA) + spikePad(c, 42, 48, 16, '#3a3640', LAVA); },
        headX: function (c, x, y) {
          var hm = 'M' + pt([x - 14, y - 2]) + 'C' + pt([x - 14, y - 22]) + ' ' + pt([x + 12, y - 24]) + ' ' + pt([x + 15, y - 4]) + 'L' + pt([x + 15, y + 8]) + 'L' + pt([x + 5, y + 7]) + 'L' + pt([x + 3, y + 3]) + 'L' + pt([x - 16, y + 4]) + 'Z';
          var hornL = taper([[x - 6, y - 16], [x - 18, y - 22], [x - 24, y - 32], [x - 20, y - 40]], 8, 2, 5), hornR = taper([[x + 6, y - 18], [x + 16, y - 26], [x + 18, y - 36], [x + 12, y - 42]], 7, 2, 5);
          return P(hornR.d, c.cel('#c8b89a'), 1.6) + body(c, hm, pl, F(pd([[x + 4, y - 26], [x + 17, y - 26], [x + 17, y + 10], [x + 6, y + 10]], true), '#000', 0.4) + L('M' + pt([x - 13, y - 9]) + 'L' + pt([x + 13, y - 8]), LAVA, 1.4), 2.2) +
            P(pd([[x - 16, y - 4], [x - 1, y - 3], [x - 1, y + 1], [x - 16, y + 1]], true), '#0e0a0a', 1) + glowEye(c, x - 8, y - 1.4, 1.5, LAVAH) + P(pd([[x - 2, y - 22], [x + 2, y - 34], [x + 6, y - 22]], true), c.cel(IRONL), 1.2) + P(hornL.d, c.cel('#e0d0b0'), 1.6);
        },
        near: [[46, 54], [36, 68], [30, 80]], far: [[82, 54], [80, 70], [62, 80]],
        wNear: function (c, p) {
          var q = dirQ([p[0] + 30, p[1] + 12], -2.3), bl = pd([q(10, -3), q(62, -8), q(76, 0), q(62, 9), q(10, 4)], true), saw = '';
          for (var i = 0; i < 5; i++) saw += pd([q(18 + i * 9, -4.5), q(22 + i * 9, -10), q(26 + i * 9, -5.4)], true);
          return haft(c, [p[0] + 30, p[1] + 12], 12, -2.3, '#2a1a14', 4, 20) + P(saw, c.cel('#6a6a74'), 1.2) + P(bl, c.cel('#4a4854'), 1.8) + L('M' + pt(q(12, 3)) + 'L' + pt(q(62, 8)) + 'L' + pt(q(74, 0)), LAVAH, 1.6) + L('M' + pt(q(14, 0)) + 'L' + pt(q(60, 0)), '#1e1c22', 1.2) + L('M' + pt(q(6, -9)) + 'L' + pt(q(6, 9)), OL, 5) + L('M' + pt(q(6, -9)) + 'L' + pt(q(6, 9)), BRK, 3);
        },
        tf: at(1.05, 64, 122)
      });
    },
    blackrock_flamecaller: function (c) {
      var rb = '#4a1612', rb2 = '#2a1a1c';
      return orc(c, {
        skin: '#62803a', shirt: rb2, sleeve: rb, forearm: '#62803a', pants: rb, boots: '#1a1416', paint: '#b0241a', mohawk: '#1e1614', belt: '#1e1614', buckle: GOLD,
        headBack: function (c, x, y) { var H = taper([[x + 6, y - 14], [x + 20, y - 22], [x + 28, y - 12], [x + 22, y - 2]], 8, 2.4, 5); return body(c, H.d, '#d8ccb0', L(bands(H, 3), '#8a7a5a', 1), 1.6); },
        headX: function (c, x, y) { return skull(c, x + 2, y - 20, 1.1) + P(pd([[x - 6, y - 26], [x - 14, y - 38], [x - 2, y - 28]], true) + pd([[x + 10, y - 26], [x + 18, y - 38], [x + 6, y - 28]], true), c.cel('#d8ccb0'), 1.2); },
        chest: function (c) { return P('M56,48 L72,48 L70,90 L58,90 Z', c.cel(rb), 1.4) + L('M58,56 L70,56 M58,66 L70,66 M58,76 L70,76', LAVA, 1.4) + skull(c, 64, 60, 0.5) + L('M44,52 Q64,64 86,52', OL, 2.2) + L('M44,52 Q64,64 86,52', '#8a6a44', 1) + C(52, 56, 1.8, c.cel(BONE), 0.8) + C(76, 56, 1.8, c.cel(BONE), 0.8); },
        front: function (c) { return body(c, 'M44,84 L84,84 L90,120' + rag(90, 38, 120, 7, 21) + 'Z', rb, F(pd([[68, 82], [92, 82], [92, 122], [72, 122]], true), '#1a0806', 0.5) + L('M44,108 L88,108', LAVA, 1.8) + P('M58,84 L70,84 L72,118 L56,118 Z', c.cel(rb2), 1.2) + embRock(c, 64, 98, 0.9), 2); },
        pads: function (c) { return body(c, 'M36,56 C38,44 60,42 64,54 L60,60 L40,62 Z', rb2, L('M38,54 C44,48 56,48 62,54', LAVA, 1.4), 1.8) + P(pd([[40, 48], [34, 38], [46, 46]], true) + pd([[50, 46], [50, 34], [55, 45]], true), c.cel(BONE), 1.1); },
        far: [[80, 54], [90, 62], [94, 72]],
        wFar: function (c, p) {
          var top = [p[0] + 6, p[1] - 50], d = 'M' + pt([p[0] - 2, p[1] + 48]) + 'L' + pt(top);
          return limb(d, '#2a1a14', 3.6) + L(d, '#5a3a24', 1, 0.6) + C(top[0], top[1] - 6, 22, glow(c, '#ff8a2a', 0.6)) + flame(c, top[0], top[1] - 2, 0.8) + P(pd([[top[0] - 7, top[1] - 4], [top[0] - 5, top[1] + 4], [top[0] + 5, top[1] + 4], [top[0] + 7, top[1] - 4]], true), 'none', 1.6) + L('M' + pt([top[0] - 7, top[1] - 6]) + 'L' + pt([top[0] - 5, top[1] + 4]) + 'L' + pt([top[0] + 5, top[1] + 4]) + 'L' + pt([top[0] + 7, top[1] - 6]) + 'M' + pt([top[0], top[1] - 7]) + 'L' + pt([top[0], top[1] + 4]), IRONL, 1.4);
        },
        near: [[48, 54], [36, 62], [24, 54]],
        wNearFront: function (c, p) { return fireball(c, p[0] - 2, p[1] - 12, 7) + C(p[0], p[1], 4.4, c.cel('#62803a'), 2); }
      });
    },
    black_broodling: function (c) {
      var sc = BLK, mem = BMEM, s = shadow(c, 64, 30);
      // far wing, high
      s += wing(c, [70, 66], [86, 34], [[110, 12], [118, 32], [116, 50], [102, 62]], dk(sc, 0.1), dk(mem, 0.15));
      // tail whipping up behind
      var T = taper([[88, 86], [104, 92], [116, 82], [116, 64], [108, 56]], 12, 2, 6);
      s += body(c, T.d, sc, F(ribbonBand(T, 0.6, 1), dk(sc, 0.4), 0.8), 2) + P(pd([[106, 58], [100, 48], [112, 54]], true), c.cel(mem), 1.2);
      // far legs
      s += limb('M84,92 L94,104 L88,114', dk(sc, 0.1), 7) + talon(86, 118, dk(sc, 0.1)) + limb('M52,88 L40,98 L34,106', dk(sc, 0.1), 6) + talon(32, 110, dk(sc, 0.1));
      // body, lunging forward
      var bd = 'M40,80 C44,66 62,62 80,66 C96,70 100,84 92,94 C84,102 66,102 54,98 C44,94 38,88 40,80 Z', sp = '';
      for (var i = 0; i < 5; i++) sp += pd([[56 + i * 8, 66 - i * 0.2], [60 + i * 8, 58], [64 + i * 8, 67]], true);
      s += P(sp, c.cel('#d8ccb0'), 1.1);
      var scl = ''; for (var a = 0; a < 4; a++) for (var b = 0; b < 2; b++) scl += 'M' + pt([58 + a * 8 + b * 4, 74 + b * 7]) + 'q3,3 6,0';
      s += body(c, bd, sc, L(scl, lt(sc, 0.18), 1.1, 0.8) + F('M40,84 C48,98 70,102 90,94 C80,92 60,92 46,84 Z', BELLY) + L('M50,90 q4,3 8,2 M60,94 q5,2 10,1 M72,95 q5,1 10,-2', dk(BELLY, 0.35), 1) + F('M80,62 C96,68 104,82 96,98 L106,98 L106,60 Z', dk(sc, 0.45), 0.85));
      // neck and head, low and forward, jaws open
      s += body(c, 'M46,80 C38,78 30,76 26,72 L32,60 C38,64 44,68 52,70 Z', sc, F('M28,70 C34,74 40,78 46,80 L44,84 C36,82 30,78 26,74 Z', BELLY, 0.95), 2);
      s += C(8, 76, 14, glow(c, '#ff8a2a', 0.7)) + P('M14,70 C8,68 2,72 0,76 C4,74 8,76 6,80 C10,78 14,80 14,76 Z', LAVA, 1.2) + F('M13,72 C9,72 6,74 5,76 C8,75 10,77 10,78 C12,77 13,76 13,74 Z', LAVAH);
      s += drakeHead(c, 30, 64, { col: sc, open: true, k: 0.72, mem: mem, eye: '#ffc030', belly: BELLY });
      // near legs, forelimb reaching with claws
      s += limb('M76,94 L82,106 L74,116', sc, 7.6) + talon(74, 120, sc);
      s += limb('M50,86 L40,92 L30,96', sc, 7) + clawHand([28, 97], sc, 0.9);
      // near wing, raised forward
      s += wing(c, [58, 70], [46, 36], [[28, 14], [52, 8], [70, 22], [72, 44]], sc, mem);
      return G(s, at(0.92, 64, 122));
    },
    black_dragonspawn: function (c) {
      var sc = BLK, bel = BELLY;
      return biped(c, {
        skin: sc, shirt: sc, pants: sc, sleeve: sc, glove: sc, digi: true, feet: talon, legW: 11, armW: 10, shadowR: 38, neck: false, hx: 50, hy: 26,
        torsoD: 'M40,50 C46,40 82,40 90,50 L88,70 L82,90 L48,90 L44,70 Z',
        back: function (c) {
          var T = taper([[80, 86], [98, 98], [112, 112], [124, 108]], 14, 2, 6);
          return wing(c, [80, 50], [96, 20], [[118, 8], [124, 30], [118, 52], [100, 64]], dk(sc, 0.1), dk(BMEM, 0.1)) + body(c, T.d, sc, F(ribbonBand(T, 0.6, 1), dk(sc, 0.45), 0.8), 2) + P(pd([[118, 106], [128, 104], [122, 112]], true), c.cel(BMEM), 1.2);
        },
        chest: function (c) { var d = 'M52,48 L76,48 L74,90 L56,90 Z', l = ''; for (var y = 54; y < 90; y += 7) l += 'M53,' + y + ' L75,' + y; return P(d, c.cel(bel), 1.6) + L(l, dk(bel, 0.4), 1.1) + L('M78,52 q4,4 8,2 M80,62 q4,4 8,2 M80,72 q4,3 6,2', lt(sc, 0.2), 1, 0.8); },
        front: function (c) { return body(c, 'M46,84 L84,84 L86,96 L64,102 L44,96 Z', '#3a2a22', L('M46,88 L84,88', BRK, 1.6), 1.8); },
        pads: function (c) { return spikePad(c, 84, 50, 11, IRON, BRK) + spikePad(c, 44, 50, 13, '#3e3a44', BRK); },
        head: function (c, x, y) { return body(c, 'M' + pt([x + 4, y + 6]) + 'L' + pt([x + 18, y + 4]) + 'L' + pt([x + 20, y + 22]) + 'L' + pt([x + 6, y + 24]) + 'Z', sc, F(pd([[x + 4, y + 10], [x + 12, y + 10], [x + 12, y + 26], [x + 4, y + 26]], true), bel, 0.9), 2) + drakeHead(c, x, y, { col: sc, eye: '#ffb030', belly: bel }); },
        near: [[48, 54], [38, 66], [32, 76]], far: [[82, 54], [90, 66], [94, 76]],
        nearHand: function (c, p) { return clawHand(p, sc, 1); }, farHand: function (c, p) { return clawHand(p, dk(sc, 0.1), 1); },
        wNearFront: function (c, p) { return halberd(c, [p[0], p[1] + 30], 100, -PI / 2 - 0.08) + clawHand(p, sc, 1); },
        tf: at(1.02, 64, 122)
      });
    },
    flamekin_spitter: function (c) {
      var s = E(64, 121, 28, 5, c.rg([[0, '#ff9a30', 0.6], [0.6, '#ff6a20', 0.25], [1, '#ff6a20', 0]])) + C(66, 96, 40, glow(c, '#ff8a2a', 0.35));
      // cinder base
      s += chunk(c, [[40, 112], [56, 108], [60, 122], [38, 122]], '#3a2a26') + chunk(c, [[70, 110], [90, 112], [94, 122], [68, 122]], '#34262a') + L('M46,114 L52,120 M78,114 L84,118', LAVAH, 1.2);
      // flame hair rising behind the body
      var wf = function (t) { return 18 * Math.sin(Math.min(1, 0.3 + t) * PI * 0.7) - t * t * 8; };
      s += P(blaze(66, 96, 48, wf, 6, 31, 6), c.lg([[0, '#ff9a2a'], [0.55, '#f06a1e'], [1, '#c8341a']]), 2.2) + F(blaze(66, 94, 58, function (t) { return wf(t) * 0.6; }, 5, 33, 5), LAVAH, 0.95) + F(blaze(66, 90, 68, function (t) { return wf(t) * 0.28; }, 4, 37, 4), '#fff2b0', 0.95);
      // little arms
      s += L('M46,100 Q36,98 32,90 M86,98 Q96,96 98,88', OL, 7) + L('M46,100 Q36,98 32,90 M86,98 Q96,96 98,88', '#f06a1e', 4) + flame(c, 32, 92, 0.4) + flame(c, 98, 90, 0.4);
      // round molten body with the face
      var bd = ellD(66, 100, 24, 19);
      s += body(c, bd, '#e8581c', F('M72,78 L96,78 L96,124 L70,124 C80,110 80,92 72,78 Z', '#a82a14', 0.7) + E(56, 92, 9, 5, LAVAH, 0, 0.55), 2.4);
      s += F(pd([[46, 88], [59, 92], [46, 95]], true) + pd([[64, 92], [76, 88], [75, 95]], true), '#3a0806') + glowEye(c, 52, 95, 2.2, '#fff8c0') + glowEye(c, 69, 95, 2.1, '#fff8c0');
      s += E(56, 107, 8.6, 6.4, '#3a0806', 1.6) + E(55, 108, 5.4, 3.8, '#b8260e') + E(54, 108, 2.8, 2, LAVAH);
      // the spit: a molten glob arcing left
      s += L('M48,106 Q34,98 22,100', LAVA, 5, 0.4) + L('M48,106 Q34,98 22,100', LAVAH, 2, 0.8) + C(18, 100, 14, glow(c, LAVA, 0.7)) + C(18, 100, 5.4, c.rg([[0, '#fff6c0'], [0.5, LAVAH], [1, LAVA]]), 1.6) + C(28, 104, 1.6, LAVAH) + C(32, 92, 1.3, LAVAH) + C(12, 94, 1.2, LAVA);
      var r = rng(35); for (var i = 0; i < 7; i++) s += C(44 + r() * 50, 36 + r() * 36, 0.9 + r() * 1.1, i % 2 ? LAVAH : '#ff8a2a', 0, 0.9);
      return G(s, at(0.95, 64, 122));
    },
    blazing_elemental: function (c) {
      var s = E(64, 121, 34, 6, c.rg([[0, '#ffb040', 0.7], [0.6, '#ff7a20', 0.25], [1, '#ff7a20', 0]])) + C(64, 64, 62, glow(c, '#ff9a2a', 0.35));
      var wf = function (t) { return 3 + 25 * Math.pow(t, 0.8) - (t > 0.82 ? (t - 0.82) * 80 : 0); };
      // far arm
      var arm = function (pts, w0, w1, col) { var T = taper(pts, w0, w1, 5); return P(T.d, c.cel(col), 2) + F(ribbonBand(T, 0.25, 0.7), LAVAH, 0.9); };
      s += arm([[88, 50], [100, 62], [106, 78], [104, 90]], 12, 6, '#e8501e') + flame(c, 104, 96, 0.6, '#ff6a20', LAVAH) + chunk(c, [[96, 66], [108, 64], [112, 76], [100, 78]], '#2e2426');
      // vortex body: point at the bottom, wide shoulders
      s += P(blaze(64, 122, 44, wf, 8, 41, -2), c.lg([[0, LAVAH], [0.5, '#f0581e'], [1, '#c02a14']]), 2.4);
      s += F(blaze(64, 118, 50, function (t) { return wf(t) * 0.62; }, 7, 43, -2), LAVAH, 0.95) + F(blaze(64, 112, 58, function (t) { return wf(t) * 0.32; }, 5, 47, -1), '#fff2b0', 0.95);
      s += L('M50,104 C58,98 70,98 78,104 M46,92 C56,86 72,86 82,92', '#c02a14', 1.8, 0.6);
      // floating obsidian shoulder plates
      s += chunk(c, [[30, 46], [44, 38], [56, 44], [50, 56], [34, 58]], '#2e2426', L('M38,48 L46,52', LAVAH, 1.4)) + chunk(c, [[74, 44], [88, 38], [98, 46], [94, 58], [78, 56]], '#2a2224', L('M84,46 L90,52', LAVAH, 1.4));
      // head: flame crown with horns of fire and a black obsidian mask
      s += C(62, 28, 26, glow(c, '#ffc040', 0.5)) + flame(c, 50, 30, 0.9, '#ff6a20', LAVAH) + flame(c, 74, 30, 0.9, '#ff6a20', LAVAH) + flame(c, 62, 30, 1.5, '#ff6a20', LAVAH);
      s += P('M52,24 L72,24 L74,34 L66,44 L58,44 L50,34 Z', c.cel('#2a2024'), 1.8) + F(pd([[52, 28], [60, 32], [52, 34]], true) + pd([[64, 32], [72, 28], [72, 34]], true), LAVAW) + C(56, 31, 5, glow(c, LAVAH, 0.8)) + C(68, 31, 5, glow(c, LAVAH, 0.8)) + L('M58,40 L66,40', LAVA, 1.4);
      // near arm, reaching with fire claws
      s += arm([[40, 52], [28, 62], [20, 76], [18, 88]], 13, 6, '#f0581e') + chunk(c, [[18, 66], [32, 62], [34, 74], [22, 78]], '#322628', L('M24,70 L30,72', LAVAH, 1.2));
      s += L('M18,90 l-6,6 M20,92 l-2,8 M22,90 l4,7', OL, 4) + L('M18,90 l-6,6 M20,92 l-2,8 M22,90 l4,7', LAVAH, 2);
      var r = rng(49); for (var i = 0; i < 10; i++) s += C(18 + r() * 92, 6 + r() * 60, 0.9 + r() * 1.3, i % 2 ? LAVAH : '#ff8a2a', 0, 0.9);
      return G(s, at(1.02, 64, 122));
    },
    gorlash: function (c) {
      var sc = '#42383c', bel = '#b04a22';
      return biped(c, {
        skin: sc, shirt: sc, pants: sc, sleeve: sc, glove: sc, digi: true, feet: talon, legW: 15, armW: 14, hipY: 94, shadowR: 50, neck: false, hx: 38, hy: 40,
        legF: 'M76,94 L90,104 L80,114 L82,116', legN: 'M52,94 L60,104 L48,114 L46,116', footF: [82, 121], footN: [46, 121],
        torsoD: 'M26,58 C30,34 90,26 104,48 L104,78 L94,98 L38,98 L28,84 Z',
        back: function (c) {
          var T = taper([[90, 90], [108, 100], [120, 114], [126, 104]], 18, 3, 6), sp = '';
          for (var i = 0; i < 6; i++) sp += pd([[46 + i * 10, 38 - i * 0.4 + (i > 3 ? (i - 3) * 3 : 0)], [52 + i * 10, 22 + i * 1.4], [56 + i * 10, 40 + (i > 3 ? (i - 3) * 3 : 0)]], true);
          return wing(c, [86, 46], [100, 28], [[114, 18], [122, 34], [114, 50]], dk(sc, 0.1), '#5a1e24') + body(c, T.d, sc, F(ribbonBand(T, 0.6, 1), dk(sc, 0.45), 0.8), 2) + P(sp, c.cel('#d8ccb0'), 1.3);
        },
        chest: function (c) { var d = 'M42,54 C54,48 78,48 90,56 C95,72 91,86 80,96 L52,96 C42,86 37,70 42,54 Z', l = ''; for (var y = 61; y < 96; y += 7) l += 'M36,' + y + ' Q64,' + (y + 3) + ' 96,' + y; return P(d, c.cel(bel), 1.8) + '<g clip-path="url(#' + c.clip(d) + ')">' + L(l, dk(bel, 0.4), 1.2) + '</g>' + L('M92,56 L98,70 M96,52 L102,62', LAVA, 1.6) + L('M30,64 L38,74', LAVAH, 1.4); },
        front: function (c) { return body(c, 'M42,90 L88,90 L90,104' + rag(90, 40, 104, 6, 51) + 'Z', '#2a201c', L('M44,94 L88,94', IRON, 2), 1.8); },
        pads: function (c) { return spikePad(c, 92, 50, 13, '#3e363a') + spikePad(c, 30, 56, 15, '#463e42'); },
        head: function (c, x, y) { return drakeHead(c, x, y, { col: sc, horns: 'ram', k: 1.18, eye: '#ff6a2a', belly: bel, mem: '#5a1e24', open: true, hornCol: '#e0d4b8' }); },
        near: [[34, 62], [24, 80], [22, 96]], far: [[96, 58], [104, 76], [100, 92]],
        nearHand: function (c, p) { return R(p[0] - 8, p[1] - 12, 14, 10, c.cel(IRON), 1.6) + P(pd([[p[0] - 6, p[1] - 12], [p[0] - 10, p[1] - 20], [p[0] - 2, p[1] - 12]], true), c.cel(IRONL), 1) + clawHand(p, sc, 1.5); },
        farHand: function (c, p) { return clawHand(p, dk(sc, 0.1), 1.4); },
        tf: at(1.04, 64, 122)
      });
    },
    volchan: function (c) {
      var cr = '#2e2424', cr2 = '#3e302c', s = shadow(c, 64, 54) + E(64, 121, 52, 7, c.rg([[0, LAVA, 0.6], [1, LAVA, 0]]));
      var lava = function (d, w) { return L(d, LAVAD, (w || 2.6) + 1.2) + L(d, LAVA, w || 2.6) + L(d, LAVAH, (w || 2.6) * 0.4); };
      // mane of fire behind
      s += C(64, 40, 64, glow(c, '#ff7a2a', 0.5)) + P(blaze(64, 96, 0, function (t) { return 16 + 40 * Math.sin(Math.min(1, t * 1.1) * PI * 0.8) - t * 20; }, 8, 61, 0), c.lg([[0, '#ff9a2a'], [0.6, '#e8481e'], [1, '#b82a14']]), 2.2);
      s += F(blaze(64, 90, 12, function (t) { return 12 + 28 * Math.sin(Math.min(1, t * 1.1) * PI * 0.8) - t * 16; }, 7, 63, 0), LAVAH, 0.9);
      // raised far arm with a burning fist
      var FA = taper([[96, 50], [112, 40], [116, 22], [110, 10]], 22, 16, 5);
      s += body(c, FA.d, cr, F(ribbonBand(FA, 0.6, 1), '#1a1212', 0.7) + lava(along(FA, 0.45), 2.2), 2.2) + C(108, 8, 22, glow(c, '#ffb040', 0.8)) + C(108, 10, 12, c.rg([[0, '#fff6c0'], [0.5, LAVAH], [1, LAVA]]), 2) + flame(c, 104, 4, 0.7) + flame(c, 112, 2, 0.6);
      // legs
      s += chunk(c, [[70, 90], [94, 88], [100, 120], [74, 122]], dk(cr, 0.1), lava('M80,96 L86,108 L82,118', 2));
      s += chunk(c, [[30, 90], [58, 92], [60, 122], [26, 122]], cr, lava('M40,98 L46,108 L42,120', 2));
      // torso: crust plates over a molten core
      var td = 'M18,56 C20,30 102,26 108,52 L102,92 L28,96 Z';
      s += body(c, td, cr2, C(62, 66, 22, c.rg([[0, '#fff6c0'], [0.35, LAVAH], [0.7, LAVA], [1, LAVAD]])) + lava('M26,50 L40,58 L36,74 M92,46 L84,60 L92,76 M40,88 L52,80 L66,86 L78,80 L90,88', 2.6) + F('M80,28 L112,28 L112,96 L86,96 C94,72 90,48 80,28 Z', '#000', 0.3), 2.4);
      s += chunk(c, [[40, 50], [56, 44], [60, 54], [50, 62], [40, 60]], cr, '') + chunk(c, [[68, 46], [84, 46], [88, 58], [74, 60]], dk(cr, 0.05), '') + chunk(c, [[46, 72], [58, 76], [54, 88], [42, 86]], cr, '') + chunk(c, [[70, 74], [84, 70], [86, 84], [72, 88]], dk(cr, 0.05), '');
      // head sunk between the shoulders, horned, flame crown
      s += flame(c, 52, 20, 1.1) + flame(c, 70, 18, 1.2) + flame(c, 61, 16, 1.6);
      s += P('M40,20 C36,10 38,2 44,-2 C44,6 46,12 50,16 Z', c.cel('#1e1616'), 1.8) + P('M80,18 C86,10 86,2 80,-3 C80,6 76,12 72,15 Z', c.cel('#1e1616'), 1.8);
      s += body(c, 'M44,16 C50,8 74,8 80,16 L78,36 C70,42 54,42 46,36 Z', cr, F('M66,6 L84,6 L84,44 L68,44 Z', '#000', 0.3), 2.2) + F(pd([[48, 22], [58, 26], [48, 28]], true) + pd([[66, 26], [76, 22], [76, 28]], true), LAVAW) + C(53, 25, 6, glow(c, LAVAH, 0.8)) + C(71, 25, 6, glow(c, LAVAH, 0.8)) + P('M52,32 L72,32 L68,38 L56,38 Z', LAVA, 1.4) + L('M56,32 l1,4 M62,32 l0,5 M68,32 l-1,4', '#1e1616', 1.2);
      // shoulders
      s += chunk(c, [[12, 44], [30, 34], [44, 42], [40, 58], [18, 60]], cr2, lava('M22,46 L30,52', 1.8)) + chunk(c, [[84, 38], [102, 34], [112, 46], [106, 58], [88, 54]], dk(cr2, 0.1), lava('M96,42 L100,50', 1.8));
      // near arm, huge molten fist dragging low
      var NA = taper([[22, 56], [10, 72], [10, 88], [16, 98]], 22, 18, 5);
      s += body(c, NA.d, cr, F(ribbonBand(NA, 0.6, 1), '#1a1212', 0.6) + lava(along(NA, 0.4), 2.4), 2.2) + C(18, 104, 20, glow(c, '#ffb040', 0.7)) + chunk(c, [[4, 96], [26, 94], [32, 108], [22, 116], [6, 112]], '#3a2c28', lava('M10,102 L18,106 L26,102 M14,110 L22,110', 2));
      var r = rng(69); for (var i = 0; i < 12; i++) s += C(4 + r() * 120, 0 + r() * 60, 0.9 + r() * 1.4, i % 2 ? LAVAH : '#ff8a2a', 0, 0.9);
      return G(s, at(0.88, 64, 124));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(CHARM), 2.5); }
  function phScene(c) { return steppeSky(c) + ground(c, 150, CHARM, CHAR); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#44382f"/></svg>'; }
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
