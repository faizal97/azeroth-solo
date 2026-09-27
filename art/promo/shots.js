// Launch screenshots at phone size (390x844 @3x) from the real build, staged through the game's own API.
// Usage: serve dist/ on :8765, then  node art/promo/shots.js <outdir>
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = fs.mkdtempSync('/tmp/azshots-');
const URL0 = 'http://localhost:8765/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + PROFILE, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9333/json')).json(); if (targets.length) break; } catch (e) {} await sleep(250); }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const wait = {};
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true }); if (r.result && r.result.exceptionDetails) console.log('JS error:', JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result && r.result.result && r.result.result.value; };
  const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, name), Buffer.from(r.result.data, 'base64')); console.log('saved', name); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  const go = async () => { await send('Page.navigate', { url: URL0 }); await sleep(2500); };
  const H = `const sleep=(ms)=>new Promise(r=>setTimeout(r,ms)); const click=(re,sel='button, .row, .chip, .mcard')=>{const e=[...document.querySelectorAll(sel)].find(b=>re.test(b.textContent.trim())); if(e) e.click(); return !!e;};`;
  // stage a character, reload, enter the world
  const enter = async (setup) => {
    await go();
    await js(`${H} localStorage.clear(); ${setup} G.save(); return true;`);
    await go();
    await js(`${H} click(/Enter World/); await sleep(1800); document.querySelectorAll('.dialog .btn').forEach(b=>/Enter World|OK/i.test(b.textContent)&&b.click()); await sleep(400); return true;`);
  };
  const busyServer = `G.S.player.hp=null; G.S.player.res=null; B.advance(G.S, 40*3600000); G.S.lastSim=Date.now(); G.S.lastSeen=Date.now(); for(let i=0;i<260;i++) B.chatTick(G.S, Date.now()+i*1000); G.S.pending=[];`;

  // 1. character creation (fresh profile shows it)
  await go();
  await js(`${H} localStorage.clear(); location.reload(); return 1;`); await sleep(2500);
  await js(`${H} click(/^Horde$/); await sleep(300); click(/^Tauren/); await sleep(300); click(/^Shaman/); await sleep(500); return 1;`);
  await shot('01_create.png');

  // 2. Goldshire, busy server, General chat
  await enter(`G.newGame({name:'Aldric',cls:'paladin',race:'human'}); const P=G.S.player; P.level=8; P.place='goldshire'; P.visited={goldshire:true}; P.story={intro:true}; ${busyServer}`);
  await js(`${H} ${busyServer} G.emit ? G.emit('change') : 0; await sleep(1500); return 1;`);
  await shot('02_goldshire.png');

  // 3+4. The Deadmines: lore intro, then a pull with party frames
  await enter(`G.newGame({name:'Aldric',cls:'paladin',race:'human'}); const P=G.S.player; P.level=10; P.place='goldshire'; P.visited={goldshire:true}; P.story={intro:true}; ${busyServer}`);
  await js(`${H} G.queueFor('deadmines'); await sleep(200); G.acceptPop(); await sleep(4500); return 1;`);
  await shot('03_deadmines_lore.png');
  await js(`${H} click(/^Skip$/); await sleep(800); click(/^Skip$/); for(let i=0;i<40 && !G.fight;i++){ await sleep(500); } await sleep(3500); return !!G.fight;`);
  await shot('04_deadmines_fight.png');

  // 5. Westfall: Molsen Farm, fighting next to Foe Reaper 4000
  await enter(`G.newGame({name:'Aldric',cls:'warrior',race:'human'}); const P=G.S.player; P.level=14; P.place='molsen_farm'; P.visited={molsen_farm:true}; P.story={intro:true}; ${busyServer}`);
  await js(`${H} click(/^Fight$/); await sleep(1500); return 1;`);
  await shot('05_westfall_foe_reaper.png');

  // 6. The Crossroads, Horde, quest givers
  await enter(`G.newGame({name:'Tanka',cls:'shaman',race:'tauren'}); const P=G.S.player; P.level=11; P.place='crossroads'; P.visited={crossroads:true}; P.story={intro:true}; for (const k in D.QUESTS) if (D.QUESTS[k].lvl<=9) P.done[k]=true; P.done.crossroads_mulgore=true; ${busyServer}`);
  await js(`${H} click(/^People$/); await sleep(1200); return 1;`);
  await shot('06_crossroads.png');

  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
