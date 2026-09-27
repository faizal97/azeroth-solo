// Tanaris and Gadgetzan: contested desert, levels 40–46 (v6). Gadgetzan is a neutral goblin town that both factions use;
// its quests are open to everyone. A goblin zeppelin joins it to Nesingwary's camp in Stranglethorn.
(function (root) {
  const D = root.D;
  D.zone('tanaris', { name: 'Tanaris', faction: 'contested' });
  D.item('bandit_bandana', { name: 'Wastewander Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  D.item('water_pouch', { name: 'Stolen Water Pouch', slot: 'quest', q: 1, icon: 'water' });
  D.item('pirate_hat', { name: 'Southsea Tricorn', slot: 'quest', q: 1, icon: 'head' });
  D.item('pirate_gold', { name: 'Stolen Pirate Doubloon', slot: 'quest', q: 1, icon: 'coin' });
  D.item('silithid_carapace', { name: 'Centipaar Carapace', slot: 'quest', q: 1, icon: 'chest_box' });
  D.item('stinger_venom', { name: 'Centipaar Venom Sac', slot: 'quest', q: 1, icon: 'venom' });
  D.item('dunemaul_tooth', { name: 'Dunemaul Tooth', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('rootshaper_dew', { name: 'Thistleshrub Dew', slot: 'quest', q: 1, icon: 'water' });
  D.item('scorpid_stinger_t', { name: 'Dunestalker Stinger', slot: 'quest', q: 1, icon: 'scorpid_stinger' });
  D.item('sandfury_scalp', { name: 'Sandfury Scalp', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('caliph_helm', { name: "Caliph Scorpidsting's Helm", slot: 'quest', q: 1, icon: 'head' });
  D.item('keelhaul_hook', { name: "Kregg Keelhaul's Hook", slot: 'quest', q: 1, icon: 'claw' });
  D.item('caliph_blade', { name: 'Scorpidsting Scimitar', slot: 'weapon', wtype: 'sword', q: 3, lvl: 44, dmg: [52, 86], speed: 2.6, stats: { agi: 12, sta: 8 }, icon: 'sword', sell: 6200, source: 'Caliph Scorpidsting, Waterspring Field' });
  D.item('keelhaul_coat', { name: "Captain's Greatcoat", slot: 'chest', atype: 'leather', q: 3, lvl: 46, armor: 214, stats: { agi: 16, sta: 12 }, icon: 'chest_leather', sell: 7400 });
  D.item('keelhaul_cutlass', { name: 'Keelhaul Cutlass', slot: 'weapon', wtype: 'sword', q: 3, lvl: 46, dmg: [56, 92], speed: 2.6, stats: { str: 13, sta: 9 }, icon: 'sword', sell: 7600 });
  D.item('keelhaul_ring', { name: 'Signet of the Southsea', slot: 'finger', q: 3, lvl: 46, stats: { int: 10, sta: 10 }, icon: 'ring', sell: 7000 });

  Object.assign(D.MOBS, {
    wastewander_bandit: { name: 'Wastewander Bandit', lvl: [40, 41], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['bandit_bandana', 0.5], ['water_pouch', 0.3]], aggro: 'This desert is ours!' },
    wastewander_shadow_mage: { name: 'Wastewander Shadow Mage', lvl: [41, 42], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['water_pouch', 0.45]], aggro: 'The sands will bury you!' },
    thistleshrub_rootshaper: { name: 'Thistleshrub Rootshaper', lvl: [40, 41], family: 'elemental', hpMult: 1.1, drops: [['trogg_stone', 0.3]], qdrops: [['rootshaper_dew', 0.55]] },
    southsea_pirate: { name: 'Southsea Pirate', lvl: [42, 43], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['pirate_hat', 0.5], ['pirate_gold', 0.3]], aggro: 'Arr, fresh meat for the sharks!' },
    southsea_cannoneer: { name: 'Southsea Cannoneer', lvl: [43, 44], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['pirate_gold', 0.45]], aggro: 'Fire in the hole!' },
    centipaar_worker: { name: 'Centipaar Worker', lvl: [42, 43], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['silithid_carapace', 0.55]] },
    centipaar_stinger: { name: 'Centipaar Stinger', lvl: [43, 44], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['stinger_venom', 0.55], ['silithid_carapace', 0.3]] },
    scorpid_dunestalker: { name: 'Scorpid Dunestalker', lvl: [43, 44], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.3]], qdrops: [['scorpid_stinger_t', 0.55]] },
    dunemaul_brute: { name: 'Dunemaul Brute', lvl: [44, 45], family: 'giant', hpMult: 1.2, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['dunemaul_tooth', 0.55]], aggro: 'Dunemaul smash!' },
    dunemaul_ogre_mage: { name: 'Dunemaul Ogre Mage', lvl: [45, 46], family: 'giant', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['dunemaul_tooth', 0.4]], aggro: 'Me burn you! No, me! Both!' },
    caliph_scorpidsting: { name: 'Caliph Scorpidsting', lvl: [44, 44], family: 'humanoid', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['caliph_blade', 0.35], ['thieves_coin', 1]], qdrops: [['caliph_helm', 1]], aggro: 'Nobody steals from the Caliph!' },
    kregg_keelhaul: { name: 'Kregg Keelhaul', lvl: [46, 46], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'slam', specialText: 'Kregg Keelhaul swings his hook!', drops: [['thieves_coin', 1]], qdrops: [['keelhaul_hook', 1]], loot: ['keelhaul_coat', 'keelhaul_cutlass', 'keelhaul_ring'], aggro: 'Nobody boards my ship uninvited!' },
  });

  Object.assign(D.PLACES, {
    gadgetzan: { name: 'Gadgetzan', zone: 'Tanaris', region: 'tanaris', scene: 'gadgetzan', lvl: [40, 50], safe: true, inn: true, mobs: [], pool: 0, npcs: ['noggenfogger', 'bilgewhizzle', 'sprinkle', 'fizzledowser', 'innkeeper_fizzgrimble', 'blizrik'], vendor: 'innkeeper_fizzgrimble', gearVendor: 'blizrik',
      links: { waterspring_field: 16, thistleshrub_valley: 18, lost_rigger_cove: 20, noxious_lair: 18, nesingwary_camp: 50 }, via: { nesingwary_camp: 'Goblin zeppelin' } },
    waterspring_field: { name: 'Waterspring Field', zone: 'Tanaris', region: 'tanaris', scene: 'waterspring_field', lvl: [40, 42], mobs: [['wastewander_bandit', 5], ['wastewander_shadow_mage', 4]], named: { caliph_scorpidsting: 300 }, pool: 10, npcs: [], links: { gadgetzan: 16, eastmoon_ruins: 18 } },
    thistleshrub_valley: { name: 'Thistleshrub Valley', zone: 'Tanaris', region: 'tanaris', scene: 'thistleshrub_valley', lvl: [40, 42], mobs: [['thistleshrub_rootshaper', 6], ['wastewander_bandit', 2]], pool: 9, npcs: [], links: { gadgetzan: 18, zul_farrak_gate: 18 } },
    lost_rigger_cove: { name: 'Lost Rigger Cove', zone: 'Tanaris', region: 'tanaris', scene: 'lost_rigger_cove', lvl: [42, 44], mobs: [['southsea_pirate', 5], ['southsea_cannoneer', 4]], named: { kregg_keelhaul: 150 }, pool: 10, npcs: [], links: { gadgetzan: 20 } },
    noxious_lair: { name: 'The Noxious Lair', zone: 'Tanaris', region: 'tanaris', scene: 'noxious_lair', lvl: [42, 44], mobs: [['centipaar_worker', 5], ['centipaar_stinger', 4]], pool: 10, npcs: [], links: { gadgetzan: 18, dunemaul_compound: 18 } },
    eastmoon_ruins: { name: 'Eastmoon Ruins', zone: 'Tanaris', region: 'tanaris', scene: 'eastmoon_ruins', lvl: [43, 45], mobs: [['scorpid_dunestalker', 7]], pool: 9, npcs: [], links: { waterspring_field: 18, dunemaul_compound: 16 } },
    dunemaul_compound: { name: 'Dunemaul Compound', zone: 'Tanaris', region: 'tanaris', scene: 'dunemaul_compound', lvl: [44, 46], mobs: [['dunemaul_brute', 5], ['dunemaul_ogre_mage', 4]], pool: 10, npcs: [], links: { noxious_lair: 18, eastmoon_ruins: 16 } },
    zul_farrak_gate: { name: "Zul'Farrak", zone: 'Tanaris', region: 'tanaris', scene: 'zul_farrak_gate', lvl: [43, 47], mobs: [['sandfury_blood_drinker', 4], ['sandfury_shadowcaster', 3]], pool: 7, npcs: [], links: { thistleshrub_valley: 18 } },
  });
  D.PLACES.nesingwary_camp.links.gadgetzan = 50; D.PLACES.nesingwary_camp.via = Object.assign(D.PLACES.nesingwary_camp.via || {}, { gadgetzan: 'Goblin zeppelin' });

  Object.assign(D.NPCS, {
    noggenfogger: { name: 'Marin Noggenfogger', title: 'Baron of Gadgetzan' },
    bilgewhizzle: { name: 'Chief Engineer Bilgewhizzle', title: 'Water Works' },
    sprinkle: { name: 'Sprinkle', title: 'Water Works' },
    fizzledowser: { name: 'Senior Surveyor Fizzledowser', title: 'Surveyor' },
    innkeeper_fizzgrimble: { name: 'Innkeeper Fizzgrimble', title: 'Innkeeper' },
    blizrik: { name: 'Blizrik Buckshot', title: 'Weaponsmith' },
  });

  const Q = (id, q) => { D.QUESTS[id] = q; };
  Q('stv_tanaris', { name: 'Gadgetzan', lvl: 40, giver: 'nesingwary', turnin: 'noggenfogger', text: 'The goblins of Gadgetzan pay well for hunters. Take the zeppelin from my camp to Tanaris and ask for the Baron.',
    objs: [{ type: 'visit', place: 'gadgetzan' }], reward: { money: 1500 } });
  Q('wastewander_justice', { name: 'Wastewander Justice', lvl: 40, giver: 'bilgewhizzle', turnin: 'bilgewhizzle', text: 'The Wastewander bandits steal our water. Kill 12 bandits.',
    objs: [{ type: 'kill', mob: 'wastewander_bandit', n: 12 }], reward: { choice: ['fam_feet41'] } });
  Q('water_pouches', { name: 'Water Pouch Bounty', lvl: 41, giver: 'sprinkle', turnin: 'sprinkle', text: 'Bring back 8 of the water pouches they stole.',
    objs: [{ type: 'collect', item: 'water_pouch', n: 8 }], reward: { money: 3200 } });
  Q('shadow_mages', { name: 'The Shadow Mages', lvl: 42, giver: 'bilgewhizzle', turnin: 'bilgewhizzle', pre: ['wastewander_justice'], text: 'Their shadow mages are worse. Kill 10, and bring me 5 bandanas as proof.',
    objs: [{ type: 'kill', mob: 'wastewander_shadow_mage', n: 10 }, { type: 'collect', item: 'bandit_bandana', n: 5 }], reward: { choice: ['fam_wrist42'] } });
  Q('caliph_q', { name: 'Caliph Scorpidsting', lvl: 44, giver: 'noggenfogger', turnin: 'noggenfogger', text: 'The bandit lord Caliph Scorpidsting is rarely seen. Bring me his helm and Gadgetzan will be grateful.',
    objs: [{ type: 'collect', item: 'caliph_helm', n: 1 }], reward: { choice: ['fam_ring_rare45'] } });
  Q('thistleshrub_dew', { name: 'Thistleshrub Dew', lvl: 40, giver: 'sprinkle', turnin: 'sprinkle', text: 'The rootshapers store water in their thorns. Bring me 8 pouches of dew.',
    objs: [{ type: 'collect', item: 'rootshaper_dew', n: 8 }], reward: { choice: ['fam_hands41'] } });
  Q('rootshapers', { name: 'Walking Cacti', lvl: 41, giver: 'fizzledowser', turnin: 'fizzledowser', text: 'The rootshapers crowd the valley road. Kill 12.',
    objs: [{ type: 'kill', mob: 'thistleshrub_rootshaper', n: 12 }], reward: { money: 3100 } });
  Q('southsea_pirates', { name: 'Pirate Hats Ahoy!', lvl: 42, giver: 'noggenfogger', turnin: 'noggenfogger', text: 'Southsea pirates raid our shipping. Kill 12 and bring me 6 of their hats.',
    objs: [{ type: 'kill', mob: 'southsea_pirate', n: 12 }, { type: 'collect', item: 'pirate_hat', n: 6 }], reward: { choice: ['fam_chest43'] } });
  Q('pirate_gold_q', { name: 'Stolen Doubloons', lvl: 43, giver: 'blizrik', turnin: 'blizrik', text: 'The pirates stole my savings. Bring back 10 doubloons.',
    objs: [{ type: 'collect', item: 'pirate_gold', n: 10 }], reward: { money: 3500 } });
  Q('cannoneers', { name: 'Silence the Cannons', lvl: 43, giver: 'bilgewhizzle', turnin: 'bilgewhizzle', pre: ['southsea_pirates'], text: 'The cannoneers shell our water towers. Kill 10.',
    objs: [{ type: 'kill', mob: 'southsea_cannoneer', n: 10 }], reward: { choice: ['fam_weapon43'] } });
  Q('keelhaul_q', { name: 'Wanted: Kregg Keelhaul', lvl: 46, giver: 'noggenfogger', turnin: 'noggenfogger', pre: ['cannoneers'], group: 3, text: 'Their captain, Kregg Keelhaul, runs the cove. Bring me his hook. Take friends.',
    objs: [{ type: 'collect', item: 'keelhaul_hook', n: 1 }], reward: { choice: ['fam_weapon46'] } });
  Q('silithid_carapaces', { name: 'The Noxious Lair', lvl: 42, giver: 'fizzledowser', turnin: 'fizzledowser', text: 'Silithid insects nest east of town. Bring me 8 carapaces. I want to know what they are.',
    objs: [{ type: 'collect', item: 'silithid_carapace', n: 8 }], reward: { choice: ['fam_back43'] } });
  Q('centipaar', { name: 'Thinning the Hive', lvl: 43, giver: 'bilgewhizzle', turnin: 'bilgewhizzle', pre: ['silithid_carapaces'], text: 'Kill 10 workers and 8 stingers before the hive grows.',
    objs: [{ type: 'kill', mob: 'centipaar_worker', n: 10 }, { type: 'kill', mob: 'centipaar_stinger', n: 8 }], reward: { choice: ['fam_legs44'] } });
  Q('stinger_venom_q', { name: 'Venom Samples', lvl: 44, giver: 'fizzledowser', turnin: 'fizzledowser', pre: ['centipaar'], text: 'Bring me 6 venom sacs from the stingers.',
    objs: [{ type: 'collect', item: 'stinger_venom', n: 6 }], reward: { money: 3800 } });
  Q('dunestalkers', { name: 'Dunestalkers', lvl: 44, giver: 'sprinkle', turnin: 'sprinkle', text: 'Giant scorpids stalk the Eastmoon Ruins. Kill 12 and bring me 6 stingers.',
    objs: [{ type: 'kill', mob: 'scorpid_dunestalker', n: 12 }, { type: 'collect', item: 'scorpid_stinger_t', n: 6 }], reward: { choice: ['fam_waist44'] } });
  Q('dunemaul', { name: 'The Dunemaul', lvl: 45, giver: 'noggenfogger', turnin: 'noggenfogger', text: 'Ogres from the Dunemaul Compound raid our caravans. Kill 12 brutes.',
    objs: [{ type: 'kill', mob: 'dunemaul_brute', n: 12 }], reward: { choice: ['fam_chest45'] } });
  Q('ogre_mages_t', { name: 'Two Heads, No Brains', lvl: 46, giver: 'blizrik', turnin: 'blizrik', pre: ['dunemaul'], text: 'Their ogre mages burn our wagons. Kill 10 and bring me 6 teeth.',
    objs: [{ type: 'kill', mob: 'dunemaul_ogre_mage', n: 10 }, { type: 'collect', item: 'dunemaul_tooth', n: 6 }], reward: { choice: ['fam_hands46'] } });
  Q('sandfury', { name: 'The Sandfury', lvl: 43, giver: 'fizzledowser', turnin: 'fizzledowser', text: 'The Sandfury trolls of Zul\'Farrak attack anyone near their walls. Kill 10 and bring me 5 scalps.',
    objs: [{ type: 'kill', mob: 'sandfury_blood_drinker', n: 10 }, { type: 'collect', item: 'sandfury_scalp', n: 5 }], reward: { choice: ['fam_feet44'] } });
  Q('bandit_patrol', { name: 'Keep the Wells Safe', lvl: 42, giver: 'sprinkle', turnin: 'sprinkle', pre: ['water_pouches'], text: 'Guard the wells: 8 bandits and 6 shadow mages.',
    objs: [{ type: 'kill', mob: 'wastewander_bandit', n: 8 }, { type: 'kill', mob: 'wastewander_shadow_mage', n: 6 }], reward: { money: 3400 } });
  Q('cove_patrol', { name: 'Clear the Cove', lvl: 44, giver: 'blizrik', turnin: 'blizrik', pre: ['pirate_gold_q'], text: 'Keep the pirates on their ship: 8 pirates and 6 cannoneers.',
    objs: [{ type: 'kill', mob: 'southsea_pirate', n: 8 }, { type: 'kill', mob: 'southsea_cannoneer', n: 6 }], reward: { choice: ['fam_back44'] } });
  Q('dune_patrol', { name: 'Ogre Patrol', lvl: 46, giver: 'sprinkle', turnin: 'sprinkle', pre: ['ogre_mages_t'], text: 'Push the ogres back: 8 brutes and 6 mages.',
    objs: [{ type: 'kill', mob: 'dunemaul_brute', n: 8 }, { type: 'kill', mob: 'dunemaul_ogre_mage', n: 6 }], reward: { money: 4000 } });
  Object.assign(D.ACTIVITIES, {
    keelhaul: { name: 'Wanted: Kregg Keelhaul', where: 'lost_rigger_cove', size: 3, minLvl: 43, maxLvl: 46, desc: 'Open-world elite in Tanaris. 3 players.', boss: 'kregg_keelhaul', pulls: [{ scene: 'lost_rigger_cove', label: 'The docks', mobs: ['southsea_pirate', 'southsea_pirate'] }, { scene: 'lost_rigger_cove', label: 'The docks', mobs: ['southsea_cannoneer', 'southsea_pirate'] }, { scene: 'lost_rigger_cove', label: 'Kregg Keelhaul', mobs: ['kregg_keelhaul'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
