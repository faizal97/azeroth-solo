// Checks and contact sheets for the Trialsworn reward looks: the cloak (back), five weapons and the bow (src/art.js),
// the charger mount and its icon plus the trialsworn_hourglass icon (src/art_mounts.js). Every new look draws on every
// race, gender and class and changes the hero; every older look, hero, mount and icon is identical to the committed files.
// Usage: node art/trialsworn/render.js   (sheets go to art/trialsworn/out/)
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

const WEAPONS = ['trialsworn_sword', 'trialsworn_dagger', 'trialsworn_staff', 'trialsworn_mace', 'trialsworn_axe'];
const BACK = 'trialsworn_cloak', BOW = 'trialsworn_bow', MOUNT = 'trialsworn_charger';
const TIERS = ['', '_t15', '_t20'];
const MONTHS = ['202610', '202611', '202612', '202701', '202702', '202703', '202704', '202705', '202706', '202707', '202708', '202709'].map((m) => BACK + '_m' + m);
const ALLW = WEAPONS.flatMap((k) => TIERS.map((t) => k + t)), ALLBOW = TIERS.map((t) => BOW + t);
const ALLBACK = TIERS.map((t) => BACK + t).concat(MONTHS), ALLMOUNT = TIERS.map((t) => MOUNT + t);
const ICONS = ['trialsworn_hourglass'].concat(ALLMOUNT.map((k) => 'mount_' + k));

function load(artSrc, mountSrc, report) {
  const dbg = artSrc.replace('function safe(fn, fb) { try { return fn(); } catch (e) {', 'function safe(fn, fb) { try { return fn(); } catch (e) { if (W.__DBG) W.__DBG(e);');
  if (dbg === artSrc) bad('debug hook: safe() not found');
  const w = { __DBG: report }; w.window = w; vm.createContext(w); vm.runInContext(dbg, w);
  if (mountSrc) vm.runInContext(mountSrc, w);
  return w.ART;
}
const git = (f) => execFileSync('git', ['show', 'HEAD:' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
let current = '';
const ART = load(fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8'), fs.readFileSync(path.join(ROOT, 'src/art_mounts.js'), 'utf8'),
  (e) => bad('exception drawing ' + current + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)));
let OLD = null;
try { OLD = load(git('src/art.js'), git('src/art_mounts.js'), () => {}); } catch (e) { bad('could not load HEAD art: ' + e.message); }

// ---- 1. keys ----
const LK = ART.keys.looks;
for (const k of ALLW) if (!LK.weapon.includes(k)) bad('missing weapon look ' + k);
for (const k of ALLBOW) if (!LK.ranged.includes(k)) bad('missing ranged look ' + k);
if (!LK.ranged.includes('militia_longbow')) bad('militia_longbow lost from ranged');
for (const k of ALLBACK) if (!LK.back.includes(k)) bad('missing back look ' + k);
for (const k of ALLMOUNT) if (!(ART.keys.mounts || []).includes(k)) bad('missing mount ' + k);
for (const sl of ['weapon', 'ranged', 'back']) for (const k of LK[sl]) if (/^trialsworn/.test(k) && !ALLW.concat(ALLBOW, ALLBACK).includes(k)) bad('unexpected key ' + k);
for (const k of ICONS) if (!ART.keys.icons.includes(k)) bad('missing icon ' + k);

// ---- 2. every new look on every race, gender and class ----
const RACES = ART.keys.races, CLASSES = ART.keys.classes;
let drawn = 0;
for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
  const base = { cls: cl, race: r, gender: gd, skin: 1, hair: 2 };
  current = r + ' ' + gd + ' ' + cl + ' plain';
  const plain = norm(ART.hero(base));
  const cases = ALLW.map((k) => ['weapon', k]).concat(ALLBACK.map((k) => ['back', k]), cl === 'hunter' ? ALLBOW.map((k) => ['ranged', k]) : []);
  const seen = {};
  for (const [sl, k] of cases) {
    current = r + ' ' + gd + ' ' + cl + ' ' + k;
    const s = ART.hero(Object.assign({ gear: { [sl]: k } }, base)); drawn++;
    if (/NaN|undefined|Infinity/.test(s)) bad(k + ' has NaN/undefined on ' + r + ' ' + gd + ' ' + cl);
    if (s.length < 4000) bad(k + ' is a placeholder on ' + r + ' ' + gd + ' ' + cl);
    if (norm(s) === plain) bad(k + ' changes nothing on ' + r + ' ' + gd + ' ' + cl);
    if (seen[norm(s)]) bad(k + ' draws the same as ' + seen[norm(s)] + ' on ' + r + ' ' + gd + ' ' + cl); seen[norm(s)] = k;
    const p = ART.portrait(Object.assign({ gear: { [sl]: k } }, base));
    if (/NaN|undefined|Infinity/.test(p)) bad(k + ' portrait NaN on ' + r + ' ' + gd + ' ' + cl);
  }
}
// ---- 3. nothing old changed ----
let same = 0;
if (OLD) {
  const ol = OLD.keys.looks;
  for (const r of RACES) for (const gd of ['m', 'f']) for (const cl of CLASSES) {
    const base = { cls: cl, race: r, gender: gd, skin: 2, hair: 1 };
    const cases = [base];
    for (const sl of ['back', 'chest', 'legs', 'mask', 'weapon', 'ranged']) for (const k of ol[sl] || []) if ((sl !== 'weapon' || cl === 'warrior' || cl === 'hunter' || cl === 'rogue') && (sl !== 'ranged' || cl === 'hunter')) cases.push(Object.assign({ gear: { [sl]: k } }, base));
    cases.push(Object.assign({ gear: { ranged: 'militia_longbow', weapon: 'militia_sword' } }, base));
    for (const o of cases) {
      if (norm(ART.hero(o)) !== norm(OLD.hero(o))) bad('hero changed vs HEAD: ' + JSON.stringify(o)); else same++;
      if (norm(ART.portrait(o)) !== norm(OLD.portrait(o))) bad('portrait changed vs HEAD: ' + JSON.stringify(o));
    }
  }
  for (const k of OLD.keys.mounts || []) { if (norm(ART.mount(k)) !== norm(OLD.mount(k))) bad('mount changed vs HEAD: ' + k); else same++; }
  for (const k of OLD.keys.icons) { if (norm(ART.icon(k)) !== norm(OLD.icon(k))) bad('icon changed vs HEAD: ' + k); else same++; }
  if (norm(ART.mount('nope')) !== norm(OLD.mount('nope'))) bad('mount placeholder changed');
  for (const k of Object.keys(OLD.keys)) if (!['looks', 'mounts', 'icons'].includes(k) && JSON.stringify(OLD.keys[k]) !== JSON.stringify(ART.keys[k])) bad('ART.keys.' + k + ' changed');
  for (const sl of Object.keys(OLD.keys.looks)) for (const k of OLD.keys.looks[sl]) if (!ART.keys.looks[sl].includes(k)) bad('old look lost ' + sl + ':' + k);
}
// ---- 4. mount + icons: valid SVG ----
const allIds = new Set();
function check(name, s, root) {
  if (!root.test(s)) bad(name + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) bad(name + ': NaN/undefined/null');
  if (/<text|<filter|<foreignObject|<image|href=|<script|<style/.test(s)) bad(name + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) { if (allIds.has(id)) bad(name + ': id reused ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) bad(name + ': dangling ref ' + m[1]);
}
const MROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 160 128" width="160" height="128">/;
const IROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 64 64" width="64" height="64">/;
for (const k of ALLMOUNT) { const m = ART.mount(k); check('mount ' + k, m, MROOT); if (m.length < 3 * ART.mount('nope').length) bad('mount ' + k + ' looks like the placeholder'); }
if (new Set(ALLMOUNT.map((k) => norm(ART.mount(k)))).size !== 3) bad('mount tiers are not all different');
const mountS = ART.mount(MOUNT);
for (const k of ICONS) { const s = ART.icon(k); check('icon ' + k, s, IROOT); if (s.length < 1500) bad('icon ' + k + ' looks like a placeholder'); }

// ---- 5. contact sheets ----
const HEAD = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)"(?: width="[^"]+" height="[^"]+")?>/;
const nest = (s, x, y, w, h, vb) => `<g transform="translate(${x},${y})">${s.replace(HEAD, (m, v) => `<svg x="0" y="0" width="${w}" height="${h}" viewBox="${vb || v}">`)}</g>`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
const sheets = [];
// rows: [label, [cells]]; a cell is [svg, bg?, viewBox?]
function sheet(name, rows, cw, ch, bg, labelW, caption) {
  const pad = 6, lw = labelW == null ? 140 : labelW, cols = Math.max(...rows.map((r) => r[1].length)), top = caption ? 22 : 0;
  let body = caption ? `<text x="${pad}" y="16" font-family="Helvetica, Arial" font-size="13" fill="#fff">${esc(caption)}</text>` : '';
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
const FIT = { warrior: 'trialsworn_sword', paladin: 'trialsworn_mace', rogue: 'trialsworn_dagger', priest: 'trialsworn_staff', druid: 'trialsworn_staff', mage: 'trialsworn_staff', warlock: 'trialsworn_staff', hunter: 'trialsworn_axe', shaman: 'trialsworn_mace' };
const H = (o, gear) => ART.hero(Object.assign({}, o, gear ? { gear } : {}));
const BG = '#7c8a80', DARK = '#2a3440';
const cols = (o) => [[H(o)], [H(o, { back: BACK })]].concat(WEAPONS.map((k) => [H(o, { weapon: k })]), [[o.cls === 'hunter' ? H(o, { ranged: BOW }) : ''], [H(o, Object.assign({ back: BACK, weapon: FIT[o.cls] }, o.cls === 'hunter' ? { ranged: BOW } : {})), '#6a6878']]);
const CAP = 'Columns: plain | cloak | ' + WEAPONS.map((k) => k.replace('trialsworn_', '')).join(' | ') + ' | bow (hunter) | cloak + class weapon';
sheet('looks_150', WHO.map(([lab, o]) => [lab, cols(o)]), 150, 150, BG, 140, 'Trialsworn looks. ' + CAP);
sheet('looks_64', WHO.map(([lab, o]) => [lab, cols(o)]).concat(WHO.map(([lab, o]) => [lab, cols(o).map(([s]) => [s, DARK])])), 64, 64, BG, 140, 'At 64 px, light then dark. ' + CAP);
// close-ups of each weapon in the hand (a 64-unit crop around the front hand, drawn big)
const CROP = { warrior: '44 -6 96 96', paladin: '44 -6 96 96', rogue: '48 6 96 96', priest: '40 -10 96 96', mage: '40 -10 96 96', hunter: '30 10 100 100' };
const closeWho = [WHO[0][1], WHO[3][1], WHO[5][1], WHO[2][1], WHO[7][1]];
sheet('weapons_closeup', closeWho.map((o) => [o.race + ' ' + o.cls, WEAPONS.map((k) => [H(o, { weapon: k }), BG, CROP[o.cls] || '46 0 80 80']).concat(o.cls === 'hunter' ? [[H(o, { ranged: BOW }), BG, CROP.hunter]] : [])]), 200, 200, BG, 130, 'Close-up in the hand: ' + WEAPONS.concat(['bow']).join(', '));
// the cloak next to the three raid set cloaks and the other capes (it must read as its own thing)
const otherBacks = ['vesh_mantle', 'mc_cloak', 'tc_mantle', 'perrine_cape', 'beerhammer_cloak'].filter((k) => LK.back.includes(k));
sheet('cloak_compare', [WHO[0], WHO[1], WHO[4]].map(([lab, o]) => [lab, [[H(o, { back: BACK })]].concat(otherBacks.map((k) => [H(o, { back: k })]))]), 150, 150, BG, 140, 'trialsworn_cloak | ' + otherBacks.join(' | '));
sheet('cloak_closeup', [['', WHO.slice(0, 4).map(([, o]) => [H(o, { back: BACK }), BG, '14 24 84 100'])], ['', WHO.slice(4).map(([, o]) => [H(o, { back: BACK }), BG, '14 24 84 100'])]], 220, 262, BG, 0, 'trialsworn_cloak close-up (the part of the back that shows)');
// the twelve monthly cloaks side by side (and the base one first), on three bodies, then close up
const MN = ['base', 'Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27', 'Jul 27', 'Aug 27', 'Sep 27'];
sheet('monthly_cloaks', [WHO[0], WHO[1], WHO[4], WHO[7]].map(([lab, o]) => [lab, [BACK].concat(MONTHS).map((k) => [H(o, { back: k })])]), 130, 130, BG, 130, 'Monthly cloaks: ' + MN.join(' | '));
sheet('monthly_cloaks_closeup', [['', [BACK].concat(MONTHS).slice(0, 7).map((k) => [H(WHO[0][1], { back: k }), BG, '14 24 84 100'])], ['', [BACK].concat(MONTHS).slice(7).map((k) => [H(WHO[0][1], { back: k }), BG, '14 24 84 100'])]], 180, 214, BG, 0, 'Monthly cloaks close-up: ' + MN.join(' | '));
sheet('monthly_cloaks_64', [['light', [BACK].concat(MONTHS).map((k) => [H(WHO[0][1], { back: k })])], ['dark', [BACK].concat(MONTHS).map((k) => [H(WHO[3][1], { back: k }), DARK])]], 64, 64, BG, 50, 'Monthly cloaks at 64 px: ' + MN.join(' | '));
// the tiers: base | t15 | t20 of the full set (cloak + class weapon + bow for hunters), and each weapon close up
const full = (o, t) => H(o, Object.assign({ back: BACK + t, weapon: FIT[o.cls] + t }, o.cls === 'hunter' ? { ranged: BOW + t } : {}));
sheet('tiers_full', WHO.map(([lab, o]) => [lab, TIERS.map((t) => [full(o, t)]).concat(TIERS.map((t) => [full(o, t), DARK]))]), 150, 150, BG, 140, 'Full set, base | t15 | t20, on light then dark');
sheet('tiers_full_64', [['light', WHO.flatMap(([, o]) => TIERS.map((t) => [full(o, t)]))], ['dark', WHO.flatMap(([, o]) => TIERS.map((t) => [full(o, t), DARK]))]], 64, 64, BG, 50, 'Full set at 64 px, base | t15 | t20 per hero');
sheet('tiers_weapons', WEAPONS.map((k) => [k.replace('trialsworn_', ''), TIERS.map((t) => [H(WHO[0][1], { weapon: k + t }), BG, CROP.warrior]).concat(TIERS.map((t) => [H(WHO[0][1], { weapon: k + t }), DARK, CROP.warrior]))]).concat([['bow', TIERS.map((t) => [H(WHO[7][1], { ranged: BOW + t }), BG, CROP.hunter]).concat(TIERS.map((t) => [H(WHO[7][1], { ranged: BOW + t }), DARK, CROP.hunter]))]]), 170, 170, BG, 70, 'Each weapon close up: base | t15 | t20, light then dark');
sheet('tiers_cloak', [['light', TIERS.map((t) => [H(WHO[0][1], { back: BACK + t }), BG, '14 24 84 100']).concat(TIERS.map((t) => [H(WHO[5][1], { back: BACK + t }), BG, '14 24 84 100']))], ['dark', TIERS.map((t) => [H(WHO[0][1], { back: BACK + t }), DARK, '14 24 84 100']).concat(TIERS.map((t) => [H(WHO[5][1], { back: BACK + t }), DARK, '14 24 84 100']))]], 180, 214, BG, 50, 'Cloak close-up, base | t15 | t20 (human warrior, undead mage)');
// mount: alone (big and small, light and dark), ridden by all eight, next to the racial horse
const RIDER = { x: 27.2, y: 4.6, scale: 0.7 };
const HIP = { human: 82, dwarf: 91.4, gnome: 99.6, nightelf: 73, orc: 83, troll: 72, tauren: 80, undead: 82 };
const raceDy = (r) => Math.round((82 - (HIP[r] || 82)) * RIDER.scale * 10) / 10;
const riddenT = (o, t) => ridden(Object.assign({}, o, { gear: Object.assign({ back: BACK + t, weapon: FIT[o.cls] + t }, o.cls === 'hunter' ? { ranged: BOW + t } : {}) }), MOUNT + t);
const ridden = (o, mk) => {
  const inner = (s, x, y, w, h) => s.replace(HEAD, (m, v) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${v}">`);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -8 200 144" width="200" height="144">' + inner(ART.hero(o), RIDER.x, RIDER.y + raceDy(o.race), 128 * RIDER.scale, 128 * RIDER.scale) + inner(ART.mount(mk), 0, 0, 160, 128) + '</svg>';
};
sheet('mount', [['light', ALLMOUNT.map((k) => [ART.mount(k)]).concat([[ART.mount('horse')]])], ['dark', ALLMOUNT.map((k) => [ART.mount(k), DARK])]], 320, 256, '#c8b07a', 50, 'trialsworn_charger base | t15 | t20 at 320 px, racial horse for comparison');
sheet('mount_small', [['80 px', ALLMOUNT.map((k) => [ART.mount(k)]).concat(ALLMOUNT.map((k) => [ART.mount(k), DARK]), [[ART.mount('horse')], [ART.mount('skeletal_horse')]])]], 80, 64, '#c8b07a', 50, 'charger tiers at 80 px, light then dark');
sheet('mount_ridden', [WHO.slice(0, 4), WHO.slice(4)].map((row, i) => ['riders ' + (i + 1), row.map(([, o]) => [ridden(Object.assign({}, o, { gear: { back: BACK } }), MOUNT)])]).concat([['plain', WHO.slice(0, 4).map(([, o]) => [ridden(o, MOUNT), DARK])], ['plain', WHO.slice(4).map(([, o]) => [ridden(o, MOUNT), DARK])]]), 300, 216, '#b8c4a8', 70, 'Ridden by all eight (rows 1-2 wearing the cloak, rows 3-4 plain on dark)');
sheet('mount_ridden_tiers', WHO.slice(0, 4).map(([lab, o]) => [lab, TIERS.map((t) => [riddenT(o, t)]).concat([[riddenT(o, '_t20'), DARK]])]), 300, 216, '#b8c4a8', 120, 'Full set ridden: base | t15 | t20 | t20 on dark');
sheet('mount_ridden_small', [['', WHO.map(([, o]) => [ridden(o, MOUNT)])], ['', WHO.map(([, o]) => [ridden(o, MOUNT), DARK])]], 100, 72, '#b8c4a8', 0, 'Ridden, at 100 px');
// icons, next to some existing ones
const cmp = ['mount_horse', 'mount_skeletal_horse', 'riding'].filter((k) => ART.keys.icons.includes(k));
sheet('icons', [['64 px', ICONS.concat(cmp).map((k) => [ART.icon(k)])]], 64, 64, '#000', 60, ICONS.concat(cmp).join(' | '));
sheet('icons_40', [['40 px', ICONS.concat(cmp).map((k) => [ART.icon(k)])], ['dark', ICONS.map((k) => [ART.icon(k), '#333'])]], 40, 40, '#000', 50, 'icons at 40 px');
sheet('icons_big', [['', ICONS.map((k) => [ART.icon(k)])]], 200, 200, '#000', 0, 'icons at 200 px: ' + ICONS.join(' | '));

console.log('drawn ' + drawn + ' new looks on ' + RACES.length + ' races x 2 genders x ' + CLASSES.length + ' classes; ' + same + ' older heroes/mounts/icons identical to HEAD');
console.log('sheets:\n  ' + sheets.map((s) => path.relative(ROOT, s)).join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.slice(0, 40).join('\n') : 'OK: 0 problems');
process.exitCode = problems.length ? 1 : 0;
