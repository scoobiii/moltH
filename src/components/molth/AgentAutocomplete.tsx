import React from "react"
import { BusinessAgentItem } from "./types"

interface AgentAutocompleteProps {
  query: string
  matchingAgents: BusinessAgentItem[]
  onSelectAgent: (agent: BusinessAgentItem) => void
  getFirmBadgeColor: (firm: string) => string
}

export const AgentAutocomplete: React.FC<AgentAutocompleteProps> = ({
  query,
  matchingAgents,
  onSelectAgent,
  getFirmBadgeColor
}) => {
  return (
    <div className="bg-[#161622] border border-[#3e2c30] rounded-2xl shadow-2xl p-2 max-h-64 overflow-y-auto space-y-1 z-50">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9c7875] flex items-center justify-between border-b border-[#262634]">
        <span>Selecione um Agente (20 disponíveis)</span>
        <span className="font-mono text-[#ffb4a8]">@{query}</span>
      </div>

      {matchingAgents.length === 0 ? (
        <div className="p-3 text-xs text-[#8a6b68] text-center">Nenhum agente correspondente.</div>
      ) : (
        matchingAgents.map((ag) => (
          <div
            key={ag.id}
            onClick={() => onSelectAgent(ag)}
            className="px-3 py-2 rounded-xl hover:bg-[#281c1c] text-left cursor-pointer flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{ag.avatar}</span>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#ffb4a8]">{ag.handle}</div>
                <div className="text-[11px] text-[#b89592]">{ag.role}</div>
              </div>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getFirmBadgeColor(ag.firm)}`}>
              {ag.firm}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
