// Full dungeon clears through the real run loop with each pull pace and boss plan.
// The player is driven by the bot AI. Reports clear time and wipes, so the choices are real trade-offs.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let t = Date.now(); Date.now = () => t;
const N = +(process.env.N || 12), ACT = process.env.ACT || 'deadmines';
if (process.env.RR) G.REST_REGEN = +process.env.RR;
const DG = D.DUNGEONS[D.ACTIVITIES[ACT].dungeon];
if (process.env.TM) DG.trashMult = { hp: DG.trashMult.hp, dmg: +process.env.TM };
if (process.env.BM) DG.bossMult = { hp: DG.bossMult.hp, dmg: +process.env.BM };
function clear(pace, plan, cls) {
  G.newGame({ name: 'T', cls, race: 'human' });
  const S = G.S, P = S.player; const LV = +(process.env.LV || 10); P.level = LV; P.equip = G.botChar({ name: 'x', cls, race: 'human', level: LV, skill: 0.6 }).equip; P.hp = null; P.res = null;
  S.flags.warModeAsked = true;
  G.queueFor(ACT); G.acceptPop(); const R = S.run; R.pace = pace; if (plan) R.bossPlan = plan;
  const t0 = t; let guard = 0;
  while (S.run && S.run.phase !== 'done' && guard++ < 400000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.7, react: 0.5 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && r.player && r.choice == null) { try { G.roll(S.run.rolls.indexOf(r), 'greed'); } catch (e) {} }
    G.update(0.1); t += 100;
  }
  return { mins: (t - t0) / 60000, wipes: S.run ? S.run.wipes : 99, done: S.run && S.run.phase === 'done' };
}
for (const [pace, plan] of [['careful', null], ['normal', null], ['fast', null], ['normal', 'boss'], ['normal', 'adds']]) {
  let m = 0, w = 0, d = 0;
  for (let i = 0; i < N; i++) { const r = clear(pace, plan, i % 2 ? 'mage' : 'rogue'); m += r.mins; w += r.wipes; d += r.done ? 1 : 0; }
  console.log(`${ACT} pace ${pace.padEnd(7)} plan ${String(plan || '-').padEnd(4)} · clear ${(m / N).toFixed(1)} min · wipes/run ${(w / N).toFixed(2)} · finished ${d}/${N}`);
}
