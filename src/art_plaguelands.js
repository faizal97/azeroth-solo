/* art_plaguelands.js — Western Plaguelands art for Azeroth Solo (contested zone, levels 55-58: blighted farmland held
 * against the Scourge; Chillwind Camp and the Bulwark, Felstone Field, Dalson's Tears, the ruins of Andorhal, the Scarlet
 * town of Hearthglen, the Writhing Haunt, Caer Darrow and the road to the gates of Stratholme; plaguehounds, diseased
 * ghouls, skeletal executioners, Scourge warders, Scarlet sentinels and lightsworn, rotting behemoths, the ghoul Foulmane
 * and the lich Araj the Summoner).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Plaguelands keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are shared copies of art_maraudon.js / art_scarlet.js (the
 * Scarlet sigil, tabard, robe and banner come from art_scarlet.js); the skeleton rig and the claw/foot pieces are
 * copies of art_duskwood.js with leg overrides added. The dog skull, the hunched ghoul rig, the kettle helm, the
 * ziggurat, farm buildings, crops, cauldron, island castle and the Stratholme gate are new here.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix wp<counter>_).
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
  function Ctx() { this.p = 'wp' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function glowEye(c, x, y, r, col) { return C(x, y, r * 3.4, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
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
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function arched(x, yb, w, h) { var top = yb - h; return 'M' + pt([x - w / 2, yb]) + 'L' + pt([x - w / 2, top + w * 0.55]) + 'Q' + pt([x - w / 2, top + w * 0.05]) + ' ' + pt([x, top]) + 'Q' + pt([x + w / 2, top + w * 0.05]) + ' ' + pt([x + w / 2, top + w * 0.55]) + 'L' + pt([x + w / 2, yb]) + 'Z'; }

  // ---- ribbons (shared copy of art_ashenvale.js) ----
  function lerp2(p, q, t) { return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }
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

  // ============================================================
  //  PALETTE
  // ============================================================
  var PLG = '#8ae04a', PLGL = '#d8ff9a', FROST = '#7ad0ff', FROSTL = '#dff4ff';
  var RED = '#b81e1e', REDD = '#7a1012', WHT = '#f0ece2', GOLD = '#e2b23c', STEEL = '#b8bec8', DSTEEL = '#7e8490', STONE = '#d8d2c6', SLATE = '#4a5262';
  var HOLY = '#ffe28a', BONE = '#ddd6be', RIM = '#c8d8a8', SNOW = '#eef2f4';
  var BLUE = '#2a4a9e', CANVAS = '#e6e0cc', FPURP = '#4e2a62', FTRIM = '#c8b890';

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
  function overcast(c, seed, y, col, cnt, s) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) o += cloud(-20 + 440 * (i + r() * 0.6) / cnt, y + (r() - 0.5) * 10, (s || 1) * (0.8 + r() * 0.6), 0.9, col);
    return o;
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
  function archWin(x, y, w, h, col, sw) { return P('M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w / 2]) + 'Q' + pt([x, y - h - w * 0.2]) + ' ' + pt([x + w / 2, y - h + w / 2]) + 'L' + pt([x + w / 2, y]) + 'Z', col, sw == null ? 1.2 : sw); }
  function crows(seed, cnt, x0, x1, y0, y1) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 0.6 + r() * 0.6; d += 'M' + pt([x - 5 * s, y - 2 * s]) + 'Q' + pt([x - 2 * s, y - 3 * s]) + ' ' + pt([x, y]) + 'Q' + pt([x + 2 * s, y - 3 * s]) + ' ' + pt([x + 5 * s, y - 2 * s]); }
    return L(d, '#1e1c20', 1.3);
  }
  // conical roof with a finial (copy of art_scarlet.js spireRoof, colour + finial as options)
  function spireRoof(c, x, y, w, h, col, fin) {
    col = col || SLATE;
    var d = pd([[x - w / 2 - 3, y], [x, y - h], [x + w / 2 + 3, y]], true), tl = '';
    for (var i = 1; i < 5; i++) { var t = i / 5; tl += 'M' + pt([x - (w / 2 + 3) * t, y - h + h * t]) + 'L' + pt([x + (w / 2 + 3) * t, y - h + h * t]); }
    return body(c, d, col, F(pd([[x, y - h - 2], [x + w / 2 + 6, y + 2], [x + 1, y + 2]], true), dk(col, 0.3), 0.8) + L(tl, dk(col, 0.35), 0.9, 0.8), 1.7) +
      limb('M' + pt([x, y - h]) + 'L' + pt([x, y - h - 7]), fin || GOLD, 1.2) + C(x, y - h - 8, 2, fin || GOLD, 1);
  }
  // ---- the Scarlet sigil (copy of art_scarlet.js) ----
  function flameD(x, y, k) {
    return 'M' + pt([x, y + 5 * k]) + 'C' + pt([x - 5 * k, y + 5 * k]) + ' ' + pt([x - 5.2 * k, y - 1 * k]) + ' ' + pt([x - 2.6 * k, y - 4.2 * k]) + 'C' + pt([x - 2.4 * k, y - 1.6 * k]) + ' ' + pt([x - 1.2 * k, y - 1 * k]) + ' ' + pt([x - 0.7 * k, y - 1.3 * k]) +
      'C' + pt([x - 1.8 * k, y - 4.2 * k]) + ' ' + pt([x - 0.6 * k, y - 6.4 * k]) + ' ' + pt([x + 0.6 * k, y - 8.4 * k]) + 'C' + pt([x + 1.6 * k, y - 5.8 * k]) + ' ' + pt([x + 3.6 * k, y - 4.2 * k]) + ' ' + pt([x + 2.2 * k, y - 0.9 * k]) +
      'C' + pt([x + 3 * k, y - 1.6 * k]) + ' ' + pt([x + 3.6 * k, y - 2.6 * k]) + ' ' + pt([x + 3.8 * k, y - 3.6 * k]) + 'C' + pt([x + 5.8 * k, y - 1 * k]) + ' ' + pt([x + 5.2 * k, y + 5 * k]) + ' ' + pt([x, y + 5 * k]) + 'Z';
  }
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
  // emblems for banners (x, y = centre)
  function emCrown(c, x, y, k) { return C(x, y, 7 * k, c.cel(GOLD), 1 * k) + P(pd([[x - 4.4 * k, y + 3 * k], [x - 5 * k, y - 3 * k], [x - 2 * k, y - 0.4 * k], [x, y - 4.4 * k], [x + 2 * k, y - 0.4 * k], [x + 5 * k, y - 3 * k], [x + 4.4 * k, y + 3 * k]], true), '#2a4a9e', 0.8 * k); }
  function emArgent(c, x, y, k) { var d = ''; for (var i = 0; i < 8; i++) { var a = i * PI / 4; d += 'M' + pt([x + Math.cos(a) * 3 * k, y + Math.sin(a) * 3 * k]) + 'L' + pt([x + Math.cos(a) * 8 * k, y + Math.sin(a) * 8 * k]); } return L(d, GOLD, 1.6 * k) + C(x, y, 4 * k, c.cel('#c8ccd4'), 1 * k); }
  function emForsaken(c, x, y, k) { return P(pd([[x - 6 * k, y - 5 * k], [x - 2 * k, y - 5 * k], [x, y - 1 * k], [x + 2 * k, y - 5 * k], [x + 6 * k, y - 5 * k], [x, y + 7 * k]], true), c.cel(FTRIM), 0.9 * k) + L('M' + pt([x - 7 * k, y - 8 * k]) + 'L' + pt([x + 7 * k, y - 8 * k]), FTRIM, 1.4 * k); }
  function emScarlet(c, x, y, k) { return sigil(c, x, y, 0.62 * k, WHT); }
  // pole banner, cloth hanging to the right of the pole
  function poleBanner(c, x, y, h, s, col, trim, em) {
    var top = y - h, w = 14 * s, bh = 30 * s;
    var o = E(x, y + 1, 5 * s, 1.4 * s, '#000', 0, 0.3) + limb('M' + pt([x, y]) + 'L' + pt([x, top - 4 * s]), '#5a3e24', 2 * s) + C(x, top - 5 * s, 2.2 * s, c.cel(GOLD), 1 * s);
    o += limb('M' + pt([x - 2 * s, top]) + 'L' + pt([x + w + 3 * s, top]), '#5a3e24', 1.4 * s);
    var bx = x + 1.5 * s, d = pd([[bx, top], [bx + w, top], [bx + w, top + bh], [bx + w / 2, top + bh - 6 * s], [bx, top + bh]], true);
    o += body(c, d, col, F(pd([[bx + w * 0.62, top - 2], [bx + w + 2, top - 2], [bx + w + 2, top + bh + 2], [bx + w * 0.62, top + bh]], true), dk(col, 0.3), 0.6) +
      L(pd([[bx + 2 * s, top + 1], [bx + 2 * s, top + bh - 2.6 * s], [bx + w / 2, top + bh - 8 * s], [bx + w - 2 * s, top + bh - 2.6 * s], [bx + w - 2 * s, top + 1]]), trim, 1.2 * s), 1.4 * s);
    return o + (em ? em(c, bx + w / 2, top + bh * 0.42, s) : '');
  }
  // long banner hanging from a rail on a wall (generalised art_scarlet.js banner)
  function wallBanner(c, x, y, w, h, col, trim, em, torn) {
    var d = torn ? pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h * 0.8], [x + w * 0.3, y + h * 0.7], [x + w * 0.1, y + h], [x - w * 0.12, y + h * 0.76], [x - w * 0.3, y + h * 0.9], [x - w / 2, y + h * 0.66]], true) :
      pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x, y + h - w * 0.4], [x - w / 2, y + h]], true);
    var o = limb('M' + pt([x - w / 2 - 4, y]) + 'L' + pt([x + w / 2 + 4, y]), '#4a3a2a', 2.2) + C(x - w / 2 - 4, y, 2, trim, 1) + C(x + w / 2 + 4, y, 2, trim, 1);
    o += body(c, d, col, F(pd([[x + w * 0.18, y - 2], [x + w / 2 + 2, y - 2], [x + w / 2 + 2, y + h + 2], [x + w * 0.18, y + h - w * 0.3]], true), dk(col, 0.35), 0.6) +
      (torn ? L('M' + pt([x - w / 2 + 2.4, y + 1]) + 'L' + pt([x - w / 2 + 2.4, y + h * 0.6]) + 'M' + pt([x + w / 2 - 2.4, y + 1]) + 'L' + pt([x + w / 2 - 2.4, y + h * 0.7]), trim, 1.4) + E(x + w * 0.1, y + h * 0.62, w * 0.3, h * 0.12, '#1a0e08', 0, 0.55) :
        L(pd([[x - w / 2 + 2.4, y + 1], [x - w / 2 + 2.4, y + h - 3], [x, y + h - w * 0.4 - 2.4], [x + w / 2 - 2.4, y + h - 3], [x + w / 2 - 2.4, y + 1]]), trim, 1.6)), 1.6);
    return o + (em ? em(c, x, y + h * 0.36, w / 16) : '');
  }
  function peaks(c, seed, base, hMin, hMax, col, snow, wMin, wMax) {
    var r = rng(seed), x = -30, o = '';
    while (x < 430) {
      var w = wMin + r() * (wMax - wMin), h = hMin + r() * (hMax - hMin), tx = x + w * (0.4 + r() * 0.2), ty = base - h, rx = x + w;
      o += P(pd([[x, base + 2], [tx, ty], [rx, base + 2]], true), col, 1.3) + F(pd([[tx, ty], [rx, base + 2], [tx + w * 0.06, base + 2]], true), dk(col, 0.16), 0.85);
      if (snow) {
        var k = 0.34, lx = tx - (tx - x) * k, ly = ty + h * k, rX = tx + (rx - tx) * k;
        o += P(pd([[lx, ly], [tx, ty], [rX, ly], [tx + (rx - tx) * k * 0.55, ly - h * 0.05], [tx + (rx - tx) * 0.12, ly + h * 0.04], [tx - (tx - x) * 0.14, ly - h * 0.06], [tx - (tx - x) * k * 0.6, ly + h * 0.03]], true), snow, 1);
      }
      x += w * (0.5 + r() * 0.25);
    }
    return o;
  }
  function farPines(seed, y, col, cnt, h0, h1, x0, x1) {
    var r = rng(seed), d = ''; x0 = x0 == null ? -10 : x0; x1 = x1 == null ? 410 : x1;
    for (var i = 0; i < cnt; i++) {
      var x = x0 + (x1 - x0) * (i + r() * 0.8) / cnt, h = h0 + r() * (h1 - h0), w = h * 0.34;
      d += 'M' + pt([x - w, y]) + 'L' + pt([x - w * 0.5, y - h * 0.45]) + 'L' + pt([x - w * 0.7, y - h * 0.45]) + 'L' + pt([x, y - h]) + 'L' + pt([x + w * 0.7, y - h * 0.45]) + 'L' + pt([x + w * 0.5, y - h * 0.45]) + 'L' + pt([x + w, y]) + 'Z';
    }
    return F(d, col);
  }
  function farDead(c, seed, y, cnt, col, s0, s1, x0, x1) {
    var r = rng(seed), o = ''; x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < cnt; i++) o += deadTree(c, x0 + (x1 - x0) * (i + r() * 0.7) / cnt, y + r() * 4, s0 + r() * (s1 - s0), col);
    return o;
  }
  function pine(c, x, y, s, col, snow) {
    col = col || '#2e4a36';
    var o = E(x, y + 1, 11 * s, 2.6 * s, '#000', 0, 0.25) + R(x - 1.8 * s, y - 8 * s, 3.6 * s, 9 * s, '#4a3222', 1 * s);
    for (var i = 0; i < 3; i++) {
      var yb = y - 5 * s - i * 11 * s, w = (14 - i * 3.6) * s, h = 18 * s;
      o += P(pd([[x - w, yb], [x, yb - h], [x + w, yb]], true), c.cel(col), 1.2 * s) + F(pd([[x, yb - h], [x + w, yb], [x + 1, yb]], true), dk(col, 0.25), 0.8);
      if (snow) o += P(pd([[x - w * 0.55, yb - h * 0.45], [x, yb - h], [x + w * 0.55, yb - h * 0.45], [x + w * 0.2, yb - h * 0.38], [x - w * 0.12, yb - h * 0.5]], true), snow, 0.8 * s) + F(pd([[x - w, yb], [x - w * 0.5, yb - 2.4 * s], [x + w * 0.4, yb - 2.2 * s], [x + w, yb]], true), snow, 0.8);
    }
    return o;
  }
  function snowPatches(seed, y0, y1, cnt) {
    var r = rng(seed), o = '';
    for (var i = 0; i < cnt; i++) { var y = y0 + r() * (y1 - y0), t = (y - y0) / (y1 - y0), w = 14 + t * 46 + r() * 10; o += E(r() * 400, y, w, w * 0.16, SNOW, 0, 0.55 + r() * 0.3); }
    return o;
  }
  function tent(c, x, y, s, col, trim) {
    col = col || CANVAS; trim = trim || BLUE;
    var o = E(x + 8 * s, y + 1, 36 * s, 4 * s, '#000', 0, 0.3);
    o += L('M' + pt([x, y - 36 * s]) + 'L' + pt([x - 34 * s, y + 1]) + 'M' + pt([x + 34 * s, y - 30 * s]) + 'L' + pt([x + 56 * s, y + 1]), '#6a5a44', 0.9 * s);
    o += P(pd([[x, y - 36 * s], [x + 34 * s, y - 30 * s], [x + 46 * s, y], [x + 22 * s, y]], true), c.cel(dk(col, 0.2)), 1.6 * s) + L('M' + pt([x + 12 * s, y - 34 * s]) + 'L' + pt([x + 30 * s, y]) + 'M' + pt([x + 24 * s, y - 32 * s]) + 'L' + pt([x + 38 * s, y]), dk(col, 0.35), 0.9 * s, 0.7);
    var d = pd([[x - 26 * s, y], [x, y - 36 * s], [x + 26 * s, y]], true);
    o += body(c, d, col, F(pd([[x + 2 * s, y - 38 * s], [x + 30 * s, y + 2], [x + 6 * s, y + 2]], true), dk(col, 0.14), 0.7) + L('M' + pt([x - 24 * s, y - 3.4 * s]) + 'L' + pt([x + 24 * s, y - 3.4 * s]), trim, 3 * s), 1.8 * s);
    o += P(pd([[x - 8 * s, y], [x, y - 20 * s], [x + 8 * s, y]], true), '#2a2420', 1.2 * s) + P(pd([[x, y - 20 * s], [x + 3 * s, y - 18 * s], [x + 12 * s, y], [x + 8 * s, y]], true), c.cel(lt(col, 0.06)), 1 * s);
    return o + limb('M' + pt([x, y - 36 * s]) + 'L' + pt([x, y - 44 * s]), '#6a4a2a', 1.3 * s) + P(pd([[x, y - 44 * s], [x + 9 * s, y - 42 * s], [x, y - 40 * s]], true), trim, 0.8 * s);
  }
  function palisade(c, x1, x2, y, h, col, step, seed) {
    col = col || '#6a4a30'; step = step || 9; var r = rng(seed || 3), o = '';
    for (var x = x1; x < x2; x += step) {
      var hh = h * (0.85 + r() * 0.25), d = pd([[x, y], [x, y - hh], [x + step / 2, y - hh - step * 0.7], [x + step, y - hh], [x + step, y]], true), cc = r() < 0.5 ? col : dk(col, 0.1);
      o += body(c, d, cc, F(pd([[x + step * 0.6, y - hh - step], [x + step + 1, y - hh - step], [x + step + 1, y + 1], [x + step * 0.6, y + 1]], true), dk(cc, 0.3), 0.8), 1.3);
    }
    var bar = 'M' + pt([x1, y - h * 0.3]) + 'L' + pt([x2, y - h * 0.3]) + 'M' + pt([x1, y - h * 0.72]) + 'L' + pt([x2, y - h * 0.72]);
    return o + L(bar, OL, 3.4) + L(bar, '#4a3a2e', 1.6);
  }
  function stakes(c, x0, x1, y, h, col, step) {
    col = col || '#6a4a30'; step = step || 12; var o = limb('M' + pt([x0 - 4, y - h * 0.4]) + 'L' + pt([x1, y - h * 0.4]), dk(col, 0.1), 2);
    for (var x = x0; x < x1; x += step) o += limb('M' + pt([x, y]) + 'L' + pt([x - h * 0.45, y - h]), col, 2.4) + P(pd([[x - h * 0.45 - 1.8, y - h + 1], [x - h * 0.52, y - h - 4], [x - h * 0.45 + 1.8, y - h - 0.4]], true), '#c8b08a', 0.8);
    return o;
  }
  function brazier(c, x, y, s, fo, fi) {
    var o = E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.3) + C(x, y - 20 * s, 30 * s, glow(c, fo || '#ff9a3a', 0.5));
    o += limb('M' + pt([x - 6 * s, y]) + 'L' + pt([x, y - 12 * s]) + 'L' + pt([x + 6 * s, y]) + 'M' + pt([x, y - 12 * s]) + 'L' + pt([x, y]), '#3a3434', 1.5 * s);
    o += flame(c, x, y - 15 * s, 0.8 * s, fo, fi);
    return o + P('M' + pt([x - 8 * s, y - 17 * s]) + 'L' + pt([x + 8 * s, y - 17 * s]) + 'L' + pt([x + 5 * s, y - 11 * s]) + 'L' + pt([x - 5 * s, y - 11 * s]) + 'Z', c.cel('#4a4444'), 1.3 * s) + L('M' + pt([x - 7 * s, y - 15 * s]) + 'L' + pt([x + 7 * s, y - 15 * s]), '#6a6464', 0.9 * s);
  }
  function campfire(c, x, y, s) {
    var o = C(x, y - 8 * s, 30 * s, glow(c, '#ffa040', 0.5)) + E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 10 * s, y]) + 'L' + pt([x + 8 * s, y - 5 * s]), '#5a3a22', 2.8 * s) + limb('M' + pt([x + 10 * s, y]) + 'L' + pt([x - 8 * s, y - 5 * s]), '#6a4428', 2.8 * s);
    o += flame(c, x, y - 2 * s, 0.9 * s);
    for (var i = 0; i < 5; i++) { var a = PI * (0.1 + 0.8 * i / 4); o += E(x + Math.cos(a) * 12 * s, y + Math.sin(a) * 2.6 * s, 3.4 * s, 2.3 * s, c.cel('#76746c'), 1 * s); }
    return o;
  }
  function crate(c, x, y, s, col) {
    col = col || '#8a6a40'; var w = 14 * s;
    return E(x, y + 1, w * 0.7, 2 * s, '#000', 0, 0.3) + P(pd([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - w], [x - w / 2, y - w]], true), c.cel(col), 1.4 * s) +
      L('M' + pt([x - w / 2, y - w]) + 'L' + pt([x + w / 2, y]) + 'M' + pt([x - w / 2 + 1.5 * s, y - w / 2]) + 'L' + pt([x + w / 2 - 1.5 * s, y - w / 2]), dk(col, 0.4), 1.2 * s);
  }
  function barrel(c, x, y, s, col) {
    col = col || '#7a5434'; var w = 8 * s, h = 15 * s;
    return E(x, y + 1, w, 2 * s, '#000', 0, 0.3) + P('M' + pt([x - w, y]) + 'C' + pt([x - w - 2 * s, y - h * 0.5]) + ' ' + pt([x - w, y - h]) + ' ' + pt([x - w * 0.9, y - h]) + 'L' + pt([x + w * 0.9, y - h]) + 'C' + pt([x + w, y - h]) + ' ' + pt([x + w + 2 * s, y - h * 0.5]) + ' ' + pt([x + w, y]) + 'Z', c.cel(col), 1.4 * s) +
      L('M' + pt([x - w - 1 * s, y - h * 0.25]) + 'L' + pt([x + w + 1 * s, y - h * 0.25]) + 'M' + pt([x - w - 1 * s, y - h * 0.75]) + 'L' + pt([x + w + 1 * s, y - h * 0.75]), '#3a3434', 1.5 * s) + E(x, y - h, w * 0.9, 1.8 * s, dk(col, 0.2), 1 * s);
  }
  function brokenFence(c, x1, x2, y, h, col, seed) {
    col = col || '#6a5a44'; var r = rng(seed || 4), o = '', rail = '';
    for (var x = x1; x <= x2; x += 22) {
      var lean = (r() - 0.5) * 6, hh = h * (r() < 0.2 ? 0.5 : 1);
      o += limb('M' + pt([x, y]) + 'L' + pt([x + lean, y - hh]), col, 2.6);
      if (x + 22 <= x2 && r() > 0.25) rail += 'M' + pt([x, y - h * 0.7]) + 'L' + pt([x + 22, y - h * 0.7 + (r() < 0.3 ? h * 0.6 : 0)]);
      if (x + 22 <= x2 && r() > 0.45) rail += 'M' + pt([x, y - h * 0.3]) + 'L' + pt([x + 22, y - h * 0.3]);
    }
    return L(rail, OL, 4.2) + L(rail, lt(col, 0.1), 2.2) + o;
  }
  function tomb(c, x, y, s, kind, tilt, col) {
    col = col || '#8a8a80';
    var d, o = E(x, y + 1, 9 * s, 2 * s, '#000', 0, 0.3);
    if (kind === 1) d = pd([[x - 2 * s, y], [x - 2 * s, y - 12 * s], [x - 7 * s, y - 12 * s], [x - 7 * s, y - 16 * s], [x - 2 * s, y - 16 * s], [x - 2 * s, y - 23 * s], [x + 2 * s, y - 23 * s], [x + 2 * s, y - 16 * s], [x + 7 * s, y - 16 * s], [x + 7 * s, y - 12 * s], [x + 2 * s, y - 12 * s], [x + 2 * s, y]], true);
    else d = 'M' + pt([x - 7 * s, y]) + 'L' + pt([x - 7 * s, y - 12 * s]) + 'C' + pt([x - 7 * s, y - 20 * s]) + ' ' + pt([x + 7 * s, y - 20 * s]) + ' ' + pt([x + 7 * s, y - 12 * s]) + 'L' + pt([x + 7 * s, y]) + 'Z';
    var g = body(c, d, col, F(pd([[x + 2 * s, y - 25 * s], [x + 10 * s, y - 25 * s], [x + 10 * s, y + 2], [x + 2 * s, y + 2]], true), dk(col, 0.3), 0.8) +
      (kind === 1 ? '' : L('M' + pt([x - 4 * s, y - 12 * s]) + 'l' + n(8 * s) + ',0 M' + pt([x - 3 * s, y - 9 * s]) + 'l' + n(6 * s) + ',0', dk(col, 0.4), 0.9 * s)), 1.3 * s);
    return o + (tilt ? G(g, 'rotate(' + n(tilt) + ',' + n(x) + ',' + n(y) + ')') : g);
  }
  function openGrave(c, x, y, s) {
    var dirt = '#5a4a30';
    var o = tomb(c, x - 4 * s, y - 6 * s, s * 0.9, 0, -7, '#7c7c72');
    o += P(shag(x + 17 * s, y - 2 * s, 11 * s, 5 * s, 6, 0.3, 41 + Math.round(x)), c.cel(dirt), 1.3 * s);
    o += E(x, y, 16 * s, 5 * s, c.cel(dk(dirt, 0.1)), 1.4 * s) + E(x, y + 1 * s, 12.5 * s, 3.2 * s, '#0e0a08');
    o += limb('M' + pt([x + 22 * s, y - 2 * s]) + 'L' + pt([x + 28 * s, y - 20 * s]), '#6a4a2a', 1.6 * s) + P(pd([[x + 19 * s, y - 1 * s], [x + 24 * s, y - 3 * s], [x + 24 * s, y + 4 * s], [x + 20 * s, y + 5 * s]], true), c.cel('#8a8e96'), 1 * s);
    return o;
  }
  function ironFence(x1, x2, y, h, step, seed) {
    var r = rng(seed || 2), d = '', tips = '';
    for (var x = x1; x <= x2; x += step) { if (r() < 0.15) continue; var lean = (r() - 0.5) * 3; d += 'M' + pt([x, y]) + 'L' + pt([x + lean, y - h]); tips += 'M' + pt([x + lean - 1.6, y - h + 1]) + 'L' + pt([x + lean, y - h - 3]) + 'L' + pt([x + lean + 1.6, y - h + 1]); }
    d += 'M' + pt([x1, y - h * 0.25]) + 'L' + pt([x2, y - h * 0.25]) + 'M' + pt([x1, y - h * 0.8]) + 'L' + pt([x2, y - h * 0.8]);
    return L(d, '#1e1c1e', 1.6) + L(tips, '#1e1c1e', 1.2);
  }
  function crypt(c, x, y, s) {
    var st = '#7c7a6e', w = 34 * s, h = 34 * s, yb = y - 4 * s, o = E(x, y + 1, w * 1.2, 4 * s, '#000', 0, 0.35);
    o += P(pd([[x - w - 5 * s, y], [x + w + 5 * s, y], [x + w + 2 * s, yb], [x - w - 2 * s, yb]], true), c.cel(dk(st, 0.1)), 1.4 * s);
    o += stoneFace(c, x - w, yb, w * 2, h, st, 7 * s);
    o += body(c, pd([[x - w - 6 * s, yb - h], [x, yb - h - 18 * s], [x + w + 6 * s, yb - h]], true), dk(st, 0.14), F(pd([[x, yb - h - 20 * s], [x + w + 8 * s, yb - h + 2], [x + 2, yb - h + 2]], true), dk(st, 0.35), 0.75), 1.6 * s);
    o += R(x - w - 6 * s, yb - h - 1 * s, (w + 6 * s) * 2, 4 * s, c.cel(lt(st, 0.08)), 1.2 * s);
    [x - w + 6 * s, x + w - 6 * s].forEach(function (px) { o += R(px - 3.4 * s, yb - h + 3 * s, 6.8 * s, h - 3 * s, c.lg([[0, lt(st, 0.2)], [0.5, st], [0.51, dk(st, 0.2)], [1, dk(st, 0.32)]], 0, 0, 1, 0), 1.2 * s); });
    o += C(x, yb - 12 * s, 28 * s, glow(c, PLG, 0.6)) + P(arched(x, yb, 18 * s, 26 * s), '#0c140a', 1.4 * s) + P(arched(x, yb, 12 * s, 20 * s), c.lg([[0, PLGL, 0.9], [1, '#3a8a1a', 0.6]]), 0);
    return o + skullIcon(c, x, yb - h - 7 * s, 0.9 * s);
  }
  function skullIcon(c, x, y, s) {
    return P('M' + pt([x - 5 * s, y + 1 * s]) + 'C' + pt([x - 6 * s, y - 6 * s]) + ' ' + pt([x + 6 * s, y - 6 * s]) + ' ' + pt([x + 5 * s, y + 1 * s]) + 'L' + pt([x + 3 * s, y + 5 * s]) + 'L' + pt([x - 3 * s, y + 5 * s]) + 'Z', c.cel(BONE), 1 * s) +
      C(x - 2 * s, y - 0.5 * s, 1.4 * s, OL) + C(x + 2 * s, y - 0.5 * s, 1.4 * s, OL);
  }
  function cauldron(c, x, y, s) {
    var ir = '#3c3a40', o = E(x, y + 1, 26 * s, 4.4 * s, '#000', 0, 0.35) + C(x, y - 22 * s, 48 * s, glow(c, PLG, 0.45));
    o += flame(c, x - 8 * s, y - 1 * s, 0.6 * s, '#4ac830', '#d8ff8a') + flame(c, x + 8 * s, y, 0.55 * s, '#4ac830', '#d8ff8a') + flame(c, x, y - 1 * s, 0.7 * s, '#4ac830', '#e8ffb0');
    o += limb('M' + pt([x - 14 * s, y - 8 * s]) + 'L' + pt([x - 18 * s, y]) + 'M' + pt([x + 14 * s, y - 8 * s]) + 'L' + pt([x + 18 * s, y]), ir, 2.4 * s);
    var d = 'M' + pt([x - 22 * s, y - 28 * s]) + 'C' + pt([x - 25 * s, y - 12 * s]) + ' ' + pt([x - 12 * s, y - 4 * s]) + ' ' + pt([x, y - 4 * s]) + 'C' + pt([x + 12 * s, y - 4 * s]) + ' ' + pt([x + 25 * s, y - 12 * s]) + ' ' + pt([x + 22 * s, y - 28 * s]) + 'Z';
    o += body(c, d, ir, F(pd([[x + 6 * s, y - 30 * s], [x + 26 * s, y - 30 * s], [x + 26 * s, y], [x + 6 * s, y]], true), dk(ir, 0.4), 0.8) + E(x - 12 * s, y - 20 * s, 4 * s, 2 * s, lt(ir, 0.35), 0, 0.6), 1.8 * s);
    o += E(x, y - 28 * s, 24 * s, 5 * s, c.cel(dk(ir, 0.05)), 1.6 * s) + E(x, y - 28.4 * s, 20 * s, 3.4 * s, c.rg([[0, PLGL], [0.6, PLG], [1, '#3a8a1a']]));
    o += C(x - 9 * s, y - 30 * s, 2.4 * s, lt(PLG, 0.35), 0.8 * s) + C(x + 5 * s, y - 31 * s, 3 * s, lt(PLG, 0.35), 0.8 * s) + C(x + 13 * s, y - 29 * s, 1.6 * s, lt(PLG, 0.35), 0.6 * s);
    o += P('M' + pt([x - 18 * s, y - 27 * s]) + 'C' + pt([x - 18 * s, y - 22 * s]) + ' ' + pt([x - 20 * s, y - 18 * s]) + ' ' + pt([x - 17 * s, y - 17 * s]) + 'C' + pt([x - 15 * s, y - 18 * s]) + ' ' + pt([x - 15 * s, y - 23 * s]) + ' ' + pt([x - 14 * s, y - 27 * s]) + 'Z', PLG, 0.8 * s);
    return o + E(x, y - 44 * s, 16 * s, 10 * s, PLG, 0, 0.2) + E(x + 7 * s, y - 60 * s, 20 * s, 12 * s, PLG, 0, 0.13) + E(x - 3 * s, y - 78 * s, 24 * s, 12 * s, PLG, 0, 0.08);
  }
  function farmhouse(c, x, y, s, o) {
    o = o || {};
    var w = 64 * s, h = 28 * s, gw = 28 * s, gy = y - h, wall = o.wall || '#b8aa88', roof = o.roof || '#6a4e36', ap = [x + gw / 2, y - h - 22 * s];
    var out = E(x + w / 2, y + 1, w * 0.62, 4 * s, '#000', 0, 0.3);
    out += R(x + w - 16 * s, ap[1] - 2 * s, 7 * s, 16 * s, c.cel('#6a6258'), 1.2 * s);
    out += body(c, pd([[x + gw, y], [x + w, y], [x + w, gy], [x + gw, gy]], true), dk(wall, 0.12), L('M' + pt([x + gw, gy + 8 * s]) + 'L' + pt([x + w, gy + 8 * s]) + 'M' + pt([x + gw + 12 * s, gy]) + 'L' + pt([x + gw + 12 * s, y]) + 'M' + pt([x + gw + 24 * s, gy]) + 'L' + pt([x + gw + 24 * s, y]), '#5a4230', 1.6 * s), 1.6 * s);
    var rd = pd([ap, [x + w + 3 * s, ap[1]], [x + w + 8 * s, gy + 3 * s], [x + gw + 4 * s, gy + 3 * s]], true);
    out += body(c, rd, roof, L('M' + pt([ap[0] + 6 * s, ap[1] + 6 * s]) + 'L' + pt([x + w + 5 * s, ap[1] + 6 * s]) + 'M' + pt([ap[0] + 10 * s, ap[1] + 13 * s]) + 'L' + pt([x + w + 7 * s, ap[1] + 13 * s]), dk(roof, 0.35), 1 * s) +
      (o.ruin ? F(pd([[x + gw + 12 * s, ap[1] + 4 * s], [x + gw + 30 * s, ap[1] + 3 * s], [x + gw + 26 * s, gy - 2 * s], [x + gw + 14 * s, gy], [x + gw + 16 * s, ap[1] + 12 * s]], true), '#1a1410') + L('M' + pt([x + gw + 16 * s, ap[1] + 3 * s]) + 'L' + pt([x + gw + 18 * s, gy]) + 'M' + pt([x + gw + 23 * s, ap[1] + 3 * s]) + 'L' + pt([x + gw + 22 * s, gy]), '#5a3a26', 1.6 * s) : ''), 1.6 * s);
    var gd = pd([[x, y], [x + gw, y], [x + gw, gy], ap, [x, gy]], true);
    out += body(c, gd, wall, F(pd([[x + gw * 0.62, ap[1] - 2], [x + gw + 2, ap[1] - 2], [x + gw + 2, y + 2], [x + gw * 0.62, y + 2]], true), dk(wall, 0.18), 0.7) +
      L('M' + pt([x, gy + 1]) + 'L' + pt([x + gw, gy + 1]) + 'M' + pt([x + gw / 2, ap[1] + 4 * s]) + 'L' + pt([x + gw / 2, gy]) + 'M' + pt([x + 2 * s, gy + 2 * s]) + 'L' + pt([x + gw / 2 - 1, ap[1] + 6 * s]), '#5a4230', 1.8 * s) +
      (o.ruin ? E(x + gw * 0.3, gy + h * 0.5, 5 * s, 4 * s, dk(wall, 0.25), 0, 0.8) + E(x + gw * 0.8, y - 3 * s, 7 * s, 3 * s, '#6a6a40', 0, 0.6) : ''), 1.6 * s);
    out += L(pd([[x - 3 * s, gy + 3 * s], ap, [x + gw + 4 * s, gy + 3 * s]]), OL, 5 * s) + L(pd([[x - 3 * s, gy + 3 * s], ap, [x + gw + 4 * s, gy + 3 * s]]), roof, 3 * s);
    out += P(pd([[x + gw * 0.5 - 5 * s, y], [x + gw * 0.5 - 5 * s, y - 15 * s], [x + gw * 0.5 + 5 * s, y - 15 * s], [x + gw * 0.5 + 5 * s, y]], true), c.cel('#4a3222'), 1.3 * s);
    out += R(x + gw + 5 * s, gy + 11 * s, 7 * s, 7 * s, o.lit ? '#ffc860' : '#1e1a16', 1.2 * s) + R(x + gw + 29 * s, gy + 11 * s, 7 * s, 7 * s, o.ruin ? '#1e1a16' : '#2a2620', 1.2 * s) + R(x + gw * 0.5 - 3.5 * s, gy - 12 * s, 7 * s, 7 * s, '#1e1a16', 1.1 * s);
    if (o.ruin) out += L('M' + pt([x + gw + 30 * s, gy + 11 * s]) + 'l' + n(7 * s) + ',' + n(7 * s) + 'M' + pt([x + gw + 37 * s, gy + 11 * s]) + 'l' + n(-7 * s) + ',' + n(7 * s), '#5a4230', 1.2 * s);
    return out;
  }
  function barn(c, x, y, s) {
    var wall = '#8a4a36', roof = '#4a3a30', w = 58 * s, h = 34 * s, sw = 44 * s;
    var o = E(x + w / 2 + sw / 2, y + 1, (w + sw) * 0.55, 4 * s, '#000', 0, 0.3);
    // long side receding right
    o += body(c, pd([[x + w, y], [x + w + sw, y - 2 * s], [x + w + sw, y - h + 2 * s], [x + w, y - h]], true), dk(wall, 0.18), L('M' + pt([x + w + 11 * s, y - h]) + 'L' + pt([x + w + 11 * s, y]) + 'M' + pt([x + w + 22 * s, y - h]) + 'L' + pt([x + w + 22 * s, y - 1 * s]) + 'M' + pt([x + w + 33 * s, y - h + 1 * s]) + 'L' + pt([x + w + 33 * s, y - 1 * s]), dk(wall, 0.4), 1.1 * s) + F(pd([[x + w + 14 * s, y - h + 6 * s], [x + w + 20 * s, y - h + 5 * s], [x + w + 19 * s, y - 12 * s], [x + w + 15 * s, y - 14 * s]], true), '#1a1410'), 1.6 * s);
    o += body(c, pd([[x + w * 0.5, y - h - 26 * s], [x + w * 0.5 + sw, y - h - 24 * s], [x + w + sw + 4 * s, y - h + 1 * s], [x + w + 4 * s, y - h - 1 * s]], true), roof, F(pd([[x + w * 0.5 + 20 * s, y - h - 24 * s], [x + w * 0.5 + 32 * s, y - h - 23 * s], [x + w + 30 * s, y - h + 1 * s], [x + w + 18 * s, y - h]], true), '#141010') + L('M' + pt([x + w * 0.5 + 24 * s, y - h - 24 * s]) + 'L' + pt([x + w + 22 * s, y - h]) + 'M' + pt([x + w * 0.5 + 29 * s, y - h - 23 * s]) + 'L' + pt([x + w + 27 * s, y - h]), '#5a3a26', 1.6 * s), 1.6 * s);
    // front gambrel face
    var fd = pd([[x, y], [x + w, y], [x + w, y - h], [x + w * 0.86, y - h - 16 * s], [x + w * 0.5, y - h - 26 * s], [x + w * 0.14, y - h - 16 * s], [x, y - h]], true);
    var pl = ''; for (var i = 1; i < 8; i++) pl += 'M' + pt([x + w * i / 8, y - h - 26 * s]) + 'L' + pt([x + w * i / 8, y]);
    o += body(c, fd, wall, L(pl, dk(wall, 0.35), 1 * s, 0.8) + F(pd([[x + w * 0.62, y - h - 30 * s], [x + w + 2, y - h - 30 * s], [x + w + 2, y + 2], [x + w * 0.62, y + 2]], true), dk(wall, 0.2), 0.6) + F(pd([[x + w * 0.1, y - h + 4 * s], [x + w * 0.2, y - h + 2 * s], [x + w * 0.2, y - h + 12 * s], [x + w * 0.12, y - h + 14 * s]], true), '#1a1410'), 1.8 * s);
    o += L(pd([[x - 2 * s, y - h + 1], [x + w * 0.14, y - h - 16 * s], [x + w * 0.5, y - h - 26 * s], [x + w * 0.86, y - h - 16 * s], [x + w + 2 * s, y - h + 1]]), OL, 5 * s) + L(pd([[x - 2 * s, y - h + 1], [x + w * 0.14, y - h - 16 * s], [x + w * 0.5, y - h - 26 * s], [x + w * 0.86, y - h - 16 * s], [x + w + 2 * s, y - h + 1]]), '#e0d8c4', 2.6 * s);
    // big doors (one hanging off) + loft door
    var dx0 = x + w * 0.2, dx1 = x + w * 0.8, dt = y - h + 6 * s;
    o += R(dx0, dt, dx1 - dx0, y - dt, '#1e1612', 1.4 * s);
    o += P(pd([[dx0, y], [dx0, dt], [x + w * 0.5, dt], [x + w * 0.5, y]], true), c.cel(dk(wall, 0.1)), 1.4 * s) + L('M' + pt([dx0, dt]) + 'L' + pt([x + w * 0.5, y]) + 'M' + pt([dx0, y]) + 'L' + pt([x + w * 0.5, dt]), '#e0d8c4', 1.6 * s);
    o += G(P(pd([[x + w * 0.5, y], [x + w * 0.5, dt], [dx1, dt], [dx1, y]], true), c.cel(dk(wall, 0.05)), 1.4 * s) + L('M' + pt([x + w * 0.5, dt]) + 'L' + pt([dx1, y]) + 'M' + pt([x + w * 0.5, y]) + 'L' + pt([dx1, dt]), '#e0d8c4', 1.6 * s), 'rotate(8,' + n(dx1) + ',' + n(dt) + ')');
    return o + R(x + w * 0.42, y - h - 14 * s, w * 0.16, 10 * s, '#1a1410', 1.3 * s);
  }
  function windmill(c, x, y, s, rot, broken) {
    var bw = 13 * s, tw = 8 * s, h = 62 * s, top = y - h, col = '#8a8272';
    var o = E(x, y + 1, 20 * s, 3.4 * s, '#000', 0, 0.3), jn = '';
    for (var j = 1; j < 8; j++) { var yy = y - h * j / 8, hw = bw + (tw - bw) * j / 8; jn += 'M' + pt([x - hw, yy]) + 'L' + pt([x + hw, yy]); }
    o += body(c, pd([[x - bw, y], [x + bw, y], [x + tw, top], [x - tw, top]], true), col, F(pd([[x + 2 * s, top - 2], [x + bw + 2, top - 2], [x + bw + 2, y + 2], [x + 3 * s, y + 2]], true), dk(col, 0.25), 0.8) + L(jn, dk(col, 0.35), 0.9 * s, 0.8), 1.8 * s);
    o += archWin(x - 2 * s, y, 6 * s, 12 * s, '#1e1a16', 1.2 * s) + archWin(x, top + 20 * s, 4 * s, 7 * s, '#1e1a16', 1 * s);
    o += P(pd([[x - tw - 4 * s, top + 2], [x - tw, top - 8 * s], [x, top - 13 * s], [x + tw, top - 8 * s], [x + tw + 4 * s, top + 2]], true), c.cel('#5a3a28'), 1.6 * s);
    var hub = [x - 4 * s, top - 4 * s];
    for (var i = 0; i < 4; i++) {
      if (broken && i === 3) continue;
      var a = rot + i * PI / 2, len = (broken && i === 1 ? 17 : 40) * s, q = dirQ(hub, a);
      o += limb('M' + pt(hub) + 'L' + pt(q(len, 0)), '#6a4a2e', 1.8 * s);
      var fr = pd([q(9 * s, 1 * s), q(len, 1 * s), q(len, 8 * s), q(9 * s, 8 * s)], true), lat = '';
      for (var k = 1; k < 4; k++) lat += 'M' + pt(q(9 * s + (len - 9 * s) * k / 4, 1 * s)) + 'L' + pt(q(9 * s + (len - 9 * s) * k / 4, 8 * s));
      o += P(fr, 'none', 1.2 * s) + L(lat + 'M' + pt(q(9 * s, 4.5 * s)) + 'L' + pt(q(len, 4.5 * s)), '#6a4a2e', 0.9 * s);
      if (!broken || i === 0) o += F(pd([q(10 * s, 1.4 * s), q(len * (broken ? 0.7 : 1) - 1, 1.4 * s), q(len * (broken ? 0.55 : 1) - 1, 7.6 * s), q(10 * s, 7.6 * s)], true), '#d8ccb0', 0.85);
    }
    if (broken) { var q3 = dirQ(hub, rot + 3 * PI / 2); o += limb('M' + pt(hub) + 'L' + pt(q3(8 * s, 0)), '#6a4a2e', 1.8 * s) + limb('M' + pt([x + tw + 10 * s, y - 2 * s]) + 'L' + pt([x + tw + 34 * s, y - 6 * s]), '#6a4a2e', 1.6 * s); }
    return o + C(hub[0], hub[1], 3 * s, c.cel('#4a3a2a'), 1.2 * s);
  }
  // perspective rows of withered corn on tilled soil; the rows reach further left as they come forward
  function crops(c, x0, x1, y0, y1, seed) {
    var r = rng(seed || 7), soil = F(pd([[x0 + 10, y0], [x1 + 4, y0], [x1 + 4, y1 + 6], [x0 - 70, y1 + 6]], true), '#5a4a2c', 0.5), far = ['', '', ''], near = ['', '', ''], fur = '';
    for (var j = 0; j < 8; j++) {
      var t = j / 7, y = y0 + 4 + (y1 - y0) * t * t, s = 0.45 + 1.05 * t, xs = x0 + 10 - 70 * t, B = j < 4 ? far : near;
      fur += 'M' + pt([xs, y + 2 * s]) + 'L' + pt([x1 + 4, y + 2 * s]);
      for (var x = xs + r() * 6 * s; x < x1 + 4; x += (7 + r() * 6) * s) {
        if (r() < 0.14) continue;
        var hh = (12 + r() * 8) * s, lean = (r() - 0.35) * 6 * s, tx = x + lean, ty = y - hh, k = r() < 0.5 ? 0 : 1;
        B[k] += 'M' + pt([x, y]) + 'Q' + pt([x + lean * 0.2, y - hh * 0.6]) + ' ' + pt([tx, ty]) + 'q' + n(2 * s) + ',' + n(-1 * s) + ' ' + n(3 * s) + ',' + n(3 * s);
        B[2] += 'M' + pt([x + lean * 0.08, y - hh * 0.42]) + 'q' + n(-5 * s) + ',' + n(-2.4 * s) + ' ' + n(-7 * s) + ',' + n(3.4 * s) + 'M' + pt([x + lean * 0.3, y - hh * 0.7]) + 'q' + n(5 * s) + ',' + n(-2.4 * s) + ' ' + n(7.4 * s) + ',' + n(3.6 * s);
      }
    }
    return soil + L(fur, '#3a3020', 1.8, 0.8) + L(far[2], '#6e6238', 1) + L(far[0], '#9a8c56', 1.1) + L(far[1], '#6a6036', 1.1) + L(near[2], '#6e6238', 1.6) + L(near[0], '#a8985c', 1.8) + L(near[1], '#6e6438', 1.8);
  }
  function well(c, x, y, s) {
    var st = '#8a867a', o = E(x, y + 1, 14 * s, 3 * s, '#000', 0, 0.3);
    o += limb('M' + pt([x - 11 * s, y - 6 * s]) + 'L' + pt([x - 11 * s, y - 28 * s]) + 'M' + pt([x + 11 * s, y - 6 * s]) + 'L' + pt([x + 11 * s, y - 28 * s]), '#5a3e28', 2 * s);
    o += P(pd([[x - 16 * s, y - 26 * s], [x, y - 36 * s], [x + 16 * s, y - 26 * s]], true), c.cel('#5a4230'), 1.4 * s) + F(pd([[x + 2 * s, y - 34 * s], [x + 8 * s, y - 30 * s], [x + 4 * s, y - 28 * s]], true), '#1a1410');
    o += body(c, pd([[x - 12 * s, y], [x + 12 * s, y], [x + 12 * s, y - 10 * s], [x - 12 * s, y - 10 * s]], true), st, L('M' + pt([x - 12 * s, y - 5 * s]) + 'L' + pt([x + 12 * s, y - 5 * s]) + 'M' + pt([x - 4 * s, y - 10 * s]) + 'l0,' + n(5 * s) + 'M' + pt([x + 5 * s, y - 5 * s]) + 'l0,' + n(5 * s), dk(st, 0.35), 0.9 * s), 1.4 * s);
    return o + E(x, y - 10 * s, 12 * s, 2.6 * s, c.cel(lt(st, 0.1)), 1.2 * s) + E(x, y - 10 * s, 9 * s, 1.6 * s, '#1a2410');
  }
  function hayBale(c, x, y, s) {
    var col = '#8a7a3e', o = E(x, y + 1, 11 * s, 2.4 * s, '#000', 0, 0.3);
    return o + body(c, 'M' + pt([x - 10 * s, y]) + 'C' + pt([x - 12 * s, y - 14 * s]) + ' ' + pt([x + 12 * s, y - 14 * s]) + ' ' + pt([x + 10 * s, y]) + 'Z', col, L('M' + pt([x - 7 * s, y - 3 * s]) + 'q' + n(7 * s) + ',' + n(-5 * s) + ' ' + n(14 * s) + ',0 M' + pt([x - 8 * s, y - 7 * s]) + 'q' + n(8 * s) + ',' + n(-4 * s) + ' ' + n(16 * s) + ',0', dk(col, 0.3), 0.9 * s) + E(x + 3 * s, y - 4 * s, 4 * s, 2.4 * s, '#4a4a2a', 0, 0.7), 1.3 * s);
  }
  function rubble(c, x, y, s, col, seed) {
    var r = rng(seed || 9), o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.3);
    for (var i = 0; i < 5; i++) { var bx = x + (r() - 0.5) * 26 * s, bw = (6 + r() * 6) * s, bh = (4 + r() * 4) * s, by = y - (i > 2 ? bh * 0.8 : 0); o += G(P(pd([[bx - bw / 2, by], [bx + bw / 2, by], [bx + bw / 2, by - bh], [bx - bw / 2, by - bh]], true), c.cel(i % 2 ? col : dk(col, 0.1)), 1.1 * s), 'rotate(' + n((r() - 0.5) * 30) + ',' + n(bx) + ',' + n(by) + ')'); }
    return o;
  }
  function ruin(c, x, y, w, h, col, seed, js) {
    var r = rng(seed), top = [], k = Math.max(3, Math.round(w / 11));
    for (var i = 0; i <= k; i++) top.push([w * i / k, r() < 0.4 ? h * (0.25 + r() * 0.5) : r() * h * 0.15]);
    return stoneFace(c, x, y, w, h, col, js || 7, top);
  }
  function greenFire(c, x, y, s) { return C(x, y - 10 * s, 24 * s, glow(c, PLG, 0.6)) + flame(c, x - 4 * s, y, 0.8 * s, '#4ac830', '#d8ff8a') + flame(c, x + 4 * s, y, 1 * s, '#58d83a', '#e8ffb0'); }
  function fire(c, x, y, s) { return C(x, y - 10 * s, 28 * s, glow(c, '#ff8a2a', 0.55)) + flame(c, x - 6 * s, y, 0.8 * s, '#ff5a1a', '#ffc84a') + flame(c, x + 5 * s, y, 1.1 * s) + flame(c, x + 13 * s, y + 1, 0.6 * s, '#ff5a1a'); }
  function smoke(x, y, s, col, op, seed) {
    var r = rng(seed || 3), o = '';
    for (var i = 0; i < 5; i++) o += E(x + i * 8 * s + (r() - 0.5) * 6 * s, y - i * 14 * s, (10 + i * 5) * s, (7 + i * 3) * s, col, 0, op * (1 - i * 0.15));
    return o;
  }
  function horn(c, x, y, len, ang, col, w) { var q = dirQ([x, y], ang); w = w || 3; return P('M' + pt(q(0, -w)) + 'Q' + pt(q(len * 0.6, -w * 0.8)) + ' ' + pt(q(len, w * 0.9)) + 'Q' + pt(q(len * 0.5, w * 0.5)) + ' ' + pt(q(0, w)) + 'Z', c.cel(col || '#c8c0a8'), 1.2); }
  function ziggurat(c, x, y, s) {
    var col = '#3c3a4c', trim = '#5e5c74', o = C(x, y - 50 * s, 84 * s, glow(c, PLG, 0.28)) + E(x, y + 1, 66 * s, 5 * s, '#000', 0, 0.4);
    var tiers = [[58, 20], [44, 18], [31, 16]], yy = y;
    for (var i = 0; i < tiers.length; i++) {
      var w = tiers[i][0] * s, h = tiers[i][1] * s, w2 = w - 6 * s, cc = i % 2 ? dk(col, 0.1) : col, ru = '';
      for (var k = 0; k < 6; k++) { var rx = x - w2 + 8 * s + (w2 * 2 - 16 * s) * k / 5; ru += 'M' + pt([rx - 2 * s, yy - h * 0.72]) + 'l' + n(2 * s) + ',' + n(-2.4 * s) + 'l' + n(2 * s) + ',' + n(2.4 * s); }
      o += body(c, pd([[x - w, yy], [x + w, yy], [x + w2, yy - h], [x - w2, yy - h]], true), cc, F(pd([[x + w * 0.25, yy - h - 2], [x + w + 2, yy - h - 2], [x + w + 2, yy + 2], [x + w * 0.35, yy + 2]], true), dk(cc, 0.35), 0.8) + L('M' + pt([x - w2 + 4 * s, yy - h * 0.4]) + 'L' + pt([x + w2 - 4 * s, yy - h * 0.4]), PLG, 1.4 * s, 0.85) + L(ru, PLGL, 1 * s, 0.8), 1.8 * s);
      o += R(x - w2 - 2 * s, yy - h - 2 * s, (w2 + 2 * s) * 2, 3 * s, c.cel(trim), 1 * s);
      o += horn(c, x - w2, yy - h, 14 * s, -PI / 2 - 0.9, '#b8b0a0', 2.6 * s) + horn(c, x + w2, yy - h, 14 * s, -PI / 2 + 0.9, '#9a9488', 2.6 * s);
      yy -= h;
    }
    o += F(pd([[x - 3 * s, yy - 4 * s], [x + 3 * s, yy - 4 * s], [x + 14 * s, -4], [x - 14 * s, -4]], true), c.lg([[0, PLGL, 0], [1, PLGL, 0.32]]));
    o += C(x, yy - 18 * s, 26 * s, glow(c, PLG, 0.7)) + P(pd([[x, yy - 36 * s], [x + 7 * s, yy - 20 * s], [x, yy - 7 * s], [x - 7 * s, yy - 20 * s]], true), c.cel('#2a2a3a'), 1.6 * s) + F(pd([[x, yy - 31 * s], [x + 3 * s, yy - 20 * s], [x, yy - 11 * s], [x - 3 * s, yy - 20 * s]], true), PLGL, 0.9);
    o += C(x, y - 10 * s, 18 * s, glow(c, PLG, 0.6)) + P(arched(x, y, 16 * s, 18 * s), '#0c1a0a', 1.6 * s) + P(arched(x, y, 11 * s, 13 * s), c.lg([[0, PLGL, 0.9], [1, PLG, 0.5]]), 0);
    return o;
  }
  function wTower(c, x, yb, w, h, col, roof, o) {
    o = o || {};
    var out = o.broken ? stoneFace(c, x - w / 2, yb, w, h, col, 7, [[0, 10], [w * 0.18, 2], [w * 0.34, 12], [w * 0.52, 5], [w * 0.7, 16], [w * 0.86, 8], [w, 14]]) : stoneFace(c, x - w / 2, yb, w, h, col, 7) + crenels(c, x - w / 2 - 2, x + w / 2 + 2, yb - h, col, 4);
    out += archWin(x, yb - h * 0.62, 5, 10, o.win || '#1e1a20', 1.1) + (o.winGlow ? C(x, yb - h * 0.62 - 4, 9, glow(c, o.winGlow, 0.5)) : '') + archWin(x, yb - h * 0.3, 5, 9, '#1e1a20', 1);
    if (!o.broken && roof) out += spireRoof(c, x, yb - h - 5, w, w * (o.roofK || 1.1), roof, o.fin);
    return out;
  }
  function castle(c, x, y, s) {
    var st = '#7a786c', dst = dk(st, 0.14), rf = '#3a3448', o = '';
    o += P('M' + pt([x - 118 * s, y + 6 * s]) + 'C' + pt([x - 96 * s, y - 8 * s]) + ' ' + pt([x + 96 * s, y - 10 * s]) + ' ' + pt([x + 120 * s, y + 6 * s]) + 'Z', c.cel('#4e4c3a'), 1.6 * s) + farPines(1811, y - 2 * s, '#2e3a2c', 7, 8 * s, 14 * s, x - 108 * s, x - 70 * s) + farPines(1812, y - 2 * s, '#2e3a2c', 6, 8 * s, 14 * s, x + 76 * s, x + 110 * s);
    o += stoneFace(c, x - 24 * s, y - 20 * s, 48 * s, 54 * s, dst, 7) + crenels(c, x - 26 * s, x + 26 * s, y - 74 * s, dst, 5);
    o += wTower(c, x + 16 * s, y - 74 * s, 14 * s, 16 * s, dst, rf, { roofK: 1.5, win: '#b8ff7a', winGlow: PLG });
    o += archWin(x - 10 * s, y - 50 * s, 6 * s, 11 * s, '#b8ff7a', 1.1) + C(x - 10 * s, y - 55 * s, 10 * s, glow(c, PLG, 0.5)) + archWin(x + 6 * s, y - 50 * s, 6 * s, 11 * s, '#1e1a20', 1.1);
    o += wTower(c, x - 66 * s, y - 2 * s, 22 * s, 56 * s, st, rf, { win: '#b8ff7a', winGlow: PLG }) + wTower(c, x + 66 * s, y - 2 * s, 22 * s, 46 * s, st, rf, { broken: true });
    o += stoneFace(c, x - 56 * s, y - 2 * s, 112 * s, 26 * s, st, 6) + crenels(c, x - 56 * s, x + 56 * s, y - 28 * s, st, 5);
    o += C(x, y - 14 * s, 26 * s, glow(c, PLG, 0.65)) + P(arched(x, y - 2 * s, 16 * s, 20 * s), '#0a120a', 1.6 * s) + P(arched(x, y - 2 * s, 11 * s, 15 * s), c.lg([[0, PLGL, 0.85], [1, PLG, 0.4]]), 0) + skullIcon(c, x, y - 26 * s, 0.8 * s);
    return o;
  }
  function cityGate(c, x, y, s) {
    var st = '#5e544a', o = '', w = 46 * s, h = 70 * s, aw = 40 * s, ah = 54 * s;
    o += wTower(c, x - w - 12 * s, y, 26 * s, 90 * s, dk(st, 0.08), null, { broken: true, win: '#ffb048', winGlow: '#ff8a2a' }) + wTower(c, x + w + 12 * s, y, 26 * s, 84 * s, dk(st, 0.08), '#3a2e2a', { win: '#ffb048', winGlow: '#ff8a2a', fin: '#6a5a4a' });
    o += stoneFace(c, x - w, y, w * 2, h, st, 8) + crenels(c, x - w - 2, x + w + 2, y - h, st, 6);
    o += P(arched(x, y, aw + 12 * s, ah + 9 * s), c.cel(lt(st, 0.12)), 1.8 * s);
    var ad = arched(x, y, aw, ah), id = c.clip(ad);
    o += P(ad, c.lg([[0, '#3a140a'], [0.45, '#b83e18'], [1, '#ffb040']]), 1.6 * s);
    var bars = '';
    for (var i = 1; i < 7; i++) bars += 'M' + pt([x - aw / 2 + aw * i / 7, y - ah - 2]) + 'L' + pt([x - aw / 2 + aw * i / 7, y - ah + 20 * s]);
    bars += 'M' + pt([x - aw / 2, y - ah + 8 * s]) + 'L' + pt([x + aw / 2, y - ah + 8 * s]) + 'M' + pt([x - aw / 2, y - ah + 16 * s]) + 'L' + pt([x + aw / 2, y - ah + 16 * s]);
    o += '<g clip-path="url(#' + id + ')">' + F(pd([[x - aw / 2, y], [x - aw / 2, y - 26 * s], [x - aw * 0.3, y - 34 * s], [x - aw * 0.1, y - 22 * s], [x + aw * 0.1, y - 38 * s], [x + aw * 0.3, y - 28 * s], [x + aw / 2, y - 30 * s], [x + aw / 2, y]], true), '#2a120c', 0.9) +
      fire(c, x - 12 * s, y, 1.1 * s) + fire(c, x + 8 * s, y - 1 * s, 1.3 * s) + L(bars, OL, 4.2) + L(bars, '#3a3434', 2.4) + '</g>';
    for (var k = 0; k < 9; k++) { var a = PI + PI * k / 8, rr = aw / 2 + 6 * s; o += L('M' + pt([x + Math.cos(a) * (aw / 2), y - ah + aw / 2 + Math.sin(a) * (aw / 2) * 0.9]) + 'L' + pt([x + Math.cos(a) * rr, y - ah + aw / 2 + Math.sin(a) * rr * 0.95]), dk(st, 0.35), 1.1); }
    o += wallBanner(c, x - 28 * s, y - h + 10 * s, 12 * s, 30 * s, '#2a4a8a', '#c8a048', null, true) + wallBanner(c, x + 28 * s, y - h + 10 * s, 12 * s, 30 * s, '#2a4a8a', '#c8a048', null, true);
    return o;
  }
  function burnedSkyline(c, seed, base, col) {
    var r = rng(seed), o = '', win = '', x = -10;
    while (x < 410) {
      var w = 18 + r() * 26, h = 18 + r() * 38;
      o += F(pd([[x, base], [x, base - h], [x + w * 0.3, base - h - r() * 12], [x + w * 0.5, base - h + 4], [x + w * 0.72, base - h - 14 * r()], [x + w, base - h + 2], [x + w, base]], true), col);
      if (r() < 0.7) win += R(x + w * 0.3, base - h * 0.6, 3, 4, '#ffa040', 0);
      if (r() < 0.5) win += R(x + w * 0.62, base - h * 0.4, 3, 4, '#ff7a2a', 0);
      x += w + r() * 4;
    }
    o += F(pd([[150, base], [150, base - 62], [156, base - 82], [162, base - 62], [162, base]], true), col) + F(pd([[268, base], [268, base - 50], [273, base - 70], [278, base - 50], [278, base]], true), col);
    return o + win;
  }
  function reeds(x, y, s, col) { return L('M' + pt([x, y]) + 'q' + n(-2 * s) + ',' + n(-8 * s) + ' ' + n(-1 * s) + ',' + n(-16 * s) + 'M' + pt([x + 2 * s, y]) + 'q' + n(1 * s) + ',' + n(-9 * s) + ' ' + n(4 * s) + ',' + n(-14 * s) + 'M' + pt([x + 4 * s, y]) + 'q' + n(2 * s) + ',' + n(-6 * s) + ' ' + n(6 * s) + ',' + n(-9 * s), col || '#5a5a30', 1.3 * s) + E(x - 1 * s, y - 15 * s, 1.2 * s, 3 * s, '#5a3a22'); }
  function townHouse(c, x, y, w, h, wall, roof) {
    return stoneFace(c, x - w / 2, y, w, h, wall, 6) + P(pd([[x - w / 2 - 3, y - h + 1], [x, y - h - w * 0.55], [x + w / 2 + 3, y - h + 1]], true), c.cel(roof), 1.5) + F(pd([[x, y - h - w * 0.55], [x + w / 2 + 3, y - h + 1], [x + 2, y - h + 1]], true), dk(roof, 0.25), 0.8) + R(x - 2.5, y - h * 0.6, 5, 6, '#2a2420', 1);
  }
  function leafTree(c, x, y, s, col) {
    col = col || '#4e7a34';
    return E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.25) + limb('M' + pt([x, y]) + 'L' + pt([x, y - 16 * s]), '#5a3e26', 3 * s) + P(shag(x, y - 26 * s, 16 * s, 14 * s, 7, 0.18, Math.round(x * 7)), c.cel(col), 1.4 * s) + E(x - 5 * s, y - 32 * s, 6 * s, 4 * s, lt(col, 0.2), 0, 0.7);
  }
  function hgGate(c, x, yb, w, h) {
    var arch = arched(x, yb, w + 10, h + 10), door = arched(x, yb, w, h), o = P(arch, c.cel(lt(STONE, 0.1)), 1.8), dd = '';
    for (var j = 1; j < 5; j++) dd += 'M' + pt([x - w / 2 + w * j / 5, yb - h - 2]) + 'L' + pt([x - w / 2 + w * j / 5, yb]);
    o += body(c, door, '#6a3a20', L(dd, '#3a1c10', 1.3) + L('M' + pt([x - w / 2, yb - h * 0.3]) + 'L' + pt([x + w / 2, yb - h * 0.3]) + 'M' + pt([x - w / 2, yb - h * 0.62]) + 'L' + pt([x + w / 2, yb - h * 0.62]), '#2e2a2a', 2.4) + L('M' + pt([x, yb - h]) + 'L' + pt([x, yb]), OL, 1.4), 1.8);
    return o;
  }
  function plagueSky(c, seed, top, mid, bot) {
    return sky(c, top || '#4c5240', mid || '#8a8e64', bot || '#b6b486') + C(260, 64, 96, glow(c, '#e0e89a', 0.25)) + overcast(c, seed, 20, '#62684e', 7, 1.2) + overcast(c, seed + 1, 50, '#787e5c', 6, 0.9);
  }
  function plagueGround(c, y, seed, top, bot) {
    var r = rng(seed), o = ground(c, y, top || '#76783c', bot || '#464924');
    for (var i = 0; i < 11; i++) { var yy = y + 6 + r() * (234 - y), t = (yy - y) / (240 - y), w = 16 + t * 52; o += E(r() * 400, yy, w, w * 0.14, r() < 0.5 ? '#8a8a48' : '#56582e', 0, 0.5); }
    return o + R(0, y - 1, 400, 6, c.lg([[0, '#000', 0.25], [1, '#000', 0]]));
  }
  function plagueMist(c, y, h, op, seed) { return mist(c, y, h, '#b8e070', op, seed); }

  // ============================================================
  //  SCENES (floor line at y 116-122, the back row stands on open ground right of centre)
  // ============================================================
  var SCENES = {
    chillwind_camp: function (c) {
      var o = sky(c, '#607290', '#a2aebc', '#d4d8d4') + sun(c, 318, 40, 9, '#f4f6ff') + overcast(c, 1401, 24, '#c6ccd4', 6, 1.1);
      o += peaks(c, 1402, 104, 40, 74, '#8a94a8', SNOW, 60, 110) + peaks(c, 1403, 112, 20, 42, '#74808e', SNOW, 50, 90);
      o += farPines(1404, 118, '#3a4a44', 36, 8, 17);
      o += ground(c, 116, '#8a8e6c', '#5a6044') + snowPatches(1405, 122, 236, 18) + R(0, 115, 400, 6, c.lg([[0, '#000', 0.2], [1, '#000', 0]]));
      o += palisade(c, 238, 404, 122, 20, '#6a4c32', 9, 1406);
      o += tent(c, 318, 124, 0.62) + pine(c, 214, 120, 0.62, '#34503c', SNOW) + pine(c, 390, 122, 0.7, '#34503c', SNOW);
      o += pine(c, 16, 124, 0.95, '#34503c', SNOW) + tent(c, 62, 130, 0.95) + tent(c, 158, 124, 0.7);
      o += poleBanner(c, 112, 134, 66, 1, BLUE, GOLD, emCrown) + poleBanner(c, 204, 126, 54, 0.85, BLUE, GOLD, emCrown) + poleBanner(c, 262, 124, 50, 0.8, '#e8e4dc', '#9aa4b0', emArgent);
      o += crate(c, 134, 146, 1) + crate(c, 148, 144, 0.75, '#7a5a36') + barrel(c, 176, 144, 0.9) + campfire(c, 210, 150, 0.9);
      o += grass(1407, 128, 236, '#4a5236', 36, 0.6, 1.4, 1.1) + tufts(c, [[40, 226, 1], [352, 232, 1.1], [120, 238, 0.9]], '#5a6a44');
      o += pine(c, 4, 214, 1.5, '#2e4a36', SNOW) + pine(c, 398, 204, 1.35, '#2e4a36', SNOW) + rock(c, 160, 238, 30, 10, '#7a7c78') + E(160, 229, 12, 3, SNOW, 0, 0.9);
      return o + motes(1408, 40, 0, 400, 0, 230, '#ffffff') + vignette(c, '#e0e8f0', '#101820');
    },
    the_bulwark: function (c) {
      var WALL = '#6e6a62', o = plagueSky(c, 1501);
      o += hills(c, 1502, 112, 26, '#5a5e40', 36) + farDead(c, 1503, 112, 7, '#3a3a2c', 0.3, 0.45);
      o += plagueGround(c, 118, 1504);
      o += F('M178,122 L222,122 C248,160 278,200 300,242 L100,242 C122,200 152,160 178,122 Z', '#7a6a4c', 0.8) + L('M178,122 C152,160 122,200 100,242 M222,122 C248,160 278,200 300,242', '#3e3a2a', 1.3, 0.6);
      o += stoneFace(c, -4, 122, 160, 34, WALL, 8) + crenels(c, -4, 156, 88, WALL, 6) + stoneFace(c, 244, 122, 160, 34, WALL, 8) + crenels(c, 244, 404, 88, WALL, 6);
      o += palisade(c, -4, 156, 90, 12, '#4a3a2e', 8, 1505) + palisade(c, 244, 404, 90, 12, '#4a3a2e', 8, 1506);
      o += stoneFace(c, 164, 122, 72, 52, dk(WALL, 0.06), 8) + crenels(c, 164, 236, 70, WALL, 6);
      o += wTower(c, 160, 122, 30, 74, WALL, '#4a3a5a', { fin: FTRIM }) + wTower(c, 240, 122, 30, 74, WALL, '#4a3a5a', { fin: FTRIM, win: '#ffc860', winGlow: '#ffb050' });
      o += hgGate(c, 200, 122, 34, 36);
      o += wallBanner(c, 44, 94, 16, 34, FPURP, FTRIM, emForsaken) + wallBanner(c, 116, 94, 16, 34, FPURP, FTRIM, emForsaken) + wallBanner(c, 284, 94, 16, 34, FPURP, FTRIM, emForsaken) + wallBanner(c, 356, 94, 16, 34, FPURP, FTRIM, emForsaken) + wallBanner(c, 200, 74, 20, 26, FPURP, FTRIM, emForsaken);
      o += stakes(c, 4, 150, 130, 14, '#5a4030', 13) + stakes(c, 256, 400, 130, 14, '#5a4030', 13);
      o += brazier(c, 140, 136, 1) + brazier(c, 260, 136, 1);
      o += grass(1507, 132, 236, '#4a4c28', 44, 0.6, 1.4, 1.1) + tufts(c, [[24, 230, 1.1], [360, 236, 1], [150, 238, 0.8]], '#6a6c38');
      o += deadTree(c, 18, 196, 1.3, '#2e2a22') + rock(c, 380, 212, 26, 10, '#6a6a58') + barrel(c, 112, 150, 0.85) + crate(c, 96, 152, 0.8);
      return o + plagueMist(c, 186, 30, 0.14, 1508) + vignette(c, '#e0e8c8', '#10140a');
    },
    felstone_field: function (c) {
      var o = plagueSky(c, 1601, '#4a503c', '#848a5e', '#b0b080');
      o += hills(c, 1602, 112, 30, '#5a6040', 40) + farDead(c, 1603, 112, 8, '#3e3e2e', 0.28, 0.42) + farmhouse(c, 300, 112, 0.34, { ruin: true, wall: '#8a8468', roof: '#4a4032' });
      o += plagueGround(c, 118, 1604, '#727638', '#44461f');
      o += crops(c, 150, 404, 126, 236, 1605);
      o += farmhouse(c, 18, 124, 1.1, { ruin: true });
      o += brokenFence(c, 0, 132, 150, 13, '#6a5a44', 1606) + brokenFence(c, 150, 400, 124, 10, '#5e503c', 1607);
      o += deadTree(c, 134, 126, 0.95, '#3a3228') + well(c, 192, 148, 1);
      o += grass(1608, 134, 236, '#56582c', 30, 0.6, 1.4, 1.1, 0, 150) + tufts(c, [[20, 232, 1.1], [120, 226, 0.9]], '#6a6c38');
      o += C(260, 160, 70, glow(c, PLG, 0.14)) + plagueMist(c, 134, 24, 0.24, 1609) + plagueMist(c, 196, 34, 0.16, 1610);
      return o + motes(1611, 18, 0, 400, 60, 220, '#d8ff9a') + crows(1612, 5, 60, 360, 20, 60) + vignette(c, '#e0e8c0', '#10140a');
    },
    dalson_tears: function (c) {
      var o = plagueSky(c, 1701, '#464a3c', '#7e8260', '#a8a882');
      o += hills(c, 1702, 114, 28, '#565c3e', 36) + farDead(c, 1703, 114, 9, '#3a3a2c', 0.28, 0.44);
      o += plagueGround(c, 118, 1704);
      o += windmill(c, 356, 122, 1, 0.5, true);
      o += barn(c, 24, 126, 1);
      o += brokenFence(c, 160, 330, 126, 12, '#5e503c', 1705) + hayBale(c, 150, 136, 1) + hayBale(c, 172, 134, 0.8);
      o += tomb(c, 196, 132, 0.7, 1, -8, '#7a6a52') + tomb(c, 210, 130, 0.6, 1, 6, '#7a6a52');
      o += deadTree(c, 250, 124, 0.8, '#3a3228');
      o += F('M60,150 L130,150 L150,242 L40,242 Z', '#6a5e3e', 0.5);
      o += grass(1706, 132, 236, '#4e5028', 44, 0.6, 1.4, 1.1) + tufts(c, [[30, 232, 1.1], [300, 236, 1], [380, 226, 0.9]], '#6a6c38');
      o += rock(c, 386, 236, 28, 10, '#6a6a58') + deadTree(c, 14, 206, 1.25, '#2e2a22');
      return o + plagueMist(c, 140, 26, 0.22, 1707) + plagueMist(c, 206, 30, 0.14, 1708) + crows(1709, 4, 220, 360, 20, 50) + vignette(c, '#e0e8c0', '#10140a');
    },
    andorhal: function (c) {
      var ST = '#76726a', o = sky(c, '#2e3226', '#565c40', '#7a7c56') + C(160, 70, 140, glow(c, PLG, 0.18)) + overcast(c, 1801, 22, '#4a4e3a', 7, 1.2);
      o += burnedSkyline(c, 1802, 112, '#3a3c2e').replace(/#ffa040|#ff7a2a/g, '#a8e060');
      o += plagueGround(c, 118, 1803, '#6a6a46', '#3a3a24');
      o += ruin(c, -6, 124, 80, 44, ST, 1804) + archWin(20, 110, 8, 14, '#141410', 1.2) + archWin(48, 108, 8, 14, '#141410', 1.2);
      o += ziggurat(c, 160, 120, 0.95);
      o += ruin(c, 262, 122, 60, 34, dk(ST, 0.05), 1805) + ruin(c, 338, 124, 66, 50, ST, 1806) + archWin(360, 106, 8, 14, '#b8ff7a', 1.2) + C(360, 100, 10, glow(c, PLG, 0.5));
      o += greenFire(c, 300, 124, 0.9) + greenFire(c, 70, 128, 0.8) + greenFire(c, 372, 124, 0.7);
      o += rubble(c, 88, 138, 1, ST, 1807) + rubble(c, 240, 136, 0.8, ST, 1808) + rubble(c, 380, 150, 1, ST, 1809);
      o += F('M110,140 L220,140 L260,242 L60,242 Z', '#5a5a42', 0.5) + pebbles(1810, 140, 236, '#8a8a74', 26);
      o += grass(1811, 134, 236, '#44462a', 26, 0.6, 1.3, 1.1) + deadTree(c, 10, 210, 1.2, '#2a2820') + greenFire(c, 196, 234, 0.7);
      return o + motes(1812, 26, 0, 400, 20, 220, '#c8ff8a') + plagueMist(c, 150, 26, 0.16, 1813) + vignette(c, '#d0e0b0', '#0a0e06');
    },
    hearthglen: function (c) {
      var ROOF = '#a8322a', o = sky(c, '#5e82ac', '#a4bed4', '#dce6e2') + sun(c, 90, 36, 9) + overcast(c, 1901, 26, '#f4f6f8', 5, 1);
      o += hills(c, 1902, 112, 34, '#6a8a4e', 40) + hills(c, 1903, 116, 16, '#5e7e44', 50);
      o += townHouse(c, 60, 98, 22, 16, STONE, ROOF) + townHouse(c, 250, 96, 24, 16, STONE, ROOF) + townHouse(c, 300, 98, 20, 14, STONE, ROOF) + townHouse(c, 350, 96, 22, 16, STONE, ROOF);
      o += stoneFace(c, 88, 100, 70, 46, dk(STONE, 0.06), 8) + crenels(c, 86, 160, 54, STONE, 6) + wTower(c, 104, 60, 16, 22, STONE, ROOF, { roofK: 1.6 }) + wTower(c, 146, 58, 16, 20, STONE, ROOF, { roofK: 1.6, win: '#ffc860' });
      o += archWin(112, 86, 7, 14, '#1e1a20', 1.2) + archWin(136, 86, 7, 14, '#1e1a20', 1.2) + sigil(c, 124, 70, 0.9, RED);
      o += ground(c, 118, '#6c8c46', '#46642c') + R(0, 117, 400, 5, c.lg([[0, '#000', 0.18], [1, '#000', 0]]));
      o += stoneFace(c, -4, 122, 408, 26, STONE, 8) + crenels(c, -4, 404, 96, STONE, 6);
      o += wTower(c, 26, 124, 26, 48, STONE, ROOF) + wTower(c, 222, 124, 30, 56, STONE, ROOF, { win: '#ffc860' }) + wTower(c, 378, 124, 26, 44, STONE, ROOF);
      o += hgGate(c, 180, 122, 26, 22);
      o += wallBanner(c, 70, 98, 14, 26, RED, GOLD, emScarlet) + wallBanner(c, 290, 98, 14, 26, RED, GOLD, emScarlet) + wallBanner(c, 336, 98, 14, 26, RED, GOLD, emScarlet) + wallBanner(c, 124, 54, 14, 22, RED, GOLD, emScarlet);
      o += F('M168,124 L192,124 C200,160 206,200 212,242 L130,242 C144,200 158,160 168,124 Z', '#b8b2a2', 0.9) + L('M168,124 C158,160 144,200 130,242 M192,124 C200,160 206,200 212,242', '#6a665a', 1.3, 0.7);
      o += leafTree(c, 118, 140, 0.8) + leafTree(c, 270, 138, 0.7, '#52803a') + leafTree(c, 8, 214, 1.3);
      o += grass(1904, 134, 236, '#4e7432', 40, 0.6, 1.4, 1.1) + tufts(c, [[40, 234, 1], [372, 232, 1.1], [250, 238, 0.8]], '#5e8a3a');
      return o + vignette(c, '#f0f4ff', '#18200e');
    },
    the_writhing_haunt: function (c) {
      var o = sky(c, '#1e221c', '#363e2e', '#525c42') + C(318, 44, 12, '#d8e8c0', 0, 0.85) + C(318, 44, 40, glow(c, '#d8f0b0', 0.3)) + overcast(c, 2001, 30, '#2e3428', 6, 1.2);
      o += hills(c, 2002, 112, 30, '#2e3426', 34) + farDead(c, 2003, 112, 12, '#1e2018', 0.3, 0.5);
      o += plagueGround(c, 118, 2004, '#565a34', '#30321c');
      o += farmhouse(c, 12, 122, 0.8, { ruin: true, wall: '#8a846a', roof: '#3e3428' });
      o += ironFence(110, 250, 124, 12, 7, 2005);
      o += crypt(c, 318, 122, 1);
      o += tomb(c, 128, 132, 0.8, 0, -8) + tomb(c, 244, 130, 0.7, 1, 5) + tomb(c, 270, 128, 0.6, 0, 10) + tomb(c, 386, 134, 0.8, 1, -6);
      o += openGrave(c, 110, 150, 0.9) + openGrave(c, 250, 146, 0.8);
      o += cauldron(c, 186, 142, 0.9);
      o += deadTree(c, 70, 128, 0.9, '#262420') + deadTree(c, 394, 214, 1.2, '#1e1c18');
      o += grass(2006, 132, 236, '#3a3c20', 34, 0.6, 1.4, 1.1) + tufts(c, [[30, 232, 1], [340, 236, 1.1]], '#4e5230');
      o += tomb(c, 158, 238, 1.1, 1, -10, '#6a6a60') + openGrave(c, 360, 234, 1.1);
      return o + plagueMist(c, 136, 30, 0.3, 2007) + plagueMist(c, 200, 40, 0.2, 2008) + motes(2009, 22, 0, 400, 60, 220, '#c8ff8a') + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    },
    caer_darrow: function (c) {
      var o = sky(c, '#34424a', '#687878', '#96a08e') + C(200, 60, 100, glow(c, PLG, 0.16)) + overcast(c, 2101, 22, '#56645e', 7, 1.2) + crows(2102, 5, 80, 320, 16, 50);
      o += hills(c, 2103, 96, 22, '#3e4a3c', 40) + farPines(2104, 97, '#2a3428', 40, 7, 14);
      o += R(0, 96, 400, 30, c.lg([[0, '#3e545a'], [0.6, '#56707a'], [1, '#6e8890']]));
      o += castle(c, 200, 108, 1);
      o += E(200, 112, 120, 4, '#000', 0, 0.25) + L('M40,104 l30,0 M300,106 l40,0 M120,116 l50,0 M230,118 l60,0 M20,120 l40,0 M330,120 l50,0', '#a8c4c8', 1.2, 0.6) + E(200, 118, 30, 3, PLG, 0, 0.22);
      o += plagueMist(c, 106, 18, 0.3, 2105);
      o += plagueGround(c, 124, 2106, '#666a40', '#3a3c22') + P('M-4,124 C80,121 160,126 240,123 C300,121 360,124 404,122 L404,130 L-4,130 Z', c.cel('#5a5c38'), 0);
      o += limb('M12,126 L12,112 M34,124 L34,110 M56,122 L56,108', '#4a3622', 2.2) + P(pd([[-4, 112], [62, 108], [62, 112], [-4, 116]], true), c.cel('#6e5234'), 1.4) + L('M10,113.6 l0,-4 M24,112.8 l0,-4 M38,112 l0,-4 M50,111.4 l0,-4', '#3a2a1a', 0.9);
      o += E(96, 116, 22, 2.4, '#000', 0, 0.25) + P('M74,110 C78,118 110,118 118,110 L112,108 L80,108 Z', c.cel('#5a3e26'), 1.5) + L('M80,110 L112,110', '#3a2818', 1.2) + limb('M100,108 L116,98', '#6a4a2a', 1.2);
      o += reeds(110, 130, 1) + reeds(126, 128, 0.8) + reeds(250, 128, 0.9) + reeds(388, 132, 1.1);
      o += tomb(c, 150, 136, 0.7, 1, -6, '#7a7a70') + rock(c, 262, 134, 22, 9, '#5e6058') + deadTree(c, 14, 212, 1.2, '#262420') + rock(c, 380, 234, 30, 11, '#5e6058');
      o += grass(2107, 136, 236, '#44462a', 36, 0.6, 1.4, 1.1) + tufts(c, [[60, 232, 1], [300, 236, 1.1]], '#5a5e34');
      return o + plagueMist(c, 180, 34, 0.12, 2108) + motes(2109, 18, 60, 340, 30, 130, '#c8ff8a') + vignette(c, '#d8e8e0', '#0a100c');
    },
    stratholme_gate: function (c) {
      var o = sky(c, '#241614', '#5e2e20', '#aa5428') + C(200, 100, 170, glow(c, '#ff7a2a', 0.3));
      o += smoke(60, 90, 1.6, '#2a1c18', 0.5, 2201) + smoke(300, 80, 1.8, '#2a1c18', 0.45, 2202) + overcast(c, 2203, 18, '#3a2620', 7, 1.3);
      o += burnedSkyline(c, 2204, 110, '#2a1c16');
      o += ground(c, 118, '#5a4a3a', '#2a2018') + R(0, 117, 400, 6, c.lg([[0, '#000', 0.3], [1, '#000', 0]]));
      o += stoneFace(c, -4, 122, 140, 42, '#56504a', 8) + crenels(c, -4, 136, 80, '#56504a', 6) + stoneFace(c, 264, 122, 140, 42, '#56504a', 8) + crenels(c, 264, 404, 80, '#56504a', 6);
      o += fire(c, 40, 80, 0.8) + fire(c, 330, 80, 0.9) + fire(c, 110, 82, 0.6);
      o += cityGate(c, 200, 122, 1);
      o += F('M176,124 L224,124 C248,160 276,200 300,242 L100,242 C124,200 152,160 176,124 Z', '#6a5a48', 0.7) + pebbles(2205, 128, 236, '#8a7a64', 30, 100, 300);
      o += rubble(c, 60, 140, 1, '#56504a', 2206) + rubble(c, 350, 146, 1.1, '#56504a', 2207) + fire(c, 350, 142, 0.7) + fire(c, 162, 172, 0.6);
      o += grass(2208, 134, 236, '#2e2418', 26, 0.6, 1.3, 1.1) + deadTree(c, 386, 222, 1.2, '#1a1410');
      return o + motes(2209, 50, 0, 400, 20, 230, '#ffb050') + smoke(160, 110, 0.8, '#1a1210', 0.25, 2210) + vignette(c, '#ffd0a0', '#0a0604');
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- biped rig (facing left; shared copy of art_maraudon.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
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
      var kneeF = 'M68,' + hipY + ' L71,103 L72,113', kneeN = 'M56,' + hipY + ' L53,103 L52,113';
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
  // ---- claws, feet (copies of art_duskwood.js) ----
  function claws4(c, p, ang, col, len, r) {
    len = len || 9; r = r || 5.2;
    var s = '';
    [-0.5, -0.17, 0.17, 0.5].forEach(function (k) {
      var a = ang + k, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      var b = [p[0] + ca * (r - 1), p[1] + sa * (r - 1)], tip = [p[0] + ca * (r - 1 + len) + px * len * 0.25, p[1] + sa * (r - 1 + len) + py * len * 0.25];
      s += P(pd([[b[0] + px * 1.9, b[1] + py * 1.9], [tip[0] + px * 0.6, tip[1] + py * 0.6], tip, [b[0] - px * 1.9, b[1] - py * 1.9]], true), '#ece4d0', 1.1);
    });
    return s + C(p[0], p[1], r, c.cel(col), 2);
  }
  function wolfFoot(c, h, t, fur) {
    var d = 'M' + pt([h[0] + 4, h[1] - 3]) + 'L' + pt([h[0] + 4, t[1] + 1]) + 'L' + pt([t[0] - 2, t[1] + 1]) + 'C' + pt([t[0] - 5, t[1] - 3]) + ' ' + pt([t[0] - 1, t[1] - 6]) + ' ' + pt([t[0] + 3, t[1] - 6]) + 'L' + pt([h[0] - 4, h[1] - 1]) + 'Z';
    return P(d, c.cel(fur), 2) + P(pd([[t[0] - 1, t[1] - 2], [t[0] - 7, t[1] + 1], [t[0] - 1, t[1] + 1]], true), '#ece4d0', 0.9) + P(pd([[t[0] + 3, t[1] - 1], [t[0] - 2, t[1] + 1.4], [t[0] + 3, t[1] + 1.4]], true), '#ece4d0', 0.9);
  }
  function dogPaw(c, x, y, col) {
    return P('M' + pt([x + 3, y - 5]) + 'L' + pt([x + 4, y + 1]) + 'L' + pt([x - 8, y + 1]) + 'C' + pt([x - 9, y - 2]) + ' ' + pt([x - 6, y - 4]) + ' ' + pt([x - 2, y - 5]) + 'Z', c.cel(col), 1.5) +
      L('M' + pt([x - 8, y + 1]) + 'l-2.4,1 M' + pt([x - 5, y + 1]) + 'l-2.2,1.2 M' + pt([x - 2, y + 1]) + 'l-1.8,1.2', OL, 1.4);
  }
  // ---- skeleton rig (copy of art_duskwood.js, with leg overrides and a pads hook) ----
  function boneLimb(pts, w, col) { var d = pd(pts); return L(d, OL, w + 3.6) + L(d, col, w) + pts.slice(1, -1).map(function (p) { return C(p[0], p[1], w * 0.78, col, 1.4); }).join(''); }
  function boneFoot(x, y, col) {
    return P('M' + n(x + 3) + ',' + n(y - 4) + ' L' + n(x + 4) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 9) + ',' + n(y - 2) + ' ' + n(x - 5) + ',' + n(y - 3) + ' ' + n(x - 2) + ',' + n(y - 4) + ' Z', col, 1.6) +
      L('M' + n(x - 5) + ',' + n(y - 2) + ' L' + n(x - 5) + ',' + n(y + 1) + ' M' + n(x - 2) + ',' + n(y - 3) + ' L' + n(x - 2) + ',' + n(y + 1), OL, 0.9);
  }
  function skullHead(c, x, y, o) {
    var b = o.bone || BONE, eye = o.eye || '#6ad4ff', s = '';
    var d = 'M' + pt([x + 10, y - 2]) + 'C' + pt([x + 11, y - 13]) + ' ' + pt([x - 2, y - 17]) + ' ' + pt([x - 9, y - 10]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 12, y]) + ' ' + pt([x - 11, y + 3]) + 'L' + pt([x - 9, y + 7]) + 'L' + pt([x - 2, y + 8]) + 'L' + pt([x + 4, y + 6]) + 'C' + pt([x + 8, y + 5]) + ' ' + pt([x + 10, y + 2]) + ' ' + pt([x + 10, y - 2]) + 'Z';
    s += P('M' + pt([x - 10, y + 6]) + 'L' + pt([x - 9, y + 12]) + 'L' + pt([x + 1, y + 13]) + 'L' + pt([x + 5, y + 6]) + 'L' + pt([x - 2, y + 8]) + 'Z', c.cel(dk(b, 0.08)), 1.6);
    s += body(c, d, b, F(pd([[x + 2, y - 18], [x + 14, y - 18], [x + 14, y + 8], [x + 4, y + 8]], true), dk(b, 0.3), 0.8) + L('M' + pt([x + 2, y - 12]) + 'l3,4 l-1,3', dk(b, 0.45), 0.9), 2);
    s += L('M' + pt([x - 9.6, y + 8.4]) + 'L' + pt([x, y + 9.6]) + 'M' + pt([x - 7, y + 7]) + 'l0,4 M' + pt([x - 4.4, y + 7.6]) + 'l0,4 M' + pt([x - 1.8, y + 8]) + 'l0,4', OL, 1);
    s += E(x - 6, y - 2, 3.6, 3.8, OL) + E(x + 1.6, y - 2.6, 2.6, 3.4, OL) + glowEye(c, x - 6, y - 2, 1.5, eye) + glowEye(c, x + 1.6, y - 2.6, 1.2, eye);
    s += P(pd([[x - 10.5, y + 3], [x - 8.5, y - 0.4], [x - 7.4, y + 3.4]], true), OL, 0.8);
    s += L('M' + pt([x - 10, y - 9]) + 'C' + pt([x - 5, y - 16]) + ' ' + pt([x + 4, y - 16]) + ' ' + pt([x + 8, y - 11]), RIM, 1, 0.6);
    return s;
  }
  function skeleton(c, o) {
    var b = o.bone || BONE, bf = dk(b, 0.22), s = '', hx = o.hx || 56, hy = o.hy || 30;
    s += shadow(c, 64, o.shadowR || 28);
    if (o.back) s += o.back(c);
    var far = o.far || [[72, 52], [84, 42], [82, 28]], near = o.near || [[52, 52], [44, 66], [38, 78]];
    var lf = o.legF || [[68, 86], [72, 103], [72, 117]], ln = o.legN || [[57, 88], [53, 104], [52, 117]];
    s += boneLimb(far, 3.6, bf);
    if (o.wFar) s += o.wFar(c, far[2]);
    s += C(far[2][0], far[2][1], 3.4, c.cel(bf), 1.6);
    s += boneLimb(lf, 4, bf) + boneFoot(lf[2][0] + 1, 121, c.cel(bf));
    s += F('M46,50 C50,44 70,44 72,50 L70,74 C64,80 52,80 48,74 Z', '#0a0c12', 0.55);
    if (o.inside) s += o.inside(c);
    s += L('M64,44 C68,58 62,72 64,86', OL, 7) + L('M64,44 C68,58 62,72 64,86', bf, 3.6);
    for (var i = 0; i < 4; i++) { var ry = 52 + i * 6.4, w = 19 - i * 1.6, rd = 'M' + pt([66, ry]) + 'C' + pt([62 - w * 0.2, ry - 4]) + ' ' + pt([66 - w, ry - 2]) + ' ' + pt([67 - w, ry + 4]); s += L(rd, OL, 5.6) + L(rd, b, 2.8); }
    s += L('M48,52 L49,74', OL, 5) + L('M48,52 L49,74', b, 2.4) + L('M52,48 C56,45 66,45 70,48', OL, 5.6) + L('M52,48 C56,45 66,45 70,48', b, 3);
    if (o.cloth) s += o.cloth(c);
    s += P('M52,82 C56,77 72,77 76,82 L74,90 L66,88 L62,93 L54,90 Z', c.cel(b), 1.8) + C(60, 86, 2, OL, 0, 0.8);
    if (o.hips) s += o.hips(c);
    s += boneLimb(ln, 4, b) + boneFoot(ln[2][0], 121, c.cel(b));
    if (o.front) s += o.front(c);
    if (o.pads) s += o.pads(c);
    s += L('M61,45 L58,38', OL, 6.4) + L('M61,45 L58,38', b, 3.2);
    s += skullHead(c, hx, hy, { bone: b, eye: o.eye });
    if (o.headX) s += o.headX(c, hx, hy);
    s += C(near[0][0], near[0][1], 4, c.cel(b), 1.6);
    if (o.wNear) s += o.wNear(c, near[2]);
    s += boneLimb(near, 3.8, b) + C(near[2][0], near[2][1], 3.6, c.cel(b), 1.6);
    if (o.wNearFront) s += o.wNearFront(c, near[2]);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  function stitchLine(pts, col) {
    var d = '', x = '';
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.max(1, Math.round(l / 5)), px = -dy / l * 3, py = dx / l * 3;
      d += 'M' + pt(a) + 'L' + pt(b);
      for (var j = 0; j <= k; j++) { var t = j / k, cx = a[0] + dx * t, cy = a[1] + dy * t; x += 'M' + pt([cx - px, cy - py]) + 'L' + pt([cx + px, cy + py]); }
    }
    return L(d, dk(col || '#3a2a2a', 0.1), 1.2) + L(x, col || '#2a1e1e', 1.2);
  }
  function ooze(c, x, y, len, s) {
    s = s || 1;
    return P('M' + pt([x - 3 * s, y]) + 'C' + pt([x - 3 * s, y + len * 0.6]) + ' ' + pt([x - 4 * s, y + len]) + ' ' + pt([x, y + len]) + 'C' + pt([x + 4 * s, y + len]) + ' ' + pt([x + 3 * s, y + len * 0.6]) + ' ' + pt([x + 3 * s, y]) + 'Z', c.cel(PLG), 1.2) + C(x - 1 * s, y + len * 0.7, 0.9 * s, PLGL);
  }
  // ---- Scarlet gear (copies of art_scarlet.js) ----
  function blade(c, p, len, ang, w, col, grip) {
    var q = dirQ(p, ang); col = col || '#d0d6de'; w = w || 3.2;
    var o = limb('M' + pt(q(-10, 0)) + 'L' + pt(q(3, 0)), grip || '#5a2a1a', 3.4) + C(q(-11, 0)[0], q(-11, 0)[1], 2.6, c.cel(GOLD), 1.1);
    var g = 'M' + pt(q(3, -w * 2.2)) + 'L' + pt(q(3, w * 2.2));
    o += L(g, OL, 5.4) + L(g, GOLD, 3.2);
    o += P(pd([q(5, -w), q(len - w * 2, -w), q(len, 0), q(len - w * 2, w), q(5, w)], true), c.cel(col), 1.6) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - w * 2.6, 0)), dk(col, 0.3), 1) + L('M' + pt(q(8, -w * 0.55)) + 'L' + pt(q(len - w * 2.6, -w * 0.55)), '#ffffff', 0.9, 0.75);
    return o;
  }
  function pauldron(c, x, y, r, col, trim) {
    col = col || STEEL;
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function tabard(c, col, trim, y1, sig) {
    y1 = y1 || 106;
    var d = 'M53,48 L75,48 L77,' + y1 + ' L64,' + (y1 + 5) + ' L51,' + y1 + ' Z';
    return body(c, d, col, F('M68,44 L80,44 L80,' + (y1 + 8) + ' L68,' + (y1 + 8) + ' Z', dk(col, 0.28), 0.7) + L(pd([[55, 49], [55, y1 - 1.6], [64, y1 + 2.6], [73, y1 - 1.6], [73, 49]]), trim || GOLD, 1.5), 1.8) + (sig === false ? '' : sigil(c, 64, 66, 0.9, WHT));
  }
  function robe(c, col, trim, o) {
    o = o || {};
    var hem = o.hem || 117, s = boot(52, 121, o.boots || '#3a2a1e') + boot(74, 121, dk(o.boots || '#3a2a1e', 0.15));
    var d = 'M47,80 L81,80 C85,94 90,106 93,' + hem + ' L35,' + hem + ' C38,106 42,94 47,80 Z';
    s += body(c, d, col, F('M70,78 L98,78 L98,122 L76,122 C78,106 76,92 70,78 Z', dk(col, 0.26), 0.8) + L('M56,90 L48,' + (hem - 2) + ' M64,90 L63,' + (hem - 2) + ' M74,90 L80,' + (hem - 2), dk(col, 0.24), 1.1) +
      (trim ? L('M36,' + (hem - 2.4) + ' L92,' + (hem - 2.4), trim, o.trimW || 3) : '') + (o.panel ? F(pd([[58, 80], [70, 80], [72, hem], [56, hem]], true), o.panel) + (trim ? L('M58,80 L56,' + hem + ' M70,80 L72,' + hem, trim, 1.4) : '') : ''), 2);
    return s;
  }
  function holyOrb(c, x, y, r, col) {
    col = col || HOLY; var d = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4 + 0.2; d += 'M' + pt([x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5]) + 'L' + pt([x + Math.cos(a) * r * 2.6, y + Math.sin(a) * r * 2.6]); }
    return C(x, y, r * 4, glow(c, col, 0.7)) + L(d, lt(col, 0.3), 1.4, 0.9) + C(x, y, r, c.rg([[0, '#ffffff'], [0.55, lt(col, 0.4)], [1, col]]), 1.2);
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
  // human head facing left (face of art_scarlet.js smHead) with a mail coif + kettle helm, or a short bob
  function wpHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', hc = o.hair || '#5a3a22', s = '', hat = o.hat, mail = o.mailCol || '#9ea2aa';
    if (hat === 'kettle') s += P('M' + pt([x - 8, y - 10]) + 'C' + pt([x + 4, y - 18]) + ' ' + pt([x + 18, y - 12]) + ' ' + pt([x + 17, y + 4]) + 'L' + pt([x + 16, y + 17]) + 'C' + pt([x + 8, y + 20]) + ' ' + pt([x - 2, y + 19]) + ' ' + pt([x - 8, y + 15]) + 'Z', c.cel(mail), 2) +
      L('M' + pt([x + 6, y - 6]) + 'l6,0 M' + pt([x + 7, y]) + 'l7,0 M' + pt([x + 7, y + 6]) + 'l8,0 M' + pt([x + 4, y + 12]) + 'l10,0', dk(mail, 0.35), 0.9, 0.8);
    if (hat === 'bob') s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x + 12, y - 19]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 14, y + 11]) + 'C' + pt([x + 10, y + 14]) + ' ' + pt([x + 6, y + 13]) + ' ' + pt([x + 4, y + 11]) + 'Z', c.cel(hc), 2);
    if (hat !== 'kettle') s += E(x + 7, y + 1, 2.8, 3.8, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.scar ? L('M' + pt([x - 6, y - 10]) + 'L' + pt([x - 2, y + 4]), dk(sk, 0.4), 1.3) : ''), 2);
    if (o.glowEye) s += gEye(c, x - 5, y - 1.6, 1.4, o.glowEye);
    else s += C(x - 5, y - 1.6, 1.7, OL) + C(x - 5.5, y - 2.2, 0.5, '#fff');
    s += L('M' + pt([x - 10, y - 6.4]) + 'L' + pt([x - 1, y - 4.6]), o.brow || dk(hc, 0.2), 2.2);
    if (o.tache) s += P('M' + pt([x - 12, y + 6]) + 'C' + pt([x - 10, y + 3]) + ' ' + pt([x - 3, y + 3]) + ' ' + pt([x + 1, y + 6]) + 'C' + pt([x - 3, y + 6]) + ' ' + pt([x - 8, y + 6]) + ' ' + pt([x - 12, y + 10]) + 'Z', c.cel(o.tache), 1.2);
    else s += o.open ? P('M' + pt([x - 10, y + 6]) + 'Q' + pt([x - 6, y + 10]) + ' ' + pt([x - 2, y + 6]) + 'Z', '#5a1a14', 1) : L('M' + pt([x - 9, y + 7]) + 'L' + pt([x - 3, y + 7.4]), OL, 1.3);
    if (hat === 'bob') s += P('M' + pt([x - 10, y - 5]) + 'C' + pt([x - 11, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 7, y - 6]) + 'C' + pt([x + 3, y - 9]) + ' ' + pt([x - 2, y - 8]) + ' ' + pt([x - 5, y - 6]) + 'L' + pt([x - 7, y - 3]) + 'Z', c.cel(hc), 1.8) + L('M' + pt([x - 6, y - 13]) + 'C' + pt([x, y - 16]) + ' ' + pt([x + 6, y - 15]) + ' ' + pt([x + 9, y - 10]), lt(hc, 0.4), 1.1, 0.8);
    if (hat === 'kettle') {
      var fe = 'M' + pt([x - 11, y - 8]) + 'C' + pt([x - 4, y - 11]) + ' ' + pt([x + 4, y - 10]) + ' ' + pt([x + 5, y - 3]) + 'C' + pt([x + 6, y + 4]) + ' ' + pt([x + 4, y + 11]) + ' ' + pt([x - 2, y + 14]) + 'C' + pt([x - 5, y + 15]) + ' ' + pt([x - 8, y + 14]) + ' ' + pt([x - 10, y + 12]);
      s += L(fe, OL, 5.8) + L(fe, mail, 3.6) + L(fe, lt(mail, 0.35), 1, 0.7);
      var dome = 'M' + pt([x - 11, y - 9]) + 'C' + pt([x - 12, y - 25]) + ' ' + pt([x + 13, y - 26]) + ' ' + pt([x + 13, y - 9]) + 'Z';
      s += body(c, dome, STEEL, F(pd([[x + 3, y - 27], [x + 16, y - 27], [x + 16, y - 8], [x + 3, y - 8]], true), dk(STEEL, 0.3), 0.75) + L('M' + pt([x - 11, y - 12.4]) + 'L' + pt([x + 13, y - 12.4]), RED, 2.2) + L('M' + pt([x + 1, y - 25]) + 'L' + pt([x + 1, y - 13]), dk(STEEL, 0.25), 1.2), 2);
      s += P(ellD(x + 1, y - 9, 21, 4.4), c.cel(lt(STEEL, 0.05)), 1.8) + F(ellD(x + 1, y - 8.2, 17, 2), dk(STEEL, 0.5), 0.8) + C(x - 15, y - 9.6, 0.9, '#ffffff', 0, 0.8);
    }
    return s;
  }
  // big crescent-bladed two-handed axe; the blade sits on the -v side of the haft
  function greatAxe(c, p, len, ang, bw) {
    var q = dirQ(p, ang), o = haft(c, p, len + 8, ang, '#3a2a1e', 4.2, 4);
    var bl = 'M' + pt(q(len + 5, -1)) + 'Q' + pt(q(len + 7, -bw * 0.6)) + ' ' + pt(q(len + 13, -bw * 1.05)) + 'Q' + pt(q(len - 6, -bw * 1.5)) + ' ' + pt(q(len - 25, -bw * 1.05)) + 'Q' + pt(q(len - 13, -bw * 0.55)) + ' ' + pt(q(len - 9, -1)) + 'Z';
    o += P(bl, c.cel('#8e9096'), 2) + L('M' + pt(q(len + 11, -bw * 1.02)) + 'Q' + pt(q(len - 6, -bw * 1.38)) + ' ' + pt(q(len - 22, -bw * 1.02)), '#eef0f4', 1.3, 0.85);
    o += E(q(len - 4, -bw * 0.7)[0], q(len - 4, -bw * 0.7)[1], 3.4, 2.2, '#7a2a1c', 0, 0.8) + E(q(len + 3, -bw * 0.45)[0], q(len + 3, -bw * 0.45)[1], 2, 1.4, '#7a2a1c', 0, 0.8);
    o += P(pd([q(len, 1.5), q(len - 3, 11), q(len - 7, 1.5)], true), c.cel('#6a6c72'), 1.4);
    var m = q(len - 2, 0);
    return o + R(m[0] - 4, m[1] - 4, 8, 8, c.cel('#3a3434'), 1.3) + C(m[0], m[1], 1.3, '#c8c0b0');
  }
  // ---- dog skull (facing left; x, y = cranium centre) ----
  function dogSkull(c, x, y, b) {
    var s = '';
    s += P(pd([[x + 5, y - 8], [x + 16, y - 21], [x + 14, y - 4]], true), c.cel('#5a5c40'), 1.4) + L('M' + pt([x + 8, y - 8]) + 'L' + pt([x + 14, y - 16]), '#3a3c28', 1);
    s += F(pd([[x + 2, y + 6], [x - 18, y + 9], [x - 21, y + 17], [x - 4, y + 14]], true), '#1a0e0a', 0.95);
    var jaw = pd([[x + 5, y + 7], [x - 8, y + 12], [x - 20, y + 17], [x - 22, y + 21], [x - 15, y + 21], [x - 2, y + 17], [x + 8, y + 12]], true);
    s += P(jaw, c.cel(dk(b, 0.1)), 1.6);
    [[-19, 17], [-15, 15.6], [-11, 14.2]].forEach(function (t) { s += P(pd([[x + t[0] - 1.4, y + t[1]], [x + t[0], y + t[1] - 4], [x + t[0] + 1.4, y + t[1]]], true), '#f4ecd6', 0.7); });
    var d = 'M' + pt([x + 11, y + 2]) + 'C' + pt([x + 12, y - 10]) + ' ' + pt([x + 2, y - 14]) + ' ' + pt([x - 6, y - 10]) + 'C' + pt([x - 12, y - 8]) + ' ' + pt([x - 20, y - 4]) + ' ' + pt([x - 26, y - 1]) + 'L' + pt([x - 27, y + 4]) + 'L' + pt([x - 20, y + 8]) + 'L' + pt([x - 6, y + 8]) + 'L' + pt([x + 4, y + 9]) + 'C' + pt([x + 8, y + 8]) + ' ' + pt([x + 11, y + 6]) + ' ' + pt([x + 11, y + 2]) + 'Z';
    s += body(c, d, b, F(pd([[x + 2, y - 16], [x + 14, y - 16], [x + 14, y + 10], [x + 4, y + 10]], true), dk(b, 0.28), 0.8) + L('M' + pt([x - 2, y - 10]) + 'l3,5 M' + pt([x - 14, y - 2]) + 'l6,0', dk(b, 0.4), 0.9), 2);
    s += P(pd([[x - 25, y + 4], [x - 23, y + 11], [x - 21, y + 5]], true), '#f4ecd6', 0.8) + P(pd([[x - 13, y + 7], [x - 11.5, y + 12], [x - 10, y + 7]], true), '#f4ecd6', 0.8) + P(pd([[x - 18, y + 6], [x - 17, y + 9], [x - 16, y + 6]], true), '#f4ecd6', 0.7);
    s += E(x - 4, y - 3, 4.6, 3.8, OL) + gEye(c, x - 4, y - 3, 1.8, PLG) + E(x - 25, y + 0.5, 1.4, 1.1, OL);
    return s + L('M' + pt([x - 24, y - 2]) + 'C' + pt([x - 14, y - 8]) + ' ' + pt([x - 4, y - 13]) + ' ' + pt([x + 6, y - 11]), RIM, 1, 0.6);
  }
  // ---- ghoul head (facing left): gaunt, big ear, lolling tongue; o.roar opens the jaw wide ----
  function ghoulHead(c, x, y, o) {
    var sk = o.skin, s = '', jd = o.roar ? 7 : 0;
    s += P(pd([[x + 4, y - 5], [x + 21, y - 15], [x + 10, y + 3]], true), c.cel(dk(sk, 0.1)), 1.6) + F(pd([[x + 7, y - 4], [x + 17, y - 12], [x + 10, y], [x + 8, y]], true), '#5a3a3a', 0.7);
    s += F(pd([[x - 11, y + 4], [x + 4, y + 4], [x + 2, y + 13 + jd], [x - 12, y + 15 + jd]], true), '#2a0e12');
    s += P('M' + pt([x - 11, y + 5]) + 'L' + pt([x - 14, y + 16 + jd]) + 'C' + pt([x - 8, y + 19 + jd]) + ' ' + pt([x, y + 18 + jd]) + ' ' + pt([x + 4, y + 13 + jd * 0.6]) + 'L' + pt([x + 5, y + 5]) + 'Z', c.cel(dk(sk, 0.12)), 1.6);
    s += F(pd([[x - 10, y + 6], [x + 3, y + 6], [x + 1, y + 12 + jd * 0.7], [x - 11, y + 13 + jd]], true), '#2a0e12');
    s += P('M' + pt([x - 4, y + 11 + jd]) + 'C' + pt([x - 10, y + 14 + jd]) + ' ' + pt([x - 13, y + 20 + jd]) + ' ' + pt([x - 11, y + 25 + jd]) + 'C' + pt([x - 8, y + 24 + jd]) + ' ' + pt([x - 7, y + 18 + jd]) + ' ' + pt([x - 1, y + 14 + jd]) + 'Z', '#a84a5a', 1.1);
    [[-12, 14.6], [-7, 14], [-2, 13.4]].forEach(function (t) { s += P(pd([[x + t[0] - 1.4, y + t[1] + jd], [x + t[0], y + t[1] - 3.6 + jd], [x + t[0] + 1.4, y + t[1] + jd]], true), '#e8e0c4', 0.8); });
    var d = 'M' + pt([x + 9, y - 3]) + 'C' + pt([x + 10, y - 14]) + ' ' + pt([x - 3, y - 17]) + ' ' + pt([x - 9, y - 11]) + 'C' + pt([x - 12, y - 8]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 12, y - 1]) + 'L' + pt([x - 15, y + 2]) + 'L' + pt([x - 11, y + 4]) + 'L' + pt([x - 11, y + 6]) + 'L' + pt([x + 5, y + 6]) + 'C' + pt([x + 8, y + 4]) + ' ' + pt([x + 9, y + 1]) + ' ' + pt([x + 9, y - 3]) + 'Z';
    s += body(c, d, sk, F(pd([[x + 1, y - 18], [x + 14, y - 18], [x + 14, y + 8], [x + 2, y + 8]], true), dk(sk, 0.3), 0.8) + F('M' + pt([x - 8, y + 1]) + 'C' + pt([x - 5, y + 4]) + ' ' + pt([x, y + 4]) + ' ' + pt([x + 2, y]) + 'L' + pt([x + 2, y + 6]) + 'L' + pt([x - 9, y + 6]) + 'Z', dk(sk, 0.3), 0.7) +
      (o.scars ? L('M' + pt([x - 7, y - 14]) + 'L' + pt([x + 3, y - 2]), '#c86a6a', 1.4) + L('M' + pt([x - 5, y - 12]) + 'l3,-1 M' + pt([x - 2, y - 8]) + 'l3,-1 M' + pt([x + 1, y - 5]) + 'l3,-1', '#6a2a2a', 0.9) : C(x + 3, y - 10, 2, lt(PLG, 0.1), 0.8) + C(x - 4, y - 13, 1.4, lt(PLG, 0.1), 0.6)), 2);
    s += P(pd([[x - 11, y + 5.6], [x - 10, y + 9], [x - 8.6, y + 5.8]], true), '#e8e0c4', 0.8) + P(pd([[x - 6.6, y + 5.8], [x - 5.6, y + 9.4], [x - 4.2, y + 6]], true), '#e8e0c4', 0.8);
    s += L('M' + pt([x - 11, y - 6]) + 'L' + pt([x - 1, y - 8]), OL, 2.2);
    s += E(x - 6, y - 3, 3.2, 2.6, '#10140c') + glowEye(c, x - 6, y - 3, 1.6, o.eye || '#e8ff6a');
    return s + L('M' + pt([x - 12, y - 4]) + 'C' + pt([x - 11, y - 12]) + ' ' + pt([x - 2, y - 16]) + ' ' + pt([x + 6, y - 13]), RIM, 1, 0.6);
  }
  // ---- hunched ghoul rig (facing left), standing on two bent legs ----
  function ghoulRig(c, o) {
    var sk = o.skin, sk2 = dk(sk, 0.2), s = shadow(c, 62, o.shadowR || 40);
    if (o.back) s += o.back(c);
    var fa = o.far, na = o.near;
    s += limb(pd(fa.slice(0, 2)), sk2, o.armW || 7) + limb(pd(fa.slice(1)), sk2, (o.armW || 7) - 1) + claws4(c, fa[2], o.farAng, sk2, o.clawLen || 10, 4.4);
    s += limb('M74,84 L88,99 L84,112', sk2, 8.5) + wolfFoot(c, [84, 112], [76, 121], sk2);
    var td = 'M34,60 C36,42 56,30 74,34 C92,40 96,68 86,88 L62,92 C50,86 40,76 34,60 Z';
    var inner = F('M74,28 L106,28 L106,98 L82,98 C92,80 90,50 74,28 Z', dk(sk, 0.3), 0.8) + L('M50,66 q7,4 14,1 M50,73 q7,4 14,1 M52,80 q6,3 12,1', dk(sk, 0.38), 1.3) + E(60, 50, 5, 3, dk(sk, 0.26), 0, 0.8) + F('M36,62 C42,58 50,62 52,72 C48,78 42,78 38,72 Z', lt(sk, 0.15), 0.6);
    if (o.sores !== false) [[72, 60, 3.2], [58, 44, 2.4], [80, 74, 2.6], [44, 68, 2]].forEach(function (b) { inner += C(b[0], b[1], b[2] + 1.4, '#6a4a3a', 0, 0.8) + C(b[0], b[1], b[2], lt(PLG, 0.2), 0.8) + C(b[0] - b[2] * 0.3, b[1] - b[2] * 0.3, b[2] * 0.35, '#ffffff', 0, 0.8); });
    s += body(c, td, sk, inner + (o.inner ? o.inner(c) : ''), 2.2);
    [[42, 46], [50, 39], [59, 35], [68, 33.5], [77, 35.5], [85, 41], [90, 49], [92, 58]].forEach(function (v) { s += C(v[0], v[1], 2.4, c.cel(lt(sk, 0.2)), 1.1); });
    s += L('M38,54 C46,40 62,32 80,36', RIM, 1.1, 0.6);
    s += body(c, 'M58,84 L88,82 L88,94 L83,102 L78,94 L72,104 L66,94 L60,100 Z', o.rag || '#4a4436', '', 1.6);
    s += limb('M62,88 L48,102 L54,113', sk, 9) + wolfFoot(c, [54, 113], [44, 121], sk);
    if (o.mid) s += o.mid(c);
    var hx = o.hx || 30, hy = o.hy || 60;
    s += limb('M' + pt([hx + 16, hy - 6]) + 'L' + pt([hx + 3, hy + 1]), dk(sk, 0.08), 9) + ghoulHead(c, hx, hy, o);
    s += limb(pd(na.slice(0, 2)), sk, (o.armW || 7) + 1) + limb(pd(na.slice(1)), sk, o.armW || 7) + claws4(c, na[2], o.nearAng, sk, o.clawLen || 11, 4.8);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  var MOBS = {
    plaguehound: function (c) {
      var b = BONE, bf = dk(b, 0.24), hide = '#5a5c40', o = shadow(c, 66, 50);
      o += C(66, 72, 46, glow(c, PLG, 0.22));
      var tail = 'M98,62 Q112,58 116,44 Q118,34 112,26';
      o += L(tail, OL, 5.6) + L(tail, bf, 3) + [[105, 59], [112, 52], [116, 42], [114, 32]].map(function (p) { return C(p[0], p[1], 2, c.cel(bf), 1); }).join('');
      o += boneLimb([[48, 70], [42, 94], [40, 114]], 3.2, bf) + dogPaw(c, 40, 120, bf);
      o += boneLimb([[92, 68], [104, 92], [100, 114]], 3.4, bf) + dogPaw(c, 100, 120, bf);
      o += F('M46,58 C60,55 78,55 88,61 C86,76 78,86 64,88 C54,86 48,76 46,58 Z', '#101608', 0.88) + C(64, 72, 17, glow(c, PLG, 0.8)) + C(64, 72, 3.6, PLGL, 0, 0.9);
      for (var i = 0; i < 6; i++) { var rx = 48 + i * 6.6, bot = 86 - Math.abs(i - 2.2) * 3.2, rd = 'M' + pt([rx + 2, 57]) + 'C' + pt([rx - 4, 63]) + ' ' + pt([rx - 4, bot - 8]) + ' ' + pt([rx + 3, bot]); o += L(rd, OL, 5) + L(rd, i % 2 ? dk(b, 0.06) : b, 2.6); }
      o += L('M46,74 Q56,86 68,88', OL, 4.4) + L('M46,74 Q56,86 68,88', bf, 2.2);
      o += P(shag(47, 60, 13, 11, 6, 0.35, 211), c.cel(hide), 1.6) + L('M40,64 l-2,6 M46,70 l-1,7 M54,68 l0,6', dk(hide, 0.35), 1.2);
      o += P(shag(92, 62, 13, 10, 6, 0.35, 212), c.cel(hide), 1.6) + E(90, 63, 3, 2, '#6a2a2a', 0, 0.8);
      var sp = 'M38,54 C48,50 62,52 78,56 C88,58 94,60 100,62';
      o += L(sp, OL, 7.4) + L(sp, b, 3.8);
      [[46, 51.4], [55, 51], [64, 52], [73, 54.2], [82, 57], [91, 59.6]].forEach(function (p, i) { var h = i < 3 ? 9 - i * 1.4 : 5; o += P(pd([[p[0] - 2.6, p[1] + 1], [p[0] + 1.8, p[1] - h], [p[0] + 3, p[1] + 1]], true), c.cel(b), 1.1); });
      o += P('M86,58 C90,52 102,52 106,58 L102,68 L92,68 Z', c.cel(b), 1.6) + C(96, 62, 2, OL, 0, 0.8);
      o += boneLimb([[52, 72], [46, 96], [36, 114]], 3.8, b) + dogPaw(c, 34, 121, b);
      o += boneLimb([[94, 66], [102, 94], [90, 114]], 4, b) + dogPaw(c, 90, 121, b);
      o += P('M44,54 C50,50 58,54 56,64 L48,70 Z', c.cel(b), 1.4);
      o += dogSkull(c, 32, 52, b);
      return o + motes(213, 8, 40, 100, 40, 90, PLGL);
    },
    diseased_ghoul: function (c) {
      return ghoulRig(c, {
        skin: '#a4ae94', rag: '#4a4436', eye: '#e8ff6a', hx: 30, hy: 62,
        near: [[46, 54], [34, 38], [24, 24]], nearAng: -PI / 2 - 0.55,
        far: [[76, 52], [80, 74], [68, 92]], farAng: PI / 2 + 0.5,
        top: function (c) { return ooze(c, 72, 64, 7, 0.7) + ooze(c, 46, 72, 6, 0.6); }
      });
    },
    skeletal_executioner: function (c) {
      var b = '#d8ceb0', hood = '#4a2228', axeP = [82, 92], ang = Math.atan2(46 - 92, 40 - 82);
      return skeleton(c, {
        bone: b, eye: '#c0ff5a', shadowR: 34, hx: 54, hy: 30,
        far: [[72, 50], [82, 64], [64, 72]], near: [[52, 50], [38, 60], [40, 47]],
        legF: [[70, 86], [78, 102], [76, 117]], legN: [[57, 88], [48, 103], [44, 117]],
        back: function (c) { return body(c, 'M52,44 C62,40 74,42 78,48 C84,66 88,90 92,112 L82,108 L76,114 L70,106 L64,112 C62,90 58,64 52,44 Z', hood, F('M74,46 L96,46 L96,116 L80,116 Z', '#000', 0.3), 2); },
        cloth: function (c) { return body(c, 'M48,78 L80,78 L84,104 L74,99 L66,108 L58,99 L46,104 Z', '#3a2e2a', F('M68,76 L88,76 L88,108 L70,108 Z', '#000', 0.25) + L('M52,90 L78,90', '#1e1814', 1.2), 1.8) + P('M47,76 L81,76 L81,82 L47,82 Z', c.cel('#4a3222'), 1.6) + R(59, 74.6, 8, 8, c.cel(DSTEEL), 1.3) + skullIcon(c, 63, 79, 0.5); },
        headX: function (c, x, y) {
          var hd = 'M' + pt([x - 12, y + 2]) + 'C' + pt([x - 14, y - 14]) + ' ' + pt([x - 4, y - 22]) + ' ' + pt([x + 4, y - 27]) + 'C' + pt([x + 10, y - 20]) + ' ' + pt([x + 14, y - 10]) + ' ' + pt([x + 13, y + 4]) + 'L' + pt([x + 17, y + 15]) + 'L' + pt([x + 9, y + 12]) + 'L' + pt([x + 6, y + 5]) + 'L' + pt([x + 2, y + 2]) + 'Z';
          return body(c, hd, hood, F(pd([[x + 3, y - 30], [x + 20, y - 30], [x + 20, y + 16], [x + 5, y + 16]], true), '#000', 0.35) + L('M' + pt([x - 12, y + 1]) + 'L' + pt([x + 3, y + 2]), '#5a1a1a', 1.4), 2) +
            E(x - 6, y - 3, 3, 2.4, '#050404') + glowEye(c, x - 6, y - 3, 1.4, '#c0ff5a') + E(x + 1.6, y - 3.4, 2.2, 2.2, '#050404') + glowEye(c, x + 1.6, y - 3.4, 1.1, '#c0ff5a') + L('M' + pt([x - 11, y - 12]) + 'C' + pt([x - 7, y - 20]) + ' ' + pt([x - 1, y - 24]) + ' ' + pt([x + 4, y - 26]), RIM, 1, 0.5);
        },
        top: function (c) { return greatAxe(c, axeP, 76, ang, 17) + C(64, 72, 3.8, c.cel(dk(b, 0.22)), 1.6) + C(40, 47, 3.8, c.cel(b), 1.6); }
      });
    },
    scourge_warder: function (c) {
      var b = '#d4ccb4', pl = '#4c5466', pl2 = '#363c4c', rune = '#7ae8ff', ban = '#3a2a5e';
      return G(skeleton(c, {
        bone: b, eye: rune, shadowR: 40, hx: 55, hy: 31,
        far: [[72, 50], [86, 56], [94, 46]], near: [[52, 52], [42, 64], [36, 74]],
        back: function (c) {
          var o = limb('M96,121 L96,8', '#3a3040', 2.6) + P(pd([[93, 9], [96, 1], [99, 9]], true), c.cel('#8a8e9a'), 1) + limb('M92,14 L122,14', '#3a3040', 1.8);
          var cd = pd([[98, 14], [121, 14], [121, 62], [114, 54], [109, 64], [104, 54], [98, 62]], true), ru = 'M104,22 l5,4 l-5,4 M114,24 l0,8 M104,36 l10,0 M109,36 l0,8 M104,48 l4,-3 l4,3 l4,-3';
          o += C(110, 36, 20, glow(c, rune, 0.35)) + body(c, cd, ban, F('M112,12 L124,12 L124,66 L112,66 Z', '#000', 0.25) + L('M100,16 L100,58 M119,16 L119,58', '#8a8eb0', 1.2), 1.6) + L(ru, rune, 1.4) + L(ru, '#ffffff', 0.5, 0.8);
          return o;
        },
        cloth: function (c) {
          return body(c, 'M45,47 C54,42 70,42 75,47 L73,66 C64,71 54,71 47,66 Z', pl, F('M64,40 L80,40 L80,72 L64,72 Z', dk(pl, 0.3), 0.8) + L('M50,58 Q60,62 70,58', dk(pl, 0.4), 1.2), 2) + skullIcon(c, 60, 55, 0.8) + C(60, 55, 6, glow(c, rune, 0.35));
        },
        hips: function (c) { return body(c, 'M48,80 L80,80 L82,96 L72,94 L64,98 L56,94 L46,96 Z', pl2, L('M48,87 L81,87', dk(pl2, 0.4), 1.2) + L('M64,80 L64,97', dk(pl2, 0.4), 1), 1.8); },
        front: function (c) { return P('M46,100 L58,100 L57,114 L47,114 Z', c.cel(pl), 1.6) + P(pd([[48, 100], [52, 94], [56, 100]], true), c.cel('#8a8e9a'), 1); },
        pads: function (c) {
          var sp = function (x, y, k) { return P(pd([[x - 3 * k, y - 4], [x - 1 * k, y - 15 * k], [x + 3 * k, y - 4]], true), c.cel('#b8b4a8'), 1.1); };
          return sp(76, 46, 0.9) + sp(84, 48, 0.8) + pauldron(c, 80, 50, 10, pl2, '#8a8eb0') + sp(40, 44, 1) + sp(48, 42, 1.1) + sp(56, 44, 0.9) + pauldron(c, 47, 52, 13, pl, '#8a8eb0');
        },
        headX: function (c, x, y) {
          var hm = 'M' + pt([x - 11, y - 3]) + 'C' + pt([x - 12, y - 17]) + ' ' + pt([x + 10, y - 20]) + ' ' + pt([x + 13, y - 6]) + 'L' + pt([x + 13, y + 4]) + 'L' + pt([x + 6, y - 1]) + 'L' + pt([x - 2, y - 5]) + 'L' + pt([x - 11, y - 1]) + 'Z';
          var hn = taper([[x + 4, y - 14], [x + 12, y - 22], [x + 22, y - 24], [x + 28, y - 34]], 6, 1.4, 5), hf = taper([[x - 4, y - 15], [x - 6, y - 24], [x - 2, y - 32], [x + 4, y - 38]], 5.6, 1.2, 5);
          return body(c, hf.d, '#c8c0ac', F(ribbonBand(hf, 0.55, 1), '#8a8474', 0.8), 1.4) + body(c, hm, pl, F(pd([[x + 2, y - 22], [x + 16, y - 22], [x + 16, y + 6], [x + 3, y + 6]], true), dk(pl, 0.35), 0.8) + L('M' + pt([x - 11, y - 7]) + 'L' + pt([x + 13, y - 7]), '#8a8eb0', 1.4), 2) + body(c, hn.d, '#d8d0bc', F(ribbonBand(hn, 0.55, 1), '#9a9484', 0.8), 1.4) + P(pd([[x - 9, y - 13], [x - 6, y - 21], [x - 3, y - 14]], true), c.cel('#8a8e9a'), 1);
        },
        wNearFront: function (c) {
          var sd = 'M12,56 L48,56 L48,92 C48,100 40,106 30,112 C20,106 12,100 12,92 Z';
          return body(c, sd, pl2, F('M32,52 L52,52 L52,114 L32,114 Z', dk(pl2, 0.35), 0.75) + L('M15,59 L45,59 L45,91 C45,98 38,103 30,108 C22,103 15,98 15,91 Z', '#8a8eb0', 1.6), 2.2) +
            C(30, 78, 14, glow(c, rune, 0.45)) + skullIcon(c, 30, 76, 1.3) + L('M20,64 l4,-3 l4,3 M34,64 l4,-3 l4,3 M22,96 l8,6 l8,-6', rune, 1.3) + [[16, 58], [44, 58], [16, 90], [44, 90]].map(function (p) { return C(p[0], p[1], 1.5, c.cel('#b8b4a8'), 0.8); }).join('');
        }
      }), at(1.02, 64, 122));
    },
    scarlet_sentinel: function (c) {
      var sk = '#dca884', mail = '#9ea2aa', lea = '#5a3a24';
      return G(biped(c, {
        skin: sk, shirt: mail, sleeve: mail, forearm: mail, glove: lea, pants: '#8a8e96', boots: '#4a3222', legW: 11, armW: 9.5, shadowR: 40, neckCol: mail, hx: 57, hy: 32,
        legN: 'M56,86 L45,101 L40,113', footN: [40, 121], legF: 'M69,86 L76,102 L78,113', footF: [79, 121],
        chest: function (c) { return L('M48,56 q3,2 6,0 q3,2 6,0 M48,64 q3,2 6,0 q3,2 6,0 M48,72 q3,2 6,0 q3,2 6,0 M72,56 q3,2 6,0 M72,64 q3,2 6,0 M72,72 q3,2 6,0', dk(mail, 0.35), 0.9); },
        front: function (c) { return tabard(c, RED, WHT, 108, true) + P('M50,80 L78,80 L78,86 L50,86 Z', c.cel(lea), 1.6) + R(60, 79, 8, 8, c.cel('#d8d0c0'), 1.2); },
        shins: function (c) { return L('M36,108 L48,108 M71,108 L83,108', '#3a2418', 2.4); },
        pads: function (c) { return pauldron(c, 81, 51, 9, STEEL, WHT) + pauldron(c, 47, 53, 11, STEEL, WHT); },
        head: function (c, x, y) { return wpHead(c, x, y, { skin: sk, hair: '#6a4a2a', hat: 'kettle', tache: '#6a4a2a', brow: '#5a3a1e' }); },
        far: [[80, 54], [92, 48], [94, 40]], farHand: gauntlet(lea),
        wFar: function (c, p) { return blade(c, [p[0], p[1] + 1], 36, -PI / 2 + 0.36, 3.2, '#d8dee6', '#4a2418'); },
        near: [[48, 56], [38, 66], [32, 70]], nearHand: gauntlet(lea),
        wNearFront: function (c, p) {
          var x = p[0] - 4, y = p[1] + 2, r = 19;
          return C(x, y, r + 2.4, c.cel(WHT), 2) + C(x, y, r - 1, c.cel(RED), 1.2) + F(ellD(x + 5, y + 4, r * 0.62, r * 0.7), REDD, 0.4) + sigil(c, x, y, 1.1, RED, WHT) + C(x - 9, y - 10, 1.8, '#ffffff', 0, 0.7);
        }
      }), at(1.03, 64, 122));
    },
    scarlet_lightsworn: function (c) {
      var sk = '#f0c6a2';
      return G(biped(c, {
        skin: sk, shirt: WHT, sleeve: WHT, forearm: WHT, glove: sk, noLegs: true, armW: 9, hx: 58, hy: 34, neckCol: sk,
        torsoD: 'M48,50 C54,45 74,45 80,50 L78,70 L77,88 L51,88 L50,70 Z',
        back: function (c) {
          var d = '';
          for (var i = 0; i < 12; i++) { var a = -PI / 2 + (i - 5.5) * 0.24; d += 'M' + pt([58 + Math.cos(a) * 22, 16 + Math.sin(a) * 22 + 18]) + 'L' + pt([58 + Math.cos(a) * 60, 34 + Math.sin(a) * 60]); }
          return C(58, 30, 58, glow(c, HOLY, 0.4)) + L(d, lt(HOLY, 0.3), 2.2, 0.55) + L(ellD(59, 30, 16, 16), OL, 4.2) + L(ellD(59, 30, 16, 16), GOLD, 2.4);
        },
        chest: function (c) { return F('M50,50 L60,50 L80,82 L70,86 Z', RED) + L('M50,50 L70,86 M60,50 L80,82', GOLD, 1.2) + L('M62,50 L62,86', dk(WHT, 0.25), 1); },
        front: function (c) {
          return robe(c, WHT, RED, { trimW: 4.4 }) + L('M40,108 L88,108', GOLD, 1.3) + L('M52,82 Q60,86 76,82', OL, 3.6) + L('M52,82 Q60,86 76,82', GOLD, 2) +
            L('M76,84 L80,96', '#8a7a4a', 1.2) + P(pd([[74, 96], [86, 96], [86, 108], [74, 108]], true), c.cel(REDD), 1.4) + L('M76,98 L84,98', GOLD, 1.2) + C(80, 102, 1.6, GOLD);
        },
        pads: function (c) { return P('M42,56 C40,44 54,40 64,42 C74,40 88,44 86,56 C80,62 72,62 64,58 C56,62 48,62 42,56 Z', c.cel(RED), 1.8) + L('M43,56 C48,61 56,61 64,57.4 C72,61 80,61 85,56', WHT, 1.6) + sigil(c, 64, 50, 0.4, RED); },
        head: function (c, x, y) { return wpHead(c, x, y, { skin: sk, hair: '#e8c060', hat: 'bob', brow: '#b8903a', glowEye: '#ffe890', open: true }); },
        near: [[48, 55], [38, 40], [44, 22]], far: [[80, 55], [86, 38], [74, 22]],
        top: function (c) { return holyOrb(c, 59, 13, 6.2) + C(59, 13, 14, glow(c, '#ffffff', 0.4)); }
      }), at(1.0, 64, 122));
    },
    rotting_behemoth: function (c) {
      var fl = '#a28e98', fl2 = dk(fl, 0.2), pa = '#8e9c84', pb = '#b89a8a', o = shadow(c, 64, 60);
      // bones and rusted spikes out of the back
      o += horn(c, 62, 26, 18, -PI / 2 - 0.35, '#d8d0b8', 3.2) + horn(c, 78, 22, 20, -PI / 2 + 0.1, '#c8c0a8', 3.4) + horn(c, 94, 30, 16, -PI / 2 + 0.6, '#d8d0b8', 3) + limb('M104,42 L116,24', '#7a4a2e', 2.6) + P(pd([[114, 22], [120, 16], [118, 26]], true), c.cel('#8a5a3a'), 1);
      // far arm, knuckles down behind
      o += limb('M94,48 L108,80 L104,104', fl2, 15) + C(104, 110, 11, c.cel(fl2), 2.2) + L('M96,112 l0,6 M102,114 l0,6 M108,114 l0,5', dk(fl2, 0.45), 1.3);
      o += limb('M86,96 L90,114', fl2, 13) + P('M82,121 L98,121 L98,113 L84,113 Z', c.cel(dk(fl2, 0.1)), 1.8);
      // the mass
      var bd = 'M20,70 C16,44 38,20 70,18 C98,16 118,34 118,62 C120,88 106,106 86,108 L50,110 C30,106 22,90 20,70 Z';
      var inner = F('M84,10 L126,10 L126,114 L88,114 C104,94 106,50 84,10 Z', dk(fl, 0.3), 0.85) + E(46, 32, 12, 6, lt(fl, 0.3), 0, 0.7);
      inner += F('M60,20 C76,16 96,22 104,38 L88,50 C80,40 70,34 58,34 Z', pa, 0.95) + F('M92,58 L118,54 L116,86 L96,84 Z', pb, 0.9) + F('M26,78 L44,72 L48,96 L30,98 Z', pa, 0.85);
      inner += stitchLine([[60, 34], [72, 34], [86, 46]]) + stitchLine([[92, 58], [96, 84]]) + stitchLine([[44, 72], [48, 96]]);
      // belly gash
      var gash = 'M40,84 C50,78 70,80 82,94 C70,98 52,98 40,84 Z';
      inner += C(60, 88, 20, glow(c, PLG, 0.6)) + P(gash, '#2a3a10', 1.6) + F('M44,85 C54,82 68,84 78,93 C68,95 54,94 44,85 Z', c.rg([[0, PLGL], [0.6, PLG], [1, '#3a7a1a']]));
      inner += stitchLine([[42, 83], [60, 80], [80, 92]], '#1a1010') + L('M52,82 l1,-4 M60,81 l0,-4 M68,83 l1,-4', OL, 1.2);
      inner += L('M20,56 C40,64 70,66 98,52', OL, 4.6) + '<path d="M20,56 C40,64 70,66 98,52" fill="none" stroke="#8a7a66" stroke-width="2.6" stroke-dasharray="4 2.4"/>';
      o += body(c, bd, fl, inner, 2.6);
      o += ooze(c, 58, 96, 10, 0.9) + ooze(c, 72, 97, 7, 0.7);
      // small withered third arm out of the chest
      o += limb('M44,64 L36,80 L40,92', dk(pb, 0.1), 5) + claws4(c, [40, 94], PI / 2 - 0.2, dk(pb, 0.1), 6, 3.2);
      // stumpy near leg
      o += limb('M56,100 L52,114', fl, 15) + P('M40,121 L62,121 L62,112 L44,112 Z', c.cel(dk(fl, 0.1)), 2);
      // small head sunk between the shoulders
      var hx = 34, hy = 44;
      o += E(hx + 4, hy + 11, 17, 6, dk(fl, 0.45), 0, 0.85);
      var hd = 'M' + pt([hx - 12, hy]) + 'C' + pt([hx - 12, hy - 13]) + ' ' + pt([hx + 8, hy - 15]) + ' ' + pt([hx + 12, hy - 3]) + 'L' + pt([hx + 12, hy + 7]) + 'C' + pt([hx + 6, hy + 13]) + ' ' + pt([hx - 8, hy + 13]) + ' ' + pt([hx - 14, hy + 7]) + 'Z';
      o += body(c, hd, pb, F(pd([[hx + 2, hy - 16], [hx + 16, hy - 16], [hx + 16, hy + 14], [hx + 2, hy + 14]], true), dk(pb, 0.28), 0.8), 2.2) + stitchLine([[hx - 10, hy - 6], [hx, hy - 10], [hx + 8, hy - 6]]);
      o += P('M' + pt([hx - 14, hy + 4]) + 'C' + pt([hx - 8, hy + 10]) + ' ' + pt([hx + 2, hy + 10]) + ' ' + pt([hx + 6, hy + 6]) + 'L' + pt([hx + 4, hy + 12]) + 'C' + pt([hx - 4, hy + 15]) + ' ' + pt([hx - 12, hy + 14]) + ' ' + pt([hx - 15, hy + 9]) + 'Z', c.cel(lt(pb, 0.05)), 1.4);
      o += P(pd([[hx - 13, hy + 5], [hx - 12, hy], [hx - 10, hy + 5]], true), '#f0e8cc', 0.9) + P(pd([[hx - 4, hy + 6.6], [hx - 3, hy + 1.6], [hx - 1.4, hy + 6.4]], true), '#f0e8cc', 0.9);
      o += glowEye(c, hx - 8, hy - 2, 2.2, '#e8ff5a') + C(hx + 1, hy - 3, 1.3, '#e8e0a0', 0.9);
      // huge near arm, fist on the ground, sewn on at the shoulder
      o += limb('M40,46 L20,76', lt(fl, 0.04), 17) + limb('M20,76 L18,100', pa, 17) + stitchLine([[10, 78], [30, 76]]) + stitchLine([[34, 40], [48, 52]]);
      o += C(18, 108, 13, c.cel(pa), 2.4) + L('M8,110 l0,7 M14,112 l0,7 M20,112 l0,7 M26,110 l0,6', dk(pa, 0.45), 1.4) + E(12, 102, 4, 2.4, lt(pa, 0.3), 0, 0.7);
      return o + motes(221, 10, 20, 110, 10, 60, '#2a2a1a') + motes(222, 6, 40, 90, 70, 100, PLGL);
    },
    foulmane: function (c) {
      var sk = '#8e9a80', mane = '#2a2e20';
      return ghoulRig(c, {
        skin: sk, rag: '#3a2e26', eye: '#ff6a3a', hx: 30, hy: 50, roar: true, scars: true, sores: false, armW: 8.5, clawLen: 13, shadowR: 46,
        near: [[48, 62], [36, 84], [24, 98]], nearAng: PI / 2 + 0.7,
        far: [[78, 48], [96, 38], [106, 22]], farAng: -PI / 2 + 0.25,
        inner: function (c) { return L('M44,58 L70,80 M60,46 L84,64', '#c87070', 1.8) + L('M48,58 l3,-2 M54,63 l3,-2 M60,68 l3,-2 M66,73 l3,-2 M64,48 l3,-2 M70,53 l3,-2 M76,58 l3,-2', '#5a2020', 1); },
        mid: function (c) {
          var sp = [[26, 44], [34, 30], [40, 40], [48, 22], [52, 36], [62, 18], [64, 32], [76, 18], [76, 32], [88, 24], [86, 38], [98, 36], [92, 48], [102, 54], [92, 58], [84, 50], [70, 42], [56, 44], [44, 50], [34, 54]];
          var md = 'M' + pt(sp[0]); for (var i = 1; i < sp.length; i++) md += (i % 2 ? 'L' : 'Q' + pt([(sp[i - 1][0] + sp[i][0]) / 2 + 1, (sp[i - 1][1] + sp[i][1]) / 2 + 2]) + ' ') + pt(sp[i]);
          return body(c, md + 'Z', mane, L('M36,42 L46,30 M50,38 L60,24 M64,34 L74,22 M78,34 L86,28 M88,44 L96,40', lt(mane, 0.25), 1.2, 0.8) + F('M60,40 L110,40 L110,60 L60,60 Z', dk(mane, 0.35), 0.6), 1.8);
        },
        top: function (c) { return L('M8,44 l-5,-2 M10,52 l-6,0 M12,60 l-5,2', '#f0e8d0', 1.3, 0.8); },
        tf: at(1.1, 64, 122)
      });
    },
    araj_the_summoner: function (c) {
      var rb = '#46305e', rb2 = dk(rb, 0.25), tr = '#c8a048', b = '#d8d2c0', o = '';
      o += E(64, 122, 48, 7, c.rg([[0, FROST, 0.4], [0.6, FROST, 0.15], [1, FROST, 0]])) + shadow(c, 64, 36) + C(62, 62, 64, glow(c, FROST, 0.3));
      // skull staff (far hand)
      o += limb('M100,120 L96,16', '#4a3a4a', 3.2) + L('M100,120 L96,16', '#7a6a7a', 1, 0.6) + C(96, 12, 16, glow(c, FROST, 0.75)) + flame(c, 96, 6, 0.55, '#6ac8ff', '#e8f8ff');
      o += skullIcon(c, 96, 14, 1.4) + L('M88,20 C90,26 102,26 104,20', OL, 3) + L('M88,20 C90,26 102,26 104,20', '#8a7a8a', 1.6) + E(93.4, 13.4, 1.4, 1.4, FROST) + E(98.6, 13.4, 1.4, 1.4, FROST);
      // high spiked collar behind the head
      o += body(c, pd([[40, 50], [34, 22], [46, 36], [50, 14], [58, 32], [66, 12], [72, 32], [82, 16], [84, 38], [92, 26], [88, 52]], true), '#2e2240', F('M66,8 L96,8 L96,56 L66,56 Z', '#000', 0.3), 1.8);
      // far sleeve + bone hand on the staff
      o += limb('M82,52 L92,62', rb2, 11) + limb('M92,62 L96,58', b, 3.2) + C(96, 58, 4.2, c.cel(b), 1.6) + L('M93,56 l6,0 M93,59 l6,0', dk(b, 0.4), 0.8);
      // robe, hovering, tattered hem
      var rd = 'M44,48 C50,42 78,42 86,48 C92,70 100,92 104,106 L96,102 L90,112 L82,104 L72,114 L64,104 L54,112 L48,102 L34,108 C38,90 40,70 44,48 Z';
      var ru = 'M58,66 l3,-3 l3,3 M58,76 l6,0 M61,76 l0,5 M58,88 l3,3 l3,-3 M58,98 l6,-3';
      o += body(c, rd, rb, F('M70,40 L110,40 L110,116 L84,116 C88,90 82,66 70,40 Z', dk(rb, 0.35), 0.8) + F('M54,50 L70,50 L74,108 L50,108 Z', lt(rb, 0.12), 0.9) + L('M54,50 L50,108 M70,50 L74,108', tr, 1.6) + L(ru, FROST, 1.4) + L(ru, '#ffffff', 0.5, 0.8), 2.2);
      o += L('M34,108 L48,102 L54,112 L64,104 L72,114 L82,104 L90,112 L96,102 L104,106', FROST, 1.2, 0.7) + E(68, 118, 30, 3, FROST, 0, 0.25);
      // belt, phylactery
      o += P('M46,72 L82,72 L82,78 L46,78 Z', c.cel('#2e2240'), 1.4) + C(62, 84, 7, glow(c, PLG, 0.7)) + P(pd([[62, 78], [66, 84], [62, 91], [58, 84]], true), c.cel(PLG), 1.2) + L('M60,76 L62,78 L64,76', tr, 1);
      // spiked pauldrons
      o += P(pd([[72, 46], [78, 30], [82, 44]], true), c.cel('#8a8aa0'), 1.2) + pauldron(c, 80, 49, 10, '#5a5a74', tr) + P(pd([[38, 44], [34, 26], [46, 40]], true), c.cel('#9a9ab0'), 1.2) + P(pd([[46, 42], [48, 24], [54, 40]], true), c.cel('#9a9ab0'), 1.2) + pauldron(c, 46, 50, 13, '#5a5a74', tr);
      // skull + crown
      o += skullHead(c, 60, 32, { bone: b, eye: FROST });
      var cr = pd([[49, 22], [48, 10], [53, 17], [56, 6], [60, 16], [64, 5], [67, 16], [72, 9], [71, 22]], true);
      o += P(cr, c.cel(tr), 1.4) + L('M49,21 L71,21', dk(tr, 0.35), 1.2) + C(56, 19, 1.6, FROST, 0.6) + C(64, 18.6, 1.9, FROST, 0.6);
      // near arm casting cold magic
      o += limb('M48,56 L32,64', rb2, 12) + limb('M32,64 L22,58', b, 3.2) + C(21, 57, 4, c.cel(b), 1.6) + L('M18,54 l-3,-3 M20,52 l-1,-4 M23,52 l1,-4', OL, 2.6) + L('M18,54 l-3,-3 M20,52 l-1,-4 M23,52 l1,-4', b, 1.3);
      var sw = 'M8,40 C2,48 10,58 18,52 C24,46 16,38 12,44';
      o += orb(c, 14, 44, 6, FROST) + L(sw, FROSTL, 1.4, 0.9) + P(pd([[4, 60], [8, 54], [10, 62]], true), c.cel(FROSTL), 0.8) + P(pd([[22, 34], [26, 28], [27, 36]], true), c.cel(FROSTL), 0.8);
      return o + motes(231, 16, 6, 120, 6, 118, FROSTL);
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel('#7a8a4a'), 2.5); }
  function phScene(c) { return sky(c, '#4c5240', '#8a8e64', '#b6b486') + ground(c, 118, '#76783c', '#464924'); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#7a8a4a"/></svg>'; }
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
