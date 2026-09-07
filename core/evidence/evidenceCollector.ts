/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Evidence Collector & State Fingerprint`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:18:00 UTC`
 * > antes: Evidências sem hash formal de artefatos ou fingerprint do ambiente
 * > depois: Coletor de evidências auditável gerando SHA-256 de saídas, arquivos e ambiente
 * > base: commit `gos3-core-v1.2`, ADR-002
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import os from "node:os";
import { sha256Hex } from "../hashing/canonicalHasher";
import { VortexEvidence, VortexArtifact } from "../identity/types";

export class EvidenceCollector {
  public static collect(params: {
    stdout: string;
    stderr: string;
    artifacts?: { path: string; content: string | Buffer }[];
    envTag?: string;
  }): VortexEvidence {
    const stdout = params.stdout ?? "";
    const stderr = params.stderr ?? "";

    const stdout_hash = sha256Hex(stdout);
    const stderr_hash = sha256Hex(stderr);

    const artifacts: VortexArtifact[] = (params.artifacts || []).map((art) => {
      const buffer = Buffer.isBuffer(art.content) ? art.content : Buffer.from(art.content, "utf-8");
      return {
        path: art.path,
        hash: sha256Hex(buffer),
        bytes: buffer.byteLength,
      };
    });

    const envTag = params.envTag || process.env.GOS3_ENV_TAG || "node-linux";
    const fingerprint = sha256Hex(`${envTag}:${os.platform()}:${os.arch()}:${os.cpus().length}`);

    return {
      stdout_hash,
      stderr_hash,
      artifacts,
      environment_fingerprint: fingerprint,
      raw_stdout: stdout,
      raw_stderr: stderr,
    };
  }
}
