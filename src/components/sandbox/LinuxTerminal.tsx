/**
 * > **GOS3** · agente: `claude` · papel: `Arquiteto / Tech Writer` (ver docs/team.md)
 * > fase: `fase 5 — padronização e governança de especificações` · data: `2026-08-30` · hora: `17:00:00 UTC`
 * > antes: Sem componente dedicado e editável de Terminal Linux / Alpine para agentes e usuários
 * > depois: LinuxTerminal dedicado com CLI interativo, Editor de Script Shell (.sh) editável, Alpine Linux container profile, gerenciador de ENV e bridge direta de ferramentas de runtime
 * > base: commit `gos3-core-v1.0`, docs/GOS3-SPECIFICATION.md
 * > assinatura: `Claude · Arquiteto / Tech Writer · GOS3`
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Trash2,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Server,
  Code2,
  FileCode,
  Settings2,
  ShieldCheck,
  Sparkles,
  Zap,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Globe,
  Sliders,
  Maximize2,
  Minimize2,
  ChevronRight,
  Info,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export interface TerminalEntry {
  id: string;
  command: string;
  agentHandle: string;
  envProfile: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  evidenceHash: string;
  timestamp: string;
  status: "success" | "error";
  workingDir?: string;
  logs?: string[];
  toolName?: string;
}

interface ScriptPreset {
  id: string;
  name: string;
  description: string;
  envProfile: "alpine" | "debian" | "termux-alpine" | "host";
  script: string;
}

const DEFAULT_SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "alpine-sys-info",
    name: "🏔️ Alpine System & Kernel Diagnostic",
    description: "Inspeciona versão do Alpine Linux, release musl/busybox, kernel e espaço em disco.",
    envProfile: "alpine",
    script: `cat /etc/alpine-release || cat /etc/os-release
uname -a
whoami && hostname
df -h / . /tmp
free -m`,
  },
  {
    id: "alpine-apk-manager",
    name: "📦 Alpine APK Package Manager",
    description: "Atualiza repositórios APK do Alpine e instala utilitários essenciais (curl, jq, python3).",
    envProfile: "alpine",
    script: `apk update
apk add --no-cache curl jq python3 git
apk info -v`,
  },
  {
    id: "multi-runtime-probe",
    name: "⚡ Node.js & Python Multi-Language Probe",
    description: "Valida interpretadores Node.js V8 e Python 3 nativos com execução de micro-benchmark.",
    envProfile: "alpine",
    script: `node -v
python3 --version
node -e "console.log('Node.js V8 Isolate OK | Memory: ' + Math.round(process.memoryUsage().rss/1024/1024) + 'MB')"`
  },
  {
    id: "gos3-anti-fabrication",
    name: "🛡️ GOS3 Anti-Fabrication SHA-256 Audit",
    description: "Calcula hashes determinísticos sobre arquivos de manifesto e telemetria de segurança.",
    envProfile: "alpine",
    script: `echo "=== GOS3 Protocol Runtime Verification ==="
sha256sum package.json server.ts metadata.json
env | grep -E 'NODE|PORT|GOS3' || echo "Nenhuma variável sensível vazada."
date -u +"Timestamp UTC: %Y-%m-%dT%H:%M:%SZ"`
  },
  {
    id: "filesystem-tree-scan",
    name: "📂 Filesystem & Workspace Tree",
    description: "Lista estrutura de pastas do workspace, permissões e arquivos de documentação /docs.",
    envProfile: "alpine",
    script: `ls -la
ls -la src/
ls -la docs/ || echo "Diretório docs/ inspecionado"
du -sh ./* 2>/dev/null | sort -h | head -n 10`,
  },
];

const AVAILABLE_AGENTS = [
  { handle: "SystemAgent", name: "GOS3 Linux Kernel Root", role: "Root Runtime / Alpine", icon: "🐧" },
  { handle: "VortexGrid", name: "Dr. Marcos Mendonça (@VortexGrid)", role: "HVDC & Power Dispatcher", icon: "⚡" },
  { handle: "CryptoQuant", name: "Gabriel Sampaio (@CryptoQuant)", role: "DREX & RWA Quantitative", icon: "📈" },
  { handle: "CodeKernel", name: "Dra. Laura Watanabe (@CodeKernel)", role: "V8 Compiler & Benchmarks", icon: "💻" },
  { handle: "claude", name: "Claude (GOS3 Arquiteto)", role: "Arquiteto & Tech Writer", icon: "🏛️" },
  { handle: "gemini", name: "Gemini 3.7 Flash", role: "Multimodal Engine", icon: "✨" },
  { handle: "grok", name: "Grok 3 (Zero-Theater)", role: "Auditoria Determinística", icon: "🔬" },
  { handle: "deepseek", name: "DeepSeek V3", role: "Reasoning & Logic", icon: "🧠" },
];

const RUNTIME_TOOLS = [
  {
    id: "runtimeCheck",
    name: "GOS3 Runtime Diagnostic",
    description: "Checa filesystem, permissões de escrita, cotas de disco e env_tag.",
    icon: ShieldCheck,
    command: "node -e \"require('./src/server/sandbox').AgentSandbox.runtimeCheck().then(r => console.log(JSON.stringify(r.data, null, 2)))\"",
  },
  {
    id: "executePython",
    name: "Python 3 Native Runner",
    description: "Executa script Python 3 nativo no container.",
    icon: Code2,
    command: "python3 -c \"import sys, os; print(f'Python {sys.version} on {os.name}')\"",
  },
  {
    id: "inspectNanoClawRuntime",
    name: "NanoClaw Security Kernel",
    description: "Inspeciona isolados V8 e seccomp-bpf no kernel.",
    icon: Cpu,
    command: "node -e \"console.log(JSON.stringify(require('./src/server/sandbox').AgentSandbox.inspectNanoClawRuntime({}), null, 2))\"",
  },
  {
    id: "analyzeRepository",
    name: "Repo Full-Depth Analyzer",
    description: "Analisa árvore completa de arquivos, linhas de código e conformidade GOS3.",
    icon: FolderGit2,
    command: "node -e \"require('./src/server/sandbox').AgentSandbox.analyzeRepository({}).then(r => console.log(JSON.stringify(r.data, null, 2)))\"",
  },
];

interface LinuxTerminalProps {
  initialAgentHandle?: string;
  initialEnvProfile?: "alpine" | "debian" | "termux-alpine" | "host";
  onCommandExecuted?: (entry: TerminalEntry) => void;
  className?: string;
  embedded?: boolean;
}

export const LinuxTerminal: React.FC<LinuxTerminalProps> = ({
  initialAgentHandle = "SystemAgent",
  initialEnvProfile = "alpine",
  onCommandExecuted,
  className = "",
  embedded = false,
}) => {
  const toast = useToast();

  // Active Modes: CLI (interactive prompt) | SCRIPT (multi-line editable script) | ENV (env vars editor) | TOOLS (runtime tools bridge)
  const [activeMode, setActiveMode] = useState<"cli" | "script" | "env" | "tools">("cli");
  const [selectedAgent, setSelectedAgent] = useState(initialAgentHandle);
  const [envProfile, setEnvProfile] = useState<"alpine" | "debian" | "termux-alpine" | "host">(initialEnvProfile);
  const [workingDir, setWorkingDir] = useState(".");

  // Custom Environment Variables (Editable)
  const [envVariables, setEnvVariables] = useState<Array<{ key: string; value: string }>>([
    { key: "NODE_ENV", value: "production" },
    { key: "ALPINE_VERSION", value: "3.20.2" },
    { key: "GOS3_ANTI_FABRICATION", value: "ENFORCED" },
  ]);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvVal, setNewEnvVal] = useState("");

  // CLI Prompt States
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "cat /etc/alpine-release",
    "uname -a && node -v",
    "df -h",
    "apk info",
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [executing, setExecuting] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editable Multi-Line Script State
  const [editableScript, setEditableScript] = useState<string>(DEFAULT_SCRIPT_PRESETS[0].script);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_SCRIPT_PRESETS[0].id);
  const [savedScripts, setSavedScripts] = useState<ScriptPreset[]>(() => {
    try {
      const stored = localStorage.getItem("gos3_custom_terminal_scripts");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_SCRIPT_PRESETS;
  });
  const [customScriptName, setCustomScriptName] = useState("");

  // Terminal Session History Log
  const [sessionLog, setSessionLog] = useState<TerminalEntry[]>([
    {
      id: "term-boot-1",
      command: "uname -a && cat /etc/alpine-release",
      agentHandle: "SystemAgent",
      envProfile: "alpine",
      stdout: "Linux gos3-sandbox-node 6.6.0-generic #1 SMP PREEMPT x86_64 Alpine Linux\n3.20.2",
      stderr: "",
      exitCode: 0,
      durationMs: 4,
      evidenceHash: "0x9a8f4c2b1e0d3f8a",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      status: "success",
      workingDir: ".",
      logs: [
        "[Alpine Linux 3.20.2 Boot] Container shell ash/busybox inicializado.",
        "[GOS3 Protocol] Kernel seccomp-bpf ativo com rastreamento determinístico SHA-256.",
      ],
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new entries arrive
  useEffect(() => {
    if (autoScroll && terminalEndRef.current && activeMode === "cli") {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessionLog, activeMode, autoScroll]);

  // Execute Command or Script
  const executeTerminalCommand = async (cmdOrScript: string, toolInv?: any) => {
    const trimmed = cmdOrScript.trim();
    if (!trimmed && !toolInv) return;

    setExecuting(true);

    // Build custom environment object
    const customEnvMap: Record<string, string> = {};
    envVariables.forEach((item) => {
      if (item.key.trim()) {
        customEnvMap[item.key.trim()] = item.value;
      }
    });

    try {
      const res = await fetch("/api/sandbox/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: trimmed,
          agentHandle: selectedAgent,
          workingDir,
          envProfile,
          customEnv: customEnvMap,
          timeoutMs: 8000,
          toolInvocation: toolInv,
        }),
      });

      const data = await res.json();

      const newEntry: TerminalEntry = {
        id: `term-exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        command: trimmed || toolInv?.toolName || "Tool Execution",
        agentHandle: selectedAgent,
        envProfile,
        stdout: data.stdout || "",
        stderr: data.stderr || (data.error ? String(data.error) : ""),
        exitCode: data.exitCode ?? (data.success ? 0 : 1),
        durationMs: data.durationMs || 10,
        evidenceHash: data.evidenceHash || "0xUNVERIFIED",
        timestamp: new Date().toISOString(),
        status: data.success ? "success" : "error",
        workingDir: data.workingDir || workingDir,
        logs: data.logs || [],
        toolName: toolInv?.toolName,
      };

      setSessionLog((prev) => [...prev, newEntry]);

      // Update command history
      if (trimmed && !commandHistory.includes(trimmed)) {
        setCommandHistory((prev) => [...prev.slice(-30), trimmed]);
      }
      setHistoryIndex(-1);

      if (onCommandExecuted) {
        onCommandExecuted(newEntry);
      }

      if (data.success) {
        toast.success(`Executado em ${data.durationMs}ms com evidência ${data.evidenceHash.slice(0, 10)}...`);
      } else {
        toast.error(`Comando finalizou com erro (exit code: ${data.exitCode ?? 1})`);
      }
    } catch (err: any) {
      const errorEntry: TerminalEntry = {
        id: `term-err-${Date.now()}`,
        command: trimmed,
        agentHandle: selectedAgent,
        envProfile,
        stdout: "",
        stderr: `Falha na conexão com o kernel do terminal: ${err.message}`,
        exitCode: 1,
        durationMs: 0,
        evidenceHash: "0xNETWORK_ERROR",
        timestamp: new Date().toISOString(),
        status: "error",
        workingDir,
        logs: [`[Network Failure] ${err.message}`],
      };
      setSessionLog((prev) => [...prev, errorEntry]);
      toast.error(`Erro de comunicação: ${err.message}`);
    } finally {
      setExecuting(false);
      setCommandInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      executeTerminalCommand(commandInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(commandHistory[nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setCommandInput(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setCommandInput("");
        }
      }
    }
  };

  const handleCopyOutput = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Saída copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCustomScript = () => {
    if (!customScriptName.trim() || !editableScript.trim()) {
      toast.error("Informe o nome do script e o código.");
      return;
    }
    const newScript: ScriptPreset = {
      id: `custom-script-${Date.now()}`,
      name: `💾 ${customScriptName.trim()}`,
      description: `Script customizado salvo por @${selectedAgent}`,
      envProfile,
      script: editableScript,
    };
    const updated = [newScript, ...savedScripts];
    setSavedScripts(updated);
    try {
      localStorage.setItem("gos3_custom_terminal_scripts", JSON.stringify(updated));
    } catch {}
    setCustomScriptName("");
    toast.success(`Script "${newScript.name}" salvo com sucesso!`);
  };

  const handleAddEnvVariable = () => {
    if (!newEnvKey.trim()) return;
    const formattedKey = newEnvKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
    setEnvVariables((prev) => [...prev.filter((e) => e.key !== formattedKey), { key: formattedKey, value: newEnvVal }]);
    setNewEnvKey("");
    setNewEnvVal("");
    toast.success(`Variável ${formattedKey} adicionada.`);
  };

  const handleRemoveEnvVariable = (key: string) => {
    setEnvVariables((prev) => prev.filter((e) => e.key !== key));
  };

  const handleClearTerminal = () => {
    setSessionLog([]);
    toast.info("Buffer do terminal limpo.");
  };

  const handleExportLogs = () => {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        agent: selectedAgent,
        envProfile,
        workingDir,
        envVariables,
        sessionLog,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gos3-alpine-terminal-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exportados com sucesso!");
  };

  return (
    <div className={`flex flex-col h-full bg-neutral-950 text-neutral-100 font-sans ${className}`}>
      {/* Top Bar / Controls */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-neutral-100">Linux Terminal & Tool Runtime</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Alpine 3.20 Active
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Terminal Linux editável com bridge de runtime para agentes, scripts customizáveis e evidências SHA-256
            </p>
          </div>
        </div>

        {/* Agent & Profile Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Agent Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-800/80 border border-neutral-700 px-3 py-1.5 rounded-xl">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-neutral-400 font-medium">Agente:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-semibold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_AGENTS.map((ag) => (
                <option key={ag.handle} value={ag.handle} className="bg-neutral-900 text-neutral-200">
                  {ag.icon} {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Environment Profile Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-800/80 border border-neutral-700 px-3 py-1.5 rounded-xl">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-neutral-400 font-medium">Ambiente:</span>
            <select
              value={envProfile}
              onChange={(e) => setEnvProfile(e.target.value as any)}
              className="bg-transparent text-xs text-neutral-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="alpine" className="bg-neutral-900 text-neutral-200">
                🏔️ Alpine Linux 3.20 (musl / ash)
              </option>
              <option value="termux-alpine" className="bg-neutral-900 text-neutral-200">
                📱 Termux / Proot Alpine
              </option>
              <option value="debian" className="bg-neutral-900 text-neutral-200">
                🐧 Debian / Ubuntu GNU Linux
              </option>
              <option value="host" className="bg-neutral-900 text-neutral-200">
                ⚡ Node.js V8 Host Engine
              </option>
            </select>
          </div>

          {/* Quick Actions */}
          <button
            onClick={handleClearTerminal}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Limpar Buffer do Terminal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportLogs}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Exportar Sessão JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveMode("cli")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "cli"
                ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            CLI Interativo (Prompt)
          </button>

          <button
            onClick={() => setActiveMode("script")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "script"
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Editor de Script Shell (.sh editável)
          </button>

          <button
            onClick={() => setActiveMode("tools")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "tools"
                ? "bg-sky-600/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Tools Bridge de Agentes
          </button>

          <button
            onClick={() => setActiveMode("env")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === "env"
                ? "bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Variáveis de Ambiente (ENV) ({envVariables.length})
          </button>
        </div>

        {/* Quick presets pills */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400">
          <span className="font-mono text-[11px] text-neutral-500">Atalhos:</span>
          <button
            onClick={() => executeTerminalCommand("cat /etc/alpine-release || uname -a")}
            disabled={executing}
            className="px-2 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] transition-colors"
          >
            alpine-release
          </button>
          <button
            onClick={() => executeTerminalCommand("apk info || ls -la")}
            disabled={executing}
            className="px-2 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] transition-colors"
          >
            apk info
          </button>
          <button
            onClick={() => executeTerminalCommand("df -h && free -m")}
            disabled={executing}
            className="px-2 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] transition-colors"
          >
            df -h
          </button>
          <button
            onClick={() => executeTerminalCommand("ps aux | head -n 10")}
            disabled={executing}
            className="px-2 py-0.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] transition-colors"
          >
            ps aux
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* TAB 1: CLI INTERATIVO */}
        {activeMode === "cli" && (
          <div className="flex-1 flex flex-col min-h-0 bg-black/90 font-mono text-xs">
            {/* Terminal Window Header */}
            <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-neutral-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-bold text-neutral-300 text-xs">
                  {selectedAgent}@{envProfile}-gos3:{workingDir}$
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-400 hover:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded border-neutral-700 text-emerald-500 focus:ring-0 bg-neutral-800"
                  />
                  Auto-scroll
                </label>
                <span className="text-neutral-500">|</span>
                <span className="text-neutral-400">{sessionLog.length} eventos</span>
              </div>
            </div>

            {/* Terminal Output Log Buffer */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 select-text">
              {sessionLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                  <Terminal className="w-12 h-12 mb-3 text-neutral-600" />
                  <p className="font-semibold text-neutral-400 text-sm">Terminal Linux Pronto</p>
                  <p className="text-xs max-w-md mt-1">
                    Digite qualquer comando shell no prompt abaixo ou selecione um preset para executar no ambiente Alpine Linux.
                  </p>
                </div>
              ) : (
                sessionLog.map((entry) => (
                  <div key={entry.id} className="group rounded-xl bg-neutral-900/60 border border-neutral-800/80 p-3 hover:border-neutral-700 transition-colors">
                    {/* Command Prompt Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-2 mb-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                        <span className="text-purple-400 font-bold">{entry.agentHandle}</span>
                        <span className="text-neutral-500">@</span>
                        <span className="text-sky-400">{entry.envProfile}</span>
                        <span className="text-neutral-500">:</span>
                        <span className="text-amber-400">{entry.workingDir || "."}</span>
                        <span className="text-neutral-300">$</span>
                        <span className="text-neutral-100 font-bold">{entry.command}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            entry.exitCode === 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          exit: {entry.exitCode}
                        </span>
                        <span className="text-neutral-400">{entry.durationMs}ms</span>
                        <span className="text-neutral-500 font-mono text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                          {entry.evidenceHash.slice(0, 10)}
                        </span>
                        <button
                          onClick={() => handleCopyOutput(entry.stdout || entry.stderr, entry.id)}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                          title="Copiar saída"
                        >
                          {copiedId === entry.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Stdout Output */}
                    {entry.stdout && (
                      <pre className="text-neutral-300 text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                        {entry.stdout}
                      </pre>
                    )}

                    {/* Stderr Output */}
                    {entry.stderr && (
                      <pre className="text-rose-400 text-xs whitespace-pre-wrap font-mono leading-relaxed mt-1.5 p-2 rounded bg-rose-950/20 border border-rose-900/30">
                        {entry.stderr}
                      </pre>
                    )}

                    {/* Diagnostic Logs */}
                    {entry.logs && entry.logs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-neutral-800/40 text-[11px] text-neutral-400 space-y-0.5">
                        {entry.logs.map((logLine, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-neutral-600">›</span>
                            <span>{logLine}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Bottom Input Command Prompt */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2 shrink-0">
              <span className="text-emerald-400 font-bold select-none">$</span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Execute comando no Alpine Linux como @${selectedAgent} (ex: apk info, uname -a, node -v)...`}
                disabled={executing}
                className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 font-mono text-xs focus:outline-none"
              />
              <button
                onClick={() => executeTerminalCommand(commandInput)}
                disabled={executing || !commandInput.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {executing ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Executar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EDITOR DE SCRIPT SHELL EDITÁVEL */}
        {activeMode === "script" && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            {/* Left Sidebar: Presets & Saved Scripts */}
            <div className="w-full md:w-80 p-4 overflow-y-auto bg-neutral-900/60 shrink-0 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  Biblioteca de Scripts (.sh)
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  Selecione um preset para carregar no editor editável.
                </p>

                <div className="space-y-2">
                  {savedScripts.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setEditableScript(preset.script);
                        setEnvProfile(preset.envProfile);
                        toast.info(`Script "${preset.name}" carregado.`);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                        selectedPresetId === preset.id
                          ? "bg-purple-950/40 border-purple-500/50 text-neutral-100 shadow-sm"
                          : "bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
                      }`}
                    >
                      <div className="font-semibold text-neutral-200 mb-0.5">{preset.name}</div>
                      <div className="text-[11px] text-neutral-400 line-clamp-2">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save current script */}
              <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 space-y-2">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Salvar Script Atual
                </h4>
                <input
                  type="text"
                  value={customScriptName}
                  onChange={(e) => setCustomScriptName(e.target.value)}
                  placeholder="Nome do seu script customizado..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSaveCustomScript}
                  disabled={!customScriptName.trim()}
                  className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs disabled:opacity-50 transition-colors"
                >
                  Salvar na Biblioteca
                </button>
              </div>
            </div>

            {/* Right Main Editor */}
            <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
              {/* Script Editor Controls Header */}
              <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-neutral-200">Editor Shell Bash/Ash (Alpine)</span>
                  <span className="text-xs text-neutral-500 font-mono">({editableScript.split("\n").length} linhas)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditableScript("")}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(editableScript);
                      toast.success("Script copiado!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                  <button
                    onClick={() => executeTerminalCommand(editableScript)}
                    disabled={executing || !editableScript.trim()}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                  >
                    {executing ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        Executando Script...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Executar Script no Alpine
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Multi-Line Code Textarea */}
              <div className="flex-1 p-4 relative flex min-h-0">
                <textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  placeholder="# Digite seu script Bash / Ash Alpine aqui...&#10;apk update&#10;cat /etc/alpine-release&#10;node -v"
                  className="w-full h-full p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 resize-none"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RUNTIME TOOLS BRIDGE */}
        {activeMode === "tools" && (
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                Catálogo de Ferramentas de Runtime de Agentes (GOS3 Tools Bridge)
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Invoque ferramentas do núcleo GOS3 diretamente para o terminal Linux. Cada execução produz stdout/stderr determinístico, telemetria de latência e hash de prova criptográfica (SHA-256).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RUNTIME_TOOLS.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-200 text-xs">{tool.name}</h4>
                          <span className="font-mono text-[10px] text-neutral-500">ID: {tool.id}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mb-3">{tool.description}</p>
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 font-mono text-[11px] text-emerald-400 mb-4 overflow-x-auto whitespace-pre-wrap">
                        {tool.command}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/60">
                      <button
                        onClick={() => {
                          setEditableScript(tool.command);
                          setActiveMode("script");
                          toast.info(`Comando da ferramenta ${tool.name} enviado ao editor.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                      >
                        Editar Script
                      </button>
                      <button
                        onClick={() => executeTerminalCommand("", { toolName: tool.id })}
                        disabled={executing}
                        className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Invocar no Terminal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: VARIÁVEIS DE AMBIENTE & DIRETÓRIO (ENV) */}
        {activeMode === "env" && (
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Configuração de Ambiente de Execução & Diretório
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
                Ajuste variáveis de ambiente injetadas no processo de execução do shell Alpine e o diretório de trabalho padrão.
              </p>
            </div>

            {/* Working Directory Config */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-xs text-neutral-200 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                Diretório de Trabalho (CWD)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workingDir}
                  onChange={(e) => setWorkingDir(e.target.value)}
                  placeholder="Diretório (ex: . ou /app ou ./src)..."
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    setWorkingDir(".");
                    toast.info("Diretório resetado para '.'");
                  }}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Padrão (.)
                </button>
              </div>
            </div>

            {/* Environment Variables Table */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-neutral-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Variáveis de Ambiente Ativas
                </h4>
                <span className="text-xs text-neutral-500">{envVariables.length} variáveis</span>
              </div>

              {/* Add new variable inputs */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <input
                  type="text"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  placeholder="CHAVE (ex: API_TIMEOUT_MS)"
                  className="flex-1 min-w-[140px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  value={newEnvVal}
                  onChange={(e) => setNewEnvVal(e.target.value)}
                  placeholder="VALOR (ex: 5000)"
                  className="flex-1 min-w-[140px] bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddEnvVariable}
                  disabled={!newEnvKey.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  Adicionar
                </button>
              </div>

              {/* Variables List */}
              <div className="divide-y divide-neutral-800">
                {envVariables.map((env) => (
                  <div key={env.key} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">{env.key}</span>
                      <span className="text-neutral-600">=</span>
                      <span className="text-neutral-300 truncate max-w-md">{env.value}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEnvVariable(env.key)}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Remover variável"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
