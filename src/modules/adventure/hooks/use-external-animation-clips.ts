import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

type AnimationState = 'idle' | 'walk' | 'run'

const clipCache = new Map<string, THREE.AnimationClip | null>()
const loadPromises = new Map<string, Promise<THREE.AnimationClip | null>>()

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
    return Promise.resolve(cached)
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
        clipCache.set(url, firstClip)
        loadPromises.delete(url)
        resolve(firstClip)
      },
      undefined,
      () => {
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
  const [, setRefreshToken] = useState(0)
  const idleUrl = urls.idle
  const walkUrl = urls.walk
  const runUrl = urls.run

  useEffect(() => {
    let cancelled = false

    const pendingLoads = [idleUrl, walkUrl, runUrl].filter(isDefined).map((url) => loadClip(url))
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
  }, [idleUrl, runUrl, walkUrl])

  return useMemo(() => {
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
  }, [idleUrl, runUrl, walkUrl])
}
