// Trials pacing (v10.4): the wall for three kinds of player, the highest Trial level they beat par on at least half the
// time. Used to tune TRIALS.STEP. Targets (design): fresh 60 in dungeon blues 5-7, raider 10-12, pusher 15-17.
//   node sim/trialpace.js [runs per level, default 3]
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/trials.js');
const { G, D, TRIALS: T } = globalThis;
const N = +process.argv[2] || 3; if (process.argv[3]) T.STEP = +process.argv[3]; if (process.argv[4]) T.BASE = +process.argv[4];
const RealDate = Date; let t = new RealDate(2026, 9, 10, 12).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
const lootOf = (dk) => { const s = new Set(); for (const p of D.DUNGEONS[dk].pulls) for (const m of p.mobs) for (const i of (D.MOBS[m].loot || [])) s.add(i); return [...s]; };
function gear(P, sources, upgrade) {
  const ids = sources.flatMap(lootOf);
  for (const slot of D.GEAR_SLOTS) {
    const fits = ids.filter((id) => D.ITEMS[id].slot === slot && G.canUseItem(D.ITEMS[id], P.cls)).sort((a, b) => G.itemScore(D.ITEMS[b], P.cls) - G.itemScore(D.ITEMS[a], P.cls));
    let it = fits.length ? G.copyItem(fits[0]) : G.genGear(slot, 60, 3, P.cls === 'mage' ? { atype: 'cloth' } : P.cls === 'warrior' ? { atype: 'mail' } : {});
    if (upgrade) { let k = 0; while (G.upgradeInfo(it).room && k++ < 20) it = G.upgradedCopy(it, G.upgradeInfo(it).next); }
    P.equip[slot] = it;
  }
}
const PROFILES = [
  { name: 'fresh 60, dungeon blues', sources: ['stratholme', 'scholomance'], upgrade: false, skill: 0.62, me: 0.6 },
  { name: 'raider, raid purples', sources: ['molten_core', 'onyxias_lair'], upgrade: false, skill: 0.72, me: 0.7 },
  { name: 'pusher, upgraded to the ceiling', sources: ['tidecrown_citadel'], upgrade: true, skill: 0.82, me: 0.8 },
];
function run(prof, cls, act, lvl) {
  G.newGame({ name: 'Pace', cls, race: 'human' }); const S = G.S, P = S.player; P.level = 60; S.flags.warModeAsked = true;
  P.talents = G.autoTalents(cls, 'dps', 60, 0); P.role = 'dps'; // the bot tank follows the pace rules
  gear(P, prof.sources, prof.upgrade);
  P.trials = { season: 0, best: {}, open: { [act]: lvl }, week: null, history: [], bestEver: 0, bestRank: null };
  if (!G.queueTrial(act, lvl)) return null;
  G.acceptPop();
  // a good player reads the week: the right answer to each active Omen (the same answers sim/omens.js proves)
  for (const k of S.run.omens || []) {
    if (k === 'guarded') S.run.bossPlan = 'adds'; if (k === 'enraging') S.run.bossPlan = 'boss';
    if (k === 'volatile') S.run.pace = 'careful'; if (k === 'hasty' || k === 'restless') S.run.pace = 'fast';
    if (k === 'warded' || k === 'vengeful' || k === 'sheltered') { S.run.marks = {}; S.run.pulls.forEach((p, i) => { const n = p.mobs.length; if (n < 2) return; S.run.marks[i] = k === 'warded' ? { [n - 1]: 'skull' } : n >= 3 ? { 0: 'skull', 1: 'cross' } : { 0: 'skull' }; }); }
  }
  if (prof.pace) S.run.pace = prof.pace; // pushers chain pulls
  for (const m of S.group.members) { m.bot.skill = prof.skill; if (prof.upgrade || prof.sources[0] !== 'stratholme') gear(m, prof.sources, prof.upgrade); }
  let g = 0;
  while (S.run && S.run.phase !== 'done' && g++ < 400000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: prof.me, react: 0.5 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && r.player && r.choice == null) { try { G.roll(S.run.rolls.indexOf(r), 'greed'); } catch (e) {} }
    // the bot tank pulls on its own, following the pace rules
    if (S.run && S.run.wipes > 12) break;
    G.update(0.1); t += 100;
  }
  const done = S.run && S.run.phase === 'done', secs = done ? G.runClock() : Infinity, par = T.par(D.DUNGEONS[D.ACTIVITIES[act].dungeon]);
  return { done, timed: done && secs <= par, secs: Math.round(secs), par, wipes: S.run ? S.run.wipes : 99 };
}
const acts = ['blackfathom', 'stratholme'];
const out = [];
for (const prof of PROFILES.filter((p) => !process.env.PACE_ONLY || p.name.startsWith(process.env.PACE_ONLY))) {
  let wall = 0; const line = [];
  for (let lvl = 1; lvl <= 22; lvl += (lvl < 5 ? 2 : 2)) {
    let timed = 0, total = 0;
    for (const act of acts) for (let i = 0; i < N; i++) { const cls = ['mage', 'rogue', 'hunter'][i % 3], r = run(prof, cls, act, lvl); if (!r) continue; if (process.env.PACE_DEBUG) console.log(`  ${prof.name.slice(0, 6)} T${lvl} ${act} ${cls}: ${r.done ? r.secs + 's of ' + r.par : 'not done'}, ${r.wipes} wipes`); total++; if (r.timed) timed++; }
    line.push(`T${lvl}:${timed}/${total}`);
    if (total && timed * 2 >= total) wall = lvl; else if (lvl > wall + 3) break;
  }
  out.push(`${prof.name.padEnd(34)} wall ~T${wall}   ${line.join(' ')}`);
  console.log(out[out.length - 1]);
}
console.log(`BASE ${T.BASE} STEP ${T.STEP}`);
