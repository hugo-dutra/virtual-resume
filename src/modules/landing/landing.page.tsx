import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { Button } from '../../shared/ui/button'
import { SectionTitle } from '../../shared/components/section-title'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useAppStore } from '../../shared/stores/use-app-store'
import { AdventurePreview } from './components/adventure-preview'
import { ModeCard } from './components/mode-card'

const motionContainer = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const motionItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export function LandingPage() {
  useAppMode('landing')

  const heroRef = useRef<HTMLElement | null>(null)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)

  useEffect(() => {
    if (!heroRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-gsap-badge]',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      )

      gsap.fromTo(
        '[data-gsap-glow]',
        { scale: 0.96, opacity: 0.5 },
        {
          scale: 1.06,
          opacity: 1,
          duration: 2.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        },
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(2,132,199,0.15),transparent_35%)]"
      />

      <motion.section
        ref={heroRef}
        animate="visible"
        className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
        initial="hidden"
        variants={motionContainer}
      >
        <div className="space-y-6">
          <motion.p
            data-gsap-badge
            className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700"
            variants={motionItem}
          >
            Portfolio Experience
          </motion.p>

          <motion.div variants={motionItem}>
            <SectionTitle
              title="Escolha seu modo de navegacao"
              subtitle="Agora com animacao de entrada, preview visual do Adventure e estrutura pronta para evoluir para o mapa 3D real."
            />
          </motion.div>

          <motion.p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base" variants={motionItem}>
            O modo Tradicional prioriza leitura rapida para recrutadores. O modo Adventure cria uma experiencia
            interativa memoravel com storytelling das experiencias profissionais.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3" variants={motionItem}>
            <Button variant={audioEnabled ? 'secondary' : 'ghost'} onClick={toggleAudio}>
              Audio ambiente: {audioEnabled ? 'ligado' : 'desligado'}
            </Button>
            <Button
              className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
              onClick={() => {
                const section = document.querySelector('[data-mode-grid]')
                section?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              Ver modos
            </Button>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            data-mode-grid
            variants={motionItem}
          >
            <ModeCard
              to="/traditional"
              tag="Modo 01"
              title="Tradicional"
              description="Curriculo classico com foco em clareza, SEO e impressao."
            />
            <ModeCard
              to="/adventure"
              tag="Modo 02"
              title="Adventure"
              description="Mapa interativo com progressao visual por experiencias."
            />
          </motion.div>
        </div>

        <motion.div className="relative" variants={motionItem}>
          <div
            data-gsap-glow
            className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-r from-cyan-300/30 via-sky-300/30 to-blue-300/30 blur-2xl"
          />
          <AdventurePreview />
        </motion.div>
      </motion.section>
    </main>
  )
}
