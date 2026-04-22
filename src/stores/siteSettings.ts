import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getSiteSettings } from '@/api'
import type { SiteSettings } from '@/api'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

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
  const siteSettings = ref<SiteSettings | null>(null)
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
