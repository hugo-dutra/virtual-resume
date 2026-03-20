import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type CardProps<T extends ElementType> = {
  as?: T
  children: ReactNode
  className?: string
} & Omit<HTMLAttributes<HTMLElement>, 'className'>

export function Card<T extends ElementType = 'section'>({
  as,
  children,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? 'section'

  return (
    <Component
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
