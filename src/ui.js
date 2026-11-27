import {VERSION} from './config.js';
export const $=id=>document.getElementById(id);
export function createUI({pulse,reset,benchmark,lab}){
 $('version').textContent='MORPHIC RESONANCE LAB / '+VERSION;
 $('pulse').onclick=pulse;$('reset').onclick=reset;$('benchmark').onclick=benchmark;
 $('lab-controls').hidden=!lab;
 $('scene-note').textContent=lab
  ? 'Resonanz zieht Material aus den K�rpern in die H�lse. Wiederholte Impulse hinterlassen eine Formspur. Startpunkt l�scht sie. Verbindungen halten zeigt den Wellentest.'
  : 'Archivierte Versuchsanordnung der Landschaft. Das neue Resonanzverhalten wird zuerst im Formlabor entwickelt.';
 let nextStatus=0;
 return {
  strength:()=>+$('amp').value,
  target:()=>+$('target').value,
  glow:()=>$('glow').checked,
  shadows:()=>$('shadows').checked,
  held:()=>$('held').checked,
  slow:()=>$('slow').checked,
  status(fps,ms,info,nodes){
   const now=performance.now();if(now<nextStatus)return;nextStatus=now+200;
   $('status').textContent=VERSION+' � '+Math.round(fps)+' FPS � '+ms.toFixed(1)+' ms � '+info.render.calls+' Draws';
   if(lab)nodes.forEach((n,i)=>{
    $('signal'+i).value=n.activity;
    $('memory'+i).textContent='Reaktion '+Math.round(n.activity*100)+' % � Ged�chtnis '+Math.round(n.memory*100)+' % � Formspur '+Math.round(Math.max(n.setLeft,n.setRight)*100)+' %';
   });
  }
 };
}

