globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis;
G.newGame({name:'Sim',cls:'warrior'});
function party(size,skillBase){
  const roles=size===3?['tank','healer','dps']:['tank','healer','dps','dps','dps'];
  return roles.map((r,i)=>{const b=B.makeBot(9000+i,new Set(),{level:10});b.cls=r==='tank'?'warrior':r==='healer'?'priest':(['mage','rogue','mage'][i%3]);b.role=r;b.skill=skillBase+Math.random()*0.3;return G.botChar(b);});
}
function runAct(pulls,mult,bossMult,size,skill){
  const mem=party(size,skill); let wipes=0,time=0;
  for(const pull of pulls){
    let cleared=false,tries=0;
    while(!cleared&&tries<6){ tries++;
      for(const m of mem){m.hp=null;m.res=null;}
      const allies=mem.map(m=>{const u=E.charUnit(m,'ally','bot',0);u.bot={skill:m.bot.skill,react:0.9-0.6*m.bot.skill};return u;});
      const en=pull.mobs.map(k=>E.mobUnit(k,null,D.MOBS[k].boss?bossMult:mult));
      const C=E.fight(allies,en,{puller:allies[0],dungeonMult:mult});
      while(!C.over&&C.t<240)E.tick(C,0.1);
      time+=C.t; if(C.over==='win')cleared=true; else wipes++;
    }
    if(!cleared) return {fail:pull.label,wipes,time};
  }
  return {wipes,time};
}
const DM=D.DUNGEONS.deadmines;
const hogPulls=[{label:'g',mobs:['riverpaw_gnoll','riverpaw_gnoll']},{label:'Hogger',mobs:['hogger'],boss:true}];
for(const [name,fn] of [['Deadmines',(s)=>runAct(DM.pulls,DM.trashMult,DM.bossMult,5,s)],['Hogger',(s)=>runAct(hogPulls,{hp:1,dmg:1},{hp:1,dmg:1},3,s)]]){
  for(const skill of [0.25,0.5,0.7]){
    let n=60,fails=0,w=0,t=0; const failAt={};
    for(let i=0;i<n;i++){const r=fn(skill); if(r.fail){fails++;failAt[r.fail]=(failAt[r.fail]||0)+1;} w+=r.wipes;t+=r.time;}
    console.log(`${name} skill~${skill}: fail ${(fails/n*100).toFixed(0)}%  avg wipes ${(w/n).toFixed(2)}  combat time ${(t/n/60).toFixed(1)} min  failAt ${JSON.stringify(failAt)}`);
  }
}
// per-boss wipe rates at mid skill
for(const pull of DM.pulls.filter(p=>p.boss)){let wi=0;for(let i=0;i<80;i++){const r=runAct([pull],DM.trashMult,DM.bossMult,5,0.5);wi+=r.wipes;}console.log(pull.label,'wipes/attempt-run',(wi/80).toFixed(2));}
