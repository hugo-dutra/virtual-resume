import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/card'
import { cn } from '../../../shared/utils/cn'

type ModeCardProps = {
  to: string
  title: string
  description: string
  tag: string
  className?: string
  cardClassName?: string
}

export function ModeCard({ to, title, description, tag, className, cardClassName }: ModeCardProps) {
  return (
    <motion.div className={className} whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }}>
      <Link className="block h-full" to={to}>
        <Card
          className={cn(
            'h-full border-slate-300 bg-white/85 text-left backdrop-blur dark:border-slate-700 dark:bg-slate-900/75',
            cardClassName,
          )}
          as="article"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">{tag}</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </Card>
      </Link>
    </motion.div>
  )
}
