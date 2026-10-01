# Rumhook Bay: design

The southern Vinewild, levels 35–40, with a neutral goblin port, a main-story stop and the Bloodsand Brawl. Agreed
2026-10-01. Also here: a mark for main-story quests, everywhere quest marks show.

## Why

The levelling sim (`sim/zoneflow.js`, every solo quest done as it opens) shows 30–50 as a single road: two zones per
decade and only 1–3 quests to spare (18–30 has 100+). The Vinewild is also only half built (30–35), and the game
already names Rumhook Bay: the lore bible reserves it, the Vinewild's file says "the south comes later", and a Skullreef
quest sends claws to sell there.

## 1. The zone and its story

- The south of the Vinewild, levels 35–40: the Vinewild becomes a full 30–40 zone, with Kinloch Highlands as the other
  35–40 path.
- **Rumhook Bay** is a neutral goblin port both factions use (like Coppergulch): inn, vendors, quest hub, its own town
  music. A jungle road comes south from the northern camps; a goblin ship sails to Coppergulch (the door to Sirocco at 40).
- **The story answers Chapter 2's question, "where does the grain go?"** Blackwell's ships bring Longfield's seized grain
  here; the port's goblin trading house buys it and pays the captains in warm, claw-stamped coin. The player follows the
  cargo, and the manifests show it going on by ship to Coppergulch and over land to Cinderpeak, to feed the Slagborn
  crews digging to pay their debt. It leads into Chapter 4 (40, "Cinderpeak Rising").
- **Reveals kept:** the dragon is not named (warm coins and the claw stay hints); nothing says Hale is alive before 40;
  Marrow is only "M." (as at 38). Every line goes through `tools/lorekeeper.js`; new names go into the lore bible.
- The port and most quests are shared; each faction has a short thread (the Accord reports to the Rebel Camp, the Krugar
  to Camp Skarn).

## 2. Places and enemies

| Place | Levels | What's there |
|---|---|---|
| Rumhook Bay (town) | 35–40 | The port: inn, vendors, the quest hub, the ship to Coppergulch |
| The Saltpenny Wharf | 35–36 | The grain docks: Blackgull pirates skimming cargo, surf crawlers from the shore |
| Thunderhowl Rise | 36–37 | A jungle ridge of thornback gorillas on the road south |
| Blackgull Cove | 37–38 | The pirates' hideout: cutthroats, powder monkeys and their captain (Wanted) |
| The Bonegrin Warcamp | 38–39 | The Bonegrin trolls' southern camp: headhunters and shadowcasters |
| The Bonded Yard | 39–40 | The Black Ledger's warehouse: Grey Hood wharfguards, Ledger tallymen, the Ledger's factor |
| The Bloodsand Arena | 35–40 | The brawl (section 4) |

- The Blackgull pirates already raid shipping in Sirocco's text; the Grey Hoods are Blackwell's collectors (Chapter 1);
  the Bonegrin continue from the northern Vinewild.
- New names (lore bible first): the Saltpenny trading house, Thunderhowl Rise, Blackgull Cove, the Bonded Yard, the
  Bloodsand Arena, and the named enemies.
- Art: one new pack (seven scenes; pirates, gorillas, crawlers, tallymen, goblin townsfolk), with the trolls and Grey
  Hoods reusing their sprites. Music: Rumhook Bay gets its own town theme (a goblin harbour shanty) through the place's
  `music`; the Vinewild's outdoor track stays.

## 3. Quests (about 24)

**The grain trail (main story, both factions):**

| Lvl | Quest | What |
|---|---|---|
| 35 | Where the Grain Goes | The harbourmaster counts sealed Longfield grain on the wharf |
| 36 | Short Weight | Kill Blackgull skimmers, bring back the stolen sacks |
| 37 | Paid in Warm Coin | Take a purse of the claw-stamped coin from a captain's chest |
| 38 | The Captain's Share *(group of 3)* | The Blackgull captain (Wanted) kept a page of the manifest |
| 39 | Bonded | Break into the Bonded Yard and read the manifests: Coppergulch, then Cinderpeak |
| 40 | The Factor | Defeat the Ledger's factor; his last order is signed "M."; a story scene follows |
| 40 | Passage South | Take the ship to Coppergulch, into Sirocco's story (the warm coins at 40) |

- **Faction threads:** 2 quests each (Rebel Camp, Camp Skarn).
- **Port life (about 8):** dock work, crawler shells, gorilla hides, a lost cargo hold, a goblin bookie who takes bets on
  the arena.
- **The Bonegrin south (3–4):** raiders on the road, the shadowcasters' fetishes, the war chief.
- **Rewards:** greens along the way, a blue at the end of the grain trail and on the Wanted target.
- **Proof:** `sim/zoneflow.js` shows the Vinewild carries 30 → 40 on quests alone, and 35–40 has about 20+ quests to
  spare for both factions (1–2 today).

## 4. The Bloodsand Brawl

- Opens every 3 hours on the hour (00:00, 03:00 … local time) for 20 minutes, computed from the clock (no stored timer).
  Simulated players announce it in chat; Journey → "Open to you now" shows the next opening.
- Level 35+, at the arena while it is open. Eight fighters at your level (you and 7 simulated players, both factions, any
  class); three rounds of one-on-one duels. Your duel is on screen, the others are settled at once by the same engine.
  Full health between rounds; losing costs nothing.
- **Rewards:** money and XP for each round won (Marks at 60), more each round; the champion opens the Bloodsand chest (a
  choice of one blue for your level, once a day); the title "the Bloodsand Champion" the first time.
- Built on the duel engine (a brawl mode that runs the bracket), opponents picked like battleground teams.
- **Proof (`sim/brawl.js`):** a level-appropriate player wins the brawl about 1 in 3; no class far behind; the schedule
  is right across midnight and time-zone changes.

## 5. Main-story quest marks

- A quest is main story when finishing it plays a main-story scene, or it leads to one in the same chain. The data marks
  these quests `main: true`; a check fails any main-story scene whose quest is not marked. New content (the grain trail)
  sets the flag.
- **The mark:** the same gold ! (take) and ? (hand in) set on a small dark-red crest with a gold rim, so the shape
  changes, not only the colour. Wherever quest marks show: over the NPC's head, the People list, the map, the quest log
  and the tracker. The quest log says "Main story · Chapter N".
- Legend quests keep their own look.

## Build order

1. Main-story marks (independent, small).
2. The zone: places, enemies, quests, the grain trail and its scene; lore bible entries; zoneflow proof.
3. Art pack and Rumhook Bay's town theme.
4. The Bloodsand Brawl and `sim/brawl.js`.
