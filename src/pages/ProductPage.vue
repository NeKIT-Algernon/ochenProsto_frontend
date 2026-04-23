<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAssetUrl, getProductById } from '@/api'
import type { Product } from '@/api'
import HomePageButton from '@/components/HomePageButton.vue'

const route = useRoute()

const product = ref<Product | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const productId = computed(() => {
  const rawId = route.params.id
  const normalizedId = Number(Array.isArray(rawId) ? rawId[0] : rawId)

  return Number.isFinite(normalizedId) ? normalizedId : null
})

const formattedPrice = computed(() => {
  if (!product.value) {
    return ''
  }

  return new Intl.NumberFormat('ru-RU').format(product.value.price)
})

async function loadProduct() {
  if (productId.value === null) {
    product.value = null
    errorMessage.value = 'Некорректный идентификатор товара.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getProductById(productId.value)
    product.value = response.data.data
  } catch (error) {
    product.value = null
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить товар.'
  } finally {
    isLoading.value = false
  }
}

watch(productId, () => {
  void loadProduct()
})

onMounted(() => {
  void loadProduct()
})
</script>

<template>
  <section class="product-page">
    <HomePageButton />

    <p v-if="isLoading">Загрузка товара...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!product">Товар не найден.</p>

    <div v-else class="product-page__content">
      <div class="product-page__image-wrapper">
        <img
          v-if="product.photo"
          class="product-page__image"
          :src="getAssetUrl(product.photo) ?? ''"
          :alt="product.name"
        >
      </div>

      <div class="product-page__info">
        <h1 class="product-page__title">{{ product.name }}</h1>
        <p class="product-page__price">{{ formattedPrice }} ₽</p>
        <p class="product-page__description">{{ product.description }}</p>
        <p class="product-page__ingredients">Состав: {{ product.ingridients }}</p>
        <p class="product-page__meta">Вес: {{ product.weight }} г</p>
        <p class="product-page__meta">Количество: {{ product.count }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-page {
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}

.product-page__content {
  display: grid;
  grid-template-columns: minmax(320px, 480px) minmax(0, 1fr);
  gap: var(--grid-horizontal-gap);
  align-items: start;
}

.product-page__image-wrapper {
  width: 100%;
  aspect-ratio: 3 / 2;
  padding: var(--section-padding);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  background-color: var(--color-background-card);
}

.product-page__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-page__info {
  display: flex;
  flex-direction: column;
  gap: var(--small-gap);
}

.product-page__title {
  font-size: var(--font-size-h1);
}

.product-page__price {
  font-size: var(--font-size-h2);
}

.product-page__description,
.product-page__ingredients,
.product-page__meta {
  font-size: var(--font-size-primary);
}

@media (max-width: 900px) {
  .product-page__content {
    grid-template-columns: 1fr;
  }
}
</style>
