// Checks the game data before every build. Exits 1 on any broken reference, so a typo fails the
// build instead of the game. Run: node tools/validate.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
globalThis.localStorage = { getItem() { return null; }, setItem() {} };
require(path.join(ROOT, 'src/data.js'));
const D = globalThis.D;
const errors = [], warn = [];
const err = (m) => errors.push(m);

// art: every scene, mob and ability icon the data asks for must exist
const w = {}; vm.createContext(w); w.window = w;
for (const f of fs.readdirSync(path.join(ROOT, 'src')).filter((f) => /^art.*\.js$/.test(f) && f !== 'art_story.js').sort((a, b) => (a === 'art.js' ? -1 : b === 'art.js' ? 1 : 0)))
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src', f), 'utf8'), w);
const K = (w.ART && w.ART.keys) || {};
const scenes = new Set(K.scenes || []), mobArt = new Set(K.mobs || []), icons = new Set(K.icons || []);

const has = (tbl, k) => Object.prototype.hasOwnProperty.call(D[tbl], k);
for (const [k, p] of Object.entries(D.PLACES)) {
  if (!D.REGIONS[p.region]) err(`place ${k}: unknown region '${p.region}'`);
  if (p.gather && !has('ITEMS', p.gather.item)) err(`place ${k}: gathers unknown item '${p.gather.item}'`);
  if (scenes.size && !scenes.has(p.scene)) err(`place ${k}: no art for scene '${p.scene}'`);
  for (const [to, secs] of Object.entries(p.links || {})) {
    if (!has('PLACES', to)) err(`place ${k}: link to unknown place '${to}'`);
    else if (!(D.PLACES[to].links || {})[k]) warn.push(`place ${k} -> ${to} is one-way`);
    if (!(secs > 0)) err(`place ${k}: link to ${to} has no travel time`);
  }
  for (const [m] of p.mobs || []) if (!has('MOBS', m)) err(`place ${k}: unknown mob '${m}'`);
  for (const m in p.named || {}) if (!has('MOBS', m)) err(`place ${k}: unknown named mob '${m}'`);
  for (const n of p.npcs || []) if (!has('NPCS', n)) err(`place ${k}: unknown npc '${n}'`);
  for (const r of ['vendor', 'gearVendor']) if (p[r] && !(p.npcs || []).includes(p[r])) err(`place ${k}: ${r} '${p[r]}' is not in its npcs`);
}
for (const [k, m] of Object.entries(D.MOBS)) {
  for (const [id] of (m.drops || []).concat(m.qdrops || [])) if (!has('ITEMS', id)) err(`mob ${k}: drops unknown item '${id}'`);
  for (const id of m.loot || []) if (!has('ITEMS', id)) err(`mob ${k}: loot unknown item '${id}'`);
  if (mobArt.size && !mobArt.has(m.sprite || k)) err(`mob ${k}: no art for '${m.sprite || k}'`);
  if (!Array.isArray(m.lvl) || m.lvl[0] > m.lvl[1]) err(`mob ${k}: bad level range`);
}
const giverAt = {}; for (const [pk, p] of Object.entries(D.PLACES)) for (const n of p.npcs || []) giverAt[n] = pk;
for (const [k, q] of Object.entries(D.QUESTS)) {
  for (const who of ['giver', 'turnin']) { if (!has('NPCS', q[who])) err(`quest ${k}: unknown ${who} '${q[who]}'`); else if (!giverAt[q[who]]) err(`quest ${k}: ${who} '${q[who]}' stands nowhere`); }
  for (const p of q.pre || []) if (!has('QUESTS', p)) err(`quest ${k}: needs unknown quest '${p}'`);
  if (!q.objs || !q.objs.length) err(`quest ${k}: no objectives`);
  for (const o of q.objs || []) {
    if (o.type === 'kill' && !has('MOBS', o.mob)) err(`quest ${k}: kill unknown mob '${o.mob}'`);
    if (o.type === 'visit' && !has('PLACES', o.place)) err(`quest ${k}: visit unknown place '${o.place}'`);
    if (o.type === 'collect') {
      if (!has('ITEMS', o.item)) err(`quest ${k}: collect unknown item '${o.item}'`);
      else if (!Object.values(D.MOBS).some((m) => (m.qdrops || []).concat(m.drops || []).some((d) => d[0] === o.item)) && !Object.values(D.PLACES).some((p) => p.gather && p.gather.item === o.item)) err(`quest ${k}: nothing drops or grows '${o.item}'`);
    }
  }
  for (const f of (q.reward && q.reward.choice) || []) if (!has('REWARD_FAMILIES', f)) err(`quest ${k}: unknown reward family '${f}'`);
  if (q.lvl > D.LEVEL_CAP + 2) warn.push(`quest ${k}: level ${q.lvl} is above the cap`);
}
for (const [c, C] of Object.entries(D.CLASSES)) for (const a of C.abilities) {
  if (!has('ABILITIES', a)) { err(`class ${c}: unknown ability '${a}'`); continue; }
  const ic = D.ABILITIES[a].icon || a; if (icons.size && !icons.has(ic)) err(`ability ${a}: no icon '${ic}'`);
}
for (const [k, A] of Object.entries(D.ACTIVITIES)) {
  if (A.where && !has('PLACES', A.where)) err(`activity ${k}: unknown place '${A.where}'`);
  if (A.dungeon && !has('DUNGEONS', A.dungeon)) err(`activity ${k}: unknown dungeon '${A.dungeon}'`);
  for (const pl of A.pulls || []) for (const m of pl.mobs) if (!has('MOBS', m)) err(`activity ${k}: unknown mob '${m}'`);
}
for (const [k, Dg] of Object.entries(D.DUNGEONS)) for (const pl of Dg.pulls) for (const m of pl.mobs) if (!has('MOBS', m)) err(`dungeon ${k}: unknown mob '${m}'`);
if (D.XP_TO_LEVEL.length <= D.LEVEL_CAP) err(`XP_TO_LEVEL stops before the level cap (${D.LEVEL_CAP})`);

const n = (t) => Object.keys(D[t]).length;
console.log(`data: ${n('REGIONS')} zones, ${n('PLACES')} places, ${n('MOBS')} mobs, ${n('QUESTS')} quests, ${n('ITEMS')} items` + (warn.length ? ` · ${warn.length} warnings` : ''));
if (process.argv.includes('-v')) warn.forEach((w) => console.log('  warn:', w));
if (errors.length) { errors.forEach((e) => console.error('  ERROR:', e)); console.error(`${errors.length} data error(s); build stopped.`); process.exit(1); }
console.log('data OK');
