// LORE: the Lore Journal's pages (Hero → Journey). Prose to read at your own pace, written against the lore bible
// (docs/lore/canon.md) and checked by tools/lorekeeper.js like every other story text.
// D.LORE[key] = { title, section: 'story' | 'legend', lvl, text: [paragraphs], and one unlock rule:
//   chapter: a cutscene id (open once you have seen it, the same rule as the Theater), quest: a quest you finished,
//   open: true (readable from the start) }.
// A page may only say what its chapter has already shown; lvl is the level the lorekeeper checks it at.
(function (root) {
  const D = root.D;
  D.LORE = {
    intro: { title: 'Shadows over Azeroth', section: 'story', chapter: 'intro', lvl: 1, text: [
      'Four years ago the Burning Legion was driven from Azeroth, and the kingdoms of the Alliance have been rebuilding ever since. The peace is real, but it is thin.',
      'In Stormwind, King Varian Wrynn sailed for Theramore and never arrived. Highlord Bolvar Fordragon rules as regent, and the boy Anduin waits for a father who does not come home. Bolvar is an honest man with too much to do. More and more, he leans on a new adviser at court, Lady Katrana Prestor, who is always ready to take a burden off his hands.',
      'Not everyone in the kingdom is grateful to the crown. The stonemasons who rebuilt Stormwind after the Second War were never paid for their work. They have not forgotten, and they have started to take back what they are owed.',
      'Under Blackrock Mountain, older powers stir: Ragnaros the Firelord in the depths, the black dragon Nefarian above him, each fighting for the mountain\'s heart.',
      'None of that has reached you yet. Your story starts small, in the fields and forests near home.',
    ] },
    ch1: { title: 'The Brotherhood Stirs', section: 'story', chapter: 'ch1', lvl: 10, text: [
      'Westfall fed Stormwind for generations. Now its farms burn, and the Defias Brotherhood rules the fields. The farmers have asked the city for soldiers again and again.',
      'Lady Prestor advised the Highlord that the army was needed elsewhere, and that Westfall could look after itself. Not one soldier rode west. Nobody at court asked why.',
      'The Brotherhood is led by Edwin VanCleef, once a master stonemason. His people are miners, thieves and angry farmhands, and they are building something in the dark under Moonbrook. VanCleef talks of a ship, and of the day the whole city pays what it owes.',
      'With no army coming, the farmers formed the People\'s Militia at Sentinel Hill. They take help from anyone willing to give it.',
    ] },
    ch2: { title: 'The Stonemasons\' Revenge', section: 'story', chapter: 'ch2', lvl: 20, text: [
      'After the Second War, Stormwind was a city of rubble. The Stonemasons\' Guild rebuilt it, stone by stone. When the last tower stood, the nobles refused to pay. The masons were called rabble, and some of them decided to become exactly that.',
      'From the ruins of Moonbrook the Brotherhood spread across Westfall. But stolen gold does not build a warship, and the Brotherhood is building one: the Juggernaut, hidden in a cove at the end of the Deadmines. Someone with far deeper pockets is paying for it.',
      'A kingdom fighting its own farmers and masons cannot watch its borders, and that suits someone very well. The rumours have reached every city, Horde and Alliance alike: someone in Stormwind\'s court is feeding the chaos.',
      'If there is an answer, it lies in the Deadmines.',
    ] },
    ch3: { title: 'The Marshal\'s Road', section: 'story', chapter: 'ch3', lvl: 30, text: [
      'Reports reached Stormwind Keep that nobody wanted to read: black dragon whelps in Redridge, and Blackrock orcs at Stonewatch. The Highlord sent Marshal Reginald Windsor east with his best soldiers.',
      'Windsor found the whelps in Galardell Valley, and beside them the tracks of something much larger. He followed the trail north to the Wetlands. There the Dragonmaw orcs keep red dragons below Grim Batol, and he learned who had sold them the means to hold them.',
      'That trail led south, to Blackrock Mountain. The marshal went into the mountain, and he did not come out.',
      'The court announced that Windsor had deserted. The soldiers who rode with him do not believe a word of it.',
    ] },
    ch4: { title: 'Blackrock Rising', section: 'story', chapter: 'ch4', lvl: 40, text: [
      'Blackrock Mountain burns day and night. Deep inside it the Dark Iron dwarves dig for their master, Ragnaros the Firelord, who sleeps in a sea of fire below their city. Every stone they break brings his fire closer to the world above.',
      'Above them, in the spire, the orcs of the Blackrock clan answer to a new lord: Victor Nefarius. He is content to let the dwarves and their Firelord fight over the depths. He wants everything else.',
      'And somewhere in the Dark Iron prisons, Marshal Windsor is still alive. Travellers on the roads say they have seen him in chains, under the mountain.',
      'Someone will have to go and get him. Not yet. But soon.',
    ] },
    ch5: { title: 'The Masquerade', section: 'story', chapter: 'ch5', lvl: 50, text: [
      'In the detention block of Blackrock Depths, Marshal Windsor counts the days. He has spent them well. He has watched who comes and goes from the mountain, and he has written it all down.',
      'His guards took the notes to Emperor Dagran Thaurissan himself, who keeps them at his throne. Nobody, the Emperor says, leaves his mountain to read them.',
      'In Stormwind, the Highlord wants his marshal home, and he wants to know who sent him to that mountain to die. The orders he signs each day come to him neatly written and ready. He has never asked who writes them first.',
      'Whatever banner you fly, the Dark Iron stand in the way. The marshal is in their cells, and his notes are on the Emperor\'s throne.',
    ] },
    ch6: { title: 'The Brood Mother', section: 'story', chapter: 'ch6', lvl: 60, text: [
      'The cell doors of Blackrock Depths stand open. Marshal Windsor walked out into the light with his notes and rode straight for Stormwind, before anyone could warn the court.',
      'He did not come alone. Beside him stood a high elf knight the court had buried five years before: Lyveus Cloveus, who had heard the nobles plot in those same halls.',
      'Before the Highlord, Windsor read out what he had written. Then he turned to the lady beside the young king and asked her to say her true name. The mask fell. Katrana Prestor was Onyxia, daughter of Deathwing, and had been all along.',
      'She did not stay to fight. She laughed at the court of fools she had ruled, and fled south across the sea. The storm she raised tore the waters open behind her, and when it cleared, sailors saw land where there had been none for ten thousand years.',
      'The dragon is gone from Stormwind. Her work is not undone.',
    ] },
    x1: { title: 'The Drowned Crown', section: 'story', chapter: 'x1', lvl: 60, text: [
      'Ten thousand years ago, when the Well of Eternity exploded, the Highborne city of Sael\'anor sank beneath the sea. Its people should have drowned, and most of them did.',
      'Their prince, Aeldran, would not let his court die. In the dark he made a bargain with Nal\'veshra, the Deepmother, a spirit older than the Highborne: his people would live on beneath the waves. She kept her word, after a fashion. She does not give anything back.',
      'The Wavebreaker trolls sank with the isle, and their sea loa, Shal\'zua, sank with them. Now the tribe walks again, praying to a goddess who no longer answers like herself.',
      'Onyxia\'s storm has raised the Stormveil Isle. Kul Tiran ships carry the Alliance from Menethil Harbor to the Tidewatch Coast; Darkspear and Forsaken crews sail from Grom\'gol to the Skullreef Isles. Everyone wants to reach the citadel at its heart first.',
    ] },
    lyveus_1: { title: 'The Exiled Knight', section: 'legend', legend: 'lyveus', open: true, lvl: 1, text: [
      'The high elves of the Arathi pines have their own name for Deathwing: Astaroth, the Black Ruin. He tore the world in the Second War, twenty-one years ago. He was driven off. He was never destroyed.',
      'Lyveus Cloveus grew up in Silverleaf Lodge, a high elf village in those pines, learning the blade, the bow and the old grove oath of his people. Seven years ago, raiders struck a Stormwind caravan near the forest. He ran to defend it, and the Light burst out of him. The crown took him into its guard.',
      'In Stormwind he met Vyn, a farm boy in the same guard. The two rose through the ranks together, until they were chosen to guard the nobles of the court.',
      'Five years ago, in a room he was never meant to enter, Lyveus heard a circle of nobles plot to feed the kingdom\'s soldiers to a dark master. They condemned him for it. Vyn faked his death and got him out of the city.',
      'For three years he lived quietly at home. Then the cabal learned the truth, and Silverleaf Lodge burned with his kin inside. The world was told that Syndicate bandits did it. Lyveus knew better. He walks the roads under a hood now, and keeps watch.',
    ] },
    lyveus_2: { title: 'The Oath Kept', section: 'legend', legend: 'lyveus', quest: 'lg_lyv_oath', lvl: 60, text: [
      'The seal on the cabal\'s orders belonged to Lord Cassius Marrow, a noble of the Stormwind court. His gold went through Tanaris to the Dark Iron, and his fire burned Silverleaf Lodge.',
      'Marshal Windsor\'s notes named the elf guard who should have been dead, and Marrow knew what that meant. He came to the Arathi pines himself, to finish what his fire had started.',
      'Lyveus waited for him at the grove where he first took his oath, and he did not wait alone. Marrow did not leave the grove.',
      'The Exiled Knight is done being a ghost. He fights beside you now, wherever you go.',
    ] },
  };
})(typeof window !== 'undefined' ? window : globalThis);
