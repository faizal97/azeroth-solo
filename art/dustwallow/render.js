// Verifies src/art_dustwallow.js (Dustwallow Marsh and the Onyxia's Lair raid) and renders contact sheets into art/dustwallow/out/.
// Usage: node art/dustwallow/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SELF_FILE = 'art_dustwallow.js';
const SRC = fs.readFileSync(path.join(ROOT, 'src', SELF_FILE), 'utf8');

const SCENES = ['theramore_isle', 'brackenwall_village', 'the_quagmire', 'scorched_fen', 'the_wyrmbog', 'onyxias_lair_gate', 'lair_tunnel', 'lair_cavern'];
const MOBS = ['brood_whelp', 'brood_drakonid', 'brood_dragonspawn', 'scorchmaw', 'onyxian_warder', 'onyxian_whelp', 'onyxia'];
const BOSSES = ['onyxia'];
const problems = [];
const notes = [];

// ---- 1. fake-window run (no art.js) ----
{
  const window = { ART: { scene: k => 'BASE_SCENE:' + k, mob: k => 'BASE_MOB:' + k, keys: { scenes: ['x_scene'], mobs: ['x_mob'] } } };
  const ctx = { window };
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.scene('elsewhere') !== 'BASE_SCENE:elsewhere') problems.push('fake: scene fall-through broken');
  if (A.mob('elsewhere') !== 'BASE_MOB:elsewhere') problems.push('fake: mob fall-through broken');
  if (A.mob('toString') !== 'BASE_MOB:toString') problems.push('fake: prototype key not falling through');
  if (A.scene('hasOwnProperty') !== 'BASE_SCENE:hasOwnProperty') problems.push('fake: prototype scene key not falling through');
  if (A.scene('__proto__') !== 'BASE_SCENE:__proto__') problems.push('fake: __proto__ scene key not falling through');
  if (A.mob('__proto__') !== 'BASE_MOB:__proto__') problems.push('fake: __proto__ mob key not falling through');
  if (A.mob('constructor') !== 'BASE_MOB:constructor') problems.push('fake: constructor mob key not falling through');
  if (A.scene('valueOf') !== 'BASE_SCENE:valueOf') problems.push('fake: valueOf scene key not falling through');
  if (A.keys.scenes[0] !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of SCENES) if (!A.keys.scenes.includes(k)) problems.push('fake: keys.scenes missing ' + k);
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  if (A.keys.scenes.length !== 1 + SCENES.length) problems.push('fake: keys.scenes has extra entries: ' + A.keys.scenes.length);
  if (A.keys.mobs.length !== 1 + MOBS.length) problems.push('fake: keys.mobs has extra entries: ' + A.keys.mobs.length);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const k of SCENES) if (!/^<svg/.test(A.scene(k))) problems.push('fake: scene ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '', [], 'onyxia ']) { try { A.mob(bad); A.scene(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope')) || !/^<svg/.test(w2.ART.scene('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('toString')) || !/^<svg/.test(w2.ART.scene('__proto__'))) problems.push('empty window: prototype key gave no placeholder');
  if (!/^<svg/.test(w2.ART.mob('onyxia'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'scenes,mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
}

// ---- 2. real run: art.js, then every art_*.js pack build.py lists BEFORE this one (build order, story packs excluded), then this pack ----
// build.py skips listed files that do not exist yet, so a missing pack is a note, not a problem
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const LISTED = [...BUILD.matchAll(/'src\/(art_[a-z0-9_]+\.js)'/g)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) === i && !/^art_story/.test(f));
const SELF = LISTED.indexOf(SELF_FILE);
const ORDER = (SELF < 0 ? LISTED : LISTED.slice(0, SELF)).filter(f => f !== SELF_FILE);
const LATER = SELF < 0 ? [] : LISTED.slice(SELF + 1);
if (ORDER.length < 10) problems.push('could not read the art pack list from build.py');
if (SELF < 0) notes.push(SELF_FILE + ' is not in build.py yet: every listed pack loads before it');
const PACKS = ORDER.filter(f => fs.existsSync(path.join(ROOT, 'src', f)));
for (const z of LISTED) if (z !== SELF_FILE && !fs.existsSync(path.join(ROOT, 'src', z))) notes.push('listed in build.py but not on disk yet (skipped by build.py): ' + z);
// remember the first scene and mob key each pack adds, so every earlier pack gets a probe below
const ADDED = { scenes: [], mobs: [] };
for (const z of PACKS) {
  const K = window.ART.keys || {}, ns = (K.scenes || []).length, nm = (K.mobs || []).length;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), window);
  const K2 = window.ART.keys || {};
  if ((K2.scenes || []).length > ns) ADDED.scenes.push(K2.scenes[ns]);
  if ((K2.mobs || []).length > nm) ADDED.mobs.push(K2.mobs[nm]);
}
// packs listed after this one, and packs on disk but not in build.py (other zones in progress): load each alone and check for key clashes
for (const z of fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_.*\.js$/.test(f) && !/^art_story/.test(f) && f !== SELF_FILE && !ORDER.includes(f)).sort()) {
  const kind = LATER.includes(z) ? 'later-listed' : 'unlisted';
  try {
    const w3 = { ART: { scene: () => '', mob: () => '', keys: { scenes: [], mobs: [] } } }; const c3 = { window: w3 }; vm.createContext(c3); vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), c3);
    for (const k of SCENES) if (w3.ART.keys.scenes.includes(k)) problems.push('scene key ' + k + ' clashes with ' + kind + ' pack ' + z);
    for (const k of MOBS) if (w3.ART.keys.mobs.includes(k)) problems.push('mob key ' + k + ' clashes with ' + kind + ' pack ' + z);
    notes.push('checked ' + kind + ' pack ' + z + ' for key clashes');
  } catch (e) { notes.push('could not load ' + kind + ' pack ' + z + ' (' + e.message + '), clash check skipped'); }
}
// one key from art.js and each earlier pack must render identically before and after this pack loads
const PROBE = {
  scenes: ['goldshire', 'razor_hill', 'camp_narache', 'brill', 'sentinel_hill', 'crossroads', 'lakeshire', 'the_stockade', 'malakajin', 'windshear_crag', 'darkshire', 'tarren_mill', 'astranaar', 'blackfathom_deeps', 'menethil_harbor', 'angerfang_encampment', 'scarlet_watch_post', 'shadowfang_hall', 'zul_kunda'],
  mobs: ['hogger', 'mottled_boar', 'bristleback_quilboar', 'mindless_zombie', 'goretusk', 'venture_mercenary', 'prairie_wolf', 'savannah_prowler', 'redridge_mongrel', 'defias_convict', 'xt9', 'grimtotem_brute', 'nightbane_worgen', 'arugal',
    'murloc_flesheater', 'oasis_snapjaw', 'black_dragon_whelp', 'kam_deepfury', 'sunscale_lashtail', 'ghostpaw_alpha', 'aku_mai', 'garneg_charskull', 'razormaw_matriarch', 'scarlet_warrior', 'captain_perrine', 'king_bangalash', 'colonel_kurzen']
};
// newer packs are probed only when build.py loads them
for (const k of ['gnomeregan_gate', 'razorfen_gate', 'refuge_pointe', 'sm_cathedral', 'zf_temple', 'maraudon_throne', 'gadgetzan', 'brd_throne', 'brd_prison', 'scholo_hall', 'strat_city']) if (window.ART.keys.scenes.includes(k)) PROBE.scenes.push(k);
for (const k of ['grubbis', 'razorfen_geomancer', 'witherbark_shadowcaster', 'high_inquisitor_whitemane', 'chief_ukorz_sandscalp', 'landslide', 'dark_iron_agent', 'emperor_dagran_thaurissan', 'high_interrogator_gerstahn', 'araj_the_summoner', 'darkmaster_gandling', 'baron_rivendare', 'lady_sarevess', 'highborne_apparition']) if (window.ART.keys.mobs.includes(k)) PROBE.mobs.push(k);
for (const k of ADDED.scenes) if (!PROBE.scenes.includes(k)) PROBE.scenes.push(k);
for (const k of ADDED.mobs) if (!PROBE.mobs.includes(k)) PROBE.mobs.push(k);
const before = { ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length, s: {}, m: {}, icon: typeof window.ART.icon === 'function' ? window.ART.icon('sword') : null, hero: typeof window.ART.hero === 'function' ? window.ART.hero({ cls: 'mage' }) : null };
PROBE.scenes.forEach(k => { before.s[k] = window.ART.scene(k); });
PROBE.mobs.forEach(k => { before.m[k] = window.ART.mob(k); });
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
PROBE.scenes.forEach(k => { if (before.s[k].length < 3000) problems.push('real: probe scene ' + k + ' is a placeholder'); if (norm(ART.scene(k)) !== norm(before.s[k])) problems.push('real: scene ' + k + ' changed after load'); });
PROBE.mobs.forEach(k => { if (before.m[k].length < 3000) problems.push('real: probe mob ' + k + ' is a placeholder'); if (norm(ART.mob(k)) !== norm(before.m[k])) problems.push('real: mob ' + k + ' changed after load'); });
if (before.icon != null && norm(ART.icon('sword')) !== norm(before.icon)) problems.push('real: ART.icon changed after load');
if (before.hero != null && norm(ART.hero({ cls: 'mage' })) !== norm(before.hero)) problems.push('real: ART.hero changed after load');
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length + ' (key clash with an earlier pack?)');
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length + ' (key clash with an earlier pack?)');

const allIds = new Set();
function check(name, s) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<foreignObject|<image|href=|<script|<use/.test(s)) problems.push(name + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) problems.push(name + ': duplicate ids');
  for (const id of ids) { if (allIds.has(id)) problems.push(name + ': id reused across calls ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) problems.push(name + ': dangling ref ' + m[1]);
}
function write(name, s) { check(name, s); const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); }

const scenes = SCENES.map(k => [k, ART.scene(k)]);
const mobs = MOBS.map(k => [k, ART.mob(k)]);
// a key that hit the try/catch placeholder is tiny; real art is several KB
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (s.length > 92 * 1024) problems.push('scene ' + k + ' is over 90 KB (' + (s.length / 1024).toFixed(1) + ')'); if (!/ id="dw[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack dw prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="dw[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack dw prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('onyxia'));
check('scene_twice', ART.scene('lair_cavern'));
check('fallthrough_mob', ART.mob('young_wolf'));
check('fallthrough_scene', ART.scene('goldshire'));

const strip = t => t.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, '');
function sheet(name, items, cw, ch, cols, bg) {
  const rows = Math.ceil(items.length / cols), pad = 8;
  let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${Array.isArray(bg) ? bg[i % bg.length] : bg}"/>`;
    body += s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${cw}" height="${ch}" viewBox="$1">`);
  });
  const W = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#222"/>${body}</svg>`);
  execFileSync(RSVG, ['-w', String(W), p, '-o', p.replace(/\.svg$/, '.png')]);
  return p.replace(/\.svg$/, '.png');
}
const sheets = [];
sheets.push(sheet('scenes', scenes, 400, 240, 3, '#000'));
sheets.push(sheet('mobs', mobs, 128, 128, 5, '#c8b07a'));
sheets.push(sheet('mobs_70', mobs, 70, 70, 9, '#c8b07a'));
sheets.push(sheet('mobs_dark_70', mobs, 70, 70, 9, '#1e1a22'));
// the raid mobs over the lair floor colour at 70px (the darkest pairing in the pack: black dragons on black rock)
sheets.push(sheet('lair_70', ['onyxian_warder', 'onyxian_whelp', 'onyxia', 'brood_dragonspawn'].map(k => [k, ART.mob(k)]), 70, 70, 4, '#2a1e1a'));

// ---- family sheet: Onyxia next to the story actor she must match, and the dragon cousins the brood must NOT be mistaken for ----
const FAMILY = [];
{
  const w6 = {}; vm.createContext(w6); w6.window = w6;
  let actorFn = null;
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art_story.js'), 'utf8'), w6);
    actorFn = w6.ART && w6.ART.story && w6.ART.story.actor;
  } catch (e) { notes.push('could not load the story pack for the family sheet (' + e.message + ')'); }
  const act = k => { const s = actorFn ? actorFn.call(w6.ART.story, k) : ''; return /^<svg/.test(s) ? s : null; };
  const a1 = act('onyxia');
  if (!a1) problems.push('family: story actor onyxia not found in art_story.js');
  FAMILY.push(['story_onyxia', a1 || ART.mob('nope')], ['onyxia', ART.mob('onyxia')]);
  MOBS.filter(k => k !== 'onyxia').forEach(k => FAMILY.push([k, ART.mob(k)]));
  const COUSINS = ['black_dragon_whelp', 'crimson_whelp', 'black_broodling', 'black_dragonspawn', 'gorlash', 'cobalt_scalebane'];
  for (const k of COUSINS) if (ART.keys.mobs.includes(k)) FAMILY.push([k, ART.mob(k)]); else notes.push('family: cousin ' + k + ' not drawn by any loaded pack');
}
// the story actors are 160x160; the sheet scales every cell to the same box
sheets.push(sheet('family', FAMILY, 128, 128, 5, '#c8b07a'));

// ---- on-scene: the real pulls from the raid data with the slots from ui.js ----
const POS_RAID = [{ l: 2, b: 3, w: 21 }, { l: 17, b: 10, w: 17 }, { l: 30, b: 4, w: 16 }, { l: 0, b: 22, w: 15 }, { l: 13, b: 25, w: 14 }, { l: 26, b: 20, w: 14 }, { l: 37, b: 27, w: 12 }, { l: 4, b: 38, w: 12 }, { l: 16, b: 40, w: 11 }, { l: 27, b: 37, w: 11 }];
const POS_EN = [{ r: 3, b: 4, w: 30 }, { r: 26, b: 15, w: 23 }, { r: 6, b: 28, w: 20 }, { r: 28, b: 34, w: 17 }, { r: 15, b: 44, w: 14 }];
{
  const ui = fs.readFileSync(path.join(ROOT, 'src/ui.js'), 'utf8');
  const en = ui.match(/const POS_EN = (\[[^\n]+\]);/), rd = ui.match(/const POS_RAID = (\[[^\n]+\]);/);
  if (!en || JSON.stringify(eval(en[1])) !== JSON.stringify(POS_EN)) problems.push('onscene: POS_EN in ui.js changed, update the copy here');
  if (!rd || JSON.stringify(eval(rd[1]).slice(0, 10)) !== JSON.stringify(POS_RAID)) problems.push('onscene: POS_RAID in ui.js changed, update the copy here');
  if (!/if \(u\.boss && i === 0\) pos\.w = 36;/.test(ui)) problems.push('onscene: boss width rule in ui.js changed');
}
let PULLS = null;
try {
  const zc = { D: { item() {}, MOBS: {}, QUESTS: {}, DUNGEONS: {}, ACTIVITIES: {}, PLACES: { menethil_harbor: { links: {}, via: {} }, crossroads: { links: {}, via: {} } }, NPCS: {}, zone() {} } };
  zc.window = zc; vm.createContext(zc);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/data/zones/dustwallow.js'), 'utf8'), zc);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/data/zones/onyxia.js'), 'utf8'), zc);
  PULLS = zc.D.DUNGEONS.onyxias_lair.pulls.map(p => ({ scene: p.scene, label: p.label, mobs: p.mobs, boss: !!p.boss }));
  for (const p of PULLS) { if (!SCENES.includes(p.scene)) problems.push('data: pull scene ' + p.scene + ' has no art here'); for (const m of p.mobs) if (!MOBS.includes(m)) problems.push('data: pull mob ' + m + ' has no art here'); }
  const places = Object.keys(zc.D.PLACES).filter(k => zc.D.PLACES[k].region === 'dustwallow');
  for (const pl of places) { const P = zc.D.PLACES[pl]; if (!SCENES.includes(P.scene)) problems.push('data: place ' + pl + ' uses scene ' + P.scene + ', which has no art here'); }
  for (const k of SCENES) if (!places.some(pl => zc.D.PLACES[pl].scene === k) && !PULLS.some(p => p.scene === k)) problems.push('data: scene ' + k + ' is used by no place or pull');
  for (const m of MOBS) if (!zc.D.MOBS[m]) problems.push('data: no mob ' + m + ' in dustwallow.js / onyxia.js');
  // the wild marsh places with their own mobs (and the rare), the towns and the gate with nobody in them
  for (const pl of places) {
    const P = zc.D.PLACES[pl], want = (P.mobs || []).map(x => x[0]).concat(Object.keys(P.named || {}));
    if (want.length) PULLS.push({ scene: P.scene, label: P.name, mobs: want.concat(want).slice(0, 3), boss: false, place: true });
  }
} catch (e) { problems.push('data: could not read the pulls from dustwallow.js / onyxia.js (' + e.message + ')'); }
if (!PULLS) PULLS = [];
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const vb = (svg.match(/viewBox="([^"]+)"/) || [0, '0 0 128 128'])[1];
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="${vb}">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
const RAIDCLS = ['warrior', 'paladin', 'priest', 'mage', 'rogue', 'hunter', 'druid', 'shaman', 'warlock', 'priest'];
const raid = RAIDCLS.map((cls, i) => spr(POS_RAID[i], ART.hero({ cls })));
function onScene(p, i) {
  let body = strip(ART.scene(p.scene)).replace(/<\/svg>$/, '');
  // raid in formation, back rows first
  body += raid.slice().reverse().join('');
  const en = p.mobs.map((m, j) => { const pos = Object.assign({}, POS_EN[j] || POS_EN[4]); if (p.boss && j === 0) pos.w = 36; return [j, spr(pos, ART.mob(m))]; });
  // floor test: trash in the back-row slots 3 and 4 behind every pull that leaves them empty
  const lair = /^lair_/.test(p.scene), trash = lair ? 'onyxian_whelp' : 'brood_whelp';
  const back = [];
  if (p.mobs.length <= 3) back.push(spr(POS_EN[4], ART.mob(trash)));
  if (p.mobs.length <= 3) back.push(spr(POS_EN[3], ART.mob(lair ? 'onyxian_warder' : 'brood_drakonid')));
  body += back.join('') + en.slice().reverse().map(e => e[1]).join('');
  return [p.label + ' ' + i, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene', PULLS.map(onScene), 400, 240, 2, '#000'));
// out of combat: the hero alone in each scene
const hubs = SCENES.map(k => [k, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(k)).replace(/<\/svg>$/, '')}${spr({ l: 4, b: 5, w: 26 }, ART.hero({ cls: 'warrior' }))}</svg>`]);
sheets.push(sheet('hubs_hero', hubs, 400, 240, 3, '#000'));

const size = Buffer.byteLength(SRC);
console.log('packs loaded before:', ['art.js'].concat(PACKS).join(' '));
console.log('probes:', PROBE.scenes.length, 'scenes,', PROBE.mobs.length, 'mobs');
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('pulls on the onscene sheet:', PULLS.map(p => p.label).join(' | '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (notes.length) console.log('notes:\n  ' + notes.join('\n  '));
{
  const dbg = SRC.replace('    } catch (e) {\n      _cur = null;\n', '    } catch (e) {\n      _cur = null; if (W.__DBG) W.__DBG(key, e);\n');
  if (dbg === SRC) problems.push('debug hook: make() catch block not found');
  const w4 = { __DBG: (k, e) => problems.push('exception in ' + k + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)) };
  const c4 = { window: w4 }; vm.createContext(c4); vm.runInContext(dbg, c4);
  SCENES.forEach(k => w4.ART.scene(k)); MOBS.forEach(k => w4.ART.mob(k));
}
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
