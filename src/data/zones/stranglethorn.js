// Northern Stranglethorn Vale: contested, levels 30–35 (v5).
// Rebel Camp (Alliance) and Grom'gol (Horde) are closed to the other faction; Nesingwary's Expedition is a neutral
// hunting camp that both factions use. The south (Booty Bay, the Gurubashi Arena) comes later.
(function (root) {
  const D = root.D;
  D.zone('stranglethorn', { name: 'Stranglethorn Vale', faction: 'contested' });
  // quest items
  D.item('tiger_fang', { name: 'Stranglethorn Tiger Fang', slot: 'quest', q: 1, icon: 'claw' });
  D.item('panther_pelt', { name: 'Shadowmaw Pelt', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('raptor_talon', { name: 'Jungle Raptor Talon', slot: 'quest', q: 1, icon: 'claw' });
  D.item('jungle_stalker_hide', { name: 'Jungle Stalker Hide', slot: 'quest', q: 1, icon: 'pelt' });
  D.item('bloodscalp_tusk', { name: 'Bloodscalp Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('troll_charm', { name: 'Voodoo Charm', slot: 'quest', q: 1, icon: 'voodoo_doll' });
  D.item('kurzen_orders', { name: 'Kurzen Battle Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('jungle_remedy', { name: 'Jungle Remedy', slot: 'quest', q: 1, icon: 'venom' });
  D.item('venture_ledger', { name: 'Venture Co. Ledger', slot: 'quest', q: 1, icon: 'journal' });
  D.item('skullsplitter_tusk', { name: 'Skullsplitter Tusk', slot: 'quest', q: 1, icon: 'tusk' });
  D.item('sin_dall_pelt', { name: "Sin'Dall's Pelt", slot: 'quest', q: 1, icon: 'pelt' });
  D.item('kurzen_head', { name: "Colonel Kurzen's Head", slot: 'quest', q: 1, icon: 'head' });
  D.item('bangalash_pelt', { name: 'Pelt of King Bangalash', slot: 'quest', q: 1, icon: 'pelt' });
  // named and elite drops
  D.item('sin_dall_cloak', { name: 'Pale Tiger Cloak', slot: 'back', q: 3, lvl: 34, armor: 50, stats: { agi: 9, sta: 7 }, icon: 'cloak', sell: 4600, source: "Sin'Dall, the Ruins of Balia'mah" });
  D.item('kurzen_sabre', { name: "Kurzen's Sabre", slot: 'weapon', wtype: 'sword', q: 3, lvl: 33, dmg: [42, 70], speed: 2.6, stats: { str: 10, agi: 6 }, icon: 'sword', sell: 4600, source: 'Colonel Kurzen, the Kurzen Compound' });
  D.item('bangalash_hide', { name: "King's Hide Jerkin", slot: 'chest', atype: 'leather', q: 3, lvl: 35, armor: 170, stats: { agi: 13, sta: 10 }, icon: 'chest_leather', sell: 5400 });
  D.item('bangalash_fang', { name: "Bangalash's Fang", slot: 'weapon', wtype: 'dagger', q: 3, lvl: 35, dmg: [29, 52], speed: 1.8, stats: { agi: 10, sta: 6 }, icon: 'dagger', sell: 5400 });
  D.item('bangalash_mantle', { name: 'White Tiger Mantle', slot: 'back', q: 3, lvl: 35, armor: 52, stats: { sta: 9, str: 8 }, icon: 'cloak', sell: 5000 });

  // creatures
  Object.assign(D.MOBS, {
    stranglethorn_raptor: { name: 'Stranglethorn Raptor', lvl: [30, 31], family: 'beast', drops: [['ruined_pelt', 0.35]], qdrops: [['raptor_talon', 0.55]] },
    stranglethorn_tiger: { name: 'Stranglethorn Tiger', lvl: [31, 32], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['tiger_fang', 0.55]] },
    bloodscalp_warrior: { name: 'Bloodscalp Warrior', lvl: [30, 31], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.3]], qdrops: [['bloodscalp_tusk', 0.55]], aggro: 'Bloodscalp gonna eat you, mon!' },
    bloodscalp_axe_thrower: { name: 'Bloodscalp Axe Thrower', lvl: [31, 32], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.3]], qdrops: [['troll_charm', 0.45], ['bloodscalp_tusk', 0.3]], aggro: 'Catch dis!' },
    kurzen_commando: { name: 'Kurzen Commando', lvl: [31, 32], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.3]], qdrops: [['kurzen_orders', 0.4]], aggro: 'No one leaves the jungle!' },
    kurzen_medicine_man: { name: 'Kurzen Medicine Man', lvl: [32, 33], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['jungle_remedy', 0.5]], aggro: 'The jungle takes you too!' },
    venture_mechanic: { name: 'Venture Co. Mechanic', lvl: [32, 33], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['venture_ledger', 0.4]], aggro: 'Hands off the equipment!' },
    venture_enforcer: { name: 'Venture Co. Enforcer', lvl: [33, 34], family: 'humanoid', hpMult: 1.15, drops: [['thieves_coin', 0.55], ['linen_cloth', 0.3]], qdrops: [['venture_ledger', 0.3]], aggro: 'You owe the company. Pay up!' },
    shadowmaw_panther: { name: 'Shadowmaw Panther', lvl: [33, 34], family: 'beast', drops: [['ruined_pelt', 0.4]], qdrops: [['panther_pelt', 0.55]] },
    jungle_stalker: { name: 'Jungle Stalker', lvl: [34, 35], family: 'beast', hpMult: 1.1, drops: [['ruined_pelt', 0.4]], qdrops: [['jungle_stalker_hide', 0.55]] },
    skullsplitter_warrior: { name: 'Skullsplitter Warrior', lvl: [34, 35], family: 'humanoid', hpMult: 1.15, drops: [['troll_tusk', 0.45], ['linen_cloth', 0.3]], qdrops: [['skullsplitter_tusk', 0.55]], aggro: 'Skullsplitter split your skull!' },
    skullsplitter_witch_doctor: { name: 'Skullsplitter Witch Doctor', lvl: [34, 35], family: 'humanoid', drops: [['troll_tusk', 0.4], ['linen_cloth', 0.35]], qdrops: [['troll_charm', 0.45], ['skullsplitter_tusk', 0.3]], aggro: 'Da loa curse you!' },
    colonel_kurzen: { name: 'Colonel Kurzen', lvl: [33, 33], family: 'humanoid', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['kurzen_sabre', 0.35], ['thieves_coin', 1]], qdrops: [['kurzen_head', 1]], aggro: 'Stormwind abandoned us. So will you.' },
    sin_dall: { name: "Sin'Dall", lvl: [34, 34], family: 'beast', named: true, hpMult: 2, dmgMult: 1.3, drops: [['sin_dall_cloak', 0.35], ['ruined_pelt', 1]], qdrops: [['sin_dall_pelt', 1]] },
    king_bangalash: { name: 'King Bangalash', lvl: [35, 35], family: 'beast', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'hogger', specialText: 'King Bangalash pounces!', drops: [['ruined_pelt', 1]], qdrops: [['bangalash_pelt', 1]], loot: ['bangalash_hide', 'bangalash_fang', 'bangalash_mantle'] },
  });

  // places
  Object.assign(D.PLACES, {
    rebel_camp: { name: 'Rebel Camp', zone: 'Stranglethorn Vale', region: 'stranglethorn', faction: 'alliance', scene: 'rebel_camp', lvl: [30, 35], safe: true, inn: true, mobs: [], pool: 0, npcs: ['barnil', 'lieutenant_doren', 'sergeant_yohwa', 'corporal_bluth'], vendor: 'corporal_bluth',
      links: { nesingwary_camp: 16, kurzen_compound: 16, the_rotting_orchard: 25 }, via: { the_rotting_orchard: 'Road north to Duskwood' } },
    grom_gol: { name: "Grom'gol Base Camp", zone: 'Stranglethorn Vale', region: 'stranglethorn', faction: 'horde', scene: 'grom_gol', lvl: [30, 35], safe: true, inn: true, mobs: [], pool: 0, npcs: ['nimboya', 'commander_aggro', 'kin_weelay', 'innkeeper_thulbek', 'uthok'], vendor: 'innkeeper_thulbek', gearVendor: 'uthok',
      links: { nesingwary_camp: 22, zuuldaia_ruins: 16, balia_mah_ruins: 18, orgrimmar: 50 }, via: { orgrimmar: 'Zeppelin' } },
    nesingwary_camp: { name: "Nesingwary's Expedition", zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'nesingwary_camp', lvl: [30, 35], safe: true, mobs: [], pool: 0, npcs: ['nesingwary', 'ajeck', 'erlgadin'],
      links: { rebel_camp: 16, grom_gol: 22, lake_nazferiti: 16, zuuldaia_ruins: 18 } },
    lake_nazferiti: { name: 'Lake Nazferiti', zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'lake_nazferiti', lvl: [30, 32], mobs: [['stranglethorn_raptor', 5], ['stranglethorn_tiger', 4]], pool: 10, npcs: [], links: { nesingwary_camp: 16, venture_base_camp: 16, kurzen_compound: 18 } },
    zuuldaia_ruins: { name: "Ruins of Zul'Daia", zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'zuuldaia_ruins', lvl: [30, 32], mobs: [['bloodscalp_warrior', 5], ['bloodscalp_axe_thrower', 4]], pool: 10, npcs: [], links: { nesingwary_camp: 18, grom_gol: 16 } },
    kurzen_compound: { name: 'Kurzen Compound', zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'kurzen_compound', lvl: [31, 33], mobs: [['kurzen_commando', 5], ['kurzen_medicine_man', 4]], named: { colonel_kurzen: 240 }, pool: 10, npcs: [], links: { rebel_camp: 16, lake_nazferiti: 18 } },
    venture_base_camp: { name: 'Venture Co. Base Camp', zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'venture_base_camp', lvl: [32, 34], mobs: [['venture_mechanic', 5], ['venture_enforcer', 4]], pool: 10, npcs: [], links: { lake_nazferiti: 16, zul_kunda: 18 } },
    balia_mah_ruins: { name: "Ruins of Balia'mah", zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'balia_mah_ruins', lvl: [33, 35], mobs: [['shadowmaw_panther', 5], ['jungle_stalker', 4]], named: { sin_dall: 300, king_bangalash: 150 }, pool: 10, npcs: [], links: { grom_gol: 18, zul_kunda: 18 } },
    zul_kunda: { name: "Ruins of Zul'Kunda", zone: 'Stranglethorn Vale', region: 'stranglethorn', scene: 'zul_kunda', lvl: [34, 35], mobs: [['skullsplitter_warrior', 5], ['skullsplitter_witch_doctor', 4]], pool: 10, npcs: [], links: { venture_base_camp: 18, balia_mah_ruins: 18 } },
  });
  D.PLACES.the_rotting_orchard.links.rebel_camp = 25; D.PLACES.the_rotting_orchard.via = Object.assign(D.PLACES.the_rotting_orchard.via || {}, { rebel_camp: 'Road south to Stranglethorn' });
  D.PLACES.orgrimmar.links.grom_gol = 50; D.PLACES.orgrimmar.via = Object.assign(D.PLACES.orgrimmar.via || {}, { grom_gol: 'Zeppelin' });

  // people
  Object.assign(D.NPCS, {
    barnil: { name: 'Barnil Stonepot', title: 'Rebel Camp' },
    lieutenant_doren: { name: 'Lieutenant Doren', title: 'Stormwind Rebels' },
    sergeant_yohwa: { name: 'Sergeant Yohwa', title: 'Rebel Camp' },
    corporal_bluth: { name: 'Corporal Bluth', title: 'Camp Trader' },
    nimboya: { name: 'Nimboya', title: "Grom'gol" },
    commander_aggro: { name: "Commander Aggro'gosh", title: "Grom'gol" },
    kin_weelay: { name: "Kin'weelay", title: 'Darkspear Witch Doctor' },
    innkeeper_thulbek: { name: 'Innkeeper Thulbek', title: 'Innkeeper' },
    uthok: { name: 'Uthok', title: 'Weaponsmith' },
    nesingwary: { name: 'Hemet Nesingwary', title: 'Big Game Hunter' },
    ajeck: { name: 'Ajeck Rouack', title: 'Nesingwary Expedition' },
    erlgadin: { name: 'Sir S. J. Erlgadin', title: 'Nesingwary Expedition' },
  });

  // quests. Nesingwary's hunts are open to everyone; the rest are per faction.
  const A = (id, q) => { q.faction = 'alliance'; D.QUESTS[id] = q; };
  const H = (id, q) => { q.faction = 'horde'; D.QUESTS[id] = q; };
  A('duskwood_stranglethorn', { name: 'The Rebels', lvl: 30, giver: 'althea', turnin: 'lieutenant_doren', text: 'Stormwind soldiers who deserted Colonel Kurzen hold a camp in northern Stranglethorn. Take the road south from the Rotting Orchard and find Lieutenant Doren.',
    objs: [{ type: 'visit', place: 'rebel_camp' }], reward: { money: 1000 } });
  H('hillsbrad_stranglethorn', { name: "Grom'gol", lvl: 30, giver: 'darthalia', turnin: 'commander_aggro', text: "The Horde holds a base camp on the coast of Stranglethorn. Take the zeppelin from Orgrimmar and report to Commander Aggro'gosh.",
    objs: [{ type: 'visit', place: 'grom_gol' }], reward: { money: 1000 } });
  Object.assign(D.QUESTS, {
    tiger_mastery: { name: 'Tiger Mastery', lvl: 31, giver: 'ajeck', turnin: 'ajeck', text: 'Nesingwary wants proof you can hunt. Bring me 8 tiger fangs.',
      objs: [{ type: 'collect', item: 'tiger_fang', n: 8 }], reward: { choice: ['fam_feet31'] } },
    raptor_mastery: { name: 'Raptor Mastery', lvl: 30, giver: 'erlgadin', turnin: 'erlgadin', text: 'The raptors by Lake Nazferiti are clever hunters. Kill 12.',
      objs: [{ type: 'kill', mob: 'stranglethorn_raptor', n: 12 }], reward: { money: 1800 } },
    raptor_talons: { name: 'Talons for the Wall', lvl: 31, giver: 'erlgadin', turnin: 'erlgadin', pre: ['raptor_mastery'], text: 'Bring me 8 talons for the trophy wall.',
      objs: [{ type: 'collect', item: 'raptor_talon', n: 8 }], reward: { choice: ['fam_wrist32'] } },
    stv_tiger_hunt: { name: 'The Tiger Hunt', lvl: 32, giver: 'ajeck', turnin: 'ajeck', pre: ['tiger_mastery'], text: 'Now kill 12 tigers, clean.',
      objs: [{ type: 'kill', mob: 'stranglethorn_tiger', n: 12 }], reward: { money: 2000 } },
    panther_mastery: { name: 'Panther Mastery', lvl: 33, giver: 'nesingwary', turnin: 'nesingwary', text: 'The Shadowmaw panthers of Balia\'mah are the finest game in the jungle. Bring me 8 pelts.',
      objs: [{ type: 'collect', item: 'panther_pelt', n: 8 }], reward: { choice: ['fam_back33'] } },
    stalker_mastery: { name: 'Stalker Mastery', lvl: 34, giver: 'erlgadin', turnin: 'erlgadin', pre: ['raptor_talons'], text: 'The jungle stalkers are the kings of the raptors. Kill 10 and bring me 5 hides.',
      objs: [{ type: 'kill', mob: 'jungle_stalker', n: 10 }, { type: 'collect', item: 'jungle_stalker_hide', n: 5 }], reward: { choice: ['fam_legs33'] } },
    sin_dall_q: { name: "Sin'Dall", lvl: 34, giver: 'nesingwary', turnin: 'nesingwary', text: "A great pale tiger called Sin'Dall prowls Balia'mah. It is rarely seen. Bring me its pelt and your name goes in my book.",
      objs: [{ type: 'collect', item: 'sin_dall_pelt', n: 1 }], reward: { choice: ['fam_ring_rare35'] } },
    wanted_bangalash: { name: 'Big Game Hunter', lvl: 35, giver: 'nesingwary', turnin: 'nesingwary', pre: ['panther_mastery'], group: 3, text: 'The king of the jungle is a white tiger called King Bangalash. I want his pelt. Bring friends; he has killed better hunters than you.',
      objs: [{ type: 'collect', item: 'bangalash_pelt', n: 1 }], reward: { choice: ['fam_weapon35'] } },
  });
  Object.assign(D.QUESTS, {
    panther_hunt: { name: 'Panther Hunt', lvl: 34, giver: 'nesingwary', turnin: 'nesingwary', pre: ['panther_mastery'], text: 'Now the hunt proper: kill 12 Shadowmaw panthers.',
      objs: [{ type: 'kill', mob: 'shadowmaw_panther', n: 12 }], reward: { money: 2400 } },
    lake_patrol: { name: 'The Lake Shore', lvl: 32, giver: 'erlgadin', turnin: 'erlgadin', pre: ['raptor_talons'], text: 'Clear the shore for the expedition boats: 8 raptors and 8 tigers.',
      objs: [{ type: 'kill', mob: 'stranglethorn_raptor', n: 8 }, { type: 'kill', mob: 'stranglethorn_tiger', n: 8 }], reward: { choice: ['fam_feet31'] } },
    stalker_hunt: { name: 'The Last Stalkers', lvl: 35, giver: 'ajeck', turnin: 'ajeck', pre: ['stalker_mastery'], text: 'A few old stalkers are left. Kill 10 more.',
      objs: [{ type: 'kill', mob: 'jungle_stalker', n: 10 }], reward: { money: 2600 } },
  });
  // Alliance: the Kurzen deserters and the Venture Co.
  A('kurzen_commandos', { name: 'Kurzen Commandos', lvl: 31, giver: 'lieutenant_doren', turnin: 'lieutenant_doren', text: 'Colonel Kurzen went mad and turned our old unit against us. Kill 12 commandos.',
    objs: [{ type: 'kill', mob: 'kurzen_commando', n: 12 }], reward: { choice: ['fam_weapon32'] } });
  A('kurzen_orders_q', { name: 'The Colonel\'s Orders', lvl: 32, giver: 'sergeant_yohwa', turnin: 'sergeant_yohwa', pre: ['kurzen_commandos'], text: 'Bring me 4 of their battle orders. We need to know where he strikes next.',
    objs: [{ type: 'collect', item: 'kurzen_orders', n: 4 }], reward: { money: 2000 } });
  A('medicine_men', { name: 'Jungle Remedies', lvl: 32, giver: 'barnil', turnin: 'barnil', text: 'Our wounded need medicine. The Kurzen medicine men carry remedies. Kill 8 and bring me 5.',
    objs: [{ type: 'kill', mob: 'kurzen_medicine_man', n: 8 }, { type: 'collect', item: 'jungle_remedy', n: 5 }], reward: { choice: ['fam_chest33'] } });
  A('colonel_kurzen_q', { name: 'Colonel Kurzen', lvl: 33, giver: 'lieutenant_doren', turnin: 'lieutenant_doren', pre: ['kurzen_orders_q'], text: 'End it. Colonel Kurzen hides in the compound. Bring me his head.',
    objs: [{ type: 'collect', item: 'kurzen_head', n: 1 }], reward: { choice: ['fam_back_rare35'] } });
  A('venture_a', { name: 'The Venture Co.', lvl: 33, giver: 'sergeant_yohwa', turnin: 'sergeant_yohwa', text: 'The goblins sell the Kurzen their guns. Kill 10 mechanics and 6 enforcers.',
    objs: [{ type: 'kill', mob: 'venture_mechanic', n: 10 }, { type: 'kill', mob: 'venture_enforcer', n: 6 }], reward: { choice: ['fam_hands34'] } });
  A('venture_ledgers_a', { name: 'Follow the Money', lvl: 33, giver: 'barnil', turnin: 'barnil', text: 'Their ledgers will show who pays for the guns. Bring me 5.',
    objs: [{ type: 'collect', item: 'venture_ledger', n: 5 }], reward: { money: 2200 } });
  A('bloodscalp_a', { name: 'The Bloodscalp', lvl: 31, giver: 'sergeant_yohwa', turnin: 'sergeant_yohwa', text: 'Bloodscalp trolls raid our patrols from Zul\'Daia. Kill 12 warriors.',
    objs: [{ type: 'kill', mob: 'bloodscalp_warrior', n: 12 }], reward: { money: 1900 } });
  A('skullsplitter_a', { name: 'The Skullsplitters', lvl: 34, giver: 'lieutenant_doren', turnin: 'lieutenant_doren', text: 'The Skullsplitter trolls hold Zul\'Kunda. Kill 10 warriors and 6 witch doctors.',
    objs: [{ type: 'kill', mob: 'skullsplitter_warrior', n: 10 }, { type: 'kill', mob: 'skullsplitter_witch_doctor', n: 6 }], reward: { choice: ['fam_waist34'] } });
  A('skullsplitter_tusks_a', { name: 'Tusks of Zul\'Kunda', lvl: 35, giver: 'barnil', turnin: 'barnil', pre: ['skullsplitter_a'], text: 'Bring me 10 Skullsplitter tusks. Stormwind pays a bounty.',
    objs: [{ type: 'collect', item: 'skullsplitter_tusk', n: 10 }], reward: { choice: ['fam_weapon35'] } });
  A('bloodscalp_charms_a', { name: 'Troll Charms', lvl: 32, giver: 'barnil', turnin: 'barnil', pre: ['bloodscalp_a'], text: 'Their axe throwers carry charms that curse our wounded. Kill 8 and bring me 5 charms.',
    objs: [{ type: 'kill', mob: 'bloodscalp_axe_thrower', n: 8 }, { type: 'collect', item: 'troll_charm', n: 5 }], reward: { choice: ['fam_wrist32'] } });
  A('kurzen_patrol', { name: 'Hold the Line', lvl: 33, giver: 'sergeant_yohwa', turnin: 'sergeant_yohwa', pre: ['medicine_men'], text: 'Keep the Kurzen off our camp: 8 commandos and 6 medicine men.',
    objs: [{ type: 'kill', mob: 'kurzen_commando', n: 8 }, { type: 'kill', mob: 'kurzen_medicine_man', n: 6 }], reward: { money: 2200 } });
  A('venture_patrol_a', { name: 'Shut Down the Camp', lvl: 34, giver: 'lieutenant_doren', turnin: 'lieutenant_doren', pre: ['venture_a'], text: 'The goblins are back at work. Kill 10 enforcers.',
    objs: [{ type: 'kill', mob: 'venture_enforcer', n: 10 }], reward: { choice: ['fam_legs33'] } });
  // Horde: the jungle trolls, the Venture Co. and the Kurzen
  H('bloodscalp_h', { name: 'The Bloodscalp', lvl: 30, giver: 'nimboya', turnin: 'nimboya', text: 'Da Bloodscalp be enemies of da Darkspear. Kill 12 warriors, mon.',
    objs: [{ type: 'kill', mob: 'bloodscalp_warrior', n: 12 }], reward: { choice: ['fam_weapon32'] } });
  H('bloodscalp_tusks', { name: 'Bloodscalp Tusks', lvl: 31, giver: 'nimboya', turnin: 'nimboya', pre: ['bloodscalp_h'], text: 'Bring me 10 tusks. Da Darkspear want proof.',
    objs: [{ type: 'collect', item: 'bloodscalp_tusk', n: 10 }], reward: { money: 1900 } });
  H('voodoo_charms', { name: 'Voodoo Charms', lvl: 32, giver: 'kin_weelay', turnin: 'kin_weelay', text: 'Da axe throwers carry charms. Kill 8 of dem and bring me 5 charms. I make good voodoo with dem.',
    objs: [{ type: 'kill', mob: 'bloodscalp_axe_thrower', n: 8 }, { type: 'collect', item: 'troll_charm', n: 5 }], reward: { choice: ['fam_chest33'] } });
  H('kurzen_h', { name: 'The Kurzen', lvl: 32, giver: 'commander_aggro', turnin: 'commander_aggro', text: 'Human deserters raid our scouts. Kill 12 Kurzen commandos.',
    objs: [{ type: 'kill', mob: 'kurzen_commando', n: 12 }], reward: { money: 2000 } });
  H('venture_h', { name: 'The Venture Co.', lvl: 33, giver: 'commander_aggro', turnin: 'commander_aggro', text: 'The goblins mine our jungle and pay nobody. Kill 10 mechanics and 6 enforcers.',
    objs: [{ type: 'kill', mob: 'venture_mechanic', n: 10 }, { type: 'kill', mob: 'venture_enforcer', n: 6 }], reward: { choice: ['fam_hands34'] } });
  H('venture_ledgers_h', { name: 'Goblin Ledgers', lvl: 33, giver: 'uthok', turnin: 'uthok', text: 'Their ledgers say where the ore goes. Bring me 5.',
    objs: [{ type: 'collect', item: 'venture_ledger', n: 5 }], reward: { money: 2200 } });
  H('skullsplitter_h', { name: 'The Skullsplitters', lvl: 34, giver: 'nimboya', turnin: 'nimboya', text: 'Da Skullsplitter tribe be worst of all. Kill 10 warriors and 6 witch doctors at Zul\'Kunda.',
    objs: [{ type: 'kill', mob: 'skullsplitter_warrior', n: 10 }, { type: 'kill', mob: 'skullsplitter_witch_doctor', n: 6 }], reward: { choice: ['fam_waist34'] } });
  H('skullsplitter_tusks_h', { name: 'Skullsplitter Tusks', lvl: 35, giver: 'kin_weelay', turnin: 'kin_weelay', pre: ['skullsplitter_h'], text: 'Bring me 10 of dem tusks. Da loa will be pleased.',
    objs: [{ type: 'collect', item: 'skullsplitter_tusk', n: 10 }], reward: { choice: ['fam_weapon35'] } });
  H('kurzen_head_h', { name: 'Colonel Kurzen', lvl: 33, giver: 'commander_aggro', turnin: 'commander_aggro', pre: ['kurzen_h'], text: 'Their colonel hides in the compound. Bring me his head.',
    objs: [{ type: 'collect', item: 'kurzen_head', n: 1 }], reward: { choice: ['fam_back_rare35'] } });

  H('medicine_h', { name: 'Kurzen Medicine', lvl: 32, giver: 'kin_weelay', turnin: 'kin_weelay', pre: ['kurzen_h'], text: 'Da Kurzen medicine men got strong remedies. Kill 8 and bring me 5.',
    objs: [{ type: 'kill', mob: 'kurzen_medicine_man', n: 8 }, { type: 'collect', item: 'jungle_remedy', n: 5 }], reward: { choice: ['fam_wrist32'] } });
  H('troll_patrol', { name: 'Zul\'Daia Patrol', lvl: 32, giver: 'commander_aggro', turnin: 'commander_aggro', pre: ['bloodscalp_tusks'], text: 'Keep the Bloodscalp busy: 8 warriors and 6 axe throwers.',
    objs: [{ type: 'kill', mob: 'bloodscalp_warrior', n: 8 }, { type: 'kill', mob: 'bloodscalp_axe_thrower', n: 6 }], reward: { money: 2200 } });
  H('venture_patrol_h', { name: 'Break the Company', lvl: 34, giver: 'uthok', turnin: 'uthok', pre: ['venture_h'], text: 'The goblins hired more thugs. Kill 10 enforcers.',
    objs: [{ type: 'kill', mob: 'venture_enforcer', n: 10 }], reward: { choice: ['fam_legs33'] } });

  // group finder: the open-world elite
  Object.assign(D.ACTIVITIES, {
    bangalash: { name: 'Wanted: King Bangalash', where: 'balia_mah_ruins', size: 3, minLvl: 32, maxLvl: 35, desc: 'Open-world elite in Stranglethorn. 3 players.', boss: 'king_bangalash', pulls: [{ scene: 'balia_mah_ruins', label: 'Panther dens', mobs: ['shadowmaw_panther', 'shadowmaw_panther'] }, { scene: 'balia_mah_ruins', label: 'Panther dens', mobs: ['jungle_stalker', 'shadowmaw_panther'] }, { scene: 'balia_mah_ruins', label: 'King Bangalash', mobs: ['king_bangalash'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
