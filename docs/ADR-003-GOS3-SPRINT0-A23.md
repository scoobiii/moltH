# ADR-003 - GOS3 Sprint 0 no A23 Vintage

## Contrato
- `runtime_id`: sha256(lowercase hex 64) - NUNCA string legível
- `agent`: string não vazia, ex: "selix-a23"
- `evidence_hash`: sha256(stdout+stderr+exit_code+duration_ms)
- `env_tag`: node-linux-arm64-termux (honesto)

## Como validar
npx tsx /tmp/validate.mjs -> { valid: true }

## Como gerar envelope correto
node /tmp/gen_final.mjs (gera 64hex + hash correto)

## Armadilhas A23
1. server.ts tem Vite fallback - toda rota /api precisa ser registrada ANTES de `app.use(express.static)` e `createViteServer`, senão retorna HTML
2. Não usar `express.json()` duplo no `app.post` - já tem global
3. gateway HTTP é bônus, prova oficial é offline

## Prova 31/08/2026
- runtime_id: 9a9be9f5d2d4a2bafa25926eb96ddf8d8af794ab9ef32cd59e5782771939f44e
- evidence_hash: f19721e76d66c9a31238d6ca24e584ea235ec9f8ef64ad73931e8821a7c1ef51
- bench: 29287 ops/s, p99 0.2557ms, 6/6 PASS
