# Expert Professions (beta 1) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Skill 151–225 (Expert) for the seven primary professions, covering levels 25–45: new materials, nodes,
leather, cloth, recipes and icons, proven by sim. Design: `docs/plans/2026-10-02-professions-design.md` (beta 1).

**Architecture:** All data, in `src/data/professions.js` (ranks, materials, nodes, recipes) plus three rule touches in
`src/game.js` (higher-level leather, silk drops, level-aware rare recipes, auction goods). Icons for the new materials go
in a new pack `src/art_icons11.js` with its own `art/icons11/render.js`, listed in `build.py`. Proof in `sim/prof.js`.

**Tech stack:** plain browser JS (no framework), Node sims, `rsvg-convert` contact sheets, `python3 build.py`.

**Names (agreed 2026-10-02):** Iron Ore, Gold Ore, Embersilver Ore, Heavy Stone, Iron/Steel/Gold/Embersilver Bar;
herbs Ironthistle, Redmantle, Stoutroot, Dimleaf, Goldspur, Hermit's Beard, Rimeleaf; Heavy Leather, Thick Leather;
Silk Cloth, Bolt of Silk Cloth; vendor Smithing Coal, Fine Thread, Sturdy Vial. No new name may come from Warcraft;
`tools/lorekeeper.js` and `tools/ipcheck.js` (both run by `build.py`) must stay clean.

**Rules that matter (CLAUDE.md):** saves keep loading (nothing here changes save shape: `P.prof[id] = {skill, max,
known}` already allows a higher `max`); `node tools/validate.js` before `build.py`; look at contact sheets before
shipping art.

---

### Task 1: The Expert rank

**Files:** Modify `src/data/professions.js` (header comment, `D.PROF_RANKS`); Test `sim/prof.js`.

**Step 1: failing check.** At the end of `sim/prof.js` (before its summary line), add:

```js
// Expert (v10.10): from level 30 with 125 skill, up to 225
{
  G.newGame({ name: 'E', cls: 'warrior', race: 'human' }); const P = G.S.player; P.money = 1e7; P.level = 30;
  G.trainProf('mining'); G.profs().mining.skill = 50; G.trainProf('mining'); G.profs().mining.skill = 150; G.trainProf('mining');
  ok(G.profs().mining.max === 225, 'a level-30 miner with 150 skill trains Expert (225)');
  P.level = 29; G.newGame({ name: 'E2', cls: 'warrior', race: 'human' }); G.S.player.level = 29; G.S.player.money = 1e7;
  G.trainProf('mining'); G.profs().mining.skill = 150; G.profs().mining.max = 150; G.trainProf('mining');
  ok(G.profs().mining.max === 150, 'Expert waits for level 30');
}
```

**Step 2:** `node sim/prof.js` → expect `FAIL a level-30 miner with 150 skill trains Expert (225)`.

**Step 3:** in `D.PROF_RANKS` add `{ name: 'Expert', max: 225, lvl: 30, skill: 125, cost: 25000 }`; header comment
"skill 1–225 (Apprentice 75, Journeyman 150, Expert 225)".

**Step 4:** `node sim/prof.js` → no FAIL. **Step 5:** commit `Professions: the Expert rank (225, level 30)`.

### Task 2: Materials

**Files:** Modify `src/data/professions.js` (materials block).

Add with `mat(id, name, icon, sell, o)` (icons are new keys, drawn in Task 7):

| id | name | icon | sell | extra |
|---|---|---|---|---|
| iron_ore | Iron Ore | iron_ore | 40 | |
| gold_ore | Gold Ore | gold_ore | 150 | q: 2 |
| embersilver_ore | Embersilver Ore | embersilver_ore | 90 | |
| heavy_stone | Heavy Stone | heavy_stone | 15 | |
| iron_bar | Iron Bar | iron_bar | 60 | |
| steel_bar | Steel Bar | steel_bar | 90 | |
| gold_bar | Gold Bar | gold_bar | 200 | q: 2 |
| embersilver_bar | Embersilver Bar | embersilver_bar | 130 | |
| ironthistle | Ironthistle | ironthistle | 30 | |
| redmantle | Redmantle | redmantle | 35 | |
| stoutroot | Stoutroot | stoutroot | 45 | |
| dimleaf | Dimleaf | dimleaf | 50 | |
| goldspur | Goldspur | goldspur | 60 | |
| hermits_beard | Hermit's Beard | hermits_beard | 70 | |
| rimeleaf | Rimeleaf | rimeleaf | 80 | |
| heavy_leather | Heavy Leather | heavy_leather | 45 | |
| thick_leather | Thick Leather | thick_leather | 70 | |
| silk_cloth | Silk Cloth | silk_cloth | 25 | |
| silk_bolt | Bolt of Silk Cloth | silk_bolt | 80 | |
| smithing_coal | Smithing Coal | smithing_coal | 5 | cost: 25 |
| fine_thread | Fine Thread | fine_thread | 8 | cost: 30 |
| sturdy_vial | Sturdy Vial | sturdy_vial | 5 | cost: 20 |

Run `node tools/validate.js`: it will report the missing icons (expected until Task 7). Commit when Task 7 lands, or keep
going; do not commit a validate failure.

### Task 3: Nodes, leather and cloth by level

**Files:** Modify `src/data/professions.js` (`D.NODES`, `D.nodeTable`, `D.skinLeather`); `src/game.js` `profLoot`
(~line 1540).

1. `D.NODES` add: `iron: { name: 'Iron Deposit', prof: 'mining', skill: 125, item: 'iron_ore', n: [1, 2], extra:
   ['heavy_stone', 0.5] }`, `gold: { name: 'Gold Vein', prof: 'mining', skill: 155, item: 'gold_ore', n: [1, 1] }`,
   `embersilver: { name: 'Embersilver Vein', prof: 'mining', skill: 175, item: 'embersilver_ore', n: [1, 2], extra:
   ['heavy_stone', 0.4] }`, and herbs at skills 115 / 125 / 150 / 160 / 170 / 185 / 195 (`ironthistle`, `redmantle`,
   `stoutroot`, `dimleaf`, `goldspur`, `hermits_beard`, `rimeleaf`; names as the items).
2. `D.nodeTable(L)`: keep the three bands to L ≤ 21, then
   - `L <= 30`: ore `[['tin', 2], ['silver', 2], ['iron', L >= 26 ? 6 : 1]]`, herb `[['bruiseweed', 3], ['ironthistle',
     L >= 25 ? 4 : 0], ['redmantle', L >= 28 ? 3 : 0]]`
   - `L <= 38`: ore `[['iron', 6], ['silver', 1], ['gold', L >= 30 ? 1 : 0], ['embersilver', L >= 35 ? 3 : 0]]`, herb
     `[['redmantle', 2], ['stoutroot', 4], ['dimleaf', L >= 32 ? 3 : 0], ['goldspur', L >= 35 ? 2 : 0]]`
   - else: ore `[['iron', 3], ['embersilver', 6], ['gold', 1]]`, herb `[['goldspur', 3], ['hermits_beard', 4],
     ['rimeleaf', L >= 40 ? 3 : 0], ['dimleaf', 1]]`
   (Artisan replaces the last band above 45.)
3. `D.skinLeather = (lvl) => (lvl >= 40 ? 'thick_leather' : lvl >= 28 ? 'heavy_leather' : lvl >= 20 ? 'medium_leather'
   : 'light_leather')`. `D.skinSkill` already gives 150 at 30 and 225 at 45.
4. `profLoot`: humanoids of level 28+ drop `silk_cloth` (30%) instead of wool.

**Check (add to `sim/prof.js`):** `D.nodeTable(27).ore` includes iron; `D.nodeTable(41).herb` includes rimeleaf; a
level-32 beast skins into heavy leather; 200 level-32 humanoid loots give silk and no wool. Run, see it fail before the
change, pass after. Commit `Professions: Expert ore, herbs, leather and silk by level`.

### Task 4: Recipes

**Files:** Modify `src/data/professions.js` (items and recipes). Crafted gear uses `gear()` (drop curve). Every recipe
uses the default skill bands `[s, s+25, s+37, s+50]` unless shown.

**Mining (smelting):** `smelt_iron` 125 iron_ore→iron_bar; `smelt_steel` 165 {iron_bar 1, smithing_coal 1}→steel_bar;
`smelt_gold` 155 gold_ore→gold_bar; `smelt_embersilver` 175 embersilver_ore→embersilver_bar.

**Blacksmithing:** consumable `heavy_sharpening_stone` (slot stone, lvl 25, wdmg 6) from `bs_heavy_stone` 125
{heavy_stone 1}; gear (all mail or weapons):
| recipe | skill | item (name, slot, lvl, stats) | mats |
|---|---|---|---|
| bs_iron_boots | 150 | Iron Chain Boots, feet, 28, str sta | iron_bar 6, heavy_stone 1 |
| bs_iron_hauberk | 160 | Iron Hauberk, chest, 30, sta str | iron_bar 10 |
| bs_steel_warhammer | 170 | Steel Warhammer, weapon mace, 33, str sta | steel_bar 6, heavy_leather 1 |
| bs_steel_longsword | 175 | Steel Longsword, weapon sword, 34, str agi | steel_bar 6, heavy_leather 1 |
| bs_ember_gauntlets | 190 | Embersilver Gauntlets, hands, 38, str sta | embersilver_bar 6, steel_bar 2 |
| bs_ember_greaves | 205 | Embersilver Greaves, legs, 41, sta str | embersilver_bar 10, gold_bar 1 |
| bs_ember_breastplate (rare) | 215 | Embersilver Breastplate, chest, 44, q 3, str sta | embersilver_bar 14, gold_bar 2 |

**Leatherworking:** `heavy_armor_kit` (kit 24, lvl 25) from `lw_heavy_kit` 150 {heavy_leather 4, fine_thread 1};
`thick_armor_kit` (kit 32, lvl 38) from `lw_thick_kit` 200 {thick_leather 4, fine_thread 1}; gear (leather):
| lw_heavy_boots | 150 | Heavy Leather Boots, feet, 28, agi sta | heavy_leather 6, fine_thread 2 |
| lw_heavy_gloves | 160 | Heavy Leather Gloves, hands, 30, agi sta | heavy_leather 6, fine_thread 2 |
| lw_guardian_tunic | 175 | Guardian Leather Tunic, chest, 34, sta agi | heavy_leather 10, fine_thread 3 |
| lw_thick_belt | 190 | Thick Leather Belt, waist, 39, agi sta | thick_leather 6, fine_thread 2 |
| lw_thick_pants | 205 | Thick Leather Pants, legs, 41, agi sta | thick_leather 10, fine_thread 3 |
| lw_thick_jerkin (rare) | 215 | Thick Leather Jerkin, chest, 44, q 3, agi sta | thick_leather 14, gold_bar 1 |

**Tailoring:** `tl_silk_bolt` 150 {silk_cloth 4}→silk_bolt; `silk_bag` (bag 10, `woolen_bag` pattern) from `tl_silk_bag`
160 {silk_bolt 4, fine_thread 2}; gear (cloth, int-led):
| tl_silk_gloves | 155 | Silk Gloves, hands, 29, int sta | silk_bolt 2, fine_thread 1 |
| tl_silk_cloak | 165 | Silk Cloak, back, 32, int spi | silk_bolt 3, fine_thread 1 |
| tl_crimson_robe | 180 | Crimson Silk Robe, chest, 36, int spi | silk_bolt 5, redmantle 2, fine_thread 2 |
| tl_silk_leggings | 195 | Silk Leggings, legs, 40, int sta | silk_bolt 5, fine_thread 2 |
| tl_ember_robe (rare) | 215 | Embersilver-Threaded Robe, chest, 44, q 3, int spi, sp 14 | silk_bolt 8, embersilver_bar 2, fine_thread 3 |

**Alchemy** (potions and elixirs reuse today's icons):
| al_greater_healing | 155 | Greater Healing Potion, potion, lvl 28, heal [455, 585] | stoutroot 1, ironthistle 1, sturdy_vial 1 |
| al_mana | 160 | Mana Potion, potion, lvl 30, mana [455, 585] | redmantle 1, stoutroot 1, sturdy_vial 1 |
| al_agility | 165 | Elixir of Agility, elixir, lvl 32, agi 12 | dimleaf 1, ironthistle 1, sturdy_vial 1 |
| al_greater_defense | 175 | Elixir of Greater Defense, elixir, lvl 34, armor 200 | dimleaf 1, goldspur 1, sturdy_vial 1 |
| al_intellect | 185 | Elixir of Intellect, elixir, lvl 38, int 12 | goldspur 1, hermits_beard 1, sturdy_vial 1 |
| al_greater_mana | 195 | Greater Mana Potion, potion, lvl 40, mana [700, 900] | hermits_beard 1, rimeleaf 1, sturdy_vial 1 |
| al_superior_healing | 210 | Superior Healing Potion, potion, lvl 44, heal [700, 900] | rimeleaf 1, goldspur 1, sturdy_vial 1 |
| al_ironhide (rare) | 215 | Elixir of the Ironhide, elixir, q 2, lvl 44, sta 15 + armor 100 | rimeleaf 2, hermits_beard 1, gold_bar 1, sturdy_vial 1 |

Vendors: add `smithing_coal`, `fine_thread`, `sturdy_vial` to the vendor list in `src/game.js:437`.

**Check (add to `sim/prof.js`):** every Expert recipe's `makes` and `mats` exist in `D.ITEMS`; a smith at 175 with 12
iron ore and 6 coal smelts steel and makes a Steel Longsword. Commit `Professions: Expert recipes`.

### Task 5: Rare recipes drop by level

**Files:** Modify `src/game.js` `profLoot` and `G.rareRecipeDrop` (~lines 1551–1553), the call at ~2970.

A rare recipe drops for the dropper's level: `pickRare(level)` picks among `D.RARE_RECIPES` whose made item's `lvl` is
within 8 of the level (falls back to the nearest). `profLoot(mobKey, level, out)` passes its `level`;
`G.rareRecipeDrop(level)` takes the boss level from its caller.

**Check:** 300 drops at level 44 give only rare recipes for items of level 36–52 (the Expert rares); 300 at level 22
give only the Journeyman rares. Fail first, then pass. Commit `Rare recipes drop for the level they come from`.

### Task 6: The auction house trades Expert goods

**Files:** Modify `src/game.js:1395` (`goods`): `L0 >= 26` adds `iron_ore, iron_bar, ironthistle, redmantle,
heavy_leather, silk_cloth, greater_healing_potion`; `L0 >= 36` adds `embersilver_ore, stoutroot, dimleaf, goldspur,
thick_leather, silk_bolt, mana_potion`. Check in `sim/prof.js`: a level-38 player sees at least one Expert good after a
refresh. Commit.

### Task 7: Icons (art_icons11.js)

**Files:** Create `src/art_icons11.js` and `art/icons11/render.js` (copy the structure of `art_icons10.js` and
`art/icons10/render.js`: helpers, `NEW` table, fall-through `ART.icon`, `ART.keys.icons`); add `'src/art_icons11.js'`
after `'src/art_icons10.js'` in the `js` list in `build.py:72`.

22 keys: `iron_ore, gold_ore, embersilver_ore, heavy_stone, iron_bar, steel_bar, gold_bar, embersilver_bar, ironthistle,
redmantle, stoutroot, dimleaf, goldspur, hermits_beard, rimeleaf, heavy_leather, thick_leather, silk_cloth, silk_bolt,
smithing_coal, fine_thread, sturdy_vial`. House style (64×64, school-tinted radial background, bold glyph, `#1a1009`
outline, vignette and bevel). Ores and bars follow `copper_ore` / `copper_bar` in `art_icons3.js` with their own colours
(iron dark grey, gold yellow, embersilver silver with an ember-orange glow); leather follows `light_leather`; herbs each
get a distinct silhouette, not a recolour.

**Check:** `node art/icons11/render.js` → `OK: 22 icons, 0 problems`; look at `art/icons11/out/sheet_compare_64.png`
(each new icon next to its nearest existing one) and fix anything that reads as the old icon. `node tools/validate.js`
→ `data OK`. Commit `Icons for the Expert materials`.

### Task 8: The pace (sim/prof.js)

**Files:** Modify `sim/prof.js`.

Add a levelling run: a level-25 character with Mining and Blacksmithing at 150, levelling to 45 over the game's real
level pace (use the existing `gatherHour` per zone band: 26, 32, 38, 43, an hour each), smelting what it mines and
crafting the cheapest yellow recipe each hour. Check: mining reaches ≥ 215 and blacksmithing ≥ 200 by the end; the same
for Herbalism + Alchemy and Skinning + Leatherworking. If short, raise node weights or `n`, never the skill chance.
Commit `sim/prof.js: Expert pace while levelling`.

### Task 9: Screens and the full build

1. `python3 build.py` (runs validate, lorekeeper, every gated sim including `sim/prof.js` if it is in the list; if not,
   add it to the sim calls in `build.py`).
2. In the browser preview (`dist-8778`): a level-30 character at a trainer sees "Expert (225)" with its price; at a
   level-32 wild place, an Iron Deposit and a Stoutroot show and can be gathered; the recipe list shows the new recipes
   with colours; a Steel Longsword crafts. Screenshot at phone width.
3. Commit, then ship as a beta (version code 86+, `gh release create --prerelease`, `tools/publish_web.sh --beta`; no
   iCloud, no itch.io for betas).
