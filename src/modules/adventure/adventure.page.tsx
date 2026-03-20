import { useCallback, useState } from 'react'
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
import { useAdventureAudio } from './hooks/use-adventure-audio'
import { AdventureHud } from './ui/adventure-hud'
import { AdventureLoadingOverlay } from './ui/adventure-loading-overlay'

export function AdventurePage() {
  useAppMode('adventure')

  const openPopup = useAppStore((state) => state.openPopup)
  const closePopup = useAppStore((state) => state.closePopup)
  const activeExperienceId = useAppStore((state) => state.activeExperienceId)
  const hoveredBuildingId = useAppStore((state) => state.hoveredBuildingId)
  const setHoveredBuildingId = useAppStore((state) => state.setHoveredBuildingId)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)
  const [activeBuildingCount, setActiveBuildingCount] = useState(buildingsData.buildings.length)

  useAdventureAudio(audioEnabled)

  const selectedExperience = experiencesData.experiences.find(
    (experience) => experience.id === activeExperienceId,
  )

  const selectedBuilding = buildingsData.buildings.find(
    (building) => building.experienceId === activeExperienceId,
  )

  const hoveredBuilding = buildingsData.buildings.find((building) => building.id === hoveredBuildingId)

  const handleBuildingSelect = useCallback(
    (building: Building) => {
      openPopup(building.experienceId)
    },
    [openPopup],
  )

  const handleEmptySelect = useCallback(() => {
    closePopup()
    setHoveredBuildingId(null)
  }, [closePopup, setHoveredBuildingId])

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
          <Link
            className="inline-flex items-center text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
            to="/"
          >
            Voltar
          </Link>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="relative h-[68vh] min-h-[500px] w-full bg-slate-950">
          <AdventureLoadingOverlay />
          <AdventureCanvas
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuilding?.id ?? null}
            onBuildingSelect={handleBuildingSelect}
            onEmptySelect={handleEmptySelect}
            onHoveredBuildingChange={setHoveredBuildingId}
            onActiveBuildingCountChange={setActiveBuildingCount}
          />
          <AdventureHud
            buildingCount={buildingsData.buildings.length}
            activeBuildingCount={activeBuildingCount}
            hoveredBuildingName={hoveredBuilding?.name ?? null}
            selectedBuildingName={selectedBuilding?.name ?? null}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Status da Fase 7</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          Audio ambiente com Howler, loading screen com progresso real de assets, post-processing leve e renderizacao
          por regiao para manter o mapa mais eficiente.
        </p>
      </Card>

      <Modal
        isOpen={Boolean(selectedExperience)}
        title={selectedBuilding ? `${selectedBuilding.name} - ${selectedExperience?.company}` : 'Experiencia'}
        onClose={closePopup}
      >
        {selectedExperience && selectedBuilding ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <strong>Cargo:</strong> {selectedExperience.role}
              </p>
              <p>
                <strong>Periodo:</strong> {selectedExperience.period}
              </p>
              <p>
                <strong>Local:</strong> {selectedExperience.location}
              </p>
              <p>
                <strong>Zona no mapa:</strong> {selectedBuilding.zone}
              </p>
            </div>

            <p>
              <strong>Resumo:</strong> {selectedExperience.summary}
            </p>

            <div>
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Stack principal</p>
              <div className="flex flex-wrap gap-2">
                {selectedExperience.tech.map((tech) => (
                  <span
                    key={`${selectedExperience.id}-${tech}`}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Destaques</p>
              <ul className="list-disc space-y-1 pl-5">
                {selectedExperience.highlights.map((highlight) => (
                  <li key={`${selectedExperience.id}-${highlight}`}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
