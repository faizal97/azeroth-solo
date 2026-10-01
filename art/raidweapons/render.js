// Checks and contact sheets for the raid weapon looks in src/art.js (Veshmira's Lair, the Magma Throne, the Tidecrown
// Citadel): every weapon and its <key>_hard recolour draws on every race, gender and class without throwing, changes the
// hero, Hard differs from Normal, and every older look is identical to the committed art.js.
// Usage: node art/raidweapons/render.js   (sheets go to art/raidweapons/out/)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'out');
const RSVG = '/opt/homebrew/bin/rsvg-convert';
fs.mkdirSync(OUT, { recursive: true });
const problems = [];
const bad = (m) => problems.push(m);
const norm = (t) => String(t).replace(/ id="[^"]+"/g, ' id=""').replace(/url\(#[^)]+\)/g, 'url(#)');

// each look: [key, weapon type (as in the item data), raid]
const RAIDS = {
  vesh: { name: "Veshmira's Lair", set: { back: 'vesh_mantle', legs: 'vesh_legs' }, chest: { cloth: 'vesh_robe', other: 'vesh_tunic' },
    weapons: [['vesh_sword', 'sword'], ['vesh_dagger', 'dagger'], ['vesh_staff', 'staff']] },
  mc: { name: 'The Magma Throne', set: { back: 'mc_cloak', legs: 'mc_legs' }, chest: { cloth: 'mc_robe', leather: 'mc_leather', mail: 'mc_mail' },
    weapons: [['mc_sword', 'sword'], ['mc_dagger', 'dagger'], ['mc_staff', 'staff'], ['mc_mace', 'mace'], ['mc_hammer', 'mace']] },
  tc: { name: 'The Tidecrown Citadel', set: { back: 'tc_mantle', legs: 'tc_legs' }, chest: { cloth: 'tc_robe', leather: 'tc_leather', mail: 'tc_mail' },
    weapons: [['tc_sword', 'sword'], ['tc_dagger', 'dagger'], ['tc_staff', 'staff'], ['tc_mace', 'mace']] }
};
// who can wield what (src/data/core.js CLASSES[*].weapons; hardcoded so the check does not depend on the data files)
const WIELD = {
  warrior: ['sword', 'axe', 'mace'], mage: ['staff', 'dagger'], priest: ['mace', 'staff'], rogue: ['dagger', 'sword'], paladin: ['mace', 'sword', 'axe'],
  warlock: ['staff', 'dagger', 'sword'], hunter: ['axe', 'sword', 'dagger'], druid: ['staff', 'mace', 'dagger'], shaman: ['mace', 'axe', 'staff', 'dagger']
};
const ARMOUR = { warrior: 'mail', paladin: 'mail', rogue: 'leather', hunter: 'leather', druid: 'leather', shaman: 'leather', mage: 'cloth', priest: 'cloth', warlock: 'cloth' };
const ALL = Object.values(RAIDS).flatMap((r) => r.weapons);
const KEYS = ALL.map((w) => w[0]);

function load(src, report) {
  const dbg = src.replace('function safe(fn, fb) { try { return fn(); } catch (e) {', 'function safe(fn, fb) { try { return fn(); } catch (e) { if (W.__DBG) W.__DBG(e);');
  if (dbg === src) bad('debug hook: safe() not found');
  const w = { __DBG: report }; w.window = w; vm.createContext(w); vm.runInContext(dbg, w);
  return w.ART;
}
let current = '';
const ART = load(fs.readFileSync(path.join(ROOT, 'src', 'art.js'), 'utf8'), (e) => bad('exception drawing ' + current + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)));
let OLD = null;
try { OLD = load(execFileSync('git', ['show', 'HEAD:src/art.js'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }), () => {}); } catch (e) { bad('could not load HEAD:src/art.js: ' + e.message); }

// ---- 1. keys ----
const LK = ART.keys.looks;
for (const k of KEYS) for (const kk of [k, k + '_hard']) if (!LK.weapon.includes(kk)) bad('missing weapon look ' + kk);

// ---- 2. every weapon on every race, gender and class (also classes that cannot wield it: a look must never break) ----
const RACES = ART.keys.races, CLASSES = ART.keys.classes;
let drawn = 0;
for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
  const base = { cls: cl, race: r, gender: gd, skin: 1, hair: 2 };
  current = r + ' ' + gd + ' ' + cl + ' plain';
  const plain = norm(ART.hero(base));
  const seen = {};
  for (const k of KEYS) {
    const out = {};
    for (const kk of [k, k + '_hard']) {
      current = r + ' ' + gd + ' ' + cl + ' ' + kk;
      const s = ART.hero(Object.assign({ gear: { weapon: kk } }, base)); drawn++;
      if (/NaN|undefined|Infinity/.test(s)) bad(kk + ' has NaN/undefined on ' + r + ' ' + gd + ' ' + cl);
      if (s.length < 4000) bad(kk + ' is a placeholder on ' + r + ' ' + gd + ' ' + cl);
      if (norm(s) === plain) bad(kk + ' changes nothing on ' + r + ' ' + gd + ' ' + cl);
      if (seen[norm(s)]) bad(kk + ' draws the same as ' + seen[norm(s)] + ' on ' + r + ' ' + gd + ' ' + cl); seen[norm(s)] = kk;
      const p = ART.portrait(Object.assign({ gear: { weapon: kk } }, base));
      if (/NaN|undefined|Infinity/.test(p)) bad(kk + ' portrait NaN on ' + r + ' ' + gd + ' ' + cl);
      out[kk] = s;
    }
  }
}
// ---- 3. nothing old changed: plain heroes and every older look match the committed art.js ----
let same = 0;
if (OLD) {
  const ol = OLD.keys.looks;
  for (const sl of Object.keys(ol)) for (const k of ol[sl]) if (!LK[sl].includes(k)) bad('old look lost ' + sl + ':' + k);
  for (const k of Object.keys(OLD.keys)) if (k !== 'looks' && JSON.stringify(OLD.keys[k]) !== JSON.stringify(ART.keys[k])) bad('ART.keys.' + k + ' changed');
  for (const sl of Object.keys(ol)) if (sl !== 'weapon' && JSON.stringify(ol[sl]) !== JSON.stringify(LK[sl])) bad('look list changed: ' + sl);
  for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
    const base = { cls: cl, race: r, gender: gd, skin: 2, hair: 1 };
    const cases = [base];
    for (const sl of ['back', 'chest', 'legs', 'mask', 'weapon', 'ranged']) for (const k of ol[sl] || []) if ((sl !== 'ranged' || cl === 'hunter') && (sl === 'weapon' || cl === 'warrior')) cases.push(Object.assign({ gear: { [sl]: k } }, base));
    for (const o of cases) {
      if (norm(ART.hero(o)) !== norm(OLD.hero(o))) bad('hero changed vs HEAD: ' + JSON.stringify(o)); else same++;
      if (norm(ART.portrait(o)) !== norm(OLD.portrait(o))) bad('portrait changed vs HEAD: ' + JSON.stringify(o));
    }
  }
  for (const k of OLD.keys.icons) { if (norm(ART.icon(k)) !== norm(OLD.icon(k))) bad('icon changed vs HEAD: ' + k); else same++; }
  for (const k of OLD.keys.mobs) { if (norm(ART.mob(k)) !== norm(OLD.mob(k))) bad('mob changed vs HEAD: ' + k); else same++; }
}

// ---- 4. contact sheets ----
const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)"(?: width="[^"]+" height="[^"]+")?>/;
const nest = (s, x, y, w, h, vb) => `<g transform="translate(${x},${y})">${s.replace(HEAD, (m, v) => `<svg x="0" y="0" width="${w}" height="${h}" viewBox="${vb || v}">`)}</g>`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
const sheets = [];
function sheet(name, rows, cw, ch, bg, labelW, caption, head) {
  const pad = 6, lw = labelW == null ? 140 : labelW, cols = Math.max(...rows.map((r) => r[1].length)), top = (caption ? 22 : 0) + (head ? 16 : 0);
  let body = caption ? `<text x="${pad}" y="16" font-family="Helvetica, Arial" font-size="13" fill="#fff">${esc(caption)}</text>` : '';
  if (head) head.forEach((h, i) => { body += `<text x="${pad + lw + i * (cw + pad) + 2}" y="${top - 4}" font-family="Helvetica, Arial" font-size="11" fill="#ccc">${esc(h)}</text>`; });
  rows.forEach(([label, cells], j) => {
    const y = top + pad + j * (ch + pad);
    if (lw) body += `<text x="${pad}" y="${y + ch / 2 + 4}" font-family="Helvetica, Arial" font-size="12" fill="#ddd">${esc(label)}</text>`;
    cells.forEach(([s, cbg, vb], i) => {
      const x = pad + lw + i * (cw + pad);
      body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${cbg || bg}"/>` + (s ? nest(s, x, y, cw, ch, vb) : '');
    });
  });
  const W = pad * 2 + lw + cols * (cw + pad), H = top + pad + rows.length * (ch + pad);
  const p = path.join(OUT, name + '.svg');
  fs.writeFileSync(p, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#1c1c20"/>${body}</svg>`);
  const o = p.replace(/\.svg$/, '.png');
  execFileSync(RSVG, ['-w', String(W), p, '-o', o]);
  fs.unlinkSync(p);
  sheets.push(o); return o;
}
const HEROES = [
  { cls: 'warrior', race: 'human', gender: 'm', skin: 1, hair: 0 },
  { cls: 'rogue', race: 'orc', gender: 'm', skin: 1, hair: 0 },
  { cls: 'paladin', race: 'dwarf', gender: 'm', skin: 0, hair: 3 },
  { cls: 'warlock', race: 'gnome', gender: 'f', skin: 1, hair: 2 },
  { cls: 'hunter', race: 'troll', gender: 'm', skin: 0, hair: 1 },
  { cls: 'mage', race: 'undead', gender: 'f', skin: 0, hair: 0 },
  { cls: 'priest', race: 'nightelf', gender: 'f', skin: 1, hair: 1 },
  { cls: 'druid', race: 'tauren', gender: 'm', skin: 1, hair: 1 },
  { cls: 'shaman', race: 'orc', gender: 'f', skin: 2, hair: 1 },
  { cls: 'warrior', race: 'tauren', gender: 'f', skin: 0, hair: 2 },
  { cls: 'rogue', race: 'nightelf', gender: 'm', skin: 2, hair: 0 },
  { cls: 'priest', race: 'dwarf', gender: 'f', skin: 1, hair: 1 },
  { cls: 'mage', race: 'gnome', gender: 'm', skin: 0, hair: 3 },
  { cls: 'paladin', race: 'human', gender: 'f', skin: 2, hair: 1 }
].filter((o) => CLASSES.includes(o.cls));
const lab = (o) => o.race + ' ' + o.gender + ' ' + o.cls;
const H = (o, gear) => ART.hero(Object.assign({}, o, gear ? { gear } : {}));
const BG = '#7c8a80', DARK = '#2a3440';
const users = (wt) => HEROES.filter((o) => WIELD[o.cls].includes(wt));
// a. per raid: each weapon, Normal | Hard, on five heroes that can wield it
for (const [rk, R] of Object.entries(RAIDS)) {
  sheet(rk + '_heroes', R.weapons.map(([k, wt]) => [k, users(wt).slice(0, 5).flatMap((o) => [[H(o, { weapon: k })], [H(o, { weapon: k + '_hard' }), DARK]])]), 130, 130, BG, 100,
    R.name + ': each weapon on five heroes who can wield it, Normal (light) | Hard (dark)');
  // b. with the raid's armour on, Normal set + weapon | Hard set + weapon
  const setOn = (o, k, hd) => H(o, { back: R.set.back + hd, legs: R.set.legs + hd, chest: (R.chest[ARMOUR[o.cls]] || R.chest.other || R.chest.cloth) + hd, weapon: k + hd });
  sheet(rk + '_with_set', R.weapons.map(([k, wt]) => [k, users(wt).slice(0, 4).flatMap((o) => [[setOn(o, k, '')], [setOn(o, k, '_hard'), DARK]])]), 150, 150, BG, 100,
    R.name + ': weapon with the raid armour, Normal | Hard');
}
// c. close-ups: each weapon in the hand, Normal | Hard, light and dark, on a hero of each grip style
const CROP = { warrior: '30 -24 110 110', rogue: '58 -6 100 100', mage: '30 -28 110 110', priest: '30 -28 110 110', paladin: '40 -20 100 100', hunter: '10 -10 110 110', druid: '30 -28 110 110', warlock: '30 -28 110 110', shaman: '30 -24 110 110' };
const CLOSE = { sword: HEROES[0], dagger: HEROES[1], staff: HEROES[5], mace: HEROES[0] };
for (const [rk, R] of Object.entries(RAIDS)) {
  sheet(rk + '_closeup', R.weapons.map(([k, wt]) => { const o = k === 'mc_hammer' ? HEROES[0] : CLOSE[wt]; return [k, [[H(o, { weapon: k }), BG, CROP[o.cls]], [H(o, { weapon: k + '_hard' }), BG, CROP[o.cls]], [H(o, { weapon: k }), DARK, CROP[o.cls]], [H(o, { weapon: k + '_hard' }), DARK, CROP[o.cls]]]]; }),
    230, 230, BG, 100, R.name + ' close-up: Normal | Hard on light, Normal | Hard on dark');
}
// d. at 64 px: every weapon, Normal and Hard, on light and dark
sheet('all_64', [['light', ALL.flatMap(([k, wt]) => { const o = k === 'mc_hammer' ? HEROES[0] : users(wt)[0]; return [[H(o, { weapon: k })], [H(o, { weapon: k + '_hard' })]]; })],
  ['dark', ALL.flatMap(([k, wt]) => { const o = k === 'mc_hammer' ? HEROES[0] : users(wt)[1]; return [[H(o, { weapon: k }), DARK], [H(o, { weapon: k + '_hard' }), DARK]]; })]],
  64, 64, BG, 44, 'At 64 px, each weapon Normal then Hard: ' + KEYS.join(', '));
// e. every raid weapon side by side (one raid per row, Normal row then Hard row), on a warrior-sized frame
sheet('lineup', Object.entries(RAIDS).flatMap(([rk, R]) => ['', '_hard'].map((hd) => [rk + hd, R.weapons.map(([k, wt]) => { const o = k === 'mc_hammer' ? HEROES[0] : CLOSE[wt]; return [H(o, { weapon: k + hd }), hd ? DARK : BG, CROP[o.cls]]; })])),
  150, 150, BG, 80, 'Line-up per raid (Normal row, Hard row): sword, dagger, staff, mace, hammer');
// f. the hunter (weapon on the back hand) and the tauren (scaled grip) for every weapon
const hunter = HEROES.find((o) => o.cls === 'hunter'), tauren = HEROES.find((o) => o.race === 'tauren' && o.cls === 'warrior');
sheet('hunter_tauren', [['hunter', ALL.filter(([, wt]) => WIELD.hunter.includes(wt)).flatMap(([k]) => [[H(hunter, { weapon: k })], [H(hunter, { weapon: k + '_hard' }), DARK]])],
  ['tauren', ALL.filter(([, wt]) => WIELD.warrior.includes(wt)).flatMap(([k]) => [[H(tauren, { weapon: k })], [H(tauren, { weapon: k + '_hard' }), DARK]])]], 130, 130, BG, 70, 'Hunter (melee in the back hand) and tauren warrior, Normal | Hard');

console.log('drawn ' + drawn + ' raid weapon looks on ' + RACES.length + ' races x 2 genders x ' + CLASSES.length + ' classes; ' + same + ' older heroes/icons/mobs identical to HEAD');
console.log('sheets:\n  ' + sheets.map((s) => path.relative(ROOT, s)).join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.slice(0, 40).join('\n') : 'OK: 0 problems');
process.exitCode = problems.length ? 1 : 0;
