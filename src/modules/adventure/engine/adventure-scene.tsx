import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { AdventureGround } from '../world/adventure-ground'
import { AdventureLighting } from '../world/adventure-lighting'
import { AdventurePostprocessing } from '../world/adventure-postprocessing'
import {
  ACTIVE_REGION_RADIUS,
  CAMERA_FOLLOW_OFFSET,
  MAP_SIZE,
  PLAYER_BASE_SPEED,
  REGION_SIZE,
} from '../world/world.constants'

export type PlayerPosition = {
  x: number
  z: number
}

type AdventureSceneProps = {
  hoveredBuildingId: string | null
  selectedBuildingId: string | null
  onBuildingSelect: (building: Building) => void
  onEmptySelect: () => void
  onHoveredBuildingChange: (buildingId: string | null) => void
  onActiveBuildingCountChange: (count: number) => void
  onPlayerPositionChange: (position: PlayerPosition) => void
}

function getRegionCoordinate(position: number) {
  return Math.floor((position + MAP_SIZE / 2) / REGION_SIZE)
}

export function AdventureScene({
  hoveredBuildingId,
  selectedBuildingId,
  onBuildingSelect,
  onEmptySelect,
  onHoveredBuildingChange,
  onActiveBuildingCountChange,
  onPlayerPositionChange,
}: AdventureSceneProps) {
  const { camera, gl, pointer, raycaster } = useThree()
  const controlsRef = useKeyboardControls()
  const allBuildings = useMemo(() => buildingsData.buildings, [])
  const educationPlaces = useMemo(() => educationPlacesData.places, [])
  const allObstacles = useMemo(() => [...allBuildings, ...educationPlaces], [allBuildings, educationPlaces])
  const allAssets = useMemo(() => adventureAssetsData.assets, [])
  const { world, playerBodyRef } = useAdventurePhysics(allObstacles)

  const [activeRegion, setActiveRegion] = useState(() => ({ x: 0, z: 0 }))

  const playerGroupRef = useRef<Group | null>(null)
  const pointerInsideRef = useRef(false)
  const currentHoveredRef = useRef<string | null>(null)
  const interactiveMeshesRef = useRef<Record<string, Mesh>>({})
  const activeRegionRef = useRef(activeRegion)
  const hudUpdateAccumulatorRef = useRef(0)

  const clickPointer = useMemo(() => new THREE.Vector2(), [])
  const cameraOffset = useMemo(
    () => new THREE.Vector3(CAMERA_FOLLOW_OFFSET.x, CAMERA_FOLLOW_OFFSET.y, CAMERA_FOLLOW_OFFSET.z),
    [],
  )
  const movementVector = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const cameraTargetPosition = useMemo(() => new THREE.Vector3(), [])
  const buildingById = useMemo(() => new Map(allBuildings.map((building) => [building.id, building])), [allBuildings])
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

      return (
        Math.abs(regionX - activeRegion.x) <= ACTIVE_REGION_RADIUS &&
        Math.abs(regionZ - activeRegion.z) <= ACTIVE_REGION_RADIUS
      )
    })
  }, [activeRegion.x, activeRegion.z, educationPlaces])

  const registerInteractiveMesh = useCallback((buildingId: string, mesh: Mesh | null) => {
    if (mesh) {
      interactiveMeshesRef.current[buildingId] = mesh
      return
    }

    delete interactiveMeshesRef.current[buildingId]
  }, [])

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

  const getIntersectedBuildingId = useCallback(
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
          return buildingId
        }
      }

      return null
    },
    [camera, raycaster],
  )

  useEffect(() => {
    camera.position.set(CAMERA_FOLLOW_OFFSET.x, CAMERA_FOLLOW_OFFSET.y, CAMERA_FOLLOW_OFFSET.z)
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

      const buildingId = getIntersectedBuildingId(clickPointer)

      if (!buildingId) {
        onEmptySelect()
        return
      }

      const building = buildingById.get(buildingId)
      if (building) {
        onBuildingSelect(building)
      }
    }

    canvasElement.addEventListener('pointerenter', handlePointerEnter)
    canvasElement.addEventListener('pointerleave', handlePointerLeave)
    canvasElement.addEventListener('click', handleClick)

    return () => {
      canvasElement.removeEventListener('pointerenter', handlePointerEnter)
      canvasElement.removeEventListener('pointerleave', handlePointerLeave)
      canvasElement.removeEventListener('click', handleClick)
      syncHoveredBuilding(null)
    }
  }, [buildingById, clickPointer, getIntersectedBuildingId, gl, onBuildingSelect, onEmptySelect, syncHoveredBuilding])

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
      playerBody.wakeUp()
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
      const hoveredId = getIntersectedBuildingId(pointer)
      syncHoveredBuilding(hoveredId)
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
      <AdventureGround asset={groundAsset} />
      <PlayerEntity groupRef={playerGroupRef} asset={playerAsset} />

      {activeBuildings.map((building) => (
        <BuildingEntity
          key={building.id}
          building={building}
          asset={experienceAssetMap.get(building.experienceId) ?? null}
          isHovered={building.id === hoveredBuildingId}
          isSelected={building.id === selectedBuildingId}
          registerInteractiveMesh={registerInteractiveMesh}
        />
      ))}

      {activeEducationPlaces.map((place: EducationPlace) => (
        <EducationLandmarkEntity
          key={place.id}
          place={place}
          asset={educationAssetMap.get(place.educationId) ?? null}
        />
      ))}

      <AdventurePostprocessing />
    </>
  )
}
