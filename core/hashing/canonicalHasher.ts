/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Canonical Hashing & Evidence Vault`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:15:00 UTC`
 * > antes: Apenas hash plano de stdout+stderr+exit_code+duration_ms
 * > depois: Algoritmo canônico determinístico RFC-8785 JSON Canonicalization Scheme (JCS) com derivação de 3 hashes
 * > base: commit `gos3-core-v1.2`, ADR-002, ADR-003
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { createHash } from "node:crypto";

export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Deterministic JSON Canonicalization (RFC 8785 compatible subset).
 * Keys are recursively sorted, numbers are serialized deterministically,
 * undefined fields and functions are discarded.
 */
export function canonicalizeJson(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const serializedItems = value.map((item) => canonicalizeJson(item));
    return `[${serializedItems.join(",")}]`;
  }

  const sortedKeys = Object.keys(value)
    .filter((k) => value[k] !== undefined && typeof value[k] !== "function")
    .sort();

  const pairs = sortedKeys.map((k) => {
    return `${JSON.stringify(k)}:${canonicalizeJson(value[k])}`;
  });

  return `{${pairs.join(",")}}`;
}

/**
 * 1. repository_state_hash: commit/ref + base commit + working tree state
 */
export function computeRepositoryStateHash(params: {
  owner: string;
  name: string;
  base_commit: string;
  extraState?: Record<string, any>;
}): string {
  const payload = {
    owner: params.owner.trim().toLowerCase(),
    name: params.name.trim().toLowerCase(),
    base_commit: params.base_commit.trim(),
    extra: params.extraState || {},
  };
  return sha256Hex(canonicalizeJson(payload));
}

/**
 * 2. change_hash: patch / diff / alteração proposta normalizada
 */
export function computeChangeHash(patchOrFiles: {
  patch?: string;
  files_changed?: string[];
  proposal_id?: string;
}): string {
  const normalizedPatch = (patchOrFiles.patch ?? "").replace(/\r\n/g, "\n").trim();
  const sortedFiles = [...(patchOrFiles.files_changed ?? [])].sort();
  const payload = {
    patch: normalizedPatch,
    files_changed: sortedFiles,
    proposal_id: patchOrFiles.proposal_id ?? "",
  };
  return sha256Hex(canonicalizeJson(payload));
}

/**
 * 3. execution_proof_hash: execução + métricas + evidências
 * Derivado do envelope canônico e verificável
 */
export function computeExecutionProofHash(record: {
  protocol: string;
  execution_id: string;
  agent: { provider: string; model: string };
  repository: { owner: string; name: string; base_commit: string };
  proposal: { proposal_id: string; change_hash: string };
  execution: { command: string; exit_code: number; duration_ms: number; tests: { total: number; passed: number; failed: number } };
  evidence: { stdout_hash: string; stderr_hash: string };
  policy: { version: string };
}): string {
  const envelopeToSign = {
    protocol: record.protocol,
    execution_id: record.execution_id,
    agent: {
      provider: record.agent.provider,
      model: record.agent.model,
    },
    repository: {
      owner: record.repository.owner,
      name: record.repository.name,
      base_commit: record.repository.base_commit,
    },
    proposal: {
      proposal_id: record.proposal.proposal_id,
      change_hash: record.proposal.change_hash,
    },
    execution: {
      command: record.execution.command,
      exit_code: record.execution.exit_code,
      duration_ms: record.execution.duration_ms,
      tests: {
        total: record.execution.tests.total,
        passed: record.execution.tests.passed,
        failed: record.execution.tests.failed,
      },
    },
    evidence: {
      stdout_hash: record.evidence.stdout_hash,
      stderr_hash: record.evidence.stderr_hash,
    },
    policy: {
      version: record.policy.version,
    },
  };

  const canonicalString = canonicalizeJson(envelopeToSign);
  return sha256Hex(canonicalString);
}
