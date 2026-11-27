import {createLab} from './lab.js';

export const GROTTO_PULSES=Object.freeze([1,11,21]);
export const GROTTO_DEMO_END=34;

export function createGrotto(T,scene,renderer,shared,camera){
 const offsets=[[0,.45],[.33,-.12],[.82,-.46]];
 const world=createLab(T,scene,renderer,shared,camera,{offsets,cavern:true});
 Object.assign(world.living[2],{yieldThreshold:.14,yieldRate:.62});
 scene.background.setHex(0x0c1722);
 scene.fog.color.copy(scene.background);
 scene.fog.density=.045;
 scene.add(new T.HemisphereLight(0x9abbdf,0x534338,1.05));
 const key=new T.DirectionalLight(0xecd0aa,2.5);
 key.position.set(-5,6,1);scene.add(key);
 const rim=new T.DirectionalLight(0x559dcf,1.4);
 rim.position.set(4,3,-13);scene.add(rim);
 const stone=new T.IcosahedronGeometry(1,1);
 const materials=[0x394654,0x4c515b,0x303c4a].map(color=>new T.MeshStandardMaterial({color,roughness:.94,flatShading:true}));
 function rock(x,y,z,sx,sy,sz,angle=0,tone=0){
  const mesh=new T.Mesh(stone,materials[tone]);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.set(.15,angle,-.2);
  scene.add(mesh);
 }
 // The stone ribs frame the approach and leave a walkable route on either side.
 rock(-6,2.8,-7,2.3,4.5,5,.4,0);
 rock(6,2.9,-8,2.25,4.7,5,-.4,2);
 rock(-3.9,3.4,-12.4,3.7,4.8,2,.9,2);
 rock(1.4,2.8,-13,4.1,4.5,1.9,-.2,0);
 rock(4.7,3.9,-12.2,2.2,5.3,2,.6,1);
 rock(-2.8,5.8,-9,4.9,1.8,3.1,-.2,2);
 rock(4.1,5.5,-8.9,3.3,1.8,2.6,.5,0);
 rock(-5.2,3,-1.6,1.5,4,2.3,.4,2);
 rock(5.4,2.5,-1.7,1.6,3.6,2.2,-.4,0);
 const ledges=[
  [-2.8,.22,-6.5,1.5,.5,1.1,.5,1],
  [-.1,.34,-7.2,1.65,.65,1.05,-.15,0],
  [2.8,.47,-7.7,1.6,.83,1.2,.5,2],
  [-4.2,.21,-5.6,.8,.33,.6,.3,0],
  [3.9,.24,-8.9,.86,.43,.7,.6,1]
 ];
 ledges.forEach(args=>rock(...args));
 for(let i=0;i<16;i++){
  const side=i%2===0?-1:1;
  rock(side*(3.8+.32*(i%4)),.08,-1.2-i*.63,.18+.08*(i%3),.18+.04*(i%4),.32,i*.79,i%3);
 }
 const wall=(minX,maxX,minZ,maxZ)=>({type:'box',minX,maxX,minZ,maxZ,minY:0,maxY:8});
 world.colliders.push(wall(-8,-4.6,-15,4),wall(4.6,8,-15,4),wall(-8,8,-15,-11.15),wall(-8,8,3.1,6));
 const lights=world.living.map((node,i)=>{
  const light=new T.PointLight([0x6cffd0,0xff9e57,0xa6afff][i],0,5,2);
  light.position.copy(node.base);
  scene.add(light);
  return light;
 });
 const update=world.update;
 world.update=(dt,glow,shadows,held)=>{
  update(dt,glow,shadows,held);
  lights.forEach((light,i)=>{light.intensity=2+16*world.living[i].activity;});
 };
 return world;
}
