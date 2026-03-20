import { useEffect, useRef } from 'react'
import { Howl } from 'howler'

const AMBIENT_AUDIO_SRC = '/assets/audio/adventure-ambient.wav'

export function useAdventureAudio(audioEnabled: boolean) {
  const soundRef = useRef<Howl | null>(null)
  const stopTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const sound = new Howl({
      src: [AMBIENT_AUDIO_SRC],
      loop: true,
      preload: true,
      volume: 0,
    })

    soundRef.current = sound

    return () => {
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current)
        stopTimeoutRef.current = null
      }

      sound.stop()
      sound.unload()
      soundRef.current = null
    }
  }, [])

  useEffect(() => {
    const sound = soundRef.current
    if (!sound) {
      return
    }

    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }

    if (audioEnabled) {
      if (!sound.playing()) {
        sound.play()
      }

      sound.fade(sound.volume(), 0.35, 700)
      return
    }

    if (!sound.playing()) {
      return
    }

    sound.fade(sound.volume(), 0, 450)
    stopTimeoutRef.current = window.setTimeout(() => {
      sound.pause()
      sound.seek(0)
    }, 500)
  }, [audioEnabled])

  useEffect(() => {
    const handleVisibilityChange = () => {
      const sound = soundRef.current
      if (!sound) {
        return
      }

      if (document.hidden) {
        if (sound.playing()) {
          sound.pause()
        }
        return
      }

      if (audioEnabled) {
        if (!sound.playing()) {
          sound.play()
        }

        sound.fade(sound.volume(), 0.35, 400)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [audioEnabled])
}
