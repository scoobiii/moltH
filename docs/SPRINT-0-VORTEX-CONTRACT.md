> **GOS3** · agente: `Manus AI` · papel: `Engineering Agent / Protocol Maintainer`
> fase: `Sprint 0 — Vortex Contract Foundation` · data: `2026-08-30` · hora: `UTC`
> antes: `invocation-contract-v0.1` divergente entre TypeScript, Python e documentação
> depois: contrato v0.1 canônico com request, receipt, evidence_hash, runtime_id e gates HTTP/automáticos
> base: commit local da branch `feat/sprint0-vortex-contract`
> assinatura: `Manus AI · Engineering Agent · GOS3`

# Sprint 0 — Vortex GOS3 Contract Foundation

## Objetivo

O Sprint 0 estabelece o contrato mínimo compartilhado entre o Vortex GOS3 e o moltH. Ele padroniza o pedido de invocação, o recibo de execução, a identificação do runtime e a evidência criptográfica. O sprint não implementa novos agentes, não cria um sandbox remoto e não transforma fallback local em provider externo.

## Decisão canônica

O moltH usa o contrato **GOS3 v0.1** do Vortex como envelope de interoperabilidade. O Vortex continua sendo a autoridade de contrato e governança; o moltH continua sendo o control plane e o produto que executa agentes, ferramentas e conectores.

### Request

```json
{
  "contract_version": "v0.1",
  "invocation_id": "inv-sprint0-001",
  "agent": "moltH-agent",
  "task": {
    "kind": "code_exec | shell | tool_call | llm_inference",
    "payload": "string",
    "language": "typescript"
  },
  "limits": {
    "timeout_seconds": 15,
    "max_output_bytes": 65536
  },
  "context_ref": "thread-or-backlog-id",
  "env_tag": "node-linux"
}
```

O request é validado antes de qualquer execução. `task.payload` é opaco ao contrato; a autorização e o isolamento pertencem ao executor responsável.

### Receipt

```json
{
  "contract_version": "v0.1",
  "invocation_id": "inv-sprint0-001",
  "agent": "moltH-agent",
  "executed": true,
  "status": "success | failed | error | partial | timeout | auth_required",
  "output": {
    "stdout": "ok\n",
    "stderr": "",
    "exit_code": 0
  },
  "duration_ms": 7,
  "truncated": false,
  "runtime_id": "sha256-64-lowercase-hex",
  "evidence_hash": "sha256-64-lowercase-hex"
}
```

## Hash de evidência

A fórmula canônica é:

```text
sha256(stdout + stderr + String(exit_code | "null") + String(duration_ms))
```

O hash é calculado sobre a saída efetivamente recebida, o erro efetivamente recebido, o código de saída e a duração medida. O consumidor deve rejeitar hash ausente, hash não hexadecimal lowercase, hash forjado ou envelope com campos inconsistentes.

## Regras de status

`status: "success"` exige `executed: true`. `status: "auth_required"`, `"timeout"` ou `"error"` não podem alegar execução concluída. Uma ferramenta pode ter `executed: true` e `status: "failed"` quando realmente iniciou e terminou com erro operacional; isso é diferente de uma recusa pré-execução.

`runtime_id` deve ser um SHA-256 lowercase de 64 caracteres que identifique a instância, ambiente, arquitetura e processo que produziram a prova. O identificador não significa que o runtime é seguro por si só; ele permite correlacionar a prova com o ambiente real.

## Implementação no moltH

A implementação vive em `src/server/vortexContract.ts` e inclui:

1. `GOS3InvocationRequest` e `validateInvocationRequest` para validar pedidos.
2. `GOS3ContractEnvelope` e `buildContractEnvelope` para construir receipts.
3. `computeEvidenceHash` para manter TypeScript e Python interoperáveis.
4. `validateContractEnvelope` para rejeitar inconsistências de campos, status, hash e runtime.
5. `POST /api/gos3/contract/request/validate` como gate HTTP read-only.
6. `POST /api/gos3/contract/receipt/validate` como gate HTTP read-only.

## Testes e critérios de aceite

```bash
npm run lint
npm run test:sprint0
npm run test:vitest
npm run build
python3 tests/contract_test.py
npx tsx tests/contract_gate.test.ts
```

Os testes devem cobrir request válido e inválido, receipt válido, hash forjado, runtime_id ausente/inválido, `auth_required` honesto e falso `success` com `executed:false`. O Sprint 0 é considerado concluído quando lint, build, gate TypeScript, gate Python e a suíte Sprint 0 passam.

## Fora do escopo

O Sprint 0 não prova Lean 4/Z3 real, não garante autenticação federada, não substitui E2E, não instala K6/Docker e não publica alterações no GitHub. Conectores sem credencial devem retornar `auth_required`/`not_executed`; nenhum fallback pode ser rotulado como provider externo.

## Relação com o Vortex

A divisão adotada é: **Vortex** mantém contrato, gate, ADRs e critérios de proveniência; **moltH** mantém UI, autenticação, control plane, agentes, storage, conectores e runtimes; **yAI** fornece landing, branding e onboarding. [1] [2]

## Referências

[1]: https://github.com/scoobiii/vortex/blob/main/docs/architecture-runtime-connectors.md "Vortex — Arquitetura de runtime e conectores"
[2]: https://github.com/scoobiii/vortex/blob/main/docs/decisions.md "Vortex — ADR-005 Runtime Federation + Provenance"
