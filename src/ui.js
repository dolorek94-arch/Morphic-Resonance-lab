import {VERSION} from './config.js';
export const $=id=>document.getElementById(id);
export function createUI({pulse,reset,benchmark}){
 $('version').textContent='MORPHIC RESONANCE LAB / '+VERSION;
 $('pulse').onclick=pulse;$('reset').onclick=reset;
 $('benchmark').onclick=benchmark;
 return {strength:()=>+$('amp').value,
 status(fps,ms,info){$('status').textContent=VERSION+' · '+Math.round(fps)+' FPS · '+ms.toFixed(1)+' ms · '+info.render.calls+' Draws';},
 error(e){$('status').textContent='Fehler: '+e.message;console.error(e);}
 };
}

