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



  const hero = `G.newGame({name:'Aldric',cls:'warrior',race:'human'}); const P=G.S.player; P.level=18; P.money=500000; P.equip=G.botChar({name:'x',cls:'warrior',race:'human',level:18,skill:0.6}).equip; P.visited={}; P.story={intro:true}; G.S.flags.warModeAsked=true;`;
  // trainer in Stormwind
  await enter(`${hero} P.place='stormwind'; P.visited.stormwind=true; ${busyServer}`);
  await js(`${H} click(/People/); await sleep(300); click(/Artisan Hollis/); await sleep(600); return true;`);
  await shot('pr1_trainer.png');
  // miner + blacksmith with mats, at the_longshore (nodes on scene + chips)
  await enter(`${hero} P.place='the_longshore'; P.visited.the_longshore=true; P.prof={mining:{skill:92,max:150,known:[]},blacksmithing:{skill:112,max:150,known:['bs_silvered_breastplate']}}; for(const [i,n] of [['copper_ore',12],['tin_ore',9],['bronze_bar',14],['silver_bar',2],['coarse_stone',4],['light_leather',3]]) G.addItem(G.copyItem(i),n); G.addItem(G.copyItem('healing_potion'),3); G.addItem(G.copyItem('woolen_bag'),1); ${busyServer}`);
  await js(`${H} click(/Fight/); await sleep(1500); return true;`);
  await shot('pr2_nodes.png');
  await js(`${H} click(/^Hero$/); await sleep(500); click(/^Professions/); await sleep(600); return true;`);
  await shot('pr3_profs.png');
  await js(`${H} const rows=[...document.querySelectorAll('.sheet .row')]; const r=rows.find(x=>/Silvered Bronze Breastplate/.test(x.textContent)); if(r) r.click(); await sleep(500); return !!r;`);
  await shot('pr4_recipe.png');
  await js(`${H} document.querySelectorAll('.dialog .btn').forEach(b=>/Close/.test(b.textContent)&&b.click()); await sleep(200); click(/Mining/,'.chip'); await sleep(400); return true;`);
  await shot('pr5_smelting.png');
  await js(`${H} document.querySelector('.sheet .x, .sheet .close, [aria-label=Close]')?.click(); await sleep(300); click(/^Bags$/); await sleep(600); return true;`);
  await shot('pr6_bags.png');
  ws.close(); chrome.kill(); await sleep(1500); try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { /* chrome still closing */ }
})();
