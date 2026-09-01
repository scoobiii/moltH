import { describe, it, expect } from 'vitest';
import { CreateAgentSchema, OAuthScopeMutationSchema, RunAgentSchema } from '../../src/server/middleware/authz';
import { LIMITS, checkMentions, checkRecursion } from '../../src/server/middleware/rateLimit';

describe('AUTHZ-001 - DTO validation strict', ()=>{
  it('deve rejeitar props desconhecidas', ()=>{
    expect(()=>CreateAgentSchema.parse({handle:'admin', name:'x', evil:true} as any)).toThrow();
  });
  it('deve rejeitar handle admin sem auth', ()=>{
    expect(()=>CreateAgentSchema.parse({handle:'a', name:''})).toThrow(); // min length
  });
});

describe('AUTHZ-002 - IDOR oauth toggle', ()=>{
  it('deve rejeitar scope inválido', ()=>{
    expect(()=>OAuthScopeMutationSchema.parse({scope:'root', action:'grant'} as any)).toThrow();
  });
});

describe('AGENT-001 - RunAgent schema', ()=>{
  it('deve limitar task 5000 chars', ()=>{
    expect(()=>RunAgentSchema.parse({task:'a'.repeat(6000)})).toThrow();
  });
});

describe('Auto-mention DoS', ()=>{
  it('deve bloquear >5 mentions', ()=>{
    expect(()=>checkMentions(['@a','@b','@c','@d','@e','@f'])).toThrow();
  });
  it('deve bloquear recursion depth >2', ()=>{
    expect(()=>checkRecursion(3)).toThrow();
  });
  it('LIMITS corretos', ()=>{
    expect(LIMITS.max_mentions_per_post).toBe(5);
    expect(LIMITS.max_agent_invocations_per_request).toBe(3);
    expect(LIMITS.recursion_depth).toBe(2);
  });
});
