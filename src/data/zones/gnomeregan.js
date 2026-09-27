// Gnomeregan (Alliance dungeon, levels 29–34, v5): the fallen gnome city under Dun Morogh.
// The gate is a place in Dun Morogh; the dungeon is reached by the group finder from there.
(function (root) {
  const D = root.D;
  D.item('thermaplugg_head', { name: "Mekgineer Thermaplugg's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('prismatic_punch_card', { name: 'Prismatic Punch Card', slot: 'quest', q: 1, icon: 'journal' });
  D.item('grime_encrusted_ring', { name: 'Grime-Encrusted Ring', slot: 'quest', q: 1, icon: 'ring' });
  // drops (levels 30-33)
  D.item('grubbis_hide', { name: 'Trogg Hide Vest', slot: 'chest', atype: 'leather', q: 3, lvl: 30, armor: 150, stats: { agi: 11, sta: 9 }, icon: 'chest_leather', sell: 4200 });
  D.item('fallout_cloak', { name: 'Glowing Irradiated Cloak', slot: 'back', q: 3, lvl: 31, armor: 46, stats: { int: 8, sta: 7 }, icon: 'cloak', sell: 4200 });
  D.item('fallout_ring', { name: 'Radiant Band', slot: 'finger', q: 3, lvl: 31, stats: { sta: 8, spi: 6 }, icon: 'ring', sell: 4100 });
  D.item('electrocutioner_legs', { name: 'Electrocutioner Legs', slot: 'legs', atype: 'mail', q: 3, lvl: 32, armor: 230, stats: { str: 11, sta: 9 }, icon: 'legs', sell: 4600 });
  D.item('electrocutioner_lagnut', { name: 'Electrocutioner Lagnut', slot: 'finger', q: 3, lvl: 32, stats: { int: 8, sta: 7 }, icon: 'ring', sell: 4400 });
  D.item('pummeler_hammer', { name: 'Crowd Pummeler Knuckles', slot: 'weapon', wtype: 'mace', q: 3, lvl: 32, dmg: [42, 70], speed: 2.6, stats: { str: 11, sta: 6 }, icon: 'mace', sell: 4700 });
  D.item('pummeler_gloves', { name: 'Pummeler Gauntlets', slot: 'hands', atype: 'mail', q: 3, lvl: 32, armor: 142, stats: { str: 9, sta: 7 }, icon: 'gloves', sell: 4400 });
  D.item('thermaplugg_staff', { name: 'Mekgineer Staff', slot: 'weapon', wtype: 'staff', q: 3, lvl: 33, dmg: [56, 84], speed: 3, stats: { int: 14, spi: 9 }, sp: 22, icon: 'staff', sell: 5000 });
  D.item('thermaplugg_blade', { name: 'Gnomish Mechanical Blade', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 33, dmg: [29, 52], speed: 1.8, stats: { agi: 10, sta: 6 }, icon: 'dagger', sell: 5000 });
  D.item('thermaplugg_robe', { name: 'Mechanic\'s Robe', slot: 'chest', atype: 'cloth', q: 3, lvl: 33, armor: 72, stats: { int: 13, spi: 9 }, sp: 15, icon: 'chest_cloth', sell: 5000 });
  D.item('thermaplugg_plate', { name: 'Steam-Plated Vest', slot: 'chest', atype: 'mail', q: 3, lvl: 33, armor: 300, stats: { str: 13, sta: 11 }, icon: 'chest_mail', sell: 5200 });

  Object.assign(D.MOBS, {
    gnomeregan_leper: { name: 'Irradiated Leper Gnome', sprite: 'leper_gnome', lvl: [29, 30], family: 'humanoid', drops: [['linen_cloth', 0.35], ['thieves_coin', 0.4]], qdrops: [['grime_encrusted_ring', 0.15]] },
    irradiated_pillager: { name: 'Irradiated Pillager', lvl: [29, 30], family: 'humanoid', hpMult: 1.1, drops: [['trogg_stone', 0.4]] },
    mechano_tank: { name: 'Mechano-Tank', lvl: [30, 31], family: 'mechanical', hpMult: 1.15, drops: [['linen_cloth', 0.1]], qdrops: [['prismatic_punch_card', 0.2]] },
    dark_iron_agent: { name: 'Dark Iron Agent', lvl: [30, 31], family: 'humanoid', drops: [['thieves_coin', 0.45]] },
    grubbis: { name: 'Grubbis', lvl: [30, 30], family: 'humanoid', boss: true, special: 'slam', loot: ['grubbis_hide', 'fallout_ring'], aggro: 'Grubbis smash tiny gnomes!' },
    viscous_fallout: { name: 'Viscous Fallout', lvl: [31, 31], family: 'elemental', boss: true, special: 'molten', specialText: 'Viscous Fallout spits radioactive ooze!', loot: ['fallout_cloak', 'fallout_ring'] },
    electrocutioner_6000: { name: 'Electrocutioner 6000', lvl: [31, 31], family: 'mechanical', boss: true, special: 'whirl', specialText: 'The Electrocutioner 6000 discharges a burst of lightning!', loot: ['electrocutioner_legs', 'electrocutioner_lagnut'], aggro: 'Electric justice!' },
    crowd_pummeler: { name: 'Crowd Pummeler 9-60', lvl: [32, 32], family: 'mechanical', boss: true, special: 'slam', specialText: 'The Crowd Pummeler slams its fists down!', loot: ['pummeler_hammer', 'pummeler_gloves'] },
    mekgineer_thermaplugg: { name: 'Mekgineer Thermaplugg', lvl: [32, 32], family: 'humanoid', boss: true, special: 'thermaplugg', loot: ['thermaplugg_staff', 'thermaplugg_blade', 'thermaplugg_robe', 'thermaplugg_plate'], qdrops: [['thermaplugg_head', 1]], aggro: 'My machines are the future! They will destroy you!' },
  });

  Object.assign(D.PLACES, {
    gnomeregan_gate: { name: 'Gates of Gnomeregan', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'gnomeregan_gate', lvl: [29, 34], mobs: [['irradiated_pillager', 6]], pool: 7, npcs: [], links: { kharanos: 22 } },
  });
  D.PLACES.kharanos.links.gnomeregan_gate = 22;

  Object.assign(D.QUESTS, {
    gnomeregan_thermaplugg: { name: 'The Grand Betrayal', lvl: 33, giver: 'overspark', turnin: 'overspark', dungeon: 'gnomeregan', text: 'Mekgineer Thermaplugg betrayed us to the troggs and flooded our city with radiation. He still rules the ruins. End him and bring me his head.',
      objs: [{ type: 'collect', item: 'thermaplugg_head', n: 1 }], reward: { choice: ['fam_back_rare35'] } },
    gnomeregan_punch_card: { name: 'Data Rescue', lvl: 31, giver: 'overspark', turnin: 'overspark', dungeon: 'gnomeregan', text: 'The city\'s data is on prismatic punch cards. The mechano-tanks carry some. Bring me one.',
      objs: [{ type: 'collect', item: 'prismatic_punch_card', n: 1 }], reward: { choice: ['fam_weapon32'] } },
    gnomeregan_ring: { name: 'The Grime-Encrusted Ring', lvl: 30, giver: 'overspark', turnin: 'overspark', dungeon: 'gnomeregan', text: 'My old ring was lost when the city fell. Some leper gnome must have it. Find it, please.',
      objs: [{ type: 'collect', item: 'grime_encrusted_ring', n: 1 }], reward: { money: 2500 } },
  });

  Object.assign(D.DUNGEONS, {
    gnomeregan: { name: 'Gnomeregan', minLvl: 29, par: 420, size: 5, trashMult: { hp: 2.2, dmg: 2.2 }, bossMult: { hp: 10, dmg: 4.8 }, pulls: [
      { scene: 'gnomeregan_halls', label: 'The outer halls', mobs: ['irradiated_pillager', 'gnomeregan_leper'] },
      { scene: 'gnomeregan_halls', label: 'Grubbis', mobs: ['grubbis'], boss: true },
      { scene: 'gnomeregan_halls', label: 'The dormitory', mobs: ['gnomeregan_leper', 'gnomeregan_leper', 'dark_iron_agent'] },
      { scene: 'gnomeregan_halls', label: 'Viscous Fallout', mobs: ['viscous_fallout'], boss: true },
      { scene: 'gnomeregan_halls', label: 'Electrocutioner 6000', mobs: ['electrocutioner_6000'], boss: true },
      { scene: 'gnomeregan_core', label: 'The workshop', mobs: ['mechano_tank', 'dark_iron_agent'] },
      { scene: 'gnomeregan_core', label: 'Crowd Pummeler 9-60', mobs: ['crowd_pummeler'], boss: true },
      { scene: 'gnomeregan_core', label: 'The engine core', mobs: ['mechano_tank', 'gnomeregan_leper'] },
      { scene: 'gnomeregan_core', label: 'Mekgineer Thermaplugg', mobs: ['mekgineer_thermaplugg'], boss: true },
    ] },
  });
  Object.assign(D.ACTIVITIES, {
    gnomeregan: { name: 'Gnomeregan', dungeon: 'gnomeregan', where: 'gnomeregan_gate', size: 5, minLvl: 29, maxLvl: 34, desc: 'Dungeon under Dun Morogh. 5 players.' },
  });
})(typeof window !== 'undefined' ? window : globalThis);
