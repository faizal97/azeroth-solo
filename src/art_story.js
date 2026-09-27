/* art_story.js — story cutscene art for Azeroth Solo (Black Dragonflight arc).
 * Loads AFTER art.js and extends the global: window.ART.story = { scene(key), actor(key), keys }.
 * Self-contained: no dependency on art.js internals. Never throws; unknown key -> neutral placeholder.
 * Style: bold dark outlines (#1a1009), 2-3 tone cel shading via hard-stop gradients, no text, no filters.
 */
(function (root) {
  'use strict';
  var W = root || {};
  var ART = W.ART = W.ART || {};
  var OL = '#1a1009';
  var SEQ = 0;

  // ---------- colour helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(h) {
    h = String(h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var v = parseInt(h, 16);
    if (isNaN(v)) v = 0x808080;
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function hex(a) {
    return '#' + a.map(function (v) { var s = Math.round(clamp(v, 0, 255)).toString(16); return s.length < 2 ? '0' + s : s; }).join('');
  }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return hex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lt(c, t) { return mix(c, '#ffffff', t); }
  function dk(c, t) { return mix(c, '#000000', t); }
  function n(v) { return Math.round(v * 10) / 10; }
  function pt(p) { return n(p[0]) + ',' + n(p[1]); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- per-call context (unique ids) ----------
  function Ctx() { this.p = 'sy' + (SEQ++).toString(36); this.k = 0; this.d = []; }
  Ctx.prototype.id = function () { return this.p + '_' + (this.k++).toString(36); };
  function stops(st) {
    return st.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('');
  }
  Ctx.prototype.lin = function (st, x1, y1, x2, y2) {
    var i = this.id();
    this.d.push('<linearGradient id="' + i + '" x1="' + (x1 == null ? 0 : x1) + '" y1="' + (y1 == null ? 0 : y1) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(st) + '</linearGradient>');
    return 'url(#' + i + ')';
  };
  Ctx.prototype.rad = function (st, cx, cy, r) {
    var i = this.id();
    this.d.push('<radialGradient id="' + i + '" cx="' + (cx == null ? 0.5 : cx) + '" cy="' + (cy == null ? 0.5 : cy) + '" r="' + (r == null ? 0.5 : r) + '">' + stops(st) + '</radialGradient>');
    return 'url(#' + i + ')';
  };
  // classic cel: light top-left, flat base, hard dark bottom-right
  Ctx.prototype.cel = function (base, l, d) {
    return this.lin([[0, lt(base, l == null ? 0.3 : l)], [0.4, base], [0.72, base], [1, dk(base, d == null ? 0.38 : d)]], 0.2, 0, 0.8, 1);
  };
  // horizontal cel for pillars / cylinders
  Ctx.prototype.celH = function (base) {
    return this.lin([[0, lt(base, 0.35)], [0.3, lt(base, 0.1)], [0.62, base], [0.63, dk(base, 0.18)], [1, dk(base, 0.4)]], 0, 0, 1, 0);
  };
  Ctx.prototype.vgrad = function (a, b, c2) { return c2 ? this.lin([[0, a], [0.5, b], [1, c2]]) : this.lin([[0, a], [1, b]]); };
  Ctx.prototype.glow = function (col, op) { return this.rad([[0, col, op], [0.4, col, op * 0.5], [1, col, 0]]); };
  Ctx.prototype.shade = function () { return this.rad([[0, '#000', 0.45], [0.65, '#000', 0.25], [1, '#000', 0]]); };
  Ctx.prototype.clip = function (inner) { var i = this.id(); this.d.push('<clipPath id="' + i + '">' + inner + '</clipPath>'); return i; };

  // ---------- primitives ----------
  function st(sw) { return sw ? ' stroke="' + OL + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' : ''; }
  function P(d, fill, sw, ex) { return '<path d="' + d + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function L(d, col, sw, ex) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + (ex ? ' ' + ex : '') + '/>'; }
  function E(cx, cy, rx, ry, fill, sw, ex) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function R(x, y, w, h, fill, sw, ex) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="' + (fill || 'none') + '"' + st(sw) + (ex ? ' ' + ex : '') + '/>'; }
  function G(body, ex) { return '<g' + (ex ? ' ' + ex : '') + '>' + body + '</g>'; }
  // outlined limb: dark stroke then colour stroke
  function limb(d, col, w) { return L(d, OL, w + 2.4) + L(d, col, w); }
  function wrap(c, w, h, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + (c.d.length ? '<defs>' + c.d.join('') + '</defs>' : '') + body + '</svg>';
  }
  function flameD(x, y, w, h, lean) {
    lean = lean || 0; var tx = x + lean;
    return 'M' + n(x - w / 2) + ',' + n(y) + ' C' + n(x - w / 2) + ',' + n(y - h * 0.5) + ' ' + n(tx - w * 0.2) + ',' + n(y - h * 0.62) + ' ' + n(tx) + ',' + n(y - h) +
      ' C' + n(tx + w * 0.22) + ',' + n(y - h * 0.6) + ' ' + n(x + w / 2) + ',' + n(y - h * 0.5) + ' ' + n(x + w / 2) + ',' + n(y) + ' Q' + n(x) + ',' + n(y + w * 0.35) + ' ' + n(x - w / 2) + ',' + n(y) + ' Z';
  }
  // three-layer flame; pal = [outer, mid, core]
  function fire(x, y, w, h, pal, sw, lean) {
    pal = pal || ['#e0501a', '#ffa030', '#fff0a0'];
    return P(flameD(x, y, w, h, lean), pal[0], sw == null ? 1.4 : sw) + P(flameD(x, y - h * 0.03, w * 0.64, h * 0.7, (lean || 0) * 0.7), pal[1]) + P(flameD(x, y - h * 0.05, w * 0.32, h * 0.4, (lean || 0) * 0.4), pal[2]);
  }
  function arch(x, top, spring, bottom, w) { // pointed arch outline
    return 'M' + n(x) + ',' + n(bottom) + ' L' + n(x) + ',' + n(spring) + ' C' + n(x) + ',' + n(spring - w * 0.42) + ' ' + n(x + w * 0.3) + ',' + n(top) + ' ' + n(x + w / 2) + ',' + n(top) +
      ' C' + n(x + w * 0.7) + ',' + n(top) + ' ' + n(x + w) + ',' + n(spring - w * 0.42) + ' ' + n(x + w) + ',' + n(spring) + ' L' + n(x + w) + ',' + n(bottom) + ' Z';
  }
  function chain(x1, y1, x2, y2, sz, col) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var cnt = Math.max(2, Math.floor(len / (sz * 1.55))), o = '';
    for (var i = 0; i < cnt; i++) {
      var t = (i + 0.5) / cnt, cx = x1 + dx * t, cy = y1 + dy * t;
      var tr = ' transform="rotate(' + n(ang) + ' ' + n(cx) + ' ' + n(cy) + ')"';
      if (i % 2 === 0) {
        o += E(cx, cy, sz, sz * 0.58, 'none', 0, 'stroke="' + OL + '" stroke-width="' + n(sz * 0.62) + '"' + tr);
        o += E(cx, cy, sz, sz * 0.58, 'none', 0, 'stroke="' + col + '" stroke-width="' + n(sz * 0.34) + '"' + tr);
        o += E(cx - sz * 0.2, cy - sz * 0.3, sz * 0.5, sz * 0.12, lt(col, 0.35), 0, 'opacity="0.7"' + tr);
      } else {
        o += R(cx - sz * 1.05, cy - sz * 0.26, sz * 2.1, sz * 0.52, col, n(sz * 0.14), 'rx="' + n(sz * 0.26) + '"' + tr);
      }
    }
    return o;
  }
  // bat/dragon wing: S shoulder, Wr wrist, tips outer->inner, B body attach
  function wing(S, Wr, tips, B, memb, bone, sw) {
    var d = 'M' + pt(S) + ' L' + pt(Wr) + ' L' + pt(tips[0]);
    var all = tips.concat([B]);
    for (var i = 1; i < all.length; i++) {
      var a = all[i - 1], b = all[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      d += ' Q' + n(mx + (Wr[0] - mx) * 0.3) + ',' + n(my + (Wr[1] - my) * 0.3) + ' ' + pt(b);
    }
    d += ' Z';
    var o = P(d, memb, sw);
    for (var j = 1; j < tips.length; j++) o += L('M' + pt(Wr) + ' L' + pt(tips[j]), OL, sw * 1.5) + L('M' + pt(Wr) + ' L' + pt(tips[j]), bone, sw * 0.6);
    o += limb('M' + pt(S) + ' L' + pt(Wr) + ' L' + pt(tips[0]), bone, sw * 1.6);
    o += P('M' + n(Wr[0] - 3) + ',' + n(Wr[1] + 1) + ' L' + n(Wr[0] + 1) + ',' + n(Wr[1] - 7) + ' L' + n(Wr[0] + 3) + ',' + n(Wr[1] + 1) + ' Z', lt(bone, 0.3), sw * 0.7);
    return o;
  }
  function vignette(c, op) { return R(0, 0, 480, 270, c.rad([[0, '#000', 0], [0.6, '#000', op * 0.25], [1, '#000', op]], 0.5, 0.45, 0.75)); }

  // =====================================================================
  // SCENES (480 x 270, opaque)
  // =====================================================================

  function pillar(c, x, top, bot, w, K) {
    var o = '', capH = w * 0.55, baseH = w * 0.5;
    o += R(x, top + capH, w, bot - top - capH - baseH, c.celH(K.stone), 1.8);
    for (var f = 1; f < 4; f++) o += L('M' + n(x + w * f / 4) + ',' + n(top + capH + 3) + ' L' + n(x + w * f / 4) + ',' + n(bot - baseH - 3), dk(K.stone, f === 3 ? 0.3 : 0.12), 1);
    o += R(x - w * 0.12, top + capH - 5, w * 1.24, 5, K.gold, 1.4);
    o += P('M' + n(x - w * 0.22) + ',' + n(top) + ' L' + n(x + w * 1.22) + ',' + n(top) + ' L' + n(x + w * 1.1) + ',' + n(top + capH - 5) + ' L' + n(x - w * 0.1) + ',' + n(top + capH - 5) + ' Z', c.celH(lt(K.stone, 0.05)), 1.8);
    o += P('M' + n(x - w * 0.18) + ',' + n(bot - baseH) + ' L' + n(x + w * 1.18) + ',' + n(bot - baseH) + ' L' + n(x + w * 1.3) + ',' + n(bot) + ' L' + n(x - w * 0.3) + ',' + n(bot) + ' Z', c.celH(dk(K.stone, 0.04)), 1.8);
    o += R(x - w * 0.14, bot - baseH - 3, w * 1.28, 4, K.gold, 1.2);
    return o;
  }
  function banner(c, x, y, w, h, K) {
    var o = '';
    o += L('M' + n(x - 5) + ',' + n(y) + ' L' + n(x + w + 5) + ',' + n(y), OL, 4.5) + L('M' + n(x - 5) + ',' + n(y) + ' L' + n(x + w + 5) + ',' + n(y), K.gold, 2.4);
    var d = 'M' + n(x) + ',' + n(y) + ' L' + n(x + w) + ',' + n(y) + ' L' + n(x + w) + ',' + n(y + h) + ' L' + n(x + w / 2) + ',' + n(y + h - w * 0.4) + ' L' + n(x) + ',' + n(y + h) + ' Z';
    o += P(d, c.lin([[0, lt(K.banner, 0.22)], [0.35, K.banner], [0.7, K.banner], [0.71, dk(K.banner, 0.22)], [1, dk(K.banner, 0.35)]], 0, 0, 1, 0), 1.8);
    var ins = 'M' + n(x + 3.5) + ',' + n(y + 4) + ' L' + n(x + w - 3.5) + ',' + n(y + 4) + ' L' + n(x + w - 3.5) + ',' + n(y + h - 6) + ' L' + n(x + w / 2) + ',' + n(y + h - w * 0.4 - 4.5) + ' L' + n(x + 3.5) + ',' + n(y + h - 6) + ' Z';
    o += P(ins, 'none', 0, 'stroke="' + K.gold + '" stroke-width="1.6"');
    // lion-sun crest (mane of spikes around a disc) — no letters
    var cx = x + w / 2, cy = y + h * 0.4, r = w * 0.22, sp = '';
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, a2 = a + Math.PI / 12, a3 = a - Math.PI / 12;
      sp += (i ? ' L' : 'M') + n(cx + Math.cos(a3) * r) + ',' + n(cy + Math.sin(a3) * r) + ' L' + n(cx + Math.cos(a) * r * 1.6) + ',' + n(cy + Math.sin(a) * r * 1.6) + ' L' + n(cx + Math.cos(a2) * r) + ',' + n(cy + Math.sin(a2) * r);
    }
    o += P(sp + ' Z', K.gold, 1.2) + E(cx, cy, r * 0.85, r * 0.85, lt(K.gold, 0.2), 1.2) + E(cx - r * 0.25, cy - r * 0.1, r * 0.3, r * 0.22, dk(K.gold, 0.3));
    // tassels
    o += L('M' + n(x) + ',' + n(y + h) + ' l0,6', K.gold, 1.6) + L('M' + n(x + w) + ',' + n(y + h) + ' l0,6', K.gold, 1.6);
    return o;
  }
  function brazier(c, x, y, K, big) {
    var o = '', s = big || 1;
    o += E(x, y - 2, 110 * s, 80 * s, c.glow(K.glow, K.glowOp));
    o += limb('M' + n(x - 10 * s) + ',' + n(y) + ' L' + n(x - 3 * s) + ',' + n(y - 22 * s), K.iron, 2.4 * s) + limb('M' + n(x + 10 * s) + ',' + n(y) + ' L' + n(x + 3 * s) + ',' + n(y - 22 * s), K.iron, 2.4 * s) + limb('M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - 22 * s), K.iron, 2.4 * s);
    o += P('M' + n(x - 16 * s) + ',' + n(y - 30 * s) + ' L' + n(x + 16 * s) + ',' + n(y - 30 * s) + ' Q' + n(x + 13 * s) + ',' + n(y - 19 * s) + ' ' + n(x) + ',' + n(y - 19 * s) + ' Q' + n(x - 13 * s) + ',' + n(y - 19 * s) + ' ' + n(x - 16 * s) + ',' + n(y - 30 * s) + ' Z', c.cel(K.gold), 1.6);
    o += fire(x, y - 30 * s, 22 * s, 34 * s, K.flame, 1.3);
    return o;
  }
  function candelabra(c, x, y, K) {
    var o = '';
    o += E(x, y - 40, 130, 95, c.glow('#ff2a14', 0.42));
    o += limb('M' + n(x) + ',' + n(y) + ' L' + n(x) + ',' + n(y - 44), '#2a2226', 2.6);
    o += limb('M' + n(x - 14) + ',' + n(y - 40) + ' Q' + n(x) + ',' + n(y - 30) + ' ' + n(x + 14) + ',' + n(y - 40), '#2a2226', 2.2);
    o += limb('M' + n(x - 8) + ',' + n(y) + ' L' + n(x) + ',' + n(y - 8) + ' L' + n(x + 8) + ',' + n(y), '#2a2226', 2.2);
    [[-14, 10], [0, 14], [14, 10]].forEach(function (q) {
      var cx = x + q[0], top = y - 40 - q[1];
      o += R(cx - 2.6, top, 5.2, q[1] + 1, c.celH('#b8202a'), 1.2);
      o += E(cx, top - 6, 9, 12, c.glow('#ff5a2a', 0.8));
      o += fire(cx, top, 6, 11, ['#e0201a', '#ff6a2a', '#ffe0a0'], 1);
    });
    return o;
  }

  function keepScene(dark) {
    var c = new Ctx(), o = '';
    var K = dark ? {
      wall0: '#2a1c24', wall1: '#1a1016', stone: '#5e4a52', vault: '#120a0e', floor0: '#2a1a1e', floor1: '#140a0c', banner: '#1c2a52', gold: '#9a6a2a',
      glass: ['#3a0a14', '#6a1420', '#2a060c'], carpet: '#4a0e18', flame: ['#b81a12', '#ff4a20', '#ffc080'], glow: '#ff2a14', glowOp: 0.45, iron: '#2a2226', throne: '#1c2a52'
    } : {
      wall0: '#d6cdb8', wall1: '#a89c86', stone: '#ece6d8', vault: '#6a6258', floor0: '#bdb29c', floor1: '#877c68', banner: '#1f4f9e', gold: '#e2b23e',
      glass: ['#dff2ff', '#7ab8ee', '#2e62b0'], carpet: '#23509e', flame: ['#e0501a', '#ffa030', '#fff0a0'], glow: '#ffc060', glowOp: 0.38, iron: '#4a3a2a', throne: '#23509e'
    };
    // back wall + masonry
    o += R(0, 0, 480, 270, c.vgrad(K.wall0, K.wall1));
    var m = '';
    for (var yy = 44, row = 0; yy < 166; yy += 13, row++) {
      m += 'M0,' + yy + ' L480,' + yy + ' ';
      for (var xx = (row % 2) * 17; xx < 480; xx += 34) m += 'M' + xx + ',' + yy + ' l0,13 ';
    }
    o += L(m, dk(K.wall1, 0.25), 0.8, 'opacity="0.45"');
    // vaulted ceiling
    o += P('M0,0 L480,0 L480,46 Q420,6 360,40 Q300,4 240,30 Q180,4 120,40 Q60,6 0,46 Z', c.vgrad(dk(K.vault, 0.2), K.vault), 1.8);
    o += L('M0,46 Q60,6 120,40 Q180,4 240,30 Q300,4 360,40 Q420,6 480,46', K.gold, 2.2, 'opacity="0.8"');
    o += L('M60,0 L60,28 M180,0 L180,20 M300,0 L300,20 M420,0 L420,28', dk(K.vault, 0.4), 3);
    // side recesses
    [[92, 314]].forEach(function () {});
    o += P(arch(96, 48, 84, 158, 70), c.vgrad(dk(K.wall1, 0.3), dk(K.wall1, 0.45)), 1.8);
    o += P(arch(314, 48, 84, 158, 70), c.vgrad(dk(K.wall1, 0.3), dk(K.wall1, 0.45)), 1.8);
    o += P(arch(118, 62, 86, 118, 26), c.vgrad(K.glass[0], K.glass[2]), 1.4) + P(arch(336, 62, 86, 118, 26), c.vgrad(K.glass[0], K.glass[2]), 1.4);
    // great window behind the throne
    o += P(arch(186, 12, 66, 146, 108), c.celH(dk(K.stone, 0.08)), 2);
    o += P(arch(196, 24, 72, 140, 88), c.vgrad(K.glass[0], K.glass[1], K.glass[2]), 1.8);
    o += L('M218,140 L218,52 M240,140 L240,44 M262,140 L262,52 M196,102 L284,102', dk(K.stone, 0.15), 2.6);
    o += E(240, 54, 14, 14, 'none', 0, 'stroke="' + dk(K.stone, 0.15) + '" stroke-width="2.6"');
    var sp = ''; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; sp += 'M240,54 L' + n(240 + Math.cos(a) * 14) + ',' + n(54 + Math.sin(a) * 14) + ' '; }
    o += L(sp, dk(K.stone, 0.15), 1.6);
    if (!dark) {
      o += P('M200,140 L280,140 L344,262 L136,262 Z', c.lin([[0, '#fff8e0', 0.28], [1, '#fff8e0', 0]]));
      o += E(240, 80, 70, 70, c.glow('#ffffff', 0.35));
    } else {
      // an ominous winged shadow on the back wall above the throne (foreshadowing)
      o += G(P('M240,70 C226,58 200,40 168,34 C184,48 186,58 180,70 C196,66 214,72 226,86 Z M240,70 C254,58 280,40 312,34 C296,48 294,58 300,70 C284,66 266,72 254,86 Z M232,64 L226,48 L236,58 Z M248,64 L254,48 L244,58 Z', '#000'), 'opacity="0.45"');
    }
    // banners in the recesses
    o += banner(c, 114, 58, 34, 86, K) + banner(c, 332, 58, 34, 86, K);
    // back pillars flanking the window
    o += pillar(c, 166, 30, 164, 16, K) + pillar(c, 298, 30, 164, 16, K);
    // floor
    o += R(0, 163, 480, 107, c.vgrad(K.floor0, K.floor1));
    var fl = '';
    [169, 177, 187, 200, 217, 239, 266].forEach(function (y) { fl += 'M0,' + y + ' L480,' + y + ' '; });
    for (var fx = -520; fx <= 1000; fx += 64) fl += 'M240,120 L' + fx + ',270 ';
    var fclip = c.clip('<rect x="0" y="163" width="480" height="107"/>');
    o += G(L(fl, dk(K.floor1, 0.3), 0.9, 'opacity="0.55"'), 'clip-path="url(#' + fclip + ')"');
    o += E(240, 206, 90, 16, c.glow(dark ? '#ff3020' : '#fff4d8', dark ? 0.18 : 0.3));
    // carpet
    o += P('M226,163 L254,163 L306,270 L174,270 Z', c.vgrad(K.carpet, dk(K.carpet, 0.35)), 1.6);
    o += L('M230,163 L182,270 M250,163 L298,270', K.gold, 2);
    // dais
    o += P('M146,154 L334,154 L334,164 L146,164 Z', c.vgrad(lt(K.stone, 0.02), dk(K.stone, 0.3)), 1.8);
    o += P('M160,146 L320,146 L320,155 L160,155 Z', c.vgrad(lt(K.stone, 0.05), dk(K.stone, 0.26)), 1.8);
    o += P('M174,138 L306,138 L306,147 L174,147 Z', c.vgrad(lt(K.stone, 0.08), dk(K.stone, 0.22)), 1.8);
    o += P('M228,138 L252,138 L256,164 L224,164 Z', c.vgrad(K.carpet, dk(K.carpet, 0.3)), 1.4);
    o += L('M174,138 L306,138 M160,146 L320,146 M146,154 L334,154', K.gold, 1.2, 'opacity="0.9"');
    // throne (empty)
    o += P('M212,140 L212,86 Q212,70 224,64 L240,46 L256,64 Q268,70 268,86 L268,140 Z', c.cel(K.gold), 2);
    o += P('M220,126 L220,90 Q220,78 229,73 L240,61 L251,73 Q260,78 260,90 L260,126 Z', c.cel(K.throne), 1.6);
    o += P('M240,68 L247,84 L240,100 L233,84 Z', dk(K.gold, 0.1), 1.2);
    o += E(212, 84, 4, 4, c.cel(K.gold), 1.4) + E(268, 84, 4, 4, c.cel(K.gold), 1.4) + E(240, 44, 4.5, 4.5, c.cel(K.gold), 1.4);
    o += P('M214,118 L266,118 L266,127 L214,127 Z', c.cel(lt(K.throne, 0.1)), 1.6);
    o += P('M210,126 L270,126 L272,140 L208,140 Z', c.cel(K.gold), 1.8);
    o += P('M200,108 L220,108 L220,140 L202,140 Z', c.cel(K.gold), 1.8) + P('M260,108 L280,108 L278,140 L260,140 Z', c.cel(K.gold), 1.8);
    o += E(210, 107, 11, 4, c.cel(lt(K.gold, 0.1)), 1.4) + E(270, 107, 11, 4, c.cel(lt(K.gold, 0.1)), 1.4);
    // mid pillars + torches
    o += pillar(c, 54, 0, 206, 30, K) + pillar(c, 396, 0, 206, 30, K);
    if (!dark) {
      [[69, 96], [411, 96]].forEach(function (q) {
        o += E(q[0], q[1] - 12, 70, 60, c.glow(K.glow, 0.42));
        o += P('M' + (q[0] - 6) + ',' + q[1] + ' L' + (q[0] + 6) + ',' + q[1] + ' L' + (q[0] + 4) + ',' + (q[1] + 14) + ' L' + (q[0] - 4) + ',' + (q[1] + 14) + ' Z', c.cel(K.iron), 1.5);
        o += fire(q[0], q[1], 12, 22, K.flame, 1.2);
      });
      o += brazier(c, 138, 176, K) + brazier(c, 342, 176, K);
    } else {
      o += candelabra(c, 176, 162, K) + candelabra(c, 304, 162, K);
    }
    // foreground pillars (cropped)
    o += pillar(c, -16, -4, 274, 44, K) + pillar(c, 452, -4, 274, 44, K);
    o += banner(c, 30, 12, 24, 60, K) + banner(c, 426, 12, 24, 60, K);
    if (dark) {
      // long shadows raking toward the camera
      o += G(P('M216,164 L264,164 L330,270 L150,270 Z M54,206 L84,206 L20,270 L-40,270 Z M396,206 L426,206 L520,270 L460,270 Z M160,164 L176,164 L60,270 L20,270 Z M304,164 L320,164 L460,270 L420,270 Z', '#050204'), 'opacity="0.55"');
      o += R(0, 0, 480, 270, '#0a0306', 0, 'opacity="0.35"');
      o += E(240, 150, 200, 80, c.glow('#ff2010', 0.22));
      // candle flames re-lit above the darkness
      [[162, 108], [176, 104], [190, 108], [290, 108], [304, 104], [318, 108]].forEach(function (q) {
        o += E(q[0], q[1] - 6, 12, 14, c.glow('#ff6a3a', 0.9));
        o += fire(q[0], q[1] + 2, 5, 10, ['#ff3020', '#ff8a4a', '#fff0c0'], 0.9);
      });
      o += vignette(c, 0.85);
    } else {
      o += E(240, 150, 260, 120, c.glow('#ffd080', 0.12));
      o += vignette(c, 0.45);
    }
    return wrap(c, 480, 270, o);
  }

  function blackrockScene() {
    var c = new Ctx(), o = '', r = rng(7);
    o += R(0, 0, 480, 270, c.lin([[0, '#0c0405'], [0.45, '#2e0c08'], [0.75, '#8a2a0c'], [1, '#d8561a']]));
    o += E(240, 190, 300, 120, c.glow('#ff7a20', 0.55));
    // far cavern walls
    o += P('M-10,120 L20,60 L44,74 L70,20 L96,50 L118,30 L150,90 L176,70 L196,110 L214,96 L240,130 L262,100 L284,116 L306,70 L330,86 L360,24 L388,58 L410,34 L440,80 L470,50 L490,90 L490,200 L-10,200 Z', c.vgrad('#2a1210', '#5a2012', '#b8401a'), 1.6);
    // Blackrock Spire towers far off in the glow
    o += P('M196,150 L200,96 L196,96 L204,70 L212,96 L208,96 L210,118 L222,118 L224,82 L220,82 L230,50 L240,82 L236,82 L238,112 L250,112 L252,90 L248,90 L256,66 L264,90 L260,90 L262,120 L276,120 L278,100 L286,150 Z', '#1a0a08', 1.4, 'opacity="0.85"');
    o += E(230, 70, 1.4, 2, '#ffb040') + E(256, 84, 1.2, 1.8, '#ffb040') + E(204, 88, 1.2, 1.8, '#ffb040') + E(231, 96, 1.2, 1.6, '#ff8a30');
    o += P('M-10,150 L30,110 L60,130 L96,96 L130,140 L170,124 L200,150 L280,150 L310,124 L350,140 L384,100 L420,126 L452,104 L490,140 L490,210 L-10,210 Z', c.vgrad('#1e0c0c', '#4a1a10', '#a03a16'), 1.6);
    // lava falls
    [[62, 28, 14], [148, 88, 9], [352, 22, 16], [424, 36, 10]].forEach(function (q) {
      var x = q[0], y = q[1], w = q[2];
      o += R(x - w * 2.2, y, w * 4.4, 200 - y, c.lin([[0, '#ff7a20', 0], [0.5, '#ff7a20', 0.35], [1, '#ff7a20', 0]], 0, 0, 1, 0));
      var d = 'M' + (x - w / 2) + ',' + y + ' C' + (x - w * 0.8) + ',' + (y + 50) + ' ' + (x - w * 0.3) + ',' + (y + 110) + ' ' + (x - w * 0.9) + ',200 L' + (x + w * 0.9) + ',200 C' + (x + w * 0.4) + ',' + (y + 110) + ' ' + (x + w * 0.8) + ',' + (y + 50) + ' ' + (x + w / 2) + ',' + y + ' Z';
      o += P(d, c.lin([[0, '#fff0a0'], [0.3, '#ffb030'], [0.7, '#ff6a18'], [1, '#e0400e']]), 1.4);
      o += L('M' + x + ',' + (y + 6) + ' C' + (x - 2) + ',' + (y + 60) + ' ' + (x + 2) + ',' + (y + 120) + ' ' + x + ',196', '#fff6c0', w * 0.22, 'opacity="0.8"');
      o += E(x, 198, w * 2.4, 6, '#fff0a0', 0, 'opacity="0.8"');
    });
    // lava lake
    o += R(-10, 190, 500, 40, c.lin([[0, '#ffd060'], [0.3, '#ff8a20'], [1, '#c83a0e']]));
    var wv = '';
    for (var k = 0; k < 14; k++) { var wx = r() * 470, wy = 196 + r() * 26; wv += 'M' + n(wx) + ',' + n(wy) + ' q6,-3 12,0 t12,0 '; }
    o += L(wv, '#fff4b0', 1.4, 'opacity="0.75"');
    for (var b = 0; b < 8; b++) o += E(r() * 480, 200 + r() * 20, 2 + r() * 3, 1.5 + r() * 1.5, '#fff0a0', 0.8);
    // chains from the vault to the bridge
    o += chain(150, -10, 176, 150, 8, '#4a3a38') + chain(330, -10, 304, 150, 8, '#4a3a38');
    o += chain(40, -10, 60, 160, 6, '#3a2c2a') + chain(440, -10, 420, 160, 6, '#3a2c2a');
    // great stone bridge
    o += P('M-10,150 Q240,132 490,150 L490,170 Q240,152 -10,170 Z', c.vgrad('#7a6660', '#4a3a36'), 2);
    o += P('M-10,170 Q240,152 490,170 L490,184 L452,184 Q430,160 404,186 L316,184 Q290,156 262,178 L218,178 Q190,156 164,184 L76,186 Q50,160 28,184 L-10,184 Z', c.vgrad('#3a2c2a', '#1e1414'), 2);
    var bl = '';
    for (var bx = 0; bx < 480; bx += 24) { var by = 150 - 18 * (1 - Math.pow((bx - 240) / 250, 2)); bl += 'M' + bx + ',' + n(by) + ' l0,19 '; }
    o += L(bl, '#2a1e1c', 1, 'opacity="0.7"');
    o += L('M-10,150 Q240,132 490,150', '#ff9a4a', 1.6, 'opacity="0.55"');
    // crenellated rail posts
    o += P('M-10,143 Q240,125 490,143 L490,151 Q240,133 -10,151 Z', c.vgrad('#8a7670', '#5a4842'), 1.6);
    var pl = ''; for (var px = 6; px < 480; px += 18) { var py = 151 - 18 * (1 - Math.pow((px - 240) / 250, 2)); pl += 'M' + px + ',' + n(py - 7.5) + ' l0,7 '; }
    o += L(pl, '#3a2c28', 0.9, 'opacity="0.8"');
    o += L('M-10,143 Q240,125 490,143', '#ffb070', 1.4, 'opacity="0.6"');
    // smoke
    var sm = '';
    for (var s2 = 0; s2 < 9; s2++) { var sx = r() * 480, sy = 20 + r() * 70; sm += E(sx, sy, 40 + r() * 40, 12 + r() * 10, '#1a0c0c', 0, 'opacity="' + n(0.35 + r() * 0.3) + '"'); }
    o += sm;
    for (var s3 = 0; s3 < 5; s3++) o += E(40 + r() * 400, 110 + r() * 40, 50, 10, '#ff8a4a', 0, 'opacity="0.12"');
    // foreground basalt ledge where actors stand
    o += P('M-10,224 L40,218 L90,222 L140,216 L200,220 L260,214 L320,220 L380,216 L430,222 L490,218 L490,280 L-10,280 Z', c.vgrad('#3a2622', '#140a0a'), 2);
    o += L('M-10,224 L40,218 L90,222 L140,216 L200,220 L260,214 L320,220 L380,216 L430,222 L490,218', '#ff8a3a', 2, 'opacity="0.8"');
    var cr = '';
    [[52, 230], [168, 226], [296, 232], [404, 228], [236, 250]].forEach(function (q) {
      var x0 = q[0], y0 = q[1], xx = x0, yy = y0;
      cr += 'M' + xx + ',' + yy;
      for (var j = 0; j < 5; j++) { xx += 5 + r() * 7; yy += (r() - 0.35) * 7; cr += ' L' + n(xx) + ',' + n(yy); }
      cr += ' M' + n(x0 + 12) + ',' + n(y0 + 2) + ' l' + n(2 + r() * 3) + ',' + n(6 + r() * 5) + ' l' + n(-2 + r() * 4) + ',' + n(4 + r() * 4);
    });
    o += L(cr, '#5a1a08', 3.2) + L(cr, '#ff8a2a', 1.3);
    // framing crags
    o += P('M-10,-10 L60,-10 L40,40 L56,90 L30,150 L42,230 L-10,240 Z', c.vgrad('#1a0c0a', '#2a1410'), 2);
    o += P('M490,-10 L420,-10 L446,50 L428,110 L454,170 L440,230 L490,236 Z', c.vgrad('#1a0c0a', '#2a1410'), 2);
    o += L('M56,90 L30,150 L42,230', '#ff7a2a', 1.6, 'opacity="0.6"') + L('M428,110 L454,170 L440,230', '#ff7a2a', 1.6, 'opacity="0.6"');
    // embers
    for (var e = 0; e < 40; e++) { var ex = r() * 480, ey = r() * 210; o += E(ex, ey, 0.8 + r() * 1.4, 0.8 + r() * 1.4, r() > 0.5 ? '#ffd060' : '#ff8a30', 0, 'opacity="' + n(0.5 + r() * 0.5) + '"'); }
    o += vignette(c, 0.6);
    return wrap(c, 480, 270, o);
  }

  function westfallScene() {
    var c = new Ctx(), o = '', r = rng(11);
    o += R(0, 0, 480, 270, c.lin([[0, '#3a2c5a'], [0.3, '#8a4a6a'], [0.52, '#e07848'], [0.62, '#f7c46a'], [1, '#f7c46a']]));
    o += E(300, 136, 150, 90, c.glow('#fff0b0', 0.6));
    o += E(300, 138, 24, 24, c.rad([[0, '#fffbe0'], [0.7, '#ffe690'], [1, '#ffcc60']]), 0);
    // streaky clouds lit from below
    [[80, 46, 90, 8], [210, 30, 120, 7], [380, 58, 110, 9], [150, 82, 80, 6], [420, 96, 70, 5]].forEach(function (q) {
      o += P('M' + (q[0] - q[2] / 2) + ',' + q[1] + ' Q' + q[0] + ',' + (q[1] - q[3] * 1.4) + ' ' + (q[0] + q[2] / 2) + ',' + q[1] + ' Q' + q[0] + ',' + (q[1] + q[3] * 0.6) + ' ' + (q[0] - q[2] / 2) + ',' + q[1] + ' Z', c.vgrad('#b0607a', '#ffb070'), 0, 'opacity="0.85"');
    });
    // distant hills
    o += P('M-10,140 Q60,118 130,134 Q200,120 260,138 Q340,122 410,132 Q450,126 490,136 L490,160 L-10,160 Z', c.vgrad('#a0605a', '#b8704e'), 1.4);
    o += P('M-10,150 Q90,136 180,148 Q280,138 360,150 Q430,142 490,148 L490,170 L-10,170 Z', c.vgrad('#c07a48', '#b86a3c'), 1.4);
    // Harvest Watcher silhouette in the far field
    var hx = 208, hy = 156, hw = '#3a2230';
    o += G(
      limb('M' + (hx - 4) + ',' + (hy - 16) + ' L' + (hx - 8) + ',' + hy, hw, 2.2) + limb('M' + (hx + 4) + ',' + (hy - 16) + ' L' + (hx + 9) + ',' + hy, hw, 2.2) +
      P('M' + (hx - 9) + ',' + (hy - 16) + ' C' + (hx - 12) + ',' + (hy - 30) + ' ' + (hx - 8) + ',' + (hy - 38) + ' ' + hx + ',' + (hy - 38) + ' C' + (hx + 8) + ',' + (hy - 38) + ' ' + (hx + 12) + ',' + (hy - 30) + ' ' + (hx + 9) + ',' + (hy - 16) + ' Z', hw, 1.4) +
      limb('M' + (hx - 8) + ',' + (hy - 32) + ' L' + (hx - 22) + ',' + (hy - 24) + ' L' + (hx - 26) + ',' + (hy - 14), hw, 2) + limb('M' + (hx + 8) + ',' + (hy - 32) + ' L' + (hx + 20) + ',' + (hy - 40) + ' L' + (hx + 24) + ',' + (hy - 50), hw, 2) +
      P('M' + (hx - 28) + ',' + (hy - 14) + ' l-3,6 M' + (hx - 26) + ',' + (hy - 14) + ' l0,7 M' + (hx - 24) + ',' + (hy - 14) + ' l3,6', 'none', 0, 'stroke="' + hw + '" stroke-width="1.4"') +
      P('M' + (hx - 7) + ',' + (hy - 37) + ' C' + (hx - 11) + ',' + (hy - 44) + ' ' + (hx - 7) + ',' + (hy - 52) + ' ' + hx + ',' + (hy - 52) + ' C' + (hx + 7) + ',' + (hy - 52) + ' ' + (hx + 11) + ',' + (hy - 44) + ' ' + (hx + 7) + ',' + (hy - 37) + ' Z', hw, 1.4) +
      L('M' + (hx - 1) + ',' + (hy - 52) + ' l-4,-6 M' + (hx + 1) + ',' + (hy - 52) + ' l3,-7 M' + (hx - 9) + ',' + (hy - 33) + ' l-5,-3 M' + (hx + 9) + ',' + (hy - 33) + ' l5,-4 M' + (hx - 6) + ',' + (hy - 16) + ' l-3,4', hw, 1.6) +
      E(hx - 3.4, hy - 44, 1.6, 1.3, '#ffd060') + E(hx + 3.4, hy - 44, 1.6, 1.3, '#ffd060'), 'transform="translate(' + hx + ',' + hy + ') scale(0.62) translate(' + (-hx) + ',' + (-hy) + ')"');
    // wheat fields in perspective
    var vx = 300, vy = 146;
    o += R(-10, 160, 500, 120, c.vgrad('#e0a848', '#b07a30'));
    var rows = '';
    for (var fx = -600; fx < 1100; fx += 34) rows += 'M' + vx + ',' + vy + ' L' + fx + ',280 ';
    var fclip = c.clip('<rect x="-10" y="162" width="500" height="120"/>');
    o += G(L(rows, '#9a6a28', 1.1, 'opacity="0.55"') + L('M-10,178 L490,178 M-10,198 L490,198 M-10,226 L490,226', '#f8d070', 1.2, 'opacity="0.45"'), 'clip-path="url(#' + fclip + ')"');
    o += R(-10, 158, 500, 24, c.lin([[0, '#ffd890', 0.55], [1, '#ffd890', 0]]));
    // dirt road
    o += P('M294,160 L303,160 L352,280 L196,280 Z', c.vgrad('#e0aa6a', '#a8703e'), 1.4);
    o += L('M297,166 L246,280 M301,166 L306,280', '#8a5a30', 1.4, 'opacity="0.55"');
    o += L('M294,160 L196,280 M303,160 L352,280', '#f0c070', 1, 'opacity="0.5"');
    // broken windmill (backlit)
    var wm = '#6a4a44';
    o += P('M96,170 L106,86 L132,86 L144,170 Z', c.lin([[0, dk(wm, 0.25)], [0.6, wm], [0.61, lt(wm, 0.12)], [1, lt('#c07050', 0.1)]], 0, 0, 1, 0), 2);
    o += L('M100,150 L140,150 M102,128 L136,128 M104,106 L134,106', dk(wm, 0.3), 1, 'opacity="0.7"');
    o += P('M112,170 L112,150 Q120,142 128,150 L128,170 Z', '#2a1a1a', 1.6);
    o += P('M100,88 L119,58 L126,66 L130,62 L138,88 Z', c.cel('#5a3a3a'), 1.8);
    o += P('M126,66 L130,62 L132,74 Z', '#2a1a1a');
    // blades (one snapped off)
    o += G(
      P('M0,-2 L-4,-60 L6,-60 L4,-2 Z', c.cel('#8a6a4a'), 1.6) + L('M-4,-50 L6,-50 M-4,-40 L6,-40 M-3,-30 L5,-30', '#4a3020', 1) +
      P('M-2,0 L-58,6 L-58,-4 L-2,-4 Z', c.cel('#8a6a4a'), 1.6) + L('M-48,-4 L-48,6 M-38,-4 L-38,5 M-28,-4 L-28,4', '#4a3020', 1) +
      P('M-2,2 L2,40 L-6,42 L-8,4 Z', c.cel('#8a6a4a'), 1.6) + P('M-6,42 L-2,40 L0,46 L-4,44 Z', '#4a3020', 1) +
      P('M2,-2 L20,-4 L22,2 L3,3 Z', c.cel('#8a6a4a'), 1.6) + E(0, 0, 5, 5, c.cel('#5a4030'), 1.6),
      'transform="translate(119,92) rotate(-12)"');
    // broken blade lying in the field
    o += P('M154,174 L196,170 L196,176 L156,180 Z', c.cel('#7a5a3a'), 1.4);
    // abandoned farmhouse
    o += P('M346,168 L346,128 L420,128 L420,168 Z', c.lin([[0, '#8a5a3a'], [0.6, '#7a4a30'], [0.61, '#5a3a28'], [1, '#4a2e20']], 0, 0, 1, 0), 2);
    o += L('M346,138 L420,138 M346,148 L420,148 M346,158 L420,158', '#3a2418', 1, 'opacity="0.7"');
    o += P('M338,130 L360,100 Q384,104 404,98 L428,130 Z', c.cel('#6a3a2a'), 2);
    o += P('M372,109 L379,104 L384,108 L391,106 L389,115 L382,121 L375,118 Z', '#1a0e0a', 1.4);
    o += L('M373,113 L390,109', '#6a3a2a', 1.8);
    o += P('M406,104 L412,104 L412,90 L406,92 Z', c.cel('#7a5a4a'), 1.4);
    o += P('M356,142 L372,142 L372,158 L356,158 Z', '#1a0e0a', 1.4) + L('M354,146 L374,148 M354,154.5 L374,152.5', OL, 4) + L('M354,146 L374,148 M354,154.5 L374,152.5', '#8a6a4a', 2.4);
    o += P('M394,168 L394,146 L410,146 L410,168 Z', '#2a1810', 1.4) + P('M394,146 L404,150 L404,168 L394,168 Z', '#5a3a28', 1.2);
    // broken fence
    var fence = '';
    [[330, 172, 0], [342, 170, -8], [312, 176, 4], [296, 178, 10], [436, 170, 6], [452, 172, -4]].forEach(function (q) {
      fence += G(R(-2, -14, 4, 14, c.cel('#6a4a30'), 1.2), 'transform="translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ')"');
    });
    o += fence + limb('M296,168 L344,162', '#7a5a3a', 1.6) + limb('M436,162 L466,166', '#7a5a3a', 1.6);
    [[250, 168, 11, 8], [428, 180, 16, 11], [60, 178, 14, 9]].forEach(function (h) {
      o += P('M' + (h[0] - h[2]) + ',' + h[1] + ' C' + (h[0] - h[2]) + ',' + (h[1] - h[3] * 1.6) + ' ' + (h[0] + h[2]) + ',' + (h[1] - h[3] * 1.6) + ' ' + (h[0] + h[2]) + ',' + h[1] + ' Z', c.cel('#d8a040', 0.3, 0.4), 1.4);
      o += L('M' + (h[0] - h[2] * 0.5) + ',' + (h[1] - h[3] * 0.9) + ' l3,5 M' + (h[0] + h[2] * 0.3) + ',' + (h[1] - h[3]) + ' l-2,6', '#9a6a28', 1);
    });
    // dust haze
    o += R(-10, 120, 500, 70, c.lin([[0, '#ffd8a0', 0], [0.5, '#ffcf90', 0.28], [1, '#ffd8a0', 0]]));
    // foreground stubble tufts
    var tufts = '';
    for (var t = 0; t < 26; t++) {
      var tx = r() * 480, ty = 236 + r() * 36;
      if (tx > 150 && tx < 380 && ty < 262) continue;
      tufts += 'M' + n(tx) + ',' + n(ty) + ' l-3,-8 M' + n(tx) + ',' + n(ty) + ' l0,-10 M' + n(tx) + ',' + n(ty) + ' l4,-8 ';
    }
    o += L(tufts, '#8a5a24', 1.4) + L(tufts, '#e8b860', 0.6);
    var wh = '';
    for (var wq = 0; wq < 22; wq++) {
      var wxx = wq < 11 ? r() * 90 - 6 : 396 + r() * 90, wyy = 246 + r() * 30, lean = (r() - 0.5) * 10, hgt = 22 + r() * 16;
      wh += L('M' + n(wxx) + ',' + n(wyy) + ' q' + n(lean * 0.3) + ',' + n(-hgt * 0.5) + ' ' + n(lean) + ',' + n(-hgt), '#6a4418', 1.2);
      wh += E(wxx + lean, wyy - hgt - 3, 2, 5, c.cel('#e8b850'), 0.9, 'transform="rotate(' + n(lean * 2) + ' ' + n(wxx + lean) + ' ' + n(wyy - hgt - 3) + ')"');
    }
    o += wh;
    o += R(0, 0, 480, 270, c.lin([[0, '#ff9a50', 0.12], [1, '#ff9a50', 0]], 1, 0, 0, 0));
    o += vignette(c, 0.4);
    return wrap(c, 480, 270, o);
  }

  function dawnScene() {
    var c = new Ctx(), o = '', r = rng(3);
    o += R(0, 0, 480, 270, c.lin([[0, '#1c2658'], [0.3, '#4e4c8e'], [0.5, '#c07a8e'], [0.62, '#ffc88a'], [1, '#ffe0a0']]));
    // sun + rays
    var rays = '';
    for (var i = 0; i < 9; i++) { var a = Math.PI + (i + 0.5) / 9 * Math.PI, a2 = a + 0.08; rays += 'M236,132 L' + n(236 + Math.cos(a) * 300) + ',' + n(132 + Math.sin(a) * 300) + ' L' + n(236 + Math.cos(a2) * 300) + ',' + n(132 + Math.sin(a2) * 300) + ' Z '; }
    o += P(rays, '#fff4c8', 0, 'opacity="0.13"');
    o += E(236, 132, 190, 110, c.glow('#fff0c0', 0.65));
    o += E(236, 132, 26, 26, c.rad([[0, '#ffffff'], [0.6, '#fff4c0'], [1, '#ffd890']]));
    // soft clouds
    [[70, 60, 70], [170, 40, 90], [360, 52, 100], [430, 86, 60], [110, 96, 60]].forEach(function (q) {
      o += P('M' + (q[0] - q[2] / 2) + ',' + q[1] + ' Q' + (q[0] - q[2] / 4) + ',' + (q[1] - 12) + ' ' + q[0] + ',' + (q[1] - 6) + ' Q' + (q[0] + q[2] / 4) + ',' + (q[1] - 14) + ' ' + (q[0] + q[2] / 2) + ',' + q[1] + ' Z', c.vgrad('#e0a0b8', '#ffc8a0'), 0, 'opacity="0.8"');
    });
    // far mountains with snow
    o += P('M-10,138 L40,96 L70,112 L110,70 L150,108 L180,94 L220,126 L260,118 L300,84 L336,110 L370,76 L410,104 L446,88 L490,120 L490,160 L-10,160 Z', c.vgrad('#8a84b8', '#a494b8'), 1.4);
    o += P('M100,80 L110,70 L122,82 L114,80 L108,86 Z M364,84 L370,76 L380,88 L372,86 Z M294,92 L300,84 L308,94 L300,92 Z M36,100 L40,96 L48,104 Z', '#fff4f4', 1);
    o += P('M110,70 L150,108 L126,114 Z M40,96 L70,112 L52,116 Z M300,84 L262,118 L286,120 Z M370,76 L338,112 L360,116 Z', '#c0a8c8', 0, 'opacity="0.75"');
    o += L('M40,96 L52,116 M110,70 L126,114 M300,84 L286,120 M370,76 L360,116', '#6a6498', 1, 'opacity="0.6"');
    // Stormwind far away on a hill
    var cs = '#b8b4d4', cr = '#4e5aa8';
    o += P('M290,156 Q312,136 350,134 Q388,136 410,156 Z', c.vgrad('#7a88a8', '#667898'), 1.2);
    o += R(318, 122, 64, 18, c.celH(cs), 1);
    for (var cx = 320; cx < 382; cx += 6) o += R(cx, 119, 3.5, 4, cs, 0.8);
    [[322, 104, 8, 20], [336, 96, 8, 26], [350, 84, 10, 38], [366, 98, 8, 24], [378, 108, 7, 16]].forEach(function (t) {
      o += R(t[0], t[1], t[2], t[3], c.celH(cs), 1);
      o += P('M' + (t[0] - 1.5) + ',' + t[1] + ' L' + (t[0] + t[2] / 2) + ',' + (t[1] - t[2] * 1.5) + ' L' + (t[0] + t[2] + 1.5) + ',' + t[1] + ' Z', cr, 1);
    });
    o += E(355, 100, 1.2, 1.6, '#ffe890') + E(340, 110, 1, 1.4, '#ffe890') + E(370, 112, 1, 1.4, '#ffe890');
    o += R(300, 132, 110, 30, c.lin([[0, '#ffd0c0', 0], [1, '#ffd0c0', 0.35]]));
    // rolling forest hills
    function hills(y, amp, col, seed, treeCol, sw) {
      var rr = rng(seed), d = 'M-10,' + y, x;
      var pts = [];
      for (x = -20; x <= 520; x += 52) { var yy = y - amp * (0.2 + rr() * 1.3); pts.push([x, yy]); }
      d = 'M-20,280 L-20,' + n(pts[0][1]);
      var ridge = 'M-20,' + n(pts[0][1]);
      for (var k = 1; k < pts.length; k++) { var mx = (pts[k - 1][0] + pts[k][0]) / 2, seg = ' Q' + n(pts[k - 1][0]) + ',' + n(pts[k - 1][1]) + ' ' + n(mx) + ',' + n((pts[k - 1][1] + pts[k][1]) / 2); d += seg; ridge += seg; }
      var last = pts[pts.length - 1];
      d += ' L' + n(last[0]) + ',' + n(last[1]) + ' L' + n(last[0]) + ',280 Z';
      var s = P(d, c.vgrad(lt(col, 0.1), dk(col, 0.3)), sw);
      // tree clumps along the ridge
      var tr = '';
      for (var j = 0; j < pts.length - 1; j++) {
        var n2 = 3 + Math.floor(rr() * 3);
        for (var q = 0; q < n2; q++) {
          var t = rr(), px = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, py = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t + amp * 0.2, rad2 = amp * (0.4 + rr() * 0.35);
          tr += E(px, py + rad2 * 0.3, rad2, rad2 * 0.9, c.cel(treeCol, 0.25, 0.3), sw * 0.8);
        }
      }
      return tr + s + L(ridge, '#ffe0a0', sw * 0.9, 'opacity="0.35"');
    }
    o += hills(160, 12, '#5a7a8a', 21, '#5a7a8e', 1);
    o += R(-10, 152, 500, 16, c.lin([[0, '#ffe8e0', 0], [0.5, '#ffe8e0', 0.3], [1, '#ffe8e0', 0]]));
    o += hills(186, 16, '#3f6a52', 22, '#44705a', 1.3);
    o += R(-10, 180, 500, 14, c.lin([[0, '#ffe0c8', 0], [0.5, '#ffe0c8', 0.22], [1, '#ffe0c8', 0]]));
    o += hills(214, 20, '#2f5a36', 23, '#3a6a3a', 1.6);
    // foreground grassy crest
    o += P('M-10,238 Q80,220 170,230 Q260,240 340,226 Q420,214 490,228 L490,280 L-10,280 Z', c.vgrad('#5a8a3a', '#2e5222'), 2);
    o += L('M-10,238 Q80,220 170,230 Q260,240 340,226 Q420,214 490,228', '#e8d080', 1.6, 'opacity="0.7"');
    var gr = '';
    for (var g = 0; g < 30; g++) { var gx = r() * 480, gy = 244 + r() * 26; gr += 'M' + n(gx) + ',' + n(gy) + ' l-2,-7 M' + n(gx) + ',' + n(gy) + ' l2,-8 '; }
    o += L(gr, '#23401a', 1.4);
    // framing oak on the left
    o += P('M20,280 L24,200 Q18,180 8,172 L14,168 Q26,178 30,190 Q36,176 50,170 L52,176 Q38,184 36,204 L40,280 Z', c.celH('#4a3424'), 1.8);
    o += E(-4, 150, 44, 34, c.cel('#2e5a2c', 0.2, 0.35), 2) + E(40, 138, 40, 30, c.cel('#35662e', 0.25, 0.35), 2) + E(10, 116, 42, 30, c.cel('#2e5a2c', 0.2, 0.35), 2) + E(58, 160, 26, 20, c.cel('#2a5228', 0.2, 0.35), 2);
    o += E(46, 128, 14, 8, '#ffd890', 0, 'opacity="0.35"');
    o += vignette(c, 0.4);
    return wrap(c, 480, 270, o);
  }

  // =====================================================================
  // ACTORS (160 x 160, transparent, facing LEFT, feet on bottom edge)
  // =====================================================================

  // Lady Prestor silhouette parts; shadow=true renders the dragon reveal
  function prestor(shadow) {
    var c = new Ctx(), o = '';
    var SK = '#f2d8c6', HAIR = '#262030', RED = '#8a1424', BLK = '#281c24', GOLD = '#e2b23e';
    var S = shadow ? c.lin([[0, '#2a1420'], [0.5, '#0e060a'], [1, '#050204']]) : null;
    function F(col, cel) { return shadow ? S : (cel === false ? col : c.cel(col)); }
    var parts = [];
    var collar = 'M66,52 C56,42 52,28 56,12 C62,22 70,32 76,42 L84,42 C90,32 98,20 106,10 C110,26 104,42 94,52 Z';
    var hairBack = 'M74,16 C88,10 100,20 100,34 C102,54 108,78 110,98 Q100,104 92,98 C90,78 88,58 84,44 Z';
    var skirt = 'M70,74 C64,100 54,128 44,155 Q62,159 84,158 Q108,159 128,155 C116,134 102,104 92,74 Z';
    var bodice = 'M65,52 Q80,47 95,52 C95,62 93,70 92,76 Q81,80 70,76 C69,70 67,62 65,52 Z';
    var farArm = 'M90,54 C98,58 101,72 101,86 L95,88 C93,76 91,66 88,60 Z';
    var head = 'M71,22 C74,15 86,14 90,20 C92,26 92,34 88,40 C85,44 80,46 76,45 C73,44 71,41 70,38 L67.5,33 L70,31.5 C70,28 70,25 71,22 Z';
    var hairTop = 'M70,22 C68,11 80,6 91,11 C99,15 101,27 99,38 C97,30 94,23 88,19.5 C82,16.8 75,17.6 70,22 Z';
    var neck = 'M75,38 L75,48 L84,48 L84,38 Z';
    if (shadow) {
      o += E(80, 76, 86, 86, c.glow('#ff2a1a', 0.55));
      o += E(96, 155, 62, 6, c.rad([[0, '#1a0004', 0.8], [0.7, '#1a0004', 0.4], [1, '#1a0004', 0]]));
      // wings unfurling from the shadow's back
      var mem = c.lin([[0, '#2e0a14'], [0.55, '#10040a'], [1, '#050103']]);
      var back = wing([72, 56], [36, 22], [[4, 6], [2, 46], [14, 80], [38, 98]], [64, 84], mem, '#1c060c', 1.8);
      back += wing([90, 56], [124, 18], [[158, 2], [159, 40], [150, 74], [126, 96]], [98, 86], mem, '#1c060c', 1.8);
      // tail slipping out beneath the gown
      back += P('M108,150 C130,152 148,142 152,124 C154,114 148,108 142,110 C148,122 136,140 106,144 Z', S, 1.8);
      var rimB = back.replace(/url\(#[^)]+\)/g, '#e0301e').replace(/stroke="#1a1009"/g, 'stroke="#e0301e"');
      o += G(rimB, 'transform="translate(1.6,-1.2)"') + back;
    } else {
      o += E(86, 155, 46, 5, c.shade());
    }
    var body = '';
    body += P(collar, F(BLK), 1.8);
    if (!shadow) body += P('M68,50 C60,40 58,30 59,19 C64,27 70,35 76,43 Z M92,50 C98,40 102,30 103,17 C97,26 91,34 84,43 Z', c.cel(RED), 1);
    body += P(hairBack, F(HAIR), 1.8);
    body += P(farArm, F(BLK), 1.6) + (shadow ? '' : E(98, 89, 3, 3.4, c.cel(SK), 1.2));
    body += P(skirt, F(RED), 2);
    if (!shadow) {
      body += P('M77,76 C75,104 71,130 67,157 L88,158 C89,130 89,104 88,76 Z', c.cel(BLK), 1.4);
      body += L('M77,76 C75,104 71,130 67,157 M88,76 C89,104 89,130 88,158', GOLD, 1.4);
      body += L('M98,96 C104,118 110,136 118,154 M62,104 C58,122 54,138 50,154', dk(RED, 0.35), 1.2);
      body += L('M44,155 Q62,159 84,158 Q108,159 128,155', GOLD, 1.4);
    }
    body += P(bodice, F(BLK), 1.8);
    if (!shadow) {
      body += P('M74,53 L80,72 L86,53 Q80,51 74,53 Z', c.cel(RED), 1.2) + L('M76,58 L84,58 M77,63 L83,63 M78,68 L82,68', GOLD, 0.9);
      body += P('M69,74 Q81,79 93,74 L93,78 Q81,83 69,78 Z', c.cel(GOLD), 1.2) + E(81, 79, 2.6, 2.6, '#c01a2a', 1);
    }
    body += P(neck, F(SK), 1.4);
    // raised hand (becomes a claw in shadow)
    body += limb('M70,55 L60,70 L50,60', shadow ? '#0e060a' : BLK, 6);
    if (!shadow) {
      body += P('M53,58 L47,54 L52,63 Z', c.cel(RED), 1);
      body += P('M50.4,61 C46.6,60.4 44.8,56.6 45.2,52.4 C45.4,49.4 46.4,46.8 48.2,46.4 C50,46.2 51.6,48.2 52.2,50.8 L54.4,51.4 C55.2,52 54.6,53.4 53.4,54.4 C53.8,57.6 53,60.4 50.4,61 Z', c.cel(SK), 1) + L('M47.4,48.6 L48.4,53 M49.6,48 L50.2,52.6', dk(SK, 0.3), 0.6);
    } else {
      body += P('M50,60 C45,58 44,54 44,50 L40,44 L47,50 L47,44 L50,49 L53,43 L53,51 L57,47 C56,55 54,59 50,60 Z', S, 1.4);
    }
    body += P(head, F(SK), 1.6);
    body += P(hairTop, F(HAIR), 1.6);
    if (!shadow) {
      body += L('M75,15 C82,12 90,14 95,20', '#4a4458', 1.2);
      body += L('M70.6,26.6 Q73.6,24 78.4,25.6 M82.2,25.8 Q85.4,24 88,24.6', OL, 1.3);
      body += P('M71.6,28.4 L78.4,28 Q76.8,30.9 73,30.4 Z', '#fff8f0', 0.8) + E(76, 29.2, 1.25, 1.2, '#3a8a5a') + E(76.1, 29.2, 0.55, 0.6, OL);
      body += P('M82.4,28.2 L87.8,28.4 Q86.4,30.6 83.4,30.3 Z', '#fff8f0', 0.8) + E(85.2, 29.2, 1.1, 1.1, '#3a8a5a') + E(85.3, 29.2, 0.5, 0.55, OL);
      body += L('M71.4,28.4 L78.6,27.8 M82.2,28.1 L88,28.3', OL, 1.3);
      body += P('M73.4,38.6 L77.4,38.9 Q79.2,38.5 80.2,37.2 Q79.2,40 77,40.2 Q74.8,40.2 73.4,38.6 Z', '#a01424', 0.6) + L('M73.4,38.6 L77.4,38.9 Q79.2,38.5 80.4,37', OL, 0.9);
      body += E(88.3, 37, 1.2, 2.2, GOLD, 0.8) + E(88.3, 40.2, 1.2, 1.6, '#c01a2a', 0.7);
      body += L('M75,46 Q79.5,49 84,46', GOLD, 1.6) + P('M79.5,48 L81.3,50.6 L79.5,53 L77.7,50.6 Z', '#c01a2a', 0.8);
      body += P('M88,12 L97,9 L95,14 Z', GOLD, 1) + E(94, 12, 1.4, 1.4, '#c01a2a', 0.6);
      body += L('M70.4,21.6 C74,18.8 78,18 82,18.4', GOLD, 1.2);
    }
    if (shadow) {
      // red rim light, then the black figure
      var rim = function (col) { return body.replace(/url\(#[^)]+\)/g, col).replace(/stroke="#1a1009"/g, 'stroke="' + col + '"'); };
      o += G(rim('#ff3a24'), 'transform="translate(2,0.6)"');
      o += G(rim('#9a1422'), 'transform="translate(-1.4,-1)"');
      o += body;
      // horns
      var HN = c.lin([[0, '#3a1a20'], [1, '#0a0406']]);
      o += P('M75,19 C74,9 80,2 92,1 C86,5 83,11 83,19 Z', HN, 1.6) + L('M77,15 C78,8 83,4 89,2.4', '#ff3a24', 0.9, 'opacity="0.7"');
      o += P('M84,19 C88,6 100,-2 116,0 C104,4 96,12 92,24 Z', HN, 1.6);
      o += L('M86,17 C92,8 102,3 112,1', '#ff3a24', 0.9, 'opacity="0.8"');
      // glowing eyes and a thin burning smile
      o += E(76, 29, 9, 6, c.glow('#ff5a1a', 0.9)) + E(86, 29, 8, 5, c.glow('#ff5a1a', 0.8));
      o += P('M71.8,29.4 L78.4,27.8 L77.4,30.4 Z', '#ffd060', 0.6) + P('M82.6,28 L88,29 L83.4,30.4 Z', '#ffd060', 0.6);
      o += L('M72.5,38.4 Q76,40 80.5,36.6', '#ff5a24', 1.1);
    } else {
      o += body;
    }
    return wrap(c, 160, 160, o);
  }

  function onyxia() {
    var c = new Ctx(), o = '';
    var BODY = '#2a2430', BELLY = '#6a4a3a', MEM = '#4a2226', HORN = '#6a5a52';
    o += E(88, 155, 70, 6, c.shade());
    o += E(40, 44, 40, 30, c.glow('#ff9a20', 0.25));
    // far wing (forward, darker)
    o += wing([80, 78], [58, 20], [[28, 2], [30, 34], [48, 58]], [70, 88], c.cel(dk(MEM, 0.35), 0.15, 0.3), dk(BODY, 0.2), 1.6);
    // tail (cropped right)
    o += P('M118,116 C140,120 156,110 170,92 L170,112 C156,130 138,140 114,136 Z', c.cel(BODY), 1.8);
    for (var s = 0; s < 4; s++) o += P('M' + (130 + s * 9) + ',' + (116 - s * 6) + ' l4,-7 l3,6 Z', dk(BODY, 0.2), 1.2);
    // far legs
    o += P('M108,120 L118,150 L128,155 L110,155 L100,126 Z', c.cel(dk(BODY, 0.25)), 1.6);
    o += P('M72,120 L80,150 L88,155 L70,155 L66,128 Z', c.cel(dk(BODY, 0.25)), 1.6);
    // near wing (raised back)
    o += wing([94, 76], [112, 16], [[150, -8], [166, 26], [164, 58], [150, 82]], [118, 98], c.cel(MEM, 0.2, 0.35), BODY, 1.8);
    // body
    o += P('M58,96 C62,80 84,74 104,80 C124,86 132,104 126,124 C120,138 96,142 78,136 C62,130 54,112 58,96 Z', c.cel(BODY, 0.25, 0.4), 2);
    o += P('M60,106 C64,126 86,138 112,136 C98,130 78,124 68,102 Z', c.cel(BELLY), 1.4);
    o += L('M66,114 q4,-3 7,1 M72,122 q5,-3 8,1 M82,128 q5,-2 8,2 M94,132 q5,-2 8,2', dk(BELLY, 0.4), 1);
    // near hind leg
    o += P('M100,106 C116,100 130,112 126,128 L130,149 L140,155 L112,155 L112,146 L106,134 C98,128 94,116 100,106 Z', c.cel(BODY, 0.25, 0.4), 2);
    o += P('M112,155 l-4,2 l4,-6 Z M120,155 l-3,3 l3,-7 Z M130,155 l-2,3 l2,-6 Z', '#d8ccb8', 1);
    // neck
    o += P('M58,100 C48,90 40,76 36,60 L50,50 C54,64 62,76 82,82 Z', c.cel(BODY, 0.25, 0.4), 2);
    o += P('M58,100 C50,92 44,80 40,66 L45,62 C48,74 54,84 64,92 Z', c.cel(BELLY), 1.2);
    for (var k = 0; k < 6; k++) { var t = k / 5, x = 48 + t * 44, y = 50 + t * 28 - Math.sin(t * 3.1) * 4; o += P('M' + n(x - 3) + ',' + n(y + 1) + ' L' + n(x + 1) + ',' + n(y - 7) + ' L' + n(x + 4) + ',' + n(y + 2) + ' Z', dk(BODY, 0.15), 1.2); }
    // front leg
    o += P('M64,104 C54,110 50,124 52,136 L46,149 L34,155 L60,155 L60,146 L68,128 C72,120 72,110 64,104 Z', c.cel(BODY, 0.25, 0.4), 2);
    o += P('M34,155 l-4,1 l5,-5 Z M42,155 l-3,2 l3,-6 Z M50,155 l-2,2 l2,-6 Z', '#d8ccb8', 1);
    // head
    o += P('M54,36 C62,24 74,20 88,22 C76,26 66,32 60,44 Z', c.cel(HORN), 1.6);
    o += P('M50,34 C52,20 60,12 72,8 C64,16 60,26 58,40 Z', c.cel(HORN), 1.6);
    o += P('M40,58 L14,56 C18,62 28,65 40,64 Z', c.cel(dk(BODY, 0.1)), 1.6);
    o += P('M18,57 l2,3 l2,-3 M26,58 l2,3 l2,-3', '#f0e8d8', 0.8);
    o += P('M58,40 C52,32 42,32 32,36 L14,44 C8,46 6,50 8,53 L14,56 C22,58 30,60 42,59 C52,58 60,52 58,40 Z', c.cel(BODY, 0.3, 0.4), 2);
    o += L('M14,44 C24,42 34,40 44,42', lt(BODY, 0.25), 1.2);
    o += P('M28,41 C33,36 42,36 46,40 C40,40 34,42 28,44 Z', dk(BODY, 0.2), 1.2);
    o += E(38, 43, 9, 6, c.glow('#ffb020', 0.95));
    o += P('M32,43.5 L42,41 L40,45 Z', '#ffd040', 0.9);
    o += E(12, 48, 1.4, 1, OL);
    return wrap(c, 160, 160, o);
  }

  function nefarian() {
    var c = new Ctx(), o = '';
    var BODY = '#221c26', PLATE = '#4a3e52', MEM = '#34203a', HORN = '#2e2830', GLOW = '#c040b0';
    o += E(80, 70, 90, 80, c.glow(GLOW, 0.5));
    o += E(84, 155, 72, 6, c.shade());
    // wings spread wide
    o += wing([70, 70], [38, 12], [[6, -4], [0, 30], [8, 58], [30, 72]], [60, 88], c.cel(dk(MEM, 0.3), 0.15, 0.3), dk(BODY, 0.1), 1.8);
    o += P('M120,120 C144,124 158,116 172,100 L172,120 C158,136 140,144 116,140 Z', c.cel(BODY), 1.8);
    o += P('M106,122 L116,150 L128,155 L106,155 L98,128 Z', c.cel(dk(BODY, 0.25)), 1.6);
    o += wing([98, 70], [124, 8], [[164, -6], [168, 30], [162, 62], [142, 86]], [110, 98], c.cel(MEM, 0.2, 0.35), BODY, 1.8);
    // bulky body
    o += P('M42,96 C46,72 76,62 102,68 C126,74 138,98 132,122 C126,142 96,148 72,142 C50,136 38,118 42,96 Z', c.cel(BODY, 0.25, 0.45), 2.2);
    // back spikes
    for (var k = 0; k < 6; k++) { var x = 78 + k * 9, y = 68 + k * 2.4; o += P('M' + (x - 4) + ',' + (y + 2) + ' L' + (x + 2) + ',' + (y - 11) + ' L' + (x + 5) + ',' + (y + 3) + ' Z', c.cel(HORN), 1.3); }
    // armoured chest plates
    for (var p = 0; p < 5; p++) {
      var py = 84 + p * 11, px0 = 44 + p * 2, px1 = 80 + p * 5;
      o += P('M' + px0 + ',' + py + ' Q' + ((px0 + px1) / 2) + ',' + (py - 4) + ' ' + px1 + ',' + (py + 2) + ' L' + (px1 - 1) + ',' + (py + 10) + ' Q' + ((px0 + px1) / 2) + ',' + (py + 5) + ' ' + (px0 + 1) + ',' + (py + 9) + ' Z', c.cel(PLATE, 0.3, 0.35), 1.4);
      o += L('M' + (px0 + 3) + ',' + (py + 1) + ' Q' + ((px0 + px1) / 2) + ',' + (py - 2.5) + ' ' + (px1 - 3) + ',' + (py + 2.5), lt(GLOW, 0.3), 0.8, 'opacity="0.7"');
    }
    // shoulder plate
    o += P('M84,74 C96,68 110,72 114,84 C108,92 94,94 84,88 Z', c.cel(PLATE, 0.3, 0.35), 1.6);
    o += P('M92,72 l4,-9 l3,9 Z M102,74 l5,-8 l2,9 Z', c.cel(HORN), 1.2);
    // hind leg (near)
    o += P('M100,108 C118,100 134,114 128,130 L132,149 L142,155 L112,155 L112,146 L106,134 C98,128 94,116 100,108 Z', c.cel(BODY, 0.25, 0.45), 2);
    o += P('M112,120 C118,116 126,120 126,126 C120,128 114,126 112,120 Z', c.cel(PLATE), 1.2);
    o += P('M112,155 l-4,2 l4,-6 Z M122,155 l-3,3 l3,-7 Z M132,155 l-2,3 l2,-6 Z', '#cfc4d4', 1);
    // thick neck
    o += P('M46,100 C38,88 36,72 40,62 L60,54 C62,68 70,78 86,80 Z', c.cel(BODY, 0.25, 0.45), 2);
    for (var q = 0; q < 3; q++) o += P('M' + (40 + q * 2) + ',' + (72 + q * 9) + ' Q' + (48 + q * 3) + ',' + (68 + q * 9) + ' ' + (54 + q * 4) + ',' + (74 + q * 9) + ' L' + (52 + q * 4) + ',' + (80 + q * 9) + ' Q' + (46 + q * 3) + ',' + (76 + q * 9) + ' ' + (42 + q * 2) + ',' + (79 + q * 9) + ' Z', c.cel(PLATE, 0.3, 0.35), 1.2);
    // front leg, armoured
    o += P('M50,106 C40,112 36,126 38,138 L32,149 L20,155 L48,155 L48,146 L56,128 C60,120 60,110 50,106 Z', c.cel(BODY, 0.25, 0.45), 2);
    o += P('M40,114 C46,110 54,112 56,118 L52,128 C46,126 40,122 40,114 Z', c.cel(PLATE), 1.3);
    o += P('M20,155 l-4,1 l5,-5 Z M28,155 l-3,2 l3,-6 Z M36,155 l-2,2 l2,-6 Z', '#cfc4d4', 1);
    // head with a crown of horns
    o += P('M56,48 C60,30 72,20 92,16 C78,24 70,34 66,52 Z', c.cel(HORN, 0.35, 0.4), 1.8);
    o += P('M48,44 C44,26 50,12 64,2 C58,16 56,28 58,46 Z', c.cel(HORN, 0.35, 0.4), 1.8);
    o += P('M40,44 C34,32 34,22 40,14 C40,24 42,32 46,42 Z', c.cel(HORN, 0.35, 0.4), 1.5);
    o += P('M44,70 L10,68 C14,75 26,80 42,78 Z', c.cel(dk(BODY, 0.1)), 1.6);
    o += P('M16,70 C24,73 34,74 42,72 L42,75 C32,76 22,75 16,72 Z', c.rad([[0, '#ffc0ff'], [1, GLOW]]));
    o += P('M16,69 l2,3 l2,-3 M24,70 l2,3 l2,-3 M32,70 l2,3 l2,-3', '#f0e8f0', 0.8);
    o += P('M62,54 C56,42 44,40 34,44 L12,54 C6,56 4,62 8,66 L14,68 C24,71 36,72 46,70 C58,68 64,62 62,54 Z', c.cel(BODY, 0.3, 0.45), 2.2);
    o += P('M16,54 C26,50 36,48 46,50 L44,54 C34,53 24,55 16,58 Z', c.cel(PLATE, 0.3, 0.3), 1.2);
    o += P('M56,62 C66,62 74,66 80,74 C70,70 62,68 56,68 Z', c.cel(HORN), 1.4);
    o += P('M10,62 l-4,4 l6,-1 Z M18,66 l-2,5 l4,-4 Z', c.cel(HORN), 1);
    o += P('M28,50 C33,45 42,45 46,49 C40,49 34,51 28,53 Z', dk(BODY, 0.3), 1.2);
    o += E(38, 53, 10, 7, c.glow('#ff70ff', 0.95));
    o += P('M32,54 L43,51 L41,55.5 Z', '#ffc0ff', 0.9);
    o += E(11, 58, 1.4, 1, OL);
    return wrap(c, 160, 160, o);
  }

  function ragnaros() {
    var c = new Ctx(), o = '';
    var ROCK = '#3a2420', CORE = c.lin([[0, '#ffe080'], [0.4, '#ff8a20'], [1, '#c02a0a']]);
    o += E(80, 84, 88, 86, c.glow('#ff6a10', 0.55));
    // backdrop of flames
    o += fire(80, 128, 110, 138, ['#c82a08', '#ff7a1a', '#ffd040'], 1.8);
    o += fire(36, 120, 44, 80, ['#c82a08', '#ff7a1a', '#ffd040'], 1.6, -6) + fire(126, 120, 44, 86, ['#c82a08', '#ff7a1a', '#ffd040'], 1.6, 6);
    // lava pool back
    o += E(80, 148, 80, 13, c.vgrad('#ffe070', '#ff7a1a'), 2);
    // right arm (resting into the flames)
    o += limb('M120,74 L144,98 L134,124', ROCK, 15) + L('M122,78 L141,98 L133,120', '#ff8a20', 1.6);
    o += E(134, 126, 10, 9, c.cel(ROCK), 2) + fire(134, 124, 14, 22, ['#e0501a', '#ffa030', '#fff0a0'], 1.2);
    // torso: molten core with rock plates
    o += P('M56,148 C52,124 44,100 38,78 C36,68 44,60 56,58 L104,58 C116,60 124,68 122,78 C116,100 108,124 104,148 Z', CORE, 2);
    var PL = c.cel(ROCK, 0.3, 0.4);
    o += P('M44,66 C52,60 70,60 78,64 L76,86 C66,92 52,90 46,82 Z', PL, 1.8);
    o += P('M82,64 C90,60 108,60 116,66 L114,82 C108,90 94,92 84,86 Z', PL, 1.8);
    [[92, 104], [106, 118], [120, 132], [134, 146]].forEach(function (yy, i) {
      var inset = i * 3;
      o += P('M' + (54 + inset) + ',' + yy[0] + ' L78,' + (yy[0] - 1) + ' L78,' + (yy[1] - 2) + ' L' + (56 + inset) + ',' + (yy[1] - 1) + ' Z', PL, 1.6);
      o += P('M82,' + (yy[0] - 1) + ' L' + (106 - inset) + ',' + yy[0] + ' L' + (104 - inset) + ',' + (yy[1] - 1) + ' L82,' + (yy[1] - 2) + ' Z', PL, 1.6);
    });
    o += L('M52,74 l8,4 l4,-3 M96,72 l6,5 l6,-2 M60,112 l6,3 M92,126 l7,2', '#ff9a30', 1.2);
    // shoulders
    o += P('M26,70 C26,56 40,50 52,56 C58,62 56,78 46,84 C36,86 26,80 26,70 Z', PL, 2) + P('M134,70 C134,56 120,50 108,56 C102,62 104,78 114,84 C124,86 134,80 134,70 Z', PL, 2);
    o += L('M32,64 l8,4 l2,8 M128,64 l-8,4 l-2,8', '#ff9a30', 1.3);
    // lava lip in front
    o += P('M0,146 Q20,140 44,146 Q62,152 80,146 Q100,140 118,146 Q140,152 160,146 L160,160 L0,160 Z', c.vgrad('#ffd060', '#e0501a'), 2);
    o += L('M14,152 q6,-3 12,0 M60,154 q6,-3 12,0 M104,152 q6,-3 12,0 M140,154 q5,-2 10,0', '#fff4b0', 1.3);
    // head with horns and flame hair
    o += fire(80, 26, 34, 40, ['#e0501a', '#ffa030', '#fff0a0'], 1.4);
    o += P('M68,32 C52,30 38,20 34,2 C44,12 58,18 70,22 Z', c.cel('#2a1a18', 0.3, 0.3), 1.8);
    o += P('M92,32 C108,30 122,20 126,2 C116,12 102,18 90,22 Z', c.cel('#2a1a18', 0.3, 0.3), 1.8);
    o += L('M36,6 C42,14 52,20 62,24 M124,6 C118,14 108,20 98,24', '#ff8a30', 1, 'opacity="0.7"');
    o += P('M64,28 C66,16 94,16 96,28 L98,44 C96,56 88,62 80,62 C72,62 64,56 62,44 Z', c.cel(ROCK, 0.3, 0.4), 2);
    o += P('M61,31 L78,40 L80,38 L82,40 L99,31 L96,26 L80,33 L64,26 Z', dk(ROCK, 0.3), 1.4);
    o += E(71, 40, 8, 5, c.glow('#fff080', 0.9)) + E(89, 40, 8, 5, c.glow('#fff080', 0.9));
    o += P('M65,37 L77,42 L75,44.5 L66,41 Z', '#fff4a0', 0.9) + P('M95,37 L83,42 L85,44.5 L94,41 Z', '#fff4a0', 0.9);
    o += P('M68,49 L92,49 L89,58 L71,58 Z', '#ffb030', 1.4) + P('M72,58 L80,54 L88,58 Z', '#ffe070');
    o += P('M70.5,49 l2.2,4.5 l2.2,-4.5 Z M78,49 l2,3.6 l2,-3.6 Z M85.3,49 l2.2,4.5 l2.2,-4.5 Z M73,58 l1.8,-3.6 l1.8,3.6 Z M84.4,58 l1.8,-3.6 l1.8,3.6 Z', dk(ROCK, 0.2), 0.8);
    // flame beard pouring down the chest
    o += P('M68,56 C70,66 74,74 80,86 C86,74 90,66 92,56 Q80,62 68,56 Z', '#ff8a20', 1.4) + P('M74,58 C76,66 78,72 80,78 C82,72 84,66 86,58 Q80,62 74,58 Z', '#ffe070');
    // left arm raising Sulfuras
    o += E(18, 28, 34, 30, c.glow('#ffb030', 0.7));
    o += limb('M18,130 L18,40', '#2a1a14', 5.5) + L('M18,60 L18,64 M18,90 L18,94 M18,116 L18,120', '#ffb030', 5.5);
    o += P('M-3,12 L7,19 L29,17 L39,9 L42,47 L32,40 L10,42 L0,50 Z', c.cel(ROCK, 0.3, 0.45), 2);
    o += P('M9,22 L29,20 L31,38 L11,40 Z', c.rad([[0, '#fff8c0'], [0.5, '#ffb030'], [1, '#e04a10']]), 1.4);
    o += L('M14,25 l4,5 l-2,6 M25,23 l-3,6 l4,6', '#fff8d0', 1);
    o += L('M0,18 L4,44 M38,14 L40,42', '#ff8a30', 1.2, 'opacity="0.8"');
    o += fire(18, 18, 22, 26, ['#e0501a', '#ffa030', '#fff0a0'], 1.2, -2);
    o += limb('M38,74 L20,94 L18,70', ROCK, 14) + L('M36,78 L22,92 L20,74', '#ff8a20', 1.4);
    o += E(18, 70, 10, 9, c.cel(ROCK, 0.3, 0.4), 2);
    return wrap(c, 160, 160, o);
  }

  function bolvar() {
    var c = new Ctx(), o = '';
    var PL = '#e8eaf0', GOLD = '#e2b23e', BLUE = '#2456a8', SK = '#e8b48c', HAIR = '#c89a4a';
    o += E(84, 155, 46, 5, c.shade());
    // cape
    o += P('M64,50 C56,82 48,120 42,152 Q86,160 128,150 C120,116 110,80 100,50 Z', c.cel(BLUE, 0.25, 0.45), 2);
    o += L('M78,60 C76,96 74,124 70,152 M96,62 C104,94 110,124 114,150', dk(BLUE, 0.35), 1.2);
    // legs
    o += P('M84,108 L86,146 L100,146 L98,108 Z', c.cel(dk(PL, 0.12)), 1.8) + P('M84,144 L102,144 L104,155 L84,155 Z', c.cel(dk(PL, 0.15)), 1.8);
    o += P('M62,108 L62,146 L76,146 L78,108 Z', c.cel(PL), 1.8) + P('M52,146 L78,144 L78,155 L50,155 Q48,150 52,146 Z', c.cel(PL), 1.8);
    o += E(70, 124, 6, 5, c.cel(GOLD), 1.4) + E(92, 124, 5.5, 4.5, c.cel(dk(GOLD, 0.1)), 1.4);
    // faulds + tabard
    o += P('M58,90 L102,90 L106,114 L54,114 Z', c.cel(PL), 1.8);
    o += L('M56,102 L104,102', GOLD, 1.6) + L('M54,114 L106,114', GOLD, 2);
    o += P('M72,88 L90,88 L92,126 L81,132 L70,126 Z', c.cel(BLUE), 1.6);
    o += L('M73,90 L73,125 L81,130 L89,125 L89,90', GOLD, 1.2);
    o += P('M81,98 l5,4 l-2,7 l-3,2 l-3,-2 l-2,-7 Z', c.cel(GOLD), 1);
    // breastplate
    o += P('M58,52 Q80,45 102,52 L104,92 Q80,98 56,92 Z', c.cel(PL), 2);
    o += L('M80,50 L80,94', GOLD, 1.6) + L('M58,52 Q80,45 102,52', GOLD, 1.8) + L('M60,72 Q80,78 100,72', dk(PL, 0.25), 1.2);
    o += P('M58,88 Q80,94 104,88 L104,93 Q80,99 56,93 Z', c.cel(GOLD), 1.4);
    // far arm to the pommel
    o += limb('M100,60 L100,82 L70,92', dk(PL, 0.1), 8);
    // sword planted before him
    o += P('M59,102 L68,102 L65.5,148 L63.5,154 L61.5,148 Z', c.lin([[0, '#f8fbff'], [0.5, '#c2cad3'], [1, '#7c8793']], 0, 0, 1, 0), 1.6);
    o += L('M63.5,104 L63.5,146', '#8e99a5', 0.8);
    o += P('M48,97 L79,97 L81,103 L46,103 Z', c.cel(GOLD), 1.6) + E(46, 100, 2.6, 2.6, c.cel(GOLD), 1.2) + E(81, 100, 2.6, 2.6, c.cel(GOLD), 1.2);
    o += R(60.5, 84, 6, 13, c.celH('#5a3a24'), 1.4) + E(63.5, 83, 3.6, 3.6, c.cel(GOLD), 1.4);
    // near arm
    o += limb('M60,60 L50,78 L60,90', PL, 8);
    o += E(63.5, 92, 7.5, 5.5, c.cel(GOLD), 1.6);
    // pauldrons
    o += P('M88,46 C100,40 114,46 114,58 C108,68 92,66 88,58 Z', c.cel(GOLD), 1.8) + L('M92,50 C100,46 108,48 111,54', lt(GOLD, 0.45), 1.2);
    o += P('M46,58 C46,46 58,40 70,46 L74,58 C70,68 52,70 46,58 Z', c.cel(GOLD), 1.8) + P('M48,58 C50,52 58,50 66,52 L68,57 C62,61 54,62 48,58 Z', c.cel(PL), 1.2);
    // gorget + head
    o += P('M70,44 L90,44 L92,52 Q80,56 68,52 Z', c.cel(GOLD), 1.6);
    o += P('M69,26 C70,14 82,10 90,14 C96,18 97,28 95,36 C93,44 86,48 79,48 C74,48 70,44 69,40 L66,35 L68.5,33 Z', c.cel(SK), 1.8);
    // short beard
    o += P('M69,38 C70,46 76,51 82,51 C88,51 93,46 95,38 C92,42 88,43 84,42 C80,40 74,40 69,38 Z', c.cel(HAIR, 0.25, 0.4), 1.4);
    o += L('M73,40.8 Q77,39 81,40.8', dk(HAIR, 0.3), 1.2);
    // swept-back hair
    o += P('M68,24 C68,12 80,6 90,9 C98,12 100,22 98,32 L94,26 C92,22 88,20 84,20 C78,20 72,22 68,24 Z', c.cel(HAIR, 0.3, 0.4), 1.6);
    o += P('M94,26 C98,26 100,32 97,38 L94,36 Z', c.cel(HAIR), 1.2);
    // stern brow, eyes, mouth
    o += L('M70.5,27 L78,28.6 M82.5,28.6 L89,27.4', OL, 1.8);
    o += E(75, 31, 1.3, 1.3, OL) + E(85.2, 31, 1.2, 1.2, OL);
    o += L('M68.5,33 L67.5,36', dk(SK, 0.35), 1) + L('M74,44 L81,44', OL, 1.3);
    o += E(92, 32, 2, 3, c.cel(SK), 1.2);
    return wrap(c, 160, 160, o);
  }

  function vancleefStory() {
    var c = new Ctx(), o = '';
    var BLK = '#1e1616', LEA = '#2e2224', RED = '#b8242a', SK = '#dcab80', GOLD = '#d6a53c';
    var STEEL = c.lin([[0, '#f4f7fa'], [0.5, '#c2cad3'], [1, '#7c8793']], 0, 0, 1, 1);
    o += E(84, 155, 54, 5, c.shade());
    // billowing cape
    o += P('M80,52 C100,48 134,58 156,82 C148,96 152,116 146,132 C132,122 118,128 104,118 C102,96 96,72 80,52 Z', c.cel(BLK, 0.2, 0.4), 2);
    o += P('M100,58 C122,64 140,76 150,86 C142,94 138,106 140,120 C128,114 118,114 110,108 C108,90 104,72 100,58 Z', c.cel(dk(RED, 0.15)), 1.6);
    o += L('M112,70 C118,86 124,100 128,114 M126,78 C132,90 136,100 138,110', dk(RED, 0.45), 1.1);
    // raised back arm + cutlass
    o += P('M114,26 C122,14 134,6 150,0 C142,10 130,20 120,30 Z', STEEL, 1.6) + L('M117,26 C126,16 136,9 146,3', '#fff', 0.8);
    o += limb('M96,58 L112,44 L116,28', LEA, 7.5);
    o += P('M110,30 C112,24 120,22 124,26 L120,30 C118,28 114,28 112,32 Z', c.cel(GOLD), 1.3) + E(116, 29, 4, 4, c.cel('#3a2418'), 1.4);
    // legs in a wide stance
    o += P('M86,100 L104,146 L102,155 L122,155 L116,145 L98,98 Z', c.cel(dk(LEA, 0.2)), 1.8);
    o += P('M100,136 L112,132 L118,146 L104,150 Z', c.cel('#3a2418'), 1.4);
    o += P('M70,98 L54,144 L44,150 L44,155 L66,155 L66,148 L84,102 Z', c.cel(LEA), 1.8);
    o += P('M52,134 L64,138 L62,148 L48,146 Z', c.cel('#3a2418'), 1.4) + L('M52,134 L64,138', RED, 1.6);
    // long coat
    o += P('M68,56 Q84,50 100,56 L102,98 L96,118 L86,106 L76,118 L64,100 Z', c.cel(BLK, 0.25, 0.4), 2);
    o += L('M84,56 L84,106 M68,56 L64,100 M100,56 L102,98', RED, 1.4);
    o += P('M65,86 L103,86 L103,92 L65,92 Z', c.cel('#3a2418'), 1.4) + R(80, 85, 8, 8, c.cel(GOLD), 1.2);
    o += P('M88,60 L96,58 L98,84 L90,84 Z', c.cel(dk(RED, 0.1)), 1.2);
    // thrusting front arm + cutlass
    o += limb('M72,60 L56,68 L40,72', LEA, 7.5);
    o += P('M38,68 C26,70 14,74 0,84 C14,82 28,78 40,76 Z', STEEL, 1.6) + L('M36,71 C26,73 14,77 4,82', '#fff', 0.8);
    o += P('M40,64 C46,64 48,72 44,78 L41,76 C44,72 43,68 40,67 Z', c.cel(GOLD), 1.3) + E(41, 72, 4, 4, c.cel('#3a2418'), 1.4);
    // spiked pauldrons
    o += P('M64,58 C64,50 74,46 80,50 L80,60 C74,64 66,64 64,58 Z', c.cel(LEA, 0.3, 0.4), 1.6) + P('M66,50 l2,-7 l3,6 Z M72,48 l4,-6 l2,7 Z', '#c2cad3', 1);
    o += P('M92,52 C98,48 106,52 106,58 C102,64 94,64 92,60 Z', c.cel(LEA, 0.3, 0.4), 1.6);
    // head: bandana mask + hat
    o += P('M70,32 C70,24 78,20 86,21 C92,22 94,28 94,34 C93,42 88,48 81,48 C76,48 71,44 70,40 L67,36 L70,34 Z', c.cel(SK), 1.8);
    o += P('M68,36 L94,34 L94,44 Q82,52 68,44 Z', c.cel(RED), 1.6);
    o += P('M93,36 C100,36 106,40 112,38 C108,42 104,44 98,44 C104,46 108,50 112,52 C104,52 98,48 93,44 Z', c.cel(RED), 1.4);
    o += L('M69,31.5 L77.5,33.5 M82,33.4 L89,31.6', OL, 1.8);
    o += E(74.5, 34.4, 1.2, 1, OL) + E(85, 34.4, 1.1, 1, OL);
    o += P('M50,26 C60,20 100,17 116,24 C106,29 64,31 50,26 Z', c.cel(BLK, 0.3, 0.3), 1.8);
    o += P('M66,24 C66,12 74,6 82,6 C92,6 96,12 96,22 Z', c.cel(BLK, 0.3, 0.3), 1.8);
    o += L('M66,22 Q81,25 96,21', RED, 2);
    o += P('M92,16 C104,6 120,2 132,6 C120,8 110,13 96,22 Z', c.cel(RED), 1.4) + L('M96,20 C108,12 118,8 128,6', lt(RED, 0.4), 0.8);
    return wrap(c, 160, 160, o);
  }

  function defiasCrowd() {
    var c = new Ctx(), o = '';
    o += E(80, 155, 76, 6, c.shade());
    function thug(tx, ty, s, weapon, dim) {
      var f = function (col) { return c.cel(dk(col, dim)); };
      var RED = '#b8242a', LEA = '#6a4a2e', DARK = '#2e2226', PANTS = '#3a2c28', SK = '#dcab80', BOOT = '#3a2418';
      var g = '';
      g += limb('M12,-66 L18,-50 L14,-42', dk(DARK, dim), 5.5);
      g += P('M2,-40 L6,-8 L14,-8 L12,-40 Z', f(PANTS), 1.8) + P('M-12,-40 L-14,-8 L-4,-8 L-2,-40 Z', f(PANTS), 1.8);
      g += P('M4,-10 L15,-10 L16,0 L2,0 Z', f(BOOT), 1.6) + P('M-15,-10 L-3,-10 L-3,0 L-20,0 Q-20,-6 -15,-10 Z', f(BOOT), 1.6);
      g += P('M-15,-70 Q0,-76 15,-70 L14,-38 L-14,-38 Z', f(DARK), 1.8);
      g += P('M-15,-70 L-6,-72 L-4,-38 L-14,-38 Z', f(LEA), 1.4) + P('M15,-70 L6,-72 L4,-38 L14,-38 Z', f(LEA), 1.4);
      g += R(-14, -44, 28, 5, f('#4a3020'), 1.4) + R(-3, -44.5, 6, 6, f('#d6a53c'), 1);
      g += P('M-13,-80 C-13,-95 10,-96 11,-82 C12,-74 8,-70 4,-68 L-10,-68 C-12,-72 -13,-76 -13,-80 Z', f(RED), 1.8);
      g += P('M-14.5,-86 C-10,-89 -4,-89 -1,-86 L-1,-79 L-14.5,-79 Z', f(SK), 1.3);
      g += P('M-15.5,-81 L0,-81 L0,-75 Q-8,-71 -15.5,-75 Z', f(dk(RED, 0.1)), 1.3);
      g += E(-11, -84, 1.2, 1.1, OL) + E(-5, -84, 1.1, 1.1, OL) + L('M-13.5,-87 L-9,-86.2 M-6.5,-86.2 L-2.5,-87', OL, 1.2);
      g += P('M9,-80 C16,-78 20,-72 20,-64 C16,-68 12,-72 8,-72 Z', f(RED), 1.3);
      // weapon arm
      var hand = [-24, -50];
      if (weapon === 'club') g += limb('M-25,-48 L-34,-80', '#6a4a30', 4) + E(-35, -82, 4.5, 6, c.cel('#6a4a30'), 1.6);
      if (weapon === 'sword') g += P('M-24,-52 L-44,-86 L-40,-88 L-22,-54 Z', c.lin([[0, '#f4f7fa'], [1, '#7c8793']], 0, 0, 1, 0), 1.4) + L('M-28,-46 L-20,-56', '#d6a53c', 3.4);
      if (weapon === 'dagger') { hand = [-26, -56]; g += P('M-27,-58 L-42,-62 L-28,-54 Z', '#c2cad3', 1.3); }
      if (weapon === 'torch') {
        hand = [-22, -62];
        g += limb('M-22,-58 L-26,-90', '#5a3a24', 3) + E(-26, -100, 22, 22, c.glow('#ffa030', 0.7)) + fire(-26, -90, 10, 18, null, 1.2);
      }
      if (weapon === 'axe') g += limb('M-25,-48 L-30,-84', '#6a4a30', 3) + P('M-30,-84 C-40,-88 -44,-78 -40,-72 L-29,-76 Z', c.lin([[0, '#f4f7fa'], [1, '#7c8793']], 0, 0, 1, 0), 1.4);
      g += limb('M-12,-66 L-18,-54 L' + hand[0] + ',' + hand[1], dk(DARK, dim), 5.5);
      g += E(hand[0], hand[1], 3.4, 3.4, f(SK), 1.3);
      return G(g, 'transform="translate(' + tx + ',' + ty + ') scale(' + s + ')"');
    }
    o += thug(120, 138, 0.78, 'torch', 0.4);
    o += thug(60, 136, 0.76, 'axe', 0.42);
    o += thug(92, 142, 0.84, 'sword', 0.25);
    o += thug(136, 156, 0.96, 'club', 0.08);
    o += thug(38, 156, 0.98, 'dagger', 0.05);
    o += thug(86, 158, 1.04, 'sword', 0);
    return wrap(c, 160, 160, o);
  }

  function varianPortrait() {
    var c = new Ctx(), o = '';
    var GOLD = '#e2b23e', SK = '#eac0a0', HAIR = '#4a3020', BLUE = '#2456a8';
    // hanging wire
    o += L('M44,14 L80,2 L116,14', '#3a2a1a', 1.4) + E(80, 2.5, 2.2, 2.2, c.cel('#8a7a6a'), 1);
    // frame
    o += R(26, 12, 108, 144, c.lin([[0, lt(GOLD, 0.35)], [0.45, GOLD], [0.55, dk(GOLD, 0.2)], [1, dk(GOLD, 0.45)]], 0, 0, 1, 1), 2.4, 'rx="3"');
    o += R(32, 18, 96, 132, 'none', 0, 'stroke="' + dk(GOLD, 0.35) + '" stroke-width="1.6"');
    o += R(38, 24, 84, 120, '#1a1009', 0);
    [[29, 15], [131, 15], [29, 153], [131, 153]].forEach(function (q) {
      o += E(q[0], q[1], 7, 7, c.cel(lt(GOLD, 0.1)), 1.6) + E(q[0], q[1], 3, 3, c.cel('#c01a2a'), 1);
    });
    [[80, 14], [80, 154], [28, 84], [132, 84]].forEach(function (q) {
      o += P('M' + (q[0] - 6) + ',' + q[1] + ' Q' + q[0] + ',' + (q[1] - 5) + ' ' + (q[0] + 6) + ',' + q[1] + ' Q' + q[0] + ',' + (q[1] + 5) + ' ' + (q[0] - 6) + ',' + q[1] + ' Z', c.cel(lt(GOLD, 0.15)), 1.4);
    });
    // canvas
    var cl = c.clip('<rect x="39" y="25" width="82" height="118"/>');
    var p = '';
    p += R(39, 25, 82, 118, c.rad([[0, '#3a5a9a'], [0.6, '#1e3268'], [1, '#0e1838']], 0.4, 0.35, 0.8));
    p += P('M39,25 L60,25 C56,60 52,100 50,143 L39,143 Z', c.lin([[0, '#6a1420'], [1, '#3a0a12']], 0, 0, 1, 0), 0, 'opacity="0.85"');
    // shoulders: blue doublet, gold trim, white fur mantle
    p += P('M44,146 C46,122 60,112 80,110 C100,112 114,122 116,146 Z', c.cel(BLUE, 0.3, 0.4), 1.6);
    p += P('M52,120 C62,112 72,110 80,112 C88,110 98,112 108,120 C100,128 90,126 80,124 C70,126 60,128 52,120 Z', c.cel('#f4f0e8', 0.2, 0.3), 1.4);
    p += E(64, 120, 1, 1.6, OL) + E(76, 122, 1, 1.6, OL) + E(90, 121, 1, 1.6, OL) + E(100, 119, 1, 1.6, OL);
    p += L('M80,124 L80,146', GOLD, 2) + L('M62,134 Q80,142 98,134', GOLD, 1.6) + E(80, 139, 3, 3, c.cel('#c01a2a'), 1);
    // neck + head (three-quarter left)
    p += P('M73,98 L73,112 L87,112 L87,98 Z', c.cel(SK), 1.3);
    p += P('M64,74 C64,60 74,52 84,53 C94,54 98,64 97,76 C96,90 90,102 80,103 C72,103 66,96 64,88 L61,82 L64,80 Z', c.cel(SK, 0.3, 0.35), 1.6);
    // dark hair, shoulder length
    p += P('M62,76 C58,58 70,46 84,47 C98,48 104,60 102,76 C104,88 102,100 98,108 C96,98 96,88 94,78 C92,70 90,64 86,62 C80,66 70,68 62,76 Z', c.cel(HAIR, 0.25, 0.4), 1.6);
    // face
    p += L('M68,75 L75,74 M81,74 L88,75', OL, 1.4);
    p += E(72, 79, 1.5, 1.2, '#2a3a6a') + E(84.5, 79, 1.4, 1.2, '#2a3a6a');
    p += L('M64,84 L62.5,87', dk(SK, 0.35), 1) + L('M70,94 Q74,96 78,94', dk(SK, 0.45), 1.2);
    // crown
    p += P('M62,58 L66,44 L71,54 L77,40 L83,53 L90,42 L93,56 Q78,52 62,58 Z', c.cel(GOLD), 1.5);
    p += P('M62,58 Q78,52 93,56 L93,61 Q78,57 62,63 Z', c.cel(dk(GOLD, 0.1)), 1.3);
    p += E(77, 58, 2, 2, '#4a8ae8', 0.8) + E(68, 60, 1.5, 1.5, '#c01a2a', 0.7) + E(87, 58.5, 1.5, 1.5, '#c01a2a', 0.7);
    // painterly light and varnish
    p += E(70, 70, 34, 40, c.glow('#fff0d0', 0.25));
    p += R(39, 25, 82, 118, c.lin([[0, '#ffffff', 0.12], [0.3, '#ffffff', 0], [1, '#000', 0.25]], 0, 0, 1, 1));
    o += G(p, 'clip-path="url(#' + cl + ')"');
    o += R(38, 24, 84, 120, 'none', 2);
    return wrap(c, 160, 160, o);
  }

  // ---------- placeholders ----------
  function sceneUnknown() {
    var c = new Ctx();
    return wrap(c, 480, 270, R(0, 0, 480, 270, c.vgrad('#5a5a62', '#2e2e34')) + P('M0,190 Q240,170 480,190 L480,270 L0,270 Z', '#3a3a40', 2) + vignette(c, 0.5));
  }
  function actorUnknown() {
    var c = new Ctx();
    return wrap(c, 160, 160, E(80, 155, 36, 5, c.shade()) + P('M58,154 C58,110 64,70 80,70 C96,70 102,110 102,154 Z', c.cel('#7a7a84'), 2) + E(80, 50, 16, 17, c.cel('#8a8a94'), 2));
  }

  var SCENES = {
    stormwind_keep: function () { return keepScene(false); },
    shadow_court: function () { return keepScene(true); },
    blackrock_mountain: blackrockScene,
    westfall: westfallScene,
    azeroth_dawn: dawnScene
  };
  var ACTORS = {
    lady_prestor: function () { return prestor(false); },
    prestor_shadow: function () { return prestor(true); },
    onyxia: onyxia,
    nefarian: nefarian,
    ragnaros: ragnaros,
    bolvar: bolvar,
    vancleef_story: vancleefStory,
    defias_crowd: defiasCrowd,
    king_varian_portrait: varianPortrait
  };
  function has(o, k) { return typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k); }

  ART.story = {
    scene: function (key) {
      try { return has(SCENES, key) ? SCENES[key]() : sceneUnknown(); } catch (e) { try { return sceneUnknown(); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270"><rect width="480" height="270" fill="#444"/></svg>'; } }
    },
    actor: function (key) {
      try { return has(ACTORS, key) ? ACTORS[key]() : actorUnknown(); } catch (e) { try { return actorUnknown(); } catch (e2) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"></svg>'; } }
    },
    keys: { scenes: Object.keys(SCENES), actors: Object.keys(ACTORS) }
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
