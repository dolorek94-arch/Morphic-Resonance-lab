import {CONFIG,VERSION,height} from './config.js';
import {createWorld} from './world.js';
import {createLab} from './lab.js';
import {createGrotto,GROTTO_PULSES,GROTTO_DEMO_END} from './grotto.js';
import {createRenderer} from './rendering/renderer.js';
import {createSimulation} from './simulation.js';
import {createInput} from './input.js';
import {direction,move,obstacles} from './navigation.js';
import {$,createUI} from './ui.js';
import {createProfiler} from './profiling.js';
async function start(){
 const T=await import('../vendor/three.module.js');
 let failed=false;
 const fail=e=>{failed=true;$('status').textContent='Fehler: '+e.message;console.error(e);};
 const {renderer:r,scene,camera,resize}=createRenderer(T,$('view'),fail);
 const shared={clock:{value:0},origin:{value:new T.Vector2()},age:{value:100},strength:{value:1}};
 const requestedScene=new URLSearchParams(location.search).get('scene');
 const sceneName=['lab','world'].includes(requestedScene)?requestedScene:'grotto';
 const grotto=sceneName==='grotto',lab=sceneName!=='world';
 const spawn=grotto?{...CONFIG.spawn,z:.8,pitch:.055}:lab?{...CONFIG.spawn,pitch:.015}:CONFIG.spawn;
 const world=(grotto?createGrotto:lab?createLab:createWorld)(T,scene,r,shared,camera);
 const simulation=createSimulation(T,world),profiler=createProfiler();
 const position={x:spawn.x,z:spawn.z};
 let t=0,imp=-100,input,ui,demo=false;
 function reset(){
  profiler.cancel();input?.clear();Object.assign(position,spawn);
  demo=false;
  ui?.setDemo(false);
  if(input)Object.assign(input.state,{yaw:spawn.yaw,pitch:spawn.pitch});
  t=0;imp=-100;for(const n of world.living){n.e=0;n.v=0;n.memory=0;}
  world.reset?.();simulation.evolve(0,0);world.update?.(0,false);
 move(position,{x:0,z:0},0,obstacles(world),world.groundHeight??height);
 }
 function excite(strength,target){imp=t;shared.origin.value.set(position.x,position.z);simulation.impulse(position.x,position.z,strength,target);}
 function pulse(){if(profiler.active||demo)return;excite(ui.strength(),lab?ui.target():null);}
 input=createInput(r.domElement,pulse,reset);
 const applySize=()=>resize();
 ui=createUI({pulse,reset,lab,grotto,
  preview(){
   if(demo){demo=false;ui.setDemo(false);return;}
   reset();
   document.exitPointerLock?.();
   demo=true;
   ui.setDemo(true);
  },
  benchmark(){
   reset();input.clear();document.exitPointerLock?.();
   profiler.start({version:VERSION,scene:sceneName,quality:'desktop-high',width:$('view').clientWidth,height:$('view').clientHeight,
    pixelRatio:r.getPixelRatio(),drawingBufferWidth:r.domElement.width,drawingBufferHeight:r.domElement.height,userAgent:navigator.userAgent,seed:CONFIG.seed,
    viewport: {width:innerWidth,height:innerHeight},strength:1,target:lab?0:null,emission:false,shadows:lab,heldConnections:lab&&!grotto,simulationSpeed:1,transport:lab?'spring-chain-8':null,pulseAtSimulationSecond:1,
    ...(grotto?{repeatPulseInterval:10}:{})});
  }});
 new ResizeObserver(()=>{profiler.cancel();applySize();}).observe($('view'));
 document.addEventListener('visibilitychange',()=>{profiler.cancel();last=performance.now();});
 applySize();reset();
 let last=performance.now(),fps=60,smoothedMs=16.7;
 function frame(now){
  try{
   const raw=Math.max(.001,(now-last)/1000);last=now;const dt=Math.min(raw,CONFIG.maxDt);
   const fixedView=profiler.active||demo;
   const simulationDt=dt*(lab&&!fixedView&&ui.slow()? .35 : 1);
   const previous=t;t+=simulationDt;
   if(profiler.active){
    const crossedPulse=grotto?Math.floor((t-1)/10)>Math.floor((previous-1)/10):previous<1&&t>=1;
    if(crossedPulse)excite(1,lab?0:null);
   }
   if(demo&&GROTTO_PULSES.some(at=>previous<at&&t>=at))excite(1.35,0);
   if(demo&&t>=GROTTO_DEMO_END){demo=false;ui.setDemo(false);}
   shared.clock.value=t;shared.age.value=t-imp;shared.strength.value=profiler.active?1:ui.strength();
   simulation.evolve(simulationDt,t);world.update?.(simulationDt,fixedView?false:ui.glow(),fixedView?true:ui.shadows(),fixedView?lab&&!grotto:ui.held());
   const axes=fixedView?{right:0,forward:0}:input.axes();
   const yaw=fixedView?spawn.yaw:input.state.yaw,pitch=fixedView?spawn.pitch:input.state.pitch;
   const velocity=direction(yaw,axes.right,axes.forward);
   velocity.x*=CONFIG.speed;velocity.z*=CONFIG.speed;move(position,velocity,dt,obstacles(world),world.groundHeight??height);
   camera.position.set(position.x,(world.groundHeight??height)(position.x,position.z)+CONFIG.eyeHeight,position.z);
   camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);
   r.render(scene,camera);
   if(failed)return;
   fps=.95*fps+.05/raw;smoothedMs=.95*smoothedMs+.05*raw*1000;
   ui.status(fps,smoothedMs,r.info,world.living);profiler.sample(raw*1000,r.info);
   requestAnimationFrame(frame);
  }catch(e){fail(e);}
 }
 requestAnimationFrame(frame);
}
start().catch(e=>{$('status').textContent='Fehler: '+e.message;console.error(e);});


