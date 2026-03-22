import type { Building } from '../../../data/buildings.schema'
import type { Colleague } from '../../../data/colleagues.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import type { PlayerPosition } from '../engine/adventure-scene'
import { MAP_SIZE } from '../world/world.constants'

const MINIMAP_SIZE = 176
const MINIMAP_PADDING = 16
const MINIMAP_VIEW_RADIUS = Math.min(MAP_SIZE / 2, 18)
const MINIMAP_PIXEL_RADIUS = MINIMAP_SIZE / 2 - MINIMAP_PADDING

type MarkerPosition = {
  id: string
  color: string
  x: number
  y: number
  isClamped: boolean
}

type ProximityBounds = {
  position: {
    x: number
    z: number
  }
  size: {
    x: number
    z: number
  }
}

type AdventureHudProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  selectedEducationPlaceId: string | null
  selectedColleagueId: string | null
  playerPosition: PlayerPosition
  buildings: Building[]
  educationPlaces: EducationPlace[]
  colleagues: Colleague[]
  colleaguePositionsById?: Record<string, PlayerPosition>
  buildingMarkerBoundsById?: Record<string, ProximityBounds>
  educationMarkerBoundsById?: Record<string, ProximityBounds>
  onEducationMarkerSelect: (placeId: string) => void
  onColleagueMarkerSelect: (colleagueId: string) => void
}

function getClosestPointToPlayerOnBounds(
  playerPosition: PlayerPosition,
  fallbackPosition: {
    x: number
    z: number
  },
  bounds?: ProximityBounds,
) {
  if (!bounds) {
    return fallbackPosition
  }

  const halfWidth = bounds.size.x / 2
  const halfDepth = bounds.size.z / 2
  const minX = bounds.position.x - halfWidth
  const maxX = bounds.position.x + halfWidth
  const minZ = bounds.position.z - halfDepth
  const maxZ = bounds.position.z + halfDepth

  return {
    x: Math.min(Math.max(playerPosition.x, minX), maxX),
    z: Math.min(Math.max(playerPosition.z, minZ), maxZ),
  }
}

export function AdventureHud({
  hoveredBuildingId,
  selectedBuildingId,
  selectedEducationPlaceId,
  selectedColleagueId,
  playerPosition,
  buildings,
  educationPlaces,
  colleagues,
  colleaguePositionsById,
  buildingMarkerBoundsById,
  educationMarkerBoundsById,
  onEducationMarkerSelect,
  onColleagueMarkerSelect,
}: AdventureHudProps) {
  const experienceMarkerPositions: MarkerPosition[] = buildings.map((building) => {
    const markerPoint = getClosestPointToPlayerOnBounds(
      playerPosition,
      building.position,
      buildingMarkerBoundsById?.[building.id],
    )
    const offsetX = markerPoint.x - playerPosition.x
    const offsetZ = markerPoint.z - playerPosition.z
    const distance = Math.hypot(offsetX, offsetZ)

    const clampRatio = distance > MINIMAP_VIEW_RADIUS ? MINIMAP_VIEW_RADIUS / distance : 1
    const clampedX = offsetX * clampRatio
    const clampedZ = offsetZ * clampRatio

    return {
      id: building.id,
      color: building.color,
      x: (clampedX / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      y: (clampedZ / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      isClamped: clampRatio < 1,
    }
  })
  const educationMarkerPositions: MarkerPosition[] = educationPlaces.map((place) => {
    const markerPoint = getClosestPointToPlayerOnBounds(
      playerPosition,
      place.position,
      educationMarkerBoundsById?.[place.id],
    )
    const offsetX = markerPoint.x - playerPosition.x
    const offsetZ = markerPoint.z - playerPosition.z
    const distance = Math.hypot(offsetX, offsetZ)

    const clampRatio = distance > MINIMAP_VIEW_RADIUS ? MINIMAP_VIEW_RADIUS / distance : 1
    const clampedX = offsetX * clampRatio
    const clampedZ = offsetZ * clampRatio

    return {
      id: place.id,
      color: place.color,
      x: (clampedX / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      y: (clampedZ / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      isClamped: clampRatio < 1,
    }
  })
  const colleagueMarkerPositions = colleagues.map((colleague) => {
    const trackedPosition = colleaguePositionsById?.[colleague.id] ?? {
      x: colleague.path[0].x,
      z: colleague.path[0].z,
    }
    const offsetX = trackedPosition.x - playerPosition.x
    const offsetZ = trackedPosition.z - playerPosition.z
    const distance = Math.hypot(offsetX, offsetZ)

    const clampRatio = distance > MINIMAP_VIEW_RADIUS ? MINIMAP_VIEW_RADIUS / distance : 1
    const clampedX = offsetX * clampRatio
    const clampedZ = offsetZ * clampRatio

    return {
      id: colleague.id,
      icon: colleague.interaction?.minimapIcon ?? '?',
      x: (clampedX / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      y: (clampedZ / MINIMAP_VIEW_RADIUS) * MINIMAP_PIXEL_RADIUS,
      isClamped: clampRatio < 1,
    }
  })

  return (
    <aside className="pointer-events-none absolute bottom-4 left-4 z-10">
      <div className="relative h-44 w-44 overflow-hidden rounded-full border border-cyan-200/45 bg-slate-900/80 shadow-inner backdrop-blur">
        <div className="absolute inset-4 rounded-full border border-cyan-200/20" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/15" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" />

        {experienceMarkerPositions.map(({ id, color, x, y, isClamped }) => {
          const isHovered = id === hoveredBuildingId
          const isSelected = id === selectedBuildingId

          return (
            <span
              key={id}
              className={`absolute rounded-full border border-slate-950/70 ${
                isHovered || isSelected ? 'h-3 w-3' : 'h-2.5 w-2.5'
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: color,
                opacity: isClamped ? 0.82 : 1,
                boxShadow: isHovered || isSelected ? '0 0 0 3px rgba(186, 230, 253, 0.35)' : 'none',
              }}
            />
          )
        })}

        {educationMarkerPositions.map(({ id, color, x, y, isClamped }) => {
          const isSelected = id === selectedEducationPlaceId

          return (
            <button
              key={id}
              type="button"
              className={`pointer-events-auto absolute rounded-sm border border-amber-100/80 ${isSelected ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'}`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%) rotate(45deg)',
                backgroundColor: color,
                opacity: isClamped ? 0.82 : 1,
                boxShadow: isSelected ? '0 0 0 3px rgba(254, 243, 199, 0.35)' : 'none',
              }}
              title="Open education details"
              onClick={() => onEducationMarkerSelect(id)}
            />
          )
        })}

        {colleagueMarkerPositions.map(({ id, icon, x, y, isClamped }) => {
          const isSelected = id === selectedColleagueId

          return (
            <button
              key={id}
              type="button"
              className={`pointer-events-auto absolute rounded-full border border-amber-100/80 text-[10px] font-semibold leading-none ${
                isSelected ? 'h-4 w-4' : 'h-3 w-3'
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#facc15',
                color: '#0f172a',
                opacity: isClamped ? 0.82 : 1,
                boxShadow: isSelected ? '0 0 0 3px rgba(254, 249, 195, 0.4)' : 'none',
              }}
              title="Open colleague testimonial"
              onClick={() => onColleagueMarkerSelect(id)}
            >
              {icon}
            </button>
          )
        })}

        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100 bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
        <span className="absolute left-1/2 top-[calc(50%-12px)] h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[8px] border-x-transparent border-b-cyan-100" />
      </div>
    </aside>
  )
}
