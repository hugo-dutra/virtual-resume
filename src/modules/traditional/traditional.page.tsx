import { Link } from 'react-router-dom'
import { experiencesData } from '../../data/experiences'
import { profileData } from '../../data/profile'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useThemeClass } from '../../shared/hooks/use-theme-class'
import { useAppStore } from '../../shared/stores/use-app-store'
import { EducationSection } from './sections/education.section'
import { ExperienceTimelineSection } from './sections/experience-timeline.section'
import { ProfessionalSummarySection } from './sections/professional-summary.section'
import { ProjectsSection } from './sections/projects.section'
import { ResumeHeaderSection } from './sections/resume-header.section'
import { SkillsSection } from './sections/skills.section'

export function TraditionalPage() {
  useAppMode('traditional')
  useThemeClass()

  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)

  const handlePrint = () => {
    window.print()
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 print:max-w-none print:px-0 print:py-0">
      <header className="no-print flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Traditional Mode
        </p>
        <Link className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-300" to="/">
          Back
        </Link>
      </header>

      <ResumeHeaderSection
        person={profileData.person}
        onToggleTheme={toggleTheme}
        onPrint={handlePrint}
        themeLabel={theme === 'dark' ? 'dark' : 'light'}
      />

      <ProfessionalSummarySection person={profileData.person} />
      <ExperienceTimelineSection experiences={experiencesData.experiences} />
      <SkillsSection skills={profileData.skills} />
      <EducationSection education={profileData.education} />
      <ProjectsSection projects={profileData.projects} />

      <footer className="pt-2 text-xs text-slate-500 dark:text-slate-400 print:mt-6 print:text-slate-700">
        Updated on {profileData.updatedAt}
      </footer>
    </main>
  )
}
