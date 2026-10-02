# Artisan Professions (beta 3) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Skill 226–300 (Artisan) for all nine skills, covering levels 45–60: new materials, recipes, flasks, catch-up
blues and the collections (crafted looks, a keepsake and a title per skill), proven by sim. Design:
`docs/plans/2026-10-02-professions-design.md` (beta 3, sections 3 and 4).

**Architecture:** Data in `src/data/professions.js` (rank, materials, nodes, fish, recipes, items); rule touches in
`src/game.js` (the crafted stat budget, flasks, profession titles and keepsakes, rare recipes in the Trials chest, the
auction house); the crafted looks and keepsakes drawn in `src/art.js` next to the raid sets (`rsChest` helpers,
`art/raidsets/render.js` as the checker) or a new `src/art_crafted.js`; icons in `src/art_icons13.js` (+
`art/icons13/render.js`, listed in `build.py`). Proof in `sim/prof.js` and a new `sim/consumables.js`, both in the build.

**Tech stack:** plain browser JS, Node sims, `rsvg-convert` contact sheets, `python3 build.py`.

**Rules that matter:** saves keep loading (`P.prof[id] = {skill, max, known}` already allows max 300; nothing changes
shape); `node tools/validate.js` before `build.py`; no Warcraft names (`tools/ipcheck.js`, `tools/lorekeeper.js`, both
in the build; swap any name they flag); look at every contact sheet before shipping art.

**Names (proposed, ours):**
- Ore and stone: **Duskiron Ore** / **Duskiron Bar** (45–60), a rare **Moonsilver Vein** (Moonsilver Ore / Bar, from
  50), **Deepstone**.
- Herbs, by region: **Cinderbloom** (the Cinderfields), **Gloomcap** (Rotmoor), **Sunveil** (Greenmaw Crater),
  **Frostpetal** (Icewold).
- **Hardhide Leather** (beasts 50+). **Duskweave Cloth** / **Bolt of Duskweave** (humanoids 45+).
- Fish (45–60 water): **Ashgill Bass** (225), **Frostscale Herring** (250), big **Thunderhead Marlin** (275), rare
  **Starlit Koi** (285). Meat: **Marbled Haunch** (beasts 45–60).
- Look sets: smithing **Moonforged** (mail), leatherworking **Wildrunner** (leather), tailoring **Starweave** (cloth).

---

### Task 1: Crafted blues on the drop curve (a bug fix that comes first)

`gear()` in `src/data/professions.js` gives blues `L * 0.9 + 2` stat points; drops use `L * 0.55 + 2` since v10.4
(`G.genGear`, game.js). So today the level-44 Expert rares carry 42 points against 26 for a level-44 dungeon blue, about
what a level-60 dungeon blue has. Use the drop curve's budget for every quality (`q2: L*0.55+1`, `q3: L*0.55+2`, `q4:
L*0.64+2`). Items already crafted keep their stats (they are copies in the save).

**Check (sim/prof.js):** every crafted blue's stat total is within 3 of `G.genGear` for its slot, level and quality;
the three Expert rares come out at 26–27. Fail first, then pass. Commit `Crafted blues use the drop curve's stat budget`.

### Task 2: The Artisan rank

`D.PROF_RANKS` adds `{ name: 'Artisan', max: 300, lvl: 45, skill: 200, cost: 50000 }` (5g). The old title `Artisan %s`
(150 in a craft, id `artisan`) is renamed to **Journeyman %s** so "Artisan" means 300 everywhere; the id stays, so a
player wearing it keeps it. **Check:** a level-45 smith with 200 skill trains to 300; level 44 cannot. Commit.

### Task 3: Materials, nodes, leather and cloth

| id | name | sell | notes |
|---|---|---|---|
| duskiron_ore / duskiron_bar | Duskiron Ore / Bar | 70 / 100 | node skill 230, levels 45+, extra deepstone 0.5 |
| moonsilver_ore / moonsilver_bar | Moonsilver Ore / Bar | 250 / 330 | q 2, rare node skill 260, levels 50+ |
| deepstone | Deepstone | 25 | |
| cinderbloom, gloomcap, sunveil, frostpetal | the herbs | 90 / 100 / 115 / 130 | node skills 230 / 245 / 260 / 275 |
| hardhide_leather | Hardhide Leather | 100 | `D.skinLeather` gives it at 50+ |
| duskweave_cloth / duskweave_bolt | Duskweave Cloth / Bolt of Duskweave | 40 / 130 | humanoids 45+ drop it (30%) instead of silk |

`D.nodeTable(L)`: the last band becomes `L <= 45` (today's), then `L > 45`: ore `[['duskiron', 6], ['embersilver', L <
50 ? 3 : 0], ['moonsilver', L >= 50 ? 1 : 0]]`, herb by zone level `[['cinderbloom', 3], ['gloomcap', L >= 50 ? 3 : 0],
['sunveil', L >= 53 ? 3 : 0], ['frostpetal', L >= 56 ? 3 : 0], ['rimeleaf', L < 50 ? 2 : 0]]`.

**Check:** `D.nodeTable(52)` has duskiron and moonsilver; a level-55 beast skins into hardhide leather; level-50
humanoids drop duskweave and no silk. Commit with Task 4's icons, never with a validate failure.

### Task 4: Fishing and cooking to 300

- `D.FISH[4]`: common `ashgill_bass` (225), `frostscale_herring` (250); big `thunderhead_marlin` (275); rare `starlit_koi`
  (285). `D.waterTier` gives 4 above level 45 (the 16 waters at 45–60 today). The reel and window difficulty use the
  existing tier rules (deeper water fights harder).
- Meat: `marbled_haunch` from beasts 45–60 (35% for a cook).
- Dishes (`dish(id, name, lvl, wellFed, sell)`) and recipes:

| recipe | skill | dish | lvl | well fed | mats |
|---|---|---|---|---|---|
| ck_ashgill_fillet | 225 | Ashgill Bass Fillet | 46 | — | ashgill_bass 1 |
| ck_roast_haunch | 235 | Roast Marbled Haunch | 48 | — | marbled_haunch 1 |
| ck_herring_pie | 250 | Frostscale Herring Pie | 52 | — | frostscale_herring 1, cooking_spices 1 |
| ck_smokehouse_stew | 255 | Smokehouse Stew | 53 | str 10, sta 8 | marbled_haunch 2, cooking_spices 1 |
| ck_spiced_haunch | 265 | Spiced Haunch Roast | 55 | agi 10, sta 8 | marbled_haunch 2, cooking_spices 1 |
| ck_trail_skewer | 270 | Trailmaster's Skewer | 56 | — | marbled_haunch 1, ashgill_bass 1 |
| ck_marlin_steak | 275 | Thunderhead Marlin Steak | 57 | sta 10, spi 10 | thunderhead_marlin 1 |
| ck_koi_banquet | 285 | Starlit Koi Banquet | 59 | int 12, sta 8 | starlit_koi 1, cooking_spices 1 |
| ck_long_table (rare) | 290 | Feast of the Long Table | 60 | str 12, agi 12, sta 8 | marbled_haunch 2, thunderhead_marlin 1 |

Well-fed sizes are first guesses; Task 8 sets them. **Check:** tier-4 water rolls only tier-4 fish; auto still never
lands big or rare; a cook at 280 makes the Marlin Steak. Commit.

### Task 5: Craft recipes

Every recipe uses the default bands `[s, s+25, s+37, s+50]`. Gear uses `gear()` (fixed in Task 1). Rows marked
**look** carry a `look` (Task 9 draws it) and are made only by crafting; rows marked **rare** drop (Task 7).

**Mining:** `smelt_duskiron` 230 duskiron_ore → duskiron_bar; `smelt_moonsilver` 260 moonsilver_ore → moonsilver_bar.

**Blacksmithing:**
| recipe | skill | item | mats |
|---|---|---|---|
| bs_deepstone_whetstone | 230 | Deepstone Whetstone (stone, lvl 50, wdmg 9) | deepstone 1 |
| bs_duskiron_sabatons | 235 | Duskiron Sabatons (feet, 48, mail, str sta) | duskiron_bar 8, deepstone 1 |
| bs_duskiron_hauberk | 250 | Duskiron Hauberk (chest, 52, mail, sta str) | duskiron_bar 12 |
| bs_duskiron_greatsword | 260 | Duskiron Greatsword (weapon sword, 54, str sta) | duskiron_bar 10, hardhide_leather 1 |
| bs_moonforged_breastplate | 280 | Moonforged Breastplate (chest, 60, q 3, mail, str sta) **look** | duskiron_bar 16, moonsilver_bar 2 |
| bs_moonforged_legplates | 285 | Moonforged Legplates (legs, 60, q 3, mail, sta str) **look** | duskiron_bar 14, moonsilver_bar 2 |
| bs_moonforged_blade (rare) | 290 | Moonforged Blade (weapon sword, 60, q 3, str agi) **look** | moonsilver_bar 4, duskiron_bar 8 |
| bs_moonforged_hammer (rare) | 295 | Moonforged Warhammer (weapon mace, 60, q 3, str sta) **look** | moonsilver_bar 4, duskiron_bar 8 |

**Leatherworking:**
| lw_hardhide_kit | 230 | Hardhide Armor Kit (kit 40, lvl 50) | hardhide_leather 4, fine_thread 1 |
| lw_hardhide_boots | 235 | Hardhide Leather Boots (feet, 50, agi sta) | hardhide_leather 6, fine_thread 2 |
| lw_hardhide_gloves | 250 | Hardhide Leather Gloves (hands, 52, agi sta) | hardhide_leather 6, fine_thread 2 |
| lw_hardhide_belt | 260 | Hardhide Leather Belt (waist, 55, sta agi) | hardhide_leather 8, fine_thread 2 |
| lw_wildrunner_tunic | 280 | Wildrunner Tunic (chest, 60, q 3, agi sta) **look** | hardhide_leather 14, moonsilver_bar 1 |
| lw_wildrunner_leggings | 285 | Wildrunner Leggings (legs, 60, q 3, agi sta) **look** | hardhide_leather 12, moonsilver_bar 1 |
| lw_wildrunner_cloak (rare) | 290 | Wildrunner Cloak (back, 60, q 3, agi sta) **look** | hardhide_leather 10, frostpetal 2 |

**Tailoring:**
| tl_duskweave_bolt | 230 | Bolt of Duskweave | duskweave_cloth 4 |
| tl_duskweave_bag | 240 | Duskweave Bag (bag 12) | duskweave_bolt 4, fine_thread 2 |
| tl_duskweave_gloves | 235 | Duskweave Gloves (hands, 49, int sta) | duskweave_bolt 2, fine_thread 1 |
| tl_duskweave_robe | 250 | Duskweave Robe (chest, 52, int spi) | duskweave_bolt 5, fine_thread 2 |
| tl_duskweave_leggings | 260 | Duskweave Leggings (legs, 55, int sta) | duskweave_bolt 5, fine_thread 2 |
| tl_starweave_robe | 280 | Starweave Robe (chest, 60, q 3, int spi) **look** | duskweave_bolt 8, moonsilver_bar 1 |
| tl_starweave_trousers | 285 | Starweave Trousers (legs, 60, q 3, int sta) **look** | duskweave_bolt 7, moonsilver_bar 1 |
| tl_starweave_bag (rare) | 295 | Starweave Bag (bag 14) | duskweave_bolt 8, moonsilver_bar 1 |

**Alchemy** (flasks: Task 6):
| al_grand_healing | 230 | Grand Healing Potion (potion, lvl 50, heal [1000, 1300]) | cinderbloom 1, gloomcap 1, sturdy_vial 1 |
| al_grand_mana | 240 | Grand Mana Potion (potion, lvl 52, mana [1000, 1300]) | gloomcap 1, sunveil 1, sturdy_vial 1 |
| al_might | 245 | Elixir of Might (elixir, lvl 52, str 18) | cinderbloom 2, sturdy_vial 1 |
| al_swiftness | 250 | Elixir of Swiftness (elixir, lvl 53, agi 18) | sunveil 2, sturdy_vial 1 |
| al_clarity | 255 | Elixir of Clarity (elixir, lvl 54, int 18) | frostpetal 1, gloomcap 1, sturdy_vial 1 |
| al_flask_ironwall | 275 | Flask of the Iron Wall (flask, lvl 60, sta 30) | frostpetal 2, gloomcap 2, moonsilver_bar 1 |
| al_flask_warpath | 285 | Flask of the Warpath (flask, lvl 60, str 20, agi 20) | cinderbloom 3, sunveil 2, moonsilver_bar 1 |
| al_flask_stillmind (rare) | 290 | Flask of the Stillmind (flask, lvl 60, int 25, spi 10) | frostpetal 3, sunveil 2, moonsilver_bar 1 |

Item buff sizes are first guesses; Task 8 sets them. Catch-up: the six level-60 look pieces are the "few crafted blues
per armour type"; with Task 1 they sit below level-60 dungeon blues (35 points against 40–46) and well below raid loot.

**Check:** every Artisan recipe's `makes` and `mats` exist; the craft chain from ore to a Moonforged Breastplate works
for a level-60 smith at 280. Commit `Professions: Artisan recipes`.

### Task 6: Flasks

A flask is `slot: 'elixir'` with `flask: true`: it takes the elixir slot (one at a time, as today), lasts **2 hours**
instead of 1, and **stays through death** (the death path in game.js keeps `P.auras` entries with `keep: true`). The
item card says "Flask: 2 hours, stays when you die; replaces an elixir". **Check:** drinking a flask replaces an elixir;
after a death the flask is still there and an elixir is not. Commit.

### Task 7: Rare recipes at 60, the auction house, vendors

- `D.RARE_RECIPES` picks up the five new rares (blade, hammer, cloak, bag, flask; the feast too); `G.pickRare(60)`
  returns only Artisan rares, so level-60 dungeon bosses drop them.
- Trials: no item chest exists (Trials pay Marks); Trial bosses roll recipes at the level cap like any boss, so they drop Artisan rares too. A rare bag recipe counts at its skill / 5 (bags are item level 1).
- Auction goods: `L0 >= 46` adds duskiron_ore, duskiron_bar, cinderbloom, gloomcap, hardhide_leather, duskweave_cloth,
  grand_healing_potion; `L0 >= 55` adds sunveil, frostpetal, duskweave_bolt, grand_mana_potion, elixir_might.

**Check:** 300 rare drops at level 60 give only Artisan rares; a level-56 auction list shows an Artisan good. Commit.

### Task 8: The modest edge (sim/consumables.js, in the build)

For each class at level 60 in level-60 dungeon blues: 30 seeded 90-second fights against a level-60 elite boss
dummy, measuring damage done (healers: healing done on a dummy tank) and, for tanks, damage taken. Two passes: nothing,
then the full set (a flask, the best well-fed dish for the role, a whetstone or kit, potions on cooldown).

- Gate: the full set gives **3–7% on average per class** and no class above 8%. If a class is over, shrink that
  flask, dish or stone (never raise targets).
- The existing raid, Trials and Hard sims stay as they are (they run without consumables), so today's targets stand.

Run it, tune the numbers in Tasks 4–6, add it to the sim list in `build.py`. Commit `sim/consumables.js: the modest
edge`.

### Task 9: Collections at 300

- **Crafted looks:** the eight look pieces (Moonforged chest, legs, blade, hammer; Wildrunner chest, legs, cloak;
  Starweave chest, legs) enter the account wardrobe when crafted (the wardrobe already collects anything with a `look`).
  Their wardrobe source line reads "Crafted: Blacksmithing 280".
- **A keepsake per skill** (a back look, account-wide, earned when that skill reaches 300; shown in the wardrobe's Back
  row like the Legends' keepsakes, with "Reach 300 Mining"):
  Deepdelver's Pick (Mining), Herbwise Satchel (Herbalism), Hide-Hunter's Pelt (Skinning), Master Smith's Hammer
  (Blacksmithing), Tanner's Rolled Hides (Leatherworking), Weaver's Spindle (Tailoring), Alchemist's Bandolier
  (Alchemy), Chef's Stewpot (Cooking), Angler's Rod (Fishing).
- **A title per skill at 300** (`need: { prof: 'mining' }`, checked in `G.titleUnlocked`): the Deepdelver, the Herbwise,
  the Hide-Hunter, the Master Smith, the Master Tanner, the Master Weaver, Master Alchemist %s, the Chef, the Angler.
- **Bounded on screen:** Hero → Professions shows "245 / 300 · Artisan" per skill, and a Collections line per skill
  ("Keepsake: Reach 300", "Title: Reach 300", "Looks: 2 of 4 crafted", each saying where it comes from).

**Art:** 8 look pieces drawn in the raid-set style (`rsChest` and friends in `src/art.js`, checked by
`art/raidsets/render.js`) and 9 back keepsakes in the Legends' keepsake style. Look at the sheets on a warrior, a
rogue and a mage.

**Check (sim/prof.js):** reaching 300 unlocks the title and the keepsake; crafting a look piece adds its look; an old
save with 150 skill loads and shows "150 / 300". Commit.

### Task 10: Icons (art_icons13.js)

About 35 keys: the 11 materials, 4 fish, the meat, 9 dishes, 3 flasks, 4 potions and elixirs (or reuse today's with
a new tint), the whetstone, the hardhide kit, 2 bags. House style; flasks read as flasks, not potions; herbs each get
their own silhouette. Plus 6 world nodes (duskiron, moonsilver and the four herbs) in `ART.node`. `node
art/icons13/render.js` → 0 problems; look at the compare sheet. Commit.

### Task 11: The pace and the full build

- `sim/prof.js`: from level 45 with 225 in each pairing, levelling to 60 over the real level pace (gather an hour per
  band at 47, 51, 55, 58), every pairing reaches **about 300 by 60** (≥ 285); fishing and cooking too, for a player
  who fishes about 20 minutes a band.
- `python3 build.py` (validate, lorekeeper, ipcheck, every sim). Browser check at phone width: an Artisan trainer, a
  Moonsilver Vein at a level-52 place, a flask on the buff row, the Collections line, a keepsake in the wardrobe.
- Ship as `v10.9.0-beta.5` (version code 88+, pre-release, `tools/publish_web.sh --beta`; no iCloud, no itch.io).

**Not in this beta (parked):** bots using consumables (the design's "sometimes"; targets do not need it), a crafted
mount for Blacksmithing or Leatherworking (only if the art holds up; its own step later).
