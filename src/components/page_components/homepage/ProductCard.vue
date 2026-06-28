<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { getAssetUrl } from '@/api'
import AppImage from '@/components/AppImage.vue'
import { useCartStore } from '@/stores/cart'
import { capitalizeBackendText } from '@/utils/text'

const props = defineProps<{
  productId: number
  name: string
  photo: string | null
  price: number
  priceFormatted: string
  isAvailable: boolean
}>()

const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)
const displayName = computed(() => capitalizeBackendText(props.name))

// Карточка сама знает, сколько этого товара уже лежит в корзине.
const quantityInCart = computed(() => {
  return items.value.find((item) => item.product === props.productId)?.quantity ?? 0
})

function addToCart() {
  if (!props.isAvailable) {
    return
  }

  cartStore.addProduct({
    productId: props.productId,
    name: displayName.value,
    price: props.price,
  })
}

function increaseQuantity() {
  if (!props.isAvailable) {
    return
  }

  cartStore.increaseQuantity(props.productId)
}

function decreaseQuantity() {
  cartStore.decreaseQuantity(props.productId)
}
</script>

<template>
  <div class="product-card">
    <RouterLink :to="`/product/${productId}`" class="product-card__image-wrapper" :aria-label="`Открыть ${displayName}`">
      <AppImage
        :src="getAssetUrl(photo, { format: 'webp', width: 1440 })"
        :alt="displayName"
        img-class="product-card__image"
        loading="lazy"
      />
    </RouterLink>

    <div class="product-card__content">
      <span class="product-card__title">{{ displayName }}</span>
      <span class="product-card__price">{{ priceFormatted }} ₽</span>
    </div>

    <button
      v-if="quantityInCart === 0"
      class="product-card__action"
      :class="{ 'product-card__action--disabled': !isAvailable }"
      type="button"
      aria-label="Добавить товар"
      :disabled="!isAvailable"
      @click="addToCart"
    >
      +
    </button>

    <div v-else class="product-card__counter product-card__action">
      <button class="product-card__counter-button" type="button" aria-label="Уменьшить количество"
        @click="decreaseQuantity">
        −
      </button>

      <span class="product-card__counter-value">{{ quantityInCart }}</span>

      <button
        class="product-card__counter-button"
        :class="{ 'product-card__counter-button--disabled': !isAvailable }"
        type="button"
        aria-label="Увеличить количество"
        :disabled="!isAvailable"
        @click="increaseQuantity"
      >
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: var(--grid-horizontal-gap);
  background-color: var(--color-background-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius);
  padding: var(--padding-card);
}

.product-card__image-wrapper {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  border-radius: var(--radius) var(--radius) 0 0;
  background-color: var(--color-background-card);
}

.product-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-card__image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.product-card__content {
  display: flex;
  justify-content: space-between;
  gap: var(--small-gap);
}

.product-card__title {
  font-size: var(--font-size-h4);
  font-weight: 300;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card__price {
  font-size: var(--font-size-h2);
  text-wrap: nowrap;
}

.product-card__action {
  margin-top: auto;
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: calc(var(--radius) / 2);
  background-color: var(--color-primary);
  color: white;
  cursor: pointer;
  font-size: var(--font-size-h2);
  transition: background-color 0.2s ease;
}

.product-card__action:hover {
  background-color: var(--color-hover);
}

.product-card__action--disabled,
.product-card__action--disabled:hover {
  background-color: var(--color-background-card);
  color: var(--color-text-secondary);
  cursor: default;
}

.product-card__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-radius: calc(var(--radius) / 2);
  background-color: var(--color-secondary-light);
  color: var(--color-hover);
  overflow: hidden;
  cursor: default;
}

.product-card__counter:hover {
  background-color: var(--color-secondary-light);
}

.product-card__counter-button {
  border: none;
  background-color: transparent;
  padding: 0 10%;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-h2);
}

.product-card__counter-button--disabled {
  color: var(--color-text-secondary);
  cursor: default;
}

.product-card__counter-value {
  min-width: 32px;
  text-align: center;
}

@media (max-width: 900px) {
  .product-card__content {
    flex: 1 1 auto;
    justify-content: start;
    flex-direction: column;
    gap: 2px;
  }

  .product-card__price {
    align-self: flex-end;
    text-align: right;
    margin-top: auto;
  }
}
</style>
