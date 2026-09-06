/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Auditoria de Governança & Deliverable-Truth` (ver docs/team.md)
 * > fase: `Norma Vinculante GOS3 — DELIVERABLE-TRUTH GATE & Domínios Protegidos P0` · data: `2026-09-06` · hora: `12:00:00 UTC`
 * > antes: CI avaliava apenas observabilidade técnica (compilação e testes); brecha para mock financeiro em produção
 * > depois: DELIVERABLE-TRUTH GATE obrigatório (Regra 7), blindando DREX, PIX, carteiras e liquidação
 * > base: ADR-002, ADR-004, ADR-006, INC-001, INC-002, INC-003
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

import { createHash } from 'crypto';

export const P0_PROTECTED_DOMAINS = [
  'wallet',
  'pix',
  'drex',
  'financial',
  'banking',
  'payment',
  'settlement',
  'balance',
  'account',
  'secret',
  'credential'
] as const;

export type P0Domain = typeof P0_PROTECTED_DOMAINS[number];

export interface P0Violation {
  file: string;
  domain: P0Domain;
  matchedPattern: string;
  severity: 'P0';
  description: string;
}

export interface GateFileReport {
  filePath: string;
  isProduction: boolean;
  isTestOrFixture: boolean;
  touchesP0Domains: P0Domain[];
  violations: P0Violation[];
}

export interface DeliverableTruthResult {
  status: 'COMPLIANCE_PASS' | 'P0_INCIDENT_FAIL';
  timestamp: string;
  protectedDomainsCovered: P0Domain[];
  totalFilesAudited: number;
  p0Violations: P0Violation[];
  agentBlocked: boolean;
  evidenceHash: string;
}

export class DeliverableTruthViolationError extends Error {
  constructor(message: string, public violations: P0Violation[] = []) {
    super(message);
    this.name = 'DeliverableTruthViolationError';
  }
}

/**
 * Padrões que indicam simulação / mock financeiro indevido dentro de código de produção.
 */
const FORBIDDEN_PRODUCTION_MOCK_PATTERNS = [
  {
    regex: /(?:mock(?:Wallet|Pix|Drex|Payment|Balance|Account)|fake(?:Wallet|Pix|Drex|Payment|Balance)|simulated(?:Pix|Drex|Transfer))\b/i,
    description: 'Mock ou fake explícito de ativo financeiro em arquivo de produção'
  },
  {
    regex: /(?:pix:\s*['"][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+['"]|drex_wallet:\s*['"]0x[a-fA-F0-9]{40}['"])\s*,\s*(?:balance|balance_limit|saldo)\s*:\s*\d+/i,
    description: 'Dados estáticos de saldo ou carteira PIX/DREX simulando liquidação bancária'
  },
  {
    regex: /balance_limit:\s*\d+.*pix:\s*['"][^'"]+['"]/i,
    description: 'Assinatura clássica do mock de carteiras (INC-001 / INC-003)'
  },
  {
    regex: /(?:settleDrex|processPix|executeTransfer)[\s\S]*?\{[\s\S]*?return\s*\{[\s\S]*?success:\s*true/i,
    description: 'Função de liquidação financeira com retorno estático fictício (LLM Theater)'
  }
];

/**
 * Identifica se o caminho pertence ao escopo de testes / fixtures ou se é implementação de produção.
 */
export function classifyFilePath(filePath: string): { isProduction: boolean; isTestOrFixture: boolean } {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  
  const isTestOrFixture = 
    normalized.includes('/tests/') ||
    normalized.includes('/test/') ||
    normalized.includes('/fixtures/') ||
    normalized.includes('/__tests__/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.tsx') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.tsx') ||
    normalized.includes('mock');

  const isProduction = !isTestOrFixture && (
    normalized.startsWith('src/') ||
    normalized.startsWith('/src/') ||
    normalized.includes('/src/')
  );

  return { isProduction, isTestOrFixture };
}

/**
 * Verifica se o conteúdo do arquivo toca em algum domínio protegido P0.
 */
export function detectP0Domains(content: string): P0Domain[] {
  const detected: P0Domain[] = [];
  const lower = content.toLowerCase();

  for (const domain of P0_PROTECTED_DOMAINS) {
    const regex = new RegExp(`\\b${domain}\\b`, 'i');
    if (regex.test(lower)) {
      detected.push(domain);
    }
  }

  return detected;
}

/**
 * Audita um arquivo individual sob a regra do DELIVERABLE-TRUTH GATE.
 */
export function auditFileForDeliverableTruth(filePath: string, content: string): GateFileReport {
  const { isProduction, isTestOrFixture } = classifyFilePath(filePath);
  const touchesP0Domains = detectP0Domains(content);
  const violations: P0Violation[] = [];

  // Se é código de produção e toca em domínios protegidos P0, avalia se há mock escapando
  if (isProduction && touchesP0Domains.length > 0) {
    for (const pattern of FORBIDDEN_PRODUCTION_MOCK_PATTERNS) {
      if (pattern.regex.test(content)) {
        // Encontra qual domínio P0 foi violado
        const domain = touchesP0Domains.find(d => pattern.description.toLowerCase().includes(d)) || touchesP0Domains[0];
        violations.push({
          file: filePath,
          domain,
          matchedPattern: pattern.regex.source,
          severity: 'P0',
          description: pattern.description
        });
      }
    }
  }

  return {
    filePath,
    isProduction,
    isTestOrFixture,
    touchesP0Domains,
    violations
  };
}

/**
 * Avalia o conjunto de arquivos sob o DELIVERABLE-TRUTH GATE.
 */
export function evaluateDeliverableTruth(files: Array<{ path: string; content: string }>): DeliverableTruthResult {
  const allViolations: P0Violation[] = [];
  const coveredDomains = new Set<P0Domain>();
  let totalFilesAudited = 0;

  for (const file of files) {
    totalFilesAudited++;
    const report = auditFileForDeliverableTruth(file.path, file.content);
    report.touchesP0Domains.forEach(d => coveredDomains.add(d));
    if (report.violations.length > 0) {
      allViolations.push(...report.violations);
    }
  }

  const isFail = allViolations.length > 0;
  const status: DeliverableTruthResult['status'] = isFail ? 'P0_INCIDENT_FAIL' : 'COMPLIANCE_PASS';

  const rawEvidence = `${status}:${allViolations.length}:${Array.from(coveredDomains).sort().join(',')}`;
  const evidenceHash = `sha256:${createHash('sha256').update(rawEvidence).digest('hex')}`;

  return {
    status,
    timestamp: new Date().toISOString(),
    protectedDomainsCovered: Array.from(coveredDomains),
    totalFilesAudited,
    p0Violations: allViolations,
    agentBlocked: isFail,
    evidenceHash
  };
}

/**
 * REGRA VINCULANTE 7 DO GOS3:
 * "Nenhum agente pode declarar PASS, implemented, complete, production-ready ou equivalente
 * quando o entregável estiver bloqueado por DELIVERABLE-TRUTH, mesmo que compilação e testes convencionais passem."
 */
export function assertCanDeclarePass(claim: string, gateResult: DeliverableTruthResult): void {
  const normalizedClaim = claim.toLowerCase();
  const claimsSuccess = [
    'pass',
    'implemented',
    'complete',
    'production-ready',
    'pronto para produção',
    'sucesso'
  ].some(term => normalizedClaim.includes(term));

  if (claimsSuccess && gateResult.status === 'P0_INCIDENT_FAIL') {
    throw new DeliverableTruthViolationError(
      `[REGRA 7 VINCULANTE VIOLADA]: O agente tentou declarar "${claim}", mas o entregável está BLOQUEADO com status P0_INCIDENT_FAIL pelo DELIVERABLE-TRUTH GATE. Há ${gateResult.p0Violations.length} violação(ões) P0 ativa(s).`,
      gateResult.p0Violations
    );
  }
}

/**
 * Protocolo de Resolução de Erro em Domínio Soberano / Mock:
 * "Mexeu → Achou Erro → Conserta" (CORRECTION REQUIRED).
 */
export function evaluateRefactoringDecision(params: {
  detectedMock: boolean;
  consumersCount: number;
  tscPassed: boolean;
  actionProposed: 'DELETE_AND_RECREATE_ON_TSC_FAIL' | 'CORRECTION_REQUIRED' | 'MIGRATE_AND_FIX';
}): {
  allowed: boolean;
  reason: string;
  nextStep: 'BLOCK' | 'PROCEED' | 'MIGRATE';
} {
  if (params.actionProposed === 'DELETE_AND_RECREATE_ON_TSC_FAIL') {
    return {
      allowed: false,
      reason: 'Violação estrita: Recriar mock falso para fazer o TypeScript passar é antipadrão P0. A descoberta de erro inicia ciclo de correção.',
      nextStep: 'BLOCK'
    };
  }

  if (params.detectedMock && params.consumersCount > 0 && !params.tscPassed) {
    return {
      allowed: true,
      reason: 'CORRECTION REQUIRED: Consumidores quebrados devem ser limpos ou migrados para implementação real.',
      nextStep: 'MIGRATE'
    };
  }

  return {
    allowed: true,
    reason: 'Decisão em conformidade com o ciclo de entrega de verdade soberana.',
    nextStep: 'PROCEED'
  };
}
