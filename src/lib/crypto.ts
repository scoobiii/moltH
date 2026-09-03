export function getRealClientEnvTag(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'node'
  const isTermux = ua.toLowerCase().includes('android') || typeof process !== 'undefined' && process.arch === 'arm64'
  return isTermux ? 'node-arm64-termux-resilient' : 'node-x64-resilient'
}

export async function computeFormalEvidenceHash(input: { stdout: string, stderr: string, exitCode: number, durationMs: number }): Promise<string> {
  const payload = `${input.stdout}${input.stderr}${input.exitCode}${input.durationMs}`
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const enc = new TextEncoder().encode(payload)
    const hash = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')
  } else {
    const { createHash } = await import('crypto')
    return createHash('sha256').update(payload, 'utf8').digest('hex')
  }
}
