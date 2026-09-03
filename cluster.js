import cluster from 'cluster'
import os from 'os'
const cpus = Math.min(4, os.cpus().length)
if(cluster.isPrimary){
  console.log(`[VORTEX CLUSTER] ${cpus} workers - mesh 15 agents -> ~120ms`)
  for(let i=0;i<cpus;i++) cluster.fork()
  cluster.on('exit',(w,code)=>{ console.log(`worker ${w.process.pid} died ${code} refork`); cluster.fork() })
} else {
  await import('./dist/server.cjs')
}
