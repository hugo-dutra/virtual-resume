import type { AdventureAsset } from '../../../data/adventure-assets.schema'

type Vector3Tuple = [number, number, number]

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
