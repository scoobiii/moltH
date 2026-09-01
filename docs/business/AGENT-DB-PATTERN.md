# BANCO DE DADOS É AGENTE - GOS3 v1.3
Java: tudo é objeto. MoltH: tudo é agente.

## Mesh
@MktAgent -> @CrmTableAgent (INSERT lead via @DbAgent)
@CrmAgent -> @ErpTableAgent (INSERT order via @DbAgent)
@ErpAgent -> @FinanceTableAgent (INSERT dre via @DbAgent)
@FinanceAgent -> @BiTableAgent (INSERT mrr via @DbAgent)

Cada operacao = invoke() com evidence_hash SHA-256 + runtime_id 427273fd

Tabela = Agente. Query = Invoke. WAL = Log de invokes.
Big Four ready: PwC (auditoria), KPMG (RI), Deloitte (governanca), EY (BI).
