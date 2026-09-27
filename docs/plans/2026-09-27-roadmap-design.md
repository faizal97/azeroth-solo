# Azeroth Solo roadmap

Agreed 2026-09-27. A single-player fake MMO: a vanilla WoW campaign from 1 to 60, Alliance and Horde, in which every other player is simulated. After 60 the story is our own, not TBC.

## Principles

- **World and game systems lead.** Each update adds a zone, or a race's starting zone, and the Classic systems that unlock in that level range.
- **Systems unlock at Classic's own levels.** Talents at 10, mount at 40, raids and battlegrounds at 60.
- **Other players are scenery.** You see them in the world, they take mobs before you do, fill group finder slots and raids, and post in chat. No social systems: no friends list, whisper conversations, rivals or Claude-written chat. Bots follow new content automatically (new classes, races and zones).
- **Main path (agreed 2026-09-27, replacing the lean path).** About 12 zones per faction, the way most Classic players levelled, plus the key dungeons. Each zone covers a few levels, which keeps levelling varied. From 30 the zones are contested and shared by both factions.
- **One update at a time.** Each is an APK in iCloud Drive `Azeroth Solo/`. Feedback from playing one update shapes the next.
- **Saves stay compatible.** Save key `azsolo.save.v1`; every update migrates old saves forward.

## Releases

| Update | Content | Unlocks |
|---|---|---|
| v1 (shipped) | Northshire + Elwynn (1–10), Human, Warrior/Mage/Priest/Rogue | Group finder, Hogger, Deadmines scaled to 10 |
| v1.1 | Fixes from the first real-phone session | — |
| v1.5 (shipped) | Paladin, Warlock, Hunter, Druid | Seals/Judgement and Paladin role choice; Warlock Imp and Voidwalker; Hunter bow + tame a beast at 10; Druid Bear Form at 10 |
| v1.5.1 | Unique gear shows on your character | Named dungeon and rare-boss items change the hero sprite |
| v1.6 (shipped) | Dun Morogh: Coldridge Valley, Kharanos, Ironforge (Dwarf, Gnome, 1–10) | Ironforge as a second city; Vagash (3-player elite); Deeprun Tram to Elwynn brought forward |
| v1.7 (shipped) | Teldrassil: Shadowglen, Dolanaar, Darnassus (Night Elf, 1–10) | Boat to the Eastern Kingdoms at 10 |
| v1.8 (shipped) | **Horde:** Durotar + Orgrimmar (Orc, Troll, 1–10) | Faction choice at character creation; Ragefire Chasm; Alliance and Horde bots see each other as enemies |
| v1.9 (shipped) | **Horde:** Mulgore + Thunder Bluff (Tauren), Tirisfal Glades + Undercity (Undead) | Zeppelins between Horde cities |
| v1.10 (shipped) | **AI chat pack** (optional, on-device) + levels 5–10 quest fill (42 quests) | Uses (agreed): bot chat; party and dungeon banter that reacts to events; the welcome-back story; NPC flavour lines (objectives unchanged); player bios when you tap someone. The model writes words and never decides outcomes. Written by a local model: Gemma 3 1B on phones with 6 GB+ RAM, 270M on 3–6 GB, off below; loaded from iCloud as a separate file; behaviour stays rule-based; templates as fallback; battery guards (pre-generated line bank, quiet moments only, stops under 30% or in battery saver, refills while charging, heat pause, battery meter in Hero) |
| v2.0 (shipped) | Westfall (Sentinel Hill) · **Horde:** the Barrens (Crossroads), levels 10–15 | Level cap 15; new class abilities at 12 and 14; ~14 quests per zone with a named rare |
| v2.1 + v2.2 (shipped) | Westfall + the Barrens 15–20 | Level cap 20; The Deadmines at its real level (17–21); Wailing Caverns; story Chapter 2 at 20; world PvP ambushes (see below) |
| v2.2 (shipped as app v2.3.0) | Talents | Talents from 10, one point per level: 3 trees per class, tiers 1–3 now (deeper tiers with the 30+ updates); bots auto-spec for their role; first reset free, then 1g/5g/10g |
| v2.3 (shipped as app v2.4.0 + v2.5.0) | Stormwind (and the Horde city services) | Stormwind (Valley of Heroes, Trade District, bank); a bank (24 slots) and auction house in every capital; Help Wanted + Mentor Marks + heirlooms; titles; daily Roulette; hub bounty boards (3 daily + 1 weekly). Tram now runs Ironforge–Stormwind |
| v3 | Redridge Mountains (18–25) · **Horde:** Stonetalon Mountains (18–25) | Professions (shipped first, as app v2.6.0): Mining, Herbalism, Skinning, Blacksmithing, Alchemy, Leatherworking, Tailoring; two per character, skill to 150 (Apprentice 75, Journeyman 150; Expert 225 with the 30s zones); nodes in every wild place, skinning on loot, potions (combat, 2 min cooldown), elixirs, sharpening stones, armour kits, bags (4 slots), rare plans from bosses and rares, trade goods on the auction house. Then level cap 25, the two zones and The Stockade |
| v4 | Duskwood + Wetlands (20–30) · **Horde:** Hillsbrad Foothills; Ashenvale (contested) | Shadowfang Keep; Blackfathom Deeps; story Chapter 3 at 30 |
| v5 | Stranglethorn Vale + Arathi Highlands (30–40, contested from here) | Mount at 40; Scarlet Monastery; Gurubashi Arena event; story Chapter 4 at 40 |
| v6 | Tanaris + Feralas (40–50) | Zul'Farrak; Maraudon; world bosses |
| v7 | Un'Goro Crater + Burning Steppes (48–55) | Blackrock Depths; story Chapter 5 at 50 |
| v8 | Western Plaguelands + Winterspring (55–60) | Level cap 60; Scholomance or Stratholme; story Chapter 6 at 60 |
| v9 | Endgame at 60 | Molten Core and Onyxia (40 bots), the last power step; keystone dungeons; account-wide wardrobe; battlegrounds |
| v10+ | Our own expansion | Original story, new zones, dungeons and raids, all horizontal (see below) |

## Story and cutscenes

- The story is the Black Dragonflight conspiracy (Lady Prestor / Onyxia, the Defias, Blackrock). The intro plays after character creation, then a chapter plays at 10, 20, 30, 40, 50 and 60. Every chapter ships with the update that opens its level.
- **Every dungeon and raid ships with a lore intro** that plays the first time any character enters (account-wide, once). The group waits while it plays.
- The Theater replays everything unlocked, with Story and Dungeons & Raids sections.

## After 60: horizontal progression

Agreed 2026-09-27. Power stops climbing; what you collect and what you can do keeps growing.

- **Power ceiling.** Molten Core and Onyxia epics are the last step up in raw power. Everything after that (including our own expansion) adds options and looks, not bigger numbers.
- **Challenge is the loop.** Every dungeon returns as a level-60 keystone dungeon. The affixes rotate with the real calendar week, and tiers +1 to +20 make enemies harder, not you stronger. Power is normalised inside keystones, so skill and group comp decide the run, not gear.
- **Collections are the reward.** Each dungeon and raid has its own looks, titles and mounts, plus rare-boss trophy variants and a codex of every boss beaten. The wardrobe is account-wide: looks earned on one character can be worn by all.
- **Synced power (agreed 2026-09-27).** New raids may raise the gear ceiling, so they feel like upgrades. Every dungeon and raid has its own power cap: on entry your stats scale down to that cap plus a +10–15% overgear bonus, so old content stays a real fight and never becomes a one-shot. (Precedents: FFXIV item level sync, GW2 downscaling, ESO One Tamriel.)
- **Drops carry unique effects.** Build-changing procs and set bonuses (a pet-taunt trinket, a chaining Fireball staff, a Bear Form self-heal set) are sidegrades that open builds. They scale with sync, so old dungeon effects stay useful forever.
- **Reasons to go back.** A weekly featured old dungeon with bonus rewards; resistance or attunement gear from older raids that newer raids ask for (as Nefarian needed the Onyxia Scale Cloak).
- **Help Wanted (from v2).** Bots post help requests in the group finder ("first-time Deadmines needs a tank", "stuck on Mr. Smite, need a healer"). You join mid-run, synced to the dungeon's cap, as the carry in a group that can still wipe. Rewards are Mentor Marks (more for first-timers, a bonus for a no-wipe clear), spent on account-wide heirloom gear that scales with an alt's level, veteran looks and titles. A daily Roulette gives a random old dungeon with bonus rewards.
- **New content never makes old content obsolete.** New dungeons and raids join the keystone pool next to the old ones. Their rewards are new looks, titles, mounts and sidegrades (situational gear such as resistances or set bonuses that change how you play), never flat upgrades that retire older gear. Old dungeons keep their own unique rewards.
- **Old zones stay alive.** Rare elites and world bosses return at 60 with trophies.
- **Alts are breadth.** The shared wardrobe and character slots make levelling another class worthwhile.

## Horde

Agreed 2026-09-27. The Horde is fully playable. Each faction has its own zones up to 30, and each update ships the Alliance and Horde zone of a bracket together. From Stranglethorn (30) on, the main path uses contested zones both factions share, so the Horde needs no separate content past 30. Opposite-faction bots appear in contested zones as enemies (from v2.1 they can also ambush you; see World PvP ambushes).

## Races and classes

**House rule (2026-09-27): any race can play any class.** The Classic list below is for reference only.


- Human: Warrior, Paladin, Rogue, Priest, Mage, Warlock
- Dwarf: Warrior, Paladin, Hunter, Rogue, Priest
- Gnome: Warrior, Rogue, Mage, Warlock
- Night Elf: Warrior, Hunter, Rogue, Priest, Druid
- Orc: Warrior, Hunter, Rogue, Shaman, Warlock
- Troll: Warrior, Hunter, Rogue, Priest, Mage, Shaman
- Tauren: Warrior, Hunter, Druid, Shaman
- Undead: Warrior, Rogue, Priest, Mage, Warlock

The Horde brings Shaman, its own class (Paladin is Alliance-only in Classic). Under the house rule, both factions may get both.

## World PvP ambushes (agreed 2026-09-27; shipped in v2.0.2)

Enemy-faction bots sometimes attack you, even in friendly zones.

- **Danger per place:** capitals and starting valleys 0. Faction hub towns are very rare, and guards join on your side. Friendly questing zones are low. Contested zones (from v4) are high, and enemy territory is highest.
- **Enemies arrive first (2026-09-27):** an enemy player shows up in the scene and under People, like any other player, before anything happens. About 70% attack after 25–60 seconds if you're still there (55% in towns); the rest only pass through. You can attack them first, or walk away.
- **The fight:** an enemy bot of your level ±2, using its real class and abilities. A rare high-level "skull" ganker appears only in dangerous zones. You can fight or try to run, and nearby players of your faction sometimes join.
- **Rewards:** a kill tally and small trophies; honour ranks come later with battlegrounds. Death is the normal death, with nothing extra.
- **Guardrails:** a cooldown between ambushes; never during quest turn-ins, dungeons or cutscenes; a War Mode switch in Hero; no camping your corpse.
- **Chat reacts,** for example "Horde in Goldshire!!", and defenders gather.
- **War Mode incentive (agreed 2026-09-27):** +10% XP and gold while it is on. World PvP kills earn Honor, spent only on PvP looks: titles ("Defender of Goldshire", "Crossroads Raider"), a faction tabard, and later a war mount at 40. Named gankers drop unique trophies. Honor never buys power, so War Mode stays optional.
- **Wanted bounties:** a named enemy player now and then marked on the hub board, worth bonus Honor. They tie into the hub bounty boards.
- **Defend the town:** when enemies raid a hub, you get a call to defend. Joining earns Honor even if the guards land the kill.
- **Data:** the danger rating is a field in each zone's data file (after the data refactor).
- **Crossing into enemy zones** opens with the contested zones (v4 onward); until then factions cannot reach each other's areas.

## Group finder rules (agreed 2026-09-27)

- **Be there:** any faction may run any dungeon or world elite, but you queue from its zone. Places with no road from where you are stay hidden; they appear when roads between the factions open in the contested zones.
- **Synced level:** everyone in the group fights at the activity's level (`maxLvl`); your gear is the overgear bonus, and XP follows your real level.
- **Mixed groups**, and a 10-minute deserter cooldown for leaving early.
- **Tactics:** pull pace (careful / normal / fast), kill-order marks (skull, cross; the tank holds the skull) and a boss plan (burn the boss / adds first).
- **Pace rewards (2026-09-27):** each dungeon has a par time; beat it for a speed chest (half the time a blue from that dungeon, plus gold). A run with no wipes is Flawless (a green plus gold). Momentum: pulling within 5 sec of the last fight stacks +5% haste and more attack and spell power, up to 5 stacks, and resting resets it. Careful is the reliable Flawless route, Fast the best par-time odds, and a good group can get both. A codex counts clears, speed, flawless and best time per dungeon.

## Daily reasons to log in (agreed 2026-09-27)

For when he is capped or has done everything while waiting for the next update. Build them in this order:

1. **Daily Roulette + Help Wanted** (v2.3): a random old dungeon with bonus rewards; bots asking for a carry, paid in Mentor Marks.
2. **Hub bounty boards:** three daily quests per hub that rotate with the real calendar, plus one weekly bounty with a bigger reward. They reuse cleared zones.
3. **Rare-spawn hunting:** named rares on respawn timers, trophy looks, and a codex to complete.
4. **Weekly keystone affixes + account-wide collections** at 60 (see above).
5. **Simulated server events:** a world boss spawn, a Darkmoon Faire week, guild server-first races. He can watch or join; they stay scenery.

No login streaks that punish a missed day. Coming back should feel like the world moved on, not like a chore was missed.

## Open questions for later

- Scholomance or Stratholme for v6.
- Where the original story after 60 begins.
