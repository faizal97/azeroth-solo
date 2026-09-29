// Azeroth Solo — phone UI. Vanilla DOM; the game state lives in G.S.
(function () {
  const { D, E, B, G } = window;
  const app = document.getElementById('app');
  const ui = { sheet: null, sheetFn: null, bagSel: null, chatCh: 'say', spriteEls: {}, dialog: null, lastQuestDot: false, rollEl: null };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const now = () => Date.now();

  // ------------------------------------------------------------ tiny DOM helper
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  }

  // ------------------------------------------------------------ art
  const cache = {};
  function placeholder(kind) {
    const s = kind === 'scene' ? '0 0 400 240' : kind === 'icon' || kind === 'portrait' ? '0 0 64 64' : '0 0 128 128';
    const fill = kind === 'scene' ? '<rect width="400" height="240" fill="#2b3a1f"/><rect y="150" width="400" height="90" fill="#3d5a26"/>' : kind === 'icon' ? '<rect width="64" height="64" fill="#2a2016"/><rect x="4" y="4" width="56" height="56" fill="#4a3a22"/>' : '<ellipse cx="64" cy="120" rx="30" ry="6" fill="#000" opacity=".3"/><rect x="44" y="40" width="40" height="80" rx="18" fill="#6b5a44"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${s}">${fill}</svg>`;
  }
  function art(kind, arg) {
    const k = kind + ':' + (typeof arg === 'string' ? arg : JSON.stringify(arg));
    if (cache[k]) return cache[k];
    let svg = '';
    try {
      if (kind === 'story') svg = window.ART && ART.story ? (((ART.story.keys || {}).scenes || []).includes(arg) ? ART.story.scene(arg) : ART.story.actor(arg)) : '';
      else if (window.ART && ART[kind]) svg = ART[kind](arg);
    } catch (e) { svg = ''; }
    if (!svg) svg = placeholder(kind);
    return (cache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }
  const petArt = (u) => (u.key === 'beast' || u.type === 'beast') ? mobArt(u.mob) : art('pet', u.key || u.type);
  const mobArt = (key) => art('mob', (D.MOBS[key] && D.MOBS[key].sprite) || key);
  const looks = (c) => { const s = c.bot || c; const o = { cls: c.cls, race: s.race || c.race || 'human', skin: s.skin || 0, hair: s.hair || 0, gender: s.gender || 'm' }; const g = G.gearLooks(c); if (g) o.gear = g; return o; };
  // 'Dwarf Warlock': race and class of any character (player, bot, group member)
  const raceClass = (c) => { const r = D.RACES[(c && (c.race || (c.bot && c.bot.race))) || 'human']; return `${r ? r.name : ''} ${D.CLASSES[c.cls].name}`.trim(); };
  const abIcon = (id) => art('icon', (D.ABILITIES[id] && D.ABILITIES[id].icon) || id);
  // ---------- buffs and debuffs with time left, for any unit (or the player out of combat)
  const AURA_ALIAS = { momentum: 'rapid_fire', weakened_soul: 'pw_shield', seal: 'seal_righteousness', stoneskin: 'stoneskin_totem', rockbiter: 'rockbiter_weapon', chilled: 'frost_armor', bear: 'bear_form', fireball_burn: 'fireball', stun: 'hammer_justice', searing_totem: 'searing_totem' };
  const AURA_NAME = { momentum: 'Momentum', weakened_soul: 'Weakened Soul', chilled: 'Chilled', stun: 'Stunned', fireball_burn: 'Burning', seal: 'Seal' };
  const DEBUFF_IDS = new Set(['weakened_soul', 'hunters_mark', 'chilled', 'stun']);
  function auraInfo(a, u) {
    let base = a.id.replace(/_slow$/, '');
    if (a.id === 'rockbiter' && a.sealSchool === 'fire') base = 'flametongue_weapon';
    const ab = D.ABILITIES[AURA_ALIAS[base] || base];
    const hostile = a.src != null && G.fight && G.fight.units[a.src] && u && G.fight.units[a.src].side !== u.side;
    const debuff = DEBUFF_IDS.has(a.id) || !!a.slow || (a.dot != null && (hostile || (u && u.side === 'enemy'))) || (hostile && !a.hot && !a.stats);
    return { id: a.id, icon: a.icon || AURA_ALIAS[base] || base, name: a.name || AURA_NAME[a.id] || (ab ? ab.name : a.id.replace(/_/g, ' ')), debuff };
  }
  // in a fight 'until' is fight seconds; out of combat the player's buffs use wall-clock ms
  function auraList(u) {
    const C = G.fight, out = [];
    if (u && C) {
      for (const a of u.auras) { const left = a.until - C.t; if (left > 0) out.push(Object.assign(auraInfo(a, u), { left, raw: a, unit: u })); }
      if (u.stunUntil > C.t) out.push({ id: 'stun', icon: 'hammer_justice', name: 'Stunned', debuff: true, left: u.stunUntil - C.t, raw: { id: 'stun' }, unit: u });
    } else if (!C && G.S) {
      for (const a of (G.S.player.auras || [])) { const left = (a.until - Date.now()) / 1000; if (left > 0) out.push(Object.assign(auraInfo(a, null), { left, raw: a })); }
    }
    return out.sort((x, y) => (x.debuff - y.debuff) || (x.left - y.left));
  }
  const STAT_WORD = { wdmg: 'weapon damage', ap: 'attack power', sp: 'spell power', armor: 'armor', str: 'Strength', agi: 'Agility', sta: 'Stamina', int: 'Intellect', spi: 'Spirit', dodge: '% dodge', haste: '% attack and cast speed', rap: 'ranged attack power' };
  const SCHOOL = (x) => (x && x !== 'physical' ? x[0].toUpperCase() + x.slice(1) + ' ' : '');
  function auraEffects(a) {
    const r = a.raw || {}, out = [];
    if (r.id === 'stun') out.push("Can't move, attack or cast.");
    if (r.stats) for (const k in r.stats) if (r.stats[k]) out.push(`${r.stats[k] > 0 ? '+' : ''}${Math.round(r.stats[k])}${STAT_WORD[k] && STAT_WORD[k][0] === '%' ? '' : ' '}${STAT_WORD[k] || k}`);
    if (r.dot) out.push(`Takes ${Math.round(r.dot)} ${SCHOOL(r.school)}damage every ${r.every} sec.`);
    if (r.hot) out.push(`Heals ${Math.round(r.hot)} every ${r.every} sec.`);
    if (r.slow) out.push(`Attacks ${r.slow}% slower.`);
    if (r.absorb) out.push(`Absorbs ${Math.round(r.absorb)} more damage.`);
    if (r.thorns) out.push(`Deals ${r.thorns.dmg} damage to each melee attacker${r.thorns.charges ? ` (${r.thorns.charges} left)` : ''}.`);
    if (r.seal) out.push(`Each weapon hit deals ${Math.round(r.seal)} extra ${SCHOOL(r.sealSchool || 'holy')}damage.`);
    if (r.immune) out.push('Immune to all damage.');
    if (r.id === 'weakened_soul') out.push("Can't receive Power Word: Shield yet.");
    if (r.id === 'hunters_mark') out.push('Takes 10% more damage from the hunter and their pet.');
    if (r.bear || r.id === 'bear') out.push('Bear Form: much more armor and health, attacks use rage.');
    if (r.id === 'momentum') out.push('Built by pulling again quickly. Resting resets it.');
    if (!out.length) { const ab = D.ABILITIES[a.icon]; if (ab && ab.desc) out.push(ab.desc.replace(/\{[a-z]+\}/g, '').replace(/\s+([.,])/g, '$1')); }
    return out;
  }
  function showAura(a, box) {
    const cur = (box && box._list && box._list.find((x) => x.id === a.id)) || a;
    const src = cur.raw && cur.raw.src != null && G.fight && G.fight.units[cur.raw.src];
    const left = cur.left > 86400 ? 'Lasts until you cancel it.' : `${fmtLeft(cur.left)}${cur.left >= 60 ? '' : ' sec'} left.`;
    showDialog(h('div', { class: 'tooltip' },
      h('div', { class: 'nm', style: { color: a.debuff ? '#ff6a5a' : '#5fd46a' } }, img(abIcon(a.icon)), ' ', a.name, h('small', { class: 'dim' }, a.debuff ? '  debuff' : '  buff')),
      ...auraEffects(cur).map((t) => h('div', { style: { color: '#ffd100' } }, t)),
      h('div', { class: 'dim' }, left + (src ? ` From ${src.kind === 'player' ? 'you' : src.name}.` : ''))), true);
  }
  const fmtLeft = (s) => (s > 86400 ? '' : s >= 3600 ? Math.floor(s / 3600) + 'h' : s >= 60 ? Math.floor(s / 60) + 'm' : Math.ceil(s) + '');
  // (re)build a strip only when the set of auras changes; otherwise just tick the timers
  function paintAuras(box, list, max) {
    if (!box) return;
    list = list.slice(0, max || 10);
    const key = list.map((a) => a.id).join(',');
    if (box.dataset.k !== key) {
      box.dataset.k = key; box.innerHTML = '';
      for (const a of list) {
        const chip = h('span', { class: 'au ' + (a.debuff ? 'de' : 'bu'), onclick: (e) => { e.stopPropagation(); showAura(a, box); } }, img(abIcon(a.icon)), h('b', { class: 'tnum' }));
        box.append(chip);
      }
    }
    box._list = list;
    list.forEach((a, i) => { const c = box.children[i]; if (!c) return; c.lastChild.textContent = fmtLeft(a.left); c.classList.toggle('soon', a.left < 3); });
  }
  const img = (src, cls) => h('img', { src, class: cls, alt: '', draggable: 'false' });

  // ------------------------------------------------------------ formatting
  // money as coins, like the original: "12 (gold) 4 (silver) 30 (copper)"; the words stay for screen readers.
  // compact (the player frame): only the two largest coins, so it fits beside the name
  function moneyHtml(c, compact, noZero) {
    const m = G.money(c);
    let parts = [];
    if (m.g) parts.push(['g', m.g]);
    if (m.s || m.g) parts.push(['s', m.s]);
    parts.push(['c', m.c]);
    if (noZero) parts = parts.filter(([, v]) => v);
    if (compact) parts = parts.slice(0, 2);
    const word = { g: 'gold', s: 'silver', c: 'copper' };
    return `<span class="money tnum" aria-label="${parts.map(([k, v]) => v + ' ' + word[k]).join(' ')}">${parts.map(([k, v]) => `<span class="${k}">${v}<i class="coin ${k}"></i></span>`).join(' ')}</span>`;
  }
  // folding sections: the header is a button with a one-line summary; open or closed is remembered on this device
  function foldOpen(key, def) { try { const m = JSON.parse(localStorage.getItem('azsolo.folds') || '{}'); return key in m ? !!m[key] : def; } catch (e) { return def; } }
  function setFold(key, open) { try { const m = JSON.parse(localStorage.getItem('azsolo.folds') || '{}'); m[key] = open; localStorage.setItem('azsolo.folds', JSON.stringify(m)); } catch (e) { } }
  function foldSec(key, title, summary, kids, def) {
    let open = foldOpen(key, !!def);
    const body = h('div', { class: 'fold-body' }, kids);
    const arr = h('span', { class: 'fold-arr' });
    const head = h('button', { class: 'sec-h fold', onclick: () => { open = !open; setFold(key, open); paint(); } }, h('span', null, title), h('small', null, summary || ''), arr);
    const paint = () => { body.hidden = !open; arr.textContent = open ? '▾' : '▸'; head.setAttribute('aria-expanded', String(open)); };
    paint();
    return [head, body];
  }
  function conColor(lvl) {
    const d = lvl - G.S.player.level;
    if (d >= 5) return '#ff2020';
    if (d >= 3) return '#ff8040';
    if (d >= -2) return '#ffff00';
    if (d >= -5 + (G.S.player.level < 6 ? 1 : 0)) return '#40c040';
    return '#9d9d9d';
  }
  function fmtTime(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm ' + (s % 60 ? (s % 60) + 's' : '');
    const hh = Math.floor(m / 60);
    if (hh < 48) return hh + 'h ' + (m % 60) + 'm';
    return Math.floor(hh / 24) + ' days';
  }
  const richText = (t) => esc(t).replace(/\[\[(\d)\|([^\]]+)\]\]/g, '<span class="q$1">[$2]</span>');

  function toast(text, info) {
    const t = h('div', { class: 'toast' + (info ? ' info' : '') }, text);
    app.append(t); setTimeout(() => t.remove(), 1900);
  }

  // ============================================================ layout
  let els = {};
  function buildLayout() {
    app.innerHTML = '';
    els.frames = h('div', { class: 'frames' });
    els.scene = h('div', { class: 'scene' });
    // the strip: tap a request line to act on it; the Chat button (or any other line) opens the full chat
    els.chatLines = h('div', { class: 'chat-lines' });
    els.chatOpen = h('button', { class: 'chat-open', 'aria-label': 'Open chat', onclick: (e) => { e.stopPropagation(); openSocial('chat'); } });
    els.chat = h('div', { class: 'chat', onclick: (e) => { const ln = e.target.closest('.ln.tap'); const m = ln && G.S.chat.find((x) => String(x.id) === ln.dataset.mid); if (m) { e.stopPropagation(); msgDialog(m); } else openSocial('chat'); } }, els.chatLines, els.chatOpen);
    // the chat strip folds to one line (a tab on its bottom edge); remembered on this device
    const chatFolded = () => { try { return localStorage.getItem('azsolo.chatFolded') === '1'; } catch (e) { return false; } };
    const paintChatFold = () => { const f = chatFolded(); els.chat.classList.toggle('folded', f); els.chatFold.textContent = f ? '▾' : '▴'; els.chatFold.setAttribute('aria-label', f ? 'Show more chat' : 'Fold the chat to one line'); };
    els.chatFold = h('button', { class: 'chat-fold', onclick: (e) => { e.stopPropagation(); try { localStorage.setItem('azsolo.chatFolded', chatFolded() ? '0' : '1'); } catch (x) { } paintChatFold(); } });
    els.chat.append(els.chatFold); paintChatFold();
    els.panel = h('div', { class: 'panel' });
    els.bar = h('div', { class: 'actionbar' });
    els.bottom = h('div', { class: 'bottom-wrap' }, els.bar);
    els.nav = h('nav', { class: 'nav' });
    app.append(els.frames, els.scene, els.chat, els.panel, els.bottom, els.nav);
    renderNav();
  }

  function renderAll() {
    if (!G.S) return;
    renderFrames(); renderScene(); renderPanel(); renderBar(); renderChat(); renderNavDots(); renderRolls();
    if (ui.sheet && ui.sheetFn) ui.sheetFn();
  }

  // ============================================================ unit frames
  function barEl(cls, extra) { return h('div', { class: 'bar ' + cls }, extra || null, h('i'), h('b', { class: 'tnum' })); }
  function renderFrames() {
    const P = G.S.player;
    const f = els.frames; f.innerHTML = '';
    const pf = h('div', { class: 'uf' },
      h('div', { class: 'portrait tap', role: 'button', 'aria-label': 'Open Hero', onclick: () => openHero() }, h('div', { class: 'pclip' }, img(art('portrait', looks(P)))), h('span', { class: 'lvl tnum', id: 'pf-lvl' }, P.level)),
      h('div', { class: 'uf-body' },
        h('div', { class: 'uf-namerow' }, h('div', { class: 'uf-name cls-' + P.cls }, G.displayName()), (els.pMoney = h('span', { class: 'pmoney' }))),
        (els.pHp = barEl('hp')), (els.pRes = barEl(D.CLASSES[P.cls].resource)),
        (els.pXp = h('button', { class: 'bar xp xpmain', 'aria-label': 'Experience', onclick: xpDetail }, h('i', { class: 'rest' }), h('i', { class: 'fill' }), h('b', { class: 'tnum' }))),
        (els.pBuffs = h('div', { class: 'buffs' }))));
    els.tf = h('div', { class: 'uf target' });
    f.append(pf, els.tf);
    renderTarget();
  }
  function renderTarget() {
    const tf = els.tf; if (!tf) return;
    tf.innerHTML = ''; tf.className = 'uf target';
    const C = G.fight;
    let u = null;
    if (C && G.pUnit) {
      u = C.units[G.pUnit.target];
      if (C.allyTarget != null && C.units[C.allyTarget] && ['priest', 'paladin', 'druid'].includes(G.pUnit.cls)) u = C.units[C.allyTarget];
    }
    if (!u) {
      const P = G.S.player;
      tf.classList.add('empty');
      tf.style.opacity = '1';
      tf.append(h('div', { class: 'uf-body', style: { textAlign: 'right', alignContent: 'center' } },
        P.rested > 0 && P.level < D.LEVEL_CAP ? h('div', { style: { color: '#6fa8ff', font: '700 12px var(--body)' } }, 'Rested') : null,
        G.S.queue ? h('div', { style: { color: 'var(--gold)', font: '700 12px var(--body)' } }, 'In queue') : null),
        h('div'));
      tf.classList.remove('empty');
      return;
    }
    els.tUid = u.uid;
    const isMob = u.kind === 'mob';
    const port = h('div', { class: 'portrait' + (isMob ? ' mob' : '') + (u.elite ? ' elite' : '') },
      h('div', { class: 'pclip' }, img(isMob ? mobArt(u.key) : u.kind === 'pet' ? petArt(u) : art('portrait', looks(u.char || u)))),
      h('span', { class: 'lvl tnum', style: { color: isMob ? conColor(u.level) : '#fff' } }, u.boss ? '??' : u.level));
    tf.append(h('div', { class: 'uf-body' },
      h('div', { class: 'uf-name', style: { textAlign: 'right', color: isMob ? '#ff5b4b' : u.kind === 'pet' ? '#9fd6ff' : 'var(--c-' + u.cls + ')' } }, u.name, !isMob && u.kind !== 'pet' && u.char ? h('small', { class: 'rc' }, raceClass(u.char)) : null),
      (els.tHp = barEl('hp')),
      (els.tCp = h('div', { class: 'cps' })),
      (els.tBuffs = h('div', { class: 'buffs tbuffs' }))), port);
  }

  // ============================================================ scene
  const POS_ALLY = [{ l: 3, b: 4, w: 25 }, { l: 20, b: 16, w: 19 }, { l: 1, b: 29, w: 17 }, { l: 22, b: 33, w: 15 }, { l: 10, b: 43, w: 13 }];
  // raids (10 players plus pets): a denser formation, front line first
  const POS_RAID = [{ l: 2, b: 3, w: 21 }, { l: 17, b: 10, w: 17 }, { l: 30, b: 4, w: 16 }, { l: 0, b: 22, w: 15 }, { l: 13, b: 25, w: 14 }, { l: 26, b: 20, w: 14 }, { l: 37, b: 27, w: 12 }, { l: 4, b: 38, w: 12 }, { l: 16, b: 40, w: 11 }, { l: 27, b: 37, w: 11 }, { l: 37, b: 44, w: 10 }, { l: 8, b: 50, w: 10 }, { l: 20, b: 52, w: 9 }, { l: 31, b: 52, w: 9 }];
  const POS_EN = [{ r: 3, b: 4, w: 30 }, { r: 26, b: 15, w: 23 }, { r: 6, b: 28, w: 20 }, { r: 28, b: 34, w: 17 }, { r: 15, b: 44, w: 14 }];
  function sceneKey() {
    const S = G.S;
    if (S.run) return S.run.pulls[Math.min(S.run.idx, S.run.pulls.length - 1)].scene;
    const P = S.player;
    if (P.travel) return D.PLACES[P.travel.to].scene;
    return D.PLACES[P.place].scene;
  }
  // ---------- NPCs in the scene (v9.4): drawn with the hero rig, dressed by town and title; legends use their own art
  const hashStr = (t) => { let x = 2166136261; for (let i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
  const REGION_RACES = { elwynn: ['human'], westfall: ['human'], redridge: ['human'], duskwood: ['human'], dunmorogh: ['dwarf', 'gnome'], wetlands: ['dwarf', 'human'], teldrassil: ['nightelf'], ashenvale: null, durotar: ['orc', 'troll'], barrens: ['orc', 'tauren'], mulgore: ['tauren'], tirisfal: ['undead'], hillsbrad: ['undead', 'orc'], stonetalon: ['tauren', 'orc'], feralas: null, plaguelands: null, tidewatch: ['human'], skullreef: ['troll', 'undead'] };
  const GOBLIN_TOWNS = new Set(['gadgetzan', 'everlook', 'marshals_refuge', 'nesingwary_camp']);
  function npcLooks(npc, place) {
    const N = D.NPCS[npc], x = hashStr(npc), t = (N.title || '') + ' ' + N.name;
    const fac = place.faction || (D.REGIONS[place.region] || {}).faction;
    let races = /Darkspear|Witch Doctor|Hexx|Shadow Hunter/i.test(t) ? ['troll'] : /Forsaken|Deathstalker|Executor|Apothecary|Royal Apothecary/i.test(t) ? ['undead'] : /Cenarion|Sentinel|Keeper of Lore|Moon|Feathermoon/i.test(t) ? ['nightelf'] : /Bloodhoof|Mojache|Thunder Bluff/i.test(t) ? ['tauren'] : GOBLIN_TOWNS.has(P0(place)) ? ['gnome'] : REGION_RACES[place.region];
    if (!races) races = fac === 'horde' ? ['orc', 'troll', 'tauren', 'undead'] : ['human', 'dwarf', 'nightelf', 'gnome'];
    const cls = /Weapon|Smith|Armorer|Guard|Grunt|Marshal|Commander|Captain|Sergeant|Watch|Soldier|Warrior/i.test(t) ? 'warrior' : /Paladin|Argent|Knight/i.test(t) ? 'paladin' : /Druid|Cenarion|Herbal/i.test(t) ? 'druid' : /Witch|Shaman|Earthen/i.test(t) ? 'shaman' : /Apothecary|Alchemist|Warlock|Demon/i.test(t) ? 'warlock' : /Priest|Healer|Innkeeper|Cleric/i.test(t) ? 'priest' : /Hunter|Stable|Scout|Tracker|Ranger/i.test(t) ? 'hunter' : /Mage|Arcan|Trainer|Lore|Scholar|Surveyor|Engineer/i.test(t) ? 'mage' : ['rogue', 'warrior', 'priest', 'mage'][x % 4];
    const first = N.name.replace(/^(Innkeeper|Quartermaster|Marshal|Commander|Captain|Sergeant|Scout|Artisan|Stablemaster|Admiral|Scholar|Deathstalker|Hexxer|Witch Doctor|Shadow Hunter|Trader|Armorer|High Executor|Apothecary|Alchemist|Chief Engineer|Senior Surveyor|Argent Officer|Lord|Lady|Baron)\s+/i, '').split(/\s+/)[0];
    const gender = /(a|ie|elle|ine|ette|ssa|ra|na|lyn|ith|beth)$/i.test(first) && !/^(Grunna|Ogunaro|Thrall|Rahauro)$/i.test(first) ? 'f' : 'm';
    return { cls, race: races[(x >> 3) % races.length], skin: (x >> 7) % 4, hair: (x >> 11) % 5, gender };
  }
  const P0 = (place) => Object.keys(D.PLACES).find((k) => D.PLACES[k] === place);
  function npcSprites(sc, place) {
    if (!place || !(place.npcs || []).length) return;
    const rank = (n) => { const mk = G.npcMarker(n); if (D.NPCS[n].legend || n === 'hooded_stranger') return -1; return mk === '?' ? 0 : mk === '!' ? 1 : /^(mentor|banker|auctioneer|crafts|stable)_/.test(n) ? 3 : 2; };
    const list = place.npcs.filter((n) => D.NPCS[n]).slice().sort((a, b) => rank(a) - rank(b)).slice(0, place.safe ? 3 : 1);
    const slots = place.safe ? [{ r: 4, b: 6, w: 19 }, { r: 23, b: 13, w: 16 }, { r: 11, b: 27, w: 13 }] : [{ l: 46, b: 26, w: 14 }];
    list.forEach((n, i) => {
      const N = D.NPCS[n], mk = G.npcMarker(n);
      const src = n === 'hooded_stranger' && window.ART && ART.legend ? art('legend', 'lyveus_hooded') : N.legend && window.ART && ART.legend ? art('legend', N.legend) : art('hero', npcLooks(n, place));
      const tag = h('div', { class: 'np', style: { fontSize: '10px' } }, mk ? h('span', { class: mk === '…' ? '' : 'qmk', style: { color: mk === '…' ? '#bbb' : '#ffd100', fontWeight: 800 } }, (mk === '…' ? '?' : mk) + ' ') : null, h('span', { style: { color: '#ffd100' } }, N.name.split(' ').length > 2 ? N.name.split(' ').slice(-1)[0] : N.name));
      const el = spriteEl(src, slots[i], 'idle flip npc tappable', tag);
      el.addEventListener('click', () => openNpc(n));
      sc.append(el);
    });
  }
  function spriteEl(src, pos, cls, np) {
    const st = { width: pos.w + '%', bottom: pos.b + '%' };
    if (pos.l != null) st.left = pos.l + '%'; else st.right = pos.r + '%';
    st.zIndex = String(100 - Math.round(pos.b));
    return h('div', { class: 'sprite ' + (cls || ''), style: st }, np || null, img(src));
  }
  function renderScene() {
    const S = G.S, P = S.player;
    const sc = els.scene;
    ui.spriteEls = {};
    sc.className = 'scene' + (P.ghostUntil ? ' ghost' : '');
    const key = sceneKey();
    const bg = sc.querySelector('img.bg');
    if (!bg || sc.dataset.k !== key) { sc.innerHTML = ''; sc.append(img(art('scene', key), 'bg'), h('div', { class: 'shade' })); sc.dataset.k = key; }
    else for (const c of [...sc.children]) if (c !== bg && !c.classList.contains('shade')) c.remove();
    const place = D.PLACES[P.place];
    const title = S.run ? S.run.name : P.travel ? 'On the road' : place.name;
    const sub = S.run ? S.run.pulls[Math.min(S.run.idx, S.run.pulls.length - 1)].label : P.travel ? 'to ' + D.PLACES[P.travel.to].name + (P.route && P.route.length ? ` · then ${D.PLACES[P.route[P.route.length - 1]].name}` : '') : place.zone;
    sc.append(h('div', { class: 'zone' }, title, h('small', null, sub)));
    const C = G.fight;
    if (C) {
      C.allies.forEach((u, i) => {
        const pos = C.allies.length > 7 ? (POS_RAID[i] || POS_RAID[POS_RAID.length - 1]) : (POS_ALLY[i] || POS_ALLY[4]);
        const np = C.allies.length > 1 ? h('div', { class: 'np' }, h('span', { class: 'cls-' + u.cls }, u.kind === 'player' ? '' : u.name.split('-')[0]), h('div', { class: 'hpb' }, h('i'))) : null;
        const src = u.kind === 'pet' ? petArt(u) : u.form === 'bear' ? art('pet', 'bear_form') : u.char && u.char.legend ? art('legend', u.char.legendArt || u.char.legend) : art('hero', looks(u.char));
        const el = spriteEl(src, u.kind === 'pet' && u.key === 'imp' ? Object.assign({}, pos, { w: pos.w * 0.7 }) : pos, 'friend idle' + (u.dead ? ' dead' : '') + (u.kind === 'pet' && u.key === 'beast' ? ' flip' : ''), np);
        el.addEventListener('click', () => { G.setTarget(u.uid); renderTarget(); markTargets(); renderPanel(); });
        ui.spriteEls[u.uid] = el; sc.append(el);
      });
      C.enemies.forEach((u, i) => {
        const pos = Object.assign({}, POS_EN[i] || POS_EN[4]);
        if (u.boss && i === 0) pos.w = 36;
        const np = h('div', { class: 'np' }, h('span', { class: 'mk' }, ''), h('span', { style: { color: conColor(u.level) } }, u.boss ? '' : u.level + ' '), h('span', { style: { color: '#ff6a5a' } }, u.name), h('div', { class: 'hpb' }, h('i')));
        const isChar = u.kind !== 'mob';
        const el = spriteEl(isChar ? art('hero', looks(u.char)) : mobArt(u.key), isChar ? Object.assign(pos, { w: Math.min(pos.w, 26) }) : pos, 'idle' + (isChar ? ' flip' : '') + (u.dead ? ' dead' : ''), np);
        el.addEventListener('click', () => { G.setTarget(u.uid); renderTarget(); markTargets(); });
        ui.spriteEls[u.uid] = el; sc.append(el);
      });
      markTargets();
    } else if (!P.travel) {
      const me = spriteEl(art('hero', looks(P)), { l: 4, b: 5, w: 26 }, 'idle');
      ui.spriteEls.me = me; sc.append(me);
      if (P.pet && P.pet.hp !== 0 && !S.run) sc.append(spriteEl(petArt(P.pet), P.pet.type === 'imp' ? { l: 24, b: 8, w: 13 } : { l: 22, b: 10, w: 20 }, 'idle' + (P.pet.type === 'beast' ? ' flip' : ''), h('div', { class: 'np', style: { fontSize: '10px' } }, h('span', { style: { color: '#9fd6ff' } }, P.pet.name))));
      if (!S.run) {
        // other players wandering about
        const inParty = new Set(((S.wparty && S.wparty.members) || []).map((m) => m.bot.id));
        ((S.wparty && S.wparty.members) || []).forEach((m, i) => {
          const pos = [{ l: 20, b: 14, w: 21 }, { l: 33, b: 22, w: 18 }][i] || { l: 40, b: 26, w: 16 };
          const el = spriteEl(art('hero', looks(m)), pos, 'idle friend', h('div', { class: 'np' }, h('span', { style: { color: '#aaaaff' } }, m.name.split('-')[0]), h('div', { class: 'hpb' }, h('i', { style: { width: Math.round(((m.hp == null ? E.statsFor(m).maxHp : m.hp) / E.statsFor(m).maxHp) * 100) + '%' } }))));
          sc.append(el);
        });
        const near = B.onlineIn(S, P.place, new Date()).filter((b) => !inParty.has(b.id) && B.factionOf(b) === G.myFaction()).slice(0, S.wparty ? 2 : 3);
        const SLOTS = [{ l: 27, b: 36, w: 11 }, { l: 45, b: 40, w: 10 }, { l: 62, b: 35, w: 11 }];
        near.forEach((b, i) => {
          const el = spriteEl(art('hero', looks(b)), SLOTS[i], 'walker small', h('div', { class: 'np', style: { fontSize: '10px' } }, h('span', { class: 'cls-' + b.cls }, b.name)));
          el.querySelector('img').style.animationDelay = (-i * 0.37) + 's';
          el.classList.add('tappable');
          el.addEventListener('click', () => confirmInvite(b));
          sc.append(el);
        });
        // an enemy player nearby (War Mode)
        const foe = G.intruderHere();
        if (foe) {
          const el = spriteEl(art('hero', looks(foe)), { l: 36, b: 12, w: 17 }, 'idle flip foe', h('div', { class: 'np', style: { fontSize: '10px' } }, h('span', { style: { color: '#ff5b4b' } }, '⚔ ' + foe.name)));
          el.classList.add('tappable');
          el.addEventListener('click', () => confirmAttack(foe));
          sc.append(el);
        }
        // gathering nodes you can see
        G.placeNodes().forEach((nd, i) => {
          const el = spriteEl(art('node', nd.key), [{ l: 31, b: 3, w: 11 }, { l: 49, b: 1, w: 10 }][i], 'node tappable', h('div', { class: 'np', style: { fontSize: '10px' } }, h('span', { style: { color: '#ffd84a' } }, nd.N.name)));
          el.addEventListener('click', () => G.gatherNode(nd.i));
          sc.append(el);
        });
        // the people of this place (v9.4): quest givers first, tap to talk
        npcSprites(sc, place);
        // a few creatures in view
        const mobs = G.placeMobs().filter((m) => m.state === 'alive').slice(0, 2);
        mobs.forEach((m, i) => {
          const pos = [{ r: 4, b: 5, w: 24 }, { r: 30, b: 17, w: 15 }][i];
          const el = spriteEl(mobArt(m.key), pos, 'idle', h('div', { class: 'np' }, h('span', { style: { color: conColor(m.level) } }, m.level + ' '), h('span', { style: { color: '#ffd84a' } }, D.MOBS[m.key].name)));
          el.addEventListener('click', () => G.engage(m.id));
          sc.append(el);
        });
      }
    }
    // riding: the hero sits on the mount while travelling by road (offsets from art/mounts/render.js: the hero box is 0.56 of the
    // mount's width, 17% in from its left and 3.6% down from its top; races sit higher or lower by their hip height)
    if (P.travel && G.mounted() && !((D.PLACES[P.travel.from] || {}).via || {})[P.travel.to]) {
      const RACE_Y = { human: 0, dwarf: -6.6, gnome: -12.3, nightelf: 6.3, orc: -0.7, troll: 7, tauren: 1.4, undead: 0 };
      const mw = 36, ml = 18, mb = 4, mh = mw * 400 / 240 * 128 / 160; // mount height in % of scene height
      const hw = mw * 0.56, hb = mb + mh * (1 - 4.6 / 128) - hw * 400 / 240 - mh * (RACE_Y[P.race] || 0) / 128;
      sc.append(spriteEl(art('hero', looks(P)), { l: ml + mw * 0.17, b: hb, w: hw }, 'walker'));
      sc.append(spriteEl(art('mount', P.mount), { l: ml, b: mb, w: mw }, 'walker'));
    }
    if (P.travel) sc.append(h('div', { class: 'castbar', id: 'travelbar', style: { bottom: G.mounted() ? '74%' : '40%' } }, h('i'), h('b', null, 'Traveling to ' + D.PLACES[P.travel.to].name)));
    if (P.ghostUntil) sc.append(h('div', { class: 'overlay-msg' }, h('div', null, h('h3', null, 'You are dead'), h('p', { id: 'ghost-t' }, 'Running back to your body...'))));
    if (S.run && S.run.phase === 'wipe') sc.append(h('div', { class: 'overlay-msg' }, h('div', null, h('h3', null, 'Party defeated'), h('p', null, 'Running back from the graveyard...'))));
    if (S.run && S.run.phase === 'done') sc.append(h('div', { class: 'overlay-msg', style: { background: 'rgba(0,0,0,.25)' } }, h('div', null, h('h3', null, S.run.name + ' cleared'), h('p', null, 'Leave the group when you are ready.'))));
    els.cast = h('div', { class: 'castbar', hidden: true }, h('i'), h('b'));
    sc.append(els.cast);
    sc.append(h('div', { class: 'online', id: 'online' }));
  }
  function markTargets() {
    const C = G.fight; if (!C || !G.pUnit) return;
    for (const uid in ui.spriteEls) {
      const el = ui.spriteEls[uid];
      el.classList.toggle('targeted', +uid === G.pUnit.target);
      el.classList.toggle('ally-sel', +uid === C.allyTarget && C.allies.length > 1);
    }
  }

  // floating combat text
  function fct(uid, text, cls) {
    const el = ui.spriteEls[uid];
    const sc = els.scene;
    if (!sc) return;
    const f = h('div', { class: 'fct ' + (cls || '') }, text);
    if (el) {
      const r = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
      f.style.left = (r.left - s.left + r.width / 2 + (Math.random() * 30 - 15)) + 'px';
      f.style.top = (r.top - s.top + r.height * 0.25) + 'px';
    } else { f.style.left = '50%'; f.style.top = '30%'; }
    sc.append(f);
    setTimeout(() => f.remove(), 1300);
  }
  function flash(uid, cls, ms) {
    const el = ui.spriteEls[uid]; if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms || 160);
  }
  function onCombat(evs) {
    const C = G.fight; if (!C) return;
    let redraw = false;
    const S_ = window.SND;
    for (const e of evs) {
      const tgt = C.units[e.tgt], src = C.units[e.src];
      const onAlly = tgt && tgt.side === 'ally';
      const meInvolved = (src && src.kind === 'player') || (tgt && tgt.kind === 'player');
      if (S_ && meInvolved) {
        if (e.type === 'dmg') S_.play(e.school === 'nature' ? 'arcane' : e.school && e.school !== 'physical' ? e.school : e.crit ? 'crit' : 'hit', { vol: tgt && tgt.kind === 'player' ? 0.75 : 1 });
        else if (e.type === 'avoid') S_.play('miss', { vol: 0.7 });
        else if (e.type === 'heal' && e.amount > 0) S_.play('heal', { gap: 0.3, vol: 0.8 });
        else if (e.type === 'castStart' && src && src.kind === 'player') S_.play('cast', { vol: 0.5 });
        else if (e.type === 'die' && C.units[e.uid] && C.units[e.uid].kind === 'player') S_.play('death');
      }
      if (S_ && e.type === 'die' && C.units[e.uid] && C.units[e.uid].kind === 'player') S_.play('death');
      if (e.type === 'dmg') {
        const school = e.school && e.school !== 'physical' ? e.school : '';
        const mine = src && src.kind === 'player';
        if (onAlly || mine || C.allies.length === 1) fct(e.tgt, (e.crit ? '' : '') + e.amount + (e.absorbed ? ` (${e.absorbed} absorbed)` : ''), (e.crit ? 'crit ' : '') + (onAlly ? 'me ' : '') + school + (!mine && !onAlly ? ' small' : ''));
        flash(e.tgt, 'hit');
        if (src) flash(e.src, src.side === 'ally' ? 'lunge-r' : 'lunge-l', 280);
        // your critical hit on your target shakes its frame
        if (e.crit && mine && els.tf && els.tUid === e.tgt) { els.tf.classList.remove('shake'); void els.tf.offsetWidth; els.tf.classList.add('shake'); }
      } else if (e.type === 'heal' && e.amount > 0) {
        fct(e.tgt, '+' + e.amount, 'heal' + (e.crit ? ' crit' : ''));
      } else if (e.type === 'avoid') {
        fct(e.tgt, e.what === 'dodge' ? 'Dodge' : e.what === 'resist' ? 'Resist' : 'Miss', 'small');
        if (src) flash(e.src, src.side === 'ally' ? 'lunge-r' : 'lunge-l', 280);
      } else if (e.type === 'die') {
        const del = ui.spriteEls[e.uid], du = C.units[e.uid];
        if (del && du && du.side !== 'ally') { const r = del.getBoundingClientRect(); ui.lastKill = { x: r.left + r.width / 2, y: r.top + r.height * 0.45, at: Date.now() }; }
        redraw = true;
      } else if (e.type === 'say') {
        B.post(G.S, 'monster', { name: e.name }, e.text);
      } else if (e.type === 'emote') {
        fct(null, e.text, 'small');
        B.post(G.S, 'monster', null, e.text);
      } else if (e.type === 'shift') {
        redraw = true; renderBar();
      } else if (e.type === 'lifetap') {
        fct(e.src, '-' + e.amount + ' hp  +' + e.amount + ' mana', 'small');
      } else if (e.type === 'aggro' && tgt && tgt.kind === 'player' && C.allies.length > 1) {
        fct(e.tgt, 'Aggro!', 'small');
      }
    }
    if (redraw) { renderScene(); renderTarget(); renderPanel(); }
    renderChat();
  }

  // ============================================================ chat strip
  function chatLineHtml(m) {
    const ch = D.CHANNELS[m.ch] || D.CHANNELS.system;
    const color = ch.color;
    const name = m.from ? `<span class="who ${m.cls ? 'cls-' + m.cls : ''}">[${esc(m.from)}]</span>` : '';
    let pre = '';
    if (m.ch === 'whisper') pre = m.me ? `To ${m.to ? `<span class="who">[${esc(m.to)}]</span>` : ''}: ` : `${name} whispers: `;
    else if (m.ch === 'say') pre = `${name} says: `;
    else if (m.ch === 'monster') pre = m.from ? `${esc(m.from)} says: ` : '';
    else if (m.from) pre = `${ch.label ? '[' + ch.label + '] ' : ''}${name}: `;
    const open = m.act && m.act.state === 'open';
    const tap = open || (m.from && !m.me && m.ch !== 'combat') || /\[\[\d\|/.test(m.text);
    return `<div class="ln${tap ? ' tap' : ''}${open ? ' act' : ''}" data-mid="${m.id || ''}" style="color:${color}">${open ? '<span class="act-mark">▸</span>' : ''}${pre}${richText(m.text)}</div>`;
  }
  // ---------- chat tabs: your own named filters over the channels, kept on this phone for every character
  const CHAT_KEY = 'azsolo.chattabs';
  // channel groups you can pick for a tab ('say' also shows yells and creature speech; 'loot' also shows combat)
  const CHAT_GROUPS = [['general', 'General', ['general', 'defense']], ['lfg', 'LFG', ['lfg']], ['guild', 'Guild', ['guild']], ['whisper', 'Whispers', ['whisper']],
    ['party', 'Party', ['party']], ['say', 'Say', ['say', 'yell', 'monster']], ['system', 'System', ['system']], ['loot', 'Loot', ['loot', 'combat']]];
  const CHAT_DEFAULT = () => ({ tabs: [{ name: 'General', chs: ['general', 'say', 'whisper', 'party', 'system'] }, { name: 'LFG', chs: ['lfg'] }, { name: 'Guild', chs: ['guild'] }], active: 0 });
  const CHAT_MAX_TABS = 6;
  function chatPrefs() {
    if (ui.chatPrefs) return ui.chatPrefs;
    let p = null; try { p = JSON.parse(localStorage.getItem(CHAT_KEY) || 'null'); } catch (e) { p = null; }
    if (!p || !Array.isArray(p.tabs) || !p.tabs.length) p = CHAT_DEFAULT();
    if (p.active !== 'requests' && !(p.active >= 0 && p.active < p.tabs.length)) p.active = 0;
    return (ui.chatPrefs = p);
  }
  function saveChatPrefs() { try { localStorage.setItem(CHAT_KEY, JSON.stringify(ui.chatPrefs)); } catch (e) { } }
  const isOpenReq = (m) => m.act && m.act.state === 'open';
  function chatFilter(active) {
    if (active === 'requests') return isOpenReq;
    const tab = chatPrefs().tabs[active]; if (!tab) return () => true;
    const chs = new Set(); for (const [k, , list] of CHAT_GROUPS) if (tab.chs.includes(k)) list.forEach((c) => chs.add(c));
    // combat spam stays out of the strip unless it's XP; a full "Loot" tab shows it all
    return (m) => chs.has(m.ch) && (m.ch !== 'combat' || tab.chs.length === 1 || m.text.startsWith('You gain'));
  }
  const chatTabName = (active) => active === 'requests' ? 'Requests' : ((chatPrefs().tabs[active] || {}).name || 'Chat');
  function setChatTab(active) { chatPrefs().active = active; saveChatPrefs(); renderChat(); if (ui.sheet === 'social' && ui.sheetFn) ui.sheetFn(); }
  function editChatTabs(scroll) {
    const p = chatPrefs();
    // redraw after each change, keeping the list where it was ('end' after adding a tab)
    const done = (to) => { const at = list.scrollTop; saveChatPrefs(); renderChat(); if (ui.sheet === 'social' && ui.sheetFn) ui.sheetFn(); editChatTabs(to || at); };
    const list = h('div', { class: 'ctab-list' });
    p.tabs.forEach((tab, i) => {
      const name = h('input', { type: 'text', value: tab.name, maxlength: '14', 'aria-label': 'Tab name', class: 'ctab-name' });
      name.addEventListener('change', () => { tab.name = name.value.trim() || 'Tab'; saveChatPrefs(); renderChat(); if (ui.sheet === 'social' && ui.sheetFn) ui.sheetFn(); });
      const chips = h('div', { class: 'chips' });
      for (const [k, label] of CHAT_GROUPS) chips.append(h('button', { class: 'chip' + (tab.chs.includes(k) ? ' gold' : ''), onclick: () => {
        if (tab.chs.includes(k)) { if (tab.chs.length === 1) return toast('A tab needs at least one channel.'); tab.chs = tab.chs.filter((x) => x !== k); } else tab.chs.push(k);
        done();
      } }, label));
      const btns = h('div', { class: 'ctab-btns' },
        i > 0 ? h('button', { class: 'chip', 'aria-label': 'Move left', onclick: () => { p.tabs.splice(i - 1, 0, p.tabs.splice(i, 1)[0]); if (p.active === i) p.active = i - 1; else if (p.active === i - 1) p.active = i; done(); } }, '←') : null,
        h('button', { class: 'chip', disabled: p.tabs.length <= 1, onclick: () => { p.tabs.splice(i, 1); if (p.active !== 'requests' && p.active >= p.tabs.length) p.active = p.tabs.length - 1; else if (p.active !== 'requests' && p.active > i) p.active--; done(); } }, 'Remove'));
      list.append(h('div', { class: 'ctab' }, h('div', { class: 'ctab-top' }, name, btns), chips));
    });
    showDialog([h('h3', null, 'Chat tabs'), h('p', { class: 'ai-note', style: { margin: '0 0 8px' } }, 'Pick which channels each tab shows. The strip on the main screen shows the tab you have open.'), list,
      h('div', { class: 'btn-row', style: { marginTop: '10px' } },
        h('button', { class: 'btn alt', disabled: p.tabs.length >= CHAT_MAX_TABS, onclick: () => { p.tabs.push({ name: 'New tab', chs: CHAT_GROUPS.map((g) => g[0]).filter((k) => k !== 'loot') }); p.active = p.tabs.length - 1; done('end'); } }, '+ Add tab'),
        h('button', { class: 'btn alt', onclick: () => { ui.chatPrefs = CHAT_DEFAULT(); done(); } }, 'Reset')),
      h('button', { class: 'btn wide', style: { marginTop: '8px' }, onclick: closeDialog }, 'Done')], true);
    if (scroll) list.scrollTop = scroll === 'end' ? list.scrollHeight : scroll;
  }
  function renderChat() {
    if (!els.chat) return;
    const lines = G.S.chat.filter(chatFilter(chatPrefs().active)).slice(-5);
    els.chatLines.innerHTML = lines.map(chatLineHtml).join('');
    const nReq = G.S.chat.filter((m) => m.act && m.act.state === 'open').length;
    els.chatOpen.innerHTML = `<span>Chat</span><small>${esc(chatTabName(chatPrefs().active))}</small>${nReq ? `<b class="tnum">${nReq}</b>` : ''}`;
    if (ui.sheet === 'social' && ui.socialTab === 'chat') refreshChatLog();
  }

  // ============================================================ panel
  function renderPanel() {
    const S = G.S, P = S.player, p = els.panel;
    const scroll = p.scrollTop;
    p.innerHTML = '';
    if (S.run) { runPanel(p); p.scrollTop = scroll; return; }
    if (G.fight) { fightPanel(p); return; }
    if (P.ghostUntil) { p.append(h('div', { class: 'sec-h' }, 'Spirit')); p.append(h('p', null, 'Your spirit is returning to your body. You will come back with half health.')); return; }
    if (P.travel) { p.append(h('div', { class: 'sec-h' }, 'On the road'), h('p', null, `Heading to ${D.PLACES[P.travel.to].name}.`)); taskCards(p); tracker(p); return; }
    if (S.queue) {
      p.append(h('div', { class: 'row', style: { gridTemplateColumns: '34px 1fr auto' } },
        h('div', { class: 'ic' }, img(art('icon', 'hearthstone'))),
        h('div', { class: 't' }, h('b', null, 'Queued: ' + D.ACTIVITIES[S.queue.act].name), h('small', { id: 'q-time' }, 'Waiting...')),
        h('button', { class: 'chip', onclick: () => G.leaveQueue() }, 'Leave')));
    }
    const place = D.PLACES[P.place];
    const mobs = G.placeMobs();
    // party strip, then tabs; only one short list shows at a time
    taskCards(p);
    if (S.wparty) p.append(partyStrip());
    const TABS = [['fight', 'Fight'], ['people', 'People'], ['quests', 'Quests'], ['travel', 'Travel']];
    if (!ui.tab || (ui.tab === 'fight' && !mobs.length && ui.tabAuto !== P.place)) { ui.tab = mobs.length ? 'fight' : 'people'; ui.tabAuto = P.place; }
    // arriving where a request you accepted takes place: straight to the fight
    if (ui.tabAuto !== P.place && mobs.length && window.SOC && SOC.activeTasks().some((m) => m.act.place === P.place)) { ui.tab = 'fight'; ui.tabAuto = P.place; }
    const dots = {
      people: place.npcs.some((n) => G.npcMarker(n) === '!' || G.npcMarker(n) === '?'),
      quests: Object.keys(P.quests).some((q) => G.questState(q) === 'complete'),
    };
    const bar = h('div', { class: 'ptabs' });
    for (const [k, label] of TABS) bar.append(h('button', { class: (ui.tab === k ? 'on' : '') + (dots[k] ? ' dot' : ''), onclick: () => { ui.tab = k; ui.tabAuto = P.place; renderPanel(); els.panel.scrollTop = 0; } }, label));
    p.append(bar);
    const body = h('div', { class: 'pbody' });
    p.append(body);
    if (ui.tab === 'fight') fightTab(body, place, mobs);
    else if (ui.tab === 'people') peopleTab(body, place);
    else if (ui.tab === 'quests') questsTab(body);
    else travelTab(body, place);
    p.scrollTop = scroll;
  }
  // a request you accepted stays in view: who, what, where, and a way to get there
  function taskCards(p) {
    if (!window.SOC) return;
    const P = G.S.player;
    for (const m of SOC.activeTasks().slice(0, 2)) {
      const a = m.act, b = G.S.bots.find((x) => x.id === a.bot), who = b ? b.name : m.from;
      const here = P.place === a.place || (P.travel && P.travel.to === a.place);
      const Pl = D.PLACES[a.place];
      let title, what;
      if (a.kind === 'help_kill') { title = `Helping ${who}`; what = `Kill ${D.MOBS[a.mob].name}: ${Math.min(a.got, a.n)}/${a.n}`; }
      else { const Q = D.QUESTS[a.qid]; title = `Teaming up with ${who}`; what = Q ? `"${Q.name}"` : 'your quest'; }
      const where = P.place === a.place ? 'here' : `at ${Pl.name}${Pl.zone && Pl.zone !== (D.PLACES[P.place] || {}).zone ? ', ' + Pl.zone : ''}`;
      const mins = Math.max(1, Math.ceil((a.until - Date.now()) / 60000));
      p.append(h('div', { class: 'task' },
        h('button', { class: 'task-b', onclick: () => msgDialog(m) },
          h('div', { class: 'ic mob' }, img(a.mob ? mobArt(a.mob) : art('icon', 'chest_box'))),
          h('div', { class: 't' }, h('b', null, title), h('span', null, what), h('small', null, `${where} · ${mins} min left`))),
        here ? null : h('button', { class: 'chip gold', onclick: () => routeDialog(a.place) }, 'Go')));
    }
  }
  function partyStrip() {
    const S = G.S;
    const strip = h('div', { class: 'pstrip' }, h('span', { class: 'pstrip-l' }, 'Party'));
    for (const m of S.wparty.members) {
      const st = E.statsFor(m); const hp = m.hp == null ? st.maxHp : m.hp;
      strip.append(h('button', { class: 'pmini', onclick: () => { ui.tab = 'people'; renderPanel(); } },
        h('b', { class: 'cls-' + m.cls }, m.name.split('-')[0]), h('div', { class: 'bar thin' }, h('i', { style: { width: Math.max(0, hp / st.maxHp * 100) + '%', background: 'var(--hp)' } }))));
    }
    return strip;
  }
  function fightTab(b, place, mobs) {
    const P = G.S.player, Cl = D.CLASSES[P.cls];
    // pets and demons, compact
    if (P.cls === 'hunter' || Cl.pets) {
      const row = h('div', { class: 'chips' });
      if (P.cls === 'hunter') {
        if (P.pet) row.append(h('button', { class: 'chip' + (P.pet.hp === 0 ? ' gold' : ''), onclick: () => { if (P.pet.hp === 0) G.summon('beast'); } }, h('span', { style: { color: '#9fd6ff' } }, P.pet.name), h('small', null, P.pet.hp === 0 ? 'Dead · tap to revive' : 'Pet')));
        if (P.level >= D.PETS.beast.lvl) for (const m of mobs.filter((x) => G.tamable(x)).slice(0, 3)) row.append(h('button', { class: 'chip', onclick: () => G.tame(m.id) }, 'Tame ' + D.MOBS[m.key].name, h('small', null, String(m.level))));
        else if (!P.pet) row.append(h('div', { class: 'people' }, 'At level 10 you can tame a beast.'));
      } else for (const type of Cl.pets) {
        const Pd = D.PETS[type]; const have = P.pet && P.pet.type === type && P.pet.hp !== 0; const can = G.canSummon(type);
        row.append(h('button', { class: 'chip' + (have ? ' gold' : ''), disabled: !can && !have, onclick: () => { if (!have) G.summon(type); } }, have ? `${P.pet.name}` : 'Summon ' + Pd.name, h('small', null, have ? Pd.name : can ? Math.round(Pd.cost * 100) + '% mana' : 'Level ' + Pd.lvl)));
      }
      b.append(row);
    }
    if (place.gather && P.quests[place.gather.quest] && G.questState(place.gather.quest) !== 'complete') {
      const W = G.S.world[P.place]; const n = W ? W.nodes.n : 4;
      b.append(h('button', { class: 'chip gold', disabled: !n, onclick: () => G.gather() }, 'Collect ' + place.gather.label, h('small', null, n ? n + ' nearby' : 'More soon')));
    }
    const nodes = G.placeNodes();
    if (nodes.length) {
      const row = h('div', { class: 'chips' });
      for (const nd of nodes) { const p = G.profs()[nd.N.prof], col = G.skillColor(p.skill, G.nodeSk(nd.N));
        row.append(h('button', { class: 'chip gold', disabled: col < 0, onclick: () => G.gatherNode(nd.i) }, img(art('icon', nd.N.item)), ' ', `${D.PROFESSIONS[nd.N.prof].verb} ${nd.N.name}`, h('small', { style: { color: SKILL_COL[col + 1] } }, col < 0 ? `needs ${nd.N.skill}` : `skill ${p.skill}`))); }
      b.append(row);
    }
    if (!mobs.length) { b.append(h('div', { class: 'people' }, place.safe ? 'No creatures in town. See People for quests and vendors.' : 'Nothing to fight here right now.')); return; }
    const needKeys = questMobKeys();
    const grid = h('div', { class: 'mgrid', id: 'mob-list' });
    const foe = G.intruderHere();
    if (foe) grid.append(h('button', { class: 'mcard foe-card', onclick: () => confirmAttack(foe) },
      h('div', { class: 'ic mob' }, img(art('portrait', looks(foe)))),
      h('div', { class: 't' }, h('b', null, h('span', { style: { color: conColor(foe.level) } }, foe.level + ' '), foe.name), h('small', { style: { color: '#ff6a5a' } }, `Enemy ${D.CLASSES[foe.cls].name}`))));
    for (const m of mobs.slice().sort((a, c) => rankMob(a) - rankMob(c)).slice(0, 12)) {
      const M = D.MOBS[m.key];
      const alive = m.state === 'alive';
      const st = m.state === 'tapped' ? `Fighting ${m.by}` : m.state === 'dead' ? 'Respawning' : m.state === 'fight' ? 'In combat' : (M.elite ? 'Elite' : M.named ? 'Rare' : 'Attack');
      grid.append(h('button', { class: 'mcard' + (alive ? '' : ' off') + (needKeys.has(m.key) ? ' quest-mob' : ''), 'data-mob': m.id, onclick: () => G.engage(m.id) },
        h('div', { class: 'ic mob' }, img(mobArt(m.key))),
        h('div', { class: 't' }, h('b', null, h('span', { style: { color: conColor(m.level) } }, (M.elite ? m.level + '+' : m.level) + ' '), M.name), h('small', { class: m.state === 'tapped' ? 'cls-' + m.byCls : '' }, (needKeys.has(m.key) ? '◆ ' : '') + st))));
    }
    b.append(grid);
  }
  function peopleTab(b, place) {
    const S = G.S, P = S.player;
    if (S.wparty) partyBlock(b);
    const here = h('div', { class: 'mgrid' });
    for (const npc of place.npcs) {
      const N = D.NPCS[npc]; const mk = G.npcMarker(npc);
      here.append(h('button', { class: 'mcard', onclick: () => openNpc(npc) },
        h('div', { class: 'ic' }, mk ? h('span', { class: 'mark' + (mk === '…' ? ' grey' : '') }, mk === '…' ? '?' : mk) : img(art('icon', N.legend ? 'legend_' + N.legend : npc === place.vendor || npc === place.gearVendor ? 'coin' : 'hearthstone'))),
        h('div', { class: 't' }, h('b', { style: { color: '#ffd100' } }, N.name), h('small', null, N.title))));
    }
    if (place.npcs.length) b.append(here); else b.append(h('div', { class: 'people' }, 'No one to talk to here.'));
    const partyIds = new Set(((S.wparty && S.wparty.members) || []).map((m) => m.bot.id));
    const near = B.onlineIn(S, P.place, new Date()).filter((x) => !partyIds.has(x.id) && B.factionOf(x) === G.myFaction());
    if (near.length) {
      const chips = h('div', { class: 'chips' });
      for (const x of near.slice(0, 12)) chips.append(h('button', { class: 'chip', onclick: () => confirmInvite(x) }, h('span', { class: 'cls-' + x.cls }, x.name), h('small', null, `${x.level} ${raceClass(x)}`)));
      b.append(h('div', { class: 'sec-h' }, 'Players here', h('small', null, `${near.length} nearby · tap to invite`)), chips);
    }
    // hub bounty board: 3 daily + 1 weekly, rotating with the real date
    if (G.isHub(P.place)) {
      const bs = G.bounties(P.place);
      if (bs.length) {
        b.append(h('div', { class: 'sec-h' }, 'Bounty Board', h('small', null, 'new every day · weekly on Monday')));
        const list = h('div', { class: 'list' });
        for (const bb of bs) {
          const st = G.bountyState(bb), rec = (P.bounty || {})[bb.id];
          const label = st === 'available' ? 'Take' : st === 'complete' ? 'Turn in' : st === 'done' ? 'Done' : `${rec.prog}/${bb.n}`;
          list.append(h('button', { class: 'row' + (st === 'done' ? ' off' : ''), onclick: () => { if (st === 'available') G.acceptBounty(bb); else if (st === 'complete') G.turnInBounty(bb); renderPanel(); } },
            h('div', { class: 'ic mob' }, img(mobArt(bb.mob))),
            h('div', { class: 't' }, h('b', null, `${bb.weekly ? 'Weekly: ' : ''}${bb.n} ${D.MOBS[bb.mob].name}`), h('small', { style: { whiteSpace: 'normal' } }, `${bb.xp} XP · ${G.moneyText(bb.money)} · ${bb.marks} Mentor Marks${bb.weekly ? ' · a green item' : ''}`)),
            h('div', { class: 'r' }, h('span', { class: st === 'complete' ? 'pill ready' : 'pill' }, label))));
        }
        b.append(list);
      }
    }
    const foe = G.intruderHere();
    if (foe) b.append(h('div', { class: 'sec-h foe-h' }, 'Enemy player', h('small', null, 'tap to attack')),
      h('div', { class: 'chips' }, h('button', { class: 'chip foe', onclick: () => confirmAttack(foe) }, h('span', null, '⚔ ' + foe.name), h('small', null, `${foe.level} ${D.CLASSES[foe.cls].name}`))));
  }
  function questsTab(b) {
    const P = G.S.player;
    if (!Object.keys(P.quests).length) b.append(h('div', { class: 'people' }, 'No quests yet. Look for a yellow ! in People.'));
    else tracker(b, true);
    questLeads(b);
    b.append(h('button', { class: 'btn alt wide', onclick: () => openQuests() }, 'Open quest log'));
  }
  // Where the next quests are, so running out here never means running out.
  function questLeads(b) {
    const P = G.S.player, here = D.PLACES[P.place], region = here.region || 'elwynn';
    const at = {}, soon = {};
    for (const k in D.PLACES) for (const n of (D.PLACES[k].npcs || [])) at[n] = k;
    const places = {};
    let nextLvl = 0;
    for (const qid in D.QUESTS) {
      const Q = D.QUESTS[qid], pk = at[Q.giver]; if (!pk) continue;
      const pl = D.PLACES[pk]; if ((pl.region || 'elwynn') !== region) continue;
      const st = G.questState(qid);
      if (st === 'available') places[pk] = (places[pk] || 0) + 1;
      else if (st === 'low' && (!nextLvl || Q.lvl - 2 < nextLvl)) nextLvl = Q.lvl - 2;
    }
    const others = Object.keys(places).filter((k) => k !== P.place);
    if (!others.length && !places[P.place]) {
      const horde = (D.RACES[P.race] || {}).faction === 'horde';
      const nextZone = P.level >= 9 && region !== 'westfall' && region !== 'barrens' ? (horde ? ' Next: the Barrens. Head to the Crossroads (from Razor Hill, Bloodhoof Village or Orgrimmar).' : ' Next: Westfall. Head to Sentinel Hill (west of Goldshire).') : '';
      b.append(h('div', { class: 'people' }, (nextLvl ? `No new quests in ${here.zone} until level ${nextLvl}. Hunt, or try the group finder.` : `You have done every quest in ${here.zone}.`) + nextZone));
      return;
    }
    if (!others.length) return;
    const chips = h('div', { class: 'chips' });
    for (const k of others.sort((x, y) => places[y] - places[x])) {
      const t = here.links && here.links[k];
      chips.append(h('button', { class: 'chip gold', onclick: () => (t ? G.travelTo(k) : routeDialog(k)) }, D.PLACES[k].name, h('small', null, `${places[k]} quest${places[k] > 1 ? 's' : ''}${t ? ' · ' + t + 's' : ''}`)));
    }
    b.append(h('div', { class: 'sec-h' }, places[P.place] ? 'More quests nearby' : 'Quests for you', h('small', null, places[P.place] ? '' : 'none left here')), chips);
  }
  function travelTab(b, place) {
    const P = G.S.player;
    const roads = h('div', { class: 'chips' });
    for (const to in place.links) { const foe = G.enemyTown(to); roads.append(h('button', { class: 'chip', disabled: foe, onclick: () => G.travelTo(to) }, D.PLACES[to].name, h('small', { style: foe ? { color: '#ff6a5a' } : null }, foe ? 'Enemy town' : (D.PLACES[to].zone !== place.zone ? D.PLACES[to].zone + ' · ' : '') + (place.via && place.via[to] ? place.via[to] + ' · ' : '') + G.travelSecs(P.place, to) + 's'))); }
    const hs = (P.hearthAt || 0) - now();
    roads.append(h('button', { class: 'chip gold', onclick: () => G.hearth(), disabled: hs > 0 || P.place === P.bind }, 'Hearthstone', h('small', null, hs > 0 ? Math.ceil(hs / 60000) + 'm' : D.PLACES[P.bind].name)));
    b.append(roads, h('button', { class: 'btn alt wide', onclick: () => openMap() }, 'Open map'));
  }
  function rankMob(m) {
    const r = { alive: 0, fight: 1, tapped: 2, dead: 3 }[m.state] || 4;
    return r * 10 + (questMobKeys().has(m.key) ? 0 : 1);
  }
  function questMobKeys() {
    const P = G.S.player, out = new Set(window.SOC ? SOC.taskMobs() : []);
    for (const qid in P.quests) {
      if (G.questState(qid) === 'complete') continue;
      for (const o of D.QUESTS[qid].objs) {
        if (o.type === 'kill') out.add(o.mob);
        if (o.type === 'collect') for (const k in D.MOBS) if ((D.MOBS[k].qdrops || []).some((d) => d[0] === o.item)) out.add(k);
      }
    }
    return out;
  }
  function tracker(p, all) {
    const P = G.S.player;
    const qs = Object.keys(P.quests);
    if (!qs.length) return;
    const t = h('div', { class: 'tracker' });
    for (const qid of qs.slice(0, all ? 20 : 4)) {
      const st = G.questState(qid);
      const fresh = ui.flashQ && ui.flashQ.qid === qid && Date.now() - ui.flashQ.at < 2500;
      t.append(h('div', { class: 'q' + (fresh ? ' flash' : '') }, D.QUESTS[qid].name + (st === 'complete' ? ' (Complete)' : '')));
      if (st !== 'complete') for (const pr of G.questProgress(qid)) t.append(h('div', { class: 'o tnum' + (pr.have >= pr.n ? ' done' : '') }, `- ${pr.label}: ${pr.have}/${pr.n}`));
    }
    p.append(h('button', { style: { textAlign: 'left' }, onclick: () => openQuests() }, t));
  }
  function partyBlock(p) {
    const S = G.S, C = G.fight;
    const pf = h('div', { class: 'pf' });
    for (const m of S.wparty.members) {
      const u = C ? C.allies.find((x) => x.memberRef === m) : null;
      const st = E.statsFor(m); const hp = u ? u.hp : (m.hp == null ? st.maxHp : m.hp);
      const bar = h('div', { class: 'bar hp', 'data-pf': u ? u.uid : '' }, h('i', { style: { width: Math.max(0, hp / st.maxHp * 100) + '%' } }), h('b', { class: 'tnum' }, Math.round(hp)));
      pf.append(h('button', { class: 'pfr' + (u && u.dead ? ' dead' : '') + (C && u && C.allyTarget === u.uid ? ' sel' : ''), onclick: () => { if (u) { G.setTarget(u.uid); renderTarget(); markTargets(); } } },
        h('div', { class: 'portrait' }, h('div', { class: 'pclip' }, img(art('portrait', looks(m))))),
        h('div', { class: 'uf-body' }, h('div', { class: 'uf-name cls-' + m.cls }, m.name, h('small', { class: 'rc' }, `${m.level} ${raceClass(m)}`)), bar, u ? h('div', { class: 'buffs rowbuffs', 'data-au': u.uid }) : null),
        h('div', { class: 'role' }, m.role === 'tank' ? 'TANK' : m.role === 'healer' ? 'HEAL' : 'DPS')));
    }
    const left = Math.max(0, S.wparty.until - Date.now());
    p.append(h('div', { class: 'sec-h' }, 'Party', h('small', null, C ? 'XP is shared' : S.wparty.meet ? `meeting at ${D.PLACES[S.wparty.place].name}` : `about ${Math.ceil(left / 60000)} min left`)), pf);
    if (!C) p.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => G.leaveParty() }, 'Leave party')));
  }
  function confirmInvite(b) {
    if (G.S.wparty && G.S.wparty.members.some((m) => m.bot.id === b.id)) return toast(`${b.name} is already in your party.`, true);
    if (G.S.run || G.S.queue) return toast('Not while in the group finder.');
    if (G.partySize() >= 3) return toast('Your party is full.');
    const bio = h('p', { class: 'bio' }, B.bio(b));
    showDialog([h('h3', null, `Invite ${b.name}?`), h('p', null, `Level ${b.level} ${(D.RACES[b.race] || D.RACES.human).name} ${D.CLASSES[b.cls].name}`), bio,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.invite(b.id); } }, 'Invite'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Cancel'))], true);
  }
  function confirmAttack(foe) {
    const R = D.RACES[foe.race] || {}, place = D.PLACES[G.S.player.place];
    showDialog([h('h3', null, `Attack ${foe.name}?`), h('p', null, `Level ${foe.level} ${R.name || ''} ${D.CLASSES[foe.cls].name}, an enemy player.`),
      h('p', { style: { color: 'var(--muted)', fontSize: '13px' } }, (place.safe ? 'The town guards will fight on your side. ' : '') + 'Win to earn Honor. You get the first strike.'),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.attackIntruder(); } }, 'Attack'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Leave them'))], true);
  }
  function showWarModeIntro() {
    showDialog([h('h3', null, 'War Mode'), h('p', null, 'Turn on War Mode and enemy players will show up in the world. Some pass by, some attack you, and you can attack them too.'),
      h('p', null, 'While it is on you get +10% experience and gold, and Honor for every enemy player you defeat.'),
      h('p', { style: { color: 'var(--muted)', fontSize: '13px' } }, 'Capitals and starting valleys stay safe. Guards help you in towns. You can change this any time in Hero.'),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.setWarMode(true); } }, 'Turn on'), h('button', { class: 'btn alt', onclick: () => { closeDialog(); G.setWarMode(false); } }, 'Not now'))]);
  }
  function showPartyInvite(d) {
    const b = d.bot;
    showDialog([h('h3', null, `${b.name} invites you to a group`), h('p', null, `Level ${b.level} ${(D.RACES[b.race] || D.RACES.human).name} ${D.CLASSES[b.cls].name}, ${d.why}.`),
      h('p', { style: { color: 'var(--muted)', fontSize: '13px' } }, 'XP is shared with a group bonus, pulls get bigger, and gear drops are rolled.'),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.acceptPartyInvite(b.id); } }, 'Accept'), h('button', { class: 'btn alt', onclick: () => { closeDialog(); G.declinePartyInvite(b.id); } }, 'Decline'))]);
  }
  function fightPanel(p) {
    const C = G.fight;
    if (G.S.wparty) partyBlock(p);
    const list = h('div', { class: 'list' });
    for (const u of C.enemies) {
      const tgt = C.units[u.target];
      list.append(h('button', { class: 'row' + (u.dead ? ' off' : ''), onclick: () => { G.setTarget(u.uid); renderTarget(); markTargets(); } },
        h('div', { class: 'ic mob' }, img(u.kind === 'mob' ? mobArt(u.key) : art('portrait', looks(u.char)))),
        h('div', { class: 't' }, h('b', null, h('span', { style: { color: conColor(u.level) } }, u.level + ' '), u.name), h('small', null, u.dead ? 'Dead' : (u.kind !== 'mob' ? `${(D.RACES[u.race] || {}).name || ''} ${D.CLASSES[u.cls].name} · ` : '') + (tgt ? 'Attacking ' + (tgt.kind === 'player' ? 'you' : tgt.name) : ''))),
        h('div', { class: 'r tnum', 'data-hp': u.uid }, ''),
        h('div', { class: 'buffs rowbuffs', 'data-au': u.uid })));
    }
    p.append(h('div', { class: 'sec-h' }, 'In combat', h('small', null, 'tap an enemy to target it')), list);
    p.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => G.flee() }, G.fight && G.fight.kind === 'duel' ? 'Yield' : 'Run away')));
    tracker(p);
  }
  const MARK_SYM = { skull: '☠', cross: '✖' };
  // the run's scoreboard: clock against par, Momentum, and whether it is still flawless
  function runScore(p, R) {
    const A = D.ACTIVITIES[R.act], Dg = A.dungeon && D.DUNGEONS[A.dungeon];
    if (!Dg || !Dg.par) return;
    const cx = (G.S.player.codex || {})[R.act];
    if (R.phase === 'done' && R.bonus) {
      const b = R.bonus;
      p.append(h('div', { class: 'score done' },
        h('div', null, h('span', null, 'Cleared in '), h('b', { class: 'tnum' }, G.fmtClock(b.secs)), h('span', null, ` · par ${G.fmtClock(b.par)}`)),
        h('div', null, h('span', { class: b.speed ? 'ok' : 'no' }, (b.speed ? '✓' : '✗') + ' Speed bonus'), h('span', { class: b.flawless ? 'ok' : 'no' }, (b.flawless ? '✓' : '✗') + ' Flawless')),
        cx ? h('small', null, `Best ${G.fmtClock(cx.best)} · ${cx.clears} clears · ${cx.speed} speed · ${cx.flawless} flawless`) : null));
      return;
    }
    p.append(h('div', { class: 'score' },
      h('span', null, '⏱ ', h('b', { class: 'tnum', 'data-clock': '1' }, G.fmtClock(G.runClock())), ` / par ${G.fmtClock(Dg.par)}`),
      R.momentum ? h('span', { class: 'mom' }, `Momentum ×${R.momentum}`) : h('span', { class: 'dim' }, 'Pull within 5s to build Momentum'),
      h('span', { class: R.wipes ? 'no' : 'ok' }, R.wipes ? '✗ Flawless' : '✓ No wipes')));
  }
  function tacticsBlock(p, R) {
    const pace = R.pace || 'normal';
    const chip = (label, on, fn, sub) => h('button', { class: 'chip' + (on ? ' gold' : ''), onclick: () => { fn(); renderPanel(); } }, label, sub ? h('small', null, sub) : null);
    // set once, read often: Tactics and Boss plan fold to one line (closed by default) so the pull and the party stay on screen
    p.append(...foldSec('run.tactics', 'Tactics', ({ careful: 'Careful', normal: 'Normal', fast: 'Fast' })[pace] + ' · ' + (pace === 'careful' ? 'safest, best for Flawless' : pace === 'fast' ? 'builds Momentum, more wipes' : 'standard rests'),
      [h('div', { class: 'chips' }, chip('Careful', pace === 'careful', () => G.setPace('careful')), chip('Normal', pace === 'normal', () => G.setPace('normal')), chip('Fast', pace === 'fast', () => G.setPace('fast')))]));
    const pull = R.pulls[R.idx]; if (!pull) return;
    const marks = (R.marks && R.marks[R.idx]) || {};
    const next = h('div', { class: 'chips' });
    pull.mobs.forEach((k, i) => next.append(h('button', { class: 'chip mark-' + (marks[i] || 'none'), onclick: () => { G.cycleMark(i); renderPanel(); } }, h('span', { class: 'mk' }, MARK_SYM[marks[i]] || '·'), D.MOBS[k].name)));
    p.append(h('div', { class: 'sec-h' }, 'Next: ' + pull.label, h('small', null, 'tap to mark: ☠ first, ✖ second')), next);
    if (pull.boss) {
      const bp = R.bossPlan;
      p.append(...foldSec('run.bossplan', 'Boss plan', bp === 'boss' ? 'Burn the boss' : bp === 'adds' ? 'Adds first' : 'not set · the group improvises',
        [h('div', { class: 'chips' }, chip('Burn the boss', bp === 'boss', () => G.setBossPlan('boss')), chip('Adds first', bp === 'adds', () => G.setBossPlan('adds')))]));
    }
  }
  // Leaving before the last boss costs the group and gives Deserter, so ask first; once the run is done, just go.
  function confirmLeaveGroup(after) {
    const R = G.S.run;
    const go = () => { closeDialog(); G.leaveGroup(); renderAll(); if (typeof after === 'function') after(); };
    if (!R || R.phase === 'done') return go();
    const left = R.pulls.length - R.idx;
    showDialog([h('h3', null, `Leave ${R.name}?`), h('p', null, `The group still has ${left} pull${left === 1 ? '' : 's'} to go. Leaving now gives you Deserter for 10 minutes, and you can't join another group until it wears off.`),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: go }, 'Leave'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Stay'))], true);
  }
  function runPanel(p) {
    const S = G.S, R = S.run, C = G.fight;
    const dots = h('div', { class: 'progress-dots' });
    R.pulls.forEach((pl, i) => dots.append(h('i', { class: (pl.boss ? 'boss ' : '') + (i < R.idx ? 'done' : i === R.idx ? 'now' : '') })));
    const status = R.phase === 'fight' ? 'Fighting: ' + R.pulls[R.idx].label : R.phase === 'rest' && S.group.members.some((m) => m.gone) ? 'Looking for replacements...' : R.phase === 'rest' ? (G.role() === 'tank' ? 'You are the tank. Pull when ready.' : 'Resting. The tank will pull soon.') : R.phase === 'wipe' ? 'Running back...' : 'Dungeon complete.';
    p.append(h('div', { class: 'sec-h' }, R.name, h('small', null, `${Math.min(R.idx + (R.phase === 'done' ? 0 : 1), R.pulls.length)}/${R.pulls.length}${R.wipes ? ' · wipes ' + R.wipes : ''}`)), dots, h('div', { style: { color: 'var(--muted)', fontSize: '13px' } }, status));
    // Pull / Ready / Leave sit right under the progress line and stay pinned there, so a 10-player raid's frames never push them off screen
    const actions = h('div', { class: 'run-actions' }); p.append(actions);
    // party frames
    const pf = h('div', { class: 'pf' });
    const units = C ? C.allies : null;
    const members = [{ me: true, name: S.player.name, cls: S.player.cls, role: G.role(), char: S.player }].concat(S.group.members.map((m) => ({ name: m.name, cls: m.cls, role: m.role, char: m, gone: m.gone })));
    members.forEach((m, i) => {
      const u = units ? units.find((x) => (m.me ? x.kind === 'player' : x.memberRef === m.char)) : null;
      const row = h('button', { class: 'pfr' + (u && u.dead ? ' dead' : '') + (C && u && C.allyTarget === u.uid ? ' sel' : ''), onclick: () => { if (u) { G.setTarget(u.uid); renderTarget(); markTargets(); renderPanel(); } } },
        h('div', { class: 'portrait' }, h('div', { class: 'pclip' }, img(art('portrait', looks(m.me ? S.player : m.char.bot || m.char))))),
        h('div', { class: 'uf-body' }, h('div', { class: 'uf-name cls-' + m.cls }, m.gone ? m.name + ' (left)' : m.name, h('small', { class: 'rc' }, (m.me ? S.player.level : (m.char.level || '')) + ' ' + raceClass(m.me ? S.player : m.char))), h('div', { class: 'bar hp', 'data-pf': u ? u.uid : '' }, h('i'), h('b', { class: 'tnum' })), u ? h('div', { class: 'buffs rowbuffs', 'data-au': u.uid }) : null),
        h('div', { class: 'role' }, m.role === 'tank' ? 'TANK' : m.role === 'healer' ? 'HEAL' : 'DPS'));
      pf.append(row);
    });
    runScore(p, R);
    if (!C && R.phase === 'rest') tacticsBlock(p, R); // decide before the pull, above the party list
    p.append(h('div', { class: 'sec-h' }, 'Party', h('small', null, C && G.role() === 'healer' ? 'tap someone to heal them' : '')), pf);
    if (C) {
      const list = h('div', { class: 'list' });
      for (const u of C.enemies) {
        const tgt = C.units[u.target];
        list.append(h('button', { class: 'row' + (u.dead ? ' off' : ''), onclick: () => { G.setTarget(u.uid); renderTarget(); markTargets(); } },
          h('div', { class: 'ic mob' }, img(mobArt(u.key))),
          h('div', { class: 't' }, h('b', null, u.name), h('small', null, u.dead ? 'Dead' : tgt ? 'Attacking ' + (tgt.kind === 'player' ? 'YOU' : tgt.name.split('-')[0]) : '')),
          h('div', { class: 'r' }, h('span', { class: 'tnum', 'data-hp': u.uid }, ''), h('span', { class: 'markbtn', 'data-mk': u.uid, onclick: (e) => { e.stopPropagation(); G.cycleUnitMark(u.uid); } }, MARK_SYM[u.mark] || '◎')),
          h('div', { class: 'buffs rowbuffs', 'data-au': u.uid })));
      }
      p.append(h('div', { class: 'sec-h' }, 'Enemies', h('small', null, 'tap ◎ to mark kill order')), list);
    } else {
      const row = h('div', { class: 'btn-row' });
      if (R.phase === 'rest') row.append(h('button', { class: 'btn', onclick: () => G.runReady() }, G.role() === 'tank' ? 'Pull' : 'Ready'));
      if (R.phase === 'done' && S.player.quests.defias_brotherhood === undefined && !S.player.done.defias_brotherhood && R.act === 'deadmines') row.append(h('div', { style: { fontSize: '13px', color: 'var(--muted)' } }, 'Tip: Marshal Dughan in Goldshire has a quest for VanCleef.'));
      row.append(h('button', { class: 'btn alt', onclick: confirmLeaveGroup }, R.phase === 'done' ? 'Leave group' : 'Leave'));
      actions.append(row);
    }
    if (!actions.childNodes.length) actions.remove();
  }

  // ============================================================ action bar
  function barSlots() {
    const P = G.S.player;
    const known = G.knownAbilities();
    const C = D.CLASSES[P.cls];
    // v2.0: no cap; past 8 buttons the bar wraps to two rows
    const pot = G.S.player.bags.some((b) => b.item.slot === 'potion') ? ['potion'] : [];
    if (G.fight) { const r = G.racial(); return barArrange(known.concat(r && !(G.pUnit && G.pUnit.form) ? [r] : [], pot)); }
    const extras = ['eat'].concat(C.resource === 'mana' ? ['drink'] : [], pot);
    const ab = known.filter((a) => a !== 'taunt' && !D.ABILITIES[a].combatOnly);
    return barArrange(ab.concat(extras));
  }
  // the player's own bar layout, per character and saved with it: P.barOrder (ids in order) and P.barHide.
  // Anything not in the order yet (a newly learned ability) goes at the end, in the default order.
  function barPool() {
    const P = G.S.player, C = D.CLASSES[P.cls], r = G.racial();
    return [...new Set(G.knownAbilities().concat(r ? [r] : [], ['eat'], C.resource === 'mana' ? ['drink'] : [], ['potion']))];
  }
  function barArrange(list) {
    const P = G.S.player, o = P.barOrder || [], hide = P.barHide || [];
    return list.map((id, i) => [id, o.includes(id) ? o.indexOf(id) : 1000 + i]).sort((a, b) => a[1] - b[1]).map((x) => x[0]).filter((id) => !hide.includes(id));
  }
  // Hero → Abilities → Arrange action bar: tap one button, then another, to swap them (no dragging on a phone)
  function openBarEditor() {
    let pick = null;
    openSheet('bareditor', 'Arrange action bar', 'drag a button to move it, or tap two to swap them', (b) => {
      const P = G.S.player, r = G.racial();
      const pool = barPool(), shown = barArrange(pool), hidden = pool.filter((id) => (P.barHide || []).includes(id));
      if (pick != null && pick >= shown.length) pick = null;
      const changed = () => { pick = null; G.save(); renderBar(); ui.sheetFn(); };
      const tile = (id, fn, cls) => h('button', { class: 'ab' + (cls || ''), 'aria-label': D.ABILITIES[id].name, onclick: fn }, img(abIcon(id)),
        D.ABILITIES[id].combatOnly || id === 'taunt' || id === r ? h('span', { class: 'ab-tag' }, '⚔') : null);
      const grid = h('div', { class: 'actionbar bar-edit', style: { gridTemplateColumns: 'repeat(7, 1fr)' } });
      let dragged = false;
      shown.forEach((id, i) => {
        const t = tile(id, () => {
          if (dragged) { dragged = false; return; }
          if (pick == null || pick === i) { pick = pick === i ? null : i; return ui.sheetFn(); }
          const n = shown.slice(); [n[pick], n[i]] = [n[i], n[pick]]; P.barOrder = n.concat(hidden); changed();
        }, pick === i ? ' sel' : '');
        t.dataset.i = i;
        // drag and drop: hold and move a button, drop it on another spot to move it there
        t.addEventListener('pointerdown', (e) => {
          const x0 = e.clientX, y0 = e.clientY; let ghost = null, over = null;
          const move = (ev) => {
            if (!ghost) {
              if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
              const r = t.getBoundingClientRect();
              ghost = t.cloneNode(true); ghost.className = 'ab ab-ghost'; ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
              document.body.append(ghost); t.classList.add('dragging'); grid.classList.add('drag-on');
              // feel it lift: a short buzz on phones that have one, and the click sound
              try { navigator.vibrate && navigator.vibrate(12); } catch (x) { }
              if (window.SND) window.SND.play('click', { vol: 0.5 });
            }
            ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
            const el = document.elementFromPoint(ev.clientX, ev.clientY);
            const tgt = el && el.closest('.bar-edit .ab[data-i]');
            if (over && over !== tgt) over.classList.remove('drop');
            const was = over;
            over = tgt && tgt !== t ? tgt : null; if (over) over.classList.add('drop');
            ghost.classList.toggle('over', !!over);
            if (over && over !== was) try { navigator.vibrate && navigator.vibrate(6); } catch (x) { }
          };
          const up = () => {
            window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
            if (!ghost) return;
            ghost.remove(); t.classList.remove('dragging'); grid.classList.remove('drag-on'); dragged = true; setTimeout(() => { dragged = false; }, 0);
            if (!over) return;
            try { navigator.vibrate && navigator.vibrate(20); } catch (x) { }
            if (window.SND) window.SND.play('click', { vol: 0.7 });
            const n = shown.slice(); n.splice(+over.dataset.i, 0, n.splice(i, 1)[0]); P.barOrder = n.concat(hidden); changed();
          };
          window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
        });
        grid.append(t);
      });
      b.append(grid);
      if (pick != null) {
        b.append(h('p', { class: 'ai-note', style: { margin: 0 } }, `${D.ABILITIES[shown[pick]].name}: tap another button to swap places, or hide it.`),
          shown.length > 1 ? h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => { P.barOrder = shown.concat(hidden); P.barHide = (P.barHide || []).concat(shown[pick]); changed(); } }, 'Hide it'), h('button', { class: 'btn alt', onclick: () => { pick = null; ui.sheetFn(); } }, 'Cancel')) : null);
      } else b.append(h('p', { class: 'ai-note', style: { margin: 0 } }, 'The first row stays when you fold the bar. ⚔ shows only in combat; Eat and Drink only out of it.'));
      if (hidden.length) {
        const hg = h('div', { class: 'actionbar bar-edit', style: { gridTemplateColumns: 'repeat(7, 1fr)' } });
        for (const id of hidden) hg.append(tile(id, () => { P.barHide = P.barHide.filter((x) => x !== id); changed(); }, ' hid'));
        b.append(h('div', { class: 'sec-h' }, 'Hidden', h('small', null, 'tap to put it back')), hg);
      }
      if (P.barOrder || P.barHide) b.append(h('button', { class: 'btn alt wide', onclick: () => { delete P.barOrder; delete P.barHide; changed(); } }, 'Reset to default'));
    });
  }
  function renderBar() {
    const bar = els.bar; bar.innerHTML = '';
    els.abs = {};
    let slots = barSlots();
    // keep the usual button size: 7 per row (8 if it all fits on one), extra abilities wrap to a second row
    const cols = slots.length === 8 ? 8 : 7;
    // more than one row: a handle on the bar's top edge folds it to its first row to give the panel room; saved on this device
    const multi = slots.length > cols;
    let collapsed = false; try { collapsed = multi && localStorage.getItem('azsolo.barCollapsed') === '1'; } catch (e) { }
    const hidden = collapsed ? slots.length - cols : 0;
    if (collapsed) slots = slots.slice(0, cols);
    if (els.abHandle) els.abHandle.remove();
    els.abHandle = multi ? h('button', { class: 'ab-handle', 'aria-label': collapsed ? `Show ${hidden} more abilities` : 'Fold the action bar', onclick: () => {
      try { localStorage.setItem('azsolo.barCollapsed', collapsed ? '0' : '1'); } catch (e) { }
      renderBar();
    } }, h('span', { class: 'arr' }, collapsed ? '▴' : '▾'), collapsed ? h('small', { class: 'tnum' }, '+' + hidden) : null) : null;
    if (els.abHandle) els.bottom.append(els.abHandle);
    const n = Math.max(cols, Math.ceil(slots.length / cols) * cols);
    bar.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    for (let i = 0; i < n; i++) {
      const id = slots[i];
      if (!id) { bar.append(h('div', { class: 'ab empty' })); continue; }
      const ab = D.ABILITIES[id];
      const btn = h('button', { class: 'ab', 'aria-label': ab.name }, img(abIcon(id)), h('div', { class: 'cd' }), h('div', { class: 'cdt tnum' }));
      if (id === 'eat' || id === 'drink' || id === 'potion') {
        const n = G.S.player.bags.filter((b) => b.item.slot === (id === 'eat' ? 'food' : id === 'potion' ? 'potion' : 'drink')).reduce((a, b) => a + b.n, 0);
        btn.append(h('span', { class: 'cnt tnum' }, n));
      }
      let pressT = null, long = false;
      btn.addEventListener('pointerdown', () => { long = false; pressT = setTimeout(() => { long = true; abilityTip(id); }, 450); });
      btn.addEventListener('pointerup', () => clearTimeout(pressT));
      btn.addEventListener('pointerleave', () => clearTimeout(pressT));
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
      btn.addEventListener('click', () => { if (long) return; pressAbility(id); btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 120); });
      els.abs[id] = btn;
      bar.append(btn);
    }
  }
  function pressAbility(id) {
    const S = G.S, P = S.player;
    if (id === 'eat') return G.consume('food');
    if (id === 'drink') return G.consume('drink');
    if (id === 'potion') return G.usePotion(G.pUnit ? (G.pUnit.hp / G.pUnit.maxHp < 0.6 || !G.bestPotion('mana') ? null : 'mana') : null);
    if (G.fight) {
      if (id === 'attack') { G.toggleAuto(); return; }
      const why = G.useAbility(id);
      if (why) toast(why);
      return;
    }
    if (P.ghostUntil || P.travel) return;
    const ab = D.ABILITIES[id];
    if (ab.target === 'enemy') {
      if (S.run) return toast('Wait for the pull.');
      const keys = questMobKeys();
      const mobs = G.placeMobs().filter((m) => m.state === 'alive').sort((a, b) => (keys.has(b.key) ? 1 : 0) - (keys.has(a.key) ? 1 : 0));
      if (!mobs.length) return toast('No target nearby.');
      G.engage(mobs[0].id, id);
      return;
    }
    const why = G.castOutOfCombat(id);
    if (why) toast(why); else toast(ab.name, true);
  }
  function abilityText(id) {
    const ab = D.ABILITIES[id], P = G.S.player, L = P.level;
    const st = G.stats();
    const f = (x) => Math.round(x);
    let d = ab.desc || '';
    if (ab.dmg) {
      const lo = ab.dmg.base ? ab.dmg.base[0] + (ab.dmg.perLvl || 0) * L + (ab.dmg.coef || 0) * st.sp : ab.dmg.bonus ? ab.dmg.bonus[0] + ab.dmg.perLvl * L : 0;
      const hi = ab.dmg.base ? ab.dmg.base[1] + (ab.dmg.perLvl || 0) * L + (ab.dmg.coef || 0) * st.sp : ab.dmg.bonus ? ab.dmg.bonus[1] + ab.dmg.perLvl * L : 0;
      d = d.replace('{b}', lo === hi ? f(lo) : `${f(lo)} to ${f(hi)}`);
    }
    if (ab.heal) {
      const hl = (i) => f(ab.heal.base[i] + (ab.heal.perLvl || 0) * L + (ab.heal.coef || 0) * st.sp);
      d = d.replace('{h}', hl(0) === hl(1) ? hl(0) : `${hl(0)} to ${hl(1)}`);
    }
    if (ab.dot) d = d.replace('{d}', f((ab.dot.dmg + ab.dot.perLvl * L) * ab.dot.ticks));
    if (ab.hot) d = d.replace('{hh}', f((ab.hot.heal + ab.hot.perLvl * L) * ab.hot.ticks));
    if (ab.shield) d = d.replace('{s}', f(ab.shield.base + ab.shield.perLvl * L));
    if (ab.lifetap) d = d.split('{lt}').join(f(ab.lifetap.base + ab.lifetap.perLvl * L));
    if (ab.buff && ab.buff.stats) for (const k in ab.buff.stats) d = d.replace('{' + k + '}', f(ab.buff.stats[k] + ((ab.buff.perLvl && ab.buff.perLvl[k]) || 0) * L));
    const cost = E.abCost(ab, P);
    const res = D.CLASSES[P.cls].resource;
    return { name: ab.name, cost: cost ? `${cost} ${res === 'mana' ? 'Mana' : res === 'rage' ? 'Rage' : 'Energy'}` : '', cast: ab.cast ? (ab.channel ? 'Channeled' : ab.cast + ' sec cast') : 'Instant', cd: ab.cd ? ab.cd + ' sec cooldown' : '', d };
  }
  function abilityTip(id) {
    if (id === 'attack') return toast('Attack: turns auto-attack on or off.', true);
    if (id === 'potion') return toast('Potion: drinks your best healing potion (or a mana potion when your health is fine). Works in combat; 2 min cooldown.', true);
    if (id === 'eat' || id === 'drink') return toast(id === 'eat' ? 'Eat: restores health over 18 sec.' : 'Drink: restores mana over 18 sec.', true);
    const t = abilityText(id);
    showDialog(h('div', { class: 'tooltip' },
      h('div', { class: 'nm', style: { color: '#fff' } }, t.name),
      h('div', { class: 'flex dim' }, h('span', null, t.cost), h('span', null, t.cd)),
      h('div', { class: 'dim' }, t.cast),
      h('div', { style: { color: '#ffd100' } }, t.d)), true);
  }

  // ============================================================ per-frame updates
  function setBar(bar, v, max, text) {
    if (!bar) return;
    const i = bar.querySelector('i:last-of-type');
    const pct = max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0;
    i.style.width = pct + '%';
    const b = bar.querySelector('b');
    if (b) b.textContent = text != null ? text : `${Math.round(v)} / ${Math.round(max)}`;
  }
  // XP: a readable bar (xp / needed · percent), rested shown in blue, a tap for the details, and a floating +XP on gains
  const xpPct = (x, n) => { const p = x / n * 100; return p < 10 ? p.toFixed(1) : Math.floor(p); };
  function xpDetail() {
    const P = G.S.player;
    if (P.level >= D.LEVEL_CAP) return showDialog([h('h3', null, 'Experience'), h('p', null, `You are level ${D.LEVEL_CAP}, the level cap. From here, gear, raids and collections are how you grow.`), h('button', { class: 'btn wide', onclick: closeDialog }, 'OK')], true);
    const need = D.XP_TO_LEVEL[P.level], left = need - P.xp, rest = Math.round(P.rested);
    showDialog([h('h3', null, `Level ${P.level} → ${P.level + 1}`),
      h('div', { class: 'bar xp xpmain', style: { height: '18px', margin: '4px 0 8px' } }, h('i', { class: 'rest', style: { width: Math.min(100, (P.xp + P.rested) / need * 100) + '%' } }), h('i', { class: 'fill', style: { width: (P.xp / need * 100) + '%' } }), h('b', { class: 'tnum' }, `${xpPct(P.xp, need)}%`)),
      h('p', null, h('b', null, `${Math.floor(P.xp).toLocaleString()} of ${need.toLocaleString()} XP`), ` (${xpPct(P.xp, need)}%). ${left.toLocaleString()} more to level ${P.level + 1}.`),
      h('p', { style: { color: rest > 0 ? '#8fb6ff' : 'var(--muted)' } }, rest > 0 ? `Rested: +${rest.toLocaleString()} bonus XP, the blue part of the bar. Kills give double XP until it runs out. You build more by logging out in an inn or a city.` : 'Not rested. Log out in an inn or a city to build bonus XP for your next kills.'),
      h('button', { class: 'btn wide', onclick: closeDialog }, 'OK')], true);
  }
  function xpFloat(d) {
    if (!els.pXp || !els.pXp.isConnected || !d || !d.amount) return;
    const f = h('span', { class: 'xpfloat tnum' }, `+${d.amount.toLocaleString()} XP` + (d.bonus ? ` (${d.bonus.toLocaleString()} rested)` : ''));
    els.pXp.parentNode.append(f); setTimeout(() => f.remove(), 1500);
  }
  // money: kept current in the player frame; a change floats up beside it (+ gold in, − red out)
  function moneyTick(S) {
    const P = S.player, el = els.pMoney;
    if (!el || !el.isConnected) return;
    const same = ui.moneySeen && ui.moneySeen.id === S.id;
    if (same && ui.moneySeen.v === P.money && el.firstChild) return;
    const d = same ? P.money - ui.moneySeen.v : 0;
    ui.moneySeen = { id: S.id, v: P.money };
    el.innerHTML = moneyHtml(P.money, true);
    if (!d) return;
    if (ui.moneyFloat) ui.moneyFloat.remove();
    const f = ui.moneyFloat = h('span', { class: 'moneyfloat' + (d < 0 ? ' out' : ''), html: (d < 0 ? '−' : '+') + moneyHtml(Math.abs(d), false, true) });
    el.parentNode.parentNode.append(f); setTimeout(() => f.remove(), 1600);
  }
  function v0hp(P) { const v = G.vitals(); return v.hp > 0 && v.hp / v.maxHp < 0.25; }
  // loot flies from where the enemy fell into the Bags button, which bumps
  function lootFly(d) {
    const bag = els.nav && els.nav.querySelector('[data-nav="bags"]');
    if (!bag) return;
    const bump = () => { bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump'); };
    const items = (d.got || []).filter((it) => it && it.icon).slice(0, 3);
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!items.length || still || !document.body.animate) return bump();
    const from = ui.lastKill && Date.now() - ui.lastKill.at < 6000 ? ui.lastKill : (() => { const r = els.scene.getBoundingClientRect(); return { x: r.left + r.width * 0.72, y: r.top + r.height * 0.6 }; })();
    const br = bag.getBoundingClientRect(), tx = br.left + br.width / 2, ty = br.top + 16;
    items.forEach((it, i) => {
      const f = h('div', { class: 'lootfly q' + (it.q || 1) }, img(art('icon', it.icon)));
      document.body.append(f);
      const sx = from.x + (i - (items.length - 1) / 2) * 26, sy = from.y;
      const a = f.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(.4)`, opacity: 0 },
        { transform: `translate(${sx}px, ${sy - 30}px) scale(1.15)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${(sx + tx) / 2}px, ${Math.min(sy, ty) - 90}px) scale(1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty}px) scale(.45)`, opacity: 0.7 }], { duration: 850, delay: i * 140, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'both' });
      a.onfinish = () => { f.remove(); bump(); };
    });
  }
  function frame() {
    const S = G.S; if (!S || !els.pHp) return;
    const P = S.player;
    moneyTick(S);
    // low health in a fight: the screen edges glow red
    app.classList.toggle('lowhp', !!G.fight && v0hp(P));
    if (window.SND) window.SND.music(ui.csMusic ? ui.csMusic : S.run ? 'dungeon' : P.travel ? 'elwynn' : D.PLACES[P.place].safe ? 'town' : 'elwynn');
    const v = G.vitals();
    setBar(els.pHp, v.hp, v.maxHp);
    setBar(els.pRes, v.res, v.maxRes, v.resType === 'mana' ? null : `${Math.round(v.res)}`);
    const need = D.XP_TO_LEVEL[P.level] || 1;
    if (els.pXp) {
      const [rest, fill] = els.pXp.querySelectorAll('i');
      const cap = P.level >= D.LEVEL_CAP;
      fill.style.width = (cap ? 100 : (P.xp / need) * 100) + '%';
      rest.style.width = cap ? '0%' : Math.min(100, ((P.xp + P.rested) / need) * 100) + '%';
      const label = cap ? 'Max level' : `${Math.floor(P.xp).toLocaleString()} / ${need.toLocaleString()} XP · ${xpPct(P.xp, need)}%`;
      const b = els.pXp.querySelector('b'); if (b.textContent !== label) b.textContent = label;
      els.pXp.classList.toggle('rested', !cap && P.rested > 0);
    }
    const C = G.fight;
    // buffs
    if (els.pBuffs) {
      paintAuras(els.pBuffs, auraList(C && G.pUnit ? G.pUnit : null), 10);
    }
    // target
    if (C && G.pUnit) {
      const tid = ['priest', 'paladin', 'druid'].includes(G.pUnit.cls) && C.allyTarget != null ? C.allyTarget : G.pUnit.target;
      if (tid !== els.tUid) renderTarget();
      const t = C.units[tid];
      if (t && els.tHp) setBar(els.tHp, t.hp, t.maxHp, Math.round((t.hp / t.maxHp) * 100) + '%');
      if (t && els.tBuffs) paintAuras(els.tBuffs, auraList(t), 8);
      document.querySelectorAll('[data-au]').forEach((d) => { const u = C.units[d.dataset.au]; if (u) paintAuras(d, u.dead ? [] : auraList(u), 6); });
      if (els.tCp) {
        const n = G.pUnit.cls === 'rogue' && G.pUnit.cpTarget === G.pUnit.target ? G.pUnit.cp : -1;
        if (els.tCp.dataset.n != n) { els.tCp.dataset.n = n; els.tCp.innerHTML = n < 0 ? '' : [0, 1, 2, 3, 4].map((i) => `<i class="${i < n ? 'on' : ''}"></i>`).join(''); }
      }
      // nameplates & sprites
      for (const uid in ui.spriteEls) {
        const u = C.units[uid]; if (!u) continue;
        const el = ui.spriteEls[uid];
        const hp = el.querySelector('.hpb i');
        if (hp) hp.style.width = Math.max(0, (u.hp / u.maxHp) * 100) + '%';
        el.classList.toggle('casting', !!u.cast);
        const mk = el.querySelector('.np .mk'); if (mk) { const sym = MARK_SYM[u.mark] || ''; if (mk.textContent !== sym) mk.textContent = sym ? sym + ' ' : ''; }
        if (u.dead && !el.classList.contains('dead')) el.classList.add('dead');
      }
      document.querySelectorAll('[data-clock]').forEach((d) => { if (G.S.run) d.textContent = G.fmtClock(G.runClock()); });
      document.querySelectorAll('[data-mk]').forEach((d) => { const u = C.units[d.dataset.mk]; if (u) { const sym = MARK_SYM[u.mark] || '◎'; if (d.textContent !== sym) d.textContent = sym; } });
      document.querySelectorAll('[data-hp]').forEach((d) => { const u = C.units[d.dataset.hp]; if (u) d.textContent = u.dead ? '' : Math.round((u.hp / u.maxHp) * 100) + '%'; });
      document.querySelectorAll('[data-pf]').forEach((d) => { const u = C.units[d.dataset.pf]; if (u) setBar(d, u.hp, u.maxHp, Math.round(u.hp)); });
      // cast bar
      const cast = G.pUnit.cast;
      if (cast) {
        els.cast.hidden = false;
        const ab = D.ABILITIES[cast.ab];
        const pct = Math.min(1, (C.t - cast.start) / (cast.end - cast.start));
        els.cast.classList.toggle('channel', !!cast.channel);
        els.cast.querySelector('i').style.width = (cast.channel ? (1 - pct) : pct) * 100 + '%';
        els.cast.querySelector('b').textContent = ab.name;
      } else els.cast.hidden = true;
    } else if (els.cast) {
      const c = P.casting;
      if (c) {
        els.cast.hidden = false;
        els.cast.querySelector('i').style.width = Math.min(100, ((now() - c.start) / (c.end - c.start)) * 100) + '%';
        els.cast.querySelector('b').textContent = c.label;
      } else if (P.eating || P.drinking) {
        els.cast.hidden = false;
        const e = P.eating || P.drinking;
        els.cast.classList.add('channel');
        els.cast.querySelector('i').style.width = Math.max(0, ((e.until - now()) / 18000) * 100) + '%';
        els.cast.querySelector('b').textContent = P.eating && P.drinking ? 'Eating and drinking' : P.eating ? 'Eating' : 'Drinking';
      } else els.cast.hidden = true;
      if (S.run) document.querySelectorAll('[data-pf]').forEach((d) => { d.style.opacity = '.9'; });
    }
    // party frames at rest
    if (!C && S.run && S.group) {
      const rows = document.querySelectorAll('.pfr .bar');
      const chars = [P].concat(S.group.members);
      rows.forEach((bar, i) => {
        const ch = chars[i]; if (!ch) return;
        const st = E.statsFor(ch, ch === P ? null : null);
        const hp = ch.hp == null ? st.maxHp : ch.hp;
        setBar(bar, hp, st.maxHp, Math.round(hp));
      });
    }
    // action bar cooldowns
    if (els.abs) {
      for (const id in els.abs) {
        const btn = els.abs[id];
        let p = 1, left = 0, nores = false, on = false;
        if (id === 'potion') { const lp = ((P.potionAt || 0) - now()) / 1000; if (lp > 0) { p = 1 - lp / 120; left = lp; } }
        else if (C && G.pUnit && id !== 'eat' && id !== 'drink') {
          const u = G.pUnit, ab = D.ABILITIES[id];
          if (id === 'attack') on = u.auto;
          else {
            const cdEnd = u.cds[id] || 0;
            if (cdEnd > C.t) { p = 1 - (cdEnd - C.t) / ab.cd; left = cdEnd - C.t; }
            else if (ab.gcd !== false && u.gcdUntil > C.t) p = 1 - (u.gcdUntil - C.t) / (ab.gcdLen || 1.5);
            nores = E.abCost(ab, u) > u.res + 0.01;
          }
        } else if (id !== 'eat' && id !== 'drink' && id !== 'attack' && id !== 'potion') {
          nores = E.abCost(D.ABILITIES[id], P) > v.res + 0.01 && D.ABILITIES[id].target !== 'enemy';
        }
        // a shine sweeps the button the moment a real cooldown (not the global one) ends
        if (left > 0) btn._cd = true; else if (btn._cd) { btn._cd = false; btn.classList.remove('ready'); void btn.offsetWidth; btn.classList.add('ready'); setTimeout(() => btn.classList.remove('ready'), 700); }
        btn.querySelector('.cd').style.setProperty('--p', p);
        btn.querySelector('.cdt').textContent = left > 1.5 ? Math.ceil(left) : '';
        btn.classList.toggle('nores', nores);
        btn.classList.toggle('on', on);
      }
    }
    // timers in panel & scene
    const tb = document.getElementById('travelbar');
    if (tb && P.travel) tb.querySelector('i').style.width = Math.min(100, ((now() - P.travel.start) / (P.travel.end - P.travel.start)) * 100) + '%';
    const gt = document.getElementById('ghost-t');
    if (gt && P.ghostUntil) gt.textContent = `Running back to your body... ${Math.ceil((P.ghostUntil - now()) / 1000)}s`;
    const qt = document.getElementById('q-time');
    if (qt && S.queue) qt.textContent = `Waiting ${fmtTime(now() - S.queue.since)} · as ${G.role() === 'tank' ? 'Tank' : G.role() === 'healer' ? 'Healer' : 'Damage'}`;
    const on = document.getElementById('online');
    if (on && !on.dataset.t || on && now() - on.dataset.t > 10000) { on.dataset.t = now(); on.textContent = `${B.onlineCount(S, new Date())} online`; }
    // roll timers
    if (ui.rollEl) ui.rollEl.querySelectorAll('[data-roll]').forEach((b) => { const r = S.run && S.run.rolls[b.dataset.roll]; if (r) b.style.width = Math.max(0, (r.until - now()) / 25000 * 100) + '%'; });
  }

  // ============================================================ nav
  function renderNav() {
    els.nav.innerHTML = '';
    const items = [['map', 'Map', 'hearthstone', openMap], ['quests', 'Quests', 'chest_box', openQuests], ['bags', 'Bags', 'coin', openBags], ['hero', 'Hero', 'sword', openHero], ['social', 'Social', 'bread', () => openSocial('group')]];
    for (const [k, label, icon, fn] of items) els.nav.append(h('button', { 'data-nav': k, onclick: fn }, img(art('icon', icon)), label));
  }
  function renderNavDots() {
    const q = Object.keys(G.S.player.quests).some((id) => G.questState(id) === 'complete');
    const b = els.nav.querySelector('[data-nav="quests"]'); if (b) b.classList.toggle('dot', q);
    const s = els.nav.querySelector('[data-nav="social"]'); if (s) s.classList.toggle('dot', !!(G.S.queue && G.S.queue.popped));
    const hb = els.nav.querySelector('[data-nav="hero"]'); if (hb) hb.classList.toggle('dot', G.talentPoints(G.S.player).free > 0 || loreUnread() > 0);
    loreNotice();
  }

  // ============================================================ sheets / dialogs
  // A sheet opened from another sheet (Lore Journal or Talents from Hero, say) gets a Back button that reopens the one
  // before it, where it was. ui.sheetStack holds the way back; closing with × clears it.
  function openSheet(name, title, sub, fill, fromBack) {
    const prev = ui.sheet && ui.sheetDef && ui.sheet !== name ? Object.assign({}, ui.sheetDef, { scroll: ui.sheetBody ? ui.sheetBody.scrollTop : 0 }) : null;
    const stack = fromBack ? ui.sheetStack || [] : prev ? (ui.sheetStack || []).concat([prev]) : ui.sheet === name ? ui.sheetStack || [] : [];
    closeSheet();
    ui.sheetStack = stack;
    if (window.SND) window.SND.play('click', { vol: 0.6 });
    const body = h('div', { class: 'sheet-b' });
    const titleEl = h('h2', null, title, sub ? h('small', null, sub) : null);
    const backBtn = stack.length ? h('button', { class: 'sheet-backbtn', 'aria-label': 'Back', onclick: () => { const d = ui.sheetStack.pop(); openSheet(d.name, d.title, d.sub, d.fill, true); ui.sheetBody.scrollTop = d.scroll || 0; } }, '‹ Back') : null;
    const sheet = h('div', { class: 'sheet sheet-' + name, onclick: (e) => e.stopPropagation() }, h('div', { class: 'sheet-h' }, backBtn, titleEl, h('button', { class: 'x', onclick: closeSheet, 'aria-label': 'Close' }, '×')), body);
    const back = h('div', { class: 'sheet-back', onclick: closeSheet }, sheet);
    app.append(back);
    ui.sheet = name; ui.sheetEl = back; ui.sheetBody = body; ui.sheetTitle = titleEl; ui.sheetDef = { name, title, sub, fill };
    ui.sheetFn = () => { const s = body.scrollTop; body.innerHTML = ''; fill(body, titleEl); body.scrollTop = s; };
    ui.sheetFn();
  }
  function closeSheet() { if (ui.sheetEl) ui.sheetEl.remove(); ui.sheet = null; ui.sheetFn = null; ui.sheetEl = null; ui.sheetDef = null; ui.sheetStack = []; }
  function showDialog(content, dismissable) {
    closeDialog();
    const d = h('div', { class: 'dialog', onclick: () => { if (dismissable) closeDialog(); } }, h('div', { class: 'card', onclick: (e) => e.stopPropagation() }, content));
    app.append(d); ui.dialog = d;
  }
  function closeDialog() { if (ui.dialog) ui.dialog.remove(); ui.dialog = null; if (ui.updPending) { const r = ui.updPending; setTimeout(() => { if (!ui.dialog && ui.updPending === r) offerUpdate(r); }, 600); } }

  // ---------- item tooltip
  const statName = { str: 'Strength', agi: 'Agility', sta: 'Stamina', int: 'Intellect', spi: 'Spirit' };
  function itemTip(it, extra) {
    const P = G.S.player;
    const t = h('div', { class: 'tooltip' });
    t.append(h('div', { class: 'nm q' + it.q }, it.name));
    const why = blockReason(it);
    if (why) t.append(h('div', { class: 'red', style: { fontWeight: 800 } }, why.text));
    if (it.slot === 'quest') t.append(h('div', { class: 'st' }, 'Quest Item'));
    if (D.GEAR_SLOTS.includes(it.slot)) {
      const type = it.slot === 'weapon' ? { sword: 'Sword', axe: 'Axe', mace: 'Mace', dagger: 'Dagger', staff: 'Staff' }[it.wtype] : it.atype ? it.atype[0].toUpperCase() + it.atype.slice(1) : '';
      t.append(h('div', { class: 'flex st' }, h('span', null, D.SLOT_LABEL[it.slot]), h('span', { class: G.canUseItem(it) ? '' : 'red' }, type)));
      if (it.dmg) {
        t.append(h('div', { class: 'flex st' }, h('span', null, `${it.dmg[0]} - ${it.dmg[1]} Damage`), h('span', null, `Speed ${it.speed.toFixed(2)}`)));
        t.append(h('div', { class: 'st' }, `(${((it.dmg[0] + it.dmg[1]) / 2 / it.speed).toFixed(1)} damage per second)`));
      }
      if (it.armor) t.append(h('div', { class: 'st' }, `${it.armor} Armor`));
      for (const k in (it.stats || {})) t.append(h('div', { class: 'st' }, `+${it.stats[k]} ${statName[k] || k}`));
      if (it.sp) t.append(h('div', { class: 'gr' }, `Equip: Increases damage and healing done by magical spells and effects by up to ${it.sp}.`));
      if (it.lvl > 1) t.append(h('div', { class: it.lvl > P.level ? 'red' : 'st' }, `Requires Level ${it.lvl}`));
    }
    if (it.slot === 'mat') t.append(h('div', { class: 'st' }, 'Trade Goods'));
    if (it.heal || it.mana) t.append(h('div', { class: 'gr' }, `Use: Restores ${it.heal ? it.heal[0] + ' to ' + it.heal[1] + ' health' : it.mana[0] + ' to ' + it.mana[1] + ' mana'}. Works in combat. 2 min cooldown shared by all potions.`));
    if (it.buff) t.append(h('div', { class: 'gr' }, `Use: ${Object.entries(it.buff).map(([k, v]) => `+${v} ${statName[k] || k}`).join(', ')} for 1 hour. One elixir at a time.`));
    if (it.wdmg) t.append(h('div', { class: 'gr' }, `Use: Your weapon deals +${it.wdmg} damage for 30 min.`));
    if (it.slot === 'kit') t.append(h('div', { class: 'gr' }, `Use: Permanently adds ${it.kit} armor to your chest, legs, feet or hands gear (the first one without a kit this good).`));
    if (it.bag) t.append(h('div', { class: 'gr' }, `${it.bag} Slot Bag. Use: equip it to carry ${it.bag} more items (up to ${D.BAG_SLOTS} bags).`));
    if (it.teaches) { const r = D.RECIPES[it.teaches], mk = D.ITEMS[r.makes]; t.append(h('div', { class: 'gr' }, `Use: Teaches you how to make ${mk.name}. Requires ${D.PROFESSIONS[r.prof].name} (${r.sk[0]}).`)); }
    if (it.kit && D.GEAR_SLOTS.includes(it.slot)) t.append(h('div', { class: 'gr' }, `Armor kit: +${it.kit} armor`));
    if (it.crafter) t.append(h('div', { class: 'dim' }, `<Made by ${it.crafter}>`));
    if (it.restore) t.append(h('div', { class: 'gr' }, `Use: Restores ${it.restore} ${it.slot === 'food' ? 'health' : 'mana'} over 18 sec. Must remain seated while ${it.slot === 'food' ? 'eating' : 'drinking'}.`));
    if (it.desc) t.append(h('div', { class: 'gr' }, it.desc));
    const base = D.ITEMS[it.id] || {};
    const setId = it.set || base.set;
    if (setId) {
      const SET = D.SETS[setId];
      const worn = Object.values(P.equip).filter((e) => e && (e.set || (D.ITEMS[e.id] || {}).set) === setId).length;
      t.append(h('div', { style: { color: '#ffd100' } }, `${SET.name} (${worn}/${SET.pieces})`), h('div', { class: worn >= SET.mask ? 'gr' : 'dim' }, `(${SET.mask}) Set: you wear the Defias mask.`));
    }
    if (it.look || base.look) t.append(h('div', { style: { color: '#ff80ff' } }, 'Appearance: shows on your character'));
    if (it.source || base.source) t.append(h('div', { class: 'dim' }, (/^Quest/.test(it.source || base.source) ? '' : 'Drops from ') + (it.source || base.source)));
    if (it.sell && !it.noSell && it.slot !== 'quest') t.append(h('div', { class: 'dim', html: 'Sell Price: ' + moneyHtml(it.sell) }));
    const cmp = compareBlock(it);
    if (cmp) t.append(cmp);
    if (extra) t.append(extra);
    return t;
  }
  // Stat-by-stat difference against what's in that slot now.
  function compareBlock(it) {
    const P = G.S.player;
    if (!D.GEAR_SLOTS.includes(it.slot)) return null;
    const cur = P.equip[it.slot];
    if (cur === it) return null;
    const box = h('div', { style: { marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #3a3a50', display: 'grid', gap: '1px' } });
    if (!G.canUseItem(it)) { box.append(h('div', { class: 'red' }, `Your class can't use this.`)); return box; }
    const val = (x, k) => {
      if (!x) return 0;
      if (k === 'dps') return x.dmg ? (x.dmg[0] + x.dmg[1]) / 2 / x.speed : 0;
      if (k === 'armor') return x.armor || 0;
      if (k === 'sp') return x.sp || 0;
      return (x.stats && x.stats[k]) || 0;
    };
    const rows = [['dps', 'Damage per second', 1], ['armor', 'Armor', 0], ['str', 'Strength', 0], ['agi', 'Agility', 0], ['sta', 'Stamina', 0], ['int', 'Intellect', 0], ['spi', 'Spirit', 0], ['sp', 'Spell power', 0]];
    box.append(h('div', { class: 'dim' }, cur ? `Compared to your ${cur.name}:` : `Your ${D.SLOT_LABEL[it.slot]} slot is empty.`));
    let any = false;
    for (const [k, label, dp] of rows) {
      const d = val(it, k) - val(cur, k);
      if (Math.abs(d) < 0.05) continue;
      any = true;
      box.append(h('div', { class: d > 0 ? 'gr' : 'red' }, `${d > 0 ? '+' : ''}${d.toFixed(dp)} ${label}`));
    }
    if (!any && cur) box.append(h('div', { class: 'dim' }, 'Same stats.'));
    const up = G.itemScore(it, P.cls) - G.itemScore(cur, P.cls);
    box.append(h('div', { style: { fontWeight: 800, color: up > 0.01 ? '#2dff2d' : up < -0.01 ? '#ff5b4b' : '#b0b0b0' } }, up > 0.01 ? '▲ Upgrade for you' : up < -0.01 ? '▼ Downgrade for you' : 'About the same for you'));
    if ((it.lvl || 1) > P.level) box.append(h('div', { class: 'red' }, `You can equip it at level ${it.lvl}.`));
    return box;
  }
  function blockReason(it) {
    const P = G.S.player;
    if (!D.GEAR_SLOTS.includes(it.slot)) return null;
    if (!G.canUseItem(it)) {
      const what = it.slot === 'weapon' || it.slot === 'ranged' ? ({ sword: 'Swords', axe: 'Axes', mace: 'Maces', dagger: 'Daggers', staff: 'Staves', bow: 'Bows' }[it.wtype] || 'this') : it.atype ? it.atype[0].toUpperCase() + it.atype.slice(1) : 'this';
      return { kind: 'class', text: `${D.CLASSES[P.cls].name}s can't use ${what}` };
    }
    if ((it.lvl || 1) > P.level) return { kind: 'level', text: `Requires level ${it.lvl}`, lvl: it.lvl };
    return null;
  }
  // Icon wrapper that tints unusable gear red, with a level number or a cross.
  function itemIcon(it, cls) {
    const why = blockReason(it);
    return h('div', { class: (cls || 'ic') + (why ? ' cant' : '') }, img(art('icon', it.icon)), why ? h('span', { class: 'why' }, why.kind === 'level' ? String(why.lvl) : '✕') : null);
  }
  // Short tag for lists: ▲ upgrade, or why you can't use it.
  function gearTag(it) {
    const P = G.S.player;
    if (!D.GEAR_SLOTS.includes(it.slot)) return null;
    if (!G.canUseItem(it)) return h('span', { style: { color: '#ff5b4b', fontWeight: 700, marginLeft: '6px' } }, "Can't use");
    if ((it.lvl || 1) > P.level) return h('span', { style: { color: '#ff5b4b', fontWeight: 700, marginLeft: '6px' } }, `Level ${it.lvl}`);
    if (G.isUpgrade(it)) return h('span', { style: { color: '#2dff2d', fontWeight: 900, marginLeft: '6px' } }, '▲ Upgrade');
    return null;
  }

  // ---------- map
  const MAPS = {
    elwynn: { stormwind_bank: [58, 20], stormwind: [95, 40], stormwind_gate: [135, 130], northshire_vineyards: [120, 60], northshire_abbey: [215, 88], echo_ridge: [300, 52], goldshire: [150, 228], fargodeep: [110, 330], brackwell: [215, 352], crystal_lake: [270, 250], forests_edge: [42, 300] },
    mulgore: { thunder_bluff: [110, 70], bloodhoof_village: [175, 205], camp_narache: [220, 340], brambleblade_ravine: [300, 300], palemane_rock: [70, 250], venture_mine: [290, 120], golden_plains: [180, 110] },
    tirisfal: { scarlet_monastery_gate: [310, 40], undercity: [285, 110], brill: [200, 180], deathknell: [60, 300], night_web_hollow: [40, 225], agamand_mills: [150, 90], garrens_haunt: [210, 60], scarlet_watch_post: [300, 250] },
    durotar: { orgrimmar: [150, 52], thunder_ridge: [80, 130], razor_hill: [200, 215], tiragarde_keep: [292, 185], echo_isles: [268, 325], valley_of_trials: [140, 300], burning_blade_coven: [62, 336] },
    teldrassil: { darnassus: [60, 110], dolanaar: [190, 200], shadowglen: [280, 90], shadowthread_cave: [312, 36], lake_alameth: [205, 318], banethil_barrow: [300, 250], fel_rock: [110, 290] },
    westfall: { furlbrow_farm: [250, 60], saldean_farm: [170, 110], sentinel_hill: [190, 225], jangolode_mine: [70, 150], molsen_farm: [260, 300], the_longshore: [50, 320], dagger_hills: [150, 355], gold_coast_quarry: [42, 92], moonbrook: [205, 285], the_dead_acre: [298, 362] },
    barrens: { far_watch: [290, 90], crossroads: [175, 175], forgotten_pools: [90, 150], stagnant_oasis: [230, 290], razormane_grounds: [270, 205], thorn_hill: [110, 330], sludge_fen: [215, 62], lushwater_oasis: [155, 262], baeldun_digsite: [52, 368] },
    redridge: { three_corners: [40, 300], lakeshire: [140, 205], lake_everstill: [195, 262], redridge_canyons: [70, 120], althers_mill: [160, 92], renders_valley: [262, 335], stonewatch_keep: [285, 205], galardell_valley: [272, 80] },
    tanaris: { gadgetzan: [170, 80], waterspring_field: [250, 150], thistleshrub_valley: [60, 200], lost_rigger_cove: [45, 360], noxious_lair: [285, 60], eastmoon_ruins: [260, 260], dunemaul_compound: [210, 340], zul_farrak_gate: [80, 90] },
    ungoro: { marshals_refuge: [240, 60], the_slithering_scar: [300, 150], golakka_hot_springs: [70, 150], fire_plume_ridge: [170, 190], terror_run: [270, 250], lakkari_tar_pits: [200, 320], the_marshlands: [70, 300] },
    steppes: { blackrock_mountain: [50, 170], terror_wing_path: [90, 60], flame_crest: [220, 60], blackrock_stronghold: [160, 150], dreadmaul_rock: [270, 190], ruins_of_thaurissan: [120, 280], morgans_vigil: [280, 310] },
    plaguelands: { hearthglen: [190, 60], stratholme_gate: [305, 45], the_bulwark: [40, 200], felstone_field: [110, 220], dalson_tears: [190, 170], andorhal: [180, 290], the_writhing_haunt: [270, 290], chillwind_camp: [100, 340], caer_darrow: [250, 360] },
    winterspring: { everlook: [230, 200], frostsaber_rock: [140, 150], ice_thistle_hills: [60, 90], lake_keltheril: [150, 250], winterfall_village: [280, 110], frostwhisper_gorge: [280, 300], mazthoril: [200, 340] },
    tidewatch: { brightwater_landing: [60, 330], saltmarsh_shallows: [60, 220], kelpwood: [120, 110], drowned_orchards: [180, 290], archive_steps: [290, 330], sael_anor_outskirts: [240, 170] },
    skullreef: { bloodtide_landing: [280, 330], coralbone_beach: [290, 220], screaming_grotto: [230, 110], sunken_pier: [160, 300], loas_rest: [110, 180], temple_steps: [50, 290] },
    stormveil: { drowned_causeway: [170, 260], tidecrown_gate: [170, 110] },
    feralas: { feathermoon_stronghold: [45, 170], camp_mojache: [270, 170], frayfeather_highlands: [150, 90], woodpaw_hills: [230, 80], gordunni_outpost: [180, 260], the_forgotten_coast: [60, 300], lower_wilds: [300, 290], maraudon_gate: [240, 20] },
    arathi: { silverleaf_lodge: [60, 250], refuge_pointe: [170, 180], hammerfall: [300, 150], highland_plains: [110, 200], drywhisker_gorge: [290, 250], witherbark_village: [70, 310], stromgarde_keep: [120, 300], boulderfist_hall: [285, 340], circle_of_west_binding: [160, 90] },
    stranglethorn: { rebel_camp: [170, 45], grom_gol: [40, 250], nesingwary_camp: [150, 150], lake_nazferiti: [235, 185], zuuldaia_ruins: [55, 150], kurzen_compound: [285, 90], venture_base_camp: [270, 285], balia_mah_ruins: [120, 330], zul_kunda: [205, 365] },
    wetlands: { menethil_harbor: [60, 250], bluegill_marsh: [70, 130], whelgars_excavation: [170, 300], saltspray_glen: [140, 60], dun_modr: [230, 160], angerfang_encampment: [295, 280] },
    ashenvale: { astranaar: [110, 190], splintertree_post: [290, 185], the_zoram_strand: [30, 150], mystral_lake: [180, 270], thistlefur_village: [120, 70], the_howling_vale: [205, 118], satyrnaar: [292, 70], felfire_hill: [305, 300] },
    duskwood: { darkshire: [170, 200], brightwood_grove: [90, 130], raven_hill_cemetery: [45, 245], the_hushed_bank: [250, 110], vulgol_ogre_mound: [285, 250], tranquil_gardens: [215, 300], the_rotting_orchard: [150, 365] },
    hillsbrad: { tarren_mill: [220, 110], hillsbrad_fields: [160, 220], azurelode_mine: [85, 300], durnholde_keep: [265, 290], alterac_foothills: [210, 40], growless_cave: [110, 60], pyrewood_village: [40, 150] },
    stonetalon: { malakajin: [250, 362], webwinder_path: [205, 285], grimtotem_post: [300, 290], sun_rock_retreat: [160, 200], charred_vale: [55, 235], windshear_crag: [265, 150], cragpool_lake: [215, 60], mirkfallon_lake: [110, 100] },
    dunmorogh: { ironforge: [170, 70], kharanos: [175, 210], grizzled_den: [190, 325], frostmane_hold: [62, 165], amberstill_ranch: [292, 205], anvilmar: [78, 330], coldridge_cave: [34, 262] },
  };
  const MAP_BG = {
    tanaris: `<defs><radialGradient id="maptn" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#e0c070"/><stop offset="1" stop-color="#9a7a3a"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#maptn)"/>
        <path d="M0 330 C40 320 60 380 40 400 H0Z" fill="#3a7a9a" opacity=".8"/>
        <text x="170" y="390" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#4a3010" opacity=".85">Tanaris · contested</text>`,
    ungoro: `<defs><radialGradient id="mapug" cx="50%" cy="48%" r="72%"><stop offset="0" stop-color="#5a8a3a"/><stop offset="1" stop-color="#23401c"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapug)"/>
        <path d="M0 0 H340 V400 H0Z M170 30 C300 30 330 200 300 330 C250 400 90 400 40 330 C10 200 40 30 170 30Z" fill="#5a4a36" fill-rule="evenodd" opacity=".75"/>
        <path d="M150 170 L170 140 L190 170 Z" fill="#c0502a" opacity=".85"/>
        <text x="170" y="392" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f0e8d0" opacity=".85">Un'Goro Crater · contested</text>`,
    steppes: `<defs><radialGradient id="mapbs" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#6a3a28"/><stop offset="1" stop-color="#2a1610"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapbs)"/>
        <path d="M0 110 L60 90 L100 140 L70 230 L0 240Z" fill="#1a1210" opacity=".8"/>
        <path d="M130 200 C170 220 200 240 250 230" stroke="#e06a20" stroke-width="3" fill="none" opacity=".6"/>
        <text x="170" y="392" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f8d0a0" opacity=".85">Burning Steppes · contested</text>`,
    plaguelands: `<defs><radialGradient id="mapwp" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#7a7a4a"/><stop offset="1" stop-color="#3a3a24"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapwp)"/>
        <ellipse cx="250" cy="372" rx="70" ry="22" fill="#3a5a6a" opacity=".85"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e8e8c8" opacity=".85">Western Plaguelands · contested</text>`,
    winterspring: `<defs><radialGradient id="mapwsp" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#e8f0f8"/><stop offset="1" stop-color="#9aaec4"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapwsp)"/>
        <ellipse cx="150" cy="255" rx="50" ry="24" fill="#8ab4d0" opacity=".8"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#2a3a50" opacity=".85">Winterspring · contested</text>`,
    tidewatch: `<defs><radialGradient id="maptw" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#5a9a7a"/><stop offset="1" stop-color="#244a40"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="#2a5a7a"/>
        <path d="M20 380 C0 250 30 90 110 60 C200 30 300 90 320 200 C330 300 300 370 240 390 Z" fill="url(#maptw)"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e8f4f0" opacity=".85">Tidewatch Coast · Alliance</text>`,
    skullreef: `<defs><radialGradient id="mapsr" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#8a9a5a"/><stop offset="1" stop-color="#3a4a2a"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="#2a5a7a"/>
        <path d="M30 330 C20 240 60 150 120 140 C140 80 220 70 260 110 C320 150 330 260 310 340 C280 390 90 390 30 330 Z" fill="url(#mapsr)"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f0f0d8" opacity=".85">Skullreef Isles · Horde</text>`,
    stormveil: `<defs><radialGradient id="mapsv" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#3a6a8a"/><stop offset="1" stop-color="#10283a"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapsv)"/>
        <path d="M160 400 L160 130 L180 130 L180 400 Z" fill="#6a7a80" opacity=".8"/>
        <text x="170" y="390" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#d8ecf4" opacity=".85">The Stormveil Reach · contested</text>`,
    feralas: `<defs><radialGradient id="mapfr" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3a6a3a"/><stop offset="1" stop-color="#1c341c"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapfr)"/>
        <path d="M0 0 H30 C20 150 40 260 20 400 H0Z" fill="#3d5f7a" opacity=".85"/>
        <text x="170" y="390" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e8f0e0" opacity=".85">Feralas · contested</text>`,
    arathi: `<defs><radialGradient id="mapah" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#8a9a52"/><stop offset="1" stop-color="#4a5a2c"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapah)"/>
        <path d="M0 0 H20 V400 H0Z" fill="#5a5a50" opacity=".6"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f8f4e0" opacity=".85">Arathi Highlands · contested</text>`,
    stranglethorn: `<defs><radialGradient id="mapv" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3f6a2c"/><stop offset="1" stop-color="#1c3314"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapv)"/>
        <path d="M0 0 H24 C14 120 34 260 16 400 H0Z" fill="#2f6a8a" opacity=".85"/>
        <ellipse cx="235" cy="185" rx="36" ry="22" fill="#3d7a8a" opacity=".7"/>
        <text x="170" y="390" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f0f8e0" opacity=".85">Stranglethorn Vale · contested</text>`,
    wetlands: `<defs><radialGradient id="mapl" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#5a6a4a"/><stop offset="1" stop-color="#2c3424"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapl)"/>
        <path d="M0 0 H30 C20 120 40 220 20 400 H0Z" fill="#3d5f7a" opacity=".85"/>
        <ellipse cx="80" cy="140" rx="40" ry="28" fill="#3a5a4a" opacity=".6"/>
        <path d="M340 180 C300 200 290 240 320 300 L340 300Z" fill="#23261f" opacity=".7"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#eef0e0" opacity=".85">Wetlands</text>`,
    ashenvale: `<defs><radialGradient id="mapa" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3a4f5a"/><stop offset="1" stop-color="#1c2430"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapa)"/>
        <path d="M0 0 H22 C12 120 30 220 14 400 H0Z" fill="#2f5f7f" opacity=".85"/>
        <ellipse cx="110" cy="195" rx="34" ry="22" fill="#3d6f9a" opacity=".6"/><ellipse cx="180" cy="275" rx="30" ry="16" fill="#3d6f9a" opacity=".7"/>
        <ellipse cx="305" cy="300" rx="26" ry="20" fill="#3a6a2a" opacity=".5"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e8e0f8" opacity=".85">Ashenvale · contested</text>`,
    duskwood: `<defs><radialGradient id="mapd" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2e3a4a"/><stop offset="1" stop-color="#12161e"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapd)"/>
        <circle cx="300" cy="40" r="18" fill="#d8dde8" opacity=".5"/>
        <path d="M250 110 C230 160 250 200 285 250" stroke="#2a4a6a" stroke-width="10" fill="none" opacity=".7"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#dfe6f2" opacity=".85">Duskwood</text>`,
    hillsbrad: `<defs><radialGradient id="maph" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#5e8a4a"/><stop offset="1" stop-color="#2e4a26"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#maph)"/>
        <path d="M0 0 H340 V70 C260 50 180 80 100 50 C60 40 20 60 0 50Z" fill="#e8eef2" opacity=".55"/>
        <path d="M0 110 C20 140 30 160 40 150 L0 200Z" fill="#23301e" opacity=".8"/>
        <text x="170" y="390" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#f0f4e0" opacity=".85">Hillsbrad Foothills</text>`,
    redridge: `<defs><radialGradient id="mapr" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#a0643a"/><stop offset="1" stop-color="#5a3420"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapr)"/>
        <path d="M120 230 C160 215 220 240 250 262 C230 292 175 300 140 280 C120 265 110 245 120 230Z" fill="#3d6fa0" opacity=".85"/>
        <path d="M0 330 C40 320 60 300 40 300 C80 270 110 230 140 205 C200 200 240 200 285 205" stroke="#7a4a2a" stroke-width="8" fill="none" opacity=".45"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#ffe8cc" opacity=".85">Redridge Mountains</text>`,
    stonetalon: `<defs><radialGradient id="maps" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#6a6878"/><stop offset="1" stop-color="#34323e"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#maps)"/>
        <ellipse cx="110" cy="100" rx="30" ry="16" fill="#3d6f8a" opacity=".85"/><ellipse cx="215" cy="60" rx="26" ry="13" fill="#3d6f8a" opacity=".85"/>
        <ellipse cx="55" cy="235" rx="40" ry="30" fill="#1c1a1e" opacity=".55"/>
        <path d="M250 400 C250 370 230 320 205 285 C190 250 175 225 160 200" stroke="#8a7a6a" stroke-width="8" fill="none" opacity=".4"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e8e0f0" opacity=".85">Stonetalon Mountains</text>`,
    westfall: `<defs><radialGradient id="mapw" cx="55%" cy="45%" r="75%"><stop offset="0" stop-color="#b89a52"/><stop offset="1" stop-color="#6a5528"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapw)"/>
        <path d="M0 0 H40 C30 100 60 180 30 260 C20 320 40 360 20 400 H0Z" fill="#4a7a9a" opacity=".85"/>
        <path d="M250 60 C220 90 190 100 170 110 C180 160 185 200 190 225 C220 260 240 280 260 300" stroke="#8a6a3a" stroke-width="8" fill="none" opacity=".45"/>
        <text x="190" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#fff0cc" opacity=".85">Westfall</text>`,
    barrens: `<defs><radialGradient id="mapb" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#c8b070"/><stop offset="1" stop-color="#7a6534"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapb)"/>
        <ellipse cx="90" cy="150" rx="26" ry="14" fill="#4f8a8a" opacity=".75"/><ellipse cx="230" cy="290" rx="28" ry="15" fill="#5f7a3a" opacity=".75"/>
        <path d="M290 90 C250 120 210 150 175 175 C150 230 160 300 170 400 M175 175 C120 170 60 180 0 190" stroke="#8a6a3a" stroke-width="8" fill="none" opacity=".45"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#fff0cc" opacity=".85">The Barrens</text>`,
    elwynn: `<defs><radialGradient id="mapg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#3f5a26"/><stop offset="1" stop-color="#1f2c13"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapg)"/>
        <path d="M0 0 H340 V30 C250 40 180 20 90 34 C50 40 20 30 0 38Z" fill="#6f7d86" opacity=".55"/>
        <ellipse cx="292" cy="266" rx="30" ry="18" fill="#3d7fa8" opacity=".85"/>
        <path d="M150 0 C140 60 170 90 158 150 C150 200 150 230 140 400" stroke="#8a7650" stroke-width="10" fill="none" opacity=".35"/>
        <text x="170" y="22" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e5d8b8" opacity=".8">Northshire Valley</text>
        <text x="300" y="390" text-anchor="end" font-family="Marcellus SC, serif" font-size="12" fill="#e5d8b8" opacity=".8">Elwynn Forest</text>`,
    mulgore: `<defs><radialGradient id="mapm" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#b7b45a"/><stop offset="1" stop-color="#5c6b2c"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapm)"/>
        <path d="M0 0 H340 V30 C250 50 150 20 60 40 L0 50Z" fill="#8a6a45" opacity=".7"/>
        <ellipse cx="110" cy="70" rx="40" ry="22" fill="#9c7a4c" opacity=".7"/>
        <path d="M220 340 C200 290 185 250 175 205 C178 160 180 130 180 110" stroke="#e8d9a0" stroke-width="8" fill="none" opacity=".4"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#fff4d0" opacity=".85">Mulgore</text>`,
    tirisfal: `<defs><radialGradient id="mapx" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#5d6a58"/><stop offset="1" stop-color="#262d26"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapx)"/>
        <path d="M0 0 H340 V26 C240 40 120 18 0 36Z" fill="#40576a" opacity=".8"/>
        <path d="M60 300 C110 250 160 210 200 180 C240 150 265 130 285 110" stroke="#b8c4a8" stroke-width="8" fill="none" opacity=".3"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e2ecd8" opacity=".85">Tirisfal Glades</text>`,
    durotar: `<defs><radialGradient id="mapo" cx="45%" cy="45%" r="75%"><stop offset="0" stop-color="#b8653a"/><stop offset="1" stop-color="#5e2a14"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapo)"/>
        <path d="M300 0 C280 100 320 160 290 240 C270 300 300 350 280 400 H340 V0Z" fill="#3a78a8" opacity=".8"/>
        <ellipse cx="268" cy="330" rx="26" ry="16" fill="#c9a36a" opacity=".6"/>
        <path d="M150 52 C170 120 190 170 200 215 C180 250 160 280 140 300" stroke="#e0b07a" stroke-width="8" fill="none" opacity=".35"/>
        <text x="150" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#ffe6c8" opacity=".85">Durotar</text>
        <text x="20" y="390" font-family="Marcellus SC, serif" font-size="12" fill="#ffe6c8" opacity=".85">Valley of Trials</text>`,
    teldrassil: `<defs><radialGradient id="mapt" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#3a3f6a"/><stop offset="1" stop-color="#161733"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapt)"/>
        <ellipse cx="205" cy="330" rx="46" ry="26" fill="#5d7fc4" opacity=".7"/>
        <circle cx="280" cy="90" r="34" fill="#5a4a7a" opacity=".6"/>
        <path d="M60 110 C120 150 150 190 190 200 C230 190 260 140 280 90" stroke="#b9a7e6" stroke-width="8" fill="none" opacity=".25"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#e6e0ff" opacity=".8">Teldrassil</text>
        <text x="320" y="390" text-anchor="end" font-family="Marcellus SC, serif" font-size="12" fill="#e6e0ff" opacity=".8">Shadowglen</text>`,
    dunmorogh: `<defs><radialGradient id="mapd" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#cfd8df"/><stop offset="1" stop-color="#6f7c88"/></radialGradient></defs>
        <rect width="340" height="400" rx="6" fill="url(#mapd)"/>
        <path d="M0 0 H340 V40 C260 60 220 30 170 44 C110 60 60 30 0 50Z" fill="#8c97a2" opacity=".8"/>
        <path d="M0 360 C60 340 120 380 180 370 C240 360 300 390 340 372 V400 H0Z" fill="#8c97a2" opacity=".7"/>
        <path d="M78 330 C110 290 150 250 175 210 C178 160 172 110 170 70" stroke="#9a8a70" stroke-width="10" fill="none" opacity=".4"/>
        <text x="170" y="24" text-anchor="middle" font-family="Marcellus SC, serif" font-size="12" fill="#2b2f36" opacity=".8">Dun Morogh</text>
        <text x="20" y="390" font-family="Marcellus SC, serif" font-size="12" fill="#2b2f36" opacity=".8">Coldridge Valley</text>`,
  };
  // The map (v9.4): a zone view you can browse to any zone, and a world view of how the zones connect.
  // Tapping a far place offers the whole route, travelled leg by leg (G.travelRoute).
  function openMap(view, regionPick) {
    ui.mapView = typeof view === 'string' ? view : 'zone'; // the nav bar passes its click event
    ui.mapRegion = typeof regionPick === 'string' ? regionPick : null;
    openSheet('map', 'Map', 'Tap a place to travel there', (b, title) => {
      const P = G.S.player;
      const hereRegion = (D.PLACES[(P.travel && P.travel.to) || P.place] || {}).region || 'elwynn';
      const tabs = h('div', { class: 'tabs' },
        h('button', { class: ui.mapView === 'zone' ? 'on' : '', onclick: () => { ui.mapView = 'zone'; ui.sheetFn(); } }, 'Zone'),
        h('button', { class: ui.mapView === 'world' ? 'on' : '', onclick: () => { ui.mapView = 'world'; ui.sheetFn(); } }, 'World'));
      b.append(tabs);
      if (ui.mapView === 'world') return worldMap(b, title, hereRegion);
      const region = ui.mapRegion && MAPS[ui.mapRegion] ? ui.mapRegion : hereRegion;
      title.firstChild.textContent = D.REGIONS[region].name;
      if (region !== hereRegion) b.append(h('div', { class: 'chips' }, h('button', { class: 'chip', onclick: () => { ui.mapRegion = null; ui.sheetFn(); } }, '← Back to ' + D.REGIONS[hereRegion].name)));
      const MAP = MAPS[region];
      const cur = P.travel ? null : P.place;
      const lines = [], nodes = [];
      const seen = new Set();
      for (const a in MAP) for (const c in D.PLACES[a].links) {
        if (!MAP[c]) continue;
        const k = [a, c].sort().join('|'); if (seen.has(k)) continue; seen.add(k);
        const [x1, y1] = MAP[a], [x2, y2] = MAP[c];
        lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a6a3a" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>`);
      }
      const qPlaces = new Set();
      for (const qid in P.quests) {
        const st = G.questState(qid);
        if (st === 'complete') { const npc = D.QUESTS[qid].turnin; for (const p in D.PLACES) if (D.PLACES[p].npcs.includes(npc)) qPlaces.add(p); continue; }
        for (const o of D.QUESTS[qid].objs) {
          if (o.type === 'visit') qPlaces.add(o.place);
          for (const p in D.PLACES) { const pl = D.PLACES[p]; if ((pl.mobs || []).some((m) => m[0] === o.mob || (D.MOBS[m[0]].qdrops || []).some((d) => d[0] === o.item)) || (pl.named && Object.keys(pl.named).some((k) => k === o.mob || (D.MOBS[k].qdrops || []).some((d) => d[0] === o.item))) || (pl.gather && pl.gather.item === o.item)) qPlaces.add(p); }
        }
      }
      for (const p in MAP) {
        const [x, y] = MAP[p]; const pl = D.PLACES[p];
        const here = p === cur;
        const adj = cur && D.PLACES[cur].links[p] && !G.enemyTown(p);
        const seenP = P.visited[p];
        nodes.push(`<g data-go="${p}" style="cursor:${adj ? 'pointer' : 'default'}">
          <circle cx="${x}" cy="${y}" r="${here ? 13 : 10}" fill="${here ? '#f0c75e' : G.enemyTown(p) ? '#8a2a22' : seenP ? '#6b8f3a' : '#3a4a2a'}" stroke="#1a1208" stroke-width="3"/>
          ${here ? `<circle cx="${x}" cy="${y}" r="19" fill="none" stroke="#f0c75e" stroke-width="2" opacity=".6"/>` : ''}
          ${qPlaces.has(p) ? `<text x="${x + 12}" y="${y - 8}" font-family="Marcellus SC, serif" font-size="20" fill="#ffd100" stroke="#000" stroke-width="1">!</text>` : ''}
          <text x="${x}" y="${y + 26}" text-anchor="middle" font-family="Alegreya Sans, sans-serif" font-weight="800" font-size="13" fill="${adj || here ? '#f3e6c6' : '#a89a7a'}" stroke="#120c05" stroke-width="3" paint-order="stroke">${esc(pl.name)}</text>
          <text x="${x}" y="${y + 40}" text-anchor="middle" font-family="Alegreya Sans, sans-serif" font-weight="700" font-size="11" fill="${conColor(Math.round((pl.lvl[0] + pl.lvl[1]) / 2))}" stroke="#120c05" stroke-width="3" paint-order="stroke">${pl.safe ? 'Town' : pl.lvl[0] + '-' + pl.lvl[1]}</text>
        </g>`);
      }
      const svg = `<svg viewBox="0 0 340 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Map of ${esc(D.REGIONS[region].name)}">
        ${MAP_BG[region]}
        ${lines.join('')}${nodes.join('')}</svg>`;
      const m = h('div', { class: 'map', html: svg });
      m.addEventListener('click', (e) => {
        const g = e.target.closest('[data-go]'); if (!g) return;
        const to = g.dataset.go;
        if (to === cur) return;
        if (cur && D.PLACES[cur].links[to] && !G.enemyTown(to)) { G.travelTo(to); closeSheet(); return; }
        routeDialog(to);
      });
      const far = h('div', { class: 'chips' });
      for (const a in MAP) for (const c in D.PLACES[a].links) if (!MAP[c] && !G.enemyTown(a) && !G.enemyTown(c)) far.append(h('button', { class: 'chip gold', onclick: () => { if (cur === a) { G.travelTo(c); closeSheet(); } else toast(`Go to ${D.PLACES[a].name} first.`); } }, `${D.PLACES[a].name} → ${D.PLACES[c].name}`, h('small', null, `${D.PLACES[c].zone} · ` + ((D.PLACES[a].via || {})[c] || 'Road') + ' · ' + G.travelSecs(a, c) + 's')));
      b.append(m, h('div', { style: { color: 'var(--muted)', fontSize: '13px' } }, 'Gold: you are here. ! marks places your quests need. Tap any place for the way there.'));
      // roads out of this zone, under the map so they never push it down
      if (far.childNodes.length) b.append(h('div', { class: 'sec-h' }, 'Roads out of ' + D.REGIONS[region].name), far);
    });
  }

  function routeDialog(to) {
    const P = G.S.player, pl = D.PLACES[to];
    if (P.travel) return toast('You are already on the road.');
    const r = G.route(P.place, to);
    if (!r) return showDialog([h('h3', null, pl.name), h('p', null, G.enemyTown(to) ? `${pl.name} is an enemy town. The guards would kill you on sight.` : `There's no way to ${pl.name} from here.`), h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: closeDialog }, 'OK'))], true);
    const steps = r.path.slice(1).map((p, i) => { const a = r.path[i]; const via = (D.PLACES[a].via || {})[p]; return h('div', { class: 'obj' }, `${i + 1}. ${D.PLACES[p].name}`, h('small', { style: { color: 'var(--muted)' } }, ` · ${D.PLACES[p].zone}${via ? ' · ' + via : ''} · ${G.travelSecs(a, p)} s`)); });
    showDialog([h('h3', null, 'Route to ' + pl.name), h('p', null, `${pl.zone} · levels ${pl.lvl[0]}–${pl.lvl[1]} · ${r.path.length - 1} stop${r.path.length > 2 ? 's' : ''}, about ${r.secs} s`), ...steps,
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); closeSheet(); G.travelRoute(to); } }, 'Go'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Cancel'))], true);
  }
  // the world: every zone, where it sits, and how the zones connect
  const WORLD = {
    tirisfal: [44, 44], plaguelands: [124, 44], hillsbrad: [58, 100], arathi: [132, 112], wetlands: [100, 158], dunmorogh: [52, 204], steppes: [134, 214],
    elwynn: [62, 264], redridge: [140, 264], westfall: [36, 320], duskwood: [110, 320], stranglethorn: [72, 384],
    teldrassil: [236, 40], winterspring: [306, 66], ashenvale: [246, 108], stonetalon: [204, 154], durotar: [308, 154], barrens: [270, 208], mulgore: [214, 250],
    feralas: [210, 310], tanaris: [298, 322], ungoro: [254, 380], tidewatch: [118, 458], stormveil: [196, 486], skullreef: [274, 458],
  };
  function worldMap(b, title, hereRegion) {
    title.firstChild.textContent = 'Azeroth';
    const P = G.S.player, my = G.myFaction();
    const edges = {}, lines = [], nodes = [];
    for (const k in D.PLACES) { const p = D.PLACES[k]; for (const l in p.links) { const a = p.region, c = D.PLACES[l].region; if (a && c && a !== c && WORLD[a] && WORLD[c]) { const key = [a, c].sort().join('|'); const via = (p.via || {})[l]; if (!edges[key] || (via && edges[key] === 'road')) edges[key] = via || 'road'; } } }
    for (const key in edges) {
      const [a, c] = key.split('|'); const [x1, y1] = WORLD[a], [x2, y2] = WORLD[c];
      const road = /road|pass|wall|span/i.test(edges[key]);
      lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${road ? '#8a6a3a' : '#5a7a9a'}" stroke-width="${road ? 3 : 2}" stroke-dasharray="${road ? '6 5' : '2 5'}" stroke-linecap="round" opacity=".9"/>`);
    }
    const lv = (r) => { let a = 99, c = 0; for (const k in D.PLACES) { const p = D.PLACES[k]; if (p.region === r && p.lvl) { a = Math.min(a, p.lvl[0]); c = Math.max(c, p.lvl[1]); } } return a <= c ? `${a}–${c}` : ''; };
    for (const r in WORLD) {
      if (!D.REGIONS[r]) continue;
      const [x, y] = WORLD[r], R = D.REGIONS[r], here = r === hereRegion;
      const col = R.faction === 'contested' ? '#c9a23a' : R.faction === my ? '#4f8a3a' : R.faction ? '#9a3a2a' : '#6a6a5a';
      const been = Object.keys(D.PLACES).some((k) => D.PLACES[k].region === r && P.visited[k]);
      nodes.push(`<g data-region="${r}" style="cursor:pointer">
        <circle cx="${x}" cy="${y}" r="${here ? 12 : 9}" fill="${col}" stroke="${here ? '#f0c75e' : '#1a1208'}" stroke-width="${here ? 4 : 3}" opacity="${been || here ? 1 : 0.7}"/>
        <text x="${x}" y="${y + 22}" text-anchor="middle" font-family="Alegreya Sans, sans-serif" font-weight="800" font-size="11" fill="${here ? '#ffd100' : '#f3e6c6'}" stroke="#120c05" stroke-width="3" paint-order="stroke">${esc(R.name)}</text>
        <text x="${x}" y="${y + 34}" text-anchor="middle" font-family="Alegreya Sans, sans-serif" font-weight="700" font-size="10" fill="#bba" stroke="#120c05" stroke-width="3" paint-order="stroke">${lv(r)}</text></g>`);
    }
    const svg = `<svg viewBox="0 0 340 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="World map">
      <rect width="340" height="520" rx="6" fill="#1d3a4e"/>
      <path d="M12 26 C70 6 160 24 170 74 C182 150 158 250 164 330 C170 410 120 428 64 412 C4 392 0 250 12 150 Z" fill="#4a5a34" opacity=".85"/>
      <path d="M190 22 C260 6 332 24 334 96 C338 200 332 300 322 370 C302 412 226 414 196 370 C180 300 184 200 184 120 Z" fill="#6a5a34" opacity=".85"/>
      <ellipse cx="196" cy="468" rx="112" ry="32" fill="#3f6a58" opacity=".85"/>
      <text x="88" y="16" text-anchor="middle" font-family="Marcellus SC, serif" font-size="11" fill="#cfe0e8" opacity=".75">Eastern Kingdoms</text>
      <text x="262" y="16" text-anchor="middle" font-family="Marcellus SC, serif" font-size="11" fill="#cfe0e8" opacity=".75">Kalimdor</text><text x="196" y="432" text-anchor="middle" font-family="Marcellus SC, serif" font-size="10" fill="#cfe0e8" opacity=".75">The Stormveil Isle</text>
      ${lines.join('')}${nodes.join('')}</svg>`;
    const m = h('div', { class: 'map', html: svg });
    m.addEventListener('click', (e) => { const g = e.target.closest('[data-region]'); if (!g) return; ui.mapView = 'zone'; ui.mapRegion = g.dataset.region; ui.sheetFn(); });
    b.append(m, h('div', { style: { color: 'var(--muted)', fontSize: '13px' } }, 'Green: your faction · red: the enemy\'s · gold: contested. Brown dashes are roads, blue dots are ships and flights. Tap a zone to open it, then tap a place for the way there.'));
  }

  // ---------- quests
  // a longer story for the first and last quest of a storyline (src/data/lore_quests.js), folded until you ask for it
  function questStory(qid) {
    const t = (D.QUEST_STORY || {})[qid]; if (!t) return null;
    const open = ui.storyOpen === qid;
    const wrap = h('div', { class: 'qstory' });
    if (open) wrap.append(h('p', null, t));
    wrap.append(h('button', { class: 'qstory-b', onclick: (e) => { e.stopPropagation(); ui.storyOpen = open ? null : qid; wrap.replaceWith(questStory(qid)); } }, open ? 'Less' : 'More…'));
    return wrap;
  }
  // the dungeon or raid a quest sends you to: its group-finder name (Q.dungeon is a dungeon key)
  function questDungeon(Q) {
    const A = Object.values(D.ACTIVITIES).find((a) => a.dungeon === Q.dungeon) || D.ACTIVITIES[Q.dungeon];
    return { name: A ? A.name : (D.DUNGEONS[Q.dungeon] || {}).name || 'the dungeon', raid: !!(A && A.size >= 10) };
  }
  function questDetail(qid, npc) {
    const Q = D.QUESTS[qid];
    const st = G.questState(qid);
    const pr = G.questProgress(qid);
    const reward = G.rewardItem(qid);
    const money = (Q.reward.money || 0) + G.questMoney(Q.lvl);
    const box = h('div', { class: 'parch' },
      h('h3', null, Q.name),
      h('p', null, Q.text),
      questStory(qid),
      h('h4', null, 'Objectives'),
      ...pr.map((p) => h('div', { class: 'obj tnum' + (p.have >= p.n ? ' done' : '') }, `${p.label}: ${p.have}/${p.n}`)),
      Q.group ? h('div', { class: 'obj', style: { color: '#8a1a10' } }, `Group quest (${Q.group} players). Use the group finder.`) : null,
      Q.dungeon ? h('div', { class: 'obj', style: { color: '#8a1a10' } }, `${questDungeon(Q).raid ? 'Raid' : 'Dungeon'} quest. Queue for ${questDungeon(Q).name} in Social.`) : null,
      h('h4', null, 'Rewards'),
      h('div', { class: 'money', html: `${G.questXp(Q.lvl)} experience · ` + moneyHtml(money) }));
    if (reward) {
      const r = h('button', { class: 'row', style: { background: 'rgba(60,40,15,.15)', borderColor: '#b08a4a' }, onclick: () => showDialog(itemTip(reward), true) },
        itemIcon(reward), h('div', { class: 't' }, h('b', { class: 'q' + reward.q, style: { textShadow: '0 1px 0 #000' } }, reward.name), h('small', { style: { color: blockReason(reward) ? '#a01010' : '#5a3a0c' } }, blockReason(reward) ? blockReason(reward).text : 'Tap to inspect')), h('div'));
      box.append(r);
    }
    const btns = h('div', { class: 'btn-row' });
    if (st === 'available' && npc) btns.append(h('button', { class: 'btn', onclick: () => { G.accept(qid); openNpc(npc); } }, 'Accept'));
    if (st === 'complete' && npc && D.QUESTS[qid].turnin === npc) btns.append(h('button', { class: 'btn', onclick: () => { G.turnIn(qid); openNpc(npc); } }, 'Complete Quest'));
    if ((st === 'active' || st === 'complete') && !npc) btns.append(h('button', { class: 'btn alt', onclick: () => { G.abandon(qid); openQuests(); } }, 'Abandon'));
    return [box, btns];
  }
  function openQuests() {
    openSheet('quests', 'Quest Log', `${Object.keys(G.S.player.quests).length}/20`, (b) => {
      const P = G.S.player;
      const qs = Object.keys(P.quests);
      if (!qs.length) b.append(h('p', null, 'Your quest log is empty. Look for people with a yellow ! above their name.'));
      for (const qid of qs) {
        const st = G.questState(qid);
        const Q = D.QUESTS[qid];
        b.append(h('button', { class: 'row', onclick: () => openSheet('quest', Q.name, 'Level ' + Q.lvl, (bb) => { bb.append(...questDetail(qid)); bb.append(h('button', { class: 'btn alt', onclick: openQuests }, 'Back')); }) },
          h('div', { class: 'ic' }, h('span', { class: 'mark' + (st === 'complete' ? '' : ' grey') }, '?')),
          h('div', { class: 't' }, h('b', { style: { color: conColor(Q.lvl) } }, `[${Q.lvl}] ${Q.name}`), h('small', null, st === 'complete' ? 'Complete. Return to ' + D.NPCS[Q.turnin].name : G.questProgress(qid).map((p) => `${p.have}/${p.n}`).join(' · '))),
          h('div', { class: 'r' }, '›')));
      }
    });
  }
  function openNpc(npc) {
    const N = D.NPCS[npc];
    openSheet('npc', N.name, N.title, (b) => {
      const qs = G.npcQuests(npc);
      const P = G.S.player;
      const place = D.PLACES[P.place];
      b.append(h('p', { style: { margin: 0, color: 'var(--text)' } }, greeting(npc)));
      if (/^banker_/.test(npc)) b.append(h('button', { class: 'btn wide', onclick: () => openBank() }, 'Open your bank'));
      if (/^crafts_/.test(npc)) trainerBlock(b);
      if (/^stable_/.test(npc)) stableBlock(b);
      if (/^auctioneer_/.test(npc)) b.append(h('button', { class: 'btn wide', onclick: () => openAuction() }, 'Browse the auction house'));
      if (npc === 'mentor_alliance' || npc === 'mentor_horde') {
        const acc = G.account();
        b.append(h('div', { class: 'sec-h' }, 'Heirlooms', h('small', null, `${acc.marks} Mentor Marks · shared by all your characters`)));
        const list = h('div', { class: 'list' });
        for (const id in D.HEIRLOOMS) {
          const H = D.HEIRLOOMS[id], it = G.makeHeirloom(id, P.level), owned = acc.heirlooms.includes(id);
          const stats = Object.entries(it.stats).map(([k, v]) => `+${v} ${k}`).join(', ') + (it.dmg ? ` · ${it.dmg[0]}–${it.dmg[1]} dmg` : '') + (it.armor ? ` · ${it.armor} armor` : '') + (it.sp ? ` · +${it.sp} spell power` : '');
          list.append(h('button', { class: 'row', onclick: () => { G.buyHeirloom(id); ui.sheetFn(); } },
            h('div', { class: 'ic' }, img(art('icon', H.icon))),
            h('div', { class: 't' }, h('b', { style: { color: D.QUALITY[5].color } }, H.name), h('small', { style: { whiteSpace: 'normal' } }, `At your level: ${stats}. Grows with you. +5% experience.`)),
            h('div', { class: 'r' }, owned ? 'Copy' : `${H.cost} ✦`)));
        }
        b.append(list, h('p', { class: 'ai-note' }, 'Earn Mentor Marks by answering Help Wanted in the group finder and from the daily Roulette.'));
      }
      for (const { qid, st } of qs) {
        const Q = D.QUESTS[qid];
        b.append(h('button', { class: 'row', onclick: () => openSheet('quest', Q.name, N.name, (bb) => { bb.append(...questDetail(qid, npc)); bb.append(h('button', { class: 'btn alt', onclick: () => openNpc(npc) }, 'Back')); }) },
          h('div', { class: 'ic' }, h('span', { class: 'mark' + (st === 'active' ? ' grey' : '') }, st === 'available' ? '!' : '?')),
          h('div', { class: 't' }, h('b', { style: { color: conColor(Q.lvl) } }, Q.name), h('small', null, st === 'available' ? 'New quest' : st === 'complete' ? 'Ready to turn in' : 'In progress')),
          h('div', { class: 'r' }, '›')));
      }
      if (place.vendor === npc || place.gearVendor === npc) b.append(h('button', { class: 'btn wide', onclick: () => openVendor(npc) }, 'Browse goods'));
      if (npc === 'farley') b.append(h('button', { class: 'btn alt wide', disabled: P.bind === P.place, onclick: () => { G.bindHere(); ui.sheetFn(); } }, P.bind === P.place ? 'This inn is your home' : 'Make this inn your home'));
      if (!qs.length && place.vendor !== npc && npc !== 'farley' && place.gearVendor !== npc && !/^(mentor|banker|auctioneer|crafts|stable)_/.test(npc)) b.append(h('p', { style: { color: 'var(--muted)' } }, 'Nothing for you right now. Come back when you have grown stronger.'));
    });
  }
  window.UI_GREETING = (npc) => greeting(npc);
  function greeting(npc) {
    // the reveal: you met him on the road in a hood
    if (npc === 'lyveus' && G.S && !G.S.player.done.lg_lyv_ashes && (G.S.player.done.lg_hood_a || G.S.player.done.lg_hood_h || (G.S.player.wanderer || {}).n)) return "You. The one from the road. I wondered if we'd meet again. Yes, the hood was me. My name is Lyveus Cloveus, and this was my home.";
    if (npc === 'hooded_stranger') return 'Keep your voice down. Some of the people who would like me dead wear very fine clothes.';
    return ({
      mcbride: 'Greetings, citizen. The Northshire Abbey could use your help.', willem: 'Stay alert, friend. The Defias are bold these days.',
      eagan: 'Mind the wolves. They get hungrier every week.', danil: 'Care for some bread and water? Fresh from the abbey.',
      milly: 'Oh! Are you here to help with the harvest?', dughan: 'Goldshire is under my protection. What do you need?',
      remy: 'Remy, at your service. Twice, if you pay twice.', pestle: 'Candles, herbs, powders. I always need more.',
      farley: 'Welcome to the Lion\'s Pride Inn! Rest your feet a while.', corina: 'Blades, hammers, staves. All sharpened by my own hand.',
      thomas: 'The lake shore isn\'t safe. Keep your weapon ready.', ma_stonefield: 'You there! Can you help an old farmer?',
      sten: 'Welcome to Coldridge, lad. Keep yer axe close.', balir: 'Troggs! Everywhere I look, troggs!', talin: 'Good hunting out here, if the wolves don\'t hunt you first.',
      adlin: 'Bread, water, and a wee bit of ale for the road?', ragnar: 'Welcome to the Thunderbrew Distillery! Best ale in Khaz Modan!',
      belm: 'Pull up a stool by the fire and warm yer bones.', stonegear: 'Careful, that engine bites. What can I do for ya?',
      senir: 'The trolls grow bolder by the day.', grawn: 'Axes, hammers, and a blade or two. All dwarf-made.',
      rudra: 'Something is killing my rams, and I know its name.', firebrew: 'Welcome to the Stonefire Tavern!',
      overspark: 'Gnomeregan will be ours again. We just need the right parts!', bruuk: 'Finest steel in Ironforge, if I say so meself.',
      grull: 'The plainstriders are the first test of any hunter.', hawkwind: 'Walk with the Earth Mother, young one.', raincaller: 'The quilboar grow restless in the ravine.',
      moodan: 'Fresh bread from the plains of Mulgore.', baine: 'Welcome to Bloodhoof Village. My father would be glad to see new braves.', kauth: 'Rest, friend. The winds are calm tonight.',
      harken: 'The swoops circle high today.', mahnott: 'Weapons strong enough for a tauren.', morin: 'Keep your eyes on the horizon.', pala: 'Welcome to Thunder Bluff.', etu: 'Tauren steel, blessed by the Earth Mother.',
      sarvis: 'You are free now. Free of the Lich King. Use that freedom well.', arren: 'The dead do not rest here. Not all of them, at least.', saltain: 'We need supplies. Everything is useful to the Forsaken.',
      kien: 'Food? For you? Yes... I suppose you still eat.', sevren: 'Brill serves the Dark Lady. As will you.', renee: 'Welcome to the Gallows\' End Tavern.',
      dillinger: 'The Scarlet Crusade grows bolder every day.', johaan: 'Ah, a test subject. I mean, a volunteer.', gerard: 'Blades for the Forsaken.', norman: 'The Undercity welcomes you.', abigail: 'Sharp things. For sharp minds.',
      gornek: 'Lok\'tar, young one. Prove your strength in the Valley of Trials.', kaltunk: 'Watch for the scorpids, they sting hard.',
      galgar: 'Hungry? Bring me cactus apples and I\'ll cook you something.', zureetha: 'The Burning Blade taints this valley. Help me cleanse it.',
      duokna: 'Food and water for the road, friend.', garthok: 'Razor Hill stands ready. The humans at Tiragarde are a thorn in our side.',
      grosk: 'Throm-ka! Rest your bones by the fire.', orgnil: 'The spirits whisper of storms over Thunder Ridge.', kaplak: 'Axes, blades, hammers. Orc steel.',
      vikar: 'I keep my eyes on the coast.', vanira: 'Zalazane has turned our people against us. Help me, mon.',
      gryshka: 'Welcome to Orgrimmar. Grab a drink.', rahauro: 'Weapons for the Horde, strong as the earth.', thrall_herald: 'The Warchief has need of heroes.',
      ilthalaine: 'Ishnu-alah. The balance of Shadowglen needs tending.', gilshalan: 'Something foul creeps into the glade. Can you feel it?',
      dirania: 'Stay sharp. The spiders of Shadowthread grow bolder.', nyoma: 'Rest and eat, traveller. The night is long.',
      tallonkai: 'The Gnarlpine were once our friends. Something has changed them.', zenn: 'Heh heh. Zenn has a small job for you, friend. Nothing strange.',
      keldamyr: 'Welcome to Dolanaar. Rest by the moonwell.', kyra: 'Elune guide your blade.', ilyenia: 'Glaives, blades and bows, blessed by the moon.',
      gryan: 'Welcome to Sentinel Hill. Westfall is ours again, one farm at a time.', danuvin: 'Keep your blade drawn. The Defias are never far.',
      galiaan: 'The murlocs on the Longshore get bolder every tide.', heather: 'Sit down and eat, love. Stew is hot.', lewis: 'Militia steel. Plain, but it does not break.',
      furlbrow: 'We lost the farm to the Defias. Lost everything.', verna: 'Poor Blanchy has not eaten in days.', saldean: 'We stayed when everyone else ran. Stubborn, I suppose.',
      salma: 'Mind the pie, it is hot!', thork: 'Lok\'tar. The Crossroads needs every blade it can get.', sergra: 'The Barrens test every hunter. Most fail.',
      helbrim: 'Samples, samples. The Barrens are full of interesting poisons.', zargh: 'Hungry? Everything here is edible if you cook it long enough.',
      boorand: 'Rest your feet, traveller. The Barrens are wide.', nargal: 'Need a weapon? The centaurs will not ask before they charge.', kargal: 'Far Watch sees everything that comes out of the Barrens.',
      allison: 'Welcome to the Gilded Rose. Stormwind\'s finest beds.', thurman: 'Stormwind steel. The best the Alliance can buy.',
      banker_alliance: 'Your valuables are safe with us.', banker_horde: 'Store what you cannot carry. Nothing leaves this vault without you.', auctioneer_alliance: 'Buying or selling? Every adventurer on the realm trades through this house.', auctioneer_horde: 'Buy low, sell high. The Horde trades here.',
      xenzilla: 'Da goblins cut down every tree, mon. Da spirits be angry.', mastok: 'Sun Rock stands, for now. Every blade counts up here.', tsunaman: 'The earth weeps where the goblins cut. Listen, and you will hear it.',
      sahn: 'The wild things of these peaks are restless. Something has upset the balance.', jayka: 'Welcome to Sun Rock. Warm yourself by the fire.', krond: 'Tauren steel and orc temper. Nothing better.',
      solomon: 'Lakeshire has begged Stormwind for help for months. You are the first to answer.', marris: 'The orcs hold Stonewatch and the gnolls hold the hills. Pick a fight, any fight.',
      oslow: 'This bridge will be finished one day. If the murlocs let me.', darcy: 'Sit, eat. Nothing fixes a bad day like a bowl of goulash.', brianna: 'Welcome to the Lakeshire Inn. Mind the fish smell.',
      verner: 'Blades and mail, forged by the lake.', thelwater: 'The Stockade is in chaos. Every prisoner we ever caught is loose in there.',
      ebonlocke: 'Darkshire stands, no thanks to Stormwind. We watch the woods every night.', althea: 'The Night Watch takes anyone who can hold a sword. Can you?', abercrombie: 'Heh heh. A visitor. Come in, come in. Mind the smell.',
      madame_eva: 'The cards told me you would come. They did not say whether you would leave.', sirra: 'The history of Duskwood is written in blood and moonlight.', trelayne: 'Welcome to the Scarlet Raven. Keep the door shut, the wolves are out.', gavin: 'Silver edges bite worgen best. Take a look.',
      darthalia: 'The Dark Lady wants Hillsbrad. We will give it to her, one farm at a time.', lydon: 'Every plague needs a test. And every test needs subjects.', krusk: 'Lok\'tar. Tarren Mill needs blades, not talk.', dalar: 'Arugal made those worgen. He must answer for it.',
      marla: 'Rest in Tarren Mill. The dead do not sleep, but you still may.', dogran: 'Orc steel, Forsaken edge.',
      noggenfogger: 'Welcome to Gadgetzan, where everything has a price and the water costs extra.', bilgewhizzle: 'Bandits, pirates, bugs. My water towers have more enemies than friends.', sprinkle: 'Water is life out here. Help me keep it flowing.', fizzledowser: 'Fascinating desert! Dangerous, but fascinating.', innkeeper_fizzgrimble: 'Rooms, drinks, sand in everything. Welcome.', blizrik: 'Guns, blades and bombs. No refunds.',
      shandris: 'Feathermoon holds the coast. Elune gives us strength.', latronicus: 'The forest is vast and old. So are its dangers.', innkeeper_shyria: 'Rest under the moon, friend.', vivianna: 'Moonsteel blades, light and deadly.',
      hadoken: 'The hunt in Feralas is the greatest in Kalimdor.', orwin: 'Mojache is a camp of hunters. Bring me proof of yours.', innkeeper_greul: 'Eat, drink, sleep. The forest will wait.', krueg: 'Heavy weapons for heavy work.',
      lyveus: 'They told the world I died. Some days I almost believed them.', vyn: 'Keep your voice down. The court has ears even in Gadgetzan.',
      donova_snowden: 'The Winterfall were a peaceful tribe. Something poisoned them.', witch_doctor_mauari: 'Cold magic, strong magic. Mauari has work for you.', umi_rumplesnicker: 'Have you seen a yeti? Aren\'t they wonderful? Please kill some.', malyfous_darkhammer: 'Bring me good materials and I\'ll make you something worth wearing.', haleh: 'The blue dragonflight watches Winterspring. Not all of us stayed loyal.', innkeeper_everlook: 'Welcome to Everlook. Warm beds, hot food, cold prices.', xizzer_fizzbolt: 'Weapons for the cold. Guaranteed not to freeze. Mostly.',
      admiral_vane: 'Kul Tiras charts every sea. This island was never on any chart.', lyssa_moonquill: 'Highborne built this place. I want to know what they became.', sergeant_tamsin: 'Keep your blade dry and your back to the landing.', quartermaster_brenn: 'Supplies from Menethil. What\'s left of them.', armorer_hale: 'Kul Tiran steel. It holds an edge in salt water.',
      shadow_hunter_zulkesh: 'Our ancestors knew this reef. Now it knows us again.', deathstalker_voss: 'The drowned are not Scourge. That makes them interesting.', hexxer_mazu: 'The loa is screaming, mon. Mazu can hear it.', trader_gikkix: 'Everything\'s for sale on the reef. Even the reef.', armorer_krosh: 'Blades for the Horde. Sharp, heavy, and cheap enough.',
      marshal_yeager: "Welcome to the Refuge. Watch the sky, the pterrordax take anyone who wanders.", williden: 'Un\'Goro is older than any of us. Old and hungry.', spraggle: 'I lost my tools and my nerve out there. You can have the nerve.', larion: 'The crater is full of wonders. Most of them bite.', quixxil: 'Supplies! Priced for the end of the world, which this place looks like.',
      marshal_maxwell: 'Morgan\'s Vigil stands between the Blackrock orcs and Redridge. We will not fall back.', oralius: 'The black dragonflight hatches in these hills. Burn every egg you find.', helendis: 'My wife is at Morgan\'s Vigil. I fight so she never has to.', innkeeper_ashmorn: 'Food, drink, and a bed that isn\'t on fire. Mostly.',
      gorzeeki: 'Everything in the Steppes is hot, sharp or angry. Perfect for my work.', thal_kaur: 'The Warchief watches the mountain. So do I.', innkeeper_bruk: 'Rest. The ash gets in everything, even the ale.', shul_kar: 'Steel forged in the Steppes. Nothing else survives the heat.',
      commander_ashlam: 'The Scourge never sleeps, and neither does Chillwind Camp.', argent_officer_a: 'The Argent Dawn counts every fallen undead. Help us raise the count.', alchemist_arbington: 'Bring me samples. The plague can be cured, I know it.', quartermaster_hudson: 'Supplies for the living. Take what you need.',
      high_executor_derrington: 'The Bulwark holds for the Dark Lady. The Scourge will not pass.', argent_officer_h: 'Horde or Alliance, the Argent Dawn stands against the dead.', apothecary_dithers: 'A new plague needs new ingredients. Fetch them.', quartermaster_lauren: 'Gear for the front. It\'s all the front out here.',
      captain_nials: 'Arathor will rise again. Until then, we hold Refuge Pointe.', sergeant_maclear: 'The highlands are full of things that want you dead. Pick one.', shards: 'I scout Stromgarde. The Syndicate never sleeps.', innkeeper_taruga: 'Supplies for the road, soldier.',
      drum_fel: 'Hammerfall stands. Arathi will be the Horde\'s.', tor_gan: 'The hunt in these highlands is good.', gorn: 'The earth here is bound and angry. Help me free it.', innkeeper_adegwa: 'Rest in Hammerfall, the walls are thick.', urda: 'Orc steel. The best in the highlands.',
      barnil: 'Welcome to the Rebel Camp. We left Kurzen when he lost his mind.', lieutenant_doren: 'Stormwind forgot us out here. Kurzen did not.', sergeant_yohwa: 'Watch the trees. Everything in this jungle bites.', corporal_bluth: 'Supplies are thin, but they are yours for a price.',
      nimboya: 'Da Darkspear got old enemies in dis jungle, mon.', commander_aggro: "Grom'gol stands for the Horde. Keep it standing.", kin_weelay: 'Da loa whisper in dis jungle. Listen close.', innkeeper_thulbek: 'Rest. The jungle will still be here.', uthok: 'Blades for the jungle. Sharp and heavy.',
      nesingwary: 'Ah, a fellow hunter! The finest game in the world lives in this jungle.', ajeck: 'Tigers first. Prove your aim.', erlgadin: 'The raptors are cunning. Mind your flanks.',
      stoutfist: 'Menethil holds the only road north. Keep it open and I will keep you fed.', glorin: 'The Dark Iron and the Dragonmaw both. Busy times for a mountaineer.', rethiel: 'The marsh is sick. The murlocs are only the symptom.',
      whelgar: 'History under every stone! And raptors on top of it.', helbrek: 'Rain again. Sit by the fire.', murndan: 'Dwarven steel and Menethil tar. Built to last.',
      raene: 'Ashenvale bleeds. Demons, satyrs, and orcs with axes. We need every blade.', shindrell: 'The wolves of this forest are no ordinary wolves.', thenysil: 'Elune watch over you. The Deeps are darker than the sea.',
      orendil: 'The furbolgs were friends once. Something poisons their hearts.', kimlya: 'Rest, traveller. Astranaar is safe while the lake guards us.', aeolynn: 'Kaldorei steel, sharp as moonlight.',
      senani: 'Splintertree holds, for now. The elves attack every night.', ertog: 'The Warsong need wood, and the forest fights back. Pick up an axe.', mitsuwa: 'The spirits of this forest are angry. I do not blame them.',
      kaylisk: 'Sit. Eat. The next night elf raid is not for an hour.', burkrum: 'Orc steel. Better than elf twigs.',
      stable_alliance: 'A good mount is worth every copper. Ready to learn?', stable_horde: 'Every warrior of the Horde needs a mount. Show me your gold.',
      crafts_alliance: 'Every trade starts with a pick, a knife or a needle. Which will it be?', crafts_horde: 'Strong arms gather, clever hands craft. Choose your trade.',
      mentor_alliance: 'Helping the new ones through the dungeons is how heroes are made. Your marks are good here.', mentor_horde: 'The strong carry the weak through the fire. The Horde remembers. Spend your marks well.',
      denalan: 'The timberlings have been acting so oddly...', saelienne: 'Welcome to Darnassus, child of the stars.', mydrannul: 'Fine Kaldorei steel. Look, but do not touch.',
    })[npc] || 'Hello.';
  }
  function openVendor(npc) {
    openSheet('vendor', D.NPCS[npc].name, 'Tap to buy · your money: ' + G.moneyText(G.S.player.money), (b, t) => {
      t.querySelector('small').textContent = 'Tap to buy · your money: ' + G.moneyText(G.S.player.money);
      const stock = G.vendorStock(npc);
      const list = h('div', { class: 'list' });
      for (const it of stock) {
        const cost = it.cost || it.sell * 4;
        const stack = G.stackable(it);
        list.append(h('div', { class: 'row', style: { gridTemplateColumns: '34px 1fr auto' } },
          h('button', { style: { padding: 0 }, onclick: () => showDialog(itemTip(it), true) }, itemIcon(it)),
          h('button', { class: 't', style: { textAlign: 'left' }, onclick: () => showDialog(itemTip(it), true) }, h('b', { class: 'q' + it.q }, it.name), h('small', null, h('span', { html: moneyHtml(cost) + (stack ? ' each' : '') }), gearTag(it))),
          h('div', { class: 'btn-row', style: { flexWrap: 'nowrap' } },
            h('button', { class: 'chip', onclick: () => { G.buy(it, 1); ui.sheetFn(); } }, 'Buy'),
            stack ? h('button', { class: 'chip', onclick: () => { G.buy(it, 5); ui.sheetFn(); } }, '×5') : null)));
      }
      b.append(list);
      b.append(h('div', { class: 'sec-h' }, 'Sell', h('small', null, 'tap an item to sell it')));
      const junk = G.S.player.bags.filter((x) => x.item.q === 0).length;
      b.append(h('button', { class: 'btn alt wide', disabled: !junk, onclick: () => { G.sellJunk(); ui.sheetFn(); } }, junk ? `Sell all grey items (${junk})` : 'No grey items to sell'));
      b.append(bagGrid((idx) => { G.sell(idx); ui.sheetFn(); }));
    });
  }

  // ---------- bags
  function bagGrid(onTap) {
    const P = G.S.player;
    const g = h('div', { class: 'bags' });
    for (let i = 0; i < G.bagCap(); i++) {
      const b = P.bags[i];
      if (!b) { g.append(h('div', { class: 'slot' })); continue; }
      const it = b.item;
      const why = blockReason(it);
      g.append(h('button', { class: 'slot qb' + it.q + (ui.bagSel === i ? ' sel' : '') + (why ? ' cant' : ''), onclick: () => onTap(i) },
        img(art('icon', it.icon)), b.n > 1 ? h('span', { class: 'cnt tnum' }, b.n) : null, !why && G.isUpgrade(it) ? h('span', { class: 'up' }, '▲') : null,
        why ? h('span', { class: 'why' }, why.kind === 'level' ? String(why.lvl) : '✕') : null));
    }
    return g;
  }
  function openBags() {
    ui.bagSel = null;
    openSheet('bags', 'Backpack', null, (b, t) => {
      const P = G.S.player;
      t.innerHTML = ''; t.append('Bags', h('small', { html: `${P.bags.length}/${G.bagCap()} · ` + moneyHtml(P.money) }));
      if ((P.bagsEq || []).length) b.append(h('div', { class: 'chips' }, ...(P.bagsEq || []).map((bg, i) => h('button', { class: 'chip', onclick: () => { G.unequipBag(i); ui.sheetFn(); } }, img(art('icon', bg.icon)), ' ', bg.name, h('small', null, `+${bg.bag} · tap to take off`)))));
      b.append(bagGrid((i) => { ui.bagSel = ui.bagSel === i ? null : i; ui.sheetFn(); }));
      const sel = P.bags[ui.bagSel];
      if (sel) {
        const it = sel.item;
        const acts = h('div', { class: 'btn-row' });
        if (D.GEAR_SLOTS.includes(it.slot)) acts.append(h('button', { class: 'btn', disabled: !G.canUseItem(it) || it.lvl > P.level, onclick: () => { G.equip(ui.bagSel); ui.bagSel = null; ui.sheetFn(); } }, 'Equip'));
        if (it.slot === 'food' || it.slot === 'drink') acts.append(h('button', { class: 'btn', onclick: () => { G.consume(it.slot); closeSheet(); } }, 'Use'));
        if (G.usable(it)) acts.append(h('button', { class: 'btn', onclick: () => { G.useItem(ui.bagSel); ui.bagSel = null; ui.sheetFn(); } }, it.slot === 'bag' ? 'Equip bag' : it.slot === 'recipe' ? 'Learn' : 'Use'));
        if (it.id === 'hearthstone') acts.append(h('button', { class: 'btn', onclick: () => { G.hearth(); closeSheet(); } }, 'Use'));
        const vendorHere = D.PLACES[P.place].vendor || D.PLACES[P.place].gearVendor;
        if (vendorHere && !it.noSell && it.slot !== 'quest') acts.append(h('button', { class: 'btn alt', onclick: () => { G.sell(ui.bagSel); ui.bagSel = null; ui.sheetFn(); } }, 'Sell'));
        if (!it.noSell && it.slot !== 'quest' && !vendorHere) acts.append(h('div', { style: { color: 'var(--muted)', fontSize: '13px', alignSelf: 'center' } }, 'Sell it at a vendor.'));
        const cur = P.equip[it.slot];
        // the buttons stay pinned to the bottom of the sheet, so selling never needs a scroll (v9.4)
        const price = !it.noSell && it.slot !== 'quest' ? h('small', { html: ' · sells for ' + moneyHtml((it.sell || 1) * sel.n) }) : null;
        b.append(h('div', { class: 'bag-acts' }, h('div', { class: 'bag-acts-t' }, h('b', { class: 'q' + (it.q || 0) }, it.name + (sel.n > 1 ? ' x' + sel.n : '')), price), acts));
        b.append(itemTip(it));
        if (cur && D.GEAR_SLOTS.includes(it.slot)) b.append(h('div', { class: 'sec-h' }, 'Currently equipped'), itemTip(cur));
      } else b.append(h('p', { style: { color: 'var(--muted)', margin: 0 } }, 'Tap an item to inspect it. A green arrow means an upgrade.'));
      const vendorNow = D.PLACES[P.place].vendor || D.PLACES[P.place].gearVendor;
      const junk = P.bags.filter((x) => x.item.q === 0 && !x.item.noSell).length;
      if (vendorNow && junk) b.append(h('button', { class: 'btn alt wide', onclick: () => { G.sellJunk(); ui.bagSel = null; ui.sheetFn(); } }, `Sell all grey items (${junk})`));
    });
  }

  // ---------- hero
  function openHero(tab) {
    if (tab && typeof tab === 'string') ui.heroTab = tab;
    ui.heroTab = ui.heroTab || 'char';
    openSheet('hero', G.S.player.name, `Level ${G.S.player.level} ${(D.RACES[G.S.player.race] || D.RACES.human).name} ${D.CLASSES[G.S.player.cls].name} · ${D.REALM}`, (b) => {
      const P = G.S.player, st = G.stats(), v = G.vitals();
      const need = D.XP_TO_LEVEL[P.level];
      const tp = G.talentPoints(P);
      // four pinned tabs instead of one long page; a dot marks unspent talent points
      const tabs = h('div', { class: 'tabs' });
      for (const [k, label, dot] of [['char', 'Character'], ['abil', 'Abilities', tp.free > 0], ['journey', 'Journey', loreUnread() > 0], ['settings', 'Settings']])
        tabs.append(h('button', { class: ui.heroTab === k ? 'on' : '', onclick: () => { ui.heroTab = k; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } }, label, dot ? h('span', { class: 'tab-dot' }) : null));
      b.append(h('div', { class: 'sheet-stick' }, tabs));
      if (ui.heroTab === 'char') {
        b.append(h('div', { class: 'hero-top' }, img(art('hero', looks(P))),
          h('div', { class: 'stats' },
            ...[['Health', v.maxHp], [D.CLASSES[P.cls].resource === 'mana' ? 'Mana' : D.CLASSES[P.cls].resource === 'rage' ? 'Rage' : 'Energy', Math.round(v.maxRes)], ['Strength', st.str], ['Agility', st.agi], ['Stamina', st.sta], ['Intellect', st.int], ['Spirit', st.spi], ['Armor', st.armor], ['Attack Power', Math.round(st.apTotal)], ['Spell Power', st.sp], ['Crit', st.crit.toFixed(1) + '%'], ['Dodge', st.dodgeTotal.toFixed(1) + '%']]
              .map(([k, val]) => h('div', null, h('span', null, k), h('b', { class: 'tnum' }, val))))));
        b.append(h('div', { class: 'stats' },
          h('div', null, h('span', null, 'Experience'), h('b', { class: 'tnum' }, P.level >= D.LEVEL_CAP ? 'Max level' : `${P.xp}/${need}`)),
          h('div', null, h('span', null, 'Rested'), h('b', { class: 'tnum' }, P.level >= D.LEVEL_CAP ? '-' : Math.round(P.rested))),
          h('div', null, h('span', null, 'Money'), h('b', { html: moneyHtml(P.money) })),
          h('div', null, h('span', null, 'Played'), h('b', { class: 'tnum' }, fmtTime(P.played * 1000))),
          h('div', null, h('span', null, 'Kills'), h('b', { class: 'tnum' }, P.kills)),
          h('div', null, h('span', null, 'Deaths'), h('b', { class: 'tnum' }, P.deaths))));
        if (P.riding) {
          const row = h('div', { class: 'chips' }, h('button', { class: 'chip' + (!P.mount ? ' gold' : ''), onclick: () => { G.setMount(null); ui.sheetFn(); } }, 'On foot'));
          for (const k of (P.mounts || [])) row.append(h('button', { class: 'chip' + (P.mount === k ? ' gold' : ''), onclick: () => { G.setMount(k); ui.sheetFn(); } }, img(art('icon', 'mount_' + k)), ' ', D.MOUNTS[k].name));
          b.append(h('div', { class: 'sec-h' }, 'Mount', h('small', null, P.mount ? 'roads are 40% faster' : 'walking')), row);
        }
        b.append(h('div', { class: 'sec-h' }, 'Equipment', h('small', null, 'tap to inspect')));
        const gear = h('div', { class: 'gear' });
        for (const slot of D.GEAR_SLOTS) {
          const it = P.equip[slot];
          gear.append(h('button', { class: 'row' + (it ? '' : ' off'), onclick: () => { if (it) showDialog(itemTip(it, h('div', { class: 'btn-row', style: { marginTop: '8px' } }, h('button', { class: 'btn alt', onclick: () => { G.unequip(slot); closeDialog(); ui.sheetFn(); } }, 'Unequip'))), true); } },
            h('div', { class: 'ic' }, it ? img(art('icon', it.icon)) : ''),
            h('div', { class: 't' }, h('b', { class: it ? 'q' + it.q : '' }, it ? it.name : 'Empty'), h('small', null, D.SLOT_LABEL[slot])), h('div')));
        }
        b.append(gear);
      } else if (ui.heroTab === 'abil') {
        b.append(h('button', { class: 'btn wide' + (tp.free ? '' : ' alt'), onclick: () => openTalents() }, P.level < D.TALENT_START ? `Talents (from level ${D.TALENT_START})` : tp.free ? `Talents · ${tp.free} point${tp.free > 1 ? 's' : ''} to spend` : `Talents · ${tp.spent} spent`));
        b.append(h('button', { class: 'btn wide alt', onclick: () => openProfessions() }, Object.keys(G.profs()).length ? 'Professions · ' + Object.entries(G.profs()).map(([k, p]) => `${D.PROFESSIONS[k].name} ${p.skill}`).join(', ') : 'Professions (learn from a trainer in a city)'));
        b.append(h('button', { class: 'btn wide alt', onclick: () => openBarEditor() }, 'Arrange action bar'));
        b.append(h('div', { class: 'sec-h' }, 'Abilities', h('small', null, 'learned automatically')));
        const abl = h('div', { class: 'list' });
        // what you know in full; what's still to learn as one line
        const later = [];
        for (const id of D.CLASSES[P.cls].abilities) {
          const ab = D.ABILITIES[id]; const t = abilityText(id);
          if (ab.lvl > P.level) { later.push(ab); continue; }
          abl.append(h('div', { class: 'row' }, h('div', { class: 'ic' }, img(abIcon(id))), h('div', { class: 't' }, h('b', null, ab.name), h('small', { style: { whiteSpace: 'normal' } }, t.d)), h('div', { class: 'r' }, t.cost)));
        }
        b.append(abl);
        if (later.length) b.append(h('p', { class: 'ai-note' }, 'Coming up: ' + later.slice(0, 4).map((ab) => `${ab.name} (${ab.lvl})`).join(' · ') + (later.length > 4 ? ` and ${later.length - 4} more.` : '.')));
        const RC = D.RACIALS[P.race || 'human'];
        if (RC) {
          const ra = D.ABILITIES[RC.active];
          b.append(h('div', { class: 'sec-h' }, 'Racial traits', h('small', null, (D.RACES[P.race || 'human'] || {}).name)),
            h('div', { class: 'list' },
              h('div', { class: 'row' }, h('div', { class: 'ic' }, img(abIcon(RC.active))), h('div', { class: 't' }, h('b', null, ra.name), h('small', { style: { whiteSpace: 'normal' } }, ra.desc)), h('div', { class: 'r' }, 'Active')),
              ...RC.text.map((tx) => h('div', { class: 'row', style: { minHeight: '36px' } }, h('div', { class: 'ic' }, '•'), h('div', { class: 't' }, h('b', { style: { fontWeight: 600 } }, tx)), h('div', { class: 'r' }, 'Passive')))));
        }
      } else if (ui.heroTab === 'journey') {
          const nNew = loreUnread();
          b.append(h('div', { class: 'btn-row' },
            h('button', { class: 'btn' + (nNew ? '' : ' alt'), onclick: () => openLore() }, nNew ? `Lore Journal · ${nNew} new` : 'Lore Journal'),
            h('button', { class: 'btn alt', onclick: () => openTheater() }, 'Theater')));
        // Legends (v10): story, credit, and whether they join your groups
        for (const key in (D.LEGENDS || {})) {
          const L = D.LEGENDS[key], on = G.legendUnlocked(key);
          const started = Object.keys(P.done).concat(Object.keys(P.quests)).some((q) => D.QUESTS[q] && D.QUESTS[q].legend === key);
          b.append(h('div', { class: 'sec-h' }, 'Legend: ' + L.name, h('small', null, on ? (G.legendOn(key) ? 'joins your groups' : 'resting') : started ? 'story in progress' : 'not met yet')));
          const box = h('div', { class: 'ai-box' }, h('div', { class: 'row' }, h('div', { class: 'ic' }, img(art('icon', 'legend_' + key))), h('div', { class: 't' }, h('b', { style: { color: '#ff8000' } }, L.name), h('small', null, L.title))));
          if (on || started) {
            const open = ui.heroStory === key;
            if (open) for (const para of L.story) box.append(h('p', { style: { margin: '6px 0' } }, para));
            box.append(h('button', { class: 'chip', style: { marginTop: '6px' }, onclick: () => { ui.heroStory = open ? null : key; ui.sheetFn(); } }, open ? 'Hide story' : 'Read his story'));
          }
          else box.append(h('p', { style: { margin: '6px 0' } }, 'A high elf knight, said to have died five years ago, has been seen among the ashes of Silverleaf Lodge in the Arathi Highlands (level 37+).'));
          if (on) box.append(h('p', { class: 'ai-note' }, `${L.short} takes a ${L.role} slot in your groups (a damage slot if you are the ${L.role}), with his own abilities: ${L.abilities.map((a) => D.ABILITIES[a].name).join(' and ')}.`));
          box.append(h('p', { class: 'ai-note' }, L.credit));
          b.append(box);
          if (on) b.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => { G.setLegendOn(key, !G.legendOn(key)); ui.sheetFn(); } }, `${L.short} joins groups: ${G.legendOn(key) ? 'On' : 'Off'}`)));
        }
        const titles = D.TITLES.filter(G.titleUnlocked);
        b.append(h('div', { class: 'sec-h' }, 'Title', h('small', null, `${titles.length}/${D.TITLES.length} unlocked · ${G.account().marks} Mentor Marks`)));
        const tchips = h('div', { class: 'chips' }, h('button', { class: 'chip' + (!P.title ? ' gold' : ''), onclick: () => { G.setTitle(null); ui.sheetFn(); } }, 'None'));
        for (const t of titles) tchips.append(h('button', { class: 'chip' + (P.title === t.id ? ' gold' : ''), onclick: () => { G.setTitle(t.id); ui.sheetFn(); } }, G.titleName(t, P.name)));
        b.append(tchips);
        const nextT = D.TITLES.filter((t) => !G.titleUnlocked(t)).slice(0, 3);
        if (nextT.length) b.append(h('p', { class: 'ai-note' }, 'Still to earn: ' + nextT.map((t) => `${G.titleName(t, P.name)} (${t.how.toLowerCase()})`).join(' · ') + '.'));
        const pv = G.pvpStats();
        b.append(h('div', { class: 'sec-h' }, 'War Mode', h('small', null, G.S.flags.warMode ? '+10% experience and gold' : 'off')),
          h('div', { class: 'ai-box' }, h('div', { class: 'ai-row' }, h('span', null, 'Honor'), h('b', { class: 'tnum' }, String(pv.honor))),
            h('div', { class: 'ai-row' }, h('span', null, 'Enemy players defeated'), h('b', { class: 'tnum' }, `${pv.kills} · died ${pv.deaths} · escaped ${pv.escapes}`))),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => { G.setWarMode(!G.S.flags.warMode); ui.sheetFn(); } }, 'War Mode: ' + (G.S.flags.warMode ? 'On' : 'Off'))),
          h('p', { class: 'ai-note' }, P.level < 6 ? 'Enemy players start showing up from level 6.' : 'Enemy players show up now and then. Towns are rare and guarded; capitals and starting valleys are safe. Honor unlocks PvP titles (see Title).'));
      } else {
          b.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { if (G.fight) return toast('You are in combat.'); G.logout(); showSelect(); } }, 'Switch character')));
          if (window.UPD) b.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: manualUpdateCheck }, `Check for updates · v${UPD.current()}`)));
        // each setting folds to its header with the current value, so the page is a short list (all closed by default)
        { const ts = tipState(); b.append(...foldSec('set.tips', 'Tips', ts.off ? 'Off' : 'On', [h('div', { class: 'btn-row' },
          h('button', { class: 'btn alt', onclick: () => { ts.off = !ts.off; saveTips(ts); ui.sheetFn(); } }, 'Tips: ' + (ts.off ? 'Off' : 'On')),
          h('button', { class: 'btn alt', onclick: () => { saveTips({ seen: [], off: false }); toast('Tips will show again as you play.', true); ui.sheetFn(); } }, 'Show tips again'))])); }
        if (window.UPD) b.append(...foldSec('set.community', 'Community', 'Discord · report a bug', [h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => UPD.open(UPD.DISCORD) }, 'Join the Discord'), window.REPORT ? h('button', { class: 'btn alt', onclick: () => reportDialog() }, 'Report a bug') : null),
          h('p', { class: 'ai-note', style: { margin: 0 } }, 'Talk about the game, report bugs and suggest ideas.')]));
        b.append(...foldSec('set.invites', 'Party invites', G.S.flags.noInvites ? 'Off' : 'On', [h('div', { class: 'btn-row' },
          h('button', { class: 'btn alt', onclick: () => { G.setInvites(!!G.S.flags.noInvites); ui.sheetFn(); } }, 'Invites from nearby players: ' + (G.S.flags.noInvites ? 'Off' : 'On')))]));
        if (window.SND) {
          const pr = window.SND.prefs;
          b.append(...foldSec('set.sound', 'Sound', `Music ${pr.music ? 'on' : 'off'} · effects ${pr.sfx ? 'on' : 'off'}`, [h('div', { class: 'btn-row' },
            h('button', { class: 'btn alt', onclick: () => { window.SND.setPref('music', !pr.music); ui.sheetFn(); } }, 'Music: ' + (pr.music ? 'On' : 'Off')),
            h('button', { class: 'btn alt', onclick: () => { window.SND.setPref('sfx', !pr.sfx); ui.sheetFn(); } }, 'Effects: ' + (pr.sfx ? 'On' : 'Off')))]));
        }
        b.append(...foldSec('set.save', 'Save', 'save codes', [h('div', { class: 'btn-row' },
          h('button', { class: 'btn alt', onclick: exportSave }, 'Copy save code'),
          h('button', { class: 'btn alt', onclick: importSave }, 'Load save code'))]));

        b.append(h('button', { class: 'btn alt wide', style: { color: '#ff6a5a' }, onclick: () => { const S = G.S; confirmDeleteChar({ id: S.id, name: S.player.name, level: S.player.level, cls: S.player.cls }, () => showSelect()); } }, 'Delete character'));
      }
    });
  }
  // ---------- bank and auction house
  const TRADE_LABEL = { mat: 'Trade goods', potion: 'Potion', elixir: 'Elixir', stone: 'Sharpening stone', kit: 'Armor kit', bag: 'Bag', recipe: 'Recipe' };
  const itemRow = (it, n, right, onclick, sub) => h('button', { class: 'row', onclick },
    h('div', { class: 'ic' }, itemIcon(it)), h('div', { class: 't' }, h('b', { style: { color: (D.QUALITY[it.q || 1] || D.QUALITY[1]).color } }, it.name + (n > 1 ? ` ×${n}` : '')), h('small', null, sub || (it.lvl ? `Level ${it.lvl} ${D.SLOT_LABEL[it.slot] || it.slot}` : ''))), h('div', { class: 'r tnum' }, right || ''));
  function openBank() {
    openSheet('bank', 'Bank', `${G.BANK_SLOTS} slots · tap to move`, (b, title) => {
      const P = G.S.player; P.bank = P.bank || [];
      title.querySelector('small').textContent = `${P.bank.length}/${G.BANK_SLOTS} in the bank · ${P.bags.length}/${G.bagCap()} in your bags · tap to move`;
      b.append(h('div', { class: 'sec-h' }, 'In the bank', h('small', null, 'tap to take')));
      const bank = h('div', { class: 'list' }); P.bank.forEach((x, i) => bank.append(itemRow(x.item, x.n, '↑', () => { G.bankWithdraw(i); ui.sheetFn(); })));
      if (!P.bank.length) bank.append(h('div', { class: 'people' }, 'Empty. Keep gear sets, quest leftovers and heirlooms here.'));
      b.append(bank, h('div', { class: 'sec-h' }, 'Your bags', h('small', null, 'tap to store')));
      const bags = h('div', { class: 'list' }); P.bags.forEach((x, i) => bags.append(itemRow(x.item, x.n, '↓', () => { G.bankDeposit(i); ui.sheetFn(); })));
      b.append(bags);
    });
  }
  function openAuction() {
    ui.ahTab = ui.ahTab || 'browse';
    openSheet('auction', 'Auction House', ' ', (b, title) => {
      const P = G.S.player, S = G.S;
      title.querySelector('small').textContent = `Your money: ${G.moneyText(P.money)}`;
      const tab = (id, label) => h('button', { class: 'chip' + (ui.ahTab === id ? ' gold' : ''), onclick: () => { ui.ahTab = id; ui.sheetFn(); } }, label);
      b.append(h('div', { class: 'chips' }, tab('browse', 'Browse'), tab('sell', 'Sell'), tab('mine', `My auctions (${((S.ah && S.ah.mine) || []).length})`)));
      const list = h('div', { class: 'list' });
      if (ui.ahTab === 'browse') {
        for (const l of G.ahListings()) list.append(itemRow(l.item, l.n || 1, G.moneyText(l.price), () => showDialog([h('h3', null, `Buy ${l.item.name}?`), compareBlock ? compareBlock(l.item) : null, h('p', null, `From ${l.seller} for ${G.moneyText(l.price)}.`),
          h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.ahBuy(l.id); ui.sheetFn(); } }, 'Buy'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Cancel'))], true), (D.GEAR_SLOTS.includes(l.item.slot) ? `Level ${l.item.lvl} ${D.SLOT_LABEL[l.item.slot]} · ${l.seller}` : `${TRADE_LABEL[l.item.slot] || 'Trade goods'} · ${l.seller}`) + (G.isUpgrade(l.item) ? ' · ▲ upgrade' : '')));
        b.append(h('p', { class: 'ai-note' }, 'Listings from other players on the realm. New ones arrive every half hour.'));
      } else if (ui.ahTab === 'sell') {
        P.bags.forEach((x, i) => { if (!G.ahTrade(x.item)) return; const v = G.ahValue(x.item) * x.n;
          list.append(itemRow(x.item, x.n, G.moneyText(v), () => showDialog([h('h3', null, `Sell ${x.item.name}`), h('p', null, `Players usually pay about ${G.moneyText(v)}. Lower prices sell faster; much higher ones may not sell at all. The house takes 5%.`),
            h('div', { class: 'btn-row' }, ...[0.8, 1, 1.3, 1.6].map((f) => h('button', { class: 'btn' + (f === 1 ? '' : ' alt'), onclick: () => { closeDialog(); G.ahPost(i, Math.round(v * f)); ui.sheetFn(); } }, G.moneyText(Math.round(v * f))))),
            h('button', { class: 'btn alt wide', onclick: closeDialog }, 'Cancel')], true), `Vendor pays ${G.moneyText((x.item.sell || 0) * x.n)}`)); });
        if (!list.children.length) list.append(h('div', { class: 'people' }, 'Nothing in your bags to sell. Gear, trade goods, potions and bags can go up for auction.'));
      } else {
        ((S.ah && S.ah.mine) || []).forEach((a, i) => list.append(itemRow(a.item, a.n || 1, G.moneyText(a.price), () => showDialog([h('h3', null, `Cancel your auction of ${a.item.name}?`), h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.ahCancel(i); ui.sheetFn(); } }, 'Cancel auction'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Keep'))], true), `Posted ${Math.max(1, Math.round((Date.now() - a.postedAt) / 60000))} min ago · ${Math.max(0, Math.round((a.expires - Date.now()) / 3600000))}h left`)));
        if (!list.children.length) list.append(h('div', { class: 'people' }, 'You have no auctions. Post gear from the Sell tab; it sells while you play or while you are away.'));
      }
      b.append(list);
    });
  }
  // ---------- professions (v3): trainer, then a sheet per profession with its recipes
  const SKILL_COL = ['#ff4040', '#ff8040', '#ffff00', '#40bf40', '#808080']; // too hard, orange, yellow, green, grey
  function profBar(p) { return h('div', { class: 'bar thin', style: { marginTop: '4px' } }, h('i', { style: { width: Math.round(p.skill / p.max * 100) + '%', background: '#4f9a4a' } })); }
  function trainerBlock(b) {
    const P = G.S.player, profs = G.profs(), n = Object.keys(profs).length;
    b.append(h('div', { class: 'sec-h' }, 'Professions', h('small', null, `${n}/${D.PROF_MAX} learned`)));
    const list = h('div', { class: 'list' });
    for (const id in D.PROFESSIONS) {
      const Pd = D.PROFESSIONS[id], p = profs[id], R = G.nextRank(id);
      const sub = p ? `${p.skill}/${p.max} · ` + (R ? (R.ok ? `${R.name} training: ${G.moneyText(R.cost)}` : P.level < R.lvl ? `${R.name} at level ${R.lvl}` : `${R.name} at skill ${R.skill}`) : 'fully trained for now')
        : (n >= D.PROF_MAX ? 'Unlearn a profession to learn this' : P.level < R.lvl ? `From level ${R.lvl}` : `${Pd.desc} Training: ${G.moneyText(R.cost)}.`);
      list.append(h('button', { class: 'row', disabled: !R || !R.ok || (!p && n >= D.PROF_MAX), onclick: () => { G.trainProf(id); ui.sheetFn(); } },
        h('div', { class: 'ic' }, img(art('icon', Pd.icon))),
        h('div', { class: 't' }, h('b', { style: { color: p ? '#ffd100' : 'var(--text)' } }, Pd.name + (p ? ` (${D.PROF_RANKS[G.profRank(id)].name})` : '')), h('small', { style: { whiteSpace: 'normal' } }, sub)),
        h('div', { class: 'r' }, R && R.ok && (p || n < D.PROF_MAX) ? 'Train' : '')));
    }
    b.append(list, h('p', { class: 'ai-note' }, 'Gatherers find ore and herbs in the Fight tab and on the scene. Skinning happens as you loot beasts. Craft from Hero → Professions. Mining pairs with Blacksmithing, Herbalism with Alchemy, Skinning with Leatherworking; Tailoring uses the cloth humanoids drop.'));
  }
  function stableBlock(b) {
    const P = G.S.player;
    b.append(h('div', { class: 'sec-h' }, 'Riding', h('small', null, P.riding ? 'you can ride' : `from level ${D.RIDING.lvl}`)));
    if (!P.riding) b.append(h('button', { class: 'btn wide', disabled: P.level < D.RIDING.lvl || P.money < D.RIDING.cost, onclick: () => { G.learnRiding(); ui.sheetFn(); } },
      P.level < D.RIDING.lvl ? `Riding at level ${D.RIDING.lvl} · ${G.moneyText(D.RIDING.cost)}` : `Learn Riding · ${G.moneyText(D.RIDING.cost)}`));
    const list = h('div', { class: 'list' });
    for (const [k, M] of Object.entries(D.MOUNTS)) {
      if (M.faction !== G.myFaction()) continue;
      const owned = (P.mounts || []).includes(k);
      list.append(h('button', { class: 'row', disabled: !owned && !P.riding, onclick: () => { G.buyMount(k); ui.sheetFn(); } },
        h('div', { class: 'ic' }, img(art('icon', 'mount_' + k))),
        h('div', { class: 't' }, h('b', { style: { color: D.QUALITY[1].color } }, M.name), h('small', null, owned ? (P.mount === k ? 'Riding this one' : 'Owned · tap to ride') : `${D.RACES[M.race].name} mount · every road 40% faster`)),
        h('div', { class: 'r' }, owned ? '' : G.moneyText(M.cost))));
    }
    b.append(list, h('p', { class: 'ai-note' }, 'Boats, zeppelins, gryphons and the tram keep their own time.'));
  }
  function openProfessions() {
    ui.profTab = ui.profTab || null;
    openSheet('profs', 'Professions', ' ', (b, title) => {
      const P = G.S.player, profs = G.profs(), ids = Object.keys(profs);
      title.querySelector('small').textContent = ids.length ? `${ids.length}/${D.PROF_MAX} · craft anywhere out of combat` : 'Learn up to two from a profession trainer';
      if (!ids.length) { b.append(h('p', null, 'You have no professions yet. Profession trainers wait in every capital and in Sentinel Hill and the Crossroads.')); return; }
      if (!ids.includes(ui.profTab)) ui.profTab = ids.find((k) => D.PROFESSIONS[k].kind === 'craft') || ids.find((k) => k === 'mining') || ids[0];
      b.append(h('div', { class: 'chips' }, ...ids.map((k) => h('button', { class: 'chip' + (k === ui.profTab ? ' gold' : ''), onclick: () => { ui.profTab = k; ui.sheetFn(); } }, img(art('icon', D.PROFESSIONS[k].icon)), ' ', D.PROFESSIONS[k].name, h('small', null, `${profs[k].skill}/${profs[k].max}`)))));
      const k = ui.profTab, Pd = D.PROFESSIONS[k], p = profs[k];
      b.append(h('div', { class: 'people' }, Pd.desc), profBar(p));
      const recipes = G.recipesFor(k);
      if (k === 'herbalism' || k === 'skinning') {
        const rows = k === 'herbalism' ? Object.entries(D.NODES).filter(([, N]) => N.prof === 'herbalism').map(([key, N]) => [N.name, N.skill, G.nodeSk(N), N.item]) : [[1, 10], [15, 50], [20, 100], [25, 125]].map(([l, sk]) => [`Beasts level ${l}`, sk, [sk, sk + 25, sk + 50, sk + 100], D.skinLeather(l)]);
        const list = h('div', { class: 'list' });
        for (const [name, need, sk, item] of rows) { const col = G.skillColor(p.skill, sk); list.append(h('div', { class: 'row' }, h('div', { class: 'ic' }, img(art('icon', D.ITEMS[item].icon))), h('div', { class: 't' }, h('b', { style: { color: SKILL_COL[col + 1] } }, name), h('small', null, `Needs ${need} · gives ${D.ITEMS[item].name}`)), h('div', { class: 'r' }, '')));
        }
        b.append(h('div', { class: 'sec-h' }, k === 'herbalism' ? 'What you can pick' : 'What you can skin', h('small', null, 'orange always raises your skill, yellow often, green rarely, grey never')), list);
        return;
      }
      const list = h('div', { class: 'list' });
      for (const r of recipes) {
        const mk = D.ITEMS[r.makes], col = G.skillColor(p.skill, r.sk), can = G.craftable(r.id);
        const mats = Object.entries(r.mats).map(([m, n]) => `${D.ITEMS[m].name} ${G.countItem(m)}/${n}`).join(' · ');
        list.append(h('button', { class: 'row', onclick: () => showDialog([itemTip(G.copyItem(r.makes)), h('p', { class: 'ai-note' }, `Needs: ${mats}`),
          col < 0 ? h('p', { class: 'red' }, `Requires ${Pd.name} ${r.sk[0]}.`) : h('div', { class: 'btn-row' }, h('button', { class: 'btn', disabled: can < 1, onclick: () => { closeDialog(); G.craft(r.id, 1); closeSheet(); } }, 'Create'), h('button', { class: 'btn alt', disabled: can < 2, onclick: () => { closeDialog(); G.craft(r.id, can); closeSheet(); } }, `Create all (${can})`), h('button', { class: 'btn alt', onclick: closeDialog }, 'Close'))], true) },
          h('div', { class: 'ic' }, itemIcon(mk)),
          h('div', { class: 't' }, h('b', { style: { color: SKILL_COL[col + 1] } }, mk.name + (r.n > 1 ? ` ×${r.n}` : '')), h('small', { style: { whiteSpace: 'normal' } }, col < 0 ? `Needs skill ${r.sk[0]}` : mats)),
          h('div', { class: 'r' }, can ? String(can) : '')));
      }
      b.append(h('div', { class: 'sec-h' }, k === 'mining' ? 'Smelting' : 'Recipes', h('small', null, 'orange always raises your skill, yellow often, green rarely, grey never')), list);
      if (k === 'mining') b.append(h('p', { class: 'ai-note' }, 'Ore veins appear in the wild: look in the Fight tab. Copper in the starting zones, tin from about level 10, silver is rare.'));
      else b.append(h('p', { class: 'ai-note' }, 'Rare plans, patterns and recipes drop from dungeon bosses and named rares. Materials sell on the auction house.'));
    });
  }
  // ---------- talents: three trees, tap a talent to spend a point
  const talentText = (t, rank) => t.desc.replace('{v}', String(Math.round(t.fx[0].v * Math.max(1, rank) * 100) / 100));
  function openTalents() {
    ui.talentTree = ui.talentTree || null;
    openSheet('talents', 'Talents', ' ', (b, title) => {
      const P = G.S.player, trees = D.TALENTS[P.cls], tp = G.talentPoints(P);
      if (!ui.talentTree || !trees.some((t) => t.id === ui.talentTree)) ui.talentTree = (trees.slice().sort((x, y) => G.treeSpent(P, y.id) - G.treeSpent(P, x.id))[0] || trees[0]).id;
      title.querySelector('small').textContent = P.level < D.TALENT_START ? `Your first point comes at level ${D.TALENT_START}` : `${tp.free} to spend · ${tp.spent}/${tp.total} spent · 1 point per level`;
      const tabs = h('div', { class: 'chips' });
      for (const tree of trees) tabs.append(h('button', { class: 'chip' + (tree.id === ui.talentTree ? ' gold' : ''), onclick: () => { ui.talentTree = tree.id; ui.sheetFn(); } }, img(abIcon(tree.icon)), ' ', tree.name, h('small', null, String(G.treeSpent(P, tree.id)))));
      b.append(tabs);
      const tree = trees.find((t) => t.id === ui.talentTree), spent = G.treeSpent(P, tree.id);
      for (const tier of [1, 2, 3]) {
        const need = D.TALENT_TIER_POINTS[tier], open = spent >= need;
        b.append(h('div', { class: 'sec-h' }, `Tier ${tier}`, h('small', null, open ? (tier > 1 ? 'open' : '') : `needs ${need} points in ${tree.name} (${spent}/${need})`)));
        const list = h('div', { class: 'list talents' });
        for (const t of tree.talents.filter((x) => x.tier === tier)) {
          const r = (P.talents || {})[t.id] || 0, why = G.canLearnTalent(P, t.id);
          list.append(h('button', { class: 'row talent' + (r ? ' has' : '') + (!open ? ' off' : '') + (r >= t.ranks ? ' max' : ''), onclick: () => { if (why) return toast(why); G.learnTalent(t.id); ui.sheetFn(); if (window.SND) window.SND.play('quest_accept', { vol: 0.5 }); } },
            h('div', { class: 'ic' }, img(abIcon(t.icon))),
            h('div', { class: 't' }, h('b', null, t.name),
              h('small', { style: { whiteSpace: 'normal' } }, r ? talentText(t, r) : talentText(t, 1)),
              r && r < t.ranks ? h('small', { class: 'next', style: { whiteSpace: 'normal' } }, 'Next rank: ' + talentText(t, r + 1)) : null),
            h('div', { class: 'r tnum rank' }, `${r}/${t.ranks}`)));
        }
        b.append(list);
      }
      const cost = G.respecCost();
      b.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', disabled: !tp.spent, onclick: () => showDialog([h('h3', null, 'Reset talents?'), h('p', null, `All ${tp.spent} points come back to spend again. ${cost ? `This costs ${G.moneyText(cost)}.` : 'The first reset is free.'}`),
        h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); G.resetTalents(); ui.sheetFn(); } }, 'Reset'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Cancel'))], true) }, cost ? `Reset (${G.moneyText(cost)})` : 'Reset (free)')));
    });
  }
  function exportSave() {
    const ta = h('textarea', { readonly: true, style: { width: '100%', height: '120px', background: '#0c0906', color: 'var(--text)', border: '1px solid #5c4526', fontSize: '12px' } });
    const note = h('p', { class: 'ai-note', style: { margin: 0 } }, 'Preparing your code...');
    const copy = h('button', { class: 'btn', disabled: true }, 'Copy');
    // the same code as a file: shared through Android's share sheet in the app, downloaded in a browser
    const file = h('button', { class: 'btn alt', disabled: true }, window.SAVEFILE && SAVEFILE.inApp() ? 'Share file' : 'Save file');
    showDialog([h('h3', null, 'Save code'), h('p', null, 'Keep this somewhere safe, or send it to yourself. Load it back with Load save code, in the app or a browser. A file is the safest way to send it.'), ta, note,
      h('div', { class: 'btn-row' }, copy, window.SAVEFILE ? file : null), h('button', { class: 'btn alt wide', onclick: closeDialog }, 'Close')]);
    G.exportSave().then((code) => {
      ta.value = code; copy.disabled = false; file.disabled = false;
      const P = G.S.player, name = `${P.name}-level${P.level}.azsave`;
      file.onclick = () => SAVEFILE.save(name, code).then(() => { if (!SAVEFILE.inApp()) toast(`Saved ${name}`, true); }, (e) => toast('Could not save the file: ' + ((e && e.message) || 'error')));
      note.textContent = `${code.length.toLocaleString()} characters. Copy all of it.`;
      copy.onclick = () => { ta.select(); try { navigator.clipboard.writeText(code).then(() => toast('Copied', true), () => { document.execCommand('copy'); toast('Copied', true); }); } catch (e) { document.execCommand('copy'); } };
    }, () => { note.textContent = 'Could not make a code on this device.'; });
  }
  function importSave() {
    const ta = h('textarea', { style: { width: '100%', height: '120px', background: '#0c0906', color: 'var(--text)', border: '1px solid #5c4526', fontSize: '12px' }, placeholder: 'Paste your save code' });
    const err = h('p', { style: { color: '#ff6a5a' } });
    const doLoad = async () => {
      load.disabled = true; err.textContent = '';
      try { const id = await G.importSave(ta.value); closeDialog(); closeSheet(); enter(id); toast('Save loaded as a new character', true); }
      catch (e) { err.textContent = (e && e.message) || 'That code did not work. Copy the whole code and try again.'; load.disabled = false; }
    };
    const load = h('button', { class: 'btn', onclick: doLoad }, 'Load');
    const fromFile = window.SAVEFILE ? h('button', { class: 'btn alt', onclick: () => {
      err.textContent = '';
      SAVEFILE.pick().then((text) => { if (text == null) return; ta.value = text; doLoad(); }, (e) => { err.textContent = 'Could not read that file: ' + ((e && e.message) || 'error'); });
    } }, 'Load from file') : null;
    showDialog([h('h3', null, 'Load save code'), h('p', null, 'Paste a code, or pick a save file, from Hero → Settings → Copy save code in the app or another browser. It is added as a new character; your others stay.'), ta, err,
      h('div', { class: 'btn-row' }, load, fromFile), h('button', { class: 'btn alt wide', onclick: closeDialog }, 'Cancel')]);
  }
  function confirmDelete() {
    showDialog([h('h3', null, 'Delete ' + G.S.player.name + '?'), h('p', null, 'Your character, gear and quests are gone for good. Copy your save code first if you might want it back.'),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { G.wipeSave(); closeDialog(); closeSheet(); showCreate(); } }, 'Delete'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Keep'))]);
  }

  // ---------- social: group finder, chat, news, guild
  function openSocial(tab) {
    ui.socialTab = tab || ui.socialTab || 'group';
    openSheet('social', 'Social', `${D.REALM} · ${B.onlineCount(G.S, new Date())} players online`, (b) => {
      const tabs = h('div', { class: 'tabs' });
      for (const [k, label] of [['group', 'Group Finder'], ['chat', 'Chat'], ['news', 'Realm News'], ['guild', 'Guild']]) tabs.append(h('button', { class: ui.socialTab === k ? 'on' : '', onclick: () => { ui.socialTab = k; ui.sheetFn(); } }, label));
      // pinned, so you can switch tabs even when the chat is scrolled to the newest line
      ui.socialHead = h('div', { class: 'sheet-stick' }, tabs);
      b.append(ui.socialHead);
      if (ui.socialTab === 'group') groupTab(b);
      else if (ui.socialTab === 'chat') chatTab(b);
      else if (ui.socialTab === 'news') newsTab(b);
      else guildTab(b);
    });
  }
  function groupTab(b) {
    const S = G.S, P = S.player;
    if (S.run) { b.append(h('p', null, `You are in a group for ${S.run.name}.`), h('button', { class: 'btn alt wide', onclick: () => confirmLeaveGroup(() => ui.sheetFn && ui.sheetFn()) }, 'Leave group')); return; }
    // Help Wanted: groups that need a helper; they summon you
    const hw = (S.helpWanted || []).filter((r) => r.expires > Date.now());
    b.append(h('div', { class: 'sec-h' }, 'Help Wanted', h('small', null, `Mentor Marks: ${G.account().marks}`)));
    if (!hw.length) b.append(h('div', { class: 'people' }, 'No group needs help right now. Groups post here now and then for dungeons you have cleared or outlevelled. They summon you, wherever you are.'));
    for (const r of hw) {
      const A = D.ACTIVITIES[r.act], Dg = D.DUNGEONS[A.dungeon];
      const marks = `${10 + (r.firstTimers ? 5 : 0) + (r.startIdx ? 3 : 0)}–${15 + (r.firstTimers ? 5 : 0) + (r.startIdx ? 3 : 0)} Marks`;
      b.append(h('div', { class: 'row hw', style: { gridTemplateColumns: '34px 1fr auto' } },
        h('div', { class: 'ic mob' }, img(mobArt(A.boss || finalBoss(A) || 'vancleef'))),
        h('div', { class: 't' }, h('b', null, `${A.name} needs a ${r.role === 'dps' ? 'damage dealer' : r.role}`),
          h('small', { style: { whiteSpace: 'normal' } }, `${r.posterName}: ${r.startIdx ? 'stuck on ' + Dg.pulls[r.startIdx].label : 'full run'}${r.firstTimers ? ' · first-timers' : ''} · ${marks} · ${Math.ceil((r.expires - Date.now()) / 60000)} min left`)),
        h('button', { class: 'chip gold', disabled: !!S.queue, onclick: () => { closeSheet(); G.joinHelpWanted(r.id); renderAll(); } }, 'Help')));
    }
    // Daily Roulette
    const rr = G.rouletteReady(), ropts = G.rouletteOptions();
    b.append(h('div', { class: 'sec-h' }, 'Dungeon Roulette', h('small', null, rr ? 'once a day' : 'done today')),
      h('div', { class: 'row', style: { gridTemplateColumns: '1fr auto' } },
        h('div', { class: 't' }, h('b', null, 'A random dungeon, with bonus rewards'), h('small', { style: { whiteSpace: 'normal' } }, ropts.length ? `+15 Mentor Marks, a bonus blue and gold on top of the usual loot. Picks one of ${ropts.length} dungeon${ropts.length > 1 ? 's' : ''} you can reach.` : 'Reach a dungeon\'s level to join.')),
        h('button', { class: 'chip gold', disabled: !rr || !ropts.length || !!S.queue, onclick: () => { closeSheet(); G.startRoulette(); renderAll(); } }, rr ? 'Go' : 'Tomorrow')));
    b.append(h('div', { class: 'sec-h' }, 'Group Finder', h('small', null, 'queue from the zone')));
    for (const k in D.ACTIVITIES) {
      const A = D.ACTIVITIES[k];
      const why = G.activityBlock(k);
      if (why === 'hidden') continue; // the other faction's world elites
      const queued = S.queue && S.queue.act === k;
      const synced = !why && P.level > A.maxLvl ? ` · you are synced to level ${A.maxLvl}` : '';
      b.append(h('div', { class: 'row', style: { gridTemplateColumns: '34px 1fr auto' } },
        h('div', { class: 'ic mob' }, img(mobArt(A.boss || finalBoss(A) || 'vancleef'))),
        h('div', { class: 't' }, h('b', null, A.name, h('span', { style: { color: 'var(--muted)', fontWeight: 400 } }, `  ${A.minLvl}–${A.maxLvl}`)), h('small', { style: why ? { color: '#ff8a6a' } : null }, why || A.desc + synced)),
        queued ? h('button', { class: 'chip', onclick: () => { G.leaveQueue(); ui.sheetFn(); } }, 'Leave') : h('button', { class: 'chip gold', disabled: !!why || !!S.queue, onclick: () => { G.queueFor(k); ui.sheetFn(); } }, 'Queue')));
    }
    if (G.roles().length > 1) {
      const rr = h('div', { class: 'btn-row' });
      for (const r of G.roles()) rr.append(h('button', { class: 'btn' + (G.role() === r ? '' : ' alt'), disabled: !!S.queue, onclick: () => { G.setRole(r); ui.sheetFn(); } }, r === 'tank' ? 'Tank' : r === 'healer' ? 'Healer' : 'Damage'));
      b.append(h('div', { class: 'sec-h' }, 'Your role'), rr);
    }
    b.append(h('p', { style: { color: 'var(--muted)', fontSize: '13px', margin: 0 } }, `You queue as ${G.role() === 'tank' ? 'a Tank' : G.role() === 'healer' ? 'a Healer' : 'Damage'}. Tanks and healers get groups faster.`));
  }
  // a dungeon's picture in the group finder is its last boss
  function finalBoss(A) {
    const Dg = A.dungeon && D.DUNGEONS[A.dungeon]; if (!Dg) return null;
    const bosses = Dg.pulls.filter((p) => p.boss); const last = bosses[bosses.length - 1];
    return last ? last.mobs[0] : null;
  }
  function chatTab(b) {
    const tabs = h('div', { class: 'tabs' });
    const p = chatPrefs();
    const nReq = G.S.chat.filter(isOpenReq).length;
    tabs.append(h('button', { class: p.active === 'requests' ? 'on' : '', onclick: () => setChatTab('requests') }, nReq ? `Requests (${nReq})` : 'Requests'));
    p.tabs.forEach((tab, i) => tabs.append(h('button', { class: p.active === i ? 'on' : '', onclick: () => setChatTab(i) }, tab.name)));
    tabs.append(h('button', { class: 'tab-edit', onclick: () => editChatTabs(), 'aria-label': 'Edit chat tabs' }, 'Edit'));
    (ui.socialHead && ui.socialHead.isConnected ? ui.socialHead : b).append(tabs);
    ui.chatLog = h('div', { class: 'chat-full', onclick: (e) => { const ln = e.target.closest('.ln.tap'); const m = ln && G.S.chat.find((x) => String(x.id) === ln.dataset.mid); if (m) msgDialog(m); } });
    b.append(ui.chatLog);
    refreshChatLog();
    const sel = h('select', { id: 'chat-ch', 'aria-label': 'Channel' }, ...[['say', 'Say'], ['general', 'General'], ['lfg', 'LFG'], ['party', 'Party'], ['guild', 'Guild'], ['whisper', 'Reply']].map(([v, l]) => { const o = h('option', { value: v }, l); if (v === ui.chatCh) o.selected = true; return o; }));
    sel.addEventListener('change', () => { ui.chatCh = sel.value; });
    const inp = h('input', { id: 'chat-in', type: 'text', placeholder: 'Say something...', maxlength: '180', autocomplete: 'off' });
    const send = () => { const t = inp.value; if (!t.trim()) return; if (ui.chatCh === 'whisper' && !G.S.lastWhisper) { toast('Nobody has whispered you yet.'); return; } G.say(ui.chatCh, t); const last = G.S.chat[G.S.chat.length - 1]; if (ui.chatCh === 'whisper') last.to = G.S.lastWhisper; inp.value = ''; refreshChatLog(); renderChat(); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    b.append(h('div', { class: 'chatbox' }, sel, inp, h('button', { class: 'btn', onclick: send }, 'Send')));
    setTimeout(() => { ui.sheetBody.scrollTop = ui.sheetBody.scrollHeight; }, 0);
  }
  function refreshChatLog() {
    if (!ui.chatLog || !ui.chatLog.isConnected) return;
    const f = chatPrefs().active;
    const msgs = G.S.chat.filter(chatFilter(f)).slice(-80);
    const atBottom = ui.sheetBody.scrollHeight - ui.sheetBody.scrollTop - ui.sheetBody.clientHeight < 60;
    ui.chatLog.innerHTML = msgs.map(chatLineHtml).join('') || `<div class="ln" style="color:var(--muted)">${f === 'requests' ? 'No open requests. They show up in LFG, whispers, General and guild chat.' : 'Nothing here yet.'}</div>`;
    if (atBottom) ui.sheetBody.scrollTop = ui.sheetBody.scrollHeight;
  }
  function newsTab(b) {
    const S = G.S;
    const list = h('div', { class: 'news' });
    const items = S.news.slice(0, 30);
    if (!items.length) list.append(h('div', null, 'Quiet so far. News appears here while you are away.'));
    for (const n of items) list.append(h('div', { class: n.big ? 'big' : '' }, h('time', null, new Date(n.t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })), n.text));
    const top = S.bots.slice().sort((a, b2) => b2.level - a.level || b2.xpf - a.xpf).slice(0, 8);
    b.append(h('div', { class: 'sec-h' }, 'Highest level on ' + D.REALM), h('div', { class: 'people', html: top.map((x) => `<span class="cls-${x.cls}">${esc(x.name)}</span> ${x.level}`).join(' · ') }));
    b.append(h('div', { class: 'sec-h' }, 'News'), list);
  }
  // ---------- a chat message: what it asks for, linked items, and quick replies (v9.5, src/social.js)
  function linkedItems(m) {
    const out = [];
    if (m.act && m.act.itemData) out.push(m.act.itemData);
    else if (m.act && m.act.item && D.ITEMS[m.act.item]) out.push(D.ITEMS[m.act.item]);
    const re = /\[\[\d\|([^\]]+)\]\]/g; let x;
    while ((x = re.exec(m.text))) { const name = x[1]; if (out.some((it) => it.name === name)) continue; const id = Object.keys(D.ITEMS).find((k) => D.ITEMS[k].name === name); if (id) out.push(D.ITEMS[id]); }
    return out;
  }
  function msgDialog(m) {
    // a nudge or goodbye ("still up for it?") opens the request it belongs to
    if (m.ref && !m.act) { const orig = G.S.chat.find((x) => x.id === m.ref); if (orig) m = orig; }
    const a = m.act;
    const ch = D.CHANNELS[m.ch] || D.CHANNELS.system;
    const who = m.me ? 'You' : m.from || ch.label || 'System';
    const parts = [h('h3', null, m.ch === 'whisper' ? `${who} whispers` : `${who}${ch.label ? ' · ' + ch.label : ''}`), h('p', { html: richText(m.text) })];
    for (const it of linkedItems(m).slice(0, 2)) parts.push(itemTip(it));
    if (a && a.state !== 'open') parts.push(h('p', { class: 'ai-note' }, a.state === 'done' ? 'Done.' : a.state === 'declined' ? 'You said no.' : 'This has expired.'));
    if (a && a.kind === 'help_kill' && a.accepted) parts.push(h('p', { class: 'ai-note' }, `${a.got}/${a.n} ${D.MOBS[a.mob].name} at ${D.PLACES[a.place].name}.`));
    const acts = window.SOC ? SOC.actions(m) : [];
    if (acts.length) {
      const row = h('div', { class: 'btn-row wrap' });
      for (const x of acts) row.append(h('button', { class: 'btn' + (x.primary ? '' : ' alt'), disabled: !!x.disabled, onclick: () => {
        const r = x.fn(); closeDialog(); renderAll();
        if (typeof r === 'string' && r.startsWith('route:')) { const to = r.slice(6); if (G.S.player.place !== to) routeDialog(to); }
        else if (r) toast(r);
      } }, x.label));
      parts.push(row);
    }
    const reps = window.SOC && !(a && a.state === 'open' && a.kind !== 'chat') && !(a && (m.ch === 'lfg' || m.ch === 'general')) ? SOC.replies(m) : [];
    if (reps.length) {
      parts.push(h('div', { class: 'sec-h' }, 'Reply', h('small', null, reps[0].ch === 'whisper' ? 'as a whisper' : 'in ' + reps[0].ch)));
      parts.push(h('div', { class: 'chips' }, ...reps.map((r) => h('button', { class: 'chip', onclick: () => { r.fn(); closeDialog(); renderChat(); } }, r.label))));
    }
    parts.push(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: closeDialog }, 'Close')));
    showDialog(parts, true);
  }

  function guildTab(b) {
    const S = G.S, P = S.player;
    if (P.guild < 0) {
      const ap = S.soc && S.soc.applied && S.soc.applied.until > Date.now() ? S.soc.applied : null;
      b.append(h('p', null, ap ? `You applied to <${B.GUILDS[ap.g]}>. An officer will answer soon.` : 'You are not in a guild. Pick one and apply, or watch General for recruiters.'));
      b.append(h('div', { class: 'sec-h' }, 'Guilds', h('small', null, (D.RACES[P.race] || {}).faction === 'horde' ? 'Horde' : 'Alliance')));
      for (const gi of SOC.myGuilds()) {
        const ok = P.level >= gi.min;
        b.append(h('div', { class: 'row', style: { gridTemplateColumns: '1fr auto' } },
          h('div', { class: 't' }, h('b', null, '<' + gi.name + '>'), h('small', { style: { whiteSpace: 'normal' } }, `${gi.style[0].toUpperCase() + gi.style.slice(1)} · ${gi.members} members, ${gi.online} online · level ${gi.min}+. ${gi.blurb}`)),
          h('button', { class: 'chip gold', disabled: !!ap || !ok, onclick: () => { SOC.apply(gi.g); ui.sheetFn(); } }, ok ? 'Apply' : `Level ${gi.min}+`)));
      }
      return;
    }
    const gi = SOC.guildInfo(P.guild), st = SOC.standing(), r = SOC.rank(), R = SOC.RANKS, nx = R[r + 1];
    const mates = S.bots.filter((x) => x.guild === P.guild);
    const on = mates.filter((x) => B.isOnline(x, new Date()));
    b.append(h('div', { class: 'sec-h' }, '<' + gi.name + '>', h('small', null, `${gi.style} · ${on.length} of ${mates.length} online`)));
    b.append(h('div', { class: 'ai-box' },
      h('div', { class: 'ai-row' }, h('span', null, 'Your rank'), h('b', null, R[r].name)),
      h('div', { class: 'ai-row' }, h('span', null, 'Guild standing'), h('b', { class: 'tnum' }, nx ? `${st} / ${nx.at}` : String(st))),
      h('div', { class: 'xpbar', style: { height: '6px', background: '#1a140c', borderRadius: '3px', overflow: 'hidden', margin: '6px 0' } }, h('i', { style: { display: 'block', height: '100%', width: (nx ? Math.min(100, Math.round((st - R[r].at) / (nx.at - R[r].at) * 100)) : 100) + '%', background: 'var(--gold)' } })),
      h('p', { class: 'ai-note', style: { margin: 0 } }, 'Perks: ' + (R.slice(1, r + 1).map((k) => k.perk).join(' · ') || 'none yet') + (nx ? `. Next, ${nx.name}: ${nx.perk}.` : '.')),
      h('p', { class: 'ai-note', style: { margin: '4px 0 0' } }, 'Earn standing by helping guildmates: their requests appear in guild chat. Tap one to help.')));
    b.append(h('p', { style: { margin: 0, fontStyle: 'italic', color: '#c9b88a' } }, 'Message of the day: ' + SOC.motd(P.guild)));
    const wk = SOC.week();
    if (wk) b.append(h('div', { class: 'ai-box' },
      h('div', { class: 'ai-row' }, h('span', null, 'Weekly goal'), h('b', { class: 'tnum' }, wk.done ? 'Done!' : `${Math.min(wk.got, wk.goal)} / ${wk.goal}`)),
      h('div', { style: { height: '6px', background: '#1a140c', borderRadius: '3px', overflow: 'hidden', margin: '6px 0' } }, h('i', { style: { display: 'block', height: '100%', width: Math.min(100, Math.round(wk.got / wk.goal * 100)) + '%', background: wk.done ? '#6b8f3a' : 'var(--gold)' } })),
      h('p', { class: 'ai-note', style: { margin: 0 } }, `The guild wants ${wk.goal} ${wk.what} this week. Everything you do counts. Reward: gold and +100 standing.`)));
    const reqs = S.chat.filter((m) => m.act && m.act.guild && m.act.state === 'open').slice(-6).reverse();
    b.append(h('div', { class: 'sec-h' }, 'Guild requests', h('small', null, reqs.length ? 'tap to help' : 'none right now')));
    for (const m of reqs) b.append(h('button', { class: 'row', style: { gridTemplateColumns: '1fr auto', textAlign: 'left' }, onclick: () => msgDialog(m) }, h('div', { class: 't' }, h('b', { class: 'cls-' + (m.cls || '') }, m.from), h('small', { html: richText(m.text), style: { whiteSpace: 'normal' } })), h('span', { class: 'chip gold' }, 'Help')));
    b.append(h('div', { class: 'sec-h' }, 'Online'));
    b.append(h('div', { class: 'list' }, ...on.slice(0, 30).map((x) => h('div', { class: 'row', style: { minHeight: '36px' } }, h('div', { class: 'ic' }, img(art('portrait', looks(x)))), h('div', { class: 't' }, h('b', { class: 'cls-' + x.cls }, x.name), h('small', null, `Level ${x.level} ${D.CLASSES[x.cls].name}`))))));
    b.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn alt', onclick: () => showDialog([h('h3', null, `Leave <${gi.name}>?`), h('p', null, 'Your guild standing resets to zero.'), h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { SOC.leaveGuild(); closeDialog(); ui.sheetFn && ui.sheetFn(); } }, 'Leave'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Stay'))], true) }, 'Leave guild')));
  }


  // ---------- loot rolls
  // After a roll: a card with every player's choice and roll, counting up one by one, then the winner. The next roll
  // prompt waits behind it, and its timer is held for as long as the card shows (G.holdRolls).
  function showRollCard() {
    const d = (ui.rollQueue || []).shift(); if (!d) return;
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const order = d.entries.slice().sort((a, b) => (a.c === 'pass') - (b.c === 'pass'));
    const STEP = calm ? 0 : order.length > 6 ? 150 : 320, COUNT = calm ? 0 : 650, SHOW = order.length > 6 ? 3400 : 2800; // a raid reveals faster and stays a little longer
    const total = order.length * STEP + COUNT + SHOW;
    G.holdRolls(total + 400);
    if (ui.rollEl) { ui.rollEl.remove(); ui.rollEl = null; }
    const head = h('div', { class: 'rc-head' }, 'Rolling...');
    const rows = order.map((e) => {
      const num = h('b', { class: 'tnum' }, e.c === 'pass' ? '' : '0');
      const row = h('div', { class: 'rc-row' + (e.me ? ' me' : '') },
        h('span', { class: 'rc-name' + (e.m && e.m.cls ? ' cls-' + e.m.cls : e.me ? ' cls-' + G.S.player.cls : '') }, e.me ? 'You' : e.name),
        h('span', { class: 'rc-c rc-' + e.c }, e.c === 'need' ? 'Need' : e.c === 'greed' ? 'Greed' : 'Pass'), num);
      row._e = e; row._num = num; return row;
    });
    const it = d.item;
    const card = h('div', { class: 'rollcard', onclick: closeRollCard },
      h('div', { class: 'rc-item' }, itemIcon(it, 'rollic'), h('div', null, h('div', { class: 'q' + it.q, style: { fontWeight: 800 } }, it.name), head)),
      h('div', { class: 'rc-rows' }, ...rows), h('div', { class: 'rc-tap' }, 'Tap to close'));
    ui.rollCard = card; els.bottom.append(card);
    rows.forEach((row, i) => setTimeout(() => {
      if (ui.rollCard !== card) return;
      row.classList.add('in');
      const e = row._e; if (e.c === 'pass') return;
      const t0 = performance.now();
      const tick = () => { if (ui.rollCard !== card) return; const k = COUNT ? Math.min(1, (performance.now() - t0) / COUNT) : 1; row._num.textContent = k < 1 ? Math.max(1, Math.round(Math.random() * 100)) : e.v; if (k < 1) requestAnimationFrame(tick); };
      tick();
    }, i * STEP));
    setTimeout(() => {
      if (ui.rollCard !== card) return;
      const winRow = rows.find((r) => r._e.name === d.winner || (d.me && r._e.me));
      if (winRow) winRow.classList.add('win');
      head.textContent = !d.winner ? 'Everyone passed' : d.me ? `You won! (${d.how === 'need' ? 'Need' : 'Greed'} ${d.v})` : `${d.winner} won (${d.how === 'need' ? 'Need' : 'Greed'} ${d.v})`;
      head.classList.add(d.me ? 'me' : 'done');
      // a higher Greed that lost looks like a bug unless you know the rule
      if (d.how === 'need' && d.entries.some((e) => e.c === 'greed' && e.v > d.v)) head.append(h('small', { class: 'rc-rule' }, 'Need beats Greed'));
    }, order.length * STEP + COUNT);
    ui.rollTimer = setTimeout(closeRollCard, total);
  }
  function closeRollCard() {
    clearTimeout(ui.rollTimer);
    if (ui.rollCard) ui.rollCard.remove();
    ui.rollCard = null;
    if ((ui.rollQueue || []).length) showRollCard(); else renderRolls();
  }
  function renderRolls() {
    if (ui.rollEl) { ui.rollEl.remove(); ui.rollEl = null; }
    if (ui.rollCard) return; // the result card is showing; the next prompt waits for it
    const R = G.S.run;
    if (!R) return;
    const open = R.rolls.map((r, i) => ({ r, i })).filter((x) => !x.r.done && !x.r.player);
    if (!open.length) return;
    const { r, i } = open[0];
    const it = r.item;
    ui.rollEl = h('div', { class: 'roll' },
      h('button', { style: { padding: 0 }, onclick: () => showDialog(itemTip(it), true) }, itemIcon(it, 'rollic')),
      h('div', null,
        h('div', { class: 'q' + it.q, style: { fontWeight: 800 } }, it.name + (open.length > 1 ? `  (+${open.length - 1} more)` : ''), gearTag(it)),
        h('div', { class: 'bar' }, h('i', { 'data-roll': i, style: { width: '100%' } })),
        h('div', { class: 'btn-row', style: { marginTop: '6px' } },
          h('button', { class: 'btn', onclick: () => { G.roll(i, 'need'); renderRolls(); } }, 'Need'),
          h('button', { class: 'btn alt', onclick: () => { G.roll(i, 'greed'); renderRolls(); } }, 'Greed'),
          h('button', { class: 'btn alt', onclick: () => { G.roll(i, 'pass'); renderRolls(); } }, 'Pass'))));
    els.bottom.append(ui.rollEl);
  }

  // ---------- away report, pops, invites
  function showAway(rep) {
    const S = G.S;
    const news = rep.news.slice(-8).reverse();
    const newsEl = news.length ? h('div', { class: 'news' }, ...news.map((n) => h('div', { class: n.big ? 'big' : '' }, n.text))) : null;
    showDialog([h('h3', null, 'Welcome back'),
      h('p', null, `You were away for ${fmtTime(rep.away)}.`),
      rep.rested > 0 ? h('p', { style: { color: '#6fa8ff' } }, `You feel rested: +${rep.rested} bonus XP.`) : null,
      rep.dings ? h('p', null, `${rep.dings} players levelled up while you were gone.`) : null,
      newsEl,
      h('p', { style: { color: 'var(--muted)' } }, `${rep.online} players online on ${D.REALM} right now.`),
      h('button', { class: 'btn wide', onclick: closeDialog }, 'Enter World')]);
  }
  function showPop(q) {
    const A = D.ACTIVITIES[q.act];
    showDialog([h('h3', null, 'Your group is ready'), h('p', null, A.name), h('p', { style: { color: 'var(--muted)' } }, `Role: ${G.role() === 'tank' ? 'Tank' : G.role() === 'healer' ? 'Healer' : 'Damage'}`),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { closeDialog(); closeSheet(); G.acceptPop(); renderAll(); } }, 'Enter'), h('button', { class: 'btn alt', onclick: () => { closeDialog(); G.declinePop(); renderAll(); } }, 'Decline'))]);
  }
  function showInvite(d) {
    showDialog([h('h3', null, 'Guild invitation'), h('p', null, `${d.from} invites you to join <${d.guildName}>.`),
      h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { G.joinGuild(d.guild); closeDialog(); renderChat(); } }, 'Accept'), h('button', { class: 'btn alt', onclick: closeDialog }, 'Decline'))]);
  }
  function playChapter(id) {
    const ch = window.CS && CS.byId(id);
    G.paused = true;
    if (!ch || !ch.shots || !G.S) return Promise.resolve();
    const P = G.S.player;
    const startPlace = D.PLACES[D.RACES[P.race || 'human'].start];
    return CS.play(ch, {
      art, heroUrl: art('hero', looks(P)), name: P.name, zone: startPlace.zone,
      startScene: startPlace.scene, hereScene: D.PLACES[P.place].scene,
      setMusic: (m) => { ui.csMusic = m; G.paused = !!m || !!(window.CS && CS.playing); },
    }).then(() => { G.paused = false; P.story = P.story || {}; P.story[id] = true; G.save(); if (ch.then && CS.byId(ch.then) && !CS.unlocked().has(ch.then)) ui.pendingChapter = ch.then; });
  }
  // ---------- first-hour tips: one short card at the moment it helps, once per device, always skippable
  const TIPS = {
    start: 'Welcome! Tap a creature in the Fight list to attack it. People with a yellow ! have quests for you.',
    fight: 'Your abilities are on the bar at the bottom. Tap one to use it; press and hold to read what it does.',
    quest: 'Quests go in your Quest Log. The creatures you need are marked with ◆ in the Fight list.',
    questReady: 'Quest complete! Go back to whoever gave it to you (they show a ?) to hand it in.',
    level: 'You levelled up. Your XP bar is under your health and mana: tap it to see how far you have to go.',
    request: 'Chat messages marked ▸ are requests from other players. Tap one to help, trade or join a group.',
    roll: 'Loot! Need if you will use it, Greed if you would sell it, Pass to leave it to others.',
    dungeon: 'Dungeons are open. Social → Group Finder: queue from the dungeon\'s zone and the finder fills your group.',
    run: 'In a group the tank pulls. Tap Pull (or Ready) when you are set; Tactics set the pace.',
    talents: 'Talents are open: Hero → Abilities → Talents. You get a new point every level.',
  };
  const TIP_KEY = 'azsolo.tips';
  function tipState() {
    let s = null; try { s = JSON.parse(localStorage.getItem(TIP_KEY) || 'null'); } catch (e) { }
    if (!s) { // first time on this version: players who already know the game start with tips off
      const veteran = (G.characters() || []).some((c) => c.level >= 5);
      s = { seen: [], off: veteran }; try { localStorage.setItem(TIP_KEY, JSON.stringify(s)); } catch (e) { }
    }
    return s;
  }
  const saveTips = (s) => { try { localStorage.setItem(TIP_KEY, JSON.stringify(s)); } catch (e) { } };
  function tip(id) {
    const s = tipState(); if (s.off || s.seen.includes(id) || !TIPS[id]) return;
    s.seen.push(id); saveTips(s);
    ui.tipQueue = (ui.tipQueue || []).concat([id]);
    if (!ui.tipEl) nextTip();
  }
  function nextTip() {
    const id = (ui.tipQueue || []).shift(); if (!id) { ui.tipEl = null; return; }
    const close = () => { el.remove(); ui.tipEl = null; setTimeout(nextTip, 400); };
    const el = h('div', { class: 'tip-card' }, h('div', { class: 'tip-t' }, TIPS[id]),
      h('div', { class: 'tip-b' }, h('button', { class: 'chip gold', onclick: close }, 'Got it'),
        h('button', { class: 'chip', onclick: () => { const s = tipState(); s.off = true; saveTips(s); ui.tipQueue = []; el.remove(); ui.tipEl = null; toast('Tips off. Hero → Settings can turn them back on.', true); } }, 'Skip all tips')));
    ui.tipEl = el; (document.getElementById('app') || document.body).append(el);
  }
  // ---------- bug reports (src/report.js): a prefilled GitHub issue, or a copy for Discord
  function reportDialog(err) {
    const what = h('textarea', { placeholder: 'What happened? What were you doing just before?', maxlength: '800', style: { width: '100%', height: '84px', background: '#0c0906', color: 'var(--text)', border: '1px solid #5c4526', fontSize: '14px', padding: '6px' } });
    const title = err ? `Error: ${err.message.slice(0, 80)}` : 'Bug report';
    const preview = h('pre', { class: 'report-pre' }, REPORT.details().join('\n') + (REPORT.errors().length ? `\n\n${REPORT.errors().length} error(s) caught this session` : ''));
    showDialog([h('h3', null, 'Report a bug'),
      h('p', { class: 'ai-note', style: { margin: 0 } }, 'This opens a new issue on the game\'s GitHub with these details filled in (you need a GitHub account). No save data is sent. Or copy the report and paste it in the Discord.'),
      what, preview,
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => { UPD.open(REPORT.issueUrl(title, what.value)); closeDialog(); } }, 'Open on GitHub'),
        h('button', { class: 'btn alt', onclick: () => { const t = REPORT.text(what.value); try { navigator.clipboard.writeText(t).then(() => toast('Report copied', true), () => toast('Could not copy')); } catch (e) { toast('Could not copy'); } } }, 'Copy report')),
      h('button', { class: 'btn alt wide', onclick: closeDialog }, 'Cancel')], true);
  }
  // an error while playing: a small notice (once per kind of error), never a blocking dialog
  if (window.REPORT) REPORT.onError((e) => {
    ui.reported = ui.reported || new Set(); if (ui.reported.has(e.message)) return; ui.reported.add(e.message);
    setTimeout(() => {
      if (!document.body) return;
      const n = h('div', { class: 'err-note' }, h('span', null, 'Something went wrong.'),
        h('button', { class: 'chip gold', onclick: () => { n.remove(); reportDialog(e); } }, 'Report'),
        h('button', { class: 'chip', onclick: () => n.remove() }, 'Dismiss'));
      (document.getElementById('app') || document.body).append(n);
      setTimeout(() => n.remove(), 20000);
    }, 50);
  });
  // ---------- Lore Journal (src/data/lore*.js): story recaps, Legends, dungeons (first clear) and zones (first visit)
  const LORE_READ = 'azsolo.loreread';
  const loreRead = () => { try { return new Set(JSON.parse(localStorage.getItem(LORE_READ) || '[]')); } catch (e) { return new Set(); } };
  function markLoreRead(k) { const s = loreRead(); if (s.has(k)) return; s.add(k); try { localStorage.setItem(LORE_READ, JSON.stringify([...s])); } catch (e) { } }
  let zonePlaces = null; // zone name -> its place ids, built once
  const placesOf = (zone) => { if (!zonePlaces) { zonePlaces = {}; for (const [k, p] of Object.entries(D.PLACES)) (zonePlaces[p.zone] = zonePlaces[p.zone] || []).push(k); } return zonePlaces[zone] || []; };
  const dungeonActs = (dg) => Object.keys(D.ACTIVITIES).filter((a) => D.ACTIVITIES[a].dungeon === dg);
  function loreLvl(E) {
    if (E.lvl != null) return E.lvl;
    if (E.dungeon) return Math.min(...dungeonActs(E.dungeon).map((a) => D.ACTIVITIES[a].minLvl), 60);
    if (E.zone) return Math.min(...placesOf(E.zone).map((k) => (D.PLACES[k].lvl || [1])[0]), 60);
    return 1;
  }
  function loreOpen(k) {
    const E = (D.LORE || {})[k]; if (!E || !G.S) return false;
    const P = G.S.player;
    if (E.open) return true;
    if (E.quest) return !!P.done[E.quest];
    if (E.dungeon) return dungeonActs(E.dungeon).some((a) => ((P.codex || {})[a] || {}).clears > 0);
    if (E.zone) return placesOf(E.zone).some((k2) => P.visited && P.visited[k2]);
    if (E.book) return !!(P.books && P.books[k]);
    return !!(E.chapter && window.CS && CS.unlocked().has(E.chapter));
  }
  // where a book turns up: the dungeon of its first source, or the zone of a rare
  function bookWhere(E) {
    const m = Object.keys(E.from || {})[0]; if (!m) return '';
    for (const dk in D.DUNGEONS) if (D.DUNGEONS[dk].pulls.some((p) => p.mobs.includes(m))) { const A = Object.values(D.ACTIVITIES).find((a) => a.dungeon === dk); return A ? `in ${A.name}` : ''; }
    const pl = Object.values(D.PLACES).find((p) => (p.named || {})[m] || (p.mobs || []).some((x) => x[0] === m));
    return pl ? `in ${pl.zone}` : '';
  }
  // pages for places you can never reach (the other faction's dungeons and cities) are left out of the list
  function loreVisible(k) {
    const E = D.LORE[k]; if (loreOpen(k)) return true;
    if (E.dungeon) return dungeonActs(E.dungeon).some((a) => G.activityBlock(a) !== 'hidden');
    if (E.zone) return placesOf(E.zone).some((pl) => pl === G.S.player.place || G.canReach(G.S.player.place, pl));
    if (E.book) return !E.faction || E.faction === 'both' || E.faction === G.myFaction();
    return true;
  }
  const firstSentence = (t) => { const s = t.split(/(?<=[.!?])\s/)[0]; return /[.!?]$/.test(s) ? s : s + '.'; };
  const loreKeys = () => Object.keys(D.LORE || {});
  const loreUnread = () => { const r = loreRead(); return loreKeys().filter((k) => loreOpen(k) && !r.has(k)).length; };
  function loreHint(E) {
    if (E.quest) return 'Finish the story of this Legend to unlock.';
    if (E.dungeon) return 'Clear it once to unlock.';
    if (E.zone) return 'Travel there to unlock.';
    if (E.book) { const w = bookWhere(E); return w ? `Said to be found ${w}.` : 'Found somewhere in the world.'; }
    const ch = window.CS && CS.byId(E.chapter);
    return ch && ch.level ? `Unlocks with the chapter at level ${ch.level}.` : 'Unlocks as the story goes on.';
  }
  // a toast when a page opens during play (not for the pages you already had when you logged in)
  function loreNotice() {
    if (!G.S) return;
    const open = loreKeys().filter(loreOpen);
    if (!ui.loreSeen || ui.loreSeenFor !== G.S.id) { ui.loreSeen = new Set(open); ui.loreSeenFor = G.S.id; return; }
    for (const k of open) if (!ui.loreSeen.has(k)) { ui.loreSeen.add(k); toast(`New in your Lore Journal: ${D.LORE[k].title}`, true); }
  }
  const LORE_TABS = [['story', 'Story', ['story', 'legend']], ['dungeon', 'Dungeons', ['dungeon']], ['zone', 'Zones', ['zone']], ['book', 'Library', ['book']]];
  function openLore(key) {
    ui.loreKey = key || null;
    openSheet('lore', 'Lore Journal', 'The story so far, to read at your own pace', (b) => {
      const k = ui.loreKey, E = k && D.LORE[k];
      const tabOf = (sec) => (LORE_TABS.find((t) => t[2].includes(sec)) || LORE_TABS[0])[0];
      if (E) ui.loreTab = tabOf(E.section);
      ui.loreTab = ui.loreTab || 'story';
      const read = loreRead();
      const tabs = h('div', { class: 'tabs' });
      for (const [t, label, secs] of LORE_TABS) {
        const keys = loreKeys().filter((x) => secs.includes(D.LORE[x].section)); if (!keys.length) continue;
        const fresh = keys.some((x) => loreOpen(x) && !read.has(x));
        tabs.append(h('button', { class: ui.loreTab === t ? 'on' : '', onclick: () => { ui.loreTab = t; ui.loreKey = null; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } }, label, fresh ? h('span', { class: 'tab-dot' }) : null));
      }
      b.append(h('div', { class: 'sheet-stick' }, tabs));
      const tab = LORE_TABS.find((t) => t[0] === ui.loreTab) || LORE_TABS[0];
      const inTab = loreKeys().filter((x) => tab[2].includes(D.LORE[x].section) && loreVisible(x));
      if (tab[0] !== 'story') inTab.sort((x, y) => loreLvl(D.LORE[x]) - loreLvl(D.LORE[y]));
      if (E && loreOpen(k)) {
        markLoreRead(k); renderNavDots();
        const open = inTab.filter(loreOpen), i = open.indexOf(k);
        const page = h('div', { class: 'lore-page' }, h('h3', null, E.title), ...E.text.map((p) => h('p', null, p)));
        if (E.bosses) {
          page.append(h('div', { class: 'sec-h' }, 'Who waits inside'));
          const list = h('div', { class: 'lore-bosses' });
          for (const [mob, note] of Object.entries(E.bosses)) list.append(h('div', { class: 'lore-boss' }, h('div', { class: 'ic mob' }, img(mobArt(mob))), h('div', null, h('b', null, D.MOBS[mob] ? D.MOBS[mob].name : mob), h('p', null, note))));
          page.append(list);
        }
        b.append(page, h('div', { class: 'btn-row' },
          h('button', { class: 'btn alt', disabled: i <= 0, onclick: () => { ui.loreKey = open[i - 1]; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } }, '‹ Previous'),
          h('button', { class: 'btn alt', onclick: () => { ui.loreKey = null; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } }, 'All pages'),
          h('button', { class: 'btn alt', disabled: i < 0 || i >= open.length - 1, onclick: () => { ui.loreKey = open[i + 1]; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } }, 'Next ›')));
        return;
      }
      const L = G.S.player.level;
      const groups = tab[0] === 'story' ? [['story', 'The Story'], ['legend', 'Legends']] : [[null, null]];
      for (const [sec, label] of groups) {
        const keys = inTab.filter((x) => !sec || D.LORE[x].section === sec); if (!keys.length) continue;
        b.append(h('div', { class: 'sec-h' }, label || tab[1], h('small', null, `${keys.filter(loreOpen).length}/${keys.length} pages`)));
        const list = h('div', { class: 'list' });
        for (const x of keys) {
          const P = D.LORE[x], on = loreOpen(x);
          // a locked dungeon or zone keeps its name once you are near its level; story pages stay hidden
          const named = on || ((P.dungeon || P.zone) && L >= loreLvl(P) - 5);
          list.append(h('button', { class: 'row' + (on ? '' : ' locked'), onclick: () => { if (!on) return toast(loreHint(P)); ui.loreKey = x; ui.sheetFn(); ui.sheetBody.scrollTop = 0; } },
            h('div', { class: 'ic' + (P.dungeon ? ' mob' : '') }, on ? img(P.dungeon && P.bosses ? mobArt(Object.keys(P.bosses).pop()) : art('icon', 'journal')) : h('span', { class: 'mark grey' }, '·')),
            h('div', { class: 't' }, h('b', null, named ? P.title : '???'), h('small', { style: { whiteSpace: 'normal' } }, on ? firstSentence(P.text[0]) : (P.dungeon || P.zone) ? `Level ${loreLvl(P)}. ${loreHint(P)}` : loreHint(P))),
            h('div', { class: 'r' }, on && !read.has(x) ? h('span', { class: 'chip gold', style: { minHeight: 0, padding: '2px 6px' } }, 'New') : on ? 'Read' : 'Locked')));
        }
        b.append(list);
      }
    });
  }
  const chapterReady = (c) => !c.after || c.after.some((q) => G.S && G.S.player.done[q]);
  function openTheater() {
    openSheet('theater', 'Theater', 'Replay the story chapters you have reached', (b) => {
      const un = window.CS ? CS.unlocked() : new Set();
      const list = h('div', { class: 'list theater' });
      const all = window.CS ? CS.CHAPTERS : [];
      const ordered = all.filter((c) => !c.instance && !c.legend).concat(all.filter((c) => c.legend), all.filter((c) => c.instance));
      let shownLeg = false;
      let shownInst = false;
      for (const ch of ordered) {
        if (ch.legend && !shownLeg) { shownLeg = true; list.append(h('div', { class: 'sec-h', style: { marginTop: '8px' } }, 'Legends')); }
        if (ch.instance && !shownInst) { shownInst = true; list.append(h('div', { class: 'sec-h', style: { marginTop: '8px' } }, 'Dungeons & Raids')); }
        if (!ch.instance && ch === ordered[0]) list.append(h('div', { class: 'sec-h' }, 'Story'));
        const open = (un.has(ch.id) || ch.legend) && ch.shots; // legend lore is open from the start
        list.append(h('button', { class: 'row' + (open ? '' : ' locked'), onclick: () => { if (open) { closeSheet(); playChapter(ch.id); } else toast(ch.instance ? 'Enter the dungeon to unlock.' : ch.shots ? `Reach level ${ch.level} to unlock.` : 'Arrives with a later update.'); } },
          h('div', { class: 'ic' }, h('span', { class: 'mark' + (open ? '' : ' grey') }, open ? '▶' : '·')),
          h('div', { class: 't' }, h('b', null, ch.title), h('small', null, ch.legend ? 'Legend lore' : ch.instance ? (open ? 'Dungeon intro' : 'Plays the first time you enter') : ch.id === 'intro' ? 'Plays after you create a character' : `Level ${ch.level}`)),
          h('div', { class: 'r' }, open ? 'Play' : ch.shots ? 'Locked' : 'Coming')));
      }
      b.append(list);
    });
  }
  function banner(text, sub) {
    const b = h('div', { class: 'banner' }, text, sub ? h('small', null, sub) : null);
    els.scene.append(b); setTimeout(() => b.remove(), 2900);
  }

  // ============================================================ character creation
  const CLASS_BLURB = {
    warrior: 'Tank. Wears mail, holds the enemy\'s attention in groups. Rage builds as you hit and get hit.',
    mage: 'Damage. Fire and frost from range. Fragile, and thirsty for mana.',
    priest: 'Healer. Keeps the group alive, and can smite when nobody needs healing.',
    rogue: 'Damage. Fast strikes build combo points; finishers spend them.',
    paladin: 'Healer or tank. Holy knight in mail: seals and Judgement in melee, Holy Light to heal.',
    warlock: 'Damage. Curses and shadow from range, with a demon at your side. Trades health for mana.',
    shaman: 'Damage or healer. Lightning and earth shocks, totems for the party, and healing waves.',
    hunter: 'Damage. Shoots from range with a bow. At level 10 you tame a beast to fight beside you.',
    druid: 'Healer, tank or damage. Nature spells and heals; at level 10, Bear Form makes you a tank.',
  };
  // ============================================================ in-app updater (v9.3, src/update.js)
  // Checks when the character list opens and whenever you come back to the app (at most every 10 min here, and
  // update.js reuses GitHub's answer for 30 min). If a dialog or a fight is in the way, the offer waits for it.
  function autoUpdateCheck() {
    if (!window.UPD) return;
    const t = Date.now(); if (ui.updAt && t - ui.updAt < 10 * 60000) return; ui.updAt = t;
    UPD.check(false).then((rel) => { if (rel && rel.newer && !rel.skipped) offerUpdate(rel); }).catch(() => {});
  }
  // an offer held back by a fight or a dialog shows once the way is clear
  setInterval(() => { if (ui.updPending && !ui.dialog) offerUpdate(ui.updPending); }, 5000);
  function offerUpdate(rel) {
    // a browser that just reloaded for this version but still got the old one: the site is still updating
    if (!UPD.inApp() && UPD.justReloadedFor(rel.latest)) { if (!ui.updWaitToast) { ui.updWaitToast = true; toast(`${rel.latest} is still reaching the site. Try again in a few minutes.`, true); } return; }
    if (ui.dialog || G.fight || (G.S && G.S.run && G.S.run.phase !== 'done')) { ui.updPending = rel; return; }
    ui.updPending = null; updateDialog(rel);
  }
  function manualUpdateCheck() {
    if (!window.UPD) return;
    toast('Checking for updates...');
    UPD.check(true).then((rel) => {
      if (!rel) return toast("Couldn't reach GitHub. Check your connection.");
      if (rel.newer) updateDialog(rel); else toast(`You're up to date (v${UPD.current()}).`);
    });
  }
  function updateDialog(rel) {
    const cur = UPD.current(), inApp = UPD.inApp() && rel.apk;
    const notes = h('div', { class: 'upd-notes', style: { textAlign: 'left', maxHeight: '42vh', overflowY: 'auto', margin: '8px 0', padding: '8px 10px', background: '#0c0906', border: '1px solid #3a2c18', borderRadius: '3px', fontSize: '14px', lineHeight: '1.4' } });
    notes.innerHTML = UPD.notesHtml(rel.notes) || '<p>No details were written for this release.</p>';
    const status = h('p', { class: 'ai-note', style: { minHeight: '1.2em' } });
    const bar = h('div', { style: { height: '8px', background: '#1a140c', border: '1px solid #3a2c18', borderRadius: '4px', overflow: 'hidden', display: 'none' } }, h('i', { style: { display: 'block', height: '100%', width: '0%', background: 'var(--gold)' } }));
    const row = h('div', { class: 'btn-row' });
    const later = h('button', { class: 'btn alt', onclick: closeDialog }, 'Later');
    const skip = h('button', { class: 'btn alt', onclick: () => { UPD.skip(rel.latest); closeDialog(); toast(`Skipped ${rel.latest}. Hero has a manual check.`); } }, 'Skip this version');
    const permissionStep = () => {
      status.textContent = 'Android needs your OK once: allow Azeroth Solo to install apps, then come back and tap Install.';
      row.innerHTML = '';
      row.append(h('button', { class: 'btn', onclick: () => UPD.askPermission() }, 'Open settings'),
        h('button', { class: 'btn alt', onclick: () => UPD.install().then((r) => { if (r === 'need_permission') status.textContent = 'Not allowed yet. Turn on "Allow from this source" for Azeroth Solo.'; else status.textContent = 'Opening the installer...'; }).catch((e) => { status.textContent = 'Install failed: ' + ((e && e.message) || 'unknown error'); }) }, 'Install'), later);
    };
    const web = !UPD.inApp();
    const go = h('button', { class: 'btn', onclick: async () => {
      if (web) { if (G.S) G.save(); UPD.reloadWeb(rel.latest); return; }
      if (!inApp) { UPD.open(rel.url); return; }
      if (G.S) G.save();
      go.disabled = true; later.disabled = true; skip.disabled = true; bar.style.display = 'block';
      try {
        const r = await UPD.download(rel, (f) => { bar.firstChild.style.width = Math.round(f * 100) + '%'; status.textContent = `Downloading... ${Math.round(f * 100)}%`; });
        bar.firstChild.style.width = '100%';
        if (r === 'need_permission') permissionStep();
        else status.textContent = 'Opening the installer... Your characters stay: the update keeps this phone\'s saves.';
      } catch (e) {
        status.textContent = 'Download failed: ' + ((e && e.message) || 'unknown error') + '. Try again, or get it from the release page.';
        go.disabled = false; later.disabled = false; skip.disabled = false;
        go.textContent = 'Try again';
        row.append(h('button', { class: 'btn alt', onclick: () => UPD.open(rel.url) }, 'Release page'));
      }
    } }, web ? 'Reload to update' : inApp ? `Update now${rel.size ? ` (${(rel.size / 1048576).toFixed(0)} MB)` : ''}` : 'Open the release page');
    row.append(go, later, skip);
    showDialog([h('h3', null, 'Update available'), h('p', null, h('b', { style: { color: 'var(--gold)' } }, rel.name), h('br'), `You have v${cur}.`), notes, bar, status, row], false);
  }

  const discordLink = () => window.UPD ? h('button', { class: 'discord-link', onclick: () => UPD.open(UPD.DISCORD) }, 'Join us on Discord') : null;
  function showSelect() {
    closeDialog(); closeSheet();
    setTimeout(autoUpdateCheck, 1200);
    const list = G.characters();
    if (!list.length) return showCreate();
    app.innerHTML = '';
    let sel = list[0].id;
    const root = h('div', { class: 'create' });
    app.append(root);
    const draw = () => {
      root.innerHTML = '';
      const cur = list.find((c) => c.id === sel) || list[0];
      const rows = h('div', { class: 'list' });
      for (const c of list) {
        rows.append(h('button', { class: 'row' + (c.id === sel ? ' sel-char' : ''), onclick: () => { if (c.id === sel) enter(c.id); else { sel = c.id; draw(); } } },
          h('div', { class: 'ic' }, img(art('portrait', { cls: c.cls, race: c.race || 'human', skin: c.skin || 0, hair: c.hair || 0, gender: c.gender || 'm' }))),
          h('div', { class: 't' }, h('b', { class: 'cls-' + c.cls }, c.name), h('small', null, `Level ${c.level} ${D.RACES[c.race] ? D.RACES[c.race].name + ' ' : ''}${D.CLASSES[c.cls] ? D.CLASSES[c.cls].name : c.cls} · ${D.PLACES[c.place] ? D.PLACES[c.place].name : ''}`)),
          h('div', { class: 'r' }, c.id === sel ? 'Play' : '')));
      }
      root.append(
        h('h1', null, 'Azeroth Solo'), h('div', { class: 'sub' }, `Realm: ${D.REALM} · ${list.length}/${G.MAX_CHARS} characters`),
        h('img', { class: 'preview', src: art('hero', { cls: cur.cls, race: cur.race || 'human', skin: cur.skin || 0, hair: cur.hair || 0, gender: cur.gender || 'm', gear: cur.gear || undefined }), alt: '' }),
        rows,
        h('button', { class: 'btn wide go', onclick: () => enter(sel) }, 'Enter World'),
        h('div', { class: 'btn-row' },
          h('button', { class: 'btn alt', disabled: list.length >= G.MAX_CHARS, onclick: () => showCreate(true) }, 'Create New'),
          h('button', { class: 'btn alt', onclick: () => { if (!G.S) { const r = G.load(sel); if (!r) return; } openTheater(); } }, 'Theater'),
          h('button', { class: 'btn alt', style: { color: '#ff6a5a' }, onclick: () => confirmDeleteChar(cur, () => showSelect()) }, 'Delete')),
        h('button', { class: 'btn alt wide', onclick: importSave }, 'Load save code'),
        discordLink());
    };
    draw();
  }
  function enter(id) {
    const rep = G.load(id);
    if (!rep) return toast('That character could not be loaded.');
    start(); if (rep.away > 120000) showAway(rep);
    // a chapter added in an update after you passed its level plays the next time you come in
    if (window.CS) { const seen = CS.unlocked(); const ch = CS.CHAPTERS.find((c) => c.shots && c.level > 1 && c.level <= G.S.player.level && !seen.has(c.id) && chapterReady(c)); if (ch) ui.pendingChapter = ch.id; }
  }
  function confirmDeleteChar(c, after) {
    const input = h('input', { type: 'text', placeholder: 'Type DELETE', style: { minHeight: '44px', background: '#0c0906', color: 'var(--text)', border: '1px solid #5c4526', borderRadius: '3px', padding: '0 10px', width: '100%', fontSize: '16px' } });
    const err = h('p', { style: { color: '#ff6a5a' } });
    showDialog([h('h3', null, `Delete ${c.name}?`), h('p', null, `Level ${c.level} ${D.CLASSES[c.cls] ? D.CLASSES[c.cls].name : ''}. The character, gear and quests are gone for good.`), input, err,
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => { if (input.value.trim().toUpperCase() !== 'DELETE') { err.textContent = 'Type DELETE to confirm.'; return; } G.deleteCharacter(c.id); closeDialog(); after(); } }, 'Delete'),
        h('button', { class: 'btn alt', onclick: closeDialog }, 'Keep'))]);
  }
  function showCreate(fromSelect) {
    app.innerHTML = '';
    const st = { name: B.makeName(new Set()), faction: 'alliance', race: 'human', cls: 'warrior', gender: 'm', skin: 1, hair: 0 };
    const root = h('div', { class: 'create' });
    app.append(root);
    const draw = () => {
      root.innerHTML = '';
      const nameIn = h('input', { type: 'text', id: 'cc-name', value: st.name, maxlength: '12', 'aria-label': 'Character name' });
      nameIn.addEventListener('input', () => { st.name = nameIn.value.replace(/[^A-Za-z]/g, '').slice(0, 12); });
      const factions = h('div', { class: 'looks', style: { gridTemplateColumns: '1fr 1fr' } });
      for (const f in D.FACTIONS) factions.append(h('button', { class: 'chip' + (st.faction === f ? ' gold' : ''), style: { color: st.faction === f ? D.FACTIONS[f].color : '' }, onclick: () => { st.faction = f; st.race = Object.keys(D.RACES).find((r) => D.RACES[r].faction === f); draw(); } }, D.FACTIONS[f].name));
      const races = h('div', { class: 'races' });
      for (const r in D.RACES) if (D.RACES[r].faction === st.faction) races.append(h('button', { class: 'chip' + (st.race === r ? ' gold' : ''), onclick: () => { st.race = r; draw(); } }, D.RACES[r].name, h('small', null, D.RACES[r].startZone)));
      const classes = h('div', { class: 'classes' });
      for (const c of D.RACES[st.race].classes) classes.append(h('button', { class: st.cls === c ? 'on' : '', onclick: () => { st.cls = c; draw(); } }, img(art('portrait', { cls: c, race: st.race, skin: st.skin, hair: st.hair, gender: st.gender })), h('span', { class: 'cls-' + c }, D.CLASSES[c].name), h('small', null, c === 'paladin' ? 'Heal / Tank' : c === 'druid' ? 'Any role' : c === 'shaman' ? 'Dmg / Heal' : D.CLASSES[c].role === 'dps' ? 'Damage' : D.CLASSES[c].role === 'tank' ? 'Tank' : 'Healer')));
      const cyc = (k, n, label) => h('button', { class: 'chip', onclick: () => { st[k] = (st[k] + 1) % n; draw(); } }, label, h('small', null, String(st[k] + 1)));
      root.append(
        h('h1', null, 'Azeroth Solo'), h('div', { class: 'sub' }, `Realm: ${D.REALM}`),
        factions,
        h('img', { class: 'preview', src: art('hero', { cls: st.cls, race: st.race, skin: st.skin, hair: st.hair, gender: st.gender }), alt: '' }),
        h('div', { class: 'desc' }, CLASS_BLURB[st.cls]),
        races,
        h('div', { class: 'desc', style: { fontSize: '13px', color: 'var(--muted)' } }, `${D.RACES[st.race].name}: ${D.ABILITIES[D.RACIALS[st.race].active].name} · ${D.RACIALS[st.race].text.join(' · ')}`),
        classes,
        h('div', { class: 'looks' }, h('button', { class: 'chip', onclick: () => { st.gender = st.gender === 'm' ? 'f' : 'm'; draw(); } }, st.gender === 'm' ? 'Male' : 'Female'), cyc('skin', 4, 'Skin'), cyc('hair', 5, 'Hair')),
        nameIn,
        h('button', { class: 'btn wide go', onclick: () => {
          const n = (st.name || '').trim();
          if (n.length < 2) return toast('Pick a name with at least 2 letters.');
          G.newGame({ name: n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(), race: st.race, cls: st.cls, gender: st.gender, skin: st.skin, hair: st.hair });
          const sp = D.PLACES[D.RACES[st.race].start];
          start();
          playChapter('intro').then(() => banner(sp.zone, D.REGIONS[sp.region].name !== sp.zone ? D.REGIONS[sp.region].name : ''));
        } }, 'Enter World'),
        h('div', { class: 'sub', style: { fontSize: '12px', marginTop: '0' } }, 'Everyone else on this realm is simulated. The world keeps going while you are away.'));
      root.append(h('div', { class: 'btn-row' },
        h('button', { class: 'btn alt', onclick: importSave }, 'Load save code'),
        G.characters().length ? h('button', { class: 'btn alt', onclick: () => showSelect() }, 'Back to characters') : null));
      root.append(discordLink());
    };
    draw();
  }

  // ============================================================ boot
  let bound = false;
  function bind() {
    if (bound) return; bound = true;
    G.on('change', renderAll);
    G.on('arrive', (d) => { closeSheet(); renderAll(); if (d.first) banner(D.PLACES[d.place].name, D.PLACES[d.place].zone !== D.PLACES[d.place].name ? D.PLACES[d.place].zone : ''); });
    G.on('fightStart', () => { renderAll(); tip('fight'); });
    G.on('questAccept', () => tip('quest'));
    G.on('questReady', () => tip('questReady'));
    G.on('roll', () => tip('roll'));
    G.on('runUpdate', () => { if (G.S && G.S.run && G.S.run.phase === 'rest') tip('run'); });
    G.on('levelup', (d) => { if (d.level === 2) tip('level'); if (d.level === 8) tip('dungeon'); if (d.level === D.TALENT_START) tip('talents'); });
    G.on('chat', () => { if (G.S && G.S.chat.some((m) => m.act && m.act.state === 'open' && !m.act.accepted)) tip('request'); });
    G.on('fightEnd', (d) => { renderAll(); if (d.result === 'lose' && !G.S.run) banner('You died'); });
    G.on('runUpdate', renderAll);
    G.on('runTick', () => {});
    // a chapter that waits on a quest (x1 waits for Onyxia) plays as soon as that quest is turned in
    G.on('questDone', (d) => { const ch = d && d.qid && window.CS && CS.CHAPTERS.find((c) => c.after && c.after.includes(d.qid) && c.shots && G.S.player.level >= c.level && !CS.unlocked().has(c.id)); if (ch) ui.pendingChapter = ch.id; });
    G.on('levelup', (d) => { const ch = window.CS && CS.CHAPTERS.find((c) => c.level === d.level && c.shots && c.id !== 'intro' && chapterReady(c)); if (ch) ui.pendingChapter = ch.id; renderAll(); banner('Level ' + d.level, d.learned.length ? 'New: ' + d.learned.map((a) => D.ABILITIES[a].name).join(', ') : 'Health and mana restored'); });
    G.on('combat', onCombat);
    G.on('instanceEnter', (d) => {
      const ch = d.dungeon && window.CS && CS.forInstance(d.dungeon);
      if (ch && !CS.unlocked().has(ch.id)) setTimeout(() => playChapter(ch.id), 400);
    });
    const snd = (name, o) => window.SND && window.SND.play(name, o);
    G.on('levelup', () => snd('levelup'));
    G.on('questDone', () => snd('quest_done'));
    G.on('questAccept', () => snd('quest_accept'));
    G.on('lootGain', (d) => { if (d.items) snd('loot'); else if (d.money) snd('coin'); });
    G.on('sold', () => snd('coin'));
    G.on('bought', () => snd('coin', { vol: 0.7 }));
    G.on('pop', () => snd('pop'));
    G.on('error', () => snd('error', { gap: 0.4, vol: 0.6 }));
    G.on('chat', renderChat);
    G.on('toast', (t) => toast(t));
    G.on('error', (t) => toast(t));
    G.on('pop', (q) => { renderNavDots(); showPop(q); });
    G.on('invite', showInvite);
    G.on('helpWanted', (r) => toast(`Help Wanted: a group in ${D.ACTIVITIES[r.act].name} needs a ${r.role === 'dps' ? 'damage dealer' : r.role}. See Social → Group Finder.`, true));
    // wait for a calm moment: no fight, no run, no other dialog, no cutscene
    const introWhenCalm = () => { if (!G.S) return; if (G.fight || G.S.run || G.paused || document.querySelector('.dialog')) return setTimeout(introWhenCalm, 3000); showWarModeIntro(); };
    G.on('warModeIntro', introWhenCalm);
    G.on('intruder', (it) => { toast(`Enemy player nearby: ${it.name}`); snd('error', { gap: 0.4, vol: 0.5 }); renderAll(); });
    G.on('partyInvite', (d) => { if (ui.dialog || (window.CS && CS.playing)) { G.declinePartyInvite(d.bot.id); return; } showPartyInvite(d); });
    G.on('roll', () => renderRolls());
    G.on('questReady', (d) => {
      ui.flashQ = { qid: d && d.qid, at: Date.now() }; renderNavDots(); renderPanel();
      const qb = els.nav && els.nav.querySelector('[data-nav="quests"]'); if (qb) { qb.classList.remove('bump'); void qb.offsetWidth; qb.classList.add('bump'); }
    });
    G.on('lootGain', (d) => lootFly(d || {}));
    // level up: a gold burst around your portrait, and the level number pops
    G.on('levelup', () => setTimeout(() => {
      const lv = document.getElementById('pf-lvl'); if (!lv) return;
      const pt = lv.parentNode; pt.append(h('span', { class: 'lvlburst' })); lv.classList.add('pop');
      setTimeout(() => { const b = pt.querySelector('.lvlburst'); if (b) b.remove(); lv.classList.remove('pop'); }, 1400);
    }, 60));
    G.on('questDone', () => { toast('Quest complete', true); });
    G.on('selfheal', (n) => fct('me', '+' + n, 'heal'));
    G.on('xp', (d) => { if (G.pUnit && ui.spriteEls[G.pUnit.uid]) fct(G.pUnit.uid, '+' + d.amount + ' XP', 'xp'); xpFloat(d); });
    G.on('rollResult', (d) => { ui.rollQueue = ui.rollQueue || []; ui.rollQueue.push(d); if (!ui.rollCard) showRollCard(); });
  }
  let panelTick = 0;
  function start() {
    closeDialog();
    buildLayout(); bind(); renderAll();
    if (G.S.player.level <= 3) setTimeout(() => tip('start'), 1500);
  }
  let last = performance.now();
  function loop(t) {
    const dt = (t - last) / 1000; last = t;
    if (G.S) {
      if (dt > 20) resume();
      if (ui.pendingChapter && !G.fight && !ui.dialog && !(window.CS && CS.playing)) { const id = ui.pendingChapter; ui.pendingChapter = null; closeSheet(); setTimeout(() => playChapter(id), 2600); }
      G.update(Math.min(dt, 1));
      frame();
      panelTick += dt;
      // refresh the idle panel now and then so respawns and people show up
      if (panelTick > 2 && !G.fight && els.panel && !ui.sheet) {
        panelTick = 0;
        if (!G.S.run) {
          const P = G.S.player;
          const sig = JSON.stringify([P.place, P.travel && P.travel.to, P.ghostUntil ? 1 : 0, G.placeMobs().map((m) => m.id + m.state + (m.by || '')), B.onlineIn(G.S, P.place, new Date()).map((b) => b.id), Object.keys(P.quests).map((q) => G.questProgress(q).map((x) => x.have)), G.S.queue && G.S.queue.act, (G.S.world[P.place] || {}).nodes, G.S.wparty && G.S.wparty.members.map((m) => m.bot.id + ':' + Math.round(m.hp || 0))]);
          if (sig !== ui.panelSig) { ui.panelSig = sig; renderPanel(); renderScene(); }
        }
      }
    }
    requestAnimationFrame(loop);
  }
  function resume() {
    autoUpdateCheck();
    if (!G.S) return;
    const away = Date.now() - G.S.lastSeen;
    if (away > 120000 && !G.fight) { const rep = G.catchUp(); renderAll(); showAway(rep); }
  }
  window.GAME = {
    save: () => { G.save(); if (window.SND) window.SND.pause(); },
    resume: () => { if (window.SND) window.SND.resume(); resume(); },
    back: () => { if (ui.dialog) closeDialog(); else if (ui.sheet) closeSheet(); },
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { G.save(); if (window.SND) window.SND.pause(); } else { if (window.SND) window.SND.resume(); resume(); } });
  window.addEventListener('pagehide', () => G.save());

  function boot() {
    if (G.hasSave()) showSelect(); else showCreate();
    requestAnimationFrame(loop);
  }
  boot();
})();
