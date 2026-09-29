// Realm of Loner — story cutscenes: a tiny in-page film player plus the chapter scripts.
// Shots use our own art (ART.story scenes/actors, ART.scene, ART.mob, the player's hero).
(function (root) {
  const CS = { playing: null, music: null };
  const STORE = 'azsolo.story';

  // ------------------------------------------------------------ chapters
  // lines: {t: seconds into the shot, who: speaker or '' for narrator, text}. {name}/{zone} fill in per player.
  CS.CHAPTERS = [
    { id: 'intro', level: 1, title: 'The Borrowed Peace', music: 'elwynn', shots: [
      { bg: 'story:azeroth_dawn', dur: 9, cam: [[0, 0, 1.12], [0, -2, 1.0]], fx: ['fadein'],
        lines: [{ t: 0.6, text: 'Twelve years have passed since the Long War between the Accord and the Krugar.' }, { t: 4.8, text: 'Both sides rebuilt on borrowed gold, and a tired peace holds.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[-3, 0, 1.08], [3, 0, 1.08]],
        actors: [{ a: 'story:king_varian_portrait', x: 50, y: 42, w: 17 }, { a: 'story:bolvar', x: 16, y: 2, w: 34, flip: true, from: { x: -8, o: 0 } }],
        lines: [{ t: 0.5, text: 'Last winter, Kingsmere buried King Rhodric Aldane.' }, { t: 5.2, text: 'Lord Regent Edmund Carrow rules until Prince Tamlin comes of age, and he is drowning in paperwork.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[3, 0, 1.08], [0, 0, 1.2]],
        actors: [{ a: 'story:bolvar', x: 14, y: 2, w: 34, flip: true }, { a: 'story:lady_prestor', x: 62, y: 2, w: 34, from: { x: 95, o: 0 }, delay: 0.3, dur: 2.2 }],
        lines: [{ t: 0.8, text: 'The crown\'s Mistress of Coin, Lady Meriel Thorne, keeps its books. Nobody else can read them.' }, { t: 5, who: 'Lady Thorne', text: 'Every stone of this city was bought on credit, my lord. Someone will come to collect.' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[4, 2, 1.15], [-2, 0, 1.05]], fx: ['fadein'],
        actors: [{ a: 'story:defias_crowd', x: 8, y: 0, w: 46, flip: true, from: { x: -10, o: 0 } }, { a: 'story:vancleef_story', x: 58, y: 0, w: 40, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'In Longfield, the farmers who borrowed to replant after the war cannot pay. The Black Ledger sends its collectors.' }, { t: 5, who: 'Corvin Blackwell', text: 'I owed the Ledger too, once. Now I collect for it. Pay, or pack your things.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['embers', 'shake'],
        actors: [{ a: 'story:ragnaros', x: 25, y: 0, w: 50, from: { y: -30, o: 0 }, delay: 1.5, dur: 3 }],
        lines: [{ t: 0.8, text: 'Under Cinderpeak, the Slagborn dwarves dig deeper every year to pay what they owe.' }, { t: 5.2, text: 'Below the deepest hall, something vast sleeps in the fire.' }] },
      { bg: 'story:shadow_court', dur: 10, cam: [[0, 0, 1.0], [0, -3, 1.18]],
        actors: [{ a: 'story:prestor_shadow', x: 25, y: 0, w: 50, from: { o: 0 }, delay: 1.2, dur: 2.5 }],
        fx: ['flash@3.8'],
        lines: [{ t: 0.4, text: 'Everyone owes the Black Ledger something. Nobody has met its master.' }, { t: 5.2, who: 'A voice in the dark', text: 'Lend them everything. A kingdom in debt is a kingdom for sale.' }] },
      { bg: 'scene:@start', dur: 9, cam: [[0, 0, 1.15], [0, 0, 1.0]], fx: ['fadein', 'fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, from: { x: 20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, text: 'Far from the court, in {zone}, a new hero takes up arms.' }, { t: 4.8, text: 'Your story begins here, {name}.' }] },
    ] },
    { id: 'ch1', level: 10, title: 'Chapter 1: Debts Come Due', music: 'dungeon', shots: [
      { bg: 'story:westfall', dur: 10, cam: [[-4, 0, 1.1], [4, 0, 1.1]], fx: ['fadein', 'embers'],
        actors: [{ a: 'story:defias_crowd', x: 50, y: 0, w: 46, from: { x: 80, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Longfield once fed all of Kingsmere. Now its fields have new owners.' }, { t: 5, text: 'The Grey Hoods collect for the Black Ledger, and every farm they take, they keep.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 0, 1.05], [0, 0, 1.18]],
        actors: [{ a: 'story:bolvar', x: 12, y: 2, w: 34, flip: true }, { a: 'story:lady_prestor', x: 60, y: 2, w: 34 }],
        lines: [{ t: 0.5, who: 'Lord Regent Carrow', text: 'The farmers of Longfield beg for soldiers, my lady.' }, { t: 4.4, who: 'Lady Thorne', text: 'They signed the notes, my lord. The law is the law, and a debt is a debt.' }, { t: 8.2, text: 'Not one soldier rides west.' }] },
      { bg: 'scene:deadmines_ship', dur: 10, cam: [[0, 3, 1.2], [0, 0, 1.02]], fx: ['shake@6'],
        actors: [{ a: 'story:vancleef_story', x: 40, y: 0, w: 40, anim: 'breathe' }],
        lines: [{ t: 0.5, who: 'Corvin Blackwell', text: 'Every sack of grain, every bar of iron, into the ships. The Ledger wants it all by spring.' }, { t: 5.5, who: 'Corvin Blackwell', text: 'Nobody asks where it goes. I stopped asking the day they took my shipyard.' }] },
      { bg: 'scene:@here', dur: 9, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Word of the Grey Hoods has reached you, {name}.' }, { t: 4.4, text: 'The Farmers\' Watch gathers at Warrick\'s Rise. The road west is waiting.' }] },
    ] },
    // ---- instance intros: play once, the first time any character enters
    { id: 'legend_lyveus', legend: 'lyveus', title: 'Lyveus Cloveus: The Exiled Knight', music: 'dungeon', shots: [
      { bg: 'story:azeroth_dawn', dur: 11, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein', 'embers', 'shake@6'],
        actors: [{ a: 'story:deathwing', x: 36, y: 0, w: 60, anim: 'breathe', from: { y: -16, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: 'Long before the Long War, the black dragon Ossarak tore the world open. The elves of the Kinloch pines call him the Black Ruin.' }, { t: 6, text: 'He was driven off. He was never destroyed.' }] },
      { bg: 'scene:silverleaf_lodge', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:lyveus', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'In Silverleaf Lodge, a wood elf village in those pines, young Lyveus Cloveus learned the blade, the bow, and the old grove oath of his people.' }] },
      { bg: 'story:caravan_road', dur: 11, cam: [[0, 0, 1.05], [0, -2, 1.2]], fx: ['shake@4'],
        actors: [{ a: 'story:lyveus', x: 40, y: 2, w: 32, anim: 'breathe', from: { x: 20, o: 0 }, dur: 1.2 }],
        lines: [{ t: 0.5, text: 'Seven years ago, raiders struck a Kingsmere caravan near the forest. Lyveus ran to defend it, and the Light burst out of him.' }, { t: 6, text: 'The crown took him into its guard: a fine sword, and a sign that the old bond between men and elves still held.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:lyveus', x: 18, y: 2, w: 30, flip: true }, { a: 'story:vyn', x: 58, y: 2, w: 30, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'In Kingsmere he met Vyn. The two rose through the ranks together, until they were chosen to guard the nobles of the court.' }, { t: 5.5, who: 'Vyn', text: 'An elf and a farm boy, guarding lords. Who would have guessed?' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Five years ago, in a room he was never meant to enter, he heard a circle of nobles plot to sell the kingdom\'s soldiers to pay a master they had never met.' }, { t: 6, who: 'A voice in the dark', text: 'No one will miss a few soldiers. Or one elf.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 0, 1.12], [0, 2, 1.02]],
        actors: [{ a: 'story:vyn', x: 40, y: 2, w: 32, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'They condemned him. Vyn faked his death and got him out of the city.' }, { t: 5, who: 'Vyn', text: 'Go home, Lyv. Be dead for a while. I\'ll keep my ears open.' }] },
      { bg: 'story:silverleaf_burning', dur: 11, cam: [[-3, 0, 1.12], [3, 0, 1.12]], fx: ['embers'],
        lines: [{ t: 0.5, text: 'For three years he lived quietly at home. Then the cabal learned the truth.' }, { t: 5.5, text: 'Silverleaf Lodge burned, and his kin with it. The world was told it was bandits from the hills. Lyveus knew better.' }] },
      { bg: 'scene:silverleaf_lodge', dur: 11, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'story:lyveus_hooded', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'He alone survived. Now he walks the roads under a hood, and the Black Brood stirs again.' }, { t: 6, who: 'Lyveus Cloveus', text: 'They made me a ghost. Ghosts keep watch.' }] },
    ] },
    { id: 'dm_intro', instance: 'deadmines', title: 'The Smugglers\' Deep', music: 'dungeon', shots: [
      { bg: 'story:westfall', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Fenwick was once a quiet mining town in Longfield. The Ledger foreclosed on it, and now it stands empty.' }, { t: 4.8, text: 'Beneath it runs an old mine the Grey Hoods use as their road to the sea.' }] },
      { bg: 'scene:deadmines_mine', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:defias_miner', x: 58, y: 2, w: 24 }, { a: 'mob:goblin_engineer', x: 30, y: 2, w: 20, from: { x: 10, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Grey Hood miners dig day and night. Goblin engineers, paid in warm Ledger coin, build machines in the dark.' }, { t: 5.5, who: 'Goblin Engineer', text: 'Time is money, friend! Keep those carts moving!' }] },
      { bg: 'scene:deadmines_mine', dur: 8, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['shake@2'],
        actors: [{ a: 'mob:rhahkzor', x: 40, y: 0, w: 34, from: { x: 70, o: 0 }, dur: 1.8 }],
        lines: [{ t: 0.6, text: 'Rukko, Blackwell\'s ogre foreman, guards the first gate.' }, { t: 4.2, who: "Rukko the Foreman", text: 'Blackwell pay big for your heads!' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.2]],
        actors: [{ a: 'story:defias_crowd', x: 6, y: 0, w: 44, flip: true }, { a: 'story:vancleef_story', x: 58, y: 0, w: 38, anim: 'breathe', from: { o: 0 }, delay: 2, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the end of the mine, in a hidden cove, Blackwell builds the Ledger\'s fleet.' }, { t: 5.8, who: 'Corvin Blackwell', text: 'Nobody takes back what the Ledger owns!' }], fx: ['fadeout'] },
    ] },
    { id: 'rfc_intro', instance: 'ragefire', title: 'The Smoke Pit', music: 'dungeon', shots: [
      { bg: 'scene:orgrimmar', dur: 9, cam: [[0, 0, 1.12], [0, 3, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Vazhrak, capital of the Krugar, was built on the red earth of Dunescar.' }, { t: 4.8, text: 'But beneath its streets, something festers.' }] },
      { bg: 'scene:ragefire_chasm', dur: 10, cam: [[-4, 2, 1.18], [3, 0, 1.06]], fx: ['embers'],
        actors: [{ a: 'mob:searing_blade_cultist', x: 56, y: 2, w: 24 }, { a: 'mob:ragefire_trogg', x: 30, y: 2, w: 20, from: { x: 10, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The Smoke Pit is a maze of volcanic caves, crawling with cavekin.' }, { t: 5, text: 'The Hollow Eye, a cult of demon worshippers, hides here and plots against the Warchief.' }] },
      { bg: 'scene:ragefire_chasm', dur: 9, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['shake@1.5', 'embers'],
        actors: [{ a: 'mob:taragaman', x: 36, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.8, who: 'Bazzak the Hungerer', text: 'They call me the Hungerer. Soon you will see why!' }] },
      { bg: 'scene:ragefire_chasm', dur: 9, cam: [[2, 0, 1.1], [-2, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'mob:jergosh', x: 20, y: 2, w: 26 }, { a: 'mob:bazzalan', x: 56, y: 2, w: 26 }],
        lines: [{ t: 0.5, text: 'Varrok the Invoker and the satyr Ulzan lead the cult from the deepest caves.' }, { t: 4.8, text: 'The Warchief\'s order is clear: root them out.' }] },
    ] },
    { id: 'wc_intro', instance: 'wailing_caverns', title: 'The Dreaming Caves', music: 'dungeon', shots: [
      { bg: 'scene:lushwater_oasis', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Beneath the oases of the Scrublands lies a maze of caves where the wind moans like a living thing.' }, { t: 5, text: 'The Hornfolk call them the Dreaming Caves.' }] },
      { bg: 'scene:wailing_caverns', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:druid_of_the_fang', x: 56, y: 2, w: 24 }, { a: 'mob:deviate_ravager', x: 28, y: 2, w: 22, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The wood elf druid Elarion came here to heal the dying land. He fell asleep, and his dream became a nightmare.' }, { t: 5.5, text: 'His disciples, the Druids of the Coil, turned the caves and every beast in them into something twisted.' }] },
      { bg: 'scene:wailing_caverns', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:lady_anacondra', x: 40, y: 0, w: 32, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Lady Sythra', text: 'None can stand against the Serpent Lords!' }, { t: 4.4, text: 'Four Coil leaders guard the way to the dreamer.' }] },
      { bg: 'scene:wailing_caverns_deep', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:mutanus', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'And in the deepest grotto, something feeds on Elarion\'s nightmare.' }, { t: 5, who: 'Gulgoth the Dreambane', text: 'Elarion dreams... and I feed.' }] },
    ] },
    { id: 'stockade_intro', instance: 'stockade', title: 'Kingsmere Gaol', music: 'dungeon', shots: [
      { bg: 'scene:stormwind', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Beneath the canals of Kingsmere lies the Gaol, where the crown keeps its worst prisoners and its worst debtors.' }, { t: 5, text: 'Tonight, the prisoners hold the keys.' }] },
      { bg: 'scene:the_stockade', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:defias_insurgent', x: 56, y: 2, w: 22 }, { a: 'mob:defias_convict', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Someone smuggled blades past the guards. The cell doors opened all at once.' }, { t: 5.5, text: 'Orc butchers, dwarf traitors and Grey Hood thieves now run the cell blocks.' }] },
      { bg: 'scene:the_stockade', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:targorr', x: 40, y: 0, w: 30, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Ulgrak the Butcher', text: 'Free at last! And you will be the first to die!' }, { t: 4.4, text: 'The wardens hold the gate. Nobody else will go in.' }] },
      { bg: 'scene:stockade_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:bazil_thredd', x: 40, y: 0, w: 32, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the bottom of it all waits Silas Crane, the Grey Hood who planned the riot.' }, { t: 5, who: 'Silas Crane', text: 'Blackwell will have your head for this!' }] },
    ] },
    { id: 'sfk_intro', instance: 'shadowfang', title: 'Greyhowl Keep', music: 'dungeon', shots: [
      { bg: 'scene:pyrewood_village', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'When the Hollow Host came to Wexmoor, the archmage Cairn tried to fight it with a curse of his own.' }, { t: 5, text: 'He called wolves from another world, and made werewolves of the people of Needlewood.' }] },
      { bg: 'scene:shadowfang_courtyard', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:shadowfang_moonwalker', x: 56, y: 2, w: 22 }, { a: 'mob:haunted_servitor', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The werewolves turned on everyone. Cairn went mad and took Greyhowl Keep for himself.' }, { t: 5.5, text: 'The baron who owned it still walks its halls, dead and unable to leave.' }] },
      { bg: 'scene:shadowfang_hall', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:fenrus', x: 40, y: 0, w: 32, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, text: 'His wolf, Grimwolf, guards the stairs to the tower.' }, { t: 4.4, text: 'Every werewolf in Needlewood answers to the man at the top.' }] },
      { bg: 'scene:shadowfang_hall', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:arugal', x: 40, y: 0, w: 32, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Archmage Cairn waits in his tower.' }, { t: 5, who: 'Archmage Cairn', text: 'You, too, shall serve!' }] },
    ] },
    { id: 'bfd_intro', instance: 'blackfathom', title: 'The Tidehollow Deeps', music: 'dungeon', shots: [
      { bg: 'scene:the_zoram_strand', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Long ago the wood elves built a temple to the moon on the coast of Elderglen.' }, { t: 5, text: 'When the Heartfire burst, the sea swallowed it.' }] },
      { bg: 'scene:blackfathom_deeps', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:blackfathom_myrmidon', x: 56, y: 2, w: 22 }, { a: 'mob:aku_mai_snapjaw', x: 28, y: 2, w: 22, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Now naga swim its flooded halls, and something older stirs below.' }, { t: 5.5, text: 'The Eclipse Cult has come to wake it.' }] },
      { bg: 'scene:blackfathom_depths', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:twilight_lord_kelris', x: 40, y: 0, w: 30, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Eclipse Lord Oreth', text: 'Who dares disturb my meditation?' }, { t: 4.4, text: 'Oreth, a wood elf who betrayed his people, leads the cult.' }] },
      { bg: 'scene:blackfathom_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:aku_mai', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "In the black pool at the bottom, the cult feeds their god: Old Coilmaw." }, { t: 5, text: 'Both the Accord and the Krugar send heroes down. Few come back.' }] },
    ] },
    { id: 'gnomer_intro', instance: 'gnomeregan', title: 'Gearhollow', music: 'dungeon', shots: [
      { bg: 'scene:gnomeregan_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Gearhollow was the wonder of the gnomes: a city of gears and steam beneath the snows of Kaldvik.' }, { t: 5, text: 'Then the cavekin came up from the deep.' }] },
      { bg: 'scene:gnomeregan_halls', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:irradiated_pillager', x: 56, y: 2, w: 22 }, { a: 'mob:leper_gnome', x: 28, y: 2, w: 18, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their chief engineer promised a machine to drive them out. When he switched it on, the halls filled with poison.' }, { t: 5.5, text: 'It killed thousands. The cavekin survived. So did the gnomes who stayed behind, sick and changed.' }] },
      { bg: 'scene:gnomeregan_core', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:mekgineer_thermaplugg', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The engineer who built it, Chief Engineer Voltwhistle, rules the ruins now, and says it worked.' }, { t: 5, who: 'Chief Engineer Voltwhistle', text: 'My machines are the future! They will destroy you!' }] },
    ] },
    { id: 'rfk_intro', instance: 'razorfen_kraul', title: 'The Thorn Warrens', music: 'dungeon', shots: [
      { bg: 'scene:razorfen_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Long ago a great boar spirit fell in the south of the Scrublands.' }, { t: 5, text: 'Great thorns grew from its blood. The spinehide made them their home.' }] },
      { bg: 'scene:razorfen_kraul', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:razorfen_quilguard', x: 56, y: 2, w: 22 }, { a: 'mob:death_head_cultist', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Inside the Warrens, a cult of the dead has taken root among the tribe.' }, { t: 5.5, text: 'Its masks and skulls whisper of a power older than the thorns.' }] },
      { bg: 'scene:razorfen_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:charlga_razorflank', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their matriarch, Mother Grisla, waits on the thorn throne.' }, { t: 5, who: 'Mother Grisla', text: 'The thorns will be your grave!' }] },
    ] },
    { id: 'sm_intro', instance: 'sm_library', also: ['sm_cathedral'], title: 'The Pyre Abbey', music: 'dungeon', shots: [
      { bg: 'scene:scarlet_monastery_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'When the plague took Wexmoor, a few survivors swore to burn out every trace of undeath.' }, { t: 5, text: 'They called themselves the Order of the Pyre.' }] },
      { bg: 'scene:sm_library', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:scarlet_monk', x: 56, y: 2, w: 22 }, { a: 'mob:scarlet_chaplain', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their faith turned to madness. Now they kill anyone they suspect: the living and the dead alike.' }, { t: 5.5, text: 'Their abbey in Pallmoor holds their library, their armory and their cathedral.' }] },
      { bg: 'scene:sm_cathedral', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:high_inquisitor_whitemane', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'In the cathedral, Commander Vance and High Inquisitor Ashe lead them.' }, { t: 5, text: 'The Krugar and the Accord agree on almost nothing. They agree on this.' }] },
    ] },
    { id: 'zf_intro', instance: 'zul_farrak', title: 'The Dune Temple', music: 'dungeon', shots: [
      { bg: 'scene:zul_farrak_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'In the burning sands of Sirocco rises the city of the Duneskin trolls.' }, { t: 5, text: 'They raid every caravan on the road to Coppergulch.' }] },
      { bg: 'scene:zf_courtyard', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:sandfury_blood_drinker', x: 56, y: 2, w: 22 }, { a: 'mob:zul_farrak_zombie', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their witch doctors raise the dead, and their priests keep a hydra in the sacred pool.' }, { t: 5.5, text: 'Goblin mercenaries who came to rob the city now fight for their lives on the pyramid stairs.' }] },
      { bg: 'scene:zf_temple', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:chief_ukorz_sandscalp', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the top of the temple waits their chief, Uzzak.' }, { t: 5, who: 'Chief Uzzak', text: "Who dares enter the Chief's city?" }] },
    ] },
    { id: 'md_intro', instance: 'maraudon', title: 'The Gemfall Caves', music: 'dungeon', shots: [
      { bg: 'scene:maraudon_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'The centaur say the Gemfall Caves are where their people were born, from a wandering god and the Stone Duchess.' }, { t: 5, text: 'Now the caves poison all of Mournwaste.' }] },
      { bg: 'scene:maraudon_caverns', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:putridus_trickster', x: 56, y: 2, w: 22 }, { a: 'mob:constrictor_vine', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Satyrs and twisted vines choke the purple caves. Faolan, a keeper of the grove, lies cursed in the falls.' }, { t: 5.5, text: 'Deeper still, the earth itself moves.' }] },
      { bg: 'scene:maraudon_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:princess_theradras', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'On her stone throne sits Ghesra, the Stone Duchess.' }, { t: 5, who: 'Ghesra', text: 'You will be buried in my caverns!' }] },
    ] },
    { id: 'brd_intro', instance: 'blackrock_depths', title: 'Cinderpeak Depths', music: 'dungeon', shots: [
      { bg: 'scene:blackrock_mountain', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'The Slagborn were a proud people once. After the Long War they borrowed to rebuild their empire, and the Ledger lent gladly.' }, { t: 5.2, text: 'To pay it back, they dig. Every hall they open brings them closer to the fire below.' }] },
      { bg: 'scene:brd_city', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:shadowforge_flame_keeper', x: 56, y: 2, w: 22 }, { a: 'mob:anvilrage_warden', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their city of Ashforge works off its debt one forge at a time.' }, { t: 5.5, text: 'Prisons, forges, golem workshops, a whole kingdom under the stone.' }] },
      { bg: 'scene:brd_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:emperor_dagran_thaurissan', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Emperor Haldor Grimmark rules it all from the Anvil Throne.' }, { t: 5, who: 'Emperor Grimmark', text: 'Come to aid the Throne!' }] },
    ] },
    { id: 'scholo_intro', instance: 'scholomance', title: 'The Blackcloister', music: 'dungeon', shots: [
      { bg: 'scene:caer_darrow', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Castle Ardmore was the seat of the Varga family. They borrowed against it to buy a promise of eternal life.' }, { t: 5.5, text: 'The necromancers who bought the debt kept their word, after a fashion.' }] },
      { bg: 'scene:scholo_hall', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:scholomance_necromancer', x: 56, y: 2, w: 22 }, { a: 'mob:scholomance_acolyte', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "In the crypts beneath the castle, they run a school. Its lessons are necromancy." }, { t: 5.5, text: "Every necromancer of the Hollow Host learned here." }] },
      { bg: 'scene:scholo_study', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:darkmaster_gandling', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Headmaster Sallow never lets a student leave.' }, { t: 5, who: 'Headmaster Sallow', text: 'School is in session!' }] },
    ] },
    { id: 'strat_intro', instance: 'stratholme', title: 'Graymouth', music: 'dungeon', shots: [
      { bg: 'scene:stratholme_gate', dur: 10, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'When the plague reached Graymouth, its lord barred the gates with the living still inside.' }, { t: 5.5, text: 'It turned anyway. It has been burning ever since.' }] },
      { bg: 'scene:strat_bastion', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:crimson_guardsman', x: 56, y: 2, w: 22 }, { a: 'mob:crimson_conjuror', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The Order of the Pyre holds the living side of the city. Its Grand Crusader is not what he seems.' }, { t: 5.5, text: 'The dead hold the rest.' }] },
      { bg: 'scene:strat_ziggurat', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:baron_rivendare', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Among the ziggurats rules Baron Mortvale, lord of the Hollow Host.' }, { t: 5, who: 'Baron Mortvale', text: 'Intruders! More pawns for my master.' }] },
    ] },
    { id: 'archive_intro', instance: 'sunken_archive', title: 'The Sunken Archive', music: 'dungeon', shots: [
      { bg: 'scene:archive_steps', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: "Under the drowned orchards lies the great library of Sael'anor, ten thousand years under the sea." }, { t: 5, text: 'Its keepers never stopped working. They never stopped being dead, either.' }] },
      { bg: 'scene:archive_hall', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:drowned_scholar', x: 56, y: 2, w: 22 }, { a: 'mob:archive_wardkeeper', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Drowned scholars still read the same pages. Ink moves in the water like something alive.' }, { t: 5.5, text: 'Every tide chart the Tidecrown needs was written here.' }] },
      { bg: 'scene:archive_sanctum', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:lady_vessaria', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "Lady Vessaria, Aeldran's scribe, writes the drowned back into the world." }, { t: 5, who: 'Lady Vessaria', text: 'Every word I write, the sea obeys.' }] },
    ] },
    { id: 'shalzua_intro', instance: 'shalzua_temple', title: "Temple of Shal'zua", music: 'dungeon', shots: [
      { bg: 'scene:temple_steps', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: "The Wavebreaker trolls once served Shal'zua, a spirit of the sea. When the isle sank, they sank with it." }, { t: 5, text: 'They are praying again.' }] },
      { bg: 'scene:shalzua_shrine', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:wavebreaker_zealot', x: 56, y: 2, w: 22 }, { a: 'mob:wavebreaker_spiritcaller', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Hexmother Oyala raised the drowned tribe. High Priest Zan\'jin feeds the altar.' }, { t: 5.5, text: 'But the thing they pray to does not answer like a spirit.' }] },
      { bg: 'scene:shalzua_sanctum', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:avatar_of_shalzua', x: 40, y: 0, w: 38, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "Shal'zua's avatar rises from the altar, wearing the spirit's face. Something else looks out through its eyes." }, { t: 5, who: "Avatar of Shal'zua", text: 'I... was a god...' }] },
    ] },
    { id: 'mc_intro', instance: 'molten_core', title: 'The Magma Throne', music: 'dungeon', shots: [
      { bg: 'scene:molten_core_gate', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Below Cinderpeak Depths lies a sea of fire. The Slagborn dug toward it to pay their debts, and did not stop when the stone grew hot.' }, { t: 6, text: 'The Emperor is gone now. Nothing keeps Vulcarn asleep.' }] },
      { bg: 'scene:mc_halls', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:core_hound', x: 26, y: 2, w: 24 }, { a: 'mob:majordomo_executus', x: 62, y: 2, w: 24, anim: 'breathe', from: { x: 80, o: 0 }, dur: 1.8 }],
        lines: [{ t: 0.5, text: 'His lieutenants guard the runes that feed the fire: hounds of living lava, lords of flame, and the Steward who keeps his house.' }, { t: 6, who: 'Steward Cindral', text: 'The King Below\'s house is not open to the living.' }] },
      { bg: 'scene:mc_lake', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:ragnaros', x: 40, y: 0, w: 50, anim: 'breathe', from: { y: 18, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the heart of the mountain, the lava lake begins to rise.' }, { t: 5.5, who: 'Vulcarn', text: 'They dug toward me to pay their little debts. Now the little ones come to put out the fire? Burn.' }] },
    ] },
    { id: 'onyxia_intro', instance: 'onyxias_lair', title: "Veshmira's Lair", music: 'dungeon', shots: [
      { bg: 'scene:the_wyrmbog', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['fadein', 'embers'],
        actors: [{ a: 'mob:brood_dragonspawn', x: 58, y: 2, w: 22 }],
        lines: [{ t: 0.5, text: 'For years Veshmira bought the Accord one debt at a time. When her deal came to light, she flew home to her hoard.' }, { t: 5.5, text: 'Home is the Dragonmire, deep in Saltmarsh, where her brood guards the gold.' }] },
      { bg: 'scene:lair_tunnel', dur: 10, cam: [[0, 0, 1.18], [0, 0, 1.02]],
        actors: [{ a: 'mob:onyxian_warder', x: 30, y: 2, w: 24 }, { a: 'mob:onyxian_warder', x: 66, y: 2, w: 24, flip: true }],
        lines: [{ t: 0.5, text: 'Her warders hold the tunnel. Beyond them, the whelps of a whole new brood are hatching in the heat.' }, { t: 5.5, text: 'Over the sea, her storm still hides the risen isle. It will not break while she lives.' }] },
      { bg: 'scene:lair_cavern', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:onyxia', x: 40, y: 0, w: 48, anim: 'breathe', from: { y: -10, o: 0 }, dur: 1.4 }],
        lines: [{ t: 0.5, text: 'The creditor waits on a nest of scorched stone and stolen coin.' }, { t: 5.5, who: 'Veshmira', text: 'You came all this way to settle your debts? Very well. I accept payment in blood.' }] },
    ] },
    { id: 'tidecrown_intro', instance: 'tidecrown_citadel', title: 'The Tidecrown Citadel', music: 'dungeon', shots: [
      { bg: 'scene:tidecrown_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: "At the end of the causeway stands the Tidecrown Citadel, Prince Aeldran's seat. The Accord and the Krugar arrive at its gate on the same morning." }, { t: 5.5, text: 'For once, neither side draws on the other.' }] },
      { bg: 'scene:citadel_throne', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:prince_aeldran', x: 44, y: 0, w: 34, from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The prince waits on his coral throne, with his drowned court around him.' }, { t: 5, who: 'Prince Aeldran', text: 'Ten thousand years I waited. You will not take the surface from me.' }] },
      { bg: 'scene:citadel_abyss', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:nalveshra', x: 40, y: 0, w: 42, from: { y: 20, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: 'Below the throne, the Deepmother waits in the dark.' }, { t: 5, who: "Nal'veshra", text: 'Little lights. I will swallow you as I swallowed the spirit.' }] },
    ] },
    { id: 'ch2', level: 20, title: 'Chapter 2: The Collector\'s Fleet', music: 'dungeon', shots: [
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Corvin Blackwell once built the finest ships in Longfield. The Ledger lent him the timber.' }, { t: 5.2, text: 'One bad season, and the Ledger took the yard, the ships and the house. It let him keep the debt.' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['embers'],
        actors: [{ a: 'story:vancleef_story', x: 44, y: 0, w: 40, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Corvin Blackwell', text: 'They said I could work it off. Every farm I take knocks a little off what I owe.' }, { t: 5.2, who: 'Corvin Blackwell', text: 'Now they want a fleet. I build what I am told, and I stop asking questions.' }] },
      { bg: 'scene:moonbrook', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'story:defias_crowd', x: 48, y: 0, w: 46, from: { x: 80, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'From Fenwick, the Grey Hoods spread across Longfield, and the seized grain went down to the Smugglers\' Deep.' }, { t: 5, text: 'The Ledger paid for the fleet in coins that stay warm in the hand, each one stamped with a claw.' }] },
      { bg: 'story:shadow_court', dur: 12, cam: [[0, 0, 1.05], [0, 2, 1.22]], fx: ['shake@9'],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Thorne', text: 'Let the farmers and the collectors quarrel. Quarrels are cheap.' }, { t: 5, who: 'Lady Thorne', text: 'A kingdom busy with its own debts never reads its own books.' }, { t: 9.2, text: 'Somewhere, whoever holds the Ledger\'s purse is counting.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Rumours reach every city, {name}: the Ledger\'s gold comes from no mine in Caldreth.' }, { t: 5, text: 'Blackwell\'s fleet waits in the Smugglers\' Deep. Accord or Krugar, everyone owes someone.' }] },
    ] },
    { id: 'ch3', level: 30, title: 'Chapter 3: The Audit', music: 'dungeon', shots: [
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein'],
        actors: [{ a: 'story:bolvar', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'Reports reached the keep: black dragon whelps guarding Ledger strongboxes in Stoneharrow.' }, { t: 5.2, who: 'Lord Regent Carrow', text: 'Dragons, guarding coin? Send Marshal Hale. He was an auditor before he was a soldier.' }] },
      { bg: 'scene:galardell_valley', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:black_dragon_whelp', x: 52, y: 18, w: 26, anim: 'breathe', from: { x: 90, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Marshal Gideon Hale rode east with his best soldiers and his account books.' }, { t: 5, text: 'In Dunmore Valley he found the whelps, and the claw-stamped coins they guarded.' }] },
      { bg: 'scene:angerfang_encampment', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.18]], fx: ['embers'],
        actors: [{ a: 'mob:dragonmaw_grunt', x: 30, y: 0, w: 26 }, { a: 'mob:crimson_whelp', x: 60, y: 6, w: 20, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'North, in Greenfen, the Wyrmchain orcs breed red drakes, and they are paid in the same warm gold.' }, { t: 5, text: 'Every road the coins took ended at Cinderpeak, where the Ledger keeps a vault in the Spire.' }] },
      { bg: 'story:blackrock_mountain', dur: 9, cam: [[0, 0, 1.05], [0, 2, 1.2]], fx: ['embers', 'shake@6'],
        lines: [{ t: 0.5, text: 'The marshal went in to audit the vault.' }, { t: 4.5, text: 'He did not come out.' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Thorne', text: 'The marshal read too many ledgers. Let the mountain keep him.' }, { t: 5.4, who: 'Lady Thorne', text: 'My accounts will show he fled with crown funds. Accounts do not lie, my lord.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'The court says Hale stole from the crown, {name}. The soldiers who rode with him say otherwise.' }, { t: 5, text: 'The road he took runs through places you will soon walk.' }] },
    ] },
    { id: 'ch4', level: 40, title: 'Chapter 4: Cinderpeak Rising', music: 'dungeon', shots: [
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 0, 1.05], [0, 2, 1.2]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Cinderpeak burns day and night. Deep inside, the Slagborn dwarves dig to pay what they owe.' }, { t: 5.2, text: 'Somewhere in their cells, a soldier of Kingsmere is still alive: Marshal Hale.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 2, 1.2], [0, 0, 1.05]], fx: ['embers', 'shake@6'],
        actors: [{ a: 'story:ragnaros', x: 40, y: 0, w: 40, anim: 'breathe', from: { y: -16, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Below them all, in a sea of fire, sleeps Vulcarn, the King Below.' }, { t: 5.2, who: 'Vulcarn', text: 'Let them dig. Every stone they break brings my fire closer to the world above.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:nefarian', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Above them, in the Spire, Lord Kethran Vale keeps the Ledger\'s vault, and the Cinderpeak orcs guard it.' }, { t: 5.2, who: 'Lord Kethran Vale', text: 'A burning mountain is a cheap mine. Let the Emperor dig. Every hall he opens, he opens on credit.' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Thorne', text: 'The Emperor digs, the Regent signs, and the books balance.' }, { t: 5.4, who: 'Lady Thorne', text: 'And the marshal? Let him count the stones of his cell. He will not be the last.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Word travels fast on the roads, {name}: Hale was seen alive, in chains, under the mountain.' }, { t: 5, text: 'Someone will have to go and get him. Not yet. But soon.' }] },
    ] },
    { id: 'ch5', level: 50, title: 'Chapter 5: Balancing the Books', music: 'dungeon', shots: [
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]], fx: ['fadein'],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Thorne', text: 'The Emperor has his golems. Lord Vale has his vault.' }, { t: 5.4, who: 'Lady Thorne', text: 'And Kingsmere has me. The coronation is set, and every page the Regent signs, I wrote first.' }] },
      { bg: 'scene:brd_prison', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:anvilrage_warden', x: 58, y: 2, w: 22 }],
        lines: [{ t: 0.5, text: 'In the cells of Cinderpeak Depths, Marshal Hale counts. Not the days: the coins.' }, { t: 5.2, text: 'He has written down every warm coin that passed through the mountain, and every one leads to a single purse.' }] },
      { bg: 'scene:brd_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.18]], fx: ['embers'],
        actors: [{ a: 'mob:emperor_dagran_thaurissan', x: 40, y: 0, w: 34, from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "The guards took the marshal's notes to the Emperor himself." }, { t: 5.2, who: 'Emperor Grimmark', text: 'Let the human scribble. Nobody leaves my mountain to read it.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:bolvar', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Lord Regent Carrow', text: 'If Hale is alive, I want him home.' }, { t: 5, who: 'Lord Regent Carrow', text: 'And I want to know why my Mistress of Coin called him a thief.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Cinderpeak Depths waits under the mountain, {name}. The marshal is in its cells; his notes are on the Emperor\'s throne.' }, { t: 5.5, text: 'Whatever banner you fly, the Ledger holds your debts too.' }] },
    ] },
    { id: 'ch6', level: 60, title: 'Chapter 6: The Creditor', music: 'dungeon', shots: [
      { bg: 'scene:brd_prison', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]], fx: ['fadein', 'embers'],
        actors: [{ a: 'story:windsor', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'The cell doors of Cinderpeak Depths stand open. Marshal Gideon Hale walks out into the light.' }, { t: 5.2, who: 'Marshal Hale', text: 'Kingsmere. Now. Before the coronation.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:windsor', x: 20, y: 2, w: 30, flip: true, from: { x: 0, o: 0 }, dur: 2 }, { a: 'story:bolvar', x: 62, y: 2, w: 30, anim: 'breathe' }],
        lines: [{ t: 0.5, who: 'Marshal Hale', text: 'My lord Regent, read my notes. Every coin the Ledger lent this crown came out of one purse.' }, { t: 5.5, who: 'Lord Regent Carrow', text: 'Lady Thorne has kept our books for years, Marshal.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.12], [0, 0, 1.02]],
        actors: [{ a: 'story:windsor', x: 16, y: 2, w: 28, flip: true }, { a: 'story:lyveus', x: 56, y: 2, w: 30, anim: 'breathe', from: { x: 80, o: 0 }, dur: 1.8 }],
        lines: [{ t: 0.5, who: 'Marshal Hale', text: 'And I did not come alone. Your court buried this knight five years ago, my lord.' }, { t: 5.2, who: 'Lyveus Cloveus', text: 'I heard them plot in these halls. They burned my home to keep it quiet. I am done being dead.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 0, 1.05], [0, 2, 1.2]],
        actors: [{ a: 'story:lady_prestor', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Lady Thorne', text: 'I deny none of it. Here is the deed, my lord.' }, { t: 5, who: 'Lady Thorne', text: 'The crown\'s debt falls due at the coronation. The kingdom is already sold.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@1', 'embers'],
        actors: [{ a: 'story:onyxia', x: 40, y: 0, w: 46, anim: 'breathe', from: { y: -10, o: 0 }, dur: 1.2 }],
        lines: [{ t: 0.5, text: 'Then the creditor came to collect: Veshmira of the Black Brood, who lends her hoard instead of sleeping on it.' }, { t: 5.5, who: 'Veshmira', text: 'I do not want your little kingdom. I own it. I have come for my collateral.' }] },
      { bg: 'story:stormveil_storm', dur: 11, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        lines: [{ t: 0.5, text: 'Beaten back from Kingsmere, Veshmira flew south over the sea, and Lady Thorne went with her. A storm closed over the water behind them to guard her hoard.' }, { t: 5.5, text: 'Out past the storm, sailors saw land where no land had been for ten thousand years. The storm did not clear.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'The creditor has gone to ground in her lair in Saltmarsh, {name}. While she lives, her storm hides the new isle.' }, { t: 5.5, text: 'Harborwatch and Mudwall are already gathering. Look for her trail in your quest log.' }] },
    ] },
    // plays once Veshmira is dead (after: any of these quests done); her death breaks the storm over the isle
    { id: 'x1', level: 60, title: 'The Drowned Crown', music: 'dungeon', needs: 'tidewatch', after: ['dw_onyxia_a', 'dw_onyxia_h'], shots: [
      { bg: 'story:stormveil_storm', dur: 9, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'When Veshmira fell in her lair, the storm over the sea finally broke.' }, { t: 5, text: 'For the first time, ships could reach the isle it had hidden.' }] },
      { bg: 'story:stormveil_storm', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        lines: [{ t: 0.5, text: "Ten thousand years ago, when the Heartfire burst, the Starborn city of Sael'anor sank beneath the sea." }, { t: 5.5, text: 'Its people should have drowned. Most of them did.' }] },
      { bg: 'scene:citadel_throne', dur: 11, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:aeldran', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "Their prince, Aeldran, made a bargain in the dark: his court would live on beneath the waves." }, { t: 5.5, who: 'Prince Aeldran', text: 'The sea kept us. Now the sea gives us back.' }] },
      { bg: 'scene:citadel_abyss', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@6'],
        actors: [{ a: 'story:nalveshra', x: 40, y: 0, w: 46, anim: 'breathe', from: { y: 20, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: "He made the bargain with Nal'veshra, the Deepmother, a spirit older than the Starborn. She does not give anything back." }, { t: 5.8, who: "Nal'veshra", text: 'Rise, my drowned children. The world above is ours to swallow.' }] },
      { bg: 'scene:brightwater_landing', dur: 9, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        lines: [{ t: 0.5, text: 'Brineholt ships carry the Accord from Gullhaven to the Tidewatch Coast.' }] },
      { bg: 'scene:bloodtide_landing', dur: 9, cam: [[4, 0, 1.12], [-4, 0, 1.12]],
        lines: [{ t: 0.5, text: "Kessari and Reclaimed crews sail from Camp Skarn to the Skullreef Isles." }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'The Stormveil Isle has risen, {name}. Take ship and see for yourself.' }, { t: 5, text: 'Look for "The Drowned Crown" in your quest log.' }] },
    ] },
  ];
  // a chapter with `needs` waits until that zone ships (the expansion prologue)
  CS.CHAPTERS = CS.CHAPTERS.filter((c) => !c.needs || !root.D || (root.D.REGIONS || {})[c.needs]);
  CS.byId = (id) => CS.CHAPTERS.find((c) => c.id === id);
  CS.forInstance = (key) => CS.CHAPTERS.find((c) => c.instance === key || (c.also || []).includes(key));

  // Unlocks are account-wide so the Theater shows everything any character has reached.
  CS.unlocked = function () { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch (e) { return new Set(); } };
  CS.unlock = function (id) { const s = CS.unlocked(); s.add(id); try { localStorage.setItem(STORE, JSON.stringify([...s])); } catch (e) { } };

  // ------------------------------------------------------------ player
  // env: { art(kind,key) -> url, heroUrl, name, zone, startScene, hereScene, setMusic(name|null) }
  CS.play = function (ch, env) {
    if (!ch || !ch.shots || CS.playing) return Promise.resolve();
    CS.unlock(ch.id);
    return new Promise((resolve) => {
      const wrap = document.createElement('div'); wrap.className = 'cs';
      wrap.innerHTML = `<div class="cs-bar"></div><div class="cs-stage"><div class="cs-cam"><img class="cs-bg" alt=""></div><div class="cs-fx"></div><div class="cs-flash"></div><div class="cs-title"></div></div>
        <div class="cs-cap"><b class="cs-who"></b><span class="cs-text"></span><i class="cs-tap">Tap to continue</i></div><button class="cs-skip" type="button">Skip</button>`;
      document.getElementById('app').append(wrap);
      const $ = (s) => wrap.querySelector(s);
      const stage = $('.cs-stage'), cam = $('.cs-cam'), bg = $('.cs-bg'), fx = $('.cs-fx'), flash = $('.cs-flash');
      CS.playing = ch; CS.music = ch.music || null; if (env.setMusic) env.setMusic(CS.music);
      let shotIdx = -1, timers = [], anims = [], skipShot = null, done = false;
      const fill = (t) => t.replace('{name}', env.name).replace('{zone}', env.zone);
      const clear = () => { timers.forEach(clearTimeout); timers = []; anims.forEach((a) => { try { a.finish(); } catch (e) { } }); anims = []; };
      const finish = () => { if (done) return; done = true; clear(); wrap.classList.add('cs-out'); setTimeout(() => wrap.remove(), 450); CS.playing = null; CS.music = null; if (env.setMusic) env.setMusic(null); resolve(); };
      $('.cs-skip').addEventListener('click', (e) => { e.stopPropagation(); finish(); });
      wrap.addEventListener('click', () => { if (skipShot) skipShot(); });
      const titleEl = $('.cs-title'); titleEl.textContent = ch.title; titleEl.classList.add('show');
      setTimeout(() => titleEl.classList.remove('show'), 2600);

      function src(a) {
        const [kind, key] = a.split(':');
        if (kind === 'hero') return env.heroUrl;
        if (kind === 'scene' && key === '@start') return env.art('scene', env.startScene);
        if (kind === 'scene' && key === '@here') return env.art('scene', env.hereScene);
        return env.art(kind, key);
      }
      function typeLine(line) {
        const who = $('.cs-who'), tx = $('.cs-text');
        who.textContent = line.who || ''; who.hidden = !line.who;
        const text = fill(line.text); let i = 0; tx.textContent = '';
        const tick = () => { if (done) return; tx.textContent = text.slice(0, ++i); if (i < text.length) timers.push(setTimeout(tick, 22)); };
        tick();
      }
      function particles(kind) {
        for (let i = 0; i < 26; i++) {
          const p = document.createElement('i'); p.className = 'cs-p ' + kind;
          p.style.left = (Math.random() * 100) + '%'; p.style.animationDelay = (-Math.random() * 4) + 's'; p.style.animationDuration = (3 + Math.random() * 3) + 's';
          fx.append(p);
        }
      }
      function next() {
        clear();
        shotIdx++;
        if (shotIdx >= ch.shots.length) return finish();
        const shot = ch.shots[shotIdx];
        // swap backdrop and actors
        stage.querySelectorAll('.cs-actor').forEach((n) => n.remove());
        fx.innerHTML = '';
        bg.src = src(shot.bg);
        const [c0, c1] = shot.cam || [[0, 0, 1], [0, 0, 1]];
        anims.push(cam.animate([{ transform: `translate(${c0[0]}%, ${c0[1]}%) scale(${c0[2]})` }, { transform: `translate(${c1[0]}%, ${c1[1]}%) scale(${c1[2]})` }], { duration: shot.dur * 1000, easing: 'ease-in-out', fill: 'forwards' }));
        for (const ac of (shot.actors || [])) {
          const el = document.createElement('img'); el.className = 'cs-actor' + (ac.anim ? ' ' + ac.anim : ''); el.alt = '';
          el.src = src(ac.a);
          el.style.left = ac.x + '%'; el.style.bottom = (ac.y || 0) + '%'; el.style.width = ac.w + '%';
          const sx = ac.flip ? -1 : 1;
          el.style.transform = `scaleX(${sx})`;
          cam.append(el);
          if (ac.from) {
            const f = ac.from;
            const tf = (x, y) => `translate(${x}%, ${y}%) scaleX(${sx})`;
            const dx = f.x != null ? (f.x - ac.x) * (100 / ac.w) : 0, dy = f.y != null ? -f.y * (100 / ac.w) : 0;
            anims.push(el.animate([{ transform: tf(dx, dy), opacity: f.o != null ? f.o : 1 }, { transform: tf(0, 0), opacity: 1 }], { duration: (ac.dur || 1.6) * 1000, delay: (ac.delay || 0) * 1000, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }));
          }
        }
        for (const f of (shot.fx || [])) {
          const [name, at] = f.split('@'); const t = at ? +at * 1000 : 0;
          if (name === 'fadein') anims.push(stage.animate([{ filter: 'brightness(0)' }, { filter: 'brightness(1)' }], { duration: 1200, easing: 'ease-out' }));
          if (name === 'fadeout') timers.push(setTimeout(() => anims.push(stage.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(0)' }], { duration: 1400, fill: 'forwards' })), shot.dur * 1000 - 1400));
          if (name === 'flash') timers.push(setTimeout(() => anims.push(flash.animate([{ opacity: 0 }, { opacity: 0.95, offset: 0.08 }, { opacity: 0 }], { duration: 900 })), t));
          if (name === 'shake') timers.push(setTimeout(() => anims.push(stage.animate([0, -6, 5, -4, 3, -2, 0].map((x, i) => ({ transform: `translate(${x}px, ${i % 2 ? 2 : -2}px)` })), { duration: 700 })), t || 600));
          if (name === 'embers' || name === 'snow') particles(name);
        }
        for (const line of (shot.lines || [])) timers.push(setTimeout(() => typeLine(line), line.t * 1000));
        if (!(shot.lines || []).length) { $('.cs-who').hidden = true; $('.cs-text').textContent = ''; }
        const end = setTimeout(next, shot.dur * 1000); timers.push(end);
        // a tap jumps to the end of the shot (first tap finishes the typing)
        skipShot = () => { next(); };
      }
      next();
    });
  };

  root.CS = CS;
})(typeof window !== 'undefined' ? window : globalThis);
