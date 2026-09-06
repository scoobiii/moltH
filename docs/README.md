> **GOS3** · agente: `SeniorOpsScrum / Claude / Gemini` · papel: `Lead Architect & Documentation Master` (ver docs/team.md)
> fase: `Norma Vinculante GOS3 — DELIVERABLE-TRUTH GATE & Domínios Protegidos P0 (v1.5)` · data: `2026-09-06` · hora: `12:15:00 UTC`
> antes: Índice de documentação com versionamento v1.2
> depois: Índice geral completo e versionado no padrão GOS3 v1.5 com referências a ADR-004, ADR-005, ADR-006 e Deliverable Truth Gate
> base: commit `gos3-core-v1.5`
> assinatura: `SeniorOpsScrum & Gemini · Documentation Master · GOS3`

# Vortex / Molt Hybrid Hub — Documentação & Histórico (GOS3 v1.5)

Este diretório armazena todo o repositório documental, especificações do protocolo GOS3, histórico de conversações, auditorias de telemetria e runbooks operacionais.

---

## 📂 Estrutura Canônica de Documentos

```
docs/
├── README.md                                  # Este índice geral e guia de navegação
├── GOS3-SPECIFICATION.md                      # Especificação Formal do Protocolo GOS3 v1.0 / v1.5
├── CHANGELOG.md                               # Histórico completo de versões (v1.0.0 a v1.5.0)
├── PLAYBOOK.md                                # Regras, convenções e merge gates do time NxN
├── RUNBOOK.md                                 # Runbook de Inicialização Segura (Termux / Alpine / Docker)
├── BACKLOG.md                                 # Backlog e status dos sprints (Sprints 1 a 5 Concluídos)
├── team.md                                    # Mapa oficial dos Agentes GOS3 e Runtime References
├── decisions.md                               # Registro de Decisões Arquiteturais (ADR-001 a ADR-006)
├── ADR-004-BRANCH-PROTECTION-CI-GATE.md       # ADR-004 Trava Obrigatória de Branch Protection via Prova Criptográfica de CI
├── ADR-006-DELIVERABLE-TRUTH-GATE.md          # ADR-006 DELIVERABLE-TRUTH GATE, Domínios P0 (DREX/PIX) e Regra 7
├── incidents.md                               # Post-mortems e auditorias (INC-001, INC-002, INC-003 Mock Zumbi & Loop Reativo)
├── SWOT-UX-GUI.md                             # Auditoria SWOT de Engenharia e Nota de Resiliência (3,0 / 3,0)
├── conversations/                             # Registros completos e transcrições de auditorias
│   ├── 01-auditoria-sandbox-telemetria.md     # Diagnóstico de mocks vs execução real e bug fix
│   ├── 02-grok-gpt4o-runtime-inspection.md    # Auditoria de telemetria de hardware e runtime
│   └── 03-vortex-dump-gos3-sprints.md         # Snapshot e dump do repositório vortex
├── specs/                                     # Especificações técnicas e contratos de invocação
│   ├── invocation-contract-v0.1.md            # Especificação v0.1 implementada
│   ├── invocation-contract-v0.2-draft.md      # Proposta v0.2 de timeout e IO
│   ├── invocation-contract-v0.3-draft.md      # Proposta v0.3 com Zero Fake Provider Guard
│   ├── pattern-external-url-access.md         # Diretriz de handoff canônico e bloqueio de links de terceiros
│   └── system-instruction-anti-fabricacao-v1.0.md # Bloco canônico unificado anti-fabricação
└── attachments/                               # Registro de anexos, diagramas e screenshots
    ├── Screenshot_20260816_232129_Chrome.md   # Registro e análise do screenshot da UI
    └── use-vortex-cover.md                    # Manifesto e capa USE VORTEX!
```

---

## 🛡️ Princípios Inegociáveis (GOS3 Standard)

1. **Hash + Tempo + Log**: Nenhuma alegação de execução sem recibo de processo real (`exit_code`, `stdout_raw`, SHA-256 `evidenceHash`).
2. **Zero Simulação Oculta & Zero Fake Provider**: Falhas de infraestrutura, ausência de credenciais ou simulações locais reportam categoricamente `status: "auth_required"`, `claim: "not_executed"` ou `provider: "local_simulation"`.
3. **Isolamento Nx1 + Estado NxN**: Cada agente roda no seu próprio runtime confinado (V8 VM / subprocesso dedicado) com pipes auditáveis e persistência atômica SQLite WAL.




## Atualização 2026-08-30 — Sprint 0

O documento canônico do Sprint 0 está em [`SPRINT-0-VORTEX-CONTRACT.md`](SPRINT-0-VORTEX-CONTRACT.md). A especificação normativa atualizada está em [`specs/invocation-contract-v0.1.md`](specs/invocation-contract-v0.1.md). O contrato é implementado em `../src/server/vortexContract.ts`, com testes em `../src/server/vortexContract.sprint0.test.ts` e gate interoperável em `../tests/contract_test.py`.

Os endpoints read-only de validação são `POST /api/gos3/contract/request/validate` e `POST /api/gos3/contract/receipt/validate`. O Sprint 0 não altera as alegações de produção, autenticação federada, Lean/Z3, K6 externo ou runtime remoto; essas capacidades continuam sujeitas a validação própria.

---

## Atualização 2026-09-06 — ADR-006 & DELIVERABLE-TRUTH GATE (v1.5)

A norma vinculante ADR-006 está em [`ADR-006-DELIVERABLE-TRUTH-GATE.md`](ADR-006-DELIVERABLE-TRUTH-GATE.md). Ela define o DELIVERABLE-TRUTH GATE algorítmico (`scripts/deliverable_truth_gate.py` e `src/lib/deliverableTruthGate.ts`), a proteção mandatória de domínios P0 (financeiro, carteiras, DREX, PIX), a Regra Vinculante 7 e o princípio "Mexeu → Achou Erro → Conserta". O post-mortem do mock zumbi de carteira e loop reativo está documentado em [`incidents.md`](incidents.md) sob o identificador **INC-003**.

