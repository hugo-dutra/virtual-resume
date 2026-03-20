import type { MutableRefObject } from 'react'
import type { Group } from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'
import { PLAYER_RADIUS } from '../world/world.constants'

type PlayerEntityProps = {
  groupRef: MutableRefObject<Group | null>
  asset: AdventureAsset | null
}

export function PlayerEntity({ groupRef, asset }: PlayerEntityProps) {
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)

  return (
    <group ref={groupRef} position={[0, PLAYER_RADIUS, 0]}>
      {modelScene ? (
        <primitive object={modelScene} position={offset} rotation={rotation} scale={scale} />
      ) : (
        <>
          <mesh castShadow>
            <sphereGeometry args={[PLAYER_RADIUS, 22, 22]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#0369a1" emissiveIntensity={0.25} roughness={0.25} />
          </mesh>

          <mesh castShadow position={[0, PLAYER_RADIUS + 0.1, 0]}>
            <coneGeometry args={[0.24, 0.45, 14]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
    </group>
  )
}
