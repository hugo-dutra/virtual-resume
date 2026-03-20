import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Building } from '../../../data/buildings.schema'

type BuildingEntityProps = {
  building: Building
  onSelect: (building: Building) => void
}

function createDeterministicPhase(id: string) {
  let hash = 0

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997
  }

  return (hash / 997) * Math.PI * 2
}

export function BuildingEntity({ building, onSelect }: BuildingEntityProps) {
  const [hovered, setHovered] = useState(false)
  const markerRef = useRef<Mesh | null>(null)
  const phase = useMemo(() => createDeterministicPhase(building.id), [building.id])

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return
    }

    markerRef.current.position.y = building.size.y + 0.55 + Math.sin(clock.elapsedTime * 2 + phase) * 0.14
  })

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(building)
  }

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      <mesh
        castShadow
        receiveShadow
        position={[0, building.size.y / 2, 0]}
        onClick={handleSelect}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[building.size.x, building.size.y, building.size.z]} />
        <meshStandardMaterial
          color={building.color}
          emissive={hovered ? '#e2e8f0' : '#020617'}
          emissiveIntensity={hovered ? 0.24 : 0.06}
          roughness={0.35}
        />
      </mesh>

      <mesh receiveShadow position={[0, building.size.y + 0.12, 0]}>
        <boxGeometry args={[building.size.x * 0.88, 0.24, building.size.z * 0.88]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <mesh ref={markerRef} position={[0, building.size.y + 0.55, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
