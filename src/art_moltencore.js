/* art_moltencore.js — the Magma Throne art for Realm of Loner (raid, level 60): the molten sea under Cinderpeak Depths where the
 * Slagborn dug for Vulcarn the King Below, and the halls his servants keep for him.
 *   scenes  molten_core_gate  the descent: a stair cut down into the mountain's fiery heart, lava falls either side
 *           mc_caverns        the lava caverns: stalactites, a lava river, vents and pools in a cracked black floor
 *           mc_halls          the rune-lit halls: basalt columns, burning runes set in the floor and walls
 *           mc_domain         the Steward's domain: an obsidian hall, horned braziers, a dais before a red glow
 *           mc_lake           Vulcarn's lava lake: a sea of fire under a vast vault, an eruption boiling in the middle
 *   mobs    core_hound, molten_giant, firelord, core_surger, flamewaker_guard, firesworn, core_rager, flamewaker_priest,
 *           flamewaker_elite, flamewaker_healer, son_of_flame, magmadar, garr, baron_geddon, golemagg,
 *           sulfuron_harbinger, majordomo_executus, ragnaros
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the keys
 * above and fall through to the previous functions for every other key (prototype keys included). Keys are appended
 * to ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the robe rig are shared copies of art_tidecrown.js (itself a copy of art_scholomance.js).
 * Looks: fire elementals are living fire in three hard tones around a dark stone core with lava cracks; core hounds are
 * two-headed lava dogs plated in black rock (Cinderhound the biggest; the core ragers have one head); flamewakers are tall,
 * horned, red-skinned fire humanoids with a snake's tail instead of legs; Steward Cindral is a flamewaker lord in robes;
 * Vulcarn (after art_story.js: ragnaros) rises from the lava with his hammer raised, the biggest sprite in the raid.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix mc<counter>_).
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
  function Ctx() { this.p = 'mc' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  MOLTEN CORE: palette (Vulcarn matches art_story.js: ragnaros)
  // ============================================================
  var ROCK = '#3a2420', ROCKL = '#5c3c30', ROCKD = '#1e120e', BASC = '#3a2e2e', OBS = '#221a22';
  var LAVA = '#ff7a1a', LAVAL = '#ffd040', LAVAD = '#c82a08', LAVAW = '#fff4b0', EMB = '#ffb030', EYEF = '#fff080';
  var FIRE3 = [LAVAD, LAVA, LAVAL], FIREH = [LAVA, LAVAL, LAVAW];
  var FW = '#cc4a2a', FWL = '#e8703e', FWD = '#94301a', BELLY = '#f0a860';
  var HORN = '#2a1a18', IRON = '#2e2a30', IRONL = '#5c5664', GOLD = '#d8a03a', GOLDD = '#8a5a1e', RUNE = '#ffb840';

  // ---------- fire ----------
  // a mass of flame tongues rising from a base line (cx, by): k tongues, the middle ones tallest
  function fireD(cx, by, w, h, k, seed, lean, bot) {
    var r = rng(seed || 1), x0 = cx - w / 2, prev = [x0, by], d = 'M' + pt(prev);
    lean = lean || 0; k = Math.max(1, k | 0);
    for (var i = 0; i < k; i++) {
      var f = (i + 0.5) / k, bell = 1 - Math.pow(2 * f - 1, 2);
      var tip = [x0 + w * f + (r() - 0.5) * (w / k) * 0.5 + lean * (0.5 + 0.5 * bell), by - h * (0.42 + 0.58 * bell) * (0.84 + r() * 0.24)];
      var g = (i + 1) / k, vb = 1 - Math.pow(2 * g - 1, 2);
      var val = i < k - 1 ? [x0 + w * g + (r() - 0.5) * 2, by - h * (0.14 + 0.34 * vb) * (0.7 + r() * 0.4)] : [x0 + w, by];
      d += 'C' + pt([prev[0] - (tip[0] - prev[0]) * 0.12, prev[1] - (prev[1] - tip[1]) * 0.5]) + ' ' + pt([tip[0] + (prev[0] - tip[0]) * 0.12, tip[1] + (prev[1] - tip[1]) * 0.3]) + ' ' + pt(tip);
      d += 'C' + pt([tip[0] + (val[0] - tip[0]) * 0.12, tip[1] + (val[1] - tip[1]) * 0.3]) + ' ' + pt([val[0] + (val[0] - tip[0]) * 0.12, val[1] - (val[1] - tip[1]) * 0.5]) + ' ' + pt(val);
      prev = val;
    }
    bot = bot == null ? 0.08 : bot;
    return d + 'C' + pt([x0 + w * 0.8, by + h * bot]) + ' ' + pt([x0 + w * 0.2, by + h * bot]) + ' ' + pt([x0, by]) + 'Z';
  }
  // three hard tones of fire, the outer one outlined
  function fire(c, cx, by, w, h, k, seed, lean, cols, sw, bot) {
    cols = cols || FIRE3; seed = seed || 1; lean = lean || 0;
    return P(fireD(cx, by, w, h, k, seed, lean, bot), cols[0], sw == null ? 2 : sw) +
      F(fireD(cx, by - h * 0.02, w * 0.74, h * 0.76, Math.max(1, k - 1), seed + 11, lean * 0.8, bot), cols[1]) +
      F(fireD(cx, by - h * 0.04, w * 0.44, h * 0.5, Math.max(1, k - 2), seed + 23, lean * 0.6, bot), cols[2]);
  }
  function crackLine(d, w, op) { return L(d, LAVAD, w + 1.4, op) + L(d, LAVA, w, op) + L(d, LAVAL, w * 0.38, op); }
  // jagged lava cracks scattered over a box
  function cracks(seed, x0, x1, y0, y1, cnt, len, w, op) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) {
      var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = r() * PI * 2, segs = 2 + ((r() * 2) | 0);
      d += 'M' + pt([x, y]);
      for (var j = 0; j < segs; j++) { a += (r() - 0.5) * 1.6; x += Math.cos(a) * len * (0.5 + r() * 0.6); y += Math.sin(a) * len * (0.5 + r() * 0.6); d += 'L' + pt([x, y]); }
    }
    return d ? crackLine(d, w || 1.2, op) : '';
  }
  // black rock with a flat shadow on its right and lava cracks, clipped to its shape; box = [x0, x1, y0, y1]
  function rockBody(c, d, col, seed, box, crackN, sw) {
    var mx = box[0] + (box[1] - box[0]) * 0.56;
    var sh = F(pd([[mx, box[2] - 6], [box[1] + 6, box[2] - 6], [box[1] + 6, box[3] + 6], [mx - (box[1] - box[0]) * 0.08, box[3] + 6]], true), dk(col, 0.38), 0.75);
    sh += F(pd([[box[0] - 4, box[2] - 6], [mx - (box[1] - box[0]) * 0.2, box[2] - 6], [box[0] - 4, box[2] + (box[3] - box[2]) * 0.4]], true), lt(col, 0.14), 0.7);
    if (crackN) sh += cracks(seed, box[0], box[1], box[2], box[3], crackN, (box[1] - box[0]) * 0.18, 1.2);
    return body(c, d, col, sh, sw == null ? 2.2 : sw);
  }
  function boulder(c, x, y, rx, ry, col, seed, crackN) { return rockBody(c, shag(x, y, rx, ry, 6, 0.1, seed), col, seed + 1, [x - rx, x + rx, y - ry, y + ry], crackN || 0, Math.max(1.4, Math.min(2.2, rx * 0.2))); }
  function rockLimb(c, pts, w, col, seed) {
    var d = pd(pts);
    return L(d, OL, w + 4.5) + L(d, col, w) + L(d, dk(col, 0.32), w * 0.34, 0.8).replace('/>', ' transform="translate(' + n(w * 0.16) + ',' + n(w * 0.16) + ')"/>') +
      L(d, lt(col, 0.16), w * 0.16, 0.8).replace('/>', ' transform="translate(' + n(-w * 0.2) + ',' + n(-w * 0.14) + ')"/>') +
      crackLine(pd(pts.map(function (p, i) { return [p[0] + (i % 2 ? 1.6 : -1.6), p[1] + (i % 2 ? -1 : 1)]; })), 1, 0.9);
  }
  function fireArm(c, pts, w) { var d = pd(pts); return L(d, OL, w + 4) + L(d, LAVAD, w) + L(d, LAVA, w * 0.7) + L(d, LAVAL, w * 0.34) + L(d, LAVAW, w * 0.12, 0.8); }
  function fireOrb(c, x, y, r, seed) {
    return C(x, y, r * 3, glow(c, LAVAL, 0.8)) + fire(c, x, y - r * 0.2, r * 1.9, r * 3, 3, seed || 5, 0, FIREH, 1.2) + C(x, y, r, c.rg([[0, '#ffffff'], [0.4, LAVAW], [0.8, LAVAL], [1, LAVA]]), 1.4) + C(x - r * 0.3, y - r * 0.3, r * 0.3, '#ffffff', 0, 0.9);
  }
  function lavaPool(c, x, y, rx, ry, crust) {
    var o = E(x, y - ry, rx * 1.4, ry * 3, glow(c, LAVA, 0.5)) + E(x, y + ry * 0.12, rx + 2, ry + 1.2, c.cel(ROCKD), 1.6);
    o += E(x, y, rx, ry, c.lg([[0, LAVAD], [0.22, LAVA], [0.5, LAVAL], [1, LAVAW]]), 1.2) + L('M' + pt([x - rx * 0.9, y - ry * 0.3]) + 'Q' + pt([x, y - ry * 1.05]) + ' ' + pt([x + rx * 0.9, y - ry * 0.3]), LAVAD, Math.max(1, ry * 0.35), 0.8);
    if (crust !== false) { var r = rng(((x * 7 + y * 13) | 0) + 1); for (var i = 0; i < 2; i++) o += E(x + (r() - 0.5) * rx * 1.1, y + r() * ry * 0.4, 1.4 + r() * rx * 0.08, 0.7 + r() * ry * 0.16, dk(ROCK, 0.2), 0, 0.85); }
    return o + L('M' + pt([x - rx * 0.4, y + ry * 0.35]) + 'q' + n(rx * 0.2) + ',' + n(-ry * 0.25) + ' ' + n(rx * 0.4) + ',0', LAVAW, 1, 0.9);
  }
  function lavaBubbles(seed, cnt, x0, x1, y0, y1, s) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), rr = (0.8 + r() * 1.6) * (s || 1); o += C(x, y, rr, LAVAL, Math.max(0.6, rr * 0.4)) + C(x - rr * 0.3, y - rr * 0.35, rr * 0.35, LAVAW); } return o; }
  function drip(c, x, y, r) { return P('M' + pt([x, y - r * 2.4]) + 'C' + pt([x + r * 0.9, y - r * 0.6]) + ' ' + pt([x + r, y + r * 0.6]) + ' ' + pt([x, y + r]) + 'C' + pt([x - r, y + r * 0.6]) + ' ' + pt([x - r * 0.9, y - r * 0.6]) + ' ' + pt([x, y - r * 2.4]) + 'Z', c.lg([[0, LAVAL], [1, LAVA]]), 0.8); }
  function held(s, p, deg) { return G(s, 'translate(' + n(p[0]) + ',' + n(p[1]) + ') rotate(' + n(deg) + ')'); }

  // ---------- scene pieces ----------
  function ceiling(seed, yb, cnt, maxH) {
    var r = rng(seed), d = 'M-2,-2 L402,-2 L402,' + n(yb), x = 402, step = 404 / cnt;
    for (var i = 0; i < cnt; i++) {
      var x1 = 402 - (i + 1) * step, h = r() < 0.5 ? maxH * (0.4 + r() * 0.6) : maxH * 0.18 * r(), xm = (x + x1) / 2 + (r() - 0.5) * step * 0.3;
      d += 'L' + pt([xm + step * 0.2, yb + h * 0.22]) + 'L' + pt([xm, yb + h]) + 'L' + pt([xm - step * 0.2, yb + h * 0.22]) + 'L' + pt([x1, yb + (r() - 0.5) * 4]);
      x = x1;
    }
    return d + 'Z';
  }
  function lavaFall(c, x, y0, y1, w, seed) {
    var o = R(x - w * 1.6, y0, w * 3.2, y1 - y0, c.lg([[0, LAVA, 0], [0.5, LAVA, 0.3], [1, LAVA, 0]], 0, 0, 1, 0));
    o += P(pd([[x - w / 2, y0], [x + w / 2, y0], [x + w / 2 + 2, y1], [x - w / 2 - 2, y1]], true), c.lg([[0, LAVAL], [0.45, LAVA], [1, LAVAD]], 0, 0, 1, 0), 1.4);
    var r = rng(seed), d = ''; for (var i = 0; i < 4; i++) { var xx = x - w / 2 + 2 + r() * (w - 4); d += 'M' + pt([xx, y0 + r() * 8]) + 'L' + pt([xx + (r() - 0.5) * 2, y1 - r() * 12]); }
    return o + L(d, LAVAW, 1, 0.8) + E(x, y1 - 2, w * 2.2, w, glow(c, LAVAL, 0.6)) + E(x, y1, w * 1.3, w * 0.35, c.lg([[0, LAVAW], [1, LAVA]]), 1.2);
  }
  function scorchFloor(c, y, seed, col, cnt) {
    col = col || '#3a2a26';
    var o = R(-2, y, 404, 242 - y, c.lg([[0, dk(col, 0.3)], [0.25, col], [1, dk(col, 0.5)]]));
    return o + '<g clip-path="url(#' + c.clip('M-2,' + n(y) + 'L402,' + n(y) + 'L402,242L-2,242Z') + ')">' + cracks(seed, 0, 400, y + 6, 240, cnt || 10, 18, 1.2, 0.75) + '</g>';
  }
  function basalt(c, x, base, w, h, col) {
    var o = P(pd([[x - w / 2, base], [x - w / 2, base - h], [x - w * 0.18, base - h - w * 0.16], [x + w * 0.28, base - h - w * 0.1], [x + w / 2, base - h], [x + w / 2, base]], true),
      c.lg([[0, lt(col, 0.16)], [0.3, lt(col, 0.16)], [0.3, col], [0.74, col], [0.74, dk(col, 0.32)], [1, dk(col, 0.32)]], 0, 0, 1, 0), 1.6);
    return o + L('M' + pt([x - w / 2, base - h]) + 'L' + pt([x - w * 0.18, base - h - w * 0.16]) + 'L' + pt([x + w * 0.28, base - h - w * 0.1]), lt(col, 0.3), 1, 0.8) + L('M' + pt([x - w * 0.2, base - h + 2]) + 'L' + pt([x - w * 0.2, base]) + 'M' + pt([x + w * 0.24, base - h + 2]) + 'L' + pt([x + w * 0.24, base]), dk(col, 0.4), 0.9, 0.7);
  }
  function wallRune(c, x, y, s) {
    var d = 'M' + pt([x, y - 8 * s]) + 'L' + pt([x, y + 8 * s]) + 'M' + pt([x - 5 * s, y - 5 * s]) + 'L' + pt([x, y - 1 * s]) + 'L' + pt([x + 5 * s, y - 5 * s]) + 'M' + pt([x - 4 * s, y + 5 * s]) + 'L' + pt([x + 4 * s, y + 5 * s]);
    return C(x, y, 15 * s, glow(c, RUNE, 0.55)) + L(d, OL, 3.6 * s) + L(d, RUNE, 2 * s) + L(d, LAVAW, 0.7 * s, 0.85);
  }
  // a burning rune ring set in the floor, in perspective
  function floorRune(c, x, y, rx, ry) {
    var o = E(x, y, rx * 1.5, ry * 2, glow(c, RUNE, 0.5)) + L(ellD(x, y, rx, ry), OL, 3.4) + L(ellD(x, y, rx, ry), RUNE, 2) + L(ellD(x, y, rx * 0.74, ry * 0.74), RUNE, 1.2, 0.9), d = '';
    for (var i = 0; i < 6; i++) { var a = i * PI / 3 + 0.3, p = [x + Math.cos(a) * rx * 0.87, y + Math.sin(a) * ry * 0.87]; d += 'M' + pt([p[0] - rx * 0.05, p[1] - ry * 0.1]) + 'L' + pt([p[0] + rx * 0.05, p[1] + ry * 0.1]) + 'M' + pt([p[0] - rx * 0.05, p[1] + ry * 0.08]) + 'L' + pt([p[0] + rx * 0.03, p[1]]); }
    d += 'M' + pt([x, y - ry * 0.5]) + 'L' + pt([x, y + ry * 0.45]) + 'M' + pt([x - rx * 0.3, y - ry * 0.32]) + 'Q' + pt([x - rx * 0.28, y + ry * 0.2]) + ' ' + pt([x, y + ry * 0.2]) + 'Q' + pt([x + rx * 0.28, y + ry * 0.2]) + ' ' + pt([x + rx * 0.3, y - ry * 0.32]);
    return o + L(d, OL, 2.6) + L(d, lt(RUNE, 0.3), 1.3);
  }
  function brazier(c, x, y, s, seed) {
    var o = E(x, y - 24 * s, 30 * s, 30 * s, glow(c, LAVA, 0.5));
    o += P(pd([[x - 8 * s, y], [x + 8 * s, y], [x + 5 * s, y - 3 * s], [x - 5 * s, y - 3 * s]], true), c.cel(IRON), 1.4) + P(pd([[x - 2.6 * s, y - 3 * s], [x + 2.6 * s, y - 3 * s], [x + 2 * s, y - 16 * s], [x - 2 * s, y - 16 * s]], true), c.cel(IRON), 1.4);
    o += fire(c, x, y - 19 * s, 17 * s, 24 * s, 3, seed || ((x * 3) | 0), 0, FIRE3, Math.max(0.8, 1.3 * s));
    o += P('M' + pt([x - 11 * s, y - 21 * s]) + 'Q' + pt([x, y - 13 * s]) + ' ' + pt([x + 11 * s, y - 21 * s]) + 'L' + pt([x + 7 * s, y - 15 * s]) + 'Q' + pt([x, y - 12 * s]) + ' ' + pt([x - 7 * s, y - 15 * s]) + 'Z', c.cel(IRONL), 1.4);
    o += P('M' + pt([x - 11 * s, y - 21 * s]) + 'Q' + pt([x - 17 * s, y - 25 * s]) + ' ' + pt([x - 15 * s, y - 34 * s]) + 'Q' + pt([x - 12 * s, y - 27 * s]) + ' ' + pt([x - 7.6 * s, y - 20 * s]) + 'Z', c.cel(HORN), 1.2);
    o += P('M' + pt([x + 11 * s, y - 21 * s]) + 'Q' + pt([x + 17 * s, y - 25 * s]) + ' ' + pt([x + 15 * s, y - 34 * s]) + 'Q' + pt([x + 12 * s, y - 27 * s]) + ' ' + pt([x + 7.6 * s, y - 20 * s]) + 'Z', c.cel(HORN), 1.2);
    return o;
  }
  function chain(x0, y0, x1, y1, sag, cnt) {
    var o = '';
    for (var i = 0; i <= cnt; i++) {
      var t = i / cnt, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * PI) * sag, e = i % 2 ? ellD(x, y, 1.6, 2.6) : ellD(x, y, 3, 1.8);
      o += L(e, OL, 2.6) + L(e, IRONL, 1.1);
    }
    return o;
  }
  function vent(c, x, y, s, seed) { return E(x, y, 10 * s, 3 * s, c.cel(ROCKD), 1.4) + fire(c, x, y, 12 * s, 22 * s, 2, seed, 1, FIRE3, 1.1) + E(x, y + 0.6, 6 * s, 1.6 * s, LAVAL, 0); }
  function shard(c, x, y, h, lean, col) { return body(c, pd([[x - h * 0.2, y], [x + lean, y - h], [x + h * 0.22, y]], true), col || OBS, F(pd([[x + lean * 0.4, y - h], [x + h * 0.3, y], [x + h * 0.02, y]], true), dk(col || OBS, 0.4), 0.8), 1.4) + L('M' + pt([x - h * 0.08, y - 1]) + 'L' + pt([x + lean * 0.9, y - h * 0.9]), lt(col || OBS, 0.35), 0.8, 0.8); }
  function embers(seed, cnt, x0, x1, y0, y1) { return motes(seed, cnt, x0, x1, y0, y1, '#ffd060'); }
  function heat(c) { return R(0, 0, 400, 240, c.rg([[0, '#000', 0], [0.66, '#000', 0.16], [1, '#000', 0.58]])); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    molten_core_gate: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#0e0706'], [0.4, '#2a0e08'], [0.52, '#6a200c'], [0.6, '#2a120c'], [1, '#140a08']]));
      // the glow of the core far below
      o += E(200, 108, 210, 70, glow(c, LAVA, 0.6)) + E(200, 112, 90, 26, glow(c, LAVAL, 0.55));
      // the far walls, falling away in ledges, lit from below
      o += P('M-2,34 L58,44 L92,64 L126,80 L150,100 L166,122 L-2,122 Z', c.lg([[0, '#1c1210'], [1, '#4a1e10']], 0, 0, 1, 0), 0) + P('M402,34 L342,46 L306,64 L274,82 L252,102 L236,122 L402,122 Z', c.lg([[0, '#4a1e10'], [1, '#1c1210']], 0, 0, 1, 0), 0);
      o += L('M58,44 L92,64 L126,80 L150,100 L166,122 M342,46 L306,64 L274,82 L252,102 L236,122', LAVA, 1.4, 0.85) + cracks(4107, 10, 130, 60, 118, 4, 9, 1, 0.7) + cracks(4108, 270, 390, 60, 118, 4, 9, 1, 0.7);
      // the lava sea far below, seen through the chasm
      o += P('M148,98 Q200,90 254,98 L262,122 L140,122 Z', c.lg([[0, LAVAW], [0.3, LAVAL], [0.7, LAVA], [1, LAVAD]]), 1.2) + L('M158,104 q8,-2 16,0 M206,102 q10,-2 18,0 M182,112 q8,-2 14,0 M226,114 q6,-2 12,0', LAVAW, 1, 0.85);
      o += fire(c, 214, 98, 16, 20, 2, 4109, 0, FIREH, 1) + fire(c, 180, 100, 10, 12, 2, 4110, 0, FIREH, 0.9);
      // the stair cut down into the rock, narrowing and brightening as it falls away toward the fire
      for (var i = 7; i >= 0; i--) {
        var t = i / 7, y = 124 - t * 30, hw = 66 - t * 44, hh = 5.4 - t * 3;
        o += P(pd([[200 - hw, y], [200 + hw, y], [200 + hw * 0.95, y - hh], [200 - hw * 0.95, y - hh]], true), c.lg([[0, mix('#6a4636', '#e06a24', t)], [1, mix('#2a1a16', '#8a3410', t)]]), 1.2);
      }
      // the ceiling, heavy with stalactites
      o += P(ceiling(4101, 22, 18, 34), c.lg([[0, '#0a0605'], [0.8, '#2a1410'], [1, '#4a1e10']]), 1.6);
      // two great pillars carved by the Slagborn, chains slung between them
      [96, 304].forEach(function (x) { o += basalt(c, x, 124, 36, 100, '#3e302c') + P(pd([[x - 22, 34], [x + 22, 34], [x + 25, 24], [x - 25, 24]], true), c.cel('#4e3c36'), 1.6) + P(pd([[x - 20, 124], [x + 20, 124], [x + 24, 116], [x - 24, 116]], true), c.cel('#4e3c36'), 1.6) + wallRune(c, x, 64, 1) + wallRune(c, x, 94, 0.8); });
      o += chain(114, 36, 286, 44, 22, 30);
      // lava falls on either side
      o += lavaFall(c, 30, 26, 122, 12, 4103) + lavaFall(c, 370, 30, 122, 10, 4104);
      // the ledge we stand on
      o += scorchFloor(c, 122, 4105, '#3e2c26') + L('M-2,122 L402,122', OL, 1.6);
      o += P(pd([[134, 122], [266, 122], [300, 242], [100, 242]], true), c.lg([[0, '#5a3a2e'], [1, '#2e1c16']]), 1.4) + L('M140,150 L260,150 M126,184 L274,184 M112,220 L288,220', '#1e120e', 1.4, 0.9);
      o += brazier(c, 128, 136, 1.05, 4111) + brazier(c, 272, 136, 1.05, 4112);
      o += lavaPool(c, 50, 186, 28, 6) + lavaPool(c, 352, 206, 34, 7) + rock(c, 20, 150, 30, 18, '#3a2824') + rock(c, 384, 160, 26, 16, '#3a2824') + shard(c, 70, 232, 20, -3) + shard(c, 80, 234, 12, 3) + shard(c, 330, 236, 18, 4);
      o += pebbles(4113, 132, 236, '#1e1410', 16, 10, 390);
      return o + embers(4106, 34, 0, 400, 20, 220) + heat(c);
    },
    mc_caverns: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#120a08'], [0.5, '#2a140e'], [1, '#1a0e0a']]));
      // the back wall, split by glowing seams
      var bw = 'M-2,18 L402,18 L402,122 L-2,122 Z';
      o += P(bw, c.lg([[0, '#241612'], [0.7, '#3a2018'], [1, '#5a2a14']]), 0) + '<g clip-path="url(#' + c.clip(bw) + ')">' + cracks(4201, 0, 400, 36, 116, 7, 12, 1, 0.6) + E(200, 122, 220, 36, glow(c, LAVA, 0.4)) + '</g>';
      o += lavaFall(c, 150, 20, 104, 14, 4202) + lavaFall(c, 262, 24, 104, 10, 4203);
      // a lava river crossing the cavern
      o += P('M-2,102 C60,98 120,106 200,101 C280,96 340,104 402,100 L402,122 L-2,122 Z', c.lg([[0, LAVAW], [0.25, LAVAL], [0.7, LAVA], [1, LAVAD]]), 1.6);
      o += L('M20,108 q10,-2 20,0 M90,112 q10,-2 18,0 M170,108 q12,-2 22,0 M250,112 q10,-2 18,0 M320,108 q12,-2 22,0', LAVAW, 1.1, 0.85) + lavaBubbles(4204, 10, 10, 390, 104, 118, 1) + E(200, 104, 220, 22, glow(c, LAVAL, 0.35));
      o += E(118, 110, 12, 3, c.cel(ROCKD), 1.2) + E(292, 114, 16, 3.4, c.cel(ROCKD), 1.2) + E(52, 116, 9, 2.4, c.cel(ROCKD), 1);
      var bank = 'M-2,124 L-2,117 L20,119 L44,116 L70,120 L96,117 L124,120 L150,116 L178,119 L206,117 L232,120 L258,116 L286,119 L314,117 L342,120 L370,116 L402,118 L402,124 Z';
      o += P(bank, c.cel('#2e1c16'), 1.6) + L('M-2,117 L20,119 L44,116 L70,120 L96,117 L124,120 L150,116 L178,119 L206,117 L232,120 L258,116 L286,119 L314,117 L342,120 L370,116 L402,118', LAVAL, 1.2, 0.85);
      // side walls closing in, rim-lit by the river
      var lw = 'M-2,-2 L70,-2 L62,30 L80,56 L64,84 L78,106 L60,124 L-2,124 Z', rw = 'M402,-2 L334,-2 L344,34 L326,60 L342,88 L328,108 L346,124 L402,124 Z';
      o += P(lw, c.lg([[0, '#080404'], [1, '#160c0a']], 0, 0, 1, 0), 1.8) + P(rw, c.lg([[0, '#160c0a'], [1, '#080404']], 0, 0, 1, 0), 1.8);
      o += L('M70,-2 L62,30 L80,56 L64,84 L78,106 L60,124', LAVA, 1.6, 0.85) + L('M334,-2 L344,34 L326,60 L342,88 L328,108 L346,124', LAVA, 1.6, 0.85);
      o += '<g clip-path="url(#' + c.clip(lw) + ')">' + cracks(4205, 0, 70, 10, 120, 3, 10, 1, 0.7) + '</g><g clip-path="url(#' + c.clip(rw) + ')">' + cracks(4206, 330, 400, 10, 120, 3, 10, 1, 0.7) + '</g>';
      o += P(ceiling(4207, 16, 20, 40), c.lg([[0, '#080404'], [0.8, '#241410'], [1, '#4a2212']]), 1.6);
      // the floor: black rock, cracked, with pools, vents and shards of obsidian
      o += scorchFloor(c, 122, 4208, '#3a2622', 12) + L('M-2,122 L402,122', OL, 1.6);
      o += lavaPool(c, 120, 158, 30, 6) + lavaPool(c, 300, 180, 40, 8) + lavaPool(c, 60, 214, 34, 7) + lavaPool(c, 214, 226, 26, 5);
      o += vent(c, 196, 150, 1, 4209) + vent(c, 372, 150, 0.9, 4210) + vent(c, 30, 172, 0.8, 4211);
      o += rock(c, 90, 132, 34, 18, '#3a2622') + rock(c, 330, 134, 30, 16, '#3a2622') + shard(c, 248, 136, 22, -4) + shard(c, 256, 138, 14, 3) + shard(c, 22, 236, 26, 4) + shard(c, 380, 238, 24, -5) + shard(c, 392, 238, 14, 2);
      o += pebbles(4212, 132, 236, '#1a100c', 18, 10, 390);
      return o + embers(4213, 30, 0, 400, 10, 220) + heat(c);
    },
    mc_halls: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#100808'], [1, '#2a1612']]));
      // the back wall: a row of basalt columns, a burning rune set between each pair
      o += R(0, 12, 400, 112, c.lg([[0, '#1e1414'], [1, '#34201a']]));
      o += E(200, 124, 230, 50, glow(c, LAVA, 0.3));
      [22, 78, 134, 266, 322, 378].forEach(function (x, i) { o += basalt(c, x, 124, 30, 104 - (i % 2) * 6, '#3a2e30'); });
      [50, 106, 294, 350].forEach(function (x) { o += wallRune(c, x, 70, 0.95); });
      // the great door in the middle: a dark arch with a glowing rune above it
      o += P('M156,124 L156,58 Q200,20 244,58 L244,124 Z', c.cel('#4a3a38'), 2) + P('M168,124 L168,64 Q200,34 232,64 L232,124 Z', c.lg([[0, '#1a0a06'], [0.6, '#4a1a0a'], [1, '#a03a10']]), 1.6);
      o += E(200, 110, 40, 30, glow(c, LAVA, 0.5)) + wallRune(c, 200, 34, 0.9) + L('M178,124 L178,70 M222,124 L222,70', '#2a1814', 1.2, 0.8);
      // a heavy beam across the top
      o += R(-2, 0, 404, 16, c.cel('#2a1e1e'), 1.6) + L('M-2,12 L402,12', '#4a3632', 1.2, 0.8) + R(-2, 16, 404, 6, c.lg([[0, '#000', 0.5], [1, '#000', 0]]));
      // the floor: dressed basalt flags, burning runes set into it
      o += flagFloor(c, 122, 200, '#3e2e2c', 4301) + L('M-2,122 L402,122', OL, 1.6);
      o += '<g clip-path="url(#' + c.clip('M-2,122 L402,122 L402,242 L-2,242 Z') + ')">' + cracks(4302, 0, 400, 130, 240, 6, 16, 1, 0.7) + '</g>';
      o += floorRune(c, 200, 150, 44, 9) + floorRune(c, 86, 196, 50, 11) + floorRune(c, 318, 206, 54, 12);
      o += brazier(c, 150, 132, 0.9, 4303) + brazier(c, 250, 132, 0.9, 4304) + brazier(c, 24, 200, 1.2, 4305) + brazier(c, 380, 204, 1.2, 4306);
      o += pebbles(4307, 132, 236, '#1a100c', 12, 10, 390);
      return o + embers(4308, 24, 0, 400, 10, 220) + heat(c);
    },
    mc_domain: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#0c0608'], [1, '#26121a']]));
      // the vault: obsidian ribs curving over the hall
      o += L('M-2,60 Q100,-30 200,6 Q300,-30 402,60', OL, 9) + L('M-2,60 Q100,-30 200,6 Q300,-30 402,60', '#3a2a32', 5) + L('M-2,60 Q100,-30 200,6 Q300,-30 402,60', '#6a4a52', 1.4, 0.8);
      // the great opening at the back, red with the light of the lake beyond
      o += P('M120,124 L120,56 Q200,-6 280,56 L280,124 Z', c.cel('#3a2a32'), 2.2) + P('M134,124 L134,62 Q200,10 266,62 L266,124 Z', c.lg([[0, '#6a1a08'], [0.5, '#e0501a'], [0.8, LAVAL], [1, LAVAW]]), 1.8);
      o += '<g clip-path="url(#' + c.clip('M134,124 L134,62 Q200,10 266,62 L266,124 Z') + ')">' + fire(c, 200, 124, 60, 80, 4, 4401, 0, FIRE3, 1.2) + P('M130,124 L130,98 L150,104 L170,96 L200,102 L230,94 L250,104 L270,98 L270,124 Z', '#2a1210', 1.2) + '</g>';
      o += E(200, 90, 120, 60, glow(c, LAVA, 0.4));
      // obsidian columns
      [30, 92, 308, 370].forEach(function (x, i) { o += basalt(c, x, 124, i === 0 || i === 3 ? 30 : 24, 118, '#2e2230') + wallRune(c, x, 60, 0.7); });
      o += chain(30, 18, 92, 22, 14, 10) + chain(308, 22, 370, 18, 14, 10);
      // the dais: three steps and the Steward's fire altar
      o += body(c, pd([[112, 126], [288, 126], [282, 118], [118, 118]], true), '#4a3438', '', 1.6) + body(c, pd([[128, 118], [272, 118], [266, 111], [134, 111]], true), '#56404a', '', 1.5) + body(c, pd([[146, 111], [254, 111], [248, 104], [152, 104]], true), '#624a52', '', 1.4);
      o += L('M118,121 L282,121 M134,114 L266,114', GOLD, 1, 0.7);
      o += brazier(c, 200, 104, 1.5, 4402);
      // the floor: polished black stone, two lava channels running from the dais toward us
      o += flagFloor(c, 122, 200, '#2e2228', 4403) + L('M-2,122 L402,122', OL, 1.6);
      o += P('M168,124 L178,124 L130,242 L108,242 Z', c.lg([[0, LAVAL], [1, LAVA]]), 1.4) + P('M222,124 L232,124 L292,242 L270,242 Z', c.lg([[0, LAVAL], [1, LAVA]]), 1.4);
      o += E(142, 180, 30, 40, glow(c, LAVA, 0.25)) + E(258, 180, 30, 40, glow(c, LAVA, 0.25));
      o += floorRune(c, 200, 176, 36, 8);
      o += brazier(c, 60, 150, 1.1, 4404) + brazier(c, 340, 150, 1.1, 4405) + brazier(c, 20, 222, 1.4, 4406) + brazier(c, 384, 226, 1.4, 4407);
      o += pebbles(4408, 132, 236, '#140c10', 10, 10, 390);
      return o + embers(4409, 22, 0, 400, 10, 220) + heat(c);
    },
    mc_lake: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#0a0404'], [0.35, '#2a0c06'], [0.5, '#7a2208'], [1, '#1a0a06']]));
      // the vast vault, lit red from below
      o += P(ceiling(4501, 14, 22, 44), c.lg([[0, '#060303'], [0.7, '#2a0e08'], [1, '#6a2410']]), 1.6);
      o += P('M-2,60 L40,66 L70,58 L110,70 L150,66 L180,74 L-2,80 Z', '#2a100a', 0) + P('M402,58 L360,66 L320,60 L284,70 L250,66 L220,74 L402,80 Z', '#2a100a', 0);
      // the lake of fire to the far walls
      o += R(-2, 72, 404, 52, c.lg([[0, '#ff9a30'], [0.3, LAVA], [0.7, '#e0501a'], [1, LAVAD]]));
      o += R(-2, 72, 404, 10, c.lg([[0, LAVAW, 0.8], [1, LAVAW, 0]]));
      var wv = ''; for (var y = 80; y < 122; y += 7) { var r = rng(y * 3); for (var i = 0; i < 6; i++) { var x = r() * 400, w = 10 + (y - 72) * 0.4; wv += 'M' + pt([x, y]) + 'q' + n(w / 2) + ',-2 ' + n(w) + ',0'; } }
      o += L(wv, LAVAW, 1.1, 0.8) + L(wv.replace(/M([\d.]+),([\d.]+)/g, function (m, a, b) { return 'M' + a + ',' + n(+b + 2); }), LAVAD, 1, 0.5);
      o += lavaBubbles(4502, 16, 0, 400, 84, 120, 1.1);
      // crust floating on the lake
      [[60, 98, 16, 3], [150, 88, 10, 2], [330, 94, 18, 3.4], [110, 114, 20, 4], [360, 116, 14, 3]].forEach(function (k) { o += E(k[0], k[1], k[2], k[3], c.cel(ROCKD), 1.2) + L('M' + pt([k[0] - k[2] * 0.6, k[1]]) + 'l' + n(k[2] * 0.5) + ',-0.6', LAVA, 0.8, 0.8); });
      // the eruption in the middle of the lake: a dome of boiling lava and a spout of fire, where the King Below rises
      o += E(250, 96, 90, 40, glow(c, LAVAL, 0.6)) + fire(c, 250, 100, 60, 70, 4, 4503, 0, FIREH, 1.6) + E(250, 100, 44, 8, c.lg([[0, LAVAW], [1, LAVA]]), 1.6) + lavaBubbles(4504, 8, 212, 290, 88, 104, 1.4);
      o += drip(c, 222, 60, 2.4) + drip(c, 280, 52, 2) + drip(c, 262, 40, 1.6) + drip(c, 234, 48, 1.8);
      // fire geysers left and right
      o += fire(c, 40, 86, 18, 36, 2, 4505, 2, FIRE3, 1.3) + fire(c, 372, 90, 14, 30, 2, 4506, -2, FIRE3, 1.2);
      // the rock shelf we stand on, its lip crumbling into the lake
      var lip = 'M-2,121 L26,119 L44,123 L70,119 L96,122 L130,119 L160,123 L190,120 L220,123 L250,119 L280,122 L312,119 L340,123 L370,119 L402,121 L402,242 L-2,242 Z';
      o += P(lip, c.lg([[0, '#4a2c22'], [0.15, '#3a2420'], [1, '#1a0e0a']]), 1.8);
      o += '<g clip-path="url(#' + c.clip(lip) + ')">' + cracks(4507, 0, 400, 128, 240, 10, 18, 1.2, 0.75) + E(250, 150, 170, 40, glow(c, LAVA, 0.25)) + '</g>';
      o += L('M-2,121 L26,119 L44,123 L70,119 L96,122 L130,119 L160,123 L190,120 L220,123 L250,119 L280,122 L312,119 L340,123 L370,119 L402,121', LAVAL, 1.2, 0.85);
      o += lavaPool(c, 90, 170, 30, 6) + lavaPool(c, 212, 214, 40, 8) + lavaPool(c, 356, 190, 26, 5);
      o += vent(c, 160, 142, 0.9, 4508) + shard(c, 24, 236, 26, 4) + shard(c, 36, 238, 14, -2) + shard(c, 384, 238, 22, -4) + rock(c, 60, 136, 30, 14, '#3a2420') + rock(c, 340, 134, 28, 14, '#3a2420');
      o += pebbles(4509, 132, 236, '#140a08', 16, 10, 390);
      return o + embers(4510, 40, 0, 400, 10, 230) + heat(c);
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- flamewaker: horned fire humanoid (facing left) with a snake's tail instead of legs ----
  function fwTail(c, o) {
    var T = taper(o.tailPts || [[64, 80], [60, 98], [66, 113], [86, 120], [106, 117], [118, 106], [115, 93]], o.tailW || 24, 2.4, 6);
    var col = o.skin, sh = F(ribbonBand(T, 0.55, 1), dk(col, 0.32), 0.8) + F(ribbonBand(T, 0, 0.32), o.belly || BELLY, 0.9) + L(bands(T, 3, 3), dk(col, 0.45), 1.1, 0.8);
    return body(c, T.d, col, sh, 2.2);
  }
  function fwHead(c, x, y, o) {
    o = o || {};
    var sk = o.skin || FW, hc = o.horn || HORN, s = '';
    s += fire(c, x + 12, y + 8, 22, 32, 3, o.seed || 5, 10, o.maneCols || FIRE3, 1.6);
    var h1 = taper([[x + 2, y - 8], [x + 6, y - 18], [x + 16, y - 24], [x + 26, y - 21]], 6.5, 1.2, 6), h2 = taper([[x + 7, y - 6], [x + 16, y - 12], [x + 25, y - 10], [x + 29, y - 2]], 5.5, 1, 6);
    s += P(h2.d, c.cel(lt(hc, 0.08)), 1.6) + L(bands(h2, 4, 3), lt(hc, 0.3), 0.9, 0.8);
    var face = 'M' + pt([x + 10, y - 9]) + 'C' + pt([x + 4, y - 14]) + ' ' + pt([x - 7, y - 12]) + ' ' + pt([x - 10, y - 5]) + 'L' + pt([x - 15, y + 1]) + 'C' + pt([x - 16, y + 4]) + ' ' + pt([x - 13, y + 7]) + ' ' + pt([x - 10, y + 7]) + 'L' + pt([x - 11, y + 11]) + 'C' + pt([x - 6, y + 16]) + ' ' + pt([x + 5, y + 15]) + ' ' + pt([x + 10, y + 9]) + 'C' + pt([x + 13, y + 3]) + ' ' + pt([x + 13, y - 5]) + ' ' + pt([x + 10, y - 9]) + 'Z';
    s += body(c, face, sk, F('M' + pt([x + 2, y - 16]) + 'L' + pt([x + 16, y - 16]) + 'L' + pt([x + 16, y + 18]) + 'L' + pt([x + 4, y + 18]) + 'C' + pt([x + 8, y + 6]) + ' ' + pt([x + 7, y - 6]) + ' ' + pt([x + 2, y - 16]) + 'Z', dk(sk, 0.3), 0.8), 2);
    s += P('M' + pt([x - 11, y - 5]) + 'L' + pt([x - 1, y - 8.4]) + 'L' + pt([x + 1.4, y - 5]) + 'L' + pt([x - 9, y - 2]) + 'Z', dk(sk, 0.5), 1);
    s += E(x - 5, y - 2.6, 6, 4, glow(c, EYEF, 0.95)) + P('M' + pt([x - 8.4, y - 2.6]) + 'L' + pt([x - 1.4, y - 4.6]) + 'L' + pt([x - 2.4, y - 1.2]) + 'Z', LAVAW, 0.8);
    s += L('M' + pt([x - 12.4, y + 7]) + 'Q' + pt([x - 4, y + 9.4]) + ' ' + pt([x + 3, y + 7]), OL, 1.4) + P('M' + pt([x - 10.6, y + 7.2]) + 'l1.2,3 l1.2,-2.7 Z M' + pt([x - 6, y + 8]) + 'l1.1,2.6 l1.1,-2.4 Z', '#f4ecd8', 0.7);
    s += L('M' + pt([x + 1, y + 1.4]) + 'q3,-2.4 5.4,0.6', dk(sk, 0.55), 1);
    s += P(h1.d, c.cel(hc), 1.7) + L(bands(h1, 4, 3), lt(hc, 0.3), 0.9, 0.8);
    if (o.crown) s += o.crown(c, x, y);
    return s;
  }
  function flamewaker(c, o) {
    var sk = o.skin || FW;
    return biped(c, {
      skin: sk, shirt: o.chest || sk, sleeve: o.sleeve || sk, glove: o.glove || sk, noLegs: true, hipY: 86, shadowR: o.shadowR || 38, armW: o.armW || 9.5,
      torsoD: o.torsoD || 'M44,48 C50,42 78,42 86,48 L82,70 L78,88 L52,88 L48,70 Z', hx: 58, hy: 29,
      back: function (c) { return (o.back ? o.back(c) : '') + fwTail(c, { skin: sk, belly: o.belly, tailPts: o.tailPts }); },
      chest: o.chestX, pads: o.pads, belt: o.belt, buckle: o.buckle || GOLD, front: o.front,
      head: function (c, x, y) { return fwHead(c, x, y, { skin: sk, horn: o.horn, seed: o.seed, crown: o.crown, maneCols: o.maneCols }); },
      far: o.far || [[80, 52], [92, 66], [96, 80]], near: o.near || [[48, 52], [38, 68], [30, 78]],
      wFar: o.wFar, wNear: o.wNear, wNearFront: o.wNearFront, farHand: o.farHand, nearHand: o.nearHand, top: o.top, tf: o.tf
    });
  }
  function bareChest(sk) { return function (c) { return L('M52,56 Q58,62 64,58 Q70,62 76,56 M60,68 L68,68 M60,76 L68,76 M64,62 L64,84', dk(sk, 0.4), 1.2, 0.85); }; }
  function spikePad(c, x, y, r, col, trim) {
    var sp = P(pd([[x - r * 0.6, y - r * 0.5], [x - r * 0.4, y - r * 1.7], [x - r * 0.05, y - r * 0.7]], true), c.cel(HORN), 1.3) + P(pd([[x + r * 0.1, y - r * 0.7], [x + r * 0.45, y - r * 1.5], [x + r * 0.6, y - r * 0.4]], true), c.cel(HORN), 1.3);
    return sp + pauldron(c, x, y, r, col, trim);
  }
  function glaive(c, p, deg, len) {
    len = len || 70;
    var s = limb('M0,26 L0,' + n(-len), '#3a2a24', 3.4) + L('M0,26 L0,' + n(-len), lt('#3a2a24', 0.3), 1, 0.55) + R(-3, -len - 2, 6, 6, c.cel(GOLD), 1.2);
    var bd = 'M-2,' + n(-len) + ' C-14,' + n(-len - 8) + ' -14,' + n(-len - 26) + ' -4,' + n(-len - 36) + ' C-6,' + n(-len - 24) + ' 2,' + n(-len - 14) + ' 3,' + n(-len - 2) + ' Z';
    s += fire(c, -6, -len - 6, 12, 30, 2, 91, -2, FIREH, 1.1) + P(bd, c.lg([[0, '#fff0b0'], [0.4, EMB], [1, LAVAD]], 0, 0, 1, 1), 1.6) + L('M-3,' + n(-len - 4) + ' C-10,' + n(-len - 12) + ' -10,' + n(-len - 24) + ' -5,' + n(-len - 32), LAVAW, 0.9, 0.8);
    s += P('M3,' + n(-len - 2) + ' L10,' + n(-len - 10) + ' L6,' + n(-len) + ' Z', c.cel(IRONL), 1.2);
    return held(s, p, deg);
  }
  function flameSword(c, p, deg, len, w) {
    len = len || 56; w = w || 5;
    var s = fire(c, 0, -6, w * 3.4, len + 16, 3, 93, 0, FIRE3, 1.4);
    s += limb('M0,10 L0,-4', '#3a2a24', 3.8) + C(0, 12, 3, c.cel(GOLD), 1.2) + P(pd([[-10, -4], [10, -4], [8, -8], [-8, -8]], true), c.cel(GOLD), 1.3) + P('M-10,-4 L-14,-10 L-8,-8 Z M10,-4 L14,-10 L8,-8 Z', c.cel(HORN), 1);
    s += P(pd([[-w, -8], [w, -8], [w * 0.8, -len], [0, -len - 9], [-w * 0.8, -len]], true), c.lg([[0, '#4a4450'], [0.5, '#2a2430'], [0.5, '#1a1620'], [1, '#2a2430']], 0, 0, 1, 0), 1.6);
    s += crackLine('M0,-10 L0,' + n(-len), 1.2);
    return held(s, p, deg);
  }
  function spikedMace(c, p, deg, len) {
    len = len || 46;
    var s = limb('M0,12 L0,' + n(-len), '#2a1e1a', 3.8) + L('M0,-6 l0,4 M0,' + n(-len * 0.5) + ' l0,4', GOLD, 3.8);
    var hy = -len - 8, sp = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4, x1 = Math.cos(a) * 9, y1 = hy + Math.sin(a) * 9, x2 = Math.cos(a) * 16, y2 = hy + Math.sin(a) * 16, px = -Math.sin(a) * 3, py = Math.cos(a) * 3; sp += 'M' + pt([x1 + px, y1 + py]) + 'L' + pt([x2, y2]) + 'L' + pt([x1 - px, y1 - py]) + 'Z'; }
    s += C(0, hy, 18, glow(c, LAVA, 0.6)) + P(sp, c.cel(HORN), 1.2) + C(0, hy, 10, c.cel(IRON), 1.8) + crackLine('M-6,' + n(hy - 3) + ' L-1,' + n(hy) + ' L-4,' + n(hy + 5) + ' M3,' + n(hy - 6) + ' L6,' + n(hy + 2), 1);
    s += fire(c, 0, hy - 8, 14, 18, 2, 95, 0, FIREH, 1);
    return held(s, p, deg);
  }
  function flameStaff(c, p, deg, len) {
    len = len || 64;
    var s = limb('M0,34 L0,' + n(-len), '#2a1a1e', 3.4) + L('M0,34 L0,' + n(-len), '#5a3a3e', 1, 0.6) + L('M0,-4 l0,5 M0,20 l0,5', GOLD, 3.4);
    var ty = -len;
    s += P('M-3,' + n(ty) + ' C-10,' + n(ty - 2) + ' -14,' + n(ty - 10) + ' -12,' + n(ty - 20) + ' C-9,' + n(ty - 12) + ' -5,' + n(ty - 8) + ' 0,' + n(ty - 8) + ' C5,' + n(ty - 8) + ' 9,' + n(ty - 12) + ' 12,' + n(ty - 20) + ' C14,' + n(ty - 10) + ' 10,' + n(ty - 2) + ' 3,' + n(ty) + ' Z', c.cel(GOLD), 1.4);
    s += fireOrb(c, 0, ty - 14, 5, 97);
    return held(s, p, deg);
  }
  // ---- core hound: a two-headed dog of black rock over a molten belly (facing left) ----
  function paw(c, x, y, col) { return P('M' + pt([x + 5, y - 6]) + 'L' + pt([x + 5, y + 2]) + 'L' + pt([x - 8, y + 2]) + 'C' + pt([x - 9, y - 2]) + ' ' + pt([x - 6, y - 5]) + ' ' + pt([x - 2, y - 6]) + 'Z', c.cel(col), 1.8) + L('M' + pt([x - 8, y + 2]) + 'l-2.2,1 M' + pt([x - 4, y + 2]) + 'l-1.6,1.4', '#f4ecd8', 1.2); }
  function houndHead(c, x, y, s, col, seed) {
    var Q = function (u, v) { return [x + u * s, y + v * s]; }, out = '';
    var sp1 = taper([Q(4, -8), Q(10, -15), Q(18, -18)], 5.4 * s, 0.8, 5), sp2 = taper([Q(-1, -10), Q(2, -19), Q(9, -25)], 5.4 * s, 0.8, 5);
    out += P(sp1.d, c.cel(ROCKD), 1.4) + P(sp2.d, c.cel(lt(col, 0.1)), 1.4);
    var up = 'M' + pt(Q(10, -8)) + 'C' + pt(Q(4, -13)) + ' ' + pt(Q(-6, -11)) + ' ' + pt(Q(-10, -7)) + 'L' + pt(Q(-20, -4)) + 'C' + pt(Q(-23, -3)) + ' ' + pt(Q(-23, 2)) + ' ' + pt(Q(-20, 2)) + 'L' + pt(Q(-8, 3)) + 'L' + pt(Q(-3, 6)) + 'L' + pt(Q(8, 6)) + 'C' + pt(Q(12, 4)) + ' ' + pt(Q(13, -4)) + ' ' + pt(Q(10, -8)) + 'Z';
    var jaw = 'M' + pt(Q(-3, 5)) + 'L' + pt(Q(-17, 10)) + 'C' + pt(Q(-18, 12)) + ' ' + pt(Q(-15, 14)) + ' ' + pt(Q(-11, 13.4)) + 'L' + pt(Q(3, 10)) + 'C' + pt(Q(7, 10)) + ' ' + pt(Q(9, 8)) + ' ' + pt(Q(8, 5)) + 'Z';
    out += C(x - 12 * s, y + 6 * s, 10 * s, glow(c, LAVAL, 0.8)) + P(pd([Q(-20, 1.6), Q(-8, 2.6), Q(-3, 5.6), Q(-17, 10.4)], true), c.lg([[0, LAVAW], [0.5, LAVAL], [1, LAVA]]), 1.2);
    out += body(c, jaw, dk(col, 0.1), F(pd([Q(-18, 12), Q(4, 8), Q(4, 14), Q(-18, 14)], true), dk(col, 0.4), 0.8), 1.8);
    out += body(c, up, col, F(pd([Q(0, -14), Q(14, -14), Q(14, 8), Q(2, 8)], true), dk(col, 0.35), 0.8) + cracks(seed, x - 14 * s, x + 8 * s, y - 8 * s, y + 1 * s, 2, 5 * s, 0.9), 2);
    out += P('M' + pt(Q(-18.4, 2)) + 'l' + n(1.2 * s) + ',' + n(3.4 * s) + 'l' + n(1.2 * s) + ',' + n(-3.2 * s) + 'Z M' + pt(Q(-13, 2.6)) + 'l' + n(1 * s) + ',' + n(3 * s) + 'l' + n(1 * s) + ',' + n(-2.8 * s) + 'Z M' + pt(Q(-15, 11.2)) + 'l' + n(1 * s) + ',' + n(-3 * s) + 'l' + n(1 * s) + ',' + n(2.8 * s) + 'Z', '#f4ecd8', 0.7);
    out += glowEye(c, x - 7 * s, y - 5 * s, 1.9 * s, EYEF) + L('M' + pt(Q(-12.4, -7.6)) + 'L' + pt(Q(-3, -9)), OL, 1.7 * s) + C(x - 21.4 * s, y - 1.2 * s, 1.1 * s, OL);
    return out;
  }
  function hound(c, o) {
    var col = o.col || ROCK, s = '', sd = o.seed || 7;
    s += shadow(c, 66, 46);
    var tl = taper([[100, 68], [112, 60], [118, 48], [113, 38]], 9, 2.4, 6);
    s += fire(c, 114, 44, 14, 20, 2, sd + 1, 2, FIRE3, 1.2) + body(c, tl.d, dk(col, 0.1), '', 1.8);
    s += limb('M88,84 L96,100 L92,114', dk(col, 0.32), 10) + paw(c, 94, 118, dk(col, 0.32)) + limb('M46,84 L40,100 L42,114', dk(col, 0.32), 10) + paw(c, 42, 118, dk(col, 0.32));
    var bd = 'M32,64 C36,50 60,48 80,52 C98,54 108,62 106,76 C104,90 90,94 72,93 L50,93 C38,91 30,80 32,64 Z';
    s += body(c, bd, col, F('M28,78 C40,96 96,98 110,78 L110,100 L28,100 Z', LAVA, 0.95) + F('M32,86 C48,97 90,98 106,86 L106,100 L32,100 Z', LAVAL, 0.85) + F('M70,44 L112,44 L112,80 C100,84 90,84 80,82 C86,70 80,56 70,44 Z', dk(col, 0.32), 0.7) + cracks(sd, 38, 104, 58, 82, 5, 9, 1.3), 2.4);
    var sp = [[42, 57, 11], [53, 52, 14], [65, 51, 15], [77, 52, 14], [89, 55, 12], [99, 60, 9]], fl = '', pl = '';
    sp.forEach(function (p, i) { fl += fire(c, p[0] + 5, p[1] + 1, 9, p[2] * (o.bigFire ? 1.4 : 0.9), 1, sd + 20 + i, 2, FIRE3, 1); pl += P(pd([[p[0] - 5, p[1] + 3], [p[0] + 1, p[1] - p[2]], [p[0] + 6, p[1] + 3]], true), c.cel(ROCKD), 1.5); });
    s += fl + pl;
    s += limb('M84,86 L80,102 L86,114', col, 11) + paw(c, 88, 118, col) + limb('M50,86 L54,102 L48,114', col, 11) + paw(c, 48, 118, col);
    if ((o.heads || 2) > 1) s += limb('M48,64 L38,50', dk(col, 0.18), 14) + houndHead(c, 32, 42, 0.95, dk(col, 0.1), sd + 3);
    s += limb('M46,72 L32,66', col, 15) + houndHead(c, 27, 62, 1.05, col, sd + 5);
    if (o.extra) s += o.extra(c);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- molten giant: a hunched giant of rock with lava in its seams (facing left) ----
  function giantHead(c, x, y, col, seed) {
    var s = rockBody(c, shag(x, y, 13, 11, 6, 0.14, seed), lt(col, 0.08), seed + 1, [x - 13, x + 13, y - 11, y + 11], 1, 2.2);
    s += P('M' + pt([x - 12, y - 3]) + 'L' + pt([x + 1, y - 6.4]) + 'L' + pt([x + 2, y - 2]) + 'L' + pt([x - 10, y]) + 'Z', dk(col, 0.45), 1.2);
    s += glowEye(c, x - 6, y - 1, 2, EYEF) + glowEye(c, x + 3, y - 2, 1.7, EYEF);
    return s + P('M' + pt([x - 9, y + 4]) + 'Q' + pt([x - 2, y + 9.6]) + ' ' + pt([x + 5, y + 5]) + 'Q' + pt([x - 2, y + 6.4]) + ' ' + pt([x - 9, y + 4]) + 'Z', LAVAL, 1.2) + drip(c, x - 4, y + 12, 1.4);
  }
  function giant(c, o) {
    var col = o.col || '#4a302a', sd = o.seed || 31, s = shadow(c, 64, 52);
    if (o.back) s += o.back(c);
    s += rockLimb(c, [[88, 46], [106, 68], [104, 88]], 15, dk(col, 0.2), sd + 1) + boulder(c, 104, 96, 12, 11, dk(col, 0.18), sd + 2, 1);
    s += rockLimb(c, [[78, 88], [82, 104], [80, 112]], 17, dk(col, 0.22), sd + 3) + P('M68,122 C66,112 74,108 84,108 C94,108 98,114 96,122 Z', c.cel(dk(col, 0.25)), 2);
    s += rockLimb(c, [[54, 88], [50, 104], [50, 112]], 18, col, sd + 4) + P('M36,122 C34,112 42,108 52,108 C62,108 66,114 64,122 Z', c.cel(dk(col, 0.1)), 2);
    s += rockBody(c, shag(66, 64, 36, 32, 9, 0.1, sd + 5, 0.2), col, sd + 6, [30, 102, 34, 96], 6, 2.6);
    if (o.core) s += o.core(c);
    s += fire(c, 90, 42, 22, 28, 3, sd + 7, 4) + fire(c, 40, 44, 24, 30, 3, sd + 8, -2);
    s += boulder(c, 90, 46, 14, 11, lt(col, 0.05), sd + 9, 2) + boulder(c, 40, 48, 16, 12, col, sd + 10, 2);
    s += o.head ? o.head(c) : giantHead(c, 58, 32, col, sd + 11);
    s += rockLimb(c, [[40, 54], [24, 74], [26, 92]], 16, lt(col, 0.04), sd + 12) + boulder(c, 26, 102, 15, 13, lt(col, 0.06), sd + 13, 2);
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  // ---- fire elemental: living fire around a dark stone core (facing left) ----
  function fireMask(c, x, y, o) {
    o = o || {};
    var rk = o.rock || ROCK, s = '';
    if (o.horns) s += P(taper([[x + 2, y - 10], [x + 6, y - 20], [x + 15, y - 25]], 5.4, 1, 5).d, c.cel(ROCKD), 1.5) + P(taper([[x - 5, y - 10], [x - 8, y - 20], [x - 5, y - 28]], 5.4, 1, 5).d, c.cel(lt(ROCKD, 0.1)), 1.5);
    var d = 'M' + pt([x + 8, y - 9]) + 'C' + pt([x + 2, y - 13]) + ' ' + pt([x - 8, y - 11]) + ' ' + pt([x - 10, y - 4]) + 'L' + pt([x - 12, y + 4]) + 'C' + pt([x - 10, y + 10]) + ' ' + pt([x - 2, y + 13]) + ' ' + pt([x + 5, y + 11]) + 'C' + pt([x + 10, y + 7]) + ' ' + pt([x + 11, y - 3]) + ' ' + pt([x + 8, y - 9]) + 'Z';
    s += rockBody(c, d, rk, 61, [x - 12, x + 11, y - 13, y + 13], 1, 2);
    if (o.crest) s += P(pd([[x - 6, y - 10], [x - 2, y - 22], [x + 2, y - 12], [x + 6, y - 20], [x + 7, y - 9]], true), c.cel(ROCKD), 1.4);
    s += E(x - 4, y, 9, 6, glow(c, EYEF, 0.7)) + P('M' + pt([x - 10, y - 3]) + 'L' + pt([x - 2, y - 1]) + 'L' + pt([x - 4.4, y + 2]) + 'Z', EYEF, 1) + P('M' + pt([x + 1, y - 2]) + 'L' + pt([x + 7, y - 3]) + 'L' + pt([x + 5, y + 1]) + 'Z', EYEF, 1);
    return s + P('M' + pt([x - 7, y + 6]) + 'Q' + pt([x - 1, y + 10.4]) + ' ' + pt([x + 4, y + 6]) + 'Q' + pt([x - 1, y + 7.8]) + ' ' + pt([x - 7, y + 6]) + 'Z', LAVAL, 1);
  }
  function fireElem(c, o) {
    var sd = o.seed || 51, s = '', rk = o.rock || ROCK;
    s += shadow(c, 64, o.sr || 30) + E(64, 72, 62, 60, glow(c, LAVA, 0.35));
    var cols = o.cols || FIRE3, h = o.h || 100;
    // the body of living fire: broad round the stone core, tongues above the head, narrowing to a whirling tail at the ground
    s += fire(c, 64 + (o.dx || 0), 96, (o.w || 58) * 1.3, h - 18, (o.k || 5) + 2, sd, o.lean == null ? 4 : o.lean, cols, 2.2, 0.34);
    var tq = [[64, 74], [46, 94], [80, 106], [60, 123]];
    s += P(btaper(tq, (o.w || 58) * 0.62, 4, 22, [2, 3]), cols[0], 2.2) + F(btaper([[64, 78], [52, 94], [74, 104], [62, 119]], (o.w || 58) * 0.4, 2.4, 20, [2, 2.4]), cols[1]) + F(btaper([[64, 82], [56, 94], [70, 102], [63, 114]], (o.w || 58) * 0.2, 1.4, 18, [2, 1.6]), cols[2]);
    if (o.back) s += o.back(c);
    var far = o.far || [[80, 52], [94, 64], [98, 78]], near = o.near || [[46, 54], [34, 68], [28, 80]];
    var fe = far[far.length - 1], ne = near[near.length - 1];
    s += fireArm(c, far, o.armW || 9) + (o.farHand ? o.farHand(c, fe) : boulder(c, fe[0], fe[1], 6.4, 6, ROCKD, sd + 1, 1));
    s += rockBody(c, o.coreD || shag(64, 66, 14, 18, 7, 0.14, sd + 2), rk, sd + 3, [50, 78, 48, 84], 2, 2.2);
    s += C(64, 68, 12, glow(c, LAVAL, 0.8)) + P(pd([[60, 62], [67, 60], [70, 68], [65, 76], [58, 72]], true), c.rg([[0, LAVAW], [0.5, LAVAL], [1, LAVA]]), 1.4);
    if (o.chest) s += o.chest(c);
    s += boulder(c, 82, 50, 9.4, 7.4, rk, sd + 4, 1) + boulder(c, 46, 52, 10.4, 8, lt(rk, 0.06), sd + 5, 1);
    s += fire(c, 63, 30, 26, 36, 3, sd + 6, 6, FIREH, 1.6);
    s += fireMask(c, 60, 32, o);
    s += fireArm(c, near, (o.armW || 9) + 1) + (o.nearHand ? o.nearHand(c, ne) : boulder(c, ne[0], ne[1], 7, 6.4, rk, sd + 7, 1));
    if (o.top) s += o.top(c);
    return o.tf ? G(s, o.tf) : s;
  }
  function shackle(c, a, b, t) { var p = lerp2(a, b, t || 0.5), dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / d * 7.4, py = dx / d * 7.4, ux = dx / d * 3.4, uy = dy / d * 3.4; return P(pd([[p[0] + px - ux, p[1] + py - uy], [p[0] + px + ux, p[1] + py + uy], [p[0] - px + ux, p[1] - py + uy], [p[0] - px - ux, p[1] - py - uy]], true), c.cel(IRONL), 1.6) + L('M' + pt([p[0] + px * 0.6, p[1] + py * 0.6]) + 'L' + pt([p[0] - px * 0.6, p[1] - py * 0.6]), dk(IRONL, 0.4), 1, 0.8); }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    core_hound: function (c) { return hound(c, { col: ROCK, seed: 111, tf: at(0.84, 64, 122) }); },
    core_rager: function (c) {
      // Magmahulk's dogs: one heavy head, thicker plating, a brighter belly
      return hound(c, { col: '#4a2a22', seed: 121, heads: 1, tf: at(0.86, 64, 122), extra: function (c) { return boulder(c, 64, 56, 9, 5, ROCKD, 125, 1) + boulder(c, 84, 58, 8, 5, ROCKD, 126, 1); } });
    },
    magmadar: function (c) {
      // the great core hound: the biggest of the pack, fire pouring off its back, lava dripping from both mouths
      return shadow(c, 64, 60) + E(64, 70, 70, 56, glow(c, LAVA, 0.4)) + hound(c, { col: '#46281e', seed: 131, bigFire: true, tf: 'matrix(1.08,0,0,1.08,-6,-9.6)', extra: function (c) { return fire(c, 70, 54, 56, 36, 5, 135, 4, FIRE3, 1.6) + drip(c, 10, 76, 1.8) + drip(c, 16, 58, 1.5) + boulder(c, 58, 50, 7, 4, ROCKD, 136, 0) + boulder(c, 78, 50, 7, 4, ROCKD, 137, 0); } });
    },
    molten_giant: function (c) { return giant(c, { col: '#4a302a', seed: 141, tf: at(0.94, 64, 122) }); },
    golemagg: function (c) {
      // the Incinerator: a bigger giant, an obsidian crown of spikes, a furnace burning open in his chest
      return giant(c, {
        col: '#523028', seed: 151, tf: 'matrix(1.06,0,0,1.06,-4,-7.2)',
        back: function (c) { return E(64, 60, 64, 60, glow(c, LAVA, 0.45)) + fire(c, 66, 60, 90, 60, 5, 152, 2); },
        core: function (c) { return C(64, 66, 22, glow(c, LAVAL, 0.9)) + P(shag(64, 66, 12, 14, 6, 0.18, 153), c.rg([[0, '#ffffff'], [0.3, LAVAW], [0.7, LAVAL], [1, LAVA]]), 2) + L('M56,58 L72,74 M72,58 L56,74 M64,52 L64,80', dk(ROCK, 0.3), 2.2, 0.9); },
        top: function (c) { var sp = ''; [[46, 22, -6], [52, 18, -2], [58, 16, 1], [64, 18, 4], [70, 22, 7]].forEach(function (k) { sp += P(pd([[k[0] - 3, k[1] + 6], [k[0] + k[2] * 0.4, k[1] - 8], [k[0] + 3, k[1] + 6]], true), c.cel(OBS), 1.4); }); return sp + drip(c, 88, 58, 1.6) + drip(c, 36, 60, 1.8); }
      });
    },
    firelord: function (c) {
      // a lord of living fire: horned stone mask, a lash of lava in the near hand
      var whip = 'M28,82 C16,88 10,98 14,108 C18,116 10,120 4,116';
      return fireElem(c, { seed: 161, horns: true, w: 60, h: 106,
        nearHand: function (c, p) { return L(whip, OL, 4.6) + L(whip, LAVA, 2.8) + L(whip, LAVAL, 1) + boulder(c, p[0], p[1], 7, 6.4, ROCK, 162, 1) + fire(c, 4, 118, 8, 12, 1, 163, 0, FIREH, 1); } });
    },
    firesworn: function (c) {
      // Stonecore's small bound elementals, hunched and flickering
      return fireElem(c, { seed: 171, w: 52, h: 90, k: 4, lean: 6, near: [[46, 54], [36, 72], [34, 86]], far: [[80, 52], [92, 70], [92, 84]], tf: at(0.7, 64, 122), cols: [LAVAD, LAVA, LAVAL] });
    },
    son_of_flame: function (c) {
      // the King Below's children: brighter fire, a stone crest, both arms raised to burn
      return fireElem(c, { seed: 181, crest: true, w: 56, h: 104, cols: [LAVA, LAVAL, LAVAW], near: [[46, 54], [34, 42], [30, 26]], far: [[80, 52], [94, 42], [98, 28]], tf: at(0.88, 64, 122),
        farHand: function (c, p) { return fireOrb(c, p[0], p[1], 4.4, 182); }, nearHand: function (c, p) { return fireOrb(c, p[0], p[1], 5, 183); } });
    },
    core_surger: function (c) {
      // a wave of magma that rises out of its pool and breaks forward, black crust on its back, a face on its crest
      var s = shadow(c, 66, 48) + E(70, 84, 62, 46, glow(c, LAVA, 0.35));
      s += lavaPool(c, 70, 116, 54, 9, false);
      // the body: a thick column of magma rising from the pool and curling forward like a breaking wave
      var T = taper([[88, 123], [94, 102], [84, 80], [80, 60], [70, 46], [56, 40]], 44, 26, 7), m = T.s.length;
      var sh = F(ribbonBand(T, 0.55, 1), LAVAL, 0.95) + F(ribbonBand(T, 0.82, 1), LAVAW, 0.8) + F(ribbonBand(T, 0, 0.3), ROCK, 0.96) + L(along(T, 0.3), LAVAD, 1.6, 0.9) + L(bands(T, 7, 5), LAVAD, 1, 0.35);
      s += fire(c, 104, 96, 18, 30, 2, 199, 4, FIRE3, 1.3) + fire(c, 94, 66, 20, 30, 3, 196, 6, FIRE3, 1.3) + fire(c, 82, 46, 18, 22, 2, 194, 6, FIRE3, 1.2);
      s += body(c, T.d, LAVA, sh, 2.4);
      // jagged crust along the back of the wave
      var cr = '';
      for (var i = 4; i < m - 6; i += 5) { var a = T.a[i], b = T.a[i + 2], q = T.s[i + 1], dx = a[0] - q[0], dy = a[1] - q[1], dd = Math.sqrt(dx * dx + dy * dy) || 1; cr += 'M' + pt(a) + 'L' + pt([(a[0] + b[0]) / 2 + dx / dd * 6, (a[1] + b[1]) / 2 + dy / dd * 6]) + 'L' + pt(b) + 'Z'; }
      s += P(cr, c.cel(ROCKD), 1.4);
      // the head at the crest: molten, under a brow of black rock, the mouth open
      var hp = T.s[m - 1];
      s += P('M' + pt([hp[0] + 12, hp[1] - 10]) + 'C' + pt([hp[0] + 2, hp[1] - 16]) + ' ' + pt([hp[0] - 16, hp[1] - 12]) + ' ' + pt([hp[0] - 24, hp[1] - 2]) + 'L' + pt([hp[0] - 25, hp[1] + 4]) + 'C' + pt([hp[0] - 20, hp[1] + 11]) + ' ' + pt([hp[0] - 8, hp[1] + 14]) + ' ' + pt([hp[0] + 2, hp[1] + 13]) + 'C' + pt([hp[0] + 10, hp[1] + 11]) + ' ' + pt([hp[0] + 15, hp[1] + 2]) + ' ' + pt([hp[0] + 12, hp[1] - 10]) + 'Z', c.lg([[0, LAVAL], [0.6, LAVA], [1, LAVAD]], 0, 0, 0.6, 1), 2.2);
      s += P('M' + pt([hp[0] - 24, hp[1] + 3]) + 'Q' + pt([hp[0] - 10, hp[1] + 14]) + ' ' + pt([hp[0] + 2, hp[1] + 6]) + 'Q' + pt([hp[0] - 10, hp[1] + 7]) + ' ' + pt([hp[0] - 24, hp[1] + 3]) + 'Z', '#5a1206', 1.2) + P('M' + pt([hp[0] - 20, hp[1] + 4.4]) + 'l1.2,2.6 l1.4,-2.2 Z M' + pt([hp[0] - 12, hp[1] + 6.6]) + 'l1.2,2.6 l1.2,-2.2 Z M' + pt([hp[0] - 4, hp[1] + 6.8]) + 'l1.1,2.2 l1.1,-2 Z', LAVAW, 0.6);
      s += rockBody(c, 'M' + pt([hp[0] + 14, hp[1] - 8]) + 'C' + pt([hp[0] + 6, hp[1] - 18]) + ' ' + pt([hp[0] - 14, hp[1] - 16]) + ' ' + pt([hp[0] - 25, hp[1] - 3]) + 'L' + pt([hp[0] - 16, hp[1] - 3]) + 'L' + pt([hp[0] - 6, hp[1] - 7]) + 'L' + pt([hp[0] + 6, hp[1] - 4]) + 'Z', ROCK, 195, [hp[0] - 25, hp[0] + 14, hp[1] - 18, hp[1] - 3], 0, 1.8) + P(pd([[hp[0] + 4, hp[1] - 12], [hp[0] + 14, hp[1] - 22], [hp[0] + 11, hp[1] - 8]], true), c.cel(ROCKD), 1.3);
      s += glowEye(c, hp[0] - 14, hp[1] - 0.6, 2.2, EYEF) + glowEye(c, hp[0] - 5, hp[1] - 2.6, 1.9, EYEF);
      s += drip(c, hp[0] - 10, hp[1] + 24, 2.2) + drip(c, hp[0] - 2, hp[1] + 34, 1.7) + drip(c, hp[0] - 16, hp[1] + 40, 1.4);
      // splashes where it leaves the pool
      s += L(ellD(94, 118, 20, 3.4), LAVAW, 1.2, 0.8) + lavaBubbles(198, 7, 30, 120, 110, 121, 1.2) + drip(c, 118, 110, 1.6) + drip(c, 74, 112, 1.4);
      return s;
    },
    garr: function (c) {
      // a lord of fire in a body of black rock: no legs, a tail of rubble over a pool of magma, flames pouring from his back
      var s = shadow(c, 64, 54) + E(64, 70, 70, 64, glow(c, LAVA, 0.4));
      s += lavaPool(c, 66, 118, 42, 7) + fire(c, 66, 118, 70, 50, 5, 201, 2);
      s += fire(c, 70, 48, 86, 50, 6, 202, 6);
      s += rockLimb(c, [[92, 44], [112, 62], [110, 82]], 16, dk(ROCK, 0.15), 203) + boulder(c, 110, 92, 13, 12, ROCKD, 204, 2) + fire(c, 110, 84, 16, 16, 2, 205, 2, FIREH, 1);
      // the body: slabs of black rock held together by the fire inside, tapering into rubble
      var bd = 'M28,46 L40,34 L60,36 L84,32 L102,42 L100,62 L90,80 L78,94 L66,104 L56,94 L44,82 L32,66 Z';
      s += body(c, bd, LAVA, F(bd, c.rg([[0, LAVAW], [0.4, LAVAL], [1, LAVA]])), 2.6);
      var slabs = [['M30,46 L41,36 L58,38 L56,56 L40,62 L33,58 Z', '#54362c'], ['M62,38 L83,34 L99,43 L96,58 L78,60 L64,54 Z', '#4a2e26'], ['M36,66 L42,64 L56,60 L62,74 L54,86 L45,80 Z', '#50342a'], ['M60,58 L78,63 L94,62 L88,78 L72,82 L64,74 Z', '#44281f'], ['M52,90 L58,80 L68,86 L76,88 L66,100 Z', '#3e241c']];
      slabs.forEach(function (sl, i) { s += rockBody(c, sl[0], sl[1], 206 + i * 3, [30, 100, 32, 100], 1, 2); });
      s += C(60, 62, 14, glow(c, LAVAW, 0.5));
      s += boulder(c, 58, 106, 9, 6, ROCK, 207, 1) + boulder(c, 74, 112, 7, 5, ROCKD, 208, 0) + boulder(c, 50, 114, 5, 4, ROCKD, 209, 0);
      s += boulder(c, 96, 36, 16, 12, '#54362c', 210, 2) + boulder(c, 32, 38, 18, 13, '#5a3a30', 211, 2);
      s += fire(c, 62, 22, 40, 34, 4, 212, 4, FIREH, 1.4);
      s += G(fireMask(c, 60, 26, { horns: true, rock: '#5a3a30' }), at(1.35, 60, 30));
      s += rockLimb(c, [[38, 48], [20, 66], [22, 86]], 17, '#5a3a30', 213) + boulder(c, 22, 96, 15, 13, '#5a3a30', 214, 2) + fire(c, 22, 86, 18, 18, 2, 215, -2, FIREH, 1);
      return s;
    },
    baron_geddon: function (c) {
      // a burning baron shackled in iron bands, one hand raised with a living bomb
      return fireElem(c, { seed: 221, horns: true, w: 66, h: 112, k: 6, rock: '#4a2c26', far: [[80, 50], [92, 38], [96, 22]], near: [[46, 54], [34, 70], [26, 82]],
        farHand: function (c, p) { return fireOrb(c, p[0], p[1] - 4, 7, 222) + L(ellD(p[0], p[1] - 4, 11, 4), OL, 3) + L(ellD(p[0], p[1] - 4, 11, 4), RUNE, 1.4) + boulder(c, p[0], p[1] + 4, 6, 5, ROCKD, 223, 0); },
        chest: function (c) { return P('M46,46 C54,40 74,40 82,46 L80,52 C72,48 56,48 48,52 Z', c.cel(IRONL), 1.6) + C(64, 47, 2.4, c.cel(GOLD), 1); },
        top: function (c) { return shackle(c, [80, 50], [92, 38], 0.6) + shackle(c, [46, 54], [34, 70], 0.55) + chain(34, 70, 20, 100, 4, 6) + chain(92, 38, 110, 60, 4, 6); } });
    },
    flamewaker_guard: function (c) {
      // armoured in black iron with gold trim, a burning glaive
      return flamewaker(c, {
        skin: FW, chest: IRON, seed: 231, belt: GOLDD, buckle: GOLD,
        chestX: function (c) { return L('M48,50 L64,58 L80,50', GOLD, 1.4) + P('M58,62 L70,62 L68,74 L64,78 L60,74 Z', c.cel(dk(IRON, 0.2)), 1.2) + crackLine('M64,64 L64,74', 1) + L('M50,70 L78,70', IRONL, 1, 0.7); },
        pads: function (c) { return spikePad(c, 80, 50, 9, IRON, GOLD) + spikePad(c, 48, 52, 11, IRON, GOLD); },
        near: [[48, 54], [40, 68], [34, 72]], wNear: function (c, p) { return glaive(c, p, -14, 60); }
      });
    },
    flamewaker_elite: function (c) {
      // heavier armour, a helm over the brow, a sword of black iron wrapped in fire
      return flamewaker(c, {
        skin: '#b43a22', chest: '#3a3238', seed: 241, belt: GOLD, buckle: GOLDD, horn: '#3a2420', tf: at(1.02, 64, 122),
        chestX: function (c) { return P('M50,48 L78,48 L76,62 L52,62 Z', c.cel('#4a4048'), 1.4) + L('M52,52 L76,52 M52,58 L76,58', GOLD, 1.2) + crackLine('M58,70 L64,78 L70,70', 1.2); },
        pads: function (c) { return spikePad(c, 82, 50, 10, '#3a3238', GOLD) + spikePad(c, 46, 52, 12, '#3a3238', GOLD); },
        crown: function (c, x, y) { return P('M' + pt([x - 11, y - 6]) + 'C' + pt([x - 8, y - 16]) + ' ' + pt([x + 8, y - 17]) + ' ' + pt([x + 12, y - 8]) + 'L' + pt([x + 10, y - 4]) + 'L' + pt([x - 10, y - 2]) + 'Z', c.cel('#3a3238'), 1.6) + L('M' + pt([x - 10, y - 4]) + 'L' + pt([x + 10, y - 6]), GOLD, 1.3); },
        near: [[48, 54], [40, 68], [32, 70]], wNear: function (c, p) { return flameSword(c, p, -28, 58, 5); }
      });
    },
    flamewaker_priest: function (c) {
      // bare-chested under a crimson mantle, a gold circlet, fire gathered in both hands
      return flamewaker(c, {
        skin: FW, seed: 251, chestX: bareChest(FW), belt: '#6a1a18', buckle: GOLD,
        back: function (c) { return P('M44,46 C40,70 36,88 30,100 L48,96 L50,60 Z', c.cel('#6a1a18'), 1.8); },
        pads: function (c) { return P('M40,48 C46,40 84,40 90,48 C86,56 80,58 76,54 L64,62 L52,54 C48,58 42,56 40,48 Z', c.cel('#8a2420'), 1.8) + L('M42,50 C50,46 80,46 88,50', GOLD, 1.3) + C(64, 58, 2.6, c.cel(GOLD), 1); },
        crown: function (c, x, y) { return L('M' + pt([x - 11, y - 6]) + 'Q' + pt([x, y - 11]) + ' ' + pt([x + 10, y - 8]), OL, 3.6) + L('M' + pt([x - 11, y - 6]) + 'Q' + pt([x, y - 11]) + ' ' + pt([x + 10, y - 8]), GOLD, 2) + C(x - 3, y - 9, 2, c.cel(LAVAL), 0.8); },
        far: [[80, 52], [92, 42], [96, 30]], farHand: function (c, p) { return hand(p, c.cel(FW)) + fireOrb(c, p[0] - 1, p[1] - 10, 5, 252); },
        near: [[48, 54], [38, 66], [28, 66]], nearHand: function (c, p) { return hand(p, c.cel(FW)) + fire(c, p[0] - 2, p[1] - 3, 12, 18, 2, 253, -2, FIREH, 1.1); }
      });
    },
    flamewaker_healer: function (c) {
      // slighter, in wraps of pale gold cloth, hands glowing white-hot with mending fire
      var wr = '#e8c880';
      return flamewaker(c, {
        skin: FWL, seed: 261, belly: '#f8c890', chest: FWL, chestX: function (c) { return L('M46,52 L82,70 M46,62 L80,80 M48,74 L74,86', OL, 4.4) + L('M46,52 L82,70 M46,62 L80,80 M48,74 L74,86', wr, 2.6); }, belt: wr, buckle: LAVAL,
        maneCols: FIREH, tf: at(0.94, 64, 122),
        far: [[80, 52], [94, 60], [100, 52]], farHand: function (c, p) { return C(p[0], p[1], 12, glow(c, '#fff8c0', 0.9)) + hand(p, c.cel(LAVAW)); },
        near: [[48, 54], [36, 62], [28, 58]], nearHand: function (c, p) { return C(p[0], p[1], 14, glow(c, '#fff8c0', 0.9)) + hand(p, c.cel(LAVAW)) + L(ellD(p[0], p[1] - 10, 8, 3), '#fff4b0', 1.4, 0.9) + motes(262, 6, p[0] - 10, p[0] + 10, p[1] - 22, p[1] - 4, '#fff8c0'); }
      });
    },
    sulfuron_harbinger: function (c) {
      // the King Below's herald: taller and heavier, spiked iron over dark red skin, a spiked mace that burns
      return flamewaker(c, {
        skin: '#a8321e', chest: '#2a2228', seed: 271, belt: GOLDD, buckle: GOLD, maneCols: FIREH, shadowR: 42, tf: 'matrix(1.06,0,0,1.06,-4,-7.2)',
        chestX: function (c) { return P('M52,50 L76,50 L72,66 L64,72 L56,66 Z', c.cel('#3a3038'), 1.4) + crackLine('M64,52 L64,68 M58,58 L70,58', 1.3) + L('M48,76 L80,76', GOLD, 1.2); },
        pads: function (c) { return spikePad(c, 82, 50, 11, '#2a2228', GOLD) + spikePad(c, 46, 52, 13, '#2a2228', GOLD); },
        crown: function (c, x, y) { return P(pd([[x - 4, y - 12], [x - 1, y - 24], [x + 3, y - 12]], true), c.cel(HORN), 1.3) + P(pd([[x + 3, y - 12], [x + 7, y - 21], [x + 8, y - 10]], true), c.cel(HORN), 1.3); },
        near: [[48, 54], [40, 66], [34, 64]], wNear: function (c, p) { return spikedMace(c, p, -20, 46); },
        far: [[80, 52], [94, 62], [100, 74]], farHand: function (c, p) { return hand(p, c.cel('#a8321e')) + fire(c, p[0], p[1] - 3, 10, 14, 2, 272, 1, FIREH, 1); }
      });
    },
    majordomo_executus: function (c) {
      // the steward of the King Below's house: a flamewaker lord in long crimson robes and a tall collar, a flame-crowned staff
      var rb = '#6a1a1c', rbl = '#8a2a26';
      return flamewaker(c, {
        skin: '#c0442a', chest: rb, sleeve: rb, seed: 281, maneCols: FIREH, shadowR: 42, horn: '#3a2420', tf: 'matrix(1.04,0,0,1.04,-2.6,-4.8)',
        tailPts: [[64, 96], [64, 106], [72, 116], [90, 121], [108, 118], [120, 108], [118, 96]],
        front: function (c) {
          var d = 'M48,84 L80,84 C84,94 90,104 94,112 L34,112 C38,104 44,94 48,84 Z';
          return body(c, d, rb, F('M66,82 L100,82 L100,116 L70,116 C72,104 70,92 66,82 Z', dk(rb, 0.3), 0.8) + L('M34,110 L94,110', GOLD, 2.4) + P('M58,84 L70,84 L72,112 L56,112 Z', c.cel(rbl), 1.2) + L('M58,86 L56,110 M70,86 L72,110', GOLD, 1.1), 2.2);
        },
        chestX: function (c) { return P('M56,48 L72,48 L70,86 L58,86 Z', c.cel(rbl), 1.3) + L('M56,48 L58,86 M72,48 L70,86', GOLD, 1.2) + fireOrb(c, 64, 60, 2.8, 282); },
        pads: function (c) { return P('M38,50 C40,34 52,30 60,36 L60,46 Z', c.cel('#2a1e22'), 1.6) + P('M90,50 C88,34 76,30 68,36 L68,46 Z', c.cel('#2a1e22'), 1.6) + L('M40,48 C42,38 52,34 58,38 M88,48 C86,38 76,34 70,38', GOLD, 1.2) + pauldron(c, 82, 52, 9, rbl, GOLD) + pauldron(c, 46, 54, 11, rbl, GOLD); },
        crown: function (c, x, y) { var sp = ''; [[-8, -11, -12], [-3, -13, -18], [2, -13, -20], [7, -11, -16]].forEach(function (k) { sp += P(pd([[x + k[0] - 2, y + k[1] + 1], [x + k[0] + 0.6, y + k[2] - 4], [x + k[0] + 2.4, y + k[1] + 1]], true), c.cel(GOLD), 1.1); }); return sp + P('M' + pt([x - 11, y - 8]) + 'Q' + pt([x, y - 14]) + ' ' + pt([x + 10, y - 10]) + 'L' + pt([x + 10, y - 7]) + 'Q' + pt([x, y - 11]) + ' ' + pt([x - 11, y - 5]) + 'Z', c.cel(GOLD), 1.2) + C(x - 1, y - 10.4, 1.8, c.cel(LAVAL), 0.8); },
        near: [[48, 54], [40, 70], [34, 74]], wNear: function (c, p) { return flameStaff(c, p, -6, 66); }, wNearFront: function (c, p) { return cuff(c, [40, 70], p, rb, GOLD); },
        far: [[80, 52], [94, 44], [100, 32]], farHand: function (c, p) { return cuff(c, [94, 44], p, rb, GOLD) + hand(p, c.cel('#c0442a')) + fire(c, p[0], p[1] - 4, 12, 18, 2, 283, 0, FIREH, 1.1); }
      });
    },
    ragnaros: function (c) {
      // the King Below (art_story.js: ragnaros) as a combat sprite: a vast torso of magma rising from the lava, hammer raised
      var s = E(64, 60, 76, 72, glow(c, LAVA, 0.55));
      s += fire(c, 66, 108, 114, 96, 7, 301, 3, FIRE3, 2.2);
      // far arm down into the lava, the fist burning
      s += rockLimb(c, [[98, 56], [118, 78], [112, 100]], 14, ROCK, 302) + boulder(c, 112, 104, 10, 9, ROCK, 303, 1) + fire(c, 112, 100, 16, 22, 2, 304, 1, FIREH, 1.2);
      // the molten torso with black rock plates
      var tor = 'M38,120 C34,98 28,78 28,62 C28,54 34,48 44,46 L86,46 C96,48 102,54 100,62 C100,78 94,98 90,120 Z';
      s += P(tor, c.lg([[0, LAVAW], [0.25, LAVAL], [0.65, LAVA], [1, LAVAD]], 0.3, 0, 0.7, 1), 2.4);
      var pl = 'M32,54 C40,48 56,48 62,52 L61,70 C52,76 40,74 35,66 Z M68,52 C74,48 90,48 96,54 L94,66 C88,74 77,76 69,70 Z';
      [[80, 90], [93, 103], [106, 118]].forEach(function (yy, i) { var a = i * 3; pl += ' M' + (40 + a) + ',' + yy[0] + ' L62,' + (yy[0] - 1) + ' L62,' + (yy[1] - 2) + ' L' + (42 + a) + ',' + (yy[1] - 1) + ' Z M66,' + (yy[0] - 1) + ' L' + (90 - a) + ',' + yy[0] + ' L' + (88 - a) + ',' + (yy[1] - 1) + ' L66,' + (yy[1] - 2) + ' Z'; });
      s += body(c, pl, ROCK, F('M66,40 L104,40 L104,124 L72,124 Z', dk(ROCK, 0.35), 0.75), 1.8);
      s += L('M40,60 l7,4 l4,-3 M78,58 l6,5 l6,-2 M46,96 l6,3 M74,108 l7,2', LAVA, 1.3);
      // shoulders
      s += rockBody(c, 'M14,62 C12,46 26,38 40,44 C48,50 46,66 36,72 C26,76 16,72 14,62 Z', ROCK, 305, [12, 48, 38, 76], 2, 2.2) + rockBody(c, 'M116,60 C118,44 104,38 90,44 C82,50 84,66 94,72 C104,76 114,70 116,60 Z', dk(ROCK, 0.1), 306, [82, 118, 38, 76], 2, 2.2);
      // head: horned brow, burning eyes, a beard of flame
      s += fire(c, 64, 26, 42, 30, 4, 307, 0, FIREH, 1.6);
      s += P(taper([[56, 22], [42, 14], [34, 4], [34, -4]], 9, 1.4, 6).d, c.cel(HORN), 2) + P(taper([[74, 22], [88, 14], [96, 4], [96, -4]], 9, 1.4, 6).d, c.cel(dk(HORN, 0.1)), 2);
      s += rockBody(c, 'M52,26 C54,14 76,14 78,26 L80,40 C78,50 72,55 65,55 C58,55 52,50 50,40 Z', ROCK, 308, [50, 80, 14, 55], 1, 2);
      s += P('M49,28 L63,36 L65,34 L67,36 L81,28 L78,23 L65,30 L52,23 Z', dk(ROCK, 0.35), 1.4);
      s += E(58, 36, 8, 5, glow(c, EYEF, 0.95)) + E(72, 36, 8, 5, glow(c, EYEF, 0.95)) + P('M52,33 L62,37.4 L60.4,40 L53,37 Z', LAVAW, 0.9) + P('M78,33 L68,37.4 L69.6,40 L77,37 Z', LAVAW, 0.9);
      s += P('M56,44 L74,44 L71.4,52 L58.6,52 Z', EMB, 1.4) + P('M58,44 l1.8,3.6 l1.8,-3.6 Z M64,44 l1.6,3 l1.6,-3 Z M69.8,44 l1.8,3.6 l1.8,-3.6 Z', dk(ROCK, 0.2), 0.8);
      s += P('M56,52 C58,62 61,70 65,80 C69,70 72,62 74,52 Q65,57 56,52 Z', LAVA, 1.4) + P('M60,54 C62,62 63,68 65,74 C67,68 68,62 70,54 Q65,57 60,54 Z', LAVAL);
      // near arm raised, the hammer held high
      var hm = E(18, 22, 34, 30, glow(c, EMB, 0.7));
      hm += limb('M20,118 L20,30', '#2a1a14', 5.6) + L('M20,54 L20,58 M20,84 L20,88 M20,108 L20,112', EMB, 5.6);
      hm += P('M-1,8 L8,14 L32,12 L41,6 L43,40 L34,34 L10,36 L1,42 Z', c.cel(ROCK), 2) + P('M10,17 L31,15 L32,32 L12,34 Z', c.rg([[0, '#fff8c0'], [0.5, EMB], [1, '#e04a10']]), 1.4) + L('M15,20 l4,5 l-2,6 M26,18 l-3,6 l4,6', LAVAW, 1) + L('M2,14 L5,38 M40,10 L41,36', LAVA, 1.2, 0.8);
      hm += fire(c, 21, 12, 24, 22, 3, 309, -2, FIREH, 1.2);
      hm += rockLimb(c, [[38, 60], [18, 82], [20, 66]], 13, ROCK, 310) + boulder(c, 20, 64, 9, 8, ROCK, 311, 1);
      s += G(hm, 'translate(5,3)');
      // the lava he rises from, lapping at the front of the sprite
      s += E(64, 118, 66, 14, glow(c, LAVAL, 0.6)) + P('M3,121 C2,112 18,106 34,110 Q52,116 70,110 Q90,104 106,110 C120,108 126,114 125,121 C124,127 100,127 64,127 C28,127 4,127 3,121 Z', c.lg([[0, LAVAW], [0.3, LAVAL], [0.7, LAVA], [1, LAVAD]]), 2);
      s += L('M10,118 q6,-3 12,0 M50,120 q6,-3 12,0 M92,118 q6,-3 12,0', LAVAW, 1.3) + lavaBubbles(312, 5, 6, 122, 116, 124, 1.1);
      return s;
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(ROCK), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, ROCKD) + ground(c, 150, ROCK, ROCKD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#3a2420"/></svg>'; }
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
