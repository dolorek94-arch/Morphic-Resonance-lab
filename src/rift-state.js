export const ARCH_NEAR=-4.5;
export const ARCH_FAR=-10.5;
export const ARCH_HALF_WIDTH=1.16;
export const RIFT_PULSE_TIMES=Object.freeze([1,11,21,31,41,51]);
const ARRIVAL=2.15;
const smooth=(a,b,x)=>{
 const t=Math.max(0,Math.min(1,(x-a)/(b-a)));
 return t*t*(3-2*t);
};
export const archProgress=z=>Math.max(0,Math.min(1,(ARCH_NEAR-z)/(ARCH_NEAR-ARCH_FAR)));
export const archCenter=u=>-.32*Math.sin(Math.PI*u);
export const waveAt=(age,distance)=>.55*Math.exp(-((age-distance)**2)*4.2)*Math.sin((age-distance)*8);
export function createRiftState(){
 return {
  age:-100,dose:0,settled:0,fracture:0,snap:0,origin:-2,
  pulse(strength,z){
   if(strength<=0||this.age>=0&&this.age<4.8)return;
   this.origin=Math.max(-3.8,Math.min(-.6,z));
   this.age=0;
   this.dose=Math.min(1,this.settled+Math.min(1,strength)*.91);
  },
  update(dt){
   if(this.age<0||dt<=0)return;
   const previous=this.age;
   this.age+=dt;
   if(previous<ARRIVAL&&this.age>=ARRIVAL)this.fracture=Math.max(this.fracture,this.dose);
   this.settled=Math.max(this.settled,this.dose*smooth(ARRIVAL,4.6,this.age));
   const recoil=Math.max(0,this.age-ARRIVAL);
   this.snap=this.age<ARRIVAL?0:Math.sin(recoil*13)*Math.exp(-recoil*2.8)*this.dose;
  },
  reset(){Object.assign(this,{age:-100,dose:0,settled:0,fracture:0,snap:0,origin:-2});}
 };
}
export function archHeight(state,x,z){
 const u=archProgress(z),span=Math.sin(Math.PI*u);
 const wave=waveAt(state.age,1.55+1.15*u);
 const crown=(3.9-3.85*state.settled+.34*state.snap)*span**1.65;
 return crown+span*(wave*.42+.07*(x-archCenter(u))**2);
}
export function riftGround(state,x,z){
 if(z>=ARCH_NEAR||z<=ARCH_FAR){
  const near=z>=ARCH_NEAR;
  const edge=near?z-ARCH_NEAR:ARCH_FAR-z;
  const distance=near?.20+Math.hypot(x+3.3,z-state.origin)*.30:2.8+edge*.26+Math.abs(x)*.06;
  return .26*smooth(0,1.4,edge)*waveAt(state.age,distance);
 }
 return Math.abs(x-archCenter(archProgress(z)))<=ARCH_HALF_WIDTH?archHeight(state,x,z):-3.6;
}
