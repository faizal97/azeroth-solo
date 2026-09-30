# Widya and the Bard: design

2026-09-30. Story chosen by her creator (the Pawned Lute) and agreed with Faizal. Lore: docs/lore/canon.md.

## The Bard class (hidden for now)

The class exists in full so Widya can fight, and so it can become playable later without a rewrite. It is left out
of every race's class list, so character creation and the simulated players never use it (`hidden: true`).

- **Role:** healer (a damage option can come later as a second role). Heals the whole party a little at a time with
  songs, and boosts it with party buffs, where the priest, paladin and druid heal with big single spells.
- **Leather, mana, daggers and swords.** Stats between the druid and the shaman.
- **Abilities** (level learned):

| Lvl | Ability | What it does |
|---|---|---|
| 1 | Soothing Chord | a quick single heal (cast) |
| 1 | Dissonant Note | arcane damage to one enemy |
| 4 | Song of Rest | heals the whole party over 12 sec |
| 6 | Marching Song | party buff: attack speed and casting speed |
| 10 | Lullaby | nearby enemies (not bosses) fall asleep for 3 sec; 30 sec cooldown |
| 14 | Verse of Mending | heals one ally over 15 sec |
| 18 | Chorus of the Grove | an instant heal on the whole party; 15 sec cooldown |
| 22 | Counterpoint | a shield on one ally |
| 26 | Hearthsong | party buff: Spirit and Intellect |
| 30 | Crescendo | a big, slow single heal |
| 34 | Dirge | shadow damage over time |
| 40 | Anthem of Stone | party buff: armour and Stamina |
| 50 | Encore | a strong heal over time on the whole party; 3 min cooldown |
| 56 | Requiem | arcane damage to all nearby enemies |
| 60 | Grand Finale | a big instant heal on the whole party; 2 min cooldown |

- **Talents:** three trees of five, like every class: Harmony (healing songs), Tempo (buffs and speed), Discord
  (damage).
- **Engine:** "party" abilities could only buff; a song now also heals (instantly or over time) every living
  party member. The healer AI gets a bard branch: keep Song of Rest on the party when two are hurt, Chorus when
  three are low, single heals for the one in trouble, buffs up between pulls.
- **Balance check:** a group with a bard healer should clear about as well as with a priest (sim).

## Widya's questline (levels 22–40, both factions)

Rumhook Bay does not exist yet, so the neck's auction is at Wexley's Expedition, the neutral hunters' camp in the
Vinewild.

| Lvl | Quest | Where | What |
|---|---|---|---|
| 22 | A Borrowed Lute | Lake Aurel | Meet her singing on a borrowed lute; keep the bears off the jetty (kill 8) |
| 24 | Silver Strings | Briarpelt Village | The bearkin raided the collectors' cart; win back the strings |
| 27 | The Appraiser | Grey Wolf Vale | Harrowby's porters carry his strongbox; take back the heartwood pegs |
| 31 | The Trophy Auction | Wexley's Expedition | Follow the neck to the hunters' trophy auction |
| 33 | A Song for the Neck | Wexley's Expedition | A 3-player story run: the singing contest turns into a brawl; the rival singer has the neck |
| 38 | The Last Piece | Highhold Keep | Cut through the Ledger's highwaymen to reach Harrowby |
| 40 | Reedsong's Song | Highhold Keep → the Highland Plains | She plays Reedsong's song; Harrowby gives back the body; she carves her name |

- **Scenes** (quest scenes): meeting her (22), the strings (24), Harrowby's appraisal (27), the contest (33), the
  finale (40).
- **After 40:** the rare cameo as a healer, her own lines, and the keepsake: the **Reedsong Lute**, worn on your back
  as a look.
- **Art:** her party sprite and story portrait (from her creator's two reference pictures, kept out of the public
  repo), Harrowby, the rival singer, icons for her abilities and the lute pieces, the lute look.
