/* art_tirisfal.js — Tirisfal Glades zone art for Azeroth Solo (Forsaken homeland: Deathknell, Brill, Agamand Mills,
 * Garren's Haunt, the Scarlet Watch Post, Night Web's Hollow and the Undercity).
 * Loads AFTER art.js (and any other zone pack) and EXTENDS window.ART: ART.scene / ART.mob handle the Tirisfal keys
 * and fall through to the previous functions for every other key. Keys are appended to ART.keys.scenes / ART.keys.mobs.
 * Self-contained: no dependency on art.js internals. Never throws.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix "ti<counter>_").
 * Palette: overcast purple-grey sky, grey-green ground, low pale fog, sickly green glows; mobs kept a step lighter
 * than the ground and rim-lit so they read against the dark scenes.
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
  function Ctx() { this.p = 'ti' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function P(d, fill, sw) { return '<path d="' + d + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : '') + '/>'; }
  function F(d, fill, op) { return '<path d="' + d + '" fill="' + fill + '"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function L(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + n(w) + '" stroke-linecap="round" stroke-linejoin="round"' + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, op) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '/>'; }
  function C(cx, cy, r, fill, sw, op) { return E(cx, cy, r, r, fill, sw, op); }
  function R(x, y, w, h, fill, sw, rx) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round"' : '') + '/>'; }
  function G(s, tf, op) { return '<g' + (tf ? ' transform="' + tf + '"' : '') + (op != null && op < 1 ? ' opacity="' + op + '"' : '') + '>' + s + '</g>'; }
  function at(s, x, y) { return 'matrix(' + n(s * 1000) / 1000 + ',0,0,' + n(s * 1000) / 1000 + ',' + n(x - x * s) + ',' + n(y - y * s) + ')'; }
  function rot(a, x, y) { return 'rotate(' + n(a) + ',' + n(x) + ',' + n(y) + ')'; }
  function limb(d, col, w) { return L(d, OL, w + 4.5) + L(d, col, w); }
  function body(c, d, col, shade, sw) {
    var s = P(d, c.cel(col), sw == null ? 2.5 : sw);
    if (shade) s += '<g clip-path="url(#' + c.clip(d) + ')">' + shade + '</g>';
    return s;
  }
  function shadow(c, cx, rx) { return E(cx, 122.5, rx, 8, c.rg([[0, '#000', 0.5], [0.65, '#000', 0.28], [1, '#000', 0]])); }
  // pale rim behind a mob so dark silhouettes still read on dark scenes
  function rim(c, cx, cy, rx, ry, col) { return E(cx, cy, rx, ry, c.rg([[0, col || '#c8e0b0', 0.22], [0.6, col || '#c8e0b0', 0.1], [1, col || '#c8e0b0', 0]])); }
  function flame(c, x, y, s, outer, inner) {
    var o = outer || '#ff7a1a', i = inner || '#ffd84a';
    return P('M' + pt([x, y]) + 'C' + pt([x - 8 * s, y]) + ' ' + pt([x - 9 * s, y - 9 * s]) + ' ' + pt([x - 4 * s, y - 14 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 1 * s, y - 9 * s]) + ' ' + pt([x, y - 20 * s]) +
      'C' + pt([x + 4 * s, y - 12 * s]) + ' ' + pt([x + 5 * s, y - 14 * s]) + ' ' + pt([x + 5 * s, y - 16 * s]) + 'C' + pt([x + 10 * s, y - 9 * s]) + ' ' + pt([x + 8 * s, y]) + ' ' + pt([x, y]) + 'Z', o, 1.6 * Math.max(0.7, s)) +
      F('M' + pt([x, y - 1 * s]) + 'C' + pt([x - 4 * s, y - 1 * s]) + ' ' + pt([x - 5 * s, y - 6 * s]) + ' ' + pt([x - 1 * s, y - 11 * s]) + 'C' + pt([x, y - 7 * s]) + ' ' + pt([x + 2 * s, y - 8 * s]) + ' ' + pt([x + 2 * s, y - 10 * s]) + 'C' + pt([x + 5 * s, y - 6 * s]) + ' ' + pt([x + 4 * s, y - 1 * s]) + ' ' + pt([x, y - 1 * s]) + 'Z', i);
  }
  // simple Scarlet flame crest (three tongues), centred on x,y, height ~16k
  function crest(x, y, k, col) {
    function q(dx, dy) { return pt([x + dx * k, y + dy * k]); }
    return F('M' + q(0, 7) + 'C' + q(-7, 6) + ' ' + q(-7, -1) + ' ' + q(-4, -5) + 'C' + q(-4, -1) + ' ' + q(-3, 0) + ' ' + q(-1.4, 1) +
      'C' + q(-2.6, -4) + ' ' + q(-1.2, -7) + ' ' + q(0, -11) + 'C' + q(1.2, -7) + ' ' + q(2.6, -4) + ' ' + q(1.4, 1) +
      'C' + q(3, 0) + ' ' + q(4, -1) + ' ' + q(4, -5) + 'C' + q(7, -1) + ' ' + q(7, 6) + ' ' + q(0, 7) + 'Z', col || '#f4ecd6');
  }

  // ============================================================
  //  SCENE PIECES
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function vignette(c, top, bot) { return R(0, 0, 400, 240, c.lg([[0, top || '#d8d0e8', 0.12], [0.5, '#d8d0e8', 0], [1, bot || '#0c0a10', 0.34]])); }
  function ground(c, y, top, bot) { return R(-2, y, 404, 242 - y, c.lg([[0, top], [1, bot]])); }
  // heavy overcast: rows of soft flat cloud lumps, lighter underside
  function overcast(c, seed, y, col, cnt, sc) {
    var r = rng(seed), o = '';
    sc = sc || 1;
    for (var i = 0; i < cnt; i++) {
      var x = -20 + i * 440 / cnt + r() * 24, rx = (36 + r() * 28) * sc, ry = (9 + r() * 7) * sc, yy = y + r() * 12;
      o += E(x, yy, rx, ry, col) + E(x - rx * 0.25, yy + ry * 0.55, rx * 0.8, ry * 0.4, lt(col, 0.12), 0, 0.8);
    }
    return o;
  }
  function moon(c, x, y, r) { return C(x, y, r * 4.5, glow(c, '#d8f0c0', 0.35)) + C(x, y, r, '#dfe8cc', 0, 0.85) + E(x + r * 0.3, y - r * 0.2, r * 0.3, r * 0.22, '#b8c4a8', 0, 0.7); }
  function fog(c, y, h, col, op) { return R(-2, y - h / 2, 404, h, c.lg([[0, col || '#b8c4b0', 0], [0.5, col || '#b8c4b0', op == null ? 0.4 : op], [1, col || '#b8c4b0', 0]])); }
  // wispy fog puffs along a line
  function mist(c, seed, y, col, cnt, op) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) o += E(r() * 420 - 10, y + r() * 10 - 5, 30 + r() * 40, 5 + r() * 4, col || '#c4ceb8', 0, (op || 0.35) * (0.6 + r() * 0.4));
    return o;
  }
  function hills(d, col) { return F(d, col); }
  // leafless twisted tree. flat=true for far silhouettes (no outline)
  function deadTree(c, x, y, s, seed, col, flat) {
    col = col || '#4a4038';
    var r = rng(seed), segs = [];
    function br(x0, y0, a, len, w, depth) {
      var bend = (r() - 0.5) * 0.6, x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
      var mx = x0 + Math.cos(a + bend) * len * 0.55, my = y0 + Math.sin(a + bend) * len * 0.55;
      segs.push(['M' + pt([x0, y0]) + 'Q' + pt([mx, my]) + ' ' + pt([x1, y1]), w]);
      if (depth > 0) {
        br(x1, y1, a - 0.4 - r() * 0.35, len * (0.62 + r() * 0.15), w * 0.62, depth - 1);
        br(x1, y1, a + 0.35 + r() * 0.35, len * (0.58 + r() * 0.15), w * 0.6, depth - 1);
        if (r() < 0.35) br(x1, y1, a + (r() - 0.5) * 0.3, len * 0.5, w * 0.5, depth - 1);
      } else if (r() < 0.6) segs.push(['M' + pt([x1, y1]) + 'l' + n((r() - 0.5) * 8 * s) + ',' + n(-4 * s - r() * 4 * s), w * 0.6]);
    }
    br(x, y, -PI / 2 + (r() - 0.5) * 0.25, 34 * s, 8 * s, 3);
    var o = '', i;
    var base = 'M' + pt([x - 9 * s, y + 1]) + 'Q' + pt([x - 4 * s, y - 4 * s]) + ' ' + pt([x - 3 * s, y - 16 * s]) + 'L' + pt([x + 3 * s, y - 16 * s]) + 'Q' + pt([x + 4 * s, y - 4 * s]) + ' ' + pt([x + 10 * s, y + 1]) + 'Z';
    if (flat) {
      o += F(base, col);
      for (i = 0; i < segs.length; i++) o += L(segs[i][0], col, segs[i][1]);
      return o;
    }
    o += E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.25);
    o += P(base, col, 2 * s);
    for (i = 0; i < segs.length; i++) o += L(segs[i][0], OL, segs[i][1] + 3.2 * s);
    o += F(base, col);
    for (i = 0; i < segs.length; i++) o += L(segs[i][0], col, segs[i][1]);
    for (i = 0; i < Math.min(5, segs.length); i++) o += L(segs[i][0], lt(col, 0.22), Math.max(0.8, segs[i][1] * 0.25), 0.8);
    return o;
  }
  function tuft(c, x, y, s, col) {
    col = col || '#7a7a58';
    var d = 'M' + pt([x - 5 * s, y]) + 'L' + pt([x - 7 * s, y - 8 * s]) + 'M' + pt([x - 2 * s, y]) + 'L' + pt([x - 2 * s, y - 11 * s]) + 'M' + pt([x + 1 * s, y]) + 'L' + pt([x + 4 * s, y - 10 * s]) + 'M' + pt([x + 4 * s, y]) + 'L' + pt([x + 8 * s, y - 6 * s]);
    return L(d, OL, 3 * s) + L(d, col, 1.4 * s);
  }
  function tufts(seed, y0, y1, cnt, col, skipX0, skipX1) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, y = y0 + r() * (y1 - y0); if (skipX0 != null && x > skipX0 && x < skipX1) continue; o += tuft(null, x, y, 0.7 + r() * 0.5, col); }
    return o;
  }
  function pebbles(seed, y0, y1, col, cnt) {
    var r = rng(seed), s = '';
    for (var i = 0; i < (cnt || 14); i++) { var x = r() * 400, y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.7); }
    return s;
  }
  function rock(c, x, y, w, h, col) {
    var d = 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w * 0.42, y - h * 0.6]) + 'L' + pt([x - w * 0.12, y - h]) + 'L' + pt([x + w * 0.3, y - h * 0.86]) + 'L' + pt([x + w / 2, y - h * 0.3]) + 'L' + pt([x + w * 0.46, y]) + 'Z';
    return body(c, d, col, F('M' + pt([x + w * 0.05, y - h]) + 'L' + pt([x + w * 0.3, y - h * 0.86]) + 'L' + pt([x + w / 2, y - h * 0.3]) + 'L' + pt([x + w * 0.46, y]) + 'L' + pt([x, y]) + 'Z', dk(col, 0.28), 0.85), 1.8);
  }
  function block(c, x, y, w, h, col, tilt) {
    var s = body(c, 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h]) + 'L' + pt([x + w / 2, y - h]) + 'L' + pt([x + w / 2, y]) + 'Z', col, F('M' + pt([x + w * 0.15, y - h - 2]) + 'L' + pt([x + w / 2 + 2, y - h - 2]) + 'L' + pt([x + w / 2 + 2, y + 2]) + 'L' + pt([x + w * 0.15, y + 2]) + 'Z', dk(col, 0.28), 0.8), 1.6);
    return tilt ? G(s, rot(tilt, x, y)) : s;
  }
  function rubble(c, x, y, s, col) {
    col = col || '#7a7670';
    return block(c, x - 10 * s, y, 12 * s, 8 * s, col, -8) + block(c, x + 6 * s, y + 1, 14 * s, 7 * s, dk(col, 0.08), 6) + block(c, x - 2 * s, y - 6 * s, 9 * s, 6 * s, lt(col, 0.05), 14);
  }
  // crooked tombstone. kind 0 rounded, 1 cross, 2 pointed slab
  function tombstone(c, x, y, s, tilt, kind, col) {
    col = col || '#8a8a8e';
    var o = E(x + 2 * s, y + 1, 12 * s, 3 * s, '#000', 0, 0.3), d;
    if (kind === 1) {
      d = 'M' + pt([x - 2.5 * s, y]) + 'L' + pt([x - 2.5 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x - 9 * s, y - 21 * s]) + 'L' + pt([x - 2.5 * s, y - 21 * s]) + 'L' + pt([x - 2.5 * s, y - 28 * s]) +
        'L' + pt([x + 2.5 * s, y - 28 * s]) + 'L' + pt([x + 2.5 * s, y - 21 * s]) + 'L' + pt([x + 9 * s, y - 21 * s]) + 'L' + pt([x + 9 * s, y - 16 * s]) + 'L' + pt([x + 2.5 * s, y - 16 * s]) + 'L' + pt([x + 2.5 * s, y]) + 'Z';
      o += G(body(c, d, col, F('M' + pt([x + 0.5 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y + 2]) + 'L' + pt([x + 0.5 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8), 1.8 * s), rot(tilt, x, y));
    } else if (kind === 2) {
      d = 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 20 * s]) + 'L' + pt([x, y - 27 * s]) + 'L' + pt([x + 8 * s, y - 20 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z';
      o += G(body(c, d, col, F('M' + pt([x + 3 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8) +
        L('M' + pt([x - 4 * s, y - 18 * s]) + 'L' + pt([x - 1 * s, y - 12 * s]) + 'L' + pt([x - 3 * s, y - 7 * s]), dk(col, 0.45), 1 * s) + E(x - 5 * s, y - 2 * s, 5 * s, 3 * s, '#5a7040', 0, 0.8), 1.8 * s), rot(tilt, x, y));
    } else {
      d = 'M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 16 * s]) + 'C' + pt([x - 8 * s, y - 27 * s]) + ' ' + pt([x + 8 * s, y - 27 * s]) + ' ' + pt([x + 8 * s, y - 16 * s]) + 'L' + pt([x + 8 * s, y]) + 'Z';
      o += G(body(c, d, col, F('M' + pt([x + 3 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y - 30 * s]) + 'L' + pt([x + 10 * s, y + 2]) + 'L' + pt([x + 3 * s, y + 2]) + 'Z', dk(col, 0.3), 0.8) +
        L('M' + pt([x - 5 * s, y - 14 * s]) + 'L' + pt([x + 3 * s, y - 14 * s]) + 'M' + pt([x - 4 * s, y - 10 * s]) + 'L' + pt([x + 2 * s, y - 10 * s]), dk(col, 0.35), 1.1 * s) + E(x - 6 * s, y - 1 * s, 5 * s, 3 * s, '#5a7040', 0, 0.8), 1.8 * s), rot(tilt, x, y));
    }
    return o;
  }
  function openGrave(c, x, y, s) {
    var o = '';
    // dirt mound behind
    o += body(c, 'M' + pt([x - 26 * s, y - 4 * s]) + 'C' + pt([x - 20 * s, y - 16 * s]) + ' ' + pt([x + 18 * s, y - 18 * s]) + ' ' + pt([x + 28 * s, y - 5 * s]) + 'Z', '#5a4a3c', F('M' + pt([x + 4 * s, y - 20 * s]) + 'L' + pt([x + 30 * s, y - 20 * s]) + 'L' + pt([x + 30 * s, y]) + 'L' + pt([x + 8 * s, y]) + 'Z', '#3a2e24', 0.7), 1.6 * s);
    // hole
    o += P('M' + pt([x - 22 * s, y - 3 * s]) + 'L' + pt([x + 22 * s, y - 5 * s]) + 'L' + pt([x + 24 * s, y + 6 * s]) + 'L' + pt([x - 24 * s, y + 8 * s]) + 'Z', '#4a3c30', 1.8 * s);
    o += F('M' + pt([x - 19 * s, y - 1 * s]) + 'L' + pt([x + 19 * s, y - 3 * s]) + 'L' + pt([x + 20 * s, y + 5 * s]) + 'L' + pt([x - 20 * s, y + 6 * s]) + 'Z', '#120e10');
    o += F('M' + pt([x - 19 * s, y - 1 * s]) + 'L' + pt([x + 19 * s, y - 3 * s]) + 'L' + pt([x + 19 * s, y]) + 'L' + pt([x - 19 * s, y + 2 * s]) + 'Z', '#2e2420', 0.9);
    // shovel stuck in the mound
    o += limb('M' + pt([x + 18 * s, y - 12 * s]) + 'L' + pt([x + 26 * s, y - 34 * s]), '#6a5038', 2 * s) + P('M' + pt([x + 14 * s, y - 12 * s]) + 'L' + pt([x + 20 * s, y - 10 * s]) + 'L' + pt([x + 18 * s, y - 2 * s]) + 'L' + pt([x + 12 * s, y - 4 * s]) + 'Z', '#8a8a90', 1.4 * s);
    return o;
  }
  function ironFence(x1, x2, y, h, step, gapSeed) {
    var o = '', r = rng(gapSeed || 3), d = '';
    step = step || 9;
    for (var x = x1; x <= x2; x += step) {
      if (r() < 0.15) continue;
      var lean = (r() - 0.5) * 4, hh = h * (0.85 + r() * 0.2);
      d += 'M' + n(x) + ',' + n(y) + 'L' + n(x + lean) + ',' + n(y - hh) + 'M' + n(x + lean - 2) + ',' + n(y - hh + 1) + 'L' + n(x + lean) + ',' + n(y - hh - 4) + 'L' + n(x + lean + 2) + ',' + n(y - hh + 1);
    }
    d += 'M' + x1 + ',' + n(y - h * 0.3) + 'L' + x2 + ',' + n(y - h * 0.3 + 2) + 'M' + x1 + ',' + n(y - h * 0.75) + 'L' + x2 + ',' + n(y - h * 0.75 - 1);
    o += L(d, OL, 3.4) + L(d, '#4a4650', 1.5);
    return o;
  }
  // arched window glowing sickly green
  function glowWin(c, x, y, w, h, col) {
    col = col || '#9aff5a';
    var d = 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x - w / 2, y - h]) + ' ' + pt([x, y - h - w * 0.2]) + 'Q' + pt([x + w / 2, y - h]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z';
    return C(x, y - h / 2, Math.max(w, h) * 1.3, glow(c, col, 0.45)) + P(d, c.lg([[0, lt(col, 0.5)], [1, col]]), 1.6) + L('M' + pt([x, y]) + 'L' + pt([x, y - h]) + 'M' + pt([x - w / 2, y - h * 0.45]) + 'L' + pt([x + w / 2, y - h * 0.45]), '#2a3a20', 1.2);
  }
  // ruined chapel: stone nave with caved roof, broken bell tower, green-lit windows
  function chapel(c, x, y, s) {
    var st = '#8a8478', o = '';
    o += E(x, y + 2, 80 * s, 6 * s, '#000', 0, 0.25);
    // bell tower (right), broken top
    var tw = 'M' + pt([x + 26 * s, y]) + 'L' + pt([x + 26 * s, y - 92 * s]) + 'L' + pt([x + 32 * s, y - 100 * s]) + 'L' + pt([x + 38 * s, y - 94 * s]) + 'L' + pt([x + 44 * s, y - 104 * s]) + 'L' + pt([x + 52 * s, y - 88 * s]) + 'L' + pt([x + 52 * s, y]) + 'Z';
    var tsh = F('M' + pt([x + 42 * s, y - 106 * s]) + 'L' + pt([x + 56 * s, y - 106 * s]) + 'L' + pt([x + 56 * s, y + 2]) + 'L' + pt([x + 42 * s, y + 2]) + 'Z', dk(st, 0.3), 0.85);
    for (var j = 1; j < 11; j++) tsh += L('M' + pt([x + 26 * s, y - j * 9 * s]) + 'L' + pt([x + 52 * s, y - j * 9 * s]), dk(st, 0.25), 0.9 * s, 0.7);
    o += body(c, tw, st, tsh, 2 * s);
    o += glowWin(c, x + 39 * s, y - 62 * s, 10 * s, 18 * s);
    // nave wall
    var wall = 'M' + pt([x - 58 * s, y]) + 'L' + pt([x - 58 * s, y - 36 * s]) + 'L' + pt([x + 26 * s, y - 36 * s]) + 'L' + pt([x + 26 * s, y]) + 'Z';
    var wsh = F('M' + pt([x + 6 * s, y - 38 * s]) + 'L' + pt([x + 28 * s, y - 38 * s]) + 'L' + pt([x + 28 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(st, 0.25), 0.8);
    for (var k = 1; k < 5; k++) wsh += L('M' + pt([x - 58 * s, y - k * 8 * s]) + 'L' + pt([x + 26 * s, y - k * 8 * s]), dk(st, 0.25), 0.9 * s, 0.7);
    o += body(c, wall, st, wsh, 2 * s);
    // gable end (front, left) with the roof caved in
    var gab = 'M' + pt([x - 58 * s, y - 36 * s]) + 'L' + pt([x - 34 * s, y - 66 * s]) + 'L' + pt([x - 10 * s, y - 36 * s]) + 'Z';
    o += body(c, gab, lt(st, 0.04), F('M' + pt([x - 34 * s, y - 68 * s]) + 'L' + pt([x - 8 * s, y - 36 * s]) + 'L' + pt([x - 34 * s, y - 36 * s]) + 'Z', dk(st, 0.2), 0.7), 2 * s);
    // roof remains + bare rafters
    o += body(c, 'M' + pt([x - 34 * s, y - 66 * s]) + 'L' + pt([x - 6 * s, y - 66 * s]) + 'L' + pt([x - 14 * s, y - 56 * s]) + 'L' + pt([x - 20 * s, y - 60 * s]) + 'L' + pt([x - 26 * s, y - 50 * s]) + 'L' + pt([x - 12 * s, y - 36 * s]) + 'L' + pt([x - 10 * s, y - 36 * s]) + 'Z', '#4a4458', '', 1.8 * s);
    for (var q = 0; q < 4; q++) o += limb('M' + pt([x - 4 * s + q * 8 * s, y - 36 * s]) + 'L' + pt([x - 8 * s + q * 8 * s + (q % 2 ? 3 : -2) * s, y - (52 - q * 3) * s]), '#4a3a30', 1.4 * s);
    o += limb('M' + pt([x - 6 * s, y - 66 * s]) + 'L' + pt([x + 20 * s, y - 60 * s]), '#4a3a30', 1.6 * s);
    // windows + door
    o += glowWin(c, x - 34 * s, y - 42 * s, 9 * s, 14 * s) + glowWin(c, x - 4 * s, y - 12 * s, 9 * s, 16 * s) + glowWin(c, x + 14 * s, y - 12 * s, 9 * s, 16 * s);
    o += P('M' + pt([x - 42 * s, y]) + 'L' + pt([x - 42 * s, y - 18 * s]) + 'Q' + pt([x - 34 * s, y - 28 * s]) + ' ' + pt([x - 26 * s, y - 18 * s]) + 'L' + pt([x - 26 * s, y]) + 'Z', '#141016', 1.8 * s);
    // cracks + rubble
    o += L('M' + pt([x - 52 * s, y - 30 * s]) + 'L' + pt([x - 48 * s, y - 22 * s]) + 'L' + pt([x - 52 * s, y - 14 * s]) + 'M' + pt([x + 30 * s, y - 80 * s]) + 'L' + pt([x + 34 * s, y - 72 * s]), OL, 1.2 * s);
    o += rubble(c, x - 64 * s, y + 3, 0.9 * s) + rubble(c, x + 58 * s, y + 4, 0.8 * s);
    return o;
  }
  // crooked half-timbered house (Brill style)
  function house(c, x, y, s, o) {
    o = o || {};
    var plaster = o.wall || '#a49884', beam = '#3a2e28', roofc = o.roof || '#4e4460', out = '';
    out += E(x, y + 2, 46 * s, 5 * s, '#000', 0, 0.28);
    var w = 36 * s, h = 36 * s;
    var inner = '';
    // chimney
    inner += body(c, 'M' + pt([x + 16 * s, y - h - 16 * s]) + 'L' + pt([x + 17 * s, y - h - 38 * s]) + 'L' + pt([x + 26 * s, y - h - 36 * s]) + 'L' + pt([x + 25 * s, y - h - 10 * s]) + 'Z', '#6a625c', '', 1.8 * s);
    inner += E(x + 24 * s, y - h - 46 * s, 8 * s, 5 * s, '#7a7a80', 0, 0.45) + E(x + 30 * s, y - h - 56 * s, 10 * s, 5 * s, '#7a7a80', 0, 0.3);
    // lower wall (stone) + upper overhang (timber)
    var wall = 'M' + pt([x - w, y]) + 'L' + pt([x - w, y - h * 0.5]) + 'L' + pt([x + w, y - h * 0.5]) + 'L' + pt([x + w, y]) + 'Z';
    inner += body(c, wall, '#7a7470', F('M' + pt([x + w * 0.45, y - h]) + 'L' + pt([x + w + 2, y - h]) + 'L' + pt([x + w + 2, y + 2]) + 'L' + pt([x + w * 0.45, y + 2]) + 'Z', '#4a4444', 0.7) + L('M' + pt([x - w, y - h * 0.25]) + 'L' + pt([x + w, y - h * 0.25]), '#4a4444', 1 * s), 2 * s);
    var up = 'M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x - w - 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'Z';
    var beams = L('M' + pt([x - w - 4 * s, y - h * 0.5]) + 'L' + pt([x + w + 4 * s, y - h * 0.5]) + 'M' + pt([x - w, y - h]) + 'L' + pt([x - w, y - h * 0.5]) + 'M' + pt([x - w * 0.33, y - h]) + 'L' + pt([x - w * 0.33, y - h * 0.5]) + 'M' + pt([x + w * 0.33, y - h]) + 'L' + pt([x + w * 0.33, y - h * 0.5]) + 'M' + pt([x + w, y - h]) + 'L' + pt([x + w, y - h * 0.5]) +
      'M' + pt([x - w, y - h * 0.5]) + 'L' + pt([x - w * 0.33, y - h]) + 'M' + pt([x + w * 0.33, y - h * 0.5]) + 'L' + pt([x + w, y - h]), beam, 2.6 * s);
    inner += body(c, up, plaster, F('M' + pt([x + w * 0.45, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h - 2]) + 'L' + pt([x + w + 6 * s, y - h * 0.5 + 2]) + 'L' + pt([x + w * 0.45, y - h * 0.5 + 2]) + 'Z', dk(plaster, 0.25), 0.8) + beams, 2 * s);
    // steep roof, sagging, with a hole
    var roof = 'M' + pt([x - w - 12 * s, y - h + 2 * s]) + 'L' + pt([x - 4 * s, y - h - 34 * s]) + 'Q' + pt([x + 4 * s, y - h - 30 * s]) + ' ' + pt([x + 8 * s, y - h - 34 * s]) + 'L' + pt([x + w + 12 * s, y - h + 2 * s]) + 'Z';
    var rsh = F('M' + pt([x + 4 * s, y - h - 36 * s]) + 'L' + pt([x + w + 14 * s, y - h + 4 * s]) + 'L' + pt([x + 10 * s, y - h + 4 * s]) + 'Z', dk(roofc, 0.3), 0.8);
    for (var i = 1; i < 5; i++) rsh += L('M' + pt([x - w - 12 * s + i * 5 * s, y - h + 2 * s - i * 7 * s]) + 'L' + pt([x + w + 12 * s - i * 5 * s, y - h + 2 * s - i * 7 * s]), dk(roofc, 0.3), 1 * s, 0.8);
    if (o.hole) rsh += F('M' + pt([x - 16 * s, y - h - 8 * s]) + 'L' + pt([x - 8 * s, y - h - 20 * s]) + 'L' + pt([x, y - h - 12 * s]) + 'L' + pt([x - 4 * s, y - h - 4 * s]) + 'Z', '#1a1418');
    inner += body(c, roof, roofc, rsh, 2.2 * s);
    // windows + door
    inner += R(x - w * 0.8, y - h * 0.9, 9 * s, 9 * s, '#8aff5a', 1.6 * s) + R(x + w * 0.45, y - h * 0.9, 9 * s, 9 * s, '#8aff5a', 1.6 * s);
    inner += L('M' + pt([x - w * 0.8 + 4.5 * s, y - h * 0.9]) + 'L' + pt([x - w * 0.8 + 4.5 * s, y - h * 0.9 + 9 * s]) + 'M' + pt([x + w * 0.45 + 4.5 * s, y - h * 0.9]) + 'L' + pt([x + w * 0.45 + 4.5 * s, y - h * 0.9 + 9 * s]), '#2a3a20', 1.2 * s);
    inner += C(x - w * 0.8 + 4.5 * s, y - h * 0.85, 14 * s, glow(c, '#9aff5a', 0.35)) + C(x + w * 0.45 + 4.5 * s, y - h * 0.85, 14 * s, glow(c, '#9aff5a', 0.35));
    inner += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 8 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y - 15 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#2a2018', 1.6 * s) + C(x + 3 * s, y - 7 * s, 1 * s, '#c8a040');
    out += G(inner, 'matrix(1,0,' + n((o.skew || 0) / 100) + ',1,' + n(-y * (o.skew || 0) / 100) + ',0)');
    return out;
  }
  // green-flame street lantern on a crooked post
  function lantern(c, x, y, h, s) {
    s = s || 1;
    var top = y - h, o = '';
    o += limb('M' + pt([x, y]) + 'L' + pt([x - 1 * s, top]), '#3a2e28', 2.6 * s);
    o += limb('M' + pt([x - 1 * s, top + 2 * s]) + 'L' + pt([x - 12 * s, top]), '#3a2e28', 2 * s);
    o += L('M' + pt([x - 11 * s, top]) + 'L' + pt([x - 11 * s, top + 5 * s]), OL, 1.2 * s);
    return o + cageLantern(c, x - 11 * s, top + 12 * s, s);
  }
  // gallows-like signpost with a blank board and a hanging cage lantern
  function gallowsSign(c, x, y, s) {
    var o = '', wood = '#4a3a30';
    o += E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.28);
    o += limb('M' + pt([x, y]) + 'L' + pt([x + 1 * s, y - 70 * s]), wood, 4 * s);
    o += limb('M' + pt([x + 3 * s, y - 68 * s]) + 'L' + pt([x - 32 * s, y - 70 * s]), wood, 3.4 * s);
    o += limb('M' + pt([x, y - 46 * s]) + 'L' + pt([x - 16 * s, y - 68 * s]), wood, 2.4 * s);
    o += P('M' + pt([x - 2 * s, y - 70 * s]) + 'L' + pt([x + 1 * s, y - 78 * s]) + 'L' + pt([x + 4 * s, y - 70 * s]) + 'Z', '#2a2a30', 1.4 * s);
    // ropes + blank board
    o += L('M' + pt([x - 28 * s, y - 70 * s]) + 'L' + pt([x - 29 * s, y - 56 * s]) + 'M' + pt([x - 10 * s, y - 70 * s]) + 'L' + pt([x - 10 * s, y - 55 * s]), '#8a7a5a', 1.3 * s);
    o += G(body(c, 'M' + pt([x - 34 * s, y - 56 * s]) + 'L' + pt([x - 5 * s, y - 56 * s]) + 'L' + pt([x - 5 * s, y - 44 * s]) + 'L' + pt([x - 34 * s, y - 44 * s]) + 'Z', '#7a6448', L('M' + pt([x - 34 * s, y - 50 * s]) + 'L' + pt([x - 5 * s, y - 50 * s]), '#5a4630', 1 * s) + F('M' + pt([x - 16 * s, y - 58 * s]) + 'L' + pt([x - 4 * s, y - 58 * s]) + 'L' + pt([x - 4 * s, y - 42 * s]) + 'L' + pt([x - 16 * s, y - 42 * s]) + 'Z', '#4a3a28', 0.6), 1.6 * s), rot(-4, x - 20 * s, y - 50 * s));
    // a noose-like chain with a cage lantern off the far end
    o += L('M' + pt([x - 31 * s, y - 70 * s]) + 'L' + pt([x - 31 * s, y - 64 * s]), '#2a2a30', 1.2 * s);
    return o + cageLantern(c, x - 31 * s, y - 58 * s, 0.8 * s);
  }
  function cageLantern(c, lx, ly, s) {
    var o = C(lx, ly, 22 * s, glow(c, '#8aff4a', 0.6));
    o += P('M' + pt([lx - 5 * s, ly - 7 * s]) + 'L' + pt([lx + 5 * s, ly - 7 * s]) + 'L' + pt([lx + 4 * s, ly + 6 * s]) + 'L' + pt([lx - 4 * s, ly + 6 * s]) + 'Z', '#c8ff9a', 1.6 * s);
    o += flame(c, lx, ly + 5 * s, 0.42 * s, '#5ad82a', '#e8ffb0');
    o += P('M' + pt([lx - 6 * s, ly - 7 * s]) + 'L' + pt([lx, ly - 12 * s]) + 'L' + pt([lx + 6 * s, ly - 7 * s]) + 'Z', '#2a2a30', 1.4 * s) + R(lx - 5 * s, ly + 6 * s, 10 * s, 2.4 * s, '#2a2a30', 1.2 * s);
    return o + L('M' + pt([lx, ly - 7 * s]) + 'L' + pt([lx, ly + 6 * s]), '#2a2a30', 1 * s);
  }
  function windmill(c, x, y, s) {
    var st = '#7e7a72', o = '';
    o += E(x, y + 2, 34 * s, 5 * s, '#000', 0, 0.28);
    var tw = 'M' + pt([x - 24 * s, y]) + 'L' + pt([x - 15 * s, y - 80 * s]) + 'L' + pt([x + 15 * s, y - 80 * s]) + 'L' + pt([x + 24 * s, y]) + 'Z';
    var sh = F('M' + pt([x + 4 * s, y - 82 * s]) + 'L' + pt([x + 26 * s, y - 82 * s]) + 'L' + pt([x + 26 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', dk(st, 0.3), 0.85);
    for (var i = 1; i < 9; i++) sh += L('M' + pt([x - 30 * s, y - i * 9 * s]) + 'L' + pt([x + 30 * s, y - i * 9 * s]), dk(st, 0.25), 0.9 * s, 0.7);
    sh += F('M' + pt([x - 12 * s, y - 30 * s]) + 'L' + pt([x - 2 * s, y - 42 * s]) + 'L' + pt([x + 6 * s, y - 30 * s]) + 'L' + pt([x - 4 * s, y - 20 * s]) + 'Z', '#141016', 0.95);
    o += body(c, tw, st, sh, 2 * s);
    o += P('M' + pt([x - 7 * s, y]) + 'L' + pt([x - 7 * s, y - 16 * s]) + 'Q' + pt([x, y - 22 * s]) + ' ' + pt([x + 7 * s, y - 16 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z', '#1e1814', 1.6 * s);
    o += glowWin(c, x - 3 * s, y - 52 * s, 7 * s, 10 * s, '#b8e070');
    // cap
    o += body(c, 'M' + pt([x - 20 * s, y - 78 * s]) + 'Q' + pt([x - 16 * s, y - 102 * s]) + ' ' + pt([x, y - 106 * s]) + 'Q' + pt([x + 16 * s, y - 102 * s]) + ' ' + pt([x + 20 * s, y - 78 * s]) + 'Z', '#5a4a44', F('M' + pt([x + 2 * s, y - 108 * s]) + 'L' + pt([x + 22 * s, y - 108 * s]) + 'L' + pt([x + 22 * s, y - 76 * s]) + 'L' + pt([x + 6 * s, y - 76 * s]) + 'Z', '#3a302c', 0.8) + F('M' + pt([x - 10 * s, y - 94 * s]) + 'L' + pt([x - 4 * s, y - 98 * s]) + 'L' + pt([x - 2 * s, y - 90 * s]) + 'Z', '#1a1418'), 2 * s);
    // blades (one snapped, sails torn)
    var hx = x - 4 * s, hy = y - 86 * s, bl = [[-2.3, 62], [-0.75, 58], [0.8, 26], [2.4, 60]], wood = '#6a5a48';
    bl.forEach(function (b, k) {
      var a = b[0], len = b[1] * s, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      var e = [hx + ca * len, hy + sa * len];
      if (k !== 2) {
        var sail = 'M' + pt([hx + ca * 12 * s + px * 2 * s, hy + sa * 12 * s + py * 2 * s]) + 'L' + pt([e[0] + px * 2 * s, e[1] + py * 2 * s]) + 'L' + pt([e[0] + px * 12 * s, e[1] + py * 12 * s]) + 'L' + pt([hx + ca * (len * 0.6) + px * 13 * s, hy + sa * (len * 0.6) + py * 13 * s]) + 'L' + pt([hx + ca * 16 * s + px * 11 * s, hy + sa * 16 * s + py * 11 * s]) + 'Z';
        o += P(sail, '#a49a84', 1.4 * s);
        var lat = '';
        for (var j = 1; j < 5; j++) { var t = 12 * s + (len - 12 * s) * j / 5; lat += 'M' + pt([hx + ca * t + px * 2 * s, hy + sa * t + py * 2 * s]) + 'L' + pt([hx + ca * t + px * 12 * s, hy + sa * t + py * 12 * s]); }
        o += L(lat, '#4a3e32', 1.2 * s);
        if (k === 1) o += F('M' + pt([e[0] + px * 4 * s - ca * 20 * s, e[1] + py * 4 * s - sa * 20 * s]) + 'L' + pt([e[0] + px * 11 * s - ca * 6 * s, e[1] + py * 11 * s - sa * 6 * s]) + 'L' + pt([e[0] + px * 10 * s - ca * 22 * s, e[1] + py * 10 * s - sa * 22 * s]) + 'Z', '#3a3448');
      }
      o += limb('M' + pt([hx, hy]) + 'L' + pt(e), wood, 2.6 * s);
    });
    o += C(hx, hy, 4 * s, '#4a3a30', 1.6 * s);
    return o;
  }
  function brokenFence(c, x1, x2, y, s, seed) {
    var r = rng(seed || 5), o = '', wood = '#6a5a48', step = 22 * s;
    for (var x = x1; x <= x2; x += step) {
      var lean = (r() - 0.5) * 16;
      o += G(limb('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]), dk(wood, 0.1), 3 * s), rot(lean, x, y));
      if (x + step <= x2 && r() > 0.25) {
        var y1 = y - 12 * s + (r() - 0.5) * 3, y2 = y - 12 * s + (r() - 0.5) * 3;
        if (r() < 0.3) o += limb('M' + pt([x, y1]) + 'L' + pt([x + step * 0.5, y1 + 7 * s]), wood, 2.2 * s);
        else o += limb('M' + pt([x, y1]) + 'L' + pt([x + step, y2]), wood, 2.2 * s);
        if (r() > 0.4) o += limb('M' + pt([x, y - 5 * s]) + 'L' + pt([x + step, y - 5 * s + (r() - 0.5) * 3]), wood, 2.2 * s);
      }
    }
    return o;
  }
  function barn(c, x, y, s) {
    var wood = '#6a4c46', o = '';
    o += E(x, y + 2, 46 * s, 5 * s, '#000', 0, 0.28);
    var wall = 'M' + pt([x - 36 * s, y]) + 'L' + pt([x - 36 * s, y - 34 * s]) + 'L' + pt([x, y - 58 * s]) + 'L' + pt([x + 36 * s, y - 34 * s]) + 'L' + pt([x + 36 * s, y]) + 'Z';
    var planks = '';
    for (var i = -3; i <= 3; i++) planks += L('M' + pt([x + i * 10 * s, y - 60 * s]) + 'L' + pt([x + i * 10 * s, y]), dk(wood, 0.3), 1.1 * s);
    planks += F('M' + pt([x + 12 * s, y - 60 * s]) + 'L' + pt([x + 40 * s, y - 60 * s]) + 'L' + pt([x + 40 * s, y + 2]) + 'L' + pt([x + 12 * s, y + 2]) + 'Z', dk(wood, 0.3), 0.8);
    planks += F('M' + pt([x + 8 * s, y - 46 * s]) + 'L' + pt([x + 22 * s, y - 40 * s]) + 'L' + pt([x + 16 * s, y - 30 * s]) + 'L' + pt([x + 4 * s, y - 36 * s]) + 'Z', '#141016');
    o += body(c, wall, wood, planks, 2 * s);
    // big door with X brace
    o += body(c, 'M' + pt([x - 14 * s, y]) + 'L' + pt([x - 14 * s, y - 26 * s]) + 'L' + pt([x + 14 * s, y - 26 * s]) + 'L' + pt([x + 14 * s, y]) + 'Z', '#3a2a26', L('M' + pt([x - 14 * s, y]) + 'L' + pt([x + 14 * s, y - 26 * s]) + 'M' + pt([x + 14 * s, y]) + 'L' + pt([x - 14 * s, y - 26 * s]), '#6a5248', 2.4 * s), 1.8 * s);
    // roof edges, broken
    o += limb('M' + pt([x - 40 * s, y - 31 * s]) + 'L' + pt([x - 2 * s, y - 62 * s]), '#4a4058', 3.4 * s) + limb('M' + pt([x + 4 * s, y - 60 * s]) + 'L' + pt([x + 22 * s, y - 46 * s]), '#4a4058', 3.4 * s);
    return o;
  }
  // gnoll hide lean-to tent with bone poles
  function gnollTent(c, x, y, s, hide) {
    hide = hide || '#8a7458';
    var o = '';
    o += E(x, y + 2, 32 * s, 4 * s, '#000', 0, 0.28);
    o += limb('M' + pt([x - 6 * s, y - 40 * s]) + 'L' + pt([x - 14 * s, y - 56 * s]) + 'M' + pt([x + 2 * s, y - 40 * s]) + 'L' + pt([x + 10 * s, y - 58 * s]), '#6a5a44', 2 * s);
    var d = 'M' + pt([x - 30 * s, y]) + 'L' + pt([x - 4 * s, y - 44 * s]) + 'L' + pt([x + 30 * s, y]) + 'L' + pt([x + 18 * s, y - 3 * s]) + 'L' + pt([x + 8 * s, y + 1]) + 'L' + pt([x - 4 * s, y - 3 * s]) + 'L' + pt([x - 16 * s, y + 1]) + 'Z';
    var sh = F('M' + pt([x - 4 * s, y - 46 * s]) + 'L' + pt([x + 32 * s, y + 2]) + 'L' + pt([x + 4 * s, y + 2]) + 'Z', dk(hide, 0.3), 0.8) +
      L('M' + pt([x - 18 * s, y - 16 * s]) + 'L' + pt([x - 8 * s, y - 20 * s]) + 'M' + pt([x + 8 * s, y - 24 * s]) + 'L' + pt([x + 16 * s, y - 16 * s]) + 'M' + pt([x - 10 * s, y - 32 * s]) + 'L' + pt([x - 2 * s, y - 30 * s]), dk(hide, 0.45), 1.2 * s) +
      E(x - 14 * s, y - 10 * s, 6 * s, 4 * s, lt(hide, 0.15), 0, 0.6) + E(x + 12 * s, y - 8 * s, 5 * s, 3 * s, dk(hide, 0.2), 0, 0.8);
    o += body(c, d, hide, sh, 1.8 * s);
    o += P('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 3 * s, y - 20 * s]) + 'L' + pt([x + 6 * s, y]) + 'Z', '#1a1410', 1.4 * s);
    // skull on the pole
    o += P('M' + pt([x + 7 * s, y - 60 * s]) + 'C' + pt([x + 6 * s, y - 67 * s]) + ' ' + pt([x + 16 * s, y - 68 * s]) + ' ' + pt([x + 15 * s, y - 60 * s]) + 'L' + pt([x + 13 * s, y - 56 * s]) + 'L' + pt([x + 9 * s, y - 56 * s]) + 'Z', '#e4dcc4', 1.2 * s) + C(x + 9.5 * s, y - 62 * s, 1.1 * s, OL) + C(x + 12.5 * s, y - 62 * s, 1.1 * s, OL);
    return o;
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 10 * s, 50 * s, glow(c, '#ffa040', 0.5));
    o += E(x, y + 2 * s, 18 * s, 4 * s, '#000', 0, 0.3);
    for (var i = 0; i < 6; i++) { var a = PI * i / 5; o += rock(c, x - 16 * s * Math.cos(a), y + 2 * s + 2 * s * Math.sin(a), 6 * s, 5 * s, '#5a5654'); }
    o += limb('M' + pt([x - 12 * s, y]) + 'L' + pt([x + 10 * s, y - 6 * s]), '#5a4030', 3 * s) + limb('M' + pt([x + 12 * s, y]) + 'L' + pt([x - 10 * s, y - 6 * s]), '#6a4a34', 3 * s);
    o += flame(c, x - 5 * s, y - 1 * s, 0.8 * s) + flame(c, x + 5 * s, y - 1 * s, 0.75 * s) + flame(c, x, y, 1.2 * s);
    return o;
  }
  function pumpkin(c, x, y, s, rotten) {
    var col = rotten ? '#8a7a3a' : '#c8742a', o = E(x, y + 1, 9 * s, 2.4 * s, '#000', 0, 0.3);
    o += body(c, 'M' + pt([x - 9 * s, y - 5 * s]) + 'C' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 5 * s]) + 'C' + pt([x + 9 * s, y + 1]) + ' ' + pt([x - 9 * s, y + 1]) + ' ' + pt([x - 9 * s, y - 5 * s]) + 'Z', col,
      L('M' + pt([x - 3 * s, y - 11 * s]) + 'Q' + pt([x - 6 * s, y - 5 * s]) + ' ' + pt([x - 3 * s, y]) + 'M' + pt([x + 3 * s, y - 11 * s]) + 'Q' + pt([x + 6 * s, y - 5 * s]) + ' ' + pt([x + 3 * s, y]), dk(col, 0.35), 1.1 * s) + (rotten ? E(x + 4 * s, y - 3 * s, 3 * s, 2 * s, '#4a4a2a', 0, 0.9) : ''), 1.6 * s);
    o += limb('M' + pt([x, y - 10 * s]) + 'L' + pt([x + 1.5 * s, y - 14 * s]), '#4a5a2a', 1.2 * s);
    return o;
  }
  function bones(x, y, s) {
    var d = 'M' + pt([x - 6 * s, y]) + 'L' + pt([x + 6 * s, y - 2 * s]) + 'M' + pt([x - 2 * s, y - 4 * s]) + 'L' + pt([x + 3 * s, y + 2 * s]);
    return L(d, OL, 3.6 * s) + L(d, '#e4dcc4', 1.8 * s) + C(x - 6 * s, y, 1.4 * s, '#e4dcc4', 0.8) + C(x + 6 * s, y - 2 * s, 1.4 * s, '#e4dcc4', 0.8);
  }
  function crate(c, x, y, s) {
    return body(c, 'M' + pt([x - 9 * s, y]) + 'L' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z', '#7a6448', L('M' + pt([x - 9 * s, y - 16 * s]) + 'L' + pt([x + 9 * s, y]) + 'M' + pt([x - 9 * s, y - 8 * s]) + 'L' + pt([x + 9 * s, y - 8 * s]), '#4a3a28', 1.4 * s) + F('M' + pt([x + 3 * s, y - 17 * s]) + 'L' + pt([x + 10 * s, y - 17 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 3 * s, y + 1]) + 'Z', '#3a2a1a', 0.5), 1.6 * s);
  }
  function barrel(c, x, y, s) {
    return body(c, 'M' + pt([x - 7 * s, y]) + 'C' + pt([x - 9 * s, y - 6 * s]) + ' ' + pt([x - 9 * s, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 18 * s]) + 'L' + pt([x + 7 * s, y - 18 * s]) + 'C' + pt([x + 9 * s, y - 12 * s]) + ' ' + pt([x + 9 * s, y - 6 * s]) + ' ' + pt([x + 7 * s, y]) + 'Z', '#6a5040',
      L('M' + pt([x - 8.5 * s, y - 5 * s]) + 'L' + pt([x + 8.5 * s, y - 5 * s]) + 'M' + pt([x - 8.5 * s, y - 13 * s]) + 'L' + pt([x + 8.5 * s, y - 13 * s]), '#3a3a40', 1.8 * s) + F('M' + pt([x + 2 * s, y - 19 * s]) + 'L' + pt([x + 10 * s, y - 19 * s]) + 'L' + pt([x + 10 * s, y + 1]) + 'L' + pt([x + 2 * s, y + 1]) + 'Z', '#2a1e14', 0.5), 1.6 * s);
  }
  // ---- Scarlet camp ----
  function scarletTent(c, x, y, s) {
    var o = E(x, y + 2, 34 * s, 4 * s, '#000', 0, 0.28);
    var d = 'M' + pt([x - 32 * s, y]) + 'Q' + pt([x - 16 * s, y - 20 * s]) + ' ' + pt([x, y - 44 * s]) + 'Q' + pt([x + 16 * s, y - 20 * s]) + ' ' + pt([x + 32 * s, y]) + 'Z';
    var stripes = '';
    for (var i = -3; i <= 3; i += 2) stripes += F('M' + pt([x + i * 4 * s, y - 44 * s]) + 'L' + pt([x + (i + 1) * 4 * s, y - 44 * s]) + 'L' + pt([x + (i + 1) * 10 * s, y + 2]) + 'L' + pt([x + i * 10 * s, y + 2]) + 'Z', '#b8201c');
    stripes += F('M' + pt([x + 2 * s, y - 46 * s]) + 'L' + pt([x + 36 * s, y + 2]) + 'L' + pt([x + 6 * s, y + 2]) + 'Z', '#2a0a0a', 0.3);
    o += body(c, d, '#ece6da', stripes, 2 * s);
    o += P('M' + pt([x - 7 * s, y]) + 'L' + pt([x, y - 22 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z', '#2a1a16', 1.4 * s);
    o += L('M' + pt([x, y - 22 * s]) + 'L' + pt([x - 9 * s, y]) + 'M' + pt([x, y - 22 * s]) + 'L' + pt([x + 9 * s, y]), '#ece6da', 1.6 * s);
    o += limb('M' + pt([x, y - 44 * s]) + 'L' + pt([x, y - 54 * s]), '#5a4a3a', 1.4 * s);
    o += P('M' + pt([x + 1 * s, y - 54 * s]) + 'L' + pt([x + 12 * s, y - 51 * s]) + 'L' + pt([x + 1 * s, y - 48 * s]) + 'Z', '#c8201c', 1.2 * s);
    return o;
  }
  function scarletBanner(c, x, y, h) {
    var top = y - h, o = '';
    o += limb('M' + x + ',' + y + ' L' + x + ',' + n(top - 6), '#6a5238', 2.4);
    o += limb('M' + n(x - 4) + ',' + n(top) + ' L' + n(x + 22) + ',' + n(top), '#6a5238', 2);
    o += C(x, top - 7, 2.4, '#d8b048', 1.2);
    var bw = 22, bh = h * 0.56;
    var d = 'M' + n(x - 1) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top) + ' L' + n(x - 1 + bw) + ',' + n(top + bh) + ' L' + n(x + 10) + ',' + n(top + bh - 7) + ' L' + n(x - 1) + ',' + n(top + bh) + ' Z';
    o += body(c, d, '#c02420', F('M' + n(x + 13) + ',' + n(top) + ' L' + n(x + 23) + ',' + n(top) + ' L' + n(x + 23) + ',' + n(top + bh + 2) + ' L' + n(x + 13) + ',' + n(top + bh) + ' Z', '#6a1010', 0.6) +
      L('M' + n(x + 1.5) + ',' + n(top) + ' L' + n(x + 1.5) + ',' + n(top + bh - 2) + ' M' + n(x + bw - 3.5) + ',' + n(top) + ' L' + n(x + bw - 3.5) + ',' + n(top + bh - 2), '#f4ecd6', 1.6), 1.6);
    o += crest(x + 10, top + bh * 0.42, 1, '#f4ecd6');
    return o;
  }
  function torch(c, x, y, h, s) {
    s = s || 1;
    return limb('M' + pt([x, y]) + 'L' + pt([x, y - h]), '#5a4030', 2.2 * s) + C(x, y - h - 6 * s, 20 * s, glow(c, '#ffa040', 0.6)) + flame(c, x, y - h, 0.6 * s);
  }
  function woodTower(c, x, y, s) {
    var o = '', wood = '#6a5238';
    o += E(x, y + 1, 24 * s, 4 * s, '#000', 0, 0.28);
    o += limb('M' + pt([x - 16 * s, y]) + 'L' + pt([x - 11 * s, y - 72 * s]) + 'M' + pt([x + 16 * s, y]) + 'L' + pt([x + 11 * s, y - 72 * s]), wood, 4 * s);
    o += limb('M' + pt([x - 15 * s, y - 6 * s]) + 'L' + pt([x + 12 * s, y - 38 * s]) + 'M' + pt([x + 15 * s, y - 6 * s]) + 'L' + pt([x - 12 * s, y - 38 * s]) + 'M' + pt([x - 13 * s, y - 40 * s]) + 'L' + pt([x + 11 * s, y - 68 * s]) + 'M' + pt([x + 13 * s, y - 40 * s]) + 'L' + pt([x - 11 * s, y - 68 * s]), dk(wood, 0.12), 2.2 * s);
    o += body(c, 'M' + pt([x - 21 * s, y - 70 * s]) + 'L' + pt([x + 21 * s, y - 70 * s]) + 'L' + pt([x + 19 * s, y - 86 * s]) + 'L' + pt([x - 19 * s, y - 86 * s]) + 'Z', '#7a5e42', L('M' + pt([x - 21 * s, y - 78 * s]) + 'L' + pt([x + 21 * s, y - 78 * s]), '#4a3a28', 1.2 * s) + F('M' + pt([x + 6 * s, y - 88 * s]) + 'L' + pt([x + 23 * s, y - 88 * s]) + 'L' + pt([x + 23 * s, y - 68 * s]) + 'L' + pt([x + 6 * s, y - 68 * s]) + 'Z', '#3a2a1a', 0.6), 1.8 * s);
    o += limb('M' + pt([x - 17 * s, y - 86 * s]) + 'L' + pt([x - 17 * s, y - 100 * s]) + 'M' + pt([x + 17 * s, y - 86 * s]) + 'L' + pt([x + 17 * s, y - 100 * s]), wood, 2 * s);
    o += body(c, 'M' + pt([x - 26 * s, y - 98 * s]) + 'L' + pt([x, y - 118 * s]) + 'L' + pt([x + 26 * s, y - 98 * s]) + 'Z', '#b8201c', F('M' + pt([x, y - 120 * s]) + 'L' + pt([x + 28 * s, y - 97 * s]) + 'L' + pt([x, y - 97 * s]) + 'Z', '#6a1010', 0.55) + L('M' + pt([x - 13 * s, y - 108 * s]) + 'L' + pt([x - 16 * s, y - 98 * s]) + 'M' + pt([x + 13 * s, y - 108 * s]) + 'L' + pt([x + 16 * s, y - 98 * s]), '#ece6da', 3 * s), 1.8 * s);
    o += limb('M' + pt([x, y - 118 * s]) + 'L' + pt([x, y - 130 * s]), '#5a4a3a', 1.4 * s) + P('M' + pt([x + 1 * s, y - 130 * s]) + 'L' + pt([x + 13 * s, y - 127 * s]) + 'L' + pt([x + 1 * s, y - 124 * s]) + 'Z', '#c8201c', 1.2 * s);
    return o;
  }
  function palisade(c, x1, x2, y, h, col, step) {
    col = col || '#6a5238'; step = step || 9;
    var o = '';
    for (var x = x1; x < x2; x += step) {
      var hh = h * (0.9 + ((x * 37) % 10) / 50);
      var d = 'M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - hh) + ' L' + n(x + step / 2) + ',' + n(y - hh - step * 1.1) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' Z';
      o += P(d, c.cel(col), 1.6) + F('M' + n(x + step * 0.62) + ',' + n(y - hh - step * 0.5) + ' L' + n(x + step) + ',' + n(y - hh) + ' L' + n(x + step) + ',' + n(y) + ' L' + n(x + step * 0.62) + ',' + n(y) + ' Z', dk(col, 0.3), 0.75);
    }
    o += limb('M' + n(x1) + ',' + n(y - h * 0.35) + ' L' + n(x2) + ',' + n(y - h * 0.35), dk(col, 0.25), 2.2);
    return o;
  }
  // ---- spider webs + eggs ----
  function web(cx, cy, r, a0, a1, spokes, rings, col, op) {
    col = col || '#dcdcd4';
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
    return L(d, '#000', 2.4, 0.25) + L(d, col, 1, op == null ? 0.75 : op);
  }
  function eggs(c, x, y, s, cnt, seed) {
    var r = rng(seed || 1), o = C(x, y - 6 * s, 30 * s, glow(c, '#a8ff6a', 0.45)), list = [];
    for (var i = 0; i < cnt; i++) list.push([x + (r() - 0.5) * 30 * s, y - r() * 6 * s, (5 + r() * 3) * s]);
    list.sort(function (a, b) { return a[1] - b[1]; });
    list.forEach(function (e) {
      o += E(e[0], e[1] - e[2], e[2] * 0.8, e[2], c.rg([[0, '#f4ffd8'], [0.6, '#b8f08a'], [1, '#6ab84a']]), 1.6 * s) + E(e[0] - e[2] * 0.25, e[1] - e[2] * 1.3, e[2] * 0.22, e[2] * 0.3, '#ffffff', 0, 0.7);
    });
    return o;
  }
  // ---- undercity ----
  function column(c, x, y, h, w, col, broken) {
    col = col || '#7a7480';
    var top = y - h, o = '';
    var d = broken ? 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, top + 6]) + 'L' + pt([x - w * 0.1, top]) + 'L' + pt([x + w * 0.2, top + 8]) + 'L' + pt([x + w / 2, top + 3]) + 'L' + pt([x + w / 2, y]) + 'Z'
      : 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, top]) + 'L' + pt([x + w / 2, top]) + 'L' + pt([x + w / 2, y]) + 'Z';
    o += body(c, d, col, F('M' + pt([x + w * 0.15, top - 2]) + 'L' + pt([x + w / 2 + 2, top - 2]) + 'L' + pt([x + w / 2 + 2, y + 2]) + 'L' + pt([x + w * 0.15, y + 2]) + 'Z', dk(col, 0.3), 0.8) + L('M' + pt([x - w * 0.2, top]) + 'L' + pt([x - w * 0.2, y]), lt(col, 0.2), 1, 0.6), 1.8);
    o += R(x - w / 2 - 3, y - 5, w + 6, 5, c.cel(dk(col, 0.1)), 1.6);
    if (!broken) o += R(x - w / 2 - 3, top - 4, w + 6, 5, c.cel(dk(col, 0.1)), 1.6);
    return o;
  }
  function throne(c, x, y, s) {
    var o = '', gold = '#b89848';
    // dais
    o += body(c, 'M' + pt([x - 34 * s, y]) + 'L' + pt([x - 28 * s, y - 6 * s]) + 'L' + pt([x + 28 * s, y - 6 * s]) + 'L' + pt([x + 34 * s, y]) + 'Z', '#6a6470', '', 1.6);
    o += body(c, 'M' + pt([x - 24 * s, y - 6 * s]) + 'L' + pt([x - 20 * s, y - 11 * s]) + 'L' + pt([x + 20 * s, y - 11 * s]) + 'L' + pt([x + 24 * s, y - 6 * s]) + 'Z', '#7a7480', '', 1.6);
    // tall back
    o += body(c, 'M' + pt([x - 12 * s, y - 11 * s]) + 'L' + pt([x - 12 * s, y - 44 * s]) + 'L' + pt([x - 6 * s, y - 52 * s]) + 'L' + pt([x, y - 62 * s]) + 'L' + pt([x + 6 * s, y - 52 * s]) + 'L' + pt([x + 12 * s, y - 44 * s]) + 'L' + pt([x + 12 * s, y - 11 * s]) + 'Z', gold, F('M' + pt([x - 7 * s, y - 20 * s]) + 'L' + pt([x - 7 * s, y - 44 * s]) + 'L' + pt([x, y - 52 * s]) + 'L' + pt([x + 7 * s, y - 44 * s]) + 'L' + pt([x + 7 * s, y - 20 * s]) + 'Z', '#5a1a2a') + F('M' + pt([x + 4 * s, y - 64 * s]) + 'L' + pt([x + 14 * s, y - 64 * s]) + 'L' + pt([x + 14 * s, y - 9 * s]) + 'L' + pt([x + 4 * s, y - 9 * s]) + 'Z', '#2a1a10', 0.35), 1.8);
    o += body(c, 'M' + pt([x - 16 * s, y - 11 * s]) + 'L' + pt([x - 16 * s, y - 24 * s]) + 'L' + pt([x + 16 * s, y - 24 * s]) + 'L' + pt([x + 16 * s, y - 11 * s]) + 'Z', gold, F('M' + pt([x - 12 * s, y - 24 * s]) + 'L' + pt([x + 12 * s, y - 24 * s]) + 'L' + pt([x + 12 * s, y - 20 * s]) + 'L' + pt([x - 12 * s, y - 20 * s]) + 'Z', '#5a1a2a'), 1.8);
    o += C(x, y - 50 * s, 8 * s, glow(c, '#9aff5a', 0.5));
    return o;
  }
  // big stone arch opening; draws the vault dark inside
  function vaultArch(c, x, y, w, h, col, inner) {
    var r = w / 2, spring = y - h + r;
    var d = 'M' + pt([x - r, y]) + 'L' + pt([x - r, spring]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x + r, spring]) + 'L' + pt([x + r, y]) + 'Z';
    var ring = 'M' + pt([x - r, y]) + 'L' + pt([x - r, spring]) + 'A' + n(r) + ',' + n(r) + ' 0 0 1 ' + pt([x + r, spring]) + 'L' + pt([x + r, y]);
    var o = P(d, inner || c.lg([[0, '#0e0c12'], [0.7, '#1a2418'], [1, '#2a4a20']]), 0);
    o += L(ring, OL, 13) + L(ring, col, 9) + L(ring, lt(col, 0.18), 2, 0.7);
    // voussoir joints
    var j = '';
    for (var i = 1; i < 8; i++) { var a = PI + PI * i / 8, ca = Math.cos(a), sa = Math.sin(a); j += 'M' + pt([x + ca * (r - 4.5), spring + sa * (r - 4.5)]) + 'L' + pt([x + ca * (r + 4.5), spring + sa * (r + 4.5)]); }
    o += L(j, OL, 1.4);
    o += P('M' + pt([x - 5, spring - r - 6]) + 'L' + pt([x + 5, spring - r - 6]) + 'L' + pt([x + 4, spring - r + 5]) + 'L' + pt([x - 4, spring - r + 5]) + 'Z', c.cel(lt(col, 0.1)), 1.6);
    return o;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SKY = ['#2c2838', '#4a4460', '#7c7a8c'];
  var SCENES = {
    deathknell: function (c) {
      var o = sky(c, SKY[0], SKY[1], SKY[2]);
      o += overcast(c, 11, 8, '#3a3448', 7, 1.2) + overcast(c, 12, 34, '#484258', 6) + moon(c, 318, 52, 10) + E(310, 56, 30, 3, '#5a566c', 0, 0.8) + overcast(c, 13, 76, '#5a566c', 5, 0.8);
      o += hills('M-4,152 C40,128 90,124 140,136 C190,146 230,122 290,120 C340,118 370,132 404,128 L404,160 L-4,160 Z', '#4a5044');
      o += deadTree(c, 228, 146, 0.55, 3, '#3e443c', true) + deadTree(c, 286, 140, 0.45, 4, '#3e443c', true) + deadTree(c, 360, 146, 0.6, 5, '#3e443c', true);
      o += fog(c, 140, 26, '#b4bcb0', 0.5);
      o += ground(c, 148, '#5e6a4a', '#343c2a');
      o += F('M60,150 L94,150 L150,240 L20,240 Z', '#7a7462', 0.4);
      o += chapel(c, 104, 152, 1.02);
      o += ironFence(176, 404, 164, 16, 9, 7);
      o += tombstone(c, 196, 170, 0.62, -9, 0) + tombstone(c, 226, 166, 0.55, 5, 2) + tombstone(c, 258, 172, 0.66, -3, 1) + tombstone(c, 292, 167, 0.58, 11, 0) + tombstone(c, 326, 173, 0.68, -7, 2) + tombstone(c, 360, 168, 0.6, 6, 1);
      o += tombstone(c, 204, 190, 0.8, 7, 1) + tombstone(c, 376, 194, 0.85, -10, 0);
      o += openGrave(c, 268, 196, 0.72) + openGrave(c, 150, 212, 0.62);
      o += fog(c, 176, 22, '#c4ccbc', 0.3) + mist(c, 21, 184, '#c4ccbc', 8, 0.3);
      o += deadTree(c, 18, 176, 1.15, 8, '#4e443a') + deadTree(c, 388, 172, 1.05, 9, '#4e443a');
      o += tufts(31, 168, 234, 22, '#7a7a58');
      o += C(10, 230, 1.6, '#e4dcc4') + bones(60, 226, 1) + bones(340, 232, 0.9);
      return o + vignette(c);
    },
    night_web_hollow: function (c) {
      var o = sky(c, '#1e1c28', '#34304a', '#56566a');
      o += overcast(c, 21, 6, '#2c283a', 7, 1.1) + overcast(c, 22, 30, '#3a3650', 6, 0.9);
      // hillside with cave mouth
      var hill = 'M-6,150 L-6,96 C30,70 70,44 130,36 C190,28 250,32 300,48 C350,62 384,86 406,104 L406,150 Z';
      var str = L('M-6,118 Q140,98 406,122 M20,86 Q160,64 330,78 M100,50 Q200,40 290,58', '#3a3a3a', 1.4, 0.6);
      o += body(c, hill, '#5a5a56', F('M270,40 C330,54 380,80 406,100 L406,150 L300,150 Z', '#3a3a38', 0.8) + str + E(80, 70, 30, 8, '#6a7a52', 0, 0.5) + E(300, 70, 26, 7, '#6a7a52', 0, 0.45), 2.2);
      o += C(200, 124, 80, glow(c, '#7cff4a', 0.28));
      var mouth = 'M126,154 C120,110 152,68 200,64 C248,68 280,110 274,154 Z';
      o += P(mouth, c.lg([[0, '#08080a'], [0.65, '#101610'], [1, '#1e3018']]), 2.4);
      o += '<g clip-path="url(#' + c.clip(mouth) + ')">' + E(200, 150, 64, 30, glow(c, '#8aff4a', 0.55)) + '</g>';
      o += C(186, 118, 1.8, '#ff4a3a') + C(192, 116, 1.4, '#ff4a3a') + C(214, 110, 1.6, '#ff4a3a') + C(219, 112, 1.2, '#ff4a3a');
      // web across the mouth
      o += web(200, 108, 70, PI * 0.95, PI * 2.05, 9, 5, '#e4e4dc', 0.7);
      o += web(0, 0, 90, 0, PI / 2, 6, 5, '#dcdcd4', 0.55) + web(400, 0, 96, PI / 2, PI, 6, 5, '#dcdcd4', 0.55);
      o += deadTree(c, 36, 152, 0.9, 41, '#4a4038') + deadTree(c, 370, 150, 0.95, 42, '#4a4038');
      o += web(36, 118, 28, -PI * 0.1, PI * 0.9, 6, 3, '#e4e4dc', 0.6) + web(370, 112, 26, PI * 0.1, PI * 1.1, 6, 3, '#e4e4dc', 0.6);
      o += fog(c, 150, 20, '#a8b4a4', 0.35);
      o += ground(c, 150, '#4e5a44', '#2a3024');
      o += eggs(c, 118, 160, 1, 5, 3) + eggs(c, 286, 162, 1.1, 6, 4) + eggs(c, 208, 170, 0.8, 4, 5);
      o += L('M0,200 Q40,190 60,206 Q90,196 120,210 M300,214 Q340,202 400,212', '#dcdcd4', 1, 0.45);
      o += rock(c, 64, 176, 34, 18, '#4a4a48') + rock(c, 346, 180, 38, 20, '#4a4a48');
      o += eggs(c, 20, 206, 0.9, 3, 6) + eggs(c, 388, 214, 0.9, 3, 7);
      o += tufts(51, 176, 236, 14, '#6a6a4e') + pebbles(7, 170, 236, '#20241a', 14) + bones(170, 222, 1) + bones(250, 230, 0.9);
      return o + vignette(c, '#b0c0ff', '#060608');
    },
    brill: function (c) {
      var o = sky(c, SKY[0], SKY[1], SKY[2]);
      o += overcast(c, 31, 8, '#3a3448', 7, 1.2) + overcast(c, 32, 36, '#4a4458', 6) + overcast(c, 33, 72, '#5c586e', 5, 0.8);
      o += hills('M-4,150 C60,130 110,132 170,140 C230,148 280,126 340,128 C370,130 390,136 404,134 L404,160 L-4,160 Z', '#4a5044');
      o += deadTree(c, 150, 140, 0.5, 13, '#3e443c', true) + deadTree(c, 250, 138, 0.45, 14, '#3e443c', true);
      o += house(c, 196, 144, 0.55, { skew: 3, roof: '#4a4058' });
      o += fog(c, 142, 24, '#b4bcb0', 0.45);
      o += ground(c, 148, '#5e6a4a', '#343c2a');
      o += F('M170,148 L228,148 L300,240 L100,240 Z', '#7a766a', 0.55) + pebbles(9, 156, 238, '#4a4840', 26);
      o += house(c, 70, 158, 1.0, { skew: -5, hole: true }) + house(c, 318, 156, 0.92, { skew: 4, wall: '#9a9282', roof: '#544a64' });
      o += gallowsSign(c, 156, 176, 1);
      o += lantern(c, 236, 170, 42) + lantern(c, 396, 180, 44);
      o += barrel(c, 18, 190, 1) + barrel(c, 34, 194, 0.85) + crate(c, 262, 178, 0.8);
      o += pumpkin(c, 120, 188, 0.9) + pumpkin(c, 132, 192, 0.7, true);
      o += fog(c, 190, 18, '#c4ccbc', 0.22) + mist(c, 36, 196, '#c4ccbc', 6, 0.25);
      o += deadTree(c, 380, 234, 0.9, 17, '#4e443a');
      o += tufts(37, 170, 236, 14, '#7a7a58', 110, 290);
      return o + vignette(c);
    },
    agamand_mills: function (c) {
      var o = sky(c, SKY[0], '#504860', '#86828e');
      o += overcast(c, 41, 8, '#3a3448', 7, 1.2) + overcast(c, 42, 36, '#4a4458', 6) + overcast(c, 43, 70, '#5e5a70', 5, 0.8);
      o += hills('M-4,148 C50,132 100,128 160,134 C220,140 280,124 330,126 C370,128 390,134 404,132 L404,160 L-4,160 Z', '#4c5244');
      o += deadTree(c, 40, 140, 0.5, 23, '#3e443c', true) + deadTree(c, 196, 136, 0.42, 24, '#3e443c', true);
      o += fog(c, 140, 24, '#b4bcb0', 0.45);
      o += ground(c, 146, '#666a48', '#3a3e28');
      // dead wheat field
      var r = rng(44), wheat = '';
      for (var i = 0; i < 70; i++) { var x = r() * 400, y = 150 + r() * 20, h = 6 + r() * 6; wheat += 'M' + n(x) + ',' + n(y) + 'l' + n((r() - 0.5) * 4) + ',' + n(-h); }
      o += L(wheat, '#8a8250', 1.2, 0.8);
      o += windmill(c, 300, 154, 1.08);
      o += barn(c, 110, 158, 0.9);
      o += brokenFence(c, -4, 170, 172, 1, 45) + brokenFence(c, 214, 404, 174, 1, 46);
      o += body(c, 'M188,170 C190,156 214,154 218,170 Z', '#7a6e44', L('M194,164 L200,158 M206,166 L212,160', '#5a5030', 1.2), 1.6);
      o += fog(c, 186, 20, '#c4ccbc', 0.25) + mist(c, 47, 192, '#c4ccbc', 7, 0.25);
      o += deadTree(c, 22, 226, 1.0, 48, '#4e443a');
      o += pumpkin(c, 150, 200, 0.8, true) + pumpkin(c, 360, 206, 0.9, true) + bones(236, 220, 1);
      o += tufts(49, 180, 236, 18, '#8a8254');
      return o + vignette(c);
    },
    garrens_haunt: function (c) {
      var o = sky(c, SKY[0], SKY[1], SKY[2]);
      o += overcast(c, 51, 8, '#3a3448', 7, 1.2) + overcast(c, 52, 36, '#4a4458', 6) + overcast(c, 53, 72, '#5c586e', 5, 0.8);
      o += hills('M-4,150 C40,136 100,126 150,132 C210,140 250,130 300,122 C350,116 380,130 404,128 L404,160 L-4,160 Z', '#4a5044');
      o += deadTree(c, 110, 140, 0.5, 33, '#3e443c', true) + deadTree(c, 352, 136, 0.5, 34, '#3e443c', true);
      o += fog(c, 142, 24, '#b4bcb0', 0.45);
      o += ground(c, 148, '#606848', '#363c2a');
      o += house(c, 250, 150, 0.95, { skew: -3, hole: true, wall: '#8e8676', roof: '#4a4250' });
      o += rubble(c, 206, 154, 1, '#7a7470') + rubble(c, 300, 156, 0.8, '#7a7470');
      o += brokenFence(c, 170, 400, 170, 0.9, 55);
      o += gnollTent(c, 78, 170, 0.95) + gnollTent(c, 362, 176, 0.8, '#7a6a52');
      o += campfire(c, 166, 184, 0.85);
      o += pumpkin(c, 214, 190, 0.9, true) + pumpkin(c, 230, 196, 0.7) + pumpkin(c, 30, 204, 0.8, true);
      o += bones(120, 196, 1) + bones(300, 226, 1.1) + bones(60, 228, 0.9);
      o += fog(c, 192, 18, '#c4ccbc', 0.22) + mist(c, 57, 196, '#c4ccbc', 6, 0.25);
      o += deadTree(c, 394, 232, 0.95, 58, '#4e443a');
      o += tufts(59, 176, 236, 16, '#7a7a58');
      return o + vignette(c);
    },
    scarlet_watch_post: function (c) {
      var o = sky(c, '#34303e', '#56506a', '#8c8a96');
      o += overcast(c, 61, 8, '#403a4c', 7, 1.2) + overcast(c, 62, 36, '#524c60', 6) + overcast(c, 63, 72, '#66627a', 5, 0.8);
      o += hills('M-4,148 C50,130 110,128 160,136 C220,146 260,124 320,124 C360,124 384,132 404,130 L404,160 L-4,160 Z', '#4e5446');
      o += deadTree(c, 30, 138, 0.5, 43, '#3e443c', true);
      o += fog(c, 142, 22, '#b4bcb0', 0.4);
      o += ground(c, 148, '#666c4c', '#3a3e2a');
      o += F('M-4,176 C80,168 160,172 240,170 C320,168 360,174 404,172 L404,210 C300,206 100,212 -4,210 Z', '#7a7460', 0.35);
      o += palisade(c, -6, 250, 156, 20, '#6a5238', 8);
      o += scarletTent(c, 200, 158, 0.6) + scarletTent(c, 82, 174, 1) + scarletTent(c, 290, 172, 0.88);
      o += woodTower(c, 362, 180, 1.02);
      o += scarletBanner(c, 150, 190, 58) + scarletBanner(c, 236, 188, 54);
      o += torch(c, 20, 196, 26) + torch(c, 330, 196, 26);
      o += crate(c, 128, 196, 0.9) + crate(c, 140, 198, 0.7) + barrel(c, 266, 198, 0.9);
      o += fog(c, 196, 16, '#c4ccbc', 0.18);
      o += tufts(69, 190, 236, 12, '#7a7a58') + pebbles(71, 196, 236, '#3a3a2a', 12);
      return o + vignette(c);
    },
    undercity: function (c) {
      var st = '#4e4a58', o = R(0, 0, 400, 240, '#141218');
      // ---- upper level: the ruined throne room open to the sky ----
      o += R(0, 0, 400, 84, c.lg([[0, '#2a2638'], [0.6, '#4a4460'], [1, '#6a6680']]));
      o += overcast(c, 71, 2, '#3a3448', 7, 1) + overcast(c, 72, 22, '#46405a', 6, 0.7);
      // broken back wall, lower, with tall empty windows showing sky
      var bw = 'M-4,80 L-4,44 L22,40 L32,30 L44,38 L84,36 L92,26 L104,34 L146,34 L156,46 L244,46 L254,30 L266,38 L304,36 L316,24 L328,36 L366,38 L378,28 L404,34 L404,80 Z';
      var wsh = '';
      [44, 118, 282, 356].forEach(function (x) { wsh += F('M' + (x - 8) + ',76 L' + (x - 8) + ',54 Q' + (x - 8) + ',46 ' + x + ',44 Q' + (x + 8) + ',46 ' + (x + 8) + ',54 L' + (x + 8) + ',76 Z', '#5e5a76') + F('M' + x + ',44 Q' + (x + 8) + ',46 ' + (x + 8) + ',54 L' + (x + 8) + ',76 L' + x + ',76 Z', '#4a4660', 0.8); });
      wsh += L('M-4,60 L404,60 M-4,70 L404,70', dk(st, 0.3), 1, 0.7);
      o += body(c, bw, '#46424e', wsh, 2);
      o += column(c, 84, 82, 58, 12, '#6a6674', true) + column(c, 322, 82, 46, 12, '#6a6674', true) + column(c, 150, 82, 34, 10, '#6a6674', true) + column(c, 252, 82, 28, 10, '#6a6674', true);
      // torn banner of Lordaeron (no marks)
      o += body(c, 'M222,40 L240,40 L240,70 L235,64 L231,72 L227,64 L222,70 Z', '#34406a', L('M231,44 L231,62', '#a88a40', 1.6), 1.6);
      o += throne(c, 190, 82, 1);
      o += rubble(c, 120, 82, 0.8, '#6a6674') + rubble(c, 280, 82, 0.9, '#6a6674');
      o += E(190, 60, 80, 20, '#9aff5a', 0, 0.06);
      // thick floor slab of the throne room, cracked through
      o += body(c, 'M-4,78 L404,78 L404,94 L-4,94 Z', '#5a5664', L('M-4,86 L404,86', dk(st, 0.35), 1.2) + L('M40,78 L40,94 M110,78 L110,94 M180,78 L180,94 M250,78 L250,94 M320,78 L320,94 M380,78 L380,94', dk(st, 0.35), 1.2) + F('M-4,90 L404,90 L404,96 L-4,96 Z', '#1a1820', 0.7) + L('M196,78 L200,86 L194,94', OL, 1.4), 2);
      // ---- lower level: undercity vaults ----
      o += R(-2, 94, 404, 58, c.lg([[0, '#16141a'], [1, '#26222c']]));
      o += vaultArch(c, 70, 142, 90, 46, st) + vaultArch(c, 200, 142, 98, 48, st) + vaultArch(c, 330, 142, 90, 46, st);
      o += R(-4, 94, 22, 50, c.cel(st), 2) + R(116, 94, 32, 50, c.cel(st), 2) + R(252, 94, 32, 50, c.cel(st), 2) + R(382, 94, 22, 50, c.cel(st), 2);
      o += L('M-4,104 L18,104 M116,104 L148,104 M252,104 L284,104 M382,104 L404,104 M-4,120 L18,120 M116,120 L148,120 M252,120 L284,120 M382,120 L404,120', dk(st, 0.3), 1, 0.7);
      o += C(200, 140, 140, glow(c, '#6ae02a', 0.28));
      // canal
      o += R(-2, 128, 404, 24, c.lg([[0, '#1a3a12'], [0.35, '#3e9a1c'], [1, '#7ad83a']]));
      o += L('M10,136 Q30,133 50,136 M120,144 Q150,140 176,144 M240,134 Q270,131 296,134 M330,146 Q356,142 384,146', '#c8f890', 1.6, 0.7);
      o += C(90, 140, 2.4, '#c8f890', 1) + C(310, 142, 2, '#c8f890', 1) + C(210, 138, 1.6, '#c8f890', 1) + C(160, 134, 1.4, '#c8f890', 1);
      o += R(-2, 118, 404, 30, c.lg([[0, '#8aff4a', 0], [0.6, '#8aff4a', 0.18], [1, '#8aff4a', 0]]));
      // pipes spilling slime
      [[132, 108], [268, 108]].forEach(function (p) {
        o += R(p[0] - 7, p[1] - 6, 14, 12, c.cel('#5a5a50'), 1.8) + E(p[0], p[1], 5, 4, '#141210');
        o += P('M' + (p[0] - 4) + ',' + (p[1] + 2) + ' C' + (p[0] - 5) + ',' + (p[1] + 10) + ' ' + (p[0] - 3) + ',' + (p[1] + 16) + ' ' + (p[0] - 3) + ',130 L' + (p[0] + 3) + ',130 C' + (p[0] + 3) + ',' + (p[1] + 16) + ' ' + (p[0] + 5) + ',' + (p[1] + 10) + ' ' + (p[0] + 4) + ',' + (p[1] + 2) + ' Z', '#6ac83a', 1.4);
      });
      // walkway
      o += P('M-4,150 L404,150 L404,244 L-4,244 Z', c.lg([[0, '#5a5664'], [1, '#26222c']]), 0);
      o += R(-4, 148, 408, 6, c.cel('#6a6674'), 2);
      var tiles = '';
      [168, 190, 216].forEach(function (y) { tiles += 'M-4,' + y + ' L404,' + y; });
      for (var i = -6; i <= 6; i++) tiles += 'M' + (200 + i * 30) + ',154 L' + (200 + i * 60) + ',240';
      o += L(tiles, '#1e1a24', 1.2, 0.7);
      o += E(200, 172, 190, 12, '#9aff5a', 0, 0.08);
      o += lantern(c, 26, 196, 48) + lantern(c, 392, 200, 50);
      o += bones(140, 220, 1) + pebbles(81, 170, 236, '#18161c', 14);
      return o + vignette(c, '#c0ffc0', '#060508');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function claws(p, col, dir) {
    dir = dir || -1; var x = p[0], y = p[1], s = '';
    [[-3, 5], [0, 7], [3, 5]].forEach(function (k) { s += P('M' + pt([x + k[0] - 1.4, y + 2]) + 'Q' + pt([x + k[0] + dir * 2, y + k[1]]) + ' ' + pt([x + k[0] + dir * 4, y + k[1] + 3]) + 'Q' + pt([x + k[0] + dir * 0.5, y + k[1] - 1]) + ' ' + pt([x + k[0] + 1.4, y + 2]) + 'Z', col || '#e8e0c8', 1.1); });
    return s;
  }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function toes2(x, y, col) { return P('M' + n(x + 5) + ',' + n(y - 6) + ' L' + n(x + 5) + ',' + n(y + 1) + ' L' + n(x - 10) + ',' + n(y + 1) + ' C' + n(x - 12) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 6) + ' Z', c_(col), 2) + L('M' + n(x - 4) + ',' + n(y - 2) + ' L' + n(x - 3) + ',' + n(y + 1), OL, 1.2); }
  function paw(x, y, col) { return P('M' + n(x + 4) + ',' + n(y - 5) + ' C' + n(x + 6) + ',' + n(y) + ' ' + n(x + 4) + ',' + n(y + 1.5) + ' ' + n(x) + ',' + n(y + 1.5) + ' L' + n(x - 7) + ',' + n(y + 1.5) + ' C' + n(x - 9) + ',' + n(y + 1.5) + ' ' + n(x - 9) + ',' + n(y - 3) + ' ' + n(x - 5) + ',' + n(y - 4) + ' Z', c_(col), 2) + L('M' + n(x - 3) + ',' + n(y - 1) + ' l0,2.5 M' + n(x - 6) + ',' + n(y - 1) + ' l0,2.5', OL, 1); }
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.75)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function sword(p, len, ang, blade, s, rust) {
    var x = p[0], y = p[1], a = ang, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca; s = s || 1;
    var tip = [x + ca * len, y + sa * len], b0 = [x + ca * 7, y + sa * 7];
    var d = 'M' + pt([b0[0] + px * 3 * s, b0[1] + py * 3 * s]) + 'L' + pt([tip[0] + px * 2.5 * s, tip[1] + py * 2.5 * s]) + 'Q' + pt([tip[0] + ca * 4, tip[1] + sa * 4]) + ' ' + pt([tip[0] - px * 3 * s, tip[1] - py * 3 * s]) + 'L' + pt([b0[0] - px * 3 * s, b0[1] - py * 3 * s]) + 'Z';
    var o = P(d, _cur.cel(blade || '#c8ccd2'), 1.8) + L('M' + pt([b0[0] + ca * 2, b0[1] + sa * 2]) + 'L' + pt([tip[0] - ca * 4, tip[1] - sa * 4]), '#ffffff', 1, 0.6);
    if (rust) o += C(x + ca * len * 0.45 + px * 1.5, y + sa * len * 0.45 + py * 1.5, 2.2, '#6a3a1a', 0, 0.85) + C(x + ca * len * 0.7 - px, y + sa * len * 0.7 - py, 1.6, '#6a3a1a', 0, 0.85) +
      F('M' + pt([x + ca * len * 0.6 + px * 3.2, y + sa * len * 0.6 + py * 3.2]) + 'L' + pt([x + ca * len * 0.64 + px * 0.6, y + sa * len * 0.64 + py * 0.6]) + 'L' + pt([x + ca * len * 0.68 + px * 3.2, y + sa * len * 0.68 + py * 3.2]) + 'Z', '#1a1009');
    o += L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), OL, 5) + L('M' + pt([x + ca * 6 + px * 7, y + sa * 6 + py * 7]) + 'L' + pt([x + ca * 6 - px * 7, y + sa * 6 - py * 7]), rust ? '#7a5a3a' : '#d8b048', 2.6) +
      L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), OL, 5) + L('M' + pt([x - ca * 6, y - sa * 6]) + 'L' + pt([x + ca * 4, y + sa * 4]), '#5a3a22', 2.6);
    return o;
  }
  function shoulderPad(c, x, y, col, spikes) {
    var s = body(c, 'M' + pt([x - 10, y + 4]) + 'C' + pt([x - 10, y - 6]) + ' ' + pt([x + 10, y - 7]) + ' ' + pt([x + 11, y + 4]) + 'Z', col, '', 2);
    if (spikes) s += P('M' + pt([x - 5, y - 3]) + 'L' + pt([x - 7, y - 13]) + 'L' + pt([x - 1, y - 4]) + 'Z', '#e8dcc0', 1.4) + P('M' + pt([x + 2, y - 4]) + 'L' + pt([x + 4, y - 14]) + 'L' + pt([x + 6, y - 3]) + 'Z', '#e8dcc0', 1.4);
    return s;
  }
  function skullSmall(x, y, s) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', _cur.cel('#ece4cc'), 1.6) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, '#1a1009') + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, '#1a1009');
  }
  // ragged strip of cloth hanging from a point
  function rag(c, x, y, w, h, col) {
    return body(c, 'M' + pt([x - w / 2, y]) + 'L' + pt([x + w / 2, y]) + 'L' + pt([x + w * 0.4, y + h * 0.7]) + 'L' + pt([x + w * 0.1, y + h * 0.55]) + 'L' + pt([x - w * 0.1, y + h]) + 'L' + pt([x - w * 0.3, y + h * 0.6]) + 'L' + pt([x - w / 2, y + h * 0.8]) + 'Z', col, '', 1.6);
  }

  // ---- heads (facing left, 3/4) ----
  function humanHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', s = '';
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8));
    s += E(x + 5, y + 1, 2.4, 3.4, c.cel(sk), 1.4);
    s += C(x - 5, y - 1, 1.6, '#1a1009') + L('M' + pt([x - 8, y - 5]) + 'L' + pt([x - 2, y - 3.5]), o.hairCol || '#5a3a22', 1.8);
    s += L('M' + pt([x - 8, y + 7]) + 'L' + pt([x - 3, y + 6.5]), OL, 1.3);
    if (o.beard) s += P('M' + pt([x - 9, y + 5]) + 'C' + pt([x - 8, y + 16]) + ' ' + pt([x + 2, y + 17]) + ' ' + pt([x + 8, y + 7]) + 'L' + pt([x + 6, y + 4]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 9, y + 5]) + 'Z', c.cel(o.beard), 1.6);
    if (o.hat === 'helm' || o.hat === 'plumed') {
      var hc = o.helmCol || '#b8c0c8';
      if (o.hat === 'plumed') s += P('M' + pt([x + 2, y - 19]) + 'C' + pt([x + 6, y - 34]) + ' ' + pt([x + 22, y - 36]) + ' ' + pt([x + 30, y - 24]) + 'C' + pt([x + 26, y - 20]) + ' ' + pt([x + 30, y - 12]) + ' ' + pt([x + 26, y - 6]) + 'C' + pt([x + 22, y - 16]) + ' ' + pt([x + 14, y - 20]) + ' ' + pt([x + 8, y - 16]) + 'Z', c.cel(o.plume || '#f2f0ea'), 1.8) +
        L('M' + pt([x + 8, y - 24]) + 'Q' + pt([x + 18, y - 30]) + ' ' + pt([x + 26, y - 20]), dk(o.plume || '#f2f0ea', 0.25), 1.2);
      s += P('M' + pt([x - 16, y - 4]) + 'C' + pt([x - 10, y - 2]) + ' ' + pt([x + 10, y - 2]) + ' ' + pt([x + 16, y - 4]) + 'C' + pt([x + 14, y - 8]) + ' ' + pt([x - 12, y - 8]) + ' ' + pt([x - 16, y - 4]) + 'Z', c.cel(hc), 2);
      s += body(c, 'M' + pt([x - 10, y - 6]) + 'C' + pt([x - 10, y - 20]) + ' ' + pt([x + 10, y - 22]) + ' ' + pt([x + 11, y - 6]) + 'Z', hc, F('M' + pt([x + 3, y - 22]) + 'L' + pt([x + 12, y - 22]) + 'L' + pt([x + 12, y - 4]) + 'L' + pt([x + 3, y - 4]) + 'Z', dk(hc, 0.35), 0.7) + L('M' + pt([x - 1, y - 20]) + 'L' + pt([x - 1, y - 6]), o.trimCol || '#c02420', 2.2), 2);
      if (o.hat === 'helm') s += P('M' + pt([x - 2, y - 20]) + 'C' + pt([x + 2, y - 26]) + ' ' + pt([x + 8, y - 26]) + ' ' + pt([x + 12, y - 22]) + 'L' + pt([x + 6, y - 18]) + 'Z', c.cel(o.plume || '#c02420'), 1.6);
      // nose guard
      s += L('M' + pt([x - 9, y - 6]) + 'L' + pt([x - 10, y + 1]), OL, 3.4) + L('M' + pt([x - 9, y - 6]) + 'L' + pt([x - 10, y + 1]), hc, 1.6);
    } else {
      s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 10, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 11, y - 3]) + 'L' + pt([x + 7, y - 4]) + 'C' + pt([x + 3, y - 8]) + ' ' + pt([x - 4, y - 8]) + ' ' + pt([x - 10, y - 5]) + 'Z', c.cel(o.hairCol || '#5a3a22'), 2);
    }
    return s;
  }
  // gaunt rotting undead face
  function zombieHead(c, x, y, o) {
    var sk = o.skin, s = '';
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 15]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 4, y + 12]) + ' ' + pt([x, y + 12]) +
      'L' + pt([x - 5, y + 15]) + 'L' + pt([x - 9, y + 11]) + 'C' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 4]) + ' ' + pt([x - 9, y + 2]) + 'L' + pt([x - 13, y]) + 'L' + pt([x - 9, y - 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 18]) + 'L' + pt([x + 14, y - 18]) + 'L' + pt([x + 14, y + 16]) + 'L' + pt([x + 1, y + 16]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 18]) + 'Z', dk(sk, 0.22), 0.8) +
      E(x - 1, y + 3, 3, 4, dk(sk, 0.25), 0, 0.8) + E(x + 2, y - 11, 4, 2.4, dk(sk, 0.2), 0, 0.7));
    // sunken socket + glowing pupil
    s += E(x - 5, y - 1.5, 3.4, 3, '#1a1614') + glowEye(c, x - 5.4, y - 1.5, 1.4, o.eye || '#e8ff6a');
    s += L('M' + pt([x - 9, y - 6]) + 'L' + pt([x - 2, y - 5]), OL, 1.8);
    // torn cheek: teeth showing
    s += P('M' + pt([x - 9, y + 5]) + 'L' + pt([x - 1, y + 5]) + 'L' + pt([x, y + 10]) + 'L' + pt([x - 5, y + 13]) + 'L' + pt([x - 9, y + 10]) + 'Z', '#2a1418', 1.2);
    s += L('M' + pt([x - 8, y + 6.2]) + 'L' + pt([x - 1.4, y + 6.2]) + 'M' + pt([x - 7, y + 5.5]) + 'L' + pt([x - 7, y + 7.5]) + 'M' + pt([x - 5, y + 5.5]) + 'L' + pt([x - 5, y + 7.5]) + 'M' + pt([x - 3, y + 5.5]) + 'L' + pt([x - 3, y + 7.5]), '#e8e0c4', 1.3);
    s += E(x + 5, y + 1, 2.2, 3.2, c.cel(dk(sk, 0.08)), 1.3);
    // patchy hair
    if (o.hairCol) s += P('M' + pt([x - 2, y - 13]) + 'C' + pt([x + 2, y - 18]) + ' ' + pt([x + 10, y - 16]) + ' ' + pt([x + 11, y - 6]) + 'L' + pt([x + 8, y - 8]) + 'L' + pt([x + 7, y - 4]) + 'L' + pt([x + 4, y - 10]) + 'L' + pt([x + 1, y - 9]) + 'Z', c.cel(o.hairCol), 1.6) +
      L('M' + pt([x - 6, y - 12]) + 'l-2,-5 M' + pt([x - 3, y - 13]) + 'l0,-5', OL, 1.2);
    return s;
  }
  function skullHead(c, x, y, o) {
    var bone = o.bone || '#e2dac2', s = '';
    var d = 'M' + pt([x - 10, y - 2]) + 'C' + pt([x - 12, y - 16]) + ' ' + pt([x + 8, y - 20]) + ' ' + pt([x + 11, y - 6]) + 'C' + pt([x + 12, y + 1]) + ' ' + pt([x + 8, y + 5]) + ' ' + pt([x + 5, y + 6]) + 'L' + pt([x + 4, y + 10]) + 'L' + pt([x - 7, y + 10]) + 'L' + pt([x - 8, y + 5]) + 'C' + pt([x - 11, y + 4]) + ' ' + pt([x - 12, y + 2]) + ' ' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, bone, F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 14, y - 20]) + 'L' + pt([x + 14, y + 12]) + 'L' + pt([x + 2, y + 12]) + 'C' + pt([x + 6, y + 2]) + ' ' + pt([x + 6, y - 8]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(bone, 0.25), 0.8));
    s += E(x - 5, y - 2, 3.8, 3.6, '#1a1210') + E(x + 3, y - 2, 2.8, 3.4, '#1a1210');
    s += glowEye(c, x - 5, y - 2, 1.4, o.eye || '#9aff4a') + glowEye(c, x + 3, y - 2, 1.1, o.eye || '#9aff4a');
    s += P('M' + pt([x - 2, y + 2]) + 'L' + pt([x - 0.5, y + 5]) + 'L' + pt([x - 3.5, y + 5]) + 'Z', '#1a1210', 0);
    // jaw hanging open
    s += P('M' + pt([x - 9, y + 9]) + 'L' + pt([x + 4, y + 9]) + 'L' + pt([x + 5, y + 14]) + 'L' + pt([x - 7, y + 17]) + 'Z', c.cel(dk(bone, 0.06)), 1.8);
    s += L('M' + pt([x - 6, y + 8]) + 'L' + pt([x - 6, y + 11]) + 'M' + pt([x - 3, y + 8]) + 'L' + pt([x - 3, y + 11]) + 'M' + pt([x, y + 8]) + 'L' + pt([x, y + 11]) + 'M' + pt([x + 3, y + 8]) + 'L' + pt([x + 3, y + 11]), OL, 1);
    s += L('M' + pt([x + 2, y - 15]) + 'L' + pt([x + 4, y - 10]) + 'L' + pt([x + 2, y - 7]), dk(bone, 0.45), 1);
    return s;
  }

  // ---- biped rig (facing left) ----
  function biped(c, o) {
    var s = '', sk = o.skin, shirt = o.shirt || sk, pants = o.pants || sk, sleeve = o.sleeve || shirt;
    var legW = o.legW || 10.5, armW = o.armW || 9;
    s += shadow(c, 64, o.shadowR || 32);
    if (o.rim) s += rim(c, 64, 76, 50, 56, o.rim);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 54], [88, 70], [88, 86]];
    s += limb(pd(far.slice(0, 2)), sleeve, armW) + limb(pd(far.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    if (o.wFar) s += o.wFar(c, far[far.length - 1]);
    s += (o.farHand ? o.farHand(c, far[far.length - 1]) : hand(far[far.length - 1], c.cel(o.glove || sk)));
    var hipY = o.hipY || 86;
    var toe = o.feet === 'toes' ? toes2 : boot;
    s += limb('M68,' + hipY + ' L71,103 L72,113', dk(pants, 0.18), legW) + toe(73, 121, o.boots || dk(pants, 0.3));
    s += limb('M56,' + hipY + ' L53,103 L52,113', pants, legW) + toe(52, 121, o.boots || dk(pants, 0.3));
    if (o.shins) s += o.shins(c);
    var td = o.torsoD || 'M46,50 C52,45 76,45 82,50 L80,70 L78,' + (hipY + 2) + ' L50,' + (hipY + 2) + ' L48,70 Z';
    s += body(c, td, shirt, F('M68,40 L92,40 L92,106 L70,106 C74,78 72,58 68,40 Z', dk(shirt, 0.25), 0.8) + (o.chest ? o.chest(c) : ''));
    if (o.belt) s += P('M49,' + (hipY - 4) + ' L79,' + (hipY - 4) + ' L79,' + (hipY + 2) + ' L49,' + (hipY + 2) + ' Z', c.cel(o.belt), 2) + R(58, hipY - 5, 7, 8, o.buckle || '#d8b048', 1.6);
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    var hx = o.hx == null ? 60 : o.hx, hy = o.hy == null ? 32 : o.hy;
    if (o.neck !== false) s += R(hx - 3, hy + 8, 10, 8, c.cel(sk), 2);
    s += o.head(c, hx, hy);
    var near = o.near || [[48, 54], [40, 70], [32, 80]];
    if (o.wNear) s += o.wNear(c, near[near.length - 1]);
    s += limb(pd(near.slice(0, 2)), sleeve, armW) + limb(pd(near.slice(1)), o.bareArms ? sk : (o.forearm || sleeve), armW - 1);
    s += (o.nearHand ? o.nearHand(c, near[near.length - 1]) : hand(near[near.length - 1], c.cel(o.glove || sk)));
    if (o.wNearFront) s += o.wNearFront(c, near[near.length - 1]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- zombies ----
  function zombie(c, o) {
    var sk = o.skin, rags = o.shirt, pants = o.pants;
    return biped(c, {
      skin: sk, shirt: rags, pants: pants, sleeve: rags, forearm: sk, boots: dk(sk, 0.35), feet: 'toes', rim: '#c8e0b0',
      hx: 50, hy: 36, legW: 9.5, armW: 8,
      torsoD: 'M44,52 C50,46 74,46 80,52 L80,70 L80,90 L76,85 L72,93 L67,87 L62,94 L57,87 L52,92 L48,86 L47,70 Z',
      head: function (c, x, y) { return zombieHead(c, x, y, { skin: sk, eye: o.eye, hairCol: o.hair }); },
      near: [[46, 56], [32, 60], [18, 60]], far: [[78, 54], [60, 58], [38, 55]],
      nearHand: function (c, p) { return hand(p, c.cel(sk)) + claws(p, dk(sk, 0.1), -1); },
      farHand: function (c, p) { return hand(p, c.cel(dk(sk, 0.12))); },
      shins: function (c) {
        return limb('M71,103 L72,113', dk(sk, 0.15), 8) + limb('M53,103 L52,113', sk, 8) +
          P('M47,100 L58,100 L57,105 L54,103 L51,106 L48,103 Z', c.cel(pants), 1.6) + P('M66,100 L76,100 L76,105 L73,103 L70,106 L67,103 Z', c.cel(dk(pants, 0.18)), 1.6);
      },
      chest: function (c) {
        return (o.ribs ? F('M52,56 C58,54 66,56 68,60 L66,74 C60,76 54,74 52,70 Z', '#2a1a1e') + L('M54,60 Q60,58 66,62 M54,65 Q60,63 66,67 M54,70 Q60,68 65,72', '#e2dac2', 1.6) : '') +
          L('M48,64 L56,70 M70,52 L76,60', dk(rags, 0.4), 1.4) + E(74, 76, 3, 2, dk(sk, 0.1), 0, 0.9) + (o.chest ? o.chest(c) : '');
      },
      top: function (c) {
        return rag(c, 34, 60, 8, 10, rags) + (o.top ? o.top(c) : '');
      },
      tf: o.tf
    });
  }

  // ---- skeleton ----
  function skeleton(c, o) {
    var bone = o.bone || '#e2dac2', bd = dk(bone, 0.22), s = '';
    s += shadow(c, 64, 28) + rim(c, 64, 76, 44, 54, '#d8e8c8');
    // far arm + shield
    s += limb('M76,52 L84,68', bd, 4.2) + limb('M84,68 L84,82', bd, 3.6);
    if (o.shield) s += body(c, 'M84,82 m-13,0 a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0', '#6a5238', C(84, 82, 9, 'none', 1.2) + C(84, 82, 3.4, '#8a6a4a', 1.2) + E(78, 90, 3, 2, '#8a4a22', 0, 0.9) + F('M84,68 L100,68 L100,96 L88,96 Z', '#2a1a10', 0.35), 2);
    else s += C(84, 84, 3, c.cel(bd), 1.6);
    // far leg
    s += limb('M68,86 L71,103', bd, 4.6) + limb('M71,103 L72,116', bd, 4) + P('M66,118 L76,118 L77,122 L64,122 Z', c.cel(bd), 1.6);
    // loin rag + pelvis
    s += rag(c, 64, 84, 22, 20, o.cloth || '#5a4a3a');
    s += P('M52,82 C56,77 72,77 76,82 L73,90 L66,93 L62,93 L55,90 Z', c.cel(bone), 2) + E(59, 86, 2.2, 1.8, '#1a1210') + E(69, 86, 2.2, 1.8, '#1a1210');
    // near leg
    s += limb('M56,86 L53,103', bone, 4.8) + limb('M53,103 L52,116', bone, 4.2) + C(53, 103, 3, c.cel(bone), 1.4) + P('M46,118 L57,118 L57,122 L43,122 Z', c.cel(bone), 1.6);
    // spine
    s += limb('M64,80 L62,50', bd, 3.6);
    for (var i = 0; i < 4; i++) s += C(63.6 - i * 0.4, 78 - i * 2.5, 2.2, c.cel(bone), 1.2);
    // ribcage
    var rc = 'M48,52 C50,45 76,45 80,52 L79,64 C76,72 54,72 49,65 Z';
    s += body(c, rc, bone, F('M66,42 L90,42 L90,76 L70,76 C74,64 72,52 66,42 Z', dk(bone, 0.25), 0.8) + L('M49,56 Q64,62 79,56 M49,61 Q64,67 79,61 M52,66 Q64,71 77,66', '#2a1e18', 2.4) + L('M64,48 L64,68', dk(bone, 0.2), 2), 2.2);
    if (o.pad) s += shoulderPad(c, 76, 50, '#7a5a3e', false) + C(72, 48, 1.4, '#a88a5a') + C(80, 48, 1.4, '#a88a5a');
    // skull
    s += limb('M60,46 L58,40', bd, 3.2);
    s += skullHead(c, 57, 30, { bone: bone, eye: o.eye });
    if (o.helm) s += body(c, 'M45,24 C44,10 66,6 70,22 L66,22 C62,16 50,16 48,26 Z', '#7a6a5a', E(62, 16, 2.4, 2, '#8a4a22', 0, 0.9) + F('M60,4 L74,4 L74,26 L62,26 Z', '#2a1a10', 0.35), 2);
    // near arm with rusty sword
    var p = [32, 74];
    s += sword(p, 42, -2.05, '#a89880', 1, true);
    s += limb('M50,52 L40,64', bone, 4.4) + limb('M40,64 L32,74', bone, 3.8) + C(40, 64, 2.8, c.cel(bone), 1.4) + C(p[0], p[1], 4, c.cel(bone), 1.8);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- bat ----
  function bat(c, o) {
    var fur = o.fur, mem = o.mem, fing = o.finger || lt(mem, 0.25), s = '';
    s += E(64, 122, 26, 5, c.rg([[0, '#000', 0.4], [1, '#000', 0]]));
    s += C(64, 58, 60, glow(c, '#c8b8e0', 0.18));
    // far wing (behind, right)
    var fw = 'M70,52 L96,20 C106,18 118,20 124,26 C118,32 120,40 122,48 C114,48 110,54 110,62 C102,60 94,64 90,70 C84,66 78,68 74,70 Z';
    s += body(c, fw, dk(mem, 0.12), F('M96,20 L124,26 L122,48 L110,62 L96,40 Z', dk(mem, 0.35), 0.5), 2.2);
    s += L('M96,20 L122,48 M96,20 L110,62 M96,20 L90,70', dk(fing, 0.15), 1.6);
    s += limb('M70,52 L96,20', dk(fur, 0.1), 3.2) + P('M96,20 L100,12 L101,21 Z', '#e8e0c8', 1.1);
    // feet dangling
    s += limb('M60,74 L58,86', dk(fur, 0.15), 3) + limb('M70,74 L72,86', dk(fur, 0.15), 3) + claws([58, 86], '#e8e0c8', -1) + claws([72, 86], '#e8e0c8', 1);
    // body
    var bd = 'M50,52 C52,40 74,38 80,50 C84,60 80,74 68,80 C58,82 50,72 50,52 Z';
    s += body(c, bd, fur, F('M70,38 L90,38 L90,84 L70,84 C76,70 76,52 70,38 Z', dk(fur, 0.3), 0.8) + L('M56,60 l3,3 M60,66 l3,3 M58,72 l3,2', lt(fur, 0.2), 1.2, 0.8));
    // near wing (front, left)
    var nw = 'M56,56 L28,18 C18,16 8,20 2,28 C8,34 6,44 4,52 C12,52 16,60 14,70 C22,66 30,70 34,78 C40,72 48,72 54,74 Z';
    s += body(c, nw, mem, F('M28,18 L2,28 L4,52 L14,70 L30,40 Z', lt(mem, 0.08), 0.5) + F('M30,40 L54,74 L34,78 Z', dk(mem, 0.25), 0.6), 2.4);
    s += L('M28,18 L4,52 M28,18 L14,70 M28,18 L34,78', fing, 1.8);
    if (o.tears) s += F('M10,40 L16,44 L12,48 Z', '#1a1418') + F('M24,60 L30,62 L26,66 Z', '#1a1418');
    s += limb('M56,56 L28,18', fur, 3.6) + P('M28,18 L22,10 L24,20 Z', '#e8e0c8', 1.1);
    // head facing left
    var hx = 46, hy = 46;
    s += P('M' + pt([hx + 2, hy - 8]) + 'L' + pt([hx + 12, hy - 26]) + 'L' + pt([hx + 12, hy - 6]) + 'Z', c.cel(fur), 2) + F('M' + pt([hx + 5, hy - 9]) + 'L' + pt([hx + 11, hy - 21]) + 'L' + pt([hx + 10, hy - 8]) + 'Z', o.ear || '#c88a90', 0.9);
    s += body(c, 'M' + pt([hx - 8, hy - 4]) + 'C' + pt([hx - 6, hy - 12]) + ' ' + pt([hx + 10, hy - 12]) + ' ' + pt([hx + 12, hy - 2]) + 'C' + pt([hx + 12, hy + 6]) + ' ' + pt([hx + 4, hy + 10]) + ' ' + pt([hx - 4, hy + 8]) + 'L' + pt([hx - 12, hy + 4]) + 'L' + pt([hx - 10, hy]) + 'Z', fur, F('M' + pt([hx + 4, hy - 14]) + 'L' + pt([hx + 14, hy - 14]) + 'L' + pt([hx + 14, hy + 12]) + 'L' + pt([hx + 2, hy + 12]) + 'Z', dk(fur, 0.28), 0.8));
    s += P('M' + pt([hx - 4, hy - 8]) + 'L' + pt([hx - 4, hy - 22]) + 'L' + pt([hx + 4, hy - 9]) + 'Z', c.cel(fur), 1.8) + F('M' + pt([hx - 2.5, hy - 9]) + 'L' + pt([hx - 3, hy - 18]) + 'L' + pt([hx + 1.5, hy - 9]) + 'Z', o.ear || '#c88a90', 0.9);
    s += E(hx - 11, hy + 2, 3, 2.4, c.cel(o.nose || '#6a4a52'), 1.4);
    s += glowEye(c, hx - 4, hy - 2, 1.6, o.eye || '#ff5a3a');
    s += P('M' + pt([hx - 10, hy + 4]) + 'L' + pt([hx - 9, hy + 10]) + 'L' + pt([hx - 7, hy + 5]) + 'Z', '#f4ecd6', 1) + P('M' + pt([hx - 5, hy + 6]) + 'L' + pt([hx - 4, hy + 11]) + 'L' + pt([hx - 2, hy + 6]) + 'Z', '#f4ecd6', 1);
    if (o.scar) s += L('M' + pt([hx + 2, hy - 8]) + 'L' + pt([hx + 8, hy + 4]), lt(fur, 0.4), 1.4);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- spider ----
  function spider(c, o) {
    var col = o.col, mk = o.mark || '#d8d0b8', s = '', legF = dk(col, 0.2), legN = lt(col, 0.1);
    s += shadow(c, 64, 54) + rim(c, 70, 84, 58, 40, '#d0d8e8');
    var farL = [[[44, 84], [26, 58], [14, 114]], [[50, 84], [42, 60], [42, 116]], [[56, 84], [80, 56], [94, 116]], [[58, 82], [104, 52], [122, 112]]];
    farL.forEach(function (l) { s += limb(pd(l), legF, 3.2) + C(l[1][0], l[1][1], 2.4, c.cel(mk), 1.1); });
    // abdomen
    var ab = 'M60,76 C60,58 80,50 96,54 C114,58 122,74 116,90 C110,102 92,104 78,100 C66,96 60,88 60,76 Z';
    var marks = F('M62,94 C80,106 104,104 120,90 L122,108 L60,108 Z', dk(col, 0.35), 0.85) +
      E(80, 62, 10, 5, lt(col, 0.25), 0, 0.6) +
      F('M80,66 C84,56 102,56 106,66 C108,74 102,78 98,80 L96,88 L92,88 L90,80 C84,78 78,74 80,66 Z', mk) +
      E(87, 67, 3.2, 3.6, col) + E(99, 67, 3.2, 3.6, col) + F('M92,74 L94,78 L90,78 Z', col) +
      L('M70,80 Q76,92 90,96 M104,92 Q112,86 114,76', mk, 2.6) + (o.chev ? L('M66,70 L72,78 L66,86', mk, 2.2) : '');
    s += body(c, ab, col, marks, 2.4);
    // cephalothorax + head
    var ce = 'M36,84 C36,72 48,68 58,72 C66,76 66,90 58,96 C48,100 36,96 36,84 Z';
    s += body(c, ce, col, F('M34,92 C44,100 58,100 66,92 L66,104 L34,104 Z', dk(col, 0.35), 0.8) + E(50, 76, 7, 3, lt(col, 0.25), 0, 0.6) + L('M46,80 L56,84', mk, 1.6, 0.8));
    var nearL = [[[46, 94], [18, 70], [4, 118]], [[50, 96], [34, 74], [26, 120]], [[56, 96], [72, 72], [78, 120]], [[60, 94], [96, 68], [112, 118]]];
    nearL.forEach(function (l) {
      s += limb(pd(l), legN, 3.8) + L(pd([l[1], l[2]]), lt(col, 0.4), 1, 0.8) + L('M' + pt([l[1][0] + (l[2][0] - l[1][0]) * 0.18, l[1][1] + (l[2][1] - l[1][1]) * 0.18]) + 'L' + pt([l[1][0] + (l[2][0] - l[1][0]) * 0.3, l[1][1] + (l[2][1] - l[1][1]) * 0.3]), mk, 3.8);
    });
    // head in front of the legs
    s += E(38, 88, 8, 7, c.cel(dk(col, 0.05)), 2) + E(36, 84, 3.4, 2, lt(col, 0.25), 0, 0.6);
    s += glowEye(c, 33, 86, 1.5, o.eye || '#ff4a3a') + glowEye(c, 38, 83, 1.3, o.eye || '#ff4a3a') + glowEye(c, 37, 89, 1, o.eye || '#ff4a3a');
    // fangs
    s += P('M31,93 C27,97 27,103 31,105 C31,101 33,97 35,95 Z', '#e8e0c8', 1.3) + P('M38,95 C36,99 37,104 40,106 C40,102 41,99 42,97 Z', '#d8d0b8', 1.3);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- gnoll (hunched, digitigrade) ----
  function gnollHead(c, x, y, o) {
    var fur = o.fur, s = '';
    // ears
    s += P('M' + pt([x + 3, y - 10]) + 'L' + pt([x + 13, y - 25]) + 'L' + pt([x + 14, y - 7]) + 'Z', c.cel(dk(fur, 0.1)), 2) + F('M' + pt([x + 6, y - 11]) + 'L' + pt([x + 12, y - 21]) + 'L' + pt([x + 12, y - 9]) + 'Z', '#6a5048', 0.9);
    var d = 'M' + pt([x - 6, y - 10]) + 'C' + pt([x - 2, y - 16]) + ' ' + pt([x + 12, y - 14]) + ' ' + pt([x + 14, y - 2]) + 'L' + pt([x + 12, y + 8]) + 'C' + pt([x + 8, y + 12]) + ' ' + pt([x, y + 12]) + ' ' + pt([x - 6, y + 10]) +
      'L' + pt([x - 22, y + 8]) + 'C' + pt([x - 26, y + 7]) + ' ' + pt([x - 27, y + 2]) + ' ' + pt([x - 25, y - 1]) + 'L' + pt([x - 12, y - 6]) + 'Z';
    s += body(c, d, fur, F('M' + pt([x + 4, y - 16]) + 'L' + pt([x + 16, y - 16]) + 'L' + pt([x + 16, y + 14]) + 'L' + pt([x + 2, y + 14]) + 'C' + pt([x + 8, y + 4]) + ' ' + pt([x + 8, y - 6]) + ' ' + pt([x + 4, y - 16]) + 'Z', dk(fur, 0.25), 0.8) +
      F('M' + pt([x - 26, y + 3]) + 'L' + pt([x - 6, y + 2]) + 'L' + pt([x - 6, y + 12]) + 'L' + pt([x - 26, y + 12]) + 'Z', dk(fur, 0.18), 0.7) + E(x + 4, y - 4, 2.6, 2, o.spot || dk(fur, 0.35), 0, 0.8) + E(x - 2, y - 9, 2, 1.6, o.spot || dk(fur, 0.35), 0, 0.8));
    s += E(x - 25, y + 1, 3, 2.4, '#1a1210', 1);
    // mouth + fangs
    s += L('M' + pt([x - 24, y + 6]) + 'L' + pt([x - 6, y + 7]), OL, 1.6);
    s += P('M' + pt([x - 20, y + 6]) + 'L' + pt([x - 19, y + 10]) + 'L' + pt([x - 17, y + 6]) + 'Z', '#f4ecd6', 1) + P('M' + pt([x - 12, y + 7]) + 'L' + pt([x - 11, y + 11]) + 'L' + pt([x - 9, y + 7]) + 'Z', '#f4ecd6', 1);
    s += L('M' + pt([x - 14, y - 6]) + 'L' + pt([x - 4, y - 5]), OL, 2.2);
    if (o.milky) {
      s += E(x - 8, y - 1.5, 3.8, 3.2, '#eef0e4', 1.4) + E(x - 8.6, y - 2, 1.4, 1, '#ffffff', 0, 0.9) + C(x - 8, y - 1.5, 6, glow(c, '#eef0e4', 0.5));
      s += L('M' + pt([x + 1, y - 10]) + 'L' + pt([x + 4, y + 2]) + 'M' + pt([x - 1, y - 6]) + 'L' + pt([x + 5, y - 6]), '#c87a7a', 1.4);
    } else s += glowEye(c, x - 8, y - 1.5, 1.6, o.eye || '#e8d040');
    return s;
  }
  function gnoll(c, o) {
    var fur = o.fur, mane = o.mane, s = '';
    s += shadow(c, 64, o.shadowR || 36) + rim(c, 62, 72, 48, 56, '#d0e0b8');
    // tail
    s += L('M84,80 C96,86 102,80 102,72', OL, 6) + L('M84,80 C96,86 102,80 102,72', dk(fur, 0.1), 3);
    // far arm
    var fh = [88, 82];
    s += limb('M78,50 L90,66', dk(fur, 0.18), 9.5) + limb('M90,66 L88,82', dk(fur, 0.18), 8.5);
    if (o.wFar) s += o.wFar(c, fh);
    s += hand(fh, c.cel(dk(fur, 0.12)));
    // far leg (digitigrade)
    s += limb('M70,84 L64,98', dk(fur, 0.2), 11) + limb('M64,98 L73,108 L72,116', dk(fur, 0.2), 8) + paw(72, 121, dk(fur, 0.3));
    // loincloth
    s += body(c, 'M50,80 L80,80 L78,98 L71,94 L65,102 L59,94 L52,98 Z', o.loin || '#5a4a3a', L('M52,84 L78,84', dk(o.loin || '#5a4a3a', 0.35), 1.2));
    // near leg
    s += limb('M56,84 L47,98', fur, 12) + limb('M47,98 L56,108 L53,116', fur, 9) + paw(53, 121, dk(fur, 0.25));
    // hunched-shouldered torso
    var td = 'M44,54 C44,42 60,35 76,37 C90,39 95,54 90,68 C86,80 80,86 66,86 C54,86 46,80 46,70 Z';
    var r = rng(o.seed || 7), spots = '';
    for (var i = 0; i < 5; i++) spots += E(62 + r() * 26, 44 + r() * 30, 2 + r() * 2, 1.6 + r() * 1.4, o.spot || dk(fur, 0.3), 0, 0.85);
    var sh = F('M74,32 L100,32 L100,92 L70,92 C82,78 84,54 74,32 Z', dk(fur, 0.25), 0.8) + spots + F('M44,58 C48,74 54,84 66,86 L50,90 L40,90 Z', lt(fur, 0.22), 0.7) + L('M50,64 Q56,68 62,66 M50,72 Q56,76 62,74', dk(fur, 0.25), 1.2);
    if (o.pus) [[58, 56], [70, 70], [82, 54]].forEach(function (p) { sh += C(p[0], p[1], 2.2, '#c8e070', 1) + C(p[0] - 0.6, p[1] - 0.6, 0.7, '#f4ffc0'); });
    s += body(c, td, fur, sh);
    if (o.strap) s += L('M48,48 L84,80', OL, 5) + L('M48,48 L84,80', o.strap, 3);
    // mane from crown down the back
    s += P('M40,26 L44,16 L50,24 L56,14 L60,26 L67,20 L68,30 L76,26 L76,36 L84,34 L82,46 C74,40 60,38 46,44 Z', c.cel(mane), 2);
    if (o.pads) s += o.pads(c);
    var hx = o.hx || 36, hy = o.hy || 34;
    s += limb('M' + (hx + 6) + ',' + (hy + 6) + ' L48,48', fur, 10) + gnollHead(c, hx, hy, o);
    // near arm with weapon
    var nh = o.nearHand || [30, 82];
    if (o.weapon) s += o.weapon(c, nh);
    s += limb('M50,56 L40,72', fur, 10.5) + limb('M40,72 L' + nh[0] + ',' + nh[1], fur, 9.5) + hand(nh, c.cel(fur));
    return o.tf ? G(s, o.tf) : s;
  }
  function rustyAxe(c, p, s) {
    s = s || 1; var x = p[0], y = p[1], o = '';
    o += limb('M' + pt([x + 4, y + 10]) + 'L' + pt([x - 12 * s, y - 40 * s]), '#6a5038', 3.2);
    var hx = x - 10 * s, hy = y - 36 * s;
    o += body(_cur, 'M' + pt([hx + 2, hy + 4]) + 'C' + pt([hx - 12 * s, hy + 8 * s]) + ' ' + pt([hx - 20 * s, hy]) + ' ' + pt([hx - 20 * s, hy - 10 * s]) + 'C' + pt([hx - 12 * s, hy - 10 * s]) + ' ' + pt([hx - 6 * s, hy - 8 * s]) + ' ' + pt([hx - 1, hy - 6 * s]) + 'Z', '#9a9690',
      C(hx - 12 * s, hy - 2 * s, 2.4, '#7a4a22', 0, 0.9) + C(hx - 6 * s, hy + 2 * s, 1.8, '#7a4a22', 0, 0.9) + F('M' + pt([hx - 19 * s, hy - 4 * s]) + 'L' + pt([hx - 15 * s, hy - 2 * s]) + 'L' + pt([hx - 18 * s, hy + 1 * s]) + 'Z', OL), 1.8);
    return o;
  }
  function spikedClub(c, p, s) {
    s = s || 1; var x = p[0], y = p[1];
    var d = 'M' + pt([x - 2, y + 6]) + 'L' + pt([x - 12 * s, y - 28 * s]) + 'C' + pt([x - 18 * s, y - 38 * s]) + ' ' + pt([x - 8 * s, y - 46 * s]) + ' ' + pt([x, y - 38 * s]) + 'L' + pt([x + 4, y + 4]) + 'Z';
    var o = body(c, d, '#6a5040', F('M' + pt([x - 4 * s, y - 46 * s]) + 'L' + pt([x + 4 * s, y - 46 * s]) + 'L' + pt([x + 6, y + 8]) + 'L' + pt([x + 1, y + 8]) + 'Z', '#3a2a1e', 0.8), 2);
    [[-15, -34, -21, -36], [-11, -42, -14, -49], [-3, -40, 2, -45], [-13, -26, -19, -25]].forEach(function (k) { o += L('M' + pt([x + k[0] * s, y + k[1] * s]) + 'L' + pt([x + k[2] * s, y + k[3] * s]), OL, 3) + L('M' + pt([x + k[0] * s, y + k[1] * s]) + 'L' + pt([x + k[2] * s, y + k[3] * s]), '#b0aca4', 1.3); });
    return o;
  }
  function cleaver(c, p, s) {
    s = s || 1; var x = p[0], y = p[1], o = '';
    o += limb('M' + pt([x + 3, y + 8]) + 'L' + pt([x - 3, y - 12 * s]), '#4a3428', 4);
    var d = 'M' + pt([x + 2 * s, y - 10 * s]) + 'L' + pt([x - 2 * s, y - 66 * s]) + 'L' + pt([x - 36 * s, y - 64 * s]) + 'C' + pt([x - 44 * s, y - 44 * s]) + ' ' + pt([x - 42 * s, y - 24 * s]) + ' ' + pt([x - 32 * s, y - 8 * s]) + 'Z';
    var sh = F('M' + pt([x - 8 * s, y - 70 * s]) + 'L' + pt([x + 6 * s, y - 70 * s]) + 'L' + pt([x + 6 * s, y - 6 * s]) + 'L' + pt([x - 6 * s, y - 6 * s]) + 'Z', '#5a5a5e', 0.8) +
      L('M' + pt([x - 36 * s, y - 60 * s]) + 'C' + pt([x - 42 * s, y - 42 * s]) + ' ' + pt([x - 40 * s, y - 24 * s]) + ' ' + pt([x - 31 * s, y - 11 * s]), '#e8ecf0', 2.2) +
      E(x - 22 * s, y - 34 * s, 7 * s, 5 * s, '#7a4a22', 0, 0.8) + E(x - 12 * s, y - 52 * s, 4 * s, 3 * s, '#7a4a22', 0, 0.8) + E(x - 26 * s, y - 18 * s, 4 * s, 2.4 * s, '#6a2a1a', 0, 0.8) +
      F('M' + pt([x - 41 * s, y - 38 * s]) + 'L' + pt([x - 36 * s, y - 36 * s]) + 'L' + pt([x - 40 * s, y - 32 * s]) + 'Z', OL);
    o += body(c, d, '#a8a8ac', sh, 2.2);
    o += C(x - 7 * s, y - 58 * s, 3.4 * s, '#1a1418', 1.4);
    o += L('M' + pt([x - 4, y - 8 * s]) + 'L' + pt([x + 6, y - 12 * s]), OL, 6) + L('M' + pt([x - 4, y - 8 * s]) + 'L' + pt([x + 6, y - 12 * s]), '#6a6a70', 3);
    return o;
  }

  // ---- ghoul hulk (Samuel Fipps) ----
  function ghoul(c, o) {
    var sk = o.skin, s = '';
    s += shadow(c, 64, 46) + rim(c, 62, 72, 56, 56, '#d0e8b0');
    // far arm, long, knuckles near ground
    s += limb('M86,50 L102,74', dk(sk, 0.18), 13) + limb('M102,74 L98,100', dk(sk, 0.18), 11) + hand([98, 102], c.cel(dk(sk, 0.15))) + claws([98, 102], '#d8d0b8', 1);
    // legs, short and thick
    s += limb('M74,92 L80,106 L78,114', dk(sk, 0.2), 14) + toes2(79, 121, dk(sk, 0.35));
    s += limb('M56,94 L52,106 L50,114', sk, 14) + toes2(50, 121, dk(sk, 0.35));
    s += rag(c, 64, 88, 34, 22, o.cloth || '#4a3e4a');
    // huge hunched torso
    var td = 'M34,62 C34,40 58,26 82,30 C104,34 110,58 102,78 C96,94 82,100 62,100 C46,100 36,90 34,76 Z';
    var sh = F('M78,24 L112,24 L112,104 L74,104 C88,86 92,52 78,24 Z', dk(sk, 0.25), 0.8) + F('M40,82 C50,96 70,98 92,88 L96,104 L36,104 Z', dk(sk, 0.28), 0.7) +
      F('M48,58 C54,54 64,56 66,62 L64,76 C58,78 50,76 48,72 Z', '#3a1a22') + L('M50,62 Q57,60 64,64 M50,67 Q57,65 64,69 M50,72 Q56,70 63,74', '#e2dac2', 1.6) +
      L('M70,50 L86,76', '#3a2a2a', 1.8) + L('M72,53 l4,-2 M75,58 l4,-2 M78,63 l4,-2 M81,68 l4,-2 M84,73 l4,-2', '#3a2a2a', 1.2) +
      E(90, 44, 7, 5, lt(sk, 0.2), 0, 0.5) + C(60, 86, 3, '#b8d060', 1) + C(84, 86, 2.4, '#b8d060', 1);
    s += body(c, td, sk, sh, 2.6);
    // small head, low and forward
    var hx = 30, hy = 50;
    s += body(c, 'M' + pt([hx - 10, hy - 6]) + 'C' + pt([hx - 8, hy - 16]) + ' ' + pt([hx + 10, hy - 18]) + ' ' + pt([hx + 12, hy - 4]) + 'L' + pt([hx + 12, hy + 6]) + 'C' + pt([hx + 8, hy + 14]) + ' ' + pt([hx - 4, hy + 16]) + ' ' + pt([hx - 10, hy + 12]) + 'L' + pt([hx - 14, hy + 6]) + 'L' + pt([hx - 12, hy]) + 'Z', sk,
      F('M' + pt([hx + 4, hy - 18]) + 'L' + pt([hx + 16, hy - 18]) + 'L' + pt([hx + 16, hy + 18]) + 'L' + pt([hx + 2, hy + 18]) + 'Z', dk(sk, 0.25), 0.8) + L('M' + pt([hx - 4, hy - 14]) + 'L' + pt([hx + 8, hy - 10]), '#3a2a2a', 1.4) + L('M' + pt([hx - 1, hy - 15]) + 'l1,3 M' + pt([hx + 3, hy - 14]) + 'l1,3 M' + pt([hx + 6, hy - 12]) + 'l1,3', '#3a2a2a', 1));
    s += E(hx - 5, hy - 2, 3.4, 3, '#1a1614') + glowEye(c, hx - 5, hy - 2, 1.6, '#e8ff6a');
    s += L('M' + pt([hx - 10, hy - 6]) + 'L' + pt([hx - 1, hy - 4]), OL, 2.2);
    s += P('M' + pt([hx - 14, hy + 5]) + 'L' + pt([hx + 2, hy + 6]) + 'L' + pt([hx, hy + 12]) + 'L' + pt([hx - 10, hy + 12]) + 'Z', '#2a1418', 1.4);
    s += L('M' + pt([hx - 12, hy + 6.5]) + 'L' + pt([hx - 11, hy + 9]) + 'M' + pt([hx - 8, hy + 7]) + 'L' + pt([hx - 7, hy + 10]) + 'M' + pt([hx - 4, hy + 7]) + 'L' + pt([hx - 3, hy + 10]) + 'M' + pt([hx - 1, hy + 7]) + 'L' + pt([hx - 1, hy + 10]), '#e8e0c4', 1.3);
    // near arm dragging forward
    s += limb('M46,58 L30,80', sk, 13) + limb('M30,80 L22,104', sk, 11) + hand([22, 106], c.cel(sk)) + claws([22, 106], '#e8e0c8', -1);
    s += E(36, 70, 3, 2, dk(sk, 0.3), 0, 0.9);
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- darkhound ----
  function hound(c, o) {
    var hide = o.hide, bone = o.bone || '#d8d0b8', s = '';
    s += shadow(c, 64, 48) + rim(c, 62, 84, 58, 40, '#d0e0c8');
    // far legs
    s += limb('M48,84 L46,102 L44,114', dk(hide, 0.25), 7) + paw(44, 121, dk(hide, 0.35)) + limb('M96,82 L104,98 L100,114', dk(hide, 0.25), 7) + paw(100, 121, dk(hide, 0.35));
    // bony tail
    s += L('M106,68 C116,62 120,52 124,46', OL, 6) + L('M106,68 C116,62 120,52 124,46', bone, 3);
    [[112, 63], [117, 57], [121, 51]].forEach(function (p) { s += C(p[0], p[1], 2.4, c.cel(bone), 1.2); });
    // body: deep chest, tucked waist
    var bd = 'M34,64 C40,52 60,50 80,56 C94,58 106,58 110,68 C114,78 108,90 100,90 C92,88 86,82 76,82 C64,86 52,94 42,92 C34,90 30,78 34,64 Z';
    var sh = F('M28,84 C44,96 70,92 84,82 C96,86 104,92 116,86 L116,100 L28,100 Z', dk(hide, 0.35), 0.85) +
      F('M52,64 C60,60 72,62 78,66 L76,80 C70,84 60,88 52,86 Z', '#1a1620') + L('M53,68 Q64,64 76,70 M53,74 Q63,70 75,76 M54,80 Q62,77 72,82', bone, 1.8) +
      E(90, 64, 8, 5, lt(hide, 0.2), 0, 0.5);
    s += body(c, bd, hide, sh, 2.4);
    // spine ridge
    for (var i = 0; i < 7; i++) { var x = 46 + i * 9, y = 54 - Math.sin(i / 6 * PI) * 2 + i * 0.4; s += P('M' + pt([x - 3, y + 3]) + 'L' + pt([x + 1, y - 6]) + 'L' + pt([x + 4, y + 3]) + 'Z', c.cel(bone), 1.3); }
    // hip bone jutting
    s += E(96, 66, 5, 4, c.cel(bone), 1.4);
    // head: long skull-like muzzle, jaw open
    var hd = 'M42,58 C34,50 22,52 16,58 L6,64 C2,67 2,72 6,73 L20,74 C28,76 38,72 44,66 Z';
    s += body(c, hd, hide, F('M4,70 L44,64 L44,78 L4,78 Z', dk(hide, 0.3), 0.8) + F('M8,62 C14,58 22,58 26,62 L22,66 L8,68 Z', bone, 0.9));
    s += P('M8,74 L24,75 C30,76 36,74 40,70 L34,82 C26,86 14,84 8,80 Z', c.cel(dk(hide, 0.1)), 2) + F('M9,74 L38,72 L32,79 L10,78 Z', '#2a0e12');
    s += L('M10,74 L12,77 L14,74 L16,77 L18,74 L20,77 L22,74 L24,77 L26,74', '#f4ecd6', 1.3) + L('M12,78 L14,76 L16,78 L18,76 L20,78 L22,76', '#f4ecd6', 1.1);
    s += E(5, 67, 2.4, 2, '#1a1210', 1);
    s += P('M34,54 L42,40 L46,56 Z', c.cel(dk(hide, 0.1)), 2) + F('M38,52 L42,44 L44,54 Z', '#1a1418', 0.9);
    s += glowEye(c, 24, 62, 1.9, o.eye || '#9aff4a');
    s += L('M18,59 L30,60', OL, 2);
    // near legs, bony
    s += limb('M42,86 L38,102 L36,114', hide, 8) + C(38, 102, 3, c.cel(bone), 1.3) + paw(36, 121, dk(hide, 0.25));
    s += limb('M90,84 L98,100 L94,114', hide, 8) + C(98, 100, 3, c.cel(bone), 1.3) + paw(94, 121, dk(hide, 0.25));
    return o.tf ? G(s, o.tf) : s;
  }

  // ---- Scarlet Crusade humans ----
  function scarlet(c, o) {
    var red = '#b82220', white = '#f0ece2';
    return biped(c, {
      skin: o.skin || '#e8b890', shirt: red, pants: o.pants || '#4a4a52', boots: o.boots || '#3a2a1e', belt: '#3a2a1e', sleeve: o.sleeve || white, forearm: o.forearm, glove: o.glove,
      buckle: '#d8b048', rim: '#f0d8d0',
      head: function (c, x, y) { return humanHead(c, x, y, o); }, hx: 60, hy: 30,
      chest: function (c) { return L('M52,48 L52,88 M76,48 L76,88', white, 3) + crest(64, 64, 1.05, white) + (o.chest ? o.chest(c) : ''); },
      front: function (c) { return body(c, 'M54,88 L74,88 L73,106 L55,106 Z', red, L('M56.5,88 L56.5,104 M71.5,88 L71.5,104 M55,104 L73,104', white, 2), 1.8); },
      pads: o.pads, back: o.back, near: o.near, far: o.far, wNear: o.wNear, wFar: o.wFar, top: o.top, tf: o.tf, armW: 9, legW: 10.5
    });
  }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    mindless_zombie: function (c) {
      return zombie(c, { skin: '#9aa88a', shirt: '#7a6650', pants: '#50505e', hair: '#5a4a3a', eye: '#e8ff6a' });
    },
    wretched_zombie: function (c) {
      return G(zombie(c, {
        skin: '#8a9474', shirt: '#5e4e6e', pants: '#3e3e48', eye: '#c8ff4a', ribs: true,
        top: function (c) { return E(56, 22, 3, 2, '#5a6a44', 0, 0.9) + L('M40,40 l-3,6', '#7a8a50', 1.6); }
      }), at(1.04, 64, 122));
    },
    rattlecage_skeleton: function (c) {
      return skeleton(c, { bone: '#e4dcc4', eye: '#9aff4a', cloth: '#5a4a3a', shield: true, pad: true, helm: true });
    },
    duskbat: function (c) {
      return G(bat(c, { fur: '#5a4a56', mem: '#7a6a80', eye: '#ff5a3a' }), at(0.84, 64, 72));
    },
    greater_duskbat: function (c) {
      return G(bat(c, { fur: '#62404c', mem: '#86606e', finger: '#b08a96', eye: '#ffb03a', tears: true, scar: true, ear: '#d8909a' }), at(0.98, 64, 66));
    },
    young_night_web_spider: function (c) {
      return G(spider(c, { col: '#5a5468', mark: '#dcd4c0', eye: '#ff5a3a' }), at(0.8, 64, 122));
    },
    night_web_spider: function (c) {
      return spider(c, { col: '#4a4458', mark: '#ece4d0', eye: '#ff4a3a', chev: true });
    },
    samuel_fipps: function (c) {
      return G(ghoul(c, { skin: '#9aa47e', cloth: '#4a3e4a' }), at(1.1, 64, 122));
    },
    darkhound: function (c) {
      return hound(c, { hide: '#5e5868', bone: '#dcd4bc', eye: '#9aff4a' });
    },
    rot_hide_gnoll: function (c) {
      return gnoll(c, {
        fur: '#8e9a74', mane: '#4e5040', spot: '#5a6448', loin: '#5a4a3a', strap: '#4a3a2a', pus: true, seed: 3, eye: '#e8d040',
        weapon: function (c, p) { return rustyAxe(c, p, 1); }
      });
    },
    rot_hide_mongrel: function (c) {
      return G(gnoll(c, {
        fur: '#9aa482', mane: '#5a5a44', spot: '#6a7050', loin: '#4a3e34', pus: true, seed: 11, eye: '#d8e050', nearHand: [30, 88],
        weapon: function (c, p) { return G(spikedClub(c, p, 0.85), rot(-28, p[0], p[1])); }
      }), at(0.9, 64, 122));
    },
    maggot_eye: function (c) {
      return G(gnoll(c, {
        fur: '#7e8a68', mane: '#3a3a30', spot: '#4e5640', loin: '#3a2e2a', strap: '#2a2018', pus: true, seed: 21, milky: true, shadowR: 44, hy: 38,
        pads: function (c) { return shoulderPad(c, 80, 46, '#5a4a3a', true) + skullSmall(80, 44, 0.8); },
        nearHand: [30, 96],
        weapon: function (c, p) { return G(cleaver(c, p, 0.74), rot(8, p[0], p[1])); }
      }), 'matrix(1.1,0,0,1.1,-1,-12.2)');
    },
    scarlet_convert: function (c) {
      return scarlet(c, {
        skin: '#e8b890', hairCol: '#7a5a3a', sleeve: '#f0ece2', pants: '#5a5a62',
        near: [[48, 54], [40, 70], [34, 78]],
        wNear: function (c, p) { return sword(p, 30, -2.2, '#c8ccd2', 0.9); }
      });
    },
    scarlet_warrior: function (c) {
      return scarlet(c, {
        skin: '#e0b088', hairCol: '#3a2a1a', hat: 'helm', plume: '#c02420', trimCol: '#c02420', sleeve: '#9aa0a8', forearm: '#9aa0a8', glove: '#5a3a22', beard: '#5a3a22',
        pads: function (c) { return shoulderPad(c, 80, 52, '#aab0b8', false) + shoulderPad(c, 48, 52, '#aab0b8', false); },
        near: [[48, 54], [38, 68], [30, 74]],
        wNear: function (c, p) { return sword(p, 42, -2.1, '#d0d4da'); }
      });
    },
    captain_perrine: function (c) {
      return G(scarlet(c, {
        skin: '#e8b890', hairCol: '#a8a098', hat: 'plumed', plume: '#f2f0ea', helmCol: '#c8ccd2', trimCol: '#d8b048', sleeve: '#9aa0a8', forearm: '#9aa0a8', glove: '#f0ece2', boots: '#2a1e16', beard: '#a8a098',
        back: function (c) { return body(c, 'M50,46 C66,42 82,44 86,50 C98,70 104,94 112,120 L100,116 L92,121 L82,116 L72,120 C70,96 62,70 50,46 Z', '#a81c1c', F('M86,48 C98,70 106,96 114,122 L96,122 C92,96 88,70 80,48 Z', '#5a0e0e', 0.55) + L('M80,60 C88,80 92,100 94,118', '#6a1010', 1.4), 2.2); },
        pads: function (c) {
          var e = function (x) { return P('M' + (x - 11) + ',55 C' + (x - 11) + ',45 ' + (x + 11) + ',45 ' + (x + 11) + ',55 Z', c.cel('#d8b048'), 1.8) + L('M' + (x - 8) + ',55 L' + (x - 8) + ',60 M' + (x - 3) + ',56 L' + (x - 3) + ',61 M' + (x + 2) + ',56 L' + (x + 2) + ',61 M' + (x + 7) + ',55 L' + (x + 7) + ',60', '#d8b048', 1.6); };
          return e(80) + e(48);
        },
        chest: function (c) { return L('M52,48 L76,48', '#d8b048', 2); },
        near: [[48, 54], [36, 64], [28, 68]],
        wNear: function (c, p) { return sword(p, 40, -2.02, '#e0e4ea'); }
      }), at(1.08, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#7a8470'), 2.5); }
  function phScene(c) { return sky(c, SKY[0], SKY[1], SKY[2]) + ground(c, 150, '#5e6a4a', '#343c2a'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#5e6a4a"/></svg>'; }
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
