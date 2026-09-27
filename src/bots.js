// Azeroth Solo — the simulated server: population, schedules, levelling, chat.
(function (root) {
  const D = root.D;
  const B = {};
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const chance = (p) => Math.random() < p;

  // Stable pseudo-random from ints (so "is X online at hour H" doesn't flicker).
  function hash(a, b) {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  B.hash = hash;

  // ------------------------------------------------------------- names
  const SYL_A = ['Ael', 'Bran', 'Cor', 'Dar', 'El', 'Fen', 'Gal', 'Hal', 'Ith', 'Jor', 'Kel', 'Lor', 'Mar', 'Nor', 'Or', 'Per', 'Quel', 'Ro', 'Syl', 'Tor', 'Ul', 'Val', 'Wyn', 'Yor', 'Zan', 'Bel', 'Thal', 'Mor', 'Ser', 'Kal'];
  const SYL_B = ['a', 'ia', 'or', 'in', 'wen', 'dor', 'ric', 'eth', 'ius', 'ara', 'on', 'ys', 'iel', 'ok', 'rim', 'as', 'en', 'ith', 'anor', 'wyn'];
  const MEME = ['Legolasxx', 'Healzplz', 'Stabbyjoe', 'Pwnzor', 'Xxshadowxx', 'Tankyboi', 'Frostyfingers', 'Dotsndots', 'Lootgoblin', 'Critmonster',
    'Bubblehearth', 'Gankalot', 'Noobslayer', 'Manadrinker', 'Pumpkinpie', 'Kobolddad', 'Candlethief', 'Muffinz', 'Sneakysneak', 'Holyguacamole',
    'Arthaslol', 'Sylvanasbff', 'Leeroyy', 'Fireballz', 'Shieldbro', 'Stabwound', 'Renewbie', 'Smitehappens', 'Backstabber', 'Polymorphine',
    'Budidps', 'Asepheals', 'Ucoktank', 'Kakashiii', 'Mamangmage', 'Jokowarrior', 'Tehpucuk', 'Nasgorheal', 'Satebandit', 'Kopisusu'];
  B.makeName = function (used) {
    for (let i = 0; i < 50; i++) {
      let n;
      if (chance(0.3)) n = pick(MEME) + (chance(0.4) ? pick(['', 'x', 'z', 'y', 'o']) : '');
      else n = pick(SYL_A) + pick(SYL_B) + (chance(0.15) ? pick(['a', 'e', 'i']) : '');
      n = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
      if (n.length > 12) n = n.slice(0, 12);
      if (!used.has(n)) { used.add(n); return n; }
    }
    return 'Alt' + Math.floor(Math.random() * 9999);
  };

  const GUILDS = ['Goldshire Legends', 'Crimson Vanguard', 'Knights of Elwynn', 'Pumpkin Patrol', 'Defias Dropouts', 'Lions Pride', 'Murloc Mafia', 'Starlight Vanguard',
    'Blood and Thunder', 'Sons of the Storm', 'Zug Zug Crew', 'Razor Hill Raiders', 'Darkspear Voodoo'];
  const GUILD_FACTION = GUILDS.map((g, i) => (i < 8 ? 'alliance' : 'horde'));
  B.GUILDS = GUILDS; B.GUILD_FACTION = GUILD_FACTION;
  B.factionOf = (bot) => ((D.RACES[bot.race] || {}).faction || 'alliance');

  // ------------------------------------------------------------- population
  B.makeBot = function (id, used, opts) {
    opts = opts || {};
    const cls = pick(['warrior', 'warrior', 'mage', 'mage', 'priest', 'rogue', 'rogue', 'priest', 'paladin', 'paladin', 'warlock', 'warlock', 'hunter', 'hunter', 'druid', 'druid', 'shaman', 'shaman']);
    const styleR = Math.random();
    const style = styleR < 0.5 ? 'casual' : styleR < 0.85 ? 'regular' : 'tryhard';
    return {
      id, name: B.makeName(used), cls, race: pick(['human', 'human', 'dwarf', 'gnome', 'nightelf', 'nightelf', 'orc', 'orc', 'troll', 'troll', 'tauren', 'tauren', 'undead', 'undead']), gender: chance(0.55) ? 'm' : 'f', skin: Math.floor(Math.random() * 4), hair: Math.floor(Math.random() * 5),
      level: opts.level || 1, xpf: Math.random() * 0.5, style,
      skill: Math.min(1, Math.max(0.05, (style === 'tryhard' ? 0.75 : style === 'regular' ? 0.55 : 0.35) + (Math.random() - 0.5) * 0.4)),
      social: Math.random(), toxic: Math.random() < 0.15 ? 0.6 + Math.random() * 0.4 : Math.random() * 0.3, ninja: Math.random() < 0.08,
      guild: -1,
      peak: 17 + Math.floor(Math.random() * 7) - (chance(0.2) ? 10 : 0), hours: style === 'tryhard' ? 8 : style === 'regular' ? 5 : 3,
      born: Date.now(),
    };
  };

  // Guilds only take members of their own faction.
  B.assignGuild = function (bot) {
    if (Math.random() >= 0.45) { bot.guild = -1; return bot; }
    const f = B.factionOf(bot);
    const opts = GUILDS.map((g, i) => i).filter((i) => GUILD_FACTION[i] === f);
    bot.guild = opts[Math.floor(Math.random() * opts.length)];
    return bot;
  };
  // A fresh-launch server: most bots start at 1-3.
  B.makePopulation = function (n) {
    const used = new Set();
    const bots = [];
    for (let i = 0; i < n; i++) bots.push(B.assignGuild(B.makeBot(i + 1, used, { level: 1 + Math.floor(Math.random() * Math.random() * 4) })));
    return bots;
  };

  B.isOnline = function (bot, date) {
    const h = date.getHours();
    const d = Math.floor(date.getTime() / 3600000);
    let dist = Math.abs(h - ((bot.peak + 24) % 24));
    dist = Math.min(dist, 24 - dist);
    const base = dist <= bot.hours / 2 ? 0.8 : dist <= bot.hours ? 0.35 : 0.06;
    return hash(bot.id, d) < base;
  };

  // Bots level in their own race's starting region; from 10 some roam the other one.
  B.regionFor = function (bot, slot) {
    const home = (bot.race === 'dwarf' || bot.race === 'gnome') ? 'dunmorogh' : bot.race === 'nightelf' ? 'teldrassil' : (bot.race === 'orc' || bot.race === 'troll') ? 'durotar' : bot.race === 'tauren' ? 'mulgore' : bot.race === 'undead' ? 'tirisfal' : 'elwynn';
    const mine = Object.keys(D.REGIONS).filter((r) => D.REGIONS[r].faction === B.factionOf(bot));
    // v2.0: from 10 most players move on to Westfall or the Barrens
    // v3: from 18 most players move on again, to Redridge or Stonetalon
    const next = bot.level >= 24 && D.REGIONS.duskwood ? (B.factionOf(bot) === 'horde' ? 'hillsbrad' : D.REGIONS.wetlands && hash(bot.id * 29, Math.floor(slot / 6)) < 0.45 ? 'wetlands' : 'duskwood') : bot.level >= 18 && D.REGIONS.redridge ? (B.factionOf(bot) === 'horde' ? 'stonetalon' : 'redridge') : B.factionOf(bot) === 'horde' ? 'barrens' : 'westfall';
    // v4.1: from 22 some players quest in contested Ashenvale instead
    if (bot.level >= 22 && D.REGIONS.ashenvale && hash(bot.id * 23, Math.floor(slot / 6)) < 0.25) return 'ashenvale';
    if (bot.level >= 10 && D.REGIONS[next] && hash(bot.id * 19, Math.floor(slot / 6)) < 0.75) return next;
    if (bot.level >= 10 && mine.length > 1 && hash(bot.id * 13, Math.floor(slot / 6)) < 0.35) {
      const others = mine.filter((r) => r !== home);
      return others[Math.floor(hash(bot.id * 17, Math.floor(slot / 6)) * others.length)];
    }
    return home;
  };
  const TOWNS = { elwynn: ['goldshire', 'stormwind'], dunmorogh: ['kharanos', 'ironforge'], teldrassil: ['dolanaar', 'darnassus'], durotar: ['razor_hill', 'orgrimmar'], mulgore: ['bloodhoof_village', 'thunder_bluff'], tirisfal: ['brill', 'undercity'], westfall: ['sentinel_hill'], barrens: ['crossroads'], redridge: ['lakeshire'], stonetalon: ['sun_rock_retreat'], duskwood: ['darkshire'], hillsbrad: ['tarren_mill'], wetlands: ['menethil_harbor'] };
  B.placeFor = function (bot, date) {
    const slot = Math.floor(date.getTime() / 600000); // 10-minute windows
    const region = B.regionFor(bot, slot);
    const options = Object.keys(D.PLACES).filter((p) => {
      const P = D.PLACES[p];
      return P.region === region && !P.city && bot.level >= P.lvl[0] - 1 && bot.level <= P.lvl[1] + 1 && (!P.faction || P.faction === B.factionOf(bot));
    });
    const towns = region === 'ashenvale' ? [B.factionOf(bot) === 'horde' ? 'splintertree_post' : 'astranaar'] : TOWNS[region];
    if (!options.length) return towns[0];
    // town visits now and then
    if (bot.level >= 5 && hash(bot.id * 7, slot) < 0.18) return towns[Math.floor(hash(bot.id * 3, slot) * towns.length)];
    return options[Math.floor(hash(bot.id, slot) * options.length)];
  };

  // Levelling speed in levels per online hour.
  function rate(bot) {
    const base = bot.style === 'tryhard' ? 1.7 : bot.style === 'regular' ? 1.0 : 0.55;
    return base / (1 + bot.level * 0.12);
  }

  // Advance the server by ms. Returns news items.
  B.advance = function (S, ms) {
    const news = [];
    const steps = Math.min(48, Math.max(1, Math.ceil(ms / 1800000)));
    const stepMs = ms / steps;
    for (let s = 0; s < steps; s++) {
      const when = new Date(S.lastSim + stepMs * (s + 1));
      for (const b of S.bots) {
        if (b.level >= D.LEVEL_CAP) continue;
        if (!B.isOnline(b, when)) continue;
        b.xpf += rate(b) * (stepMs / 3600000);
        while (b.xpf >= 1 && b.level < D.LEVEL_CAP) {
          b.xpf -= 1; b.level++;
          if (b.level === D.LEVEL_CAP) {
            const firstCap = !S.server.firstCap;
            if (firstCap) S.server.firstCap = b.name;
            news.push({ t: when.getTime(), text: firstCap ? `Server first! ${b.name} is the first player on ${D.REALM} to reach level ${D.LEVEL_CAP}.` : `${b.name} reached level ${D.LEVEL_CAP}.`, who: b.id, big: firstCap });
          }
        }
      }
      // dungeon clears by capped bots
      const capped = S.bots.filter((b) => b.level >= 10).length;
      if (capped >= 5 && Math.random() < Math.min(0.9, capped / 40) * (stepMs / 3600000)) {
        const g = pick(GUILDS);
        const first = !S.server.firstVC;
        if (first) S.server.firstVC = g;
        news.push({ t: when.getTime(), text: first ? `<${g}> is the first guild on ${D.REALM} to defeat Edwin VanCleef!` : `<${g}> cleared The Deadmines.`, big: first });
      }
    }
    // new players keep rolling alts, so the starting zone never empties
    const newbies = Math.floor((ms / 3600000) * 3);
    const used = new Set(S.bots.map((b) => b.name));
    for (let i = 0; i < Math.min(newbies, 40); i++) {
      const nb = B.assignGuild(B.makeBot(S.nextBotId++, used, { level: 1 }));
      S.bots.push(nb);
    }
    if (newbies > 0) news.push({ t: S.lastSim + ms, text: `${Math.min(newbies, 40)} new adventurers arrived in Northshire.` });
    // keep the population bounded
    if (S.bots.length > 420) S.bots.splice(0, S.bots.length - 420);
    S.lastSim += ms;
    return news;
  };

  B.onlineIn = function (S, place, date) {
    return S.bots.filter((b) => B.isOnline(b, date) && B.placeFor(b, date) === place);
  };
  B.onlineCount = function (S, date) {
    let n = 0; for (const b of S.bots) if (B.isOnline(b, date)) n++;
    return n;
  };

  // ------------------------------------------------------------- chat text
  const link = (name, q) => `[[${q == null ? 1 : q}|${name}]]`;
  B.link = link;
  const lower = (s) => s.toLowerCase();
  function sloppy(bot, s) {
    if (bot.skill < 0.4 && chance(0.6)) s = lower(s).replace(/[.!]$/, '');
    if (bot.toxic > 0.6 && chance(0.3)) s = s.toUpperCase();
    return s;
  }

  const GENERAL = [
    (c) => `where is ${c.namedMob}?`,
    (c) => `anyone know where ${c.questNpc} is`,
    () => 'how do i get to stormwind',
    () => 'is there a way to reset talents',
    () => 'what level can i ride a mount',
    () => 'server feels packed tonight',
    () => 'this music in elwynn tho',
    (c) => `${c.mobName} drop rate is a joke`,
    (c) => `who is camping ${c.namedMob}, i've been waiting 20 min`,
    () => 'anyone selling bags?',
    (c) => `WTS ${link('Linen Cloth')} x20, cheap`,
    (c) => `WTB ${link(c.greenItem, 2)} pst`,
    () => 'hunters should be banned from pulling in goldshire',
    () => 'is this server pvp? i keep seeing flagged ppl',
    () => 'finally got my first green lol',
    () => 'anyone want to duel outside the inn?',
    () => 'kobolds really said you no take candle and meant it',
    () => 'where do i learn cooking',
    () => 'how much does a mount cost',
    () => 'lol someone just trained 6 kobolds into goldshire',
    () => 'fresh server hype',
    () => 'gl everyone',
    () => 'why is my mana always empty',
    () => 'mages pls conjure water ty',
    () => 'what does "pst" mean',
    () => 'anyone from indo here?',
    () => 'lag?',
  ];
  const GENERAL_HORDE = [
    (c) => `where is ${c.namedMob}?`, () => 'how do i get to orgrimmar', () => 'zug zug', () => "lok'tar ogar!", () => 'for the horde',
    () => 'anyone know where the cactus apples are', () => 'the valley of trials is so crowded lol', () => 'who keeps killing all the boars',
    (c) => `WTS ${link('Linen Cloth')} x20, cheap`, (c) => `WTB ${link(c.greenItem, 2)} pst`, () => 'razor hill inn is the best inn', () => 'where do i learn cooking',
    () => 'those kul tiras humans need to leave durotar', () => 'thrall is the best warchief', () => 'anyone from indo here?', () => 'lag?', () => 'fresh server hype',
    () => 'how much does a wolf mount cost', () => 'zalazane keeps killing me', () => 'do trolls really regenerate that fast lol',
  ];
  const LFG_HORDE = [() => 'LF2M Zalazane, need heals', () => 'LFM RFC need tank and heals', () => 'LF1M RFC heals then go', () => 'LFG RFC, lvl 10 warrior', () => 'LF healer for RFC', () => 'LF1M zalazane'];
  const ANSWERS = [
    { q: /where is (.+)\?/, a: (m) => [`${m[1]}? ${B.whereIs(m[1])}`, 'google it', 'same question lol'] },
    { q: /how do i get to stormwind/, a: () => ['follow the road north out of goldshire', 'take the road north, you cant miss it', 'hearth lol'] },
    { q: /how do i get to orgrimmar/, a: () => ['go north from razor hill', 'the big gate north of razor hill', 'follow the road north'] },
    { q: /zug zug|lok'tar|for the horde/, a: () => ['zug zug', "lok'tar!", 'FOR THE HORDE', 'dabu'] },
    { q: /reset talents/, a: () => ['no talents till 10', 'you dont have talents yet mate'] },
    { q: /mount/, a: () => ['40', 'lvl 40 and like 90g', '40, start saving now'] },
    { q: /bags/, a: () => ['check the AH in stormwind', 'tailors will sell you linen bags', 'i can make linen bags, pst'] },
    { q: /cooking/, a: () => ['innkeeper area in town', 'there is a cook in the inn'] },
    { q: /indo/, a: () => ['hadir', 'ada bang', 'wkwkwk ada', 'me'] },
    { q: /lag/, a: () => ['no', 'fine here', 'yes'] },
    { q: /mana/, a: () => ['drink between pulls', 'spirit gear', 'sit and drink my friend'] },
  ];
  const LFG = [
    (c) => `LF2M ${c.hogger ? 'Hogger' : 'Garrick Padfoot'}, need heals`,
    () => 'LFM Deadmines need tank and heals',
    () => 'LF1M DM need heals then go',
    () => 'LFG DM, lvl 10 rogue',
    () => 'tank LFG deadmines',
    () => 'LF healer for DM, full run',
    () => 'LFG anything',
    () => 'LF1M hogger',
    () => 'any priest wanna do DM?',
  ];
  const SAY_NEAR = [
    (c) => `anyone want to group for ${c.mobName}s?`,
    () => 'inv pls',
    () => 'hey',
    () => 'ty for the buff',
    () => 'argh, respawn is so slow',
    () => 'u can have this one',
    () => 'lol',
    () => 'got it',
    () => 'my bags are full already',
    () => 'brb',
    (c) => `watch out, ${c.mobName} packs here`,
  ];
  const GUILD = [
    () => 'evening all',
    () => 'anyone up for DM later?',
    () => 'grats on the ding!',
    () => 'who has spare linen, making bandages',
    () => 'guild bank when',
    () => 'lol',
    () => 'recruiting, tell your friends',
    () => 'finally 10',
    () => 'running DM at 9, need a healer',
    () => 'anyone wanna run Hogger',
    () => 'gn guys',
  ];
  const WHISPER = [
    (c) => `hey can you help me kill ${c ? c.namedMob : 'this rare'}? it keeps killing me`,
    () => 'u want to group?',
    () => 'nice gear lol',
    () => 'can i have 1 silver pls',
    () => 'Hello friend! Cheapest gold on the server, 1000g for $10, visit our site!',
    () => 'r u a bot?',
    () => 'join our guild? we are chill',
  ];

  B.whereIs = function (name) {
    const n = lower(name);
    for (const key in D.MOBS) {
      if (lower(D.MOBS[key].name) === n) {
        for (const p in D.PLACES) {
          const P = D.PLACES[p];
          if ((P.mobs || []).some((m) => m[0] === key) || (P.named && P.named[key])) return `${P.name}${P.zone === 'Elwynn Forest' && p !== 'goldshire' ? ' in elwynn' : ''}`;
        }
      }
    }
    for (const k in D.NPCS) if (lower(D.NPCS[k].name).includes(n)) return 'check the nearest town, they hang around the inn';
    return 'no idea';
  };

  function ctx(S) {
    const P = D.PLACES[S.player.place] || D.PLACES.northshire_abbey;
    const mobs = (P.mobs || []).map((m) => m[0]);
    // named mobs players ask about come from the zone you are in, never another faction's
    const region = P.region || 'elwynn';
    const namedAll = [...new Set(Object.values(D.PLACES).filter((p) => (p.region || 'elwynn') === region).flatMap((p) => Object.keys(p.named || {})).concat(Object.values(D.QUESTS).flatMap((q) => q.objs.filter((o) => o.type === 'kill' && D.MOBS[o.mob] && D.MOBS[o.mob].named).map((o) => o.mob))).filter((k) => { const pl = Object.values(D.PLACES).find((p) => (p.named || {})[k] || (p.mobs || []).some((m) => m[0] === k)); return !pl || (pl.region || 'elwynn') === region; }))];
    if (!namedAll.length) namedAll.push(region === 'elwynn' ? 'hogger' : Object.keys(D.MOBS).find((k) => D.MOBS[k].named) || 'hogger');
    const q = Object.keys(S.player.quests || {});
    const zoneNpcs = Object.values(D.PLACES).filter((p) => (p.region || 'elwynn') === (P.region || 'elwynn')).flatMap((p) => p.npcs || []);
    const npc = q.length ? D.NPCS[D.QUESTS[q[0]].turnin].name : D.NPCS[pick(zoneNpcs.length ? zoneNpcs : Object.keys(D.NPCS))].name;
    const affix = pick(D.AFFIXES).name;
    return {
      mobName: mobs.length ? D.MOBS[pick(mobs)].name : 'Kobold', namedMob: D.MOBS[pick(namedAll)].name, questNpc: npc,
      greenItem: `${pick(['Linen', 'Rawhide', 'Chainmail'])} ${pick(['Gloves', 'Boots', 'Belt'])} ${affix}`,
      hogger: S.player.level >= 8,
    };
  }

  // Emit one chat message into S.chat. from: bot | null (system)
  B.post = function (S, ch, from, text) {
    const m = { t: Date.now(), ch, from: from ? from.name : null, cls: from ? from.cls : null, fromId: from ? from.id : null, text };
    S.chat.push(m);
    if (ch === 'whisper' && from && from.name) S.lastWhisper = from.name;
    if (S.chat.length > 160) S.chat.splice(0, S.chat.length - 160);
    return m;
  };

  // Called every second. Schedules chatter.
  B.chatTick = function (S, now) {
    const T = S.chatTimers || (S.chatTimers = {});
    const date = new Date(now);
    const online = B.onlineCount(S, date);
    const busy = Math.min(1.6, 0.5 + online / 90);
    const c = ctx(S);
    const myF = (D.RACES[S.player.race] || {}).faction || 'alliance';
    const mineBots = S.bots.filter((b) => B.factionOf(b) === myF);
    const onl = () => { for (let i = 0; i < 12; i++) { const b = pick(mineBots); if (B.isOnline(b, date)) return b; } return pick(mineBots.length ? mineBots : S.bots); };
    c.horde = myF === 'horde';
    const due = (k, a, b) => { if (!T[k]) T[k] = now + (a + Math.random() * (b - a)) * 1000 / busy; if (now >= T[k]) { T[k] = 0; return true; } return false; };

    if (S.pending && S.pending.length) {
      const ready = S.pending.filter((p) => p.at <= now);
      S.pending = S.pending.filter((p) => p.at > now);
      for (const p of ready) {
        let bot;
        if (p.fromName) { const gm = S.group && S.group.members.find((m) => m.name === p.fromName); bot = { name: p.fromName, cls: gm ? gm.cls : null, id: p.bot }; }
        else bot = S.bots.find((b) => b.id === p.bot) || onl();
        B.post(S, p.ch, bot, p.text);
        if (p.onPost) p.onPost(bot);
      }
    }
    if (due('general', 9, 22)) {
      const b = onl();
      const ai = root.AI && chance(0.7) ? root.AI.take('general', root.AI.zoneKey()) : null;
      const text = sloppy(b, ai || pick(c.horde ? GENERAL_HORDE : GENERAL)(c));
      B.post(S, 'general', b, text);
      // sometimes someone answers
      for (const A of ANSWERS) {
        const mm = lower(text).match(A.q);
        if (mm && chance(0.75)) {
          const r = onl();
          S.pending = S.pending || [];
          S.pending.push({ at: now + 2500 + Math.random() * 5000, bot: r.id, ch: 'general', text: sloppy(r, pick(A.a(mm))) });
          break;
        }
      }
    }
    if (due('lfg', 18, 40)) {
      const b = onl();
      const ai = root.AI && chance(0.6) ? root.AI.take('lfg', root.AI.zoneKey()) : null;
      if (b.level >= 6) B.post(S, 'lfg', b, sloppy(b, ai || pick(c.horde ? LFG_HORDE : LFG)(c)));
    }
    if (due('say', 16, 38)) {
      const near = B.onlineIn(S, S.player.place, date).filter((b) => B.factionOf(b) === B.factionOf(S.player));
      if (near.length && !D.PLACES[S.player.place].safe || near.length > 2) { const b = pick(near.length ? near : [onl()]); B.post(S, 'say', b, sloppy(b, pick(SAY_NEAR)(c))); }
    }
    if (S.player.guild != null && S.player.guild >= 0 && due('guild', 30, 70)) {
      const mates = S.bots.filter((b) => b.guild === S.player.guild && B.isOnline(b, date));
      if (mates.length) { const b = pick(mates); B.post(S, 'guild', b, sloppy(b, pick(GUILD)(c))); }
    }
    if (due('whisper', 200, 480)) {
      const b = onl();
      const text = pick(WHISPER)(c);
      if (!(text.includes('guild') && S.player.guild >= 0)) B.post(S, 'whisper', b, text);
    }
  };

  // The player typed something. Bots may react.
  B.respond = function (S, ch, text) {
    const now = Date.now();
    const t = lower(text);
    const date = new Date(now);
    S.pending = S.pending || [];
    let near = ch === 'say' ? B.onlineIn(S, S.player.place, date).filter((b) => B.factionOf(b) === B.factionOf(S.player)) : ch === 'guild' ? S.bots.filter((b) => b.guild === S.player.guild && B.isOnline(b, date)) : ch === 'party' && S.group ? S.group.members.map((id) => S.bots.find((b) => b.id === id)).filter(Boolean) : S.bots.filter((b) => B.isOnline(b, date));
    if (ch === 'whisper') { const w = S.bots.find((b) => b.name === S.lastWhisper); near = w ? [w] : []; }
    if (!near.length) return;
    const say = (txt, delay, who) => { const b = who || pick(near); S.pending.push({ at: now + (delay || 1500 + Math.random() * 4000), bot: b.id, ch: ch === 'whisper' ? 'whisper' : ch, text: sloppy(b, txt) }); };
    if (/\b(hi|hello|hey|halo|sup|yo)\b/.test(t)) { say(pick(['hi', 'hey', 'sup', 'o/', 'hello', 'halo bang'])); if (chance(0.4)) say(pick(['hey there', 'hiya', 'yo']), 5000); return; }
    if (/\b(gz|grats|congrats)\b/.test(t)) { say(pick(['ty', 'thx', 'ty ty', ':)'])); return; }
    if (/\b(ty|thx|thanks|makasih)\b/.test(t)) { say(pick(['np', 'yw', 'anytime'])); return; }
    if (/\b(lol|lmao|wkwk)\b/.test(t)) { if (chance(0.5)) say(pick(['lol', 'haha', 'wkwkwk', 'xD'])); return; }
    if (/\?/.test(t)) {
      const m = t.match(/where (?:is|are) (?:the )?(.+?)\?/);
      if (m) { say(B.whereIs(m[1])); return; }
      say(pick(['no idea sorry', 'idk', 'check wowhead lol', 'ask in general', 'not sure', 'same question']));
      return;
    }
    if (/\b(inv|group|lfg|lf\dm|hogger|dm|deadmines)\b/.test(t)) {
      if (S.player.level >= 8) say(pick(['queue up in group finder, i will join', 'yeah sure, use the finder', 'i am in queue already']));
      else say(pick(['you are too low lol', 'come back at 8+', 'hogger will eat you']));
      return;
    }
    if (chance(0.45)) say(pick(['k', 'lol', 'ok', '?', 'true', 'fr', 'nice', 'same']));
  };

  // A short profile when you tap someone. The AI pack may replace it with a written one.
  B.bio = function (b) {
    const how = b.style === 'tryhard' ? 'Plays every day and pushes hard' : b.style === 'regular' ? 'Plays most evenings' : 'Logs in now and then, mostly to quest';
    const vibe = b.toxic > 0.6 ? 'Known to lose patience in groups.' : b.ninja ? 'Rolls need on a little too much.' : b.social > 0.7 ? 'Always up for a chat.' : b.social < 0.3 ? 'Keeps to themselves.' : 'Polite in groups.';
    return `${how}. ${vibe}`;
  };

  // Party banter hooks
  B.partyLine = function (bot, kind) {
    // banked AI lines first; ninjas keep their template excuses
    const aiKind = kind === 'wipe' && bot.toxic > 0.6 ? 'wipe_rude' : kind;
    if (root.AI && !(kind === 'loot' && bot.ninja) && chance(0.65)) { const l = root.AI.take('party', aiKind); if (l) return sloppy(bot, l); }
    const T = {
      hello: ['hi', 'hey all', 'yo', 'sup', 'hello', 'o/', 'halo'],
      pull: ['pulling', 'ready?', 'go go', 'inc', 'lets go'],
      wipe: bot.toxic > 0.6 ? ['healer??', 'wow', 'omg this group', 'who pulled that', 'gg noobs'] : ['lol wipe', 'oops', 'rip', 'my bad', 'run back?'],
      win: ['nice', 'ez', 'gj', 'yay', 'good'],
      loot: bot.ninja ? ['sorry misclick', 'i need it for offspec', 'lol'] : ['grats', 'gz', 'nice drop'],
      oom: ['oom', 'need mana', 'drinking'],
      bye: ['ty for group', 'gg', 'thanks all', 'gg wp', 'nice run'],
      leave: ['gtg sorry', 'i have to go', 'dinner, bye'],
      rage: ['this is a waste of time', 'im out', 'gg bad group'],
      afk: ['brb 1 min', 'phone sry', 'afk sec'],
    };
    return pick(T[kind] || ['...']);
  };

  root.B = B;
})(typeof window !== 'undefined' ? window : globalThis);
