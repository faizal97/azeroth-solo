// Omens (manual, slow): does each Omen's counter clearly beat the wrong choice? Trial runs of level-60 dungeons with a
// raider-geared group, three ways per Omen: no Omen, the Omen with its counter, the Omen with the wrong boss plan.
//   node sim/omens.js [runs per case, default 8] [Trial level, default 10]
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/trials.js');
const { G, D, TRIALS: T } = globalThis;
const N = +process.argv[2] || 8, LVL = +process.argv[3] || 10;
const RealDate = Date; let t = new RealDate(2026, 9, 10, 12).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
const lootOf = (dk) => { const s = new Set(); for (const p of D.DUNGEONS[dk].pulls) for (const m of p.mobs) for (const i of (D.MOBS[m].loot || [])) s.add(i); return [...s]; };
function gear(P) { const ids = ['molten_core', 'onyxias_lair'].flatMap(lootOf); for (const slot of D.GEAR_SLOTS) { const f = ids.filter((id) => D.ITEMS[id].slot === slot && G.canUseItem(D.ITEMS[id], P.cls)).sort((a, b) => G.itemScore(D.ITEMS[b], P.cls) - G.itemScore(D.ITEMS[a], P.cls)); if (f.length) P.equip[slot] = G.copyItem(f[0]); } }
// counter and wrong choice per Omen, as the boss plan the player sets
// [kill order, boss plan] for the counter and the wrong choice
const PLAN = { mending: [['focus', null], ['spread', null]], frenzied: [['focus', null], ['spread', null]], rallying: [['spread', null], ['focus', null]], guarded: [['focus', 'adds'], ['focus', 'boss']], enraging: [['focus', 'boss'], ['focus', 'adds']] };
function run(act, omen, choice, cls) {
  const [ko, plan] = choice || ['focus', null];
  G.newGame({ name: 'Om', cls, race: 'human' }); const S = G.S, P = S.player; P.level = 60; S.flags.warModeAsked = true;
  P.talents = G.autoTalents(cls, cls === 'warrior' ? 'tank' : 'dps', 60, 0); if (cls === 'warrior') P.role = 'tank'; gear(P);
  P.trials = { season: 0, best: {}, open: { [act]: LVL }, week: null, history: [], bestEver: 0, bestRank: null };
  const real = T.omensFor; T.omensFor = () => (omen ? [omen] : []);
  if (!G.queueTrial(act, LVL)) { T.omensFor = real; return null; }
  G.acceptPop(); T.omensFor = real;
  for (const m of S.group.members) { m.bot.skill = 0.72; gear(m); }
  if (plan) S.run.bossPlan = plan; S.run.killOrder = ko;
  let g = 0;
  while (S.run && S.run.phase !== 'done' && g++ < 400000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.72, react: 0.5 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && !r.player) { try { G.roll(S.run.rolls.indexOf(r), 'pass'); } catch (e) {} }
    if (S.run && S.run.phase === 'rest' && S.run.restUntil <= t && G.role() === 'tank') { try { G.runPull(); } catch (e) {} }
    if (S.run && S.run.wipes > 12) break;
    G.update(0.1); t += 100;
  }
  const done = S.run && S.run.phase === 'done', secs = done ? G.runClock() : Infinity, par = T.par(D.DUNGEONS[D.ACTIVITIES[act].dungeon]);
  return { done, timed: done && secs <= par, secs, wipes: S.run ? S.run.wipes : 99 };
}
function cases(omen, choice) {
  let timed = 0, wiped = 0, n = 0; const all = [];
  for (const act of ['stratholme', 'blackfathom']) for (let i = 0; i < N; i++) { const r = run(act, omen, choice, ['warrior', 'mage', 'rogue', 'priest'][i % 4]); if (!r) continue; n++; timed += r.timed ? 1 : 0; wiped += r.wipes ? 1 : 0; all.push(Math.min(r.secs, 1500)); }
  all.sort((a, b) => a - b);
  return { timed: timed / n, wiped: wiped / n, median: all[all.length >> 1] };
}
const fmt = (c) => `in time ${String(Math.round(c.timed * 100)).padStart(3)}% · runs with a wipe ${String(Math.round(c.wiped * 100)).padStart(3)}% · median ${Math.round(c.median)}s`;
const base = cases(null, null);
console.log(`Trial ${LVL}, ${N} runs per dungeon per case\n  no Omen, no plan    ${fmt(base)}`);
for (const k of Object.keys(T.OMENS).filter((x) => !T.OMENS[x].off)) {
  const [good, bad] = PLAN[k];
  const c = cases(k, good), w = cases(k, bad);
  console.log(`  ${T.OMENS[k].name.padEnd(10)} counter  ${fmt(c)}\n  ${''.padEnd(10)} wrong    ${fmt(w)}   ${c.timed - w.timed >= 0.15 || w.wiped - c.wiped >= 0.15 ? 'counter clearly better' : 'counter NOT clearly better'}`);
}
