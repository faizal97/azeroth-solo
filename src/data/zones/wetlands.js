// The Greenfen and Gullhaven: Accord, levels 25–30 (v4.2).
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Mirelings in the marsh, raptors at the dig, the Slagborn in Kaldhelm, and the Wyrmchain below Drakestone Hold.
(function (root) {
  const D = root.D;
  D.zone('wetlands', { name: 'Greenfen', faction: 'alliance', music: 'greenfen', town: 'greenfen_town' });
  // quest items
  D.item('bluegill_fin', { name: 'Reedgill Fin', slot: 'quest', q: 1, icon: 'fin' });
  D.item('oracle_shell', { name: "Oracle's Shell", slot: 'quest', q: 1, icon: 'chest_box' });
  D.item('raptor_egg', { name: 'Mottled Raptor Egg', slot: 'quest', q: 1, icon: 'seed' });
  D.item('screecher_crest', { name: 'Screecher Crest', slot: 'quest', q: 1, icon: 'feather' });
  D.item('mosshide_ear', { name: 'Mudcoat Ear', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('mystic_rattle', { name: 'Mudcoat Rattle', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('dark_iron_ore', { name: 'Slagborn Scraps', slot: 'quest', q: 1, icon: 'dust' });
  D.item('blasting_powder', { name: 'Blasting Powder', slot: 'quest', q: 1, icon: 'dust' });
  D.item('dragonmaw_insignia', { name: 'Wyrmchain Insignia', slot: 'quest', q: 1, icon: 'coin' });
  D.item('shadowcaster_orders', { name: 'Wyrmchain Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('whelp_collar', { name: 'Broken Whelp Collar', slot: 'quest', q: 1, icon: 'ring' });
  D.item('charskull_helm', { name: "Ashskull's Helm", slot: 'quest', q: 1, icon: 'head' });
  D.item('matriarch_claw', { name: "Matriarch's Claw", slot: 'quest', q: 1, icon: 'claw' });
  // named and elite drops
  D.item('charskull_axe', { name: 'Ashskull Flame Axe', slot: 'weapon', wtype: 'axe', q: 3, lvl: 29, dmg: [38, 64], speed: 2.6, stats: { str: 9, sta: 6 }, icon: 'axe', sell: 3900, source: 'Gorlag Ashskull, Wyrmchain Camp' });
  D.item('razormaw_hide', { name: 'Scalehide Hide Leggings', slot: 'legs', atype: 'leather', q: 3, lvl: 30, armor: 124, stats: { agi: 12, sta: 8 }, icon: 'legs', sell: 4300 });
  D.item('razormaw_tooth', { name: 'Matriarch Tooth Necklace', slot: 'finger', q: 3, lvl: 30, stats: { agi: 7, str: 6 }, icon: 'ring', sell: 3900 });
  D.item('razormaw_mail', { name: 'Raptor-Hunter Mail', slot: 'chest', atype: 'mail', q: 3, lvl: 30, armor: 270, stats: { str: 11, sta: 10 }, icon: 'chest_mail', sell: 4500 });

  // creatures
  Object.assign(D.MOBS, {
    bluegill_raider: { name: 'Reedgill Raider', lvl: [25, 26], family: 'humanoid', drops: [['murloc_eye', 0.4]], qdrops: [['bluegill_fin', 0.55]], aggro: 'Mrrglglgl!' },
    bluegill_oracle: { name: 'Reedgill Oracle', ranged: 'nature', lvl: [26, 27], family: 'humanoid', drops: [['murloc_eye', 0.4]], qdrops: [['oracle_shell', 0.45], ['bluegill_fin', 0.3]], aggro: 'Mrrrgl mrrrrgl!' },
    mottled_raptor: { name: 'Mottled Raptor', lvl: [25, 26], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['raptor_egg', 0.45]] },
    mottled_screecher: { name: 'Mottled Screecher', lvl: [26, 27], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['screecher_crest', 0.55]] },
    mosshide_gnoll: { name: 'Mudcoat Gnoll', lvl: [26, 27], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]], qdrops: [['mosshide_ear', 0.55]], aggro: 'Mudcoat take your stuff!' },
    mosshide_mystic: { name: 'Mudcoat Mystic', ranged: 'nature', lvl: [27, 28], family: 'humanoid', drops: [['gnoll_mane', 0.35], ['linen_cloth', 0.3]], qdrops: [['mystic_rattle', 0.5], ['mosshide_ear', 0.3]], aggro: 'Bones say you die here!' },
    dark_iron_dwarf: { name: 'Slagborn Dwarf', lvl: [27, 28], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.45], ['linen_cloth', 0.3]], qdrops: [['dark_iron_ore', 0.55]], aggro: 'For Grimmark!' },
    dark_iron_saboteur: { name: 'Slagborn Saboteur', lvl: [28, 29], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['blasting_powder', 0.5]], aggro: 'Boom goes Keldrun!' },
    dragonmaw_grunt: { name: 'Wyrmchain Grunt', lvl: [28, 29], family: 'humanoid', hpMult: 1.15, drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['dragonmaw_insignia', 0.5]], aggro: 'The Wyrmchain take no prisoners!' },
    dragonmaw_shadowcaster: { name: 'Wyrmchain Shadowcaster', ranged: 'shadow', lvl: [29, 30], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['shadowcaster_orders', 0.4], ['dragonmaw_insignia', 0.3]], aggro: 'Darkness take you!' },
    crimson_whelp: { name: 'Crimson Whelp', fly: 7, lvl: [28, 29], family: 'dragonkin', drops: [['ruined_pelt', 0.2]], qdrops: [['whelp_collar', 0.5]] },
    garneg_charskull: { name: 'Gorlag Ashskull', lvl: [29, 29], family: 'humanoid', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['charskull_axe', 0.35], ['thieves_coin', 1]], qdrops: [['charskull_helm', 1]], aggro: 'Burn, dwarf-friend!' },
    razormaw_matriarch: { name: 'Scalehide Matriarch', lvl: [30, 30], family: 'beast', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'hogger', drops: [['ruined_pelt', 1]], qdrops: [['matriarch_claw', 1]], loot: ['razormaw_hide', 'razormaw_tooth', 'razormaw_mail'] },
  });

  // places
  Object.assign(D.PLACES, {
    menethil_harbor: { name: 'Gullhaven', zone: 'Greenfen', region: 'wetlands', scene: 'menethil_harbor', lvl: [25, 30], safe: true, inn: true, mobs: [], pool: 0, npcs: ['stoutfist', 'glorin', 'rethiel', 'whelgar', 'helbrek', 'murndan'], vendor: 'helbrek', gearVendor: 'murndan',
      links: { bluegill_marsh: 14, whelgars_excavation: 18, saltspray_glen: 18, ironforge: 45, astranaar: 45 }, via: { ironforge: 'Gryphon', astranaar: 'Boat to Mistshore' } },
    bluegill_marsh: { name: 'Reedgill Marsh', zone: 'Greenfen', region: 'wetlands', scene: 'bluegill_marsh', lvl: [25, 27], mobs: [['bluegill_raider', 5], ['bluegill_oracle', 4]], pool: 10, npcs: [], links: { menethil_harbor: 14, saltspray_glen: 16 } },
    whelgars_excavation: { name: "Torvald's Dig", zone: 'Greenfen', region: 'wetlands', scene: 'whelgars_excavation', lvl: [25, 27], mobs: [['mottled_raptor', 5], ['mottled_screecher', 4]], named: { razormaw_matriarch: 150 }, pool: 10, npcs: [], links: { menethil_harbor: 18, dun_modr: 18 } },
    saltspray_glen: { name: 'Seawrack Glen', zone: 'Greenfen', region: 'wetlands', scene: 'saltspray_glen', lvl: [26, 28], mobs: [['mosshide_gnoll', 5], ['mosshide_mystic', 4]], pool: 10, npcs: [], links: { menethil_harbor: 18, bluegill_marsh: 16, dun_modr: 20 } },
    dun_modr: { name: 'Kaldhelm', zone: 'Greenfen', region: 'wetlands', scene: 'dun_modr', lvl: [27, 29], mobs: [['dark_iron_dwarf', 5], ['dark_iron_saboteur', 4]], pool: 10, npcs: [], links: { whelgars_excavation: 18, saltspray_glen: 20, angerfang_encampment: 18 } },
    angerfang_encampment: { name: 'Wyrmchain Camp', zone: 'Greenfen', region: 'wetlands', scene: 'angerfang_encampment', lvl: [28, 30], mobs: [['dragonmaw_grunt', 4], ['dragonmaw_shadowcaster', 3], ['crimson_whelp', 3]], named: { garneg_charskull: 300 }, pool: 10, npcs: [], links: { dun_modr: 18 } },
  });
  D.PLACES.ironforge.links.menethil_harbor = 45; D.PLACES.ironforge.via = Object.assign(D.PLACES.ironforge.via || {}, { menethil_harbor: 'Gryphon' });
  D.PLACES.astranaar.links.menethil_harbor = 45; D.PLACES.astranaar.via.menethil_harbor = 'Boat from Mistshore';

  // people
  Object.assign(D.NPCS, {
    stoutfist: { name: 'Captain Brynjar', title: 'Gullhaven' },
    glorin: { name: 'Gunnar Hallsson', title: 'Mountaineer' },
    rethiel: { name: 'Ysra Fenwatch', title: 'Druid' },
    whelgar: { name: 'Prospector Torvald', title: 'Explorers\' League' },
    helbrek: { name: 'Innkeeper Sif', title: 'Innkeeper' },
    murndan: { name: 'Mund Derrsson', title: 'Weaponsmith' },
  });

  // quests (levels 25–30)
  Object.assign(D.QUESTS, {
    duskwood_wetlands: { name: 'The Harbor', lvl: 25, giver: 'althea', turnin: 'stoutfist', text: 'Gullhaven needs soldiers against the Slagborn and the Wyrmchain. Take the gryphon from Keldrun and report to Captain Brynjar.',
      objs: [{ type: 'visit', place: 'menethil_harbor' }], reward: { money: 900 } },
    bluegill_raiders: { name: 'The Reedgill', lvl: 25, giver: 'stoutfist', turnin: 'stoutfist', text: 'Mirelings raid our fishing boats from Reedgill Marsh. Kill 12 raiders.',
      objs: [{ type: 'kill', mob: 'bluegill_raider', n: 12 }], reward: { choice: ['fam_feet27'] } },
    bluegill_fins: { name: 'Fins for Supper', lvl: 25, giver: 'helbrek', turnin: 'helbrek', text: 'Mireling fin soup is a Gullhaven favourite. Bring me 10 fins.',
      objs: [{ type: 'collect', item: 'bluegill_fin', n: 10 }], reward: { money: 1400 } },
    oracles: { name: 'The Oracles', lvl: 26, giver: 'rethiel', turnin: 'rethiel', pre: ['bluegill_raiders'], text: 'The oracles poison the marsh with their magic. Kill 8 and bring me 5 shells.',
      objs: [{ type: 'kill', mob: 'bluegill_oracle', n: 8 }, { type: 'collect', item: 'oracle_shell', n: 5 }], reward: { choice: ['fam_wrist27'] } },
    raptor_eggs: { name: 'Raptor Eggs', lvl: 25, giver: 'whelgar', turnin: 'whelgar', text: 'The raptors nest in my dig site! Bring me 6 eggs so they stop coming back.',
      objs: [{ type: 'collect', item: 'raptor_egg', n: 6 }], reward: { choice: ['fam_weapon27'] } },
    mottled_raptors: { name: 'Clear the Dig', lvl: 26, giver: 'whelgar', turnin: 'whelgar', pre: ['raptor_eggs'], text: 'Kill 12 raptors and my diggers can get back to work.',
      objs: [{ type: 'kill', mob: 'mottled_raptor', n: 12 }], reward: { money: 1500 } },
    screecher_crests: { name: 'Screecher Crests', lvl: 26, giver: 'glorin', turnin: 'glorin', text: 'The screechers warn every raptor for miles. Bring me 8 crests.',
      objs: [{ type: 'collect', item: 'screecher_crest', n: 8 }], reward: { choice: ['fam_back28'] } },
    mosshide: { name: 'The Mudcoat', lvl: 27, giver: 'stoutfist', turnin: 'stoutfist', text: 'Mudcoat gnolls steal from the road to Seawrack Glen. Kill 12.',
      objs: [{ type: 'kill', mob: 'mosshide_gnoll', n: 12 }], reward: { choice: ['fam_chest28'] } },
    mosshide_ears: { name: 'Mudcoat Bounty', lvl: 27, giver: 'glorin', turnin: 'glorin', text: 'The harbour pays for gnoll ears. Bring me 10.',
      objs: [{ type: 'collect', item: 'mosshide_ear', n: 10 }], reward: { money: 1600 } },
    mystics_wl: { name: 'Rattles in the Glen', lvl: 28, giver: 'rethiel', turnin: 'rethiel', pre: ['mosshide'], text: 'The mystics call the gnolls together with their rattles. Kill 8 and bring me 5 rattles.',
      objs: [{ type: 'kill', mob: 'mosshide_mystic', n: 8 }, { type: 'collect', item: 'mystic_rattle', n: 5 }], reward: { choice: ['fam_hands29'] } },
    dun_modr_scout: { name: 'Kaldhelm', lvl: 27, giver: 'glorin', turnin: 'glorin', text: 'The Slagborn hold Kaldhelm, north of the dig. See how many there are.',
      objs: [{ type: 'visit', place: 'dun_modr' }], reward: { money: 1000 } },
    dark_iron: { name: 'The Slagborn', lvl: 28, giver: 'glorin', turnin: 'glorin', pre: ['dun_modr_scout'], text: 'Kill 12 Slagborn dwarves. For Keldrun.',
      objs: [{ type: 'kill', mob: 'dark_iron_dwarf', n: 12 }], reward: { choice: ['fam_legs28'] } },
    dark_iron_scraps: { name: 'Slagborn Scraps', lvl: 28, giver: 'murndan', turnin: 'murndan', pre: ['dun_modr_scout'], text: 'Slagborn makes the best steel. Bring me 8 scraps.',
      objs: [{ type: 'collect', item: 'dark_iron_ore', n: 8 }], reward: { money: 1700 } },
    saboteurs: { name: 'Saboteurs', lvl: 29, giver: 'stoutfist', turnin: 'stoutfist', pre: ['dark_iron'], text: 'Saboteurs plan to blow the Harrow Span. Kill 10 and bring me 5 kegs of blasting powder.',
      objs: [{ type: 'kill', mob: 'dark_iron_saboteur', n: 10 }, { type: 'collect', item: 'blasting_powder', n: 5 }], reward: { choice: ['fam_waist29'] } },
    angerfang_scout: { name: 'Wyrmchain Camp', lvl: 28, giver: 'stoutfist', turnin: 'stoutfist', text: 'The Wyrmchain orcs camp below Drakestone Hold. Scout their encampment.',
      objs: [{ type: 'visit', place: 'angerfang_encampment' }], reward: { money: 1000 } },
    dragonmaw: { name: 'The Wyrmchain', lvl: 29, giver: 'stoutfist', turnin: 'stoutfist', pre: ['angerfang_scout'], text: 'The Wyrmchain ride dragons against us. Kill 12 grunts.',
      objs: [{ type: 'kill', mob: 'dragonmaw_grunt', n: 12 }], reward: { choice: ['fam_weapon30'] } },
    dragonmaw_insignias: { name: 'Wyrmchain Insignias', lvl: 29, giver: 'glorin', turnin: 'glorin', pre: ['angerfang_scout'], text: 'Bring me 10 insignias. Keldrun will want proof.',
      objs: [{ type: 'collect', item: 'dragonmaw_insignia', n: 10 }], reward: { money: 1800 } },
    whelp_collars: { name: 'Chained Wings', lvl: 29, giver: 'rethiel', turnin: 'rethiel', pre: ['angerfang_scout'], text: 'They keep young red dragons in chains. Kill 8 whelps before they are trained for war, and bring me 4 of the collars.',
      objs: [{ type: 'kill', mob: 'crimson_whelp', n: 8 }, { type: 'collect', item: 'whelp_collar', n: 4 }], reward: { choice: ['fam_back28'] } },
    shadowcasters: { name: 'The Shadowcasters', lvl: 30, giver: 'stoutfist', turnin: 'stoutfist', pre: ['dragonmaw'], text: 'The shadowcasters bind the dragons with dark magic. Kill 10 and bring me their orders.',
      objs: [{ type: 'kill', mob: 'dragonmaw_shadowcaster', n: 10 }, { type: 'collect', item: 'shadowcaster_orders', n: 1 }], reward: { choice: ['fam_chest28'] } },
    charskull_q: { name: 'Gorlag Ashskull', lvl: 29, giver: 'glorin', turnin: 'glorin', text: 'Gorlag Ashskull leads the Wyrmchain raids. He is rarely seen outside the camp. Bring me his helm.',
      objs: [{ type: 'collect', item: 'charskull_helm', n: 1 }], reward: { choice: ['fam_back_rare30'] } },
    marsh_patrol: { name: 'Marsh Patrol', lvl: 26, giver: 'stoutfist', turnin: 'stoutfist', pre: ['oracles'], text: 'Push the mirelings back: 8 raiders and 6 oracles.',
      objs: [{ type: 'kill', mob: 'bluegill_raider', n: 8 }, { type: 'kill', mob: 'bluegill_oracle', n: 6 }], reward: { money: 1500 } },
    dig_patrol: { name: 'Hold the Dig', lvl: 27, giver: 'whelgar', turnin: 'whelgar', pre: ['mottled_raptors'], text: 'The screechers are back. Kill 10.',
      objs: [{ type: 'kill', mob: 'mottled_screecher', n: 10 }], reward: { choice: ['fam_hands29'] } },
    modr_patrol: { name: 'Keep Them Busy', lvl: 29, giver: 'murndan', turnin: 'murndan', pre: ['dark_iron_scraps'], text: 'Keep the Slagborn in their walls: 8 dwarves and 6 saboteurs.',
      objs: [{ type: 'kill', mob: 'dark_iron_dwarf', n: 8 }, { type: 'kill', mob: 'dark_iron_saboteur', n: 6 }], reward: { money: 1800 } },
    wanted_matriarch: { name: 'Wanted: Scalehide Matriarch', lvl: 30, giver: 'whelgar', turnin: 'whelgar', group: 3, text: 'The raptors answer to a huge old matriarch. She tore apart my best digger. Bring me her claw. Take friends.',
      objs: [{ type: 'collect', item: 'matriarch_claw', n: 1 }], reward: { choice: ['fam_weapon30'] } },
  });

  // group finder: the open-world elite
  Object.assign(D.ACTIVITIES, {
    razormaw: { name: 'Wanted: Scalehide Matriarch', where: 'whelgars_excavation', size: 3, minLvl: 27, maxLvl: 30, desc: 'Open-world elite in the Greenfen. 3 players.', boss: 'razormaw_matriarch', pulls: [{ scene: 'whelgars_excavation', label: 'Raptor nests', mobs: ['mottled_raptor', 'mottled_raptor'] }, { scene: 'whelgars_excavation', label: 'Raptor nests', mobs: ['mottled_screecher', 'mottled_raptor'] }, { scene: 'whelgars_excavation', label: 'Scalehide Matriarch', mobs: ['razormaw_matriarch'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
