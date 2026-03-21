import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { cn } from '../../../shared/utils/cn'

const JOYSTICK_RADIUS = 44
const DEADZONE_RATIO = 0.12
const SPRINT_THRESHOLD = 0.88

export type TouchMoveVector = {
  x: number
  y: number
  sprint: boolean
}

type AdventureTouchJoystickProps = {
  className?: string
  onChange: (vector: TouchMoveVector) => void
}

const ZERO_VECTOR: TouchMoveVector = {
  x: 0,
  y: 0,
  sprint: false,
}

export function AdventureTouchJoystick({ className, onChange }: AdventureTouchJoystickProps) {
  const joystickRef = useRef<HTMLDivElement | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [thumbOffset, setThumbOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const coarsePointerQuery = window.matchMedia('(any-pointer: coarse)')
    const smallViewportQuery = window.matchMedia('(max-width: 1024px)')
    const mobileUserAgentPattern = /android|iphone|ipad|ipod|mobile/i

    const updateTouchDevice = () => {
      const hasTouchApi = window.navigator.maxTouchPoints > 0
      const hasCoarsePointer = touchQuery.matches || coarsePointerQuery.matches
      const hasMobileUserAgent = mobileUserAgentPattern.test(window.navigator.userAgent)
      const hasMobileViewport = smallViewportQuery.matches
      setIsTouchDevice(hasMobileViewport && (hasTouchApi || hasCoarsePointer || hasMobileUserAgent))
    }

    updateTouchDevice()
    if (
      typeof touchQuery.addEventListener === 'function' &&
      typeof coarsePointerQuery.addEventListener === 'function' &&
      typeof smallViewportQuery.addEventListener === 'function'
    ) {
      touchQuery.addEventListener('change', updateTouchDevice)
      coarsePointerQuery.addEventListener('change', updateTouchDevice)
      smallViewportQuery.addEventListener('change', updateTouchDevice)
      window.addEventListener('resize', updateTouchDevice)
      window.addEventListener('orientationchange', updateTouchDevice)

      return () => {
        touchQuery.removeEventListener('change', updateTouchDevice)
        coarsePointerQuery.removeEventListener('change', updateTouchDevice)
        smallViewportQuery.removeEventListener('change', updateTouchDevice)
        window.removeEventListener('resize', updateTouchDevice)
        window.removeEventListener('orientationchange', updateTouchDevice)
      }
    }

    touchQuery.addListener(updateTouchDevice)
    coarsePointerQuery.addListener(updateTouchDevice)
    smallViewportQuery.addListener(updateTouchDevice)
    window.addEventListener('resize', updateTouchDevice)
    window.addEventListener('orientationchange', updateTouchDevice)

    return () => {
      touchQuery.removeListener(updateTouchDevice)
      coarsePointerQuery.removeListener(updateTouchDevice)
      smallViewportQuery.removeListener(updateTouchDevice)
      window.removeEventListener('resize', updateTouchDevice)
      window.removeEventListener('orientationchange', updateTouchDevice)
    }
  }, [])

  useEffect(() => {
    return () => {
      onChange(ZERO_VECTOR)
    }
  }, [onChange])

  const resetJoystick = () => {
    activePointerIdRef.current = null
    setThumbOffset({ x: 0, y: 0 })
    onChange(ZERO_VECTOR)
  }

  const updateFromClientPoint = (clientX: number, clientY: number) => {
    const joystickElement = joystickRef.current
    if (!joystickElement) {
      return
    }

    const bounds = joystickElement.getBoundingClientRect()
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const offsetX = clientX - centerX
    const offsetY = clientY - centerY
    const rawDistance = Math.hypot(offsetX, offsetY)
    const clampedDistance = Math.min(rawDistance, JOYSTICK_RADIUS)
    const clampRatio = rawDistance === 0 ? 0 : clampedDistance / rawDistance
    const clampedOffsetX = offsetX * clampRatio
    const clampedOffsetY = offsetY * clampRatio

    setThumbOffset({ x: clampedOffsetX, y: clampedOffsetY })

    const normalizedX = clampedOffsetX / JOYSTICK_RADIUS
    const normalizedY = clampedOffsetY / JOYSTICK_RADIUS
    const magnitude = Math.hypot(normalizedX, normalizedY)

    if (magnitude <= DEADZONE_RATIO) {
      onChange(ZERO_VECTOR)
      return
    }

    const normalizedMagnitude = Math.min((magnitude - DEADZONE_RATIO) / (1 - DEADZONE_RATIO), 1)
    const directionX = normalizedX / magnitude
    const directionY = normalizedY / magnitude

    onChange({
      x: directionX * normalizedMagnitude,
      y: directionY * normalizedMagnitude,
      sprint: normalizedMagnitude >= SPRINT_THRESHOLD,
    })
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || activePointerIdRef.current !== null) {
      return
    }

    activePointerIdRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    updateFromClientPoint(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return
    }

    event.preventDefault()
    updateFromClientPoint(event.clientX, event.clientY)
  }

  const handlePointerRelease = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    resetJoystick()
  }

  if (!isTouchDevice) {
    return null
  }

  return (
    <div
      className={cn('pointer-events-auto fixed z-[70] select-none touch-none', className)}
      style={{
        bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
        right: 'max(1rem, calc(env(safe-area-inset-right) + 0.75rem))',
      }}
    >
      <div
        ref={joystickRef}
        aria-label="Touch movement joystick"
        data-joystick="movement"
        className="relative h-28 w-28 rounded-full border border-cyan-200/50 bg-slate-900/70 shadow-[0_12px_28px_rgba(8,145,178,0.35)] backdrop-blur-sm"
        onPointerCancel={handlePointerRelease}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerRelease}
      >
        <span className="pointer-events-none absolute inset-3 rounded-full border border-cyan-100/20" />
        <span className="pointer-events-none absolute inset-6 rounded-full border border-cyan-100/15" />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 rounded-full border border-cyan-100/80 bg-cyan-300/35 shadow-[0_0_24px_rgba(34,211,238,0.55)] transition-transform duration-75"
          style={{
            transform: `translate(calc(-50% + ${thumbOffset.x}px), calc(-50% + ${thumbOffset.y}px))`,
          }}
        />
      </div>
      <p className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-100/80">Move</p>
    </div>
  )
}
