// Renders every ART key to art/out/*.svg + PNG, and builds contact sheets.
// Usage: node art/render.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });

const window = {};
vm.createContext(window);
window.window = window;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), window);
const ART = window.ART;

const req = {
  mobs: ['young_wolf', 'kobold_vermin', 'kobold_worker', 'defias_thug', 'garrick_padfoot', 'mangy_wolf', 'prowler', 'young_forest_bear',
    'kobold_laborer', 'kobold_tunneler', 'murloc_streamrunner', 'murloc_forager', 'defias_bandit', 'riverpaw_gnoll', 'princess', 'hogger',
    'defias_miner', 'defias_pirate', 'goblin_engineer', 'rhahkzor', 'sneed_shredder', 'gilnid', 'mr_smite', 'cookie', 'vancleef'],
  scenes: ['northshire_abbey', 'echo_ridge', 'vineyards', 'goldshire', 'fargodeep', 'crystal_lake', 'brackwell', 'forests_edge', 'deadmines_mine', 'deadmines_ship'],
  icons: ['attack', 'heroic_strike', 'battle_shout', 'charge', 'rend', 'thunder_clap', 'fireball', 'frost_armor', 'frostbolt', 'fire_blast', 'arcane_missiles',
    'smite', 'lesser_heal', 'pw_fortitude', 'sw_pain', 'pw_shield', 'renew', 'sinister_strike', 'eviscerate', 'gouge', 'evasion', 'slice_and_dice', 'eat', 'drink', 'taunt',
    'sword', 'dagger', 'mace', 'staff', 'wand', 'axe', 'chest_cloth', 'chest_leather', 'chest_mail', 'legs', 'boots', 'gloves', 'cloak', 'belt', 'bracers', 'ring',
    'bread', 'water', 'meat', 'candle', 'bandana', 'fin', 'dust', 'head', 'claw', 'armband', 'grapes', 'pelt', 'coin', 'chest_box', 'hearthstone',
    'seal_righteousness', 'holy_light', 'devotion_aura', 'judgement', 'divine_protection', 'hammer_justice',
    'shadow_bolt', 'immolate', 'demon_skin', 'corruption', 'life_tap', 'curse_of_agony',
    'summon_imp', 'summon_voidwalker', 'firebolt', 'torment',
    'auto_shot', 'raptor_strike', 'serpent_sting', 'arcane_shot', 'hunters_mark', 'concussive_shot', 'aspect_monkey', 'tame_beast',
    'wrath', 'healing_touch', 'mark_wild', 'moonfire', 'rejuvenation', 'thorns', 'entangling_roots', 'bear_form',
    'bow', 'maul', 'growl', 'revive_pet'],
  pets: ['imp', 'voidwalker', 'bear_form']
};
const NEW_ICONS = req.icons.slice(req.icons.indexOf('seal_righteousness'));
let problems = [];
for (const k of Object.keys(req)) {
  const have = new Set(ART.keys[k]);
  for (const key of req[k]) if (!have.has(key)) problems.push(`missing ${k}: ${key}`);
}

function checkSvg(name, s) {
  if (!/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(s)) problems.push(name + ': bad root');
  if (/NaN|undefined/.test(s)) problems.push(name + ': NaN/undefined in output');
  if (/<text|<filter/.test(s)) problems.push(name + ': text or filter element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) problems.push(name + ': duplicate ids');
}

const allIds = new Set();
function write(name, s) {
  checkSvg(name, s);
  for (const m of s.matchAll(/ id="([^"]+)"/g)) { if (allIds.has(m[1])) problems.push(name + ': id reused across calls ' + m[1]); allIds.add(m[1]); }
  fs.writeFileSync(path.join(OUT, name + '.svg'), s);
  return s;
}
function png(svgPath, w) {
  execFileSync(RSVG, ['-w', String(w), svgPath, '-o', svgPath.replace(/\.svg$/, '.png')]);
}

const mobs = ART.keys.mobs.map(k => [k, write('mob_' + k, ART.mob(k))]);
const scenes = ART.keys.scenes.map(k => [k, write('scene_' + k, ART.scene(k))]);
const icons = ART.keys.icons.map(k => [k, write('icon_' + k, ART.icon(k))]);
const heroes = [];
const classes = ['warrior', 'mage', 'priest', 'rogue', 'paladin', 'warlock', 'hunter', 'druid'];
for (const cls of classes) for (const gender of ['m', 'f']) for (let i = 0; i < 5; i++) {
  const o = { cls, gender, skin: i % 4, hair: i };
  heroes.push([`${cls}_${gender}_s${o.skin}_h${i}`, write(`hero_${cls}_${gender}_s${o.skin}_h${i}`, ART.hero(o)), write(`portrait_${cls}_${gender}_s${o.skin}_h${i}`, ART.portrait(o))]);
}
write('mob__unknown', ART.mob('nope'));
write('icon__unknown', ART.icon('nope'));
write('scene__unknown', ART.scene('nope'));
write('hero__bad', ART.hero({ cls: 'nope', skin: 9, hair: -3 }));
write('pet__unknown', ART.pet('nope'));
write('hero_warlock_hoodonly', ART.hero({ cls: 'warlock', skin: 2, hair: 1, gender: 'f', cowl: 'hood' }));
const pets = ART.keys.pets.map(k => [k, write('pet_' + k, ART.pet(k))]);
write('portrait__none', ART.portrait());

for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg') && !f.startsWith('sheet_')) {
  const w = f.startsWith('scene_') ? 400 : f.startsWith('icon_') || f.startsWith('portrait_') ? 128 : 256;
  png(path.join(OUT, f), w);
}

function inner(s) { return s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, '<svg viewBox="$1" ').replace(/^<svg viewBox="([^"]+)" /, (m, vb) => `<svg viewBox="${vb}" `); }
function sheet(name, items, cw, ch, cols, bg, scaleW) {
  const rows = Math.ceil(items.length / cols), pad = 8;
  let body = '';
  items.forEach(([k, s], i) => {
    const x = pad + (i % cols) * (cw + pad), y = pad + Math.floor(i / cols) * (ch + pad);
    body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${bg}"/>`;
    body += s.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, `<svg x="${x}" y="${y}" width="${cw}" height="${ch}" viewBox="$1">`);
  });
  const W = pad + cols * (cw + pad), H = pad + rows * (ch + pad);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#222"/>${body}</svg>`;
  const p = path.join(OUT, 'sheet_' + name + '.svg');
  fs.writeFileSync(p, svg);
  execFileSync(RSVG, ['-w', String(scaleW || W), p, '-o', p.replace(/\.svg$/, '.png')]);
}
sheet('mobs', mobs, 128, 128, 5, '#7f9a6a');
sheet('heroes', heroes.map(h => [h[0], h[1]]), 128, 128, 5, '#7f9a6a');
sheet('portraits', heroes.map(h => [h[0], h[2]]), 64, 64, 10, '#333');
sheet('scenes', scenes, 400, 240, 2, '#000');
sheet('icons', icons, 64, 64, 8, '#000');
// small-size check: icons at 48px, mobs at 110px
sheet('icons_small', icons, 48, 48, 12, '#000');
// mobs standing on their scenes
const pairs = [['young_wolf', 'northshire_abbey'], ['kobold_worker', 'echo_ridge'], ['defias_thug', 'vineyards'], ['murloc_streamrunner', 'crystal_lake'],
  ['hogger', 'forests_edge'], ['princess', 'brackwell'], ['kobold_tunneler', 'fargodeep'], ['prowler', 'goldshire'], ['sneed_shredder', 'deadmines_mine'], ['vancleef', 'deadmines_ship']];
const onScene = pairs.map(([m, sc]) => {
  const s = ART.scene(sc), mb = ART.mob(m), hr = ART.hero({ cls: 'warrior', skin: 1, hair: 2, gender: 'm' });
  const strip = t => t.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, '');
  const body = strip(s).replace(/<\/svg>$/, '') + `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(mb)}` + `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(hr)}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
sheet('onscene', onScene, 400, 240, 2, '#000');

// ---- v2 additions: paladin, warlock, pets, new icons ----
const byCls = cls => heroes.filter(h => h[0].startsWith(cls + '_'));
sheet('heroes_new', [...byCls('paladin'), ...byCls('warlock'), ...byCls('hunter'), ...byCls('druid')].map(h => [h[0], h[1]]), 128, 128, 5, '#7f9a6a');
sheet('portraits_new', [...byCls('paladin'), ...byCls('warlock'), ...byCls('hunter'), ...byCls('druid')].map(h => [h[0], h[2]]), 64, 64, 10, '#333');
// all six classes side by side at ~110px (the at-a-glance check)
const six = [];
for (const combo of [{ skin: 0, hair: 0, gender: 'm' }, { skin: 2, hair: 3, gender: 'f' }, { skin: 1, hair: 2, gender: 'm' }])
  for (const cls of ['warrior', 'paladin', 'mage', 'warlock', 'priest', 'druid', 'rogue', 'hunter']) six.push([cls, ART.hero(Object.assign({ cls }, combo))]);
sheet('classes_110', six, 110, 110, 8, '#7f9a6a');
sheet('portraits_8', ['warrior', 'paladin', 'mage', 'warlock', 'priest', 'druid', 'rogue', 'hunter'].map(cls => [cls, ART.portrait({ cls, skin: 1, hair: 1, gender: 'm' })]), 64, 64, 8, '#333');
sheet('pets', pets, 128, 128, 3, '#7f9a6a');
const newIcons = NEW_ICONS.map(k => icons.find(i => i[0] === k));
sheet('icons_new', newIcons, 64, 64, 8, '#000');
sheet('icons_new_small', newIcons, 48, 48, 8, '#000');
// pets standing next to a warlock on a scene, facing the mob
const strip = t => t.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="[^"]+" height="[^"]+">/, '');
const petScene = [['imp', 'northshire_abbey', 'kobold_vermin', 0, 'warlock'], ['voidwalker', 'echo_ridge', 'defias_thug', 3, 'warlock'], ['bear_form', 'forests_edge', 'riverpaw_gnoll', 1, 'druid']].map(([p, sc, m, sk, cls]) => {
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') +
    `<svg x="10" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls, skin: sk, hair: 1, gender: 'm' }))}` +
    `<svg x="115" y="108" width="122" height="122" viewBox="0 0 128 128">${strip(ART.pet(p))}` +
    `<svg x="265" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
sheet('pets_onscene', petScene, 400, 240, 1, '#000');


// ---- v3: named gear looks (opts.gear) ----
const L = ART.keys.looks || {};
const wantLooks = { weapon: ['cruel_barb', 'smites_hammer', 'thiefs_blade', 'buzzer_blade', 'emberstone_staff', 'cookies_rod', 'cookies_tenderizer', 'militia_sword', 'militia_dagger', 'militia_hammer', 'militia_staff'],
  ranged: ['militia_longbow'], back: ['cape_brotherhood', 'garrick_cloak', 'gnollhide_cloak'], chest: ['defias_armor', 'corsair_shirt'],
  legs: ['smelting_pants', 'defias_leggings', 'pumpkin_trousers'], mask: ['defias'] };
for (const slot in wantLooks) for (const k of wantLooks[slot]) if (!(L[slot] || []).includes(k)) problems.push(`missing look ${slot}: ${k}`);
const WIELD = { blade: ['warrior', 'rogue', 'paladin'], dagger: ['warrior', 'rogue', 'paladin'], hammer: ['paladin', 'priest', 'warrior'], staff: ['mage', 'priest', 'warlock', 'druid'] };
const KIND = { cruel_barb: 'blade', thiefs_blade: 'blade', militia_sword: 'blade', buzzer_blade: 'dagger', militia_dagger: 'dagger',
  smites_hammer: 'hammer', cookies_tenderizer: 'hammer', militia_hammer: 'hammer', emberstone_staff: 'staff', cookies_rod: 'staff', militia_staff: 'staff' };
const look = (name, o) => write('gear_' + name, ART.hero(o));
const gw = [];
for (const k of wantLooks.weapon) WIELD[KIND[k]].forEach((cls, i) => gw.push([k, look(`w_${k}_${cls}`, { cls, skin: i, hair: i + 1, gender: i % 2 ? 'f' : 'm', gear: { weapon: k } })]));
gw.push(['militia_longbow', look('r_longbow_hunter_m', { cls: 'hunter', skin: 1, hair: 0, gender: 'm', gear: { ranged: 'militia_longbow' } })]);
gw.push(['militia_longbow', look('r_longbow_hunter_f', { cls: 'hunter', skin: 3, hair: 3, gender: 'f', gear: { ranged: 'militia_longbow' } })]);
gw.push(['hunter_melee', look('w_hunter_melee', { cls: 'hunter', skin: 0, hair: 2, gender: 'm', gear: { weapon: 'militia_sword', ranged: 'militia_longbow' } })]);
sheet('gear_weapons', gw, 110, 110, 6, '#7f9a6a');
sheet('gear_weapons_big', gw.slice(0, 18), 256, 256, 6, '#7f9a6a');
const ga = [];
const armorCls = { back: ['warrior', 'mage', 'hunter'], chest: ['warrior', 'priest', 'rogue'], legs: ['warrior', 'rogue', 'paladin'] };
for (const slot of ['back', 'chest', 'legs']) for (const k of wantLooks[slot]) armorCls[slot].forEach((cls, i) =>
  ga.push([k, look(`${slot}_${k}_${cls}`, { cls, skin: (i + 1) % 4, hair: (i * 2) % 5, gender: i === 1 ? 'f' : 'm', gear: { [slot]: k } })]));
sheet('gear_armor', ga, 110, 110, 6, '#7f9a6a');
sheet('gear_armor_big', ga, 200, 200, 6, '#7f9a6a');
const farm = [
  ['rogue_farmer', { cls: 'rogue', skin: 1, hair: 1, gender: 'm', gear: { chest: 'defias_armor', legs: 'defias_leggings', mask: 'defias', back: 'cape_brotherhood', weapon: 'thiefs_blade' } }],
  ['rogue_farmer_f', { cls: 'rogue', skin: 2, hair: 3, gender: 'f', gear: { chest: 'defias_armor', legs: 'defias_leggings', mask: 'defias', back: 'cape_brotherhood', weapon: 'thiefs_blade' } }],
  ['warrior_farmer', { cls: 'warrior', skin: 0, hair: 2, gender: 'm', gear: { weapon: 'cruel_barb', legs: 'smelting_pants', back: 'cape_brotherhood' } }],
  ['warrior_farmer_f', { cls: 'warrior', skin: 3, hair: 0, gender: 'f', gear: { weapon: 'cruel_barb', legs: 'smelting_pants', back: 'cape_brotherhood' } }],
  ['mask_mage', { cls: 'mage', skin: 1, hair: 2, gender: 'm', gear: { mask: 'defias', chest: 'corsair_shirt', legs: 'pumpkin_trousers', weapon: 'cookies_rod' } }],
  ['mask_warlock', { cls: 'warlock', skin: 0, hair: 4, gender: 'f', gear: { mask: 'defias', back: 'gnollhide_cloak', weapon: 'emberstone_staff' } }]
];
const farmers = farm.map(([n, o]) => [n, look('set_' + n, o)]);
sheet('gear_sets', farmers, 256, 256, 3, '#7f9a6a');
sheet('gear_sets_110', farmers, 110, 110, 6, '#7f9a6a');
const gp = [];
for (const [n, o] of farm) gp.push([n, write('gear_portrait_' + n, ART.portrait(o))]);
for (const k of wantLooks.back) for (const cls of ['warrior', 'mage', 'hunter', 'priest']) gp.push([k, write(`gear_portrait_${k}_${cls}`, ART.portrait({ cls, skin: 1, hair: 1, gender: 'm', gear: { back: k } }))]);
for (const cls of ['warrior', 'paladin', 'mage', 'warlock', 'priest', 'druid', 'rogue', 'hunter']) gp.push(['mask_' + cls, write('gear_portrait_mask_' + cls, ART.portrait({ cls, skin: 2, hair: 2, gender: 'f', gear: { mask: 'defias', chest: 'defias_armor' } }))]);
sheet('gear_portraits', gp, 64, 64, 8, '#333');
sheet('gear_portraits_big', gp, 128, 128, 8, '#333');
// robustness: unknown/garbage gear never throws and falls back to the default look
for (const bad of [{ weapon: 'nope' }, { back: 5 }, { chest: null }, 'str', 42, { ranged: 'militia_longbow' }]) write('gear_bad_' + Math.random().toString(36).slice(2, 7), ART.hero({ cls: 'mage', gear: bad }));
for (const f of fs.readdirSync(OUT)) if (f.startsWith('gear_') && f.endsWith('.svg')) png(path.join(OUT, f), f.startsWith('gear_portrait') ? 128 : 256);

// ---- v4: Dun Morogh — races (dwarf, gnome), snowy scenes, mobs, looks, icons ----
const DM = {
  mobs: ['rockjaw_trogg', 'burly_rockjaw_trogg', 'frostmane_troll_whelp', 'frostmane_troll', 'frostmane_headhunter', 'frostmane_seer', 'grik_nir',
    'ragged_young_wolf', 'small_crag_boar', 'crag_boar', 'elder_crag_boar', 'ice_claw_bear', 'snow_leopard', 'vagash', 'young_wendigo', 'wendigo', 'old_icebeard', 'leper_gnome'],
  scenes: ['coldridge_valley', 'coldridge_cave', 'kharanos', 'grizzled_den', 'frostmane_hold', 'amberstill_ranch', 'ironforge'],
  icons: ['journal', 'keg', 'rib'],
  looks: { weapon: ['griknir_staff', 'vagash_claw'], back: ['icebeard_cloak'] }
};
for (const k of ['mobs', 'scenes', 'icons']) { const have = new Set(ART.keys[k]); for (const key of DM[k]) if (!have.has(key)) problems.push(`missing ${k}: ${key}`); }
for (const slot in DM.looks) for (const k of DM.looks[slot]) if (!(L[slot] || []).includes(k)) problems.push(`missing look ${slot}: ${k}`);
if (JSON.stringify(ART.keys.races) !== JSON.stringify(['human', 'dwarf', 'gnome', 'nightelf', 'orc', 'troll', 'tauren', 'undead'])) problems.push('keys.races wrong: ' + JSON.stringify(ART.keys.races));
// race 'human' (and garbage race values) must be the default output, ids aside
const normId = t => t.replace(/q[0-9a-z]+_([0-9a-z]+)/g, 'Q_$1');
for (const cls of classes) for (const race of ['human', 'elf', 42, null]) {
  const o = { cls, skin: 2, hair: 3, gender: 'f', gear: { weapon: 'cruel_barb', back: 'cape_brotherhood' } };
  if (normId(ART.hero(o)) !== normId(ART.hero(Object.assign({ race }, o)))) problems.push(`race ${race} differs from default for ${cls}`);
  if (normId(ART.portrait(o)) !== normId(ART.portrait(Object.assign({ race }, o)))) problems.push(`race ${race} portrait differs for ${cls}`);
}
const RC = ['human', 'dwarf', 'gnome'];
const races110 = [];
for (const race of RC) for (const gender of ['m', 'f']) classes.forEach((cls, i) => {
  const o = { cls, race, gender, skin: i % 4, hair: (i + (gender === 'f' ? 2 : 0)) % 5 };
  races110.push([`${race}_${cls}_${gender}`, write(`race_${race}_${cls}_${gender}`, ART.hero(o))]);
  write(`race_portrait_${race}_${cls}_${gender}`, ART.portrait(o));
});
sheet('races_110', races110, 110, 110, 8, '#8aa0b4');
// every skin x hair for the two new races, both genders
const raceVar = [];
for (const race of ['dwarf', 'gnome']) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) raceVar.push([`${race}${gender}${h}`, ART.hero({ cls: classes[(h * 3 + (gender === 'f' ? 1 : 0)) % 8], race, gender, skin: h % 4, hair: h })]);
sheet('races_variants', raceVar, 200, 200, 5, '#8aa0b4');
const raceGear = [];
const RSETS = [['farmer_rogue', 'rogue', farm[0][1].gear], ['cruel_barb_warrior', 'warrior', farm[2][1].gear], ['emberstone_mage', 'mage', { weapon: 'emberstone_staff', back: 'gnollhide_cloak', legs: 'smelting_pants' }]];
for (const [n, cls, gear] of RSETS) for (const race of RC) for (const gender of ['m', 'f'])
  raceGear.push([`${n}_${race}_${gender}`, write(`race_gear_${n}_${race}_${gender}`, ART.hero({ cls, race, gender, skin: gender === 'f' ? 2 : 1, hair: gender === 'f' ? 3 : 2, gear }))]);
sheet('races_gear_110', raceGear, 110, 110, 6, '#8aa0b4');
sheet('races_gear', raceGear, 200, 200, 6, '#8aa0b4');
const racePorts = [];
for (const race of RC) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) {
  const cls = classes[(h + (gender === 'f' ? 4 : 0)) % 8];
  racePorts.push([`${race}${gender}${h}`, ART.portrait({ cls, race, gender, skin: h % 4, hair: h })]);
}
for (const [n, cls, gear] of RSETS) for (const race of ['dwarf', 'gnome']) racePorts.push([n + race, ART.portrait({ cls, race, gender: 'm', skin: 1, hair: 2, gear })]);
sheet('races_portraits', racePorts, 64, 64, 10, '#333');
sheet('races_portraits_big', racePorts, 128, 128, 10, '#333');
sheet('scenes_dm', DM.scenes.map(k => [k, ART.scene(k)]), 400, 240, 2, '#000');
sheet('mobs_dm', DM.mobs.map(k => [k, ART.mob(k)]), 128, 128, 6, '#8aa0b4');
sheet('mobs_dm_110', DM.mobs.map(k => [k, ART.mob(k)]), 110, 110, 9, '#8aa0b4');
const dmPairs = [['rockjaw_trogg', 'coldridge_valley', 'warrior', 'dwarf'], ['burly_rockjaw_trogg', 'coldridge_valley', 'mage', 'gnome'], ['frostmane_troll_whelp', 'coldridge_cave', 'priest', 'dwarf'],
  ['frostmane_troll', 'coldridge_cave', 'rogue', 'gnome'], ['frostmane_headhunter', 'frostmane_hold', 'hunter', 'dwarf'], ['frostmane_seer', 'frostmane_hold', 'warlock', 'gnome'],
  ['grik_nir', 'frostmane_hold', 'paladin', 'dwarf'], ['ragged_young_wolf', 'coldridge_valley', 'druid', 'human'], ['small_crag_boar', 'amberstill_ranch', 'warrior', 'gnome'],
  ['crag_boar', 'kharanos', 'hunter', 'human'], ['elder_crag_boar', 'amberstill_ranch', 'paladin', 'dwarf'], ['ice_claw_bear', 'grizzled_den', 'priest', 'gnome'],
  ['snow_leopard', 'amberstill_ranch', 'rogue', 'dwarf'], ['vagash', 'grizzled_den', 'warrior', 'dwarf'], ['young_wendigo', 'grizzled_den', 'mage', 'human'],
  ['wendigo', 'grizzled_den', 'hunter', 'gnome'], ['old_icebeard', 'grizzled_den', 'warlock', 'dwarf'], ['leper_gnome', 'kharanos', 'mage', 'gnome']];
const dmOn = dmPairs.map(([m, sc, cls, race], i) => {
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') +
    `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls, race, skin: i % 4, hair: i % 5, gender: i % 3 ? 'm' : 'f' }))}` +
    `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
// the three races side by side in Ironforge, same class, for scale
dmOn.push(['ironforge_trio', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene('ironforge')).replace(/<\/svg>$/, '')}` +
  RC.map((race, i) => `<svg x="${40 + i * 110}" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls: 'paladin', race, skin: 1, hair: i + 1, gender: 'm' }))}`).join('') + '</svg>']);
sheet('mobs_dm_onscene', dmOn, 400, 240, 2, '#000');
const dmLooks = [];
[['griknir_staff', ['mage', 'priest', 'warlock', 'druid', 'hunter']], ['vagash_claw', ['rogue', 'warrior', 'paladin', 'hunter']]].forEach(([k, cl]) => cl.forEach((cls, i) =>
  dmLooks.push([k, write(`gear_w_${k}_${cls}`, ART.hero({ cls, race: RC[i % 3], skin: i % 4, hair: (i + 1) % 5, gender: i % 2 ? 'f' : 'm', gear: { weapon: k } }))])));
['warrior', 'mage', 'hunter', 'rogue', 'priest', 'paladin'].forEach((cls, i) =>
  dmLooks.push(['icebeard_cloak', write(`gear_back_icebeard_cloak_${cls}`, ART.hero({ cls, race: RC[i % 3], skin: (i + 1) % 4, hair: i % 5, gender: i % 2 ? 'f' : 'm', gear: { back: 'icebeard_cloak' } }))]));
sheet('looks_dm', dmLooks, 128, 128, 5, '#8aa0b4');
sheet('looks_dm_110', dmLooks, 110, 110, 8, '#8aa0b4');
const dmIcons = DM.icons.map(k => icons.find(i => i[0] === k));
sheet('icons_dm', dmIcons, 64, 64, 3, '#000');
sheet('icons_dm_small', dmIcons, 48, 48, 3, '#000');
for (const f of fs.readdirSync(OUT)) if ((f.startsWith('race_') || f.startsWith('gear_w_griknir') || f.startsWith('gear_w_vagash') || f.startsWith('gear_back_icebeard')) && f.endsWith('.svg'))
  png(path.join(OUT, f), f.startsWith('race_portrait') ? 128 : 256);

// ---- v5: Teldrassil — night elf race, twilight scenes, mobs, looks, icons ----
const TE = {
  mobs: ['young_nightsaber', 'mangy_nightsaber', 'nightsaber', 'young_thistle_boar', 'thistle_boar', 'grell', 'vicious_grell', 'webwood_spider', 'githyiss', 'strigid_owl',
    'timberling', 'gnarlpine_ursa', 'gnarlpine_warrior', 'gnarlpine_shaman', 'oakenscowl', 'shadow_sprite', 'lord_melenas'],
  scenes: ['shadowglen', 'shadowthread_cave', 'dolanaar', 'lake_alameth', 'banethil_barrow', 'fel_rock', 'darnassus'],
  icons: ['moss', 'venom', 'feather', 'seed'],
  looks: { back: ['githyiss_shroud'], weapon: ['oakenscowl_staff', 'melenas_blade'] }
};
for (const k of ['mobs', 'scenes', 'icons']) { const have = new Set(ART.keys[k]); for (const key of TE[k]) if (!have.has(key)) problems.push(`missing ${k}: ${key}`); }
for (const slot in TE.looks) for (const k of TE.looks[slot]) if (!(L[slot] || []).includes(k)) problems.push(`missing look ${slot}: ${k}`);
// every night elf hero must stay inside the 128 frame vertically: no garbage race/skin/hair
for (const bad of [{ race: 'nightelf', skin: 9, hair: -2 }, { race: 'nightelf', cls: 'nope', gender: 'x' }, { race: 'nightelf', gear: 'str' }]) write('race_nightelf_bad_' + Math.random().toString(36).slice(2, 6), ART.hero(bad));
const NE = [];
for (const gender of ['m', 'f']) classes.forEach((cls, i) => {
  const o = { cls, race: 'nightelf', gender, skin: i % 4, hair: (i + (gender === 'f' ? 1 : 0)) % 5 };
  NE.push([`ne_${cls}_${gender}`, write(`race_nightelf_${cls}_${gender}`, ART.hero(o))]);
  write(`race_portrait_nightelf_${cls}_${gender}`, ART.portrait(o));
});
sheet('te_nightelf_110', NE, 110, 110, 8, '#6f7fa0');
const neVar = [];
for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) neVar.push([`ne${gender}${h}`, ART.hero({ cls: classes[(h * 3 + (gender === 'f' ? 1 : 0)) % 8], race: 'nightelf', gender, skin: h % 4, hair: h })]);
sheet('te_nightelf_variants', neVar, 200, 200, 5, '#6f7fa0');
const RC4 = ['human', 'dwarf', 'gnome', 'nightelf'];
const lineup = [];
for (const [cls, gender, sk, hr] of [['warrior', 'm', 1, 1], ['mage', 'f', 2, 3], ['druid', 'm', 0, 2], ['rogue', 'f', 3, 0]]) RC4.forEach(race => lineup.push([`${race}_${cls}`, ART.hero({ cls, race, gender, skin: sk, hair: hr })]));
sheet('te_race_lineup', lineup, 110, 110, 8, '#6f7fa0');
const lineScene = ['darnassus', 'dolanaar'].map((sc, j) => [sc, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(sc)).replace(/<\/svg>$/, '')}` +
  RC4.map((race, i) => `<svg x="${10 + i * 95}" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls: j ? 'hunter' : 'paladin', race, skin: 1, hair: i + 1, gender: j ? 'f' : 'm' }))}`).join('') + '</svg>']);
sheet('te_race_lineup_scene', lineScene, 400, 240, 2, '#000');
const NSETS = [['rogue', farm[0][1].gear], ['warrior', farm[2][1].gear], ['mage', { weapon: 'emberstone_staff', back: 'gnollhide_cloak', legs: 'smelting_pants' }], ['hunter', { weapon: 'militia_sword', ranged: 'militia_longbow' }],
  ['priest', { back: 'githyiss_shroud', weapon: 'cookies_rod' }], ['druid', { back: 'githyiss_shroud', weapon: 'oakenscowl_staff' }], ['rogue', { weapon: 'melenas_blade', back: 'githyiss_shroud', chest: 'defias_armor' }],
  ['warlock', { weapon: 'oakenscowl_staff', mask: 'defias', back: 'icebeard_cloak' }], ['paladin', { weapon: 'smites_hammer', back: 'garrick_cloak' }], ['warrior', { weapon: 'melenas_blade', back: 'githyiss_shroud', legs: 'defias_leggings' }],
  ['mage', { back: 'githyiss_shroud', weapon: 'griknir_staff', chest: 'corsair_shirt' }], ['hunter', { weapon: 'vagash_claw', back: 'cape_brotherhood', legs: 'pumpkin_trousers' }]];
const neGear = NSETS.map(([cls, gear], i) => [`negear_${i}`, write(`race_gear_nightelf_${i}`, ART.hero({ cls, race: 'nightelf', gender: i % 2 ? 'f' : 'm', skin: i % 4, hair: (i * 2) % 5, gear }))]);
sheet('te_nightelf_gear_110', neGear, 110, 110, 6, '#6f7fa0');
sheet('te_nightelf_gear', neGear, 200, 200, 6, '#6f7fa0');
const nePorts = [];
for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) nePorts.push([`nep${gender}${h}`, ART.portrait({ cls: classes[(h + (gender === 'f' ? 4 : 0)) % 8], race: 'nightelf', gender, skin: h % 4, hair: h })]);
NSETS.slice(0, 6).forEach(([cls, gear], i) => nePorts.push([`nepg${i}`, ART.portrait({ cls, race: 'nightelf', gender: i % 2 ? 'f' : 'm', skin: (i + 1) % 4, hair: i % 5, gear })]));
for (const race of RC4) nePorts.push([`pline_${race}`, ART.portrait({ cls: 'mage', race, gender: 'f', skin: 1, hair: 1 })]);
sheet('te_nightelf_portraits', nePorts, 64, 64, 10, '#333');
sheet('te_nightelf_portraits_big', nePorts, 128, 128, 10, '#333');
sheet('scenes_te', TE.scenes.map(k => [k, ART.scene(k)]), 400, 240, 2, '#000');
sheet('mobs_te', TE.mobs.map(k => [k, ART.mob(k)]), 128, 128, 6, '#6f7fa0');
sheet('mobs_te_110', TE.mobs.map(k => [k, ART.mob(k)]), 110, 110, 9, '#6f7fa0');
const tePairs = [['young_nightsaber', 'shadowglen', 'hunter', 'nightelf'], ['mangy_nightsaber', 'dolanaar', 'druid', 'nightelf'], ['nightsaber', 'lake_alameth', 'warrior', 'nightelf'],
  ['young_thistle_boar', 'shadowglen', 'rogue', 'nightelf'], ['thistle_boar', 'dolanaar', 'priest', 'nightelf'], ['grell', 'shadowglen', 'mage', 'human'], ['vicious_grell', 'fel_rock', 'warrior', 'nightelf'],
  ['webwood_spider', 'shadowthread_cave', 'hunter', 'dwarf'], ['githyiss', 'shadowthread_cave', 'druid', 'nightelf'], ['strigid_owl', 'lake_alameth', 'priest', 'gnome'], ['timberling', 'lake_alameth', 'paladin', 'nightelf'],
  ['gnarlpine_ursa', 'banethil_barrow', 'rogue', 'nightelf'], ['gnarlpine_warrior', 'banethil_barrow', 'warrior', 'dwarf'], ['gnarlpine_shaman', 'banethil_barrow', 'warlock', 'nightelf'],
  ['oakenscowl', 'banethil_barrow', 'druid', 'nightelf'], ['shadow_sprite', 'darnassus', 'mage', 'nightelf'], ['lord_melenas', 'fel_rock', 'paladin', 'nightelf']];
const teOn = tePairs.map(([m, sc, cls, race], i) => {
  const body = strip(ART.scene(sc)).replace(/<\/svg>$/, '') +
    `<svg x="30" y="110" width="120" height="120" viewBox="0 0 128 128">${strip(ART.hero({ cls, race, skin: i % 4, hair: i % 5, gender: i % 3 ? 'm' : 'f' }))}` +
    `<svg x="250" y="100" width="130" height="130" viewBox="0 0 128 128">${strip(ART.mob(m))}`;
  return [m, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${body}</svg>`];
});
sheet('mobs_te_onscene', teOn, 400, 240, 2, '#000');
const teLooks = [];
[['oakenscowl_staff', ['druid', 'mage', 'priest', 'warlock', 'hunter']], ['melenas_blade', ['rogue', 'warrior', 'paladin', 'hunter', 'mage']]].forEach(([k, cl]) => cl.forEach((cls, i) =>
  teLooks.push([k, write(`gear_w_${k}_${cls}`, ART.hero({ cls, race: RC4[i % 4], skin: i % 4, hair: (i + 1) % 5, gender: i % 2 ? 'f' : 'm', gear: { weapon: k } }))])));
['warrior', 'mage', 'hunter', 'rogue', 'priest', 'paladin', 'druid', 'warlock'].forEach((cls, i) =>
  teLooks.push(['githyiss_shroud', write(`gear_back_githyiss_shroud_${cls}`, ART.hero({ cls, race: RC4[i % 4], skin: (i + 1) % 4, hair: i % 5, gender: i % 2 ? 'f' : 'm', gear: { back: 'githyiss_shroud' } }))]));
sheet('looks_te', teLooks, 128, 128, 6, '#6f7fa0');
sheet('looks_te_110', teLooks, 110, 110, 9, '#6f7fa0');
sheet('looks_te_portraits', ['warrior', 'mage', 'druid', 'rogue'].map(cls => [cls, ART.portrait({ cls, race: 'nightelf', skin: 1, hair: 2, gender: 'f', gear: { back: 'githyiss_shroud', weapon: 'melenas_blade' } })]), 128, 128, 4, '#333');
const teIcons = TE.icons.map(k => icons.find(i => i[0] === k));
sheet('icons_te', teIcons, 64, 64, 4, '#000');
sheet('icons_te_small', teIcons, 48, 48, 4, '#000');
sheet('icons_te_big', teIcons, 128, 128, 4, '#000');
for (const f of fs.readdirSync(OUT)) if ((f.startsWith('race_nightelf') || f.startsWith('race_portrait_nightelf') || f.startsWith('race_gear_nightelf') || f.startsWith('gear_w_oakenscowl') || f.startsWith('gear_w_melenas') || f.startsWith('gear_back_githyiss')) && f.endsWith('.svg'))
  png(path.join(OUT, f), f.startsWith('race_portrait') ? 128 : 256);

// ---- v6 (v18): orc + troll races, shaman class, shaman icons, Durotar looks ----
const V6 = {
  icons: ['lightning_bolt', 'rockbiter_weapon', 'healing_wave', 'earth_shock', 'stoneskin_totem', 'lightning_shield', 'searing_totem', 'cactus_apple', 'tusk', 'voodoo_doll', 'scorpid_stinger', 'lizard_horn'],
  looks: { back: ['burning_blade_cloak', 'subterranean_cape'], weapon: ['zalazane_staff', 'benedict_cutlass', 'cursed_felblade'] }
};
{ const have = new Set(ART.keys.icons); for (const k of V6.icons) if (!have.has(k)) problems.push('missing icons: ' + k); }
for (const slot in V6.looks) for (const k of V6.looks[slot]) if (!(L[slot] || []).includes(k)) problems.push(`missing look ${slot}: ${k}`);
if (!(ART.keys.classes || []).includes('shaman')) problems.push('keys.classes lacks shaman');
const CL9 = classes.concat(['shaman']);
const RC6 = ['human', 'dwarf', 'gnome', 'nightelf', 'orc', 'troll'];
for (const bad of [{ race: 'orc', skin: 9, hair: -2 }, { race: 'troll', cls: 'nope', gender: 'x' }, { race: 'troll', gear: 'str' }, { race: 'orc', cls: 'shaman', gear: { weapon: 'nope', back: 7 } }, { cls: 'shaman', race: 'troll', skin: 'a', hair: null }])
  write('v18_bad_' + Math.random().toString(36).slice(2, 6), ART.hero(bad)), write('v18_badp_' + Math.random().toString(36).slice(2, 6), ART.portrait(bad));
const OT = [];
for (const race of ['orc', 'troll']) for (const gender of ['m', 'f']) CL9.forEach((cls, i) => {
  const o = { cls, race, gender, skin: i % 4, hair: (i + (gender === 'f' ? 1 : 0)) % 5 };
  OT.push([`${race}_${cls}_${gender}`, write(`v18_${race}_${cls}_${gender}`, ART.hero(o))]);
  write(`v18_portrait_${race}_${cls}_${gender}`, ART.portrait(o));
});
sheet('v18_orc_troll_110', OT, 110, 110, 9, '#b08a5a');
sheet('v18_orc_troll_200', OT, 200, 200, 9, '#b08a5a');
const otVar = [];
for (const race of ['orc', 'troll']) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) otVar.push([`${race}${gender}${h}`, ART.hero({ cls: CL9[(h * 2 + (gender === 'f' ? 1 : 0)) % 9], race, gender, skin: h % 4, hair: h })]);
sheet('v18_orc_troll_variants', otVar, 200, 200, 5, '#b08a5a');
const lineup6 = [];
for (const [cls, gender, sk, hr] of [['warrior', 'm', 1, 1], ['mage', 'f', 2, 3], ['shaman', 'm', 0, 2]]) RC6.forEach(race => lineup6.push([`${race}_${cls}`, ART.hero({ cls, race, gender, skin: sk, hair: hr })]));
sheet('v18_race_lineup', lineup6, 110, 110, 6, '#b08a5a');
sheet('v18_race_lineup_big', lineup6, 200, 200, 6, '#b08a5a');
const sham = [];
for (const gender of ['m', 'f']) RC6.forEach((race, i) => sham.push([`sham_${race}_${gender}`, write(`v18_shaman_${race}_${gender}`, ART.hero({ cls: 'shaman', race, gender, skin: (i + (gender === 'f' ? 2 : 0)) % 4, hair: (i + (gender === 'f' ? 1 : 3)) % 5 }))]));
sheet('v18_shaman_races', sham, 200, 200, 6, '#b08a5a');
sheet('v18_shaman_races_110', sham, 110, 110, 6, '#b08a5a');
// shaman next to druid and warrior (must read differently)
const cmp = [];
for (const race of ['human', 'orc', 'troll']) for (const cls of ['shaman', 'druid', 'warrior', 'hunter']) cmp.push([`${race}_${cls}`, ART.hero({ cls, race, gender: 'm', skin: 1, hair: 1 })]);
sheet('v18_shaman_vs', cmp, 110, 110, 4, '#b08a5a');
const OSETS = [['warrior', { weapon: 'cruel_barb', back: 'burning_blade_cloak', legs: 'smelting_pants' }], ['rogue', farm[0][1].gear], ['shaman', { weapon: 'militia_hammer', back: 'subterranean_cape' }],
  ['warlock', { weapon: 'zalazane_staff', back: 'burning_blade_cloak', mask: 'defias' }], ['hunter', { weapon: 'benedict_cutlass', ranged: 'militia_longbow', back: 'gnollhide_cloak' }], ['paladin', { weapon: 'smites_hammer', back: 'garrick_cloak', chest: 'corsair_shirt' }],
  ['mage', { weapon: 'emberstone_staff', back: 'subterranean_cape', legs: 'pumpkin_trousers' }], ['rogue', { weapon: 'cursed_felblade', back: 'burning_blade_cloak', chest: 'defias_armor' }], ['priest', { weapon: 'zalazane_staff', back: 'githyiss_shroud' }],
  ['druid', { weapon: 'oakenscowl_staff', back: 'icebeard_cloak' }], ['shaman', { weapon: 'cursed_felblade', back: 'burning_blade_cloak', chest: 'defias_armor' }], ['warrior', { weapon: 'benedict_cutlass', back: 'subterranean_cape', mask: 'defias' }]];
const otGear = [];
for (const race of ['orc', 'troll']) OSETS.forEach(([cls, gear], i) => otGear.push([`${race}gear${i}`, write(`v18_gear_${race}_${i}`, ART.hero({ cls, race, gender: i % 2 ? 'f' : 'm', skin: i % 4, hair: (i * 2) % 5, gear }))]));
sheet('v18_orc_troll_gear_110', otGear, 110, 110, 12, '#b08a5a');
sheet('v18_orc_troll_gear', otGear, 200, 200, 6, '#b08a5a');
const otP = [];
for (const race of ['orc', 'troll']) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) otP.push([`p${race}${gender}${h}`, ART.portrait({ cls: CL9[(h + (gender === 'f' ? 4 : 0)) % 9], race, gender, skin: h % 4, hair: h })]);
RC6.forEach(race => otP.push([`pshaman_${race}`, ART.portrait({ cls: 'shaman', race, gender: 'm', skin: 1, hair: 2 })]));
RC6.forEach(race => otP.push([`pshamanf_${race}`, ART.portrait({ cls: 'shaman', race, gender: 'f', skin: 2, hair: 1 })]));
OSETS.slice(0, 8).forEach(([cls, gear], i) => otP.push([`pg${i}`, ART.portrait({ cls, race: i % 2 ? 'troll' : 'orc', gender: i % 3 ? 'm' : 'f', skin: (i + 1) % 4, hair: i % 5, gear })]));
sheet('v18_portraits', otP, 64, 64, 10, '#333');
sheet('v18_portraits_big', otP, 128, 128, 10, '#333');
const v6Icons = V6.icons.map(k => icons.find(i => i[0] === k));
sheet('v18_icons', v6Icons, 64, 64, 6, '#000');
sheet('v18_icons_small', v6Icons, 48, 48, 6, '#000');
sheet('v18_icons_big', v6Icons, 128, 128, 6, '#000');
const v6Looks = [];
[['zalazane_staff', ['shaman', 'mage', 'priest', 'warlock', 'druid', 'hunter']], ['benedict_cutlass', ['rogue', 'warrior', 'paladin', 'hunter', 'shaman', 'mage']], ['cursed_felblade', ['warrior', 'rogue', 'paladin', 'warlock', 'shaman', 'hunter']]].forEach(([k, cl]) => cl.forEach((cls, i) =>
  v6Looks.push([k, write(`v18_look_${k}_${cls}`, ART.hero({ cls, race: RC6[(i + 2) % 6], skin: i % 4, hair: (i + 1) % 5, gender: i % 2 ? 'f' : 'm', gear: { weapon: k } }))])));
for (const k of V6.looks.back) ['warrior', 'mage', 'hunter', 'rogue', 'shaman', 'priest'].forEach((cls, i) =>
  v6Looks.push([k, write(`v18_look_${k}_${cls}`, ART.hero({ cls, race: RC6[(i + 3) % 6], skin: (i + 1) % 4, hair: i % 5, gender: i % 2 ? 'f' : 'm', gear: { back: k } }))]));
sheet('v18_looks_110', v6Looks, 110, 110, 6, '#b08a5a');
sheet('v18_looks', v6Looks, 200, 200, 6, '#b08a5a');
// on a scene, for scale: all six races as shamans
const v6Scene = ['northshire_abbey', 'ironforge'].map((sc, j) => [sc, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(sc)).replace(/<\/svg>$/, '')}` +
  RC6.map((race, i) => `<svg x="${-6 + i * 64}" y="116" width="116" height="116" viewBox="0 0 128 128">${strip(ART.hero({ cls: j ? 'warrior' : 'shaman', race, skin: 1, hair: i % 5, gender: j ? 'f' : 'm' }))}`).join('') + '</svg>']);
sheet('v18_lineup_scene', v6Scene, 400, 240, 1, '#000');

// ---- v7 (v19): tauren + undead races, racial icons, Mulgore / Tirisfal looks ----
const V7 = {
  icons: ['war_stomp', 'will_forsaken', 'cannibalize', 'plainstrider_beak', 'quilboar_tusk', 'bat_wing', 'zombie_brain', 'scarlet_armband'],
  looks: { weapon: ['snagglespear_pike', 'arrachea_totem', 'maggot_eye_axe'], back: ['mazzranache_cloak', 'perrine_cape'] }
};
{ const have = new Set(ART.keys.icons); for (const k of V7.icons) if (!have.has(k)) problems.push('missing icons: ' + k); }
for (const slot in V7.looks) for (const k of V7.looks[slot]) if (!(L[slot] || []).includes(k)) problems.push(`missing look ${slot}: ${k}`);
const RC8 = RC6.concat(['tauren', 'undead']);
for (const bad of [{ race: 'tauren', skin: 9, hair: -2 }, { race: 'undead', cls: 'nope', gender: 'x' }, { race: 'tauren', gear: 'str' }, { race: 'undead', cls: 'shaman', gear: { weapon: 'nope', back: 7 } }, { cls: 'druid', race: 'tauren', skin: 'a', hair: null }, { race: 'undead', cowl: 'hood', cls: 'warlock' }])
  write('v19_bad_' + Math.random().toString(36).slice(2, 6), ART.hero(bad)), write('v19_badp_' + Math.random().toString(36).slice(2, 6), ART.portrait(bad));
const TU = [];
for (const race of ['tauren', 'undead']) for (const gender of ['m', 'f']) CL9.forEach((cls, i) => {
  const o = { cls, race, gender, skin: i % 4, hair: (i + (gender === 'f' ? 1 : 0)) % 5 };
  TU.push([`${race}_${cls}_${gender}`, write(`v19_${race}_${cls}_${gender}`, ART.hero(o))]);
  write(`v19_portrait_${race}_${cls}_${gender}`, ART.portrait(o));
});
sheet('v19_tauren_undead_110', TU, 110, 110, 9, '#9a8a6a');
sheet('v19_tauren_undead_200', TU, 200, 200, 9, '#9a8a6a');
const tuVar = [];
for (const race of ['tauren', 'undead']) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) tuVar.push([`${race}${gender}${h}`, ART.hero({ cls: CL9[(h * 2 + (gender === 'f' ? 1 : 0)) % 9], race, gender, skin: h % 4, hair: h })]);
sheet('v19_tauren_undead_variants', tuVar, 200, 200, 5, '#9a8a6a');
const lineup8 = [];
for (const [cls, gender, sk, hr] of [['warrior', 'm', 1, 1], ['mage', 'f', 2, 3], ['shaman', 'm', 0, 2]]) RC8.forEach(race => lineup8.push([`${race}_${cls}`, ART.hero({ cls, race, gender, skin: sk, hair: hr })]));
sheet('v19_race_lineup', lineup8, 110, 110, 8, '#9a8a6a');
sheet('v19_race_lineup_big', lineup8, 200, 200, 8, '#9a8a6a');
const TSETS = [['warrior', { weapon: 'arrachea_totem', back: 'mazzranache_cloak', legs: 'smelting_pants' }], ['shaman', { weapon: 'arrachea_totem', back: 'mazzranache_cloak' }], ['hunter', { weapon: 'snagglespear_pike', ranged: 'militia_longbow', back: 'gnollhide_cloak' }],
  ['druid', { weapon: 'snagglespear_pike', back: 'mazzranache_cloak' }], ['rogue', { weapon: 'maggot_eye_axe', back: 'perrine_cape', chest: 'defias_armor', mask: 'defias' }], ['paladin', { weapon: 'arrachea_totem', back: 'perrine_cape' }],
  ['mage', { weapon: 'snagglespear_pike', back: 'perrine_cape', legs: 'pumpkin_trousers' }], ['warlock', { weapon: 'zalazane_staff', back: 'burning_blade_cloak', mask: 'defias' }], ['priest', { weapon: 'cookies_rod', back: 'perrine_cape' }],
  ['warrior', { weapon: 'maggot_eye_axe', back: 'perrine_cape', chest: 'corsair_shirt' }], ['shaman', { weapon: 'cursed_felblade', back: 'subterranean_cape' }], ['rogue', farm[0][1].gear]];
const tuGear = [];
for (const race of ['tauren', 'undead']) TSETS.forEach(([cls, gear], i) => tuGear.push([`${race}gear${i}`, write(`v19_gear_${race}_${i}`, ART.hero({ cls, race, gender: i % 2 ? 'f' : 'm', skin: i % 4, hair: (i * 2) % 5, gear }))]));
sheet('v19_tauren_undead_gear_110', tuGear, 110, 110, 12, '#9a8a6a');
sheet('v19_tauren_undead_gear', tuGear, 200, 200, 6, '#9a8a6a');
const tuP = [];
for (const race of ['tauren', 'undead']) for (const gender of ['m', 'f']) for (let h = 0; h < 5; h++) tuP.push([`p${race}${gender}${h}`, ART.portrait({ cls: CL9[(h + (gender === 'f' ? 4 : 0)) % 9], race, gender, skin: h % 4, hair: h })]);
RC8.forEach(race => tuP.push([`pwar_${race}`, ART.portrait({ cls: 'warrior', race, gender: 'm', skin: 1, hair: 2 })]));
TSETS.slice(0, 10).forEach(([cls, gear], i) => tuP.push([`pg${i}`, ART.portrait({ cls, race: i % 2 ? 'undead' : 'tauren', gender: i % 3 ? 'm' : 'f', skin: (i + 1) % 4, hair: i % 5, gear })]));
sheet('v19_portraits', tuP, 64, 64, 10, '#333');
sheet('v19_portraits_big', tuP, 128, 128, 10, '#333');
const v7Icons = V7.icons.map(k => icons.find(i => i[0] === k));
sheet('v19_icons', v7Icons, 64, 64, 8, '#000');
sheet('v19_icons_small', v7Icons, 48, 48, 8, '#000');
sheet('v19_icons_big', v7Icons, 128, 128, 8, '#000');
const v7Looks = [];
[['snagglespear_pike', ['warrior', 'shaman', 'druid', 'mage', 'hunter', 'priest']], ['arrachea_totem', ['shaman', 'warrior', 'paladin', 'druid', 'rogue', 'priest']], ['maggot_eye_axe', ['warrior', 'rogue', 'shaman', 'paladin', 'hunter', 'warlock']]].forEach(([k, cl]) => cl.forEach((cls, i) =>
  v7Looks.push([k, write(`v19_look_${k}_${cls}`, ART.hero({ cls, race: RC8[(i + 5) % 8], skin: i % 4, hair: (i + 1) % 5, gender: i % 2 ? 'f' : 'm', gear: { weapon: k } }))])));
for (const k of V7.looks.back) ['warrior', 'mage', 'hunter', 'rogue', 'shaman', 'priest'].forEach((cls, i) =>
  v7Looks.push([k, write(`v19_look_${k}_${cls}`, ART.hero({ cls, race: RC8[(i + 6) % 8], skin: (i + 1) % 4, hair: i % 5, gender: i % 2 ? 'f' : 'm', gear: { back: k } }))]));
sheet('v19_looks_110', v7Looks, 110, 110, 6, '#9a8a6a');
sheet('v19_looks', v7Looks, 200, 200, 6, '#9a8a6a');
const v7Scene = ['northshire_abbey', 'ironforge'].map((sc, j) => [sc, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">${strip(ART.scene(sc)).replace(/<\/svg>$/, '')}` +
  RC8.map((race, i) => `<svg x="${-10 + i * 46}" y="124" width="104" height="104" viewBox="0 0 128 128">${strip(ART.hero({ cls: j ? 'warrior' : 'shaman', race, skin: 1, hair: i % 5, gender: j ? 'f' : 'm' }))}`).join('') + '</svg>']);
sheet('v19_lineup_scene', v7Scene, 400, 240, 1, '#000');

const size = fs.statSync(path.join(ROOT, 'src/art.js')).size;
console.log(`mobs ${mobs.length}, scenes ${scenes.length}, icons ${icons.length}, heroes ${heroes.length}, pets ${pets.length}; art.js ${size} bytes`);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');
