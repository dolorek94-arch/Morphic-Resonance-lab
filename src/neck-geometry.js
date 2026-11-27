// A pair of curved, tapered tendrils grows from each body's interior.
// The same endpoint/radius payload is uploaded to the raymarching shader.
export function createNeckGeometry(){
 return {start:new Float32Array(32),end:new Float32Array(32)};
}
const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function updateNeckGeometry(buffers,nodes,bonds){
 buffers.start.fill(0);buffers.end.fill(0);
 bonds.forEach((bond,index)=>{
  const growth=smoothstep(.02,.62,bond.activation);
  if(growth<=.0001)return;
  const a=nodes[bond.i],b=nodes[bond.j],ea=Math.tanh(a.e),eb=Math.tanh(b.e);
  const memory=Math.min(a.memory,b.memory);
  const ax=(bond.i-1)*2.8,bx=(bond.j-1)*2.8;
  const ay=.20*ea+.12*a.memory,by=.20*eb+.12*b.memory;
  const bendY=index===0?-.28+.12*(ea-eb):.36+.10*(eb-ea);
  const bendZ=index===0?.18+.08*memory:-.28-.06*memory;
  function point(t){
   const arc=4*t*(1-t);
   return [ax+(bx-ax)*t,ay+(by-ay)*t+bendY*arc,bendZ*arc,
    (.13+.19*Math.pow(Math.abs(2*t-1),.7)+.05*memory)*Math.min(1,growth*4)];
  }
  for(let side=0;side<2;side++)for(let segment=0;segment<2;segment++){
   const from=growth*.5*segment/2,to=growth*.5*(segment+1)/2;
   const offset=(index*4+side*2+segment)*4;
   buffers.start.set(point(side===0?from:1-from),offset);
   buffers.end.set(point(side===0?to:1-to),offset);
  }
 });
}
