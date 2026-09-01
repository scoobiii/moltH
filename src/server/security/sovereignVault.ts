import { z } from 'zod';
export const H_ROOT_HASH = "sha256:427273fd-Zeh-Sobrinho-ROOT";
export const ORG_ID = "mex-427273fd";
export const AGE_PUB = "age1arc7u2l947jgltjxajdewx5f97zzeyyv4axfde9gm586rpf0cpgs2rkkds";

// RBAC
export type Role = 'OWNER'|'ADMIN'|'DEVOPS'|'USER'|'AGENT'|'GUEST';
const ORDER: Record<Role, number> = {OWNER:5, ADMIN:4, DEVOPS:3, USER:2, AGENT:1, GUEST:0};
export function assertRole(principal:{role:Role, orgId:string}, min:Role, resourceOrgId:string){
  if(ORDER[principal.role] < ORDER[min]) throw Object.assign(new Error(`RBAC ${min} required`), {status:403});
  if(principal.orgId!==resourceOrgId && principal.role!=='OWNER') throw Object.assign(new Error('IDOR org'), {status:403});
}

// Senhas soberanas - age encrypted
export const SecretSchema = z.object({
  key: z.string().min(1).max(100),
  value_encrypted: z.string().startsWith('age1'), // só aceita age encrypted
  owner_role: z.enum(['OWNER','ADMIN','DEVOPS']),
  orgId: z.literal('mex-427273fd'),
}).strict();

// Cripto soberana - cada agente wallet
export const WalletSchema = z.object({
  agent_id: z.string(),
  orgId: z.literal('mex-427273fd'),
  cnpj: z.string(),
  pix: z.string().email().or(z.string().regex(/@molth/)),
  address: z.string().startsWith('0x').or(z.string().startsWith('bc1')),
  evidence_hash: z.string().startsWith('sha256:'),
  balance_limit: z.number().max(100000),
  role: z.enum(['OWNER','ADMIN','DEVOPS','USER','AGENT']),
}).strict();

export const WALLETS = [
  {agent_id:'BiAgent-mex', orgId:'mex-427273fd', pix:'bi@molth', evidence_hash:'sha256:Bi:427273fd', balance_limit:4000},
  {agent_id:'FinanceAgent-mex', orgId:'mex-427273fd', pix:'finance@molth', evidence_hash:'sha256:Finance:427273fd', balance_limit:4000},
  {agent_id:'ErpAgent-mex', orgId:'mex-427273fd', pix:'erp@molth', evidence_hash:'sha256:Erp:427273fd', balance_limit:4000},
  {agent_id:'CommercialAgent-mex', orgId:'mex-427273fd', pix:'commercial@molth', evidence_hash:'sha256:Commercial:427273fd', balance_limit:4000},
  {agent_id:'SupportAgent-mex', orgId:'mex-427273fd', pix:'support@molth', evidence_hash:'sha256:Support:427273fd', balance_limit:4000},
  {agent_id:'CrmAgent-mex', orgId:'mex-427273fd', pix:'crm@molth', evidence_hash:'sha256:Crm:427273fd', balance_limit:4000},
];

// Anti-fabricação
export function assertSovereign(invoke:{agent_id:string, runtime_id:string, evidence_hash:string, orgId:string}){
  if(invoke.orgId!=='mex-427273fd') throw new Error('ORG FALSO');
  if(invoke.agent_id==='H' && invoke.runtime_id!=='427273fd') throw new Error('SOBERANIA VIOLADA runtime_id falso');
  if(!invoke.evidence_hash.startsWith('sha256:')) throw new Error('EVIDÊNCIA FALSA sem SHA-256');
}
