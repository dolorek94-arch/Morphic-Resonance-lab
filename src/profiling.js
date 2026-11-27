export function createProfiler(){
 let run=null;
 return {
 start(metadata){run={metadata,samples:[],elapsed:0};return run;},
 cancel(){if(run)document.getElementById('report').textContent='Messung abgebrochen. Zum Vergleichen erneut starten.';run=null;},
 sample(ms,info){
  if(!run)return null;run.samples.push(ms);run.elapsed+=ms;
  document.getElementById('report').textContent='Messung: '+Math.min(60,run.elapsed/1000).toFixed(1)+' / 60 s';
  if(run.elapsed<60000)return null;
  const sorted=run.samples.toSorted((a,b)=>a-b),sum=run.samples.reduce((a,b)=>a+b,0);
  const result={...run.metadata,frames:sorted.length,durationMs:sum,fps:sorted.length*1000/sum,
   meanMs:sum/sorted.length,p50Ms:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)],p99Ms:sorted[Math.floor(sorted.length*.99)],
   drawCalls:info.render.calls,triangles:info.render.triangles,geometries:info.memory.geometries,textures:info.memory.textures,
   note:'CPU wall-clock frame intervals; not GPU times. Geometry/texture values are counts, not bytes. GPU load, VRAM and device temperature require an external profiler.'};
  run=null;document.getElementById('report').textContent=JSON.stringify(result,null,2);return result;
 },
 get active(){return run!==null;}
 };
}

