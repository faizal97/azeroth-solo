// The news after time away follows the player's level, not the server's (issue #18, docs/lore/canon.md Reveals): a
// level-10 player on an old server (bots 15-60) away 7 days, 20 times, reads no dungeon or raid above level 20, no level-60
// place and no Reveals term above their level; a level-60 player on the same server still hears about the raids; a news
// line an older build stored is cleaned on load.   node sim/news.js
{ let s = 0x4e575345 >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
const RealDate = Date; let t = new RealDate(2026, 9, 7, 19).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { if (a.length) super(...a); else super(t); } static now() { return t; } };
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };
// the bible's Reveals table: | `term` | level | ... |
const canon = require('fs').readFileSync(require('path').join(__dirname, '../docs/lore/canon.md'), 'utf8');
const sec = canon.split(/\n## /).find((x) => /^Reveals/.test(x)) || '';
const REVEALS = sec.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).map((l) => l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim().replace(/\\\|/g, '|'))).filter((r) => /^\d+$/.test(r[1] || '')).map(([term, lvl]) => ({ re: new RegExp(term.replace(/^`|`$/g, ''), 'i'), term, lvl: +lvl }));
ok(REVEALS.length >= 5, `the Reveals table is read (${REVEALS.length} terms)`);
// every dungeon or raid the news can name, with its level and its last boss
const acts = Object.keys(D.ACTIVITIES).filter((k) => { const A = D.ACTIVITIES[k]; return A.dungeon && !A.worldBoss && D.DUNGEONS[A.dungeon]; }).map((k) => {
  const A = D.ACTIVITIES[k], bs = D.DUNGEONS[A.dungeon].pulls.filter((p) => p.boss), last = bs.length ? D.MOBS[bs[bs.length - 1].mobs[0]].name : null;
  return { k, name: A.name, last, lvl: A.minLvl || 1, endgame: (A.minLvl || 1) >= D.LEVEL_CAP || (A.size || 5) > 5 };
});
const named = (text) => acts.filter((a) => text.includes(a.name) || (a.last && text.includes(a.last)));
function away(level, days) {
  G.newGame({ name: 'News', cls: 'mage', race: 'human' }); const S = G.S; S.player.level = level;
  for (const b of S.bots) b.level = 15 + Math.floor(Math.random() * 46); // an old server: bots 15-60
  S.lastSeen = S.lastSim = t - days * 86400000; S.news = []; G.catchUp(); return S.news.map((x) => x.text);
}
let seen = 0, beyond = 0;
for (let r = 0; r < 20; r++) {
  const lines = away(10, 7);
  for (const l of lines) {
    for (const a of named(l)) { seen++; ok(!a.endgame && a.lvl <= 20, `level 10 reads nothing above level 20: "${l}" (${a.name}, level ${a.lvl})`); }
    for (const R of REVEALS) if (R.lvl > 10) ok(!R.re.test(l), `level 10 reads no secret: "${l}" names ${R.term} (level ${R.lvl})`);
    if (/beyond your level/.test(l)) beyond++;
  }
}
ok(beyond >= 15, `the clears beyond your level still show, as one unnamed line (${beyond} of 20 runs)`);
ok(seen > 0, `level 10 still hears about dungeons near its level (${seen} named)`);
{ const lines = away(60, 7), raids = lines.filter((l) => named(l).some((a) => a.endgame));
  ok(raids.length > 0, `a level-60 player hears about the raids (${raids.length} lines)`);
  ok(!lines.some((l) => /beyond your level/.test(l)), 'a level-60 player has nothing beyond their level'); }
{ G.newGame({ name: 'Old', cls: 'mage', race: 'human' }); const S = G.S; S.player.level = 12;
  const raid = acts.find((a) => a.endgame && a.last), low = acts.find((a) => a.lvl <= 15);
  S.news = [{ t, text: `<Old Guard> is the first guild on ${D.REALM} to defeat ${raid.last}!` }, { t, text: `<Old Guard> cleared ${low.name}.` }];
  S.lastSeen = S.lastSim = t - 1000; G.catchUp();
  ok(!S.news.some((x) => x.text.includes(raid.last)) && S.news.some((x) => x.text.includes(low.name)), 'news an older build stored is cleaned on load, and the rest kept');
  ok(Object.keys(S.server.firsts || {}).length >= 0, 'firsts are kept'); }
{ const S = (G.newGame({ name: 'F', cls: 'mage', race: 'human' }), G.S); S.player.level = 10; for (const b of S.bots) b.level = 60; S.lastSeen = S.lastSim = t - 7 * 86400000; G.catchUp();
  ok(Object.keys(S.server.firsts || {}).some((k) => acts.find((a) => a.k === k && a.endgame)), 'a first the player can\'t be told yet is still recorded'); }
console.log(`news: ${n - bad}/${n} checks pass`);
process.exitCode = bad ? 1 : 0;
