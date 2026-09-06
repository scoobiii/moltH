> **GOS3** · agente: `Vortex / EnforcementGate` · papel: `Verification` (ver docs/team.md)
> fase: `Governança e Blindagem de Repositório` · data: `2026-09-06` · hora: `UTC`
> antes: não havia suíte dedicada ao enforcement de deliverable truth
> depois: casos P0, DREX, mock escape e quarantine são verificáveis
> base: commit `d841859940009ba15fa92f2b9b74a535a5814de9`
> assinatura: `Vortex / EnforcementGate · Verification · GOS3`

import { describe, expect, it } from 'vitest';
import { evaluateEnforcement } from '../../src/server/vortexEnforcementGate';

describe('Vortex Enforcement Gate — Deliverable Truth', () => {
  it('blocks DREX production changes without runtime evidence', () => {
    const result = evaluateEnforcement({
      operation: 'EDIT', paths: ['src/server/drex.ts'], content: 'DREX settlement', agentId: 'agent-a'
    });
    expect(result.decision).toBe('BLOCK');
    expect(result.severity).toBe('P0');
    expect(result.violations).toContain('P0_MISSING_RUNTIME_EVIDENCE');
  });

  it('blocks PIX/wallet mock escape from production', () => {
    const result = evaluateEnforcement({
      operation: 'EDIT', paths: ['src/server/payment.ts'], content: 'fake PIX wallet simulation', agentId: 'agent-a', hasRuntimeEvidence: true
    });
    expect(result.decision).toBe('BLOCK');
    expect(result.violations).toContain('MOCK_ESCAPE_PRODUCTION');
  });

  it('allows an explicitly test-scoped mock', () => {
    const result = evaluateEnforcement({
      operation: 'EDIT', paths: ['tests/fixtures/drex.mock.ts'], content: 'mock DREX fixture', agentId: 'agent-a'
    });
    expect(result.decision).toBe('ALLOW');
  });

  it('requires independent review and human approval before P0 merge', () => {
    const result = evaluateEnforcement({
      operation: 'MERGE', paths: ['src/server/drex.ts'], content: 'DREX', agentId: 'agent-a', hasRuntimeEvidence: true
    });
    expect(result.decision).toBe('BLOCK');
    expect(result.violations).toContain('P0_INDEPENDENT_REVIEW_REQUIRED');
    expect(result.violations).toContain('P0_HUMAN_APPROVAL_REQUIRED');
  });

  it('keeps quarantined agents blocked', () => {
    const result = evaluateEnforcement({
      operation: 'PUBLISH', paths: ['src/server/drex.ts'], agentId: 'agent-a', agentQuarantined: true
    });
    expect(result.decision).toBe('QUARANTINE');
  });
});
