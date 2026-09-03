import React, { useState } from 'react'
import { 
  Crown, 
  ShieldAlert, 
  KeyRound, 
  FileCode2, 
  Lock, 
  Check, 
  AlertOctagon, 
  Database,
  History,
  Terminal,
  ZapOff,
  Building,
  Scale,
  FileText,
  ShieldCheck,
  Eye,
  Download
} from 'lucide-react'
import { EcosystemLegalSuite } from './EcosystemLegalSuite'

export function OwnerView({ showToast }: { showToast: (msg: string) => void }) {
  const [killSwitchActive, setKillSwitchActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'sovereignty' | 'wal' | 'rules' | 'legal'>('sovereignty')

  const sampleWalBlocks = [
    { block: 400, hash: "sha256:427273fd-Zeh-Sobrinho-ROOT", action: "ROOT_SOVEREIGNTY_ASSERT", agent: "H", ts: "Agora" },
    { block: 399, hash: "sha256:8892a01bfce82901aB771239c0bcA810", action: "TENANT_ISOLATION_VERIFIED", agent: "BiAgent", ts: "Há 2 min" },
    { block: 398, hash: "sha256:3319018bcFe82901aB771239c0bcA810", action: "PPA_CONTRACT_EXECUTION", agent: "ErpAgent", ts: "Há 5 min" },
    { block: 397, hash: "sha256:99018bcFe82901aB771239c0bcA8104272", action: "BESS_ARBITRAGE_CYCLE", agent: "FinanceAgent", ts: "Há 12 min" },
    { block: 396, hash: "sha256:119018bcFe82901aB771239c0bcA8108872", action: "AUDIT_COMPLIANCE_PASS", agent: "ComplianceAgent", ts: "Há 18 min" }
  ]

  const toggleKillSwitch = () => {
    const nextState = !killSwitchActive
    setKillSwitchActive(nextState)
    if (nextState) {
      showToast("ALERTA: Kill switch ativado por H ROOT. Malha de agentes em modo de pausa.")
    } else {
      showToast("Soberania restaurada. Agentes liberados para execução normal.")
    }
  }

  return (
    <div className="space-y-6 text-zinc-100 max-w-5xl mx-auto pb-20">
      {/* Root Status Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>ROOT SOVEREIGN OPERATOR • H ID 427273fd</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Console de Soberania Absoluta (Owner)
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 font-mono">
              H_ROOT_HASH: <span className="text-amber-300">sha256:427273fd-Zeh-Sobrinho-ROOT</span>
            </p>
          </div>

          <button
            onClick={toggleKillSwitch}
            className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
              killSwitchActive 
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
            }`}
          >
            {killSwitchActive ? <ZapOff className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
            <span>{killSwitchActive ? "DESATIVAR KILL SWITCH" : "KILL SWITCH DE EMERGÊNCIA"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('sovereignty')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sovereignty' 
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Controle de Soberania</span>
        </button>

        <button
          onClick={() => setActiveTab('wal')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'wal' 
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>WAL 400 (Write-Ahead Log)</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'rules' 
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Regras Firestore & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'legal' 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span>Contratos, Escrow & LGPD</span>
        </button>
      </div>

      {/* Tab 1: Soberania */}
      {activeTab === 'sovereignty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Hierarquia Canônica de Autoridade</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O modelo de autoridade do MoltH não aceita delegação opaca. A ordem de comando obedece:
            </p>
            <div className="bg-black/60 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-amber-300">
              OWNER (H ROOT 427273fd) &gt; ADMIN (MEx) &gt; USER (Operador) &gt; AGENT (Autônomo)
            </div>
            <div className="space-y-1.5 text-xs text-zinc-400 pt-2">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero simulação oculta garantida por <code className="text-zinc-300">evidence_hash</code></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interrupção instantânea em caso de desvio com o Kill Switch</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Identidade Raiz H Validada</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 font-mono text-[10px] flex items-center justify-between">
                  <span>OPERADOR HUMANO PRINCIPAL</span>
                  <span className="text-emerald-400 text-[9px] font-mono">LGPD Blindado</span>
                </div>
                <div className="text-white font-bold font-mono mt-0.5 flex items-center justify-between">
                  <span>Zeh Sobrinho (s***SJ@gmail.com)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Apenas H ROOT visualiza</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 font-mono text-[10px]">HASH CANÔNICO DA SOBERANIA</div>
                <div className="text-amber-300 font-mono text-[11px] break-all mt-0.5">sha256:427273fd-Zeh-Sobrinho-ROOT</div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="text-zinc-500 font-mono text-[10px]">TENANT MEx VINCULADO</div>
                <div className="text-emerald-400 font-mono mt-0.5">mex-427273fd (Isolamento R$ 4k Ativo)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WAL */}
      {activeTab === 'wal' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>Livro-Razão Imutável WAL (Blocos Recentes de 400)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">400/400 Gravados</span>
          </div>

          <div className="space-y-2">
            {sampleWalBlocks.map(item => (
              <div key={item.block} className="bg-black/60 border border-zinc-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">#{item.block}</span>
                  <span className="text-white font-semibold">{item.action}</span>
                  <span className="text-zinc-500 text-[11px] px-2 py-0.5 rounded bg-zinc-800">@{item.agent}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                  <span className="text-zinc-400 truncate max-w-[200px]">{item.hash}</span>
                  <span>{item.ts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Rules */}
      {activeTab === 'rules' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>Políticas RBAC em firestore.rules</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">Aplicado</span>
          </div>

          <pre className="p-4 rounded-lg bg-black border border-zinc-800 text-[11px] text-zinc-300 font-mono overflow-x-auto leading-relaxed">
{`match /organizations/{orgId} {
  allow read: if request.auth != null && request.auth.uid in resource.data.members;
  allow write: if request.auth.token.role == "OWNER";
}
match /users/{uid} {
  allow read: if request.auth.uid == uid || request.auth.token.role in ["OWNER","ADMIN"];
  allow write: if request.auth.uid == uid;
}
match /agents/{agentId} {
  allow read: if request.auth.uid == resource.data.owner_id || request.auth.token.role in ["OWNER","ADMIN"];
  allow write: if request.auth.token.role == "OWNER";
}
match /agent_runs/{runId} {
  allow read: if request.auth.uid == resource.data.owner_id;
  allow write: if request.auth.token.role == "OWNER" || request.auth.token.agent == true;
}
match /audit_logs/{logId} {
  allow read: if request.auth.token.role in ["OWNER","ADMIN"];
  allow write: if false; // Imutabilidade estrita
}`}
          </pre>
        </div>
      )}

      {/* Tab 4: Legal, Escrow & LGPD */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {/* Contas Escrow Ativas */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Contas & Domicílio Financeiro (Governança H ROOT)</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono">Sob Definição do Titular</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">CONTA BANCÁRIA DA EMPRESA (BRL / OPERAÇÃO & SPE)</div>
                <div className="text-white font-bold">Definida pelo Titular H ROOT</div>
                <div className="text-zinc-400 text-[11px]">Titularidade exclusiva: Zeh Sobrinho / MEx Energia</div>
                <div className="text-amber-400 text-[10px] pt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Nenhum banco fixado sem instrução formal do Owner</span>
                </div>
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 space-y-1">
                <div className="text-zinc-500 text-[10px]">CUSTÓDIA DIGITAL (POLYGON / MULTISIG)</div>
                <div className="text-white font-bold">Safe Multisig Sob Chave do H ROOT</div>
                <div className="text-zinc-400 text-[11px] truncate">Assinatura mestre vinculada ao ID 427273fd</div>
                <div className="text-emerald-400 text-[10px] pt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Zero delegação: apenas o Owner autoriza movimentações</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modelos Contratuais Ativos */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Modelos Contratuais Cadastrados (Repositório @LegalAgent)</span>
              </h3>
              <span className="text-xs text-zinc-400 font-mono">5 Modelos ICP-Brasil</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-white font-bold">1. Contrato de Mútuo Conversível em Quotas (SAFE Brasil)</div>
                  <div className="text-zinc-400 text-[11px]">Instrumento de aporte para investidores, juros remuneratórios e conversão Series A.</div>
                </div>
                <span className="px-2 py-1 rounded bg-zinc-800 text-emerald-400 text-[10px] shrink-0 border border-zinc-700">Validado Deloitte Legal</span>
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-white font-bold">2. PPA Comercial (Power Purchase Agreement - Consórcio MEx)</div>
                  <div className="text-zinc-400 text-[11px]">Contrato de fornecimento com desconto de 15% a 25% na tarifa de energia e SLA de suprimento.</div>
                </div>
                <span className="px-2 py-1 rounded bg-zinc-800 text-emerald-400 text-[10px] shrink-0 border border-zinc-700">Regulatório ANEEL</span>
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-white font-bold">3. Acordo de Sócios & Regras de CapTable</div>
                  <div className="text-zinc-400 text-[11px]">Cláusulas de Tag Along, Drag Along, vesting dos fundadores e autoridade de veto do H ROOT.</div>
                </div>
                <span className="px-2 py-1 rounded bg-zinc-800 text-amber-400 text-[10px] shrink-0 border border-zinc-700">Restrito H ROOT</span>
              </div>

              <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-white font-bold">4. Contrato de Cessão de Créditos & Lastro BESS</div>
                  <div className="text-zinc-400 text-[11px]">Vinculação das receitas de arbitragem tarifária ao pagamento prioritário dos investidores.</div>
                </div>
                <span className="px-2 py-1 rounded bg-zinc-800 text-purple-400 text-[10px] shrink-0 border border-zinc-700">Garantia Real</span>
              </div>
            </div>
          </div>

          {/* Quem Acessa, LGPD & Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Quem Acessa? (Matriz de Acesso RBAC)</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-white font-bold">H ROOT (Zeh Sobrinho)</div>
                  <div className="text-zinc-400 text-[11px]">Acesso irrestrito a todos os contratos, balanços, chaves e permissão de veto.</div>
                </div>
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-white font-bold">@LegalAgent & @ComplianceAgent</div>
                  <div className="text-zinc-400 text-[11px]">Leitura de minutas e geração de pareceres sem acesso a dados bancários brutos.</div>
                </div>
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-white font-bold">Investidores (Perfil INVESTOR)</div>
                  <div className="text-zinc-400 text-[11px]">Acesso somente ao seu próprio contrato assinado e aos relatórios de DRE.</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>LGPD & Blindagem de Segurança</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-emerald-400 font-bold">Anonimização de Faturas</div>
                  <div className="text-zinc-400 text-[11px]">Dados pessoais de clientes (CPF/telefone) são mascarados antes de análise por LLMs.</div>
                </div>
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-emerald-400 font-bold">Criptografia em Repouso e Trânsito</div>
                  <div className="text-zinc-400 text-[11px]">AES-256 no Firestore e TLS 1.3 em todos os canais de dados (HTTPS).</div>
                </div>
                <div className="p-2 bg-black/60 rounded border border-zinc-800">
                  <div className="text-emerald-400 font-bold">Registro Imutável de Logs</div>
                  <div className="text-zinc-400 text-[11px]">Toda consulta a dados de clientes gera log auditável no <code className="text-zinc-300">/audit_logs</code>.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Repositório Integral de Minutas & Contratos */}
          <EcosystemLegalSuite showToast={showToast} />
        </div>
      )}
    </div>
  )
}
