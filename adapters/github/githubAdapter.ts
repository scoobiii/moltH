/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GitHub Universal PR Gate Adapter`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:30:00 UTC`
 * > antes: GitHubSyncService apenas empurrava arquivos para branch sem verificação formal de Execution Proof
 * > depois: GitHubAdapter fino: só autoriza PR / commit se VortexValidator retornar VALID
 * > base: commit `gos3-core-v1.2`, ADR-004
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { VortexExecutionProofRecord, VortexValidationRecord } from "../../core/identity/types";
import { VortexValidator } from "../../core/validation/vortexValidator";

export interface GitHubGateResult {
  allowed: boolean;
  reason: string;
  validation: VortexValidationRecord;
  pr_readiness: {
    can_open_pr: boolean;
    commit_approved: boolean;
    evidence_attached: boolean;
  };
}

export class GitHubUniversalAdapter {
  /**
   * Avalia se a proposta de um agente atende ao gate de validação para abertura de PR no GitHub
   */
  public static evaluatePRGate(record: VortexExecutionProofRecord): GitHubGateResult {
    const validation = VortexValidator.validate(record);
    const isValid = validation.validation_result === "VALID";
    const testsPassed = record.execution.exit_code === 0 && record.execution.tests.failed === 0;

    const allowed = isValid && testsPassed;

    let reason = "Execution Proof verificado com sucesso. Autorizado para PR.";
    if (!isValid) {
      reason = `Gate rejeitado: ${validation.validation_result} - ${validation.details}`;
    } else if (!testsPassed) {
      reason = `Gate rejeitado: testes com falha (exit_code=${record.execution.exit_code}, failed=${record.execution.tests.failed})`;
    }

    return {
      allowed,
      reason,
      validation,
      pr_readiness: {
        can_open_pr: allowed,
        commit_approved: allowed,
        evidence_attached: isValid,
      },
    };
  }
}
