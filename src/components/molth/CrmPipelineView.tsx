import React, { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Phone, 
  Mail, 
  Building2, 
  ChevronRight, 
  ShieldCheck, 
  ExternalLink,
  MessageSquareText,
  UserCheck
} from 'lucide-react'
import { CrmLead, LeadStatus } from './types'

interface CrmPipelineViewProps {
  leads: CrmLead[]
  onUpdateLeadStatus: (leadId: string, nextStatus: LeadStatus) => void
  onOpenNewLeadModal: () => void
  onSelectLeadForChat: (lead: CrmLead) => void
  showToast: (msg: string) => void
}

const COLUMNS: { status: LeadStatus; title: string; color: string; badgeBg: string }[] = [
  { status: "NOVO_LEAD", title: "Novos Leads", color: "border-blue-500/40 text-blue-400", badgeBg: "bg-blue-500/20 text-blue-300" },
  { status: "ANALISE_TARIFARIA", title: "Análise Tarifária & UC", color: "border-amber-500/40 text-amber-400", badgeBg: "bg-amber-500/20 text-amber-300" },
  { status: "PROPOSTA_GERADA", title: "Proposta PPA Gerada", color: "border-purple-500/40 text-purple-400", badgeBg: "bg-purple-500/20 text-purple-300" },
  { status: "CONTRATO_ASSINADO", title: "Contrato Ativo (PPA)", color: "border-emerald-500/40 text-emerald-400", badgeBg: "bg-emerald-500/20 text-emerald-300" }
]

export function CrmPipelineView({
  leads,
  onUpdateLeadStatus,
  onOpenNewLeadModal,
  onSelectLeadForChat,
  showToast
}: CrmPipelineViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDistributor, setFilterDistributor] = useState<string>("ALL")
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null)

  const distributors = Array.from(new Set(leads.map(l => l.distributor)))

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.ucNumber && lead.ucNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDistributor = filterDistributor === "ALL" || lead.distributor === filterDistributor

    return matchesSearch && matchesDistributor
  })

  // KPIs
  const totalLeads = leads.length
  const totalMonthlyBilling = leads.reduce((acc, l) => acc + l.billMonthlyValue, 0)
  const totalAnnualSavings = leads.reduce((acc, l) => acc + l.estimatedAnnualSavings, 0)
  const activeContracts = leads.filter(l => l.status === "CONTRATO_ASSINADO").length

  const handleNextStatus = (lead: CrmLead, e: React.MouseEvent) => {
    e.stopPropagation()
    const statuses: LeadStatus[] = ["NOVO_LEAD", "ANALISE_TARIFARIA", "PROPOSTA_GERADA", "CONTRATO_ASSINADO"]
    const currentIndex = statuses.indexOf(lead.status)
    if (currentIndex < statuses.length - 1) {
      const next = statuses[currentIndex + 1]
      onUpdateLeadStatus(lead.id, next)
      showToast(`Lead ${lead.id} avançado para etapa: ${next.replace("_", " ")}`)
    }
  }

  return (
    <div className="space-y-6 text-zinc-100 max-w-7xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>FUNIL COMERCIAL B2B • MEX ENERGIA CONSÓRCIO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pipeline CRM & Gestão de Unidades Consumidoras
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Rastreamento ponta a ponta dos clientes cadastrados via Landing Page e chat soberano. Supervisionado por <span className="text-emerald-400 font-mono">@CommercialAgent</span> (KPMG) e <span className="text-purple-400 font-mono">@CrmAgent</span> (EY).
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewLeadModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Cadastro / Lead</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="text-[11px] text-zinc-500 font-mono">Total de Leads Ativos</div>
            <div className="text-xl font-black text-white mt-0.5">{totalLeads} clientes</div>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="text-[11px] text-zinc-500 font-mono">Faturas Sob Gestão</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              R$ {totalMonthlyBilling.toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-400">/mês</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="text-[11px] text-zinc-500 font-mono">Economia Anual Estimada</div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">
              R$ {totalAnnualSavings.toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-400">/ano</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div className="text-[11px] text-zinc-500 font-mono">Contratos PPA Assinados</div>
            <div className="text-xl font-black text-purple-300 mt-0.5">{activeContracts} ativos</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, empresa, UC ou ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-mono">Distribuidora:</span>
          <select
            value={filterDistributor}
            onChange={(e) => setFilterDistributor(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">Todas as Concessionárias</option>
            {distributors.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const columnLeads = filteredLeads.filter(l => l.status === col.status)
          return (
            <div 
              key={col.status}
              className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.status === 'CONTRATO_ASSINADO' ? 'bg-emerald-400' : col.status === 'PROPOSTA_GERADA' ? 'bg-purple-400' : col.status === 'ANALISE_TARIFARIA' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400">
                  {columnLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-800/60 rounded-xl text-zinc-600 text-xs font-mono">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  columnLeads.map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all hover:translate-y-[-1px] shadow-sm space-y-2.5 group"
                    >
                      {/* Top ID & Discount Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-500 group-hover:text-emerald-400 transition-colors">
                          {lead.id}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                          {lead.discountTargetPercent}% OFF
                        </span>
                      </div>

                      {/* Lead Title & Company */}
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {lead.companyName}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <span>{lead.fullName}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="capitalize text-zinc-500">{lead.propertyType}</span>
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>Fatura Atual:</span>
                          <span className="text-white">R$ {lead.billMonthlyValue.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Economia / ano:</span>
                          <span className="text-emerald-400 font-bold">R$ {lead.estimatedAnnualSavings.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      {/* Concessionária & UC */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                        <span className="truncate max-w-[120px]">{lead.distributor}</span>
                        <span>{lead.ucNumber || "Sem UC"}</span>
                      </div>

                      {/* Quick Action Footer */}
                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectLeadForChat(lead)
                          }}
                          className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 text-[10px] font-mono"
                          title="Conversar com Agente sobre este Lead"
                        >
                          <MessageSquareText className="w-3 h-3" />
                          <span>Agentes</span>
                        </button>

                        {col.status !== "CONTRATO_ASSINADO" && (
                          <button
                            onClick={(e) => handleNextStatus(lead, e)}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[10px] font-bold bg-emerald-950/60 hover:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50"
                          >
                            <span>Avançar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.status === "CONTRATO_ASSINADO" && (
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ativo</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Lead Detail Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="bg-[#101116] border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedLead.id}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{selectedLead.companyName}</h3>
                <p className="text-xs text-zinc-400">Responsável: {selectedLead.fullName}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">Contato WhatsApp</div>
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <a 
                    href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-emerald-400"
                  >
                    {selectedLead.whatsapp}
                  </a>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">E-mail</div>
                <div className="text-white truncate flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span>{selectedLead.email}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">Distribuidora & UC</div>
                <div className="text-white font-bold">{selectedLead.distributor}</div>
                <div className="text-[10px] text-zinc-400">{selectedLead.ucNumber || "UC Pendente"}</div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">Documento</div>
                <div className="text-white font-bold">{selectedLead.document}</div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Fatura Média:</span>
                <span className="text-white font-bold">R$ {selectedLead.billMonthlyValue.toLocaleString('pt-BR')} /mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Desconto Solicitado:</span>
                <span className="text-emerald-400 font-bold">{selectedLead.discountTargetPercent}% OFF</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-300 font-bold">Economia Mensal:</span>
                <span className="text-emerald-400 font-black">R$ {selectedLead.estimatedMonthlySavings.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-300 font-bold">Economia Anual Projetada:</span>
                <span className="text-emerald-300 font-black">R$ {selectedLead.estimatedAnnualSavings.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onSelectLeadForChat(selectedLead)
                  setSelectedLead(null)
                }}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono flex items-center gap-1.5"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invocar @CommercialAgent</span>
              </button>

              <button
                onClick={() => {
                  window.open(`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, "")}?text=Olá%20${encodeURIComponent(selectedLead.fullName)},%20sou%20da%20MEx%20Energia!%20Recebemos%20sua%20solicitação%20de%20desconto%20de%20${selectedLead.discountTargetPercent}%%20para%20a%20sua%20conta%20de%20luz.`, "_blank")
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chamar no WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
