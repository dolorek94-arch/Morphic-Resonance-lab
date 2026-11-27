import {VERSION} from './config.js';
export const $=id=>document.getElementById(id);
export function createUI({pulse,reset,benchmark,preview,lab,grotto}){
 $('version').textContent='MORPHIC RESONANCE LAB / '+VERSION;
 $('pulse').onclick=pulse;$('reset').onclick=reset;$('benchmark').onclick=benchmark;
 $('lab-controls').hidden=!lab;
 $('preview').hidden=!grotto;
 $('preview').onclick=preview;
 $('scene-note').textContent=grotto
  ? 'Die Demo zeigt drei Impulse aus demselben Blickwinkel. Beobachte, wie das Licht von links nach rechts wandert und der violette Fächer geöffnet bleibt.'
  : lab
  ? 'Resonanz zieht Material aus den Körpern in die Hälse. Wiederholte Impulse hinterlassen eine Formspur. Startpunkt löscht sie. Verbindungen halten zeigt den Wellentest.'
  : 'Archivierte Versuchsanordnung der Landschaft. Das neue Resonanzverhalten wird zuerst im Formlabor entwickelt.';
 let nextStatus=0;
 return {
  setDemo(active){$('preview').textContent=active?'Grottendemo stoppen':'Grottendemo starten';},
  strength:()=>+$('amp').value,
  target:()=>+$('target').value,
  glow:()=>$('glow').checked,
  shadows:()=>$('shadows').checked,
  held:()=>$('held').checked,
  slow:()=>$('slow').checked,
  status(fps,ms,info,nodes){
   const now=performance.now();if(now<nextStatus)return;nextStatus=now+200;
   $('status').textContent=VERSION+' · '+Math.round(fps)+' FPS · '+ms.toFixed(1)+' ms · '+info.render.calls+' Draws';
   if(lab)nodes.forEach((n,i)=>{
    $('signal'+i).value=n.activity;
    $('memory'+i).textContent='Reaktion '+Math.round(n.activity*100)+' % · Gedächtnis '+Math.round(n.memory*100)+' % · Formspur '+Math.round(Math.max(n.setLeft,n.setRight)*100)+' %';
   });
  }
 };
}
