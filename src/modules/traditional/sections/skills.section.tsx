import type { SkillGroup } from '../../../data/profile.schema'
import { Card } from '../../../shared/ui/card'
import { SectionTitle } from '../../../shared/components/section-title'

type SkillsSectionProps = {
  skills: SkillGroup[]
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section aria-labelledby="skills-title" className="space-y-4">
      <SectionTitle title="Skills" subtitle="Competencies organized by technical area." />
      <div className="grid gap-4 md:grid-cols-3">
        {skills.map((group) => (
          <Card key={group.category} className="print-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              {group.category}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={`${group.category}-${item}`}
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
