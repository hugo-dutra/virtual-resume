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
            className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
            variants={motionItem}
          >
            Portfolio Experience
          </motion.p>

          <motion.div variants={motionItem}>
            <SectionTitle
              title="Choose your navigation mode"
              subtitle="Now with entrance animation, adventure visual preview, and a structure ready to evolve into the full 3D map."
            />
          </motion.div>

          <motion.p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base" variants={motionItem}>
            Traditional mode prioritizes fast reading for recruiters. Adventure mode creates a memorable interactive
            journey with storytelling around your professional experience.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3" variants={motionItem}>
            <Button variant={audioEnabled ? 'secondary' : 'ghost'} onClick={toggleAudio}>
              Ambient audio: {audioEnabled ? 'on' : 'off'}
            </Button>
            <Button
              className="bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
              onClick={() => {
                const section = document.querySelector('[data-mode-grid]')
                section?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              View modes
            </Button>
          </motion.div>

          <motion.div className="grid gap-4 sm:grid-cols-2" data-mode-grid variants={motionItem}>
            <ModeCard
              to="/traditional"
              tag="Mode 01"
              title="Traditional"
              description="Classic resume mode focused on clarity, SEO, and print output."
            />
            <ModeCard
              to="/adventure"
              tag="Mode 02"
              title="Adventure"
              description="Interactive map with visual progression across professional experiences."
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
