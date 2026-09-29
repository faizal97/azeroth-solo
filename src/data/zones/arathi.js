// Kinloch Highlands: contested, levels 35–40 (v5.1).
// Holdfast Point (Accord) and Chainbreak (Krugar) are closed to the other faction. Thoradin's Wall leads west into the
// Vaskar foothills, the only Accord road towards the Pyre Abbey.
(function (root) {
  const D = root.D;
  D.zone('arathi', { name: 'Kinloch Highlands', faction: 'contested' });
  // quest items
  D.item('thrasher_claw', { name: 'Highland Thrasher Claw', slot: 'quest', q: 1, icon: 'claw' });
  D.item('fleshstalker_hide', { name: 'Fleshstalker Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('kobold_candle', { name: 'Candlegrub Candle', slot: 'quest', q: 1, icon: 'candle' });
  D.item('drywhisker_ore', { name: 'Candlegrub Ore Sample', slot: 'quest', q: 1, icon: 'dust' });
  D.item('witherbark_tusk', { name: 'Rotbough Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('shrunken_head', { name: 'Shrunken Head', slot: 'quest', q: 1, icon: 'head' });
  D.item('syndicate_documents', { name: 'Black Ledger Documents', slot: 'quest', q: 1, icon: 'journal' });
  D.item('magus_focus', { name: 'Black Ledger Magus Focus', slot: 'quest', q: 1, icon: 'seed' });
  D.item('ogre_bead', { name: 'Rockbrow Bead Necklace', slot: 'quest', q: 1, icon: 'ring' });
  D.item('elemental_core', { name: 'Bound Elemental Core', slot: 'quest', q: 1, icon: 'dust' });
  D.item('kovork_crown', { name: "Kobbo's Candle Crown", slot: 'quest', q: 1, icon: 'candle' });
  D.item('nimar_blade', { name: "Ghast's Blade", slot: 'quest', q: 1, icon: 'dagger' });
  D.item('molok_head', { name: "Gorm's Head", slot: 'quest', q: 1, icon: 'head' });
  // named and elite drops
  D.item('kovork_band', { name: 'Waxen Band', slot: 'finger', q: 3, lvl: 37, stats: { int: 8, sta: 8 }, icon: 'ring', sell: 5400, source: 'Kobbo, Candlegrub Gorge' });
  D.item('nimar_glaive', { name: "Slayer's Glaive", slot: 'weapon', wtype: 'sword', q: 3, lvl: 37, dmg: [46, 76], speed: 2.6, stats: { agi: 11, sta: 7 }, icon: 'sword', sell: 5600, source: 'Ghast the Slayer, Rotbough Village' });
  D.item('molok_maul', { name: "Gorm's Crusher", slot: 'weapon', wtype: 'mace', q: 3, lvl: 40, dmg: [52, 86], speed: 2.8, stats: { str: 14, sta: 8 }, icon: 'mace', sell: 6400 });
  D.item('molok_girdle', { name: 'Ogre-Hide Girdle', slot: 'waist', atype: 'leather', q: 3, lvl: 40, armor: 92, stats: { agi: 11, sta: 9 }, icon: 'belt', sell: 5800 });
  D.item('molok_robe', { name: 'Robe of the Rockbrow Magi', slot: 'chest', atype: 'cloth', q: 3, lvl: 40, armor: 84, stats: { int: 15, spi: 10 }, sp: 18, icon: 'chest_cloth', sell: 6200 });

  // creatures
  Object.assign(D.MOBS, {
    highland_thrasher: { name: 'Highland Thrasher', lvl: [35, 36], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['thrasher_claw', 0.55]] },
    highland_fleshstalker: { name: 'Highland Fleshstalker', lvl: [36, 37], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.4]], qdrops: [['fleshstalker_hide', 0.55]] },
    drywhisker_kobold: { name: 'Candlegrub Kobold', lvl: [35, 36], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['kobold_candle', 0.55]], aggro: 'No take candle!' },
    drywhisker_digger: { name: 'Candlegrub Digger', lvl: [36, 37], family: 'humanoid', drops: [['broken_candle', 0.4], ['linen_cloth', 0.3]], qdrops: [['drywhisker_ore', 0.5]], aggro: 'You no dig here!' },
    witherbark_headhunter: { name: 'Rotbough Headhunter', lvl: [36, 37], family: 'humanoid', hpMult: 1.1, drops: [['troll_tusk', 0.45], ['linen_cloth', 0.3]], qdrops: [['witherbark_tusk', 0.55]], aggro: 'Your head is mine!' },
    witherbark_shadowcaster: { name: 'Rotbough Shadowcaster', lvl: [37, 38], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.35]], qdrops: [['shrunken_head', 0.45], ['witherbark_tusk', 0.3]], aggro: 'The shadows take you!' },
    syndicate_highwayman: { name: 'Black Ledger Highwayman', lvl: [37, 38], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['syndicate_documents', 0.45]], aggro: 'Highhold belongs to the Black Ledger!' },
    syndicate_magus: { name: 'Black Ledger Magus', lvl: [38, 39], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['magus_focus', 0.45], ['syndicate_documents', 0.3]], aggro: 'Burn, intruder!' },
    boulderfist_brute: { name: 'Rockbrow Brute', lvl: [38, 39], family: 'giant', hpMult: 1.2, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['ogre_bead', 0.5]], aggro: 'Me crush you!' },
    boulderfist_magus: { name: 'Rockbrow Magus', lvl: [39, 40], family: 'giant', hpMult: 1.1, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['ogre_bead', 0.4]], aggro: 'We smash! No, we burn! We both!' },
    burning_exile: { name: 'Burning Exile', lvl: [38, 39], family: 'elemental', drops: [['trogg_stone', 0.3]], qdrops: [['elemental_core', 0.5]] },
    rumbling_exile: { name: 'Rumbling Exile', lvl: [39, 40], family: 'elemental', hpMult: 1.2, drops: [['trogg_stone', 0.3]], qdrops: [['elemental_core', 0.5]] },
    kovork: { name: 'Kobbo', lvl: [37, 37], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['kovork_band', 0.35], ['broken_candle', 1]], qdrops: [['kovork_crown', 1]], aggro: 'Kobbo is king of the candles!' },
    nimar_the_slayer: { name: 'Ghast the Slayer', lvl: [37, 37], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['nimar_glaive', 0.35], ['troll_tusk', 1]], qdrops: [['nimar_blade', 1]], aggro: 'Ghast hunts you now!' },
    molok_the_crusher: { name: 'Gorm the Crusher', lvl: [40, 40], family: 'giant', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'slam', specialText: 'Gorm brings down his maul!', drops: [['thieves_coin', 1]], qdrops: [['molok_head', 1]], loot: ['molok_maul', 'molok_girdle', 'molok_robe'] },
  });

  // places
  Object.assign(D.PLACES, {
    refuge_pointe: { name: 'Holdfast Point', zone: 'Kinloch Highlands', region: 'arathi', faction: 'alliance', scene: 'refuge_pointe', lvl: [35, 40], safe: true, inn: true, mobs: [], pool: 0, npcs: ['captain_nials', 'sergeant_maclear', 'shards', 'innkeeper_taruga'], vendor: 'innkeeper_taruga',
      links: { highland_plains: 16, stromgarde_keep: 18, menethil_harbor: 40 }, via: { menethil_harbor: 'Harrow Span' } },
    hammerfall: { name: 'Chainbreak', zone: 'Kinloch Highlands', region: 'arathi', faction: 'horde', scene: 'hammerfall', lvl: [35, 40], safe: true, inn: true, mobs: [], pool: 0, npcs: ['drum_fel', 'tor_gan', 'gorn', 'innkeeper_adegwa', 'urda'], vendor: 'innkeeper_adegwa', gearVendor: 'urda',
      links: { highland_plains: 20, drywhisker_gorge: 16, boulderfist_hall: 18, tarren_mill: 35 }, via: { tarren_mill: 'Road through the hills' } },
    highland_plains: { name: 'The Highland Plains', zone: 'Kinloch Highlands', region: 'arathi', scene: 'highland_plains', lvl: [35, 37], mobs: [['highland_thrasher', 5], ['highland_fleshstalker', 4]], pool: 10, npcs: [], links: { refuge_pointe: 16, hammerfall: 20, witherbark_village: 18, circle_of_west_binding: 18, alterac_foothills: 30 }, via: { alterac_foothills: "Thoradin's Wall" } },
    drywhisker_gorge: { name: 'Candlegrub Gorge', zone: 'Kinloch Highlands', region: 'arathi', scene: 'drywhisker_gorge', lvl: [35, 37], mobs: [['drywhisker_kobold', 5], ['drywhisker_digger', 4]], named: { kovork: 300 }, pool: 10, npcs: [], links: { hammerfall: 16, boulderfist_hall: 18 } },
    witherbark_village: { name: 'Rotbough Village', zone: 'Kinloch Highlands', region: 'arathi', scene: 'witherbark_village', lvl: [36, 38], mobs: [['witherbark_headhunter', 5], ['witherbark_shadowcaster', 4]], named: { nimar_the_slayer: 300 }, pool: 10, npcs: [], links: { highland_plains: 18, stromgarde_keep: 18 } },
    stromgarde_keep: { name: 'Highhold Keep', zone: 'Kinloch Highlands', region: 'arathi', scene: 'stromgarde_keep', lvl: [37, 39], mobs: [['syndicate_highwayman', 5], ['syndicate_magus', 4]], pool: 10, npcs: [], links: { refuge_pointe: 18, witherbark_village: 18, circle_of_west_binding: 18 } },
    boulderfist_hall: { name: 'Rockbrow Hall', zone: 'Kinloch Highlands', region: 'arathi', scene: 'boulderfist_hall', lvl: [38, 40], mobs: [['boulderfist_brute', 5], ['boulderfist_magus', 4]], named: { molok_the_crusher: 150 }, pool: 10, npcs: [], links: { hammerfall: 18, drywhisker_gorge: 18 } },
    circle_of_west_binding: { name: 'The West Binding Stones', zone: 'Kinloch Highlands', region: 'arathi', scene: 'circle_of_west_binding', lvl: [38, 40], mobs: [['burning_exile', 5], ['rumbling_exile', 4]], pool: 10, npcs: [], links: { highland_plains: 18, stromgarde_keep: 18 } },
  });
  D.PLACES.menethil_harbor.links.refuge_pointe = 40; D.PLACES.menethil_harbor.via.refuge_pointe = 'Harrow Span';
  D.PLACES.tarren_mill.links.hammerfall = 35; D.PLACES.tarren_mill.via.hammerfall = 'Road through the hills';
  D.PLACES.alterac_foothills.links.highland_plains = 30; D.PLACES.alterac_foothills.via = Object.assign(D.PLACES.alterac_foothills.via || {}, { highland_plains: "Thoradin's Wall" });

  // people
  Object.assign(D.NPCS, {
    captain_nials: { name: 'Captain Oswyn', title: 'League of Kinloch' },
    sergeant_maclear: { name: 'Sergeant Brody', title: 'Holdfast Point' },
    shards: { name: 'Flint', title: 'Scout of Highhold' },
    innkeeper_taruga: { name: 'Quartermaster Rukka', title: 'Supplies' },
    drum_fel: { name: 'Drum Ashka', title: 'Chainbreak' },
    tor_gan: { name: "Vrenn", title: 'Defiler Hunter' },
    gorn: { name: 'Mogg', title: 'Shaman of the Earth' },
    innkeeper_adegwa: { name: 'Innkeeper Duva', title: 'Innkeeper' },
    urda: { name: 'Hesk', title: 'Weaponsmith' },
  });

  // quests
  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('menethil_arathi', { name: 'The League of Kinloch', lvl: 35, giver: 'stoutfist', turnin: 'captain_nials', text: 'Holdfast Point, over the Harrow Span, holds the last of Kinloch. They need soldiers. Report to Captain Oswyn.',
    objs: [{ type: 'visit', place: 'refuge_pointe' }], reward: { money: 1200 } });
  H('tarren_arathi', { name: 'Chainbreak', lvl: 35, giver: 'darthalia', turnin: 'drum_fel', text: 'Chainbreak, east over the hills, is the Krugar\'s fist in Kinloch. Report to Drum Ashka.',
    objs: [{ type: 'visit', place: 'hammerfall' }], reward: { money: 1200 } });
  const both = (key, lvl, name, text, objs, ra, rh, pre) => {
    A('a_' + key, Object.assign({ name, lvl, giver: ra[0], turnin: ra[0], text: text[0], objs, reward: ra[1] }, pre ? { pre: ['a_' + pre] } : {}));
    H('h_' + key, Object.assign({ name, lvl, giver: rh[0], turnin: rh[0], text: text[1], objs, reward: rh[1] }, pre ? { pre: ['h_' + pre] } : {}));
  };
  both('thrashers', 35, 'Highland Thrashers', ['Raptors on the plains attack our supply carts. Kill 12 thrashers.', 'Raptors on the plains attack our wolf riders. Kill 12 thrashers.'],
    [{ type: 'kill', mob: 'highland_thrasher', n: 12 }], ['sergeant_maclear', { choice: ['fam_feet36'] }], ['tor_gan', { choice: ['fam_feet36'] }]);
  both('thrasher_claws', 36, 'Raptor Claws', ['Bring me 8 claws. The League pays for proof.', 'Bring me 8 claws for our hunters.'],
    [{ type: 'collect', item: 'thrasher_claw', n: 8 }], ['shards', { money: 2600 }], ['tor_gan', { money: 2600 }], 'thrashers');
  both('fleshstalkers', 37, 'The Fleshstalkers', ['The fleshstalkers hunt in packs. Kill 10 and bring me 5 hides.', 'The fleshstalkers are the true danger. Kill 10 and bring me 5 hides.'],
    [{ type: 'kill', mob: 'highland_fleshstalker', n: 10 }, { type: 'collect', item: 'fleshstalker_hide', n: 5 }], ['sergeant_maclear', { choice: ['fam_wrist37'] }], ['tor_gan', { choice: ['fam_wrist37'] }], 'thrashers');
  both('kobolds', 35, 'Candlegrub Gorge', ['Kobolds dig for gold in Candlegrub Gorge. Kill 12.', 'Kobolds dig in the gorge by Chainbreak. Kill 12.'],
    [{ type: 'kill', mob: 'drywhisker_kobold', n: 12 }], ['shards', { money: 2500 }], ['gorn', { money: 2500 }]);
  both('candles', 36, 'Wax and Ore', ['Bring me 8 kobold candles and 5 ore samples. We want to know what they dig for.', 'Bring me 8 candles and 5 ore samples. The shaman want to see what the kobolds dig.'],
    [{ type: 'collect', item: 'kobold_candle', n: 8 }, { type: 'collect', item: 'drywhisker_ore', n: 5 }], ['captain_nials', { choice: ['fam_weapon37'] }], ['gorn', { choice: ['fam_weapon37'] }], 'kobolds');
  both('kovork', 37, 'Kobbo', ['The kobold king, Kobbo, wears a crown of candles. He is rarely seen. Bring it to me.', 'Kobbo, the kobold chief, is rarely seen outside his tunnel. Bring me his candle crown.'],
    [{ type: 'collect', item: 'kovork_crown', n: 1 }], ['shards', { choice: ['fam_ring_rare40'] }], ['drum_fel', { choice: ['fam_ring_rare40'] }]);
  both('witherbark', 36, 'The Rotbough', ['Rotbough trolls raid the villages. Kill 12 headhunters.', 'Rotbough trolls kill our scouts. Kill 12 headhunters.'],
    [{ type: 'kill', mob: 'witherbark_headhunter', n: 12 }], ['sergeant_maclear', { choice: ['fam_chest38'] }], ['drum_fel', { choice: ['fam_chest38'] }]);
  both('shadowcasters', 37, 'Shrunken Heads', ['Their shadowcasters shrink the heads of their victims. Kill 8 and bring me 5 heads so we can bury them.', 'Their shadowcasters use dark hex. Kill 8 and bring me 5 shrunken heads.'],
    [{ type: 'kill', mob: 'witherbark_shadowcaster', n: 8 }, { type: 'collect', item: 'shrunken_head', n: 5 }], ['captain_nials', { money: 2800 }], ['gorn', { money: 2800 }], 'witherbark');
  both('troll_tusks', 38, 'Rotbough Tusks', ['Bring me 10 tusks. The League pays a bounty.', 'Bring me 10 tusks. The Kessari want them.'],
    [{ type: 'collect', item: 'witherbark_tusk', n: 10 }], ['shards', { choice: ['fam_hands39'] }], ['drum_fel', { choice: ['fam_hands39'] }], 'witherbark');
  both('nimar', 37, 'Ghast the Slayer', ['A troll hunter called Ghast the Slayer stalks the hills. He is rarely seen. Bring me his blade.', 'Ghast the Slayer hunts our wolf riders. He is rarely seen. Bring me his blade.'],
    [{ type: 'collect', item: 'nimar_blade', n: 1 }], ['sergeant_maclear', { choice: ['fam_back_rare40'] }], ['tor_gan', { choice: ['fam_back_rare40'] }]);
  both('syndicate', 37, 'Highhold', ['The Black Ledger hold the ruins of Highhold, the old capital. Kill 12 highwaymen.', 'The Black Ledger hold Highhold. They sell Krugar scalps to the Accord. Kill 12 highwaymen.'],
    [{ type: 'kill', mob: 'syndicate_highwayman', n: 12 }], ['captain_nials', { choice: ['fam_legs38'] }], ['drum_fel', { choice: ['fam_legs38'] }]);
  both('magi', 38, 'The Black Ledger Magi', ['Their magi guard the keep. Kill 10 and bring me 4 foci.', 'Their magi guard the keep. Kill 10 and bring me 4 foci.'],
    [{ type: 'kill', mob: 'syndicate_magus', n: 10 }, { type: 'collect', item: 'magus_focus', n: 4 }], ['shards', { choice: ['fam_back38'] }], ['gorn', { choice: ['fam_back38'] }], 'syndicate');
  both('documents', 38, 'Black Ledger Documents', ['Bring me 6 of their documents. Someone in Kingsmere pays them.', 'Bring me 6 of their documents. The Pale Queen wants their names.'],
    [{ type: 'collect', item: 'syndicate_documents', n: 6 }], ['captain_nials', { money: 3000 }], ['drum_fel', { money: 3000 }], 'syndicate');
  both('ogres', 38, 'Rockbrow Hall', ['Ogres hold Rockbrow Hall in the east. Kill 12 brutes.', 'The Rockbrow ogres raid Chainbreak. Kill 12 brutes.'],
    [{ type: 'kill', mob: 'boulderfist_brute', n: 12 }], ['sergeant_maclear', { choice: ['fam_waist39'] }], ['tor_gan', { choice: ['fam_waist39'] }]);
  both('ogre_magi', 39, 'The Two-Headed Magi', ['Their magi are worse. Kill 10 and bring me 5 bead necklaces.', 'Kill 10 ogre magi and bring me 5 of their necklaces.'],
    [{ type: 'kill', mob: 'boulderfist_magus', n: 10 }, { type: 'collect', item: 'ogre_bead', n: 5 }], ['captain_nials', { choice: ['fam_chest38'] }], ['gorn', { choice: ['fam_chest38'] }], 'ogres');
  both('elementals', 39, 'The Circle of Binding', ['Someone has bound elementals in the stone circle. Kill 10 burning exiles.', 'The circle holds bound elementals. Kill 10 burning exiles.'],
    [{ type: 'kill', mob: 'burning_exile', n: 10 }], ['shards', { money: 3200 }], ['gorn', { money: 3200 }]);
  both('cores', 40, 'Bound Cores', ['Break the binding: kill 8 rumbling exiles and bring me 5 cores.', 'Kill 8 rumbling exiles and bring me 5 cores. The Grass Mother weeps for them.'],
    [{ type: 'kill', mob: 'rumbling_exile', n: 8 }, { type: 'collect', item: 'elemental_core', n: 5 }], ['captain_nials', { choice: ['fam_weapon40'] }], ['gorn', { choice: ['fam_weapon40'] }], 'elementals');
  both('plains_patrol', 36, 'Plains Patrol', ['Keep the road open: 8 thrashers and 6 fleshstalkers.', 'Keep the road open: 8 thrashers and 6 fleshstalkers.'],
    [{ type: 'kill', mob: 'highland_thrasher', n: 8 }, { type: 'kill', mob: 'highland_fleshstalker', n: 6 }], ['sergeant_maclear', { money: 2700 }], ['tor_gan', { money: 2700 }], 'thrasher_claws');
  both('gorge_patrol', 37, 'The Gorge Again', ['The kobolds dig new tunnels. Kill 10 diggers.', 'Kill 10 diggers before they tunnel under Chainbreak.'],
    [{ type: 'kill', mob: 'drywhisker_digger', n: 10 }], ['shards', { choice: ['fam_feet36'] }], ['gorn', { choice: ['fam_feet36'] }], 'candles');
  both('keep_patrol', 39, 'Hold Highhold', ['Keep the Black Ledger down: 8 highwaymen and 6 magi.', 'Keep the Black Ledger down: 8 highwaymen and 6 magi.'],
    [{ type: 'kill', mob: 'syndicate_highwayman', n: 8 }, { type: 'kill', mob: 'syndicate_magus', n: 6 }], ['captain_nials', { money: 3100 }], ['drum_fel', { money: 3100 }], 'magi');
  both('molok', 40, 'Wanted: Gorm the Crusher', ['The ogre warlord Gorm leads the Rockbrow. Bring me his head. Take friends.', 'Gorm the Crusher leads the ogres against Chainbreak. Bring me his head. Take friends.'],
    [{ type: 'collect', item: 'molok_head', n: 1 }], ['captain_nials', { choice: ['fam_weapon40'] }], ['drum_fel', { choice: ['fam_weapon40'] }]);
  D.QUESTS.a_molok.group = 3; D.QUESTS.h_molok.group = 3;

  // group finder: the open-world elite
  Object.assign(D.ACTIVITIES, {
    molok: { name: 'Wanted: Gorm the Crusher', where: 'boulderfist_hall', size: 3, minLvl: 37, maxLvl: 40, desc: 'Open-world elite in Kinloch. 3 players.', boss: 'molok_the_crusher', pulls: [{ scene: 'boulderfist_hall', label: 'The hall gate', mobs: ['boulderfist_brute', 'boulderfist_brute'] }, { scene: 'boulderfist_hall', label: 'The hall gate', mobs: ['boulderfist_magus', 'boulderfist_brute'] }, { scene: 'boulderfist_hall', label: 'Gorm the Crusher', mobs: ['molok_the_crusher'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
