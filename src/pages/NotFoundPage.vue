<script setup lang="ts">
import HomePageButton from '@/components/HomePageButton.vue'
</script>

<template>
  <section class="not-found-page main-section">
    <HomePageButton />
    <div class="section-area not-found-page__content">
      <h1 class="not-found-page__title">Страница не найдена</h1>
      <p class="not-found-page__description">
        Такой страницы нет или она была перемещена.
      </p>
    </div>
  </section>
</template>

<style scoped>
.not-found-page__content {
  align-items: flex-start;
}

.not-found-page__title {
  font-size: var(--font-size-h1);
}

.not-found-page__description {
  font-size: var(--font-size-primary);
  color: var(--color-text-secondary);
}
</style>
