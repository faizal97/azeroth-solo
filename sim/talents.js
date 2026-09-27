// What a full talent build is worth: every class at level 20, no talents vs its bot spec (11 points),
// solo against a level-20 mob. Target: roughly 10-15% faster kills or less damage taken, never a jump.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { D, E, G, B } = globalThis;
G.newGame({ name: 'Sim', cls: 'warrior' });
const L = +(process.env.L || 20), N = +(process.env.N || 150), MOB = process.env.MOB || 'harvest_reaper';
function run(cls, role, talents) {
  let win = 0, t = 0, lost = 0;
  const gear = G.botChar({ name: 'g', cls, race: 'human', level: L, skill: 0.6, role }).equip;
  for (let i = 0; i < N; i++) {
    const ch = { name: 'P', cls, level: L, equip: gear, role, talents };
    const p = E.charUnit(ch, 'ally', 'bot', 0); p.bot = { skill: 0.8, react: 0.3 };
    const allies = [p];
    if (cls === 'hunter' || cls === 'warlock') { const pu = E.petUnit(cls === 'hunter' ? 'beast' : 'voidwalker', L, { uid: p.uid, mob: 'mangy_wolf' }); const pb = E.talentMods(ch).pet; if (pb) { pu.maxHp *= 1 + pb / 100; pu.hp = pu.maxHp; pu.dmg = pu.dmg.map((d) => d * (1 + pb / 100)); } allies.push(pu); }
    const C = E.fight(allies, [E.mobUnit(MOB, L)], { soloUid: p.uid });
    const hp0 = p.hp; while (!C.over && C.t < 120) E.tick(C, 0.1);
    if (C.over === 'win') { win++; t += C.t; lost += (hp0 - p.hp) / p.maxHp; }
  }
  return { win: win / N, ttk: t / win, lost: lost / win };
}
for (const cls of Object.keys(D.CLASSES)) {
  const role = 'dps';
  const tl = G.autoTalents(cls, role, L, 0);
  const a = run(cls, role, null), b = run(cls, role, tl);
  const tree = D.TALENTS[cls].find((x) => x.talents.some((t) => tl[t.id])).name;
  console.log(`${cls.padEnd(8)} ${tree.padEnd(14)} ttk ${a.ttk.toFixed(1)}s -> ${b.ttk.toFixed(1)}s (${Math.round((1 - b.ttk / a.ttk) * 100)}% faster) · hp lost ${Math.round(a.lost * 100)}% -> ${Math.round(b.lost * 100)}% · win ${Math.round(a.win * 100)}% -> ${Math.round(b.win * 100)}%`);
}
