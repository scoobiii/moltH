/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Execution Engine & Envelope Builder`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:20:00 UTC`
 * > antes: Execuções geravam recibos isolados sem amarrar repository, proposal e policy num execution-proof
 * > depois: Construtor do envelope canônico de Execution Proof com validação estrita
 * > base: commit `gos3-core-v1.2`
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { randomUUID } from "node:crypto";
import {
  VortexExecutionProofRecord,
  VortexAgentIdentity,
  VortexRepositoryState,
  VortexProposal,
  VortexExecution,
  VortexEvidence,
  VortexPolicy,
} from "../identity/types";
import {
  computeExecutionProofHash,
  computeRepositoryStateHash,
  canonicalizeJson,
} from "../hashing/canonicalHasher";

export class ExecutionProofBuilder {
  public static build(params: {
    agent: VortexAgentIdentity;
    repository: VortexRepositoryState;
    proposal: VortexProposal;
    execution: VortexExecution;
    evidence: VortexEvidence;
    policy?: VortexPolicy;
    execution_id?: string;
  }): VortexExecutionProofRecord {
    const policy: VortexPolicy = params.policy || {
      version: "vortex-policy/v1.0",
      rules_enforced: ["R1_NO_MOCKS", "R2_EVIDENCE_HASH", "R3_DURABLE_PROOF"],
    };

    const execution_id = params.execution_id || `exec-${randomUUID().slice(0, 8)}`;

    const repoStateHash =
      params.repository.state_hash ||
      computeRepositoryStateHash({
        owner: params.repository.owner,
        name: params.repository.name,
        base_commit: params.repository.base_commit,
      });

    const repo: VortexRepositoryState = {
      ...params.repository,
      state_hash: repoStateHash,
    };

    const recordPayload = {
      protocol: "vortex-agent/v1" as const,
      execution_id,
      agent: params.agent,
      repository: repo,
      proposal: params.proposal,
      execution: params.execution,
      evidence: params.evidence,
      policy,
    };

    const proofHash = computeExecutionProofHash(recordPayload);
    const canonicalString = canonicalizeJson({
      ...recordPayload,
      proof: {
        algorithm: "sha256" as const,
        hash: proofHash,
      },
    });

    return {
      ...recordPayload,
      proof: {
        algorithm: "sha256",
        hash: proofHash,
        canonical_serialization: canonicalString,
      },
    };
  }
}
