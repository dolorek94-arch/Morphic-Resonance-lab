import {ARCH_NEAR,ARCH_FAR,archHalfWidth,archCenter,archHeight,riftGround,createRiftState} from './rift-state.js';

function surface(T,scene,material,columns,rows,flip=false){
 const geometry=new T.BufferGeometry(),indices=[];
 const position=new T.BufferAttribute(new Float32Array((columns+1)*(rows+1)*3),3).setUsage(T.DynamicDrawUsage);
 const color=new T.BufferAttribute(new Float32Array(position.array.length),3);
 for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
  const a=j*(columns+1)+i,b=a+1,c=a+columns+1,d=c+1;
  indices.push(...(flip?[a,c,b,b,c,d]:[a,b,c,b,d,c]));
 }
 geometry.setIndex(indices);geometry.setAttribute('position',position);geometry.setAttribute('color',color);
 const mesh=new T.Mesh(geometry,material);
 mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
 scene.add(mesh);
 return {
  mesh,
  bakeColor(sample){
   const shade=new T.Color();
   for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
    sample(i/columns,j/rows,shade);
    color.setXYZ(j*(columns+1)+i,shade.r,shade.g,shade.b);
   }
   color.needsUpdate=true;
  },
  update(sample){
   for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++)
    position.setXYZ(j*(columns+1)+i,...sample(i/columns,j/rows));
   position.needsUpdate=true;geometry.computeVertexNormals();
  }
 };
}
const rockNoise=(u,v)=>Math.sin(u*35+v*16)*Math.cos(u*13-v*51);

export function createRift(T,scene,renderer){
 const state=createRiftState();
 scene.background=new T.Color(0x27394e);
 scene.fog=new T.Fog(0x27394e,13,33);
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;
 // Rebuild the map only when the rock moves or the scene resets.
 renderer.shadowMap.autoUpdate=false;
 scene.add(new T.HemisphereLight(0xbed9eb,0x5b4843,1.58));
 const sun=new T.DirectionalLight(0xffd4a4,2.65);
 sun.position.set(6,10,-1);sun.target.position.set(0,0,-8);
 sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
 Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:35});
 sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.045;sun.shadow.bias=-.00015;
 scene.add(sun,sun.target);
 const fissureLight=new T.PointLight(0xffac76,0,12,2);
 fissureLight.position.set(-3.35,2.15,-6.3);scene.add(fissureLight);
 const waveLight=new T.PointLight(0x8bdbff,0,7,2);
 scene.add(waveLight);
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.91,side:T.DoubleSide});
 const shadeStone=(u,v,out)=>{
  const bands=.5+.5*Math.sin(v*28+u*9+rockNoise(u,v)*.5);
  out.setHex(bands>.66?0x70828e:0x42586b).multiplyScalar(.84+.19*rockNoise(u,v)+.2*bands);
 };
 const shadeFloor=(x,z,out)=>shadeStone(.5+x*.11,(3-z)*.097,out);
 const ledgeMaterial=new T.MeshStandardMaterial({color:0x546876,roughness:1});
 function slab(x,y,z,width,thickness,length,mat=ledgeMaterial){
  const mesh=new T.Mesh(new T.BoxGeometry(width,thickness,length),mat);
  mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;scene.add(mesh);
 }
 slab(0,-.62,-.75,12,.7,7.5);
 slab(0,-.62,-14.75,12,.7,8.5);
 slab(0,-3.9,-7.5,12,.6,6);
 for(const z of [ARCH_NEAR-.20,ARCH_FAR+.20])slab(0,-1.77,z,12,3.54,.40);
 const banks=[[3,ARCH_NEAR],[ARCH_FAR,-19]].map(([from,to])=>{
  const mesh=surface(T,scene,material,22,26);
  mesh.bakeColor((u,v,out)=>shadeFloor(12*u-6,from+(to-from)*v,out));
  return {from,to,mesh};
 });
 const archTop=surface(T,scene,material,12,48);
 archTop.mesh.name='rift-arch-deck';
 const sides=[surface(T,scene,material,3,48),surface(T,scene,material,3,48,true)];
 const archX=(u,v)=>archCenter(v)+(2*u-1)*archHalfWidth(v);
 const archZ=v=>ARCH_NEAR+(ARCH_FAR-ARCH_NEAR)*v;
 archTop.bakeColor((u,v,out)=>shadeFloor(archX(u,v),archZ(v),out));
 sides.forEach(side=>side.bakeColor(shadeStone));
 const walls=[
  {side:-1,near:3,far:-6.3,shear:1},
  {side:-1,near:-6.3,far:-19,shear:-1},
  {side:1,near:3,far:-19,shear:0}
 ].map(spec=>{
  const mesh=surface(T,scene,material,26,18,spec.side===1);
  mesh.bakeColor((u,v,out)=>shadeStone(spec.side*.3+u,v,out));
  return {...spec,mesh};
 });
 const cut=walls.slice(0,2).map(()=>{
  const lip=surface(T,scene,material,3,18);
  lip.bakeColor((u,v,out)=>out.setHex(0x523c35).multiplyScalar(.56+.23*Math.sin(v*13)-u*.21));
  return lip;
 });
 const fissureBack=surface(T,scene,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}),3,18);
 fissureBack.bakeColor((u,v,out)=>out.setHex(0xae5022)
  .multiplyScalar(.27+.52*Math.exp(-12*(v-.52)**2)+.11*rockNoise(u,v)));
 const landmark=new T.IcosahedronGeometry(1,1);
 const fragments=new T.MeshStandardMaterial({color:0x647584,roughness:1,flatShading:true});
 for(let i=0;i<15;i++){
  const rock=new T.Mesh(landmark,fragments);
  const sign=i%2===0?1:-1;
  rock.position.set(sign*(3.7+.14*(i%5)),-.08,1.5-i*1.27);
  rock.scale.set(.65+.13*(i%4),.47+.12*(i%3),.49+.16*(i%5));
  rock.rotation.set(.21,i*.67,.24*sign);
  rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);
 }
 const wall=(minX,maxX,minZ,maxZ)=>({type:'box',minX,maxX,minZ,maxZ,minY:-4,maxY:8});
 const colliders=[wall(-8,-3.4,-19,3.6),wall(3.4,8,-19,3.6),wall(-8,8,3,6),wall(-8,8,-22,-18)];
 const groundHeight=(x,z)=>riftGround(state,x,z);
 function wallPoint(wall,u,v){
  const {seam,rib,near}=state.morphs;
  const edge=wall.shear===1?u:1-u;
  const taper=Math.sin(v*Math.PI)**.65;
  const split=.43*rib.settlement*Math.max(0,taper)*(.72+.28*Math.sin(v*25)**2);
  const opening=wall.shear*Math.max(0,split+rib.motion*.12*taper)*edge**4;
  const restZ=wall.near+(wall.far-wall.near)*u;
  const along=(3-restZ)/22,y=-3.9+10.2*v;
  const band=.56*Math.sin(v*23+along*4)+.25*rockNoise(along,v);
  const local=(morph,width)=>morph.motion*Math.exp(-(((restZ-morph.z)/width)**2));
  const motion=wall.side===-1?local(seam,2.3)+local(rib,1.4):local(near,2.3)*.32;
  return [wall.side*(4.9+band+.22*Math.sin(along*13))-wall.side*motion,y,restZ+opening];
 }
 function paint(){
  for(const bank of banks)bank.mesh.update((u,v)=>{
   const x=12*u-6,z=bank.from+(bank.to-bank.from)*v;
   return [x,groundHeight(x,z),z];
  });
  archTop.update((u,v)=>{
   const x=archX(u,v),z=archZ(v);
   return [x,archHeight(state,x,z),z];
  });
  sides.forEach((side,i)=>side.update((u,v)=>{
   const x=archCenter(v)+(i===0?-1:1)*(archHalfWidth(v)-.12*u),z=archZ(v);
   return [x,archHeight(state,x,z)-u*(.60+.4*Math.sin(Math.PI*v)+.13*rockNoise(i,v)),z];
  }));
  for(const wall of walls)wall.mesh.update((u,v)=>wallPoint(wall,u,v));
  const opening=state.fracture>.003;
  cut.forEach((lip,i)=>{
   lip.mesh.visible=opening;
   if(opening)lip.update((u,v)=>{
    const [x,y,z]=wallPoint(walls[i],i===0?1:0,v);
    return [x-1.05*u,y,z+(i===0?-1:1)*.06*u];
   });
  });
  fissureBack.mesh.visible=opening;
  if(opening)fissureBack.update((u,v)=>{
   const [x,y,front]=wallPoint(walls[0],1,v),back=wallPoint(walls[1],0,v)[2];
   return [x-1.06,y,front+(back-front)*u];
  });
  fissureLight.intensity=state.fracture*23+Math.abs(state.morphs.rib.motion)*8;
  const wave=state.wave;
  if(wave)waveLight.position.set(wave.x,1.4,wave.z);
  waveLight.intensity=wave?11*wave.load:0;
  renderer.shadowMap.needsUpdate=true;
 }
 paint();
 return {
  state,living:[],bonds:[],implicitUniforms:[],motes:new T.Object3D(),colliders,groundHeight,
  // Small movement steps may follow the slope, but never climb the upright arch or fall off its edges.
  canStep(from,to){
   const distance=Math.hypot(to.x-from.x,to.z-from.z);
   return distance===0||Math.abs(groundHeight(to.x,to.z)-groundHeight(from.x,from.z))<=distance*.60;
  },
  pulse(strength,z){state.pulse(strength,z);},
  reset(){state.reset();paint();},
  update(dt=0,_glow=false,shadows=true){
   if(sun.castShadow!==shadows){sun.castShadow=shadows;renderer.shadowMap.needsUpdate=true;}
   if(!state.active||dt===0)return;
   state.update(dt);paint();
  }
 };
}
