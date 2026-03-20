import { Canvas } from '@react-three/fiber'
import type { Building } from '../../../data/buildings.schema'
import { AdventureScene } from './adventure-scene'

type AdventureCanvasProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  onBuildingSelect: (building: Building) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
}

export function AdventureCanvas({
  hoveredBuildingId,
  selectedBuildingId,
  onBuildingSelect,
  onEmptySelect,
  onHoveredBuildingChange,
}: AdventureCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 13, 11], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        shadows
      >
        <AdventureScene
          hoveredBuildingId={hoveredBuildingId}
          selectedBuildingId={selectedBuildingId}
          onBuildingSelect={onBuildingSelect}
          onEmptySelect={onEmptySelect}
          onHoveredBuildingChange={onHoveredBuildingChange}
        />
      </Canvas>
    </div>
  )
}
