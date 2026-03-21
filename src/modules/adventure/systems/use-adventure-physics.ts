import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as CANNON from 'cannon-es'
import { GROUND_SIZE, MAP_SIZE, PLAYER_RADIUS } from '../world/world.constants'

const HALF_MAP_SIZE = MAP_SIZE / 2
const HALF_GROUND_SIZE = GROUND_SIZE / 2
const WALL_HEIGHT = 2
const WALL_THICKNESS = 0.6
const PLAYER_START_X = 0.5
const PLAYER_START_Z = HALF_MAP_SIZE + 20

type UseAdventurePhysicsResult = {
  world: CANNON.World
  playerBodyRef: MutableRefObject<CANNON.Body | null>
}

type ObstacleSpec = {
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

function isFiniteObstacle(obstacle: ObstacleSpec) {
  return (
    Number.isFinite(obstacle.position.x) &&
    Number.isFinite(obstacle.position.z) &&
    Number.isFinite(obstacle.size.x) &&
    Number.isFinite(obstacle.size.y) &&
    Number.isFinite(obstacle.size.z) &&
    obstacle.size.x > 0 &&
    obstacle.size.y > 0 &&
    obstacle.size.z > 0
  )
}

export function useAdventurePhysics(obstacles: ObstacleSpec[]): UseAdventurePhysicsResult {
  const world = useMemo(() => {
    const instance = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) })
    instance.broadphase = new CANNON.SAPBroadphase(instance)
    instance.allowSleep = false
    instance.defaultContactMaterial.friction = 0
    instance.defaultContactMaterial.restitution = 0
    return instance
  }, [])

  const playerBodyRef = useRef<CANNON.Body | null>(null)
  const obstacleBodiesRef = useRef<CANNON.Body[]>([])
  const wallBodiesRef = useRef<CANNON.Body[]>([])

  useEffect(() => {
    const playerBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(PLAYER_RADIUS),
      position: new CANNON.Vec3(PLAYER_START_X, PLAYER_RADIUS, PLAYER_START_Z),
      linearDamping: 0.72,
      angularDamping: 1,
      fixedRotation: true,
      allowSleep: false,
    })

    playerBody.updateMassProperties()
    world.addBody(playerBody)
    playerBodyRef.current = playerBody

    const walls = [
      { x: HALF_GROUND_SIZE, z: 0, sx: WALL_THICKNESS, sz: HALF_GROUND_SIZE },
      { x: -HALF_GROUND_SIZE, z: 0, sx: WALL_THICKNESS, sz: HALF_GROUND_SIZE },
      { x: 0, z: HALF_GROUND_SIZE, sx: HALF_GROUND_SIZE, sz: WALL_THICKNESS },
      { x: 0, z: -HALF_GROUND_SIZE, sx: HALF_GROUND_SIZE, sz: WALL_THICKNESS },
    ]

    const wallBodies: CANNON.Body[] = []

    for (const wall of walls) {
      const wallBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(wall.sx, WALL_HEIGHT / 2, wall.sz)),
        position: new CANNON.Vec3(wall.x, WALL_HEIGHT / 2, wall.z),
      })

      world.addBody(wallBody)
      wallBodies.push(wallBody)
    }

    wallBodiesRef.current = wallBodies

    return () => {
      for (const wallBody of wallBodiesRef.current) {
        world.removeBody(wallBody)
      }
      wallBodiesRef.current = []

      world.removeBody(playerBody)
      playerBodyRef.current = null
    }
  }, [world])

  useEffect(() => {
    const validObstacles = obstacles.filter(isFiniteObstacle)

    const nextObstacleBodies = validObstacles.map((obstacle) => {
      return new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(obstacle.size.x / 2, obstacle.size.y / 2, obstacle.size.z / 2)),
        position: new CANNON.Vec3(obstacle.position.x, obstacle.size.y / 2, obstacle.position.z),
      })
    })

    for (const body of nextObstacleBodies) {
      world.addBody(body)
    }

    obstacleBodiesRef.current = nextObstacleBodies

    return () => {
      for (const body of nextObstacleBodies) {
        world.removeBody(body)
      }

      if (obstacleBodiesRef.current === nextObstacleBodies) {
        obstacleBodiesRef.current = []
      }
    }
  }, [obstacles, world])

  return { world, playerBodyRef }
}
