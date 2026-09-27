// Verifies src/art_stratholme.js (Stratholme) and renders contact sheets into art/stratholme/out/.
// Usage: node art/stratholme/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_stratholme.js'), 'utf8');

const SCENES = ['strat_city', 'strat_bastion', 'strat_ziggurat'];
const MOBS = ['crimson_guardsman', 'crimson_conjuror', 'skeletal_guardian', 'bile_spewer', 'timmy_the_cruel', 'archivist_galford', 'balnazzar', 'baroness_anastari', 'ramstein_the_gorger', 'baron_rivendare'];
const BOSSES = ['timmy_the_cruel', 'archivist_galford', 'balnazzar', 'baroness_anastari', 'ramstein_the_gorger', 'baron_rivendare'];
const problems = [];

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
  if (A.mob('constructor') !== 'BASE_MOB:constructor') problems.push('fake: constructor mob key not falling through');
  if (A.keys.scenes[0] !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of SCENES) if (!A.keys.scenes.includes(k)) problems.push('fake: keys.scenes missing ' + k);
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  if (A.keys.scenes.length !== 1 + SCENES.length) problems.push('fake: keys.scenes has extra entries: ' + A.keys.scenes.length);
  if (A.keys.mobs.length !== 1 + MOBS.length) problems.push('fake: keys.mobs has extra entries: ' + A.keys.mobs.length);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const k of SCENES) if (!/^<svg/.test(A.scene(k))) problems.push('fake: scene ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '']) { try { A.mob(bad); A.scene(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope')) || !/^<svg/.test(w2.ART.scene('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('baron_rivendare'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'scenes,mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
}

// ---- 2. real run: art.js, then every art_*.js pack listed in build.py (build order, art_story.js excluded), then art_stratholme.js ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const ORDER = [...BUILD.matchAll(/'src\/(art_[a-z0-9_]+\.js)'/g)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) === i && f !== 'art_story.js' && f !== 'art_stratholme.js');
if (ORDER.length < 10) problems.push('could not read the art pack list from build.py');
const PACKS = ORDER.filter(f => fs.existsSync(path.join(ROOT, 'src', f)));
// build.py skips listed packs that are not on disk yet, so a missing one is a note, not a problem
const notes = [];
for (const z of ORDER) if (!fs.existsSync(path.join(ROOT, 'src', z))) notes.push('listed in build.py but not on disk yet: ' + z);
// load each listed pack, remembering the first scene and mob key it adds so that key is probed below
const autoProbe = { scenes: [], mobs: [] };
for (const z of PACKS) {
  const k0 = window.ART && window.ART.keys ? { s: (window.ART.keys.scenes || []).length, m: (window.ART.keys.mobs || []).length } : { s: 0, m: 0 };
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), window);
  const ks = (window.ART.keys.scenes || []).slice(k0.s), km = (window.ART.keys.mobs || []).slice(k0.m);
  if (ks.length) autoProbe.scenes.push(ks[0]); if (km.length) autoProbe.mobs.push(km[km.length - 1]);
}
// packs on disk but not yet in build.py (other zones in progress): load each alone and check for key clashes with this pack
for (const z of fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_.*\.js$/.test(f) && f !== 'art_story.js' && f !== 'art_stratholme.js' && !ORDER.includes(f)).sort()) {
  try {
    const w3 = { ART: { scene: () => '', mob: () => '', keys: { scenes: [], mobs: [] } } }; const c3 = { window: w3 }; vm.createContext(c3); vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), c3);
    for (const k of SCENES) if (w3.ART.keys.scenes.includes(k)) problems.push('scene key ' + k + ' clashes with unlisted pack ' + z);
    for (const k of MOBS) if (w3.ART.keys.mobs.includes(k)) problems.push('mob key ' + k + ' clashes with unlisted pack ' + z);
    notes.push('checked unlisted pack ' + z + ' for key clashes');
  } catch (e) { notes.push('could not load unlisted pack ' + z + ' (' + e.message + '), clash check skipped'); }
}
// one key from art.js and each earlier pack must render identically before and after this pack loads
const PROBE = {
  scenes: ['goldshire', 'razor_hill', 'camp_narache', 'brill', 'sentinel_hill', 'crossroads', 'lakeshire', 'the_stockade', 'malakajin', 'windshear_crag', 'darkshire', 'tarren_mill', 'astranaar', 'blackfathom_deeps', 'menethil_harbor', 'angerfang_encampment', 'scarlet_watch_post', 'shadowfang_hall', 'zul_kunda'],
  mobs: ['hogger', 'mottled_boar', 'bristleback_quilboar', 'mindless_zombie', 'goretusk', 'venture_mercenary', 'prairie_wolf', 'savannah_prowler', 'redridge_mongrel', 'defias_convict', 'xt9', 'grimtotem_brute', 'nightbane_worgen', 'arugal',
    'murloc_flesheater', 'oasis_snapjaw', 'black_dragon_whelp', 'kam_deepfury', 'sunscale_lashtail', 'ghostpaw_alpha', 'aku_mai', 'garneg_charskull', 'razormaw_matriarch', 'scarlet_warrior', 'captain_perrine', 'king_bangalash', 'colonel_kurzen']
};
// newer packs are probed only when build.py loads them
for (const k of ['gnomeregan_gate', 'razorfen_gate', 'refuge_pointe', 'sm_cathedral', 'zf_temple', 'maraudon_throne', 'gadgetzan', 'brd_throne', 'brd_city']) if (window.ART.keys.scenes.includes(k)) PROBE.scenes.push(k);
for (const k of ['grubbis', 'razorfen_geomancer', 'witherbark_shadowcaster', 'high_inquisitor_whitemane', 'scarlet_champion', 'chief_ukorz_sandscalp', 'landslide', 'dark_iron_agent', 'emperor_dagran_thaurissan', 'anvilrage_warden', 'stitches', 'skeletal_warrior']) if (window.ART.keys.mobs.includes(k)) PROBE.mobs.push(k);
for (const k of autoProbe.scenes) if (!PROBE.scenes.includes(k)) PROBE.scenes.push(k);
for (const k of autoProbe.mobs) if (!PROBE.mobs.includes(k)) PROBE.mobs.push(k);
const before = { ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length, s: {}, m: {}, icon: typeof window.ART.icon === 'function' ? window.ART.icon('sword') : null };
PROBE.scenes.forEach(k => { before.s[k] = window.ART.scene(k); });
PROBE.mobs.forEach(k => { before.m[k] = window.ART.mob(k); });
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
PROBE.scenes.forEach(k => { if (before.s[k].length < 3000) problems.push('real: probe scene ' + k + ' is a placeholder'); if (norm(ART.scene(k)) !== norm(before.s[k])) problems.push('real: scene ' + k + ' changed after load'); });
PROBE.mobs.forEach(k => { if (before.m[k].length < 3000) problems.push('real: probe mob ' + k + ' is a placeholder'); if (norm(ART.mob(k)) !== norm(before.m[k])) problems.push('real: mob ' + k + ' changed after load'); });
if (before.icon != null && norm(ART.icon('sword')) !== norm(before.icon)) problems.push('real: ART.icon changed after load');
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length + ' (key clash with an earlier pack?)');
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length + ' (key clash with an earlier pack?)');

const allIds = new Set();
function check(name, s) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<foreignObject|<image|href=/.test(s)) problems.push(name + ': forbidden element');
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
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="st[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack st prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="st[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack st prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('baron_rivendare'));
check('scene_twice', ART.scene('strat_ziggurat'));
check('fallthrough_mob', ART.mob('young_wolf'));
check('fallthrough_scene', ART.scene('goldshire'));

const strip = t => t.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, '');
function sheet(name, items, cw, ch, cols, bg) {
  const rows = Math.ceil(items.length / cols), pad = 8;
  let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${bg}"/>`;
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
sheets.push(sheet('mobs_70', mobs, 70, 70, 10, '#c8b07a'));
sheets.push(sheet('mobs_dark_70', mobs, 70, 70, 10, '#1e1a22'));
// family check: the Crimson Legion next to the Monastery and Tirisfal Scarlets (and the Hearthglen ones when that pack
// is on disk), the undead next to their cousins (Stitches, the Duskwood and Tirisfal skeletons, the plaguelands undead)
const FAMILY_BASE = ['scarlet_myrmidon', 'scarlet_champion', 'scarlet_wizard', 'arcanist_doan', 'scarlet_warrior', 'stitches', 'skeletal_warrior', 'rattlecage_skeleton'];
const FAMILY_OPT = ['scarlet_sentinel', 'scarlet_lightsworn', 'rotting_behemoth', 'diseased_ghoul', 'skeletal_executioner'];
for (const k of FAMILY_BASE) if (!ART.keys.mobs.includes(k)) problems.push('family: cousin key missing ' + k);
// the optional cousins come from unlisted packs: a separate window loads everything on disk, then this pack
const famWin = {}; vm.createContext(famWin); famWin.window = famWin;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), famWin);
for (const z of PACKS.concat(fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_.*\.js$/.test(f) && f !== 'art_story.js' && f !== 'art_stratholme.js' && !ORDER.includes(f)).sort())) { try { vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), famWin); } catch (e) { notes.push('family window: ' + z + ' failed to load (' + e.message + ')'); } }
vm.runInContext(SRC, famWin);
const optFound = FAMILY_OPT.filter(k => famWin.ART.keys.mobs.includes(k));
notes.push('family: optional cousins found: ' + (optFound.join(' ') || 'none'));
const FAMILY = MOBS.concat(FAMILY_BASE, optFound);
sheets.push(sheet('family', FAMILY.map(k => [k, famWin.ART.mob(k)]), 128, 128, 6, '#c8b07a'));
const PAIRS = {
  crimson_guardsman: 'strat_city', crimson_conjuror: 'strat_bastion', skeletal_guardian: 'strat_ziggurat', bile_spewer: 'strat_ziggurat', timmy_the_cruel: 'strat_city',
  archivist_galford: 'strat_city', balnazzar: 'strat_bastion', baroness_anastari: 'strat_ziggurat', ramstein_the_gorger: 'strat_ziggurat', baron_rivendare: 'strat_ziggurat'
};
// the trash that stands behind a boss in each scene (slot 4, slot 3)
const BACK = { strat_city: ['crimson_conjuror', 'crimson_guardsman'], strat_bastion: ['crimson_guardsman', 'crimson_conjuror'], strat_ziggurat: ['bile_spewer', 'skeletal_guardian'] };
// placement as ui.js does it in combat (POS_ALLY / POS_EN): hero in slot 0, the mob in slot 0 (w 36 for a boss), back-row copies in slots 3 and 4
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="0 0 128 128">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
function onScene(m) {
  const sc = PAIRS[m], boss = BOSSES.includes(m), back = boss ? BACK[sc][0] : m;
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') + spr({ r: 15, b: 44, w: 14 }, ART.mob(back)) + spr({ r: 28, b: 34, w: 17 }, ART.mob(boss ? BACK[sc][1] : m)) +
    spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' })) + spr({ r: 3, b: 4, w: boss ? 36 : 30 }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene', MOBS.map(onScene), 400, 240, 2, '#000'));
// out of combat: the hero alone in each scene
const hubs = SCENES.map(k => [k, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(k)).replace(/<\/svg>$/, '')}${spr({ l: 4, b: 5, w: 26 }, ART.hero({ cls: 'warrior' }))}</svg>`]);
sheets.push(sheet('hubs_hero', hubs, 400, 240, 3, '#000'));

const size = Buffer.byteLength(SRC);
console.log('packs loaded before:', ['art.js'].concat(PACKS).join(' '));
console.log('probed:', PROBE.scenes.length, 'scenes,', PROBE.mobs.length, 'mobs');
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
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
