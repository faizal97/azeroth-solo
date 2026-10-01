// Checks and contact sheets for the Twelvefold Charger (mount trialsworn_year1 and icon mount_trialsworn_year1, src/art_mounts.js),
// the mount for collecting all twelve Trialsworn Cloaks of the first year. Every older mount and icon must be identical to HEAD.
// Usage: node art/yearmount/render.js   (sheets go to art/yearmount/out/)
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
const KEY = 'trialsworn_year1', ICON = 'mount_' + KEY;
const CHARGERS = ['trialsworn_charger', 'trialsworn_charger_t15', 'trialsworn_charger_t20'];

function load(artSrc, mountSrc) { const w = {}; w.window = w; vm.createContext(w); vm.runInContext(artSrc, w); vm.runInContext(mountSrc, w); return w.ART; }
const git = (f) => execFileSync('git', ['show', 'HEAD:' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
const artSrc = fs.readFileSync(path.join(ROOT, 'src/art.js'), 'utf8');
const ART = load(artSrc, fs.readFileSync(path.join(ROOT, 'src/art_mounts.js'), 'utf8'));
let OLD = null;
try { OLD = load(artSrc, git('src/art_mounts.js')); } catch (e) { bad('could not load HEAD art_mounts.js: ' + e.message); }

// ---- 1. keys, and nothing old changed ----
if (!(ART.keys.mounts || []).includes(KEY)) bad('missing mount key ' + KEY);
if (!ART.keys.icons.includes(ICON)) bad('missing icon key ' + ICON);
let same = 0;
if (OLD) {
  for (const k of OLD.keys.mounts) { if (norm(ART.mount(k)) !== norm(OLD.mount(k))) bad('mount changed vs HEAD: ' + k); else same++; }
  for (const k of OLD.keys.icons) { if (norm(ART.icon(k)) !== norm(OLD.icon(k))) bad('icon changed vs HEAD: ' + k); else same++; }
  for (const k of ['nope', '', 'toString']) if (norm(ART.mount(k)) !== norm(OLD.mount(k))) bad('mount placeholder changed for ' + JSON.stringify(k));
  if (JSON.stringify(ART.keys.mounts) !== JSON.stringify(OLD.keys.mounts.concat([KEY]))) bad('keys.mounts is not HEAD + ' + KEY + ': ' + JSON.stringify(ART.keys.mounts));
  const ni = ART.keys.icons.filter((k) => !OLD.keys.icons.includes(k));
  if (JSON.stringify(ni) !== JSON.stringify([ICON])) bad('new icon keys ' + JSON.stringify(ni));
}
// ---- 2. valid SVG ----
const allIds = new Set();
function check(name, s, root) {
  if (!root.test(s)) bad(name + ': bad root');
  if (/NaN|undefined|Infinity|null/.test(s)) bad(name + ': NaN/undefined/null');
  if (/<text|<filter|<foreignObject|<image|href=|<script|<style/.test(s)) bad(name + ': forbidden element');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) { if (!/^mt[0-9a-z]+_/.test(id)) bad(name + ': bad id ' + id); if (allIds.has(id)) bad(name + ': id reused ' + id); allIds.add(id); }
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) if (!ids.includes(m[1])) bad(name + ': dangling ref ' + m[1]);
}
const MROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 160 128" width="160" height="128">/;
const IROOT = /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 64 64" width="64" height="64">/;
const mountS = ART.mount(KEY), iconS = ART.icon(ICON);
check('mount ' + KEY, mountS, MROOT); check('mount again', ART.mount(KEY), MROOT); check('icon ' + ICON, iconS, IROOT);
if (mountS.length < 3 * ART.mount('nope').length) bad('mount looks like the placeholder');
if (norm(mountS) === norm(ART.mount('nope'))) bad('mount is the placeholder');
if (iconS.length < 1500) bad('icon looks like a placeholder');
for (const k of CHARGERS) if (norm(ART.mount(k)) === norm(mountS)) bad('same as ' + k);

// ---- 3. contact sheets ----
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
const MONTHS = ['202610', '202611', '202612', '202701', '202702', '202703', '202704', '202705', '202706', '202707', '202708', '202709'].map((m) => 'trialsworn_cloak_m' + m);
const backs = (ART.keys.looks && ART.keys.looks.back) || [];
const cloak = (i) => (backs.includes(MONTHS[i]) ? { back: MONTHS[i] } : null);
// rider placement as in art/mounts/render.js: hero (128x128) at (27.2, 4.6) in mount units, scale 0.7, shifted per race so the hips sit on the seat
const RIDER = { x: 27.2, y: 4.6, scale: 0.7 };
const HIP = { human: 82, dwarf: 91.4, gnome: 99.6, nightelf: 73, orc: 83, troll: 72, tauren: 80, undead: 82 };
const raceDy = (r) => Math.round((82 - (HIP[r] || 82)) * RIDER.scale * 10) / 10;
const ridden = (o, mk, gear) => {
  const inner = (s, x, y, w, h) => s.replace(HEAD, (m, v) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${v}">`);
  const hs = ART.hero(Object.assign({}, o, gear ? { gear } : {}));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -8 200 144" width="200" height="144">' + inner(hs, RIDER.x, RIDER.y + raceDy(o.race), 128 * RIDER.scale, 128 * RIDER.scale) + inner(ART.mount(mk), 0, 0, 160, 128) + '</svg>';
};
const LIGHT = '#c8b07a', GREEN = '#b8c4a8', DARK = '#2a3440';
sheet('mount', [['light', [[mountS], [mountS, GREEN]]], ['dark', [[mountS, DARK], [mountS, '#000']]]], 480, 384, LIGHT, 50, 'trialsworn_year1, the Twelvefold Charger, at 480 px');
sheet('mount_compare', [['alone', CHARGERS.concat([KEY]).map((k) => [ART.mount(k)])], ['dark', CHARGERS.concat([KEY]).map((k) => [ART.mount(k), DARK])],
  ['ridden', CHARGERS.concat([KEY]).map((k) => [ridden(WHO[0][1], k)])]], 300, 240, LIGHT, 60, 'trialsworn_charger | _t15 | _t20 | trialsworn_year1');
sheet('mount_ridden', [WHO.slice(0, 4), WHO.slice(4)].map((row, r) => ['plain ' + (r + 1), row.map(([, o]) => [ridden(o, KEY), GREEN])])
  .concat([WHO.slice(0, 4), WHO.slice(4)].map((row, r) => ['cloaks ' + (r + 1), row.map(([, o], i) => [ridden(o, KEY, cloak(r * 4 + i * 3 % 12)), DARK])])), 300, 216, GREEN, 70,
  'Ridden by eight heroes: ' + WHO.map(([l]) => l).join(', ') + ' (rows 3-4 wearing a monthly cloak, on dark)');
sheet('mount_small', [['80 px', [[mountS], [mountS, DARK], [mountS, GREEN]].concat(CHARGERS.map((k) => [ART.mount(k)]), [[ART.mount('horse')]])],
  ['ridden 100', WHO.map(([, o]) => [ridden(o, KEY)])], ['dark 100', WHO.map(([, o]) => [ridden(o, KEY), DARK])]], 100, 80, LIGHT, 80, 'Small: 80-100 px, alone (light, dark, green, then the chargers and the horse) and ridden');
sheet('closeup', [['', [[mountS, LIGHT, '108 0 52 64'], [mountS, LIGHT, '8 52 44 72'], [mountS, LIGHT, '40 48 92 58'], [mountS, DARK, '96 56 34 50']]]], 300, 300, LIGHT, 0, 'Close-ups: head and crown | tail | caparison | chest plate');
const cmp = ['mount_' + CHARGERS[0], 'mount_' + CHARGERS[2], 'mount_horse', 'trialsworn_hourglass'];
sheet('icon', [['64 px', [ICON].concat(cmp).map((k) => [ART.icon(k)])], ['40 px', [ICON].concat(cmp).map((k) => [ART.icon(k), '#000', null])]], 64, 64, '#000', 60, ICON + ' | ' + cmp.join(' | '));
sheet('icon_40', [['40 px', [ICON].concat(cmp).map((k) => [ART.icon(k)])], ['dark', [[iconS, '#333']]]], 40, 40, '#000', 50, 'icons at 40 px');
sheet('icon_big', [['', [[iconS], [ART.icon('mount_' + CHARGERS[0])]]]], 256, 256, '#000', 0, ICON + ' at 256 px, next to the charger icon');

console.log(same + ' older mounts/icons identical to HEAD');
console.log('sheets:\n  ' + sheets.map((s) => path.relative(ROOT, s)).join('\n  '));
console.log(problems.length ? 'PROBLEMS (' + problems.length + '):\n' + problems.slice(0, 40).join('\n') : 'OK: 0 problems');
process.exitCode = problems.length ? 1 : 0;
