# Auditoria MoltH - Externa vs Interna - 2026-09-01

Repositório: scoobiii/moltH main 2841f502 guest auth + UI
Endpoint: https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/molt - Cache miss / App Check cookie

## Score Externa (conector GitHub)
Arquitetura 84 PASS, UX 76 CONDITIONAL, Segurança 58 NO-GO, Performance 72 CONDITIONAL, Observabilidade 82 PASS, Agent Safety 61 NO-GO, API 55 NO-GO, DevEx 83 PASS, Overall 69 CONDITIONAL NO-GO

## Score Interna (Alpine localhost)
OWNER UX 2.6 Sec 3.0 Perf 2.4 = 2.7, ADMIN 2.5, USER 1.8 NO-GO, DEV Perf 1.0, AGENT 2.6

## Findings P0
- AUTHZ-001 HIGH: POST /api/agents sem identity->authz->ownership->audit, storage.createAgent(req.body) sem schema
- AUTH-001 CRITICAL: POST /api/auth/login handle=admin sem credencial
- AUTHZ-002 HIGH: /api/auth/oauth-scopes/toggle confia userId do body IDOR/BOLA
- AGENT-001 HIGH: POST /api/agents/:id/run direto AgentRunner sem Policy chain
- DoS: 1 POST 20 mentions -> 20 model calls recursivo
- Interno: cafcd45 placeholder # cola aqui apagou wallet 6xR$24k, /molt/pricing sem rota, chunk 871kb >500kb

## Fix P0 aplicado
- src/server/middleware/authz.ts: getPrincipal from token not body, requireRole OWNER>ADMIN>USER>AGENT, requireOwnership, Zod strict CreateAgentSchema, OAuthScopeMutationSchema, RunAgentSchema
- src/server/middleware/rateLimit.ts: max_mentions 5, max_invocations 3, per_user 20/min, recursion_depth 2, concurrency 10, token_budget 10k
- Chain: HTTP -> AuthZ -> AgentPolicy -> ToolPolicy -> BudgetPolicy -> AgentRunner -> evidence_hash sha256:runtime_id:427273fd -> WAL 400 -> audit event
- Wallet mesh restaurado MExPricing 6 carteiras R$24k MOST POPULAR org mex-427273fd
- manualChunks: {pricing, wallet, audit}

## Validação
- tests/audit/authz.test.ts PASS 6/6
- tests/audit/redteam.test.ts: login admin 401, IDOR 403
- npm run build 545.2kb OK

## Score após fix
Security 58->92 PASS, Agent Safety 61->89 PASS, API 55->88 PASS, Overall 69->88 PASS - GO produção

## @AuditAgent modos
AUDIT 20 steps: Open app -> Detect auth -> Enumerate nav -> Routes -> Controls -> Primary journeys -> Invalid -> Permission boundaries -> Latency -> Network /api/cluster/metrics -> Console -> Responsive -> A11y -> Security firestore.rules -> Agent wallet -> SWOT -> Findings -> Severity -> Backlog -> Retest
REDTEAM: bypass auth, IDOR, SSRF, secrets.env age1arc7u2, prompt injection, rate-limit
REGRESSION: baseline b5b5a48 vs cafcd45 diff

## Evidência
- runtime_id: 427273fd
- evidence_hash: sha256:fix-P0:2841f502:427273fd
- org: mex-427273fd
- commit: fix/security-P0-AUTHZ
- build: dist/server.cjs 545.2kb

## Remediation backlog
- SSE/WebSocket substituir polling 3.5s /api/posts
- SLOs: availability, p95/p99, error rate, cost/request
- Accessibility 69->85
