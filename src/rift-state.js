export const ARCH_NEAR=-4.5;
export const ARCH_FAR=-10.5;
export const RIFT_PULSE_TIMES=Object.freeze([1,11,21,31,41,51]);
const material={
 bank:{x:-1,z:-2.1,frequency:7.5,damping:2.3,compliance:.75},
 seam:{x:-4.4,z:-4.4,frequency:6,damping:1.9,compliance:1},
 rib:{x:-4.3,z:-6.3,frequency:13,damping:3.6,compliance:.30,threshold:.43,yieldSpan:.40},
 near:{x:-.1,z:ARCH_NEAR,frequency:8,damping:2.8,compliance:.52,threshold:.33,yieldSpan:.38},
 arch:{x:-.25,z:-7.5,frequency:7,damping:1.8,compliance:.74},
 far:{x:.18,z:ARCH_FAR,frequency:9,damping:2.6,compliance:.43,threshold:.27,yieldSpan:.29}
};
// Each connection carries a fraction of the arriving load in both directions.
const links=[
 ['bank','seam',5.6,.92],['seam','rib',3.3,.88],['rib','near',6,.86],
 ['near','arch',5.5,.90],['arch','far',5.0,.88]
];
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export const archProgress=z=>clamp((ARCH_NEAR-z)/(ARCH_NEAR-ARCH_FAR));
export const archCenter=u=>-.36*Math.sin(Math.PI*u)+.18*u;
export const archHalfWidth=u=>mix(1.42,.94,u)+Math.sin(u*11)*.16*Math.sin(Math.PI*u);

function createMorphs(){
 return Object.fromEntries(Object.entries(material).map(([name,profile])=>[name,{
  ...profile,scar:0,settlement:0,motion:0,velocity:0
 }]));
}
export function createRiftState(){
 const morphs=createMorphs(),packets=[];
 let time=0;
 function step(dt){
  time+=dt;
  for(let i=packets.length-1;i>=0;i--){
   const wave=packets[i];
   if(wave.arrival>time)continue;
   packets.splice(i,1);
   const morph=morphs[wave.to];
   morph.velocity+=wave.load*morph.frequency*morph.compliance;
   if(morph.threshold!==undefined){
    const excess=Math.max(0,wave.load-morph.threshold);
    morph.scar=clamp(morph.scar+excess/morph.yieldSpan);
   }
   for(const [a,b,speed,transmission] of links){
    const next=a===wave.to?b:b===wave.to?a:null;
    if(!next||next===wave.from)continue;
    const other=morphs[next];
    const travel=Math.hypot(morph.z-other.z,morph.x-other.x)/speed;
    packets.push({from:wave.to,to:next,load:wave.load*transmission,departure:wave.arrival,arrival:wave.arrival+travel});
   }
  }
  for(const morph of Object.values(morphs)){
   morph.velocity+=(-(morph.frequency**2)*morph.motion-2*morph.damping*morph.velocity)*dt;
   morph.motion+=morph.velocity*dt;
   morph.settlement+=(morph.scar-morph.settlement)*(1-Math.exp(-dt*2.8));
  }
 }
 return {
  morphs,
  age:-100,
  get settled(){return Math.min(morphs.near.settlement,morphs.far.settlement);},
  get fracture(){return morphs.rib.settlement;},
  get active(){return this.age>=0&&this.age<6;},
  get wave(){
   const packet=packets[0];
   if(!packet||!packet.from)return null;
   const a=morphs[packet.from],b=morphs[packet.to];
   const t=clamp((time-packet.departure)/(packet.arrival-packet.departure));
   return {x:mix(a.x,b.x,t),z:mix(a.z,b.z,t),load:packet.load};
  },
  pulse(strength,z){
   if(strength<=0||this.active)return;
   this.age=0;
   packets.push({to:z<ARCH_FAR?'far':'bank',load:Math.min(2,strength),departure:time,arrival:time});
  },
  update(dt){
   // Keep the elastic responses stable at variable render rates.
   const steps=Math.max(1,Math.ceil(dt*120));
   for(let i=0;i<steps;i++)step(dt/steps);
   this.age+=dt;
  },
  reset(){Object.assign(morphs,createMorphs());packets.length=0;time=0;this.age=-100;}
 };
}
export function archHeight(state,x,z){
 const u=archProgress(z),span=Math.sin(Math.PI*u);
 const {near,arch,far}=state.morphs;
 const support=mix(near.settlement,far.settlement,smooth(u));
 const motion=.36*mix(near.motion,far.motion,u)+.45*arch.motion*span;
 const crown=(3.9-3.72*support)*span**1.65;
 return crown+span*(motion+.11*(x-archCenter(u))**2);
}
export function riftGround(state,x,z){
 if(z>=ARCH_NEAR||z<=ARCH_FAR){
  const near=z>=ARCH_NEAR;
  const edge=near?z-ARCH_NEAR:ARCH_FAR-z;
  const source=near?state.morphs.bank:state.morphs.far;
  return .27*smooth(edge/1.4)*source.motion*Math.exp(-.05*((x-source.x)**2+(z-source.z)**2));
 }
 const u=archProgress(z);
 return Math.abs(x-archCenter(u))<=archHalfWidth(u)?archHeight(state,x,z):-3.6;
}
