interface UpdateSeoPayload {
  title?: string
  description?: string
  path?: string
  noindex?: boolean
}

const defaultSiteName = import.meta.env.VITE_SITE_NAME || 'Очень Просто'
const defaultDescription =
  'Доставка роллов и других блюд от Очень Просто в станице Ленинградской.'

function normalizeBasePath(path: string) {
  if (!path || path === '/') {
    return ''
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}`
}

function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim()

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/+$/g, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

function buildCanonicalUrl(path = '/') {
  const siteUrl = getSiteUrl()
  const basePath = normalizeBasePath(import.meta.env.BASE_URL)
  const routePath = path === '/' ? '' : path.replace(/\/+$/g, '')

  return `${siteUrl}${basePath}${routePath || '/'}`
}

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null

  if (!element) {
    element = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

// Базовое SEO обновляем на клиенте при смене маршрута и загрузке товара.
export function updateSeo(payload: UpdateSeoPayload) {
  if (typeof document === 'undefined') {
    return
  }

  const title = payload.title ? `${payload.title} | ${defaultSiteName}` : defaultSiteName
  const description = payload.description?.trim() || defaultDescription
  const canonicalUrl = buildCanonicalUrl(payload.path)
  const robots = payload.noindex ? 'noindex,nofollow' : 'index,follow'

  document.title = title

  ensureMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  })
  ensureMeta('meta[name="robots"]', {
    name: 'robots',
    content: robots,
  })
  ensureMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: title,
  })
  ensureMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  })
  ensureMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  })
  ensureMeta('link[rel="canonical"]', {
    rel: 'canonical',
    href: canonicalUrl,
  })
}
