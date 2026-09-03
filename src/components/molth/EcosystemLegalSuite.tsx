import React, { useState } from 'react'
import { 
  FileText, 
  Scale, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  Search,
  BookOpen,
  Building,
  UserCheck,
  Zap,
  Lock
} from 'lucide-react'
import { ECOSYSTEM_LEGAL_DOCS, LegalContractTemplate } from './ecosystemDocsData'

interface EcosystemLegalSuiteProps {
  showToast: (msg: string) => void
}

export function EcosystemLegalSuite({ showToast }: EcosystemLegalSuiteProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>(ECOSYSTEM_LEGAL_DOCS[0].id)
  const [copiedClause, setCopiedClause] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const currentDoc = ECOSYSTEM_LEGAL_DOCS.find(d => d.id === selectedDocId) || ECOSYSTEM_LEGAL_DOCS[0]

  const categories = ['all', 'Investimento', 'Comercial', 'Societário', 'Regulatório', 'Governança IA']

  const filteredDocs = ECOSYSTEM_LEGAL_DOCS.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = filterCategory === 'all' || d.category === filterCategory
    return matchesSearch && matchesCat
  })

  const copyFullText = () => {
    const text = `=====================================================
${currentDoc.title.toUpperCase()}
Código Canônico: ${currentDoc.code}
Fundamentação Jurídica: ${currentDoc.legalBasis}
Público Alvo: ${currentDoc.targetAudience}
=====================================================

${currentDoc.summary}

CLÁUSULAS CONTRATUAIS:
${currentDoc.clauses.map(c => `\n--- ${c.title} ---\n${c.content}`).join('\n')}

=====================================================
Autenticação: Assinado digitalmente sob MP 2.200-2/2001 e Art. 411 CPC
Validação Canônica: GOS3 Protocol / H ROOT (427273fd)
=====================================================`
    
    navigator.clipboard.writeText(text)
    showToast(`Contrato completo "${currentDoc.code}" copiado para a área de transferência!`)
  }

  const copySingleClause = (title: string, content: string) => {
    navigator.clipboard.writeText(`${title}\n${content}`)
    setCopiedClause(title)
    setTimeout(() => setCopiedClause(null), 2000)
    showToast(`Cláusula copiada!`)
  }

  const exportAsTxtFile = () => {
    const text = `=====================================================
${currentDoc.title.toUpperCase()}
Código: ${currentDoc.code}
Base Legal: ${currentDoc.legalBasis}
=====================================================

${currentDoc.summary}

${currentDoc.clauses.map(c => `\n${c.title}\n${c.content}`).join('\n\n')}
`
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentDoc.code}_${currentDoc.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Download de ${currentDoc.code}.txt concluído!`)
  }

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>REPOSITÓRIO DE MINUTAS & INSTRUMENTOS JURÍDICOS INTEGRAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Documentos Jurídicos Canônicos da MEx Energia & MoltH
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Minutas completas fundamentadas no Código Civil, Marco Legal das Startups, Lei 14.300 e LGPD. Prontas para cópia e assinatura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyFullText}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Minuta Completa</span>
          </button>
          <button
            onClick={exportAsTxtFile}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .TXT</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, código (MEX-DOC-001) ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
              }`}
            >
              {cat === 'all' ? 'Todos os Documentos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider px-1">
            Instrumentos Disponíveis ({filteredDocs.length})
          </div>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = doc.id === selectedDocId
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? "bg-zinc-800/90 border-emerald-500/60 shadow-lg" 
                      : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-emerald-400 border border-zinc-800">
                      {doc.code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {doc.category}
                    </span>
                  </div>
                  <div className={`text-xs font-bold mb-1 leading-snug ${isSelected ? "text-white" : "text-zinc-300"}`}>
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Document Details & Clauses Viewer */}
        <div className="lg:col-span-8 bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-6">
          {/* Doc Header Card */}
          <div className="p-4 bg-black/60 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800">
                {currentDoc.code}
              </span>
              <span className="text-xs font-medium text-zinc-400">
                Público: <strong className="text-white">{currentDoc.targetAudience}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {currentDoc.title}
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentDoc.summary}
            </p>

            <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-1.5 text-amber-300">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Base Legal: {currentDoc.legalBasis}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Válido ICP-Brasil & Art. 411 CPC</span>
              </div>
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cláusulas Contratuais Canônicas ({currentDoc.clauses.length})</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Clique no ícone para copiar cláusula individual</span>
            </div>

            <div className="space-y-3">
              {currentDoc.clauses.map((clause, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-zinc-900/70 hover:bg-zinc-900 rounded-xl border border-zinc-800/80 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {clause.title}
                    </span>
                    <button
                      onClick={() => copySingleClause(clause.title, clause.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                      title="Copiar Cláusula"
                    >
                      {copiedClause === clause.title ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Certification Footer */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300 font-mono">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Governança Garantida pelo H ROOT (Zeh Sobrinho • 427273fd)</span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Certificação Técnica: <span className="text-white">Deloitte Legal / GOS3 Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
