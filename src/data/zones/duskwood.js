// Duskwood and Darkshire: Alliance, levels 24–30 (v4).
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// A forest in endless night: worgen in the woods, the dead rising on Raven Hill, and Stitches on the road.
(function (root) {
  const D = root.D;
  D.zone('duskwood', { name: 'Duskwood', faction: 'alliance' });
  // quest items
  D.item('worgen_fang', { name: 'Nightbane Fang', slot: 'quest', q: 1, icon: 'claw' });
  D.item('shadow_weaver_charm', { name: 'Shadow Weaver Charm', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('recluse_silk', { name: 'Recluse Silk', slot: 'quest', q: 1, icon: 'venom' });
  D.item('venom_gland', { name: 'Venom Web Gland', slot: 'quest', q: 1, icon: 'venom' });
  D.item('bone_fragment', { name: 'Skeletal Fragment', slot: 'quest', q: 1, icon: 'dust' });
  D.item('grave_moss', { name: 'Grave Moss', slot: 'quest', q: 1, icon: 'moss' });
  D.item('ghoul_rib', { name: 'Ghoul Rib', slot: 'quest', q: 1, icon: 'rib' });
  D.item('rotting_heart', { name: 'Rotting Heart', slot: 'quest', q: 1, icon: 'zombie_brain' });
  D.item('ogre_tooth', { name: 'Splinter Fist Tooth', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('taskmaster_whip', { name: "Taskmaster's Whip", slot: 'quest', q: 1, icon: 'belt' });
  D.item('dark_runner_pelt', { name: 'Dark Runner Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('vile_fang_claw', { name: 'Vile Fang Claw', slot: 'quest', q: 1, icon: 'claw' });
  D.item('naraxis_fang', { name: "Naraxis's Fang", slot: 'quest', q: 1, icon: 'claw' });
  D.item('mor_ladim_skull', { name: "Mor'Ladim's Skull", slot: 'quest', q: 1, icon: 'head' });
  D.item('stitches_cleaver', { name: "Stitches' Cleaver", slot: 'quest', q: 1, icon: 'axe' });
  // named and elite drops
  D.item('naraxis_legs', { name: 'Silk-Spun Leggings', slot: 'legs', atype: 'cloth', q: 3, lvl: 26, armor: 50, stats: { int: 8, spi: 6 }, sp: 10, icon: 'legs', sell: 3000, source: 'Naraxis, the Hushed Bank' });
  D.item('mor_ladim_blade', { name: "Mor'Ladim's Greatsword", slot: 'weapon', wtype: 'sword', q: 3, lvl: 29, dmg: [37, 62], speed: 2.6, stats: { str: 9, sta: 6 }, icon: 'sword', sell: 3800, source: "Mor'Ladim, Raven Hill Cemetery" });
  D.item('stitched_vest', { name: 'Stitched Hide Vest', slot: 'chest', atype: 'leather', q: 3, lvl: 30, armor: 150, stats: { agi: 11, sta: 9 }, icon: 'chest_leather', sell: 4200 });
  D.item('stitches_hook', { name: "Abomination's Hook", slot: 'weapon', wtype: 'axe', q: 3, lvl: 30, dmg: [40, 66], speed: 2.7, stats: { str: 10, sta: 7 }, icon: 'axe', sell: 4300 });
  D.item('embalmers_robe', { name: "Embalmer's Robe", slot: 'chest', atype: 'cloth', q: 3, lvl: 30, armor: 66, stats: { int: 11, spi: 8 }, sp: 14, icon: 'chest_cloth', sell: 4200 });

  // creatures
  Object.assign(D.MOBS, {
    nightbane_worgen: { name: 'Nightbane Worgen', lvl: [24, 25], family: 'humanoid', drops: [['linen_cloth', 0.25], ['thieves_coin', 0.3]], qdrops: [['worgen_fang', 0.5]], aggro: 'The night... belongs... to us!' },
    nightbane_shadow_weaver: { name: 'Nightbane Shadow Weaver', lvl: [25, 26], family: 'humanoid', drops: [['linen_cloth', 0.3], ['thieves_coin', 0.3]], qdrops: [['shadow_weaver_charm', 0.5], ['worgen_fang', 0.3]], aggro: 'Darkness hungers!' },
    green_recluse: { name: 'Green Recluse', lvl: [24, 25], family: 'beast', drops: [['ruined_pelt', 0.25]], qdrops: [['recluse_silk', 0.55]] },
    venom_web_spider: { name: 'Venom Web Spider', lvl: [25, 26], family: 'beast', drops: [['ruined_pelt', 0.25]], qdrops: [['venom_gland', 0.55]] },
    skeletal_warrior: { name: 'Skeletal Warrior', lvl: [26, 27], family: 'undead', drops: [['thieves_coin', 0.3]], qdrops: [['bone_fragment', 0.55]] },
    skeletal_mage: { name: 'Skeletal Mage', lvl: [27, 28], family: 'undead', drops: [['thieves_coin', 0.3], ['linen_cloth', 0.2]], qdrops: [['bone_fragment', 0.4], ['grave_moss', 0.4]] },
    plague_spreader: { name: 'Plague Spreader', lvl: [26, 27], family: 'undead', drops: [['rotting_flesh', 0.4]], qdrops: [['ghoul_rib', 0.55]] },
    rotted_one: { name: 'Rotted One', lvl: [27, 28], family: 'undead', hpMult: 1.15, drops: [['rotting_flesh', 0.5]], qdrops: [['rotting_heart', 0.5]] },
    splinter_fist_warrior: { name: 'Splinter Fist Warrior', lvl: [27, 28], family: 'giant', hpMult: 1.15, drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['ogre_tooth', 0.55]], aggro: 'Me smash you flat!' },
    splinter_fist_taskmaster: { name: 'Splinter Fist Taskmaster', lvl: [28, 29], family: 'giant', hpMult: 1.2, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['taskmaster_whip', 0.5], ['ogre_tooth', 0.3]], aggro: 'Get back to work! After me kill this one.' },
    nightbane_dark_runner: { name: 'Nightbane Dark Runner', lvl: [28, 29], family: 'humanoid', drops: [['linen_cloth', 0.3], ['thieves_coin', 0.35]], qdrops: [['dark_runner_pelt', 0.5]], aggro: 'Run, little one!' },
    nightbane_vile_fang: { name: 'Nightbane Vile Fang', lvl: [29, 30], family: 'humanoid', hpMult: 1.15, drops: [['linen_cloth', 0.3], ['thieves_coin', 0.4]], qdrops: [['vile_fang_claw', 0.5]], aggro: 'Your blood smells sweet!' },
    naraxis: { name: 'Naraxis', lvl: [26, 26], family: 'beast', named: true, hpMult: 2, dmgMult: 1.3, drops: [['naraxis_legs', 0.35], ['ruined_pelt', 1]], qdrops: [['naraxis_fang', 1]] },
    mor_ladim: { name: "Mor'Ladim", lvl: [29, 29], family: 'undead', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['mor_ladim_blade', 0.35], ['thieves_coin', 1]], qdrops: [['mor_ladim_skull', 1]], aggro: 'Who... disturbs... my rest?' },
    stitches: { name: 'Stitches', lvl: [30, 30], family: 'undead', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'slam', drops: [['rotting_flesh', 1]], qdrops: [['stitches_cleaver', 1]], aggro: 'Stitches... hungry...', loot: ['stitched_vest', 'stitches_hook', 'embalmers_robe'] },
  });

  // places
  Object.assign(D.PLACES, {
    darkshire: { name: 'Darkshire', zone: 'Duskwood', region: 'duskwood', scene: 'darkshire', lvl: [24, 30], safe: true, inn: true, mobs: [], pool: 0, npcs: ['ebonlocke', 'althea', 'abercrombie', 'madame_eva', 'sirra', 'trelayne', 'gavin'], vendor: 'trelayne', gearVendor: 'gavin',
      links: { brightwood_grove: 16, the_hushed_bank: 18, tranquil_gardens: 18, lakeshire: 30, stormwind_gate: 45 }, via: { stormwind_gate: 'Gryphon' } },
    brightwood_grove: { name: 'Brightwood Grove', zone: 'Duskwood', region: 'duskwood', scene: 'brightwood_grove', lvl: [24, 26], mobs: [['nightbane_worgen', 5], ['nightbane_shadow_weaver', 4]], pool: 10, npcs: [], links: { darkshire: 16, raven_hill_cemetery: 18 } },
    the_hushed_bank: { name: 'The Hushed Bank', zone: 'Duskwood', region: 'duskwood', scene: 'the_hushed_bank', lvl: [24, 26], mobs: [['green_recluse', 5], ['venom_web_spider', 4]], named: { naraxis: 300 }, pool: 10, npcs: [], links: { darkshire: 18, vulgol_ogre_mound: 16 } },
    raven_hill_cemetery: { name: 'Raven Hill Cemetery', zone: 'Duskwood', region: 'duskwood', scene: 'raven_hill_cemetery', lvl: [26, 28], mobs: [['skeletal_warrior', 5], ['skeletal_mage', 4]], named: { mor_ladim: 300 }, pool: 10, npcs: [], links: { brightwood_grove: 18 } },
    tranquil_gardens: { name: 'Tranquil Gardens Cemetery', zone: 'Duskwood', region: 'duskwood', scene: 'tranquil_gardens', lvl: [26, 28], mobs: [['plague_spreader', 5], ['rotted_one', 4]], named: { stitches: 150 }, pool: 10, npcs: [], links: { darkshire: 18, the_rotting_orchard: 18 } },
    vulgol_ogre_mound: { name: "Vul'Gol Ogre Mound", zone: 'Duskwood', region: 'duskwood', scene: 'vulgol_ogre_mound', lvl: [27, 29], mobs: [['splinter_fist_warrior', 5], ['splinter_fist_taskmaster', 4]], pool: 10, npcs: [], links: { the_hushed_bank: 16, the_rotting_orchard: 16 } },
    the_rotting_orchard: { name: 'The Rotting Orchard', zone: 'Duskwood', region: 'duskwood', scene: 'the_rotting_orchard', lvl: [28, 30], mobs: [['nightbane_dark_runner', 5], ['nightbane_vile_fang', 4]], pool: 10, npcs: [], links: { tranquil_gardens: 18, vulgol_ogre_mound: 16 } },
  });
  D.PLACES.lakeshire.links.darkshire = 30;
  D.PLACES.stormwind_gate.links.darkshire = 45; D.PLACES.stormwind_gate.via.darkshire = 'Gryphon';

  // people
  Object.assign(D.NPCS, {
    ebonlocke: { name: 'Lord Ello Ebonlocke', title: 'Mayor of Darkshire' },
    althea: { name: 'Commander Althea Ebonlocke', title: 'Night Watch' },
    abercrombie: { name: 'Abercrombie', title: 'Old Hermit' },
    madame_eva: { name: 'Madame Eva', title: 'Fortune Teller' },
    sirra: { name: "Sirra Von'Indi", title: 'Historian' },
    trelayne: { name: 'Innkeeper Trelayne', title: 'Innkeeper' },
    gavin: { name: 'Gavin Gnarltree', title: 'Weaponsmith' },
  });

  // quests (levels 24–30)
  Object.assign(D.QUESTS, {
    lakeshire_darkshire: { name: 'The Night Watch', lvl: 24, giver: 'marris', turnin: 'althea', text: 'Darkshire, south-west of here, has a Night Watch of farmers with pitchforks. They need real fighters. Report to Commander Althea.',
      objs: [{ type: 'visit', place: 'darkshire' }], reward: { money: 800 } },
    worgen_fangs: { name: 'The Nightbane', lvl: 24, giver: 'althea', turnin: 'althea', text: 'Worgen stalk Brightwood Grove. Kill 12 Nightbane worgen.',
      objs: [{ type: 'kill', mob: 'nightbane_worgen', n: 12 }], reward: { choice: ['fam_feet27'] } },
    fang_bounty: { name: 'Worgen Bounty', lvl: 24, giver: 'ebonlocke', turnin: 'ebonlocke', text: 'The town pays for every worgen fang. Bring me 10.',
      objs: [{ type: 'collect', item: 'worgen_fang', n: 10 }], reward: { money: 1300 } },
    shadow_weavers: { name: 'The Shadow Weavers', lvl: 25, giver: 'sirra', turnin: 'sirra', pre: ['worgen_fangs'], text: 'The worgen casters wear charms I have seen in the old books. Kill 8 shadow weavers and bring me 5 charms.',
      objs: [{ type: 'kill', mob: 'nightbane_shadow_weaver', n: 8 }, { type: 'collect', item: 'shadow_weaver_charm', n: 5 }], reward: { choice: ['fam_wrist27'] } },
    recluse_silk_q: { name: 'Web of the Hushed Bank', lvl: 24, giver: 'trelayne', turnin: 'trelayne', text: 'Spider silk makes the best bandage thread. The recluses by the river have plenty. Bring me 8 lengths.',
      objs: [{ type: 'collect', item: 'recluse_silk', n: 8 }], reward: { money: 1200 } },
    venom_glands: { name: 'Venom for the Watch', lvl: 25, giver: 'madame_eva', turnin: 'madame_eva', text: 'The venom web spiders carry glands I need for a seeing potion. Bring me 6.',
      objs: [{ type: 'collect', item: 'venom_gland', n: 6 }], reward: { choice: ['fam_back28'] } },
    spider_cull: { name: 'Clear the Riverbank', lvl: 25, giver: 'althea', turnin: 'althea', pre: ['recluse_silk_q'], text: 'The spiders grow bolder. Kill 10 venom web spiders.',
      objs: [{ type: 'kill', mob: 'venom_web_spider', n: 10 }], reward: { money: 1300 } },
    naraxis_q: { name: 'Naraxis', lvl: 26, giver: 'trelayne', turnin: 'trelayne', text: 'A spider as big as a cart lives on the Hushed Bank. Naraxis, the fishermen call it. It is rarely seen. Bring me its fang.',
      objs: [{ type: 'collect', item: 'naraxis_fang', n: 1 }], reward: { choice: ['fam_ring_rare30'] } },
    raven_hill_scout: { name: 'Raven Hill', lvl: 26, giver: 'sirra', turnin: 'sirra', text: 'The dead walk in Raven Hill Cemetery, west past Brightwood. Go and see how bad it is.',
      objs: [{ type: 'visit', place: 'raven_hill_cemetery' }], reward: { money: 900 } },
    skeletal_warriors: { name: 'The Restless Dead', lvl: 26, giver: 'althea', turnin: 'althea', pre: ['raven_hill_scout'], text: 'Put the dead back in their graves. Kill 12 skeletal warriors.',
      objs: [{ type: 'kill', mob: 'skeletal_warrior', n: 12 }], reward: { choice: ['fam_weapon27'] } },
    bone_fragments: { name: 'Bones of Raven Hill', lvl: 26, giver: 'madame_eva', turnin: 'madame_eva', pre: ['raven_hill_scout'], text: 'The bones will tell me who raises them. Bring me 10 fragments.',
      objs: [{ type: 'collect', item: 'bone_fragment', n: 10 }], reward: { money: 1400 } },
    skeletal_mages: { name: 'The Necromancers', lvl: 27, giver: 'sirra', turnin: 'sirra', pre: ['skeletal_warriors'], text: 'Skeletal mages keep the dead rising. Kill 10 and bring me 5 bunches of grave moss.',
      objs: [{ type: 'kill', mob: 'skeletal_mage', n: 10 }, { type: 'collect', item: 'grave_moss', n: 5 }], reward: { choice: ['fam_chest28'] } },
    mor_ladim_q: { name: "The Legend of Mor'Ladim", lvl: 29, giver: 'sirra', turnin: 'sirra', text: "The books tell of Mor'Ladim, a champion murdered long ago who walks Raven Hill still. He is rarely seen. Bring me his skull and let him rest.",
      objs: [{ type: 'collect', item: 'mor_ladim_skull', n: 1 }], reward: { choice: ['fam_back_rare30'] } },
    tranquil_scout: { name: 'Tranquil Gardens', lvl: 26, giver: 'abercrombie', turnin: 'abercrombie', text: 'Heh. The old cemetery east of town is quiet. Too quiet, some say. Go and look for me, would you?',
      objs: [{ type: 'visit', place: 'tranquil_gardens' }], reward: { money: 900 } },
    ghoul_ribs: { name: 'Ribs for Abercrombie', lvl: 27, giver: 'abercrombie', turnin: 'abercrombie', pre: ['tranquil_scout'], text: 'I need ghoul ribs for a little project of mine. Eight of them. Do not ask what for.',
      objs: [{ type: 'collect', item: 'ghoul_rib', n: 8 }], reward: { money: 1500 } },
    plague_spreaders: { name: 'The Plague Spreaders', lvl: 27, giver: 'althea', turnin: 'althea', pre: ['tranquil_scout'], text: 'Ghouls from Tranquil Gardens carry sickness into town. Kill 12.',
      objs: [{ type: 'kill', mob: 'plague_spreader', n: 12 }], reward: { choice: ['fam_hands29'] } },
    rotting_hearts: { name: 'A Heart for Abercrombie', lvl: 28, giver: 'abercrombie', turnin: 'abercrombie', pre: ['ghoul_ribs'], text: 'One more thing. The rotted ones have strong hearts. Bring me 5. My creation is nearly ready.',
      objs: [{ type: 'collect', item: 'rotting_heart', n: 5 }], reward: { choice: ['fam_waist29'] } },
    rotted_ones: { name: 'The Rotted Ones', lvl: 28, giver: 'ebonlocke', turnin: 'ebonlocke', pre: ['plague_spreaders'], text: 'The rotted ones shamble towards the farms. Kill 10.',
      objs: [{ type: 'kill', mob: 'rotted_one', n: 10 }], reward: { money: 1600 } },
    vulgol_scout: { name: "Vul'Gol", lvl: 27, giver: 'althea', turnin: 'althea', text: 'Ogres have built a mound south of the river. Scout it.',
      objs: [{ type: 'visit', place: 'vulgol_ogre_mound' }], reward: { money: 900 } },
    splinter_fist: { name: 'The Splinter Fist', lvl: 28, giver: 'althea', turnin: 'althea', pre: ['vulgol_scout'], text: 'The Splinter Fist ogres raid our woodcutters. Kill 12 warriors.',
      objs: [{ type: 'kill', mob: 'splinter_fist_warrior', n: 12 }], reward: { choice: ['fam_legs28'] } },
    ogre_teeth: { name: 'Ogre Teeth', lvl: 28, giver: 'gavin', turnin: 'gavin', text: 'Ogre teeth make fine hilts. Bring me 10.',
      objs: [{ type: 'collect', item: 'ogre_tooth', n: 10 }], reward: { money: 1600 } },
    taskmasters: { name: 'The Taskmasters', lvl: 29, giver: 'ebonlocke', turnin: 'ebonlocke', pre: ['splinter_fist'], text: 'The taskmasters drive the ogres to raid. Kill 10 and bring me 4 of their whips.',
      objs: [{ type: 'kill', mob: 'splinter_fist_taskmaster', n: 10 }, { type: 'collect', item: 'taskmaster_whip', n: 4 }], reward: { choice: ['fam_weapon30'] } },
    orchard_scout: { name: 'The Rotting Orchard', lvl: 28, giver: 'madame_eva', turnin: 'madame_eva', text: 'The cards show me an orchard where nothing grows, and wolves that walk like men. It lies south of Tranquil Gardens. Go.',
      objs: [{ type: 'visit', place: 'the_rotting_orchard' }], reward: { money: 1000 } },
    dark_runners: { name: 'The Dark Runners', lvl: 29, giver: 'althea', turnin: 'althea', pre: ['orchard_scout'], text: 'The dark runners hunt our patrols at night. Kill 12.',
      objs: [{ type: 'kill', mob: 'nightbane_dark_runner', n: 12 }], reward: { choice: ['fam_chest28'] } },
    dark_runner_pelts: { name: 'Pelts for the Watch', lvl: 29, giver: 'trelayne', turnin: 'trelayne', text: 'The Night Watch needs warm cloaks. Dark runner pelts will do. Bring me 8.',
      objs: [{ type: 'collect', item: 'dark_runner_pelt', n: 8 }], reward: { money: 1700 } },
    vile_fangs: { name: 'The Vile Fangs', lvl: 30, giver: 'ebonlocke', turnin: 'ebonlocke', pre: ['dark_runners'], text: 'The vile fangs lead the pack. Kill 10 and bring me 5 of their claws.',
      objs: [{ type: 'kill', mob: 'nightbane_vile_fang', n: 10 }, { type: 'collect', item: 'vile_fang_claw', n: 5 }], reward: { choice: ['fam_hands29'] } },
    eva_crystal_q: { name: 'The Seeing Stone', lvl: 25, giver: 'madame_eva', turnin: 'madame_eva', pre: ['venom_glands'], text: 'My crystal has gone dark since the spiders came so close to town. Kill 8 recluses and the visions will return.',
      objs: [{ type: 'kill', mob: 'green_recluse', n: 8 }], reward: { money: 1300 } },
    brightwood_patrol: { name: 'Night Patrol', lvl: 26, giver: 'althea', turnin: 'althea', pre: ['shadow_weavers'], text: 'Walk the Brightwood road with the watch: 8 worgen and 6 shadow weavers.',
      objs: [{ type: 'kill', mob: 'nightbane_worgen', n: 8 }, { type: 'kill', mob: 'nightbane_shadow_weaver', n: 6 }], reward: { money: 1400 } },
    raven_hill_patrol: { name: 'Keep Them Down', lvl: 28, giver: 'sirra', turnin: 'sirra', pre: ['skeletal_mages'], text: 'The dead keep rising. Another 8 warriors and 6 mages.',
      objs: [{ type: 'kill', mob: 'skeletal_warrior', n: 8 }, { type: 'kill', mob: 'skeletal_mage', n: 6 }], reward: { choice: ['fam_feet27'] } },
    ogre_patrol: { name: 'Push Back the Ogres', lvl: 29, giver: 'gavin', turnin: 'gavin', pre: ['ogre_teeth'], text: 'Keep the ogres off my woodcutters: 8 warriors and 6 taskmasters.',
      objs: [{ type: 'kill', mob: 'splinter_fist_warrior', n: 8 }, { type: 'kill', mob: 'splinter_fist_taskmaster', n: 6 }], reward: { money: 1800 } },
    orchard_patrol: { name: 'The Last Harvest', lvl: 30, giver: 'madame_eva', turnin: 'madame_eva', pre: ['dark_runner_pelts'], text: 'The cards say the orchard will be quiet only after 10 more dark runners fall.',
      objs: [{ type: 'kill', mob: 'nightbane_dark_runner', n: 10 }], reward: { choice: ['fam_waist29'] } },
    wanted_stitches: { name: 'Wanted: Stitches', lvl: 30, giver: 'althea', turnin: 'althea', pre: ['rotting_hearts'], group: 3, text: "Abercrombie's 'project' walks the road now. An abomination, stitched from the parts you brought him. Stitches. Bring me its cleaver. Take friends.",
      objs: [{ type: 'collect', item: 'stitches_cleaver', n: 1 }], reward: { choice: ['fam_weapon30'] } },
  });

  // group finder: the open-world elite
  Object.assign(D.ACTIVITIES, {
    stitches: { name: 'Wanted: Stitches', where: 'tranquil_gardens', size: 3, minLvl: 27, maxLvl: 30, desc: 'Open-world elite in Duskwood. 3 players.', boss: 'stitches', pulls: [{ scene: 'tranquil_gardens', label: 'Ghoul pen', mobs: ['plague_spreader', 'plague_spreader'] }, { scene: 'tranquil_gardens', label: 'Ghoul pen', mobs: ['rotted_one', 'plague_spreader'] }, { scene: 'tranquil_gardens', label: 'Stitches', mobs: ['stitches'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
