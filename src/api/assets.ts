const directusBaseUrl = import.meta.env.VITE_DIRECTUS_URL

interface AssetUrlOptions {
  format?: string
  width?: number
}

// Для изображений сразу собираем трансформации Directus, чтобы фронт получал уже оптимизированные файлы.
export function getAssetUrl(fileId: string | null | undefined, options?: AssetUrlOptions) {
  if (!fileId) {
    return null
  }

  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    return fileId
  }

  const assetUrl = new URL(`${directusBaseUrl.replace(/\/$/, '')}/assets/${fileId}`)

  if (options?.format) {
    assetUrl.searchParams.set('format', options.format)
  }

  if (options?.width) {
    assetUrl.searchParams.set('width', String(options.width))
  }

  return assetUrl.toString()
}
