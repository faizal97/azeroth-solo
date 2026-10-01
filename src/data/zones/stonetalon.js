// Highcrag Mountains and Tallstone Retreat: Krugar, levels 18–25 (v3).
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// The goblin Deepgold Company is clear-cutting the forest; harpies hold the Screaming Vale; the Sourhorn turn on their own kind.
(function (root) {
  const D = root.D;
  D.zone('stonetalon', { name: 'Highcrag Mountains', faction: 'horde', music: 'highcrag', town: 'highcrag_town' });
  // items
  D.item('deepmoss_egg', { name: 'Deepvine Egg', slot: 'quest', q: 1, icon: 'seed' });
  D.item('deepmoss_venom', { name: 'Deepvine Venom Sac', slot: 'quest', q: 1, icon: 'venom' });
  D.item('venture_hardhat', { name: 'Deepgold Company Hard Hat', slot: 'quest', q: 1, icon: 'head' });
  D.item('logging_orders', { name: 'Logging Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('harvester_core', { name: 'Harvester Power Core', slot: 'quest', q: 1, icon: 'coin' });
  D.item('pump_valve', { name: 'Pumping Station Valve', slot: 'quest', q: 1, icon: 'coin' });
  D.item('wyvern_feather', { name: 'Highwing Feather', slot: 'quest', q: 1, icon: 'feather' });
  D.item('harpy_talon', { name: 'Redclaw Talon', slot: 'quest', q: 1, icon: 'claw' });
  D.item('storm_feather', { name: 'Storm Witch Plume', slot: 'quest', q: 1, icon: 'feather' });
  D.item('basilisk_scale', { name: 'Blackened Basilisk Scale', slot: 'quest', q: 1, icon: 'chest_box' });
  D.item('grimtotem_totem', { name: 'Sourhorn Totem', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('grimtotem_orders', { name: 'Sourhorn Battle Plan', slot: 'quest', q: 1, icon: 'journal' });
  D.item('rigger_megaphone', { name: "Foreman Gritz's Megaphone", slot: 'quest', q: 1, icon: 'keg' });
  D.item('riven_headdress', { name: "Sister Rasp's Headdress", slot: 'quest', q: 1, icon: 'feather' });
  D.item('xt9_blade', { name: 'Big Chopper Saw Blade', slot: 'quest', q: 1, icon: 'coin' });
  // named drops
  D.item('rigger_wrench', { name: "Rigger's Monkey Wrench", slot: 'weapon', wtype: 'mace', q: 3, lvl: 22, dmg: [28, 46], speed: 2.5, stats: { str: 7, sta: 5 }, icon: 'mace', sell: 2500, source: 'Foreman Gritz, Kettle Lake' });
  D.item('riven_wings', { name: "Riven's Plumed Cloak", slot: 'back', q: 3, lvl: 24, armor: 38, stats: { agi: 6, sta: 5 }, icon: 'cloak', sell: 2300, source: 'Sister Rasp, the Screaming Vale' });
  D.item('shredder_plate', { name: 'Shredder Plating Vest', slot: 'chest', atype: 'mail', q: 3, lvl: 25, armor: 228, stats: { str: 9, sta: 8 }, icon: 'chest_mail', sell: 3100 });
  D.item('saw_blade_axe', { name: 'Saw-Toothed Cleaver', slot: 'weapon', wtype: 'axe', q: 3, lvl: 25, dmg: [33, 55], speed: 2.6, stats: { agi: 7, str: 6 }, icon: 'axe', sell: 3200 });
  D.item('harvester_goggles', { name: 'Harvester Goggles Band', slot: 'finger', q: 3, lvl: 25, stats: { int: 7, spi: 5 }, icon: 'ring', sell: 2800 });

  // creatures
  Object.assign(D.MOBS, {
    deepmoss_creeper: { name: 'Deepvine Creeper', lvl: [18, 19], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['deepmoss_egg', 0.5]] },
    deepmoss_venomspitter: { name: 'Deepvine Venomspitter', lvl: [19, 20], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['deepmoss_venom', 0.55], ['deepmoss_egg', 0.3]] },
    venture_logger: { name: 'Deepgold Company Logger', lvl: [19, 20], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.3]], qdrops: [['venture_hardhat', 0.5]], aggro: 'Time is money, friend!' },
    venture_deforester: { name: 'Deepgold Company Deforester', lvl: [21, 22], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['logging_orders', 0.45], ['venture_hardhat', 0.4]], aggro: 'Burn it all! Bill the shareholders!' },
    venture_operator: { name: 'Deepgold Company Operator', lvl: [21, 22], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['pump_valve', 0.5]], aggro: 'You are standing in a restricted area!' },
    compact_harvester: { name: 'Compact Harvester', lvl: [20, 21], family: 'mechanical', hpMult: 1.15, drops: [['linen_cloth', 0.1]], qdrops: [['harvester_core', 0.55]], aggro: 'Clearing obstruction.' },
    pridewing_wyvern: { name: 'Highwing Wyvern', lvl: [20, 21], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['wyvern_feather', 0.55]] },
    bloodfury_harpy: { name: 'Redclaw Harpy', lvl: [22, 23], family: 'humanoid', drops: [['linen_cloth', 0.3], ['thieves_coin', 0.35]], qdrops: [['harpy_talon', 0.55]], aggro: 'Your flesh will feed our young!' },
    bloodfury_storm_witch: { name: 'Redclaw Storm Witch', lvl: [23, 24], family: 'humanoid', drops: [['linen_cloth', 0.3], ['thieves_coin', 0.4]], qdrops: [['storm_feather', 0.5], ['harpy_talon', 0.3]], aggro: 'The storm will scatter your ashes!' },
    blackened_basilisk: { name: 'Blackened Basilisk', lvl: [23, 24], family: 'beast', hpMult: 1.2, drops: [['ruined_pelt', 0.3]], qdrops: [['basilisk_scale', 0.55]] },
    grimtotem_brute: { name: 'Sourhorn Brute', lvl: [23, 24], family: 'humanoid', hpMult: 1.15, drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['grimtotem_totem', 0.5]], aggro: 'The Sourhorn bow to no one!' },
    grimtotem_mystic: { name: 'Sourhorn Mystic', lvl: [24, 25], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['grimtotem_orders', 0.45], ['grimtotem_totem', 0.35]], aggro: 'The spirits have abandoned you!' },
    foreman_rigger: { name: 'Foreman Gritz', lvl: [22, 22], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['rigger_wrench', 0.35], ['thieves_coin', 1]], qdrops: [['rigger_megaphone', 1]], aggro: 'Back to work, all of you! And kill that one!' },
    sister_riven: { name: 'Sister Rasp', lvl: [24, 24], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['riven_wings', 0.35], ['linen_cloth', 1]], qdrops: [['riven_headdress', 1]], aggro: 'The Vale is ours, groundling!' },
    xt9: { name: 'Big Chopper', lvl: [25, 25], family: 'mechanical', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'whirl', drops: [['linen_cloth', 1]], qdrops: [['xt9_blade', 1]], aggro: 'Obstruction detected. Obstruction will be removed.', loot: ['shredder_plate', 'saw_blade_axe', 'harvester_goggles'] },
  });

  // places
  Object.assign(D.PLACES, {
    malakajin: { name: "Camp Vosh", zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'malakajin', lvl: [18, 25], safe: true, mobs: [], pool: 0, npcs: ['xenzilla'], links: { forgotten_pools: 22, webwinder_path: 16 } },
    webwinder_path: { name: 'The Silkline Path', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'webwinder_path', lvl: [18, 20], mobs: [['deepmoss_creeper', 5], ['deepmoss_venomspitter', 4]], pool: 10, npcs: [], links: { malakajin: 16, sun_rock_retreat: 18, grimtotem_post: 18 } },
    sun_rock_retreat: { name: 'Tallstone Retreat', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'sun_rock_retreat', lvl: [18, 25], safe: true, inn: true, mobs: [], pool: 0, npcs: ['mastok', 'tsunaman', 'sahn', 'jayka', 'krond'], vendor: 'jayka', gearVendor: 'krond',
      links: { webwinder_path: 18, windshear_crag: 18, mirkfallon_lake: 16, charred_vale: 20, crossroads: 45 }, via: { crossroads: 'Wind Rider' } },
    windshear_crag: { name: 'Sawtooth Crag', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'windshear_crag', lvl: [19, 22], mobs: [['venture_logger', 5], ['venture_deforester', 3], ['compact_harvester', 3]], pool: 11, npcs: [], links: { sun_rock_retreat: 18, cragpool_lake: 16 } },
    cragpool_lake: { name: 'Kettle Lake', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'cragpool_lake', lvl: [21, 23], mobs: [['venture_operator', 5], ['compact_harvester', 3]], named: { foreman_rigger: 300 }, pool: 10, npcs: [], links: { windshear_crag: 16, mirkfallon_lake: 18 } },
    mirkfallon_lake: { name: 'Fogwater Lake', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'mirkfallon_lake', lvl: [20, 22], mobs: [['pridewing_wyvern', 6], ['deepmoss_venomspitter', 2]], pool: 9, npcs: [], links: { sun_rock_retreat: 16, cragpool_lake: 18 } },
    charred_vale: { name: 'The Screaming Vale', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'charred_vale', lvl: [22, 25], mobs: [['bloodfury_harpy', 4], ['bloodfury_storm_witch', 3], ['blackened_basilisk', 3]], named: { sister_riven: 300 }, pool: 11, npcs: [], links: { sun_rock_retreat: 20 } },
    grimtotem_post: { name: 'Sourhorn Post', zone: 'Highcrag Mountains', region: 'stonetalon', scene: 'grimtotem_post', lvl: [23, 25], mobs: [['grimtotem_brute', 5], ['grimtotem_mystic', 4]], pool: 10, npcs: [], links: { webwinder_path: 18 } },
  });
  D.PLACES.forgotten_pools.links.malakajin = 22;
  D.PLACES.crossroads.links.sun_rock_retreat = 45; D.PLACES.crossroads.via = Object.assign(D.PLACES.crossroads.via || {}, { sun_rock_retreat: 'Wind Rider' });

  // people
  Object.assign(D.NPCS, {
    xenzilla: { name: "Zessi", title: 'Kessari Scout' },
    mastok: { name: 'Rakko', title: 'Tallstone Commander' },
    tsunaman: { name: 'Tamu of the Stone', title: 'Stone Circle' },
    sahn: { name: 'Onu of the Tall Stone', title: 'Druid of the Claw' },
    jayka: { name: 'Innkeeper Pema', title: 'Innkeeper' },
    krond: { name: 'Bregga', title: 'Weaponsmith' },
  });

  // quests (levels 18–25)
  Object.assign(D.QUESTS, {
    crossroads_stonetalon: { name: 'Into the Mountains', lvl: 18, giver: 'thork', turnin: 'xenzilla', text: "Our scouts at Camp Vosh say the goblins are tearing Highcrag apart. Go west past the Silent Pools and report to Zessi.",
      objs: [{ type: 'visit', place: 'malakajin' }], reward: { money: 600 } },
    webwinder_eggs: { name: 'The Silkline Nests', lvl: 18, giver: 'xenzilla', turnin: 'xenzilla', text: 'The spiders on the Silkline Path breed faster every season. Bring me 8 of their eggs before they hatch. A nest left alone becomes a forest of legs.',
      objs: [{ type: 'collect', item: 'deepmoss_egg', n: 8 }], reward: { choice: ['fam_feet22'] } },
    report_sun_rock: { name: 'Tallstone Retreat', lvl: 18, giver: 'xenzilla', turnin: 'mastok', text: 'Take the Silkline Path north to Tallstone Retreat. Commander Rakko will want every blade he can get.',
      objs: [{ type: 'visit', place: 'sun_rock_retreat' }], reward: { money: 600 } },
    deepmoss_creepers: { name: 'Clear the Path', lvl: 19, giver: 'mastok', turnin: 'mastok', text: 'Our supply caravans die on the Silkline Path. Kill 12 Deepvine creepers.',
      objs: [{ type: 'kill', mob: 'deepmoss_creeper', n: 12 }], reward: { choice: ['fam_wrist22'] } },
    venom_sacs: { name: 'Venom for the Healers', lvl: 19, giver: 'sahn', turnin: 'sahn', text: 'Deepvine venom, diluted, makes a strong antidote. Bring me 8 venom sacs.',
      objs: [{ type: 'collect', item: 'deepmoss_venom', n: 8 }], reward: { money: 900 } },
    windshear_scout: { name: 'Sawtooth Crag', lvl: 19, giver: 'tsunaman', turnin: 'tsunaman', text: 'The earth screams to the east, at Sawtooth Crag. Go and see what the goblins have done.',
      objs: [{ type: 'visit', place: 'windshear_crag' }], reward: { money: 700 } },
    loggers: { name: 'Stop the Loggers', lvl: 20, giver: 'tsunaman', turnin: 'tsunaman', pre: ['windshear_scout'], text: 'Every tree they fell is a wound in the land. Kill 12 Deepgold Company loggers.',
      objs: [{ type: 'kill', mob: 'venture_logger', n: 12 }], reward: { choice: ['fam_weapon22'] } },
    hard_hats: { name: 'Hard Hats', lvl: 20, giver: 'krond', turnin: 'krond', text: 'Goblin hard hats are good steel, wasted on goblins. Bring me 8 and I will melt them into something useful.',
      objs: [{ type: 'collect', item: 'venture_hardhat', n: 8 }], reward: { money: 1000 } },
    harvester_cores: { name: 'Power Cores', lvl: 20, giver: 'mastok', turnin: 'mastok', text: 'Those walking saws run on power cores. Bring me 6 and they will never run again.',
      objs: [{ type: 'collect', item: 'harvester_core', n: 6 }], reward: { choice: ['fam_hands24'] } },
    pridewing_feathers: { name: 'Highwing Feathers', lvl: 20, giver: 'sahn', turnin: 'sahn', text: 'The wild wyverns at Fogwater Lake shed feathers our wyvern riders need for their harnesses. Bring me 8.',
      objs: [{ type: 'collect', item: 'wyvern_feather', n: 8 }], reward: { choice: ['fam_back23'] } },
    wild_wyverns: { name: 'Thinning the Flock', lvl: 21, giver: 'sahn', turnin: 'sahn', pre: ['pridewing_feathers'], text: 'The Highwing grow hungry and bold, and they hunt our young wyvern riders. Kill 10 of them.',
      objs: [{ type: 'kill', mob: 'pridewing_wyvern', n: 10 }], reward: { money: 1100 } },
    deforesters: { name: 'The Deforesters', lvl: 21, giver: 'tsunaman', turnin: 'tsunaman', pre: ['loggers'], text: 'Now they burn what they cannot cut. Kill 10 deforesters.',
      objs: [{ type: 'kill', mob: 'venture_deforester', n: 10 }], reward: { choice: ['fam_chest23'] } },
    logging_orders_q: { name: 'Logging Orders', lvl: 21, giver: 'mastok', turnin: 'mastok', text: 'Someone is paying the goblins to clear these mountains. The deforesters carry their orders. Bring me 5.',
      objs: [{ type: 'collect', item: 'logging_orders', n: 5 }], reward: { money: 1100 } },
    walking_saws: { name: 'Walking Saws', lvl: 21, giver: 'krond', turnin: 'krond', text: 'I want those machines scrapped. Smash 10 compact harvesters.',
      objs: [{ type: 'kill', mob: 'compact_harvester', n: 10 }], reward: { choice: ['fam_waist24'] } },
    cragpool_scout: { name: 'Kettle Lake', lvl: 21, giver: 'mastok', turnin: 'mastok', pre: ['logging_orders_q'], text: 'The orders mention a dam at Kettle Lake, north of the crag. Find it.',
      objs: [{ type: 'visit', place: 'cragpool_lake' }], reward: { money: 800 } },
    operators: { name: 'The Operators', lvl: 22, giver: 'mastok', turnin: 'mastok', pre: ['cragpool_scout'], text: 'The dam is draining the lake to feed their machines. Kill 12 operators.',
      objs: [{ type: 'kill', mob: 'venture_operator', n: 12 }], reward: { choice: ['fam_legs23'] } },
    pump_valves: { name: 'Shut the Pumps', lvl: 22, giver: 'tsunaman', turnin: 'tsunaman', pre: ['cragpool_scout'], text: 'Take the valves from their pumping stations and the lake will fill again. Bring me 6.',
      objs: [{ type: 'collect', item: 'pump_valve', n: 6 }], reward: { choice: ['fam_feet22'] } },
    foreman_rigger_q: { name: 'Foreman Gritz', lvl: 22, giver: 'krond', turnin: 'krond', text: 'A foreman called Rigger shouts the orders at Kettle. He is rarely seen outside. Bring me his megaphone.',
      objs: [{ type: 'collect', item: 'rigger_megaphone', n: 1 }], reward: { choice: ['fam_ring_rare25'] } },
    charred_vale_scout: { name: 'The Screaming Vale', lvl: 22, giver: 'sahn', turnin: 'sahn', text: 'West of Tallstone lies the Screaming Vale, burned black long ago. Harpies nest there now. Scout it.',
      objs: [{ type: 'visit', place: 'charred_vale' }], reward: { money: 800 } },
    bloodfury_harpies: { name: 'The Redclaw', lvl: 23, giver: 'mastok', turnin: 'mastok', pre: ['charred_vale_scout'], text: 'The Redclaw raid our patrols from the Vale. Kill 12 of them.',
      objs: [{ type: 'kill', mob: 'bloodfury_harpy', n: 12 }], reward: { choice: ['fam_weapon25'] } },
    harpy_talons: { name: 'Redclaw Talons', lvl: 23, giver: 'jayka', turnin: 'jayka', text: 'My brother came back from the Vale with talon scars. Bring me 10 talons so I can hang them over the door.',
      objs: [{ type: 'collect', item: 'harpy_talon', n: 10 }], reward: { money: 1200 } },
    basilisk_scales: { name: 'Blackened Scales', lvl: 23, giver: 'krond', turnin: 'krond', text: 'The basilisks of the Vale have scales hard as iron. Bring me 8 and I will make armour from them.',
      objs: [{ type: 'collect', item: 'basilisk_scale', n: 8 }], reward: { choice: ['fam_chest23'] } },
    storm_witches: { name: 'The Storm Witches', lvl: 24, giver: 'sahn', turnin: 'sahn', pre: ['bloodfury_harpies'], text: 'The storm witches call lightning down on the forest. Kill 10 and bring me 5 of their plumes.',
      objs: [{ type: 'kill', mob: 'bloodfury_storm_witch', n: 10 }, { type: 'collect', item: 'storm_feather', n: 5 }], reward: { choice: ['fam_back23'] } },
    sister_riven_q: { name: 'Sister Rasp', lvl: 24, giver: 'mastok', turnin: 'mastok', text: 'The Redclaw follow a matriarch called Sister Rasp. She is rarely seen. Bring me her headdress.',
      objs: [{ type: 'collect', item: 'riven_headdress', n: 1 }], reward: { choice: ['fam_back_rare25'] } },
    grimtotem_scout: { name: 'Sourhorn Post', lvl: 23, giver: 'tsunaman', turnin: 'tsunaman', text: 'Hornfolk who have turned from the Grass Mother camp south of the Silkline Path. The Sourhorn. See what they plan.',
      objs: [{ type: 'visit', place: 'grimtotem_post' }], reward: { money: 900 } },
    grimtotem_brutes: { name: 'Blood of the Sourhorn', lvl: 24, giver: 'tsunaman', turnin: 'tsunaman', pre: ['grimtotem_scout'], text: 'It shames me to ask it. Kill 12 Sourhorn brutes before they reach Tallstone.',
      objs: [{ type: 'kill', mob: 'grimtotem_brute', n: 12 }], reward: { choice: ['fam_hands24'] } },
    grimtotem_totems: { name: 'Broken Totems', lvl: 24, giver: 'sahn', turnin: 'sahn', pre: ['grimtotem_scout'], text: 'Their totems are carved with a curse on our people. Bring me 8 so I can break the curse.',
      objs: [{ type: 'collect', item: 'grimtotem_totem', n: 8 }], reward: { money: 1300 } },
    grimtotem_plans: { name: 'The Battle Plan', lvl: 25, giver: 'mastok', turnin: 'mastok', pre: ['grimtotem_brutes'], text: 'The mystics carry their battle plans. Kill 10 mystics and bring me the plan.',
      objs: [{ type: 'kill', mob: 'grimtotem_mystic', n: 10 }, { type: 'collect', item: 'grimtotem_orders', n: 1 }], reward: { choice: ['fam_waist24'] } },
    venomspitters: { name: 'Venomspitters', lvl: 19, giver: 'xenzilla', turnin: 'xenzilla', pre: ['webwinder_eggs'], text: 'The venomspitters are worse than the creepers. Kill 10 of them. Keep your mouth shut when they spit.',
      objs: [{ type: 'kill', mob: 'deepmoss_venomspitter', n: 10 }], reward: { money: 950 } },
    cragpool_patrol: { name: 'Break the Works', lvl: 22, giver: 'tsunaman', turnin: 'tsunaman', pre: ['operators'], text: 'Keep the goblins from rebuilding: 8 operators and 6 harvesters.',
      objs: [{ type: 'kill', mob: 'venture_operator', n: 8 }, { type: 'kill', mob: 'compact_harvester', n: 6 }], reward: { choice: ['fam_waist24'] } },
    harpy_cull: { name: 'Clip Their Wings', lvl: 23, giver: 'jayka', turnin: 'jayka', pre: ['harpy_talons'], text: 'The harpies took our supply wyvern last night. Kill 10 more of them.',
      objs: [{ type: 'kill', mob: 'bloodfury_harpy', n: 10 }], reward: { money: 1250 } },
    basilisk_hunt: { name: 'Basilisk Hunt', lvl: 23, giver: 'krond', turnin: 'krond', pre: ['basilisk_scales'], text: 'More scales, and fewer basilisks. Kill 10.',
      objs: [{ type: 'kill', mob: 'blackened_basilisk', n: 10 }], reward: { choice: ['fam_feet22'] } },
    grimtotem_mystics_q: { name: 'The Sourhorn Mystics', lvl: 24, giver: 'sahn', turnin: 'sahn', pre: ['grimtotem_totems'], text: 'The mystics carve the curses. Kill 8 of them.',
      objs: [{ type: 'kill', mob: 'grimtotem_mystic', n: 8 }], reward: { money: 1450 } },
    wanted_xt9: { name: 'Wanted: Big Chopper', lvl: 25, giver: 'mastok', turnin: 'mastok', group: 3, text: 'The goblins sent their biggest shredder, Big Chopper, to Sawtooth Crag. It cuts through our warriors like timber. Bring me one of its saw blades. Take friends: it is no ordinary machine.',
      objs: [{ type: 'collect', item: 'xt9_blade', n: 1 }], reward: { choice: ['fam_weapon25'] } },
  });

  // group finder: open-world elite
  Object.assign(D.ACTIVITIES, {
    xt9: { name: 'Wanted: Big Chopper', where: 'windshear_crag', size: 3, minLvl: 22, maxLvl: 25, desc: 'Open-world elite in Highcrag. 3 players.', boss: 'xt9', pulls: [{ scene: 'windshear_crag', label: 'Logging camp', mobs: ['venture_logger', 'venture_deforester'] }, { scene: 'windshear_crag', label: 'Logging camp', mobs: ['compact_harvester', 'compact_harvester'] }, { scene: 'windshear_crag', label: 'Big Chopper', mobs: ['xt9'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
