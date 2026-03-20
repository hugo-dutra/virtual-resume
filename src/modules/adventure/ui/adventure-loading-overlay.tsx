import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export function AdventureLoadingOverlay() {
  const { active, progress, item, loaded, total } = useProgress()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!active && progress >= 100) {
      const timeoutId = window.setTimeout(() => {
        setIsReady(true)
      }, 280)

      return () => window.clearTimeout(timeoutId)
    }
  }, [active, progress])

  if (isReady) {
    return null
  }

  const percent = total > 0 ? Math.min(100, Math.max(0, Math.round(progress))) : 0
  const label = total > 0 ? `${loaded}/${total}` : 'Preparando motor 3D'

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
      <div className="w-[min(380px,90%)] rounded-xl border border-cyan-200/35 bg-slate-900/85 p-5 text-cyan-100 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Carregando Adventure</p>
        <p className="mt-2 text-sm text-cyan-100">{label}</p>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cyan-950/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-[width] duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-2 text-right text-xs font-medium text-cyan-200">{percent}%</p>
        <p className="mt-2 line-clamp-1 text-[11px] text-cyan-300/85">{item || 'Inicializando recursos...'}</p>
      </div>
    </div>
  )
}
