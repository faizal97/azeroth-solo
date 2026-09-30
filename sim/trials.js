// Trials (v10.4): the calendar, the automatic season picks (safe for new content), the realm leaderboard, and a
// character's Trials record, with one real Trial run. Design: docs/plans/2026-09-30-trials-design.md
//   node sim/trials.js
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/trials.js');
const { G, D, TRIALS: T } = globalThis;
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };
const RealDate = Date; let fake = new RealDate(2026, 9, 10, 12).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(fake); } static now() { return fake; } };

// ---- the calendar
ok(T.season(new RealDate(2026, 8, 30)) === -1 && T.season(new RealDate(2026, 9, 1)) === 0 && T.season(new RealDate(2026, 10, 3)) === 1, 'seasons start on the 1st, from October 2026');
ok(T.name(0) === 'October 2026' && T.name(3) === 'January 2027', 'seasons are named by their month');
ok([1, 7, 8, 14, 15, 21, 22, 31].map((d) => T.period(new RealDate(2026, 9, d)).p).join('') === '00112233', 'Omen periods start on the 1st, 8th, 15th and 22nd');
ok(T.daysLeft(new RealDate(2026, 9, 30, 12)) === 2, 'days left in the month');

// ---- the season picks, for both factions
for (const f of ['alliance', 'horde']) {
  const el = T.eligible(f);
  ok(el.length >= 10, `${f}: at least 10 dungeons to rotate (${el.length})`);
  const last = {}; let worst = 0;
  for (let k = 0; k < 36; k++) {
    const p = T.picks(k, f);
    ok(p.length === Math.min(T.SIZE, el.length) && new Set(p).size === p.length, `${f} ${T.name(k)}: 8 different dungeons`);
    for (const a of el) { if (p.includes(a)) { if (last[a] != null) worst = Math.max(worst, k - last[a]); last[a] = k; } }
  }
  ok(worst <= 5, `${f}: no dungeon waits more than 5 months over three years (worst ${worst})`);
  ok(el.every((a) => last[a] != null), `${f}: every dungeon gets a season`);
  ok(JSON.stringify(T.picks(5, f)) === JSON.stringify(T.picks(5, f)), `${f}: the same month always holds the same dungeons`);
}
ok(!T.eligible('horde').includes('stockade') && !T.eligible('alliance').includes('ragefire'), 'each faction only gets dungeons it can reach');

// ---- new content: joins the next season, never changes a live one; a burst spreads over two seasons
const addDungeons = (count, since) => {
  const keys = [];
  for (let i = 0; i < count; i++) {
    const key = `test_dungeon_${since}_${i}`;
    D.DUNGEONS[key] = Object.assign({}, D.DUNGEONS.stratholme, { name: 'Test ' + i, since });
    D.ACTIVITIES[key] = Object.assign({}, D.ACTIVITIES.stratholme, { name: 'Test ' + i, dungeon: key });
    keys.push(key);
  }
  return keys;
};
const drop = (keys) => { for (const k of keys) { delete D.DUNGEONS[k]; delete D.ACTIVITIES[k]; } };
{
  const before = T.picks(2, 'alliance');
  const one = addDungeons(1, '2026-12-10'); // mid-December (season 2)
  ok(JSON.stringify(T.picks(2, 'alliance')) === JSON.stringify(before), 'a dungeon added mid-season does not change the live season');
  ok(T.picks(3, 'alliance').includes(one[0]), 'it is in the next season');
  drop(one);
  const six = addDungeons(6, '2026-12-10');
  const s3 = T.picks(3, 'alliance'), s4 = T.picks(4, 'alliance');
  ok(six.filter((k) => s3.includes(k)).length === T.NEW_PER, `a burst of 6: ${T.NEW_PER} go in the next season`);
  ok(six.every((k) => s3.includes(k) || s4.includes(k)), 'and the rest in the one after');
  drop(six);
  ok(JSON.stringify(T.picks(2, 'alliance')) === JSON.stringify(before), 'and nothing is left over once the test dungeons go');
}

// ---- the realm leaderboard: bots climb through the month; you see the top 10 and the players around you
{
  G.newGame({ name: 'Board', cls: 'warrior', race: 'human' });
  const bots = G.S.bots.map((b, i) => Object.assign({}, b, { level: 60 }));
  const early = T.board(bots, 300, 'Me', new RealDate(2026, 9, 3)), late = T.board(bots, 300, 'Me', new RealDate(2026, 9, 28));
  ok(late.rank > early.rank, `bots climb during the month: the same rating drops from #${early.rank} to #${late.rank}`);
  ok(late.rows.length <= 15 && late.rows.some((r) => r.me) && late.rows[0].rank === 1, 'the board shows the top 10 and you, not the whole realm');
  const top = T.board(bots, 99999, 'Me', new RealDate(2026, 9, 28)); ok(top.rank === 1, 'a huge rating is #1');
  const tops = bots.map((b) => T.botRating(b, 0, 1)).sort((a, b) => b - a);
  ok(tops[0] > 1100 && tops[Math.floor(tops.length / 2)] < 700, `a few bots push past 1100, most sit lower (best ${tops[0]}, median ${tops[Math.floor(tops.length / 2)]})`);
}


// ---- the Preseason: a one-day trial run on 30 September, its own picks, filed as "Preseason", no rank title
{
  const oct = JSON.stringify(T.picks(0, 'alliance'));
  fake = new RealDate(2026, 8, 30, 20).getTime();
  ok(T.season(new Date()) === -1 && T.open(-1) && T.name(-1) === 'Preseason', 'the Preseason is open on 30 September');
  ok(T.picks(-1, 'alliance').length === 8 && JSON.stringify(T.picks(0, 'alliance')) === oct, 'it has its own 8 and leaves October alone');
  G.newGame({ name: 'Pre', cls: 'warrior', race: 'human' }); G.S.player.level = 60;
  const pa = G.trialPicks().find((a) => G.trialBlock(a) === null);
  ok(!!pa, 'a Preseason Trial can be queued');
  G.trialDone({ act: pa, trial: { lvl: 2, season: -1, bestHere: 0 } }, 100, 200);
  fake = new RealDate(2026, 9, 1, 9).getTime();
  const R2 = G.trials();
  ok(R2.season === 0 && R2.history[0].name === 'Preseason' && R2.bestRank == null, 'October files the Preseason in history, with no rank title');
  fake = new RealDate(2026, 8, 20, 12).getTime(); ok(!T.open(T.season(new Date())), 'before the Preseason, Trials are shut');
  fake = new RealDate(2026, 9, 10, 12).getTime();
}
// ---- a character's Trials: blocks, levels, rating, Marks, the weekly goal, history
G.newGame({ name: 'Trier', cls: 'warrior', race: 'human' });
const P = G.S.player; G.S.flags.warModeAsked = true;
const act = G.trialPicks()[0];
P.level = 20; ok(/level 60/.test(G.trialBlock(act) || ''), 'Trials open at level 60');
P.level = 60; ok(G.trialBlock(act) === null || /Veshmira/.test(G.trialBlock(act)), 'open at 60');
const other = T.eligible(G.myFaction()).find((a) => !G.trialPicks().includes(a)); if (other) ok(/Not in this month/.test(G.trialBlock(other) || ''), 'a dungeon outside this month is refused');
const easy = G.trialPicks().find((a) => G.trialBlock(a) === null);
ok(G.trialMax(easy) === 1, 'a fresh character starts at Trial 1');
const fakeRun = (lvl) => ({ act: easy, trial: { lvl, season: G.trials().season, bestHere: (G.trials().best[easy] || {}).lvl || 0 } });
const marks0 = G.account().marks;
G.trialDone(fakeRun(1), 100, 200);
ok(G.trials().best[easy].lvl === 1 && G.trialMax(easy) === 3, 'beating par by a wide margin opens two levels');
G.trialDone(fakeRun(3), 190, 200); ok(G.trialMax(easy) === 4, 'beating par opens one');
G.trialDone(fakeRun(4), 260, 200); ok(G.trialMax(easy) === 4 && G.trials().best[easy].lvl === 4 && !G.trials().best[easy].timed, 'over par counts as a clear but opens nothing');
ok(G.trialRating() === 20, `rating: best level x10, half when over par (${G.trialRating()})`);
ok(G.account().marks - marks0 === 6 + 8 + 9, 'Marks: 5 + the Trial level per clear');
const second = G.trialPicks().find((a) => a !== easy && G.trialBlock(a) === null);
if (second) ok(G.trialMax(second) === 2, 'another dungeon starts at most 2 below your best elsewhere');
for (let i = 0; i < 2; i++) G.trialDone(fakeRun(4), 300, 200);
ok(G.trials().week.n >= 4 && G.trials().week.paid, 'the weekly goal: 4 Trials at your best or higher pays a bonus');
ok(G.titleUnlocked(D.TITLES.find((t) => t.id === 'tried')) === false, 'no Trial title yet');
// a real run: enemies at 60, stronger per level
ok(G.queueTrial(easy, 3) && G.S.queue.trial === 3, 'queue a Trial 3');
G.acceptPop();
ok(G.S.run && G.S.run.trial && G.S.run.mobLevel === 60 && G.S.group.members.every((m) => m.syncLevel === 60), 'the run and the group are at level 60');
ok(Math.abs(G.S.run.mult.hp / (D.DUNGEONS[D.ACTIVITIES[easy].dungeon].trashMult || { hp: 1 }).hp - T.factor(3)) < 1e-9, 'enemies gain the Trial factor');
G.S.run.restUntil = 0; G.runPull();
ok(G.fight && G.fight.enemies.every((e) => e.level === 60 || e.level === 58), 'the first pull fights at 60');
G.fight = null; G.S.run = null; G.S.group = null; delete P.syncLevel;
// a new month files the old one
const oldRating = G.trialRating();
fake = new RealDate(2026, 10, 2, 12).getTime();
const Rec = G.trials();
ok(Rec.season === 1 && Rec.history.length === 1 && Rec.history[0].name === 'October 2026' && Rec.history[0].rating === oldRating && Object.keys(Rec.best).length === 0, 'November files October in the history and starts fresh');
ok(Rec.history[0].picks.length === 8 && Rec.history[0].rank >= 1, 'the history keeps that month\'s dungeons and final rank');

console.log(`trials: ${n - bad}/${n} checks pass`);
process.exit(bad ? 1 : 0);
