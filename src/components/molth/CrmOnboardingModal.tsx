import React, { useState } from 'react'
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Building2, 
  FileText, 
  Zap, 
  DollarSign, 
  Users, 
  Sparkles, 
  Phone, 
  Mail, 
  Lock,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { CrmLead, LeadStatus } from './types'

interface CrmOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onRegisterLead: (lead: CrmLead) => void
  initialBillValue?: number
  initialDiscountPercent?: number
  showToast: (msg: string) => void
}

const DISTRIBUTORS = [
  "Enel SP (São Paulo)",
  "Enel RJ (Rio de Janeiro)",
  "Enel CE (Ceará)",
  "Cemig MG (Minas Gerais)",
  "CPFL Paulista",
  "CPFL Piratininga",
  "Light RJ",
  "Neoenergia Elektro (SP/MS)",
  "Neoenergia Coelba (BA)",
  "Copel (Paraná)",
  "Celesc (Santa Catarina)",
  "CEEE Equatorial (RS)",
  "Equatorial GO",
  "Outra Distribuidora"
]

export function CrmOnboardingModal({
  isOpen,
  onClose,
  onRegisterLead,
  initialBillValue = 3500,
  initialDiscountPercent = 20,
  showToast
}: CrmOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Step 1: Dados do Cliente
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [document, setDocument] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [propertyType, setPropertyType] = useState<CrmLead["propertyType"]>("comercial")

  // Step 2: Energia & Distribuidora
  const [distributor, setDistributor] = useState(DISTRIBUTORS[0])
  const [ucNumber, setUcNumber] = useState("")
  const [billValue, setBillValue] = useState<number>(initialBillValue)
  const [discountPercent, setDiscountPercent] = useState<number>(initialDiscountPercent)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  if (!isOpen) return null

  // Cálculos financeiros do lead
  const monthlySavings = (billValue * discountPercent) / 100
  const annualSavings = monthlySavings * 12

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0]
      setFileName(f.name)
      showToast(`Arquivo ${f.name} anexado com proteção LGPD!`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      setFileName(f.name)
      showToast(`Arquivo ${f.name} recebido com sucesso!`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !whatsapp.trim()) {
      showToast("Por favor preencha ao menos seu nome e WhatsApp.")
      setStep(1)
      return
    }

    const newLead: CrmLead = {
      id: `MEX-LEAD-${Date.now().toString().slice(-5)}`,
      fullName: fullName.trim(),
      companyName: companyName.trim() || fullName.trim(),
      document: document.trim() || "00.000.000/0001-00",
      email: email.trim() || "contato@cliente.com.br",
      whatsapp: whatsapp.trim(),
      distributor,
      ucNumber: ucNumber.trim() || `UC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      propertyType,
      billMonthlyValue: billValue,
      discountTargetPercent: discountPercent,
      billAttachmentName: fileName || "fatura_energia_upload.pdf",
      status: "ANALISE_TARIFARIA",
      createdAt: new Date().toLocaleDateString("pt-BR"),
      assignedAgent: "@CommercialAgent",
      estimatedMonthlySavings: monthlySavings,
      estimatedAnnualSavings: annualSavings,
      notes: `Cadastro via Portal MEx. Solicitou ${discountPercent}% de desconto perante a ${distributor}.`
    }

    onRegisterLead(newLead)
    showToast(`Lead ${newLead.id} registrado no CRM com sucesso!`)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#101116] border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Cadastro & Onboarding CRM MEx™</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                  Etapa {step} de 3
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Funil de Adesão ao Consórcio de Energia Solar • Lei 14.300/2022
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-3 border-b border-zinc-800 text-[11px] font-mono">
          <button
            onClick={() => setStep(1)}
            className={`py-2 px-3 text-center border-r border-zinc-800 transition-colors flex items-center justify-center gap-1.5 ${
              step === 1 ? "bg-emerald-950/40 text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">1</span>
            <span>Identificação</span>
          </button>

          <button
            onClick={() => {
              if (!fullName || !whatsapp) {
                showToast("Preencha seu nome e WhatsApp antes de avançar.")
                return
              }
              setStep(2)
            }}
            className={`py-2 px-3 text-center border-r border-zinc-800 transition-colors flex items-center justify-center gap-1.5 ${
              step === 2 ? "bg-emerald-950/40 text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">2</span>
            <span>Fatura & UC</span>
          </button>

          <button
            onClick={() => {
              if (!fullName || !whatsapp) {
                showToast("Preencha os passos anteriores.")
                return
              }
              setStep(3)
            }}
            className={`py-2 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              step === 3 ? "bg-emerald-950/40 text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">3</span>
            <span>Proposta & CRM</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* STEP 1: IDENTIFICAÇÃO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Dados do Titular ou Empresa</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Preencha as informações para registro no pipeline do @CommercialAgent.
                </p>
              </div>

              {/* Tipo de imóvel */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Tipo de Ligação / Perfil do Imóvel:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "comercial", label: "🏢 Comercial" },
                    { id: "industrial", label: "🏭 Industrial" },
                    { id: "residencial", label: "🏠 Residencial" },
                    { id: "fazenda", label: "🌾 Fazenda / Rural" },
                    { id: "condominio", label: "🏘️ Condomínio" }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPropertyType(t.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        propertyType === t.id
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Nome Completo do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    WhatsApp para Contato *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Razão Social ou Nome Fantasia
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Minha Empresa Ltda"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    CNPJ ou CPF do Titular
                  </label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  E-mail Comercial / Notificações de Fatura
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="financeiro@empresa.com.br"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim() || !whatsapp.trim()) {
                      showToast("Por favor preencha nome e WhatsApp.")
                      return
                    }
                    setStep(2)
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <span>Avançar para Dados de Energia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DADOS DE ENERGIA & CONTA */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Distribuidora & Perfil de Consumo</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Identifique a concessionária local para simular o desconto direto nos seus créditos.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Distribuidora / Concessionária Local
                  </label>
                  <select
                    value={distributor}
                    onChange={(e) => setDistributor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {DISTRIBUTORS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Nº da Unidade Consumidora (UC) (Opcional)
                  </label>
                  <input
                    type="text"
                    value={ucNumber}
                    onChange={(e) => setUcNumber(e.target.value)}
                    placeholder="Ex: 88492019 ou Código do Cliente"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Slider de Fatura */}
              <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400">Valor Médio da Fatura Mensal:</span>
                  <span className="text-emerald-400 font-bold text-sm">
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
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Percentual de Desconto */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Faixa de Desconto Solicitada:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 20, 25].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        discountPercent === pct
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-mono text-sm font-bold">{pct}% OFF</div>
                      <div className="text-[10px] text-zinc-500">{pct === 20 ? 'Consórcio MEx' : pct === 25 ? 'Com BESS 24h' : 'Entrada'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload de fatura */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center justify-between">
                  <span>Anexar Conta de Luz Recente (PDF ou Foto):</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Blindagem LGPD ativa</span>
                </label>
                
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging ? "border-emerald-400 bg-emerald-500/10" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <input
                    type="file"
                    id="bill-file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="bill-file" className="cursor-pointer space-y-1 block">
                    <UploadCloud className="w-6 h-6 text-zinc-400 mx-auto" />
                    {fileName ? (
                      <div className="text-xs text-emerald-400 font-bold font-mono">
                        ✓ {fileName}
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-zinc-300 font-medium">
                          Arraste sua conta aqui ou clique para selecionar
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Formatos aceitos: PDF, PNG, JPG (máx. 15MB)
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <span>Revisar Proposta & Funil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVISÃO DA PROPOSTA & CONFIRMAÇÃO NO CRM */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Confirmação da Proposta & Registro no CRM</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Revise a economia projetada antes de submeter para a esteira do @CommercialAgent.
                </p>
              </div>

              {/* Financial Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-black border border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Economia Mensal Garantida ({discountPercent}%):</span>
                  <span className="text-emerald-400 font-black text-base">
                    R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Economia Acumulada em 1 Ano:</span>
                  <span className="text-emerald-300 font-black text-base">
                    R$ {annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-zinc-300">
                  <div>
                    <span className="text-zinc-500">Titular:</span> {fullName}
                  </div>
                  <div>
                    <span className="text-zinc-500">Distribuidora:</span> {distributor}
                  </div>
                  <div>
                    <span className="text-zinc-500">WhatsApp:</span> {whatsapp}
                  </div>
                  <div>
                    <span className="text-zinc-500">Fatura:</span> R$ {billValue.toLocaleString('pt-BR')}/mês
                  </div>
                </div>
              </div>

              {/* Legal & Regulatory guarantees */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1.5 text-xs text-zinc-300 font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Garantias Regulatórias do Consórcio MEx™:</span>
                </div>
                <ul className="text-[11px] text-zinc-400 space-y-1 pl-5 list-disc">
                  <li>Zero taxa de adesão ou obras no seu imóvel;</li>
                  <li>Injeção direta de créditos regulados pela Lei Federal nº 14.300/2022;</li>
                  <li>Sem fidelidade abusiva (aviso prévio de 60 dias para cancelamento);</li>
                  <li>Minuta contratual PPA validada pelo @LegalAgent sob a MP 2.200-2/2001.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cadastrar Lead & Ativar no CRM</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
