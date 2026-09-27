# Azeroth Solo

A single-player "MMO" for Android, set in the world of classic Warcraft. Every other player on the realm is simulated: they level, chat, form groups, run dungeons, win and lose loot rolls, and join your party in the open world. You get the feel of a busy server in a game you can put down at any time.

It is a numbers-and-visuals game, not a text adventure: hand-drawn scenes and sprites, real combat maths, gear, quests and dungeons.

> **Unofficial, non-commercial fan project.** Not affiliated with, endorsed by or sponsored by Blizzard Entertainment. World of Warcraft, Warcraft and Azeroth are trademarks or registered trademarks of Blizzard Entertainment, Inc. No Blizzard assets are used: all art (hand-written SVG), music (composed synth) and code in this repository are original. The game is free and will stay free.

## What's in it (v2.0)

- **Both factions, all 8 classic races.** Human, Dwarf, Gnome, Night Elf, Orc, Troll, Tauren, Undead, each with its own starting zone, and racial traits (one active, two passive).
- **9 classes, any race can be any class.** Warrior, Paladin, Hunter, Rogue, Priest, Shaman, Mage, Warlock, Druid. Pets for Hunters and Warlocks, Bear Form for Druids, seals for Paladins, totems for Shamans.
- **Levels 1–15.** Starting zones, then Westfall and the Barrens, with about 150 quests, named rares and unique drops.
- **Dungeons and elites with a group of simulated players.** Ragefire Chasm, The Deadmines, and open-world elites such as Hogger, with roles, threat, wipes and need/greed rolls.
- **A living server.** Players online by time of day, general and LFG chat, guilds, a welcome-back digest of what happened while you were away.
- **Story cutscenes** at key levels and a first-time lore intro for every dungeon, replayable in the Theater.
- **Optional on-device AI chat** (Android): a small local model can write bot chat and banter ahead of time. Off by default; the game never lets it decide anything.

The plan up to level 60 and beyond is in [docs/plans/2026-09-27-roadmap-design.md](docs/plans/2026-09-27-roadmap-design.md).

## Install (Android)

Download the latest APK from [Releases](../../releases) and open it on your phone (you may need to allow installs from your browser or file manager). arm64 phones only.

## Build it yourself

The game is plain browser JavaScript in `src/`, bundled into one offline HTML file and wrapped in a small Flutter WebView app.

```bash
python3 build.py                      # bundle src/ into dist/index.html and app/assets/game/
cd app && flutter build apk --release --target-platform android-arm64
```

Needs Python 3, Flutter, and JDK 17. You can also open `dist/index.html` in a desktop browser to play without Android.

- `src/data.js`: classes, abilities, zones, mobs, quests, items
- `src/engine.js`: combat (DOM-free, also runs in Node)
- `src/bots.js`: the simulated server
- `src/game.js`, `src/ui.js`: game logic and interface
- `src/art*.js`: all art as SVG
- `sim/`: balance and flow simulations (`node sim/v20.js`)
