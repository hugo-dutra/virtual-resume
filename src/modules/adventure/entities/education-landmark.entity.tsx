import { useCallback, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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

function createDeterministicPhase(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 33 + id.charCodeAt(index)) % 997
  }

  return (hash / 997) * Math.PI * 2
}

export function EducationLandmarkEntity({
  place,
  asset,
  isSelected,
  registerInteractiveMesh,
}: EducationLandmarkEntityProps) {
  const markerRef = useRef<Mesh | null>(null)
  const phase = useMemo(() => createDeterministicPhase(place.id), [place.id])
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)
  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(place.id, mesh)
    },
    [place.id, registerInteractiveMesh],
  )

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return
    }

    const selectedBoost = isSelected ? 0.14 : 0
    markerRef.current.position.y = place.size.y + 0.46 + Math.sin(clock.elapsedTime * 1.9 + phase) * (0.12 + selectedBoost)
  })

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

      <mesh ref={markerRef} position={[0, place.size.y + 0.46, 0]}>
        <sphereGeometry args={[isSelected ? 0.16 : 0.12, 12, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={isSelected ? 1.9 : 1.35} />
      </mesh>
    </group>
  )
}
