// Checks and contact sheets for the crafted looks in src/art.js: the level-60 crafted armour sets (Moonforged mail,
// Wildrunner leather, Starweave cloth), the Moonforged weapons and the profession keepsakes (back looks).
// Every look draws on every race, gender and class without throwing, changes the hero, differs from every other new
// look in its slot, and every older look stays identical to the committed art.js. Sheets go to art/crafted/out/.
// Usage: node art/crafted/render.js
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

const SETS = {
  moonforged: { name: 'Moonforged (blacksmithing, mail)', chest: 'moonforged_chest', legs: 'moonforged_legs' },
  wildrunner: { name: 'Wildrunner (leatherworking, leather)', chest: 'wildrunner_chest', legs: 'wildrunner_legs', back: 'wildrunner_cloak' },
  starweave: { name: 'Starweave (tailoring, cloth)', chest: 'starweave_chest', legs: 'starweave_legs' }
};
const WEAPONS = [['moonforged_blade', 'sword'], ['moonforged_hammer', 'mace']];
const KEEPSAKES = ['deepdelvers_pick', 'herbwise_satchel', 'hide_hunters_pelt', 'master_smiths_hammer', 'tanners_rolled_hides',
  'weavers_spindle', 'alchemists_bandolier', 'chefs_stewpot', 'anglers_rod'];
const SLOT = {};
for (const s of Object.values(SETS)) { SLOT[s.chest] = 'chest'; SLOT[s.legs] = 'legs'; if (s.back) SLOT[s.back] = 'back'; }
for (const [k] of WEAPONS) SLOT[k] = 'weapon';
for (const k of KEEPSAKES) SLOT[k] = 'back';
const KEYS = Object.keys(SLOT);

// ---- load art.js (exceptions reported instead of swallowed by safe()) and the committed one for comparison ----
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
const LK = ART.keys.looks;

// ---- 1. keys: each look is listed in its slot ----
for (const k of KEYS) if (!LK[SLOT[k]].includes(k)) bad('missing ' + SLOT[k] + ' look ' + k);

// ---- 2. every look on every race, gender and class: draws, changes the hero, differs from the other new looks ----
const RACES = ART.keys.races, CLASSES = ART.keys.classes;
let drawn = 0;
for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
  const base = { cls: cl, race: r, gender: gd, skin: 1, hair: 2 };
  current = r + ' ' + gd + ' ' + cl + ' plain';
  const plain = norm(ART.hero(base)), seen = {};
  for (const k of KEYS) {
    const sl = SLOT[k];
    current = r + ' ' + gd + ' ' + cl + ' ' + k;
    const s = ART.hero(Object.assign({ gear: { [sl]: k } }, base)); drawn++;
    if (/NaN|undefined|Infinity/.test(s)) bad(k + ' has NaN/undefined on ' + r + ' ' + gd + ' ' + cl);
    if (s.length < 4000) bad(k + ' is a placeholder on ' + r + ' ' + gd + ' ' + cl);
    const n = norm(s);
    if (n === plain) bad(k + ' changes nothing on ' + r + ' ' + gd + ' ' + cl);
    if (seen[n]) bad(k + ' draws the same as ' + seen[n] + ' on ' + r + ' ' + gd + ' ' + cl); seen[n] = k;
    const p = ART.portrait(Object.assign({ gear: { [sl]: k } }, base));
    if (/NaN|undefined|Infinity/.test(p)) bad(k + ' portrait NaN on ' + r + ' ' + gd + ' ' + cl);
  }
  // each set worn together, with each weapon and with each keepsake (the keepsake replaces the set's cloak)
  for (const [sk, s] of Object.entries(SETS)) for (const extra of [{}].concat(WEAPONS.map(([w]) => ({ weapon: w })), KEEPSAKES.map((b) => ({ back: b })))) {
    const gear = Object.assign({ chest: s.chest, legs: s.legs }, s.back ? { back: s.back } : {}, extra);
    current = r + ' ' + gd + ' ' + cl + ' ' + sk + ' set ' + JSON.stringify(extra);
    const o = ART.hero(Object.assign({ gear }, base));
    if (/NaN|undefined|Infinity/.test(o) || o.length < 4000) bad('set ' + sk + ' ' + JSON.stringify(extra) + ' broken on ' + r + ' ' + gd + ' ' + cl);
  }
}

// ---- 3. nothing old changed: the old key lists, plain heroes and every older look match the committed art.js ----
let same = 0;
if (OLD) {
  const ol = OLD.keys.looks;
  for (const sl of Object.keys(ol)) {
    for (const k of ol[sl]) if (!LK[sl].includes(k)) bad('old look lost ' + sl + ':' + k);
    if (JSON.stringify(LK[sl].slice(0, ol[sl].length)) !== JSON.stringify(ol[sl])) bad('old look order changed: ' + sl);
    for (const k of LK[sl].slice(ol[sl].length)) if (SLOT[k] !== sl) bad('unexpected new ' + sl + ' look ' + k);
  }
  for (const k of Object.keys(OLD.keys)) if (k !== 'looks' && JSON.stringify(OLD.keys[k]) !== JSON.stringify(ART.keys[k])) bad('ART.keys.' + k + ' changed');
  for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
    const base = { cls: cl, race: r, gender: gd, skin: 2, hair: 1 };
    const cases = [base];
    for (const sl of ['back', 'chest', 'legs', 'mask', 'weapon', 'ranged']) for (const k of ol[sl] || []) if ((sl !== 'ranged' || cl === 'hunter') && (sl === 'weapon' || cl === 'warrior' || cl === 'mage')) cases.push(Object.assign({ gear: { [sl]: k } }, base));
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
// rows: [label, [cells]]; a cell is [svg, bg?, viewBox?]; head: optional column titles
function sheet(name, rows, cw, ch, bg, labelW, caption, head) {
  const pad = 6, lw = labelW == null ? 150 : labelW, cols = Math.max(...rows.map((r) => r[1].length)), top = (caption ? 22 : 0) + (head ? 16 : 0);
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
// a warrior, a rogue and a mage, male and female, over several races
const WHO = [
  ['human warrior m', { cls: 'warrior', race: 'human', gender: 'm', skin: 1, hair: 0 }],
  ['orc warrior f', { cls: 'warrior', race: 'orc', gender: 'f', skin: 1, hair: 1 }],
  ['nightelf rogue m', { cls: 'rogue', race: 'nightelf', gender: 'm', skin: 2, hair: 0 }],
  ['dwarf rogue f', { cls: 'rogue', race: 'dwarf', gender: 'f', skin: 1, hair: 1 }],
  ['undead mage m', { cls: 'mage', race: 'undead', gender: 'm', skin: 0, hair: 3 }],
  ['gnome mage f', { cls: 'mage', race: 'gnome', gender: 'f', skin: 1, hair: 2 }],
  ['tauren warrior m', { cls: 'warrior', race: 'tauren', gender: 'm', skin: 1, hair: 1 }],
  ['troll mage f', { cls: 'mage', race: 'troll', gender: 'f', skin: 0, hair: 0 }]
].filter(([, o]) => RACES.includes(o.race) && CLASSES.includes(o.cls));
const H = (o, gear) => ART.hero(Object.assign({}, o, gear ? { gear } : {}));
const BG = '#7c8a80', DARK = '#2a3440';
const setGear = (s) => Object.assign({ chest: s.chest, legs: s.legs }, s.back ? { back: s.back } : {});
// a. each set: plain | full set | chest | legs (| cloak) on every body
for (const [sk, s] of Object.entries(SETS)) {
  const pieces = [s.chest, s.legs].concat(s.back ? [s.back] : []);
  sheet(sk + '_set', WHO.map(([lab, o]) => [lab, [[H(o)], [H(o, setGear(s))], [H(o, setGear(s)), DARK]].concat(pieces.map((k) => [H(o, { [SLOT[k]]: k })]))]), 150, 150, BG, 130,
    s.name, ['plain', 'full set', 'full set (dark)'].concat(pieces));
}
// b. the three sets side by side, so they read as clearly different (and next to the raid sets they must not copy)
const RAID = [['vesh', { back: 'vesh_mantle', chest: 'vesh_tunic', legs: 'vesh_legs' }], ['mc mail', { back: 'mc_cloak', chest: 'mc_mail', legs: 'mc_legs' }], ['tc mail', { back: 'tc_mantle', chest: 'tc_mail', legs: 'tc_legs' }],
  ['mc robe', { chest: 'mc_robe', legs: 'mc_legs' }], ['vesh robe', { chest: 'vesh_robe', legs: 'vesh_legs' }], ['tc leather', { chest: 'tc_leather', legs: 'tc_legs' }]];
const CMP = Object.entries(SETS).map(([sk, s]) => [sk, setGear(s)]).concat(RAID);
sheet('compare', WHO.slice(0, 6).map(([lab, o]) => [lab, CMP.map(([, gr]) => [H(o, gr)])]), 120, 120, BG, 120, 'Crafted sets next to the raid sets', CMP.map(([n]) => n));
sheet('compare_small', [['', CMP.map(([, gr]) => [H(WHO[0][1], gr)])], ['', CMP.map(([, gr]) => [H(WHO[2][1], gr), DARK])], ['', CMP.map(([, gr]) => [H(WHO[4][1], gr)])], ['', CMP.map(([, gr]) => [H(WHO[5][1], gr), DARK])]],
  64, 64, BG, 0, 'At 64 px: ' + CMP.map(([n]) => n).join(', '));
// c. weapons: on warriors and rogues (sword, mace) and the hunter's back hand; close-ups; next to the Trialsworn weapons
const CROP = { warrior: '30 -24 110 110', rogue: '58 -6 100 100', mage: '30 -28 110 110', hunter: '10 -10 110 110' };
const wpnWho = WHO.filter(([, o]) => o.cls !== 'mage').concat([['troll hunter m', { cls: 'hunter', race: 'troll', gender: 'm', skin: 0, hair: 1 }], ['human paladin f', { cls: 'paladin', race: 'human', gender: 'f', skin: 2, hair: 1 }]].filter(([, o]) => CLASSES.includes(o.cls)));
sheet('weapons', WEAPONS.map(([k]) => [k, wpnWho.map(([, o]) => [H(o, { weapon: k })])]), 130, 130, BG, 130, 'Moonforged weapons: ' + wpnWho.map(([l]) => l).join(', '));
sheet('weapons_closeup', WEAPONS.map(([k]) => [k, [WHO[0][1], WHO[2][1]].flatMap((o) => [[H(o, { weapon: k }), BG, CROP[o.cls]], [H(o, { weapon: k }), DARK, CROP[o.cls]], [H(o, Object.assign({ weapon: k }, setGear(SETS.moonforged))), BG, CROP[o.cls]]])]),
  220, 220, BG, 130, 'Close-up: warrior, rogue; light | dark | with the Moonforged set');
const TWCMP = ['moonforged_blade', 'trialsworn_sword', 'tc_sword', 'militia_sword', 'moonforged_hammer', 'trialsworn_mace', 'tc_mace', 'mc_mace'].filter((k) => LK.weapon.includes(k));
sheet('weapons_compare', [['light', TWCMP.map((k) => [H(WHO[0][1], { weapon: k }), BG, CROP.warrior])], ['64px', TWCMP.map((k) => [H(WHO[0][1], { weapon: k }), DARK])]], 120, 120, BG, 60, 'Next to the other weapons: ' + TWCMP.join(', '));
// d. keepsakes: each on every body, then side by side at 64 px, then with each set
sheet('keepsakes', KEEPSAKES.map((k) => [k, WHO.map(([, o]) => [H(o, { back: k })])]), 130, 130, BG, 150, 'Profession keepsakes (back): ' + WHO.map(([l]) => l).join(', '));
sheet('keepsakes_close', KEEPSAKES.map((k) => [k, [WHO[0][1], WHO[3][1], WHO[5][1]].flatMap((o) => [[H(o, { back: k }), BG], [H(o, { back: k }), DARK]])]), 200, 200, BG, 150, 'Keepsakes up close: human warrior m, dwarf rogue f, gnome mage f, light | dark');
const OLDK = ['silverleaf_aegis', 'reedsong_lute', 'beerhammer_cloak'].filter((k) => LK.back.includes(k));
sheet('keepsakes_small', [['', KEEPSAKES.concat(OLDK).map((k) => [H(WHO[0][1], { back: k })])], ['', KEEPSAKES.concat(OLDK).map((k) => [H(WHO[2][1], { back: k }), DARK])], ['', KEEPSAKES.concat(OLDK).map((k) => [H(WHO[5][1], { back: k })])]],
  64, 64, BG, 0, 'At 64 px: ' + KEEPSAKES.concat(OLDK).join(', '));
sheet('keepsakes_with_sets', KEEPSAKES.map((k) => [k, Object.values(SETS).map((s) => [H(WHO[0][1], Object.assign(setGear(s), { back: k }))]).concat(Object.values(SETS).map((s) => [H(WHO[4][1], Object.assign(setGear(s), { back: k }))]))]),
  110, 110, BG, 150, 'Keepsakes with each crafted set: human warrior (3), undead mage (3)');
// e. portraits (the head-and-shoulders crop of the character list)
sheet('portraits', Object.entries(SETS).map(([sk, s]) => [sk, WHO.slice(0, 6).map(([, o]) => [ART.portrait(Object.assign({}, o, { gear: setGear(s) }))])]).concat(KEEPSAKES.map((k) => [k, WHO.slice(0, 6).map(([, o]) => [ART.portrait(Object.assign({}, o, { gear: { back: k } }))])])), 90, 90, BG, 150, 'Portraits');

console.log('drawn ' + drawn + ' crafted looks on ' + RACES.length + ' races x 2 genders x ' + CLASSES.length + ' classes; ' + same + ' older heroes/icons/mobs identical to HEAD');
console.log('sheets:\n  ' + sheets.map((s) => path.relative(ROOT, s)).join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n  ' + problems.slice(0, 40).join('\n  ') : 'OK: all checks pass');
process.exitCode = problems.length ? 1 : 0;
