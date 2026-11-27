import {CONFIG,height} from './config.js';
export function direction(yaw,right,forward){
 return {x:-Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward-Math.sin(yaw)*right};
}
export function resolveCircle(position,circle){
 const dx=position.x-circle.x,dz=position.z-circle.z,d=Math.hypot(dx,dz),limit=circle.radius+CONFIG.playerRadius;
 if(d>=limit)return;
 position.x=circle.x+(d>1e-8?dx/d:1)*limit;
 position.z=circle.z+(d>1e-8?dz/d:0)*limit;
}
export function obstacles(world){
 const result=[];
 for(const n of world.living){
  const implicit=n.mesh.visible===false;
  result.push({type:'circle',x:n.mesh.position.x,z:n.mesh.position.z,
   radius:implicit?2.1:n.mesh.userData.radius*Math.max(n.mesh.scale.x,n.mesh.scale.z)+n.mesh.userData.halfHeight*n.mesh.scale.y*Math.abs(Math.sin(n.mesh.rotation.z))+.3,
   minY:n.mesh.position.y-(implicit?1.7:n.mesh.userData.halfHeight*n.mesh.scale.y),
   maxY:n.mesh.position.y+(implicit?1.7:n.mesh.userData.halfHeight*n.mesh.scale.y)});
 }
 return result.concat(world.colliders);
}
function resolveBox(p,b){
 const nearX=Math.max(b.minX,Math.min(b.maxX,p.x)),nearZ=Math.max(b.minZ,Math.min(b.maxZ,p.z));
 const dx=p.x-nearX,dz=p.z-nearZ,d=Math.hypot(dx,dz),r=CONFIG.playerRadius;
 if(d>=r)return;
 if(d>1e-8){p.x=nearX+dx/d*r;p.z=nearZ+dz/d*r;return;}
 const sides=[{d:p.x-b.minX,x:b.minX-r,z:p.z},{d:b.maxX-p.x,x:b.maxX+r,z:p.z},{d:p.z-b.minZ,x:p.x,z:b.minZ-r},{d:b.maxZ-p.z,x:p.x,z:b.maxZ+r}];
 sides.sort((a,b)=>a.d-b.d);p.x=sides[0].x;p.z=sides[0].z;
}
export function move(position,velocity,dt,colliders,terrainHeight=height){
 const steps=Math.max(1,Math.ceil(Math.hypot(velocity.x,velocity.z)*dt/.1));
 for(let j=0;j<steps;j++){
  position.x+=velocity.x*dt/steps;position.z+=velocity.z*dt/steps;
  for(let pass=0;pass<4;pass++)for(const c of colliders){
   const feet=terrainHeight(position.x,position.z);
   if(c.maxY<feet+.15||c.minY>feet+CONFIG.eyeHeight+.25)continue;
   if(c.type==='circle')resolveCircle(position,c);else resolveBox(position,c);
  }
  position.x=Math.max(-CONFIG.bounds,Math.min(CONFIG.bounds,position.x));
  position.z=Math.max(-CONFIG.bounds,Math.min(CONFIG.bounds,position.z));
 }
 return position;
}

