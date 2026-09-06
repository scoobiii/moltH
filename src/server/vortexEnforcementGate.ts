> **GOS3** · agente: `Vortex / EnforcementGate` · papel: `Runtime Governance` (ver docs/team.md)
> fase: `Governança e Blindagem de Repositório` · data: `2026-09-06` · hora: `UTC`
> antes: CI possuía verificações técnicas, mas não um gate imperativo de truth/P0
> depois: gate determinístico bloqueia violações P0 e mock escape antes da publicação
> base: branch `feat/vortex-enforcement-gate-drex`
> assinatura: `Vortex / EnforcementGate · Runtime Governance · GOS3`

export type EnforcementDecision =
  | 'ALLOW'
  | 'BLOCK'
  | 'REQUIRE_REVIEW'
  | 'REQUIRE_HUMAN_APPROVAL'
  | 'QUARANTINE';

export type Operation =
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'MOVE'
  | 'RENAME'
  | 'REPLACE'
  | 'EXECUTE'
  | 'PUBLISH'
  | 'MERGE';

export const P0_TERMS = [
  'drex', 'pix', 'wallet', 'payment', 'banking', 'settlement',
  'financial', 'balance', 'account', 'money', 'secret', 'credential',
  'authentication', 'authorization', 'security'
] as const;

const FORBIDDEN_PRODUCTION_MARKERS = [
  'mock', 'mocked', 'fake', 'simulation', 'simulated', 'stub', 'fixture'
] as const;

export interface EnforcementInput {
  operation: Operation;
  paths: string[];
  content?: string;
  agentId: string;
  hasRuntimeEvidence?: boolean;
  hasIndependentReview?: boolean;
  humanApproved?: boolean;
  agentQuarantined?: boolean;
}

export interface EnforcementResult {
  decision: EnforcementDecision;
  severity: 'P0' | 'P1' | 'NONE';
  violations: string[];
  nextActions: string[];
}

function isTestPath(path: string): boolean {
  return /(^|\/)(tests?|__tests__|fixtures?|__mocks__)(\/|$)/i.test(path)
    || /\.(test|spec)\.[^.]+$/i.test(path);
}

function isP0(input: EnforcementInput): boolean {
  const haystack = [...input.paths, input.content ?? ''].join('\n').toLowerCase();
  return P0_TERMS.some(term => haystack.includes(term));
}

function hasProductionMock(input: EnforcementInput): boolean {
  if (!input.content) return false;
  if (input.paths.length > 0 && input.paths.every(isTestPath)) return false;
  const haystack = input.content.toLowerCase();
  return FORBIDDEN_PRODUCTION_MARKERS.some(marker => haystack.includes(marker));
}

export function evaluateEnforcement(input: EnforcementInput): EnforcementResult {
  const violations: string[] = [];
  const p0 = isP0(input);

  if (input.agentQuarantined) {
    return {
      decision: 'QUARANTINE', severity: 'P0',
      violations: ['AGENT_QUARANTINED'],
      nextActions: ['corrigir o incidente', 'obter revisão independente', 'aguardar compliance PASS']
    };
  }

  if (hasProductionMock(input)) violations.push('MOCK_ESCAPE_PRODUCTION');
  if (p0 && !input.hasRuntimeEvidence) violations.push('P0_MISSING_RUNTIME_EVIDENCE');
  if (input.operation === 'PUBLISH' || input.operation === 'MERGE') {
    if (p0 && !input.hasIndependentReview) violations.push('P0_INDEPENDENT_REVIEW_REQUIRED');
    if (p0 && !input.humanApproved) violations.push('P0_HUMAN_APPROVAL_REQUIRED');
  }

  if (violations.length > 0) {
    return {
      decision: p0 || violations.includes('MOCK_ESCAPE_PRODUCTION') ? 'BLOCK' : 'REQUIRE_REVIEW',
      severity: p0 || violations.includes('MOCK_ESCAPE_PRODUCTION') ? 'P0' : 'P1',
      violations,
      nextActions: [
        'preservar o estado anterior',
        'corrigir a violação',
        'executar os testes afetados',
        'gerar evidência pelo runtime',
        'solicitar revisão independente'
      ]
    };
  }

  return { decision: 'ALLOW', severity: 'NONE', violations: [], nextActions: [] };
}
