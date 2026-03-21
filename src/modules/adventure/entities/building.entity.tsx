import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import type { Building } from '../../../data/buildings.schema'
import { resolvePublicAssetPath } from '../../../shared/utils/resolve-public-asset-path'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'

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

type InteractiveBounds = {
  center: [number, number, number]
  size: [number, number, number]
  obstacle: ObstacleBounds
}

const MIN_BOUND_SIZE = 0.1
const BOUNDS_EPSILON = 0.01

function getFallbackBounds(building: Building): InteractiveBounds {
  return {
    center: [0, building.size.y / 2, 0],
    size: [building.size.x, building.size.y, building.size.z],
    obstacle: {
      position: {
        x: building.position.x,
        z: building.position.z,
      },
      size: {
        x: building.size.x,
        y: building.size.y,
        z: building.size.z,
      },
    },
  }
}

function areValuesClose(a: number, b: number) {
  return Math.abs(a - b) <= BOUNDS_EPSILON
}

function areInteractiveBoundsEqual(a: InteractiveBounds, b: InteractiveBounds) {
  return (
    areValuesClose(a.center[0], b.center[0]) &&
    areValuesClose(a.center[1], b.center[1]) &&
    areValuesClose(a.center[2], b.center[2]) &&
    areValuesClose(a.size[0], b.size[0]) &&
    areValuesClose(a.size[1], b.size[1]) &&
    areValuesClose(a.size[2], b.size[2]) &&
    areValuesClose(a.obstacle.position.x, b.obstacle.position.x) &&
    areValuesClose(a.obstacle.position.z, b.obstacle.position.z) &&
    areValuesClose(a.obstacle.size.x, b.obstacle.size.x) &&
    areValuesClose(a.obstacle.size.y, b.obstacle.size.y) &&
    areValuesClose(a.obstacle.size.z, b.obstacle.size.z)
  )
}

function areObstacleBoundsEqual(a: ObstacleBounds | null, b: ObstacleBounds | null) {
  if (!a || !b) {
    return a === b
  }

  return (
    areValuesClose(a.position.x, b.position.x) &&
    areValuesClose(a.position.z, b.position.z) &&
    areValuesClose(a.size.x, b.size.x) &&
    areValuesClose(a.size.y, b.size.y) &&
    areValuesClose(a.size.z, b.size.z)
  )
}

type BuildingEntityProps = {
  building: Building
  asset: AdventureAsset | null
  isHovered: boolean
  isSelected: boolean
  registerInteractiveMesh: (buildingId: string, mesh: Mesh | null) => void
  onObstacleBoundsChange?: (buildingId: string, bounds: ObstacleBounds | null) => void
}

export function BuildingEntity({
  building,
  asset,
  isHovered,
  isSelected,
  registerInteractiveMesh,
  onObstacleBoundsChange,
}: BuildingEntityProps) {
  const roofTexture = useTexture(resolvePublicAssetPath('/assets/textures/roof-pattern.svg'))
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale, collisionScale, collisionOffset } = useMemo(
    () => resolveAssetTransform(asset),
    [asset],
  )
  const modelWrapperRef = useRef<Group | null>(null)
  const publishedObstacleBoundsRef = useRef<ObstacleBounds | null>(null)
  const fallbackBounds = useMemo(() => getFallbackBounds(building), [building])
  const [interactiveBounds, setInteractiveBounds] = useState<InteractiveBounds>(() => fallbackBounds)
  const [offsetX, offsetY, offsetZ] = offset
  const [rotationX, rotationY, rotationZ] = rotation
  const [scaleX, scaleY, scaleZ] = scale
  const [collisionScaleX, collisionScaleY, collisionScaleZ] = collisionScale
  const [collisionOffsetX, collisionOffsetY, collisionOffsetZ] = collisionOffset

  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(building.id, mesh)
    },
    [building.id, registerInteractiveMesh],
  )
  const publishObstacleBounds = useCallback(
    (bounds: ObstacleBounds | null) => {
      if (!onObstacleBoundsChange) {
        return
      }

      if (areObstacleBoundsEqual(publishedObstacleBoundsRef.current, bounds)) {
        return
      }

      publishedObstacleBoundsRef.current = bounds
      onObstacleBoundsChange(building.id, bounds)
    },
    [building.id, onObstacleBoundsChange],
  )

  const isActive = isHovered || isSelected

  useEffect(() => {
    setInteractiveBounds(fallbackBounds)
  }, [fallbackBounds])

  useLayoutEffect(() => {
    if (!modelScene || !modelWrapperRef.current) {
      setInteractiveBounds((currentBounds) =>
        areInteractiveBoundsEqual(currentBounds, fallbackBounds) ? currentBounds : fallbackBounds,
      )
      publishObstacleBounds(fallbackBounds.obstacle)
      return
    }

    modelWrapperRef.current.updateWorldMatrix(true, true)

    const bounds = new THREE.Box3().setFromObject(modelWrapperRef.current)
    if (bounds.isEmpty()) {
      setInteractiveBounds((currentBounds) =>
        areInteractiveBoundsEqual(currentBounds, fallbackBounds) ? currentBounds : fallbackBounds,
      )
      publishObstacleBounds(fallbackBounds.obstacle)
      return
    }

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    bounds.getSize(size)
    bounds.getCenter(center)

    const tunedCenterX = center.x + collisionOffsetX
    const tunedCenterY = center.y + collisionOffsetY
    const tunedCenterZ = center.z + collisionOffsetZ
    const tunedSizeX = Math.max(size.x * Math.max(collisionScaleX, 0), MIN_BOUND_SIZE)
    const tunedSizeY = Math.max(size.y * Math.max(collisionScaleY, 0), MIN_BOUND_SIZE)
    const tunedSizeZ = Math.max(size.z * Math.max(collisionScaleZ, 0), MIN_BOUND_SIZE)

    const nextBounds: InteractiveBounds = {
      center: [tunedCenterX - building.position.x, tunedCenterY, tunedCenterZ - building.position.z],
      size: [tunedSizeX, tunedSizeY, tunedSizeZ],
      obstacle: {
        position: {
          x: tunedCenterX,
          z: tunedCenterZ,
        },
        size: {
          x: tunedSizeX,
          y: tunedSizeY,
          z: tunedSizeZ,
        },
      },
    }

    setInteractiveBounds((currentBounds) =>
      areInteractiveBoundsEqual(currentBounds, nextBounds) ? currentBounds : nextBounds,
    )
    publishObstacleBounds(nextBounds.obstacle)
  }, [
    building.position.x,
    building.position.z,
    fallbackBounds,
    modelScene,
    offsetX,
    offsetY,
    offsetZ,
    publishObstacleBounds,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
    collisionScaleX,
    collisionScaleY,
    collisionScaleZ,
    collisionOffsetX,
    collisionOffsetY,
    collisionOffsetZ,
  ])

  useEffect(() => {
    return () => {
      publishObstacleBounds(null)
    }
  }, [publishObstacleBounds])

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      <mesh ref={interactiveMeshRef} position={interactiveBounds.center} userData={{ buildingId: building.id }}>
        <boxGeometry args={interactiveBounds.size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {modelScene ? (
        <group
          ref={modelWrapperRef}
          position={[offsetX, offsetY, offsetZ]}
          rotation={[rotationX, rotationY, rotationZ]}
          scale={[scaleX, scaleY, scaleZ]}
        >
          <primitive object={modelScene} />
        </group>
      ) : (
        <mesh castShadow receiveShadow position={interactiveBounds.center}>
          <boxGeometry args={interactiveBounds.size} />
          <meshStandardMaterial
            color={building.color}
            emissive={isActive ? '#e2e8f0' : '#020617'}
            emissiveIntensity={isHovered ? 0.36 : isSelected ? 0.24 : 0.06}
            roughness={0.35}
          />
        </mesh>
      )}

      {!modelScene ? (
        <mesh receiveShadow position={[0, building.size.y + 0.12, 0]}>
          <boxGeometry args={[building.size.x * 0.88, 0.24, building.size.z * 0.88]} />
          <meshStandardMaterial
            color="#0f172a"
            map={roofTexture}
            map-colorSpace={THREE.SRGBColorSpace}
            map-repeat={[1.2, 1.2]}
            map-wrapS={THREE.RepeatWrapping}
            map-wrapT={THREE.RepeatWrapping}
            roughness={0.8}
            metalness={0.08}
            emissive="#0f172a"
            emissiveIntensity={isHovered ? 0.25 : 0.1}
          />
        </mesh>
      ) : null}
    </group>
  )
}
