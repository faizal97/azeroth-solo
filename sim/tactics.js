// Full dungeon clears through the real run loop with each pull pace and boss plan.
// The player is driven by the bot AI. Reports clear time and wipes, so the choices are real trade-offs.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
// seeded (v10.10, issue #28): the dice and the whole clock are the sim's, so a par rate is the code's, not luck or the hour
{ let s = (0x5eed1e55 ^ (+(process.env.SEED || 0))) >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const RealDate = Date; let t = new RealDate(2026, 9, 7, 19).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
const N = +(process.env.N || 12), ACT = process.env.ACT || 'deadmines';
if (process.env.RR) G.REST_REGEN = +process.env.RR;
if (process.env.FAST_CHAIN) G.PACE.fast.chain = +process.env.FAST_CHAIN; // #33: fast's chance to chain the next trash pull
if (process.env.FAST_BOSS) G.PACE.fast.bossHp = +process.env.FAST_BOSS; // #33: the health fast goes into a boss at
const DG = D.DUNGEONS[D.ACTIVITIES[ACT].dungeon];
if (process.env.TM) DG.trashMult = { hp: DG.trashMult.hp, dmg: +process.env.TM };
if (process.env.BM) DG.bossMult = { hp: DG.bossMult.hp, dmg: +process.env.BM };
function clear(pace, plan, cls) {
  G.newGame({ name: 'T', cls, race: 'human' });
  const S = G.S, P = S.player; const LV = +(process.env.LV || Math.max(10, D.ACTIVITIES[ACT].minLvl || 10) + 1); P.level = LV; P.equip = G.botChar({ name: 'x', cls, race: 'human', level: LV, skill: 0.6 }).equip; P.talents = G.autoTalents(cls, 'dps', LV, 0); P.hp = null; P.res = null;
  S.flags.warModeAsked = true; P.place = D.ACTIVITIES[ACT].where; // you queue from the dungeon's zone
  G.queueFor(ACT); G.acceptPop(); const R = S.run; R.pace = pace; if (plan) R.bossPlan = plan;
  const t0 = t; let guard = 0;
  while (S.run && S.run.phase !== 'done' && guard++ < 400000) {
    if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.7, react: 0.5 }; G.pUnit.role = G.role(); }
    for (const r of (S.run.rolls || [])) if (!r.done && r.player && r.choice == null) { try { G.roll(S.run.rolls.indexOf(r), 'greed'); } catch (e) {} }
    G.update(0.1); t += 100;
  }
  const b = S.run && S.run.bonus || {};
  return { mins: (t - t0) / 60000, wipes: S.run ? S.run.wipes : 99, done: S.run && S.run.phase === 'done', speed: !!b.speed, flawless: !!b.flawless, secs: b.secs };
}
for (const [pace, plan] of (process.env.PACES ? process.env.PACES.split(',').map((p) => [p, null]) : [['careful', null], ['normal', null], ['fast', null], ['normal', 'boss'], ['normal', 'adds']])) {
  let m = 0, w = 0, d = 0, sp = 0, fl = 0; const clean = [], secsList = [];
  for (let i = 0; i < N; i++) { const r = clear(pace, plan, i % 2 ? 'mage' : 'rogue'); secsList.push(r.done ? r.secs : null); m += r.mins; w += r.wipes; d += r.done ? 1 : 0; sp += r.speed; fl += r.flawless; if (!r.wipes) clean.push(r.mins); }
  clean.sort((a, b) => a - b);
  if (process.env.DUMP) console.log('SECS', pace, JSON.stringify(secsList)); // every run's clock, to set par from (issue #28)
  console.log(`${ACT} pace ${pace.padEnd(7)} plan ${String(plan || '-').padEnd(4)} · clear ${(m / N).toFixed(1)} min · wipes/run ${(w / N).toFixed(2)} · no-wipe median ${clean.length ? clean[clean.length >> 1].toFixed(1) : '-'} min · speed bonus ${sp}/${N} · flawless ${fl}/${N} · finished ${d}/${N}`);
}
