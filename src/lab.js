import {implicitVertex} from './rendering/shaders.js';
import {labFragment} from './rendering/lab-shader.js';
import {labFloorFragment} from './rendering/lab-floor.js';
import {LAB_HALF_BOUNDS,LAB_LIGHTING} from './lab-lighting-config.js';
import {LAB_MATERIALS,updateLabState,resetLabState} from './lab-state.js';
import {createNeckGeometry,updateNeckGeometry} from './neck-geometry.js';
export function createLab(T,scene,r,shared,camera){
 scene.background=new T.Color(0x17212a);
 scene.fog=new T.FogExp2(0x17212a,.025);
 const center=new T.Vector3(0,1.9,-7);
 const living=[-2.8,0,2.8].map((x,i)=>{
  const mesh=new T.Object3D();mesh.position.copy(center).add(new T.Vector3(x,0,0));
  mesh.userData={radius:1.25,halfHeight:1.7};
  return {mesh,base:mesh.position.clone(),phase:0,e:0,v:0,memory:0,activity:0,...LAB_MATERIALS[i]};
 });
 const bonds=[{a:living[0],b:living[1],i:0,j:1,d:2.8,coupling:8},{a:living[1],b:living[2],i:1,j:2,d:2.8,coupling:8}];
 for(const b of bonds){b.mesh=new T.Object3D();b.activation=0;}
 // Collision covers the maximum joining envelope, including space between bodies.
 const colliders=[{type:'box',minX:-4.25,maxX:4.25,minZ:-8.5,maxZ:-5.5,minY:.1,maxY:4.7}];
 const necks=createNeckGeometry();
 const uniforms={
  clock:shared.clock,center:{value:center},projectionMatrix:{value:camera.projectionMatrix},
  displacement:{value:new T.Vector3()},memory:{value:new T.Vector3()},
  activity:{value:new T.Vector3()},neckStart:{value:necks.start},neckEnd:{value:necks.end},glow:{value:0},
  halfBounds:{value:new T.Vector3().fromArray(LAB_HALF_BOUNDS)},
  lightDirection:{value:new T.Vector3().fromArray(LAB_LIGHTING.direction).normalize()},
  keyTint:{value:new T.Vector3().fromArray(LAB_LIGHTING.keyTint)},
  skyTint:{value:new T.Vector3().fromArray(LAB_LIGHTING.skyTint)},
  shadowEnabled:{value:1},shadowSoftness:{value:LAB_LIGHTING.shadowSoftness},shadowBias:{value:LAB_LIGHTING.shadowBias}
 };
 const material=new T.ShaderMaterial({defines:{STEPS:96,SHADOW_STEPS:LAB_LIGHTING.surfaceSteps},uniforms,side:T.BackSide,vertexShader:implicitVertex,fragmentShader:labFragment});
 const proxy=new T.Mesh(new T.BoxGeometry(...LAB_HALF_BOUNDS.map(v=>v*2)),material);proxy.position.copy(center);scene.add(proxy);
 const floorMaterial=new T.ShaderMaterial({defines:{SHADOW_STEPS:LAB_LIGHTING.floorSteps},uniforms,vertexShader:implicitVertex,fragmentShader:labFloorFragment});
 const floor=new T.Mesh(new T.PlaneGeometry(36,36),floorMaterial);
 floor.rotation.x=-Math.PI/2;scene.add(floor);
 const motes=new T.Object3D();
 return {
  living,bonds,motes,implicitUniforms:[],colliders,targeted:true,groundHeight:()=>0,
  reset(){resetLabState(living,bonds);},
  update(dt=0,glow=false,shadows=true){
   updateLabState(living,bonds,dt);
   updateNeckGeometry(necks,living,bonds);
   uniforms.displacement.value.set(...living.map(n=>Math.tanh(n.e)));
   uniforms.memory.value.set(...living.map(n=>n.memory));
   uniforms.activity.value.set(...living.map(n=>n.activity));
   uniforms.glow.value=glow?1:0;
   uniforms.shadowEnabled.value=shadows?1:0;
  }
 };
}
