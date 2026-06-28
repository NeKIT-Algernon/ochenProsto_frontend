<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getProducts } from '@/api'
import type { Product } from '@/api'
import ProductCard from '@/components/page_components/homepage/ProductCard.vue'

const props = withDefaults(
  defineProps<{
    currentProductId: number | null
    limit?: number
  }>(),
  {
    limit: 6,
  },
)

const relatedProducts = ref<Product[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price)
}

// Перемешиваем копию массива, чтобы не менять исходный ответ API.
function shuffleProducts(products: Product[]) {
  const shuffled = [...products]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentProduct = shuffled[index]

    shuffled[index] = shuffled[randomIndex] as Product
    shuffled[randomIndex] = currentProduct as Product
  }

  return shuffled
}

const visibleProducts = computed(() => {
  return relatedProducts.value.slice(0, props.limit)
})

async function loadRelatedProducts() {
  if (props.currentProductId === null) {
    relatedProducts.value = []
    errorMessage.value = 'Не удалось определить текущий товар.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await getProducts({
      filter: {
        id: {
          _neq: props.currentProductId,
        },
        isHidden: {
          _eq: false,
        },
      },
    })

    relatedProducts.value = shuffleProducts(response.data.data).map((product) => ({
      ...product,
      price_formatted: product.price_formatted || formatPrice(product.price),
    }))
  } catch (error) {
    relatedProducts.value = []
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить рекомендации.'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.currentProductId,
  () => {
    void loadRelatedProducts()
  },
  { immediate: true },
)
</script>

<template>
  <section class="related-products">
    <div class="related-products__header">
      <h2 class="related-products__title">Посмотрите также</h2>
    </div>

    <p v-if="isLoading">Подбираем товары...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="visibleProducts.length === 0">Пока нет других товаров для рекомендаций.</p>

    <div v-else class="related-products__list" aria-label="Рекомендованные товары">
      <div v-for="product in visibleProducts" :key="product.id" class="related-products__item">
        <ProductCard
          :product-id="product.id"
          :is-available="product.isAvailable"
          :name="product.name"
          :photo="product.photo"
          :price="product.price"
          :price-formatted="product.price_formatted"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.related-products {
  display: flex;
  flex-direction: column;
  gap: var(--normal-gap);
}

.related-products__title {
  font-size: var(--font-size-h2);
}

.related-products__list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 320px);
  gap: var(--grid-horizontal-gap);
  align-items: stretch;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.related-products__item {
  display: flex;
  scroll-snap-align: start;
}

.related-products__item :deep(.product-card) {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .related-products__list {
    grid-auto-columns: minmax(200px, 76vw);
  }
}
</style>
