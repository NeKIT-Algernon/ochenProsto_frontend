<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { getAssetUrl } from '@/api'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  productId: number
  name: string
  photo: string | null
  price: number
  priceFormatted: string
}>()

const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)

const quantityInCart = computed(() => {
  return items.value.find((item) => item.product === props.productId)?.quantity ?? 0
})

function addToCart() {
  cartStore.addProduct({
    productId: props.productId,
    name: props.name,
    price: props.price,
  })
}

function increaseQuantity() {
  cartStore.increaseQuantity(props.productId)
}

function decreaseQuantity() {
  cartStore.decreaseQuantity(props.productId)
}
</script>

<template>
  <div class="product-card">
    <RouterLink :to="`/product/${productId}`" class="product-card__image-wrapper" :aria-label="`Открыть ${name}`">
      <img v-if="photo" class="product-card__image" :src="getAssetUrl(photo) ?? ''" :alt="name" />
    </RouterLink>

    <div class="product-card__content">
      <span class="product-card__title">{{ name }}</span>
      <span class="product-card__price">{{ priceFormatted }} ₽</span>
    </div>

    <button v-if="quantityInCart === 0" class="product-card__action" type="button" aria-label="Добавить товар"
      @click="addToCart">
      +
    </button>

    <div v-else class="product-card__counter product-card__action">
      <button class="product-card__counter-button" type="button" aria-label="Уменьшить количество"
        @click="decreaseQuantity">
        −
      </button>

      <span class="product-card__counter-value">{{ quantityInCart }}</span>

      <button class="product-card__counter-button" type="button" aria-label="Увеличить количество"
        @click="increaseQuantity">
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
}

.product-card__price {
  font-size: var(--font-size-h2);
}

.product-card__action {
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

.product-card__counter-value {
  min-width: 32px;
  text-align: center;
}

@media (max-width: 900px) {
  .product-card__content {
    justify-content: start;
    flex-direction: column;
    gap: 2px;
  }
}
</style>
