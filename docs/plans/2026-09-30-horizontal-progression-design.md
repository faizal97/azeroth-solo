# Horizontal progression after 60: design

2026-09-30. Agreed with Faizal. Replaces "keystone dungeons" in the roadmap.

## The questions

1. How do we pull players to a new dungeon or raid?
2. How do old dungeons and raids stay alive?
3. How does old gear stay useful when new gear drops?
4. How does difficulty work?

## Decisions

- **Full gear counts everywhere** (as now). A synced character fights at the content's level, but items keep their
  full stats. Normal old dungeons become quick farming runs for looks, trophies, codex pages and Marks. Challenge
  comes from Trials and Hard raids.
- **A slowly rising ceiling with upgrades** (not classic tiers, not a hard ceiling).
- **Trials** are the level-60 challenge dungeons, **Omens** their weekly rules, and raids come in **Normal** and
  **Hard**. (No Warcraft terms: Mythic, Keystone, Heroic, Challenge Mode, Delves, Timewalking and Renown are out.)
- **Your Trial rating draws better bots** to your group.
- **Trial seasons** rotate 8 dungeons.

## 1. Gear power

- At any time the strongest gear sits at the **current ceiling** (today: Tidecrown Citadel). Each new raid raises it
  by about 5%.
- Every level-57+ blue or purple item can be upgraded a step at a time. Each step raises its stats and costs Mentor
  Marks. The top step always equals the current ceiling, so a new raid gives every
  old piece new steps. Greens can't be upgraded.
- An item's effect, set bonus and look never change; only its numbers do. That keeps a Magma Throne sword a real
  choice next to a Tidecrown one.
- The item's stats are rewritten when a step is bought and saved with it; items without `it.pw` load as they dropped.
  No save migration.
- Mentor Marks are account-wide, so an alt's runs pay for your main's upgrades.
- First step: measure the current gear gap between Magma Throne, Veshmira's Lair and Tidecrown from the data, and set
  the step size from it.
- **Measured 2026-09-30** (average stat points per boss-loot item, same slots, against Tidecrown = 100%): Veshmira's
  Lair 92%, Magma Throne 91%, Temple of Shal'zua 96% and the Sunken Archive 93% (both blue, so they already beat older
  purples), the Blackcloister 85%, Graymouth 82%, Cinderpeak Depths 68% (all items). Weapon damage per second: Tidecrown
  42.7, the rest 33–38.5, so upgrades scale weapon damage as well as stats.
- **Stored as power, shown as a percentage (changed while building, 2026-09-30):** an upgraded item stores the power it
  reached (`it.pw`), not a step count. A step count would grow forever (every new raid adds about 2 steps, so labels
  like 64/66) and, since a step is measured against the current ceiling, would make old upgrades stronger for free
  whenever the ceiling moved. The tooltip reads "Power 91% of the ceiling"; the price is 5 Marks per 1% gained (15 a
  step); a step that would leave less than half a step goes straight to the ceiling.
- **Step size and caps:** one step is 3% of the ceiling. Purples upgrade to 100% of the ceiling, blues to about 92%, so
  raids stay the top of power and a blue can still win on its effect. Magma Throne gear takes 3–4 steps; a 5% ceiling
  raise adds about 2 steps to everything.
- **Sim:** a geared 60 still clears old normal dungeons easily; a fully upgraded Magma Throne set is within a few
  percent of a Tidecrown set; a 5% ceiling raise moves your best Trial by about +1 to +2; one upgrade step costs about
  3–5 dungeon runs of Marks (first target).

## 2. Trials

- Open at 60, from a new **Trials** tab in the Group Finder. Queue from anywhere, like Help Wanted.
- Pick any dungeon in this season's pool, at any Trial level up to your best on it plus 1. No key item that goes up
  and down; a bad run just doesn't raise you.
- Beat par to open the next level; beat it by a wide margin to open two.
- You fight at 60 with full gear. Enemies gain health and damage per level (first guess about 8% per level, set by
  sim).
- **Omens**, this week's rules: 1 from Trial 2, 2 from Trial 5, 3 from Trial 8. They change on the weekly reset (local
  Monday, like the weekly bounty). **Every Omen has a counter the player chooses**: tactics (pull pace, kill order,
  boss plan), talents, group make-up or consumables.
- **Seasons:** 8 dungeons for 4 real weeks, old and new mixed; then a new mix. New dungeons join the season they ship.
- **Trial rating:** your best level on each in-season dungeon, added up. A higher rating raises the skill of the bots
  who answer your queue (the bots' existing `skill` value).
- Bots post real Trial requests in chat ("lfm trial 9 caves need heals"), each one joinable (`sim/chatcheck.js`).
- **Rewards:** Mentor Marks on every clear, more at higher levels; season looks at Trial 5 and 10; a season mount at
  10; a title for your best level; your best Trial shown on your profile (and to Friends).
- **Sim:** the right counter clearly beats the wrong one at the same level; par times per level; the bot-skill curve
  by rating.

## 3. Raids: Normal and Hard

- Clearing a raid on Normal once, on that character, opens Hard. Normal or Hard is chosen at the entrance.
- **Hard:** stronger enemies (tuned so a group near the ceiling wipes about 2–3 times on a first clear) and one extra
  mechanic per boss, designed per raid (for example, Veshmira calls a second whelp wave in her last phase). Hard
  queues fill from skilled bots, a little above your Trial rating.
- **Rewards:** the same items dropped two upgrade steps up, **once per boss per week** (raids have no lockout, so this
  protects the Marks economy); after that Hard drops the Normal version. A Hard-only look per raid (a recoloured
  set), a title for clearing a whole raid on Hard, and Hard clears in the codex.
- **Featured raid:** one raid a week. Its first clear that week gives bonus Marks and a guaranteed piece of that
  raid's set in your wardrobe. It cycles through Magma Throne, Veshmira's Lair and Tidecrown; new raids join.
- Saves: `P.raidWeek` records which bosses gave their Hard bonus this week; it starts empty.
- **Sim:** wipes per first Hard clear.

## 4. New content, old content, the wardrobe

- **Pull to new content:** the next story chapter and its scenes, the ceiling raise, new effects, sets and looks, new
  codex pages, and a place in the Trials season it ships in.
- **Old content stays alive:** Trial seasons, the featured raid, looks that drop only there, upgrades that make old
  gear worth wearing, and the Roulette and Help Wanted.
- **The wardrobe:** account-wide, in the account store with Marks and heirlooms (`azsolo.account`, already synced by
  cloud save). Every item you equip or loot adds its look; any slot can show any look you own of the same armour type.

## Build order

Each step ships to beta alone with its own sim.

1. **Gear upgrades:** measure the gap, add `it.pw` and its Marks cost, an Upgrade button in the item sheet.
2. **The wardrobe.**
3. **Trials:** season pool, Omens with counters, rating, bots by rating, chat requests, the Trials tab, rewards.
4. **Hard raids and the featured raid.**
