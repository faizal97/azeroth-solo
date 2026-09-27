// Every v4 ability (levels 26 and 28) fires in a real fight without errors and does its thing.
require('../src/data.js'); require('../src/engine.js');
const { D, E } = globalThis;
const NEW = { warrior: ['overpower', 'whirlwind'], mage: ['blizzard', 'blast_wave'], priest: ['mind_flay', 'flash_heal'], rogue: ['cheap_shot', 'feint'], paladin: ['hammer_of_wrath', 'holy_wrath'], warlock: ['howl_of_terror', 'soul_fire'], hunter: ['volley', 'aimed_shot'], druid: ['hurricane', 'barkskin'], shaman: ['chain_lightning', 'windfury_weapon'] };
let bad = 0;
for (const [cls, ids] of Object.entries(NEW)) for (const id of ids) {
  const p = E.charUnit({ name: 'P', cls, level: 30, equip: { weapon: D.ITEMS[D.CLASSES[cls].startWeapon] }, role: 'dps' }, 'ally', 'player', 0);
  if (cls === 'warrior' || cls === 'rogue') p.res = 100;
  const mobs = [E.mobUnit('syndicate_mercenary', 30), E.mobUnit('syndicate_mercenary', 30)];
  const C = E.fight([p], mobs, { soloUid: p.uid });
  if (id === 'swipe') E.shiftIn(C, p, 'bear'), p.res = 60;
  if (id === 'kidney_shot' || id === 'rupture') { p.cp = 3; p.cpTarget = mobs[0].uid; }
  if (id === 'heal' || id === 'regrowth' || id === 'lesser_healing_wave' || id === 'flash_heal') p.hp = Math.round(p.maxHp * 0.3);
  const hp0 = mobs.map((m) => m.hp), php = p.hp, res0 = p.res;
  let why; try { why = E.use(C, p, id, id === 'heal' || id === 'regrowth' || id === 'lesser_healing_wave' || id === 'flash_heal' ? p.uid : mobs[0].uid); } catch (e) { why = 'THROW ' + e.message; }
  for (let i = 0; i < 45; i++) E.tick(C, 0.1);
  const ok = !String(why || '').startsWith('THROW') && !why;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${cls.padEnd(8)} ${id.padEnd(18)} ${why || 'cast'} · mob dmg ${hp0.map((h, i) => h - mobs[i].hp).join('/')} · self hp ${p.hp - php} · res ${Math.round(p.res - res0)} · auras ${[...p.auras, ...mobs[0].auras].map((a) => a.id).join(',')}${mobs[0].stunUntil > C.t - 4.5 ? ' · stunned' : ''}`);
  if (!ok) bad++;
}
process.exitCode = bad ? 1 : 0;
