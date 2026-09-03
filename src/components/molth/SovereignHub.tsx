import React, { useState, useMemo, useEffect } from "react"
import { 
  BusinessAgentItem, 
  AgentPost, 
  ChatMessage, 
  UserAuthProfile 
} from "./types"
import { 
  DEFAULT_USER, 
  GUEST_USER,
  INITIAL_AGENTS, 
  INITIAL_MESSAGES, 
  INITIAL_POSTS 
} from "./data"
import { MoltHLanding } from "./MoltHLanding"
import { LiveChatConsole } from "./LiveChatConsole"
import { CryptoAndConnectors } from "./CryptoAndConnectors"
import { ResearchFeed } from "./ResearchFeed"
import { BusinessMeshTopology } from "./BusinessMeshTopology"
import MExPricing from "./MExPricing"
import { DevOpsView } from "./DevOpsView"
import { OwnerView } from "./OwnerView"
import { InvestorView } from "./InvestorView"
import { SovereignVerificationSuite } from "./SovereignVerificationSuite"
import { AuthModal } from "./AuthModal"
import { MExLanding } from "./MExLanding"
import { AgentAutocomplete } from "./AgentAutocomplete"
import { auth, onAuthStateChanged, logoutUser } from "../../services/firebase"

import {
  Crown,
  Building2,
  Terminal,
  Users,
  Cpu,
  TrendingUp,
  MessageSquare,
  Network,
  Newspaper,
  CreditCard,
  Coins,
  Shield,
  Search,
  LogOut,
  Sparkles,
  Send,
  AtSign,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"

const STORAGE_KEY = "molth_gos3_sovereign_hub_v1"

export type StakeholderRole = "owner" | "admin" | "devops" | "user" | "agent" | "investor"

export default function SovereignHub() {
  // Global State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<UserAuthProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`)
      return saved ? JSON.parse(saved) : DEFAULT_USER
    } catch {
      return DEFAULT_USER
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

  // Role Perspective & Navigation State
  const [activeRole, setActiveRole] = useState<StakeholderRole>("owner")
  const [activeNav, setActiveNav] = useState<
    "chat" | "mesh" | "feed" | "crypto" | "pricing" | "devops" | "owner" | "investor" | "landing" | "tests" | "mexlanding"
  >("owner")

  // Modals & UI Toggles
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Live Chat & Sticky Input State
  const [chatInput, setChatInput] = useState("")
  const [selectedAgentTarget, setSelectedAgentTarget] = useState<string>("@AllMesh")
  const [autocompleteQuery, setAutocompleteQuery] = useState<string | null>(null)

  // Listen to Firebase Auth real state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isSobrinho = firebaseUser.email?.toLowerCase().includes("sobrinho") || firebaseUser.email === "sobrinhoSJ@gmail.com"
        setCurrentUser(prev => ({
          ...prev,
          isLoggedIn: true,
          provider: "google",
          email: firebaseUser.email || prev.email,
          name: firebaseUser.displayName || (isSobrinho ? "Zeh Sobrinho (MEx)" : (firebaseUser.email?.split("@")[0] || "Operador")),
          handle: `@${(firebaseUser.email?.split("@")[0] || "operador").replace(/[^a-zA-Z0-9_]/g, "_")}`,
          avatar: firebaseUser.photoURL ? "👑" : (isSobrinho ? "👑" : "⚡"),
          role: isSobrinho ? "Root Sovereign Operator • Mex Energia Hub" : (prev.role || "Operador Autenticado • Google Auth"),
          walletAddress: prev.walletAddress || `0x${firebaseUser.uid.slice(0, 10)}...${firebaseUser.uid.slice(-4)}`,
          mexBalance: isSobrinho ? 245000 : (prev.mexBalance || 10000)
        }))
      }
    })
    return () => unsubscribe()
  }, [])

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

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.warn("Logout error:", e)
    }
    setCurrentUser(GUEST_USER)
    showToast("Sessão desconectada com sucesso.")
  }

  // Map stakeholder roles to recommended default view
  const handleSelectRole = (role: StakeholderRole) => {
    setActiveRole(role)
    switch (role) {
      case "owner":
        setActiveNav("owner")
        showToast("Perspectiva: OWNER (H ROOT 427273fd)")
        break
      case "admin":
        setActiveNav("pricing")
        showToast("Perspectiva: ADMIN (MEx Org mex-427273fd)")
        break
      case "devops":
        setActiveNav("devops")
        showToast("Perspectiva: DEVOPS (SRE & Telemetria)")
        break
      case "user":
        setActiveNav("chat")
        showToast("Perspectiva: USUÁRIO (Chat & Feed)")
        break
      case "agent":
        setActiveNav("mesh")
        showToast("Perspectiva: AGENTE (Topologia da Malha)")
        break
      case "investor":
        setActiveNav("investor")
        showToast("Perspectiva: INVESTIDOR (Métricas & IPO)")
        break
    }
  }

  // Toast
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Firm Badges Color
  const getFirmBadgeColor = (firm: string) => {
    switch (firm) {
      case "Deloitte": return "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
      case "EY": return "bg-amber-950/70 text-amber-300 border-amber-800/60"
      case "PwC": return "bg-sky-950/70 text-sky-300 border-sky-800/60"
      case "KPMG": return "bg-purple-950/70 text-purple-300 border-purple-800/60"
      default: return "bg-rose-950/70 text-rose-300 border-rose-800/60"
    }
  }

  // Autocomplete filter
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

  // Post Actions
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const nextLiked = !p.isLiked
        return { ...p, isLiked: nextLiked, likes: nextLiked ? p.likes + 1 : p.likes - 1 }
      }
      return p
    }))
  }

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const nextBookmarked = !p.isBookmarked
        showToast(nextBookmarked ? "Salvo nos marcadores!" : "Removido dos marcadores.")
        return { ...p, isBookmarked: nextBookmarked }
      }
      return p
    }))
  }

  // Send Message with Pure Sovereign Speech
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

    setTimeout(() => {
      const mentionedAgent = agents.find(a => prompt.includes(a.handle))
      const targetHandle = mentionedAgent ? mentionedAgent.handle : (selectedAgentTarget === "@AllMesh" ? "@ComplianceAgent" : selectedAgentTarget)
      const agentData = agents.find(a => a.handle === targetHandle)

      let cleanSpeech = ""
      if (targetHandle === "@LegalAgent") {
        cleanSpeech = `[PARECER JURÍDICO GOS3 SOBERANO] Demanda analisada sob a ótica do Direito Empresarial, Regulatório (ANEEL/CCEE) e Marco Legal das Startups. Minuta contratual validada, cláusulas de SLA/PPA verificadas, e eficácia probatória digital (MP 2.200-2/2001 e Art. 411 CPC) assegurada com o hash criptográfico desta decisão assinado no bloco WAL.`
      } else if (targetHandle === "@ComplianceAgent") {
        cleanSpeech = `Diretiva de conformidade processada com sucesso no consórcio MEx Energia. Todos os requisitos de LGPD e governança ADR-003 foram satisfeitos no isolamento Nx1.`
      } else if (targetHandle === "@FinanceAgent") {
        cleanSpeech = `Demonstrativo DRE atualizado. Os fluxos de caixa e liquidações B2B/BESS foram conciliados com os contratos de geração distribuída.`
      } else if (targetHandle === "@CrmAgent" || targetHandle === "@CommercialAgent") {
        cleanSpeech = `Qualificação comercial concluída via algoritmo TTPO. Novos clientes industriais qualificados para proposta de PPA solar.`
      } else if (targetHandle === "@IpoAgent") {
        cleanSpeech = `Modelagem de valuation Series A concluída. Métricas auditadas com base nos selos Big Four e margem EBITDA de 41%.`
      } else {
        cleanSpeech = `Invocação de ${targetHandle} concluída com sucesso no cluster MEx. O processamento foi executado em ambiente estritamente soberano e isolado.`
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
        evidenceHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
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

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. Global Stakeholder Alignment Bar (Owner, Admin, DevOps, User, Agent, Investor) */}
      <div className="bg-[#0b0c0e] border-b border-zinc-800/80 px-4 py-2 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Brand & Sovereign Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div 
              onClick={() => setActiveNav("landing")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-black font-black flex items-center justify-center text-sm tracking-tighter shadow-md group-hover:scale-105 transition-transform">
                MH
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white">MoltH</span>
                <span className="text-[10px] text-zinc-400 font-mono ml-1.5 hidden sm:inline">
                  SOVEREIGN HUB
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>H ROOT 427273fd</span>
            </div>
          </div>

          {/* 6 Role Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleSelectRole("owner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "owner"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>OWNER</span>
            </button>

            <button
              onClick={() => handleSelectRole("admin")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "admin"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>

            <button
              onClick={() => handleSelectRole("devops")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "devops"
                  ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>DEVOPS</span>
            </button>

            <button
              onClick={() => handleSelectRole("user")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "user"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>USUÁRIO</span>
            </button>

            <button
              onClick={() => handleSelectRole("agent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "agent"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AGENTE</span>
            </button>

            <button
              onClick={() => handleSelectRole("investor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                activeRole === "investor"
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>INVESTOR</span>
            </button>
          </div>

          {/* User Auth Profile Badge */}
          <div className="flex items-center gap-2">
            {currentUser.isLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-800 transition-all"
                >
                  <span>{currentUser.avatar}</span>
                  <span className="hidden sm:inline font-mono">{currentUser.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-800/80 rounded text-emerald-300 font-bold uppercase">
                    {currentUser.role}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Functional Navigation Bar */}
      <div className="bg-[#121316] border-b border-zinc-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setActiveNav("owner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "owner" ? "bg-zinc-800 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Soberania (Owner)</span>
            </button>

            <button
              onClick={() => setActiveNav("chat")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "chat" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Console Chat</span>
            </button>

            <button
              onClick={() => setActiveNav("mesh")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "mesh" ? "bg-zinc-800 text-purple-300 border border-purple-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Topologia (20 Agentes)</span>
            </button>

            <button
              onClick={() => setActiveNav("feed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "feed" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Feed & Insights</span>
            </button>

            <button
              onClick={() => setActiveNav("pricing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "pricing" ? "bg-zinc-800 text-emerald-300 border border-emerald-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>MEx R$ 4k (Admin)</span>
            </button>

            <button
              onClick={() => setActiveNav("crypto")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "crypto" ? "bg-zinc-800 text-white border border-zinc-700" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Web3 & Conectores</span>
            </button>

            <button
              onClick={() => setActiveNav("devops")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "devops" ? "bg-zinc-800 text-sky-300 border border-sky-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>DevOps SRE</span>
            </button>

            <button
              onClick={() => setActiveNav("investor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "investor" ? "bg-zinc-800 text-amber-300 border border-amber-500/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investor IPO</span>
            </button>

            <button
              onClick={() => setActiveNav("tests")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "tests" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50" : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Testes Soberanos</span>
            </button>

            <button
              onClick={() => setActiveNav("mexlanding")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeNav === "mexlanding" ? "bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20" : "text-emerald-400 hover:text-emerald-300 border border-emerald-500/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Landing MEx B2B</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>MEX: 18.4M</span>
            <span>•</span>
            <span>20 AGENTES ATIVOS</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeNav === "tests" && (
          <SovereignVerificationSuite
            agents={agents}
            showToast={showToast}
          />
        )}

        {activeNav === "owner" && (
          <OwnerView showToast={showToast} />
        )}

        {activeNav === "devops" && (
          <DevOpsView showToast={showToast} />
        )}

        {activeNav === "investor" && (
          <InvestorView onOpenChat={(handle) => {
            setSelectedAgentTarget(handle)
            setActiveNav("chat")
            setChatInput(`${handle} `)
          }} />
        )}

        {activeNav === "pricing" && (
          <MExPricing 
            orgId="mex-427273fd"
            onContactSales={() => {
              setSelectedAgentTarget("@CommercialAgent")
              setActiveNav("chat")
              setChatInput("@CommercialAgent Gostaria de formalizar o contrato de R$ 4.000 para as 6 carteiras MEx.")
            }}
          />
        )}

        {activeNav === "mesh" && (
          <div className="space-y-6">
            <BusinessMeshTopology
              agents={agents}
              onSelectAgent={(handle) => {
                setSelectedAgentTarget(handle)
                setActiveNav("chat")
                setChatInput(`${handle} `)
                showToast(`Agente ${handle} invocado no console!`)
              }}
              onOpenTestSuite={() => {
                setActiveNav("tests")
                showToast("Abrindo Bateria de Testes Soberanos...")
              }}
              getFirmBadgeColor={getFirmBadgeColor}
            />
          </div>
        )}

        {activeNav === "chat" && (
          <div className="max-w-4xl mx-auto">
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
                showToast("Histórico limpo.")
              }}
              showToast={showToast}
            />
          </div>
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

        {activeNav === "crypto" && (
          <CryptoAndConnectors
            agents={agents}
            currentUser={currentUser}
            onUpdateAgent={handleUpdateAgent}
            showToast={showToast}
          />
        )}

        {activeNav === "mexlanding" && (
          <MExLanding 
            onGoToHub={() => setActiveNav("chat")}
            onContactSales={() => {
              setSelectedAgentTarget("@CommercialAgent")
              setActiveNav("chat")
              setChatInput("@CommercialAgent Olá! Gostaria de receber uma simulação da MEx com desconto de 20% para a minha conta de luz.")
              showToast("Invocando @CommercialAgent para proposta comercial!")
            }}
          />
        )}

        {activeNav === "landing" && (
          <div className="space-y-8">
            <MoltHLanding />
            <div className="max-w-4xl mx-auto">
              <BusinessMeshTopology
                agents={agents}
                onSelectAgent={(handle) => {
                  setSelectedAgentTarget(handle)
                  setActiveNav("chat")
                  setChatInput(`${handle} `)
                }}
                getFirmBadgeColor={getFirmBadgeColor}
              />
            </div>
          </div>
        )}
      </main>

      {/* 4. Global Sticky Command Bar (Quick-prompt any agent anywhere) */}
      <div className="sticky bottom-0 z-40 bg-zinc-950/95 border-t border-zinc-800/80 p-3 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative">
          {/* Autocomplete Popup */}
          {autocompleteQuery !== null && (
            <AgentAutocomplete
              query={autocompleteQuery}
              matchingAgents={matchingAgents}
              onSelectAgent={applyAgentAutocomplete}
              getFirmBadgeColor={getFirmBadgeColor}
            />
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => handleInputChangeWithAutocomplete(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Comando soberano: use @ para invocar qualquer um dos 20 agentes (ex: @ErpAgent, @FinanceAgent)..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0 font-mono"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Executar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(profile) => {
          setCurrentUser(profile)
          showToast(`Bem-vindo, ${profile.name}!`)
        }}
        showToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 right-4 z-50 bg-zinc-900 border border-zinc-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
