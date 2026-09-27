// The Barrens and the Crossroads: Horde, levels 10–16.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('barrens', { name: 'The Barrens', faction: 'horde' });
  // items
  D.item('zhevra_hoof', { name: 'Zhevra Hoof', slot: 'quest', q: 1, icon: 'claw' });
  D.item('lashtail_claw', { name: 'Lashtail Raptor Claw', slot: 'quest', q: 1, icon: 'claw' });
  D.item('razormane_tusk', { name: 'Razormane Tusk', slot: 'quest', q: 1, icon: 'quilboar_tusk' });
  D.item('snapjaw_shell', { name: 'Snapjaw Shell Fragment', slot: 'quest', q: 1, icon: 'chest_box' });
  D.item('swiftmane_hoof', { name: "Swiftmane's Hoof", slot: 'quest', q: 1, icon: 'claw' });
  D.item('kolkar_whip', { name: 'Kolkar Whip', slot: 'quest', q: 1, icon: 'belt' });
  D.item('swiftmane_boots', { name: 'Swiftmane Striders', slot: 'feet', q: 3, lvl: 14, armor: 42, stats: { agi: 5, sta: 3 }, icon: 'boots', sell: 900, source: 'Swiftmane, the Forgotten Pools' });
  D.item('kodobane_axe', { name: "Kodobane's Axe", slot: 'weapon', wtype: 'axe', q: 3, lvl: 15, dmg: [19, 30], speed: 2.5, stats: { str: 5, agi: 3 }, icon: 'axe', sell: 1300, source: 'Barak Kodobane, the Stagnant Oasis' });
  D.item('storm_charm', { name: 'Kolkar Storm Charm', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('stormsnout_hide', { name: 'Stormsnout Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('lizard_steak', { name: 'Thunder Lizard Steak', slot: 'quest', q: 1, icon: 'meat' });

  // creatures
  Object.assign(D.MOBS, {
    kolkar_drudge: { name: 'Kolkar Drudge', lvl: [10, 11], family: 'humanoid', drops: [['linen_cloth', 0.35], ['ruined_pelt', 0.25]], aggro: 'The Kolkar will crush you!' },
    kolkar_wrangler: { name: 'Kolkar Wrangler', lvl: [12, 13], family: 'humanoid', drops: [['linen_cloth', 0.35], ['thieves_coin', 0.35]], qdrops: [['kolkar_whip', 0.5]], aggro: 'Another beast for the herd!' },
    barak_kodobane: { name: 'Barak Kodobane', lvl: [15, 15], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['kodobane_axe', 0.35], ['thieves_coin', 1]], aggro: 'The plains belong to the Kolkar!' },
    zhevra_runner: { name: 'Zhevra Runner', lvl: [10, 11], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['zhevra_hoof', 0.55]] },
    swiftmane: { name: 'Swiftmane', lvl: [14, 14], family: 'beast', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['swiftmane_boots', 0.35], ['ruined_pelt', 1]], qdrops: [['swiftmane_hoof', 1]] },
    savannah_prowler: { name: 'Savannah Prowler', lvl: [12, 13], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    sunscale_lashtail: { name: 'Sunscale Lashtail', lvl: [11, 12], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['lashtail_claw', 0.55]] },
    oasis_snapjaw: { name: 'Oasis Snapjaw', lvl: [13, 14], family: 'beast', hpMult: 1.2, drops: [['ruined_pelt', 0.3]], qdrops: [['snapjaw_shell', 0.55]] },
    razormane_quilboar: { name: 'Razormane Quilboar', lvl: [11, 12], family: 'humanoid', drops: [['quilboar_tusk', 0.35], ['linen_cloth', 0.3]], qdrops: [['razormane_tusk', 0.5]], aggro: 'Razormane! Kill!' },
    razormane_thornweaver: { name: 'Razormane Thornweaver', lvl: [13, 14], family: 'humanoid', drops: [['quilboar_tusk', 0.35], ['linen_cloth', 0.35]], qdrops: [['razormane_tusk', 0.5]], aggro: 'The thorns hunger!' },
    kolkar_stormer: { name: 'Kolkar Stormer', lvl: [14, 15], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.35]], qdrops: [['storm_charm', 0.55]], aggro: 'The storm answers the Kolkar!' },
    stormsnout: { name: 'Stormsnout', lvl: [14, 15], family: 'beast', hpMult: 1.2, drops: [['ruined_pelt', 0.4]], qdrops: [['stormsnout_hide', 0.5], ['lizard_steak', 0.55]] },
  });

  // places
  Object.assign(D.PLACES, {
    far_watch: { name: 'Far Watch Post', zone: 'The Barrens', region: 'barrens', scene: 'far_watch', lvl: [10, 12], mobs: [['kolkar_drudge', 4], ['zhevra_runner', 4], ['razormane_quilboar', 3]], pool: 10, npcs: ['kargal'], links: { sludge_fen: 18, razor_hill: 25, crossroads: 20, razormane_grounds: 16 } },
    crossroads: { name: 'The Crossroads', zone: 'The Barrens', region: 'barrens', scene: 'crossroads', lvl: [10, 15], safe: true, inn: true, mobs: [], pool: 0, npcs: ['thork', 'sergra', 'helbrim', 'zargh', 'boorand', 'nargal'], vendor: 'boorand', gearVendor: 'nargal', links: { sludge_fen: 20, lushwater_oasis: 20, baeldun_digsite: 24, far_watch: 20, forgotten_pools: 16, stagnant_oasis: 20, razormane_grounds: 18, bloodhoof_village: 35, orgrimmar: 40, thunder_bluff: 40, thorn_hill: 22 }, via: { orgrimmar: 'Wind rider', thunder_bluff: 'Wind rider' } },
    forgotten_pools: { name: 'The Forgotten Pools', zone: 'The Barrens', region: 'barrens', scene: 'forgotten_pools', lvl: [11, 13], mobs: [['sunscale_lashtail', 5], ['zhevra_runner', 3], ['savannah_prowler', 3]], named: { swiftmane: 300 }, pool: 10, npcs: [], links: { crossroads: 16 } },
    stagnant_oasis: { name: 'The Stagnant Oasis', zone: 'The Barrens', region: 'barrens', scene: 'stagnant_oasis', lvl: [12, 15], mobs: [['kolkar_wrangler', 5], ['oasis_snapjaw', 4], ['kolkar_drudge', 2]], named: { barak_kodobane: 240 }, pool: 10, npcs: [], links: { lushwater_oasis: 16, crossroads: 20, thorn_hill: 16 } },
    razormane_grounds: { name: 'Razormane Grounds', zone: 'The Barrens', region: 'barrens', scene: 'razormane_grounds', lvl: [11, 14], mobs: [['razormane_quilboar', 5], ['razormane_thornweaver', 4]], pool: 10, npcs: [], links: { crossroads: 18, far_watch: 16 } },
    thorn_hill: { name: 'Thorn Hill', zone: 'The Barrens', region: 'barrens', scene: 'thorn_hill', lvl: [14, 16], mobs: [['kolkar_stormer', 5], ['stormsnout', 4]], pool: 10, npcs: [], links: { baeldun_digsite: 18, crossroads: 22, stagnant_oasis: 16 } },
  });

  // people
  Object.assign(D.NPCS, {
    thork: { name: 'Thork', title: 'The Crossroads' },
    sergra: { name: 'Sergra Darkthorn', title: 'Hunter' },
    helbrim: { name: 'Apothecary Helbrim', title: 'Apothecary' },
    zargh: { name: 'Zargh', title: 'Cook' },
    boorand: { name: 'Innkeeper Boorand Plainswind', title: 'Innkeeper' },
    nargal: { name: 'Nargal Deatheye', title: 'Weaponsmith' },
    kargal: { name: 'Kargal Battlescar', title: 'Far Watch Post' },
  });

  // quests
  Object.assign(D.QUESTS, {
    disrupt_attacks: { name: 'Disrupt the Attacks', lvl: 10, giver: 'thork', turnin: 'thork', text: 'Kolkar centaurs raid our supply lines from the north. Kill 8 drudges.',
      objs: [{ type: 'kill', mob: 'kolkar_drudge', n: 8 }], reward: { choice: ['fam_feet12'] } },
    zhevra_runners: { name: 'Zhevra Runners', lvl: 10, giver: 'boorand', turnin: 'boorand', text: 'The zhevra trample our tents at night. Hunt 8.',
      objs: [{ type: 'kill', mob: 'zhevra_runner', n: 8 }], reward: { money: 250 } },
    zhevra_hooves: { name: 'Zhevra Hooves', lvl: 10, giver: 'zargh', turnin: 'zargh', text: 'Zhevra hoof jelly. Nobody likes it, everybody eats it. Bring me 6 hooves.',
      objs: [{ type: 'collect', item: 'zhevra_hoof', n: 6 }], reward: { money: 260 } },
    raptor_thieves: { name: 'Raptor Thieves', lvl: 11, giver: 'sergra', turnin: 'sergra', text: 'Sunscale raptors steal from our caravans. Kill 10 lashtails at the Forgotten Pools.',
      objs: [{ type: 'kill', mob: 'sunscale_lashtail', n: 10 }], reward: { choice: ['fam_wrist12'] } },
    razormane_raid: { name: 'The Razormane', lvl: 11, giver: 'kargal', turnin: 'kargal', text: 'The Razormane quilboar grow bolder near Far Watch. Kill 10.',
      objs: [{ type: 'kill', mob: 'razormane_quilboar', n: 10 }], reward: { choice: ['fam_chest13'] } },
    lashtail_claws: { name: 'Lashtail Claws', lvl: 12, giver: 'helbrim', turnin: 'helbrim', text: 'Raptor claw is useful to an apothecary. Bring me 6 lashtail claws.',
      objs: [{ type: 'collect', item: 'lashtail_claw', n: 6 }], reward: { choice: ['fam_hands14'] } },
    razormane_tusks: { name: 'Razormane Tusks', lvl: 12, giver: 'nargal', turnin: 'nargal', text: 'Quilboar tusk makes a fine hilt. Bring me 8 from the Razormane and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'razormane_tusk', n: 8 }], reward: { choice: ['fam_weapon12'] } },
    savannah_prowlers: { name: 'Savannah Prowlers', lvl: 12, giver: 'kargal', turnin: 'kargal', text: 'Prowlers stalk the road to Far Watch. Kill 8.',
      objs: [{ type: 'kill', mob: 'savannah_prowler', n: 8 }], reward: { choice: ['fam_legs13'] } },
    forgotten_pools_q: { name: 'The Forgotten Pools', lvl: 12, giver: 'helbrim', turnin: 'helbrim', text: 'Something fouls the water in the Barrens. Bring me a sample from the Forgotten Pools.',
      objs: [{ type: 'visit', place: 'forgotten_pools' }], reward: { money: 300 } },
    kolkar_wranglers: { name: 'Kolkar Wranglers', lvl: 13, giver: 'thork', turnin: 'thork', pre: ['disrupt_attacks'], text: 'The wranglers break beasts for the centaur war bands. Kill 10 at the Stagnant Oasis.',
      objs: [{ type: 'kill', mob: 'kolkar_wrangler', n: 10 }], reward: { choice: ['fam_back14'] } },
    kolkar_whips: { name: 'Wrangler Whips', lvl: 13, giver: 'sergra', turnin: 'sergra', text: "Take the wranglers' whips and they cannot drive their beasts. Bring me 6.",
      objs: [{ type: 'collect', item: 'kolkar_whip', n: 6 }], reward: { money: 400 } },
    thornweavers: { name: 'Thornweavers', lvl: 13, giver: 'kargal', turnin: 'kargal', pre: ['razormane_raid'], text: "The thornweavers work the Razormane's dark magic. Kill 8.",
      objs: [{ type: 'kill', mob: 'razormane_thornweaver', n: 8 }], reward: { choice: ['fam_waist14'] } },
    snapjaw_shells: { name: 'Snapjaw Shells', lvl: 14, giver: 'zargh', turnin: 'zargh', text: 'Turtle soup! The snapjaws at the Stagnant Oasis bite back, so be careful. Bring me 6 shell pieces.',
      objs: [{ type: 'collect', item: 'snapjaw_shell', n: 6 }], reward: { choice: ['fam_legs13'] } },
    swiftmane_q: { name: 'Swiftmane', lvl: 14, giver: 'sergra', turnin: 'sergra', text: 'A great zhevra called Swiftmane is seen at the Forgotten Pools, but rarely. Bring me its hoof.',
      objs: [{ type: 'collect', item: 'swiftmane_hoof', n: 1 }], reward: { choice: ['fam_ring_rare'] } },
    kolkar_leaders: { name: 'Kolkar Leaders', lvl: 15, giver: 'thork', turnin: 'thork', pre: ['kolkar_wranglers'], text: 'Barak Kodobane leads the centaur at the Stagnant Oasis. Kill him.',
      objs: [{ type: 'kill', mob: 'barak_kodobane', n: 1 }], reward: { choice: ['fam_weapon15'] } },
    thorn_hill_scout: { name: 'Thorn Hill', lvl: 13, giver: 'kargal', turnin: 'kargal', text: 'The Kolkar gather storm shamans at Thorn Hill. Scout it for me.',
      objs: [{ type: 'visit', place: 'thorn_hill' }], reward: { money: 350 } },
    kolkar_stormers: { name: 'Kolkar Stormers', lvl: 14, giver: 'thork', turnin: 'thork', text: 'The stormers call lightning down on our caravans. Kill 10.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 10 }], reward: { choice: ['fam_chest13'] } },
    stormsnouts: { name: 'Stormsnouts', lvl: 14, giver: 'sergra', turnin: 'sergra', text: 'The stormsnouts of Thorn Hill are the toughest lizards in the Barrens. Hunt 8.',
      objs: [{ type: 'kill', mob: 'stormsnout', n: 8 }], reward: { money: 420 } },
    storm_charms: { name: 'Storm Charms', lvl: 15, giver: 'helbrim', turnin: 'helbrim', text: "The stormers' charms hold real power. Bring me 8 to study.",
      objs: [{ type: 'collect', item: 'storm_charm', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    stormsnout_hides: { name: 'Stormsnout Hides', lvl: 15, giver: 'nargal', turnin: 'nargal', text: 'Stormsnout hide turns a blade. Bring me 6.',
      objs: [{ type: 'collect', item: 'stormsnout_hide', n: 6 }], reward: { choice: ['fam_hands14'] } },
    lizard_steaks: { name: 'Thunder Lizard Steaks', lvl: 15, giver: 'zargh', turnin: 'zargh', text: 'Thunder lizard steak, crackling hot. Bring me 6.',
      objs: [{ type: 'collect', item: 'lizard_steak', n: 6 }], reward: { money: 480 } },
    thorn_hill_patrol: { name: 'Storm over Thorn Hill', lvl: 15, giver: 'kargal', turnin: 'kargal', pre: ['thorn_hill_scout'], text: 'Push the Kolkar off Thorn Hill: 6 stormers and 4 stormsnouts.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 6 }, { type: 'kill', mob: 'stormsnout', n: 4 }], reward: { choice: ['fam_waist14'] } },
    centaur_camp: { name: 'The Centaur War Camp', lvl: 16, giver: 'thork', turnin: 'thork', pre: ['kolkar_stormers'], text: 'Break the war camp on Thorn Hill: 12 stormers.',
      objs: [{ type: 'kill', mob: 'kolkar_stormer', n: 12 }], reward: { choice: ['fam_back14'] } },
  });


  // ---- levels 15-20 (v2.1): the Sludge Fen, Lushwater Oasis and Bael'dun Digsite
  D.item('venture_contract', { name: 'Venture Co. Contract', slot: 'quest', q: 1, icon: 'journal' });
  D.item('crystal_sample', { name: 'Geologist Crystal', slot: 'quest', q: 1, icon: 'dust' });
  D.item('scytheclaw_talon', { name: 'Scytheclaw Talon', slot: 'quest', q: 1, icon: 'claw' });
  D.item('crocolisk_steak', { name: 'Crocolisk Steak', slot: 'quest', q: 1, icon: 'meat' });
  D.item('crocolisk_hide', { name: 'Thick Crocolisk Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('dwarven_rations', { name: 'Dwarven Rations', slot: 'quest', q: 1, icon: 'bread' });
  D.item('rifle_part', { name: 'Dwarven Rifle Part', slot: 'quest', q: 1, icon: 'coin' });
  D.item('takk_claw', { name: "Takk's Claw", slot: 'quest', q: 1, icon: 'claw' });
  D.item('digsite_relic', { name: "Bael'dun Relic", slot: 'quest', q: 1, icon: 'coin' });
  D.item('baeldun_orders', { name: "Bael'dun Orders", slot: 'quest', q: 1, icon: 'journal' });
  D.item('takk_fang', { name: "Takk's Fang", slot: 'weapon', wtype: 'dagger', q: 3, lvl: 19, dmg: [15, 25], speed: 1.7, stats: { agi: 6, sta: 3 }, icon: 'dagger', sell: 1700, source: 'Takk the Leaper, Lushwater Oasis' });
  Object.assign(D.MOBS, {
    venture_mercenary: { name: 'Venture Co. Mercenary', lvl: [15, 16], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['venture_contract', 0.5]], aggro: 'Time is money, friend!' },
    venture_geologist: { name: 'Venture Co. Geologist', lvl: [16, 17], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['venture_contract', 0.5], ['crystal_sample', 0.55]], aggro: 'Hands off my samples!' },
    sunscale_scytheclaw: { name: 'Sunscale Scytheclaw', lvl: [17, 18], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.4]], qdrops: [['scytheclaw_talon', 0.55]] },
    oasis_crocolisk: { name: 'Oasis Crocolisk', lvl: [16, 17], family: 'beast', hpMult: 1.15, drops: [['ruined_pelt', 0.35]], qdrops: [['crocolisk_steak', 0.55], ['crocolisk_hide', 0.5]] },
    takk_the_leaper: { name: 'Takk the Leaper', lvl: [19, 19], family: 'beast', named: true, hpMult: 2, dmgMult: 1.3, drops: [['takk_fang', 0.35], ['ruined_pelt', 1]], qdrops: [['takk_claw', 1]] },
    baeldun_excavator: { name: "Bael'dun Excavator", lvl: [18, 19], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['digsite_relic', 0.5], ['dwarven_rations', 0.55]], aggro: 'For Ironforge!' },
    baeldun_soldier: { name: "Bael'dun Soldier", lvl: [19, 20], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['digsite_relic', 0.5], ['baeldun_orders', 0.15], ['rifle_part', 0.5]], aggro: 'Horde scum! Hold the line!' },
  });
  Object.assign(D.PLACES, {
    sludge_fen: { name: 'The Sludge Fen', zone: 'The Barrens', region: 'barrens', scene: 'sludge_fen', lvl: [15, 17], mobs: [['venture_mercenary', 5], ['venture_geologist', 4]], pool: 10, npcs: [], links: { crossroads: 20, far_watch: 18 } },
    lushwater_oasis: { name: 'Lushwater Oasis', zone: 'The Barrens', region: 'barrens', scene: 'lushwater_oasis', lvl: [16, 18], mobs: [['sunscale_scytheclaw', 5], ['oasis_crocolisk', 4]], named: { takk_the_leaper: 300 }, pool: 10, npcs: [], links: { crossroads: 20, stagnant_oasis: 16 } },
    baeldun_digsite: { name: "Bael'dun Digsite", zone: 'The Barrens', region: 'barrens', scene: 'baeldun_digsite', lvl: [18, 20], mobs: [['baeldun_excavator', 5], ['baeldun_soldier', 4]], pool: 10, npcs: [], links: { crossroads: 24, thorn_hill: 18 } },
  });
  Object.assign(D.QUESTS, {
    sludge_scout: { name: 'The Sludge Fen', lvl: 15, giver: 'kargal', turnin: 'kargal', text: 'Goblins of the Venture Co. are poisoning the land north of Far Watch. Go and look.',
      objs: [{ type: 'visit', place: 'sludge_fen' }], reward: { money: 500 } },
    venture_mercs: { name: 'Venture Mercenaries', lvl: 15, giver: 'kargal', turnin: 'kargal', text: 'The Venture Co. hired guns guard their oil pumps. Kill 12.',
      objs: [{ type: 'kill', mob: 'venture_mercenary', n: 12 }], reward: { choice: ['fam_feet17'] } },
    venture_contracts: { name: 'Read the Fine Print', lvl: 16, giver: 'helbrim', turnin: 'helbrim', text: 'The goblins carry their contracts everywhere. Bring me 8 and we will learn who pays them.',
      objs: [{ type: 'collect', item: 'venture_contract', n: 8 }], reward: { money: 650 } },
    geologists: { name: 'The Geologists', lvl: 16, giver: 'thork', turnin: 'thork', text: 'Venture Co. geologists search the Barrens for anything worth digging up. Stop 10.',
      objs: [{ type: 'kill', mob: 'venture_geologist', n: 10 }], reward: { choice: ['fam_wrist17'] } },
    crystal_samples: { name: 'Crystal Samples', lvl: 17, giver: 'helbrim', turnin: 'helbrim', text: 'The geologists found strange crystals. Bring me 6.',
      objs: [{ type: 'collect', item: 'crystal_sample', n: 6 }], reward: { choice: ['fam_weapon17'] } },
    stop_drilling: { name: 'Stop the Drilling', lvl: 17, giver: 'kargal', turnin: 'kargal', pre: ['venture_mercs'], text: 'Finish the job at the Sludge Fen: 6 mercenaries and 6 geologists.',
      objs: [{ type: 'kill', mob: 'venture_mercenary', n: 6 }, { type: 'kill', mob: 'venture_geologist', n: 6 }], reward: { choice: ['fam_waist19'] } },
    lushwater_scout: { name: 'Lushwater Oasis', lvl: 16, giver: 'sergra', turnin: 'sergra', text: 'Raptors nest at Lushwater Oasis to the south. Scout it for me.',
      objs: [{ type: 'visit', place: 'lushwater_oasis' }], reward: { money: 550 } },
    crocolisk_steaks: { name: 'Crocolisk Steaks', lvl: 16, giver: 'zargh', turnin: 'zargh', text: 'Crocolisk steak! Tough as boots but worth the chewing. Bring me 6.',
      objs: [{ type: 'collect', item: 'crocolisk_steak', n: 6 }], reward: { money: 650 } },
    oasis_crocs: { name: 'Crocs in the Water', lvl: 16, giver: 'boorand', turnin: 'boorand', text: 'The crocolisks at Lushwater drag off our water carriers. Kill 10.',
      objs: [{ type: 'kill', mob: 'oasis_crocolisk', n: 10 }], reward: { money: 650 } },
    scytheclaws: { name: 'The Scytheclaws', lvl: 17, giver: 'sergra', turnin: 'sergra', pre: ['lushwater_scout'], text: 'The scytheclaws are the deadliest raptors in the Barrens. Hunt 12.',
      objs: [{ type: 'kill', mob: 'sunscale_scytheclaw', n: 12 }], reward: { choice: ['fam_chest18'] } },
    scytheclaw_talons: { name: 'Scytheclaw Talons', lvl: 17, giver: 'nargal', turnin: 'nargal', text: 'A scytheclaw talon makes a wicked blade. Bring me 8.',
      objs: [{ type: 'collect', item: 'scytheclaw_talon', n: 8 }], reward: { choice: ['fam_hands19'] } },
    digsite_scout: { name: "Bael'dun Digsite", lvl: 18, giver: 'thork', turnin: 'thork', text: 'Dwarves are digging in the hills south of Thorn Hill, on Horde land. Find out what they want.',
      objs: [{ type: 'visit', place: 'baeldun_digsite' }], reward: { money: 600 } },
    excavators: { name: 'The Excavators', lvl: 18, giver: 'thork', turnin: 'thork', pre: ['digsite_scout'], text: 'The excavators dig day and night. Kill 12.',
      objs: [{ type: 'kill', mob: 'baeldun_excavator', n: 12 }], reward: { choice: ['fam_legs18'] } },
    digsite_relics: { name: "Bael'dun Relics", lvl: 18, giver: 'helbrim', turnin: 'helbrim', text: 'Whatever the dwarves dig up, I want to see it first. Bring me 8 relics.',
      objs: [{ type: 'collect', item: 'digsite_relic', n: 8 }], reward: { choice: ['fam_waist19'] } },
    crocolisk_hides: { name: 'Crocolisk Hides', lvl: 18, giver: 'sergra', turnin: 'sergra', text: 'Crocolisk hide makes good armour for our scouts. Bring me 8.',
      objs: [{ type: 'collect', item: 'crocolisk_hide', n: 8 }], reward: { choice: ['fam_legs18'] } },
    lushwater_raptors: { name: 'Lushwater Raptors', lvl: 18, giver: 'boorand', turnin: 'boorand', pre: ['scytheclaws'], text: 'The raptors of Lushwater are still hunting our caravans. Kill 10 scytheclaws.',
      objs: [{ type: 'kill', mob: 'sunscale_scytheclaw', n: 10 }], reward: { money: 750 } },
    dwarven_rations_q: { name: 'Dwarven Rations', lvl: 19, giver: 'zargh', turnin: 'zargh', text: 'The dwarves eat well. Bring me 8 of their rations and I will learn their recipes.',
      objs: [{ type: 'collect', item: 'dwarven_rations', n: 8 }], reward: { money: 800 } },
    rifle_parts: { name: 'Rifle Parts', lvl: 19, giver: 'nargal', turnin: 'nargal', text: 'Dwarven rifles are fine work. Bring me 8 parts and I will see how they are made.',
      objs: [{ type: 'collect', item: 'rifle_part', n: 8 }], reward: { choice: ['fam_hands19'] } },
    digsite_sweep: { name: 'Push Back the Dwarves', lvl: 20, giver: 'kargal', turnin: 'kargal', pre: ['excavators'], text: 'Drive the dwarves out of the Barrens: 8 excavators and 8 soldiers.',
      objs: [{ type: 'kill', mob: 'baeldun_excavator', n: 8 }, { type: 'kill', mob: 'baeldun_soldier', n: 8 }], reward: { choice: ['fam_chest18'] } },
    takk_q: { name: 'Takk the Leaper', lvl: 19, giver: 'sergra', turnin: 'sergra', text: 'An old raptor called Takk the Leaper hunts at Lushwater. It is rarely seen. Bring me its claw.',
      objs: [{ type: 'collect', item: 'takk_claw', n: 1 }], reward: { choice: ['fam_ring_rare20'] } },
    baeldun_soldiers: { name: "Bael'dun Soldiers", lvl: 19, giver: 'thork', turnin: 'thork', pre: ['excavators'], text: 'Their soldiers guard the dig. Break them: 10 soldiers.',
      objs: [{ type: 'kill', mob: 'baeldun_soldier', n: 10 }], reward: { choice: ['fam_back19'] } },
    baeldun_orders_q: { name: 'Orders from Ironforge', lvl: 20, giver: 'thork', turnin: 'thork', pre: ['baeldun_soldiers'], text: 'A soldier carries orders from Ironforge. Bring them to me.',
      objs: [{ type: 'collect', item: 'baeldun_orders', n: 1 }], reward: { choice: ['fam_weapon20'] } },
  });

  // ---- Wailing Caverns (v2.1): a 5-player dungeon under the Lushwater caves, levels 17-21
  D.item('serpentbloom', { name: 'Serpentbloom', slot: 'quest', q: 1, icon: 'seed' });
  D.item('deviate_hide', { name: 'Deviate Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('belt_of_the_fang', { name: 'Belt of the Fang', slot: 'waist', atype: 'leather', q: 3, lvl: 20, armor: 58, stats: { agi: 6, sta: 4 }, icon: 'belt', sell: 1500 });
  D.item('fangdrip_runners', { name: 'Fangdrip Runners', slot: 'feet', atype: 'leather', q: 3, lvl: 20, armor: 72, stats: { agi: 5, sta: 5 }, icon: 'boots', sell: 1500 });
  D.item('serpent_gloves', { name: 'Serpent Gloves', slot: 'hands', atype: 'cloth', q: 3, lvl: 20, armor: 22, stats: { int: 6, spi: 4 }, sp: 9, icon: 'gloves', sell: 1400 });
  D.item('cobrahn_grasp', { name: "Cobrahn's Grasp", slot: 'waist', atype: 'mail', q: 3, lvl: 20, armor: 115, stats: { str: 6, sta: 5 }, icon: 'belt', sell: 1500 });
  D.item('leggings_of_the_fang', { name: 'Leggings of the Fang', slot: 'legs', atype: 'leather', q: 3, lvl: 20, armor: 110, stats: { agi: 7, sta: 6 }, icon: 'legs', sell: 1800 });
  D.item('robe_moccasin', { name: 'Robe of the Moccasin', slot: 'chest', atype: 'cloth', q: 3, lvl: 20, armor: 44, stats: { int: 8, spi: 6 }, sp: 11, icon: 'chest_cloth', sell: 1800 });
  D.item('kresh_back', { name: "Kresh's Back", slot: 'back', q: 3, lvl: 20, armor: 34, stats: { sta: 8 }, icon: 'cloak', sell: 1500 });
  D.item('turtle_scale_bracers', { name: 'Turtle Scale Bracers', slot: 'wrist', atype: 'mail', q: 3, lvl: 20, armor: 74, stats: { str: 4, sta: 5 }, icon: 'bracers', sell: 1300 });
  D.item('stinging_viper', { name: 'Stinging Viper', slot: 'weapon', wtype: 'mace', q: 3, lvl: 21, dmg: [23, 40], speed: 2.4, stats: { str: 6, sta: 4 }, icon: 'mace', sell: 2000 });
  D.item('lizardscale_cloak', { name: 'Glowing Lizardscale Cloak', slot: 'back', q: 3, lvl: 21, armor: 34, stats: { agi: 6, sta: 4 }, icon: 'cloak', sell: 1600 });
  D.item('mutant_scale_breastplate', { name: 'Mutant Scale Breastplate', slot: 'chest', atype: 'mail', q: 3, lvl: 21, armor: 250, stats: { str: 8, sta: 8 }, icon: 'chest_mail', sell: 2200 });
  D.item('staff_of_the_deviate', { name: 'Staff of the Deviate', slot: 'weapon', wtype: 'staff', q: 3, lvl: 21, dmg: [36, 55], speed: 3.1, stats: { int: 8, spi: 6 }, sp: 15, icon: 'staff', sell: 2200 });
  D.item('band_of_the_fang', { name: 'Band of the Fang', slot: 'finger', q: 3, lvl: 21, stats: { int: 4, agi: 4, sta: 4 }, icon: 'ring', sell: 1800 });
  Object.assign(D.MOBS, {
    druid_of_the_fang: { name: 'Druid of the Fang', lvl: [18, 19], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.35]], qdrops: [['serpentbloom', 0.5]], aggro: 'The Nightmare will take you!' },
    deviate_ravager: { name: 'Deviate Ravager', lvl: [18, 19], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['deviate_hide', 0.5]] },
    deviate_viper: { name: 'Deviate Viper', lvl: [17, 18], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['deviate_hide', 0.5]] },
    lady_anacondra: { name: 'Lady Anacondra', lvl: [20, 20], family: 'humanoid', boss: true, aggro: 'None can stand against the Serpent Lords!', loot: ['belt_of_the_fang', 'fangdrip_runners', 'serpent_gloves'] },
    kresh: { name: 'Kresh', lvl: [20, 20], family: 'beast', boss: true, loot: ['kresh_back', 'turtle_scale_bracers'] },
    lord_cobrahn: { name: 'Lord Cobrahn', lvl: [20, 20], family: 'humanoid', boss: true, aggro: 'You will never wake the dreamer!', loot: ['cobrahn_grasp', 'leggings_of_the_fang', 'robe_moccasin'] },
    lord_pythas: { name: 'Lord Pythas', lvl: [21, 21], family: 'humanoid', boss: true, aggro: 'The coils of death will crush you!', loot: ['stinging_viper', 'lizardscale_cloak'] },
    mutanus: { name: 'Mutanus the Devourer', lvl: [21, 21], family: 'murloc', boss: true, aggro: 'Naralex dreams... and I feed.', loot: ['mutant_scale_breastplate', 'staff_of_the_deviate', 'band_of_the_fang'] },
  });
  Object.assign(D.DUNGEONS, {
    wailing_caverns: { name: 'Wailing Caverns', minLvl: 17, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'wailing_caverns', label: 'The mouth of the caves', mobs: ['deviate_viper', 'deviate_viper'] },
      { scene: 'wailing_caverns', label: 'Fungal grotto', mobs: ['druid_of_the_fang', 'deviate_ravager'] },
      { scene: 'wailing_caverns', label: 'Lady Anacondra', mobs: ['lady_anacondra', 'druid_of_the_fang'], boss: true },
      { scene: 'wailing_caverns', label: 'Deviate den', mobs: ['deviate_ravager', 'deviate_ravager', 'deviate_viper'] },
      { scene: 'wailing_caverns', label: 'Kresh', mobs: ['kresh'], boss: true },
      { scene: 'wailing_caverns_deep', label: 'Serpent lair', mobs: ['druid_of_the_fang', 'druid_of_the_fang'] },
      { scene: 'wailing_caverns_deep', label: 'Lord Cobrahn', mobs: ['lord_cobrahn', 'deviate_viper'], boss: true },
      { scene: 'wailing_caverns_deep', label: 'The waterfall', mobs: ['deviate_ravager', 'druid_of_the_fang', 'deviate_viper'] },
      { scene: 'wailing_caverns_deep', label: 'Lord Pythas', mobs: ['lord_pythas', 'druid_of_the_fang'], boss: true },
      { scene: 'wailing_caverns_deep', label: 'Dreamer\'s rest', mobs: ['druid_of_the_fang', 'deviate_ravager'] },
      { scene: 'wailing_caverns_deep', label: 'Mutanus the Devourer', mobs: ['mutanus'], boss: true }] },
  });
  Object.assign(D.ACTIVITIES, {
    wailing_caverns: { name: 'Wailing Caverns', dungeon: 'wailing_caverns', where: 'lushwater_oasis', size: 5, minLvl: 17, maxLvl: 21, desc: 'Dungeon in the Barrens. 5 players.', boss: 'mutanus' },
  });
  Object.assign(D.QUESTS, {
    wc_serpentbloom: { name: 'Serpentbloom', lvl: 18, giver: 'helbrim', turnin: 'helbrim', dungeon: 'wailing_caverns', text: 'A rare flower grows only in the Wailing Caverns, and the Druids of the Fang guard it. Bring me 8 serpentbloom.',
      objs: [{ type: 'collect', item: 'serpentbloom', n: 8 }], reward: { choice: ['fam_hands19'] } },
    wc_deviate_hides: { name: 'Deviate Hides', lvl: 19, giver: 'sergra', turnin: 'sergra', dungeon: 'wailing_caverns', text: 'The beasts in the caverns are twisted into something new. Their hides are strong. Bring me 8.',
      objs: [{ type: 'collect', item: 'deviate_hide', n: 8 }], reward: { choice: ['fam_chest18'] } },
    wc_leaders: { name: 'Leaders of the Fang', lvl: 21, giver: 'thork', turnin: 'thork', dungeon: 'wailing_caverns', text: 'Four druids went into the caverns to heal the land and came out as the Fang. Kill three of their leaders: Anacondra, Cobrahn and Pythas.',
      objs: [{ type: 'kill', mob: 'lady_anacondra', n: 1 }, { type: 'kill', mob: 'lord_cobrahn', n: 1 }, { type: 'kill', mob: 'lord_pythas', n: 1 }], reward: { choice: ['fam_back_rare20'] } },
    wc_mutanus: { name: 'The Devourer', lvl: 21, giver: 'thork', turnin: 'thork', pre: ['wc_leaders'], dungeon: 'wailing_caverns', text: 'Something feeds on the dreams of the druid Naralex, deep in the caverns. Kill it.',
      objs: [{ type: 'kill', mob: 'mutanus', n: 1 }], reward: { choice: ['fam_weapon20'] } },
  });
})(typeof window !== 'undefined' ? window : globalThis);