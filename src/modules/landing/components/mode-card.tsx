import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/card'

type ModeCardProps = {
  to: string
  title: string
  description: string
  tag: string
}

export function ModeCard({ to, title, description, tag }: ModeCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }}>
      <Link to={to}>
        <Card className="h-full border-slate-300 bg-white/85 text-left backdrop-blur" as="article">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{tag}</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </Card>
      </Link>
    </motion.div>
  )
}
