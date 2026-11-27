import {integrate} from './oscillators.js';
export const TRANSPORT_CELLS=8;
export function createTransport(nodes,bonds){
 const particles=[...nodes],springs=[];
 for(const bond of bonds){
  const chain=[nodes[bond.i]];
  let previous=bond.i;
  for(let cell=1;cell<TRANSPORT_CELLS;cell++){
   const particle={e:0,v:0,memory:0,phase:0,mass:.2,stiffness:.15,damping:.09,forcing:0,memoryDecay:.6,memoryGain:.2};
   const index=particles.push(particle)-1;
   chain.push(particle);
   springs.push({i:previous,j:index,d:1,coupling:12});
   previous=index;
  }
  springs.push({i:previous,j:bond.j,d:1,coupling:12});
  chain.push(nodes[bond.j]);
  bond.wave=chain;
 }
 return {
  particles,springs,
  integrate(dt,time){integrate(particles,springs,dt,time);},
  reset(){
   for(const p of particles.slice(nodes.length)){p.e=0;p.v=0;p.memory=0;}
  }
 };
}
export function sampleTransport(chain,t){
 if(!chain)return {displacement:0,velocity:0};
 const coordinate=Math.max(0,Math.min(1,t))*(chain.length-1);
 const index=Math.min(chain.length-2,Math.floor(coordinate)),blend=coordinate-index;
 return {
  displacement:chain[index].e+(chain[index+1].e-chain[index].e)*blend,
  velocity:chain[index].v+(chain[index+1].v-chain[index].v)*blend
 };
}
