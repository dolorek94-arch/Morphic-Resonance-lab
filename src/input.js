export function createInput(canvas,stick,knob,onPulse,onReset) {
 const keys=new Set(), state={yaw:0,pitch:-.08,joyX:0,joyY:0}, look=(dx,dy)=>{
 state.yaw-=dx*.003;state.pitch=Math.max(-1.1,Math.min(1.1,state.pitch-dy*.003));};
 const clear=()=>{keys.clear();state.joyX=state.joyY=0;knob.style.transform='none';drag=null;};
 let drag=null, stickId=null;
 const editable=e=>e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName);
 window.addEventListener('keydown',e=>{
  if(editable(e)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code))e.preventDefault();
  keys.add(e.code);if(e.code==='Space'&&!e.repeat)onPulse();
  if(e.code==='KeyR'&&!e.repeat)onReset();
 });
 window.addEventListener('keyup',e=>keys.delete(e.code));
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',clear);
 document.addEventListener('pointerlockchange',clear);
 document.addEventListener('pointerlockerror',()=>{document.getElementById('hint').textContent='Mausfang nicht verfügbar – Bild ziehen zum Umsehen.';});
 canvas.addEventListener('click',e=>{
  if(e.pointerType==='mouse' && document.pointerLockElement!==canvas && canvas.requestPointerLock)
   Promise.resolve(canvas.requestPointerLock()).catch(()=>{});
 });
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);});
 canvas.addEventListener('pointerdown',e=>{
  if(document.pointerLockElement===canvas)return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId||document.pointerLockElement===canvas)return;
  look((e.clientX-drag.x)*2,(e.clientY-drag.y)*2);drag.x=e.clientX;drag.y=e.clientY;
 });
 const release=e=>{if(drag?.id===e.pointerId)drag=null;};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
 const move=e=>{
  const b=stick.getBoundingClientRect(),radius=b.width/2,dx=e.clientX-b.left-radius,dy=e.clientY-b.top-radius,k=Math.max(40,Math.hypot(dx,dy));
  state.joyX=dx/k;state.joyY=dy/k;knob.style.transform='translate('+state.joyX*36+'px,'+state.joyY*36+'px)';
 };
 stick.addEventListener('pointerdown',e=>{if(stickId!==null)return;stickId=e.pointerId;stick.setPointerCapture(e.pointerId);move(e);});
 stick.addEventListener('pointermove',e=>{if(stickId===e.pointerId)move(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{
  if(stickId!==e.pointerId)return;stickId=null;state.joyX=state.joyY=0;knob.style.transform='none';
 });
 return {state,clear,axes(){
  let right=state.joyX+(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
  let forward=-state.joyY+(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);
  const length=Math.max(1,Math.hypot(right,forward));return {right:right/length,forward:forward/length};
 }};
}

