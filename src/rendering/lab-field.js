import {NECK_SEGMENTS,SEGMENTS_PER_BOND} from '../neck-geometry.js';
// One form field is reused by surface rays, ground shadows and ambient occlusion.
export const labUniforms=`varying vec3 world;
uniform mat4 projectionMatrix;
uniform vec3 center,displacement,memory,activity,bodyScale,recoil,setLeft,setRight;
uniform vec4 neckStart[${NECK_SEGMENTS}],neckEnd[${NECK_SEGMENTS}];
uniform vec3 halfBounds,lightDirection,keyTint,skyTint;
uniform float clock,glow,shadowEnabled,shadowSoftness,shadowBias;
`;
export const labField=`
float sm(float a,float b,float k){
 float h=clamp(.5+.5*(b-a)/k,0.,1.);
 return mix(b,a,h)-k*h*(1.-h);
}
float body(vec3 p,int kind,float x,float e,float m,vec3 aspect,float volumeScale,float kick,vec2 retained){
 vec3 q=p-vec3(x-kick,.20*e+.12*m,0.);
 float side=step(0.,q.x);
 float shapeSet=mix(retained.x,retained.y,side);
 float shoulder=exp(-dot(q.yz,q.yz)*4.)*smoothstep(.18,.72,abs(q.x));
 q.x-=(2.*side-1.)*.25*shapeSet*shoulder;
 if(kind==0){
  // Soft bean: rounded, off-axis and visibly yielding.
  q.x+=.16*sin(q.y*2.4)+.17*e*q.y;
  q.z+=.06*m*sin(q.y*2.);
 }else if(kind==1){
  // Dense core: compact rounded block; less stretch than the soft body.
  q.x+=.045*sin(q.y*7.);
  q.x+=.035*e*q.y;
 }else{
  // Thin membrane: tapered leaf with a bent tip and longer-lived folds.
  q.x+=.16*q.y*q.y+.12*m*q.y;
  q.z+=.09*m*sin(q.y*3.)+.055*e*q.y;
 }
 float softness=kind==1?.09:.24;
 float retention=kind==1?.09:.22;
 vec3 strain=vec3(1.,1.+softness*e+retention*m,1.+.10*m);
 vec3 scale=aspect*strain*(volumeScale/pow(strain.y*strain.z,1./3.));
 if(kind==2)scale.x*=clamp(1.-.18*q.y,.65,1.25);
 vec3 u=abs(q/scale);
 float norm=kind==1?sqrt(sqrt(dot(u*u,u*u))):length(u);
 float scar=.16*m*exp(-dot(q-vec3(.35,.25,0.),q-vec3(.35,.25,0.))*2.);
 float radius=kind==1?.76:.83;
 float d=(norm-radius-scar)*min(scale.x,min(scale.y,scale.z));
 return d+.012*sin(q.x*5.)*sin(q.y*4.)*sin(q.z*5.);
}
float taperedNeck(vec3 p,vec4 a,vec4 b){
 vec3 axis=b.xyz-a.xyz;
 float h=clamp(dot(p-a.xyz,axis)/max(dot(axis,axis),.000001),0.,1.);
 return length(p-mix(a.xyz,b.xyz,h))-mix(a.w,b.w,h);
}
float field(vec3 p){
 float a=body(p,0,-2.8,displacement.x,memory.x,vec3(1.,1.15,1.),bodyScale.x,recoil.x,vec2(setLeft.x,setRight.x));
 float b=body(p,1,0.,displacement.y,memory.y,vec3(1.05,.88,1.05),bodyScale.y,recoil.y,vec2(setLeft.y,setRight.y));
 float c=body(p,2,2.8,displacement.z,memory.z,vec3(1.,1.4,.55),bodyScale.z,recoil.z,vec2(setLeft.z,setRight.z));
 float d=sm(sm(a,b,.06),c,.06);
 float leftNeck=1000.,rightNeck=1000.;
 for(int i=0;i<${NECK_SEGMENTS};i++){
  // Each neck's segments share a small union before attachment to the bodies.
  if(neckStart[i].w>0. && ((i<${SEGMENTS_PER_BOND}&&p.x<.65)||(i>=${SEGMENTS_PER_BOND}&&p.x>-.65))){
   float segment=taperedNeck(p,neckStart[i],neckEnd[i]);
   if(i<${SEGMENTS_PER_BOND})leftNeck=sm(leftNeck,segment,.025);else rightNeck=sm(rightNeck,segment,.025);
  }
 }
 return sm(sm(d,leftNeck,.14),rightNeck,.14);
}
`;

