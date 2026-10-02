// Item effects (v10.10, design docs/plans/2026-10-02-item-effects-design.md §4): each effect item against a plain item for
// the same slot, level and quality (the plain one keeps the stats the effect paid for), at levels 20, 40 and 60, in a case
// where it should win and one where it should lose. Both variants fight on the same seeds, so the difference is the
// effect. Pass bars, written first (design mindset §5): wins >= +2% in a wins case, loses <= -2% in a loses case, at most
// +8% in its best case, and the best mix of different effects in one case at most +10% over plain gear.
//   node sim/effects.js [fights per case, default 200]
let seedS = 0; const seed = (n) => { seedS = (0x5eed1e55 ^ Math.imul(n + 1, 0x9E3779B1)) >>> 0; };
Math.random = () => { seedS = (seedS + 0x6D2B79F5) >>> 0; let x = seedS; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
seed(0);
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, E } = globalThis;
const N = +process.argv[2] || 200;
if (process.env.TUNE) { const T = JSON.parse(process.env.TUNE); for (const k in T) Object.assign(D.EFFECTS[k], T[k]); } // try numbers without editing the data
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
const pct = (a, b) => (b ? (a / b - 1) * 100 : 0);

// a test piece at level L in the effect item's slot: plain (the full budget) or with the effect (it pays its effect's cost)
const proto = { opening_cut: 'cutpurse_gloves', echoing_mend: 'ashen_mercy_robe', turning_guard: 'sandguard_girdle', stubborn_blood: 'fenheart_band' };
function piece(effect, L, withFx) {
  const P = D.ITEMS[proto[effect]], full = Math.round(L * 0.55 + 2) + 4, budget = withFx ? Math.round(full * (1 - D.effectCost(effect))) : full; // a dungeon blue's budget
  const keys = Object.keys(P.stats), stats = {}; let left = budget; keys.forEach((k, i) => { const v = i === keys.length - 1 ? left : Math.round(budget / keys.length); stats[k] = v; left -= v; });
  const armor = P.slot === 'finger' ? 0 : Math.round((D.SLOT_ARMOR[P.slot] || 3) * (P.atype ? D.GEAR_BASES[P.atype].arm : 0.3) * (L + 2) * 0.9 * 1.22);
  return Object.assign({}, P, { id: proto[effect] + (withFx ? '' : '_plain'), lvl: L, stats, armor, effect: withFx ? effect : undefined });
}
function unit(cls, role, L, pieces, i) {
  seed(7000 + i); const c = G.botChar({ name: cls + i, cls, race: 'human', level: L, skill: 0.8, role }); c.role = role;
  for (const it of pieces) c.equip[it.slot] = it; c.hp = null; c.res = null;
  const u = E.charUnit(c, 'ally', 'bot', 0); u.bot = { skill: 0.8, react: 0.4 }; u.role = role; return u;
}
const mob = (key, L, mult) => E.mobUnit(key, L, mult);
const run = (C, secs) => { while (!C.over && C.t < secs) { E.tick(C, 0.1); C.events.length = 0; } return C; };

// the cases: each returns one number per fight, higher is better
const CASES = {
  // damage: a pack of three normal monsters (damage per second until they die) / a long boss (damage in 3 min, it hits nothing)
  trash: (fx, L, i) => { const me = unit(fx.cls, 'dps', L, fx.pieces, i); seed(i); const C = E.fight([me], [0, 1, 2].map(() => mob('defias_thug', L, { hp: 1.4, dmg: 0.35 })), { puller: me }); run(C, 120); const d = (C.tot && C.tot[me.uid] || {}).dmg || 0; return d / Math.max(1, C.t); },
  boss: (fx, L, i) => { const me = unit(fx.cls, 'dps', L, fx.pieces, i); seed(i); const C = E.fight([me], [mob('defias_thug', L, { hp: 60, dmg: 0 })], { puller: me }); run(C, 180); return (C.tot && C.tot[me.uid] || {}).dmg || 0; },
  // healing: group-wide damage (a boss whose blast hits everyone) / damage on the tank only; healing done in 2 min
  // (a long fight with more damage than the healer's mana can cover: healing done is healing per mana)
  groupwide: (fx, L, i) => { const h = unit(fx.cls, 'healer', L, fx.pieces, i), t = unit('warrior', 'tank', L, [], i + 1), d1 = unit('rogue', 'dps', L, [], i + 2), d2 = unit('mage', 'dps', L, [], i + 3); seed(i); const C = E.fight([t, h, d1, d2], [mob('garr', L, { hp: 200, dmg: 1.6 })], { puller: t }); run(C, 240); return (C.tot && C.tot[h.uid] || {}).heal || 0; },
  tankonly: (fx, L, i) => { const h = unit(fx.cls, 'healer', L, fx.pieces, i), t = unit('warrior', 'tank', L, [], i + 1), d1 = unit('rogue', 'dps', L, [], i + 2), d2 = unit('mage', 'dps', L, [], i + 3); seed(i); const C = E.fight([t, h, d1, d2], [mob('defias_thug', L, { hp: 200, dmg: 4 })], { puller: t }); run(C, 240); return (C.tot && C.tot[h.uid] || {}).heal || 0; },
  // tanking: how long a tank lasts alone against a melee boss / a caster boss
  meleeboss: (fx, L, i) => { const t = unit(fx.cls, 'tank', L, fx.pieces, i); seed(i); const C = E.fight([t], [mob('defias_thug', L, { hp: 200, dmg: 2.2 })], { puller: t }); run(C, 300); return C.t; },
  casterboss: (fx, L, i) => { const t = unit(fx.cls, 'tank', L, fx.pieces, i); seed(i); const C = E.fight([t], [mob('frostmane_seer', L, { hp: 200, dmg: 2.2 })], { puller: t }); run(C, 300); return C.t; },
  // survival: solo against a tough pull (1 won, 0 lost) / damage done in a well-healed group
  // (solo: how long you last in a pull you can't win, the bad pull that a survival effect is for)
  solo: (fx, L, i) => { const me = unit(fx.cls, 'dps', L, fx.pieces, i); seed(i); const C = E.fight([me], [mob('defias_thug', L + 1, { hp: 50, dmg: 1.4 }), mob('defias_thug', L, { hp: 50, dmg: 1.4 })], { puller: me }); run(C, 240); return C.t; },
  healed: (fx, L, i) => { const me = unit(fx.cls, 'dps', L, fx.pieces, i), t = unit('warrior', 'tank', L, [], i + 1), h = unit('priest', 'healer', L, [], i + 2); seed(i); const C = E.fight([t, me, h], [mob('garr', L, { hp: 30, dmg: 0.5 })], { puller: t }); run(C, 120); return (C.tot && C.tot[me.uid] || {}).dmg || 0; },
};
const PLAN = [
  { effect: 'opening_cut', classes: ['rogue', 'warrior'], wins: ['trash'], loses: ['boss'] },
  { effect: 'echoing_mend', classes: ['priest', 'druid'], wins: ['groupwide'], loses: ['tankonly'] },
  { effect: 'turning_guard', classes: ['warrior', 'paladin'], wins: ['meleeboss'], loses: ['casterboss'] },
  { effect: 'stubborn_blood', classes: ['warrior', 'rogue'], wins: ['solo'], loses: ['healed'] },
];
const measure = (cs, cls, L, pieces) => { let s = 0; for (let i = 0; i < N; i++) s += CASES[cs]({ cls, pieces }, L, i); return s / N; };
const all = [];
for (const P of PLAN) {
  const res = { wins: [], loses: [] };
  for (const kind of ['wins', 'loses']) for (const cs of P[kind]) for (const cls of P.classes) for (const L of [20, 40, 60]) {
    const plain = measure(cs, cls, L, [piece(P.effect, L, false)]), withFx = measure(cs, cls, L, [piece(P.effect, L, true)]), d = pct(withFx, plain);
    res[kind].push({ cs, cls, L, d }); all.push({ effect: P.effect, cs, cls, L, d });
  }
  const best = Math.max(...res.wins.map((x) => x.d), ...res.loses.map((x) => x.d)), win = Math.max(...res.wins.map((x) => x.d)), lose = Math.min(...res.loses.map((x) => x.d));
  console.log(`${D.EFFECTS[P.effect].name.padEnd(15)} wins ${res.wins.map((x) => `${x.cs} ${x.cls} ${x.L}: ${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)}%`).join(', ')}`);
  console.log(`${''.padEnd(15)} loses ${res.loses.map((x) => `${x.cs} ${x.cls} ${x.L}: ${x.d >= 0 ? '+' : ''}${x.d.toFixed(1)}%`).join(', ')}`);
  ok(win >= 2, `${P.effect} wins somewhere: at least +2% in a wins case (best ${win.toFixed(1)}%)`);
  ok(lose <= -2, `${P.effect} loses somewhere: at least -2% in a loses case (worst ${lose.toFixed(1)}%)`);
  ok(best <= 8, `${P.effect} is not too strong: at most +8% in its best case (${best.toFixed(1)}%)`);
}
// the ceiling holds: two different effects in the case that suits both (a damage dealer levelling solo with Opening Cut and
// Stubborn Blood) stay within +10% of plain gear
for (const L of [20, 40, 60]) {
  const plain = measure('solo', 'rogue', L, [piece('opening_cut', L, false), piece('stubborn_blood', L, false)]);
  const mixed = measure('solo', 'rogue', L, [piece('opening_cut', L, true), piece('stubborn_blood', L, true)]), d = pct(mixed, plain);
  console.log(`mixed (Opening Cut + Stubborn Blood), solo rogue ${L}: ${d >= 0 ? '+' : ''}${d.toFixed(1)}%`);
  ok(d <= 10, `the best mix of effects stays within +10% of plain gear (solo rogue ${L}: ${d.toFixed(1)}%)`);
}
console.log(bad ? `${bad} failures` : 'effects sim OK');
process.exit(bad ? 1 : 0);
