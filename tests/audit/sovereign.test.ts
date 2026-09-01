import { describe, it, expect } from 'vitest';
import { assertRole, assertSovereign, WALLETS, SecretSchema, WalletSchema } from '../../src/server/security/sovereignVault';
import { canTransact } from '../../src/server/security/cryptoPolicy';

describe('Soberania H ROOT 427273fd', ()=>{
  it('OWNER pode tudo org mex-427273fd', ()=>{
    expect(()=>assertRole({role:'OWNER', orgId:'mex-427273fd'}, 'ADMIN', 'mex-427273fd')).not.toThrow();
  });
  it('USER não deleta org - IDOR', ()=>{
    expect(()=>assertRole({role:'USER', orgId:'other'}, 'OWNER', 'mex-427273fd')).toThrow();
  });
  it('AGENT só 4k por wallet', ()=>{
    const p={role:'USER' as any, orgId:'mex-427273fd'};
    expect(()=>canTransact(p,'BiAgent-mex',5000)).toThrow();
    expect(canTransact(p,'BiAgent-mex',1000).pix).toBe('bi@molth');
  });
  it('6 wallets R$24k', ()=>{
    expect(WALLETS.length).toBe(6);
    expect(WALLETS.reduce((a,b)=>a+b.balance_limit,0)).toBe(24000);
  });
  it('evidence_hash sha256 obrigatório', ()=>{
    expect(()=>assertSovereign({agent_id:'H', runtime_id:'fake', evidence_hash:'sha256:x', orgId:'mex-427273fd'})).toThrow('SOBERANIA VIOLADA');
  });
  it('Secret só age encrypted', ()=>{
    expect(()=>SecretSchema.parse({key:'OPENAI', value_encrypted:'plain', owner_role:'OWNER', orgId:'mex-427273fd'})).toThrow();
  });
});
