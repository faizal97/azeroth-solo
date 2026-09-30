// LEGENDS: hand-made characters with their own story, a questline across the levels, and a place in your group once you
// finish it. D.LEGENDS[key] = { name, title, npc, unlock (the last quest), role, cls, race, abilities, story, credit }.
// First legend: Lyveus Cloveus, the Exiled Knight (an original character by a friend of the developer, adapted to the
// Black Brood story). A wood elf paladin of the Kingsmere guard who overheard Lady Thorne's cabal, was condemned,
// saved when his comrade Vyn faked his death, and lost his home in the Kinloch Highlands to the cabal's hired blades.
(function (root) {
  const D = root.D;
  D.LEGENDS = D.LEGENDS || {};
  D.LEGENDS.lyveus = {
    name: 'Lyveus Cloveus', short: 'Lyveus', nick: 'Lyv', title: 'The Exiled Knight', npc: 'lyveus', unlock: 'lg_lyv_oath',
    cls: 'paladin', race: 'nightelf', role: 'tank', abilities: ['oathbound_strike', 'ancients_bulwark'],
    credit: 'An original character created by a friend, adapted for Caldreth.',
    pronoun: 'his',
    // the keepsake for finishing his story (v10.2): his shield, worn as a look on your back (no slot, no stats)
    keepsake: { look: 'silverleaf_aegis', name: 'Silverleaf Aegis', icon: 'silverleaf_aegis', desc: 'The leaf-and-pearl shield of Silverleaf Lodge, given to you by Lyveus. Worn on your back.' },
    // the cameo (v10.2): what he says when he turns up in one of your runs, and when he leaves
    cameo: {
      hello: ['Heard you were headed in. I\'ll hold the front.', 'The Ledger\'s blades aren\'t the only ones out tonight. I\'ll walk with you.', 'Vyn says I need more company. So. Here I am.', 'Room for one more? I keep quiet and I keep watch.'],
      // the first cameo only: a short scene as he walks in (ui.js playCameoScene)
      first: { say: 'A knight in leaf-green steel falls in beside your group.', line: 'Heard you were headed in. The Ledger isn\'t done with either of us. I\'ll hold the front.' },
      bye: ['Good work. Ghosts keep watch; I\'ll keep watching.', 'Go well. If anyone asks, you never saw me.', 'That was a good fight. Until the next one.', 'I\'ve somewhere to be. The grove doesn\'t guard itself.'],
    },
    story: [
      'Long before the Long War, the black dragon Ossarak, whom the elves of the Kinloch forests call the Black Ruin, tore the world open. He was driven off, but never destroyed.',
      'Lyveus grew up in Silverleaf Lodge, a wood elf village in the Kinloch pines, learning blade, bow and the old grove oath of his people. Seven years ago, when a Kingsmere caravan was ambushed near the forest, the Light burst from him in its defence. Kingsmere took him into its guard, as a fighter and as a sign that the old alliance of men and elves still held.',
      'Five years ago, as a guard to the nobles of the court, he overheard a circle of them plotting to send the kingdom\'s soldiers to die for a dark master. They condemned him. His comrade Vyn faked his death, and Lyveus vanished.',
      'Two years ago the cabal learned he was alive. Silverleaf Lodge burned, and his kin with it. The world was told it was Black Ledger bandits. Lyveus knows better.',
      'Now the black brood stirs again, and the exiled knight has come home to the ashes.',
    ],
  };

  Object.assign(D.ABILITIES, {
    oathbound_strike: { name: 'Oathbound Strike', cls: 'legend', lvl: 1, cost: 0, cd: 8, target: 'enemy', dmg: { base: [180, 220], perLvl: 5, coef: 0.4, school: 'holy' }, desc: 'A strike of holy light and living green: {b} Holy damage. 8 sec cooldown.' },
    ancients_bulwark: { name: "Ancients' Bulwark", cls: 'legend', lvl: 1, cost: 0, cd: 45, target: 'self', gcd: false, shield: { base: 300, perLvl: 14, coef: 0.2, dur: 12 }, desc: 'The leaf-and-pearl shield flares: absorbs {s} damage for 12 sec. 45 sec cooldown.' },
  });

  D.item('sealed_orders', { name: 'Sealed Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('cabal_ledger', { name: "Smuggler's Ledger", slot: 'quest', q: 1, icon: 'journal' });
  D.item('windsor_page', { name: "A Torn Page of Hale's Notes", slot: 'quest', q: 1, icon: 'journal' });
  D.item('cassius_signet', { name: "Lord Marrow's Signet", slot: 'quest', q: 1, icon: 'ring' });
  D.item('marrow_rapier', { name: "Marrow's Court Rapier", slot: 'weapon', wtype: 'sword', q: 3, lvl: 60, dmg: [62, 108], speed: 2.2, stats: { agi: 16, sta: 12 }, icon: 'sword', sell: 13000 });
  D.item('marrow_cloak', { name: 'Cloak of the Silent Court', slot: 'back', q: 3, lvl: 60, armor: 84, stats: { sta: 15, int: 13 }, icon: 'cloak', sell: 12800 });
  D.item('marrow_gloves', { name: 'Gloves of the Cabal', slot: 'hands', atype: 'mail', q: 3, lvl: 60, armor: 330, stats: { str: 18, sta: 15 }, icon: 'gloves', sell: 13000 });

  // the Black Ledger squatting in the ruins carry the cabal's orders; the Dustcloak smugglers keep its ledger; the
  // High Interrogator of Cinderpeak Depths kept a page of Hale's notes
  D.MOBS.syndicate_magus.qdrops = (D.MOBS.syndicate_magus.qdrops || []).concat([['sealed_orders', 0.35]]);
  D.MOBS.syndicate_highwayman.qdrops = (D.MOBS.syndicate_highwayman.qdrops || []).concat([['sealed_orders', 0.15]]);
  D.MOBS.wastewander_shadow_mage.qdrops = (D.MOBS.wastewander_shadow_mage.qdrops || []).concat([['cabal_ledger', 0.3]]);
  D.MOBS.high_interrogator_gerstahn.qdrops = (D.MOBS.high_interrogator_gerstahn.qdrops || []).concat([['windsor_page', 1]]);

  Object.assign(D.MOBS, {
    cabal_enforcer: { name: 'Cabal Enforcer', lvl: [59, 60], family: 'humanoid', sprite: 'syndicate_highwayman', hpMult: 1.1, drops: [['thieves_coin', 0.6], ['linen_cloth', 0.3]], aggro: 'The elf dies today. So do you.' },
    lord_cassius_marrow: { name: 'Lord Cassius Marrow', lvl: [60, 60], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'kelris', summon: 'cabal_enforcer', specialText: 'Lord Marrow calls for his blades!', drops: [['thieves_coin', 1]], qdrops: [['cassius_signet', 1]], loot: ['marrow_rapier', 'marrow_cloak', 'marrow_gloves'], aggro: 'You should have stayed dead, Cloveus.' },
  });

  Object.assign(D.PLACES, {
    silverleaf_lodge: { name: 'Silverleaf Lodge', zone: 'Kinloch Highlands', region: 'arathi', scene: 'silverleaf_lodge', lvl: [37, 40], mobs: [['syndicate_highwayman', 4], ['syndicate_magus', 3]], pool: 7, npcs: ['lyveus'], links: { highland_plains: 18, stromgarde_keep: 16 } },
  });
  D.PLACES.highland_plains.links.silverleaf_lodge = 18;
  D.PLACES.stromgarde_keep.links.silverleaf_lodge = 16;
  D.PLACES.gadgetzan.npcs.push('vyn');

  Object.assign(D.NPCS, {
    lyveus: { name: 'Lyveus Cloveus', title: 'The Exiled Knight', legend: 'lyveus' },
    vyn: { name: 'Vyn', title: 'Kingsmere Guard, off duty' },
  });

  // Before level 37 he wanders in a hood (v9.2): he may step into a hard fight from level 15 (G.wandererCheck), and at
  // 17-18 he asks each faction for help with one quest. At Silverleaf Lodge he pulls back the hood.
  D.LEGENDS.lyveus.hooded = { minLvl: 15, until: 'lg_lyv_ashes', name: 'Hooded Wanderer', art: 'lyveus_hooded',
    join: ['Keep your guard up.', 'Hold. I have this one.', 'Not every bandit on these roads is a bandit.', 'Back to back, stranger.'],
    leave: ['The Light keeps you. For now.', 'Watch the nobles, not the roads.', "We'll meet again, I think.", 'Tell no one you saw me.'] };
  D.item('cabal_seal', { name: "A Noble's Wax Seal", slot: 'quest', q: 1, icon: 'coin' });
  D.MOBS.defias_highwayman.qdrops = (D.MOBS.defias_highwayman.qdrops || []).concat([['cabal_seal', 0.3]]);
  D.MOBS.baeldun_soldier.qdrops = (D.MOBS.baeldun_soldier.qdrops || []).concat([['cabal_seal', 0.3]]);
  D.NPCS.hooded_stranger = { name: 'Hooded Stranger', title: 'A wanderer' };
  D.PLACES.sentinel_hill.npcs.push('hooded_stranger');
  D.PLACES.crossroads.npcs.push('hooded_stranger');

  const Q = (id, q) => { D.QUESTS[id] = q; };
  Q('lg_hood_a', { name: 'Sealed in Wax', lvl: 17, faction: 'alliance', giver: 'hooded_stranger', turnin: 'hooded_stranger', legend: 'lyveus', text: "Don't look at my face; look at Fenwick. The Grey Hood highwaymen there carry letters that aren't theirs, sealed in a lord's wax. Kill 8 of them and bring me one of those seals. Tell no one who asked.",
    objs: [{ type: 'kill', mob: 'defias_highwayman', n: 8 }, { type: 'collect', item: 'cabal_seal', n: 1 }], reward: { choice: ['fam_hands19'] } });
  Q('lg_hood_h', { name: 'Sealed in Wax', lvl: 18, faction: 'horde', giver: 'hooded_stranger', turnin: 'hooded_stranger', legend: 'lyveus', text: "The Stonegrave soldiers in the south dig for Keldrun, but their orders come sealed from Kingsmere. Someone in that court wants a war in the Scrublands. Kill 8 of them and bring me a seal. Don't ask my name.",
    objs: [{ type: 'kill', mob: 'baeldun_soldier', n: 8 }, { type: 'collect', item: 'cabal_seal', n: 1 }], reward: { choice: ['fam_hands19'] } });
  Q('lg_lyv_ashes', { name: 'Ashes of Silverleaf', lvl: 37, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', text: "This was my home. Two years ago it burned, and the world was told the Black Ledger did it. Now the Black Ledger camps in its ashes as if they own it. Help me clear them out: 10 highwaymen.",
    objs: [{ type: 'kill', mob: 'syndicate_highwayman', n: 10 }], reward: { choice: ['fam_back38'] } });
  Q('lg_lyv_orders', { name: 'Sealed Orders', lvl: 38, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_ashes'], text: "Bandits don't carry orders. These do. Their magi keep them sealed. Bring me one, and we'll see whose wax it is.",
    objs: [{ type: 'collect', item: 'sealed_orders', n: 1 }], reward: { choice: ['fam_ring_rare40'] } });
  Q('lg_lyv_vyn', { name: 'A Friend in Coppergulch', lvl: 44, giver: 'lyveus', turnin: 'vyn', legend: 'lyveus', pre: ['lg_lyv_orders'], text: "The seal on these orders belongs to a lord of the Kingsmere court. There's one man who can tell me which: Vyn, the guard who saved my life. He writes from Coppergulch now, far from the court's eyes. Find him. Tell him Lyv sent you.",
    objs: [{ type: 'visit', place: 'gadgetzan' }], reward: { money: 3000 } });
  Q('lg_lyv_ledger', { name: "The Smuggler's Ledger", lvl: 45, giver: 'vyn', turnin: 'vyn', legend: 'lyveus', pre: ['lg_lyv_vyn'], text: "Lyv's alive? Light, I knew it. That seal belongs to Lord Cassius Marrow. He ships gold through Sirocco, and the Dustcloak guard it. Their shadow mages keep the books. Bring me the ledger, and thin out 8 of their bandits while you're at it.",
    objs: [{ type: 'kill', mob: 'wastewander_bandit', n: 8 }, { type: 'collect', item: 'cabal_ledger', n: 1 }], reward: { choice: ['fam_weapon46'] } });
  Q('lg_lyv_page', { name: "The Marshal's Page", lvl: 54, giver: 'vyn', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_ledger'], dungeon: 'blackrock_depths', text: "Marrow's gold goes to the Slagborn. And the Slagborn hold Marshal Hale. If the marshal wrote down what he saw, the High Interrogator will have it. Get me that page, then take it to Lyv at Silverleaf Lodge.",
    objs: [{ type: 'collect', item: 'windsor_page', n: 1 }], reward: { choice: ['fam_back_rare55'] } });
  Q('lg_lyv_oath', { name: 'The Oath of the Ancients', lvl: 60, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_page'], group: 3, text: "Hale wrote my name. \"The elf guard who should be dead.\" He saw what I saw. Marrow knows it too; he's coming here himself to finish what his fire started. Then I'll be waiting, at the grove where I took my oath. Stand with me.",
    objs: [{ type: 'collect', item: 'cassius_signet', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  Object.assign(D.ACTIVITIES, {
    lg_marrow: { name: 'The Oath of the Ancients', where: 'silverleaf_lodge', size: 3, minLvl: 58, maxLvl: 60, desc: "Lyveus's last stand at Silverleaf Lodge. 3 players.", boss: 'lord_cassius_marrow', needQuest: 'lg_lyv_oath', pulls: [{ scene: 'silverleaf_lodge', label: 'The burned hall', mobs: ['cabal_enforcer', 'cabal_enforcer'] }, { scene: 'silverleaf_lodge', label: 'The grove', mobs: ['cabal_enforcer', 'cabal_enforcer', 'cabal_enforcer'] }, { scene: 'silverleaf_lodge', label: 'Lord Cassius Marrow', mobs: ['lord_cassius_marrow'], boss: true }] },
  });

  // ------------------------------------------------------------------------------------------------------------------
  // Second legend (v10.2): Widya, the Songkeeper's Daughter, a wood elf bard of Reedsong on Lake Aurel (an original
  // character by a friend of the developer). A small story on purpose: the Black Ledger took her hamlet's lute for its
  // debt, and the appraiser Harrowby split it to sell; she wins it back piece by piece, levels 22-40, both factions.
  // Design: docs/plans/2026-09-30-widya-bard-design.md. She plays a Bard (data/bard.js), a healer.
  D.LEGENDS.widya = {
    name: 'Widya', short: 'Widya', title: "The Songkeeper's Daughter", npc: 'widya', unlock: 'lg_wid_song',
    cls: 'bard', race: 'nightelf', role: 'healer', wtype: 'dagger', abilities: ['songkeepers_ballad', 'lakeside_lullaby'], pronoun: 'her',
    credit: 'An original character created by a friend, adapted for Caldreth.',
    teaser: 'A wood elf singer has been seen on the jetties of Lake Aurel in Elderglen, playing a borrowed lute badly and singing anyway (level 22+).',
    keepsake: { look: 'reedsong_lute', name: 'Reedsong Lute', icon: 'reedsong_lute', desc: 'A copy of the Songkeepers\' lute, carved by Widya for you. Worn on your back.' },
    story: [
      'Reedsong is a hamlet of reed houses and jetties on Lake Aurel. Its Songkeepers keep every family\'s story as a song, and every song is played on one lute, old as the hamlet, its neck carved with the name of every Songkeeper who ever played it.',
      'After the Long War, Reedsong borrowed from the Black Ledger to rebuild its jetties. Last autumn the harvest failed. The collectors came, and the lute was the only thing of value, so they took it "on account".',
      'The Ledger\'s appraiser, a tired clerk called Harrowby, found it sold better in pieces. Widya, the Songkeeper\'s daughter, went after every one of them: the silver strings, the heartwood pegs, the carved neck and the body.',
      'She got them back. The debt is still there; that is not a thing a song can settle. But the lute plays again, and the last name on its neck is hers.',
    ],
    cameo: {
      hello: ['Room for a singer? I heal better than I bargain.', 'I heard there was a fight. Somebody has to keep you all in tune.', 'Don\'t mind me, I\'m only here for the songs. And your lives.', 'Hello again! I brought the lute. Try not to die near it.'],
      bye: ['That one goes in the Songbook. Take care of yourselves.', 'Good run! I\'ll get the words right by the next inn.', 'Off I go. Somebody at Lake Aurel owes me a supper.', 'Thank you for the song. It was a loud one.'],
      pull: ['Here we go. Everyone breathe on the beat.', 'On the count. One, two...', 'Keep close. My songs don\'t carry far.'],
      win: ['Ha! That\'s a verse.', 'Well played. Well fought.', 'Everyone still here? Good. I counted.'],
      wipe: ['Up, up. The song isn\'t over.', 'Well, that was the sad verse. Again?'],
      loot: ['Take it, it suits you.', 'Pretty! Not as pretty as the lute.'],
      first: { say: 'A wood elf with a lute on her back runs to catch up with your group, out of breath and grinning.', line: 'Don\'t start without me! You fight, I sing, nobody dies. That\'s the deal.' },
    },
  };
  Object.assign(D.ABILITIES, {
    songkeepers_ballad: { name: "Songkeeper's Ballad", cls: 'legend', lvl: 1, cost: 0, cd: 40, target: 'party', icon: 'encore', hot: { id: 'songkeepers_ballad', ticks: 5, every: 2, heal: 30, perLvl: 3, coef: 0.15 }, desc: 'The song of Reedsong heals everyone in the party for {hh} over 10 sec. 40 sec cooldown.' },
    lakeside_lullaby: { name: 'Lakeside Lullaby', cls: 'legend', lvl: 1, cost: 0, cd: 45, target: 'self', icon: 'lullaby', combatOnly: true, stompAll: 4, desc: 'A lullaby from the jetties: nearby enemies (not bosses) sleep for 4 sec. 45 sec cooldown.' },
  });

  D.item('silver_lute_strings', { name: 'Silver Lute Strings', slot: 'quest', q: 1, icon: 'silver_lute_strings' });
  D.item('heartwood_pegs', { name: 'Heartwood Pegs', slot: 'quest', q: 1, icon: 'heartwood_pegs' });
  D.item('carved_lute_neck', { name: 'The Carved Neck', slot: 'quest', q: 1, icon: 'carved_lute_neck' });

  // the bearkin raided the collectors' cart; Harrowby's porters carry his strongbox through Grey Wolf Vale
  D.MOBS.thistlefur_ursa.qdrops = (D.MOBS.thistlefur_ursa.qdrops || []).concat([['silver_lute_strings', 0.25]]);
  D.MOBS.thistlefur_shaman.qdrops = (D.MOBS.thistlefur_shaman.qdrops || []).concat([['silver_lute_strings', 0.25]]);
  Object.assign(D.MOBS, {
    ledger_porter: { name: 'Ledger Porter', lvl: [26, 27], family: 'humanoid', sprite: 'syndicate_highwayman', drops: [['thieves_coin', 0.5], ['linen_cloth', 0.3]], qdrops: [['heartwood_pegs', 0.35]], aggro: 'Hands off the strongbox. It\'s been appraised.' },
    camp_brawler: { name: 'Camp Brawler', lvl: [33, 33], family: 'humanoid', sprite: 'kurzen_commando', hpMult: 1.1, drops: [['thieves_coin', 0.5]], aggro: 'Nobody out-sings Sal at this fire!' },
    sal_brightbell: { name: 'Sal Brightbell', lvl: [34, 34], family: 'humanoid', elite: true, named: true, hpMult: 4.2, dmgMult: 2, special: 'kelris', summon: 'camp_brawler', specialText: 'Sal Brightbell hits a note so loud the camp joins in!', drops: [['thieves_coin', 1]], qdrops: [['carved_lute_neck', 1]], aggro: 'A contest is a contest, elf. Loser pays in teeth!' },
  });
  D.PLACES.the_howling_vale.mobs.push(['ledger_porter', 3]);

  Object.assign(D.NPCS, {
    widya: { name: 'Widya', title: "The Songkeeper's Daughter", legend: 'widya' },
    harrowby: { name: 'Harrowby', title: 'Appraiser of the Black Ledger', art: 'harrowby' },
  });
  // a travelling singer: she is found at each stage of her story
  D.PLACES.mystral_lake.npcs.push('widya');
  D.PLACES.nesingwary_camp.npcs.push('widya');
  D.PLACES.highland_plains.npcs.push('widya');
  D.PLACES.stromgarde_keep.npcs = (D.PLACES.stromgarde_keep.npcs || []).concat(['harrowby']);

  Q('lg_wid_meet', { name: 'A Borrowed Lute', lvl: 22, giver: 'widya', turnin: 'widya', legend: 'widya', text: "Oh! You heard that? Please don't judge the song by this lute. It's borrowed, and it's awful. Mine was taken. It's a long story, and I'll sing you all of it, but first: the bears have decided this jetty is theirs. Chase off 8 of them and I'll tell you everything.",
    objs: [{ type: 'kill', mob: 'ashenvale_bear', n: 8 }], reward: { choice: ['fam_feet22'] } });
  Q('lg_wid_strings', { name: 'Silver Strings', lvl: 24, giver: 'widya', turnin: 'widya', legend: 'widya', pre: ['lg_wid_meet'], text: "The Ledger's collectors took our lute for Reedsong's debt. On the road north, the Briarpelt bearkin raided their cart, and one of them has been seen wearing silver strings like a necklace. Those are ours. Bring them back to me.",
    objs: [{ type: 'collect', item: 'silver_lute_strings', n: 1 }], reward: { choice: ['fam_waist24'] } });
  Q('lg_wid_pegs', { name: 'The Appraiser', lvl: 27, giver: 'widya', turnin: 'widya', legend: 'widya', pre: ['lg_wid_strings'], text: "I found the collectors' paperwork. The lute was appraised by a man called Harrowby, and he split it up! Strings, pegs, neck, body, sold one by one, because it's worth more that way. His porters are carrying his strongbox through Grey Wolf Vale. The heartwood pegs are in it. Kill 6 of them and bring me the pegs.",
    objs: [{ type: 'kill', mob: 'ledger_porter', n: 6 }, { type: 'collect', item: 'heartwood_pegs', n: 1 }], reward: { choice: ['fam_weapon27'] } });
  Q('lg_wid_auction', { name: 'The Trophy Auction', lvl: 31, giver: 'widya', turnin: 'widya', legend: 'widya', pre: ['lg_wid_pegs'], text: "Harrowby sold the neck to a trophy dealer, who is auctioning it at Wexley's Expedition in the Vinewild, between a tiger's head and a troll's tusk. A trophy! It has names on it! Meet me there. I'll go ahead and look terribly rich.",
    objs: [{ type: 'visit', place: 'nesingwary_camp' }], reward: { money: 2500 } });
  Q('lg_wid_contest', { name: 'A Song for the Neck', lvl: 33, giver: 'widya', turnin: 'widya', legend: 'widya', pre: ['lg_wid_auction'], group: 3, text: "The neck went to Sal Brightbell, the camp's singing champion, and I haven't got the coin. But Sal says anyone can have it who out-sings him at the fire tonight. Easy. Except Sal cheats, and his friends are large. Come with me and bring two more. I'll sing. You keep me alive.",
    objs: [{ type: 'collect', item: 'carved_lute_neck', n: 1 }], reward: { choice: ['fam_hands34'] } });
  Q('lg_wid_body', { name: 'The Last Piece', lvl: 38, giver: 'widya', turnin: 'harrowby', legend: 'widya', pre: ['lg_wid_contest'], text: "The body is the last piece, and Harrowby kept it for himself. He's at Highhold Keep with the Ledger's highwaymen around him. I don't want a fight with him; I want to look him in the face. Clear me a way: 10 highwaymen. Then tell him Widya of Reedsong is coming.",
    objs: [{ type: 'kill', mob: 'syndicate_highwayman', n: 10 }], reward: { choice: ['fam_chest38'] } });
  Q('lg_wid_song', { name: "Reedsong's Song", lvl: 40, giver: 'harrowby', turnin: 'widya', legend: 'widya', pre: ['lg_wid_body'], text: "So the Songkeeper's daughter sends a fighter ahead of her. I appraise things. That's all I do. I once had a village too; the Ledger priced it, and I signed. Tell her to come up the plains and play me her village's song. Then we'll see what the body is worth.",
    objs: [{ type: 'visit', place: 'highland_plains' }], reward: { choice: ['fam_ring_rare40'] } });

  Object.assign(D.ACTIVITIES, {
    lg_contest: { name: 'A Song for the Neck', where: 'nesingwary_camp', size: 3, minLvl: 31, maxLvl: 35, desc: "Widya's singing contest at Wexley's Expedition. 3 players.", boss: 'sal_brightbell', needQuest: 'lg_wid_contest', pulls: [{ scene: 'nesingwary_camp', label: 'The camp fire', mobs: ['camp_brawler', 'camp_brawler'] }, { scene: 'nesingwary_camp', label: 'Sal Brightbell', mobs: ['sal_brightbell'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
