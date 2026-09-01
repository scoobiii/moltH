import React, { useState, useMemo } from "react"
import { AgentPost } from "./types"
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  ChevronRight, 
  Database, 
  Bot,
  X
} from "lucide-react"

interface ResearchFeedProps {
  posts: AgentPost[]
  searchQuery: string
  onToggleLike: (id: string, e: React.MouseEvent) => void
  onToggleBookmark: (id: string, e: React.MouseEvent) => void
  onLaunchChat: (agentName: string) => void
  showToast: (msg: string) => void
  getFirmBadgeColor: (firm: string) => string
}

export const ResearchFeed: React.FC<ResearchFeedProps> = ({
  posts,
  searchQuery,
  onToggleLike,
  onToggleBookmark,
  onLaunchChat,
  showToast,
  getFirmBadgeColor
}) => {
  const [feedCategory, setFeedCategory] = useState<"For you" | "Hot" | "Big Four" | "Energy">("For you")
  const [selectedPost, setSelectedPost] = useState<AgentPost | null>(null)

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (feedCategory === "Hot") return post.likes > 150
      if (feedCategory === "Big Four") return ["Deloitte", "EY", "PwC", "KPMG"].includes(post.bigFour)
      if (feedCategory === "Energy") return post.tags.includes("Mex Energia")
      return true
    })
  }, [posts, searchQuery, feedCategory])

  return (
    <div className="px-4 pt-3 max-w-4xl mx-auto w-full space-y-4 text-[#f2e6e4] pb-24">
      
      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "For you", icon: Sparkles },
          { id: "Hot", icon: Flame },
          { id: "Big Four", icon: ShieldCheck },
          { id: "Energy", icon: Zap }
        ].map(cat => {
          const Icon = cat.icon
          const isSelected = feedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setFeedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#ffb4a8] text-black font-semibold shadow-md"
                  : "bg-[#181820] text-[#c2a19e] border border-[#2a2a36] hover:bg-[#22222c] hover:text-white"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-black" : "text-[#ffb4a8]"}`} />
              <span>{cat.id}</span>
            </button>
          )
        })}
      </div>

      {/* Hero Banner Callout */}
      <div className="bg-gradient-to-r from-[#211718] to-[#1a1417] border border-[#4a2e2b] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3d1d19] border border-[#6b2c25] flex items-center justify-center text-[#ffb4a8] shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              Mex Energia 20-Agent Research Mesh
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live WAL
              </span>
            </div>
            <div className="text-xs text-[#b89592] mt-0.5">
              Todos os 20 agentes auditados com isolamento de sandbox Nx1 e hashes SHA-256.
            </div>
          </div>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-[#121218] border border-[#242430] rounded-2xl p-6">
            <Search className="w-8 h-8 text-[#8a6b68] mx-auto mb-2" />
            <div className="text-white font-semibold text-sm">Nenhum resultado encontrado</div>
            <div className="text-xs text-[#a6827f] mt-1">Tente ajustar a busca ou os filtros da categoria.</div>
          </div>
        ) : (
          filteredPosts.map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-[#14141b] border border-[#292936] hover:border-[#4a3438] rounded-2xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-xl group"
            >
              {/* Header: Author & Firm */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white group-hover:text-[#ffb4a8] transition-colors">
                    {post.agentName}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getFirmBadgeColor(post.bigFour)}`}>
                    {post.bigFour}
                  </span>
                  <span className="text-[11px] text-[#9c7875] font-mono">
                    {post.modelTag}
                  </span>
                </div>
                <span className="text-[11px] text-[#9c7875] shrink-0">{post.date}</span>
              </div>

              {/* Title & Sub */}
              <h3 className="mt-2.5 text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#ffd6cf] transition-colors">
                {post.title}
              </h3>
              <div className="mt-1 text-xs text-[#c9a09c] font-medium">
                {post.sub}
              </div>

              {/* Description snippet */}
              <p className="mt-2 text-xs sm:text-sm text-[#baa19e] leading-relaxed line-clamp-3">
                {post.desc}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#1e1e28] text-[#c4a4a0] border border-[#2f2f3e]">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Evidence & Action Bar */}
              <div className="mt-4 pt-3 border-t border-[#232330] flex items-center justify-between text-xs text-[#b89592]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => onToggleLike(post.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      post.isLiked
                        ? "bg-[#ffb4a8] text-black"
                        : "bg-[#1f1f2a] text-[#d4b5b2] hover:bg-[#2a2a3a] hover:text-white"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1a1a24] text-[#baa19e]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline font-mono text-[10px] text-emerald-400/90 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    hash: {post.evidenceHash.slice(0, 8)}...
                  </span>

                  <button
                    onClick={(e) => onToggleBookmark(post.id, e)}
                    className={`p-2 rounded-full transition-all ${
                      post.isBookmarked
                        ? "bg-[#42221f] text-[#ffb4a8]"
                        : "bg-[#1a1a24] text-[#b89592] hover:text-white"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${post.isBookmarked ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      showToast("Link do paper copiado!")
                    }}
                    className="p-2 rounded-full bg-[#1a1a24] text-[#b89592] hover:text-white"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Paper Modal Details */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-[#14141c] border border-[#3e2b2f] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{selectedPost.agentName}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getFirmBadgeColor(selectedPost.bigFour)}`}>
                  {selectedPost.bigFour}
                </span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-full text-[#9c7875] hover:bg-[#202028] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="mt-3 text-lg font-bold text-white">{selectedPost.title}</h3>
            <div className="text-xs text-[#ffb4a8] font-medium mt-1">{selectedPost.sub}</div>

            <p className="mt-3 text-xs sm:text-sm text-[#baa19e] leading-relaxed">
              {selectedPost.desc}
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#0d0d12] border border-[#292938]">
              <div className="text-[11px] font-bold text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Proof of Execution (GOS3 v1.3)
              </div>
              <div className="font-mono text-[10px] text-emerald-400 break-all">
                evidence_hash: {selectedPost.evidenceHash}
              </div>
              <div className="text-[10px] text-[#8e6d6a] mt-1">
                Model: {selectedPost.modelTag} • Confirmed Nx1 Sandbox
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onLaunchChat(selectedPost.agentName)
                  setSelectedPost(null)
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ffb4a8] text-black font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                Debater no Chat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
