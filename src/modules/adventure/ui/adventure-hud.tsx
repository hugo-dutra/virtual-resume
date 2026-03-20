import type { Building } from '../../../data/buildings.schema'
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

type AdventureHudProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  selectedEducationPlaceId: string | null
  playerPosition: PlayerPosition
  buildings: Building[]
  educationPlaces: EducationPlace[]
  onEducationMarkerSelect: (placeId: string) => void
}

export function AdventureHud({
  hoveredBuildingId,
  selectedBuildingId,
  selectedEducationPlaceId,
  playerPosition,
  buildings,
  educationPlaces,
  onEducationMarkerSelect,
}: AdventureHudProps) {
  const experienceMarkerPositions: MarkerPosition[] = buildings.map((building) => {
    const offsetX = building.position.x - playerPosition.x
    const offsetZ = building.position.z - playerPosition.z
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
    const offsetX = place.position.x - playerPosition.x
    const offsetZ = place.position.z - playerPosition.z
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

        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100 bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
        <span className="absolute left-1/2 top-[calc(50%-12px)] h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[8px] border-x-transparent border-b-cyan-100" />
      </div>
    </aside>
  )
}
