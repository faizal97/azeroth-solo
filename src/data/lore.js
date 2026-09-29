// LORE: the Lore Journal's pages (Hero → Journey). Prose to read at your own pace, written against the lore bible
// (docs/lore/canon.md) and checked by tools/lorekeeper.js like every other story text.
// D.LORE[key] = { title, section: 'story' | 'legend', lvl, text: [paragraphs], and one unlock rule:
//   chapter: a cutscene id (open once you have seen it, the same rule as the Theater), quest: a quest you finished,
//   open: true (readable from the start) }.
// A page may only say what its chapter has already shown; lvl is the level the lorekeeper checks it at.
(function (root) {
  const D = root.D;
  D.LORE = {
    intro: { title: 'Shadows over Caldreth', section: 'story', chapter: 'intro', lvl: 1, text: [
      'Four years ago the Unmaking was driven from Caldreth, and the kingdoms of the Accord have been rebuilding ever since. The peace is real, but it is thin.',
      'In Kingsmere, King King Rhodric Aldane sailed for Harborwatch and never arrived. Lord Regent Edmund Carrow rules as regent, and the boy Tamlin waits for a father who does not come home. Edmund is an honest man with too much to do. More and more, he leans on a new adviser at court, Lady Meriel Thorne, who is always ready to take a burden off his hands.',
      'Not everyone in the kingdom is grateful to the crown. The stonemasons who rebuilt Kingsmere after the Second War were never paid for their work. They have not forgotten, and they have started to take back what they are owed.',
      'Under Cinderpeak, older powers stir: Vulcarn the King Below in the depths, the black dragon Kethriax above him, each fighting for the mountain\'s heart.',
      'None of that has reached you yet. Your story starts small, in the fields and forests near home.',
    ] },
    ch1: { title: 'The Brotherhood Stirs', section: 'story', chapter: 'ch1', lvl: 10, text: [
      'Longfield fed Kingsmere for generations. Now its farms burn, and the Grey Hoods rules the fields. The farmers have asked the city for soldiers again and again.',
      'Lady Thorne advised the Lord Regent that the army was needed elsewhere, and that Longfield could look after itself. Not one soldier rode west. Nobody at court asked why.',
      'The Brotherhood is led by Corvin Blackwell, once a master stonemason. His people are miners, thieves and angry farmhands, and they are building something in the dark under Fenwick. Blackwell talks of a ship, and of the day the whole city pays what it owes.',
      'With no army coming, the farmers formed the Farmers\' Watch at Warrick\'s Rise. They take help from anyone willing to give it.',
    ] },
    ch2: { title: 'The Stonemasons\' Revenge', section: 'story', chapter: 'ch2', lvl: 20, text: [
      'After the Second War, Kingsmere was a city of rubble. The Stonemasons\' Guild rebuilt it, stone by stone. When the last tower stood, the nobles refused to pay. The masons were called rabble, and some of them decided to become exactly that.',
      'From the ruins of Fenwick the Brotherhood spread across Longfield. But stolen gold does not build a warship, and the Brotherhood is building one: the Juggernaut, hidden in a cove at the end of the Smugglers\' Deep. Someone with far deeper pockets is paying for it.',
      'A kingdom fighting its own farmers and masons cannot watch its borders, and that suits someone very well. The rumours have reached every city, Krugar and Accord alike: someone in Kingsmere\'s court is feeding the chaos.',
      'If there is an answer, it lies in the Smugglers\' Deep.',
    ] },
    ch3: { title: 'The Marshal\'s Road', section: 'story', chapter: 'ch3', lvl: 30, text: [
      'Reports reached Kingsmere Keep that nobody wanted to read: black dragon whelps in Stoneharrow, and Cinderpeak orcs at Watcher\'s Keep. The Lord Regent sent Marshal Gideon Hale east with his best soldiers.',
      'Hale found the whelps in Dunmore Valley, and beside them the tracks of something much larger. He followed the trail north to the Greenfen. There the Wyrmchain orcs keep red dragons below Drakestone Hold, and he learned who had sold them the means to hold them.',
      'That trail led south, to Cinderpeak. The marshal went into the mountain, and he did not come out.',
      'The court announced that Hale had deserted. The soldiers who rode with him do not believe a word of it.',
    ] },
    ch4: { title: 'Cinderpeak Rising', section: 'story', chapter: 'ch4', lvl: 40, text: [
      'Cinderpeak burns day and night. Deep inside it the Slagborn dwarves dig for their master, Vulcarn the King Below, who sleeps in a sea of fire below their city. Every stone they break brings his fire closer to the world above.',
      'Above them, in the spire, the orcs of the Cinderpeak clan answer to a new lord: Lord Kethran Vale. He is content to let the dwarves and their King Below fight over the depths. He wants everything else.',
      'And somewhere in the Slagborn prisons, Marshal Hale is still alive. Travellers on the roads say they have seen him in chains, under the mountain.',
      'Someone will have to go and get him. Not yet. But soon.',
    ] },
    ch5: { title: 'The Masquerade', section: 'story', chapter: 'ch5', lvl: 50, text: [
      'In the detention block of Cinderpeak Depths, Marshal Hale counts the days. He has spent them well. He has watched who comes and goes from the mountain, and he has written it all down.',
      'His guards took the notes to Emperor Haldor Grimmark himself, who keeps them at his throne. Nobody, the Emperor says, leaves his mountain to read them.',
      'In Kingsmere, the Lord Regent wants his marshal home, and he wants to know who sent him to that mountain to die. The orders he signs each day come to him neatly written and ready. He has never asked who writes them first.',
      'Whatever banner you fly, the Slagborn stand in the way. The marshal is in their cells, and his notes are on the Emperor\'s throne.',
    ] },
    ch6: { title: 'The Brood Mother', section: 'story', chapter: 'ch6', lvl: 60, text: [
      'The cell doors of Cinderpeak Depths stand open. Marshal Hale walked out into the light with his notes and rode straight for Kingsmere, before anyone could warn the court.',
      'He did not come alone. Beside him stood a high elf knight the court had buried five years before: Lyveus Cloveus, who had heard the nobles plot in those same halls.',
      'Before the Lord Regent, Hale read out what he had written. Then he turned to the lady beside the young king and asked her to say her true name. The mask fell. Meriel Thorne was Veshmira, daughter of Ossarak, and had been all along.',
      'She did not stay to fight. She laughed at the court of fools she had ruled, and fled south across the sea to her lair in Saltmarsh. The storm she raised tore the waters open behind her. Out past it, sailors saw land where there had been none for ten thousand years, but the storm did not clear, and no ship could reach that land.',
      'The dragon is gone from Kingsmere. Her work is not undone, and her storm will not break while she lives.',
    ] },
    x1: { title: 'The Drowned Crown', section: 'story', chapter: 'x1', lvl: 60, text: [
      'Ten thousand years ago, when the Heartfire exploded, the Starborn city of Sael\'anor sank beneath the sea. Its people should have drowned, and most of them did.',
      'Their prince, Aeldran, would not let his court die. In the dark he made a bargain with Nal\'veshra, the Deepmother, a spirit older than the Starborn: his people would live on beneath the waves. She kept her word, after a fashion. She does not give anything back.',
      'The Wavebreaker trolls sank with the isle, and their sea loa, Shal\'zua, sank with them. Now the tribe walks again, praying to a goddess who no longer answers like herself.',
      'Veshmira\'s storm raised the Stormveil Isle, and hid it for as long as she lived. When she fell in her lair, the storm broke. Brineholt ships carry the Accord from Gullhaven to the Tidewatch Coast; Kessari and Reclaimed crews sail from Camp Skarn to the Skullreef Isles. Everyone wants to reach the citadel at its heart first.',
    ] },
    lyveus_1: { title: 'The Exiled Knight', section: 'legend', legend: 'lyveus', open: true, lvl: 1, text: [
      'The high elves of the Kinloch pines have their own name for Ossarak: Astaroth, the Black Ruin. He tore the world in the Second War, twenty-one years ago. He was driven off. He was never destroyed.',
      'Lyveus Cloveus grew up in Silverleaf Lodge, a high elf village in those pines, learning the blade, the bow and the old grove oath of his people. Seven years ago, raiders struck a Kingsmere caravan near the forest. He ran to defend it, and the Light burst out of him. The crown took him into its guard.',
      'In Kingsmere he met Vyn, a farm boy in the same guard. The two rose through the ranks together, until they were chosen to guard the nobles of the court.',
      'Five years ago, in a room he was never meant to enter, Lyveus heard a circle of nobles plot to feed the kingdom\'s soldiers to a dark master. They condemned him for it. Vyn faked his death and got him out of the city.',
      'For three years he lived quietly at home. Then the cabal learned the truth, and Silverleaf Lodge burned with his kin inside. The world was told that Black Ledger bandits did it. Lyveus knew better. He walks the roads under a hood now, and keeps watch.',
    ] },
    lyveus_2: { title: 'The Oath Kept', section: 'legend', legend: 'lyveus', quest: 'lg_lyv_oath', lvl: 60, text: [
      'The seal on the cabal\'s orders belonged to Lord Cassius Marrow, a noble of the Kingsmere court. His gold went through Sirocco to the Slagborn, and his fire burned Silverleaf Lodge.',
      'Marshal Hale\'s notes named the elf guard who should have been dead, and Marrow knew what that meant. He came to the Kinloch pines himself, to finish what his fire had started.',
      'Lyveus waited for him at the grove where he first took his oath, and he did not wait alone. Marrow did not leave the grove.',
      'The Exiled Knight is done being a ghost. He fights beside you now, wherever you go.',
    ] },
  };
})(typeof window !== 'undefined' ? window : globalThis);
