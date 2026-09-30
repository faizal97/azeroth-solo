# Game progress review: does every player have something to do?

2026-09-30, after v10.5.0. Measured from the data (quests, activities and places per level band, quest XP against the
XP needed, and each system's unlock level), not from memory. Verdicts: **good**, **ok**, **gap**.

## The numbers

| Levels | Quests | Legend quests | Dungeons | Raids | Wanted | Wild places | Quest XP / XP needed |
|---|---|---|---|---|---|---|---|
| 1-5 | 40 | 0 | 0 | 0 | 0 | 16 | about 65% |
| 6-10 | 82 | 0 | 1 | 0 | 5 | 22 | about 115% |
| 11-20 | 119 | 2 | 3 | 0 | 5 | 29 | **about 59%** |
| 21-30 | 184 | 3 | 7 | 0 | 6 | 38 | 96-128% |
| 31-40 | 96 | 6 | 4 | 0 | 2 | 18 | about 96% |
| 41-50 | 78 | 2 | **2** | 0 | 2 | 16 | **about 88%** |
| 51-59 | 105 | 1 | 3 | 0 | 4 | 26 | about 121% |
| 60 | 63 | 1 | 4 | 3 | 3 | 18 | (level cap) |

Quest XP here is a rough count and undercounts: the levelling sim (`sim/zoneflow.js`) gives 96-100% for 10-20, 30-40
and 40-50. Unlocks: War Mode ambushes at
6, looking-for-group chat at 8, guild invites from 5, professions at 5 (Journeyman at 10), talents at 10, riding at 40,
Trials, gear upgrades and raids at 60; the wardrobe, Friends, bounty boards and the Roulette as soon as they apply.

## Phase by phase

1. **New player (1-5): ok.** The intro scene, first-hour tips, quest marks and helpers (who takes a quest, where its
   objectives are), a story beat at 5, reaction cards the first time a mechanic fires. Gap: tips switch off for anyone
   who already has a character above 5, so a friend's second account can miss them. The Journey tab now opens on "Open
   to you now" (quests, talents, group content at your level, the next unlock), each row going to its screen.
2. **Early (6-20): good (corrected).** Plenty unlocks (dungeons, Wanted, ambushes, guilds, professions, talents at 10,
   story every 3-5 levels, the hooded stranger at 17). The first count said quests cover 59% of the XP here; the real
   levelling sim (`sim/zoneflow.js`, every solo quest done as it opens) says 98-100%, with 27-31 quests left over at 20.
3. **Early-mid (21-30): good.** The richest band: 184 quests, 7 dungeons, Widya's questline (22-40), the second class
   reactions (24-34), story scenes.
4. **Late-mid (31-40): ok.** Different from early-mid through Lyveus (from 37), Widya's finale, the second reactions and
   the riding goal at 40; but fewer dungeons (4) and Wanted (2).
5. **Late (41-59): good (after the fixes).** 41-50 was the thinnest band (2 dungeons and 2 Wanted, and nothing at all at
   40-43). Now: the Coinworks (40-44, a Chapter 4 story tie in Sirocco), the Dune Temple and the Gemfall Caves, and four
   Wanted (Ossa Drywell 40-43, Captain Hookhand 43-46, Old Rotmaw 44-47, Lord Nazzir 47-50). 51-59 is well stocked. The
   pull to 60 is the story's last chapters, and the Trials tab already shows "opens at 60" with this month's dungeons.
   Bromli's Legend questline (44-55) is next and adds more to this band.
6. **Fresh 60: good.** 63 level-60 quests (Saltmarsh, Veshmira's chain, the Drowned Crown), 4 level-60 dungeons, Trials
   from Trial 1, Mentor Marks from every level-60 clear feeding gear upgrades, the wardrobe.
7. **Early endgame: good.** Three raids (Magma Throne, Veshmira's Lair, Tidecrown), climbing Trials with Omens, the realm
   leaderboard and month titles, Trial titles at 10/15/20, upgrades toward the ceiling.
8. **Late endgame: ok.** The ceiling is close, Trial 15-17, top-10 chases. The Journey tab's Progress shows how far you
   are (clears, worn gear against the ceiling, best Trial). Gap: the planned top tier (Hard raids, the featured raid) is
   not built.
9. **Fully maxed: gap.** Monthly Trials (a new mix, a new rank each month), alts (heirlooms, the shared wardrobe and
   Marks), collecting looks and titles. Not built yet: Hard raids and the featured raid, Trials stage 4 (the Trialsworn
   looks, bot Trial groups in chat), world bosses, battlegrounds, hand-made seasonal extras. Tier 1 and 3 Omens have two
   each, so weeks repeat a pattern soon.

## Where the gaps are

- **Levelling:** quests carry every band (zoneflow: 96-100%); 40-50 runs out of quests right at 50. The soft spot is
  41-50 group content, now fixed (3 dungeons, 4 Wanted, no level without group content).
- **The top:** phases 8 and 9 need the already-designed Hard raids and featured raid, and Trials stage 4.
- **Guidance:** done. The Journey tab has "Open to you now", Progress, and one row per story or collection screen.

Sims to run before fixing levelling: `node sim/v191.js` style checks for 11-20 and 41-50 quest share, so the fix adds
the right amount.
