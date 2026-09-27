// Professions end to end: train, gather nodes in the wild, smelt, craft, skin beasts, drink potions, equip a bag,
// and post trade goods on the auction house. Prints skill gained per real hour of gathering so the pace can be judged.
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
console.log(fails ? `${fails} failures` : 'professions sim OK');
process.exit(fails ? 1 : 0);
