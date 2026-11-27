import {integrate} from './oscillators.js';
export function createSimulation(T,world){
 const {living,bonds,motes,implicitUniforms}=world;
 const axis=new T.Vector3(0,1,0),delta=new T.Vector3(),unit=new T.Vector3();
 function evolve(dt,time){
  if(world.integrate)world.integrate(dt,time);else integrate(living,bonds,dt,time);
  for(const n of living){
   const e=Math.tanh(n.e),m=n.memory;
   n.mesh.scale.set(1+.22*e+.18*m,1+.35*e+.35*m,1+.22*e+.18*m);
   n.mesh.position.y=n.base.y+.45*e+.35*m;n.mesh.rotation.z=.12*e;
  }
  for(const b of bonds){
   const energy=(b.a.memory+b.b.memory)*.5+Math.abs(b.a.e-b.b.e)*.35;
   b.mesh.visible=energy>.13;if(!b.mesh.visible)continue;
   delta.subVectors(b.b.mesh.position,b.a.mesh.position);
   b.mesh.position.copy(b.a.mesh.position).addScaledVector(delta,.5);
   b.mesh.quaternion.setFromUnitVectors(axis,unit.copy(delta).normalize());
   const width=Math.min(2,energy*2);b.mesh.scale.set(width,delta.length(),width);
  }
  for(const q of implicitUniforms){
   q.mesh.position.copy(q.a.mesh.position);q.u.center.value.copy(q.mesh.position);
   q.u.energy.value=Math.min(1.5,Math.abs(q.a.e)+q.a.memory);
  }
  motes.position.y=.3*Math.sin(time*.4);motes.rotation.y=time*.008;
 }
 return {evolve,impulse(x,z,strength=1,target=null){
  if(world.targeted){
   const n=living[Number.isInteger(target)?target:0];
   if(n)n.v=Math.max(-8,Math.min(8,n.v+4*strength));
   return;
  }
  for(const n of living){const d=Math.hypot(n.base.x-x,n.base.z-z);n.v+=4*strength*Math.exp(-d*.23);}
 }};
}


