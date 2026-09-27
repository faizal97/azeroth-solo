// Verifies src/art_westfall.js and renders contact sheets into art/westfall/out/.
// Usage: node art/westfall/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_westfall.js'), 'utf8');

const NEW_SCENES = ['gold_coast_quarry', 'moonbrook', 'the_dead_acre'];
const SW_SCENES = ['stormwind', 'stormwind_bank', 'stormwind_gate'];
const NEW_MOBS = ['defias_digger', 'defias_overseer', 'defias_knuckleduster', 'defias_highwayman', 'rusty_harvest_golem', 'harvest_reaper', 'sergeant_brashclaw'];
const SCENES = ['sentinel_hill', 'furlbrow_farm', 'saldean_farm', 'jangolode_mine', 'molsen_farm', 'the_longshore', 'dagger_hills'].concat(NEW_SCENES, SW_SCENES);
const MOBS = ['young_goretusk', 'goretusk', 'fleshripper', 'harvest_watcher', 'defias_trapper', 'defias_smuggler', 'defias_pathstalker',
  'murloc_coastrunner', 'murloc_tidehunter', 'foe_reaper', 'riverpaw_brute', 'dust_devil'].concat(NEW_MOBS);
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
  if (A.keys.scenes[0] !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of SCENES) if (!A.keys.scenes.includes(k)) problems.push('fake: keys.scenes missing ' + k);
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const k of SCENES) if (!/^<svg/.test(A.scene(k))) problems.push('fake: scene ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '']) { try { A.mob(bad); A.scene(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope')) || !/^<svg/.test(w2.ART.scene('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('foe_reaper'))) problems.push('empty window: own key broken');
}

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
// ---- 2. real run in build.py order: art.js, the zone packs before Westfall, art_westfall.js, then the packs after it ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const PACKS = [['art_durotar.js', 'razor_hill', 'mottled_boar'], ['art_mulgore.js', 'camp_narache', 'plainstrider'], ['art_tirisfal.js', 'brill', 'mindless_zombie']];
const loaded = [];
for (const [f, s, m] of PACKS) { const p = path.join(ROOT, 'src', f); if (fs.existsSync(p)) { vm.runInContext(fs.readFileSync(p, 'utf8'), window); loaded.push([f, s, m]); } }
const before = { s: window.ART.scene('goldshire'), m: window.ART.mob('hogger'), m2: window.ART.mob('riverpaw_gnoll'), ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length, packs: loaded.map(([f, s, m]) => [f, s, m, window.ART.scene(s), window.ART.mob(m)]) };
vm.runInContext(SRC, window);
let ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
if (norm(ART.scene('goldshire')) !== norm(before.s)) problems.push('real: goldshire changed after load');
if (norm(ART.mob('hogger')) !== norm(before.m)) problems.push('real: hogger changed after load');
if (norm(ART.mob('riverpaw_gnoll')) !== norm(before.m2)) problems.push('real: riverpaw_gnoll changed after load');
for (const [f, s, m, bs, bm] of before.packs) {
  if (norm(ART.scene(s)) !== norm(bs)) problems.push('real: ' + f + ' scene ' + s + ' changed after load');
  if (norm(ART.mob(m)) !== norm(bm)) problems.push('real: ' + f + ' mob ' + m + ' changed after load');
}
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length);
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length);
// packs that load after Westfall (build.py order) must leave every Westfall key intact and keep their own keys working
const wfBefore = { s: SCENES.map(k => norm(ART.scene(k))), m: MOBS.map(k => norm(ART.mob(k))) };
const POST = [['art_barrens.js', 'crossroads', 'kolkar_drudge']];
for (const [f, s, m] of POST) {
  const p = path.join(ROOT, 'src', f);
  if (!fs.existsSync(p)) continue;
  vm.runInContext(fs.readFileSync(p, 'utf8'), window); loaded.push([f + ' (after)', s, m]);
  const bs = window.ART.scene(s), bm = window.ART.mob(m);
  if (!/^<svg/.test(bs) || bs.length < 6000) problems.push('real: ' + f + ' scene ' + s + ' broken after Westfall');
  if (!/^<svg/.test(bm) || bm.length < 3000) problems.push('real: ' + f + ' mob ' + m + ' broken after Westfall');
  check(f + ':' + s, bs); check(f + ':' + m, bm);
}
SCENES.forEach((k, i) => { if (norm(window.ART.scene(k)) !== wfBefore.s[i]) problems.push('real: scene ' + k + ' changed by a later pack'); });
MOBS.forEach((k, i) => { if (norm(window.ART.mob(k)) !== wfBefore.m[i]) problems.push('real: mob ' + k + ' changed by a later pack'); });

function write(name, s) { check(name, s); const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); }

const scenes = SCENES.map(k => [k, ART.scene(k)]);
const mobs = MOBS.map(k => [k, ART.mob(k)]);
// a key that hit the try/catch placeholder is tiny; real art is several KB
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="wf[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack wf prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="wf[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack wf prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('goretusk'));
check('scene_twice', ART.scene('sentinel_hill'));
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
sheets.push(sheet('scenes', scenes, 400, 240, 2, '#000'));
sheets.push(sheet('mobs', mobs, 128, 128, 4, '#c8b07a'));
sheets.push(sheet('mobs_small', mobs, 56, 56, 12, '#c8b07a'));
const pick = (list, keys) => list.filter(([k]) => keys.includes(k));
sheets.push(sheet('new_scenes', pick(scenes, NEW_SCENES), 400, 240, 1, '#000'));
sheets.push(sheet('new_mobs', pick(mobs, NEW_MOBS), 128, 128, 4, '#c8b07a'));
sheets.push(sheet('new_mobs_small', pick(mobs, NEW_MOBS), 56, 56, 7, '#c8b07a'));
// Elwynn family check: the Westfall Defias / murlocs / gnoll next to their art.js cousins
sheets.push(sheet('family', ['defias_bandit', 'defias_trapper', 'defias_smuggler', 'defias_pathstalker', 'murloc_streamrunner', 'murloc_coastrunner', 'murloc_tidehunter', 'riverpaw_gnoll', 'riverpaw_brute', 'hogger'].map(k => [k, ART.mob(k)]), 128, 128, 5, '#c8b07a'));
// new keys next to their cousins: Defias rig, golems, gnolls
sheets.push(sheet('family_new', ['defias_bandit', 'defias_pathstalker', 'defias_digger', 'defias_overseer', 'defias_knuckleduster', 'defias_highwayman', 'harvest_watcher', 'foe_reaper', 'rusty_harvest_golem', 'harvest_reaper', 'riverpaw_gnoll', 'riverpaw_brute', 'sergeant_brashclaw', 'hogger'].map(k => [k, ART.mob(k)]), 128, 128, 7, '#c8b07a'));
const PAIRS = {
  young_goretusk: 'furlbrow_farm', goretusk: 'saldean_farm', fleshripper: 'dagger_hills', harvest_watcher: 'saldean_farm',
  defias_trapper: 'molsen_farm', defias_smuggler: 'jangolode_mine', defias_pathstalker: 'sentinel_hill', murloc_coastrunner: 'the_longshore',
  murloc_tidehunter: 'the_longshore', foe_reaper: 'molsen_farm', riverpaw_brute: 'dagger_hills', dust_devil: 'dagger_hills',
  defias_digger: 'gold_coast_quarry', defias_overseer: 'gold_coast_quarry', defias_knuckleduster: 'moonbrook', defias_highwayman: 'moonbrook',
  rusty_harvest_golem: 'the_dead_acre', harvest_reaper: 'the_dead_acre', sergeant_brashclaw: 'dagger_hills'
};
const onScene = MOBS.map(m => {
  const hr = ART.hero({ cls: 'warrior' });
  const body = strip(ART.scene(PAIRS[m])).replace(/<\/svg>$/, '') +
    `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(hr)}` +
    `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
sheets.push(sheet('onscene', onScene.filter(([k]) => !NEW_MOBS.includes(k)), 400, 240, 2, '#000'));
sheets.push(sheet('onscene_new', onScene.filter(([k]) => NEW_MOBS.includes(k)), 400, 240, 2, '#000'));
// Stormwind: each city scene bare, then with the warrior on the left and two other players walking the middle band
sheets.push(sheet('stormwind', pick(scenes, SW_SCENES), 400, 240, 1, '#000'));
const swOn = SW_SCENES.map(k => [k, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(k)).replace(/<\/svg>$/, '')}` +
  `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls: 'warrior' }))}` +
  `<svg x="170" y="118" width="96" height="96" viewBox="0 0 128 128">${strip(ART.hero({ cls: 'mage' }))}` +
  `<svg x="262" y="124" width="84" height="84" viewBox="0 0 128 128">${strip(ART.hero({ cls: 'priest' }))}</svg>`]);
sheets.push(sheet('onscene_stormwind', swOn, 400, 240, 1, '#000'));

const size = Buffer.byteLength(SRC);
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size, 'packs loaded:', loaded.map(p => p[0]).join(', '));
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
