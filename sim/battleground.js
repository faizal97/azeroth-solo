// Battlegrounds (v10.7): the Battle for Highmoor, played to the end by a bot-driven player with three ways to pick the
// banner each round. The choice must be real: the smart pick (gain a banner for the fewest enemies) clearly beats
// charging the biggest group, and a game takes a sensible time. node sim/battleground.js [runs per case, default 12]
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let t = Date.now(); Date.now = () => t;
const N = +process.argv[2] || 12;
// a pick is [where your group goes, where the pair goes]
const names = () => D.BG.highmoor.banners.map((x) => x[0]);
const PICK = {
  // smart: the pair takes an empty banner (or the weakest one); your group goes where it gains most for the fewest enemies
  smart: (bg) => { const n = names(), k = (b) => bg.plan[b] || 0;
    const empty = n.filter((b) => !k(b) && bg.owner[b] !== 'us'), weak = n.slice().sort((a, b) => k(a) - k(b));
    const pair = empty[0] || weak.find((b) => k(b) <= 1) || weak[0];
    const grp = n.filter((b) => b !== pair).sort((a, b) => (k(a) - (bg.owner[a] === 'them' ? 0.5 : 0)) - (k(b) - (bg.owner[b] === 'them' ? 0.5 : 0)))[0] || pair;
    return [grp, pair]; },
  naive: (bg) => { const b = Object.entries(bg.plan).sort((a, c) => c[1] - a[1])[0][0]; return [b, b]; },
  random: () => { const n = names(); return [n[Math.floor(Math.random() * 3)], n[Math.floor(Math.random() * 3)]]; },
};
function play(strat, cls, L) {
  G.newGame({ name: 'Bg', cls, race: cls === 'shaman' ? 'orc' : 'human' }); const S = G.S, P = S.player; P.level = L; S.flags.warModeAsked = true;
  P.equip = G.botChar({ name: 'x', cls, race: 'human', level: L, skill: 0.6 }).equip; P.talents = G.autoTalents(cls, 'dps', L, 0); P.role = 'dps';
  G.queueFor('bg_highmoor'); G.acceptPop(); const t0 = t; let g = 0, fights = 0;
  while (S.bg && S.bg.phase !== 'done' && g++ < 500000) {
    if (S.bg.phase === 'choose' && !G.fight) { G.bgGo(...PICK[strat](S.bg)); if (G.fight) fights++; }
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.6, react: 0.5 }; G.pUnit.role = G.role(); }
    G.update(0.1); t += 100;
  }
  return { win: S.bg && S.bg.result === 'win', secs: (t - t0) / 1000, fights, score: S.bg ? S.bg.score : null };
}
let bad = 0;
const res = {};
for (const L of [20, 40, 60]) for (const strat of Object.keys(PICK)) {
  let w = 0, secs = 0, f = 0;
  for (let i = 0; i < N; i++) { const r = play(strat, ['warrior', 'mage', 'priest', 'rogue'][i % 4], L); w += r.win ? 1 : 0; secs += r.secs; f += r.fights; }
  res[L + strat] = w / N;
  console.log(`L${L} ${strat.padEnd(6)}: wins ${Math.round((w / N) * 100)}% · ${Math.round(secs / N)}s a game · ${(f / N).toFixed(1)} fights`);
}
for (const L of [20, 40, 60]) if (res[L + 'smart'] - res[L + 'naive'] < 0.2) { bad++; console.log(`FAIL L${L}: the smart pick is not clearly better`); }
console.log(bad ? `${bad} problem(s)` : 'battleground: the choice is real');
process.exitCode = bad ? 1 : 0;
