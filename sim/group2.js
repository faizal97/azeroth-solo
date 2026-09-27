globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const DM=D.DUNGEONS.deadmines;
function fightBoss(comp,skill,key,n=60){ let deaths=0,loses=0,T=0;
  for(let k=0;k<n;k++){
    const mem=comp.map(([cls,role],i)=>{const b=B.makeBot(9000+i,new Set(),{level:10});b.cls=cls;b.role=role;b.skill=skill;return G.botChar(b);});
    const allies=mem.map(m=>{const u=E.charUnit(m,'ally','bot',0);u.bot={skill,react:0.9-0.6*skill};return u;});
    const en=[E.mobUnit(key,null,DM.bossMult)];
    const C=E.fight(allies,en,{puller:allies[0],dungeonMult:DM.trashMult});
    while(!C.over&&C.t<240){E.tick(C,0.1);C.events.length=0;}
    T+=C.t; deaths+=allies.filter(u=>u.dead).length; if(C.over!=='win')loses++;
  } return `deaths/fight ${(deaths/n).toFixed(2)} wipes ${(loses/n*100).toFixed(0)}% avg ${(T/n).toFixed(0)}s`; }
const comps={
 'warrior tank + priest heal':[['warrior','tank'],['priest','healer'],['mage','dps'],['rogue','dps'],['mage','dps']],
 'PALADIN tank + priest heal':[['paladin','tank'],['priest','healer'],['mage','dps'],['rogue','dps'],['mage','dps']],
 'warrior tank + PALADIN heal':[['warrior','tank'],['paladin','healer'],['mage','dps'],['rogue','dps'],['mage','dps']],
 'warrior + SHAMAN heal':[['warrior','tank'],['shaman','healer'],['mage','dps'],['rogue','dps'],['mage','dps']],
 'warrior + priest + SHAMAN dps':[['warrior','tank'],['priest','healer'],['shaman','dps'],['rogue','dps'],['mage','dps']],
 'warrior + priest + WARLOCK dps':[['warrior','tank'],['priest','healer'],['warlock','dps'],['rogue','dps'],['mage','dps']],
};
for(const [name,comp] of Object.entries(comps)) for(const s of [0.3,0.7]) console.log(name.padEnd(32),'skill',s,'VanCleef:',fightBoss(comp,s,'vancleef'));
