import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildingsData } from '../../data/buildings'
import type { Building } from '../../data/buildings.schema'
import { educationPlacesData } from '../../data/education-places'
import type { EducationPlace } from '../../data/education-places.schema'
import { experiencesData } from '../../data/experiences'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useAppStore } from '../../shared/stores/use-app-store'
import { Button } from '../../shared/ui/button'
import { Card } from '../../shared/ui/card'
import { Modal } from '../../shared/ui/modal'
import { AdventureCanvas } from './engine/adventure-canvas'
import type { PlayerPosition } from './engine/adventure-scene'
import { useAdventureAudio } from './hooks/use-adventure-audio'
import { AdventureHud } from './ui/adventure-hud'
import { AdventureLoadingOverlay } from './ui/adventure-loading-overlay'
import { PLAYER_RADIUS } from './world/world.constants'

const PROXIMITY_AUTO_OPEN_DISTANCE = 4
const PROXIMITY_AUTO_CLOSE_DISTANCE = 6

function getPlayerToBoxDistance(
  position: PlayerPosition,
  box: {
    position: {
      x: number
      z: number
    }
    size: {
      x: number
      z: number
    }
  },
) {
  const halfWidth = box.size.x / 2
  const halfDepth = box.size.z / 2
  const deltaX = Math.max(Math.abs(position.x - box.position.x) - halfWidth, 0)
  const deltaZ = Math.max(Math.abs(position.z - box.position.z) - halfDepth, 0)
  const centerToBuildingDistance = Math.hypot(deltaX, deltaZ)

  // Convert center-to-shape distance into surface-to-surface distance in meters.
  return Math.max(centerToBuildingDistance - PLAYER_RADIUS, 0)
}

export function AdventurePage() {
  useAppMode('adventure')

  const openPopup = useAppStore((state) => state.openPopup)
  const closePopup = useAppStore((state) => state.closePopup)
  const activeExperienceId = useAppStore((state) => state.activeExperienceId)
  const hoveredBuildingId = useAppStore((state) => state.hoveredBuildingId)
  const setHoveredBuildingId = useAppStore((state) => state.setHoveredBuildingId)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 0, z: 0 })
  const [selectedEducationPlaceId, setSelectedEducationPlaceId] = useState<string | null>(null)

  useAdventureAudio(audioEnabled)

  const selectedExperience = experiencesData.experiences.find(
    (experience) => experience.id === activeExperienceId,
  )

  const selectedBuilding = buildingsData.buildings.find(
    (building) => building.experienceId === activeExperienceId,
  )

  const selectedEducationPlace = educationPlacesData.places.find((place) => place.id === selectedEducationPlaceId)
  const allBuildings = useMemo(() => buildingsData.buildings, [])
  const allEducationPlaces = useMemo(() => educationPlacesData.places, [])
  const activeExperienceIdRef = useRef(activeExperienceId)
  const selectedEducationPlaceIdRef = useRef(selectedEducationPlaceId)
  const selectedBuildingRef = useRef<Building | undefined>(selectedBuilding)
  const selectedEducationPlaceRef = useRef<EducationPlace | undefined>(selectedEducationPlace)

  useEffect(() => {
    activeExperienceIdRef.current = activeExperienceId
    selectedEducationPlaceIdRef.current = selectedEducationPlaceId
    selectedBuildingRef.current = selectedBuilding
    selectedEducationPlaceRef.current = selectedEducationPlace
  }, [activeExperienceId, selectedBuilding, selectedEducationPlace, selectedEducationPlaceId])

  const handleBuildingSelect = useCallback(
    (building: Building) => {
      setSelectedEducationPlaceId(null)
      openPopup(building.experienceId)
    },
    [openPopup],
  )

  const handleEducationSelect = useCallback(
    (place: EducationPlace) => {
      closePopup()
      setSelectedEducationPlaceId(place.id)
      setHoveredBuildingId(null)
    },
    [closePopup, setHoveredBuildingId],
  )

  const handleCloseModal = useCallback(() => {
    closePopup()
    setSelectedEducationPlaceId(null)
  }, [closePopup])

  const handleEducationMarkerSelect = useCallback(
    (placeId: string) => {
      const place = educationPlacesData.places.find((entry) => entry.id === placeId)
      if (!place) {
        return
      }

      handleEducationSelect(place)
    },
    [handleEducationSelect],
  )

  const handleEmptySelect = useCallback(() => {
    handleCloseModal()
    setHoveredBuildingId(null)
  }, [handleCloseModal, setHoveredBuildingId])

  const handlePlayerPositionChange = useCallback(
    (position: PlayerPosition) => {
      setPlayerPosition((previousPosition) => {
        const hasMovedEnough =
          Math.abs(previousPosition.x - position.x) > 0.02 || Math.abs(previousPosition.z - position.z) > 0.02

        return hasMovedEnough ? position : previousPosition
      })

      let nearestBuilding: Building | null = null
      let nearestBuildingDistance = Number.POSITIVE_INFINITY

      for (const building of allBuildings) {
        const distance = getPlayerToBoxDistance(position, building)
        if (distance < nearestBuildingDistance) {
          nearestBuildingDistance = distance
          nearestBuilding = building
        }
      }

      let nearestEducationPlace: EducationPlace | null = null
      let nearestEducationDistance = Number.POSITIVE_INFINITY

      for (const place of allEducationPlaces) {
        const distance = getPlayerToBoxDistance(position, place)
        if (distance < nearestEducationDistance) {
          nearestEducationDistance = distance
          nearestEducationPlace = place
        }
      }

      const currentActiveExperienceId = activeExperienceIdRef.current
      const currentSelectedEducationPlaceId = selectedEducationPlaceIdRef.current
      const currentSelectedBuilding = selectedBuildingRef.current
      const currentSelectedEducationPlace = selectedEducationPlaceRef.current

      const shouldOpenNearestBuilding =
        nearestBuilding !== null &&
        nearestBuildingDistance <= PROXIMITY_AUTO_OPEN_DISTANCE &&
        nearestBuildingDistance <= nearestEducationDistance

      if (shouldOpenNearestBuilding && nearestBuilding) {
        if (
          currentActiveExperienceId !== nearestBuilding.experienceId ||
          currentSelectedEducationPlaceId !== null
        ) {
          activeExperienceIdRef.current = nearestBuilding.experienceId
          selectedEducationPlaceIdRef.current = null
          selectedBuildingRef.current = nearestBuilding
          selectedEducationPlaceRef.current = undefined
          handleBuildingSelect(nearestBuilding)
        }
        return
      }

      const shouldOpenNearestEducation =
        nearestEducationPlace !== null &&
        nearestEducationDistance <= PROXIMITY_AUTO_OPEN_DISTANCE &&
        nearestEducationDistance < nearestBuildingDistance

      if (shouldOpenNearestEducation && nearestEducationPlace) {
        if (
          currentSelectedEducationPlaceId !== nearestEducationPlace.id ||
          currentActiveExperienceId !== null
        ) {
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = nearestEducationPlace.id
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = nearestEducationPlace
          handleEducationSelect(nearestEducationPlace)
        }
        return
      }

      if (currentSelectedBuilding) {
        const distanceToSelectedBuilding = getPlayerToBoxDistance(position, currentSelectedBuilding)
        if (distanceToSelectedBuilding > PROXIMITY_AUTO_CLOSE_DISTANCE) {
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = null
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = undefined
          handleCloseModal()
          setHoveredBuildingId(null)
        }
        return
      }

      if (currentSelectedEducationPlace) {
        const distanceToSelectedEducation = getPlayerToBoxDistance(position, currentSelectedEducationPlace)
        if (distanceToSelectedEducation > PROXIMITY_AUTO_CLOSE_DISTANCE) {
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = null
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = undefined
          handleCloseModal()
          setHoveredBuildingId(null)
        }
      }
    },
    [allBuildings, allEducationPlaces, handleBuildingSelect, handleCloseModal, handleEducationSelect, setHoveredBuildingId],
  )

  const handleActiveBuildingCountChange = useCallback(() => {
    // Intentionally no-op: minimap is visual only without textual counters.
  }, [])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Adventure Mode
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">3D Interactive Map</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={audioEnabled ? 'secondary' : 'ghost'} onClick={toggleAudio}>
            Audio: {audioEnabled ? 'on' : 'off'}
          </Button>
          <Link
            className="inline-flex items-center text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
            to="/"
          >
            Back
          </Link>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="relative h-[68vh] min-h-[500px] w-full bg-slate-950">
          <AdventureLoadingOverlay />
          <AdventureCanvas
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuilding?.id ?? null}
            selectedEducationPlaceId={selectedEducationPlace?.id ?? null}
            onBuildingSelect={handleBuildingSelect}
            onEducationSelect={handleEducationSelect}
            onEmptySelect={handleEmptySelect}
            onHoveredBuildingChange={setHoveredBuildingId}
            onActiveBuildingCountChange={handleActiveBuildingCountChange}
            onPlayerPositionChange={handlePlayerPositionChange}
          />
          <AdventureHud
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuilding?.id ?? null}
            selectedEducationPlaceId={selectedEducationPlace?.id ?? null}
            playerPosition={playerPosition}
            buildings={buildingsData.buildings}
            educationPlaces={educationPlacesData.places}
            onEducationMarkerSelect={handleEducationMarkerSelect}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Welcome to Career Quest</h2>
        <div className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            This interactive map is a playful way to explore my professional and academic journey. Walk around, find
            landmarks, and click them to open the story behind each experience.
          </p>
          <p>
            Use <strong>WASD</strong> (or arrow keys) to move, hold <strong>Shift</strong> to sprint, and use the
            <strong> mouse scroll</strong> to zoom the camera from close view to far overview. Click buildings for
            work experiences and diamond landmarks for academic milestones.
          </p>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(selectedExperience || selectedEducationPlace)}
        title={
          selectedExperience && selectedBuilding
            ? `${selectedBuilding.name} - ${selectedExperience.company}`
            : selectedEducationPlace
              ? `${selectedEducationPlace.name} - ${selectedEducationPlace.institution}`
              : 'Details'
        }
        onClose={handleCloseModal}
      >
        {selectedExperience && selectedBuilding ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <strong>Role:</strong> {selectedExperience.role}
              </p>
              <p>
                <strong>Period:</strong> {selectedExperience.period}
              </p>
              <p>
                <strong>Location:</strong> {selectedExperience.location}
              </p>
              <p>
                <strong>Map zone:</strong> {selectedBuilding.zone}
              </p>
            </div>

            <p>
              <strong>Summary:</strong> {selectedExperience.summary}
            </p>

            <div>
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Primary stack</p>
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
              <p className="mb-2 font-semibold text-slate-800 dark:text-slate-200">Highlights</p>
              <ul className="list-disc space-y-1 pl-5">
                {selectedExperience.highlights.map((highlight) => (
                  <li key={`${selectedExperience.id}-${highlight}`}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {selectedEducationPlace ? (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <strong>Institution:</strong> {selectedEducationPlace.institution}
              </p>
              <p>
                <strong>Period:</strong> {selectedEducationPlace.period}
              </p>
              <p>
                <strong>Map zone:</strong> {selectedEducationPlace.zone}
              </p>
              <p>
                <strong>Category:</strong> Academic Formation
              </p>
            </div>

            <p>
              <strong>Summary:</strong> {selectedEducationPlace.details}
            </p>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
