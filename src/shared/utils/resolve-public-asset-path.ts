export function resolvePublicAssetPath(assetPath: string) {
  if (!assetPath.startsWith('/')) {
    return assetPath
  }

  const basePath = import.meta.env.BASE_URL ?? '/'
  if (basePath === '/') {
    return assetPath
  }

  const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return `${normalizedBasePath}${assetPath}`
}
