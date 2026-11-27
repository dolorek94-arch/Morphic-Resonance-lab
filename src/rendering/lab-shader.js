import {labField,labUniforms} from './lab-field.js';
import {labLighting} from './lab-lighting.js';
export const labFragment=`
${labUniforms}
${labField}
${labLighting}
vec3 normalAt(vec3 p){
 vec2 e=vec2(.008,0.);
 return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
}
void main(){
 vec3 ro=cameraPosition-center,rd=normalize(world-cameraPosition);
 vec2 interval=fieldInterval(ro,rd);
 float travel=max(.001,interval.x);
 float exitDistance=interval.y;
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
 vec3 lightDir=lightDirection;
 float diffuse=max(0.,dot(n,lightDir));
 float visibility=diffuse>0.?shadowVisibility(p,n):1.;
 float ambient=ambientVisibility(p,n);
 float rim=pow(1.-max(0.,dot(n,-rd)),3.);
 float remembered=dot(weights,memory);
 float grain=sin(p.x*11.)*sin(p.y*13.)*sin(p.z*9.);
 float roughness=1.-(.025*weights.x+.075*weights.y+.015*weights.z)*(1.-grain);
 float shine=pow(max(0.,dot(n,normalize(lightDir-rd))),24.)*(.10*weights.x+.025*weights.y+.20*weights.z);
 vec3 col=base*(.45*skyTint*ambient+1.1*diffuse*keyTint*visibility)*roughness;
 col+=rim*vec3(.08,.11,.13)*ambient+shine*keyTint*.55*visibility;
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
