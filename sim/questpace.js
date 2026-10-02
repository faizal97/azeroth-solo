// Levelling time along the real quest path, per class (issue #4, the game designer's bar): time to level through each
// band within ±20% of the class average. Players get 70%+ of their XP from quests (sim/zoneflow.js), where travel,
// talking and hand-ins take every class the same time; only the kills depend on the class.
// The path: a greedy player takes the nearest open solo quest (by real route time from where they stand, both
// factions), walks giver -> objective -> turn-in (G.route; mounted from D.RIDING.lvl), talks 10 sec a quest, and grinds
// at the level when no quest is open. Each class kills at its own measured pace: seconds per kill from sim/lvpace.js,
// which already holds resting, deaths and the time between pulls.
//   node sim/lvpace.js 6 > lv.txt; LVPACE=lv.txt node sim/questpace.js
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { D, G } = globalThis;
const fs = require('fs');
const BAND = 20, TALK = 10, BANDS = [[10, 20], [25, 35], [40, 50], [50, 60]];
// seconds per kill by class and level, from sim/lvpace.js output (one or more files, comma-separated)
const pace = {}; // pace[cls][L] = seconds per kill (3600 / kills an hour)
for (const f of (process.env.LVPACE || '').split(',').filter(Boolean)) {
  let L = null;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const lv = line.match(/^level (\d+)/); if (lv) { L = +lv[1]; continue; }
    const m = line.match(/^\s+(\w+)\s+\d+ XP\/h.*?· (\d+) kills/); if (m && L) (pace[m[1]] = pace[m[1]] || {})[L] = 3600 / +m[2];
  }
}
const CLASSES = Object.keys(pace);
if (!CLASSES.length) { console.log('no lvpace input: LVPACE=<sim/lvpace.js output> node sim/questpace.js'); process.exit(1); }
const secsPerKill = (cls, L) => { const t = pace[cls], ks = Object.keys(t).map(Number).sort((a, b) => a - b);
  if (L <= ks[0]) return t[ks[0]]; if (L >= ks[ks.length - 1]) return t[ks[ks.length - 1]];
  for (let i = 0; i < ks.length - 1; i++) if (L <= ks[i + 1]) { const f = (L - ks[i]) / (ks[i + 1] - ks[i]); return t[ks[i]] + f * (t[ks[i + 1]] - t[ks[i]]); } };
// where an NPC stands, and where a monster lives
const npcAt = {}; for (const k in D.PLACES) for (const n of (D.PLACES[k].npcs || [])) if (!npcAt[n]) npcAt[n] = k;
const mobAt = {}; for (const k in D.PLACES) for (const [m] of (D.PLACES[k].mobs || [])) (mobAt[m] = mobAt[m] || []).push(k);
const dropFrom = (item) => { for (const k in D.MOBS) { const d = (D.MOBS[k].qdrops || []).find((x) => x[0] === item); if (d) return { mob: k, chance: d[1] || 1 }; } return null; };
// the class-free part of a band and its kill count: { secsFree, kills: [[level, n], ...] }
function walk(race, from, to) {
  const fac = race === 'orc' ? 'horde' : 'alliance';
  G.newGame({ name: 'Q', cls: 'warrior', race }); const P = G.S.player;
  const done = new Set(Object.keys(D.QUESTS).filter((q) => D.QUESTS[q].lvl < from - 3)); // the band's own quests, roughly
  let lvl = from, xp = 0, cur = P.place, travel = 0, talk = 0; const kills = {};
  const route = (a, b) => { if (!a || !b || a === b) return 0; const r = G.route(a, b); const s = r ? r.secs : 120; return lvl >= D.RIDING.lvl ? s * D.RIDING.speed : s; };
  const gain = (x) => { xp += x; while (lvl < to && xp >= D.XP_TO_LEVEL[lvl]) { xp -= D.XP_TO_LEVEL[lvl]; lvl++; } };
  let guard = 0;
  while (lvl < to && guard++ < 5000) {
    P.level = lvl;
    const avail = Object.keys(D.QUESTS).filter((q) => { const Q = D.QUESTS[q]; return !done.has(q) && !Q.group && !Q.dungeon && Q.lvl <= lvl + 1 && Q.lvl >= lvl - 4 && (Q.pre || []).every((p) => done.has(p) || D.QUESTS[p].lvl < from - 3) && (!Q.faction || Q.faction === fac) && npcAt[Q.giver]; });
    if (!avail.length) { kills[lvl] = (kills[lvl] || 0) + 1; gain(Math.round(G.xpForKill(lvl + 0.5, false))); continue; } // grind
    const q = avail.map((k) => ({ k, d: route(cur, npcAt[D.QUESTS[k].giver]) })).sort((a, b) => a.d - b.d)[0].k, Q = D.QUESTS[q]; done.add(q);
    const giver = npcAt[Q.giver], turnin = npcAt[Q.turnin] || giver; let n = 0, objAt = null;
    for (const o of Q.objs) {
      if (o.type === 'kill') { n += o.n; objAt = objAt || (mobAt[o.mob] || [])[0]; }
      if (o.type === 'collect') { const s = dropFrom(o.item); if (s) { n += Math.ceil(o.n / s.chance); objAt = objAt || (mobAt[s.mob] || [])[0]; } }
    }
    travel += route(cur, giver) + route(giver, objAt || giver) + route(objAt || giver, turnin); talk += TALK; cur = turnin;
    kills[lvl] = (kills[lvl] || 0) + n;
    gain(G.questXp(Q.lvl) + n * Math.round(G.xpForKill(Math.max(lvl, Q.lvl - 1), false)));
  }
  return { free: travel + talk, travel, kills };
}
let bad = 0;
console.log('time to level through each band along the quest path (hours; both factions averaged), ±' + BAND + '% of the class average');
for (const [from, to] of BANDS) {
  const W = ['human', 'orc'].map((r) => walk(r, from, to));
  const rows = CLASSES.map((cls) => { const h = W.map((w) => (w.free + Object.entries(w.kills).reduce((s, [L, n]) => s + n * secsPerKill(cls, +L), 0)) / 3600); return { cls, h: (h[0] + h[1]) / 2 }; });
  const avg = rows.reduce((s, r) => s + r.h, 0) / rows.length, free = (W[0].free + W[1].free) / 2 / 3600, nk = W.map((w) => Object.values(w.kills).reduce((a, b) => a + b, 0));
  console.log(`levels ${from}-${to}: class average ${avg.toFixed(1)} h (travel and talking ${free.toFixed(1)} h, ${Math.round((nk[0] + nk[1]) / 2)} kills)`);
  for (const r of rows.sort((a, b) => a.h - b.h)) { const d = (r.h / avg - 1) * 100, out = Math.abs(d) > BAND; if (out) bad++; // faster first: less time is better
    console.log(`  ${r.cls.padEnd(8)} ${r.h.toFixed(1).padStart(5)} h  ${d >= 0 ? '+' : ''}${d.toFixed(0)}% time${out ? '  outside ±' + BAND + '%' : ''}`); }
}
console.log(bad ? `${bad} class-bands outside ±${BAND}% (a report for the game designer)` : `every class within ±${BAND}% at every band`);
