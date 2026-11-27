import {sampleTransport} from './transport.js';
export const SEGMENTS_PER_HALF=4;
export const SEGMENTS_PER_BOND=SEGMENTS_PER_HALF*2;
export const NECK_SEGMENTS=SEGMENTS_PER_BOND*2;
export function createNeckGeometry(){
 return {start:new Float32Array(NECK_SEGMENTS*4),end:new Float32Array(NECK_SEGMENTS*4)};
}
const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function updateNeckGeometry(buffers,nodes,bonds,{held=false}={}){
 buffers.start.fill(0);buffers.end.fill(0);
 bonds.forEach((bond,index)=>{
  const growth=held?1:smoothstep(.02,.62,bond.activation);
  if(growth<=.0001)return;
  const a=nodes[bond.i],b=nodes[bond.j],ea=Math.tanh(a.e),eb=Math.tanh(b.e);
  const memory=Math.min(a.memory,b.memory);
  const ax=(bond.i-1)*2.8,bx=(bond.j-1)*2.8;
  const ay=.20*ea+.12*a.memory,by=.20*eb+.12*b.memory;
  const bendY=index===0?-.28+.12*(ea-eb):.36+.10*(eb-ea);
  const bendZ=index===0?.18+.08*memory:-.28-.06*memory;
  function point(t){
   const arc=4*t*(1-t),envelope=Math.sin(Math.PI*t);
   const wave=sampleTransport(bond.wave,t);
   const bulge=.16*Math.tanh(2.4*wave.displacement+.35*wave.velocity)*envelope;
   const bend=.18*Math.tanh(2*wave.displacement)*envelope;
   const twist=.07*Math.tanh(.25*wave.velocity)*envelope;
   const radius=.13+.19*Math.pow(Math.abs(2*t-1),.7)+.05*memory;
   return [
    ax+(bx-ax)*t,ay+(by-ay)*t+bendY*arc+bend,bendZ*arc+twist,
    Math.max(.055,radius+bulge)*Math.min(1,growth*4)
   ];
  }
  for(let side=0;side<2;side++)for(let segment=0;segment<SEGMENTS_PER_HALF;segment++){
   const from=growth*.5*segment/SEGMENTS_PER_HALF,to=growth*.5*(segment+1)/SEGMENTS_PER_HALF;
   const offset=(index*SEGMENTS_PER_BOND+side*SEGMENTS_PER_HALF+segment)*4;
   buffers.start.set(point(side===0?from:1-from),offset);
   buffers.end.set(point(side===0?to:1-to),offset);
  }
 });
}
