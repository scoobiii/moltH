import { useEffect, useState } from 'react'

type Sprint = { id: string; name: string; status: string; progress: number }
type StatusData = { project: string; repo: string; runtime_id: string; sprints: Sprint[]; last_sync: string; ga_page_url: string }

export default function SprintsStatus() {
  const [data, setData] = useState<StatusData | null>(null)
  useEffect(() => {
    fetch('/molt-connector/sprints/status.json').then(r=>r.json()).then(setData).catch(()=>{})
  }, [])
  if (!data) return <div className="p-3 text-xs opacity-50 animate-pulse">🔄 Carregando sprints GOS3 {`runtime 427273fd`}...</div>
  const done = data.sprints.filter(s=>s.status.includes('CONCLUÍDO')).length
  const geral = Math.round((done/data.sprints.length)*100)
  return (
    <div className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 my-6">
      <div className="flex justify-between mb-3">
        <h2 className="font-bold text-sm">🚀 {data.project} · {data.runtime_id} · {data.sprints.length} sprints</h2>
        <span className="text-xs px-2 py-1 bg-emerald-900/40 rounded-full border border-emerald-700/30">{geral}% GERAL</span>
      </div>
      <div className="w-full bg-zinc-800 h-2 rounded-full mb-4 overflow-hidden">
        <div className="h-2 bg-emerald-400" style={{width:`${geral}%`}} />
      </div>
      <div className="grid gap-2">
        {data.sprints.map(s=>(
          <div key={s.id} className="flex justify-between items-center p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
            <div><div className="font-mono text-[10px] opacity-50">{s.id}</div><div className="text-xs font-medium">{s.name}</div></div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-zinc-700 h-1.5 rounded-full overflow-hidden"><div className={`h-1.5 ${s.progress===100?'bg-emerald-400':'bg-yellow-400'}`} style={{width:`${s.progress}%`}} /></div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${s.status.includes('CONCLUÍDO')?'bg-emerald-500/20 text-emerald-300':'bg-yellow-500/20 text-yellow-300'}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[9px] opacity-30 font-mono">repo: {data.repo} · last_sync: {data.last_sync} · 🌐 {data.ga_page_url} · 17 envelopes valid:true</div>
    </div>
  )
}
