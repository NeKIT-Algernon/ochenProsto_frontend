import { createRouter, createWebHistory } from 'vue-router'
import { updateSeo } from '@/utils/seo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: {
        title: 'Меню и доставка роллов',
        description: 'Заказывайте роллы и другие блюда с доставкой от Очень Просто в станице Ленинградской.',
      },
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/pages/ProductPage.vue'),
      meta: {
        title: 'Товар',
        description: 'Карточка товара с описанием, составом и КБЖУ.',
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/pages/CartPage.vue'),
      meta: {
        title: 'Корзина',
        description: 'Корзина заказа.',
        noindex: true,
      },
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('@/pages/OrderPage.vue'),
      meta: {
        title: 'Оформление заказа',
        description: 'Оформление заказа.',
        noindex: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: {
        title: 'Страница не найдена',
        description: 'Запрошенная страница не найдена.',
        noindex: true,
      },
    },
  ],
})

router.afterEach((to) => {
  updateSeo({
    title: typeof to.meta.title === 'string' ? to.meta.title : undefined,
    description: typeof to.meta.description === 'string' ? to.meta.description : undefined,
    path: to.path,
    noindex: to.meta.noindex === true,
  })
})

export default router
