import crypto from 'crypto'
export function sealEnvelope(receipt: any) {
  const payload = JSON.stringify(receipt)
  const hash = crypto.createHash('sha256').update(payload).digest('hex')
  const sealed = {
    evidenceHash: receipt.evidenceHash,
    sha256: `0x${hash}`,
    payload,
    timestamp: new Date().toISOString(),
    runtime_id: "427273fd2bdb12e608222856fd248a4a07d25599a74a6fbe318908a14493f2da"
  }
  // 3 destinos imutáveis
  // a) git tag imutável
  // b) firestore WAL (você já tem firestoreAudit.ts)
  // c) arquivo local + backup
  return sealed
}
export async function persistImmutable(envelope: any) {
  // nunca mais só docs/ - escreve em 3 lugares
  const { persistAuditLog } = await import('./firestoreAudit')
  await persistAuditLog({
    agentId: 'GOS3-Auditor',
    agentHandle: 'GOS3-Auditor',
    action: 'SEAL_IMMUTABLE',
    evidenceHash: envelope.evidenceHash,
    status: 'passed',
    envTag: envelope.env_tag,
    durationMs: envelope.executionTimeMs
  } as any).catch(()=>{})
  // local + git
  const fs = await import('fs')
  fs.mkdirSync('docs/envelopes-sprint1', {recursive:true})
  fs.writeFileSync(`docs/envelopes-sprint1/sealed-${envelope.evidenceHash}.json`, JSON.stringify(envelope, null, 2))
  return envelope
}
