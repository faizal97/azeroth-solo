// How long is the hunt? (#43 job 2, design docs/plans/2026-10-03-rare-hunts-design.md §4) Days to 10 trophies (#44) for
// a level-60 player who plays one hour a day at a random time. Target: about two to three weeks.
// The player: mounted, past Veshmira's storm (so every hunt place is reachable), starting each day where the last one
// ended (the first day at a random hunt place). Each minute of the hour: if a hunt rare whose trophy is still missing is up
// (G.huntUp, the game's own schedule) and can be reached and killed before it leaves and before the hour ends, go for
// the nearest (G.route: the game's travel times). A kill takes KILL seconds alone (non-elite) or KILL_ELITE with a world
// party of three (finding the party included), and it always succeeds (sim/rarehunt.js: 82-100% for every class).
// World bosses: the week's world boss (G.worldBoss, one a week in rotation) is done once in the first hour played that
// week, taking WB minutes of the hour, if its trophy is missing.
//   ROOT=~/azeroth-solo-measure node sim/huntdays.js [players, default 400]   SAME=1: the same hour every day
const ROOT = process.env.ROOT || require('path').join(__dirname, '..');
let seedS = 0x5eed1e55 ^ (+process.env.SEED || 0); Math.random = () => { seedS = (seedS + 0x6D2B79F5) >>> 0; let x = seedS; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
const RealDate = Date; let t = new RealDate(Date.UTC(2026, 9, 5)).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
for (const f of ['data', 'engine', 'bots', 'game']) require(ROOT + '/src/' + f + '.js');
const { G, D } = globalThis;
const N = +process.argv[2] || 400, GOAL = 10, KILL = +(process.env.KILL || 60), KILL_ELITE = +(process.env.KILL_ELITE || 300), WB = +(process.env.WB || 20), MAXDAYS = 120;
const DAY = 86400e3, rnd = (a, b) => a + Math.random() * (b - a), irnd = (a, b) => Math.floor(rnd(a, b + 1));
function setup(race) { G.newGame({ name: 'H', cls: 'warrior', race }); const S = G.S, P = S.player; P.level = 60; S.flags.stormBroken = true; S.flags.warModeAsked = true; P.riding = true; P.mount = Object.keys(D.MOUNTS)[0]; if (!G.mounted()) throw new Error('not mounted'); return P; } // riding and a mount, as a level-60 player has
function player(i) {
  const race = i % 2 ? 'orc' : 'human', P = setup(race), rares = G.huntRares(), list = G.trophyList();
  const start = Date.UTC(2026, 9, 5) + irnd(0, 27) * DAY, sameMin = irnd(0, 24 * 60 - 1);
  let place = rares[irnd(0, rares.length - 1)].place; const got = new Set(); const wbWeek = new Set(); let travel = 0;
  for (let day = 1; day <= MAXDAYS; day++) {
    const startMin = process.env.SAME ? sameMin : irnd(0, 24 * 60 - 1); let m = 0; const t0 = start + (day - 1) * DAY + startMin * 60e3;
    // the week's world boss, once in the first hour played that week
    t = t0; const wk = Math.floor((t0 - Date.UTC(2026, 9, 5)) / (7 * DAY)), wbAct = G.worldBoss(new RealDate(t0));
    if (wbAct && !wbWeek.has(wk)) { wbWeek.add(wk); const boss = D.ACTIVITIES[wbAct].boss; if (!got.has(boss)) { got.add(boss); m += WB; } }
    while (m < 60) {
      t = t0 + m * 60e3; P.place = place;
      const up = rares.filter((r) => !got.has(r.key) && G.huntUp(r.key, t)).map((r) => { const rt = r.place === place ? { secs: 0 } : G.route(place, r.place); const kill = D.MOBS[r.key].elite ? KILL_ELITE : KILL; return rt && { r, arrive: t + rt.secs * 1000, done: t + (rt.secs + kill) * 1000 }; }).filter((x) => x && x.arrive < G.huntNow(x.r.key, t).end && x.done <= t0 + 60 * 60e3).sort((a, b) => a.arrive - b.arrive);
      if (!up.length) { m++; continue; }
      const x = up[0]; got.add(x.r.key); place = x.r.place; travel += (x.arrive - t) / 1000; m = Math.ceil((x.done - t0) / 60e3);
    }
    if (got.size >= GOAL) return { days: day, got: got.size, travelMin: travel / 60 };
  }
  return { days: null, got: got.size, travelMin: travel / 60 };
}
const res = []; for (let i = 0; i < N; i++) res.push(player(i));
const done = res.filter((r) => r.days != null).map((r) => r.days).sort((a, b) => a - b), q = (f) => done[Math.min(done.length - 1, Math.floor(f * (done.length - 1)))];
console.log(`hunt rares ${G.huntRares().length} + world bosses ${G.worldBossActs().length} = ${G.trophyList().length} trophies; goal ${GOAL}; ${N} players, one hour a day at ${process.env.SAME ? 'the same' : 'a random'} time; kill ${KILL} s alone, ${KILL_ELITE} s with a party; world boss ${WB} min`);
console.log(`days to ${GOAL} trophies: median ${q(0.5)}, 10th percentile ${q(0.1)}, 90th ${q(0.9)}, fastest ${done[0]}, slowest ${done[done.length - 1]}; ${N - done.length} of ${N} not there in ${MAXDAYS} days`);
const weeks = [14, 21, 28].map((d) => `${Math.round((done.filter((x) => x <= d).length / N) * 100)}% by day ${d}`); console.log(weeks.join(' · '));
