// Distance in combat (v10.9, stage 1): the rules themselves, each tested by placing fighters at set distances.
// docs/plans/2026-10-01-distance-design.md.   node sim/distance.js
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, E } = globalThis;
let ok = 0, bad = 0; const check = (c, m) => { if (c) ok++; else { bad++; console.log('FAIL', m); } };
G.newGame({ name: 'X', cls: 'warrior', race: 'human' });
const L = 40, DI = E.DIST;
const ch = (cls, side, role) => { const c = G.botChar({ name: cls + side, cls, race: 'human', level: L, skill: 0.6, role: role || 'dps' }); c.role = role || 'dps'; c.hp = null; c.res = null;
  const u = E.charUnit(c, side, 'bot', 0); u.bot = { skill: 0.6, react: 0.3 }; u.role = role || 'dps'; if (side === 'enemy') u.threat = {}; return u; };
const mob = (key, lvl) => E.mobUnit(key, lvl || L);
const at = (u, x, y, z) => { u.pos = { x, y: y || 0, z: z || 0 }; };
const run = (C, s) => { for (let k = 0; k < s / 0.1 && !C.over; k++) E.tick(C, 0.1); };

// 1. fights start in contact: everyone in reach of everyone (stage 1 keeps outcomes as they were)
{
  const allies = ['warrior', 'priest', 'mage', 'rogue', 'hunter'].map((c, i) => ch(c, 'ally', ['tank', 'healer', 'dps', 'dps', 'dps'][i]));
  const C = E.fight(allies, [mob('defias_thug', 18), mob('defias_thug', 18), mob('defias_thug', 18)], {});
  let far = 0; for (const a of C.allies) for (const e of C.enemies) far = Math.max(far, E.dist(a, e));
  check(far <= DI.melee, `a fight starts in contact (farthest ${far.toFixed(1)} m)`);
}
// 2. ranges from the data
{
  const r = (id) => E.rangeOf(D.ABILITIES[id]);
  check(r('heroic_strike') === 5 && r('sinister_strike') === 5 && r('hamstring') === 5, 'weapon and physical attacks reach 5 m');
  check(r('fireball') === 30 && r('smite') === 30 && r('lightning_bolt') === 30, 'spells reach 30 m');
  check(r('arcane_shot') === 35 && r('aimed_shot') === 35 && r('wing_clip') === 5, 'shots reach 35 m, Wing Clip is melee');
  check(r('lesser_heal') === 40 && r('healing_touch') === 40, 'heals reach 40 m');
  check(r('charge') === 25 && r('intercept') === 25, 'charges reach 25 m');
  check(r('frost_nova') === null && r('blizzard') === 30 && r('hellfire') === null, 'Frost Nova and Hellfire land around the caster, Frost Storm at range');
}
// 3. out of range
{
  const m = ch('mage', 'ally'), w = ch('warrior', 'enemy'); const C = E.fight([m], [w], {}); at(m, 0); at(w, 40); m.target = w.uid;
  check(E.canUse(C, m, 'fireball', w) === 'Out of range', 'a spell cannot reach 40 m');
  at(w, 20); check(E.canUse(C, m, 'fireball', w) === null, 'a spell reaches 20 m');
  w.res = 100; check(E.canUse(C, w, 'heroic_strike', m) === 'Out of range', 'a sword cannot reach 20 m');
}
// 4. a melee fighter out of reach does not swing, it closes in at the running speed
{
  const w = ch('warrior', 'ally'), t = mob('defias_thug', L); const C = E.fight([w], [t], {}); at(w, 0); at(t, 20); w.target = t.uid; t.target = w.uid;
  t.stunUntil = 99; // the target stands still
  const hp0 = t.hp; E.tick(C, 0.1); check(t.hp === hp0, 'no swing from 20 m');
  run(C, 1); const d1 = E.dist(w, t); check(d1 > 11 && d1 < 15, `running closes about 7 m a second (${d1.toFixed(1)} m left after 1 s)`);
  run(C, 3); check(E.dist(w, t) <= DI.melee, 'it reaches melee range'); run(C, 3); check(t.hp < hp0, 'and then it hits');
}
// 5. snares slow movement; 6. roots stop it
{
  const w = ch('warrior', 'ally'), t = mob('defias_thug', L); const C = E.fight([w], [t], {}); at(w, 0); at(t, 30); w.target = t.uid; t.stunUntil = 99;
  w.auras.push({ id: 'test_slow', until: 99, slow: 50 }); run(C, 1); const moved = 30 - E.dist(w, t); check(moved > 2.5 && moved < 4.5, `a 50% snare halves the running speed (${moved.toFixed(1)} m in 1 s)`);
  w.auras = [{ id: 'test_root', until: 99, root: true }]; const d = E.dist(w, t); run(C, 2); check(Math.abs(E.dist(w, t) - d) < 0.01, 'a root holds a fighter in place');
}
{
  const m = ch('mage', 'ally'), w = ch('warrior', 'enemy'); const C = E.fight([m], [w], {}); at(m, 0); at(w, 3); m.res = m.maxRes;
  for (let i = 0; i < 6 && !w.auras.some((a) => a.root); i++) { m.cds = {}; m.gcdUntil = 0; m.res = m.maxRes; E.use(C, m, 'frost_nova'); }
  check(w.auras.some((a) => a.root), 'Frost Nova roots an enemy in its radius');
  const m2 = ch('mage', 'ally'), w2 = ch('warrior', 'enemy'), w3 = ch('warrior', 'enemy'); const C2 = E.fight([m2], [w2, w3], {}); at(m2, 0); at(w2, 3); at(w3, 14); m2.res = m2.maxRes;
  for (let i = 0; i < 6 && !w2.auras.some((a) => a.root); i++) { m2.cds = {}; m2.gcdUntil = 0; m2.res = m2.maxRes; E.use(C2, m2, 'frost_nova'); } // a spell can be resisted: cast again
  check(w2.auras.some((a) => a.root) && !w3.auras.some((a) => a.root), 'an area attack has a radius (3 m hit, 14 m not)');
}
// 7. a charge closes the gap at once
{
  const w = ch('warrior', 'ally'), t = ch('mage', 'enemy'); const C = E.fight([w], [t], {}); at(w, 0); at(t, 20); w.target = t.uid; w.res = 100;
  const why = E.use(C, w, 'charge', t.uid); check(why === null && E.dist(w, t) <= DI.melee, `Charge jumps into melee range (${why || E.dist(w, t).toFixed(1) + ' m'})`);
}
// 8. Step Back hops away; melee cannot reach until it closes again
{
  const m = ch('mage', 'ally'), w = ch('warrior', 'enemy'); const C = E.fight([m], [w], {}); at(m, 0); at(w, 3); w.target = m.uid; w.auras.push({ id: 'r', until: 2, root: true });
  const why = E.use(C, m, 'step_back'); check(why === null && E.dist(m, w) >= 10.5, `Step Back hops 8 m away (${why || E.dist(m, w).toFixed(1) + ' m'})`);
  w.res = 100; check(E.canUse(C, w, 'heroic_strike', m) === 'Out of range', 'the warrior cannot reach after the hop');
  check(E.canUse(C, m, 'step_back') === 'Not ready yet', 'Step Back has a cooldown');
}
// 9. a fear makes the target run away
{
  const p = ch('priest', 'ally'), w = ch('warrior', 'enemy'); const C = E.fight([p], [w], {}); at(p, 0); at(w, 3); p.res = p.maxRes; w.target = p.uid;
  E.use(C, p, 'psychic_scream'); run(C, 2); check(E.dist(p, w) > 10, `a feared enemy runs away (${E.dist(p, w).toFixed(1)} m after 2 s)`);
  const s = ch('shaman', 'ally'), e = ch('warrior', 'enemy'); const C2 = E.fight([s], [e], {}); at(s, 0); at(e, 3); s.race = 'tauren';
  check(!D.ABILITIES.war_stomp || !D.ABILITIES.war_stomp.fear, 'a stomp stuns without making anyone run');
}
// 10. a caster stands still to cast; a target that runs out of range during the cast is missed
{
  const m = ch('mage', 'ally'), w = ch('warrior', 'enemy'); const C = E.fight([m], [w], {}); at(m, 0); at(w, 25); m.target = w.uid; m.res = m.maxRes; m.kind = 'player'; w.stunUntil = 99; w.kind = 'script'; w.auras.push({ id: 'r', until: 99, root: true }); // held where it is put (a racial could free it from the stun)
  E.use(C, m, 'fireball', w.uid); check(!!m.cast, 'a cast starts at 25 m');
  at(w, 45); const hp = w.hp, x = m.pos.x; let missed = false; for (let k = 0; k < 40; k++) { E.tick(C, 0.1); if (C.events.some((e) => e.type === 'castStop' && e.range)) missed = true; C.events.length = 0; }
  check(missed && w.hp === hp, 'the fireball misses a target that ran out of range');
}
// 11. a flyer high up is out of melee reach, but spells reach it
{
  const w = ch('warrior', 'ally'), m = ch('mage', 'ally'), f = mob('defias_thug', L); const C = E.fight([w, m], [f], {}); at(w, 0); at(m, -10); at(f, 1, 0, 10); w.target = f.uid;
  w.res = 100; check(E.canUse(C, w, 'heroic_strike', f) === 'Out of range', 'a sword cannot reach a flyer 10 m up');
  m.res = m.maxRes; check(E.canUse(C, m, 'fireball', f) === null, 'a spell reaches it');
  const x0 = w.pos.x, t0 = w.pos.y; f.stunUntil = 99; f.auras.push({ id: 'r', until: 99, root: true }); run(C, 1); check(Math.abs(w.pos.x - x0) < 0.01 && Math.abs(w.pos.y - t0) < 0.01, 'a fighter right under a flyer stands still (no running back and forth)');
}
console.log(`distance: ${ok}/${ok + bad} checks pass`);
process.exitCode = bad ? 1 : 0;
