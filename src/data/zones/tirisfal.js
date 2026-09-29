// Pallmoor, Last Bell and the Gravenhold: Krugar, levels 1–11.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('tirisfal', { name: 'Pallmoor', faction: 'horde' });
  // items
  D.item('bat_wing', { name: 'Gravebat Wing', slot: 'quest', q: 1, icon: 'bat_wing' });
  D.item('rot_hide_ichor', { name: 'Mangecoat Ichor', slot: 'quest', q: 1, icon: 'venom' });
  D.item('scarlet_armband', { name: 'Pyre Armband', slot: 'quest', q: 1, icon: 'scarlet_armband' });
  D.item('maggot_eye_paw', { name: "Grubgut's Paw", slot: 'quest', q: 1, icon: 'claw' });
  D.item('maggot_eye_axe', { name: "Grubgut's Cleaver", slot: 'weapon', wtype: 'axe', q: 3, lvl: 10, dmg: [13, 24], speed: 2.5, stats: { str: 4, sta: 2 }, icon: 'axe', sell: 800, source: "Grubgut, Holt's Haunt", look: ['weapon', 'maggot_eye_axe'] });
  D.item('perrine_cape', { name: "Aubert's Crusader Cape", slot: 'back', q: 3, lvl: 10, armor: 20, stats: { str: 2, sta: 2, int: 2 }, icon: 'cloak', sell: 450, source: 'Captain Aubert, Pyre Watch Post', look: ['back', 'perrine_cape'] });
  D.item('darkhound_blood', { name: 'Darkhound Blood', slot: 'quest', q: 1, icon: 'venom' });
  D.item('duskbat_pelt', { name: 'Gravebat Pelt', slot: 'quest', q: 1, icon: 'pelt' });

  // creatures
  Object.assign(D.MOBS, {
    mindless_zombie: { name: 'Mindless Zombie', lvl: [1, 2], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.2]] },
    wretched_zombie: { name: 'Wretched Zombie', lvl: [2, 3], family: 'undead', drops: [['rotting_flesh', 0.4], ['linen_cloth', 0.25]] },
    duskbat: { name: 'Gravebat', lvl: [1, 3], family: 'beast', drops: [['wolf_fang', 0.2]], qdrops: [['bat_wing', 0.6]] },
    rattlecage_skeleton: { name: 'Chainbone Skeleton', lvl: [3, 4], family: 'undead', drops: [['rotting_flesh', 0.3], ['linen_cloth', 0.25]] },
    samuel_fipps: { name: 'Edric Fane', lvl: [4, 4], family: 'undead', named: true, hpMult: 1.7, dmgMult: 1.2, drops: [['rotting_flesh', 1]], aggro: 'Braaains...' },
    young_night_web_spider: { name: 'Young Spinner Spider', lvl: [3, 4], family: 'beast', drops: [['ruined_pelt', 0.2]] },
    night_web_spider: { name: 'Spinner Spider', lvl: [4, 5], family: 'beast', drops: [['ruined_pelt', 0.25]] },
    darkhound: { name: 'Darkhound', lvl: [6, 7], family: 'beast', drops: [['ruined_pelt', 0.4], ['wolf_fang', 0.3]], qdrops: [['darkhound_blood', 0.55]] },
    greater_duskbat: { name: 'Greater Gravebat', lvl: [6, 7], family: 'beast', drops: [['wolf_fang', 0.25]], qdrops: [['bat_wing', 0.6], ['duskbat_pelt', 0.55]] },
    rot_hide_gnoll: { name: 'Mangecoat Gnoll', lvl: [7, 8], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    rot_hide_mongrel: { name: 'Mangecoat Mongrel', lvl: [8, 9], family: 'humanoid', drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['rot_hide_ichor', 0.6]] },
    maggot_eye: { name: 'Grubgut', lvl: [11, 11], family: 'humanoid', elite: true, named: true, hpMult: 5.4, dmgMult: 2.5, drops: [['gnoll_mane', 1]], qdrops: [['maggot_eye_paw', 1]], special: 'hogger', loot: ['maggot_eye_axe'], aggro: 'Grubgut hungry!' },
    scarlet_convert: { name: 'Pyre Convert', lvl: [8, 9], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'The Light condemns all who harbor evil!' },
    scarlet_warrior: { name: 'Pyre Warrior', lvl: [9, 10], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['scarlet_armband', 0.6]], aggro: 'Die, undead scum!' },
    captain_perrine: { name: 'Captain Aubert', lvl: [10, 10], family: 'humanoid', named: true, hpMult: 1.9, dmgMult: 1.25, drops: [['thieves_coin', 1], ['perrine_cape', 0.35]], aggro: 'For the Order!' },
  });

  // places
  Object.assign(D.PLACES, {
    deathknell: { name: 'Last Bell', zone: 'Pallmoor', region: 'tirisfal', scene: 'deathknell', lvl: [1, 4], mobs: [['mindless_zombie', 4], ['wretched_zombie', 3], ['duskbat', 3], ['rattlecage_skeleton', 3]], named: { samuel_fipps: 90 }, pool: 12, npcs: ['sarvis', 'arren', 'saltain', 'kien'], vendor: 'kien', links: { night_web_hollow: 12, brill: 30 } },
    night_web_hollow: { name: "Spinner's Hollow", zone: 'Pallmoor', region: 'tirisfal', scene: 'night_web_hollow', lvl: [3, 5], mobs: [['young_night_web_spider', 5], ['night_web_spider', 5]], pool: 9, npcs: [], links: { deathknell: 12 } },
    brill: { name: 'Mossgate', zone: 'Pallmoor', region: 'tirisfal', scene: 'brill', lvl: [5, 10], safe: true, inn: true, mobs: [], pool: 0, npcs: ['sevren', 'renee', 'dillinger', 'johaan', 'gerard'], vendor: 'renee', gearVendor: 'gerard', links: { deathknell: 30, agamand_mills: 14, garrens_haunt: 16, scarlet_watch_post: 18, undercity: 20 } },
    agamand_mills: { name: 'Varden Mills', zone: 'Pallmoor', region: 'tirisfal', scene: 'agamand_mills', lvl: [6, 8], mobs: [['darkhound', 5], ['greater_duskbat', 4], ['rattlecage_skeleton', 2]], pool: 10, npcs: [], links: { brill: 14 } },
    garrens_haunt: { name: "Holt's Haunt", zone: 'Pallmoor', region: 'tirisfal', scene: 'garrens_haunt', lvl: [7, 11], mobs: [['rot_hide_gnoll', 5], ['rot_hide_mongrel', 4]], named: { maggot_eye: 180 }, pool: 9, npcs: [], links: { brill: 16 } },
    scarlet_watch_post: { name: 'Pyre Watch Post', zone: 'Pallmoor', region: 'tirisfal', scene: 'scarlet_watch_post', lvl: [8, 10], mobs: [['scarlet_convert', 5], ['scarlet_warrior', 5]], named: { captain_perrine: 150 }, pool: 10, npcs: [], links: { brill: 18 } },
    undercity: { name: 'Gravenhold', zone: 'Gravenhold', region: 'tirisfal', scene: 'undercity', lvl: [1, 60], safe: true, inn: true, city: true, mobs: [], pool: 0, npcs: ['norman', 'abigail', 'mentor_horde', 'banker_horde', 'auctioneer_horde'], vendor: 'norman', gearVendor: 'abigail', links: { brill: 20, orgrimmar: 60 }, via: { orgrimmar: 'Zeppelin' } },
  });

  // people
  Object.assign(D.NPCS, {
    sarvis: { name: 'Shadow Priest Morwen', title: 'Last Bell' },
    arren: { name: 'Executor Thorley', title: 'Graveguard' },
    saltain: { name: 'Graveguard Bramm', title: 'Graveguard' },
    kien: { name: 'Tobias Wren', title: 'Food & Drink' },
    sevren: { name: 'Magistrate Caulder', title: 'Mossgate' },
    renee: { name: 'Innkeeper Lenore', title: 'Innkeeper' },
    dillinger: { name: 'Graveguard Moss', title: 'Graveguard' },
    johaan: { name: 'Apothecary Veit', title: 'Royal Apothecary' },
    gerard: { name: 'Walter Pembry', title: 'Weaponsmith' },
    norman: { name: 'Innkeeper Hester', title: 'Innkeeper' },
    abigail: { name: 'Mercy Dunn', title: 'Weaponsmith' },
  });

  // quests
  Object.assign(D.QUESTS, {
    mindless_ones: { name: 'Those Who Did Not Wake', lvl: 2, giver: 'sarvis', turnin: 'sarvis', text: 'Not all who rise keep their minds. Put down 8 Mindless and 6 Wretched Zombies.',
      objs: [{ type: 'kill', mob: 'mindless_zombie', n: 8 }, { type: 'kill', mob: 'wretched_zombie', n: 6 }], reward: { choice: ['fam_chest'] } },
    rattling_cages: { name: 'Bones in the Graveyard', lvl: 3, giver: 'arren', turnin: 'arren', text: 'Skeletons roam the graveyard. Shatter 10 Chainbone Skeletons.',
      objs: [{ type: 'kill', mob: 'rattlecage_skeleton', n: 10 }], reward: { choice: ['fam_legs'] } },
    bat_wings: { name: 'Spinner and Wing', lvl: 3, giver: 'saltain', turnin: 'saltain', text: 'The apothecaries want gravebat wings. Bring me 8.',
      objs: [{ type: 'collect', item: 'bat_wing', n: 8 }], reward: { choice: ['fam_feet'] } },
    night_web: { name: "Spinner's Hollow", lvl: 4, giver: 'arren', turnin: 'arren', pre: ['rattling_cages'], text: 'Spiders infest the old mine. Kill 8 young and 6 grown Spinner spiders.',
      objs: [{ type: 'kill', mob: 'young_night_web_spider', n: 8 }, { type: 'kill', mob: 'night_web_spider', n: 6 }], reward: { choice: ['fam_hands'] } },
    samuel_fipps_q: { name: 'Edric Fane', lvl: 5, giver: 'sarvis', turnin: 'sarvis', pre: ['mindless_ones'], text: 'Edric Fane rose without his mind and stalks the graveyard. Lay him to rest.',
      objs: [{ type: 'kill', mob: 'samuel_fipps', n: 1 }], reward: { choice: ['fam_weapon5'] } },
    report_brill: { name: 'The Road to Mossgate', lvl: 5, giver: 'sarvis', turnin: 'sevren', text: 'Take the road east to Mossgate and report to Magistrate Caulder.',
      objs: [{ type: 'visit', place: 'brill' }], reward: {} },
    agamand_q: { name: 'The Varden Family', lvl: 7, giver: 'sevren', turnin: 'sevren', pre: ['report_brill'], text: 'Varden Mills is overrun with darkhounds. Kill 10.',
      objs: [{ type: 'kill', mob: 'darkhound', n: 10 }], reward: { choice: ['fam_wrist'] } },
    rot_hide_q: { name: 'Mangecoat Ichor', lvl: 8, giver: 'johaan', turnin: 'johaan', text: "The gnolls at Holt's Haunt carry a plague I must study. Bring me 8 samples of ichor.",
      objs: [{ type: 'collect', item: 'rot_hide_ichor', n: 8 }], reward: { choice: ['fam_back'] } },
    scarlet_q: { name: 'The Order of the Pyre', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'The Order of the Pyre has built a watch post in our lands. Bring me 8 of their armbands.',
      objs: [{ type: 'collect', item: 'scarlet_armband', n: 8 }], reward: { choice: ['fam_chest9'] } },
    perrine_q: { name: 'Captain Aubert', lvl: 10, giver: 'dillinger', turnin: 'dillinger', pre: ['scarlet_q'], text: 'Their captain, Aubert, leads the watch. Remove him.',
      objs: [{ type: 'kill', mob: 'captain_perrine', n: 1 }], reward: { choice: ['fam_waist'] } },
    maggot_eye_q: { name: 'Grubgut', lvl: 11, giver: 'sevren', turnin: 'sevren', group: 3, text: "The gnoll chieftain Grubgut rules Holt's Haunt. Bring me his paw. Go with others.",
      objs: [{ type: 'collect', item: 'maggot_eye_paw', n: 1 }], reward: { choice: ['militia'] } },
    duskbat_cull: { name: 'Bats Over Mossgate', lvl: 5, giver: 'renee', turnin: 'renee', text: 'Greater gravebats nest in the Varden barns and swarm the inn at dusk. Kill 8.',
      objs: [{ type: 'kill', mob: 'greater_duskbat', n: 8 }], reward: { money: 90 } },
    darkhound_blood_q: { name: 'Darkhound Blood', lvl: 6, giver: 'gerard', turnin: 'gerard', text: 'Darkhound blood tempers steel for the Reclaimed. Bring me 6 vials from Varden Mills and I will arm you.',
      objs: [{ type: 'collect', item: 'darkhound_blood', n: 6 }], reward: { choice: ['fam_weapon5'] } },
    duskbat_pelts: { name: 'Gravebat Pelts', lvl: 6, giver: 'johaan', turnin: 'johaan', text: 'I need leather for my... experiments. Gravebat pelts, 6 of them. Do not ask why.',
      objs: [{ type: 'collect', item: 'duskbat_pelt', n: 6 }], reward: { choice: ['fam_hands'] } },
    rot_hide_patrol: { name: 'The Mangecoat Gnolls', lvl: 7, giver: 'dillinger', turnin: 'dillinger', pre: ['report_brill'], text: "The Mangecoat gnolls at Holt's Haunt carry plague toward Mossgate. Kill 8.",
      objs: [{ type: 'kill', mob: 'rot_hide_gnoll', n: 8 }], reward: { choice: ['fam_wrist'] } },
    mongrel_cull: { name: 'Mongrels of the Haunt', lvl: 8, giver: 'sevren', turnin: 'sevren', text: "The Mangecoat mongrels are the worst of the pack. Put down 8 at Holt's Haunt.",
      objs: [{ type: 'kill', mob: 'rot_hide_mongrel', n: 8 }], reward: { choice: ['fam_waist'] } },
    scarlet_warriors: { name: 'Pyre Warriors', lvl: 9, giver: 'dillinger', turnin: 'dillinger', text: 'Pyre warriors guard the watch post. Cut down 8 and they will think twice about Mossgate.',
      objs: [{ type: 'kill', mob: 'scarlet_warrior', n: 8 }], reward: { choice: ['fam_legs9'] } },
    scarlet_converts: { name: 'Converts No More', lvl: 10, giver: 'renee', turnin: 'renee', text: 'The Order of the Pyre recruits the living to hunt us. Stop 8 converts before they are trained.',
      objs: [{ type: 'kill', mob: 'scarlet_convert', n: 8 }], reward: { choice: ['fam_hands9'] } },
    crossroads_tirisfal: { name: 'Service to the Krugar', lvl: 10, giver: 'sevren', turnin: 'thork', text: 'The Pale Queen supports the Warchief. Take the zeppelin to Vazhrak and report to Grukk at Dustfort.',
      objs: [{ type: 'visit', place: 'crossroads' }], reward: {} },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    maggot_eye: { name: 'Grubgut', where: 'garrens_haunt', size: 3, minLvl: 8, maxLvl: 12, desc: 'Open-world elite in Pallmoor. 3 players.', boss: 'maggot_eye', pulls: [{ scene: 'garrens_haunt', label: "Holt's Haunt", mobs: ['rot_hide_gnoll', 'rot_hide_mongrel'] }, { scene: 'garrens_haunt', label: "Holt's Haunt", mobs: ['rot_hide_mongrel', 'rot_hide_mongrel'] }, { scene: 'garrens_haunt', label: 'Grubgut', mobs: ['maggot_eye'], boss: true }] },
  });

})(typeof window !== 'undefined' ? window : globalThis);