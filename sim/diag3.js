globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
require('../src/data.js');require('../src/engine.js');require('../src/bots.js');require('../src/game.js');
const {D,E,B,G}=globalThis; G.newGame({name:'Sim',cls:'warrior'});
const DM=D.DUNGEONS.deadmines; let deaths=0,loses=0,healOom=0,n=50,tankTaken=0,T=0;
for(let k=0;k<n;k++){
const roles=['tank','healer','dps','dps','dps'];
const mem=roles.map((r,i)=>{const b=B.makeBot(9000+i,new Set(),{level:10});b.cls=r==='tank'?'warrior':r==='healer'?'priest':(['mage','rogue','mage'][i%3]);b.role=r;b.skill=0.7;return G.botChar(b);});
const allies=mem.map(m=>{const u=E.charUnit(m,'ally','bot',0);u.bot={skill:0.7,react:0.5};return u;});
const en=[E.mobUnit('vancleef',null,DM.bossMult)];
const C=E.fight(allies,en,{puller:allies[0],dungeonMult:DM.trashMult});
while(!C.over&&C.t<240){E.tick(C,0.1);for(const e of C.events){if(e.type==='dmg'&&C.units[e.tgt]===allies[0])tankTaken+=e.amount;}C.events.length=0;}
T+=C.t; deaths+=allies.filter(u=>u.dead).length; if(C.over!=='win')loses++; if(allies[1].res<40)healOom++;
}
console.log({deaths,loses,healOom,avgT:(T/n).toFixed(1),tankDps:(tankTaken/T).toFixed(1),bossDmg:E.mobUnit('vancleef',null,DM.bossMult).dmg});
