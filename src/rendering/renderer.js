export function createRenderer(T,view,fail){
 const renderer=new T.WebGLRenderer({antialias:false});
 view.prepend(renderer.domElement);
 renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{
  console.error('Morphic shader error',gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment));
  fail(new Error('Shader konnte nicht kompiliert werden. Details in der Konsole.'));
 };
 const scene=new T.Scene();scene.background=new T.Color(0x263b50);scene.fog=new T.FogExp2(0x263b50,.047);
 const camera=new T.PerspectiveCamera(70,1,.1,100);
 const resize=high=>{renderer.setPixelRatio(high?Math.min(devicePixelRatio,1.5):.9);renderer.setSize(view.clientWidth,view.clientHeight);camera.aspect=view.clientWidth/view.clientHeight;camera.updateProjectionMatrix();};
 return {renderer,scene,camera,resize};
}

