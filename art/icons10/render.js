// Verifies src/art_icons10.js (spell icons: 18 more class abilities, two per class)
// and renders contact sheets into art/icons10/out/.
// Usage: node art/icons10/render.js
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
// every icon-defining pack that loads before this one: art.js, art_icons2..9 (if present), art_mounts.js
const PRE = ['art.js'];
for (let n = 2; n <= 9; n++) if (exists('art_icons' + n + '.js')) PRE.push('art_icons' + n + '.js');
if (exists('art_mounts.js')) PRE.push('art_mounts.js');
const SRC = read('art_icons10.js');

const NEW = ['bladestorm', 'rallying_cry', 'arcane_blast', 'mirror_image', 'penance', 'divine_hymn',
  'killing_spree', 'shadow_dance', 'divine_storm', 'aura_mastery', 'haunt', 'metamorphosis', 'chimera_shot',
  'rapid_killing', 'typhoon', 'lifebloom', 'thunderstorm', 'bloodlust'];
// each new icon next to the 3 existing icons it is most likely to be confused with
const COMPARE = [
  ['bladestorm', 'whirlwind', 'hurricane', 'blade_flurry'], ['rallying_cry', 'battle_shout', 'retaliation', 'blessing_might'],
  ['arcane_blast', 'arcane_explosion', 'arcane_missiles', 'arcane_power'], ['mirror_image', 'fade', 'shadowform', 'prayer_of_fortitude'],
  ['penance', 'desperate_prayer', 'holy_shock', 'smite'], ['divine_hymn', 'holy_nova', 'prayer_of_fortitude', 'greater_heal'],
  ['killing_spree', 'eviscerate', 'blade_flurry', 'sinister_strike'], ['shadow_dance', 'shadowmeld', 'vanish', 'shadowform'],
  ['divine_storm', 'avenging_wrath', 'consecration', 'whirlwind'], ['aura_mastery', 'devotion_aura', 'retribution_aura', 'blessing_kings'],
  ['haunt', 'death_coil', 'soul_fire', 'siphon_life'], ['metamorphosis', 'demon_armor', 'summon_voidwalker', 'shadowfury'],
  ['chimera_shot', 'serpent_sting', 'wyvern_sting', 'aimed_shot'], ['rapid_killing', 'rapid_fire', 'multi_shot', 'volley'],
  ['typhoon', 'hurricane', 'mana_tide_totem', 'frost_nova'], ['lifebloom', 'rejuvenation', 'regrowth', 'gift_of_the_wild'],
  ['thunderstorm', 'lightning_bolt', 'chain_lightning', 'elemental_mastery'], ['bloodlust', 'berserker_rage', 'bloodrage', 'adrenaline_rush']];
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
  if (!/^<svg/.test(window.ART.icon('bladestorm'))) problems.push('bare: bladestorm missing');
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
vm.runInContext(SRC, window);
const ART = window.ART;
for (const k of Object.keys(before)) if (norm(ART.icon(k)) !== before[k]) problems.push('existing icon changed: ' + k);
for (const k of existing) if (!ART.keys.icons.includes(k)) problems.push('existing key lost: ' + k);
if (ART.keys.icons.length !== existing.length + NEW.length) problems.push('keys length ' + ART.keys.icons.length + ' != ' + (existing.length + NEW.length));
const allIds = new Set();
const out = {};
for (const k of NEW) {
  const s = ART.icon(k);
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 64 64"/.test(s)) problems.push(k + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) problems.push(k + ': NaN/undefined');
  if (/<text|<filter|<image|href=/.test(s)) problems.push(k + ': text/filter/image');
  if (s.indexOf('#5a5a62') >= 0 && s.length < 1500) problems.push(k + ': placeholder (threw?)');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) { if (!/^iX[0-9a-z]+_/.test(id)) problems.push(k + ': bad id ' + id); if (allIds.has(id)) problems.push(k + ': id reused ' + id); allIds.add(id); }
  const refs = [...s.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);
  for (const r of refs) if (!ids.includes(r)) problems.push(k + ': dangling ref ' + r);
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
}
// packs numbered above 10 load after this one: warn if any of them also claims one of these keys
for (const f of fs.readdirSync(path.join(ROOT, 'src'))) {
  const m = /^art_icons(\d+)\.js$/.exec(f); if (!m || +m[1] <= 10) continue;
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
