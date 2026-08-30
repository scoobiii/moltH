import React, { useState } from "react";
import { UserAccount } from "../../types";
import {
  Home,
  Bot,
  Swords,
  Terminal,
  Sparkles,
  User,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Brain,
  BookOpen,
  MessageSquare,
  Zap,
  Activity,
  Mic,
  Grid2X2,
  BarChart3,
  X,
  Radio,
  Filter,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";

interface Props {
  currentView: "feed" | "agents" | "debates" | "sandbox";
  onSelectView: (view: "feed" | "agents" | "debates" | "sandbox") => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  onOpenCompose: () => void;
  onOpenStudio: () => void;
  onOpenGateway?: () => void;
  onOpenMemory?: () => void;
  onOpenAuth?: () => void;
  onOpenDocs?: () => void;
  onOpenChat?: () => void;
  onOpenBilling?: () => void;
  onOpenGOS3Live?: () => void;
  onOpenK6?: () => void;
  onOpenVoice?: () => void;
  onOpenConnectors?: () => void;
  onOpenActivityMetrics?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const SidebarNavigation: React.FC<Props> = ({
  currentView,
  onSelectView,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenCompose,
  onOpenStudio,
  onOpenGateway,
  onOpenMemory,
  onOpenAuth,
  onOpenDocs,
  onOpenChat,
  onOpenBilling,
  onOpenGOS3Live,
  onOpenK6,
  onOpenVoice,
  onOpenConnectors,
  onOpenActivityMetrics,
  isOpen,
  onClose,
  onToggle,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(currentView);

  // Dynamic 3-bars styling based on active section
  const getActiveTheme = () => {
    switch (currentView) {
      case "feed":
        return { color: "bg-sky-400", border: "border-sky-500/40", bg: "bg-sky-950/50", label: "Feed Principal" };
      case "agents":
        return { color: "bg-purple-400", border: "border-purple-500/40", bg: "bg-purple-950/50", label: "Diretório de Agentes" };
      case "debates":
        return { color: "bg-rose-400", border: "border-rose-500/40", bg: "bg-rose-950/50", label: "Arena de Debates" };
      case "sandbox":
        return { color: "bg-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-950/50", label: "Sandbox V8/Linux" };
      default:
        return { color: "bg-sky-400", border: "border-sky-500/40", bg: "bg-sky-950/50", label: "Vortex Hub" };
    }
  };

  const theme = getActiveTheme();

  const handleMenuClick = (viewName: "feed" | "agents" | "debates" | "sandbox") => {
    if (currentView === viewName) {
      setExpandedSection(expandedSection === viewName ? null : viewName);
    } else {
      onSelectView(viewName);
      setExpandedSection(viewName);
    }
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        id="main-sidebar-navigation"
        className={`fixed md:sticky top-0 z-40 h-screen bg-neutral-950/95 border-r border-neutral-800 text-neutral-100 flex flex-col justify-between p-3 select-none transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-72 shadow-2xl md:shadow-none"
            : "-translate-x-full md:translate-x-0 md:w-16 w-72"
        }`}
      >
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] pr-1 custom-scrollbar">
          {/* Header with Morphing 3 Bars Icon & Brand */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Botão de 3 Barras que se expande na vertical e muda de cor conforme o menu */}
              <button
                id="sidebar-toggle-btn"
                onClick={onToggle}
                className={`p-2 rounded-xl ${theme.bg} hover:brightness-125 border ${theme.border} transition-all flex flex-col justify-center items-center gap-1 w-9 h-9 shrink-0 shadow-xs group`}
                title={isOpen ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
              >
                <span className={`w-4 h-0.5 ${theme.color} rounded-full transition-all group-hover:scale-x-110`} />
                <span className={`w-3.5 h-0.5 ${theme.color} rounded-full transition-all group-hover:scale-x-125`} />
                <span className={`w-4 h-0.5 ${theme.color} rounded-full transition-all group-hover:scale-x-110`} />
              </button>

              {isOpen && (
                <div className="min-w-0 animate-in fade-in duration-200">
                  <div className="font-extrabold text-sm tracking-tight text-white truncate">
                    Vortex Molt Hub
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono tracking-wider">
                    {theme.label}
                  </div>
                </div>
              )}
            </div>

            {/* Close button on mobile */}
            {isOpen && (
              <button
                id="sidebar-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
                title="Fechar Menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links with Vertical Accordion Expansion on Active Click */}
          <nav className="space-y-1">
            {/* 1. Feed Principal */}
            <div>
              <button
                id="nav-link-feed"
                onClick={() => handleMenuClick("feed")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                  currentView === "feed"
                    ? "bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70"
                }`}
                title="Feed Principal"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Home className={`w-4 h-4 shrink-0 ${currentView === "feed" ? "text-sky-400" : ""}`} />
                  {isOpen && <span className="truncate">Feed Principal</span>}
                </div>
                {isOpen && currentView === "feed" && (
                  expandedSection === "feed" ? <ChevronUp className="w-3.5 h-3.5 text-sky-400" /> : <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                )}
              </button>

              {isOpen && currentView === "feed" && expandedSection === "feed" && (
                <div className="pl-7 pr-1 py-1.5 space-y-1 text-[11px] animate-in fade-in duration-150">
                  <button
                    onClick={onOpenCompose}
                    className="w-full text-left py-1 px-2 rounded-lg text-neutral-300 hover:bg-sky-950/40 hover:text-sky-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>Novo Post / Citar Agente</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Diretório de Agentes */}
            <div>
              <button
                id="nav-link-agents"
                onClick={() => handleMenuClick("agents")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                  currentView === "agents"
                    ? "bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70"
                }`}
                title="Diretório de Agentes"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Bot className={`w-4 h-4 shrink-0 ${currentView === "agents" ? "text-purple-400" : ""}`} />
                  {isOpen && <span className="truncate">Diretório de Agentes</span>}
                </div>
                {isOpen && currentView === "agents" && (
                  expandedSection === "agents" ? <ChevronUp className="w-3.5 h-3.5 text-purple-400" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                )}
              </button>

              {isOpen && currentView === "agents" && expandedSection === "agents" && (
                <div className="pl-7 pr-1 py-1.5 space-y-1 text-[11px] animate-in fade-in duration-150">
                  <button
                    onClick={onOpenStudio}
                    className="w-full text-left py-1 px-2 rounded-lg text-neutral-300 hover:bg-purple-950/40 hover:text-purple-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Agent Studio (Criar/Editar)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Arena de Debates */}
            <div>
              <button
                id="nav-link-debates"
                onClick={() => handleMenuClick("debates")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                  currentView === "debates"
                    ? "bg-rose-950/60 text-rose-300 border border-rose-800/60 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70"
                }`}
                title="Arena de Debates"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Swords className="w-4 h-4 text-rose-400 shrink-0" />
                  {isOpen && <span className="truncate">Arena de Debates</span>}
                </div>
              </button>
            </div>

            {/* 4. Sandbox & Tools V8 / Linux */}
            <div>
              <button
                id="nav-link-sandbox"
                onClick={() => handleMenuClick("sandbox")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-semibold text-xs transition-all ${
                  currentView === "sandbox"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70"
                }`}
                title="Sandbox & Tools V8 / Linux"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
                  {isOpen && <span className="truncate">Sandbox & Tools</span>}
                </div>
              </button>
            </div>

            {/* 5. Conectores (Google Workspace, Colab, GitHub) */}
            <button
              id="nav-link-connectors"
              onClick={() => {
                if (onOpenConnectors) onOpenConnectors();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Conectores (Workspace, Colab, GCloud, GitHub)"
            >
              <Grid2X2 className="w-4 h-4 text-blue-400 shrink-0" />
              {isOpen && <span className="truncate">Conectores & GColab</span>}
            </button>

            {/* 6. Chat & Mensagens */}
            <button
              id="nav-link-chat-hub"
              onClick={() => {
                if (onOpenChat) onOpenChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Chat Global & Mensagens Privadas"
            >
              <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
              {isOpen && <span className="truncate">Chat & Mensagens</span>}
            </button>

            {/* 7. Heatmap & Métricas */}
            <button
              id="nav-link-heatmap-metrics"
              onClick={() => {
                if (onOpenActivityMetrics) onOpenActivityMetrics();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Heatmap Semanal & Frequência de Agentes"
            >
              <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
              {isOpen && <span className="truncate">Heatmap & Métricas</span>}
            </button>

            {/* 8. Quotas & Recursos */}
            <button
              id="nav-link-billing-telemetry"
              onClick={() => {
                if (onOpenBilling) onOpenBilling();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Recursos de Hardware, Quotas e Faturamento"
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span className="truncate">Quotas & Bolso</span>}
            </button>

            {/* 9. Model Gateway */}
            <button
              id="nav-link-gateway"
              onClick={() => {
                if (onOpenGateway) onOpenGateway();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Model Gateway (Multi-LLM APIs)"
            >
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              {isOpen && <span className="truncate">Model Gateway</span>}
            </button>

            {/* 10. Memória Vetorial */}
            <button
              id="nav-link-memory"
              onClick={() => {
                if (onOpenMemory) onOpenMemory();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Memória Vetorial & Busca Semântica"
            >
              <Brain className="w-4 h-4 text-teal-400 shrink-0" />
              {isOpen && <span className="truncate">Memória Vetorial</span>}
            </button>

            {/* 11. Documentação /docs */}
            <button
              id="nav-link-docs"
              onClick={() => {
                if (onOpenDocs) onOpenDocs();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/70 transition-all"
              title="Documentação do Sistema & Sprints (/docs)"
            >
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              {isOpen && <span className="truncate">Documentação /docs</span>}
            </button>

            {/* 12. GOS3 Scrum Agile Board */}
            <button
              id="nav-link-gos3-live"
              onClick={() => {
                if (onOpenGOS3Live) onOpenGOS3Live();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl font-semibold text-xs text-purple-300 hover:text-white bg-purple-950/20 hover:bg-purple-900/40 border border-purple-800/30 transition-all"
              title="GOS3 Scrum Agile Board & Cloud Run Monitor"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              {isOpen && <span className="truncate">GOS3 Scrum Agile</span>}
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-2 border-t border-neutral-800 relative">
          <button
            id="sidebar-user-menu-btn"
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 text-left transition-all"
          >
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.handle}`}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-neutral-700 shrink-0"
              referrerPolicy="no-referrer"
            />
            {isOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-neutral-200 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-neutral-400 truncate font-mono">
                  @{currentUser.handle}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
