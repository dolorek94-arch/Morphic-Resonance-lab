// Semi-implicit Euler with per-material response and bounded substeps.
export function integrate(nodes,bonds,dt,time){
 const steps=Math.max(1,Math.ceil(dt/.012)),h=dt/steps;
 for(let step=0;step<steps;step++){
  const tick=time-dt+(step+1)*h;
  const acc=nodes.map(n=>-(n.stiffness??5)*n.e-(n.damping??.95)*n.v+(n.forcing??.32)*Math.sin(tick*1.6+n.phase));
  for(const b of bonds){
   const force=(b.coupling??2.2)*(nodes[b.j].e-nodes[b.i].e)/b.d;
   acc[b.i]+=force;acc[b.j]-=force;
  }
  nodes.forEach((n,i)=>{
   n.v+=acc[i]*h;n.e+=n.v*h;
   n.memory=Math.min(1,n.memory*Math.exp(-h*(n.memoryDecay??.18))+Math.abs(n.e)*h*(n.memoryGain??.32));
  });
 }
}
