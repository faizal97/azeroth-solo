// LORE: the Lore Journal's pages (Hero → Journey). Prose to read at your own pace, written against the lore bible
// (docs/lore/canon.md) and checked by tools/lorekeeper.js like every other story text.
// D.LORE[key] = { title, section: 'story' | 'legend', lvl, text: [paragraphs], and one unlock rule:
//   chapter: a cutscene id (open once you have seen it, the same rule as the Theater), quest: a quest you finished,
//   open: true (readable from the start) }.
// A page may only say what its chapter has already shown; lvl is the level the lorekeeper checks it at.
(function (root) {
  const D = root.D;
  D.LORE = {
    intro: { title: 'The Borrowed Peace', section: 'story', chapter: 'intro', lvl: 1, text: [
      'Twelve years ago the Long War between the Accord and the Krugar ended, not in victory but in exhaustion. Both sides rebuilt their cities, their farms and their armies on borrowed gold.',
      'The lender was the Black Ledger, a guild of brokers and collectors with an office in every city and a debt in every house. It lent to farmers, to towns, to dwarf lords and to the crown of Kingsmere itself. Nobody has met its master.',
      'Last winter King Rhodric Aldane died. Lord Regent Edmund Carrow rules until Prince Tamlin comes of age. Carrow is honest and overworked, and he trusts the one person at court who understands the crown\'s accounts: Lady Meriel Thorne, the Mistress of Coin.',
      'Under Cinderpeak the Slagborn dwarves dig deeper every year to pay what they owe. Below their deepest hall, something vast sleeps in the fire.',
      'None of that has reached you yet. Your story starts small, in the fields and forests near home.',
    ] },
    ch1: { title: 'Debts Come Due', section: 'story', chapter: 'ch1', lvl: 10, text: [
      'Longfield fed Kingsmere for generations. After the war its farmers borrowed from the Ledger to replant. Then came two bad harvests, and the notes fell due.',
      'The Ledger sent its collectors, the Grey Hoods. They took the farms, the barns and the seed grain, and they keep every field they take.',
      'The farmers begged the crown for help. Lady Thorne reminded the Lord Regent that they had signed the notes, and that the law is the law. Not one soldier rode west.',
      'The Grey Hoods answer to Corvin Blackwell, once the finest shipwright in Longfield. The Ledger ruined him too, and now he collects for it to work off his own debt. With no army coming, the farmers formed the Farmers\' Watch at Warrick\'s Rise. They take help from anyone willing to give it.',
    ] },
    ch2: { title: 'The Collector\'s Fleet', section: 'story', chapter: 'ch2', lvl: 20, text: [
      'Blackwell does not keep what he takes. The grain and iron of Longfield go down an old mine below Fenwick to a hidden cove, where he is building ships to carry it all away.',
      'The Ledger pays for the fleet, and it pays strangely: in coins that stay warm in the hand, each one stamped with a claw. No mint in Caldreth strikes them.',
      'Where the ships will sail, nobody knows, and Blackwell stopped asking long ago. In Kingsmere, the Mistress of Coin reports that the crown\'s debts are in good order.',
      'If there are answers, they are in the Smugglers\' Deep.',
    ] },
    ch3: { title: 'The Audit', section: 'story', chapter: 'ch3', lvl: 30, text: [
      'Reports reached the keep that nobody wanted to read: black dragon whelps guarding Ledger strongboxes in Stoneharrow. The Lord Regent sent Marshal Gideon Hale, who was the crown\'s auditor before he was a soldier.',
      'Hale followed the warm coins. In Dunmore Valley he found the whelps. In Greenfen he found the Wyrmchain orcs breeding red drakes, paid in the same gold. Every road the coins took ended at Cinderpeak, where the Ledger keeps a vault in the Spire.',
      'Hale went into the mountain to audit the vault. He did not come out.',
      'Lady Thorne\'s accounts showed him fleeing with crown funds. The soldiers who rode with him do not believe a word of it.',
    ] },
    ch4: { title: 'Cinderpeak Rising', section: 'story', chapter: 'ch4', lvl: 40, text: [
      'Cinderpeak burns day and night. The Slagborn dwarves of Emperor Haldor Grimmark borrowed from the Ledger to rebuild their empire after the war, and they pay it back the only way they can: by digging.',
      'Every hall they open brings them closer to the fire of Vulcarn, the King Below, who sleeps in the mountain\'s heart.',
      'Above them, in the Spire, Lord Kethran Vale keeps the Ledger\'s vault, and the Cinderpeak orcs guard it. A burning mountain costs him nothing.',
      'And somewhere in the Slagborn cells, Marshal Hale is still alive. Someone will have to go and get him. Not yet. But soon.',
    ] },
    ch5: { title: 'Balancing the Books', section: 'story', chapter: 'ch5', lvl: 50, text: [
      'In the cells of Cinderpeak Depths, Marshal Hale counts. He has written down every warm coin that passed through the mountain, and every one of them leads to a single purse.',
      'His guards took the notes to Emperor Grimmark, who keeps them beside his throne. Nobody, the Emperor says, leaves his mountain to read them.',
      'In Kingsmere the coronation is set. Prince Tamlin will be crowned in the spring, and the Lord Regent signs whatever Lady Thorne puts in front of him.',
      'Whatever banner you fly, the Ledger holds your debts too. The marshal is in the Slagborn cells, and his notes are on the Emperor\'s throne.',
    ] },
    ch6: { title: 'The Creditor', section: 'story', chapter: 'ch6', lvl: 60, text: [
      'The cell doors of Cinderpeak Depths stand open. Marshal Hale walked out with his notes and rode for Kingsmere before the coronation.',
      'He did not come alone. Beside him stood a wood elf knight the court had buried five years before: Lyveus Cloveus, who had heard the nobles plot in those same halls.',
      'Hale read his notes to the court. Every coin the Ledger lent the crown came from one purse, and the crown\'s whole debt falls due on the day the prince is crowned. Lady Thorne did not deny it. She handed the Regent the deed and told him the kingdom was already sold.',
      'Then the creditor came to collect: Veshmira of the Black Brood, a black dragon who lends her hoard instead of sleeping on it. Beaten back from Kingsmere, she flew south over the sea to her lair in Saltmarsh, and Lady Thorne went with her. A storm closed over the water behind them to guard the hoard. Out past it, sailors saw land where there had been none for ten thousand years, but no ship could reach it.',
      'The dragon is gone from Kingsmere. The debt is not paid, and her storm will not break while she lives.',
    ] },
    x1: { title: 'The Drowned Crown', section: 'story', chapter: 'x1', lvl: 60, text: [
      'Ten thousand years ago, when the Heartfire exploded, the Starborn city of Sael\'anor sank beneath the sea. Its people should have drowned, and most of them did.',
      'Their prince, Aeldran, would not let his court die. In the dark he made a bargain with Nal\'veshra, the Deepmother, a spirit older than the Starborn: his people would live on beneath the waves. She kept her word, after a fashion. She does not give anything back.',
      'The Wavebreaker trolls sank with the isle, and their sea spirit, Shal\'zua, sank with them. Now the tribe walks again, praying to a goddess who no longer answers like herself.',
      'Veshmira\'s storm raised the Stormveil Isle, and hid it for as long as she lived. When she fell in her lair, the storm broke. Brineholt ships carry the Accord from Gullhaven to the Tidewatch Coast; Kessari and Reclaimed crews sail from Camp Skarn to the Skullreef Isles. Everyone wants to reach the citadel at its heart first.',
    ] },
    lyveus_1: { title: 'The Exiled Knight', section: 'legend', legend: 'lyveus', open: true, lvl: 1, text: [
      'Long before the Long War, the black dragon Ossarak tore the world open. The wood elves of the Kinloch pines call him the Black Ruin. He was driven off. He was never destroyed.',
      'Lyveus Cloveus grew up in Silverleaf Lodge, a wood elf village in those pines, learning the blade, the bow and the old grove oath of his people. Seven years ago, raiders struck a Kingsmere caravan near the forest. He ran to defend it, and the Light burst out of him. The crown took him into its guard.',
      'In Kingsmere he met Vyn, a farm boy in the same guard. The two rose through the ranks together, until they were chosen to guard the nobles of the court.',
      'Five years ago, in a room he was never meant to enter, Lyveus heard a circle of nobles plot to sell the kingdom\'s soldiers to pay a master they had never met. They condemned him for it. Vyn faked his death and got him out of the city.',
      'For three years he lived quietly at home. Then the cabal learned the truth, and Silverleaf Lodge burned with his kin inside. The world was told that bandits from the hills did it. Lyveus knew better. He walks the roads under a hood now, and keeps watch.',
    ] },
    lyveus_2: { title: 'The Oath Kept', section: 'legend', legend: 'lyveus', quest: 'lg_lyv_oath', lvl: 60, text: [
      'The seal on the cabal\'s orders belonged to Lord Cassius Marrow, a noble of the Kingsmere court. His gold went through Sirocco to the Slagborn, and his fire burned Silverleaf Lodge.',
      'Marshal Hale\'s notes named the elf guard who should have been dead, and Marrow knew what that meant. He came to the Kinloch pines himself, to finish what his fire had started.',
      'Lyveus waited for him at the grove where he first took his oath, and he did not wait alone. Marrow did not leave the grove.',
      'The Exiled Knight is done being a ghost. He fights beside you now, wherever you go.',
    ] },
  };
})(typeof window !== 'undefined' ? window : globalThis);
