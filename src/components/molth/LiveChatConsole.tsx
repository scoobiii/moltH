import React, { useState, useRef, useEffect } from "react"
import { ChatMessage, BusinessAgentItem } from "./types"
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  AtSign, 
  Info,
  Layers,
  Zap,
  RotateCcw
} from "lucide-react"

interface LiveChatConsoleProps {
  messages: ChatMessage[]
  agents: BusinessAgentItem[]
  selectedTarget: string
  onSelectTarget: (handle: string) => void
  onClearChat: () => void
  showToast: (msg: string) => void
}

export const LiveChatConsole: React.FC<LiveChatConsoleProps> = ({
  messages,
  agents,
  selectedTarget,
  onSelectTarget,
  onClearChat,
  showToast
}) => {
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copiado!`)
  }

  const selectedAgentInfo = agents.find(a => a.handle === selectedTarget)

  return (
    <div className="px-4 pt-3 max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-[calc(100vh-140px)]">
      
      {/* Target Selector & Status Header */}
      <div className="bg-[#14141c] border border-[#2b2b3a] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-[#291716] text-[#ffb4a8] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#9c7875] font-semibold uppercase tracking-wider">Canal Ativo</div>
            <select
              value={selectedTarget}
              onChange={(e) => onSelectTarget(e.target.value)}
              className="bg-[#1b1b24] border border-[#38384a] rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-[#ffb4a8] font-medium"
            >
              <option value="@AllMesh">🌐 @AllMesh (Cluster dos 20 Agentes)</option>
              {agents.map(ag => (
                <option key={ag.id} value={ag.handle}>
                  {ag.avatar} {ag.handle} • {ag.role} ({ag.firm})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Diálogo Puro • Selo Ativo</span>
          </span>

          <button
            onClick={onClearChat}
            className="p-1.5 rounded-lg bg-[#20202a] text-[#a6827f] hover:text-white hover:bg-[#282834] transition-colors"
            title="Limpar histórico do chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Agent Details Pill (if specific agent selected) */}
      {selectedAgentInfo && (
        <div className="mt-2 px-3 py-2 bg-[#121218] border border-[#22222e] rounded-xl flex items-center justify-between text-xs text-[#b89592]">
          <div className="flex items-center gap-2 truncate">
            <span>{selectedAgentInfo.avatar}</span>
            <strong className="text-white">{selectedAgentInfo.name}</strong>
            <span className="text-[#ffb4a8]">• {selectedAgentInfo.firm}</span>
            <span className="text-[11px] text-[#8e6d6a] hidden sm:inline font-mono">({selectedAgentInfo.model})</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0">
            Wallet: {selectedAgentInfo.wallet.address.slice(0, 6)}...
          </span>
        </div>
      )}

      {/* Messages Stream - Full Content Visibility */}
      <div className="mt-4 space-y-4 flex-1 pb-24">
        {messages.map(msg => {
          const isProofOpen = expandedProofId === msg.id

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 border ${
                msg.role === "user" 
                  ? "bg-[#331b19] border-[#5e2b26]" 
                  : "bg-[#181822] border-[#2f2f40]"
              }`}>
                {msg.avatar}
              </div>

              {/* Message Bubble Body */}
              <div className={`p-4 rounded-2xl text-xs sm:text-sm ${
                msg.role === "user"
                  ? "bg-[#ffb4a8] text-black font-medium rounded-tr-none shadow-lg"
                  : "bg-[#16151e] text-[#f2e6e4] border border-[#302a36] rounded-tl-none shadow-md"
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-2 pb-1 border-b border-black/10 dark:border-[#242434]">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${msg.role === "user" ? "text-neutral-900" : "text-white"}`}>
                      {msg.sender}
                    </span>

                    {/* Sovereign Seal (Selo Soberano) for Sovereign Agents */}
                    {msg.role === "agent" && (
                      <button
                        onClick={() => setExpandedProofId(isProofOpen ? null : msg.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#291716] border border-[#522825] text-[#ffb4a8] hover:bg-[#381e1c] text-[10px] font-semibold transition-all"
                        title="Clique para ver o Selo Soberano e Prova de Execução Criptográfica"
                      >
                        <span>⚜️ Selo Soberano</span>
                        {isProofOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  <span className={`text-[10px] ${msg.role === "user" ? "text-neutral-700" : "text-[#8a6b68]"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Pure Conversational Content (Ampliado / Full Height) */}
                <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#f0e4e2] dark:text-[#f0e4e2] [word-break:break-word]">
                  {msg.content}
                </div>

                {/* Collapsible Sovereign Vortex Proof Drawer */}
                {msg.role === "agent" && isProofOpen && (
                  <div className="mt-3 p-3 rounded-xl bg-[#0e0d12] border border-[#2a2a38] text-[11px] text-[#baa19e] space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold border-b border-[#22222e] pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Certificado Soberano (Vortex GOS3 v1.3)
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.evidenceHash || "", "Hash SHA-256")}
                        className="text-[10px] text-[#ffb4a8] hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar Hash
                      </button>
                    </div>

                    <div className="font-mono text-[10px] text-emerald-300 break-all bg-[#09090c] p-2 rounded border border-[#1e1e28]">
                      evidence_hash: {msg.evidenceHash || "sha256-427273fd001a4e58b19280d832709e992b1a"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                      <div>
                        <span className="text-[#8a6b68]">Runtime Sandbox:</span>{" "}
                        <strong className="text-white">{msg.sandboxProof?.runtime || "Nx1 Isolate #427273fd"}</strong>
                      </div>
                      <div>
                        <span className="text-[#8a6b68]">Auditor:</span>{" "}
                        <strong className="text-[#ffb4a8]">{msg.sandboxProof?.auditor || "Deloitte ADR-003"}</strong>
                      </div>
                      <div>
                        <span className="text-[#8a6b68]">Latência:</span>{" "}
                        <strong className="text-emerald-400">{msg.sandboxProof?.latencyMs || 14} ms</strong>
                      </div>
                      <div>
                        <span className="text-[#8a6b68]">Custo Gas/Energia:</span>{" "}
                        <strong className="text-white">{msg.sandboxProof?.gasUsed || "0.0018 MEX"}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

    </div>
  )
}
