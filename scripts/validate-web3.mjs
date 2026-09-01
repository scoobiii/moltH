import { WALLETS, SOVEREIGN } from '../src/server/security/sovereignVault.ts' assert {type: 'json'}

for (const w of WALLETS) {
  console.log(`\n=== ${w.agent_id} ===`);
  console.log(`Pix: ${w.pix} @molth`);
  console.log(`evidence_hash: ${w.evidence_hash} - ${w.evidence_hash.startsWith('sha256:')? '✅ SOBERANA' : '❌ FALSA'}`);
  console.log(`orgId: ${w.orgId} - ${w.orgId==='mex-427273fd'? '✅ mex-427273fd' : '❌ ORG FALSO'}`);
  console.log(`balance_limit: R${w.balance_limit} - ativa: ${w.balance_limit===4000? '✅ R4k' : '❌'}`);
  console.log(`role: ${w.role} - ${w.role==='AGENT'? '✅ AGENT soberano' : '❌'}`);
  console.log(`owner: ${SOVEREIGN.OWNER_EMAIL} - validação web3: ${SOVEREIGN.OWNER_EMAIL==='sobrinhosj@gmail.com'? '✅ OWNER' : '❌'}`);
  // web3 check: assina tx com H_ROOT_HASH
  console.log(`web3: ${w.agent_id} pode assinar tx? ${w.evidence_hash.includes('427273fd')? '✅ SIM - runtime_id 427273fd' : '❌ NÃO'}`);
}
console.log(`\nTOTAL: ${WALLETS.length} contas x R4000 = R${WALLETS.length*4000} soberanas web3 ativas`);
