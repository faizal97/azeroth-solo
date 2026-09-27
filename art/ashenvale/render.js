// Verifies src/art_ashenvale.js and renders contact sheets into art/ashenvale/out/.
// Usage: node art/ashenvale/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_ashenvale.js'), 'utf8');

const SCENES = ['astranaar', 'splintertree_post', 'the_zoram_strand', 'mystral_lake', 'thistlefur_village', 'the_howling_vale', 'satyrnaar', 'felfire_hill', 'blackfathom_deeps', 'blackfathom_depths'];
const MOBS = ['wrathtail_myrmidon', 'wrathtail_sea_witch', 'ashenvale_bear', 'ghostpaw_runner', 'ghostpaw_alpha', 'thistlefur_ursa', 'thistlefur_shaman',
  'bleakheart_satyr', 'bleakheart_hellcaller', 'mannoroc_lasher', 'felguard_sentry', 'ursal_the_mauler', 'sharptalon', 'blackfathom_myrmidon',
  'twilight_acolyte', 'aku_mai_snapjaw', 'ghamoo_ra', 'lady_sarevess', 'gelihast', 'twilight_lord_kelris', 'aku_mai'];
const DUNGEON = ['blackfathom_deeps', 'blackfathom_depths'];
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
  if (!/^<svg/.test(w2.ART.mob('aku_mai'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'scenes,mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
}

// ---- 2. real run: art.js, the other zone packs, then art_ashenvale.js ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
for (const z of ['art_durotar.js', 'art_mulgore.js', 'art_tirisfal.js', 'art_westfall.js', 'art_barrens.js', 'art_icons2.js', 'art_icons3.js', 'art_icons4.js', 'art_icons5.js', 'art_redridge.js', 'art_stonetalon.js', 'art_duskwood.js', 'art_hillsbrad.js']) {
  const zp = path.join(ROOT, 'src', z);
  if (fs.existsSync(zp)) vm.runInContext(fs.readFileSync(zp, 'utf8'), window); else problems.push('missing pack ' + z);
}
// one key from art.js and each earlier pack must render identically before and after this pack loads
const PROBE = {
  scenes: ['goldshire', 'razor_hill', 'camp_narache', 'brill', 'sentinel_hill', 'crossroads', 'lakeshire', 'the_stockade', 'malakajin', 'windshear_crag', 'darkshire', 'tarren_mill', 'dolanaar'],
  mobs: ['hogger', 'mottled_boar', 'bristleback_quilboar', 'mindless_zombie', 'goretusk', 'venture_mercenary', 'prairie_wolf', 'savannah_prowler', 'redridge_mongrel', 'defias_convict', 'xt9', 'grimtotem_brute', 'nightbane_worgen', 'arugal', 'gnarlpine_ursa', 'murloc_flesheater', 'oasis_snapjaw']
};
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
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="av[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack av prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="av[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack av prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('aku_mai'));
check('scene_twice', ART.scene('astranaar'));
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
sheets.push(sheet('mobs_70', mobs, 70, 70, 11, '#c8b07a'));
sheets.push(sheet('mobs_dark_70', mobs, 70, 70, 11, '#1e2a22'));
// family check: pairs that must read differently, next to their cousins in earlier packs
sheets.push(sheet('family', ['wrathtail_myrmidon', 'wrathtail_sea_witch', 'blackfathom_myrmidon', 'lady_sarevess',
  'ghostpaw_runner', 'ghostpaw_alpha', 'prairie_wolf', 'fenrus', 'ashenvale_bear', 'gray_bear', 'big_samras',
  'thistlefur_ursa', 'thistlefur_shaman', 'ursal_the_mauler', 'gnarlpine_ursa', 'gnarlpine_shaman', 'bleakheart_satyr', 'bleakheart_hellcaller', 'lord_melenas',
  'mannoroc_lasher', 'felguard_sentry', 'gelihast', 'murloc_flesheater', 'murloc_streamrunner', 'aku_mai_snapjaw', 'ghamoo_ra', 'oasis_snapjaw', 'twilight_acolyte'].map(k => [k, ART.mob(k)]), 128, 128, 7, '#c8b07a'));
const PAIRS = {
  wrathtail_myrmidon: 'the_zoram_strand', wrathtail_sea_witch: 'the_zoram_strand', ashenvale_bear: 'mystral_lake', ghostpaw_runner: 'the_howling_vale', ghostpaw_alpha: 'the_howling_vale',
  thistlefur_ursa: 'thistlefur_village', thistlefur_shaman: 'thistlefur_village', bleakheart_satyr: 'satyrnaar', bleakheart_hellcaller: 'satyrnaar',
  mannoroc_lasher: 'felfire_hill', felguard_sentry: 'felfire_hill', ursal_the_mauler: 'thistlefur_village', sharptalon: 'mystral_lake',
  blackfathom_myrmidon: 'blackfathom_deeps', twilight_acolyte: 'blackfathom_depths', aku_mai_snapjaw: 'blackfathom_deeps', ghamoo_ra: 'blackfathom_deeps',
  lady_sarevess: 'blackfathom_deeps', gelihast: 'blackfathom_deeps', twilight_lord_kelris: 'blackfathom_depths', aku_mai: 'blackfathom_depths'
};
// placement as ui.js does it in combat: hero in POS_ALLY[0], the mob in POS_EN[0] and back-row copies in POS_EN[3] (and POS_EN[4] in dungeons)
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="0 0 128 128">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
function onScene(m) {
  const sc = PAIRS[m], dun = DUNGEON.includes(sc);
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') + (dun ? spr({ r: 15, b: 44, w: 14 }, ART.mob(m)) : '') +
    spr({ r: 28, b: 34, w: 17 }, ART.mob(m)) + spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' })) + spr({ r: 3, b: 4, w: 30 }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene', MOBS.map(onScene), 400, 240, 2, '#000'));
// the hub nothing fights in, with the hero only
const hubs = ['astranaar', 'splintertree_post'].map(k => [k, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(k)).replace(/<\/svg>$/, '')}${spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' }))}</svg>`]);
sheets.push(sheet('hubs_hero', hubs, 400, 240, 2, '#000'));

const size = Buffer.byteLength(SRC);
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
