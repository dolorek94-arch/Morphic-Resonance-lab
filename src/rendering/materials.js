export function createMaterial(T,shared,color,kind){
 const material=new T.MeshStandardMaterial({color,roughness:.85,flatShading:true});
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,shared);
  shader.vertexShader='uniform float clock,age,strength; uniform vec2 origin; varying vec3 wp; varying float wave;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 w=(modelMatrix*vec4(position,1.)).xyz;
   float d=length(w.xz-origin);
   float front=d-age*7.;
   wave=sin(front*3.)*exp(-front*front*.14)*exp(-age*.12)*strength;
   transformed+=normal*wave*${kind===0?'.13':'.25'};
   wp=w;
  `);
  shader.fragmentShader='varying vec3 wp; varying float wave; uniform float clock;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float pattern=sin(wp.x*3.1+sin(wp.z*2.4)+wp.y*2.)*sin(wp.z*3.3-wp.y*1.7);
   diffuseColor.rgb*=.68+.32*pattern;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float vein=pow(1.-abs(sin(wp.y*4.+wp.x*2.+sin(wp.z*2.5))),14.);
   float ambientPulse=.25+.75*pow(.5+.5*sin(clock*1.8-length(wp.xz)*.8),5.);
   totalEmissiveRadiance+=vein*ambientPulse*vec3(.08,.65,.8)+abs(wave)*vec3(${kind===2?'1.,.32,.12':'.18,.85,.65'});
  `);
 };
 material.customProgramCacheKey=()=>String(kind);
 return material;
}


