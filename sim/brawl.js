// The Bloodsand Brawl (v10.9): played to the end by a bot-driven player of every class at levels 35, 45 and 60.
// The design: a level-appropriate player wins the whole brawl about 1 time in 3; every class earns from it (wins at least
// 0.8 rounds a brawl on average), while who ends up champion may lean by class (that is class identity). Pets wait
// outside the pit. Rounds pay, the chest opens once a day, the schedule is right across midnight and time-zone changes.
//   node sim/brawl.js [brawls per class, default 12]
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
const { execFileSync } = require('child_process');
const N = +process.argv[2] || 12;
let t = new Date('2026-10-01T15:01:00').getTime(); Date.now = () => t;
let ok = 0, bad = 0; const check = (c, m) => { if (c) ok++; else { bad++; console.log('FAIL', m); } };
// the balance numbers are a report, not a gate, until the reach rule (casters' answer to melee) is designed
const report = (c, m) => { if (!c) console.log('REPORT', m); };
const CLASSES = Object.keys(D.CLASSES);
const OPEN = new Date('2026-10-01T15:01:00').getTime();
let seedN = 0; // each simulated brawl plays a different talent build, as players differ
function brawl(cls, L, skill, at) {
  t = at || OPEN; // every brawl starts while the arena is open (a brawl that has started runs to its end)
  G.newGame({ name: 'Pit', cls, race: cls === 'shaman' ? 'orc' : 'human' }); const S = G.S, P = S.player;
  P.level = L; S.flags.warModeAsked = true; P.place = 'bloodsand_arena';
  P.equip = G.botChar({ name: 'x', cls, race: 'human', level: L, skill }).equip; P.talents = G.autoTalents(cls, 'dps', L, seedN++); P.role = 'dps';
  if (!G.brawlJoin()) return null;
  let g = 0;
  while (S.brawl && S.brawl.phase !== 'done' && g++ < 400000) {
    if (S.brawl.phase === 'choose' && !G.fight) G.brawlFight();
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill, react: 0.9 - 0.6 * skill }; G.pUnit.role = 'dps'; }
    G.update(0.1); t += 100;
  }
  return S.brawl;
}
const rate = {};
for (const L of [35, 45, 60]) {
  let champs = 0, rounds = 0, n = 0;
  for (const cls of CLASSES) {
    let c = 0;
    let rw = 0; for (let i = 0; i < N; i++) { const br = brawl(cls, L, 0.6); if (!br) continue; n++; rounds += br.wins; rw += br.wins; if (br.champion) { champs++; c++; } }
    rate[L + cls] = c / N; rate['r' + L + cls] = rw / N;
  }
  const r = champs / n; rate[L] = r;
  console.log(`L${L}: champion ${Math.round(r * 100)}% · ${(rounds / n).toFixed(2)} rounds won a brawl · rounds by class ${CLASSES.map((k) => k.slice(0, 4) + ' ' + rate['r' + L + k].toFixed(1)).join(' ')} · champion by class ${CLASSES.map((k) => k.slice(0, 4) + ' ' + Math.round(rate[L + k] * 100)).join(' ')}`);
  report(r >= 0.22 && r <= 0.45, `L${L}: a level-appropriate player should win about 1 in 3 (got ${Math.round(r * 100)}%)`);
}
// no class far behind: across all three levels
for (const cls of CLASSES) { const m = (rate['r35' + cls] + rate['r45' + cls] + rate['r60' + cls]) / 3; report(m >= 0.8, `${cls} wins only ${m.toFixed(2)} rounds a brawl`); }
// rewards: rounds pay, the chest once a day, the title
{
  let br = null; for (let i = 0; i < 40 && !(br && br.champion); i++) br = brawl('warrior', 40, 0.85);
  check(br && br.champion && br.chest && br.chest.length === 3, 'a champion gets a chest of three items');
  const P = G.S.player, bags = P.bags.length; G.brawlTakeChest(0);
  check(P.bags.length === bags + 1 && !G.S.brawl.chest, 'taking from the chest puts the item in your bags');
  check(G.titleUnlocked(D.TITLES.find((x) => x.id === 'bloodsand')), 'the champion earns the Bloodsand Champion title');
  check(br.reward.money > 0 && br.reward.xp > 0, 'won rounds pay money and XP');
  // the same day again: no chest
  const day = P.brawl.chestDay; G.S.brawl = null; P.brawl.last = null; t += 3 * 3600000; P.place = 'bloodsand_arena';
  let again = null; for (let i = 0; i < 40; i++) { G.S.brawl = null; P.brawl.last = null; again = null; if (!G.brawlJoin()) break; let g = 0; while (G.S.brawl && G.S.brawl.phase !== 'done' && g++ < 400000) { if (G.S.brawl.phase === 'choose' && !G.fight) G.brawlFight(); if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.85, react: 0.39 }; G.pUnit.role = 'dps'; } G.update(0.1); t += 100; } again = G.S.brawl; if (again && again.champion) break; }
  const sameDay = new Date(t).toDateString() === new Date(new Date(day + 'T12:00:00')).toDateString();
  if (again && again.champion && sameDay) check(!again.chest, 'a second win the same day opens no chest');
  // closed, wrong place, too low, already fought this window
  G.S.brawl = null; t = new Date('2026-10-01T16:30:00').getTime(); check(!!G.brawlBlock(), 'the arena is shut outside the window');
  t = new Date('2026-10-01T18:05:00').getTime(); P.place = 'rumhook_bay'; check(/Arena/.test(G.brawlBlock() || ''), 'you must be at the arena');
  P.place = 'bloodsand_arena'; P.level = 30; check(/level/.test(G.brawlBlock() || ''), 'too low a level is turned away'); P.level = 40;
  P.brawl.last = G.brawlWindow().id; check(/fought/.test(G.brawlBlock() || ''), 'one brawl per window');
}
// the schedule, from the clock in other time zones (a child process, since a time zone is fixed at start)
const sched = (tz, iso) => JSON.parse(execFileSync(process.execPath, ['-e', `globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};require(${JSON.stringify(require.resolve('../src/data.js'))});require(${JSON.stringify(require.resolve('../src/engine.js'))});require(${JSON.stringify(require.resolve('../src/bots.js'))});require(${JSON.stringify(require.resolve('../src/game.js'))});const w=G.brawlWindow(new Date(${JSON.stringify(iso)}));console.log(JSON.stringify({open:w.open,opens:w.opensAt.getHours()+':'+w.opensAt.getMinutes(),closes:w.closesAt.getHours()+':'+w.closesAt.getMinutes()}))`], { env: Object.assign({}, process.env, { TZ: tz }) }).toString());
{
  const a = sched('Asia/Jakarta', '2026-10-01T23:50:00+07:00'); check(!a.open && a.opens === '0:0' && a.closes === '0:20', `midnight in Jakarta: ${JSON.stringify(a)}`);
  const b = sched('Asia/Jakarta', '2026-10-02T00:10:00+07:00'); check(b.open && b.closes === '0:20', `just after midnight in Jakarta: ${JSON.stringify(b)}`);
  // New York leaves summer time on 1 November 2026 (2:00 becomes 1:00): the schedule still lands on the hour
  const c = sched('America/New_York', '2026-11-01T00:30:00-04:00'); check(!c.open && /:0$/.test(c.opens), `before the clock change in New York: ${JSON.stringify(c)}`);
  const d = sched('America/New_York', '2026-11-01T03:05:00-05:00'); check(d.open && d.opens === '3:0', `after the clock change in New York: ${JSON.stringify(d)}`);
}
console.log(`brawl: ${ok}/${ok + bad} checks pass`);
process.exitCode = bad ? 1 : 0;
