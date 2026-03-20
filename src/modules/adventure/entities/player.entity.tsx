import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { AnimationAction, AnimationClip, Group } from 'three'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import { useExternalAnimationClips } from '../hooks/use-external-animation-clips'
import { useFbxModelAsset } from '../hooks/use-fbx-model-asset'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, getPlayerAnimationUrls, resolveAssetTransform } from '../utils/adventure-asset-resolver'
import { PLAYER_RADIUS } from '../world/world.constants'

type PlayerAnimationState = 'idle' | 'run'

type PlayerEntityProps = {
  groupRef: MutableRefObject<Group | null>
  asset: AdventureAsset | null
  movementInputRef: MutableRefObject<boolean>
}

function normalizeClipName(name: string) {
  return name.toLowerCase().replaceAll(/[\s_-]+/g, '')
}

function findEmbeddedClip(animations: AnimationClip[], keywords: string[]) {
  const normalizedPairs = animations.map((clip) => ({ clip, normalized: normalizeClipName(clip.name) }))
  return normalizedPairs.find((entry) => keywords.some((keyword) => entry.normalized.includes(keyword)))?.clip
}

export function PlayerEntity({ groupRef, asset, movementInputRef }: PlayerEntityProps) {
  const modelUrl = getAssetModelUrl(asset)
  const { scene: glbScene, animations: glbAnimations } = useModelAsset(modelUrl)
  const animationUrls = useMemo(() => getPlayerAnimationUrls(asset), [asset])
  const { scene: idleFbxScene, animations: idleFbxAnimations } = useFbxModelAsset(animationUrls.idle ?? null)
  const { scene: runFbxScene, animations: runFbxAnimations } = useFbxModelAsset(animationUrls.run ?? null)
  const externalClips = useExternalAnimationClips(animationUrls)
  const { offset, rotation, scale } = resolveAssetTransform(asset)
  const currentActionRef = useRef<AnimationAction | null>(null)
  const activeStateRef = useRef<PlayerAnimationState | null>(null)

  const resolvedModelScene = glbScene ?? idleFbxScene ?? runFbxScene
  const sourceAnimations =
    glbAnimations.length > 0 ? glbAnimations : idleFbxAnimations.length > 0 ? idleFbxAnimations : runFbxAnimations

  const normalizedModelTransform = useMemo(() => {
    if (!resolvedModelScene) {
      return {
        scaleMultiplier: 1,
        groundedOffsetY: 0,
      }
    }

    resolvedModelScene.updateWorldMatrix(true, true)
    const bounds = new THREE.Box3().setFromObject(resolvedModelScene)
    if (bounds.isEmpty()) {
      return {
        scaleMultiplier: 1,
        groundedOffsetY: 0,
      }
    }

    const size = new THREE.Vector3()
    bounds.getSize(size)

    const targetHeight = 1.8
    const scaleMultiplier = size.y > 0 ? targetHeight / size.y : 1
    const groundedOffsetY = -bounds.min.y * scaleMultiplier

    return { scaleMultiplier, groundedOffsetY }
  }, [resolvedModelScene])

  const finalModelScale = useMemo(
    () =>
      [scale[0], scale[1], scale[2]].map(
        (axisScale) => axisScale * normalizedModelTransform.scaleMultiplier,
      ) as [number, number, number],
    [normalizedModelTransform.scaleMultiplier, scale],
  )

  const finalModelPosition = useMemo(
    () => [offset[0], offset[1] + normalizedModelTransform.groundedOffsetY, offset[2]] as [number, number, number],
    [normalizedModelTransform.groundedOffsetY, offset],
  )

  const embeddedClips = useMemo(() => {
    const firstClip = sourceAnimations[0]

    return {
      idle: findEmbeddedClip(sourceAnimations, ['idle']) ?? firstClip,
      run: findEmbeddedClip(sourceAnimations, ['run', 'sprint', 'jog']) ?? sourceAnimations[1] ?? firstClip,
    }
  }, [sourceAnimations])

  const resolvedClips = useMemo(() => {
    const idle = externalClips.idle ?? embeddedClips.idle
    const run = externalClips.run ?? embeddedClips.run ?? idle
    return { idle, run }
  }, [embeddedClips.idle, embeddedClips.run, externalClips.idle, externalClips.run])

  const animationSet = useMemo(() => {
    if (!resolvedModelScene) {
      return []
    }

    const set: AnimationClip[] = []

    const idleClip = resolvedClips.idle
    if (idleClip) {
      const clone = idleClip.clone()
      clone.name = 'state-idle'
      set.push(clone)
    }

    const runClip = resolvedClips.run
    if (runClip) {
      const clone = runClip.clone()
      clone.name = 'state-run'
      set.push(clone)
    }

    return set
  }, [resolvedClips.idle, resolvedClips.run, resolvedModelScene])

  const { actions } = useAnimations(animationSet, resolvedModelScene ?? undefined)

  const playState = useCallback(
    (state: PlayerAnimationState) => {
      const nextAction = actions[`state-${state}`] ?? actions['state-idle'] ?? actions['state-run']
      if (!nextAction) {
        return
      }

      if (currentActionRef.current === nextAction) {
        if (!nextAction.isRunning()) {
          nextAction.play()
        }
        activeStateRef.current = state
        return
      }

      nextAction.setLoop(THREE.LoopRepeat, Infinity)
      nextAction.setEffectiveTimeScale(0.75)
      nextAction.setEffectiveWeight(1)
      nextAction.reset().fadeIn(0.12).play()

      if (currentActionRef.current && currentActionRef.current !== nextAction) {
        currentActionRef.current.fadeOut(0.12)
      }

      currentActionRef.current = nextAction
      activeStateRef.current = state
    },
    [actions],
  )

  useEffect(() => {
    if (!resolvedModelScene || animationSet.length === 0) {
      return
    }

    const initialState: PlayerAnimationState = movementInputRef.current ? 'run' : 'idle'
    playState(initialState)

    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.1)
      }
    }
  }, [animationSet.length, movementInputRef, playState, resolvedModelScene])

  useFrame(() => {
    if (!resolvedModelScene || animationSet.length === 0) {
      return
    }

    const desiredState: PlayerAnimationState = movementInputRef.current ? 'run' : 'idle'
    if (activeStateRef.current !== desiredState) {
      playState(desiredState)
    }
  })

  return (
    <group ref={groupRef} position={[0, PLAYER_RADIUS, 0]}>
      {resolvedModelScene ? (
        <>
          <primitive object={resolvedModelScene} position={finalModelPosition} rotation={rotation} scale={finalModelScale} />
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={1.15} />
          </mesh>
        </>
      ) : (
        <>
          <mesh castShadow>
            <sphereGeometry args={[PLAYER_RADIUS, 22, 22]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#0369a1" emissiveIntensity={0.25} roughness={0.25} />
          </mesh>

          <mesh castShadow position={[0, PLAYER_RADIUS + 0.1, 0]}>
            <coneGeometry args={[0.24, 0.45, 14]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
    </group>
  )
}
