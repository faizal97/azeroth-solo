// Verifies src/art_bromli.js (Bromli Beerhammer, the third Legend: his party sprite and story actor, his four icons,
// Old Duneback, Thudd the Unbeaten and the Smokebelly fire pit) and renders contact sheets into art/bromli/out/.
// Also sheets art.js's Beerhammer Cloak back look on several races and classes.
// Usage: node art/bromli/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = (f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const SELF = 'art_bromli.js';
const SRC = read(SELF);

const NEW = { legends: ['bromli'], mobs: ['duneback', 'thudd'], scenes: ['smokebelly_pit'], icons: ['legend_bromli', 'beerhammer_charge', 'tavern_brawl', 'beerhammer_cloak'], actors: ['bromli'] };
const WEIRD = ['nope', '', 'toString', '__proto__', 'constructor', 'hasOwnProperty', 'valueOf', 'bromli ', undefined, null, 42, {}, []];
const problems = [];
const notes = [];
const bad = (m) => problems.push(m);
const norm = (t) => String(t).replace(/ id="[^"]+"/g, ' id=""').replace(/url\(#[^)]+\)/g, 'url(#)');
const HERO_FB = { cls: 'paladin', race: 'human' };

// ---- 1. fake ART: every call that is not ours reaches the base unchanged ----
function runIn(window) { const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx); return window; }
function fake() {
  const legend = (k) => 'BASE_LEGEND:' + k; legend.keys = ['x_legend'];
  return {
    ART: {
      scene: (k) => 'BASE_SCENE:' + k, mob: (k) => 'BASE_MOB:' + k, icon: (k) => 'BASE_ICON:' + k, hero: (o) => 'BASE_HERO:' + JSON.stringify(o), legend,
      story: { scene: (k) => 'BASE_SSCENE:' + k, actor: (k) => 'BASE_ACTOR:' + k, keys: { scenes: ['x_sscene'], actors: ['x_actor'] } },
      keys: { scenes: ['x_scene'], mobs: ['x_mob'], icons: ['x_icon'] }
    }
  };
}
{
  const w = fake(), story = w.ART.story, sScene = w.ART.story.scene;
  runIn(w);
  const A = w.ART;
  for (const k of ['elsewhere', 'toString', '__proto__', 'constructor', 'hasOwnProperty', 'valueOf', 'lyveus', 'widya', 'duneback_x']) {
    if (A.scene(k) !== 'BASE_SCENE:' + k) bad('fake: scene did not fall through for ' + k);
    if (A.icon(k) !== 'BASE_ICON:' + k) bad('fake: icon did not fall through for ' + k);
    if (A.mob(k) !== 'BASE_MOB:' + k) bad('fake: mob did not fall through for ' + k);
    if (A.story.actor(k) !== 'BASE_ACTOR:' + k) bad('fake: actor did not fall through for ' + k);
    if (A.legend(k) !== 'BASE_LEGEND:' + k) bad('fake: legend did not fall through for ' + k);
  }
  // an actor key asked for as a mob (and vice versa) is not ours
  if (A.mob('bromli') !== 'BASE_MOB:bromli' || A.story.actor('thudd') !== 'BASE_ACTOR:thudd' || A.scene('bromli') !== 'BASE_SCENE:bromli') bad('fake: keys crossed between kinds');
  if (A.story !== story || A.story.scene !== sScene) bad('fake: ART.story replaced instead of extended, or its scene changed');
  for (const k of NEW.scenes) if (A.scene(k).indexOf('<svg') !== 0) bad('fake: own scene broken ' + k);
  for (const k of NEW.mobs) if (A.mob(k).indexOf('<svg') !== 0) bad('fake: own mob broken ' + k);
  for (const k of NEW.icons) if (A.icon(k).indexOf('<svg') !== 0) bad('fake: own icon broken ' + k);
  for (const k of NEW.actors) if (A.story.actor(k).indexOf('<svg') !== 0) bad('fake: own actor broken ' + k);
  for (const k of NEW.legends) if (A.legend(k).indexOf('<svg') !== 0) bad('fake: own legend broken ' + k);
  if (JSON.stringify(A.legend.keys) !== JSON.stringify(['x_legend'].concat(NEW.legends))) bad('fake: ART.legend.keys = ' + JSON.stringify(A.legend.keys));
  const K = A.keys;
  if (K.scenes.join() !== ['x_scene'].concat(NEW.scenes).join()) bad('fake: keys.scenes ' + K.scenes);
  if (K.mobs.join() !== ['x_mob'].concat(NEW.mobs).join()) bad('fake: keys.mobs ' + K.mobs);
  if (K.icons.join() !== ['x_icon'].concat(NEW.icons).join()) bad('fake: keys.icons ' + K.icons);
  if (A.story.keys.actors.join() !== ['x_actor'].concat(NEW.actors).join() || A.story.keys.scenes.join() !== 'x_sscene') bad('fake: story keys ' + JSON.stringify(A.story.keys));
  for (const b of WEIRD) { try { A.mob(b); A.scene(b); A.icon(b); A.legend(b); A.story.actor(b); } catch (e) { bad('fake: threw on ' + String(b)); } }
  // loading twice does not duplicate keys
  runIn(w);
  if (w.ART.keys.icons.length !== 1 + NEW.icons.length || w.ART.story.keys.actors.length !== 1 + NEW.actors.length || w.ART.legend.keys.length !== 1 + NEW.legends.length) bad('fake: double load duplicated keys');
  // bases that throw are caught
  const wt = runIn({ ART: { scene() { throw new Error('x'); }, mob() { throw new Error('x'); }, icon() { throw new Error('x'); }, hero() { throw new Error('x'); }, legend() { throw new Error('x'); }, story: { scene() { throw new Error('x'); }, actor() { throw new Error('x'); }, keys: { scenes: [], actors: [] } } } });
  try { for (const f of ['scene', 'mob', 'icon', 'legend']) if (!/^<svg /.test(wt.ART[f]('elsewhere'))) bad('throwing base: no placeholder from ' + f); if (!/^<svg /.test(wt.ART.story.actor('elsewhere'))) bad('throwing base: no actor placeholder'); } catch (e) { bad('throwing base: threw ' + e.message); }
  // no previous ART.legend: unknown keys give the paladin hero
  const wh = runIn({ ART: { hero: (o) => 'BASE_HERO:' + JSON.stringify(o) } });
  for (const k of WEIRD) { let s; try { s = wh.ART.legend(k); } catch (e) { s = 'THREW'; } if (s !== 'BASE_HERO:' + JSON.stringify(HERO_FB)) bad('no base legend: legend(' + String(k) + ') is not the paladin hero'); }
  // a frozen story object: a fresh one is published, the old scene function kept
  const fz = fake(); Object.freeze(fz.ART.story); Object.freeze(fz.ART.story.keys);
  try { runIn(fz); if (!/^<svg /.test(fz.ART.story.actor('bromli')) || fz.ART.story.actor('q') !== 'BASE_ACTOR:q' || fz.ART.story.scene('q') !== 'BASE_SSCENE:q' || !fz.ART.story.keys.actors.includes('bromli')) bad('frozen story: pack not installed'); } catch (e) { bad('frozen story: threw ' + e.message); }
  // empty and garbage worlds
  const worlds = [{}, { ART: {} }, { ART: null }, { ART: 5 }, { ART: { keys: null, scene: 'no', mob: 7, story: 3, legend: 'x' } }, { ART: { keys: { scenes: 'x', mobs: {}, icons: 4 }, story: { keys: null, actor: 'x' } } }];
  worlds.forEach((wd, i) => {
    try {
      runIn(wd);
      const T = wd.ART;
      for (const f of ['scene', 'mob', 'icon', 'legend']) {
        if (typeof T[f] !== 'function') { bad('world ' + i + ': no ' + f); continue; }
        for (const k of WEIRD) if (!/^<svg /.test(T[f](k))) bad('world ' + i + ': ' + f + ' placeholder for ' + String(k));
      }
      for (const k of WEIRD) if (!/^<svg /.test(T.story.actor(k))) bad('world ' + i + ': actor placeholder for ' + String(k));
      if (T.scene('smokebelly_pit').length < 20000 || T.mob('thudd').length < 6000 || T.mob('duneback').length < 6000 || T.legend('bromli').length < 6000 || T.story.actor('bromli').length < 6000) bad('world ' + i + ': own keys broken');
      if (T.keys.scenes.join() !== NEW.scenes.join() || T.keys.mobs.join() !== NEW.mobs.join() || T.keys.icons.join() !== NEW.icons.join() || T.story.keys.actors.join() !== NEW.actors.join() || T.legend.keys.join() !== NEW.legends.join()) bad('world ' + i + ': keys ' + JSON.stringify(T.keys));
    } catch (e) { bad('world ' + i + ': threw ' + e.message); }
  });
  console.log('fake/empty ART checks: ' + (worlds.length + 4) + ' worlds');
}

// ---- 2. real load: art.js + every art pack build.py lists, in build order, with and without this pack ----
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const LISTED = [...BUILD.matchAll(/'src\/(art[a-z0-9_]*\.js)'/g)].map((m) => m[1]).filter((f, i, a) => a.indexOf(f) === i);
if (!LISTED.includes(SELF)) notes.push(SELF + ' is not in build.py yet: loaded here after every listed pack');
else if (LISTED[LISTED.indexOf(SELF) - 1] !== 'art_legends.js') bad(SELF + ' must come right after art_legends.js in build.py');
const at = LISTED.indexOf(SELF);
const BEFORE = (at < 0 ? LISTED : LISTED.slice(0, at)).filter((f) => fs.existsSync(path.join(ROOT, 'src', f)));
const AFTER = at < 0 ? [] : LISTED.slice(at + 1).filter((f) => fs.existsSync(path.join(ROOT, 'src', f)));
if (BEFORE.length < 20 || BEFORE[0] !== 'art.js' || !BEFORE.includes('art_legends.js')) bad('could not read the art pack list from build.py');
for (const f of fs.readdirSync(path.join(ROOT, 'src')).filter((f) => /^art_.*\.js$/.test(f) && f !== SELF && !LISTED.includes(f))) notes.push('on disk but not in build.py (not loaded): ' + f);
function world(withPack) {
  const w = {}; w.window = w; vm.createContext(w);
  for (const f of BEFORE) vm.runInContext(read(f), w);
  const refs = {};
  for (const k of Object.keys(w.ART)) refs[k] = w.ART[k];
  if (withPack) vm.runInContext(SRC, w);
  for (const f of AFTER) vm.runInContext(read(f), w);
  return { w, refs };
}
const A0 = world(false), B0 = world(true);
const A = A0.w.ART, B = B0.w.ART;
for (const k of NEW.scenes) if (A.keys.scenes.includes(k)) bad('scene key already exists before this pack: ' + k);
for (const k of NEW.mobs) if (A.keys.mobs.includes(k)) bad('mob key already exists before this pack: ' + k);
for (const k of NEW.icons) if (A.keys.icons.includes(k)) bad('icon key already exists before this pack: ' + k);
for (const k of NEW.actors) if (A.story.keys.actors.includes(k)) bad('actor key already exists before this pack: ' + k);
for (const k of NEW.legends) if (A.legend.keys.includes(k)) bad('legend key already exists before this pack: ' + k);
for (const n of ['scenes', 'mobs', 'icons']) if (B.keys[n].join() !== A.keys[n].concat(NEW[n]).join()) bad('real: keys.' + n + ' not old + new');
if (B.story.keys.actors.join() !== A.story.keys.actors.concat(NEW.actors).join() || B.story.keys.scenes.join() !== A.story.keys.scenes.join()) bad('real: story keys not old + new');
if (B.legend.keys.join() !== A.legend.keys.concat(NEW.legends).join()) bad('real: ART.legend.keys ' + JSON.stringify(B.legend.keys));
// only legend, scene, mob and icon are wrapped (and story.actor); everything else is left as it was
for (const k of Object.keys(B0.refs)) if (!['legend', 'scene', 'mob', 'icon'].includes(k) && B0.refs[k] !== B[k]) bad('real: ART.' + k + ' was replaced');
if (B.story !== B0.refs.story) bad('real: ART.story replaced instead of extended');
// the same calls in the same order in both worlds must give byte-identical strings
const calls = [];
A.keys.scenes.forEach((k, i) => { if (i % 7 === 0) calls.push(['scene', k]); });
A.keys.mobs.forEach((k, i) => { if (i % 9 === 0) calls.push(['mob', k]); });
A.keys.icons.forEach((k, i) => { if (i % 17 === 0) calls.push(['icon', k]); });
['dreadmaul_rock', 'eastmoon_ruins', 'terror_run', 'gadgetzan', 'silverleaf_lodge'].forEach((k) => calls.push(['scene', k]));
['firegut_ogre', 'firegut_brute', 'dunemaul_brute', 'king_mosh', 'sal_brightbell', 'lord_cassius_marrow'].forEach((k) => calls.push(['mob', k]));
['legend_lyveus', 'legend_widya', 'reedsong_lute', 'silverleaf_aegis', 'sword'].forEach((k) => calls.push(['icon', k]));
A.story.keys.actors.forEach((k) => calls.push(['actor', k]));
A.story.keys.scenes.forEach((k, i) => { if (i % 5 === 0) calls.push(['sscene', k]); });
A.legend.keys.forEach((k) => calls.push(['legend', k]));
WEIRD.forEach((k) => { calls.push(['scene', k], ['mob', k], ['icon', k], ['actor', k]); });
[{ cls: 'mage' }, { cls: 'paladin', race: 'human' }, { cls: 'warrior', race: 'dwarf' }, { cls: 'bard', race: 'nightelf', gender: 'f', gear: { back: 'reedsong_lute' } }].forEach((o) => calls.push(['hero', o], ['portrait', o]));
const run = (ART, [f, k]) => { try { return f === 'sscene' ? ART.story.scene(k) : f === 'actor' ? ART.story.actor(k) : ART[f](k); } catch (e) { return 'THREW ' + e.message; } };
let same = 0;
for (const cl of calls) {
  const a = run(A, cl), b = run(B, cl);
  // art_legends.js's ids use a per-pack counter; ART.legend and ART.hero ids never shift, but compare with ids blanked to be safe
  if ((cl[0] === 'legend' ? norm(a) !== norm(b) : a !== b)) bad('real: ' + cl[0] + '(' + JSON.stringify(cl[1]) + ') differs after this pack loads'); else same++;
}
for (const k of WEIRD) if (norm(B.legend(k)) !== norm(B.hero(HERO_FB))) bad('real: legend(' + String(k) + ') is not ART.hero(paladin, human)');
console.log('identity check: ' + same + ' of ' + calls.length + ' calls identical with and without the pack');

// ---- 3. per-SVG checks on the new art ----
const allIds = new Set();
function check(name, s, vb) {
  if (typeof s !== 'string') { bad(name + ': not a string'); return; }
  if (!s.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"')) bad(name + ': bad root / viewBox');
  if (/NaN|undefined|Infinity|null/.test(s)) bad(name + ': NaN/undefined in output');
  if (/<text|<tspan|<filter|<image|<foreignObject|<script|<use\b|href|filter=|\son[a-z]+=/i.test(s)) bad(name + ': forbidden element or attribute');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) bad(name + ': duplicate ids');
  for (const id of ids) { if (!/^bm[0-9a-z]+_[0-9a-z]+$/.test(id)) bad(name + ': id without bm prefix ' + id); if (allIds.has(id)) bad(name + ': id reused across calls ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) bad(name + ': dangling ref ' + m[1]);
  if ((s.match(/<svg/g) || []).length !== 1 || !s.endsWith('</svg>')) bad(name + ': malformed svg');
}
// no other pack may use the bm prefix
for (const f of LISTED) { if (f === SELF || !fs.existsSync(path.join(ROOT, 'src', f))) continue; if (/'bm'\s*\+/.test(read(f))) bad('id prefix bm is also used by ' + f); }
const ART = B;
const art = {
  legend: NEW.legends.map((k) => ['legend_' + k, ART.legend(k), '0 0 128 128', 6000]),
  mob: NEW.mobs.map((k) => ['mob_' + k, ART.mob(k), '0 0 128 128', 6000]),
  scene: NEW.scenes.map((k) => ['scene_' + k, ART.scene(k), '0 0 400 240', 20000]),
  actor: NEW.actors.map((k) => ['actor_' + k, ART.story.actor(k), '0 0 160 160', 6000]),
  icon: NEW.icons.map((k) => ['icon_' + k, ART.icon(k), '0 0 64 64', 3000])
};
for (const list of Object.values(art)) for (const [name, s, vb, min] of list) {
  check(name, s, vb);
  if (s.length < min) bad(name + ': ' + s.length + ' bytes, looks like the placeholder');
  if (s.length > 120 * 1024) bad(name + ': over 120 KB');
}
NEW.legends.forEach((k) => check('again legend ' + k, ART.legend(k), '0 0 128 128'));
NEW.mobs.forEach((k) => check('again mob ' + k, ART.mob(k), '0 0 128 128'));
NEW.scenes.forEach((k) => check('again scene ' + k, ART.scene(k), '0 0 400 240'));
NEW.actors.forEach((k) => check('again actor ' + k, ART.story.actor(k), '0 0 160 160'));
NEW.icons.forEach((k) => check('again icon ' + k, ART.icon(k), '0 0 64 64'));
// no exception reached a try/catch placeholder: run the pack with make() instrumented
{
  const dbg = SRC.replace("} catch (e) {\n      SWM = keep;\n", "} catch (e) {\n      SWM = keep; if (W.__DBG) W.__DBG(e);\n");
  if (dbg === SRC) bad('debug hook: make() catch block not found');
  const w4 = { __DBG: (e) => bad('exception while drawing: ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)) };
  const ctx = { window: w4 }; vm.createContext(ctx); vm.runInContext(dbg, ctx);
  NEW.legends.forEach((k) => w4.ART.legend(k)); NEW.mobs.forEach((k) => w4.ART.mob(k)); NEW.scenes.forEach((k) => w4.ART.scene(k));
  NEW.actors.forEach((k) => w4.ART.story.actor(k)); NEW.icons.forEach((k) => w4.ART.icon(k));
}
// art.js: the Beerhammer Cloak is a back look and draws on every race without throwing
const RACES8 = [['human', 'm'], ['nightelf', 'f'], ['dwarf', 'm'], ['gnome', 'f'], ['orc', 'm'], ['troll', 'f'], ['tauren', 'm'], ['undead', 'f']];
const CLS8 = ['warrior', 'mage', 'paladin', 'rogue', 'shaman', 'priest', 'druid', 'bard'];
if (!ART.keys.looks || !ART.keys.looks.back.includes('beerhammer_cloak')) bad('art.js: beerhammer_cloak is not a back look');
RACES8.forEach(([r, g], i) => {
  const o = { cls: CLS8[i], race: r, gender: g };
  const plain = ART.hero(o), worn = ART.hero(Object.assign({ gear: { back: 'beerhammer_cloak' } }, o));
  if (norm(plain) === norm(worn)) bad('art.js: beerhammer_cloak changes nothing on ' + r + ' ' + CLS8[i]);
  if (/NaN|undefined/.test(worn) || worn.length < 4000) bad('art.js: beerhammer_cloak broken on ' + r + ' ' + CLS8[i]);
});

// ---- 4. files, PNGs, edge and ground checks ----
function write(name, s) { const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { const o = p.replace(/\.svg$/, '.png'); execFileSync(RSVG, ['-w', String(w), p, '-o', o]); return o; }
function alphaOf(file) {
  const b = fs.readFileSync(file);
  let o = 8, w = 0, h = 0; const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), data = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) return null; }
    if (type === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[row + x - bpp] : 0, up = y ? px[row - stride + x] : 0, ul = y && x >= bpp ? px[row - stride + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p0 = a + up - ul, pa = Math.abs(p0 - a), pb = Math.abs(p0 - up), pc = Math.abs(p0 - ul); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : ul; }
      px[row + x] = v & 255;
    }
  }
  return { w, h, a: (x, y) => px[y * stride + x * 4 + 3] };
}
// transparent sprites: nothing may touch the left, right or top edge (a hard cut in game); returns the lowest solid row
function edges(name, file, scale, ref) {
  const im = alphaOf(file);
  if (!im) { bad('edge check: unexpected PNG format for ' + name); return null; }
  let L0 = 0, R0 = 0, T0 = 0, low = -1, top = -1;
  for (let y = 0; y < im.h; y++) { L0 = Math.max(L0, im.a(0, y), im.a(1, y)); R0 = Math.max(R0, im.a(im.w - 1, y), im.a(im.w - 2, y)); }
  for (let x = 0; x < im.w; x++) T0 = Math.max(T0, im.a(x, 0), im.a(x, 1));
  for (let y = im.h - 1; y >= 0 && low < 0; y--) for (let x = 0; x < im.w; x++) if (im.a(x, y) > 200) { low = y; break; }
  for (let y = 0; y < im.h && top < 0; y++) for (let x = 0; x < im.w; x++) if (im.a(x, y) > 200) { top = y; break; }
  if (!ref && (L0 > 12 || R0 > 12 || T0 > 12)) bad(`edge check: ${name} touches the frame (alpha left ${L0}, right ${R0}, top ${T0})`);
  return { low: low / scale, top: top / scale };
}
const pngs = {};
for (const [name, s] of art.legend.concat(art.mob)) pngs[name] = png(write(name, s), 512);
for (const [name, s] of art.actor) pngs[name] = png(write(name, s), 480);
for (const [name, s] of art.scene) pngs[name] = png(write(name, s), 800);
for (const [name, s] of art.icon) pngs[name] = png(write(name, s), 128);
const ground = {};
for (const [name] of art.legend.concat(art.mob)) ground[name] = edges(name, pngs[name], 4);
for (const [name] of art.actor) ground[name] = edges(name, pngs[name], 3);
// the heroes' feet: the legend sprite must stand on the same line; and he must be shorter than a human
const HEROES = [{ cls: 'paladin', race: 'human' }, { cls: 'warrior', race: 'dwarf' }, { cls: 'priest', race: 'human', gender: 'f' }, { cls: 'mage', race: 'gnome' }];
const heroG = HEROES.map((o, i) => edges('hero_' + i, png(write('ref_hero_' + i, ART.hero(o)), 512), 4, true));
for (const k of NEW.legends) if (Math.abs(ground['legend_' + k].low - heroG[0].low) > 1.4) bad('ground: ' + k + ' feet at y=' + ground['legend_' + k].low.toFixed(1) + ', human paladin at y=' + heroG[0].low.toFixed(1));
if (ground.legend_bromli.top < heroG[0].top + 5) bad('height: Bromli (top y=' + ground.legend_bromli.top.toFixed(1) + ') is not clearly shorter than the human paladin (top y=' + heroG[0].top.toFixed(1) + ')');
const refMob = edges('ref_syndicate_highwayman', png(write('ref_mob_syndicate_highwayman', ART.mob('syndicate_highwayman')), 512), 4, true);
for (const k of NEW.mobs) if (Math.abs(ground['mob_' + k].low - refMob.low) > 0.8) bad('ground: ' + k + ' feet at y=' + ground['mob_' + k].low.toFixed(1) + ', syndicate_highwayman at y=' + refMob.low.toFixed(1));
for (const k of NEW.actors) if (ground['actor_' + k].low < 150 || ground['actor_' + k].low > 159) bad('ground: actor ' + k + ' feet at y=' + ground['actor_' + k].low.toFixed(1) + ' (want the bottom edge)');
console.log('feet (solid bottom row): bromli ' + ground.legend_bromli.low.toFixed(1) + ' (top ' + ground.legend_bromli.top.toFixed(1) + '), heroes ' + heroG.map((v) => v.low.toFixed(1) + ' (top ' + v.top.toFixed(1) + ')').join(' ') +
  ', mobs ' + NEW.mobs.map((k) => k + ' ' + ground['mob_' + k].low.toFixed(1)).join(' ') + ' (highwayman ' + refMob.low.toFixed(1) + '), actor ' + ground.actor_bromli.low.toFixed(1));

// ---- 5. sheets ----
const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)"(?: width="[^"]+" height="[^"]+")?>/;
const strip = (s) => s.replace(HEAD, '').replace(/<\/svg>$/, '');
const nest = (s, x, y, w, h) => `<g transform="translate(${x},${y})">${s.replace(HEAD, `<svg x="0" y="0" width="${w}" height="${h}" viewBox="$1">`)}</g>`;
const sheets = [];
function sheet(name, items, cw, ch, cols, bg, extra) {
  const pad = 8, rows = Math.ceil(items.length / cols);
  let body = '';
  items.forEach(([, s, cellBg], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${cellBg || bg}"/>` + nest(s, x, y, cw, ch) + (extra ? extra(x, y, cw, ch) : '');
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#222"/>${body}</svg>`);
  const o = png(p, Wd); sheets.push(o); return o;
}
const line = (x, y, w, h) => `<rect x="${x}" y="${y + h * 122 / 128}" width="${w}" height="1" fill="#ff3a3a" opacity="0.8"/>`;
// Bromli next to the other Legends and player heroes, full size and at the in-game party sizes
const heroRow = [['bromli', ART.legend('bromli')], ['lyveus', ART.legend('lyveus')], ['widya', ART.legend('widya')]].concat(HEROES.map((o, i) => ['hero' + i, ART.hero(o)]));
sheet('legend_heroes', heroRow, 256, 256, heroRow.length, '#8a9a8a', line);
sheet('legend_heroes_ingame', heroRow.concat(heroRow.map(([k, s]) => [k, s, '#2a3440'])), 90, 90, heroRow.length, '#8a9a8a');
sheet('legend_heroes_small', heroRow.concat(heroRow.map(([k, s]) => [k, s, '#2a3440'])), 48, 48, heroRow.length, '#8a9a8a');
// the story actor next to the other Legends' actors and two humans
const actors = [['bromli', ART.story.actor('bromli')], ['lyveus', ART.story.actor('lyveus')], ['widya', ART.story.actor('widya')], ['windsor', ART.story.actor('windsor')], ['bolvar', ART.story.actor('bolvar')]];
sheet('actors', actors.concat(actors.map(([k, s]) => [k, s, '#10161c'])), 150, 150, actors.length, '#6a7a8a');
sheet('actors_big', actors.slice(0, 3), 320, 320, 3, '#6a7a8a');
const stage = (bgKey, placements) => {
  let body = nest(ART.story.scene(bgKey), 0, 0, 480, 270);
  for (const [s, x, y, w] of placements) { const sz = w * 4.8; body += nest(s, x * 4.8, 270 - y * 2.7 - sz, sz, sz); }
  return [bgKey, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 270" width="480" height="270">${body}</svg>`];
};
const sBg = ['stormwind_keep', 'azeroth_dawn'].filter((k) => ART.story.keys.scenes.includes(k));
if (sBg.length) sheet('actors_stage', [stage(sBg[0], [[ART.story.actor('widya'), 20, 2, 30], [ART.story.actor('bromli'), 52, 2, 32]]), stage(sBg[sBg.length - 1], [[ART.story.actor('bromli'), 30, 2, 34], [ART.story.actor('lyveus'), 58, 2, 32]])], 480, 270, 2, '#000');
// icons at 128, 64 and 40, next to the other Legends' icons and the warrior icons they sit beside
const nearIcons = ['legend_lyveus', 'legend_widya', 'reedsong_lute', 'charge', 'whirlwind', 'cleave', 'heroic_strike'].filter((k) => ART.keys.icons.includes(k));
const iconRow = NEW.icons.map((k) => [k, ART.icon(k)]).concat(nearIcons.map((k) => [k, ART.icon(k)]));
for (const sz of [128, 64, 40]) sheet('icons_' + sz, iconRow, sz, sz, iconRow.length, '#1c1a20');
// the mobs next to the Smokebelly ogres, the Sandbrute ogres and other giants
const mobRow = NEW.mobs.map((k) => [k, ART.mob(k)]).concat(['firegut_ogre', 'firegut_brute', 'dunemaul_brute', 'molten_giant', 'boulderfist_brute'].filter((k) => ART.keys.mobs.includes(k)).map((k) => [k, ART.mob(k)]));
sheet('mob_compare', mobRow, 200, 200, mobRow.length, '#c8b07a', line);
sheet('mob_compare_small', mobRow.concat(mobRow.map(([k, s]) => [k, s, '#1e1a22'])), 70, 70, mobRow.length, '#c8b07a');
// scenes with sprites, placed as ui.js places them
const POS_ALLY = [{ l: 3, b: 4, w: 25 }, { l: 20, b: 16, w: 19 }, { l: 1, b: 29, w: 17 }, { l: 22, b: 33, w: 15 }, { l: 10, b: 43, w: 13 }];
const POS_EN = [{ r: 3, b: 4, w: 30 }, { r: 26, b: 15, w: 23 }, { r: 6, b: 28, w: 20 }, { r: 28, b: 34, w: 17 }, { r: 15, b: 44, w: 14 }];
{
  const ui = read('ui.js');
  const al = ui.match(/const POS_ALLY = (\[[^\n]+\]);/), en = ui.match(/const POS_EN = (\[[^\n]+\]);/);
  if (!al || JSON.stringify(eval(al[1])) !== JSON.stringify(POS_ALLY)) bad('onscene: POS_ALLY in ui.js changed, update the copy here');
  if (!en || JSON.stringify(eval(en[1])) !== JSON.stringify(POS_EN)) bad('onscene: POS_EN in ui.js changed, update the copy here');
  if (!/if \(u\.boss && i === 0\) pos\.w = 36;/.test(ui)) bad('onscene: boss width rule in ui.js changed');
}
function spr(pos, svg) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  return nest(svg, x, y, w, w);
}
function onScene(label, sceneKey, allies, enemies, bossFirst) {
  let body = strip(ART.scene(sceneKey));
  const al = allies.map((s, i) => spr(POS_ALLY[i], s));
  const en = enemies.map((s, i) => { const pos = Object.assign({}, POS_EN[i]); if (bossFirst && i === 0) pos.w = 36; return spr(pos, s); });
  body += al.reverse().join('') + en.reverse().join('');
  return [label, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
const H = (o) => ART.hero(o), BRO = () => ART.legend('bromli');
const pit = ART.scene('smokebelly_pit');
sheet('pit', [['pit', pit]], 800, 480, 1, '#000');
const has = (k) => ART.keys.scenes.includes(k);
const pitSheets = [
  ['pit', pit],
  ['town', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(pit)}${spr({ l: 4, b: 5, w: 26 }, BRO())}</svg>`],
  // the story fight: Bromli in slot 1, Thudd as the boss
  onScene('boss', 'smokebelly_pit', [BRO(), H({ cls: 'priest', race: 'human', gender: 'f' }), H({ cls: 'mage', race: 'gnome' })], [ART.mob('thudd')], true),
  // the undercard: pit brawlers (firegut_brute art); a full party and five enemies test the back rows on the floor
  onScene('undercard', 'smokebelly_pit', [H({ cls: 'warrior', race: 'orc' }), BRO(), H({ cls: 'priest', race: 'undead', gender: 'f' }), H({ cls: 'rogue', race: 'nightelf' }), H({ cls: 'hunter', race: 'dwarf' })],
    [ART.mob('firegut_brute'), ART.mob('firegut_brute'), ART.mob('firegut_ogre'), ART.mob('firegut_ogre'), ART.mob('firegut_brute')])
];
if (has('eastmoon_ruins')) pitSheets.push(onScene('duneback', 'eastmoon_ruins', [BRO(), H({ cls: 'paladin', race: 'human' }), H({ cls: 'druid', race: 'tauren' })], [ART.mob('duneback')], true));
if (has('eastmoon_ruins')) pitSheets.push(onScene('ruins trash', 'eastmoon_ruins', [H({ cls: 'warrior', race: 'human' }), BRO()], ['scorpid_dunestalker', 'scorpid_dunestalker'].filter((k) => ART.keys.mobs.includes(k)).map((k) => ART.mob(k))));
if (has('dreadmaul_rock')) pitSheets.push(onScene('brokemaw', 'dreadmaul_rock', [BRO(), ART.legend('widya'), ART.legend('lyveus')], [ART.mob('thudd'), ART.mob('firegut_brute')], true));
if (has('gadgetzan')) pitSheets.push(['coppergulch town', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene('gadgetzan'))}${spr({ l: 4, b: 5, w: 26 }, BRO())}</svg>`]);
sheet('onscene', pitSheets, 400, 240, 2, '#000');
// art.js: the Beerhammer Cloak worn on the back of every race, next to the other red capes
const backRow = RACES8.map(([r, g], i) => [r, ART.hero({ cls: CLS8[i], race: r, gender: g, gear: { back: 'beerhammer_cloak' } })]);
const otherRed = ['perrine_cape', 'cape_brotherhood', 'burning_blade_cloak'].filter((k) => ART.keys.looks.back.includes(k)).map((k) => [k, ART.hero({ cls: 'warrior', race: 'human', gear: { back: k } })]);
sheet('cloak_back', backRow.concat(otherRed, [['plain', ART.hero({ cls: 'warrior', race: 'human' })]]), 160, 160, 8, '#8a9a8a', line);
sheet('cloak_back_small', backRow.concat(backRow.map(([k, s]) => [k, s, '#2a3440'])), 64, 64, 8, '#8a9a8a');

console.log('packs loaded before: ' + BEFORE.length + ', after: ' + (AFTER.join(' ') || 'none'));
console.log('sizes: ' + Object.values(art).flat().map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1) + 'KB').join(' ') + '; ' + SELF + ' ' + Buffer.byteLength(SRC) + ' bytes');
console.log('sheets:\n  ' + sheets.join('\n  '));
if (notes.length) console.log('notes:\n  ' + notes.join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ') : 'OK: all checks pass');
process.exitCode = problems.length ? 1 : 0;
