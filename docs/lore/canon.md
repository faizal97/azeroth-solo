# Realm of Loner lore bible

This is the single source of truth for the game's story. Read it before writing any quest text, cutscene, Legend or lore page. The story is **our version** of classic World of Warcraft's world, plus original characters and an original expansion. Where Blizzard's canon and this file disagree, this file wins inside the game.

> Unofficial, non-commercial fan project. Not affiliated with Blizzard Entertainment. All text is original: never copy Blizzard's quest or book text, even when retelling the same events.

`node tools/lorekeeper.js` checks the game's text against this file, and `build.py` runs it on every build. It reads two sections by their headings, **Reveals** (a table) and **Names** (a list), so keep those headings and formats as they are. The Lore Journal's pages live in `src/data/lore.js` (story and Legends), `lore_places.js` (dungeons, raids and zones) and `lore_books.js` (books found in the world); the optional quest stories are `D.QUEST_STORY` in `lore_quests.js`. The lorekeeper checks all of them.

## Voice and style

- Plain, short sentences. Say what happened, then stop. No purple prose.
- Narration (cutscenes, lore pages) is serious and a little weary. Characters may be dry, bitter or funny; the narrator is not.
- Quest text is spoken by the quest giver, in their voice, and ends with what to do: "Kill 8 of them and bring me a seal."
- Simulated players in chat are exempt: they talk like players. Chat must still never name a secret before its level (see Reveals).
- Numbers in lore are written out below ten ("five years ago"), digits in quest goals ("Kill 12").
- British spelling in lore text (armour, travellers), matching what is already written. Proper names keep the game's spelling (Gullhaven).

## Premise

Four years after the Unmaking was driven from Caldreth, the kingdoms rebuild under a fragile peace. King King Rhodric Aldane of Kingsmere has vanished on a voyage to Harborwatch. Lord Regent Edmund Carrow rules in his name for the boy Tamlin, and the court leans on a new adviser, Lady Meriel Thorne. She is the black dragon Veshmira, and she is using Kingsmere's neglect, the Grey Hood uprising and the Cinderpeak clans to weaken the kingdom from inside. The player, Accord or Krugar, keeps running into the edges of her plan until it is exposed at level 60. Her flight opens the sea and raises the drowned Starborn city of Sael'anor, which is the expansion.

The Krugar's story runs alongside: the Krugar has its own enemies (the Hollow Eye, the Hollow Host, the Order of the Pyre), but the dragon's schemes reach the Scrublands too, and "whatever banner you fly, breaking the Slagborn breaks her plans".

## Timeline

Years are counted back from the start of the game.

| When | What happened |
|---|---|
| ~10,000 years ago | The Heartfire explodes (the Sundering). The Starborn city of Sael'anor sinks. Prince Aeldran bargains with Nal'veshra, the Deepmother, to keep his court alive under the sea. The Wavebreaker trolls and their loa Shal'zua sink with the isle. The wood elves' temple to Elune on the Elderglen coast is swallowed (later The Tidehollow Deeps). |
| ~10,000 years ago | The demigod Agamaggan falls in the southern Scrublands; the Thorn Warrens thorns grow from his blood. |
| ~200 years ago | The Slagborn sorcerer-thane Grimmark calls Vulcarn to win a war. Cinderpeak burns ever since. (Our text says "two hundred years"; keep it.) |
| ~21 years ago | The Second War. Ossarak tears the world; the elves of the Kinloch pines call him Astaroth, the Black Ruin. He is driven off, never destroyed. |
| After the Second War | The Stonemasons' Guild rebuilds Kingsmere. The nobles refuse to pay; the masons become the Grey Hoods under Corvin Blackwell. |
| 7 years ago | Lyveus Cloveus defends a Kingsmere caravan near Silverleaf Lodge and the Light wakes in him. He joins the Kingsmere guard and meets Vyn. |
| 5 years ago | Lyveus overhears a circle of nobles plot to feed the kingdom's soldiers to a dark master. He is condemned; Vyn fakes his death. |
| ~4–5 years ago | The Third War. The plague takes Wexmoor; Arthas purges Graymouth; the Hollow Host rises; the Vargas sell Castle Ardmore to the Cult of the Damned; Cairn makes werewolves of Needlewood; the Order of the Pyre forms. The Legion is driven out. |
| 4 years ago | The game's "fragile peace" begins. |
| 2 years ago | The cabal learns Lyveus is alive. Silverleaf Lodge burns with his kin; the world is told the Black Ledger did it. It was Lord Cassius Marrow. |
| Recently | Rhodric vanishes on the way to Harborwatch. Lady Thorne rises at court. |
| During the game | Longfield falls to the Grey Hood (10–20); Marshal Hale rides east and disappears into Cinderpeak (30); he is found alive in the Slagborn cells (40–50); he is freed, returns with Lyveus and unmasks Thorne (60); Veshmira flees to her lair in Saltmarsh and her storm raises, and hides, the Stormveil Isle (60); with Emperor Grimmark dead, Vulcarn stirs in the Magma Throne (60); Veshmira dies in her lair, the storm breaks, and the isle can be reached (60). |

## The main story, by chapter

What the player knows at each point. Nothing later may be stated earlier (see Reveals).

- **Intro (1), "Shadows over Caldreth".** The peace, the missing king, Edmund, Tamlin, Thorne's influence, the cheated stonemasons, Vulcarn and Kethriax fighting over Cinderpeak, "someone pulling every string". Thorne is only an adviser.
- **Chapter 1 (10), "The Brotherhood Stirs".** Longfield burns. Thorne persuades Edmund not to send soldiers. Blackwell's Brotherhood plans a ship. The player is sent to Warrick's Rise.
- **Chapter 2 (20), "The Stonemasons' Revenge".** Why the Grey Hood rose. Someone else paid for the Juggernaut. "Behind the lady's smile, something older is watching": a hint, not a reveal. Rumours say someone at court feeds the chaos.
- **Chapter 3 (30), "The Marshal's Road".** Black whelps in Stoneharrow; Hale rides east, learns who sold the Wyrmchain their chains, follows the trail to Cinderpeak and does not come out. The court says he deserted.
- **Chapter 4 (40), "Cinderpeak Rising".** The Slagborn dig for Vulcarn; Lord Kethran Vale commands the Cinderpeak orcs from the spire. Thorne (unnamed as a dragon) calls him "my brother". Hale is alive, in chains.
- **Chapter 5 (50), "The Masquerade".** Thorne admits, to herself, that she writes the court's orders. Hale keeps notes in his cell; the Emperor holds them.
- **Chapter 6 (60), "The Brood Mother".** Hale walks free and brings Lyveus to court. Thorne is unmasked as Veshmira, daughter of Ossarak, and flees south across the sea to her lair in Saltmarsh. Her storm tears the waters open; land appears where none has been for ten thousand years, but the storm does not clear, and no ship can land while she lives.
- **The endgame raids (60).** *Veshmira's Lair*: Accord from Harborwatch, Krugar from Mudwall Village hunt the Brood Mother in the Dragonmire. Her death breaks the storm and opens the expansion. *Magma Throne*: with Emperor Grimmark dead in Cinderpeak Depths, nothing holds Vulcarn asleep; players go down beneath the mountain and put the King Below back in the fire. Magma Throne is not a gate; it is the recommended gear step before the isle. The expansion's own raid, the Tidecrown Citadel, stays the strongest.
- **Expansion (60), "The Drowned Crown".** Opens when Veshmira dies and her storm breaks. The Stormveil Isle: Sael'anor and its prince, the drowned Wavebreakers, and beneath them Nal'veshra. Accord land at the Tidewatch Coast (from Gullhaven with Admiral Vane); the Krugar at the Skullreef Isles (from Camp Skarn on the Bloodtide ship). Both reach the Tidecrown Citadel on the same morning and, for once, do not fight each other.

### Dungeon intros (first entry)

Each one sets up the dungeon only. They may mention the main story's villains only as far as the chapter at that level allows. The Smugglers' Deep names Blackwell and the Juggernaut; Cinderpeak Depths names Grimmark and Vulcarn but not Thorne's link to the mountain; Graymouth says the Grand Crusader "is not what he seems" and no more.

## Characters

### From the world of Warcraft (our portrayal)

- **Lady Meriel Thorne / Veshmira.** Court adviser, patient and contemptuous. Speaks of "little kingdoms" and "a court of fools". Never named as a dragon before 60.
- **Lord Regent Edmund Carrow.** Regent. Honest, overworked, too trusting of Thorne. Believes Hale in the end.
- **Prince Tamlin Aldane.** The boy king-in-waiting. Seen, rarely heard.
- **King Rhodric Aldane.** Missing. Nobody in the game knows where he is. Do not resolve this. Harborwatch is where he was sailing; nobody there speaks of him.
- **Marshal Gideon Hale.** Stubborn, brave, a note-taker. Wrongly called a deserter.
- **Corvin Blackwell.** Leader of the Grey Hood. Bitter, not mad: he believes Kingsmere owes him.
- **Lord Kethran Vale / Kethriax.** Lord of Cinderpeak Spire, Veshmira's brother. His identity as Kethriax is not stated outright before 60.
- **Vulcarn, the King Below.** Asleep in the molten sea below Cinderpeak Depths. A threat, not yet a fight.
- **Emperor Haldor Grimmark.** Rules the Slagborn from the Imperial Seat; holds Hale's notes.

### Original characters

- **Lyveus Cloveus, the Exiled Knight** ("Lyv" to friends). A high elf paladin from Silverleaf Lodge in the Kinloch Highlands, once of the Kingsmere guard. Quiet, dry, patient; "They made me a ghost. Ghosts keep watch." Created by a friend of the developer and adapted for Caldreth: in the friend's lore his enemy is Astaroth; here Astaroth is the Kinloch elves' name for Ossarak, and the cabal is Thorne's circle at court. **Keep his core: exiled, presumed dead, loyal to the few who helped him, fights as a tank with the Light.** He is neutral: both factions can meet him. Before level 37 he appears only as the Hooded Stranger and is never named in quest text.
- **Vyn.** Lyveus's friend from the guard, a human farm boy who rose with him. Faked Lyveus's death. Now writes from Coppergulch.
- **Lord Cassius Marrow.** The Kingsmere noble whose seal is on the cabal's orders. Ships gold through Sirocco to the Slagborn. Burned Silverleaf Lodge. Killed at level 60 at the grove where Lyveus took his oath.
- **Prince Aeldran Tidecrown.** Starborn prince of Sael'anor. Kept his court alive for ten thousand years through a bargain he does not fully understand. Proud, grieving, dangerous. "Ten thousand years I waited."
- **Nal'veshra, the Deepmother.** A sea spirit older than the Starborn. The true power under the citadel. Ate the loa Shal'zua. "Little lights."
- **Lady Vessaria, the Tidescribe.** Aeldran's scribe; mistress of the Sunken Archive. Her writing raises the drowned.
- **Shal'zua.** A loa of the sea, once served by the Wavebreaker trolls, now swallowed; her avatar wears her face.
- **Hexmother Oyala** and **High Priest Zan'jin.** Raised the drowned Wavebreakers and feed the altar in the Temple of Shal'zua.
- **Admiral Vane** (Accord) and **Mazu** (Krugar). Lead each faction's landing on the isle.
- **Lorekeeper Nerathil.** Keeps the Codex of Tides in the Sunken Archive.

## Places (original)

- **Silverleaf Lodge.** A high elf village in the Kinloch pines; Lyveus's home, burned two years ago. Now a Black Ledger camp until you clear it.
- **Stormveil Isle.** The risen island. Holds the Tidewatch Coast (Accord landing), the Skullreef Isles (Krugar landing), the drowned city of Sael'anor, Loa's Rest, the causeway and the Tidecrown Citadel.
- **The Sunken Archive.** Sael'anor's great library (Accord dungeon).
- **The Temple of Shal'zua.** The Wavebreakers' temple (Krugar dungeon).
- **The Tidecrown Citadel.** Aeldran's seat; the 10-player raid, shared by both factions.

## Reveals

A term here may not appear in any text a player can read below its level. "Allowed in" lists sources that may use it anyway (the lorekeeper matches the start of the source name). Terms are regular expressions, matched without case.

| Term | Level | What it gives away | Allowed in |
|---|---|---|---|
| `Veshmira` | 60 | the Ledger's master is the dragon Veshmira | |
| `(master\|creditor).{0,40}\bdragon\|\bdragon.{0,40}(master\|creditor)` | 60 | the Ledger's master is a dragon (whelps guarding its coin, warm coins and claw marks are fine as hints) | |
| `Vale.{0,60}Kethriax\|Kethriax.{0,60}Vale` | 60 | Lord Kethran Vale is Kethriax | |
| `Hale.{0,40}(alive\|in chains\|prisoner\|cell)` | 40 | Hale survived the mountain | |
| `Hale.{0,40}(free\|escaped\|walks out)` | 60 | Hale is freed | |
| `Sael'anor\|Aeldran\|Nal'veshra\|Deepmother\|Stormveil\|Tidecrown\|Wavebreaker\|Shal'zua\|Vessaria` | 60 | the Drowned Crown expansion | |
| `Marrow` | 45 | Cassius Marrow is behind the cabal | |
| `Lyveus\|\bLyv\b\|Cloveus` | 37 | the Hooded Stranger is Lyveus | `cutscene legend_lyveus`, `legend lyveus`, `npc lyveus`, `lore lyveus_1` |

## Names

Proper names used in the story that are not already the name of an NPC, creature, place, item, quest or zone in the game data. The lorekeeper treats anything else with a capital letter as a possible typo. Add a name here, with a line of what it is, before using it.

- **Accord / Krugar** — the two factions
- **Caldreth** — the world
- **Sylari** — the wood elves' own name
- **Elune** — the wood elves' goddess
- **Unmaking / Legion** — the demon army driven out four years ago
- **Second War** — about twenty-one years ago; Ossarak's war
- **Heartfire** — its explosion sank Sael'anor ten thousand years ago
- **Agamaggan** — boar demigod whose blood grew the Thorn Warrens
- **Zaetar** — demigod, father of the centaur with Ghesra
- **Ossarak** — the black dragon aspect; Veshmira and Kethriax's father
- **Astaroth** — the Kinloch elves' name for Ossarak ("the Black Ruin"); from Lyveus's original lore
- **Veshmira** — Lady Thorne's true self (revealed at 60)
- **Brood Mother** — Veshmira's title in Chapter 6
- **Meriel Thorne / Thorne** — Veshmira's disguise at the Kingsmere court
- **Kethriax** — Veshmira's brother
- **Lord Kethran Vale / Vale** — Kethriax's name as lord of Cinderpeak Spire
- **Vulcarn / King Below** — the fire lord under Cinderpeak
- **King Rhodric Aldane / Rhodric / Aldane** — the missing king of Kingsmere
- **Tamlin** — Rhodric's son
- **Edmund Carrow / Edmund / Carrow / Lord Regent** — the regent of Kingsmere
- **Gideon Hale / Reginald** — Marshal Hale's first name
- **Harborwatch** — where Rhodric was sailing when he vanished
- **Wexmoor** — the fallen northern kingdom
- **Arthas** — the prince who purged Graymouth
- **Lich King / Lich** — master of the Hollow Host
- **Cult of the Damned / Cult / Damned** — the Hollow Host's living cult; runs The Blackcloister
- **Elarion** — the dreaming druid of the Dreaming Caves
- **Juggernaut** — the Grey Hood warship in the Smugglers' Deep
- **Stonemasons' Guild / Stonemasons** — the masons who rebuilt Kingsmere and became the Grey Hood
- **Lyv** — Lyveus's name among friends
- **Hiveborn** — insect swarms of the south
- **Darkshore** — wood elf coast north of Elderglen
- **Drakestone Hold / Batol / Grim** — the Wyrmchain fortress in the Greenfen
- **Booty Bay / Bay** — goblin port in southern Vinewild
- **Thousand Needles / Needles** — canyon zone south of the Scrublands
- **Harrow Span / Span** — the bridge between the Greenfen and Kinloch
- **Underrail / Deeprun / Tram** — the tunnel train between Kingsmere and Keldrun
- **Imperial Seat / Seat / Throne** — Grimmark's throne room in Cinderpeak Depths; also the thorn throne of The Thorn Warrens
- **Isle** — as in Stormveil Isle
- **Third War** — the war four to five years ago: the plague, the Hollow Host, the Legion's defeat
- **Sundering** — the breaking of the world when the Heartfire exploded, ten thousand years ago
- **Lyceum** — the Slagborn's hall of learning in Cinderpeak Depths
- **Pyre Bastion** — the Order's stronghold in Graymouth
- **King's Square** — the old market square of Graymouth
- **Lion's Pride** — the inn at Brackenford
- **Saltmarsh / Saltmarsh** — the marsh south of the Scrublands; Harborwatch on its coast, Veshmira's lair in the Dragonmire
- **Mudwall Village / Mudwall** — the Krugar camp in Saltmarsh
- **Scorchmaw** — a rare drake of Veshmira's brood in the Scorched Fen
- **Brant Ashby** — Commander of Harborwatch's watch
- **Durnak** — Warlord of Mudwall Village
- **Emberfall** — Vulcarn's lesser flame-forged hammer, a Magma Throne drop
