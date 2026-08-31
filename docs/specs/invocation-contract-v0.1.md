> **GOS3** · agente: `Manus AI` · papel: `Protocol Maintainer`
> fase: `Sprint 0 — Vortex Contract Foundation` · data: `2026-08-30` · hora: `UTC`
> antes: v0.1 descrevia apenas `action/payload/context` e permitia receipts sem prova criptográfica
> depois: v0.1 canônico com request, receipt, `evidence_hash`, `runtime_id` e regras de status
> base: branch local `feat/sprint0-vortex-contract`
> assinatura: `Manus AI · Protocol Maintainer · GOS3`

# GOS3 Invocation Contract v0.1

## 1. Escopo

Este contrato define a fronteira entre o control plane moltH e um runtime Vortex. Ele padroniza pedidos e receipts de invocação; não fornece isolamento por si só, não autentica usuários e não transforma um fallback local em provider remoto.

## 2. Request obrigatório

```typescript
interface GOS3InvocationRequest {
  contract_version: "v0.1";
  invocation_id: string;
  agent: string;
  task: {
    kind: "code_exec" | "shell" | "tool_call" | "llm_inference";
    payload: string;
    language?: string;
  };
  limits: {
    timeout_seconds: number;
    max_output_bytes: number;
  };
  context_ref?: string;
  env_tag?: string;
}
```

O request deve ter versão v0.1, `invocation_id`, agente, tipo de tarefa permitido, payload textual e limites inteiros positivos. `task.payload` é opaco ao contrato e deve ser avaliado pelo executor conforme sua política de segurança.

## 3. Receipt obrigatório

```typescript
interface GOS3ContractEnvelope<T = unknown> {
  contract_version: "v0.1";
  invocation_id: string;
  agent: string;
  executed: boolean;
  status: "success" | "failed" | "error" | "partial" | "timeout" | "auth_required";
  output: T;
  duration_ms: number;
  truncated: boolean;
  runtime_id: string;
  evidence_hash: string;
}
```

`runtime_id` e `evidence_hash` são SHA-256 em hexadecimal lowercase com 64 caracteres. `invocation_id` deve ecoar o request.

## 4. Hash canônico

```text
sha256(stdout + stderr + String(exit_code | "null") + String(duration_ms))
```

Quando `output` é um objeto, o contrato lê `output.stdout`, `output.stderr` e `output.exit_code`. Quando é texto, o texto é tratado como stdout e o exit code é `0` para execução e `1` para não execução. TypeScript e Python devem produzir o mesmo digest.

## 5. Regras anti-fabricação

`status: "success"` exige `executed: true`. Estados `auth_required`, `timeout` e `error` exigem `executed: false`. `executed: true` com `status: "failed"` significa que a execução começou e terminou com falha operacional; não significa sucesso.

O consumidor deve rejeitar request inválido, receipt com campo ausente, `runtime_id` inválido, `evidence_hash` ausente ou forjado, status desconhecido, duração negativa e a combinação `success + executed:false`. Ausência de credencial deve resultar em `auth_required` ou `claim: "not_executed"` no adaptador, nunca em sucesso falso.

## 6. Implementação

A implementação canônica está em `src/server/vortexContract.ts`. Os gates read-only estão expostos por:

```text
POST /api/gos3/contract/request/validate
POST /api/gos3/contract/receipt/validate
```

A suíte dedicada está em `src/server/vortexContract.sprint0.test.ts`, e o gate Python interoperável está em `tests/contract_test.py`.

## 7. Critérios de aceite do Sprint 0

```bash
npm run lint
npm run test:sprint0
npm run test:vitest
npm run build
python3 tests/contract_test.py
npx tsx tests/contract_gate.test.ts
```

O sprint é aceito quando todos os comandos acima passam e o contrato rejeita explicitamente falsificação, ausência de runtime, request incompleto e falso sucesso.

## 8. Relação com Vortex

O Vortex mantém a autoridade do contrato, dos gates, da proveniência e dos critérios GOS3. O moltH implementa o control plane, autenticação, agentes, ferramentas, conectores e runtimes que produzem os receipts. O yAI fornece a experiência pública e o onboarding.

## 9. Limites conhecidos

Este contrato não comprova que Lean 4/Z3 foi executado, não garante persistência de domínio social, não substitui testes E2E e não valida credenciais de providers. Essas garantias exigem gates próprios e evidência real.

## Referências

[1]: https://github.com/scoobiii/vortex/blob/main/spec/invocation-contract.md "Vortex invocation contract"
[2]: https://github.com/scoobiii/vortex/blob/main/docs/decisions.md "Vortex ADRs"
