export interface BusinessAgent { id: string; name: string; capability: string; invokes: string[]; wal_table: string; bigfour: string; evidence_required: boolean }
export const BUSINESS_AGENTS: BusinessAgent[] = [
  { id: "@ErpAgent", name: "ERP Soberano", capability: "erp", invokes: ["@FinanceAgent","@CrmAgent"], wal_table: "erp_orders", bigfour: "Deloitte", evidence_required: true },
  { id: "@CrmAgent", name: "CRM Pipeline", capability: "crm", invokes: ["@CommercialAgent","@DbAgent"], wal_table: "crm_deals", bigfour: "EY", evidence_required: true },
  { id: "@BiAgent", name: "BI IPO-Ready", capability: "bi", invokes: ["@DbAgent"], wal_table: "bi_metrics", bigfour: "EY", evidence_required: true },
  { id: "@FinanceAgent", name: "Financeiro DRE", capability: "finance", invokes: ["@DbAgent","@IpoAgent"], wal_table: "finance_dre", bigfour: "PwC", evidence_required: true },
  { id: "@SupportAgent", name: "Suporte SLA", capability: "support", invokes: ["@DbAgent"], wal_table: "support_tickets", bigfour: "SOC2", evidence_required: true },
  { id: "@MktAgent", name: "MKT Growth", capability: "mkt", invokes: ["@CrmAgent","@DbAgent"], wal_table: "mkt_campaigns", bigfour: "EY", evidence_required: true },
  { id: "@CommercialAgent", name: "Comercial SDR", capability: "commercial", invokes: ["@DbAgent"], wal_table: "commercial_forecast", bigfour: "KPMG", evidence_required: true },
  { id: "@IpoAgent", name: "IPO & RI", capability: "ipo", invokes: ["@DbAgent"], wal_table: "ipo_deck", bigfour: "KPMG", evidence_required: true },
  { id: "@ComplianceAgent", name: "Compliance", capability: "compliance", invokes: ["@DbAgent"], wal_table: "compliance_audit", bigfour: "Deloitte", evidence_required: true },
  { id: "@DbAgent", name: "Database Agent", capability: "db", invokes: ["@ChatTableAgent","@Nx1TableAgent"], wal_table: "wal", bigfour: "PwC", evidence_required: true },
]
export function invokeAgent(from: string, to: string, task: any) { return { invocation_id: `inv-${Date.now()}-${from}-to-${to}`, agent: to, task, runtime_id: "427273fd", evidence_hash: `sha256(${JSON.stringify(task).slice(0,50)})`, timestamp: new Date().toISOString() } }
