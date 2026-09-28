// Working chat and guilds (v9.5). Bots post messages that carry an action (m.act): LFG posts you can join, whispers that
// ask for something (help with a kill, buy or sell an item, a question, a guild invite), trade posts, guild recruiting,
// and guild requests that earn guild standing. DOM-free; the UI (ui.js) turns m.act into buttons. Loads after game.js.
//   m.act = { kind, state: 'open'|'done'|'declined'|'expired', until, ...kind fields }
(function (root) {
  const SOC = root.SOC = {};
  const D = root.D, B = root.B, G = root.G;
  const now = () => Date.now();
  const rnd = (a, b) => a + Math.random() * (b - a), rint = (a, b) => Math.floor(rnd(a, b + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)];
  const chance = (p) => Math.random() < p;
  const link = (it) => B.link(it.name, it.q || 1);
  const coin = (c) => G.moneyText(c);

  // ------------------------------------------------------------ guilds: who they are
  // Each guild has a style and a level floor; applications below the floor are turned down.
  const STYLE = ['casual', 'leveling', 'dungeons', 'raiding', 'pvp', 'social'];
  SOC.guildInfo = function (g) {
    const S = G.S, name = B.GUILDS[g];
    const x = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const style = STYLE[x % STYLE.length];
    const min = style === 'raiding' ? 40 : style === 'dungeons' ? 15 : style === 'pvp' ? 20 : style === 'leveling' ? 5 : 1;
    const members = S.bots.filter((b) => b.guild === g);
    const online = members.filter((b) => B.isOnline(b, new Date())).length;
    const officer = members.slice().sort((a, b) => b.level - a.level)[0] || null;
    const blurb = { casual: 'Chill people, no pressure. We help each other level.', leveling: 'New and levelling players welcome. We run low dungeons every night.', dungeons: 'Dungeon runs every evening. Bring your role, we bring the rest.', raiding: 'Endgame raids three nights a week. Level 40+.', pvp: 'War Mode on, always. For the glory.', social: 'A friendly bunch who mostly talk and sometimes quest.' }[style];
    return { g, name, style, min, members: members.length, online, officer, blurb, faction: B.GUILD_FACTION[g] };
  };
  SOC.myGuilds = () => B.GUILDS.map((_, g) => g).filter((g) => B.GUILD_FACTION[g] === G.myFaction()).map(SOC.guildInfo);

  // ------------------------------------------------------------ standing inside your guild
  const RANKS = [{ name: 'Initiate', at: 0 }, { name: 'Member', at: 100, perk: '+3% experience' }, { name: 'Veteran', at: 300, perk: '+5% gold from quests' },
    { name: 'Officer', at: 700, perk: 'guild runs give +5 Mentor Marks' }, { name: 'Champion', at: 1500, perk: 'the title "Champion of the Guild"' }];
  SOC.RANKS = RANKS;
  SOC.standing = () => { const P = G.S && G.S.player; return P && P.guild >= 0 ? (P.guildRep || 0) : 0; };
  SOC.rank = () => { const s = SOC.standing(); if (!G.S || G.S.player.guild < 0) return -1; let r = 0; RANKS.forEach((k, i) => { if (s >= k.at) r = i; }); return r; };
  SOC.perk = (kind) => { const r = SOC.rank(); if (kind === 'xp') return r >= 1 ? 3 : 0; if (kind === 'gold') return r >= 2 ? 5 : 0; if (kind === 'marks') return r >= 3 ? 5 : 0; return 0; };
  function addStanding(n, why) {
    const P = G.S.player; if (P.guild < 0) return;
    const r0 = SOC.rank();
    P.guildRep = (P.guildRep || 0) + n;
    G.sys && G.sys(`+${n} guild standing${why ? ' (' + why + ')' : ''}.`);
    const r1 = SOC.rank();
    if (r1 > r0) { post('guild', guildOfficer(), pick([`congrats on ${RANKS[r1].name} rank!`, `promoted you to ${RANKS[r1].name}, well earned`, `${RANKS[r1].name} now, nice work`])); G.toast && G.toast(`Guild rank: ${RANKS[r1].name}. ${RANKS[r1].perk ? 'New perk: ' + RANKS[r1].perk + '.' : ''}`, true); }
  }
  SOC.addStanding = addStanding;
  const guildOfficer = () => { const P = G.S.player; const info = SOC.guildInfo(P.guild); return info.officer || onlineMate() || pick(G.S.bots); };
  const onlineMate = () => { const S = G.S, d = new Date(); const m = S.bots.filter((b) => b.guild === S.player.guild && B.isOnline(b, d)); return m.length ? pick(m) : null; };

  SOC.leaveGuild = function () {
    const S = G.S, P = S.player; if (P.guild < 0) return;
    const name = B.GUILDS[P.guild];
    P.guild = -1; P.guildRep = 0;
    for (const m of S.chat) if (m.act && m.act.guild && m.act.state === 'open') m.act.state = 'expired';
    G.sys(`You have left ${name}.`);
    G.emitChange();
  };
  // Apply: an officer answers in a little while. Turned down below the level floor.
  SOC.apply = function (g) {
    const S = G.S, P = S.player;
    if (P.guild >= 0) return G.toast('Leave your guild first.');
    const info = SOC.guildInfo(g);
    const soc = state();
    if (soc.applied && soc.applied.until > now()) return G.toast(`You already applied to <${B.GUILDS[soc.applied.g]}>. Wait for an answer.`);
    soc.applied = { g, until: now() + 5 * 60000 };
    G.sys(`You applied to <${info.name}>.`);
    const off = info.officer || pick(S.bots);
    const yes = P.level >= info.min;
    S.pending.push({ at: now() + rnd(15000, 45000), bot: off.id, ch: 'whisper',
      text: yes ? pick([`hey, saw your application to <${info.name}>. welcome aboard!`, `accepted! welcome to <${info.name}>`, 'welcome in, sending the invite now']) : pick([`sorry, <${info.name}> is ${info.min}+ only. come back later!`, `thanks for applying but we need level ${info.min}+`]),
      onPost: () => { soc.applied = null; if (yes && G.S.player.guild < 0) G.joinGuild(g); } });
    G.emitChange();
  };

  // ------------------------------------------------------------ state and helpers
  function state() { const S = G.S; return S.soc || (S.soc = { next: {}, applied: null, invites: 0 }); }
  function post(ch, bot, text, act) {
    const m = B.post(G.S, ch, bot, text);
    if (m && act) { m.act = Object.assign({ state: 'open', until: now() + 5 * 60000 }, act); }
    G.emitChat && G.emitChat();
    return m;
  }
  const myBots = () => { const S = G.S, f = G.myFaction(), d = new Date(); return S.bots.filter((b) => B.factionOf(b) === f && B.isOnline(b, d)); };
  const openActs = (pred) => G.S.chat.filter((m) => m.act && m.act.state === 'open' && (!pred || pred(m.act)));
  const due = (k, a, b) => { const n = state().next; const t = now(); if (!n[k]) n[k] = t + rnd(a, b) * 1000; if (t >= n[k]) { n[k] = 0; return true; } return false; };
  const roleWord = (r) => (r === 'tank' ? 'tank' : r === 'healer' ? 'healer' : 'dps');

  // activities you could do now (level fits, you can reach the place or be summoned there)
  function joinableActs(opts) {
    const P = G.S.player;
    return Object.keys(D.ACTIVITIES).filter((k) => {
      const A = D.ACTIVITIES[k];
      if (A.needQuest) return false;
      if (opts && opts.dungeonOnly && !A.dungeon) return false;
      if (P.level < A.minLvl || P.level > A.maxLvl + 3) return false;
      const why = G.activityBlock(k);
      return why !== 'hidden' && !/^Requires/.test(why || '');
    });
  }
  // mobs near your level in places you can reach, for "help me kill" requests
  function huntTarget() {
    const P = G.S.player;
    let places = Object.keys(D.PLACES).filter((k) => { const p = D.PLACES[k]; return !p.safe && p.lvl && (p.mobs || []).length && p.lvl[0] <= P.level + 1 && p.lvl[1] >= P.level - 2 && G.canReach(P.place, k); });
    // someone nearby: your own zone first, then anywhere within a couple of minutes' travel
    const region = (D.PLACES[P.place] || {}).region;
    const near = places.filter((k) => D.PLACES[k].region === region);
    const close = places.filter((k) => { const r = G.route(P.place, k); return r && r.secs <= 120; });
    places = near.length ? near : close.length ? close : places;
    if (!places.length) return null;
    const pl = pick(places); const mob = pick(D.PLACES[pl].mobs)[0];
    return { place: pl, mob, n: rint(4, 8) };
  }
  // trade goods and bags in your pack that someone might want
  const sellable = () => G.S.player.bags.filter((b) => b.item && (b.item.slot === 'mat') && !b.item.noSell);

  // ------------------------------------------------------------ the generator
  SOC.tick = function () {
    const S = G.S; if (!S || !S.player) return;
    const P = S.player, t = now();
    // expire old requests
    for (const m of S.chat) if (m.act && m.act.state === 'open' && m.act.until < t) { m.act.state = 'expired'; if (m.act.kind === 'help_kill' && m.act.accepted) finishHelp(m, false); }
    if (G.fight || S.run) return;
    // LFG: a real group looking for someone like you
    if (P.level >= 8 && due('lfg', 45, 100) && openActs((a) => a.kind === 'lfg').length < 2) makeLfg();
    // whispers with a request, at most one open at a time
    if (P.level >= 4 && due('whisper', 150, 320) && !openActs((a) => a.whisper).length) makeWhisper();
    // trade and recruiting posts in general
    if (P.level >= 5 && due('trade', 140, 300)) makeTrade();
    if (P.guild < 0 && P.level >= 5 && due('recruit', 480, 900)) makeRecruit();
    // guild requests
    if (P.guild >= 0 && due('guildreq', 120, 260) && openActs((a) => a.guild).length < 2) makeGuildRequest();
  };

  function makeLfg(guild) {
    const P = G.S.player;
    const acts = joinableActs();
    if (!acts.length) return;
    const k = pick(acts), A = D.ACTIVITIES[k];
    const bots = guild ? G.S.bots.filter((b) => b.guild === P.guild && B.isOnline(b, new Date())) : myBots();
    const lead = pick(bots.filter((b) => b.level >= A.minLvl - 2)) || pick(bots);
    if (!lead) return;
    const role = pick(G.roles());
    const size = A.size || 5, have = rint(1, size - 1);
    const text = guild ? pick([`anyone want to run ${A.name}? need a ${roleWord(role)}`, `${A.name} with guildies, need ${roleWord(role)}, who's in?`, `guild run: ${A.name}, ${have}/${size}, need ${roleWord(role)}`])
      : pick([`LF1M ${roleWord(role)} ${A.name}, ${have}/${size}`, `LFM ${A.name}, need ${roleWord(role)} then go`, `${A.name} needs a ${roleWord(role)}! pst`, `LF ${roleWord(role)} for ${A.name}, quick run`]);
    post(guild ? 'guild' : 'lfg', lead, text, { kind: 'lfg', act: k, role, leader: lead.id, guild: !!guild, until: now() + 4 * 60000 });
  }
  function makeWhisper() {
    const S = G.S, P = S.player;
    const kinds = [];
    if (huntTarget()) kinds.push('help_kill', 'help_kill');
    if (sellable().length) kinds.push('wtb', 'wtb');
    if (P.level >= 6) kinds.push('wts');
    kinds.push('where');
    if (P.guild < 0 && (state().invites || 0) < 6) kinds.push('guild_invite');
    const kind = pick(kinds);
    const b = pick(myBots()); if (!b) return;
    if (kind === 'help_kill') {
      const h = huntTarget(); const M = D.MOBS[h.mob]; const pay = Math.round(M.lvl[1] * 12 * h.n + 50);
      post('whisper', b, pick([`hey can u help me kill ${h.n} ${M.name} at ${D.PLACES[h.place].name}? ill pay ${coin(pay)}`, `need help with ${h.n} ${M.name} (${D.PLACES[h.place].name}), group up? ${coin(pay)} for ur time`]),
        Object.assign({ kind: 'help_kill', whisper: true, bot: b.id, until: now() + 15 * 60000, pay, got: 0 }, h));
    } else if (kind === 'wtb') {
      const bag = pick(sellable()); const it = bag.item; const n = Math.min(bag.n, rint(5, 20)); const price = Math.max(n * 3, Math.round((it.sell || 1) * n * rnd(2.5, 4)));
      post('whisper', b, pick([`hey u have ${link(it)}? ill buy ${n} for ${coin(price)}`, `wtb ${n} ${link(it)} for ${coin(price)}, u selling?`]), { kind: 'wtb', whisper: true, bot: b.id, item: it.id, n, price });
    } else if (kind === 'wts') {
      const it = offerItem(); if (!it) return;
      const price = Math.round((it.sell || 10) * rnd(4, 6));
      post('whisper', b, pick([`wts ${link(it)} ${coin(price)}, good for a ${D.CLASSES[P.cls].name.toLowerCase()} ur level`, `hey, want ${link(it)}? ${coin(price)} and its yours`]), { kind: 'wts', whisper: true, bot: b.id, itemData: it, price });
    } else if (kind === 'where') {
      const q = whereQuestion(); if (!q) return;
      post('whisper', b, pick([`sorry to bother, where is ${q.name}?`, `hey do u know where ${q.name} is?`, `quick q: where do i find ${q.name}?`]), Object.assign({ kind: 'where', whisper: true, bot: b.id }, q));
    } else if (kind === 'guild_invite') {
      const gs = SOC.myGuilds().filter((x) => P.level >= x.min); if (!gs.length) return;
      const g = pick(gs); const inv = g.officer || b;
      state().invites = (state().invites || 0) + 1;
      post('whisper', inv, pick([`hey! want to join <${g.name}>? ${g.blurb.toLowerCase()}`, `we're recruiting for <${g.name}>, ${g.style} guild. want an invite?`]), { kind: 'guild_invite', whisper: true, bot: inv.id, g: g.g });
    }
  }
  function makeTrade() {
    const b = pick(myBots()); if (!b) return;
    const it = offerItem(); if (!it) return;
    const price = Math.round((it.sell || 10) * rnd(4.5, 7));
    post('general', b, pick([`WTS ${link(it)} ${coin(price)} pst`, `selling ${link(it)}, ${coin(price)}`, `${link(it)} for ${coin(price)}, anyone?`]), { kind: 'wts', bot: b.id, itemData: it, price, until: now() + 6 * 60000 });
  }
  function makeRecruit() {
    const P = G.S.player;
    const gs = SOC.myGuilds().filter((x) => x.members > 0); if (!gs.length) return;
    const g = pick(gs); const who = g.officer || pick(myBots()); if (!who) return;
    post('general', who, pick([`<${g.name}> is recruiting! ${g.style} guild, level ${g.min}+, pst`, `<${g.name}> ${g.blurb.toLowerCase()} whisper me for an invite`, `looking for more people for <${g.name}>, ${g.min}+ welcome`]), { kind: 'guild_apply', bot: who.id, g: g.g, until: now() + 8 * 60000 });
  }
  function makeGuildRequest() {
    const S = G.S, P = S.player;
    const mate = onlineMate(); if (!mate) return;
    const kinds = ['g_run', 'g_mats', 'g_help', 'g_where'];
    const kind = pick(kinds);
    if (kind === 'g_run') { if (joinableActs({ dungeonOnly: true }).length) return makeLfg(true); return; }
    if (kind === 'g_mats') {
      const mats = Object.keys(D.ITEMS).filter((k) => D.ITEMS[k].slot === 'mat' && (D.ITEMS[k].lvl || 1) <= P.level + 5);
      const have = sellable().filter((b) => b.n >= 5);
      const it = have.length && chance(0.7) ? pick(have).item : D.ITEMS[pick(mats.length ? mats : ['linen_cloth'])];
      if (!it) return;
      const n = rint(5, 15);
      post('guild', mate, pick([`can anyone spare ${n} ${link(it)}? need them for crafting`, `looking for ${n} ${link(it)}, will pay back`, `anyone got ${n} ${link(it)} lying around?`]), { kind: 'g_mats', guild: true, bot: mate.id, item: it.id, n, pay: Math.round((it.sell || 1) * n * 3), until: now() + 12 * 60000 });
      return;
    }
    if (kind === 'g_help') {
      const h = huntTarget(); if (!h) return; const M = D.MOBS[h.mob];
      post('guild', mate, pick([`anyone free to help me with ${h.n} ${M.name} at ${D.PLACES[h.place].name}?`, `need a hand: ${h.n} ${M.name}, ${D.PLACES[h.place].name}`]), Object.assign({ kind: 'help_kill', guild: true, bot: mate.id, until: now() + 15 * 60000, pay: Math.round(M.lvl[1] * 8 * h.n), got: 0 }, h));
      return;
    }
    const q = whereQuestion(); if (!q) return;
    post('guild', mate, pick([`where is ${q.name} again?`, `guild, where do i find ${q.name}?`]), Object.assign({ kind: 'where', guild: true, bot: mate.id }, q));
  }
  // a green for your class and level, or a bag
  function offerItem() {
    const P = G.S.player;
    if (chance(0.25) && D.ITEMS.small_pouch) return G.copyItem(P.level >= 20 && D.ITEMS.linen_bag ? 'linen_bag' : 'small_pouch');
    const C = D.CLASSES[P.cls];
    const slot = pick(['chest', 'legs', 'feet', 'hands', 'wrist', 'waist', 'back', 'weapon']);
    const it = G.genGear(slot, Math.max(2, P.level + rint(-1, 1)), 2, slot === 'weapon' ? { wtype: pick(C.weapons) } : slot === 'back' ? {} : { atype: C.armorType });
    return it;
  }
  // "where is X?": a place in the world near your level; the right answer is its zone
  function whereQuestion() {
    const P = G.S.player;
    const places = Object.keys(D.PLACES).filter((k) => { const p = D.PLACES[k]; return p.lvl && p.lvl[0] <= P.level + 6 && p.lvl[1] >= P.level - 12 && p.zone && !G.enemyTown(k); });
    if (!places.length) return null;
    const k = pick(places), p = D.PLACES[k];
    const zones = [...new Set(Object.values(D.PLACES).map((x) => x.zone).filter((z) => z && z !== p.zone))];
    const wrong = []; while (wrong.length < 2 && zones.length) { const z = zones.splice(Math.floor(Math.random() * zones.length), 1)[0]; wrong.push(z); }
    const answers = [p.zone, ...wrong].sort(() => Math.random() - 0.5);
    return { place: k, name: p.name, answer: p.zone, answers };
  }

  // ------------------------------------------------------------ doing what a message asks
  const msgById = (id) => G.S.chat.find((m) => m.id === id);
  const botById = (id) => G.S.bots.find((b) => b.id === id);
  // The buttons a message offers: [{ label, primary, fn }] (fn returns a toast text or nothing)
  SOC.actions = function (m) {
    const a = m && m.act; if (!a || a.state !== 'open') return [];
    const S = G.S, P = S.player;
    const b = botById(a.bot || a.leader);
    const reply = (text) => { if (b) S.pending.push({ at: now() + rnd(1200, 2800), bot: b.id, ch: m.ch === 'lfg' || m.ch === 'general' ? 'whisper' : m.ch, text }); };
    const close = (st) => { a.state = st || 'done'; G.emitChange(); };
    const decline = { label: 'No thanks', fn: () => { close('declined'); if (b && (a.whisper || a.guild) && chance(0.6)) reply(pick(['np', 'ok no worries', 'all good', 'k'])); } };
    if (a.kind === 'lfg') {
      const A = D.ACTIVITIES[a.act];
      return [{ label: `Join as ${a.role === 'dps' ? 'Damage' : a.role === 'tank' ? 'Tank' : 'Healer'}`, primary: true, fn: () => { if (G.joinChatGroup(a.act, a.role, { leader: a.leader, guild: a.guild ? P.guild : null, soc: a.guild ? { kind: 'g_run' } : null })) close(); } }, decline];
    }
    if (a.kind === 'help_kill') {
      if (a.accepted) return [{ label: 'Cancel', fn: () => { finishHelp(m, false); close('declined'); } }];
      return [{ label: 'Help', primary: true, fn: () => {
        if (S.run || S.queue) return 'Not while in the group finder.';
        if (G.partySize() >= 3) return 'Your party is full.';
        a.accepted = true; a.until = now() + 15 * 60000;
        if (b) G.addToParty(b);
        reply(pick(['omg ty! meet me there', 'thanks!! on my way', 'ty, lets go']));
        G.sys(`${b ? b.name : 'They'} joined your party. Kill ${a.n} ${D.MOBS[a.mob].name} at ${D.PLACES[a.place].name}.`);
        G.emitChange();
        if (P.place !== a.place) return 'route:' + a.place;
      } }, decline];
    }
    if (a.kind === 'wtb') {
      const have = G.countItem(a.item);
      return [{ label: have >= a.n ? `Sell ${a.n} for ${coin(a.price)}` : `You have ${have}/${a.n}`, primary: true, disabled: have < a.n, fn: () => {
        if (G.countItem(a.item) < a.n) return `You need ${a.n}.`;
        G.removeItem(a.item, a.n); P.money += a.price;
        G.sys(`You sold ${a.n} ${D.ITEMS[a.item].name} to ${b ? b.name : 'them'} for ${coin(a.price)}.`);
        reply(pick(['ty!', 'pleasure doing business', 'thx a lot']));
        close();
      } }, decline];
    }
    if (a.kind === 'wts') {
      return [{ label: `Buy for ${coin(a.price)}`, primary: true, disabled: P.money < a.price, fn: () => {
        if (P.money < a.price) return 'Not enough money.';
        if (G.bagsFull()) return 'Your bags are full.';
        P.money -= a.price; G.addItem(JSON.parse(JSON.stringify(a.itemData)), 1);
        G.sys(`You bought ${a.itemData.name} from ${b ? b.name : 'them'} for ${coin(a.price)}.`);
        reply(pick(['ty!', 'enjoy', 'gl with it']));
        close();
      } }, decline];
    }
    if (a.kind === 'where') {
      return a.answers.map((z) => ({ label: z, fn: () => {
        const right = z === a.answer;
        G.say(m.ch === 'guild' ? 'guild' : 'whisper', `it's in ${z}`, b && b.name);
        if (right) { reply(pick(['oh ty!!', 'thanks a lot', 'found it, ty'])); if (a.guild) addStanding(5, 'helped a guildmate'); else if (G.addMarks) G.addMarks(1, 'helped someone find their way'); }
        else reply(pick(['hm pretty sure thats not it lol', 'u sure? cant find it', 'nope not there']));
        close(right ? 'done' : 'declined');
      } })).concat([decline]);
    }
    if (a.kind === 'guild_invite') {
      return [{ label: `Join <${B.GUILDS[a.g]}>`, primary: true, disabled: P.guild >= 0, fn: () => { if (P.guild >= 0) return 'You are already in a guild.'; G.joinGuild(a.g); close(); } }, decline];
    }
    if (a.kind === 'guild_apply') {
      return [{ label: `Apply to <${B.GUILDS[a.g]}>`, primary: true, disabled: P.guild >= 0, fn: () => { SOC.apply(a.g); close(); } }, decline];
    }
    if (a.kind === 'g_mats') {
      const have = G.countItem(a.item);
      return [{ label: have >= a.n ? `Give ${a.n}` : `You have ${have}/${a.n}`, primary: true, disabled: have < a.n, fn: () => {
        if (G.countItem(a.item) < a.n) return `You need ${a.n}.`;
        G.removeItem(a.item, a.n); P.money += a.pay;
        G.sys(`You gave ${a.n} ${D.ITEMS[a.item].name} to ${b ? b.name : 'your guildmate'}; they paid you ${coin(a.pay)}.`);
        reply(pick(['ur the best, ty', 'thank u!!', 'lifesaver']));
        addStanding(20, 'materials for the guild');
        close();
      } }, decline];
    }
    return [];
  };
  function finishHelp(m, ok) {
    const a = m.act, S = G.S, P = S.player, b = botById(a.bot);
    a.accepted = false;
    if (S.wparty && b) { const i = S.wparty.members.findIndex((x) => x.bot.id === b.id); if (i >= 0) { S.wparty.members.splice(i, 1); if (!S.wparty.members.length) S.wparty = null; } }
    if (ok) {
      P.money += a.pay;
      G.sys(`${b ? b.name : 'They'} paid you ${coin(a.pay)} for the help.`);
      if (b) S.pending.push({ at: now() + 1500, bot: b.id, ch: a.guild ? 'guild' : 'whisper', text: pick(['thanks so much!! sent u the gold', 'done! ty, here u go', 'couldnt have done it without u']) });
      if (a.guild) addStanding(25, 'helped a guildmate');
      if (G.addMarks && !a.guild) G.addMarks(2, 'helped another player');
    } else if (b) S.pending.push({ at: now() + 1500, bot: b.id, ch: a.guild ? 'guild' : 'whisper', text: pick(['no worries, gotta go', 'ok ill find someone else', 'np, maybe later']) });
    G.emitChange();
  }
  // Kills count toward an accepted "help me kill" request.
  SOC.onKill = function (mob) {
    for (const m of openActs((a) => a.kind === 'help_kill' && a.accepted && a.mob === mob)) {
      m.act.got++;
      if (m.act.got >= m.act.n) { m.act.state = 'done'; finishHelp(m, true); }
      else if (m.act.got === Math.ceil(m.act.n / 2)) { const b = botById(m.act.bot); if (b) G.S.pending.push({ at: now() + 800, bot: b.id, ch: 'party', text: pick(['halfway there', 'nice, keep going', `${m.act.got}/${m.act.n}`]) }); }
    }
  };
  // A guild run you joined from guild chat pays standing (and Mentor Marks for officers).
  SOC.onRunComplete = function (d) {
    if (!d || !d.soc || d.soc.kind !== 'g_run') return;
    addStanding(40, 'a guild run');
    const bonus = SOC.perk('marks'); if (bonus && G.addMarks) G.addMarks(bonus, 'guild run');
  };

  G.on('kill', (d) => { try { SOC.onKill(d.mob); } catch (e) { console.error(e); } });
  G.on('runComplete', (d) => { try { SOC.onRunComplete(d); } catch (e) { console.error(e); } });

  // ------------------------------------------------------------ quick replies (for any message from someone)
  SOC.replies = function (m) {
    if (!m || !m.from || m.me) return [];
    const t = (m.text || '').toLowerCase();
    const ch = m.ch === 'whisper' ? 'whisper' : m.ch === 'party' ? 'party' : m.ch === 'guild' ? 'guild' : m.ch === 'say' ? 'say' : 'whisper';
    let opts;
    if (/\b(hi|hey|hello|yo|sup|o\/|wb)\b/.test(t)) opts = ['hey!', 'o/', 'hi :)'];
    else if (/\?/.test(t)) opts = ['no idea sorry', 'yes', 'no', 'check the map'];
    else if (/\b(ty|thx|thanks)\b/.test(t)) opts = ['np', 'anytime', 'yw'];
    else if (/\b(gz|grats|congrats)\b/.test(t)) opts = ['ty!', 'thanks :)'];
    else if (/\b(lol|haha|lmao|wkwk)\b/.test(t)) opts = ['lol', 'haha', 'xD'];
    else opts = ['lol', 'true', 'nice', 'same'];
    return opts.map((txt) => ({ label: txt, ch, fn: () => { if (ch === 'whisper') G.S.lastWhisper = m.from; G.say(ch, txt, ch === 'whisper' ? m.from : undefined); } }));
  };
})(typeof window !== 'undefined' ? window : globalThis);
