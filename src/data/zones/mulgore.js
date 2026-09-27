// Mulgore, Camp Narache and Thunder Bluff: Horde, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('mulgore', { name: 'Mulgore', faction: 'horde' });
  // items
  D.item('plainstrider_beak', { name: 'Plainstrider Beak', slot: 'quest', q: 1, icon: 'plainstrider_beak' });
  D.item('battleboar_flank', { name: 'Battleboar Flank', slot: 'quest', q: 1, icon: 'meat' });
  D.item('swoop_quill', { name: 'Trophy Swoop Quill', slot: 'quest', q: 1, icon: 'feather' });
  D.item('arrachea_horn', { name: "Horn of Arra'chea", slot: 'quest', q: 1, icon: 'claw' });
  D.item('snagglespear_pike', { name: "Snagglespear's War Pike", slot: 'weapon', wtype: 'staff', q: 3, lvl: 9, dmg: [15, 23], speed: 3, stats: { str: 4, sta: 3 }, icon: 'staff', sell: 700, source: 'Snagglespear, the Golden Plains', look: ['weapon', 'snagglespear_pike'] });
  D.item('mazzranache_cloak', { name: 'Mazzranache Pelt Cloak', slot: 'back', q: 3, lvl: 9, armor: 18, stats: { agi: 3, sta: 2 }, icon: 'cloak', sell: 380, source: 'Mazzranache, the Golden Plains', look: ['back', 'mazzranache_cloak'] });
  D.item('arrachea_totem', { name: "Arra'chea Bone Totem", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [13, 23], speed: 2.6, stats: { str: 3, sta: 3, spi: 2 }, icon: 'mace', sell: 800, source: "Arra'chea, the Golden Plains", look: ['weapon', 'arrachea_totem'] });
  D.item('strider_meat', { name: 'Stringy Strider Meat', slot: 'quest', q: 1, icon: 'meat' });
  D.item('stalker_hide', { name: 'Prairie Stalker Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('venture_tools', { name: 'Venture Co. Tools', slot: 'quest', q: 1, icon: 'axe' });

  // creatures
  Object.assign(D.MOBS, {
    plainstrider: { name: 'Plainstrider', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['plainstrider_beak', 0.7]] },
    prairie_wolf: { name: 'Prairie Wolf', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]] },
    battleboar: { name: 'Battleboar', lvl: [3, 4], family: 'beast', drops: [['boar_tusk', 0.4]], qdrops: [['battleboar_flank', 0.6]] },
    bristleback_quilboar: { name: 'Bristleback Quilboar', lvl: [3, 5], family: 'humanoid', drops: [['quilboar_tusk', 0.4], ['linen_cloth', 0.25]], aggro: 'Squeal! Intruder!' },
    bristleback_shaman: { name: 'Bristleback Shaman', lvl: [4, 5], family: 'humanoid', drops: [['quilboar_tusk', 0.4], ['linen_cloth', 0.3]] },
    chief_sharptusk: { name: 'Chief Sharptusk Thornmantle', lvl: [6, 6], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['quilboar_tusk', 1]], aggro: 'The thorns will drink your blood!' },
    adult_plainstrider: { name: 'Adult Plainstrider', lvl: [6, 7], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['strider_meat', 0.6]] },
    swoop: { name: 'Swoop', lvl: [6, 7], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['swoop_quill', 0.6]] },
    prairie_stalker: { name: 'Prairie Stalker', lvl: [7, 8], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]], qdrops: [['stalker_hide', 0.55]] },
    palemane_tanner: { name: 'Palemane Tanner', lvl: [7, 8], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]] },
    palemane_poacher: { name: 'Palemane Poacher', lvl: [8, 9], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], aggro: 'Fresh meat!' },
    venture_worker: { name: 'Venture Co. Worker', lvl: [7, 8], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.3]], aggro: 'Time is money!', qdrops: [['venture_tools', 0.55]] },
    venture_supervisor: { name: 'Venture Co. Supervisor', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], aggro: 'Get back to work!', qdrops: [['venture_tools', 0.55]] },
    snagglespear: { name: 'Snagglespear', lvl: [9, 9], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['quilboar_tusk', 1], ['snagglespear_pike', 0.35]] },
    mazzranache: { name: 'Mazzranache', lvl: [9, 9], family: 'beast', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['ruined_pelt', 1], ['mazzranache_cloak', 0.35]] },
    arrachea: { name: "Arra'chea", lvl: [11, 11], family: 'beast', elite: true, named: true, hpMult: 5.4, dmgMult: 2.5, drops: [['ruined_pelt', 1]], qdrops: [['arrachea_horn', 1]], special: 'hogger', loot: ['arrachea_totem'] },
  });

  // places
  Object.assign(D.PLACES, {
    camp_narache: { name: 'Camp Narache', zone: 'Mulgore', region: 'mulgore', scene: 'camp_narache', lvl: [1, 3], mobs: [['plainstrider', 5], ['prairie_wolf', 3], ['battleboar', 3]], pool: 11, npcs: ['grull', 'hawkwind', 'raincaller', 'moodan'], vendor: 'moodan', links: { brambleblade_ravine: 12, bloodhoof_village: 30 } },
    brambleblade_ravine: { name: 'Brambleblade Ravine', zone: 'Mulgore', region: 'mulgore', scene: 'brambleblade_ravine', lvl: [3, 5], mobs: [['bristleback_quilboar', 6], ['bristleback_shaman', 3]], named: { chief_sharptusk: 90 }, pool: 9, npcs: [], links: { camp_narache: 12 } },
    bloodhoof_village: { name: 'Bloodhoof Village', zone: 'Mulgore', region: 'mulgore', scene: 'bloodhoof_village', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['baine', 'kauth', 'harken', 'mahnott', 'morin'], vendor: 'kauth', gearVendor: 'mahnott', links: { camp_narache: 30, palemane_rock: 14, venture_mine: 16, golden_plains: 14, thunder_bluff: 22, crossroads: 35 } },
    palemane_rock: { name: 'Palemane Rock', zone: 'Mulgore', region: 'mulgore', scene: 'palemane_rock', lvl: [6, 9], mobs: [['palemane_tanner', 5], ['palemane_poacher', 4], ['prairie_stalker', 2]], pool: 10, npcs: [], links: { bloodhoof_village: 14 } },
    venture_mine: { name: 'The Venture Co. Mine', zone: 'Mulgore', region: 'mulgore', scene: 'venture_mine', lvl: [7, 9], mobs: [['venture_worker', 6], ['venture_supervisor', 4]], pool: 10, npcs: [], links: { bloodhoof_village: 16 } },
    golden_plains: { name: 'The Golden Plains', zone: 'Mulgore', region: 'mulgore', scene: 'golden_plains', lvl: [6, 11], mobs: [['adult_plainstrider', 4], ['swoop', 4], ['prairie_stalker', 3]], named: { snagglespear: 150, mazzranache: 150, arrachea: 180 }, pool: 11, npcs: [], links: { bloodhoof_village: 14 } },
    thunder_bluff: { name: 'Thunder Bluff', zone: 'Thunder Bluff', region: 'mulgore', scene: 'thunder_bluff', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['pala', 'etu', 'mentor_horde', 'banker_horde', 'auctioneer_horde'], vendor: 'pala', gearVendor: 'etu', links: { bloodhoof_village: 22, orgrimmar: 60, crossroads: 40 }, via: { orgrimmar: 'Wind Rider', crossroads: 'Wind rider' } },
  });

  // people
  Object.assign(D.NPCS, {
    grull: { name: 'Grull Hawkwind', title: 'Hunter' },
    hawkwind: { name: 'Chief Hawkwind', title: 'Camp Narache' },
    raincaller: { name: 'Maur Raincaller', title: 'Shaman' },
    moodan: { name: 'Moodan Sungrain', title: 'Baker' },
    baine: { name: 'Baine Bloodhoof', title: 'Son of Cairne' },
    kauth: { name: 'Innkeeper Kauth', title: 'Innkeeper' },
    harken: { name: 'Harken Windtotem', title: 'Hunter' },
    mahnott: { name: 'Mahnott Roughwound', title: 'Weaponsmith' },
    morin: { name: 'Morin Cloudstalker', title: 'Brave' },
    pala: { name: 'Innkeeper Pala', title: 'Innkeeper' },
    etu: { name: 'Etu Ragetotem', title: 'Weaponsmith' },
  });

  // quests
  Object.assign(D.QUESTS, {
    hunt_begins: { name: 'The Hunt Begins', lvl: 2, giver: 'grull', turnin: 'grull', text: 'Every tauren hunter starts with the plainstriders. Bring me 8 of their beaks.',
      objs: [{ type: 'collect', item: 'plainstrider_beak', n: 8 }], reward: { choice: ['fam_chest'] } },
    battleboars: { name: 'The Battleboars', lvl: 3, giver: 'hawkwind', turnin: 'hawkwind', text: 'The battleboars grow fat and bold. Bring back 8 flanks for the camp.',
      objs: [{ type: 'collect', item: 'battleboar_flank', n: 8 }], reward: { choice: ['fam_legs'] } },
    rite_strength: { name: 'Rite of Strength', lvl: 4, giver: 'raincaller', turnin: 'raincaller', text: 'The Bristleback quilboar raid our lands from the ravine. Defeat 12 of them.',
      objs: [{ type: 'kill', mob: 'bristleback_quilboar', n: 12 }], reward: { choice: ['fam_feet'] } },
    break_sharptusk: { name: 'Break Sharptusk!', lvl: 6, giver: 'hawkwind', turnin: 'hawkwind', pre: ['rite_strength'], text: 'Their chief, Sharptusk Thornmantle, must fall.',
      objs: [{ type: 'kill', mob: 'chief_sharptusk', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_bloodhoof: { name: 'Journey to Bloodhoof', lvl: 5, giver: 'hawkwind', turnin: 'baine', text: 'Go down the mountain to Bloodhoof Village and speak with Baine Bloodhoof.',
      objs: [{ type: 'visit', place: 'bloodhoof_village' }], reward: {} },
    swoop_hunting: { name: 'Swoop Hunting', lvl: 7, giver: 'harken', turnin: 'harken', text: 'The swoops of the plains make fine trophies. Bring me 8 quills.',
      objs: [{ type: 'collect', item: 'swoop_quill', n: 8 }], reward: { choice: ['fam_hands'] } },
    poachers: { name: 'Poison Water', lvl: 8, giver: 'baine', turnin: 'baine', pre: ['report_bloodhoof'], text: 'Palemane gnolls poach our herds at Palemane Rock. Drive them off: 8 poachers.',
      objs: [{ type: 'kill', mob: 'palemane_poacher', n: 8 }], reward: { choice: ['fam_wrist'] } },
    venture_co: { name: 'Dangers of the Venture Co.', lvl: 8, giver: 'morin', turnin: 'morin', text: 'Goblins are stripping our land at their mine. Kill 8 workers and 4 supervisors.',
      objs: [{ type: 'kill', mob: 'venture_worker', n: 8 }, { type: 'kill', mob: 'venture_supervisor', n: 4 }], reward: { choice: ['fam_back'] } },
    mazzranache_q: { name: 'Mazzranache', lvl: 9, giver: 'morin', turnin: 'morin', text: 'A great cat called Mazzranache hunts the Golden Plains. End its hunt.',
      objs: [{ type: 'kill', mob: 'mazzranache', n: 1 }], reward: { choice: ['fam_chest9'] } },
    snagglespear_q: { name: 'Snagglespear', lvl: 9, giver: 'baine', turnin: 'baine', text: 'A quilboar brute named Snagglespear leads raids on the plains. Stop him.',
      objs: [{ type: 'kill', mob: 'snagglespear', n: 1 }], reward: { choice: ['fam_waist'] } },
    arrachea_q: { name: "Arra'chea", lvl: 11, giver: 'baine', turnin: 'baine', group: 3, text: "The great kodo Arra'chea tramples the plains. Bring me its horn. Take braves with you.",
      objs: [{ type: 'collect', item: 'arrachea_horn', n: 1 }], reward: { choice: ['militia'] } },
    strider_meat_q: { name: 'Plainstrider Stew', lvl: 5, giver: 'kauth', turnin: 'kauth', text: 'A good stew needs strider meat. The adult plainstriders on the Golden Plains are best. Bring me 6.',
      objs: [{ type: 'collect', item: 'strider_meat', n: 6 }], reward: { money: 90 } },
    stalker_hides: { name: 'Stalker Hides', lvl: 6, giver: 'mahnott', turnin: 'mahnott', text: 'Prairie stalker hide wraps a handle like nothing else. Bring me 6 and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'stalker_hide', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    plains_patrol: { name: 'Thinning the Herd', lvl: 6, giver: 'morin', turnin: 'morin', text: 'Too many plainstriders strip the grass our kodos need. Hunt 8 adults on the Golden Plains.',
      objs: [{ type: 'kill', mob: 'adult_plainstrider', n: 8 }], reward: { choice: ['fam_hands'] } },
    palemane_tanners: { name: 'The Palemane Tanners', lvl: 7, giver: 'harken', turnin: 'harken', pre: ['report_bloodhoof'], text: 'The Palemane skin our animals at Palemane Rock. Stop 8 of their tanners.',
      objs: [{ type: 'kill', mob: 'palemane_tanner', n: 8 }], reward: { choice: ['fam_wrist'] } },
    venture_tools_q: { name: 'Broken Tools', lvl: 8, giver: 'kauth', turnin: 'kauth', text: 'Every tool the Venture Co. loses is an hour they are not digging up our land. Take 6 from their mine.',
      objs: [{ type: 'collect', item: 'venture_tools', n: 6 }], reward: { choice: ['fam_waist'] } },
    prairie_stalkers: { name: 'Stalkers on the Plains', lvl: 9, giver: 'harken', turnin: 'harken', text: 'Prairie stalkers follow the kodo herds and pick off the young. Hunt 8.',
      objs: [{ type: 'kill', mob: 'prairie_stalker', n: 8 }], reward: { money: 220 } },
    supervisors_q: { name: 'Time Is Money', lvl: 9, giver: 'mahnott', turnin: 'mahnott', text: 'Without their supervisors the Venture Co. workers stop digging. Remove 6.',
      objs: [{ type: 'kill', mob: 'venture_supervisor', n: 6 }], reward: { choice: ['fam_legs9'] } },
    last_poachers: { name: "The Poachers' Last Stand", lvl: 10, giver: 'morin', turnin: 'morin', pre: ['poachers'], text: 'The last Palemane poachers dug in at the rock. Finish it: 10 poachers.',
      objs: [{ type: 'kill', mob: 'palemane_poacher', n: 10 }], reward: { choice: ['fam_hands9'] } },
    crossroads_mulgore: { name: 'Journey to the Crossroads', lvl: 10, giver: 'baine', turnin: 'thork', text: 'North of Mulgore lie the Barrens. Our allies at the Crossroads need help. Report to Thork.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    arrachea: { name: "Arra'chea", where: 'golden_plains', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite in Mulgore. 3 players.', boss: 'arrachea', pulls: [{ scene: 'golden_plains', label: 'The plains', mobs: ['prairie_stalker', 'prairie_stalker'] }, { scene: 'golden_plains', label: 'The plains', mobs: ['adult_plainstrider', 'swoop'] }, { scene: 'golden_plains', label: "Arra'chea", mobs: ['arrachea'], boss: true }] },
  });

})(typeof window !== 'undefined' ? window : globalThis);