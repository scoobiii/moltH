export type ModelRuntime = "llama.cpp" | "ollama" | "vllm" | "external-api";

export type ModelLoadState = "unloaded" | "loading" | "loaded" | "unloading" | "error";

export interface ModelArtifact {
  id: string;
  family: string;
  model: string;
  revision?: string;
  weights_uri?: string;
  weights_sha256?: string;
  tokenizer_uri?: string;
  tokenizer_sha256?: string;
  quantization?: "q4_k_m" | "q8_0" | "fp16" | "bf16" | "none";
  parameters_billions?: number;
}

export interface ModelPolicy {
  model_artifact: ModelArtifact;
  runtime: ModelRuntime;
  endpoint?: string;
  max_concurrency: number;
  temperature: number;
  seed?: number;
  unload_when_idle: boolean;
}

export interface ModelRuntimeState {
  artifact_id: string;
  state: ModelLoadState;
  loaded_at?: string;
  unloaded_at?: string;
  active_requests: number;
  error?: string;
}

export interface AgentModelBinding {
  agent_id: string;
  model_policy_id: string;
  persona_id: string;
  skills: string[];
}
