export const LAB_MATERIALS=Object.freeze([
 Object.freeze({name:'A · weich',stiffness:3.2,damping:1.05,forcing:0,memoryDecay:.65,memoryGain:.6}),
 Object.freeze({name:'B · dicht',stiffness:9,damping:1.6,forcing:0,memoryDecay:.3,memoryGain:.55}),
 Object.freeze({name:'C · nachwirkend',stiffness:2.2,damping:.8,forcing:0,memoryDecay:.1,memoryGain:.7})
]);
export function updateLabState(nodes,bonds,dt){
 for(const n of nodes){
  const target=Math.min(1,Math.hypot(n.e,n.v*.34));
  const speed=target>(n.activity??0)?10:2.2;
  n.activity=(n.activity??0)+(target-(n.activity??0))*(1-Math.exp(-dt*speed));
 }
 for(const b of bonds){
  const signal=Math.min(b.a.activity,b.b.activity)+.65*Math.min(b.a.memory,b.b.memory);
  const target=Math.max(0,Math.min(1,(signal-.025)/.32));
  b.activation=(b.activation??0)+(target-(b.activation??0))*(1-Math.exp(-dt*(target>(b.activation??0)?4:1.2)));
 }
}
export function resetLabState(nodes,bonds){
 for(const n of nodes)n.activity=0;
 for(const b of bonds)b.activation=0;
}
