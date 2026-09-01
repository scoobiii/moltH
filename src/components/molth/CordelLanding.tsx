import React from "react"
import { BusinessAgentItem } from "./types"
import { CORDEL_FOLHETOS } from "./data"
import { 
  ArrowUpRight, 
  Cpu, 
  Layers, 
  Bot, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Coins, 
  Zap, 
  Key,
  BookOpen
} from "lucide-react"

interface CordelLandingProps {
  agents: BusinessAgentItem[]
  chatInput: string
  onChatInputChange: (val: string) => void
  onLaunchConsole: (agentHandle?: string) => void
  onNavigate: (view: "feed" | "mesh" | "chat" | "crypto" | "bookmarks" | "settings") => void
  getFirmBadgeColor: (firm: string) => string
}

export const CordelLanding: React.FC<CordelLandingProps> = ({
  agents,
  chatInput,
  onChatInputChange,
  onLaunchConsole,
  onNavigate,
  getFirmBadgeColor
}) => {
  return (
    <div className="px-4 pt-4 max-w-5xl mx-auto w-full space-y-8 text-[#f2e6e4]">
      
      {/* ===================== CORDEL ART HERO BANNER ===================== */}
      <section className="relative overflow-hidden rounded-3xl bg-[#141217] border-2 border-[#4a2e2b] p-6 sm:p-10 shadow-2xl">
        {/* Cordel Geometric Woodcut Border Styling */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#802a22] via-[#ffb4a8] to-[#802a22] opacity-80" />
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#ffb4a8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#802a22]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Tag & Cordel Seal */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#291716] border border-[#592c28] text-[#ffb4a8] text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>⚜️ Cordel Tech • Vortex GOS3 v1.3 Runtime • Zero-Simulação</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            20 Mentes Soberanas no Repente da <span className="bg-gradient-to-r from-[#ffb4a8] via-[#ffd6cf] to-[#ff8c7a] bg-clip-text text-transparent">Energia & Inovação</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-[#baa19e] leading-relaxed max-w-2xl">
            A xilogravura futurista da inteligência artificial: 20 agentes independentes em sandboxes Nx1, com carteiras cripto reais geridas pelo Owner e auditorias das Big Four para a <strong>Mex Energia S.A.</strong>
          </p>

          {/* Quick Cordel Folheto Quote */}
          <div className="mt-5 p-3.5 bg-[#1f1617] border-l-4 border-[#ffb4a8] rounded-r-2xl text-xs text-[#f5ebd9] font-serif italic">
            "{CORDEL_FOLHETOS[0].estrofe}"
          </div>

          {/* Interactive Prompt Box directly on Landing */}
          <div className="mt-6 p-2.5 bg-[#1a1720]/95 border border-[#3e2c30] rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 relative">
            <div className="flex-1 flex items-center gap-2 px-2">
              <span className="text-[#ffb4a8] font-mono text-base font-bold">@</span>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onLaunchConsole()
                }}
                placeholder="Digite '@' para autocompletar e invocar qualquer agente..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#8a6b68] focus:outline-none"
              />
            </div>

            <button
              onClick={() => onLaunchConsole()}
              className="py-2.5 px-5 rounded-xl bg-[#ffb4a8] text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0"
            >
              <span>Lançar no Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key Metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#332226]">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">20</div>
              <div className="text-[11px] text-[#b89592]">Agentes Soberanos</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[11px] text-[#b89592]">Sandbox Nx1 Confinado</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#ffb4a8]">20 Wallets</div>
              <div className="text-[11px] text-[#b89592]">Cripto On-Chain Real</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">R$ 14.2M</div>
              <div className="text-[11px] text-[#b89592]">Mex Energia Pipeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CORDEL FOLHETOS & MANIFESTO ===================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CORDEL_FOLHETOS.map((folheto, idx) => (
          <div 
            key={idx} 
            className="bg-[#15131a] border border-[#382628] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2d1c1e] text-[11px] font-bold text-[#ffb4a8]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Folheto #{idx + 1}</span>
              </span>
              <span>⚜️ Cordel</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-2 font-serif">{folheto.titulo}</h4>
            <p className="text-xs text-[#d9c4c1] font-serif italic mt-2 leading-relaxed">
              "{folheto.estrofe}"
            </p>
            <div className="mt-3 pt-2 text-[10px] text-[#9e7d7a] flex items-center justify-between">
              <span>MoltH Xilogravura</span>
              <span className="font-mono">Mex Energia</span>
            </div>
          </div>
        ))}
      </section>

      {/* ===================== QUICK HUB NAVIGATION CARDS ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate("chat")}
          className="bg-[#14141c] border border-[#2e2326] hover:border-[#ffb4a8]/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#181622] group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-[#291716] text-[#ffb4a8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#ffd6cf]">Live Console & Diálogo</h3>
          <p className="text-xs text-[#baa19e] mt-1 leading-relaxed">
            Converse com visão expandida e Selo Soberano sem poluição técnica no diálogo.
          </p>
          <div className="mt-3 text-xs font-semibold text-[#ffb4a8] flex items-center gap-1">
            <span>Abrir Console</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate("crypto")}
          className="bg-[#14141c] border border-[#2e2326] hover:border-[#ffb4a8]/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#181622] group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-[#241a2a] text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#ffd6cf]">Carteiras Cripto & APIs</h3>
          <p className="text-xs text-[#baa19e] mt-1 leading-relaxed">
            Contas reais na rede Polygon / Energy Web com gestão do Owner e conectores API.
          </p>
          <div className="mt-3 text-xs font-semibold text-purple-400 flex items-center gap-1">
            <span>Gerenciar Carteiras</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div
          onClick={() => onNavigate("mesh")}
          className="bg-[#14141c] border border-[#2e2326] hover:border-[#ffb4a8]/50 rounded-2xl p-5 cursor-pointer transition-all hover:bg-[#181622] group shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-[#1e2333] text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-[#ffd6cf]">Topologia dos 20 Agentes</h3>
          <p className="text-xs text-[#baa19e] mt-1 leading-relaxed">
            1 Humano Root Soberano, 12 Agentes de Negócio e 7 Agentes de Tabela WAL.
          </p>
          <div className="mt-3 text-xs font-semibold text-sky-400 flex items-center gap-1">
            <span>Ver Topologia</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>

      {/* ===================== ANCHOR CLIENT: MEX ENERGIA S.A. ===================== */}
      <section className="bg-gradient-to-r from-[#171419] to-[#121117] border border-[#3e2c30] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#292938]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ffb4a8] to-[#802a22] text-black font-extrabold flex items-center justify-center text-lg shadow-lg">
              MEX
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Mex Energia S.A. Hub</h3>
              <p className="text-xs text-[#b89592]">Geração Solar Distribuída, Armazenamento BESS & Contratos PPA</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            GOS3 v1.3 Verified
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0e0d12] border border-[#22222e]">
            <div className="text-[#8a6b68] font-medium">CapTable & DRE</div>
            <div className="text-sm font-bold text-white mt-1">Auditado por PwC</div>
            <div className="text-[11px] text-[#baa19e] mt-0.5">DRE segregado por cada contrato individual assinado.</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0d12] border border-[#22222e]">
            <div className="text-[#8a6b68] font-medium">Compliance & LGPD</div>
            <div className="text-sm font-bold text-white mt-1">Deloitte ADR-003</div>
            <div className="text-[11px] text-[#baa19e] mt-0.5">Zero-Simulação e hashes de evidência em tempo real.</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e0d12] border border-[#22222e]">
            <div className="text-[#8a6b68] font-medium">SDR & Pipeline B2B</div>
            <div className="text-sm font-bold text-white mt-1">EY & KPMG Mesh</div>
            <div className="text-[11px] text-[#baa19e] mt-0.5">Qualificação TTPO de clientes industriais e comerciais.</div>
          </div>
        </div>
      </section>

      {/* ===================== 20 AGENTS SHOWCASE GRID ===================== */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#ffb4a8]" />
            <span>20 Agentes Prontos para Invocação com @</span>
          </h3>
          <button
            onClick={() => onNavigate("mesh")}
            className="text-xs text-[#ffb4a8] hover:underline flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {agents.slice(0, 8).map(ag => (
            <div
              key={ag.id}
              onClick={() => onLaunchConsole(ag.handle)}
              className="p-3 rounded-xl bg-[#14141c] border border-[#262634] hover:border-[#ffb4a8]/40 cursor-pointer transition-all hover:bg-[#191924] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{ag.avatar}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${getFirmBadgeColor(ag.firm)}`}>
                  {ag.firm}
                </span>
              </div>
              <div className="text-xs font-bold text-white mt-2 truncate group-hover:text-[#ffb4a8] transition-colors">
                {ag.handle}
              </div>
              <div className="text-[10px] text-[#baa19e] truncate">{ag.role}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
