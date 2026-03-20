import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  )
}
