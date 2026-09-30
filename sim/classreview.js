// Class review (manual, not in the build): how each class plays at levels 10-60 in longer fights (an elite-like
// single target, and a 3-enemy pull), played by a skilled bot. Signals of a boring kit: few different buttons, one
// button taking most of the presses (spam share), no reactions, long stretches with nothing new to learn.
//   node sim/classreview.js
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, E } = globalThis;
const CLASSES = Object.keys(D.CLASSES).filter((c) => !D.CLASSES[c].hidden);
const mobFor = (L) => Object.keys(D.MOBS).find((k) => { const M = D.MOBS[k]; return !M.boss && !M.elite && !M.named && !M.special && M.lvl && M.lvl[0] <= L && M.lvl[1] >= L; }) || 'mangy_wolf';
const longBuff = (a) => { const A = D.ABILITIES[a]; return !A || (A.buff && (A.buff.dur || 0) >= 300); };
function fight(cls, L, adds) {
  G.newGame({ name: 'R', cls, race: cls === 'shaman' || cls === 'hunter' ? 'orc' : 'human' }); const P = G.S.player; P.level = L; P.hp = null; P.res = null;
  P.talents = G.autoTalents(cls, 'dps', L, 0);
  for (const slot of D.GEAR_SLOTS) { if (slot === 'ranged' && !D.CLASSES[cls].ranged) continue; const it = G.genGear(slot, L, L >= 40 ? 3 : 2, slot === 'weapon' ? { wtype: D.CLASSES[cls].weapons[0] } : { atype: D.CLASSES[cls].armorType }); if (G.canUseItem(it, cls)) P.equip[slot] = it; }
  const u = E.charUnit(P, 'ally', 'bot', Date.now()); u.bot = { skill: 0.8, react: 0.4 }; u.role = 'dps';
  const key = mobFor(L), en = adds ? [0, 1, 2].map(() => E.mobUnit(key, L, { hp: 1.2, dmg: 0.45 })) : [E.mobUnit(key, L, { hp: 3, dmg: 0.6 })];
  const C = E.fight([u], en, {});
  const count = {}; let procs = 0;
  for (let i = 0; i < 3000 && !C.over; i++) {
    E.tick(C, 0.1);
    for (const e of C.events) if (e.src === u.uid) { if (e.type === 'proc') procs++; if (e.type === 'ability' && !longBuff(e.ab)) count[e.ab] = (count[e.ab] || 0) + 1; }
    C.events.length = 0;
  }
  const total = Object.values(count).reduce((a, b) => a + b, 0) || 1, top = Object.entries(count).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
  return { buttons: Object.keys(count).length, spam: top[1] / total, top: top[0], ppm: procs / (C.t / 60), secs: C.t, won: C.over === 'win', count };
}
const LV = [10, 20, 30, 40, 50, 60], N = 3;
console.log('Per class: different buttons used · spam share (the top button) · reactions per minute, single target | 3-enemy pull');
for (const cls of CLASSES) {
  const cells = [];
  for (const L of LV) {
    let b = 0, s = 0, p = 0, b3 = 0, s3 = 0, tops = {};
    for (let i = 0; i < N; i++) { const r = fight(cls, L, false), q = fight(cls, L, true); b += r.buttons; s += r.spam; p += r.ppm; b3 += q.buttons; s3 += q.spam; tops[r.top] = (tops[r.top] || 0) + 1; }
    const top = Object.entries(tops).sort((a, c) => c[1] - a[1])[0][0];
    cells.push(`L${L} ${(b / N).toFixed(1)}b ${Math.round((s / N) * 100)}% ${(p / N).toFixed(1)}r | ${(b3 / N).toFixed(1)}b ${Math.round((s3 / N) * 100)}% (${(D.ABILITIES[top] || { name: top }).name})`);
  }
  console.log(cls.padEnd(8) + ' ' + cells.join('  '));
}
// new abilities learned per 10 levels, and the longest stretch with nothing new
console.log('\nNew abilities per 10 levels (1-10, 11-20, ... 51-60) · longest gap with nothing new · talent points from 10');
for (const cls of CLASSES) {
  const lv = D.CLASSES[cls].abilities.map((a) => D.ABILITIES[a].lvl).sort((a, b) => a - b);
  const bands = [0, 0, 0, 0, 0, 0]; for (const l of lv) bands[Math.min(5, Math.floor((l - 1) / 10))]++;
  let gap = 0, prev = 1; for (const l of lv.concat([60])) { gap = Math.max(gap, l - prev); prev = l; }
  console.log(`${cls.padEnd(8)} ${bands.join(' / ')}   longest gap ${gap} levels   total ${lv.length}`);
}
