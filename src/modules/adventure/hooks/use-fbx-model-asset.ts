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
const loadFailureCount = new Map<string, number>()
const MAX_RETRY_ATTEMPTS = 2
const RETRY_DELAY_MS = 650

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
    const failureCount = loadFailureCount.get(url) ?? 0
    if (cached === null && failureCount < MAX_RETRY_ATTEMPTS) {
      templateCache.delete(url)
    } else {
      return Promise.resolve(cached)
    }
  }

  const refreshedCached = templateCache.get(url)
  if (refreshedCached !== undefined) {
    return Promise.resolve(refreshedCached)
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
        loadFailureCount.delete(url)
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
        const nextFailureCount = (loadFailureCount.get(url) ?? 0) + 1
        loadFailureCount.set(url, nextFailureCount)
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
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!url) {
      return
    }

    let cancelled = false
    const cached = templateCache.get(url)
    const failureCount = loadFailureCount.get(url) ?? 0

    if (cached === null && failureCount < MAX_RETRY_ATTEMPTS) {
      const retryTimeoutId = window.setTimeout(() => {
        templateCache.delete(url)
        if (cancelled) {
          return
        }

        setRefreshToken((token) => token + 1)
      }, RETRY_DELAY_MS)

      return () => {
        cancelled = true
        window.clearTimeout(retryTimeoutId)
      }
    }

    const currentCached = templateCache.get(url)
    const pending = loadPromises.get(url)
    const loadPromise = pending ?? (currentCached === undefined ? loadTemplate(url) : Promise.resolve(currentCached))

    void loadPromise.then(() => {
      if (cancelled) {
        return
      }

      setRefreshToken((token) => token + 1)
    })

    return () => {
      cancelled = true
    }
  }, [refreshToken, url])

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
