import {sampleTransport} from './transport.js';
export const SEGMENTS_PER_HALF=4;
export const SEGMENTS_PER_BOND=SEGMENTS_PER_HALF*2;
export const NECK_SEGMENTS=SEGMENTS_PER_BOND*2;
const BASE_VOLUMES=[2.75,3.8,1.85];
const SHOULDER=.22;
export function createNeckGeometry(){
 return {start:new Float32Array(NECK_SEGMENTS*4),end:new Float32Array(NECK_SEGMENTS*4),
  bodyVolume:new Float32Array(3)};
}
const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function updateNeckGeometry(buffers,nodes,bonds,{held=false}={}){
 buffers.start.fill(0);buffers.end.fill(0);
 buffers.bodyVolume.set(BASE_VOLUMES);
 bonds.forEach((bond,index)=>{
  const growth=held?1:smoothstep(.02,.53,bond.activation);
  if(growth<=.0001)return;
  const a=nodes[bond.i],b=nodes[bond.j],ea=Math.tanh(a.e),eb=Math.tanh(b.e);
  const mobilityA=a.mobility??1,mobilityB=b.mobility??1;
  const seam=.5+.38*(mobilityA-mobilityB)/(mobilityA+mobilityB);
  const ax=(bond.i-1)*2.8-(a.recoil??0),bx=(bond.j-1)*2.8-(b.recoil??0);
  const ay=.20*ea+.12*a.memory,by=.20*eb+.12*b.memory;
  const bendY=index===0?-.28+.12*(ea-eb):.36+.10*(eb-ea);
  const memory=Math.min(a.memory,b.memory);
  const bendZ=index===0?.18+.08*memory:-.28-.06*memory;
  const joined=held||(bond.joined??bond.activation>=.53);
  const pinch=joined?smoothstep(.40,.53,bond.activation):growth;
  const release=held?0:.26*Math.exp(-(bond.releaseAge??Infinity)*9);
  function point(t,radius){
   const arc=4*t*(1-t),envelope=Math.sin(Math.PI*t);
   const wave=sampleTransport(bond.wave,t);
   const bend=.16*Math.tanh(2*wave.displacement)*envelope;
   const twist=.07*Math.tanh(.25*wave.velocity)*envelope;
   return [ax+(bx-ax)*t,ay+(by-ay)*t+bendY*arc+bend,bendZ*arc+twist,radius];
  }
  for(let side=0;side<2;side++){
   const node=side===0?a:b;
   const bodyIndex=side===0?bond.i:bond.j;
   const mobility=node.mobility??1;
   const root=side===0?SHOULDER:1-SHOULDER;
   const tip=root+(seam-root)*Math.max(0,(joined?1:growth)-release);
   const shoulderRadius=(.30+.09*mobility)*Math.sqrt(growth);
   const tipRadius=(joined?.07+.10*(held?1:pinch):.045)*Math.sqrt(growth);
   function sample(u){
    const t=root+(tip-root)*u;
    const wave=sampleTransport(bond.wave,t);
    const ripple=.075*Math.tanh(2.4*wave.displacement+.35*wave.velocity)*Math.sin(Math.PI*u)*growth;
    const radius=tipRadius+(shoulderRadius-tipRadius)*Math.pow(1-u,1.4)+ripple;
    return point(t,Math.max(.005,radius));
   }
   let start=sample(0),volume=0;
   for(let segment=0;segment<SEGMENTS_PER_HALF;segment++){
    const end=sample((segment+1)/SEGMENTS_PER_HALF);
    const offset=(index*SEGMENTS_PER_BOND+side*SEGMENTS_PER_HALF+segment)*4;
    buffers.start.set(start,offset);buffers.end.set(end,offset);
    const length=Math.hypot(end[0]-start[0],end[1]-start[1],end[2]-start[2]);
    // The shoulder overlaps its body. Only count the portion extending past it.
    const exposed=segment===0?.25:1;
    volume+=exposed*Math.PI*length*(start[3]**2+start[3]*end[3]+end[3]**2)/3;
    start=end;
   }
   buffers.bodyVolume[bodyIndex]-=volume;
  }
 });
}
export function bodyVolumeScale(geometry,index){
 return Math.cbrt(Math.max(.60,geometry.bodyVolume[index]/BASE_VOLUMES[index]));
}

