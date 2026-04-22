<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import HomePageButton from '@/components/HomePageButton.vue';

const siteSettingsStore = useSiteSettingsStore()
const { errorMessage, isLoading, siteSettings } = storeToRefs(siteSettingsStore)
</script>

<template>
  <section>

    <HomePageButton />

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
