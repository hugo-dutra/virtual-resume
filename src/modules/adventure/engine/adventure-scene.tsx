import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import * as THREE from 'three'
import { buildingsData } from '../../../data/buildings'
import type { Building } from '../../../data/buildings.schema'
import { useKeyboardControls } from '../hooks/use-keyboard-controls'
import { useAdventurePhysics } from '../systems/use-adventure-physics'
import { BuildingEntity } from '../entities/building.entity'
import { PlayerEntity } from '../entities/player.entity'
import { AdventureGround } from '../world/adventure-ground'
import { AdventureLighting } from '../world/adventure-lighting'
import { CAMERA_FOLLOW_OFFSET, PLAYER_BASE_SPEED } from '../world/world.constants'

type AdventureSceneProps = {
  onBuildingSelect: (building: Building) => void
}

export function AdventureScene({ onBuildingSelect }: AdventureSceneProps) {
  const { camera } = useThree()
  const controlsRef = useKeyboardControls()
  const { world, playerBodyRef } = useAdventurePhysics(buildingsData.buildings)

  const playerGroupRef = useRef<Group | null>(null)

  const cameraOffset = useMemo(
    () => new THREE.Vector3(CAMERA_FOLLOW_OFFSET.x, CAMERA_FOLLOW_OFFSET.y, CAMERA_FOLLOW_OFFSET.z),
    [],
  )
  const movementVector = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const cameraTargetPosition = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    camera.position.set(CAMERA_FOLLOW_OFFSET.x, CAMERA_FOLLOW_OFFSET.y, CAMERA_FOLLOW_OFFSET.z)
  }, [camera])

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current
    if (!playerBody) {
      return
    }

    const controls = controlsRef.current
    const axisX = Number(controls.right) - Number(controls.left)
    const axisZ = Number(controls.backward) - Number(controls.forward)

    movementVector.set(axisX, 0, axisZ)
    const isMoving = movementVector.lengthSq() > 0

    if (isMoving) {
      const speed = controls.sprint ? PLAYER_BASE_SPEED * 1.35 : PLAYER_BASE_SPEED
      movementVector.normalize().multiplyScalar(speed)
    } else {
      movementVector.set(0, 0, 0)
    }

    playerBody.velocity.x = movementVector.x
    playerBody.velocity.z = movementVector.z

    world.step(1 / 60, delta, 4)

    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(playerBody.position.x, playerBody.position.y, playerBody.position.z)

      if (isMoving) {
        playerGroupRef.current.rotation.y = Math.atan2(movementVector.x, movementVector.z)
      }
    }

    target.set(playerBody.position.x, 0.6, playerBody.position.z)
    cameraTargetPosition.copy(target).add(cameraOffset)

    const followStrength = 1 - Math.exp(-6 * delta)
    camera.position.lerp(cameraTargetPosition, followStrength)
    camera.lookAt(target)
  })

  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 18, 70]} />

      <AdventureLighting />
      <AdventureGround />
      <PlayerEntity groupRef={playerGroupRef} />

      {buildingsData.buildings.map((building) => (
        <BuildingEntity key={building.id} building={building} onSelect={onBuildingSelect} />
      ))}
    </>
  )
}
