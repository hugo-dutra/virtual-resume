import { Link } from 'react-router-dom'
import { Card } from '../../shared/ui/card'
import { SectionTitle } from '../../shared/components/section-title'
import { useAppMode } from '../../shared/hooks/use-app-mode'

export function LandingPage() {
  useAppMode('landing')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16">
      <p className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Curriculo Virtual
      </p>

      <SectionTitle
        subtitle="Base de Fase 2 com dados validados, componentes compartilhados e estado global."
        title="Escolha como deseja explorar meu perfil"
      />

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <Link to="/traditional">
          <Card className="h-full text-left hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-slate-900">Modo Tradicional</h3>
            <p className="mt-2 text-sm text-slate-600">Curriculo classico com foco em leitura, SEO e impressao.</p>
          </Card>
        </Link>

        <Link to="/adventure">
          <Card className="h-full text-left hover:-translate-y-1">
            <h3 className="text-xl font-semibold text-slate-900">Modo Adventure</h3>
            <p className="mt-2 text-sm text-slate-600">Mapa interativo 3D com predios clicaveis e storytelling.</p>
          </Card>
        </Link>
      </div>
    </main>
  )
}
