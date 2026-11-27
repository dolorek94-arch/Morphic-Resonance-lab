import {height} from './config.js';
import {createMaterial} from './rendering/materials.js';
import {implicitVertex} from './rendering/shaders.js';
import {labFragment} from './rendering/lab-shader.js';
export function createLab(T,scene,r,shared,camera){
 const ground=new T.PlaneGeometry(40,40,80,80);ground.rotateX(-Math.PI/2);
 const p=ground.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));ground.computeVertexNormals();
 scene.add(new T.Mesh(ground,createMaterial(T,shared,0x354e58,0)));
 const center=new T.Vector3(0,height(0,-5)+2,-5);
 const living=[-2,0,2].map((x,i)=>{
  const mesh=new T.Object3D();mesh.position.copy(center).add(new T.Vector3(x,0,0));
  mesh.userData={radius:1.2,halfHeight:1.8};
  return {mesh,base:mesh.position.clone(),phase:i*2.4,e:0,v:0,memory:0};
 });
 const bonds=[{a:living[0],b:living[1],i:0,j:1,d:2},{a:living[1],b:living[2],i:1,j:2,d:2}];
 for(const b of bonds){b.mesh=new T.Object3D();}
 const uniforms={...shared,center:{value:center},energy:{value:0},energies:{value:new T.Vector3()},seed:{value:2.71},projectionMatrix:{value:camera.projectionMatrix}};
 const material=new T.ShaderMaterial({defines:{STEPS:80},uniforms,side:T.BackSide,vertexShader:implicitVertex,fragmentShader:labFragment});
 const proxy=new T.Mesh(new T.BoxGeometry(9,6,6),material);proxy.position.copy(center);scene.add(proxy);
 scene.add(new T.HemisphereLight(0x8eabc5,0x252039,1));
 const sun=new T.DirectionalLight(0xffc18a,3);sun.position.set(-6,12,3);scene.add(sun);
 const motes=new T.Object3D();
 return {living,bonds,motes,implicitUniforms:[],colliders:[],
  update(){uniforms.energies.value.set(...living.map(n=>Math.min(1.5,Math.abs(n.e)+n.memory)));uniforms.energy.value=uniforms.energies.value.length()/Math.sqrt(3);}
 };
}

