> **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Architecture Decision Records & Protocol Governance` (ver docs/team.md)
> fase: `Norma Vinculante GOS3 — DELIVERABLE-TRUTH GATE & Domínios Protegidos P0 (v1.5)` · data: `2026-09-06` · hora: `12:05:00 UTC`
> antes: CI avaliava propriedades observáveis estáticas (compilação/testes), permitindo que mocks financeiros (carteiras/PIX) passassem para produção se compilassem
> depois: ADR-006 estabelecendo o DELIVERABLE-TRUTH GATE obrigatório, domínios protegidos P0 (DREX, PIX, Wallets, etc.), Regra 7 vinculante e barreira impeditiva para Main
> base: commit `gos3-core-v1.5`, INC-001, INC-002, INC-003, ADR-002, ADR-004
> assinatura: `Gemini · Architecture Decision Records & Protocol Governance · GOS3`

# ADR-006: DELIVERABLE-TRUTH GATE, Domínios Protegidos P0 (DREX/PIX) e Regra Vinculante 7

## 1. Status
**APROVADO E VINCULANTE (NORMA CONTRATUAL INEGOCIÁVEL DO GOS3)**  
Esta norma **não é uma recomendação ou diretriz de boas práticas**. É uma regra vinculante do protocolo que se aplica irrestritamente a qualquer agente autônomo (Claude, Gemini, Grok, Qwen, Manus, etc.) e a qualquer operador humano atuando nos repositórios `moltH`, `vortex` e derivados.

---

## 2. Princípio Central: A Descoberta de Erro Inicia o Ciclo de Correção

O ponto central desta norma é:
> **O agente NÃO ganha permissão para apagar ou substituir algo na branch `main` só porque detectou que é um mock.**  
> **A descoberta de um erro ou de um mock NÃO autoriza a destruição reativa; ela INICIA O CICLO FORMAL DE CORREÇÃO.**

Se uma remoção ou alteração gerar falha no compilador (`tsc FAIL`), a resposta mandatória do protocolo é:
```text
> CORRECTION REQUIRED
```
e **JAMAIS**:
```text
> "vou recriar o arquivo mockado para fazer o TypeScript passar".
```
A regra operativa máxima é: **MEXEU → ACHOU ERRO → CONSERTA**.

---

## 3. Topologia do Fluxo: DELIVERABLE-TRUTH vs. CI

O CI não decide sozinho se uma implementação é verdadeira. O CI comprova propriedades observáveis técnicas (compilação, testes unitários, contratos estruturais, invariantes). O **DELIVERABLE-TRUTH** verifica se aquilo que foi entregue corresponde de fato ao contrato do entregável real e impede estruturalmente que qualquer mock escape para produção.

```text
SECURITY / FINANCIAL / DELIVERABLE TRUTH
                    │
          CREATE / EDIT / DELETE
          MOVE / RENAME / REPLACE
                    │
                    ▼
             COMPLIANCE GATE
                    │
       ┌────────────┴────────────┐
       │                         │
      PASS                      FAIL
       │                         │
       ▼                         ▼
      CI                    P0 INCIDENT
       │                         │
       ▼                         ▼
  APPROVAL                BLOCK AGENT
       │                         │
       ▼                         ▼
     MAIN                   CORRECTION
                                 │
                                 ▼
                         INDEPENDENT REVIEW
                                 │
                                 ▼
                                CI
                                 │
                                 ▼
                         COMPLIANCE PASS
                                 │
                                 ▼
                              APPROVAL
                                 │
                                 ▼
                                MAIN
```

---

## 4. Domínios Protegidos P0 Obrigatórios

Ficam categorizados como **Domínios Protegidos de Severidade P0**:

1. **`wallet`** (carteiras digitais, endereços criptográficos, saldos e custódia)
2. **`PIX`** (chaves de endereçamento, arranjos de pagamento instantâneo do Bacen)
3. **`DREX`** (Real Digital, CBDC brasileira, tokenização e smart contracts do Banco Central)
4. **`financial`** (transações monetárias, livros-razão, auditoria de balanços)
5. **`banking`** (APIs bancárias, Open Finance, webhooks de liquidação)
6. **`payment`** (gateways, checkout, cobrança e ordens de pagamento)
7. **`settlement`** (liquidação financeira, compensação e baixa de ordens)
8. **`balance`** (saldos contábeis, limites de crédito e reservas)
9. **`account`** (contas correntes, contas de custódia e identidades financeiras)
10. **`secret`** (chaves privadas, sementes mnemônicas, tokens mTLS)
11. **`credential`** (certificados ICP-Brasil, chaves de API, senhas e chaves age)

> **Nota de Escopo**: Isso não significa que qualquer variável contendo a palavra `account` ou `balance` seja proibida. Significa que alterações tocando esses domínios entram **obrigatoriamente no escopo de auditoria do DELIVERABLE-TRUTH GATE**.

---

## 5. A Fronteira Inviolável: Test Fixture vs. Production Implementation

O portão automatizado diferencia de forma determinística:

$$\text{TEST FIXTURE / MOCK} \quad \neq \quad \text{PRODUCTION IMPLEMENTATION}$$

- **Escopo Permitido para Fixtures e Mocks**: Diretórios `/tests/`, `/test/`, `/__tests__/` ou arquivos explicitamente anotados como testes (`*.test.ts`, `*.spec.ts`). Nesses locais, fixtures de teste servem para testar isolamento de software.
- **Escopo Proibido para Mocks em Domínios P0**: Código de produção (`/src/`, `/src/server/`, `/src/lib/`, `/src/components/`). É terminantemente proibido manter arrays estáticos com saldos simulados, chaves PIX de mentira, liquidações simuladas de DREX ou funções fictícias com retornos fixos de sucesso.
- **Transparência quando ausente**: Se um serviço de DREX, PIX ou liquidação bancária não possui contrato de integração ou credencial configurada, o retorno canônico do GOS3 deve ser obrigatoriamente:
  ```json
  {
    "claim": "not_executed",
    "status": "auth_required",
    "motivo": "Contrato de liquidação DREX/PIX não configurado no runtime"
  }
  ```

---

## 6. A Regra Vinculante 7 do GOS3

Para fechar definitivamente qualquer brecha de falso-positivo de CI:

> ### **Regra 7 (Vinculante):**
> **Nenhum agente pode declarar PASS, implemented, complete, production-ready ou equivalente quando o entregável estiver bloqueado por DELIVERABLE-TRUTH, mesmo que compilação e testes convencionais passem.**

Se o cenário ocorrer:
```text
tsc             PASS
vitest          PASS
build           PASS
GOS3            PASS
                ↓
mock financeiro em produção (DREX / PIX / Wallet)
                ↓
DELIVERABLE-TRUTH: FAIL
                ↓
RESULTADO: BLOQUEIO IMEDIATO PARA MAIN (P0 INCIDENT)
```
O **COMPLIANCE PASS** do DELIVERABLE-TRUTH GATE é **condição necessária e inegociável** para o merge em `main`, operando em conjunto com o CI existente (ADR-004).

---

## 7. Protocolo de Resolução do Incidente sovereignVault

Diante da detecção de mocks legados (como o ocorrido com `sovereignVault.ts` e `cryptoPolicy.ts`), o fluxo normativo obrigatório a ser seguido por qualquer agente é:

1. **Detectou o mock**: **NÃO APAGA AUTOMATICAMENTE**.
2. **Identifica consumidores**: Executa varredura determinística (`grep -rn "nomeDoArquivo" src/ tests/`).
3. **Identifica entregável**: Mapeia o contrato de entrega real definido nas especificações.
4. **Decide o caminho**:
   - *Opção A*: Remover o mock E refatorar/limpar simultaneamente todos os consumidores dependentes.
   - *Opção B*: Converter o mock na implementação real soberana com recibo de execução criptográfica.
5. **Executa os testes**: Roda `npx tsc --noEmit` e `npx vitest run`.
6. **Se quebrar o compilador**: Aciona `CORRECTION REQUIRED` para consertar os call-sites quebrados. Nunca recria o mock.
7. **Submete ao DELIVERABLE-TRUTH GATE** e somente após o `COMPLIANCE PASS` submete ao CI para merge.
