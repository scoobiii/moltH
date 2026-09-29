import "dotenv/config";
import express from "express";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { storage } from "./src/server/storage";
import { vectorMemory } from "./src/server/vectorMemory";
import { modelGateway } from "./src/server/modelGateway";
import { persistence } from "./src/server/persistence";

const PUBLIC_PORT = Number(process.env.PORT || 8080);
const MOLTH_PORT = Number(process.env.MOLTH_INTERNAL_PORT || 3000);
const YAI_ONLINE_URL = process.env.YAI_ONLINE_URL || "https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/";

const capabilities = [
  "landing", "workspace", "authentication", "agent-network", "agent-studio", "agent-runner",
  "multi-agent-orchestration", "model-gateway", "vector-memory", "rag", "mcp", "gos3",
  "sandbox", "repo-analyzer", "prompt-engine", "github-sync", "formal-verification",
  "k6-performance", "local-llm", "chat", "debates", "scrum-live", "telemetry", "voice",
  "connectors", "persistence", "audit-contracts",
] as const;

function summary() {
  return {
    product: "yAI × moltH",
    fork: "scoobiii/moltH",
    mode: "unified-runtime-gateway",
    onlineUrl: YAI_ONLINE_URL,
    capabilities,
    agents: storage.getAgents().length,
    posts: storage.getPosts().length,
    memories: vectorMemory.getAllMemories().length,
    providers: modelGateway.getConfigs().length,
    persistence: persistence.getStats(),
    runtime: { node: process.version, platform: process.platform, arch: process.arch, pid: process.pid },
    timestamp: new Date().toISOString(),
  };
}

const app = express();
app.disable("x-powered-by");
app.get("/api/yai", (_req, res) => res.json({ success: true, ...summary() }));
app.get("/api/yai/health", (_req, res) => {
  try { res.json({ success: true, status: "ok", ...summary() }); }
  catch (error) { res.status(503).json({ success: false, status: "degraded", error: error instanceof Error ? error.message : String(error) }); }
});
app.get("/api/yai/capabilities", (_req, res) => res.json({ success: true, version: "1.0.0", capabilities }));

let child: ReturnType<typeof spawn> | undefined;
let shuttingDown = false;

function startMolt(): void {
  const command = process.env.NODE_ENV === "production" ? "node" : "tsx";
  const entry = process.env.NODE_ENV === "production" ? "dist/server.cjs" : "server.ts";
  child = spawn(command, [entry], { env: { ...process.env, PORT: String(MOLTH_PORT) }, stdio: "inherit" });
  child.on("exit", (code, signal) => {
    if (!shuttingDown) {
      console.error(`[yAI gateway] moltH runtime exited code=${code ?? "null"} signal=${signal ?? "null"}`);
      process.exit(code && code !== 0 ? code : 1);
    }
  });
  child.on("error", (error) => {
    console.error("[yAI gateway] failed to start moltH runtime", error);
    process.exit(1);
  });
}

async function proxy(req: express.Request, res: express.Response): Promise<void> {
  const target = `http://127.0.0.1:${MOLTH_PORT}${req.originalUrl}`;
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key.toLowerCase() !== "host") headers.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    const init: RequestInit = { method: req.method, headers, redirect: "manual" };
    if (!["GET", "HEAD"].includes(req.method)) {
      init.body = JSON.stringify(req.body);
      headers.set("content-type", req.get("content-type") || "application/json");
    }
    const upstream = await fetch(target, init);
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => { if (key.toLowerCase() !== "transfer-encoding") res.setHeader(key, value); });
    if (upstream.body) Readable.fromWeb(upstream.body as never).pipe(res);
    else res.end();
  } catch (error) {
    res.status(502).json({ success: false, error: "moltH runtime unavailable", detail: error instanceof Error ? error.message : String(error) });
  }
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.get("/health", async (_req, res) => {
  try {
    const response = await fetch(`http://127.0.0.1:${MOLTH_PORT}/health`);
    const payload = await response.json();
    res.status(response.ok ? 200 : 503).json({ ...payload, yai: summary() });
  } catch {
    res.status(503).json({ status: "degraded", yai: summary() });
  }
});
app.use(proxy);

startMolt();
const server = app.listen(PUBLIC_PORT, "0.0.0.0", () => console.log(`[yAI gateway] listening on :${PUBLIC_PORT}, moltH on :${MOLTH_PORT}`));

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[yAI gateway] ${signal}; shutting down`);
  server.close(() => {
    child?.kill("SIGTERM");
    setTimeout(() => child?.kill("SIGKILL"), 5000).unref();
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
