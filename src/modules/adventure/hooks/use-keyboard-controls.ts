import { useEffect, useRef } from 'react'

export type KeyboardState = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
}

const keyMap: Record<string, keyof KeyboardState> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
}

const keyAliasMap: Record<string, keyof KeyboardState> = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
  arrowup: 'forward',
  arrowdown: 'backward',
  arrowleft: 'left',
  arrowright: 'right',
  shift: 'sprint',
}

export function useKeyboardControls() {
  const controlsRef = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  useEffect(() => {
    const resetControls = () => {
      controlsRef.current.forward = false
      controlsRef.current.backward = false
      controlsRef.current.left = false
      controlsRef.current.right = false
      controlsRef.current.sprint = false
    }

    const shouldIgnoreTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false
      }

      const tag = target.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
    }

    const setState = (event: KeyboardEvent, pressed: boolean) => {
      const action = keyMap[event.code] ?? keyAliasMap[event.key.toLowerCase()]
      if (!action) {
        return
      }

      if (shouldIgnoreTarget(event.target)) {
        return
      }

      event.preventDefault()
      controlsRef.current[action] = pressed
    }

    const onKeyDown = (event: KeyboardEvent) => setState(event, true)
    const onKeyUp = (event: KeyboardEvent) => setState(event, false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        resetControls()
      }
    }

    window.addEventListener('blur', resetControls)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', resetControls)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return controlsRef
}
