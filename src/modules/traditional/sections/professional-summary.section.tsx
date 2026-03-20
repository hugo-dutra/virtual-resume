import type { Person } from '../../../data/profile.schema'
import { Card } from '../../../shared/ui/card'
import { SectionTitle } from '../../../shared/components/section-title'

type ProfessionalSummarySectionProps = {
  person: Person
}

export function ProfessionalSummarySection({ person }: ProfessionalSummarySectionProps) {
  return (
    <section aria-labelledby="summary-title" className="space-y-4">
      <SectionTitle title="Resumo profissional" subtitle="Visao rapida do perfil e foco de atuacao." />
      <Card className="print-card">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{person.summary}</p>
      </Card>
    </section>
  )
}
