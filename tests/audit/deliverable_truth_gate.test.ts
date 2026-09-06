import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  P0_PROTECTED_DOMAINS,
  classifyFilePath,
  detectP0Domains,
  auditFileForDeliverableTruth,
  evaluateDeliverableTruth,
  assertCanDeclarePass,
  evaluateRefactoringDecision,
  DeliverableTruthViolationError
} from '../../src/lib/deliverableTruthGate';

describe('GOS3 DELIVERABLE-TRUTH GATE — Domínios Protegidos P0 & Regra 7', () => {
  it('reconhece todos os domínios protegidos P0 incluindo DREX, PIX e Liquidação', () => {
    const required = [
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
    ];

    for (const req of required) {
      expect(P0_PROTECTED_DOMAINS).toContain(req);
    }
  });

  it('diferencia rigorosamente TEST FIXTURE / MOCK de PRODUCTION IMPLEMENTATION', () => {
    const testFile = classifyFilePath('tests/fixtures/mockBankWallet.ts');
    expect(testFile.isTestOrFixture).toBe(true);
    expect(testFile.isProduction).toBe(false);

    const prodFile = classifyFilePath('src/server/security/settlementEngine.ts');
    expect(prodFile.isTestOrFixture).toBe(false);
    expect(prodFile.isProduction).toBe(true);
  });

  it('permite dados de mock/fixture dentro da pasta tests/ sem gerar violação P0', () => {
    const fixtureContent = `
      export const mockWallet = {
        pix: 'test@fixture.internal',
        drex_wallet: '0x1234567890abcdef1234567890abcdef12345678',
        balance: 1000
      };
    `;
    const report = auditFileForDeliverableTruth('tests/mocks/pixFixture.ts', fixtureContent);
    expect(report.isTestOrFixture).toBe(true);
    expect(report.violations.length).toBe(0);
  });

  it('detecta e bloqueia mock de PIX e DREX quando colocado em arquivo de produção', () => {
    const badProductionCode = `
      export const fakeWallet = {
        pix: 'bi@molth',
        balance_limit: 4000
      };
    `;
    const report = auditFileForDeliverableTruth('src/server/security/badVault.ts', badProductionCode);
    expect(report.isProduction).toBe(true);
    expect(report.violations.length).toBeGreaterThan(0);
    expect(report.violations[0].severity).toBe('P0');
  });

  it('detecta e bloqueia liquidação simulada de DREX sem contrato real em produção', () => {
    const mockDrexSettlement = `
      export const settleDrex = async (amount: number): Promise<{ success: boolean }> => {
        return { success: true, balance: amount };
      };
    `;
    const report = auditFileForDeliverableTruth('src/lib/drexSettlement.ts', mockDrexSettlement);
    expect(report.violations.length).toBeGreaterThan(0);
  });

  it('bloqueia o agente e gera status P0_INCIDENT_FAIL se mock financeiro escapar para src/', () => {
    const files = [
      {
        path: 'src/lib/fakePayment.ts',
        content: `export const mockPayment = { pix: "user@bank.com", balance: 500 };`
      }
    ];

    const result = evaluateDeliverableTruth(files);
    expect(result.status).toBe('P0_INCIDENT_FAIL');
    expect(result.agentBlocked).toBe(true);
    expect(result.p0Violations.length).toBeGreaterThan(0);
  });

  it('aplica a REGRA 7 VINCULANTE: impede declaração de PASS se bloqueado por DELIVERABLE-TRUTH', () => {
    const failedGate = evaluateDeliverableTruth([
      {
        path: 'src/server/security/compromisedVault.ts',
        content: `export const mockWallet = { pix: "bad@domain", balance: 100 };`
      }
    ]);

    expect(failedGate.status).toBe('P0_INCIDENT_FAIL');

    // Tentativa de declarar sucesso/PASS deve disparar erro fatal
    expect(() => {
      assertCanDeclarePass('PASS - Todos os testes de compilação passaram', failedGate);
    }).toThrow(DeliverableTruthViolationError);

    expect(() => {
      assertCanDeclarePass('Sistema production-ready implementado', failedGate);
    }).toThrow(DeliverableTruthViolationError);
  });

  it('permite declaração de PASS apenas quando COMPLIANCE_PASS for atingido', () => {
    const passedGate = evaluateDeliverableTruth([
      {
        path: 'src/lib/sovereignVault.ts',
        content: `export function sealEnvelope(payload: unknown) { return { runtime_id: '427273fd' }; }`
      }
    ]);

    expect(passedGate.status).toBe('COMPLIANCE_PASS');
    expect(() => {
      assertCanDeclarePass('PASS - Código verificado', passedGate);
    }).not.toThrow();
  });

  it('reprova o padrão de recriar mock após tsc FAIL e valida a regra MEXEU -> ACHOU ERRO -> CONSERTA', () => {
    // Caso 1: O comportamento do agente lambanceiro (recriar para calar o tsc)
    const badDecision = evaluateRefactoringDecision({
      detectedMock: true,
      consumersCount: 2,
      tscPassed: false,
      actionProposed: 'DELETE_AND_RECREATE_ON_TSC_FAIL'
    });
    expect(badDecision.allowed).toBe(false);
    expect(badDecision.nextStep).toBe('BLOCK');

    // Caso 2: O comportamento canônico CORRECTION REQUIRED
    const correctDecision = evaluateRefactoringDecision({
      detectedMock: true,
      consumersCount: 2,
      tscPassed: false,
      actionProposed: 'CORRECTION_REQUIRED'
    });
    expect(correctDecision.allowed).toBe(true);
    expect(correctDecision.nextStep).toBe('MIGRATE');
  });

  it('audita os arquivos de produção atuais em src/ e certifica COMPLIANCE_PASS real', () => {
    function getAllFiles(dir: string): string[] {
      const results: string[] = [];
      const list = readdirSync(dir);
      for (const file of list) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...getAllFiles(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const prodFiles = getAllFiles('src').map(path => ({
      path,
      content: readFileSync(path, 'utf8')
    }));

    const result = evaluateDeliverableTruth(prodFiles);
    expect(result.status).toBe('COMPLIANCE_PASS');
    expect(result.agentBlocked).toBe(false);
    expect(result.p0Violations.length).toBe(0);
    expect(result.evidenceHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});
