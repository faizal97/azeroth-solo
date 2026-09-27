// Verifies src/art_tirisfal.js and renders contact sheets into art/tirisfal/out/.
// Usage: node art/tirisfal/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_tirisfal.js'), 'utf8');

const SCENES = ['deathknell', 'night_web_hollow', 'brill', 'agamand_mills', 'garrens_haunt', 'scarlet_watch_post', 'undercity'];
const MOBS = ['mindless_zombie', 'wretched_zombie', 'rattlecage_skeleton', 'duskbat', 'greater_duskbat', 'young_night_web_spider', 'night_web_spider',
  'samuel_fipps', 'darkhound', 'rot_hide_gnoll', 'rot_hide_mongrel', 'maggot_eye', 'scarlet_convert', 'scarlet_warrior', 'captain_perrine'];
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
}
// ---- 1b. bare window (no ART at all) must still work and give placeholders for unknown keys ----
{
  const window = {};
  vm.createContext(window); window.window = window;
  vm.runInContext(SRC, window);
  if (!/^<svg/.test(window.ART.mob('nope')) || !/^<svg/.test(window.ART.scene('nope'))) problems.push('bare: unknown key did not give placeholder svg');
  if (!/^<svg/.test(window.ART.mob('duskbat'))) problems.push('bare: own key failed');
}

// ---- 2. real run: art.js, art_durotar.js, then art_tirisfal.js ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art_durotar.js'), 'utf8'), window);
const before = { s: window.ART.scene('goldshire'), m: window.ART.mob('hogger'), ds: window.ART.scene('razor_hill'), dm: window.ART.mob('mottled_boar'),
  ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length };
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
function check(name, s, minLen) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<foreignObject|<image|<script/.test(s)) problems.push(name + ': forbidden element');
  if (minLen && s.length < minLen) problems.push(name + ': suspiciously small (' + s.length + ' bytes) - placeholder fallback? drawing threw');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) problems.push(name + ': duplicate ids');
  for (const id of ids) { if (allIds.has(id)) problems.push(name + ': id reused across calls ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) problems.push(name + ': dangling ref ' + m[1]);
}
function write(name, s, minLen) { check(name, s, minLen); const p = path.join(OUT, name + '.svg'); fs.writeFileSync(p, s); return p; }
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); }

const scenes = SCENES.map(k => [k, ART.scene(k)]);
const mobs = MOBS.map(k => [k, ART.mob(k)]);
scenes.forEach(([k, s]) => { if (!/viewBox="0 0 400 240"/.test(s)) problems.push('scene ' + k + ': viewBox'); png(write('scene_' + k, s, 8000), 800); });
mobs.forEach(([k, s]) => { if (!/viewBox="0 0 128 128"/.test(s)) problems.push('mob ' + k + ': viewBox'); png(write('mob_' + k, s, 4000), 256); });
// own ids use the ti prefix
for (const [k, s] of scenes.concat(mobs)) for (const m of s.matchAll(/ id="([^"]+)"/g)) if (!/^ti[0-9a-z]+_/.test(m[1])) problems.push(k + ': id without ti prefix ' + m[1]);
// a second call must produce fresh ids
check('mob_twice', ART.mob('duskbat'));
check('scene_twice', ART.scene('brill'));
check('fallthrough_mob', ART.mob('young_wolf'));
check('fallthrough_scene', ART.scene('goldshire'));
check('fallthrough_durotar', ART.mob('zalazane'));

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
sheets.push(sheet('mobs', mobs, 128, 128, 5, '#5e6a4a'));
sheets.push(sheet('mobs_110', mobs, 110, 110, 8, '#5e6a4a'));
const PAIRS = {
  mindless_zombie: 'deathknell', wretched_zombie: 'deathknell', rattlecage_skeleton: 'deathknell', duskbat: 'agamand_mills', greater_duskbat: 'brill',
  young_night_web_spider: 'night_web_hollow', night_web_spider: 'night_web_hollow', samuel_fipps: 'deathknell', darkhound: 'brill',
  rot_hide_gnoll: 'garrens_haunt', rot_hide_mongrel: 'garrens_haunt', maggot_eye: 'garrens_haunt',
  scarlet_convert: 'scarlet_watch_post', scarlet_warrior: 'scarlet_watch_post', captain_perrine: 'scarlet_watch_post'
};
const onScene = MOBS.map(m => {
  const hr = ART.hero({ cls: 'warrior' });
  const body = strip(ART.scene(PAIRS[m])).replace(/<\/svg>$/, '') +
    `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(hr)}` +
    `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
// the undercity has no mobs of its own; show it with a Forsaken-looking pairing for scale
onScene.push(['undercity', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene('undercity')).replace(/<\/svg>$/, '')}<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls: 'warrior' }))}<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob('darkhound'))}</svg>`]);
sheets.push(sheet('onscene', onScene, 400, 240, 2, '#000'));

const size = Buffer.byteLength(SRC);
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
