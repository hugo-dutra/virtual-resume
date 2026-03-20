import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as CANNON from 'cannon-es'
import type { Building } from '../../../data/buildings.schema'
import { MAP_SIZE, PLAYER_RADIUS } from '../world/world.constants'

const HALF_MAP_SIZE = MAP_SIZE / 2
const WALL_HEIGHT = 2
const WALL_THICKNESS = 0.6

type UseAdventurePhysicsResult = {
  world: CANNON.World
  playerBodyRef: MutableRefObject<CANNON.Body | null>
}

export function useAdventurePhysics(buildings: Building[]): UseAdventurePhysicsResult {
  const world = useMemo(() => {
    const instance = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) })
    instance.broadphase = new CANNON.SAPBroadphase(instance)
    instance.allowSleep = false
    instance.defaultContactMaterial.friction = 0
    instance.defaultContactMaterial.restitution = 0
    return instance
  }, [])

  const playerBodyRef = useRef<CANNON.Body | null>(null)

  useEffect(() => {
    const bodies: CANNON.Body[] = []

    const playerBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(PLAYER_RADIUS),
      position: new CANNON.Vec3(0, PLAYER_RADIUS, HALF_MAP_SIZE - 6),
      linearDamping: 0.72,
      angularDamping: 1,
      fixedRotation: true,
      allowSleep: false,
    })

    playerBody.updateMassProperties()
    world.addBody(playerBody)
    playerBodyRef.current = playerBody
    bodies.push(playerBody)

    for (const building of buildings) {
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(building.size.x / 2, building.size.y / 2, building.size.z / 2)),
        position: new CANNON.Vec3(building.position.x, building.size.y / 2, building.position.z),
      })

      world.addBody(body)
      bodies.push(body)
    }

    const walls = [
      { x: HALF_MAP_SIZE, z: 0, sx: WALL_THICKNESS, sz: HALF_MAP_SIZE },
      { x: -HALF_MAP_SIZE, z: 0, sx: WALL_THICKNESS, sz: HALF_MAP_SIZE },
      { x: 0, z: HALF_MAP_SIZE, sx: HALF_MAP_SIZE, sz: WALL_THICKNESS },
      { x: 0, z: -HALF_MAP_SIZE, sx: HALF_MAP_SIZE, sz: WALL_THICKNESS },
    ]

    for (const wall of walls) {
      const wallBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(wall.sx, WALL_HEIGHT / 2, wall.sz)),
        position: new CANNON.Vec3(wall.x, WALL_HEIGHT / 2, wall.z),
      })

      world.addBody(wallBody)
      bodies.push(wallBody)
    }

    return () => {
      for (const body of bodies) {
        world.removeBody(body)
      }
      playerBodyRef.current = null
    }
  }, [buildings, world])

  return { world, playerBodyRef }
}
