/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `GPT Provider Adapter`
 * > fase: `Sprint 1 — Universal Vortex Connector Engine` · data: `2026-09-07` · hora: `08:26:00 UTC`
 * > antes: Sem adapter dedicado para GPT no protocolo universal
 * > depois: GPTAdapter fino mapeando GPT-4o / GPT-5.6 para o protocolo Vortex
 * > base: commit `gos3-core-v1.2`
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { GenericAdapter, UniversalTaskParams, UniversalExecutionOutput } from "../generic/genericAdapter";
import { VortexRepositoryState, VortexExecutionProofRecord } from "../../core/identity/types";

export class GPTAdapter extends GenericAdapter {
  constructor(model = "gpt-5.6", repo?: VortexRepositoryState) {
    super(
      {
        provider: "gpt",
        model,
        agent_id: "agent-gpt-universal",
        handle: "@GPTBot",
        version: "1.0.0",
      },
      repo || {
        owner: "scoobiii",
        name: "vortex",
        base_commit: process.env.VORTEX_BASE_COMMIT || "abc123d4e5f6",
      }
    );
  }

  public adaptExecution(task: UniversalTaskParams, output: UniversalExecutionOutput): VortexExecutionProofRecord {
    return this.createProof(task, output, {
      version: "vortex-policy/v1.0",
      rules_enforced: ["ZERO_MOCK", "CANONICAL_HASH", "RFC_8785"],
    });
  }
}
