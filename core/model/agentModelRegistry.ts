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
  ["dev", "Lucas_Dev", "developer", ["coding"]],
  ["vuc-test", "Bruno_Test", "vuc-test", ["verification"]],
  ["vuc-user", "Rafael_VUC", "vuc-user", ["vuc"]],
  ["dev-po", "Marina_PO", "product-owner", ["product"]],
  ["dev-sm", "Camila_SM", "scrum-master", ["planning"]],
  ["dev-arch", "André_Arch", "architect", ["architecture"]],
  ["dev-be", "Diego_BE", "backend", ["backend"]],
  ["dev-fe", "Pedro_FE", "frontend", ["frontend"]],
  ["dev-qa", "Juliana_QA", "qa", ["testing"]],
  ["dev-sec", "Felipe_Sec", "security", ["security"]],
  ["dev-devops", "Gustavo_DevOps", "devops", ["devops"]],
  ["dev-data", "Renata_Data", "data", ["data"]],
].map(([agent_id, persona_id, persona, skills]) => ({
  agent_id,
  model_policy_id: QWEN_05B_POLICY_ID,
  persona_id: persona,
  skills,
}));

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
