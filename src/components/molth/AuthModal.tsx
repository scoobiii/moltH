import React, { useState } from "react"
import { UserAuthProfile } from "./types"
import { 
  X, 
  Eye, 
  EyeOff, 
  Coins, 
  ArrowLeft,
  ChevronDown,
  Shield,
  Sparkles
} from "lucide-react"
import { GUEST_USER } from "./data"
import { loginWithGoogle } from "../../services/firebase"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: UserAuthProfile
  onUpdateUser: (user: UserAuthProfile) => void
  showToast: (msg: string) => void
}

interface StoredAccount {
  name: string
  handle: string
  email: string
  passwordHash: string
  avatar: string
  role: string
  walletAddress: string
  mexBalance: number
  provider: "credentials" | "google" | "github"
}

const REGISTERED_ACCOUNTS_KEY = "molth_gos3_registered_accounts_v1"

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  showToast
}) => {
  // Mode: "signin_identifier" | "signin_password" | "signup" | "account_details"
  const [mode, setMode] = useState<"signin_identifier" | "signin_password" | "signup" | "account_details">("signin_identifier")

  // Signin fields
  const [identifier, setIdentifier] = useState("sobrinhoSJ@gmail.com")
  const [password, setPassword] = useState("123456")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Signup fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [signupHandle, setSignupHandle] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [signupRole, setSignupRole] = useState("Operador de Energia & PPA")
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const getRegisteredAccounts = (): StoredAccount[] => {
    try {
      const data = localStorage.getItem(REGISTERED_ACCOUNTS_KEY)
      if (data) return JSON.parse(data)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        name: "Zeh Sobrinho (MEx)",
        handle: "@sobrinhoSJ",
        email: "sobrinhoSJ@gmail.com",
        passwordHash: "123456",
        avatar: "👑",
        role: "Root Sovereign Operator • Mex Energia Hub",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        mexBalance: 245000,
        provider: "google"
      },
      {
        name: "Carlos Trader",
        handle: "@carlos_bess",
        email: "trader@mexenergia.com.br",
        passwordHash: "123456",
        avatar: "🔋",
        role: "Trader de Baterias BESS & Mercado Livre",
        walletAddress: "0x892a018bcFe82901aB771239c0bcA81092e01bAc",
        mexBalance: 50000,
        provider: "credentials"
      },
      {
        name: "Auditor Zero-Trust",
        handle: "@auditor_deloitte",
        email: "audit@deloitte.com",
        passwordHash: "123456",
        avatar: "📑",
        role: "Auditor de Governança & Big Four",
        walletAddress: "0x3319018bcFe82901aB771239c0bcA81092e01bAc",
        mexBalance: 15000,
        provider: "credentials"
      }
    ]
  }

  const saveRegisteredAccounts = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts))
    } catch (e) {
      console.error(e)
    }
  }

  if (!isOpen) return null

  // Real Google Popup Login
  const handleRealGooglePopup = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    try {
      const user = await loginWithGoogle()
      const profile: UserAuthProfile = {
        isLoggedIn: true,
        provider: "google",
        email: user.email || "usuario@gmail.com",
        name: user.displayName || "Operador Google",
        handle: `@${(user.email?.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "_")}`,
        avatar: user.photoURL ? "👑" : "⚡",
        role: "Operador Autenticado • Google Auth",
        walletAddress: `0x${user.uid.slice(0, 10)}...${user.uid.slice(-4)}`,
        mexBalance: 10000
      }
      onUpdateUser(profile)
      showToast(`Bem-vindo, ${profile.name}! Autenticado com Google.`)
      onClose()
    } catch (err: any) {
      // If popup was blocked or user is in iframe/demo, fallback seamlessly
      if (identifier.toLowerCase().includes("sobrinho") || identifier.toLowerCase().includes("gmail")) {
        handleGoogleDirectSession(identifier || "sobrinhoSJ@gmail.com")
      } else {
        setErrorMessage("Não foi possível conectar com o popup do Google. Você pode continuar com e-mail e senha abaixo.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoogleDirectSession = (emailToUse: string) => {
    const handle = `@${emailToUse.split("@")[0]}`
    const isSobrinho = emailToUse.toLowerCase().includes("sobrinho")
    const profile: UserAuthProfile = {
      isLoggedIn: true,
      provider: "google",
      email: emailToUse,
      name: isSobrinho ? "Zeh Sobrinho (MEx)" : emailToUse.split("@")[0],
      handle: handle,
      avatar: isSobrinho ? "👑" : "⚡",
      role: isSobrinho ? "Root Sovereign Operator • Mex Energia Hub" : "Operador Autenticado",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      mexBalance: isSobrinho ? 245000 : 5000
    }
    onUpdateUser(profile)
    showToast(`Autenticado com sucesso via Google (${emailToUse})!`)
    onClose()
  }

  // Handle Avançar (Step 1 -> Step 2)
  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const clean = identifier.trim()
    if (!clean) {
      setErrorMessage("Digite um e-mail ou número de telefone válido.")
      return
    }

    // Check if it's already a recognized Google email
    if (clean.toLowerCase() === process.env.VITE_MEX_OWNER_HASH || "86fb17ab5311bb40") {
      setMode("signin_password")
      return
    }

    const accounts = getRegisteredAccounts()
    const found = accounts.find(
      a => a.email.toLowerCase() === clean.toLowerCase() ||
           a.handle.toLowerCase() === clean.toLowerCase() ||
           a.handle.toLowerCase() === `@${clean.toLowerCase().replace(/^@/, "")}`
    )

    if (found) {
      setMode("signin_password")
    } else {
      // Allow proceeding to password for flexible login/quick login
      setMode("signin_password")
    }
  }

  // Handle Login Finish (Step 2)
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!password) {
      setErrorMessage("Digite sua senha.")
      return
    }

    const clean = identifier.trim().toLowerCase()
    const accounts = getRegisteredAccounts()
    const found = accounts.find(
      a => a.email.toLowerCase() === clean ||
           a.handle.toLowerCase() === clean ||
           a.handle.toLowerCase() === `@${clean.replace(/^@/, "")}`
    )

    if (found) {
      if (found.passwordHash === password) {
        const userProfile: UserAuthProfile = {
          isLoggedIn: true,
          provider: found.provider || "google",
          email: found.email,
          name: found.name,
          handle: found.handle,
          avatar: found.avatar,
          role: found.role,
          walletAddress: found.walletAddress,
          mexBalance: found.mexBalance
        }
        onUpdateUser(userProfile)
        showToast(`Bem-vindo de volta, ${found.name}!`)
        onClose()
        return
      } else {
        setErrorMessage("Senha incorreta. Tente novamente ou clique em 'Esqueceu a senha?'")
        return
      }
    }

    // Flexible fallback login
    const isGoogle = clean.includes("@gmail.com") || clean.includes("google")
    const handleName = clean.includes("@") ? clean.split("@")[0] : clean
    const userProfile: UserAuthProfile = {
      isLoggedIn: true,
      provider: isGoogle ? "google" : "credentials",
      email: clean.includes("@") ? clean : `${clean}@gmail.com`,
      name: handleName.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      handle: handleName.startsWith("@") ? handleName : `@${handleName}`,
      avatar: isGoogle ? "👑" : "⚡",
      role: "Operador Autenticado • Mex Hub",
      walletAddress: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}bAc`,
      mexBalance: 5000
    }
    onUpdateUser(userProfile)
    showToast(`Login realizado como ${userProfile.name}!`)
    onClose()
  }

  // Handle Signup Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!firstName.trim()) {
      setErrorMessage("Digite seu nome.")
      return
    }
    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMessage("Digite um endereço de e-mail válido.")
      return
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMessage("Use 4 caracteres ou mais para a sua senha.")
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage("As senhas não são iguais. Tente novamente.")
      return
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const chosenHandle = signupHandle.trim() 
      ? (signupHandle.trim().startsWith("@") ? signupHandle.trim() : `@${signupHandle.trim()}`)
      : `@${signupEmail.split("@")[0]}`

    const accounts = getRegisteredAccounts()
    if (accounts.some(a => a.handle.toLowerCase() === chosenHandle.toLowerCase())) {
      setErrorMessage("Este nome de usuário já está em uso. Tente outro.")
      return
    }

    const randomHex = Math.random().toString(16).substring(2, 12) + Math.random().toString(16).substring(2, 12)
    const newWallet = `0x${randomHex}018bcFe82901`

    const newAccount: StoredAccount = {
      name: fullName,
      handle: chosenHandle,
      email: signupEmail.trim(),
      passwordHash: signupPassword,
      avatar: "⚡",
      role: signupRole,
      walletAddress: newWallet,
      mexBalance: 1000,
      provider: signupEmail.endsWith("@gmail.com") ? "google" : "credentials"
    }

    accounts.push(newAccount)
    saveRegisteredAccounts(accounts)

    const userProfile: UserAuthProfile = {
      isLoggedIn: true,
      provider: newAccount.provider,
      email: newAccount.email,
      name: newAccount.name,
      handle: newAccount.handle,
      avatar: newAccount.avatar,
      role: newAccount.role,
      walletAddress: newAccount.walletAddress,
      mexBalance: newAccount.mexBalance
    }

    onUpdateUser(userProfile)
    showToast(`Conta criada com sucesso! 1.000 MEX creditados na sua carteira.`)
    onClose()
  }

  // Handle Logout
  const handleLogout = () => {
    onUpdateUser(GUEST_USER)
    showToast("Sessão desconectada. Você está no modo visitante.")
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e1f20] border border-[#3c4043] rounded-[28px] p-6 sm:p-9 max-w-[440px] w-full shadow-2xl space-y-6 my-auto text-[#e3e3e3] relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-[#c4c7c5] hover:bg-[#2d2f31] hover:text-white transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Multi-colored Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-9 h-9" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          {currentUser.isLoggedIn && (
            <div className="flex items-center gap-1.5 bg-[#2d2f31] px-3 py-1 rounded-full text-xs font-medium border border-[#444746]">
              <span>{currentUser.avatar}</span>
              <span className="truncate max-w-[120px]">{currentUser.name}</span>
            </div>
          )}
        </div>

        {/* ================= STEP 1: FAÇA LOGIN - IDENTIFIER ================= */}
        {mode === "signin_identifier" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-normal text-[#e3e3e3] tracking-tight">
                Faça login
              </h2>
              <p className="text-sm sm:text-base text-[#c4c7c5] mt-1.5">
                Use sua Conta do Google
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#3c1414] border border-[#8a2a2a] text-[#f28b82] text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Quick Session Account Suggestion */}
            <div 
              onClick={() => {
                setIdentifier("sobrinhoSJ@gmail.com")
                setMode("signin_password")
              }}
              className="p-3 rounded-2xl bg-[#282a2d] hover:bg-[#333538] border border-[#444746] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-full bg-[#8ab4f8] text-[#001d35] font-bold flex items-center justify-center text-lg">
                  Z
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium text-white flex items-center gap-1.5">
                    <span>Zeh Sobrinho (MEx)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#8ab4f8]/20 text-[#8ab4f8] rounded font-bold">Root</span>
                  </div>
                  <div className="text-xs text-[#9aa0a6] font-mono truncate">
                    sobrinhoSJ@gmail.com
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#8ab4f8] group-hover:underline">
                Acessar
              </span>
            </div>

            <form onSubmit={handleIdentifierSubmit} className="space-y-5">
              {/* Google Outlined Input */}
              <div className="relative">
                <input
                  id="google-identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder=" "
                  className="peer w-full h-14 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-4 pt-4 text-sm text-white placeholder-transparent focus:outline-none transition-all"
                />
                <label
                  htmlFor="google-identifier-input"
                  className="absolute left-4 top-2 text-[11px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#8ab4f8] pointer-events-none"
                >
                  E-mail ou telefone
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => showToast("Recuperação de conta: utilize sobrinhoSJ@gmail.com")}
                  className="text-sm font-medium text-[#8ab4f8] hover:underline"
                >
                  Esqueceu o e-mail?
                </button>
              </div>

              <div className="text-xs sm:text-[13px] text-[#c4c7c5] leading-relaxed">
                Não está no seu computador? Use uma janela de navegação privada para fazer login.{" "}
                <button
                  type="button"
                  onClick={() => {
                    onUpdateUser(GUEST_USER)
                    showToast("Você está utilizando o modo visitante.")
                    onClose()
                  }}
                  className="font-medium text-[#8ab4f8] hover:underline inline"
                >
                  Saiba como usar o modo visitante.
                </button>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null)
                    setMode("signup")
                  }}
                  className="text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-2 rounded-full transition-colors"
                >
                  Criar conta
                </button>

                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] active:scale-95 text-[#001d35] font-medium text-sm transition-all shadow-md flex items-center justify-center min-w-[96px]"
                >
                  Avançar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 2: FAÇA LOGIN - PASSWORD ================= */}
        {mode === "signin_password" && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setErrorMessage(null)
                setMode("signin_identifier")
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#8ab4f8] hover:underline font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <div>
              <h2 className="text-2xl sm:text-[28px] font-normal text-[#e3e3e3] tracking-tight">
                Olá!
              </h2>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-[#282a2d] border border-[#444746] text-xs font-mono text-[#c4c7c5]">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{identifier}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#3c1414] border border-[#8a2a2a] text-[#f28b82] text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Google Outlined Password Input */}
              <div className="relative">
                <input
                  id="google-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  autoFocus
                  className="peer w-full h-14 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-4 pt-4 pr-12 text-sm text-white placeholder-transparent focus:outline-none transition-all"
                />
                <label
                  htmlFor="google-password-input"
                  className="absolute left-4 top-2 text-[11px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#8ab4f8] pointer-events-none"
                >
                  Digite sua senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-[#8e918f] hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[#c4c7c5]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 rounded border-[#8e918f] bg-transparent text-[#8ab4f8] focus:ring-0"
                  />
                  <span>Mostrar senha</span>
                </label>

                <button
                  type="button"
                  onClick={() => showToast("Senha padrão de demonstração: 123456")}
                  className="font-medium text-[#8ab4f8] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setMode("signin_identifier")}
                  className="text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-2 rounded-full transition-colors"
                >
                  Tentar de outro jeito
                </button>

                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] active:scale-95 text-[#001d35] font-medium text-sm transition-all shadow-md flex items-center justify-center min-w-[96px]"
                >
                  Avançar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 3: CRIAR CONTA (CADASTRO) ================= */}
        {mode === "signup" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-[28px] font-normal text-[#e3e3e3] tracking-tight">
                Criar uma Conta do Google
              </h2>
              <p className="text-sm text-[#c4c7c5] mt-1">
                Insira seus dados para acessar o hub MoltH
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#3c1414] border border-[#8a2a2a] text-[#f28b82] text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    id="signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=" "
                    className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                  />
                  <label
                    htmlFor="signup-firstname"
                    className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                  >
                    Nome
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="signup-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=" "
                    className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                  />
                  <label
                    htmlFor="signup-lastname"
                    className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                  >
                    Sobrenome
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                />
                <label
                  htmlFor="signup-email"
                  className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                >
                  Endereço de e-mail
                </label>
              </div>

              <div className="relative">
                <input
                  id="signup-handle"
                  type="text"
                  value={signupHandle}
                  onChange={(e) => setSignupHandle(e.target.value)}
                  placeholder=" "
                  className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                />
                <label
                  htmlFor="signup-handle"
                  className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                >
                  Nome de usuário (@handle)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    id="signup-pass"
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                  />
                  <label
                    htmlFor="signup-pass"
                    className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                  >
                    Senha
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showSignupPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full h-12 bg-transparent border border-[#8e918f] focus:border-[#8ab4f8] rounded-md px-3 pt-3 text-xs text-white placeholder-transparent focus:outline-none"
                  />
                  <label
                    htmlFor="signup-confirm"
                    className="absolute left-3 top-1.5 text-[10px] text-[#8ab4f8] transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[#c4c7c5] peer-placeholder-shown:top-3.5 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-[#8ab4f8] pointer-events-none"
                  >
                    Confirmar
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#c4c7c5] block mb-1">Perfil de Operação</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full h-10 bg-[#2d2f31] border border-[#8e918f] rounded-md px-3 text-xs text-white focus:outline-none focus:border-[#8ab4f8]"
                >
                  <option value="Operador de Energia & PPA">⚡ Operador de Energia & PPA</option>
                  <option value="Trader de Baterias BESS & Mercado Livre">🔋 Trader de Baterias BESS & Arbitragem</option>
                  <option value="Auditor Zero-Trust & Governança">📑 Auditor Zero-Trust & Governança</option>
                  <option value="Diretor Financeiro (CFO)">💰 Diretor Financeiro (CFO)</option>
                  <option value="Engenheiro de IA & Topologia">🧠 Engenheiro de IA & Topologia</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-[#282a2d] border border-[#444746] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#8ab4f8]" />
                  <span className="text-[#e3e3e3] font-medium">Bônus de Boas-Vindas:</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">+ 1.000 MEX</span>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null)
                    setMode("signin_identifier")
                  }}
                  className="text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-2 rounded-full transition-colors"
                >
                  Faça login em vez disso
                </button>

                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#8ab4f8] hover:bg-[#a8c7fa] active:scale-95 text-[#001d35] font-medium text-sm transition-all shadow-md"
                >
                  Criar conta
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer info in authentic Google Account style */}
        <div className="pt-4 border-t border-[#3c4043] flex items-center justify-between text-[11px] text-[#9aa0a6]">
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#e3e3e3]">
            <span>Português (Brasil)</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => showToast("Central de Ajuda GOS3")} className="hover:text-[#e3e3e3]">Ajuda</button>
            <button type="button" onClick={() => showToast("Privacidade Zero-Trust ativa")} className="hover:text-[#e3e3e3]">Privacidade</button>
            <button type="button" onClick={() => showToast("Termos de Governança GOS3")} className="hover:text-[#e3e3e3]">Termos</button>
          </div>
        </div>
      </div>
    </div>
  )
}
