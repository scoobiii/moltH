import crypto from "node:crypto";

/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GOS3 Runtime Storage Invariant & Durable Evidence Gate`
 * > fase: `Issue #4 — Runtime Storage Invariant & Anti-Fabrication Publication Gate` · data: `2026-09-05`
 * > antes: Filesystem local (scratch) corria risco de ser tratado como fonte autoritativa de evidência ou prova de publicação
 * > depois: Invariante estrita: local scratch != durable. Publicação exige PersistenceReceipt verificado em backend durável (Fail-Closed).
 * > base: GitHub Issue #4 (scoobiii/moltH), ADR-002, ADR-003, GOS3 Anti-Fabricação v1.0
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

export interface DurableEvidenceRecord {
  id: string;
  agent_id: string;
  runtime_id: string;
  invocation_id: string;
  evidence_hash: string;
  task_payload?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number | null;
  duration_ms: number;
  metadata?: Record<string, any>;
  created_at: number;
}

export type PersistenceStatus = "persisted" | "failed" | "unconfigured" | "pending";
export type VerificationStatus = "verified" | "unverified" | "tampered" | "failed";

export interface PersistenceReceipt {
  receipt_id: string;
  backend: string;
  reference: string;
  evidence_hash: string;
  persistence_status: PersistenceStatus;
  verification_status: VerificationStatus;
  durable: boolean;
  persisted_at: number;
  digest: string;
  error?: string;
}

export interface VerificationResult {
  valid: boolean;
  tampered: boolean;
  durable: boolean;
  reason?: string;
  receipt: PersistenceReceipt;
  storedRecord?: DurableEvidenceRecord;
}

export interface PublicationGateResult {
  allowed: boolean;
  reason: string;
  receipt?: PersistenceReceipt;
}

export interface GitHubWriteAttestation {
  repo: string;
  branch: string;
  commit_sha: string;
  is_execution_proof: false;
  is_cryptographic_signature: false;
  recorded_at: string;
  note: string;
}

const sha256 = (str: string): string =>
  crypto.createHash("sha256").update(str, "utf-8").digest("hex");

/**
 * Calcula digest imutável do receipt para impedir adulteração de estado.
 */
export function computeReceiptDigest(params: {
  receipt_id: string;
  backend: string;
  reference: string;
  evidence_hash: string;
  persistence_status: PersistenceStatus;
  durable: boolean;
  persisted_at: number;
}): string {
  const payload = `${params.receipt_id}:${params.backend}:${params.reference}:${params.evidence_hash}:${params.persistence_status}:${params.durable}:${params.persisted_at}`;
  return sha256(payload);
}

/**
 * Interface para backends de persistência durável (ex: Firestore, GCS, Cloud Storage).
 * Scratch local ou in-memory MUST declarar `isDurable = false`.
 */
export interface IDurableBackend {
  readonly backendId: string;
  readonly isDurable: boolean;
  persist(record: DurableEvidenceRecord): Promise<PersistenceReceipt>;
  verify(receipt: PersistenceReceipt): Promise<VerificationResult>;
  get(reference: string): Promise<DurableEvidenceRecord | null>;
}

/**
 * Backend para filesystem local / scratch space.
 * INVARIANTE GOS3: Declarado explicitamente como NÃO-DURÁVEL (`isDurable = false`).
 */
export class LocalScratchBackend implements IDurableBackend {
  public readonly backendId = "local_scratch";
  public readonly isDurable = false;
  private inMemoryScratch: Map<string, DurableEvidenceRecord> = new Map();

  public async persist(record: DurableEvidenceRecord): Promise<PersistenceReceipt> {
    const receipt_id = `rcpt-scratch-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const reference = `scratch://${record.id}`;
    const persisted_at = Date.now();
    this.inMemoryScratch.set(reference, record);

    // Scratch local é temporário: NUNCA durável
    const receipt: PersistenceReceipt = {
      receipt_id,
      backend: this.backendId,
      reference,
      evidence_hash: record.evidence_hash,
      persistence_status: "persisted",
      verification_status: "unverified",
      durable: false, // Invariante: local scratch nunca confere durabilidade
      persisted_at,
      digest: "",
      error: "Local filesystem is scratch space only and not accepted as durable backend",
    };

    receipt.digest = computeReceiptDigest(receipt);
    return receipt;
  }

  public async verify(receipt: PersistenceReceipt): Promise<VerificationResult> {
    return {
      valid: false,
      tampered: false,
      durable: false,
      reason: "Local scratch backend cannot satisfy durable persistence requirement",
      receipt,
    };
  }

  public async get(reference: string): Promise<DurableEvidenceRecord | null> {
    return this.inMemoryScratch.get(reference) || null;
  }
}

/**
 * Backend durável verificado (ex: Firestore / GCP Datastore / S3).
 */
export class VerifiedDurableBackend implements IDurableBackend {
  public readonly backendId: string;
  public readonly isDurable = true;
  private records: Map<string, DurableEvidenceRecord> = new Map();
  private simulateFailure = false;

  constructor(backendId = "firestore_durable") {
    this.backendId = backendId;
  }

  public setSimulateFailure(fail: boolean) {
    this.simulateFailure = fail;
  }

  public async persist(record: DurableEvidenceRecord): Promise<PersistenceReceipt> {
    const receipt_id = `rcpt-${this.backendId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const reference = `${this.backendId}://evidence_records/${record.id}`;
    const persisted_at = Date.now();

    if (this.simulateFailure) {
      const failedReceipt: PersistenceReceipt = {
        receipt_id,
        backend: this.backendId,
        reference,
        evidence_hash: record.evidence_hash,
        persistence_status: "failed",
        verification_status: "failed",
        durable: true,
        persisted_at,
        digest: "",
        error: `Durable backend '${this.backendId}' persistence write failed (I/O or network unreachable)`,
      };
      failedReceipt.digest = computeReceiptDigest(failedReceipt);
      return failedReceipt;
    }

    // Gravação segura no backend durável
    this.records.set(reference, { ...record });

    const receipt: PersistenceReceipt = {
      receipt_id,
      backend: this.backendId,
      reference,
      evidence_hash: record.evidence_hash,
      persistence_status: "persisted",
      verification_status: "verified",
      durable: true,
      persisted_at,
      digest: "",
    };

    receipt.digest = computeReceiptDigest(receipt);
    return receipt;
  }

  public async verify(receipt: PersistenceReceipt): Promise<VerificationResult> {
    // 1. Integridade do próprio receipt (detecção de adulteração)
    const expectedDigest = computeReceiptDigest(receipt);
    if (receipt.digest !== expectedDigest) {
      return {
        valid: false,
        tampered: true,
        durable: receipt.durable,
        reason: "Receipt digest mismatch: receipt has been tampered with",
        receipt: { ...receipt, verification_status: "tampered" },
      };
    }

    if (receipt.persistence_status !== "persisted") {
      return {
        valid: false,
        tampered: false,
        durable: receipt.durable,
        reason: `Persistence status is '${receipt.persistence_status}', expected 'persisted'`,
        receipt: { ...receipt, verification_status: "failed" },
      };
    }

    // 2. Verificação no backend durável
    const stored = this.records.get(receipt.reference);
    if (!stored) {
      return {
        valid: false,
        tampered: false,
        durable: receipt.durable,
        reason: `Evidence record '${receipt.reference}' not found in durable store`,
        receipt: { ...receipt, verification_status: "failed" },
      };
    }

    // 3. Verificação do hash de evidência ponta a ponta
    if (stored.evidence_hash !== receipt.evidence_hash) {
      return {
        valid: false,
        tampered: true,
        durable: receipt.durable,
        reason: `Evidence hash mismatch: stored '${stored.evidence_hash}', receipt claimed '${receipt.evidence_hash}'`,
        receipt: { ...receipt, verification_status: "tampered" },
        storedRecord: stored,
      };
    }

    return {
      valid: true,
      tampered: false,
      durable: receipt.durable,
      receipt: { ...receipt, verification_status: "verified" },
      storedRecord: stored,
    };
  }

  public async get(reference: string): Promise<DurableEvidenceRecord | null> {
    return this.records.get(reference) || null;
  }
}

/**
 * Gerenciador central do EvidenceStore.
 * Regra: Indisponível / não configurado por padrão até que um backend durável seja explicitamente registrado.
 */
export class EvidenceStore {
  private static instance: EvidenceStore;
  private currentBackend: IDurableBackend | null = null;
  private activePublications = new Set<string>(); // Proteção contra concorrência/race conditions

  private constructor() {
    // Inicializa sem backend durável (Fail-Closed por default)
    this.currentBackend = null;
  }

  public static getInstance(): EvidenceStore {
    if (!EvidenceStore.instance) {
      EvidenceStore.instance = new EvidenceStore();
    }
    return EvidenceStore.instance;
  }

  public setBackend(backend: IDurableBackend | null) {
    this.currentBackend = backend;
  }

  public getBackend(): IDurableBackend | null {
    return this.currentBackend;
  }

  public isDurableConfigured(): boolean {
    return this.currentBackend !== null && this.currentBackend.isDurable === true;
  }

  /**
   * Persiste uma evidência no backend configurado.
   * Se não houver backend durável configurado, retorna status 'unconfigured' com durable=false.
   */
  public async persistEvidence(record: DurableEvidenceRecord): Promise<PersistenceReceipt> {
    if (!this.currentBackend) {
      const receipt_id = `rcpt-unconf-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      const receipt: PersistenceReceipt = {
        receipt_id,
        backend: "none",
        reference: `none://${record.id}`,
        evidence_hash: record.evidence_hash,
        persistence_status: "unconfigured",
        verification_status: "unverified",
        durable: false,
        persisted_at: Date.now(),
        digest: "",
        error: "No durable evidence store configured. Fail-closed invariant active.",
      };
      receipt.digest = computeReceiptDigest(receipt);
      return receipt;
    }

    return this.currentBackend.persist(record);
  }

  /**
   * Verifica a validade e integridade de um receipt contra o backend configurado.
   */
  public async verifyReceipt(receipt: PersistenceReceipt): Promise<VerificationResult> {
    if (!receipt || typeof receipt !== "object") {
      return {
        valid: false,
        tampered: false,
        durable: false,
        reason: "Receipt is null or invalid",
        receipt: receipt as any,
      };
    }

    // Digest check
    const expectedDigest = computeReceiptDigest(receipt);
    if (receipt.digest !== expectedDigest) {
      return {
        valid: false,
        tampered: true,
        durable: receipt.durable,
        reason: "Receipt digest mismatch: receipt payload has been tampered with",
        receipt: { ...receipt, verification_status: "tampered" },
      };
    }

    if (!this.currentBackend) {
      return {
        valid: false,
        tampered: false,
        durable: false,
        reason: "Cannot verify receipt: no durable backend configured",
        receipt: { ...receipt, verification_status: "failed" },
      };
    }

    if (this.currentBackend.backendId !== receipt.backend) {
      return {
        valid: false,
        tampered: false,
        durable: false,
        reason: `Backend mismatch: current backend is '${this.currentBackend.backendId}', receipt was issued by '${receipt.backend}'`,
        receipt: { ...receipt, verification_status: "failed" },
      };
    }

    return this.currentBackend.verify(receipt);
  }

  /**
   * 🛡️ PUBLICATION GATE (GOS3 Issue #4 Anti-Fabrication Invariant)
   * 
   * publication_allowed = false por default.
   * Só permite publicação consequencial se:
   * 1. Receipt existir e for válido;
   * 2. Backend for DURÁVEL (rejeita local scratch e memory);
   * 3. persistence_status == 'persisted';
   * 4. verification_status == 'verified' (verificação confirmada no backend);
   * 5. Digest não adulterado;
   * 6. Sem colisão/conflito concorrente de publicação no mesmo invocation_id.
   */
  public async evaluatePublicationGate(
    receipt: PersistenceReceipt | null | undefined,
    publicationKey?: string
  ): Promise<PublicationGateResult> {
    // 1. Fail-closed: sem receipt
    if (!receipt) {
      return {
        allowed: false,
        reason: "Publication blocked (fail-closed): No persistence receipt provided",
      };
    }

    // 2. Proteção contra backend de scratch local
    if (!receipt.durable || receipt.backend === "local_scratch" || receipt.backend === "none" || receipt.backend === "memory") {
      return {
        allowed: false,
        reason: `Publication blocked: Backend '${receipt.backend}' is scratch space or non-durable. Authoritative publication requires durable verified storage.`,
        receipt,
      };
    }

    // 3. Status de persistência
    if (receipt.persistence_status !== "persisted") {
      return {
        allowed: false,
        reason: `Publication blocked: Persistence status is '${receipt.persistence_status}' (expected 'persisted').`,
        receipt,
      };
    }

    // 4. Verificação completa
    const verification = await this.verifyReceipt(receipt);
    if (!verification.valid) {
      return {
        allowed: false,
        reason: `Publication blocked: Receipt verification failed (${verification.reason}).`,
        receipt: verification.receipt,
      };
    }

    // 5. Concorrência: bloqueia duplicatas concorrentes em andamento
    const key = publicationKey || receipt.receipt_id;
    if (this.activePublications.has(key)) {
      return {
        allowed: false,
        reason: `Publication blocked: Concurrent publication conflict detected for key '${key}'.`,
        receipt,
      };
    }

    return {
      allowed: true,
      reason: "Publication allowed: Valid durable persistence receipt verified.",
      receipt,
    };
  }

  public acquirePublicationLock(key: string): boolean {
    if (this.activePublications.has(key)) return false;
    this.activePublications.add(key);
    return true;
  }

  public releasePublicationLock(key: string): void {
    this.activePublications.delete(key);
  }

  /**
   * Converte resposta do GitHub Write API em atestação explícita de repositório,
   * garantindo que NUNCA seja confundida com prova de execução ou assinatura criptográfica.
   */
  public static createGitHubWriteAttestation(params: {
    repo: string;
    branch: string;
    commit_sha: string;
  }): GitHubWriteAttestation {
    return {
      repo: params.repo,
      branch: params.branch,
      commit_sha: params.commit_sha,
      is_execution_proof: false,
      is_cryptographic_signature: false,
      recorded_at: new Date().toISOString(),
      note: "GitHub API commit SHA indicates remote repository content update only; it is strictly not cryptographic proof of agent execution or signature.",
    };
  }
}

export const evidenceStore = EvidenceStore.getInstance();
