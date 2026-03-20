import type { MutableRefObject } from 'react'
import type { Group } from 'three'
import { PLAYER_RADIUS } from '../world/world.constants'

type PlayerEntityProps = {
  groupRef: MutableRefObject<Group | null>
}

export function PlayerEntity({ groupRef }: PlayerEntityProps) {
  return (
    <group ref={groupRef} position={[0, PLAYER_RADIUS, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[PLAYER_RADIUS, 22, 22]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#0369a1" emissiveIntensity={0.25} roughness={0.25} />
      </mesh>

      <mesh castShadow position={[0, PLAYER_RADIUS + 0.1, 0]}>
        <coneGeometry args={[0.24, 0.45, 14]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}
