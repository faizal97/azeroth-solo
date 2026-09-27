// Feralas: contested, levels 44–50 (v6). Feathermoon Stronghold (Alliance) and Camp Mojache (Horde); the road north
// leads to the gate of Maraudon in Desolace. Thousand Needles joins it to Tanaris.
(function (root) {
  const D = root.D;
  D.zone('feralas', { name: 'Feralas', faction: 'contested' });
  D.item('hippogryph_feather', { name: 'Frayfeather Plume', slot: 'quest', q: 1, icon: 'feather' });
  D.item('woodpaw_mane', { name: 'Woodpaw Mane', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('gordunni_scroll', { name: 'Gordunni Scroll', slot: 'quest', q: 1, icon: 'journal' });
  D.item('ogre_tusk_f', { name: 'Gordunni Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('hatecrest_scale', { name: 'Hatecrest Scale', slot: 'quest', q: 1, icon: 'fin' });
  D.item('siren_coral', { name: "Siren's Coral", slot: 'quest', q: 1, icon: 'seed' });
  D.item('longtooth_pelt', { name: 'Longtooth Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('walker_bark', { name: 'Ancient Bark', slot: 'quest', q: 1, icon: 'moss' });
  D.item('rathtalon_talon', { name: "Rathtalon's Talon", slot: 'quest', q: 1, icon: 'claw' });
  D.item('grizzlegut_hide', { name: "Grizzlegut's Hide", slot: 'quest', q: 1, icon: 'pelt' });
  D.item('shalzaru_crown', { name: "Shalzaru's Crown", slot: 'quest', q: 1, icon: 'ring' });
  D.item('rathtalon_cloak', { name: 'Black Plume Cloak', slot: 'back', q: 3, lvl: 48, armor: 62, stats: { agi: 11, sta: 10 }, icon: 'cloak', sell: 7600, source: 'Sister Rathtalon, Frayfeather Highlands' });
  D.item('grizzlegut_maul', { name: "Grizzlegut's Paw", slot: 'weapon', wtype: 'mace', q: 3, lvl: 47, dmg: [58, 96], speed: 2.8, stats: { str: 15, sta: 10 }, icon: 'mace', sell: 7800, source: 'Old Grizzlegut, the Lower Wilds' });
  D.item('shalzaru_blade', { name: "Shalzaru's Sword", slot: 'weapon', wtype: 'sword', q: 3, lvl: 50, dmg: [62, 102], speed: 2.6, stats: { agi: 15, str: 11 }, icon: 'sword', sell: 8800 });
  D.item('shalzaru_robe', { name: 'Robe of the Tides', slot: 'chest', atype: 'cloth', q: 3, lvl: 50, armor: 106, stats: { int: 18, spi: 13 }, sp: 22, icon: 'chest_cloth', sell: 8700 });
  D.item('shalzaru_mail', { name: 'Hatecrest Scale Armor', slot: 'chest', atype: 'mail', q: 3, lvl: 50, armor: 410, stats: { str: 18, sta: 15 }, icon: 'chest_mail', sell: 8900 });

  Object.assign(D.MOBS, {
    frayfeather_stagwing: { name: 'Frayfeather Stagwing', lvl: [44, 45], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['hippogryph_feather', 0.55]] },
    frayfeather_skystormer: { name: 'Frayfeather Skystormer', lvl: [45, 46], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['hippogryph_feather', 0.5]] },
    woodpaw_reaver: { name: 'Woodpaw Reaver', lvl: [45, 46], family: 'humanoid', hpMult: 1.1, drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.3]], qdrops: [['woodpaw_mane', 0.55]], aggro: 'Woodpaw kill!' },
    woodpaw_mystic: { name: 'Woodpaw Mystic', lvl: [46, 47], family: 'humanoid', drops: [['gnoll_mane', 0.4], ['linen_cloth', 0.35]], qdrops: [['woodpaw_mane', 0.4]], aggro: 'Bones say die!' },
    gordunni_ogre: { name: 'Gordunni Ogre', lvl: [46, 47], family: 'giant', hpMult: 1.2, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['ogre_tusk_f', 0.55]], aggro: 'Gordunni crush!' },
    gordunni_mage_lord: { name: 'Gordunni Mage-Lord', lvl: [47, 48], family: 'giant', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['gordunni_scroll', 0.45]], aggro: 'We read the scrolls! Now we burn you!' },
    hatecrest_warrior: { name: 'Hatecrest Warrior', lvl: [47, 48], family: 'humanoid', hpMult: 1.1, drops: [['murloc_eye', 0.3], ['thieves_coin', 0.5]], qdrops: [['hatecrest_scale', 0.55]], aggro: 'The coast belongs to the naga!' },
    hatecrest_siren: { name: 'Hatecrest Siren', lvl: [48, 49], family: 'humanoid', drops: [['murloc_eye', 0.3], ['thieves_coin', 0.5]], qdrops: [['siren_coral', 0.45], ['hatecrest_scale', 0.3]], aggro: 'Listen to my song... and drown.' },
    longtooth_runner: { name: 'Longtooth Runner', lvl: [48, 49], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['longtooth_pelt', 0.55]] },
    wandering_forest_walker: { name: 'Wandering Forest Walker', lvl: [49, 50], family: 'elemental', hpMult: 1.25, drops: [['trogg_stone', 0.2]], qdrops: [['walker_bark', 0.55]] },
    sister_rathtalon: { name: 'Sister Rathtalon', lvl: [48, 48], family: 'humanoid', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['rathtalon_cloak', 0.35], ['linen_cloth', 1]], qdrops: [['rathtalon_talon', 1]], aggro: 'The highlands are my hunting ground!' },
    old_grizzlegut: { name: 'Old Grizzlegut', lvl: [47, 47], family: 'beast', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['grizzlegut_maul', 0.35], ['ruined_pelt', 1]], qdrops: [['grizzlegut_hide', 1]] },
    lord_shalzaru: { name: 'Lord Shalzaru', lvl: [50, 50], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'whirl', specialText: 'Lord Shalzaru whirls his four blades!', drops: [['thieves_coin', 1]], qdrops: [['shalzaru_crown', 1]], loot: ['shalzaru_blade', 'shalzaru_robe', 'shalzaru_mail'], aggro: 'The tide rises for you!' },
  });

  Object.assign(D.PLACES, {
    feathermoon_stronghold: { name: 'Feathermoon Stronghold', zone: 'Feralas', region: 'feralas', faction: 'alliance', scene: 'feathermoon_stronghold', lvl: [44, 50], safe: true, inn: true, mobs: [], pool: 0, npcs: ['shandris', 'latronicus', 'innkeeper_shyria', 'vivianna'], vendor: 'innkeeper_shyria', gearVendor: 'vivianna',
      links: { frayfeather_highlands: 20, the_forgotten_coast: 16, darnassus: 60 }, via: { darnassus: 'Hippogryph' } },
    camp_mojache: { name: 'Camp Mojache', zone: 'Feralas', region: 'feralas', faction: 'horde', scene: 'camp_mojache', lvl: [44, 50], safe: true, inn: true, mobs: [], pool: 0, npcs: ['hadoken', 'orwin', 'innkeeper_greul', 'krueg'], vendor: 'innkeeper_greul', gearVendor: 'krueg',
      links: { woodpaw_hills: 16, gordunni_outpost: 18, lower_wilds: 20, thunder_bluff: 55 }, via: { thunder_bluff: 'Wind Rider' } },
    frayfeather_highlands: { name: 'Frayfeather Highlands', zone: 'Feralas', region: 'feralas', scene: 'frayfeather_highlands', lvl: [44, 46], mobs: [['frayfeather_stagwing', 5], ['frayfeather_skystormer', 4]], named: { sister_rathtalon: 300 }, pool: 10, npcs: [], links: { feathermoon_stronghold: 20, woodpaw_hills: 18, lower_wilds: 20 } },
    woodpaw_hills: { name: 'Woodpaw Hills', zone: 'Feralas', region: 'feralas', scene: 'woodpaw_hills', lvl: [45, 47], mobs: [['woodpaw_reaver', 5], ['woodpaw_mystic', 4]], pool: 10, npcs: [], links: { camp_mojache: 16, frayfeather_highlands: 18, maraudon_gate: 35 }, via: { maraudon_gate: 'Road to Desolace' } },
    gordunni_outpost: { name: 'Gordunni Outpost', zone: 'Feralas', region: 'feralas', scene: 'gordunni_outpost', lvl: [46, 48], mobs: [['gordunni_ogre', 5], ['gordunni_mage_lord', 4]], pool: 10, npcs: [], links: { camp_mojache: 18, the_forgotten_coast: 20 } },
    the_forgotten_coast: { name: 'The Forgotten Coast', zone: 'Feralas', region: 'feralas', scene: 'the_forgotten_coast', lvl: [47, 49], mobs: [['hatecrest_warrior', 5], ['hatecrest_siren', 4]], named: { lord_shalzaru: 150 }, pool: 10, npcs: [], links: { feathermoon_stronghold: 16, gordunni_outpost: 20 } },
    lower_wilds: { name: 'The Lower Wilds', zone: 'Feralas', region: 'feralas', scene: 'lower_wilds', lvl: [48, 50], mobs: [['longtooth_runner', 5], ['wandering_forest_walker', 4]], named: { old_grizzlegut: 300 }, pool: 10, npcs: [], links: { camp_mojache: 20, frayfeather_highlands: 20, thistleshrub_valley: 45 }, via: { thistleshrub_valley: 'Road through Thousand Needles' } },
    maraudon_gate: { name: 'Maraudon', zone: 'Desolace', region: 'feralas', scene: 'maraudon_gate', lvl: [46, 50], mobs: [['putridus_trickster', 4], ['cavern_lurker', 3]], pool: 7, npcs: [], links: { woodpaw_hills: 35 }, via: { woodpaw_hills: 'Road to Feralas' } },
  });
  D.PLACES.darnassus.links.feathermoon_stronghold = 60; D.PLACES.darnassus.via.feathermoon_stronghold = 'Hippogryph';
  D.PLACES.thunder_bluff.links.camp_mojache = 55; D.PLACES.thunder_bluff.via = Object.assign(D.PLACES.thunder_bluff.via || {}, { camp_mojache: 'Wind Rider' });
  D.PLACES.thistleshrub_valley.links.lower_wilds = 45; D.PLACES.thistleshrub_valley.via = Object.assign(D.PLACES.thistleshrub_valley.via || {}, { lower_wilds: 'Road through Thousand Needles' });

  Object.assign(D.NPCS, {
    shandris: { name: 'Shandris Feathermoon', title: 'General of the Sentinels' },
    latronicus: { name: 'Latronicus Moonspear', title: 'Feathermoon' },
    innkeeper_shyria: { name: 'Innkeeper Shyria', title: 'Innkeeper' },
    vivianna: { name: 'Vivianna', title: 'Weaponsmith' },
    hadoken: { name: 'Hadoken Swiftstrider', title: 'Camp Mojache' },
    orwin: { name: 'Orwin Gizzmick', title: 'Camp Mojache' },
    innkeeper_greul: { name: 'Innkeeper Greul', title: 'Innkeeper' },
    krueg: { name: 'Krueg Skullsplitter', title: 'Weaponsmith' },
  });

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('tanaris_feralas_a', { name: 'Feathermoon', lvl: 45, giver: 'noggenfogger', turnin: 'shandris', text: 'The night elves of Feathermoon Stronghold want help on the Forgotten Coast. Take the hippogryph from Darnassus, or the road through Thousand Needles.',
    objs: [{ type: 'visit', place: 'feathermoon_stronghold' }], reward: { money: 1800 } });
  H('tanaris_feralas_h', { name: 'Camp Mojache', lvl: 45, giver: 'noggenfogger', turnin: 'hadoken', text: 'The tauren of Camp Mojache in Feralas need hunters. Take the wind rider from Thunder Bluff, or the road through Thousand Needles.',
    objs: [{ type: 'visit', place: 'camp_mojache' }], reward: { money: 1800 } });
  const both = (key, lvl, name, text, objs, ra, rh, pre) => {
    A('fa_' + key, Object.assign({ name, lvl, giver: ra[0], turnin: ra[0], text: text[0], objs, reward: ra[1] }, pre ? { pre: ['fa_' + pre] } : {}));
    H('fh_' + key, Object.assign({ name, lvl, giver: rh[0], turnin: rh[0], text: text[1], objs, reward: rh[1] }, pre ? { pre: ['fh_' + pre] } : {}));
  };
  both('stagwings', 45, 'Frayfeather Hippogryphs', ['Wild hippogryphs attack our messengers. Kill 12 stagwings.', 'Hippogryphs in the highlands dive on our scouts. Kill 12 stagwings.'],
    [{ type: 'kill', mob: 'frayfeather_stagwing', n: 12 }], ['latronicus', { choice: ['fam_feet45'] }], ['hadoken', { choice: ['fam_feet45'] }]);
  both('plumes', 45, 'Frayfeather Plumes', ['Bring me 8 plumes for our arrows.', 'Bring me 8 plumes for our totems.'],
    [{ type: 'collect', item: 'hippogryph_feather', n: 8 }], ['vivianna', { money: 4200 }], ['orwin', { money: 4200 }], 'stagwings');
  both('skystormers', 46, 'Skystormers', ['The skystormers are the fiercest of the flock. Kill 10.', 'The skystormers lead the flock. Kill 10.'],
    [{ type: 'kill', mob: 'frayfeather_skystormer', n: 10 }], ['latronicus', { choice: ['fam_wrist46'] }], ['hadoken', { choice: ['fam_wrist46'] }], 'stagwings');
  both('rathtalon', 48, 'Sister Rathtalon', ['A harpy matriarch hunts the highlands. She is rarely seen. Bring me her talon.', 'Sister Rathtalon, the harpy, preys on our riders. She is rarely seen. Bring me her talon.'],
    [{ type: 'collect', item: 'rathtalon_talon', n: 1 }], ['shandris', { choice: ['fam_ring_rare50'] }], ['hadoken', { choice: ['fam_ring_rare50'] }]);
  both('woodpaw', 46, 'The Woodpaw', ['Woodpaw gnolls raid the roads. Kill 12 reavers.', 'Woodpaw gnolls raid Camp Mojache. Kill 12 reavers.'],
    [{ type: 'kill', mob: 'woodpaw_reaver', n: 12 }], ['latronicus', { money: 4300 }], ['hadoken', { money: 4300 }]);
  both('woodpaw_manes', 47, 'Woodpaw Manes', ['Their mystics call the pack. Kill 8 and bring me 8 manes.', 'Kill 8 mystics and bring me 8 manes.'],
    [{ type: 'kill', mob: 'woodpaw_mystic', n: 8 }, { type: 'collect', item: 'woodpaw_mane', n: 8 }], ['shandris', { choice: ['fam_hands47'] }], ['orwin', { choice: ['fam_hands47'] }], 'woodpaw');
  both('gordunni', 47, 'The Gordunni', ['Ogres of the Gordunni clan dig in the elven ruins. Kill 12.', 'The Gordunni ogres attack our patrols. Kill 12.'],
    [{ type: 'kill', mob: 'gordunni_ogre', n: 12 }], ['latronicus', { choice: ['fam_chest47'] }], ['hadoken', { choice: ['fam_chest47'] }]);
  both('gordunni_scrolls', 48, 'The Gordunni Scrolls', ['Their mage-lords read old elven scrolls. Kill 8 and bring me 4 scrolls.', 'Kill 8 mage-lords and bring me 4 of their scrolls.'],
    [{ type: 'kill', mob: 'gordunni_mage_lord', n: 8 }, { type: 'collect', item: 'gordunni_scroll', n: 4 }], ['shandris', { choice: ['fam_back48'] }], ['orwin', { choice: ['fam_back48'] }], 'gordunni');
  both('ogre_tusks_f', 48, 'Ogre Tusks', ['Bring me 10 ogre tusks. The Sentinels pay a bounty.', 'Bring me 10 ogre tusks. The camp pays a bounty.'],
    [{ type: 'collect', item: 'ogre_tusk_f', n: 10 }], ['vivianna', { money: 4600 }], ['krueg', { money: 4600 }], 'gordunni');
  both('hatecrest', 48, 'The Hatecrest', ['Naga of the Hatecrest raid the coast. Kill 12 warriors.', 'Hatecrest naga threaten the coast. Kill 12 warriors.'],
    [{ type: 'kill', mob: 'hatecrest_warrior', n: 12 }], ['shandris', { choice: ['fam_legs48'] }], ['hadoken', { choice: ['fam_legs48'] }]);
  both('sirens', 49, 'The Sirens', ['Their sirens sing sailors to their deaths. Kill 10 and bring me 5 corals.', 'Kill 10 sirens and bring me 5 corals.'],
    [{ type: 'kill', mob: 'hatecrest_siren', n: 10 }, { type: 'collect', item: 'siren_coral', n: 5 }], ['latronicus', { choice: ['fam_waist49'] }], ['orwin', { choice: ['fam_waist49'] }], 'hatecrest');
  both('scales_f', 49, 'Hatecrest Scales', ['Bring me 10 scales.', 'Bring me 10 scales.'],
    [{ type: 'collect', item: 'hatecrest_scale', n: 10 }], ['vivianna', { money: 4900 }], ['krueg', { money: 4900 }], 'hatecrest');
  both('longtooth', 49, 'The Longtooth Pack', ['Wolves hunt the Lower Wilds. Kill 12 and bring me 6 pelts.', 'Kill 12 Longtooth runners and bring me 6 pelts.'],
    [{ type: 'kill', mob: 'longtooth_runner', n: 12 }, { type: 'collect', item: 'longtooth_pelt', n: 6 }], ['latronicus', { choice: ['fam_hands49'] }], ['hadoken', { choice: ['fam_hands49'] }]);
  both('forest_walkers', 50, 'The Forest Walkers', ['The ancient walkers have gone mad. Kill 10 and bring me 5 bark samples.', 'The forest walkers crush our camps. Kill 10 and bring me 5 bark samples.'],
    [{ type: 'kill', mob: 'wandering_forest_walker', n: 10 }, { type: 'collect', item: 'walker_bark', n: 5 }], ['shandris', { choice: ['fam_weapon50'] }], ['hadoken', { choice: ['fam_weapon50'] }], 'longtooth');
  both('grizzlegut', 47, 'Old Grizzlegut', ['A huge old bear roams the Lower Wilds. He is rarely seen. Bring me his hide.', 'Old Grizzlegut, the bear, is rarely seen. Bring me his hide.'],
    [{ type: 'collect', item: 'grizzlegut_hide', n: 1 }], ['latronicus', { choice: ['fam_back_rare50'] }], ['orwin', { choice: ['fam_back_rare50'] }]);
  both('highland_patrol', 46, 'The Highland Road', ['Keep the road safe: 8 stagwings and 6 skystormers.', 'Keep the road safe: 8 stagwings and 6 skystormers.'],
    [{ type: 'kill', mob: 'frayfeather_stagwing', n: 8 }, { type: 'kill', mob: 'frayfeather_skystormer', n: 6 }], ['vivianna', { money: 4400 }], ['krueg', { money: 4400 }], 'plumes');
  both('gnoll_patrol', 47, 'Back to the Hills', ['8 reavers and 6 mystics, then we sleep.', '8 reavers and 6 mystics, then we sleep.'],
    [{ type: 'kill', mob: 'woodpaw_reaver', n: 8 }, { type: 'kill', mob: 'woodpaw_mystic', n: 6 }], ['latronicus', { money: 4500 }], ['orwin', { money: 4500 }], 'woodpaw_manes');
  both('ogre_patrol_f', 48, 'The Outpost', ['Keep the ogres busy: 8 ogres and 6 mage-lords.', 'Keep the ogres busy: 8 ogres and 6 mage-lords.'],
    [{ type: 'kill', mob: 'gordunni_ogre', n: 8 }, { type: 'kill', mob: 'gordunni_mage_lord', n: 6 }], ['shandris', { choice: ['fam_feet48'] }], ['hadoken', { choice: ['fam_feet48'] }], 'gordunni_scrolls');
  both('coast_patrol', 49, 'Hold the Coast', ['8 warriors and 6 sirens.', '8 warriors and 6 sirens.'],
    [{ type: 'kill', mob: 'hatecrest_warrior', n: 8 }, { type: 'kill', mob: 'hatecrest_siren', n: 6 }], ['latronicus', { money: 5000 }], ['orwin', { money: 5000 }], 'sirens');
  both('wilds_patrol', 50, 'The Wilds', ['10 more runners.', '10 more runners.'],
    [{ type: 'kill', mob: 'longtooth_runner', n: 10 }], ['vivianna', { choice: ['fam_chest50'] }], ['krueg', { choice: ['fam_chest50'] }], 'longtooth');
  both('shalzaru', 50, 'Wanted: Lord Shalzaru', ['The naga lord Shalzaru rules the Forgotten Coast. Bring me his crown. Take friends.', 'Lord Shalzaru leads the naga. Bring me his crown. Take friends.'],
    [{ type: 'collect', item: 'shalzaru_crown', n: 1 }], ['shandris', { choice: ['fam_weapon50'] }], ['hadoken', { choice: ['fam_weapon50'] }]);
  D.QUESTS.fa_shalzaru.group = 3; D.QUESTS.fh_shalzaru.group = 3;
  Object.assign(D.ACTIVITIES, {
    shalzaru: { name: 'Wanted: Lord Shalzaru', where: 'the_forgotten_coast', size: 3, minLvl: 47, maxLvl: 50, desc: 'Open-world elite in Feralas. 3 players.', boss: 'lord_shalzaru', pulls: [{ scene: 'the_forgotten_coast', label: 'Naga ruins', mobs: ['hatecrest_warrior', 'hatecrest_warrior'] }, { scene: 'the_forgotten_coast', label: 'Naga ruins', mobs: ['hatecrest_siren', 'hatecrest_warrior'] }, { scene: 'the_forgotten_coast', label: 'Lord Shalzaru', mobs: ['lord_shalzaru'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
