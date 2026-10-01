// Greenmaw Crater: contested, levels 48–54 (v7). Marshal's Refuge is a neutral explorers' camp that both factions use.
// The road over the crater rim joins it to Coppergulch.
(function (root) {
  const D = root.D;
  D.zone('ungoro', { name: "Greenmaw Crater", faction: 'contested', music: 'greenmaw', town: 'greenmaw_town' });
  D.item('bloodpetal_sprout', { name: 'Redbloom Sprout', slot: 'quest', q: 1, icon: 'seed' });
  D.item('thunderer_horn', { name: 'Thunderer Horn', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('stomper_hide', { name: 'Stomper Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('pterrordax_egg', { name: 'Skyjaw Egg', slot: 'quest', q: 1, icon: 'seed' });
  D.item('gorishi_scent_gland', { name: 'Krizzik Scent Gland', slot: 'quest', q: 1, icon: 'venom' });
  D.item('fire_plume_ember', { name: 'Fire Plume Ember', slot: 'quest', q: 1, icon: 'firebolt' });
  D.item('tar_sample', { name: 'Tar Sample', slot: 'quest', q: 1, icon: 'venom' });
  D.item('gorilla_fang', { name: "Greenmaw Gorilla Fang", slot: 'quest', q: 1, icon: 'claw' });
  D.item('power_crystal', { name: 'Power Crystal', slot: 'quest', q: 1, icon: 'seed' });
  D.item('rex_ashil_claw', { name: "Rex Scorchtail's Claw", slot: 'quest', q: 1, icon: 'claw' });
  D.item('mosh_tooth', { name: "King Stomp's Tooth", slot: 'quest', q: 1, icon: 'tusk' });
  D.item('rexashil_ring', { name: 'Hive-Queen Band', slot: 'finger', q: 3, lvl: 52, stats: { agi: 11, sta: 10 }, icon: 'ring', sell: 8800, source: "Rex Scorchtail, the Hive Scar" });
  D.item('mosh_hide', { name: 'Thundertooth Leggings', slot: 'legs', atype: 'leather', q: 3, lvl: 54, armor: 190, stats: { agi: 18, sta: 13 }, icon: 'legs', sell: 10400 });
  D.item('mosh_gauntlets', { name: 'Thundertooth Gauntlets', slot: 'hands', atype: 'leather', q: 3, lvl: 54, armor: 132, stats: { agi: 16, sta: 11 }, icon: 'gloves', sell: 9800 });
  D.item('mosh_tooth_blade', { name: 'Tyrant Tooth Blade', slot: 'weapon', wtype: 'sword', q: 3, lvl: 54, dmg: [68, 112], speed: 2.6, stats: { str: 16, sta: 12 }, icon: 'sword', sell: 10600 });

  Object.assign(D.MOBS, {
    bloodpetal_lasher: { name: 'Redbloom Lasher', lvl: [48, 49], family: 'elemental', drops: [['trogg_stone', 0.2]], qdrops: [['bloodpetal_sprout', 0.55]] },
    ungoro_thunderer: { name: "Greenmaw Thunderer", lvl: [49, 50], family: 'beast', hpMult: 1.15, drops: [['ruined_pelt', 0.4]], qdrops: [['thunderer_horn', 0.55]] },
    ungoro_stomper: { name: "Greenmaw Stomper", lvl: [50, 51], family: 'beast', hpMult: 1.15, drops: [['ruined_pelt', 0.4]], qdrops: [['stomper_hide', 0.55]] },
    frenzied_pterrordax: { name: 'Frenzied Skyjaw', lvl: [50, 51], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['pterrordax_egg', 0.5]] },
    gorishi_wasp: { name: 'Krizzik Wasp', lvl: [50, 51], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['gorishi_scent_gland', 0.5]] },
    gorishi_reaver: { name: 'Krizzik Reaver', lvl: [51, 52], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.2]], qdrops: [['gorishi_scent_gland', 0.5]] },
    fire_plume_elemental: { name: 'Fire Plume Elemental', lvl: [51, 52], family: 'elemental', drops: [['trogg_stone', 0.3]], qdrops: [['fire_plume_ember', 0.55]] },
    lava_surger: { name: 'Lava Surger', lvl: [52, 53], family: 'elemental', hpMult: 1.15, drops: [['trogg_stone', 0.3]], qdrops: [['fire_plume_ember', 0.4], ['power_crystal', 0.25]] },
    tar_beast: { name: 'Tar Beast', lvl: [51, 52], family: 'elemental', hpMult: 1.2, drops: [['trogg_stone', 0.3]], qdrops: [['tar_sample', 0.55]] },
    tar_lurker: { name: 'Tar Lurker', lvl: [52, 53], family: 'elemental', hpMult: 1.2, drops: [['trogg_stone', 0.3]], qdrops: [['tar_sample', 0.4], ['power_crystal', 0.25]] },
    ungoro_gorilla: { name: "Greenmaw Gorilla", lvl: [52, 53], family: 'beast', hpMult: 1.15, drops: [['ruined_pelt', 0.4]], qdrops: [['gorilla_fang', 0.55]] },
    bloodpetal_trapper: { name: 'Redbloom Trapper', lvl: [53, 54], family: 'elemental', hpMult: 1.1, drops: [['trogg_stone', 0.2]], qdrops: [['bloodpetal_sprout', 0.4], ['power_crystal', 0.25]] },
    rex_ashil: { name: 'Rex Scorchtail', lvl: [52, 52], family: 'beast', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['rexashil_ring', 0.35], ['ruined_pelt', 1]], qdrops: [['rex_ashil_claw', 1]] },
    king_mosh: { name: 'King Stomp', lvl: [54, 54], family: 'beast', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'hogger', specialText: 'King Stomp charges and bites!', drops: [['ruined_pelt', 1]], qdrops: [['mosh_tooth', 1]], loot: ['mosh_hide', 'mosh_gauntlets', 'mosh_tooth_blade'] },
  });

  Object.assign(D.PLACES, {
    marshals_refuge: { name: "Marshal's Refuge", zone: "Greenmaw Crater", region: 'ungoro', scene: 'marshals_refuge', lvl: [48, 55], safe: true, inn: true, mobs: [], pool: 0, npcs: ['marshal_yeager', 'williden', 'spraggle', 'larion', 'quixxil'], vendor: 'quixxil',
      links: { golakka_hot_springs: 16, terror_run: 18, the_slithering_scar: 18, fire_plume_ridge: 16, gadgetzan: 40 }, via: { gadgetzan: 'Road over the crater rim' } },
    golakka_hot_springs: { name: 'Steamcrack Springs', zone: "Greenmaw Crater", region: 'ungoro', scene: 'golakka_hot_springs', lvl: [48, 50], mobs: [['bloodpetal_lasher', 5], ['ungoro_thunderer', 4]], pool: 10, npcs: [], links: { marshals_refuge: 16, the_marshlands: 18 } },
    terror_run: { name: 'Tooth Run', zone: "Greenmaw Crater", region: 'ungoro', scene: 'terror_run', lvl: [50, 52], mobs: [['ungoro_stomper', 5], ['frenzied_pterrordax', 4]], named: { king_mosh: 150 }, pool: 10, npcs: [], links: { marshals_refuge: 18, lakkari_tar_pits: 18 } },
    the_slithering_scar: { name: 'The Hive Scar', zone: "Greenmaw Crater", region: 'ungoro', scene: 'the_slithering_scar', lvl: [50, 52], mobs: [['gorishi_wasp', 5], ['gorishi_reaver', 4]], named: { rex_ashil: 300 }, pool: 10, npcs: [], links: { marshals_refuge: 18 } },
    fire_plume_ridge: { name: 'Smokeplume Ridge', zone: "Greenmaw Crater", region: 'ungoro', scene: 'fire_plume_ridge', lvl: [51, 53], mobs: [['fire_plume_elemental', 5], ['lava_surger', 4]], pool: 10, npcs: [], links: { marshals_refuge: 16, lakkari_tar_pits: 16 } },
    lakkari_tar_pits: { name: 'Blacktar Pits', zone: "Greenmaw Crater", region: 'ungoro', scene: 'lakkari_tar_pits', lvl: [51, 53], mobs: [['tar_beast', 5], ['tar_lurker', 4]], pool: 10, npcs: [], links: { terror_run: 18, fire_plume_ridge: 16 } },
    the_marshlands: { name: 'The Marshlands', zone: "Greenmaw Crater", region: 'ungoro', scene: 'the_marshlands', lvl: [52, 54], mobs: [['ungoro_gorilla', 5], ['bloodpetal_trapper', 4]], pool: 10, npcs: [], links: { golakka_hot_springs: 18 } },
  });
  D.PLACES.gadgetzan.links.marshals_refuge = 40; D.PLACES.gadgetzan.via.marshals_refuge = 'Road over the crater rim';

  Object.assign(D.NPCS, {
    marshal_yeager: { name: 'Marshal Stoke', title: "Marshal's Refuge" },
    williden: { name: 'Wendel Hobb', title: 'Explorer' },
    spraggle: { name: 'Pip Frockle', title: 'Explorer' },
    larion: { name: 'Lorand', title: 'Hunter' },
    quixxil: { name: 'Quibble', title: 'Supplies' },
  });

  const Q = (id, q) => { D.QUESTS[id] = q; };
  Q('tanaris_ungoro', { name: "The Crater", lvl: 48, giver: 'noggenfogger', turnin: 'marshal_yeager', text: "West of Coppergulch lies Greenmaw Crater, a jungle lost in time. Explorers at Marshal's Refuge need help. Take the road over the rim.",
    objs: [{ type: 'visit', place: 'marshals_refuge' }], reward: { money: 2200 } });
  const list = [
    ['bloodpetal', 48, 'Redbloom Sprouts', 'The plants at the hot springs bite. Bring me 8 sprouts.', 'williden', [{ type: 'collect', item: 'bloodpetal_sprout', n: 8 }], { choice: ['fam_feet51'] }],
    ['lashers', 49, 'Lashers', 'Kill 12 redbloom lashers before they reach the camp.', 'larion', [{ type: 'kill', mob: 'bloodpetal_lasher', n: 12 }], { money: 5000 }],
    ['thunderers', 49, 'Thunderers', 'The thunderers trample our tents. Kill 10 and bring me 5 horns.', 'marshal_yeager', [{ type: 'kill', mob: 'ungoro_thunderer', n: 10 }, { type: 'collect', item: 'thunderer_horn', n: 5 }], { choice: ['fam_wrist51'] }, 'bloodpetal'],
    ['stompers', 50, 'Stompers', 'The stompers of Tooth Run have thick hides. Bring me 8.', 'larion', [{ type: 'collect', item: 'stomper_hide', n: 8 }], { choice: ['fam_chest51'] }],
    ['pterrordax', 50, 'Skyjaw Eggs', 'I want 6 skyjaw eggs. For science. And omelettes.', 'spraggle', [{ type: 'collect', item: 'pterrordax_egg', n: 6 }], { money: 5200 }],
    ['terror_patrol', 51, 'Tooth Run', 'Clear the run: 10 stompers and 8 skyjaw.', 'marshal_yeager', [{ type: 'kill', mob: 'ungoro_stomper', n: 10 }, { type: 'kill', mob: 'frenzied_pterrordax', n: 8 }], { choice: ['fam_weapon51'] }, 'stompers'],
    ['gorishi', 51, 'The Krizzik Hive', 'Hiveborn wasps swarm the Hive Scar. Kill 12 wasps and bring me 5 scent glands.', 'williden', [{ type: 'kill', mob: 'gorishi_wasp', n: 12 }, { type: 'collect', item: 'gorishi_scent_gland', n: 5 }], { choice: ['fam_hands52'] }],
    ['reavers', 52, 'The Reavers', 'The reavers guard the hive. Kill 10.', 'larion', [{ type: 'kill', mob: 'gorishi_reaver', n: 10 }], { money: 5600 }, 'gorishi'],
    ['rex_ashil', 52, 'Rex Scorchtail', 'A great hiveborn, Rex Scorchtail, lurks in the Scar. It is rarely seen. Bring me its claw.', 'marshal_yeager', [{ type: 'collect', item: 'rex_ashil_claw', n: 1 }], { choice: ['fam_ring_rare55'] }],
    ['fire_plume', 52, 'Smokeplume Ridge', 'Fire elementals rise from the volcano. Kill 12 and bring me 5 embers.', 'spraggle', [{ type: 'kill', mob: 'fire_plume_elemental', n: 12 }, { type: 'collect', item: 'fire_plume_ember', n: 5 }], { choice: ['fam_back52'] }],
    ['lava_surgers', 53, 'Lava Surgers', 'Kill 10 lava surgers on the ridge.', 'larion', [{ type: 'kill', mob: 'lava_surger', n: 10 }], { money: 5900 }, 'fire_plume'],
    ['tar_beasts', 52, 'Tar Beasts', 'Things made of tar crawl out of the Blacktar pits. Kill 12 and bring me 6 samples.', 'williden', [{ type: 'kill', mob: 'tar_beast', n: 12 }, { type: 'collect', item: 'tar_sample', n: 6 }], { choice: ['fam_legs52'] }],
    ['tar_lurkers', 53, 'Tar Lurkers', 'The lurkers are worse. Kill 10.', 'marshal_yeager', [{ type: 'kill', mob: 'tar_lurker', n: 10 }], { choice: ['fam_waist53'] }, 'tar_beasts'],
    ['power_crystals', 53, 'Power Crystals', 'The crater grows strange crystals. The creatures here swallow them. Bring me 6.', 'spraggle', [{ type: 'collect', item: 'power_crystal', n: 6 }], { choice: ['fam_back_rare55'] }],
    ['gorillas', 53, 'Gorillas of the Marshlands', 'Big apes in the marshes. Kill 12 and bring me 6 fangs.', 'larion', [{ type: 'kill', mob: 'ungoro_gorilla', n: 12 }, { type: 'collect', item: 'gorilla_fang', n: 6 }], { choice: ['fam_chest53'] }],
    ['trappers', 54, 'Redbloom Trappers', 'Kill 10 trappers in the marshlands.', 'williden', [{ type: 'kill', mob: 'bloodpetal_trapper', n: 10 }], { choice: ['fam_weapon54'] }, 'gorillas'],
    ['springs_patrol', 50, 'The Hot Springs', 'Keep the springs clear: 8 lashers and 6 thunderers.', 'spraggle', [{ type: 'kill', mob: 'bloodpetal_lasher', n: 8 }, { type: 'kill', mob: 'ungoro_thunderer', n: 6 }], { money: 5300 }, 'thunderers'],
    ['hive_patrol', 52, 'Back to the Hive', 'Another push into the Scar: 8 wasps and 6 reavers.', 'marshal_yeager', [{ type: 'kill', mob: 'gorishi_wasp', n: 8 }, { type: 'kill', mob: 'gorishi_reaver', n: 6 }], { choice: ['fam_feet52'] }, 'reavers'],
    ['ridge_patrol', 54, 'The Burning Ridge', 'Break the fire: 8 elementals and 6 surgers.', 'larion', [{ type: 'kill', mob: 'fire_plume_elemental', n: 8 }, { type: 'kill', mob: 'lava_surger', n: 6 }], { money: 6200 }, 'lava_surgers'],
    ['marsh_patrol', 54, 'Marshland Patrol', '8 gorillas and 6 trappers.', 'spraggle', [{ type: 'kill', mob: 'ungoro_gorilla', n: 8 }, { type: 'kill', mob: 'bloodpetal_trapper', n: 6 }], { choice: ['fam_hands54'] }, 'trappers'],
    ['king_mosh', 54, 'Wanted: King Stomp', 'The biggest thundertooth of Tooth Run, King Stomp, ate my best tracker. Bring me his tooth. Take friends.', 'larion', [{ type: 'collect', item: 'mosh_tooth', n: 1 }], { choice: ['fam_weapon54'] }],
  ];
  for (const [id, lvl, name, text, npc, objs, reward, pre] of list) Q('ug_' + id, Object.assign({ name, lvl, giver: npc, turnin: npc, text, objs, reward }, pre ? { pre: ['ug_' + pre] } : {}));
  D.QUESTS.ug_king_mosh.group = 3;
  Object.assign(D.ACTIVITIES, {
    king_mosh: { name: 'Wanted: King Stomp', where: 'terror_run', size: 3, minLvl: 51, maxLvl: 54, desc: "Open-world elite in Greenmaw. 3 players.", boss: 'king_mosh', pulls: [{ scene: 'terror_run', label: 'The run', mobs: ['ungoro_stomper', 'ungoro_stomper'] }, { scene: 'terror_run', label: 'The run', mobs: ['frenzied_pterrordax', 'ungoro_stomper'] }, { scene: 'terror_run', label: 'King Stomp', mobs: ['king_mosh'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
