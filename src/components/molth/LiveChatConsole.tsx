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
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowDown,
  Expand,
  FileText,
  X
} from "lucide-react"

interface LiveChatConsoleProps {
  messages: ChatMessage[]
  agents: BusinessAgentItem[]
  selectedTarget: string
  onSelectTarget: (handle: string) => void
  onClearChat: () => void
  showToast: (msg: string) => void
  onOpenCrmOnboarding?: () => void
  onViewCrmPipeline?: () => void
}

export const LiveChatConsole: React.FC<LiveChatConsoleProps> = ({
  messages,
  agents,
  selectedTarget,
  onSelectTarget,
  onClearChat,
  showToast,
  onOpenCrmOnboarding,
  onViewCrmPipeline
}) => {
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null)
  const [autoExpandAll, setAutoExpandAll] = useState<boolean>(true)
  const [modalMessage, setModalMessage] = useState<ChatMessage | null>(null)
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on messages change or when expanding
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto", 
      block: "end" 
    })
  }

  useEffect(() => {
    scrollToBottom(true)
  }, [messages, autoExpandAll, expandedProofId])

  // Track scroll position to show "Scroll to bottom" helper button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120
    setShowScrollBottomBtn(!isNearBottom)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copiado!`)
  }

  const selectedAgentInfo = agents.find(a => a.handle === selectedTarget)

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="px-3 sm:px-4 pt-2 max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-[calc(100vh-130px)] relative"
    >
      
      {/* Target Selector & Status Header */}
      <div className="bg-[#14141c] border border-[#2b2b3a] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 shadow-lg sticky top-0 z-20 backdrop-blur-md bg-[#14141c]/95">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-[#291716] text-[#ffb4a8] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#9c7875] font-semibold uppercase tracking-wider">Canal Ativo</div>
            <select
              value={selectedTarget}
              onChange={(e) => onSelectTarget(e.target.value)}
              className="bg-[#1b1b24] border border-[#38384a] rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#ffb4a8] font-medium max-w-[200px] sm:max-w-xs truncate"
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Auto-Expand Toggle */}
          <button
            onClick={() => {
              const next = !autoExpandAll
              setAutoExpandAll(next)
              showToast(next ? "Expansão automática ativada!" : "Modo compacto ativado.")
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 border ${
              autoExpandAll
                ? "bg-[#2d1816] text-[#ffb4a8] border-[#5e2b26]"
                : "bg-[#181822] text-[#9c7875] border-[#2c2c3c] hover:text-white"
            }`}
            title="Ativar/Desativar auto-expansão total das mensagens"
          >
            <Expand className="w-3 h-3" />
            <span className="hidden xs:inline">{autoExpandAll ? "Auto-Expansão: ON" : "Auto-Expansão: OFF"}</span>
            <span className="xs:hidden">Auto</span>
          </button>

          <button
            onClick={onClearChat}
            className="p-1.5 rounded-xl bg-[#20202a] text-[#a6827f] hover:text-white hover:bg-[#282834] transition-colors border border-[#2c2c3c]"
            title="Limpar histórico do chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Agent Details Pill (if specific agent selected) */}
      {selectedAgentInfo && (
        <div className="mt-2 px-3 py-1.5 bg-[#121218] border border-[#22222e] rounded-xl flex items-center justify-between text-xs text-[#b89592]">
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

      {/* Messages Stream - Generous Bottom Padding (pb-44) to prevent bottom bar overlapping */}
      <div className="mt-4 space-y-4 flex-1 pb-44 sm:pb-36">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-[#13131a] border border-[#262634] rounded-3xl p-6 my-4">
            <Bot className="w-10 h-10 text-[#ffb4a8] mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-white">Console Multiagente Aberto</h3>
            <p className="text-xs text-[#baa19e] mt-1 max-w-md mx-auto">
              Digite uma instrução abaixo ou use <strong className="text-[#ffb4a8]">@</strong> para direcionar a qualquer um dos 20 agentes em sandbox isolado Nx1.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isProofOpen = expandedProofId === msg.id || (autoExpandAll && index === messages.length - 1)

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 w-full transition-all ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center text-sm shrink-0 border mt-0.5 ${
                  msg.role === "user" 
                    ? "bg-[#331b19] border-[#5e2b26]" 
                    : "bg-[#181822] border-[#2f2f40]"
                }`}>
                  {msg.avatar}
                </div>

                {/* Message Bubble Body - Fully Auto-Expanding width & height */}
                <div className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm max-w-[88%] sm:max-w-[82%] shadow-md transition-all ${
                  msg.role === "user"
                    ? "bg-[#ffb4a8] text-black font-medium rounded-tr-none shadow-lg"
                    : "bg-[#16151e] text-[#f2e6e4] border border-[#302a36] rounded-tl-none"
                }`}>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-black/10 dark:border-[#242434]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold ${msg.role === "user" ? "text-neutral-900" : "text-white"}`}>
                        {msg.sender}
                      </span>

                      {/* Sovereign Seal Toggle */}
                      {msg.role === "agent" && (
                        <button
                          onClick={() => setExpandedProofId(isProofOpen ? null : msg.id)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#291716] border border-[#522825] text-[#ffb4a8] hover:bg-[#381e1c] text-[10px] font-semibold transition-all"
                          title="Clique para ver o Selo Soberano e Prova de Execução Criptográfica"
                        >
                          <span>⚜️ Selo</span>
                          {isProofOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] ${msg.role === "user" ? "text-neutral-700" : "text-[#8a6b68]"}`}>
                        {msg.timestamp}
                      </span>

                      {/* Expand / Maximize Modal Button */}
                      <button
                        onClick={() => setModalMessage(msg)}
                        className={`p-1 rounded hover:bg-black/10 text-[10px] transition-all ${
                          msg.role === "user" ? "text-neutral-800" : "text-[#9c7875] hover:text-white"
                        }`}
                        title="Expandir em tela cheia para ver toda a mensagem"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Pure Conversational Content (Completamente Visível e Sem Truncamento) */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#f0e4e2] dark:text-[#f0e4e2] [word-break:break-word] select-text">
                    {msg.content}
                  </div>

                  {/* Collapsible Sovereign Vortex Proof Drawer */}
                  {msg.role === "agent" && isProofOpen && (
                    <div className="mt-3 p-3 rounded-xl bg-[#0e0d12] border border-[#2a2a38] text-[11px] text-[#baa19e] space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between text-emerald-400 font-semibold border-b border-[#22222e] pb-1.5">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Certificado Soberano (Vortex GOS3 v1.3)
                        </span>
                        <button
                          onClick={() => copyToClipboard(msg.evidenceHash || "", "Hash SHA-256")}
                          className="text-[10px] text-[#ffb4a8] hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                      </div>

                      <div className="font-mono text-[10px] text-emerald-300 break-all bg-[#09090c] p-2 rounded border border-[#1e1e28]">
                        evidence_hash: {msg.evidenceHash || "sha256-427273fd001a4e58b19280d832709e992b1a"}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div>
                          <span className="text-[#8a6b68]">Runtime:</span>{" "}
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
                          <span className="text-[#8a6b68]">Custo Gas:</span>{" "}
                          <strong className="text-white">{msg.sandboxProof?.gasUsed || "0.0018 MEX"}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Scroll buffer anchor with safety clearance */}
        <div ref={messagesEndRef} className="h-10 w-full" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-36 md:bottom-24 right-6 z-40 p-2.5 rounded-full bg-[#ffb4a8] text-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
          title="Rolar para a mensagem mais recente"
        >
          <ArrowDown className="w-4 h-4" />
          <span className="hidden sm:inline">Mais recente</span>
        </button>
      )}

      {/* Full-Screen Message Expansion Modal (Para ver toda a mensagem sem limitações) */}
      {modalMessage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setModalMessage(null)}
        >
          <div 
            className="bg-[#14141c] border border-[#3e2c30] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{modalMessage.avatar}</span>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>{modalMessage.sender}</span>
                    {modalMessage.role === "agent" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#291716] text-[#ffb4a8] border border-[#522825]">
                        Soberano
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8a6b68]">{modalMessage.timestamp}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(modalMessage.content, "Texto da mensagem")}
                  className="p-2 rounded-xl bg-[#1e1e28] text-[#ffb4a8] hover:bg-[#282836] text-xs font-medium flex items-center gap-1"
                  title="Copiar texto completo"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar</span>
                </button>

                <button 
                  onClick={() => setModalMessage(null)}
                  className="p-2 rounded-full text-[#9c7875] hover:bg-[#202028] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Full Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm text-[#f5eae8] leading-relaxed select-text font-sans">
              <div className="p-4 rounded-2xl bg-[#0d0d12] border border-[#22222e] whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {modalMessage.content}
              </div>

              {/* Full Evidence & Audit Certificate */}
              {modalMessage.role === "agent" && (
                <div className="p-4 rounded-2xl bg-[#0a0a0f] border border-[#262636] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Certificado de Execução Zero-Trust (Vortex GOS3 v1.3)
                    </span>
                    <span className="font-mono text-[10px] text-[#ffb4a8]">Mex Energia Consórcio</span>
                  </div>

                  <div className="font-mono text-xs text-emerald-300 break-all bg-[#050508] p-3 rounded-xl border border-[#1b1b26]">
                    evidence_hash: {modalMessage.evidenceHash || "sha256-427273fd001a4e58b19280d832709e992b1a9bb047f6"}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-2 bg-[#121218] rounded-xl border border-[#1e1e28]">
                      <div className="text-[10px] text-[#8a6b68]">Runtime</div>
                      <div className="text-white font-bold mt-0.5">{modalMessage.sandboxProof?.runtime || "Nx1 Isolate"}</div>
                    </div>
                    <div className="p-2 bg-[#121218] rounded-xl border border-[#1e1e28]">
                      <div className="text-[10px] text-[#8a6b68]">Auditor</div>
                      <div className="text-[#ffb4a8] font-bold mt-0.5">{modalMessage.sandboxProof?.auditor || "Deloitte ADR-003"}</div>
                    </div>
                    <div className="p-2 bg-[#121218] rounded-xl border border-[#1e1e28]">
                      <div className="text-[10px] text-[#8a6b68]">Latência</div>
                      <div className="text-emerald-400 font-bold mt-0.5">{modalMessage.sandboxProof?.latencyMs || 14} ms</div>
                    </div>
                    <div className="p-2 bg-[#121218] rounded-xl border border-[#1e1e28]">
                      <div className="text-[10px] text-[#8a6b68]">Custo Gas</div>
                      <div className="text-white font-bold mt-0.5">{modalMessage.sandboxProof?.gasUsed || "0.0018 MEX"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#242434] flex justify-end">
              <button
                onClick={() => setModalMessage(null)}
                className="py-2 px-5 rounded-xl bg-[#ffb4a8] text-black font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

