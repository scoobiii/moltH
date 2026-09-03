import { useState, useEffect } from "react"
import { getRealClientEnvTag } from "../../lib/crypto"
import { persistAuditLog, getRecentAuditLogs, AuditLogDocument } from "../../lib/firestoreAudit"

interface BusinessAgentItem {
  id: string
  handle: string
  runtimeId: string
  model: string
  firm?: string
}

interface ExecutionReceipt {
  contract_version?: string
  invocation_id?: string
  agent?: string
  status?: string
  executed?: boolean
  output?: {
    stdout?: string
    stderr?: string
    exit_code?: number | null
  }
  duration_ms?: number
  evidence_hash?: string
  runtime_id?: string
  timestamp?: string
  error?: string
}

interface VerificationResult {
  status: "idle" | "running" | "passed" | "failed"
  evidenceHash?: string
  invocationId?: string
  runtimeId?: string
  latencyMs?: number
  envTag?: string
  output?: string
  error?: string
}

function isRealExecutionReceipt(data: ExecutionReceipt): boolean {
  return (
    data.contract_version === "0.1" &&
    data.status === "success" &&
    data.executed === true &&
    data.output?.exit_code === 0 &&
    typeof data.invocation_id === "string" &&
    data.invocation_id.length > 0 &&
    typeof data.runtime_id === "string" &&
    data.runtime_id.length > 0 &&
    typeof data.evidence_hash === "string" &&
    data.evidence_hash.length > 0
  )
}

export function SovereignVerificationSuite({ agents }: { agents: BusinessAgentItem[] }) {
  const [results, setResults] = useState<Record<string, VerificationResult>>({})
  const [auditLogs, setAuditLogs] = useState<AuditLogDocument[]>([])
  const [isRunningAll, setIsRunningAll] = useState(false)

  useEffect(() => {
    getRecentAuditLogs(10).then(setAuditLogs).catch(() => {})
  }, [])

  const runAgentTest = async (agent: BusinessAgentItem) => {
    setResults(prev => ({ ...prev, [agent.id]: { status: "running" } }))
    const startedAt = performance.now()
    const clientEnvTag = getRealClientEnvTag()

    try {
      const res = await fetch("/api/gos3/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "executeJavaScript",
          params: {
            code: `console.log("[GOS3-AUDIT] ${agent.handle}"); return { handle: ${JSON.stringify(agent.handle)} }`
          }
        })
      })

      const data = (await res.json()) as ExecutionReceipt
      const elapsedMs = Math.round(performance.now() - startedAt)
      const passed = res.ok && isRealExecutionReceipt(data)
      const output = [data.output?.stdout, data.output?.stderr].filter(Boolean).join("\n")
      const error = passed
        ? undefined
        : data.error ||
          `Execution rejected: status=${data.status ?? "unknown"}, executed=${String(data.executed)}, exit_code=${String(data.output?.exit_code ?? "null")}`

      const result: VerificationResult = {
        status: passed ? "passed" : "failed",
        evidenceHash: data.evidence_hash,
        invocationId: data.invocation_id,
        runtimeId: data.runtime_id,
        latencyMs: data.duration_ms ?? elapsedMs,
        // Client-side environment is diagnostic only; it is never used as runtime attestation.
        envTag: clientEnvTag,
        output,
        error
      }

      setResults(prev => ({ ...prev, [agent.id]: result }))

      if (data.evidence_hash) {
        await persistAuditLog({
          agentId: agent.id,
          agentHandle: agent.handle,
          action: "SOVEREIGN_VERIFICATION_TEST",
          evidenceHash: data.evidence_hash,
          status: result.status,
          envTag: clientEnvTag,
          durationMs: result.latencyMs
        }).catch(() => {})
      }

      const logs = await getRecentAuditLogs(10).catch(() => [] as AuditLogDocument[])
      setAuditLogs(logs)
    } catch (e: any) {
      setResults(prev => ({
        ...prev,
        [agent.id]: {
          status: "failed",
          latencyMs: Math.round(performance.now() - startedAt),
          envTag: clientEnvTag,
          error: e?.message || "Request failed"
        }
      }))
    }
  }

  const runAllTests = async () => {
    setIsRunningAll(true)
    try {
      for (const agent of agents) await runAgentTest(agent)
    } finally {
      setIsRunningAll(false)
    }
  }

  const passedCount = Object.values(results).filter(r => r.status === "passed").length

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Sovereign Verification — {passedCount}/{agents.length} valid executions</h2>
      <div className="text-sm opacity-70">
        Runtime identity and evidence come from the server execution receipt. Client env: {getRealClientEnvTag()}
      </div>

      <button
        onClick={runAllTests}
        disabled={isRunningAll}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isRunningAll ? "Running..." : "Run All"}
      </button>

      <div className="mt-4 grid gap-2">
        {agents.map(agent => {
          const result = results[agent.id]
          const statusClass = result?.status === "passed"
            ? "text-green-600"
            : result?.status === "failed"
              ? "text-red-600"
              : ""

          return (
            <div key={agent.id} className="border p-2 rounded">
              <div className="flex justify-between gap-2">
                <span>{agent.handle}</span>
                <span className={statusClass}>
                  {result?.status || "idle"}
                  {result?.latencyMs ? ` ${result.latencyMs}ms` : ""}
                </span>
              </div>

              {result?.runtimeId && (
                <div className="text-xs opacity-70 mt-1">runtime_id: {result.runtimeId}</div>
              )}
              {result?.invocationId && (
                <div className="text-xs opacity-70">invocation_id: {result.invocationId}</div>
              )}
              {result?.evidenceHash && (
                <div className="text-xs opacity-70">evidence_hash: {result.evidenceHash}</div>
              )}
              {result?.output && (
                <pre className="text-xs mt-1 whitespace-pre-wrap">{result.output}</pre>
              )}
              {result?.error && (
                <div className="text-xs text-red-600 mt-1">{result.error}</div>
              )}

              <button
                onClick={() => runAgentTest(agent)}
                disabled={result?.status === "running"}
                className="mt-2 px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Test Real
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-xs">
        <div>Recent audit log (in-memory stub): {auditLogs.length}</div>
        {auditLogs.map((log, index) => (
          <div key={`${log.agentId}-${log.timestamp ?? index}`}>
            {log.agentHandle} {log.status} {log.evidenceHash?.slice(0, 18)} {log.envTag}
          </div>
        ))}
      </div>
    </div>
  )
}
