// Greatbough, Dewfern Glade and Nyrwen: Accord, levels 1–10.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('teldrassil', { name: 'Greatbough', faction: 'alliance', music: 'greatbough', town: 'greatbough_town' });
  // items
  D.item('fel_moss', { name: 'Gloom Moss', slot: 'quest', q: 1, icon: 'moss' });
  D.item('venom_sac', { name: 'Webhollow Venom Sac', slot: 'quest', q: 1, icon: 'venom' });
  D.item('nightsaber_pelt', { name: 'Shadowcat Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('owl_feather', { name: 'Strigid Owl Feather', slot: 'quest', q: 1, icon: 'feather' });
  D.item('timberling_seed', { name: 'Rootling Seed', slot: 'quest', q: 1, icon: 'seed' });
  D.item('melenas_head', { name: "Varneth's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('githyiss_shroud', { name: "Skitterfang's Silken Shroud", slot: 'back', q: 3, lvl: 5, armor: 9, stats: { agi: 1, int: 2 }, icon: 'cloak', sell: 130, source: 'Skitterfang the Vile, Webhollow Cave', look: ['back', 'githyiss_shroud'] });
  D.item('oakenscowl_staff', { name: "Old Barkjaw's Totem Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [15, 23], speed: 3, stats: { sta: 3, int: 3, spi: 3 }, sp: 8, icon: 'staff', sell: 800, source: "Old Barkjaw, Rootdeep Barrow", look: ['weapon', 'oakenscowl_staff'] });
  D.item('melenas_blade', { name: "Varneth's Wicked Blade", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [11, 20], speed: 2.2, stats: { agi: 3, str: 2 }, icon: 'sword', sell: 800, source: 'Lord Varneth, Gloomrock', look: ['weapon', 'melenas_blade'] });
  D.item('gnarlpine_totem', { name: 'Mossback Totem', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('grell_fang', { name: 'Thornling Fang', slot: 'quest', q: 1, icon: 'claw' });

  // creatures
  Object.assign(D.MOBS, {
    young_nightsaber: { name: 'Young Shadowcat', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    young_thistle_boar: { name: 'Young Thistle Boar', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.3]] },
    mangy_nightsaber: { name: 'Mangy Shadowcat', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    thistle_boar: { name: 'Thistle Boar', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.35]] },
    grell: { name: 'Thornling', lvl: [2, 3], family: 'demon', drops: [['grell_earring', 0.35]], qdrops: [['fel_moss', 0.65]], aggro: 'Kill the tree-hugger!' },
    webwood_spider: { name: 'Webhollow Spider', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.2]], qdrops: [['venom_sac', 0.6]] },
    githyiss: { name: 'Skitterfang the Vile', lvl: [5, 5], family: 'beast', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['venom_sac', 1], ['githyiss_shroud', 0.35]] },
    nightsaber: { name: 'Shadowcat', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['nightsaber_pelt', 0.55]] },
    strigid_owl: { name: 'Strigid Owl', lvl: [5, 6], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['owl_feather', 0.55]] },
    timberling: { name: 'Rootling', lvl: [6, 7], family: 'elemental', drops: [['linen_cloth', 0.15]], qdrops: [['timberling_seed', 0.6]] },
    gnarlpine_ursa: { name: 'Mossback Ursa', lvl: [6, 7], family: 'humanoid', drops: [['furbolg_charm', 0.35], ['linen_cloth', 0.3]], aggro: 'You not welcome here!', qdrops: [['gnarlpine_totem', 0.55]] },
    gnarlpine_warrior: { name: 'Mossback Warrior', lvl: [8, 9], family: 'humanoid', drops: [['furbolg_charm', 0.4], ['linen_cloth', 0.3]], aggro: 'You not welcome here!' },
    gnarlpine_shaman: { name: 'Mossback Shaman', ranged: 'nature', lvl: [8, 9], family: 'humanoid', drops: [['furbolg_charm', 0.4], ['linen_cloth', 0.35]] },
    oakenscowl: { name: 'Old Barkjaw', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['furbolg_charm', 1], ['oakenscowl_staff', 0.35]], aggro: 'The forest is ours!' },
    shadow_sprite: { name: 'Shadow Sprite', lvl: [7, 8], family: 'demon', drops: [['grell_earring', 0.35]] },
    vicious_grell: { name: 'Vicious Thornling', lvl: [8, 9], family: 'demon', drops: [['grell_earring', 0.4]], qdrops: [['grell_fang', 0.55]] },
    lord_melenas: { name: 'Lord Varneth', lvl: [10, 10], family: 'demon', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['grell_earring', 1], ['melenas_blade', 0.35]], qdrops: [['melenas_head', 1]], aggro: 'Your blood will feed the gloom!' },
  });

  // places
  Object.assign(D.PLACES, {
    shadowglen: { name: 'Dewfern Glade', zone: 'Greatbough', region: 'teldrassil', scene: 'shadowglen', lvl: [1, 3], mobs: [['young_nightsaber', 4], ['young_thistle_boar', 4], ['mangy_nightsaber', 2], ['thistle_boar', 2], ['grell', 3]], pool: 11, npcs: ['ilthalaine', 'gilshalan', 'dirania', 'nyoma'], vendor: 'nyoma', links: { shadowthread_cave: 12, dolanaar: 30 } },
    shadowthread_cave: { name: 'Webhollow Cave', zone: 'Greatbough', region: 'teldrassil', scene: 'shadowthread_cave', lvl: [3, 5], mobs: [['webwood_spider', 9]], named: { githyiss: 90 }, pool: 9, npcs: [], links: { shadowglen: 12 } },
    dolanaar: { name: 'Ithrenne', zone: 'Greatbough', region: 'teldrassil', scene: 'dolanaar', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['tallonkai', 'zenn', 'keldamyr', 'kyra', 'ilyenia'], vendor: 'keldamyr', gearVendor: 'ilyenia', links: { shadowglen: 30, lake_alameth: 14, banethil_barrow: 16, fel_rock: 18, darnassus: 25 } },
    lake_alameth: { name: "Lake Seliwen", zone: 'Greatbough', region: 'teldrassil', scene: 'lake_alameth', lvl: [5, 8], mobs: [['nightsaber', 4], ['strigid_owl', 4], ['timberling', 4]], pool: 10, npcs: ['denalan'], links: { dolanaar: 14 } },
    banethil_barrow: { name: "Rootdeep Barrow", zone: 'Greatbough', region: 'teldrassil', scene: 'banethil_barrow', lvl: [6, 10], mobs: [['gnarlpine_ursa', 4], ['gnarlpine_warrior', 4], ['gnarlpine_shaman', 3]], named: { oakenscowl: 150 }, pool: 10, npcs: [], links: { dolanaar: 16 } },
    fel_rock: { name: 'Gloomrock', zone: 'Greatbough', region: 'teldrassil', scene: 'fel_rock', lvl: [7, 10], mobs: [['shadow_sprite', 5], ['vicious_grell', 5]], named: { lord_melenas: 150 }, pool: 9, npcs: [], links: { dolanaar: 18 } },
    darnassus: { music: 'nyrwen', name: 'Nyrwen', zone: 'Nyrwen', region: 'teldrassil', scene: 'darnassus', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['saelienne', 'mydrannul', 'mentor_alliance', 'banker_alliance', 'auctioneer_alliance'], vendor: 'saelienne', gearVendor: 'mydrannul', links: { dolanaar: 25, goldshire: 60 }, via: { goldshire: "Boat from Rut'theran" } },
  });

  // people
  Object.assign(D.NPCS, {
    ilthalaine: { name: 'Keeper Aelith', title: 'Dewfern Glade' },
    gilshalan: { name: 'Therin Aubren', title: 'Druid' },
    dirania: { name: 'Maelis Varre', title: 'Warden' },
    nyoma: { name: 'Iselle', title: 'Food & Drink' },
    tallonkai: { name: 'Calen Thornwood', title: 'Druid of the Claw' },
    zenn: { name: 'Pym Crookhorn', title: 'Satyr, supposedly harmless' },
    keldamyr: { name: 'Innkeeper Lirien', title: 'Innkeeper' },
    kyra: { name: 'Warden Aerin Ashbrook', title: 'Warden' },
    ilyenia: { name: 'Ilsa Brightwater', title: 'Weaponsmith' },
    denalan: { name: 'Faelan', title: 'Botanist' },
    saelienne: { name: 'Innkeeper Meriwen', title: 'Innkeeper' },
    mydrannul: { name: 'Liraen', title: 'Weaponsmith' },
  });

  // quests
  Object.assign(D.QUESTS, {
    balance_nature: { name: 'Thinning the Old', lvl: 2, giver: 'ilthalaine', turnin: 'ilthalaine', text: 'Too many young shadowcats and thistle boars roam the glade. Restore the balance: 7 shadowcats and 4 boars.',
      objs: [{ type: 'kill', mob: 'young_nightsaber', n: 7 }, { type: 'kill', mob: 'young_thistle_boar', n: 4 }], reward: { choice: ['fam_chest'] } },
    balance_nature_2: { name: 'Thinning the Old', lvl: 3, giver: 'ilthalaine', turnin: 'ilthalaine', pre: ['balance_nature'], text: 'The older beasts must be thinned too. 7 Mangy Shadowcats and 7 Thistle Boars.',
      objs: [{ type: 'kill', mob: 'mangy_nightsaber', n: 7 }, { type: 'kill', mob: 'thistle_boar', n: 7 }], reward: { choice: ['fam_legs'] } },
    fel_moss_q: { name: 'Gloom Moss', lvl: 3, giver: 'gilshalan', turnin: 'gilshalan', text: 'The thornling carry gloom moss, a sign of corruption. Bring me 8 clumps so I can study it.',
      objs: [{ type: 'collect', item: 'fel_moss', n: 8 }], reward: { choice: ['fam_feet'] } },
    webwood_venom: { name: 'Webhollow Venom', lvl: 4, giver: 'dirania', turnin: 'dirania', text: 'The spiders of Webhollow Cave have grown vicious. Bring me 10 Webhollow Venom Sacs.',
      objs: [{ type: 'collect', item: 'venom_sac', n: 10 }], reward: { choice: ['fam_hands'] } },
    githyiss_q: { name: 'Skitterfang the Vile', lvl: 5, giver: 'dirania', turnin: 'dirania', pre: ['webwood_venom'], text: 'Their queen, Skitterfang the Vile, nests at the back of the cave. End her.',
      objs: [{ type: 'kill', mob: 'githyiss', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    road_dolanaar: { name: 'The Road to Ithrenne', lvl: 5, giver: 'ilthalaine', turnin: 'tallonkai', text: 'You have done well. Go down the road to Ithrenne and speak with Calen Thornwood.',
      objs: [{ type: 'visit', place: 'dolanaar' }], reward: {} },
    zenns_bidding: { name: "Pym's Bidding", lvl: 6, giver: 'zenn', turnin: 'zenn', text: 'Heh. Bring old Pym 3 Shadowcat Pelts and 3 Strigid Owl Feathers, and ask no questions.',
      objs: [{ type: 'collect', item: 'nightsaber_pelt', n: 3 }, { type: 'collect', item: 'owl_feather', n: 3 }], reward: { money: 120 } },
    timberling_seeds: { name: 'Rootling Seeds', lvl: 7, giver: 'denalan', turnin: 'denalan', text: 'The timberlings by the lake have gone strange. Bring me 8 of their seeds.',
      objs: [{ type: 'collect', item: 'timberling_seed', n: 8 }], reward: { choice: ['fam_wrist'] } },
    gnarlpine_corruption: { name: 'Mossback Corruption', lvl: 8, giver: 'tallonkai', turnin: 'tallonkai', pre: ['road_dolanaar'], text: "The Mossback bearkin have turned on us. Drive them back at Rootdeep: 6 warriors and 6 shamans.",
      objs: [{ type: 'kill', mob: 'gnarlpine_warrior', n: 6 }, { type: 'kill', mob: 'gnarlpine_shaman', n: 6 }], reward: { choice: ['fam_back'] } },
    oakenscowl_q: { name: 'The Elder Bearkin', lvl: 10, giver: 'tallonkai', turnin: 'tallonkai', pre: ['gnarlpine_corruption'], text: 'Their elder, Old Barkjaw, leads the corruption from deep in the barrow. Defeat him.',
      objs: [{ type: 'kill', mob: 'oakenscowl', n: 1 }], reward: { choice: ['fam_chest9'] } },
    melenas_q: { name: "Varneth's Head", lvl: 10, giver: 'kyra', turnin: 'kyra', text: 'A satyr named Lord Varneth hides in Gloomrock, poisoning the land. Bring me his head.',
      objs: [{ type: 'collect', item: 'melenas_head', n: 1 }], reward: { choice: ['fam_waist'] } },
    crown_earth: { name: 'The Heart of the Tree', lvl: 8, giver: 'tallonkai', turnin: 'saelienne', pre: ['road_dolanaar'], text: 'Travel west to Nyrwen, city of the Sylari, and see the heart of Greatbough.',
      objs: [{ type: 'visit', place: 'darnassus' }], reward: {} },
    nightsaber_hunt: { name: 'The Shadowcat Hunt', lvl: 5, giver: 'keldamyr', turnin: 'keldamyr', text: 'The shadowcats by the lake have grown bold and stalk our travellers. Hunt 8 of them.',
      objs: [{ type: 'kill', mob: 'nightsaber', n: 8 }], reward: { money: 90 } },
    gnarlpine_totems: { name: 'Mossback Totems', lvl: 6, giver: 'ilyenia', turnin: 'ilyenia', text: 'The Mossback carve totems that reek of corruption. Take 6 from the ursa at the Barrow Den and I will arm you.',
      objs: [{ type: 'collect', item: 'gnarlpine_totem', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    ursa_threat: { name: 'The Ursa Threat', lvl: 6, giver: 'kyra', turnin: 'kyra', pre: ['road_dolanaar'], text: 'Mossback ursa guard the Barrow Den and attack anyone who comes near. Kill 8.',
      objs: [{ type: 'kill', mob: 'gnarlpine_ursa', n: 8 }], reward: { choice: ['fam_hands'] } },
    fel_sprites: { name: 'Shadows at Gloomrock', lvl: 7, giver: 'kyra', turnin: 'kyra', text: 'Shadow sprites pour out of Gloomrock at night. Cut 8 of them down before they reach Ithrenne.',
      objs: [{ type: 'kill', mob: 'shadow_sprite', n: 8 }], reward: { choice: ['fam_wrist'] } },
    grell_fangs: { name: 'Thornling Fangs', lvl: 8, giver: 'keldamyr', turnin: 'keldamyr', text: 'Proof that Gloomrock is being cleared would calm the village. Bring me 6 fangs from the vicious thornling.',
      objs: [{ type: 'collect', item: 'grell_fang', n: 6 }], reward: { choice: ['fam_waist'] } },
    grell_cull: { name: 'Vicious Thornling', lvl: 9, giver: 'kyra', turnin: 'kyra', pre: ['fel_sprites'], text: 'The thornling deeper in Gloomrock are worse than the sprites. Kill 8.',
      objs: [{ type: 'kill', mob: 'vicious_grell', n: 8 }], reward: { choice: ['fam_legs9'] } },
    gnarlpine_shamans: { name: 'Shamans of the Mossback', lvl: 10, giver: 'tallonkai', turnin: 'tallonkai', pre: ['gnarlpine_corruption'], text: 'The shamans spread the corruption through their tribe. Stop 8 of them.',
      objs: [{ type: 'kill', mob: 'gnarlpine_shaman', n: 8 }], reward: { choice: ['fam_hands9'] } },
    westfall_teldrassil: { name: 'Across the Sea', lvl: 10, giver: 'tallonkai', turnin: 'gryan', text: 'Our allies in Longfield fight the Grey Hood. Take the boat from Nyrwen to Brackenford, head west, and report to Bram Oakhollow at Warrick\'s Rise.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
  });

})(typeof window !== 'undefined' ? window : globalThis);