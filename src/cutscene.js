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
    { id: 'ch4', level: 40, title: 'Chapter 4: Blackrock Rising', locked: true },
    { id: 'ch5', level: 50, title: 'Chapter 5: The Masquerade', locked: true },
    { id: 'ch6', level: 60, title: 'Chapter 6: The Brood Mother', locked: true },
  ];
  CS.byId = (id) => CS.CHAPTERS.find((c) => c.id === id);
  CS.forInstance = (key) => CS.CHAPTERS.find((c) => c.instance === key);

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
