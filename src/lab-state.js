export const LAB_MATERIALS=Object.freeze([
 Object.freeze({name:'A � weich',stiffness:3.2,damping:1.05,forcing:0,memoryDecay:.65,memoryGain:.6,mobility:1.45,recoilFrequency:16,recoilDamping:5,yieldRate:.22}),
 Object.freeze({name:'B � dicht',stiffness:9,damping:1.6,forcing:0,memoryDecay:.3,memoryGain:.55,mobility:.65,recoilFrequency:22,recoilDamping:9,yieldRate:.09}),
 Object.freeze({name:'C � nachwirkend',stiffness:2.2,damping:.8,forcing:0,memoryDecay:.1,memoryGain:.7,mobility:1.1,recoilFrequency:11,recoilDamping:3,yieldRate:.34})
]);
const clamp01=value=>Math.max(0,Math.min(1,value));
const approach=(value,target,rate,dt)=>target+(value-target)*Math.exp(-dt*rate);
export function updateLabState(nodes,bonds,dt,held=false){
 for(const n of nodes){
  const target=Math.min(1,Math.hypot(n.e,n.v*.34));
  n.activity=approach(n.activity??0,target,target>(n.activity??0)?10:2.2,dt);
  n.recoil=0;
 }
 for(const b of bonds){
  const signal=Math.min(b.a.activity,b.b.activity)+.65*Math.min(b.a.memory,b.b.memory);
  const target=clamp01((signal-.025)/.32);
  const previous=b.activation??0;
  b.activation=approach(previous,target,target>previous?4:1.2,dt);
  if(!held&&b.activation>=.53)b.joined=true;
  if(held)b.joined=false;
  if(b.joined&&b.activation<.40){
   b.joined=false;
   b.releaseAge=0;
  }
  b.releaseAge=(b.releaseAge??Infinity)+dt;
  for(const [node,sign] of [[b.a,1],[b.b,-1]]){
   const age=b.releaseAge;
   if(age<2)node.recoil+=sign*.24*node.mobility*Math.exp(-age*node.recoilDamping)*Math.sin(age*node.recoilFrequency);
   const stress=Math.max(0,node.activity-(node.yieldThreshold??.25))*(held?1:b.activation);
   const key=sign>0?'setRight':'setLeft';
   const set=node[key]??0;
   node[key]=approach(set,1,node.yieldRate*stress,dt);
  }
 }
}
export function resetLabState(nodes,bonds){
 for(const n of nodes)Object.assign(n,{activity:0,recoil:0,setLeft:0,setRight:0});
 for(const b of bonds)Object.assign(b,{activation:0,joined:false,releaseAge:Infinity});
}

