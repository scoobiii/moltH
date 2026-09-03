import React, { useState, useMemo, useEffect } from "react"
import { 
  BusinessAgentItem, 
  AgentPost, 
  ChatMessage, 
  UserAuthProfile 
} from "./molth/types"
import { 
  DEFAULT_USER, 
  GUEST_USER,
  INITIAL_AGENTS, 
  INITIAL_MESSAGES, 
  INITIAL_POSTS 
} from "./molth/data"
import { MoltHLanding } from "./molth/MoltHLanding"
import { LiveChatConsole } from "./molth/LiveChatConsole"
import { CryptoAndConnectors } from "./molth/CryptoAndConnectors"
import { ResearchFeed } from "./molth/ResearchFeed"
import { BusinessMeshTopology } from "./molth/BusinessMeshTopology"
import { AuthModal } from "./molth/AuthModal"
import { AgentAutocomplete } from "./molth/AgentAutocomplete"

import {
  Sparkles,
  Bot,
  Send,
  Bookmark,
  Settings,
  User,
  Plus,
  Menu,
  X,
  ChevronRight,
  Cpu,
  ShieldCheck,
  Zap,
  Search,
  ArrowUpRight,
  Layers,
  Globe,
  Clock,
  Sparkle,
  AtSign,
  Coins,
  LogOut,
  Key,
  HelpCircle
} from "lucide-react"

const STORAGE_KEY = "molth_gos3_state_v3"

export default function YAIMoltH() {
  // Global State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<UserAuthProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`)
      return saved ? JSON.parse(saved) : GUEST_USER
    } catch {
      return GUEST_USER
    }
  })

  const [agents, setAgents] = useState<BusinessAgentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_agents`)
      return saved ? JSON.parse(saved) : INITIAL_AGENTS
    } catch {
      return INITIAL_AGENTS
    }
  })

  const [posts, setPosts] = useState<AgentPost[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_posts`)
      return saved ? JSON.parse(saved) : INITIAL_POSTS
    } catch {
      return INITIAL_POSTS
    }
  })

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`)
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES
    } catch {
      return INITIAL_MESSAGES
    }
  })

  // Navigation State
  const [activeNav, setActiveNav] = useState<"landing" | "feed" | "mesh" | "chat" | "crypto" | "bookmarks" | "settings">("landing")
  const [settingsTab, setSettingsTab] = useState<"General" | "Notifications" | "Subscription" | "Security">("General")
  
  // Modals & UI Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Live Chat & Sticky Input State
  const [chatInput, setChatInput] = useState("")
  const [selectedAgentTarget, setSelectedAgentTarget] = useState<string>("@AllMesh")
  const [autocompleteQuery, setAutocompleteQuery] = useState<string | null>(null)

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser))
      localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents))
      localStorage.setItem(`${STORAGE_KEY}_posts`, JSON.stringify(posts))
      localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages))
    } catch (e) {
      console.warn("Storage sync warning", e)
    }
  }, [currentUser, agents, posts, messages])

  // Autocomplete Filter
  const matchingAgents = useMemo(() => {
    if (autocompleteQuery === null) return []
    const q = autocompleteQuery.toLowerCase()
    return agents.filter(ag => 
      ag.handle.toLowerCase().includes(q) ||
      ag.name.toLowerCase().includes(q) ||
      ag.role.toLowerCase().includes(q) ||
      ag.firm.toLowerCase().includes(q)
    )
  }, [autocompleteQuery, agents])

  const handleInputChangeWithAutocomplete = (val: string) => {
    setChatInput(val)

    const lastAtIndex = val.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const textAfterAt = val.slice(lastAtIndex + 1)
      if (!textAfterAt.includes(" ")) {
        setAutocompleteQuery(textAfterAt)
        return
      }
    }
    setAutocompleteQuery(null)
  }

  const applyAgentAutocomplete = (agent: BusinessAgentItem) => {
    const lastAtIndex = chatInput.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const prefix = chatInput.slice(0, lastAtIndex)
      setChatInput(`${prefix}${agent.handle} `)
    } else {
      setChatInput(`${agent.handle} `)
    }
    setSelectedAgentTarget(agent.handle)
    setAutocompleteQuery(null)
    showToast(`Agente ${agent.handle} selecionado!`)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Like & Bookmark Actions
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const nextLiked = !p.isLiked
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        }
      }
      return p
    }))
  }

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const nextBookmarked = !p.isBookmarked
        showToast(nextBookmarked ? "Paper salvo nos Marcadores!" : "Removido dos Marcadores.")
        return { ...p, isBookmarked: nextBookmarked }
      }
      return p
    }))
  }

  // Send Message with Pure Sovereign Speech & Separate Cryptographic Vortex Seal
  const handleSendMessage = () => {
    if (!chatInput.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser.isLoggedIn ? currentUser.name : "Visitante (@guest)",
      role: "user",
      avatar: currentUser.isLoggedIn ? currentUser.avatar : "👤",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, userMsg])
    const prompt = chatInput
    setChatInput("")
    setAutocompleteQuery(null)

    // Agent response generation with clean speech & separate sovereign seal
    setTimeout(() => {
      const mentionedAgent = agents.find(a => prompt.includes(a.handle))
      const targetHandle = mentionedAgent ? mentionedAgent.handle : (selectedAgentTarget === "@AllMesh" ? "@ComplianceAgent" : selectedAgentTarget)
      const agentData = agents.find(a => a.handle === targetHandle)

      let cleanSpeech = ""
      if (targetHandle === "@ComplianceAgent") {
        cleanSpeech = `Diretiva de conformidade processada com sucesso no consórcio Mex Energia. Todos os requisitos de LGPD e governança ADR-003 foram satisfeitos no isolamento Nx1.`
      } else if (targetHandle === "@FinanceAgent") {
        cleanSpeech = `Demonstrativo DRE atualizado. Os fluxos de caixa e liquidações B2B/BESS foram conciliados com os contratos de geração distribuída.`
      } else if (targetHandle === "@CrmAgent" || targetHandle === "@CommercialAgent") {
        cleanSpeech = `Qualificação comercial concluída via algoritmo TTPO. 4 novos clientes industriais do Nordeste foram encaminhados para proposta de PPA solar.`
      } else {
        cleanSpeech = `Invocação de ${targetHandle} concluída com sucesso no cluster de energia. O processamento foi executado em ambiente estritamente soberano e isolado.`
      }

      const botResponse: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: targetHandle,
        role: "agent",
        avatar: agentData?.avatar || "🤖",
        firm: agentData?.firm || "GOS3",
        isSovereign: true,
        content: cleanSpeech,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        evidenceHash: `sha256-${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        model: `${agentData?.model || "MoltH Hybrid Gateway"}`,
        sandboxProof: {
          runtime: `Nx1 Sandbox #${agentData?.runtimeId || "427273fd"}`,
          latencyMs: Math.floor(Math.random() * 20) + 10,
          gasUsed: "0.0019 MEX",
          auditor: `${agentData?.firm || "Big Four"} Audit Protocol`,
          envTag: "node-linux / termux"
        }
      }

      setMessages(prev => [...prev, botResponse])
      showToast(`Resposta recebida de ${targetHandle}`)
    }, 500)
  }

  const handleUpdateAgent = (updatedAgent: BusinessAgentItem) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a))
  }

  const getFirmBadgeColor = (firm: string) => {
    switch (firm) {
      case "Deloitte": return "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
      case "EY": return "bg-amber-950/70 text-amber-300 border-amber-800/60"
      case "PwC": return "bg-sky-950/70 text-sky-300 border-sky-800/60"
      case "KPMG": return "bg-purple-950/70 text-purple-300 border-purple-800/60"
      default: return "bg-rose-950/70 text-rose-300 border-rose-800/60"
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#f0e4e2] font-sans flex flex-col md:flex-row antialiased selection:bg-[#ffb4a8] selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#2b1816] text-[#ffb4a8] border border-[#ffb4a8]/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#ffb4a8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        showToast={showToast}
      />

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[300px] bg-[#121216] border-r border-[#26262e]
        flex flex-col p-4 transition-transform duration-300 ease-in-out shrink-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Top Brand */}
        <div className="flex items-center justify-between pb-4 border-b border-[#26262e]">
          <div 
            onClick={() => {
              setActiveNav("landing")
              setIsSidebarOpen(false)
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffb4a8] to-[#802a22] flex items-center justify-center text-black font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                MoltH Hub <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#331c1a] text-[#ffb4a8] border border-[#522925]">v1.3</span>
              </div>
              <div className="text-[11px] text-[#b89592]">20 Agentes • Cordel Tech</div>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg text-[#b89592] hover:bg-[#202026] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={() => {
            setActiveNav("chat")
            setIsSidebarOpen(false)
            showToast("Console multiagente aberto!")
          }}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ffb4a8] to-[#ff8c7a] text-black font-semibold text-sm shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Novo Diálogo Multiagente</span>
        </button>

        {/* Navigation Links */}
        <div className="mt-5 space-y-1">
          {[
            { id: "landing", label: "Cordel Overview", icon: Globe, count: "Home" },
            { id: "chat", label: "Live Console & Diálogo", icon: Bot, count: "Live" },
            { id: "crypto", label: "Carteiras Cripto & APIs", icon: Coins, count: "20" },
            { id: "mesh", label: "20 Agentes Topologia", icon: Cpu, count: "20" },
            { id: "feed", label: "Pesquisa & Big Four", icon: Layers, count: posts.length },
            { id: "bookmarks", label: "Salvos & Papers", icon: Bookmark, count: posts.filter(p => p.isBookmarked).length },
            { id: "settings", label: "Configurações & Planos", icon: Settings }
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id as any)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#2d1816] text-[#ffb4a8] border border-[#ffb4a8]/30 font-semibold"
                    : "text-[#c2a19e] hover:bg-[#1c1c22] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#ffb4a8]" : "text-[#947370]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-[#ffb4a8] text-black font-bold" : "bg-[#202026] text-[#b89592]"
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* User Card in Sidebar */}
        <div className="mt-5 p-3 rounded-2xl bg-[#171620] border border-[#2c2b3c] flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-xl shrink-0">{currentUser.avatar}</span>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                {currentUser.isLoggedIn && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#331b19] text-[#ffb4a8] rounded font-bold uppercase shrink-0">
                    {currentUser.provider}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#baa19e] truncate font-mono">
                {currentUser.isLoggedIn ? currentUser.handle : "Modo Visitante"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {currentUser.isLoggedIn && (
              <button
                onClick={() => {
                  setCurrentUser(GUEST_USER)
                  showToast("Sessão desconectada com sucesso.")
                }}
                className="p-1.5 rounded-lg bg-[#271816] text-[#ffb4a8] hover:bg-[#381e1a] transition-colors"
                title="Sair (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-1.5 rounded-lg bg-[#271816] text-[#ffb4a8] hover:bg-[#381e1a] transition-colors"
              title={currentUser.isLoggedIn ? "Gerenciar Conta" : "Entrar / Cadastrar"}
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#26262e] text-[11px] text-[#a6827f]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-semibold">20 Sandboxes Nx1 Ativos</span>
          </div>
          <div className="font-mono text-[10px] text-[#8e6d6a] leading-tight">
            Mex Energia Hub • GOS3 v1.3<br />
            Persistência Global Ativa ✓
          </div>
        </div>
      </aside>

      {/* ===================== MAIN WRAPPER ===================== */}
      <main className="flex-1 flex flex-col min-h-screen pb-28 md:pb-12 overflow-x-hidden relative">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#0d0d0f]/95 backdrop-blur-md border-b border-[#26262e] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#1a1a20] text-[#ffb4a8] border border-[#332626] hover:bg-[#25252e] active:scale-95 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#ffb4a8] bg-[#331c1a] px-2.5 py-1 rounded-full border border-[#592c28] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cordel</span> Mesh
              </span>
              <span className="text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-[280px]">
                {activeNav === "landing" && "Visão Geral Cordel Tech"}
                {activeNav === "chat" && "Live Console Soberano"}
                {activeNav === "crypto" && "Carteiras & Conectores API"}
                {activeNav === "mesh" && "Topologia dos 20 Agentes"}
                {activeNav === "feed" && "Pesquisa & Big Four"}
                {activeNav === "bookmarks" && "Papers Salvos"}
                {activeNav === "settings" && "Configurações"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9e7d7a]" />
              <input
                type="text"
                placeholder="Buscar na rede MoltH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181f] border border-[#2d2d38] rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8a6b68] focus:outline-none focus:border-[#ffb4a8]"
              />
            </div>

            {currentUser.isLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#251717] border border-[#542724] text-[#ffb4a8] text-xs font-medium flex items-center gap-1.5 hover:bg-[#381e1c] transition-all"
                  title="Gerenciar Conta"
                >
                  <span>{currentUser.avatar}</span>
                  <span className="hidden xs:inline">{currentUser.name}</span>
                  <span className="text-[9px] px-1 bg-[#3d1e1a] rounded text-[#ffb4a8] font-bold uppercase">
                    {currentUser.provider}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(GUEST_USER)
                    showToast("Sessão desconectada com sucesso.")
                  }}
                  className="p-1.5 rounded-full bg-[#1e1414] border border-[#42201d] text-[#ffb4a8] hover:bg-[#331a17] transition-all"
                  title="Fazer Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ffb4a8] to-[#ff9887] text-black text-xs font-bold flex items-center gap-1.5 hover:opacity-95 active:scale-95 shadow-md transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z" />
                </svg>
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </header>

        {/* View Routing */}
        {activeNav === "landing" && (
          <MoltHLanding />
        )}

        {activeNav === "chat" && (
          <LiveChatConsole
            messages={messages}
            agents={agents}
            selectedTarget={selectedAgentTarget}
            onSelectTarget={(handle) => {
              setSelectedAgentTarget(handle)
              setChatInput(`${handle} `)
            }}
            onClearChat={() => {
              setMessages([])
              showToast("Histórico de mensagens limpo.")
            }}
            showToast={showToast}
          />
        )}

        {activeNav === "crypto" && (
          <CryptoAndConnectors
            agents={agents}
            currentUser={currentUser}
            onUpdateAgent={handleUpdateAgent}
            showToast={showToast}
          />
        )}

        {activeNav === "mesh" && (
          <BusinessMeshTopology
            agents={agents}
            onSelectAgent={(handle) => {
              setSelectedAgentTarget(handle)
              setActiveNav("chat")
              setChatInput(`${handle} `)
              showToast(`Invocando ${handle} no console...`)
            }}
            getFirmBadgeColor={getFirmBadgeColor}
          />
        )}

        {activeNav === "feed" && (
          <ResearchFeed
            posts={posts}
            searchQuery={searchQuery}
            onToggleLike={handleToggleLike}
            onToggleBookmark={handleToggleBookmark}
            onLaunchChat={(agentName) => {
              setSelectedAgentTarget(agentName)
              setActiveNav("chat")
              setChatInput(`${agentName} `)
              showToast(`Debatendo com ${agentName}`)
            }}
            showToast={showToast}
            getFirmBadgeColor={getFirmBadgeColor}
          />
        )}

        {activeNav === "bookmarks" && (
          <div className="px-4 pt-3 max-w-4xl mx-auto w-full pb-24 text-[#f2e6e4]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-[#26262e]">
              <Bookmark className="w-5 h-5 text-[#ffb4a8]" />
              <span>Papers & Certificados Salvos ({posts.filter(p => p.isBookmarked).length})</span>
            </h2>

            <div className="mt-4 space-y-3">
              {posts.filter(p => p.isBookmarked).length === 0 ? (
                <div className="text-center py-12 bg-[#14141c] border border-[#272736] rounded-2xl p-6">
                  <Bookmark className="w-8 h-8 text-[#8a6b68] mx-auto mb-2" />
                  <div className="text-white font-semibold text-sm">Nenhum paper salvo ainda</div>
                  <div className="text-xs text-[#a6827f] mt-1">Marque cards no Feed para manter seu repositório de consulta aqui.</div>
                </div>
              ) : (
                posts.filter(p => p.isBookmarked).map(post => (
                  <div
                    key={post.id}
                    className="bg-[#14141c] border border-[#272736] rounded-xl p-4 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#ffb4a8]">{post.agentName}</span>
                        <span className="text-[10px] text-[#9c7875] font-mono">{post.modelTag}</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">{post.title}</div>
                      <div className="text-xs text-[#baa19e] mt-1">{post.desc}</div>
                    </div>
                    <button
                      onClick={(e) => handleToggleBookmark(post.id, e)}
                      className="p-2 rounded-lg bg-[#2e1a18] text-[#ffb4a8] hover:bg-[#3d201d]"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeNav === "settings" && (
          <div className="px-4 pt-3 max-w-4xl mx-auto w-full pb-24 text-[#f2e6e4]">
            <h2 className="text-xl font-bold text-white">Configurações do Hub & Governança</h2>
            
            <div className="mt-3 flex gap-2 border-b border-[#26262e] text-xs sm:text-sm overflow-x-auto pb-1">
              {["General", "Notifications", "Subscription", "Security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab as any)}
                  className={`pb-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-all ${
                    settingsTab === tab
                      ? "border-[#ffb4a8] text-[#ffb4a8] font-bold"
                      : "border-transparent text-[#9e7d7a] hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {settingsTab === "General" && (
              <div className="mt-4 bg-[#14141c] border border-[#272736] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{currentUser.avatar}</div>
                    <div>
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <span>{currentUser.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          currentUser.isLoggedIn ? "bg-[#ffb4a8] text-black" : "bg-[#252532] text-[#baa19e]"
                        }`}>
                          {currentUser.isLoggedIn ? currentUser.provider : "Visitante"}
                        </span>
                      </div>
                      <div className="text-xs text-[#c9a09c]">{currentUser.role}</div>
                      {currentUser.isLoggedIn && (
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          Chave Root: {currentUser.walletAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  {currentUser.isLoggedIn && (
                    <button
                      onClick={() => {
                        setCurrentUser(GUEST_USER)
                        showToast("Sessão desconectada.")
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#2b1816] text-[#ffb4a8] border border-[#522925] text-xs font-semibold hover:bg-[#3d1e1a] flex items-center gap-1.5 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da Conta</span>
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-[#22222e] flex items-center justify-between flex-wrap gap-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#ffb4a8] text-black font-bold text-xs hover:opacity-90 transition-all"
                  >
                    {currentUser.isLoggedIn ? "Gerenciar Login & Chave Soberana" : "Entrar com Google ou @/Senha"}
                  </button>

                  <button
                    onClick={() => {
                      localStorage.clear()
                      showToast("Estado persistente resetado!")
                      window.location.reload()
                    }}
                    className="px-3 py-2 rounded-xl bg-[#241718] text-[#ffb4a8] border border-[#4a2e2b] text-xs hover:bg-[#331c1a] transition-all"
                  >
                    Limpar Cache Local
                  </button>
                </div>
              </div>
            )}

            {settingsTab === "Security" && (
              <div className="mt-4 bg-[#14141c] border border-[#272736] rounded-2xl p-5 space-y-3">
                <div className="text-white font-bold text-sm">GOS3 Zero-Trust Security & Cordel Shield</div>
                <div className="text-xs text-[#baa19e] leading-relaxed">
                  Toda invocação de ferramenta em sandbox gera o cálculo determinístico de prova:<br />
                  <code className="block mt-1.5 p-2 rounded-lg bg-[#0d0d12] border border-[#282836] text-emerald-400 font-mono text-[11px]">
                    evidence_hash = sha256(stdout + stderr + exit_code + duration_ms)
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Autocomplete Dropdown */}
        {autocompleteQuery !== null && (
          <div className="sticky bottom-32 md:bottom-20 z-40 px-4 max-w-4xl mx-auto w-full">
            <AgentAutocomplete
              query={autocompleteQuery}
              matchingAgents={matchingAgents}
              onSelectAgent={applyAgentAutocomplete}
              getFirmBadgeColor={getFirmBadgeColor}
            />
          </div>
        )}

        {/* Sticky Prompt Bar */}
        <div className="sticky bottom-16 md:bottom-3 z-30 px-3 sm:px-4 pt-1 max-w-4xl mx-auto w-full">
          <div className="bg-[#181822]/95 backdrop-blur-md border border-[#36364a] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-end gap-2">
            <button
              onClick={() => {
                const queryText = chatInput.endsWith("@") ? chatInput : `${chatInput}@`
                handleInputChangeWithAutocomplete(queryText)
              }}
              className="px-2.5 py-2 rounded-xl bg-[#291b1a] text-[#ffb4a8] border border-[#4d2825] text-xs font-semibold flex items-center gap-1 hover:bg-[#382220] transition-colors shrink-0 mb-0.5"
              title="Invocar Agente com @"
            >
              <AtSign className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Agente (@)</span>
            </button>

            <textarea
              rows={1}
              value={chatInput}
              onChange={(e) => {
                handleInputChangeWithAutocomplete(e.target.value)
                // Auto adjust height
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (activeNav !== "chat") setActiveNav("chat")
                  handleSendMessage()
                }
              }}
              placeholder="Pergunte qualquer coisa ou digite '@' para autocompletar 20 agentes..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-[#8a6b68] focus:outline-none resize-none min-h-[32px] max-h-28 py-1.5 leading-relaxed font-sans"
            />

            <button
              onClick={() => {
                if (activeNav !== "chat") setActiveNav("chat")
                handleSendMessage()
              }}
              disabled={!chatInput.trim()}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 mb-0.5 ${
                chatInput.trim()
                  ? "bg-[#ffb4a8] text-black shadow-lg hover:opacity-90 active:scale-95"
                  : "bg-[#252532] text-[#735855] cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>

        {/* Fixed Mobile Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101015]/95 backdrop-blur-lg border-t border-[#242430] flex items-center justify-around py-2 px-1">
          {[
            { id: "landing", label: "Cordel", icon: Globe },
            { id: "chat", label: "Console", icon: Bot },
            { id: "crypto", label: "Cripto", icon: Coins },
            { id: "mesh", label: "20 Mesh", icon: Cpu },
            { id: "feed", label: "Papers", icon: Layers },
            { id: "settings", label: "Ajustes", icon: Settings }
          ].map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[46px] ${
                  isActive
                    ? "text-[#ffb4a8] bg-[#291716] font-bold"
                    : "text-[#947370] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#ffb4a8]" : "text-[#947370]"}`} />
                <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

      </main>

    </div>
  )
}
