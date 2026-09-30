# Trials: design (draft, sections 1–2 agreed, section 3 still to do)

2026-09-30. Step 3 of docs/plans/2026-09-30-horizontal-progression-design.md. Paused for hotfixes.

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

One from each tier a week (36 combinations). New engine hooks: on-death effects, enrage threshold, extra enemies,
stun immunity, poison on hit, mana cost and par multipliers, patrols after long rests. Sim: at Trial 10 the right
counter clearly beats the wrong one for every Omen.

## 2. Seasons, levels, rating (agreed)

- **Seasons are automatic and 2 weeks long** (two Omen weeks). 8 dungeons each:
  1. dungeons never in a season get a guaranteed slot next season, up to 3 a season, oldest-added first (5 new at once
     spread over two seasons);
  2. the other slots are weighted by how many seasons a dungeon has waited;
  3. with no new content, all 8 come from step 2.
- Every dungeon has a `since` date (existing ones: the Trials launch date); `tools/validate.js` refuses one without it.
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
- Sim: no, one and five new dungeons; nothing waits too long.

## 3. Still to design

Titles, the Trials tab (Omens at the top, one row per season dungeon, level picker), bot chat requests, history view.

Rules that apply: UI must scale ([[design-ui-to-scale]]); automatic systems must be content-proof.
