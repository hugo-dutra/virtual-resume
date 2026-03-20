import { useCallback, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import type { Building } from '../../../data/buildings.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'

type BuildingEntityProps = {
  building: Building
  asset: AdventureAsset | null
  isHovered: boolean
  isSelected: boolean
  registerInteractiveMesh: (buildingId: string, mesh: Mesh | null) => void
}

function createDeterministicPhase(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997
  }

  return (hash / 997) * Math.PI * 2
}

export function BuildingEntity({
  building,
  asset,
  isHovered,
  isSelected,
  registerInteractiveMesh,
}: BuildingEntityProps) {
  const markerRef = useRef<Mesh | null>(null)
  const phase = useMemo(() => createDeterministicPhase(building.id), [building.id])
  const roofTexture = useTexture('/assets/textures/roof-pattern.svg')
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = resolveAssetTransform(asset)

  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(building.id, mesh)
    },
    [building.id, registerInteractiveMesh],
  )

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return
    }

    const activeMultiplier = isHovered || isSelected ? 0.2 : 0
    markerRef.current.position.y =
      building.size.y + 0.55 + Math.sin(clock.elapsedTime * 2 + phase) * (0.14 + activeMultiplier)
  })

  const isActive = isHovered || isSelected

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      <mesh ref={interactiveMeshRef} position={[0, building.size.y / 2, 0]} userData={{ buildingId: building.id }}>
        <boxGeometry args={[building.size.x, building.size.y, building.size.z]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {modelScene ? (
        <primitive object={modelScene} position={offset} rotation={rotation} scale={scale} />
      ) : (
        <mesh castShadow receiveShadow position={[0, building.size.y / 2, 0]}>
          <boxGeometry args={[building.size.x, building.size.y, building.size.z]} />
          <meshStandardMaterial
            color={building.color}
            emissive={isActive ? '#e2e8f0' : '#020617'}
            emissiveIntensity={isHovered ? 0.36 : isSelected ? 0.24 : 0.06}
            roughness={0.35}
          />
        </mesh>
      )}

      <mesh position={[0, building.size.y / 2, 0]} scale={[1.05, 1.05, 1.05]} visible={isActive}>
        <boxGeometry args={[building.size.x, building.size.y, building.size.z]} />
        <meshBasicMaterial color={isHovered ? '#bae6fd' : '#67e8f9'} opacity={0.5} transparent wireframe />
      </mesh>

      {!modelScene ? (
        <mesh receiveShadow position={[0, building.size.y + 0.12, 0]}>
          <boxGeometry args={[building.size.x * 0.88, 0.24, building.size.z * 0.88]} />
          <meshStandardMaterial
            color="#0f172a"
            map={roofTexture}
            map-colorSpace={THREE.SRGBColorSpace}
            map-repeat={[1.2, 1.2]}
            map-wrapS={THREE.RepeatWrapping}
            map-wrapT={THREE.RepeatWrapping}
            roughness={0.8}
            metalness={0.08}
            emissive="#0f172a"
            emissiveIntensity={isHovered ? 0.25 : 0.1}
          />
        </mesh>
      ) : null}

      <mesh ref={markerRef} position={[0, building.size.y + 0.55, 0]}>
        <sphereGeometry args={[isHovered || isSelected ? 0.19 : 0.14, 14, 14]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={isHovered || isSelected ? 2 : 1.2} />
      </mesh>
    </group>
  )
}
