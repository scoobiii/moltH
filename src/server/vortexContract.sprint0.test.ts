import { describe, expect, it } from "vitest";
import {
  buildContractEnvelope,
  computeEvidenceHash,
  validateContractEnvelope,
  validateInvocationRequest,
} from "./vortexContract";

describe("GOS3 Sprint 0 — Vortex invocation contract v0.1", () => {
  const validRequest = {
    contract_version: "v0.1",
    invocation_id: "inv-sprint0-001",
    agent: "moltH-agent",
    task: { kind: "tool_call", payload: "health_check", language: "json" },
    limits: { timeout_seconds: 15, max_output_bytes: 65536 },
    env_tag: "node-linux",
  } as const;

  it("accepts a valid invocation request", () => {
    expect(validateInvocationRequest(validRequest)).toEqual({ valid: true });
  });

  it("rejects an incomplete or unsafe invocation request", () => {
    expect(validateInvocationRequest({ ...validRequest, contract_version: "v0.2" }).valid).toBe(false);
    expect(validateInvocationRequest({ ...validRequest, task: { kind: "shell", payload: 123 } }).valid).toBe(false);
    expect(validateInvocationRequest({ ...validRequest, limits: { timeout_seconds: 0, max_output_bytes: 1 } }).valid).toBe(false);
  });

  it("builds a receipt with a verifiable evidence hash and runtime_id", () => {
    const receipt = buildContractEnvelope({
      agent: "moltH-agent",
      invocation_id: validRequest.invocation_id,
      output: { stdout: "ok\n", stderr: "", exit_code: 0 },
      duration_ms: 7,
    });

    expect(receipt.contract_version).toBe("v0.1");
    expect(receipt.executed).toBe(true);
    expect(receipt.runtime_id).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.evidence_hash).toBe(computeEvidenceHash({ stdout: "ok\n", stderr: "", exit_code: 0, duration_ms: 7 }));
    expect(validateContractEnvelope(receipt)).toEqual({ valid: true });
  });

  it("rejects a forged evidence hash", () => {
    const receipt = buildContractEnvelope({
      agent: "moltH-agent",
      output: { stdout: "ok\n", stderr: "", exit_code: 0 },
      duration_ms: 7,
    });
    const forged = { ...receipt, evidence_hash: "deadbeef".repeat(8) };
    expect(validateContractEnvelope(forged).valid).toBe(false);
  });

  it("accepts an honest auth_required non-execution and rejects false success", () => {
    const refused = buildContractEnvelope({
      agent: "moltH-agent",
      output: { stdout: "", stderr: "credential missing", exit_code: null },
      duration_ms: 0,
      status: "auth_required",
      executed: false,
    });
    expect(validateContractEnvelope(refused)).toEqual({ valid: true });

    const falseSuccess = { ...refused, status: "success" as const };
    expect(validateContractEnvelope(falseSuccess).valid).toBe(false);
  });

  it("keeps object output hash semantics stable when raw stdout is omitted", () => {
    const receipt = buildContractEnvelope({
      agent: "moltH-agent",
      output: { stdout: "payload", stderr: "warning", exit_code: 2 },
      duration_ms: 11,
      status: "failed",
      executed: true,
    });
    expect(validateContractEnvelope(receipt)).toEqual({ valid: true });
  });
});
