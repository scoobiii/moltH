import fs from "fs"
import { AgentSandbox } from "./sandbox"
import crypto from "crypto"

const SNAPSHOT_DIR = "/storage/emulated/0/moltH-snapshots"
fs.mkdirSync(SNAPSHOT_DIR, {recursive:true})

interface VortexJob { id:string, code:string, agent:string, retries:number }

const queue: VortexJob[] = []
let running = 0
const MAX_CONCURRENT = 2 // Termux 3.4GB RAM não aguenta mais

export async function vortexEnqueue(agent:string, code:string){
  const job = { id: crypto.randomUUID().slice(0,8), code, agent, retries:0 }
  queue.push(job)
  persist()
  return runQueue()
}

function persist(){
  fs.writeFileSync(`${SNAPSHOT_DIR}/queue.json`, JSON.stringify(queue.slice(0,20)))
  fs.writeFileSync(`${SNAPSHOT_DIR}/last.json`, JSON.stringify({ts:Date.now(), queueLen: queue.length, running}))
}

async function runQueue(){
  if(running>=MAX_CONCURRENT || queue.length===0) return {queued:true, len:queue.length}
  running++
  const job = queue.shift()!
  try{
    const res = AgentSandbox.executeJavaScript(job.code, 2000)
    const envelope = {
      valid: res.success,
      agent_id: job.agent,
      evidence_hash: res.evidenceHash,
      runtime_id: job.id,
      env_tag: `node-${process.arch}-termux-resilient`,
      logs: res.logs,
      timestamp: new Date().toISOString()
    }
    fs.writeFileSync(`${SNAPSHOT_DIR}/envelope-${job.agent}-${job.id}.json`, JSON.stringify(envelope,null,2))
    fs.writeFileSync(`docs/envelopes-sprint1/envelope-${job.agent.toLowerCase()}-${job.id}.json`, JSON.stringify(envelope,null,2))
    persist()
    return envelope
  }catch(e:any){
    if(job.retries<2){ job.retries++; queue.unshift(job) }
    return {error:e.message, retries:job.retries}
  }finally{
    running--
    if(queue.length>0) setTimeout(runQueue, 100)
  }
}

export function vortexStatus(){
  try{
    const q = JSON.parse(fs.readFileSync(`${SNAPSHOT_DIR}/queue.json`,'utf-8'))
    return {running, queued:q.length, snapshotDir:SNAPSHOT_DIR, free: true}
  }catch{ return {running, queued:queue.length} }
}
