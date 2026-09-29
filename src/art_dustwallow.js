/* art_dustwallow.js — Saltmarsh and Veshmira's Lair art for Realm of Loner (contested zone and 10-player raid, level 60,
 * Chapter 6 "The Brood Mother": Veshmira, unmasked at the Kingsmere court, has fled south across the sea to her cave under
 * the Dragonmire, and her brood spreads out through the marsh).
 *   scenes  theramore_isle       the Accord harbour fort: stone towers with blue roofs, blue banners, ships on the sea
 *           brackenwall_village  the Krugar camp: hide huts and a palisade in a dark swamp, braziers, a war banner
 *           the_quagmire         murky swamp, twisted mossy trees, fog, reeds, whelps in the sky
 *           scorched_fen         the dragon-burnt fen: charred trees, smoke, embers, glowing cracks
 *           the_wyrmbog          the bog before the lair: black crags, a dragon's ribcage, eggs, the lair hill far off
 *           onyxias_lair_gate    the cave mouth in a hill of black rock, red glow within, bones and scorched ground
 *           lair_tunnel          the entry tunnel: rings of black rock receding to a red glow, cracked glowing floor
 *           lair_cavern          the great cavern: a lava lake behind her nest of scorched stone, bones and eggs
 *   mobs    brood_whelp, brood_drakonid, brood_dragonspawn, scorchmaw (the marsh rare), onyxian_warder,
 *           onyxian_whelp, onyxia
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the keys
 * above and fall through to the previous functions for every other key (prototype keys included). Keys are appended
 * to ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the robe rig are shared copies of art_tidecrown.js; the dragonkin pieces (wing, drake head,
 * talon) are copies of art_steppes.js, the whelp of art_redridge.js and the dragonspawn body of art_winterspring.js.
 * The black brood matches the story Veshmira of art_story.js: near-black scales, a bronze belly, deep red wings, pale
 * horns and amber eyes. Kept apart from their cousins: the Stoneharrow whelp is smaller and plainer, the Cinderfields
 * dragonspawn stands on two legs (ours has the dragon body below), the Icewold scalebane is blue. The Veshmiran
 * whelp and warder are the raid's darker, fiercer versions (red eyes, fire, iron plate). Veshmira is the biggest sprite.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients + flat shadow shapes,
 * no text, no filters, ids unique per call (prefix dw<counter>_).
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
  function Ctx() { this.p = 'dw' + (SEQ++).toString(36) + '_'; this.k = 0; this.defs = []; this.cache = {}; }
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
  //  DUSTWALLOW: palette
  // ============================================================
  // the black brood matches the story Veshmira (art_story.js): near-black scales, bronze belly, deep red wings, pale horns, amber eyes
  var BLK = '#2a2430', BLK2 = '#3c3444', BEL = '#b0703a', MEM = '#6a2430', HORN = '#d8ccb0', AMBER = '#ffb020';
  var LAVA = '#ff6a1a', LAVAH = '#ffb42e', LAVAW = '#fff2a8';
  var IRON = '#34323a', IRONL = '#6a6a74', RUST = '#9a3a1e';
  var MUD = '#3e3826', MUDL = '#5e5638', BOGW = '#2c3a30', MOSS = '#6a8038', MOSSD = '#3e5024', REED = '#9a9450', TREE = '#3e3226';
  var STONE = '#bab2a2', BLUE = '#2c4c9e', BLUEL = '#4a6ccc', GOLD = '#d8b04a', ROOF = '#2a3e7e', SEAB = '#2a5a7a';
  var HIDE = '#b08450', HIDED = '#74502e', HRED = '#9a2a1e', WOOD = '#6a4a2c';
  var BR = '#2c282c', BRL = '#4c464a', BRD = '#151214';

  // ============================================================
  //  SCENE PIECES
  // ============================================================
  // clouds and waves (shared copies of art_tidecrown.js)
  function clouds(seed, y0, y1, col, op, cnt) { var r = rng(seed), o = ''; for (var i = 0; i < (cnt || 8); i++) { var x = r() * 440 - 20, y = y0 + r() * (y1 - y0), w = 40 + r() * 70; o += E(x, y, w, w * 0.2, col, 0, op * (0.6 + r() * 0.4)); } return o; }
  function waves(c, y, amp, step, col, op, seed) {
    var r = rng(seed), d = 'M-4,' + n(y), wc = '';
    for (var x = -4; x < 404; x += step) { d += 'q' + n(step / 2) + ',' + n(-amp * (0.6 + r() * 0.8)) + ' ' + n(step) + ',0'; if (r() < 0.35) wc += 'M' + pt([x + step * 0.25, y - amp * 0.5]) + 'q' + n(step * 0.25) + ',' + n(-amp * 0.6) + ' ' + n(step * 0.5) + ',0'; }
    return L(d, col, 1.2, op) + L(wc, '#eef8ff', 1.2, Math.min(1, op + 0.2));
  }
  // gnarled swamp tree with hanging moss
  function twisted(c, x, y, h, lean, seed, col, moss) {
    var r = rng(seed); col = col || TREE;
    var pts = [[x, y], [x + lean * 0.2 + (r() - 0.5) * 6, y - h * 0.35], [x + lean * 0.6 + (r() - 0.5) * 8, y - h * 0.7], [x + lean, y - h]];
    var T = taper(pts, h * 0.17, h * 0.05, 6), o = '';
    o += P(pd([[x - h * 0.16, y + 1], [x - h * 0.03, y - h * 0.12], [x + h * 0.02, y + 1]], true), c.cel(col), 1.4) + P(pd([[x, y + 1], [x + h * 0.07, y - h * 0.1], [x + h * 0.2, y + 1]], true), c.cel(col), 1.4);
    o += body(c, T.d, col, F(ribbonBand(T, 0.62, 1), dk(col, 0.4), 0.85) + L(along(T, 0.3), lt(col, 0.18), 1, 0.7), 1.8);
    var top = pts[3], mid = pts[2];
    [[-1, 0.8], [1, 0.9], [-0.3, 1.3], [0.6, 0.4]].forEach(function (b, i) {
      var s0 = i === 2 ? top : lerp2(mid, top, 0.2 + i * 0.25), e = [s0[0] + b[0] * h * 0.38, s0[1] - h * 0.14 * b[1] - r() * h * 0.08];
      var B = taper([s0, [(s0[0] + e[0]) / 2, Math.min(s0[1], e[1]) - h * 0.08], e], h * 0.07, h * 0.012, 5);
      o += body(c, B.d, col, '', 1.3);
      if (moss !== false) for (var k = 0; k < 3; k++) { var t = 0.35 + k * 0.25, p = B.s[Math.min(B.s.length - 1, Math.round(t * (B.s.length - 1)))], len = 6 + r() * h * 0.2; o += P(pd([[p[0] - 2.2, p[1]], [p[0] + 2.2, p[1]], [p[0] + (r() - 0.5) * 3, p[1] + len]], true), c.cel(moss || MOSS), 0.9); }
    });
    return o;
  }
  // a dead, burnt tree: black, no moss, glowing cracks
  function charred(c, x, y, h, lean, seed) {
    var o = twisted(c, x, y, h, lean, seed, '#221c1c', false), r = rng(seed + 7), d = '';
    for (var i = 0; i < 3; i++) { var yy = y - h * (0.15 + r() * 0.5), xx = x + lean * (y - yy) / h; d += 'M' + pt([xx - 1.5, yy]) + 'l' + n(1 + r() * 2) + ',' + n(-3 - r() * 4) + 'l' + n(-1) + ',' + n(-3); }
    return o + L(d, LAVA, 1.4, 0.9) + L(d, LAVAH, 0.6, 0.9);
  }
  function reeds(c, x, y, cnt, h, seed, col) {
    var r = rng(seed), d = '', heads = '';
    for (var i = 0; i < cnt; i++) {
      var xx = x + (r() - 0.5) * cnt * 3.2, hh = h * (0.6 + r() * 0.5), lean = (r() - 0.5) * 10, tip = [xx + lean, y - hh];
      d += 'M' + pt([xx, y]) + 'Q' + pt([xx + lean * 0.2, y - hh * 0.6]) + ' ' + pt(tip);
      if (r() < 0.45) heads += E(tip[0] - lean * 0.08, tip[1] + 4, 1.6, 4, c.cel('#6a4a2a'), 1);
    }
    return L(d, OL, 3) + L(d, col || REED, 1.4) + heads;
  }
  function bog(c, y0, y1, col, seed) {
    var r = rng(seed), o = R(-2, y0, 404, y1 - y0, c.lg([[0, lt(col, 0.12)], [0.5, col], [1, dk(col, 0.25)]])), d = '';
    for (var i = 0; i < 9; i++) { var x = r() * 400, y = y0 + 3 + r() * (y1 - y0 - 6), w = 10 + r() * 30; d += 'M' + pt([x - w, y]) + 'L' + pt([x + w, y]); }
    o += L(d, lt(col, 0.3), 1, 0.6);
    for (var j = 0; j < 5; j++) { var lx = r() * 400, ly = y0 + 4 + r() * (y1 - y0 - 8); o += E(lx, ly, 5 + r() * 3, 1.8, c.cel('#4e6a2c'), 1); }
    return o;
  }
  function pool(c, x, y, rx, ry, col) { col = col || BOGW; return E(x, y, rx + 2, ry + 1.4, dk(MUD, 0.3)) + E(x, y, rx, ry, c.lg([[0, lt(col, 0.25)], [1, dk(col, 0.2)]]), 1.4) + L('M' + pt([x - rx * 0.5, y - ry * 0.2]) + 'L' + pt([x + rx * 0.2, y - ry * 0.2]), lt(col, 0.45), 1, 0.7); }
  // jagged crag of rock (x, y = bottom centre)
  function crag(c, x, y, w, h, seed, col) {
    var r = rng(seed), pts = [[x - w / 2, y]], k = 7;
    col = col || BR;
    for (var i = 0; i <= k; i++) { var t = i / k, env = Math.pow(Math.sin(t * PI), 0.8); pts.push([x - w / 2 + w * t + (i > 0 && i < k ? (r() - 0.5) * w * 0.06 : 0), y - h * env * (0.72 + r() * 0.28) - (i % 2 ? r() * h * 0.1 : 0)]); }
    pts.push([x + w / 2, y]);
    var d = pd(pts, true), hi = '';
    for (var j = 2; j < pts.length - 3; j += 2) hi += 'M' + pt(pts[j]) + 'L' + pt([pts[j][0] + (r() - 0.3) * w * 0.08, pts[j][1] + h * 0.25]);
    return body(c, d, col, F(pd([[x + w * 0.06, y - h - 4], [x + w / 2 + 4, y - h - 4], [x + w / 2 + 4, y + 2], [x + w * 0.18, y + 2]], true), dk(col, 0.38), 0.85) + L(hi, lt(col, 0.22), 1.1, 0.8), 1.8);
  }
  function smoke(c, x, y, h, seed, col, op) {
    var r = rng(seed), o = '';
    for (var i = 0; i < 6; i++) { var t = i / 5; o += E(x + Math.sin(t * 3 + r()) * 8 + t * 14, y - t * h, 8 + t * 16, 6 + t * 10, col || '#3a3436', 0, (op || 0.55) * (1 - t * 0.6)); }
    return o;
  }
  function embers(seed, cnt, x0, x1, y0, y1) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.7 + r() * 1.1, r() < 0.5 ? LAVAH : LAVA, 0, 0.6 + r() * 0.4); return o; }
  function scorch(c, x, y, rx, ry, hot) { return E(x, y, rx, ry, c.rg([[0, '#0e0a0a', 0.9], [0.7, '#1a1412', 0.6], [1, '#1a1412', 0]])) + (hot ? E(x, y, rx * 0.35, ry * 0.3, glow(c, LAVA, 0.6)) : ''); }
  function bone(c, x, y, len, rot, col) {
    col = col || '#d8ccb0';
    var q = dirQ([x, y], rot * PI / 180), d = 'M' + pt(q(0, 0)) + 'L' + pt(q(len, 0));
    return limb(d, col, 2.6) + C(q(0, -1.4)[0], q(0, -1.4)[1], 1.8, c.cel(col), 1) + C(q(0, 1.4)[0], q(0, 1.4)[1], 1.8, c.cel(col), 1) + C(q(len, -1.4)[0], q(len, -1.4)[1], 1.8, c.cel(col), 1) + C(q(len, 1.4)[0], q(len, 1.4)[1], 1.8, c.cel(col), 1);
  }
  function skull(c, x, y, s, col) {
    col = col || '#d8ccb0';
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    var d = 'M' + pt(q(14, 0)) + 'C' + pt(q(16, -10)) + ' ' + pt(q(6, -16)) + ' ' + pt(q(-4, -12)) + 'L' + pt(q(-26, -6)) + 'C' + pt(q(-30, -4)) + ' ' + pt(q(-30, 0)) + ' ' + pt(q(-26, 0)) + 'Z';
    var jaw = pd([q(-24, 0), q(8, 0), q(10, 4), q(-22, 3)], true);
    return E(x - 6 * s, y + 1, 22 * s, 3 * s, '#000', 0, 0.35) + P(jaw, c.cel(dk(col, 0.1)), 1.3) + body(c, d, col, F(pd([q(-4, -16), q(18, -16), q(18, 2), q(0, 2)], true), dk(col, 0.25), 0.8), 1.5) +
      E(q(-2, -6)[0], q(-2, -6)[1], 4 * s, 3 * s, '#1a1009') + E(q(-20, -3)[0], q(-20, -3)[1], 1.4 * s, 1 * s, '#1a1009') + P(pd([q(4, -10), q(22, -20), q(10, -6)], true), c.cel(col), 1.2) + L('M' + pt(q(-24, 0)) + 'L' + pt(q(-4, 0)), OL, 1, 0.8) + P(pd([q(-22, 0), q(-21, 3), q(-20, 0)], true) + pd([q(-16, 0), q(-15, 3), q(-14, 0)], true), '#f4ecd6', 0.6);
  }
  function ribcage(c, x, y, s, col) {
    col = col || '#d0c4a8';
    var o = limb('M' + pt([x - 40 * s, y - 30 * s]) + 'Q' + pt([x, y - 44 * s]) + ' ' + pt([x + 40 * s, y - 26 * s]), col, 4 * s);
    for (var i = 0; i < 6; i++) { var t = i / 5, bx = x - 36 * s + t * 72 * s, by = y - 30 * s - Math.sin(t * PI) * 12 * s; o += limb('M' + pt([bx, by]) + 'Q' + pt([bx - 14 * s, by + 12 * s]) + ' ' + pt([bx - 6 * s + t * 4 * s, y]), col, (3 - t) * s + 0.8); }
    return o;
  }
  function egg(c, x, y, s, hot) {
    var d = 'M' + pt([x, y - 13 * s]) + 'C' + pt([x + 8 * s, y - 13 * s]) + ' ' + pt([x + 9 * s, y]) + ' ' + pt([x, y]) + 'C' + pt([x - 9 * s, y]) + ' ' + pt([x - 8 * s, y - 13 * s]) + ' ' + pt([x, y - 13 * s]) + 'Z';
    return (hot ? C(x, y - 6 * s, 12 * s, glow(c, LAVA, 0.45)) : '') + body(c, d, '#3a2c34', F(pd([[x + 1 * s, y - 14 * s], [x + 10 * s, y - 14 * s], [x + 10 * s, y + 1], [x + 3 * s, y + 1]], true), '#1a1216', 0.7) + L('M' + pt([x - 4 * s, y - 9 * s]) + 'l2,2 l-1,3 M' + pt([x + 2 * s, y - 11 * s]) + 'l2,3', LAVA, 1, 0.9), 1.3) + E(x - 3 * s, y - 9 * s, 1.6 * s, 2.4 * s, '#6a5a64', 0, 0.8);
  }
  function lavaCrack(c, pts, w) { var d = pd(pts); return L(d, OL, w + 3) + L(d, LAVA, w) + L(d, LAVAW, w * 0.35, 0.9); }
  function stalactites(c, y, cnt, maxH, seed, col) {
    var r = rng(seed), d = '';
    for (var i = 0; i < cnt; i++) { var x = r() * 400, w = 4 + r() * 8, h = maxH * (0.3 + r() * 0.7); d += pd([[x - w, y - 2], [x + (r() - 0.5) * 3, y + h], [x + w, y - 2]], true); }
    return P(d, c.cel(col || BRL), 1.4);
  }
  function whelpSil(x, y, s, col) {
    var q = function (u, v) { return pt([x + u * s, y + v * s]); };
    return F('M' + q(-10, 0) + 'L' + q(-4, -1) + 'L' + q(-2, -8) + 'L' + q(2, -2) + 'L' + q(8, -9) + 'L' + q(7, -1) + 'L' + q(12, 1) + 'L' + q(4, 2) + 'L' + q(-4, 2) + 'Z', col || '#1a1418', 0.9);
  }
  // ---- Harborwatch pieces ----
  function stoneWall(c, x0, y0, x1, y1, col, seed, bh, bw) {
    var r = rng(seed), o = R(x0, y0, x1 - x0, y1 - y0, c.lg([[0, lt(col, 0.1)], [0.6, col], [1, dk(col, 0.25)]]), 1.6), d = '', row = 0;
    bh = bh || 10; bw = bw || 22;
    for (var y = y0 + bh; y < y1; y += bh) { d += 'M' + n(x0) + ',' + n(y) + 'L' + n(x1) + ',' + n(y); }
    for (var yy = y0; yy < y1; yy += bh) { for (var x = x0 + (row % 2 ? bw / 2 : 0) + r() * 4; x < x1; x += bw) d += 'M' + n(x) + ',' + n(yy) + 'L' + n(x) + ',' + n(Math.min(y1, yy + bh)); row++; }
    return o + L(d, dk(col, 0.35), 1, 0.8);
  }
  function crenels(c, x0, x1, y, col, w) { var d = ''; w = w || 10; for (var x = x0; x < x1 - 2; x += w * 2) d += pd([[x, y], [x, y - w * 0.8], [x + w, y - w * 0.8], [x + w, y]], true); return P(d, c.cel(col), 1.4); }
  function banner(c, x, y, w, h, col, emb) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - w * 0.4], [x, y + h]], true);
    return R(x - 2, y - 2, w + 4, 3, c.cel(WOOD), 1) + body(c, d, col, F(pd([[x + w * 0.6, y], [x + w, y], [x + w, y + h], [x + w * 0.6, y + h - w * 0.3]], true), dk(col, 0.3), 0.8) + L('M' + pt([x + 1.5, y + 3]) + 'L' + pt([x + 1.5, y + h - 2]) + 'M' + pt([x + w - 1.5, y + 3]) + 'L' + pt([x + w - 1.5, y + h - 2]), emb || GOLD, 1, 0.9), 1.4) +
      (emb !== false ? P(pd([[x + w / 2, y + h * 0.25], [x + w * 0.78, y + h * 0.45], [x + w / 2, y + h * 0.65], [x + w * 0.22, y + h * 0.45]], true), c.cel(emb || GOLD), 1) : '');
  }
  function tower(c, x, y, w, h, seed) {
    var o = stoneWall(c, x - w / 2, y - h, x + w / 2, y, STONE, seed, 9, 14) + F(pd([[x + w * 0.1, y - h], [x + w / 2, y - h], [x + w / 2, y], [x + w * 0.2, y]], true), '#000', 0.2);
    o += R(x - w / 2 - 3, y - h - 4, w + 6, 6, c.cel(lt(STONE, 0.1)), 1.4);
    var roof = pd([[x - w / 2 - 5, y - h - 3], [x, y - h - w * 1.05], [x + w / 2 + 5, y - h - 3]], true);
    o += body(c, roof, ROOF, F(pd([[x, y - h - w * 1.05], [x + w / 2 + 6, y - h - 2], [x + 2, y - h - 2]], true), dk(ROOF, 0.35), 0.85) + L('M' + pt([x - w * 0.3, y - h - 4]) + 'L' + pt([x - 2, y - h - w * 0.95]), lt(ROOF, 0.3), 1, 0.7), 1.6);
    o += L('M' + pt([x, y - h - w * 1.05]) + 'L' + pt([x, y - h - w * 1.05 - 12]), OL, 1.4) + P(pd([[x, y - h - w * 1.05 - 12], [x + 10, y - h - w * 1.05 - 9], [x, y - h - w * 1.05 - 6]], true), c.cel(BLUEL), 1) + C(x, y - h - w * 1.05, 1.6, c.cel(GOLD), 0.8);
    o += P(elfArch(x - 3, y - h * 0.62, 6, 10), '#1a1c2a', 1.1);
    return o;
  }
  function elfArch(x, y, w, h) { return 'M' + pt([x, y + h]) + 'L' + pt([x, y + w / 2]) + 'Q' + pt([x + w / 2, y - w / 3]) + ' ' + pt([x + w, y + w / 2]) + 'L' + pt([x + w, y + h]) + 'Z'; }
  function ship(c, x, y, s) {
    var q = function (u, v) { return [x + u * s, y + v * s]; };
    var hull = 'M' + pt(q(-40, -8)) + 'L' + pt(q(38, -10)) + 'C' + pt(q(34, 0)) + ' ' + pt(q(26, 4)) + ' ' + pt(q(16, 4)) + 'L' + pt(q(-30, 4)) + 'C' + pt(q(-36, 2)) + ' ' + pt(q(-40, -3)) + ' ' + pt(q(-40, -8)) + 'Z';
    var o = body(c, hull, WOOD, L('M' + pt(q(-38, -4)) + 'L' + pt(q(34, -5)), dk(WOOD, 0.4), 1), 1.4);
    o += L('M' + pt(q(-10, -8)) + 'L' + pt(q(-10, -58)) + 'M' + pt(q(14, -9)) + 'L' + pt(q(14, -48)), OL, 1.8);
    o += P(pd([q(-26, -52), q(4, -54), q(2, -16), q(-24, -18)], true), c.cel('#e8e2d0'), 1.2) + P(pd([q(4, -44), q(26, -44), q(24, -16), q(4, -16)], true), c.cel('#dcd4c0'), 1.1);
    o += P(pd([q(-10, -58), q(4, -55), q(-10, -52)], true), c.cel(BLUEL), 0.9) + L('M' + pt(q(-10, -58)) + 'L' + pt(q(-40, -10)) + 'M' + pt(q(14, -48)) + 'L' + pt(q(38, -11)), OL, 0.8, 0.8);
    return o;
  }
  // ---- Krugar pieces ----
  function hut(c, x, y, s, seed, flag) {
    var q = function (u, v) { return [x + u * s, y + v * s]; }, r = rng(seed);
    var o = E(x, y + 1, 28 * s, 3 * s, '#000', 0, 0.35);
    var wall = 'M' + pt(q(-26, 0)) + 'L' + pt(q(-24, -18)) + 'Q' + pt(q(0, -24)) + ' ' + pt(q(24, -18)) + 'L' + pt(q(26, 0)) + 'Z';
    o += body(c, wall, HIDE, F(pd([q(6, -24), q(28, -24), q(28, 2), q(10, 2)], true), dk(HIDE, 0.3), 0.8) + L('M' + pt(q(-14, -20)) + 'L' + pt(q(-15, 0)) + 'M' + pt(q(12, -21)) + 'L' + pt(q(13, 0)) + 'M' + pt(q(-24, -9)) + 'L' + pt(q(24, -9)), HIDED, 1.2, 0.8), 1.6);
    o += P(elfArch(x - 6 * s, y - 14 * s, 12 * s, 14 * s), '#1a1009', 1.2);
    var roof = pd([q(-32, -15), q(-2, -46), q(2, -46), q(32, -15), q(20, -18), q(0, -20), q(-20, -18)], true);
    o += body(c, roof, '#8a6a3a', F(pd([q(0, -46), q(34, -16), q(4, -18)], true), dk('#8a6a3a', 0.35), 0.85) + L('M' + pt(q(-22, -20)) + 'L' + pt(q(-2, -42)) + 'M' + pt(q(-10, -19)) + 'L' + pt(q(0, -40)) + 'M' + pt(q(12, -19)) + 'L' + pt(q(2, -40)), '#5a4222', 1, 0.8), 1.6);
    o += L('M' + pt(q(-3, -44)) + 'L' + pt(q(-8, -56)) + 'M' + pt(q(1, -44)) + 'L' + pt(q(4, -58)) + 'M' + pt(q(-1, -44)) + 'L' + pt(q(-1, -54)), OL, 3) + L('M' + pt(q(-3, -44)) + 'L' + pt(q(-8, -56)) + 'M' + pt(q(1, -44)) + 'L' + pt(q(4, -58)) + 'M' + pt(q(-1, -44)) + 'L' + pt(q(-1, -54)), WOOD, 1.6);
    o += P(pd([q(-9, -1), q(-14, -12), q(-11, -1)], true) + pd([q(9, -1), q(14, -12), q(11, -1)], true), c.cel('#f0e6d0'), 1);
    if (flag) o += L('M' + pt(q(18, -18)) + 'L' + pt(q(18, -60)), OL, 3) + L('M' + pt(q(18, -18)) + 'L' + pt(q(18, -60)), WOOD, 1.6) + P(pd([q(18, -60), q(34, -56), q(28, -50), q(34, -44), q(18, -46)], true), c.cel(HRED), 1.2) + P(pd([q(22, -55), q(26, -52), q(22, -49)], true), '#1a1009', 0.6);
    return o;
  }
  function palisade(c, x0, x1, y, h, seed) {
    var r = rng(seed), o = '', lash = '';
    for (var x = x0; x < x1; x += 9) {
      var hh = h * (0.85 + r() * 0.25), d = pd([[x, y], [x, y - hh + 6], [x + 4.5, y - hh], [x + 9, y - hh + 6], [x + 9, y]], true);
      o += body(c, d, WOOD, F(pd([[x + 5, y - hh], [x + 10, y - hh], [x + 10, y], [x + 6, y]], true), dk(WOOD, 0.35), 0.8), 1.4);
    }
    lash = 'M' + n(x0) + ',' + n(y - h * 0.3) + 'L' + n(x1) + ',' + n(y - h * 0.3) + 'M' + n(x0) + ',' + n(y - h * 0.62) + 'L' + n(x1) + ',' + n(y - h * 0.62);
    return o + L(lash, OL, 3) + L(lash, '#8a7040', 1.4);
  }
  function brazier(c, x, y, s) {
    return L('M' + pt([x - 5 * s, y]) + 'L' + pt([x, y - 12 * s]) + 'L' + pt([x + 5 * s, y]), OL, 2.6) + L('M' + pt([x - 5 * s, y]) + 'L' + pt([x, y - 12 * s]) + 'L' + pt([x + 5 * s, y]), WOOD, 1.2) +
      E(x, y - 12 * s, 7 * s, 2.6 * s, c.cel(IRON), 1.2) + C(x, y - 18 * s, 18 * s, glow(c, LAVA, 0.5)) + flame(c, x, y - 12 * s, 0.7 * s);
  }
  // ---- the lair ----
  function caveMouth(c, x, y, w, h, deep) {
    var d = 'M' + pt([x - w / 2, y]) + 'C' + pt([x - w * 0.52, y - h * 0.6]) + ' ' + pt([x - w * 0.3, y - h]) + ' ' + pt([x, y - h]) + 'C' + pt([x + w * 0.3, y - h]) + ' ' + pt([x + w * 0.52, y - h * 0.6]) + ' ' + pt([x + w / 2, y]) + 'Z';
    var o = P(d, c.lg([[0, '#0a0608'], [0.6, '#1a0e0c'], [1, deep ? '#5a1e0e' : '#2a1410']]), 2.2) + E(x, y - h * 0.15, w * 0.34, h * 0.3, glow(c, LAVA, deep ? 0.55 : 0.3));
    var teeth = '', k = 7;
    for (var i = 1; i < k; i++) { var t = i / k, px = x - w / 2 + w * t, py = y - h * Math.pow(Math.sin(t * PI), 0.7) + 1; teeth += pd([[px - 5, py - 2], [px + (t - 0.5) * 4, py + 8 + (i % 2) * 6], [px + 5, py - 2]], true); }
    return o + P(teeth, c.cel(BRL), 1.3);
  }
  function tunnelRing(c, x, y, w, h, col, seed) {
    var r = rng(seed), outer = [], inner = [], k = 14;
    for (var i = 0; i <= k; i++) { var a = PI + PI * i / k, j = 1 + (r() - 0.5) * 0.12; outer.push([x + Math.cos(a) * w * 0.62 * j, y + Math.sin(a) * h * 1.1 * j]); inner.push([x + Math.cos(a) * w * 0.5, y + Math.sin(a) * h]); }
    outer.push([x + w * 0.62, y + 40]); outer.unshift([x - w * 0.62, y + 40]);
    inner.push([x + w * 0.5, y + 40]); inner.unshift([x - w * 0.5, y + 40]);
    var d = pd(outer.concat(inner.slice().reverse()), true);
    return body(c, d, col, F(pd([[x + w * 0.2, y - h * 1.3], [x + w, y - h * 1.3], [x + w, y + 42], [x + w * 0.4, y + 42]], true), dk(col, 0.35), 0.8), 1.8);
  }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    theramore_isle: function (c) {
      var o = sky(c, '#5a7a9a', '#9ab4c4', '#d8e0d8');
      o += clouds(4101, 6, 50, '#eef2f4', 0.55, 8) + clouds(4102, 20, 60, '#7890a4', 0.35, 5);
      // the sea to the right and the far marsh shore on the left
      o += R(-2, 96, 404, 30, c.lg([[0, '#5a8aa4'], [1, SEAB]])) + waves(c, 104, 1.6, 16, '#bfe0ea', 0.7, 4103) + waves(c, 114, 2, 20, '#8ab8cc', 0.6, 4104);
      o += F('M-2,100 C20,92 50,90 80,96 L80,104 L-2,104 Z', '#4a5a3a', 0.9) + ship(c, 340, 104, 0.62) + ship(c, 382, 100, 0.4);
      // the keep: towers, curtain wall with blue banners
      o += tower(c, 60, 118, 30, 62, 4105) + tower(c, 250, 116, 26, 54, 4106);
      o += stoneWall(c, 72, 70, 240, 122, STONE, 4107, 10, 22) + crenels(c, 72, 240, 70, lt(STONE, 0.08), 8) + F('M72,110 L240,110 L240,122 L72,122 Z', '#2a3a2a', 0.25);
      o += tower(c, 156, 110, 40, 72, 4108);
      o += P(elfArch(140, 92, 32, 30), c.lg([[0, '#1a1c2a'], [1, '#2a2c3a']]), 1.6) + L('M144,122 L144,100 M150,122 L150,96 M156,122 L156,94 M162,122 L162,96 M168,122 L168,100', '#4a4a52', 1.2);
      o += banner(c, 100, 76, 14, 30, BLUE) + banner(c, 204, 76, 14, 30, BLUE) + banner(c, 124, 76, 10, 22, BLUEL, false) + banner(c, 184, 76, 10, 22, BLUEL, false);
      // the harbour: a pier out into the water, crates, a lamp post
      o += R(260, 118, 140, 6, c.cel(WOOD), 1.4) + L('M270,124 l0,10 M300,124 l0,10 M330,124 l0,10 M360,124 l0,10 M390,124 l0,10', OL, 3) + L('M270,124 l0,10 M300,124 l0,10 M330,124 l0,10 M360,124 l0,10 M390,124 l0,10', WOOD, 1.6);
      o += R(-2, 124, 404, 16, c.lg([[0, SEAB], [1, '#1e4a64']])) + waves(c, 130, 1.4, 18, '#9ac8d8', 0.6, 4109);
      // the quay in the foreground, flagstones
      o += R(-2, 136, 404, 106, c.lg([[0, '#8a8272'], [1, '#6a6254']])) + L('M-2,136 L402,136', OL, 1.6) + R(-2, 136, 404, 4, c.cel('#a8a090'), 1.2);
      var fl = ''; for (var y = 150; y < 240; y += 16) fl += 'M-2,' + y + 'L402,' + (y + 1); for (var x = 10; x < 400; x += 38) fl += 'M' + x + ',140L' + (x - 6) + ',240';
      o += L(fl, '#5a5446', 1, 0.7);
      o += R(20, 146, 18, 14, c.cel('#8a6a40'), 1.4) + R(30, 138, 14, 10, c.cel('#9a7a4a'), 1.3) + L('M20,153 L38,153 M29,146 L29,160', '#5a4222', 1) + R(356, 150, 20, 16, c.cel('#8a6a40'), 1.4);
      o += L('M392,210 L392,150', OL, 3.4) + L('M392,210 L392,150', IRON, 1.8) + C(392, 146, 8, glow(c, '#ffe08a', 0.7)) + R(387, 140, 10, 10, c.cel('#ffe8a8'), 1.2);
      o += banner(c, 6, 150, 12, 28, BLUE) + L('M12,148 L12,212', OL, 2.4);
      return o + pebbles(4110, 170, 236, '#5a5446', 12, 10, 390) + vignette(c, '#f4f8ff', '#1a2030');
    },
    brackenwall_village: function (c) {
      var o = sky(c, '#3a4232', '#5e684a', '#8a8a62');
      o += clouds(4201, 0, 44, '#2a3024', 0.6, 8) + mist(c, 70, 40, '#9aa484', 0.45, 4202);
      // swamp trees behind the wall
      o += twisted(c, 30, 104, 78, 10, 4203, '#2e2820') + twisted(c, 370, 102, 84, -12, 4204, '#2e2820') + twisted(c, 210, 96, 60, 6, 4205, '#3a3026');
      o += palisade(c, -4, 404, 110, 44, 4206);
      o += R(-2, 108, 404, 134, c.lg([[0, '#4a4430'], [1, '#2e2a1e']])) + L('M-2,108 L402,108', OL, 1.6);
      // huts, the big one with the war banner
      o += hut(c, 90, 128, 1.1, 4207, true) + hut(c, 300, 126, 0.95, 4208) + hut(c, 200, 122, 0.7, 4209);
      o += brazier(c, 150, 136, 1) + brazier(c, 252, 134, 0.9);
      // the mud yard: puddles, a weapon rack, a totem
      o += pool(c, 60, 178, 34, 6) + pool(c, 320, 206, 46, 7) + pool(c, 190, 222, 28, 5);
      o += L('M352,148 L352,112', OL, 5) + L('M352,148 L352,112', '#7a5a34', 3) + P('M344,112 L360,112 L356,100 L348,100 Z', c.cel('#b08a5a'), 1.4) + C(352, 106, 2, '#1a1009') + P('M340,112 L346,104 L346,114 Z M364,112 L358,104 L358,114 Z', c.cel(HRED), 1);
      o += L('M22,170 L22,146 M40,170 L40,146 M18,150 L44,150', OL, 3.4) + L('M22,170 L22,146 M40,170 L40,146 M18,150 L44,150', WOOD, 1.8) + L('M28,150 L26,172 M34,150 L36,170', '#9aa0a8', 1.6);
      o += reeds(c, 380, 236, 8, 30, 4210) + reeds(c, 12, 236, 6, 26, 4211);
      return o + pebbles(4212, 150, 236, '#2a2618', 14, 10, 390) + embers(4213, 8, 130, 270, 90, 130) + vignette(c, '#f0f4dc', '#101408');
    },
    the_quagmire: function (c) {
      var o = sky(c, '#46503e', '#76805e', '#a8a880');
      o += clouds(4301, 0, 40, '#343a2c', 0.55, 8) + whelpSil(120, 30, 1.2) + whelpSil(300, 46, 0.9) + whelpSil(262, 24, 0.7);
      o += F('M-2,92 C40,84 80,86 120,90 C170,82 220,84 260,90 C310,84 360,86 402,90 L402,112 L-2,112 Z', '#4a5238', 0.9);
      o += twisted(c, 150, 100, 44, -6, 4302, '#3a3428') + twisted(c, 300, 98, 40, 8, 4303, '#3a3428') + mist(c, 96, 26, '#c8cca8', 0.55, 4304);
      o += bog(c, 104, 150, '#34443a', 4305);
      o += twisted(c, 40, 150, 104, 16, 4306) + twisted(c, 356, 146, 96, -18, 4307) + twisted(c, 238, 128, 58, 10, 4308);
      o += R(-2, 146, 404, 96, c.lg([[0, MUDL], [1, MUD]])) + L('M-2,146 C80,142 160,150 240,144 C300,140 360,148 402,144', OL, 1.4);
      o += pool(c, 120, 182, 44, 8) + pool(c, 300, 214, 52, 8) + pool(c, 40, 222, 26, 5);
      o += reeds(c, 90, 150, 10, 30, 4309) + reeds(c, 190, 152, 8, 24, 4310) + reeds(c, 380, 236, 9, 34, 4311) + reeds(c, 160, 236, 6, 22, 4312);
      o += egg(c, 222, 174, 0.8) + egg(c, 234, 176, 0.7) + bone(c, 260, 190, 18, -10);
      return o + mist(c, 150, 30, '#d0d4b4', 0.4, 4313) + pebbles(4314, 160, 236, '#2e2a1c', 12, 10, 390) + vignette(c, '#f4f8dc', '#101408');
    },
    scorched_fen: function (c) {
      var o = sky(c, '#2e2626', '#5e4a3e', '#9a6a46');
      o += clouds(4401, 0, 50, '#1e1818', 0.7, 9) + C(300, 80, 60, glow(c, '#ff8a3a', 0.25));
      o += smoke(c, 90, 96, 80, 4402) + smoke(c, 280, 100, 90, 4403, '#2e2828', 0.6);
      o += F('M-2,96 C60,88 120,92 180,96 C240,90 320,88 402,94 L402,114 L-2,114 Z', '#2a2420', 0.95);
      o += charred(c, 130, 104, 40, -6, 4404) + charred(c, 250, 102, 36, 6, 4405);
      o += bog(c, 108, 146, '#24241e', 4406) + embers(4407, 12, 0, 400, 110, 144);
      o += charred(c, 44, 150, 96, 14, 4408) + charred(c, 350, 148, 90, -16, 4409);
      o += R(-2, 144, 404, 98, c.lg([[0, '#3a3024'], [1, '#1e1a14']])) + L('M-2,144 C80,140 180,148 260,142 C320,138 360,146 402,142', OL, 1.4);
      o += scorch(c, 150, 180, 70, 14, true) + scorch(c, 310, 214, 60, 12, true) + scorch(c, 60, 214, 40, 8);
      o += lavaCrack(c, [[110, 180], [130, 176], [150, 182], [176, 178]], 1.6) + lavaCrack(c, [[280, 214], [300, 210], [330, 216]], 1.4);
      o += pool(c, 230, 170, 30, 5, '#2a2622') + reeds(c, 200, 150, 6, 18, 4410, '#4a3a2a') + reeds(c, 386, 236, 7, 26, 4411, '#4a3a2a');
      o += skull(c, 250, 232, 1.1) + bone(c, 90, 196, 16, 20) + bone(c, 340, 180, 14, -30);
      return o + embers(4412, 22, 0, 400, 40, 230) + vignette(c, '#ffe0c0', '#0a0604');
    },
    the_wyrmbog: function (c) {
      var o = sky(c, '#2e3028', '#545a46', '#8a8a6a');
      o += clouds(4501, 0, 46, '#1e201a', 0.6, 8);
      // the black hill of the lair far off
      o += crag(c, 290, 100, 180, 64, 4502, '#26222a') + C(290, 94, 10, glow(c, LAVA, 0.4)) + E(290, 97, 6, 4, '#0a0608');
      o += whelpSil(250, 30, 1) + whelpSil(330, 22, 1.3);
      o += mist(c, 96, 30, '#aab09a', 0.55, 4503);
      o += bog(c, 102, 148, '#2a3228', 4504);
      o += crag(c, 60, 130, 90, 50, 4505, BR) + twisted(c, 380, 150, 90, -16, 4506, '#2a241e');
      o += ribcage(c, 200, 140, 1.3);
      o += R(-2, 146, 404, 96, c.lg([[0, '#4a4430'], [1, '#2a2618']])) + L('M-2,146 C80,142 160,150 240,144 C300,140 360,148 402,144', OL, 1.4);
      o += scorch(c, 110, 188, 60, 12, true) + scorch(c, 290, 210, 50, 10);
      o += egg(c, 150, 176, 1) + egg(c, 164, 180, 0.8, true) + egg(c, 138, 182, 0.75);
      o += pool(c, 320, 180, 38, 6) + reeds(c, 30, 236, 7, 30, 4507) + reeds(c, 250, 170, 6, 18, 4508);
      o += skull(c, 70, 226, 1.3) + bone(c, 200, 214, 20, 8) + bone(c, 360, 226, 16, -20);
      return o + mist(c, 150, 26, '#b8bca4', 0.35, 4509) + embers(4510, 8, 80, 200, 150, 200) + vignette(c, '#f0f0d8', '#0a0a06');
    },
    onyxias_lair_gate: function (c) {
      var o = sky(c, '#262428', '#4a4440', '#7a6a52');
      o += clouds(4601, 0, 44, '#141214', 0.7, 9) + smoke(c, 250, 50, 50, 4602, '#1e1a1c', 0.5);
      // the hill of black rock with the cave in it
      o += crag(c, 200, 128, 380, 118, 4603, BR) + crag(c, 60, 128, 140, 70, 4604, '#221e22') + crag(c, 350, 128, 130, 76, 4605, '#221e22');
      o += L('M110,70 L128,86 L120,100 M290,64 L276,82 L284,98 M180,40 L190,56', dk(BR, 0.5), 1.4);
      o += caveMouth(c, 200, 128, 120, 86, true);
      o += lavaCrack(c, [[170, 120], [186, 116], [200, 122], [214, 116], [232, 121]], 1.8);
      o += C(200, 110, 60, glow(c, LAVA, 0.25));
      // ground: scorched, bones, the swamp creeping to its foot
      o += R(-2, 126, 404, 116, c.lg([[0, '#2e2822'], [1, '#1a1612']])) + L('M-2,126 L402,126', OL, 1.6);
      o += scorch(c, 200, 150, 110, 18, true) + scorch(c, 90, 200, 60, 12) + scorch(c, 320, 206, 70, 12);
      o += charred(c, 30, 170, 70, 10, 4606) + charred(c, 372, 168, 64, -10, 4607);
      o += skull(c, 120, 176, 1.6) + ribcage(c, 300, 180, 0.9) + bone(c, 180, 204, 18, 12) + bone(c, 240, 226, 16, -24) + bone(c, 60, 226, 14, 40);
      o += pool(c, 350, 226, 36, 5, '#232620') + reeds(c, 392, 236, 6, 24, 4608, '#4a4a30') + reeds(c, 6, 236, 5, 20, 4609, '#4a4a30');
      return o + mist(c, 138, 20, '#8a8a7a', 0.35, 4610) + embers(4611, 16, 120, 280, 60, 160) + vignette(c, '#ffe8c8', '#060404');
    },
    lair_tunnel: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#100c0e'], [1, '#1e1614']]));
      // the tunnel receding: rings of black rock, darker and smaller, a red glow at the far end
      o += C(200, 96, 70, glow(c, LAVA, 0.55)) + E(200, 100, 26, 22, c.rg([[0, '#ff9a3a'], [0.5, '#8a2a12'], [1, '#2a0e0a']]));
      o += tunnelRing(c, 200, 104, 90, 42, '#1e1a1e', 4701) + tunnelRing(c, 200, 110, 170, 72, '#262226', 4702) + tunnelRing(c, 200, 118, 280, 104, '#2e2a2e', 4703) + tunnelRing(c, 200, 126, 420, 140, BR, 4704);
      o += stalactites(c, 0, 16, 30, 4705, BRL);
      // floor: a black rock path glowing along its cracks
      o += P('M-2,242 L150,128 L250,128 L402,242 Z', c.lg([[0, '#2a2020'], [1, '#3a2e2a']]), 1.6) + F('M-2,242 L150,128 L160,128 L40,242 Z', '#000', 0.3) + F('M402,242 L250,128 L240,128 L360,242 Z', '#000', 0.3);
      o += lavaCrack(c, [[196, 132], [190, 150], [204, 170], [194, 196], [210, 222], [202, 242]], 2) + lavaCrack(c, [[204, 170], [236, 186], [262, 214]], 1.2) + lavaCrack(c, [[194, 196], [160, 210], [120, 236]], 1.2);
      o += bone(c, 140, 200, 20, 16) + bone(c, 270, 170, 14, -30) + skull(c, 300, 226, 1.2) + egg(c, 96, 220, 0.9) + egg(c, 84, 226, 0.7);
      o += crag(c, 20, 242, 70, 60, 4706, BRL) + crag(c, 386, 242, 80, 70, 4707, BRL);
      return o + embers(4708, 18, 100, 300, 60, 200) + R(0, 0, 400, 240, c.rg([[0, '#ff6a1a', 0], [0.6, '#000', 0.2], [1, '#000', 0.6]]));
    },
    lair_cavern: function (c) {
      var o = R(0, 0, 400, 240, c.lg([[0, '#0e0a0c'], [0.55, '#241614'], [1, '#3a1e14']]));
      // the great cavern: a dome of black rock, a lava lake behind the nest
      o += F('M-2,40 C80,6 320,6 402,40 L402,-2 L-2,-2 Z', '#070506');
      o += stalactites(c, 0, 22, 44, 4801, '#2a2428');
      o += crag(c, 40, 120, 120, 90, 4802, '#1e1a1e') + crag(c, 360, 120, 130, 96, 4803, '#1e1a1e') + crag(c, 200, 104, 240, 40, 4804, '#1a161a');
      o += R(-2, 100, 404, 26, c.lg([[0, '#ffb42e'], [0.4, '#ff6a1a'], [1, '#8a2a12']])) + L('M-2,100 L402,100', OL, 1.4) + C(200, 100, 160, glow(c, LAVA, 0.35));
      o += L('M20,108 q20,-3 40,0 M120,112 q30,-4 60,0 M260,108 q24,-3 48,0 M330,114 q20,-3 40,0', LAVAW, 1.2, 0.8);
      // pillars of black rock
      o += crag(c, 70, 150, 50, 110, 4805, BR) + crag(c, 334, 150, 56, 120, 4806, BR);
      // the floor and the nest: a ring of scorched stone and bones, eggs in it
      o += R(-2, 122, 404, 120, c.lg([[0, '#3a2822'], [1, '#1e1614']])) + L('M-2,122 L402,122', OL, 1.6);
      o += E(200, 150, 120, 20, '#140e0e', 0, 0.8) + E(200, 146, 110, 16, c.lg([[0, '#4a3a30'], [1, '#2a201c']]), 2);
      o += E(200, 144, 88, 10, c.rg([[0, '#8a2a12'], [0.6, '#3a1a12'], [1, '#2a1a14']]), 1.4);
      o += egg(c, 170, 146, 1.1, true) + egg(c, 190, 150, 1.3, true) + egg(c, 214, 147, 1.0, true) + egg(c, 232, 150, 0.9, true) + egg(c, 154, 150, 0.8);
      var rim = ''; for (var i = 0; i < 12; i++) { var a = PI * i / 11, x = 200 - Math.cos(a) * 112, y = 150 + Math.sin(a) * 6; rim += pd([[x - 7, y + 4], [x - 4, y - 5], [x + 4, y - 6], [x + 7, y + 4]], true); }
      o += P(rim, c.cel(BRL), 1.3) + bone(c, 120, 150, 18, -20) + bone(c, 270, 152, 20, 16) + bone(c, 300, 144, 14, -50);
      o += lavaCrack(c, [[40, 190], [80, 186], [110, 196], [150, 192]], 1.6) + lavaCrack(c, [[250, 210], [300, 204], [340, 214], [380, 206]], 1.8) + lavaCrack(c, [[300, 204], [310, 230]], 1.1);
      o += skull(c, 90, 226, 1.4) + ribcage(c, 330, 232, 0.8) + scorch(c, 200, 206, 90, 14);
      return o + embers(4807, 28, 0, 400, 20, 220) + R(0, 0, 400, 240, c.rg([[0, '#ff6a1a', 0], [0.65, '#000', 0.15], [1, '#000', 0.55]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // ---- dragonkin pieces (shared copies of art_steppes.js) ----
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
    var sc = o.col || BLK, s = '', hc = o.hornCol || HORN, k = o.k || 1, q = function (u, v) { return [x + u * k, y + v * k]; };
    if (o.horns === 'ram') {
      var H = taper([q(4, -8), q(18, -18), q(28, -8), q(24, 6), q(14, 6)], 10 * k, 3 * k, 5);
      s += body(c, H.d, hc, L(bands(H, 3), dk(hc, 0.4), 1), 1.8);
    } else {
      var H1 = taper([q(2, -8), q(14, -16), q(28, -20), q(38, -18)], 7 * k, 1.5 * k, 5), H2 = taper([q(6, -4), q(18, -8), q(30, -8)], 5 * k, 1.2 * k, 4);
      s += P(H2.d, c.cel(dk(hc, 0.1)), 1.4) + P(H1.d, c.cel(hc), 1.5);
    }
    s += P(pd([q(8, 2), q(20, 4), q(10, 8)], true) + pd([q(6, 8), q(16, 14), q(4, 12)], true), c.cel(o.mem || MEM), 1.2);
    var jaw = o.open ? 'M' + pt(q(4, 6)) + 'L' + pt(q(-12, 10)) + 'L' + pt(q(-24, 18)) + 'C' + pt(q(-26, 19)) + ' ' + pt(q(-25, 22)) + ' ' + pt(q(-22, 21)) + 'L' + pt(q(-4, 16)) + 'L' + pt(q(6, 12)) + 'Z' : 'M' + pt(q(4, 6)) + 'L' + pt(q(-24, 8)) + 'C' + pt(q(-26, 9)) + ' ' + pt(q(-25, 12)) + ' ' + pt(q(-22, 12)) + 'L' + pt(q(-2, 13)) + 'L' + pt(q(6, 11)) + 'Z';
    if (o.open) s += P('M' + pt(q(2, 4)) + 'L' + pt(q(-22, 5)) + 'L' + pt(q(-22, 19)) + 'L' + pt(q(-4, 14)) + 'Z', '#6a1a14', 1.2) + F(pd([q(-4, 6), q(-20, 7), q(-20, 16), q(-6, 12)], true), LAVA, 0.8);
    s += body(c, jaw, dk(sc, 0.05), F(pd([q(-26, 12), q(8, 12), q(8, 24), q(-26, 24)], true), o.belly || BEL, 0.8), 1.8);
    var d = 'M' + pt(q(10, -2)) + 'C' + pt(q(10, -12)) + ' ' + pt(q(0, -14)) + ' ' + pt(q(-6, -10)) + 'L' + pt(q(-22, -3)) + 'C' + pt(q(-28, -1)) + ' ' + pt(q(-30, 4)) + ' ' + pt(q(-26, 6)) + 'L' + pt(q(-4, 7)) + 'C' + pt(q(4, 8)) + ' ' + pt(q(10, 6)) + ' ' + pt(q(10, -2)) + 'Z';
    s += body(c, d, sc, F(pd([q(-30, 3), q(12, 2), q(12, 12), q(-30, 12)], true), dk(sc, 0.4), 0.7) + L('M' + pt(q(-20, -3)) + 'L' + pt(q(-6, -8)), lt(sc, 0.25), 1.2, 0.8), 2);
    var th = ''; for (var i = 0; i < 4; i++) th += pd([q(-24 + i * 5, 6), q(-23 + i * 5, 9.5), q(-21.5 + i * 5, 6)], true);
    if (o.open) for (var j = 0; j < 3; j++) th += pd([q(-21 + j * 5, 18 - j * 1.4), q(-20 + j * 5, 14.6 - j * 1.4), q(-18.5 + j * 5, 17.6 - j * 1.4)], true);
    s += P(th, '#f4ecd6', 0.7);
    s += P(pd([q(-10, -9), q(-6, -16), q(-3, -10)], true) + pd([q(-18, -5), q(-16, -10), q(-13, -6)], true), c.cel(hc), 1);
    s += C(q(-25, 0)[0], q(-25, 0)[1], 0.9 * k, OL) + L('M' + pt(q(-14, -6)) + 'L' + pt(q(-3, -7)), OL, 2.2 * k) + glowEye(c, q(-8, -4)[0], q(-8, -4)[1], 1.9 * k, o.eye || AMBER);
    return s;
  }
  function talon(x, y, col) {
    return P('M' + n(x + 6) + ',' + n(y - 6) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 8) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 6) + ',' + n(y - 5) + ' ' + n(x - 3) + ',' + n(y - 6) + ' Z', c_(col), 2) +
      L('M' + n(x - 8) + ',' + n(y + 1) + ' l-4,0.4 M' + n(x - 3) + ',' + n(y + 1) + ' l-3.4,0.6 M' + n(x + 2) + ',' + n(y + 1) + ' l-3,0.6', OL, 3) + L('M' + n(x - 8) + ',' + n(y + 1) + ' l-4,0.4 M' + n(x - 3) + ',' + n(y + 1) + ' l-3.4,0.6 M' + n(x + 2) + ',' + n(y + 1) + ' l-3,0.6', '#efe6cf', 1.3);
  }
  function scaleRows(x0, y0, x1, y1, col, sw) { var d = '', row = 0; sw = sw || 7; for (var y = y0; y < y1; y += 5) { for (var x = x0 + (row % 2 ? sw / 2 : 0); x < x1; x += sw) d += 'M' + pt([x - sw / 2, y]) + 'Q' + pt([x, y + 5]) + ' ' + pt([x + sw / 2, y]); row++; } return L(d, col, 0.9, 0.8); }
  // pole-arm from bot to top (adapted from art_winterspring.js)
  function polearm(c, bot, top, col, big) {
    var ang = Math.atan2(top[1] - bot[1], top[0] - bot[0]), len = Math.sqrt((top[0] - bot[0]) * (top[0] - bot[0]) + (top[1] - bot[1]) * (top[1] - bot[1])), q = dirQ(bot, ang), k = big ? 1.35 : 1;
    var o = limb('M' + pt(bot) + 'L' + pt(top), '#3a2a26', 3.4) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - 20, 0)), '#6a4a3a', 1, 0.6);
    o += P(pd([q(len - 22 * k, 1), q(len - 26 * k, 12 * k), q(len - 16 * k, 18 * k), q(len - 6, 14 * k), q(len - 4, 1)], true), c.cel(col), 1.6) + L('M' + pt(q(len - 24 * k, 11 * k)) + 'Q' + pt(q(len - 15 * k, 17 * k)) + ' ' + pt(q(len - 6, 13 * k)), '#ffffff', 1, 0.6);
    o += P(pd([q(len - 14, -1), q(len - 12, -8 * k), q(len - 8, -1)], true), c.cel(dk(col, 0.1)), 1.2) + P(pd([q(len - 4, -2), q(len + 10, 0), q(len - 4, 2)], true), c.cel(col), 1.3);
    return o + L('M' + pt(q(len - 20 * k, 4)) + 'L' + pt(q(len - 10, 6 * k)), LAVA, 1.4, 0.9) + R(q(len - 4, 0)[0] - 2.6, q(len - 4, 0)[1] - 2.6, 5.2, 5.2, c.cel(RUST), 1);
  }
  function breath(c, x, y, s) { return C(x, y, 16 * s, glow(c, LAVA, 0.8)) + P('M' + pt([x + 6 * s, y - 3 * s]) + 'C' + pt([x - 4 * s, y - 9 * s]) + ' ' + pt([x - 12 * s, y - 4 * s]) + ' ' + pt([x - 16 * s, y - 8 * s]) + 'C' + pt([x - 12 * s, y]) + ' ' + pt([x - 18 * s, y + 4 * s]) + ' ' + pt([x - 12 * s, y + 7 * s]) + 'C' + pt([x - 6 * s, y + 6 * s]) + ' ' + pt([x, y + 5 * s]) + ' ' + pt([x + 6 * s, y + 3 * s]) + 'Z', c.lg([[0, LAVAW], [0.5, LAVAH], [1, LAVA]], 1, 0, 0, 0), 1.2) + C(x - 4 * s, y, 3 * s, LAVAW, 0, 0.9); }

  // ---- whelp (facing left, wings up; adapted from art_redridge.js) ----
  function whelp(c, o) {
    var sc = o.col || BLK, sc2 = lt(sc, 0.14), bel = o.belly || '#c8702a', mem = o.mem || '#8a2e24', s = shadow(c, 66, 34);
    var fw = 'M70,58 C74,40 84,22 100,10 L104,26 L114,20 L112,36 L124,34 L114,50 L120,54 L100,60 C90,62 80,64 74,68 Z';
    s += body(c, fw, dk(sc, 0.05), F('M76,62 C86,48 96,34 104,24 L110,34 C100,44 92,52 86,60 Z', mem, 0.85) + F('M88,62 C98,52 108,44 114,38 L116,48 C108,54 100,58 94,62 Z', dk(mem, 0.15), 0.85) + L('M72,62 L102,14 M78,64 L112,24 M86,64 L122,36', OL, 1.4), 2.2);
    s += L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', OL, 10) + L('M92,90 C108,96 118,90 120,78 C122,70 116,66 112,72', sc, 5.6) + P('M110,72 L106,62 L116,68 Z', c.cel(mem), 1.3);
    s += limb('M84,92 L90,106 L86,116', dk(sc, 0.1), 8) + P('M78,116 L92,116 L94,122 L76,122 Z', c.cel(dk(sc, 0.1)), 1.6) + L('M78,122 l-3,-1 M84,122 l-2,-1', '#e8e0c8', 1.2);
    var bd = 'M40,78 C42,62 60,56 80,60 C96,64 100,80 94,92 C88,102 70,104 56,100 C44,96 38,88 40,78 Z';
    var scales = '';
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) scales += 'M' + pt([58 + i * 9 + (j % 2) * 4, 66 + j * 7]) + 'q3,3 6,0';
    s += body(c, bd, sc, L(scales, sc2, 1.1, 0.8) + F('M42,84 C50,100 72,104 90,94 C80,92 64,92 50,84 Z', bel) + L('M50,90 q4,3 8,2 M60,94 q5,2 10,1 M72,95 q5,1 10,-2', dk(bel, 0.35), 1) + F('M78,56 C94,62 102,78 96,96 L106,96 L106,56 Z', dk(sc, 0.4), 0.85) + (o.glow ? E(66, 92, 16, 6, glow(c, LAVA, 0.6)) : ''));
    s += body(c, 'M40,78 C34,70 32,60 34,52 L48,50 C48,58 50,66 56,72 Z', sc, F('M36,64 C38,72 42,78 46,80 L40,82 C36,76 34,70 34,64 Z', bel, 0.95), 2.2);
    var hx = 30, hy = 46;
    s += P('M' + pt([hx + 6, hy - 8]) + 'C' + pt([hx + 12, hy - 16]) + ' ' + pt([hx + 20, hy - 20]) + ' ' + pt([hx + 26, hy - 20]) + 'C' + pt([hx + 20, hy - 16]) + ' ' + pt([hx + 16, hy - 10]) + ' ' + pt([hx + 12, hy - 4]) + 'Z', c.cel(HORN), 1.5);
    s += P('M' + pt([hx + 2, hy - 9]) + 'C' + pt([hx + 6, hy - 18]) + ' ' + pt([hx + 12, hy - 24]) + ' ' + pt([hx + 18, hy - 26]) + 'C' + pt([hx + 12, hy - 20]) + ' ' + pt([hx + 10, hy - 14]) + ' ' + pt([hx + 8, hy - 7]) + 'Z', c.cel('#ece2c8'), 1.5);
    var hd = 'M' + pt([hx + 12, hy - 4]) + 'C' + pt([hx + 12, hy - 12]) + ' ' + pt([hx, hy - 14]) + ' ' + pt([hx - 6, hy - 10]) + 'L' + pt([hx - 20, hy - 5]) + 'C' + pt([hx - 24, hy - 3]) + ' ' + pt([hx - 24, hy + 4]) + ' ' + pt([hx - 20, hy + 5]) + 'L' + pt([hx - 4, hy + 8]) + 'C' + pt([hx + 4, hy + 10]) + ' ' + pt([hx + 12, hy + 6]) + ' ' + pt([hx + 12, hy - 4]) + 'Z';
    s += body(c, hd, sc, F('M' + pt([hx - 24, hy + 1]) + 'L' + pt([hx + 14, hy]) + 'L' + pt([hx + 14, hy + 12]) + 'L' + pt([hx - 24, hy + 12]) + 'Z', dk(sc, 0.3), 0.7) + L('M' + pt([hx - 18, hy - 5]) + 'L' + pt([hx - 4, hy - 9]), sc2, 1.2, 0.8), 2.2);
    s += L('M' + pt([hx - 22, hy + 2]) + 'L' + pt([hx - 6, hy + 4]), OL, 1.4) + P(pd([[hx - 18, hy + 2.5], [hx - 17, hy + 6], [hx - 15.5, hy + 2.8]], true), '#f4ecd6', 0.8) + P(pd([[hx - 11, hy + 3.2], [hx - 10, hy + 6.6], [hx - 8.5, hy + 3.5]], true), '#f4ecd6', 0.8);
    s += C(hx - 21, hy - 2, 0.9, OL) + glowEye(c, hx - 8, hy - 4, 2, o.eye || AMBER) + L('M' + pt([hx - 13, hy - 8]) + 'L' + pt([hx - 3, hy - 8]), OL, 2);
    s += P(pd([[hx - 2, hy - 12], [hx + 2, hy - 18], [hx + 4, hy - 11]], true), c.cel(sc2), 1) + P(pd([[hx + 6, hy - 11], [hx + 10, hy - 16], [hx + 11, hy - 8]], true), c.cel(sc2), 1);
    if (o.fire) s += breath(c, hx - 25, hy + 3, 0.55);
    s += limb('M52,92 L46,106 L50,116', sc, 8.4) + P('M38,116 L54,116 L56,122 L34,122 Z', c.cel(sc), 1.6) + L('M34,122 l-3,-1 M40,122 l-2,-1.5 M46,122 l-1,-1.5', '#e8e0c8', 1.2);
    s += limb('M70,96 L74,108 L70,116', sc, 8) + P('M62,116 L76,116 L78,122 L58,122 Z', c.cel(sc), 1.6) + L('M58,122 l-3,-1 M64,122 l-2,-1.5', '#e8e0c8', 1.2);
    var nw = 'M58,64 C50,46 44,26 50,8 L58,22 L64,10 L68,26 L78,16 L78,34 L88,30 L82,46 C76,54 68,60 64,70 Z';
    s += body(c, nw, sc, F('M58,60 C52,44 50,30 52,16 L58,26 C58,38 60,48 62,56 Z', mem, 0.9) + F('M64,56 C64,44 66,32 70,24 L76,32 C72,40 70,48 68,58 Z', lt(mem, 0.08), 0.9) + F('M70,58 C72,50 78,42 84,36 L84,44 C78,50 74,56 72,62 Z', dk(mem, 0.1), 0.9) + L('M60,66 L50,10 M64,64 L64,12 M66,64 L78,18 M70,64 L86,32', OL, 1.4), 2.2);
    s += P('M50,58 L54,50 L58,58 L62,52 L66,60 Z', c.cel(mem), 1.2);
    if (o.embers) s += embers(o.embers, 6, 20, 110, 10, 70);
    return G(s, at(o.scale || 1, 64, 122));
  }
  // ---- dragonspawn: dragon body below, armoured torso above (facing left; adapted from art_winterspring.js) ----
  function spawnRig(c, o) {
    var sc = o.sc || BLK, scl = lt(sc, 0.2), bel = o.bel || BEL, arm = o.arm || '#5a5260', trim = o.trim || RUST, eye = o.eye || AMBER, s = shadow(c, 70, 50);
    var tail = taper([[104, 88], [118, 94], [124, 108], [112, 118], [100, 118]], 13, 3, 6);
    s += body(c, tail.d, sc, F(ribbonBand(tail, 0.55, 1), dk(sc, 0.3), 0.7) + L(bands(tail, 3, 2), dk(sc, 0.4), 1), 1.8);
    if (o.wings) s += wing(c, [78, 50], [100, 18], [[122, 8], [126, 30], [120, 50], [104, 60]], dk(sc, 0.1), dk(MEM, 0.1));
    s += limb('M94,96 L100,108 L96,119', dk(sc, 0.2), 9) + L('M96,120 l-5,1 M96,120 l-3,2.6', OL, 2.4) + limb('M62,96 L56,108 L54,119', dk(sc, 0.2), 9) + L('M54,120 l-5,1 M54,120 l-3,2.6', OL, 2.4);
    var lb = 'M48,84 C50,74 62,72 76,74 C92,74 106,78 110,88 C112,98 104,104 92,104 C78,106 62,104 54,100 C48,96 46,90 48,84 Z';
    s += body(c, lb, sc, F('M50,96 C64,106 94,106 110,94 L112,108 L48,108 Z', bel, 0.9) + scaleRows(56, 76, 108, 94, lt(sc, 0.12), 7) + F('M86,66 L116,66 L116,106 L94,106 C106,92 102,78 86,66 Z', dk(sc, 0.3), 0.55), 2.4);
    [[66, 74, -1.9], [76, 74, -1.6], [86, 75, -1.35], [96, 78, -1.1]].forEach(function (k) { var q = dirQ([k[0], k[1] + 1], k[2]); s += P(pd([q(0, -3), q(9, 0), q(0, 3)], true), c.cel(HORN), 1); });
    if (o.saddle) s += P('M70,72 L96,74 L98,86 L72,84 Z', c.cel(arm), 1.6) + L('M72,78 L96,80', trim, 1.4);
    s += limb('M66,48 L76,64 L72,76', dk(sc, 0.15), 8.5) + clawHand([72, 78], dk(sc, 0.15), 1, '#e8e0cc');
    s += polearm(c, [30, 120], [13, 4], o.blade || '#a8acb4', !!o.plate);
    var td = 'M40,50 C44,40 66,40 72,48 L70,64 C68,74 66,80 64,86 L46,88 C44,78 40,68 40,50 Z';
    var chest = o.plate ? P('M42,50 C48,44 64,44 70,50 L68,70 L56,78 L44,70 Z', c.cel(arm), 1.8) + L('M56,48 L56,76', dk(arm, 0.4), 1.2) + L('M44,52 C50,48 58,48 64,50', lt(arm, 0.3), 1.1, 0.7) + P('M50,58 L62,58 L60,68 L56,71 L52,68 Z', c.cel(trim), 1.2) :
      F('M44,56 L62,56 L62,86 L48,86 Z', bel, 0.9) + L('M46,62 L62,62 M46,68 L62,68 M47,74 L62,74 M48,80 L62,80', dk(bel, 0.3), 1.1);
    s += body(c, td, sc, chest + F('M60,40 L80,40 L80,90 L62,90 C68,74 68,56 60,40 Z', dk(sc, 0.3), 0.6), 2.4);
    s += P('M42,76 L68,76 L68,82 L42,82 Z', c.cel(o.belt || '#3a2a22'), 1.6) + R(51, 74, 8, 10, c.cel(arm), 1.2) + C(55, 79, 1.8, LAVA);
    s += pauldron(c, 70, 46, 10, arm, trim) + pauldron(c, 42, 48, o.plate ? 13 : 12, arm, trim);
    if (o.plate) s += P(pd([[36, 42], [34, 30], [42, 40]], true) + pd([[44, 38], [46, 28], [50, 38]], true) + pd([[66, 38], [70, 30], [74, 40]], true), c.cel(HORN), 1.1);
    var hx = 44, hy = 26;
    s += body(c, 'M' + pt([hx - 2, hy + 4]) + 'L' + pt([hx + 12, hy + 2]) + 'L' + pt([hx + 14, hy + 20]) + 'L' + pt([hx, hy + 22]) + 'Z', sc, F(pd([[hx - 2, hy + 8], [hx + 6, hy + 8], [hx + 6, hy + 24], [hx - 2, hy + 24]], true), bel, 0.9), 1.8);
    s += drakeHead(c, hx, hy, { col: sc, eye: eye, belly: bel, k: 0.92, open: !!o.roar, horns: o.plate ? 'ram' : 'swept' });
    s += limb('M44,52 L34,66 L26,66', sc, 9) + clawHand([26, 66], sc, 1.1, '#e8e0cc');
    if (o.plate) s += R(28, 58, 10, 8, c.cel(arm), 1.2);
    s += limb('M98,92 L106,106 L102,119', sc, 10) + L('M102,120 l-6,1 M102,120 l-4,3', OL, 3) + L('M102,120 l-6,1 M102,120 l-4,3', '#e8e0cc', 1.3);
    s += limb('M58,92 L50,106 L46,119', sc, 10) + L('M46,120 l-6,1 M46,120 l-4,3', OL, 3) + L('M46,120 l-6,1 M46,120 l-4,3', '#e8e0cc', 1.3);
    return G(s, at(o.scale || 0.98, 64, 122));
  }

  // ============================================================
  //  MOBS (all facing left)
  // ============================================================
  var MOBS = {
    brood_whelp: function (c) { return whelp(c, { col: '#2e2832', belly: BEL, mem: MEM, eye: AMBER, scale: 0.88 }); },
    onyxian_whelp: function (c) { return whelp(c, { col: '#221c28', belly: '#e0561e', mem: '#5a1a30', eye: '#ff6a2a', scale: 0.98, fire: true, glow: true, embers: 51 }); },
    brood_drakonid: function (c) {
      var sc = BLK2, bel = BEL;
      return biped(c, {
        skin: sc, shirt: sc, pants: sc, sleeve: sc, glove: sc, digi: true, feet: talon, legW: 11, armW: 9.5, shadowR: 36, neck: false, hx: 50, hy: 28,
        torsoD: 'M42,50 C48,42 80,42 86,50 L84,70 L80,90 L50,90 L46,70 Z',
        back: function (c) {
          var T = taper([[80, 86], [98, 96], [114, 106], [124, 98]], 13, 2, 6);
          return wing(c, [78, 50], [94, 22], [[112, 10], [118, 28], [114, 46], [100, 58]], dk(sc, 0.1), dk(MEM, 0.1)) + body(c, T.d, sc, F(ribbonBand(T, 0.6, 1), dk(sc, 0.45), 0.8), 2) + P(pd([[120, 96], [128, 90], [126, 102]], true), c.cel(MEM), 1.2);
        },
        chest: function (c) { var d = 'M54,48 L76,48 L74,90 L57,90 Z', l = ''; for (var y = 54; y < 90; y += 7) l += 'M55,' + y + ' L75,' + y; return P(d, c.cel(bel), 1.6) + L(l, dk(bel, 0.4), 1.1) + scaleRows(76, 50, 86, 84, lt(sc, 0.18), 6); },
        front: function (c) { return body(c, 'M48,84 L82,84 L84,94 L66,100 L46,94 Z', '#3a2a22', L('M48,88 L82,88', RUST, 1.6) + C(65, 92, 2, c.cel('#c8b890'), 0.8), 1.8); },
        pads: function (c) { return P(pd([[80, 44], [92, 40], [90, 52]], true) + pd([[44, 46], [34, 40], [38, 54]], true), c.cel(HORN), 1.3); },
        head: function (c, x, y) { return body(c, 'M' + pt([x + 4, y + 6]) + 'L' + pt([x + 18, y + 4]) + 'L' + pt([x + 20, y + 22]) + 'L' + pt([x + 6, y + 24]) + 'Z', sc, F(pd([[x + 4, y + 10], [x + 12, y + 10], [x + 12, y + 26], [x + 4, y + 26]], true), bel, 0.9), 2) + drakeHead(c, x, y, { col: sc, eye: AMBER, belly: bel, open: true }); },
        near: [[48, 54], [36, 60], [26, 50]], far: [[82, 54], [94, 64], [100, 56]],
        nearHand: function (c, p) { return clawHand(p, sc, 1.2); }, farHand: function (c, p) { return clawHand(p, dk(sc, 0.1), 1.1); },
        tf: at(1, 64, 122)
      });
    },
    brood_dragonspawn: function (c) { return spawnRig(c, { sc: BLK, bel: BEL, arm: '#6a5e5a', trim: RUST, blade: '#a8acb4', scale: 0.98 }); },
    onyxian_warder: function (c) { return spawnRig(c, { sc: '#231d26', bel: '#9a5a30', arm: IRON, trim: '#c8401e', eye: '#ff5a2a', blade: '#8a9098', plate: true, saddle: true, wings: true, roar: true, belt: IRON, scale: 1.02 }); },
    scorchmaw: function (c) {
      var sc = '#262024', mem = '#7a2a1e', s = shadow(c, 64, 40);
      s += wing(c, [70, 64], [88, 26], [[114, 4], [124, 26], [122, 48], [106, 60]], dk(sc, 0.1), dk(mem, 0.15));
      var T = taper([[88, 86], [106, 94], [120, 84], [122, 64], [112, 54]], 14, 2, 6);
      s += body(c, T.d, sc, F(ribbonBand(T, 0.6, 1), dk(sc, 0.4), 0.8), 2) + P(pd([[110, 56], [104, 44], [118, 50]], true), c.cel(mem), 1.2);
      s += limb('M84,92 L94,104 L88,114', dk(sc, 0.1), 8) + talon(86, 118, dk(sc, 0.1)) + limb('M52,88 L42,100 L36,110', dk(sc, 0.1), 7) + talon(34, 114, dk(sc, 0.1));
      var bd = 'M36,78 C40,62 62,58 82,62 C100,66 104,82 96,94 C88,104 66,104 52,100 C40,96 34,88 36,78 Z', sp = '';
      for (var i = 0; i < 6; i++) sp += pd([[52 + i * 8, 62 - i * 0.2], [56 + i * 8, 52], [60 + i * 8, 63]], true);
      s += P(sp, c.cel(HORN), 1.1);
      var cr = 'M56,72 l4,4 l-2,5 M70,68 l2,6 l4,2 M84,74 l-3,5 l2,4';
      s += body(c, bd, sc, scaleRows(52, 66, 96, 88, lt(sc, 0.14), 7) + F('M38,84 C48,100 70,104 92,94 C82,92 60,92 44,84 Z', BEL) + L('M48,90 q4,3 8,2 M58,94 q5,2 10,1 M72,95 q5,1 10,-2', dk(BEL, 0.35), 1) + F('M80,58 C98,66 106,82 98,98 L108,98 L108,58 Z', dk(sc, 0.45), 0.85) + L(cr, LAVA, 1.6, 0.95) + L(cr, LAVAW, 0.6, 0.9));
      s += body(c, 'M42,80 C34,78 26,74 22,68 L28,56 C34,60 40,66 48,70 Z', sc, F('M24,66 C30,72 36,76 42,80 L40,84 C32,82 26,76 22,72 Z', BEL, 0.95), 2);
      s += breath(c, 2, 76, 0.9);
      s += drakeHead(c, 26, 60, { col: sc, open: true, k: 0.78, mem: mem, eye: '#ffc030', belly: BEL, horns: 'ram' });
      s += limb('M74,94 L80,106 L72,116', sc, 8) + talon(72, 120, sc);
      s += limb('M48,86 L38,92 L28,96', sc, 7.4) + clawHand([26, 97], sc, 0.95);
      s += wing(c, [56, 70], [44, 34], [[24, 10], [50, 4], [70, 18], [72, 42]], sc, mem);
      return G(s + embers(61, 8, 10, 120, 20, 100), at(1.02, 64, 122));
    },
    // Veshmira herself: a great black dragon rearing up, wings spread over the whole frame, fire in her jaws.
    // Drawn on a 160 box and scaled into the 128 frame (like nalveshra in art_tidecrown.js); the biggest sprite in the pack.
    onyxia: function (c) {
      var sc = BLK, sc2 = BLK2, mem = MEM, s = '';
      s += E(86, 152, 74, 7, c.rg([[0, '#000', 0.5], [0.65, '#000', 0.25], [1, '#000', 0]]));
      s += C(40, 50, 44, glow(c, '#ff8a2a', 0.22));
      // far wing: up and back over the shoulders
      s += wing(c, [90, 66], [86, 8], [[58, -2], [50, 22], [58, 44], [76, 60]], dk(sc, 0.15), dk(mem, 0.3));
      // tail sweeping round the base to the right
      var T = taper([[112, 128], [136, 142], [156, 134], [158, 112], [148, 100]], 24, 3, 7);
      var tsp = ''; for (var i = 3; i < T.s.length - 3; i += 4) { var a = T.b[i], b = T.b[i + 1] || a; tsp += pd([a, [(a[0] + b[0]) / 2 + (a[1] - T.a[i][1]) * 0.35, (a[1] + b[1]) / 2 - (T.a[i][0] - a[0]) * 0.35 - 3], b], true); }
      s += P(tsp, c.cel(HORN), 1.1) + body(c, T.d, sc, F(ribbonBand(T, 0.62, 1), dk(sc, 0.45), 0.85) + L(bands(T, 3, 2), lt(sc, 0.14), 1, 0.8), 2);
      // far limbs
      s += limb('M84,94 L72,112 L60,116', dk(sc, 0.25), 10) + clawHand([58, 117], dk(sc, 0.25), 1.4, '#e8e0cc');
      s += limb('M112,120 L120,138 L112,150', dk(sc, 0.25), 14) + talon(112, 152, dk(sc, 0.25));
      // near wing: huge, spread up and to the right
      s += wing(c, [104, 70], [124, 6], [[160, -2], [164, 36], [158, 70], [138, 92]], sc2, mem);
      // body, rearing
      var bd = 'M62,80 C70,62 94,58 110,70 C126,82 132,108 126,128 C120,146 98,152 82,146 C66,140 56,120 58,102 C58,94 60,86 62,80 Z';
      var plates = ''; for (var p = 0; p < 7; p++) { var yy = 88 + p * 8.4, x0 = 60 + p * 1.6, x1 = 78 + p * 3.4; plates += 'M' + pt([x0, yy]) + 'Q' + pt([(x0 + x1) / 2, yy + 3.4]) + ' ' + pt([x1, yy + 1]); }
      s += body(c, bd, sc, scaleRows(80, 70, 128, 132, lt(sc, 0.12), 8) + F('M60,86 C58,108 64,132 86,148 C78,128 74,106 76,84 Z', BEL) + L(plates, dk(BEL, 0.4), 1.2) + F('M108,64 C128,78 136,108 126,140 L140,140 L140,64 Z', dk(sc, 0.45), 0.85), 2.6);
      var dsp = ''; [[98, 62], [108, 66], [117, 74], [124, 84], [129, 96]].forEach(function (k, j) { dsp += pd([[k[0] - 4, k[1] + 3], [k[0] + 4 + j, k[1] - 8 + j * 0.6], [k[0] + 5, k[1] + 4]], true); });
      s += P(dsp, c.cel(HORN), 1.2);
      // near hind leg
      s += body(c, 'M98,108 C114,100 132,112 128,130 L132,146 L140,152 L110,152 L112,142 L104,132 C96,126 92,116 98,108 Z', sc, F('M116,104 C130,110 134,126 128,146 L140,146 L140,104 Z', dk(sc, 0.4), 0.8) + L('M104,118 q8,-4 14,2', lt(sc, 0.2), 1.2, 0.8), 2.2);
      s += P('M110,152 l-5,2 l4,-7 Z M119,152 l-4,3 l3,-8 Z M128,152 l-3,3 l3,-7 Z', '#e8e0cc', 1);
      // neck curving up to the head
      var N = taper([[76, 82], [62, 70], [52, 56], [50, 40]], 30, 17, 6);
      var nsp = ''; for (var m = 2; m < N.s.length - 1; m += 3) { var bb = N.b[m]; nsp += pd([[bb[0] - 3, bb[1] + 2], [bb[0] + 7, bb[1] - 3], [bb[0] + 2, bb[1] + 5]], true); }
      s += P(nsp, c.cel(HORN), 1.1) + body(c, N.d, sc, F(ribbonBand(N, 0, 0.36), BEL, 0.95) + L(bands(N, 3, 2), dk(sc, 0.35), 1, 0.7), 2.4);
      // the head: horned, jaws wide, fire building
      s += drakeHead(c, 52, 34, { col: sc, open: true, k: 1.42, mem: mem, eye: AMBER, belly: BEL });
      s += breath(c, 14, 58, 1.05);
      // near arm, raised to strike
      s += limb('M68,94 L50,104 L36,96', sc, 11) + clawHand([34, 95], sc, 1.6, '#f0e8d8');
      s += embers(71, 12, 0, 70, 30, 100);
      return G(s, 'matrix(0.8,0,0,0.8,0,0)');
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(BLK2), 2.5); }
  function phScene(c) { return R(0, 0, 400, 240, '#2a2622') + ground(c, 150, MUDL, MUD); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#2a2622"/></svg>'; }
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
