// Can every class beat each level-60 rare? (#43, design docs/plans/2026-10-03-rare-hunts-design.md §4) Level 60 in a full
// set of level-60 dungeon blues (as sim/consumables.js), skill 0.8, the pet a player has; each class against each rare
// (every named mob of level 58+, not a world boss): ALONE for a non-elite, with a WORLD PARTY OF THREE for an elite (the
// player and two bots made as the game makes them: B.makeBot, the party's role rule, G.botChar). Win: the rare dies.
// Target: at least 8 in 10 for every class and rare. Only the rare is in the fight (no extra pulls).
//   ROOT=~/azeroth-solo-measure node sim/rarehunt.js [fights per class and rare, default 200]
const ROOT = process.env.ROOT || require('path').join(__dirname, '..');
let seedS = 0; const seed = (n) => { seedS = (0x5eed1e55 ^ Math.imul(n + 1 + (+process.env.SEED || 0) * 100003, 0x9E3779B1)) >>> 0; };
Math.random = () => { seedS = (seedS + 0x6D2B79F5) >>> 0; let x = seedS; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
seed(0);
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
const RealDate = Date; let t = new RealDate(2026, 9, 7, 19).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
for (const f of ['data', 'engine', 'bots', 'game']) require(ROOT + '/src/' + f + '.js');
const { G, D, E, B } = globalThis;
const N = +process.argv[2] || 200, CAP = 600, TARGET = 0.8;
const CLASSES = Object.keys(D.CLASSES).filter((c) => !D.CLASSES[c].hidden);
const RARES = Object.keys(D.MOBS).filter((k) => { const m = D.MOBS[k]; return m.named && !m.boss && m.lvl && m.lvl[1] >= 58; });
const partyRole = (cls) => (cls === 'warrior' ? 'tank' : cls === 'priest' ? 'healer' : ['paladin', 'druid', 'shaman'].includes(cls) ? (Math.random() < 0.5 ? 'healer' : 'dps') : 'dps'); // game.js partyRole
function player(cls) {
  G.newGame({ name: 'R', cls, race: 'human' }); const P = G.S.player; P.level = 60; G.S.flags.warModeAsked = true;
  const wpn = G.botChar({ name: 'x', cls, race: 'human', level: 60, skill: 0.8 }).equip;
  P.equip = { weapon: wpn.weapon }; if (wpn.ranged) P.equip.ranged = wpn.ranged; if (wpn.offhand) P.equip.offhand = wpn.offhand;
  for (const sl of D.GEAR_SLOTS) if (!P.equip[sl] && !['weapon', 'ranged', 'offhand'].includes(sl)) P.equip[sl] = G.genGear(sl, 60, 3, { atype: D.CLASSES[cls].armorType });
  P.talents = G.autoTalents(cls, 'dps', 60, 0); P.role = 'dps';
  // the pet a level-60 player has (as sim/lvpace.js): a Warlock's Voidwalker, a Hunter's tamed beast of its level
  if (cls === 'warlock') P.pet = { type: 'voidwalker', name: 'Pet', hp: null };
  if (cls === 'hunter') { const b = Object.keys(D.MOBS).filter((k) => D.MOBS[k].family === 'beast' && !D.MOBS[k].named && !D.MOBS[k].elite && !D.MOBS[k].boss && D.MOBS[k].lvl[0] <= 60).sort((a, c) => D.MOBS[c].lvl[0] - D.MOBS[a].lvl[0])[0]; P.pet = { type: 'beast', mob: b, name: D.MOBS[b].name, hp: null }; }
  P.hp = null; P.res = null; return P;
}
function fight(cls, key, i) {
  seed(i); const P = player(cls), elite = !!D.MOBS[key].elite;
  const pu = E.charUnit(P, 'ally', 'player', t); pu.kind = 'bot'; pu.bot = { skill: 0.8, react: 0.4 }; pu.role = 'dps';
  const allies = [pu], pet = G.petUnitFor ? G.petUnitFor(pu) : null; if (pet) allies.push(pet);
  const party = [];
  if (elite) for (let j = 0; j < 2; j++) { const b = B.makeBot(1 + Math.floor(Math.random() * 1e6), new Set(), { level: 60 }); b.role = partyRole(b.cls); const ch = G.botChar(b); const u = E.charUnit(ch, 'ally', 'bot', t); u.bot = { skill: b.skill, react: 0.9 - 0.6 * b.skill }; u.role = b.role; allies.push(u); party.push(b.cls + '/' + b.role); }
  const mu = E.mobUnit(key, 60); const C = E.fight(allies, [mu], { soloUid: pu.uid, puller: pu });
  let low = 1; while (!C.over && C.t < CAP) { E.tick(C, 0.1); C.events.length = 0; low = Math.min(low, Math.max(0, pu.hp) / pu.maxHp); }
  return { win: mu.hp <= 0, secs: C.t, died: pu.hp <= 0, low, party }; // low: the player's lowest health in the fight, how close it was
}
console.log(`level-60 rares (${RARES.length}): ${N} fights per class and rare, alone for a non-elite, a world party of three for an elite; target ${TARGET * 100}% wins`);
let bad = 0; const rows = [];
for (const key of RARES) {
  const M = D.MOBS[key], cells = [];
  for (const cls of CLASSES) { let w = 0, s = 0, d = 0, lo = 0; for (let i = 0; i < N; i++) { const r = fight(cls, key, 1000 * CLASSES.indexOf(cls) + i); w += r.win; s += r.secs; d += r.died; lo += r.low; } const rate = w / N; if (rate < TARGET) bad++; cells.push({ cls, rate, secs: s / N, died: d / N, low: lo / N }); }
  console.log(`${M.name} (${key}, level ${M.lvl[1]}, ${M.elite ? 'elite: world party of 3' : 'non-elite: alone'})`);
  for (const c of cells) console.log(`  ${c.cls.padEnd(8)} ${(c.rate * 100).toFixed(0).padStart(3)}% wins · ${c.secs.toFixed(0)} s a fight · player died ${(c.died * 100).toFixed(0)}% · lowest health ${(c.low * 100).toFixed(0)}% on average${c.rate < TARGET ? '  under 8 in 10' : ''}`);
}
console.log(bad ? `${bad} class-rare pairs under 8 in 10` : 'every class beats every level-60 rare at least 8 in 10');
