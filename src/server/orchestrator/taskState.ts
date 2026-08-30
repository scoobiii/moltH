/**
 * GOS3 Multi-Agent Task State Machine & Transactional Context
 * Spec: GOS3 Contract v1.0 / Zero Simulation Architecture
 */

import { createHash } from 'crypto';

export type TaskStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'EXECUTING'
  | 'HANDOFF_PENDING'
  | 'GATED'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'HUMAN_REVIEW_REQUIRED';

export interface EvidenceChainLink {
  stepIndex: number;
  agentId: string;
  agentHandle: string;
  toolName: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  previousEvidenceHash: string | null;
  currentEvidenceHash: string;
  timestamp: string;
}

export interface TaskStep {
  stepId: string;
  assignedAgentId: string;
  assignedAgentHandle: string;
  instruction: string;
  expectedTool: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  evidence?: EvidenceChainLink;
  outputPayload?: Record<string, any>;
  errorMessage?: string;
}

export interface MultiAgentTask {
  id: string;
  title: string;
  description: string;
  initiator: {
    id: string;
    handle: string;
    type: 'human' | 'agent';
  };
  status: TaskStatus;
  currentStepIndex: number;
  steps: TaskStep[];
  sharedMemory: Record<string, any>;
  evidenceChain: EvidenceChainLink[];
  rootEvidenceHash?: string;
  finalEvidenceHash?: string;
  createdAt: string;
  updatedAt: string;
  maxRetriesPerStep: number;
  currentRetryCount: number;
  gateResult?: {
    status: 'PASS' | 'FAIL' | 'BLOCKED';
    evaluatedAt: string;
    checks: {
      allExitCodesZero: boolean;
      evidenceChainIntact: boolean;
      allExpectedToolsExecuted: boolean;
      zeroSimulationVerified: boolean;
    };
    reason?: string;
  };
}

/**
 * Calculates deterministic SHA-256 evidence hash conforming to GOS3 v1.0 standard
 */
export function computeGOS3EvidenceHash(params: {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  previousHash?: string | null;
}): string {
  const payload = [
    params.stdout.trim(),
    params.stderr.trim(),
    params.exitCode.toString(),
    Math.round(params.durationMs).toString(),
    params.previousHash || 'ROOT_GENESIS_HASH'
  ].join(':::');

  return '0x' + createHash('sha256').update(payload).digest('hex');
}

/**
 * Verifies if an entire evidence chain is cryptographically continuous and un-tampered
 */
export function verifyEvidenceChain(chain: EvidenceChainLink[]): {
  isValid: boolean;
  brokenStepIndex?: number;
  reason?: string;
} {
  if (chain.length === 0) {
    return { isValid: true };
  }

  let previousHash: string | null = null;

  for (let i = 0; i < chain.length; i++) {
    const link = chain[i];

    if (link.previousEvidenceHash !== previousHash) {
      return {
        isValid: false,
        brokenStepIndex: i,
        reason: `Broken chain link at step ${i}: previous hash mismatch (expected ${previousHash}, got ${link.previousEvidenceHash})`
      };
    }

    const recomputed = computeGOS3EvidenceHash({
      stdout: link.stdout,
      stderr: link.stderr,
      exitCode: link.exitCode,
      durationMs: link.durationMs,
      previousHash: link.previousEvidenceHash
    });

    if (recomputed !== link.currentEvidenceHash) {
      return {
        isValid: false,
        brokenStepIndex: i,
        reason: `Tampered hash at step ${i}: recalculated ${recomputed} !== link ${link.currentEvidenceHash}`
      };
    }

    previousHash = link.currentEvidenceHash;
  }

  return { isValid: true };
}
