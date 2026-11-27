import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createLab} from '../src/lab.js';
import {createSimulation} from '../src/simulation.js';
function fixture(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(70,1,.1,100);
 const shared={clock:{value:0},origin:{value:new T.Vector2()},age:{value:100},strength:{value:1}};
 const world=createLab(T,scene,{},shared,camera),simulation=createSimulation(T,world);
 const floor=scene.children.find(o=>o.geometry?.type==='PlaneGeometry');
 const body=scene.children.find(o=>o.geometry?.type==='BoxGeometry');
 return {world,simulation,floor,body};
}
test('ground shadow and camera materials share live deformation and neck data',()=>{
 const {world,simulation,floor,body}=fixture();
 const ground=floor.material.uniforms,surface=body.material.uniforms;
 for(const key of ['center','displacement','memory','neckStart','neckEnd','lightDirection','halfBounds'])
  assert.equal(ground[key],surface[key],key);
 assert.ok(ground.neckStart.value.every(v=>v===0));
 simulation.impulse(0,0,1,0);
 for(let i=1;i<=90;i++){simulation.evolve(1/60,i/60);world.update(1/60,false,true);}
 assert.ok(ground.neckStart.value.some(v=>v!==0));
 assert.ok(ground.displacement.value.toArray().some(v=>v!==0));
 assert.ok(ground.neckStart.value.every(Number.isFinite));
});
test('lighting rays use normalized direction and matching bounds; comparison preserves geometry',()=>{
 const {world,simulation,floor,body}=fixture(),u=body.material.uniforms;
 assert.ok(Math.abs(u.lightDirection.value.length()-1)<1e-10);
 assert.equal(body.geometry.parameters.width,u.halfBounds.value.x*2);
 assert.equal(body.geometry.parameters.height,u.halfBounds.value.y*2);
 assert.equal(body.geometry.parameters.depth,u.halfBounds.value.z*2);
 simulation.impulse(0,0,1,0);simulation.evolve(.05,.05);world.update(.05,false,true);
 const before=Array.from(u.neckStart.value);
 world.update(0,false,false);
 assert.equal(u.shadowEnabled.value,0);
 assert.equal(floor.material.uniforms.shadowEnabled.value,0);
 assert.deepEqual(Array.from(u.neckStart.value),before);
 world.update(0,false,true);
 assert.equal(floor.material.uniforms.shadowEnabled.value,1);
});
