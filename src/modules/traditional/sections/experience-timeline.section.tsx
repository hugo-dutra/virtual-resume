import { motion } from 'framer-motion'
import type { Experience } from '../../../data/experiences.schema'
import { Card } from '../../../shared/ui/card'
import { SectionTitle } from '../../../shared/components/section-title'

type ExperienceTimelineSectionProps = {
  experiences: Experience[]
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
}

export function ExperienceTimelineSection({ experiences }: ExperienceTimelineSectionProps) {
  return (
    <section aria-labelledby="experience-title" className="space-y-4">
      <SectionTitle
        title="Experiencias"
        subtitle="Linha do tempo com os principais resultados por empresa."
      />

      <motion.ol
        animate="visible"
        className="relative space-y-4 pl-7 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-slate-300 dark:before:bg-slate-600"
        initial="hidden"
        variants={container}
      >
        {experiences.map((experience) => (
          <motion.li key={experience.id} className="relative" variants={item}>
            <span className="absolute -left-[1.75rem] top-7 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-sky-100 dark:ring-sky-900/40" />

            <Card as="article" className="print-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.role}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{experience.company}</p>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{experience.period}</p>
              </div>

              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{experience.summary}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {experience.location}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {experience.tech.map((tech) => (
                  <span
                    key={`${experience.id}-${tech}`}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {experience.highlights.map((highlight) => (
                  <li key={`${experience.id}-${highlight}`}>{highlight}</li>
                ))}
              </ul>
            </Card>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
