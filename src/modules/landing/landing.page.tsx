import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { Button } from '../../shared/ui/button'
import { SectionTitle } from '../../shared/components/section-title'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useIsMobileDevice } from '../../shared/hooks/use-is-mobile-device'
import { useAppStore } from '../../shared/stores/use-app-store'
import { resolvePublicAssetPath } from '../../shared/utils/resolve-public-asset-path'
import { useAdventureAudio } from '../adventure/hooks/use-adventure-audio'
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

const HERO_PHOTO_CANDIDATES = [
  resolvePublicAssetPath('/assets/profile/hero-photo.avif'),
  resolvePublicAssetPath('/assets/profile/hero-photo.webp'),
  resolvePublicAssetPath('/assets/profile/hero-photo.jpg'),
  resolvePublicAssetPath('/assets/profile/hero-photo.png'),
] as const

const MODE_02_PORTRAIT = resolvePublicAssetPath('/assets/profile/hero-happy.png')
const MODE_01_PORTRAIT = resolvePublicAssetPath('/assets/profile/hero-bored.png')
const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/hugo-d-71398988/'

export function LandingPage() {
  useAppMode('landing')
  const isMobileDevice = useIsMobileDevice()

  const heroRef = useRef<HTMLElement | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [hasPhoto, setHasPhoto] = useState(true)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)
  useAdventureAudio(audioEnabled)

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

  const handlePhotoError = () => {
    setPhotoIndex((currentIndex) => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= HERO_PHOTO_CANDIDATES.length) {
        setHasPhoto(false)
        return currentIndex
      }

      return nextIndex
    })
  }

  return (
    <main className="relative isolate mx-auto flex min-h-screen w-full max-w-6xl items-start px-6 py-6 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(2,132,199,0.15),transparent_35%)]"
      />

      <motion.section
        ref={heroRef}
        animate="visible"
        className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"
        initial="hidden"
        variants={motionContainer}
      >
        <div className="space-y-6">
          <motion.div className="w-fit" variants={motionItem}>
            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-sky-300/70 bg-slate-100/85 shadow-lg dark:border-sky-700/70 dark:bg-slate-900/75">
              {hasPhoto ? (
                <img
                  alt="Profile photo"
                  className="absolute inset-0 h-full w-full object-cover"
                  src={HERO_PHOTO_CANDIDATES[photoIndex]}
                  onError={handlePhotoError}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-200/40 via-cyan-100/20 to-blue-200/40 dark:from-sky-800/30 dark:via-cyan-900/20 dark:to-blue-900/25" />
              <div className="absolute inset-3 rounded-xl border border-dashed border-sky-400/70 dark:border-sky-500/60" />
              {!hasPhoto ? (
                <>
                  <p className="absolute left-4 top-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                    Photo Space
                  </p>
                  <p className="absolute bottom-4 left-4 max-w-[8.75rem] text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Add a hero photo in /public/assets/profile.
                  </p>
                </>
              ) : null}
            </div>
          </motion.div>

          <motion.div className="flex w-fit items-center gap-2" data-gsap-badge variants={motionItem}>
            <p className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
              <span>Portfolio Experience</span>
              <span className="mx-1 text-sky-500/80 dark:text-sky-300/80">-</span>
              <span className="normal-case tracking-normal">Hugo Alves Dutra</span>
            </p>
            <a
              aria-label="Open Hugo Alves Dutra LinkedIn"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-300 bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200 dark:hover:bg-sky-900/65"
              href={LINKEDIN_PROFILE_URL}
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="14"
                viewBox="0 0 24 24"
                width="14"
              >
                <path d="M19 3A2.997 2.997 0 0 1 22 6v12a2.997 2.997 0 0 1-3 3H5a2.997 2.997 0 0 1-3-3V6a2.997 2.997 0 0 1 3-3h14Zm-.5 14.5V13c0-2.485-1.542-3.5-3.143-3.5-1.41 0-2.148.775-2.517 1.32V9h-2.7v8.5h2.7v-4.25c0-1.12.213-2.2 1.6-2.2 1.367 0 1.387 1.28 1.387 2.272V17.5h2.673ZM7 7.846a1.56 1.56 0 1 0 0-3.12 1.56 1.56 0 0 0 0 3.12Zm1.35 9.654V9H5.65v8.5h2.7Z" />
              </svg>
            </a>
          </motion.div>

          <motion.div variants={motionItem}>
            <SectionTitle
              title="Choose your navigation mode"
              subtitle="Explore the same resume in two different experiences, depending on your reading style."
            />
          </motion.div>

          <motion.div className="max-w-xl space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base" variants={motionItem}>
            <p>
              This is an interactive virtual resume where you can choose between two navigation modes:
            </p>
            <p>
              <strong>Traditional</strong> - fast and objective reading, ideal for recruiters.
            </p>
            <p>
              <strong>Fun (Adventure)</strong> - an interactive 3D map with storytelling and a gamified visualization
              of your professional journey.
            </p>
          </motion.div>

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

        </div>

        <motion.div className="w-full lg:justify-self-end" data-mode-grid variants={motionItem}>
          <div className="flex w-full flex-col gap-4 lg:items-end">
            <ModeCard
              to="/traditional"
              className="w-full max-w-[25rem]"
              tag="Mode 01"
              title="Traditional"
              description="Classic resume mode focused on clarity, SEO, and print output."
              portraitSrc={MODE_01_PORTRAIT}
              cardClassName="min-h-[320px]"
            />

            <div className="relative w-full max-w-[25rem]">
              <div
                data-gsap-glow
                className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-r from-cyan-300/30 via-sky-300/30 to-blue-300/30 blur-2xl"
              />
              <AdventurePreview
                to="/adventure"
                tag="Mode 02"
                title="Adventure"
                description="Interactive map with visual progression across professional experiences."
                portraitSrc={MODE_02_PORTRAIT}
                disabled={isMobileDevice}
                disabledMessage="Available only on desktop"
              />
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  )
}
