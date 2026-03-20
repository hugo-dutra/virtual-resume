import { Link } from 'react-router-dom'

export function TraditionalPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-slate-900">Curriculo Tradicional</h1>
        <Link className="text-sm font-medium text-sky-700 hover:underline" to="/">
          Voltar
        </Link>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-700">
          Estrutura base pronta para receber resumo, experiencias, habilidades, educacao e projetos.
        </p>
      </section>
    </main>
  )
}
