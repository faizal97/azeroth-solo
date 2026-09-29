// v10: rename the world. Rewrites every old name in the game's text from tools/rename_v10.json (old → new), longest
// name first, whole words only, carrying a plural or possessive ending over (Murlocs → Mirelings, VanCleef's →
// Blackwell's). Case-sensitive, so ids and keys (goldshire, vancleef) are left alone and saves keep loading.
// The fan notice line may name Blizzard and is skipped. Safe to run again: new names never match old ones.
//   node tools/apply_v10.js           rewrite the files, print what changed
//   node tools/apply_v10.js --dry     only count
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'rename_v10.json'), 'utf8'));
const NOTICE = /Not affiliated with|trademarks? (or registered trademarks )?of Blizzard/;

const pairs = Object.entries(map).filter(([o, v]) => v.new && v.new !== o && v.status !== 'keep').map(([o, v]) => [o, v.new]);
// the same names after a lowercase article ('the Charred Vale'), and the peoples written in lowercase ('tauren')
for (const [o, n] of pairs.slice()) if (/^The /.test(o) && !map['t' + o.slice(1)]) pairs.push(['t' + o.slice(1), /^The /.test(n) ? 't' + n.slice(1) : n]);
const LOWER = { 'night elves': 'wood elves', 'night elf': 'wood elf', tauren: 'hornfolk', murlocs: 'mirelings', murloc: 'mireling', quilboar: 'spinehide', furbolgs: 'bearkin', furbolg: 'bearkin',
  worgen: 'werewolves', troggs: 'cavekin', trogg: 'cavekin', kodos: 'dustbacks', kodo: 'dustback', highborne: 'starborn', crocolisks: 'crocodiles', crocolisk: 'crocodile', zhevra: 'stripebacks',
  scorpids: 'scorpions', scorpid: 'scorpion', silithid: 'hiveborn', plainstriders: 'longnecks', plainstrider: 'longneck', devilsaurs: 'thundertooths', devilsaur: 'thundertooth', felguards: 'pit guards',
  felguard: 'pit guard', dreadlords: 'demon lords', dreadlord: 'demon lord', dragonflight: 'brood', drakonids: 'drakeborn', drakonid: 'drakeborn', 'wind riders': 'wyvern riders', 'wind rider': 'wyvern rider',
  fel: 'gloom', forsaken: 'reclaimed' };
const PROSE_ONLY = new Set(Object.keys(LOWER));
for (const [o, n] of Object.entries(LOWER)) pairs.push([o, n]);
pairs.sort((a, b) => b[0].length - a[0].length);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// an apostrophe may be escaped in the source (Gath\'Ilzogg inside '...'), so match both forms
const re = new RegExp(`(?<![A-Za-z0-9_])(${pairs.map((p) => esc(p[0]).replace(/'/g, "\\\\?'")).join('|')})(s|\\\\?'s)?(?![A-Za-z0-9_])`, 'g');
const lookup = Object.fromEntries(pairs);
// inside a single-quoted JS string an apostrophe in a new name must be escaped: find which quote (if any) the match sits in
const quoteAt = (line, off) => {
  let q = null, start = -1;
  for (let i = 0; i < off; i++) {
    const c = line[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; }
    else if (c === "'" || c === '"' || c === '`') { q = c; start = i; }
    else if (c === '/' && line[i + 1] === '/') return null; // a comment: nothing to escape
  }
  return q ? { q, start } : null;
};
// the whole string a match sits in (from its opening quote to the closing one)
const stringAt = (line, at) => { let i = at.start + 1; for (; i < line.length; i++) { if (line[i] === '\\') { i++; continue; } if (line[i] === at.q) break; } return line.slice(at.start + 1, i); };
const sub = (line, js) => line.replace(re, (m, w, suf, off) => {
  const key = w.replace(/\\'/g, "'"), at = js ? quoteAt(line, off) : null;
  if (PROSE_ONLY.has(key) && (js ? !at || !/\s/.test(stringAt(line, at)) : false)) return m;
  let n = lookup[key] + (suf || '').replace(/\\'/, "'");
  if (js && n.includes("'") && at && at.q === "'") n = n.replace(/'/g, "\\'");
  return n;
});

const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|html|json)$/.test(f)) files.push(p); } };
walk(path.join(ROOT, 'src'));
for (const f of ['README.md', 'docs/lore/canon.md', 'app/pubspec.yaml', 'app/android/app/src/main/AndroidManifest.xml', 'app/lib/main.dart']) if (fs.existsSync(path.join(ROOT, f))) files.push(path.join(ROOT, f));

let total = 0; const per = [];
for (const f of files) {
  const js = /\.js$/.test(f);
  const src = fs.readFileSync(f, 'utf8');
  let n = 0;
  const out = src.split('\n').map((line) => {
    if (NOTICE.test(line)) return line;
    // a new name that starts with The after an article: 'the The Blackcloister' → 'the Blackcloister'
    const r = sub(line, js).replace(/\b([Tt]he) The (?=[A-Z])/g, '$1 ');
    if (r !== line) n += (line.match(re) || []).length;
    return r;
  }).join('\n');
  if (n) { per.push([path.relative(ROOT, f), n]); total += n; if (!DRY) fs.writeFileSync(f, out); }
}
per.sort((a, b) => b[1] - a[1]);
console.log(`${DRY ? 'would rename' : 'renamed'} ${total} names in ${per.length} files`);
for (const [f, n] of per.slice(0, 12)) console.log(`  ${String(n).padStart(5)}  ${f}`);
