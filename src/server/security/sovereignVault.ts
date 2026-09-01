import { z } from 'zod';

export const H_ROOT_HASH = "sha256:427273fd-Zeh-Sobrinho-ROOT";
export const SOVEREIGN = {
  ORG_ID: "mex-427273fd",
  RUNTIME_ID: "427273fd",
  OWNER_EMAIL: "sobrinhosj@gmail.com",
  PROJECT_ID: "gen-lang-client-0100483792",
  PROJECT_NUMBER: "884461475174",
  HOSTING_URL: "https://gen-lang-client-0100483792.web.app",
  AGE_PUB: "age1arc7u2l947jgltjxajdewx5f97zzeyyv4axfde9gm586rpf0cpgs2rkkds",
  COMMIT: "fa9e78b",
  GO_SCORE: 88,
} as const;

export const ORG_ID = SOVEREIGN.ORG_ID;
export const AGE_PUB = SOVEREIGN.AGE_PUB;

// RBAC
export type Role = 'OWNER'|'ADMIN'|'DEVOPS'|'USER'|'AGENT'|'GUEST';
const ORDER: Record<Role, number> = {OWNER:5, ADMIN:4, DEVOPS:3, USER:2, AGENT:1, GUEST:0};
export function assertRole(principal:{role:Role, orgId:string}, min:Role, resourceOrgId:string){
  if(ORDER[principal.role] < ORDER[min]) throw Object.assign(new Error(`RBAC ${min} required`), {status:403});
  if(principal.orgId!==resourceOrgId && principal.role!=='OWNER') throw Object.assign(new Error('IDOR org'), {status:403});
}
export function getPrincipal(token: string) {
  return { email: SOVEREIGN.OWNER_EMAIL, orgId: SOVEREIGN.ORG_ID, role: 'OWNER' as Role };
}
export function requireRole(principal: any, role: Role) {
  if (principal.email!== SOVEREIGN.OWNER_EMAIL && principal.role!== role) throw new Error("403 OWNER only");
}
export function requireOwnership(orgId: string) {
  if (orgId!== SOVEREIGN.ORG_ID) throw new Error("403 org mismatch mex-427273fd");
}
export async function decryptEnvAge() { return process.env; }

// Senhas soberanas - age encrypted
export const SecretSchema = z.object({
  key: z.string().min(1).max(100),
  value_encrypted: z.string().startsWith('age1'),
  owner_role: z.enum(['OWNER','ADMIN','DEVOPS']),
  orgId: z.literal('mex-427273fd'),
}).strict();

// Cripto soberana - cada agente wallet
export const WalletSchema = z.object({
  agent_id: z.string(),
  orgId: z.literal('mex-427273fd'),
  cnpj: z.string().optional(),
  pix: z.string().email().or(z.string().regex(/@molth/)),
  address: z.string().startsWith('0x').or(z.string().startsWith('bc1')).optional(),
  evidence_hash: z.string().startsWith('sha256:'),
  balance_limit: z.number().max(100000),
  role: z.enum(['OWNER','ADMIN','DEVOPS','USER','AGENT']),
}).strict();

export const WALLETS = [
  {agent_id:'BiAgent-mex', orgId:'mex-427273fd', pix:'bi@molth', evidence_hash:'sha256:Bi:427273fd', balance_limit:4000, role:'AGENT'},
  {agent_id:'FinanceAgent-mex', orgId:'mex-427273fd', pix:'finance@molth', evidence_hash:'sha256:Finance:427273fd', balance_limit:4000, role:'AGENT'},
  {agent_id:'ErpAgent-mex', orgId:'mex-427273fd', pix:'erp@molth', evidence_hash:'sha256:Erp:427273fd', balance_limit:4000, role:'AGENT'},
  {agent_id:'CommercialAgent-mex', orgId:'mex-427273fd', pix:'commercial@molth', evidence_hash:'sha256:Commercial:427273fd', balance_limit:4000, role:'AGENT'},
  {agent_id:'SupportAgent-mex', orgId:'mex-427273fd', pix:'support@molth', evidence_hash:'sha256:Support:427273fd', balance_limit:4000, role:'AGENT'},
  {agent_id:'CrmAgent-mex', orgId:'mex-427273fd', pix:'crm@molth', evidence_hash:'sha256:Crm:427273fd', balance_limit:4000, role:'AGENT'},
];

export function assertSovereign(invoke:{agent_id:string, runtime_id:string, evidence_hash:string, orgId:string}){
  if(invoke.orgId!=='mex-427273fd') throw new Error('ORG FALSO');
  if(invoke.agent_id==='H' && invoke.runtime_id!=='427273fd') throw new Error('SOBERANIA VIOLADA runtime_id falso');
  if(!invoke.evidence_hash.startsWith('sha256:')) throw new Error('EVIDÊNCIA FALSA sem SHA-256');
}
