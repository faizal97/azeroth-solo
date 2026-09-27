// Verifies src/art_tidewatch.js and renders contact sheets into art/tidewatch/out/.
// Usage: node art/tidewatch/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const PACK = 'art_tidewatch.js';
const SRC = fs.readFileSync(path.join(ROOT, 'src', PACK), 'utf8');

const SCENES = ['brightwater_landing', 'saltmarsh_shallows', 'kelpwood', 'drowned_orchards', 'archive_steps', 'sael_anor_outskirts'];
const MOBS = ['reefclaw_snapper', 'tidebound_husk', 'kelp_horror', 'tidebound_sentinel', 'tidebound_sorceress', 'old_brinescale', 'warden_ithrael'];
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
  for (const k of ['toString', 'hasOwnProperty', '__proto__', 'constructor', 'valueOf', 'isPrototypeOf']) {
    if (A.scene(k) !== 'BASE_SCENE:' + k) problems.push('fake: prototype scene key ' + k + ' not falling through');
    if (A.mob(k) !== 'BASE_MOB:' + k) problems.push('fake: prototype mob key ' + k + ' not falling through');
  }
  if (A.keys.scenes[0] !== 'x_scene' || A.keys.mobs[0] !== 'x_mob') problems.push('fake: existing keys lost');
  for (const k of SCENES) if (!A.keys.scenes.includes(k)) problems.push('fake: keys.scenes missing ' + k);
  for (const k of MOBS) if (!A.keys.mobs.includes(k)) problems.push('fake: keys.mobs missing ' + k);
  if (A.keys.scenes.length !== 1 + SCENES.length) problems.push('fake: keys.scenes has extra entries: ' + A.keys.scenes.length);
  if (A.keys.mobs.length !== 1 + MOBS.length) problems.push('fake: keys.mobs has extra entries: ' + A.keys.mobs.length);
  for (const k of MOBS) if (!/^<svg/.test(A.mob(k))) problems.push('fake: mob ' + k + ' not svg');
  for (const k of SCENES) if (!/^<svg/.test(A.scene(k))) problems.push('fake: scene ' + k + ' not svg');
  for (const bad of [undefined, null, 42, {}, '', [], NaN]) { try { A.mob(bad); A.scene(bad); } catch (e) { problems.push('fake: threw on ' + String(bad)); } }
  // an empty window (no ART at all) must still work and give placeholders for unknown keys
  const w2 = {}; const ctx2 = { window: w2 }; vm.createContext(ctx2); vm.runInContext(SRC, ctx2);
  if (!/^<svg/.test(w2.ART.mob('nope')) || !/^<svg/.test(w2.ART.scene('nope'))) problems.push('empty window: no placeholder');
  if (!/^<svg/.test(w2.ART.mob('__proto__')) || !/^<svg/.test(w2.ART.scene('toString'))) problems.push('empty window: prototype keys give no placeholder');
  if (!/^<svg/.test(w2.ART.mob('warden_ithrael'))) problems.push('empty window: own key broken');
  if (Object.keys(w2.ART.keys).join() !== 'scenes,mobs') problems.push('empty window: keys shape ' + Object.keys(w2.ART.keys).join());
  // a broken ART (keys not arrays, scene/mob not functions) must not throw either
  const w5 = { ART: { scene: 7, mob: null, keys: { scenes: 'x', mobs: {} } } }; const c5 = { window: w5 }; vm.createContext(c5);
  try { vm.runInContext(SRC, c5); if (!/^<svg/.test(w5.ART.mob('reefclaw_snapper')) || !/^<svg/.test(w5.ART.scene('kelpwood'))) problems.push('broken ART: own keys broken'); } catch (e) { problems.push('broken ART: threw ' + e.message); }
}

// ---- 2. real run: art.js, then the art_*.js packs listed in build.py before this pack (build order), then this pack ----
const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const LISTED = [...BUILD.matchAll(/'src\/(art_[a-z0-9_]+\.js)'/g)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) === i && !/^art_story/.test(f));
if (LISTED.length < 10) problems.push('could not read the art pack list from build.py');
if (!LISTED.includes(PACK)) problems.push(PACK + ' is not listed in build.py');
const at = LISTED.indexOf(PACK);
const BEFORE = LISTED.slice(0, at < 0 ? LISTED.length : at), AFTER = at < 0 ? [] : LISTED.slice(at + 1);
const onDisk = f => fs.existsSync(path.join(ROOT, 'src', f));
const PACKS = BEFORE.filter(onDisk);
for (const z of BEFORE) if (!onDisk(z)) problems.push('missing pack listed before this one: ' + z);
for (const z of AFTER) if (!onDisk(z)) notes.push('listed after this pack but not on disk yet (in progress?): ' + z);
for (const z of PACKS) vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), window);
// packs on disk but not in build.py (other zones in progress): load each alone and check for key clashes with this pack
for (const z of fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_.*\.js$/.test(f) && !/^art_story/.test(f) && f !== PACK && !LISTED.includes(f)).sort()) {
  try {
    const w3 = { ART: { scene: () => '', mob: () => '', keys: { scenes: [], mobs: [] } } }; const c3 = { window: w3 }; vm.createContext(c3); vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), c3);
    for (const k of SCENES) if (w3.ART.keys.scenes.includes(k)) problems.push('scene key ' + k + ' clashes with unlisted pack ' + z);
    for (const k of MOBS) if (w3.ART.keys.mobs.includes(k)) problems.push('mob key ' + k + ' clashes with unlisted pack ' + z);
    notes.push('checked unlisted pack ' + z + ' for key clashes');
  } catch (e) { notes.push('could not load unlisted pack ' + z + ' (' + e.message + '), clash check skipped'); }
}
// one key from art.js and each earlier pack must render identically before and after this pack loads
const PROBE = {
  scenes: ['goldshire', 'razor_hill', 'camp_narache', 'brill', 'sentinel_hill', 'crossroads', 'lakeshire', 'the_stockade', 'malakajin', 'windshear_crag', 'darkshire', 'tarren_mill', 'astranaar', 'blackfathom_deeps', 'menethil_harbor', 'angerfang_encampment', 'scarlet_watch_post', 'shadowfang_hall', 'zul_kunda', 'razorfen_kraul', 'wailing_caverns',
    'scarlet_monastery_gate', 'maraudon_throne', 'brd_city', 'chillwind_camp', 'everlook', 'scholo_hall', 'strat_city'],
  mobs: ['hogger', 'mottled_boar', 'bristleback_quilboar', 'mindless_zombie', 'goretusk', 'venture_mercenary', 'prairie_wolf', 'savannah_prowler', 'redridge_mongrel', 'defias_convict', 'xt9', 'grimtotem_brute', 'nightbane_worgen', 'arugal',
    'murloc_flesheater', 'oasis_snapjaw', 'black_dragon_whelp', 'kam_deepfury', 'sunscale_lashtail', 'ghostpaw_alpha', 'aku_mai', 'garneg_charskull', 'razormaw_matriarch', 'scarlet_warrior', 'captain_perrine', 'king_bangalash', 'colonel_kurzen', 'agathelos', 'bleakheart_satyr', 'mannoroc_lasher',
    'stitches', 'skeletal_warrior', 'scarlet_champion', 'princess_theradras', 'shadowforge_flame_keeper', 'araj_the_summoner', 'highborne_apparition', 'darkmaster_gandling', 'baron_rivendare', 'kul_tiras_marine', 'wrathtail_sea_witch']
};
const before = { ns: window.ART.keys.scenes.length, nm: window.ART.keys.mobs.length, s: {}, m: {}, icon: typeof window.ART.icon === 'function' ? window.ART.icon('sword') : null, hero: window.ART.hero({ cls: 'warrior' }) };
PROBE.scenes.forEach(k => { before.s[k] = window.ART.scene(k); });
PROBE.mobs.forEach(k => { before.m[k] = window.ART.mob(k); });
vm.runInContext(SRC, window);
const ART = window.ART;
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()');
PROBE.scenes.forEach(k => { if (before.s[k].length < 3000) problems.push('real: probe scene ' + k + ' is a placeholder'); if (norm(ART.scene(k)) !== norm(before.s[k])) problems.push('real: scene ' + k + ' changed after load'); });
PROBE.mobs.forEach(k => { if (before.m[k].length < 3000) problems.push('real: probe mob ' + k + ' is a placeholder'); if (norm(ART.mob(k)) !== norm(before.m[k])) problems.push('real: mob ' + k + ' changed after load'); });
if (before.icon != null && norm(ART.icon('sword')) !== norm(before.icon)) problems.push('real: ART.icon changed after load');
if (norm(ART.hero({ cls: 'warrior' })) !== norm(before.hero)) problems.push('real: ART.hero changed after load');
if (ART.keys.scenes.length !== before.ns + SCENES.length) problems.push('real: keys.scenes length ' + ART.keys.scenes.length + ' (key clash with an earlier pack?)');
if (ART.keys.mobs.length !== before.nm + MOBS.length) problems.push('real: keys.mobs length ' + ART.keys.mobs.length + ' (key clash with an earlier pack?)');
for (const k of SCENES) if (before.s[k] !== undefined) problems.push('scene key ' + k + ' is also a probe key');

const allIds = new Set();
function check(name, s) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter|<foreignObject|<image|<script|<use|href=/.test(s)) problems.push(name + ': forbidden element');
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
for (const [k, s] of scenes) { if (s.length < 6000) problems.push('scene ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="tw[0-9a-z]+_/.test(s)) problems.push('scene ' + k + ': ids lack tw prefix'); }
for (const [k, s] of mobs) { if (s.length < 3000) problems.push('mob ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); if (!/ id="tw[0-9a-z]+_/.test(s)) problems.push('mob ' + k + ': ids lack tw prefix'); }
scenes.forEach(([k, s]) => png(write('scene_' + k, s), 800));
mobs.forEach(([k, s]) => png(write('mob_' + k, s), 256));
check('mob_twice', ART.mob('warden_ithrael'));
check('scene_twice', ART.scene('kelpwood'));
check('fallthrough_mob', ART.mob('young_wolf'));
check('fallthrough_scene', ART.scene('goldshire'));
// every scene and mob named by the zone data must have art here
{
  const data = fs.readFileSync(path.join(ROOT, 'src/data/zones/tidewatch.js'), 'utf8');
  for (const m of data.matchAll(/scene: '([a-z0-9_]+)'/g)) if (!SCENES.includes(m[1])) problems.push('zone data uses scene ' + m[1] + ' with no art in this pack');
  const mobBlock = (data.match(/Object\.assign\(D\.MOBS, \{([\s\S]*?)\n  \}\);/) || [])[1] || '';
  for (const m of mobBlock.matchAll(/^\s+([a-z0-9_]+): \{/gm)) if (!MOBS.includes(m[1])) problems.push('zone data has mob ' + m[1] + ' with no art in this pack');
}

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
sheets.push(sheet('mobs_70', mobs, 70, 70, 7, '#c8b07a'));
sheets.push(sheet('mobs_dark_70', mobs, 70, 70, 7, '#1e1a22'));
// family check, one row per family: the Tidebound next to the ghosts, naga and sirens they must not look like; the Kul Tiran
// humans they fight; crabs next to scorpids and turtles; the kelp horror next to other plant and ooze monsters
const FAMILY = [
  'tidebound_husk', 'tidebound_sentinel', 'tidebound_sorceress', 'warden_ithrael', 'highborne_apparition', 'wrathtail_sea_witch',
  'hatecrest_siren', 'lady_sarevess', 'wrathtail_myrmidon', 'murloc_tidecaller', 'kul_tiras_marine', 'kul_tiras_sailor',
  'reefclaw_snapper', 'old_brinescale', 'scorpid_reaver', 'oasis_snapjaw', 'aku_mai_snapjaw', 'cobalt_scalebane',
  'kelp_horror', 'constrictor_vine', 'tar_beast', 'wandering_forest_walker', 'timberling', 'thistleshrub_rootshaper'];
for (const k of FAMILY) if (!ART.keys.mobs.includes(k)) problems.push('family: cousin key missing ' + k);
sheets.push(sheet('family', FAMILY.map(k => [k, ART.mob(k)]), 128, 128, 6, '#c8b07a'));
// each mob in a scene it lives in, with its crew in the back row (slots 3 and 4)
const PAIRS = {
  reefclaw_snapper: ['saltmarsh_shallows', 'reefclaw_snapper', 'kelp_horror'], tidebound_husk: ['drowned_orchards', 'tidebound_husk', 'tidebound_husk'],
  kelp_horror: ['kelpwood', 'kelp_horror', 'reefclaw_snapper'], tidebound_sentinel: ['sael_anor_outskirts', 'tidebound_sentinel', 'tidebound_sorceress'],
  tidebound_sorceress: ['sael_anor_outskirts', 'tidebound_sorceress', 'tidebound_sentinel'], old_brinescale: ['saltmarsh_shallows', 'reefclaw_snapper', 'kelp_horror'],
  warden_ithrael: ['sael_anor_outskirts', 'tidebound_sentinel', 'tidebound_sorceress']
};
const BOSSES = ['warden_ithrael'];
// placement as ui.js does it in combat (POS_ALLY / POS_EN): hero in slot 0, the mob in slot 0 (w 36 for a boss), back-row crew in slots 3 and 4
function spr(pos, svg, flip) {
  const w = 400 * pos.w / 100, x = pos.l != null ? 400 * pos.l / 100 : 400 - 400 * pos.r / 100 - w, y = 240 - 240 * pos.b / 100 - w;
  const inner = `<svg x="0" y="0" width="${w}" height="${w}" viewBox="0 0 128 128">${strip(svg)}`;
  return `<g transform="translate(${x},${y})${flip ? ` translate(${w},0) scale(-1,1)` : ''}">${inner}</g>`;
}
function onScene(m) {
  const [sc, b4, b3] = PAIRS[m], boss = BOSSES.includes(m);
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') + spr({ r: 15, b: 44, w: 14 }, ART.mob(b4)) + spr({ r: 28, b: 34, w: 17 }, ART.mob(b3)) +
    spr({ l: 3, b: 4, w: 25 }, ART.hero({ cls: 'warrior' })) + spr({ r: 3, b: 4, w: boss ? 36 : 30 }, ART.mob(m));
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
}
sheets.push(sheet('onscene', MOBS.map(onScene), 400, 240, 2, '#000'));
// out of combat: the hero alone in each scene
const hubs = SCENES.map(k => [k, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(k)).replace(/<\/svg>$/, '')}${spr({ l: 4, b: 5, w: 26 }, ART.hero({ cls: 'warrior' }))}</svg>`]);
sheets.push(sheet('hubs_hero', hubs, 400, 240, 2, '#000'));

// ---- 3. packs listed after this one (if any are on disk) must not shadow this pack's keys ----
{
  const later = AFTER.filter(onDisk);
  const own = {}; SCENES.forEach(k => { own['s' + k] = norm(ART.scene(k)); }); MOBS.forEach(k => { own['m' + k] = norm(ART.mob(k)); });
  for (const z of later) { try { vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', z), 'utf8'), window); } catch (e) { problems.push('later pack ' + z + ' threw on load: ' + e.message); } }
  if (later.length) {
    SCENES.forEach(k => { if (norm(ART.scene(k)) !== own['s' + k]) problems.push('later pack shadows scene ' + k); });
    MOBS.forEach(k => { if (norm(ART.mob(k)) !== own['m' + k]) problems.push('later pack shadows mob ' + k); });
    notes.push('loaded later packs ' + later.join(' ') + ' and re-checked this pack\'s keys');
  }
}

const size = Buffer.byteLength(SRC);
console.log('packs loaded before:', ['art.js'].concat(PACKS).join(' '));
console.log('scenes:', SCENES.length, 'mobs:', MOBS.length, 'file bytes:', size);
console.log('svg sizes (KB): scenes', scenes.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('mobs', mobs.map(([k, s]) => k + '=' + (s.length / 1024).toFixed(1)).join(' '));
console.log('sheets:\n  ' + sheets.join('\n  '));
if (notes.length) console.log('notes:\n  ' + notes.join('\n  '));
{
  // error hook: re-run the pack with the make() catch reporting, so a key that silently fell back to the placeholder shows up
  const dbg = SRC.replace('    } catch (e) {\n      _cur = null;\n', '    } catch (e) {\n      _cur = null; if (W.__DBG) W.__DBG(key, e);\n');
  if (dbg === SRC) problems.push('debug hook: make() catch block not found');
  const w4 = { __DBG: (k, e) => problems.push('exception in ' + k + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)) };
  const c4 = { window: w4 }; vm.createContext(c4); vm.runInContext(dbg, c4);
  SCENES.forEach(k => w4.ART.scene(k)); MOBS.forEach(k => w4.ART.mob(k));
}
if (problems.length) { console.log('PROBLEMS (' + problems.length + '):\n  ' + problems.join('\n  ')); process.exitCode = 1; } else console.log('OK: all checks pass');
