import { useCallback } from 'react'
import type { Mesh } from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'

type EducationLandmarkEntityProps = {
  place: EducationPlace
  asset: AdventureAsset | null
  isSelected: boolean
  registerInteractiveMesh: (interactiveId: string, mesh: Mesh | null) => void
}

export function EducationLandmarkEntity({
  place,
  asset,
  isSelected,
  registerInteractiveMesh,
}: EducationLandmarkEntityProps) {
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)
  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(place.id, mesh)
    },
    [place.id, registerInteractiveMesh],
  )

  return (
    <group position={[place.position.x, 0, place.position.z]}>
      <mesh ref={interactiveMeshRef} position={[0, place.size.y / 2, 0]} userData={{ educationPlaceId: place.id }}>
        <boxGeometry args={[place.size.x, place.size.y, place.size.z]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {modelScene ? (
        <primitive object={modelScene} position={offset} rotation={rotation} scale={scale} />
      ) : (
        <mesh castShadow receiveShadow position={[0, place.size.y / 2, 0]}>
          <boxGeometry args={[place.size.x, place.size.y, place.size.z]} />
          <meshStandardMaterial
            color={place.color}
            emissive={isSelected ? '#fde68a' : '#0f172a'}
            emissiveIntensity={isSelected ? 0.22 : 0.18}
            roughness={0.35}
          />
        </mesh>
      )}

      <mesh position={[0, place.size.y / 2, 0]} scale={[1.03, 1.03, 1.03]} visible={isSelected}>
        <boxGeometry args={[place.size.x, place.size.y, place.size.z]} />
        <meshBasicMaterial color="#fde68a" opacity={0.46} transparent wireframe />
      </mesh>
    </group>
  )
}
