# v10 naming: leaving Blizzard's world

Status: draft for review (2026-09-29). Nothing in the game changes until the decisions below are made.

## Goal

v10 is a complete overhaul that disconnects the game from Blizzard's intellectual property: every name, and then the
story, becomes our own. This document covers **names first**. The story rewrite comes after it and gets its own plan.

## What changes and what stays

**Changes:** everything a player reads that comes from Warcraft.

| Area | Count today | Notes |
|---|---|---|
| Game name | 1 | "Azeroth Solo" |
| World and factions | 1 + 2 | Azeroth, the Alliance and the Horde |
| Regions and places | 26 and 197 | Elwynn Forest, Stormwind, Goldshire… |
| NPCs | 230 | Marshal Dughan, VanCleef… |
| Monsters and bosses | 514 | the monster types are mostly generic; the named ones are Blizzard's |
| Quests | 760 | **the titles are copied from WoW word for word** (e.g. "Wolves Across the Border", "Princess Must Die!"), so every one gets a new title |
| Items | 798 | generated gear is already ours; named items get new names |
| Abilities and talents | 231 and 27 | generic names stay (Fireball, Heal); distinctive ones change (Seal of Righteousness, Devotion Aura) |
| Dungeons and raids | 42 | Deadmines, Molten Core… |
| Peoples | 8 | Night Elf, Tauren and Undead need new identities; the rest are generic fantasy |

**Stays:**
- The engine and every system: combat, simulated players, chat, guilds, group finder, professions, updater and UI.
- Our art style, music and sound.
- **Saves.** Players see names; the game stores internal IDs (`goldshire`, `vancleef`). v10 only changes the names,
  so existing characters carry over untouched. Renaming the IDs can come later, with a save migration.
- The Android package ID, so v10 installs over v9.
- The repo and web address (`azeroth-solo`) for now. GitHub Pages does not redirect a renamed repo, so moving the
  address is a separate, later step.
- Our original content: the Drowned Crown expansion, Lyveus and the Legends system, and the realm name Starlight.
  Their hooks into Blizzard's story (Onyxia's storm) are rewritten in the story phase.
- Generic fantasy: humans, dwarves, gnomes, orcs, trolls, elves, kobolds and gnolls; the nine classes; talents; dungeons.

## Decisions, in order

Each needs your pick before the next. Recommendations are marked.

### 1. The game's name

**Decided (2026-09-29): Realm of Lone.** No existing game with that name was found.

| Option | Why | Check |
|---|---|---|
| **Realm of One** (recommended) | Says the premise: one real player, a whole realm around you. Does not depend on the world's name, so it survives story changes | No existing game found |
| Caldreth Solo | Keeps the "X Solo" shape players know | Depends on decision 2 |
| Lone Realm | Short, plain | Not checked yet |

### 2. The world's name (replaces Azeroth)

**Decided (2026-09-29): Caldreth.** "Realm of Lone" is only the game's title; the world is Caldreth.

| Option | Feel | Check |
|---|---|---|
| **Caldreth** (recommended) | Old, weathered, a little dark | Not a Warcraft name (only player characters use it); no game found |
| Ostmarch | Borderland, wars on the frontier | Not a Warcraft name; better as a kingdom than a world |

Rejected during checks: **Thalmere** (a barony in Warcraft lore), **Valdera** (a Warcraft NPC, and too close to
Valeera and Valdrakken), **Everwyn** (sounds like Elwynn).

### 3. The two factions (replace the Alliance and the Horde)

**Decided (2026-09-29):**

| Old | New | Note |
|---|---|---|
| Alliance | **Accord** | |
| Horde | **Krugar** | their own word; no Warcraft match (nearest: Krugah, Krug Skullsplit) |
| Eastern Kingdoms | **Ostmarch** | "the eastern borderland" |
| Stormwind City | **Kingsmere** | |
| Kalimdor | **Redmarch** | pairs with Ostmarch; Korgzath was rejected (too close to Kargath/Korgath) |
| Orgrimmar | **Vazhrak** | the Krugar capital; nearest Warcraft name is Vadrak (a minor NPC) |

The proposal below (the Free Clans) was rejected; so were the Unbound and the Warbands (both Warcraft names). Also rejected in checks: Westreach (a WoW village), Ashvael (too close to Ashenvale), Emberreach (a WoW spell), Sunderwild (echoes the Sundering).

- **The Accord** (recommended): the old kingdoms of humans, dwarves, gnomes and elves, bound by treaty.
- **The Free Clans** (recommended): orcs, trolls and their allies, who answer to no crown.

Alternatives: the Concord and the Warbands.

### 4. The peoples that need new identities

**Decided (2026-09-29): Wood Elf, Hornfolk, and Undead stays** ("Undead" is generic; "Risen" was dropped: an existing game series, and WoW's name for undead monsters).

| Today | Proposal | Idea |
|---|---|---|
| Night Elf | **Wood Elf** | a forest people; keeps the look, drops Blizzard's history |
| Tauren | **Hornfolk** | tall, horned plains people with their own name and culture |
| Undead (Forsaken) | ~~Risen~~ **Undead** (kept) | the dead who woke with their minds their own |

Human, Dwarf, Gnome, Orc and Troll stay.

## World lexicon (decided by the lorekeeper, 2026-09-29)

The recurring words every region shares. The full map, with every name, is `tools/rename_v10.json`
(see `docs/plans/v10-names-inventory.md`).

| Kind | Old → new |
|---|---|
| Cities | Stormwind → Kingsmere · Orgrimmar → Vazhrak · Ironforge → Keldrun · Darnassus → Nyrwen · Gnomeregan → Gearhollow · Thunder Bluff → Hornwind Mesa · Undercity → Gravenhold · Lordaeron → Wexmoor · Theramore → Harborwatch · Gadgetzan → Coppergulch |
| Peoples | Night Elf → Wood Elf · Tauren → Hornfolk · Forsaken → Reclaimed · Highborne → Starborn · Murloc → Mireling · Quilboar → Spinehide · Furbolg → Bearkin · Worgen → Werewolf · Trogg → Cavekin · Kodo → Dustback |
| Orders and powers | Defias → the Grey Hoods · Scourge → the Hollow Host · Scarlet Crusade → the Order of the Pyre · Argent Dawn → the Lantern Watch · Dark Iron → Slagborn · Blackrock → Cinderpeak · Burning Legion → the Unmaking · Well of Eternity → the Heartfire · Black Dragonflight → the Black Brood · Venture Co → Deepgold Company · Syndicate → the Black Ledger · Kul Tiras → Brineholt · Darkspear → Kessari · Hearthstone → Waystone |
| The story's people | Deathwing → Ossarak · Katrana Prestor / Onyxia → Meriel Thorne / Veshmira · Bolvar Fordragon → Lord Regent Edmund Carrow · Varian / Anduin Wrynn → King Rhodric / Prince Tamlin Aldane · Reginald Windsor → Marshal Gideon Hale · Edwin VanCleef → Corvin Blackwell · Victor Nefarius / Nefarian → Lord Kethran Vale / Kethriax · Ragnaros, the Firelord → Vulcarn, the King Below · Dagran Thaurissan → Emperor Haldor Grimmark · Thrall → Grask |
| Dungeons so far | The Deadmines → The Smugglers' Deep · Blackrock Depths / Spire → Cinderpeak Depths / Spire |

Rejected in checks, on top of the ones above: Ravencourt (a Warcraft place) and Ignarak (a fire giant in Grim Dawn).

## Naming rules

1. **No echoes.** A new name must not be a synonym, translation, anagram or sound-alike of the Blizzard name.
   Goldshire → Silvershire is still Goldshire. Elwynn → Everwyn is still Elwynn.
2. **Check every name that matters** (world, factions, regions, capitals, dungeons, main characters, bosses) against
   the Warcraft wikis and for existing games before it goes in. Minor NPC names get a quick look.
3. **Each people has its own sound.**
   - Accord humans: plain English compounds and old-English given names (Brackenford, Aldous).
   - Dwarves: hard Norse-like consonants.
   - Gnomes: tinkerer nicknames.
   - Elves: soft vowels.
   - Orcs: short, guttural names.
   - Trolls: their own original style, not a real-world accent.
4. **Readable on a phone.** Two or three syllables for places people type or say; no apostrophe clusters.
5. **Keep the jokes, change the joke.** A named pig that must die can stay a named pig; it just is not Princess.
6. **Titles stay generic** (Marshal, Innkeeper, Weaponsmith); only the names change.

## Sample: the human start (Northshire, Elwynn, Stormwind)

This shows the feel. It is not final: the full map is written region by region, and you review each region.

**Places**

| Today | v10 |
|---|---|
| Elwynn Forest | Ambermoor |
| Northshire Valley / Abbey | Halden Vale / Halden Abbey |
| Echo Ridge Mine | Tinder Hollow |
| Northshire Vineyards | Halden Vineyards |
| Goldshire | Brackenford |
| Fargodeep Mine | Deepcut Mine |
| Crystal Lake | Stillwater Lake |
| Brackwell Pumpkin Patch | Tamsin's Pumpkin Patch |
| Forest's Edge | Greywood Verge |
| Stormwind City | Kingsmere |
| Valley of Heroes / Trade District | Hall of Banners / Market Ward |
| The Deadmines | The Smugglers' Deep |

**People**

| Today | v10 |
|---|---|
| Marshal McBride | Marshal Aldous Venn |
| Deputy Willem | Deputy Harlan |
| Marshal Dughan | Marshal Brede |
| Innkeeper Farley | Innkeeper Maudie |
| Remy "Two Times" | Pell "Twice Over" |
| William Pestle | Tobin Ashcombe |
| Corina Steele | Gretta Holloway |
| Milly Osworth | Nell Harrow |
| Ma Stonefield | Old Ma Dunmere |
| Brother Danil | Brother Cade |

**Monsters**

| Today | v10 |
|---|---|
| Murloc Streamrunner / Forager | Mireling Streamrunner / Forager |
| Defias Thug / Bandit | Grey Hood Thug / Bandit (the Brotherhood is renamed the Grey Hoods) |
| Riverpaw Gnoll | Tallgrass Gnoll |
| Garrick Padfoot | Jory Blackthumb |
| Princess (the boar) | Duchess |
| Hogger | Old Snaggle |
| wolves, bears, prowlers, kobolds | unchanged (generic) |

**Quest titles**

| Today | v10 |
|---|---|
| Wolves Across the Border | Wolves at the Abbey Wall |
| Kobold Camp Cleanup | Clear Out Tinder Hollow |
| Brotherhood of Thieves | Hoods in the Vineyard |
| Report to Goldshire | The Road to Brackenford |
| Princess Must Die! | Duchess Has Eaten Her Last Pumpkin |
| Wanted: Hogger | Wanted: Old Snaggle |

## How the rename is done safely

- **A name map, region by region.** Old name → new name for every place, NPC, monster, quest, item, ability and
  dungeon, in one reviewed file. A script applies it to the data files, so nothing is renamed by hand and nothing
  is missed.
- **A forbidden-names check.** The lorekeeper gets a list of every Blizzard name we used, and the build fails if
  any of them appears in anything a player can read. That is how we know the disconnect is complete, not hoped.
- **The lore bible** (`docs/lore/canon.md`) is rewritten with the new names, so the lorekeeper keeps guarding
  consistency.
- **Chat and bots** read names from the data, so they follow the map; the few hard-coded lines are found by the
  forbidden-names check.

## Phases

1. **This document:** decisions 1–4. One session.
2. **The name map and tools:** the forbidden-names check, then the map for all 26 regions (about two regions per
   review). The largest part: roughly 2,500 names.
3. **Story:** a new conspiracy and villains, new raid bosses, rewritten cutscenes, lore pages and quest text. Its own
   plan.
4. **Art pass:** redraw the few pictures that show Blizzard characters or landmarks (VanCleef, Hogger, the Stormwind
   gate). Icons and monsters are already generic.
5. **Ship v10.0.0 through beta first.** Friends test it, then it goes out as a normal release, and the post
   announcing it avoids Blizzard's names.

## Open questions

- Should the repo and web address move to the new name at v10, or later?
- Keep Starlight as the realm name? (It is ours already.)
- Do the Drowned Crown's names (Sael'anor, Nal'veshra, Shal'zua) stay? They are original, but their apostrophe
  style echoes Warcraft's.
