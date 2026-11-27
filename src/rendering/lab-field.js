// Shared by camera surfaces, ground shadows and ambient occlusion.
export const labUniforms="varying vec3 world;\nuniform mat4 projectionMatrix;\nuniform vec3 center,displacement,memory,activity;\nuniform vec4 neckStart[8],neckEnd[8];\nuniform vec3 halfBounds,lightDirection,keyTint,skyTint;\nuniform float clock,glow,shadowEnabled,shadowSoftness,shadowBias;\n";
export const labField=`
float sm(float a,float b,float k){
 float h=clamp(.5+.5*(b-a)/k,0.,1.);
 return mix(b,a,h)-k*h*(1.-h);
}
float body(vec3 p,int kind,float x,float e,float m,vec3 aspect){
 vec3 q=p-vec3(x,.20*e+.12*m,0.);
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
 vec3 scale=aspect*vec3(1.,1.+softness*e+retention*m,1.+.10*m);
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
 float a=body(p,0,-2.8,displacement.x,memory.x,vec3(1.,1.15,1.));
 float b=body(p,1,0.,displacement.y,memory.y,vec3(1.05,.88,1.05));
 float c=body(p,2,2.8,displacement.z,memory.z,vec3(1.,1.4,.55));
 float d=sm(sm(a,b,.06),c,.06);
 for(int i=0;i<8;i++){
  // Each set of four segments is confined to its neighboring half of the cluster.
  if(neckStart[i].w>0. && ((i<4&&p.x<.65)||(i>=4&&p.x>-.65))){
   d=sm(d,taperedNeck(p,neckStart[i],neckEnd[i]),.14);
  }
 }
 return d;
}
`;
