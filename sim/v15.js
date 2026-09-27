globalThis.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[];
const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
function grind(n, abs){ let k=0; for(let i=0;i<n*3 && k<n;i++){ const m=G.placeMobs().find(x=>x.state==='alive'); if(!m){step(5);continue;} G.engage(m.id); let g=0; while(G.fight&&g<400){ for(const a of abs) if(!G.useAbility(a)) break; step(0.5); g++; } k++; if(G.S.player.ghostUntil) step(16); step(8);} return k; }
try{
 // warlock
 G.newGame({name:'Lock',cls:'warlock'}); const P=G.S.player;
 out.push('warlock starts with pet: '+JSON.stringify(P.pet));
 const k=grind(6,['corruption','immolate','shadow_bolt']);
 out.push(`warlock kills=${k} lvl=${P.level} deaths=${P.deaths} pet=${JSON.stringify(P.pet)}`);
 P.level=10; P.hp=null; P.res=null; G.summon('voidwalker'); step(7); out.push('after summon: '+JSON.stringify(P.pet));
 grind(3,['curse_of_agony','corruption','shadow_bolt']); out.push(`warlock L10 w/ VW deaths=${P.deaths} pet hp=${P.pet&&P.pet.hp}`);
 G.castOutOfCombat('life_tap'); out.push('lifetap ooc ok: res='+Math.round(P.res));
 // paladin healer in deadmines
 G.newGame({name:'Pally',cls:'paladin'}); const Q=G.S.player; Q.level=10; Q.hp=null; Q.res=null;
 out.push('paladin roles '+G.roles()+' role='+G.role()); G.setRole('tank'); out.push('now '+G.role()); G.setRole('healer');
 G.queueFor('deadmines'); G.S.queue.popAt=T; step(1.5); G.acceptPop();
 out.push('group: '+G.S.group.members.map(m=>m.cls+'/'+m.role).join(' '));
 let guard=0; while(G.S.run && G.S.run.phase!=='done' && guard<3000){ if(G.fight){ const low=E.alive(G.fight.allies).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(low.hp/low.maxHp<0.6){ G.setTarget(low.uid); G.useAbility('holy_light'); } else { G.useAbility('seal_righteousness'); G.useAbility('judgement'); } } (G.S.run.rolls||[]).forEach((r,i)=>{if(!r.done&&!r.player)G.roll(i,'greed')}); step(0.5); guard++; }
 out.push(`deadmines as paladin healer: phase=${G.S.run&&G.S.run.phase} idx=${G.S.run&&G.S.run.idx} wipes=${G.S.run&&G.S.run.wipes} min=${(guard*0.5/60).toFixed(1)}`);
 // save round trip
 G.save(); const S2=JSON.parse(localStorage.getItem('azsolo.save.v1')); out.push('save ok cls='+S2.player.cls+' role='+S2.player.role);
}catch(e){ out.push('ERR '+e.stack.split('\n').slice(0,4).join(' | ')); }
console.log(out.join('\n'));
