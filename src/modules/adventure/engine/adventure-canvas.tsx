import { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import type { Building } from '../../../data/buildings.schema'
import { AdventureScene, type PlayerPosition } from './adventure-scene'

type AdventureCanvasProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  onBuildingSelect: (building: Building) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
  onActiveBuildingCountChange: (count: number) => void
  onPlayerPositionChange: (position: PlayerPosition) => void
}

export function AdventureCanvas({
  hoveredBuildingId,
  selectedBuildingId,
  onBuildingSelect,
  onEmptySelect,
  onHoveredBuildingChange,
  onActiveBuildingCountChange,
  onPlayerPositionChange,
}: AdventureCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 13, 11], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.06
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        shadows
      >
        <Suspense fallback={null}>
          <AdventureScene
            hoveredBuildingId={hoveredBuildingId}
            selectedBuildingId={selectedBuildingId}
            onBuildingSelect={onBuildingSelect}
            onEmptySelect={onEmptySelect}
            onHoveredBuildingChange={onHoveredBuildingChange}
            onActiveBuildingCountChange={onActiveBuildingCountChange}
            onPlayerPositionChange={onPlayerPositionChange}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
