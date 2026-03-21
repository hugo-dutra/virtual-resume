import { useEffect, useState } from 'react'

const MOBILE_USER_AGENT_PATTERN = /android|iphone|ipad|ipod|mobile/i
const DESKTOP_PLATFORM_PATTERN = /windows nt|macintosh|linux x86_64|cros/i

type NavigatorLike = Navigator & {
  userAgentData?: {
    mobile?: boolean
  }
}

function detectMobileDevice() {
  if (typeof window === 'undefined') {
    return false
  }

  const navigatorLike = window.navigator as NavigatorLike
  const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
  const anyCoarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
  const anyFinePointerQuery = window.matchMedia('(any-pointer: fine)')
  const anyHoverQuery = window.matchMedia('(any-hover: hover)')
  const hoverQuery = window.matchMedia('(hover: hover)')
  const smallViewportQuery = window.matchMedia('(max-width: 1024px)')
  const hasTouchApi = navigatorLike.maxTouchPoints > 0
  const hasCoarsePointer = touchQuery.matches || anyCoarsePointerQuery.matches
  const hasFinePointer = anyFinePointerQuery.matches
  const hasHoverCapability = anyHoverQuery.matches || hoverQuery.matches
  const hasMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(navigatorLike.userAgent)
  const hasDesktopPlatform = DESKTOP_PLATFORM_PATTERN.test(navigatorLike.userAgent)
  const reportsMobileByUAData = Boolean(navigatorLike.userAgentData?.mobile)
  const hasSmallViewport = smallViewportQuery.matches

  if (hasDesktopPlatform && hasFinePointer && hasHoverCapability) {
    return false
  }

  return reportsMobileByUAData || hasMobileUserAgent || (hasSmallViewport && (hasCoarsePointer || hasTouchApi))
}

export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(() => detectMobileDevice())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const anyCoarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
    const anyFinePointerQuery = window.matchMedia('(any-pointer: fine)')
    const anyHoverQuery = window.matchMedia('(any-hover: hover)')
    const hoverQuery = window.matchMedia('(hover: hover)')
    const smallViewportQuery = window.matchMedia('(max-width: 1024px)')

    const updateDetection = () => {
      setIsMobileDevice(detectMobileDevice())
    }

    updateDetection()

    if (
      typeof touchQuery.addEventListener === 'function' &&
      typeof anyCoarsePointerQuery.addEventListener === 'function' &&
      typeof anyFinePointerQuery.addEventListener === 'function' &&
      typeof anyHoverQuery.addEventListener === 'function' &&
      typeof hoverQuery.addEventListener === 'function' &&
      typeof smallViewportQuery.addEventListener === 'function'
    ) {
      touchQuery.addEventListener('change', updateDetection)
      anyCoarsePointerQuery.addEventListener('change', updateDetection)
      anyFinePointerQuery.addEventListener('change', updateDetection)
      anyHoverQuery.addEventListener('change', updateDetection)
      hoverQuery.addEventListener('change', updateDetection)
      smallViewportQuery.addEventListener('change', updateDetection)
      window.addEventListener('resize', updateDetection)
      window.addEventListener('orientationchange', updateDetection)

      return () => {
        touchQuery.removeEventListener('change', updateDetection)
        anyCoarsePointerQuery.removeEventListener('change', updateDetection)
        anyFinePointerQuery.removeEventListener('change', updateDetection)
        anyHoverQuery.removeEventListener('change', updateDetection)
        hoverQuery.removeEventListener('change', updateDetection)
        smallViewportQuery.removeEventListener('change', updateDetection)
        window.removeEventListener('resize', updateDetection)
        window.removeEventListener('orientationchange', updateDetection)
      }
    }

    touchQuery.addListener(updateDetection)
    anyCoarsePointerQuery.addListener(updateDetection)
    anyFinePointerQuery.addListener(updateDetection)
    anyHoverQuery.addListener(updateDetection)
    hoverQuery.addListener(updateDetection)
    smallViewportQuery.addListener(updateDetection)
    window.addEventListener('resize', updateDetection)
    window.addEventListener('orientationchange', updateDetection)

    return () => {
      touchQuery.removeListener(updateDetection)
      anyCoarsePointerQuery.removeListener(updateDetection)
      anyFinePointerQuery.removeListener(updateDetection)
      anyHoverQuery.removeListener(updateDetection)
      hoverQuery.removeListener(updateDetection)
      smallViewportQuery.removeListener(updateDetection)
      window.removeEventListener('resize', updateDetection)
      window.removeEventListener('orientationchange', updateDetection)
    }
  }, [])

  return isMobileDevice
}
