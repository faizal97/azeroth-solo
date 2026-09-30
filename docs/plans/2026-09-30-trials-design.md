# Trials: design

2026-09-30. Agreed with Faizal. Step 3 of docs/plans/2026-09-30-horizontal-progression-design.md.

## 1. Omens (agreed)

Each tier tests one lever, so players learn to read the week: what to kill, how fast to go, how to prepare. No class
utility counter yet (no interrupts or dispels, and you cannot choose which classes join); "bring the right class" is a
possible fourth tier once co-op exists, so the tier list stays open.

**Tier 1, from Trial 2, what to kill first:** Frenzied (below 30% health: +50% damage; mark and finish, stun),
Rallying (a death heals the pull 20% and makes it hit harder; burn the boss), Swarming (an extra enemy per pull, more
boss adds; adds first, stuns), Hardened (bosses +30% health; burn with elixirs).

**Tier 2, from Trial 5, how fast to go:** Volatile (dying enemies explode after 3 s; careful pace), Hasty (par 20%
shorter, enemies 10% less health; fast pace), Restless (long rests draw a patrol; fast pace).

**Tier 3, from Trial 8, how to prepare:** Unstoppable (no stuns or sleeps, enemies +10% damage; defensive talents,
Stamina and armour elixirs), Festering (hits stack a poison; healing potions, cleanse racials, healing talents),
Draining (spells cost 50% more; mana potions, Spirit elixirs, careful pace).

One from each tier per Omen period (36 combinations); periods start on the 1st, 8th, 15th and 22nd at local midnight,
so a month holds four (the one at month's end runs a few days longer). New engine hooks: on-death effects, enrage threshold, extra enemies,
stun immunity, poison on hit, mana cost and par multipliers, patrols after long rests. Sim: at Trial 10 the right
counter clearly beats the wrong one for every Omen.

## 2. Seasons, levels, rating (agreed)

- **Seasons are monthly, automatic, and named by their month** ("October 2026 Trials"), starting on the 1st at local
  midnight; the first is October 2026. (Chosen over two weeks: a clear name, a month to climb before the rating
  resets, and the four weekly Omen periods already keep it fresh.) A season is found from the date alone, so if Trials
  ships mid-month, players simply join it. 8 dungeons each:
  1. dungeons never in a season get a guaranteed slot next season, up to 4 a season, oldest-added first (6 new at once
     spread over two seasons);
  2. the other slots are weighted by how many seasons a dungeon has waited;
  3. with no new content, all 8 come from step 2.
- Every dungeon has a `since` date (existing ones: 2026-10-01); `tools/validate.js` refuses one without it.
  A season is computed from the date and the data by replaying the rule from the first season: every device agrees,
  nothing stored can drift, and a dungeon added mid-season joins the next season (a live season never changes).
- Optional hand-made extras (a seasonal Omen, looks, an intro) attach to the next season after they ship; without
  them the season runs on the regular Omens.
- Fought at 60 with full gear; about +8% enemy health and damage per Trial level, compounding (sim sets it). Beat par:
  next level; beat it by 20%: two. Over par still counts as a clear. No wipe limit.
- Rating: per in-season dungeon, best level × 10 (half if over par), summed. Resets each season; each season's best
  level and rating stay in your history. Rating raises the bots' skill from about 0.6 at 0 to about 0.85 at 800.
- Rewards: the Trialsworn look set, drawn once and earned once (cloak at Trial 5, weapon and mount at Trial 10);
  Marks per clear, 5 + the Trial level.
- Sim: no, one and six new dungeons; nothing waits too long.
- **Pacing (the sim tunes the per-level step to it):** a month of play reaches Trial 5–7 for a fresh 60 in dungeon
  blues, Trial 10–12 by week 2–3 for a regular raider, and Trial 15–17 for a pusher fully upgraded to the ceiling
  with good Omen reads; Trial 20 is barely reachable. Past the first push, climbing takes Marks (upgrades), rating
  (better bots) and good Omen reads, so it lasts the month.
- **Realm leaderboard:** the realm's simulated players have Trial ratings that climb through the month like real
  players' (each bot's curve from its id and the date, so nothing is stored and every device agrees). The tab shows
  your rank ("#214 of 3,012"), the top 10 and the players around you, never the whole list. Stop playing and bots pass
  you. Month-end rank gives that month's title: top 100, top 10, #1 on the realm.
- **Weekly goal:** each Omen period, finish 4 Trials at your best level or higher for bonus Mentor Marks.

## 3. Titles, the Trials tab, chat, history (agreed)

- **Titles** are permanent, so automatic seasons never need names made for them: Trial 10 in any season "%s the
  Tried", Trial 15 "%s the Unbroken", Trial 20 "Trialmaster %s".
- **The Trials tab**, a fifth Group Finder tab (fitted to phone width, like the Social tabs):
  - below 60 it shows "Opens at level 60";
  - top: the month's name and days left, rating and realm rank, the weekly goal, this period's three Omens as chips marked with the Trial level they start
    at (tap: rule and counter);
  - then always 8 rows, one per season dungeon: best ("Best: Trial 7, in time") and next level; a row opens a dialog
    with a − / + level picker up to best + 1, the par time, the Omens active at that level, and Queue (from anywhere);
  - in the run, the run panel shows the active Omens as icons; tapping one repeats its counter.
- **History:** one row per past month, newest first ("October 2026 · best Trial 12 · rating 940 · rank #38"); each
  season keeps its own dungeon list, so rows stay right when content changes. 12 rows a year; group by year later.
- **Chat:** level-60 bots post real Trial groups ("lfm trial 9 caves need heals"), joinable when you have that level
  open (`sim/chatcheck.js`), plus flavour about the period's Omens ("volatile week, go slow"), never phrased as a request.
- **Content-proof:** a new dungeon changes only the next season's picks; a new Omen joins from the next period.

Rules that apply: UI must scale; automatic systems must be content-proof (both in memory).

## Built differently (stages 1 and 2, 2026-09-30)

- **Picks are per faction.** Only 8 dungeons are open to both factions, which would make every season the same. Each
  faction's season draws from the dungeons its own players can reach by the road rule (Accord 12, Krugar 13 today).
  Storm-locked ones show as locked until Veshmira falls.
- **The leaderboard is the realm's level-60 bots plus a fixed ladder of 600 players** made the way the game makes bots
  (same on every device). A young realm has no bots at 60 yet (they level with you), and "#1 of 1" is no server.
- **Rank titles are top 10 and #1**, not top 100: the realm has hundreds of level-60 players, not thousands.
- **Starting level:** one past your best in time on that dungeon, and never more than 2 below your best elsewhere, so a
  new dungeon in the month does not start from Trial 1.
- **Difficulty:** Trial 1 is 83% strength, then +4.5% a level, compounding (`TRIALS.BASE`, `TRIALS.STEP`). Measured by
  `node sim/trialpace.js 3`: walls at Trial 5 (fresh 60, dungeon blues), 11 (raid purples), 13 (fully upgraded). The
  top is two levels under its target: pushers run out of time (rests between pulls set a floor), not health, and fast
  pace made them wipe more. Retune with Omens in stage 3.
- **Retuned for smarter bots (2026-09-30):** bots now use their whole kit, scaled by skill squared, so Trial groups (skill 0.6-0.85) got much stronger. Trial 1 is now 90% strength, then +5.4% a level. Walls: Trial 7 (fresh 60), 15 (raider), 15 (pusher, fully upgraded). The raider is above its 10-12 target; retune with Omens.
- **Retuned again for talent reactions (2026-09-30):** capstones now bring a reaction, which lifted walls about 2 levels. Trial 1 is now normal strength, then +6% a level. Walls: about 7-9 (fresh 60), 11 (raider), 13 (pusher). Retune with Omens.

## Omens, stage 3: what the sims taught (2026-09-30)

- The first Tier 1 set (Frenzied, Rallying, Swarming, Hardened) had no real answers: at Trial 10 their "counters" did no
  better than the wrong choice, and they made runs far harder (18-40% of runs wiped, against 0-4% without an Omen).
- A second lever, Kill order (one at a time / spread), was built and tested three times: in this engine it changes
  almost nothing (spreading also means more area attacks, and the tank holds everything anyway). It is hidden, and the
  Omens that rested on it (Frenzied, Rallying, Mending) are off. Mending at 2% a second was impossible (bosses outheal).
- **The boss plan is a real lever.** Tier 1 now rests on it with two Omens that need opposite answers: **Guarded**
  (bosses take half damage while an add lives: adds first) and **Enraging** (bosses hit 25% harder every 8 seconds:
  burn the boss). They alternate weekly until Tiers 2 and 3 add variety.
- The game never shows counters (design mindset: give every fact, never the answer). `counter` in the data is for the
  sims only. `node sim/omens.js [runs] [level]` checks that the right answer clearly beats the wrong one.
- Next: Tier 2 on pull pace (careful / fast), which the dungeon sims show is a strong lever; then retune Trial pacing
  with Omens in place.

