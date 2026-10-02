// Healer capacity (#40): the most incoming damage a healer keeps up with for the whole fight. Healing done can't exceed
// the damage taken, so a weaker item that still heals all of it looks equal; capacity has no cap, so an item's stats and
// its effect both show. For each case the boss's damage is raised by bisection until the group no longer holds:
// capacity = the damage multiplier at which half of the seeded fights are held. The plain item and the effect item are
// measured on the same seeds, so the difference is the item (game designer, #40: wins >= +2%, loses <= -2%).
//   ROOT=~/azeroth-solo-measure node sim/capacity.js [fights per step, default 40] [effect] [case] [class] [level]
//   CASES: groupwide (a blast on everyone; fails when anyone dies) · tankonly / steady / spiky (damage on the tank only;
//   fails when the tank dies; steady = small fast hits, spiky = rare big hits, same damage per second) · long / burst
//   (tank only: a long fight that runs the healer's mana out; a short one, which at capacity still drains it) · free (tank
//   only, the healer's mana topped up every tick: mana never runs out, so only throughput counts)
//   DIAG=1 adds the checks that a case measures the healer: capacity with no healer, mana left at the end, effect fires.
//   SEED=n another fixed seed; UPG=x the full-upgrade scale; SPIKE=swing,mult the spiky shape; TUNE='{...}' try numbers.
// Game code from ROOT (the measuring copy), so this file can be run against any commit.
const ROOT = process.env.ROOT || require('path').join(__dirname, '..');
let seedS = 0; const seed = (n) => { seedS = (0x5eed1e55 ^ Math.imul(n + 1 + (+process.env.SEED || 0) * 100003, 0x9E3779B1)) >>> 0; };
Math.random = () => { seedS = (seedS + 0x6D2B79F5) >>> 0; let x = seedS; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
seed(0);
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
for (const f of ['data', 'engine', 'bots', 'game']) require(ROOT + '/src/' + f + '.js');
const { G, D, E } = globalThis;
if (process.env.TUNE) { const T = JSON.parse(process.env.TUNE); for (const k in T) Object.assign(D.EFFECTS[k], T[k]); }
const N = +process.argv[2] || 40;

// the test piece, as sim/effects.js builds it: a dungeon blue's stat budget, the effect item paying its effect's cost
const SHAPE = { echoing_mend: { slot: 'chest', atype: 'cloth', st: ['int', 'spi'] }, lifeline: { slot: 'legs', atype: 'cloth', st: ['sp', 'int'] }, lavish_mend: { slot: 'legs', atype: 'cloth', st: ['sp', 'int'] }, tethered_mend: { slot: 'hands', atype: 'cloth', st: ['sp', 'int'] }, wellspring: { slot: 'hands', atype: 'cloth', st: ['sp', 'int'] } };
const UPG = +(process.env.UPG || 1); // 1 as dropped; the full-upgrade scale to test the ceiling (#37)
function piece(effect, L, withFx) {
  const P = SHAPE[effect], full = Math.round(L * 0.55 + 2) + 4, budget = withFx ? Math.round(full * (1 - D.effectCost(effect))) : full;
  const stats = {}; let left = budget; P.st.forEach((k, i) => { const v = i === P.st.length - 1 ? left : Math.round(budget / P.st.length); stats[k] = v; left -= v; });
  const armor = Math.round((D.SLOT_ARMOR[P.slot] || 3) * D.GEAR_BASES[P.atype].arm * (L + 2) * 0.9 * 1.22);
  if (UPG !== 1) for (const k in stats) stats[k] = Math.round(stats[k] * UPG);
  return { id: effect + (withFx ? '_fx' : '_plain'), name: 'Test', slot: P.slot, atype: P.atype, q: 3, lvl: L, stats, armor: Math.round(armor * UPG), effect: withFx ? effect : undefined, fxScale: withFx && UPG !== 1 ? UPG : undefined };
}
function unit(cls, role, L, pieces, i) {
  seed(7000 + i); const c = G.botChar({ name: cls + i, cls, race: 'human', level: L, skill: 0.8, role }); c.role = role;
  for (const it of pieces) c.equip[it.slot] = it; c.hp = null; c.res = null;
  const u = E.charUnit(c, 'ally', 'bot', 0); u.bot = { skill: 0.8, react: 0.4, healOnly: role === 'healer' }; u.role = role; return u; // the measured healer only heals (#37)
}
// a boss that never dies in the window (huge health), hitting at damage multiplier m; shape changes how the damage comes
function boss(key, L, m, shape) {
  const b = E.mobUnit(key, L, { hp: 500, dmg: m });
  if (shape === 'steady') { b.swingSpeed = 1.0; b.dmg = b.dmg.map((x) => x * 0.5); } // small hits twice as often
  if (shape === 'spiky') { const [sw, k] = (process.env.SPIKE || '6,3').split(',').map(Number); b.swingSpeed = sw; b.dmg = b.dmg.map((x) => x * k); } // rare big hits, the same damage per second (SPIKE=swing,mult; default a hit 3x as big, a third as often)
  return b;
}
const CASES = {
  groupwide: { secs: 180, group: true, key: 'garr', shape: null }, // a whirling boss: damage on everyone
  tankonly: { secs: 180, key: 'defias_thug', shape: null },
  steady: { secs: 180, key: 'defias_thug', shape: 'steady' },
  spiky: { secs: 180, key: 'defias_thug', shape: 'spiky' },
  long: { secs: 360, key: 'defias_thug', shape: null }, // long enough that the healer's mana runs out at capacity
  burst: { secs: 45, key: 'defias_thug', shape: null }, // short (at capacity it still drains mana: see 'free')
  free: { secs: 180, key: 'defias_thug', shape: null, freeMana: true }, // mana never runs out: the healer's mana is topped up every tick, so only throughput counts
};
// one fight: 1 if held for the whole window
const DIAG = {}; // what a fight did, for the checks that a case measures the healer (mana left, effect fires)
function held(cs, cls, L, pc, m, i, noHealer) {
  const K = CASES[cs], h = unit(cls, 'healer', L, pc, i), t = unit('warrior', 'tank', L, [], i + 1);
  const allies = (K.group ? [t, h, unit('rogue', 'dps', L, [], i + 2), unit('mage', 'dps', L, [], i + 3)] : [t, h]).filter((a) => !noHealer || a !== h);
  seed(i); const C = E.fight(allies, [boss(K.key, L, m, K.shape)], { puller: t });
  while (!C.over && C.t < K.secs) { if (K.freeMana && h.maxRes) h.res = h.maxRes; E.tick(C, 0.1); C.events.length = 0; }
  const ok = K.group ? allies.every((a) => a.hp > 0) : t.hp > 0;
  if (!noHealer) { DIAG.n = (DIAG.n || 0) + 1; DIAG.mana = (DIAG.mana || 0) + (h.maxRes ? h.res / h.maxRes : 0); const fx = ((C.fx || {})[h.uid] || {}); for (const k in fx) DIAG[k] = (DIAG[k] || 0) + (fx[k].amount || 0); }
  return ok ? 1 : 0;
}
// capacity: bisection on the damage multiplier for the point where half the fights are held (same N seeds every step)
function capacity(cs, cls, L, pc, noHealer) {
  let lo = 0.02, hi = 60;
  for (let step = 0; step < 14; step++) { const m = Math.sqrt(lo * hi); let n = 0; for (let i = 0; i < N; i++) n += held(cs, cls, L, pc, m, i, noHealer); if (n / N >= 0.5) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}
// at a given multiplier: the healer's mana left at the end and the effect's fires, averaged over the N fights
function diagAt(cs, cls, L, pc, m) { for (const k in DIAG) delete DIAG[k]; for (let i = 0; i < N; i++) held(cs, cls, L, pc, m, i); const r = { mana: DIAG.mana / DIAG.n }; for (const k in DIAG) if (k !== 'n' && k !== 'mana') r[k] = DIAG[k] / DIAG.n; return r; }
const [eff, cs, cls, L] = [process.argv[3] || 'lifeline', process.argv[4] || 'spiky', process.argv[5] || 'priest', +(process.argv[6] || 40)];
const t0 = Date.now();
const plain = capacity(cs, cls, L, [piece(eff, L, false)]), fx = capacity(cs, cls, L, [piece(eff, L, true)]);
let extra = '';
if (process.env.DIAG) { const alone = capacity(cs, cls, L, [], true), d = diagAt(cs, cls, L, [piece(eff, L, true)], plain);
  extra = ` · no healer ${alone.toFixed(3)} (${((alone / plain) * 100).toFixed(0)}% of plain) · at plain's capacity the effect item ends with ${(d.mana * 100).toFixed(0)}% mana, effect ${JSON.stringify(Object.fromEntries(Object.entries(d).filter(([k]) => k !== 'mana').map(([k, v]) => [k, +v.toFixed(1)])))} a fight`; }
console.log(`${eff} ${cs} ${cls} ${L}${UPG !== 1 ? ' x' + UPG : ''} seed ${+process.env.SEED || 0}: plain ${plain.toFixed(3)} · with effect ${fx.toFixed(3)} · ${((fx / plain - 1) * 100).toFixed(1)}% · ${N} fights a step · ${((Date.now() - t0) / 1000).toFixed(0)} s${extra}`);
