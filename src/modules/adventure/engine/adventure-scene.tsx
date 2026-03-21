import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'
import { adventureAssetsData } from '../../../data/adventure-assets'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import { buildingsData } from '../../../data/buildings'
import type { Building } from '../../../data/buildings.schema'
import { educationPlacesData } from '../../../data/education-places'
import type { EducationPlace } from '../../../data/education-places.schema'
import { BuildingEntity } from '../entities/building.entity'
import { EducationLandmarkEntity } from '../entities/education-landmark.entity'
import { PlayerEntity } from '../entities/player.entity'
import { useKeyboardControls } from '../hooks/use-keyboard-controls'
import { useAdventurePhysics } from '../systems/use-adventure-physics'
import type { TouchMoveVector } from '../ui/adventure-touch-joystick'
import { AdventureGround } from '../world/adventure-ground'
import { AdventureLighting } from '../world/adventure-lighting'
import { AdventurePerimeterWall, getPerimeterWallObstacles } from '../world/adventure-perimeter-wall'
import { AdventurePostprocessing } from '../world/adventure-postprocessing'
import {
  ACTIVE_REGION_RADIUS,
  CAMERA_FOLLOW_OFFSET,
  GROUND_SIZE,
  MAP_SIZE,
  PLAYER_BASE_SPEED,
  PLAYER_RADIUS,
  REGION_SIZE,
} from '../world/world.constants'

const PLAYER_TURN_SMOOTHNESS = 7
const PLAYER_STEER_SMOOTHNESS = 11
const PLAYER_REVERSE_DIRECTION_DOT_THRESHOLD = -0.2
const PLAYER_REVERSE_STEER_SMOOTHNESS = 24
const MIN_OBSTACLE_HEIGHT = PLAYER_RADIUS * 2 + 0.3
const OBSTACLE_BOUNDS_EPSILON = 0.01
const MIN_DYNAMIC_OBSTACLE_SIZE = 0.1
const HALF_GROUND_SIZE = GROUND_SIZE / 2
const DYNAMIC_OBSTACLE_EDGE_MARGIN = 0.5
const MAX_DYNAMIC_OBSTACLE_SIZE = GROUND_SIZE - DYNAMIC_OBSTACLE_EDGE_MARGIN * 2
const MIN_CAMERA_ZOOM_FACTOR = 1
const MAX_CAMERA_ZOOM_FACTOR = 3
const INITIAL_CAMERA_ZOOM_FACTOR = MAX_CAMERA_ZOOM_FACTOR

type ObstacleBounds = {
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

type StaticObstacle = {
  id: string
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

function areObstacleBoundsEqual(a: ObstacleBounds | undefined, b: ObstacleBounds) {
  if (!a) {
    return false
  }

  return (
    Math.abs(a.position.x - b.position.x) <= OBSTACLE_BOUNDS_EPSILON &&
    Math.abs(a.position.z - b.position.z) <= OBSTACLE_BOUNDS_EPSILON &&
    Math.abs(a.size.x - b.size.x) <= OBSTACLE_BOUNDS_EPSILON &&
    Math.abs(a.size.y - b.size.y) <= OBSTACLE_BOUNDS_EPSILON &&
    Math.abs(a.size.z - b.size.z) <= OBSTACLE_BOUNDS_EPSILON
  )
}

type InteractiveTarget =
  | {
      kind: 'building'
      id: string
    }
  | {
      kind: 'education'
      id: string
    }

export type PlayerPosition = {
  x: number
  z: number
}

type AdventureSceneProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  selectedEducationPlaceId: string | null
  onBuildingSelect: (building: Building) => void
  onEducationSelect: (place: EducationPlace) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
  onActiveBuildingCountChange: (count: number) => void
  onPlayerPositionChange: (position: PlayerPosition) => void
  onBuildingBoundsChange?: (
    buildingId: string,
    bounds: {
      position: {
        x: number
        z: number
      }
      size: {
        x: number
        z: number
      }
    } | null,
  ) => void
  onEducationBoundsChange?: (
    placeId: string,
    bounds: {
      position: {
        x: number
        z: number
      }
      size: {
        x: number
        z: number
      }
    } | null,
  ) => void
  touchControlsRef?: MutableRefObject<TouchMoveVector>
}

function getRegionCoordinate(position: number) {
  return Math.floor((position + MAP_SIZE / 2) / REGION_SIZE)
}

function sanitizeDynamicObstacleBounds(
  obstacle: StaticObstacle,
  bounds: ObstacleBounds | null,
): ObstacleBounds | null {
  if (!bounds) {
    return null
  }

  const hasInvalidPosition =
    !Number.isFinite(bounds.position.x) || !Number.isFinite(bounds.position.z)
  const hasInvalidSize =
    !Number.isFinite(bounds.size.x) ||
    !Number.isFinite(bounds.size.y) ||
    !Number.isFinite(bounds.size.z)

  if (hasInvalidPosition || hasInvalidSize) {
    return null
  }

  const maxCenterCoordinate = HALF_GROUND_SIZE - DYNAMIC_OBSTACLE_EDGE_MARGIN
  const clampedSizeX = THREE.MathUtils.clamp(bounds.size.x, MIN_DYNAMIC_OBSTACLE_SIZE, MAX_DYNAMIC_OBSTACLE_SIZE)
  const clampedSizeY = THREE.MathUtils.clamp(bounds.size.y, MIN_DYNAMIC_OBSTACLE_SIZE, MAX_DYNAMIC_OBSTACLE_SIZE)
  const clampedSizeZ = THREE.MathUtils.clamp(bounds.size.z, MIN_DYNAMIC_OBSTACLE_SIZE, MAX_DYNAMIC_OBSTACLE_SIZE)

  return {
    position: {
      x: THREE.MathUtils.clamp(bounds.position.x, -maxCenterCoordinate, maxCenterCoordinate),
      z: THREE.MathUtils.clamp(bounds.position.z, -maxCenterCoordinate, maxCenterCoordinate),
    },
    size: {
      x: Math.max(clampedSizeX, obstacle.size.x),
      y: Math.max(clampedSizeY, obstacle.size.y, MIN_OBSTACLE_HEIGHT),
      z: Math.max(clampedSizeZ, obstacle.size.z),
    },
  }
}

export function AdventureScene({
  hoveredBuildingId,
  selectedBuildingId,
  selectedEducationPlaceId,
  onBuildingSelect,
  onEducationSelect,
  onEmptySelect,
  onHoveredBuildingChange,
  onActiveBuildingCountChange,
  onPlayerPositionChange,
  onBuildingBoundsChange,
  onEducationBoundsChange,
  touchControlsRef,
}: AdventureSceneProps) {
  const { camera, gl, pointer, raycaster } = useThree()
  const controlsRef = useKeyboardControls()
  const allBuildings = useMemo(() => buildingsData.buildings, [])
  const educationPlaces = useMemo(() => educationPlacesData.places, [])
  const [dynamicObstacleBoundsById, setDynamicObstacleBoundsById] = useState<Record<string, ObstacleBounds>>({})
  const [isPlayerAnimationReady, setIsPlayerAnimationReady] = useState(false)
  const staticObstacles = useMemo<StaticObstacle[]>(
    () => [...allBuildings, ...educationPlaces],
    [allBuildings, educationPlaces],
  )
  const perimeterWallObstacles = useMemo(() => getPerimeterWallObstacles(), [])
  const obstacleById = useMemo(
    () => new Map(staticObstacles.map((obstacle) => [obstacle.id, obstacle])),
    [staticObstacles],
  )
  const allObstacles = useMemo(() => {
    const dynamicAwareObstacles = staticObstacles.map((obstacle) => {
      const dynamicBounds = dynamicObstacleBoundsById[obstacle.id]
      if (!dynamicBounds) {
        return obstacle
      }

      return {
        position: {
          x: dynamicBounds.position.x,
          z: dynamicBounds.position.z,
        },
        size: {
          x: dynamicBounds.size.x,
          y: Math.max(dynamicBounds.size.y, obstacle.size.y, MIN_OBSTACLE_HEIGHT),
          z: dynamicBounds.size.z,
        },
      }
    })

    return [...dynamicAwareObstacles, ...perimeterWallObstacles]
  }, [dynamicObstacleBoundsById, perimeterWallObstacles, staticObstacles])
  const allAssets = useMemo(() => adventureAssetsData.assets, [])
  const { world, playerBodyRef } = useAdventurePhysics(allObstacles)

  const [activeRegion, setActiveRegion] = useState(() => ({ x: 0, z: 0 }))

  const playerGroupRef = useRef<Group | null>(null)
  const pointerInsideRef = useRef(false)
  const currentHoveredRef = useRef<string | null>(null)
  const interactiveMeshesRef = useRef<Record<string, Mesh>>({})
  const activeRegionRef = useRef(activeRegion)
  const movementInputRef = useRef(false)
  const hudUpdateAccumulatorRef = useRef(0)
  const cameraZoomFactorRef = useRef(INITIAL_CAMERA_ZOOM_FACTOR)
  const targetCameraZoomFactorRef = useRef(INITIAL_CAMERA_ZOOM_FACTOR)

  const clickPointer = useMemo(() => new THREE.Vector2(), [])
  const cameraOffset = useMemo(
    () => new THREE.Vector3(CAMERA_FOLLOW_OFFSET.x, CAMERA_FOLLOW_OFFSET.y, CAMERA_FOLLOW_OFFSET.z),
    [],
  )
  const zoomedCameraOffset = useMemo(() => new THREE.Vector3(), [])
  const movementVector = useMemo(() => new THREE.Vector3(), [])
  const desiredDirectionVector = useMemo(() => new THREE.Vector3(), [])
  const smoothedDirectionVectorRef = useRef(new THREE.Vector3(0, 0, 1))
  const upAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const targetOrientationQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const cameraTargetPosition = useMemo(() => new THREE.Vector3(), [])
  const buildingById = useMemo(() => new Map(allBuildings.map((building) => [building.id, building])), [allBuildings])
  const educationPlaceById = useMemo(() => new Map(educationPlaces.map((place) => [place.id, place])), [educationPlaces])
  const playerAsset = useMemo(
    () => allAssets.find((asset) => asset.category === 'player') ?? null,
    [allAssets],
  )
  const groundAsset = useMemo(
    () => allAssets.find((asset) => asset.category === 'ground') ?? null,
    [allAssets],
  )
  const experienceAssetMap = useMemo(() => {
    const map = new Map<string, AdventureAsset>()

    for (const asset of allAssets) {
      if (asset.category === 'experience') {
        map.set(asset.relationId, asset)
      }
    }

    return map
  }, [allAssets])
  const educationAssetMap = useMemo(() => {
    const map = new Map<string, AdventureAsset>()

    for (const asset of allAssets) {
      if (asset.category === 'education') {
        map.set(asset.relationId, asset)
      }
    }

    return map
  }, [allAssets])

  const activeBuildings = useMemo(() => {
    return allBuildings.filter((building) => {
      const regionX = getRegionCoordinate(building.position.x)
      const regionZ = getRegionCoordinate(building.position.z)

      const isWithinRegionRange =
        Math.abs(regionX - activeRegion.x) <= ACTIVE_REGION_RADIUS &&
        Math.abs(regionZ - activeRegion.z) <= ACTIVE_REGION_RADIUS

      return isWithinRegionRange || building.id === selectedBuildingId
    })
  }, [activeRegion.x, activeRegion.z, allBuildings, selectedBuildingId])
  const activeEducationPlaces = useMemo(() => {
    return educationPlaces.filter((place) => {
      const regionX = getRegionCoordinate(place.position.x)
      const regionZ = getRegionCoordinate(place.position.z)

      const isWithinRegionRange =
        Math.abs(regionX - activeRegion.x) <= ACTIVE_REGION_RADIUS &&
        Math.abs(regionZ - activeRegion.z) <= ACTIVE_REGION_RADIUS

      return isWithinRegionRange || place.id === selectedEducationPlaceId
    })
  }, [activeRegion.x, activeRegion.z, educationPlaces, selectedEducationPlaceId])

  const registerInteractiveMesh = useCallback((buildingId: string, mesh: Mesh | null) => {
    if (mesh) {
      interactiveMeshesRef.current[buildingId] = mesh
      return
    }

    delete interactiveMeshesRef.current[buildingId]
  }, [])
  const handlePlayerAnimationReadyChange = useCallback((ready: boolean) => {
    setIsPlayerAnimationReady(ready)
  }, [])
  const handleObstacleBoundsChange = useCallback(
    (obstacleId: string, bounds: ObstacleBounds | null) => {
      const staticObstacle = obstacleById.get(obstacleId)
      const sanitizedBounds = staticObstacle ? sanitizeDynamicObstacleBounds(staticObstacle, bounds) : null

      if (onBuildingBoundsChange && buildingById.has(obstacleId)) {
        onBuildingBoundsChange(
          obstacleId,
          sanitizedBounds
            ? {
                position: {
                  x: sanitizedBounds.position.x,
                  z: sanitizedBounds.position.z,
                },
                size: {
                  x: sanitizedBounds.size.x,
                  z: sanitizedBounds.size.z,
                },
              }
            : null,
        )
      }

      setDynamicObstacleBoundsById((currentBounds) => {
        const currentValue = currentBounds[obstacleId]

        if (!sanitizedBounds) {
          if (!currentValue) {
            return currentBounds
          }

          const nextBounds = { ...currentBounds }
          delete nextBounds[obstacleId]
          return nextBounds
        }

        if (areObstacleBoundsEqual(currentValue, sanitizedBounds)) {
          return currentBounds
        }

        return {
          ...currentBounds,
          [obstacleId]: sanitizedBounds,
        }
      })
    },
    [buildingById, obstacleById, onBuildingBoundsChange],
  )

  const syncHoveredBuilding = useCallback(
    (buildingId: string | null) => {
      if (currentHoveredRef.current === buildingId) {
        return
      }

      currentHoveredRef.current = buildingId
      onHoveredBuildingChange(buildingId)
    },
    [onHoveredBuildingChange],
  )

  const getIntersectedTarget = useCallback(
    (sourcePointer: THREE.Vector2) => {
      const meshes = Object.values(interactiveMeshesRef.current)
      if (meshes.length === 0) {
        return null
      }

      raycaster.setFromCamera(sourcePointer, camera)
      const intersections = raycaster.intersectObjects(meshes, false)

      for (const intersection of intersections) {
        const buildingId = intersection.object.userData?.buildingId
        if (typeof buildingId === 'string') {
          return {
            kind: 'building',
            id: buildingId,
          } as InteractiveTarget
        }

        const educationPlaceId = intersection.object.userData?.educationPlaceId
        if (typeof educationPlaceId === 'string') {
          return {
            kind: 'education',
            id: educationPlaceId,
          } as InteractiveTarget
        }
      }

      return null
    },
    [camera, raycaster],
  )

  useEffect(() => {
    camera.position.set(
      CAMERA_FOLLOW_OFFSET.x * INITIAL_CAMERA_ZOOM_FACTOR,
      CAMERA_FOLLOW_OFFSET.y * INITIAL_CAMERA_ZOOM_FACTOR,
      CAMERA_FOLLOW_OFFSET.z * INITIAL_CAMERA_ZOOM_FACTOR,
    )
  }, [camera])

  useEffect(() => {
    onActiveBuildingCountChange(activeBuildings.length)
  }, [activeBuildings.length, onActiveBuildingCountChange])

  useEffect(() => {
    if (hoveredBuildingId && !activeBuildings.some((building) => building.id === hoveredBuildingId)) {
      syncHoveredBuilding(null)
    }
  }, [activeBuildings, hoveredBuildingId, syncHoveredBuilding])

  useEffect(() => {
    const canvasElement = gl.domElement

    const handlePointerEnter = () => {
      pointerInsideRef.current = true
    }

    const handlePointerLeave = () => {
      pointerInsideRef.current = false
      syncHoveredBuilding(null)
    }

    const handleClick = (event: MouseEvent) => {
      const rect = canvasElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return
      }

      clickPointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )

      const targetEntity = getIntersectedTarget(clickPointer)

      if (!targetEntity) {
        onEmptySelect()
        return
      }

      if (targetEntity.kind === 'building') {
        const building = buildingById.get(targetEntity.id)
        if (building) {
          onBuildingSelect(building)
        }
        return
      }

      if (targetEntity.kind === 'education') {
        const place = educationPlaceById.get(targetEntity.id)
        if (place) {
          onEducationSelect(place)
        }
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (!pointerInsideRef.current) {
        return
      }

      event.preventDefault()
      const zoomDelta = event.deltaY * 0.0015
      targetCameraZoomFactorRef.current = THREE.MathUtils.clamp(
        targetCameraZoomFactorRef.current + zoomDelta,
        MIN_CAMERA_ZOOM_FACTOR,
        MAX_CAMERA_ZOOM_FACTOR,
      )
    }

    canvasElement.addEventListener('pointerenter', handlePointerEnter)
    canvasElement.addEventListener('pointerleave', handlePointerLeave)
    canvasElement.addEventListener('click', handleClick)
    canvasElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvasElement.removeEventListener('pointerenter', handlePointerEnter)
      canvasElement.removeEventListener('pointerleave', handlePointerLeave)
      canvasElement.removeEventListener('click', handleClick)
      canvasElement.removeEventListener('wheel', handleWheel)
      syncHoveredBuilding(null)
    }
  }, [
    buildingById,
    clickPointer,
    educationPlaceById,
    getIntersectedTarget,
    gl,
    onBuildingSelect,
    onEducationSelect,
    onEmptySelect,
    syncHoveredBuilding,
  ])

  useFrame((_, delta) => {
    const playerBody = playerBodyRef.current
    if (!playerBody) {
      return
    }

    const controls = controlsRef.current
    const touchControls = touchControlsRef?.current
    const keyboardAxisX = Number(controls.right) - Number(controls.left)
    const keyboardAxisZ = Number(controls.backward) - Number(controls.forward)
    const touchAxisX = touchControls?.x ?? 0
    const touchAxisZ = touchControls?.y ?? 0
    const axisX = THREE.MathUtils.clamp(keyboardAxisX + touchAxisX, -1, 1)
    const axisZ = THREE.MathUtils.clamp(keyboardAxisZ + touchAxisZ, -1, 1)
    const keyboardHasMovementInput = controls.forward || controls.backward || controls.left || controls.right
    const touchHasMovementInput = Math.abs(touchAxisX) > 0.04 || Math.abs(touchAxisZ) > 0.04
    const hasMovementInput = isPlayerAnimationReady && (keyboardHasMovementInput || touchHasMovementInput)
    movementInputRef.current = hasMovementInput

    desiredDirectionVector.set(isPlayerAnimationReady ? axisX : 0, 0, isPlayerAnimationReady ? axisZ : 0)
    const hasDirection = desiredDirectionVector.lengthSq() > 0.0001

    if (hasDirection) {
      desiredDirectionVector.normalize()
      const currentDirection = smoothedDirectionVectorRef.current
      const directionAlignment = currentDirection.dot(desiredDirectionVector)

      if (directionAlignment <= PLAYER_REVERSE_DIRECTION_DOT_THRESHOLD) {
        // Keep smoothing but turn much faster on opposite input to avoid forward overshoot.
        const reverseSteerLerpFactor = 1 - Math.exp(-PLAYER_REVERSE_STEER_SMOOTHNESS * delta)
        currentDirection.lerp(desiredDirectionVector, reverseSteerLerpFactor).normalize()
      } else {
        const steerLerpFactor = 1 - Math.exp(-PLAYER_STEER_SMOOTHNESS * delta)
        currentDirection.lerp(desiredDirectionVector, steerLerpFactor).normalize()
      }
    }

    if (hasDirection) {
      const isSprintActive = controls.sprint || Boolean(touchControls?.sprint)
      const speed = isSprintActive ? PLAYER_BASE_SPEED * 1.35 : PLAYER_BASE_SPEED
      movementVector.copy(smoothedDirectionVectorRef.current).multiplyScalar(speed)
      playerBody.wakeUp()
    } else {
      movementVector.set(0, 0, 0)
    }

    playerBody.velocity.x = movementVector.x
    playerBody.velocity.z = movementVector.z

    world.step(1 / 60, delta, 4)

    // Keep player glued to the ground plane to avoid vertical drift from obstacle resolution.
    playerBody.position.y = PLAYER_RADIUS
    playerBody.velocity.y = 0

    if (playerGroupRef.current) {
      playerGroupRef.current.position.set(playerBody.position.x, playerBody.position.y + PLAYER_RADIUS, playerBody.position.z)

      if (hasDirection) {
        const targetYaw = Math.atan2(smoothedDirectionVectorRef.current.x, smoothedDirectionVectorRef.current.z)
        targetOrientationQuaternion.setFromAxisAngle(upAxis, targetYaw)
        const turnLerpFactor = 1 - Math.exp(-PLAYER_TURN_SMOOTHNESS * delta)
        playerGroupRef.current.quaternion.slerp(targetOrientationQuaternion, turnLerpFactor)
      }
    }

    const nextRegion = {
      x: getRegionCoordinate(playerBody.position.x),
      z: getRegionCoordinate(playerBody.position.z),
    }

    if (nextRegion.x !== activeRegionRef.current.x || nextRegion.z !== activeRegionRef.current.z) {
      activeRegionRef.current = nextRegion
      setActiveRegion(nextRegion)
    }

    hudUpdateAccumulatorRef.current += delta
    if (hudUpdateAccumulatorRef.current >= 1 / 15) {
      hudUpdateAccumulatorRef.current = 0
      onPlayerPositionChange({
        x: playerBody.position.x,
        z: playerBody.position.z,
      })
    }

    if (pointerInsideRef.current) {
      const hoveredTarget = getIntersectedTarget(pointer)
      syncHoveredBuilding(hoveredTarget?.kind === 'building' ? hoveredTarget.id : null)
    }

    target.set(playerBody.position.x, 0.6, playerBody.position.z)
    cameraZoomFactorRef.current = THREE.MathUtils.damp(
      cameraZoomFactorRef.current,
      targetCameraZoomFactorRef.current,
      10,
      delta,
    )
    zoomedCameraOffset.copy(cameraOffset).multiplyScalar(cameraZoomFactorRef.current)
    cameraTargetPosition.copy(target).add(zoomedCameraOffset)

    const followStrength = 1 - Math.exp(-6 * delta)
    camera.position.lerp(cameraTargetPosition, followStrength)
    camera.lookAt(target)
  })

  return (
    <>
      <color attach="background" args={['#081a2b']} />

      <AdventureLighting followTargetRef={playerGroupRef} />
      <AdventureGround asset={groundAsset} />
      <AdventurePerimeterWall />
      <PlayerEntity
        groupRef={playerGroupRef}
        asset={playerAsset}
        movementInputRef={movementInputRef}
        onAnimationReadyChange={handlePlayerAnimationReadyChange}
      />

      {activeBuildings.map((building) => (
        <BuildingEntity
          key={building.id}
          building={building}
          asset={experienceAssetMap.get(building.experienceId) ?? null}
          isHovered={building.id === hoveredBuildingId}
          isSelected={building.id === selectedBuildingId}
          registerInteractiveMesh={registerInteractiveMesh}
          onObstacleBoundsChange={handleObstacleBoundsChange}
        />
      ))}

      {activeEducationPlaces.map((place: EducationPlace) => (
        <EducationLandmarkEntity
          key={place.id}
          place={place}
          asset={educationAssetMap.get(place.educationId) ?? null}
          isSelected={place.id === selectedEducationPlaceId}
          registerInteractiveMesh={registerInteractiveMesh}
          onBoundsChange={onEducationBoundsChange}
          onObstacleBoundsChange={handleObstacleBoundsChange}
        />
      ))}

      <AdventurePostprocessing />
    </>
  )
}
