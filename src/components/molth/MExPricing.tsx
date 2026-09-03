import React from 'react'
import { Check, Shield, Zap, Sparkles, Building2, CreditCard, ArrowRight } from 'lucide-react'

interface MExPricingProps {
  orgId?: string
  onContactSales?: () => void
}

export default function MExPricing({ 
  orgId = 'mex-427273fd',
  onContactSales 
}: MExPricingProps) {
  const dedicatedAgents = [
    { name: "BiAgent", role: "BI IPO-Ready & Indicadores Executivos", firm: "EY" },
    { name: "FinanceAgent", role: "DRE, Fluxo de Caixa & Gestão BESS", firm: "PwC" },
    { name: "ErpAgent", role: "Integração SAP / Totvs & Ordens PPA", firm: "Deloitte" },
    { name: "CommercialAgent", role: "SDR Autônomo & Fechamento de Contratos", firm: "KPMG" },
    { name: "SupportAgent", role: "SLAs Críticos & Telemetria 24/7", firm: "SOC2" },
    { name: "CrmAgent", role: "Funil de Vendas de Energia & Clientes", firm: "EY" }
  ]

  return (
    <div className="bg-[#111215] border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white space-y-8 max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>TENANT DEDICADO • ORG {orgId}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Plano MEx Sovereign Business
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Cluster isolado de 6 agentes corporativos com governança Zero-Trust e auditoria H ROOT 427273fd
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-4 text-right">
          <div className="text-xs text-zinc-400 font-medium">Investimento Mensal</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            R$ 4.000<span className="text-sm font-normal text-zinc-500">/mês</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">6 carteiras Web3 dedicadas</div>
        </div>
      </div>

      {/* 6 Dedicated Agents Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Agentes Dedicados da Organização MEx</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dedicatedAgents.map((ag) => (
            <div 
              key={ag.name}
              className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl hover:border-emerald-700/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-300">@{ag.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                    {ag.firm}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 leading-snug">
                  {ag.role}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Isolado no orgId</span>
                <span className="text-emerald-400">Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SLA & Governance Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Isolamento total de dados via <code className="text-emerald-300">firestore.rules</code> e RBAC</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Write-Ahead Log (WAL) 400 blocos com prova SHA-256</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Suporte a mercado livre de energia e baterias BESS</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Garantia de runtime imutável <code className="text-emerald-300">runtime_id: 427273fd</code></span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>6 carteiras autônomas para liquidação em MEX</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Soberania Root H com kill switch e auditoria em tempo real</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Building2 className="w-4 h-4 text-zinc-500" />
          <span>Faturamento faturado para MEx Energia Ltda • CNPJ sob sigilo</span>
        </div>

        <button
          onClick={onContactSales}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-lg active:scale-95"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Confirmar Contrato MEx R$ 4k</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
