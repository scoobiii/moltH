import React, { useState } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Bot,
  HelpCircle,
  Database,
  Lock,
  Cpu,
  Zap,
  Building,
  Scale
} from 'lucide-react'

interface InteractiveTutorialGuideProps {
  onOpenChat: (handle: string) => void
}

export function InteractiveTutorialGuide({ onOpenChat }: { onOpenChat: (handle: string) => void }) {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const steps = [
    {
      title: "1. Aporte do Investidor & Smart Contract",
      subtitle: "Onde e como o dinheiro entra",
      actor: "@FinanceAgent & @LegalAgent",
      actorHandle: "@LegalAgent",
      desc: "O investidor transfere capital via Conta Escrow / PIX Institucional ou USDC na Polygon. O @LegalAgent gera a minuta de mútuo conversível ou cota de consórcio/FIDC com assinatura digital ICP-Brasil e prova WAL.",
      tech: "MP 2.200-2/2001 • Polygon MEX Smart Contract • Escrow Auditado",
      icon: DollarSign,
      color: "from-emerald-500/20 border-emerald-500/40 text-emerald-400"
    },
    {
      title: "2. Alocação em Ativos Reais (BESS & GD)",
      subtitle: "O que o dinheiro compra e constrói",
      actor: "@CommercialAgent & @ErpAgent",
      actorHandle: "@CommercialAgent",
      desc: "O capital compra capacidade de Baterias BESS e créditos de usinas solares/biomassa. O @ErpAgent cadastra os ativos com lastro de kWh e telemetria ONS/CCEE integrada no SAP.",
      tech: "BESS 142 MWh • SAP SD/MM • Medição CCEE Telemétrica",
      icon: Zap,
      color: "from-amber-500/20 border-amber-500/40 text-amber-400"
    },
    {
      title: "3. Operação dos 6 Agentes & Arbitragem",
      subtitle: "Como a máquina gera receita diária",
      actor: "@BiAgent & Cluster MEx R$ 4k",
      actorHandle: "@BiAgent",
      desc: "O cluster de 6 agentes trabalha 24/7 sem salário humano: vende energia para empresas com 20% de desconto, carrega baterias na baixa e descarrega no pico tarifário gerando spread líquido.",
      tech: "Cluster Nx1 Strict • R$ 4.000 OPEX fixo • 6 Agentes Ativos",
      icon: Cpu,
      color: "from-sky-500/20 border-sky-500/40 text-sky-400"
    },
    {
      title: "4. Auditoria Criptográfica Big Four",
      subtitle: "Como a verdade é comprovada sem fraude",
      actor: "@ComplianceAgent & Deloitte / EY",
      actorHandle: "@ComplianceAgent",
      desc: "Nenhum número é inventado. Cada centavo e decisão é assinado com SHA-256 (WebCrypto) no Write-Ahead Log e gravado no Cloud Firestore com certificação Deloitte, EY e PwC.",
      tech: "WebCrypto SHA-256 • Append-Only Firestore • Zero-Simulação ADR-002",
      icon: ShieldCheck,
      color: "from-purple-500/20 border-purple-500/40 text-purple-400"
    },
    {
      title: "5. Distribuição de Dividendos & ROI",
      subtitle: "Como e quando o investidor recebe",
      actor: "@FinanceAgent & @IpoAgent",
      actorHandle: "@FinanceAgent",
      desc: "Todo dia 10, o @FinanceAgent executa o split bancário automático. O investidor recebe juros sobre capital / dividendos na conta bancária ou em carteira digital, com DRE transparente e projeção de IPO.",
      tech: "Split Automático • DRE Mensal Auditado • TIR estimada 22% a 28% a.a.",
      icon: TrendingUp,
      color: "from-emerald-500/20 border-emerald-500/40 text-emerald-300"
    }
  ]

  // Auto-play steps simulation
  React.useEffect(() => {
    let timer: any
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => (prev + 1) % steps.length)
      }, 4000)
    }
    return () => clearInterval(timer)
  }, [isPlaying])

  const cur = steps[activeStep]
  const IconComp = cur.icon

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-mono mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>GUIA VISUAL INTERATIVO & TUTORIAL DAS CAMADAS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Como Funciona: Do Dinheiro do Investidor ao Lucro na Conta
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Animação passo a passo do ciclo de investimento, contratos, garantias e retorno financeiro.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isPlaying 
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950" 
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? "Pausar Apresentação" : "Iniciar Demonstração"}</span>
          </button>
          <button
            onClick={() => { setIsPlaying(false); setActiveStep(0); }}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps Pipeline Indicators */}
      <div className="grid grid-cols-5 gap-2 font-mono text-[11px]">
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeStep === idx 
                ? "bg-zinc-800 border-emerald-500/60 shadow-lg text-white" 
                : "bg-zinc-950/60 border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold">FASE 0{idx + 1}</span>
              {activeStep > idx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <div className="font-semibold truncate">{s.title.split('.')[1] || s.title}</div>
          </button>
        ))}
      </div>

      {/* Main Animated Stage */}
      <div className={`p-6 rounded-2xl bg-gradient-to-br ${cur.color} bg-zinc-950 border transition-all duration-300 relative overflow-hidden shadow-inner`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
              <span className="text-zinc-400">Responsável:</span>
              <span className="text-white font-bold">{cur.actor}</span>
            </div>
            
            <h4 className="text-2xl font-black text-white tracking-tight">
              {cur.title}
            </h4>
            
            <p className="text-zinc-300 text-sm leading-relaxed">
              {cur.desc}
            </p>

            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-xs text-zinc-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Garantia Técnica: <strong className="text-white">{cur.tech}</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-black/50 rounded-2xl border border-white/10 shrink-0 min-w-[220px]">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 text-white mb-3 shadow-xl">
              <IconComp className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold text-white text-center mb-2">{cur.subtitle}</span>
            <button
              onClick={() => onOpenChat(cur.actorHandle)}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Falar com {cur.actorHandle}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FAQ & Tira-Dúvidas Direto */}
      <div className="border-t border-zinc-800 pt-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Perguntas Frequentes do Investidor & Quem Responde:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Onde o investidor coloca o dinheiro?</span>
              <span className="text-[10px] text-emerald-400 font-mono">Responde: H ROOT / @LegalAgent</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Exclusivamente na conta bancária oficial da MEx Energia indicada pelo Titular H ROOT (Zeh Sobrinho) com contrato de mútuo registrado, ou carteira institucional autorizada.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Como e quando recebe os rendimentos?</span>
              <span className="text-[10px] text-emerald-400 font-mono">Responde: @FinanceAgent</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Todo dia 10 via PIX direto ou USDC, derivado da venda de energia e arbitragem BESS, acompanhado da DRE auditada pela PwC.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Qual o ROI estimado e prazo de retorno?</span>
              <span className="text-[10px] text-emerald-400 font-mono">Responde: @BiAgent / @IpoAgent</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              TIR entre 22% a 28% a.a., payback projetado entre 24 a 36 meses na expansão dos parques de bateria e usinas de geração distribuída.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Quem responde minhas dúvidas adicionais?</span>
              <span className="text-[10px] text-emerald-400 font-mono">Console Multiagente</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Você pode digitar diretamente no chat: <strong className="text-white">@IpoAgent</strong> para captação, <strong className="text-white">@LegalAgent</strong> para contratos e <strong className="text-white">@FinanceAgent</strong> para projeção de lucros.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
