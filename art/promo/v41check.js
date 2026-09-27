// Launch screenshots at phone size (390x844 @3x) from the real build, staged through the game's own API.
// Usage: serve dist/ on :8765, then  node art/promo/shots.js <outdir>
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROFILE = fs.mkdtempSync('/tmp/azshots-');
const URL0 = 'http://localhost:8777/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9377', '--user-data-dir=' + PROFILE, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch('http://127.0.0.1:9377/json')).json(); if (targets.length) break; } catch (e) {} await sleep(250); }
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



  const hero = (race, cls, lvl) => `G.newGame({name:'Aldric',cls:'${cls}',race:'${race}'}); const P=G.S.player; P.level=${lvl}; P.money=500000; P.equip=G.botChar({name:'x',cls:'${cls}',race:'${race}',level:${lvl},skill:0.6}).equip; P.talents=G.autoTalents('${cls}','dps',${lvl},0); P.visited={}; P.story={intro:true,ch1:true,ch2:true}; G.S.flags.warModeAsked=true;`;


  await enter(`${hero('nightelf','hunter',25)} P.place='astranaar'; P.visited.astranaar=true; ${busyServer}`);
  await js(`${H} click(/People/); await sleep(800); return true;`);
  await shot('v41_1_astranaar.png');
  await enter(`${hero('orc','warrior',26)} P.place='mystral_lake'; P.visited.mystral_lake=true; P.visited.splintertree_post=true; ${busyServer}`);
  await js(`${H} click(/Travel/); await sleep(800); return true;`);
  await shot('v41_2_mystral_travel.png');
  await js(`${H} click(/^Map$/); await sleep(800); return true;`);
  await shot('v41_3_ashenvale_map.png');
  await enter(`${hero('orc','shaman',26)} P.place='splintertree_post'; P.visited.splintertree_post=true; ${busyServer}`);
  await js(`${H} click(/People/); await sleep(800); return true;`);
  await shot('v41_4_splintertree.png');
  await enter(`${hero('human','paladin',26)} P.place='the_zoram_strand'; P.visited.the_zoram_strand=true; ${busyServer}`);
  await js(`${H} try{localStorage.setItem('azsolo.story', JSON.stringify({seen:{bfd_intro:true}}));}catch(e){} G.queueFor('blackfathom'); await sleep(300); G.acceptPop(); await sleep(2500); for(let k=0;k<5;k++){ document.querySelectorAll('button').forEach(b=>/^Skip$/.test(b.textContent.trim())&&b.click()); await sleep(400);} for(let i=0;i<40 && !G.fight;i++) await sleep(500); await sleep(3000); return !!G.fight;`);
  await shot('v41_5_bfd.png');
  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
