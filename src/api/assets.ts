const directusBaseUrl = import.meta.env.VITE_DIRECTUS_URL

// Функция для получения URL файла
export function getAssetUrl(fileId: string | null | undefined) {
  if (!fileId) {
    return null
  }

  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    return fileId
  }

  return `${directusBaseUrl.replace(/\/$/, '')}/assets/${fileId}`
}
