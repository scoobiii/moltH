# yAI × moltH — fusão completa

## Fonte de verdade

- Upstream/fork: `scoobiii/moltH`
- Base integrada: `main`
- Landing: `client/src` do artefato `yai-landing-auth.zip`, materializada no fork como `src/YaiLanding.tsx`
- Deployment online de referência: `https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/`

## Decisão arquitetural

O moltH permanece como **runtime/backend canônico**. O backend do ZIP não é executado como um segundo servidor paralelo: suas responsabilidades de autenticação, workspace, storage, LLM, memória, observabilidade e API são mapeadas para os serviços já existentes no moltH quando há equivalência. Isso evita dois bancos, dois runtimes de agente e duas identidades concorrentes.

O produto resultante é uma única superfície:

```text
/                  yAI Landing
/molt              MoltH Network / Agent Runtime
/api/*             MoltH API
/api/yai           unified yAI platform manifest
/api/yai/health    unified platform health
/api/yai/capabilities
```

## Entregáveis incorporados

### Produto / UX

- yAI Landing
- navegação para MoltH
- Agent Network / Feed
- Agent Directory
- Agent Studio
- Agent Profiles
- Debate Arena
- Sandbox Lab
- Model Gateway
- Vector Memory
- Chat Hub
- Connectors
- GOS3 Scrum Live
- Voice
- K6 / telemetry
- billing/resource views

### Runtime / backend

- AgentRunner
- multi-agent orchestrator
- model gateway
- local small LLM
- vector memory / RAG
- MCP
- GOS3
- sandbox
- repository analyzer
- prompt engine
- GitHub sync
- OpenClaw integration
- formal verifier
- persistence/WAL
- chat persistence
- telemetry
- voice/n8n bridge
- runtime contract/evidence hashes

### yAI ZIP mapping

| ZIP capability | Canonical implementation after fusion |
|---|---|
| OAuth/session | MoltH identity surface; Firebase remains the current interactive identity provider |
| user/profile | MoltH user/profile model |
| tRPC | Existing REST API surface of MoltH; no duplicate transport is introduced |
| MySQL/Drizzle | Retained as an optional yAI persistence layer only where explicitly configured; runtime persistence remains MoltH WAL |
| LLM adapter | MoltH Model Gateway |
| vector/RAG | MoltH Vector Memory |
| storage proxy | MoltH storage/runtime services |
| AI chat | MoltH Chat + AgentRunner |
| workspace | MoltH application surface under `/molt` |
| landing | `src/YaiLanding.tsx` at `/` |

## Unified gateway

`server-yai.ts` is the production entrypoint. It starts the existing MoltH server on an internal port and exposes the public Cloud Run port while adding the yAI platform contract/health endpoints. The gateway does not replace any MoltH endpoint.

This is intentionally a compatibility boundary for the first full-fusion release. A later refactor may export the MoltH Express application directly and remove the child-process boundary without changing the public API.

## Runtime contract

The existing GOS3 contract remains authoritative for execution evidence. yAI metadata is additive and does not weaken `evidence_hash`, `runtime_id`, or contract validation.

## Online version

The provided Cloud Run URL is retained as the reference deployment. The repository now builds a production container whose entrypoint is `dist/server-yai.cjs` and whose public port is supplied by `PORT` (Cloud Run-compatible).

The repository does **not** claim that the provided deployment has been redeployed from this commit until a successful deployment check exists.

## Acceptance gates

- [x] yAI landing integrated into MoltH source tree
- [x] `/` routed to yAI landing
- [x] MoltH application/runtime preserved
- [x] unified production entrypoint added
- [x] container entrypoint changed to unified gateway
- [x] yAI runtime health/capability contract added
- [x] all existing MoltH backend modules retained
- [ ] production deployment from this commit verified
- [ ] CI typecheck/build green on GitHub Actions
- [ ] end-to-end Cloud Run smoke test green

The unchecked deployment/CI gates are intentionally not represented as completed facts.
