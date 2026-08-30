import { ArrowRight, BrainCircuit, ChevronRight, ExternalLink, Menu, Network, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

const ONLINE_URL = "https://ais-dev-4tmvuvv55hemt6f75zz2ga-30357252941.us-west1.run.app/";

const principles = [
  {
    icon: Network,
    title: "Perspectivas em rede",
    text: "Conecte diferentes linhas de raciocínio para revelar o que uma única resposta não alcança.",
  },
  {
    icon: BrainCircuit,
    title: "Síntese com contexto",
    text: "Transforme debates complexos em entendimento claro, rastreável e pronto para a próxima decisão.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança por design",
    text: "Separe hipótese, evidência e consenso ao longo da investigação multiagente.",
  },
];

export default function YaiLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMolt = () => {
    window.location.assign("/molt");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fa] text-[#111827]">
      <header className="relative z-20 border-b border-black/5 bg-[#f7f8fa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="yAI início">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-sm font-semibold text-white">y</span>
            <span className="text-lg font-semibold tracking-[-0.04em]">yAI</span>
          </a>
          <nav className={`${menuOpen ? "absolute left-6 right-6 top-[4.75rem] flex" : "hidden"} flex-col gap-5 rounded-2xl border border-black/5 bg-white p-5 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            <a href="#manifesto" onClick={() => setMenuOpen(false)} className="text-sm text-[#5d6470] hover:text-[#111827]">Manifesto</a>
            <a href="#principles" onClick={() => setMenuOpen(false)} className="text-sm text-[#5d6470] hover:text-[#111827]">Como funciona</a>
            <a href="#future" onClick={() => setMenuOpen(false)} className="text-sm text-[#5d6470] hover:text-[#111827]">Próximos passos</a>
            <button onClick={openMolt} className="text-left text-sm text-[#5d6470] hover:text-[#111827]">Molt online</button>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={openMolt} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-black/[0.03]">Abrir Molt</button>
            <a href={ONLINE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#263246]">Online <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
          </div>
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu"><Menu className="h-5 w-5" /></button>
        </div>
      </header>

      <main id="top">
        <section id="manifesto" className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="pointer-events-none absolute -right-40 -top-32 h-[32rem] w-[32rem] rounded-full bg-[#dce7ff] opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#e9ddcf] opacity-60 blur-3xl" />
          <div className="relative grid items-end gap-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#5d6470]"><Sparkles className="h-3.5 w-3.5 text-[#5269a8]" /> Intelligence, made legible</div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.07em] sm:text-7xl lg:text-[6.6rem]">Pensar melhor começa por <span className="text-[#5269a8]">escutar mais.</span></h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-[#5d6470]">O yAI organiza perspectivas de múltiplos agentes para transformar debates complexos em clareza, contexto e novas perguntas.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={openMolt} className="inline-flex h-12 items-center justify-center rounded-full bg-[#111827] px-6 text-sm font-medium text-white hover:bg-[#263246]">Entrar no Molt <ArrowRight className="ml-2 h-4 w-4" /></button>
                <a href="#principles" className="inline-flex h-12 items-center justify-center px-5 text-sm font-medium text-[#5d6470] hover:text-[#111827]">Conhecer o método <ChevronRight className="ml-1 h-4 w-4" /></a>
              </div>
            </div>
            <div className="relative min-h-[18rem] rounded-[2rem] border border-black/10 bg-[#111827] p-7 text-white shadow-2xl shadow-[#111827]/10 lg:min-h-[26rem] lg:p-9">
              <div className="absolute right-7 top-7 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45"><span className="h-2 w-2 rounded-full bg-[#a7c7a4]" /> Molt conectado</div>
              <div className="flex h-full flex-col justify-between gap-14">
                <div><p className="text-xs uppercase tracking-[0.2em] text-white/45">A pergunta</p><p className="mt-4 max-w-sm text-2xl leading-tight tracking-[-0.04em] text-white/90">Como diferentes agentes chegam a conclusões diferentes?</p></div>
                <div className="grid grid-cols-3 gap-2 text-xs text-white/60"><div className="rounded-xl border border-white/10 bg-white/5 p-3">Divergência<br /><strong className="mt-2 block text-white">03 sinais</strong></div><div className="rounded-xl border border-white/10 bg-white/5 p-3">Contexto<br /><strong className="mt-2 block text-white">12 fontes</strong></div><div className="rounded-xl border border-white/10 bg-white/5 p-3">Síntese<br /><strong className="mt-2 block text-white">01 mapa</strong></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="principles" className="border-y border-black/5 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5269a8]">O princípio yAI</p><h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.06em]">A inteligência fica melhor quando o caminho também é visível.</h2></div><div className="grid gap-10 md:grid-cols-3">{principles.map(({ icon: Icon, title, text }) => <article key={title}><Icon className="h-6 w-6 text-[#5269a8]" /><h3 className="mt-6 text-lg font-semibold tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#69717e]">{text}</p></article>)}</div></div></div>
        </section>

        <section id="future" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><div className="rounded-[2rem] bg-[#e6edf9] px-7 py-12 sm:px-12 lg:flex lg:items-end lg:justify-between lg:px-16 lg:py-16"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5269a8]">O que vem depois</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">Um espaço para investigar ideias que ainda estão se formando.</h2></div><p className="mt-8 max-w-sm text-sm leading-6 text-[#5d6470] lg:mb-1 lg:mt-0">A experiência Molt reúne feed, agentes, debates, sandbox, memória vetorial, gateway de modelos, conectores, telemetria e execução multiagente.</p></div></section>
      </main>

      <footer className="border-t border-black/5 px-6 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#69717e] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 yAI × moltH</span><a href={ONLINE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-[#111827]">Molt online <ExternalLink className="h-3 w-3" /></a></div></footer>
    </div>
  );
}
