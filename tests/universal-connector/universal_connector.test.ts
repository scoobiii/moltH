import { describe, expect, it } from "vitest";
import {
  canonicalizeJson,
  computeChangeHash,
  computeExecutionProofHash,
  computeRepositoryStateHash,
  sha256Hex,
} from "../../core/hashing/canonicalHasher";
import { EvidenceCollector } from "../../core/evidence/evidenceCollector";
import { ExecutionProofBuilder } from "../../core/execution/executionProofBuilder";
import { VortexValidator } from "../../core/validation/vortexValidator";
import { GenericAdapter } from "../../adapters/generic/genericAdapter";
import { GPTAdapter } from "../../adapters/gpt/gptAdapter";
import { ClaudeAdapter } from "../../adapters/claude/claudeAdapter";
import { QwenAdapter } from "../../adapters/qwen/qwenAdapter";
import { GrokAdapter } from "../../adapters/grok/grokAdapter";
import { GitHubUniversalAdapter } from "../../adapters/github/githubAdapter";

describe("Gate 1 — Protocol & Schemas & Canonicalization", () => {
  it("computes deterministic RFC-8785 canonical JSON regardless of key order", () => {
    const objA = { z: 1, a: "hello", m: [3, 2, 1], nested: { y: true, b: false } };
    const objB = { nested: { b: false, y: true }, a: "hello", m: [3, 2, 1], z: 1 };

    expect(canonicalizeJson(objA)).toBe(canonicalizeJson(objB));
    expect(sha256Hex(canonicalizeJson(objA))).toBe(sha256Hex(canonicalizeJson(objB)));
  });

  it("handles nulls, strings, and undefined deterministically", () => {
    const canonical = canonicalizeJson({ a: 10, b: undefined, c: null });
    expect(canonical).toBe('{"a":10,"c":null}');
  });
});

describe("Gate 2 — Evidence + Three Canonical Hashes", () => {
  const repo = { owner: "scoobiii", name: "vortex", base_commit: "abc12345" };

  it("produces identical repository_state_hash for same inputs", () => {
    const h1 = computeRepositoryStateHash(repo);
    const h2 = computeRepositoryStateHash({ ...repo, owner: "SCOOBIII " });
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("computes change_hash from normalized patch and files", () => {
    const ch1 = computeChangeHash({
      patch: "--- a/file.ts\n+++ b/file.ts\n@@ -1 +1 @@\n-old\n+new\r\n",
      files_changed: ["src/file.ts"],
      proposal_id: "P001",
    });
    const ch2 = computeChangeHash({
      patch: "--- a/file.ts\n+++ b/file.ts\n@@ -1 +1 @@\n-old\n+new\n",
      files_changed: ["src/file.ts"],
      proposal_id: "P001",
    });
    expect(ch1).toBe(ch2);
    expect(ch1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("derives execution_proof_hash deterministically", () => {
    const record = {
      protocol: "vortex-agent/v1",
      execution_id: "E001",
      agent: { provider: "gpt", model: "gpt-5.6" },
      repository: repo,
      proposal: { proposal_id: "P001", change_hash: "a".repeat(64) },
      execution: {
        command: "npm test",
        exit_code: 0,
        duration_ms: 31000,
        tests: { total: 184, passed: 184, failed: 0 },
      },
      evidence: { stdout_hash: "b".repeat(64), stderr_hash: "c".repeat(64) },
      policy: { version: "vortex-policy/v1.0" },
    };

    const hash1 = computeExecutionProofHash(record);
    const hash2 = computeExecutionProofHash(JSON.parse(JSON.stringify(record)));
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("Gate 3 — Vortex Validator (Deterministic Status)", () => {
  const repo = { owner: "scoobiii", name: "vortex", base_commit: "abc12345" };

  it("returns VALID for an authentic and complete Execution Proof", () => {
    const adapter = new GenericAdapter(
      { provider: "generic", model: "test-model" },
      repo
    );
    const proof = adapter.createProof(
      {
        command: "npm test",
        patch: "diff --git a b",
        files_changed: ["src/index.ts"],
        proposal_id: "P001",
      },
      {
        stdout: "All 184 tests passed",
        stderr: "",
        exit_code: 0,
        duration_ms: 28000,
        tests: { total: 184, passed: 184, failed: 0 },
      }
    );

    const validation = VortexValidator.validate(proof);
    expect(validation.validation_result).toBe("VALID");
    expect(validation.execution_proof_hash).toBe(proof.proof.hash);

    const benchmark = VortexValidator.toBenchmarkRecord(proof, validation);
    expect(benchmark.correctness.validation_result).toBe("PASS");
    expect(benchmark.correctness.tests_passed).toBe(184);
    expect(benchmark.governance.approval_status).toBe("APPROVED");
  });

  it("returns INVALID_PROOF if proof.hash is tampered with", () => {
    const adapter = new GenericAdapter({ provider: "generic", model: "test-model" }, repo);
    const proof = adapter.createProof(
      { command: "npm test", proposal_id: "P001" },
      { stdout: "ok", stderr: "", exit_code: 0, duration_ms: 100, tests: { total: 1, passed: 1, failed: 0 } }
    );

    const forged = {
      ...proof,
      proof: { ...proof.proof, hash: "0".repeat(64) },
    };

    const validation = VortexValidator.validate(forged);
    expect(validation.validation_result).toBe("INVALID_PROOF");
  });

  it("returns INVALID_REPOSITORY_STATE if base_commit or repo is altered", () => {
    const adapter = new GenericAdapter({ provider: "generic", model: "test-model" }, repo);
    const proof = adapter.createProof(
      { command: "npm test", proposal_id: "P001" },
      { stdout: "ok", stderr: "", exit_code: 0, duration_ms: 100, tests: { total: 1, passed: 1, failed: 0 } }
    );

    const forgedRepo = {
      ...proof,
      repository: { ...proof.repository, base_commit: "different_commit" },
    };

    const validation = VortexValidator.validate(forgedRepo);
    expect(validation.validation_result).toBe("INVALID_REPOSITORY_STATE");
  });

  it("returns INVALID_EVIDENCE if raw output contradicts evidence hash", () => {
    const adapter = new GenericAdapter({ provider: "generic", model: "test-model" }, repo);
    const proof = adapter.createProof(
      { command: "npm test", proposal_id: "P001" },
      { stdout: "real output", stderr: "", exit_code: 0, duration_ms: 100, tests: { total: 1, passed: 1, failed: 0 } }
    );

    const tamperedEvidence = {
      ...proof,
      evidence: {
        ...proof.evidence,
        raw_stdout: "tampered output without hash update",
      },
    };

    const validation = VortexValidator.validate(tamperedEvidence);
    expect(validation.validation_result).toBe("INVALID_EVIDENCE");
  });
});

describe("Gate 4 & 5 — Multi-Agent Universal Adapters & PR Gates", () => {
  const repo = { owner: "scoobiii", name: "vortex", base_commit: "abc123" };

  it("allows GPTAdapter to create verified proof and pass PR gate", () => {
    const gpt = new GPTAdapter("gpt-5.6", repo);
    const proof = gpt.adaptExecution(
      {
        command: "npm test",
        proposal_id: "P001",
        patch: "diff --git a b",
        files_changed: ["src/feature.ts"],
      },
      {
        stdout: "PASS 184/184 tests",
        stderr: "",
        exit_code: 0,
        duration_ms: 31000,
        tests: { total: 184, passed: 184, failed: 0 },
      }
    );

    const prResult = GitHubUniversalAdapter.evaluatePRGate(proof);
    expect(prResult.allowed).toBe(true);
    expect(prResult.pr_readiness.can_open_pr).toBe(true);
  });

  it("allows ClaudeAdapter to create verified proof and pass PR gate", () => {
    const claude = new ClaudeAdapter("claude-3-7-sonnet", repo);
    const proof = claude.adaptExecution(
      {
        command: "npm test",
        proposal_id: "P002",
        patch: "diff --git a b",
        files_changed: ["src/claude_feature.ts"],
      },
      {
        stdout: "PASS 184/184 tests",
        stderr: "",
        exit_code: 0,
        duration_ms: 29000,
        tests: { total: 184, passed: 184, failed: 0 },
      }
    );

    const prResult = GitHubUniversalAdapter.evaluatePRGate(proof);
    expect(prResult.allowed).toBe(true);
  });

  it("allows QwenAdapter to create verified proof and pass PR gate", () => {
    const qwen = new QwenAdapter("qwen-2.5-coder-32b", repo);
    const proof = qwen.adaptExecution(
      {
        command: "npm test",
        proposal_id: "P003",
        patch: "diff --git a b",
        files_changed: ["src/qwen_feature.ts"],
      },
      {
        stdout: "PASS 184/184 tests",
        stderr: "",
        exit_code: 0,
        duration_ms: 34000,
        tests: { total: 184, passed: 184, failed: 0 },
      }
    );

    const prResult = GitHubUniversalAdapter.evaluatePRGate(proof);
    expect(prResult.allowed).toBe(true);
  });

  it("rejects PR gate if tests fail (e.g. Grok scenario with failed tests)", () => {
    const grok = new GrokAdapter("grok-3", repo);
    const proof = grok.adaptExecution(
      {
        command: "npm test",
        proposal_id: "P004",
        patch: "diff --git a b",
        files_changed: ["src/grok_feature.ts"],
      },
      {
        stdout: "FAIL 2 tests out of 184",
        stderr: "AssertionError: expected true to be false",
        exit_code: 1,
        duration_ms: 18000,
        tests: { total: 184, passed: 182, failed: 2 },
      }
    );

    const prResult = GitHubUniversalAdapter.evaluatePRGate(proof);
    expect(prResult.allowed).toBe(false);
    expect(prResult.pr_readiness.can_open_pr).toBe(false);
    expect(prResult.reason).toContain("testes com falha");
  });
});
