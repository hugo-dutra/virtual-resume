import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  hue: number
}

const PARTICLE_COUNT = 26

export function AdventurePreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/60 bg-slate-900 shadow-2xl">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-72 w-full sm:h-80"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />
      <div className="absolute left-4 top-4 rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
        Adventure Preview
      </div>
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wide text-cyan-100">
        <span className="rounded-md border border-cyan-200/25 bg-slate-950/35 px-2 py-2">City Hub</span>
        <span className="rounded-md border border-cyan-200/25 bg-slate-950/35 px-2 py-2">Quest Nodes</span>
        <span className="rounded-md border border-cyan-200/25 bg-slate-950/35 px-2 py-2">XP Timeline</span>
      </div>
    </div>
  )
}
