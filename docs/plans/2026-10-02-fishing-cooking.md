# Fishing and Cooking (beta 2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fishing and Cooking as secondary skills (they use no profession slot), 1–225, each with its minigame, per
`docs/plans/2026-10-02-professions-design.md` section 2.

**Architecture:** data in `src/data/professions.js` (two secondary professions, fish, meat, dishes, waters, cooking
recipes); rules in `src/game.js` (secondary skills outside the two-slot limit, the fishing state machine, cooking with a
quality, meat from beasts, the well-fed buff); the two minigames as overlays in `src/ui.js` + `src/style.css`; icons in a
new pack `src/art_icons12.js` (+ `art/icons12/render.js`, listed in `build.py`). Sounds composed in
`audio/compose_game.py` go to `audio/pending_sfx.txt` (they ship only once Faizal approves them; the game plays nothing
until then). Proof in `sim/prof.js` (seeded, in the build).

**Names (ours; lorekeeper and ipcheck must stay clean):**
- Fish by water level: 5–15 Silverfin Minnow (skill 1), Mudbelly Carp (25), big Whiskered Pike (50), rare Glimmerscale
  (60); 15–28 Speckled Trout (75), Reedback Perch (100), big Ironjaw Catfish (125), rare Lantern Eel (135); 28–45
  Saltfin Snapper (150), Greyscale Cod (175), big Stormback Tuna (200), rare Duskglass Ray (210).
- Meat from beasts: Lean Meat (5–15), Tough Meat (15–28), Thick Steak (28–45). Vendor: Cooking Spices.
- Dishes: see Task 4.

---

### Task 1: Secondary skills

`D.PROFESSIONS.cooking` and `.fishing` with `kind: 'secondary'`; `G.trainProf` counts only primary professions toward
`D.PROF_MAX`; the trainer lists "Secondary skills" (Cooking, Fishing) under the primaries, same ranks and prices; Hero →
Professions shows them after the two primaries. Check: a character with two primaries can still learn both.

### Task 2: Waters and fish

`D.WATERS`: the places with water (lakes, rivers, coasts, harbours, marshes, oases; the name-matched list minus the false
matches: the Kingsmere bank, the coven, the mine and dungeon gates), each fishing at its place level. `D.FISH[tier]`:
common fish by skill, one big (reel) and one rare (reel, smaller zone) per tier. A catch's skill colour comes from the
fish's skill like a herb. Check: every water has a tier; every fish item exists.

### Task 3: The fishing state machine (game.js, DOM-free)

`G.fishStart()` (only at a water, out of combat, with Fishing) → `P.fishing = { phase: 'wait', biteAt, fish }` where the
fish is rolled from the water's tier by skill (rarer with skill above the fish). `G.fishTick` turns 'wait' into 'bite'
at `biteAt` for a window (0.9 s common, 0.7 big, 0.55 rare); `G.fishTap()` inside the window lands a common fish or
starts the reel (`phase: 'reel'`, `{zone, fish pos, line}`); outside it, the fish gets away. `G.fishReel(hold, dt)`
moves the zone (hold rises, release falls) and the fish (its own speed), filling the line while the fish is inside and
draining it outside; full = caught, empty = lost. **Auto** (`G.fishAuto()`): lands a common fish at the normal rate and
never a big or rare one. Skill-up on every catch by colour. Check (sim): auto never lands big or rare; a perfect tapper
lands commons; a scripted reel that tracks the fish lands big fish; skill rises.

### Task 4: Meat, dishes and cooking

Beasts drop meat on loot when you know Cooking (Lean 5–15, Tough 15–28, Thick Steak 28–45; 35%). Recipes, about 18:
- 1–75: Grilled Minnow (1, food), Roast Lean Meat (10, food), Carp Stew (25, food), Spiced Pike (50, well-fed +3 Sta
  +3 Spi), Glimmerscale Supper (60, well-fed +4 Str +4 Sta).
- 75–150: Pan-Fried Trout (75, food), Meat Skewer (90, food), Perch Chowder (100, food), Hunter's Stew (110, well-fed +5
  Str +5 Sta), Catfish Gumbo (125, well-fed +6 Sta +6 Spi), Baked Lantern Eel (135, well-fed +6 Int +6 Spi).
- 150–225: Saltfin Skewer (150, food), Peppered Steak (165, well-fed +8 Str +6 Sta), Smoked Cod (175, food), Seafarer's
  Stew (185, well-fed +8 Agi +6 Sta), Stormback Tuna Steak (200, well-fed +8 Sta +8 Spi), Duskglass Feast (210,
  well-fed +10 Int +6 Sta).
Food restores like shop food of its level (×1.1); a well-fed dish restores too and gives **Well Fed** (`P.auras` id
`wellfed`, 30 min, one at a time, separate from the elixir). `G.cook(rid, count, quality)`: `perfect` gives one extra
serving per five (at least one), `normal` the batch, `burnt` loses one ingredient set and gives the rest; auto is
`normal`. Check: Perfect gives extra, burnt loses one set, Well Fed applies and is replaced.

### Task 5: The minigames (ui.js, style.css)

- **Fishing:** a "Fish here" card on the place panel at a water (like the gather chips) opens an overlay on the scene:
  water, a bobber, "Tap when it dips", then for big and rare fish the reel bar (hold anywhere to rise). An **Auto** toggle
  (remembered per device) skips straight to the auto result. The result line names the catch, its size and what it is
  for. Never during combat; leaving the place cancels.
- **Cooking:** in Hero → Professions → Cooking, a recipe opens the dish card; **Cook** starts the heat bar (a needle
  sweeping across cold | normal | gold | normal | burnt, tap to stop), **Auto** cooks normal. The gold zone narrows for
  harder recipes (by the recipe's skill relative to yours). The result shows Perfect / Normal / Burnt and the servings.
- Both say before you try what Perfect or a rare catch gives (design mindset).

### Task 6: Icons (art_icons12.js)

Two profession icons (`prof_cooking`, `prof_fishing`), 12 fish, 3 meats, Cooking Spices, 17 dishes: 35 keys. House
style; contact sheets looked at.

### Task 7: Sounds (pending approval)

`splash` (cast), `bite` (a plop), `reel` (a short ratchet), `catch` (a happy chime), `sizzle` (cooking), `burnt` (a
fizzle), composed in `audio/compose_game.py`, checked by `audio/check.py`, listed in `audio/pending_sfx.txt`.

### Task 8: Pace and proof

`sim/prof.js`: fishing 1 → 225 and cooking 1 → 225 by level 45 for a player who fishes about 20 minutes a band and cooks
what they catch and kill (skill and the auto path both counted); Perfect rate for an average tapper about 1 in 3.
Saves: old characters load with no Cooking or Fishing. Build, browser check at phone width, beta (version code 87+).
