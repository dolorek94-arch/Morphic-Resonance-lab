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
 float distance=length(world-cameraPosition);
 float fog=1.-exp(-distance*distance*.025*.025);
 col=mix(col,vec3(.09,.13,.165),fog);
 gl_FragColor=vec4(col,1.);
}
`;
