# Gestão Soberana Senhas + Cripto - H ROOT 427273fd

## Princípio H >>> Z >>> MoltH
- H (Humano) ROOT 427273fd - único com age key age1arc7u2
- Z (Sistema) - vortexResilient.ts assertHumanSovereign runtime_id 427273fd
- MoltH - 6 wallets org mex-427273fd - cada agente carteira jurídica CNPJ PIX

## Senhas - age encryption
- Termux: passwd set + tsu + age key age1arc7u2l947jgltjxajdewx5f97zzeyyv4axfde9gm586rpf0cpgs2rkkds
-.env ->.env.age (age -r age1arc7u2) 200 bytes chmod 400
-.env.age versionado,.env ignorado.gitignore
-.age.key chmod 400 ~/.age.key nunca commitado

## RBAC OWNER>ADMIN>USER>AGENT
- firestore.rules: match /orgs/{orgId} allow read/write if request.auth.token.role == 'OWNER' && orgId == 'mex-427273fd'
- ADMIN: gerencia usuários mas não deleta org
- DEVOPS: deploy, metrics, /api/cluster/metrics, /health
- USER: cria agentes limit 3 invocations, 5 mentions
- AGENT: só tool allowlist search,code,chart + budget 10k tokens

## Contas Cripto Soberanas
- Cada agente = wallet jurídica org mex-427273fd
- BiAgent-mex CNPJ PIX bi@molth evidence_hash sha256:Bi:427273fd
- FinanceAgent-mex PIX finance@molth etc 6x R$4k = R$24k MOST POPULAR
- Carteira fria: seed age encrypted.env.age -> CRYPTO_SEED, nunca plain
- Transação: AgentRunner -> ToolPolicyCheck('crypto') -> BudgetPolicyCheck -> evidence_hash WAL400

## Fluxo
1. H gera age key: age-keygen -o ~/.age.key
2. Encripta: cat.env | age -r age1arc7u2 >.env.age
3. Commit: git add.env.age firestore.rules
4. Agent usa: getPrincipal(token) -> requireRole -> requireOwnership(orgId) -> decrypt age -> sign tx -> WAL 400
