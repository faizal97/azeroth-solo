// One on one by class pair (distance, v10.9 stage 3): the same fighters the Bloodsand Brawl uses, 25 m apart, and what
// happened in each fight (how long the melee side could hit, kiting, hops). A diagnosis tool, not a gate.
//   node sim/duel1v1.js [level 60] [fights per pair 40] [classA,classB ...]
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, E } = globalThis;
const L = +process.argv[2] || 60, N = +process.argv[3] || 40, ONLY = process.argv[4] ? process.argv[4].split(',') : null;
G.newGame({ name: 'X', cls: 'warrior', race: 'human' });
const CL = ONLY || Object.keys(D.CLASSES);
let seed = 0;
const unit = (cls, side) => { const c = G.botChar({ name: cls + side, cls, race: cls === 'shaman' ? 'orc' : 'human', level: L, skill: 0.6, role: 'dps' }); c.role = 'dps'; c.talents = G.autoTalents(cls, 'dps', L, seed++); c.hp = null; c.res = null;
  const u = E.charUnit(c, side, 'bot', 0); u.bot = { skill: 0.6, react: 0.54 }; u.role = 'dps'; if (side === 'enemy') u.threat = {}; return u; };
function duel(a, b) {
  const A = unit(a, 'ally'), B = unit(b, 'enemy'), C = E.fight([A], [B], { apart: G.DUEL_APART });
  const st = { t: 0, close: 0, hops: 0, kite: 0 };
  for (let i = 0; i < 3000 && !C.over; i++) { E.tick(C, 0.1); if (E.dist(A, B) <= E.DIST.melee + 0.5) st.close += 0.1; if (A.kiteUntil > C.t || B.kiteUntil > C.t) st.kite += 0.1;
    for (const e of C.events) if (e.type === 'move' && e.how === 'hop') st.hops++; C.events.length = 0; }
  st.t = C.t; st.win = C.over === 'win'; return st;
}
for (const a of CL) {
  const row = [];
  for (const b of CL) { if (a === b) { row.push('  -  '); continue; } let w = 0, close = 0, t = 0, hops = 0, kite = 0; for (let i = 0; i < N; i++) { const s = duel(a, b); w += s.win; close += s.close / s.t; t += s.t; hops += s.hops; kite += s.kite; }
    row.push(String(Math.round(w / N * 100)).padStart(3) + '% '); if (ONLY) console.log(`${a} v ${b}: ${Math.round(w / N * 100)}% · ${(t / N).toFixed(0)} s · in melee ${Math.round(close / N * 100)}% of the fight · ${(hops / N).toFixed(1)} hops · ${(kite / N).toFixed(1)} s kiting`); }
  if (!ONLY) console.log(a.padEnd(8), row.join(''));
}
if (!ONLY) console.log('        ', CL.map((c) => c.slice(0, 4).padStart(5)).join(''));
