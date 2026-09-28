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
// unlocked: joins a dungeon
for (const cls of ['mage', 'warrior']) {
  const r = run('stratholme', cls, (P) => { for (const q of chain) P.done[q] = true; });
  console.log(`stratholme as ${cls}: Lyveus ${r.lyv ? r.role : 'MISSING'} · done ${r.done} · wipes ${r.wipes} · used ${r.used.join(',')}`);
  if (!r.lyv || !r.done || !r.used.includes('oathbound_strike')) fail('dungeon join');
}
// switched off: does not join
{ const r = run('stratholme', 'mage', (P) => { for (const q of chain) P.done[q] = true; P.legendOff = { lyveus: true }; }); if (r.lyv) fail('joined while off'); }
console.log(bad ? `${bad} problem(s)` : 'legends sim OK');
process.exitCode = bad ? 1 : 0;
