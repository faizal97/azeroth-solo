// Verifies src/art_icons9.js (spell icons: 18 more class abilities, two per class)
// and renders contact sheets into art/icons9/out/.
// Usage: node art/icons9/render.js
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
// every icon-defining pack on disk that loads before this one: art.js, art_icons2..8 (if present), art_mounts.js
const PRE = ['art.js', 'art_icons2.js', 'art_icons3.js', 'art_icons4.js', 'art_icons5.js', 'art_icons6.js', 'art_icons7.js', 'art_icons8.js', 'art_mounts.js']
  .filter((f, i) => i === 0 || exists(f));
// other icon packs that may exist on disk (written in parallel): loaded too so key clashes show, but a broken one is only a note
const EXTRA = fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^art_icons\d+\.js$/.test(f) && !PRE.includes(f) && f !== 'art_icons9.js').sort();
const SRC = read('art_icons9.js');

const NEW = ['shield_slam', 'last_stand', 'arcane_brilliance', 'dragons_breath', 'vampiric_embrace', 'pain_suppression',
  'fan_of_knives', 'cloak_of_shadows', 'holy_shield', 'hammer_righteous', 'incinerate', 'demonic_sacrifice', 'kill_command',
  'bestial_wrath', 'starfall', 'wild_growth', 'earthquake', 'fire_elemental_totem'];
// each new icon next to the 3 existing icons it is most likely to be confused with
const COMPARE = [
  ['shield_slam', 'shield_block', 'shield_wall', 'intercept'], ['last_stand', 'shield_wall', 'berserker_rage', 'bloodrage'],
  ['arcane_brilliance', 'arcane_explosion', 'prayer_of_fortitude', 'arcane_power'], ['dragons_breath', 'flamestrike', 'blast_wave', 'combustion'],
  ['vampiric_embrace', 'shadowform', 'siphon_life', 'mind_flay'], ['pain_suppression', 'pw_shield', 'power_infusion', 'divine_protection'],
  ['fan_of_knives', 'blade_flurry', 'retaliation', 'eviscerate'], ['cloak_of_shadows', 'vanish', 'shadowmeld', 'shadowform'],
  ['holy_shield', 'shield_block', 'devotion_aura', 'divine_protection'], ['hammer_righteous', 'hammer_justice', 'hammer_of_wrath', 'crusader_strike'],
  ['incinerate', 'fireball', 'soul_fire', 'scorch'], ['demonic_sacrifice', 'summon_voidwalker', 'summon_imp', 'shadowburn'],
  ['kill_command', 'hunters_mark', 'tame_beast', 'feral_charge'], ['bestial_wrath', 'frenzied_regeneration', 'berserker_rage', 'rapid_fire'],
  ['starfall', 'starfire', 'moonfire', 'hurricane'], ['wild_growth', 'regrowth', 'rejuvenation', 'entangling_roots'],
  ['earthquake', 'earth_shock', 'war_stomp', 'shadowfury'], ['fire_elemental_totem', 'searing_totem', 'magma_totem', 'fire_nova_totem']];
// existing icons that must not change once the pack loads (art.js, icons2..8, mounts, an unknown key)
const OLD = ['heroic_strike', 'fireball', 'fire_blast', 'smite', 'pw_shield', 'searing_totem', 'healing_wave', 'moonfire', 'revive_pet',
  'taunt', 'sword', 'cleave', 'psychic_scream', 'retribution_aura', 'copper_ore', 'potion_blue', 'shield_block', 'fade', 'scorch',
  'fire_nova_totem', 'overpower', 'volley', 'chain_lightning', 'berserking', 'shield_wall', 'pyroblast', 'bash', 'chain_heal',
  'bear_form', 'curse_of_agony', 'immolation_trap', 'mortal_strike', 'hellfire', 'mana_tide_totem', 'intercept', 'combustion',
  'earth_shield', 'elemental_mastery', 'mount_wolf', 'riding', 'nope'];
const IDS = /(q|i[0-9]+|mt)[0-9a-z]+_/g;
const problems = [], notes = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: fall-through broken');
  if (A.icon('toString') !== 'BASE_ICON:toString') problems.push('fake: prototype key not falling through');
  if (A.icon('hasOwnProperty') !== 'BASE_ICON:hasOwnProperty') problems.push('fake: prototype key not falling through');
  if (A.icon('__proto__') !== 'BASE_ICON:__proto__') problems.push('fake: __proto__ not falling through');
  if (A.icon('constructor') !== 'BASE_ICON:constructor') problems.push('fake: constructor not falling through');
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of NEW) if (!A.keys.icons.includes(k)) problems.push('fake: key missing ' + k);
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  if (!/^<svg/.test(window.ART.icon('anything'))) problems.push('bare: no placeholder');
  if (!/^<svg/.test(window.ART.icon('starfall'))) problems.push('bare: starfall missing');
  try { for (const bad of [undefined, null, 42, {}, '', 'toString']) if (!/^<svg/.test(window.ART.icon(bad))) problems.push('bare: bad key ' + String(bad)); }
  catch (e) { problems.push('bare: icon threw on odd key'); }
}
// ---- 2b. base icon that throws ----
{
  const window = { ART: { icon: () => { throw new Error('x'); } } }; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  try { if (!/^<svg/.test(window.ART.icon('elsewhere'))) problems.push('throwing base: no placeholder'); } catch (e) { problems.push('throwing base: threw'); }
}
// ---- 3. real art.js + packs, then this pack ----
const window = {}; vm.createContext(window); window.window = window;
for (const f of PRE) vm.runInContext(read(f), window);
for (const f of EXTRA) { try { vm.runInContext(read(f), window); notes.push('also loaded ' + f); } catch (e) { notes.push('could not load ' + f + ': ' + e.message); } }
const existing = window.ART.keys.icons.slice();
for (const k of NEW) if (existing.includes(k)) problems.push('key already exists before pack: ' + k);
const before = {}; for (const k of OLD) before[k] = window.ART.icon(k).replace(IDS, 'ID_');
vm.runInContext(SRC, window);
const ART = window.ART;
for (const k of Object.keys(before)) if (ART.icon(k).replace(IDS, 'ID_') !== before[k]) problems.push('existing icon changed: ' + k);
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
  for (const id of ids) { if (!/^i9[0-9a-z]+_/.test(id)) problems.push(k + ': bad id ' + id); if (allIds.has(id)) problems.push(k + ': id reused ' + id); allIds.add(id); }
  const refs = [...s.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);
  for (const r of refs) if (!ids.includes(r)) problems.push(k + ': dangling ref ' + r);
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
}
// ids must not collide with any existing icon either
for (const k of existing) for (const m of ART.icon(k).matchAll(/ id="([^"]+)"/g)) if (allIds.has(m[1])) problems.push('id shared with existing ' + k + ': ' + m[1]);
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
if (notes.length) console.log(notes.join('\n'));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.join('\n') : 'OK: ' + NEW.length + ' icons, 0 problems');
