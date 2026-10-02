// Trials (v10.4): level-60 challenge runs of any dungeon, in monthly seasons named by their month ("October 2026").
// Everything here is worked out from the date and the game data alone (no stored state), so every device agrees and a
// dungeon added mid-season joins the next season. Design: docs/plans/2026-09-30-trials-design.md
(function (root) {
  const T = (root.TRIALS = {});
  const D = root.D;
  T.FIRST = { y: 2026, m: 9 }; // October 2026, the first season
  T.SIZE = 8; // dungeons per season
  T.NEW_PER = 4; // dungeons never in a season that are guaranteed a place, per season
  T.PAR = 1; // a Trial's par is the dungeon's own data par (normal runs use G.par, 15% shorter)
  T.par = (Dg, omens) => { const p = Dg && (Dg.trialPar || Dg.par); return p ? Math.round(p * T.PAR * (omens && omens.includes('hasty') ? T.OMENS.hasty.par : 1)) : 0; }; // Hasty: shorter par. trialPar: a dungeon's par for Trials when its normal par was retuned (v10.10, issue #28 kept Trials as tuned)
  T.BASE = 0.9; T.STEP = 1.05; // enemy health and damage: BASE at Trial 1, then STEP per level, compounding (tuned by sim/trialpace.js)
  T.LAUNCH = '2026-10-01'; // the `since` date of every dungeon that existed when Trials began
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---- the calendar: season k is the k-th month from October 2026; Omen periods start on the 1st, 8th, 15th and 22nd
  T.season = (date) => { const d = date || new Date(); return (d.getFullYear() - T.FIRST.y) * 12 + d.getMonth() - T.FIRST.m; };
  // The Preseason (season -1): a one-day trial run on the beta, from 30 September 2026 until October begins. It counts
  // like a season (its own picks, rating, history) but gives no month-end rank title, and it never touches October's picks.
  T.PRESEASON = { y: 2026, m: 8, d: 30 };
  T.open = (k) => k >= 0 || (k === -1 && Date.now() >= new Date(T.PRESEASON.y, T.PRESEASON.m, T.PRESEASON.d).getTime());
  T.start = (k) => (k === -1 ? new Date(T.PRESEASON.y, T.PRESEASON.m, T.PRESEASON.d) : new Date(T.FIRST.y, T.FIRST.m + k, 1));
  T.end = (k) => T.start(k + 1);
  T.name = (k) => { if (k === -1) return 'Preseason'; const s = T.start(k); return `${MONTHS[s.getMonth()]} ${s.getFullYear()}`; };
  T.daysLeft = (date) => { const d = date || new Date(); return Math.max(0, Math.ceil((T.end(T.season(d)) - d) / 86400000)); };
  T.monthFrac = (date) => { const d = date || new Date(), k = T.season(d), a = T.start(k), b = T.end(k); return Math.min(1, Math.max(0, (d - a) / (b - a))); };
  T.period = (date) => { const d = date || new Date(), k = T.season(d), day = d.getDate(), p = day < 8 ? 0 : day < 15 ? 1 : day < 22 ? 2 : 3; return { k, p, id: k * 4 + p }; };

  // ---- which dungeons a season holds
  const sinceOf = (act) => { const Dg = D.DUNGEONS[D.ACTIVITIES[act].dungeon]; return (Dg && Dg.since) || T.LAUNCH; };
  const dayOf = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  // A faction's reachable places, by the game's own road rule (G.reachableRegions): enemy towns are closed. The storm
  // over the isle is a player's own progress, so it is checked when you queue, not here.
  const placeFaction = (id) => { const p = D.PLACES[id]; if (!p) return null; if (p.faction) return p.faction; const f = (D.REGIONS[p.region] || {}).faction; return (p.safe || p.city) && f && f !== 'contested' ? f : null; };
  let reachMemo = null;
  const reachOf = function (faction) {
    reachMemo = reachMemo || {};
    if (reachMemo[faction]) return reachMemo[faction];
    const q = Object.values(D.RACES).filter((r) => r.faction === faction && D.PLACES[r.start]).map((r) => r.start), seen = new Set(q);
    while (q.length) { const k = q.shift(); for (const to in (D.PLACES[k].links || {})) { const pf = placeFaction(to); if (D.PLACES[to] && !seen.has(to) && !(pf && pf !== faction)) { seen.add(to); q.push(to); } } }
    return (reachMemo[faction] = seen);
  };
  // every 5-player dungeon this faction can reach (shared ones and its own), that is not a Legend's story fight. Each
  // faction has its own season picks: only 8 dungeons are open to both, which would make every season the same.
  T.eligible = function (faction) {
    return Object.keys(D.ACTIVITIES).filter((k) => {
      const A = D.ACTIVITIES[k], Dg = A.dungeon && D.DUNGEONS[A.dungeon];
      return Dg && !Dg.raid && (A.size || 5) === 5 && !A.needQuest && A.where && reachOf(faction).has(A.where);
    }).sort((a, b) => (sinceOf(a) < sinceOf(b) ? -1 : sinceOf(a) > sinceOf(b) ? 1 : a < b ? -1 : 1));
  };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const memo = {};
  // Replays the rule from the first season: dungeons added after launch and never picked go first (up to NEW_PER a
  // season, oldest first); the other places are drawn with a weight that grows with the seasons a dungeon has waited.
  T.picks = function (k, faction) {
    if (k === -1) { const all = T.eligible(faction).filter((a) => dayOf(sinceOf(a)) <= dayOf(T.LAUNCH)), r = rng(4049 + (faction === 'horde' ? 17 : 0)), out = []; const rest = all.slice(); while (out.length < T.SIZE && rest.length) out.push(rest.splice(Math.floor(r() * rest.length), 1)[0]); return out; } // the Preseason: 8 at random, no history
    if (k < 0) return [];
    const all = T.eligible(faction), sig = all.map((a) => a + '@' + sinceOf(a)).join(',');
    if (!memo[faction] || memo[faction].sig !== sig) memo[faction] = { sig, seasons: [], last: {} };
    const M = memo[faction];
    for (let j = M.seasons.length; j <= k; j++) {
      const start = T.start(j), open = all.filter((a) => dayOf(sinceOf(a)) <= start), last = M.last;
      const allFresh = open.filter((a) => last[a] == null && dayOf(sinceOf(a)) > dayOf(T.LAUNCH)), fresh = allFresh.slice(0, T.NEW_PER);
      const out = fresh.slice(), r = rng(7919 * (j + 1) + (faction === 'horde' ? 17 : 0));
      let rest = open.filter((a) => !allFresh.includes(a)); // new ones past the guarantee wait for next season's
      while (out.length < T.SIZE && rest.length) {
        const w = rest.map((a) => { const waited = j - (last[a] == null ? -1 : last[a]); return waited * waited; });
        let x = r() * w.reduce((s, v) => s + v, 0), i = 0;
        while (i < rest.length - 1 && x >= w[i]) { x -= w[i]; i++; }
        out.push(rest[i]); rest = rest.filter((_, n) => n !== i);
      }
      for (const a of out) last[a] = j;
      M.seasons[j] = out;
    }
    return M.seasons[k].slice();
  };

  // ---- Omens: this week's rules. `counter` is for the design and the sims only: the game shows the rule and never
  // tells players how to beat it (docs/design-mindset.md). One per tier, each from its own Trial level; a tier tests one lever (tier 1: what to
  // kill first). The list is open: a new Omen joins the rotation from the next period (content-proof).
  T.OMENS = {
    mending: { tier: 1, off: true, icon: 'renew', name: 'Mending', below: 0.5, rate: 0.02, text: (O) => `Wounded enemies (below ${Math.round(O.below * 100)}% health) heal ${Math.round(O.rate * 100)}% of their health every second.`, counter: 'Kill order: one at a time, so none sits wounded for long.' },
    frenzied: { tier: 1, off: true, icon: 'berserker_rage', name: 'Frenzied', below: 0.35, dmg: 2, text: (O) => `Enemies below ${Math.round(O.below * 100)}% health deal ${O.dmg === 2 ? 'double' : Math.round((O.dmg - 1) * 100) + '% more'} damage.`, counter: 'Kill order: one at a time, so only one enemy is low at once.' },
    rallying: { tier: 1, off: true, icon: 'rallying_cry', name: 'Rallying', heal: 0, dmg: 0.5, text: (O) => `When an enemy dies, the rest of its pull hit ${Math.round(O.dmg * 100)}% harder (this adds up).`, counter: 'Kill order: spread, so they fall together.' },
    guarded: { tier: 1, icon: 'shield_wall', name: 'Guarded', taken: 0.5, text: (O) => `Bosses take ${Math.round((1 - O.taken) * 100)}% less damage while any other enemy in their pull is alive.`, counter: 'Boss plan: adds first.' },
    enraging: { tier: 1, icon: 'berserker_rage', name: 'Enraging', every: 8, dmg: 0.25, text: (O) => `Bosses hit ${Math.round(O.dmg * 100)}% harder every ${O.every} seconds of the fight.`, counter: 'Boss plan: burn the boss.' },
    // Tier 2, from Trial 5: pull pace (careful / normal / fast)
    volatile: { tier: 2, icon: 'fire_nova_totem', name: 'Volatile', delay: 3, blast: 0.25, text: (O) => `Enemies explode ${O.delay} seconds after they die, hitting your whole group for ${Math.round(O.blast * 100)}% of their health.`, counter: 'Pace: careful, full health and one pack at a time.' },
    hasty: { tier: 2, icon: 'aspect_hawk', name: 'Hasty', par: 0.8, hp: 0.9, text: (O) => `Par time is ${Math.round((1 - O.par) * 100)}% shorter, and enemies have ${Math.round((1 - O.hp) * 100)}% less health.`, counter: 'Pace: fast.' },
    restless: { tier: 2, icon: 'hunters_mark', name: 'Restless', rest: 15, extra: 2, text: (O) => `Resting longer than ${O.rest} seconds between pulls draws a patrol of ${O.extra} enemies into your next pull.`, counter: 'Pace: fast, keep moving.' },
    // Tier 3, from Trial 8: who to kill first (the kill-order marks). In every pull of two or more, the last enemy listed
    // is the Omen's focus (shown in the pull list and the briefing)
    warded: { tier: 3, icon: 'mana_shield', name: 'Warded', taken: 0.5, text: (O) => `In every pull of two or more, the last enemy listed wards the rest: they take ${Math.round((1 - O.taken) * 100)}% less damage while it lives.`, counter: 'Marks: the warden first.' },
    sheltered: { tier: 3, icon: 'divine_protection', name: 'Sheltered', text: () => 'In every pull of two or more, the last enemy listed cannot be hurt while any other enemy in its pull lives.', counter: 'Marks: the others first, it last.' },
    // Vengeful is off: even at triple damage, trash pulls here are too small and short for it to matter (sim)
    vengeful: { tier: 3, off: true, icon: 'berserker_rage', name: 'Vengeful', dmg: 3, text: (O) => `In every pull of two or more, when the last enemy listed dies, the rest of its pull deal ${O.dmg === 2 ? 'double' : O.dmg === 3 ? 'triple' : Math.round((O.dmg - 1) * 100) + '% more'} damage.`, counter: 'Marks: the others first, it last.' },
    // out of the rotation (off): they only made runs harder, with no answer a player could choose (sim, 2026-09-30).
    // Frenzied, Rallying and Mending are off too: they rested on Kill order (one at a time / spread), and in three sims
    // (2026-09-30) the kill order changed almost nothing, so they offered no real choice. Tier 1 rests on the boss plan:
    // Guarded (adds first) and Enraging (burn the boss) need opposite answers.
    swarming: { tier: 1, off: true, icon: 'multi_shot', name: 'Swarming', extra: 1, hp: 1, text: (O) => `Every pull brings ${O.extra} extra enemy.`, counter: '' },
    hardened: { tier: 1, off: true, icon: 'shield_wall', name: 'Hardened', hp: 1.3, text: (O) => `Bosses have ${Math.round((O.hp - 1) * 100)}% more health.`, counter: '' },
  };
  for (const k in T.OMENS) Object.defineProperty(T.OMENS[k], 'rule', { get() { return this.text(this); } }); // the rule always matches the numbers
  T.TIER_LVL = { 1: 2, 2: 5, 3: 8 };
  // the period's Omens, one per tier, never the same one twice in a row: worked out week by week from the Preseason
  // (period -4), memoized per Omen list so a new Omen changes only the weeks after it is added
  const omenMemo = {};
  T.omensFor = function (periodId) {
    const out = [];
    for (const tier of Object.keys(T.TIER_LVL).map(Number)) {
      const keys = Object.keys(T.OMENS).filter((k) => T.OMENS[k].tier === tier && !T.OMENS[k].off).sort(); if (!keys.length) continue;
      const sig = tier + ':' + keys.join(','), M = (omenMemo[sig] = omenMemo[sig] || { from: -4, picks: [] });
      for (let id = M.from + M.picks.length; id <= periodId; id++) {
        let k = keys[Math.floor(rng(104729 * (id + 7) + tier)() * keys.length)];
        const prev = M.picks[M.picks.length - 1];
        if (keys.length > 1 && k === prev) k = keys[(keys.indexOf(k) + 1) % keys.length];
        M.picks.push(k);
      }
      out.push(periodId >= M.from ? M.picks[periodId - M.from] : keys[0]);
    }
    return out;
  };
  T.active = (lvl, date) => T.omensFor(T.period(date).id).filter((k) => lvl >= T.TIER_LVL[T.OMENS[k].tier]);

  // ---- difficulty, rating, and the bots you are grouped with
  T.factor = (lvl) => T.BASE * Math.pow(T.STEP, Math.max(0, lvl - 1));
  T.score = (b) => (b ? Math.round(b.lvl * 10 * (b.timed ? 1 : 0.5)) : 0);
  T.rating = (best, picks) => (picks || Object.keys(best || {})).reduce((s, a) => s + T.score((best || {})[a]), 0);
  T.botSkill = (rating) => 0.6 + 0.25 * Math.min(1, (rating || 0) / 800);

  // ---- the realm leaderboard: each level-60 simulated player climbs through the month on its own curve, from its id
  const h01 = (id, salt) => { const r = rng((id * 2654435761) ^ (salt * 40503)); r(); return r(); };
  T.botRating = function (b, k, frac) {
    const skill = (b.skill != null ? b.skill : 0.5), roll = h01(b.id, k + 1);
    const cap = 120 + 1350 * Math.pow(roll, 1.6) * (0.55 + 0.45 * skill); // most sit at 200-700, a few push past 1200
    const late = h01(b.id, k + 101) * 0.35; // some start late in the month
    const f = Math.max(0, (frac - late) / (1 - late));
    return Math.round(cap * (1 - Math.exp(-3.2 * f)));
  };
  // The rest of the realm's level-60 players, for the ladder only: a young realm has few bots at 60 (they level with
  // you), so a fixed set of LADDER players, made the way the game makes bots and the same on every device, fills it.
  T.LADDER = 600;
  let ladder = null;
  T.ladder = function () {
    if (ladder) return ladder;
    const B = root.B, r = rng(424242), real = Math.random, names = new Set();
    Math.random = r; // the game's own bot maker, on a fixed seed
    try { ladder = []; for (let i = 0; i < T.LADDER; i++) { const b = B.makeBot(900000 + i, names, { level: 60 }); names.add(b.name); ladder.push({ id: b.id, name: b.name, cls: b.cls, level: 60, skill: b.skill }); } }
    finally { Math.random = real; }
    return ladder;
  };
  // your rank among the realm's level-60 players; rows = the top 10 and the players around you, never the whole list
  T.board = function (bots, myRating, myName, date) {
    const d = date || new Date(), k = T.season(d), frac = T.monthFrac(d);
    const known = (bots || []).filter((b) => b.level >= 60);
    const list = known.concat(root.B && root.B.makeBot ? T.ladder() : []).map((b) => ({ id: b.id, name: b.name, cls: b.cls, rating: T.botRating(b, k, frac) }));
    list.push({ id: 'me', name: myName, rating: myRating || 0, me: true });
    list.sort((a, b) => b.rating - a.rating || (a.me ? -1 : b.me ? 1 : 0));
    list.forEach((r, i) => { r.rank = i + 1; });
    const at = list.findIndex((r) => r.me), keep = new Set();
    for (let i = 0; i < Math.min(10, list.length); i++) keep.add(i);
    for (let i = Math.max(0, at - 2); i <= Math.min(list.length - 1, at + 2); i++) keep.add(i);
    return { rank: at + 1, of: list.length, rows: [...keep].sort((a, b) => a - b).map((i) => list[i]) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
