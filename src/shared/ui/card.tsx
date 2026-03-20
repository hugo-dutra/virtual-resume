import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type CardElement = 'section' | 'article' | 'div'

type CardProps = {
  as?: CardElement
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLElement>

export function Card({ as = 'section', children, className, ...props }: CardProps) {
  const classes = cn(
    'rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70',
    className,
  )

  if (as === 'article') {
    return (
      <article className={classes} {...props}>
        {children}
      </article>
    )
  }

  if (as === 'div') {
    return (
      <div className={classes} {...props}>
        {children}
      </div>
    )
  }

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  )
}
