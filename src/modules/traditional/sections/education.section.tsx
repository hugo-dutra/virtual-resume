import type { Education } from '../../../data/profile.schema'
import { Card } from '../../../shared/ui/card'
import { SectionTitle } from '../../../shared/components/section-title'

type EducationSectionProps = {
  education: Education[]
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section aria-labelledby="education-title" className="space-y-4">
      <SectionTitle title="Education" subtitle="Academic background and specialization." />
      <div className="grid gap-4 md:grid-cols-2">
        {education.map((entry) => (
          <Card key={`${entry.institution}-${entry.degree}`} className="print-card">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{entry.degree}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{entry.institution}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{entry.period}</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{entry.details}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
