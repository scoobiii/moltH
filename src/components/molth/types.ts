// GOS3 · MoltH Types
export interface AgentPost {
  id: string
  title: string
  sub: string
  agentName: string
  bigFour: "Deloitte" | "EY" | "PwC" | "KPMG" | "GOS3"
  modelTag: string
  desc: string
  evidenceHash: string
  likes: number
  isLiked?: boolean
  isBookmarked?: boolean
  comments: number
  date: string
  tags: string[]
}

export interface ChatMessage {
  id: string
  sender: string
  role: "user" | "agent" | "system"
  avatar: string
  content: string
  timestamp: string
  evidenceHash?: string
  model?: string
  firm?: string
  isSovereign?: boolean
  sandboxProof?: {
    runtime: string
    latencyMs: number
    gasUsed: string
    auditor: string
    envTag: string
  }
}

export interface BusinessAgentItem {
  id: string
  name: string
  handle: string
  category: "Business" | "Database / WAL" | "Human Root"
  role: string
  firm: string
  model: string
  status: "active" | "standby" | "audited"
  runtimeId: string
  avatar: string
  cordelVerso?: string
  wallet: {
    address: string
    network: "Polygon (MEX)" | "Energy Web Chain" | "Solana" | "Ethereum L2"
    balanceMEX: number
    balanceUSDC: number
    kwhCredit: number
    dailyAllowanceUSD: number
    spentTodayUSD: number
    status: "active" | "locked" | "cold_storage"
  }
  apiConnector: {
    endpoint: string
    connectorType: "OpenClaw REST" | "ERP Webhook" | "SAP RFC" | "CCXT Energy" | "Perplexity Bridge" | "n8n Webhook"
    status: "connected" | "idle" | "testing"
    lastPingMs?: number
    apiKeyPreview: string
  }
}

export interface UserAuthProfile {
  isLoggedIn: boolean
  provider: "google" | "github" | "sovereign_key" | "guest"
  email: string
  name: string
  handle: string
  avatar: string
  role: string
  walletAddress: string
  mexBalance: number
}
