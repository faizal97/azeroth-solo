// Hard raids (v10.7, fast, in the build): the rules, not the tuning (sim/hardraid.js tunes). Hard opens after a Normal
// clear at the cap; a Hard run uses the Hard numbers and the boss's extra mechanic fires at its mark; the first kill of
// a boss in a week drops its items two upgrade steps up and the second does not; the week resets on Monday; the
// briefing text names the extra mechanic with its numbers; Hard clears count in the codex.
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/trials.js');
const { G, D, E } = globalThis;
const RealDate = Date; let t = new RealDate(2026, 9, 14, 12).getTime(); // a Wednesday
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
let ok = 0, bad = 0; const check = (c, m) => { if (c) ok++; else { bad++; console.log('FAIL ' + m); } };
const raids = Object.keys(D.ACTIVITIES).filter((k) => { const A = D.ACTIVITIES[k]; return A.dungeon && D.DUNGEONS[A.dungeon].hard; });
check(raids.length >= 1, 'at least one raid has Hard');
for (const act of raids) {
  const Dg = D.DUNGEONS[D.ACTIVITIES[act].dungeon];
  check(Dg.hard.bossMult.hp > Dg.bossMult.hp && Dg.hard.bossMult.dmg > Dg.bossMult.dmg && Dg.hard.trashMult.hp > Dg.trashMult.hp, `${act}: Hard is stronger than Normal`);
  const bosses = Dg.pulls.filter((p) => p.boss).map((p) => p.mobs[0]);
  for (const b of bosses) check(Dg.hard.extra && Dg.hard.extra[b] && Dg.hard.extra[b].length, `${act}: ${b} has an extra Hard mechanic`);
  // opens after a Normal clear, at the cap
  G.newGame({ name: 'H', cls: 'warrior', race: 'human' }); const S = G.S, P = S.player; S.flags.warModeAsked = true; P.place = D.ACTIVITIES[act].where;
  P.level = 59; P.codex = { [act]: { clears: 1 } }; check(!G.hardOpen(act), `${act}: not open below the cap`);
  P.level = 60; P.codex = {}; check(!G.hardOpen(act), `${act}: not open before a Normal clear`);
  G.queueFor(act, { hard: true }); check(!S.queue, `${act}: a Hard queue is refused before a Normal clear`);
  P.codex = { [act]: { clears: 1 } }; check(G.hardOpen(act), `${act}: open after a Normal clear`);
  G.queueFor(act, { hard: true }); check(S.queue && S.queue.hard, `${act}: Hard queue`); G.acceptPop();
  check(S.run && S.run.hard && S.run.bossMult === Dg.hard.bossMult && /Hard/.test(S.run.name), `${act}: the run uses the Hard numbers`);
  // the extra mechanic: fires once at its mark, and the briefing text names it
  const b0 = bosses[0], x = Dg.hard.extra[b0][0];
  const u = E.mobUnit(b0, 60, Dg.hard.bossMult); u.extraAdds = G.hardExtra(act, b0);
  const facts = E.specialFacts(u).join(' ');
  check(facts.includes('Hard: at ' + Math.round(x.at * 100) + '% health') && facts.includes(D.MOBS[x.mob].name), `${act}: the briefing names the extra mechanic (${facts})`);
  const C = E.fight([E.charUnit(P, 'ally', 'bot', t)], [u], {});
  u.hp = Math.floor(u.maxHp * (x.at + 0.05)); E.tick(C, 0.1); const n0 = C.enemies.length;
  u.hp = Math.floor(u.maxHp * (x.at - 0.02)); E.tick(C, 0.1); const n1 = C.enemies.length; E.tick(C, 0.1);
  check(n1 - n0 === x.n && C.enemies.length === n1, `${act}: ${x.n} join at ${x.at} (${n0} → ${n1}), once`);
  // loot: two steps up the first time this week, Normal the second time, again after Monday
  const it = G.hardCopy(D.MOBS[b0].loot[0]), base = G.copyItem(D.MOBS[b0].loot[0]), ib = G.upgradeInfo(base), ih = G.upgradeInfo(it);
  check(it.hard && Math.abs((ih.pts - ib.pts) - Math.min(G.HARD_STEPS * D.UPGRADE.step * G.upgradeRef(base), D.UPGRADE.cap[base.q] * G.upgradeRef(base) - ib.pts)) < 0.02, `${act}: a Hard drop is ${G.HARD_STEPS} steps up (${ib.pct}% → ${ih.pct}%)`);
  check(G.hardBonusLeft(act, b0), `${act}: bonus open at the start of the week`);
  G.raidWeek().got[act + ':' + b0] = true; check(!G.hardBonusLeft(act, b0), `${act}: bonus taken`);
  t += 5 * 86400000; check(G.hardBonusLeft(act, b0), `${act}: bonus back after the Monday reset`);
}
// a real Hard clear with a very strong group: finishes, counts a Hard clear, and takes the weekly bonus
{
  const act = raids[0], Dg = D.DUNGEONS[D.ACTIVITIES[act].dungeon];
  G.newGame({ name: 'H', cls: 'warrior', race: 'human' }); const S = G.S, P = S.player; S.flags.warModeAsked = true; P.level = 60; P.place = D.ACTIVITIES[act].where;
  P.equip = G.botChar({ name: 'x', cls: 'warrior', race: 'human', level: 60, skill: 0.8 }).equip; P.talents = G.autoTalents('warrior', 'dps', 60, 0); P.hp = null; P.res = null;
  P.codex = { [act]: { clears: 1 } };
  const saved = JSON.stringify(Dg.hard); Dg.hard.bossMult = { hp: 1, dmg: 1 }; Dg.hard.trashMult = { hp: 1, dmg: 1 }; // the rules, not the numbers
  G.queueFor(act, { hard: true }); G.acceptPop();
  let g = 0; while (S.run && S.run.phase !== 'done' && g++ < 300000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.8, react: 0.4 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && !r.player) { try { G.roll(S.run.rolls.indexOf(r), 'pass'); } catch (e) {} }
    if (S.run && S.run.phase === 'rest' && S.run.restUntil <= t) { try { G.runPull(); } catch (e) {} }
    G.update(0.1); t += 100;
  }
  if (bad || process.env.DEBUG) console.log('run end:', S.run && S.run.phase, S.run && S.run.idx, S.run && S.run.wipes, g, S.group && S.group.members.length);
  Object.assign(Dg.hard, JSON.parse(saved));
  check(S.run && S.run.phase === 'done', 'a Hard run can be finished');
  check(P.codex[act].hard === 1 && P.codex[act].clears === 2, `the codex counts the Hard clear (${JSON.stringify(P.codex[act])})`);
  const b0 = Dg.pulls.filter((p) => p.boss)[0].mobs[0];
  check(!G.hardBonusLeft(act, b0), 'the weekly bonus was taken by the kill');
  check((S.run.rolls || []).some((r) => r.item.hard), 'the kill dropped Hard items');
}
console.log(`hard: ${ok}/${ok + bad} checks pass`);
process.exitCode = bad ? 1 : 0;
