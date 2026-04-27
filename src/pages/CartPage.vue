<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { getAssetUrl, getProductsByIds } from '@/api'
import type { Product } from '@/api'
import AppImage from '@/components/AppImage.vue'
import { useCartStore } from '@/stores/cart'
import HomePageButton from '@/components/HomePageButton.vue'

const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)
const productsById = ref<Record<number, Product>>({})
const isProductsLoading = ref(false)

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + item.total_price, 0)
})

const cartProductIdsKey = computed(() => {
  return [...new Set(items.value.map((item) => item.product))]
    .sort((left, right) => left - right)
    .join('|')
})

const cartItemsView = computed(() => {
  return items.value.map((item) => ({
    ...item,
    productData: productsById.value[item.product] ?? null,
  }))
})

function clearCart() {
  cartStore.clearCart()
}

function increaseQuantity(productId: number) {
  cartStore.increaseQuantity(productId)
}

function decreaseQuantity(productId: number) {
  cartStore.decreaseQuantity(productId)
}

function removeProduct(productId: number) {
  cartStore.removeProduct(productId)
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price)
}

async function loadCartProducts() {
  if (items.value.length === 0) {
    productsById.value = {}
    return
  }

  isProductsLoading.value = true

  try {
    const productIds = [...new Set(items.value.map((item) => item.product))]
    const response = await getProductsByIds(productIds, {
      fields: ['id', 'photo', 'ingridients'],
    })

    productsById.value = response.data.data.reduce<Record<number, Product>>((acc, product) => {
      acc[product.id] = product
      return acc
    }, {})
  } finally {
    isProductsLoading.value = false
  }
}

watch(
  cartProductIdsKey,
  () => {
    void loadCartProducts()
  },
  { immediate: true },
)
</script>

<template>
  <section class="main-section">
    <HomePageButton />

    <div class="title_action">
      <span class="title">
        Корзина
      </span>
      <button v-if="items.length > 0" type="button" class="clear-cart-button" @click="clearCart">
        Очистить корзину
      </button>
    </div>

    <div class="section-area">
      <span v-if="items.length === 0">В корзине пока ничего нет</span>

      <div v-else class="items-group">
        <div v-if="isProductsLoading" class="cart-loading">
          Загрузка товаров...
        </div>

        <div v-for="item in cartItemsView" :key="item.id" class="cart-item">
          <RouterLink :to="`/product/${item.product}`" class="cart-item__image-link"
            :aria-label="`Открыть ${item.name_snapshot}`">
            <AppImage
              class="cart-item__image-wrapper"
              :src="getAssetUrl(item.productData?.photo)"
              :alt="item.name_snapshot"
              img-class="cart-item__image"
              loading="lazy"
            />
          </RouterLink>

          <div class="cart-item__content">
            <div class="cart-item__text">
              <span class="cart-item__title">{{ item.name_snapshot }}</span>
              <span class="cart-item__description">{{ item.productData?.ingridients }}</span>
            </div>
            <span class="cart-item__price">
              {{ item.quantity }} x {{ formatPrice(item.price_snapshot) }} ₽
            </span>
          </div>

          <div class="cart-item__actions">
            <button class="cart-item__remove-button" type="button" aria-label="Удалить позицию из корзины"
              @click="removeProduct(item.product)">
              ×
            </button>
            <div class="cart-item__counter">
              <button class="cart-item__counter-button" type="button" aria-label="Уменьшить количество"
                @click="decreaseQuantity(item.product)">
                −
              </button>
              <span class="cart-item__counter-value">{{ item.quantity }}</span>
              <button class="cart-item__counter-button" type="button" aria-label="Увеличить количество"
                @click="increaseQuantity(item.product)">
                +
              </button>
            </div>


          </div>
        </div>
      </div>

      <div class="horizontal-devider"></div>

      <div class="total">
        <span>К оплате</span>
        <span>{{ new Intl.NumberFormat('ru-RU').format(totalPrice) }} ₽</span>
      </div>

    </div>
    <RouterLink v-if="items.length > 0" to="/order" class="checkout-button">
      К оформлению
    </RouterLink>
  </section>

</template>

<style scoped>
.title_action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-cart-button {
  border: none;
  background-color: transparent;
  padding: 4px 0 4px 8px;
  color: var(--color-text-primary);
  font-size: var(--font-size-h2);
  cursor: pointer;
}

.total {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-h2);
}

.checkout-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: var(--color-primary);
  color: var(--color-background-main);
  text-decoration: none;
  font-size: var(--font-size-normal);
  margin: 0 auto;
  transition: background-color 0.2s ease;
  padding: var(--small-gap) var(--normal-gap);
}

.checkout-button:hover {
  background-color: var(--color-hover);
}

.horizontal-devider {
  width: 100%;
  height: 1px;
  background-color: var(--color-border-default);
}

.items-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}

.cart-loading {
  font-size: var(--font-size-primary);
}

.cart-item {
  display: grid;
  grid-template-columns: calc(var(--logo-height) * 3) minmax(0, 1fr) auto;
  gap: var(--small-gap);
  align-items: center;
}

.cart-item__image-wrapper {
  width: 100%;
  aspect-ratio: 3 / 2;
  background-color: transparent;
}

.cart-item__image-link {
  display: block;
}

.cart-item__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cart-item__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-width: 0;
  padding: calc(var(--small-gap) / 2) 0 0 0;
}

.cart-item__text {
  display: flex;
  flex-direction: column;
  gap: calc(var(--small-gap) / 2);
}

.cart-item__title {
  font-size: var(--font-size-h2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__description {
  font-size: var(--font-size-primary);
  display: -webkit-box;
  color: var(--color-text-secondary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__price {
  font-size: var(--font-size-normal);
  font-weight: 300;
}

.cart-item__actions {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: end;
  justify-content: space-between;
}

.cart-item__counter {
  display: flex;
  align-items: center;
  justify-content: space-around;
  /*width: calc(var(--logo-height)*3);*/
  width: 100%;
  border-radius: calc(var(--radius) / 4);
  background-color: transparent;
  border: 1px solid var(--color-text-primary);
  overflow: hidden;
}

.cart-item__counter-button,
.cart-item__remove-button {
  border: none;
  background-color: transparent;
  color: inherit;
  cursor: pointer;
}

.cart-item__counter-button {
  padding: 2px var(--normal-gap);
  font-size: var(--font-size-h2);
}

.cart-item__counter-value {
  min-width: var(--normal-gap);
  font-size: var(--font-size-h2);
  text-align: center;
}

.cart-item__remove-button {
  font-size: var(--font-size-h1);
  padding: var(--small-gap);
  line-height: 50%;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .cart-item {
    position: relative;
    grid-template-columns: calc(var(--logo-height) * 2.5) minmax(0, 1fr);
    align-items: start;
  }

  .cart-item__image-wrapper {
    grid-column: 1;
    grid-row: 1;
  }

  .cart-item__content {
    grid-column: 2;
    grid-row: 1;
    gap: var(--small-gap);
    padding-right: calc(var(--logo-height) * 2.4);
  }

  .cart-item__actions {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: calc(var(--logo-height) * 2);
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    gap: var(--small-gap);
  }

  .cart-item__counter {
    width: 100%;
  }

  .cart-item__counter-button {
    padding: 2px var(--small-gap);
  }

  .cart-item__remove-button {
    padding: 4px;
    line-height: 1;
  }

  .checkout-button {
    width: 180px;
    height: 32px;
  }
}
</style>
