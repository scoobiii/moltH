> **GOS3** · agente: `Vortex / EnforcementGate` · papel: `Protocol Governance` (ver docs/team.md)
> fase: `Governança e Blindagem de Repositório` · data: `2026-09-06` · hora: `UTC`
> antes: Playbook tinha Merge Gates e Zero Fake Provider, sem enforcement operacional P0
> depois: Playbook define bloqueio, correção, revisão independente e DREX P0
> base: branch `feat/vortex-enforcement-gate-drex`
> assinatura: `Vortex / EnforcementGate · Protocol Governance · GOS3`

# PLAYBOOK — Vortex / GOS3 Protocol Standards

## 1. Governança de Mudanças em Contrato & Segurança

Qualquer alteração em contrato, segurança, isolamento ou execução é governada pelo Vortex Enforcement Gate e não pode ser liberada por declaração da LLM.

## 2. Cabeçalho GOS3 Obrigatório

Todo arquivo criado ou editado por agente no ecossistema GOS3 deve conter o cabeçalho GOS3 correspondente.

## 3. Prova de Execução & Zero Fake Provider

Se executou: capturar `exit_code`, `stdout_raw`, `executionTimeMs` e gerar evidência SHA-256. Se não executou: `executed: false`. Ausência de credencial externa nunca pode ser apresentada como provedor real.

## 4. Enforcement Imperativo — MEXEU → ACHOU ERRO → CONSERTA

O Vortex deve classificar e controlar `CREATE`, `EDIT`, `DELETE`, `MOVE`, `RENAME`, `REPLACE`, `EXECUTE`, `PUBLISH` e `MERGE`.

A LLM propõe; o Vortex decide se a ação pode avançar. Em `BLOCK`, o runtime preserva o estado, registra a violação e fornece as ações de correção permitidas. Não existe bypass por insistência, reformulação do prompt ou nova chamada sem correção.

## 5. P0 Security / Financial / DREX

`DREX`, `PIX`, `wallet`, `payment`, `banking`, `settlement`, `financial`, `balance`, `account`, `money`, `secret`, `credential`, `authentication`, `authorization` e `security` são tratados como P0 quando atingem implementação ou fluxo de produção.

P0 exige runtime evidence + testes + revisão independente + aprovação humana antes de publicação em `main`.

## 6. Zero Mock Escape

Mocks/fixtures/simulations são permitidos apenas quando confinados ao escopo de teste. Mock, fake, simulation ou stub usado como implementação de produção é bloqueado.

**Teste com mock não prova implementação real.**

## 7. Operações Destrutivas

`DELETE`, `MOVE`, `RENAME` e `REPLACE` exigem análise de consumidores, imports, contratos e testes afetados. Se dependência não estiver resolvida, bloquear.

## 8. Falha, Incidente e Quarentena

Violação P0:

`INCIDENT → BLOCK/QUARANTINE → CORRECTION → INDEPENDENT REVIEW → CI → COMPLIANCE PASS → HUMAN APPROVAL → MAIN`

A memória do incidente fica no estado do Vortex/GOS3, não na memória presumida da LLM.

## 9. Merge Gates

O Green-to-Main continua obrigatório: lint/TypeScript, build, testes canônicos, testes determinísticos, Contract Gate, Enforcement Gate e evidência verificável. O CI atual executa as verificações técnicas existentes e o novo gate de deliverable truth. 

## 10. Regra de verdade

Se o resultado não puder ser observado pelo runtime/verificador, declarar `not_verified`; nunca PASS.

LLM não é autoridade de execução, segurança, completude ou publicação.
