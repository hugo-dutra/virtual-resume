import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

type AnimationState = 'idle' | 'walk' | 'run'

const clipCache = new Map<string, THREE.AnimationClip | null>()
const loadPromises = new Map<string, Promise<THREE.AnimationClip | null>>()
const clipLoadFailureCount = new Map<string, number>()
const MAX_CLIP_RETRY_ATTEMPTS = 2
const CLIP_RETRY_DELAY_MS = 650

function normalizeClipTracks(clip: THREE.AnimationClip) {
  const normalizedTracks = clip.tracks.map((track) => {
    const clonedTrack = track.clone()
    const lastDotIndex = clonedTrack.name.lastIndexOf('.')
    if (lastDotIndex <= 0) {
      return clonedTrack
    }

    const targetPath = clonedTrack.name.slice(0, lastDotIndex)
    const propertyPath = clonedTrack.name.slice(lastDotIndex + 1)
    const normalizedTarget = targetPath.split('|').at(-1) ?? targetPath
    clonedTrack.name = `${normalizedTarget}.${propertyPath}`
    return clonedTrack
  })

  return new THREE.AnimationClip(clip.name, clip.duration, normalizedTracks)
}

function loadClip(url: string) {
  const cached = clipCache.get(url)
  if (cached !== undefined) {
    const failureCount = clipLoadFailureCount.get(url) ?? 0
    if (cached === null && failureCount < MAX_CLIP_RETRY_ATTEMPTS) {
      clipCache.delete(url)
    } else {
      return Promise.resolve(cached)
    }
  }

  const refreshedCached = clipCache.get(url)
  if (refreshedCached !== undefined) {
    return Promise.resolve(refreshedCached)
  }

  const pending = loadPromises.get(url)
  if (pending) {
    return pending
  }

  const promise = new Promise<THREE.AnimationClip | null>((resolve) => {
    const loader = new FBXLoader()

    loader.load(
      url,
      (fbx) => {
        const firstClip = fbx.animations[0] ? normalizeClipTracks(fbx.animations[0]) : null
        clipLoadFailureCount.delete(url)
        clipCache.set(url, firstClip)
        loadPromises.delete(url)
        resolve(firstClip)
      },
      undefined,
      () => {
        const nextFailureCount = (clipLoadFailureCount.get(url) ?? 0) + 1
        clipLoadFailureCount.set(url, nextFailureCount)
        clipCache.set(url, null)
        loadPromises.delete(url)
        resolve(null)
      },
    )
  })

  loadPromises.set(url, promise)
  return promise
}

type ClipUrls = Partial<Record<AnimationState, string>>
type ClipMap = Partial<Record<AnimationState, THREE.AnimationClip>>
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function useExternalAnimationClips(urls: ClipUrls): ClipMap {
  const [refreshToken, setRefreshToken] = useState(0)
  const idleUrl = urls.idle
  const walkUrl = urls.walk
  const runUrl = urls.run

  useEffect(() => {
    let cancelled = false
    const urlsToLoad = [idleUrl, walkUrl, runUrl].filter(isDefined)
    const retryableFailedUrls = urlsToLoad.filter((url) => {
      const isFailureCached = clipCache.get(url) === null
      const failureCount = clipLoadFailureCount.get(url) ?? 0
      return isFailureCached && failureCount < MAX_CLIP_RETRY_ATTEMPTS
    })

    if (retryableFailedUrls.length > 0) {
      const retryTimeoutId = window.setTimeout(() => {
        for (const url of retryableFailedUrls) {
          clipCache.delete(url)
        }

        if (cancelled) {
          return
        }

        setRefreshToken((token) => token + 1)
      }, CLIP_RETRY_DELAY_MS)

      return () => {
        cancelled = true
        window.clearTimeout(retryTimeoutId)
      }
    }

    const pendingLoads = urlsToLoad.map((url) => loadClip(url))
    if (pendingLoads.length === 0) {
      return
    }

    void Promise.all(pendingLoads).then(() => {
      if (cancelled) {
        return
      }

      setRefreshToken((token) => token + 1)
    })

    return () => {
      cancelled = true
    }
  }, [idleUrl, refreshToken, runUrl, walkUrl])

  const output: ClipMap = {}

  if (idleUrl) {
    const clip = clipCache.get(idleUrl)
    if (clip) {
      output.idle = clip
    }
  }

  if (walkUrl) {
    const clip = clipCache.get(walkUrl)
    if (clip) {
      output.walk = clip
    }
  }

  if (runUrl) {
    const clip = clipCache.get(runUrl)
    if (clip) {
      output.run = clip
    }
  }

  return output
}
