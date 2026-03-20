import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useAnimations } from '@react-three/drei'
import type { AnimationAction, AnimationClip, Group } from 'three'
import * as THREE from 'three'
import type { AdventureAsset } from '../../../data/adventure-assets.schema'
import { useExternalAnimationClips } from '../hooks/use-external-animation-clips'
import { useFbxModelAsset } from '../hooks/use-fbx-model-asset'
import { useModelAsset } from '../hooks/use-model-asset'
import { getAssetModelUrl, getPlayerAnimationUrls, resolveAssetTransform } from '../utils/adventure-asset-resolver'
import { PLAYER_RADIUS } from '../world/world.constants'

export type PlayerAnimationState = 'idle' | 'walk' | 'run'

type PlayerEntityProps = {
  groupRef: MutableRefObject<Group | null>
  asset: AdventureAsset | null
  animationState: PlayerAnimationState
}

function normalizeClipName(name: string) {
  return name.toLowerCase().replaceAll(/[\s_-]+/g, '')
}

function findEmbeddedClip(animations: AnimationClip[], keywords: string[]) {
  const normalizedPairs = animations.map((clip) => ({ clip, normalized: normalizeClipName(clip.name) }))
  return normalizedPairs.find((entry) => keywords.some((keyword) => entry.normalized.includes(keyword)))?.clip
}

export function PlayerEntity({ groupRef, asset, animationState }: PlayerEntityProps) {
  const modelUrl = getAssetModelUrl(asset)
  const { scene: modelScene, animations } = useModelAsset(modelUrl)
  const animationUrls = useMemo(() => getPlayerAnimationUrls(asset), [asset])
  const fallbackModelUrl = animationUrls.idle ?? animationUrls.walk ?? animationUrls.run ?? null
  const { scene: fallbackModelScene, animations: fallbackModelAnimations } = useFbxModelAsset(fallbackModelUrl)
  const externalClips = useExternalAnimationClips(animationUrls)
  const { offset, rotation, scale } = resolveAssetTransform(asset)
  const currentActionRef = useRef<AnimationAction | null>(null)
  const resolvedModelScene = modelScene ?? fallbackModelScene
  const sourceAnimations = animations.length > 0 ? animations : fallbackModelAnimations
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
      walk: findEmbeddedClip(sourceAnimations, ['walk', 'locomotion']),
      run: findEmbeddedClip(sourceAnimations, ['run', 'sprint', 'jog']),
    }
  }, [sourceAnimations])
  const resolvedClips = useMemo(() => {
    const idle = externalClips.idle ?? embeddedClips.idle
    const walk =
      externalClips.walk ??
      embeddedClips.walk ??
      externalClips.run ??
      embeddedClips.run ??
      externalClips.idle ??
      embeddedClips.idle
    const run =
      externalClips.run ??
      embeddedClips.run ??
      externalClips.walk ??
      embeddedClips.walk ??
      externalClips.idle ??
      embeddedClips.idle

    return { idle, walk, run }
  }, [embeddedClips.idle, embeddedClips.run, embeddedClips.walk, externalClips.idle, externalClips.run, externalClips.walk])
  const animationSet = useMemo(() => {
    const set: AnimationClip[] = []
    const pushStateClip = (state: PlayerAnimationState, clip: AnimationClip | undefined) => {
      if (!clip) {
        return
      }

      const clone = clip.clone()
      clone.name = `state-${state}`
      set.push(clone)
    }

    pushStateClip('idle', resolvedClips.idle)
    pushStateClip('walk', resolvedClips.walk)
    pushStateClip('run', resolvedClips.run)

    return set
  }, [resolvedClips.idle, resolvedClips.run, resolvedClips.walk])
  const { actions } = useAnimations(animationSet, groupRef)

  useEffect(() => {
    if (!resolvedModelScene || animationSet.length === 0) {
      return
    }

    const primaryActionName = `state-${animationState}`
    const fallbackActionName = animationSet[0]?.name
    const nextAction = actions[primaryActionName] ?? (fallbackActionName ? actions[fallbackActionName] : undefined)
    if (!nextAction) {
      return
    }

    nextAction.reset().fadeIn(0.16).play()

    if (currentActionRef.current && currentActionRef.current !== nextAction) {
      currentActionRef.current.fadeOut(0.16)
    }

    currentActionRef.current = nextAction

    return () => {
      if (currentActionRef.current === nextAction) {
        nextAction.fadeOut(0.16)
      }
    }
  }, [actions, animationSet, animationState, resolvedModelScene])

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
