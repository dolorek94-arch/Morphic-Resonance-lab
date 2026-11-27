import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createWorld} from '../src/world.js';
import {createLab} from '../src/lab.js';
import {createSimulation} from '../src/simulation.js';
import {move,obstacles} from '../src/navigation.js';
function setup(factory){
 const scene=new T.Scene(),r={shadowMap:{}},camera=new T.PerspectiveCamera(70,1,.1,100);
 const shared={clock:{value:0},origin:{value:new T.Vector2()},age:{value:100},strength:{value:1}};
 return {scene,camera,world:factory(T,scene,r,shared,camera)};
}
for(const [name,factory,count] of [['world',createWorld,75],['lab',createLab,3]]){
 test(name+' builds offline, evolves finite geometry and keeps a clear reset point',()=>{
  const {scene,camera,world}=setup(factory);
  assert.equal(world.living.length,count);
  const sim=createSimulation(T,world);sim.impulse(0,0);
  for(let i=1;i<=600;i++)sim.evolve(1/60,i/60);
  world.update?.();
  scene.updateMatrixWorld(true);
  scene.traverse(o=>{
   assert.ok(o.matrixWorld.elements.every(Number.isFinite));
   const positions=o.geometry?.attributes.position;
   if(positions)assert.ok(positions.array.every(Number.isFinite));
   if(o.material?.uniforms?.projectionMatrix)
    assert.equal(o.material.uniforms.projectionMatrix.value,camera.projectionMatrix);
  });
  const spawn={x:0,z:0};move(spawn,{x:0,z:0},0,obstacles(world));
  assert.ok(Math.hypot(spawn.x,spawn.z)<.001);
  scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 });
}
test('world generation uses the same seed for repeatable comparisons',()=>{
 const a=setup(createWorld),b=setup(createWorld);
 assert.deepEqual(a.world.living.map(n=>n.base.toArray()),b.world.living.map(n=>n.base.toArray()));
});

