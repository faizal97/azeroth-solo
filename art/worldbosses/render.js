// Verifies src/art_worldbosses.js and renders contact sheets into art/worldbosses/out/.
// Usage: node art/worldbosses/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const SRC = fs.readFileSync(path.join(ROOT, 'src/art_worldbosses.js'), 'utf8');

const MOBS = ['ashwing', 'hollow_colossus', 'rimefather'];
const HOME = { ashwing: 'scorched_fen', hollow_colossus: 'andorhal', rimefather: 'frostwhisper_gorge' };
const problems = [];

// ---- 1. fake-window run (no art.js) ----
{
  const window = { ART: { scene: k => 'BASE_SCENE:' + k, mob: k => 'BASE_MOB:' + k, keys: { scenes: ['x_scene'], mobs: ['x_mob'] } } };
  const ctx = { window };
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.scene('elsewhere') !== 'BASE_SCENE:elsewhere') problems.push('fake: scene touched');
  if (A.mob('elsewhere') !== 'BASE_MOB:elsewhere') problems.push('fake: mob fall-through broken');
  for (const k of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) if (A.mob(k) !== 'BASE_MOB:' + k) problems.push('fake: prototype key ' + k + ' not falling through');
  if (A.keys.scenes.join() !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  if (A.keys.mobs.length !== 1 + MOBS.length) problems.push('fake: keys.mobs has extra entries: ' + A.keys.mobs.length);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '']) { try { A.mob(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('rimefather'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
  // a mob function that throws must not escape
  const w3 = { ART: { mob: () => { throw new Error('x'); }, keys: { mobs: [] } } }; const c3 = { window: w3 }; vm.createContext(c3); vm.runInContext(SRC, c3);
  try { if (!/^<svg/.test(w3.ART.mob('young_wolf'))) problems.push('throwing base: no placeholder'); } catch (e) { problems.push('throwing base: threw'); }
}

// ---- 2. real run: art.js, then every art_*.js pack listed in build.py (build order, art_story.js excluded), then this pack ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const ORDER = [...BUILD.matchAll(/'src\/(art_[a-z0-9_]+\.js)'/g)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) === i && f !== 'art_story.js' && f !== 'art_worldbosses.js');
if (!/'src\/art_worldbosses\.js'/.test(BUILD)) problems.push('build.py does not list src/art_worldbosses.js');
if (ORDER.length < 10) problems.push('could not read the art pack list from build.py');
const PACKS = ORDER.filter(f => fs.existsSync(path.join(ROOT, 'src', f)));
for (const z of ORDER) if (!fs.existsSync(path.join(ROOT, 'src', z))) problems.push('missing pack ' + z);
for (const z of PACKS) vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), window);
for (const k of MOBS) if (window.ART.keys.mobs.includes(k)) problems.push('mob key ' + k + ' already taken by an earlier pack');
for (const k of Object.values(HOME)) if (!window.ART.keys.scenes.includes(k)) problems.push('home scene ' + k + ' missing');
// a spread of mob keys from art.js and the earlier packs must render identically before and after this pack loads
const PROBE = ['hogger', 'mottled_boar', 'mindless_zombie', 'defias_convict', 'black_dragon_whelp', 'onyxia', 'brood_drakonid', 'scorchmaw', 'rotting_behemoth', 'ice_thistle_yeti', 'molten_giant', 'duneback', 'emberhide'].filter(k => window.ART.keys.mobs.includes(k));
const before = { nm: window.ART.keys.mobs.length, ns: window.ART.keys.scenes.length, m: {}, scene: window.ART.scene('scorched_fen') };
PROBE.forEach(k => { before.m[k] = window.ART.mob(k); });
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
PROBE.forEach(k => { if (before.m[k].length < 3000) problems.push('real: probe mob ' + k + ' is a placeholder'); if (norm(ART.mob(k)) !== norm(before.m[k])) problems.push('real: mob ' + k + ' changed after load'); });
if (norm(ART.scene('scorched_fen')) !== norm(before.scene)) problems.push('real: ART.scene changed after load');
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length);
if (ART.keys.scenes.length !== before.ns) problems.push('real: keys.scenes changed');

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

const mobs = MOBS.map(k => [k, ART.mob(k)]);
for (const [k, s] of mobs) { if (s.length < 6000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="wb[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack wb prefix'); }
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 512));
check('mob_twice', ART.mob('ashwing'));
check('fallthrough_mob', ART.mob('young_wolf'));

const RE = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/;
const strip = t => t.replace(RE, '');
function sheet(name, items, cw, ch, cols, bg) {
  const rows = Math.ceil(items.length / cols), pad = 8;
  let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${bg}"/>`;
    body += s.replace(RE, `<svg x="${x}" y="${y}" width="${cw}" height="${ch}" viewBox="$1">`);
  });
  const W = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#222"/>${body}</svg>`);
  execFileSync(RSVG, ['-w', String(W), p, '-o', p.replace(/\.svg$/, '.png')]);
  return p.replace(/\.svg$/, '.png');
}
const sheets = [];
sheets.push(sheet('mobs', mobs, 256, 256, 3, '#c8b07a'));
sheets.push(sheet('mobs_dark', mobs, 256, 256, 3, '#1e1a22'));
sheets.push(sheet('mobs_64', mobs, 64, 64, 3, '#c8b07a'));
sheets.push(sheet('mobs_dark_64', mobs, 64, 64, 3, '#1e1a22'));
// size and family: each boss next to the elites, rares and raid bosses of its kind from the earlier packs
const KIN = {
  ashwing: ['brood_drakonid', 'scorchmaw', 'onyxian_whelp', 'emberhide', 'onyxia', 'black_dragonspawn'],
  hollow_colossus: ['rotting_behemoth', 'scourge_warder', 'skeletal_executioner', 'diseased_ghoul', 'molten_giant', 'foulmane'],
  rimefather: ['ice_thistle_yeti', 'winterfall_ursa', 'chillwind_chimaera', 'cobalt_scalebane', 'duneback', 'molten_giant']
};
const kinRows = [];
for (const m of MOBS) { const list = KIN[m].filter(k => { if (!ART.keys.mobs.includes(k)) { problems.push('kin key missing ' + k); return false; } return true; }); kinRows.push([m, ART.mob(m)]); list.forEach(k => kinRows.push([k, ART.mob(k)])); }
sheets.push(sheet('kin', kinRows, 128, 128, 7, '#c8b07a'));

// on the home scene, placed as ui.js does it in combat: a raid of 10 (POS_RAID) against the boss in enemy slot 0
const POS_RAID = [{ l: 2, b: 3, w: 21 }, { l: 17, b: 10, w: 17 }, { l: 30, b: 4, w: 16 }, { l: 0, b: 22, w: 15 }, { l: 13, b: 25, w: 14 }, { l: 26, b: 20, w: 14 }, { l: 37, b: 27, w: 12 }, { l: 4, b: 38, w: 12 }, { l: 16, b: 40, w: 11 }, { l: 27, b: 37, w: 11 }];
const CLS = ['warrior', 'paladin', 'rogue', 'priest', 'mage', 'hunter', 'warlock', 'druid', 'shaman', 'priest'];
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="0 0 128 128">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
function onScene(m, bw) {
  let body = strip(ART.scene(HOME[m])).replace(/<\/svg>$/, '');
  for (let i = POS_RAID.length - 1; i >= 0; i--) body += spr(POS_RAID[i], ART.hero({ cls: CLS[i], race: ['human', 'orc', 'dwarf', 'undead', 'nightelf', 'tauren', 'gnome', 'troll'][i % 8] }));
  body += spr({ r: 3, b: 4, w: bw }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene_raid', MOBS.map(m => onScene(m, 36)), 400, 240, 1, '#000'));
// an ordinary boss (w 36) next to the same scene with an elite (w 30) for scale
function vsElite(m) {
  let body = strip(ART.scene(HOME[m])).replace(/<\/svg>$/, '');
  body += spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' })) + spr({ l: 20, b: 16, w: 19 }, ART.hero({ cls: 'priest', race: 'dwarf' }));
  body += spr({ r: 40, b: 15, w: 23 }, ART.mob(KIN[m][0])) + spr({ r: 3, b: 4, w: 36 }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene_party', MOBS.map(vsElite), 400, 240, 3, '#000'));

console.log('packs loaded before:', ['art.js'].concat(PACKS).length, 'files');
console.log('mobs:', MOBS.length, 'file bytes:', Buffer.byteLength(SRC));
console.log('svg sizes (KB):', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
{
  const dbg = SRC.replace('} catch (e) {\n      _cur = null;\n', '} catch (e) {\n      _cur = null; if (W.__DBG) W.__DBG(fn && fn.name, e);\n');
  if (dbg === SRC) problems.push('debug hook: make() catch block not found');
  const w4 = { __DBG: (k, e) => problems.push('exception in ' + k + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)) };
  const c4 = { window: w4 }; vm.createContext(c4); vm.runInContext(dbg, c4);
  MOBS.forEach(k => w4.ART.mob(k));
}
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
