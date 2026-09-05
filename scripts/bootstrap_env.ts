/**
 * GOS3 · agente: Gemini / ProtocolEngine · papel: Environment Bootstrap & Runtime Discovery
 * fase: fase 5 — padronização e governança de especificações · data: 2026-09-05 · hora: 12:46:00 UTC
 * antes: Informações de ambiente e RAM hardcoded na UI
 * depois: Script canônico de bootstrap e detecção real de ambiente (Desk, VM, Mobile) com evidence_hash
 * base: commit gos3-core-v1.0, docs/GOS3-SPECIFICATION.md
 * assinatura: Gemini · Environment Bootstrap & Runtime Discovery · GOS3
 */

import os from "node:os";
import fs from "node:fs";
import crypto from "node:crypto";

export interface EnvironmentBootstrapReport {
  timestamp: string;
  category: "desk" | "vm" | "mobile";
  categoryLabel: string;
  envTag: "node-linux" | "node-android-termux" | "browser-v8-isolate" | "unknown";
  host: {
    platform: string;
    arch: string;
    release: string;
    type: string;
    hostname: string;
    uptimeSec: number;
    nodeVersion: string;
  };
  hardware: {
    totalRamBytes: number;
    totalRamMB: number;
    totalRamGB: number;
    freeRamBytes: number;
    freeRamMB: number;
    freeRamGB: number;
    usedRamMB: number;
    usedRamGB: number;
    ramUsagePercent: number;
    cpuCount: number;
    cpuModel: string;
    loadAverage: number[];
  };
  processInfo: {
    pid: number;
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  detectionFlags: {
    isContainer: boolean;
    isGVisor: boolean;
    isTermux: boolean;
    isAndroid: boolean;
    isDesktop: boolean;
    isCloudRun: boolean;
  };
  evidenceHash: string;
}

export function runBootstrapProbe(): EnvironmentBootstrapReport {
  const startTime = Date.now();

  const platform = process.platform;
  const arch = process.arch;
  const release = os.release();
  const type = os.type();
  const hostname = os.hostname();
  const uptimeSec = Math.round(os.uptime());
  const nodeVersion = process.version;

  // Real Memory Metrics
  const totalRamBytes = os.totalmem();
  const freeRamBytes = os.freemem();
  const usedRamBytes = Math.max(0, totalRamBytes - freeRamBytes);
  const totalRamMB = Math.round((totalRamBytes / (1024 * 1024)) * 10) / 10;
  const freeRamMB = Math.round((freeRamBytes / (1024 * 1024)) * 10) / 10;
  const usedRamMB = Math.round((usedRamBytes / (1024 * 1024)) * 10) / 10;
  const totalRamGB = Math.round((totalRamBytes / (1024 * 1024 * 1024)) * 100) / 100;
  const freeRamGB = Math.round((freeRamBytes / (1024 * 1024 * 1024)) * 100) / 100;
  const usedRamGB = Math.round((usedRamBytes / (1024 * 1024 * 1024)) * 100) / 100;
  const ramUsagePercent = totalRamBytes > 0 ? Math.round((usedRamBytes / totalRamBytes) * 100) : 0;

  // Real CPU Metrics
  const cpus = os.cpus() || [];
  const cpuCount = cpus.length;
  const cpuModel = cpus[0]?.model || "unknown";
  const loadAverage = os.loadavg();

  // Process Memory
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round((mem.heapUsed / (1024 * 1024)) * 10) / 10;
  const heapTotalMB = Math.round((mem.heapTotal / (1024 * 1024)) * 10) / 10;
  const rssMB = Math.round((mem.rss / (1024 * 1024)) * 10) / 10;

  // Real Environment Detection
  const isGVisor = release.toLowerCase().includes("gvisor") || release.toLowerCase().includes("runsc");
  
  let cgroupContent = "";
  try {
    if (fs.existsSync("/proc/1/cgroup")) {
      cgroupContent = fs.readFileSync("/proc/1/cgroup", "utf8");
    }
  } catch {
    cgroupContent = "";
  }

  const isContainer =
    fs.existsSync("/.dockerenv") ||
    isGVisor ||
    cgroupContent.includes("docker") ||
    cgroupContent.includes("kubepods") ||
    cgroupContent.includes("containerd");

  const isCloudRun = isGVisor || !!process.env.K_SERVICE || !!process.env.K_REVISION;

  const isTermux =
    !!process.env.TERMUX_VERSION ||
    fs.existsSync("/data/data/com.termux") ||
    (process.env.PREFIX || "").includes("com.termux");

  const isAndroid =
    platform === "android" ||
    fs.existsSync("/system/build.prop") ||
    isTermux;

  const isDesktop = !isContainer && !isAndroid && (platform === "darwin" || platform === "win32" || (platform === "linux" && !isGVisor));

  // Determine Category (desk, vm, mobile)
  let category: "desk" | "vm" | "mobile" = "vm";
  let categoryLabel = "VM (Cloud Container / gVisor Sandbox)";
  let envTag: "node-linux" | "node-android-termux" | "browser-v8-isolate" | "unknown" = "node-linux";

  if (isAndroid || isTermux) {
    category = "mobile";
    categoryLabel = isTermux ? "Mobile (Android / Termux Runtime)" : "Mobile (Android Native)";
    envTag = "node-android-termux";
  } else if (isContainer || isCloudRun || isGVisor) {
    category = "vm";
    categoryLabel = isCloudRun ? "VM (Google Cloud Run / gVisor Sandbox)" : "VM (Linux Container Sandbox)";
    envTag = "node-linux";
  } else if (isDesktop) {
    category = "desk";
    categoryLabel = `Desk (Workstation ${platform} ${arch})`;
    envTag = "node-linux";
  }

  // Canonical Evidence Hash
  const canonicalPayload = JSON.stringify({
    category,
    envTag,
    platform,
    arch,
    release,
    cpuCount,
    totalRamMB,
    isContainer,
    isTermux,
    isAndroid,
    timestamp: new Date().toISOString(),
  });

  const evidenceHash = `sha256:${crypto.createHash("sha256").update(canonicalPayload).digest("hex")}`;

  return {
    timestamp: new Date().toISOString(),
    category,
    categoryLabel,
    envTag,
    host: {
      platform,
      arch,
      release,
      type,
      hostname,
      uptimeSec,
      nodeVersion,
    },
    hardware: {
      totalRamBytes,
      totalRamMB,
      totalRamGB,
      freeRamBytes,
      freeRamMB,
      freeRamGB,
      usedRamMB,
      usedRamGB,
      ramUsagePercent,
      cpuCount,
      cpuModel,
      loadAverage,
    },
    processInfo: {
      pid: process.pid,
      heapUsedMB,
      heapTotalMB,
      rssMB,
    },
    detectionFlags: {
      isContainer,
      isGVisor,
      isTermux,
      isAndroid,
      isDesktop,
      isCloudRun,
    },
    evidenceHash,
  };
}

// If invoked as CLI (e.g. via `tsx scripts/bootstrap_env.ts`)
if (process.argv[1] && (process.argv[1].endsWith("bootstrap_env.ts") || process.argv[1].endsWith("bootstrap_env.js"))) {
  const report = runBootstrapProbe();
  console.log("\n=== 🚀 GOS3 BOOTSTRAP ENVIRONMENT DISCOVERY ===");
  console.log(`[Category]       : ${report.category.toUpperCase()} -> ${report.categoryLabel}`);
  console.log(`[EnvTag]         : ${report.envTag}`);
  console.log(`[Host OS]        : ${report.host.type} ${report.host.release} (${report.host.platform} / ${report.host.arch})`);
  console.log(`[Node.js]        : ${report.host.nodeVersion}`);
  console.log(`[RAM Real]       : ${report.hardware.usedRamGB} GB usados / ${report.hardware.totalRamGB} GB total (${report.hardware.ramUsagePercent}%)`);
  console.log(`[CPUs / Cores]   : ${report.hardware.cpuCount} cores (${report.hardware.cpuModel})`);
  console.log(`[Container/VM]   : ${report.detectionFlags.isContainer} (gVisor: ${report.detectionFlags.isGVisor}, CloudRun: ${report.detectionFlags.isCloudRun})`);
  console.log(`[Termux/Android] : ${report.detectionFlags.isTermux} / ${report.detectionFlags.isAndroid}`);
  console.log(`[Evidence Hash]  : ${report.evidenceHash}`);
  console.log("================================================\n");
}
