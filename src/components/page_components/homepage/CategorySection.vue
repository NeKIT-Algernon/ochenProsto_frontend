<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Product } from '@/api'
import { capitalizeBackendText } from '@/utils/text'

// Секция получает уже сгруппированные товары и только отрисовывает сетку карточек.
defineProps<{
  title: string
  products: Product[]
}>()
</script>

<template>
  <section class="category-section">
    <span class="category-section__title">{{ capitalizeBackendText(title) }}</span>

    <div class="category-section__products">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product-id="product.id"
        :is-available="product.isAvailable"
        :name="product.name"
        :photo="product.photo"
        :price="product.price"
        :price-formatted="product.price_formatted"
      />
    </div>
  </section>
</template>

<style scoped>
.category-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-section__title {
  font-size: var(--font-size-h2);
}

.category-section__products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-horizontal-gap);
}

@media (max-width: 1300px) {
  .category-section__products {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .category-section__products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
