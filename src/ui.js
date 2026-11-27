import {VERSION} from './config.js';
export const $=id=>document.getElementById(id);
export function createUI({pulse,reset,benchmark,lab}){
 $('version').textContent='MORPHIC RESONANCE LAB / '+VERSION;
 $('pulse').onclick=pulse;$('reset').onclick=reset;$('benchmark').onclick=benchmark;
 $('lab-controls').hidden=!lab;
 $('scene-note').textContent=lab
  ? 'Drei Materialien, ein gemeinsames Formfeld. Impulsziel wählen und Resonanzimpuls auslösen. Leuchten ist zum Formvergleich ausgeschaltet. Implizite Schlagschatten folgen später.'
  : 'Archivierte Versuchsanordnung der Landschaft. Das neue Resonanzverhalten wird zuerst im Formlabor entwickelt.';
 let nextStatus=0;
 return {
  strength:()=>+$('amp').value,
  target:()=>+$('target').value,
  glow:()=>$('glow').checked,
  status(fps,ms,info,nodes){
   const now=performance.now();if(now<nextStatus)return;nextStatus=now+200;
   $('status').textContent=VERSION+' · '+Math.round(fps)+' FPS · '+ms.toFixed(1)+' ms · '+info.render.calls+' Draws';
   if(lab)nodes.forEach((n,i)=>{
    $('signal'+i).value=n.activity;
    $('memory'+i).textContent='Reaktion '+Math.round(n.activity*100)+' % · Gedächtnis '+Math.round(n.memory*100)+' %';
   });
  }
 };
}
