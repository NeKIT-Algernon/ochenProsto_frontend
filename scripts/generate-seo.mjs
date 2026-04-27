import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const publicDir = path.join(rootDir, 'public')

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf('=')
      const key = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trim()

      acc[key] = value
      return acc
    }, {})
}

function normalizeBasePath(basePath) {
  if (!basePath || basePath === '/') {
    return ''
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}`
}

const env = {
  ...parseEnvFile(path.join(rootDir, '.env.example')),
  ...parseEnvFile(path.join(rootDir, '.env')),
  ...process.env,
}

const siteUrl = (env.VITE_SITE_URL || 'https://example.com').replace(/\/+$/g, '')
const basePath = normalizeBasePath(env.VITE_APP_BASE_PATH || '/')
const rootUrl = `${siteUrl}${basePath || '/'}`

fs.mkdirSync(publicDir, { recursive: true })

fs.writeFileSync(
  path.join(publicDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}${basePath}/sitemap.xml\n`,
)

fs.writeFileSync(
  path.join(publicDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${rootUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
)
