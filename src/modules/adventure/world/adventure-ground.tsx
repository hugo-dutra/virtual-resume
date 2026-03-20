import { MAP_SIZE } from './world.constants'

export function AdventureGround() {
  return (
    <group>
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color="#14532d" roughness={0.92} metalness={0.03} />
      </mesh>

      <gridHelper args={[MAP_SIZE, MAP_SIZE, '#64748b', '#1f2937']} position={[0, 0.01, 0]} />
    </group>
  )
}
