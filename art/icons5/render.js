// Verifies src/art_icons5.js (spell icons: level 26 + 28 abilities for every class, plus the six missing racials)
// and renders contact sheets into art/icons5/out/.
// Usage: node art/icons5/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const PRE = ['art.js', 'art_icons2.js', 'art_icons3.js', 'art_icons4.js'];
const SRC = read('art_icons5.js');

const NEW = ['overpower', 'whirlwind', 'blizzard', 'blast_wave', 'mind_flay', 'flash_heal', 'cheap_shot', 'feint',
  'hammer_of_wrath', 'holy_wrath', 'howl_of_terror', 'soul_fire', 'volley', 'aimed_shot', 'hurricane', 'barkskin',
  'chain_lightning', 'windfury_weapon', 'every_man', 'stoneform', 'escape_artist', 'shadowmeld', 'blood_fury', 'berserking'];
// each new icon next to the 3 existing icons it is most likely to be confused with
const COMPARE = [
  ['overpower', 'heroic_strike', 'shield_block', 'hamstring'], ['whirlwind', 'cleave', 'retaliation', 'blade_flurry'],
  ['blizzard', 'frost_nova', 'cone_of_cold', 'rain_of_fire'], ['blast_wave', 'fire_nova_totem', 'arcane_explosion', 'flamestrike'],
  ['mind_flay', 'mind_blast', 'sw_pain', 'psychic_scream'], ['flash_heal', 'heal', 'lesser_heal', 'holy_light'],
  ['cheap_shot', 'kidney_shot', 'gouge', 'hammer_justice'], ['feint', 'fade', 'evasion', 'ambush'],
  ['hammer_of_wrath', 'hammer_justice', 'judgement', 'exorcism'], ['holy_wrath', 'consecration', 'flamestrike', 'exorcism'],
  ['howl_of_terror', 'psychic_scream', 'intimidating_shout', 'curse_of_agony'], ['soul_fire', 'fireball', 'shadowburn', 'immolate'],
  ['volley', 'multi_shot', 'rain_of_fire', 'rapid_fire'], ['aimed_shot', 'hunters_mark', 'arcane_shot', 'auto_shot'],
  ['hurricane', 'insect_swarm', 'thorns', 'regrowth'], ['barkskin', 'thorns', 'stoneskin_totem', 'bloodrage'],
  ['chain_lightning', 'lightning_bolt', 'lightning_shield', 'earth_shock'], ['windfury_weapon', 'rockbiter_weapon', 'flametongue_weapon', 'lightning_shield'],
  ['every_man', 'will_forsaken', 'battle_shout', 'pw_fortitude'], ['stoneform', 'stoneskin_totem', 'divine_protection', 'war_stomp'],
  ['escape_artist', 'will_forsaken', 'evasion', 'hamstring'], ['shadowmeld', 'fade', 'ambush', 'sw_pain'],
  ['blood_fury', 'bloodrage', 'intimidating_shout', 'battle_shout'], ['berserking', 'bloodrage', 'intimidating_shout', 'immolate']];
// existing icons that must not change once the pack loads (art.js, icons2, icons3, icons4, an unknown key)
const OLD = ['heroic_strike', 'fireball', 'fire_blast', 'smite', 'pw_shield', 'searing_totem', 'healing_wave', 'moonfire', 'revive_pet',
  'taunt', 'sword', 'cleave', 'psychic_scream', 'retribution_aura', 'copper_ore', 'potion_blue', 'shield_block', 'fade', 'scorch',
  'fire_nova_totem', 'nope'];
const IDS = /(q|i2|i3|i4)[0-9a-z]+_/g;
const problems = [];

// ---- 1. pack alone on a fake ART ----
{
  const window = { ART: { icon: k => 'BASE_ICON:' + k, keys: { icons: ['x_icon'] } } };
  const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  const A = window.ART;
  if (A.icon('elsewhere') !== 'BASE_ICON:elsewhere') problems.push('fake: fall-through broken');
  if (A.icon('toString') !== 'BASE_ICON:toString') problems.push('fake: prototype key not falling through');
  if (A.icon('hasOwnProperty') !== 'BASE_ICON:hasOwnProperty') problems.push('fake: prototype key not falling through');
  if (A.keys.icons[0] !== 'x_icon') problems.push('fake: existing keys lost');
  for (const k of NEW) if (!A.keys.icons.includes(k)) problems.push('fake: key missing ' + k);
}
// ---- 2. pack with no ART at all ----
{
  const window = {}; const ctx = { window }; vm.createContext(ctx); vm.runInContext(SRC, ctx);
  if (!/^<svg/.test(window.ART.icon('anything'))) problems.push('bare: no placeholder');
  if (!/^<svg/.test(window.ART.icon('volley'))) problems.push('bare: volley missing');
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
  for (const id of ids) { if (!/^i5[0-9a-z]+_/.test(id)) problems.push(k + ': bad id ' + id); if (allIds.has(id)) problems.push(k + ': id reused ' + id); allIds.add(id); }
  const refs = [...s.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);
  for (const r of refs) if (!ids.includes(r)) problems.push(k + ': dangling ref ' + r);
  if (!ART.keys.icons.includes(k)) problems.push('keys missing ' + k);
  out[k] = s; fs.writeFileSync(path.join(OUT, 'icon_' + k + '.svg'), s);
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
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.join('\n') : 'OK: ' + NEW.length + ' icons, 0 problems');
