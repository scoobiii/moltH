import React from "react"
import { BusinessAgentItem } from "./types"
import { INITIAL_AGENTS } from "./data"
import { Cpu, ChevronRight, Zap, ShieldCheck } from "lucide-react"

interface BusinessMeshTopologyProps {
  agents?: BusinessAgentItem[]
  onSelectAgent?: (handle: string) => void
  getFirmBadgeColor?: (firm: string) => string
  onOpenTestSuite?: () => void
}

const defaultFirmBadgeColor = (firm: string) => {
  switch (firm) {
    case "Deloitte": return "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
    case "EY": return "bg-amber-950/70 text-amber-300 border-amber-800/60"
    case "PwC": return "bg-sky-950/70 text-sky-300 border-sky-800/60"
    case "KPMG": return "bg-purple-950/70 text-purple-300 border-purple-800/60"
    default: return "bg-rose-950/70 text-rose-300 border-rose-800/60"
  }
}

export const BusinessMeshTopology: React.FC<BusinessMeshTopologyProps> = ({
  agents = INITIAL_AGENTS,
  onSelectAgent = (_handle: string) => {},
  getFirmBadgeColor = defaultFirmBadgeColor,
  onOpenTestSuite
}) => {
  const safeAgents = agents && Array.isArray(agents) && agents.length > 0 ? agents : INITIAL_AGENTS

  return (
    <div className="px-4 pt-3 max-w-4xl mx-auto w-full space-y-5 text-[#f2e6e4] pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#26262e]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#ffb4a8]" />
            <span>Topologia dos 20 Agentes Soberanos</span>
          </h2>
          <p className="text-xs text-[#b89592] mt-0.5">
            1 Humano Root (Owner) + 12 Agentes de Negócio + 7 Agentes de Tabela WAL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenTestSuite && (
            <button
              onClick={onOpenTestSuite}
              className="text-xs px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 font-semibold transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rodar Testes Soberanos</span>
            </button>
          )}
          <span className="text-xs px-2.5 py-1 rounded-lg bg-[#241718] text-[#ffb4a8] border border-[#4a2e2b] font-mono">
            Isolamento: Nx1 Strict
          </span>
        </div>
      </div>

      {/* Anchor Client Card: Mex Energia */}
      <div className="bg-gradient-to-br from-[#1c181b] to-[#121218] border border-[#3e2c30] rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffb4a8] to-[#802a22] text-black font-extrabold flex items-center justify-center text-sm">
              MEX
            </div>
            <div>
              <div className="text-white font-bold text-sm sm:text-base">Mex Energia S.A. (Cliente Âncora)</div>
              <div className="text-xs text-[#b89592]">Contrato B2B • CapTable Auditado • BESS Storage</div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WAL Sync
          </span>
        </div>
        <div className="mt-3 text-xs text-[#baa19e] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#292936]">
          <div><span className="text-[#8a6b68]">Pipeline:</span> <strong className="text-white">R$ 14.2M</strong></div>
          <div><span className="text-[#8a6b68]">Margem DRE:</span> <strong className="text-emerald-400">41.2%</strong></div>
          <div><span className="text-[#8a6b68]">Envelopes:</span> <strong className="text-white">17 Ativos</strong></div>
          <div><span className="text-[#8a6b68]">Auditor:</span> <strong className="text-[#ffb4a8]">PwC & EY</strong></div>
        </div>
      </div>

      {/* Grid of 20 Agents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {safeAgents.map(ag => (
          <div
            key={ag.id}
            onClick={() => onSelectAgent(ag.handle)}
            className="bg-[#14141c] border border-[#272736] hover:border-[#ffb4a8]/50 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-[#181822] group shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="text-xl mt-0.5">{ag.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#ffb4a8] transition-colors flex items-center gap-1.5">
                    <span>{ag.name}</span>
                    {ag.category === "Human Root" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">ROOT</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#c9a09c] mt-0.5">{ag.role}</div>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getFirmBadgeColor(ag.firm)}`}>
                {ag.firm}
              </span>
            </div>

            {ag.cordelVerso && (
              <p className="mt-2 text-[11px] text-[#baa19e] font-serif italic line-clamp-1">
                "{ag.cordelVerso}"
              </p>
            )}

            <div className="mt-3 pt-2 border-t border-[#22222e] flex items-center justify-between text-[10px] text-[#9c7875]">
              <span className="font-mono text-[#baa19e]">{ag.model}</span>
              <span className="font-mono text-emerald-400/80">rid: {ag.runtimeId}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
