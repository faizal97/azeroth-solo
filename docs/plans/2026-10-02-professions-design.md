# Expert and Artisan professions, Cooking and Fishing: design

Professions from skill 150 to 300, two new secondary skills with minigames, and level-60 crafting that matters without
being required. Roadmap item 5. Agreed 2026-10-02.

## Why

Professions stop at Journeyman (150) and every recipe, ore, herb and leather is tuned for levels 1–25. From 25 to 60,
where most players now are, professions have nothing to give. Cooking and Fishing don't exist: food and drink are shop
items only.

## 1. Ranks and reach

| Rank | Skill | From level | Covers levels |
|---|---|---|---|
| Apprentice | 1–75 | 5 | 1–15 (today) |
| Journeyman | 76–150 | 10 | 15–25 (today) |
| **Expert** | 151–225 | 30 | 25–45 |
| **Artisan** | 226–300 | 45 | 45–60 |

- **Primary professions stay as they are:** Mining, Herbalism, Skinning, Blacksmithing, Alchemy, Leatherworking,
  Tailoring; two per character.
- **Cooking and Fishing are secondary skills:** anyone can learn both on top of their two primary professions (they use
  no slot), with the same four ranks.
- **Skill rises as today:** recipe colours (orange, yellow, green, grey), gathering bands, smelting in Mining.
- **Recipes:** trainers, plus rare recipes from dungeon bosses and zone rares (and, at Artisan, level-60 dungeon bosses and
  Trials chests).
- **Pace:** a player who gathers and crafts as they level reaches 225 around level 45 and 300 around 60, with no grind.
- **Names:** every new material, item and recipe takes a name from our world, picked by the lorekeeper; none from Warcraft.

## 2. Fishing and Cooking

**Fishing**
- Places with water carry a fishing spot in data (`fish: level`): lakes, rivers, coasts, harbours. Better fish in
  higher-level water. A "Fish" action joins the place panel's gather actions.
- **Minigame, bite then reel:** cast, wait 2–8 s, tap when the bobber dips. Inside the window a common fish lands. Big
  and rare fish then fight: a reel bar, hold to rise and release to fall, keeping the fish in a moving zone until the
  line fills. Rarer fish move faster in smaller zones. A miss loses the fish, nothing else.
- **Rare catches:** a few per region (a trophy fish, a keepsake), each with a "where and at what skill" line.

**Cooking**
- Uses fish, and meat that beasts drop on loot (like skinning today).
- **Minigame, heat timing:** a needle sweeps a heat bar, tap to stop it. Gold zone: **Perfect** (one extra serving per
  five, or a slightly stronger well-fed buff). Normal zone: a normal batch. Burnt: one set of ingredients is lost. Better
  recipes have smaller gold zones. **One round cooks the whole batch.**
- Makes food that restores more than shop food, and **well-fed meals** (a small stat buff for 30 min).

**Both:** an **Auto** option always gives the normal result (fishing auto catches only common fish; cooking auto is
never Perfect). Skill counts either way. Playing well gives a bonus; skipping is never a loss.

## 3. Expert and Artisan content

One material tier per gathering skill per rank, about 6–8 recipes per craft per rank:

- **Mining:** an iron tier (25–45) and a high-metal tier (45–60), plus one rare precious vein per rank; new bars to smelt.
- **Herbalism:** 3–4 herbs per rank by zone level.
- **Skinning:** heavy (25–40), thick (40–50), rugged (50–60) leather by the beast's level.
- **Cloth** (humanoid drops) for Tailoring: a silk tier (30–45) and two higher tiers.
- **Blacksmithing:** mail armour and weapons; a sharpening stone and a weightstone per tier.
- **Leatherworking:** leather armour; armour kits per tier.
- **Tailoring:** cloth armour; bags of 10, 12 and 14 slots.
- **Alchemy:** healing and mana potions per tier, elixirs, and at Artisan **flasks** (one long buff that lasts through
  death).
- **Cooking:** about 8–10 recipes per rank.
- **Crafted gear** is on the drop curve (`gear()` in professions.js): mostly greens, a few blues per rank from rare
  recipes. **Catch-up at 60:** a few crafted blues per armour type for a fresh 60 or an alt; raid loot stays above them.

## 4. Level 60: the modest edge and collections

- **One of each kind:** a flask *or* up to two elixirs, a well-fed meal, a weapon stone or armour kit, potions on their
  2 min cooldown. A full set makes you **about 5% stronger.**
- **Never required:** Trials, raids and Hard modes keep today's tuning and targets, measured without consumables. A
  second sim pass with the full set must show about 5%, not 20%; a consumable that pushes past it is toned down.
- **Bots use them sometimes,** so groups keep up and the market has buyers.
- **Collections at Artisan:**
  - crafted looks for the shared wardrobe (a set per armour craft, a few weapon looks), only from crafting;
  - one keepsake per skill (an anvil pet, a bubbling flask, a prize catch on display), and a crafted mount for
    Blacksmithing or Leatherworking if the art holds up;
  - a title at 300 for each skill ("the Master Smith", "the Angler", "the Chef").
- **Bounded on screen:** "245 / 300 · Artisan" per skill; each collection row says what is missing and where it comes
  from (docs/design-mindset.md).

## 5. Screens, proof and rollout

**Screens**
- Hero → Professions: one row per skill (two primary, then Cooking and Fishing), skill / max and rank; tap for the
  recipe list.
- Fishing: the place panel's "Fish" opens an overlay on the scene (bobber, tap, reel bar) with an Auto toggle.
- Cooking: recipe and amount, then the heat-bar round (or Auto); the result shows Perfect, Normal or Burnt and the
  servings.
- Every buff names its source ("Well Fed: +12 Stamina, 30 min"); each minigame says what Perfect or a rare catch gives
  before you try.

**Proof** (sims in the build)
- `sim/prof.js`: 225 around level 45 and 300 around 60 while levelling, without grinding.
- A fishing and cooking sim: catch rates by skill, Perfect rates for an average player, Auto gives the normal result.
- The consumable pass (section 4): about 5% with a full set; today's targets met without.
- Lorekeeper and `tools/validate.js` on every new name, item and recipe; art contact sheets for every new icon.
- **Saves:** old characters load with no Cooking or Fishing skill; nothing is migrated away.

**Rollout, three betas**
1. **Expert (151–225)** for the seven primary professions, levels 25–45.
2. **Fishing and Cooking**, 1–225, with both minigames.
3. **Artisan (226–300)** for all nine skills: flasks, catch-up blues, collections.
