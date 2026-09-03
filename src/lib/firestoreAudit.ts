export interface AuditLogDocument {
  agentId: string
  agentHandle: string
  action: string
  evidenceHash: string
  status: string
  envTag?: string
  durationMs?: number
  operatorEmail?: string
  timestamp?: string
}

const memLogs: AuditLogDocument[] = []

export async function persistAuditLog(log: AuditLogDocument): Promise<void> {
  // TODO: plug Firestore real - por enquanto memória honesta, não fabrica hash
  const entry = { ...log, timestamp: new Date().toISOString() }
  memLogs.unshift(entry)
  if (memLogs.length > 100) memLogs.pop()
  console.log("[GOS3-AUDIT-STUB]", entry)
}

export async function getRecentAuditLogs(limit = 10): Promise<AuditLogDocument[]> {
  return memLogs.slice(0, limit)
}
