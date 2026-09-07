/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Generic Universal Adapter`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:24:00 UTC`
 * > antes: Sem adapter genérico independente de provedor
 * > depois: GenericAdapter puro: mapeia qualquer tarefa e runner para o protocolo universal sem acoplamento
 * > base: commit `gos3-core-v1.2`
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import {
  VortexExecutionProofRecord,
  VortexAgentIdentity,
  VortexRepositoryState,
  VortexProposal,
  VortexExecution,
  VortexEvidence,
  VortexPolicy,
} from "../../core/identity/types";
import { ExecutionProofBuilder } from "../../core/execution/executionProofBuilder";
import { EvidenceCollector } from "../../core/evidence/evidenceCollector";
import { computeChangeHash } from "../../core/hashing/canonicalHasher";

export interface UniversalTaskParams {
  command: string;
  patch?: string;
  files_changed?: string[];
  proposal_id?: string;
  title?: string;
  description?: string;
  timeout_ms?: number;
}

export interface UniversalExecutionOutput {
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped?: number;
  };
  metrics?: {
    cpu_user_pct?: number;
    memory_rss_mb?: number;
  };
  artifacts?: { path: string; content: string | Buffer }[];
}

export class GenericAdapter {
  protected agentIdentity: VortexAgentIdentity;
  protected repositoryState: VortexRepositoryState;

  constructor(agent: VortexAgentIdentity, repo: VortexRepositoryState) {
    this.agentIdentity = agent;
    this.repositoryState = repo;
  }

  /**
   * Adapta uma execução genérica arbitrária para o Vortex Execution Proof canônico
   */
  public createProof(
    task: UniversalTaskParams,
    execOutput: UniversalExecutionOutput,
    policy?: VortexPolicy
  ): VortexExecutionProofRecord {
    const change_hash = computeChangeHash({
      patch: task.patch,
      files_changed: task.files_changed,
      proposal_id: task.proposal_id,
    });

    const proposal: VortexProposal = {
      proposal_id: task.proposal_id || `P-${Date.now()}`,
      change_hash,
      title: task.title,
      description: task.description,
      patch: task.patch,
      files_changed: task.files_changed,
    };

    const evidence: VortexEvidence = EvidenceCollector.collect({
      stdout: execOutput.stdout,
      stderr: execOutput.stderr,
      artifacts: execOutput.artifacts,
    });

    const execution: VortexExecution = {
      command: task.command,
      exit_code: execOutput.exit_code,
      duration_ms: execOutput.duration_ms,
      tests: execOutput.tests,
      metrics: execOutput.metrics,
    };

    return ExecutionProofBuilder.build({
      agent: this.agentIdentity,
      repository: this.repositoryState,
      proposal,
      execution,
      evidence,
      policy,
    });
  }
}
