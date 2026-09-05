import { describe, it, expect, beforeEach } from "vitest";
import {
  EvidenceStore,
  LocalScratchBackend,
  VerifiedDurableBackend,
  DurableEvidenceRecord,
  PersistenceReceipt,
  computeReceiptDigest,
} from "../../src/server/security/durableEvidenceStore";
import { GitHubSyncService } from "../../src/server/githubSyncService";

/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Acceptance Suite for Issue #4`
 * > fase: `GOS3 Issue #4 Acceptance & Anti-Fabrication Falsification Testing` · data: `2026-09-05`
 * > validações:
 * > 1. Publicação sem receipt durável => Bloqueada (Fail-Closed)
 * > 2. Receipt durável válido => Publicação permitida
 * > 3. Falha de persistência no backend durável => Publicação bloqueada
 * > 4. Preservação de evidence_hash ponta a ponta
 * > 5. Filesystem local / Scratch categoricamente rejeitado como durável
 * > 6. Resposta de escrita no GitHub NUNCA tratada como assinatura ou prova de execução
 * > 7. Concorrência de publicação tratada sem falso sucesso
 * > 8. Adulteração (tampering) detectada imediatamente
 */

describe("GOS3 Issue #4: Runtime Storage Invariant & Publication Gate", () => {
  let store: EvidenceStore;
  let durableBackend: VerifiedDurableBackend;
  let scratchBackend: LocalScratchBackend;

  const sampleRecord: DurableEvidenceRecord = {
    id: "rec-test-001",
    agent_id: "CommercialAgent-mex",
    runtime_id: "427273fd-real-node-linux-vortex",
    invocation_id: "inv-20260905-test",
    evidence_hash: "35eb15a4b69f66ccc8ca05542d4379768b28af618b4e0e32fc41a53d778538b2",
    stdout: "Contrato MEx Energia validado com 20% desconto",
    duration_ms: 45,
    created_at: Date.now(),
  };

  beforeEach(() => {
    store = EvidenceStore.getInstance();
    durableBackend = new VerifiedDurableBackend("firestore_durable");
    scratchBackend = new LocalScratchBackend();
    store.setBackend(null); // Default state: unconfigured / fail-closed
  });

  it("1. Publicação sem receipt durável => bloqueada (Fail-Closed por default)", async () => {
    const gateWithoutReceipt = await store.evaluatePublicationGate(null);
    expect(gateWithoutReceipt.allowed).toBe(false);
    expect(gateWithoutReceipt.reason).toContain("fail-closed");

    const gateUndefined = await store.evaluatePublicationGate(undefined);
    expect(gateUndefined.allowed).toBe(false);
    expect(gateUndefined.reason).toContain("fail-closed");
  });

  it("2. Filesystem local / Scratch NÃO é aceito como backend durável e publicação é bloqueada", async () => {
    store.setBackend(scratchBackend);
    const scratchReceipt = await store.persistEvidence(sampleRecord);

    expect(scratchReceipt.durable).toBe(false);
    expect(scratchReceipt.backend).toBe("local_scratch");

    const gateResult = await store.evaluatePublicationGate(scratchReceipt);
    expect(gateResult.allowed).toBe(false);
    expect(gateResult.reason).toContain("scratch space or non-durable");
  });

  it("3. Receipt durável válido no backend durável => publicação permitida", async () => {
    store.setBackend(durableBackend);
    const validReceipt = await store.persistEvidence(sampleRecord);

    expect(validReceipt.durable).toBe(true);
    expect(validReceipt.persistence_status).toBe("persisted");
    expect(validReceipt.verification_status).toBe("verified");

    const gateResult = await store.evaluatePublicationGate(validReceipt);
    expect(gateResult.allowed).toBe(true);
    expect(gateResult.reason).toContain("Valid durable persistence receipt verified");
  });

  it("4. Falha de persistência no backend durável => publicação bloqueada", async () => {
    durableBackend.setSimulateFailure(true);
    store.setBackend(durableBackend);

    const failedReceipt = await store.persistEvidence(sampleRecord);
    expect(failedReceipt.persistence_status).toBe("failed");

    const gateResult = await store.evaluatePublicationGate(failedReceipt);
    expect(gateResult.allowed).toBe(false);
    expect(gateResult.reason).toContain("expected 'persisted'");
  });

  it("5. Preservação de evidence_hash ponta a ponta e detecção de adulteração", async () => {
    store.setBackend(durableBackend);
    const originalReceipt = await store.persistEvidence(sampleRecord);

    // Verificação normal OK
    const checkOk = await store.verifyReceipt(originalReceipt);
    expect(checkOk.valid).toBe(true);
    expect(checkOk.tampered).toBe(false);

    // Tentativa de adulterar o evidence_hash
    const tamperedReceipt: PersistenceReceipt = {
      ...originalReceipt,
      evidence_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    };

    const gateResult = await store.evaluatePublicationGate(tamperedReceipt);
    expect(gateResult.allowed).toBe(false);
    expect(gateResult.reason).toContain("tampered with");
  });

  it("6. Resposta de GitHub Write NUNCA é tratada como prova de execução ou assinatura", async () => {
    const attestation = EvidenceStore.createGitHubWriteAttestation({
      repo: "scoobiii/moltH",
      branch: "main",
      commit_sha: "fa9e78b9812903189230192301923",
    });

    expect(attestation.is_execution_proof).toBe(false);
    expect(attestation.is_cryptographic_signature).toBe(false);
    expect(attestation.note).toContain("strictly not cryptographic proof");
  });

  it("7. Concorrência / conflito de publicação não gera sucesso falso", async () => {
    store.setBackend(durableBackend);
    const receipt = await store.persistEvidence(sampleRecord);

    const lockKey = "publication-lock-task-1";
    const lock1 = store.acquirePublicationLock(lockKey);
    expect(lock1).toBe(true);

    // Segunda tentativa simultânea para a mesma chave deve ser bloqueada
    const gateResult = await store.evaluatePublicationGate(receipt, lockKey);
    expect(gateResult.allowed).toBe(false);
    expect(gateResult.reason).toContain("Concurrent publication conflict detected");

    // Libera lock e tenta novamente
    store.releasePublicationLock(lockKey);
    const gateResultAfterUnlock = await store.evaluatePublicationGate(receipt, lockKey);
    expect(gateResultAfterUnlock.allowed).toBe(true);
  });

  it("8. Integração GitHubSyncService bloqueia publicação sem durable receipt (Fail-Closed)", async () => {
    // Tentativa de sync com requireDurableReceipt=true e sem receipt válido
    const syncRes = await GitHubSyncService.syncToRepository({
      repo: "scoobiii/moltH",
      requireDurableReceipt: true,
      persistenceReceipt: undefined,
      token: "fake-token",
    });

    expect(syncRes.success).toBe(false);
    expect(syncRes.gateBlocked).toBe(true);
    expect(syncRes.is_execution_proof).toBe(false);
    expect(syncRes.is_cryptographic_signature).toBe(false);
  });
});
