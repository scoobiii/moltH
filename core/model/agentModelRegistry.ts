import { AgentModelBinding, ModelPolicy } from "./types";

export const QWEN_05B_POLICY_ID = "qwen2.5-0.5b-local";

export const qwen05bPolicy: ModelPolicy = {
  model_artifact: {
    id: QWEN_05B_POLICY_ID,
    family: "qwen",
    model: "Qwen/Qwen2.5-0.5B-Instruct",
    quantization: "q4_k_m",
    parameters_billions: 0.49,
  },
  runtime: "llama.cpp",
  max_concurrency: 1,
  temperature: 0,
  seed: 42,
  unload_when_idle: true,
};

export const moltHAgentModelBindings: AgentModelBinding[] = [
  { agent_id: "dev", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "developer", skills: ["coding"] },
  { agent_id: "vuc-test", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "vuc-test", skills: ["verification"] },
  { agent_id: "vuc-user", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "vuc-user", skills: ["vuc"] },
  { agent_id: "dev-po", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "product-owner", skills: ["product"] },
  { agent_id: "dev-sm", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "scrum-master", skills: ["planning"] },
  { agent_id: "dev-arch", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "architect", skills: ["architecture"] },
  { agent_id: "dev-be", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "backend", skills: ["backend"] },
  { agent_id: "dev-fe", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "frontend", skills: ["frontend"] },
  { agent_id: "dev-qa", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "qa", skills: ["testing"] },
  { agent_id: "dev-sec", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "security", skills: ["security"] },
  { agent_id: "dev-devops", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "devops", skills: ["devops"] },
  { agent_id: "dev-data", model_policy_id: QWEN_05B_POLICY_ID, persona_id: "data", skills: ["data"] },
];

export function getAgentModelBinding(agentId: string): AgentModelBinding {
  const binding = moltHAgentModelBindings.find((item) => item.agent_id === agentId);
  if (!binding) {
    throw new Error(`Unknown moltH agent: ${agentId}`);
  }
  return binding;
}

export function getModelPolicyForAgent(agentId: string): ModelPolicy {
  const binding = getAgentModelBinding(agentId);
  if (binding.model_policy_id !== QWEN_05B_POLICY_ID) {
    throw new Error(`Unknown model policy: ${binding.model_policy_id}`);
  }
  return qwen05bPolicy;
}
