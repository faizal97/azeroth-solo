// Battlegrounds (v10.7): the Battle for Highmoor, a banners battleground for simulated players (his call: bots only
// until live co-op with friends exists). Highmoor is an old Long War battlefield in the Kinloch Highlands; under the
// truce both factions still send fighters there to settle quarrels by the old rule: hold the banners.
// 5 against 5 at your level, from level 10. Each round the scouts give a range for how many enemies head to each banner
// (honest: the true count is inside it; v10.8) and your group picks one: an empty banner is taken, an occupied one is fought over; enemies take the banners they reach alone.
// Every banner you hold scores each round; first to `win` points, or the most after `rounds`, wins.
(function (root) {
  const D = root.D;
  D.BG = D.BG || {};
  D.BG.highmoor = { name: 'The Battle for Highmoor', scene: 'highland_plains', team: 5, rounds: 8, win: 12,
    banners: [['mill', 'the Mill'], ['tower', 'the Watchtower'], ['ford', 'the Ford']],
    // how the other team splits its 5 fighters (the AI picks one each round, weighted by what it holds)
    splits: [[5, 0, 0], [3, 2, 0], [3, 1, 1], [2, 2, 1], [4, 1, 0]],
    honor: { base: 12, perLvl: 1.2, win: 2 }, marksAtCap: { win: 5, loss: 2 } };
  D.ACTIVITIES.bg_highmoor = { name: 'The Battle for Highmoor', bg: 'highmoor', size: 5, minLvl: 10, maxLvl: 60, desc: 'Battleground in the Kinloch Highlands. 5 against 5, at your level. Hold the banners.' };
})(typeof window !== 'undefined' ? window : globalThis);
