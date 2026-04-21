<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAssetUrl, getBanners, getCategories, getProductsByCategory } from '@/api'
import type { Banner, Category, Product } from '@/api'

interface CategoryWithProducts {
  category: Category
  products: Product[]
}

const categoriesWithProducts = ref<CategoryWithProducts[]>([])
const banners = ref<Banner[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadHomePageData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [categoriesResponse, bannersResponse] = await Promise.all([
      getCategories({
        sort: ['name'],
      }),
      getBanners({
        sort: ['sort'],
      }),
    ])

    const fetchedCategories = categoriesResponse.data.data

    const productsByCategory = await Promise.all(
      fetchedCategories.map(async (category) => {
        const productsResponse = await getProductsByCategory(category.id, {
          sort: ['name'],
          filter: {
            isHidden: {
              _eq: false,
            },
          },
        })

        return {
          category,
          products: productsResponse.data.data,
        }
      }),
    )

    categoriesWithProducts.value = productsByCategory
    banners.value = bannersResponse.data.data
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить данные из Directus.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadHomePageData()
})
</script>

<template>
  <section>
    <h1>Home page</h1>

    <p v-if="isLoading">Загрузка данных...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <div v-else>
      <section>
        <h2>Баннеры</h2>

        <div v-if="banners.length === 0">Баннеров пока нет.</div>
        <ul v-else>
          <li v-for="banner in banners" :key="banner.id">
            <span>{{ banner.name }}</span>
            <img
              v-if="banner.primary_photo"
              :src="getAssetUrl(banner.primary_photo) ?? ''"
              :alt="banner.name"
              width="240"
            />
            <span v-else> - нет фото</span>
          </li>
        </ul>
      </section>

      <section>
        <h2>Товары по категориям</h2>

        <div v-if="categoriesWithProducts.length === 0">Категорий пока нет.</div>
        <div v-for="categoryItem in categoriesWithProducts" :key="categoryItem.category.id">
          <h3>{{ categoryItem.category.name.toUpperCase() }}:</h3>
          <ul v-if="categoryItem.products.length > 0">
            <li v-for="product in categoryItem.products" :key="product.id">
              <span>{{ product.name }}</span>
              <img
                v-if="product.photo"
                :src="getAssetUrl(product.photo) ?? ''"
                :alt="product.name"
                width="160"
              />
              <span v-else> - нет фото</span>
            </li>
          </ul>
          <p v-else>Товаров в категории нет.</p>
        </div>
      </section>
    </div>
  </section>
</template>
