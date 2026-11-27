// Bounded secondary rays sample the exact same deformed field as the camera.
export const labLighting=`

vec2 fieldInterval(vec3 origin,vec3 direction){
 vec3 safeDir=mix(vec3(-1.),vec3(1.),step(vec3(0.),direction))*max(abs(direction),vec3(.000001));
 vec3 a=(-halfBounds-origin)/safeDir,b=(halfBounds-origin)/safeDir;
 vec3 lo=min(a,b),hi=max(a,b);
 return vec2(max(lo.x,max(lo.y,lo.z)),min(hi.x,min(hi.y,hi.z)));
}
float shadowVisibility(vec3 p,vec3 n){
 if(shadowEnabled<.5)return 1.;
 vec3 origin=p+n*shadowBias;
 vec2 bounds=fieldInterval(origin,lightDirection);
 float travel=max(shadowBias,bounds.x),end=bounds.y;
 if(travel>=end)return 1.;
 float visibility=1.;
 for(int i=0;i<SHADOW_STEPS;i++){
  float distance=field(origin+lightDirection*travel);
  if(distance<.006)return 0.;
  visibility=min(visibility,shadowSoftness*distance/max(travel,.05));
  travel+=clamp(distance*.65,.015,.35);
  if(travel>=end)break;
 }
 return clamp(visibility,0.,1.);
}
float ambientVisibility(vec3 p,vec3 n){
 // Keep distant floor fragments out of the comparatively expensive form field.
 if(any(greaterThan(abs(p),halfBounds+vec3(.8))))return 1.;
 float occlusion=0.,weight=1.;
 for(int i=0;i<3;i++){
  float height=.12+.20*float(i);
  occlusion+=max(0.,height-field(p+n*height))/height*weight;
  weight*=.5;
 }
 return clamp(1.-.25*occlusion,.55,1.);
}
`;
