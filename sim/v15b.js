globalThis.localStorage={_:{},getItem(k){return this._[k]||null},setItem(k,v){this._[k]=v},removeItem(k){delete this._[k]}};
let T=Date.now(); Date.now=()=>T;
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; const out=[];
const step=(s)=>{for(let i=0;i<s*10;i++){T+=100;G.update(0.1);}};
try{
 G.newGame({name:'Hunt',cls:'hunter'}); const P=G.S.player;
 out.push('hunter gear: '+Object.keys(P.equip).join(',')+' stats rap='+G.stats().rap);
 P.level=10; P.hp=null; P.res=null; P.place='fargodeep'; G.S.world={};
 const m=G.placeMobs().find(x=>G.tamable(x)); out.push('tamable here: '+(m&&m.key));
 G.tame(m.id); step(7); out.push('pet: '+JSON.stringify(P.pet));
 const t=G.placeMobs().find(x=>x.state==='alive'&&x.key!=='mangy_wolf'); G.engage(t.id); out.push('fight allies: '+G.fight.allies.map(u=>u.kind+':'+u.name).join(', '));
 let g=0; while(G.fight&&g<200){ G.useAbility('hunters_mark'); G.useAbility('serpent_sting'); G.useAbility('arcane_shot'); step(0.5); g++; }
 out.push('hunter won? deaths='+P.deaths+' pet hp='+P.pet.hp+' xp='+P.xp);
 // druid bear tank in deadmines
 G.newGame({name:'Bear',cls:'druid'}); const Q=G.S.player; Q.level=10; Q.hp=null; Q.res=null; G.setRole('tank');
 G.queueFor('deadmines'); G.S.queue.popAt=T; step(1.5); G.acceptPop();
 out.push('druid group: '+G.S.group.members.map(m=>m.cls+'/'+m.role).join(' '));
 let guard=0, shifted=false;
 while(G.S.run && G.S.run.phase!=='done' && guard<3000){ if(G.S.run.phase==='rest') G.runReady();
   if(G.fight){ const u=G.pUnit; if(!u.form){ if(!G.useAbility('bear_form')) shifted=true; } else { const loose=E.alive(G.fight.enemies).find(e=>e.target!==u.uid); if(loose){G.setTarget(loose.uid); G.useAbility('growl');} if(u.res>=15) G.useAbility('maul'); } }
   (G.S.run.rolls||[]).forEach((r,i)=>{if(!r.done&&!r.player)G.roll(i,'need')}); step(0.5); guard++; }
 out.push(`druid bear tank DM: phase=${G.S.run&&G.S.run.phase} idx=${G.S.run&&G.S.run.idx} wipes=${G.S.run&&G.S.run.wipes} shifted=${shifted} manaAfter=${Math.round(Q.res)} bags=${Q.bags.length}`);
 out.push('known after fight: '+G.knownAbilities().join(','));
}catch(e){ out.push('ERR '+e.stack.split('\n').slice(0,5).join(' | ')); }
console.log(out.join('\n'));
