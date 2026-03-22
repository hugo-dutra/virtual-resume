import { Suspense, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import type { Building } from '../../../data/buildings.schema'
import type { Colleague } from '../../../data/colleagues.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import type { TouchMoveVector } from '../ui/adventure-touch-joystick'
import { AdventureScene, type PlayerPosition } from './adventure-scene'

type AdventureCanvasProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  selectedEducationPlaceId: string | null
  selectedColleagueId: string | null
  onBuildingSelect: (building: Building) => void
  onEducationSelect: (place: EducationPlace) => void
  onColleagueSelect: (colleague: Colleague) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
  onActiveBuildingCountChange: (count: number) => void
  onPlayerPositionChange: (position: PlayerPosition) => void
  onColleaguePositionChange: (colleagueId: string, position: PlayerPosition) => void
  onBuildingBoundsChange: (
    buildingId: string,
    bounds: {
      position: {
        x: number
        z: number
      }
      size: {
        x: number
        z: number
      }
    } | null,
  ) => void
  onEducationBoundsChange: (
    placeId: string,
    bounds: {
      position: {
        x: number
        z: number
      }
      size: {
        x: number
        z: number
      }
    } | null,
  ) => void
  touchControlsRef: MutableRefObject<TouchMoveVector>
}

export function AdventureCanvas({
  hoveredBuildingId,
  selectedBuildingId,
  selectedEducationPlaceId,
  selectedColleagueId,
  onBuildingSelect,
  onEducationSelect,
  onColleagueSelect,
  onEmptySelect,
  onHoveredBuildingChange,
  onActiveBuildingCountChange,
  onPlayerPositionChange,
  onColleaguePositionChange,
  onBuildingBoundsChange,
  onEducationBoundsChange,
  touchControlsRef,
}: AdventureCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 13, 11], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.24
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        shadows
      >
        <Suspense fallback={null}>
          <AdventureScene
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuildingId}
            selectedEducationPlaceId={selectedEducationPlaceId}
            selectedColleagueId={selectedColleagueId}
            onBuildingSelect={onBuildingSelect}
            onEducationSelect={onEducationSelect}
            onColleagueSelect={onColleagueSelect}
            onEmptySelect={onEmptySelect}
            onHoveredBuildingChange={onHoveredBuildingChange}
            onActiveBuildingCountChange={onActiveBuildingCountChange}
            onPlayerPositionChange={onPlayerPositionChange}
            onColleaguePositionChange={onColleaguePositionChange}
            onBuildingBoundsChange={onBuildingBoundsChange}
            onEducationBoundsChange={onEducationBoundsChange}
            touchControlsRef={touchControlsRef}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
