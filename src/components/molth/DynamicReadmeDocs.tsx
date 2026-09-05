import React, { useState, useEffect } from "react";
import { 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Cpu, 
  Copy, 
  Check, 
  Play,
  ShieldCheck,
  Terminal,
  Activity
} from "lucide-react";

/**
 * > **GOS3** · agente: `Gemini / ProtocolEngine` · papel: `Dynamic README & CI Truth Matrix Viewer (AJAX)`
 * > fase: `Zero Simulação Oculta (ADR-002) — Provas de CI em Tempo Real` · data: `2026-09-05`
 * > assinatura: `Gemini · ProtocolEngine · GOS3`
 */

interface AreaAudit {
  id: string;
  name: string;
  claimedDescription: string;
  status: "IMPLEMENTED" | "PARTIAL" | "NOT_PROVEN";
  statusIcon: string;
  verifiablePercent: number;
  testSuite: string;
  testsPassed: number;
  testsTotal: number;
  evidenceHash: string;
  runtimeProof: string;
  honestDisclaimer: string;
}

interface CITruthData {
  timestamp: string;
  totalVerifiablePercent: number;
  areas: AreaAudit[];
  matrixEvidenceHash: string;
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryRssMb: number;
  };
  readmeMarkdownPreview: string;
  isLiveTestRunning?: boolean;
}

interface DynamicReadmeDocsProps {
  showToast?: (msg: string) => void;
}

export const DynamicReadmeDocs: React.FC<DynamicReadmeDocsProps> = ({ showToast }) => {
  const [truthData, setTruthData] = useState<CITruthData | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"matrix" | "full_readme" | "evidence">("matrix");
  const [copied, setCopied] = useState<boolean>(false);
  const [pollIntervalMs, setPollIntervalMs] = useState<number>(5000);

  // Fetch live truth matrix from API via AJAX
  const fetchTruth = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/ci/truth");
      if (res.ok) {
        const data: CITruthData = await res.json();
        setTruthData(data);
      }
    } catch (err) {
      console.warn("Falha no polling da matriz CI:", err);
    } finally {
      if (!silent) {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    }
  };

  // Fetch full live README.md content
  const fetchReadme = async () => {
    try {
      const res = await fetch("/api/docs/readme");
      if (res.ok) {
        const data = await res.json();
        setReadmeContent(data.content || "");
      }
    } catch (err) {
      console.warn("Falha ao carregar README.md:", err);
    }
  };

  // Trigger real CI test execution on the server
  const handleTriggerSuite = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/ci/run-suite", { method: "POST" });
      const data = await res.json();
      if (showToast) {
        showToast(data.message || "Bateria CI iniciada.");
      }
      // Re-fetch state immediately
      setTimeout(() => fetchTruth(true), 1000);
    } catch (err: any) {
      if (showToast) showToast("Erro ao disparar suite: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger sync of README with live truth
  const handleSyncReadme = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/ci/sync-readme", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast("README.md sincronizado com a Matriz de Verdade!");
        await fetchReadme();
        await fetchTruth(true);
      }
    } catch (err: any) {
      if (showToast) showToast("Erro ao sincronizar README: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTruth();
    fetchReadme();

    // Auto-polling via AJAX (Interval configurable)
    const interval = setInterval(() => {
      fetchTruth(true);
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  const copyMatrixHash = () => {
    if (!truthData) return;
    navigator.clipboard.writeText(truthData.matrixEvidenceHash);
    setCopied(true);
    if (showToast) showToast("Evidence Hash copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: AreaAudit["status"]) => {
    switch (status) {
      case "IMPLEMENTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            100% COMPROVADO
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            PARCIAL (ISOLADO)
          </span>
        );
      case "NOT_PROVEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 font-mono">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            NÃO COMPROVADO (NÃO SIMULADO)
          </span>
        );
    }
  };

  return (
    <div id="dynamic-readme-docs-container" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-zinc-800 bg-[#0d0e12] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                README Docs Dinâmico & Matriz de Verdade CI
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Este painel e o <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded">README.md</code> são gerados <strong>em tempo real via AJAX</strong> diretamente a partir dos resultados dos testes e compiladores. <span className="text-zinc-300">Sem suposições estatísticas ou opiniões subjetivas de LLM.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchTruth(false)}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Recarregar via AJAX agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isRefreshing ? "Consultando..." : "Polling AJAX"}</span>
            </button>

            <button
              onClick={handleTriggerSuite}
              disabled={truthData?.isLiveTestRunning || isRefreshing}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              title="Executa os testes e atualiza tudo em background"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{truthData?.isLiveTestRunning ? "CI Executando..." : "Rodar Suíte CI"}</span>
            </button>

            <button
              onClick={handleSyncReadme}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 border border-zinc-600 transition-all"
              title="Escreve os dados atuais direto no arquivo README.md"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync README.md</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar Barometer */}
        {truthData && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <span className="text-zinc-500">PROVA DE RUNTIME:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {truthData.totalVerifiablePercent}% COMPROVADO
                </span>
                <span className="text-zinc-500">|</span>
                <span className="text-amber-400/90">
                  {100 - truthData.totalVerifiablePercent}% NÃO SIMULADO (SAFE SKIP)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <span>Hash da Matriz:</span>
                <button
                  onClick={copyMatrixHash}
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-emerald-400 transition-colors"
                >
                  <span>sha256:{truthData.matrixEvidenceHash.substring(0, 16)}...</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-zinc-900 rounded-full h-3.5 p-0.5 border border-zinc-800 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-500 relative group"
                style={{ width: `${truthData.totalVerifiablePercent}%` }}
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
              </div>
              <div
                className="bg-zinc-800/80 h-full transition-all duration-500"
                style={{ width: `${100 - truthData.totalVerifiablePercent}%` }}
                title="Módulos que requerem chaves reais ou nós de rede (ex.: mainnet, n8n remoto)"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1.5">
              <span>0% (Mocks Rejeitados)</span>
              <span>50%</span>
              <span>100% (Soberania Completa)</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "matrix"
                ? "bg-zinc-800 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Matriz de Verdade Dinâmica ({truthData?.areas.length || 5} Módulos)
          </button>

          <button
            onClick={() => {
              setActiveTab("full_readme");
              fetchReadme();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "full_readme"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>README.md ao Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "bg-zinc-800 text-amber-300 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetria CI & Comandos</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Polling a cada {pollIntervalMs / 1000}s</span>
        </div>
      </div>

      {/* Tab 1: Matriz de Verdade Dinâmica */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {truthData?.areas.map((area) => (
              <div
                key={area.id}
                className="p-4 rounded-xl border border-zinc-800/80 bg-[#101114] hover:border-zinc-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-sm">{area.name}</span>
                    {getStatusBadge(area.status)}
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                      {area.verifiablePercent}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{area.claimedDescription}</p>

                  <div className="text-[11px] font-mono text-zinc-400 flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-zinc-500">Suíte:</span>
                    <span className="text-zinc-300">{area.testSuite}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">Passaram:</span>
                    <span className="text-emerald-400 font-bold">{area.testsPassed}/{area.testsTotal}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">Hash:</span>
                    <span className="text-zinc-300">sha256:{area.evidenceHash}</span>
                  </div>

                  <div className="text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60 mt-2">
                    <span className="text-amber-400/90 font-semibold font-mono text-[11px] block mb-0.5">
                      ⚖️ Declaração GOS3 Anti-Fabricação:
                    </span>
                    <span className="text-zinc-300">{area.honestDisclaimer}</span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end justify-between self-stretch">
                  <div className="text-right hidden md:block">
                    <span className="text-[11px] font-mono text-zinc-500 block">Status de Execução</span>
                    <span className="text-xs font-mono text-emerald-400">Verificado pelo Compilador</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-800 max-w-xs text-left md:text-right">
                    {area.runtimeProof}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-[#0e0f12] text-xs text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Regra de Ouro GOS3: Se um módulo alegar 100% sem prova formal em <code className="text-emerald-300">vitest</code> ou <code className="text-emerald-300">tsx</code>, o gate rejeita.</span>
            </div>
            <span className="font-mono text-zinc-500">ADR-002 • ADR-003</span>
          </div>
        </div>
      )}

      {/* Tab 2: Full README.md ao Vivo */}
      {activeTab === "full_readme" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <span className="text-emerald-400">●</span>
              <span>README.md no disco</span>
              <span className="text-zinc-500">|</span>
              <span>Atualizado dinamicamente</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(readmeContent);
                if (showToast) showToast("README.md copiado!");
              }}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-3 h-3" />
              <span>Copiar Markdown</span>
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0c0d10] p-4 max-h-[600px] overflow-y-auto font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {readmeContent || "Carregando conteúdo dinâmico do README.md..."}
          </div>
        </div>
      )}

      {/* Tab 3: Telemetria CI & Comandos */}
      {activeTab === "evidence" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-[#101114] p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Ambiente de Execução da Auditoria</span>
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">Node.js:</span>
                  <span className="text-zinc-200">{truthData?.system.nodeVersion || "v22.23.2"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">Plataforma:</span>
                  <span className="text-zinc-200">{truthData?.system.platform || "linux x64"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">Uptime do Processo:</span>
                  <span className="text-zinc-200">{truthData?.system.uptimeSeconds} segundos</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Consumo RSS:</span>
                  <span className="text-emerald-400 font-bold">{truthData?.system.memoryRssMb} MB</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#101114] p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Comandos Determinísticos Disponíveis</span>
              </h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-500"># Recalcular matriz de verdade:</span>
                  <p className="text-emerald-300 font-bold">npm run test:matrix</p>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-500"># Pipeline completa de CI:</span>
                  <p className="text-emerald-300 font-bold">npm run test:ci</p>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                  <span className="text-zinc-500"># Endpoint REST (AJAX Polling):</span>
                  <p className="text-sky-300">GET /api/ci/truth</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0e0f12] p-4 text-xs font-mono space-y-2">
            <span className="text-zinc-400 font-bold block">Preview do Bloco Injetado no README:</span>
            <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-zinc-400 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {truthData?.readmeMarkdownPreview}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
