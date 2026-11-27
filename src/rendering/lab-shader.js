// One continuous implicit field: changing smooth-union width joins and separates bodies.
export const labFragment=`
varying vec3 world;
uniform mat4 projectionMatrix;
uniform vec3 center,displacement,memory,activity;
uniform vec2 bridges;
uniform float clock,glow;

float sm(float a,float b,float k){
 float h=clamp(.5+.5*(b-a)/k,0.,1.);
 return mix(b,a,h)-k*h*(1.-h);
}
float body(vec3 p,float x,float e,float m,vec3 aspect,float stretch){
 vec3 q=p-vec3(x,.20*e+.12*m,0.);
 q.x+=.12*e*q.y;
 q.y+=.065*e*sin(q.z*3.+q.x*2.);
 // Memory makes asymmetric lobes after the immediate oscillation has faded.
 float scar=.16*m*exp(-dot(q-vec3(.35,.25,0.),q-vec3(.35,.25,0.))*2.);
 vec3 scale=aspect*vec3(1.+stretch,1.+.24*e+.22*m,1.+.1*m);
 float d=(length(q/scale)-(.83+scar))*min(scale.x,min(scale.y,scale.z));
 return d+.018*sin(q.x*5.)*sin(q.y*4.)*sin(q.z*5.);
}
float field(vec3 p){
 float a=body(p,-2.8,displacement.x,memory.x,vec3(1.,1.15,1.),.14*bridges.x);
 float b=body(p,0.,displacement.y,memory.y,vec3(1.05,.88,1.05),.08*(bridges.x+bridges.y));
 float c=body(p,2.8,displacement.z,memory.z,vec3(.95,1.35,.9),.14*bridges.y);
 return sm(sm(a,b,.06+2.8*bridges.x),c,.06+2.8*bridges.y);
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
  if(abs(d)<.008){hit=true;break;}
  travel+=max(.004,abs(d)*.55);
  if(travel>exitDistance)break;
 }
 if(!hit||travel>exitDistance)discard;
 vec3 n=normalAt(p);
 vec3 weights=exp(-vec3(abs(p.x+2.8),abs(p.x),abs(p.x-2.8))*1.8);
 weights/=dot(weights,vec3(1.));
 vec3 base=weights.x*vec3(.32,.55,.49)+weights.y*vec3(.51,.32,.20)+weights.z*vec3(.40,.48,.64);
 float diffuse=max(0.,dot(n,normalize(vec3(-.5,.8,.6))));
 float rim=pow(1.-max(0.,dot(n,-rd)),3.);
 float remembered=dot(weights,memory);
 float roughness=.94+.06*sin(p.x*11.)*sin(p.y*13.)*sin(p.z*9.);
 vec3 col=base*(.29+1.05*diffuse)*roughness+rim*vec3(.08,.11,.13);
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
