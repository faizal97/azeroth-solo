/* art_coinworks.js — The Coinworks art for Realm of Loner (dungeon, levels 40-44: the Deepgold Company's mint dug into the
 * sandstone under Coppergulch in Sirocco, where caravan gold is melted and struck into coins for the Black Ledger; the
 * riveted brass gate in the cliff below the town, the smelting floor and the strike room with its vault, and the bosses
 * Foreman Nettlecog, the Great Press, Emberhide and Mintmaster Coinwhistle).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * The Coinworks keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_zulfarrak.js; the desert pieces
 * (sky, dunes, sand floor, palm, crates) are copies of art_tanaris.js; the goblin rig is a copy of art_stranglethorn.js
 * (plus goggles over the eyes, a monocle, a small top hat and soot) and the drake body grows out of the whelp of
 * art_redridge.js. The mint pieces (coins, stacks, heaps, strongboxes, ledgers, chains, rails, crucible, conveyor,
 * furnace, screw press, vault door) and the construct are new here. The Black Ledger's mark is three curved claw
 * slashes; it is on the coins, the strongboxes, the vault door, the keystone of the gate and the Great Press's die.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix cw<counter>_).
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
  function Ctx() { this.p = 'cw' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  SCENE PIECES (shared house style, copies of art_zulfarrak.js)
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

  // ---- desert pieces (shared copies of art_tanaris.js) ----
  function ripples(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), d = ''; x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / ((y1 - y0) || 1), w = 5 + t * 16, x = x0 + r() * (x1 - x0); d += 'M' + pt([x - w, y]) + 'q' + n(w * 0.5) + ',' + n(-1.6 - t * 2) + ' ' + n(w) + ',0 q' + n(w * 0.4) + ',' + n(1 + t) + ' ' + n(w * 0.8) + ',0'; }
    return L(d, col, 1.1, 0.75);
  }
  function farDunes(c, seed, base, amp, col, step) { return hills(c, seed, base, amp, col, step || 60) + hills(c, seed + 1, base + 1, amp * 0.5, dk(col, 0.08), (step || 60) * 1.4); }
  function sandFloor(c, y, top, bot, seed) {
    var d = 'M-4,' + n(y) + ' C90,' + n(y - 5) + ' 170,' + n(y + 4) + ' 250,' + n(y - 3) + ' C310,' + n(y - 7) + ' 360,' + n(y + 1) + ' 404,' + n(y - 4) + ' L404,242 L-4,242 Z';
    return body(c, d, top, R(-4, y - 8, 408, 250 - y, c.lg([[0, lt(top, 0.18), 0.5], [1, bot, 0.9]])), 1.6) + ripples(seed || 5, y + 8, 236, dk(top, 0.2), 22);
  }
  function dSky(c, sx, sy, top, mid, bot) {
    return sky(c, top || '#a8d0e0', mid || '#e6eedc', bot || '#faeec4') + C(sx, sy, 110, glow(c, '#fffbea', 0.6)) + C(sx, sy, 15, '#fffdf4') + C(sx, sy, 22, '#fffdf4', 0, 0.35);
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
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.5]) + 'Q' + pt([x - w / 2, top]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top]) + ' ' + pt([x + w / 2, top + w * 0.5]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }

  // ============================================================
  //  THE COINWORKS: palette
  // ============================================================
  var SST = '#d8aa6c', SSTD = '#b07c44', SSTX = '#7a4e2a', PALM = '#6a9a3a', TRUNK = '#9a7448', WOOD = '#8a6440';
  var BRASS = '#c8963a', BRASSD = '#8a5e22', IRON = '#5e5c64', IROND = '#3a3840', SOOT = '#241c1c';
  var GOLD = '#f2c03c', GOLDD = '#a8761e', GOLDL = '#ffe896', MOLT = '#ff8a1e', MOLTL = '#ffe070', LEATH = '#8a5430', BONE = '#ece0c2';
  var LEDG = '#2a2430', LEDR = '#8a1e24';
  var DRK = '#2c2530', BELLY = '#d8641e', MEM = '#7a2a24', EMB = '#ffb030';

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
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
  // riveted metal plate (x, y = top left)
  function plate(c, x, y, w, h, col, rv, rcol) {
    var o = R(x, y, w, h, c.cel(col), 1.6) + F(pd([[x + w * 0.66, y], [x + w, y], [x + w, y + h], [x + w * 0.66, y + h]], true), dk(col, 0.2), 0.55) + L('M' + pt([x + 2, y + 2]) + 'L' + pt([x + w - 2, y + 2]), lt(col, 0.3), 1, 0.7);
    if (rv) { var k = Math.max(1, Math.round(w / rv)); o += rivetLine(x + 3, y + 3, x + w - 3, y + 3, k, 1.2, rcol) + rivetLine(x + 3, y + h - 3, x + w - 3, y + h - 3, k, 1.2, rcol); }
    return o;
  }
  // gold coin seen face on (r >= 5 carries the claw mark)
  function coin(c, x, y, r, col) {
    col = col || GOLD;
    var o = C(x, y, r, c.cel(col), Math.max(0.8, r * 0.26)) + L(ellD(x, y, r * 0.7, r * 0.7), dk(col, 0.3), Math.max(0.5, r * 0.12));
    if (r >= 5) o += claw(x, y, r * 0.075, dk(col, 0.42));
    return o + E(x - r * 0.38, y - r * 0.4, r * 0.3, r * 0.18, '#fffbe0', 0, 0.85);
  }
  // coin lying flat, seen from above at an angle
  function flatCoin(c, x, y, r, col) { col = col || GOLD; return E(x, y + r * 0.2, r, r * 0.42, dk(col, 0.3), Math.max(0.7, r * 0.22)) + E(x, y, r, r * 0.4, c.cel(col), Math.max(0.7, r * 0.22)) + E(x - r * 0.3, y - r * 0.1, r * 0.3, r * 0.1, '#fffbe0', 0, 0.8); }
  // a column of stacked coins (x = centre, y = bottom), k coins
  function coinStack(c, x, y, r, k, col) {
    col = col || GOLD; var h = k * r * 0.34, ry = r * 0.4, ln = '';
    for (var i = 1; i < k; i++) ln += 'M' + pt([x - r, y - i * r * 0.34]) + 'q' + n(r) + ',' + n(ry * 0.9) + ' ' + n(r * 2) + ',0';
    var d = 'M' + pt([x - r, y - h]) + 'L' + pt([x - r, y]) + 'A' + n(r) + ',' + n(ry) + ' 0 0,0 ' + pt([x + r, y]) + 'L' + pt([x + r, y - h]) + 'Z';
    return E(x, y + 1, r * 1.3, ry * 1.1, '#000', 0, 0.3) + body(c, d, col, L(ln, dk(col, 0.4), Math.max(0.5, r * 0.1)) + F(pd([[x + r * 0.35, y - h - 2], [x + r + 2, y - h - 2], [x + r + 2, y + ry + 2], [x + r * 0.35, y + ry + 2]], true), dk(col, 0.25), 0.7), Math.max(0.8, r * 0.2)) +
      E(x, y - h, r, ry, c.cel(lt(col, 0.12)), Math.max(0.8, r * 0.2)) + E(x - r * 0.3, y - h - ry * 0.2, r * 0.32, ry * 0.3, '#fffbe0', 0, 0.8);
  }
  // heap of coins: a mound with coins and glints on it (x = centre, y = base)
  function coinPile(c, x, y, w, h, seed, col) {
    col = col || GOLD; var r = rng(seed || 9), o = E(x, y + 2, w * 0.56, h * 0.16 + 2, '#000', 0, 0.3);
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.36, y - h * 0.5]) + ' ' + pt([x - w * 0.16, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.18, y - h]) + ' ' + pt([x + w * 0.38, y - h * 0.46]) + ' ' + pt([x + w / 2, y]) + 'Z', cs = '';
    for (var i = 0; i < Math.round(w * h / 34); i++) {
      var u = r() * 2 - 1, v = r(), px = x + u * w * 0.44 * (1 - v * 0.5), py = y - v * h * (1 - Math.abs(u) * 0.55) + 1, rr = 1.6 + r() * 1.6;
      cs += E(px, py, rr * 1.2, rr * 0.5, r() < 0.5 ? lt(col, 0.25) : dk(col, 0.18), 0.5) + (r() < 0.25 ? E(px - rr * 0.3, py - rr * 0.1, rr * 0.4, rr * 0.16, '#fffbe0', 0, 0.9) : '');
    }
    o += body(c, d, col, cs + F('M' + pt([x + w * 0.1, y - h - 2]) + 'C' + pt([x + w * 0.3, y - h * 0.7]) + ' ' + pt([x + w * 0.42, y - h * 0.3]) + ' ' + pt([x + w * 0.5 + 2, y + 2]) + 'L' + pt([x + w * 0.6, y + 2]) + 'L' + pt([x + w * 0.6, y - h - 2]) + 'Z', dk(col, 0.28), 0.6), 1.8);
    return o + glint(x - w * 0.14, y - h * 0.7, 3) + glint(x + w * 0.2, y - h * 0.4, 2.2);
  }
  function glint(x, y, s, col) { return F('M' + pt([x, y - s * 2]) + 'Q' + pt([x + s * 0.25, y - s * 0.25]) + ' ' + pt([x + s * 2, y]) + 'Q' + pt([x + s * 0.25, y + s * 0.25]) + ' ' + pt([x, y + s * 2]) + 'Q' + pt([x - s * 0.25, y + s * 0.25]) + ' ' + pt([x - s * 2, y]) + 'Q' + pt([x - s * 0.25, y - s * 0.25]) + ' ' + pt([x, y - s * 2]) + 'Z', col || '#fffbe0', 0.95); }
  // scattered gold dust and sparkles
  function goldDust(seed, x0, x1, y0, y1, cnt, col) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + r() * 1.1; o += r() < 0.12 ? glint(x, y, 1.4 + r()) : E(x, y, s * 1.3, s * 0.6, r() < 0.5 ? (col || GOLD) : lt(col || GOLD, 0.4), 0, 0.9); }
    return o;
  }
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
  // upright ledger books on a shelf (spines)
  function spines(c, x, y, k, seed) {
    var r = rng(seed || 4), o = '', cx = x;
    for (var i = 0; i < k; i++) { var w = 5 + r() * 3, h = 16 + r() * 6, col = r() < 0.7 ? LEDG : LEDR; o += R(cx, y - h, w, h, c.cel(col), 1.1) + L('M' + pt([cx + 1, y - h + 3]) + 'L' + pt([cx + w - 1, y - h + 3]) + 'M' + pt([cx + 1, y - 4]) + 'L' + pt([cx + w - 1, y - 4]), GOLD, 0.9); cx += w + 0.6; }
    return o;
  }
  // small balance scale hanging from (x, y); tip < 0 lowers the left pan
  function balance(c, x, y, s, tip) {
    tip = tip == null ? -0.2 : tip;
    var ca = Math.cos(tip), sa = Math.sin(tip), bl = 14 * s, lx = x - ca * bl, ly = y + 4 * s - sa * bl, rx = x + ca * bl, ry = y + 4 * s + sa * bl, o = '';
    o += L(ellD(x, y - 2 * s, 2 * s, 2 * s), OL, 2 * s) + L(ellD(x, y - 2 * s, 2 * s, 2 * s), GOLD, 0.9 * s) + limb('M' + pt([x, y]) + 'L' + pt([x, y + 5 * s]), BRASS, 1.4 * s);
    o += L('M' + pt([lx, ly]) + 'L' + pt([rx, ry]), OL, 3 * s) + L('M' + pt([lx, ly]) + 'L' + pt([rx, ry]), GOLD, 1.5 * s) + C(x, y + 4 * s, 1.6 * s, c.cel(GOLD), 0.8 * s);
    [[lx, ly], [rx, ry]].forEach(function (p, i) {
      var py = p[1] + 11 * s;
      o += L('M' + pt(p) + 'L' + pt([p[0] - 5 * s, py]) + 'M' + pt(p) + 'L' + pt([p[0] + 5 * s, py]), '#3a2a1a', 0.7 * s);
      if (i === 0) o += flatCoin(c, p[0] - 1 * s, py - 1.4 * s, 2.4 * s) + flatCoin(c, p[0] + 1.4 * s, py - 2.6 * s, 2.2 * s);
      o += P('M' + pt([p[0] - 6 * s, py]) + 'Q' + pt([p[0], py + 5 * s]) + ' ' + pt([p[0] + 6 * s, py]) + 'Z', c.cel(BRASS), 1 * s);
    });
    return o;
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
  // gear wheel (x, y = hub)
  function gear(c, x, y, r, k, col, a0) {
    col = col || BRASS; a0 = a0 || 0; var p = [];
    for (var i = 0; i < k * 4; i++) { var a = a0 + PI * 2 * i / (k * 4), rr = (i % 4 < 2) ? r : r * 0.8; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    return body(c, pd(p, true), col, F(pd([[x + r * 0.2, y - r - 2], [x + r + 2, y - r - 2], [x + r + 2, y + r + 2], [x + r * 0.2, y + r + 2]], true), dk(col, 0.25), 0.6), Math.max(1, r * 0.1)) +
      L(ellD(x, y, r * 0.55, r * 0.55), dk(col, 0.35), Math.max(0.8, r * 0.08)) + C(x, y, r * 0.22, c.cel(dk(col, 0.2)), Math.max(0.8, r * 0.08)) + C(x, y, r * 0.08, OL);
  }
  // brass pipe along a polyline, with flanges at the joints
  function pipe(c, pts, w, col) {
    col = col || BRASS; var d = pd(pts), o = L(d, OL, w + 3.4) + L(d, col, w) + L(d, lt(col, 0.35), w * 0.25, 0.7);
    pts.forEach(function (p) { o += C(p[0], p[1], w * 0.78, c.cel(dk(col, 0.1)), 1.2) + C(p[0], p[1], w * 0.2, lt(col, 0.4)); });
    return o;
  }
  // perspective cart rails: centre from (x0, y0) to (x1, y1), half gauge g0 -> g1, k ties
  function rails(c, x0, y0, g0, x1, y1, g1, k, bend) {
    bend = bend || 0; var P0 = function (t) { return [x0 + (x1 - x0) * t + bend * t * (1 - t), y0 + (y1 - y0) * t]; }, g = function (t) { return g0 + (g1 - g0) * t; }, o = '', A = [], B = [];
    for (var i = 0; i <= k; i++) {
      var t = Math.pow(i / k, 1.45), q = P0(t), w = g(t), th = 1.2 + 4 * t;
      o += P(pd([[q[0] - w * 1.35, q[1] - th / 2], [q[0] + w * 1.35, q[1] - th / 2], [q[0] + w * 1.35, q[1] + th / 2], [q[0] - w * 1.35, q[1] + th / 2]], true), c.cel('#7a5a3a'), 0.6 + t * 0.9);
    }
    for (var j = 0; j <= 20; j++) { var u = j / 20, qq = P0(u), ww = g(u); A.push([qq[0] - ww, qq[1]]); B.push([qq[0] + ww, qq[1]]); }
    [A, B].forEach(function (S) { o += L(pd(S), OL, 3.4) + L(pd(S), '#8a8a92', 1.8) + L(pd(S.map(function (p) { return [p[0], p[1] - 0.6]; })), '#dcdce4', 0.6, 0.8); });
    return o;
  }
  // mine cart on its wheels, heaped with gold (x = centre, y = ground)
  function cart(c, x, y, s, load) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.3);
    if (load !== false) o += coinPile(c, x, y - 17 * s, 34 * s, 10 * s, Math.round(x + y), GOLD);
    o += body(c, pd([q(-20, -22), q(20, -22), q(16, -5), q(-16, -5)], true), IRON, L('M' + pt(q(-19, -17)) + 'L' + pt(q(19, -17)) + 'M' + pt(q(-17, -10)) + 'L' + pt(q(17, -10)), dk(IRON, 0.35), 1.4 * s) + F(pd([q(6, -24), q(22, -24), q(18, -3), q(4, -3)], true), dk(IRON, 0.35), 0.6), 1.6 * s);
    o += R(q(-22, -24)[0], q(-22, -24)[1], 44 * s, 3.4 * s, c.cel(BRASS), 1.2 * s) + rivetLine(q(-15, -14)[0], q(-15, -14)[1], q(15, -14)[0], q(15, -14)[1], 4, 1 * s);
    [-10, 10].forEach(function (u) { var p = q(u, -4); o += C(p[0], p[1], 4.6 * s, c.cel(IROND), 1.3 * s) + C(p[0], p[1], 1.5 * s, BRASS, 0.8 * s); });
    return o;
  }
  // tipped cart spilling coins
  function spill(c, x, y, s, seed) { return coinPile(c, x, y, 34 * s, 7 * s, seed) + goldDust(seed + 1, x - 24 * s, x + 26 * s, y - 2, y + 6 * s, 16); }
  function steam(x, y, s, op, lean) { return smoke(x, y, s, '#f4f0ea', op || 0.55, lean); }
  function soot(x, y, s, op, lean) { return smoke(x, y, s, '#2a2224', op || 0.7, lean); }
  // stream of molten gold from p to q (slight curve)
  function pour(c, p, q, w) {
    var d = 'M' + pt(p) + 'Q' + pt([p[0] - 2, (p[1] + q[1]) / 2]) + ' ' + pt(q);
    return L(d, MOLT, w * 3.4, 0.25) + L(d, OL, w + 2) + L(d, MOLT, w) + L(d, MOLTL, w * 0.4) + C(q[0], q[1], w * 5, glow(c, '#ffb040', 0.8));
  }
  // iron ingot mould tray; fill 0 empty, 1 molten, 2 cooled gold
  function mould(c, x, y, s, fill) {
    var w = 16 * s, h = 6 * s, o = P(pd([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 - 2 * s, y], [x - w / 2 + 2 * s, y]], true), c.cel(IROND), 1.2 * s);
    if (fill === 1) o += C(x, y - h, 12 * s, glow(c, '#ff9a30', 0.6)) + E(x, y - h + 0.6 * s, w / 2 - 1.6 * s, 1.8 * s, c.lg([[0, MOLTL], [1, MOLT]]), 0.8 * s);
    else if (fill === 2) o += P(pd([[x - w / 2 + 2 * s, y - h - 3 * s], [x + w / 2 - 2 * s, y - h - 3 * s], [x + w / 2 - 1 * s, y - h + 0.6 * s], [x - w / 2 + 1 * s, y - h + 0.6 * s]], true), c.cel(GOLD), 1 * s);
    else o += E(x, y - h + 0.6 * s, w / 2 - 1.6 * s, 1.6 * s, '#1a1414', 0);
    return o;
  }
  // gold bar (ingot) seen from the side-top
  function bar(c, x, y, s) { return P(pd([[x - 9 * s, y], [x + 9 * s, y], [x + 7 * s, y - 5 * s], [x - 7 * s, y - 5 * s]], true), c.cel(GOLD), 1.1 * s) + L('M' + pt([x - 6 * s, y - 4 * s]) + 'L' + pt([x + 5 * s, y - 4 * s]), GOLDL, 0.9 * s, 0.9); }
  function barStack(c, x, y, s) {
    var o = E(x, y + 1, 26 * s, 3 * s, '#000', 0, 0.3);
    [[-18, 0], [0, 0], [18, 0], [-9, -5], [9, -5], [0, -10]].forEach(function (b) { o += bar(c, x + b[0] * s, y + b[1] * s, s); });
    return o + glint(x - 2 * s, y - 13 * s, 2.4 * s);
  }
  // crucible hung from two chains, tilted by `tilt` radians towards the left (x, y = centre of the pot)
  function crucible(c, x, y, s, tilt) {
    var o = '', a = tilt || 0, rot = function (u, v) { var ca = Math.cos(-a), sa = Math.sin(-a); return [x + (u * ca - v * sa) * s, y + (u * sa + v * ca) * s]; };
    var pot = 'M' + pt(rot(-22, -12)) + 'L' + pt(rot(22, -12)) + 'C' + pt(rot(22, 6)) + ' ' + pt(rot(14, 20)) + ' ' + pt(rot(0, 20)) + 'C' + pt(rot(-14, 20)) + ' ' + pt(rot(-22, 6)) + ' ' + pt(rot(-22, -12)) + 'Z';
    o += C(x, y - 8 * s, 48 * s, glow(c, '#ff8a2a', 0.45));
    o += body(c, pot, IRON, F(pd([rot(6, -16), rot(28, -16), rot(28, 24), rot(6, 24)], true), '#000', 0.3) + L('M' + pt(rot(-21, -2)) + 'L' + pt(rot(21, -2)) + 'M' + pt(rot(-18, 9)) + 'L' + pt(rot(18, 9)), dk(IRON, 0.3), 1.4 * s) + F(pd([rot(-24, 10), rot(24, 10), rot(24, 24), rot(-24, 24)], true), MOLT, 0.35) + F(pd([rot(-24, -12), rot(24, -12), rot(24, -7), rot(-24, -7)], true), '#ffb040', 0.35), 2 * s);
    var tc = rot(0, -12);
    o += G(E(tc[0], tc[1], 22 * s, 4.4 * s, c.lg([[0, MOLTL], [0.6, MOLT], [1, '#c84a10']]), 1.6 * s), 'rotate(' + n(-a * 180 / PI) + ' ' + n(tc[0]) + ' ' + n(tc[1]) + ')');
    o += C(rot(-23, -13)[0], rot(-23, -13)[1], 2.8 * s, c.cel(BRASS), 1 * s) + C(rot(21, -13)[0], rot(21, -13)[1], 2.8 * s, c.cel(BRASS), 1 * s);
    o += P(pd([rot(-22, -13), rot(-30, -15), rot(-26, -10)], true), c.cel(IROND), 1.2 * s);
    return o;
  }
  // conveyor belt: top at y from x0 to x1, legs to the floor fy
  function conveyor(c, x0, x1, y, fy) {
    var o = '';
    for (var lx = x0 + 10; lx < x1; lx += 58) o += limb('M' + pt([lx, y + 8]) + 'L' + pt([lx - 4, fy]) + 'M' + pt([lx, y + 8]) + 'L' + pt([lx + 4, fy]), IROND, 2.2) + R(lx - 7, fy - 2, 14, 3, c.cel(IRON), 1);
    o += R(x0, y, x1 - x0, 8, c.cel('#3a3434'), 1.6) + L('M' + pt([x0 + 2, y + 1.5]) + 'L' + pt([x1 - 2, y + 1.5]), '#6a6264', 1, 0.8);
    var rl = ''; for (var x = x0 + 6; x < x1 - 2; x += 12) rl += C(x, y + 4.6, 2.3, c.cel(IRON), 0.9);
    o += rl + C(x0, y + 4, 6, c.cel(BRASS), 1.4) + C(x0, y + 4, 1.8, IROND) + C(x1, y + 4, 6, c.cel(BRASS), 1.4) + C(x1, y + 4, 1.8, IROND);
    return o;
  }
  // brick smelting furnace with a glowing arched mouth and a chimney (x = left, y = floor)
  function furnace(c, x, y, w, h) {
    var col = '#8a4a30', o = E(x + w / 2, y + 2, w * 0.6, 4, '#000', 0, 0.3);
    o += brickWall(c, x + w * 0.3, 0, x + w * 0.7, y - h + 4, dk(col, 0.1), 71, 10) + L('M' + pt([x + w * 0.3, 0]) + 'L' + pt([x + w * 0.3, y - h + 4]) + 'M' + pt([x + w * 0.7, 0]) + 'L' + pt([x + w * 0.7, y - h + 4]), OL, 1.8);
    var d = 'M' + pt([x, y]) + 'L' + pt([x + 4, y - h + 12]) + 'Q' + pt([x + w / 2, y - h - 4]) + ' ' + pt([x + w - 4, y - h + 12]) + 'L' + pt([x + w, y]) + 'Z';
    var bricks = ''; for (var yy = y - 8; yy > y - h + 6; yy -= 9) { bricks += 'M' + pt([x + 1, yy]) + 'L' + pt([x + w - 1, yy]); for (var xx = x + ((y - yy) / 9 % 2 ? 6 : 0); xx < x + w; xx += 13) bricks += 'M' + pt([xx, yy]) + 'l0,9'; }
    o += body(c, d, col, L(bricks, dk(col, 0.4), 0.9, 0.8) + F(pd([[x + w * 0.66, y - h - 6], [x + w + 2, y - h - 6], [x + w + 2, y + 2], [x + w * 0.66, y + 2]], true), dk(col, 0.3), 0.7) + R(x, y - 30, w, 30, c.lg([[0, '#ff7a2a', 0], [1, '#ff7a2a', 0.3]])), 2.2);
    var mx = x + w / 2, mw = w * 0.46, mh = h * 0.42;
    o += C(mx, y - mh * 0.5, mw * 1.6, glow(c, '#ff8a2a', 0.7));
    o += P(arched(mx, y, mw + 8, mh + 6), c.cel(SSTD), 1.8) + P(arched(mx, y, mw, mh), c.rg([[0, '#fff0a0'], [0.4, '#ffb030'], [1, '#c83a10']]), 1.6);
    o += flame(c, mx - 7, y - 2, 0.9, '#ff6a1a', '#ffe070') + flame(c, mx + 6, y - 2, 1.1, '#ff6a1a', '#ffe070') + flame(c, mx, y - 2, 1.4, '#ff8a2a', '#fff4b0');
    o += R(x + 2, y - h * 0.62, w - 4, 5, c.cel(IROND), 1.4) + rivetLine(x + 6, y - h * 0.62 + 2.5, x + w - 6, y - h * 0.62 + 2.5, 6, 1, '#8a8890');
    return o;
  }
  // big screw press for striking coins (x = centre, y = floor)
  function screwPress(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 3, 70 * s, 7 * s, '#000', 0, 0.35);
    // base block and the anvil die
    o += plate(c, q(-46, -26)[0], q(-46, -26)[1], 92 * s, 26 * s, IROND, 12 * s, '#8a8890');
    o += plate(c, q(-22, -34)[0], q(-22, -34)[1], 44 * s, 9 * s, IRON, 0);
    // columns
    [-36, 36].forEach(function (u) { o += plate(c, q(u - 7, -104)[0], q(u - 7, -104)[1], 14 * s, 72 * s, BRASS, 0) + rivetLine(q(u, -98)[0], q(u, -98)[1], q(u, -38)[0], q(u, -38)[1], 5, 1.2 * s); });
    // crosshead
    o += body(c, pd([q(-50, -118), q(50, -118), q(46, -100), q(-46, -100)], true), BRASS, F(pd([q(20, -120), q(52, -120), q(52, -98), q(20, -98)], true), dk(BRASS, 0.25), 0.7), 2 * s) + rivetLine(q(-42, -109)[0], q(-42, -109)[1], q(42, -109)[0], q(42, -109)[1], 8, 1.3 * s);
    // screw, fly bar with iron weights
    var sc = ''; for (var v = -134; v < -58; v += 5) sc += 'M' + pt(q(-6, v)) + 'L' + pt(q(6, v + 3));
    o += R(q(-6, -136)[0], q(-6, -136)[1], 12 * s, 78 * s, c.cel('#8a8890'), 1.6 * s) + L(sc, IROND, 1.2 * s);
    o += limb('M' + pt(q(-74, -140)) + 'L' + pt(q(74, -140)), IROND, 4 * s) + C(q(-76, -140)[0], q(-76, -140)[1], 10 * s, c.cel(IROND), 2 * s) + C(q(76, -140)[0], q(76, -140)[1], 10 * s, c.cel(IROND), 2 * s) + C(q(-79, -143)[0], q(-79, -143)[1], 3 * s, '#9a98a0', 0, 0.8) + C(q(73, -143)[0], q(73, -143)[1], 3 * s, '#9a98a0', 0, 0.8);
    o += R(q(-9, -144)[0], q(-9, -144)[1], 18 * s, 9 * s, c.cel(BRASS), 1.6 * s);
    // ram and upper die, glowing hot coin between the dies
    o += body(c, pd([q(-18, -58), q(18, -58), q(14, -40), q(-14, -40)], true), IRON, F(pd([q(6, -60), q(20, -60), q(16, -38), q(6, -38)], true), dk(IRON, 0.3), 0.7), 1.8 * s);
    o += C(q(0, -37)[0], q(0, -37)[1], 20 * s, glow(c, '#ffb040', 0.8)) + E(q(0, -36)[0], q(0, -36)[1], 11 * s, 2.4 * s, c.lg([[0, MOLTL], [1, MOLT]]), 1.2 * s);
    // chute at the front with coins sliding down
    o += P(pd([q(-46, -18), q(-26, -18), q(-66, 0), q(-86, 0)], true), c.cel(BRASSD), 1.6 * s) + L('M' + pt(q(-44, -16)) + 'L' + pt(q(-82, -1)), lt(BRASS, 0.2), 1.2 * s);
    o += flatCoin(c, q(-40, -15)[0], q(-40, -15)[1], 3.2 * s, '#ffc860') + flatCoin(c, q(-54, -9)[0], q(-54, -9)[1], 3.2 * s) + flatCoin(c, q(-68, -4)[0], q(-68, -4)[1], 3.2 * s);
    // gauge and steam
    o += C(q(28, -84)[0], q(28, -84)[1], 7 * s, c.cel(BRASS), 1.6 * s) + C(q(28, -84)[0], q(28, -84)[1], 5 * s, '#f4ecd6', 1 * s) + L('M' + pt(q(28, -84)) + 'L' + pt(q(31, -88)), LEDR, 1.2 * s);
    return o;
  }
  // round vault door with radial bolts, a spoked wheel and the claw mark (x, y = centre)
  function vaultDoor(c, x, y, r) {
    var o = C(x, y, r + 6, c.cel(IROND), 2) + C(x, y, r, c.cel('#6a6870'), 2), bolts = '';
    for (var i = 0; i < 12; i++) { var a = i * PI / 6; bolts += rivet(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3), 1.6, '#9a98a0'); }
    o += bolts + L(ellD(x, y, r * 0.78, r * 0.78), dk(IRON, 0.3), 1.4) + C(x, y, r * 0.5, c.cel(BRASS), 1.6);
    var sp = ''; for (var j = 0; j < 6; j++) { var b = j * PI / 3 + 0.3; sp += 'M' + pt([x, y]) + 'L' + pt([x + Math.cos(b) * r * 0.7, y + Math.sin(b) * r * 0.7]); }
    o += L(sp, OL, 4.4) + L(sp, BRASS, 2.4);
    for (var k = 0; k < 6; k++) { var bb = k * PI / 3 + 0.3; o += C(x + Math.cos(bb) * r * 0.7, y + Math.sin(bb) * r * 0.7, 2.4, c.cel(BRASS), 1.2); }
    o += C(x, y, r * 0.26, c.cel(IROND), 1.4) + claw(x, y, r * 0.018, GOLD);
    return o + R(x + r + 2, y - r * 0.5, 9, 12, c.cel(IROND), 1.6) + R(x + r + 2, y + r * 0.5 - 12, 9, 12, c.cel(IROND), 1.6);
  }
  // wooden counting desk (x = centre, y = floor)
  function desk(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 2, 44 * s, 4 * s, '#000', 0, 0.3);
    o += limb('M' + pt(q(-34, -24)) + 'L' + pt(q(-34, 0)) + 'M' + pt(q(34, -24)) + 'L' + pt(q(34, 0)), dk(WOOD, 0.2), 3 * s);
    o += body(c, pd([q(-40, -30), q(40, -30), q(40, -24), q(-40, -24)], true), WOOD, '', 1.6 * s) + body(c, pd([q(-34, -24), q(34, -24), q(34, -16), q(-34, -16)], true), dk(WOOD, 0.15), L('M' + pt(q(0, -24)) + 'L' + pt(q(0, -16)), OL, 1 * s), 1.4 * s);
    o += C(q(-16, -20)[0], q(-16, -20)[1], 1.2 * s, c.cel(BRASS), 0.6 * s) + C(q(16, -20)[0], q(16, -20)[1], 1.2 * s, c.cel(BRASS), 0.6 * s);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    coinworks_gate: function (c) {
      var o = dSky(c, 334, 30, '#9cc8e0', '#e8ecd8', '#f8e2b0');
      o += cloud(120, 26, 0.7, 0.5, '#fff8ec') + farDunes(c, 3101, 92, 14, '#f0d8a0', 56);
      // Coppergulch on the clifftop: houses, a water tank and a crane arm against the sky
      var town = '';
      [[14, 70, 34, 18, SST], [50, 66, 26, 16, lt(SST, 0.06)], [252, 66, 30, 16, SST], [284, 70, 44, 22, lt(SST, 0.04)], [336, 66, 28, 15, SST], [366, 70, 40, 20, lt(SST, 0.06)]].forEach(function (h, i) {
        town += body(c, 'M' + pt([h[0], h[1]]) + 'L' + pt([h[0], h[1] - h[3] + 3]) + 'Q' + pt([h[0], h[1] - h[3]]) + ' ' + pt([h[0] + 3, h[1] - h[3]]) + 'L' + pt([h[0] + h[2] - 3, h[1] - h[3]]) + 'Q' + pt([h[0] + h[2], h[1] - h[3]]) + ' ' + pt([h[0] + h[2], h[1] - h[3] + 3]) + 'L' + pt([h[0] + h[2], h[1]]) + 'Z', h[4], F(pd([[h[0] + h[2] * 0.66, h[1] - h[3] - 2], [h[0] + h[2] + 2, h[1] - h[3] - 2], [h[0] + h[2] + 2, h[1] + 2], [h[0] + h[2] * 0.66, h[1] + 2]], true), dk(h[4], 0.22), 0.8), 1.4) +
          R(h[0] + h[2] * 0.3, h[1] - h[3] * 0.6, 4, 5, '#2a1c14', 0.9) + (i % 2 ? R(h[0] + h[2] * 0.62, h[1] - h[3] * 0.6, 4, 5, '#2a1c14', 0.9) : '');
      });
      town += limb('M88,70 L92,44 M104,70 L100,44', WOOD, 2) + body(c, 'M86,44 L86,30 C86,27 106,27 106,30 L106,44 Z', '#8a8e96', L('M86,37 L106,37', '#5a4a3a', 1.6) + F('M100,26 L108,26 L108,46 L100,46 Z', '#5a5e66', 0.7), 1.4) + P('M84,30 L96,22 L108,30 Z', c.cel('#b8503a'), 1.2);
      town += limb('M218,70 L222,30 M222,30 L250,20', WOOD, 2) + L('M246,21 L246,36', OL, 0.9) + R(242, 36, 8, 5, c.cel(BRASS), 0.9);
      o += town + palm(c, 164, 70, 0.34, 6, PALM, 3102);
      // the cliff below the town: sandstone strata, cracks and shading
      var cl = 'M-4,150 L-4,72 C30,70 60,74 90,70 C130,64 170,72 210,70 C250,68 290,74 330,70 C360,66 380,72 404,70 L404,150 Z', st = '';
      for (var j = 0; j < 7; j++) { var yy = 80 + j * 10; st += 'M-4,' + n(yy + (j % 2) * 2) + ' C80,' + n(yy - 3) + ' 160,' + n(yy + 4) + ' 240,' + n(yy - 2) + ' C300,' + n(yy - 5) + ' 360,' + n(yy + 3) + ' 404,' + n(yy); }
      o += body(c, cl, SST, L(st, dk(SST, 0.18), 1.2, 0.8) + R(-4, 118, 408, 34, c.lg([[0, SSTD, 0], [1, SSTD, 0.6]])) + L('M40,84 L46,98 L42,112 M340,80 L334,96 L340,108 M150,76 L156,88', dk(SST, 0.4), 1.1), 2);
      o += R(-4, 69, 408, 3, lt(SST, 0.3), 0) + rock(c, 18, 152, 40, 18, SSTD) + rock(c, 386, 152, 44, 22, SSTD);
      // brass stacks venting soot out of the cliff
      o += pipe(c, [[100, 140], [100, 118], [116, 118], [116, 36]], 5) + R(110, 28, 12, 9, c.cel(BRASSD), 1.4) + soot(116, 26, 0.55, 0.55, 1.2);
      o += pipe(c, [[306, 150], [306, 112], [292, 112], [292, 44]], 4.4) + R(287, 37, 10, 8, c.cel(BRASSD), 1.4) + soot(292, 34, 0.45, 0.5, 1.4);
      // the gate: dark recess, riveted brass frame, two heavy leaves with a glowing gap
      o += P(arched(200, 152, 118, 92), '#5a3a22', 2) + F(arched(200, 152, 110, 86), '#2a1a12', 0.6);
      o += P(arched(200, 152, 104, 84), c.cel(BRASS), 2.2);
      var dr = arched(200, 152, 86, 74), clip = c.clip(dr);
      o += P(dr, c.lg([[0, '#3a1a0a'], [0.6, '#c8501a'], [1, '#ffc050']]), 1.8);
      var leaf = function (x0, x1, col) {
        var s = R(x0, 70, x1 - x0, 84, c.lg([[0, lt(col, 0.12)], [0.5, col], [1, dk(col, 0.3)]], 0, 0, 1, 0), 0) + L('M' + pt([x0, 70]) + 'L' + pt([x0, 154]) + 'M' + pt([x1, 70]) + 'L' + pt([x1, 154]), OL, 1.8);
        for (var yy = 96; yy < 152; yy += 16) s += L('M' + pt([x0, yy]) + 'L' + pt([x1, yy]), dk(col, 0.4), 1.4) + rivetLine(x0 + 4, yy - 3, x1 - 4, yy - 3, 4, 1.1) + rivetLine(x0 + 4, yy + 3, x1 - 4, yy + 3, 4, 1.1);
        return s + R(x0 + (x1 - x0) * 0.44, 78, (x1 - x0) * 0.12, 76, dk(col, 0.25), 1);
      };
      o += '<g clip-path="url(#' + clip + ')">' + leaf(157, 195, BRASS) + leaf(207, 243, dk(BRASS, 0.08)) + R(195, 80, 12, 74, c.lg([[0, '#ff9030', 0.2], [1, '#ffe080', 0.9]]), 0) + '</g>' + P(dr, 'none', 1.8);
      o += gear(c, 176, 112, 11, 8, lt(BRASS, 0.08)) + limb('M224,104 L224,124', IROND, 3) + C(224, 104, 2.6, c.cel(IRON), 1) + C(224, 124, 2.6, c.cel(IRON), 1);
      o += C(200, 150, 60, glow(c, '#ffa040', 0.45));
      // keystone medallion with the claw mark
      o += C(200, 70, 12, c.cel(BRASSD), 1.8) + coin(c, 200, 70, 9);
      o += rivetLine(150, 146, 150, 96, 5, 1.3) + rivetLine(250, 146, 250, 96, 5, 1.3);
      // ground, the track running in, spilled gold dust
      o += sandFloor(c, 150, '#e6c080', '#c69452', 3103);
      o += F('M170,150 L230,150 L300,242 L120,242 Z', '#b8864a', 0.35);
      o += rails(c, 200, 151, 7, 232, 244, 58, 11, 18);
      o += goldDust(3104, 180, 236, 152, 180, 30) + goldDust(3105, 140, 280, 180, 236, 26);
      o += cart(c, 204, 170, 0.62);
      // lamp post and a wall lantern, crates and sacks by the door
      o += lampPost(c, 136, 156, 60, 1, 1) + L('M262,98 L272,98 L272,102', OL, 3) + L('M262,98 L272,98 L272,102', IROND, 1.6) + lantern(c, 272, 101, 0.9);
      o += crate(c, 272, 160, 1.1) + crate(c, 292, 160, 1, '#9a6a38') + crate(c, 282, 142, 0.9, '#b07a42') + sack(c, 314, 164, 0.9) + barrel(c, 112, 158, 1, '#7a5a3a') + sack(c, 96, 162, 0.8, '#bca070');
      o += palm(c, 348, 164, 0.72, -14, PALM, 3106);
      o += spill(c, 156, 206, 0.9, 3107) + sack(c, 140, 208, 0.9, '#c8aa76');
      o += pebbles(3108, 170, 236, '#a87a44', 14, 10, 390);
      return o + vignette(c, '#fff8e0', '#5a3a14');
    },
    cw_smelter: function (c) {
      var o = R(0, 0, 400, 240, '#2a1810');
      o += brickWall(c, 0, 0, 400, 128, '#8a5a36', 3201, 14);
      o += R(0, 0, 400, 128, c.lg([[0, '#0e0806', 0.9], [0.45, '#1a0c06', 0.45], [1, '#ff8a3a', 0.16]]));
      // wall pipes
      o += pipe(c, [[-4, 44], [60, 44], [60, 90], [90, 90]], 4.4) + pipe(c, [[250, 30], [250, 60], [292, 60]], 3.6, BRASSD);
      // soot clouds under the roof
      o += soot(150, 30, 1, 0.5, 1.6) + soot(60, 20, 0.8, 0.45, -1) + soot(320, 26, 1.2, 0.5, 1);
      // gantry beam with a trolley, chains and hooks
      o += plate(c, -4, 6, 408, 10, IROND, 16, '#8a8890') + R(130, 14, 32, 8, c.cel(IRON), 1.4) + C(136, 22, 3, c.cel(IROND), 1) + C(156, 22, 3, c.cel(IROND), 1);
      o += chain([138, 22], [120, 53], 1) + chain([154, 22], [158, 33], 1);
      o += chain([236, 16], [236, 56], 1) + hook(236, 56, 1.1) + chain([272, 16], [272, 42], 1) + hook(272, 42, 1);
      o += chain([48, 16], [48, 66], 1) + hook(48, 66, 1.1) + R(34, 78, 22, 6, c.cel(GOLD), 1.2) + L('M40,78 L44,72 M50,78 L46,72', OL, 1.2);
      // furnace
      o += furnace(c, 300, 128, 96, 100);
      // the crucible pouring into the moulds on the conveyor
      o += conveyor(c, 30, 284, 104, 128);
      [[48, 0], [72, 0], [96, 0], [120, 1], [144, 1], [168, 1], [192, 2], [216, 2], [240, 2], [264, 2]].forEach(function (m) { o += mould(c, m[0], 104, 1, m[1]); });
      o += crucible(c, 146, 54, 1, 0.5) + pour(c, [124, 60], [120, 98], 3);
      o += steam(200, 96, 0.4, 0.4, 1.2) + steam(236, 96, 0.35, 0.35, 0.8);
      // floor: iron plates, lit by the metal
      o += flagFloor(c, 128, 200, '#5a3a28', 3202);
      o += R(0, 126, 400, 6, c.lg([[0, '#000', 0.4], [1, '#000', 0]]));
      o += E(130, 150, 110, 20, glow(c, '#ff8a2a', 0.4)) + E(348, 146, 70, 16, glow(c, '#ff8a2a', 0.45));
      o += cart(c, 76, 146, 0.8) + barStack(c, 238, 146, 0.9);
      // coal heap and a stack of ingots at the sides
      var coal = ''; var r = rng(3203);
      for (var i = 0; i < 22; i++) { var cx = 4 + r() * 60, cy = 240 - r() * 24 * (1 - Math.abs(cx - 34) / 40), cr = 3.4 + r() * 3.4, a0 = r() * PI, pp = []; for (var m = 0; m < 5; m++) pp.push([cx + Math.cos(a0 + m * 1.26) * cr * (0.8 + r() * 0.4), cy + Math.sin(a0 + m * 1.26) * cr * 0.8]); coal += P(pd(pp, true), c.cel(r() < 0.5 ? '#2e2a2c' : '#3a3436'), 1.1) + C(cx - cr * 0.3, cy - cr * 0.3, 0.7, '#8a8288', 0, 0.8); }
      o += E(34, 240, 44, 8, '#000', 0, 0.4) + coal + barStack(c, 360, 232, 1.1) + crate(c, 380, 150, 1.1, '#7a5a3a') + sack(c, 396, 154, 0.9, '#9a8460');
      o += motes(3204, 26, 90, 380, 30, 150, '#ffb040');
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.14], [1, '#000', 0.55]]));
    },
    cw_vault: function (c) {
      var o = R(0, 0, 400, 240, '#241a16');
      // back wall: riveted iron plates over sandstone, brass trim
      o += brickWall(c, 0, 0, 400, 128, '#7a5434', 3301, 14);
      for (var px = 0; px < 400; px += 50) o += plate(c, px, 22, 50, 40, px % 100 ? '#5a5258' : '#524a50', 10, '#8a8890');
      o += R(0, 18, 400, 5, c.cel(BRASS), 1.2) + R(0, 62, 400, 5, c.cel(BRASS), 1.2);
      o += R(0, 0, 400, 128, c.lg([[0, '#0a0606', 0.8], [0.5, '#0a0606', 0.2], [1, '#ffa050', 0.1]]));
      // ledger shelf
      o += R(14, 72, 110, 4, c.cel(WOOD), 1.2) + spines(c, 18, 72, 14, 3302) + R(14, 98, 110, 4, c.cel(WOOD), 1.2) + spines(c, 20, 98, 9, 3303) + coinStack(c, 106, 98, 5, 6) + coinStack(c, 116, 98, 4, 4);
      // vault door behind the strongboxes
      o += vaultDoor(c, 344, 72, 34);
      // hanging lanterns
      o += chain([80, 0], [80, 20], 0.9) + lantern(c, 80, 20, 1.1) + chain([306, 0], [306, 12], 0.9) + lantern(c, 306, 12, 1.1);
      // floor
      o += flagFloor(c, 128, 200, '#6a4a30', 3304);
      o += R(0, 126, 400, 6, c.lg([[0, '#000', 0.4], [1, '#000', 0]]));
      o += E(210, 150, 130, 22, glow(c, '#ffb040', 0.28));
      // the press, and the heap it makes
      o += screwPress(c, 212, 128, 0.72) + coinPile(c, 146, 134, 44, 14, 3305);
      o += steam(236, 64, 0.34, 0.4, 1.4);
      // counting desk: open ledger, stacks, scale, candle
      o += desk(c, 62, 134, 1) + ledger(c, 50, 104, 0.9, LEDG, true) + ledger(c, 88, 104, 0.8, LEDR) + ledger(c, 88, 98, 0.8) + coinStack(c, 24, 104, 3.6, 5) + coinStack(c, 32, 104, 3.2, 8);
      o += limb('M76,104 L76,82', BRASS, 1.2) + balance(c, 76, 82, 0.7, -0.25) + C(102, 88, 14, glow(c, '#ffc050', 0.5)) + R(99.5, 92, 5, 12, c.cel('#f4ecd6'), 1) + flame(c, 102, 92, 0.35);
      // strongboxes stamped with the claw mark
      o += strongbox(c, 318, 132, 40, 28) + strongbox(c, 364, 134, 44, 30, '#56545c') + strongbox(c, 340, 104, 36, 24, '#625f68');
      o += coinStack(c, 290, 132, 5, 7) + coinStack(c, 300, 136, 5, 4) + flatCoin(c, 270, 142, 3) + flatCoin(c, 180, 158, 3) + flatCoin(c, 250, 170, 3.4);
      // foreground heaps framing the floor
      o += coinPile(c, 18, 246, 80, 30, 3306) + coinPile(c, 392, 248, 90, 36, 3307) + coinStack(c, 60, 232, 6, 6) + coinStack(c, 346, 226, 6, 9);
      o += goldDust(3308, 120, 300, 150, 230, 26);
      o += motes(3309, 16, 150, 280, 20, 120, '#fff0b0');
      return o + R(0, 0, 400, 240, c.rg([[0, '#ffb060', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- goblin (Deepgold Company) — copy of the art_stranglethorn.js rig, plus goggles over the eyes, a monocle,
  //      a small top hat, soot smudges and a gold tooth ----
  function gobHead(c, x, y, o) {
    var sk = o.skin || '#6aa84a', s = '';
    s += P('M' + pt([x + 8, y - 4]) + 'C' + pt([x + 18, y - 10]) + ' ' + pt([x + 26, y - 14]) + ' ' + pt([x + 32, y - 18]) + 'C' + pt([x + 28, y - 8]) + ' ' + pt([x + 20, y + 2]) + ' ' + pt([x + 10, y + 6]) + 'Z', c.cel(sk), 2) + F('M' + pt([x + 12, y - 2]) + 'C' + pt([x + 18, y - 6]) + ' ' + pt([x + 24, y - 10]) + ' ' + pt([x + 28, y - 14]) + 'C' + pt([x + 24, y - 6]) + ' ' + pt([x + 18, y]) + ' ' + pt([x + 12, y + 3]) + 'Z', '#c87a6a', 0.6);
    if (o.earring) s += L(ellD(x + 22, y - 7, 1.8, 2.2), OL, 2.2) + L(ellD(x + 22, y - 7, 1.8, 2.2), GOLD, 1.1);
    s += P('M' + pt([x - 6, y - 8]) + 'L' + pt([x - 16, y - 18]) + 'L' + pt([x - 2, y - 12]) + 'Z', c.cel(dk(sk, 0.15)), 1.6);
    var d = 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 17]) + ' ' + pt([x + 10, y - 18]) + ' ' + pt([x + 12, y - 6]) + 'L' + pt([x + 12, y + 5]) + 'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 5, y + 14]) + 'C' + pt([x - 10, y + 13]) + ' ' + pt([x - 12, y + 8]) + ' ' + pt([x - 12, y + 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 1, y + 18]) + 'C' + pt([x + 7, y + 8]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8) +
      (o.soot ? E(x + 2, y + 6, 5, 3, SOOT, 0, 0.45) + E(x - 8, y + 2, 3, 2, SOOT, 0, 0.35) : ''));
    s += P('M' + pt([x - 9, y - 1]) + 'C' + pt([x - 16, y - 1]) + ' ' + pt([x - 22, y + 3]) + ' ' + pt([x - 25, y + 6]) + 'C' + pt([x - 19, y + 7]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 8, y + 5]) + 'Z', c.cel(lt(sk, 0.05)), 1.8);
    if (o.soot) s += E(x - 20, y + 4, 2.6, 1.4, SOOT, 0, 0.4);
    if (o.gogEyes) {
      s += L('M' + pt([x - 2, y - 5]) + 'L' + pt([x + 12, y - 8]), OL, 3.2) + L('M' + pt([x - 2, y - 5]) + 'L' + pt([x + 12, y - 8]), '#4a3a2a', 1.8);
      s += C(x + 2.5, y - 5.5, 3.6, c.cel(BRASSD), 1.3) + C(x + 2.5, y - 5.5, 2.3, dk(o.gogEyes, 0.2), 0.9);
      s += C(x - 5, y - 4, 5, c.cel(BRASS), 1.5) + C(x - 5, y - 4, 3.4, c.rg([[0, '#fff4c0'], [0.5, o.gogEyes], [1, dk(o.gogEyes, 0.35)]]), 1) + C(x - 6.4, y - 5.4, 1, '#ffffff');
    } else {
      s += E(x - 5, y - 4, 3, 2.6, '#fff4c0', 1.2) + C(x - 6.2, y - 4, 1.2, OL);
      s += L('M' + pt([x - 11, y - 9.5]) + 'L' + pt([x - 1, y - 8.5]), OL, 2);
    }
    if (o.monocle) s += L(ellD(x - 5, y - 4, 4.4, 4.4), OL, 2.4) + L(ellD(x - 5, y - 4, 4.4, 4.4), GOLD, 1.2) + C(x - 5, y - 4, 3.6, '#dff4ff', 0, 0.28) + L('M' + pt([x - 1.4, y - 1.6]) + 'Q' + pt([x + 3, y + 6]) + ' ' + pt([x + 5, y + 14]), GOLD, 0.8);
    if (o.grin) {
      s += P('M' + pt([x - 13, y + 8]) + 'Q' + pt([x - 6, y + 15]) + ' ' + pt([x + 3, y + 8]) + 'Q' + pt([x - 5, y + 10]) + ' ' + pt([x - 13, y + 8]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 11, y + 9]) + 'L' + pt([x + 1, y + 9]), '#f4ecd6', 1.6) + R(x - 7, y + 8.2, 2.6, 2.6, '#ffd040', 0.8);
    } else s += P('M' + pt([x - 12, y + 9]) + 'Q' + pt([x - 6, y + 13]) + ' ' + pt([x, y + 9]) + 'Z', '#3a1a14', 1.3) + L('M' + pt([x - 10, y + 9.6]) + 'L' + pt([x - 2, y + 9.6]), '#f4ecd6', 1.3);
    if (o.cigar) s += L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), OL, 3.6) + L('M' + pt([x - 11, y + 10]) + 'L' + pt([x - 20, y + 13]), '#7a4a2a', 2) + C(x - 21, y + 13.3, 1.3, '#ff8a3a') + smoke(x - 24, y + 6, 0.3, '#c8c8c8', 0.6, -1);
    var st = o.hatStyle || 'hard', hc = o.hat || '#e8b830';
    if (st === 'hard') {
      s += P('M' + pt([x - 16, y - 7]) + 'C' + pt([x - 8, y - 5]) + ' ' + pt([x + 10, y - 5]) + ' ' + pt([x + 17, y - 8]) + 'L' + pt([x + 15, y - 10]) + 'C' + pt([x + 6, y - 11]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 15, y - 10]) + 'Z', c.cel(hc), 1.8);
      s += body(c, 'M' + pt([x - 12, y - 9]) + 'C' + pt([x - 12, y - 24]) + ' ' + pt([x + 12, y - 25]) + ' ' + pt([x + 13, y - 9]) + 'Z', hc, F('M' + pt([x + 3, y - 26]) + 'L' + pt([x + 14, y - 26]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.28), 0.8) + L('M' + pt([x, y - 23]) + 'L' + pt([x + 1, y - 10]), o.stripe || dk(hc, 0.3), 2.4) + (o.soot ? E(x - 6, y - 14, 4, 2.4, SOOT, 0, 0.4) : ''), 2);
      if (o.lamp) s += R(x - 7, y - 20, 6, 5, c.cel(BRASSD), 1) + C(x - 8, y - 17.5, 2, '#ffe890', 0.8) + C(x - 8, y - 17.5, 6, glow(c, '#ffd060', 0.7));
    } else if (st === 'top') {
      s += body(c, 'M' + pt([x - 9, y - 10]) + 'L' + pt([x - 8, y - 27]) + 'C' + pt([x - 4, y - 29]) + ' ' + pt([x + 8, y - 29]) + ' ' + pt([x + 11, y - 27]) + 'L' + pt([x + 12, y - 10]) + 'Z', hc, F('M' + pt([x + 4, y - 30]) + 'L' + pt([x + 14, y - 30]) + 'L' + pt([x + 14, y - 8]) + 'L' + pt([x + 5, y - 8]) + 'Z', dk(hc, 0.4), 0.8) + R(x - 10, y - 16, 24, 4, o.band || GOLD, 0), 2);
      s += P('M' + pt([x - 17, y - 9]) + 'C' + pt([x - 10, y - 12]) + ' ' + pt([x + 12, y - 12]) + ' ' + pt([x + 19, y - 9]) + 'C' + pt([x + 12, y - 7]) + ' ' + pt([x - 10, y - 6]) + ' ' + pt([x - 17, y - 9]) + 'Z', c.cel(dk(hc, 0.1)), 1.6) + L('M' + pt([x - 9, y - 16]) + 'L' + pt([x + 12, y - 16]) + 'M' + pt([x - 9, y - 12]) + 'L' + pt([x + 12, y - 12]), OL, 1) + claw(x + 1, y - 14, 0.18, OL);
    } else {
      s += L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', OL, 2.6) + L('M' + pt([x - 2, y - 16]) + 'l-2,-6 M' + pt([x + 2, y - 17]) + 'l1,-6 M' + pt([x + 6, y - 15]) + 'l4,-5', o.hair || '#e8e0d0', 1.2);
    }
    return s;
  }
  function gob(c, o) {
    var sk = o.skin || '#6aa84a';
    return biped(c, {
      skin: sk, shirt: o.shirt || '#b86a3a', pants: o.pants || '#5a4a3a', sleeve: o.sleeve, forearm: o.forearm, boots: o.boots || '#3a2a20', belt: o.belt, buckle: o.buckle, glove: o.glove,
      hx: o.hx || 56, hy: o.hy || 32, hipY: 86, legW: o.legW || 10, armW: o.armW || 8.5, shadowR: o.shadowR || 30,
      torsoD: o.torsoD || 'M46,52 C52,46 76,46 82,52 L82,72 L80,88 L48,88 L46,72 Z',
      head: function (c, x, y) { return G(gobHead(c, x, y, o), at(1.3, x, y + 6)); },
      chest: o.chest, back: o.back, front: o.front, pads: o.pads, top: o.top, legN: o.legN, legF: o.legF, footN: o.footN, footF: o.footF,
      near: o.near || [[48, 56], [42, 70], [34, 80]], far: o.far || [[80, 56], [86, 70], [86, 84]],
      wNear: o.wNear, wFar: o.wFar, wNearFront: o.wNearFront, nearHand: o.nearHand, farHand: o.farHand, shins: o.shins,
      tf: at(o.scale || 0.84, 64, 122)
    });
  }
  function mitt(col) { return function (c, p) { return C(p[0], p[1], 5.2, c.cel(col), 2) + L('M' + pt([p[0] + 2, p[1] - 4]) + 'l3,5', dk(col, 0.35), 1.1); }; }
  // long pouring ladle: handle from `a` to `b`, the bowl of molten gold at b
  function ladle(c, a, b) {
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), q = dirQ(b, ang), o = limb('M' + pt(a) + 'L' + pt(b), '#4a4650', 2.8) + L('M' + pt(a) + 'L' + pt(b), '#8a8890', 0.9, 0.8);
    o += R(a[0] - 3, a[1] - 3, 6, 6, c.cel(LEATH), 1.2);
    var bx = b[0] - 2, by = b[1] + 6, bowl = 'M' + pt([bx - 11, by - 5]) + 'L' + pt([bx + 11, by - 5]) + 'C' + pt([bx + 11, by + 4]) + ' ' + pt([bx + 6, by + 9]) + ' ' + pt([bx, by + 9]) + 'C' + pt([bx - 6, by + 9]) + ' ' + pt([bx - 11, by + 4]) + ' ' + pt([bx - 11, by - 5]) + 'Z';
    o += C(bx, by - 4, 22, glow(c, '#ffa030', 0.7)) + limb('M' + pt(b) + 'L' + pt([bx + 8, by - 5]), '#4a4650', 2.4);
    o += body(c, bowl, IROND, F(pd([[bx + 3, by - 7], [bx + 13, by - 7], [bx + 13, by + 11], [bx + 3, by + 11]], true), '#000', 0.35), 1.8) + E(bx, by - 5, 10.4, 2.8, c.lg([[0, MOLTL], [1, MOLT]]), 1.3);
    o += P('M' + pt([bx - 10, by - 4]) + 'Q' + pt([bx - 14, by + 2]) + ' ' + pt([bx - 12, by + 9]) + 'Q' + pt([bx - 10, by + 3]) + ' ' + pt([bx - 8, by - 3]) + 'Z', MOLT, 1) + C(bx - 12, by + 12, 1.8, MOLT, 0.8) + C(bx - 12, by + 12, 5, glow(c, '#ffb040', 0.8));
    return o + steam(bx + 2, by - 8, 0.28, 0.5, 0.6) + motes(Math.round(bx * 7), 5, bx - 12, bx + 10, by - 22, by - 6, '#ffc040');
  }
  // whistle on a chain across the chest
  function whistle(c, x, y) { return L('M' + pt([x - 12, y - 18]) + 'Q' + pt([x - 8, y - 4]) + ' ' + pt([x, y]) + 'Q' + pt([x + 6, y - 8]) + ' ' + pt([x + 12, y - 18]), GOLD, 0.9) + P(pd([[x - 1, y - 1], [x + 6, y - 1], [x + 6, y + 4], [x - 3, y + 4], [x - 4, y + 2]], true), c.cel(GOLD), 1.1) + C(x + 4, y + 1.5, 2.6, c.cel(GOLD), 1) + C(x + 4, y + 1.5, 0.8, OL); }
  // ledger book held upright (x, y = centre)
  function heldBook(c, x, y, s) {
    var w = 12 * s, h = 17 * s, o = R(x - w / 2 + 2 * s, y - h / 2 + 1 * s, w, h, c.cel('#efe4c8'), 1.2 * s);
    o += R(x - w / 2, y - h / 2, w, h, c.cel(LEDG), 1.4 * s) + R(x - w / 2, y - h / 2, 3 * s, h, c.cel(LEDR), 1 * s) + claw(x + 1.4 * s, y, 0.34 * s, GOLD);
    return o + P(pd([[x + w / 2, y - h / 2], [x + w / 2 - 3 * s, y - h / 2], [x + w / 2, y - h / 2 + 3 * s]], true), GOLD, 0.8 * s) + P(pd([[x + w / 2, y + h / 2], [x + w / 2 - 3 * s, y + h / 2], [x + w / 2, y + h / 2 - 3 * s]], true), GOLD, 0.8 * s);
  }

  // ---- black drake (facing left): hunched and coiled, head low and snarling ----
  function drake(c, o) {
    var sc = o.col || DRK, sc2 = lt(sc, 0.16), bel = o.belly || BELLY, mem = o.mem || MEM, s = shadow(c, 66, 52);
    // far wing, half raised
    var fw = 'M76,62 C80,44 90,26 104,14 L108,30 L118,24 L116,40 L126,40 L116,54 L120,60 L100,64 C92,66 84,68 80,72 Z';
    s += body(c, fw, dk(sc, 0.08), F('M82,66 C90,52 100,38 108,28 L113,38 C104,48 96,56 90,64 Z', mem, 0.85) + F('M92,66 C102,56 110,48 118,44 L119,54 C110,58 102,62 96,66 Z', dk(mem, 0.15), 0.85) + L('M78,66 L106,18 M84,68 L116,28 M92,68 L124,42', OL, 1.4), 2.2);
    // far legs
    s += limb('M98,98 L106,110 L102,117', dk(sc, 0.12), 10) + P('M92,116 L108,116 L110,122 L90,122 Z', c.cel(dk(sc, 0.12)), 1.6) + L('M90,122 l-3,-1 M96,122 l-2,-1', '#e8e0c8', 1.3);
    s += limb('M60,98 L54,110 L58,117', dk(sc, 0.12), 10) + P('M46,116 L62,116 L64,122 L44,122 Z', c.cel(dk(sc, 0.12)), 1.6) + L('M44,122 l-3,-1 M50,122 l-2,-1', '#e8e0c8', 1.3);
    // body
    var bd = 'M40,84 C40,66 60,56 84,58 C106,60 118,76 114,94 C110,108 94,112 74,112 C56,112 40,102 40,84 Z', scales = '';
    for (var i = 0; i < 5; i++) for (var j = 0; j < 4; j++) scales += 'M' + pt([56 + i * 10 + (j % 2) * 5, 66 + j * 8]) + 'q3.4,3.4 6.8,0';
    s += body(c, bd, sc, L(scales, sc2, 1.1, 0.8) + F('M42,90 C50,106 76,112 98,104 C84,102 64,100 50,90 Z', bel) + L('M50,96 q4,3 8,2 M60,101 q5,2 10,1 M74,104 q5,1 10,-1 M86,104 q4,0 8,-2', dk(bel, 0.35), 1.1) + F('M84,54 C102,62 118,80 110,104 L120,104 L120,54 Z', dk(sc, 0.4), 0.85), 2.4);
    // tail coiling round the front along the ground
    var TT = taper([[108, 100], [122, 108], [118, 120], [96, 124], [72, 123], [52, 120], [40, 116]], 17, 4, 6);
    s += body(c, TT.d, sc, L(bands(TT, 3), sc2, 1, 0.9) + F(ribbonBand(TT, 0.6, 1), bel, 0.7), 2.2);
    var tip = TT.s[TT.s.length - 1];
    s += P(pd([[tip[0] + 2, tip[1] - 2], [tip[0] - 6, tip[1] - 7], [tip[0] - 4, tip[1] + 0.5], [tip[0] - 7, tip[1] + 5], [tip[0] + 2, tip[1] + 2]], true), c.cel(mem), 1.3);
    for (var k = 3; k < TT.s.length - 6; k += 5) { var a = TT.b[k]; s += P(pd([[a[0] - 3, a[1] + 1], [a[0] - 1, a[1] - 5], [a[0] + 3, a[1]]], true), c.cel(sc2), 1); }
    // neck and head, low and forward; the head is drawn big so the snarl reads at small size
    s += body(c, 'M46,90 C38,84 34,76 34,66 L52,54 C54,64 58,70 64,74 Z', sc, F('M35,70 C38,78 42,84 48,88 L42,90 C37,84 34,78 34,70 Z', bel, 0.95) + L('M40,68 q3,3 6,1 M44,76 q3,3 6,1', sc2, 1), 2.2);
    var hx = 36, hy = 64, h = '';
    // horns swept back
    h += P('M' + pt([hx + 6, hy - 8]) + 'C' + pt([hx + 14, hy - 16]) + ' ' + pt([hx + 24, hy - 20]) + ' ' + pt([hx + 32, hy - 17]) + 'C' + pt([hx + 24, hy - 13]) + ' ' + pt([hx + 18, hy - 8]) + ' ' + pt([hx + 12, hy - 3]) + 'Z', c.cel('#d8ccb0'), 1.6);
    h += P('M' + pt([hx + 1, hy - 10]) + 'C' + pt([hx + 6, hy - 20]) + ' ' + pt([hx + 12, hy - 26]) + ' ' + pt([hx + 21, hy - 29]) + 'C' + pt([hx + 15, hy - 21]) + ' ' + pt([hx + 11, hy - 15]) + ' ' + pt([hx + 8, hy - 7]) + 'Z', c.cel('#ece2c8'), 1.6);
    // lower jaw, dropped open, the mouth full of fire
    var jw = 'M' + pt([hx + 8, hy + 2]) + 'L' + pt([hx - 18, hy + 13]) + 'C' + pt([hx - 22, hy + 15]) + ' ' + pt([hx - 20, hy + 19]) + ' ' + pt([hx - 15, hy + 18]) + 'L' + pt([hx + 6, hy + 11]) + 'Z';
    h += P(pd([[hx + 6, hy], [hx - 24, hy + 1], [hx - 19, hy + 14], [hx + 6, hy + 6]], true), '#6a1a0c', 1.2) + C(hx - 9, hy + 6, 13, glow(c, '#ff8a20', 0.95));
    h += P(pd([[hx + 2, hy + 1.5], [hx - 20, hy + 3], [hx - 16, hy + 11], [hx + 2, hy + 5]], true), c.lg([[0, '#fff0a0'], [0.5, '#ffb030'], [1, '#ff6a1a']], 0, 0, 1, 0), 0) + C(hx - 12, hy + 6, 1.3, '#fffbe0') + C(hx - 6, hy + 4.6, 1, '#fffbe0');
    h += body(c, jw, sc, F(pd([[hx - 20, hy + 15], [hx + 8, hy + 7], [hx + 8, hy + 15], [hx - 20, hy + 21]], true), bel, 0.6), 2);
    h += L('M' + pt([hx - 16, hy + 12.4]) + 'l1,-3.4 M' + pt([hx - 10, hy + 9.6]) + 'l1,-3.4', '#f4ecd6', 1.6);
    // upper head with fangs
    var hd = 'M' + pt([hx + 12, hy - 4]) + 'C' + pt([hx + 12, hy - 12]) + ' ' + pt([hx, hy - 14]) + ' ' + pt([hx - 6, hy - 10]) + 'L' + pt([hx - 22, hy - 5]) + 'C' + pt([hx - 27, hy - 3]) + ' ' + pt([hx - 27, hy + 3]) + ' ' + pt([hx - 22, hy + 3]) + 'L' + pt([hx - 4, hy + 3]) + 'C' + pt([hx + 4, hy + 6]) + ' ' + pt([hx + 12, hy + 4]) + ' ' + pt([hx + 12, hy - 4]) + 'Z';
    h += body(c, hd, sc, F('M' + pt([hx - 28, hy - 1]) + 'L' + pt([hx + 14, hy - 2]) + 'L' + pt([hx + 14, hy + 8]) + 'L' + pt([hx - 28, hy + 8]) + 'Z', dk(sc, 0.3), 0.7) + L('M' + pt([hx - 20, hy - 5]) + 'L' + pt([hx - 6, hy - 9]), sc2, 1.2, 0.8), 2.2);
    h += P(pd([[hx - 22, hy + 2.6], [hx - 20.6, hy + 7.4], [hx - 19, hy + 2.8]], true), '#f4ecd6', 0.9) + P(pd([[hx - 13, hy + 2.8], [hx - 11.8, hy + 6.6], [hx - 10.4, hy + 3]], true), '#f4ecd6', 0.9);
    h += C(hx - 23, hy - 2.6, 1, OL) + smoke(hx - 26, hy - 6, 0.16, '#6a5a5a', 0.6, -1);
    // angry brow and glowing eye
    h += glowEye(c, hx - 8, hy - 4, 2.1, o.eye || EMB) + P(pd([[hx - 15, hy - 10], [hx - 2, hy - 7], [hx - 3, hy - 5], [hx - 13, hy - 6]], true), c.cel(dk(sc, 0.1)), 1.2);
    h += P(pd([[hx + 2, hy - 12], [hx + 6, hy - 19], [hx + 7, hy - 11]], true), c.cel(sc2), 1);
    s += G(h, at(1.24, hx + 10, hy + 2));
    // near legs, claws dug in
    s += limb('M52,98 L42,110 L46,117', sc, 10.5) + P('M32,116 L50,116 L52,122 L30,122 Z', c.cel(sc), 1.6) + L('M30,122 l-3,-1 M36,122 l-2,-1.5 M42,122 l-1,-1.5', '#e8e0c8', 1.4);
    s += limb('M86,100 L94,112 L88,117', sc, 10) + P('M78,116 L94,116 L96,122 L76,122 Z', c.cel(sc), 1.6) + L('M76,122 l-3,-1 M82,122 l-2,-1.5', '#e8e0c8', 1.4);
    // near wing, folded high
    var nw = 'M60,70 C62,54 70,40 84,30 L100,22 L96,34 L110,34 L102,44 L114,50 L98,56 C88,60 80,66 74,76 Z';
    s += body(c, nw, sc, F('M66,66 C70,54 78,44 90,34 L94,38 C84,46 76,56 72,66 Z', mem, 0.9) + F('M76,68 C82,58 92,48 104,40 L106,46 C94,52 86,60 80,68 Z', lt(mem, 0.08), 0.9) + F('M82,70 C90,62 100,56 110,50 L100,56 C92,60 86,66 84,72 Z', dk(mem, 0.1), 0.9) + L('M64,70 L98,24 M72,70 L108,36 M80,72 L112,50', OL, 1.4), 2.2);
    // spine ridge
    s += P('M50,60 L54,52 L58,60 L62,54 L64,62 Z', c.cel(mem), 1.2) + P('M104,66 L110,60 L110,68 L116,66 L114,74 Z', c.cel(mem), 1.2);
    // coins stuck in the scales
    [[56, 78, 3.6], [96, 74, 3.4], [102, 90, 3.2], [72, 90, 3.8], [86, 98, 3], [50, 70, 2.8], [112, 116, 3], [74, 121, 3.2], [44, 80, 2.6]].forEach(function (k, i) { s += i % 3 === 1 ? E(k[0], k[1], k[2], k[2] * 0.6, c.cel(GOLD), 1) + E(k[0] - k[2] * 0.3, k[1] - k[2] * 0.2, k[2] * 0.3, k[2] * 0.15, '#fffbe0', 0, 0.9) : coin(c, k[0], k[1], k[2]); });
    s += motes(o.embers || 61, 14, 0, 26, 58, 90, '#ffb030') + motes((o.embers || 61) + 1, 6, 96, 124, 14, 50, '#ff8a30');
    return G(s, at(o.scale || 1, 64, 122));
  }

  // ---- the coin-stamping construct (facing left) ----
  function pressLeg(c, hip, knee, foot, col) {
    var o = limb(pd([hip, knee]), col, 14) + L(pd([hip, knee]), lt(col, 0.3), 2.6, 0.6) + limb(pd([knee, foot]), '#7a7880', 9) + L(pd([knee, foot]), '#b8b8c0', 1.8, 0.8);
    o += limb(pd([[hip[0] + 7, hip[1] + 2], [foot[0] + 7, foot[1] - 4]]), '#9a98a0', 2.2) + C(knee[0], knee[1], 6.4, c.cel(IROND), 1.8) + C(knee[0], knee[1], 2, BRASS);
    return o + P(pd([[foot[0] - 14, foot[1] + 6], [foot[0] + 12, foot[1] + 6], [foot[0] + 10, foot[1] - 2], [foot[0] - 10, foot[1] - 2]], true), c.cel(IROND), 1.8) + rivetLine(foot[0] - 8, foot[1] + 2, foot[0] + 6, foot[1] + 2, 3, 1, '#9a98a0');
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    foreman_nettlecog: function (c) {
      var sk = '#6aa84a', apron = LEATH;
      return G(gob(c, {
        skin: sk, soot: true, grin: true, gogEyes: MOLT, hatStyle: 'hard', hat: '#c89a3a', stripe: '#5a3a1a', lamp: true, earring: true,
        shirt: '#6a5a4a', sleeve: '#6a5a4a', forearm: sk, glove: '#6a3e22', pants: '#3a3a46', boots: '#2a2220', belt: '#3a2618', buckle: BRASS,
        torsoD: 'M42,52 C48,44 80,44 86,52 L86,72 L82,88 L46,88 L42,72 Z', legW: 11.5, armW: 10.5, shadowR: 36,
        chest: function (c) { return F('M52,56 l6,-3 l1,5 Z M72,64 l5,2 l-3,3 Z', SOOT, 0.5); },
        front: function (c) {
          var d = 'M50,56 L78,56 L82,88 L84,108 L46,108 L48,88 Z';
          return L('M52,56 L48,46 M76,56 L80,46', OL, 4.6) + L('M52,56 L48,46 M76,56 L80,46', dk(apron, 0.15), 2.8) +
            body(c, d, apron, F('M70,54 L90,54 L90,110 L74,110 Z', dk(apron, 0.3), 0.7) + R(56, 76, 16, 10, c.cel(dk(apron, 0.12)), 1.2) + L('M58,74 L56,66 M62,74 L64,65', '#8a8890', 1.6) + E(62, 98, 7, 4, SOOT, 0, 0.5) + E(74, 70, 3, 2, MOLT, 0, 0.6) + C(54, 104, 1.6, GOLD, 0.6), 2) +
            rivet(52, 58, 1.4) + rivet(76, 58, 1.4);
        },
        near: [[46, 56], [38, 70], [36, 82]], nearHand: mitt('#6a3e22'),
        far: [[82, 56], [90, 64], [86, 56]], farHand: mitt('#5a3218'),
        wNear: function (c, p) { return ladle(c, [98, 46], [14, 98]); },
        scale: 0.94
      }), at(1.04, 64, 122));
    },
    the_great_press: function (c) {
      var o = shadow(c, 66, 50);
      // far leg and the steam stack at the back
      o += pressLeg(c, [94, 92], [104, 104], [102, 114], dk(BRASS, 0.18));
      o += pipe(c, [[100, 46], [110, 46], [110, 20]], 4, BRASSD) + R(105, 14, 10, 7, c.cel(IROND), 1.4) + steam(110, 12, 0.34, 0.6, 1.2);
      // body: riveted brass box with a furnace grate
      var bd = 'M46,42 L104,42 C108,42 110,44 110,48 L110,92 C110,96 108,98 104,98 L50,98 C46,98 44,96 44,92 L44,48 C44,44 44,42 46,42 Z';
      o += body(c, bd, BRASS, F('M86,38 L114,38 L114,102 L86,102 Z', dk(BRASS, 0.28), 0.8) + L('M44,58 L110,58 M44,84 L110,84', dk(BRASS, 0.4), 1.6) + L('M48,46 L104,46', lt(BRASS, 0.35), 1.2, 0.8), 2.4);
      o += rivetLine(48, 52, 106, 52, 8, 1.3) + rivetLine(48, 90, 106, 90, 8, 1.3) + rivetLine(49, 62, 49, 80, 3, 1.3) + rivetLine(105, 62, 105, 80, 3, 1.3);
      o += C(78, 72, 18, glow(c, '#ff9a30', 0.6)) + C(78, 72, 9.5, c.cel(IROND), 2) + C(78, 72, 6.8, c.rg([[0, '#fff0a0'], [0.5, MOLT], [1, '#b83a10']]), 1.2) + L('M73,68 L83,68 M72,72 L84,72 M73,76 L83,76', OL, 1.4);
      o += C(98, 70, 5, c.cel(BRASS), 1.4) + C(98, 70, 3.4, '#f4ecd6', 0.9) + L('M98,70 L100,67', LEDR, 1.1);
      // the fly-press head: screw column, bar and iron weights
      var scr = ''; for (var v = 20; v < 42; v += 4) scr += 'M' + pt([73, v]) + 'L' + pt([83, v + 2.4]);
      o += R(72, 18, 12, 24, c.cel('#8a8890'), 1.6) + L(scr, IROND, 1.2);
      o += limb('M40,16 L116,16', IROND, 3.6) + C(38, 16, 7.4, c.cel(IROND), 2) + C(118, 16, 7.4, c.cel(IROND), 2) + C(36, 14, 2.2, '#9a98a0', 0, 0.8) + C(116, 14, 2.2, '#9a98a0', 0, 0.8);
      o += R(70, 11, 16, 9, c.cel(BRASS), 1.6) + rivet(74, 15.5, 1.1) + rivet(82, 15.5, 1.1);
      // visor slits, glowing
      o += R(50, 46, 26, 9, c.cel(IROND), 1.4) + R(53, 49, 8, 3.2, '#ffc050', 0.6) + R(64, 49, 8, 3.2, '#ffc050', 0.6) + C(62, 50.5, 12, glow(c, '#ffb040', 0.5));
      // side piston on the back
      o += R(104, 60, 10, 22, c.cel(IRON), 1.6) + limb('M109,82 L106,94', '#b8b8c0', 3);
      // near leg
      o += pressLeg(c, [60, 94], [54, 106], [56, 114], BRASS);
      // the ram arm and the huge die plate with the claw mark
      o += limb('M50,70 L30,70', IROND, 12) + L('M50,66 L32,66', '#8a8890', 1.6, 0.8) + R(36, 62, 10, 16, c.cel(BRASS), 1.6) + limb('M48,82 L34,76', '#b8b8c0', 3.4) + R(44, 78, 8, 8, c.cel(IRON), 1.4);
      o += C(24, 72, 30, glow(c, '#ffb040', 0.45));
      o += C(24, 72, 23, c.cel(IROND), 2.4) + C(24, 72, 18.6, c.cel('#6e6c76'), 1.6);
      for (var i = 0; i < 8; i++) { var a = i * PI / 4 + 0.2; o += rivet(24 + Math.cos(a) * 20.8, 72 + Math.sin(a) * 20.8, 1.3, '#a8a6b0'); }
      o += L(ellD(24, 72, 14, 14), '#3a3840', 1.4) + claw(24, 72, 1.12, '#ffd050', '#6a3a10') + C(24, 72, 14, glow(c, '#ffc040', 0.35));
      o += steam(44, 104, 0.34, 0.6, -1.2) + steam(98, 104, 0.3, 0.55, 1) + steam(30, 44, 0.3, 0.5, -0.8);
      return G(o + motes(1601, 6, 10, 50, 44, 100, '#ffd060'), at(1.0, 64, 122));
    },
    emberhide: function (c) { return drake(c, { scale: 1.02, embers: 1701 }); },
    mintmaster_coinwhistle: function (c) {
      var sk = '#72b050', coat = '#2a3450', vest = '#8a1e24';
      return G(gob(c, {
        skin: sk, monocle: true, grin: true, hatStyle: 'top', hat: '#26222e', band: GOLD, earring: true,
        shirt: coat, sleeve: coat, forearm: coat, glove: '#f0e8d4', pants: '#2e2a36', boots: '#1a1618', legW: 9.5, armW: 9, shadowR: 32,
        back: function (c) { return body(c, 'M48,62 L82,62 C88,78 92,94 96,112 L84,108 L78,112 L72,104 C68,90 56,76 48,62 Z', dk(coat, 0.1), F('M82,60 L100,60 L100,114 L84,114 Z', '#000', 0.3) + L('M74,104 L78,110 L84,106 L94,110', GOLD, 1.2), 2); },
        chest: function (c) {
          var o = P('M56,50 L74,50 L72,86 L58,86 Z', c.cel(vest), 1.4) + L('M58,56 L72,56 M58,64 L72,64 M58,72 L72,72', dk(vest, 0.3), 0.8);
          [56, 63, 70, 77].forEach(function (y) { o += C(65, y, 1.7, c.cel(GOLD), 0.8); });
          o += P('M58,48 L66,58 L60,50 Z M72,48 L64,58 L70,50 Z', '#f4ecd6', 1) + P('M62,50 L68,50 L66,56 L64,56 Z', '#f4ecd6', 1);
          o += L('M50,50 L60,86 M80,50 L72,86', OL, 3) + L('M50,50 L60,86 M80,50 L72,86', lt(coat, 0.2), 1.4) + C(54, 72, 1.8, c.cel(GOLD), 0.8) + C(56, 80, 1.8, c.cel(GOLD), 0.8) + C(76, 72, 1.8, c.cel(GOLD), 0.8) + C(74, 80, 1.8, c.cel(GOLD), 0.8);
          return o + whistle(c, 66, 70);
        },
        near: [[48, 56], [36, 62], [26, 54]], nearHand: function (c, p) { return balance(c, p[0] - 1, p[1] + 5, 1.05, -0.28) + C(p[0], p[1], 4.4, c.cel('#f0e8d4'), 2); },
        far: [[80, 56], [92, 64], [94, 76]], wFar: function (c, p) { return heldBook(c, p[0] + 6, p[1] - 2, 1.1); }, farHand: function (c, p) { return C(p[0], p[1], 4.2, c.cel('#e0d8c4'), 2); },
        scale: 0.92
      }), at(1.02, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(BRASS), 2.5); }
  function phScene(c) { return dSky(c, 330, 30) + ground(c, 150, SST, SSTD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#c8963a"/></svg>'; }
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
