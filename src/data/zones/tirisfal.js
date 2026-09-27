// Tirisfal Glades, Deathknell and the Undercity: Horde, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('tirisfal', { name: 'Tirisfal Glades', faction: 'horde' });
  // items
  D.item('bat_wing', { name: 'Duskbat Wing', slot: 'quest', q: 1, icon: 'bat_wing' });
  D.item('rot_hide_ichor', { name: 'Rot Hide Ichor', slot: 'quest', q: 1, icon: 'venom' });
  D.item('scarlet_armband', { name: 'Scarlet Armband', slot: 'quest', q: 1, icon: 'scarlet_armband' });
  D.item('maggot_eye_paw', { name: "Maggot Eye's Paw", slot: 'quest', q: 1, icon: 'claw' });
  D.item('maggot_eye_axe', { name: "Maggot Eye's Cleaver", slot: 'weapon', wtype: 'axe', q: 3, lvl: 10, dmg: [13, 24], speed: 2.5, stats: { str: 4, sta: 2 }, icon: 'axe', sell: 800, source: "Maggot Eye, Garren's Haunt", look: ['weapon', 'maggot_eye_axe'] });
  D.item('perrine_cape', { name: "Perrine's Crusader Cape", slot: 'back', q: 3, lvl: 10, armor: 20, stats: { str: 2, sta: 2, int: 2 }, icon: 'cloak', sell: 450, source: 'Captain Perrine, Scarlet Watch Post', look: ['back', 'perrine_cape'] });
  D.item('darkhound_blood', { name: 'Darkhound Blood', slot: 'quest', q: 1, icon: 'venom' });
  D.item('duskbat_pelt', { name: 'Duskbat Pelt', slot: 'quest', q: 1, icon: 'pelt' });

  // creatures
  Object.assign(D.MOBS, {
    mindless_zombie: { name: 'Mindless Zombie', lvl: [1, 2], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.2]] },
    wretched_zombie: { name: 'Wretched Zombie', lvl: [2, 3], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.25]] },
    duskbat: { name: 'Duskbat', lvl: [1, 3], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['bat_wing', 0.6]] },
    rattlecage_skeleton: { name: 'Rattlecage Skeleton', lvl: [3, 4], family: 'undead', drops: [['rotting_flesh', 0.3], ['linen_cloth', 0.25]] },
    samuel_fipps: { name: 'Samuel Fipps', lvl: [4, 4], family: 'undead', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['rotting_flesh', 1]], aggro: 'Braaains...' },
    young_night_web_spider: { name: 'Young Night Web Spider', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.2]] },
    night_web_spider: { name: 'Night Web Spider', lvl: [4, 5], family: 'beast', drops: [['ruined_pelt', 0.25]] },
    darkhound: { name: 'Darkhound', lvl: [6, 7], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]], qdrops: [['darkhound_blood', 0.55]] },
    greater_duskbat: { name: 'Greater Duskbat', lvl: [6, 7], family: 'beast', drops: [['wolf_fang', 0.25]], qdrops: [['bat_wing', 0.6], ['duskbat_pelt', 0.55]] },
    rot_hide_gnoll: { name: 'Rot Hide Gnoll', lvl: [7, 8], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    rot_hide_mongrel: { name: 'Rot Hide Mongrel', lvl: [8, 9], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    maggot_eye: { name: 'Maggot Eye', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.4, dmgMult: 2.5, drops: [['gnoll_mane', 1]], qdrops: [['maggot_eye_paw', 1]], special: 'hogger', loot: ['maggot_eye_axe'], aggro: 'Maggot Eye hungry!' },
    scarlet_convert: { name: 'Scarlet Convert', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'The Light condemns all who harbor evil!' },
    scarlet_warrior: { name: 'Scarlet Warrior', lvl: [9, 10], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'Die, undead scum!' },
    captain_perrine: { name: 'Captain Perrine', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['thieves_coin', 1], ['perrine_cape', 0.35]], aggro: 'For the Crusade!' },
  });

  // places
  Object.assign(D.PLACES, {
    deathknell: { name: 'Deathknell', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'deathknell', lvl: [1, 4], mobs: [['mindless_zombie', 4], ['wretched_zombie', 3], ['duskbat', 3], ['rattlecage_skeleton', 3]], named: { samuel_fipps: 90 }, pool: 12, npcs: ['sarvis', 'arren', 'saltain', 'kien'], vendor: 'kien', links: { night_web_hollow: 12, brill: 30 } },
    night_web_hollow: { name: "Night Web's Hollow", zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'night_web_hollow', lvl: [3, 5], mobs: [['young_night_web_spider', 5], ['night_web_spider', 5]], pool: 9, npcs: [], links: { deathknell: 12 } },
    brill: { name: 'Brill', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'brill', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['sevren', 'renee', 'dillinger', 'johaan', 'gerard'], vendor: 'renee', gearVendor: 'gerard', links: { deathknell: 30, agamand_mills: 14, garrens_haunt: 16, scarlet_watch_post: 18, undercity: 20 } },
    agamand_mills: { name: 'Agamand Mills', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'agamand_mills', lvl: [6, 8], mobs: [['darkhound', 5], ['greater_duskbat', 4], ['rattlecage_skeleton', 2]], pool: 10, npcs: [], links: { brill: 14 } },
    garrens_haunt: { name: "Garren's Haunt", zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'garrens_haunt', lvl: [7, 11], mobs: [['rot_hide_gnoll', 5], ['rot_hide_mongrel', 4]], named: { maggot_eye: 180 }, pool: 9, npcs: [], links: { brill: 16 } },
    scarlet_watch_post: { name: 'Scarlet Watch Post', zone: 'Tirisfal Glades', region: 'tirisfal', scene: 'scarlet_watch_post', lvl: [8, 10], mobs: [['scarlet_convert', 5], ['scarlet_warrior', 5]], named: { captain_perrine: 150 }, pool: 10, npcs: [], links: { brill: 18 } },
    undercity: { name: 'Undercity', zone: 'Undercity', region: 'tirisfal', scene: 'undercity', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['norman', 'abigail'], vendor: 'norman', gearVendor: 'abigail', links: { brill: 20, orgrimmar: 60 }, via: { orgrimmar: 'Zeppelin' } },
  });

  // people
  Object.assign(D.NPCS, {
    sarvis: { name: 'Shadow Priest Sarvis', title: 'Deathknell' },
    arren: { name: 'Executor Arren', title: 'Deathguard' },
    saltain: { name: 'Deathguard Saltain', title: 'Deathguard' },
    kien: { name: 'Joshua Kien', title: 'Food & Drink' },
    sevren: { name: 'Magistrate Sevren', title: 'Brill' },
    renee: { name: 'Innkeeper Renee', title: 'Innkeeper' },
    dillinger: { name: 'Deathguard Dillinger', title: 'Deathguard' },
    johaan: { name: 'Apothecary Johaan', title: 'Royal Apothecary' },
    gerard: { name: 'Gerard Abernathy', title: 'Weaponsmith' },
    norman: { name: 'Innkeeper Norman', title: 'Innkeeper' },
    abigail: { name: 'Abigail Sawyer', title: 'Weaponsmith' },
  });

  // quests
  Object.assign(D.QUESTS, {
    mindless_ones: { name: 'The Mindless Ones', lvl: 2, giver: 'sarvis', turnin: 'sarvis', text: 'Not all who rise keep their minds. Put down 8 Mindless and 6 Wretched Zombies.',
      objs: [{ type: 'kill', mob: 'mindless_zombie', n: 8 }, { type: 'kill', mob: 'wretched_zombie', n: 6 }], reward: { choice: ['fam_chest'] } },
    rattling_cages: { name: 'Rattling the Rattlecages', lvl: 3, giver: 'arren', turnin: 'arren', text: 'Skeletons roam the graveyard. Shatter 10 Rattlecage Skeletons.',
      objs: [{ type: 'kill', mob: 'rattlecage_skeleton', n: 10 }], reward: { choice: ['fam_legs'] } },
    bat_wings: { name: 'Night Web and Wing', lvl: 3, giver: 'saltain', turnin: 'saltain', text: 'The apothecaries want duskbat wings. Bring me 8.',
      objs: [{ type: 'collect', item: 'bat_wing', n: 8 }], reward: { choice: ['fam_feet'] } },
    night_web: { name: "Night Web's Hollow", lvl: 4, giver: 'arren', turnin: 'arren', pre: ['rattling_cages'], text: 'Spiders infest the old mine. Kill 8 young and 6 grown Night Web spiders.',
      objs: [{ type: 'kill', mob: 'young_night_web_spider', n: 8 }, { type: 'kill', mob: 'night_web_spider', n: 6 }], reward: { choice: ['fam_hands'] } },
    samuel_fipps_q: { name: 'Samuel Fipps', lvl: 5, giver: 'sarvis', turnin: 'sarvis', pre: ['mindless_ones'], text: 'Samuel Fipps rose without his mind and stalks the graveyard. Lay him to rest.',
      objs: [{ type: 'kill', mob: 'samuel_fipps', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_brill: { name: 'The Road to Brill', lvl: 5, giver: 'sarvis', turnin: 'sevren', text: 'Take the road east to Brill and report to Magistrate Sevren.',
      objs: [{ type: 'visit', place: 'brill' }], reward: {} },
    agamand_q: { name: 'The Agamand Family', lvl: 7, giver: 'sevren', turnin: 'sevren', pre: ['report_brill'], text: 'Agamand Mills is overrun with darkhounds. Kill 10.',
      objs: [{ type: 'kill', mob: 'darkhound', n: 10 }], reward: { choice: ['fam_wrist'] } },
    rot_hide_q: { name: 'Rot Hide Ichor', lvl: 8, giver: 'johaan', turnin: 'johaan', text: "The gnolls at Garren's Haunt carry a plague I must study. Bring me 8 samples of ichor.",
      objs: [{ type: 'collect', item: 'rot_hide_ichor', n: 8 }], reward: { choice: ['fam_back'] } },
    scarlet_q: { name: 'The Scarlet Crusade', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'The Scarlet Crusade has built a watch post in our lands. Bring me 8 of their armbands.',
      objs: [{ type: 'collect', item: 'scarlet_armband', n: 8 }], reward: { choice: ['fam_chest9'] } },
    perrine_q: { name: 'Captain Perrine', lvl: 10, giver: 'dillinger', turnin: 'dillinger', pre: ['scarlet_q'], text: 'Their captain, Perrine, leads the watch. Remove him.',
      objs: [{ type: 'kill', mob: 'captain_perrine', n: 1 }], reward: { choice: ['fam_waist'] } },
    maggot_eye_q: { name: 'Maggot Eye', lvl: 11, giver: 'sevren', turnin: 'sevren', group: 3, text: "The gnoll chieftain Maggot Eye rules Garren's Haunt. Bring me his paw. Go with others.",
      objs: [{ type: 'collect', item: 'maggot_eye_paw', n: 1 }], reward: { choice: ['militia'] } },
    duskbat_cull: { name: 'Bats Over Brill', lvl: 5, giver: 'renee', turnin: 'renee', text: 'Greater duskbats nest in the Agamand barns and swarm the inn at dusk. Kill 8.',
      objs: [{ type: 'kill', mob: 'greater_duskbat', n: 8 }], reward: { money: 90 } },
    darkhound_blood_q: { name: 'Darkhound Blood', lvl: 6, giver: 'gerard', turnin: 'gerard', text: 'Darkhound blood tempers steel for the Forsaken. Bring me 6 vials from Agamand Mills and I will arm you.',
      objs: [{ type: 'collect', item: 'darkhound_blood', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    duskbat_pelts: { name: 'Duskbat Pelts', lvl: 6, giver: 'johaan', turnin: 'johaan', text: 'I need leather for my... experiments. Duskbat pelts, 6 of them. Do not ask why.',
      objs: [{ type: 'collect', item: 'duskbat_pelt', n: 6 }], reward: { choice: ['fam_hands'] } },
    rot_hide_patrol: { name: 'The Rot Hide Gnolls', lvl: 7, giver: 'dillinger', turnin: 'dillinger', pre: ['report_brill'], text: "The Rot Hide gnolls at Garren's Haunt carry plague toward Brill. Kill 8.",
      objs: [{ type: 'kill', mob: 'rot_hide_gnoll', n: 8 }], reward: { choice: ['fam_wrist'] } },
    mongrel_cull: { name: 'Mongrels of the Haunt', lvl: 8, giver: 'sevren', turnin: 'sevren', text: "The Rot Hide mongrels are the worst of the pack. Put down 8 at Garren's Haunt.",
      objs: [{ type: 'kill', mob: 'rot_hide_mongrel', n: 8 }], reward: { choice: ['fam_waist'] } },
    scarlet_warriors: { name: 'Scarlet Warriors', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'Scarlet warriors guard the watch post. Cut down 8 and they will think twice about Brill.',
      objs: [{ type: 'kill', mob: 'scarlet_warrior', n: 8 }], reward: { choice: ['fam_legs9'] } },
    scarlet_converts: { name: 'Converts No More', lvl: 10, giver: 'renee', turnin: 'renee', text: 'The Scarlet Crusade recruits the living to hunt us. Stop 8 converts before they are trained.',
      objs: [{ type: 'kill', mob: 'scarlet_convert', n: 8 }], reward: { choice: ['fam_hands9'] } },
    crossroads_tirisfal: { name: 'Service to the Horde', lvl: 10, giver: 'sevren', turnin: 'thork', text: 'The Dark Lady supports the Warchief. Take the zeppelin to Orgrimmar and report to Thork at the Crossroads.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    maggot_eye: { name: 'Maggot Eye', where: 'garrens_haunt', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite in Tirisfal. 3 players.', boss: 'maggot_eye', pulls: [{ scene: 'garrens_haunt', label: "Garren's Haunt", mobs: ['rot_hide_gnoll', 'rot_hide_mongrel'] }, { scene: 'garrens_haunt', label: "Garren's Haunt", mobs: ['rot_hide_mongrel', 'rot_hide_mongrel'] }, { scene: 'garrens_haunt', label: 'Maggot Eye', mobs: ['maggot_eye'], boss: true }] },
  });

})(typeof window !== 'undefined' ? window : globalThis);