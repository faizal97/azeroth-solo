// LEGENDS: hand-made characters with their own story, a questline across the levels, and a place in your group once you
// finish it. D.LEGENDS[key] = { name, title, npc, unlock (the last quest), role, cls, race, abilities, story, credit }.
// First legend: Lyveus Cloveus, the Exiled Knight (an original character by a friend of the developer, adapted to the
// Black Dragonflight story). A high elf paladin of the Stormwind guard who overheard Lady Prestor's cabal, was condemned,
// saved when his comrade Vyn faked his death, and lost his home in the Arathi Highlands to the cabal's hired blades.
(function (root) {
  const D = root.D;
  D.LEGENDS = D.LEGENDS || {};
  D.LEGENDS.lyveus = {
    name: 'Lyveus Cloveus', short: 'Lyveus', nick: 'Lyv', title: 'The Exiled Knight', npc: 'lyveus', unlock: 'lg_lyv_oath',
    cls: 'paladin', race: 'human', role: 'tank', abilities: ['oathbound_strike', 'ancients_bulwark'],
    credit: 'An original character created by a friend, adapted for Azeroth.',
    story: [
      'Twenty-one years ago the black dragon Deathwing, whom the elves of the Arathi forests call Astaroth, the Black Ruin, tore the world in the Second War. He was driven off, but never destroyed.',
      'Lyveus grew up in Silverleaf Lodge, a high elf village in the Arathi pines, learning blade, bow and the old grove oath of his people. Seven years ago, when a Stormwind caravan was ambushed near the forest, the Light burst from him in its defence. Stormwind took him into its guard, as a fighter and as a sign that the old alliance of men and elves still held.',
      'Five years ago, as a guard to the nobles of the court, he overheard a circle of them plotting to send the kingdom\'s soldiers to die for a dark master. They condemned him. His comrade Vyn faked his death, and Lyveus vanished.',
      'Two years ago the cabal learned he was alive. Silverleaf Lodge burned, and his kin with it. The world was told it was Syndicate bandits. Lyveus knows better.',
      'Now the black dragonflight stirs again, and the exiled knight has come home to the ashes.',
    ],
  };

  Object.assign(D.ABILITIES, {
    oathbound_strike: { name: 'Oathbound Strike', cls: 'legend', lvl: 1, cost: 0, cd: 8, target: 'enemy', dmg: { base: [180, 220], perLvl: 5, coef: 0.4, school: 'holy' }, desc: 'A strike of holy light and living green: {b} Holy damage. 8 sec cooldown.' },
    ancients_bulwark: { name: "Ancients' Bulwark", cls: 'legend', lvl: 1, cost: 0, cd: 45, target: 'self', gcd: false, shield: { base: 300, perLvl: 14, coef: 0.2, dur: 12 }, desc: 'The leaf-and-pearl shield flares: absorbs {s} damage for 12 sec. 45 sec cooldown.' },
  });

  D.item('sealed_orders', { name: 'Sealed Orders', slot: 'quest', q: 1, icon: 'journal' });
  D.item('cabal_ledger', { name: "Smuggler's Ledger", slot: 'quest', q: 1, icon: 'journal' });
  D.item('windsor_page', { name: "A Torn Page of Windsor's Notes", slot: 'quest', q: 1, icon: 'journal' });
  D.item('cassius_signet', { name: "Lord Marrow's Signet", slot: 'quest', q: 1, icon: 'ring' });
  D.item('marrow_rapier', { name: "Marrow's Court Rapier", slot: 'weapon', wtype: 'sword', q: 3, lvl: 60, dmg: [62, 108], speed: 2.2, stats: { agi: 16, sta: 12 }, icon: 'sword', sell: 13000 });
  D.item('marrow_cloak', { name: 'Cloak of the Silent Court', slot: 'back', q: 3, lvl: 60, armor: 84, stats: { sta: 15, int: 13 }, icon: 'cloak', sell: 12800 });
  D.item('marrow_gloves', { name: 'Gloves of the Cabal', slot: 'hands', atype: 'mail', q: 3, lvl: 60, armor: 330, stats: { str: 18, sta: 15 }, icon: 'gloves', sell: 13000 });

  // the Syndicate squatting in the ruins carry the cabal's orders; the Wastewander smugglers keep its ledger; the
  // High Interrogator of Blackrock Depths kept a page of Windsor's notes
  D.MOBS.syndicate_magus.qdrops = (D.MOBS.syndicate_magus.qdrops || []).concat([['sealed_orders', 0.35]]);
  D.MOBS.syndicate_highwayman.qdrops = (D.MOBS.syndicate_highwayman.qdrops || []).concat([['sealed_orders', 0.15]]);
  D.MOBS.wastewander_shadow_mage.qdrops = (D.MOBS.wastewander_shadow_mage.qdrops || []).concat([['cabal_ledger', 0.3]]);
  D.MOBS.high_interrogator_gerstahn.qdrops = (D.MOBS.high_interrogator_gerstahn.qdrops || []).concat([['windsor_page', 1]]);

  Object.assign(D.MOBS, {
    cabal_enforcer: { name: 'Cabal Enforcer', lvl: [59, 60], family: 'humanoid', sprite: 'syndicate_highwayman', hpMult: 1.1, drops: [['thieves_coin', 0.6], ['linen_cloth', 0.3]], aggro: 'The elf dies today. So do you.' },
    lord_cassius_marrow: { name: 'Lord Cassius Marrow', lvl: [60, 60], family: 'humanoid', elite: true, named: true, hpMult: 5.5, dmgMult: 2.6, special: 'kelris', summon: 'cabal_enforcer', specialText: 'Lord Marrow calls for his blades!', drops: [['thieves_coin', 1]], qdrops: [['cassius_signet', 1]], loot: ['marrow_rapier', 'marrow_cloak', 'marrow_gloves'], aggro: 'You should have stayed dead, Cloveus.' },
  });

  Object.assign(D.PLACES, {
    silverleaf_lodge: { name: 'Silverleaf Lodge', zone: 'Arathi Highlands', region: 'arathi', scene: 'silverleaf_lodge', lvl: [37, 40], mobs: [['syndicate_highwayman', 4], ['syndicate_magus', 3]], pool: 7, npcs: ['lyveus'], links: { highland_plains: 18, stromgarde_keep: 16 } },
  });
  D.PLACES.highland_plains.links.silverleaf_lodge = 18;
  D.PLACES.stromgarde_keep.links.silverleaf_lodge = 16;
  D.PLACES.gadgetzan.npcs.push('vyn');

  Object.assign(D.NPCS, {
    lyveus: { name: 'Lyveus Cloveus', title: 'The Exiled Knight', legend: 'lyveus' },
    vyn: { name: 'Vyn', title: 'Stormwind Guard, off duty' },
  });

  const Q = (id, q) => { D.QUESTS[id] = q; };
  Q('lg_lyv_ashes', { name: 'Ashes of Silverleaf', lvl: 37, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', text: "This was my home. Two years ago it burned, and the world was told the Syndicate did it. Now the Syndicate camps in its ashes as if they own it. Help me clear them out: 10 highwaymen.",
    objs: [{ type: 'kill', mob: 'syndicate_highwayman', n: 10 }], reward: { choice: ['fam_back38'] } });
  Q('lg_lyv_orders', { name: 'Sealed Orders', lvl: 38, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_ashes'], text: "Bandits don't carry orders. These do. Their magi keep them sealed. Bring me one, and we'll see whose wax it is.",
    objs: [{ type: 'collect', item: 'sealed_orders', n: 1 }], reward: { choice: ['fam_ring_rare40'] } });
  Q('lg_lyv_vyn', { name: 'A Friend in Gadgetzan', lvl: 44, giver: 'lyveus', turnin: 'vyn', legend: 'lyveus', pre: ['lg_lyv_orders'], text: "The seal on these orders belongs to a lord of the Stormwind court. There's one man who can tell me which: Vyn, the guard who saved my life. He writes from Gadgetzan now, far from the court's eyes. Find him. Tell him Lyv sent you.",
    objs: [{ type: 'visit', place: 'gadgetzan' }], reward: { money: 3000 } });
  Q('lg_lyv_ledger', { name: "The Smuggler's Ledger", lvl: 45, giver: 'vyn', turnin: 'vyn', legend: 'lyveus', pre: ['lg_lyv_vyn'], text: "Lyv's alive? Light, I knew it. That seal belongs to Lord Cassius Marrow. He ships gold through Tanaris, and the Wastewander guard it. Their shadow mages keep the books. Bring me the ledger, and thin out 8 of their bandits while you're at it.",
    objs: [{ type: 'kill', mob: 'wastewander_bandit', n: 8 }, { type: 'collect', item: 'cabal_ledger', n: 1 }], reward: { choice: ['fam_weapon46'] } });
  Q('lg_lyv_page', { name: "The Marshal's Page", lvl: 54, giver: 'vyn', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_ledger'], dungeon: 'blackrock_depths', text: "Marrow's gold goes to the Dark Iron. And the Dark Iron hold Marshal Windsor. If the marshal wrote down what he saw, the High Interrogator will have it. Get me that page, then take it to Lyv at Silverleaf Lodge.",
    objs: [{ type: 'collect', item: 'windsor_page', n: 1 }], reward: { choice: ['fam_back_rare55'] } });
  Q('lg_lyv_oath', { name: 'The Oath of the Ancients', lvl: 60, giver: 'lyveus', turnin: 'lyveus', legend: 'lyveus', pre: ['lg_lyv_page'], group: 3, text: "Windsor wrote my name. \"The elf guard who should be dead.\" He saw what I saw. Marrow knows it too; he's coming here himself to finish what his fire started. Then I'll be waiting, at the grove where I took my oath. Stand with me.",
    objs: [{ type: 'collect', item: 'cassius_signet', n: 1 }], reward: { choice: ['fam_ring_rare60'] } });
  Object.assign(D.ACTIVITIES, {
    lg_marrow: { name: 'The Oath of the Ancients', where: 'silverleaf_lodge', size: 3, minLvl: 58, maxLvl: 60, desc: "Lyveus's last stand at Silverleaf Lodge. 3 players.", boss: 'lord_cassius_marrow', needQuest: 'lg_lyv_oath', pulls: [{ scene: 'silverleaf_lodge', label: 'The burned hall', mobs: ['cabal_enforcer', 'cabal_enforcer'] }, { scene: 'silverleaf_lodge', label: 'The grove', mobs: ['cabal_enforcer', 'cabal_enforcer', 'cabal_enforcer'] }, { scene: 'silverleaf_lodge', label: 'Lord Cassius Marrow', mobs: ['lord_cassius_marrow'], boss: true }] },
  });
})(typeof window !== 'undefined' ? window : globalThis);
