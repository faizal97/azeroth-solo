// Solo levelling pace by class (issue #4): XP per hour through the game's real solo loop (attack the nearest monster at a
// wild place of your level, rest on food and drink below 60% health or 35% mana, pets, extra pulls, deaths and the run
// back), a skilled player (bot skill 0.8), gear and talents for the level. The level is held fixed so every hour is at
// the same level, with about 2 sec between pulls (loot, tap the next). Normal monsters only: a player levels on those, not
// on the rare. Target (game designer, #4): every class within ±15% of the class average at 10, 25, 40 and 55.
//   node sim/lvpace.js [hours per class and level, default 4] [levels, default 10,25,40,55]
{ let s = 0x5eed1e55 >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
const RealDate = Date; let t = new RealDate(2026, 9, 7, 19).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
const HOURS = +process.argv[2] || 4, LEVELS = (process.argv[3] || '10,25,40,55').split(',').map(Number);
const CLASSES = Object.keys(D.CLASSES).filter((c) => !D.CLASSES[c].hidden); // players can't make a hidden class (the Bard)
const step = (secs) => { G.update(secs); t += secs * 1000; };
// a wild place where this level fights: monsters around the level, no town
const normal = (k) => D.MOBS[k] && !D.MOBS[k].named && !D.MOBS[k].elite && !D.MOBS[k].boss;
const placeFor = (L) => Object.keys(D.PLACES).filter((k) => { const p = D.PLACES[k]; return p.lvl && !p.safe && !p.city && (p.mobs || []).length && p.mobs.every(([m]) => normal(m)) && p.lvl[0] <= L && p.lvl[1] >= L; }).sort((a, b) => Math.abs((D.PLACES[a].lvl[0] + D.PLACES[a].lvl[1]) / 2 - L) - Math.abs((D.PLACES[b].lvl[0] + D.PLACES[b].lvl[1]) / 2 - L))[0];
function hour(cls, L) {
  G.newGame({ name: 'L', cls, race: 'human' }); const S = G.S, P = S.player; S.flags.warModeAsked = true; S.flags.warMode = false; S.flags.noInvites = true;
  P.level = L; P.equip = G.botChar({ name: 'x', cls, race: 'human', level: L, skill: 0.8 }).equip; P.talents = G.autoTalents(cls, 'dps', L, 0); P.role = 'dps';
  P.place = placeFor(L); P.bagsEq = [0, 1, 2, 3].map(() => G.copyItem('woolen_bag')); P.hp = null; P.res = null;
  const food = Object.values(D.ITEMS).filter((i) => i.slot === 'food' && i.cost && (i.lvl || 1) <= L).sort((a, b) => (b.lvl || 1) - (a.lvl || 1))[0], drink = Object.values(D.ITEMS).filter((i) => i.slot === 'drink' && i.cost && (i.lvl || 1) <= L).sort((a, b) => (b.lvl || 1) - (a.lvl || 1))[0];
  let xp = 0, deaths = 0, kills = 0; const end = t + 3600e3;
  while (t < end) {
    if (food && G.countItem(food.id) < 5) G.addItem(G.copyItem(food.id), 20); if (drink && G.countItem(drink.id) < 5) G.addItem(G.copyItem(drink.id), 20);
    if (P.ghostUntil) { step(1); continue; }
    if (G.fight) { if (G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.8, react: 0.4 }; G.pUnit.role = 'dps'; } const lv0 = P.level, x0 = P.xp; step(0.1); if (!G.fight) { if (P.ghostUntil) deaths++; else kills++; xp += P.xp - x0; P.level = L; P.xp = 0; } continue; }
    const v = G.vitals(); if (v.hp < v.maxHp * 0.6 || (v.resType === 'mana' && v.res < v.maxRes * 0.35)) { // rest
      if (v.hp < v.maxHp * 0.6 && !(P.eating && P.eating.until > t)) G.consume('food');
      if (v.resType === 'mana' && v.res < v.maxRes * 0.35 && !(P.drinking && P.drinking.until > t)) G.consume('drink');
      step(1); continue;
    }
    const m = G.placeMobs().find((x) => x.state === 'alive' && normal(x.key)); if (!m) { step(1); continue; } // a player levels on normal monsters, not the rare
    step(2); if (G.fight) continue; // a player loots and taps the next one: about 2 sec between pulls
    G.engage(m.id); if (!G.fight) { step(1); continue; }
  }
  return { xp, deaths, kills };
}
let bad = 0;
for (const L of LEVELS) {
  const rows = CLASSES.map((cls) => { let xp = 0, deaths = 0, kills = 0; for (let h = 0; h < HOURS; h++) { const r = hour(cls, L); xp += r.xp; deaths += r.deaths; kills += r.kills; } return { cls, xph: xp / HOURS, deaths: deaths / HOURS, kills: kills / HOURS }; });
  const avg = rows.reduce((a, r) => a + r.xph, 0) / rows.length;
  console.log(`level ${L} (${placeFor(L)}): class average ${Math.round(avg)} XP an hour`);
  for (const r of rows.sort((a, b) => b.xph - a.xph)) { const d = (r.xph / avg - 1) * 100, out = Math.abs(d) > 15; if (out) bad++;
    console.log(`  ${r.cls.padEnd(8)} ${String(Math.round(r.xph)).padStart(7)} XP/h ${d >= 0 ? '+' : ''}${d.toFixed(0)}%${out ? '  outside ±15%' : ''} · ${r.kills.toFixed(0)} kills, ${r.deaths.toFixed(1)} deaths an hour`); }
}
console.log(bad ? `${bad} class-levels outside ±15% (a report for the game designer, not a gate yet)` : 'every class within ±15%');
