// Verifies src/art_icons3.js (profession / material / crafted icons + gathering nodes) and renders contact sheets
// into art/icons3/out/.
// Usage: node art/icons3/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const PRE = ['art.js', 'art_westfall.js', 'art_barrens.js', 'art_icons2.js'];
const SRC = read('art_icons3.js');

const PROF = ['prof_mining', 'prof_herbalism', 'prof_skinning', 'prof_blacksmithing', 'prof_alchemy', 'prof_leatherworking', 'prof_tailoring'];
const MAT = ['copper_ore', 'tin_ore', 'silver_ore', 'copper_bar', 'tin_bar', 'bronze_bar', 'silver_bar', 'rough_stone', 'coarse_stone',
  'peacebloom', 'silverleaf', 'earthroot', 'mageroyal', 'briarthorn', 'bruiseweed',
  'light_leather', 'medium_leather', 'light_hide', 'linen_bolt', 'wool_cloth', 'wool_bolt', 'coarse_thread', 'vial'];
const CRAFT = ['potion_red', 'potion_blue', 'elixir_green', 'elixir_gold', 'sharpening_stone', 'weightstone', 'armor_kit', 'bag_linen', 'bag_wool'];
const NEW = [...PROF, ...MAT, ...CRAFT];
const NODES = ['copper', 'tin', 'silver', 'peacebloom', 'silverleaf', 'earthroot', 'mageroyal', 'briarthorn', 'bruiseweed'];
// look-alike groups, one row each at 40px
const GROUPS = [
  ['copper_ore', 'tin_ore', 'silver_ore', 'rough_stone', 'coarse_stone', 'sharpening_stone', 'weightstone'],
  ['copper_bar', 'tin_bar', 'bronze_bar', 'silver_bar', 'coin'],
  ['peacebloom', 'silverleaf', 'earthroot', 'mageroyal', 'briarthorn', 'bruiseweed', 'moss', 'seed'],
  ['light_leather', 'medium_leather', 'light_hide', 'armor_kit', 'pelt', 'prof_skinning', 'prof_leatherworking'],
  ['linen_bolt', 'wool_bolt', 'wool_cloth', 'coarse_thread', 'bag_linen', 'bag_wool', 'prof_tailoring'],
  ['potion_red', 'potion_blue', 'elixir_green', 'elixir_gold', 'vial', 'water', 'prof_alchemy']];
const REF = ['pelt', 'water', 'chest_box', 'dust'];
// existing icons that must not change once the pack loads (art.js item + spell icons, an icons2 icon, an unknown key)
const OLD = ['pelt', 'water', 'bread', 'ring', 'chest_box', 'dust', 'coin', 'moss', 'seed', 'heroic_strike', 'fireball', 'cleave', 'heal', 'nope'];
const problems = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: fall-through broken');
  if (A.icon('toString') !== 'BASE_ICON:toString') problems.push('fake: prototype key not falling through');
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of NEW) if (!A.keys.icons.includes(k)) problems.push('fake: key missing ' + k);
  for (const k of NODES) if (!A.keys.nodes.includes(k)) problems.push('fake: node key missing ' + k);
  if (!/^<svg/.test(A.node('toString'))) problems.push('fake: node prototype key');
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  if (!/^<svg/.test(window.ART.icon('anything'))) problems.push('bare: no placeholder');
  if (!/^<svg/.test(window.ART.icon('copper_ore'))) problems.push('bare: copper_ore missing');
  if (!/^<svg/.test(window.ART.node('copper'))) problems.push('bare: node copper missing');
  for (const bad of [undefined, null, 42, {}, '', 'hide']) {
    let s; try { s = window.ART.node(bad); } catch (e) { problems.push('bare: node threw on ' + String(bad)); continue; }
    if (!/^<svg[^>]*viewBox="0 0 96 96"/.test(s)) problems.push('bare: node placeholder bad for ' + String(bad));
  }
  try { window.ART.icon(undefined); window.ART.icon(null); } catch (e) { problems.push('bare: icon threw on non-string'); }
}
// ---- 3. real art packs then this pack ----
const window = {}; vm.createContext(window); window.window = window;
for (const f of PRE) vm.runInContext(read(f), window);
const norm = s => s.replace(/(q|i2|wf|i3)[0-9a-z]+_/g, 'ID_');
const hadNode = typeof window.ART.node;
if (hadNode !== 'undefined') problems.push('ART.node already existed before the pack (' + hadNode + ')');
const before = {}; for (const k of OLD) before[k] = norm(window.ART.icon(k));
const keysBefore = window.ART.keys.icons.slice();
const scenesBefore = { crystal_lake: norm(window.ART.scene('crystal_lake')), sentinel_hill: norm(window.ART.scene('sentinel_hill')) };
vm.runInContext(SRC, window);
const ART = window.ART;
for (const k of Object.keys(before)) if (norm(ART.icon(k)) !== before[k]) problems.push('existing icon changed: ' + k);
for (const k of Object.keys(scenesBefore)) if (norm(ART.scene(k)) !== scenesBefore[k]) problems.push('scene changed: ' + k);
if (keysBefore.some((k, i) => ART.keys.icons[i] !== k)) problems.push('existing icon keys reordered/lost');
for (const k of NEW) if (keysBefore.includes(k)) problems.push('key collides with an existing icon: ' + k);
const allIds = new Set();
function check(kind, k, s, size) {
  if (!new RegExp('^<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '"').test(s)) problems.push(kind + ' ' + k + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) problems.push(kind + ' ' + k + ': NaN/undefined');
  if (/<text|<filter|<image|<script|<foreignObject|<use/.test(s)) problems.push(kind + ' ' + k + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) { if (!/^i3[0-9a-z]+_/.test(id)) problems.push(kind + ' ' + k + ': bad id ' + id); if (allIds.has(id)) problems.push(kind + ' ' + k + ': id reused ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) problems.push(kind + ' ' + k + ': dangling ref ' + m[1]);
}
const out = {};
for (const k of NEW) {
  const s = ART.icon(k);
  check('icon', k, s, 64);
  if (s.indexOf('#5a5a62') >= 0 && s.length < 1500) problems.push(k + ': placeholder (threw?)');
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
}
const nodes = {};
for (const k of NODES) {
  const s = ART.node(k);
  check('node', k, s, 96);
  if (s.length < 1500) problems.push('node ' + k + ': placeholder (threw?)');
  if (/<rect x="0" y="0" width="96"/.test(s)) problems.push('node ' + k + ': not transparent');
  if (!ART.keys.nodes.includes(k)) problems.push('node keys missing ' + k);
  nodes[k] = s; fs.writeFileSync(path.join(OUT, 'node_' + k + '.svg'), s);
}
{ const s = ART.node('no_such_node'); check('node', 'placeholder', s, 96); }
if (ART.keys.nodes.length !== NODES.length) problems.push('ART.keys.nodes has ' + ART.keys.nodes.length + ' keys');
if (Object.keys(out).length !== NEW.length) problems.push('icon count');

// ---- sheets ----
const inner = (s, x, y, w, h) => s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="$1">`);
function png(p, w) { execFileSync(RSVG, ['-w', String(w), p, '-o', p.replace(/\.svg$/, '.png')]); }
function sheet(name, items, cw, cols, bg) {
  const pad = Math.max(6, cw / 8), rows = Math.ceil(items.length / cols); let body = '';
  items.forEach(([k, s], i) => { if (!s) return; body += inner(s, pad + (i % cols) * (cw + pad), pad + Math.floor(i / cols) * (cw + pad), cw, cw); });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (cw + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="${bg || '#1c1a20'}"/>${body}</svg>`);
  png(p, Wd);
}
const items = NEW.map(k => [k, out[k]]);
// (a) all new icons at 64 and at 40 (phone bag size)
sheet('all_64', items, 64, 8);
sheet('all_40', items, 40, 8);
sheet('all_128', items, 128, 8);
// look-alike rows at 40
const grp = []; const gcols = Math.max(...GROUPS.map(g => g.length));
for (const g of GROUPS) { for (const k of g) { if (!out[k] && !ART.keys.icons.includes(k)) problems.push('group: unknown key ' + k); grp.push([k, out[k] || ART.icon(k)]); } for (let i = g.length; i < gcols; i++) grp.push([null, null]); }
sheet('groups_40', grp, 40, gcols);
sheet('groups_64', grp, 64, gcols);
// (b) material + crafted icons next to art.js's pelt, water, chest_box, dust (reference column first on every row)
const cmp = []; const mats = [...MAT, ...CRAFT];
for (let i = 0; i < mats.length; i += 8) { cmp.push(...REF.map(k => [k, ART.icon(k)]), [null, null]); cmp.push(...mats.slice(i, i + 8).map(k => [k, out[k]])); for (let j = mats.slice(i, i + 8).length; j < 8; j++) cmp.push([null, null]); }
sheet('compare_items_64', cmp, 64, 13);
sheet('compare_items_40', cmp, 40, 13);
// nodes alone on a checker so transparency shows
{
  const cw = 96, pad = 12, cols = NODES.length; let body = '';
  NODES.forEach((k, i) => { body += inner(nodes[k], pad + i * (cw + pad), pad, cw, cw); });
  body += inner(ART.node('no_such_node'), pad, pad * 2 + cw, cw, cw);
  const Wd = pad + cols * (cw + pad), H = pad * 3 + cw * 2;
  const p = path.join(OUT, 'sheet_nodes_96.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><defs><pattern id="ck" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#b8b8b8"/><rect width="8" height="8" fill="#e0e0e0"/><rect x="8" y="8" width="8" height="8" fill="#e0e0e0"/></pattern></defs><rect width="${Wd}" height="${H}" fill="url(#ck)"/>${body}</svg>`);
  png(p, Wd * 2);
}
// (c) nodes placed on real scenes at ~46px wide (two depth rows), rendered at 2x so they can be judged
const NW = 46;
function onScene(name) {
  const sc = ART.scene(name);
  let body = inner(sc, 0, 0, 400, 240);
  // back row: 5 nodes with their ground line at y=178; front row: 4 nodes at y=222
  const place = (list, gy, x0, dx) => list.forEach((k, i) => { body += inner(nodes[k], x0 + i * dx, gy - NW * 86 / 96, NW, NW); });
  place(NODES.slice(0, 5), 178, 18, 76);
  place(NODES.slice(5), 222, 50, 80);
  const p = path.join(OUT, 'scene_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`);
  png(p, 800);
}
onScene('crystal_lake');
onScene('sentinel_hill');
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'OK: ' + NEW.length + ' icons, ' + NODES.length + ' nodes, no problems');
