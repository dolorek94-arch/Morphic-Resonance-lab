import {labField,labUniforms} from './lab-field.js';
import {labLighting} from './lab-lighting.js';
export const labFloorFragment=`
${labUniforms}
${labField}
${labLighting}
void main(){
 vec3 p=world-center,n=vec3(0.,1.,0.);
 float visibility=shadowVisibility(p,n);
 float ambient=ambientVisibility(p,n);
 float diffuse=max(0.,dot(n,lightDirection));
 float grain=.985+.015*sin(world.x*3.1)*sin(world.z*2.7);
 vec3 base=vec3(.23,.25,.24)*grain;
 vec3 col=base*(.45*skyTint*ambient+.9*diffuse*keyTint*visibility);
#ifdef GROTTO
 float strata=sin(world.z*8.+world.x*1.3+sin(world.x*2.)*.9);
 col*=.56+.08*strata;
 vec3 left=p-vec3(-2.8,-.6,offsetZ.x);
 vec3 middle=p-vec3(0.,-.4,offsetZ.y);
 vec3 right=p-vec3(2.8,-.2,offsetZ.z);
 col+=visibility*(vec3(.08,.4,.3)*activity.x*exp(-dot(left,left)*.23)
  +vec3(.6,.24,.08)*activity.y*exp(-dot(middle,middle)*.18)
  +vec3(.22,.29,.58)*activity.z*exp(-dot(right,right)*.14));
#endif
 float distance=length(world-cameraPosition);
 float fog=1.-exp(-distance*distance*.025*.025);
 col=mix(col,vec3(.09,.13,.165),fog);
 gl_FragColor=vec4(col,1.);
}
`;

