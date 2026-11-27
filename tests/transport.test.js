import test from 'node:test';
import assert from 'node:assert/strict';
import {LAB_MATERIALS} from '../src/lab-state.js';
import {createTransport,TRANSPORT_CELLS} from '../src/transport.js';
import {createNeckGeometry,updateNeckGeometry} from '../src/neck-geometry.js';
test('transport stays consistent across 30, 60 and 180 simulation updates per second',()=>{
 function sample(rate){
  const {nodes,transport}=fixture();nodes[0].v=4;
  for(let i=1;i<=rate*3;i++)transport.integrate(1/rate,i/rate);
  return nodes.map(n=>n.e);
 }
 const reference=sample(180);
 for(const rate of [30,60]){
  const result=sample(rate);
  result.forEach((value,i)=>assert.ok(Math.abs(value-reference[i])<.08));
 }
});
function fixture(stiffness=9){
 const nodes=LAB_MATERIALS.map(p=>({...p,e:0,v:0,memory:0,phase:0}));
 nodes[1].stiffness=stiffness;
 const bonds=[{i:0,j:1,activation:0},{i:1,j:2,activation:0}];
 const transport=createTransport(nodes,bonds);
 return {nodes,bonds,transport};
}
function energy({particles,springs}){
 return particles.reduce((sum,n)=>sum+.5*(n.mass??1)*n.v*n.v+.5*n.stiffness*n.e*n.e,0)
  +springs.reduce((sum,b)=>sum+.5*b.coupling/b.d*(particles[b.i].e-particles[b.j].e)**2,0);
}
test('the impulse crosses internal cells in order before reaching B and then C',()=>{
 const {nodes,bonds,transport}=fixture(),arrival=Array(TRANSPORT_CELLS+1).fill(null);
 nodes[0].v=4;let cArrival=null;
 for(let i=1;i<=960;i++){
  const t=i/240;transport.integrate(1/240,t);
  bonds[0].wave.forEach((n,j)=>{if(arrival[j]===null&&Math.abs(n.e)>.01)arrival[j]=t;});
  if(cArrival===null&&Math.abs(nodes[2].e)>.01)cArrival=t;
 }
 assert.ok(arrival.every(Number.isFinite));
 for(let i=1;i<arrival.length;i++)assert.ok(arrival[i]>arrival[i-1]);
 assert.ok(arrival.at(-1)>.5&&arrival.at(-1)<2);
 assert.ok(cArrival>arrival.at(-1)+.5&&cArrival<3);
});
test('fixed-chain mechanical energy decays without excitation and remains finite',()=>{
 const {nodes,transport}=fixture();nodes[0].v=4;
 const initial=energy(transport);let maximum=initial;
 for(let i=1;i<=4800;i++){
  transport.integrate(1/240,i/240);
  maximum=Math.max(maximum,energy(transport));
  for(const n of transport.particles)assert.ok(Number.isFinite(n.e)&&Number.isFinite(n.v));
 }
 assert.ok(maximum<initial*1.02);
 assert.ok(energy(transport)<initial*.01);
});
test('a downstream material changes the later returning response upstream',()=>{
 function response(stiffness){
  const {bonds,transport}=fixture(stiffness);bonds[0].wave[5].v=2;
  const result=[];
  for(let i=1;i<=480;i++){
   transport.integrate(1/240,i/240);
   if(i===24||i===480)result.push(bonds[0].wave[4].e);
  }
  return result;
 }
 const soft=response(2),dense=response(18);
 assert.ok(Math.abs(soft[0]-dense[0])<1e-10);
 assert.ok(Math.abs(soft[1]-dense[1])>.02);
});
test('held necks are visible at rest and carry spatially varying simulated deformation',()=>{
 const {nodes,bonds,transport}=fixture(),buffers=createNeckGeometry();
 updateNeckGeometry(buffers,nodes,bonds,{held:true});
 const idle=Float32Array.from(buffers.end);
 assert.ok(buffers.end.some(v=>v!==0));
 assert.ok(transport.particles.every(n=>n.e===0&&n.v===0));
 nodes[0].v=4;
 for(let i=1;i<=120;i++)transport.integrate(1/240,i/240);
 updateNeckGeometry(buffers,nodes,bonds,{held:true});
 assert.ok(buffers.end.some((v,i)=>Math.abs(v-idle[i])>.03));
 // The first neck's wave is measurable before the second has received the packet.
 const chainA=bonds[0].wave,chainB=bonds[1].wave;
 assert.ok(Math.abs(chainA[3].e)>.1);
 assert.ok(Math.abs(chainB[3].e)<.001);
 updateNeckGeometry(buffers,nodes,bonds,{held:false});
 assert.ok(buffers.end.every(v=>v===0));
});
test('transport reset clears internal velocities, deformation and memory',()=>{
 const {nodes,transport}=fixture();nodes[0].v=4;
 for(let i=1;i<=480;i++)transport.integrate(1/240,i/240);
 assert.ok(transport.particles.slice(3).some(n=>Math.abs(n.e)>.001));
 nodes.forEach(n=>{n.e=n.v=n.memory=0;});transport.reset();
 for(const n of transport.particles)assert.equal(Math.abs(n.e)+Math.abs(n.v)+n.memory,0);
});
