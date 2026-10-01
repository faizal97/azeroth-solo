# Distance in combat: design

Real positions in every fight (X, Y, Z), movement, and a range for every ability. Agreed 2026-10-01.

## Why

Combat has no distance today. A snare only slows the target's auto-attack timer, every melee ability always lands, and
a frozen warrior keeps swinging. One-on-one this makes plate classes beat casters whatever the AI does (Bloodsand Brawl
round 1 at level 60: warrior and paladin 85%, shaman 18%), because a caster's real answer to melee (freeze it and step
away) cannot happen. Distance gives every class's kit its real job: casters freeze and kite, warriors charge back in,
hunters keep range, rogues stick close. It applies everywhere (his choice), not only to one-on-one fights.

## 1. The model

- **Coordinates:** every fighter in a fight has X (along the line between the sides; allies left, enemies right, as
  the scene), Y (depth across the ground) and Z (height). Distance is true 3D. Positions live only inside a fight.
- **Movement:** everyone runs at 7 m/s. Snares cut speed by their percentage; roots stop movement. Moving cancels a
  cast in progress; instant abilities work on the move.
- **Ranges** (data, defaults by type; any ability can set its own `range`):

  | Kind | Range |
  |---|---|
  | Weapon attacks and melee abilities | 5 m |
  | Spells on an enemy | 30 m |
  | Shots | 35 m |
  | Heals and buffs on an ally | 40 m |
  | Area attacks | 8 m radius around the caster or the target |

- **Out of range:** an ability cannot be used out of range.
- **Moving faster:** Charge, Intercept and Feral Charge jump into melee range; a fear makes the target run away for
  its length; **Step Back** (every class, one new button) hops 8 m away, 12 s cooldown.
- **Y (depth):** used for spreading out against area attacks, surrounding a target, and monsters flanking the back line.
  Kept shallow (a few metres) so it stays readable on a phone.
- **Z (height): flying.** A flyer above about 4 m cannot be hit by melee; spells and shots reach it. Flyers dive to
  attack and can be hit in melee while low. Used for a few monsters (whelps, birds, bats) and bosses (Veshmira may take
  to the air in a phase).
- **Starts:** PvE fights start in contact, as today (melee in reach, ranged and healers about 20 m behind), so pulls are
  not slower. One-on-one fights start 25 m apart.

## 2. What you see

- **The scene follows the coordinates:** X maps to left-right, Y to depth (further back is higher on screen, a little
  smaller, drawn behind), Z to height (the sprite floats up with a shadow on the ground below). Sprites are drawn in
  depth order (today they sit on fixed layers).
- **Moving:** sprites slide along the ground with a small run cycle. Close fights look as they do now; a gap opens on
  screen when someone steps away. If fighters move further apart than the scene shows, the view eases out a little.
- **Each move has a look:** Charge/Intercept a dash with a dust streak and a thump; Step Back a backward hop with a puff;
  roots and freezes ice or vines at the feet for exactly the root's length; snares a slower run with a frost or drag
  mark; fear the sprite turns and runs with a small symbol over its head.
- **Attacks travel the real gap:** spells and shots (already projectiles) fly the actual distance; melee lunges only
  happen in reach, otherwise the attacker runs in first.
- **Buttons and frames say what is possible:** an ability out of range greys and shows its range ("30 m"); the target
  frame shows the distance ("12 m"), green in reach, amber at range, red too far.
- **Proof:** a contact sheet of the new art (run cycle, dash, hop, ice, vines, fear, shadows) and a recorded duel clip
  (a mage freezing, stepping back and casting; a warrior charging back in) to judge the motion.

## 3. Who stands where

- **Preferred range from each kit:** melee (warriors, rogues, paladins, melee monsters) in reach (5 m); casters and
  hunters about 25 m; healers within 40 m of every ally and at least 15 m from enemies. Monsters are melee unless marked
  ranged in data (archers, casters).
- **Automatic movement for you and every bot:** a fighter that is not casting, stunned or rooted moves toward its
  preferred range; casters stop to cast. Bots reposition as well as their skill allows. You also have **Step Back**.
- **Kiting** (duels, the brawl, solo questing): when a melee enemy is rooted, snared or feared, a ranged fighter steps
  back to open the gap and casts while it cannot reach; the melee fighter runs or charges back.
- **Groups:** tanks hold the front; monsters chase whoever they attack, so with the tank holding them the back line is
  safe as today. Area attacks have a radius, so melee stacked near the tank catch a cleave and casters at 25 m do not.
  Boss specials that hit "the whole group" still hit everyone; distance applies to ordinary attacks and area abilities.

## 4. Proof and rollout

1. **Engine:** coordinates, movement, ranges, out-of-range, Step Back, fear runs, flyers. PvE starts in contact, so every
   existing sim (dungeons, raids, Trials, world bosses, battleground, levelling) must pass unchanged. A new
   `sim/distance.js` checks the rules: reach, speed, snares and roots, charges, Step Back, fear, moving cancels a cast,
   flyers out of melee reach.
2. **Scene:** sprites from coordinates (X, Y depth with order and scale, Z height with a shadow), the run cycle and the
   effects; contact sheet and a duel clip; frame times checked on the emulator.
3. **One-on-one:** the AI kites and charges. `sim/brawl.js`'s balance becomes a gate again: every class wins at least
   0.8 rounds a brawl, a typical player about 1 in 3 brawls. The brawl's screens are built here.
4. **PvE positioning:** ranged monsters, monster chase, area radius, healer range, spreading and surrounding on Y, flyers
   on Z for a few monsters and bosses; retuned by sim until dungeon and raid wipes and times are back within today's
   targets and solo kill times stay close to now.

- **Saves:** positions exist only inside a fight; nothing new is saved, no migration.
- **Releases:** stage 1 changes nothing visible and can ride along; stages 2 and 3 go out together as a beta (distance
  first seen in duels and the brawl); stage 4 is its own beta because it touches all PvE balance.
