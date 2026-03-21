import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '../../../shared/utils/cn'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  hue: number
}

const PARTICLE_COUNT = 26

type AdventurePreviewProps = {
  to: string
  title: string
  description: string
  tag: string
  portraitSrc?: string
  className?: string
}

export function AdventurePreview({ to, title, description, tag, portraitSrc, className }: AdventurePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hasPortrait, setHasPortrait] = useState(Boolean(portraitSrc))

  useEffect(() => {
    setHasPortrait(Boolean(portraitSrc))
  }, [portraitSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    let width = 0
    let height = 0
    let animationFrame = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      radius: 1.5 + Math.random() * 2.6,
      hue: 190 + Math.random() * 40,
    }))

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawGrid = () => {
      const step = 30
      context.strokeStyle = 'rgba(148, 163, 184, 0.18)'
      context.lineWidth = 1

      for (let x = 0; x < width; x += step) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, height)
        context.stroke()
      }

      for (let y = 0; y < height; y += step) {
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(width, y)
        context.stroke()
      }
    }

    const render = () => {
      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#0b2942')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)

      drawGrid()

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x <= 0 || particle.x >= 1) {
          particle.vx *= -1
        }

        if (particle.y <= 0 || particle.y >= 1) {
          particle.vy *= -1
        }

        const px = particle.x * width
        const py = particle.y * height

        context.beginPath()
        context.fillStyle = `hsla(${particle.hue}, 100%, 70%, 0.9)`
        context.shadowColor = `hsla(${particle.hue}, 100%, 70%, 0.65)`
        context.shadowBlur = 10
        context.arc(px, py, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      context.shadowBlur = 0
      animationFrame = window.requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrame = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <motion.div className={className} whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }}>
      <Link className="group block h-full" to={to}>
        <article
          className={cn(
            'relative h-full overflow-hidden rounded-2xl border border-sky-200/60 bg-slate-900 shadow-2xl',
            'ring-1 ring-transparent transition-shadow duration-300 group-hover:ring-cyan-200/45',
          )}
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="block h-full min-h-[320px] w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
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
