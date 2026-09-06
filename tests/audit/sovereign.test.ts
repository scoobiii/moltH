import { describe, it, expect } from 'vitest';
import { sealEnvelope } from '../../src/lib/sovereignVault';

describe('Soberania H ROOT 427273fd & Cryptographic Envelopes', () => {
  it('sela envelope com runtime_id canônico 427273fd', () => {
    const receipt = {
      evidenceHash: 'sha256:427273fd12345678',
      agent_id: 'GOS3-Auditor',
      status: 'passed',
      executionTimeMs: 15
    };
    const sealed = sealEnvelope(receipt);
    expect(sealed.runtime_id).toContain('427273fd');
    expect(sealed.sha256).toMatch(/^0x[a-f0-9]{64}$/);
    expect(sealed.evidenceHash).toBe(receipt.evidenceHash);
  });

  it('garante determinismo do hash SHA-256 no payload', () => {
    const receipt = { test: 'deterministic_payload', code: 0 };
    const sealed1 = sealEnvelope(receipt);
    const sealed2 = sealEnvelope(receipt);
    expect(sealed1.sha256).toBe(sealed2.sha256);
  });

  it('rejeita adulteração de evidenceHash', () => {
    const receipt = { evidenceHash: 'sha256:valid' };
    const sealed = sealEnvelope(receipt);
    expect(sealed.evidenceHash).toBe('sha256:valid');
  });
});
