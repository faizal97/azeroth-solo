// Checks and sheets for the raid set looks in src/art.js (Veshmira's Lair, the Magma Throne, the Tidecrown Citadel):
// every look and its <key>_hard recolour draws on every race, gender and class without throwing, changes the hero,
// and leaves every older look byte-identical to the committed art.js. Contact sheets go to art/raidsets/out/.
// Usage: node art/raidsets/render.js
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
  vesh: { name: "Veshmira's Lair", back: 'vesh_mantle', chest: ['vesh_robe', 'vesh_tunic'], legs: 'vesh_legs' },
  mc: { name: 'The Magma Throne', back: 'mc_cloak', chest: ['mc_robe', 'mc_leather', 'mc_mail'], legs: 'mc_legs' },
  tc: { name: 'The Tidecrown Citadel', back: 'tc_mantle', chest: ['tc_robe', 'tc_leather', 'tc_mail'], legs: 'tc_legs' }
};
const SLOT = {};
for (const s of Object.values(SETS)) { SLOT[s.back] = 'back'; SLOT[s.legs] = 'legs'; s.chest.forEach((k) => { SLOT[k] = 'chest'; }); }
const KEYS = Object.keys(SLOT);

// ---- load art.js (with exceptions reported instead of swallowed by safe()) and the committed one for comparison ----
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

// ---- 1. the keys: each look and its _hard twin is in the right slot ----
for (const k of KEYS) for (const kk of [k, k + '_hard']) if (!ART.keys.looks[SLOT[k]].includes(kk)) bad('missing ' + SLOT[k] + ' look ' + kk);

// ---- 2. every look on every race, gender and class: draws, changes the hero, Hard differs from Normal ----
const RACES = ART.keys.races, CLASSES = ART.keys.classes;
let drawn = 0;
for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
  const base = { cls: cl, race: r, gender: gd, skin: 1, hair: 2 };
  current = r + ' ' + gd + ' ' + cl + ' plain';
  const plain = norm(ART.hero(base));
  for (const k of KEYS) {
    const sl = SLOT[k];
    current = r + ' ' + gd + ' ' + cl + ' ' + k;
    const n = ART.hero(Object.assign({ gear: { [sl]: k } }, base));
    current += '_hard';
    const h = ART.hero(Object.assign({ gear: { [sl]: k + '_hard' } }, base));
    drawn += 2;
    for (const [kk, s] of [[k, n], [k + '_hard', h]]) {
      if (/NaN|undefined|Infinity/.test(s)) bad(kk + ' has NaN/undefined on ' + r + ' ' + gd + ' ' + cl);
      if (s.length < 4000) bad(kk + ' is a placeholder on ' + r + ' ' + gd + ' ' + cl);
      if (norm(s) === plain) bad(kk + ' changes nothing on ' + r + ' ' + gd + ' ' + cl);
    }
    if (norm(n) === norm(h)) bad(k + ' Normal and Hard are identical on ' + r + ' ' + gd + ' ' + cl);
  }
  // the full sets worn together
  for (const [sk, s] of Object.entries(SETS)) for (const ch of s.chest) for (const hd of ['', '_hard']) {
    current = r + ' ' + gd + ' ' + cl + ' ' + sk + ' set ' + ch + hd;
    const o = ART.hero(Object.assign({ gear: { back: s.back + hd, chest: ch + hd, legs: s.legs + hd } }, base));
    if (/NaN|undefined|Infinity/.test(o) || o.length < 4000) bad('full set ' + ch + hd + ' broken on ' + r + ' ' + gd + ' ' + cl);
  }
}
// ---- 3. nothing old changed: plain heroes and every older look match the committed art.js ----
let same = 0;
if (OLD) {
  const oldLooks = OLD.keys.looks;
  for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
    const base = { cls: cl, race: r, gender: gd, skin: 2, hair: 1 };
    const cases = [base];
    for (const sl of ['back', 'chest', 'legs', 'mask', 'weapon']) for (const k of oldLooks[sl] || []) if (sl !== 'weapon' || cl === 'warrior') cases.push(Object.assign({ gear: { [sl]: k } }, base));
    for (const o of cases) { if (norm(ART.hero(o)) !== norm(OLD.hero(o))) bad('changed vs HEAD: ' + JSON.stringify(o)); else same++; if (norm(ART.portrait(o)) !== norm(OLD.portrait(o))) bad('portrait changed vs HEAD: ' + JSON.stringify(o)); }
  }
}

// ---- 4. contact sheets ----
const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)"(?: width="[^"]+" height="[^"]+")?>/;
const nest = (s, x, y, w, h) => `<g transform="translate(${x},${y})">${s.replace(HEAD, `<svg x="0" y="0" width="${w}" height="${h}" viewBox="$1">`)}</g>`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
const sheets = [];
// rows: [label, [cells]]; a cell is [svg, bg?]
function sheet(name, rows, cw, ch, bg, labelW, caption) {
  const pad = 6, lw = labelW == null ? 150 : labelW, cols = Math.max(...rows.map((r) => r[1].length)), top = caption ? 22 : 0;
  let body = caption ? `<text x="${pad}" y="16" font-family="Helvetica, Arial" font-size="13" fill="#fff">${esc(caption)}</text>` : '';
  rows.forEach(([label, cells], j) => {
    const y = top + pad + j * (ch + pad);
    if (lw) body += `<text x="${pad}" y="${y + ch / 2 + 4}" font-family="Helvetica, Arial" font-size="12" fill="#ddd">${esc(label)}</text>`;
    cells.forEach(([s, cbg], i) => {
      const x = pad + lw + i * (cw + pad);
      body += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${cbg || bg}"/>` + (s ? nest(s, x, y, cw, ch) : '');
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
const WHO = [
  ['human warrior m', { cls: 'warrior', race: 'human', gender: 'm', skin: 1, hair: 0 }],
  ['nightelf priest f', { cls: 'priest', race: 'nightelf', gender: 'f', skin: 1, hair: 1 }],
  ['dwarf paladin m', { cls: 'paladin', race: 'dwarf', gender: 'm', skin: 0, hair: 3 }],
  ['orc rogue m', { cls: 'rogue', race: 'orc', gender: 'm', skin: 1, hair: 0 }],
  ['tauren druid m', { cls: 'druid', race: 'tauren', gender: 'm', skin: 1, hair: 1 }],
  ['undead mage f', { cls: 'mage', race: 'undead', gender: 'f', skin: 0, hair: 0 }],
  ['gnome warlock f', { cls: 'warlock', race: 'gnome', gender: 'f', skin: 1, hair: 2 }],
  ['troll hunter m', { cls: 'hunter', race: 'troll', gender: 'm', skin: 0, hair: 1 }]
];
const H = (o, gear) => ART.hero(Object.assign({}, o, gear ? { gear } : {}));
const BG = '#7c8a80', DARK = '#2a3440';
for (const [sk, s] of Object.entries(SETS)) {
  // the full set (each chest piece) on every body: plain, then Normal | Hard per chest
  const rows = WHO.map(([lab, o]) => [lab, [[H(o)]].concat(s.chest.flatMap((ch) => ['', '_hard'].map((hd) => [H(o, { back: s.back + hd, chest: ch + hd, legs: s.legs + hd }), hd ? '#6a6878' : BG])))]);
  sheet(sk + '_full', rows, 150, 150, BG, 150, s.name + ' - full set. Columns: plain | ' + s.chest.map((c) => c + ' Normal | Hard').join(' | '));
  // each piece alone, Normal next to Hard, on a man and a woman
  const pieces = [s.back].concat(s.chest, [s.legs]);
  const who2 = [WHO[0][1], Object.assign({}, WHO[0][1], { gender: 'f', hair: 1 }), WHO[5][1]];
  sheet(sk + '_pieces', pieces.map((k) => [k + ' (' + SLOT[k] + ')', who2.flatMap((o) => [[H(o, { [SLOT[k]]: k })], [H(o, { [SLOT[k]]: k + '_hard' }), '#6a6878']])]), 150, 150, BG, 150, s.name + ' - each piece alone, Normal | Hard: human warrior m, human warrior f, undead mage f');
  // at phone sizes: 64 px and 90 px, on light and dark
  const small = WHO.flatMap(([, o]) => [[H(o, { back: s.back, chest: s.chest[s.chest.length - 1], legs: s.legs })], [H(o, { back: s.back + '_hard', chest: s.chest[s.chest.length - 1] + '_hard', legs: s.legs + '_hard' }), '#6a6878']]);
  const smallR = WHO.flatMap(([, o]) => [[H(o, { back: s.back, chest: s.chest[0], legs: s.legs })], [H(o, { back: s.back + '_hard', chest: s.chest[0] + '_hard', legs: s.legs + '_hard' }), '#6a6878']]);
  sheet(sk + '_small64', [['', small], ['', small.map(([x]) => [x, DARK])], ['', smallR], ['', smallR.map(([x]) => [x, DARK])]], 64, 64, BG, 0, s.name + ' at 64 px: mail/leather set (rows 1-2), robe set (rows 3-4), Normal | Hard');
  sheet(sk + '_small90', [['', small.slice(0, 8)], ['', small.slice(0, 8).map(([x]) => [x, DARK])], ['', smallR.slice(0, 8)]], 90, 90, BG, 0, s.name + ' at 90 px, Normal | Hard');
}
// the three sets side by side (so they read as clearly different), Normal and Hard, big and small
const ALL = Object.values(SETS).flatMap((s) => s.chest.map((ch) => [s, ch]));
for (const [lab, o] of [WHO[0], WHO[1], WHO[4]]) {
  sheet('compare_' + lab.split(' ').slice(0, 2).join('_'), [
    ['Normal', ALL.map(([s, ch]) => [H(o, { back: s.back, chest: ch, legs: s.legs })])],
    ['Hard', ALL.map(([s, ch]) => [H(o, { back: s.back + '_hard', chest: ch + '_hard', legs: s.legs + '_hard' }), '#6a6878'])]
  ], 130, 130, BG, 60, 'All three sets, every chest: ' + ALL.map(([, ch]) => ch).join(', '));
}
sheet('compare_small', [
  ['N', ALL.map(([s, ch]) => [H(WHO[0][1], { back: s.back, chest: ch, legs: s.legs })])],
  ['H', ALL.map(([s, ch]) => [H(WHO[0][1], { back: s.back + '_hard', chest: ch + '_hard', legs: s.legs + '_hard' })])],
  ['N', ALL.map(([s, ch]) => [H(WHO[3][1], { back: s.back, chest: ch, legs: s.legs }), DARK])],
  ['H', ALL.map(([s, ch]) => [H(WHO[3][1], { back: s.back + '_hard', chest: ch + '_hard', legs: s.legs + '_hard' }), DARK])]
], 64, 64, BG, 20, 'All three sets at 64 px (same order), on light and dark');
// portraits (the 64 px head-and-shoulders crop the game uses for the character list)
sheet('portraits', Object.values(SETS).map((s) => [s.name, WHO.slice(0, 6).flatMap(([, o]) => [[ART.portrait(Object.assign({}, o, { gear: { back: s.back, chest: s.chest[0], legs: s.legs } }))], [ART.portrait(Object.assign({}, o, { gear: { back: s.back + '_hard', chest: s.chest[0] + '_hard', legs: s.legs + '_hard' } }))]])]), 96, 96, BG, 150, 'Portraits, Normal | Hard');

console.log('drawn ' + drawn + ' single looks on ' + RACES.length + ' races x 2 genders x ' + CLASSES.length + ' classes; ' + same + ' older looks/heroes identical to HEAD');
console.log('sheets:\n  ' + sheets.join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n  ' + problems.slice(0, 40).join('\n  ') : 'OK: all checks pass');
process.exitCode = problems.length ? 1 : 0;
