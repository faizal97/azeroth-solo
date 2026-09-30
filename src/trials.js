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
  T.par = (Dg) => (Dg && Dg.par ? Math.round(Dg.par * T.PAR) : 0);
  T.BASE = 1; T.STEP = 1.06; // enemy health and damage: BASE at Trial 1, then STEP per level, compounding (tuned by sim/trialpace.js)
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
