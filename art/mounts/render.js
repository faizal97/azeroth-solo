// Verifies src/art_mounts.js (ART.mount: 8 racial mounts + the Trialsworn charger and its tiers + the Twelvefold Charger (trialsworn_year1); ART.icon: mount_<key>, riding, trialsworn_hourglass) and renders contact sheets
// into art/mounts/out/: mounts at full and half size, icons at 64 and 40, and a "ridden" sheet that draws the hero
// first and the mount on top, on a scene, using the rider offset below.
// Usage: node art/mounts/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const SRC = read('art_mounts.js');

const MOUNTS = ['horse', 'ram', 'mechanostrider', 'nightsaber', 'wolf', 'raptor', 'kodo', 'skeletal_horse', 'trialsworn_charger', 'trialsworn_charger_t15', 'trialsworn_charger_t20', 'trialsworn_year1'];
const ICONS = MOUNTS.map(k => 'mount_' + k).concat(['riding', 'trialsworn_hourglass']);
// rider placement in mount units (160x128 box): hero SVG (128x128) drawn at (X, Y), scaled by S
const RIDER = { x: 27.2, y: 4.6, scale: 0.7 };
// per-race hip height inside the 128x128 hero box (art.js RACEB hipY after the race scale about the ground line y122, male
// values); the rider is shifted by (82 - hip) * scale so every race's hips land on the same seat as the human's
const HIP = { human: 82, dwarf: 91.4, gnome: 99.6, nightelf: 73, orc: 83, troll: 72, tauren: 80, undead: 82 };
const raceDy = r => Math.round((82 - (HIP[r] || 82)) * RIDER.scale * 10) / 10;
// each mount's own race rides it in the second cell
const OWN = { horse: { cls: 'paladin', race: 'human' }, ram: { cls: 'hunter', race: 'dwarf' }, mechanostrider: { cls: 'mage', race: 'gnome' }, nightsaber: { cls: 'druid', race: 'nightelf' },
  wolf: { cls: 'shaman', race: 'orc' }, raptor: { cls: 'rogue', race: 'troll' }, kodo: { cls: 'warrior', race: 'tauren' }, skeletal_horse: { cls: 'warlock', race: 'undead' },
  trialsworn_charger: { cls: 'priest', race: 'nightelf' }, trialsworn_charger_t15: { cls: 'rogue', race: 'orc' }, trialsworn_charger_t20: { cls: 'mage', race: 'gnome' },
  trialsworn_year1: { cls: 'hunter', race: 'tauren' } };
const problems = [];
const notes = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: icon fall-through broken');
  for (const k of ['toString', 'hasOwnProperty', '__proto__', 'constructor']) if (A.icon(k) !== 'BASE_ICON:' + k) problems.push('fake: prototype key not falling through ' + k);
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of ICONS) if (!A.keys.icons.includes(k)) problems.push('fake: icon key missing ' + k);
  if (A.keys.icons.length !== 1 + ICONS.length) problems.push('fake: keys.icons has extra entries');
  if (JSON.stringify(A.keys.mounts) !== JSON.stringify(MOUNTS)) problems.push('fake: keys.mounts ' + JSON.stringify(A.keys.mounts));
  for (const k of ICONS) if (!/^<svg/.test(A.icon(k))) problems.push('fake: icon ' + k + ' not svg');
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (!/^<svg/.test(A.icon('anything'))) problems.push('bare: no icon placeholder');
  try {
    for (const bad of [undefined, null, 42, {}, '', 'toString', '__proto__', 'constructor', 'nope']) {
      if (!/^<svg[^>]*viewBox="0 0 160 128"/.test(A.mount(bad))) problems.push('bare: mount bad key ' + String(bad));
      if (!/^<svg/.test(A.icon(bad))) problems.push('bare: icon bad key ' + String(bad));
    }
  } catch (e) { problems.push('bare: threw on odd key ' + e.message); }
  if (!/^<svg/.test(A.mount('kodo'))) problems.push('bare: kodo missing');
}
// ---- 2b. base icon that throws ----
{
  const window = { ART: { icon: () => { throw new Error('x'); } } }; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  try { if (!/^<svg/.test(window.ART.icon('elsewhere'))) problems.push('throwing base: no placeholder'); } catch (e) { problems.push('throwing base: threw'); }
}

// ---- 3. real run: art.js, then every art_*.js pack listed in build.py (build order, art_story.js excluded), then this pack ----
const window = {}; vm.createContext(window); window.window = window;
vm.runInContext(read('art.js'), window);
const BUILD = fs.readFileSync(path.join(ROOT, 'build.py'), 'utf8');
const ORDER = [...BUILD.matchAll(/'src\/(art_[a-z0-9_]+\.js)'/g)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) === i && f !== 'art_story.js' && f !== 'art_mounts.js');
if (ORDER.length < 10) problems.push('could not read the art pack list from build.py');
for (const f of ORDER) { if (fs.existsSync(path.join(ROOT, 'src', f))) vm.runInContext(read(f), window); else problems.push('missing pack ' + f); }
// packs on disk but not in build.py yet (other packs in progress): load each alone and check for key clashes with this pack
for (const f of fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_.*\.js$/.test(f) && f !== 'art_story.js' && f !== 'art_mounts.js' && !ORDER.includes(f)).sort()) {
  try {
    const w3 = { ART: { scene: () => '', mob: () => '', icon: () => '', keys: { scenes: [], mobs: [], icons: [], mounts: [] } } }; const c3 = { window: w3 }; vm.createContext(c3); vm.runInContext(read(f), c3);
    for (const k of ICONS) if ((w3.ART.keys.icons || []).includes(k)) problems.push('icon key ' + k + ' clashes with unlisted pack ' + f);
    for (const k of MOUNTS) if ((w3.ART.keys.mounts || []).includes(k)) problems.push('mount key ' + k + ' clashes with unlisted pack ' + f);
    notes.push('checked unlisted pack ' + f + ' for key clashes');
  } catch (e) { notes.push('could not load unlisted pack ' + f + ' (' + e.message + '), clash check skipped'); }
}
if (typeof window.ART.mount === 'function') problems.push('ART.mount already exists before this pack (another pack defines it)');
const existing = window.ART.keys.icons.slice();
for (const k of ICONS) if (existing.includes(k)) problems.push('icon key already exists before pack: ' + k);
const norm = t => t.replace(/ id="[^"]+"/g, '').replace(/url\(#[^)]+\)/g, 'url()').replace(/clip-path="url\(#[^)]+\)"/g, '');
const beforeIcons = {}; for (const k of existing.concat(['nope_unknown'])) beforeIcons[k] = norm(window.ART.icon(k));
const probe = { hero: norm(window.ART.hero({ cls: 'warrior', race: 'human' })), scene: norm(window.ART.scene('goldshire')), mob: norm(window.ART.mob('hogger')) };
const keysBefore = JSON.stringify(Object.keys(window.ART.keys).filter(k => k !== 'icons').map(k => [k, window.ART.keys[k]]));
vm.runInContext(SRC, window);
const ART = window.ART;
let changed = 0;
for (const k of Object.keys(beforeIcons)) if (norm(ART.icon(k)) !== beforeIcons[k]) { changed++; if (changed < 6) problems.push('existing icon changed: ' + k); }
if (changed > 5) problems.push('... ' + (changed - 5) + ' more existing icons changed');
if (norm(ART.hero({ cls: 'warrior', race: 'human' })) !== probe.hero || norm(ART.scene('goldshire')) !== probe.scene || norm(ART.mob('hogger')) !== probe.mob) problems.push('hero/scene/mob changed after load');
if (JSON.stringify(Object.keys(ART.keys).filter(k => k !== 'icons' && k !== 'mounts').map(k => [k, ART.keys[k]])) !== keysBefore) problems.push('other ART.keys lists changed');
for (const k of existing) if (!ART.keys.icons.includes(k)) problems.push('existing key lost: ' + k);
if (ART.keys.icons.length !== existing.length + ICONS.length) problems.push('keys.icons length ' + ART.keys.icons.length + ' != ' + (existing.length + ICONS.length));
if (JSON.stringify(ART.keys.mounts) !== JSON.stringify(MOUNTS)) problems.push('keys.mounts ' + JSON.stringify(ART.keys.mounts));

const allIds = new Set();
function check(name, s, root, prefix) {
  if (!root.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) problems.push(name + ': NaN/undefined/null in output');
  if (/<text|<filter|<foreignObject|<image|href=|<script|<style/.test(s)) problems.push(name + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) { if (prefix && !/^mt[0-9a-z]+_/.test(id)) problems.push(name + ': bad id ' + id); if (allIds.has(id)) problems.push(name + ': id reused ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) problems.push(name + ': dangling ref ' + m[1]);
}
const MROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 160 128" width="160" height="128">/;
const IROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 64 64" width="64" height="64">/;
const mounts = MOUNTS.map(k => [k, ART.mount(k)]);
const icons = ICONS.map(k => [k, ART.icon(k)]);
const phM = ART.mount('nope'), phI = ART.icon('mount_nope');
for (const [k, s] of mounts) { check('mount ' + k, s, MROOT, true); if (s.length < 3 * phM.length) problems.push('mount ' + k + ' looks like the placeholder (' + s.length + ' bytes)'); fs.writeFileSync(path.join(OUT, 'mount_' + k + '.svg'), s); }
for (const [k, s] of icons) { check('icon ' + k, s, IROOT, true); if (s.length < 3 * phI.length) problems.push('icon ' + k + ' looks like the placeholder'); fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s); }
check('mount placeholder', phM, MROOT, true);
check('mount twice', ART.mount('horse'), MROOT, true);
check('icon twice', ART.icon('riding'), IROOT, true);
const RSVGOK = fs.existsSync(RSVG);
if (!RSVGOK) problems.push('rsvg-convert not found at ' + RSVG);

// ---- sheets ----
const inner = (s, x, y, w, h) => s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="$1">`);
function sheet(name, items, cw, ch, cols, bg) {
  const pad = 8, rows = Math.ceil(items.length / cols); let b = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    b += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${bg}"/>` + inner(s, x, y, cw, ch);
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#222"/>${b}</svg>`);
  if (RSVGOK) execFileSync(RSVG, ['-w', String(Wd), p, '-o', p.replace(/\.svg$/, '.png')]);
  return p.replace(/\.svg$/, '.png');
}
const sheets = [];
sheets.push(sheet('mounts_160', mounts, 320, 256, 4, '#c8b07a'));
sheets.push(sheet('mounts_80', mounts.concat([['placeholder', phM]]), 80, 64, 9, '#c8b07a'));
sheets.push(sheet('mounts_80_dark', mounts, 80, 64, 8, '#1e2a22'));
sheets.push(sheet('icons_64', icons, 64, 64, 9, '#000'));
sheets.push(sheet('icons_40', icons, 40, 40, 9, '#000'));
// ridden: hero first, mount on top, on a scene. Two cells per mount: a human warrior, then the mount's own race.
{
  const cw = 400, ch = 240, cols = 4, pad = 8, K = 1.5, MX = 80, MY = 40, cells = [];
  for (const k of MOUNTS) { cells.push([k, { cls: 'warrior', race: 'human' }]); cells.push([k, OWN[k]]); }
  let b = '';
  const scene = ART.scene('goldshire');
  cells.forEach(([k, h], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    const hs = ART.hero(h); check('hero ' + h.race, hs, /^<svg/, false);
    b += inner(scene, x, y, cw, ch) + `<g transform="translate(${x + MX},${y + MY}) scale(${K})">` +
      inner(hs, RIDER.x, RIDER.y + raceDy(h.race), 128 * RIDER.scale, 128 * RIDER.scale) + inner(ART.mount(k), 0, 0, 160, 128) + '</g>';
  });
  const Wd = pad + cols * (cw + pad), H = pad + Math.ceil(cells.length / cols) * (ch + pad);
  const p = path.join(OUT, 'sheet_ridden.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#222"/>${b}</svg>`);
  if (RSVGOK) execFileSync(RSVG, ['-w', String(Wd), p, '-o', p.replace(/\.svg$/, '.png')]);
  sheets.push(p.replace(/\.svg$/, '.png'));
}
for (const s of notes) console.log('note: ' + s);
console.log('rider offset (mount units, 160x128 box): x=' + RIDER.x + ' y=' + RIDER.y + ' scale=' + RIDER.scale + '; per-race y shift: ' + Object.keys(HIP).map(r => r + ' ' + raceDy(r)).join(', '));
console.log('sheets:\n  ' + sheets.map(s => path.relative(ROOT, s)).join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.join('\n') : 'OK: ' + MOUNTS.length + ' mounts, ' + ICONS.length + ' icons, 0 problems');
process.exitCode = problems.length ? 1 : 0;
