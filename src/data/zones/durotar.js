// Durotar, the Valley of Trials and Orgrimmar (with Ragefire Chasm): Horde, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('durotar', { name: 'Durotar', faction: 'horde' });
  // items
  D.item('cactus_apple', { name: 'Cactus Apple', slot: 'quest', q: 1, icon: 'cactus_apple' });
  D.item('scorpid_stinger', { name: 'Scorpid Worker Tail', slot: 'quest', q: 1, icon: 'scorpid_stinger' });
  D.item('burning_medallion', { name: 'Burning Blade Medallion', slot: 'quest', q: 1, icon: 'ring' });
  D.item('lizard_horn', { name: 'Thunder Lizard Horn', slot: 'quest', q: 1, icon: 'lizard_horn' });
  D.item('voodoo_charm', { name: 'Voodoo Charm', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('kultiras_insignia', { name: 'Kul Tiras Insignia', slot: 'quest', q: 1, icon: 'coin' });
  D.item('zalazane_head', { name: "Zalazane's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('taragaman_heart', { name: "Taragaman the Hungerer's Heart", slot: 'quest', q: 1, icon: 'venom' });
  D.item('burning_blade_cloak', { name: 'Burning Blade Cloak', slot: 'back', q: 3, lvl: 5, armor: 9, stats: { int: 2, sta: 1 }, icon: 'cloak', sell: 130, source: 'Yarrog Baneshadow, Burning Blade Coven', look: ['back', 'burning_blade_cloak'] });
  D.item('zalazane_staff', { name: "Zalazane's Voodoo Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [16, 24], speed: 3, stats: { int: 4, spi: 3 }, sp: 9, icon: 'staff', sell: 800, source: 'Zalazane, Echo Isles', look: ['weapon', 'zalazane_staff'] });
  D.item('benedict_cutlass', { name: "Benedict's Cutlass", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [11, 20], speed: 2.1, stats: { str: 3, sta: 2 }, icon: 'sword', sell: 800, source: 'Lieutenant Benedict, Tiragarde Keep', look: ['weapon', 'benedict_cutlass'] });
  D.item('cursed_felblade', { name: 'Cursed Felblade', slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [13, 23], speed: 2.4, stats: { str: 4, agi: 2 }, icon: 'sword', sell: 900, look: ['weapon', 'cursed_felblade'], source: 'Taragaman the Hungerer, Ragefire Chasm' });
  D.item('subterranean_cape', { name: 'Subterranean Cape', slot: 'back', q: 3, lvl: 10, armor: 18, stats: { sta: 3, spi: 2 }, icon: 'cloak', sell: 600, look: ['back', 'subterranean_cape'], source: 'Taragaman the Hungerer, Ragefire Chasm' });
  D.item('robe_evocation', { name: 'Robe of Evocation', slot: 'chest', atype: 'cloth', q: 3, lvl: 10, armor: 28, stats: { int: 6, spi: 3 }, sp: 4, icon: 'chest_cloth', sell: 700, source: 'Jergosh the Invoker, Ragefire Chasm' });
  D.item('chanting_blade', { name: 'Chanting Blade', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.6, stats: { int: 3, agi: 2 }, sp: 4, icon: 'dagger', sell: 800, source: 'Jergosh the Invoker, Ragefire Chasm' });
  D.item('oggleflint_mace', { name: "Oggleflint's Inspirer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [12, 22], speed: 2.5, stats: { str: 4, sta: 2 }, icon: 'mace', sell: 800, source: 'Oggleflint, Ragefire Chasm' });
  D.item('bazzalan_belt', { name: "Bazzalan's Cord", slot: 'waist', atype: 'leather', q: 3, lvl: 10, armor: 30, stats: { agi: 3, sta: 2 }, icon: 'belt', sell: 500, source: 'Oggleflint, Ragefire Chasm' });
  D.item('dire_boar_meat', { name: 'Dire Boar Meat', slot: 'quest', q: 1, icon: 'meat' });
  D.item('reaver_stinger', { name: 'Reaver Stinger', slot: 'quest', q: 1, icon: 'scorpid_stinger' });
  D.item('kultiras_rum', { name: 'Kul Tiras Rum', slot: 'quest', q: 1, icon: 'keg' });

  // creatures
  Object.assign(D.MOBS, {
    mottled_boar: { name: 'Mottled Boar', lvl: [1, 2], family: 'beast', drops: [['boar_tusk', 0.4], ['ruined_pelt', 0.2]] },
    scorpid_worker: { name: 'Scorpid Worker', lvl: [3, 3], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['scorpid_stinger', 0.65]] },
    vile_familiar: { name: 'Vile Familiar', lvl: [2, 3], family: 'demon', drops: [['grell_earring', 0.3]] },
    felstalker: { name: 'Felstalker', lvl: [4, 5], family: 'demon', drops: [['grell_earring', 0.35]] },
    yarrog: { name: 'Yarrog Baneshadow', lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['linen_cloth', 1], ['burning_blade_cloak', 0.35]], qdrops: [['burning_medallion', 1]], aggro: 'The Burning Blade will consume you!' },
    dire_mottled_boar: { name: 'Dire Mottled Boar', lvl: [6, 7], family: 'beast', drops: [['boar_tusk', 0.45]], qdrops: [['dire_boar_meat', 0.6]] },
    scorpid_reaver: { name: 'Scorpid Reaver', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['reaver_stinger', 0.55]] },
    thunder_lizard: { name: 'Thunder Lizard', lvl: [6, 8], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['lizard_horn', 0.6]] },
    durotar_tiger: { name: 'Durotar Tiger', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4]] },
    hexed_troll: { name: 'Hexed Troll', lvl: [8, 9], family: 'humanoid', drops: [['troll_trinket', 0.4], ['linen_cloth', 0.3]], qdrops: [['voodoo_charm', 0.6]], aggro: 'Zalazane will have your soul!' },
    voodoo_troll: { name: 'Voodoo Troll', lvl: [8, 9], family: 'humanoid', drops: [['troll_trinket', 0.4], ['linen_cloth', 0.35]], qdrops: [['voodoo_charm', 0.6]] },
    zalazane: { name: 'Zalazane', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.2, dmgMult: 2.5, drops: [['troll_trinket', 1]], qdrops: [['zalazane_head', 1]], special: 'hogger', loot: ['zalazane_staff'], aggro: 'You come to die on da Echo Isles!' },
    kul_tiras_sailor: { name: 'Kul Tiras Sailor', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['kultiras_insignia', 0.55], ['kultiras_rum', 0.5]], aggro: 'For Kul Tiras!' },
    kul_tiras_marine: { name: 'Kul Tiras Marine', lvl: [9, 10], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['kultiras_insignia', 0.6], ['kultiras_rum', 0.5]], aggro: 'Hold the line!' },
    lieutenant_benedict: { name: 'Lieutenant Benedict', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['thieves_coin', 1], ['benedict_cutlass', 0.35]], aggro: 'You filthy orcs will never take this keep!' },
    ragefire_trogg: { name: 'Ragefire Trogg', lvl: [10, 11], family: 'humanoid', drops: [['trogg_stone', 0.5], ['linen_cloth', 0.4]] },
    searing_blade_cultist: { name: 'Searing Blade Cultist', lvl: [10, 11], family: 'humanoid', drops: [['linen_cloth', 0.5], ['thieves_coin', 0.3]] },
    earthborer: { name: 'Earthborer', lvl: [10, 11], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    oggleflint: { name: 'Oggleflint', lvl: [11, 11], family: 'humanoid', boss: true, special: 'slam', aggro: 'Grrrr! Oggleflint smash!', loot: ['oggleflint_mace', 'bazzalan_belt'] },
    taragaman: { name: 'Taragaman the Hungerer', lvl: [12, 12], family: 'demon', boss: true, special: 'whirl', aggro: 'They call me the Hungerer. Soon you will see why!', loot: ['cursed_felblade', 'subterranean_cape'], qdrops: [['taragaman_heart', 1]] },
    jergosh: { name: 'Jergosh the Invoker', lvl: [12, 12], family: 'humanoid', boss: true, special: 'molten', aggro: 'The Searing Blade will burn you!', loot: ['robe_evocation', 'chanting_blade'] },
    bazzalan: { name: 'Bazzalan', lvl: [12, 12], family: 'demon', boss: true, special: 'cook', aggro: 'You dare trespass here?', loot: ['bazzalan_belt', 'chanting_blade', 'cursed_felblade'] },
  });

  // places
  Object.assign(D.PLACES, {
    valley_of_trials: { name: 'Valley of Trials', zone: 'Durotar', region: 'durotar', scene: 'valley_of_trials', lvl: [1, 3], mobs: [['mottled_boar', 5], ['scorpid_worker', 4], ['vile_familiar', 3]], pool: 11, npcs: ['gornek', 'kaltunk', 'galgar', 'zureetha', 'duokna'], vendor: 'duokna', gather: { item: 'cactus_apple', label: 'Cactus Apple', quest: 'cactus_apples' }, links: { burning_blade_coven: 12, razor_hill: 30 } },
    burning_blade_coven: { name: 'Burning Blade Coven', zone: 'Durotar', region: 'durotar', scene: 'burning_blade_coven', lvl: [3, 5], mobs: [['vile_familiar', 5], ['felstalker', 4]], named: { yarrog: 90 }, pool: 9, npcs: [], links: { valley_of_trials: 12 } },
    razor_hill: { name: 'Razor Hill', zone: 'Durotar', region: 'durotar', scene: 'razor_hill', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['garthok', 'grosk', 'orgnil', 'kaplak', 'vikar'], vendor: 'grosk', gearVendor: 'kaplak', links: { valley_of_trials: 30, thunder_ridge: 16, echo_isles: 18, tiragarde_keep: 16, orgrimmar: 22, far_watch: 25 } },
    thunder_ridge: { name: 'Thunder Ridge', zone: 'Durotar', region: 'durotar', scene: 'thunder_ridge', lvl: [6, 8], mobs: [['thunder_lizard', 5], ['dire_mottled_boar', 4], ['scorpid_reaver', 3]], pool: 10, npcs: [], links: { razor_hill: 16 } },
    echo_isles: { name: 'Echo Isles', zone: 'Durotar', region: 'durotar', scene: 'echo_isles', lvl: [8, 11], mobs: [['hexed_troll', 5], ['voodoo_troll', 4], ['durotar_tiger', 2]], named: { zalazane: 180 }, pool: 10, npcs: ['vanira'], links: { razor_hill: 18 } },
    tiragarde_keep: { name: 'Tiragarde Keep', zone: 'Durotar', region: 'durotar', scene: 'tiragarde_keep', lvl: [8, 10], mobs: [['kul_tiras_sailor', 5], ['kul_tiras_marine', 5]], named: { lieutenant_benedict: 150 }, pool: 10, npcs: [], links: { razor_hill: 16 } },
    orgrimmar: { name: 'Orgrimmar', zone: 'Orgrimmar', region: 'durotar', scene: 'orgrimmar', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['gryshka', 'rahauro', 'thrall_herald'], vendor: 'gryshka', gearVendor: 'rahauro', links: { razor_hill: 22, thunder_bluff: 60, undercity: 60, crossroads: 40 }, via: { thunder_bluff: 'Wind Rider', undercity: 'Zeppelin', crossroads: 'Wind rider' } },
  });

  // people
  Object.assign(D.NPCS, {
    gornek: { name: 'Gornek', title: 'Valley of Trials' },
    kaltunk: { name: 'Kaltunk', title: 'Grunt' },
    galgar: { name: 'Galgar', title: 'Cook' },
    zureetha: { name: 'Zureetha Fargaze', title: 'Warlock' },
    duokna: { name: 'Duokna', title: 'Food & Drink' },
    garthok: { name: "Gar'Thok", title: 'Razor Hill' },
    grosk: { name: 'Innkeeper Grosk', title: 'Innkeeper' },
    orgnil: { name: 'Orgnil Soulscar', title: 'Shaman' },
    kaplak: { name: 'Kaplak', title: 'Weaponsmith' },
    vikar: { name: 'Vikar', title: 'Scout' },
    vanira: { name: 'Vanira', title: 'Darkspear Witch Doctor' },
    gryshka: { name: 'Innkeeper Gryshka', title: 'Innkeeper' },
    rahauro: { name: 'Rahauro', title: 'Weaponsmith' },
    thrall_herald: { name: 'Herald of Thrall', title: "Warchief's Voice" },
  });

  // quests
  Object.assign(D.QUESTS, {
    cutting_teeth: { name: 'Cutting Teeth', lvl: 2, giver: 'gornek', turnin: 'gornek', text: 'Every orc proves their strength in the Valley of Trials. Start with the boars: slay 10 Mottled Boars.',
      objs: [{ type: 'kill', mob: 'mottled_boar', n: 10 }], reward: { choice: ['fam_chest'] } },
    sting_scorpid: { name: 'Sting of the Scorpid', lvl: 3, giver: 'kaltunk', turnin: 'kaltunk', text: 'The scorpids nest along the valley walls. Bring me 8 of their tails.',
      objs: [{ type: 'collect', item: 'scorpid_stinger', n: 8 }], reward: { choice: ['fam_legs'] } },
    cactus_apples: { name: "Galgar's Cactus Apple Surprise", lvl: 3, giver: 'galgar', turnin: 'galgar', text: 'Pick me 10 cactus apples from around the valley and I will make you something special.',
      objs: [{ type: 'collect', item: 'cactus_apple', n: 10 }], reward: {} },
    vile_familiars: { name: 'Vile Familiars', lvl: 3, giver: 'zureetha', turnin: 'zureetha', text: 'Burning Blade warlocks summon vile familiars in the caves. Destroy 12 of them.',
      objs: [{ type: 'kill', mob: 'vile_familiar', n: 12 }], reward: { choice: ['fam_feet'] } },
    burning_medallion_q: { name: 'Burning Blade Medallion', lvl: 5, giver: 'zureetha', turnin: 'zureetha', pre: ['vile_familiars'], text: 'Their leader, Yarrog Baneshadow, hides in the coven. Bring me his medallion.',
      objs: [{ type: 'collect', item: 'burning_medallion', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_razor_hill: { name: 'Report to Razor Hill', lvl: 5, giver: 'gornek', turnin: 'garthok', text: "You have proven yourself. Go east to Razor Hill and report to Gar'Thok.",
      objs: [{ type: 'visit', place: 'razor_hill' }], reward: {} },
    thunder_lizard_q: { name: 'Lizard Horns', lvl: 7, giver: 'orgnil', turnin: 'orgnil', text: 'The thunder lizards of Thunder Ridge carry storm-charged horns. Bring me 8.',
      objs: [{ type: 'collect', item: 'lizard_horn', n: 8 }], reward: { choice: ['fam_hands'] } },
    kultiras_q: { name: 'Dark Storms', lvl: 9, giver: 'garthok', turnin: 'garthok', pre: ['report_razor_hill'], text: 'Humans from Kul Tiras have dug in at Tiragarde Keep. Bring me 8 of their insignias.',
      objs: [{ type: 'collect', item: 'kultiras_insignia', n: 8 }], reward: { choice: ['fam_wrist'] } },
    benedict_q: { name: 'Lieutenant Benedict', lvl: 10, giver: 'garthok', turnin: 'garthok', pre: ['kultiras_q'], text: 'Their commander, Lieutenant Benedict, must fall.',
      objs: [{ type: 'kill', mob: 'lieutenant_benedict', n: 1 }], reward: { choice: ['fam_back'] } },
    voodoo_q: { name: 'Hexed Charms', lvl: 9, giver: 'vanira', turnin: 'vanira', text: 'Zalazane has hexed my people on the Echo Isles. Bring me 8 of their voodoo charms so I can break the curse.',
      objs: [{ type: 'collect', item: 'voodoo_charm', n: 8 }], reward: { choice: ['fam_chest9'] } },
    zalazane_q: { name: 'Zalazane', lvl: 11, giver: 'vanira', turnin: 'vanira', group: 3, text: 'Zalazane himself must die. Bring me his head. He is too strong to face alone.',
      objs: [{ type: 'collect', item: 'zalazane_head', n: 1 }], reward: { choice: ['militia'] } },
    hidden_enemies: { name: 'Hidden Enemies', lvl: 12, giver: 'thrall_herald', turnin: 'thrall_herald', dungeon: 'ragefire', text: 'Cultists of the Searing Blade hide in Ragefire Chasm beneath Orgrimmar. Slay Taragaman the Hungerer and bring his heart.',
      objs: [{ type: 'collect', item: 'taragaman_heart', n: 1 }], reward: { choice: ['fam_back_rare'] } },
    enter_orgrimmar: { name: 'Welcome to Orgrimmar', lvl: 8, giver: 'garthok', turnin: 'gryshka', pre: ['report_razor_hill'], text: "Go north to Orgrimmar, the capital of the Horde, and see the Warchief's city.",
      objs: [{ type: 'visit', place: 'orgrimmar' }], reward: {} },
    dire_boar_meat_q: { name: 'Meat for the Barracks', lvl: 5, giver: 'grosk', turnin: 'grosk', text: 'The grunts eat more than they fight. Bring me 6 cuts of dire boar meat from Thunder Ridge.',
      objs: [{ type: 'collect', item: 'dire_boar_meat', n: 6 }], reward: { money: 90 } },
    reaver_stingers: { name: 'Reaver Stingers', lvl: 6, giver: 'kaplak', turnin: 'kaplak', text: 'A reaver stinger makes a nasty barb. Bring me 6 and I will fit you with a proper weapon.',
      objs: [{ type: 'collect', item: 'reaver_stinger', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    lizard_cull: { name: 'Thunder on the Ridge', lvl: 6, giver: 'garthok', turnin: 'garthok', pre: ['report_razor_hill'], text: 'The thunder lizards are breeding out of control on the ridge. Kill 10 before they reach the road.',
      objs: [{ type: 'kill', mob: 'thunder_lizard', n: 10 }], reward: { choice: ['fam_hands'] } },
    tiger_hunt: { name: 'Tiger Hunt', lvl: 7, giver: 'vikar', turnin: 'vikar', text: 'Tigers from the coast have been taking our scouts. Hunt 6 Durotar Tigers near the Echo Isles.',
      objs: [{ type: 'kill', mob: 'durotar_tiger', n: 6 }], reward: { choice: ['fam_wrist'] } },
    kultiras_rum_q: { name: 'Spoils of Tiragarde', lvl: 8, giver: 'grosk', turnin: 'grosk', text: 'The humans at Tiragarde Keep drink well. Take 6 bottles of their rum. For the Horde. And for me.',
      objs: [{ type: 'collect', item: 'kultiras_rum', n: 6 }], reward: { choice: ['fam_waist'] } },
    marines_q: { name: 'The Keep Marines', lvl: 9, giver: 'vikar', turnin: 'vikar', pre: ['tiger_hunt'], text: 'Tiragarde marines patrol farther from the keep each day. Kill 8 and push them back.',
      objs: [{ type: 'kill', mob: 'kul_tiras_marine', n: 8 }], reward: { choice: ['fam_legs9'] } },
    voodoo_trolls: { name: 'Voodoo on the Isles', lvl: 10, giver: 'kaplak', turnin: 'kaplak', text: 'The voodoo trolls on the Echo Isles serve Zalazane now. Kill 8 of them.',
      objs: [{ type: 'kill', mob: 'voodoo_troll', n: 8 }], reward: { choice: ['fam_hands9'] } },
    crossroads_durotar: { name: 'Report to the Crossroads', lvl: 10, giver: 'garthok', turnin: 'thork', text: 'The Crossroads guards the heart of the Barrens. Thork needs fighters. Go west through Far Watch.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
  });

  // dungeons
  Object.assign(D.DUNGEONS, {
    ragefire: { name: 'Ragefire Chasm', minLvl: 8, size: 5, trashMult: { hp: 2.2, dmg: 1.55 }, bossMult: { hp: 10, dmg: 3.2 }, pulls: [{ scene: 'ragefire_chasm', label: 'Trogg tunnels', mobs: ['ragefire_trogg', 'ragefire_trogg'] }, { scene: 'ragefire_chasm', label: 'Trogg tunnels', mobs: ['ragefire_trogg', 'earthborer'] }, { scene: 'ragefire_chasm', label: 'Oggleflint', mobs: ['oggleflint'], boss: true }, { scene: 'ragefire_chasm', label: 'The lava lake', mobs: ['searing_blade_cultist', 'searing_blade_cultist'] }, { scene: 'ragefire_chasm', label: 'Taragaman the Hungerer', mobs: ['taragaman'], boss: true }, { scene: 'ragefire_chasm', label: 'Cultist den', mobs: ['searing_blade_cultist', 'searing_blade_cultist', 'earthborer'] }, { scene: 'ragefire_chasm', label: 'Jergosh the Invoker', mobs: ['jergosh'], boss: true }, { scene: 'ragefire_chasm', label: 'Bazzalan', mobs: ['bazzalan'], boss: true }] },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    zalazane: { name: 'Zalazane', where: 'echo_isles', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite on the Echo Isles. 3 players.', boss: 'zalazane', pulls: [{ scene: 'echo_isles', label: 'Hexed village', mobs: ['hexed_troll', 'voodoo_troll'] }, { scene: 'echo_isles', label: 'Hexed village', mobs: ['hexed_troll', 'hexed_troll'] }, { scene: 'echo_isles', label: 'Zalazane', mobs: ['zalazane'], boss: true }] },
    ragefire: { name: 'Ragefire Chasm', dungeon: 'ragefire', size: 5, minLvl: 8, maxLvl: 12, desc: 'Dungeon under Orgrimmar. 5 players. Scaled for level 10.', boss: 'taragaman' },
  });

})(typeof window !== 'undefined' ? window : globalThis);