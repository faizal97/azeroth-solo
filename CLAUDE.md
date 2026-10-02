# Realm of Loner

A single-player fake MMO set in its own world, Caldreth: every other "player" is a simulated bot. It's a personal game for Faizal, played on his **Android** phone. It is not channel content and has nothing to do with the Gaming News vault.

## Layout

- `src/` is the game, plain browser JS with no framework:
  - `data/`: the game data, loaded in the order in `data/files.json`
    - `core.js`: classes, races, abilities, gear rules, reward families, shared items (food, junk, starting gear)
    - `zones/<zone>.js`: one file per zone with everything that lives there (`D.zone(...)`, items, mobs, places, NPCs, quests, dungeons, group-finder activities). Links to other zones sit on the places.
    - `zones/legends.js`: Legends (`D.LEGENDS`), hand-made characters with a questline who then join your groups; art in `art_legends.js` (`ART.legend(key)`)
    - `finalize.js`: derived fields that need the whole world (boss-loot sources)
    - `data.js` is only the Node entry point that loads these for sims and tools
  - A new zone = a new `zones/<zone>.js`, added to `files.json`, plus its art pack
  - `engine.js`: combat, DOM-free so it also runs in Node sims
  - `bots.js`: simulated server, chat, catch-up after time away
  - `game.js`: controller for world, quests, loot, group finder, runs and character saves
  - `social.js`: the working chat and guilds (`SOC`): messages with an action (`m.act`: LFG joins, whisper requests, trade, recruiting, guild requests), guild standing and ranks
  - `update.js`: the in-app updater (GitHub releases; the Android side is in MainActivity.kt)
  - `sound.js`, `cutscene.js`, `ui.js`
  - `art.js` (`window.ART`) and `art_story.js` + `art_story2.js` (`ART.story`): all art as SVG strings
  - zone art packs `art_<zone>.js` (one per zone or dungeon, e.g. `art_durotar.js` … `art_dustwallow.js` (Dustwallow Marsh and Onyxia's Lair), `art_moltencore.js`, `art_tidecrown.js`) plus icon packs `art_icons2.js`…`art_icons10.js` (`art_icons3.js` also adds `ART.node` for gathering nodes) and `art_mounts.js`. Each wraps `ART.scene`/`ART.mob`/`ART.icon` and falls through for other keys; each has a render script in `art/<name>/render.js`. A new pack must also be added to the list in `build.py`
  - `data/professions.js` loads after the zones (it adds trainers to hubs and reads place levels)
- `audio/compose_game.py` composes the music and sound effects; `check.py` runs the loudness, spike and seam checks. Music ships only if listed in `audio/approved.txt`.
- `art/render.js` and `art/story/render.js` render contact sheets with `rsvg-convert`. Look at the sheets before shipping art.
- `sim/*.js` are Node balance and playthrough sims (`node sim/group.js`, `node sim/v17.js` …).
- `docs/plans/2026-09-27-roadmap-design.md` is **the roadmap**. Read it before planning anything.
- `docs/design-mindset.md` is **the design mindset**: the player always knows what they are looking at, UI scales, automatic systems are content-proof, choices are real and proven by sim. Read it before designing any screen, label, number or system.
- `docs/lore/canon.md` is **the lore bible**: timeline, characters, what is revealed at which level, and the names the story may use. Read it before writing any quest text, cutscene, Legend or lore page. `node tools/lorekeeper.js` checks all story text against it (spoilers, unknown names, typos, faction slips); `build.py` runs it, and `--selftest` proves each check still fires.
- `app/` is the Flutter WebView wrapper that bundles `assets/game/index.html`.

## Build and ship

```bash
node tools/validate.js   # data check (build.py runs it first and stops on errors)
python3 build.py      # inlines fonts, CSS, JS, audio → dist/index.html and app/assets/game/index.html
cd app && JAVA_HOME=/opt/homebrew/opt/openjdk@17 flutter build apk --release
```

1. Bump `version:` in `app/pubspec.yaml` for every release.
2. Copy the APK to `~/Library/Mobile Documents/com~apple~CloudDocs/Azeroth Solo/RealmOfLoner-vX.apk`, remove the previous APK there, and confirm `ubiquitousItemIsUploaded` is true.
3. Faizal installs it from icloud.com → Recents on his phone.
4. Publish the browser version: `tools/publish_web.sh` (puts `dist/index.html` on the `gh-pages` branch, served at https://faizal97.github.io/realm-of-loner/). Every GitHub release also needs the APK attached, or the in-app updater won't see it.
5. Push to itch.io with butler (`~/.local/butler/butler`, already logged in), full releases only: zip `dist/index.html` + `dist/music/` and `butler push <zip> starlighthvn/realm-of-loner:html5 --userversion X.Y.Z`, then `butler push <apk> starlighthvn/realm-of-loner:android --userversion X.Y.Z`. Check with `butler status starlighthvn/realm-of-loner:html5` (and `:android`). Page: https://starlighthvn.itch.io/realm-of-loner
6. Announce on Discord, last (after the GitHub release, web and itch.io are live): `node tools/announce_discord.js vX.Y.Z` posts the notes to #patch-notes and pings the Patch Notes role. A beta: `node tools/announce_discord.js vX.Y.Z-beta.N --beta` posts to #beta-builds (only Beta Testers see it). Both link players to itch.io, never GitHub. `--dry` previews; each tag posts once. The webhook URLs are in `~/.config/realm-of-loner/`, never in the repo.

**Release cadence (since v9.9):** people play this now, so batch public releases (about one a week, not several a day); only a real bug fix goes out on its own.
- **Beta:** a test build is a GitHub **pre-release** tagged `vX.Y.Z-beta.N` (`gh release create ... --prerelease`), with its APK attached, and pubspec `version: X.Y.Z-beta.N+code`. Publish it to the web with `tools/publish_web.sh --beta` (only the `/beta/` page). Only players with Settings → Beta updates on get it: the app then reads all releases, and in a browser beta is the `/beta/` page (same site, so it shares characters). Not pushed to itch.io; announced with `--beta`.
- **Normal release:** a regular release; `tools/publish_web.sh` updates the main page and also `/beta/` (unless `/beta/` holds a newer test build), so beta is never behind. Then itch.io (step 5) and the Discord post (step 6).

**Cutscene video (MP4):** `art/promo/export_cutscene.sh <chapterId> <out.mp4> [endcard.png]` records any cutscene from `dist/` (run `build.py` first) at 1080 px, 30 fps, with its music. It uses `art/promo/record_cutscene.js` (headless Chrome on virtual time, so frames are exact). Port 8777 only; never touch 8765.

Smoke-test on the emulator (AVD `Medium_Phone_API_36.0`). Its software renderer draws ghost and duplicate layers, which are not real bugs.

## Open threads and bugs (GitHub issues, shared by every session)

- Parked work, open questions and balance threads are GitHub issues labelled `thread`: `gh issue list --label thread`. Check them before planning, file anything you park there (with the numbers you have, facts apart from guesses), and close an issue with a comment saying what was decided.
- Bugs (from a QA session, a player report or a sim) are issues labelled `bug`, with steps or the sim that shows it.
- The repo is public: nothing private in an issue.

## Rules that matter

- Saves: one per character under `azsolo.char.<id>` plus the index `azsolo.chars`. Keep old saves loading; migrate, never break them.
- Any race can play any class (house rule). Bots are simulated players driven by the game's rules (bots.js, social.js). Since v9.5 they have real social systems (actionable chat, guilds, friends who remember you), but never an online service. Chat that reads like a request must be a real one (`node sim/chatcheck.js`). The on-device AI chat pack was removed in v9.6.1.
- After 60, progression is horizontal (synced power, collections). Every dungeon and raid ships with a first-entry lore intro.
- Sprites use z-index 60–96 inside `.scene`, which is isolated. Layers: `.create` 50 < sheets 55 < dialogs 57 < toasts 59 < cutscenes 60.
