export const VERSION='0.11.0';
export const CONFIG=Object.freeze({seed:71,speed:4,eyeHeight:1.65,playerRadius:.35,bounds:44,maxDt:.05,spawn:{x:0,z:0,yaw:0,pitch:-.08}});
export function height(x,z){return 1.6*Math.sin(x*.19)*Math.cos(z*.17)+.65*Math.sin(x*.43+z*.28)+.18*Math.cos(z*.9-x*.6)}


