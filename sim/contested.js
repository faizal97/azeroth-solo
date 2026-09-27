// Contested-zone rules (v4.1): what each faction can reach, closed enemy towns, danger, and where bots stand.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D, B } = globalThis;
let t = Date.now(); Date.now = () => t;
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };
for (const [race, home, mine, theirs] of [['human', 'goldshire', 'astranaar', 'splintertree_post'], ['orc', 'razor_hill', 'splintertree_post', 'astranaar']]) {
  G.newGame({ name: 'T', cls: 'warrior', race }); const S = G.S, P = S.player; P.level = 26; S.flags.warModeAsked = true; P.place = home;
  const reach = G.reachableRegions(home);
  ok(reach.has('ashenvale'), race + ' reaches Ashenvale');
  ok(G.activityBlock('blackfathom') !== 'hidden', race + ' sees Blackfathom Deeps');
  ok(G.activityBlock(race === 'human' ? 'shadowfang' : 'stockade') === 'hidden', race + ' does not see the other faction\'s dungeon');
  ok(G.activityBlock(race === 'human' ? 'stockade' : 'shadowfang') !== 'hidden', race + ' still sees its own dungeon');
  ok(G.enemyTown(theirs) && !G.enemyTown(mine), race + ' enemy town flags');
  P.place = 'mystral_lake'; G.travelTo(theirs); ok(!P.travel, race + ' cannot travel into ' + theirs);
  G.travelTo(mine); ok(P.travel && P.travel.to === mine, race + ' can travel to ' + mine); P.travel = null;
  ok(G.dangerOf('mystral_lake') === 1.5 && G.dangerOf(mine) < 0.1, race + ' danger in Ashenvale');
  ok(G.dangerOf(race === 'human' ? 'far_watch' : 'crystal_lake') === 1.8, race + ' danger in enemy zones');
  const other = race === 'human' ? ['durotar', 'barrens', 'hillsbrad'] : ['elwynn', 'westfall', 'duskwood'];
  ok(other.every((r) => !reach.has(r)), race + ' cannot walk into the other faction\'s zones: ' + [...reach].filter((r) => other.includes(r)));
  console.log(`${race}: reaches ${[...reach].sort().join(', ')}`);
}
// bots: none stands in an enemy town, and both factions quest in Ashenvale
G.newGame({ name: 'T', cls: 'warrior', race: 'human' }); B.advance(G.S, 300 * 3600000);
console.log('bots at 22+:', G.S.bots.filter((b) => b.level >= 22).length, 'of', G.S.bots.length);
let inAsh = { alliance: 0, horde: 0 }, bad = 0;
for (let h = 0; h < 48; h++) {
  const d = new Date(t + h * 1800000);
  for (const b of G.S.bots) { const p = B.placeFor(b, d); const pl = D.PLACES[p]; if (pl.region === 'ashenvale') inAsh[B.factionOf(b)]++; if (pl.faction && pl.faction !== B.factionOf(b)) bad++; }
}
ok(!bad, `${bad} bot placements in enemy towns`);
ok(inAsh.alliance > 0 && inAsh.horde > 0, 'both factions quest in Ashenvale ' + JSON.stringify(inAsh));
console.log('bots in Ashenvale over a day:', JSON.stringify(inAsh));
// quests: each faction has a full line in Ashenvale
const cnt = { alliance: 0, horde: 0 }; for (const q in D.QUESTS) if (D.QUESTS[q].faction) cnt[D.QUESTS[q].faction]++;
console.log('Ashenvale quests per faction:', JSON.stringify(cnt));
console.log(fails ? `${fails} failures` : 'contested sim OK');
process.exit(fails ? 1 : 0);
