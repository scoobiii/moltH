import { WALLETS, assertRole, assertSovereign } from './sovereignVault';
export const LIMITS = { per_agent_tx: 10, per_user_tx: 20, daily_org_limit: 24000, token_budget:10000, max_mentions:5, recursion:2 };
export function canTransact(principal:{role:any, orgId:string}, agent_id:string, amount:number){
  assertRole(principal, 'USER', 'mex-427273fd');
  const wallet = WALLETS.find(w=>w.agent_id===agent_id);
  if(!wallet) throw Object.assign(new Error('Wallet não existe'), {status:404});
  if(amount > wallet.balance_limit) throw Object.assign(new Error('Limite carteira 4k'), {status:429});
  assertSovereign({agent_id, runtime_id:'427273fd', evidence_hash:wallet.evidence_hash, orgId:'mex-427273fd'});
  return wallet;
}
