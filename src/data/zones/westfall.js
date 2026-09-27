// Westfall and Sentinel Hill (with The Deadmines): Alliance, levels 10–16.
// Everything that lives in this zone: its places, creatures, people, quests and the items they drop.
// Links to other zones sit on the places themselves (place.links / place.via).
(function (root) {
  const D = root.D;
  D.zone('westfall', { name: 'Westfall', faction: 'alliance' });
  // items
  D.item('cruel_barb', { name: 'Cruel Barb', slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [13, 23], speed: 2.4, stats: { str: 5 }, icon: 'sword', sell: 900, look: ['weapon', 'cruel_barb'], source: 'Edwin VanCleef, The Deadmines' });
  D.item('cape_brotherhood', { name: 'Cape of the Brotherhood', slot: 'back', q: 3, lvl: 10, armor: 18, stats: { agi: 4, sta: 2 }, icon: 'cloak', sell: 600, look: ['back', 'cape_brotherhood'], source: 'Edwin VanCleef, The Deadmines' });
  D.item('smites_hammer', { name: "Smite's Mighty Hammer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [14, 24], speed: 2.8, stats: { str: 6, sta: 3 }, icon: 'mace', sell: 1000, look: ['weapon', 'smites_hammer'], source: 'Mr. Smite, The Deadmines' });
  D.item('thiefs_blade', { name: "Thief's Blade", slot: 'weapon', wtype: 'sword', q: 3, lvl: 10, dmg: [10, 18], speed: 1.9, stats: { agi: 5 }, icon: 'sword', sell: 850, look: ['weapon', 'thiefs_blade'], source: 'Mr. Smite, The Deadmines' });
  D.item('cookies_rod', { name: "Cookie's Stirring Rod", slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [15, 23], speed: 3, stats: { int: 6, spi: 4 }, sp: 10, icon: 'staff', sell: 900, look: ['weapon', 'cookies_rod'], source: 'Cookie, The Deadmines' });
  D.item('cookies_tenderizer', { name: "Cookie's Tenderizer", slot: 'weapon', wtype: 'mace', q: 3, lvl: 10, dmg: [11, 20], speed: 2.5, stats: { sta: 3, spi: 3 }, sp: 7, icon: 'mace', sell: 900, look: ['weapon', 'cookies_tenderizer'], source: 'Cookie, The Deadmines' });
  D.item('smelting_pants', { name: 'Smelting Pants', slot: 'legs', atype: 'mail', q: 3, lvl: 10, armor: 110, stats: { str: 4, sta: 4 }, icon: 'legs', sell: 700, look: ['legs', 'smelting_pants'], source: 'Gilnid, The Deadmines' });
  D.item('buzzer_blade', { name: 'Buzzer Blade', slot: 'weapon', wtype: 'dagger', q: 3, lvl: 10, dmg: [8, 15], speed: 1.7, stats: { agi: 3, sta: 2 }, icon: 'dagger', sell: 800, look: ['weapon', 'buzzer_blade'], source: "Sneed's Shredder, The Deadmines" });
  D.item('gold_gloves', { name: 'Gold-flecked Gloves', slot: 'hands', atype: 'cloth', q: 3, lvl: 10, armor: 12, stats: { int: 4, spi: 3 }, sp: 4, icon: 'gloves', sell: 500, source: "Sneed's Shredder, The Deadmines" });
  D.item('lavish_ring', { name: 'Lavishly Jeweled Ring', slot: 'finger', q: 3, lvl: 10, stats: { int: 3, spi: 3, sta: 2 }, icon: 'ring', sell: 700, source: 'Gilnid, The Deadmines' });
  D.item('foreman_belt', { name: "Foreman's Girdle", slot: 'waist', atype: 'mail', q: 3, lvl: 10, armor: 60, stats: { sta: 5 }, icon: 'belt', sell: 500, source: "Rhahk'Zor, The Deadmines" });
  D.item('emberstone_staff', { name: 'Emberstone Staff', slot: 'weapon', wtype: 'staff', q: 3, lvl: 10, dmg: [17, 26], speed: 3.1, stats: { int: 5, sta: 3 }, sp: 12, icon: 'staff', sell: 1000, look: ['weapon', 'emberstone_staff'], source: 'Mr. Smite, The Deadmines' });
  D.item('corsair_shirt', { name: "Corsair's Overshirt", slot: 'chest', atype: 'cloth', q: 3, lvl: 10, armor: 28, stats: { int: 5, spi: 4 }, sp: 5, icon: 'chest_cloth', sell: 700, look: ['chest', 'corsair_shirt'], source: 'Cookie, The Deadmines' });
  D.item('miners_bracers', { name: "Miner's Revenge Bracers", slot: 'wrist', atype: 'mail', q: 3, lvl: 10, armor: 50, stats: { str: 3, sta: 3 }, icon: 'bracers', sell: 500, source: "Rhahk'Zor, The Deadmines" });
  D.item('handful_oats', { name: 'Handful of Oats', slot: 'quest', q: 1, icon: 'seed' });
  D.item('goretusk_liver', { name: 'Goretusk Liver', slot: 'quest', q: 1, icon: 'meat' });
  D.item('vulture_meat', { name: 'Stringy Vulture Meat', slot: 'quest', q: 1, icon: 'meat' });
  D.item('goretusk_snout', { name: 'Goretusk Snout', slot: 'quest', q: 1, icon: 'meat' });
  D.item('defias_bandana_wf', { name: 'Red Leather Bandana', slot: 'quest', q: 1, icon: 'bandana' });
  D.item('fleshripper_talon', { name: 'Fleshripper Talon', slot: 'quest', q: 1, icon: 'claw' });
  D.item('foe_reaper_core', { name: 'Foe Reaper Power Core', slot: 'quest', q: 1, icon: 'coin' });
  D.item('defias_orders', { name: 'Defias Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('reaper_scythe', { name: "Foe Reaper's Scythe", slot: 'weapon', wtype: 'staff', q: 3, lvl: 15, dmg: [26, 39], speed: 3.2, stats: { str: 6, sta: 4 }, icon: 'staff', sell: 1400, source: 'Foe Reaper 4000, Molsen Farm' });
  D.item('riverpaw_paw', { name: 'Riverpaw Paw', slot: 'quest', q: 1, icon: 'claw' });
  D.item('swirling_sand', { name: 'Swirling Sand', slot: 'quest', q: 1, icon: 'dust' });
  D.item('tidehunter_scale', { name: 'Tidehunter Scale', slot: 'quest', q: 1, icon: 'fin' });

  // creatures
  Object.assign(D.MOBS, {
    defias_miner: { name: 'Defias Miner', lvl: [10, 11], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.4]] },
    defias_pirate: { name: 'Defias Pirate', lvl: [11, 11], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.4]] },
    goblin_engineer: { name: 'Goblin Engineer', lvl: [10, 11], family: 'humanoid', drops: [['thieves_coin', 0.5]] },
    rhahkzor: { name: "Rhahk'Zor", lvl: [11, 11], family: 'giant', boss: true, special: 'slam', aggro: 'VanCleef pay big for your heads!', loot: ['foreman_belt', 'miners_bracers', 'defias_belt'] },
    sneed_shredder: { name: "Sneed's Shredder", lvl: [11, 11], family: 'mechanical', boss: true, special: 'whirl', loot: ['buzzer_blade', 'gold_gloves', 'defias_boots'] },
    gilnid: { name: 'Gilnid', lvl: [11, 11], family: 'humanoid', boss: true, special: 'molten', aggro: 'Anyone want to take a break? Well too bad! Get to work you oafs!', loot: ['smelting_pants', 'lavish_ring', 'defias_leggings'] },
    mr_smite: { name: 'Mr. Smite', lvl: [12, 12], family: 'humanoid', boss: true, special: 'smite', aggro: "We're under attack! Avast, ye swabs! Repel the invaders!", loot: ['smites_hammer', 'thiefs_blade', 'emberstone_staff'] },
    cookie: { name: 'Cookie', lvl: [12, 12], family: 'murloc', boss: true, special: 'cook', aggro: 'Mrrglrrgl... blub!', loot: ['cookies_rod', 'cookies_tenderizer', 'corsair_shirt'] },
    vancleef: { name: 'Edwin VanCleef', lvl: [12, 12], family: 'humanoid', boss: true, special: 'vancleef', aggro: 'None may challenge the Brotherhood!', loot: ['cruel_barb', 'cape_brotherhood', 'defias_armor'], qdrops: [['vancleef_head', 1]] },
    blackguard: { name: 'Blackguard', lvl: [11, 11], family: 'humanoid', sprite: 'defias_pirate', drops: [] },
    young_goretusk: { name: 'Young Goretusk', lvl: [10, 11], family: 'beast', drops: [['boar_tusk', 0.4], ['ruined_pelt', 0.3]], qdrops: [['goretusk_liver', 0.55]] },
    goretusk: { name: 'Goretusk', lvl: [12, 13], family: 'beast', hpMult: 1.1, drops: [['boar_tusk', 0.45], ['ruined_pelt', 0.35]], qdrops: [['goretusk_liver', 0.55], ['goretusk_snout', 0.55]] },
    fleshripper: { name: 'Fleshripper', lvl: [10, 11], family: 'beast', drops: [['wolf_fang', 0.3]], qdrops: [['vulture_meat', 0.6], ['fleshripper_talon', 0.5]] },
    harvest_watcher: { name: 'Harvest Watcher', lvl: [11, 12], family: 'mechanical', hpMult: 1.1, drops: [['linen_cloth', 0.2]], qdrops: [['handful_oats', 0.6]], aggro: 'Intruder detected.' },
    defias_trapper: { name: 'Defias Trapper', lvl: [11, 12], family: 'humanoid', drops: [['thieves_coin', 0.4], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45]], aggro: 'The Brotherhood sees all.' },
    defias_smuggler: { name: 'Defias Smuggler', lvl: [12, 13], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45]], aggro: 'Nobody takes our goods!' },
    defias_pathstalker: { name: 'Defias Pathstalker', lvl: [13, 14], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['defias_bandana_wf', 0.45], ['defias_orders', 0.2]], aggro: 'For VanCleef!' },
    murloc_coastrunner: { name: 'Murloc Coastrunner', lvl: [11, 12], family: 'murloc', drops: [['murloc_eye', 0.45]], aggro: 'Mrrglglgl!' },
    murloc_tidehunter: { name: 'Murloc Tidehunter', lvl: [13, 14], family: 'murloc', hpMult: 1.1, drops: [['murloc_eye', 0.5]], aggro: 'Aaaaughibbrgubugbugrguburgle!', qdrops: [['tidehunter_scale', 0.55]] },
    foe_reaper: { name: 'Foe Reaper 4000', lvl: [15, 15], family: 'mechanical', named: true, hpMult: 2.2, dmgMult: 1.35, drops: [['reaper_scythe', 0.35]], qdrops: [['foe_reaper_core', 1]], aggro: 'Harvest protocol engaged.' },
    riverpaw_brute: { name: 'Riverpaw Brute', lvl: [14, 15], family: 'humanoid', hpMult: 1.15, drops: [['gnoll_mane', 0.45], ['linen_cloth', 0.35]], qdrops: [['riverpaw_paw', 0.55]], aggro: 'Grrr... fresh meat!' },
    dust_devil: { name: 'Dust Devil', lvl: [14, 15], family: 'elemental', drops: [['linen_cloth', 0.1]], qdrops: [['swirling_sand', 0.6]] },
  });

  // places
  Object.assign(D.PLACES, {
    furlbrow_farm: { name: "Furlbrow's Pumpkin Farm", zone: 'Westfall', region: 'westfall', scene: 'furlbrow_farm', lvl: [10, 11], mobs: [['young_goretusk', 5], ['fleshripper', 4]], pool: 9, npcs: ['furlbrow', 'verna'], links: { goldshire: 30, saldean_farm: 14, sentinel_hill: 20 } },
    saldean_farm: { name: "Saldean's Farm", zone: 'Westfall', region: 'westfall', scene: 'saldean_farm', lvl: [10, 12], mobs: [['harvest_watcher', 5], ['young_goretusk', 3], ['defias_trapper', 3]], pool: 10, npcs: ['saldean', 'salma'], links: { furlbrow_farm: 14, sentinel_hill: 16 } },
    sentinel_hill: { name: 'Sentinel Hill', zone: 'Westfall', region: 'westfall', scene: 'sentinel_hill', lvl: [10, 15], safe: true, inn: true, mobs: [], pool: 0, npcs: ['gryan', 'danuvin', 'galiaan', 'heather', 'lewis'], vendor: 'heather', gearVendor: 'lewis', links: { gold_coast_quarry: 18, moonbrook: 20, the_dead_acre: 22, furlbrow_farm: 20, saldean_farm: 16, jangolode_mine: 16, molsen_farm: 18, the_longshore: 18, dagger_hills: 20 } },
    jangolode_mine: { name: 'Jangolode Mine', zone: 'Westfall', region: 'westfall', scene: 'jangolode_mine', lvl: [11, 13], mobs: [['defias_smuggler', 5], ['defias_trapper', 4]], pool: 10, npcs: [], links: { sentinel_hill: 16 } },
    molsen_farm: { name: 'Molsen Farm', zone: 'Westfall', region: 'westfall', scene: 'molsen_farm', lvl: [12, 14], mobs: [['harvest_watcher', 3], ['goretusk', 4], ['defias_pathstalker', 4]], named: { foe_reaper: 300 }, pool: 10, npcs: [], links: { sentinel_hill: 18 } },
    the_longshore: { name: 'The Longshore', zone: 'Westfall', region: 'westfall', scene: 'the_longshore', lvl: [11, 15], mobs: [['murloc_coastrunner', 5], ['murloc_tidehunter', 4], ['fleshripper', 2]], pool: 10, npcs: [], links: { gold_coast_quarry: 16, sentinel_hill: 18, dagger_hills: 16 } },
    dagger_hills: { name: 'The Dagger Hills', zone: 'Westfall', region: 'westfall', scene: 'dagger_hills', lvl: [14, 16], mobs: [['riverpaw_brute', 5], ['dust_devil', 4]], pool: 10, npcs: [], links: { moonbrook: 16, sentinel_hill: 20, the_longshore: 16 } },
  });

  // people
  Object.assign(D.NPCS, {
    gryan: { name: 'Gryan Stoutmantle', title: "The People's Militia" },
    danuvin: { name: 'Captain Danuvin', title: 'Sentinel Hill' },
    galiaan: { name: 'Scout Galiaan', title: 'Scout' },
    heather: { name: 'Innkeeper Heather', title: 'Innkeeper' },
    lewis: { name: 'Quartermaster Lewis', title: 'Weaponsmith' },
    furlbrow: { name: 'Farmer Furlbrow', title: 'Farmer' },
    verna: { name: 'Verna Furlbrow', title: 'Farmer' },
    saldean: { name: 'Farmer Saldean', title: 'Farmer' },
    salma: { name: 'Salma Saldean', title: 'Cook' },
  });

  // quests
  Object.assign(D.QUESTS, {
    poor_blanchy: { name: 'Poor Old Blanchy', lvl: 10, giver: 'verna', turnin: 'verna', text: 'Our old horse Blanchy is starving. The harvest watchers guard what oats are left in the fields. Bring me 8 handfuls.',
      objs: [{ type: 'collect', item: 'handful_oats', n: 8 }], reward: { money: 250 } },
    westfall_stew: { name: 'Westfall Stew', lvl: 10, giver: 'furlbrow', turnin: 'furlbrow', text: 'We lost everything but our stew pot. Fleshripper meat is stringy, but it fills a belly. Bring me 6.',
      objs: [{ type: 'collect', item: 'vulture_meat', n: 6 }], reward: { choice: ['fam_feet12'] } },
    goretusk_pie: { name: 'Goretusk Liver Pie', lvl: 10, giver: 'salma', turnin: 'salma', text: 'My liver pie keeps the militia on its feet. I need 8 goretusk livers.',
      objs: [{ type: 'collect', item: 'goretusk_liver', n: 8 }], reward: { money: 260 } },
    harvest_watchers: { name: 'The Harvest Watchers', lvl: 11, giver: 'saldean', turnin: 'saldean', text: 'The Defias built those harvest watchers to guard our own fields against us. Smash 8.',
      objs: [{ type: 'kill', mob: 'harvest_watcher', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    peoples_militia: { name: "The People's Militia", lvl: 11, giver: 'gryan', turnin: 'gryan', pre: ['report_gryan'], text: 'Defias trappers watch the roads for travellers to rob. Show them the militia still stands: 10 trappers.',
      objs: [{ type: 'kill', mob: 'defias_trapper', n: 10 }], reward: { choice: ['fam_chest13'] } },
    fleshripper_talons: { name: 'Fleshripper Talons', lvl: 11, giver: 'lewis', turnin: 'lewis', text: 'Fleshripper talons make good arrowheads. Bring me 6 and I will find you a better weapon.',
      objs: [{ type: 'collect', item: 'fleshripper_talon', n: 6 }], reward: { choice: ['fam_weapon12'] } },
    jangolode: { name: 'The Jangolode Mine', lvl: 12, giver: 'danuvin', turnin: 'danuvin', text: 'The Defias smuggle stolen ore out of the Jangolode Mine. Kill 10 smugglers.',
      objs: [{ type: 'kill', mob: 'defias_smuggler', n: 10 }], reward: { choice: ['fam_legs13'] } },
    red_bandanas: { name: 'Red Leather Bandanas', lvl: 12, giver: 'danuvin', turnin: 'danuvin', text: 'Every Defias wears a red bandana. My scouts need disguises. Bring me 12.',
      objs: [{ type: 'collect', item: 'defias_bandana_wf', n: 12 }], reward: { money: 380 } },
    coast_murlocs: { name: "The Coast Isn't Clear", lvl: 12, giver: 'galiaan', turnin: 'galiaan', text: 'Murlocs from the Longshore raid the farms at night. Kill 10 coastrunners.',
      objs: [{ type: 'kill', mob: 'murloc_coastrunner', n: 10 }], reward: { choice: ['fam_hands14'] } },
    goretusk_snouts: { name: 'Goretusk Snouts', lvl: 13, giver: 'heather', turnin: 'heather', text: "Snout soup is the militia's favourite. The big goretusks on Molsen Farm have the best. Bring me 8.",
      objs: [{ type: 'collect', item: 'goretusk_snout', n: 8 }], reward: { money: 400 } },
    peoples_militia2: { name: "The People's Militia (2)", lvl: 13, giver: 'gryan', turnin: 'gryan', pre: ['peoples_militia'], text: "The pathstalkers are the Brotherhood's eyes. Blind them: 10 pathstalkers on Molsen Farm.",
      objs: [{ type: 'kill', mob: 'defias_pathstalker', n: 10 }], reward: { choice: ['fam_back14'] } },
    molsen_watchers: { name: 'Clearing Molsen Farm', lvl: 13, giver: 'saldean', turnin: 'saldean', pre: ['harvest_watchers'], text: 'More watchers walk the Molsen fields, and bigger goretusks follow them. Kill 8 goretusks there.',
      objs: [{ type: 'kill', mob: 'goretusk', n: 8 }], reward: { choice: ['fam_waist14'] } },
    tidehunters: { name: 'Tidehunters', lvl: 14, giver: 'galiaan', turnin: 'galiaan', pre: ['coast_murlocs'], text: 'The tidehunters lead the murloc raids. Kill 8 and the rest will scatter.',
      objs: [{ type: 'kill', mob: 'murloc_tidehunter', n: 8 }], reward: { choice: ['fam_legs13'] } },
    defias_orders: { name: 'The Defias Orders', lvl: 14, giver: 'gryan', turnin: 'gryan', pre: ['peoples_militia2'], text: 'The pathstalkers carry written orders from their master. Bring me one and we will learn where the Brotherhood hides.',
      objs: [{ type: 'collect', item: 'defias_orders', n: 1 }], reward: { choice: ['fam_weapon15'] } },
    foe_reaper_q: { name: 'The Foe Reaper', lvl: 15, giver: 'gryan', turnin: 'gryan', text: 'A monstrous harvest golem, the Foe Reaper 4000, stalks Molsen Farm. It is rarely seen. Destroy it and bring me its power core.',
      objs: [{ type: 'collect', item: 'foe_reaper_core', n: 1 }], reward: { choice: ['fam_ring_rare'] } },
    hills_scout: { name: 'The Dagger Hills', lvl: 13, giver: 'galiaan', turnin: 'galiaan', text: 'Gnolls gather in the Dagger Hills to the south. Scout the hills and come back alive.',
      objs: [{ type: 'visit', place: 'dagger_hills' }], reward: { money: 350 } },
    riverpaw_brutes: { name: 'The Riverpaw Brutes', lvl: 14, giver: 'danuvin', turnin: 'danuvin', text: 'Riverpaw brutes raid the southern farms. Kill 10 in the Dagger Hills.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 10 }], reward: { choice: ['fam_chest13'] } },
    dust_devils: { name: 'Dust Devils', lvl: 14, giver: 'saldean', turnin: 'saldean', text: 'Dust devils rip up what crops we have left. Break 6 of them apart.',
      objs: [{ type: 'kill', mob: 'dust_devil', n: 6 }], reward: { money: 420 } },
    tidehunter_scales: { name: 'Tidehunter Scales', lvl: 14, giver: 'lewis', turnin: 'lewis', text: 'Tidehunter scales make good armour plates. Bring me 8.',
      objs: [{ type: 'collect', item: 'tidehunter_scale', n: 8 }], reward: { choice: ['fam_wrist12'] } },
    swirling_sand: { name: 'Swirling Sand', lvl: 15, giver: 'heather', turnin: 'heather', text: 'The sand inside a dust devil never stops moving. A mage in Stormwind pays well for it. Bring me 6 handfuls.',
      objs: [{ type: 'collect', item: 'swirling_sand', n: 6 }], reward: { money: 480 } },
    gnoll_paws: { name: 'Gnoll Paws', lvl: 15, giver: 'salma', turnin: 'salma', text: 'Proof of every gnoll you kill earns a bounty from the militia. Bring me 8 paws.',
      objs: [{ type: 'collect', item: 'riverpaw_paw', n: 8 }], reward: { choice: ['fam_hands14'] } },
    hills_patrol: { name: 'Patrolling the Hills', lvl: 15, giver: 'gryan', turnin: 'gryan', pre: ['hills_scout'], text: 'Keep the Dagger Hills clear: 6 brutes and 4 dust devils.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 6 }, { type: 'kill', mob: 'dust_devil', n: 4 }], reward: { choice: ['fam_waist14'] } },
    riverpaw_camp: { name: 'The Riverpaw Camp', lvl: 16, giver: 'danuvin', turnin: 'danuvin', pre: ['riverpaw_brutes'], text: 'Their main camp is in the hills. Break it: 12 brutes.',
      objs: [{ type: 'kill', mob: 'riverpaw_brute', n: 12 }], reward: { choice: ['fam_back14'] } },
  });

  // dungeons
  Object.assign(D.DUNGEONS, {
    deadmines: { name: 'The Deadmines', minLvl: 8, size: 5, trashMult: { hp: 2.2, dmg: 1.55 }, bossMult: { hp: 10, dmg: 3.2 }, pulls: [{ scene: 'deadmines_mine', label: 'Mine tunnel', mobs: ['defias_miner', 'defias_miner'] }, { scene: 'deadmines_mine', label: 'Mine tunnel', mobs: ['defias_miner', 'goblin_engineer'] }, { scene: 'deadmines_mine', label: "Rhahk'Zor", mobs: ['rhahkzor'], boss: true }, { scene: 'deadmines_mine', label: 'Lumber mill', mobs: ['goblin_engineer', 'goblin_engineer', 'defias_miner'] }, { scene: 'deadmines_mine', label: "Sneed's Shredder", mobs: ['sneed_shredder'], boss: true }, { scene: 'deadmines_mine', label: 'Foundry', mobs: ['goblin_engineer', 'defias_miner'] }, { scene: 'deadmines_mine', label: 'Gilnid', mobs: ['gilnid'], boss: true }, { scene: 'deadmines_ship', label: 'The cove', mobs: ['defias_pirate', 'defias_pirate'] }, { scene: 'deadmines_ship', label: 'The cove', mobs: ['defias_pirate', 'defias_pirate', 'defias_pirate'] }, { scene: 'deadmines_ship', label: 'Mr. Smite', mobs: ['mr_smite'], boss: true }, { scene: 'deadmines_ship', label: 'Cookie', mobs: ['cookie'], boss: true }, { scene: 'deadmines_ship', label: 'Edwin VanCleef', mobs: ['vancleef'], boss: true }] },
  });

  // group finder
  Object.assign(D.ACTIVITIES, {
    deadmines: { name: 'The Deadmines', dungeon: 'deadmines', size: 5, minLvl: 8, maxLvl: 12, desc: 'Dungeon. 5 players. Scaled for level 10.' },
  });


  // ---- levels 15-20 (v2.1): the Gold Coast Quarry, Moonbrook and the Dead Acre
  D.item('quarry_ore', { name: 'Gold Coast Ore', slot: 'quest', q: 1, icon: 'dust' });
  D.item('defias_ledger', { name: 'Quarry Ledger', slot: 'quest', q: 1, icon: 'journal' });
  D.item('furlbrow_deed', { name: "Furlbrow's Deed", slot: 'quest', q: 1, icon: 'journal' });
  D.item('moonbrook_insignia', { name: 'Moonbrook Insignia', slot: 'quest', q: 1, icon: 'coin' });
  D.item('defias_letter', { name: 'Sealed Defias Letter', slot: 'quest', q: 1, icon: 'journal' });
  D.item('overseer_whip', { name: 'Overseer Whip', slot: 'quest', q: 1, icon: 'belt' });
  D.item('golem_oil', { name: 'Golem Oil', slot: 'quest', q: 1, icon: 'venom' });
  D.item('golem_gear', { name: 'Rusted Golem Gear', slot: 'quest', q: 1, icon: 'coin' });
  D.item('brashclaw_banner', { name: "Brashclaw's War Banner", slot: 'quest', q: 1, icon: 'bandana' });
  D.item('brashclaw_cleaver', { name: "Brashclaw's Cleaver", slot: 'weapon', wtype: 'axe', q: 3, lvl: 18, dmg: [24, 37], speed: 2.6, stats: { str: 6, sta: 4 }, icon: 'axe', sell: 1700, source: 'Sergeant Brashclaw, the Dead Acre' });
  Object.assign(D.MOBS, {
    defias_digger: { name: 'Defias Digger', lvl: [15, 16], family: 'humanoid', drops: [['thieves_coin', 0.45], ['linen_cloth', 0.35]], qdrops: [['quarry_ore', 0.55], ['furlbrow_deed', 0.2]], aggro: 'Back to work... after I kill you.' },
    defias_overseer: { name: 'Defias Overseer', lvl: [16, 17], family: 'humanoid', hpMult: 1.1, drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['defias_ledger', 0.5], ['overseer_whip', 0.5]], aggro: 'Nobody slacks on my watch!' },
    defias_knuckleduster: { name: 'Defias Knuckleduster', lvl: [16, 17], family: 'humanoid', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.35]], qdrops: [['moonbrook_insignia', 0.5]], aggro: 'Put your fists up!' },
    defias_highwayman: { name: 'Defias Highwayman', lvl: [17, 18], family: 'humanoid', drops: [['thieves_coin', 0.55], ['linen_cloth', 0.35]], qdrops: [['moonbrook_insignia', 0.5], ['defias_letter', 0.15]], aggro: 'Your money or your life. Both, actually.' },
    rusty_harvest_golem: { name: 'Rusty Harvest Golem', lvl: [17, 18], family: 'mechanical', hpMult: 1.1, drops: [['linen_cloth', 0.15]], qdrops: [['golem_gear', 0.55], ['golem_oil', 0.5]], aggro: 'Harvest... protocol... restored.' },
    harvest_reaper: { name: 'Harvest Reaper', lvl: [18, 19], family: 'mechanical', hpMult: 1.15, drops: [['linen_cloth', 0.15]], qdrops: [['golem_gear', 0.55], ['golem_oil', 0.5]], aggro: 'Reaping sequence initiated.' },
    sergeant_brashclaw: { name: 'Sergeant Brashclaw', lvl: [18, 18], family: 'humanoid', named: true, hpMult: 2, dmgMult: 1.3, drops: [['brashclaw_cleaver', 0.35], ['gnoll_mane', 1]], qdrops: [['brashclaw_banner', 1]], aggro: 'Brashclaw takes your bones!' },
  });
  Object.assign(D.PLACES, {
    gold_coast_quarry: { name: 'Gold Coast Quarry', zone: 'Westfall', region: 'westfall', scene: 'gold_coast_quarry', lvl: [15, 17], mobs: [['defias_digger', 5], ['defias_overseer', 4]], pool: 10, npcs: [], links: { sentinel_hill: 18, the_longshore: 16 } },
    moonbrook: { name: 'Moonbrook', zone: 'Westfall', region: 'westfall', scene: 'moonbrook', lvl: [16, 19], mobs: [['defias_knuckleduster', 5], ['defias_highwayman', 4]], pool: 10, npcs: [], links: { sentinel_hill: 20, the_dead_acre: 16, dagger_hills: 16 } },
    the_dead_acre: { name: 'The Dead Acre', zone: 'Westfall', region: 'westfall', scene: 'the_dead_acre', lvl: [17, 20], mobs: [['rusty_harvest_golem', 5], ['harvest_reaper', 4]], named: { sergeant_brashclaw: 300 }, pool: 10, npcs: [], links: { moonbrook: 16, sentinel_hill: 22 } },
  });
  Object.assign(D.QUESTS, {
    gold_coast_scout: { name: 'The Gold Coast Quarry', lvl: 15, giver: 'galiaan', turnin: 'galiaan', text: 'The Defias work a quarry on the coast north of the Longshore. Find it.',
      objs: [{ type: 'visit', place: 'gold_coast_quarry' }], reward: { money: 500 } },
    quarry_diggers: { name: 'Quarry Diggers', lvl: 15, giver: 'danuvin', turnin: 'danuvin', text: 'Every stone the Defias dig out of the Gold Coast Quarry pays for their war. Kill 12 diggers.',
      objs: [{ type: 'kill', mob: 'defias_digger', n: 12 }], reward: { choice: ['fam_feet17'] } },
    gold_coast_ore: { name: 'Gold Coast Ore', lvl: 15, giver: 'lewis', turnin: 'lewis', text: 'The quarry ore is good iron. Bring me 8 and I will forge you something better.',
      objs: [{ type: 'collect', item: 'quarry_ore', n: 8 }], reward: { choice: ['fam_weapon17'] } },
    furlbrow_deed_q: { name: "Furlbrow's Deed", lvl: 15, giver: 'furlbrow', turnin: 'furlbrow', text: 'The Defias stole the deed to my farm. One of their diggers at the quarry has it. Please bring it back.',
      objs: [{ type: 'collect', item: 'furlbrow_deed', n: 1 }], reward: { money: 600 } },
    quarry_overseers: { name: 'The Overseers', lvl: 16, giver: 'danuvin', turnin: 'danuvin', pre: ['quarry_diggers'], text: 'The overseers keep the diggers working. Kill 10.',
      objs: [{ type: 'kill', mob: 'defias_overseer', n: 10 }], reward: { choice: ['fam_wrist17'] } },
    quarry_ledgers: { name: 'The Quarry Ledgers', lvl: 16, giver: 'gryan', turnin: 'gryan', text: 'The overseers keep ledgers of where the ore goes. Bring me 6 and we will follow the money.',
      objs: [{ type: 'collect', item: 'defias_ledger', n: 6 }], reward: { money: 650 } },
    moonbrook_scout: { name: 'Moonbrook', lvl: 16, giver: 'gryan', turnin: 'gryan', pre: ['defias_orders'], text: 'The orders point to Moonbrook, the burned town to the south. Scout it and come back.',
      objs: [{ type: 'visit', place: 'moonbrook' }], reward: { money: 550 } },
    knuckledusters: { name: 'The Knuckledusters', lvl: 17, giver: 'danuvin', turnin: 'danuvin', text: 'Brawlers guard the streets of Moonbrook. Kill 12 knuckledusters.',
      objs: [{ type: 'kill', mob: 'defias_knuckleduster', n: 12 }], reward: { choice: ['fam_chest18'] } },
    moonbrook_insignias: { name: 'Moonbrook Insignias', lvl: 17, giver: 'heather', turnin: 'heather', text: 'Every Defias in Moonbrook wears their insignia. Bring me 10 and the militia will pay a bounty.',
      objs: [{ type: 'collect', item: 'moonbrook_insignia', n: 10 }], reward: { money: 700 } },
    dead_acre_scout: { name: 'The Dead Acre', lvl: 17, giver: 'saldean', turnin: 'saldean', text: 'Past Moonbrook lies the Dead Acre, where old harvest golems still walk. See what the Defias are building there.',
      objs: [{ type: 'visit', place: 'the_dead_acre' }], reward: { money: 550 } },
    rusty_golems: { name: 'Rust and Ruin', lvl: 17, giver: 'saldean', turnin: 'saldean', text: 'The rusty golems on the Dead Acre trample what little grows there. Smash 12.',
      objs: [{ type: 'kill', mob: 'rusty_harvest_golem', n: 12 }], reward: { choice: ['fam_hands19'] } },
    highwaymen: { name: 'The Highwaymen', lvl: 18, giver: 'gryan', turnin: 'gryan', pre: ['moonbrook_scout'], text: 'Highwaymen rob every cart on the road through Moonbrook. Kill 12.',
      objs: [{ type: 'kill', mob: 'defias_highwayman', n: 12 }], reward: { choice: ['fam_legs18'] } },
    golem_gears: { name: 'Golem Gears', lvl: 18, giver: 'lewis', turnin: 'lewis', text: 'The golems are built from stolen parts. Bring me 8 gears and we will see who is making them.',
      objs: [{ type: 'collect', item: 'golem_gear', n: 8 }], reward: { choice: ['fam_waist19'] } },
    defias_letter_q: { name: 'The Sealed Letter', lvl: 18, giver: 'gryan', turnin: 'gryan', pre: ['highwaymen'], text: "A highwayman carries a sealed letter for the Brotherhood's leader. Take it from them.",
      objs: [{ type: 'collect', item: 'defias_letter', n: 1 }], reward: { choice: ['fam_weapon20'] } },
    harvest_reapers: { name: 'The Harvest Reapers', lvl: 19, giver: 'saldean', turnin: 'saldean', pre: ['rusty_golems'], text: "The reapers are the Defias' newest machines. Destroy 10 before they reach the farms.",
      objs: [{ type: 'kill', mob: 'harvest_reaper', n: 10 }], reward: { choice: ['fam_back19'] } },
    overseer_whips: { name: 'No More Whips', lvl: 17, giver: 'verna', turnin: 'verna', text: 'My brother works in that quarry now, under the lash. Bring me 8 overseer whips so I can burn them.',
      objs: [{ type: 'collect', item: 'overseer_whip', n: 8 }], reward: { money: 700 } },
    moonbrook_patrol: { name: 'Patrolling Moonbrook', lvl: 18, giver: 'danuvin', turnin: 'danuvin', pre: ['knuckledusters'], text: 'Keep Moonbrook off balance: 8 knuckledusters and 6 highwaymen.',
      objs: [{ type: 'kill', mob: 'defias_knuckleduster', n: 8 }, { type: 'kill', mob: 'defias_highwayman', n: 6 }], reward: { choice: ['fam_hands19'] } },
    golem_oil_q: { name: 'Oil for the Mill', lvl: 19, giver: 'salma', turnin: 'salma', text: 'The mill wheel squeaks worse than the golems. Their oil will do. Bring me 8 flasks.',
      objs: [{ type: 'collect', item: 'golem_oil', n: 8 }], reward: { money: 800 } },
    wanted_highwaymen: { name: 'Wanted: Highwaymen', lvl: 19, giver: 'galiaan', turnin: 'galiaan', pre: ['highwaymen'], text: 'The worst of the highwaymen still ride. Kill 10 more.',
      objs: [{ type: 'kill', mob: 'defias_highwayman', n: 10 }], reward: { choice: ['fam_waist19'] } },
    dead_acre_sweep: { name: 'Sweep the Dead Acre', lvl: 20, giver: 'gryan', turnin: 'gryan', pre: ['harvest_reapers'], text: 'End the golem threat for good: 8 harvest reapers and 8 rusty golems.',
      objs: [{ type: 'kill', mob: 'harvest_reaper', n: 8 }, { type: 'kill', mob: 'rusty_harvest_golem', n: 8 }], reward: { choice: ['fam_chest18'] } },
    brashclaw_q: { name: 'Sergeant Brashclaw', lvl: 19, giver: 'galiaan', turnin: 'galiaan', text: 'A gnoll called Sergeant Brashclaw leads raids from the Dead Acre. He is rarely seen. Bring me his war banner.',
      objs: [{ type: 'collect', item: 'brashclaw_banner', n: 1 }], reward: { choice: ['fam_ring_rare20'] } },
  });
})(typeof window !== 'undefined' ? window : globalThis);