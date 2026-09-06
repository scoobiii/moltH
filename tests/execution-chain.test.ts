/**
 * GOS3 Execution Chain — espelho TypeScript (vitest) do rash de execução.
 *
 * Espelha execution_chain.py: cada passo referencia o hash do anterior
 * (prev_hash), o genesis carrega goal_hash (amarrando a execução ao que foi
 * pedido), e o task_rash é o hash do último elo.
 *
 * Este teste verifica de forma INDEPENDENTE uma cadeia gerada no outro
 * runtime: lê chain_fixture.json (produzido pelo lado Python) e recomputa
 * tudo. Se passar, a interoperabilidade do rash está provada.
 *
 * Uso: npx vitest run tests/execution-chain.test.ts
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENESIS_PREV = '0'.repeat(64);

export interface ChainRecord {
  seq: number;
  prev_hash: string;
  invocation_id: string;
  runtime_id: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  evidence_hash: string;
  timestamp_iso: string;
  record_hash: string;
  goal_hash?: string;
  goal?: string;
}

export function sha256Hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

export function evidenceHash(stdout: string, stderr: string, exitCode: number, durationMs: number): string {
  return sha256Hex(`${stdout}\n${stderr}\n${exitCode}\n${durationMs}`);
}

export function recordHash(rec: ChainRecord): string {
  const canonical = [
    String(rec.seq),
    rec.prev_hash,
    rec.invocation_id,
    rec.runtime_id,
    rec.stdout,
    rec.stderr,
    String(rec.exit_code),
    String(rec.duration_ms),
    rec.evidence_hash,
    rec.timestamp_iso,
  ].join('\n');
  return sha256Hex(canonical);
}

/** Verificador independente — não confia, recomputa. Espelho do R7 do gate. */
export function verifyChain(records: ChainRecord[]): { ok: boolean; reason: string } {
  if (records.length === 0) return { ok: false, reason: 'cadeia vazia' };
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.record_hash !== recordHash(rec))
      return { ok: false, reason: `elo ${i}: record_hash não confere` };
    if (i > 0 && rec.prev_hash !== records[i - 1].record_hash)
      return { ok: false, reason: `elo ${i}: prev_hash quebrado` };
    if (i > 0 && evidenceHash(rec.stdout, rec.stderr, rec.exit_code, rec.duration_ms) !== rec.evidence_hash)
      return { ok: false, reason: `elo ${i}: evidence_hash divergente` };
    if (!rec.runtime_id) return { ok: false, reason: `elo ${i}: sem runtime_id` };
  }
  if (records[0].prev_hash !== GENESIS_PREV)
    return { ok: false, reason: 'genesis adulterado' };
  return { ok: true, reason: 'cadeia íntegra' };
}

export function taskRash(records: ChainRecord[]): string {
  return records[records.length - 1].record_hash;
}

const fixture: ChainRecord[] = JSON.parse(
  readFileSync(join(__dirname, 'chain_fixture.json'), 'utf8'),
);

describe('GOS3 execution chain interop (moltH × Vortex)', () => {
  it('verifica de forma independente a cadeia gerada no outro runtime', () => {
    const r = verifyChain(fixture);
    expect(r.ok).toBe(true);
  });

  it('task_rash recomputado coincide com o elo final', () => {
    expect(taskRash(fixture)).toBe(fixture[fixture.length - 1].record_hash);
  });

  it('detecta adulteração de stdout em qualquer elo', () => {
    const tampered = JSON.parse(JSON.stringify(fixture)) as ChainRecord[];
    tampered[2].stdout += ' (editado)';
    expect(verifyChain(tampered).ok).toBe(false);
  });

  it('detecta quebra de prev_hash (remoção de passo)', () => {
    const cut = JSON.parse(JSON.stringify(fixture)) as ChainRecord[];
    cut.splice(2, 1); // remove um passo do meio sem reencadear
    expect(verifyChain(cut).ok).toBe(false);
  });

  it('goal_hash do genesis amarra a cadeia ao objetivo pedido', () => {
    expect(fixture[0].goal_hash).toBe(sha256Hex(fixture[0].goal as string));
  });
});
