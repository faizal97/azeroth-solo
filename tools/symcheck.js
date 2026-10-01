// Symbol check (v10.8): every symbol in the game's code and data must be one the fonts can draw, or one drawn in
// src/sym.js. A symbol the fonts lack is filled in by the phone's own font (thin, the wrong style, or a colour emoji).
// Checked: arrows, maths and technical signs, shapes, dingbats and emoji (U+2190–U+2BFF, U+1F000 and up). The fonts
// do have the minus sign; everything else in those blocks must be drawn. node tools/symcheck.js [--selftest]
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
require(path.join(R, 'src', 'sym.js'));
const DRAWN = new Set(globalThis.SYM.CHARS);
const FONT_HAS = new Set(['−']); // measured in the browser against the bundled Alegreya Sans and Marcellus SC
const isSymbol = (cp) => (cp >= 0x2190 && cp <= 0x2bff) || cp >= 0x1f000;
// art packs are SVG drawings (no player text), sym.js is the table itself, report.js is the developer bug report
const SKIP = /^(art[_.].*|art\.js|sym\.js|report\.js)$/;
function scan(text) {
  const bad = [];
  text.split('\n').forEach((line, i) => {
    const t = line.trimStart(); if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return; // comments
    for (const ch of line) { const cp = ch.codePointAt(0); if (isSymbol(cp) && !DRAWN.has(ch) && !FONT_HAS.has(ch)) bad.push({ line: i + 1, ch, cp }); }
  });
  return bad;
}
if (process.argv.includes('--selftest')) {
  const a = scan("x('Go ✓ now')").length, b = scan("x('Go ★ now')").length, c = scan("// ★ in a comment").length, d = scan("x('a − b')").length;
  const ok = a === 0 && b === 1 && c === 0 && d === 0;
  console.log(ok ? 'symcheck selftest: drawn passes, undrawn fails, comments and the minus sign pass' : 'symcheck selftest FAILED');
  process.exit(ok ? 0 : 1);
}
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f), st = fs.statSync(p);
    if (st.isDirectory()) walk(p); else if (f.endsWith('.js') && !SKIP.test(f)) files.push(p);
  }
})(path.join(R, 'src'));
let n = 0;
for (const f of files) for (const b of scan(fs.readFileSync(f, 'utf8'))) {
  n++; console.log(`${path.relative(R, f)}:${b.line}  ${b.ch} (U+${b.cp.toString(16).toUpperCase()}) is not in the fonts: draw it in src/sym.js or use another character`);
}
console.log(n ? `symcheck: ${n} symbol(s) the fonts cannot draw` : `symcheck: every symbol is drawn or in the fonts (${DRAWN.size} drawn)`);
process.exitCode = n ? 1 : 0;
