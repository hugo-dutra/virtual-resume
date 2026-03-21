import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '../../../shared/utils/cn'

type ModeCardProps = {
  to: string
  title: string
  description: string
  tag: string
  portraitSrc?: string
  className?: string
  cardClassName?: string
}

export function ModeCard({ to, title, description, tag, portraitSrc, className, cardClassName }: ModeCardProps) {
  const [hasPortrait, setHasPortrait] = useState(Boolean(portraitSrc))

  useEffect(() => {
    setHasPortrait(Boolean(portraitSrc))
  }, [portraitSrc])

  return (
    <motion.div className={className} whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }}>
      <Link className="group block h-full" to={to}>
        <article
          className={cn(
            'relative h-full overflow-hidden rounded-2xl border border-sky-200/60 bg-slate-900 text-left shadow-2xl',
            'ring-1 ring-transparent transition-shadow duration-300 group-hover:ring-cyan-200/45',
            cardClassName,
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0b1734] via-[#0a1f3e] to-[#07162e]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(125,211,252,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.12)_1px,transparent_1px)] [background-size:28px_28px]"
          />

          <div className="absolute left-4 top-4 rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
            {tag}
          </div>

          {portraitSrc && hasPortrait ? (
            <div className="absolute right-4 top-4 h-40 w-40 overflow-hidden rounded-2xl border border-cyan-100/35 bg-slate-900/70 shadow-[0_0_20px_rgba(34,211,238,0.24)]">
              <img
                alt={`${title} mode preview portrait`}
                className="h-full w-full object-cover"
                src={portraitSrc}
                onError={() => setHasPortrait(false)}
              />
            </div>
          ) : null}

          <div className="absolute inset-x-4 bottom-4 rounded-xl border border-cyan-100/20 bg-slate-950/45 px-4 py-3 backdrop-blur-[2px]">
            <h3 className="text-2xl font-semibold text-cyan-50">{title}</h3>
            <p className="mt-2 text-sm text-cyan-100/85">{description}</p>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
