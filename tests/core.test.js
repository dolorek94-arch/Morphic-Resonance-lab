import test from 'node:test';
import assert from 'node:assert/strict';
import {direction,resolveCircle,move} from '../src/navigation.js';
import {integrate} from '../src/oscillators.js';
test('W follows camera forward at all four cardinal headings',()=>{
 for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const v=direction(yaw,0,1);
  assert.ok(Math.abs(v.x+Math.sin(yaw))<1e-10);
  assert.ok(Math.abs(v.z+Math.cos(yaw))<1e-10);
  const right=direction(yaw,1,0);assert.ok(Math.abs(right.x*v.x+right.z*v.z)<1e-10);
 }
});
test('collision escapes coincident centers and movement cannot tunnel through a body',()=>{
 const p={x:0,z:0};resolveCircle(p,{x:0,z:0,radius:1});
 assert.ok(Math.abs(Math.hypot(p.x,p.z)-1.35)<1e-9);
 const walker={x:-3,z:0};
 move(walker,{x:100,z:0},.05,[{type:'circle',x:0,z:0,radius:1,minY:-10,maxY:10}]);
 assert.ok(walker.x<=-1.35+1e-8);
});
test('collision respects vertical separation and boxes push out exact interior positions',()=>{
 const p={x:0,z:0};
 move(p,{x:0,z:0},0,[{type:'box',minX:-1,maxX:1,minZ:-1,maxZ:1,minY:-10,maxY:10}]);
 assert.ok(Math.abs(p.x)>=1.35||Math.abs(p.z)>=1.35);
 const airborne={x:0,z:0};
 move(airborne,{x:0,z:0},0,[{type:'circle',x:0,z:0,radius:2,minY:20,maxY:25}]);
 assert.deepEqual(airborne,{x:0,z:0});
});
test('resonance crosses a bond and remains finite under sustained large impulses',()=>{
 const nodes=[{e:0,v:4,memory:0,phase:0},{e:0,v:0,memory:0,phase:Math.PI}];
 const bonds=[{i:0,j:1,d:2}];
 for(let i=1;i<=30;i++)integrate(nodes,bonds,.01,i*.01);
 assert.ok(Math.abs(nodes[1].e)>.001);
 for(let i=31;i<=6000;i++){
  if(i%100===0)nodes[0].v+=4;
  integrate(nodes,bonds,.05,i*.05);
  for(const n of nodes){assert.ok(Number.isFinite(n.e)&&Math.abs(n.e)<10);assert.ok(n.memory>=0&&n.memory<=1);}
 }
});
test('material memory relaxes after excitation with no external forcing',()=>{
 const n={e:0,v:0,memory:1,phase:0};
 for(let i=0;i<1000;i++)integrate([n],[],.01,0);
 assert.ok(n.memory<.2);
});

