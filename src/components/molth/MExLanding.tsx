import React, { useState } from 'react'
import { 
  Sun, 
  Battery, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  Globe2, 
  Recycle, 
  Cpu, 
  HeartHandshake, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Building, 
  Compass, 
  Zap,
  DollarSign
} from 'lucide-react'

interface MExLandingProps {
  onGoToHub?: () => void
  onContactSales?: (billValue?: number, discountPercent?: number) => void
  onOpenCrmOnboarding?: (billValue: number, discountPercent: number) => void
  onViewCrmPipeline?: () => void
}

export function MExLanding({ onGoToHub, onContactSales, onOpenCrmOnboarding, onViewCrmPipeline }: MExLandingProps) {
  const [billValue, setBillValue] = useState<number>(3500)
  const [discountPercent, setDiscountPercent] = useState<number>(20)
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleAction = () => {
    if (onOpenCrmOnboarding) {
      onOpenCrmOnboarding(billValue, discountPercent)
    } else if (onContactSales) {
      onContactSales(billValue, discountPercent)
    }
  }

  // Cálculos baseados na % selecionada
  const monthlySavings = (billValue * discountPercent) / 100
  const annualSavings = monthlySavings * 12

  // Seções canônicas do "Monte seu Cardápio MEx™" (100% fieis à página original site123)
  const menuItems = [
    {
      id: "solar",
      category: "solar",
      title: "100% Solar ☀️",
      slogan: "Sua Solução Completa em Energia Renovável",
      desc: "Com a MEx™, sua energia solar é simples e fácil. Atendemos Casas (economia e sustentabilidade), Empresas (eficiência e redução de custos), Fazendas (energia limpa no campo) e Condomínios (redução do rateio de áreas comuns). Projetos personalizados que colocam sua sustentabilidade em primeiro lugar.",
      icon: Sun,
      color: "text-amber-400",
      tag: "Solar + Baterias"
    },
    {
      id: "circular",
      category: "esg",
      title: "100% Economia Circular ♻️",
      slogan: "Monetizada no Ato da Compra",
      desc: "Impulsionamos a sustentabilidade e o crescimento econômico por meio da implementação rigorosa dos princípios da economia circular. Consultoria personalizada e soluções adaptadas às necessidades de cada cliente para promover um ambiente mais ecoeficiente e com valor residual reaproveitado.",
      icon: Recycle,
      color: "text-emerald-400",
      tag: "Monetização Imediata"
    },
    {
      id: "cidades",
      category: "smart",
      title: "100% Cidades Inteligentes 🏙️",
      slogan: "Mauá 23/33 • ODS 2030",
      desc: "Transforme seu município com o projeto Cidades Inteligentes: soluções integradas em energia solar, transporte elétrico gratuito, economia circular e bem-estar social total alinhadas às metas ODS da ONU. 'Cidades Inteligentes exigem Leis Inteligentes'.",
      icon: Cpu,
      color: "text-sky-400",
      tag: "ODS 2030 ONU"
    },
    {
      id: "transicao",
      category: "eficiencia",
      title: "100% Transição e Eficiência Energética ⚡",
      slogan: "ISO 9000, 14000 e Família ISO 50001",
      desc: "A energia solar opera das 5:00 às 18:00h. Para cobrir o período noturno com máxima eficiência e sem interrupções, integramos soluções de armazenamento BESS e fontes estáveis limpas, garantindo suprimento contínuo 24/7 com padrões internacionais de gestão ambiental.",
      icon: Zap,
      color: "text-purple-400",
      tag: "Normas ISO 50001"
    },
    {
      id: "redes-globais",
      category: "infra",
      title: "100% Redes Globais de Energia 🌐",
      slogan: "Sol Acordado vs. Sol Nanando • HVDC & Fótons",
      desc: "Gerenciamos o excedente de uma região com o sol acordado para outra onde o sol está descansando, e devolvemos quando acorda. Conexões de alta eficiência e torres solares verticais multiuso. Energia limpa 24 horas por dia, erradicando a intermitência através de compensação financeira transfronteiriça.",
      icon: Globe2,
      color: "text-cyan-400",
      tag: "Energia 24 Horas"
    },
    {
      id: "investimentos",
      category: "fintech",
      title: "100% MEx™️ Investimentos 📈",
      slogan: "MEx Coin & Pink Sheet OTC Market 2030",
      desc: "Plataforma inovadora orientada a dados e análise avançada. Projetos e excedentes energéticos são tokenizados e convertidos em MEx Coin com liquidez imediata ou opção de conversão em ações preferenciais no MEx IPO Pink Sheet OTC Market previsto para 2030.",
      icon: TrendingUp,
      color: "text-yellow-400",
      tag: "MEx Coin & IPO 2030"
    }
  ]

  // Equipe & Governança fiel ao original site123 ("Nasdaq Board Diversity & Time Felix \o/")
  const teamTestimonials = [
    {
      name: "Isabela Moreira",
      role: "Caçadora de Talentos",
      quote: "Construindo uma equipe de alto nível, com pessoas diversas, capazes de impulsionar a MEx™ rumo ao sucesso."
    },
    {
      name: "João Almeida",
      role: "Data & Efficiency",
      quote: "A análise de dados rigorosa transforma métricas em impacto real e me motiva a buscar a excelência diária."
    },
    {
      name: "Marcos Paulo",
      role: "Agente de Mudança Social",
      quote: "Utilizando conhecimento técnico para desenvolver projetos que impulsionam o empoderamento de comunidades vulneráveis."
    },
    {
      name: "João Batista dos Santos",
      role: "Inclusão & PopRua",
      quote: "A capacidade de impactar positivamente a vida das pessoas em situação de rua me proporciona um profundo senso de propósito."
    }
  ]

  const faqs = [
    {
      q: "O que é a MEx™ (Malokeir@x Eletrik@x)?",
      a: "A MEx™ é uma plataforma e associada CCEE que democratiza a energia solar e promove a energia social, oferecendo suporte a pessoas em situação de rua e catadores, gerando e expandindo excedentes energéticos para residências, comércios, indústrias e governos."
    },
    {
      q: "Quais são as porcentagens (%) de desconto e como funcionam?",
      a: "Os clientes do Consórcio MEx recebem entre 15% e 25% de desconto líquido garantido sobre a tarifa de energia da concessionária (com média de 20%), sem obras ou taxas de adesão. Além disso, o cardápio MEx oferece 100% Solar, 100% Economia Circular, 100% Cidades Inteligentes e 100% Eficiência Energética."
    },
    {
      q: "Preciso fazer alguma obra ou instalar placas no telhado?",
      a: "Não! Você não precisa de nenhuma obra, furo na parede ou investimento em equipamentos. A energia é injetada pelas usinas e parques BESS diretamente na rede da sua distribuidora local (Enel, Cemig, CPFL, Light) e abatida na sua conta."
    },
    {
      q: "Como funciona a rescisão contratual?",
      a: "Sem fidelidade punitiva e com zero taxa de saída. Exigimos apenas 60 dias de aviso prévio para protocolar o desvínculo regulatório perante a concessionária de energia."
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Banner de Identidade Fiel */}
      <div className="bg-orange-950/80 border-b border-orange-700/60 px-4 py-2.5 text-center text-xs font-mono text-orange-200 flex flex-wrap items-center justify-center gap-3">
        <span className="font-bold text-white bg-orange-600 px-2 py-0.5 rounded text-[11px]">MEx™</span>
        <span>Malokeir@x Eletrik@x | Associada CCEE • Geração Distribuída, BESS & Energia Social</span>
        <span className="text-orange-400 text-[10px]">Nasdaq Board Diversity Aligned \o/</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>SIMPLIFIQUE O ACESSO À ENERGIA SOLAR COM A MEx™</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Democratizando a Energia Solar com até <span className="text-emerald-400">{discountPercent}% de Desconto</span> na Conta de Luz
        </h1>

        <p className="text-sm sm:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
          Conectamos consumidores a fazendas solares e baterias BESS inteligentes. 
          Geramos e expandimos excedente energético para pessoas, negócios e governos, promovendo inclusão social real.
        </p>

        {/* Banners Sociais da Página Original */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-zinc-400 pt-1">
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">100% Solar</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-400">100% Economia Circular</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400">100% PopRua & Catadores</span>
          <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-purple-400">100% Baterias 24h</span>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleAction}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>CONTRATAR COM {discountPercent}% DE DESCONTO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onViewCrmPipeline && (
            <button
              onClick={onViewCrmPipeline}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 font-bold text-sm transition-all flex items-center justify-center gap-2 font-mono"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Ver Funil CRM & Gestão</span>
            </button>
          )}

          {onGoToHub && (
            <button
              onClick={onGoToHub}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Console MoltH Hub</span>
            </button>
          )}
        </div>
      </section>

      {/* Simulador Interativo com Seleção da % de Desconto (15%, 20%, 25%) */}
      <section className="bg-zinc-950/90 border-y border-zinc-800/80 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Simulador de Economia Mensal & Anual</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Escolha a Porcentagem (%) de Desconto da Sua Fatura
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Ajuste o valor da sua conta de luz e a faixa de desconto para calcular a sua sobra líquida de caixa.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-6 shadow-2xl">
            {/* Seletor da % de desconto */}
            <div>
              <div className="text-xs font-mono text-zinc-400 mb-2">Selecione a faixa percentual de economia:</div>
              <div className="grid grid-cols-3 gap-2.5">
                {[15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`py-3 px-4 rounded-xl font-mono text-sm font-black transition-all flex flex-col items-center justify-center border ${
                      discountPercent === pct 
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20" 
                        : "bg-black/60 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-lg">{pct}% OFF</span>
                    <span className="text-[10px] opacity-80">{pct === 20 ? 'Média Consórcio' : pct === 25 ? 'Com Baterias BESS' : 'Entrada'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider de Fatura */}
            <div>
              <div className="flex justify-between items-center text-sm font-mono mb-2">
                <span className="text-zinc-400">Valor médio atual da sua conta:</span>
                <span className="text-emerald-400 font-bold text-xl">
                  R$ {billValue.toLocaleString('pt-BR')} / mês
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={60000}
                step={250}
                value={billValue}
                onChange={(e) => setBillValue(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>R$ 300/mês (Residencial)</span>
                <span>R$ 25.000/mês (Comércio)</span>
                <span>R$ 60.000+/mês (Indústria)</span>
              </div>
            </div>

            {/* Resultados em Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-black/70 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-400 font-mono">Economia Líquida por Mês ({discountPercent}%)</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                  R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Dinheiro imediato que fica no seu bolso</div>
              </div>

              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/50">
                <div className="text-xs text-emerald-300 font-mono">Economia Total em 1 Ano</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
                  R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-400/70 mt-0.5">Capital para reinvestir no seu crescimento</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <button
                onClick={handleAction}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 font-mono"
              >
                <Zap className="w-4 h-4" />
                <span>Cadastrar & Solicitar Proposta Formal ({discountPercent}% OFF)</span>
              </button>

              {onViewCrmPipeline && (
                <button
                  onClick={onViewCrmPipeline}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono font-bold transition-all"
                >
                  Ver Pipeline CRM
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Fiel: "Monte seu cardápio MEx™" (Os pilares 100% da página original) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CARDÁPIO ORIGINAL MEx™</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Monte seu cardápio MEx™
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
            Escolha as soluções energéticas que compõem o seu ecossistema: da geração solar e baterias até cidades inteligentes e tokenização em MEx Coin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div 
                key={item.id}
                className="p-6 rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-black/60 border border-zinc-800 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-xs text-emerald-400/90 font-mono mt-0.5">
                      {item.slogan}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">Consórcio MEx</span>
                  <button 
                    onClick={onContactSales}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-all"
                  >
                    <span>Incluir no Cardápio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Seção Fiel da Página Original: "Ambiente de confiança, Nasdaq Board Diversity e um Time Felix \o/" */}
      <section className="bg-zinc-950/80 border-t border-zinc-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ambiente de confiança, Nasdaq Board Diversity e um Time Felix \o/
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
              A energia da MEx é impulsionada por pessoas reais com profundo senso de propósito social e governança inclusiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamTestimonials.map((member, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{member.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{member.role}</div>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  "{member.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto O que é MEx */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 space-y-3">
          <h3 className="text-xl font-black text-white">O que é a MEx™?</h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            "A MEx™ é uma plataforma que democratiza a energia solar, oferecendo suporte a pessoas em situação de rua e catadores, gerando e expandindo excedente energético para pessoas, negócios pequenos ou grandes e governos."
          </p>
          <div className="pt-2">
            <button
              onClick={handleAction}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all"
            >
              Seja MEx™ • Fale com nossos Especialistas
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-950/90 border-t border-zinc-800/80 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black text-white">Dúvidas Frequentes</h2>
            <p className="text-xs text-zinc-400">Esclarecimentos sobre percentuais, modelo de consórcio e cancelamento.</p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-emerald-400"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4 text-center text-xs text-zinc-500 font-mono space-y-2">
        <div>MEx™ Malokeir@x Eletrik@x | Associada CCEE • CNPJ & SPE Geração Distribuída Compartilhada</div>
        <div className="text-[11px] text-zinc-600">
          Fundamentação: Lei Federal nº 14.300/2022 • ANEEL REN 1.000/2021 • ODS 2030 ONU • LGPD Blindada
        </div>
      </footer>
    </div>
  )
}
