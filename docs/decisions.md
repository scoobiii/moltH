> **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Architecture Decision Records & Governance` (ver docs/team.md)
> fase: `Technical Refinement (E4) & Governança v1.4` · data: `2026-09-06` · hora: `10:25:00 UTC`
> antes: ADR-001, ADR-002 e ADR-003
> depois: ADR-004 formalizando a Trava Obrigatória de Branch Protection via Prova Criptográfica de CI (Green-to-Main Gate) e ADR-005 (Vortex como GOS3 Core Único e moltH como Control Plane)
> base: commit `gos3-core-v1.4`, INC-001, INC-002, Vortex PR #29, SELIX PR #2
> assinatura: `Gemini · Architecture Decision Records & Governance · GOS3`

# Registro de Decisões Arquiteturais (ADRs — GOS3)

---

## ADR-001: Isolamento de Execução Nx1 e Persistência de Estado NxN em SQLite WAL

- **Status**: Aprovado e Implementado
- **Contexto**: Múltiplos agentes operam no mesmo ecossistema sem guardar estado de memória compartilhada insegura entre si.
- **Decisão**: 
  - Toda execução de ferramenta roda em ambiente isolado (Node V8 VM Isolate ou subprocesso com `killSignal: SIGKILL`).
  - O estado compartilhado da rede é registrado atomicamente em banco de dados SQLite operando em modo WAL (`journal_mode=WAL`), com latência p99 de 0,05ms.

---

## ADR-002: Princípio de Zero Simulação Oculta e Proibição de Mocks Mascarados

- **Status**: Aprovado e Implementado
- **Contexto**: A ocorrência do INC-001 demonstrou a necessidade de banir respostas simuladas que imitam dados de rede ou de hardware inexistente.
- **Decisão**:
  - Quando faltar chave de API ou permissão de SO, o agente deve retornar obrigatoriamente `claim: "not_executed"` ou `status: "auth_required"`.
  - É proibido criar geradores de dados estáticos para simular APIs externas.
  - Toda resposta com `executed: true` deve conter `evidence_hash = sha256(stdout + stderr + exit_code + duration_ms)`.

---

## ADR-003: Handoff Direto de Conteúdo e Proibição de Dependência de Links Externos de Terceiros

- **Status**: Aprovado e Ratificado
- **Contexto**: A tentativa de handoff de dados entre agentes (Claude, Grok, Claude-2) via links compartilhados (`claude.ai/share/...`) falhou estruturalmente devido a proteções anti-bot (Cloudflare 403 / ausência de identidade de agente padronizada na web aberta).
- **Decisão**:
  - Handoff de contexto entre agentes prioriza sempre injeção direta de texto/código ou leitura de artefatos locais auditáveis (`scrape_repo.py`).
  - É proibido presumir que outro agente ou instância conseguirá ler URLs de terceiros sem tool call real auditável em sandbox com conectividade liberada.
  - Na impossibilidade de acesso, o agente deve registrar `claim: "not_executed"` em conformidade com o ADR-002.

---

## ADR-004: Trava Obrigatória de Branch Protection via Prova Criptográfica de CI (Green-to-Main Gate)

> **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Architecture Decision Records & Governance`
> fase: `Governança e Blindagem de Repositório (v1.4)` · data: `2026-09-06` · hora: `10:25:00 UTC`
> antes: Prática tácita de CI verde exercida nos PRs (Vortex PR #29, SELIX PR #2), porém ausente de trava formal vinculante no docs/decisions.md e invocation-contract.md
> depois: Regra formal e impeditiva: nenhuma proposição (patch, refactor, PR) vira commit em `main` sem CI 100% verde acompanhado de evidence_hash
> base: INC-001, ADR-002, ADR-003, docs/GIT-POLICY.md, docs/PLAYBOOK.md
> assinatura: `Gemini · Architecture Decision Records & Governance · GOS3`

- **Status**: **APROVADO E VINCULANTE** (Aplicável a todo agente e operador humano, sem exceção)
- **Contexto**:
  - A premissa central do GOS3 determina: *"LLM propõe; sandbox executa; evidência prova; GOS3 decide"*.
  - Propostas de alteração de código (patches, refatores, hotfixes como os do Bend2/Vortex) não podem ingressar na branch estável `main` baseadas unicamente em retórica, sínteses em linguagem natural ou presunções de funcionamento do modelo.
  - A lacuna identificada consistia na inexistência de uma cláusula formal de branch protection que exigisse o selo verde de CI antes do merge em `main`.
- **Decisões**:
  1. **Regra de Portão Inegociável (Green-to-Main Gate)**: Nenhuma proposta, branch de feature ou hotfix pode ser mergeada ou commitada diretamente em `main` sem que a suíte canônica de testes e checagem estática passe com 100% de sucesso (`tsc --noEmit` exit 0, `vitest run` exit 0, zero testes falhando).
  2. **Vínculo por Prova Criptográfica (`evidence_hash`)**: O aceite do merge em `main` exige o registro da evidência de execução real do CI:
     $$\text{evidence\_hash} = \text{sha256}(\text{stdout} + \text{stderr} + \text{exit\_code} + \text{duration\_ms})$$
     calculado sobre a saída dos testes e do linter gerados no runtime auditável.
  3. **Proibição Estrita de Bypass**: Fica estritamente vetado:
     - `git push --force` ou `-f` em `main`.
     - Commits usando `--no-verify`.
     - Desativação intencional de testes (comentar asserções ou usar mocks mascarados para forçar aprovação, infração grave segundo ADR-002).
  4. **Rollback Automático Pós-Merge**: Se uma integração pós-merge em `main` apresentar regressão nos smoke tests de ambiente integrado, o commit deve ser revertido imediatamente (*fast rollback*) antes de qualquer novo trabalho de desenvolvimento.
  5. **Invalidação de Alegações Textuais**: O relato em linguagem natural de um LLM dizendo "tudo passou" ou "código testado" não tem valor probatório no GOS3; somente o log do processo de teste e o respectivo hash constituem prova válida de entrega.

---

## ADR-005: Vortex como GOS3 Core Único e moltH como Control Plane

> **GOS3** · agente: `Manus AI / Protocol Maintainer` · papel: `Architecture / Protocol Maintainer`
> fase: `Sprint 0 — Vortex Contract Foundation` · data: `2026-08-30` · hora: `UTC`
> antes: Contratos v0.1/v0.3 sobrepostos entre Vortex e moltH
> depois: Vortex como autoridade de contrato/gate; moltH como produto/control plane; yAI como UX pública
> base: `feat/sprint0-vortex-contract`
> assinatura: `Manus AI · Architecture · GOS3`

- **Status**: Implementado no clone local; publicação remota pendente de aprovação do PO.
- **Contexto**: Vortex, moltH e yAI possuem capacidades complementares, mas manter dois GOS3, dois sistemas de identidade ou dois runtimes canônicos causaria divergência de proveniência.
- **Decisão**:
  - Vortex mantém invocation contract, validação, `evidence_hash`, `runtime_id`, gates, ADRs e critérios de proveniência.
  - moltH mantém UI do produto, autenticação, agentes, ferramentas, storage, MCP, conectores e control plane.
  - yAI fornece landing, branding, onboarding e componentes de entrada, sem criar outro backend.
  - Toda execução futura deve retornar o envelope GOS3 v0.1 antes de ser apresentada como sucesso.
- **Consequência**: O Sprint 0 implementa a fronteira de contrato no moltH e deixa integração de runtime remoto, autenticação federada e E2E para sprints posteriores.

---

## ADR-006: DELIVERABLE-TRUTH GATE, Domínios Protegidos P0 (DREX/PIX) e Regra Vinculante 7

> **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Architecture Decision Records & Protocol Governance` (ver docs/team.md)
> fase: `Norma Vinculante GOS3 — DELIVERABLE-TRUTH GATE & Domínios Protegidos P0 (v1.5)` · data: `2026-09-06` · hora: `12:05:00 UTC`
> antes: CI avaliava observabilidade técnica (compilação/testes), permitindo que mocks financeiros (carteiras/PIX/DREX) passassem para produção se compilassem
> depois: DELIVERABLE-TRUTH GATE obrigatório, domínios protegidos P0 (DREX, PIX, Wallets, etc.), Regra 7 vinculante e barreira impeditiva para Main
> base: commit `gos3-core-v1.5`, INC-001, INC-002, INC-003, ADR-002, ADR-004, docs/ADR-006-DELIVERABLE-TRUTH-GATE.md
> assinatura: `Gemini · Architecture Decision Records & Protocol Governance · GOS3`

- **Status**: **APROVADO E VINCULANTE (NORMA CONTRATUAL INEGOCIÁVEL DO GOS3)**
- **Contexto**:
  - A descoberta de um erro ou mock não autoriza o agente a apagar ou substituir arbitrariamente código na branch `main`. A descoberta de erro inicia formalmente o ciclo de correção.
  - O CI sozinho não decide que uma implementação é verdadeira. O CI comprova propriedades observáveis técnicas (compilação, testes, invariantes). O DELIVERABLE-TRUTH comprova que o entregável corresponde ao contrato real e não deixa escapar mocks para produção.
- **Decisões**:
  1. **Domínios Protegidos P0 Obrigatórios**: Alterações em `wallet`, `pix`, `drex`, `financial`, `banking`, `payment`, `settlement`, `balance`, `account`, `secret` e `credential` entram obrigatoriamente no escopo do DELIVERABLE-TRUTH GATE.
  2. **Diferenciação Estrita de Ambientes**: $\text{TEST FIXTURE / MOCK} \neq \text{PRODUCTION IMPLEMENTATION}$. Mocks são tolerados apenas em `/tests/`. Mocks em `/src/` em domínios P0 geram imediatamente `P0 INCIDENT / BLOCK AGENT`.
  3. **Regra Vinculante 7 do GOS3**:
     > *Nenhum agente pode declarar PASS, implemented, complete, production-ready ou equivalente quando o entregável estiver bloqueado por DELIVERABLE-TRUTH, mesmo que compilação e testes convencionais passem.*
  4. **Regra Mexeu → Achou Erro → Conserta**: Se a remoção de um mock causar quebra de compilação (`tsc FAIL`), a resposta do agente é obrigatoriamente `CORRECTION REQUIRED` (limpar ou migrar os consumidores), sendo estritamente proibido recriar o mock para fazer o linter passar.
  5. **Portão Duplo Obrigatório para Main**: Apenas a conjunção de `CI PASS` + `COMPLIANCE PASS (DELIVERABLE-TRUTH)` autoriza a submissão para aprovação em `main`.

