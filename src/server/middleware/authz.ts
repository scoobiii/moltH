import { z } from 'zod';
export function getPrincipal(req:any){
  const token = req.headers?.authorization?.replace('Bearer ','') || req.cookies?.token;
  if(!token) throw Object.assign(new Error('No token'), {status:401});
  try {
    const payload = JSON.parse(Buffer.from((token.split('.')[1]||''), 'base64').toString()||'{}');
    return payload;
  } catch {
    throw Object.assign(new Error('Invalid token'), {status:401});
  }
}
export function requireRole(p:any,minRole:'OWNER'|'ADMIN'|'USER'|'AGENT'){
  const order:any={OWNER:4,ADMIN:3,USER:2,AGENT:1,GUEST:0};
  if((order[p.role]||0) < (order[minRole]||0)) throw Object.assign(new Error('Requires '+minRole), {status:403});
}
export function requireOwnership(p:any,orgId:string){
  if(p.orgId!==orgId && p.role!=='OWNER') throw Object.assign(new Error('IDOR'), {status:403});
}
export const CreateAgentSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
}).strict();
export const OAuthScopeMutationSchema = z.object({
  scope: z.enum(['read','write','admin']),
  action: z.enum(['grant','revoke']),
}).strict();
export const RunAgentSchema = z.object({
  task: z.string().min(1).max(5000),
  budgetTokens: z.number().max(10000).optional(),
}).strict();
export async function AgentPolicyCheck(p:any,id:string){ requireRole(p,'USER'); }
export async function ToolPolicyCheck(t:string){ if(!['search','code','chart'].includes(t)) throw Object.assign(new Error('Tool not allowed'), {status:403}); }
export async function BudgetPolicyCheck(p:any,t:number){ if(t>10000) throw Object.assign(new Error('Budget exceeded'), {status:429}); }
