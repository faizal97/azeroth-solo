# Azeroth Solo roadmap

Azeroth Solo is a single-player "fake MMO" set in the world of classic World of Warcraft. You level from 1 to 60 as Alliance or Horde through the classic zones and dungeons, and every other player on the "server" is simulated. They quest around you, fill your dungeon groups, post in chat, ask you for help and run their own guilds. After 60 the story continues in an original expansion.

> Unofficial, non-commercial fan project. Not affiliated with, endorsed by or sponsored by Blizzard Entertainment. All art, music and code are original.

This document says where the game stands, how it is designed, and what comes next.

## Where it stands (v9.6)

- **Levels 1–60, both factions, all eight classic races and nine classes.** About 25 zones, from the starting valleys to Winterspring and the Western Plaguelands.
- **Every classic dungeon along the way,** from Ragefire Chasm and the Deadmines to Blackrock Depths, Scholomance and Stratholme, each with a lore intro.
- **The main story,** the Black Dragonflight conspiracy, told in six chapters at levels 10–60.
- **An original expansion at 60, "The Drowned Crown":** two new zones, two dungeons and a 10-player raid.
- **Legends:** hand-made characters with their own questline, who then fight at your side.
- **A server that feels alive:** working chat, guilds, requests, trades, duels and rare sightings.
- **The app updates itself.** New versions come from GitHub releases, with release notes, through the in-app updater.

## Design principles

- **World first.** Each update adds zones and the classic systems that unlock in their level range: talents at 10, a mount at 40, raids at 60.
- **The main levelling path.** About 12 zones per faction, the way most classic players levelled, each covering a few levels. From 30 most zones are contested and shared by both factions.
- **A simulated server.** Other players are bots with names, classes, levels, play times and personalities. They take mobs before you do, group with you, trade, chat and remember you when you help them. They are driven by the game's rules, never by an online service. An optional on-device AI can write some of their chat lines, but it never decides what happens.
- **Any race can play any class** (a house rule).
- **Nothing punishes a day off.** No login streaks. Coming back should feel like the world moved on, not like a chore was missed.
- **Saves stay compatible.** Every update migrates old characters forward.
- **Balance is tested before it ships.** Each update is checked with simulations of levelling flow (quests should give most of the XP), dungeon difficulty (wipes per run and par times) and the new systems.

## What's shipped

| Version | Highlights |
|---|---|
| 1.x | Elwynn Forest and the Deadmines; all nine classes; Dun Morogh, Teldrassil, Durotar, Mulgore and Tirisfal starting zones; the Horde; Ragefire Chasm; story cutscenes; the optional on-device AI chat pack |
| 2.x | Westfall and the Barrens (10–20); the Deadmines and Wailing Caverns at their real levels; world PvP ambushes with War Mode; talents; Stormwind; banks and auction houses; Help Wanted, Mentor Marks, heirlooms, titles and the daily Roulette; hub bounty boards; professions |
| 3.0 | Redridge and Stonetalon (18–25); the Stockade |
| 4.x | Duskwood, the Wetlands, Hillsbrad and contested Ashenvale (20–30); Shadowfang Keep; Blackfathom Deeps |
| 5.x | Stranglethorn Vale and the Arathi Highlands (30–40); Gnomeregan, Razorfen Kraul and the Scarlet Monastery; mounts at 40 |
| 6.0 | Tanaris and Feralas (40–50); Zul'Farrak and Maraudon |
| 7.0 | Un'Goro Crater and the Burning Steppes (48–55); Blackrock Depths |
| 8.0 | The Western Plaguelands and Winterspring (55–60); Scholomance and Stratholme; level 60 |
| 9.0 | The expansion "The Drowned Crown", with a 10-player raid |
| 9.1–9.2 | Legends: Lyveus Cloveus, the Exiled Knight |
| 9.3 | In-app updates |
| 9.4 | World map with routes, NPCs in town scenes, easier selling |
| 9.5–9.6 | Working chat and guilds |

## How the world works

### Zones and factions

- Each faction has its own zones up to about 30. From there the zones are **contested**: both factions quest there, each from its own town, and enemy players are more common.
- **Enemy towns are closed.** You can't enter the other faction's hubs or capitals, so routes and the group finder go around them. Some dungeons are therefore one faction's own (the Stockade for the Alliance, Shadowfang Keep for the Horde). Dungeons in contested land are open to both.
- **Neutral towns** (Gadgetzan, Marshal's Refuge, Everlook) welcome everyone.
- **The world map** shows every zone and how they connect by road, ship or flight. Tap any place for the fastest route there, and travel it in one go.
- **Mounts at 40:** learn riding and buy your race's mount. Roads are 40% faster; boats and flights keep their times.

### Dungeons and the group finder

- **Be there to queue:** you queue from the dungeon's zone, and the group is formed from players of your faction who are online.
- **Synced level:** everyone fights at the dungeon's level, so old content stays a real fight. Your better gear gives a small edge.
- **Tactics:** pull pace (careful, normal, fast), kill-order marks, and a boss plan (burn the boss or kill the adds first).
- **Rewards for playing well:** each dungeon has a par time (beat it for a bonus chest), and a run with no wipes is Flawless. Chaining pulls quickly builds Momentum. A codex tracks clears, best times and flawless runs.
- **Help Wanted and Roulette:** groups of players stuck on a boss ask for help and pay in Mentor Marks. A daily Roulette gives a random dungeon with bonus rewards.
- **Raids** hold 10 players (2 tanks, 3 healers, 5 damage dealers).

### World PvP

- With War Mode on (+10% XP and gold), enemy players sometimes turn up where you are. Most attack after a short while, some just pass through, and you can strike first.
- Danger depends on the place: none in capitals and starting valleys, low in your own zones, higher in contested zones, highest in enemy territory. Guards help in towns, and a nearby player of your faction sometimes joins in.
- Kills earn Honor, which buys only looks and titles, never power.

### Professions

- Mining, Herbalism, Skinning, Blacksmithing, Alchemy, Leatherworking and Tailoring. Two per character, skill up to 150.
- Gathering nodes are in every wild place. Crafted goods include gear, potions, elixirs, sharpening stones, armour kits and bags. Rare recipes drop from bosses and rares, and trade goods sell on the auction house.

### Story and cutscenes

- **The main story** is the Black Dragonflight conspiracy: the Defias Brotherhood, the Blackrock orcs, Marshal Windsor's capture, and Lady Prestor, who is Onyxia in disguise. An intro plays at character creation, then a chapter at 10, 20, 30, 40, 50 and 60.
- **Every dungeon and raid has a lore intro** that plays the first time you enter.
- **The Theater** replays everything you've unlocked, in sections for the story, Legends, and dungeons and raids.

### The expansion: "The Drowned Crown" (level 60)

- When Onyxia is unmasked and flees, the storm she raises tears the sea open. The **Stormveil Isle** rises: Sael'anor, a Highborne city that sank ten thousand years ago. Its prince, Aeldran Tidecrown, bargained with a sea spirit, Nal'veshra the Deepmother, to keep his court alive beneath the waves. The drowned Wavebreaker trolls rose with it, and their sea loa has been swallowed by the Deepmother.
- **Alliance:** the Tidewatch Coast, reached from Menethil Harbor. Its dungeon is the Sunken Archive.
- **Horde:** the Skullreef Isles, reached from Grom'gol. Its dungeon is the Temple of Shal'zua.
- **Raid (both factions):** the Tidecrown Citadel, 10 players, five bosses, ending with Nal'veshra.

### Legends

- Legends are hand-made characters with their own story. You meet them along the way, follow their questline, and they then join your groups with abilities of their own.
- **The first is Lyveus Cloveus, the Exiled Knight,** an original character created by a friend and adapted for Azeroth. He is a high elf paladin of the Stormwind guard who overheard Lady Prestor's cabal and was hunted for it.
  - From level 15 a hooded stranger crosses your path.
  - At 37 you meet him properly at the ruins of his home in the Arathi Highlands.
  - His story runs through Gadgetzan and Blackrock Depths to a showdown at 60.
  - After that he fights at your side as a tank. His lore cutscene is in the Theater from the start.

### Chat and guilds

- **Chat that does things.** Messages that ask for something can be tapped and acted on:
  - LFG posts are real groups; tap to join.
  - Players whisper you for help with kills, to team up on your quest, for a carry through a dungeon you've outlevelled, for craft orders, trades and duels, or with a question you can answer.
  - General announces rare sightings and guild recruiting.
  - A Requests tab lists everything open, and any [item] can be tapped to see it.
- **Players remember you.** Help someone and they may come back later with a thank-you gift or an invite to a run.
- **Guilds.**
  - Browse your faction's guilds and apply. Each has a style (casual, levelling, dungeons, raiding, PvP, social) and a minimum level. Or accept a recruiter's invite.
  - Guildmates post requests: dungeon runs together, materials, help with kills, donations, and scheduled guild nights. Helping earns guild standing.
  - Ranks bring small perks: more XP, more quest gold, Mentor Marks on guild runs, and a title at the top.
  - There is a weekly guild goal and a daily message of the day.

## After 60: horizontal progression

At the level cap, power stops climbing; what you collect and what you can do keeps growing.

- **A power ceiling.** The endgame raids are the last real step up in power. Everything after that adds options and looks, not bigger numbers.
- **Synced power everywhere.** Each dungeon and raid scales you to its level plus a small overgear bonus, so older content stays a real fight.
- **Challenge is the loop.** Every dungeon returns as a level-60 keystone dungeon, with weekly rotating affixes and tiers that make enemies harder, not you stronger.
- **Collections are the reward:** looks, titles, mounts, rare-boss trophies and a codex of every boss beaten, in a wardrobe shared by all your characters.
- **Drops that change how you play:** procs and set bonuses that open new builds, rather than flat upgrades.
- **New content never makes old content obsolete.** New dungeons join the keystone pool beside the old ones, and old dungeons keep their own rewards.
- **Alts are breadth.** The shared wardrobe and Mentor Mark heirlooms make levelling another class worthwhile.

## What's next

Roughly in priority order:

1. **Endgame raids: Molten Core and Onyxia's Lair.** The payoff for the main story, since Onyxia is still out there after Chapter 6. The last step up in power.
2. **Keystone dungeons and the account-wide wardrobe.** The core of the after-60 loop.
3. **World bosses and level-60 rares,** with trophies.
4. **Battlegrounds,** with Honor ranks for looks and titles.
5. **Booty Bay and the Gurubashi Arena event** in southern Stranglethorn.
6. **Expert professions** (skill 225) with new materials.
7. **Drops with unique effects** (procs and set bonuses).
8. **Server events:** a Darkmoon Faire week, guild server-first races, and town defences in War Mode.
9. **More Legends.**
10. **Friends in your world** (parked). Your real friends' characters would appear on your server as simulated players, via a small online service and friend codes.

## Open questions

- How keystone affixes should work with synced power.
- Whether battlegrounds should use simulated players only, or also the friends feature if it ever ships.
- Which character becomes the next Legend.
