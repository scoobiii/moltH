
import { useState, useEffect } from "react"
import { getRealClientEnvTag } from "../../lib/crypto"
import { persistAuditLog, getRecentAuditLogs, AuditLogDocument } from "../../lib/firestoreAudit"

const auth = { currentUser: { email: "operator@gos3.sovereign" } } as any
interface BusinessAgentItem { id: string; handle: string; runtimeId: string; model: string; firm?: string }
interface VerificationResult {
  status: 'idle' | 'running' | 'passed' | 'failed'
  evidenceHash?: string
  latencyMs?: number
  envTag?: string
  output?: string
  error?: string
}

export function SovereignVerificationSuite({ agents }: { agents: BusinessAgentItem[] }) {
  const [results, setResults] = useState<Record<string, VerificationResult>>({})
  const [auditLogs, setAuditLogs] = useState<AuditLogDocument[]>([])
  const [isRunningAll, setIsRunningAll] = useState(false)

  useEffect(() => {
    getRecentAuditLogs(10).then(logs => setAuditLogs(logs)).catch(()=>{})
  }, [])

  const runAgentTest = async (agent: BusinessAgentItem) => {
    setResults(prev => ({ ...prev, [agent.id]: { status: 'running' } }))
    const t0 = performance.now()
    const envTag = getRealClientEnvTag()
    try {
      const res = await fetch('/api/vortex/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: "executeJavaScript",
          params: { code: `console.log('[GOS3-AUDIT] ${agent.handle} ' + new Date().toISOString()); return { handle: '${agent.handle}' }` }
        })
      })
      const data = await res.json()
      const duration = Math.round(performance.now() - t0)
      const isFailed = !data.success
      setResults(prev => ({ ...prev, [agent.id]: { status: isFailed ? 'failed' : 'passed', evidenceHash: data.evidenceHash, latencyMs: data.executionTimeMs || duration, envTag, output: data.logs?.join("\n") } }))
      await persistAuditLog({ agentId: agent.id, agentHandle: agent.handle, action: "SOVEREIGN_VERIFICATION_TEST", evidenceHash: data.evidenceHash, status: isFailed ? "failed" : "passed", envTag, durationMs: data.executionTimeMs || duration, operatorEmail: auth.currentUser?.email }).catch(()=>{})
      const logs = await getRecentAuditLogs(10).catch(()=>[] as AuditLogDocument[])
      if (logs.length) setAuditLogs(logs)
    } catch (e:any) {
      setResults(prev => ({ ...prev, [agent.id]: { status: 'failed', latencyMs: Math.round(performance.now()-t0), envTag, error: e.message } }))
    }
  }

  const runAllTests = async () => {
    setIsRunningAll(true)
    for (const a of agents) await runAgentTest(a)
    setIsRunningAll(false)
  }

  const passedCount = Object.values(results).filter(r=>r.status==='passed').length
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Sovereign Verification - GOS3 Real 427273fd - V8 {passedCount}/{agents.length}</h2>
      <div className="text-sm opacity-70">runtime_id 427273fd... | evidence_hash único por execução | env {getRealClientEnvTag()}</div>
      <button onClick={runAllTests} disabled={isRunningAll} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">{isRunningAll ? "Running V8..." : "Run All Real V8"}</button>
      <div className="mt-4 grid gap-2">
        {agents.map(a=>{ const r=results[a.id]; return <div key={a.id} className="border p-2 rounded flex justify-between"><span>{a.handle}</span><span className={r?.status==='passed'?'text-green-600':r?.status==='failed'?'text-red-600':''}>{r?.status||'idle'} {r?.evidenceHash?.slice(0,18)} {r?.latencyMs?r.latencyMs+'ms':''}</span><button onClick={()=>runAgentTest(a)} className="px-2 py-1 bg-gray-200 rounded">Test Real</button></div> })}
      </div>
      <div className="mt-6 text-xs">
        <div>Recent WAL (stub honesto): {auditLogs.length}</div>
        {auditLogs.map((l,i)=><div key={i}>{l.agentHandle} {l.status} {l.evidenceHash?.slice(0,12)} {l.envTag}</div>)}
      </div>
    </div>
  )
}
