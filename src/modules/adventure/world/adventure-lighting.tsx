import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { DirectionalLight, Group, Object3D } from 'three'
import { GROUND_SIZE } from './world.constants'

const LIGHT_OFFSET = { x: 12, y: 18, z: 6 } as const
const SHADOW_ORTHO_HALF_SIZE = GROUND_SIZE / 2 + 36
const SHADOW_CAMERA_FAR = GROUND_SIZE + 72

type AdventureLightingProps = {
  followTargetRef?: MutableRefObject<Group | null>
}

export function AdventureLighting({ followTargetRef }: AdventureLightingProps) {
  const lightRef = useRef<DirectionalLight | null>(null)
  const shadowTargetRef = useRef<Object3D | null>(null)
  const lightOffset = useMemo(() => LIGHT_OFFSET, [])

  useFrame(() => {
    const followTarget = followTargetRef?.current
    const light = lightRef.current
    const shadowTarget = shadowTargetRef.current

    if (!followTarget || !light || !shadowTarget) {
      return
    }

    const focusX = followTarget.position.x
    const focusZ = followTarget.position.z

    shadowTarget.position.set(focusX, 0, focusZ)
    shadowTarget.updateMatrixWorld()
    light.position.set(focusX + lightOffset.x, lightOffset.y, focusZ + lightOffset.z)
    light.target = shadowTarget
  })

  return (
    <>
      <ambientLight intensity={0.62} color="#dbeafe" />
      <hemisphereLight intensity={0.52} color="#93c5fd" groundColor="#0b3b19" />
      <object3D ref={shadowTargetRef} />

      <directionalLight
        ref={lightRef}
        castShadow
        intensity={1.42}
        position={[LIGHT_OFFSET.x, LIGHT_OFFSET.y, LIGHT_OFFSET.z]}
        color="#f1f5f9"
        shadow-mapSize-height={4096}
        shadow-mapSize-width={4096}
        shadow-bias={-0.00008}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={SHADOW_CAMERA_FAR}
        shadow-camera-left={-SHADOW_ORTHO_HALF_SIZE}
        shadow-camera-right={SHADOW_ORTHO_HALF_SIZE}
        shadow-camera-top={SHADOW_ORTHO_HALF_SIZE}
        shadow-camera-bottom={-SHADOW_ORTHO_HALF_SIZE}
      />
    </>
  )
}
