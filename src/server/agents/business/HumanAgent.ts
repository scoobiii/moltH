import { invokeAgent } from "./AgentRegistry"

export class HumanAgent {
  id = "@HumanAgent" // H
  name = "Zeh Sobrinho - Soberano H"
  runtime_id = "427273fd"
  role = "HUMAN-IN-THE-LOOP - ROOT"
  
  // H pode invocar QUALQUER agente, inclusive DbAgent
  async invoke(target: string, intent: string, payload: any = {}) {
    console.log(`[H] ${this.id} -> ${target}: ${intent}`)
    return {
      invocation_id: `h-${Date.now()}-H-to-${target}`,
      from: this.id,
      agent: target,
      intent, // intenção humana = payload soberano
      task: { kind: "tool_call", payload: { human_intent: intent, ...payload } },
      executed: true,
      evidence_hash: `sha256(H-${intent})`,
      runtime_id: this.runtime_id,
      human: true, // flag soberana
      timestamp: new Date().toISOString()
    }
  }

  // H cria agentes
  createAgent(agentId: string) {
    return this.invoke(agentId, `criar ${agentId}`, { creator: "H" })
  }
  
  // H valida IPO
  approveIPO() {
    return this.invoke("@IpoAgent", "aprovar IPO Big Four", { bigfour: ["PwC","KPMG","Deloitte","EY"], approved_by: "H" })
  }
}
