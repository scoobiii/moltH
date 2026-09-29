import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { vectorMemory } from "./vectorMemory";
import { modelGateway } from "./modelGateway";
import { persistence } from "./persistence";

export const YAI_ONLINE_URL = "https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/";

export const YAI_CAPABILITIES = [
  "landing", "workspace", "authentication", "agent-network", "agent-studio",
  "agent-runner", "multi-agent-orchestration", "model-gateway", "vector-memory",
  "rag", "mcp", "gos3", "sandbox", "repo-analyzer", "prompt-engine",
  "github-sync", "formal-verification", "k6-performance", "local-llm",
  "chat", "debates", "scrum-live", "telemetry", "voice", "connectors",
  "persistence", "audit-contracts",
] as const;

function runtimeSummary() {
  return {
    product: "yAI × moltH",
    fork: "scoobiii/moltH",
    mode: "unified-runtime",
    onlineUrl: YAI_ONLINE_URL,
    capabilities: YAI_CAPABILITIES,
    agents: storage.getAgents().length,
    posts: storage.getPosts().length,
    memories: vectorMemory.getAllMemories().length,
    providers: modelGateway.getConfigs().length,
    persistence: persistence.getStats(),
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  };
}

export function registerYaiPlatformRoutes(app: Express): void {
  app.get("/api/yai", (_req: Request, res: Response) => {
    res.json({ success: true, ...runtimeSummary() });
  });

  app.get("/api/yai/health", (_req: Request, res: Response) => {
    try {
      res.json({ success: true, status: "ok", ...runtimeSummary() });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: "degraded",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/api/yai/capabilities", (_req: Request, res: Response) => {
    res.json({ success: true, version: "1.0.0", capabilities: YAI_CAPABILITIES });
  });
}
