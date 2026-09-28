// EXPANSION "The Drowned Crown" (level 60, original story). The Tidewatch Coast is the Alliance side of the Stormveil
// Isle, which rose from the sea in the storm Onyxia left behind (Chapter 6). The Kul Tiran expedition holds Brightwater
// Landing; inland lie the drowned orchards and outskirts of Sael'anor, a Highborne city that sank in the Sundering.
(function (root) {
  const D = root.D;
  D.zone('tidewatch', { name: 'Tidewatch Coast', faction: 'alliance' });
  D.item('reefclaw_meat', { name: 'Reefclaw Meat', slot: 'quest', q: 1, icon: 'meat' });
  D.item('sodden_relic', { name: 'Sodden Highborne Relic', slot: 'quest', q: 1, icon: 'coin' });
  D.item('living_kelp', { name: 'Living Kelp', slot: 'quest', q: 1, icon: 'moss' });
  D.item('tidecrown_insignia', { name: 'Tidecrown Insignia', slot: 'quest', q: 1, icon: 'ring' });
  D.item('drowned_tome', { name: 'Drowned Tome', slot: 'quest', q: 1, icon: 'journal' });
  D.item('brinescale_heart', { name: "Old Brinescale's Heart", slot: 'quest', q: 1, icon: 'zombie_brain' });
  D.item('ithrael_seal', { name: "Warden Ithrael's Seal", slot: 'quest', q: 1, icon: 'coin' });
  D.item('brinescale_band', { name: 'Brinescale Band', slot: 'finger', q: 3, lvl: 60, stats: { sta: 15, str: 12 }, icon: 'ring', sell: 13000, source: 'Old Brinescale, Saltmarsh Shallows' });
  D.item('ithrael_glaive', { name: "Warden's Tideglaive", slot: 'weapon', wtype: 'staff', q: 3, lvl: 60, dmg: [98, 146], speed: 3.3, stats: { str: 22, agi: 14 }, icon: 'staff', sell: 14000 });
  D.item('ithrael_robe', { name: 'Coral-Woven Robe', slot: 'chest', atype: 'cloth', q: 3, lvl: 60, armor: 126, stats: { int: 24, spi: 17 }, sp: 30, icon: 'chest_cloth', sell: 13600 });
  D.item('ithrael_plate', { name: 'Tidebound Hauberk', slot: 'chest', atype: 'mail', q: 3, lvl: 60, armor: 526, stats: { str: 24, sta: 21 }, icon: 'chest_mail', sell: 13800 });

  Object.assign(D.MOBS, {
    reefclaw_snapper: { name: 'Reefclaw Snapper', lvl: [59, 60], family: 'beast', drops: [['light_leather', 0.2]], qdrops: [['reefclaw_meat', 0.55]] },
    tidebound_husk: { name: 'Tidebound Husk', lvl: [59, 60], family: 'undead', hpMult: 1.1, drops: [['thieves_coin', 0.5]], qdrops: [['sodden_relic', 0.5]], aggro: 'The sea... remembers...' },
    kelp_horror: { name: 'Kelp Horror', lvl: [59, 60], family: 'elemental', hpMult: 1.2, drops: [['trogg_stone', 0.2]], qdrops: [['living_kelp', 0.55]] },
    tidebound_sentinel: { name: 'Tidebound Sentinel', lvl: [60, 60], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['tidecrown_insignia', 0.5]], aggro: 'For the Tidecrown!' },
    tidebound_sorceress: { name: 'Tidebound Sorceress', lvl: [60, 60], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.4]], qdrops: [['drowned_tome', 0.45]], aggro: 'You breathe too loudly, surface-dweller.' },
    old_brinescale: { name: 'Old Brinescale', lvl: [60, 60], family: 'beast', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['brinescale_band', 0.35], ['light_leather', 1]], qdrops: [['brinescale_heart', 1]] },
    warden_ithrael: { name: 'Warden Ithrael', lvl: [60, 60], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'molten', specialText: 'Warden Ithrael hurls a crashing wave!', drops: [['thieves_coin', 1]], qdrops: [['ithrael_seal', 1]], loot: ['ithrael_glaive', 'ithrael_robe', 'ithrael_plate'], aggro: 'No surface-dweller passes the Warden.' },
  });

  Object.assign(D.PLACES, {
    brightwater_landing: { name: 'Brightwater Landing', zone: 'Tidewatch Coast', region: 'tidewatch', faction: 'alliance', scene: 'brightwater_landing', lvl: [60, 60], safe: true, inn: true, mobs: [], pool: 0, npcs: ['admiral_vane', 'lyssa_moonquill', 'sergeant_tamsin', 'quartermaster_brenn', 'armorer_hale'], vendor: 'quartermaster_brenn', gearVendor: 'armorer_hale',
      links: { saltmarsh_shallows: 16, drowned_orchards: 18, menethil_harbor: 60 }, via: { menethil_harbor: 'Kul Tiran ship' } },
    saltmarsh_shallows: { name: 'Saltmarsh Shallows', zone: 'Tidewatch Coast', region: 'tidewatch', scene: 'saltmarsh_shallows', lvl: [60, 60], mobs: [['reefclaw_snapper', 6], ['kelp_horror', 2]], named: { old_brinescale: 300 }, pool: 9, npcs: [], links: { brightwater_landing: 16, kelpwood: 18 } },
    kelpwood: { name: 'The Kelpwood', zone: 'Tidewatch Coast', region: 'tidewatch', scene: 'kelpwood', lvl: [60, 60], mobs: [['kelp_horror', 6], ['reefclaw_snapper', 2]], pool: 9, npcs: [], links: { saltmarsh_shallows: 18, sael_anor_outskirts: 18 } },
    drowned_orchards: { name: 'The Drowned Orchards', zone: 'Tidewatch Coast', region: 'tidewatch', scene: 'drowned_orchards', lvl: [60, 60], mobs: [['tidebound_husk', 7]], pool: 9, npcs: [], links: { brightwater_landing: 18, sael_anor_outskirts: 18, archive_steps: 16 } },
    archive_steps: { name: 'The Archive Steps', zone: 'Tidewatch Coast', region: 'tidewatch', faction: 'alliance', scene: 'archive_steps', lvl: [60, 60], safe: true, mobs: [], pool: 0, npcs: [], links: { drowned_orchards: 16 } },
    sael_anor_outskirts: { name: "Sael'anor Outskirts", zone: 'Tidewatch Coast', region: 'tidewatch', scene: 'sael_anor_outskirts', lvl: [60, 60], mobs: [['tidebound_sentinel', 5], ['tidebound_sorceress', 4]], named: { warden_ithrael: 150 }, pool: 10, npcs: [], links: { drowned_orchards: 18, kelpwood: 18, drowned_causeway: 20 } },
  });
  D.PLACES.menethil_harbor.links.brightwater_landing = 60; D.PLACES.menethil_harbor.via.brightwater_landing = 'Kul Tiran ship';

  Object.assign(D.NPCS, {
    admiral_vane: { name: 'Admiral Hollin Vane', title: 'Kul Tiran Navy' },
    lyssa_moonquill: { name: 'Lyssa Moonquill', title: 'Keeper of Lore' },
    sergeant_tamsin: { name: 'Sergeant Tamsin Reed', title: 'Brightwater Watch' },
    quartermaster_brenn: { name: 'Quartermaster Brenn', title: 'Supplies' },
    armorer_hale: { name: 'Armorer Hale', title: 'Weaponsmith' },
  });

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  A('x_to_tidewatch', { name: 'The Drowned Crown', lvl: 60, storm: true, giver: 'stoutfist', turnin: 'admiral_vane', text: 'An island rose from the sea in the storm the dragon left behind. With the dragon dead, the storm has broken, and Admiral Vane sails for it from this harbour. He needs every sword he can get.',
    objs: [{ type: 'visit', place: 'brightwater_landing' }], reward: { money: 4000 } });
  A('tw_snappers', { name: 'Snappers on the Shore', lvl: 60, giver: 'sergeant_tamsin', turnin: 'sergeant_tamsin', text: 'Reefclaw snappers keep cutting my sentries. Kill 12.',
    objs: [{ type: 'kill', mob: 'reefclaw_snapper', n: 12 }], reward: { choice: ['fam_feet60'] } });
  A('tw_crab_meat', { name: 'Supper at Brightwater', lvl: 60, giver: 'quartermaster_brenn', turnin: 'quartermaster_brenn', pre: ['tw_snappers'], text: 'The ship\'s biscuits are gone. Bring me 8 reefclaw meats.',
    objs: [{ type: 'collect', item: 'reefclaw_meat', n: 8 }], reward: { money: 9000 } });
  A('tw_husks', { name: 'The Drowned Orchards', lvl: 60, giver: 'lyssa_moonquill', turnin: 'lyssa_moonquill', text: "The husks in the orchards were Highborne once. Whatever keeps them moving is not mercy. Put 12 to rest.",
    objs: [{ type: 'kill', mob: 'tidebound_husk', n: 12 }], reward: { choice: ['fam_wrist60'] } });
  A('tw_relics', { name: 'Sodden Relics', lvl: 60, giver: 'lyssa_moonquill', turnin: 'lyssa_moonquill', pre: ['tw_husks'], text: 'Bring me 8 relics from the husks. They will tell me who ruled here.',
    objs: [{ type: 'collect', item: 'sodden_relic', n: 8 }], reward: { choice: ['fam_back60'] } });
  A('tw_kelp', { name: 'The Kelpwood', lvl: 60, giver: 'sergeant_tamsin', turnin: 'sergeant_tamsin', text: 'The kelp here walks. Kill 10 kelp horrors and bring me 6 samples, before the alchemists ask again.',
    objs: [{ type: 'kill', mob: 'kelp_horror', n: 10 }, { type: 'collect', item: 'living_kelp', n: 6 }], reward: { choice: ['fam_hands60'] } });
  A('tw_shore_patrol', { name: 'Shore Patrol', lvl: 60, giver: 'sergeant_tamsin', turnin: 'sergeant_tamsin', pre: ['tw_kelp'], text: '8 snappers and 8 kelp horrors. Then the road to the Kelpwood is ours.',
    objs: [{ type: 'kill', mob: 'reefclaw_snapper', n: 8 }, { type: 'kill', mob: 'kelp_horror', n: 8 }], reward: { money: 9500 } });
  A('tw_sentinels', { name: "The Tidecrown's Soldiers", lvl: 60, giver: 'admiral_vane', turnin: 'admiral_vane', text: "Armed soldiers walk out of the sea at Sael'anor, in armour grown from coral. They attacked my scouts. Kill 12.",
    objs: [{ type: 'kill', mob: 'tidebound_sentinel', n: 12 }], reward: { choice: ['fam_legs60'] } });
  A('tw_insignia', { name: 'Tidecrown Insignia', lvl: 60, giver: 'admiral_vane', turnin: 'admiral_vane', pre: ['tw_sentinels'], text: 'Bring me 8 of their insignia. I want to know whose army this is.',
    objs: [{ type: 'collect', item: 'tidecrown_insignia', n: 8 }], reward: { money: 9500 } });
  A('tw_sorceresses', { name: 'Drowned Tomes', lvl: 60, giver: 'lyssa_moonquill', turnin: 'lyssa_moonquill', pre: ['tw_relics'], text: 'Their sorceresses carry books that never got wet. Kill 10 and bring me 5 tomes.',
    objs: [{ type: 'kill', mob: 'tidebound_sorceress', n: 10 }, { type: 'collect', item: 'drowned_tome', n: 5 }], reward: { choice: ['fam_chest60'] } });
  A('tw_outskirts', { name: "Hold Sael'anor", lvl: 60, giver: 'admiral_vane', turnin: 'admiral_vane', pre: ['tw_sentinels'], text: '8 sentinels and 6 sorceresses. Push them back to the causeway.',
    objs: [{ type: 'kill', mob: 'tidebound_sentinel', n: 8 }, { type: 'kill', mob: 'tidebound_sorceress', n: 6 }], reward: { choice: ['fam_waist60'] } });
  A('tw_causeway', { name: 'The Causeway', lvl: 60, giver: 'admiral_vane', turnin: 'admiral_vane', pre: ['tw_outskirts'], text: 'A causeway runs from the outskirts to a citadel out in the surf. Go and see it. Then tell me I am not mad.',
    objs: [{ type: 'visit', place: 'drowned_causeway' }], reward: { money: 8000 } });
  A('tw_brinescale', { name: 'Old Brinescale', lvl: 60, giver: 'sergeant_tamsin', turnin: 'sergeant_tamsin', text: 'A reefclaw the size of a rowing boat hides in the shallows. The men call it Old Brinescale. Bring me its heart.',
    objs: [{ type: 'collect', item: 'brinescale_heart', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  A('tw_ithrael', { name: 'Wanted: Warden Ithrael', lvl: 60, giver: 'admiral_vane', turnin: 'admiral_vane', group: 3, text: "The Tidecrown's warden guards the outskirts and has sunk two of my boats. Bring me his seal. Take friends.",
    objs: [{ type: 'collect', item: 'ithrael_seal', n: 1 }], reward: { choice: ['fam_back_rare60'] } });
  Object.assign(D.ACTIVITIES, {
    ithrael: { name: 'Wanted: Warden Ithrael', where: 'sael_anor_outskirts', size: 3, minLvl: 60, maxLvl: 60, desc: 'Open-world elite on the Tidewatch Coast. 3 players.', boss: 'warden_ithrael', pulls: [{ scene: 'sael_anor_outskirts', label: 'The outskirts', mobs: ['tidebound_sentinel', 'tidebound_sorceress'] }, { scene: 'sael_anor_outskirts', label: 'The outskirts', mobs: ['tidebound_sentinel', 'tidebound_sentinel'] }, { scene: 'sael_anor_outskirts', label: 'Warden Ithrael', mobs: ['warden_ithrael'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
