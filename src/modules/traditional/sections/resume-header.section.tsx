import type { Person } from '../../../data/profile.schema'
import { Card } from '../../../shared/ui/card'
import { Button } from '../../../shared/ui/button'

type ResumeHeaderSectionProps = {
  person: Person
  onToggleTheme: () => void
  onPrint: () => void
  themeLabel: string
}

export function ResumeHeaderSection({ person, onToggleTheme, onPrint, themeLabel }: ResumeHeaderSectionProps) {
  return (
    <section aria-labelledby="header-title" className="space-y-4">
      <Card className="print-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <img
              alt={person.avatarAlt}
              className="h-20 w-20 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              src="/favicon.svg"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{person.name}</h1>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">{person.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{person.location}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="ghost" onClick={onToggleTheme}>
              Tema: {themeLabel}
            </Button>
            <Button variant="secondary" onClick={onPrint}>
              Baixar PDF
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <a className="hover:underline" href={`mailto:${person.contact.email}`}>
            {person.contact.email}
          </a>
          <span>{person.contact.phone}</span>
          {person.contact.website ? (
            <a className="hover:underline" href={person.contact.website} rel="noreferrer" target="_blank">
              {person.contact.website}
            </a>
          ) : null}
          {person.contact.linkedin ? (
            <a className="hover:underline" href={person.contact.linkedin} rel="noreferrer" target="_blank">
              LinkedIn
            </a>
          ) : null}
          {person.contact.github ? (
            <a className="hover:underline" href={person.contact.github} rel="noreferrer" target="_blank">
              GitHub
            </a>
          ) : null}
        </div>
      </Card>
    </section>
  )
}
