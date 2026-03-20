import { Link } from 'react-router-dom'
import { experiencesData } from '../../data/experiences'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useAppStore } from '../../shared/stores/use-app-store'
import { Button } from '../../shared/ui/button'
import { Card } from '../../shared/ui/card'
import { Modal } from '../../shared/ui/modal'

export function AdventurePage() {
  useAppMode('adventure')

  const openPopup = useAppStore((state) => state.openPopup)
  const closePopup = useAppStore((state) => state.closePopup)
  const activeExperienceId = useAppStore((state) => state.activeExperienceId)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)

  const selectedExperience = experiencesData.experiences.find(
    (experience) => experience.id === activeExperienceId,
  )

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-slate-900">Adventure 3D</h1>
        <Link className="text-sm font-medium text-sky-700 hover:underline" to="/">
          Voltar
        </Link>
      </header>

      <Card>
        <p className="text-sm text-slate-700">
          A cena 3D entra na Fase 3, mas o estado global da experiencia ja esta pronto.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={toggleAudio}>
            Audio: {audioEnabled ? 'ligado' : 'desligado'}
          </Button>
          <Button onClick={() => openPopup(experiencesData.experiences[0].id)}>Abrir experiencia exemplo</Button>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(selectedExperience)}
        title={selectedExperience ? selectedExperience.company : 'Experiencia'}
        onClose={closePopup}
      >
        {selectedExperience ? (
          <div className="space-y-3">
            <p>
              <strong>Cargo:</strong> {selectedExperience.role}
            </p>
            <p>
              <strong>Periodo:</strong> {selectedExperience.period}
            </p>
            <p>
              <strong>Resumo:</strong> {selectedExperience.summary}
            </p>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
