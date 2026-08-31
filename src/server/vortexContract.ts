import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GOS3 Invocation Contract & Runtime ID Engine`
 * > fase: `Fase 5 — ADR-003 & Contrato v0.1 Padronizado` · data: `2026-08-23`
 * > antes: Divergência entre instâncias Termux e Cloud Run, risco de simulação de execução sem prova formal
 * > depois: Contrato v0.1 com runtime_id determinístico de 64 hex, evidence_hash obrigatório e execução real
 * > base: commit `gos3-core-v1.2`, ADR-003, INC-001
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

export interface ExecutionProof {
  node_id: string;
  claim: "executed" | "failed" | "not_executed";
  runtime: {
    engine: string;
    arch: string;
    verifiable_via: string;
  };
  proof: {
    stdout_raw: string;
    exit_code: number | null;
    duration_ms: number;
  };
  input_hash: string;
  output_hash: string;
  timestamp: string;
}

export type GOS3Status = "success" | "failed" | "error" | "partial" | "timeout" | "auth_required";
export type GOS3TaskKind = "code_exec" | "shell" | "tool_call" | "llm_inference";

export interface GOS3InvocationRequest {
  contract_version: "v0.1";
  invocation_id: string;
  agent: string;
  task: {
    kind: GOS3TaskKind;
    payload: string;
    language?: string;
  };
  limits: {
    timeout_seconds: number;
    max_output_bytes: number;
  };
  context_ref?: string;
  env_tag?: string;
}

export function validateInvocationRequest(request: unknown): { valid: boolean; reason?: string } {
  if (!request || typeof request !== "object") return { valid: false, reason: "request inválido" };
  const value = request as any;
  if (value.contract_version !== "v0.1") return { valid: false, reason: "contract_version deve ser v0.1" };
  if (typeof value.invocation_id !== "string" || value.invocation_id.length === 0) return { valid: false, reason: "invocation_id obrigatório" };
  if (typeof value.agent !== "string" || value.agent.length === 0) return { valid: false, reason: "agent obrigatório" };
  if (!value.task || typeof value.task !== "object" || !["code_exec", "shell", "tool_call", "llm_inference"].includes(value.task.kind)) {
    return { valid: false, reason: "task.kind inválido" };
  }
  if (typeof value.task.payload !== "string") return { valid: false, reason: "task.payload deve ser string" };
  if (!value.limits || !Number.isInteger(value.limits.timeout_seconds) || value.limits.timeout_seconds <= 0) {
    return { valid: false, reason: "limits.timeout_seconds deve ser inteiro positivo" };
  }
  if (!value.limits || !Number.isInteger(value.limits.max_output_bytes) || value.limits.max_output_bytes <= 0) {
    return { valid: false, reason: "limits.max_output_bytes deve ser inteiro positivo" };
  }
  return { valid: true };
}

export interface GOS3ContractEnvelope<T = any> {
  executed: boolean;
  status: GOS3Status;
  output: T;
  duration_ms: number;
  evidence_hash: string;
  contract_version: "v0.1";
  invocation_id: string;
  agent: string;
  truncated: boolean;
  runtime_id: string;
}

export const sha256 = (s: string): string =>
  createHash("sha256").update(s, "utf-8").digest("hex");

/**
 * Canonical Sprint 0 evidence hash. The exact byte-level inputs are kept
 * intentionally small and portable across TypeScript/Python consumers.
 */
export function computeEvidenceHash(params: {
  stdout?: string;
  stderr?: string;
  exit_code?: number | null;
  duration_ms: number;
}): string {
  const stdout = params.stdout ?? "";
  const stderr = params.stderr ?? "";
  const exitCode = params.exit_code == null ? "null" : String(params.exit_code);
  return sha256(`${stdout}${stderr}${exitCode}${params.duration_ms}`);
}

function evidenceParts(envelope: GOS3ContractEnvelope): {
  stdout: string;
  stderr: string;
  exit_code: number | null;
} {
  const output = envelope.output as any;
  if (output && typeof output === "object" && !Array.isArray(output)) {
    return {
      stdout: typeof output.stdout === "string" ? output.stdout : "",
      stderr: typeof output.stderr === "string" ? output.stderr : "",
      exit_code: typeof output.exit_code === "number" ? output.exit_code : null,
    };
  }
  return { stdout: typeof output === "string" ? output : JSON.stringify(output ?? ""), stderr: "", exit_code: envelope.executed ? 0 : 1 };
}

/**
 * Gera o runtime_id único e determinístico para a instância atual (64 hex characters).
 * Distingue formalmente instâncias Termux/Android, Cloud Run, VPS ou Isolate.
 */
export function getRuntimeId(): string {
  const envTag = process.env.GOS3_ENV_TAG || (process.env.K_SERVICE ? "cloud-run" : "node-linux");
  const hostname = os.hostname() || "localhost";
  const platform = os.platform() || "linux";
  const arch = os.arch() || "x64";
  const rawId = `GOS3-RUNTIME:${envTag}:${hostname}:${platform}:${arch}:${process.pid}`;
  return sha256(rawId);
}

/**
 * Constrói o envelope canônico do contrato v0.1 com cálculo estrito de evidence_hash e runtime_id.
 */
export function buildContractEnvelope<T = any>(params: {
  agent: string;
  output: T;
  duration_ms: number;
  status?: GOS3Status;
  executed?: boolean;
  truncated?: boolean;
  invocation_id?: string;
  rawStdout?: string;
  rawStderr?: string;
  exitCode?: number | null;
}): GOS3ContractEnvelope<T> {
  const status: GOS3Status = params.status || "success";
  const executed = params.executed ?? status === "success";
  const invocation_id = params.invocation_id || `inv-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const runtime_id = getRuntimeId();

  // Cálculo canônico do Sprint 0:
  // sha256(stdout + stderr + exit_code + duration_ms)
  const outputRecord = params.output && typeof params.output === "object" ? params.output as any : undefined;
  const stdout = params.rawStdout ?? (typeof params.output === "string" ? params.output : outputRecord?.stdout ?? JSON.stringify(params.output));
  const stderr = params.rawStderr ?? outputRecord?.stderr ?? "";
  const outputExitCode = outputRecord && Object.prototype.hasOwnProperty.call(outputRecord, "exit_code") ? outputRecord.exit_code : undefined;
  const exitCode = params.exitCode !== undefined ? params.exitCode : outputExitCode !== undefined ? outputExitCode : status === "success" ? 0 : 1;
  const evidence_hash = computeEvidenceHash({
    stdout,
    stderr,
    exit_code: exitCode,
    duration_ms: params.duration_ms,
  });

  return {
    executed,
    status,
    output: params.output,
    duration_ms: params.duration_ms,
    evidence_hash,
    contract_version: "v0.1",
    invocation_id,
    agent: params.agent,
    truncated: params.truncated ?? false,
    runtime_id,
  };
}

/**
 * Validador estrito do contrato v0.1
 */
export function validateContractEnvelope(envelope: any): { valid: boolean; reason?: string } {
  if (!envelope || typeof envelope !== "object") {
    return { valid: false, reason: "Envelope nulo ou formato inválido" };
  }

  const requiredFields = [
    "executed",
    "status",
    "output",
    "duration_ms",
    "evidence_hash",
    "contract_version",
    "invocation_id",
    "agent",
    "truncated",
    "runtime_id",
  ];

  for (const field of requiredFields) {
    if (envelope[field] === undefined) {
      return { valid: false, reason: `Campo obrigatório ausente: ${field}` };
    }
  }

  if (typeof envelope.executed !== "boolean") {
    return { valid: false, reason: "executed deve ser booleano" };
  }

  const allowedStatuses: GOS3Status[] = ["success", "failed", "error", "partial", "timeout", "auth_required"];
  if (!allowedStatuses.includes(envelope.status)) {
    return { valid: false, reason: `status inválido: ${String(envelope.status)}` };
  }

  if (typeof envelope.duration_ms !== "number" || !Number.isFinite(envelope.duration_ms) || envelope.duration_ms < 0) {
    return { valid: false, reason: "duration_ms deve ser número finito não negativo" };
  }

  if (typeof envelope.truncated !== "boolean") {
    return { valid: false, reason: "truncated deve ser booleano" };
  }

  if (typeof envelope.invocation_id !== "string" || envelope.invocation_id.length === 0) {
    return { valid: false, reason: "invocation_id deve ser string não vazia" };
  }

  if (typeof envelope.agent !== "string" || envelope.agent.length === 0) {
    return { valid: false, reason: "agent deve ser string não vazia" };
  }

  if (typeof envelope.evidence_hash !== "string" || !/^[0-9a-f]{64}$/.test(envelope.evidence_hash)) {
    return { valid: false, reason: "evidence_hash deve ser string hex lowercase de 64 caracteres" };
  }

  if (typeof envelope.runtime_id !== "string" || !/^[0-9a-f]{64}$/.test(envelope.runtime_id)) {
    return { valid: false, reason: "runtime_id deve ser string hex lowercase de 64 caracteres (ADR-003)" };
  }

  if (envelope.contract_version !== "v0.1") {
    return { valid: false, reason: `Versão de contrato não suportada: ${envelope.contract_version}` };
  }

  const parts = evidenceParts(envelope);
  const expectedHash = computeEvidenceHash({ ...parts, duration_ms: envelope.duration_ms });
  if (envelope.evidence_hash !== expectedHash) {
    return { valid: false, reason: `evidence_hash inválido; esperado ${expectedHash}` };
  }

  if (envelope.status === "success" && !envelope.executed) {
    return { valid: false, reason: "status success exige executed=true" };
  }
  if (envelope.status === "auth_required" && envelope.executed) {
    return { valid: false, reason: "status auth_required exige executed=false" };
  }

  return { valid: true };
}

/**
 * Executa código Python real em subprocesso isolado no host Linux/POSIX.
 */
export async function executeRealPython(
  nodeId: string,
  code: string,
  timeoutMs = 5000
): Promise<ExecutionProof> {
  const startedAt = Date.now();
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vortex-sandbox-"));
  const scriptPath = path.join(tempDir, "script.py");
  await fs.writeFile(scriptPath, code, "utf-8");

  // Captura PATH antes do spawn, sem shadowing da variável global `process`
  const inheritedPath = process.env.PATH ?? "/usr/bin:/bin";

  const result = await new Promise<{ stdout: string; stderr: string; exitCode: number | null }>(
    (resolve) => {
      const child = spawn("python3", [scriptPath], {
        timeout: timeoutMs,
        killSignal: "SIGKILL", // Força encerramento real se timeout expirar
        env: { PATH: inheritedPath }, // Nenhuma secret ou token repassado ao subprocesso
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (d) => {
        stdout += d.toString();
      });
      child.stderr.on("data", (d) => {
        stderr += d.toString();
      });

      child.on("close", (code) => resolve({ stdout, stderr, exitCode: code }));
      child.on("error", (err) => resolve({ stdout: "", stderr: err.message, exitCode: null }));
    }
  );

  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

  const durationMs = Date.now() - startedAt;
  const stdoutRaw = result.stderr ? `${result.stdout}\n${result.stderr}` : result.stdout;

  return {
    node_id: nodeId,
    claim: result.exitCode === 0 ? "executed" : "failed",
    runtime: {
      engine: "CPython 3.10 (subprocess real, node:child_process.spawn)",
      arch: os.arch(),
      verifiable_via: "python3 --version",
    },
    proof: {
      stdout_raw: stdoutRaw,
      exit_code: result.exitCode,
      duration_ms: durationMs,
    },
    input_hash: sha256(code),
    output_hash: sha256(stdoutRaw),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Chamada real a provider externo. Sem fallback de template.
 * Se a chave for inexistente, emite estritamente `claim: "not_executed"`.
 */
export async function callRealProvider(
  nodeId: string,
  endpoint: string,
  apiKey: string | undefined,
  body: Record<string, unknown>
): Promise<ExecutionProof> {
  const startedAt = Date.now();
  const bodyStr = JSON.stringify(body);

  if (!apiKey) {
    return {
      node_id: nodeId,
      claim: "not_executed",
      runtime: { engine: "HTTP fetch (External LLM Gateway)", arch: os.arch(), verifiable_via: "n/a" },
      proof: {
        stdout_raw: `⚠️ [CLAIM: NOT_EXECUTED] Nenhuma API Key configurada para o nó '${nodeId}'. Execução abortada sem simulação.`,
        exit_code: null,
        duration_ms: 0,
      },
      input_hash: sha256(bodyStr),
      output_hash: sha256(""),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: bodyStr,
      signal: AbortSignal.timeout(15000),
    });

    const text = await response.text();
    const durationMs = Date.now() - startedAt;

    return {
      node_id: nodeId,
      claim: response.ok ? "executed" : "failed",
      runtime: {
        engine: "HTTP fetch",
        arch: os.arch(),
        verifiable_via: `curl -I ${endpoint}`,
      },
      proof: {
        stdout_raw: text,
        exit_code: response.ok ? 0 : response.status,
        duration_ms: durationMs,
      },
      input_hash: sha256(bodyStr),
      output_hash: sha256(text),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      node_id: nodeId,
      claim: "failed",
      runtime: { engine: "HTTP fetch", arch: os.arch(), verifiable_via: `curl -I ${endpoint}` },
      proof: {
        stdout_raw: `[Network Exception] ${msg}`,
        exit_code: null,
        duration_ms: Date.now() - startedAt,
      },
      input_hash: sha256(bodyStr),
      output_hash: sha256(msg),
      timestamp: new Date().toISOString(),
    };
  }
}
