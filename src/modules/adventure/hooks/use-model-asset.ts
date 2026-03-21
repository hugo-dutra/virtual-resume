import { useEffect, useMemo, useState } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

type ModelLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

type ModelTemplate = {
  scene: Group
  animations: THREE.AnimationClip[]
}

const modelTemplateCache = new Map<string, ModelTemplate | null>()
const modelLoadPromises = new Map<string, Promise<ModelTemplate | null>>()
const modelLoadFailureCount = new Map<string, number>()
const MAX_MODEL_RETRY_ATTEMPTS = 2
const MODEL_RETRY_DELAY_MS = 650

function cloneModelScene(scene: Group) {
  return cloneSkeleton(scene) as Group
}

function prepareModelScene(scene: Group) {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
}

function loadModelTemplate(url: string): Promise<ModelTemplate | null> {
  const cachedTemplate = modelTemplateCache.get(url)
  if (cachedTemplate !== undefined) {
    const failureCount = modelLoadFailureCount.get(url) ?? 0
    if (cachedTemplate === null && failureCount < MAX_MODEL_RETRY_ATTEMPTS) {
      modelTemplateCache.delete(url)
    } else {
      return Promise.resolve(cachedTemplate)
    }
  }

  const refreshedCachedTemplate = modelTemplateCache.get(url)
  if (refreshedCachedTemplate !== undefined) {
    return Promise.resolve(refreshedCachedTemplate)
  }

  const pendingLoad = modelLoadPromises.get(url)
  if (pendingLoad) {
    return pendingLoad
  }

  const promise = new Promise<ModelTemplate | null>((resolve) => {
    const loader = new GLTFLoader()

    loader.load(
      url,
      (gltf) => {
        prepareModelScene(gltf.scene)
        modelLoadFailureCount.delete(url)
        modelTemplateCache.set(url, {
          scene: gltf.scene,
          animations: gltf.animations,
        })
        modelLoadPromises.delete(url)
        resolve({
          scene: gltf.scene,
          animations: gltf.animations,
        })
      },
      undefined,
      () => {
        const nextFailureCount = (modelLoadFailureCount.get(url) ?? 0) + 1
        modelLoadFailureCount.set(url, nextFailureCount)
        modelTemplateCache.set(url, null)
        modelLoadPromises.delete(url)
        resolve(null)
      },
    )
  })

  modelLoadPromises.set(url, promise)
  return promise
}

type UseModelAssetResult = {
  scene: Group | null
  animations: THREE.AnimationClip[]
  status: ModelLoadStatus
}

export function useModelAsset(url: string | null): UseModelAssetResult {
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!url) {
      return
    }

    let cancelled = false
    const cachedTemplate = modelTemplateCache.get(url)
    const failureCount = modelLoadFailureCount.get(url) ?? 0

    if (cachedTemplate === null && failureCount < MAX_MODEL_RETRY_ATTEMPTS) {
      const retryTimeoutId = window.setTimeout(() => {
        modelTemplateCache.delete(url)
        if (cancelled) {
          return
        }

        setRefreshToken((currentToken) => currentToken + 1)
      }, MODEL_RETRY_DELAY_MS)

      return () => {
        cancelled = true
        window.clearTimeout(retryTimeoutId)
      }
    }

    const pendingLoad = modelLoadPromises.get(url)
    const loadPromise =
      pendingLoad ?? (cachedTemplate === undefined ? loadModelTemplate(url) : Promise.resolve(cachedTemplate))

    void loadPromise.then(() => {
      if (cancelled) {
        return
      }

      setRefreshToken((currentToken) => currentToken + 1)
    })

    return () => {
      cancelled = true
    }
  }, [refreshToken, url])

  const template = url ? modelTemplateCache.get(url) : undefined
  const animations = useMemo(() => template?.animations ?? [], [template])
  const scene = useMemo(() => {
    if (!template?.scene) {
      return null
    }

    return cloneModelScene(template.scene)
  }, [template])

  const status: ModelLoadStatus = !url ? 'idle' : template === null ? 'error' : template ? 'ready' : 'loading'

  return { scene, animations, status }
}
