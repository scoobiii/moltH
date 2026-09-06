> **GOS3** · agente: `Vortex / EnforcementGate` · papel: `Architecture Decision Records & Governance` (ver docs/team.md)
> fase: `Governança e Blindagem de Repositório` · data: `2026-09-06` · hora: `UTC`
> antes: ADR-004 definia CI verde e evidence_hash, sem enforcement dedicado de deliverable truth
> depois: ADR-004 vincula Vortex Enforcement, DREX/financeiro P0, mock escape, revisão independente e aprovação humana
> base: commit `feat/vortex-enforcement-gate-drex`
> assinatura: `Vortex / EnforcementGate · Architecture Decision Records & Governance · GOS3`

# ADR-004: Trava Obrigatória de Branch Protection via Prova Criptográfica de CI (Green-to-Main Gate)

## 1. Status
**APROVADO E VINCULANTE**  
Aplica-se universalmente a todos os agentes autônomos e operadores humanos trabalhando em qualquer branch ou repositório do ecossistema GOS3 / moltH / Vortex.

## 2. Contexto e Motivação

O princípio basilar da governança GOS3 é:
> **"LLM propõe; sandbox executa; evidência prova; GOS3 decide."**

Relato em linguagem natural de uma LLM não é evidência. CI verde também não autoriza uma implementação que esteja semanticamente falsa, simulada ou incompleta.

## 3. Cláusulas Vinculantes

### Cláusula 1: Portão Inegociável de CI Verde (Green-to-Main)
Nenhuma proposição de código pode ingressar em `main` sem TypeScript/lint sem erros, suíte canônica verde, suites determinísticas específicas e build de produção verde.

### Cláusula 2: Prova Criptográfica (`evidence_hash`)
Toda aprovação de integração deve registrar prova derivada da execução real. O hash canônico é:

`evidence_hash = sha256(stdout + stderr + exit_code + duration_ms)`

A evidência deve vincular runtime, agente, timestamp e resumo dos testes. Uma string fornecida pela LLM não constitui prova.

### Cláusula 3: Vetos Expressos (Zero Bypass)
São proibidos force push, `--no-verify`, exclusão/mascaramento de testes, enfraquecimento de assertions e merge humano sem CI verde e evidência.

### Cláusula 4: Rollback
Quebra constatada após integração exige interrupção e `git revert` antes de nova atividade de desenvolvimento.

## 4. Enforcement Vortex — Deliverable Truth

A partir desta alteração, CI não é somente um compilador: ele é também um **enforcement gate**. A LLM não possui autoridade para declarar PASS, execução, completude ou produção.

Toda operação `CREATE`, `EDIT`, `DELETE`, `MOVE`, `RENAME`, `REPLACE`, `EXECUTE`, `PUBLISH` ou `MERGE` pode ser classificada pelo Vortex e bloqueada.

Decisões possíveis:

`ALLOW | BLOCK | REQUIRE_REVIEW | REQUIRE_HUMAN_APPROVAL | QUARANTINE`

Regra operacional vinculante:

> **MEXEU → ACHOU ERRO → CONSERTA.**

Uma violação não pode ser contornada apagando, renomeando, movendo ou alterando o teste que a revelou.

## 5. P0 — Security / Financial / DREX

São P0, no mínimo:

- DREX;
- PIX;
- wallet;
- payment/banking/settlement;
- financial/balance/account/money;
- secret/credential/authentication/authorization;
- security.

Alterações P0 exigem runtime evidence, testes afetados, revisão independente e aprovação humana antes de `main`.

## 6. Zero Mock Escape

Mocks, fixtures e simulations são permitidos quando explicitamente confinados ao escopo de teste e identificados como tal. Um mock/fake/simulation/stub utilizado como implementação de produção é violação P0 e deve gerar `BLOCK`.

A existência de um teste que usa mock não prova que a implementação de produção é real.

## 7. Falha e Quarentena

Quando o enforcement falhar:

`INCIDENT → BLOCK/QUARANTINE → CORRECTION → INDEPENDENT REVIEW → CI → COMPLIANCE PASS → HUMAN APPROVAL → MAIN`

O estado do incidente deve permanecer externo à LLM. A LLM recebe o erro, as condições de correção e as ações permitidas para a próxima etapa.

## 8. Não-autodeclaração de PASS

Nenhuma LLM ou agente executor pode declarar `PASS`, `implemented`, `executed`, `complete` ou `production-ready` como autoridade final. Essas propriedades precisam ser determinadas por runtime, verificadores, CI e governança.

## 9. Matriz de Conformidade

| Gate | Critério |
|---|---|
| L1 Static | TypeScript/lint exit 0 |
| L2 Unit/Contract | 100% das suítes requeridas verdes |
| L3 Enforcement | nenhum P0/mocking escape não resolvido |
| L4 Evidence | evidência produzida pelo runtime |
| L5 Independent Review | obrigatório para P0 |
| L6 Human Approval | obrigatório para P0 antes de main |
| L7 Audit Trail | incidente/evidence vinculados à alteração |

## 10. Relação com Outras Normas

- ADR-002: Zero Simulação.
- ADR-003: Runtime ID.
- `docs/GIT-POLICY.md`: publicação fail-closed.
- `docs/PLAYBOOK.md`: processo operacional e correção obrigatória.
