import { Canvas } from '@react-three/fiber'
import type { Building } from '../../../data/buildings.schema'
import { AdventureScene } from './adventure-scene'

type AdventureCanvasProps = {
  onBuildingSelect: (building: Building) => void
}

export function AdventureCanvas({ onBuildingSelect }: AdventureCanvasProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 13, 11], fov: 45, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        shadows
      >
        <AdventureScene onBuildingSelect={onBuildingSelect} />
      </Canvas>
    </div>
  )
}
