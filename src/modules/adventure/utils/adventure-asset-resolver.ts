import type { AdventureAsset } from '../../../data/adventure-assets.schema'

type Vector3Tuple = [number, number, number]
type AnimationState = 'idle' | 'walk' | 'run'

export type AssetTransform = {
  scale: Vector3Tuple
  offset: Vector3Tuple
  rotation: Vector3Tuple
}

export function getAssetModelUrl(asset: AdventureAsset | null) {
  if (!asset) {
    return null
  }

  return `/assets/models/${asset.assetId}.${asset.format}`
}

export function resolveAssetTransform(asset: AdventureAsset | null): AssetTransform {
  const scale = asset?.transform?.scale
  const offset = asset?.transform?.offset
  const rotationY = asset?.transform?.rotationY ?? 0

  return {
    scale: [scale?.x ?? 1, scale?.y ?? 1, scale?.z ?? 1],
    offset: [offset?.x ?? 0, offset?.y ?? 0, offset?.z ?? 0],
    rotation: [0, rotationY, 0],
  }
}

export function getPlayerAnimationUrls(asset: AdventureAsset | null): Partial<Record<AnimationState, string>> {
  if (!asset || asset.category !== 'player') {
    return {}
  }

  const idle = asset.animations?.idle
  const walk = asset.animations?.walk
  const run = asset.animations?.run

  return {
    idle: idle ? `/assets/models/${idle}` : undefined,
    walk: walk ? `/assets/models/${walk}` : undefined,
    run: run ? `/assets/models/${run}` : undefined,
  }
}
