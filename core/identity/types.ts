/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Core Domain Types & Schemas`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:16:00 UTC`
 * > antes: Tipos dispersos de contrato e agentRunner
 * > depois: Tipos normativos do Universal Connector v1 (Identity, Proposal, Execution, Evidence, Proof, Benchmark)
 * > base: commit `gos3-core-v1.2`
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

export type SupportedProvider =
  | "gpt"
  | "claude"
  | "gemini"
  | "qwen"
  | "grok"
  | "deepseek"
  | "manus"
  | "perplexity"
  | "generic";

export interface VortexAgentIdentity {
  provider: SupportedProvider;
  model: string;
  agent_id?: string;
  handle?: string;
  version?: string;
}

export interface VortexRepositoryState {
  owner: string;
  name: string;
  base_commit: string;
  state_hash?: string;
}

export interface VortexProposal {
  proposal_id: string;
  change_hash: string;
  title?: string;
  description?: string;
  patch?: string;
  files_changed?: string[];
}

export interface VortexExecutionMetrics {
  cpu_user_pct?: number;
  memory_rss_mb?: number;
  io_read_bytes?: number;
  io_write_bytes?: number;
}

export interface VortexExecution {
  command: string;
  exit_code: number;
  duration_ms: number;
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped?: number;
  };
  metrics?: VortexExecutionMetrics;
}

export interface VortexArtifact {
  path: string;
  hash: string;
  bytes?: number;
}

export interface VortexEvidence {
  stdout_hash: string;
  stderr_hash: string;
  artifacts?: VortexArtifact[];
  environment_fingerprint?: string;
  raw_stdout?: string;
  raw_stderr?: string;
}

export interface VortexPolicy {
  version: string;
  rules_enforced?: string[];
}

export interface VortexProof {
  algorithm: "sha256";
  hash: string;
  canonical_serialization?: string;
}

export interface VortexExecutionProofRecord {
  protocol: "vortex-agent/v1";
  execution_id: string;
  agent: VortexAgentIdentity;
  repository: VortexRepositoryState;
  proposal: VortexProposal;
  execution: VortexExecution;
  evidence: VortexEvidence;
  policy: VortexPolicy;
  proof: VortexProof;
}

export type ValidationStatus =
  | "VALID"
  | "INVALID_REPOSITORY_STATE"
  | "INVALID_POLICY"
  | "INVALID_PROOF"
  | "INVALID_EVIDENCE"
  | "INVALID_CHANGE"
  | "INVALID_PROTOCOL";

export interface VortexValidationRecord {
  repository_state_hash: string;
  execution_proof_hash: string;
  change_hash: string;
  policy_version: string;
  protocol_version: string;
  validation_result: ValidationStatus;
  details?: string;
  timestamp: string;
}

export interface VortexBenchmarkRecord {
  agent: VortexAgentIdentity;
  correctness: {
    tests_passed: number;
    tests_failed: number;
    validation_result: "PASS" | "FAIL";
    regression_delta: number;
  };
  performance: {
    execution_time_ms: number;
    cpu_user_pct?: number;
    memory_rss_mb?: number;
    io_read_bytes?: number;
    io_write_bytes?: number;
  };
  change: {
    files_changed: number;
    loc_added?: number;
    loc_removed?: number;
    change_hash: string;
  };
  reproducibility: {
    repository_state_hash: string;
    execution_proof_hash: string;
    environment_fingerprint?: string;
  };
  governance: {
    policy_compliance: boolean;
    header_compliance: boolean;
    security_checks: "PASS" | "FAIL";
    approval_status: "APPROVED" | "REJECTED" | "PENDING_REVIEW";
  };
  validation: ValidationStatus;
}
