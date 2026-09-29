/* art_tidecrown.js — the Tidecrown Citadel art for Realm of Loner (raid, level 60, the finale of the original expansion
 * "The Drowned Crown": Prince Aeldran's Starborn citadel, drowned ten thousand years and risen in the surf of the
 * Stormveil Reach, and the abyss beneath it where Nal'veshra the Deepmother waits).
 *   scenes  citadel_court     the drowned courtyard: fallen statues of elf knights, a waterfall from the great arch
 *           citadel_throne    the coral throne room: the pearl-and-coral throne, royal kelp banners, shafts of light
 *           citadel_abyss     the chasm under the citadel: ruins falling into the dark, bioluminescence, a lit ledge
 *           drowned_causeway  the long elven causeway through the surf, broken in places, the citadel far ahead
 *           tidecrown_gate    the great gate at the end of the causeway, spires above, surf spraying
 *   mobs    tidecrown_guard, tidecrown_tidecaller, abyssal_spawn, commander_serathis, tide_twin_myrel,
 *           tide_twin_sorin, coralheart_colossus, prince_aeldran, nalveshra
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the keys
 * above and fall through to the previous functions for every other key (prototype keys included). Keys are appended
 * to ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the robe rig are shared copies of art_scholomance.js; the bezier ribbon is a copy of
 * art_story2.js. Prince Aeldran and Nal'veshra are the story actors of art_story2.js redrawn as combat sprites.
 * The drowned elves share one look: pale sea-green skin, teal glowing eyes, white hair floating up as if underwater,
 * coral, pearl and barnacle accents, crescent-moon motifs. They are kept apart from the naga (no serpent tails) and
 * from the pale-blue Starborn ghosts. The Twin Tides are a pair: the same face, hair and teal cloth; Myrel is gold
 * with water rising round her, Sorin is silver with water falling round her.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix tc<counter>_).
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
  function Ctx() { this.p = 'tc' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  function pauldron(c, x, y, r, col, trim) {
    col = col || '#b8bec8';
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
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

  // ---- bezier ribbons (shared copy of art_story2.js): hair locks, kelp, tentacles, water ----
  function bz(q, t) {
    var u = 1 - t;
    return [u * u * u * q[0][0] + 3 * u * u * t * q[1][0] + 3 * u * t * t * q[2][0] + t * t * t * q[3][0],
      u * u * u * q[0][1] + 3 * u * u * t * q[1][1] + 3 * u * t * t * q[2][1] + t * t * t * q[3][1]];
  }
  function btaper(q, w0, w1, N, wave) {
    N = N || 22; var Lf = [], Rt = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, p = bz(q, t), a = bz(q, Math.max(0, t - 0.01)), b = bz(q, Math.min(1, t + 0.01));
      var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / len, ny = dx / len, w = (w0 + (w1 - w0) * t) / 2;
      if (wave) { var s = Math.sin(t * PI * wave[0] + (wave[2] || 0)) * wave[1] * t; p = [p[0] + nx * s, p[1] + ny * s]; }
      Lf.push([p[0] + nx * w, p[1] + ny * w]); Rt.push([p[0] - nx * w, p[1] - ny * w]);
    }
    return pd(Lf.concat(Rt.reverse()), true);
  }
  function bline(q, N, off) { var p = [], i; N = N || 12; off = off || [0, 0]; for (i = 0; i <= N; i++) { var b = bz(q, i / N); p.push([b[0] + off[0], b[1] + off[1]]); } return 'M' + p.map(pt).join('L'); }

  // ============================================================
  //  TIDECROWN: palette (drowned elves match art_story2.js: aeldran)
  // ============================================================
  var SK = '#a4d6c2', HAIR = '#eef6f3', EYE = '#62f6e8', TEAL = '#46f2dc', VIO = '#a266f2';
  var ROBE = '#1c4c5e', ROBE2 = '#2c7674', GOLD = '#c2a452', GOLDL = '#e4cf8a', GOLDD = '#7e6a2e', VERD = '#5aae98', ARM = '#3c7c74';
  var CORAL = '#ea6a50', CORALO = '#f09a4a', CORALP = '#c46ad8', CORALR = '#e0567e', PEARL = '#f6f2ea', KELP = '#4f7030', BARN = '#cdc8b6', SILV = '#cfe2e0';
  var ST = '#5f8584', STL = '#8eb0aa', STD = '#34504f', STAT = '#a9c2bc';
  var SEA = '#1e5a6a', SEAL = '#3a8a96', FOAM = '#e8fbff', NAVY = '#101b2e', NAVL = '#26446a', DEEP = '#04070d';
  var CORALS = [CORAL, CORALO, CORALP, CORALR];

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // crescent moon, horns to the right (x, y = centre of the outer circle)
  function crescentD(x, y, r) {
    return 'M' + pt([x + r * 0.3, y - r * 0.95]) + 'A' + n(r) + ',' + n(r) + ' 0 1,0 ' + pt([x + r * 0.3, y + r * 0.95]) + 'A' + n(r * 1.1) + ',' + n(r * 1.1) + ' 0 0,1 ' + pt([x + r * 0.3, y - r * 0.95]) + 'Z';
  }
  // crescent turned so its horns point up (a cradle), with a pearl in it
  function moonPearl(c, x, y, r, col, lit) {
    var o = lit ? C(x, y - r * 0.3, r * 2.6, glow(c, '#c8fff4', 0.55)) : '';
    o += G(P(crescentD(x, y, r), c.cel(col || GOLD), Math.max(0.8, r * 0.14)), 'rotate(-90 ' + n(x) + ' ' + n(y) + ')');
    return o + C(x, y - r * 0.18, r * 0.42, c.rg([[0, '#ffffff'], [0.6, PEARL], [1, '#a8d0c8']]), Math.max(0.6, r * 0.1));
  }
  function barn(c, x, y, r) { return E(x, y, r, r * 0.82, c.cel(BARN), Math.max(0.6, r * 0.34)) + E(x, y - r * 0.12, r * 0.42, r * 0.32, dk(BARN, 0.55)); }
  function bubble(x, y, r) { return '<ellipse cx="' + n(x) + '" cy="' + n(y) + '" rx="' + n(r) + '" ry="' + n(r) + '" fill="#dffcff" fill-opacity="0.16" stroke="#c8fff8" stroke-width="0.7" stroke-opacity="0.8"/>' + C(x - r * 0.35, y - r * 0.35, r * 0.28, '#ffffff', 0, 0.8); }
  function bubbles(seed, cnt, x0, x1, y0, y1, s) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += bubble(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), (0.8 + r() * 1.6) * (s || 1)); return o; }
  // branching coral (x, y = root)
  function coralBranch(c, x, y, h, lean, col, seed, w) {
    var r = rng(seed || 11), tx = x + lean, ty = y - h, d = 'M' + pt([x, y]) + 'Q' + pt([x + lean * 0.2, y - h * 0.5]) + ' ' + pt([tx, ty]);
    var k = 3 + Math.floor(r() * 2);
    for (var i = 0; i < k; i++) {
      var t = 0.28 + 0.55 * (i / k) + r() * 0.08, bx = x + lean * (0.4 * t * (1 - t) + t * t), by = y - h * t, side = i % 2 ? 1 : -1, bl = h * (0.24 + r() * 0.18);
      d += 'M' + pt([bx, by]) + 'q' + n(side * bl * 0.55) + ',' + n(-bl * 0.2) + ' ' + n(side * bl * 0.6 + lean * 0.12) + ',' + n(-bl);
    }
    col = col || CORAL; w = w || 2.4;
    return L(d, OL, w + 1.8) + L(d, col, w) + L(d, lt(col, 0.45), w * 0.32, 0.8);
  }
  // brain coral dome (x = centre, y = base)
  function brain(c, x, y, rx, ry, col) {
    var d = 'M' + pt([x - rx, y]) + 'C' + pt([x - rx, y - ry * 1.33]) + ' ' + pt([x + rx, y - ry * 1.33]) + ' ' + pt([x + rx, y]) + 'Z', m = '', st = rx / 3.4;
    for (var k = 0; k < 2; k++) { var yy = y - ry * (0.3 + k * 0.34), x0 = x - rx * (0.74 - k * 0.2); m += 'M' + pt([x0, yy]) + 'q' + n(st / 2) + ',' + n(-ry * 0.2) + ' ' + n(st) + ',0'; for (var j = 0; j < 5 - k * 2; j++) m += 't' + n(st) + ',0'; }
    return P(d, c.cel(col), Math.max(0.9, rx * 0.12)) + L(m, dk(col, 0.4), Math.max(0.6, rx * 0.08), 0.9);
  }
  // fan coral: a lattice fan on a short stalk
  function fanCoral(c, x, y, s, col) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, d = 'M' + pt(q(-2, 0)) + 'C' + pt(q(-18, -6)) + ' ' + pt(q(-20, -26)) + ' ' + pt(q(-8, -32)) + 'C' + pt(q(-2, -36)) + ' ' + pt(q(6, -34)) + ' ' + pt(q(12, -28)) + 'C' + pt(q(20, -20)) + ' ' + pt(q(14, -6)) + ' ' + pt(q(2, 0)) + 'Z';
    var lat = 'M' + pt(q(0, 0)) + 'L' + pt(q(-12, -28)) + 'M' + pt(q(0, 0)) + 'L' + pt(q(-2, -33)) + 'M' + pt(q(0, 0)) + 'L' + pt(q(10, -27)) + 'M' + pt(q(-15, -14)) + 'Q' + pt(q(0, -20)) + ' ' + pt(q(14, -14)) + 'M' + pt(q(-12, -24)) + 'Q' + pt(q(0, -30)) + ' ' + pt(q(12, -24));
    return P(d, c.lg([[0, lt(col, 0.2)], [1, dk(col, 0.25)]]), 1.3 * s) + L(lat, dk(col, 0.45), 0.9 * s, 0.9);
  }
  function coralClump(c, x, y, s, seed) {
    var r = rng(seed), o = E(x, y + 1, 18 * s, 3 * s, '#000', 0, 0.3);
    o += fanCoral(c, x + 8 * s, y, 0.7 * s, CORALS[Math.floor(r() * 4)]);
    for (var i = 0; i < 3; i++) o += coralBranch(c, x - 10 * s + i * 7 * s, y, (12 + r() * 12) * s, (r() - 0.5) * 12 * s, CORALS[Math.floor(r() * 4)], seed + i, 2.1 * s);
    o += brain(c, x - 3 * s, y + 1, 8 * s, 5 * s, CORALS[Math.floor(r() * 4)]) + barn(c, x + 12 * s, y - 1, 2 * s);
    return o;
  }
  function kelp(c, x, y, h, sway, w, col) {
    col = col || KELP;
    return P(btaper([[x, y], [x + sway, y - h * 0.33], [x - sway, y - h * 0.66], [x + sway * 0.6, y - h]], w || 4, 0.8, 16, [3, 1.6]), c.lg([[0, lt(col, 0.25)], [1, dk(col, 0.2)]], 0, 0, 1, 0), 1);
  }
  // hanging royal banner woven of kelp (x = centre, y = rod)
  function kelpBanner(c, x, y, w, h, seed) {
    var r = rng(seed), x0 = x - w / 2, x1 = x + w / 2, bot = [], k = 6, i;
    for (i = 0; i <= k; i++) bot.push([x1 - w * i / k, y + h - (i % 2 ? 4 + r() * 7 : r() * 3)]);
    var d = pd([[x0, y], [x1, y]].concat(bot), true), col = '#35582a';
    var o = body(c, d, col, F(pd([[x + w * 0.18, y], [x1 + 2, y], [x1 + 2, y + h + 2], [x + w * 0.18, y + h + 2]], true), dk(col, 0.3), 0.7) +
      L('M' + pt([x0 + 3, y + 2]) + 'L' + pt([x0 + 3, y + h - 4]) + 'M' + pt([x1 - 3, y + 2]) + 'L' + pt([x1 - 3, y + h - 4]), GOLD, 1.2, 0.9) +
      L('M' + pt([x - w * 0.2, y + 4]) + 'Q' + pt([x - w * 0.24, y + h * 0.5]) + ' ' + pt([x - w * 0.18, y + h - 6]) + 'M' + pt([x + w * 0.22, y + 4]) + 'Q' + pt([x + w * 0.18, y + h * 0.5]) + ' ' + pt([x + w * 0.24, y + h - 6]), dk(col, 0.35), 1), 1.5);
    o += moonPearl(c, x, y + h * 0.36, w * 0.24, GOLD, true);
    for (i = 0; i < 3; i++) { var sx = x0 + w * (0.2 + i * 0.3); o += P(btaper([[sx, y + h - 4], [sx + 2, y + h + 4], [sx - 2, y + h + 10], [sx + 1, y + h + 16 + r() * 6]], 2.6, 0.6, 10), c.cel(KELP), 0.8); }
    return R(x0 - 5, y - 2.5, w + 10, 4, c.cel(GOLD), 1.1) + C(x0 - 5, y - 0.5, 2.4, c.cel(PEARL), 0.9) + C(x1 + 5, y - 0.5, 2.4, c.cel(PEARL), 0.9) + o;
  }
  // elven arch: tall sides, a soft point at the top (x = left, y = bottom)
  function elfArchD(x, y, w, h) {
    var s = y - h + w * 0.55;
    return 'M' + pt([x, y]) + 'L' + pt([x, s]) + 'C' + pt([x, y - h + w * 0.18]) + ' ' + pt([x + w * 0.32, y - h + w * 0.03]) + ' ' + pt([x + w / 2, y - h]) + 'C' + pt([x + w * 0.68, y - h + w * 0.03]) + ' ' + pt([x + w, y - h + w * 0.18]) + ' ' + pt([x + w, s]) + 'L' + pt([x + w, y]) + 'Z';
  }
  function ashlar(c, x0, y0, x1, y1, col, seed, bh, bw) {
    var r = rng(seed), jn = '', sh = '', row = 0;
    for (var y = y0; y < y1; y += bh, row++) {
      var hh = Math.min(bh, y1 - y);
      jn += 'M' + n(x0) + ',' + n(y) + 'L' + n(x1) + ',' + n(y);
      for (var x = x0 - (row % 2 ? bw / 2 : 0); x < x1; x += bw) { jn += 'M' + n(x) + ',' + n(y) + 'l0,' + n(hh); if (r() < 0.24 && x > x0) sh += R(x + 1, y + 1, Math.min(bw - 2, x1 - x - 1), hh - 2, r() < 0.5 ? dk(col, 0.1) : lt(col, 0.07)); }
    }
    return R(x0, y0, x1 - x0, y1 - y0, col) + sh + L(jn, dk(col, 0.35), 1, 0.75);
  }
  // slender elven column with a leaf capital, coral climbing it (x = left, y = floor)
  function column(c, x, y, w, h, seed, col) {
    col = col || STL;
    var r = rng(seed), o = body(c, pd([[x, y], [x + w, y], [x + w, y - h], [x, y - h]], true), col, F(pd([[x + w * 0.6, y - h - 2], [x + w + 2, y - h - 2], [x + w + 2, y + 2], [x + w * 0.6, y + 2]], true), dk(col, 0.36), 0.8) +
      L('M' + pt([x + w * 0.3, y - h]) + 'L' + pt([x + w * 0.3, y]) + 'M' + pt([x + w * 0.62, y - h]) + 'L' + pt([x + w * 0.62, y]), dk(col, 0.3), 1) + R(x, y - 34, w, 34, '#2e5a3a', 0) + R(x, y - 36, w, 3, '#3e6a44', 0), 1.8);
    // leaf capital and base
    o += P('M' + pt([x - 5, y - h]) + 'C' + pt([x - 8, y - h - 6]) + ' ' + pt([x + 2, y - h - 10]) + ' ' + pt([x + w / 2, y - h - 6]) + 'C' + pt([x + w - 2, y - h - 10]) + ' ' + pt([x + w + 8, y - h - 6]) + ' ' + pt([x + w + 5, y - h]) + 'Z', c.cel(lt(col, 0.08)), 1.6);
    o += body(c, pd([[x - 4, y], [x + w + 4, y], [x + w + 2, y - 8], [x - 2, y - 8]], true), dk(col, 0.1), '', 1.6);
    o += coralBranch(c, x + 2, y - 8, 20 + r() * 10, -6, CORALS[Math.floor(r() * 4)], seed + 1, 2) + barn(c, x + w * 0.4, y - 16, 2) + barn(c, x + w * 0.7, y - 22, 1.6) + barn(c, x + w * 0.3, y - 44 - r() * 20, 1.8);
    return o;
  }
  // water pouring down (x = centre)
  function waterfall(c, x, y0, y1, w, seed) {
    var r = rng(seed), o = C(x, y1 - 6, w * 1.3, glow(c, '#c8fff8', 0.4));
    o += R(x - w / 2, y0, w, y1 - y0, c.lg([[0, '#9ae8e8', 0.8], [0.35, '#e8ffff', 0.92], [0.7, '#5ac0cc', 0.85], [1, '#bff4f4', 0.8]], 0, 0, 1, 0));
    var st = '';
    for (var i = 0; i < 9; i++) { var xx = x - w / 2 + 2 + r() * (w - 4), a = y0 + r() * 12; st += 'M' + pt([xx, a]) + 'L' + pt([xx + (r() - 0.5) * 2, y1 - 6 - r() * 20]); }
    o += L(st, '#ffffff', 1.1, 0.7) + L('M' + pt([x - w / 2, y0]) + 'L' + pt([x - w / 2, y1]) + 'M' + pt([x + w / 2, y0]) + 'L' + pt([x + w / 2, y1]), '#2a7a88', 1.2, 0.7);
    for (var j = 0; j < 7; j++) o += E(x + (r() - 0.5) * w * 1.3, y1 - 2 - r() * 6, 5 + r() * 6, 3 + r() * 2, FOAM, 0, 0.8);
    return o;
  }
  function puddle(c, x, y, rx, ry, tint) {
    tint = tint || SEAL;
    return E(x, y, rx, ry, c.lg([[0, lt(tint, 0.35), 0.75], [1, dk(tint, 0.15), 0.6]]), 0) + L('M' + pt([x - rx * 0.55, y - ry * 0.25]) + 'l' + n(rx * 0.5) + ',0 M' + pt([x + rx * 0.1, y + ry * 0.2]) + 'l' + n(rx * 0.3) + ',0', '#ffffff', 1, 0.55);
  }
  function wetFloor(c, y, col, seed, vx) {
    var o = flagFloor(c, y, vx == null ? 200 : vx, col, seed) + R(0, y - 2, 400, 8, c.lg([[0, '#000', 0.35], [1, '#000', 0]]));
    return o + R(-2, y, 404, 242 - y, c.lg([[0, '#bff4f0', 0.1], [0.3, '#bff4f0', 0], [0.6, '#bff4f0', 0.07], [1, '#bff4f0', 0]]));
  }
  function clouds(seed, y0, y1, col, op, cnt) { var r = rng(seed), o = ''; for (var i = 0; i < (cnt || 8); i++) { var x = r() * 440 - 20, y = y0 + r() * (y1 - y0), w = 40 + r() * 70; o += E(x, y, w, w * 0.2, col, 0, op * (0.6 + r() * 0.4)); } return o; }
  function waves(c, y, amp, step, col, op, seed) {
    var r = rng(seed), d = 'M-4,' + n(y), wc = '';
    for (var x = -4; x < 404; x += step) { d += 'q' + n(step / 2) + ',' + n(-amp * (0.6 + r() * 0.8)) + ' ' + n(step) + ',0'; if (r() < 0.35) wc += 'M' + pt([x + step * 0.25, y - amp * 0.5]) + 'q' + n(step * 0.25) + ',' + n(-amp * 0.6) + ' ' + n(step * 0.5) + ',0'; }
    return L(d, col, 1.2, op) + L(wc, FOAM, 1.2, Math.min(1, op + 0.2));
  }
  // foam plume where the surf hits stone (x = centre, y = base)
  function spray(c, x, y, s, seed) {
    var r = rng(seed), o = C(x, y - 26 * s, 34 * s, glow(c, '#e8ffff', 0.35));
    for (var i = 0; i < 12; i++) { var t = r(), yy = y - t * 52 * s, xx = x + (r() - 0.5) * (18 + t * 34) * s, rr = (4 + (1 - t) * 7 + r() * 3) * s; o += C(xx, yy, rr, i % 3 ? FOAM : '#bfeaf0', 0, 0.55 + r() * 0.35); }
    for (var j = 0; j < 10; j++) { var a = -PI / 2 + (r() - 0.5) * 2.2, dd = (30 + r() * 30) * s; o += C(x + Math.cos(a) * dd, y - 24 * s + Math.sin(a) * dd, (0.8 + r() * 1.2) * s, '#ffffff', 0, 0.85); }
    return o;
  }
  // elven lamp: slim post, a crescent cradling a glowing pearl (x = centre, y = floor)
  function pearlLamp(c, x, y, s, h, broken) {
    h = (h || 40) * s;
    var o = E(x, y + 1, 8 * s, 2 * s, '#000', 0, 0.35), top = y - h;
    o += P(pd([[x - 4 * s, y], [x + 4 * s, y], [x + 2.4 * s, y - 5 * s], [x - 2.4 * s, y - 5 * s]], true), c.cel(STL), 1.1 * s);
    o += L('M' + pt([x, y - 4 * s]) + 'L' + pt([x, broken ? y - h * 0.55 : top]), OL, 4.2 * s) + L('M' + pt([x, y - 4 * s]) + 'L' + pt([x, broken ? y - h * 0.55 : top]), STL, 2.2 * s) + barn(c, x - 0.5 * s, y - 10 * s, 1.4 * s);
    if (broken) return o + P(pd([[x - 2 * s, y - h * 0.55], [x + 2 * s, y - h * 0.55 - 3 * s], [x + 1 * s, y - h * 0.55 + 1 * s]], true), STL, 0.8 * s);
    return o + moonPearl(c, x, top - 2 * s, 7 * s, GOLD, true);
  }
  // slender elven spire (x = centre, base), needle roof with a flared collar
  function spireD(x, base, w, h) {
    return pd([[x - w / 2, base], [x - w / 2, base - h * 0.56], [x - w * 0.8, base - h * 0.58], [x - w * 0.46, base - h * 0.64], [x - w * 0.1, base - h * 0.96], [x, base - h], [x + w * 0.1, base - h * 0.96], [x + w * 0.46, base - h * 0.64], [x + w * 0.8, base - h * 0.58], [x + w / 2, base - h * 0.56], [x + w / 2, base]], true);
  }
  function spire(c, x, base, w, h, col, lit, sw) {
    var o = P(spireD(x, base, w, h), c.lg([[0, lt(col, 0.1)], [0.5, col], [1, dk(col, 0.3)]], 0, 0, 1, 0), sw == null ? 1.4 : sw);
    if (lit) { for (var i = 0; i < 3; i++) { var yy = base - h * (0.18 + i * 0.13); o += C(x, yy, w * 0.5, glow(c, '#bffff0', 0.4)) + R(x - w * 0.12, yy - w * 0.2, w * 0.24, w * 0.34, '#d8fff6', 0); } o += C(x, base - h, w * 0.9, glow(c, '#dffff8', 0.7)) + C(x, base - h * 0.62, w * 0.18, PEARL); }
    return o;
  }
  // stone elf knight statue on a plinth, trident arm snapped off (x = centre, y = floor)
  function statue(c, x, y, s, col, seed) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, st = col || STAT, o = E(x, y + 1, 22 * s, 3 * s, '#000', 0, 0.35), r = rng(seed || 5);
    o += body(c, pd([q(-18, 0), q(18, 0), q(18, -12), q(-18, -12)], true), dk(st, 0.14), F(pd([q(6, -14), q(20, -14), q(20, 2), q(6, 2)], true), dk(st, 0.4), 0.7) + R(q(-18, -5)[0], q(0, -5)[1], 36 * s, 5 * s, '#3e6a44', 0), 1.6 * s);
    o += body(c, pd([q(-20, -12), q(20, -12), q(17, -16), q(-17, -16)], true), st, '', 1.4 * s);
    o += body(c, pd([q(-9, -16), q(-2, -16), q(-3, -40), q(-9, -40)], true), dk(st, 0.1), '', 1.4 * s) + body(c, pd([q(2, -16), q(9, -16), q(9, -40), q(3, -40)], true), dk(st, 0.18), '', 1.4 * s);
    o += body(c, pd([q(-12, -40), q(12, -40), q(14, -66), q(-14, -66)], true), st, F(pd([q(3, -68), q(16, -68), q(16, -38), q(3, -38)], true), dk(st, 0.3), 0.7) + L('M' + pt(q(-8, -60)) + 'L' + pt(q(0, -50)) + 'L' + pt(q(8, -60)), dk(st, 0.35), 1 * s), 1.5 * s);
    o += body(c, pd([q(-14, -42), q(14, -42), q(16, -34), q(-16, -34)], true), dk(st, 0.06), '', 1.3 * s);
    // the snapped trident arm: an upper arm stub and the broken shaft lying at the foot
    o += limb('M' + pt(q(-13, -62)) + 'L' + pt(q(-20, -52)), st, 5 * s) + P(pd([q(-23, -50), q(-18, -54), q(-17, -49)], true), dk(st, 0.2), 0.9 * s);
    o += E(q(-13, -64)[0], q(0, -64)[1], 7 * s, 5 * s, c.cel(st), 1.4 * s) + E(q(13, -64)[0], q(0, -64)[1], 6 * s, 4.6 * s, c.cel(dk(st, 0.1)), 1.4 * s);
    // helmed head with a fin crest, ear through the helm
    o += P('M' + pt(q(-7, -70)) + 'C' + pt(q(-6, -88)) + ' ' + pt(q(8, -88)) + ' ' + pt(q(8, -72)) + 'L' + pt(q(4, -66)) + 'L' + pt(q(-5, -66)) + 'Z', c.cel(st), 1.4 * s);
    o += P('M' + pt(q(-4, -84)) + 'C' + pt(q(2, -96)) + ' ' + pt(q(12, -98)) + ' ' + pt(q(20, -94)) + 'C' + pt(q(14, -92)) + ' ' + pt(q(10, -88)) + ' ' + pt(q(8, -80)) + 'Z', c.cel(lt(st, 0.1)), 1.2 * s) + P('M' + pt(q(6, -76)) + 'L' + pt(q(17, -84)) + 'L' + pt(q(8, -72)) + 'Z', c.cel(st), 1 * s);
    o += L('M' + pt(q(-4, -76)) + 'l4,-1', dk(st, 0.5), 1.1 * s);
    // cracks, algae, a coral branch and barnacles on the plinth
    o += L('M' + pt(q(4, -58)) + 'l-3,6 l2,5 l-2,6 M' + pt(q(-6, -30)) + 'l2,6 l-1,4', dk(st, 0.45), 0.9 * s);
    o += coralBranch(c, q(-14, -12)[0], q(0, -12)[1], 16 * s, -5 * s, CORALS[Math.floor(r() * 4)], seed || 5, 1.8 * s) + barn(c, q(10, -6)[0], q(0, -6)[1], 2 * s) + barn(c, q(14, -8)[0], q(0, -8)[1], 1.5 * s);
    return o + kelp(c, q(4, -40)[0], q(0, -40)[1], 20 * s, 3 * s, 3 * s);
  }
  // the same statue toppled and lying on the floor (x = centre, y = floor)
  function fallenStatue(c, x, y, s, col, seed) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, st = col || STAT, o = E(x, y + 1, 50 * s, 4 * s, '#000', 0, 0.4);
    // broken plinth block at the right, the feet still on it
    o += body(c, pd([q(26, 0), q(50, 0), q(52, -13), q(28, -15)], true), dk(st, 0.14), F(pd([q(42, -16), q(54, -16), q(54, 2), q(42, 2)], true), dk(st, 0.4), 0.7), 1.5 * s);
    // legs and torso lying on their back, head to the left
    o += body(c, pd([q(-2, 0), q(28, -1), q(28, -9), q(-2, -10)], true), dk(st, 0.08), L('M' + pt(q(-1, -5)) + 'L' + pt(q(27, -5)), dk(st, 0.35), 1 * s), 1.4 * s);
    o += body(c, 'M' + pt(q(-30, 0)) + 'C' + pt(q(-32, -8)) + ' ' + pt(q(-30, -15)) + ' ' + pt(q(-24, -16)) + 'L' + pt(q(-2, -14)) + 'L' + pt(q(0, 0)) + 'Z', st, F(pd([q(-30, -6), q(2, -6), q(2, 2), q(-30, 2)], true), dk(st, 0.3), 0.7) + L('M' + pt(q(-24, -12)) + 'L' + pt(q(-14, -7)) + 'L' + pt(q(-4, -12)), dk(st, 0.35), 1 * s), 1.4 * s);
    o += E(q(-22, -15)[0], q(0, -15)[1], 6 * s, 3.6 * s, c.cel(lt(st, 0.05)), 1.3 * s);
    // the helmed head, rolled a little way off
    o += P('M' + pt(q(-52, 0)) + 'C' + pt(q(-56, -10)) + ' ' + pt(q(-44, -16)) + ' ' + pt(q(-38, -10)) + 'C' + pt(q(-36, -6)) + ' ' + pt(q(-38, -1)) + ' ' + pt(q(-42, 0)) + 'Z', c.cel(st), 1.3 * s) + P('M' + pt(q(-48, -12)) + 'C' + pt(q(-50, -22)) + ' ' + pt(q(-40, -26)) + ' ' + pt(q(-32, -24)) + 'C' + pt(q(-36, -20)) + ' ' + pt(q(-38, -16)) + ' ' + pt(q(-40, -11)) + 'Z', c.cel(lt(st, 0.1)), 1.1 * s);
    o += L('M' + pt(q(-50, -5)) + 'l4,0', dk(st, 0.5), 1 * s);
    // the round shield propped against the torso, a crescent on it
    o += E(q(-12, -9)[0], q(0, -9)[1], 11 * s, 9 * s, c.cel(dk(st, 0.04)), 1.4 * s) + G(P(crescentD(q(-13, -9)[0], q(0, -9)[1], 5 * s), dk(st, 0.28), 0), '');
    return o + coralBranch(c, q(8, -9)[0], q(0, -9)[1], 12 * s, 4 * s, CORALS[(seed || 1) % 4], seed || 3, 1.6 * s) + barn(c, q(20, -8)[0], q(0, -8)[1], 1.8 * s) + barn(c, q(-26, -12)[0], q(0, -12)[1], 1.5 * s) + kelp(c, q(34, -14)[0], q(0, -14)[1], 12 * s, 2 * s, 2.6 * s);
  }
  // giant clam, open, a glowing pearl inside (x = centre, y = floor)
  function clam(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, o = E(x, y + 1, 16 * s, 3 * s, '#000', 0, 0.35), rib = '';
    o += P('M' + pt(q(-15, -4)) + 'C' + pt(q(-16, -26)) + ' ' + pt(q(16, -26)) + ' ' + pt(q(15, -4)) + 'Z', c.cel('#b8a8c8'), 1.4 * s);
    for (var i = -3; i <= 3; i++) rib += 'M' + pt(q(i * 1.4, -5)) + 'L' + pt(q(i * 4.4, -20 + Math.abs(i) * 1.6));
    o += L(rib, '#7a6a8a', 0.9 * s) + C(q(0, -6)[0], q(0, -6)[1], 16 * s, glow(c, '#c8fff4', 0.6)) + C(q(0, -7)[0], q(0, -7)[1], 4.4 * s, c.rg([[0, '#ffffff'], [0.6, PEARL], [1, '#a8d0c8']]), 1 * s);
    return o + P('M' + pt(q(-16, -5)) + 'C' + pt(q(-12, 2)) + ' ' + pt(q(12, 2)) + ' ' + pt(q(16, -5)) + 'C' + pt(q(8, -2)) + ' ' + pt(q(-8, -2)) + ' ' + pt(q(-16, -5)) + 'Z', c.cel('#a898b8'), 1.4 * s);
  }
  // glowing jellyfish (x, y = bell top)
  function jelly(c, x, y, s, col) {
    var o = C(x, y + 4 * s, 16 * s, glow(c, col, 0.5)), t = '';
    for (var i = 0; i < 4; i++) { var xx = x - 5 * s + i * 3.4 * s; t += 'M' + pt([xx, y + 7 * s]) + 'q' + n(-3 * s) + ',' + n(6 * s) + ' 0,' + n(12 * s) + 't0,' + n(10 * s); }
    o += L(t, lt(col, 0.3), 0.9 * s, 0.75);
    return o + P('M' + pt([x - 8 * s, y + 8 * s]) + 'C' + pt([x - 9 * s, y - 2 * s]) + ' ' + pt([x + 9 * s, y - 2 * s]) + ' ' + pt([x + 8 * s, y + 8 * s]) + 'Q' + pt([x, y + 5 * s]) + ' ' + pt([x - 8 * s, y + 8 * s]) + 'Z', c.rg([[0, '#ffffff', 0.9], [0.5, col, 0.7], [1, dk(col, 0.3), 0.5]]), 0) + L('M' + pt([x - 8 * s, y + 8 * s]) + 'Q' + pt([x, y + 5 * s]) + ' ' + pt([x + 8 * s, y + 8 * s]), lt(col, 0.5), 0.8 * s);
  }
  // glowing anemone on the abyss ledge (x = centre, y = floor)
  function anemone(c, x, y, s, col) {
    var o = C(x, y - 6 * s, 20 * s, glow(c, col, 0.45)), d = '', tips = '';
    for (var i = 0; i < 7; i++) { var a = -PI + 0.35 + i * (PI - 0.7) / 6, e = [x + Math.cos(a) * 11 * s, y - 5 * s + Math.sin(a) * 12 * s]; d += 'M' + pt([x, y - 3 * s]) + 'Q' + pt([x + Math.cos(a) * 6 * s, y - 4 * s + Math.sin(a) * 4 * s]) + ' ' + pt(e); tips += C(e[0], e[1], 1.3 * s, lt(col, 0.6)); }
    return o + E(x, y - 1 * s, 6 * s, 3.4 * s, c.cel('#3a2a5a'), 1.1 * s) + L(d, OL, 3 * s) + L(d, col, 1.6 * s) + tips;
  }
  // a tilted, falling ruin in the abyss: a broken spire and its wall (x, y = base centre)
  function fallingRuin(c, x, y, s, rot, col, rim, seed) {
    var r = rng(seed || 9), q = function (u, v) { return [x + u * s, y + v * s]; }, o = '';
    var d = pd([q(-14, 4), q(-10, -2), q(-14, -6), q(-12, -40), q(-18, -42), q(-9, -50), q(-2, -86), q(2, -86), q(9, -50), q(18, -42), q(12, -40), q(14, -6), q(9, -1), q(12, 5), q(4, 2), q(-4, 6)], true);
    o += P(d, c.lg([[0, lt(col, 0.1)], [0.4, col], [1, dk(col, 0.4)]], 0, 0, 1, 0), 0) + L(pd([q(-12, -40), q(-9, -50), q(-2, -86)]) + 'M' + pt(q(-14, -6)) + 'L' + pt(q(-12, -40)), rim, 1.1 * s, 0.9);
    for (var i = 0; i < 3; i++) { var w = q(0, -12 - i * 10); o += C(w[0], w[1], 1.4 * s, rim, 0, 0.5 + r() * 0.4); }
    o += R(q(-18, 6)[0], q(0, 6)[1], 36 * s, 6 * s, col, 0) + L('M' + pt(q(-18, 6)) + 'l' + n(36 * s) + ',0', rim, 1 * s, 0.7);
    return G(o, 'rotate(' + n(rot) + ' ' + n(x) + ' ' + n(y) + ')');
  }
  function brokenArch(c, x, y, s, rot, col, rim) {
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    var d = 'M' + pt(q(-24, 0)) + 'L' + pt(q(-24, -30)) + 'C' + pt(q(-24, -52)) + ' ' + pt(q(-8, -60)) + ' ' + pt(q(0, -62)) + 'L' + pt(q(6, -54)) + 'L' + pt(q(2, -50)) + 'C' + pt(q(-8, -48)) + ' ' + pt(q(-16, -40)) + ' ' + pt(q(-16, -28)) + 'L' + pt(q(-16, 0)) + 'Z';
    return G(P(d, c.lg([[0, lt(col, 0.1)], [1, dk(col, 0.35)]], 0, 0, 1, 0), 0) + L('M' + pt(q(-24, 0)) + 'L' + pt(q(-24, -30)) + 'C' + pt(q(-24, -52)) + ' ' + pt(q(-8, -60)) + ' ' + pt(q(0, -62)), rim, 1.1 * s, 0.85) + R(q(-28, 0)[0], q(0, 0)[1], 16 * s, 5 * s, col, 0), 'rotate(' + n(rot) + ' ' + n(x) + ' ' + n(y) + ')');
  }
  function rays(c, list, col, op) { var o = ''; list.forEach(function (k) { o += F(pd([[k[0], -2], [k[0] + k[1], -2], [k[2] + k[3], k[4]], [k[2], k[4]]], true), c.lg([[0, col, op], [0.7, col, op * 0.35], [1, col, 0]])); }); return o; }
  function balustrade(c, x0, x1, y, h, col, seed, gaps) {
    var r = rng(seed), o = '', rail = '', step = 11;
    for (var x = x0 + 4; x < x1 - 2; x += step) {
      var skip = gaps && gaps.some(function (g) { return x > g[0] && x < g[1]; });
      if (skip) continue;
      o += P('M' + pt([x - 2.4, y]) + 'L' + pt([x + 2.4, y]) + 'L' + pt([x + 1.6, y - h * 0.3]) + 'C' + pt([x + 3.6, y - h * 0.55]) + ' ' + pt([x + 2, y - h * 0.8]) + ' ' + pt([x + 1.6, y - h]) + 'L' + pt([x - 1.6, y - h]) + 'C' + pt([x - 2, y - h * 0.8]) + ' ' + pt([x - 3.6, y - h * 0.55]) + ' ' + pt([x - 1.6, y - h * 0.3]) + 'Z', c.cel(col), 1);
      if (r() < 0.12) o += barn(c, x, y - h * 0.4, 1.4);
    }
    var seg = [[x0, x1]];
    if (gaps) { seg = []; var a = x0; gaps.forEach(function (g) { seg.push([a, g[0]]); a = g[1]; }); seg.push([a, x1]); }
    seg.forEach(function (sg) { if (sg[1] - sg[0] > 4) rail += R(sg[0], y - h - 3, sg[1] - sg[0], 3.6, c.cel(lt(col, 0.08)), 1.1) + R(sg[0], y - 2, sg[1] - sg[0], 3, c.cel(dk(col, 0.1)), 1); });
    return o + rail;
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    citadel_court: function (c) {
      var o = sky(c, '#12303c', '#2c5a64', '#5e8e8e');
      o += clouds(3101, 0, 34, '#0c2430', 0.55, 7) + clouds(3102, 10, 40, '#6a9a9c', 0.25, 5);
      // broken spires behind the wall, hazy with distance
      o += spire(c, 70, 50, 14, 46, '#5a8288', true, 1.1) + spire(c, 330, 50, 12, 40, '#5a8288', true, 1.1) + spire(c, 258, 44, 9, 30, '#6a9096', false, 0.9) + R(0, 38, 400, 16, c.lg([[0, '#6a9a9c', 0], [1, '#6a9a9c', 0.5]]));
      // the back wall: sea-worn elven masonry, a dark tide line along the foot
      o += ashlar(c, 0, 42, 400, 124, ST, 3103, 14, 30) + R(0, 42, 400, 82, c.lg([[0, '#000', 0.05], [0.7, '#000', 0.12], [0.8, '#1e4a2a', 0.35], [1, '#10281a', 0.55]]));
      var cop = ''; for (var fx = 6; fx < 400; fx += 28) cop += (fx > 160 && fx < 240) ? '' : pd([[fx - 5, 42], [fx, fx % 3 ? 30 : 34], [fx + 5, 42]], true);
      o += P(cop, c.cel(STL), 1.3) + R(-2, 40, 404, 5, c.cel(STL), 1.4);
      // side arches, dark and dripping
      [[30, 66], [304, 66]].forEach(function (a, i) {
        o += P(elfArchD(a[0] - 5, 124, a[1] + 10, 80), c.cel(STL), 1.8) + P(elfArchD(a[0], 124, a[1], 72), c.lg([[0, '#061a20'], [0.7, '#0e3238'], [1, '#1e5046']]), 1.5);
        o += L('M' + pt([a[0] + 12, 60]) + 'l0,' + (40 + i * 8) + ' M' + pt([a[0] + a[1] - 16, 62]) + 'l0,' + (46 - i * 6), '#9ae8e8', 1, 0.7) + moonPearl(c, a[0] + a[1] / 2, 50, 4.4, GOLD, false);
      });
      // the great central arch with its waterfall and the moon keystone
      o += P(elfArchD(138, 124, 124, 112), c.cel(STL), 2) + P(elfArchD(148, 124, 104, 100), c.lg([[0, '#08222a'], [0.6, '#123e44'], [1, '#2a6a64']]), 1.6);
      o += L(elfArchD(143, 124, 114, 106).replace(/Z$/, ''), lt(STL, 0.2), 1.2, 0.8) + coralBranch(c, 142, 60, 22, -8, CORALO, 3104, 2.2) + coralBranch(c, 258, 70, 18, 7, CORALP, 3105, 2) + barn(c, 146, 80, 2.2) + barn(c, 255, 88, 2);
      o += waterfall(c, 200, 36, 118, 44, 3106) + moonPearl(c, 200, 22, 8, GOLD, true);
      // columns between the arches, kelp banners hung on them
      o += column(c, 0, 124, 14, 84, 3107) + column(c, 110, 124, 16, 84, 3108) + column(c, 274, 124, 16, 84, 3109) + column(c, 386, 124, 14, 84, 3110);
      o += kelpBanner(c, 118, 48, 22, 50, 3111) + kelpBanner(c, 282, 48, 22, 50, 3112);
      // wet flagstone floor, the basin in front of the falls
      o += wetFloor(c, 122, '#4e6e6c', 3113) + L('M-2,122 L402,122', OL, 1.6);
      o += E(200, 124, 58, 9, c.cel(STL), 1.8) + E(200, 123, 50, 6, c.lg([[0, '#bff4f0'], [1, SEAL]]), 1.2) + E(200, 121, 30, 3, FOAM, 0, 0.8) + P('M142,124 C142,134 258,134 258,124 L258,128 C258,140 142,140 142,128 Z', c.cel(ST), 1.6);
      // the fallen knight at the back left, a standing broken one at the right
      o += fallenStatue(c, 76, 136, 0.9, STAT, 3114) + statue(c, 352, 128, 0.82, STAT, 3115);
      o += coralClump(c, 20, 132, 0.9, 3116) + coralClump(c, 262, 130, 0.7, 3117) + kelp(c, 104, 130, 26, 4, 4) + kelp(c, 298, 128, 22, -3, 3.4);
      o += puddle(c, 120, 168, 28, 5) + puddle(c, 290, 196, 40, 6) + puddle(c, 60, 212, 30, 5) + pebbles(3118, 140, 236, '#34504e', 16, 10, 390);
      // foreground: a statue's helmed head, coral in the corners
      o += P('M18,232 C12,220 22,208 34,210 C42,212 44,222 40,232 Z', c.cel(STAT), 1.6) + P('M26,212 C24,200 34,194 44,196 C40,200 38,206 38,212 Z', c.cel(lt(STAT, 0.1)), 1.3) + L('M20,222 l6,0', dk(STAT, 0.5), 1.2);
      o += coralClump(c, 384, 238, 1.2, 3119) + barn(c, 48, 230, 2.4) + barn(c, 52, 234, 1.8);
      return o + bubbles(3120, 14, 0, 400, 20, 200) + motes(3121, 18, 0, 400, 10, 200, '#c8fff4') + R(0, 0, 400, 240, c.rg([[0, '#40ffe0', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    },
    citadel_throne: function (c) {
      var o = R(0, 0, 400, 240, '#0e2228');
      o += ashlar(c, 0, 0, 400, 124, '#3c5e62', 3201, 14, 30) + R(0, 0, 400, 124, c.lg([[0, '#04121a', 0.8], [0.5, '#04121a', 0.3], [1, '#10281a', 0.35]]));
      // tall windows with sea light
      [[40, 44], [316, 44]].forEach(function (w, i) {
        var g = elfArchD(w[0], 100, w[1], 84);
        o += C(w[0] + w[1] / 2, 60, 60, glow(c, '#9ae8e0', 0.28)) + P(elfArchD(w[0] - 5, 104, w[1] + 10, 92), c.cel(STL), 1.8) + P(g, c.lg([[0, '#e8fff8'], [0.5, '#7ad8d4'], [1, '#2a7a84']]), 1.5);
        o += '<g clip-path="url(#' + c.clip(g) + ')">' + kelp(c, w[0] + 8, 102, 50, 4, 5, '#2a5a3a') + kelp(c, w[0] + w[1] - 10, 102, 40, -3, 4, '#2a5a3a') + bubbles(3202 + i, 6, w[0], w[0] + w[1], 20, 96) + '</g>';
        o += L('M' + pt([w[0] + w[1] / 2, 100]) + 'L' + pt([w[0] + w[1] / 2, 38]) + 'M' + pt([w[0], 64]) + 'L' + pt([w[0] + w[1], 64]), OL, 3.6) + L('M' + pt([w[0] + w[1] / 2, 100]) + 'L' + pt([w[0] + w[1] / 2, 38]) + 'M' + pt([w[0], 64]) + 'L' + pt([w[0] + w[1], 64]), STL, 2) + moonPearl(c, w[0] + w[1] / 2, 30, 5, GOLD, false);
      });
      // vault ribs and columns
      o += L('M8,40 Q60,-14 108,36 M292,36 Q340,-14 392,40 M108,36 Q200,-40 292,36', OL, 7) + L('M8,40 Q60,-14 108,36 M292,36 Q340,-14 392,40 M108,36 Q200,-40 292,36', STL, 3.6);
      o += column(c, 100, 124, 16, 94, 3204) + column(c, 284, 124, 16, 94, 3205) + column(c, 0, 124, 10, 96, 3206) + column(c, 390, 124, 10, 96, 3207);
      // royal kelp banners flanking the throne
      o += kelpBanner(c, 140, 6, 26, 86, 3208) + kelpBanner(c, 260, 6, 26, 86, 3209);
      // the dais
      o += body(c, pd([[116, 124], [284, 124], [280, 115], [120, 115]], true), STL, F('M230,113 L290,113 L290,126 L230,126 Z', dk(STL, 0.3), 0.6), 1.6);
      o += body(c, pd([[130, 115], [270, 115], [266, 108], [134, 108]], true), lt(STL, 0.05), '', 1.5) + body(c, pd([[144, 108], [256, 108], [252, 101], [148, 101]], true), lt(STL, 0.1), '', 1.4);
      o += L('M120,118 L280,118 M134,111 L266,111', GOLD, 1, 0.7);
      // the pearl-and-coral throne
      var q = function (u, v) { return [200 + u * 0.86, 102 + v * 0.86]; }, fans = '';
      [-160, -138, -116, -64, -42, -20].forEach(function (a, i) { var ra = a * PI / 180, b = q(Math.cos(ra) * 24, -46 + Math.sin(ra) * 30); fans += coralBranch(c, b[0], b[1], 30 + (i % 3) * 5, Math.cos(ra) * 26, CORALS[i % 4], 3210 + i, 2.8); });
      o += C(q(0, -60)[0], q(0, -60)[1], 70, glow(c, '#c8fff4', 0.35)) + fans;
      var edge = [], k = 12, i2, ed = 'M' + pt(q(-22, -14));
      for (i2 = 0; i2 <= k; i2++) { var aa = PI + i2 * PI / k; edge.push(q(Math.cos(aa) * 36, -40 + Math.sin(aa) * 56)); }
      ed += 'L' + pt(edge[0]);
      for (i2 = 1; i2 <= k; i2++) { var am = PI + (i2 - 0.5) * PI / k; ed += 'Q' + pt(q(Math.cos(am) * 42, -40 + Math.sin(am) * 63)) + ' ' + pt(edge[i2]); }
      ed += 'L' + pt(q(22, -14)) + 'Z';
      var rb = ''; edge.forEach(function (p) { rb += 'M' + pt(q(0, -18)) + 'L' + pt(p); });
      o += P(ed, c.lg([[0, '#ffffff'], [0.45, '#e8f0ec'], [1, '#a8c8c4']], 0.2, 0, 0.8, 1), 2) + L(rb, '#9ab8b4', 1.2) + L(ed, '#ffffff', 0.8, 0.6);
      o += P(pd([q(-26, 0), q(26, 0), q(24, -16), q(-24, -16)], true), c.cel('#2c7674'), 1.8) + R(q(-28, -20)[0], q(0, -20)[1], 56 * 0.86, 5, c.cel(GOLD), 1.3);
      o += brain(c, q(-28, 0)[0], q(0, 0)[1], 10, 16, CORAL) + brain(c, q(28, 0)[0], q(0, 0)[1], 10, 16, CORALO) + barn(c, q(-20, -6)[0], q(0, -6)[1], 2) + barn(c, q(22, -8)[0], q(0, -8)[1], 1.8);
      o += C(q(0, -100)[0], q(0, -100)[1], 26, glow(c, '#e8fff8', 0.9)) + C(q(0, -100)[0], q(0, -100)[1], 11, c.rg([[0, '#ffffff'], [0.55, PEARL], [1, '#9ac8c0']]), 1.8) + C(q(-3, -103)[0], q(0, -103)[1], 3, '#ffffff', 0, 0.9);
      o += moonPearl(c, q(0, -80)[0], q(0, -80)[1], 7, GOLD, false);
      // floor: polished marble with a teal inlaid runner, clams with pearls
      o += wetFloor(c, 122, '#4a6a6a', 3216) + L('M-2,122 L402,122', OL, 1.6);
      o += P('M170,124 L230,124 L286,244 L114,244 Z', c.lg([[0, '#1e5a60'], [1, '#2c7674']]), 1.6) + L('M175,124 L122,244 M225,124 L278,244', GOLD, 1.3, 0.8);
      o += moonPearl(c, 200, 150, 7, GOLD, false) + moonPearl(c, 200, 196, 11, GOLD, false);
      o += clam(c, 104, 130, 0.9) + clam(c, 296, 130, 0.9) + coralClump(c, 40, 132, 0.9, 3217) + coralClump(c, 362, 134, 0.9, 3218) + kelp(c, 70, 128, 30, 4, 4) + kelp(c, 330, 128, 28, -4, 4);
      o += pearlLamp(c, 24, 184, 1.1, 42) + pearlLamp(c, 378, 190, 1.1, 42) + pebbles(3219, 150, 236, '#2e4a4a', 14, 10, 390) + puddle(c, 70, 206, 30, 5) + puddle(c, 336, 170, 26, 4);
      // shafts of light from above
      o += rays(c, [[176, 26, 150, 44, 124], [214, 22, 206, 40, 124], [70, 16, 30, 36, 240], [304, 16, 330, 36, 240]], '#e8fff8', 0.22);
      return o + bubbles(3220, 12, 0, 400, 10, 200) + motes(3221, 18, 0, 400, 10, 200, '#e8fff4') + R(0, 0, 400, 240, c.rg([[0, '#40ffe0', 0], [0.7, '#000', 0.12], [1, '#000', 0.55]]));
    },
    citadel_abyss: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#0c2a36'], [0.3, '#07182a'], [0.55, '#030a14'], [1, '#010306']]));
      o += rays(c, [[150, 20, 120, 50, 150], [212, 14, 230, 34, 140], [260, 10, 300, 26, 120]], '#8ae8e8', 0.12);
      // the dread below: a violet glow deep in the chasm
      o += E(200, 118, 130, 70, glow(c, '#6a2a9a', 0.35)) + E(200, 120, 60, 30, glow(c, VIO, 0.25));
      // the chasm: its sides close in as they fall away; the far walls are ruined facades lost in blue murk
      o += E(200, 30, 190, 70, glow(c, '#1e5a6a', 0.4));
      var fw = 'M40,-2 L104,-2 L98,24 L120,46 L114,70 L140,92 L136,108 L164,124 L40,124 Z', fr = 'M360,-2 L296,-2 L304,26 L282,48 L290,72 L262,92 L268,108 L236,124 L360,124 Z';
      o += P(fw, c.lg([[0, '#0a1e2a'], [1, '#12303c']], 0, 0, 1, 0), 0) + P(fr, c.lg([[0, '#12303c'], [1, '#0a1e2a']], 0, 0, 1, 0), 0);
      o += L('M104,-2 L98,24 L120,46 L114,70 L140,92 L136,108 L164,124', '#2a7a84', 1.2, 0.8) + L('M296,-2 L304,26 L282,48 L290,72 L262,92 L268,108 L236,124', '#2a7a84', 1.2, 0.8);
      [[78, 30, 12], [92, 64, 10], [118, 96, 8], [318, 34, 12], [300, 66, 10], [272, 98, 8]].forEach(function (w) { o += P(elfArchD(w[0] - w[2] / 2, w[1] + w[2] * 1.4, w[2], w[2] * 1.6), c.lg([[0, '#3a9aa0'], [1, '#0e3a44']]), 0) + C(w[0], w[1] + w[2] * 0.6, w[2], glow(c, TEAL, 0.25)); });
      // ruins falling into the dark: small and dim near the depths, large and rim-lit close by, bubbles streaming off them
      var far = '#10283a', mid = '#1a3e4c';
      o += G(fallingRuin(c, 180, 104, 0.3, 22, far, '#2a6a7a', 3301) + fallingRuin(c, 224, 98, 0.26, -28, far, '#2a6a7a', 3302) + brokenArch(c, 204, 116, 0.34, 34, far, '#2a6a7a') + fallingRuin(c, 158, 84, 0.22, -12, far, '#2a6a7a', 3303), '', 0.8);
      o += fallingRuin(c, 132, 92, 0.95, 26, mid, '#4ab8c4', 3304) + brokenArch(c, 296, 76, 1.1, -20, mid, '#4ab8c4') + bubbles(3313, 8, 100, 150, 4, 40, 1) + bubbles(3314, 6, 280, 330, 0, 30, 1);
      var r = rng(3315);
      for (var b = 0; b < 9; b++) { var bx = 150 + r() * 110, by = 20 + r() * 90, bs = 3 + r() * 6 * (1 - (by - 20) / 140), ba = r() * 90; o += G(R(bx - bs, by - bs * 0.7, bs * 2, bs * 1.4, by > 80 ? far : mid, 0) + L('M' + pt([bx - bs, by + bs * 0.7]) + 'L' + pt([bx - bs, by - bs * 0.7]) + 'L' + pt([bx + bs, by - bs * 0.7]), '#4ab8c4', 0.9, 0.8), 'rotate(' + n(ba) + ' ' + n(bx) + ' ' + n(by) + ')'); }
      // the near chasm walls, dark and rim-lit
      var lw = 'M-2,-2 L50,-2 L44,22 L60,46 L42,72 L58,98 L40,124 L-2,124 Z', rw = 'M402,-2 L348,-2 L356,26 L340,52 L360,78 L344,104 L362,124 L402,124 Z';
      o += P(lw, c.lg([[0, '#1a3a48'], [1, '#06121a']], 0, 0, 1, 0), 0) + P(rw, c.lg([[0, '#06121a'], [1, '#1a3a48']], 0, 0, 1, 0), 0);
      o += L('M50,-2 L44,22 L60,46 L42,72 L58,98 L40,124', '#56c8d0', 1.6, 0.85) + L('M348,-2 L356,26 L340,52 L360,78 L344,104 L362,124', '#56c8d0', 1.6, 0.85);
      o += anemone(c, 48, 48, 0.6, TEAL) + anemone(c, 346, 56, 0.6, VIO) + anemone(c, 46, 98, 0.5, VIO) + anemone(c, 350, 106, 0.55, TEAL) + fanCoral(c, 24, 72, 0.8, '#6a3a9a') + fanCoral(c, 378, 86, 0.8, '#2a7a8a');
      o += jelly(c, 176, 28, 0.9, TEAL) + jelly(c, 262, 46, 0.7, VIO) + jelly(c, 84, 12, 0.6, VIO) + jelly(c, 226, 16, 0.5, TEAL) + jelly(c, 318, 10, 0.5, TEAL);
      o += motes(3307, 34, 0, 400, 0, 120, TEAL) + motes(3308, 20, 40, 360, 20, 120, '#c8a0ff');
      // the ledge: a broken slab of citadel floor at the lip of the chasm
      var lip = 'M-2,121 L30,118 L44,122 L70,119 L96,123 L128,120 L150,124 L176,120 L204,123 L236,119 L262,122 L292,118 L318,121 L344,119 L372,123 L402,120 L402,242 L-2,242 Z';
      o += P(lip, c.lg([[0, '#42686a'], [0.12, '#35575a'], [1, '#172a2e']]), 1.8);
      var jn = ''; for (var i = -8; i <= 8; i++) jn += 'M' + pt([200 + i * 14, 122]) + 'L' + pt([200 + i * 70, 242]);
      for (var j = 1; j < 7; j++) { var t = j / 7, y = 122 + 120 * t * t; jn += 'M-2,' + n(y) + 'L402,' + n(y + (j % 2 ? 1 : -1)); }
      o += '<g clip-path="url(#' + c.clip(lip) + ')">' + L(jn, '#0e1e22', 1, 0.7) + E(200, 170, 150, 40, glow(c, TEAL, 0.2)) + E(84, 150, 60, 16, glow(c, VIO, 0.22)) + E(320, 160, 60, 16, glow(c, TEAL, 0.25)) + '</g>';
      o += L('M-2,121 L30,118 L44,122 L70,119 L96,123 L128,120 L150,124 L176,120 L204,123 L236,119 L262,122 L292,118 L318,121 L344,119 L372,123 L402,120', '#7ad8d8', 1.2, 0.8);
      o += L('M84,124 l6,10 l-4,8 l8,12 M296,122 l-5,9 l4,7', '#0a1618', 1.4, 0.9);
      // broken column stumps and glowing growths along the lip
      o += body(c, pd([[16, 132], [36, 132], [36, 110], [30, 104], [24, 110], [16, 106]], true), '#4a7072', '', 1.6) + body(c, pd([[364, 134], [386, 134], [386, 108], [378, 112], [370, 102], [364, 110]], true), '#4a7072', '', 1.6);
      o += anemone(c, 60, 132, 0.8, TEAL) + anemone(c, 250, 128, 0.6, VIO) + anemone(c, 340, 140, 0.8, VIO) + coralClump(c, 150, 130, 0.7, 3310) + anemone(c, 30, 214, 1.1, TEAL) + anemone(c, 380, 226, 1.2, VIO);
      o += pebbles(3311, 136, 236, '#0e1c20', 18, 10, 390) + E(120, 190, 18, 4, '#0e1c20', 0, 0.8) + E(260, 214, 22, 4, '#0e1c20', 0, 0.8);
      return o + motes(3312, 12, 0, 400, 124, 236, TEAL) + R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.7, '#000', 0.15], [1, '#000', 0.55]]));
    },
    drowned_causeway: function (c) {
      var o = sky(c, '#16263a', '#3a5a72', '#86a6ae');
      o += clouds(3401, 0, 30, '#0e1a28', 0.7, 9) + clouds(3402, 20, 60, '#2a4458', 0.5, 7);
      // the crescent moon breaking through over the citadel
      o += C(270, 36, 40, glow(c, '#e8fff8', 0.45)) + G(P(crescentD(270, 36, 11), c.lg([[0, '#ffffff'], [1, '#c8e8e4']]), 1.2), 'rotate(-30 270 36)') + E(292, 44, 30, 6, '#2a4458', 0, 0.8) + clouds(3403, 50, 80, '#6a8a9a', 0.35, 5);
      // the sea to the horizon
      o += R(0, 84, 400, 40, c.lg([[0, '#4a7a86'], [0.4, '#2a5a68'], [1, '#1a4654']]));
      o += waves(c, 90, 1.2, 10, '#8ac0c4', 0.5, 3404) + waves(c, 97, 1.8, 14, '#6aa6ae', 0.6, 3405) + waves(c, 106, 2.4, 18, '#5a9aa4', 0.7, 3406) + waves(c, 116, 3, 24, '#4a8a96', 0.8, 3407);
      // the citadel, far ahead on the horizon
      o += C(236, 70, 50, glow(c, '#bffff0', 0.3)) + R(206, 72, 60, 14, '#4a6a7a', 0) + spire(c, 236, 86, 9, 58, '#5a7a8a', true, 0.9) + spire(c, 218, 84, 7, 40, '#52727e', true, 0.8) + spire(c, 254, 84, 7, 44, '#52727e', true, 0.8) + spire(c, 204, 84, 5, 26, '#4a6a76', false, 0.7) + spire(c, 268, 84, 5, 28, '#4a6a76', false, 0.7);
      // the long causeway running out to it, broken in two places
      var cw = function (y) { var t = (y - 86) / 34; return [236 - (4 + t * 58), 236 + (4 + t * 58)]; };
      var seg = function (y0, y1) { var a = cw(y0), b = cw(y1); return pd([[a[0], y0], [a[1], y0], [b[1], y1], [b[0], y1]], true); };
      [[86, 97], [99.5, 108], [111, 121]].forEach(function (s) { o += P(seg(s[0], s[1]), c.lg([[0, '#8aaaa8'], [1, '#6a8a88']]), 1.2) + R(cw(s[1])[0], s[1], cw(s[1])[1] - cw(s[1])[0], 1.6 + (s[1] - 86) * 0.08, '#2e4a4c', 0); });
      o += E(236, 98.4, 14, 1.4, FOAM, 0, 0.85) + E(236, 109.6, 26, 2, FOAM, 0, 0.85) + spray(c, 224, 110, 0.35, 3408);
      [0.15, 0.32, 0.55, 0.8].forEach(function (t) { var y = 86 + t * 34, a = cw(y), h = 4 + t * 20; if (t !== 0.32) o += pearlLamp(c, a[0] + 1, y, 0.12 + t * 0.4, 40); o += pearlLamp(c, a[1] - 1, y, 0.12 + t * 0.4, 40, t === 0.55); });
      // the wide landing we stand on, balustrades at its back edge, surf breaking on it
      o += wetFloor(c, 120, '#5e7e7c', 3409, 236) + L('M-2,120 L402,120', OL, 1.6);
      o += balustrade(c, -4, 176, 120, 13, STL, 3410, [[60, 84]]) + balustrade(c, 296, 404, 120, 13, STL, 3411, [[340, 356]]);
      o += P('M60,120 L84,120 L80,126 L66,127 Z', c.cel(STD), 1.2) + E(72, 119, 14, 2.4, FOAM, 0, 0.9) + P('M346,121 L354,111 L358,113 L350,122 Z', c.cel(STL), 1);
      o += spray(c, 36, 118, 1, 3412) + spray(c, 366, 120, 0.9, 3413) + spray(c, 138, 118, 0.5, 3414);
      o += puddle(c, 150, 150, 36, 5) + puddle(c, 300, 180, 44, 6) + puddle(c, 90, 214, 40, 6) + pebbles(3415, 130, 236, '#3e5a58', 14, 10, 390);
      o += coralClump(c, 26, 136, 0.8, 3416) + barn(c, 196, 132, 2) + barn(c, 200, 135, 1.6) + kelp(c, 250, 132, 16, 3, 3.4) + kelp(c, 258, 134, 12, -2, 3);
      // a toppled lamp post and heaped kelp in the foreground; a broken edge at the lower right
      o += E(100, 230, 34, 4, '#000', 0, 0.4) + body(c, 'M72,214 L122,214 L122,232 L72,232 Z', STL, F('M72,226 L122,226 L122,232 L72,232 Z', dk(STL, 0.3), 0.8) + L('M84,214 L84,232 M96,214 L96,232 M108,214 L108,232', dk(STL, 0.3), 1), 1.6) + E(122, 223, 5, 9, c.cel(lt(STL, 0.1)), 1.6) + E(122, 223, 2.4, 4.4, dk(STL, 0.2)) + barn(c, 90, 216, 2) + coralBranch(c, 78, 214, 10, -3, CORAL, 3420, 1.8) + kelp(c, 120, 238, 20, 6, 6) + kelp(c, 132, 238, 14, -4, 5);
      o += P('M402,196 L386,204 L392,214 L378,226 L384,242 L402,242 Z', c.lg([[0, '#2a6a78'], [1, '#1a4a58']]), 1.6) + E(394, 206, 8, 2, FOAM, 0, 0.9) + L('M386,204 L392,214 L378,226 L384,242', '#2a3e3e', 2.4);
      o += pearlLamp(c, 18, 172, 1.1, 46) + pearlLamp(c, 386, 170, 1.1, 46);
      return o + motes(3417, 14, 0, 400, 10, 110, '#e8fff8') + R(0, 0, 400, 240, c.rg([[0, '#fff', 0], [0.7, '#000', 0.1], [1, '#000', 0.45]]));
    },
    tidecrown_gate: function (c) {
      var o = sky(c, '#142238', '#3a5870', '#7a9aa6');
      o += clouds(3501, 0, 40, '#0e1a28', 0.7, 9) + C(330, 20, 30, glow(c, '#e8fff8', 0.35)) + G(P(crescentD(330, 20, 8), '#eef8f6', 1), 'rotate(-30 330 20)') + clouds(3502, 26, 60, '#2a4458', 0.45, 6);
      // spires above the wall
      o += spire(c, 30, 60, 16, 50, '#6a8e92', true, 1.2) + spire(c, 370, 60, 16, 54, '#6a8e92', true, 1.2);
      o += spire(c, 84, 50, 24, 72, '#7a9ea0', true, 1.4) + spire(c, 316, 50, 24, 76, '#7a9ea0', true, 1.4) + spire(c, 200, 30, 34, 60, '#86aaaa', true, 1.6);
      // the great wall, a tide line and weed at its foot
      o += ashlar(c, 0, 36, 400, 116, STL, 3503, 13, 32) + R(0, 36, 400, 80, c.lg([[0, '#000', 0.02], [0.6, '#000', 0.12], [0.72, '#1e4a2a', 0.4], [1, '#10281a', 0.6]]));
      var cop = ''; for (var fx = 8; fx < 400; fx += 26) cop += (fx > 120 && fx < 280) ? '' : pd([[fx - 5, 36], [fx, 24], [fx + 5, 36]], true);
      o += P(cop, c.cel(lt(STL, 0.1)), 1.3) + R(-2, 34, 404, 5, c.cel(lt(STL, 0.1)), 1.4);
      o += kelpBanner(c, 40, 44, 22, 46, 3504) + kelpBanner(c, 360, 44, 22, 46, 3505);
      // the gate: a carved frame, coral grown over it, the doors ajar with pearl light between
      o += P(elfArchD(128, 118, 144, 110), c.cel(lt(STL, 0.12)), 2.2) + L(elfArchD(134, 118, 132, 103).replace(/Z$/, ''), dk(STL, 0.3), 1.4) + P(elfArchD(142, 118, 116, 96), c.lg([[0, '#0c2a30'], [1, '#12383c']]), 1.6);
      var door = elfArchD(146, 118, 108, 90);
      o += '<g clip-path="url(#' + c.clip(door) + ')">' + R(146, 20, 52, 100, c.lg([[0, '#1e5058'], [0.8, '#2c6a6e'], [1, '#163e44']], 0, 0, 1, 0)) + R(202, 20, 52, 100, c.lg([[0, '#163e44'], [0.2, '#2c6a6e'], [1, '#1e5058']], 0, 0, 1, 0)) +
        C(200, 70, 40, glow(c, '#dffff8', 0.9)) + R(197, 20, 6, 100, '#f0fffa') +
        L('M160,118 L160,40 M184,118 L184,34 M216,118 L216,34 M240,118 L240,40 M146,70 L196,70 M204,70 L254,70', GOLDD, 1.6) + '</g>' + P(door, 'none', 1.6);
      o += G(P(crescentD(200, 66, 22), c.cel(GOLD), 1.6), 'rotate(-90 200 66)') + C(200, 62, 7, c.rg([[0, '#ffffff'], [0.6, PEARL], [1, '#9ac8c0']]), 1.2) + moonPearl(c, 200, 14, 9, GOLD, true);
      o += coralBranch(c, 132, 64, 26, -10, CORAL, 3506, 2.6) + coralBranch(c, 138, 44, 18, -6, CORALP, 3507, 2) + coralBranch(c, 268, 60, 24, 9, CORALO, 3508, 2.4) + brain(c, 262, 36, 8, 5, CORALR) + barn(c, 134, 90, 2.4) + barn(c, 138, 96, 1.8) + barn(c, 266, 94, 2.2);
      o += L('M150,34 l0,30 M170,22 l0,20 M234,22 l0,26 M252,34 l0,24', '#bff4f4', 1.1, 0.8);
      // steps up to the gate, statues of the prince's knights on either side
      o += body(c, pd([[118, 124], [282, 124], [276, 119], [124, 119]], true), lt(STL, 0.05), '', 1.4) + body(c, pd([[128, 119], [272, 119], [268, 115], [132, 115]], true), lt(STL, 0.1), '', 1.3);
      // surf on both sides, spray against the wall
      o += R(-2, 104, 124, 18, c.lg([[0, '#2a6a78'], [1, '#1a4a58']])) + R(278, 104, 124, 18, c.lg([[0, '#2a6a78'], [1, '#1a4a58']])) + L('M-2,104 L122,104 M278,104 L402,104', '#e8fbff', 1.4, 0.8);
      o += waves(c, 112, 2, 14, '#7ab8c0', 0.8, 3509);
      o += wetFloor(c, 122, '#5e7e7c', 3510) + L('M-2,122 L402,122', OL, 1.6);
      o += statue(c, 96, 126, 0.94, STAT, 3511) + statue(c, 304, 126, 0.94, STAT, 3512);
      o += spray(c, 20, 124, 1.1, 3513) + spray(c, 382, 124, 1.15, 3514) + spray(c, 150, 122, 0.4, 3515);
      o += coralClump(c, 56, 134, 0.9, 3516) + coralClump(c, 350, 136, 0.8, 3517) + kelp(c, 240, 134, 16, 3, 3.4);
      o += puddle(c, 200, 160, 40, 5) + puddle(c, 90, 196, 34, 5) + puddle(c, 320, 216, 40, 6) + pebbles(3518, 136, 236, '#3e5a58', 14, 10, 390);
      o += pearlLamp(c, 20, 180, 1.1, 46) + pearlLamp(c, 382, 186, 1.1, 46);
      return o + motes(3519, 14, 0, 400, 10, 120, '#e8fff8') + R(0, 0, 400, 240, c.rg([[0, '#fff', 0], [0.7, '#000', 0.1], [1, '#000', 0.45]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- drowned elf head (facing left): long face, ear sweeping back and up, teal glowing eye, white hair floating up ----
  function lockSet(x, y, k) {
    if (k === 'short') return [
      [[[x + 10, y - 8], [x + 22, y - 14], [x + 32, y - 8], [x + 42, y - 14]], 7, [2.6, 2.2, 1]],
      [[[x + 12, y - 2], [x + 24, y + 2], [x + 30, y + 12], [x + 42, y + 10]], 7, [2.4, 2.2, 2]],
      [[[x + 11, y + 4], [x + 16, y + 14], [x + 20, y + 24], [x + 30, y + 30]], 6, [2, 2]]
    ];
    return [
      [[[x + 2, y - 13], [x + 12, y - 27], [x + 26, y - 30], [x + 38, y - 25]], 8, [2.2, 2.2]],
      [[[x + 7, y - 9], [x + 20, y - 18], [x + 32, y - 12], [x + 44, y - 17]], 8, [2.6, 2.4, 1]],
      [[[x + 10, y - 3], [x + 22, y], [x + 30, y + 10], [x + 42, y + 8]], 7, [2.4, 2.2, 2]],
      [[[x + 10, y + 3], [x + 16, y + 14], [x + 20, y + 24], [x + 32, y + 30]], 6, [2, 2]]
    ];
  }
  function elfHead(c, x, y, o) {
    o = o || {};
    var sk = o.skin || SK, hc = o.hair || HAIR, s = '', HF = c.lg([[0, '#ffffff'], [0.5, hc], [1, dk(hc, 0.2)]], 0, 0, 1, 1);
    if (o.backHair) s += o.backHair(c, x, y);
    (o.locks || lockSet(x, y, o.helm || o.hood ? 'short' : 'full')).forEach(function (lk) { s += P(btaper(lk[0], lk[1], 1, 18, lk[2]), HF, 1.3); });
    if (o.hood) s += body(c, 'M' + pt([x - 6, y - 14]) + 'C' + pt([x, y - 27]) + ' ' + pt([x + 22, y - 23]) + ' ' + pt([x + 23, y - 4]) + 'C' + pt([x + 24, y + 10]) + ' ' + pt([x + 20, y + 18]) + ' ' + pt([x + 14, y + 22]) + 'L' + pt([x - 6, y + 18]) + 'Z', dk(o.hood, 0.25), '', 2);
    var d = 'M' + pt([x - 9, y - 7]) + 'C' + pt([x - 8, y - 16]) + ' ' + pt([x + 4, y - 19]) + ' ' + pt([x + 10, y - 14]) + 'C' + pt([x + 14, y - 10]) + ' ' + pt([x + 14, y]) + ' ' + pt([x + 12, y + 6]) +
      'C' + pt([x + 10, y + 13]) + ' ' + pt([x + 4, y + 17]) + ' ' + pt([x - 2, y + 17]) + 'C' + pt([x - 6, y + 17]) + ' ' + pt([x - 8, y + 13]) + ' ' + pt([x - 9, y + 9]) + 'L' + pt([x - 13, y + 3]) + 'L' + pt([x - 9.5, y + 1]) + 'C' + pt([x - 10, y - 2]) + ' ' + pt([x - 10, y - 4]) + ' ' + pt([x - 9, y - 7]) + 'Z';
    var sh = F('M' + pt([x + 3, y - 20]) + 'L' + pt([x + 16, y - 20]) + 'L' + pt([x + 16, y + 19]) + 'L' + pt([x, y + 19]) + 'C' + pt([x + 6, y + 8]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 20]) + 'Z', dk(sk, 0.22), 0.8) +
      F('M' + pt([x - 8, y + 4]) + 'C' + pt([x - 5, y + 3]) + ' ' + pt([x - 1, y + 5]) + ' ' + pt([x + 1, y + 11]) + 'C' + pt([x - 3, y + 10]) + ' ' + pt([x - 6, y + 9]) + ' ' + pt([x - 8, y + 4]) + 'Z', dk(sk, 0.3), 0.6) +
      L('M' + pt([x + 4, y + 9]) + 'q2,1 3,3 M' + pt([x + 3, y + 12]) + 'q2,1 3,3', '#3a9a90', 0.8);
    s += body(c, d, sk, sh, 2);
    var ear = P('M' + pt([x + 7, y - 2]) + 'C' + pt([x + 14, y - 6]) + ' ' + pt([x + 21, y - 10]) + ' ' + pt([x + 28, y - 18]) + 'C' + pt([x + 25, y - 7]) + ' ' + pt([x + 18, y + 2]) + ' ' + pt([x + 9, y + 5]) + 'Z', c.cel(sk), 1.4) + L('M' + pt([x + 10, y + 1]) + 'C' + pt([x + 16, y - 3]) + ' ' + pt([x + 21, y - 8]) + ' ' + pt([x + 24, y - 12]), dk(sk, 0.3), 0.8);
    if (o.helm) s += o.helm(c, x, y) + ear;
    else if (o.hood) {
      s += F('M' + pt([x - 14, y - 3]) + 'C' + pt([x - 8, y - 8]) + ' ' + pt([x + 2, y - 8]) + ' ' + pt([x + 8, y]) + 'L' + pt([x + 8, y - 18]) + 'L' + pt([x - 14, y - 18]) + 'Z', '#000', 0.3);
      s += body(c, 'M' + pt([x - 15, y + 2]) + 'C' + pt([x - 19, y - 17]) + ' ' + pt([x - 2, y - 28]) + ' ' + pt([x + 10, y - 24]) + 'C' + pt([x + 22, y - 18]) + ' ' + pt([x + 22, y + 6]) + ' ' + pt([x + 16, y + 18]) + 'L' + pt([x + 6, y + 18]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 4, y - 8]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x - 8, y - 12]) + ' ' + pt([x - 12, y - 6]) + ' ' + pt([x - 15, y + 2]) + 'Z', o.hood,
        F('M' + pt([x + 8, y - 28]) + 'L' + pt([x + 24, y - 28]) + 'L' + pt([x + 24, y + 20]) + 'L' + pt([x + 10, y + 20]) + 'Z', dk(o.hood, 0.3), 0.8) + L('M' + pt([x - 15, y + 2]) + 'C' + pt([x - 12, y - 6]) + ' ' + pt([x - 8, y - 12]) + ' ' + pt([x - 2, y - 12]) + 'C' + pt([x + 4, y - 8]) + ' ' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y + 18]), o.hoodTrim || PEARL, 2), 2.2) + ear;
      if (o.hoodTop) s += o.hoodTop(c, x, y);
    }
    else s += ear + P('M' + pt([x - 10, y - 6]) + 'C' + pt([x - 11, y - 18]) + ' ' + pt([x + 6, y - 23]) + ' ' + pt([x + 13, y - 13]) + 'C' + pt([x + 15, y - 8]) + ' ' + pt([x + 14, y - 3]) + ' ' + pt([x + 12, y + 1]) + 'C' + pt([x + 10, y - 6]) + ' ' + pt([x + 5, y - 11]) + ' ' + pt([x - 1, y - 11]) + 'C' + pt([x - 5, y - 11]) + ' ' + pt([x - 8, y - 9]) + ' ' + pt([x - 10, y - 6]) + 'Z', c.cel(hc), 1.5) +
      L('M' + pt([x - 4, y - 13]) + 'Q' + pt([x + 4, y - 17]) + ' ' + pt([x + 10, y - 12]), dk(hc, 0.25), 0.8);
    // the eye: an almond of teal light
    s += E(x - 5, y - 1.6, 7, 4.6, glow(c, o.eye || EYE, 0.95)) + P('M' + pt([x - 9.6, y - 1]) + 'L' + pt([x - 1.6, y - 3.6]) + 'L' + pt([x - 2.8, y + 0.8]) + 'Z', c.rg([[0, '#ffffff'], [0.45, '#d8fffa'], [1, o.eye || EYE]]), 0.8);
    if (!o.helm) s += L('M' + pt([x - 10.6, y - 5.2]) + 'Q' + pt([x - 6, y - 7.6]) + ' ' + pt([x - 0.6, y - 6.4]), OL, 1.3);
    s += L('M' + pt([x - 8.6, y + 10]) + 'Q' + pt([x - 6, y + 11]) + ' ' + pt([x - 3, y + 9.6]), dk(sk, 0.55), 1.1);
    if (o.top) s += o.top(c, x, y);
    return s;
  }
  // tall elven helm with a fin crest (the ear goes over it)
  function finHelm(col, trim, crest) {
    return function (c, x, y) {
      var d = 'M' + pt([x - 11, y - 4]) + 'C' + pt([x - 12, y - 18]) + ' ' + pt([x + 3, y - 25]) + ' ' + pt([x + 13, y - 16]) + 'C' + pt([x + 17, y - 10]) + ' ' + pt([x + 17, y + 2]) + ' ' + pt([x + 15, y + 9]) + 'L' + pt([x + 7, y + 13]) + 'L' + pt([x + 3, y + 3]) + 'C' + pt([x, y - 3]) + ' ' + pt([x - 5, y - 5.5]) + ' ' + pt([x - 11, y - 4]) + 'Z';
      var s = '';
      if (crest !== 'coral') {
        var fin = 'M' + pt([x - 5, y - 19]) + 'C' + pt([x - 2, y - 30]) + ' ' + pt([x + 12, y - 34]) + ' ' + pt([x + 28, y - 30]) + 'C' + pt([x + 22, y - 27]) + ' ' + pt([x + 19, y - 20]) + ' ' + pt([x + 15, y - 12]) + 'Z';
        s += P(fin, c.lg([[0, lt(crest || VERD, 0.3)], [1, dk(crest || VERD, 0.2)]]), 1.5) + L('M' + pt([x - 1, y - 20]) + 'L' + pt([x + 6, y - 30]) + 'M' + pt([x + 4, y - 18]) + 'L' + pt([x + 14, y - 30]) + 'M' + pt([x + 9, y - 16]) + 'L' + pt([x + 21, y - 28]), dk(crest || VERD, 0.35), 1);
      }
      s += body(c, d, col, F('M' + pt([x + 5, y - 26]) + 'L' + pt([x + 20, y - 26]) + 'L' + pt([x + 20, y + 14]) + 'L' + pt([x + 8, y + 14]) + 'C' + pt([x + 8, y]) + ' ' + pt([x + 9, y - 14]) + ' ' + pt([x + 5, y - 26]) + 'Z', dk(col, 0.3), 0.75) + E(x - 4, y - 15, 4, 2, '#ffffff', 0, 0.35), 1.9);
      s += L('M' + pt([x - 11, y - 4]) + 'C' + pt([x - 5, y - 6]) + ' ' + pt([x, y - 3]) + ' ' + pt([x + 3, y + 3]) + 'L' + pt([x + 7, y + 12]), trim, 1.5) + C(x - 7, y - 7.4, 1.8, c.cel(PEARL), 0.8);
      if (crest === 'coral') {
        s += coralBranch(c, x + 2, y - 18, 12, 18, CORAL, 41, 3.4) + coralBranch(c, x + 7, y - 16, 12, 24, CORALR, 42, 3) + coralBranch(c, x - 2, y - 17, 11, 10, CORALO, 43, 2.6) + coralBranch(c, x + 11, y - 12, 9, 22, CORAL, 44, 2.4);
        s += barn(c, x + 4, y - 18, 1.8) + barn(c, x + 10, y - 15, 1.4);
      }
      return s;
    };
  }
  // circlet with a crescent on the brow
  function circlet(col) {
    return function (c, x, y) {
      var b = 'M' + pt([x - 10, y - 8]) + 'C' + pt([x - 6, y - 12]) + ' ' + pt([x + 6, y - 14]) + ' ' + pt([x + 12, y - 8]);
      return L(b, OL, 3.8) + L(b, col, 2) + G(P(crescentD(x - 6, y - 13, 3.4), c.cel(col), 0.8), 'rotate(-90 ' + n(x - 6) + ' ' + n(y - 13) + ')') + C(x - 6, y - 13.6, 1.3, PEARL, 0.6);
    };
  }
  function trident(c, p, len, ang, o) {
    o = o || {};
    var q = dirQ(p, ang), sw = o.w || 3.2, bk = o.back == null ? 12 : o.back, wd = o.wd || 7, pl = o.pl || 14, col = o.col || GOLD;
    var sh = 'M' + pt(q(-bk, 0)) + 'L' + pt(q(len - 4, 0));
    var s = L(sh, OL, sw + 2.6) + L(sh, dk(col, 0.22), sw) + L('M' + pt(q(-bk, -sw * 0.22)) + 'L' + pt(q(len - 4, -sw * 0.22)), lt(col, 0.4), sw * 0.3, 0.8);
    if (o.bands) s += L('M' + pt(q(len * 0.3, -sw * 0.7)) + 'L' + pt(q(len * 0.3, sw * 0.7)) + 'M' + pt(q(-bk * 0.5, -sw * 0.7)) + 'L' + pt(q(-bk * 0.5, sw * 0.7)), VERD, 1.6);
    var ub = 'M' + pt(q(len + 2, -wd)) + 'Q' + pt(q(len - 5, -wd * 0.5)) + ' ' + pt(q(len - 5, 0)) + 'Q' + pt(q(len - 5, wd * 0.5)) + ' ' + pt(q(len + 2, wd));
    s += L(ub, OL, sw + 3) + L(ub, col, sw + 0.4) + L(ub, lt(col, 0.4), 0.8, 0.8);
    function prong(v0, v1, l) { return P(pd([q(len + 1, v0 - 1.5), q(len + l * 0.66, v1 - 1.1), q(len + l * 0.58, v1 - 3.2), q(len + l, v1), q(len + l * 0.58, v1 + 3.2), q(len + l * 0.66, v1 + 1.1), q(len + 1, v0 + 1.5)], true), c.cel(lt(col, 0.1)), 1.2); }
    s += prong(-wd, -wd * 1.18, pl * 0.78) + prong(wd, wd * 1.18, pl * 0.78) + prong(0, 0, pl);
    if (o.coral) s += coralBranch(c, q(len - 3, -wd * 0.6)[0], q(len - 3, -wd * 0.6)[1], 7, -3, CORAL, 51, 1.4) + coralBranch(c, q(len - 3, wd * 0.6)[0], q(len - 3, wd * 0.6)[1], 6, 3, CORALO, 52, 1.3);
    if (o.gem !== false) { var g = q(len - 5, 0); s += C(g[0], g[1], 8, glow(c, EYE, 0.85)) + C(g[0], g[1], 2.4, c.rg([[0, '#ffffff'], [0.5, EYE], [1, '#1a9a90']]), 0.8); }
    return s;
  }
  function towerShield(c, x, y, w, h, col, trim) {
    var sd = function (a, b, ww, hh) { return 'M' + pt([a, b + 8]) + 'Q' + pt([a + ww / 2, b - 5]) + ' ' + pt([a + ww, b + 8]) + 'L' + pt([a + ww, b + hh - 18]) + 'Q' + pt([a + ww, b + hh - 4]) + ' ' + pt([a + ww / 2, b + hh + 4]) + 'Q' + pt([a, b + hh - 4]) + ' ' + pt([a, b + hh - 18]) + 'Z'; };
    var d = sd(x, y, w, h), o = body(c, d, col, F(pd([[x + w * 0.64, y - 6], [x + w + 3, y - 6], [x + w + 3, y + h + 6], [x + w * 0.64, y + h + 6]], true), dk(col, 0.3), 0.7) + E(x + w * 0.3, y + 12, 5, 8, '#ffffff', 0, 0.25), 2.3);
    o += L(sd(x + 4, y + 4, w - 8, h - 8), trim, 1.6) + L('M' + pt([x + w / 2, y + 6]) + 'L' + pt([x + w / 2, y + h * 0.26]) + 'M' + pt([x + w / 2, y + h * 0.6]) + 'L' + pt([x + w / 2, y + h - 2]), dk(col, 0.35), 1.6);
    o += moonPearl(c, x + w / 2, y + h * 0.44, w * 0.27, trim, true);
    return o + coralBranch(c, x + 5, y + 6, 11, -5, CORAL, 61, 2) + coralBranch(c, x + w - 6, y + 4, 9, 3, CORALO, 62, 1.8) + barn(c, x + 8, y + h - 16, 2.2) + barn(c, x + 12, y + h - 10, 1.7) + barn(c, x + w - 10, y + h * 0.7, 1.8);
  }
  function scallop(c, x, y, r, col) {
    var pts = [], k = 7, i, d;
    for (i = 0; i <= k; i++) { var a = PI + 0.3 + i * (PI - 0.6) / k; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.9]); }
    d = 'M' + pt([x, y + 2]) + 'L' + pt(pts[0]);
    for (i = 1; i <= k; i++) { var am = PI + 0.3 + (i - 0.5) * (PI - 0.6) / k; d += 'Q' + pt([x + Math.cos(am) * r * 1.14, y + Math.sin(am) * r * 1.02]) + ' ' + pt(pts[i]); }
    var rb = ''; pts.forEach(function (p) { rb += 'M' + pt([x, y + 1]) + 'L' + pt(p); });
    return P(d + 'Z', c.cel(col || '#e8dcd0'), 1.6) + L(rb, dk(col || '#e8dcd0', 0.3), 0.9) + E(x, y + 2, 3, 2, c.cel(dk(col || '#e8dcd0', 0.15)), 1);
  }
  function coralStaff(c, p, len, bk) {
    var t = [p[0], p[1] - len], o = haft(c, p, len, -PI / 2, '#8a6a5a', 3.2, bk);
    o += C(t[0], t[1] - 4, 14, glow(c, '#c8fff4', 0.75)) + coralBranch(c, t[0], t[1] + 2, 14, -5, CORAL, 71, 1.9) + coralBranch(c, t[0] + 1, t[1] + 2, 12, 5, CORALO, 72, 1.7);
    return o + C(t[0], t[1] - 5, 3.8, c.rg([[0, '#ffffff'], [0.6, PEARL], [1, '#9ac8c0']]), 1.1);
  }
  function waterOrb(c, x, y, r, col) {
    col = col || TEAL;
    var o = C(x, y, r * 2.8, glow(c, col, 0.65)) + C(x, y, r, c.rg([[0, '#ffffff', 0.95], [0.5, lt(col, 0.3), 0.8], [1, dk(col, 0.35), 0.85]]), 1.2);
    var sw = 'M' + pt([x - r * 0.6, y + r * 0.2]) + 'C' + pt([x - r * 0.5, y - r * 0.7]) + ' ' + pt([x + r * 0.7, y - r * 0.6]) + ' ' + pt([x + r * 0.5, y + r * 0.1]) + 'C' + pt([x + r * 0.3, y + r * 0.6]) + ' ' + pt([x - r * 0.2, y + r * 0.4]) + ' ' + pt([x - r * 0.1, y]);
    o += L(sw, '#ffffff', 1.1, 0.9) + L(ellD(x, y, r * 1.8, r * 0.5), lt(col, 0.3), 1.2, 0.8);
    return o + drop(c, x - r * 1.9, y - r * 0.4, 1.1, true) + drop(c, x + r * 1.8, y - r * 0.9, 1, true) + drop(c, x + r * 0.4, y - r * 1.9, 1.2, true);
  }
  function drop(c, x, y, r, up, col) { var k = up ? -1 : 1; return P('M' + pt([x, y + k * r * 2.3]) + 'C' + pt([x + r * 0.9, y + k * r * 0.6]) + ' ' + pt([x + r, y - k * r * 0.6]) + ' ' + pt([x, y - k * r]) + 'C' + pt([x - r, y - k * r * 0.6]) + ' ' + pt([x - r * 0.9, y + k * r * 0.6]) + ' ' + pt([x, y + k * r * 2.3]) + 'Z', c.lg([[0, '#ffffff'], [1, col || '#6ae0e0']]), 0.7); }
  // one arc of a water helix
  function swirlArc(c, q, w0, w1, col, op) {
    return P(btaper(q, w0, w1, 20), c.lg([[0, lt(col, 0.45), op], [1, col, op]], 0, 0, 1, 1), 1) + L(bline(q, 14, [-0.5, -0.7]), '#ffffff', Math.max(0.6, Math.min(w0, w1) * 0.24), 0.85);
  }
  function sparkle(x, y, r, col) { return L('M' + pt([x - r, y]) + 'L' + pt([x + r, y]) + 'M' + pt([x, y - r]) + 'L' + pt([x, y + r]), col, 0.9, 0.95) + C(x, y, r * 0.35, '#ffffff'); }
  // crescent moon blade held at its back (p = hand); rot turns it
  function moonBlade(c, p, r, rot, col) {
    // the crescent's horns face away from the hand: build it horns-right around (cx, cy), then turn it about the hand
    var cx = p[0] + r * 1.02, cy = p[1], edge = 'M' + pt([cx + r * 0.3, cy - r * 0.95]) + 'A' + n(r * 1.1) + ',' + n(r * 1.1) + ' 0 0,0 ' + pt([cx + r * 0.3, cy + r * 0.95]);
    var s = G(C(cx, cy, r * 1.4, glow(c, '#dffcff', 0.4)) + P(crescentD(cx, cy, r), c.lg([[0, '#ffffff'], [0.45, col || SILV], [1, '#6a9aa4']], 0, 0, 1, 1), 1.9) + L(edge, '#46c8d8', 1.4, 0.95) +
      L('M' + pt([cx - r * 0.5, cy - r * 0.66]) + 'Q' + pt([cx - r * 0.82, cy]) + ' ' + pt([cx - r * 0.5, cy + r * 0.66]), '#ffffff', 1.1, 0.9) + R(p[0] - 2, p[1] - 5, 4, 10, c.cel('#2a4a50'), 1.1) + C(p[0], p[1] - 6, 1.6, c.cel(PEARL), 0.7), 'rotate(' + n(rot) + ' ' + n(p[0]) + ' ' + n(p[1]) + ')');
    return s;
  }
  function kelpCape(c, pts, col) { return P(pts, c.lg([[0, lt(col, 0.2)], [1, dk(col, 0.3)]], 0, 0, 1, 1), 1.8); }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    tidecrown_guard: function (c) {
      // royal guard: pearl-silver plate grown over with red coral, a teal tabard, gold trim (the Tidewatch sentinels wear dark teal)
      var pl = '#a8c8c4', pld = '#2a5a60', cr = '#d8584a';
      return biped(c, {
        skin: SK, shirt: pl, pants: pld, sleeve: pl, glove: pl, boots: '#1e3e40', legW: 10.5, shadowR: 34, belt: GOLDD, buckle: PEARL, hx: 60, hy: 31,
        chest: function (c) { return P('M56,52 L72,52 L72,86 L56,86 Z', c.cel(ROBE2), 1.4) + L('M57,53 L57,85 M71,53 L71,85', GOLD, 1) + moonPearl(c, 64, 66, 4.4, GOLD, false) + L('M50,52 L56,56 M78,52 L72,56', GOLD, 1.4) + barn(c, 76, 72, 1.8) + barn(c, 78, 77, 1.4); },
        front: function (c) { return body(c, 'M50,86 L78,86 L80,100 L64,104 L48,100 Z', pl, L('M64,88 L64,102', dk(pl, 0.35), 1.2) + L('M50,98 L64,102 L78,98', GOLD, 1.2), 1.8) + P('M58,86 L70,86 L68,108 L64,112 L60,108 Z', c.cel(ROBE2), 1.3); },
        pads: function (c) { return pauldron(c, 80, 50, 9, cr, GOLD) + coralBranch(c, 84, 44, 11, 5, CORAL, 81, 2) + brain(c, 48, 53, 12, 9, cr) + coralBranch(c, 42, 46, 10, -5, CORALO, 82, 1.8) + barn(c, 52, 47, 1.6); },
        shins: function (c) { return L('M70,104 l2,8 M50,104 l-1,8', GOLD, 1.2, 0.8); },
        head: function (c, x, y) { return elfHead(c, x, y, { helm: finHelm(pl, GOLD, cr) }); },
        far: [[80, 54], [92, 66], [96, 60]], wFar: function (c, p) { return trident(c, p, 42, -PI / 2 - 0.1, { back: 58, w: 3, wd: 6.5, pl: 13 }); }, farHand: gauntlet(pl),
        near: [[48, 54], [40, 68], [34, 74]], nearHand: gauntlet(pl),
        wNearFront: function (c) { return towerShield(c, 13, 40, 38, 74, '#cfe2de', GOLD); }
      });
    },
    tidecrown_tidecaller: function (c) {
      // water mage: a hood of woven kelp, a sea-foam robe, a mantle of kelp fronds and a coral staff (the Tidewatch sorceress is bare-headed, in navy)
      var rb = '#3a8a78', rbl = '#e0ece4', hd = '#35603e';
      var frond = function (x, y, k) { var o = ''; [[-8, 12, 7], [-2, 16, 8], [5, 13, 7]].forEach(function (f, i) { o += P(btaper([[x + f[0] * k, y - 4], [x + f[0] * k - 2 * k, y + f[1] * 0.4], [x + f[0] * k + 2 * k, y + f[1] * 0.7], [x + f[0] * k, y + f[1]]], f[2], 1.2, 12), c.lg([[0, lt(KELP, 0.2)], [1, dk(KELP, 0.2)]], 0, 0, 1, 0), 1.2); }); return o; };
      return robeRig(c, {
        robe: rb, sleeve: rb, skin: SK, glove: SK, panel: '#2a6a5e', trim: rbl, hem: rbl, waist: [50, 78], flare: [32, 98], shadowR: 34, sash: hd, hx: 58, hy: 31,
        panelX: function (c, m, y0) { return moonPearl(c, m - 1, y0 + 14, 4, SILV, false) + L('M' + pt([m - 1, y0 + 20]) + 'L' + pt([m - 2, y0 + 32]), SILV, 1, 0.8); },
        back: function (c) { return kelp(c, 76, 88, 30, 3, 5, hd) + kelp(c, 84, 86, 24, -3, 4, hd); },
        chest: function (c) { return L('M52,48 L64,58 L76,48', rbl, 1.4) + L('M54,52 Q64,62 74,52', PEARL, 1.6, 0.9) + C(64, 58, 1.8, c.cel(PEARL), 0.8) + C(58, 55, 1.2, PEARL, 0.6) + C(70, 55, 1.2, PEARL, 0.6) + barn(c, 72, 72, 1.6); },
        pads: function (c) { return frond(80, 50, 0.8) + frond(48, 51, 1); },
        head: function (c, x, y) { return elfHead(c, x, y, { hood: hd, hoodTrim: PEARL, hoodTop: function (c, x, y) { return coralBranch(c, x + 6, y - 22, 9, 6, CORAL, 83, 1.8) + C(x - 4, y - 16, 1.8, c.cel(PEARL), 0.7); } }); },
        near: [[48, 54], [40, 68], [32, 66]], wNear: function (c, p) { return coralStaff(c, p, 40, 118 - p[1]); }, wNearFront: function (c, p) { return cuff(c, [40, 68], p, rb, rbl); },
        far: [[80, 54], [94, 48], [100, 36]], farHand: function (c, p) { return hand(p, c.cel(SK)) + waterOrb(c, p[0] - 2, p[1] - 12, 5.6); }
      });
    },
    abyssal_spawn: function (c) {
      var o = shadow(c, 64, 40), TF = c.lg([[0, '#20406a'], [0.55, '#122038'], [1, DEEP]], 0, 0, 1, 1);
      o += C(64, 76, 58, glow(c, '#2a8a9a', 0.35));
      var tents = [[[[46, 96], [30, 102], [18, 118], [8, 110]], 9], [[[56, 100], [50, 112], [44, 122], [32, 121]], 8], [[[64, 102], [64, 112], [62, 121], [74, 123]], 7], [[[74, 100], [82, 112], [90, 122], [102, 120]], 8], [[[84, 96], [100, 100], [112, 116], [122, 108]], 9]];
      var tips = '';
      tents.forEach(function (t, i) {
        var d = btaper(t[0], t[1], 1.4, 20, [2, 1.6, i]);
        o += F(d, TEAL, 0.85).replace('/>', ' transform="translate(-1.2,-1.2)"/>') + P(d, TF, 1.7);
        var tp = t[0][3]; tips += C(tp[0], tp[1], 6, glow(c, TEAL, 0.9)) + C(tp[0], tp[1], 1.6, '#e8fffb');
        for (var k = 2; k < 5; k++) { var sp = bz(t[0], k * 0.2); tips += C(sp[0], sp[1], 1.3 - k * 0.12, TEAL, 0, 0.85); }
      });
      // spines along the crown
      [[-2.3, 12], [-1.9, 15], [-1.25, 15], [-0.85, 12]].forEach(function (k) { var a = k[0], b = [64 + Math.cos(a) * 34, 76 + Math.sin(a) * 34], e = [64 + Math.cos(a) * (34 + k[1]), 76 + Math.sin(a) * (34 + k[1])]; o += P(pd([[b[0] - Math.sin(a) * 3.4, b[1] + Math.cos(a) * 3.4], e, [b[0] + Math.sin(a) * 3.4, b[1] - Math.cos(a) * 3.4]], true), c.lg([[0, '#3a5270'], [1, '#141e30']]), 1.3) + C(e[0], e[1], 1.4, VIO); });
      // lure stalk arching forward
      o += P(btaper([[66, 46], [62, 22], [40, 14], [30, 26]], 4.4, 2, 20), c.lg([[0, NAVL], [1, NAVY]], 0, 0, 1, 0), 1.4);
      var bd = 'M30,92 C26,64 42,42 64,42 C86,42 102,64 98,92 C95,103 84,108 64,108 C44,108 33,103 30,92 Z';
      o += L(bd, TEAL, 5, 0.45) + F(bd, TEAL, 0.9).replace('/>', ' transform="translate(-1.8,-1.6)"/>') + F(bd, VIO, 0.8).replace('/>', ' transform="translate(1.8,-1)"/>');
      o += P(bd, c.lg([[0, '#3a6a96'], [0.35, '#1a2e4a'], [0.8, dk(NAVY, 0.2)], [1, DEEP]], 0.3, 0, 0.6, 1), 2.2) + F('M38,70 C44,54 54,47 66,46 C54,52 46,60 42,74 Z', lt(NAVL, 0.14), 0.7);
      // the maw
      var up = 'M38,86 Q64,74 90,86', mw = 'M38,86 Q64,74 90,86 Q86,104 64,106 Q42,104 38,86 Z';
      o += P(mw, c.rg([[0, '#5a2080'], [0.5, '#22083a'], [1, '#07020c']]), 1.8) + E(64, 98, 14, 6, glow(c, VIO, 0.8));
      var tt = '';
      [[43, 7], [50, 10], [57, 8], [64, 12], [71, 8], [78, 10], [85, 7]].forEach(function (t) { var y0 = 86 - (1 - Math.pow((t[0] - 64) / 26, 2)) * 6 + 0.6; tt += 'M' + pt([t[0] - 2, y0]) + 'L' + pt([t[0], y0 + t[1]]) + 'L' + pt([t[0] + 2, y0]) + 'Z'; });
      [[47, 5], [55, 7], [64, 6], [73, 7], [81, 5]].forEach(function (t) { var y0 = 104 - Math.abs(t[0] - 64) * 0.16; tt += 'M' + pt([t[0] - 1.8, y0]) + 'L' + pt([t[0], y0 - t[1]]) + 'L' + pt([t[0] + 1.8, y0]) + 'Z'; });
      o += P(tt, c.lg([[0, '#ffffff'], [1, '#9ab6ba']], 0, 0, 1, 0), 0.9) + L(up, '#2c4a6a', 1.2, 0.9);
      // eyes, the brow, dots of light
      [[52, 66, 5.4, TEAL, 16], [76, 66, 5.4, TEAL, -16], [64, 56, 2.8, VIO, 0], [40, 76, 2.6, TEAL, 24], [88, 76, 2.6, TEAL, -24]].forEach(function (e) {
        var x = e[0], y = e[1], r = e[2], rt = ' transform="rotate(' + e[4] + ' ' + x + ' ' + y + ')"';
        o += E(x, y, r * 2.4, r * 2, glow(c, e[3], 0.75)) + P('M' + pt([x - r, y]) + 'Q' + pt([x, y - r * 0.9]) + ' ' + pt([x + r, y]) + 'Q' + pt([x, y + r * 0.7]) + ' ' + pt([x - r, y]) + 'Z', c.rg([[0, '#ffffff'], [0.4, e[3]], [1, dk(e[3], 0.4)]]), 1.2).replace('/>', rt + '/>') + E(x, y, r * 0.16, r * 0.42, DEEP).replace('/>', rt + '/>');
      });
      o += P('M42,62 C48,57 56,58 60,63 L64,65 L68,63 C72,58 80,57 86,62 L84,58 C78,54 72,55 68,59 L64,61 L60,59 C56,55 50,54 44,58 Z', dk(NAVY, 0.3), 1.2);
      o += C(46, 52, 1.2, TEAL) + C(82, 52, 1.2, TEAL) + C(36, 86, 1.4, TEAL) + C(92, 86, 1.4, TEAL);
      o += tips + C(30, 28, 12, glow(c, TEAL, 0.9)) + P('M30,22 C35,22 36,29 33,33 C31,35 29,35 27,33 C24,29 25,22 30,22 Z', c.rg([[0, '#ffffff'], [0.4, '#b8fff4'], [1, TEAL]]), 1.3);
      return o;
    },
    commander_serathis: function (c) {
      // knight-commander: gilded plate gone green at the seams, the prince's teal cloak, a crest of living coral, a huge silver trident
      // (the Tidewatch's Warden Ithrael wears dark teal with a glaive)
      var pl = '#b08a3a', pll = '#c8a24a', tr = '#fff0c0', ver = '#4a8a70';
      return biped(c, {
        skin: SK, shirt: pl, pants: '#1e3e48', sleeve: pl, glove: pl, boots: '#16303a', legW: 11.5, armW: 10, shadowR: 38, belt: ROBE, buckle: PEARL, hx: 58, hy: 33,
        legF: 'M70,86 L78,103 L80,113', footF: [81, 121], legN: 'M56,86 L50,103 L48,113', footN: [46, 121],
        torsoD: 'M44,50 C50,44 78,44 84,50 L82,70 L80,88 L48,88 L46,70 Z',
        back: function (c) { return kelpCape(c, 'M70,46 C88,52 100,70 108,92 C112,104 116,112 118,120 L110,114 L104,120 L98,110 L90,118 L86,104 C80,84 74,66 66,52 Z', ROBE) + L('M92,70 C98,86 104,100 110,114 M84,74 C88,90 92,102 98,110', dk(ROBE, 0.4), 1.2) + L('M110,114 L104,120 L98,110 L90,118', GOLD, 1.2) + barn(c, 100, 96, 1.8); },
        chest: function (c) { return body(c, 'M48,52 C56,48 72,48 80,52 L78,74 L64,82 L50,74 Z', pll, L('M64,52 L64,80', dk(pll, 0.35), 1.2) + L('M50,54 C56,50 64,50 70,52', '#ffffff', 1.2, 0.5) + F('M72,60 C76,64 76,70 72,74 Z', ver, 0.7), 1.8) + P('M56,58 L72,58 L70,72 L64,77 L58,72 Z', c.cel(ROBE2), 1.4) + moonPearl(c, 64, 67, 5.4, SILV, true) + L('M50,74 L64,82 L78,74', tr, 1.4); },
        front: function (c) { var o = ''; [[46, 0], [58, 1], [70, 0]].forEach(function (t) { o += body(c, pd([[t[0], 86], [t[0] + 13, 86], [t[0] + 12, 102 - t[1] * 2], [t[0] + 1, 104 - t[1] * 2]], true), t[1] ? pll : pl, L('M' + pt([t[0] + 2, 100 - t[1] * 2]) + 'L' + pt([t[0] + 11, 99 - t[1] * 2]), tr, 1.1) + F(pd([[t[0] + 7, 90], [t[0] + 13, 90], [t[0] + 12, 102], [t[0] + 8, 102]], true), ver, 0.5), 1.6); }); return o + barn(c, 52, 96, 1.6); },
        pads: function (c) {
          return pauldron(c, 82, 50, 10, pll, tr) + coralBranch(c, 88, 42, 12, 6, CORALR, 91, 2) + barn(c, 78, 46, 1.6) +
            P('M34,58 C30,46 36,36 46,34 C44,30 42,26 38,20 C52,24 62,34 64,48 C60,58 46,62 34,58 Z', c.cel(pll), 2) + L('M37,54 C36,46 40,40 48,39 M42,26 C50,30 58,38 60,46', tr, 1.2) + F('M38,56 C42,58 48,58 52,56 C48,52 42,52 38,56 Z', ver, 0.6) + coralBranch(c, 40, 34, 12, -6, CORAL, 92, 2.2) + barn(c, 44, 52, 2) + barn(c, 50, 55, 1.5);
        },
        shins: function (c) { return L('M78,104 l1,8 M49,104 l-1,8', tr, 1.3, 0.9); },
        head: function (c, x, y) { return elfHead(c, x, y, { helm: finHelm(pll, tr, 'coral') }); },
        near: [[46, 54], [34, 64], [30, 60]], wNear: function (c, p) { return trident(c, p, 36, -PI / 2, { back: 120 - p[1], w: 4.2, wd: 9, pl: 16, coral: true, bands: true, col: '#c8dcdc' }) + L('M22,121 l-6,2 M30,122 l2,2 M38,121 l6,2', OL, 1.4); }, nearHand: gauntlet(pll),
        far: [[82, 54], [96, 68], [84, 82]], farHand: gauntlet(pll)
      });
    },
    tide_twin_myrel: function (c) {
      var gw = '#2a8a8a', wc = '#5ae0d8', gd = '#ffe08a', o = '';
      var back = swirlArc(c, [[100, 96], [96, 84], [40, 86], [30, 78]], 4, 5, wc, 0.7) + swirlArc(c, [[100, 62], [96, 50], [52, 50], [40, 46]], 6, 5, wc, 0.7);
      var front = swirlArc(c, [[30, 110], [44, 122], [92, 112], [100, 96]], 2, 4, wc, 0.85) + swirlArc(c, [[30, 78], [42, 90], [92, 78], [100, 62]], 5, 6, wc, 0.85);
      front += sparkle(98, 96, 2.6, gd) + sparkle(30, 78, 2.4, gd) + sparkle(100, 62, 2.4, gd) + drop(c, 106, 84, 1.3, true) + drop(c, 24, 100, 1.2, true) + drop(c, 108, 52, 1.2, true) + drop(c, 22, 66, 1.1, true);
      o += back + robeRig(c, {
        robe: gw, sleeve: gw, skin: SK, glove: SK, panel: '#1c5a60', trim: GOLD, hem: GOLD, waist: [52, 76], flare: [30, 100], shadowR: 36, sash: GOLDD, hx: 58, hy: 31, armW: 8,
        torsoD: 'M50,48 C54,44 74,44 78,48 L78,68 L76,86 L52,86 L50,68 Z',
        panelX: function (c, m, y0) { return moonPearl(c, m - 1, y0 + 14, 4.4, GOLD, false) + L('M' + pt([m - 5, y0 + 22]) + 'Q' + pt([m - 1, y0 + 18]) + ' ' + pt([m + 3, y0 + 22]) + 'M' + pt([m - 5, y0 + 28]) + 'Q' + pt([m - 1, y0 + 24]) + ' ' + pt([m + 3, y0 + 28]), GOLDL, 1, 0.9); },
        chest: function (c) { return P('M54,48 L74,48 L70,70 L64,76 L58,70 Z', c.cel(GOLD), 1.3) + P('M57,51 L71,51 L68,67 L64,71 L60,67 Z', c.cel(gw), 1) + C(64, 58, 2.2, c.cel(PEARL), 0.8); },
        pads: function (c) { return E(78, 51, 6, 5, c.cel(GOLD), 1.6) + E(50, 52, 7, 6, c.cel(GOLD), 1.6) + C(50, 52, 1.6, PEARL, 0.6); },
        head: function (c, x, y) { return elfHead(c, x, y, { top: circlet(GOLD) }); },
        near: [[50, 54], [40, 40], [36, 26]], nearHand: function (c, p) { return hand(p, c.cel(SK)) + swirlArc(c, [[36, 22], [30, 14], [38, 8], [32, 2]], 5, 1.4, wc, 0.9) + drop(c, 26, 12, 1.3, true) + drop(c, 44, 6, 1.1, true) + sparkle(40, 16, 2.4, gd) + C(34, 16, 12, glow(c, wc, 0.7)); },
        wNearFront: function (c, p) { return cuff(c, [40, 40], p, gw, GOLD); },
        far: [[78, 54], [90, 66], [96, 78]], farHand: function (c, p) { return hand(p, c.cel(SK)) + C(p[0], p[1] - 6, 10, glow(c, wc, 0.7)) + drop(c, p[0] - 2, p[1] - 9, 1.4, true) + drop(c, p[0] + 3, p[1] - 14, 1.1, true); }
      }) + front;
      return o;
    },
    tide_twin_sorin: function (c) {
      var lc = '#2a8a8a', wc = '#4ab4dc', sv = '#ffffff', o = '';
      var back = swirlArc(c, [[100, 14], [94, 2], [36, 16], [26, 34]], 7, 6, wc, 0.7) + swirlArc(c, [[100, 56], [98, 70], [36, 66], [26, 78]], 5, 4, wc, 0.7);
      var front = swirlArc(c, [[26, 34], [30, 52], [90, 64], [100, 56]], 6, 5, wc, 0.85) + swirlArc(c, [[26, 78], [32, 96], [92, 104], [98, 98]], 4, 3, wc, 0.85) + swirlArc(c, [[98, 98], [96, 112], [74, 118], [60, 120]], 3, 1, wc, 0.85);
      front += E(60, 121, 12, 2.4, FOAM, 0, 0.85) + drop(c, 50, 114, 1.2, false) + drop(c, 70, 112, 1.1, false) + drop(c, 108, 40, 1.3, false) + drop(c, 18, 58, 1.2, false) + drop(c, 110, 84, 1.1, false) + sparkle(26, 34, 2.4, sv) + sparkle(100, 56, 2.4, sv) + sparkle(26, 78, 2.2, sv);
      o += back + biped(c, {
        skin: SK, shirt: lc, pants: '#1e5a60', sleeve: lc, glove: SK, boots: '#8aa8a8', legW: 9.5, armW: 8.4, shadowR: 36, belt: SILV, buckle: '#ffffff', hx: 58, hy: 33,
        legF: 'M68,86 L80,100 L86,113', footF: [90, 121], legN: 'M56,86 L46,102 L40,113', footN: [38, 121],
        torsoD: 'M48,50 C54,45 74,45 80,50 L78,70 L76,88 L52,88 L50,70 Z',
        chest: function (c) { return P('M54,50 L74,50 L72,72 L64,78 L56,72 Z', c.cel(SILV), 1.3) + P('M57,53 L71,53 L69,69 L64,73 L59,69 Z', c.cel(lc), 1) + C(64, 60, 2.2, c.cel(PEARL), 0.8); },
        front: function (c) { return body(c, 'M52,86 L76,86 L74,98 L64,104 L54,98 Z', '#1c5a60', L('M54,96 L64,102 L74,96', SILV, 1.2), 1.6) + P('M56,86 L62,86 L58,110 L52,106 Z', c.cel(lc), 1.3); },
        pads: function (c) { return E(79, 52, 6, 5, c.cel(SILV), 1.6) + E(49, 53, 7, 6, c.cel(SILV), 1.6) + C(49, 53, 1.6, PEARL, 0.6); },
        shins: function (c) { return L('M84,106 l1,6 M42,106 l-1,6', '#ffffff', 1.2, 0.8); },
        head: function (c, x, y) { return elfHead(c, x, y, { top: circlet(SILV) }); },
        near: [[48, 54], [38, 58], [30, 50]], wNearFront: function (c, p) { return moonBlade(c, p, 12, 200, SILV); },
        far: [[80, 54], [92, 64], [100, 72]], wFar: function (c, p) { return moonBlade(c, p, 11, 30, SILV); }
      }) + front;
      return o;
    },
    coralheart_colossus: function (c) {
      var cb = '#d0645a', cl = '#e8866a', o = shadow(c, 64, 54);
      function polyps(seed, x0, x1, y0, y1, cnt) { var r = rng(seed), s = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); s += C(x, y, 1 + r() * 1.2, dk(cb, 0.35), 0, 0.8) + C(x - 0.3, y - 0.4, 0.5, lt(cl, 0.4), 0, 0.8); } return s; }
      function cLimb(pts, w, col) { var d = pd(pts); return L(d, OL, w + 4.5) + L(d, col, w) + L(d, dk(col, 0.25), w * 0.3, 0.8).replace('/>', ' transform="translate(2,2)"/>') + L(pd(pts.map(function (p) { return [p[0] - w * 0.22, p[1] - w * 0.14]; })), lt(col, 0.3), w * 0.2, 0.8); }
      // antler coral from the back, a fan coral behind the shoulder
      o += fanCoral(c, 104, 50, 1.1, CORALP) + coralBranch(c, 84, 34, 26, 12, CORALR, 101, 3.4) + coralBranch(c, 96, 40, 20, 18, CORAL, 102, 3) + coralBranch(c, 74, 30, 20, 2, CORALO, 103, 2.8);
      // far arm and fist, far leg
      o += cLimb([[90, 46], [112, 66], [110, 88]], 15, dk(cb, 0.12)) + brain(c, 110, 104, 14, 12, dk(CORALO, 0.1)) + P('M96,104 C96,112 124,112 124,104 Z', c.cel(dk(CORALO, 0.2)), 1.6);
      o += cLimb([[80, 86], [86, 104], [86, 114]], 17, dk(cb, 0.15)) + P('M72,122 C70,112 78,108 88,108 C98,108 102,114 100,122 Z', c.cel(dk(CORALO, 0.2)), 2);
      // the body: a mass of living coral, the ribcage open on the glowing heart
      var bd = shag(66, 64, 38, 34, 9, 0.12, 104, 0.2);
      o += body(c, bd, cb, F('M74,20 L110,20 L110,104 L80,104 C92,84 90,44 74,20 Z', dk(cb, 0.28), 0.8) + polyps(105, 32, 100, 34, 96, 26), 2.6);
      o += cLimb([[54, 88], [48, 104], [46, 114]], 17, cb) + P('M30,122 C28,112 36,108 46,108 C56,108 60,114 58,122 Z', c.cel(CORALO), 2);
      o += E(62, 64, 18, 20, c.rg([[0, '#1a3a44'], [1, '#2a0e12']]), 2) + C(62, 64, 34, glow(c, TEAL, 0.7)) + C(62, 64, 10, c.rg([[0, '#ffffff'], [0.4, '#c8fff4'], [0.8, TEAL], [1, '#1a9a90']]), 1.6) + C(59, 60, 3, '#ffffff', 0, 0.9);
      var rbs = ''; [[-14, 0.8], [-6, 1], [6, 1], [14, 0.8]].forEach(function (k) { rbs += 'M' + pt([62 + k[0] * 0.6, 44]) + 'Q' + pt([62 + k[0] * 1.9, 64]) + ' ' + pt([62 + k[0] * 0.7, 84]); });
      o += L(rbs, OL, 5.2) + L(rbs, '#f8d0c0', 2.8) + L(rbs, '#ffffff', 0.8, 0.7);
      // shoulders of brain coral, the small head sunk between them
      o += brain(c, 90, 48, 15, 12, CORALO) + brain(c, 40, 50, 18, 14, CORALP);
      o += coralBranch(c, 52, 20, 12, -6, CORAL, 106, 2.4) + coralBranch(c, 60, 18, 14, 5, CORALR, 107, 2.4);
      o += body(c, shag(56, 30, 13, 11, 6, 0.14, 108), cl, F('M60,16 L74,16 L74,44 L62,44 C66,36 66,24 60,16 Z', dk(cl, 0.3), 0.8), 2.2);
      o += gEye(c, 48, 30, 2.2, TEAL) + gEye(c, 57, 29, 2, TEAL) + L('M44,37 Q50,40 56,37', OL, 1.4);
      // near arm, the great fist
      o += cLimb([[40, 54], [22, 74], [26, 92]], 17, lt(cb, 0.04)) + brain(c, 26, 110, 17, 15, CORALO) + P('M9,110 C9,122 43,122 43,110 Z', c.cel(dk(CORALO, 0.12)), 1.8) + L('M16,112 l0,6 M24,112 l0,7 M32,112 l0,6', dk(CORALO, 0.45), 1.2);
      o += barn(c, 30, 70, 2.4) + barn(c, 34, 76, 1.8) + barn(c, 84, 78, 2.2) + barn(c, 106, 72, 2) + kelp(c, 20, 90, 18, 2, 3.4).replace('<path', '<path transform="rotate(180 20 90)"') + anemone(c, 76, 36, 0.5, TEAL);
      return o;
    },
    prince_aeldran: function (c) {
      // the cutscene actor (art_story2.js: aeldran) redrawn as a combat sprite: trident thrust forward, the far hand raised to call his drowned court
      var o = shadow(c, 66, 38), s = '', ROBE_ = ROBE, KL = KELP;
      function coral(x, y, h, lean) { var d = 'M' + n(x) + ',' + n(y) + ' Q' + n(x + lean * 0.2) + ',' + n(y - h * 0.5) + ' ' + n(x + lean) + ',' + n(y - h) + ' M' + n(x + lean * 0.25) + ',' + n(y - h * 0.45) + ' q' + n(-3 - lean * 0.2) + ',' + n(-h * 0.18) + ' ' + n(-4 - lean * 0.2) + ',' + n(-h * 0.36) + ' M' + n(x + lean * 0.5) + ',' + n(y - h * 0.62) + ' q' + n(3 + lean * 0.2) + ',' + n(-h * 0.12) + ' ' + n(3.6 + lean * 0.3) + ',' + n(-h * 0.28); return L(d, OL, 4.6) + L(d, CORAL, 2.4) + L(d, lt(CORAL, 0.35), 0.8, 0.8); }
      s += C(84, 82, 80, glow(c, '#3adcd0', 0.22));
      // a ring of risen water at his feet
      s += E(86, 152, 60, 9, glow(c, TEAL, 0.5)) + L(ellD(86, 152, 54, 7), '#9af0e8', 1.6, 0.8);
      var HF = c.lg([[0, '#ffffff'], [0.5, HAIR], [1, '#b6d6d2']], 0, 0, 1, 1);
      [[[[90, 18], [104, 6], [122, 4], [138, 12]], 11, [2.2, 3]], [[[94, 22], [114, 12], [134, 24], [150, 16]], 12, [2.6, 3.4, 1]], [[[96, 28], [118, 32], [132, 50], [148, 46]], 12, [2.4, 3.2, 2]], [[[96, 34], [110, 50], [122, 68], [140, 74]], 11, [2.2, 3.4]], [[[94, 40], [104, 60], [110, 80], [126, 94]], 9, [2, 3, 1]]].forEach(function (lk) { s += P(btaper(lk[0], lk[1], 1.2, 24, lk[2]), HF, 1.8); });
      s += L('M100,20 Q116,12 132,10 M102,30 Q120,32 136,40 M100,38 Q112,52 124,64', '#a8ccc8', 1.1);
      // far arm raised, the hand burning with teal light
      s += P('M92,52 C100,44 110,38 118,30 L126,38 C118,46 108,56 100,64 Z', c.cel(ROBE_), 2.2) + P('M116,28 L128,40 L124,44 L112,32 Z', c.cel(GOLD), 1.4);
      s += C(126, 24, 20, glow(c, TEAL, 0.95)) + E(124, 28, 4.6, 5, c.cel(SK), 1.6) + L('M121,24 l-1,-5 M124,23 l0,-6 M127,24 l1,-5', OL, 2.4) + L('M121,24 l-1,-5 M124,23 l0,-6 M127,24 l1,-5', SK, 1.2) + C(126, 14, 5, c.rg([[0, '#ffffff'], [0.5, '#b8fff4'], [1, TEAL]]), 1.2);
      // the robe, hem drifting, gold-trimmed centre panel
      s += P('M66,52 C60,80 52,114 44,150 Q52,156 62,151 Q72,158 83,152 Q95,158 106,151 Q118,156 132,146 C122,112 108,80 98,52 Z', c.cel(ROBE_), 2.6);
      s += P('M72,78 L91,78 L99,152 Q84,156 66,152 Z', c.cel(ROBE2), 2) + L('M72.5,80 L67,150 M90.5,80 L98,150', GOLD, 1.8);
      s += P('M82,100 C76,104 76,114 82,118 C79,113 79,105 82,100 Z', GOLD, 1.2) + C(84.5, 109, 2, PEARL, 0.9) + L('M58,110 C56,124 52,138 48,148 M112,108 C116,122 122,134 128,144', dk(ROBE_, 0.4), 1.5);
      s += P(btaper([[70, 82], [66, 100], [62, 118], [56, 140]], 5.4, 1, 20, [4, 2.4]), c.cel(KL), 1.5) + P(btaper([[94, 82], [100, 102], [104, 122], [114, 142]], 6, 1, 20, [4, 2.6, 1]), c.cel(KL), 1.5);
      s += barn(c, 52, 146, 3.2) + barn(c, 57, 141, 2.6) + barn(c, 61, 148, 2.8) + barn(c, 118, 146, 3) + barn(c, 124, 141, 2.4) + barn(c, 112, 150, 2.4);
      // breastplate and sash
      s += P('M66,52 Q80,47 96,52 L94,78 Q82,82 69,78 Z', c.cel(ARM), 2.2) + L('M67,53 Q80,48.5 95,53', GOLD, 1.6) + P('M76,58 C72,62 72,70 76,74 C74,68 74,62 76,58 Z', GOLD, 1) + barn(c, 90, 60, 2.6) + barn(c, 93, 67, 2);
      s += P('M67,75 Q82,80 96,75 L96,81 Q82,86 67,81 Z', c.cel(GOLD), 1.6) + C(81.5, 81.5, 2.8, c.cel(PEARL), 1.1);
      // the trident, thrust forward, head overgrown with coral
      var TR = P('M42.4,29 L45.6,29 L45.6,150 L44,156 L42.4,150 Z', c.lg([[0, GOLDL], [0.45, '#a88e48'], [1, '#5e4e24']], 0, 0, 1, 0), 1.8) + L('M44,50 l0,5 M44,120 l0,5', VERD, 2.6);
      TR += P('M31,24 C31,32 37,35 44,35 C51,35 57,32 57,24 L55,25 C54,30 50,31.6 44,31.6 C38,31.6 34,30 33,25 Z', c.cel(GOLD), 1.6);
      TR += P('M31,25 L29,10 L33.6,15 L33,25 Z', c.cel(GOLD), 1.5) + P('M57,25 L59,10 L54.4,15 L55,25 Z', c.cel(GOLD), 1.5) + P('M42.4,32 L42.4,12 L39.4,14 L44,3 L48.6,14 L45.6,12 L45.6,32 Z', c.cel(GOLD), 1.5);
      TR += coral(36, 33, 10, -4) + coral(53, 32, 8, 4) + C(44, 37, 10, glow(c, EYE, 0.9)) + C(44, 37, 3.6, c.rg([[0, '#ffffff'], [0.5, EYE], [1, '#1a9a90']]), 1.2);
      s += G(TR, 'rotate(-12 44 88)');
      s += limb('M67,57 L54,72 L46,84', ROBE_, 8) + P('M50,80 L55,90 L45,93 L41,86 Z', c.cel(ROBE2), 1.5) + E(44, 88, 5, 4.6, c.cel(SK), 1.6) + L('M41,87 L47,87 M41.2,89.6 L46.6,89.6', dk(SK, 0.4), 0.9);
      // tall upswept pauldrons, barnacled
      s += P('M88,48 C94,42 104,40 112,30 C114,40 112,52 108,58 C102,62 92,60 88,54 Z', c.cel(ARM), 2) + L('M91,49 C98,45 106,42 110,36', GOLD, 1.4);
      s += P('M50,62 C46,52 50,42 58,40 C54,36 50,32 46,24 C60,28 72,38 74,52 C70,62 58,66 50,62 Z', c.cel(ARM), 2.2) + L('M52,58 C51,50 55,44 62,43 M50,32 C58,36 66,42 70,50', GOLD, 1.4);
      s += barn(c, 58, 56, 3) + barn(c, 64, 59, 2.2) + barn(c, 54, 49, 2) + P(btaper([[70, 48], [68, 58], [60, 64], [58, 76]], 4, 1, 14, [3, 1.6]), c.cel(KL), 1.3);
      // neck with gill lines, the head
      s += P('M76,38 L76,50 L86,50 L86,38 Z', c.cel(SK), 1.8) + L('M79.5,43 l3.5,1 M79.5,46 l3.5,1', '#3a9a90', 1);
      s += P('M70,24 C71,14 82,10 89,14 C95,18 96,28 94,36 C92,44 86,50 80,51 C76,51 72,47 71,43 L67.5,36 L70,34 C69.5,30 69.5,27 70,24 Z', c.cel(SK), 2);
      s += P('M91,32 C98,28 108,20 118,10 C114,22 106,32 94,39 Z', c.cel(SK), 1.7) + L('M94,34 C101,30 107,24 112,18', dk(SK, 0.3), 1);
      s += P('M69,24 C68,12 80,5 90,8 C98,11 102,20 100,30 C98,24 94,19 88,17 C82,15 75,18 69,24 Z', c.cel(HAIR), 1.8) + P(btaper([[71, 22], [62, 30], [60, 44], [54, 54]], 6, 1, 18, [2, 2]), HF, 1.6);
      s += P('M70.2,29.2 Q74.6,26.4 79.6,27.8 L78.8,32.8 Q74,33.6 70.6,31.4 Z', dk(SK, 0.5)) + P('M81.8,27.8 Q85.6,26.6 89.2,28.2 L88.6,31.8 Q85,32.8 82.4,31.6 Z', dk(SK, 0.5));
      s += E(75, 30, 9, 6, glow(c, EYE, 1)) + E(85.5, 30, 7.5, 5.4, glow(c, EYE, 0.95));
      var EG = c.rg([[0, '#ffffff'], [0.45, '#d8fffa'], [1, EYE]]);
      s += P('M71,30.4 L79,28.4 L77.8,32 Z', EG, 0.9) + P('M82.2,28.8 L88.4,29.4 L83.4,31.8 Z', EG, 0.9) + L('M70.5,26 Q74,24.2 78.6,25.8 M82.4,25.8 Q85.6,24.4 88.6,25.6', OL, 1.5) + L('M72.6,43.4 Q75.6,44.2 79,42.8', dk(SK, 0.55), 1.3);
      // crown of coral and pearls
      s += coral(71, 21, 12, -5) + coral(76, 18.6, 14, -2.5) + coral(83, 17.6, 15, 1.5) + coral(89, 18.6, 12, 5) + P('M68,21.5 Q80,16 92,19 L92.6,23.4 Q80,20.4 68.4,26 Z', c.cel(GOLD), 1.5);
      s += C(71.6, 23.2, 1.8, PEARL, 0.8) + C(80.4, 20, 2.8, c.cel(PEARL), 1) + C(88.4, 20.4, 1.8, PEARL, 0.8);
      s += bubble(26, 46, 2.4) + bubble(22, 34, 1.7) + bubble(140, 64, 2) + bubble(18, 70, 1.5);
      return o + G(s, 'matrix(0.78,0,0,0.78,0,1)');
    },
    nalveshra: function (c) {
      // the Deepmother (art_story2.js: nalveshra) rising out of a black whirlpool, tentacles reaching for the raid
      var s = '', CX = 80, CY = 108, RX = 46, RY = 32;
      s += E(80, 84, 82, 80, glow(c, '#2a8aa0', 0.45)) + E(80, 72, 64, 54, glow(c, VIO, 0.25));
      // the whirlpool, back half
      s += E(80, 150, 78, 12, c.rg([[0, '#02060c'], [0.7, '#0a2030'], [1, '#1e5a6a']]), 2.4) + L(ellD(80, 150, 60, 8), '#3a8a96', 1.4, 0.8) + L(ellD(80, 150, 40, 5), '#2a6a78', 1.2, 0.8);
      var SP = c.lg([[0, '#3a5270'], [1, '#141e30']], 0, 0, 1, 1), spines = '';
      [[-150, 14], [-130, 20], [-110, 16], [-70, 16], [-50, 20], [-30, 14]].forEach(function (q) {
        var a = q[0] * PI / 180, ca = Math.cos(a), sa = Math.sin(a), rb = 56, px = -sa, py = ca, bx = 80 + ca * rb * 1.08, by = 78 + sa * rb, tx = 80 + ca * (rb * 1.08 + q[1]), ty = 78 + sa * (rb + q[1]);
        spines += P('M' + n(bx + px * 4.2) + ',' + n(by + py * 4.2) + ' Q' + n((bx + tx) / 2 + px * 1.6) + ',' + n((by + ty) / 2 + py * 1.6) + ' ' + n(tx) + ',' + n(ty) + ' Q' + n((bx + tx) / 2 - px * 0.6) + ',' + n((by + ty) / 2 - py * 0.6) + ' ' + n(bx - px * 4.2) + ',' + n(by - py * 4.2) + ' Z', SP, 1.8) + C(tx, ty, 1.6, VIO, 0, 0.95);
      });
      var TF = c.lg([[0, '#20406a'], [0.55, '#122038'], [1, DEEP]], 0, 0, 1, 1), tipGlow = '', suck = '';
      function tent(q, w, wave) {
        var d = btaper(q, w, 1.8, 26, wave), t = '';
        t += F(d, TEAL, 0.85).replace('/>', ' transform="translate(-1.6,-1.6)"/>') + P(d, TF, 2.2) + F(btaper(q, w * 0.3, 0.5, 26, wave), '#3a6a90', 0.55);
        var tip = bz(q, 1); tipGlow += C(tip[0], tip[1], 9, glow(c, TEAL, 0.9)) + C(tip[0], tip[1], 2.6, '#e8fffb', 0.9);
        for (var i = 2; i < 7; i++) { var p = bz(q, 0.2 + i * 0.1); suck += C(p[0], p[1], 1.9 - i * 0.14, TEAL, 0, 0.85); }
        return t;
      }
      // tentacles behind, curling up out of the dark
      s += tent([[44, 150], [12, 150], [4, 116], [16, 90]], 17, [2, 3]) + tent([[50, 128], [26, 112], [22, 80], [14, 62]], 12, [2.6, 2.6, 1]) + tent([[116, 150], [148, 150], [156, 116], [144, 90]], 17, [2, 3, 1]) + tent([[110, 128], [134, 112], [138, 80], [146, 62]], 12, [2.6, 2.6]);
      var FM = c.lg([[0, '#5e2c90'], [0.6, '#2a1446'], [1, '#120a22']], 0, 0, 1, 1);
      s += P('M38,52 L18,20 Q20,36 8,40 Q18,50 6,58 Q16,64 8,76 L34,78 Z', FM, 2) + P('M122,52 L142,20 Q140,36 152,40 Q142,50 154,58 Q144,64 152,76 L126,78 Z', FM, 2);
      var fr = 'M36,56 L18,20 M34,62 L8,40 M32,68 L6,58 M32,74 L8,76 M124,56 L142,20 M126,62 L152,40 M128,68 L154,58 M128,74 L152,76';
      s += L(fr, OL, 2.8) + L(fr, '#8a5ac8', 1.2) + spines;
      s += P(btaper([[78, 34], [78, 8], [50, 4], [34, 18]], 6.4, 2.8, 24), c.lg([[0, NAVL], [1, NAVY]], 0, 0, 1, 0), 1.9);
      var bd = 'M22,108 C14,74 28,34 60,21 C72,16 88,16 100,21 C132,34 146,74 138,108 C134,128 128,142 124,156 L36,156 C32,142 26,128 22,108 Z';
      s += L(bd, TEAL, 6, 0.4) + F(bd, TEAL, 0.9).replace('/>', ' transform="translate(-2,-1.8)"/>') + F(bd, VIO, 0.8).replace('/>', ' transform="translate(2,-1.2)"/>');
      s += P(bd, c.lg([[0, NAVL], [0.3, NAVY], [0.75, dk(NAVY, 0.3)], [1, DEEP]], 0.3, 0, 0.6, 1), 2.8) + F('M36,46 C50,30 66,24 80,23 C64,28 50,38 42,54 Z', lt(NAVL, 0.14), 0.75);
      s += P(btaper([[28, 102], [18, 114], [20, 128], [12, 138]], 5, 1, 16), c.cel(NAVY), 1.7) + P(btaper([[132, 102], [142, 114], [140, 128], [148, 138]], 5, 1, 16), c.cel(NAVY), 1.7) + C(12, 138, 5, glow(c, TEAL, 0.9)) + C(148, 138, 5, glow(c, TEAL, 0.9));
      function upY(x) { var u = (x - CX) / RX; return CY - RY * Math.pow(Math.max(0, 1 - u * u), 0.7) * 0.95; }
      function loY(x) { var u = (x - CX) / RX; return CY + RY * Math.pow(Math.max(0, 1 - u * u), 0.7) * 1.05; }
      var mo = [], i2;
      for (i2 = 0; i2 <= 40; i2++) { var xu = CX - RX + i2 * RX / 20; mo.push([xu, upY(xu)]); }
      for (i2 = 40; i2 >= 0; i2--) { var xl = CX - RX + i2 * RX / 20; mo.push([xl, loY(xl)]); }
      s += P(pd(mo, true), c.rg([[0, '#4a1a66'], [0.45, '#22083a'], [1, '#07020c']]), 2.4) + E(80, 120, 22, 13, glow(c, VIO, 0.8));
      var teeth = '';
      [[40, 9], [47, 15], [55, 12], [63, 24], [72, 15], [88, 22], [96, 13], [104, 19], [112, 13], [119, 8]].forEach(function (t) { var x = t[0], y = upY(x) + 0.8, lean = (CX - x) * 0.08; teeth += 'M' + n(x - 2.4) + ',' + n(y) + ' Q' + n(x - 1) + ',' + n(y + t[1] * 0.6) + ' ' + n(x + lean) + ',' + n(y + t[1]) + ' Q' + n(x + 1.2) + ',' + n(y + t[1] * 0.5) + ' ' + n(x + 2.4) + ',' + n(y) + ' Z'; });
      [[45, 8], [54, 14], [64, 18], [74, 11], [86, 13], [96, 19], [106, 14], [115, 8]].forEach(function (t) { var x = t[0], y = loY(x) - 0.8, lean = (CX - x) * 0.08; teeth += 'M' + n(x - 2.2) + ',' + n(y) + ' Q' + n(x - 1) + ',' + n(y - t[1] * 0.6) + ' ' + n(x + lean) + ',' + n(y - t[1]) + ' Q' + n(x + 1.1) + ',' + n(y - t[1] * 0.5) + ' ' + n(x + 2.2) + ',' + n(y) + ' Z'; });
      s += P(teeth, c.lg([[0, '#ffffff'], [0.5, '#d6e8e4'], [1, '#8aa6aa']], 0, 0, 1, 0), 1.2) + L(pd(mo.slice(2, 39)), '#2c4a6a', 1.8, 0.9);
      s += L('M28,94 C26,78 32,60 44,48 M132,94 C134,78 128,60 116,48', VIO, 1.8, 0.8);
      [[50, 36], [58, 31], [67, 27.5], [93, 27.5], [102, 31], [110, 36], [36, 112], [124, 112], [42, 128], [118, 128]].forEach(function (q, k) { s += C(q[0], q[1], k < 6 ? 1.7 : 2.1, TEAL, 0, 0.95); });
      [[62, 66, 7.6, TEAL, 18], [98, 66, 7.6, TEAL, -18], [46, 77, 4.6, TEAL, 22], [114, 77, 4.6, TEAL, -22], [70, 51, 3.2, TEAL, 14], [90, 51, 3.2, TEAL, -14], [80, 58, 3.2, VIO, 0], [36, 91, 3, VIO, 26], [124, 91, 3, VIO, -26]].forEach(function (e) {
        var x = e[0], y = e[1], r = e[2], rt = ' transform="rotate(' + e[4] + ' ' + n(x) + ' ' + n(y) + ')"';
        s += E(x, y, r * 2.4, r * 2, glow(c, e[3], 0.75)) + P('M' + n(x - r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y - r * 0.9) + ' ' + n(x + r) + ',' + n(y) + ' Q' + n(x) + ',' + n(y + r * 0.7) + ' ' + n(x - r) + ',' + n(y) + ' Z', c.rg([[0, '#ffffff'], [0.4, e[3]], [1, dk(e[3], 0.4)]]), r > 4 ? 1.8 : 1.3).replace('/>', rt + '/>') + E(x, y, r * 0.14, r * 0.42, DEEP).replace('/>', rt + '/>');
      });
      s += P('M50,60 C58,54 68,55 76,62 L80,65 L84,62 C92,55 102,54 110,60 L108,56 C100,51 90,52 84,57 L80,60 L76,57 C70,52 60,51 52,56 Z', dk(NAVY, 0.3), 1.7);
      // the whirlpool, front half, with foam, and two tentacles reaching forward out of it
      s += P('M2,150 C2,166 158,166 158,150 C140,158 20,158 2,150 Z', c.lg([[0, '#1e5a6a'], [1, '#06121a']]), 2.2) + L('M8,152 C30,158 130,158 152,152', FOAM, 1.6, 0.9) + E(40, 155, 10, 2, FOAM, 0, 0.8) + E(118, 156, 12, 2, FOAM, 0, 0.8);
      s += tent([[40, 152], [20, 138], [8, 146], [4, 128]], 12, [2, 2]) + tent([[120, 152], [140, 140], [152, 148], [156, 132]], 11, [2, 2, 1]);
      s += suck + tipGlow;
      s += C(30, 22, 16, glow(c, TEAL, 0.9)) + P('M30,15 C36,15 38,23 34,29 C32,31 28,31 26,29 C22,23 24,15 30,15 Z', c.rg([[0, '#ffffff'], [0.4, '#b8fff4'], [1, TEAL]]), 1.8) + L('M28,30 q-1,4 1,7 M32,30 q2,3 0,6', TEAL, 1.2, 0.85);
      return G(s, 'matrix(0.78,0,0,0.78,1.6,0)');
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(ARM), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, STD) + ground(c, 150, ST, STD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#34504f"/></svg>'; }
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
