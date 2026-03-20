import { useEffect, useMemo, useState } from 'react'
import type { AnimationClip, Group } from 'three'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

type ModelLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

type FbxModelTemplate = {
  scene: Group
  animations: AnimationClip[]
}

const templateCache = new Map<string, FbxModelTemplate | null>()
const loadPromises = new Map<string, Promise<FbxModelTemplate | null>>()

function prepareScene(scene: Group) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
}

function loadTemplate(url: string): Promise<FbxModelTemplate | null> {
  const cached = templateCache.get(url)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  const pending = loadPromises.get(url)
  if (pending) {
    return pending
  }

  const promise = new Promise<FbxModelTemplate | null>((resolve) => {
    const loader = new FBXLoader()

    loader.load(
      url,
      (fbx) => {
        prepareScene(fbx)
        const template: FbxModelTemplate = {
          scene: fbx,
          animations: fbx.animations,
        }
        templateCache.set(url, template)
        loadPromises.delete(url)
        resolve(template)
      },
      undefined,
      () => {
        templateCache.set(url, null)
        loadPromises.delete(url)
        resolve(null)
      },
    )
  })

  loadPromises.set(url, promise)
  return promise
}

type UseFbxModelAssetResult = {
  scene: Group | null
  animations: AnimationClip[]
  status: ModelLoadStatus
}

export function useFbxModelAsset(url: string | null): UseFbxModelAssetResult {
  const [, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!url) {
      return
    }

    let cancelled = false
    const cached = templateCache.get(url)
    const pending = loadPromises.get(url)
    const loadPromise = pending ?? (cached === undefined ? loadTemplate(url) : Promise.resolve(cached))

    void loadPromise.then(() => {
      if (cancelled) {
        return
      }

      setRefreshToken((token) => token + 1)
    })

    return () => {
      cancelled = true
    }
  }, [url])

  const template = url ? templateCache.get(url) : undefined
  const scene = useMemo(() => {
    if (!template?.scene) {
      return null
    }

    return cloneSkeleton(template.scene) as Group
  }, [template])
  const animations = useMemo(() => template?.animations ?? [], [template])
  const status: ModelLoadStatus = !url ? 'idle' : template === null ? 'error' : template ? 'ready' : 'loading'

  return { scene, animations, status }
}
