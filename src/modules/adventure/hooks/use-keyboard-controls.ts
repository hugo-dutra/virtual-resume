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

export function useKeyboardControls() {
  const controlsRef = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  })

  useEffect(() => {
    const setState = (event: KeyboardEvent, pressed: boolean) => {
      const action = keyMap[event.code]
      if (!action) {
        return
      }
      controlsRef.current[action] = pressed
    }

    const onKeyDown = (event: KeyboardEvent) => setState(event, true)
    const onKeyUp = (event: KeyboardEvent) => setState(event, false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return controlsRef
}
