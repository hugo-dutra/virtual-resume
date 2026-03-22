import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildingsData } from '../../data/buildings'
import type { Building } from '../../data/buildings.schema'
import { colleaguesData } from '../../data/colleagues'
import type { Colleague } from '../../data/colleagues.schema'
import { educationPlacesData } from '../../data/education-places'
import type { EducationPlace } from '../../data/education-places.schema'
import { experiencesData } from '../../data/experiences'
import { useAppMode } from '../../shared/hooks/use-app-mode'
import { useIsMobileDevice } from '../../shared/hooks/use-is-mobile-device'
import { useAppStore } from '../../shared/stores/use-app-store'
import { Button } from '../../shared/ui/button'
import { Card } from '../../shared/ui/card'
import { Modal } from '../../shared/ui/modal'
import { resolvePublicAssetPath } from '../../shared/utils/resolve-public-asset-path'
import { AdventureCanvas } from './engine/adventure-canvas'
import type { PlayerPosition } from './engine/adventure-scene'
import { useAdventureAudio } from './hooks/use-adventure-audio'
import { AdventureHud } from './ui/adventure-hud'
import { AdventureLoadingOverlay } from './ui/adventure-loading-overlay'
import { AdventureTouchJoystick, type TouchMoveVector } from './ui/adventure-touch-joystick'
import { PLAYER_RADIUS } from './world/world.constants'

const PROXIMITY_AUTO_OPEN_DISTANCE = 4
const PROXIMITY_AUTO_CLOSE_DISTANCE = 6
const PROXIMITY_REOPEN_DELTA = 0.03
const PROXIMITY_EDGE_BUFFER = 1.2
const PROXIMITY_SIZE_PADDING = 2.2
const MARKER_BOUNDS_EPSILON = 0.01

type DismissedTarget =
  | {
      kind: 'building'
      id: string
      lastDistance: number
    }
  | {
      kind: 'education'
      id: string
      lastDistance: number
    }
  | {
      kind: 'colleague'
      id: string
      lastDistance: number
    }

type EducationProximityBounds = {
  position: {
    x: number
    z: number
  }
  size: {
    x: number
    z: number
  }
}

type BuildingProximityBounds = {
  position: {
    x: number
    z: number
  }
  size: {
    x: number
    z: number
  }
}

type ColleaguePositionMap = Record<string, PlayerPosition>

function areProximityBoundsClose(
  a: {
    position: {
      x: number
      z: number
    }
    size: {
      x: number
      z: number
    }
  },
  b: {
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
  return (
    Math.abs(a.position.x - b.position.x) <= MARKER_BOUNDS_EPSILON &&
    Math.abs(a.position.z - b.position.z) <= MARKER_BOUNDS_EPSILON &&
    Math.abs(a.size.x - b.size.x) <= MARKER_BOUNDS_EPSILON &&
    Math.abs(a.size.z - b.size.z) <= MARKER_BOUNDS_EPSILON
  )
}

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
  const halfWidth = box.size.x / 2 + PROXIMITY_SIZE_PADDING / 2
  const halfDepth = box.size.z / 2 + PROXIMITY_SIZE_PADDING / 2
  const deltaX = Math.max(Math.abs(position.x - box.position.x) - halfWidth, 0)
  const deltaZ = Math.max(Math.abs(position.z - box.position.z) - halfDepth, 0)
  const centerToBuildingDistance = Math.hypot(deltaX, deltaZ)

  // Convert center-to-shape distance into surface-to-surface distance in meters.
  return Math.max(centerToBuildingDistance - PLAYER_RADIUS - PROXIMITY_EDGE_BUFFER, 0)
}

function getPlayerToPointDistance(position: PlayerPosition, target: PlayerPosition, targetRadius = 0) {
  const centerDistance = Math.hypot(position.x - target.x, position.z - target.z)
  return Math.max(centerDistance - PLAYER_RADIUS - targetRadius, 0)
}

export function AdventurePage() {
  useAppMode('adventure')
  const isMobileDevice = useIsMobileDevice()

  const openPopup = useAppStore((state) => state.openPopup)
  const closePopup = useAppStore((state) => state.closePopup)
  const activeExperienceId = useAppStore((state) => state.activeExperienceId)
  const hoveredBuildingId = useAppStore((state) => state.hoveredBuildingId)
  const setHoveredBuildingId = useAppStore((state) => state.setHoveredBuildingId)
  const audioEnabled = useAppStore((state) => state.audioEnabled)
  const toggleAudio = useAppStore((state) => state.toggleAudio)
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 0, z: 0 })
  const [selectedEducationPlaceId, setSelectedEducationPlaceId] = useState<string | null>(null)
  const [selectedColleagueId, setSelectedColleagueId] = useState<string | null>(null)
  const [buildingMarkerBoundsById, setBuildingMarkerBoundsById] = useState<
    Record<string, BuildingProximityBounds>
  >({})
  const [educationMarkerBoundsById, setEducationMarkerBoundsById] = useState<
    Record<string, EducationProximityBounds>
  >({})
  const allColleagues = useMemo(() => colleaguesData.colleagues, [])
  const initialColleaguePositions = useMemo(
    () =>
      Object.fromEntries(
        allColleagues.map((colleague) => [colleague.id, { x: colleague.path[0].x, z: colleague.path[0].z }]),
      ) as ColleaguePositionMap,
    [allColleagues],
  )
  const [colleaguePositionsById, setColleaguePositionsById] =
    useState<ColleaguePositionMap>(initialColleaguePositions)
  const touchControlsRef = useRef<TouchMoveVector>({
    x: 0,
    y: 0,
    sprint: false,
  })

  useAdventureAudio(audioEnabled)

  const selectedExperience = experiencesData.experiences.find(
    (experience) => experience.id === activeExperienceId,
  )

  const selectedBuilding = buildingsData.buildings.find(
    (building) => building.experienceId === activeExperienceId,
  )

  const selectedEducationPlace = educationPlacesData.places.find((place) => place.id === selectedEducationPlaceId)
  const selectedColleague = allColleagues.find((colleague) => colleague.id === selectedColleagueId)
  const allBuildings = useMemo(() => buildingsData.buildings, [])
  const allEducationPlaces = useMemo(() => educationPlacesData.places, [])
  const buildingById = useMemo(() => new Map(allBuildings.map((building) => [building.id, building])), [allBuildings])
  const educationPlaceById = useMemo(
    () => new Map(allEducationPlaces.map((place) => [place.id, place])),
    [allEducationPlaces],
  )
  const colleagueById = useMemo(
    () => new Map(allColleagues.map((colleague) => [colleague.id, colleague])),
    [allColleagues],
  )
  const activeExperienceIdRef = useRef(activeExperienceId)
  const selectedEducationPlaceIdRef = useRef(selectedEducationPlaceId)
  const selectedColleagueIdRef = useRef(selectedColleagueId)
  const selectedBuildingRef = useRef<Building | undefined>(selectedBuilding)
  const selectedEducationPlaceRef = useRef<EducationPlace | undefined>(selectedEducationPlace)
  const selectedColleagueRef = useRef<Colleague | undefined>(selectedColleague)
  const dismissedTargetRef = useRef<DismissedTarget | null>(null)
  const educationBoundsByIdRef = useRef<Map<string, EducationProximityBounds>>(new Map())
  const buildingBoundsByIdRef = useRef<Map<string, BuildingProximityBounds>>(new Map())
  const colleaguePositionsByIdRef = useRef<Map<string, PlayerPosition>>(new Map())

  useEffect(() => {
    activeExperienceIdRef.current = activeExperienceId
    selectedEducationPlaceIdRef.current = selectedEducationPlaceId
    selectedColleagueIdRef.current = selectedColleagueId
    selectedBuildingRef.current = selectedBuilding
    selectedEducationPlaceRef.current = selectedEducationPlace
    selectedColleagueRef.current = selectedColleague
  }, [
    activeExperienceId,
    selectedBuilding,
    selectedColleague,
    selectedColleagueId,
    selectedEducationPlace,
    selectedEducationPlaceId,
  ])

  useEffect(() => {
    colleaguePositionsByIdRef.current = new Map(
      Object.entries(initialColleaguePositions).map(([id, point]) => [id, point]),
    )
  }, [initialColleaguePositions])

  const handleBuildingSelect = useCallback(
    (building: Building) => {
      dismissedTargetRef.current = null
      setSelectedEducationPlaceId(null)
      setSelectedColleagueId(null)
      openPopup(building.experienceId)
    },
    [openPopup],
  )

  const handleEducationSelect = useCallback(
    (place: EducationPlace) => {
      dismissedTargetRef.current = null
      closePopup()
      setSelectedEducationPlaceId(place.id)
      setSelectedColleagueId(null)
      setHoveredBuildingId(null)
    },
    [closePopup, setHoveredBuildingId],
  )

  const handleColleagueSelect = useCallback(
    (colleague: Colleague) => {
      dismissedTargetRef.current = null
      closePopup()
      setSelectedEducationPlaceId(null)
      setSelectedColleagueId(colleague.id)
      setHoveredBuildingId(null)
    },
    [closePopup, setHoveredBuildingId],
  )

  const handleColleaguePositionChange = useCallback((colleagueId: string, position: PlayerPosition) => {
    colleaguePositionsByIdRef.current.set(colleagueId, position)
    setColleaguePositionsById((currentPositions) => {
      const previousPosition = currentPositions[colleagueId]
      if (
        previousPosition &&
        Math.abs(previousPosition.x - position.x) <= MARKER_BOUNDS_EPSILON &&
        Math.abs(previousPosition.z - position.z) <= MARKER_BOUNDS_EPSILON
      ) {
        return currentPositions
      }

      return {
        ...currentPositions,
        [colleagueId]: position,
      }
    })
  }, [])

  const handleEducationBoundsChange = useCallback((placeId: string, bounds: EducationProximityBounds | null) => {
    if (bounds) {
      const normalizedBounds: EducationProximityBounds = {
        position: {
          x: bounds.position.x,
          z: bounds.position.z,
        },
        size: {
          x: bounds.size.x,
          z: bounds.size.z,
        },
      }

      educationBoundsByIdRef.current.set(placeId, normalizedBounds)
      setEducationMarkerBoundsById((currentBounds) => {
        const previousBounds = currentBounds[placeId]
        if (previousBounds && areProximityBoundsClose(previousBounds, normalizedBounds)) {
          return currentBounds
        }

        return {
          ...currentBounds,
          [placeId]: normalizedBounds,
        }
      })
      return
    }

    educationBoundsByIdRef.current.delete(placeId)
    setEducationMarkerBoundsById((currentBounds) => {
      if (!(placeId in currentBounds)) {
        return currentBounds
      }

      const nextBounds = { ...currentBounds }
      delete nextBounds[placeId]
      return nextBounds
    })
  }, [])

  const handleBuildingBoundsChange = useCallback((buildingId: string, bounds: BuildingProximityBounds | null) => {
    if (bounds) {
      const normalizedBounds: BuildingProximityBounds = {
        position: {
          x: bounds.position.x,
          z: bounds.position.z,
        },
        size: {
          x: bounds.size.x,
          z: bounds.size.z,
        },
      }

      buildingBoundsByIdRef.current.set(buildingId, normalizedBounds)
      setBuildingMarkerBoundsById((currentBounds) => {
        const previousBounds = currentBounds[buildingId]
        if (previousBounds && areProximityBoundsClose(previousBounds, normalizedBounds)) {
          return currentBounds
        }

        return {
          ...currentBounds,
          [buildingId]: normalizedBounds,
        }
      })
      return
    }

    buildingBoundsByIdRef.current.delete(buildingId)
    setBuildingMarkerBoundsById((currentBounds) => {
      if (!(buildingId in currentBounds)) {
        return currentBounds
      }

      const nextBounds = { ...currentBounds }
      delete nextBounds[buildingId]
      return nextBounds
    })
  }, [])

  const getBuildingDistance = useCallback((position: PlayerPosition, building: Building) => {
    const dynamicBounds = buildingBoundsByIdRef.current.get(building.id)
    if (!dynamicBounds) {
      return getPlayerToBoxDistance(position, building)
    }

    return getPlayerToBoxDistance(position, dynamicBounds)
  }, [])

  const getEducationDistance = useCallback((position: PlayerPosition, place: EducationPlace) => {
    const dynamicBounds = educationBoundsByIdRef.current.get(place.id)
    if (!dynamicBounds) {
      return getPlayerToBoxDistance(position, place)
    }

    return getPlayerToBoxDistance(position, dynamicBounds)
  }, [])

  const getColleagueDistance = useCallback((position: PlayerPosition, colleague: Colleague) => {
    const trackedPosition = colleaguePositionsByIdRef.current.get(colleague.id) ?? {
      x: colleague.path[0].x,
      z: colleague.path[0].z,
    }
    const hitbox = colleague.interaction?.hitbox
    const targetRadius = (Math.max(hitbox?.x ?? 1.3, hitbox?.z ?? 1.3) + PROXIMITY_SIZE_PADDING * 0.5) / 2

    return getPlayerToPointDistance(position, trackedPosition, targetRadius)
  }, [])

  const clearActiveSelection = useCallback(() => {
    closePopup()
    setSelectedEducationPlaceId(null)
    setSelectedColleagueId(null)
  }, [closePopup])

  const handleCloseModal = useCallback(() => {
    const currentSelectedBuilding = selectedBuildingRef.current
    const currentSelectedEducationPlace = selectedEducationPlaceRef.current
    const currentSelectedColleague = selectedColleagueRef.current

    if (currentSelectedBuilding) {
      dismissedTargetRef.current = {
        kind: 'building',
        id: currentSelectedBuilding.id,
        lastDistance: getBuildingDistance(playerPosition, currentSelectedBuilding),
      }
    } else if (currentSelectedEducationPlace) {
      dismissedTargetRef.current = {
        kind: 'education',
        id: currentSelectedEducationPlace.id,
        lastDistance: getEducationDistance(playerPosition, currentSelectedEducationPlace),
      }
    } else if (currentSelectedColleague) {
      dismissedTargetRef.current = {
        kind: 'colleague',
        id: currentSelectedColleague.id,
        lastDistance: getColleagueDistance(playerPosition, currentSelectedColleague),
      }
    } else {
      dismissedTargetRef.current = null
    }

    activeExperienceIdRef.current = null
    selectedEducationPlaceIdRef.current = null
    selectedColleagueIdRef.current = null
    selectedBuildingRef.current = undefined
    selectedEducationPlaceRef.current = undefined
    selectedColleagueRef.current = undefined
    clearActiveSelection()
  }, [clearActiveSelection, getBuildingDistance, getColleagueDistance, getEducationDistance, playerPosition])

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

  const handleColleagueMarkerSelect = useCallback(
    (colleagueId: string) => {
      const colleague = colleagueById.get(colleagueId)
      if (!colleague) {
        return
      }

      handleColleagueSelect(colleague)
    },
    [colleagueById, handleColleagueSelect],
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
        const distance = getBuildingDistance(position, building)
        if (distance < nearestBuildingDistance) {
          nearestBuildingDistance = distance
          nearestBuilding = building
        }
      }

      let nearestEducationPlace: EducationPlace | null = null
      let nearestEducationDistance = Number.POSITIVE_INFINITY

      for (const place of allEducationPlaces) {
        const distance = getEducationDistance(position, place)
        if (distance < nearestEducationDistance) {
          nearestEducationDistance = distance
          nearestEducationPlace = place
        }
      }

      let nearestColleague: Colleague | null = null
      let nearestColleagueDistance = Number.POSITIVE_INFINITY

      for (const colleague of allColleagues) {
        const distance = getColleagueDistance(position, colleague)
        if (distance < nearestColleagueDistance) {
          nearestColleagueDistance = distance
          nearestColleague = colleague
        }
      }

      const currentActiveExperienceId = activeExperienceIdRef.current
      const currentSelectedEducationPlaceId = selectedEducationPlaceIdRef.current
      const currentSelectedColleagueId = selectedColleagueIdRef.current
      const currentSelectedBuilding = selectedBuildingRef.current
      const currentSelectedEducationPlace = selectedEducationPlaceRef.current
      const currentSelectedColleague = selectedColleagueRef.current
      const dismissedTarget = dismissedTargetRef.current
      let dismissedTargetMovedCloser = false

      if (dismissedTarget) {
        const previousDistance = dismissedTarget.lastDistance

        if (dismissedTarget.kind === 'building') {
          const dismissedBuilding = buildingById.get(dismissedTarget.id)
          if (!dismissedBuilding) {
            dismissedTargetRef.current = null
          } else {
            const currentDistance = getBuildingDistance(position, dismissedBuilding)
            dismissedTargetMovedCloser = currentDistance < previousDistance - PROXIMITY_REOPEN_DELTA
            dismissedTarget.lastDistance = currentDistance
          }
        } else if (dismissedTarget.kind === 'education') {
          const dismissedEducationPlace = educationPlaceById.get(dismissedTarget.id)
          if (!dismissedEducationPlace) {
            dismissedTargetRef.current = null
          } else {
            const currentDistance = getEducationDistance(position, dismissedEducationPlace)
            dismissedTargetMovedCloser = currentDistance < previousDistance - PROXIMITY_REOPEN_DELTA
            dismissedTarget.lastDistance = currentDistance
          }
        } else {
          const dismissedColleague = colleagueById.get(dismissedTarget.id)
          if (!dismissedColleague) {
            dismissedTargetRef.current = null
          } else {
            const currentDistance = getColleagueDistance(position, dismissedColleague)
            dismissedTargetMovedCloser = currentDistance < previousDistance - PROXIMITY_REOPEN_DELTA
            dismissedTarget.lastDistance = currentDistance
          }
        }
      }

      const nearestTargets = [
        nearestBuilding
          ? {
              kind: 'building' as const,
              id: nearestBuilding.id,
              distance: nearestBuildingDistance,
            }
          : null,
        nearestEducationPlace
          ? {
              kind: 'education' as const,
              id: nearestEducationPlace.id,
              distance: nearestEducationDistance,
            }
          : null,
        nearestColleague
          ? {
              kind: 'colleague' as const,
              id: nearestColleague.id,
              distance: nearestColleagueDistance,
            }
          : null,
      ]
        .filter((target): target is { kind: 'building' | 'education' | 'colleague'; id: string; distance: number } =>
          Boolean(target),
        )
        .filter((target) => target.distance <= PROXIMITY_AUTO_OPEN_DISTANCE)
        .sort((a, b) => a.distance - b.distance)

      const nearestTarget = nearestTargets[0]

      if (nearestTarget) {
        const isDismissedTarget =
          dismissedTargetRef.current?.kind === nearestTarget.kind &&
          dismissedTargetRef.current.id === nearestTarget.id
        if (isDismissedTarget && !dismissedTargetMovedCloser) {
          return
        }

        if (isDismissedTarget) {
          dismissedTargetRef.current = null
        }

        if (nearestTarget.kind === 'building' && nearestBuilding) {
          if (
            currentActiveExperienceId !== nearestBuilding.experienceId ||
            currentSelectedEducationPlaceId !== null ||
            currentSelectedColleagueId !== null
          ) {
            activeExperienceIdRef.current = nearestBuilding.experienceId
            selectedEducationPlaceIdRef.current = null
            selectedColleagueIdRef.current = null
            selectedBuildingRef.current = nearestBuilding
            selectedEducationPlaceRef.current = undefined
            selectedColleagueRef.current = undefined
            handleBuildingSelect(nearestBuilding)
          }
          return
        }

        if (nearestTarget.kind === 'education' && nearestEducationPlace) {
          if (
            currentSelectedEducationPlaceId !== nearestEducationPlace.id ||
            currentActiveExperienceId !== null ||
            currentSelectedColleagueId !== null
          ) {
            activeExperienceIdRef.current = null
            selectedEducationPlaceIdRef.current = nearestEducationPlace.id
            selectedColleagueIdRef.current = null
            selectedBuildingRef.current = undefined
            selectedEducationPlaceRef.current = nearestEducationPlace
            selectedColleagueRef.current = undefined
            handleEducationSelect(nearestEducationPlace)
          }
          return
        }

        if (nearestTarget.kind === 'colleague' && nearestColleague) {
          if (
            currentSelectedColleagueId !== nearestColleague.id ||
            currentActiveExperienceId !== null ||
            currentSelectedEducationPlaceId !== null
          ) {
            activeExperienceIdRef.current = null
            selectedEducationPlaceIdRef.current = null
            selectedColleagueIdRef.current = nearestColleague.id
            selectedBuildingRef.current = undefined
            selectedEducationPlaceRef.current = undefined
            selectedColleagueRef.current = nearestColleague
            handleColleagueSelect(nearestColleague)
          }
          return
        }
      }

      if (currentSelectedBuilding) {
        const distanceToSelectedBuilding = getBuildingDistance(position, currentSelectedBuilding)
        if (distanceToSelectedBuilding > PROXIMITY_AUTO_CLOSE_DISTANCE) {
          dismissedTargetRef.current = null
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = null
          selectedColleagueIdRef.current = null
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = undefined
          selectedColleagueRef.current = undefined
          clearActiveSelection()
          setHoveredBuildingId(null)
        }
        return
      }

      if (currentSelectedEducationPlace) {
        const distanceToSelectedEducation = getEducationDistance(position, currentSelectedEducationPlace)
        if (distanceToSelectedEducation > PROXIMITY_AUTO_CLOSE_DISTANCE) {
          dismissedTargetRef.current = null
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = null
          selectedColleagueIdRef.current = null
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = undefined
          selectedColleagueRef.current = undefined
          clearActiveSelection()
          setHoveredBuildingId(null)
        }
        return
      }

      if (currentSelectedColleague) {
        const distanceToSelectedColleague = getColleagueDistance(position, currentSelectedColleague)
        if (distanceToSelectedColleague > PROXIMITY_AUTO_CLOSE_DISTANCE) {
          dismissedTargetRef.current = null
          activeExperienceIdRef.current = null
          selectedEducationPlaceIdRef.current = null
          selectedColleagueIdRef.current = null
          selectedBuildingRef.current = undefined
          selectedEducationPlaceRef.current = undefined
          selectedColleagueRef.current = undefined
          clearActiveSelection()
          setHoveredBuildingId(null)
        }
      }
    },
    [
      allBuildings,
      allColleagues,
      allEducationPlaces,
      buildingById,
      clearActiveSelection,
      colleagueById,
      educationPlaceById,
      getBuildingDistance,
      getColleagueDistance,
      getEducationDistance,
      handleBuildingSelect,
      handleColleagueSelect,
      handleEducationSelect,
      setHoveredBuildingId,
    ],
  )

  const handleActiveBuildingCountChange = useCallback(() => {
    // Intentionally no-op: minimap is visual only without textual counters.
  }, [])

  const handleTouchJoystickChange = useCallback((vector: TouchMoveVector) => {
    touchControlsRef.current = vector
  }, [])

  if (isMobileDevice) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              Adventure Mode
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">3D Interactive Map</h1>
          </div>

          <Link
            className="inline-flex items-center text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
            to="/"
          >
            Back
          </Link>
        </header>

        <Card>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Available only on desktop</p>
        </Card>
      </main>
    )
  }

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

      <section className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit lg:sticky lg:top-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Welcome to Career Quest</h2>
          <div className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p>
              This interactive map is a playful way to explore my professional and academic journey. Walk around, find
              landmarks, and get close to reveal each story.
            </p>
            <p>
              Use <strong>WASD</strong> (or arrow keys) to move, hold <strong>Shift</strong> to sprint, and use the
              <strong> mouse scroll</strong> to zoom the camera from close view to far overview.
            </p>
            <p>
              On mobile, use the <strong>right-side joystick</strong> to move the character. Push it close to the edge
              to sprint.
            </p>
            <p>
              <strong>How proximity works:</strong> info panels open automatically when you get close and close
              automatically when you move away. If you dismiss a panel while near a place (click outside or press
              <strong> Esc</strong>), it stays closed until you approach that place again.
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="relative h-[68vh] min-h-[500px] w-full bg-slate-950">
            <AdventureLoadingOverlay />
            <AdventureCanvas
              hoveredBuildingId={hoveredBuildingId}
              selectedBuildingId={selectedBuilding?.id ?? null}
              selectedEducationPlaceId={selectedEducationPlace?.id ?? null}
              selectedColleagueId={selectedColleague?.id ?? null}
              onBuildingSelect={handleBuildingSelect}
              onEducationSelect={handleEducationSelect}
              onColleagueSelect={handleColleagueSelect}
              onEmptySelect={handleEmptySelect}
              onHoveredBuildingChange={setHoveredBuildingId}
              onActiveBuildingCountChange={handleActiveBuildingCountChange}
              onPlayerPositionChange={handlePlayerPositionChange}
              onColleaguePositionChange={handleColleaguePositionChange}
              onBuildingBoundsChange={handleBuildingBoundsChange}
              onEducationBoundsChange={handleEducationBoundsChange}
              touchControlsRef={touchControlsRef}
            />
            <AdventureHud
              hoveredBuildingId={hoveredBuildingId}
              selectedBuildingId={selectedBuilding?.id ?? null}
              selectedEducationPlaceId={selectedEducationPlace?.id ?? null}
              selectedColleagueId={selectedColleague?.id ?? null}
              playerPosition={playerPosition}
              buildings={buildingsData.buildings}
              educationPlaces={educationPlacesData.places}
              colleagues={allColleagues}
              colleaguePositionsById={colleaguePositionsById}
              buildingMarkerBoundsById={buildingMarkerBoundsById}
              educationMarkerBoundsById={educationMarkerBoundsById}
              onEducationMarkerSelect={handleEducationMarkerSelect}
              onColleagueMarkerSelect={handleColleagueMarkerSelect}
            />
            <AdventureTouchJoystick onChange={handleTouchJoystickChange} />
          </div>
        </Card>
      </section>

      <Modal
        isOpen={Boolean(selectedExperience || selectedEducationPlace || selectedColleague)}
        title={
          selectedExperience && selectedBuilding
            ? `${selectedBuilding.name} - ${selectedExperience.company}`
            : selectedEducationPlace
              ? `${selectedEducationPlace.name} - ${selectedEducationPlace.institution}`
              : selectedColleague
                ? `${selectedColleague.name} - Colleague NPC`
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

        {selectedColleague ? (
          <div className="space-y-4">
            {selectedColleague.picturePath ? (
              <img
                alt={`Photo of ${selectedColleague.name}`}
                className="h-32 w-32 rounded-xl border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                loading="lazy"
                src={resolvePublicAssetPath(selectedColleague.picturePath)}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <strong>Name:</strong> {selectedColleague.name}
              </p>
              <p>
                <strong>Map zone:</strong> {selectedColleague.zone}
              </p>
              <p className="sm:col-span-2">
                <strong>LinkedIn:</strong>{' '}
                <a
                  className="font-medium text-sky-700 underline-offset-2 hover:underline dark:text-sky-300"
                  href={selectedColleague.linkedinUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Visit profile
                </a>
              </p>
            </div>

            <p>
              <strong>Story and impact:</strong> {selectedColleague.content}
            </p>

            <p>
              <strong>My testimonial:</strong> {selectedColleague.testimonial}
            </p>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
