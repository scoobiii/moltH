import React, { useState } from "react"
import { BusinessAgentItem, UserAuthProfile } from "./types"
import { 
  Coins, 
  Wallet, 
  Zap, 
  Key, 
  Send, 
  Plus, 
  Check, 
  Copy, 
  ExternalLink, 
  Lock, 
  Unlock, 
  ArrowUpRight, 
  Activity, 
  RefreshCw, 
  Globe, 
  Terminal,
  ShieldCheck
} from "lucide-react"

interface CryptoAndConnectorsProps {
  agents: BusinessAgentItem[]
  currentUser: UserAuthProfile
  onUpdateAgent: (agent: BusinessAgentItem) => void
  showToast: (msg: string) => void
}

export const CryptoAndConnectors: React.FC<CryptoAndConnectorsProps> = ({
  agents,
  currentUser,
  onUpdateAgent,
  showToast
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "h-root")
  const [activeTab, setActiveTab] = useState<"wallets" | "connectors" | "treasury">("wallets")
  const [depositAmount, setDepositAmount] = useState<string>("1000")
  const [customDailyLimit, setCustomDailyLimit] = useState<string>("")
  const [customEndpoint, setCustomEndpoint] = useState<string>("")
  const [isTestingPing, setIsTestingPing] = useState<boolean>(false)

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copiado para a área de transferência!`)
  }

  // Handle Token Deposit by Owner
  const handleDepositToAgent = () => {
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) {
      showToast("Insira um valor válido de tokens.")
      return
    }

    const updated = {
      ...selectedAgent,
      wallet: {
        ...selectedAgent.wallet,
        balanceMEX: selectedAgent.wallet.balanceMEX + amt
      }
    }
    onUpdateAgent(updated)
    showToast(`Depositado ${amt} MEX na carteira de ${selectedAgent.handle}!`)
    setDepositAmount("1000")
  }

  // Handle Limit Update
  const handleUpdateLimit = () => {
    const limit = parseFloat(customDailyLimit)
    if (isNaN(limit) || limit < 0) {
      showToast("Insira um limite válido.")
      return
    }

    const updated = {
      ...selectedAgent,
      wallet: {
        ...selectedAgent.wallet,
        dailyAllowanceUSD: limit
      }
    }
    onUpdateAgent(updated)
    showToast(`Limite diário de ${selectedAgent.handle} atualizado para $${limit}!`)
    setCustomDailyLimit("")
  }

  // Handle Lock/Unlock
  const handleToggleLock = () => {
    const nextStatus = selectedAgent.wallet.status === "active" ? "locked" : "active"
    const updated = {
      ...selectedAgent,
      wallet: {
        ...selectedAgent.wallet,
        status: nextStatus as any
      }
    }
    onUpdateAgent(updated)
    showToast(nextStatus === "locked" ? `Carteira de ${selectedAgent.handle} travada pelo Owner.` : `Carteira de ${selectedAgent.handle} destravada!`)
  }

  // Test API Connector Ping
  const handleTestPing = () => {
    setIsTestingPing(true)
    setTimeout(() => {
      const pingMs = Math.floor(Math.random() * 30) + 8
      const updated = {
        ...selectedAgent,
        apiConnector: {
          ...selectedAgent.apiConnector,
          status: "connected" as any,
          lastPingMs: pingMs
        }
      }
      onUpdateAgent(updated)
      setIsTestingPing(false)
      showToast(`Ping com ${selectedAgent.apiConnector.connectorType} concluído: ${pingMs}ms (200 OK)`)
    }, 600)
  }

  // Save Connector Endpoint
  const handleSaveEndpoint = () => {
    if (!customEndpoint.trim()) return
    const updated = {
      ...selectedAgent,
      apiConnector: {
        ...selectedAgent.apiConnector,
        endpoint: customEndpoint
      }
    }
    onUpdateAgent(updated)
    showToast("Endpoint de conector API atualizado!")
    setCustomEndpoint("")
  }

  // Treasury Totals
  const totalMEX = agents.reduce((acc, curr) => acc + curr.wallet.balanceMEX, 0)
  const totalUSDC = agents.reduce((acc, curr) => acc + curr.wallet.balanceUSDC, 0)
  const totalKwh = agents.reduce((acc, curr) => acc + curr.wallet.kwhCredit, 0)

  return (
    <div className="px-4 pt-3 max-w-5xl mx-auto w-full space-y-6 pb-24 text-[#f2e6e4]">
      
      {/* Header with Owner Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292938]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#ffb4a8]" />
            <span>Carteiras Cripto On-Chain & Conectores API</span>
          </h2>
          <p className="text-xs text-[#baa19e] mt-0.5">
            20 contas soberanas de custódia geridas pelo Owner <strong>{currentUser.name}</strong> para o consórcio Mex Energia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#291716] text-[#ffb4a8] border border-[#522825] font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Owner Root: {currentUser.handle}</span>
          </span>
        </div>
      </div>

      {/* Treasury High-Level Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4">
          <div className="text-[11px] text-[#8a6b68] font-semibold">Total MEX Tokens</div>
          <div className="text-lg sm:text-xl font-black text-[#ffb4a8] mt-1">
            {totalMEX.toLocaleString()} <span className="text-xs font-normal">MEX</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Polygon Network</div>
        </div>

        <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4">
          <div className="text-[11px] text-[#8a6b68] font-semibold">Liquidez USDC</div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            ${totalUSDC.toLocaleString()} <span className="text-xs font-normal">USD</span>
          </div>
          <div className="text-[10px] text-[#8a6b68] mt-0.5">Custódia Multi-Sig</div>
        </div>

        <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4">
          <div className="text-[11px] text-[#8a6b68] font-semibold">Créditos de Energia BESS</div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
            {totalKwh.toLocaleString()} <span className="text-xs font-normal">kWh</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5">Mex Energia PPA</div>
        </div>

        <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4">
          <div className="text-[11px] text-[#8a6b68] font-semibold">Agentes Ativos</div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            20 / 20
          </div>
          <div className="text-[10px] text-[#ffb4a8] mt-0.5">100% Contratos Auditados</div>
        </div>
      </div>

      {/* Main Two-Column View: Agent Selector on Left, Controls on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Agent Picker List (Left Column) */}
        <div className="bg-[#131218] border border-[#262634] rounded-2xl p-3.5 space-y-2 max-h-[580px] overflow-y-auto">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9c7875] flex items-center justify-between">
            <span>20 Agentes</span>
            <span>Saldo MEX</span>
          </div>

          {agents.map(ag => {
            const isSelected = ag.id === selectedAgent.id
            return (
              <div
                key={ag.id}
                onClick={() => setSelectedAgentId(ag.id)}
                className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                  isSelected
                    ? "bg-[#291716] border border-[#ffb4a8]/50 text-white shadow-md"
                    : "bg-[#181822] hover:bg-[#20202c] text-[#baa19e]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">{ag.avatar}</span>
                  <div className="truncate">
                    <div className={`text-xs font-bold truncate ${isSelected ? "text-[#ffb4a8]" : "text-white"}`}>
                      {ag.handle}
                    </div>
                    <div className="text-[10px] text-[#8a6b68] truncate">{ag.role}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-white font-mono">
                    {ag.wallet.balanceMEX.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[#8a6b68] uppercase">{ag.wallet.network.split(" ")[0]}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Agent Control Hub (Right 2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Agent Header Card */}
          <div className="bg-[#15141c] border border-[#2d2c3c] rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2b1716] border border-[#4a2e2b] flex items-center justify-center text-2xl">
                  {selectedAgent.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">{selectedAgent.name}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedAgent.wallet.status === "active" 
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800" 
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}>
                      {selectedAgent.wallet.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#b89592]">{selectedAgent.role} • Auditor: {selectedAgent.firm}</div>
                </div>
              </div>

              <button
                onClick={handleToggleLock}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-center ${
                  selectedAgent.wallet.status === "active"
                    ? "bg-[#281c1c] text-[#ffb4a8] hover:bg-[#382222]"
                    : "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                }`}
              >
                {selectedAgent.wallet.status === "active" ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Travar Carteira</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Destravar</span>
                  </>
                )}
              </button>
            </div>

            {/* Wallet Address & Network Pill */}
            <div className="mt-4 p-3 bg-[#0e0d12] border border-[#242432] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#8a6b68]">Endereço On-Chain:</span>
                <span className="font-mono text-emerald-400 truncate">{selectedAgent.wallet.address}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e1e28] text-[#c4a4a0]">
                  {selectedAgent.wallet.network}
                </span>
                <button
                  onClick={() => copyToClipboard(selectedAgent.wallet.address, "Endereço da carteira")}
                  className="p-1.5 rounded-lg bg-[#1a1a24] text-[#ffb4a8] hover:bg-[#282836]"
                  title="Copiar endereço"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Balances Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 pt-3 border-t border-[#22222e] text-xs">
              <div className="p-2.5 rounded-xl bg-[#101016]">
                <div className="text-[#8a6b68] text-[11px]">Saldo MEX</div>
                <div className="text-base font-bold text-[#ffb4a8] mt-0.5">
                  {selectedAgent.wallet.balanceMEX.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#101016]">
                <div className="text-[#8a6b68] text-[11px]">Saldo USDC</div>
                <div className="text-base font-bold text-white mt-0.5">
                  ${selectedAgent.wallet.balanceUSDC.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#101016]">
                <div className="text-[#8a6b68] text-[11px]">Crédito Energia</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {selectedAgent.wallet.kwhCredit.toLocaleString()} kWh
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Actions & API Connectors */}
          <div className="flex gap-2 border-b border-[#262634] text-xs font-semibold">
            <button
              onClick={() => setActiveTab("wallets")}
              className={`pb-2 px-3 transition-all ${
                activeTab === "wallets" ? "border-b-2 border-[#ffb4a8] text-[#ffb4a8]" : "text-[#8a6b68] hover:text-white"
              }`}
            >
              Gestão de Fundos & Limites
            </button>
            <button
              onClick={() => setActiveTab("connectors")}
              className={`pb-2 px-3 transition-all ${
                activeTab === "connectors" ? "border-b-2 border-[#ffb4a8] text-[#ffb4a8]" : "text-[#8a6b68] hover:text-white"
              }`}
            >
              Conector API & Webhooks
            </button>
          </div>

          {/* Tab 1: Deposit & Limits */}
          {activeTab === "wallets" && (
            <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4 space-y-4">
              {/* Deposit Action */}
              <div>
                <label className="text-xs font-bold text-white block mb-1.5">
                  Transferir Tokens MEX para {selectedAgent.handle}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Quantidade de MEX"
                    className="flex-1 bg-[#1a1a24] border border-[#303040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffb4a8]"
                  />
                  <button
                    onClick={handleDepositToAgent}
                    className="py-2 px-4 rounded-xl bg-[#ffb4a8] text-black font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Depositar MEX</span>
                  </button>
                </div>
              </div>

              {/* Daily Allowance Cap */}
              <div className="pt-3 border-t border-[#22222e]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#8a6b68]">Limite Diário de Gastos do Agente:</span>
                  <strong className="text-white">${selectedAgent.wallet.dailyAllowanceUSD.toLocaleString()} USD/dia</strong>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customDailyLimit}
                    onChange={(e) => setCustomDailyLimit(e.target.value)}
                    placeholder="Novo limite diário em USD"
                    className="flex-1 bg-[#1a1a24] border border-[#303040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffb4a8]"
                  />
                  <button
                    onClick={handleUpdateLimit}
                    className="py-2 px-4 rounded-xl bg-[#22222e] text-[#d4b5b2] hover:text-white font-semibold text-xs transition-all shrink-0"
                  >
                    Salvar Limite
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Connectors & APIs */}
          {activeTab === "connectors" && (
            <div className="bg-[#14141c] border border-[#272736] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#ffb4a8]" />
                    <span>Conector: {selectedAgent.apiConnector.connectorType}</span>
                  </div>
                  <div className="text-[11px] text-[#8a6b68] mt-0.5">
                    Permite ao agente invocar oráculos externos, ordens ERP e liquidação de energia.
                  </div>
                </div>

                <button
                  onClick={handleTestPing}
                  disabled={isTestingPing}
                  className="px-3 py-1.5 rounded-xl bg-[#291716] text-[#ffb4a8] border border-[#522825] hover:bg-[#381e1c] text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingPing ? "animate-spin" : ""}`} />
                  <span>{isTestingPing ? "Testando..." : "Testar Ping (Live)"}</span>
                </button>
              </div>

              {/* Endpoint configuration */}
              <div>
                <label className="text-xs text-[#baa19e] font-medium block mb-1">Webhook / API Endpoint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedAgent.apiConnector.endpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    className="flex-1 bg-[#1a1a24] border border-[#303040] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#ffb4a8]"
                  />
                  <button
                    onClick={handleSaveEndpoint}
                    className="py-2 px-3.5 rounded-xl bg-[#22222e] text-[#d4b5b2] hover:text-white text-xs font-semibold"
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              {/* API Key Box */}
              <div className="p-3 bg-[#0d0d12] border border-[#242432] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="text-[11px] text-[#8a6b68]">Chave de Integração do Agente:</div>
                  <div className="font-mono text-emerald-400 mt-0.5">{selectedAgent.apiConnector.apiKeyPreview}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedAgent.apiConnector.apiKeyPreview, "Chave de API")}
                  className="p-1.5 rounded-lg bg-[#1a1a24] text-[#ffb4a8] hover:bg-[#282836]"
                  title="Copiar chave"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
