/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL: string
  readonly VITE_SITE_URL: string
  readonly VITE_SITE_NAME: string
  readonly VITE_APP_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
