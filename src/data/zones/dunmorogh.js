// Dun Morogh, Coldridge Valley and Ironforge: Alliance, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('dunmorogh', { name: 'Dun Morogh', faction: 'alliance' });
  // items
  D.item('felix_journal', { name: "Felix's Journal", slot: 'quest', q: 1, icon: 'journal' });
  D.item('crag_boar_rib', { name: 'Crag Boar Rib', slot: 'quest', q: 1, icon: 'rib' });
  D.item('wendigo_mane', { name: 'Wendigo Mane', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('restab_cog', { name: 'Restabilization Cog', slot: 'quest', q: 1, icon: 'coin' });
  D.item('vagash_fang', { name: 'Fang of Vagash', slot: 'quest', q: 1, icon: 'claw' });
  D.item('griknir_staff', { name: "Grik'nir's Frozen Staff", slot: 'weapon', wtype: 'staff', q: 3, lvl: 5, dmg: [7, 12], speed: 3, stats: { int: 3, spi: 2 }, sp: 3, icon: 'staff', sell: 150, source: "Grik'nir the Cold, Coldridge Valley", look: ['weapon', 'griknir_staff'] });
  D.item('icebeard_cloak', { name: "Icebeard's Shaggy Cloak", slot: 'back', q: 3, lvl: 9, armor: 18, stats: { sta: 3, str: 1, spi: 1 }, icon: 'cloak', sell: 380, source: 'Old Icebeard, the Grizzled Den', look: ['back', 'icebeard_cloak'] });
  D.item('vagash_claw', { name: 'Claw of Vagash', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.7, stats: { agi: 3, sta: 2 }, icon: 'dagger', sell: 700, source: 'Vagash, Amberstill Ranch', look: ['weapon', 'vagash_claw'] });
  D.item('frostmane_tusk', { name: 'Frostmane Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('ice_bear_pelt', { name: 'Ice Claw Pelt', slot: 'quest', q: 1, icon: 'pelt' });

  // creatures
  Object.assign(D.MOBS, {
    rockjaw_trogg: { name: 'Rockjaw Trogg', lvl: [1, 2], family: 'humanoid', drops: [['trogg_stone', 0.4], ['linen_cloth', 0.2]], aggro: 'Grrrr... mine!' },
    burly_rockjaw_trogg: { name: 'Burly Rockjaw Trogg', lvl: [3, 4], family: 'humanoid', drops: [['trogg_stone', 0.4], ['linen_cloth', 0.25]] },
    ragged_young_wolf: { name: 'Ragged Young Wolf', lvl: [1, 2], family: 'beast', drops: [['ruined_pelt', 0.35], ['wolf_fang', 0.25]], qdrops: [['wolf_meat', 0.75]] },
    small_crag_boar: { name: 'Small Crag Boar', lvl: [2, 3], family: 'beast', drops: [['ruined_pelt', 0.3]], qdrops: [['crag_boar_rib', 0.5]] },
    frostmane_troll_whelp: { name: 'Frostmane Troll Whelp', lvl: [3, 4], family: 'humanoid', drops: [['troll_tusk', 0.35], ['linen_cloth', 0.25]], aggro: 'You be dead soon!' },
    grik_nir: { name: "Grik'nir the Cold", lvl: [5, 5], family: 'humanoid', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['troll_tusk', 1], ['griknir_staff', 0.35]], qdrops: [['felix_journal', 1]], aggro: 'Da ice will take ya!' },
    crag_boar: { name: 'Crag Boar', lvl: [5, 6], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['crag_boar_rib', 0.55]] },
    young_wendigo: { name: 'Young Wendigo', lvl: [5, 6], family: 'yeti', drops: [['bear_hide', 0.3]], qdrops: [['wendigo_mane', 0.6]] },
    wendigo: { name: 'Wendigo', lvl: [7, 8], family: 'yeti', hpMult: 1.1, drops: [['bear_hide', 0.4]], qdrops: [['wendigo_mane', 0.65]] },
    old_icebeard: { name: 'Old Icebeard', lvl: [9, 9], family: 'yeti', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['bear_hide', 1], ['icebeard_cloak', 0.35]] },
    frostmane_troll: { name: 'Frostmane Troll', lvl: [6, 7], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.3]], aggro: 'You be dead soon!', qdrops: [['frostmane_tusk', 0.55]] },
    frostmane_headhunter: { name: 'Frostmane Headhunter', lvl: [8, 9], family: 'humanoid', drops: [['troll_tusk', 0.45], ['linen_cloth', 0.3]], aggro: 'Your head be mine!' },
    frostmane_seer: { name: 'Frostmane Seer', lvl: [8, 9], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.35]] },
    elder_crag_boar: { name: 'Elder Crag Boar', lvl: [8, 9], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.4]], qdrops: [['crag_boar_rib', 0.6]] },
    ice_claw_bear: { name: 'Ice Claw Bear', lvl: [8, 9], family: 'beast', hpMult: 1.15, drops: [['bear_hide', 0.4]], qdrops: [['ice_bear_pelt', 0.55]] },
    snow_leopard: { name: 'Snow Leopard', lvl: [8, 9], family: 'beast', drops: [['ruined_pelt', 0.4]] },
    leper_gnome: { name: 'Leper Gnome', lvl: [8, 10], family: 'humanoid', drops: [['linen_cloth', 0.4], ['thieves_coin', 0.3]], qdrops: [['restab_cog', 0.6]], aggro: 'Gnomeregan will be ours again!' },
    vagash: { name: 'Vagash', lvl: [11, 11], family: 'beast', elite: true, named: true, hpMult: 5.2, dmgMult: 2.5, drops: [['bear_hide', 1]], qdrops: [['vagash_fang', 1]], special: 'hogger', loot: ['vagash_claw'] },
  });

  // places
  Object.assign(D.PLACES, {
    anvilmar: { name: 'Anvilmar', zone: 'Coldridge Valley', region: 'dunmorogh', scene: 'coldridge_valley', lvl: [1, 3], mobs: [['rockjaw_trogg', 5], ['ragged_young_wolf', 5], ['small_crag_boar', 2], ['burly_rockjaw_trogg', 2]], pool: 10, npcs: ['sten', 'balir', 'talin', 'adlin'], vendor: 'adlin', links: { coldridge_cave: 12, kharanos: 30 } },
    coldridge_cave: { name: 'Frostmane Cave', zone: 'Coldridge Valley', region: 'dunmorogh', scene: 'coldridge_cave', lvl: [3, 5], mobs: [['frostmane_troll_whelp', 8], ['burly_rockjaw_trogg', 2]], named: { grik_nir: 90 }, pool: 9, npcs: [], links: { anvilmar: 12 } },
    kharanos: { name: 'Kharanos', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'kharanos', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['ragnar', 'belm', 'stonegear', 'senir', 'grawn'], vendor: 'belm', gearVendor: 'grawn', links: { anvilmar: 30, grizzled_den: 14, frostmane_hold: 16, amberstill_ranch: 18, ironforge: 20 } },
    grizzled_den: { name: 'The Grizzled Den', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'grizzled_den', lvl: [5, 8], mobs: [['young_wendigo', 6], ['wendigo', 4], ['crag_boar', 3]], named: { old_icebeard: 150 }, pool: 10, npcs: [], links: { kharanos: 14 } },
    frostmane_hold: { name: 'Frostmane Hold', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'frostmane_hold', lvl: [7, 10], mobs: [['frostmane_troll', 5], ['frostmane_headhunter', 4], ['frostmane_seer', 3]], pool: 10, npcs: [], links: { kharanos: 16 } },
    amberstill_ranch: { name: 'Amberstill Ranch', zone: 'Dun Morogh', region: 'dunmorogh', scene: 'amberstill_ranch', lvl: [8, 11], mobs: [['elder_crag_boar', 5], ['ice_claw_bear', 4], ['snow_leopard', 4], ['leper_gnome', 3]], named: { vagash: 180 }, pool: 11, npcs: ['rudra'], links: { kharanos: 18 } },
    ironforge: { name: 'Ironforge', zone: 'Ironforge', region: 'dunmorogh', scene: 'ironforge', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['firebrew', 'overspark', 'bruuk', 'mentor_alliance', 'banker_alliance', 'auctioneer_alliance'], vendor: 'firebrew', gearVendor: 'bruuk', links: { kharanos: 20, stormwind: 40 }, via: { stormwind: 'Deeprun Tram' } },
  });

  // people
  Object.assign(D.NPCS, {
    mentor_alliance: { name: 'Quartermaster Aldwin', title: 'Mentor Quartermaster' },
    banker_alliance: { name: 'Banker Olwen', title: 'Banker' }, auctioneer_alliance: { name: 'Auctioneer Redmuse', title: 'Auctioneer' },
    sten: { name: 'Sten Stoutarm', title: 'Coldridge Guard' },
    balir: { name: 'Balir Frosthammer', title: 'Mountaineer' },
    talin: { name: 'Talin Keeneye', title: 'Hunter' },
    adlin: { name: 'Adlin Pridedrift', title: 'Food & Drink' },
    ragnar: { name: 'Ragnar Thunderbrew', title: 'Brewmaster' },
    belm: { name: 'Innkeeper Belm', title: 'Innkeeper' },
    stonegear: { name: 'Pilot Stonegear', title: 'Gnomish Pilot' },
    senir: { name: 'Senir Whitebeard', title: 'Mountaineer' },
    grawn: { name: 'Grawn Thromwyn', title: 'Weaponsmith' },
    rudra: { name: 'Rudra Amberstill', title: 'Rancher' },
    firebrew: { name: 'Innkeeper Firebrew', title: 'Innkeeper' },
    overspark: { name: 'Tinkmaster Overspark', title: 'Master Tinker' },
    bruuk: { name: 'Bruuk Barleybeard', title: 'Weaponsmith' },
  });

  // quests
  Object.assign(D.QUESTS, {
    dwarven_outfitters: { name: 'Dwarven Outfitters', lvl: 2, giver: 'talin', turnin: 'talin', text: 'The young wolves are fat on our supplies. Bring me 8 Tough Wolf Meat and I can make you some proper gear.',
      objs: [{ type: 'collect', item: 'wolf_meat', n: 8 }], reward: { choice: ['fam_chest'] } },
    a_new_threat: { name: 'A New Threat', lvl: 2, giver: 'balir', turnin: 'balir', text: 'Rockjaw troggs are crawling up out of the earth all over the valley. Kill 10 of them before they reach Anvilmar.',
      objs: [{ type: 'kill', mob: 'rockjaw_trogg', n: 10 }], reward: { choice: ['fam_legs'] } },
    the_troll_cave: { name: 'The Troll Cave', lvl: 4, giver: 'sten', turnin: 'sten', pre: ['a_new_threat'], text: 'Frostmane trolls have holed up in the cave to the west. Thin out 12 of their whelps.',
      objs: [{ type: 'kill', mob: 'frostmane_troll_whelp', n: 12 }], reward: { choice: ['fam_feet'] } },
    stolen_journal: { name: 'The Stolen Journal', lvl: 5, giver: 'sten', turnin: 'sten', pre: ['the_troll_cave'], text: "Their chief, Grik'nir the Cold, stole Felix's journal. Get it back from the back of the cave.",
      objs: [{ type: 'collect', item: 'felix_journal', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_kharanos: { name: "Senir's Observations", lvl: 5, giver: 'sten', turnin: 'senir', text: 'Take word of the trolls east through the pass to Senir Whitebeard in Kharanos.',
      objs: [{ type: 'visit', place: 'kharanos' }], reward: {} },
    beer_basted_ribs: { name: 'Beer Basted Boar Ribs', lvl: 6, giver: 'ragnar', turnin: 'ragnar', text: 'Nothing goes with Thunderbrew like crag boar ribs. Bring me 6 and I will pour you a round.',
      objs: [{ type: 'collect', item: 'crag_boar_rib', n: 6 }], reward: { choice: ['fam_hands'] } },
    grizzled_den_q: { name: 'The Grizzled Den', lvl: 7, giver: 'stonegear', turnin: 'stonegear', text: 'Wendigo manes make the best engine insulation. Get me 8 from the Grizzled Den.',
      objs: [{ type: 'collect', item: 'wendigo_mane', n: 8 }], reward: { choice: ['fam_wrist'] } },
    frostmane_hold_q: { name: 'Frostmane Hold', lvl: 8, giver: 'senir', turnin: 'senir', pre: ['report_kharanos'], text: 'Scout Frostmane Hold to the west and take down 5 of their headhunters.',
      objs: [{ type: 'visit', place: 'frostmane_hold' }, { type: 'kill', mob: 'frostmane_headhunter', n: 5 }], reward: { choice: ['fam_back'] } },
    recombobulation: { name: 'Operation Recombobulation', lvl: 8, giver: 'overspark', turnin: 'overspark', text: 'The poor leper gnomes carry parts we need to take Gnomeregan back. Recover 8 Restabilization Cogs.',
      objs: [{ type: 'collect', item: 'restab_cog', n: 8 }], reward: { choice: ['fam_waist'] } },
    mountaineers_hunt: { name: 'Hunting the Ranch', lvl: 9, giver: 'rudra', turnin: 'rudra', text: 'Bears and leopards are taking my rams. Kill 6 Ice Claw Bears and 6 Snow Leopards.',
      objs: [{ type: 'kill', mob: 'ice_claw_bear', n: 6 }, { type: 'kill', mob: 'snow_leopard', n: 6 }], reward: { choice: ['fam_chest9'] } },
    protecting_herd: { name: 'Protecting the Herd', lvl: 11, giver: 'rudra', turnin: 'rudra', group: 3, text: 'A huge mountain lion called Vagash has killed half my herd. Bring me his fang. Bring friends.',
      objs: [{ type: 'collect', item: 'vagash_fang', n: 1 }], reward: { choice: ['militia'] } },
    wendigo_cull: { name: 'The Wendigo Problem', lvl: 5, giver: 'belm', turnin: 'belm', text: 'Young wendigos come down from the Grizzled Den and scare off my regulars. Put down 8 of them.',
      objs: [{ type: 'kill', mob: 'young_wendigo', n: 8 }], reward: { money: 90 } },
    frostmane_tusks: { name: 'Frostmane Tusks', lvl: 6, giver: 'grawn', turnin: 'grawn', text: 'Troll tusk makes a fine grip for an axe. Bring me 6 from the Frostmane trolls and I will make you a weapon.',
      objs: [{ type: 'collect', item: 'frostmane_tusk', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    troll_scouting: { name: 'Troll Trouble', lvl: 6, giver: 'senir', turnin: 'senir', pre: ['report_kharanos'], text: 'The Frostmane push closer to Kharanos every day. Show them we bite back. Kill 8 Frostmane Trolls.',
      objs: [{ type: 'kill', mob: 'frostmane_troll', n: 8 }], reward: { choice: ['fam_hands'] } },
    boar_hunt: { name: 'Boar Season', lvl: 6, giver: 'ragnar', turnin: 'ragnar', text: 'The crag boars are trampling my barley. Hunt 8 of them. The ribs are yours to keep.',
      objs: [{ type: 'kill', mob: 'crag_boar', n: 8 }], reward: { money: 110 } },
    ice_claw_pelts: { name: 'Ice Claw Pelts', lvl: 8, giver: 'stonegear', turnin: 'stonegear', text: 'Ice Claw pelts keep the cold out of the engine house. The bears roam near Amberstill Ranch. Bring me 6.',
      objs: [{ type: 'collect', item: 'ice_bear_pelt', n: 6 }], reward: { choice: ['fam_waist'] } },
    frostmane_seers: { name: 'Seers of the Frostmane', lvl: 9, giver: 'senir', turnin: 'senir', pre: ['troll_scouting'], text: 'Their seers keep the Frostmane fighting. Without them the rest will scatter. Kill 6.',
      objs: [{ type: 'kill', mob: 'frostmane_seer', n: 6 }], reward: { choice: ['fam_legs9'] } },
    elder_boars: { name: 'The Elder Boars', lvl: 9, giver: 'belm', turnin: 'belm', text: 'The old crag boars near Amberstill are too tough for my hunters. Bring down 8 elders.',
      objs: [{ type: 'kill', mob: 'elder_crag_boar', n: 8 }], reward: { money: 220 } },
    leper_gnomes: { name: 'A Sad Duty', lvl: 10, giver: 'grawn', turnin: 'grawn', text: 'Leper gnomes from Gnomeregan wander the ranch roads, and they are not who they were. End it for 8 of them.',
      objs: [{ type: 'kill', mob: 'leper_gnome', n: 8 }], reward: { choice: ['fam_hands9'] } },
    westfall_dunmorogh: { name: 'Westfall Needs You', lvl: 10, giver: 'senir', turnin: 'gryan', text: 'Stormwind asks for help in Westfall. Take the Deeprun Tram from Ironforge to Stormwind, head south through Goldshire, then west, and report to Gryan Stoutmantle at Sentinel Hill.',
      objs: [{ type: 'visit', place: 'sentinel_hill' }], reward: {} },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    vagash: { name: 'Protecting the Herd: Vagash', where: 'amberstill_ranch', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite in Dun Morogh. 3 players.', boss: 'vagash', pulls: [{ scene: 'amberstill_ranch', label: 'The ranch', mobs: ['snow_leopard', 'snow_leopard'] }, { scene: 'amberstill_ranch', label: 'The ranch', mobs: ['ice_claw_bear', 'elder_crag_boar'] }, { scene: 'amberstill_ranch', label: 'Vagash', mobs: ['vagash'], boss: true }] },
  });

})(typeof window !== 'undefined' ? window : globalThis);