import type { ReactNode } from 'react'

type SectionTitleProps = {
  title: string
  subtitle?: ReactNode
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
    </header>
  )
}
