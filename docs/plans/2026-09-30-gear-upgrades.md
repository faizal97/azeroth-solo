# Gear Upgrades Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let players spend Mentor Marks to raise any level-57+ blue or purple item, one 3% step at a time, up to the
current ceiling (purples 100%, blues 92%), so old gear stays a real choice.

**Architecture:** One data block (`D.UPGRADE` in core.js) names the ceiling raid, step size, caps and costs. game.js
works out each slot's reference power from the ceiling raid's boss loot, and rewrites an item's stats, armour, spell
power and weapon damage from a saved snapshot (`it.base`) whenever its step (`it.up`) changes. Every reader
(`E.statsFor`, `G.itemScore`, the tooltip, Friends) keeps reading `it.stats` as today, so nothing else changes and old
saves load untouched (no `it.up` = step 0). Level-60 dungeon and raid clears start paying Marks so upgrades can be
earned before Trials exist.

**Tech Stack:** plain browser JS (`src/`), Node sims (`sim/`), `python3 build.py`.

Design: docs/plans/2026-09-30-horizontal-progression-design.md (section 1 and "Measured 2026-09-30").

---

### Task 1: The upgrade rules and math (sim first)

**Files:**
- Create: `sim/upgrades.js`
- Modify: `src/data/core.js` (after `D.HEIRLOOMS`, around line 434)
- Modify: `src/game.js` (after `G.buyHeirloom`, around line 1640)

**Step 1: Write the failing sim**

```js
// Gear upgrades (v10.3): Mentor Marks raise a level-57+ blue or purple item a 3% step at a time, up to the ceiling
// (docs/plans/2026-09-30-horizontal-progression-design.md). node sim/upgrades.js
globalThis.localStorage = (() => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; })();
require('../src/data.js'); require('../src/engine.js'); require('../src/bots.js'); require('../src/game.js');
const { G, D } = globalThis;
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL ' + m); } };
G.newGame({ name: 'U', cls: 'warrior', race: 'human' }); G.S.player.level = 60;
const U = D.UPGRADE, loot = (raid) => { const s = new Set(); for (const p of D.DUNGEONS[raid].pulls) for (const m of p.mobs) for (const i of (D.MOBS[m].loot || [])) s.add(i); return [...s].map(G.copyItem); };

// who can upgrade
const mc = loot('molten_core'), tc = loot('tidecrown_citadel'), strat = loot('stratholme');
ok(mc.every((it) => G.upgradeInfo(it).max > 0), 'every Magma Throne item has steps');
ok(G.upgradeInfo(G.genGear('chest', 60, 2)).max === 0, 'greens never upgrade');
ok(G.upgradeInfo(G.copyItem('worn_shortsword')).max === 0, 'low-level items never upgrade');
ok(G.upgradeInfo(G.makeHeirloom('heirloom_blade', 60)).max === 0, 'heirlooms never upgrade');

// the math: stepping to the top lands on the cap, never above it
for (const it of mc.concat(strat)) {
  const inf = G.upgradeInfo(it), top = G.upgradedCopy(it, inf.max), ref = G.upgradeRef(it.slot);
  ok(Math.abs(G.itemPoints(top) - U.cap[it.q] * ref) <= 1.5, `${it.name} tops out at the cap (${G.itemPoints(top)} vs ${(U.cap[it.q] * ref).toFixed(1)})`);
  ok(G.upgradedCopy(it, inf.max + 3).stats && G.itemPoints(G.upgradedCopy(it, inf.max + 3)) === G.itemPoints(top), `${it.name} cannot pass the cap`);
  if (it.dmg) ok(top.dmg[1] > it.dmg[1], `${it.name} weapon damage rises too`);
}
ok(mc.every((it) => G.upgradeInfo(it).max >= 1 && G.upgradeInfo(it).max <= 6), 'Magma Throne items take 1-6 steps (design: about 3-4)');

// the goal: a fully upgraded Magma Throne slot is within a few percent of Tidecrown's
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const mcTop = avg(mc.map((it) => G.itemPoints(G.upgradedCopy(it, G.upgradeInfo(it).max)) / G.upgradeRef(it.slot)));
ok(mcTop >= 0.97, `upgraded Magma Throne reaches ${(mcTop * 100).toFixed(0)}% of the ceiling`);
const blueTop = avg(strat.filter((it) => it.q === 3).map((it) => G.itemPoints(G.upgradedCopy(it, G.upgradeInfo(it).max)) / G.upgradeRef(it.slot)));
ok(blueTop <= 0.93, `upgraded blues stop lower (${(blueTop * 100).toFixed(0)}%)`);

// old saves: an item without it.up is untouched, and step 0 is the item itself
const sword = mc.find((it) => it.dmg); ok(JSON.stringify(G.upgradedCopy(sword, 0).stats) === JSON.stringify(sword.stats), 'step 0 changes nothing');

console.log(`upgrades: ${n - bad}/${n} checks pass`);
process.exit(bad ? 1 : 0);
```

**Step 2: Run it and see it fail**

Run: `node sim/upgrades.js`
Expected: crash with `Cannot read properties of undefined` (no `D.UPGRADE`) or `G.upgradeInfo is not a function`.

**Step 3: Add the rules to `src/data/core.js`** (after the `D.HEIRLOOMS = { ... };` block)

```js
  // Gear upgrades (v10.3): Mentor Marks raise a level-57+ blue or purple item one step at a time. A step adds 3% of the
  // ceiling (the average power of that slot in the ceiling raid's loot); purples stop at 100% of it, blues at 92%.
  // A new raid moves `raid` to itself, which gives every older item new steps. Design:
  // docs/plans/2026-09-30-horizontal-progression-design.md
  D.UPGRADE = { raid: 'tidecrown_citadel', step: 0.03, cap: { 3: 0.92, 4: 1 }, minLvl: 57, cost: (n) => 10 + 5 * n };
```

**Step 4: Add the math to `src/game.js`** (after `G.buyHeirloom`)

```js
  // ---- gear upgrades (v10.3): it.up is the step, it.base the item as it dropped; stats are rewritten from it.base
  G.itemPoints = (it) => { let n = (it && it.sp) || 0; for (const k in ((it && it.stats) || {})) n += it.stats[k]; return n; };
  let upRef = null;
  G.upgradeRef = function (slot) {
    if (!upRef) {
      const by = {}, all = [];
      for (const p of D.DUNGEONS[D.UPGRADE.raid].pulls) for (const m of p.mobs) for (const id of (D.MOBS[m].loot || [])) {
        const it = D.ITEMS[id]; if (!it || by[it.slot + ':' + id]) continue; by[it.slot + ':' + id] = 1;
        (by[it.slot] = by[it.slot] || []).push(G.itemPoints(it)); all.push(G.itemPoints(it));
      }
      const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      upRef = { '*': avg(all) }; for (const s of D.GEAR_SLOTS) if (Array.isArray(by[s])) upRef[s] = avg(by[s]);
    }
    return upRef[slot] || upRef['*'];
  };
  const upBase = (it) => it.base || { stats: Object.assign({}, it.stats), armor: it.armor, sp: it.sp, dmg: it.dmg && it.dmg.slice() };
  G.upgradeInfo = function (it) {
    const U = D.UPGRADE, up = (it && it.up) || 0;
    const none = { max: 0, up, cost: 0 };
    if (!it || it.heirloom || !D.GEAR_SLOTS.includes(it.slot) || !U.cap[it.q] || (it.lvl || 0) < U.minLvl) return none;
    const ref = G.upgradeRef(it.slot), p0 = G.itemPoints(upBase(it)), capPts = U.cap[it.q] * ref;
    if (p0 <= 0 || p0 >= capPts) return none;
    const max = Math.ceil((capPts - p0) / (U.step * ref) - 1e-9);
    return { max, up, cost: up < max ? U.cost(up + 1) : 0 };
  };
  G.upgradedCopy = function (it, up) {
    const U = D.UPGRADE, b = upBase(it), inf = G.upgradeInfo(it); up = Math.max(0, Math.min(up, inf.max));
    const out = JSON.parse(JSON.stringify(it));
    if (!up) { if (it.base) { Object.assign(out, JSON.parse(JSON.stringify(b))); delete out.base; delete out.up; } return out; }
    const ref = G.upgradeRef(it.slot), p0 = G.itemPoints(b), f = Math.min(p0 + up * U.step * ref, U.cap[it.q] * ref) / p0;
    out.base = JSON.parse(JSON.stringify(b)); out.up = up;
    out.stats = {}; for (const k in b.stats || {}) out.stats[k] = Math.round(b.stats[k] * f);
    if (b.sp) out.sp = Math.round(b.sp * f);
    if (b.armor) out.armor = Math.round(b.armor * f);
    if (b.dmg) out.dmg = [Math.round(b.dmg[0] * f), Math.round(b.dmg[1] * f)];
    return out;
  };
```

**Step 5: Run the sim**

Run: `node sim/upgrades.js`
Expected: `upgrades: N/N checks pass`. If "tops out at the cap" fails by rounding on a small item, widen that check's
tolerance to 2, not the math. If "Magma Throne items take 1-6 steps" fails, print the step counts and report them before
changing `D.UPGRADE.step`.

**Built differently (2026-09-30):** one average per slot put staves and spell-power robes above the ceiling. The
reference is now the item's own family (slot, weapon or armour type, caster or not) in the ceiling raid; a family the
raid lacks uses its best level-57+ piece anywhere, raised by the raid's measured lead. Items already at the ceiling (the
Magma Throne's Emberfall) get no steps. Result: 13 of 16 Magma Throne items take 4 steps.

**Step 6: Commit**

```bash
git add sim/upgrades.js src/data/core.js src/game.js
git commit -m "Gear upgrades: the rules (D.UPGRADE) and the math, with sim/upgrades.js"
```

---

### Task 2: Spending Marks on a step

**Files:**
- Modify: `src/game.js` (after `G.upgradedCopy`)
- Modify: `sim/upgrades.js` (before the final `console.log`)

**Step 1: Add failing checks**

```js
// spending: equipped and bag items, Marks taken, refused without enough Marks or in a fight
const P = G.S.player, a0 = G.account(); a0.marks = 100; G.saveAccount(a0);
P.equip.weapon = G.copyItem(sword.id); const before = P.equip.weapon.dmg[1];
ok(G.upgradeItem({ slot: 'weapon' }) === true && P.equip.weapon.up === 1 && P.equip.weapon.dmg[1] > before, 'equipped weapon goes up a step');
ok(G.account().marks === 100 - D.UPGRADE.cost(1), 'the step cost its Marks');
G.addItem(G.copyItem(mc.find((it) => !it.dmg).id), 1); const bi = P.bags.length - 1;
ok(G.upgradeItem({ bag: bi }) === true && P.bags[bi].item.up === 1, 'a bag item goes up a step');
const a1 = G.account(); a1.marks = 0; G.saveAccount(a1);
ok(G.upgradeItem({ slot: 'weapon' }) === false && P.equip.weapon.up === 1, 'no Marks, no step');
ok(G.upgradeItem({ slot: 'chest' }) === false || !P.equip.chest || !G.upgradeInfo(P.equip.chest).max, 'starting gear cannot be upgraded');
// a save round trip keeps the step
const saved = JSON.parse(JSON.stringify(P.equip.weapon)); ok(saved.up === 1 && saved.base && G.upgradeInfo(saved).up === 1, 'the step survives a save');
```

**Step 2: Run it and see it fail**

Run: `node sim/upgrades.js`
Expected: `G.upgradeItem is not a function`.

**Step 3: Implement**

```js
  // where = { slot } for an equipped item or { bag } for a bag index. Returns true when a step was bought.
  G.upgradeItem = function (where) {
    const P = G.S.player, it = where.slot ? P.equip[where.slot] : (P.bags[where.bag] || {}).item;
    if (!it) return false;
    if (G.fight) { toast('You are in combat.'); return false; }
    const inf = G.upgradeInfo(it);
    if (inf.up >= inf.max) { toast('This item is at the ceiling.'); return false; }
    const a = G.account();
    if (a.marks < inf.cost) { toast(`You need ${inf.cost} Mentor Marks.`); return false; }
    a.marks -= inf.cost; G.saveAccount(a);
    const next = G.upgradedCopy(it, inf.up + 1);
    if (where.slot) P.equip[where.slot] = next; else P.bags[where.bag].item = next;
    loot(`${B.link(next.name, next.q)} is now upgrade ${next.up}/${inf.max} (${inf.cost} Mentor Marks).`);
    G.save(); emit('change');
    return true;
  };
```

**Step 4: Run the sim**

Run: `node sim/upgrades.js` → all checks pass.

**Step 5: Commit**

```bash
git add sim/upgrades.js src/game.js
git commit -m "Gear upgrades: spend Mentor Marks on a step (equipped or in bags)"
```

---

### Task 3: Marks from level-60 clears

Today normal dungeon and raid clears pay no Marks, so a step (15+ Marks) would only come from the Roulette, Help Wanted
and bounties.

**Files:**
- Modify: `src/game.js` `runBonuses` (around line 2485), after the codex update line
- Modify: `sim/upgrades.js`

**Step 1: Failing check**

```js
// income: a level-60 dungeon clear pays 5, a raid 15; below 60 nothing
ok(G.clearMarks('stratholme') === 5 && G.clearMarks('molten_core') === 15, 'level-60 clears pay Marks');
ok(G.clearMarks('deadmines') === 0, 'levelling dungeons pay none');
ok(Math.ceil(D.UPGRADE.cost(1) / G.clearMarks('stratholme')) <= 5, 'the first step takes at most 5 dungeon runs');
```

Note: `clearMarks` takes the activity key. Check `D.ACTIVITIES` keys for these dungeons first
(`node -e` with data.js loaded, `Object.keys(D.ACTIVITIES)`), and use the real ones in the check.

**Step 2: Run, see it fail** (`G.clearMarks is not a function`).

**Step 3: Implement** (next to `runBonuses`)

```js
  // v10.3: level-60 clears pay Mentor Marks, the currency for gear upgrades (Trials will pay more)
  G.clearMarks = (act) => { const A = D.ACTIVITIES[act], Dg = A && A.dungeon && D.DUNGEONS[A.dungeon]; return !Dg || (A.maxLvl || D.LEVEL_CAP) < D.LEVEL_CAP ? 0 : Dg.raid ? 15 : 5; };
```

and in `runBonuses`, after `cx.clears++ ...`:

```js
    if (P.level >= D.LEVEL_CAP && G.clearMarks(R.act)) G.addMarks(G.clearMarks(R.act), 'a level-60 clear');
```

**Step 4: Run the sim** → pass. Also run `node sim/group.js | tail -5` to see nothing else broke.

**Step 5: Commit**

```bash
git add sim/upgrades.js src/game.js
git commit -m "Level-60 dungeon and raid clears pay Mentor Marks (5 and 15)"
```

---

### Task 4: The UI (tooltip line, Upgrade button, confirm dialog)

**Files:**
- Modify: `src/ui.js` `itemTip` (line 1353): a line under the item name
- Modify: `src/ui.js` bag actions (line ~1962) and the equipped-item dialog (line ~2017)

**Step 1: Tooltip line.** In `itemTip`, right after the name line:

```js
    const upi = D.GEAR_SLOTS.includes(it.slot) ? G.upgradeInfo(it) : null;
    if (upi && upi.max) t.append(h('div', { class: 'st', style: { color: '#7fd4ff' } }, `Upgrade ${upi.up}/${upi.max}`));
```

**Step 2: The confirm dialog** (a helper near `throwAway`):

```js
  // gear upgrades (v10.3): show what the next step gives and what it costs, then buy it
  function upgradeDialog(where) {
    const P = G.S.player, it = where.slot ? P.equip[where.slot] : P.bags[where.bag].item, inf = G.upgradeInfo(it);
    const next = G.upgradedCopy(it, inf.up + 1), marks = G.account().marks;
    const diff = Object.keys(next.stats || {}).map((k) => `+${next.stats[k] - ((it.stats || {})[k] || 0)} ${k}`).filter((s) => !s.startsWith('+0'));
    if (next.dmg) diff.push(`+${(((next.dmg[0] + next.dmg[1]) - (it.dmg[0] + it.dmg[1])) / 2 / it.speed).toFixed(1)} damage per second`);
    showDialog([h('h3', null, `Upgrade ${it.name}?`),
      h('p', null, `Step ${inf.up + 1} of ${inf.max}: ${diff.join(', ')}.`),
      h('p', null, `Costs ${inf.cost} Mentor Marks. You have ${marks}. Its look and effects stay the same.`),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', disabled: marks < inf.cost, onclick: () => { closeDialog(); G.upgradeItem(where); if (ui.sheetFn) ui.sheetFn(); } }, 'Upgrade'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Cancel'))], true);
  }
```

**Step 3: The buttons.**
- Bag actions, after the Equip button:
  `if (G.upgradeInfo(it).up < G.upgradeInfo(it).max) acts.append(h('button', { class: 'btn alt', onclick: () => upgradeDialog({ bag: ui.bagSel }) }, 'Upgrade'));`
- The equipped-item dialog: add an Upgrade button beside Unequip when the item has steps left; it closes the tooltip
  dialog, then opens `upgradeDialog({ slot })`.

**Step 4: Build and check in the browser**

Run: `python3 build.py` (should end with `built .../dist/index.html`). Then use preview `dist-8778`:
make a level-60 test character, give it Marks and a Magma Throne item from the console
(`G.S.player.level=60; const a=G.account(); a.marks=200; G.saveAccount(a); G.addItem(G.copyItem('<an mc item id>'),1)`),
open Bags, select the item, check the tooltip line, tap Upgrade, confirm, and check the step and Marks change.
Screenshot the dialog. Check the phone width (resize to mobile) so the dialog text wraps and the buttons stay visible.

**Step 5: Commit**

```bash
git add src/ui.js
git commit -m "Gear upgrades: tooltip line, Upgrade button in Bags and on worn gear, a confirm dialog with the gain and cost"
```

---

### Task 5: Friends, the build, the Hero Marks line

**Files:**
- Modify: `src/friends.js` line 49 (the gear writer)
- Modify: `build.py` (after the legends sim, line ~21)
- Modify: `src/ui.js` where heirlooms are bought (line ~1804): one line saying Marks also pay for upgrades

**Step 1: Friends.** An upgraded item no longer matches its base, so it is sent whole; drop the `base` snapshot from
what friends see (they only need the current stats):

```js
out[slot] = base && same(base, it) ? { id: it.id } : (it.base ? Object.assign({}, it, { base: undefined }) : it);
```

Check how `same` and the writer serialise (`undefined` must not reach Firestore: if the SDK rejects undefined values,
build the copy with `const { base: _b, ...rest } = it` instead). Then run `node sim/friends.js` → 54/54.

**Step 2: build.py**

```python
if subprocess.run(['node', os.path.join(R, 'sim', 'upgrades.js')]).returncode != 0:
    sys.exit('build stopped: a gear upgrade rule is broken (node sim/upgrades.js lists which)')
```

**Step 3: The Marks line.** Where the heirloom list shows your Marks, add a small line:
"Mentor Marks also upgrade level-60 blue and purple gear (Bags → Upgrade)."

**Step 4: Full build**

Run: `python3 build.py`
Expected: every check passes, including `upgrades: N/N checks pass`, then `built ...`.

**Step 5: Commit**

```bash
git add src/friends.js build.py src/ui.js
git commit -m "Gear upgrades: friends see the upgraded stats, build runs sim/upgrades.js, Marks line mentions upgrades"
```

---

### Task 6: Release notes and hand-off (no push)

- Add a line to the roadmap version table for 10.3 (beta): gear upgrades, Marks from level-60 clears.
- Do **not** bump the version, push or release: Faizal decides when this goes to beta (ask first; beta goes out as
  `v10.3.0-beta.1` with the usual steps in CLAUDE.md).
- Report: sim result line, the build's last line, a screenshot of the upgrade dialog, and the per-raid step counts that
  `sim/upgrades.js` printed.
