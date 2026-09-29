import { describe, expect, it, vi } from "vitest";
import {
  getAgentModelBinding,
  getModelPolicyForAgent,
  moltHAgentModelBindings,
  QWEN_05B_POLICY_ID,
} from "../../core/model/agentModelRegistry";
import { ModelManager } from "../../core/model/modelManager";
import { ModelPolicy } from "../../core/model/types";

describe("moltH Qwen multi-agent model core", () => {
  it("binds all 12 logical agents to one Qwen 0.5B policy", () => {
    expect(moltHAgentModelBindings).toHaveLength(12);
    expect(new Set(moltHAgentModelBindings.map((x) => x.model_policy_id))).toEqual(
      new Set([QWEN_05B_POLICY_ID]),
    );

    expect(getAgentModelBinding("dev").persona_id).toBe("developer");
    expect(getAgentModelBinding("dev-data").skills).toContain("data");
  });

  it("keeps the model manager alive while unloading the model", async () => {
    const events: string[] = [];
    const loader = {
      load: vi.fn(async (_policy: ModelPolicy) => {
        events.push("load");
      }),
      unload: vi.fn(async (_policy: ModelPolicy) => {
        events.push("unload");
      }),
    };

    const manager = new ModelManager(loader);
    const policy = getModelPolicyForAgent("dev");

    const result = await manager.withModel(policy, async () => {
      expect(manager.state(policy)).toBe("loaded");
      return "ok";
    });

    expect(result).toBe("ok");
    expect(events).toEqual(["load", "unload"]);
    expect(manager.state(policy)).toBe("unloaded");
  });

  it("does not unload while requests are active", async () => {
    const loader = {
      load: vi.fn(async () => undefined),
      unload: vi.fn(async () => undefined),
    };

    const manager = new ModelManager(loader);
    const policy = getModelPolicyForAgent("dev");

    await manager.load(policy);
    const state = manager.getState(policy);
    manager["states"].set(policy.model_artifact.id, {
      ...state,
      active_requests: 1,
    });

    await expect(manager.unload(policy)).rejects.toThrow(/active request/);
  });
});
