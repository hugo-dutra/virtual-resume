import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16">
      <p className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Curriculo Virtual
      </p>
      <h1 className="text-center text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        Escolha como deseja explorar meu perfil
      </h1>
      <p className="max-w-2xl text-center text-base text-slate-600 sm:text-lg">
        Esta base da Fase 1 ja separa os dois modos do projeto e prepara a estrutura para evoluir o
        portfolio tradicional e a experiencia Adventure 3D.
      </p>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <Link
          className="rounded-xl border border-slate-300 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
          to="/traditional"
        >
          <h2 className="text-xl font-semibold text-slate-900">Modo Tradicional</h2>
          <p className="mt-2 text-sm text-slate-600">Curriculo classico com foco em leitura, SEO e impressao.</p>
        </Link>
        <Link
          className="rounded-xl border border-slate-300 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
          to="/adventure"
        >
          <h2 className="text-xl font-semibold text-slate-900">Modo Adventure</h2>
          <p className="mt-2 text-sm text-slate-600">Mapa interativo 3D com predios clicaveis e storytelling.</p>
        </Link>
      </div>
    </main>
  )
}
