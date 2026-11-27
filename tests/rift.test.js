import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createRift} from '../src/rift.js';
import {ARCH_NEAR,ARCH_FAR,archProgress,archCenter,archHeight,createRiftState} from '../src/rift-state.js';
import {move,obstacles} from '../src/navigation.js';

test('the same path is too steep before the pulse and crosses the exposed chasm afterwards',()=>{
 const scene=new T.Scene(),renderer={shadowMap:{}};
 const world=createRift(T,scene,renderer);
 const path=()=>move({x:0,z:-3},{x:0,z:-4},3,obstacles(world),world.groundHeight,world.canStep);
 assert.ok(path().z>ARCH_NEAR-1);
 const peak=(ARCH_NEAR+ARCH_FAR)/2;
 const x=archCenter(archProgress(peak));
 assert.ok(world.groundHeight(x,peak)>3.8);
 world.pulse(1,-2);
 for(let i=0;i<600;i++)world.update(1/60);
 assert.ok(world.state.fracture>.9);
 assert.ok(path().z<ARCH_FAR-1);
 assert.ok(world.groundHeight(x,peak)<.6);
 const groundVertex=scene.getObjectByName('rift-arch-deck').geometry.attributes.position;
 assert.ok(Array.from(groundVertex.array).every(Number.isFinite));
 const renderedPeak=24*13+6;
 assert.ok(Math.abs(groundVertex.getY(renderedPeak)-archHeight(world.state,x,peak))<1e-5);
 const side=move({x:2.2,z:-4},{x:0,z:-4},1,obstacles(world),world.groundHeight,world.canStep);
 assert.ok(side.z>=ARCH_NEAR);
 const settled=world.state.settled;
 world.update(60);
 assert.equal(world.state.settled,settled);
 world.reset();
 assert.ok(path().z>ARCH_NEAR-1);
 assert.equal(world.state.fracture,0);
});

test('rock response follows local load and reverses when excited from the far bank',()=>{
 const state=createRiftState();
 const peak=(ARCH_NEAR+ARCH_FAR)/2;
 state.pulse(.3,-2);
 let moved=false;
 for(let i=0;i<360;i++){
  state.update(1/60);
  moved ||= Math.abs(state.morphs.seam.motion)>.02;
 }
 assert.ok(moved);
 assert.equal(state.fracture,0);
 assert.ok(archHeight(state,archCenter(.5),peak)>3.8);
 const firstYield=z=>{
  state.reset();
  state.pulse(1,z);
  for(let i=0;i<360;i++){
   state.update(1/60);
   if(state.morphs.near.scar>0)return state.morphs.far.scar>0?'far':'near';
   if(state.morphs.far.scar>0)return 'far';
  }
  return null;
 };
 assert.equal(firstYield(-2),'near');
 assert.equal(firstYield(-13),'far');
});
