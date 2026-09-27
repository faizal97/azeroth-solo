// World PvP end to end: War Mode on, wait for an enemy player to show up, then either let them attack
// or attack first. The player side is driven by the bot AI at "decent player" skill with level-appropriate gear.
// Target: every class wins most ambushes (~60-85%), nobody is hopeless, no crashes.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let t = Date.now(); Date.now = () => t;
const L = +(process.env.L || 12), N = +(process.env.N || 50);
let bad = 0, passing = 0, total = 0;
for (const cls of Object.keys(D.CLASSES)) {
  let w = 0, n = 0, first = 0;
  for (let k = 0; k < N; k++) {
    G.newGame({ name: 'T', cls, race: cls === 'shaman' ? 'orc' : 'human' });
    const S = G.S, P = S.player;
    P.level = L; P.equip = G.botChar({ name: 'x', cls, race: P.race, level: L, skill: 0.6, role: 'dps' }).equip; P.hp = null; P.res = null;
    P.place = P.race === 'orc' ? 'far_watch' : 'saldean_farm';
    Object.assign(S.flags, { warModeAsked: true, warMode: true, nextAmbush: 0 });
    let guard = 0;
    while (!S.intruder && guard++ < 400000) { G.update(1); t += 1000; }
    if (!S.intruder) continue;
    total++;
    if (k % 2) { G.attackIntruder(); first++; } // half the time you strike first
    while (!G.fight && S.intruder && guard++ < 800000) { G.update(1); t += 1000; }
    if (!G.fight) { passing++; continue; }
    n++;
    G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.75, react: 0.45 }; G.pUnit.role = ['priest', 'druid'].includes(cls) ? 'healer' : 'dps';
    while (G.fight && guard++ < 1200000) { G.update(0.1); t += 100; }
    if (P.pvp && P.pvp.kills) w++;
  }
  const wr = n ? w / n : 0; if (n && (wr < 0.4 || wr > 0.95)) bad++; // ~45 fights per class swing about ±10 points, so the band is wide
  console.log(`${cls.padEnd(8)} L${L} wins ${String(Math.round(wr * 100)).padStart(3)}% of ${n} fights`);
}
console.log(`enemies that only passed through: ${passing}/${total}`);
process.exitCode = bad ? 1 : 0;
