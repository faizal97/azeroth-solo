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





  const seen = `try{localStorage.setItem('azsolo.story', JSON.stringify(['intro','ch1','ch2','ch3','ch4','ch5','ch6','sm_intro','zf_intro','md_intro','brd_intro','scholo_intro','strat_intro']));}catch(e){}`;
  await enter(`${hero('human','warrior',57)} P.place='everlook'; P.visited.everlook=true; ${busyServer} ${seen}`);
  await js(`${H} click(/People/); await sleep(800); return true;`);
  await shot('v8_1_everlook.png');
  await enter(`${hero('undead','rogue',56)} P.place='the_bulwark'; P.visited.the_bulwark=true; ${busyServer} ${seen}`);
  await js(`${H} click(/Travel/); await sleep(800); return true;`);
  await shot('v8_2_bulwark.png');
  await enter(`${hero('gnome','warlock',59)} P.place='caer_darrow'; P.visited.caer_darrow=true; ${busyServer} ${seen}`);
  await js(`${H} G.queueFor('scholomance'); await sleep(300); G.acceptPop(); await sleep(2500); for(let k=0;k<5;k++){ document.querySelectorAll('button').forEach(b=>/^Skip$/.test(b.textContent.trim())&&b.click()); await sleep(400);} for(let i=0;i<40 && !G.fight;i++) await sleep(500); await sleep(3000); return !!G.fight;`);
  await shot('v8_3_scholomance.png');
  await enter(`${hero('tauren','paladin',59)} P.place='stratholme_gate'; P.visited.stratholme_gate=true; ${busyServer} ${seen}`);
  await js(`${H} G.queueFor('stratholme'); await sleep(300); G.acceptPop(); await sleep(2500); for(let k=0;k<5;k++){ document.querySelectorAll('button').forEach(b=>/^Skip$/.test(b.textContent.trim())&&b.click()); await sleep(400);} for(let i=0;i<40 && !G.fight;i++) await sleep(500); await sleep(3000); return !!G.fight;`);
  await shot('v8_4_stratholme.png');
  await enter(`${hero('human','mage',60)} P.place='stormwind'; P.visited.stormwind=true; P.story.ch5=true; ${busyServer} try{localStorage.setItem('azsolo.story', JSON.stringify(['intro','ch1','ch2','ch3','ch4','ch5']));}catch(e){}`);
  await js(`${H} await sleep(6500); return true;`);
  await shot('v8_5_ch6_a.png');
  await js(`${H} await sleep(13000); return true;`);
  await shot('v8_6_ch6_b.png');
  await js(`${H} await sleep(22000); return true;`);
  await shot('v8_7_ch6_c.png');
  await js(`${H} await sleep(11000); return true;`);
  await shot('v8_8_ch6_d.png');
  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
