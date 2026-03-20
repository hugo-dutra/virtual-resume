import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'

type EducationLandmarkEntityProps = {
  place: EducationPlace
  asset: AdventureAsset | null
}

function createDeterministicPhase(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 33 + id.charCodeAt(index)) % 997
  }

  return (hash / 997) * Math.PI * 2
}

export function EducationLandmarkEntity({ place, asset }: EducationLandmarkEntityProps) {
  const markerRef = useRef<Mesh | null>(null)
  const phase = useMemo(() => createDeterministicPhase(place.id), [place.id])
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return
    }

    markerRef.current.position.y = place.size.y + 0.46 + Math.sin(clock.elapsedTime * 1.9 + phase) * 0.12
  })

  return (
    <group position={[place.position.x, 0, place.position.z]}>
      {modelScene ? (
        <primitive object={modelScene} position={offset} rotation={rotation} scale={scale} />
      ) : (
        <mesh castShadow receiveShadow position={[0, place.size.y / 2, 0]}>
          <boxGeometry args={[place.size.x, place.size.y, place.size.z]} />
          <meshStandardMaterial color={place.color} emissive="#0f172a" emissiveIntensity={0.18} roughness={0.35} />
        </mesh>
      )}

      <mesh position={[0, place.size.y / 2, 0]} scale={[1.03, 1.03, 1.03]}>
        <boxGeometry args={[place.size.x, place.size.y, place.size.z]} />
        <meshBasicMaterial color="#fde68a" opacity={0.28} transparent wireframe />
      </mesh>

      <mesh ref={markerRef} position={[0, place.size.y + 0.46, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.35} />
      </mesh>
    </group>
  )
}
