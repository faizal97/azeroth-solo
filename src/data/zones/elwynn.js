// Elwynn Forest and Northshire: Alliance, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('elwynn', { name: 'Elwynn Forest', faction: 'alliance' });
  // items
  D.item('red_bandana', { name: 'Red Burlap Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  D.item('grape_crate', { name: 'Crate of Grapes', slot: 'quest', q: 1, icon: 'grapes' });
  D.item('garrick_head', { name: "Garrick's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('large_candle', { name: 'Large Candle', slot: 'quest', q: 1, icon: 'candle' });
  D.item('gold_dust', { name: 'Gold Dust', slot: 'quest', q: 1, icon: 'dust' });
  D.item('murloc_fin', { name: 'Torn Murloc Fin', slot: 'quest', q: 1, icon: 'fin' });
  D.item('red_linen', { name: 'Red Linen Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  D.item('brass_collar', { name: 'Brass Collar', slot: 'quest', q: 1, icon: 'ring' });
  D.item('gnoll_armband', { name: 'Painted Gnoll Armband', slot: 'quest', q: 1, icon: 'armband' });
  D.item('gnoll_claw', { name: 'Huge Gnoll Claw', slot: 'quest', q: 1, icon: 'claw' });
  D.item('garrick_cloak', { name: "Garrick's Bandit Cloak", slot: 'back', q: 3, lvl: 5, armor: 9, stats: { agi: 2, sta: 1 }, icon: 'cloak', sell: 120, source: 'Garrick Padfoot, Northshire Vineyards', look: ['back', 'garrick_cloak'] });
  D.item('pumpkin_trousers', { name: 'Pumpkin Patch Trousers', slot: 'legs', atype: 'cloth', q: 3, lvl: 9, armor: 16, stats: { sta: 3, spi: 2 }, icon: 'legs', sell: 300, source: 'Princess, Brackwell Pumpkin Patch', look: ['legs', 'pumpkin_trousers'] });
  D.item('gnollhide_cloak', { name: 'Gnollhide Cloak', slot: 'back', q: 3, lvl: 10, armor: 20, stats: { str: 2, agi: 2, sta: 3 }, icon: 'cloak', sell: 450, source: "Hogger, Forest's Edge", look: ['back', 'gnollhide_cloak'] });
  D.item('kobold_pick', { name: 'Kobold Mining Pick', slot: 'quest', q: 1, icon: 'axe' });
  D.item('crystal_clam', { name: 'Crystal Lake Clam', slot: 'quest', q: 1, icon: 'meat' });
  D.item('prowler_claw', { name: 'Prowler Claw', slot: 'quest', q: 1, icon: 'claw' });

  // creatures
  Object.assign(D.MOBS, {
    young_wolf: { name: 'Young Wolf', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]], qdrops: [['wolf_meat', 0.75]] },
    kobold_vermin: { name: 'Kobold Vermin', lvl: [1, 2], family: 'humanoid', drops: [['kobold_rag', 0.4], ['linen_cloth', 0.2]], aggro: 'You no take candle!' },
    kobold_worker: { name: 'Kobold Worker', lvl: [3, 4], family: 'humanoid', drops: [['broken_candle', 0.35], ['linen_cloth', 0.25]], aggro: 'You no take candle!' },
    defias_thug: { name: 'Defias Thug', lvl: [3, 5], family: 'humanoid', drops: [['thieves_coin', 0.35], ['linen_cloth', 0.3]], qdrops: [['red_bandana', 0.7]], aggro: 'The Brotherhood will not tolerate your actions!' },
    garrick_padfoot: { name: 'Garrick Padfoot', lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.6, dmgMult: 1.2, drops: [['thieves_coin', 1], ['garrick_cloak', 0.35]], qdrops: [['garrick_head', 1]], aggro: "I'll gut you like a fish!" },
    mangy_wolf: { name: 'Mangy Wolf', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]] },
    kobold_laborer: { name: 'Kobold Laborer', lvl: [5, 6], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['large_candle', 0.6], ['gold_dust', 0.5]], aggro: 'You no take candle!' },
    kobold_tunneler: { name: 'Kobold Tunneler', lvl: [6, 7], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['large_candle', 0.6], ['gold_dust', 0.5], ['kobold_pick', 0.55]], aggro: 'Yiiieeee! Me run!' },
    young_forest_bear: { name: 'Young Forest Bear', lvl: [7, 8], family: 'beast', hpMult: 1.15, drops: [['bear_hide', 0.4]] },
    prowler: { name: 'Prowler', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]], qdrops: [['prowler_claw', 0.55]] },
    murloc_streamrunner: { name: 'Murloc Streamrunner', lvl: [7, 8], family: 'murloc', drops: [['murloc_eye', 0.45]], qdrops: [['murloc_fin', 0.6], ['crystal_clam', 0.5]], aggro: 'Mrrrggllll!' },
    murloc_forager: { name: 'Murloc Forager', lvl: [8, 9], family: 'murloc', drops: [['murloc_eye', 0.45]], qdrops: [['murloc_fin', 0.6], ['crystal_clam', 0.5]], aggro: 'Aaaaaughibbrgubugbugrguburgle!' },
    defias_bandit: { name: 'Defias Bandit', lvl: [8, 10], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35], ['pumpkin', 0.2]], qdrops: [['red_linen', 0.65]], aggro: 'Your bones will break under my boot!' },
    princess: { name: 'Princess', lvl: [9, 9], family: 'beast', named: true, hpMult: 1.8, dmgMult: 1.2, drops: [['bear_hide', 1], ['pumpkin_trousers', 0.35]], qdrops: [['brass_collar', 1]] },
    riverpaw_gnoll: { name: 'Riverpaw Gnoll', lvl: [9, 10], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['gnoll_armband', 0.6]], aggro: 'Grrr... fresh meat!' },
    hogger: { name: 'Hogger', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, drops: [['gnoll_mane', 1]], qdrops: [['gnoll_claw', 1]], aggro: 'More bones to gnaw on...', special: 'hogger', loot: ['gnollhide_cloak'] },
  });

  // places
  Object.assign(D.PLACES, {
    northshire_abbey: { name: 'Northshire Abbey', zone: 'Northshire Valley', scene: 'northshire_abbey', lvl: [1, 2], mobs: [['young_wolf', 5], ['kobold_vermin', 5]], pool: 9, npcs: ['mcbride', 'willem', 'eagan', 'danil'], vendor: 'danil', links: { echo_ridge: 10, northshire_vineyards: 12, goldshire: 30 }, region: 'elwynn' },
    echo_ridge: { name: 'Echo Ridge Mine', zone: 'Northshire Valley', scene: 'echo_ridge', lvl: [3, 4], mobs: [['kobold_worker', 8], ['kobold_vermin', 2]], pool: 8, npcs: [], links: { northshire_abbey: 10, northshire_vineyards: 14 }, region: 'elwynn' },
    northshire_vineyards: { name: 'Northshire Vineyards', zone: 'Northshire Valley', scene: 'vineyards', lvl: [3, 5], mobs: [['defias_thug', 10]], named: { garrick_padfoot: 90 }, pool: 8, npcs: ['milly'], gather: { item: 'grape_crate', label: 'Crate of Grapes', quest: 'millys_harvest' }, links: { northshire_abbey: 12, echo_ridge: 14 }, region: 'elwynn' },
    goldshire: { name: 'Goldshire', zone: 'Elwynn Forest', scene: 'goldshire', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['dughan', 'remy', 'pestle', 'farley', 'corina'], vendor: 'farley', gearVendor: 'corina', links: { northshire_abbey: 30, fargodeep: 16, crystal_lake: 18, brackwell: 20, forests_edge: 24, ironforge: 45, darnassus: 60, furlbrow_farm: 30 }, via: { ironforge: 'Deeprun Tram', darnassus: "Boat to Rut'theran" }, region: 'elwynn' },
    fargodeep: { name: 'Fargodeep Mine', zone: 'Elwynn Forest', scene: 'fargodeep', lvl: [5, 7], mobs: [['kobold_laborer', 6], ['kobold_tunneler', 4], ['mangy_wolf', 3]], pool: 9, npcs: [], links: { goldshire: 16, brackwell: 14 }, region: 'elwynn' },
    crystal_lake: { name: 'Crystal Lake', zone: 'Elwynn Forest', scene: 'crystal_lake', lvl: [7, 9], mobs: [['murloc_streamrunner', 5], ['murloc_forager', 3], ['young_forest_bear', 3], ['prowler', 3]], pool: 10, npcs: ['thomas'], links: { goldshire: 18, forests_edge: 16 }, region: 'elwynn' },
    brackwell: { name: 'Brackwell Pumpkin Patch', zone: 'Elwynn Forest', scene: 'brackwell', lvl: [8, 10], mobs: [['defias_bandit', 8], ['prowler', 2]], named: { princess: 120 }, pool: 9, npcs: ['ma_stonefield'], links: { goldshire: 20, fargodeep: 14 }, region: 'elwynn' },
    forests_edge: { name: "Forest's Edge", zone: 'Elwynn Forest', scene: 'forests_edge', lvl: [9, 11], mobs: [['riverpaw_gnoll', 10]], named: { hogger: 150 }, pool: 9, npcs: [], links: { goldshire: 24, crystal_lake: 16 }, region: 'elwynn' },
  });

  // people
  Object.assign(D.NPCS, {
    mcbride: { name: 'Marshal McBride', title: 'Northshire Marshal' },
    willem: { name: 'Deputy Willem', title: 'Northshire Guard' },
    eagan: { name: 'Eagan Peltskinner', title: 'Hunter' },
    danil: { name: 'Brother Danil', title: 'Food & Drink' },
    milly: { name: 'Milly Osworth', title: 'Vineyard Hand' },
    dughan: { name: 'Marshal Dughan', title: 'Goldshire Marshal' },
    remy: { name: 'Remy "Two Times"', title: 'Trader' },
    pestle: { name: 'William Pestle', title: 'Herbalist' },
    farley: { name: 'Innkeeper Farley', title: 'Innkeeper' },
    corina: { name: 'Corina Steele', title: 'Weaponsmith' },
    thomas: { name: 'Guard Thomas', title: 'Stormwind Guard' },
    ma_stonefield: { name: 'Ma Stonefield', title: 'Farmer' },
  });

  // quests
  Object.assign(D.QUESTS, {
    wolves_border: { name: 'Wolves Across the Border', lvl: 2, giver: 'eagan', turnin: 'eagan', text: "Wolves from the woods keep raiding our stores. Bring me 8 Tough Wolf Meat and I'll make it worth your while.",
      objs: [{ type: 'collect', item: 'wolf_meat', n: 8 }], reward: { choice: ['fam_chest'] } },
    kobold_cleanup: { name: 'Kobold Camp Cleanup', lvl: 2, giver: 'mcbride', turnin: 'mcbride', text: 'Kobolds have been spotted around the abbey. Kill 10 Kobold Vermin.',
      objs: [{ type: 'kill', mob: 'kobold_vermin', n: 10 }], reward: { choice: ['fam_legs'] } },
    investigate_echo: { name: 'Investigate Echo Ridge', lvl: 3, giver: 'mcbride', turnin: 'mcbride', pre: ['kobold_cleanup'], text: 'More kobolds are digging at Echo Ridge Mine. Thin out 10 Kobold Workers.',
      objs: [{ type: 'kill', mob: 'kobold_worker', n: 10 }], reward: { choice: ['fam_feet'] } },
    brotherhood_thieves: { name: 'Brotherhood of Thieves', lvl: 4, giver: 'willem', turnin: 'willem', text: 'The Defias Brotherhood has moved into the vineyards. Bring me 12 of their Red Burlap Bandanas.',
      objs: [{ type: 'collect', item: 'red_bandana', n: 12 }], reward: { choice: ['fam_hands'] } },
    millys_harvest: { name: "Milly's Harvest", lvl: 4, giver: 'milly', turnin: 'milly', text: 'The thugs chased us off before we finished the harvest. Could you bring back 8 Crates of Grapes?',
      objs: [{ type: 'collect', item: 'grape_crate', n: 8 }], reward: {} },
    bounty_garrick: { name: 'Bounty on Garrick Padfoot', lvl: 5, giver: 'willem', turnin: 'willem', pre: ['brotherhood_thieves'], text: 'Their leader Garrick Padfoot hides in the vineyards. Bring me his head.',
      objs: [{ type: 'collect', item: 'garrick_head', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_goldshire: { name: 'Report to Goldshire', lvl: 5, giver: 'mcbride', turnin: 'dughan', text: "You've done well. Head south to Goldshire and report to Marshal Dughan.",
      objs: [{ type: 'visit', place: 'goldshire' }], reward: {} },
    fargodeep_mine: { name: 'The Fargodeep Mine', lvl: 6, giver: 'dughan', turnin: 'dughan', text: 'Scout Fargodeep Mine to the south and see what the kobolds are up to.',
      objs: [{ type: 'visit', place: 'fargodeep' }], reward: {} },
    kobold_candles: { name: 'Kobold Candles', lvl: 6, giver: 'pestle', turnin: 'pestle', text: 'The kobolds in Fargodeep carry fine candles. I need 8 Large Candles for my work.',
      objs: [{ type: 'collect', item: 'large_candle', n: 8 }], reward: { choice: ['fam_wrist'] } },
    gold_dust: { name: 'Gold Dust Exchange', lvl: 6, giver: 'remy', turnin: 'remy', text: "Kobolds hoard gold dust from the mines. Get me 10 and I'll pay you twice. Heh. Two times.",
      objs: [{ type: 'collect', item: 'gold_dust', n: 10 }], reward: { money: 150 } },
    protect_frontier: { name: 'Protect the Frontier', lvl: 8, giver: 'thomas', turnin: 'thomas', text: 'Wildlife near Crystal Lake has turned vicious. Kill 8 Prowlers and 5 Young Forest Bears.',
      objs: [{ type: 'kill', mob: 'prowler', n: 8 }, { type: 'kill', mob: 'young_forest_bear', n: 5 }], reward: { choice: ['fam_back'] } },
    bounty_murlocs: { name: 'Bounty on Murlocs', lvl: 8, giver: 'thomas', turnin: 'thomas', text: 'Murlocs are raiding the lake shore. Bring me 8 Torn Murloc Fins.',
      objs: [{ type: 'collect', item: 'murloc_fin', n: 8 }], reward: { choice: ['fam_waist'] } },
    red_linen: { name: 'Red Linen Goods', lvl: 9, giver: 'ma_stonefield', turnin: 'ma_stonefield', text: 'Those Defias bandits stole my linen. Get back 6 Red Linen Bandanas from them.',
      objs: [{ type: 'collect', item: 'red_linen', n: 6 }], reward: { choice: ['fam_chest9'] } },
    princess_must_die: { name: 'Princess Must Die!', lvl: 9, giver: 'ma_stonefield', turnin: 'ma_stonefield', text: 'That fat sow Princess ate my prize pumpkins. Bring me her brass collar.',
      objs: [{ type: 'collect', item: 'brass_collar', n: 1 }], reward: { choice: ['fam_legs9'] } },
    gnoll_bounty: { name: 'Riverpaw Gnoll Bounty', lvl: 10, giver: 'dughan', turnin: 'dughan', text: "Riverpaw gnolls are crossing into Elwynn at Forest's Edge. Bring me 8 Painted Gnoll Armbands.",
      objs: [{ type: 'collect', item: 'gnoll_armband', n: 8 }], reward: { choice: ['fam_hands9'] } },
    wanted_hogger: { name: 'Wanted: Hogger', lvl: 11, giver: 'dughan', turnin: 'dughan', group: 3, text: 'A huge gnoll called Hogger leads the Riverpaw. Bring me his claw. Take friends — he is no ordinary gnoll.',
      objs: [{ type: 'collect', item: 'gnoll_claw', n: 1 }], reward: { choice: ['militia'] } },
    defias_brotherhood: { name: 'The Defias Brotherhood', lvl: 12, giver: 'dughan', turnin: 'dughan', dungeon: 'deadmines', text: 'Edwin VanCleef leads the Defias from a hidden cove under Moonbrook. End him, and bring back proof.',
      objs: [{ type: 'collect', item: 'vancleef_head', n: 1 }], reward: { choice: ['fam_back_rare'] } },
    inn_wolves: { name: 'Wolves at the Door', lvl: 5, giver: 'farley', turnin: 'farley', text: 'Mangy wolves from the Fargodeep hills keep coming for my chickens. Thin them out: 8 will do.',
      objs: [{ type: 'kill', mob: 'mangy_wolf', n: 8 }], reward: { money: 90 } },
    kobold_picks: { name: 'Kobold Picks', lvl: 6, giver: 'corina', turnin: 'corina', text: 'Kobold picks are poor tools but good iron. Bring me 6 from the tunnelers in Fargodeep and I will forge you something.',
      objs: [{ type: 'collect', item: 'kobold_pick', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    lake_clams: { name: 'Crystal Lake Clams', lvl: 7, giver: 'farley', turnin: 'farley', text: 'Clam chowder sells well, but the murlocs have taken the lake. They hoard clams. Bring me 6.',
      objs: [{ type: 'collect', item: 'crystal_clam', n: 6 }], reward: { money: 140 } },
    prowler_claws: { name: 'Prowler Claws', lvl: 7, giver: 'pestle', turnin: 'pestle', text: 'Ground prowler claw is the base of a strong tonic. The prowlers near Crystal Lake will do. I need 6.',
      objs: [{ type: 'collect', item: 'prowler_claw', n: 6 }], reward: { choice: ['fam_wrist'] } },
    brackwell_bandits: { name: 'Bandits at Brackwell', lvl: 8, giver: 'dughan', turnin: 'dughan', pre: ['fargodeep_mine'], text: 'Defias bandits have set up at the Brackwell Pumpkin Patch. Drive them out: 8 bandits.',
      objs: [{ type: 'kill', mob: 'defias_bandit', n: 8 }], reward: { choice: ['fam_waist'] } },
    report_gryan: { name: 'Report to Gryan Stoutmantle', lvl: 10, giver: 'dughan', turnin: 'gryan', text: 'The farmers of Westfall rose up against the Defias. Their leader, Gryan Stoutmantle, holds Sentinel Hill. Go west and offer your sword.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    hogger: { name: 'Wanted: Hogger', where: 'forests_edge', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite in Elwynn. 3 players.', boss: 'hogger', pulls: [{ scene: 'forests_edge', label: 'Riverpaw camp', mobs: ['riverpaw_gnoll', 'riverpaw_gnoll'] }, { scene: 'forests_edge', label: 'Riverpaw camp', mobs: ['riverpaw_gnoll', 'riverpaw_gnoll'] }, { scene: 'forests_edge', label: 'Hogger', mobs: ['hogger'], boss: true }] },
  });

})(typeof window !== 'undefined' ? window : globalThis);