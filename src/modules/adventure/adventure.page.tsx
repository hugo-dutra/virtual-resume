import { Link } from 'react-router-dom'
import { buildingsData } from '../../data/buildings'
import type { Building } from '../../data/buildings.schema'
import { experiencesData } from '../../data/experiences'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useAppStore } from '../../shared/stores/use-app-store'
import { Button } from '../../shared/ui/button'
import { Card } from '../../shared/ui/card'
import { Modal } from '../../shared/ui/modal'
import { AdventureCanvas } from './engine/adventure-canvas'
import { AdventureHud } from './ui/adventure-hud'

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

  const selectedBuilding = buildingsData.buildings.find(
    (building) => building.experienceId === activeExperienceId,
  )

  const handleBuildingSelect = (building: Building) => {
    openPopup(building.experienceId)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Modo Adventure
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Mapa Interativo 3D</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={audioEnabled ? 'secondary' : 'ghost'} onClick={toggleAudio}>
            Audio: {audioEnabled ? 'ligado' : 'desligado'}
          </Button>
          <Link className="inline-flex items-center text-sm font-medium text-sky-700 hover:underline dark:text-sky-300" to="/">
            Voltar
          </Link>
        </div>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="relative h-[68vh] min-h-[500px] w-full bg-slate-950">
          <AdventureCanvas onBuildingSelect={handleBuildingSelect} />
          <AdventureHud buildingCount={buildingsData.buildings.length} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Status da Fase 5</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Core 3D ativo com terreno, iluminacao, movimentacao WASD, camera seguindo personagem, colisao basica com
          predios e carregamento dinamico via JSON.
        </p>
      </Card>

      <Modal
        isOpen={Boolean(selectedExperience)}
        title={selectedBuilding ? `${selectedBuilding.name} - ${selectedExperience?.company}` : 'Experiencia'}
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
            <ul className="list-disc space-y-1 pl-5">
              {selectedExperience.highlights.map((highlight) => (
                <li key={`${selectedExperience.id}-${highlight}`}>{highlight}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
