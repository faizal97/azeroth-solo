// Working chat and guilds: requests appear over time, and each kind of action does what it says.
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js'); require('../src/social.js');
const { G, D, B, SOC } = globalThis;
let t = Date.now(); Date.now = () => t;
let bad = 0; const fail = (m) => { console.log('FAIL ' + m); bad++; };
G.newGame({ name: 'T', cls: 'priest', race: 'human' }); const S = G.S, P = S.player;
P.level = 22; S.flags.warModeAsked = true; S.flags.warMode = false; P.place = 'darkshire'; P.money = 50000;
for (const b of S.bots) { b.level = Math.max(b.level, 18 + Math.floor(Math.random() * 10)); }
G.addItem(G.copyItem('linen_cloth'), 30); G.addItem(G.copyItem('light_leather'), 12);
// 3 hours of chat
const kinds = {};
for (let i = 0; i < 3 * 3600; i++) { t += 1000; G.update(1); for (const m of S.chat) if (m.act && !m.counted) { m.counted = 1; kinds[m.act.kind] = (kinds[m.act.kind] || 0) + 1; } }
console.log('requests in 3 h (not in a guild):', JSON.stringify(kinds));
for (const k of ['lfg', 'wtb', 'wts', 'where', 'guild_invite', 'guild_apply']) if (!kinds[k]) fail('no ' + k + ' requests');
const run = (kind, pick) => { const m = S.chat.slice().reverse().find((x) => x.act && x.act.kind === kind && x.act.state === 'open'); if (!m) { fail('no open ' + kind); return null; } const acts = SOC.actions(m); const a = pick ? pick(acts, m) : acts[0]; const r = a.fn(); return { m, r, a }; };
// fresh ones of each kind, then act on them
const force = (kind) => { for (let i = 0; i < 4000; i++) { t += 1000; G.update(1); if (S.chat.some((x) => x.act && x.act.kind === kind && x.act.state === 'open')) return true; if (S.run) { while (S.run && S.run.phase !== 'done') { G.update(0.1); t += 100; } G.leaveRun && G.leaveRun(); S.run = null; S.group = null; } } return false; };
if (force('wtb')) { const m0 = P.money; const x = run('wtb'); if (x && P.money <= m0) fail('wtb did not pay'); else if (x) console.log('wtb ok:', x.m.text, '→ +', P.money - m0); }
if (force('wts')) { const m0 = P.money, n0 = P.bags.length; const x = run('wts'); if (x && !(P.money < m0 && P.bags.length > n0)) fail('wts did not buy'); else if (x) console.log('wts ok:', x.m.text); }
if (force('where')) { const x = run('where', (acts, m) => acts.find((a) => a.label === m.act.answer)); if (x) console.log('where ok:', x.m.text, '→', x.a.label, 'marks', G.account().marks); }
if (force('help_kill')) {
  const x = run('help_kill'); const a = x && x.m.act;
  if (a) { if (!S.wparty) fail('helper did not join the party'); P.place = a.place; const m0 = P.money; for (let i = 0; i < a.n; i++) G.S && (G.on && null, SOC.onKill(a.mob)); if (a.state !== 'done' || P.money <= m0) fail('help_kill did not pay'); else console.log('help_kill ok:', x.m.text); }
}
if (force('lfg')) { const x = run('lfg'); if (!S.run) fail('lfg did not start a run'); else { console.log('lfg ok:', x.m.text, '→ run', S.run.act); let g = 0; while (S.run && S.run.phase !== 'done' && g++ < 200000) { if (G.fight && G.pUnit && G.pUnit.kind === 'player') { G.pUnit.kind = 'bot'; G.pUnit.bot = { skill: 0.7, react: 0.5 }; G.pUnit.role = G.role(); } for (const r of (S.run.rolls || [])) if (!r.done && r.player && r.choice == null) { try { G.roll(S.run.rolls.indexOf(r), 'greed'); } catch (e) {} } if (S.run.phase === 'rest' && S.run.restUntil <= t) { try { G.runPull(); } catch (e) {} } G.update(0.1); t += 100; } console.log('  run finished:', S.run && S.run.phase); S.run = null; S.group = null; } }
// guilds: apply to one you qualify for
const gs = SOC.myGuilds(); console.log('guilds:', gs.map((g) => `${g.name} (${g.style} ${g.min}+, ${g.members})`).join(' · '));
const ok = gs.find((g) => P.level >= g.min); SOC.apply(ok.g); for (let i = 0; i < 90; i++) { t += 1000; G.update(1); }
if (P.guild !== ok.g) fail('application not accepted'); else console.log('applied and joined', ok.name);
const low = gs.find((g) => P.level < g.min);
// guild requests pay standing
const gk = {}; const rep0 = P.guildRep || 0;
for (let i = 0; i < 2 * 3600; i++) { t += 1000; G.update(1); for (const m of S.chat) if (m.act && m.act.guild && !m.gcount) { m.gcount = 1; gk[m.act.kind] = (gk[m.act.kind] || 0) + 1; if (m.act.kind === 'g_mats' && G.countItem(m.act.item) >= m.act.n) SOC.actions(m)[0].fn(); if (m.act.kind === 'where') SOC.actions(m).find((a) => a.label === m.act.answer).fn(); } if (S.run) { S.run = null; S.group = null; } }
console.log('guild requests in 2 h:', JSON.stringify(gk), '· standing', rep0, '→', P.guildRep, '· rank', SOC.RANKS[SOC.rank()].name, '· xp perk', SOC.perk('xp') + '%');
if (!Object.keys(gk).length) fail('no guild requests');
SOC.leaveGuild(); if (P.guild !== -1) fail('leave guild');
console.log(bad ? `${bad} problem(s)` : 'social sim OK');
process.exitCode = bad ? 1 : 0;
