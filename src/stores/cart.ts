import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CartOrderItem } from '@/api'

interface AddCartProductPayload {
  productId: number
  name: string
  price: number
}

const CART_STORAGE_KEY = 'ochenprosto-cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartOrderItem[]>(loadCartItems())

  const totalItemsCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  function getItemByProductId(productId: number) {
    return items.value.find((item) => item.product === productId) ?? null
  }

  function getQuantityByProductId(productId: number) {
    return getItemByProductId(productId)?.quantity ?? 0
  }

  function addProduct(payload: AddCartProductPayload) {
    const existingItem = getItemByProductId(payload.productId)

    if (existingItem) {
      increaseQuantity(payload.productId)
      return
    }

    items.value = [
      ...items.value,
      {
        id: Date.now() + payload.productId,
        product: payload.productId,
        quantity: 1,
        name_snapshot: payload.name,
        price_snapshot: payload.price,
        total_price: payload.price,
      },
    ]

    persistCartItems(items.value)
  }

  function increaseQuantity(productId: number) {
    const existingItem = getItemByProductId(productId)

    if (!existingItem) {
      return
    }

    items.value = items.value.map((item) => {
      if (item.product !== productId) {
        return item
      }

      const quantity = item.quantity + 1

      return {
        ...item,
        quantity,
        total_price: quantity * item.price_snapshot,
      }
    })

    persistCartItems(items.value)
  }

  function decreaseQuantity(productId: number) {
    const existingItem = getItemByProductId(productId)

    if (!existingItem) {
      return
    }

    if (existingItem.quantity === 1) {
      items.value = items.value.filter((item) => item.product !== productId)
      persistCartItems(items.value)
      return
    }

    items.value = items.value.map((item) => {
      if (item.product !== productId) {
        return item
      }

      const quantity = item.quantity - 1

      return {
        ...item,
        quantity,
        total_price: quantity * item.price_snapshot,
      }
    })

    persistCartItems(items.value)
  }

  return {
    items,
    totalItemsCount,
    getItemByProductId,
    getQuantityByProductId,
    addProduct,
    increaseQuantity,
    decreaseQuantity,
  }
})

function loadCartItems(): CartOrderItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  const rawItems = window.localStorage.getItem(CART_STORAGE_KEY)

  if (!rawItems) {
    return []
  }

  try {
    const parsedItems = JSON.parse(rawItems)

    if (!Array.isArray(parsedItems)) {
      return []
    }

    return parsedItems.filter((item): item is CartOrderItem => {
      return (
        typeof item?.id === 'number' &&
        typeof item?.product === 'number' &&
        typeof item?.quantity === 'number' &&
        typeof item?.name_snapshot === 'string' &&
        typeof item?.price_snapshot === 'number' &&
        typeof item?.total_price === 'number'
      )
    })
  } catch {
    return []
  }
}

function persistCartItems(items: CartOrderItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}
