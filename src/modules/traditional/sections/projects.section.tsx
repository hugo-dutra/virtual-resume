import type { Project } from '../../../data/profile.schema'
import { Card } from '../../../shared/ui/card'
import { SectionTitle } from '../../../shared/components/section-title'

type ProjectsSectionProps = {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section aria-labelledby="projects-title" className="space-y-4">
      <SectionTitle title="Highlighted Projects" subtitle="Projects with product and engineering impact." />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} as="article" className="print-card">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{project.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={`${project.id}-${tech}`}
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-sky-700 dark:text-sky-300 print:hidden">
              {project.link ? (
                <a href={project.link} rel="noreferrer" target="_blank">
                  View project
                </a>
              ) : null}
              {project.repo ? (
                <a href={project.repo} rel="noreferrer" target="_blank">
                  Repository
                </a>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
