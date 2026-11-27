import test from 'node:test';
import assert from 'node:assert/strict';
import {createNeckGeometry,updateNeckGeometry,SEGMENTS_PER_HALF,SEGMENTS_PER_BOND,NECK_SEGMENTS} from '../src/neck-geometry.js';
function fixture(activation){
 const nodes=[0,1,2].map(()=>({e:0,memory:0}));
 const bonds=[{i:0,j:1,activation},{i:1,j:2,activation}];
 const buffers=createNeckGeometry();updateNeckGeometry(buffers,nodes,bonds);
 return {nodes,bonds,buffers};
}
function distanceAt(p,buffers,from,to){
 let distance=Infinity;
 for(let i=from;i<to;i++){
  const a=Array.from(buffers.start.slice(i*4,i*4+4)),b=Array.from(buffers.end.slice(i*4,i*4+4));
  if(a[3]<=0)continue;
  const axis=b.slice(0,3).map((v,j)=>v-a[j]),len2=axis.reduce((s,v)=>s+v*v,0);
  const h=Math.max(0,Math.min(1,p.reduce((s,v,j)=>s+(v-a[j])*axis[j],0)/Math.max(len2,1e-6)));
  const d=Math.hypot(...p.map((v,j)=>v-a[j]-h*axis[j]))-(a[3]+h*(b[3]-a[3]));
  distance=Math.min(distance,d);
 }
 return distance;
}
test('neck geometry is absent at rest and disappears again after activation returns to zero',()=>{
 const {nodes,bonds,buffers}=fixture(0);
 assert.ok(buffers.start.every(v=>v===0)&&buffers.end.every(v=>v===0));
 bonds.forEach(b=>b.activation=1);updateNeckGeometry(buffers,nodes,bonds);
 assert.ok(buffers.start.some(v=>v!==0));
 bonds.forEach(b=>b.activation=0);updateNeckGeometry(buffers,nodes,bonds);
 assert.ok(buffers.start.every(v=>v===0)&&buffers.end.every(v=>v===0));
});
test('tendrils remain separated early, meet at full growth and have a pinched middle',()=>{
 const midpoints=[[-1.4,-.28,.18],[1.4,.36,-.28]];
 const partial=fixture(.12).buffers,full=fixture(1).buffers;
 for(let pair=0;pair<2;pair++){
  assert.ok(distanceAt(midpoints[pair],partial,pair*SEGMENTS_PER_BOND,(pair+1)*SEGMENTS_PER_BOND)>.25);
  assert.ok(distanceAt(midpoints[pair],full,pair*SEGMENTS_PER_BOND,(pair+1)*SEGMENTS_PER_BOND)<-.1);
  const leftEnd=Array.from(full.end.slice((pair*SEGMENTS_PER_BOND+SEGMENTS_PER_HALF-1)*4,(pair*SEGMENTS_PER_BOND+SEGMENTS_PER_HALF-1)*4+4));
  const rightEnd=Array.from(full.end.slice((pair*SEGMENTS_PER_BOND+SEGMENTS_PER_BOND-1)*4,(pair*SEGMENTS_PER_BOND+SEGMENTS_PER_BOND-1)*4+4));
  assert.deepEqual(leftEnd,rightEnd);
  assert.ok(leftEnd[3]<full.start[pair*SEGMENTS_PER_BOND*4+3]*.6);
 }
 // The first neck sags forward, the second arches backward.
 assert.ok(full.end[1]<0&&full.end[2]>0);
 assert.ok(full.end[SEGMENTS_PER_BOND*4+1]>0&&full.end[SEGMENTS_PER_BOND*4+2]<0);
});
test('strong excitation and retained memory keep neck endpoints inside the local proxy',()=>{
 const {nodes,bonds,buffers}=fixture(1);
 nodes.forEach((n,i)=>{n.e=i%2?10:-10;n.memory=1;});
 updateNeckGeometry(buffers,nodes,bonds);
 for(const data of [buffers.start,buffers.end])for(let i=0;i<NECK_SEGMENTS;i++){
  assert.ok(data.slice(i*4,i*4+4).every(Number.isFinite));
  assert.ok(Math.abs(data[i*4])+data[i*4+3]<4.8);
  assert.ok(Math.abs(data[i*4+1])+data[i*4+3]<3);
  assert.ok(Math.abs(data[i*4+2])+data[i*4+3]<2.7);
 }
});
