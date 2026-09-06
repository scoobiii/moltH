> **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Architecture Decision Records & Governance` (ver docs/team.md)
> fase: `Governança e Blindagem de Repositório (v1.4)` · data: `2026-09-06` · hora: `10:25:00 UTC`
> antes: Prática tácita de CI verde sem trava vinculante formalizada nos docs centrais (Vortex PR #29 e SELIX PR #2)
> depois: ADR-004 formalizando a obrigatoriedade de prova criptográfica de CI (Green-to-Main Gate) antes de qualquer merge ou commit em main
> base: commit `gos3-core-v1.4`, INC-001, INC-002, Vortex PR #29, SELIX PR #2, docs/decisions.md
> assinatura: `Gemini · Architecture Decision Records & Governance · GOS3`

# ADR-004: Trava Obrigatória de Branch Protection via Prova Criptográfica de CI (Green-to-Main Gate)

## 1. Status
**APROVADO E VINCULANTE**  
Aplica-se universalmente a todos os agentes autônomos (Claude, Gemini, Grok, Qwen, Manus, etc.) e a operadores humanos trabalhando em qualquer branch ou repositório do ecossistema GOS3 / moltH / Vortex.

---

## 2. Contexto e Motivação

O princípio basilar da governança GOS3 é:
> **"LLM propõe; sandbox executa; evidência prova; GOS3 decide."**

Durante o ciclo de desenvolvimento, observou-se que correções estruturais (ex: casos Bend2, Vortex e SELIX) corriam risco de ser integradas ao branch estável `main` por conveniência operacional, aceitando como "garantia" o texto gerado por um modelo de linguagem afirmando que a correção estava testada e perfeita.

Isso viola a premissa de Zero Simulação (ADR-002). Relato em linguagem natural de um LLM **não é evidência**. Sem um portão criptográfico obrigatório e impeditivo, o branch `main` fica vulnerável a quebras de build, testes comentados, mocks mascarados e regressões silenciosas.

Embora o portão de CI verde já tivesse sido exercido na prática (Vortex PR #29 e SELIX PR #2), a ausência de uma regra canônica escrita permitia ambiguidades sobre se um agente poderia dar bypass sob urgência.

---

## 3. Cláusulas Vinculantes

### Cláusula 1: Portão Inegociável de CI Verde (Green-to-Main)
Nenhuma proposição de código (patch, refactor, hotfix, novo agente, alteração de contrato ou PR) pode ingressar em `main` sem que:
1. O linter / compilador TypeScript passe com **zero erros**: `npx tsc --noEmit` (exit code 0).
2. A suíte completa de testes automatizados passe com **100% de sucesso**: `npm test` / `npx vitest run` (exit code 0, 0 falhas).
3. As suites determinísticas específicas do módulo alterado atestem `PASS`.

### Cláusula 2: Emissão e Registro de Prova Criptográfica (`evidence_hash`)
Toda aprovação de integração para `main` deve computar e anexar o `evidence_hash` canônico do ciclo de CI:

$$\text{evidence\_hash} = \text{sha256}(\text{stdout} + \text{stderr} + \text{exit\_code} + \text{duration\_ms})$$

Este hash deve ser gerado a partir da saída bruta do processo de verificação executado no runtime real, vinculando:
- `runtime_id`: identificador determinístico de 64 hex do ambiente de build;
- `agent`: identificador do agente proponente;
- `timestamp`: momento UTC da execução;
- `test_summary`: total de testes executados e aprovados.

### Cláusula 3: Vetos Expressos (Zero Bypass)
São estritamente proibidos em qualquer circunstância:
- `git push --force` ou `git push -f` no branch `main`.
- Commits ou pushes contendo flags de bypass como `--no-verify`.
- Omissão, exclusão ou mascaramento de testes para forçar passagem de CI.
- Merges manuais aprovados por autoridade humana sem o log do CI verde indexado.

### Cláusula 4: Protocolo de Rollback Automático
Se após o merge em `main` for constatada qualquer quebra ou divergência no ambiente integrado (ex: falha em smoke tests no Google Cloud Run, container start timeout, ou discrepância de `runtime_id`), o commit deve ser imediatamente revertido via `git revert` antes de qualquer outra atividade de desenvolvimento.

---

## 4. Matriz de Conformidade de PR / Merge

| Etapa | Verificação Requerida | Critério de Aceite | Prova Exigida |
|---|---|---|---|
| **L1: Static** | `npx tsc --noEmit` | Exit code 0, 0 warnings de tipagem | Stdout limpo |
| **L2: Unit/Contract** | `npm test` | Exit code 0, 100% passed | Log vitest com contagem exata |
| **L3: Cryptographic Gate** | Cálculo do `evidence_hash` | Hash SHA-256 de 64 caracteres hex | stdout + stderr + exit_code + duration_ms |
| **L4: Audit Trail** | Registro no envelope/commit | Hash presente no cabeçalho ou PR | Envelope GOS3 ou commit message canônica |

---

## 5. Relação com Outras Normas do GOS3

- **ADR-002 (Zero Simulação)**: Proíbe simular aprovação de testes.
- **ADR-003 (Runtime ID)**: Garante que o CI rodou no runtime identificado e auditável.
- **docs/GIT-POLICY.md**: O push gate do repositório passa a ter ancoragem formal nesta ADR-004.
- **docs/PLAYBOOK.md**: A seção 5 (Merge Gates) passa a ser a implementação operacional desta decisão.
