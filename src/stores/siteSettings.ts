import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getSiteSettings } from '@/api'
import type { SiteSettings } from '@/api'

type LoadState = 'idle' | 'loading' | 'success' | 'error'
const SITE_SETTINGS_STORAGE_KEY = 'ochenprosto-site-settings'

function trimSecondsFromTime(value: string) {
  return value.slice(0, 5)
}

function normalizeSiteSettings(siteSettings: SiteSettings): SiteSettings {
  return {
    ...siteSettings,
    start_of_work: trimSecondsFromTime(siteSettings.start_of_work),
    end_of_work: trimSecondsFromTime(siteSettings.end_of_work),
  }
}

export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const siteSettings = ref<SiteSettings | null>(loadCachedSiteSettings())
  const loadState = ref<LoadState>('idle')
  const errorMessage = ref('')

  const isLoading = computed(() => loadState.value === 'loading')
  const hasError = computed(() => loadState.value === 'error')
  const isLoaded = computed(() => loadState.value === 'success')

  async function loadSiteSettings(force = false) {
    if (isLoading.value) {
      return siteSettings.value
    }

    if (!force && isLoaded.value) {
      return siteSettings.value
    }

    loadState.value = 'loading'
    errorMessage.value = ''

    try {
      const response = await getSiteSettings()
      siteSettings.value = normalizeSiteSettings(response)
      persistSiteSettings(siteSettings.value)
      loadState.value = 'success'
      return siteSettings.value
    } catch (error) {
      loadState.value = 'error'
      errorMessage.value =
        error instanceof Error ? error.message : 'Не удалось загрузить site_settings.'
      throw error
    }
  }

  return {
    siteSettings,
    loadState,
    errorMessage,
    isLoading,
    hasError,
    isLoaded,
    loadSiteSettings,
  }
})

function loadCachedSiteSettings() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as SiteSettings

    if (
      typeof parsedValue?.id === 'number' &&
      typeof parsedValue?.primary_phone === 'string' &&
      typeof parsedValue?.address === 'string' &&
      typeof parsedValue?.start_of_work === 'string' &&
      typeof parsedValue?.end_of_work === 'string'
    ) {
      return normalizeSiteSettings(parsedValue)
    }
  } catch {
    return null
  }

  return null
}

function persistSiteSettings(siteSettings: SiteSettings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(siteSettings))
}
