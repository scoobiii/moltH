import cluster from 'cluster'
import os from 'os'
if(cluster.isPrimary){
  const cpus = Math.min(4, os.cpus().length)
  console.log(`[VORTEX CLUSTER] Forking ${cpus} workers for 15 agents mesh`)
  for(let i=0;i<cpus;i++) cluster.fork()
  cluster.on('exit',(w)=>{ console.log(`worker ${w.process.pid} died, refork`); cluster.fork() })
} else {
  const distServerPath = '../../dist/server.cjs'
  // @ts-ignore
  await import(/* @vite-ignore */ distServerPath)
}
