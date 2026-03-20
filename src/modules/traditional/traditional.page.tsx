import { Link } from 'react-router-dom'
import { experiencesData } from '../../data/experiences'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { Card } from '../../shared/ui/card'
import { SectionTitle } from '../../shared/components/section-title'

export function TraditionalPage() {
  useAppMode('traditional')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-slate-900">Curriculo Tradicional</h1>
        <Link className="text-sm font-medium text-sky-700 hover:underline" to="/">
          Voltar
        </Link>
      </header>

      <SectionTitle
        subtitle={`Ultima atualizacao: ${experiencesData.updatedAt}`}
        title="Experiencias Profissionais"
      />

      <div className="grid gap-4">
        {experiencesData.experiences.map((experience) => (
          <Card key={experience.id} as="article">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{experience.role}</h2>
                <p className="text-sm text-slate-600">{experience.company}</p>
              </div>
              <p className="text-sm text-slate-500">{experience.period}</p>
            </div>

            <p className="mt-3 text-sm text-slate-700">{experience.summary}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">{experience.location}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {experience.tech.map((tech) => (
                <span
                  key={`${experience.id}-${tech}`}
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
