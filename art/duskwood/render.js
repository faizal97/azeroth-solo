// Verifies src/art_duskwood.js and renders contact sheets into art/duskwood/out/.
// Usage: node art/duskwood/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_duskwood.js'), 'utf8');

const SCENES = ['darkshire', 'brightwood_grove', 'the_hushed_bank', 'raven_hill_cemetery', 'tranquil_gardens', 'vulgol_ogre_mound', 'the_rotting_orchard'];
const MOBS = ['nightbane_worgen', 'nightbane_shadow_weaver', 'green_recluse', 'venom_web_spider', 'skeletal_warrior', 'skeletal_mage', 'plague_spreader',
  'rotted_one', 'splinter_fist_warrior', 'splinter_fist_taskmaster', 'nightbane_dark_runner', 'nightbane_vile_fang', 'naraxis', 'mor_ladim', 'stitches'];
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
  if (A.mob('__proto__') !== 'BASE_MOB:__proto__') problems.push('fake: __proto__ not falling through');
  if (A.scene('__proto__') !== 'BASE_SCENE:__proto__') problems.push('fake: __proto__ scene key not falling through');
  if (A.keys.scenes[0] !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of SCENES) if (!A.keys.scenes.includes(k)) problems.push('fake: keys.scenes missing ' + k);
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const k of SCENES) if (!/^<svg/.test(A.scene(k))) problems.push('fake: scene ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '']) { try { A.mob(bad); A.scene(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope')) || !/^<svg/.test(w2.ART.scene('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('stitches'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'scenes,mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
}

// ---- 2. real run: art.js, every existing pack, then art_duskwood.js ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
for (const z of ['art_durotar.js', 'art_mulgore.js', 'art_tirisfal.js', 'art_westfall.js', 'art_barrens.js', 'art_icons2.js', 'art_redridge.js', 'art_stonetalon.js']) {
  const zp = path.join(ROOT, 'src', z);
  if (fs.existsSync(zp)) vm.runInContext(fs.readFileSync(zp, 'utf8'), window); else problems.push('missing pack ' + z);
}
// one key from art.js and each earlier pack must render identically before and after this pack loads
const PROBE = {
  scenes: ['goldshire', 'razor_hill', 'camp_narache', 'brill', 'sentinel_hill', 'stormwind', 'crossroads', 'wailing_caverns', 'lakeshire', 'the_stockade', 'windshear_crag'],
  mobs: ['hogger', 'riverpaw_gnoll', 'murloc_streamrunner', 'mottled_boar', 'bristleback_quilboar', 'mindless_zombie', 'goretusk', 'riverpaw_brute', 'murloc_tidehunter',
    'defias_pathstalker', 'kolkar_drudge', 'mutanus', 'gathilzogg', 'hamhock', 'tarantula', 'xt9', 'deepmoss_creeper']
};
const PROBE_ICONS = (window.ART.keys.icons || []).slice(-3);
const before = { ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length, s: {}, m: {}, i: {} };
PROBE.scenes.forEach(k => { before.s[k] = window.ART.scene(k); });
PROBE.mobs.forEach(k => { before.m[k] = window.ART.mob(k); });
PROBE_ICONS.forEach(k => { before.i[k] = window.ART.icon(k); });
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
PROBE.scenes.forEach(k => { if (before.s[k].length < 3000) problems.push('real: probe scene ' + k + ' is a placeholder'); if (norm(ART.scene(k)) !== norm(before.s[k])) problems.push('real: scene ' + k + ' changed after load'); });
PROBE.mobs.forEach(k => { if (before.m[k].length < 3000) problems.push('real: probe mob ' + k + ' is a placeholder'); if (norm(ART.mob(k)) !== norm(before.m[k])) problems.push('real: mob ' + k + ' changed after load'); });
PROBE_ICONS.forEach(k => { if (norm(ART.icon(k)) !== norm(before.i[k])) problems.push('real: icon ' + k + ' changed after load'); });
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length + ' (clash with an earlier pack?)');
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length + ' (clash with an earlier pack?)');

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
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="dw[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack dw prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="dw[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack dw prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('stitches'));
check('scene_twice', ART.scene('darkshire'));
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
sheets.push(sheet('mobs', mobs, 128, 128, 5, '#c8b07a'));
sheets.push(sheet('mobs_70', mobs, 70, 70, 8, '#c8b07a'));
sheets.push(sheet('mobs_dark_70', mobs, 70, 70, 8, '#161a2a'));
// family check: the worgen next to the gnolls and wolves, the undead, spiders and ogres next to their earlier cousins
sheets.push(sheet('family', ['nightbane_worgen', 'nightbane_shadow_weaver', 'nightbane_dark_runner', 'nightbane_vile_fang', 'riverpaw_gnoll', 'redridge_mongrel', 'shadowhide_warrior',
  'skeletal_warrior', 'skeletal_mage', 'mor_ladim', 'rattlecage_skeleton', 'plague_spreader', 'rotted_one', 'mindless_zombie',
  'green_recluse', 'venom_web_spider', 'naraxis', 'night_web_spider', 'tarantula', 'splinter_fist_warrior', 'splinter_fist_taskmaster', 'hamhock', 'stitches'].map(k => [k, ART.mob(k)]), 128, 128, 7, '#c8b07a'));
const PAIRS = {
  nightbane_worgen: 'brightwood_grove', nightbane_shadow_weaver: 'the_rotting_orchard', green_recluse: 'the_hushed_bank', venom_web_spider: 'the_hushed_bank',
  skeletal_warrior: 'raven_hill_cemetery', skeletal_mage: 'raven_hill_cemetery', plague_spreader: 'tranquil_gardens', rotted_one: 'tranquil_gardens',
  splinter_fist_warrior: 'vulgol_ogre_mound', splinter_fist_taskmaster: 'vulgol_ogre_mound', nightbane_dark_runner: 'the_rotting_orchard', nightbane_vile_fang: 'brightwood_grove',
  naraxis: 'the_hushed_bank', mor_ladim: 'raven_hill_cemetery', stitches: 'darkshire'
};
// placement as ui.js does it in combat: hero in POS_ALLY[0], the mob in POS_EN[0] and a back-row copy in POS_EN[3]
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="0 0 128 128">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
function onScene(m) {
  const body = strip(ART.scene(PAIRS[m])).replace(/<\/svg>$/, '') +
    spr({ r: 28, b: 34, w: 17 }, ART.mob(m)) + spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' })) + spr({ r: 3, b: 4, w: 30 }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
const on = MOBS.map(onScene);
sheets.push(sheet('onscene', on, 400, 240, 2, '#000'));

const size = Buffer.byteLength(SRC);
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
