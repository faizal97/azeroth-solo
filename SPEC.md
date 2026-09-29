# Realm of Loner — shared spec (v1, historical)

Single-player "MMO" (the original v1 scope). Accord, Human, levels 1–10.
Halden Vale → Ambermoor (Brackenford hub) → The Smugglers' Deep (scaled to lvl 10–12).
Every other player is a simulated bot. Runs as one HTML page on a phone (~400px wide).

## Files
- `src/art.js`    — all visuals as SVG strings. Defines `window.ART` (see API below). No external assets.
- `src/data.js`   — classes, abilities, mobs, zones, quests, items, dungeon.
- `src/bots.js`   — simulated population, chat generator, offline catch-up.
- `src/engine.js` — combat loop, threat, party AI, loot.
- `src/ui.js`     — rendering + input.
- `src/style.css`
- `build.py`      — inlines everything into `dist/index.html`.

## ART API (contract between art.js and the game)
All functions return a complete `<svg ...>...</svg>` string (with xmlns), transparent background
unless stated. Never include text/letters in art. The game places them with `<img src="data:image/svg+xml;utf8,...">`
or innerHTML, so every id inside an SVG must be unique per call (use a counter suffix) to avoid gradient clashes.

- `ART.mob(key)` — viewBox `0 0 128 128`, creature standing on the bottom edge (feet at y≈124),
  FACING LEFT (towards the player). Keys:
  - Halden: `young_wolf`, `kobold_vermin`, `kobold_worker` (candle on head), `defias_thug` (red bandana mask), `garrick_padfoot` (bigger defias, leader look)
  - Ambermoor: `mangy_wolf`, `prowler` (dark wolf), `young_forest_bear`, `kobold_laborer`, `kobold_tunneler` (pick), `murloc_streamrunner`, `murloc_forager`, `defias_bandit`, `riverpaw_gnoll`, `princess` (big boar), `hogger` (big gnoll, elite look)
  - Smugglers' Deep: `defias_miner` (pick), `defias_pirate` (eyepatch/bandana), `goblin_engineer`, `rhahkzor` (ogre), `sneed_shredder` (goblin shredder robot), `gilnid` (goblin smelter), `mr_smite` (tauren first mate), `cookie` (murloc with chef hat), `vancleef` (defias boss, hat + cape)
- `ART.hero({cls, skin, hair, gender})` — viewBox `0 0 128 128`, humanoid Human FACING RIGHT.
  `cls` ∈ `warrior|mage|priest|rogue`; outfit reads by class (warrior mail+sword, mage robe+staff,
  priest white/gold robe, rogue leather+daggers+hood). `skin` 0–3, `hair` 0–4, `gender` 'm'|'f'.
  Used for the player and for bots (bots vary skin/hair/gender).
- `ART.portrait({cls, skin, hair, gender})` — viewBox `0 0 64 64`, head-and-shoulders, circular-crop friendly.
- `ART.scene(key)` — viewBox `0 0 400 240`, OPAQUE full background painting, horizon around y≈150, open
  ground at the bottom third for sprites to stand on. Keys:
  `northshire_abbey`, `echo_ridge` (mine entrance), `vineyards`, `goldshire` (Bracken Arms Inn), `fargodeep` (mine),
  `crystal_lake`, `brackwell` (pumpkin patch farm), `forests_edge` (gnoll camp), `deadmines_mine`, `deadmines_ship` (cove + pirate ship).
- `ART.icon(key)` — viewBox `0 0 64 64`, square action-bar style icon (full-bleed painted square, beveled).
  - Abilities: `attack`, `heroic_strike`, `battle_shout`, `charge`, `rend`, `thunder_clap`, `fireball`, `frost_armor`,
    `frostbolt`, `fire_blast`, `arcane_missiles`, `smite`, `lesser_heal`, `pw_fortitude`, `sw_pain`, `pw_shield`, `renew`,
    `sinister_strike`, `eviscerate`, `gouge`, `evasion`, `slice_and_dice`, `eat`, `drink`
  - Items: `sword`, `dagger`, `mace`, `staff`, `wand`, `axe`, `chest_cloth`, `chest_leather`, `chest_mail`, `legs`,
    `boots`, `gloves`, `cloak`, `belt`, `bracers`, `ring`, `bread`, `water`, `meat`, `candle`, `bandana`, `fin`, `dust`,
    `head`, `claw`, `armband`, `grapes`, `pelt`, `coin`, `chest_box` (loot chest), `hearthstone`
- `ART.keys` — `{mobs:[...], scenes:[...], icons:[...]}` listing every supported key.
- Unknown key → return a neutral placeholder SVG (never throw).

## Palette hints (classic MMO conventions)
Class colours: warrior #C79C6E, mage #69CCF0, priest #FFFFFF, rogue #FFF569.
Item quality: poor #9d9d9d, common #ffffff, uncommon #1eff00, rare #0070dd, epic #a335ee.
Ambermoor: lush greens, warm afternoon light. Halden: golden abbey stone, blue roofs.
Smugglers' Deep: dark rock, lantern orange, sea teal.
