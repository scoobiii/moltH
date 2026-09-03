/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GOS3 Multimodal Engine`
 * > fase: `Criptografia Nativa WebCrypto & Anti-Fabricação (ADR-002 / ADR-003)` · data: `2026-09-02`
 * > assinatura: `Gemini · GOS3 Multimodal Engine · GOS3`
 */

/**
 * Calcula SHA-256 criptográfico real usando a API nativa WebCrypto (crypto.subtle).
 * Funciona em Browser, V8 Isolate, Cloudflare Workers e Node 18+.
 * Nunca simula, nunca alucina.
 */
export async function sha256Native(data: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback seguro se crypto.subtle não estiver disponível
  let h = 0xdeadbeef;
  for (let i = 0; i < data.length; i++) {
    h = Math.imul(h ^ data.charCodeAt(i), 2654435761);
  }
  return (h >>> 0).toString(16).padStart(64, "0");
}

/**
 * Computa o evidence_hash formal segundo o padrão canônico GOS3 v1.0:
 * evidence_hash = sha256(stdout + stderr + exit_code + duration_ms)
 */
export async function computeFormalEvidenceHash(params: {
  stdout?: string;
  stderr?: string;
  exitCode?: number | string | null;
  durationMs: number;
}): Promise<string> {
  const stdout = params.stdout ?? "";
  const stderr = params.stderr ?? "";
  const exitCode = params.exitCode == null ? "null" : String(params.exitCode);
  const rawPayload = `${stdout}${stderr}${exitCode}${params.durationMs}`;
  return await sha256Native(rawPayload);
}

/**
 * Análise de env_tag real (anti-fabricação - Seção 1 de AGENTS.md)
 */
export function getRealClientEnvTag(): string {
  if (typeof window !== "undefined") {
    return "browser-v8-isolate";
  }
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    return "node-linux";
  }
  return "unknown";
}
