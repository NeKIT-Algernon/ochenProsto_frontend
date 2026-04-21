<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSiteSettings } from '@/api'
import type { SiteSettings } from '@/api'

const siteSettings = ref<SiteSettings | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function loadProductPageData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    siteSettings.value = await getSiteSettings()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить site_settings.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProductPageData()
})
</script>

<template>
  <section>
    <h1>Product page</h1>

    <p v-if="isLoading">Загрузка данных...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <div v-else-if="!siteSettings">Site settings не найдены.</div>
    <p v-else>
      Телефон: {{ siteSettings.primary_phone }},
      Бесплатная доставка от: {{ siteSettings.free_delivery_amount }} ₽,
      Время работы: {{ siteSettings.start_of_work }} - {{ siteSettings.end_of_work }},
      VK: {{ siteSettings.VK_link }},
      Предупреждение: {{ siteSettings.warning_text }},
      isWarning: {{ siteSettings.isWarning }},
      isClosed: {{ siteSettings.isClosed }}
    </p>
  </section>
</template>
