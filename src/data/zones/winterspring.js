// Winterspring: levels 57–60 (v8), contested around neutral Everlook, a goblin trading town in the snow. Reached by
// hippogryph from Darnassus or wind rider from Orgrimmar. Furbolgs, frostsabers, yetis, and the blue dragons of Mazthoril.
(function (root) {
  const D = root.D;
  D.zone('winterspring', { name: 'Winterspring', faction: 'contested' });
  D.item('winterfall_beads', { name: 'Winterfall Spirit Beads', slot: 'quest', q: 1, icon: 'seed' });
  D.item('frostsaber_pelt', { name: 'Frostsaber Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('thick_yeti_fur', { name: 'Thick Yeti Fur', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('chimaera_horn', { name: 'Chimaera Horn', slot: 'quest', q: 1, icon: 'claw' });
  D.item('highborne_essence', { name: 'Highborne Essence', slot: 'quest', q: 1, icon: 'dust' });
  D.item('cobalt_scale', { name: 'Cobalt Scale', slot: 'quest', q: 1, icon: 'fin' });
  D.item('snowpaw_heart', { name: "Grizzle Snowpaw's Heart", slot: 'quest', q: 1, icon: 'zombie_brain' });
  D.item('rakshiri_fang', { name: "Rak'shiri's Fang", slot: 'quest', q: 1, icon: 'claw' });
  D.item('snowpaw_band', { name: 'Snowpaw Band', slot: 'finger', q: 3, lvl: 59, stats: { sta: 14, agi: 12 }, icon: 'ring', sell: 12400, source: 'Grizzle Snowpaw, Winterfall Village' });
  D.item('rakshiri_claws', { name: "Rak'shiri's Claws", slot: 'weapon', wtype: 'dagger', q: 3, lvl: 60, dmg: [60, 112], speed: 2.0, stats: { agi: 18, sta: 12 }, icon: 'claw', sell: 13400 });
  D.item('rakshiri_hide', { name: 'Frostsaber Hide Tunic', slot: 'chest', atype: 'leather', q: 3, lvl: 60, armor: 270, stats: { agi: 23, sta: 17 }, icon: 'chest_leather', sell: 13200 });
  D.item('rakshiri_mantle', { name: 'Everfrost Mantle', slot: 'back', q: 3, lvl: 60, armor: 82, stats: { int: 15, spi: 12 }, sp: 16, icon: 'cloak', sell: 12800 });

  Object.assign(D.MOBS, {
    winterfall_ursa: { name: 'Winterfall Ursa', lvl: [57, 58], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.45], ['linen_cloth', 0.3]], qdrops: [['winterfall_beads', 0.45]] },
    winterfall_shaman: { name: 'Winterfall Shaman', lvl: [57, 58], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['winterfall_beads', 0.45]], aggro: 'Winterfall... not... share!' },
    frostsaber_stalker: { name: 'Frostsaber Stalker', lvl: [57, 58], family: 'beast', drops: [['light_leather', 0.3]], qdrops: [['frostsaber_pelt', 0.55]] },
    ice_thistle_yeti: { name: 'Ice Thistle Yeti', lvl: [58, 59], family: 'beast', hpMult: 1.2, drops: [['light_leather', 0.35]], qdrops: [['thick_yeti_fur', 0.55]] },
    chillwind_chimaera: { name: 'Chillwind Chimaera', lvl: [58, 59], family: 'beast', drops: [['light_leather', 0.3]], qdrops: [['chimaera_horn', 0.5]] },
    highborne_apparition: { name: 'Highborne Apparition', lvl: [58, 59], family: 'undead', drops: [['thieves_coin', 0.4]], qdrops: [['highborne_essence', 0.5]], aggro: 'Who disturbs the lake?' },
    cobalt_scalebane: { name: 'Cobalt Scalebane', lvl: [59, 60], family: 'dragonkin', hpMult: 1.2, drops: [['thieves_coin', 0.55]], qdrops: [['cobalt_scale', 0.5]], aggro: 'Mazthoril is forbidden to you!' },
    grizzle_snowpaw: { name: 'Grizzle Snowpaw', lvl: [59, 59], family: 'humanoid', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['snowpaw_band', 0.35], ['thieves_coin', 1]], qdrops: [['snowpaw_heart', 1]], aggro: 'Grizzle... crush!' },
    rakshiri: { name: "Rak'shiri", lvl: [60, 60], family: 'beast', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'whirl', specialText: "Rak'shiri tears into everyone near her!", drops: [['light_leather', 1]], qdrops: [['rakshiri_fang', 1]], loot: ['rakshiri_claws', 'rakshiri_hide', 'rakshiri_mantle'] },
  });

  Object.assign(D.PLACES, {
    everlook: { name: 'Everlook', zone: 'Winterspring', region: 'winterspring', scene: 'everlook', lvl: [57, 60], safe: true, inn: true, mobs: [], pool: 0, npcs: ['donova_snowden', 'witch_doctor_mauari', 'umi_rumplesnicker', 'malyfous_darkhammer', 'haleh', 'innkeeper_everlook', 'xizzer_fizzbolt'], vendor: 'innkeeper_everlook', gearVendor: 'xizzer_fizzbolt',
      links: { frostsaber_rock: 16, winterfall_village: 18, lake_keltheril: 16, darnassus: 60, orgrimmar: 60 }, via: { darnassus: 'Hippogryph', orgrimmar: 'Wind Rider' } },
    frostsaber_rock: { name: 'Frostsaber Rock', zone: 'Winterspring', region: 'winterspring', scene: 'frostsaber_rock', lvl: [57, 58], mobs: [['frostsaber_stalker', 7]], pool: 9, npcs: [], links: { everlook: 16, lake_keltheril: 18, ice_thistle_hills: 18 } },
    winterfall_village: { name: 'Winterfall Village', zone: 'Winterspring', region: 'winterspring', scene: 'winterfall_village', lvl: [57, 59], mobs: [['winterfall_ursa', 5], ['winterfall_shaman', 4]], named: { grizzle_snowpaw: 300 }, pool: 10, npcs: [], links: { everlook: 18, frostwhisper_gorge: 18 } },
    lake_keltheril: { name: "Lake Kel'Theril", zone: 'Winterspring', region: 'winterspring', scene: 'lake_keltheril', lvl: [58, 59], mobs: [['highborne_apparition', 6], ['frostsaber_stalker', 2]], pool: 9, npcs: [], links: { everlook: 16, frostsaber_rock: 18, mazthoril: 18 } },
    ice_thistle_hills: { name: 'Ice Thistle Hills', zone: 'Winterspring', region: 'winterspring', scene: 'ice_thistle_hills', lvl: [58, 59], mobs: [['ice_thistle_yeti', 7]], named: { rakshiri: 150 }, pool: 9, npcs: [], links: { frostsaber_rock: 18 } },
    frostwhisper_gorge: { name: 'Frostwhisper Gorge', zone: 'Winterspring', region: 'winterspring', scene: 'frostwhisper_gorge', lvl: [58, 60], mobs: [['chillwind_chimaera', 5], ['ice_thistle_yeti', 3]], pool: 9, npcs: [], links: { winterfall_village: 18, mazthoril: 18 } },
    mazthoril: { name: 'Mazthoril', zone: 'Winterspring', region: 'winterspring', scene: 'mazthoril', lvl: [59, 60], mobs: [['cobalt_scalebane', 6], ['chillwind_chimaera', 2]], pool: 9, npcs: [], links: { lake_keltheril: 18, frostwhisper_gorge: 18 } },
  });
  D.PLACES.darnassus.links.everlook = 60; D.PLACES.darnassus.via = Object.assign(D.PLACES.darnassus.via || {}, { everlook: 'Hippogryph' });
  D.PLACES.orgrimmar.links.everlook = 60; D.PLACES.orgrimmar.via = Object.assign(D.PLACES.orgrimmar.via || {}, { everlook: 'Wind Rider' });

  Object.assign(D.NPCS, {
    donova_snowden: { name: 'Donova Snowden', title: 'Cenarion Circle' },
    witch_doctor_mauari: { name: 'Witch Doctor Mauari', title: 'Everlook' },
    umi_rumplesnicker: { name: 'Umi Rumplesnicker', title: 'Yeti Enthusiast' },
    malyfous_darkhammer: { name: 'Malyfous Darkhammer', title: 'Blacksmith' },
    haleh: { name: 'Haleh', title: 'Blue Dragonflight' },
    innkeeper_everlook: { name: 'Innkeeper Vizzie', title: 'Innkeeper' },
    xizzer_fizzbolt: { name: 'Xizzer Fizzbolt', title: 'Weaponsmith' },
  });

  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  const Q = (id, q) => { D.QUESTS[id] = q; };
  A('to_everlook_a', { name: 'Everlook', lvl: 57, giver: 'commander_ashlam', turnin: 'donova_snowden', text: 'The Cenarion Circle asks for fighters in Winterspring. Fly from Darnassus to Everlook and find Donova Snowden.',
    objs: [{ type: 'visit', place: 'everlook' }], reward: { money: 3200 } });
  H('to_everlook_h', { name: 'Everlook', lvl: 57, giver: 'high_executor_derrington', turnin: 'donova_snowden', text: 'The goblins of Everlook trade with anyone who pays. Fly from Orgrimmar and see what Winterspring needs.',
    objs: [{ type: 'visit', place: 'everlook' }], reward: { money: 3200 } });
  Q('ws_ursa', { name: 'Winterfall Runners', lvl: 57, giver: 'donova_snowden', turnin: 'donova_snowden', text: 'The Winterfall furbolgs drink something that drives them mad. Kill 12 ursa.',
    objs: [{ type: 'kill', mob: 'winterfall_ursa', n: 12 }], reward: { choice: ['fam_feet58'] } });
  Q('ws_beads', { name: 'Spirit Beads', lvl: 58, giver: 'donova_snowden', turnin: 'donova_snowden', pre: ['ws_ursa'], text: 'Their spirit beads carry the taint. Bring me 8 and I will learn where it comes from.',
    objs: [{ type: 'collect', item: 'winterfall_beads', n: 8 }], reward: { money: 7900 } });
  Q('ws_shamans', { name: 'The Winterfall Shamans', lvl: 58, giver: 'donova_snowden', turnin: 'donova_snowden', pre: ['ws_ursa'], text: 'The shamans brew the poison. Kill 10.',
    objs: [{ type: 'kill', mob: 'winterfall_shaman', n: 10 }], reward: { choice: ['fam_wrist58'] } });
  Q('ws_village', { name: 'Winterfall Village', lvl: 58, giver: 'donova_snowden', turnin: 'donova_snowden', pre: ['ws_shamans'], text: 'Clear the village: 8 ursa and 8 shamans.',
    objs: [{ type: 'kill', mob: 'winterfall_ursa', n: 8 }, { type: 'kill', mob: 'winterfall_shaman', n: 8 }], reward: { choice: ['fam_feet59'] } });
  Q('ws_frostsabers', { name: 'Sick Frostsabers', lvl: 57, giver: 'donova_snowden', turnin: 'donova_snowden', text: 'The frostsabers near the Rock are sick and savage. End it for 12 of them.',
    objs: [{ type: 'kill', mob: 'frostsaber_stalker', n: 12 }], reward: { choice: ['fam_hands58'] } });
  Q('ws_pelts', { name: 'Frostsaber Pelts', lvl: 58, giver: 'malyfous_darkhammer', turnin: 'malyfous_darkhammer', pre: ['ws_frostsabers'], text: 'Frostsaber pelts line the best armour in the north. Bring me 8.',
    objs: [{ type: 'collect', item: 'frostsaber_pelt', n: 8 }], reward: { money: 8000 } });
  Q('ws_yetis', { name: 'Are We There, Yeti?', lvl: 58, giver: 'umi_rumplesnicker', turnin: 'umi_rumplesnicker', text: 'I love yetis. I also need 10 fewer of them in the Ice Thistle Hills. Complicated.',
    objs: [{ type: 'kill', mob: 'ice_thistle_yeti', n: 10 }], reward: { choice: ['fam_legs58'] } });
  Q('ws_yeti_fur', { name: 'Thick Yeti Fur', lvl: 59, giver: 'umi_rumplesnicker', turnin: 'umi_rumplesnicker', pre: ['ws_yetis'], text: 'Bring me 8 thick yeti furs. For science. And a very warm coat.',
    objs: [{ type: 'collect', item: 'thick_yeti_fur', n: 8 }], reward: { money: 8200 } });
  Q('ws_chimaera', { name: 'Chillwind Horns', lvl: 58, giver: 'witch_doctor_mauari', turnin: 'witch_doctor_mauari', text: 'The chimaera of Frostwhisper Gorge have horns full of cold magic. Kill 10 and bring me 5 horns.',
    objs: [{ type: 'kill', mob: 'chillwind_chimaera', n: 10 }, { type: 'collect', item: 'chimaera_horn', n: 5 }], reward: { choice: ['fam_chest58'] } });
  Q('ws_gorge', { name: 'Frostwhisper Gorge', lvl: 59, giver: 'witch_doctor_mauari', turnin: 'witch_doctor_mauari', pre: ['ws_chimaera'], text: 'The gorge must be quiet for my ritual. 8 yetis and 8 chimaera.',
    objs: [{ type: 'kill', mob: 'ice_thistle_yeti', n: 8 }, { type: 'kill', mob: 'chillwind_chimaera', n: 8 }], reward: { choice: ['fam_hands59'] } });
  Q('ws_highborne', { name: 'The Ghosts of Starfall', lvl: 58, giver: 'haleh', turnin: 'haleh', text: "The Highborne of Lake Kel'Theril died when the Well exploded. They have not rested since. Release 10.",
    objs: [{ type: 'kill', mob: 'highborne_apparition', n: 10 }], reward: { choice: ['fam_waist59'] } });
  Q('ws_essence', { name: 'Highborne Essence', lvl: 59, giver: 'haleh', turnin: 'haleh', pre: ['ws_highborne'], text: 'Bring me 6 essences. The dragonflight keeps what magic is left of them.',
    objs: [{ type: 'collect', item: 'highborne_essence', n: 6 }], reward: { money: 8200 } });
  Q('ws_scalebane', { name: 'Mazthoril', lvl: 59, giver: 'haleh', turnin: 'haleh', pre: ['ws_highborne'], text: 'Some of my own kin in Mazthoril have turned against the Aspect. Stop 10 scalebanes.',
    objs: [{ type: 'kill', mob: 'cobalt_scalebane', n: 10 }], reward: { choice: ['fam_weapon59'] } });
  Q('ws_scales', { name: 'Cobalt Scales', lvl: 59, giver: 'malyfous_darkhammer', turnin: 'malyfous_darkhammer', pre: ['ws_scalebane'], text: 'Dragon scale takes an edge like nothing else. Bring me 8.',
    objs: [{ type: 'collect', item: 'cobalt_scale', n: 8 }], reward: { choice: ['fam_back59'] } });
  Q('ws_mazthoril_patrol', { name: 'The Caverns of Mazthoril', lvl: 60, giver: 'haleh', turnin: 'haleh', pre: ['ws_scalebane'], text: '8 scalebanes and 8 chimaera. Then Mazthoril is quiet again.',
    objs: [{ type: 'kill', mob: 'cobalt_scalebane', n: 8 }, { type: 'kill', mob: 'chillwind_chimaera', n: 8 }], reward: { choice: ['fam_chest60'] } });
  Q('ws_snowpaw', { name: 'Grizzle Snowpaw', lvl: 59, giver: 'umi_rumplesnicker', turnin: 'umi_rumplesnicker', text: 'The biggest furbolg in Winterfall, Grizzle Snowpaw, is rarely seen. Bring me his heart. Gently.',
    objs: [{ type: 'collect', item: 'snowpaw_heart', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  Q('ws_rakshiri', { name: "Wanted: Rak'shiri", lvl: 60, giver: 'donova_snowden', turnin: 'donova_snowden', group: 3, text: "Rak'shiri, the frostsaber matriarch, hunts the Ice Thistle Hills. Bring me her fang. Take friends.",
    objs: [{ type: 'collect', item: 'rakshiri_fang', n: 1 }], reward: { choice: ['fam_back_rare60'] } });
  Object.assign(D.ACTIVITIES, {
    rakshiri: { name: "Wanted: Rak'shiri", where: 'ice_thistle_hills', size: 3, minLvl: 57, maxLvl: 60, desc: 'Open-world elite in Winterspring. 3 players.', boss: 'rakshiri', pulls: [{ scene: 'ice_thistle_hills', label: 'The hills', mobs: ['frostsaber_stalker', 'frostsaber_stalker'] }, { scene: 'ice_thistle_hills', label: 'The hills', mobs: ['ice_thistle_yeti', 'frostsaber_stalker'] }, { scene: 'ice_thistle_hills', label: "Rak'shiri", mobs: ['rakshiri'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
