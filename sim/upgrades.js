// Gear upgrades (v10.3): Mentor Marks raise a level-57+ blue or purple item a 3% step at a time, up to the ceiling
// (docs/plans/2026-09-30-horizontal-progression-design.md). node sim/upgrades.js
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };
G.newGame({ name: 'U', cls: 'warrior', race: 'human' }); G.S.player.level = 60;
const U = D.UPGRADE, loot = (raid) => { const s = new Set(); for (const p of D.DUNGEONS[raid].pulls) for (const m of p.mobs) for (const i of (D.MOBS[m].loot || [])) s.add(i); return [...s].map(G.copyItem); };

// who can upgrade
const mc = loot('molten_core'), tc = loot('tidecrown_citadel'), strat = loot('stratholme');
const atCap = (it) => G.itemPoints(it) >= D.UPGRADE.cap[it.q] * G.upgradeRef(it);
ok(mc.every((it) => G.upgradeInfo(it).max > 0 || atCap(it)), 'every Magma Throne item has steps, unless it is already at the ceiling');
const steps = {}; for (const it of mc) { const m = G.upgradeInfo(it).max; steps[m] = (steps[m] || 0) + 1; }
console.log('Magma Throne steps to the ceiling (steps: items):', JSON.stringify(steps));
ok(G.upgradeInfo(G.genGear('chest', 60, 2)).max === 0, 'greens never upgrade');
ok(G.upgradeInfo(G.copyItem('worn_shortsword')).max === 0, 'low-level items never upgrade');
ok(G.upgradeInfo(G.makeHeirloom('heirloom_blade', 60)).max === 0, 'heirlooms never upgrade');

// the math: stepping to the top lands on the cap, never above it
for (const it of mc.concat(strat).filter((x) => G.upgradeInfo(x).max)) {
  const inf = G.upgradeInfo(it), top = G.upgradedCopy(it, inf.max), ref = G.upgradeRef(it);
  ok(Math.abs(G.itemPoints(top) - U.cap[it.q] * ref) <= 1.5, `${it.name} tops out at the cap (${G.itemPoints(top)} vs ${(U.cap[it.q] * ref).toFixed(1)})`);
  ok(G.upgradedCopy(it, inf.max + 3).stats && G.itemPoints(G.upgradedCopy(it, inf.max + 3)) === G.itemPoints(top), `${it.name} cannot pass the cap`);
  if (it.dmg) ok(top.dmg[1] > it.dmg[1], `${it.name} weapon damage rises too`);
}
ok(mc.every((it) => atCap(it) || (G.upgradeInfo(it).max >= 1 && G.upgradeInfo(it).max <= 6)), 'Magma Throne items take 1-6 steps (design: about 3-4)');

// the goal: a fully upgraded Magma Throne slot is within a few percent of Tidecrown's
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const mcTop = avg(mc.filter((it) => !atCap(it)).map((it) => G.itemPoints(G.upgradedCopy(it, G.upgradeInfo(it).max)) / G.upgradeRef(it)));
ok(mcTop >= 0.97, `upgraded Magma Throne reaches ${(mcTop * 100).toFixed(0)}% of the ceiling`);
const blueTop = avg(strat.filter((it) => it.q === 3).map((it) => G.itemPoints(G.upgradedCopy(it, G.upgradeInfo(it).max)) / G.upgradeRef(it)));
ok(blueTop <= 0.93, `upgraded blues stop lower (${(blueTop * 100).toFixed(0)}%)`);

// old saves: an item without it.up is untouched, and step 0 is the item itself
const sword = mc.find((it) => it.dmg && G.upgradeInfo(it).max); ok(JSON.stringify(G.upgradedCopy(sword, 0).stats) === JSON.stringify(sword.stats), 'step 0 changes nothing');

// spending: equipped and bag items, Marks taken, refused without enough Marks or in a fight
const P = G.S.player, a0 = G.account(); a0.marks = 100; G.saveAccount(a0);
P.equip.weapon = G.copyItem(sword.id); const before = P.equip.weapon.dmg[1];
ok(G.upgradeItem({ slot: 'weapon' }) === true && P.equip.weapon.up === 1 && P.equip.weapon.dmg[1] > before, 'equipped weapon goes up a step');
ok(G.account().marks === 100 - D.UPGRADE.cost(1), 'the step cost its Marks');
G.addItem(G.copyItem(mc.find((it) => !it.dmg).id), 1); const bi = P.bags.length - 1;
ok(G.upgradeItem({ bag: bi }) === true && P.bags[bi].item.up === 1, 'a bag item goes up a step');
const a1 = G.account(); a1.marks = 0; G.saveAccount(a1);
ok(G.upgradeItem({ slot: 'weapon' }) === false && P.equip.weapon.up === 1, 'no Marks, no step');
ok(G.upgradeItem({ slot: 'chest' }) === false || !P.equip.chest || !G.upgradeInfo(P.equip.chest).max, 'starting gear cannot be upgraded');
// a save round trip keeps the step
const saved = JSON.parse(JSON.stringify(P.equip.weapon)); ok(saved.up === 1 && saved.base && G.upgradeInfo(saved).up === 1, 'the step survives a save');
// income: a level-60 dungeon clear pays 5, a raid 15; levelling dungeons nothing
ok(G.clearMarks('stratholme') === 5 && G.clearMarks('molten_core') === 15, 'level-60 clears pay Marks');
ok(G.clearMarks('deadmines') === 0, 'levelling dungeons pay none');
ok(Math.ceil(D.UPGRADE.cost(1) / G.clearMarks('stratholme')) <= 5, 'the first step takes at most 5 dungeon runs');
console.log(`upgrades: ${n - bad}/${n} checks pass`);
process.exit(bad ? 1 : 0);
