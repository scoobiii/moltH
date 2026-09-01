export const H_ROOT_HASH = "sha256:427273fd-Zeh-Sobrinho-ROOT"
export function assertHumanSovereign(invoke:{agent_id:string, runtime_id:string, evidence_hash:string}){
  if(invoke.agent_id==="H" && invoke.runtime_id!=="427273fd") throw new Error("SOBERANIA VIOLADA - runtime_id falso")
  if(!invoke.evidence_hash.startsWith("sha256:")) throw new Error("EVIDÊNCIA FALSA - sem SHA-256")
}
