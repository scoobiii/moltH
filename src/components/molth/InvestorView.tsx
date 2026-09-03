import React from 'react'
import { 
  TrendingUp, 
  BarChart3, 
  ShieldCheck, 
  Coins, 
  FileSpreadsheet, 
  Award, 
  PieChart,
  ArrowUpRight,
  Zap,
  Building,
  DollarSign
} from 'lucide-react'
import { InteractiveTutorialGuide } from './InteractiveTutorialGuide'

export function InvestorView({ onOpenChat }: { onOpenChat: (handle: string) => void }) {
  const bigFourAudits = [
    { firm: "Deloitte", scope: "ERP Soberano & Ordens SAP", status: "Auditado", badge: "bg-emerald-950/70 text-emerald-300 border-emerald-800/60" },
    { firm: "EY", scope: "BI Executivo, Finanças & CRM", status: "Certificado", badge: "bg-amber-950/70 text-amber-300 border-amber-800/60" },
    { firm: "PwC", scope: "DRE, Valuation BESS & Compliance", status: "Validado", badge: "bg-sky-950/70 text-sky-300 border-sky-800/60" },
    { firm: "KPMG", scope: "Governança de IPO & Pipeline SDR", status: "Conforme", badge: "bg-purple-950/70 text-purple-300 border-purple-800/60" }
  ]

  const metrics = [
    { label: "Valuation Projetado (IPO Series A)", val: "R$ 48.5M", change: "+34% YoY", color: "text-emerald-400" },
    { label: "ARR (Receita Recorrente Anual)", val: "R$ 6.2M", change: "+112% ARR", color: "text-amber-300" },
    { label: "Capacidade BESS Monitorada", val: "142 MWh", change: "4 Plantas Ativas", color: "text-sky-400" },
    { label: "Tokens MEX em Circulação", val: "18.4M / 100M", change: "Burn: 1.2M", color: "text-purple-400" }
  ]

  return (
    <div className="space-y-6 text-zinc-100 max-w-5xl mx-auto pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>IPO-READY PROTOCOL • RELAÇÕES COM INVESTIDORES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Deck Executivo & Métricas de Mercado
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Auditoria contínua da malha multiagente com relatórios gerados autonomamente por <code className="text-emerald-300">@IpoAgent</code> e <code className="text-emerald-300">@FinanceAgent</code>.
            </p>
          </div>

          <button
            onClick={() => onOpenChat("@IpoAgent")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs tracking-wide transition-all shadow-lg self-start sm:self-auto"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Consultar @IpoAgent</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl">
            <div className="text-xs text-zinc-400 font-medium">{m.label}</div>
            <div className={`text-2xl font-extrabold font-mono mt-1 ${m.color}`}>{m.val}</div>
            <div className="text-[11px] text-zinc-500 mt-1 flex items-center justify-between font-mono">
              <span>{m.change}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Big Four Auditing Assurance */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Auditoria Contínua Big Four (Padrão de Governança)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bigFourAudits.map((item, idx) => (
            <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{item.firm}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {item.scope}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                <span>SOC2 / IFRS</span>
                <span className="text-emerald-400">Verificado</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Energy & BESS Opportunity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Mercado Livre de Energia & BESS</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">
              Alta Rentabilidade
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Arbitragem de energia usando bancos de baterias (BESS) gerenciados por IA. Carga nas horas de baixa tarifa e despacho nas pontas de alta volatilidade.
          </p>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Spread Médio Arbitrado:</span>
            <span className="text-emerald-400 font-bold">R$ 280,00 / MWh</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-purple-400" />
              <span>Tokenomics & Liquidação MEX</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono">
              Deflacionário
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            O token MEX serve como meio soberano de liquidação de microtransações entre agentes e comprovação de PPA on-chain. 2% de cada contrato executado é queimado.
          </p>
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Yield de Staking Institucional:</span>
            <span className="text-purple-300 font-bold">14.2% a.a.</span>
          </div>
        </div>
      </div>

      {/* Visual Animated Tutorial Guide of All Layers */}
      <InteractiveTutorialGuide onOpenChat={onOpenChat} />
    </div>
  )
}
