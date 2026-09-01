import React, { useState } from "react"
import { UserAuthProfile } from "./types"
import { X, Check, ShieldCheck, LogOut, Key, Globe, Sparkles } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserAuthProfile
  onUpdateUser: (user: UserAuthProfile) => void
  showToast: (msg: string) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  showToast
}) => {
  const [customHandle, setCustomHandle] = useState(currentUser.handle)
  const [customEmail, setCustomEmail] = useState(currentUser.email)
  const [activeTab, setActiveTab] = useState<"oauth" | "sovereign_key" | "profile">("oauth")

  if (!isOpen) return null

  const handleGoogleLogin = () => {
    onUpdateUser({
      ...currentUser,
      isLoggedIn: true,
      provider: "google",
      email: "sobrinhoSJ@gmail.com",
      name: "Zeh Sobrinho (MEx)",
      handle: "@sobrinhoSJ",
      avatar: "👑",
      role: "Root Sovereign Operator • Mex Energia Hub"
    })
    showToast("Autenticado via Google com sucesso!")
    onClose()
  }

  const handleGitHubLogin = () => {
    onUpdateUser({
      ...currentUser,
      isLoggedIn: true,
      provider: "github",
      email: "sobrinhoSJ@github.com",
      name: "Zeh Sobrinho (Dev)",
      handle: "@zeh-sobrinho",
      avatar: "⚡",
      role: "Core Developer • Mex Hub"
    })
    showToast("Autenticado via GitHub com sucesso!")
    onClose()
  }

  const handleLogout = () => {
    onUpdateUser({
      isLoggedIn: false,
      provider: "guest",
      email: "visitante@molth.io",
      name: "Visitante Convidado",
      handle: "@guest",
      avatar: "👤",
      role: "Observador Público",
      walletAddress: "0x0000000000000000000000000000000000000000",
      mexBalance: 0
    })
    showToast("Desconectado com sucesso.")
    onClose()
  }

  const handleSaveProfile = () => {
    onUpdateUser({
      ...currentUser,
      handle: customHandle,
      email: customEmail
    })
    showToast("Perfil atualizado!")
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#14141c] border border-[#3e2c30] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffb4a8] to-[#802a22] flex items-center justify-center text-black font-black text-sm">
              M
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Autenticação & Identidade</h3>
              <p className="text-[11px] text-[#b89592]">Google • GitHub • Sovereign Key</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9c7875] hover:bg-[#202028] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Pill */}
        <div className="p-3.5 rounded-2xl bg-[#0e0e14] border border-[#262634] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{currentUser.avatar}</div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ffb4a8] text-black font-extrabold uppercase">
                  {currentUser.provider}
                </span>
              </div>
              <div className="text-xs text-[#baa19e] font-mono">{currentUser.email}</div>
            </div>
          </div>

          {currentUser.isLoggedIn && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#2b1816] text-[#ffb4a8] hover:bg-[#3d1e1a] transition-all flex items-center gap-1 text-xs font-semibold"
              title="Desconectar da sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#242430] text-xs">
          <button
            onClick={() => setActiveTab("oauth")}
            className={`pb-2.5 px-3 font-semibold transition-all ${
              activeTab === "oauth" ? "border-b-2 border-[#ffb4a8] text-[#ffb4a8]" : "text-[#8a6b68] hover:text-white"
            }`}
          >
            Provedores OAuth
          </button>
          <button
            onClick={() => setActiveTab("sovereign_key")}
            className={`pb-2.5 px-3 font-semibold transition-all ${
              activeTab === "sovereign_key" ? "border-b-2 border-[#ffb4a8] text-[#ffb4a8]" : "text-[#8a6b68] hover:text-white"
            }`}
          >
            Chave Soberana & Web3
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2.5 px-3 font-semibold transition-all ${
              activeTab === "profile" ? "border-b-2 border-[#ffb4a8] text-[#ffb4a8]" : "text-[#8a6b68] hover:text-white"
            }`}
          >
            Editar Perfil
          </button>
        </div>

        {/* Tab Content: OAuth */}
        {activeTab === "oauth" && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl bg-[#1e1e28] hover:bg-[#282836] border border-[#38384d] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all group active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z" />
              </svg>
              <span>Conectar com Google Workspace (sobrinhoSJ@gmail.com)</span>
            </button>

            <button
              onClick={handleGitHubLogin}
              className="w-full py-3 px-4 rounded-2xl bg-[#181822] hover:bg-[#222230] border border-[#38384d] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Conectar com GitHub (@zeh-sobrinho)</span>
            </button>
          </div>
        )}

        {/* Tab Content: Sovereign Key */}
        {activeTab === "sovereign_key" && (
          <div className="space-y-3 text-xs text-[#baa19e]">
            <div className="p-3 bg-[#0d0d12] border border-[#282836] rounded-xl font-mono text-[11px]">
              <div className="text-white font-bold mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#ffb4a8]" />
                <span>Chave Soberana do Operador Root</span>
              </div>
              <div className="text-emerald-400 break-all">
                {currentUser.walletAddress}
              </div>
              <div className="text-[10px] text-[#8e6d6a] mt-1">
                Assinatura GOS3 v1.3 • Acesso a 20 sandboxes e custódia Mex Energia.
              </div>
            </div>

            <button
              onClick={() => {
                showToast("Chave Soberana revalidada na rede Polygon!")
                onClose()
              }}
              className="w-full py-2.5 rounded-xl bg-[#ffb4a8] text-black font-bold text-xs hover:opacity-90"
            >
              Revalidar Assinatura Criptográfica
            </button>
          </div>
        )}

        {/* Tab Content: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#baa19e] font-medium block mb-1">Handle</label>
              <input
                type="text"
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#303040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffb4a8]"
              />
            </div>
            <div>
              <label className="text-xs text-[#baa19e] font-medium block mb-1">Email de Contato</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-[#1a1a24] border border-[#303040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffb4a8]"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-[#ffb4a8] text-black font-semibold text-xs hover:opacity-90"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
