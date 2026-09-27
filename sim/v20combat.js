require('../src/data.js'); require('../src/engine.js');
const D=globalThis.D,E=globalThis.E;
function gearFor(cls,L){ const C=D.CLASSES[cls]; const w=D.ITEMS[C.startWeapon]; const sc=1+(L-1)*0.22;
  const eq={weapon:Object.assign({},w,{dmg:[w.dmg[0]*sc,w.dmg[1]*sc]})}; if(C.startRanged){const r=D.ITEMS[C.startRanged]; eq.ranged=Object.assign({},r,{dmg:[r.dmg[0]*sc,r.dmg[1]*sc]});}
  return {...eq, chest:{armor:8*({cloth:.25,leather:.55,mail:1}[C.armorType])*(L+2)*0.9, stats:{sta:Math.floor(L/3)}}}; }
function run(cls,L,pet,n=300){
  let win=0,t=0,hpLoss=0,res=0;
  for(let i=0;i<n;i++){
    const ch={name:'P',cls,level:L,equip:gearFor(cls,L),role:'dps'};
    const p=E.charUnit(ch,'ally','bot',0); p.bot={skill:0.8,react:0.3};
    const allies=[p]; if(pet && pet!=='BEAR'){ const pu=E.petUnit(pet,L,{uid:p.uid,mob:'mangy_wolf'}); allies.push(pu);} if(pet==='BEAR'){ p.role='tank'; E.shiftIn({t:0,events:[]},p,'bear');} 
    const m=E.mobUnit(process.env.MOB||'young_wolf',L+(+(process.env.UP||0)));
    const C=E.fight(allies,[m],{soloUid:p.uid}); const hp0=p.hp,r0=p.res;
    while(!C.over&&C.t<120)E.tick(C,0.1);
    if(C.over==='win'){win++;t+=C.t;hpLoss+=(hp0-p.hp)/p.maxHp;res+=(r0-p.res)/p.maxRes;}
  }
  return `${(cls+(pet?'+'+pet:'')).padEnd(18)} L${String(L).padEnd(2)} win ${(win/n*100).toFixed(0)}%  ttk ${(t/win).toFixed(1)}s  hp lost ${(hpLoss/win*100).toFixed(0)}%  mana ${(res/win*100).toFixed(0)}%`;
}
// v2.0: every class at 12 and 15 against the new zone mobs (same level)
const mobs=['defias_pathstalker','harvest_watcher','goretusk','murloc_tidehunter','riverpaw_brute','kolkar_wrangler','oasis_snapjaw','razormane_thornweaver','kolkar_stormer','stormsnout'];
for (const L of (process.env.LV||'12,15').split(',').map(Number)) for (const cls of Object.keys(D.CLASSES)) { const out=[]; for (const mob of (process.env.MOBS||'defias_pathstalker,oasis_snapjaw,riverpaw_brute').split(',')) { process.env.MOB=mob; out.push(run(cls,L,cls==='hunter'?'beast':cls==='warlock'?'voidwalker':null,120).replace(/^\S+\s+L\d+\s+/,'')); } console.log(cls.padEnd(8),'L'+L,'|',out.join(' | ')); }
