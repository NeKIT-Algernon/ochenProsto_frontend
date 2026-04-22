<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import HomePageButton from '@/components/HomePageButton.vue';

const cartStore = useCartStore()
const { items, totalItemsCount } = storeToRefs(cartStore)
</script>

<template>
  <section>

    <HomePageButton />

    <p v-if="items.length === 0">Корзина пуста.</p>

    <ul v-else>
      <li v-for="item in items" :key="item.id">
        product: {{ item.product }},
        quantity: {{ item.quantity }},
        name_snapshot: {{ item.name_snapshot }},
        price_snapshot: {{ item.price_snapshot }},
        total_price: {{ item.total_price }}
      </li>
    </ul>
  </section>
</template>
