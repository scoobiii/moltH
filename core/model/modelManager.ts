import { ModelLoadState, ModelPolicy, ModelRuntimeState } from "./types";

export interface ModelLoader {
  load(policy: ModelPolicy): Promise<void>;
  unload(policy: ModelPolicy): Promise<void>;
}

export class ModelManager {
  private readonly states = new Map<string, ModelRuntimeState>();

  public constructor(private readonly loader: ModelLoader) {}

  public getState(policy: ModelPolicy): ModelRuntimeState {
    return (
      this.states.get(policy.model_artifact.id) ?? {
        artifact_id: policy.model_artifact.id,
        state: "unloaded",
        active_requests: 0,
      }
    );
  }

  public async load(policy: ModelPolicy): Promise<ModelRuntimeState> {
    const current = this.getState(policy);

    if (current.state === "loaded" || current.state === "loading") {
      return current;
    }

    const loading: ModelRuntimeState = {
      ...current,
      state: "loading",
      error: undefined,
    };
    this.states.set(policy.model_artifact.id, loading);

    try {
      await this.loader.load(policy);
      const loaded: ModelRuntimeState = {
        ...loading,
        state: "loaded",
        loaded_at: new Date().toISOString(),
      };
      this.states.set(policy.model_artifact.id, loaded);
      return loaded;
    } catch (error) {
      const failed: ModelRuntimeState = {
        ...loading,
        state: "error",
        error: error instanceof Error ? error.message : String(error),
      };
      this.states.set(policy.model_artifact.id, failed);
      throw error;
    }
  }

  public async unload(policy: ModelPolicy): Promise<ModelRuntimeState> {
    const current = this.getState(policy);

    if (current.state === "unloaded") {
      return current;
    }

    if (current.active_requests > 0) {
      throw new Error(
        `Cannot unload ${policy.model_artifact.id}: ${current.active_requests} active request(s)`,
      );
    }

    const unloading: ModelRuntimeState = {
      ...current,
      state: "unloading",
    };
    this.states.set(policy.model_artifact.id, unloading);

    try {
      await this.loader.unload(policy);
      const unloaded: ModelRuntimeState = {
        ...unloading,
        state: "unloaded",
        unloaded_at: new Date().toISOString(),
      };
      this.states.set(policy.model_artifact.id, unloaded);
      return unloaded;
    } catch (error) {
      const failed: ModelRuntimeState = {
        ...unloading,
        state: "error",
        error: error instanceof Error ? error.message : String(error),
      };
      this.states.set(policy.model_artifact.id, failed);
      throw error;
    }
  }

  public async withModel<T>(
    policy: ModelPolicy,
    operation: () => Promise<T>,
  ): Promise<T> {
    await this.load(policy);

    const current = this.getState(policy);
    this.states.set(policy.model_artifact.id, {
      ...current,
      active_requests: current.active_requests + 1,
    });

    try {
      return await operation();
    } finally {
      const afterRequest = this.getState(policy);
      const active_requests = Math.max(0, afterRequest.active_requests - 1);
      this.states.set(policy.model_artifact.id, {
        ...afterRequest,
        active_requests,
      });

      if (policy.unload_when_idle && active_requests === 0) {
        await this.unload(policy);
      }
    }
  }

  public state(policy: ModelPolicy): ModelLoadState {
    return this.getState(policy).state;
  }
}
