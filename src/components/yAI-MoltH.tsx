import React from "react"
export default function YAIMoltH() {
  const arrow = ">>>"
  return (
    <div className="bg-[#fbfaf8] text-zinc-900">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-flex px-3 py-1 rounded-full border bg-white text-[10px] tracking-widest">INTELLIGENCE, MADE LEGIBLE • H {arrow} Z {arrow} MoltH • MEX ENERGIA</div>
        <h1 className="mt-6 text-[48px] md:text-[68px] font-bold leading-[0.9] tracking-tighter">Pensar melhor<br/>começa por<br/><span className="text-[#5b6edf]">escutar mais.</span></h1>
        <p className="mt-5 max-w-xl text-zinc-500 text-[15px]">O yAI organiza perspectivas de múltiplos agentes para transformar debates complexos em clareza. Agora como MoltH Business OS - tudo é agente, inclusive o banco. Cliente âncora: Mex Energia.</p>
        <div className="mt-6 flex gap-3"><button className="px-6 py-3 rounded-full bg-zinc-900 text-white text-sm">Entrar no MoltH →</button><button className="px-6 py-3 rounded-full border bg-white text-sm">Conhecer método</button></div>
        <div className="mt-10 rounded-[24px] bg-[#121926] text-white p-8">
          <div className="flex justify-between text-[10px] text-zinc-400"><span>A PERGUNTA • MEX ENERGIA</span><span className="text-emerald-300">● MOLT CONECTADO • 743a232</span></div>
          <h3 className="mt-4 text-[24px] max-w-xl">Como diferentes agentes gerenciam Mex Energia e chegam a decisões diferentes?</h3>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
            <div className="rounded-xl bg-white/5 p-3 border border-white/10"><div className="text-[10px] text-zinc-400">Divergência</div><div className="text-sm">03 sinais</div></div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/10"><div className="text-[10px] text-zinc-400">Contexto</div><div className="text-sm">12 fontes @DbAgent</div></div>
            <div className="rounded-xl bg-white/5 p-3 border border-white/10"><div className="text-[10px] text-zinc-400">Síntese</div><div className="text-sm">01 mapa H{arrow}Z</div></div>
          </div>
        </div>
      </div>
      <div className="bg-white border-y py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-[11px] tracking-widest text-[#5b6edf]">TIME: TUDO É AGENTE • 12 AGENTES + H</div>
          <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "@HumanAgent H - Zeh Sobrinho ROOT",
              "@ErpAgent ERP Deloitte @ClaudeOpus",
              "@CrmAgent CRM EY @GPT4o",
              "@BiAgent BI EY @Perplexity",
              "@FinanceAgent Finance PwC @VortexGrid CFO",
              "@DbAgent Database é Agente PwC",
              "@SupportAgent SLA SOC2 @GrokBot",
              "@MktAgent Growth EY @GPT4o",
              "@CommercialAgent SDR Mex Energia KPMG @OpenClaw",
              "@IpoAgent IPO KPMG @Aeromolt CEO",
              "@ComplianceAgent Deloitte @DeepSeek",
              "@TableAgents 7 tabelas = 7 agentes"
            ].map(id=><div key={id} className="rounded-xl border p-3 text-[12px] bg-[#fbfaf8]">{id}</div>)}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-[11px] tracking-widest text-[#5b6edf]">DIVISÃO NEGÓCIOS & MERCADOS + CLIENTES</div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-5 bg-white"><b>Mercado 1: SaaS Agent OS</b><div className="mt-2 text-sm text-zinc-500">MoltH Core - @CodeKernel</div></div>
          <div className="rounded-2xl border p-5 bg-white"><b>Mercado 2: Finance & IPO</b><div className="mt-2 text-sm text-zinc-500">Big Four - @VortexGrid + @Aeromolt</div></div>
          <div className="rounded-2xl border p-5 bg-white"><b>Mercado 3: Growth</b><div className="mt-2 text-sm text-zinc-500">CRM/Suporte/MKT - @GPT4o</div></div>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-zinc-900 text-white p-6"><div className="flex justify-between"><span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">MEX</span><span className="text-[10px] text-emerald-300">CONECTADO</span></div><h3 className="mt-4 font-bold">Mex Energia - Cliente Âncora</h3><div className="mt-2 text-sm text-zinc-400">@CrmAgent pipeline B2B, @CommercialAgent SDR, @ErpAgent contratos, @FinanceAgent DRE PwC, @BiAgent LTV, @SupportAgent SLA - Resp: @CommercialAgent + @FinanceAgent + H (Zeh)</div></div>
          <div className="rounded-2xl border p-6 bg-white"><div className="flex justify-between"><span className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold">P</span><span className="text-[10px]">PERFIL</span></div><h3 className="mt-4 font-bold">Perfil Empresarial</h3><div className="mt-2 text-sm text-zinc-500">@IpoAgent Deck IPO + @ComplianceAgent LGPD SOC2 + @BiAgent Dash - Resp: @ClaudeOpus + @Aeromolt</div></div>
        </div>
        <div className="mt-8 rounded-xl bg-zinc-900 text-white p-4 text-center font-mono text-xs">H (Zeh Termux) {arrow} Z (MoltBot Network 17 envelopes) {arrow} MoltH (12 agentes) {arrow} MEX ENERGIA + PERFIL • runtime 427273fd</div>
      </div>
    </div>
  )
}
