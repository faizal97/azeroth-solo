// Professions end to end: train, gather nodes in the wild, smelt, craft, skin beasts, drink potions, equip a bag,
// and post trade goods on the auction house. Prints skill gained per real hour of gathering so the pace can be judged.
// seeded (as sim/brawl.js): the pace checks pass or fail on the code, not on luck
{ let s = 0x5eed1e55 >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let t = Date.now(); Date.now = () => t;
const tick = (secs, step = 1) => { for (let i = 0; i < secs / step; i++) { G.update(step); t += step * 1000; } };
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };

function gatherHour(place, level, prof, startSkill) {
  G.newGame({ name: 'T', cls: 'warrior', race: 'human' });
  const S = G.S, P = S.player; P.level = level; P.money = 1e6; P.place = place; S.flags.warModeAsked = true;
  G.trainProf(prof); if (level >= 10) { G.profs()[prof].skill = Math.max(50, startSkill); G.trainProf(prof); }
  G.profs()[prof].skill = startSkill;
  let gathered = 0; const t0 = t;
  while (t - t0 < 3600e3) {
    const nodes = G.placeNodes().filter((n) => G.skillColor(G.profs()[prof].skill, G.nodeSk(n.N)) >= 0);
    if (nodes.length && !P.casting) { G.gatherNode(nodes[0].i); tick(3); gathered++; } else tick(5);
    P.bags = P.bags.filter((b) => b.item.slot !== 'mat' || b.n < 20); // keep room
  }
  return { gathered, skill: G.profs()[prof].skill };
}
for (const [place, lvl, prof, sk] of [['crystal_lake', 8, 'mining', 1], ['crystal_lake', 8, 'herbalism', 1], ['the_longshore', 14, 'mining', 70], ['moonbrook', 18, 'herbalism', 100]]) {
  const r = gatherHour(place, lvl, prof, sk);
  console.log(`${prof.padEnd(10)} at ${place.padEnd(14)} (lvl ${lvl}) from ${sk}: ${r.gathered} nodes/hour → skill ${r.skill}`);
  ok(r.gathered >= 20, prof + ' too few nodes at ' + place);
}

// crafting chain: smelt copper, make bracers, learn a rare plan, use items
G.newGame({ name: 'T', cls: 'warrior', race: 'human' });
{
  const S = G.S, P = S.player; P.level = 20; P.money = 1e6; S.flags.warModeAsked = true; P.place = 'stormwind';
  G.trainProf('mining'); G.trainProf('blacksmithing'); G.trainProf('alchemy');
  ok(Object.keys(G.profs()).length === 2, 'third profession must be refused');
  G.addItem(G.copyItem('copper_ore'), 20);
  G.craft('smelt_copper', 20); tick(40, 0.5);
  ok(G.countItem('copper_bar') === 20, 'smelted 20 copper bars, got ' + G.countItem('copper_bar'));
  ok(G.profs().mining.skill > 15, 'mining skill from smelting ' + G.profs().mining.skill);
  G.craft('bs_copper_bracers', 3); tick(10, 0.5);
  ok(G.countItem('copper_bracers') === 3, 'bracers made ' + G.countItem('copper_bracers'));
  const bsSkill = G.profs().blacksmithing.skill; ok(bsSkill >= 3, 'bs skill ' + bsSkill);
  G.profs().blacksmithing.skill = 75; G.trainProf('blacksmithing'); G.profs().blacksmithing.skill = 145;
  G.addItem(G.copyItem('rc_bs_silvered_breastplate'), 1);
  G.useItem(P.bags.findIndex((b) => b.item.id === 'rc_bs_silvered_breastplate'));
  ok(G.recipesFor('blacksmithing').some((r) => r.id === 'bs_silvered_breastplate'), 'rare plan learned');
  G.addItem(G.copyItem('bronze_bar'), 10); G.addItem(G.copyItem('silver_bar'), 2);
  G.craft('bs_silvered_breastplate', 1); tick(3, 0.5);
  const bp = P.bags.find((b) => b.item.id === 'silvered_bronze_breastplate');
  ok(bp && bp.item.q === 3 && bp.item.crafter === 'T', 'breastplate crafted');
  // sharpening stone raises weapon damage
  const w0 = G.stats().wMin; G.addItem(G.copyItem('rough_sharpening_stone'), 1); G.useItem(P.bags.findIndex((b) => b.item.id === 'rough_sharpening_stone'));
  ok(G.stats().wMin === w0 + 2, 'stone +2 weapon dmg');
  // elixir
  const s0 = G.stats().str; G.addItem(G.copyItem('elixir_lions_strength'), 1); G.useItem(P.bags.findIndex((b) => b.item.id === 'elixir_lions_strength'));
  ok(G.stats().str === s0 + 4, 'elixir +4 str');
  // armour kit on the chest
  G.equip(P.bags.findIndex((b) => b.item.id === 'silvered_bronze_breastplate'));
  const a0 = P.equip.chest.armor; G.addItem(G.copyItem('medium_armor_kit'), 2); G.useItem(P.bags.findIndex((b) => b.item.id === 'medium_armor_kit'));
  ok(P.equip.chest.armor === a0 + 16, 'kit +16 armor on chest');
  // bags
  const cap0 = G.bagCap(); G.addItem(G.copyItem('woolen_bag'), 1); G.useItem(P.bags.findIndex((b) => b.item.id === 'woolen_bag'));
  ok(G.bagCap() === cap0 + 8, 'woolen bag +8');
  // potions in combat
  G.addItem(G.copyItem('healing_potion'), 3);
  P.place = 'moonbrook'; G.placeMobs(); tick(2);
  const m = G.placeMobs().find((x) => x.state === 'alive'); G.engage(m.id); tick(2, 0.1);
  if (G.fight) { G.pUnit.hp = 50; G.usePotion('heal'); ok(G.pUnit.hp > 300, 'potion healed in combat ' + G.pUnit.hp); G.usePotion('heal'); ok(G.countItem('healing_potion') === 2, 'cooldown blocks a second potion'); }
  else ok(false, 'no fight started');
  while (G.fight) tick(0.5, 0.1);
  // auction trade goods
  G.addItem(G.copyItem('copper_bar'), 1); P.place = 'stormwind_bank';
  const idx = P.bags.findIndex((b) => b.item.id === 'copper_bar'), n = P.bags[idx].n, v = G.ahValue(D.ITEMS.copper_bar) * n;
  G.ahPost(idx, v); ok(S.ah.mine.length === 1 && S.ah.mine[0].n === n, 'posted a stack of bars');
  const before = P.money; tick(3 * 3600, 30); ok(P.money > before, 'bar stack sold');
  ok(G.ahListings().some((l) => !D.GEAR_SLOTS.includes(l.item.slot)), 'bots list trade goods');
}
// skinning on world kills
G.newGame({ name: 'T', cls: 'warrior', race: 'human' });
{
  const S = G.S, P = S.player; P.level = 12; P.money = 1e6; S.flags.warModeAsked = true; P.equip = G.botChar({ name: 'x', cls: 'warrior', race: 'human', level: 12, skill: 0.6 }).equip; P.hp = null;
  G.trainProf('skinning'); G.profs().skinning.skill = 50; G.trainProf('skinning');
  P.place = 'the_longshore';
  for (let k = 0; k < 30; k++) {
    const m = G.placeMobs().find((x) => x.state === 'alive' && D.MOBS[x.key].family === 'beast'); if (!m) { tick(10); continue; }
    G.engage(m.id); G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.7, react: 0.5 }; G.pUnit.role = 'dps';
    while (G.fight) tick(0.5, 0.1);
    P.hp = null; tick(2);
  }
  console.log(`skinning: 30 beast fights → ${G.countItem('light_leather')} light leather, skill ${G.profs().skinning.skill}`);
  ok(G.countItem('light_leather') > 5, 'skinning yields leather');
}
// ---- Expert (v10.9, docs/plans/2026-10-02-professions-expert.md)
// the rank: from level 30 with 125 skill, up to 225
{
  G.newGame({ name: 'E', cls: 'warrior', race: 'human' }); const P = G.S.player; P.money = 1e7; P.level = 30;
  G.trainProf('mining'); G.profs().mining.skill = 50; G.trainProf('mining'); G.profs().mining.skill = 150; G.trainProf('mining');
  ok(G.profs().mining.max === 225, 'a level-30 miner with 150 skill trains Expert (225)');
  G.newGame({ name: 'E2', cls: 'warrior', race: 'human' }); const Q = G.S.player; Q.level = 29; Q.money = 1e7;
  G.trainProf('mining'); G.profs().mining.skill = 150; G.profs().mining.max = 150; G.trainProf('mining');
  ok(G.profs().mining.max === 150, 'Expert waits for level 30');
}
// ore, herbs, leather and silk by level
{
  const has = (L, kind, k) => D.nodeTable(L)[kind].some((x) => x[0] === k && x[1] > 0);
  const w = (L, kind, k) => (D.nodeTable(L)[kind].find((x) => x[0] === k) || [0, 0])[1];
  ok(w(27, 'ore', 'iron') >= 6 && w(24, 'ore', 'iron') <= 1 && !has(18, 'ore', 'iron'), 'iron veins from level 26 (a few from 22)');
  ok(has(36, 'ore', 'embersilver') && has(31, 'ore', 'gold'), 'embersilver from 35, gold from 30');
  ok(has(41, 'herb', 'rimeleaf') && has(33, 'herb', 'dimleaf') && has(29, 'herb', 'redmantle'), 'the Expert herbs grow by level');
  ok(D.skinLeather(32) === 'heavy_leather' && D.skinLeather(42) === 'thick_leather' && D.skinLeather(24) === 'medium_leather', 'leather by the beast level');
  G.newGame({ name: 'L', cls: 'warrior', race: 'human' }); const hum = Object.keys(D.MOBS).find((k) => D.MOBS[k].family === 'humanoid' && !D.MOBS[k].boss);
  let silk = 0, wool = 0; for (let i = 0; i < 300; i++) for (const it of G.rollLoot(hum, 32).items) { if (it.id === 'silk_cloth') silk++; if (it.id === 'wool_cloth') wool++; }
  ok(silk > 40 && wool === 0, `level-32 humanoids drop silk, not wool (${silk} silk in 300)`);
}
// recipes: every Expert recipe's item and materials exist; a smith smelts steel and forges a Steel Longsword
{
  const R = Object.values(D.RECIPES).filter((r) => r.sk[0] >= 125);
  ok(R.length >= 40 && R.every((r) => D.ITEMS[r.makes] && Object.keys(r.mats).every((m) => D.ITEMS[m])), `${R.length} Expert recipes, every item and material exists`);
  ok(['blacksmithing', 'alchemy', 'leatherworking', 'tailoring'].every((p) => R.filter((r) => r.prof === p && r.rare && r.sk[0] >= 150).length === 1), 'one rare Expert recipe per craft');
  G.newGame({ name: 'S', cls: 'warrior', race: 'human' }); const P = G.S.player; P.level = 34; P.money = 1e7; G.S.flags.warModeAsked = true;
  for (const pr of ['mining', 'blacksmithing']) { G.trainProf(pr); G.profs()[pr].skill = 50; G.trainProf(pr); G.profs()[pr].skill = 150; G.trainProf(pr); G.profs()[pr].skill = 175; }
  G.addItem(G.copyItem('iron_ore'), 6); G.addItem(G.copyItem('smithing_coal'), 6); G.addItem(G.copyItem('heavy_stone'), 2);
  G.craft('smelt_iron', 6); tick(20); G.craft('smelt_steel', 6); tick(20);
  ok(G.countItem('steel_bar') === 6, `six iron ore and six coal make six steel bars (${G.countItem('steel_bar')})`);
  G.craft('bs_steel_longsword', 1); tick(3);
  ok(P.bags.some((b) => b.item.id === 'steel_longsword'), 'and a Steel Longsword');
}
// rare recipes drop for the level they come from
{
  const lvOf = (id) => D.ITEMS[D.RECIPES[D.ITEMS[id].teaches].makes].lvl;
  const at44 = new Set(), at22 = new Set(); for (let i = 0; i < 300; i++) { at44.add(G.pickRare(44)); at22.add(G.pickRare(22)); }
  ok([...at44].every((id) => lvOf(id) >= 36) && at44.size >= 3, `level 44 drops Expert rares (${[...at44].map(lvOf).join(',')})`);
  ok([...at22].every((id) => lvOf(id) <= 30), `level 22 drops Journeyman rares (${[...at22].map(lvOf).join(',')})`);
}
// the auction house trades Expert goods around level 38
{
  G.newGame({ name: 'A', cls: 'warrior', race: 'human' }); G.S.player.level = 38; G.S.flags.warModeAsked = true;
  const EX = new Set(['iron_ore', 'iron_bar', 'ironthistle', 'redmantle', 'heavy_leather', 'silk_cloth', 'greater_healing_potion', 'embersilver_ore', 'stoutroot', 'dimleaf', 'goldspur', 'thick_leather', 'silk_bolt', 'mana_potion']);
  let seen = 0; for (let i = 0; i < 5; i++) { seen += G.ahListings().filter((l) => EX.has(l.item.id)).length; tick(31 * 60, 60); }
  ok(seen > 0, `a level-38 player finds Expert goods at the auction house (${seen} listings over 5 refreshes)`);
}
// the Expert pace: a character levelling 25 -> 45 with a gathering and a crafting profession, an hour of play in each of
// four zone bands (gathering what is there, or skinning and looting what it kills), crafting from what it got and the
// vendor's supplies, best colour first. It should reach about 225 in both by level 45, with no grinding.
function expertPace(gather, craft) {
  G.newGame({ name: 'X', cls: 'warrior', race: 'human' }); const S = G.S, P = S.player; P.money = 1e8; S.flags.warModeAsked = true; P.level = 25;
  for (const pr of [gather, craft]) { G.trainProf(pr); G.profs()[pr].skill = 50; G.trainProf(pr); G.profs()[pr].skill = 150; }
  P.bagsEq = [0, 1, 2, 3].map(() => G.copyItem('woolen_bag')); // a levelling player carries bags, and sells what its professions do not use
  const BANDS = [[30, 'the_hushed_bank', 'dun_modr'], [31, 'lake_nazferiti', 'zuuldaia_ruins'], [34, 'balia_mah_ruins', 'venture_base_camp'], [36, 'highland_plains', 'drywhisker_gorge'], [38, 'thunderhowl_rise', 'stromgarde_keep'], [43, 'noxious_lair', 'lost_rigger_cove'], [45, 'frayfeather_highlands', 'zul_farrak_gate']];
  const used = new Set(Object.values(D.RECIPES).filter((r) => r.prof === gather || r.prof === craft).flatMap((r) => Object.keys(r.mats).concat(r.makes)));
  const room = () => { P.bags = P.bags.filter((b) => b.item.slot === 'mat' ? used.has(b.item.id) : !D.GEAR_SLOTS.concat(['potion', 'elixir', 'stone', 'kit', 'bag']).includes(b.item.slot)); };
  // smelt ore into bars first, then the craft, then whatever else the gathering skill makes (steel from spare iron)
  const craftAll = () => {
    // (a player smelts ore and weaves bolts even when the recipe is grey: the bars and bolts are what the craft needs)
    // and keeps a small stock of what the craft needs from the gathering skill (steel for a smith), grey or not
    const needs = new Set(Object.values(D.RECIPES).filter((r) => r.prof === craft).flatMap((r) => Object.keys(r.mats)));
    const stock = (r) => needs.has(r.makes) && G.countItem(r.makes) < 12;
    const stages = [[gather, (r) => Object.keys(r.mats).some((m) => /_ore$/.test(m)), true]];
    for (let i = 0; i < 25; i++) stages.push([gather, stock, true], [craft, () => true, false]); // make, craft, again until nothing is left to make
    stages.push([gather, () => true, false]);
    for (const [pr, only, grey] of stages) for (let guard = 0; guard < 400; guard++) {
      const p = G.profs()[pr]; if (!p) break;
      for (const v of ['smithing_coal', 'fine_thread', 'sturdy_vial', 'coarse_thread', 'empty_vial']) if (G.countItem(v) < 10) G.addItem(G.copyItem(v), 20);
      const r = G.recipesFor(pr).filter((x) => only(x) && G.craftable(x.id) > 0 && G.skillColor(p.skill, x.sk) >= 0 && (G.skillColor(p.skill, x.sk) < 3 || grey || (pr === craft && D.ITEMS[x.makes].slot === 'mat'))).sort((a, b) => G.skillColor(p.skill, a.sk) - G.skillColor(p.skill, b.sk) || b.sk[0] - a.sk[0])[0];
      if (!r) break; G.craft(r.id, 1); tick(3); room();
    }
  };
  for (const [L, wild, hum] of BANDS) {
    P.level = L; if (L >= 30) for (const pr of [gather, craft]) if (G.profs()[pr].max < 225) G.trainProf(pr);
    const t0 = t;
    if (gather === 'skinning' || craft === 'tailoring') { // an hour of fighting: beasts for leather, humanoids for cloth
      const want = (gather === 'skinning' ? [[wild, 'beast']] : []).concat(craft === 'tailoring' ? [[hum, 'humanoid']] : []);
      for (const [place, fam] of want) {
        const pl = D.PLACES[place], keys = pl.mobs.map((m) => m[0]).filter((k) => D.MOBS[k] && D.MOBS[k].family === fam);
        for (let k = 0; k < 90 / want.length && keys.length; k++) { const m = keys[k % keys.length]; for (const it of G.rollLoot(m, Math.round((pl.lvl[0] + pl.lvl[1]) / 2)).items) if (it.slot === 'mat') G.addItem(it, 1); }
      }
      t += 3600e3;
    }
    if (gather === 'mining' || gather === 'herbalism') {
      P.place = wild;
      while (t - t0 < 3600e3) {
        const nodes = G.placeNodes().filter((n) => n.N.prof === gather && G.skillColor(G.profs()[gather].skill, G.nodeSk(n.N)) >= 0);
        if (nodes.length && !P.casting) { G.gatherNode(nodes[0].i); tick(3); room(); } else tick(5);
      }
    }
    room(); craftAll();
    if (process.env.PDBG && craft === 'blacksmithing') { const p2 = G.profs()[craft]; console.log('   recipes', G.recipesFor(craft).filter((x) => x.sk[0] >= 150 || G.skillColor(p2.skill, x.sk) < 3).map((x) => `${x.id}:c${G.skillColor(p2.skill, x.sk)}:n${G.craftable(x.id)}`).join(' ')); }
    if (process.env.PDBG) console.log(`  L${L} ${gather} ${G.profs()[gather].skill} ${craft} ${G.profs()[craft].skill} · ${P.bags.filter((b) => b.item.slot === 'mat').map((b) => b.item.id + ' ' + b.n).join(', ')}`);
  }
  return [gather, craft].map((pr) => G.profs()[pr].skill);
}
for (const [g, c] of [['mining', 'blacksmithing'], ['herbalism', 'alchemy'], ['skinning', 'leatherworking'], ['skinning', 'tailoring']]) {
  const [gs, cs] = expertPace(g, c);
  console.log(`Expert pace, ${g} + ${c}: level 45 with ${g} ${gs}, ${c} ${cs}`);
  ok(gs >= 200 && cs >= 195, `${g} + ${c} reach Expert's top by level 45 (${gs}, ${cs})`);
}
console.log(fails ? `${fails} failures` : 'professions sim OK');
process.exit(fails ? 1 : 0);
