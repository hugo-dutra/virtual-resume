import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'
import { MAP_SIZE } from './world.constants'

const TERRAIN_TEXTURE_PATH = '/assets/textures/terrain-pattern.svg'

type AdventureGroundProps = {
  asset: AdventureAsset | null
}

export function AdventureGround({ asset }: AdventureGroundProps) {
  const terrainTexture = useTexture(TERRAIN_TEXTURE_PATH)
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)

  return (
    <group>
      {modelScene ? (
        <primitive object={modelScene} position={offset} rotation={rotation} scale={scale} />
      ) : (
        <>
          <mesh receiveShadow rotation-x={-Math.PI / 2}>
            <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
            <meshStandardMaterial
              color="#14532d"
              map={terrainTexture}
              map-anisotropy={8}
              map-colorSpace={THREE.SRGBColorSpace}
              map-repeat={[6, 6]}
              map-wrapS={THREE.RepeatWrapping}
              map-wrapT={THREE.RepeatWrapping}
              roughness={0.92}
              metalness={0.03}
            />
          </mesh>

          <gridHelper args={[MAP_SIZE, MAP_SIZE, '#64748b', '#1f2937']} position={[0, 0.01, 0]} />
        </>
      )}
    </group>
  )
}
