// World bosses (v10.7, fast, in the build): one a week from the date (none, one, many new handled like the featured
// raid), only that one is out, loot and Marks once a week, its mechanics shown untagged; and a fight a level-60 group
// can win. node sim/worldboss.js
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/trials.js');
const { G, D, E } = globalThis;
const RealDate = Date; let t = new RealDate(2026, 9, 14, 12).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
let ok = 0, bad = 0; const check = (c, m) => { if (c) ok++; else { bad++; console.log('FAIL ' + m); } };
const W = (y, m, d) => new RealDate(y, m - 1, d, 12), wb = (d) => G.worldBoss(d);
const acts = G.worldBossActs();
check(acts.length >= 3, `${acts.length} world bosses`);
check(wb(W(2026, 10, 1)) === null, 'none before the first week');
check(wb(W(2026, 10, 12)) === wb(W(2026, 10, 18)), 'the same boss Monday to Sunday');
check(new Set([0, 1, 2, 3, 4, 5].map((i) => wb(W(2026, 10, 5 + 7 * i)))).size === acts.length, 'every world boss in turn');
{ const before = wb(W(2026, 10, 19)); D.ACTIVITIES.zz_wb = Object.assign({}, D.ACTIVITIES[acts[0]], { since: '2026-10-21' });
  check(wb(W(2026, 10, 19)) === before && wb(W(2026, 10, 26)) === 'zz_wb', 'a new one joins the week after it ships'); delete D.ACTIVITIES.zz_wb; }
for (const act of acts) {
  const A = D.ACTIVITIES[act], M = D.MOBS[A.boss];
  check(M && M.loot && M.loot.length >= 3 && M.boss, `${act}: a boss with loot`);
  const u = E.mobUnit(A.boss, 60, { hp: 1, dmg: 1 }); u.hardX = A.extra[A.boss];
  const rows = E.specialRows(u); check(rows.length >= 2 && rows.every((r) => !r.hard), `${act}: ${rows.length} abilities, none tagged Hard`);
}
// only this week's is out; travel there; a level-60 group wins; loot and Marks once a week
{
  while (wb(new Date(t)) !== acts[0]) t += 7 * 86400000;
  const act = acts[0], A = D.ACTIVITIES[act], other = acts.find((k) => k !== act);
  G.newGame({ name: 'W', cls: 'warrior', race: 'human' }); const S = G.S, P = S.player; S.flags.warModeAsked = true; P.level = 60;
  P.equip = G.botChar({ name: 'x', cls: 'warrior', race: 'human', level: 60, skill: 0.8 }).equip; P.talents = G.autoTalents('warrior', 'dps', 60, 0);
  P.place = A.where; check(!G.activityBlock(act), `this week's world boss is open (${G.activityBlock(act)})`);
  check(G.activityBlock(other) === 'hidden', 'the others are not out this week');
  P.place = 'stormwind'; check(/^Go to /.test(G.activityBlock(act) || ''), 'you travel to a world boss');
  P.place = A.where;
  const fight = () => { G.queueFor(act); G.acceptPop(); let g = 0; while (S.run && S.run.phase !== 'done' && g++ < 600000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.75, react: 0.45 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && !r.player) { try { G.roll(S.run.rolls.indexOf(r), 'pass'); } catch (e) {} }
    if (S.run && S.run.phase === 'rest' && S.run.restUntil <= t) { try { G.runPull(); } catch (e) {} }
    if (S.run && S.run.wipes > 8) break;
    G.update(0.1); t += 100; }
    const r = { done: S.run && S.run.phase === 'done', wipes: S.run ? S.run.wipes : 99, rolls: (S.run && S.run.rolls || []).length }; S.run = null; S.group = null; return r; };
  const m0 = G.account().marks, r1 = fight(), m1 = G.account().marks;
  console.log(`${act}: first fight done ${r1.done}, wipes ${r1.wipes}, rolls ${r1.rolls}`);
  check(r1.done && r1.wipes <= 2, `a level-60 group beats ${A.name} (${r1.wipes} wipes)`);
  check(m1 - m0 === G.WB_MARKS && G.worldBossLooted(act) && r1.rolls >= 2, `the first kill this week drops loot and ${G.WB_MARKS} Marks`);
  const r2 = fight(); check(r2.done && G.account().marks === m1 && r2.rolls === 0, `the second kill this week drops nothing (${r2.rolls} rolls)`);
  t += 7 * 86400000; check(!G.worldBossLooted(act), 'loot is open again the next week');
}
console.log(`worldboss: ${ok}/${ok + bad} checks pass`);
process.exitCode = bad ? 1 : 0;
