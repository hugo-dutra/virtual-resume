import { useEffect, useState } from 'react'

const MOBILE_USER_AGENT_PATTERN = /android|iphone|ipad|ipod|mobile/i

function detectMobileDevice() {
  if (typeof window === 'undefined') {
    return false
  }

  const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
  const anyCoarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
  const smallViewportQuery = window.matchMedia('(max-width: 1024px)')
  const hasTouchApi = window.navigator.maxTouchPoints > 0
  const hasCoarsePointer = touchQuery.matches || anyCoarsePointerQuery.matches
  const hasMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(window.navigator.userAgent)
  const hasSmallViewport = smallViewportQuery.matches

  return hasCoarsePointer || hasMobileUserAgent || (hasTouchApi && hasSmallViewport)
}

export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(() => detectMobileDevice())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const anyCoarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
    const smallViewportQuery = window.matchMedia('(max-width: 1024px)')

    const updateDetection = () => {
      setIsMobileDevice(detectMobileDevice())
    }

    updateDetection()

    if (
      typeof touchQuery.addEventListener === 'function' &&
      typeof anyCoarsePointerQuery.addEventListener === 'function' &&
      typeof smallViewportQuery.addEventListener === 'function'
    ) {
      touchQuery.addEventListener('change', updateDetection)
      anyCoarsePointerQuery.addEventListener('change', updateDetection)
      smallViewportQuery.addEventListener('change', updateDetection)
      window.addEventListener('resize', updateDetection)
      window.addEventListener('orientationchange', updateDetection)

      return () => {
        touchQuery.removeEventListener('change', updateDetection)
        anyCoarsePointerQuery.removeEventListener('change', updateDetection)
        smallViewportQuery.removeEventListener('change', updateDetection)
        window.removeEventListener('resize', updateDetection)
        window.removeEventListener('orientationchange', updateDetection)
      }
    }

    touchQuery.addListener(updateDetection)
    anyCoarsePointerQuery.addListener(updateDetection)
    smallViewportQuery.addListener(updateDetection)
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)

    return () => {
      touchQuery.removeListener(updateDetection)
      anyCoarsePointerQuery.removeListener(updateDetection)
      smallViewportQuery.removeListener(updateDetection)
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return isMobileDevice
}
