import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import type { Building } from '../../../data/buildings.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import { AdventureScene, type PlayerPosition } from './adventure-scene'

type AdventureCanvasProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  selectedEducationPlaceId: string | null
  onBuildingSelect: (building: Building) => void
  onEducationSelect: (place: EducationPlace) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
  onActiveBuildingCountChange: (count: number) => void
  onPlayerPositionChange: (position: PlayerPosition) => void
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
}

export function AdventureCanvas({
  hoveredBuildingId,
  selectedBuildingId,
  selectedEducationPlaceId,
  onBuildingSelect,
  onEducationSelect,
  onEmptySelect,
  onHoveredBuildingChange,
  onActiveBuildingCountChange,
  onPlayerPositionChange,
  onBuildingBoundsChange,
  onEducationBoundsChange,
}: AdventureCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 13, 11], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.16
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        shadows
      >
        <Suspense fallback={null}>
          <AdventureScene
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuildingId}
            selectedEducationPlaceId={selectedEducationPlaceId}
            onBuildingSelect={onBuildingSelect}
            onEducationSelect={onEducationSelect}
            onEmptySelect={onEmptySelect}
            onHoveredBuildingChange={onHoveredBuildingChange}
            onActiveBuildingCountChange={onActiveBuildingCountChange}
            onPlayerPositionChange={onPlayerPositionChange}
            onBuildingBoundsChange={onBuildingBoundsChange}
            onEducationBoundsChange={onEducationBoundsChange}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
