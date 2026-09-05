import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const checks = [
  { id: "lint", label: "TypeScript", weight: 20, command: "npm", args: ["run", "lint"] },
  { id: "tests", label: "Vitest + GOS3 coverage", weight: 30, command: "npm", args: ["test"] },
  { id: "build", label: "Vite + SSR build", weight: 25, command: "npm", args: ["run", "build"] },
  { id: "contract", label: "Sprint-0 contract", weight: 15, command: "npm", args: ["run", "test:sprint0"] },
  { id: "receipt-schema", label: "Canonical receipt source", weight: 10, command: "node", args: ["-e", "const fs=require('fs'); const p='src/components/molth/SovereignVerificationSuite.tsx'; const s=fs.readFileSync(p,'utf8'); if(!s.includes('isRealExecutionReceipt') || !s.includes('evidence_hash')) process.exit(1)"] }
];

const startedAt = new Date().toISOString();
const results = [];
let score = 0;

for (const check of checks) {
  const t0 = Date.now();
  const result = spawnSync(check.command, check.args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const passed = result.status === 0;
  if (passed) score += check.weight;
  results.push({
    id: check.id,
    label: check.label,
    weight: check.weight,
    status: passed ? "PASS" : "FAIL",
    exit_code: result.status,
    duration_ms: Date.now() - t0,
    stdout_tail: (result.stdout || "").slice(-4000),
    stderr_tail: (result.stderr || "").slice(-4000)
  });
}

const report = {
  schema_version: "reality-score/v1",
  generated_at: new Date().toISOString(),
  started_at: startedAt,
  commit_sha: process.env.GITHUB_SHA || "local",
  workflow_run_id: process.env.GITHUB_RUN_ID || null,
  ref: process.env.GITHUB_REF || null,
  score,
  max_score: 100,
  status: results.every(r => r.status === "PASS") ? "VERIFIED" : "PARTIAL",
  rule: "score is computed only from executable checks; no LLM declaration can increase it",
  checks: results
};

mkdirSync("docs/reality", { recursive: true });
writeFileSync("docs/reality/reality-score.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ score, status: report.status, commit_sha: report.commit_sha, checks: results.map(r => ({ id: r.id, status: r.status })) }, null, 2));
process.exit(results.some(r => r.status === "FAIL") ? 1 : 0);
