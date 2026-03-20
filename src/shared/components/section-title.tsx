import type { ReactNode } from 'react'

type SectionTitleProps = {
  title: string
  subtitle?: ReactNode
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
    </header>
  )
}
