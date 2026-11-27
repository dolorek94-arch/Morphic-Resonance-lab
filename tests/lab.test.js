import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createLab} from '../src/lab.js';
import {createSimulation} from '../src/simulation.js';
import {createNeckGeometry,updateNeckGeometry,bodyVolumeScale} from '../src/neck-geometry.js';
function fixture(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(70,1,.1,100);
 const shared={clock:{value:0},origin:{value:new T.Vector2()},age:{value:100},strength:{value:1}};
 const world=createLab(T,scene,{},shared,camera),simulation=createSimulation(T,world);
 const tick=(dt,t)=>{simulation.evolve(dt,t);world.update(dt,false);};
 return {scene,world,simulation,tick};
}
test('an idle lab has no spontaneous excitation or permanent connections',()=>{
 const {world,tick}=fixture();
 for(let i=1;i<=600;i++)tick(1/60,i/60);
 for(const n of world.living){assert.equal(n.e,0);assert.equal(n.activity,0);assert.equal(n.memory,0);}
 for(const b of world.bonds)assert.equal(b.activation,0);
});
test('a selected impulse changes only the selected body at the instant of injection',()=>{
 for(let target=0;target<3;target++){
  const {world,simulation}=fixture();simulation.impulse(0,0,1,target);
  assert.deepEqual(world.living.map(n=>n.v),[0,1,2].map(i=>i===target?4:0));
 }
 const {world,simulation}=fixture();simulation.impulse(0,0,0,0);
 assert.deepEqual(world.living.map(n=>n.v),[0,0,0]);
});
test('a single impulse propagates A to B to C, raises connection activation and then releases it',()=>{
 const {world,simulation,tick}=fixture();simulation.impulse(0,0,1,0);
 const first=[null,null,null],maxBridge=[0,0];
 for(let i=1;i<=1800;i++){
  tick(1/60,i/60);
  world.living.forEach((n,j)=>{if(first[j]===null&&n.activity>.05)first[j]=i/60;});
  world.bonds.forEach((b,j)=>maxBridge[j]=Math.max(maxBridge[j],b.activation));
  if(i===900){
   assert.ok(world.living[2].memory>.1);
   assert.ok(world.living[0].memory<.01);
  }
 }
 assert.ok(first.every(Number.isFinite));
 assert.ok(first[0]<first[1]&&first[1]<first[2]);
 assert.ok(maxBridge[0]>.9&&maxBridge[1]>.55);
 for(const b of world.bonds)assert.ok(b.activation<.01);
});
test('material leaves the bodies for a neck, recoils after release and retains a form change',()=>{
 const {world,simulation,tick}=fixture();
 const geometry=createNeckGeometry();
 const [a,b]=world.living;
 const bond=world.bonds[0];
 let joined=false,released=false,minScale=1;
 for(let i=1;i<=3600;i++){
  if([1,241,481,721].includes(i))simulation.impulse(0,0,1,0);
  tick(1/60,i/60);
  updateNeckGeometry(geometry,world.living,world.bonds);
  if(bond.joined){
   joined=true;
   minScale=Math.min(minScale,bodyVolumeScale(geometry,0));
   const toSeamA=geometry.end[12]-geometry.start[0];
   const toSeamB=geometry.start[16]-geometry.end[28];
   assert.ok(toSeamA>toSeamB);
  }
  if(joined&&!bond.joined&&Math.abs(a.recoil)>.03)released=true;
 }
 assert.ok(joined&&released&&minScale<.97);
 assert.ok(bodyVolumeScale(geometry,0)>.999);
 assert.ok(Math.abs(a.recoil)<.001&&Math.abs(b.recoil)<.001);
 assert.ok(a.memory<.001&&a.setRight>.1);
 world.reset();
 assert.equal(a.setRight,0);
});
test('repeated maximum impulses stay finite and reset clears material and connection history',()=>{
 const {world,simulation,tick}=fixture();
 for(let i=1;i<=3600;i++){
  if(i%12===0)simulation.impulse(0,0,2,(i/12)%3);
  tick(1/60,i/60);
  for(const n of world.living){
   assert.ok(Number.isFinite(n.e)&&Math.abs(n.e)<10);
   assert.ok(n.memory>=0&&n.memory<=1);
   assert.ok(n.activity>=0&&n.activity<=1);
  }
  for(const b of world.bonds)assert.ok(b.activation>=0&&b.activation<=1);
 }
 for(const n of world.living){n.e=n.v=n.memory=0;}
 world.reset();simulation.evolve(0,0);world.update(0,false);
 for(const n of world.living)assert.equal(n.activity,0);
 for(const b of world.bonds)assert.equal(b.activation,0);
});

