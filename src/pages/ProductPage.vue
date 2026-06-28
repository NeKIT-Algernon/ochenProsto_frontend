<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { getAssetUrl, getProductById } from '@/api'
import type { Product } from '@/api'
import AppImage from '@/components/AppImage.vue'
import HomePageButton from '@/components/HomePageButton.vue'
import RelatedProductsCarousel from '@/components/page_components/productpage/RelatedProductsCarousel.vue'
import { useCartStore } from '@/stores/cart'
import { updateSeo } from '@/utils/seo'
import { capitalizeBackendText } from '@/utils/text'

const route = useRoute()
const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)

const product = ref<Product | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

// Приводим параметр маршрута к числу один раз, чтобы дальше работать с ним безопасно.
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

const formattedWeightAndCount = computed(() => {
  if (!product.value) {
    return ''
  }

  if (product.value.count) {
    return `${product.value.weight} г / ${product.value.count} шт`
  }

  return `${product.value.weight} г`
})

const displayProductName = computed(() => {
  return capitalizeBackendText(product.value?.name)
})

// На странице товара используем ту же механику корзины, что и в карточках.
const quantityInCart = computed(() => {
  if (productId.value === null) {
    return 0
  }

  return items.value.find((item) => item.product === productId.value)?.quantity ?? 0
})

function addToCart() {
  if (!product.value || !product.value.isAvailable) {
    return
  }

  cartStore.addProduct({
    productId: product.value.id,
    name: displayProductName.value,
    price: product.value.price,
  })
}

function increaseQuantity() {
  if (productId.value === null || !product.value?.isAvailable) {
    return
  }

  cartStore.increaseQuantity(productId.value)
}

function decreaseQuantity() {
  if (productId.value === null) {
    return
  }

  cartStore.decreaseQuantity(productId.value)
}

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

    updateSeo({
      title: capitalizeBackendText(product.value.name),
      description: product.value.description || `Состав: ${product.value.ingridients}`,
      path: route.path,
    })
  } catch (error) {
    product.value = null
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить товар.'

    updateSeo({
      title: 'Товар не найден',
      description: 'Не удалось загрузить карточку товара.',
      path: route.path,
      noindex: true,
    })
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

    <div class="product-section">
      <p v-if="isLoading">Загрузка товара...</p>
      <p v-else-if="errorMessage">{{ errorMessage }}</p>
      <p v-else-if="!product">Товар не найден.</p>

      <div v-else class="product-page__content">
        <div class="product-page__image-wrapper">
          <AppImage
            :src="getAssetUrl(product.photo, { format: 'webp', width: 1440 })"
            :alt="displayProductName"
            img-class="product-page__image"
            loading="eager"
            fetchpriority="high"
          />
        </div>

        <div class="produc-page__maincontant">
          <div class="product-page__info">
            <div class="product-page__headline">
              <h1 class="product-page__title">{{ displayProductName }}</h1>
              <span class="product-page__weight">{{ formattedWeightAndCount }}</span>
            </div>

            <div class="product-page__divider"></div>

            <p class="product-page__ingredients">Состав: {{ product.ingridients }}</p>

            <div class="product-page__divider"></div>

            <span class="product-page__nutrition-caption">КБЖУ на 100г:</span>
            <div class="product-page__nutrition">
              <div class="product-page__nutrition-item">
                <span class="product-page__nutrition-value">{{ product.calories }}</span>
                <span class="product-page__nutrition-label">Ккал</span>

              </div>

              <div class="product-page__nutrition-item">
                <span class="product-page__nutrition-value">{{ product.proteins }}</span>
                <span class="product-page__nutrition-label">Белки</span>
              </div>

              <div class="product-page__nutrition-item">
                <span class="product-page__nutrition-value">{{ product.fats }}</span>
                <span class="product-page__nutrition-label">Жиры</span>
              </div>

              <div class="product-page__nutrition-item">
                <span class="product-page__nutrition-value">{{ product.carbs }}</span>
                <span class="product-page__nutrition-label">Углеводы</span>
              </div>
            </div>
          </div>

          <button
            v-if="quantityInCart === 0"
            class="product-page__action"
            :class="{ 'product-page__action--disabled': !product.isAvailable }"
            type="button"
            :disabled="!product.isAvailable"
            @click="addToCart"
          >
            Добавить за {{ formattedPrice }} ₽
          </button>

          <div v-else class="product-page__counter product-page__action">
            <button class="product-page__counter-button" type="button" aria-label="Уменьшить количество"
              @click="decreaseQuantity">
              −
            </button>

            <span class="product-page__counter-value">{{ quantityInCart }}</span>

            <button
              class="product-page__counter-button"
              :class="{ 'product-page__counter-button--disabled': !product.isAvailable }"
              type="button"
              aria-label="Увеличить количество"
              :disabled="!product.isAvailable"
              @click="increaseQuantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <RelatedProductsCarousel :current-product-id="productId" />
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
  grid-template-columns: 50% minmax(0, 1fr);
  gap: var(--grid-horizontal-gap);
  align-items: start;
}

.product-page__image-wrapper {
  width: 100%;
  aspect-ratio: 3 / 2;
  padding: calc(var(--section-padding) / 2);
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
  gap: calc(var(--normal-gap)*0.8);
}

.product-page__headline {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--small-gap);
}

.product-page__divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-border-default);
}

.product-page__title {
  font-size: var(--font-size-h1);
  line-height: 1.1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-page__weight {
  font-size: var(--font-size-h2);
  white-space: nowrap;
  color: var(--color-text-secondary);
}

.product-page__ingredients {
  font-size: var(--font-size-primary);
  color: var(--color-text-primary);
}

.product-page__nutrition-caption {
  font-size: var(--font-size-primary);
  color: var(--color-text-secondary);
}

.product-page__nutrition {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--small-gap);
  place-items: center;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
}

.product-page__nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--small-gap) 0;
}

.product-page__nutrition-label {
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  text-transform: uppercase;
}

.product-page__nutrition-value {
  font-size: calc(var(--font-size-normal) * 0.8);
}

.product-page__action {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: calc(var(--radius) / 2);
  background-color: var(--color-primary);
  color: white;
  cursor: pointer;
  font-size: var(--font-size-normal);
  transition: background-color 0.2s ease;
  margin-top: var(--small-gap);
}

.product-page__action:hover {
  background-color: var(--color-hover);
}

.product-page__action--disabled,
.product-page__action--disabled:hover {
  background-color: var(--color-background-card);
  color: var(--color-text-secondary);
  cursor: default;
}

.produc-page__maincontant {
  padding-top: var(--small-gap);
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
}

.product-page__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-secondary-light);
  color: var(--color-hover);
  overflow: hidden;
  cursor: default;
}

.product-page__counter:hover {
  background-color: var(--color-secondary-light);
}

.product-page__counter-button {
  border: none;
  background-color: transparent;
  padding: 0 24px;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-h2);
}

.product-page__counter-button--disabled {
  color: var(--color-text-secondary);
  cursor: default;
}

.product-page__counter-value {
  min-width: 32px;
  text-align: center;
}

@media (max-width: 900px) {
  .product-page__content {
    grid-template-columns: 1fr;
  }

  .produc-page__maincontant {
    justify-content: baseline;
    gap: var(--grid-vertical-gap);
  }

  .product-page__action {
    margin-top: 0;
  }
}
</style>
