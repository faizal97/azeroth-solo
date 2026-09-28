// Azeroth Solo — story cutscenes: a tiny in-page film player plus the chapter scripts.
// Shots use our own art (ART.story scenes/actors, ART.scene, ART.mob, the player's hero).
(function (root) {
  const CS = { playing: null, music: null };
  const STORE = 'azsolo.story';

  // ------------------------------------------------------------ chapters
  // lines: {t: seconds into the shot, who: speaker or '' for narrator, text}. {name}/{zone} fill in per player.
  CS.CHAPTERS = [
    { id: 'intro', level: 1, title: 'Shadows over Azeroth', music: 'elwynn', shots: [
      { bg: 'story:azeroth_dawn', dur: 9, cam: [[0, 0, 1.12], [0, -2, 1.0]], fx: ['fadein'],
        lines: [{ t: 0.6, text: 'Four years have passed since the Burning Legion was driven from Azeroth.' }, { t: 4.8, text: 'The kingdoms of the Alliance rebuild, and a fragile peace holds.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[-3, 0, 1.08], [3, 0, 1.08]],
        actors: [{ a: 'story:king_varian_portrait', x: 50, y: 42, w: 17 }, { a: 'story:bolvar', x: 16, y: 2, w: 34, flip: true, from: { x: -8, o: 0 } }],
        lines: [{ t: 0.5, text: 'But in Stormwind, King Varian Wrynn has vanished on a voyage to Theramore.' }, { t: 5.2, text: 'Highlord Bolvar Fordragon rules in his name, and the boy Anduin waits for a father who does not return.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[3, 0, 1.08], [0, 0, 1.2]],
        actors: [{ a: 'story:bolvar', x: 14, y: 2, w: 34, flip: true }, { a: 'story:lady_prestor', x: 62, y: 2, w: 34, from: { x: 95, o: 0 }, delay: 0.3, dur: 2.2 }],
        lines: [{ t: 0.8, text: 'More and more, the court listens to a new adviser: Lady Katrana Prestor.' }, { t: 5, who: 'Lady Prestor', text: 'Leave matters of state to me, Highlord. The nobles need a steady hand.' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[4, 2, 1.15], [-2, 0, 1.05]], fx: ['fadein'],
        actors: [{ a: 'story:defias_crowd', x: 8, y: 0, w: 46, flip: true, from: { x: -10, o: 0 } }, { a: 'story:vancleef_story', x: 58, y: 0, w: 40, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'In the west, the stonemasons who rebuilt Stormwind were cheated of their pay.' }, { t: 5, who: 'Edwin VanCleef', text: 'They took our wages and called us thieves. So be it. The Brotherhood will take it all back.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['embers', 'shake'],
        actors: [{ a: 'story:ragnaros', x: 4, y: 0, w: 50, flip: true, from: { y: -30, o: 0 }, dur: 2.5 }, { a: 'story:nefarian', x: 48, y: 8, w: 52, from: { x: 110 }, delay: 1.2, dur: 2.5 }],
        lines: [{ t: 0.8, text: 'Deep beneath Blackrock Mountain, the Firelord Ragnaros and the black dragon Nefarian fight for the mountain\'s heart.' }] },
      { bg: 'story:shadow_court', dur: 10, cam: [[0, 0, 1.0], [0, -3, 1.18]],
        actors: [{ a: 'story:prestor_shadow', x: 25, y: 0, w: 50, from: { o: 0 }, delay: 1.2, dur: 2.5 }],
        fx: ['flash@3.8'],
        lines: [{ t: 0.4, text: 'And in the shadows of Stormwind\'s court, someone is pulling every string.' }, { t: 5.2, who: 'Lady Prestor', text: 'Let the little kingdoms squabble. Soon it will all burn.' }] },
      { bg: 'scene:@start', dur: 9, cam: [[0, 0, 1.15], [0, 0, 1.0]], fx: ['fadein', 'fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, from: { x: 20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, text: 'Far from the court, in {zone}, a new hero takes up arms.' }, { t: 4.8, text: 'Your story begins here, {name}.' }] },
    ] },
    { id: 'ch1', level: 10, title: 'Chapter 1: The Brotherhood Stirs', music: 'dungeon', shots: [
      { bg: 'story:westfall', dur: 10, cam: [[-4, 0, 1.1], [4, 0, 1.1]], fx: ['fadein', 'embers'],
        actors: [{ a: 'story:defias_crowd', x: 50, y: 0, w: 46, from: { x: 80, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Westfall was once the breadbasket of Stormwind. Now its farms burn.' }, { t: 5, text: 'The Defias Brotherhood rules the fields, and the farmers have nowhere left to run.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 0, 1.05], [0, 0, 1.18]],
        actors: [{ a: 'story:bolvar', x: 12, y: 2, w: 34, flip: true }, { a: 'story:lady_prestor', x: 60, y: 2, w: 34 }],
        lines: [{ t: 0.5, who: 'Highlord Bolvar', text: 'The farmers of Westfall beg for soldiers, my lady.' }, { t: 4.4, who: 'Lady Prestor', text: 'The army is needed elsewhere, Highlord. Westfall can look after itself.' }, { t: 8.2, text: 'Not one soldier rides west.' }] },
      { bg: 'scene:deadmines_ship', dur: 10, cam: [[0, 3, 1.2], [0, 0, 1.02]], fx: ['shake@6'],
        actors: [{ a: 'story:vancleef_story', x: 40, y: 0, w: 40, anim: 'breathe' }],
        lines: [{ t: 0.5, who: 'Edwin VanCleef', text: 'Let the nobles look away. By the time Stormwind looks west, our ship will sail.' }, { t: 5.5, who: 'Edwin VanCleef', text: 'And then the whole city will pay what it owes us.' }] },
      { bg: 'scene:@here', dur: 9, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Word of the Brotherhood has reached you, {name}.' }, { t: 4.4, text: 'The People\'s Militia gathers at Sentinel Hill. The road west is waiting.' }] },
    ] },
    // ---- instance intros: play once, the first time any character enters
    { id: 'legend_lyveus', legend: 'lyveus', title: 'Lyveus Cloveus: The Exiled Knight', music: 'dungeon', shots: [
      { bg: 'story:azeroth_dawn', dur: 11, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein', 'embers', 'shake@6'],
        actors: [{ a: 'story:deathwing', x: 36, y: 0, w: 60, anim: 'breathe', from: { y: -16, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: 'Twenty-one years ago, the black dragon Deathwing tore the world in the Second War. The elves of the Arathi pines call him Astaroth, the Black Ruin.' }, { t: 6, text: 'He was driven off. He was never destroyed.' }] },
      { bg: 'scene:silverleaf_lodge', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:lyveus', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'In Silverleaf Lodge, a high elf village in those pines, young Lyveus Cloveus learned the blade, the bow, and the old grove oath of his people.' }] },
      { bg: 'story:caravan_road', dur: 11, cam: [[0, 0, 1.05], [0, -2, 1.2]], fx: ['shake@4'],
        actors: [{ a: 'story:lyveus', x: 40, y: 2, w: 32, anim: 'breathe', from: { x: 20, o: 0 }, dur: 1.2 }],
        lines: [{ t: 0.5, text: 'Seven years ago, raiders struck a Stormwind caravan near the forest. Lyveus ran to defend it, and the Light burst out of him.' }, { t: 6, text: 'The crown took him into its guard: a fine sword, and a sign that the old alliance of men and elves still held.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:lyveus', x: 18, y: 2, w: 30, flip: true }, { a: 'story:vyn', x: 58, y: 2, w: 30, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'In Stormwind he met Vyn. The two rose through the ranks together, until they were chosen to guard the nobles of the court.' }, { t: 5.5, who: 'Vyn', text: 'An elf and a farm boy, guarding lords. Who would have guessed?' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Five years ago, in a room he was never meant to enter, he heard a circle of nobles plot to feed the kingdom\'s soldiers to a dark master.' }, { t: 6, who: 'A voice in the dark', text: 'No one will miss a few soldiers. Or one elf.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 0, 1.12], [0, 2, 1.02]],
        actors: [{ a: 'story:vyn', x: 40, y: 2, w: 32, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'They condemned him. Vyn faked his death and got him out of the city.' }, { t: 5, who: 'Vyn', text: 'Go home, Lyv. Be dead for a while. I\'ll keep my ears open.' }] },
      { bg: 'story:silverleaf_burning', dur: 11, cam: [[-3, 0, 1.12], [3, 0, 1.12]], fx: ['embers'],
        lines: [{ t: 0.5, text: 'For three years he lived quietly at home. Then the cabal learned the truth.' }, { t: 5.5, text: 'Silverleaf Lodge burned, and his kin with it. The world was told it was Syndicate bandits. Lyveus knew better.' }] },
      { bg: 'scene:silverleaf_lodge', dur: 11, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'story:lyveus_hooded', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'He alone survived. Now he walks the roads under a hood, and the black dragonflight stirs again.' }, { t: 6, who: 'Lyveus Cloveus', text: 'They made me a ghost. Ghosts keep watch.' }] },
    ] },
    { id: 'dm_intro', instance: 'deadmines', title: 'The Deadmines', music: 'dungeon', shots: [
      { bg: 'story:westfall', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Moonbrook was once a quiet mining town in Westfall. Now it stands empty and burned.' }, { t: 4.8, text: 'Beneath its ruins lies an old goldmine the Defias call home.' }] },
      { bg: 'scene:deadmines_mine', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:defias_miner', x: 58, y: 2, w: 24 }, { a: 'mob:goblin_engineer', x: 30, y: 2, w: 20, from: { x: 10, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Defias miners dig day and night. Goblin engineers, paid in stolen gold, build machines in the dark.' }, { t: 5.5, who: 'Goblin Engineer', text: 'Time is money, friend! Keep those carts moving!' }] },
      { bg: 'scene:deadmines_mine', dur: 8, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['shake@2'],
        actors: [{ a: 'mob:rhahkzor', x: 40, y: 0, w: 34, from: { x: 70, o: 0 }, dur: 1.8 }],
        lines: [{ t: 0.6, text: 'Rhahk\'Zor, VanCleef\'s ogre foreman, guards the first gate.' }, { t: 4.2, who: "Rhahk'Zor", text: 'VanCleef pay big for your heads!' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.2]],
        actors: [{ a: 'story:defias_crowd', x: 6, y: 0, w: 44, flip: true }, { a: 'story:vancleef_story', x: 58, y: 0, w: 38, anim: 'breathe', from: { o: 0 }, delay: 2, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the end of the mine, in a hidden cove, the Brotherhood builds its ship: the Juggernaut.' }, { t: 5.8, who: 'Edwin VanCleef', text: 'None may challenge the Brotherhood!' }], fx: ['fadeout'] },
    ] },
    { id: 'rfc_intro', instance: 'ragefire', title: 'Ragefire Chasm', music: 'dungeon', shots: [
      { bg: 'scene:orgrimmar', dur: 9, cam: [[0, 0, 1.12], [0, 3, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Orgrimmar, capital of the Horde, was built by Thrall on the red earth of Durotar.' }, { t: 4.8, text: 'But beneath its streets, something festers.' }] },
      { bg: 'scene:ragefire_chasm', dur: 10, cam: [[-4, 2, 1.18], [3, 0, 1.06]], fx: ['embers'],
        actors: [{ a: 'mob:searing_blade_cultist', x: 56, y: 2, w: 24 }, { a: 'mob:ragefire_trogg', x: 30, y: 2, w: 20, from: { x: 10, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Ragefire Chasm is a maze of volcanic caves, crawling with troggs.' }, { t: 5, text: 'The Searing Blade, a cult of demon worshippers, hides here and plots against the Warchief.' }] },
      { bg: 'scene:ragefire_chasm', dur: 9, cam: [[0, 4, 1.25], [0, 0, 1.05]], fx: ['shake@1.5', 'embers'],
        actors: [{ a: 'mob:taragaman', x: 36, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.8, who: 'Taragaman the Hungerer', text: 'They call me the Hungerer. Soon you will see why!' }] },
      { bg: 'scene:ragefire_chasm', dur: 9, cam: [[2, 0, 1.1], [-2, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'mob:jergosh', x: 20, y: 2, w: 26 }, { a: 'mob:bazzalan', x: 56, y: 2, w: 26 }],
        lines: [{ t: 0.5, text: 'Jergosh the Invoker and the satyr Bazzalan lead the cult from the deepest caves.' }, { t: 4.8, text: 'The Warchief\'s order is clear: root them out.' }] },
    ] },
    { id: 'wc_intro', instance: 'wailing_caverns', title: 'Wailing Caverns', music: 'dungeon', shots: [
      { bg: 'scene:lushwater_oasis', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Beneath the oases of the Barrens lies a maze of caves where the wind moans like a living thing.' }, { t: 5, text: 'The tauren call it the Wailing Caverns.' }] },
      { bg: 'scene:wailing_caverns', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:druid_of_the_fang', x: 56, y: 2, w: 24 }, { a: 'mob:deviate_ravager', x: 28, y: 2, w: 22, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The night elf druid Naralex came here to heal the dying land. He fell asleep, and his dream became a nightmare.' }, { t: 5.5, text: 'His disciples, the Druids of the Fang, turned the caverns and every beast in them into something twisted.' }] },
      { bg: 'scene:wailing_caverns', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:lady_anacondra', x: 40, y: 0, w: 32, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Lady Anacondra', text: 'None can stand against the Serpent Lords!' }, { t: 4.4, text: 'Four Fang leaders guard the way to the dreamer.' }] },
      { bg: 'scene:wailing_caverns_deep', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:mutanus', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'And in the deepest grotto, something feeds on Naralex\'s nightmare.' }, { t: 5, who: 'Mutanus the Devourer', text: 'Naralex dreams... and I feed.' }] },
    ] },
    { id: 'stockade_intro', instance: 'stockade', title: 'The Stockade', music: 'dungeon', shots: [
      { bg: 'scene:stormwind', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Beneath the canals of Stormwind lies the Stockade, where the kingdom keeps the worst of its prisoners.' }, { t: 5, text: 'Tonight, the prisoners hold the keys.' }] },
      { bg: 'scene:the_stockade', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:defias_insurgent', x: 56, y: 2, w: 22 }, { a: 'mob:defias_convict', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Someone smuggled blades past the guards. The cell doors opened all at once.' }, { t: 5.5, text: 'Orc butchers, dwarf traitors and Defias thieves now run the cell blocks.' }] },
      { bg: 'scene:the_stockade', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:targorr', x: 40, y: 0, w: 30, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Targorr the Dread', text: 'Free at last! And you will be the first to die!' }, { t: 4.4, text: 'The wardens hold the gate. Nobody else will go in.' }] },
      { bg: 'scene:stockade_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:bazil_thredd', x: 40, y: 0, w: 32, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the bottom of it all waits Bazil Thredd, the Defias who planned the riot.' }, { t: 5, who: 'Bazil Thredd', text: 'VanCleef will have your head for this!' }] },
    ] },
    { id: 'sfk_intro', instance: 'shadowfang', title: 'Shadowfang Keep', music: 'dungeon', shots: [
      { bg: 'scene:pyrewood_village', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'When the Scourge came to Lordaeron, the archmage Arugal tried to fight it with a curse of his own.' }, { t: 5, text: 'He called wolves from another world, and made worgen of the people of Silverpine.' }] },
      { bg: 'scene:shadowfang_courtyard', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:shadowfang_moonwalker', x: 56, y: 2, w: 22 }, { a: 'mob:haunted_servitor', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The worgen turned on everyone. Arugal went mad and took Shadowfang Keep for himself.' }, { t: 5.5, text: 'The baron who owned it still walks its halls, dead and unable to leave.' }] },
      { bg: 'scene:shadowfang_hall', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:fenrus', x: 40, y: 0, w: 32, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, text: 'His wolf, Fenrus, guards the stairs to the tower.' }, { t: 4.4, text: 'Every worgen in Silverpine answers to the man at the top.' }] },
      { bg: 'scene:shadowfang_hall', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:arugal', x: 40, y: 0, w: 32, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Archmage Arugal waits in his tower.' }, { t: 5, who: 'Archmage Arugal', text: 'You, too, shall serve!' }] },
    ] },
    { id: 'bfd_intro', instance: 'blackfathom', title: 'Blackfathom Deeps', music: 'dungeon', shots: [
      { bg: 'scene:the_zoram_strand', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Long ago the night elves built a temple to Elune on the coast of Ashenvale.' }, { t: 5, text: 'When the Well of Eternity shattered, the sea swallowed it.' }] },
      { bg: 'scene:blackfathom_deeps', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:blackfathom_myrmidon', x: 56, y: 2, w: 22 }, { a: 'mob:aku_mai_snapjaw', x: 28, y: 2, w: 22, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Now naga swim its flooded halls, and something older stirs below.' }, { t: 5.5, text: 'The Twilight\'s Hammer cult has come to wake it.' }] },
      { bg: 'scene:blackfathom_depths', dur: 9, cam: [[0, 3, 1.22], [0, 0, 1.05]],
        actors: [{ a: 'mob:twilight_lord_kelris', x: 40, y: 0, w: 30, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.6, who: 'Twilight Lord Kelris', text: 'Who dares disturb my meditation?' }, { t: 4.4, text: 'Kelris, a night elf who betrayed his people, leads the cult.' }] },
      { bg: 'scene:blackfathom_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:aku_mai', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "In the black pool at the bottom, the cult feeds their god: Aku'mai." }, { t: 5, text: 'Both the Alliance and the Horde send heroes down. Few come back.' }] },
    ] },
    { id: 'gnomer_intro', instance: 'gnomeregan', title: 'Gnomeregan', music: 'dungeon', shots: [
      { bg: 'scene:gnomeregan_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Gnomeregan was the wonder of the gnomes: a city of gears and steam beneath the snows of Dun Morogh.' }, { t: 5, text: 'Then the troggs came up from the deep.' }] },
      { bg: 'scene:gnomeregan_halls', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:irradiated_pillager', x: 56, y: 2, w: 22 }, { a: 'mob:leper_gnome', x: 28, y: 2, w: 18, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'To stop them, the gnomes flooded their own city with radiation.' }, { t: 5.5, text: 'It killed thousands. The troggs survived. So did the gnomes who stayed behind, sick and changed.' }] },
      { bg: 'scene:gnomeregan_core', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:mekgineer_thermaplugg', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The adviser who told them to do it, Mekgineer Thermaplugg, now rules the ruins.' }, { t: 5, who: 'Mekgineer Thermaplugg', text: 'My machines are the future! They will destroy you!' }] },
    ] },
    { id: 'rfk_intro', instance: 'razorfen_kraul', title: 'Razorfen Kraul', music: 'dungeon', shots: [
      { bg: 'scene:razorfen_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Ten thousand years ago the demigod Agamaggan fell in the south of the Barrens.' }, { t: 5, text: 'Great thorns grew from his blood. The quilboar made them their home.' }] },
      { bg: 'scene:razorfen_kraul', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:razorfen_quilguard', x: 56, y: 2, w: 22 }, { a: 'mob:death_head_cultist', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Inside the Kraul, a cult of the dead has taken root among the tribe.' }, { t: 5.5, text: 'Its masks and skulls whisper of a power older than the thorns.' }] },
      { bg: 'scene:razorfen_depths', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:charlga_razorflank', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their matriarch, Charlga Razorflank, waits on the thorn throne.' }, { t: 5, who: 'Charlga Razorflank', text: 'The thorns will be your grave!' }] },
    ] },
    { id: 'sm_intro', instance: 'sm_library', also: ['sm_cathedral'], title: 'The Scarlet Monastery', music: 'dungeon', shots: [
      { bg: 'scene:scarlet_monastery_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'When the plague took Lordaeron, a few survivors swore to burn out every trace of undeath.' }, { t: 5, text: 'They called themselves the Scarlet Crusade.' }] },
      { bg: 'scene:sm_library', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:scarlet_monk', x: 56, y: 2, w: 22 }, { a: 'mob:scarlet_chaplain', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their faith turned to madness. Now they kill anyone they suspect: the living and the dead alike.' }, { t: 5.5, text: 'Their monastery in Tirisfal holds their library, their armory and their cathedral.' }] },
      { bg: 'scene:sm_cathedral', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:high_inquisitor_whitemane', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'In the cathedral, Commander Mograine and High Inquisitor Whitemane lead them.' }, { t: 5, text: 'The Horde and the Alliance agree on almost nothing. They agree on this.' }] },
    ] },
    { id: 'zf_intro', instance: 'zul_farrak', title: "Zul'Farrak", music: 'dungeon', shots: [
      { bg: 'scene:zul_farrak_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'In the burning sands of Tanaris rises the city of the Sandfury trolls.' }, { t: 5, text: 'They raid every caravan on the road to Gadgetzan.' }] },
      { bg: 'scene:zf_courtyard', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:sandfury_blood_drinker', x: 56, y: 2, w: 22 }, { a: 'mob:zul_farrak_zombie', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Their witch doctors raise the dead, and their priests keep a hydra in the sacred pool.' }, { t: 5.5, text: 'Goblin mercenaries who came to rob the city now fight for their lives on the pyramid stairs.' }] },
      { bg: 'scene:zf_temple', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:chief_ukorz_sandscalp', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'At the top of the temple waits their chief, Ukorz Sandscalp.' }, { t: 5, who: 'Chief Ukorz Sandscalp', text: "Who dares enter the Chief's city?" }] },
    ] },
    { id: 'md_intro', instance: 'maraudon', title: 'Maraudon', music: 'dungeon', shots: [
      { bg: 'scene:maraudon_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'The centaur say Maraudon is where their people were born, from the demigod Zaetar and the earth princess Theradras.' }, { t: 5, text: 'Now the caverns poison all of Desolace.' }] },
      { bg: 'scene:maraudon_caverns', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:putridus_trickster', x: 56, y: 2, w: 22 }, { a: 'mob:constrictor_vine', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Satyrs and twisted vines choke the purple caves. Celebras, a keeper of the grove, lies cursed in the falls.' }, { t: 5.5, text: 'Deeper still, the earth itself moves.' }] },
      { bg: 'scene:maraudon_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:princess_theradras', x: 40, y: 0, w: 40, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'On her stone throne sits Princess Theradras.' }, { t: 5, who: 'Princess Theradras', text: 'You will be buried in my caverns!' }] },
    ] },
    { id: 'brd_intro', instance: 'blackrock_depths', title: 'Blackrock Depths', music: 'dungeon', shots: [
      { bg: 'scene:blackrock_mountain', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Two hundred years ago, the Dark Iron sorcerer-thane Thaurissan called a spirit of fire to win a war.' }, { t: 5.2, text: 'He called Ragnaros. The mountain has burned ever since.' }] },
      { bg: 'scene:brd_city', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:shadowforge_flame_keeper', x: 56, y: 2, w: 22 }, { a: 'mob:anvilrage_warden', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'His people live on in the city of Shadowforge, slaves to the Firelord.' }, { t: 5.5, text: 'Prisons, forges, golem workshops, a whole kingdom under the stone.' }] },
      { bg: 'scene:brd_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:emperor_dagran_thaurissan', x: 40, y: 0, w: 36, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'His heir, Emperor Dagran Thaurissan, rules from the Imperial Seat.' }, { t: 5, who: 'Emperor Dagran Thaurissan', text: 'Come to aid the Throne!' }] },
    ] },
    { id: 'scholo_intro', instance: 'scholomance', title: 'Scholomance', music: 'dungeon', shots: [
      { bg: 'scene:caer_darrow', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'Caer Darrow was the seat of the Barov family. They sold it to the Cult of the Damned for a promise of eternal life.' }, { t: 5.5, text: 'The Cult kept its word, after a fashion.' }] },
      { bg: 'scene:scholo_hall', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:scholomance_necromancer', x: 56, y: 2, w: 22 }, { a: 'mob:scholomance_acolyte', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "In the crypts beneath the castle, the Cult runs a school. Its lessons are necromancy." }, { t: 5.5, text: "Every necromancer who serves the Lich King in these lands learned here." }] },
      { bg: 'scene:scholo_study', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['fadeout'],
        actors: [{ a: 'mob:darkmaster_gandling', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Its headmaster, Darkmaster Gandling, never lets a student leave.' }, { t: 5, who: 'Darkmaster Gandling', text: 'School is in session!' }] },
    ] },
    { id: 'strat_intro', instance: 'stratholme', title: 'Stratholme', music: 'dungeon', shots: [
      { bg: 'scene:stratholme_gate', dur: 10, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'When the plague reached Stratholme, Prince Arthas put the whole city to the sword before it could turn.' }, { t: 5.5, text: 'It turned anyway. It has been burning ever since.' }] },
      { bg: 'scene:strat_bastion', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:crimson_guardsman', x: 56, y: 2, w: 22 }, { a: 'mob:crimson_conjuror', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The Scarlet Crusade holds the living side of the city. Its Grand Crusader is not what he seems.' }, { t: 5.5, text: 'The dead hold the rest.' }] },
      { bg: 'scene:strat_ziggurat', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:baron_rivendare', x: 40, y: 0, w: 34, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Among the ziggurats rules Baron Rivendare, death knight of the Scourge.' }, { t: 5, who: 'Baron Rivendare', text: 'Intruders! More pawns for my master.' }] },
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
        lines: [{ t: 0.5, text: "The Wavebreaker trolls once served Shal'zua, a loa of the sea. When the isle sank, they sank with it." }, { t: 5, text: 'They are praying again.' }] },
      { bg: 'scene:shalzua_shrine', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:wavebreaker_zealot', x: 56, y: 2, w: 22 }, { a: 'mob:wavebreaker_spiritcaller', x: 28, y: 2, w: 20, from: { x: 8, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Hexmother Oyala raised the drowned tribe. High Priest Zan\'jin feeds the altar.' }, { t: 5.5, text: 'But the thing they pray to does not answer like a loa.' }] },
      { bg: 'scene:shalzua_sanctum', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:avatar_of_shalzua', x: 40, y: 0, w: 38, from: { y: -20, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "Shal'zua's avatar rises from the altar, wearing the loa's face. Something else looks out through its eyes." }, { t: 5, who: "Avatar of Shal'zua", text: 'I... was a god...' }] },
    ] },
    { id: 'tidecrown_intro', instance: 'tidecrown_citadel', title: 'The Tidecrown Citadel', music: 'dungeon', shots: [
      { bg: 'scene:tidecrown_gate', dur: 9, cam: [[0, 0, 1.15], [0, 2, 1.02]], fx: ['fadein'],
        lines: [{ t: 0.5, text: "At the end of the causeway stands the Tidecrown Citadel, Prince Aeldran's seat. The Alliance and the Horde arrive at its gate on the same morning." }, { t: 5.5, text: 'For once, neither side draws on the other.' }] },
      { bg: 'scene:citadel_throne', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:prince_aeldran', x: 44, y: 0, w: 34, from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'The prince waits on his coral throne, with his drowned court around him.' }, { t: 5, who: 'Prince Aeldran', text: 'Ten thousand years I waited. You will not take the surface from me.' }] },
      { bg: 'scene:citadel_abyss', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@5', 'fadeout'],
        actors: [{ a: 'mob:nalveshra', x: 40, y: 0, w: 42, from: { y: 20, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: 'Below the throne, the Deepmother waits in the dark.' }, { t: 5, who: "Nal'veshra", text: 'Little lights. I will swallow you as I swallowed the loa.' }] },
    ] },
    { id: 'ch2', level: 20, title: 'Chapter 2: The Stonemasons\' Revenge', music: 'dungeon', shots: [
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein'],
        lines: [{ t: 0.5, text: 'After the Second War, Stormwind lay in ruins. The Stonemasons\' Guild rebuilt it, stone by stone.' }, { t: 5.2, text: 'When the last tower stood, the nobles refused to pay what they owed.' }] },
      { bg: 'scene:deadmines_ship', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.2]], fx: ['embers'],
        actors: [{ a: 'story:vancleef_story', x: 44, y: 0, w: 40, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Edwin VanCleef', text: 'They called us rabble. So we became rabble with swords.' }, { t: 5.2, who: 'Edwin VanCleef', text: 'Every stone of that city is ours. We will take back what we built.' }] },
      { bg: 'scene:moonbrook', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'story:defias_crowd', x: 48, y: 0, w: 46, from: { x: 80, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'From the ruins of Moonbrook, the Brotherhood spread across Westfall.' }, { t: 5, text: 'But stolen gold alone could not build a warship. Someone else paid for the Juggernaut.' }] },
      { bg: 'story:shadow_court', dur: 12, cam: [[0, 0, 1.05], [0, 2, 1.22]], fx: ['shake@9'],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Prestor', text: 'Let the stonemasons and the farmers tear each other apart.' }, { t: 5, who: 'Lady Prestor', text: 'A kingdom that bleeds at home cannot see what gathers in the mountains.' }, { t: 9.2, text: 'Behind the lady\'s smile, something older is watching.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Rumours reach every city, {name}: someone in Stormwind\'s court feeds the chaos.' }, { t: 5, text: 'The Deadmines holds the Brotherhood\'s answer. Horde or Alliance, the shadow will use whatever breaks.' }] },
    ] },
    { id: 'ch3', level: 30, title: 'Chapter 3: The Marshal\'s Road', music: 'dungeon', shots: [
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein'],
        actors: [{ a: 'story:bolvar', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'Reports reached Stormwind Keep: black dragon whelps in Redridge, Blackrock orcs at Stonewatch.' }, { t: 5.2, who: 'Highlord Bolvar', text: 'Black dragons, this close to the city? Send Marshal Windsor.' }] },
      { bg: 'scene:galardell_valley', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        actors: [{ a: 'mob:black_dragon_whelp', x: 52, y: 18, w: 26, anim: 'breathe', from: { x: 90, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Marshal Reginald Windsor rode east with his best soldiers.' }, { t: 5, text: 'In Galardell Valley he found the whelps, and the tracks of something much larger.' }] },
      { bg: 'scene:angerfang_encampment', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.18]], fx: ['embers'],
        actors: [{ a: 'mob:dragonmaw_grunt', x: 30, y: 0, w: 26 }, { a: 'mob:crimson_whelp', x: 60, y: 6, w: 20, from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'North, in the Wetlands, the Dragonmaw orcs keep red dragons in chains below Grim Batol.' }, { t: 5, text: 'Windsor learned who had sold the orcs those chains. The trail led south, to Blackrock Mountain.' }] },
      { bg: 'story:blackrock_mountain', dur: 9, cam: [[0, 0, 1.05], [0, 2, 1.2]], fx: ['embers', 'shake@6'],
        lines: [{ t: 0.5, text: 'The marshal went into the mountain.' }, { t: 4.5, text: 'He did not come out.' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Prestor', text: 'The marshal asked too many questions. Let the mountain keep him.' }, { t: 5.4, who: 'Lady Prestor', text: 'Tell the court he deserted. Grieving soldiers believe anything.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'The court says Windsor deserted, {name}. The soldiers who rode with him say otherwise.' }, { t: 5, text: 'The road he took runs through places you will soon walk.' }] },
    ] },
    { id: 'ch4', level: 40, title: 'Chapter 4: Blackrock Rising', music: 'dungeon', shots: [
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 0, 1.05], [0, 2, 1.2]], fx: ['fadein', 'embers'],
        lines: [{ t: 0.5, text: 'Blackrock Mountain burns day and night. Deep inside, the Dark Iron dwarves dig for their master.' }, { t: 5.2, text: 'Somewhere in their prisons, a soldier of Stormwind is still alive: Marshal Windsor.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[0, 2, 1.2], [0, 0, 1.05]], fx: ['embers', 'shake@6'],
        actors: [{ a: 'story:ragnaros', x: 40, y: 0, w: 40, anim: 'breathe', from: { y: -16, o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Below them all, in a sea of fire, sleeps the Firelord Ragnaros.' }, { t: 5.2, who: 'Ragnaros', text: 'Let them dig. Every stone they break brings my fire closer to the world above.' }] },
      { bg: 'story:blackrock_mountain', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:nefarian', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: 'Above them, in the spire, the orcs of the Blackrock clan serve a new lord: Victor Nefarius.' }, { t: 5.2, who: 'Lord Victor Nefarius', text: 'Let the dwarves and their Firelord fight for the depths. The spire, and the world, are mine.' }] },
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Prestor', text: 'My brother has his mountain. I have a court full of fools.' }, { t: 5.4, who: 'Lady Prestor', text: 'And the marshal? Let him rot in the Dark Iron cells. He will not be the last.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Word travels fast on the roads, {name}: Windsor was seen alive, in chains, under the mountain.' }, { t: 5, text: 'Someone will have to go and get him. Not yet. But soon.' }] },
    ] },
    { id: 'ch5', level: 50, title: 'Chapter 5: The Masquerade', music: 'dungeon', shots: [
      { bg: 'story:shadow_court', dur: 11, cam: [[0, 0, 1.05], [0, 2, 1.22]], fx: ['fadein'],
        actors: [{ a: 'story:prestor_shadow', x: 40, y: 2, w: 36, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.6, who: 'Lady Prestor', text: 'The Emperor has his golems. My brother has his orcs.' }, { t: 5.4, who: 'Lady Prestor', text: 'And Stormwind has me. Every order the court signs, I wrote first.' }] },
      { bg: 'scene:brd_prison', dur: 10, cam: [[-4, 0, 1.12], [4, 0, 1.12]], fx: ['embers'],
        actors: [{ a: 'mob:anvilrage_warden', x: 58, y: 2, w: 22 }],
        lines: [{ t: 0.5, text: 'In the detention block of Blackrock Depths, Marshal Windsor counts the days.' }, { t: 5.2, text: 'He has seen who comes and goes from the mountain, and he has written it all down.' }] },
      { bg: 'scene:brd_throne', dur: 10, cam: [[0, 0, 1.0], [0, -2, 1.18]], fx: ['embers'],
        actors: [{ a: 'mob:emperor_dagran_thaurissan', x: 40, y: 0, w: 34, from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "The guards took the marshal's notes to the Emperor himself." }, { t: 5.2, who: 'Emperor Dagran Thaurissan', text: 'Let the human scribble. Nobody leaves my mountain to read it.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:bolvar', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Highlord Bolvar', text: 'If Windsor is alive, I want him home.' }, { t: 5, who: 'Highlord Bolvar', text: 'And I want to know who sent him to that mountain to die.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'Blackrock Depths waits under the mountain, {name}. The marshal is in its cells; his notes are on the Emperor\'s throne.' }, { t: 5.5, text: 'Whatever banner you fly, breaking the Dark Iron breaks her plans too.' }] },
    ] },
    { id: 'ch6', level: 60, title: 'Chapter 6: The Brood Mother', music: 'dungeon', then: 'x1', shots: [
      { bg: 'scene:brd_prison', dur: 10, cam: [[-3, 0, 1.12], [3, 0, 1.12]], fx: ['fadein', 'embers'],
        actors: [{ a: 'story:windsor', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, text: 'The cell doors of Blackrock Depths stand open. Marshal Reginald Windsor walks out into the light.' }, { t: 5.2, who: 'Marshal Windsor', text: 'Stormwind. Now. Before she hears I am free.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 2, 1.18], [0, 0, 1.04]],
        actors: [{ a: 'story:windsor', x: 20, y: 2, w: 30, flip: true, from: { x: 0, o: 0 }, dur: 2 }, { a: 'story:bolvar', x: 62, y: 2, w: 30, anim: 'breathe' }],
        lines: [{ t: 0.5, who: 'Marshal Windsor', text: 'Highlord. Read my notes. Then look at the lady who stands beside the young king.' }, { t: 5.5, who: 'Highlord Bolvar', text: 'Lady Prestor has served this court for years, Marshal.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 2, 1.12], [0, 0, 1.02]],
        actors: [{ a: 'story:windsor', x: 16, y: 2, w: 28, flip: true }, { a: 'story:lyveus', x: 56, y: 2, w: 30, anim: 'breathe', from: { x: 80, o: 0 }, dur: 1.8 }],
        lines: [{ t: 0.5, who: 'Marshal Windsor', text: 'And I did not come alone. Your court buried this knight five years ago, Highlord.' }, { t: 5.2, who: 'Lyveus Cloveus', text: 'I heard them plot in these halls. They burned my home to keep it quiet. I am done being dead.' }] },
      { bg: 'story:stormwind_keep', dur: 10, cam: [[0, 0, 1.05], [0, 2, 1.2]],
        actors: [{ a: 'story:lady_prestor', x: 40, y: 2, w: 32, anim: 'breathe', from: { o: 0 }, dur: 1.6 }],
        lines: [{ t: 0.5, who: 'Lady Prestor', text: 'Lies, from a man gone mad in a dwarf prison.' }, { t: 5, who: 'Marshal Windsor', text: 'Then say the words in the notes, my lady. Say your true name.' }] },
      { bg: 'story:stormwind_keep', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@1', 'embers'],
        actors: [{ a: 'story:onyxia', x: 40, y: 0, w: 46, anim: 'breathe', from: { y: -10, o: 0 }, dur: 1.2 }],
        lines: [{ t: 0.5, text: 'The mask falls. Lady Katrana Prestor was Onyxia, daughter of Deathwing, all along.' }, { t: 5.5, who: 'Onyxia', text: 'You were never more than a court of fools. Enjoy your little kingdom while it lasts.' }] },
      { bg: 'story:stormveil_storm', dur: 11, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        lines: [{ t: 0.5, text: 'Onyxia fled south across the sea. The storm she raised tore the waters open behind her.' }, { t: 5.5, text: 'When it cleared, sailors saw land where no land had been for ten thousand years.' }] },
      { bg: 'scene:@here', dur: 10, cam: [[0, 0, 1.12], [0, 0, 1.0]], fx: ['fadeout'],
        actors: [{ a: 'hero:player', x: 38, y: 2, w: 26, anim: 'breathe' }],
        lines: [{ t: 0.5, text: 'The Brood Mother is gone from Stormwind, {name}. The Alliance and the Horde can both see the new isle on the horizon.' }, { t: 5.5, text: 'Everyone wants to reach it first.' }] },
    ] },
    { id: 'x1', level: 60, title: 'The Drowned Crown', music: 'dungeon', needs: 'tidewatch', shots: [
      { bg: 'story:stormveil_storm', dur: 10, cam: [[0, 2, 1.18], [0, 0, 1.04]], fx: ['fadein'],
        lines: [{ t: 0.5, text: "Ten thousand years ago, when the Well of Eternity exploded, the Highborne city of Sael'anor sank beneath the sea." }, { t: 5.5, text: 'Its people should have drowned. Most of them did.' }] },
      { bg: 'scene:citadel_throne', dur: 11, cam: [[-3, 0, 1.12], [3, 0, 1.12]],
        actors: [{ a: 'story:aeldran', x: 40, y: 2, w: 34, anim: 'breathe', from: { o: 0 }, dur: 2 }],
        lines: [{ t: 0.5, text: "Their prince, Aeldran, made a bargain in the dark: his court would live on beneath the waves." }, { t: 5.5, who: 'Prince Aeldran', text: 'The sea kept us. Now the sea gives us back.' }] },
      { bg: 'scene:citadel_abyss', dur: 11, cam: [[0, 0, 1.0], [0, -2, 1.22]], fx: ['shake@6'],
        actors: [{ a: 'story:nalveshra', x: 40, y: 0, w: 46, anim: 'breathe', from: { y: 20, o: 0 }, dur: 2.4 }],
        lines: [{ t: 0.5, text: "He made the bargain with Nal'veshra, the Deepmother, a spirit older than the Highborne. She does not give anything back." }, { t: 5.8, who: "Nal'veshra", text: 'Rise, my drowned children. The world above is ours to swallow.' }] },
      { bg: 'scene:brightwater_landing', dur: 9, cam: [[-4, 0, 1.12], [4, 0, 1.12]],
        lines: [{ t: 0.5, text: 'Kul Tiran ships carry the Alliance from Menethil Harbor to the Tidewatch Coast.' }] },
      { bg: 'scene:bloodtide_landing', dur: 9, cam: [[4, 0, 1.12], [-4, 0, 1.12]],
        lines: [{ t: 0.5, text: "Darkspear and Forsaken crews sail from Grom'gol to the Skullreef Isles." }] },
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
