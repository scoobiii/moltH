import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const required = ["AGENTS.md", "docs/team.md", "docs/vortex-agent-governance-contract.md"];
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`PREFLIGHT_FAIL: missing required governance file: ${file}`);
    process.exit(20);
  }
}

const contract = readFileSync("docs/vortex-agent-governance-contract.md", "utf8");
if (!contract.includes("ExecutionProof") || !contract.includes("fail closed")) {
  console.error("PREFLIGHT_FAIL: governance contract markers are missing");
  process.exit(21);
}

const agents = readFileSync("AGENTS.md", "utf8");
for (const marker of ["merkle_root", "Ed25519", "weights_sha256", "not_executed"]) {
  if (!agents.includes(marker)) {
    console.error(`PREFLIGHT_FAIL: AGENTS.md missing marker: ${marker}`);
    process.exit(22);
  }
}

const commands = [
  ["lint", ["run", "lint"]],
  ["build", ["run", "build"]],
  ["vitest", ["run", "test:vitest"]],
] as const;

for (const [name, args] of commands) {
  console.log(`PREFLIGHT: running npm ${args.join(" ")}`);
  try {
    execFileSync("npm", args, { stdio: "inherit" });
  } catch {
    console.error(`PREFLIGHT_FAIL: ${name}`);
    process.exit(30);
  }
}

if (process.env.VUA_PREFLIGHT_EXECUTED !== "true") {
  console.error("PREFLIGHT_FAIL: VUA_PREFLIGHT_UNAVAILABLE; real gateway execution and independent ExecutionProof verification were not provided.");
  console.error("Only a real VUA gateway adapter may set VUA_PREFLIGHT_EXECUTED=true after independently verifying its ExecutionProof.");
  process.exit(40);
}

console.log("PREFLIGHT_PASS: local gates passed and VUA preflight was externally attested.");
