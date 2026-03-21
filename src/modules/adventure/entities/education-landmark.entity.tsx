import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import type { EducationPlace } from '../../../data/education-places.schema'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, resolveAssetTransform } from '../utils/adventure-asset-resolver'

type EducationProximityBounds = {
  position: {
    x: number
    z: number
  }
  size: {
    x: number
    z: number
  }
}

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
  proximity: EducationProximityBounds
  obstacle: ObstacleBounds
}

const MIN_BOUND_SIZE = 0.1
const BOUNDS_EPSILON = 0.01

function getFallbackBounds(place: EducationPlace): InteractiveBounds {
  return {
    center: [0, place.size.y / 2, 0],
    size: [place.size.x, place.size.y, place.size.z],
    proximity: {
      position: {
        x: place.position.x,
        z: place.position.z,
      },
      size: {
        x: place.size.x,
        z: place.size.z,
      },
    },
    obstacle: {
      position: {
        x: place.position.x,
        z: place.position.z,
      },
      size: {
        x: place.size.x,
        y: place.size.y,
        z: place.size.z,
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
    areValuesClose(a.proximity.position.x, b.proximity.position.x) &&
    areValuesClose(a.proximity.position.z, b.proximity.position.z) &&
    areValuesClose(a.proximity.size.x, b.proximity.size.x) &&
    areValuesClose(a.proximity.size.z, b.proximity.size.z) &&
    areValuesClose(a.obstacle.position.x, b.obstacle.position.x) &&
    areValuesClose(a.obstacle.position.z, b.obstacle.position.z) &&
    areValuesClose(a.obstacle.size.x, b.obstacle.size.x) &&
    areValuesClose(a.obstacle.size.y, b.obstacle.size.y) &&
    areValuesClose(a.obstacle.size.z, b.obstacle.size.z)
  )
}

function areProximityBoundsEqual(a: EducationProximityBounds | null, b: EducationProximityBounds | null) {
  if (!a || !b) {
    return a === b
  }

  return (
    areValuesClose(a.position.x, b.position.x) &&
    areValuesClose(a.position.z, b.position.z) &&
    areValuesClose(a.size.x, b.size.x) &&
    areValuesClose(a.size.z, b.size.z)
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

type EducationLandmarkEntityProps = {
  place: EducationPlace
  asset: AdventureAsset | null
  isSelected: boolean
  registerInteractiveMesh: (interactiveId: string, mesh: Mesh | null) => void
  onBoundsChange?: (placeId: string, bounds: EducationProximityBounds | null) => void
  onObstacleBoundsChange?: (placeId: string, bounds: ObstacleBounds | null) => void
}

export function EducationLandmarkEntity({
  place,
  asset,
  isSelected,
  registerInteractiveMesh,
  onBoundsChange,
  onObstacleBoundsChange,
}: EducationLandmarkEntityProps) {
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene } = useModelAsset(modelUrl)
  const { offset, rotation, scale } = useMemo(() => resolveAssetTransform(asset), [asset])
  const modelWrapperRef = useRef<Group | null>(null)
  const publishedBoundsRef = useRef<EducationProximityBounds | null>(null)
  const publishedObstacleBoundsRef = useRef<ObstacleBounds | null>(null)
  const fallbackBounds = useMemo(() => getFallbackBounds(place), [place])
  const [interactiveBounds, setInteractiveBounds] = useState<InteractiveBounds>(() => fallbackBounds)
  const [offsetX, offsetY, offsetZ] = offset
  const [rotationX, rotationY, rotationZ] = rotation
  const [scaleX, scaleY, scaleZ] = scale
  const interactiveMeshRef = useCallback(
    (mesh: Mesh | null) => {
      registerInteractiveMesh(place.id, mesh)
    },
    [place.id, registerInteractiveMesh],
  )
  const publishBounds = useCallback(
    (bounds: EducationProximityBounds | null) => {
      if (!onBoundsChange) {
        return
      }

      if (areProximityBoundsEqual(publishedBoundsRef.current, bounds)) {
        return
      }

      publishedBoundsRef.current = bounds
      onBoundsChange(place.id, bounds)
    },
    [onBoundsChange, place.id],
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
      onObstacleBoundsChange(place.id, bounds)
    },
    [onObstacleBoundsChange, place.id],
  )

  useEffect(() => {
    setInteractiveBounds(fallbackBounds)
  }, [fallbackBounds])

  useLayoutEffect(() => {
    if (!modelScene || !modelWrapperRef.current) {
      setInteractiveBounds((currentBounds) =>
        areInteractiveBoundsEqual(currentBounds, fallbackBounds) ? currentBounds : fallbackBounds,
      )
      publishBounds(fallbackBounds.proximity)
      publishObstacleBounds(fallbackBounds.obstacle)
      return
    }

    modelWrapperRef.current.updateWorldMatrix(true, true)

    const bounds = new THREE.Box3().setFromObject(modelWrapperRef.current)
    if (bounds.isEmpty()) {
      setInteractiveBounds((currentBounds) =>
        areInteractiveBoundsEqual(currentBounds, fallbackBounds) ? currentBounds : fallbackBounds,
      )
      publishBounds(fallbackBounds.proximity)
      publishObstacleBounds(fallbackBounds.obstacle)
      return
    }

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    bounds.getSize(size)
    bounds.getCenter(center)

    const nextBounds: InteractiveBounds = {
      center: [center.x - place.position.x, center.y, center.z - place.position.z],
      size: [Math.max(size.x, MIN_BOUND_SIZE), Math.max(size.y, MIN_BOUND_SIZE), Math.max(size.z, MIN_BOUND_SIZE)],
      proximity: {
        position: {
          x: center.x,
          z: center.z,
        },
        size: {
          x: Math.max(size.x, MIN_BOUND_SIZE),
          z: Math.max(size.z, MIN_BOUND_SIZE),
        },
      },
      obstacle: {
        position: {
          x: center.x,
          z: center.z,
        },
        size: {
          x: Math.max(size.x, MIN_BOUND_SIZE),
          y: Math.max(size.y, MIN_BOUND_SIZE),
          z: Math.max(size.z, MIN_BOUND_SIZE),
        },
      },
    }

    setInteractiveBounds((currentBounds) =>
      areInteractiveBoundsEqual(currentBounds, nextBounds) ? currentBounds : nextBounds,
    )
    publishBounds(nextBounds.proximity)
    publishObstacleBounds(nextBounds.obstacle)
  }, [
    fallbackBounds,
    modelScene,
    offsetX,
    offsetY,
    offsetZ,
    place.position.x,
    place.position.z,
    publishBounds,
    publishObstacleBounds,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
  ])

  useEffect(() => {
    return () => {
      publishBounds(null)
      publishObstacleBounds(null)
    }
  }, [publishBounds, publishObstacleBounds])

  return (
    <group position={[place.position.x, 0, place.position.z]}>
      <mesh ref={interactiveMeshRef} position={interactiveBounds.center} userData={{ educationPlaceId: place.id }}>
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
            color={place.color}
            emissive={isSelected ? '#fde68a' : '#0f172a'}
            emissiveIntensity={isSelected ? 0.22 : 0.18}
            roughness={0.35}
          />
        </mesh>
      )}

    </group>
  )
}
