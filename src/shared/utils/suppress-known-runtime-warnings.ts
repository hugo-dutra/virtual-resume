const SUPPRESSED_WARNING_PATTERNS = [
  'THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.',
  'THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.',
  'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.',
  'FBXLoader: Image type "fbm" is not supported.',
]

let isWarningFilterInstalled = false

function shouldSuppressWarning(arg: unknown) {
  if (typeof arg !== 'string') {
    return false
  }

  return SUPPRESSED_WARNING_PATTERNS.some((pattern) => arg.includes(pattern))
}

export function installRuntimeWarningFilter() {
  if (isWarningFilterInstalled) {
    return
  }

  isWarningFilterInstalled = true
  const originalWarn = console.warn.bind(console)

  console.warn = (...args: unknown[]) => {
    if (args.some((arg) => shouldSuppressWarning(arg))) {
      return
    }

    originalWarn(...args)
  }
}
