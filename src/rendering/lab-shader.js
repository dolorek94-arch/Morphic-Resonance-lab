// Local smooth unions attach slim curved necks without inflating the whole cluster.
export const labFragment=`
varying vec3 world;
uniform mat4 projectionMatrix;
uniform vec3 center,displacement,memory,activity;
uniform vec4 neckStart[8],neckEnd[8];
uniform float clock,glow;

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
vec3 normalAt(vec3 p){
 vec2 e=vec2(.008,0.);
 return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
}
void main(){
 vec3 ro=cameraPosition-center,rd=normalize(world-cameraPosition);
 vec3 safeDir=mix(vec3(-1.),vec3(1.),step(vec3(0.),rd))*max(abs(rd),vec3(.000001));
 vec3 aa=(-vec3(4.8,3.,2.7)-ro)/safeDir;
 vec3 bb=(vec3(4.8,3.,2.7)-ro)/safeDir;
 vec3 lo=min(aa,bb),hi=max(aa,bb);
 float travel=max(.001,max(lo.x,max(lo.y,lo.z)));
 float exitDistance=min(hi.x,min(hi.y,hi.z));
 if(travel>exitDistance)discard;
 bool hit=false;
 vec3 p=vec3(0.);
 for(int j=0;j<STEPS;j++){
  p=ro+rd*travel;
  float d=field(p);
  if(abs(d)<.007){hit=true;break;}
  travel+=max(.003,abs(d)*.45);
  if(travel>exitDistance)break;
 }
 if(!hit||travel>exitDistance)discard;
 vec3 n=normalAt(p);
 vec3 weights=exp(-vec3(abs(p.x+2.8),abs(p.x),abs(p.x-2.8))*1.8);
 weights/=dot(weights,vec3(1.));
 vec3 base=weights.x*vec3(.32,.55,.49)+weights.y*vec3(.51,.32,.20)+weights.z*vec3(.40,.48,.64);
 vec3 lightDir=normalize(vec3(-.5,.8,.6));
 float diffuse=max(0.,dot(n,lightDir));
 float rim=pow(1.-max(0.,dot(n,-rd)),3.);
 float remembered=dot(weights,memory);
 float grain=sin(p.x*11.)*sin(p.y*13.)*sin(p.z*9.);
 float roughness=1.-(.025*weights.x+.075*weights.y+.015*weights.z)*(1.-grain);
 float shine=pow(max(0.,dot(n,normalize(lightDir-rd))),24.)*(.10*weights.x+.025*weights.y+.20*weights.z);
 vec3 col=base*(.29+1.05*diffuse)*roughness+rim*vec3(.08,.11,.13)+shine*vec3(.5,.55,.6);
 col+=remembered*vec3(.035,.025,.015);
 float vein=pow(1.-abs(sin(p.y*6.+p.x*3.+sin(p.z*4.))),14.);
 col+=glow*vein*(.05+.32*dot(weights,activity))*vec3(.15,.65,.58);
 float fog=1.-exp(-travel*travel*.025*.025);
 col=mix(col,vec3(.09,.13,.165),fog);
 vec4 clip=projectionMatrix*viewMatrix*vec4(p+center,1.);
 if(clip.w<=0.)discard;
 gl_FragColor=vec4(col,1.);
 gl_FragDepth=clamp(clip.z/clip.w*.5+.5,0.,1.);
}
`;
