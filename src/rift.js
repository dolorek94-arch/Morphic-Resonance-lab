import {ARCH_NEAR,ARCH_FAR,ARCH_HALF_WIDTH,archProgress,archCenter,archHeight,riftGround,waveAt,createRiftState} from './rift-state.js';

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
  mesh.bakeColor((u,v,out)=>shadeStone(u*.7+v*.2,v*.7+u*.36,out));
  return {from,to,mesh};
 });
 const archTop=surface(T,scene,material,12,48);
 archTop.mesh.name='rift-arch-deck';
 const sides=[surface(T,scene,material,3,48),surface(T,scene,material,3,48,true)];
 archTop.bakeColor((u,v,out)=>{
  const band=.5+.5*Math.sin(v*43+u*4+rockNoise(u,v)*.5);
  const edge=Math.min(u,1-u)<.14;
  out.setHex(edge?0x5a8190:band>.65?0x839a9c:0x536e7d).multiplyScalar(.83+.25*band);
 });
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
 // A warm face behind the fracture is only visible once the wall pulls apart.
 const fractureBackdrop=new T.Mesh(new T.PlaneGeometry(6,12),new T.MeshBasicMaterial({
  color:0xffb880,side:T.DoubleSide,fog:false
 }));
 fractureBackdrop.rotation.y=Math.PI/2;fractureBackdrop.position.set(-6,3,-6.3);
 fractureBackdrop.visible=false;
 scene.add(fractureBackdrop);
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
 function paint(){
  for(const bank of banks)bank.mesh.update((u,v)=>{
   const x=12*u-6,z=bank.from+(bank.to-bank.from)*v;
   return [x,groundHeight(x,z),z];
  });
  archTop.update((u,v)=>{
   const x=archCenter(v)+(2*u-1)*ARCH_HALF_WIDTH,z=ARCH_NEAR+(ARCH_FAR-ARCH_NEAR)*v;
   return [x,archHeight(state,x,z),z];
  });
  sides.forEach((side,i)=>side.update((u,v)=>{
   const x=archCenter(v)+(i===0?-1:1)*(ARCH_HALF_WIDTH-.07*u),z=ARCH_NEAR+(ARCH_FAR-ARCH_NEAR)*v;
   return [x,archHeight(state,x,z)-u*(.77+.18*Math.sin(Math.PI*v)),z];
  }));
  for(const wall of walls)wall.mesh.update((u,v)=>{
   const edge=wall.shear===1?u:1-u;
   const opening=wall.shear*(.48*state.fracture+.13*state.snap)*edge**4;
   const restZ=wall.near+(wall.far-wall.near)*u;
   const z=restZ+opening;
   const along=(3-restZ)/22;
   const y=-3.9+10.2*v;
   const band=.56*Math.sin(v*23+along*4)+.25*rockNoise(along,v);
   const distance=.20+Math.abs(restZ-state.origin)*.32+v*.28;
   const wave=waveAt(state.age,distance)*(wall.side===-1?.95:.38);
   return [wall.side*(4.9+band+.22*Math.sin(along*13))-wall.side*wave,y,z];
  });
  fractureBackdrop.visible=state.fracture>0;
  fissureLight.intensity=state.fracture*48+Math.max(0,state.snap)*24;
  const stopping=state.age>3.2;
  waveLight.position.set(stopping?0:-3.6,1.4,Math.max(-11,state.origin-state.age*2.6));
  waveLight.intensity=state.age<0||state.age>4.8?0:22*Math.sin(Math.PI*state.age/4.8);
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
   if(state.age<0||state.age>=4.8||dt===0)return;
   state.update(dt);paint();
  }
 };
}
