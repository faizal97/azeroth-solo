/* art_stratholme.js — Graymouth art for Realm of Loner (dungeon, levels 58-60: the burned city where Arthas culled
 * Wexmoor's people; King's Square under a red sky, the Pyre Bastion, and the Hollow Host ziggurats by the slaughterhouse;
 * the Crimson Unmaking guardsmen and conjurors, skeletal guardians and bile spewers, and the bosses Nibbles the Cruel,
 * Archivist Penrose, Xazzarak, Baroness Vessaline, Bloatgut the Gorger and Baron Mortvale).
 * Loads AFTER art.js (and optionally other zone packs) and EXTENDS window.ART: ART.scene / ART.mob handle the
 * Graymouth keys and fall through to the previous functions for every other key. Keys are appended to
 * ART.keys.scenes / ART.keys.mobs. Self-contained: no dependency on art.js internals. Never throws.
 * Helpers, the biped rig and the house-style scene pieces are copies of art_brd.js / art_scarlet.js.
 * The Crimson Unmaking is told apart from the white-tabard Order of the Pyre of the Monastery and Pallmoor by its
 * all-crimson plate with gold trim, the pointed closed helm with a gold finial and the gold cross-pattee emblem
 * (the Monastery wears a sunburst). Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop
 * gradients + flat shadow shapes, no text, no filters, ids unique per call (prefix st<counter>_).
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
  function rp(x, y, w, h) { return pd([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); }
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
  function gEye(c, x, y, r, col) { return C(x, y, r * 3.2, glow(c, col, 0.8)) + C(x, y, r, col) + C(x - r * 0.3, y - r * 0.3, r * 0.35, '#ffffff', 0, 0.9); }
  function ellD(x, y, rx, ry) { return 'M' + pt([x - rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x + rx, y]) + 'A' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + pt([x - rx, y]) + 'Z'; }
  // point helper along a direction: u along ang, v perpendicular
  function dirQ(p, ang) { var ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca; return function (u, v) { return [p[0] + ca * u + px * v, p[1] + sa * u + py * v]; }; }
  function ring(x, y, rx, ry, col, w) { return L(ellD(x, y, rx, ry), OL, w + 1.8) + L(ellD(x, y, rx, ry), col, w); }

  // ============================================================
  //  SCENE PIECES (shared house style, copies of art_brd.js)
  // ============================================================
  function sky(c, top, mid, bot) { return R(0, 0, 400, 240, c.lg([[0, top], [0.55, mid], [1, bot]])); }
  function pebbles(seed, y0, y1, col, cnt, x0, x1) {
    var r = rng(seed), s = '';
    x0 = x0 == null ? 0 : x0; x1 = x1 == null ? 400 : x1;
    for (var i = 0; i < (cnt || 14); i++) { var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 2 + r() * 4; s += E(x, y, w, w * 0.45, col, 0, 0.6); }
    return s;
  }
  function mist(c, y, h, col, op, seed) {
    var r = rng(seed || 5), o = R(-2, y - h / 2, 404, h, c.lg([[0, col, 0], [0.5, col, op], [1, col, 0]]));
    for (var i = 0; i < 5; i++) o += E(r() * 400, y + (r() - 0.5) * h * 0.4, 40 + r() * 40, h * 0.22, col, 0, op * 0.8);
    return o;
  }
  function brickWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 12;
    var r = rng(seed || 3), jn = '', sh = '';
    for (var y = y0; y < y1; y += bh) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var off = ((y - y0) / bh) % 2 ? 11 : 0;
      for (var x = x0 - off; x < x1; x += 22) { if (x > x0) jn += 'M' + pt([x, y]) + 'l0,' + n(Math.min(bh, y1 - y)); if (r() < 0.22 && x + 21 <= x1 && x + 1 >= x0) sh += R(x + 1, y + 1, 20, Math.min(bh, y1 - y) - 2, r() < 0.5 ? dk(col, 0.12) : lt(col, 0.08), 0); }
    }
    return R(x0, y0, x1 - x0, y1 - y0, col) + sh + L(jn, dk(col, 0.4), 1.1, 0.85);
  }
  // wall of big stone blocks with lit top edges (full-width walls only: blocks may run past x1)
  function blockWall(c, x0, y0, x1, y1, col, seed, bh) {
    bh = bh || 20; var r = rng(seed || 4), o = R(x0, y0, x1 - x0, y1 - y0, col), jn = '', hl = '';
    for (var y = y0, row = 0; y < y1; y += bh, row++) {
      jn += 'M' + pt([x0, y]) + 'L' + pt([x1, y]);
      var x = x0 - (row % 2 ? bh * 0.9 : 0);
      while (x < x1) {
        var bw = bh * (1.4 + r() * 1.4);
        if (r() < 0.32) o += R(Math.max(x0, x + 1), y + 1, Math.max(1, Math.min(bw - 2, x1 - x - 1)), Math.min(bh - 2, y1 - y - 1), r() < 0.55 ? dk(col, 0.2) : lt(col, 0.06));
        jn += 'M' + pt([x, y]) + 'l0,' + n(Math.min(bh, y1 - y)); hl += 'M' + pt([x + 2, y + 2]) + 'l' + n(Math.max(0, bw - 5)) + ',0'; x += bw;
      }
    }
    return o + L(hl, lt(col, 0.2), 1, 0.7) + L(jn, dk(col, 0.5), 1.4, 0.9);
  }
  function flagFloor(c, yH, vx, col, seed) {
    var o = R(-2, yH, 404, 242 - yH, c.lg([[0, dk(col, 0.35)], [1, col]])), d = '', r = rng(seed || 2);
    for (var i = -9; i <= 9; i++) d += 'M' + pt([vx + i * 12, yH]) + 'L' + pt([vx + i * 70, 242]);
    for (var j = 1; j < 8; j++) { var t = j / 8, y = yH + (242 - yH) * t * t; d += 'M-2,' + n(y) + 'L402,' + n(y + (r() - 0.5) * 2); }
    return o + L(d, dk(col, 0.45), 1, 0.7);
  }
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
  // tapered ribbon along a smooth curve (tails, horns, hair, wisps); side a is the left of the travel direction
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
  // ---- biped rig (facing left; shared copy of art_brd.js) ----
  var _cur = null; function c_(col) { return _cur ? _cur.cel(col) : col; }
  function hand(p, col) { return C(p[0], p[1], 4.4, col, 2); }
  function boot(x, y, col) {
    return P('M' + n(x + 5) + ',' + n(y - 9) + ' L' + n(x + 6) + ',' + n(y + 1) + ' L' + n(x - 9) + ',' + n(y + 1) + ' C' + n(x - 10) + ',' + n(y - 3) + ' ' + n(x - 7) + ',' + n(y - 5) + ' ' + n(x - 4) + ',' + n(y - 5) + ' L' + n(x - 5) + ',' + n(y - 9) + ' Z', c_(col), 2);
  }
  function bearPaw(x, y, col, clawCol) {
    return P('M' + pt([x + 7, y - 7]) + 'C' + pt([x + 9, y - 1]) + ' ' + pt([x + 7, y + 1.5]) + ' ' + pt([x + 2, y + 1.5]) + 'L' + pt([x - 9, y + 1.5]) + 'C' + pt([x - 12, y + 1.5]) + ' ' + pt([x - 12, y - 4]) + ' ' + pt([x - 7, y - 6]) + 'Z', col, 2) +
      L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', OL, 3) + L('M' + pt([x - 10, y]) + 'l-3,1.2 M' + pt([x - 6, y + 1]) + 'l-3,1 M' + pt([x - 2, y + 1.2]) + 'l-2.6,1', clawCol || '#efe6cf', 1.3);
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
  function motes(seed, cnt, x0, x1, y0, y1, col) { var r = rng(seed), o = ''; for (var i = 0; i < cnt; i++) o += C(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.6 + r() * 0.9, col || '#fff8c8', 0, 0.5 + r() * 0.4); return o; }
  function skull(c, x, y, s, eye) {
    return P('M' + pt([x - 6 * s, y + 2 * s]) + 'C' + pt([x - 7 * s, y - 8 * s]) + ' ' + pt([x + 7 * s, y - 8 * s]) + ' ' + pt([x + 6 * s, y + 2 * s]) + 'L' + pt([x + 4 * s, y + 3 * s]) + 'L' + pt([x + 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 6 * s]) + 'L' + pt([x - 4 * s, y + 3 * s]) + 'Z', c.cel('#ece4cc'), 1.6 * Math.max(0.6, s)) +
      E(x - 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + E(x + 2.6 * s, y - 1 * s, 1.8 * s, 2 * s, OL) + (eye ? C(x - 2.6 * s, y - 1 * s, 0.8 * s, eye) + C(x + 2.6 * s, y - 1 * s, 0.8 * s, eye) : '');
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
  function pauldron(c, x, y, r, col, trim) {
    col = col || '#b8bec8';
    var d = 'M' + pt([x - r, y + 3]) + 'C' + pt([x - r, y - r * 0.95]) + ' ' + pt([x + r, y - r * 0.95]) + ' ' + pt([x + r, y + 3]) + 'C' + pt([x + r * 0.4, y + 1]) + ' ' + pt([x - r * 0.4, y + 1]) + ' ' + pt([x - r, y + 3]) + 'Z';
    var d2 = 'M' + pt([x - r * 0.9, y + 6]) + 'C' + pt([x - r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 1]) + ' ' + pt([x + r * 0.9, y + 6]) + 'C' + pt([x + r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.3, y + 4.4]) + ' ' + pt([x - r * 0.9, y + 6]) + 'Z';
    return P(d2, c.cel(dk(col, 0.08)), 1.6) + body(c, d, col, F(pd([[x + r * 0.2, y - r], [x + r + 2, y - r], [x + r + 2, y + 4], [x + r * 0.3, y + 4]], true), dk(col, 0.3), 0.7), 1.8) +
      (trim ? L('M' + pt([x - r + 1.6, y + 1.8]) + 'C' + pt([x - r + 1, y - r * 0.6]) + ' ' + pt([x + r - 1, y - r * 0.6]) + ' ' + pt([x + r - 1.6, y + 1.8]), trim, 1.4) : '') + C(x - r * 0.3, y - r * 0.4, 1.1, '#ffffff', 0, 0.7);
  }
  function gauntlet(col) { return function (c, p) { return C(p[0], p[1], 4.8, c.cel(col), 2) + L('M' + pt([p[0] - 3, p[1] - 1]) + 'l6,0', dk(col, 0.35), 1); }; }
  function chainLine(a, b, sag, s, col) {
    s = s || 1; col = col || '#6a6872';
    var len = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])), k = Math.max(2, Math.round(len / (5 * s))), p = [], o = '';
    for (var i = 0; i <= k; i++) { var t = i / k; p.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
    o += L(pd(p), OL, 3.4 * s) + L(pd(p), dk(col, 0.25), 1.4 * s);
    for (var j = 0; j <= k; j += 2) o += ring(p[j][0], p[j][1], 2.3 * s, 2.9 * s, col, 1.2 * s);
    return o;
  }
  function rockPoly(x, y, r, k, seed, sq) { var rr = rng(seed), p = []; for (var i = 0; i < k; i++) { var a = PI * 2 * i / k + rr() * 0.4, f = 0.78 + rr() * 0.3; p.push([x + Math.cos(a) * r * f, y + Math.sin(a) * r * f * (sq || 1)]); } return pd(p, true); }
  function rockChunk(c, x, y, r, col, seed, sq) {
    var d = rockPoly(x, y, r, 7, seed, sq);
    return body(c, d, col, F(pd([[x + r * 0.1, y - r * 1.4], [x + r * 1.5, y - r * 1.4], [x + r * 1.5, y + r * 1.4], [x + r * 0.2, y + r * 1.4]], true), dk(col, 0.35), 0.75) + F(pd([[x - r, y - r], [x + r * 0.1, y - r], [x - r * 0.2, y - r * 0.2], [x - r, y - r * 0.1]], true), lt(col, 0.18), 0.6), 2);
  }

  // ============================================================
  //  STRATHOLME: palette
  // ============================================================
  var CR = '#a3182a', CRD = '#5e0a14', CRL = '#d04050', GOLD = '#e2b440', GOLDD = '#9a6a1a';
  var BLK = '#2c2a34', BLKL = '#4c4858', BLKX = '#18161c', RUNE = '#6ad8ff', RUNEL = '#d4f6ff', STEEL = '#b8bec8';
  var PLG = '#8ae83a', PLGL = '#d4ff94', PLGD = '#2e6a14', FEL = '#6aff3a';
  var EMB = '#ff8a2a', FIRE = '#ff6a1a', FIREY = '#ffd84a';
  var BONE = '#e6dcc2', BONED = '#b0a282';
  var STONE = '#5a5054', STONED = '#3a3236', STONEL = '#7c7072';
  var ZIG = '#3a3044', ZIGL = '#4c4058', ZIGD = '#1e1826';

  // the Crimson Unmaking emblem: a gold cross pattee with a flame on a crimson boss (original design)
  function emblem(c, x, y, k, col) {
    col = col || GOLD; var d = '';
    [-PI / 2, 0, PI / 2, PI].forEach(function (a) { var q = dirQ([x, y], a); d += pd([q(2.4 * k, -2.2 * k), q(10 * k, -5.6 * k), q(8.6 * k, 0), q(10 * k, 5.6 * k), q(2.4 * k, 2.2 * k)], true); });
    return P(d, c.cel(col), 0.9 * Math.max(0.7, k)) + C(x, y, 3.4 * k, c.cel(CR), 0.9 * Math.max(0.6, k)) + F('M' + pt([x, y + 2 * k]) + 'C' + pt([x - 2.2 * k, y + 2 * k]) + ' ' + pt([x - 1.6 * k, y - 0.8 * k]) + ' ' + pt([x, y - 2.8 * k]) + 'C' + pt([x + 1.6 * k, y - 0.8 * k]) + ' ' + pt([x + 2.2 * k, y + 2 * k]) + ' ' + pt([x, y + 2 * k]) + 'Z', FIREY);
  }

  // ============================================================
  //  SCENE PIECES (new here)
  // ============================================================
  // far city silhouette: gables, broken roofs, towers, spires, with fire in a few windows
  function skyline(c, y, col, seed, winCol) {
    var r = rng(seed), d = 'M-4,' + n(y + 2), x = -4, win = '';
    while (x < 404) {
      var w = 14 + r() * 24, h = 10 + r() * 22, k = r(), top = y - h;
      if (k < 0.12) d += 'L' + pt([x, top]) + 'L' + pt([x + w * 0.5, top - 26 - r() * 18]) + 'L' + pt([x + w, top]);
      else if (k < 0.52) d += 'L' + pt([x, top]) + 'L' + pt([x + w / 2, top - w * 0.6]) + 'L' + pt([x + w, top]);
      else if (k < 0.78) d += 'L' + pt([x, top]) + 'L' + pt([x + w * 0.3, top - 7]) + 'L' + pt([x + w * 0.42, top + 2]) + 'L' + pt([x + w * 0.66, top - 10]) + 'L' + pt([x + w, top + 3]);
      else { top -= 12; d += 'L' + pt([x, top]) + 'L' + pt([x + w * 0.25, top]) + 'L' + pt([x + w * 0.25, top + 4]) + 'L' + pt([x + w * 0.5, top + 4]) + 'L' + pt([x + w * 0.5, top]) + 'L' + pt([x + w * 0.75, top]) + 'L' + pt([x + w * 0.75, top + 4]) + 'L' + pt([x + w, top + 4]); }
      if (r() < 0.55) win += R(x + w * (0.25 + r() * 0.4), top + 5 + r() * 6, 2.6, 3.4, winCol || (r() < 0.5 ? EMB : FIREY), 0);
      x += w;
    }
    return F(d + 'L404,' + n(y + 2) + 'Z', col) + win;
  }
  function blaze(c, x, y, s) {
    return C(x, y - 12 * s, 34 * s, glow(c, FIRE, 0.55)) + flame(c, x - 8 * s, y, 0.7 * s) + flame(c, x + 8 * s, y, 0.78 * s) + flame(c, x, y + 1 * s, 1.15 * s);
  }
  // a Wexmoor gable house: stone ground floor, timber-framed plaster upper storey, steep slate roof;
  // o.broken tears the right slope open to charred rafters, o.burn puts fire in the windows and the break
  function house(c, x, y, w, h, o) {
    o = o || {};
    var wall = o.wall || '#6e5e4c', st = o.stone || '#4e4446', beam = '#2a1a12', roof = o.roof || '#2e2a36', rh = o.rh || w * 0.62, s = '';
    var gY = y - h, mY = y - h * 0.45, apex = [x + w / 2, gY - rh];
    s += E(x + w / 2, y + 2, w * 0.6, 4, '#000', 0, 0.35);
    var roofPts = o.broken ? [[x - 7, gY + 4], [apex[0], apex[1] - 5], [x + w * 0.6, gY - rh * 0.62], [x + w * 0.66, gY - rh * 0.74], [x + w * 0.74, gY - rh * 0.3], [x + w * 0.82, gY - rh * 0.42], [x + w * 0.9, gY - rh * 0.1], [x + w + 7, gY + 4]] : [[x - 7, gY + 4], [apex[0], apex[1] - 5], [x + w + 7, gY + 4]];
    if (o.broken && o.burn) s += C(x + w * 0.74, gY - rh * 0.4, w * 0.7, glow(c, FIRE, 0.6)) + flame(c, x + w * 0.72, gY - rh * 0.22, w / 70 * 1.3) + flame(c, x + w * 0.84, gY - rh * 0.05, w / 70);
    var roofD = pd(roofPts, true);
    s += body(c, roofD, roof, F(pd([[apex[0], apex[1] - 8], [x + w + 10, apex[1] - 8], [x + w + 10, gY + 8], [apex[0], gY + 8]], true), dk(roof, 0.35), 0.7) + L('M' + pt([x - 2, gY]) + 'L' + pt([x + w + 2, gY]) + 'M' + pt([x + w * 0.12, gY - rh * 0.3]) + 'L' + pt([x + w * 0.88, gY - rh * 0.3]) + 'M' + pt([x + w * 0.28, gY - rh * 0.62]) + 'L' + pt([x + w * 0.72, gY - rh * 0.62]), dk(roof, 0.4), 1), 1.8);
    if (o.broken) s += L('M' + pt([x + w * 0.58, gY - rh * 0.7]) + 'L' + pt([x + w * 0.74, gY - rh * 0.98]) + 'M' + pt([x + w * 0.68, gY - rh * 0.44]) + 'L' + pt([x + w * 0.9, gY - rh * 0.62]) + 'M' + pt([x + w * 0.8, gY - rh * 0.2]) + 'L' + pt([x + w * 0.98, gY - rh * 0.36]), OL, 4) + L('M' + pt([x + w * 0.58, gY - rh * 0.7]) + 'L' + pt([x + w * 0.74, gY - rh * 0.98]) + 'M' + pt([x + w * 0.68, gY - rh * 0.44]) + 'L' + pt([x + w * 0.9, gY - rh * 0.62]) + 'M' + pt([x + w * 0.8, gY - rh * 0.2]) + 'L' + pt([x + w * 0.98, gY - rh * 0.36]), '#3a2418', 2);
    // upper storey + gable, plaster with timbers
    var ins = o.broken ? [[x + w * 0.6, gY - rh * 0.62 + 7], [x + w * 0.66, gY - rh * 0.74 + 7], [x + w * 0.74, gY - rh * 0.3 + 6], [x + w * 0.82, gY - rh * 0.42 + 6], [x + w * 0.9, gY - rh * 0.1 + 5]] : [];
    var gab = pd([[x, mY], [x, gY], [apex[0], apex[1] + 7]].concat(ins).concat([[x + w, gY], [x + w, mY]]), true);
    var tim = 'M' + pt([x, gY]) + 'L' + pt([x + w, gY]) + 'M' + pt([x, mY]) + 'L' + pt([x + w, mY]);
    [0.25, 0.5, 0.75].forEach(function (f) { tim += 'M' + pt([x + w * f, gY]) + 'L' + pt([x + w * f, mY]); });
    tim += 'M' + pt([x, gY]) + 'L' + pt([x + w * 0.25, mY]) + 'M' + pt([x + w, gY]) + 'L' + pt([x + w * 0.75, mY]) + 'M' + pt([apex[0], apex[1] + 8]) + 'L' + pt([apex[0], gY]) + 'M' + pt([x + w * 0.3, gY - rh * 0.4]) + 'L' + pt([apex[0], gY - rh * 0.14]) + 'L' + pt([x + w * 0.7, gY - rh * 0.4]);
    var soot = o.burn ? F(pd([[x, gY - rh], [x + w, gY - rh], [x + w, mY + 4], [x, mY + 4]], true), '#140a08', 0.35) : '';
    var winS = '';
    [0.375, 0.625].forEach(function (f, i) {
      var wx = x + w * f, wy = gY + (mY - gY) * 0.5, ww = Math.min(9, w * 0.11), wh = (mY - gY) * 0.56;
      winS += R(wx - ww / 2, wy - wh / 2, ww, wh, o.burn || i === 0 ? c.lg([[0, FIREY], [1, FIRE]]) : '#1a0e0c', 1.2) + L('M' + pt([wx, wy - wh / 2]) + 'L' + pt([wx, wy + wh / 2]) + 'M' + pt([wx - ww / 2, wy]) + 'L' + pt([wx + ww / 2, wy]), beam, 1.2);
      if (o.burn) winS += F(pd([[wx - ww / 2 - 1, wy - wh / 2 - 1], [wx + ww / 2 + 1, wy - wh / 2 - 1], [wx + ww / 2 + 3, wy - wh / 2 - 12], [wx - ww / 2 - 3, wy - wh / 2 - 14]], true), '#100806', 0.45);
    });
    s += body(c, gab, wall, soot + F(pd([[x + w * 0.72, gY - rh], [x + w + 2, gY - rh], [x + w + 2, mY + 2], [x + w * 0.72, mY + 2]], true), dk(wall, 0.28), 0.8) + L(tim, OL, 3.4) + L(tim, beam, 2) + winS, 1.8);
    if (o.burn) [0.375, 0.625].forEach(function (f) { var wx = x + w * f, wy = gY + (mY - gY) * 0.22; s += C(wx, wy, 12, glow(c, FIRE, 0.55)) + flame(c, wx, wy + 1, Math.min(0.5, w / 120)); });
    // stone ground floor with a door
    s += P(rp(x, mY, w, y - mY), c.cel(st), 1.8) + '<g clip-path="url(#' + c.clip(rp(x, mY, w, y - mY)) + ')">' + brickWall(c, x, mY, x + w, y, st, o.seed || 31, 7) + F(rp(x + w * 0.72, mY, w * 0.3, y - mY), '#000', 0.25) + '</g>' + L(rp(x, mY, w, y - mY), OL, 1.8);
    var dw = Math.min(14, w * 0.2), dh = (y - mY) * 0.8, dx = x + w * (o.doorAt || 0.3);
    s += P('M' + pt([dx - dw / 2, y]) + 'L' + pt([dx - dw / 2, y - dh + dw / 2]) + 'Q' + pt([dx, y - dh - 2]) + ' ' + pt([dx + dw / 2, y - dh + dw / 2]) + 'L' + pt([dx + dw / 2, y]) + 'Z', o.burn ? c.lg([[0, '#2a0e08'], [1, FIRE]]) : '#1a0e0a', 1.6);
    return s;
  }
  // King's Square fountain: octagonal basin, broken central column and a toppled statue's legs
  function fountain(c, x, y, s) {
    var o = E(x, y + 3 * s, 66 * s, 9 * s, '#000', 0, 0.4), col = '#8a7e78';
    var front = 'M' + pt([x - 58 * s, y - 14 * s]) + 'L' + pt([x - 58 * s, y - 2 * s]) + 'Q' + pt([x, y + 8 * s]) + ' ' + pt([x + 58 * s, y - 2 * s]) + 'L' + pt([x + 58 * s, y - 14 * s]) + 'Q' + pt([x, y + 4 * s]) + ' ' + pt([x - 58 * s, y - 14 * s]) + 'Z';
    var panels = ''; [-40, -20, 0, 20, 40].forEach(function (u) { panels += 'M' + pt([x + u * s, y - 5 * s + Math.abs(u) * 0.1 * s]) + 'L' + pt([x + u * s, y + 3 * s - Math.abs(u) * 0.12 * s]); });
    // the column and tier behind the basin water
    o += E(x, y - 14 * s, 58 * s, 9 * s, c.cel(lt(col, 0.1)), 1.8 * s) + E(x, y - 14 * s, 51 * s, 6 * s, c.lg([[0, '#1a0806'], [0.6, '#4a140c'], [1, '#8a2a12']]), 1.4 * s);
    o += L('M' + pt([x - 36 * s, y - 13 * s]) + 'l14,0 M' + pt([x + 10 * s, y - 16 * s]) + 'l18,0 M' + pt([x - 8 * s, y - 11 * s]) + 'l10,0', '#ff8a3a', 1.2 * s, 0.7);
    o += body(c, pd([[x - 7 * s, y - 14 * s], [x + 7 * s, y - 14 * s], [x + 6 * s, y - 46 * s], [x - 6 * s, y - 46 * s]], true), col, F(rp(x + 2 * s, y - 50 * s, 8 * s, 40 * s), dk(col, 0.35), 0.8), 1.6 * s);
    // the upper bowl, snapped on the right
    o += body(c, pd([[x - 22 * s, y - 48 * s], [x + 8 * s, y - 48 * s], [x + 12 * s, y - 43 * s], [x + 16 * s, y - 49 * s], [x + 20 * s, y - 46 * s], [x + 12 * s, y - 40 * s], [x - 14 * s, y - 40 * s]], true), lt(col, 0.05), F(rp(x + 4 * s, y - 52 * s, 20 * s, 14 * s), dk(col, 0.3), 0.8), 1.6 * s);
    // plinth and the statue's legs (the rest lies in the rubble)
    o += body(c, rp(x - 9 * s, y - 60 * s, 18 * s, 12 * s), dk(col, 0.05), F(rp(x + 3 * s, y - 62 * s, 8 * s, 16 * s), dk(col, 0.35), 0.8), 1.6 * s);
    o += body(c, pd([[x - 7 * s, y - 60 * s], [x + 7 * s, y - 60 * s], [x + 6 * s, y - 72 * s], [x + 3 * s, y - 70 * s], [x + 1 * s, y - 78 * s], [x - 2 * s, y - 73 * s], [x - 5 * s, y - 80 * s], [x - 6 * s, y - 70 * s]], true), lt(col, 0.08), F(rp(x + 1 * s, y - 82 * s, 8 * s, 24 * s), dk(col, 0.35), 0.8) + L('M' + pt([x - 7 * s, y - 64 * s]) + 'Q' + pt([x, y - 62 * s]) + ' ' + pt([x + 7 * s, y - 64 * s]), dk(col, 0.4), 1 * s), 1.4 * s);
    o += L('M' + pt([x + 4 * s, y - 70 * s]) + 'L' + pt([x + 12 * s, y - 94 * s]), OL, 4 * s) + L('M' + pt([x + 4 * s, y - 70 * s]) + 'L' + pt([x + 12 * s, y - 94 * s]), '#c8ccd4', 2 * s) + L('M' + pt([x, y - 70 * s]) + 'L' + pt([x + 8 * s, y - 69 * s]), OL, 3.4 * s) + L('M' + pt([x, y - 70 * s]) + 'L' + pt([x + 8 * s, y - 69 * s]), GOLDD, 1.8 * s);
    // front wall with a crack and fallen pieces
    o += body(c, front, col, F('M' + pt([x + 20 * s, y - 20 * s]) + 'L' + pt([x + 62 * s, y - 20 * s]) + 'L' + pt([x + 62 * s, y + 8 * s]) + 'L' + pt([x + 20 * s, y + 8 * s]) + 'Z', dk(col, 0.3), 0.8) + L(panels, dk(col, 0.4), 1.2 * s) + L('M' + pt([x - 26 * s, y - 8 * s]) + 'l4,4 l-3,4 l4,3', OL, 1.4 * s), 1.8 * s);
    o += rockChunk(c, x - 52 * s, y + 4 * s, 6 * s, col, 2101) + rockChunk(c, x + 44 * s, y + 6 * s, 8 * s, dk(col, 0.05), 2102) + rockChunk(c, x + 60 * s, y + 2 * s, 5 * s, col, 2103);
    // the statue's toppled torso and head on the paving
    o += body(c, pd([[x + 64 * s, y - 4 * s], [x + 84 * s, y - 10 * s], [x + 88 * s, y - 2 * s], [x + 68 * s, y + 5 * s]], true), lt(col, 0.05), F(rp(x + 64 * s, y - 2 * s, 30 * s, 10 * s), dk(col, 0.3), 0.8), 1.6 * s) + C(x + 92 * s, y + 1 * s, 5 * s, c.cel(lt(col, 0.08)), 1.5 * s) + P(pd([[x + 88 * s, y - 4 * s], [x + 92 * s, y - 9 * s], [x + 96 * s, y - 4 * s]], true), c.cel(GOLDD), 1 * s);
    return o;
  }
  // a Wexmoor street lamp, snapped and leaning, still burning
  function lamp(c, x, y, lean, lit) {
    var q = dirQ([x, y], -PI / 2 + (lean || 0)), top = q(46, 0), o = E(x, y + 1, 7, 2, '#000', 0, 0.4);
    o += P(pd([[x - 5, y + 1], [x + 5, y + 1], [x + 3, y - 5], [x - 3, y - 5]], true), c.cel(BLK), 1.4) + limb('M' + pt(q(4, 0)) + 'L' + pt(top), BLK, 2.6);
    o += limb('M' + pt(q(38, 0)) + 'L' + pt(q(38, -8)), BLK, 1.6);
    var lp = q(36, -10);
    if (lit) o += C(lp[0], lp[1], 18, glow(c, EMB, 0.6));
    return o + P(pd([[lp[0] - 3.5, lp[1] - 4], [lp[0] + 3.5, lp[1] - 4], [lp[0] + 2.5, lp[1] + 4], [lp[0] - 2.5, lp[1] + 4]], true), lit ? c.lg([[0, FIREY], [1, FIRE]]) : '#1a1414', 1.2) + P(pd([[lp[0] - 4.5, lp[1] - 4], [lp[0] + 4.5, lp[1] - 4], [lp[0], lp[1] - 8]], true), c.cel(BLK), 1.1);
  }
  // cobbled street in perspective, floor line at yH
  function cobbles(c, yH, col, seed) {
    var o = flagFloor(c, yH, 200, col, seed), r = rng(seed + 7), d = '', hl = '';
    for (var y = yH + 3, j = 0; y < 242; j++) {
      var t = (y - yH) / (242 - yH), rh = 3 + t * 12, sw = 7 + t * 24;
      for (var x = -4 + (j % 2) * sw * 0.5 + r() * 3; x < 404; x += sw) { d += ellD(x, y + rh / 2, sw * 0.42, rh * 0.38); if (r() < 0.3) hl += 'M' + pt([x - sw * 0.25, y + rh * 0.3]) + 'l' + n(sw * 0.3) + ',0'; }
      y += rh;
    }
    return o + L(d, dk(col, 0.5), 1, 0.55) + L(hl, lt(col, 0.18), 1, 0.5);
  }
  function embers(c, seed, cnt, x0, x1, y0, y1) { return motes(seed, cnt, x0, x1, y0, y1, '#ffb050') + motes(seed + 1, Math.round(cnt / 3), x0, x1, y0, y1, '#fff0a0'); }
  // ---- the Pyre Bastion ----
  function archD(x, y, w, h) { return 'M' + pt([x - w / 2, y]) + 'L' + pt([x - w / 2, y - h + w * 0.55]) + 'Q' + pt([x - w / 2, y - h + w * 0.08]) + ' ' + pt([x, y - h]) + 'Q' + pt([x + w / 2, y - h + w * 0.08]) + ' ' + pt([x + w / 2, y - h + w * 0.55]) + 'L' + pt([x + w / 2, y]) + 'Z'; }
  function stainedWindow(c, x, y, w, h, seed, rose) {
    var r = rng(seed), o = C(x, y - h * 0.5, w * 1.3, glow(c, '#ff7a2a', 0.4));
    o += P(archD(x, y + 4, w + 12, h + 10), c.cel(STONEL), 2);
    var d = archD(x, y, w, h), cols = [CR, '#e8a030', '#c8401a', '#7a1020', '#f0d060', '#ff8a3a', CR], panes = '', leads = '', pw = w / 4, ph = 9;
    for (var yy = y - h; yy < y; yy += ph) for (var xx = x - w / 2; xx < x + w / 2 - 0.5; xx += pw) panes += R(xx, yy, pw, ph, cols[Math.floor(r() * cols.length)], 0);
    for (var vx = x - w / 4; vx < x + w / 2 - 1; vx += w / 4) leads += 'M' + pt([vx, y]) + 'L' + pt([vx, y - h]);
    for (var hy = y - h + ph; hy < y; hy += ph) leads += 'M' + pt([x - w / 2, hy]) + 'L' + pt([x + w / 2, hy]);
    o += '<g clip-path="url(#' + c.clip(d) + ')">' + panes + R(x - w / 2, y - h, w, h, c.lg([[0, '#ffe0a0', 0.25], [0.6, '#ff8a3a', 0], [1, '#000', 0.35]])) + L(leads, OL, 1.2, 0.9) + '</g>';
    o += L('M' + pt([x, y]) + 'L' + pt([x, y - h + w * 0.5]), OL, 4.4) + L('M' + pt([x, y]) + 'L' + pt([x, y - h + w * 0.5]), STONEL, 2.4);
    if (rose) {
      var rx = x, ry = y - h + w * 0.42, rr = w * 0.26, pet = '';
      for (var i = 0; i < 8; i++) { var a = i * PI / 4; pet += ellD(rx + Math.cos(a) * rr * 0.6, ry + Math.sin(a) * rr * 0.6, rr * 0.28, rr * 0.28); }
      o += C(rx, ry, rr + 2, c.cel(STONEL), 1.8) + C(rx, ry, rr, c.rg([[0, '#fff0b0'], [0.5, '#ff9a3a'], [1, CR]]), 1.2) + L(pet, OL, 1.2) + emblem(c, rx, ry, rr / 13);
    }
    return o + L(d, OL, 2);
  }
  function gColumn(c, x, y, w, h, col) {
    col = col || STONEL;
    var o = body(c, rp(x - 5, y - 12, w + 10, 12), dk(col, 0.12), F(rp(x + w * 0.6, y - 14, w, 16), dk(col, 0.4), 0.8), 1.6);
    o += body(c, rp(x, y - h + 12, w, h - 24), col, F(rp(x + w * 0.62, y - h, w, h), dk(col, 0.35), 0.8) + L('M' + pt([x + w * 0.3, y - h + 14]) + 'L' + pt([x + w * 0.3, y - 14]) + 'M' + pt([x + w * 0.62, y - h + 14]) + 'L' + pt([x + w * 0.62, y - 14]), dk(col, 0.4), 1.2) + L('M' + pt([x + 2, y - h + 14]) + 'L' + pt([x + 2, y - 14]), lt(col, 0.2), 1.2, 0.8), 1.8);
    return o + body(c, pd([[x - 3, y - h + 12], [x + w + 3, y - h + 12], [x + w + 8, y - h + 2], [x - 8, y - h + 2]], true), lt(col, 0.05), F(rp(x + w * 0.6, y - h, w + 10, 14), dk(col, 0.35), 0.8), 1.6);
  }
  function crBanner(c, x, y, w, h) {
    var d = pd([[x, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h - 12], [x, y + h]], true);
    var bd = pd([[x + 3, y + 3], [x + w - 3, y + 3], [x + w - 3, y + h - 4], [x + w / 2, y + h - 15], [x + 3, y + h - 4]], true);
    return R(x - 5, y - 4, w + 10, 5, c.cel(BLK), 1.2) + C(x - 5, y - 1.5, 2.4, c.cel(GOLD), 1) + C(x + w + 5, y - 1.5, 2.4, c.cel(GOLD), 1) +
      body(c, d, CR, F(pd([[x + w * 0.62, y], [x + w + 2, y], [x + w + 2, y + h + 2], [x + w * 0.62, y + h]], true), CRD, 0.6) + L('M' + pt([x + w * 0.3, y + 6]) + 'L' + pt([x + w * 0.3, y + h - 10]), dk(CR, 0.3), 1), 1.6) + L(bd, GOLD, 1.4) + emblem(c, x + w / 2, y + h * 0.36, w / 24);
  }
  function candleStand(c, x, y, h) {
    var o = E(x, y + 1, 8, 2, '#000', 0, 0.4) + C(x, y - h - 6, 22, glow(c, '#ffc860', 0.5));
    o += P(pd([[x - 7, y + 1], [x, y - 6], [x + 7, y + 1]], true), c.cel(GOLDD), 1.3) + limb('M' + pt([x, y - 4]) + 'L' + pt([x, y - h]), GOLDD, 2.2) + L('M' + pt([x - 0.6, y - 6]) + 'L' + pt([x - 0.6, y - h]), GOLD, 0.8);
    o += P(pd([[x - 6, y - h], [x + 6, y - h], [x + 4, y - h + 4], [x - 4, y - h + 4]], true), c.cel(GOLD), 1.2) + R(x - 2.4, y - h - 9, 4.8, 9, c.cel('#efe6d0'), 1) + flame(c, x, y - h - 9, 0.34, '#ffb040', '#fff6c0');
    return o;
  }
  function brazier(c, x, y, s, col) {
    col = col || BLK; var by = y - 18 * s, bw = 12 * s;
    var o = E(x, y + 1, 12 * s, 2.6 * s, '#000', 0, 0.35) + C(x, by - 10 * s, 40 * s, glow(c, EMB, 0.5));
    o += limb('M' + pt([x - 8 * s, y]) + 'L' + pt([x - 3 * s, by]) + 'M' + pt([x + 8 * s, y]) + 'L' + pt([x + 3 * s, by]), col, 2.4 * s);
    o += flame(c, x - 5 * s, by - 5 * s, 0.6 * s) + flame(c, x + 5 * s, by - 5 * s, 0.55 * s) + flame(c, x, by - 5 * s, 0.95 * s);
    o += body(c, pd([[x - bw, by - 7 * s], [x + bw, by - 7 * s], [x + bw * 0.7, by + 2 * s], [x - bw * 0.7, by + 2 * s]], true), col, F(rp(x + bw * 0.25, by - 9 * s, bw, 14 * s), dk(col, 0.35), 0.8) + L('M' + pt([x - bw, by - 3.5 * s]) + 'L' + pt([x + bw, by - 3.5 * s]), GOLD, 1.2 * s, 0.9), 1.6 * s);
    return o + E(x, by - 7 * s, bw, 1.8 * s, '#ffb030', 1.1 * s);
  }
  // black-and-crimson marble chequer in perspective
  function checkFloor(c, yH, vx, colA, colB) {
    var o = R(-2, yH, 404, 242 - yH, colA), fill = '', lines = '', rows = 8;
    var yAt = function (j) { var t = j / rows; return yH + (242 - yH) * Math.pow(t, 1.6); };
    var xAt = function (i, y) { var t = (y - yH) / (242 - yH); return vx + i * 13 + (i * 64 - i * 13) * t; };
    for (var j = 0; j < rows; j++) for (var i = -10; i < 10; i++) if (((i + j) % 2 + 2) % 2 === 0) { var y0 = yAt(j), y1 = yAt(j + 1); fill += pd([[xAt(i, y0), y0], [xAt(i + 1, y0), y0], [xAt(i + 1, y1), y1], [xAt(i, y1), y1]], true); }
    for (var k = -10; k <= 10; k++) lines += 'M' + pt([xAt(k, yH), yH]) + 'L' + pt([xAt(k, 242), 242]);
    for (var m = 1; m < rows; m++) lines += 'M-2,' + n(yAt(m)) + 'L402,' + n(yAt(m));
    return o + F(fill, colB) + L(lines, OL, 0.9, 0.5) + R(-2, yH, 404, 242 - yH, c.lg([[0, '#000', 0.55], [0.45, '#000', 0.15], [1, '#000', 0]]));
  }
  // ---- the Hollow Host side ----
  function boneSpike(c, x, y, dir, len) {
    var T = taper([[x, y + 2], [x + dir * len * 0.18, y - len * 0.5], [x + dir * len * 0.55, y - len * 0.92]], len * 0.34, 1, 4);
    return P(T.d, c.cel(BONE), 1.3) + L(along(T, 0.7), BONED, 0.9, 0.8);
  }
  // rune band marks: diamonds, dots and short bars (kept abstract so they never read as letters)
  function glyphs(x0, x1, y, s, seed) {
    var r = rng(seed), d = '', dots = '';
    for (var x = x0; x < x1; x += 11 * s) {
      var k = r();
      if (k < 0.45) d += pd([[x, y - 3 * s], [x + 2.4 * s, y], [x, y + 3 * s], [x - 2.4 * s, y]], true);
      else if (k < 0.75) dots += ellD(x, y, 1.4 * s, 1.4 * s);
      else d += 'M' + pt([x - 3 * s, y]) + 'L' + pt([x + 3 * s, y]);
    }
    return { d: d, dots: dots };
  }
  // a Hollow Host ziggurat: dark stepped tiers, green rune bands, bone spikes at the corners, a floating plague crystal
  function ziggurat(c, x, y, s) {
    var tiers = [[100, 24], [80, 21], [60, 19], [40, 16]], o = C(x, y - 60 * s, 130 * s, glow(c, PLG, 0.3)), by = y;
    tiers.forEach(function (t, i) {
      var hw = t[0] * s, th = t[1] * s, ins = 7 * s, d = pd([[x - hw, by], [x + hw, by], [x + hw - ins, by - th], [x - hw + ins, by - th]], true), ry = by - th * 0.52;
      var blocks = ''; for (var bx = x - hw + 16 * s; bx < x + hw - 8 * s; bx += 20 * s) blocks += 'M' + pt([bx, by]) + 'l0,' + n(-th * 0.3) + 'M' + pt([bx + 10 * s, by - th * 0.72]) + 'l0,' + n(-th * 0.28);
      var rd = glyphs(x - hw + 12 * s, x + hw - 10 * s, ry, s, 4410 + i);
      o += body(c, d, i % 2 ? ZIG : ZIGL, F(pd([[x + hw * 0.45, by - th - 2], [x + hw + 2, by - th - 2], [x + hw + 2, by + 2], [x + hw * 0.45, by + 2]], true), ZIGD, 0.75) + L(blocks, ZIGD, 1.2) +
        R(x - hw, ry - 4.2 * s, hw * 2, 8.4 * s, dk(ZIGD, 0.3), 0) + L(rd.d, PLG, 2.6 * s, 0.25) + L(rd.d, PLG, 1.2 * s, 0.75) + F(rd.dots, PLG, 0.7) + L('M' + pt([x - hw + ins, by - th + 1.2]) + 'L' + pt([x + hw - ins, by - th + 1.2]), lt(ZIGL, 0.25), 1.2, 0.8), 1.8 * s);
      o += boneSpike(c, x - hw + ins * 0.6, by - th, -1, (16 - i * 2) * s) + boneSpike(c, x + hw - ins * 0.6, by - th, 1, (16 - i * 2) * s);
      by -= th;
    });
    // the doorway in the bottom tier
    var dh = 20 * s;
    o += C(x, y - dh * 0.5, 24 * s, glow(c, PLG, 0.6)) + P('M' + pt([x - 9 * s, y]) + 'L' + pt([x - 9 * s, y - dh + 6 * s]) + 'L' + pt([x, y - dh - 2 * s]) + 'L' + pt([x + 9 * s, y - dh + 6 * s]) + 'L' + pt([x + 9 * s, y]) + 'Z', c.lg([[0, '#0a1a06'], [0.6, PLGD], [1, PLG]]), 1.6 * s);
    // the crystal floating above the top tier
    var cy = by - 20 * s;
    o += L('M' + pt([x, by]) + 'L' + pt([x, cy]), PLG, 6 * s, 0.25) + L('M' + pt([x, by]) + 'L' + pt([x, cy]), PLGL, 1.6 * s, 0.7) + C(x, cy, 26 * s, glow(c, PLG, 0.8));
    o += P(pd([[x, cy - 14 * s], [x + 7 * s, cy], [x, cy + 12 * s], [x - 7 * s, cy]], true), c.lg([[0, PLGL], [0.5, PLG], [1, PLGD]], 0, 0, 1, 1), 1.6 * s) + L('M' + pt([x, cy - 14 * s]) + 'L' + pt([x - 2 * s, cy]) + 'L' + pt([x, cy + 12 * s]), '#ffffff', 1 * s, 0.6);
    o += P(pd([[x - 12 * s, cy - 4 * s], [x - 9 * s, cy - 8 * s], [x - 7 * s, cy - 2 * s]], true), c.cel(PLG), 1 * s) + P(pd([[x + 11 * s, cy + 2 * s], [x + 14 * s, cy - 3 * s], [x + 15 * s, cy + 4 * s]], true), c.cel(PLG), 1 * s);
    return o;
  }
  function meatHook(c, x, y, len, carcass) {
    var o = chainLine([x, y], [x, y + len], 0, 0.7, '#7a767e'), e = y + len;
    o += L('M' + pt([x, e]) + 'l0,4 q0,6 -5,6 q-3,0 -4,-3', OL, 3.6) + L('M' + pt([x, e]) + 'l0,4 q0,6 -5,6 q-3,0 -4,-3', STEEL, 1.6);
    if (carcass) o += P('M' + pt([x - 3, e + 8]) + 'C' + pt([x - 12, e + 12]) + ' ' + pt([x - 12, e + 32]) + ' ' + pt([x - 4, e + 40]) + 'C' + pt([x + 6, e + 34]) + ' ' + pt([x + 8, e + 16]) + ' ' + pt([x + 3, e + 8]) + 'Z', c.cel('#6a2a26'), 1.4) + L('M' + pt([x - 7, e + 18]) + 'q5,2 10,0 M' + pt([x - 8, e + 24]) + 'q6,2 12,0 M' + pt([x - 7, e + 30]) + 'q5,2 10,0', BONE, 1.2, 0.8);
    return o;
  }
  // the slaughterhouse: stone footing, dark plank walls, slate roof with bone spikes, an open door full of green light
  function slaughterhouse(c, x, y, w, h) {
    var wood = '#3e2c26', o = E(x + w / 2, y + 3, w * 0.62, 5, '#000', 0, 0.45), rTop = y - h - 30, pl = '', r = rng(4501);
    o += body(c, pd([[x - 8, y - h + 3], [x + w + 8, y - h + 3], [x + w - 12, rTop], [x + 12, rTop]], true), '#2a2432', F(rp(x + w * 0.62, rTop - 2, w, 40), '#000', 0.3) + L('M' + pt([x, y - h - 8]) + 'L' + pt([x + w, y - h - 8]) + 'M' + pt([x + 6, y - h - 18]) + 'L' + pt([x + w - 6, y - h - 18]), '#18141c', 1.1), 1.8);
    for (var sx = x + 18; sx < x + w - 12; sx += 16) o += boneSpike(c, sx, rTop, sx < x + w / 2 ? -1 : 1, 10);
    for (var px = x + 7; px < x + w; px += 7) pl += 'M' + pt([px, y - h]) + 'L' + pt([px, y - 12]);
    o += body(c, rp(x, y - h, w, h), wood, F(rp(x + w * 0.66, y - h, w, h), '#000', 0.3) + L(pl, dk(wood, 0.5), 1) + F('M' + pt([x + 8, y - h]) + 'C' + pt([x + 10, y - h + 20]) + ' ' + pt([x + 6, y - h + 26]) + ' ' + pt([x + 9, y - h + 34]) + 'L' + pt([x + 14, y - h + 30]) + 'C' + pt([x + 12, y - h + 20]) + ' ' + pt([x + 16, y - h + 10]) + ' ' + pt([x + 14, y - h]) + 'Z', PLGD, 0.8), 1.8);
    o += P(rp(x, y - 12, w, 12), c.cel(STONED), 1.6) + '<g clip-path="url(#' + c.clip(rp(x, y - 12, w, 12)) + ')">' + brickWall(c, x, y - 12, x + w, y, STONED, 4502, 6) + '</g>' + L(rp(x, y - 12, w, 12), OL, 1.6);
    var dx = x + w * 0.5, dw = w * 0.42, dh = h * 0.8, door = rp(dx - dw / 2, y - dh, dw, dh);
    o += C(dx, y - dh * 0.5, dw, glow(c, PLG, 0.45)) + P(door, c.lg([[0, '#0a1206'], [1, '#2a4a14']]), 2);
    o += '<g clip-path="url(#' + c.clip(door) + ')">' + meatHook(c, dx - dw * 0.28, y - dh, 6, true) + meatHook(c, dx + dw * 0.05, y - dh, 10, true) + meatHook(c, dx + dw * 0.32, y - dh, 4, false) + E(dx, y, dw * 0.5, 6, PLG, 0, 0.35) + '</g>';
    o += R(dx - dw / 2 - 3, y - dh - 5, dw + 6, 6, c.cel('#2a1c16'), 1.6) + limb('M' + pt([dx - dw / 2 - 1, y - dh]) + 'L' + pt([dx - dw / 2 - 1, y]) + 'M' + pt([dx + dw / 2 + 1, y - dh]) + 'L' + pt([dx + dw / 2 + 1, y]), '#2a1c16', 2.4);
    // a hook rack on posts beside it
    var rx = x + w + 6;
    o += limb('M' + pt([rx, y]) + 'L' + pt([rx, y - 52]) + 'M' + pt([rx + 34, y]) + 'L' + pt([rx + 34, y - 52]), '#2a1c16', 3.4) + limb('M' + pt([rx - 4, y - 52]) + 'L' + pt([rx + 38, y - 52]), '#34241c', 3.8);
    o += meatHook(c, rx + 10, y - 50, 8, true) + meatHook(c, rx + 24, y - 50, 16, false);
    return o;
  }
  function cauldron(c, x, y, s) {
    var o = E(x, y + 1, 24 * s, 4 * s, '#000', 0, 0.45) + C(x, y - 22 * s, 34 * s, glow(c, PLG, 0.55));
    o += limb('M' + pt([x - 12 * s, y - 6 * s]) + 'L' + pt([x - 16 * s, y]) + 'M' + pt([x + 12 * s, y - 6 * s]) + 'L' + pt([x + 16 * s, y]), BLK, 3 * s);
    o += body(c, 'M' + pt([x - 19 * s, y - 20 * s]) + 'C' + pt([x - 22 * s, y - 2 * s]) + ' ' + pt([x + 22 * s, y - 2 * s]) + ' ' + pt([x + 19 * s, y - 20 * s]) + 'Z', BLK, F(rp(x + 4 * s, y - 24 * s, 24 * s, 26 * s), '#000', 0.35) + L('M' + pt([x - 18 * s, y - 13 * s]) + 'Q' + pt([x, y - 9 * s]) + ' ' + pt([x + 18 * s, y - 13 * s]), BLKL, 1.2 * s), 1.8 * s);
    o += E(x, y - 20 * s, 20 * s, 4.6 * s, c.cel(BLKL), 1.6 * s) + E(x, y - 20.6 * s, 16 * s, 3 * s, c.lg([[0, PLGL], [1, PLG]]), 0);
    o += C(x - 6 * s, y - 23 * s, 2.4 * s, c.cel(PLG), 0.9 * s) + C(x + 5 * s, y - 24 * s, 1.8 * s, c.cel(PLG), 0.8 * s) + C(x + 1 * s, y - 26 * s, 1.4 * s, c.cel(PLGL), 0.7 * s);
    o += F('M' + pt([x + 12 * s, y - 19 * s]) + 'C' + pt([x + 14 * s, y - 12 * s]) + ' ' + pt([x + 12 * s, y - 8 * s]) + ' ' + pt([x + 14 * s, y - 4 * s]) + 'L' + pt([x + 16 * s, y - 6 * s]) + 'C' + pt([x + 16 * s, y - 12 * s]) + ' ' + pt([x + 17 * s, y - 16 * s]) + ' ' + pt([x + 16 * s, y - 20 * s]) + 'Z', PLG, 0.9);
    return o + smoke(x - 2 * s, y - 28 * s, 0.45 * s, '#7ad84a', 0.3, 0.3);
  }
  function slime(c, x, y, rx) { return E(x, y, rx, rx * 0.26, c.lg([[0, PLGL], [0.5, PLG], [1, PLGD]]), 1.2) + E(x - rx * 0.3, y - rx * 0.06, rx * 0.25, rx * 0.06, '#ffffff', 0, 0.6); }

  // ============================================================
  //  SCENES
  // ============================================================
  var SCENES = {
    strat_city: function (c) {
      var o = sky(c, '#2a080c', '#6a1a12', '#c8481c');
      o += E(200, 124, 280, 60, glow(c, '#ff6a1a', 0.55));
      o += smoke(70, 96, 2.6, '#4a1e1a', 0.5, 1.1) + smoke(250, 90, 3.2, '#3e1a18', 0.5, 0.8) + smoke(350, 100, 2.2, '#4a1e1a', 0.45, 1.2) + smoke(160, 104, 1.6, '#2a1212', 0.5, 0.6);
      o += embers(c, 7001, 30, 0, 400, 0, 110);
      o += skyline(c, 108, '#2e1414', 7002);
      o += skyline(c, 116, '#1e0c0e', 7003) + blaze(c, 140, 110, 0.6) + blaze(c, 262, 112, 0.5);
      // the burning streets around King's Square
      o += house(c, 72, 120, 46, 34, { broken: true, burn: true, seed: 7011, wall: '#5e5040', doorAt: 0.6 }) + house(c, 290, 120, 44, 32, { seed: 7012, wall: '#5a4c3e' });
      o += house(c, -6, 122, 72, 50, { burn: true, seed: 7013 }) + house(c, 322, 122, 80, 54, { broken: true, burn: true, seed: 7014, wall: '#6a5a48', doorAt: 0.4 });
      o += L('M-2,122 L402,122', OL, 1.6);
      o += cobbles(c, 122, '#4a3a36', 7020);
      o += R(0, 122, 400, 20, c.lg([[0, '#ff6a1a', 0.18], [1, '#ff6a1a', 0]]));
      o += fountain(c, 196, 146, 0.86);
      o += lamp(c, 134, 132, -0.12, true) + lamp(c, 262, 130, 0.35, false);
      o += blaze(c, 16, 138, 0.7) + blaze(c, 386, 142, 0.8);
      o += rockChunk(c, 118, 170, 7, '#5a4c48', 7031) + rockChunk(c, 300, 186, 9, '#5a4c48', 7032) + rockChunk(c, 312, 180, 5, '#4a3e3a', 7033) + bone(76, 200, 16, 0.3, 1) + skull(c, 92, 196, 0.9);
      // a charred beam and a spilled crate of plagued grain
      o += limb('M338,208 L392,196', '#241612', 5) + L('M346,206 l8,-2 M364,202 l8,-2', FIRE, 1.4, 0.8) + flame(c, 372, 199, 0.4);
      o += body(c, rp(24, 178, 20, 14), '#6a4a2a', L('M24,185 L44,185 M34,178 L34,192', '#3a2414', 1.2), 1.6) + E(52, 192, 14, 3.4, '#b89a50', 1.2) + pebbles(7034, 190, 194, '#d8c070', 10, 40, 64);
      o += pebbles(7035, 140, 236, '#1e1414', 22, 0, 400);
      o += embers(c, 7036, 26, 0, 400, 120, 236);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ff8040', 0], [0.7, '#000', 0.12], [1, '#000', 0.5]]));
    },
    strat_bastion: function (c) {
      var o = R(0, 0, 400, 240, '#1a1214');
      o += blockWall(c, 0, 0, 400, 124, '#3e3436', 8101, 16);
      o += R(0, 0, 400, 124, c.lg([[0, '#0a0608', 0.85], [0.6, '#0a0608', 0.3], [1, '#ff6a1a', 0.1]]));
      // vault ribs between the columns
      var rib = 'M20,24 Q20,-4 58,-8 Q96,-4 96,24 M122,24 Q122,-8 200,-14 Q278,-8 278,24 M304,24 Q304,-4 342,-8 Q380,-4 380,24';
      o += L(rib, OL, 8) + L(rib, STONE, 4.4);
      o += stainedWindow(c, 200, 96, 66, 84, 8102, true) + stainedWindow(c, 58, 90, 26, 52, 8103) + stainedWindow(c, 342, 90, 26, 52, 8104);
      o += crBanner(c, 132, 14, 28, 84) + crBanner(c, 240, 14, 28, 84);
      o += gColumn(c, 98, 124, 22, 124) + gColumn(c, 280, 124, 22, 124) + gColumn(c, -4, 124, 22, 124) + gColumn(c, 382, 124, 22, 124);
      // the altar dais under the great window
      [[98, 124], [86, 117]].forEach(function (t, i) { o += body(c, pd([[200 - t[0], t[1]], [200 + t[0], t[1]], [200 + t[0] - 5, t[1] - 7], [200 - t[0] + 5, t[1] - 7]], true), i ? STONEL : STONE, F(rp(236, t[1] - 9, 70, 11), '#000', 0.3) + L('M' + pt([200 - t[0] + 5, t[1] - 7]) + 'L' + pt([200 + t[0] - 5, t[1] - 7]), GOLDD, 1.1), 1.6); });
      o += body(c, rp(174, 94, 52, 16), STONEL, F(rp(210, 92, 20, 20), '#000', 0.3), 1.6) + body(c, pd([[170, 92], [230, 92], [226, 110], [174, 110]], true), CR, F(rp(212, 90, 20, 24), CRD, 0.6) + L('M172,106 L228,106', GOLD, 1.4), 1.6) + emblem(c, 200, 100, 0.55);
      o += candleStand(c, 160, 110, 26) + candleStand(c, 240, 110, 26);
      o += brazier(c, 58, 124, 1) + brazier(c, 342, 124, 1);
      // a fallen banner and rubble from the fighting
      o += body(c, pd([[20, 120], [60, 116], [66, 122], [24, 124]], true), CRD, L('M24,121 L62,118', GOLD, 1.1), 1.4);
      o += checkFloor(c, 124, 200, '#241e22', '#5a1a22') + L('M-2,124 L402,124', OL, 1.6);
      o += P('M178,124 L222,124 L262,244 L138,244 Z', c.lg([[0, CRD], [1, CR]]), 1.6) + L('M183,124 L146,244 M217,124 L254,244', GOLD, 1.8);
      o += emblem(c, 200, 176, 1.3, GOLDD) + R(-2, 124, 404, 30, c.lg([[0, '#000', 0.35], [1, '#000', 0]]));
      o += rockChunk(c, 96, 196, 6, STONE, 8111) + rockChunk(c, 318, 206, 8, STONE, 8112) + rockChunk(c, 330, 200, 4.4, STONEL, 8113) + L('M296,214 l40,-6', '#3a2418', 4) + L('M300,213 l8,-1.2', '#6a4a2a', 1.4);
      o += embers(c, 8114, 16, 150, 250, 20, 110);
      return o + R(0, 0, 400, 240, c.rg([[0, '#ff8040', 0], [0.7, '#000', 0.12], [1, '#000', 0.52]]));
    },
    strat_ziggurat: function (c) {
      var o = sky(c, '#0c0810', '#2a1226', '#6a2420');
      o += E(260, 110, 200, 90, glow(c, PLG, 0.32)) + E(60, 118, 160, 40, glow(c, '#ff5a1a', 0.35));
      o += smoke(40, 100, 2.4, '#140a10', 0.55, 1) + smoke(370, 96, 2.4, '#140a10', 0.5, -0.6);
      o += skyline(c, 112, '#1c1018', 9001, PLG);
      o += ziggurat(c, 262, 122, 0.98);
      o += slaughterhouse(c, 6, 122, 104, 58);
      // the bone fence along the right edge
      for (var fx = 352; fx < 404; fx += 11) o += boneSpike(c, fx, 124, 1, 24 + (fx % 3) * 4);
      o += L('M-2,122 L402,122', OL, 1.6);
      o += cobbles(c, 122, '#2e2a2c', 9020) + R(0, 122, 400, 22, c.lg([[0, PLG, 0.07], [1, PLG, 0]]));
      o += cauldron(c, 176, 150, 1);
      o += slime(c, 120, 178, 16) + slime(c, 300, 196, 22) + slime(c, 232, 150, 10) + slime(c, 60, 214, 12);
      o += bone(146, 176, 16, 0.4, 1) + bone(330, 158, 14, -0.5, 0.9) + skull(c, 356, 170, 1, PLG) + skull(c, 94, 150, 0.8) + bone(260, 222, 18, 0.2, 1.1) + skull(c, 30, 196, 1, PLG);
      o += pebbles(9031, 140, 236, '#161214', 20, 0, 400);
      o += mist(c, 132, 30, '#6aff3a', 0.08, 9032) + motes(9033, 26, 150, 380, 30, 130, PLGL);
      return o + R(0, 0, 400, 240, c.rg([[0, '#8aff4a', 0], [0.7, '#000', 0.14], [1, '#000', 0.52]]));
    }
  };

  // ============================================================
  //  MOB PIECES
  // ============================================================
  // the Crimson Unmaking's closed helm: a pointed bascinet in crimson lacquer, gold brow band, nasal and finial.
  // o.mask gives the conjurors a gold face-plate with burning eye slits
  function pointHelm(c, x, y, o) {
    o = o || {};
    var hm = o.helmCol || CR, tr = GOLD, s = '';
    if (o.hood) s += P('M' + pt([x + 4, y - 16]) + 'C' + pt([x + 16, y - 14]) + ' ' + pt([x + 22, y + 2]) + ' ' + pt([x + 20, y + 18]) + 'L' + pt([x + 6, y + 18]) + 'Z', c.cel(o.hood), 1.8);
    var hd = 'M' + pt([x - 13, y + 12]) + 'L' + pt([x - 14, y - 4]) + 'C' + pt([x - 14, y - 12]) + ' ' + pt([x - 6, y - 18]) + ' ' + pt([x, y - 23]) + 'C' + pt([x + 6, y - 18]) + ' ' + pt([x + 13, y - 12]) + ' ' + pt([x + 13, y - 4]) + 'L' + pt([x + 13, y + 12]) + 'Z';
    s += body(c, hd, hm, F(pd([[x + 3, y - 26], [x + 16, y - 26], [x + 16, y + 16], [x + 3, y + 16]], true), dk(hm, 0.32), 0.75) + L('M' + pt([x - 2, y - 21]) + 'C' + pt([x - 6, y - 16]) + ' ' + pt([x - 10, y - 11]) + ' ' + pt([x - 11, y - 6]), lt(hm, 0.35), 1.4, 0.8), 2);
    if (o.mask) {
      s += body(c, 'M' + pt([x - 14, y - 6]) + 'L' + pt([x - 1, y - 6]) + 'L' + pt([x + 1, y + 12]) + 'L' + pt([x - 13, y + 12]) + 'Z', GOLD, F(rp(x - 4, y - 8, 8, 22), GOLDD, 0.7), 1.6);
      s += C(x - 7, y - 1, 6, glow(c, EMB, 0.8)) + P(pd([[x - 13, y - 2.6], [x - 3, y - 2], [x - 3, y + 0.2], [x - 13, y - 0.4]], true), c.lg([[0, FIREY], [1, FIRE]]), 0.9) + L('M' + pt([x - 11, y + 5]) + 'L' + pt([x - 4, y + 5.4]), GOLDD, 1.1) + L('M' + pt([x - 8, y - 2]) + 'L' + pt([x - 8, y + 11]), GOLDD, 0.8, 0.8);
    } else {
      s += R(x - 14, y - 3.2, 12, 3.2, '#120c0a', 0) + L('M' + pt([x - 14, y + 0.6]) + 'L' + pt([x - 2, y + 0.6]), tr, 1.2) + L('M' + pt([x - 8, y - 6]) + 'L' + pt([x - 8, y + 12]), tr, 2) + C(x - 11.5, y + 5, 0.9, '#120c0a') + C(x - 11.5, y + 8.4, 0.9, '#120c0a') + C(x - 4.5, y + 6.6, 0.9, '#120c0a');
    }
    s += L('M' + pt([x - 14, y - 6]) + 'L' + pt([x + 13, y - 6]), OL, 3.8) + L('M' + pt([x - 14, y - 6]) + 'L' + pt([x + 13, y - 6]), tr, 2.2) + L('M' + pt([x - 13, y + 12]) + 'L' + pt([x + 13, y + 12]), OL, 3.6) + L('M' + pt([x - 13, y + 12]) + 'L' + pt([x + 13, y + 12]), tr, 1.8);
    s += P(pd([[x - 2.2, y - 21], [x, y - 29], [x + 2.2, y - 21]], true), c.cel(tr), 1.2) + C(x, y - 21.6, 2.2, c.cel(tr), 1.1);
    return s + emblem(c, x + 5, y - 11, 0.38);
  }
  // an unhelmed human head, for the archivist (a copy of art_scarlet.js smHead, trimmed)
  function hHead(c, x, y, o) {
    var sk = o.skin || '#e8b890', hc = o.hair || '#5a3a22', s = '';
    if (o.backHat) s += o.backHat(c, x, y);
    s += E(x + 7, y + 1, 2.8, 3.8, c.cel(sk), 1.6);
    var d = 'M' + pt([x - 9, y - 8]) + 'C' + pt([x - 8, y - 14]) + ' ' + pt([x + 8, y - 15]) + ' ' + pt([x + 10, y - 6]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 9, y + 10]) + ' ' + pt([x + 2, y + 13]) + ' ' + pt([x - 4, y + 12]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 13, y + 1]) + 'L' + pt([x - 10, y - 2]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 14]) + 'L' + pt([x + 1, y + 14]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.2), 0.8) +
      (o.old ? L('M' + pt([x - 9, y + 1]) + 'l2.4,1.4 M' + pt([x - 6, y - 10]) + 'l7,-0.6 M' + pt([x - 5, y - 12.4]) + 'l5,-0.4', dk(sk, 0.32), 0.9) : ''), 2);
    s += P('M' + pt([x + 3, y - 8]) + 'C' + pt([x + 9, y - 9]) + ' ' + pt([x + 12, y - 4]) + ' ' + pt([x + 11, y + 4]) + 'L' + pt([x + 8, y + 2]) + 'C' + pt([x + 7, y - 2]) + ' ' + pt([x + 5, y - 5]) + ' ' + pt([x + 3, y - 8]) + 'Z', c.cel(hc), 1.2);
    s += C(x - 5, y - 1.6, 1.7, OL) + C(x - 5.5, y - 2.2, 0.5, '#fff') + L('M' + pt([x - 9, y - 5.6]) + 'L' + pt([x - 1, y - 5]), o.brow || dk(hc, 0.2), 2);
    if (o.longBeard) s += body(c, 'M' + pt([x - 11, y + 4]) + 'C' + pt([x - 13, y + 18]) + ' ' + pt([x - 7, y + 32]) + ' ' + pt([x - 3, y + 40]) + 'C' + pt([x + 1, y + 30]) + ' ' + pt([x + 7, y + 20]) + ' ' + pt([x + 9, y + 6]) + 'L' + pt([x + 7, y + 3]) + 'C' + pt([x + 2, y + 9]) + ' ' + pt([x - 4, y + 9]) + ' ' + pt([x - 11, y + 4]) + 'Z', o.longBeard,
      L('M' + pt([x - 6, y + 12]) + 'Q' + pt([x - 6, y + 24]) + ' ' + pt([x - 3, y + 34]) + 'M' + pt([x, y + 12]) + 'Q' + pt([x + 1, y + 22]) + ' ' + pt([x - 1, y + 30]), dk(o.longBeard, 0.2), 1) + F('M' + pt([x + 1, y + 2]) + 'L' + pt([x + 12, y + 2]) + 'L' + pt([x + 6, y + 30]) + 'Z', dk(o.longBeard, 0.18), 0.8), 1.6) +
      P('M' + pt([x - 12, y + 6]) + 'C' + pt([x - 10, y + 3]) + ' ' + pt([x - 3, y + 3]) + ' ' + pt([x + 1, y + 6]) + 'C' + pt([x - 3, y + 6]) + ' ' + pt([x - 8, y + 6]) + ' ' + pt([x - 12, y + 9]) + 'Z', c.cel(lt(o.longBeard, 0.2)), 1.1);
    if (o.specs) s += L(ellD(x - 6, y - 1.4, 3.2, 2.8), OL, 2.4) + L(ellD(x - 6, y - 1.4, 3.2, 2.8), GOLD, 1.1) + C(x - 6.8, y - 2.4, 1, '#ffffff', 0, 0.7) + L('M' + pt([x - 2.8, y - 2]) + 'L' + pt([x + 6, y - 2]), OL, 1.8) + L('M' + pt([x - 2.8, y - 2]) + 'L' + pt([x + 6, y - 2]), GOLD, 0.8);
    if (o.hat) s += o.hat(c, x, y);
    return s;
  }
  // the archivist's crimson chaperon: a padded roll with a gold band and a hanging liripipe
  function chaperon(c, x, y) {
    var T = taper([[x + 8, y - 12], [x + 17, y - 8], [x + 21, y + 4], [x + 19, y + 20]], 8, 4, 5);
    var s = P(T.d, c.cel(CRD), 1.6) + L(along(T, 0.5), dk(CRD, 0.3), 1);
    s += body(c, 'M' + pt([x - 10, y - 8]) + 'C' + pt([x - 14, y - 22]) + ' ' + pt([x + 2, y - 30]) + ' ' + pt([x + 14, y - 18]) + 'C' + pt([x + 16, y - 12]) + ' ' + pt([x + 14, y - 8]) + ' ' + pt([x + 12, y - 6]) + 'Z', CR, F(rp(x + 3, y - 32, 14, 28), CRD, 0.7) + L('M' + pt([x - 6, y - 12]) + 'C' + pt([x - 4, y - 22]) + ' ' + pt([x + 4, y - 24]) + ' ' + pt([x + 8, y - 18]), dk(CR, 0.3), 1.1), 1.8);
    s += P('M' + pt([x - 13, y - 5]) + 'C' + pt([x - 14, y - 12]) + ' ' + pt([x + 14, y - 13]) + ' ' + pt([x + 15, y - 6]) + 'C' + pt([x + 15, y - 1]) + ' ' + pt([x - 13, y + 0]) + ' ' + pt([x - 13, y - 5]) + 'Z', c.cel(CRD), 1.8) + L('M' + pt([x - 12, y - 6]) + 'C' + pt([x - 6, y - 9]) + ' ' + pt([x + 8, y - 9]) + ' ' + pt([x + 14, y - 6]), GOLD, 1.6);
    return s + emblem(c, x - 7, y - 5, 0.3);
  }
  function robe(c, col, trim, o) {
    o = o || {};
    var hem = o.hem || 117, s = boot(52, 121, o.boots || '#3a2a1e') + boot(74, 121, dk(o.boots || '#3a2a1e', 0.15));
    var d = 'M47,80 L81,80 C85,94 90,106 93,' + hem + ' L35,' + hem + ' C38,106 42,94 47,80 Z';
    s += body(c, d, col, F('M70,78 L98,78 L98,122 L76,122 C78,106 76,92 70,78 Z', dk(col, 0.26), 0.8) + L('M56,90 L48,' + (hem - 2) + ' M64,90 L63,' + (hem - 2) + ' M74,90 L80,' + (hem - 2), dk(col, 0.24), 1.1) +
      (trim ? L('M36,' + (hem - 2.4) + ' L92,' + (hem - 2.4), trim, 3) + L('M38,' + (hem - 8) + ' L90,' + (hem - 8), trim, 1.3) : '') + (o.panel ? F(pd([[58, 80], [70, 80], [72, hem], [56, hem]], true), o.panel) + (trim ? L('M58,80 L56,' + hem + ' M70,80 L72,' + hem, trim, 1.4) : '') : ''), 2);
    return s;
  }
  function tsD(x, y, w, h, k) { return 'M' + pt([x - w, y - h + 7 * k]) + 'Q' + pt([x, y - h - 5 * k]) + ' ' + pt([x + w, y - h + 7 * k]) + 'L' + pt([x + w, y + h - 9 * k]) + 'Q' + pt([x, y + h + 4 * k]) + ' ' + pt([x - w, y + h - 9 * k]) + 'Z'; }
  // the guardsman's tower shield: gold rim, crimson field, the emblem, rivets
  function towerShield(c, x, y, k) {
    var o = P(tsD(x, y, 15 * k, 30 * k, k), c.cel(GOLD), 2);
    o += body(c, tsD(x, y, 12.2 * k, 27.2 * k, k), CR, F(rp(x + 4 * k, y - 36 * k, 14 * k, 72 * k), CRD, 0.6) + L('M' + pt([x - 8 * k, y - 22 * k]) + 'L' + pt([x - 8 * k, y + 18 * k]), lt(CR, 0.25), 1.2, 0.7), 1.2);
    o += L('M' + pt([x, y - 26 * k]) + 'L' + pt([x, y + 24 * k]), OL, 4.6 * k) + L('M' + pt([x, y - 26 * k]) + 'L' + pt([x, y + 24 * k]), GOLD, 2.6 * k);
    o += emblem(c, x, y - 4 * k, 1.2 * k);
    [[-10, -20], [10, -20], [-10, 16], [10, 16]].forEach(function (r) { o += C(x + r[0] * k, y + r[1] * k, 1.4 * k, c.cel(GOLD), 0.8); });
    return o + C(x - 10 * k, y - 26 * k, 1.4, '#ffffff', 0, 0.7);
  }
  function halberd(c, bot, top) {
    var dx = top[0] - bot[0], dy = top[1] - bot[1], len = Math.sqrt(dx * dx + dy * dy), q = dirQ(bot, Math.atan2(dy, dx)), d = 'M' + pt(q(0, 0)) + 'L' + pt(q(len - 4, 0));
    var o = limb(d, '#4a2a1a', 3.4) + L(d, '#7a5234', 1, 0.6);
    o += P('M' + pt(q(len - 6, -2)) + 'L' + pt(q(len - 3, -9)) + 'L' + pt(q(len, -17)) + 'Q' + pt(q(len - 12, -22)) + ' ' + pt(q(len - 26, -17)) + 'L' + pt(q(len - 22, -9)) + 'L' + pt(q(len - 20, -2)) + 'Z', c.cel(STEEL), 1.6);
    o += L('M' + pt(q(len - 1, -16)) + 'Q' + pt(q(len - 12, -20.4)) + ' ' + pt(q(len - 24, -16)), '#ffffff', 1, 0.7);
    o += P(pd([q(len - 16, 2), q(len - 20, 11), q(len - 22, 2)], true), c.cel(STEEL), 1.3) + P(pd([q(len - 4, -3), q(len + 16, 0), q(len - 4, 3)], true), c.cel(STEEL), 1.4);
    o += P(pd([q(len - 24, -3), q(len - 3, -3), q(len - 3, 3), q(len - 24, 3)], true), c.cel(GOLD), 1.2);
    return o + P(pd([q(len - 26, 1), q(len - 30, 5), q(len - 40, 3), q(len - 34, 1)], true), c.cel(CR), 1) + P(pd([q(len - 26, -1), q(len - 32, -6), q(len - 42, -3), q(len - 34, -1)], true), c.cel(CRD), 1);
  }
  // a gold ring of conjuring runes around a flame core
  function conjure(c, x, y, s) {
    var o = C(x, y, 24 * s, glow(c, EMB, 0.75)), tk = '';
    for (var i = 0; i < 8; i++) { var a = i * PI / 4 + 0.2; tk += 'M' + pt([x + Math.cos(a) * 11 * s, y + Math.sin(a) * 11 * s]) + 'L' + pt([x + Math.cos(a) * 15 * s, y + Math.sin(a) * 15 * s]); }
    o += ring(x, y, 13 * s, 13 * s, GOLD, 1.8 * s) + L(tk, OL, 3 * s) + L(tk, GOLD, 1.4 * s) + ring(x, y, 8.4 * s, 8.4 * s, FIREY, 0.9 * s);
    o += flame(c, x, y + 6 * s, 0.62 * s, FIRE, FIREY) + C(x, y + 1 * s, 2.6 * s, '#fff6d0', 0, 0.95);
    return o + C(x + 16 * s, y - 8 * s, 1.4 * s, FIREY) + C(x - 15 * s, y + 9 * s, 1.2 * s, FIREY) + C(x - 4 * s, y - 17 * s, 1.1 * s, '#fff0a0');
  }
  function torchIn(c, p) {
    var tip = [p[0] - 4, p[1] - 16];
    return limb('M' + pt([p[0] + 2, p[1] + 9]) + 'L' + pt(tip), '#5a3a22', 3) + P(pd([[tip[0] - 3.6, tip[1] + 4], [tip[0] + 3.6, tip[1] + 4], [tip[0] + 2.6, tip[1] - 1], [tip[0] - 2.6, tip[1] - 1]], true), c.cel('#3a2a22'), 1.2) +
      C(tip[0], tip[1] - 8, 22, glow(c, EMB, 0.7)) + flame(c, tip[0], tip[1], 0.72) + motes(6101, 6, tip[0] - 12, tip[0] + 10, tip[1] - 30, tip[1] - 12, '#ffd080');
  }
  function book(c, x, y, w, h, ang, col) {
    var q = dirQ([x, y], ang), d = pd([q(-w / 2, -h / 2), q(w / 2, -h / 2), q(w / 2, h / 2), q(-w / 2, h / 2)], true);
    return P(d, c.cel(col), 1.4) + P(pd([q(-w / 2 + 2, h / 2 - 2.6), q(w / 2 - 1, h / 2 - 2.6), q(w / 2 - 1, h / 2), q(-w / 2 + 2, h / 2)], true), '#efe4c4', 0.9) + L('M' + pt(q(-w / 2 + 3, -h / 2)) + 'L' + pt(q(-w / 2 + 3, h / 2 - 2.6)), GOLD, 1.1);
  }
  // Hollow Host rig bits
  function boneLimb(pts, w) { var d = pd(pts), o = L(d, OL, w + 3.8) + L(d, BONE, w) + L(d, lt(BONE, 0.4), w * 0.3, 0.6); for (var i = 1; i < pts.length - 1; i++) o += C(pts[i][0], pts[i][1], w * 0.72, BONE, 1.2); return o; }
  function boneFoot(x, y) { return P('M' + pt([x + 4, y - 5]) + 'L' + pt([x + 5, y + 1]) + 'L' + pt([x - 9, y + 1]) + 'C' + pt([x - 9, y - 2]) + ' ' + pt([x - 6, y - 3]) + ' ' + pt([x - 3, y - 3]) + 'L' + pt([x - 2, y - 5]) + 'Z', BONE, 1.6) + L('M' + pt([x - 6, y - 1]) + 'l0,2 M' + pt([x - 3, y - 1]) + 'l0,2', BONED, 0.9); }
  function spikedPad(c, x, y, r, col, sp) {
    var o = '';
    [[-0.7, 1.05], [-0.1, 1.2], [0.5, 1.0]].forEach(function (k) { var a = -PI / 2 + k[0], b = [x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55], q = dirQ(b, a); o += P(pd([q(0, -3.4), q(r * k[1], 0), q(0, 3.4)], true), c.cel(sp || '#8a8e9a'), 1.3); });
    return o + pauldron(c, x, y, r, col, lt(col, 0.3)) + pauldron(c, x - 1, y + 5, r * 0.7, dk(col, 0.1));
  }
  function scourgeShield(c, x, y, k) {
    var d = pd([[x, y - 26 * k], [x + 14 * k, y - 18 * k], [x + 14 * k, y + 8 * k], [x, y + 24 * k], [x - 14 * k, y + 8 * k], [x - 14 * k, y - 18 * k]], true);
    var d2 = pd([[x, y - 21 * k], [x + 10 * k, y - 15 * k], [x + 10 * k, y + 6 * k], [x, y + 19 * k], [x - 10 * k, y + 6 * k], [x - 10 * k, y - 15 * k]], true);
    return C(x, y, 26 * k, glow(c, PLG, 0.3)) + body(c, d, BLK, F(rp(x + 2 * k, y - 30 * k, 16 * k, 60 * k), BLKX, 0.6), 2) + L(d2, PLG, 2.4 * k, 0.4) + L(d2, PLG, 1.2 * k) + skull(c, x, y - 2 * k, 1.1 * k, PLG) +
      P(pd([[x - 14 * k, y - 18 * k], [x - 20 * k, y - 24 * k], [x - 12 * k, y - 22 * k]], true), c.cel(BONE), 1.1) + P(pd([[x + 14 * k, y - 18 * k], [x + 20 * k, y - 24 * k], [x + 12 * k, y - 22 * k]], true), c.cel(BONE), 1.1);
  }
  function notchSword(c, p, len, ang, glowCol) {
    var q = dirQ(p, ang), o = limb('M' + pt(q(-9, 0)) + 'L' + pt(q(3, 0)), '#3a2a2e', 3.2) + C(q(-10, 0)[0], q(-10, 0)[1], 2.4, c.cel(BLKL), 1);
    o += L('M' + pt(q(3, -6)) + 'L' + pt(q(3, 6)), OL, 5) + L('M' + pt(q(3, -6)) + 'L' + pt(q(3, 6)), BLKL, 3);
    var bd = pd([q(5, -3.4), q(len * 0.4, -3.6), q(len * 0.45, -1.8), q(len * 0.52, -3.8), q(len - 7, -3.6), q(len, 0), q(len - 7, 3.8), q(len * 0.66, 3.6), q(len * 0.6, 1.6), q(len * 0.55, 3.8), q(5, 3.4)], true);
    return o + (glowCol ? L('M' + pt(q(8, 0)) + 'L' + pt(q(len - 6, 0)), glowCol, 7, 0.25) : '') + P(bd, c.cel('#6a6e7a'), 1.5) + L('M' + pt(q(8, 0)) + 'L' + pt(q(len - 8, 0)), glowCol || dk('#6a6e7a', 0.3), 1.2);
  }
  // Baron Mortvale's runeblade: broad dark blade, spiked guard, a skull pommel, frost runes down the middle
  function runeblade(c, p, len, ang, w) {
    var q = dirQ(p, ang), o = '';
    o += limb('M' + pt(q(-13, 0)) + 'L' + pt(q(4, 0)), '#2a2230', 3.8) + L('M' + pt(q(-11, 0)) + 'L' + pt(q(2, 0)), BLKL, 1, 0.8);
    var pm = q(-16, 0);
    o += skull(c, pm[0], pm[1] + 1.4, 0.55, RUNE);
    o += L(pd([q(len * 0.2, 0), q(len - 4, 0)]), RUNE, w * 3.2, 0.18);
    var bd = pd([q(8, -w), q(len * 0.36, -w * 1.08), q(len * 0.42, -w * 1.5), q(len * 0.48, -w * 1.08), q(len - w * 2.4, -w * 0.95), q(len, 0), q(len - w * 2.4, w * 0.95), q(len * 0.58, w * 1.1), q(len * 0.52, w * 1.5), q(len * 0.46, w * 1.1), q(8, w)], true);
    o += body(c, bd, '#5a6278', F(pd([q(0, 0), q(len + 4, 0), q(len + 4, w * 2), q(0, w * 2)], true), '#2a3040', 0.65), 1.8);
    var rn = '';
    for (var u = 14; u < len - 12; u += 8) { var a = q(u, -1.6), b = q(u + 4, 1.6), m = q(u + 2, 0); rn += 'M' + pt(a) + 'L' + pt(m) + 'L' + pt(q(u, 1.6)) + 'M' + pt(m) + 'L' + pt(b); }
    o += L(rn, RUNE, 2.4, 0.45) + L(rn, RUNE, 1.3) + L(rn, RUNEL, 0.5);
    o += L('M' + pt(q(10, -w + 1)) + 'L' + pt(q(len - w * 2.6, -w * 0.8)), '#c8d4e8', 0.9, 0.7);
    var g1 = q(6, -12), g2 = q(6, 12);
    o += L('M' + pt(g1) + 'L' + pt(g2), OL, 6.2) + L('M' + pt(g1) + 'L' + pt(g2), BLKL, 3.8) + P(pd([q(4, -11), q(14, -16), q(8, -8)], true), c.cel('#8a8e9a'), 1.2) + P(pd([q(4, 11), q(14, 16), q(8, 8)], true), c.cel('#8a8e9a'), 1.2) + C(q(6, 0)[0], q(6, 0)[1], 2.6, c.cel(RUNE), 1);
    return C(q(len * 0.6, 0)[0], q(len * 0.6, 0)[1], len * 0.5, glow(c, RUNE, 0.25)) + o;
  }
  function hoof(x, y, col) { return P('M' + pt([x + 4, y - 8]) + 'L' + pt([x + 5, y + 1]) + 'L' + pt([x - 7, y + 1]) + 'C' + pt([x - 8, y - 3]) + ' ' + pt([x - 6, y - 6]) + ' ' + pt([x - 3, y - 8]) + 'Z', c_(col), 2) + L('M' + pt([x - 2, y - 3]) + 'L' + pt([x - 3, y + 1]), OL, 1.2); }
  // a bat wing from shoulder s: the arm bone runs to the wrist w, fingers to the tips, the membrane scallops between
  function batWing(c, s, w, tips, back, col, bone) {
    var pts = [s, w].concat(tips).concat([back]), d = 'M' + pt(s) + 'L' + pt(w) + 'L' + pt(tips[0]);
    for (var i = 1; i < tips.length; i++) { var a = tips[i - 1], b = tips[i], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cx = m[0] + (w[0] - m[0]) * 0.3, cy = m[1] + (w[1] - m[1]) * 0.3; d += 'Q' + pt([cx, cy]) + ' ' + pt(b); }
    var la = tips[tips.length - 1], mb = [(la[0] + back[0]) / 2, (la[1] + back[1]) / 2];
    d += 'Q' + pt([mb[0] + (w[0] - mb[0]) * 0.25, mb[1] + (w[1] - mb[1]) * 0.25]) + ' ' + pt(back) + 'Z';
    var f = ''; tips.forEach(function (t) { f += 'M' + pt(w) + 'L' + pt(t); });
    pts = null;
    return body(c, d, col, F(pd([[w[0], w[1]], tips[1], back, s], true), dk(col, 0.25), 0.6), 2) + L('M' + pt(s) + 'L' + pt(w), OL, 5.6) + L('M' + pt(s) + 'L' + pt(w), bone, 3.4) + L(f, OL, 3.2) + L(f, bone, 1.6) + P(pd([[w[0] - 2, w[1] + 1], [w[0] + 1, w[1] - 7], [w[0] + 3, w[1] + 1]], true), c.cel('#d8d0c0'), 1);
  }
  function dreadHead(c, x, y) {
    var sk = '#8a64aa', s = '';
    var H2 = taper([[x + 8, y - 10], [x + 16, y - 20], [x + 22, y - 28], [x + 16, y - 34]], 6.4, 1.4, 5);
    s += P(H2.d, c.cel('#1e1620'), 1.5);
    s += P(pd([[x + 5, y - 3], [x + 24, y - 13], [x + 8, y + 4]], true), c.cel(dk(sk, 0.1)), 1.6) + L('M' + pt([x + 8, y - 2]) + 'L' + pt([x + 19, y - 10]), dk(sk, 0.4), 1);
    var d = 'M' + pt([x - 10, y - 8]) + 'C' + pt([x - 9, y - 15]) + ' ' + pt([x + 8, y - 16]) + ' ' + pt([x + 10, y - 7]) + 'L' + pt([x + 10, y + 4]) + 'C' + pt([x + 8, y + 10]) + ' ' + pt([x + 1, y + 14]) + ' ' + pt([x - 5, y + 17]) + 'C' + pt([x - 8, y + 11]) + ' ' + pt([x - 10, y + 7]) + ' ' + pt([x - 10, y + 3]) + 'L' + pt([x - 14, y]) + 'L' + pt([x - 10, y - 3]) + 'Z';
    s += body(c, d, sk, F('M' + pt([x + 3, y - 16]) + 'L' + pt([x + 14, y - 16]) + 'L' + pt([x + 14, y + 18]) + 'L' + pt([x, y + 18]) + 'C' + pt([x + 6, y + 6]) + ' ' + pt([x + 6, y - 6]) + ' ' + pt([x + 3, y - 16]) + 'Z', dk(sk, 0.25), 0.8) + L('M' + pt([x - 6, y + 3]) + 'L' + pt([x - 1, y + 7]) + 'M' + pt([x + 2, y - 8]) + 'L' + pt([x + 5, y - 2]), FEL, 1.2, 0.9), 2);
    s += P(pd([[x - 11, y - 7], [x - 1, y - 9], [x + 2, y - 5], [x - 9, y - 4]], true), c.cel(dk(sk, 0.35)), 1.3);
    s += gEye(c, x - 5, y - 3, 1.8, FEL) + L('M' + pt([x - 10, y + 8]) + 'L' + pt([x - 2, y + 9]), OL, 1.6) + P(pd([[x - 9, y + 8], [x - 8, y + 11.4], [x - 7, y + 8.2]], true) + pd([[x - 5, y + 8.6], [x - 4, y + 11.6], [x - 3, y + 8.8]], true), '#f4ecd8', 0.8);
    var H1 = taper([[x - 1, y - 12], [x + 6, y - 22], [x + 14, y - 28], [x + 8, y - 36]], 7.6, 1.4, 5);
    return s + P(H1.d, c.cel('#2e2430'), 1.6) + L(bands(H1, 3), '#5a4a5a', 1);
  }
  function ribs(x0, y0, x1, n0, gap, col, w) { var d = ''; for (var i = 0; i < n0; i++) { var y = y0 + i * gap; d += 'M' + pt([x0, y]) + 'Q' + pt([(x0 + x1) / 2, y - 5]) + ' ' + pt([x1, y + 3]); } return L(d, OL, w + 2) + L(d, col, w); }
  function stitchLine(d, col) { return L(d, OL, 2) + L(d, col || '#1a1414', 1); }

  // ============================================================
  //  MOBS
  // ============================================================
  var MOBS = {
    crimson_guardsman: function (c) {
      return biped(c, {
        skin: '#d8a080', shirt: CR, sleeve: CR, forearm: CRD, glove: CRD, pants: '#3a3440', boots: CRD, legW: 11.5, armW: 10, shadowR: 36, neck: false, hx: 58, hy: 35,
        head: function (c, x, y) { return pointHelm(c, x, y, {}); },
        chest: function (c) { return L('M48,52 Q64,60 80,52', GOLD, 2) + L('M64,58 L64,82', dk(CR, 0.35), 1.4) + L('M50,76 Q64,82 78,76', dk(CR, 0.35), 1.2) + emblem(c, 64, 68, 0.72); },
        front: function (c) { return body(c, 'M47,84 L81,84 L84,101 L64,105 L44,101 Z', CR, F(rp(70, 82, 20, 26), CRD, 0.6) + L('M56,86 L54,102 M72,86 L74,102', dk(CR, 0.35), 1.1), 1.8) + L('M45,100 L64,104 L83,100', GOLD, 1.8) + P(rp(48, 81, 32, 6), c.cel(BLK), 1.6) + R(60, 80, 8, 8, c.cel(GOLD), 1.3); },
        shins: function (c) { return P('M66,103 L77,103 L77,115 L67,115 Z', c.cel(dk(CR, 0.15)), 1.4) + P('M47,103 L58,103 L57,115 L48,115 Z', c.cel(CR), 1.4) + C(72, 103, 3.4, c.cel(GOLD), 1.2) + C(52.5, 103, 3.8, c.cel(GOLD), 1.2); },
        pads: function (c) { return pauldron(c, 82, 50, 12, CR, GOLD) + pauldron(c, 46, 52, 14, CR, GOLD) + C(46, 47, 1.6, c.cel(GOLD), 0.8); },
        near: [[48, 56], [40, 70], [36, 80]], nearHand: gauntlet(CRD), wNearFront: function (c, p) { return towerShield(c, p[0] - 7, p[1] + 3, 1); },
        far: [[80, 54], [92, 64], [96, 52]], farHand: gauntlet(dk(CRD, 0.1)), wFar: function (c, p) { return halberd(c, [p[0] + 2, 120], [p[0] - 2, 8]); }
      });
    },
    crimson_conjuror: function (c) {
      var rb = '#8e1424';
      return biped(c, {
        skin: '#e0b090', shirt: rb, sleeve: rb, forearm: rb, glove: '#3a2020', noLegs: true, armW: 10, hx: 58, hy: 35, neck: false,
        head: function (c, x, y) { return pointHelm(c, x, y, { mask: true, hood: CRD }); },
        chest: function (c) { return L('M48,52 L64,66 L80,52', GOLD, 2) + L('M64,66 L64,80', GOLD, 1.4) + emblem(c, 64, 72, 0.5); },
        front: function (c) { return robe(c, rb, GOLD, { panel: CRD }) + P(rp(47, 78, 34, 5), c.cel(GOLD), 1.3) + emblem(c, 64, 100, 0.62); },
        pads: function (c) { return body(c, 'M38,58 C38,46 50,42 64,44 C78,42 90,46 90,58 L85,64 L80,59 L73,66 L64,60 L55,66 L48,59 L43,64 Z', CR, F(rp(70, 40, 24, 30), CRD, 0.6), 1.8) + L('M40,59 L43,63 L48,58 L55,65 L64,59 L73,65 L80,58 L85,63 L88,59', GOLD, 1.5); },
        near: [[48, 56], [36, 52], [26, 44]], nearHand: gauntlet('#3a2020'), wNearFront: function (c, p) { return conjure(c, p[0] - 10, p[1] - 13, 1); },
        far: [[80, 56], [88, 70], [88, 82]], farHand: gauntlet('#2e1a1a'), wFar: function (c, p) { return limb('M' + pt([p[0] + 3, p[1] + 16]) + 'L' + pt([p[0] - 3, p[1] - 22]), GOLDD, 2.4) + C(p[0] - 3, p[1] - 26, 10, glow(c, EMB, 0.7)) + P(pd([[p[0] - 8, p[1] - 22], [p[0] + 2, p[1] - 22], [p[0] + 4, p[1] - 30], [p[0] - 1, p[1] - 27], [p[0] - 3, p[1] - 32], [p[0] - 5, p[1] - 27], [p[0] - 10, p[1] - 30]], true), c.cel(GOLD), 1.2) + C(p[0] - 3, p[1] - 25, 2, c.cel(CRL), 0.9); }
      });
    },
    skeletal_guardian: function (c) {
      var o = shadow(c, 64, 34);
      // far arm raising a notched black sword upright beside the head
      o += boneLimb([[80, 54], [94, 52], [100, 44]], 4) + notchSword(c, [100, 44], 38, -PI / 2 + 0.12, PLG) + C(100, 44, 4, BONE, 1.6);
      // legs, pelvis, tattered loincloth
      o += boneLimb([[70, 88], [73, 104], [74, 116]], 4.4) + boneFoot(76, 121) + boneLimb([[58, 88], [54, 104], [52, 116]], 4.6) + boneFoot(53, 121);
      o += P('M54,90 L76,90 L78,104 L72,100 L68,108 L63,100 L57,106 Z', c.cel('#3a2a44'), 1.4);
      o += P('M52,86 C52,80 76,80 76,86 L72,93 L64,90 L56,93 Z', c.cel(BONE), 1.6);
      // the bare ribcage under a black iron gorget with a green rune
      o += L('M64,54 L64,86', OL, 5.4) + L('M64,54 L64,86', BONE, 3) + ribs(48, 58, 80, 4, 5.4, BONE, 2.2) + L('M64,58 L64,78', BONED, 1);
      o += body(c, 'M46,50 C52,45 76,45 82,50 L80,57 C72,60 56,60 48,57 Z', BLK, F(rp(70, 44, 16, 18), BLKX, 0.6) + L('M52,53 L76,53', PLG, 1.2), 1.8);
      o += spikedPad(c, 82, 51, 9, BLK, BONE);
      // skull in an open horned helm
      var x = 56, y = 34;
      o += body(c, 'M' + pt([x - 11, y + 2]) + 'C' + pt([x - 12, y - 14]) + ' ' + pt([x + 10, y - 16]) + ' ' + pt([x + 11, y - 2]) + 'L' + pt([x + 9, y + 6]) + 'L' + pt([x + 3, y + 7]) + 'L' + pt([x + 2, y + 12]) + 'L' + pt([x - 8, y + 12]) + 'L' + pt([x - 9, y + 7]) + 'L' + pt([x - 13, y + 5]) + 'Z', BONE, F(rp(x + 2, y - 18, 14, 34), BONED, 0.7), 1.8);
      o += E(x - 6, y, 3, 3.4, OL) + E(x + 1, y, 2.6, 3.2, OL) + gEye(c, x - 6, y, 1.2, PLG) + gEye(c, x + 1, y, 1.1, PLG) + P(pd([[x - 11, y + 4], [x - 9, y + 2], [x - 8, y + 5]], true), OL, 0.6);
      o += L('M' + pt([x - 8, y + 9]) + 'L' + pt([x + 1, y + 9]) + 'M' + pt([x - 6, y + 7]) + 'l0,4 M' + pt([x - 3, y + 7]) + 'l0,4 M' + pt([x, y + 7]) + 'l0,4', OL, 1);
      o += body(c, 'M' + pt([x - 12, y - 5]) + 'C' + pt([x - 13, y - 18]) + ' ' + pt([x + 11, y - 20]) + ' ' + pt([x + 13, y - 5]) + 'L' + pt([x + 13, y + 7]) + 'L' + pt([x + 7, y + 5]) + 'L' + pt([x + 6, y - 5]) + 'Z', BLK, F(rp(x + 3, y - 22, 14, 32), BLKX, 0.6) + L('M' + pt([x - 8, y - 14]) + 'C' + pt([x - 2, y - 17]) + ' ' + pt([x + 6, y - 16]) + ' ' + pt([x + 10, y - 10]), BLKL, 1.2), 1.8) + L('M' + pt([x - 12, y - 6]) + 'L' + pt([x + 12, y - 6]), PLG, 1.4);
      o += P(taper([[x - 8, y - 12], [x - 14, y - 22], [x - 12, y - 30]], 5.6, 1, 4).d, c.cel(BONE), 1.3) + P(taper([[x + 6, y - 14], [x + 12, y - 24], [x + 9, y - 31]], 5.6, 1, 4).d, c.cel(BONED), 1.3);
      // near arm with the Hollow Host shield in front
      o += spikedPad(c, 46, 53, 10, BLK, BONE) + boneLimb([[46, 58], [40, 70], [36, 80]], 4.4) + C(36, 80, 4, BONE, 1.6) + scourgeShield(c, 30, 86, 0.95);
      return o;
    },
    bile_spewer: function (c) {
      var sk = '#c4ae66', skd = '#86743a', o = shadow(c, 70, 50);
      // the bile tank on its back, piped into the shoulders
      o += C(102, 36, 20, glow(c, PLG, 0.5)) + body(c, 'M92,18 L112,18 L114,52 L90,52 Z', '#9ad8a0', F('M92,30 L114,30 L114,52 L90,52 Z', PLG, 0.85) + C(98, 40, 2.2, PLGL, 0, 0.9) + C(106, 46, 1.6, PLGL, 0, 0.9) + C(103, 34, 1.2, PLGL, 0, 0.9) + F(rp(106, 16, 10, 38), '#000', 0.2) + L('M95,22 L95,48', '#ffffff', 1.2, 0.6), 1.8);
      o += P(rp(89, 14, 26, 6), c.cel(BLKL), 1.6) + P(rp(88, 50, 28, 6), c.cel(BLKL), 1.6) + P(rp(89, 32, 26, 3.6), c.cel(BLK), 1.2);
      o += L('M92,24 Q80,20 76,34', OL, 5.4) + L('M92,24 Q80,20 76,34', '#6a6e5a', 3) + L('M90,46 Q84,54 88,62', OL, 5.4) + L('M90,46 Q84,54 88,62', '#6a6e5a', 3);
      // far stub arm and the legs
      o += limb('M100,70 L112,84 L110,96', dk(sk, 0.22), 11) + clawHand([110, 98], dk(sk, 0.22), 1.1);
      o += limb('M88,100 L92,114', dk(sk, 0.25), 15) + bearPaw(95, 121, c.cel(dk(sk, 0.3))) + limb('M58,102 L54,114', dk(sk, 0.1), 16) + bearPaw(55, 121, c.cel(dk(sk, 0.15)));
      // the bloated body, a stitched gut split open, boils and bruises
      var bd = 'M26,74 C22,46 44,26 70,26 C98,26 116,48 112,78 C110,102 92,112 70,112 C46,112 28,100 26,74 Z';
      o += body(c, bd, sk, F('M86,22 L120,22 L120,116 L92,116 C110,92 108,50 86,22 Z', skd, 0.7) + E(46, 60, 7, 5, '#8a6a7a', 0, 0.55) + E(92, 86, 8, 6, '#8a6a7a', 0, 0.5) + E(58, 40, 6, 3, '#e8d8a0', 0, 0.6) +
        stitchLine('M40,48 Q58,40 80,42') + L('M46,44 l1,5 M54,42 l1,5 M62,41 l0,5 M70,41 l0,5', OL, 1.3) + stitchLine('M96,54 L100,72'), 2.6);
      o += P('M42,84 C50,74 78,74 86,84 C80,98 48,98 42,84 Z', '#3a2a14', 2) + E(64, 86, 18, 6, c.lg([[0, PLGL], [0.5, PLG], [1, PLGD]]), 1.2) + L('M46,82 L50,88 M56,78 L58,90 M66,77 L66,91 M76,78 L74,90 M83,82 L80,88', OL, 1.8) + L('M46,82 L50,88 M56,78 L58,90 M66,77 L66,91 M76,78 L74,90 M83,82 L80,88', '#9a8a6a', 0.8);
      o += P('M56,92 C55,100 57,106 59,106 C61,106 62,100 61,92 Z', c.cel(PLG), 1.1) + P('M70,92 C69,98 70,102 72,102 C74,102 74,98 73,92 Z', c.cel(PLG), 1);
      [[36, 90, 3.4], [100, 58, 3], [84, 36, 2.6], [30, 70, 2.4], [96, 98, 2.8]].forEach(function (b) { o += C(b[0], b[1], b[2], c.cel('#d8e070'), 1.1) + C(b[0] - b[2] * 0.2, b[1] - b[2] * 0.2, b[2] * 0.35, PLGD); });
      // tiny head sunk into the shoulders, mouth gaping, bile pouring out onto the ground
      var hx = 32, hy = 44;
      o += body(c, 'M' + pt([hx - 12, hy - 2]) + 'C' + pt([hx - 12, hy - 14]) + ' ' + pt([hx + 8, hy - 16]) + ' ' + pt([hx + 12, hy - 4]) + 'L' + pt([hx + 12, hy + 8]) + 'C' + pt([hx + 4, hy + 14]) + ' ' + pt([hx - 8, hy + 14]) + ' ' + pt([hx - 12, hy + 8]) + 'Z', lt(sk, 0.06), F(rp(hx + 3, hy - 18, 14, 34), skd, 0.6), 2);
      o += gEye(c, hx - 5, hy - 5, 1.6, '#ff5a2a') + gEye(c, hx + 3, hy - 6, 1.4, '#ff5a2a') + stitchLine('M' + pt([hx - 2, hy - 14]) + 'L' + pt([hx + 6, hy - 2]));
      o += P('M' + pt([hx - 13, hy + 1]) + 'C' + pt([hx - 6, hy - 1]) + ' ' + pt([hx + 4, hy + 1]) + ' ' + pt([hx + 6, hy + 5]) + 'C' + pt([hx + 2, hy + 12]) + ' ' + pt([hx - 8, hy + 12]) + ' ' + pt([hx - 13, hy + 8]) + 'Z', '#2a0e0a', 1.6) + P(pd([[hx - 10, hy + 1.4], [hx - 8, hy + 5], [hx - 6, hy + 1]], true) + pd([[hx - 2, hy + 1], [hx, hy + 5], [hx + 2, hy + 1.6]], true), BONE, 0.8);
      var T = taper([[hx - 10, hy + 6], [hx - 20, hy + 14], [hx - 26, hy + 34], [hx - 22, hy + 56], [hx - 18, hy + 72]], 11, 5, 6);
      o += P(T.d, c.lg([[0, PLGL], [0.5, PLG], [1, PLGD]], 0, 0, 1, 0), 1.6) + L(along(T, 0.35), PLGL, 1.2, 0.9) + slime(c, 16, 118, 14) + C(4, 104, 2, c.cel(PLG), 0.9) + C(26, 108, 1.6, c.cel(PLG), 0.8);
      // near stub arm
      o += limb('M46,72 L36,86 L38,98', sk, 12) + clawHand([38, 100], sk, 1.1);
      return o;
    },
    timmy_the_cruel: function (c) {
      var sk = '#8a7e96', skd = '#5a506a', o = shadow(c, 64, 56);
      // far arm to a knuckle on the ground, far leg
      o += limb('M92,52 L108,78', skd, 16) + limb('M108,78 L108,104', skd, 14) + R(101, 92, 14, 6, c.cel(BLK), 1.4) + clawHand([108, 108], skd, 1.5, BONE);
      o += limb('M88,92 L100,106 L96,114', dk(sk, 0.3), 15) + bearPaw(96, 121, c.cel(dk(sk, 0.3)), BONE);
      o += limb('M64,92 L76,106 L70,114', dk(sk, 0.14), 16) + bearPaw(70, 121, c.cel(dk(sk, 0.14)), BONE);
      // hunched torso: ribs showing on the flank, knobs of spine along the back
      var td = 'M30,70 C28,44 50,24 78,24 C102,24 118,42 116,64 C114,84 104,98 86,100 L54,100 C40,98 32,86 30,70 Z';
      o += body(c, td, sk, F('M92,18 L122,18 L122,104 L96,104 C112,84 110,46 92,18 Z', skd, 0.7) + ribs(70, 58, 100, 4, 7, dk(sk, 0.35), 2) + E(52, 44, 10, 5, lt(sk, 0.2), 0, 0.5) + E(84, 44, 6, 4, '#7a2a36', 0, 0.7) + E(50, 84, 5, 3, '#7a2a36', 0, 0.6) + L('M84,41 l3,6 M81,43 l6,3', OL, 1), 2.6);
      [[52, 27], [64, 23], [77, 22], [90, 24], [101, 30], [109, 39]].forEach(function (k, i) { o += C(k[0], k[1], 3.6 - i * 0.2, c.cel(BONE), 1.3); });
      o += P('M54,94 L88,94 L90,106 L82,102 L76,108 L68,102 L60,108 L56,102 Z', c.cel('#4a3a2e'), 1.6);
      // the head, low and forward: big jaw, yellow eyes, a lolling tongue
      o += P(pd([[36, 50], [52, 38], [44, 56]], true), c.cel(sk), 1.6);
      o += body(c, 'M8,58 C8,46 20,40 32,42 C42,44 46,52 44,60 C42,66 36,68 30,68 L14,68 C10,66 8,62 8,58 Z', lt(sk, 0.06), F(rp(34, 38, 16, 34), skd, 0.6), 2.2);
      o += P('M9,64 L40,64 L38,70 C32,78 18,78 12,72 Z', '#3a0e14', 1.8) + P(pd([[12, 64], [14, 68], [16, 64]], true) + pd([[19, 64], [21, 68.4], [23, 64]], true) + pd([[27, 64], [29, 68], [31, 64]], true) + pd([[15, 74.6], [17, 70.6], [19, 75.4]], true) + pd([[24, 76], [26, 72], [28, 75.6]], true), BONE, 0.8);
      o += P('M18,73 C15,82 20,90 25,87 C27,82 25,77 23,73 Z', c.cel('#b04a5a'), 1.4);
      o += P(pd([[6, 52], [22, 46], [36, 48], [40, 53], [24, 54], [10, 56]], true), c.cel(skd), 1.5) + gEye(c, 17, 55, 2, '#ffe04a') + gEye(c, 28, 54, 1.8, '#ffe04a');
      // near arm, huge, knuckles down
      o += limb('M46,56 L30,80', sk, 18) + limb('M30,80 L22,104', sk, 15) + R(14, 90, 16, 7, c.cel(BLK), 1.5) + chainLine([22, 97], [36, 118], 4, 0.8) + clawHand([20, 108], sk, 1.7, BONE);
      return o;
    },
    archivist_galford: function (c) {
      var rb = '#8a1420', sk = '#e4b494';
      return G(biped(c, {
        skin: sk, shirt: rb, sleeve: rb, forearm: rb, glove: sk, noLegs: true, armW: 10, hx: 56, hy: 34,
        head: function (c, x, y) { return hHead(c, x, y, { skin: sk, hair: '#e8e4dc', old: true, longBeard: '#eeeae2', brow: '#d8d4cc', specs: true, hat: chaperon }); },
        chest: function (c) { return L('M52,48 L52,84 M76,48 L76,84', GOLD, 1.8) + L('M50,56 L78,80', OL, 3.4) + L('M50,56 L78,80', '#4a2a1a', 1.8); },
        front: function (c) { return robe(c, rb, GOLD, { panel: '#5a0c14' }) + P(rp(47, 78, 34, 5), c.cel(GOLD), 1.3) + P('M74,82 L82,82 L82,96 L74,96 Z', c.cel('#5a3a22'), 1.3) + L('M76,80 L76,70 M79,80 L80,68', '#efe4c4', 1.2) + P(pd([[79, 68], [84, 62], [81, 70]], true), '#f4f0e0', 0.8); },
        pads: function (c) { return body(c, 'M40,58 C40,46 52,44 64,46 C76,44 88,46 88,58 C80,62 72,60 64,62 C56,60 48,62 40,58 Z', CR, F(rp(70, 42, 24, 24), CRD, 0.6), 1.8) + L('M41,58 C48,61 56,59 64,61 C72,59 80,61 87,58', GOLD, 1.4); },
        near: [[48, 56], [40, 46], [34, 36]], wNearFront: function (c, p) { return torchIn(c, p); },
        far: [[80, 56], [92, 68], [86, 80]],
        top: function (c) {
          return book(c, 88, 90, 22, 7, -0.12, '#3a4a6a') + book(c, 86, 83, 20, 7, 0.08, '#6a2a1a') + book(c, 88, 76, 18, 6, -0.18, '#2a4a2a') + C(78, 84, 4.4, c.cel(sk), 2) +
            C(90, 70, 10, glow(c, EMB, 0.6)) + flame(c, 92, 73, 0.38) + motes(6102, 5, 84, 100, 56, 70, '#ffd080');
        }
      }), at(1.08, 64, 122));
    },
    balnazzar: function (c) {
      var sk = '#8a64aa', skd = '#5a3e74', fur = '#3a2a3e', mem = '#4e2a52', bn = '#2a1a2c';
      return biped(c, {
        skin: sk, shirt: sk, sleeve: sk, forearm: sk, pants: fur, boots: '#141014', legW: 12, armW: 10, shadowR: 40, digi: true, hipY: 84, hx: 57, hy: 38, neck: false,
        legF: 'M70,84 L80,98 L72,110 L74,115', legN: 'M56,84 L64,98 L54,110 L54,115', footF: [75, 121], footN: [55, 121], feet: hoof,
        torsoD: 'M40,50 C48,40 80,40 88,50 L84,66 L78,86 L52,86 L46,66 Z',
        back: function (c) {
          var tail = taper([[82, 84], [100, 92], [114, 106], [110, 116]], 5, 2, 5), tp = tail.s[tail.s.length - 1];
          return C(64, 50, 60, glow(c, FEL, 0.18)) + batWing(c, [80, 46], [106, 12], [[124, 6], [124, 34], [114, 58]], [86, 66], dk(mem, 0.1), bn) +
            batWing(c, [52, 46], [24, 10], [[4, 4], [3, 34], [14, 58]], [44, 66], mem, bn) + P(tail.d, c.cel(skd), 1.5) + P(pd([[tp[0] - 5, tp[1] - 2], [tp[0] + 4, tp[1] - 5], [tp[0] + 2, tp[1] + 5]], true), c.cel(bn), 1.2);
        },
        chest: function (c) { return L('M50,54 Q58,60 64,56 Q70,60 78,54', dk(sk, 0.4), 1.4) + L('M60,66 L68,66 M60,72 L68,72 M64,60 L64,80', dk(sk, 0.35), 1.1) + L('M48,58 L54,70 M80,58 L74,70', FEL, 1.4, 0.9) + C(64, 62, 7, glow(c, FEL, 0.5)); },
        front: function (c) { return P(rp(49, 80, 30, 6), c.cel(BLK), 1.6) + C(64, 83, 2.4, c.cel(FEL), 0.9) + body(c, 'M54,86 L74,86 L76,104 L70,100 L66,108 L60,101 L54,106 Z', CR, F(rp(66, 84, 14, 26), CRD, 0.6) + L('M56,87 L55,103', GOLD, 1.2), 1.6) + emblem(c, 64, 94, 0.42) + P(pd([[46, 86], [52, 86], [50, 96]], true) + pd([[76, 86], [82, 86], [78, 96]], true), c.cel(fur), 1.2); },
        shins: function (c) { return L('M54,112 l2,-3 M62,100 l3,-2 M74,110 l3,-2 M79,98 l3,-1', dk(fur, 0.4), 1.2); },
        pads: function (c) { return pauldron(c, 84, 50, 10, BLK, FEL) + pauldron(c, 44, 52, 12, BLK, FEL) + P(pd([[40, 44], [36, 34], [46, 42]], true), c.cel('#d8d0c0'), 1.1); },
        head: function (c, x, y) { return dreadHead(c, x, y); },
        near: [[46, 54], [34, 44], [28, 30]], nearHand: function (c, p) { return C(p[0], p[1] - 6, 16, glow(c, FEL, 0.8)) + flame(c, p[0], p[1] - 3, 0.7, '#3ac81a', '#d8ff9a') + clawHand(p, sk, 1.1, '#c8ffa0'); },
        far: [[84, 54], [96, 70], [100, 84]], farHand: function (c, p) { return clawHand(p, skd, 1.1, '#c8ffa0'); }
      });
    },
    baroness_anastari: function (c) {
      var sp = '#cfe8f2', spd = '#7aa2c0', gl = '#9aeaff', o = E(72, 122, 30, 5, c.rg([[0, '#000', 0.35], [1, '#000', 0]]));
      o += C(64, 60, 60, glow(c, gl, 0.4));
      // hair streaming back to the right, behind everything
      var H1 = taper([[52, 18], [72, 12], [92, 20], [108, 14], [122, 24]], 20, 4, 5), H2 = taper([[54, 28], [76, 30], [96, 42], [112, 40], [123, 52]], 16, 3, 5);
      o += P(H2.d, c.cel('#d4e2ea'), 1.6) + L(along(H2, 0.5), '#9ab0c0', 1) + P(H1.d, c.cel('#f2f8fa'), 1.8) + L(along(H1, 0.4), '#b0c4d0', 1) + L(along(H1, 0.75), '#b0c4d0', 0.9);
      // far arm raised behind
      o += limb('M78,50 L92,38 L102,26', spd, 6.4) + clawHand([102, 24], spd, 0.8, '#ffffff');
      // the tattered gown trailing off into wisps
      var gown = 'M46,48 C52,42 74,42 80,48 C88,62 96,78 104,90 C110,98 116,104 122,110 C114,110 110,106 106,110 C102,114 98,116 92,113 C88,118 82,120 76,115 C70,118 64,116 60,109 C54,112 46,110 42,103 C38,88 40,66 46,48 Z';
      o += body(c, gown, sp, F('M70,40 L124,40 L124,122 L84,122 C92,92 84,64 70,40 Z', spd, 0.6) + L('M52,60 C50,78 52,94 60,108 M62,58 C64,78 70,96 76,114 M72,56 C80,74 88,94 92,112', dk(sp, 0.25), 1.2) + F('M46,48 L80,48 L78,56 C70,60 56,60 48,56 Z', '#5a6a8a', 0.7), 2);
      o += P('M44,50 C50,56 74,56 82,50 L80,58 C70,64 54,64 46,58 Z', c.cel('#4a5a7a'), 1.6) + C(64, 58, 2.2, c.cel(gl), 0.9);
      // the head: pale elf face, long ear, glowing eyes, mouth open in a wail
      var x = 50, y = 30;
      o += P(pd([[x + 5, y - 3], [x + 24, y - 14], [x + 9, y + 3]], true), c.cel(sp), 1.6);
      o += body(c, 'M' + pt([x - 8, y - 8]) + 'C' + pt([x - 7, y - 14]) + ' ' + pt([x + 7, y - 15]) + ' ' + pt([x + 9, y - 6]) + 'L' + pt([x + 9, y + 5]) + 'C' + pt([x + 8, y + 12]) + ' ' + pt([x + 2, y + 16]) + ' ' + pt([x - 3, y + 15]) + 'C' + pt([x - 7, y + 13]) + ' ' + pt([x - 9, y + 9]) + ' ' + pt([x - 9, y + 4]) + 'L' + pt([x - 11, y + 1]) + 'L' + pt([x - 9, y - 2]) + 'Z', sp, F(rp(x + 2, y - 16, 12, 34), spd, 0.55), 2);
      o += E(x - 5, y - 1.4, 2.8, 2.2, '#2a3a52') + gEye(c, x - 5, y - 1.4, 1.3, '#ffffff') + L('M' + pt([x - 9, y - 5]) + 'L' + pt([x - 1, y - 6]), '#5a7090', 1.4) + E(x - 5, y + 8, 2.6, 3.8, '#16202e', 1.2) + E(x - 5, y + 9, 1.4, 1.8, '#3a5070');
      o += P('M' + pt([x - 9, y - 6]) + 'C' + pt([x - 8, y - 16]) + ' ' + pt([x + 10, y - 17]) + ' ' + pt([x + 12, y - 4]) + 'L' + pt([x + 7, y - 6]) + 'C' + pt([x + 4, y - 9]) + ' ' + pt([x - 3, y - 10]) + ' ' + pt([x - 9, y - 6]) + 'Z', c.cel('#f4fafc'), 1.6);
      o += L('M' + pt([x - 9, y - 8]) + 'Q' + pt([x, y - 12]) + ' ' + pt([x + 10, y - 8]), OL, 3) + L('M' + pt([x - 9, y - 8]) + 'Q' + pt([x, y - 12]) + ' ' + pt([x + 10, y - 8]), '#a8b8c8', 1.6) + P(pd([[x - 3, y - 10], [x - 1, y - 15], [x + 1, y - 10]], true), c.cel(gl), 0.9);
      // the wail
      var w1 = 'M' + pt([x - 16, y]) + 'Q' + pt([x - 21, y + 8]) + ' ' + pt([x - 16, y + 16]), w2 = 'M' + pt([x - 24, y - 4]) + 'Q' + pt([x - 31, y + 8]) + ' ' + pt([x - 24, y + 20]), w3 = 'M' + pt([x - 32, y - 8]) + 'Q' + pt([x - 41, y + 8]) + ' ' + pt([x - 32, y + 24]);
      o += L(w1, gl, 2.4, 0.9) + L(w2, gl, 2, 0.7) + L(w3, gl, 1.6, 0.5);
      // near arm clawing forward
      o += limb('M48,54 L36,66 L24,62', sp, 6.8) + clawHand([22, 62], sp, 0.9, '#ffffff');
      return o + motes(6201, 10, 60, 124, 60, 118, '#e8fcff');
    },
    ramstein_the_gorger: function (c) {
      var sk = '#c89088', skd = '#8a5850', o = shadow(c, 64, 60);
      // the small third arm on the back swinging a hook
      o += limb('M98,40 L112,28 L118,16', skd, 8) + C(118, 14, 4, c.cel(skd), 1.6) + L('M118,12 l2,-6 q1,-5 -4,-5 q-4,0 -4,4', OL, 3.6) + L('M118,12 l2,-6 q1,-5 -4,-5 q-4,0 -4,4', STEEL, 1.6);
      // far arm down to a fist, the legs with shackles
      o += limb('M100,58 L116,82', skd, 18) + limb('M116,82 L114,102', skd, 16) + R(106, 90, 16, 8, c.cel(BLK), 1.5) + C(114, 108, 9, c.cel(skd), 2);
      o += limb('M88,104 L90,114', dk(sk, 0.3), 18) + bearPaw(92, 121, c.cel(dk(sk, 0.32)), BONE) + limb('M46,104 L44,114', dk(sk, 0.12), 19) + bearPaw(46, 121, c.cel(dk(sk, 0.14)), BONE) + R(36, 108, 18, 6, c.cel(BLK), 1.4) + chainLine([38, 114], [4, 120], 3, 0.8);
      // the huge body: an iron plate bolted over the hump, harness straps, a belly that is all mouth
      var bd = 'M16,78 C12,42 40,16 72,16 C104,16 124,42 120,78 C118,104 100,116 70,116 C40,116 18,106 16,78 Z';
      o += body(c, bd, sk, F('M92,10 L126,10 L126,120 L98,120 C120,90 116,40 92,10 Z', skd, 0.7) + E(34, 90, 8, 6, '#7a2a2a', 0, 0.5) + E(104, 70, 7, 9, '#7a2a2a', 0, 0.5) + E(58, 30, 12, 5, lt(sk, 0.2), 0, 0.5) +
        L('M20,62 Q64,46 118,60', OL, 6) + L('M20,62 Q64,46 118,60', '#4a3024', 3.6) + L('M66,18 Q70,50 64,70', OL, 5) + L('M66,18 Q70,50 64,70', '#4a3024', 3) + stitchLine('M100,84 L110,98 M28,96 L40,104'), 2.8);
      o += body(c, 'M68,20 C80,14 104,18 110,30 L106,44 C94,38 80,36 70,38 Z', BLKL, F(rp(92, 14, 24, 34), BLK, 0.7), 2) + C(76, 26, 1.6, c.cel(STEEL), 0.8) + C(90, 22, 1.6, c.cel(STEEL), 0.8) + C(102, 30, 1.6, c.cel(STEEL), 0.8) + C(84, 36, 1.6, c.cel(STEEL), 0.8);
      o += P('M38,80 C46,68 82,68 90,80 C86,100 44,100 38,80 Z', '#5a1a24', 2.4) + E(64, 85, 22, 8, '#240610') + P(pd([[44, 78], [48, 86], [52, 76], [56, 86], [60, 75], [64, 85], [68, 75], [72, 86], [76, 76], [80, 86], [84, 78]], true), BONE, 1) + P(pd([[48, 94], [52, 87], [56, 95], [62, 88], [66, 96], [72, 88], [76, 95], [80, 89]], true), BONE, 1);
      o += P('M58,96 C57,104 59,110 61,110 C63,110 64,104 63,96 Z', c.cel('#a82a2a'), 1.1) + E(64, 85, 8, 3, '#8a1a2a', 0, 0.7) + P(pd([[70, 84], [86, 80], [88, 84], [72, 88]], true), c.cel('#b86a5a'), 1.1) + L('M76,84 l0,-3 M82,83 l0,-3', BONE, 1.4);
      // the head, small on top of the mass: spiked collar, tusked underbite, little red eyes
      o += E(34, 44, 18, 6, c.cel(BLK), 1.8);
      [[20, 44], [28, 48], [38, 49], [48, 46]].forEach(function (p) { o += P(pd([[p[0] - 3, p[1]], [p[0], p[1] + 8], [p[0] + 3, p[1]]], true), c.cel('#8a8e9a'), 1.1); });
      o += body(c, 'M16,34 C14,22 24,14 36,16 C46,18 50,28 46,38 C44,46 36,50 26,48 C20,46 16,42 16,34 Z', lt(sk, 0.08), F(rp(38, 10, 14, 42), skd, 0.6), 2.2);
      o += P('M14,38 C18,46 34,50 44,42 L42,50 C34,56 20,54 14,46 Z', c.cel(skd), 1.8) + P(pd([[18, 44], [16, 34], [22, 42]], true) + pd([[30, 47], [31, 37], [35, 46]], true), c.cel(BONE), 1.1);
      o += gEye(c, 22, 30, 1.5, '#ff3a2a') + gEye(c, 31, 29, 1.4, '#ff3a2a') + stitchLine('M28,18 L40,24 M34,16 l-2,4 M38,19 l-2,4');
      // near arm, a chain and a great meat hook dragging on the ground
      o += limb('M34,56 L18,78', sk, 20) + limb('M18,78 L16,96', sk, 17) + C(16, 100, 9, c.cel(sk), 2);
      o += chainLine([12, 102], [8, 110], 1, 0.8) + L('M8,110 l0,3 q0,8 7,8 q5,0 6,-5', OL, 5) + L('M8,110 l0,3 q0,8 7,8 q5,0 6,-5', STEEL, 2.6);
      return o;
    },
    baron_rivendare: function (c) {
      var pl = '#322f3c', cape = '#383454';
      return G(biped(c, {
        skin: '#8a9aa8', shirt: pl, sleeve: pl, forearm: pl, glove: pl, pants: '#24222c', boots: BLKX, legW: 12.5, armW: 11, shadowR: 42, neck: false, hx: 58, hy: 36,
        head: function (c, x, y) {
          var s = P(taper([[x + 6, y - 10], [x + 16, y - 16], [x + 22, y - 26], [x + 18, y - 32]], 7, 1.4, 5).d, c.cel('#6a6e7a'), 1.5);
          s += body(c, pd([[x - 11, y + 10], [x - 17, y + 4], [x - 14, y - 6], [x - 8, y - 15], [x - 1, y - 23], [x + 7, y - 15], [x + 13, y - 5], [x + 12, y + 10], [x, y + 14]], true), pl,
            F(rp(x + 3, y - 20, 14, 38), BLKX, 0.6) + L(pd([[x - 13, y - 6], [x - 7.4, y - 14], [x - 1, y - 21]]), '#9aa2bc', 1.4, 0.85) + L(pd([[x - 1, y - 21], [x - 2, y - 8]]), BLKL, 1.2) + L('M' + pt([x - 15, y + 4]) + 'L' + pt([x - 4, y + 5]) + 'M' + pt([x - 12, y + 8]) + 'L' + pt([x - 3, y + 9]), '#0a0c12', 1.2), 2);
          s += C(x - 9, y - 2, 8, glow(c, RUNE, 0.9)) + P(pd([[x - 16, y - 3.6], [x - 1, y - 3.2], [x - 1, y + 0.2], [x - 15, y + 0.2]], true), '#0a0c12', 0) + gEye(c, x - 12, y - 1.6, 1.4, RUNEL) + gEye(c, x - 5, y - 1.6, 1.4, RUNEL);
          s += P(pd([[x - 18, y - 5], [x - 8, y - 9], [x + 4, y - 8], [x + 2, y - 4], [x - 14, y - 3]], true), c.cel(BLKL), 1.5);
          [[-10, -12], [7, -14]].forEach(function (k) { s += P(pd([[x + k[0] - 2.4, y + k[1] + 1], [x + k[0], y + k[1] - 7], [x + k[0] + 2.4, y + k[1] + 1]], true), c.cel('#8a8e9a'), 1); });
          return s + P(taper([[x - 8, y - 10], [x - 16, y - 18], [x - 20, y - 28], [x - 14, y - 34]], 7.6, 1.4, 5).d, c.cel('#9a9eaa'), 1.6);
        },
        back: function (c) { return C(64, 64, 62, glow(c, RUNE, 0.22)) + body(c, 'M48,46 C66,40 84,42 90,50 C100,72 106,96 112,120 L104,113 L98,121 L90,112 L82,120 L76,112 L70,118 C66,96 60,70 48,46 Z', cape, F('M86,48 C98,72 106,96 114,122 L96,122 C92,96 88,72 80,48 Z', '#16141e', 0.6) + L('M78,60 C86,82 90,100 92,116', '#4a4466', 1.2), 2.2); },
        chest: function (c) { return L('M48,56 Q64,64 80,56', BLKL, 1.6) + L('M64,62 L64,84', BLKX, 1.4) + L('M52,70 L60,76 M76,70 L68,76', RUNE, 1.4, 0.9) + skull(c, 64, 70, 0.8, RUNE) + C(64, 70, 10, glow(c, RUNE, 0.3)); },
        front: function (c) { return P('M44,84 L62,84 L60,102 L46,100 Z', c.cel(pl), 1.6) + P('M66,84 L84,84 L82,100 L68,102 Z', c.cel(dk(pl, 0.1)), 1.6) + L('M46,98 L60,100 M68,100 L82,98', '#6a7088', 1.4) + P(rp(46, 80, 36, 7), c.cel(BLKX), 1.6) + skull(c, 64, 83, 0.55, RUNE); },
        shins: function (c) { return P('M66,103 L78,103 L78,115 L66,115 Z', c.cel(dk(pl, 0.1)), 1.4) + P('M46,103 L59,103 L58,115 L47,115 Z', c.cel(pl), 1.4) + P(pd([[48, 103], [52, 95], [56, 103]], true), c.cel('#8a8e9a'), 1) + P(pd([[68, 103], [72, 96], [76, 103]], true), c.cel('#7a7e8a'), 1); },
        pads: function (c) { return spikedPad(c, 84, 50, 13, pl) + spikedPad(c, 44, 52, 16, lt(pl, 0.05)) + skull(c, 44, 52, 0.6, RUNE); },
        near: [[46, 58], [38, 70], [34, 80]], nearHand: gauntlet(BLKL), wNear: function (c, p) { return runeblade(c, [p[0] + 1, p[1] + 2], 70, -PI / 2 - 0.42, 5); },
        far: [[82, 56], [68, 72], [42, 82]], farHand: gauntlet(dk(BLKL, 0.1))
      }), at(1.04, 64, 122));
    }
  };

  // ============================================================
  //  EXTEND the public API
  // ============================================================
  function phMob(c) { return shadow(c, 64, 30) + E(64, 96, 22, 24, c.cel(CR), 2.5); }
  function phScene(c) { return sky(c, '#14060a', '#4a1210', '#b4401a') + R(-2, 150, 404, 92, c.lg([[0, '#4a3a36'], [1, '#241c1a']])); }
  function make(tbl, key, w, h, ph) {
    try {
      var c = new Ctx(); _cur = c;
      var out = c.svg(w, h, tbl[key](c));
      _cur = null; return out;
    } catch (e) {
      _cur = null;
      try { var c2 = new Ctx(); return c2.svg(w, h, ph(c2)); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="#5e0a14"/></svg>'; }
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
