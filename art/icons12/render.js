// Verifies src/art_icons12.js (Fishing and Cooking: the two profession badges, 12 raw fish, 3 raw meats, a spice pouch
// and 17 cooked dishes) and renders contact sheets into art/icons12/out/.
// Usage: node art/icons12/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, 'src', f));
// every icon-defining pack that loads before this one: art.js, art_icons2..11 (if present), art_mounts.js
const PRE = ['art.js'];
for (let n = 2; n <= 11; n++) if (exists('art_icons' + n + '.js')) PRE.push('art_icons' + n + '.js');
if (exists('art_mounts.js')) PRE.push('art_mounts.js');
const SRC = read('art_icons12.js');

const NEW = ['prof_cooking', 'prof_fishing',
  'silverfin_minnow', 'mudbelly_carp', 'whiskered_pike', 'glimmerscale', 'speckled_trout', 'reedback_perch',
  'ironjaw_catfish', 'lantern_eel', 'saltfin_snapper', 'greyscale_cod', 'stormback_tuna', 'duskglass_ray',
  'lean_meat', 'tough_meat', 'thick_steak', 'cooking_spices',
  'grilled_minnow', 'roast_lean_meat', 'carp_stew', 'spiced_pike', 'glimmerscale_supper', 'pan_fried_trout', 'meat_skewer',
  'perch_chowder', 'hunters_stew', 'catfish_gumbo', 'baked_lantern_eel', 'saltfin_skewer', 'peppered_steak', 'smoked_cod',
  'seafarers_stew', 'stormback_tuna_steak', 'duskglass_feast'];
// each new icon next to the 3 existing icons it is most likely to be confused with
const COMPARE = [
  ['prof_cooking', 'prof_alchemy', 'prof_blacksmithing', 'keg'], ['prof_fishing', 'prof_herbalism', 'prof_mining', 'staff'],
  ['silverfin_minnow', 'fin', 'feather', 'dagger'], ['mudbelly_carp', 'fin', 'bread', 'cactus_apple'],
  ['whiskered_pike', 'fin', 'moss', 'feather'], ['glimmerscale', 'fin', 'silk_cloth', 'feather'],
  ['speckled_trout', 'fin', 'bread', 'pelt'], ['reedback_perch', 'fin', 'cactus_apple', 'moss'],
  ['ironjaw_catfish', 'fin', 'heavy_stone', 'iron_ore'], ['lantern_eel', 'fin', 'venom', 'dimleaf'],
  ['saltfin_snapper', 'fin', 'meat', 'cactus_apple'], ['greyscale_cod', 'fin', 'feather', 'wool_cloth'],
  ['stormback_tuna', 'fin', 'steel_bar', 'lightning_bolt'], ['duskglass_ray', 'fin', 'bat_wing', 'silk_cloth'],
  ['lean_meat', 'meat', 'rib', 'cactus_apple'], ['tough_meat', 'meat', 'rib', 'medium_leather'],
  ['thick_steak', 'meat', 'rib', 'light_hide'], ['cooking_spices', 'bag_linen', 'bag_wool', 'dust'],
  ['grilled_minnow', 'bread', 'meat', 'eat'], ['roast_lean_meat', 'bread', 'meat', 'eat'],
  ['carp_stew', 'keg', 'eat', 'potion_red'], ['spiced_pike', 'bread', 'meat', 'eat'],
  ['glimmerscale_supper', 'bread', 'eat', 'elixir_gold'], ['pan_fried_trout', 'bread', 'eat', 'meat'],
  ['meat_skewer', 'meat', 'rib', 'eat'], ['perch_chowder', 'keg', 'water', 'eat'],
  ['hunters_stew', 'keg', 'eat', 'meat'], ['catfish_gumbo', 'keg', 'eat', 'smithing_coal'],
  ['baked_lantern_eel', 'bread', 'eat', 'venom'], ['saltfin_skewer', 'meat', 'rib', 'eat'],
  ['peppered_steak', 'meat', 'bread', 'eat'], ['smoked_cod', 'bread', 'meat', 'eat'],
  ['seafarers_stew', 'keg', 'eat', 'potion_red'], ['stormback_tuna_steak', 'meat', 'bread', 'eat'],
  ['duskglass_feast', 'grapes', 'bread', 'eat']];
// ids differ per call (counters), so compare icons with ids blanked
const norm = s => String(s).replace(/ id="[^"]+"/g, ' id=""').replace(/url\(#[^)]+\)/g, 'url(#)');
const problems = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: fall-through broken');
  for (const k of ['toString', 'hasOwnProperty', 'constructor', 'valueOf', '__proto__'])
    if (A.icon(k) !== 'BASE_ICON:' + k) problems.push('fake: prototype key not falling through ' + k);
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of NEW) if (!A.keys.icons.includes(k)) problems.push('fake: key missing ' + k);
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  if (!/^<svg/.test(window.ART.icon('anything'))) problems.push('bare: no placeholder');
  if (!/^<svg/.test(window.ART.icon('prof_cooking'))) problems.push('bare: prof_cooking missing');
  try { for (const bad of [undefined, null, 42, {}, '', 'toString']) if (!/^<svg/.test(window.ART.icon(bad))) problems.push('bare: bad key ' + String(bad)); }
  catch (e) { problems.push('bare: icon threw on odd key'); }
}
// ---- 2b. base icon that throws ----
{
  const window = { ART: { icon: () => { throw new Error('x'); } } }; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  try { if (!/^<svg/.test(window.ART.icon('elsewhere'))) problems.push('throwing base: no placeholder'); } catch (e) { problems.push('throwing base: threw'); }
}
// ---- 3. real art.js + every earlier pack, then this pack ----
const window = {}; vm.createContext(window); window.window = window;
const probes = ['nope', 'toString'];
for (const f of PRE) {
  const had = (window.ART && window.ART.keys && window.ART.keys.icons || []).slice();
  try { vm.runInContext(read(f), window); } catch (e) { problems.push('pre-pack failed to load: ' + f + ' (' + e.message + ')'); continue; }
  const added = window.ART.keys.icons.filter(k => !had.includes(k));
  // probe a spread of each pack's icons: first, middle, last
  for (const k of [added[0], added[added.length >> 1], added[added.length - 1]]) if (k && !probes.includes(k)) probes.push(k);
}
const existing = window.ART.keys.icons.slice();
for (const k of NEW) if (existing.includes(k)) problems.push('key already exists before pack: ' + k);
const before = {}; for (const k of probes) before[k] = norm(window.ART.icon(k));
const nodesBefore = window.ART.node ? (window.ART.keys.nodes || []).map(k => norm(window.ART.node(k))) : null;
vm.runInContext(SRC, window);
const ART = window.ART;
for (const k of Object.keys(before)) if (norm(ART.icon(k)) !== before[k]) problems.push('existing icon changed: ' + k);
for (const k of existing) if (!ART.keys.icons.includes(k)) problems.push('existing key lost: ' + k);
if (ART.keys.icons.length !== existing.length + NEW.length) problems.push('keys length ' + ART.keys.icons.length + ' != ' + (existing.length + NEW.length));
if (nodesBefore && (ART.keys.nodes || []).map(k => norm(ART.node(k))).join() !== nodesBefore.join()) problems.push('ART.node changed by this pack');
const allIds = new Set();
const out = {};
for (const k of NEW) {
  const s = ART.icon(k);
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 64 64"/.test(s)) problems.push(k + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) problems.push(k + ': NaN/undefined');
  if (/<text|<filter|<image|href=/.test(s)) problems.push(k + ': text/filter/image');
  if (s.indexOf('#5a5a62') >= 0 && s.length < 1500) problems.push(k + ': placeholder (threw?)');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) { if (!/^iZ[0-9a-z]+_/.test(id)) problems.push(k + ': bad id ' + id); if (allIds.has(id)) problems.push(k + ': id reused ' + id); allIds.add(id); }
  const refs = [...s.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);
  for (const r of refs) if (!ids.includes(r)) problems.push(k + ': dangling ref ' + r);
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
}
// packs numbered above 12 load after this one: warn if any of them also claims one of these keys
for (const f of fs.readdirSync(path.join(ROOT, 'src'))) {
  const m = /^art_icons(\d+)\.js$/.exec(f); if (!m || +m[1] <= 12) continue;
  const t = read(f);
  for (const k of NEW) if (new RegExp('\\b' + k + '\\s*:\\s*function').test(t)) problems.push('key also defined in later pack ' + f + ': ' + k);
}
// ---- sheets ----
function sheet(name, items, cw, cols) {
  const pad = Math.max(6, cw / 8), rows = Math.ceil(items.length / cols); let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (cw + pad);
    body += s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${cw}" height="${cw}" viewBox="$1">`);
  });
  const Wd = pad + cols * (cw + pad), H = pad + rows * (cw + pad);
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect width="${Wd}" height="${H}" fill="#1c1a20"/>${body}</svg>`);
  execFileSync(RSVG, ['-w', String(Wd), p, '-o', p.replace(/\.svg$/, '.png')]);
}
const newItems = NEW.map(k => [k, out[k]]);
sheet('new_128', newItems, 128, 6);
sheet('new_64', newItems, 64, 6);
sheet('new_40', newItems, 40, 6);
// look-alike comparison: one row per new icon, new first, then its 3 closest existing icons
const cmp = [];
for (const row of COMPARE) {
  if (!NEW.includes(row[0])) problems.push('compare: row not led by a new key ' + row[0]);
  for (const k of row.slice(1)) if (!existing.includes(k)) problems.push('compare: unknown existing key ' + k);
  for (const k of row) cmp.push([k, out[k] || ART.icon(k)]);
}
for (const k of NEW) if (!COMPARE.some(r => r[0] === k)) problems.push('compare: no row for ' + k);
sheet('compare_40', cmp, 40, 8);
sheet('compare_64', cmp, 64, 8);
console.log('loaded before: ' + PRE.join(', '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.join('\n') : 'OK: ' + NEW.length + ' icons, 0 problems');
