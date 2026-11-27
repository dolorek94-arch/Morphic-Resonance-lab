import {CONFIG,height} from './config.js';
import {createMaterial} from './rendering/materials.js';
import {implicitVertex,implicitFragment} from './rendering/shaders.js';
export function createWorld(T,scene,r,shared,camera){
const material=(color,kind)=>createMaterial(T,shared,color,kind);
const ground=material(0x354e58,0),stone=material(0x263b50,1),amber=material(0x9b6541,2),pale=material(0x597c80,1);
const living=[]; const colliders=[];const g=new T.PlaneGeometry(100,100,140,140);g.rotateX(-Math.PI/2);let p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,height(p.getX(i),p.getZ(i)));g.computeVertexNormals();scene.add(new T.Mesh(g,ground));
let seed=CONFIG.seed;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
for(let i=0;i<75;i++){let a=rand()*Math.PI*2,d=5+rand()*36,cx=Math.cos(a)*d,cz=Math.sin(a)*d,base=height(cx,cz),h=1+rand()*5,rad=.35+rand()*.9;let geo=new T.SphereGeometry(1,12,16),v=geo.attributes.position;for(let j=0;j<v.count;j++){let yy=v.getY(j),xx=v.getX(j),zz=v.getZ(j),s=1+.19*Math.sin(yy*9+xx*4+i);v.setXYZ(j,xx*rad*s+yy*yy*.5,yy*h*.5,zz*rad*s)}geo.computeVertexNormals();let mesh=new T.Mesh(geo,i%5===0?amber:i%3===0?pale:stone);mesh.position.set(cx,base+h*.38,cz);mesh.rotation.y=rand()*6.28;scene.add(mesh);geo.computeBoundingBox();const bounds=geo.boundingBox;mesh.userData.radius=Math.hypot(Math.max(Math.abs(bounds.min.x),Math.abs(bounds.max.x)),Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z)));mesh.userData.halfHeight=h*.6;living.push({mesh,base:mesh.position.clone(),phase:i*2.4,e:0,v:0,memory:0});
if(i%3===0){let points=[];for(let j=0;j<9;j++){let f=j/8;points.push(new T.Vector3(cx+Math.sin(f*2.5)*2,base+.2+Math.sin(f*Math.PI)*h*.65,cz+f*2.5))}let tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),18,.16+rad*.15,7,false),stone);scene.add(tube);tube.geometry.computeBoundingBox();const bb=tube.geometry.boundingBox;colliders.push({type:'box',minX:bb.min.x-.4,maxX:bb.max.x+.4,minZ:bb.min.z-.4,maxZ:bb.max.z+.4,minY:bb.min.y,maxY:bb.max.y});}}
scene.add(new T.HemisphereLight(0x9cbde0,0x202039,.85));let sun=new T.DirectionalLight(0xffc18a,3.8);sun.position.set(-12,18,-8);scene.add(sun);r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:1,far:70});sun.shadow.bias=-.001;scene.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=o.geometry!==g}});for(let i=0;i<16;i++){let a=i*2.39996,d=9+i*1.6,cx=Math.cos(a)*d,cz=Math.sin(a)*d;let pts=[];for(let j=0;j<12;j++){let f=j/11;pts.push(new T.Vector3(cx+Math.sin(f*3.14)*3,height(cx,cz)+f*7,cz+Math.sin(f*5)*1.5))}let branch=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.23,8,false),stone);branch.castShadow=true;scene.add(branch);branch.geometry.computeBoundingBox();const bb=branch.geometry.boundingBox;colliders.push({type:'box',minX:bb.min.x-.4,maxX:bb.max.x+.4,minZ:bb.min.z-.4,maxZ:bb.max.z+.4,minY:bb.min.y,maxY:bb.max.y});let orb=new T.Mesh(new T.IcosahedronGeometry(.55,1),amber);orb.position.copy(pts[11]);orb.position.y+=.7;scene.add(orb)}
const bonds=[];for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){let a=living[i],b=living[j],d=a.base.distanceTo(b.base);if(d<5&&bonds.length<120){let mesh=new T.Mesh(new T.CylinderGeometry(.12,.12,1,7),pale);mesh.visible=false;scene.add(mesh);bonds.push({a,b,d,mesh,i,j});}}
const dustGeo=new T.BufferGeometry(),dust=new Float32Array(900);for(let i=0;i<300;i++){dust[i*3]=(rand()-.5)*75;dust[i*3+1]=rand()*8;dust[i*3+2]=(rand()-.5)*75;}dustGeo.setAttribute('position',new T.BufferAttribute(dust,3));const motes=new T.Points(dustGeo,new T.PointsMaterial({color:0x9eeed8,size:.075,transparent:true,opacity:.65,depthWrite:false}));scene.add(motes);
// Local implicit surfaces: raymarch inside a bounding box, write actual surface depth.
const implicitUniforms=[];
for(let i=0;i<12;i++){
 const a=living[i*3];if(!a)continue;
 const box=new T.BoxGeometry(5.2,5.6,5.2);
 const u={clock:shared.clock,age:shared.age,strength:shared.strength,origin:shared.origin,center:{value:a.mesh.position.clone()},projectionMatrix:{value:camera.projectionMatrix},energy:{value:0},seed:{value:i*2.71}};
 const m=new T.ShaderMaterial({uniforms:u,side:T.BackSide,vertexShader:implicitVertex,fragmentShader:implicitFragment});const mesh=new T.Mesh(box,m);mesh.position.copy(a.mesh.position);scene.add(mesh);a.mesh.visible=false;implicitUniforms.push({a,mesh,u});
}
for(let i=0;i<18;i++){let a=i*2.39996,d=8+i*1.5;let mesh=new T.Mesh(new T.IcosahedronGeometry(.6+rand()*.8,1),i%2?amber:pale);mesh.position.set(Math.cos(a)*d,4+rand()*5,Math.sin(a)*d);mesh.rotation.set(rand(),rand(),rand());scene.add(mesh);}

return {living,bonds,motes,implicitUniforms,colliders};
}

