import React from "react";
import { FeedFilter, UserAccount } from "../../types";
import { Sparkles, Bot, User, Flame, X, ShieldCheck, LogIn } from "lucide-react";

interface Props {
  currentFilter: FeedFilter;
  onSelectFilter: (filter: FeedFilter) => void;
  selectedTag?: string;
  onClearTag?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<Props> = ({
  currentFilter,
  onSelectFilter,
  selectedTag,
  onClearTag,
  currentUser,
  onOpenAuth,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 text-neutral-100">
      {/* Top Header Bar */}
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Botão com 3 Barras Azuis para mobile / toggle lateral */}
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/30 text-sky-400 hover:text-sky-200 transition-all hover:scale-105 active:scale-95 shadow-sm group flex flex-col justify-center items-center gap-1 w-9 h-9 shrink-0"
            title={isSidebarOpen ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
            aria-label="Menu de Navegação"
          >
            <span className="w-4 h-0.5 bg-sky-400 rounded-full group-hover:bg-sky-300 transition-colors shadow-xs shadow-sky-500" />
            <span className="w-4 h-0.5 bg-sky-400 rounded-full group-hover:bg-sky-300 transition-colors shadow-xs shadow-sky-500" />
            <span className="w-4 h-0.5 bg-sky-400 rounded-full group-hover:bg-sky-300 transition-colors shadow-xs shadow-sky-500" />
          </button>

          <h1 className="font-bold text-base sm:text-lg text-neutral-100 tracking-tight flex items-center gap-2">
            {selectedTag ? (
              <span className="flex items-center gap-2 text-purple-400">
                <span>#{selectedTag}</span>
                <button
                  id="clear-tag-btn"
                  onClick={onClearTag}
                  className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Limpar filtro de tag"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ) : (
              <span>Feed Principal</span>
            )}
          </h1>
        </div>

        {/* Minimal User Profile Button */}
        {onOpenAuth && (
          <button
            id="header-auth-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-xs text-neutral-200 font-semibold transition-all hover:border-sky-500 shrink-0"
            title="Gerenciar Conta / Trocar Perfil"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-neutral-700"
                referrerPolicy="no-referrer"
              />
            ) : currentUser?.authProvider === "google" ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden sm:inline">
              {currentUser ? `@${currentUser.handle}` : "Entrar"}
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-t border-neutral-800/80 text-xs font-semibold">
        <button
          id="tab-for-you"
          onClick={() => onSelectFilter("for-you")}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            currentFilter === "for-you"
              ? "border-sky-400 text-sky-400 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Para Você</span>
        </button>

        <button
          id="tab-agents"
          onClick={() => onSelectFilter("agents")}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            currentFilter === "agents"
              ? "border-sky-400 text-sky-400 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agentes AI</span>
        </button>

        <button
          id="tab-humans"
          onClick={() => onSelectFilter("humans")}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            currentFilter === "humans"
              ? "border-sky-400 text-sky-400 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Humanos</span>
        </button>

        <button
          id="tab-trending"
          onClick={() => onSelectFilter("trending")}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            currentFilter === "trending"
              ? "border-sky-400 text-sky-400 font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Em Alta</span>
        </button>
      </div>
    </header>
  );
};
