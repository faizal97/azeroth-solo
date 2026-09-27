// Verifies src/art_mulgore.js and renders contact sheets into art/mulgore/out/.
// Usage: node art/mulgore/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_mulgore.js'), 'utf8');

const SCENES = ['camp_narache', 'brambleblade_ravine', 'bloodhoof_village', 'palemane_rock', 'venture_mine', 'golden_plains', 'thunder_bluff'];
const MOBS = ['plainstrider', 'adult_plainstrider', 'prairie_wolf', 'prairie_stalker', 'battleboar', 'swoop', 'bristleback_quilboar', 'bristleback_shaman',
  'chief_sharptusk', 'snagglespear', 'palemane_tanner', 'palemane_poacher', 'venture_worker', 'venture_supervisor', 'mazzranache', 'arrachea'];
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
  if (!/^<svg/.test(w2.ART.mob('arrachea'))) problems.push('empty window: own key broken');
}

// ---- 2. real run: art.js, art_durotar.js, then art_mulgore.js ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const DUR = path.join(ROOT, 'src/art_durotar.js');
if (fs.existsSync(DUR)) vm.runInContext(fs.readFileSync(DUR, 'utf8'), window);
const before = { s: window.ART.scene('goldshire'), m: window.ART.mob('hogger'), ds: window.ART.scene('razor_hill'), dm: window.ART.mob('mottled_boar'), ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length };
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
if (norm(ART.scene('goldshire')) !== norm(before.s)) problems.push('real: goldshire changed after load');
if (norm(ART.mob('hogger')) !== norm(before.m)) problems.push('real: hogger changed after load');
if (norm(ART.scene('razor_hill')) !== norm(before.ds)) problems.push('real: durotar razor_hill changed after load');
if (norm(ART.mob('mottled_boar')) !== norm(before.dm)) problems.push('real: durotar mottled_boar changed after load');
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length);
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length);

const allIds = new Set();
function check(name, s) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<foreignObject|<image/.test(s)) problems.push(name + ': forbidden element');
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
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="mu[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack mu prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="mu[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack mu prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('plainstrider'));
check('scene_twice', ART.scene('thunder_bluff'));
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
sheets.push(sheet('mobs_110', mobs, 110, 110, 8, '#c8b07a'));
const PAIRS = {
  plainstrider: 'camp_narache', adult_plainstrider: 'golden_plains', prairie_wolf: 'golden_plains', prairie_stalker: 'bloodhoof_village',
  battleboar: 'camp_narache', swoop: 'golden_plains', bristleback_quilboar: 'brambleblade_ravine', bristleback_shaman: 'brambleblade_ravine',
  chief_sharptusk: 'brambleblade_ravine', snagglespear: 'golden_plains', palemane_tanner: 'palemane_rock', palemane_poacher: 'palemane_rock',
  venture_worker: 'venture_mine', venture_supervisor: 'venture_mine', mazzranache: 'bloodhoof_village', arrachea: 'thunder_bluff'
};
const onScene = MOBS.map(m => {
  const hr = ART.hero({ cls: 'warrior' });
  const body = strip(ART.scene(PAIRS[m])).replace(/<\/svg>$/, '') +
    `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(hr)}` +
    `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
sheets.push(sheet('onscene', onScene, 400, 240, 2, '#000'));

const size = Buffer.byteLength(SRC);
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
