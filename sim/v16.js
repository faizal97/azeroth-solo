globalThis.localStorage={_:{},getItem(k){return k in this._?this._[k]:null},setItem(k,v){this._[k]=String(v)},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[]; const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
try{
 G.newGame({name:'Brom',race:'dwarf',cls:'paladin'}); const P=G.S.player;
 out.push('start '+P.place+' bind '+P.bind+' race '+P.race);
 for(const npc of D.PLACES.anvilmar.npcs) for(const q of G.npcQuests(npc)) if(q.st==='available') G.accept(q.qid);
 out.push('quests '+Object.keys(P.quests).join(','));
 let k=0; for(let i=0;i<80&&k<25;i++){ const m=G.placeMobs().find(x=>x.state==='alive'); if(!m){step(5);continue;} G.engage(m.id); let g=0; while(G.fight&&g<300){ G.useAbility('seal_righteousness'); G.useAbility('judgement'); step(0.5); g++; } k++; if(P.ghostUntil) step(16); if(P.hp<P.level*20){ G.consume('food'); step(18);} }
 out.push(`kills ${k} lvl ${P.level} deaths ${P.deaths} ` + Object.keys(P.quests).map(q=>q+':'+G.questState(q)).join(' '));
 for(const q of Object.keys(P.quests)) if(G.questState(q)==='complete') G.turnIn(q);
 out.push('after turn-in lvl '+P.level+' done '+Object.keys(P.done).join(','));
 G.travelTo('kharanos'); step(31); out.push('now at '+P.place); G.travelTo('ironforge'); step(21); out.push('now at '+P.place+' links '+JSON.stringify(D.PLACES[P.place].links));
 G.travelTo('goldshire'); step(46); out.push('tram to '+P.place);
 P.level=10; P.hp=null; G.queueFor('vagash'); G.S.queue.popAt=T; step(1.5); G.acceptPop();
 let guard=0; while(G.S.run && G.S.run.phase!=='done' && guard<2000){ if(G.fight){G.useAbility('seal_righteousness');G.useAbility('judgement');} (G.S.run.rolls||[]).forEach((r,i)=>{if(!r.done&&!r.player)G.roll(i,'need')}); step(0.5); guard++; }
 out.push(`vagash run: ${G.S.run&&G.S.run.phase} wipes ${G.S.run&&G.S.run.wipes}; loot: `+G.S.chat.filter(m=>m.ch==='loot'&&/won/.test(m.text)).map(m=>m.text).join(' | '));
 const dated=new Date(T); const regions={}; for(const b of G.S.bots){ const r=B.regionFor(b,Math.floor(T/600000)); regions[(b.race||'none')+'>'+r]=(regions[(b.race||'none')+'>'+r]||0)+1; } out.push('bot regions '+JSON.stringify(regions));
 out.push('online at anvilmar '+B.onlineIn(G.S,'anvilmar',dated).length+', northshire '+B.onlineIn(G.S,'northshire_abbey',dated).length);
}catch(e){out.push('ERR '+e.stack.split('\n').slice(0,4).join(' | '));}
console.log(out.join('\n'));
