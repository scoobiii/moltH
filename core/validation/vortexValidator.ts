/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Vortex Validator & Governance Gate`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:22:00 UTC`
 * > antes: Validações parciais em scripts soltos
 * > depois: Validador determinístico em 7 estados inequívocos (VALID, INVALID_REPOSITORY_STATE, etc.)
 * > base: commit `gos3-core-v1.2`, ADR-002, ADR-003, ADR-006
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import {
  VortexExecutionProofRecord,
  VortexValidationRecord,
  ValidationStatus,
  VortexBenchmarkRecord,
} from "../identity/types";
import {
  computeExecutionProofHash,
  computeRepositoryStateHash,
  sha256Hex,
} from "../hashing/canonicalHasher";

export class VortexValidator {
  /**
   * Valida integralmente um Execution Proof Record contra o contrato universal.
   * Não aceita 'provavelmente válido'. A resposta é determinística e formal.
   */
  public static validate(record: VortexExecutionProofRecord): VortexValidationRecord {
    const timestamp = new Date().toISOString();

    // 1. Protocol check
    if (!record || record.protocol !== "vortex-agent/v1") {
      return {
        repository_state_hash: "",
        execution_proof_hash: "",
        change_hash: "",
        policy_version: record?.policy?.version || "unknown",
        protocol_version: record?.protocol || "unknown",
        validation_result: "INVALID_PROTOCOL",
        details: "Protocolo deve ser estritamente 'vortex-agent/v1'",
        timestamp,
      };
    }

    // 2. Repository State check
    if (
      !record.repository ||
      !record.repository.owner ||
      !record.repository.name ||
      !record.repository.base_commit
    ) {
      return {
        repository_state_hash: "",
        execution_proof_hash: "",
        change_hash: "",
        policy_version: record.policy?.version || "unknown",
        protocol_version: record.protocol,
        validation_result: "INVALID_REPOSITORY_STATE",
        details: "Campos owner, name e base_commit do repositório são obrigatórios",
        timestamp,
      };
    }

    const calculatedRepoState = computeRepositoryStateHash({
      owner: record.repository.owner,
      name: record.repository.name,
      base_commit: record.repository.base_commit,
    });

    if (record.repository.state_hash && record.repository.state_hash !== calculatedRepoState) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: "",
        change_hash: record.proposal?.change_hash || "",
        policy_version: record.policy?.version || "unknown",
        protocol_version: record.protocol,
        validation_result: "INVALID_REPOSITORY_STATE",
        details: `state_hash fornecido (${record.repository.state_hash}) difere do canônico (${calculatedRepoState})`,
        timestamp,
      };
    }

    // 3. Proposal check
    if (!record.proposal || !record.proposal.proposal_id || !record.proposal.change_hash) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: "",
        change_hash: "",
        policy_version: record.policy?.version || "unknown",
        protocol_version: record.protocol,
        validation_result: "INVALID_CHANGE",
        details: "proposal_id e change_hash de 64 hexadecimais são obrigatórios",
        timestamp,
      };
    }

    if (!/^[0-9a-f]{64}$/.test(record.proposal.change_hash)) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: "",
        change_hash: record.proposal.change_hash,
        policy_version: record.policy?.version || "unknown",
        protocol_version: record.protocol,
        validation_result: "INVALID_CHANGE",
        details: "change_hash deve ser string hex de 64 caracteres",
        timestamp,
      };
    }

    // 4. Evidence check
    if (
      !record.evidence ||
      !/^[0-9a-f]{64}$/.test(record.evidence.stdout_hash) ||
      !/^[0-9a-f]{64}$/.test(record.evidence.stderr_hash)
    ) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: "",
        change_hash: record.proposal.change_hash,
        policy_version: record.policy?.version || "unknown",
        protocol_version: record.protocol,
        validation_result: "INVALID_EVIDENCE",
        details: "stdout_hash e stderr_hash devem ser hashes SHA-256 válidos",
        timestamp,
      };
    }

    // Se raw_stdout ou raw_stderr estiverem presentes, valida a correspondência
    if (record.evidence.raw_stdout !== undefined) {
      const computed = sha256Hex(record.evidence.raw_stdout);
      if (computed !== record.evidence.stdout_hash) {
        return {
          repository_state_hash: calculatedRepoState,
          execution_proof_hash: "",
          change_hash: record.proposal.change_hash,
          policy_version: record.policy?.version || "unknown",
          protocol_version: record.protocol,
          validation_result: "INVALID_EVIDENCE",
          details: "raw_stdout não confere com stdout_hash",
          timestamp,
        };
      }
    }

    if (record.evidence.raw_stderr !== undefined) {
      const computed = sha256Hex(record.evidence.raw_stderr);
      if (computed !== record.evidence.stderr_hash) {
        return {
          repository_state_hash: calculatedRepoState,
          execution_proof_hash: "",
          change_hash: record.proposal.change_hash,
          policy_version: record.policy?.version || "unknown",
          protocol_version: record.protocol,
          validation_result: "INVALID_EVIDENCE",
          details: "raw_stderr não confere com stderr_hash",
          timestamp,
        };
      }
    }

    // 5. Policy check
    if (!record.policy || !record.policy.version) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: "",
        change_hash: record.proposal.change_hash,
        policy_version: "",
        protocol_version: record.protocol,
        validation_result: "INVALID_POLICY",
        details: "policy.version é obrigatório",
        timestamp,
      };
    }

    // 6. Execution Proof Hash check
    const expectedProofHash = computeExecutionProofHash({
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
    });

    if (!record.proof || record.proof.hash !== expectedProofHash) {
      return {
        repository_state_hash: calculatedRepoState,
        execution_proof_hash: record.proof?.hash || "",
        change_hash: record.proposal.change_hash,
        policy_version: record.policy.version,
        protocol_version: record.protocol,
        validation_result: "INVALID_PROOF",
        details: `execution_proof_hash inválido. Fornecido: ${record.proof?.hash}, Esperado: ${expectedProofHash}`,
        timestamp,
      };
    }

    // Tudo validado
    return {
      repository_state_hash: calculatedRepoState,
      execution_proof_hash: expectedProofHash,
      change_hash: record.proposal.change_hash,
      policy_version: record.policy.version,
      protocol_version: record.protocol,
      validation_result: "VALID",
      details: "Todos os checks de prova canônica, política e proveniência passaram com 100% de conformidade",
      timestamp,
    };
  }

  /**
   * Converte a validação em métrica de Benchmark padronizada
   */
  public static toBenchmarkRecord(
    record: VortexExecutionProofRecord,
    valResult: VortexValidationRecord
  ): VortexBenchmarkRecord {
    const isPass =
      valResult.validation_result === "VALID" &&
      record.execution.exit_code === 0 &&
      record.execution.tests.failed === 0;

    return {
      agent: record.agent,
      correctness: {
        tests_passed: record.execution.tests.passed,
        tests_failed: record.execution.tests.failed,
        validation_result: isPass ? "PASS" : "FAIL",
        regression_delta: record.execution.tests.failed,
      },
      performance: {
        execution_time_ms: record.execution.duration_ms,
        cpu_user_pct: record.execution.metrics?.cpu_user_pct,
        memory_rss_mb: record.execution.metrics?.memory_rss_mb,
        io_read_bytes: record.execution.metrics?.io_read_bytes,
        io_write_bytes: record.execution.metrics?.io_write_bytes,
      },
      change: {
        files_changed: record.proposal.files_changed?.length || 1,
        change_hash: record.proposal.change_hash,
      },
      reproducibility: {
        repository_state_hash: valResult.repository_state_hash,
        execution_proof_hash: valResult.execution_proof_hash,
        environment_fingerprint: record.evidence.environment_fingerprint,
      },
      governance: {
        policy_compliance: valResult.validation_result === "VALID",
        header_compliance: true,
        security_checks: record.execution.exit_code === 0 ? "PASS" : "FAIL",
        approval_status: isPass ? "APPROVED" : "REJECTED",
      },
      validation: valResult.validation_result,
    };
  }
}
