# Azeroth Solo lore bible

This is the single source of truth for the game's story. Read it before writing any quest text, cutscene, Legend or lore page. The story is **our version** of classic World of Warcraft's world, plus original characters and an original expansion. Where Blizzard's canon and this file disagree, this file wins inside the game.

> Unofficial, non-commercial fan project. Not affiliated with Blizzard Entertainment. All text is original: never copy Blizzard's quest or book text, even when retelling the same events.

`node tools/lorekeeper.js` checks the game's text against this file, and `build.py` runs it on every build. It reads two sections by their headings, **Reveals** (a table) and **Names** (a list), so keep those headings and formats as they are. The Lore Journal's pages live in `src/data/lore.js`.

## Voice and style

- Plain, short sentences. Say what happened, then stop. No purple prose.
- Narration (cutscenes, lore pages) is serious and a little weary. Characters may be dry, bitter or funny; the narrator is not.
- Quest text is spoken by the quest giver, in their voice, and ends with what to do: "Kill 8 of them and bring me a seal."
- Simulated players in chat are exempt: they talk like players. Chat must still never name a secret before its level (see Reveals).
- Numbers in lore are written out below ten ("five years ago"), digits in quest goals ("Kill 12").
- British spelling in lore text (armour, travellers), matching what is already written. Proper names keep the game's spelling (Menethil Harbor).

## Premise

Four years after the Burning Legion was driven from Azeroth, the kingdoms rebuild under a fragile peace. King Varian Wrynn of Stormwind has vanished on a voyage to Theramore. Highlord Bolvar Fordragon rules in his name for the boy Anduin, and the court leans on a new adviser, Lady Katrana Prestor. She is the black dragon Onyxia, and she is using Stormwind's neglect, the Defias uprising and the Blackrock clans to weaken the kingdom from inside. The player, Alliance or Horde, keeps running into the edges of her plan until it is exposed at level 60. Her flight opens the sea and raises the drowned Highborne city of Sael'anor, which is the expansion.

The Horde's story runs alongside: the Horde has its own enemies (the Burning Blade, the Scourge, the Scarlet Crusade), but the dragon's schemes reach the Barrens too, and "whatever banner you fly, breaking the Dark Iron breaks her plans".

## Timeline

Years are counted back from the start of the game.

| When | What happened |
|---|---|
| ~10,000 years ago | The Well of Eternity explodes (the Sundering). The Highborne city of Sael'anor sinks. Prince Aeldran bargains with Nal'veshra, the Deepmother, to keep his court alive under the sea. The Wavebreaker trolls and their loa Shal'zua sink with the isle. The night elves' temple to Elune on the Ashenvale coast is swallowed (later Blackfathom Deeps). |
| ~10,000 years ago | The demigod Agamaggan falls in the southern Barrens; the Razorfen thorns grow from his blood. |
| ~200 years ago | The Dark Iron sorcerer-thane Thaurissan calls Ragnaros to win a war. Blackrock Mountain burns ever since. (Our text says "two hundred years"; keep it.) |
| ~21 years ago | The Second War. Deathwing tears the world; the elves of the Arathi pines call him Astaroth, the Black Ruin. He is driven off, never destroyed. |
| After the Second War | The Stonemasons' Guild rebuilds Stormwind. The nobles refuse to pay; the masons become the Defias Brotherhood under Edwin VanCleef. |
| 7 years ago | Lyveus Cloveus defends a Stormwind caravan near Silverleaf Lodge and the Light wakes in him. He joins the Stormwind guard and meets Vyn. |
| 5 years ago | Lyveus overhears a circle of nobles plot to feed the kingdom's soldiers to a dark master. He is condemned; Vyn fakes his death. |
| ~4–5 years ago | The Third War. The plague takes Lordaeron; Arthas purges Stratholme; the Scourge rises; the Barovs sell Caer Darrow to the Cult of the Damned; Arugal makes worgen of Silverpine; the Scarlet Crusade forms. The Legion is driven out. |
| 4 years ago | The game's "fragile peace" begins. |
| 2 years ago | The cabal learns Lyveus is alive. Silverleaf Lodge burns with his kin; the world is told the Syndicate did it. It was Lord Cassius Marrow. |
| Recently | Varian vanishes on the way to Theramore. Lady Prestor rises at court. |
| During the game | Westfall falls to the Defias (10–20); Marshal Windsor rides east and disappears into Blackrock Mountain (30); he is found alive in the Dark Iron cells (40–50); he is freed, returns with Lyveus and unmasks Prestor (60); Onyxia flees and the Stormveil Isle rises (60). |

## The main story, by chapter

What the player knows at each point. Nothing later may be stated earlier (see Reveals).

- **Intro (1), "Shadows over Azeroth".** The peace, the missing king, Bolvar, Anduin, Prestor's influence, the cheated stonemasons, Ragnaros and Nefarian fighting over Blackrock Mountain, "someone pulling every string". Prestor is only an adviser.
- **Chapter 1 (10), "The Brotherhood Stirs".** Westfall burns. Prestor persuades Bolvar not to send soldiers. VanCleef's Brotherhood plans a ship. The player is sent to Sentinel Hill.
- **Chapter 2 (20), "The Stonemasons' Revenge".** Why the Defias rose. Someone else paid for the Juggernaut. "Behind the lady's smile, something older is watching": a hint, not a reveal. Rumours say someone at court feeds the chaos.
- **Chapter 3 (30), "The Marshal's Road".** Black whelps in Redridge; Windsor rides east, learns who sold the Dragonmaw their chains, follows the trail to Blackrock Mountain and does not come out. The court says he deserted.
- **Chapter 4 (40), "Blackrock Rising".** The Dark Iron dig for Ragnaros; Victor Nefarius commands the Blackrock orcs from the spire. Prestor (unnamed as a dragon) calls him "my brother". Windsor is alive, in chains.
- **Chapter 5 (50), "The Masquerade".** Prestor admits, to herself, that she writes the court's orders. Windsor keeps notes in his cell; the Emperor holds them.
- **Chapter 6 (60), "The Brood Mother".** Windsor walks free and brings Lyveus to court. Prestor is unmasked as Onyxia, daughter of Deathwing, and flees south across the sea. Her storm tears the waters open; land appears where none has been for ten thousand years.
- **Expansion (60), "The Drowned Crown".** The Stormveil Isle rises: Sael'anor and its prince, the drowned Wavebreakers, and beneath them Nal'veshra. Alliance land at the Tidewatch Coast (from Menethil Harbor with Admiral Vane); the Horde at the Skullreef Isles (from Grom'gol on the Bloodtide ship). Both reach the Tidecrown Citadel on the same morning and, for once, do not fight each other.

### Dungeon intros (first entry)

Each one sets up the dungeon only. They may mention the main story's villains only as far as the chapter at that level allows. The Deadmines names VanCleef and the Juggernaut; Blackrock Depths names Thaurissan and Ragnaros but not Prestor's link to the mountain; Stratholme says the Grand Crusader "is not what he seems" and no more.

## Characters

### From the world of Warcraft (our portrayal)

- **Lady Katrana Prestor / Onyxia.** Court adviser, patient and contemptuous. Speaks of "little kingdoms" and "a court of fools". Never named as a dragon before 60.
- **Highlord Bolvar Fordragon.** Regent. Honest, overworked, too trusting of Prestor. Believes Windsor in the end.
- **Anduin Wrynn.** The boy king-in-waiting. Seen, rarely heard.
- **Varian Wrynn.** Missing. Nobody in the game knows where he is. Do not resolve this.
- **Marshal Reginald Windsor.** Stubborn, brave, a note-taker. Wrongly called a deserter.
- **Edwin VanCleef.** Leader of the Defias. Bitter, not mad: he believes Stormwind owes him.
- **Victor Nefarius / Nefarian.** Lord of Blackrock Spire, Onyxia's brother. His identity as Nefarian is not stated outright before 60.
- **Ragnaros, the Firelord.** Asleep in the molten sea below Blackrock Depths. A threat, not yet a fight.
- **Emperor Dagran Thaurissan.** Rules the Dark Iron from the Imperial Seat; holds Windsor's notes.

### Original characters

- **Lyveus Cloveus, the Exiled Knight** ("Lyv" to friends). A high elf paladin from Silverleaf Lodge in the Arathi Highlands, once of the Stormwind guard. Quiet, dry, patient; "They made me a ghost. Ghosts keep watch." Created by a friend of the developer and adapted for Azeroth: in the friend's lore his enemy is Astaroth; here Astaroth is the Arathi elves' name for Deathwing, and the cabal is Prestor's circle at court. **Keep his core: exiled, presumed dead, loyal to the few who helped him, fights as a tank with the Light.** He is neutral: both factions can meet him. Before level 37 he appears only as the Hooded Stranger and is never named in quest text.
- **Vyn.** Lyveus's friend from the guard, a human farm boy who rose with him. Faked Lyveus's death. Now writes from Gadgetzan.
- **Lord Cassius Marrow.** The Stormwind noble whose seal is on the cabal's orders. Ships gold through Tanaris to the Dark Iron. Burned Silverleaf Lodge. Killed at level 60 at the grove where Lyveus took his oath.
- **Prince Aeldran Tidecrown.** Highborne prince of Sael'anor. Kept his court alive for ten thousand years through a bargain he does not fully understand. Proud, grieving, dangerous. "Ten thousand years I waited."
- **Nal'veshra, the Deepmother.** A sea spirit older than the Highborne. The true power under the citadel. Ate the loa Shal'zua. "Little lights."
- **Lady Vessaria, the Tidescribe.** Aeldran's scribe; mistress of the Sunken Archive. Her writing raises the drowned.
- **Shal'zua.** A loa of the sea, once served by the Wavebreaker trolls, now swallowed; her avatar wears her face.
- **Hexmother Oyala** and **High Priest Zan'jin.** Raised the drowned Wavebreakers and feed the altar in the Temple of Shal'zua.
- **Admiral Vane** (Alliance) and **Mazu** (Horde). Lead each faction's landing on the isle.
- **Lorekeeper Nerathil.** Keeps the Codex of Tides in the Sunken Archive.

## Places (original)

- **Silverleaf Lodge.** A high elf village in the Arathi pines; Lyveus's home, burned two years ago. Now a Syndicate camp until you clear it.
- **Stormveil Isle.** The risen island. Holds the Tidewatch Coast (Alliance landing), the Skullreef Isles (Horde landing), the drowned city of Sael'anor, Loa's Rest, the causeway and the Tidecrown Citadel.
- **The Sunken Archive.** Sael'anor's great library (Alliance dungeon).
- **The Temple of Shal'zua.** The Wavebreakers' temple (Horde dungeon).
- **The Tidecrown Citadel.** Aeldran's seat; the 10-player raid, shared by both factions.

## Reveals

A term here may not appear in any text a player can read below its level. "Allowed in" lists sources that may use it anyway (the lorekeeper matches the start of the source name). Terms are regular expressions, matched without case.

| Term | Level | What it gives away | Allowed in |
|---|---|---|---|
| `Onyxia` | 60 | Lady Prestor is the dragon Onyxia | |
| `daughter of Deathwing` | 60 | Prestor's true parentage | |
| `Prestor.{0,60}(dragon\|Deathwing\|wyrm)\|(dragon\|Deathwing\|wyrm).{0,60}Prestor` | 60 | Prestor is a dragon | |
| `Nefarius.{0,60}Nefarian\|Nefarian.{0,60}Nefarius` | 60 | Victor Nefarius is Nefarian | |
| `Windsor.{0,40}(alive\|in chains\|prisoner\|cell)` | 40 | Windsor survived the mountain | |
| `Windsor.{0,40}(free\|escaped\|walks out)` | 60 | Windsor is freed | |
| `Sael'anor\|Aeldran\|Nal'veshra\|Deepmother\|Stormveil\|Tidecrown\|Wavebreaker\|Shal'zua\|Vessaria` | 60 | the Drowned Crown expansion | |
| `Marrow` | 45 | Cassius Marrow is behind the cabal | |
| `Lyveus\|\bLyv\b\|Cloveus` | 37 | the Hooded Stranger is Lyveus | `cutscene legend_lyveus`, `legend lyveus`, `npc lyveus`, `lore lyveus_1` |

## Names

Proper names used in the story that are not already the name of an NPC, creature, place, item, quest or zone in the game data. The lorekeeper treats anything else with a capital letter as a possible typo. Add a name here, with a line of what it is, before using it.

- **Alliance / Horde** — the two factions
- **Azeroth** — the world
- **Kaldorei** — the night elves' own name
- **Elune** — the night elves' goddess
- **Burning Legion / Legion** — the demon army driven out four years ago
- **Second War** — about twenty-one years ago; Deathwing's war
- **Well of Eternity** — its explosion sank Sael'anor ten thousand years ago
- **Agamaggan** — boar demigod whose blood grew the Razorfen
- **Zaetar** — demigod, father of the centaur with Theradras
- **Deathwing** — the black dragon aspect; Onyxia and Nefarian's father
- **Astaroth** — the Arathi elves' name for Deathwing ("the Black Ruin"); from Lyveus's original lore
- **Onyxia** — Lady Prestor's true self (revealed at 60)
- **Brood Mother** — Onyxia's title in Chapter 6
- **Katrana Prestor / Prestor** — Onyxia's disguise at the Stormwind court
- **Nefarian** — Onyxia's brother
- **Victor Nefarius / Nefarius** — Nefarian's name as lord of Blackrock Spire
- **Ragnaros / Firelord** — the fire lord under Blackrock Mountain
- **Varian Wrynn / Varian / Wrynn** — the missing king of Stormwind
- **Anduin** — Varian's son
- **Bolvar Fordragon / Bolvar / Fordragon / Highlord** — the regent of Stormwind
- **Reginald Windsor / Reginald** — Marshal Windsor's first name
- **Theramore** — where Varian was sailing when he vanished
- **Lordaeron** — the fallen northern kingdom
- **Arthas** — the prince who purged Stratholme
- **Lich King / Lich** — master of the Scourge
- **Cult of the Damned / Cult / Damned** — the Scourge's living cult; runs Scholomance
- **Naralex** — the dreaming druid of the Wailing Caverns
- **Juggernaut** — the Defias warship in the Deadmines
- **Stonemasons' Guild / Stonemasons** — the masons who rebuilt Stormwind and became the Defias
- **Lyv** — Lyveus's name among friends
- **Silithid** — insect swarms of the south
- **Darkshore** — night elf coast north of Ashenvale
- **Grim Batol / Batol / Grim** — the Dragonmaw fortress in the Wetlands
- **Booty Bay / Bay** — goblin port in southern Stranglethorn
- **Thousand Needles / Needles** — canyon zone south of the Barrens
- **Thandol Span / Span** — the bridge between the Wetlands and Arathi
- **Deeprun Tram / Deeprun / Tram** — the tunnel train between Stormwind and Ironforge
- **Imperial Seat / Seat / Throne** — Thaurissan's throne room in Blackrock Depths; also the thorn throne of Razorfen Kraul
- **Isle** — as in Stormveil Isle
