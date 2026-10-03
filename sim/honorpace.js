// Honor per hour (#57, design docs/plans/2026-10-03-honor-ranks-design.md): battlegrounds at the sim's win rate, and War
// Mode kills, at levels 20, 40 and 60, through the game's own code (G.queueFor/acceptPop with the queue's real wait, the
// Battle for Highmoor played to the end by a bot-driven player using sim/battleground.js's smart pick; War Mode on in a
// dangerous place of the level, fighting whatever the game sends). Then the rank ladder: hours to each rank.
//   ROOT=~/azeroth-solo-measure node sim/honorpace.js [battlegrounds per class and level, default 10] [War Mode hours per class and level, default 4]
const ROOT = process.env.ROOT || require('path').join(__dirname, '..');
let seedS = (0x5eed1e55 ^ Math.imul(+(process.env.SEED || 0) + 1, 0x9E3779B1)) >>> 0; Math.random = () => { seedS = (seedS + 0x6D2B79F5) >>> 0; let x = seedS; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
const RealDate = Date; let t = new RealDate(2026, 9, 7, 19).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
for (const f of ['data', 'engine', 'bots', 'game']) require(ROOT + '/src/' + f + '.js');
const { G, D } = globalThis;
const NBG = +process.argv[2] || 10, WMH = +process.argv[3] || 4, LEVELS = process.env.LV ? process.env.LV.split(',').map(Number) : [20, 40, 60];
const CLASSES = Object.keys(D.CLASSES).filter((c) => !D.CLASSES[c].hidden);
const WM_PLACE = { 20: 'the_dead_acre', 40: 'boulderfist_hall', 60: 'blackrock_mountain' };
const smart = (bg) => { const n = D.BG.highmoor.banners.map((x) => x[0]), k = (b) => G.bgScoutRange(bg, b)[1];
  const empty = n.filter((b) => !k(b) && bg.owner[b] !== 'us'), weak = n.slice().sort((a, b) => k(a) - k(b));
  const pair = empty[0] || weak.find((b) => k(b) <= 1) || weak[0];
  const grp = n.filter((b) => b !== pair).sort((a, b) => (k(a) - (bg.owner[a] === 'them' ? 0.5 : 0)) - (k(b) - (bg.owner[b] === 'them' ? 0.5 : 0)))[0] || pair; return [grp, pair]; };
function setup(cls, L, race) {
  G.newGame({ name: 'H', cls, race }); const S = G.S, P = S.player; P.level = L; S.flags.warModeAsked = true;
  P.equip = G.botChar({ name: 'x', cls, race, level: L, skill: 0.6 }).equip; P.talents = G.autoTalents(cls, 'dps', L, 0); P.role = 'dps'; return P;
}
const drive = () => { if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.6, react: 0.5 }; G.pUnit.role = G.role(); } };
function battleground(cls, L, i) {
  const P = setup(cls, L, i % 2 ? 'orc' : 'human'), S = G.S; const t0 = t;
  G.queueFor('bg_highmoor'); let g = 0; while (S.queue && !S.queue.popped && g++ < 100000) { G.update(1); t += 1000; } // the queue's own wait
  G.acceptPop(); const h0 = G.pvpStats().honor;
  while (S.bg && S.bg.phase !== 'done' && g++ < 600000) { if (S.bg.phase === 'choose' && !G.fight) G.bgGo(...smart(S.bg)); drive(); G.update(0.1); t += 100; }
  return { honor: G.pvpStats().honor - h0, secs: (t - t0) / 1000, win: S.bg && S.bg.result === 'win', rounds: S.bg ? S.bg.round : 0 }; // rounds: each one is a choice the player reads and makes
}
function warMode(cls, L, i) {
  const race = i % 2 ? 'orc' : 'human', P = setup(cls, L, race), S = G.S; P.place = WM_PLACE[L];
  Object.assign(S.flags, { warMode: true, nextAmbush: 0 }); const end = t + WMH * 3600e3; let fights = 0, wins = 0;
  while (t < end) {
    if (G.fight) { drive(); const k0 = G.pvpStats().kills; while (G.fight && t < end + 600e3) { drive(); G.update(0.1); t += 100; } fights++; if (G.pvpStats().kills > k0) wins++; P.hp = null; P.res = null; P.ghostUntil = 0; P.place = WM_PLACE[L]; continue; }
    if (S.intruder && Math.random() < 0.5 && G.attackIntruder) G.attackIntruder(); // half the time you strike first, as sim/pvp.js
    G.update(1); t += 1000; if (P.ghostUntil) { P.ghostUntil = 0; P.hp = null; P.place = WM_PLACE[L]; }
  }
  return { honor: G.pvpStats().honor, hours: WMH, fights, wins };
}
const per = {};
for (const L of LEVELS) {
  let h = 0, s = 0, w = 0, n = 0, rd = 0; for (const cls of CLASSES) for (let i = 0; i < NBG; i++) { const r = battleground(cls, L, i); h += r.honor; s += r.secs; w += r.win; rd += r.rounds; n++; }
  let wh = 0, wf = 0, ww = 0, hrs = 0; for (const cls of CLASSES) for (let i = 0; i < 2; i++) { const r = warMode(cls, L, i); wh += r.honor; wf += r.fights; ww += r.wins; hrs += r.hours; }
  per[L] = { bg: h / (s / 3600), bgGame: h / n, bgMin: s / n / 60, bgWin: w / n, rounds: rd / n, wm: wh / hrs, wmFights: wf / hrs, wmWin: wf ? ww / wf : 0 };
  console.log(`level ${L}: battlegrounds ${Math.round(per[L].bg)} Honor an hour (${n} games: ${(per[L].bgWin * 100).toFixed(0)}% won, ${per[L].bgMin.toFixed(1)} min a game with the queue, ${Math.round(per[L].bgGame)} Honor a game, ${per[L].rounds.toFixed(1)} rounds) · War Mode ${Math.round(per[L].wm)} Honor an hour (${per[L].wmFights.toFixed(1)} fights an hour, ${(per[L].wmWin * 100).toFixed(0)}% won, at ${WM_PLACE[L]}, ${hrs} hours)`);
}
console.log('JSON ' + JSON.stringify(per));
const R = D.HONOR_RANKS.map((r) => r.at); console.log('ladder now: ' + R.join(' / ') + ' · hours of battlegrounds to each rank at 20 / 40 / 60: ' + R.map((x, i) => `rank ${i + 1}: ${LEVELS.map((L) => (x / per[L].bg).toFixed(1)).join(' / ')}`).join(' · '));
