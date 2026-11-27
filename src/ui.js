import {VERSION} from './config.js';
export const $=id=>document.getElementById(id);
export function createUI({pulse,reset,quality,benchmark}){
 $('version').textContent='MORPHIC RESONANCE LAB / '+VERSION;
 $('pulse').onclick=pulse;$('reset').onclick=reset;
 $('quality').onclick=quality;$('benchmark').onclick=benchmark;
 return {strength:()=>+$('amp').value,
 status(fps,ms,info){$('status').textContent=VERSION+' · '+Math.round(fps)+' FPS · '+ms.toFixed(1)+' ms · '+info.render.calls+' Draws';},
 quality(high){$('quality').textContent='Qualität: '+(high?'Hoch':'Mobil');},
 error(e){$('status').textContent='Fehler: '+e.message;console.error(e);}
 };
}

