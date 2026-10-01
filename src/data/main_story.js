// The main story's quests (v10.8): a quest whose ending plays a main-story scene, and the quests that lead to it in the
// same chain. They carry `main: true`, and their quest marks sit on a dark-red crest (ui.js qmarkSrc) wherever marks
// show. tools/validate.js fails any main-story scene whose quest is not marked; new story quests can also set
// `main: true` in their own data.
(function (root) {
  const D = root.D;
  D.MAIN_STORY = [
    'report_gryan', 'peoples_militia', 'hidden_enemies', 'venture_contracts', 'quarry_ledgers', // Chapter 1
    'defias_brotherhood', 'galardell_scout', 'whelp_scales', 'whelp_hunt', 'durnholde_scout', 'syndicate_badges', 'angerfang_scout', 'whelp_collars', // Chapter 2
    'venture_ledgers_a', 'venture_ledgers_h', 'a_syndicate', 'a_documents', 'h_syndicate', 'h_documents', // Chapter 3
    'bsa_blackrock', 'bsh_blackrock', 'bsh_broodlings', 'brd_jail_break', 'st_ledger_a', 'st_ledger_h', // Chapter 5
  ];
  for (const q of D.MAIN_STORY) if (D.QUESTS[q]) D.QUESTS[q].main = true;
  // the chapter a main-story quest belongs to, from its level: the Prologue below 10, then one chapter per ten levels
  D.CHAPTER_NAMES = ['The Borrowed Peace', 'Debts Come Due', 'The Collector\'s Fleet', 'The Audit', 'Cinderpeak Rising', 'Balancing the Books', 'The Creditor'];
  D.chapterOf = (lvl) => (lvl < 10 ? 0 : Math.min(6, Math.floor(lvl / 10)));
})(typeof window !== 'undefined' ? window : globalThis);
