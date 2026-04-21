import { createRouter, createWebHistory } from 'vue-router'
import CartPage from '@/pages/CartPage.vue'
import HomePage from '@/pages/HomePage.vue'
import OrderPage from '@/pages/OrderPage.vue'
import ProductPage from '@/pages/ProductPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/product',
      name: 'product',
      component: ProductPage,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartPage,
    },
    {
      path: '/order',
      name: 'order',
      component: OrderPage,
    },
  ],
})

export default router
