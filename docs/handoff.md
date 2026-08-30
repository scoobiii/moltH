# Handoff — Gemini & Cloud Run Deployment (GOS3 v1.4)

## Contexto
O `runtime_id` (ADR-003), o cliente leve `vpsAgentClient.ts`, o servidor **Model Context Protocol (MCP v1.0)** e as correções de layout em Recharts foram integrados e validados na suíte global de testes.
Esta especificação garante paridade estrita entre a execução local (Termux / Android A23) e o deployment central (Google Cloud Run / AI Studio).

## O que foi implementado e atualizado
1. **Model Context Protocol (MCP v1.0)**: Servidor e client HTTP/SSE com JSON-RPC 2.0 em `src/server/mcpService.ts` e UI em `src/components/connectors/ConnectorsModal.tsx`.
2. **Estabilização Recharts**: Correção estrutural contra alertas de dimensões com `debounce={50}`, `width="99%"` e alturas mínimas explícitas.
3. **`src/services/vpsAgentClient.ts`**: Cliente fino que utiliza `fetch` nativo para delegar chamadas de modelo e ferramentas para a VPS/Cloud Run, sem instalar SDKs volumosos no cliente local (mantendo espaço < 50MB).
4. **`src/server/vortexContract.ts`**: Implementação do gerador de `runtime_id` (64 hex SHA-256) e empacotamento do envelope do Contrato v0.1 com `evidence_hash`.
5. **`server.ts`**: Endpoints `/api/agents/:id/run` e `/api/mcp/*` retornando envelopes canônicos com `runtime_id` e `evidence_hash`.
6. **`tests/gos3_full_coverage.test.ts` & `tests/contract_test.py`**: Suíte de testes atualizada e passando com 100% de conformidade.

## Como replicar e fazer deploy no Cloud Run
```bash
# 1. Atualizar repositório central
git pull origin main

# 2. Executar deploy no Google Cloud Run
gcloud run deploy zAI \
  --source . \
  --platform managed \
  --region us-west1 \
  --allow-unauthenticated
```

## Validação de Contrato em Produção
```bash
curl -s -X POST https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/api/agents/agent-vortex-grid/run \
  -H "Content-Type: application/json" \
  -d '{"prompt":"console.log(42)"}' \
  | jq '{executed: .executed, status: .status, runtime_id: .runtime_id, evidence_hash: .evidence_hash}'
```

### Critérios de Aceite
- `runtime_id` presente e com 64 caracteres hexadecimais válidos.
- `evidence_hash` presente e válido (SHA-256 da saída/execução).
- `executed: true` e `contract_version: "v0.1"`.
- `vpsProxyRequest` funcionando sem necessidade de credenciais de provedor no client local.
- Conectores MCP ativos em `/api/mcp/servers`.

## Documentação de Referência
- `docs/CHANGES-runtime_id.md`
- `docs/decisions.md` (ADR-003)
- `docs/incidents.md` (INC-001 & INC-002)
- `docs/PROJECT-METRICS.md`
- `docs/CHANGELOG.md`
