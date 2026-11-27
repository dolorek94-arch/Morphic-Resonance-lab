export function createInput(canvas,onPulse,onReset) {
 const keys=new Set(),state={yaw:0,pitch:-.08};
 let drag=null;
 const look=(dx,dy)=>{
  state.yaw-=dx*.003;
  state.pitch=Math.max(-1.1,Math.min(1.1,state.pitch-dy*.003));
 };
 const clear=()=>{keys.clear();drag=null;};
 const editable=e=>e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName);
 const fallback=()=>{document.getElementById('hint').textContent='WASD: bewegen · Linke Maustaste halten und ziehen: umsehen · Leertaste: Impuls · R: Startpunkt. Mausfang ist in diesem Browser nicht verfügbar.';};
 window.addEventListener('keydown',e=>{
  if(editable(e)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(e.code==='Space'&&!e.repeat)onPulse();
  if(e.code==='KeyR'&&!e.repeat)onReset();
 });
 window.addEventListener('keyup',e=>keys.delete(e.code));
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',clear);
 document.addEventListener('pointerlockchange',clear);
 document.addEventListener('pointerlockerror',fallback);
 canvas.tabIndex=0;
 canvas.setAttribute('aria-label','3D-Ansicht. WASD bewegen, Maus ziehen zum Umsehen.');
 canvas.addEventListener('click',e=>{
  if(e.pointerType!=='mouse'||document.pointerLockElement===canvas)return;
  if(!canvas.requestPointerLock){fallback();return;}
  try{Promise.resolve(canvas.requestPointerLock()).catch(fallback);}catch{fallback();}
 });
 document.addEventListener('mousemove',e=>{
  if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);
 });
 canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0)return;
  canvas.focus({preventScroll:true});
  if(document.pointerLockElement===canvas)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId||document.pointerLockElement===canvas)return;
  look((e.clientX-drag.x)*2,(e.clientY-drag.y)*2);drag.x=e.clientX;drag.y=e.clientY;
 });
 const release=e=>{if(drag?.id===e.pointerId)drag=null;};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
 return {state,clear,axes(){
  const right=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
  const forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);
  const length=Math.max(1,Math.hypot(right,forward));return {right:right/length,forward:forward/length};
 }};
}
