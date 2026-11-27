import {implicitVertex} from './rendering/shaders.js';
import {labFragment} from './rendering/lab-shader.js';
import {LAB_MATERIALS,updateLabState,resetLabState} from './lab-state.js';
export function createLab(T,scene,r,shared,camera){
 scene.background=new T.Color(0x17212a);
 scene.fog=new T.FogExp2(0x17212a,.025);
 const floor=new T.Mesh(new T.PlaneGeometry(36,36),new T.MeshStandardMaterial({color:0x313c40,roughness:1}));
 floor.rotation.x=-Math.PI/2;scene.add(floor);
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
 const uniforms={
  clock:shared.clock,center:{value:center},projectionMatrix:{value:camera.projectionMatrix},
  displacement:{value:new T.Vector3()},memory:{value:new T.Vector3()},
  activity:{value:new T.Vector3()},bridges:{value:new T.Vector2()},glow:{value:0}
 };
 const material=new T.ShaderMaterial({defines:{STEPS:96},uniforms,side:T.BackSide,vertexShader:implicitVertex,fragmentShader:labFragment});
 const proxy=new T.Mesh(new T.BoxGeometry(9.6,6,5.4),material);proxy.position.copy(center);scene.add(proxy);
 scene.add(new T.HemisphereLight(0xb9d4e0,0x252b2e,1.25));
 const sun=new T.DirectionalLight(0xffd7ad,2.4);sun.position.set(-6,9,5);scene.add(sun);
 const motes=new T.Object3D();
 return {
  living,bonds,motes,implicitUniforms:[],colliders,targeted:true,groundHeight:()=>0,
  reset(){resetLabState(living,bonds);},
  update(dt=0,glow=false){
   updateLabState(living,bonds,dt);
   uniforms.displacement.value.set(...living.map(n=>Math.tanh(n.e)));
   uniforms.memory.value.set(...living.map(n=>n.memory));
   uniforms.activity.value.set(...living.map(n=>n.activity));
   uniforms.bridges.value.set(...bonds.map(b=>b.activation));
   uniforms.glow.value=glow?1:0;
  }
 };
}
