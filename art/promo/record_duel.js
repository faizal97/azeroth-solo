// Record a scripted duel from the real build (distance in combat, stage 2): a mage against a warrior in the Bloodsand
// Arena, showing the moves on screen: the warrior charges in, Frost Nova roots it in ice, the mage steps back and casts,
// the root breaks and the warrior runs back in, slowed by the Frostbolt. Same virtual-time recorder as
// record_cutscene.js: each frame advances the page clock by 1/30 s, then a screenshot of the scene.
// Usage: serve dist/ on :8777, then  node art/promo/record_duel.js <outdir>   (frames f00000.jpg ...)
// MODE=states records the looks this duel does not show (vines, a fear run, a flyer and its shadow, a slowed run).
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out', 'duel');
const MODE = process.env.MODE || 'duel', FPS = 30, SECS = +(process.env.SECS || 10), SCALE = +(process.env.SCALE || 1080 / 390);
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^f\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(OUT, f));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = fs.mkdtempSync('/tmp/azduel-');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9379', '--user-data-dir=' + PROFILE, '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
  let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9379/json')).json(); if (targets.length) break; } catch (e) {} await sleep(250); }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const wait = {}; let budgetDone = null;
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; }
    if (d.method === 'Emulation.virtualTimeBudgetExpired' && budgetDone) { const f = budgetDone; budgetDone = null; f(); }
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true }); return r.result && r.result.result && r.result.result.value; };
  const jsSync = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(()=>{${expr}})()`, returnByValue: true }); return r.result && r.result.result && r.result.result.value; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: SCALE, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:8777/' }); await sleep(2500);
  await js(`localStorage.clear(); G.newGame({name:'Mira',cls:'mage',race:'human'}); const P=G.S.player; P.level=45; P.place='bloodsand_arena'; P.story={}; for (const c of CS.CHAPTERS) P.story[c.id]=true; try{ localStorage.setItem('azsolo.story', JSON.stringify(CS.CHAPTERS.map(c=>c.id))); }catch(e){} G.S.flags.warModeAsked=true; P.equip=G.botChar({name:'x',cls:'mage',race:'human',level:45,skill:0.7}).equip; G.save(); try{localStorage.setItem('azsolo.tips', JSON.stringify({seen:[],off:true}))}catch(e){} return true;`);
  await send('Page.navigate', { url: 'http://localhost:8777/' }); await sleep(2500);
  const H = `const click=(re,sel='button, .row, .chip, .mcard')=>{const e=[...document.querySelectorAll(sel)].find(b=>re.test(b.textContent.trim())); if(e) e.click(); return !!e;};`;
  await js(`${H} click(/Enter World/); await new Promise(r=>setTimeout(r,1800)); document.querySelectorAll('.dialog .btn').forEach(b=>/OK|Enter World|Got it/i.test(b.textContent)&&b.click()); return true;`);
  await sleep(1000);
  await js(`document.querySelectorAll('.dialog .btn, .tip-card button').forEach(b=>b.click()); return true;`);
  await send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
  // the duel, scripted: the warrior's own AI is off (it still runs to its target and swings in reach), the moves are timed
  const ok = await jsSync(`
    const S=G.S; let b=S.bots.find(x=>x.cls==='warrior'); if(!b){ b=S.bots[0]; b.cls='warrior'; } b.level=S.player.level; b.race='orc';
    if(!G.startDuel(b.id)) return false;
    const C=G.fight, me=G.pUnit, w=C.enemies[0]; w.kind='script';
    for (const u of [me,w]) { u.maxHp*=6; u.hp=u.maxHp; }
    me.pos.x -= 9; w.pos.x += 9; w.res = 100;
    const at=(s,f)=>setTimeout(()=>{ try{ f(); }catch(e){} }, s*1000);
    if (${JSON.stringify(MODE)} === 'states') { // the other looks, one after another: vines, fear, flying, a slowed run
      me.kind='script'; me.pos.x += 9; w.pos.x -= 9; w.target = me.uid;
      at(0.3, ()=>{ w.auras.push({ id:'entangling_roots', name:'Entangling Roots', until:C.t+1.6, root:true }); });
      at(2.2, ()=>{ w.fleeUntil = C.t+1.6; w.fleeFrom = me.uid; });
      at(4.4, ()=>{ w.pos.z = 8; });
      at(6.2, ()=>{ w.pos.z = 0; w.pos.x = me.pos.x + ${+(process.env.FAR || 22)}; w.auras.push({ id:'frostbolt', name:'Frostbolt', until:C.t+4, slow:50 }); if (${!!process.env.FAR}) me.auras.push({ id:'held', until:C.t+1, root:true }); });
    } else {
    at(0.5, ()=>E.use(C, w, 'charge', me.uid));
    at(1.3, ()=>E.use(C, me, 'frost_nova'));
    at(1.7, ()=>E.use(C, me, 'step_back'));
    at(2.1, ()=>E.use(C, me, 'frostbolt', w.uid));
    at(4.9, ()=>E.use(C, me, 'fire_blast', w.uid));
    at(6.2, ()=>E.use(C, me, 'fireball', w.uid));
    }
    return true;`);
  if (!ok) { console.log('could not start the duel'); process.exit(1); }
  const step = (ms) => new Promise((r) => { budgetDone = r; send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms }); });
  let clip = null, n = 0;
  for (let i = 0; i < FPS * SECS; i++) {
    await step(1000 / FPS);
    { const r = await jsSync(`let e=document.querySelector('.scene'); const w=e.offsetWidth,h=e.offsetHeight; let x=0,y=0; for(;e;e=e.offsetParent){x+=e.offsetLeft;y+=e.offsetTop;} return {x,y,w,h};`); clip = { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.w), height: Math.round(r.h / 2) * 2, scale: 1 }; } // measured each frame from the layout (the panels settle once the fight starts), so a screen shake does not move the frame
    const r = await send('Page.captureScreenshot', process.env.FULL ? { format: 'jpeg', quality: 90 } : { format: 'jpeg', quality: 92, clip, captureBeyondViewport: false });
    fs.writeFileSync(path.join(OUT, `f${String(n++).padStart(5, '0')}.jpg`), Buffer.from(r.result.data, 'base64'));
  }
  console.log(`recorded the duel: ${n} frames = ${(n / FPS).toFixed(1)} s, clip ${clip.width}x${clip.height} css px (x${SCALE.toFixed(2)})`);
  ws.close(); chrome.kill(); await sleep(1000); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
})();
