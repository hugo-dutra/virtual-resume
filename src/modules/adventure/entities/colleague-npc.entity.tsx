import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { AnimationAction, AnimationClip, Group, Mesh } from 'three'
import * as THREE from 'three'
import type { Colleague } from '../../../data/colleagues.schema'
import { resolvePublicAssetPath } from '../../../shared/utils/resolve-public-asset-path'
import { useExternalAnimationClips } from '../hooks/use-external-animation-clips'
import { useFbxModelAsset } from '../hooks/use-fbx-model-asset'
import { PLAYER_RADIUS } from '../world/world.constants'

const DEFAULT_MOVEMENT_SPEED = 3.2
const DEFAULT_STOP_DISTANCE = 4.2
const WAYPOINT_REACHED_THRESHOLD = 0.2
const POSITION_PUBLISH_EPSILON = 0.02
const TURN_SMOOTHNESS = 8
const MOVEMENT_IDLE_THRESHOLD = 0.01
const WALK_MOVEMENT_SPEED_THRESHOLD = 0.008
const STEER_SMOOTHNESS = 11
const REVERSE_DIRECTION_DOT_THRESHOLD = -0.2
const REVERSE_STEER_SMOOTHNESS = 24
const WAYPOINT_DIRECT_APPROACH_DISTANCE = 0.45
const DEFAULT_HITBOX = {
  x: 1.3,
  y: 2,
  z: 1.3,
}

type NpcAnimationState = 'idle' | 'walk'

type Position2D = {
  x: number
  z: number
}

type ColleagueNpcEntityProps = {
  colleague: Colleague
  playerGroupRef: MutableRefObject<Group | null>
  isSelected: boolean
  registerInteractiveMesh: (interactiveId: string, mesh: Mesh | null) => void
  onPositionChange?: (colleagueId: string, position: Position2D) => void
}

function arePositionsClose(a: Position2D | null, b: Position2D) {
  if (!a) {
    return false
  }

  return (
    Math.abs(a.x - b.x) <= POSITION_PUBLISH_EPSILON && Math.abs(a.z - b.z) <= POSITION_PUBLISH_EPSILON
  )
}

export function ColleagueNpcEntity({
  colleague,
  playerGroupRef,
  isSelected,
  registerInteractiveMesh,
  onPositionChange,
}: ColleagueNpcEntityProps) {
  const idleAnimationUrl = useMemo(
    () => resolvePublicAssetPath(`/assets/models/${colleague.asset.animations.idle}`),
    [colleague.asset.animations.idle],
  )
  const walkingAnimationUrl = useMemo(
    () => resolvePublicAssetPath(`/assets/models/${colleague.asset.animations.walking}`),
    [colleague.asset.animations.walking],
  )
  const { scene: modelScene, animations: embeddedAnimations, status: modelStatus } = useFbxModelAsset(
    idleAnimationUrl ?? walkingAnimationUrl ?? null,
  )
  const externalClips = useExternalAnimationClips({
    idle: idleAnimationUrl,
    walk: walkingAnimationUrl,
  })
  const groupRef = useRef<Group | null>(null)
  const currentActionRef = useRef<AnimationAction | null>(null)
  const activeAnimationStateRef = useRef<NpcAnimationState | null>(null)
  const waypointIndexRef = useRef(colleague.path.length > 1 ? 1 : 0)
  const publishedPositionRef = useRef<Position2D | null>(null)
  const previousWorldPositionRef = useRef<THREE.Vector3 | null>(null)
  const movementInputRef = useRef(false)
  const targetQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const desiredDirectionVector = useMemo(() => new THREE.Vector3(), [])
  const smoothedDirectionVectorRef = useRef(new THREE.Vector3(0, 0, 1))
  const upAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  const scale = colleague.asset.transform?.scale
  const offset = colleague.asset.transform?.offset
  const rotationY = colleague.asset.transform?.rotationY ?? 0
  const modelOffsetX = offset?.x ?? 0
  const modelOffsetY = offset?.y ?? 0
  const modelOffsetZ = offset?.z ?? 0
  const hitbox = colleague.interaction?.hitbox ?? DEFAULT_HITBOX
  const waypoints = useMemo(
    () =>
      colleague.path.map(
        (point) => new THREE.Vector3(point.x - modelOffsetX, PLAYER_RADIUS, point.z - modelOffsetZ),
      ),
    [colleague.path, modelOffsetX, modelOffsetZ],
  )
  const firstEmbeddedClip = embeddedAnimations[0]
  const embeddedWalkClip = embeddedAnimations[1] ?? firstEmbeddedClip
  const requiresExternalIdleClip = Boolean(idleAnimationUrl)
  const requiresExternalWalkClip = Boolean(walkingAnimationUrl)
  const areRequiredExternalClipsReady =
    (!requiresExternalIdleClip || Boolean(externalClips.idle)) &&
    (!requiresExternalWalkClip || Boolean(externalClips.walk))
  const resolvedClips = useMemo(() => {
    const idle = requiresExternalIdleClip ? externalClips.idle : externalClips.idle ?? firstEmbeddedClip
    const walk = requiresExternalWalkClip ? externalClips.walk : externalClips.walk ?? embeddedWalkClip ?? idle

    return { idle, walk }
  }, [
    embeddedWalkClip,
    externalClips.idle,
    externalClips.walk,
    firstEmbeddedClip,
    requiresExternalIdleClip,
    requiresExternalWalkClip,
  ])

  const animationSet = useMemo(() => {
    if (!modelScene || !areRequiredExternalClipsReady) {
      return []
    }

    const set: AnimationClip[] = []

    if (resolvedClips.idle) {
      const idleClip = resolvedClips.idle.clone()
      idleClip.name = 'state-idle'
      set.push(idleClip)
    }

    if (resolvedClips.walk) {
      const walkClip = resolvedClips.walk.clone()
      walkClip.name = 'state-walk'
      set.push(walkClip)
    }

    return set
  }, [areRequiredExternalClipsReady, modelScene, resolvedClips.idle, resolvedClips.walk])

  const { actions } = useAnimations(animationSet, modelScene ?? undefined)
  const hasRequiredAnimationActions = Boolean(actions['state-idle']) && Boolean(actions['state-walk'])
  const isAnimationReady = Boolean(modelScene) && animationSet.length > 0 && hasRequiredAnimationActions

  const playState = useCallback(
    (state: NpcAnimationState) => {
      const idleAction = actions['state-idle']
      const walkAction = actions['state-walk']
      const nextAction = state === 'walk' ? walkAction ?? idleAction : idleAction
      const resolvedState: NpcAnimationState = nextAction === walkAction ? 'walk' : 'idle'

      if (!nextAction) {
        return
      }

      if (currentActionRef.current === nextAction) {
        if (!nextAction.isRunning()) {
          nextAction.play()
        }

        activeAnimationStateRef.current = resolvedState
        return
      }

      nextAction.setLoop(THREE.LoopRepeat, Infinity)
      nextAction.setEffectiveTimeScale(resolvedState === 'walk' ? 1 : 0.9)
      nextAction.setEffectiveWeight(1)
      nextAction.reset().fadeIn(0.12).play()

      if (currentActionRef.current && currentActionRef.current !== nextAction) {
        currentActionRef.current.fadeOut(0.12)
      }

      currentActionRef.current = nextAction
      activeAnimationStateRef.current = resolvedState
    },
    [actions],
  )

  const publishPosition = useCallback(
    (position: Position2D) => {
      if (!onPositionChange) {
        return
      }

      if (arePositionsClose(publishedPositionRef.current, position)) {
        return
      }

      publishedPositionRef.current = position
      onPositionChange(colleague.id, position)
    },
    [colleague.id, onPositionChange],
  )

  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(colleague.id, mesh)
    },
    [colleague.id, registerInteractiveMesh],
  )

  useEffect(() => {
    const startPoint = waypoints[0]
    const group = groupRef.current
    if (!startPoint || !group) {
      return
    }

    group.position.copy(startPoint)
    waypointIndexRef.current = waypoints.length > 1 ? 1 : 0
    publishedPositionRef.current = null
    previousWorldPositionRef.current = null
    if (waypoints.length > 1) {
      const initialDirection = waypoints[1].clone().sub(waypoints[0])
      initialDirection.y = 0
      if (initialDirection.lengthSq() > 0.0001) {
        smoothedDirectionVectorRef.current.copy(initialDirection.normalize())
      }
    }
    publishPosition({
      x: startPoint.x + modelOffsetX,
      z: startPoint.z + modelOffsetZ,
    })
  }, [modelOffsetX, modelOffsetZ, publishPosition, waypoints])

  useEffect(() => {
    if (!isAnimationReady) {
      return
    }

    currentActionRef.current = null
    activeAnimationStateRef.current = null
    previousWorldPositionRef.current = null
    const initialState: NpcAnimationState = movementInputRef.current ? 'walk' : 'idle'
    playState(initialState)

    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.1)
      }
    }
  }, [animationSet, isAnimationReady, playState])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) {
      return
    }

    const stopDistance = colleague.interaction?.stopDistance ?? DEFAULT_STOP_DISTANCE
    const movementSpeed = colleague.movementSpeed ?? DEFAULT_MOVEMENT_SPEED
    const player = playerGroupRef.current

    const npcWorldX = group.position.x + modelOffsetX
    const npcWorldZ = group.position.z + modelOffsetZ
    const distanceToPlayer = player
      ? Math.hypot(player.position.x - npcWorldX, player.position.z - npcWorldZ)
      : Number.POSITIVE_INFINITY
    const shouldStayIdle = distanceToPlayer <= stopDistance

    let movedDistance = 0

    if (!shouldStayIdle && waypoints.length > 1) {
      let targetWaypoint = waypoints[waypointIndexRef.current]

      if (targetWaypoint) {
        let directionX = targetWaypoint.x - group.position.x
        let directionZ = targetWaypoint.z - group.position.z
        let remainingDistance = Math.hypot(directionX, directionZ)

        if (remainingDistance <= WAYPOINT_REACHED_THRESHOLD) {
          waypointIndexRef.current = (waypointIndexRef.current + 1) % waypoints.length
          targetWaypoint = waypoints[waypointIndexRef.current]
          directionX = targetWaypoint.x - group.position.x
          directionZ = targetWaypoint.z - group.position.z
          remainingDistance = Math.hypot(directionX, directionZ)
        }

        if (remainingDistance > 0.0001) {
          desiredDirectionVector.set(directionX, 0, directionZ).normalize()
          const currentDirection = smoothedDirectionVectorRef.current
          const directionAlignment = currentDirection.dot(desiredDirectionVector)

          if (directionAlignment <= REVERSE_DIRECTION_DOT_THRESHOLD) {
            const reverseSteerLerpFactor = 1 - Math.exp(-REVERSE_STEER_SMOOTHNESS * delta)
            currentDirection.lerp(desiredDirectionVector, reverseSteerLerpFactor).normalize()
          } else {
            const steerLerpFactor = 1 - Math.exp(-STEER_SMOOTHNESS * delta)
            currentDirection.lerp(desiredDirectionVector, steerLerpFactor).normalize()
          }

          const travelDirection =
            remainingDistance <= WAYPOINT_DIRECT_APPROACH_DISTANCE
              ? desiredDirectionVector
              : currentDirection
          const movementStep = Math.min(movementSpeed * delta, remainingDistance)
          group.position.x += travelDirection.x * movementStep
          group.position.z += travelDirection.z * movementStep
          movedDistance = movementStep

          const targetYaw = Math.atan2(travelDirection.x, travelDirection.z)
          targetQuaternion.setFromAxisAngle(upAxis, targetYaw)
          const turnLerpFactor = 1 - Math.exp(-TURN_SMOOTHNESS * delta)
          group.quaternion.slerp(targetQuaternion, turnLerpFactor)
        }
      }
    }

    movementInputRef.current = !shouldStayIdle && movedDistance > MOVEMENT_IDLE_THRESHOLD

    if (isAnimationReady) {
      let movementSpeedFromPosition = 0
      if (previousWorldPositionRef.current) {
        movementSpeedFromPosition = group.position.distanceTo(previousWorldPositionRef.current)
      }

      if (previousWorldPositionRef.current) {
        previousWorldPositionRef.current.copy(group.position)
      } else {
        previousWorldPositionRef.current = group.position.clone()
      }

      const isMoving =
        movementInputRef.current || movementSpeedFromPosition > WALK_MOVEMENT_SPEED_THRESHOLD
      const desiredState: NpcAnimationState = isMoving ? 'walk' : 'idle'
      if (activeAnimationStateRef.current !== desiredState) {
        playState(desiredState)
      }
    }

    publishPosition({
      x: group.position.x + modelOffsetX,
      z: group.position.z + modelOffsetZ,
    })
  })

  const modelScale: [number, number, number] = [scale?.x ?? 1, scale?.y ?? 1, scale?.z ?? 1]
  const modelOffset: [number, number, number] = [modelOffsetX, modelOffsetY, modelOffsetZ]
  const shouldRenderFallbackGeometry = !modelScene && modelStatus === 'error'

  return (
    <group ref={groupRef} position={[waypoints[0]?.x ?? 0, PLAYER_RADIUS, waypoints[0]?.z ?? 0]}>
      <mesh
        ref={interactiveMeshRef}
        position={[modelOffsetX, hitbox.y / 2 + modelOffsetY, modelOffsetZ]}
        userData={{ colleagueId: colleague.id }}
      >
        <boxGeometry args={[hitbox.x, hitbox.y, hitbox.z]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {modelScene ? (
        <primitive object={modelScene} position={modelOffset} rotation={[0, rotationY, 0]} scale={modelScale} />
      ) : null}

      {shouldRenderFallbackGeometry ? (
        <mesh castShadow receiveShadow position={[0, hitbox.y / 2, 0]}>
          <capsuleGeometry args={[0.45, 0.9, 6, 12]} />
          <meshStandardMaterial
            color="#2dd4bf"
            emissive={isSelected ? '#ccfbf1' : '#042f2e'}
            emissiveIntensity={isSelected ? 0.32 : 0.16}
            roughness={0.36}
          />
        </mesh>
      ) : null}
    </group>
  )
}
