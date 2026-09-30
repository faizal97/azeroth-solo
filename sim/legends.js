// Legends: Lyveus's questline is complete and in order, his story fight (lg_marrow) can be won with him in the group,
// and once unlocked he joins a normal dungeon run in the tank slot and uses his own abilities.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, E } = globalThis;
let t = Date.now(); Date.now = () => t;
let bad = 0; const fail = (m) => { console.log('FAIL ' + m); bad++; };
const chain = Object.keys(D.QUESTS).filter((q) => D.QUESTS[q].legend === 'lyveus');
console.log('lyveus quests:', chain.map((q) => `${q}@${D.QUESTS[q].lvl}`).join(' '));
for (const q of chain) for (const p of D.QUESTS[q].pre || []) if (!D.QUESTS[p]) fail(`${q} needs missing ${p}`);
function run(act, cls, setup) {
  G.newGame({ name: 'T', cls, race: 'orc' }); const S = G.S, P = S.player; P.level = 60;
  P.equip = G.botChar({ name: 'x', cls, race: 'orc', level: 60, skill: 0.6 }).equip; P.talents = G.autoTalents(cls, 'dps', 60, 0);
  S.flags.warModeAsked = true; if (setup) setup(P); P.place = D.ACTIVITIES[act].where;
  if (G.activityBlock(act)) { fail(`${act} blocked: ${G.activityBlock(act)}`); return null; }
  G.queueFor(act); G.acceptPop();
  const lyv = S.group.members.find((m) => m.legend === 'lyveus');
  let used = {}, g = 0;
  while (S.run && S.run.phase !== 'done' && g++ < 300000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.7, react: 0.5 }; G.pUnit.role = G.role(); }
    if (G.fight) for (const u of G.fight.allies) if (u.legend) for (const k in u.cds) used[k] = 1;
    for (const r of (S.run.rolls || [])) if (!r.done && r.player && r.choice == null) { try { G.roll(S.run.rolls.indexOf(r), 'greed'); } catch (e) {} }
    if (S.run && S.run.phase === 'rest' && S.run.restUntil <= t) { try { G.runPull(); } catch (e) {} }
    G.update(0.1); t += 100;
  }
  return { lyv: !!lyv, role: lyv && lyv.role, done: S.run && S.run.phase === 'done', wipes: S.run ? S.run.wipes : 99, used: Object.keys(used) };
}
// the story fight, while on the last quest (not unlocked yet)
for (const cls of ['mage', 'warrior', 'priest']) {
  const r = run('lg_marrow', cls, (P) => { for (const q of chain.slice(0, -1)) P.done[q] = true; P.quests.lg_lyv_oath = { prog: [0] }; });
  if (!r) continue; console.log(`lg_marrow as ${cls}: Lyveus ${r.lyv ? r.role : 'MISSING'} · done ${r.done} · wipes ${r.wipes} · used ${r.used.join(',')}`);
  if (!r.lyv || !r.done) fail('story fight');
}
// hidden when not on the quest
G.newGame({ name: 'T', cls: 'mage', race: 'human' }); G.S.player.level = 60; G.S.player.place = 'silverleaf_lodge';
if (G.activityBlock('lg_marrow') !== 'hidden') fail('lg_marrow should be hidden off-quest');
// unlocked: a cameo (forced here) joins a dungeon and uses his own abilities
G.CAMEO_CHANCE = 1;
for (const cls of ['mage', 'warrior']) {
  const r = run('stratholme', cls, (P) => { for (const q of chain) P.done[q] = true; });
  console.log(`stratholme as ${cls}: Lyveus ${r.lyv ? r.role : 'MISSING'} · done ${r.done} · wipes ${r.wipes} · used ${r.used.join(',')}`);
  if (!r.lyv || !r.done || !r.used.includes('oathbound_strike')) fail('dungeon join');
}
// switched off: does not join
{ const r = run('stratholme', 'mage', (P) => { for (const q of chain) P.done[q] = true; P.legendOff = { lyveus: true }; }); if (r.lyv) fail('joined while off'); }
// story heroes (v10.2): no standard slot. About 1 run in 5 when a cameo is due, then none for 3 days.
G.CAMEO_CHANCE = 0.2;
{
  G.newGame({ name: 'T', cls: 'mage', race: 'human' }); const S = G.S, P = S.player; P.level = 60; S.flags.warModeAsked = true;
  for (const q of chain) P.done[q] = true;
  const joinsIn = (runs, gap) => { let n = 0; for (let i = 0; i < runs; i++) { if (gap != null) t += gap; if (G.rollCameo(D.ACTIVITIES.stratholme)) n++; } return n; };
  const due = joinsIn(2000, G.CAMEO_GAP);
  console.log(`cameo: ${due} of 2000 runs when due (about 1 in 5), `);
  if (due < 330 || due > 470) fail('cameo chance is not about 1 in 5');
  P.legendMem = {}; t += G.CAMEO_GAP;
  let first = 0; while (!G.rollCameo(D.ACTIVITIES.stratholme) && first < 200) first++;
  const soon = joinsIn(300, 10 * 60 * 1000); // runs every 10 minutes for the next 50 hours
  console.log(`cameo: then ${soon} more in the next 50 hours (the gap is 3 days)`);
  if (soon !== 0) fail('a second cameo inside 3 days');
  t += G.CAMEO_GAP; P.legendOff = { lyveus: true };
  if (joinsIn(200, 0)) fail('a cameo while switched off');
  // a cameo run is remembered for the Hero screen
  P.legendOff = {}; P.legendMem = {}; G.CAMEO_CHANCE = 1;
  const r = run('stratholme', 'mage', (Pp) => { for (const q of chain) Pp.done[q] = true; });
  const mem = G.legendMemory('lyveus');
  console.log(`cameo memory: fought beside you ${mem.n} time(s), last in ${mem.where}`);
  if (!r.lyv || mem.n !== 1 || !mem.where) fail('cameo memory');
  G.CAMEO_CHANCE = 0.2;
}
// the title comes from finishing his story
{ const T = D.TITLES.find((x) => x.id === 'oathkeeper'); G.newGame({ name: 'T', cls: 'mage', race: 'human' }); if (G.titleUnlocked(T)) fail('title before the story'); G.S.player.done.lg_lyv_oath = true; if (!G.titleUnlocked(T)) fail('title after the story'); }
// the hooded wanderer: steps into hard solo fights from level 15, at most 3 times per zone, never after the lodge
{
  G.newGame({ name: 'T', cls: 'mage', race: 'human' }); const S = G.S, P = S.player; P.level = 18; S.flags.warModeAsked = true; P.place = 'moonbrook';
  G.WANDERER_GAP = 0; let joins = 0, fights = 0;
  for (let f = 0; f < 60; f++) {
    P.hp = null; P.res = null; S.mobs = null;
    const m = G.placeMobs().find((x) => x.state === 'alive'); if (!m) { t += 600000; continue; }
    G.engage(m.id); if (!G.fight) continue; fights++;
    G.fight.units[G.pUnit.uid].hp = Math.round(G.fight.units[G.pUnit.uid].maxHp * 0.5); // make it a hard fight
    let g = 0; while (G.fight && g++ < 3000) { if (G.fight.wanderer && !G.fight.counted) { G.fight.counted = true; joins++; } G.update(0.1); t += 100; }
    t += 120000; P.ghostUntil = 0; P.hp = null;
  }
  console.log(`wanderer: joined ${joins} of ${fights} hard fights in Moonbrook (cap 3)`);
  if (joins < 1 || joins > 3) fail('wanderer join count');
  P.done.lg_lyv_ashes = true; G.fight = null; P.place = 'the_dead_acre'; let after = 0;
  for (let f = 0; f < 20; f++) { S.mobs = null; const m = G.placeMobs().find((x) => x.state === 'alive'); if (!m) continue; G.engage(m.id); if (!G.fight) continue; G.fight.units[G.pUnit.uid].hp = 10; let g = 0; while (G.fight && g++ < 3000) { if (G.fight.wanderer) after++; G.update(0.1); t += 100; } P.ghostUntil = 0; P.hp = null; t += 120000; }
  if (after) fail('wanderer appeared after the lodge');
}
console.log(bad ? `${bad} problem(s)` : 'legends sim OK');
process.exitCode = bad ? 1 : 0;
