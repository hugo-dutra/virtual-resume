import { GROUND_SIZE } from './world.constants'

type WallSegment = {
  position: {
    x: number
    y: number
    z: number
  }
  size: {
    x: number
    y: number
    z: number
  }
}

type WallObstacle = {
  position: {
    x: number
    z: number
  }
  size: {
    x: number
    y: number
    z: number
  }
}

const HALF_GROUND_SIZE = GROUND_SIZE / 2
const WALL_HEIGHT = 8
const WALL_THICKNESS = 5
const WALL_INSET = 2.5
const WALL_LENGTH = GROUND_SIZE - WALL_THICKNESS * 2

const PERIMETER_WALL_SEGMENTS: WallSegment[] = [
  {
    position: { x: 0, y: WALL_HEIGHT / 2, z: -HALF_GROUND_SIZE + WALL_INSET },
    size: { x: WALL_LENGTH, y: WALL_HEIGHT, z: WALL_THICKNESS },
  },
  {
    position: { x: 0, y: WALL_HEIGHT / 2, z: HALF_GROUND_SIZE - WALL_INSET },
    size: { x: WALL_LENGTH, y: WALL_HEIGHT, z: WALL_THICKNESS },
  },
  {
    position: { x: -HALF_GROUND_SIZE + WALL_INSET, y: WALL_HEIGHT / 2, z: 0 },
    size: { x: WALL_THICKNESS, y: WALL_HEIGHT, z: WALL_LENGTH },
  },
  {
    position: { x: HALF_GROUND_SIZE - WALL_INSET, y: WALL_HEIGHT / 2, z: 0 },
    size: { x: WALL_THICKNESS, y: WALL_HEIGHT, z: WALL_LENGTH },
  },
]

export function getPerimeterWallObstacles(): WallObstacle[] {
  return PERIMETER_WALL_SEGMENTS.map((segment) => ({
    position: {
      x: segment.position.x,
      z: segment.position.z,
    },
    size: {
      x: segment.size.x,
      y: segment.size.y,
      z: segment.size.z,
    },
  }))
}

export function AdventurePerimeterWall() {
  return (
    <group>
      {PERIMETER_WALL_SEGMENTS.map((segment, index) => (
        <mesh
          key={`perimeter-wall-${index}`}
          castShadow
          receiveShadow
          position={[segment.position.x, segment.position.y, segment.position.z]}
        >
          <boxGeometry args={[segment.size.x, segment.size.y, segment.size.z]} />
          <meshStandardMaterial color="#334155" roughness={0.9} metalness={0.04} />
        </mesh>
      ))}
    </group>
  )
}
