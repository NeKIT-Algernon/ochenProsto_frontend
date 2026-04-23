<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getBanners, getCategories, getProductsByCategory } from '@/api'
import type { Banner, Category, Product } from '@/api'
import BannerSlider from '@/components/page_components/homepage/BannerSlider.vue'
import CategoryChipGroup from '@/components/page_components/homepage/CategoryChipGroup.vue'
import CategorySection from '@/components/page_components/homepage/CategorySection.vue'

interface CategoryWithProducts {
  category: Category
  products: Product[]
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price)
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price_formatted: formatPrice(product.price),
  }
}

const banners = ref<Banner[]>([])
const categories = ref<Category[]>([])
const categoriesWithProducts = ref<CategoryWithProducts[]>([])
const selectedCategoryIds = ref<number[]>([])

const isBannersLoading = ref(false)
const bannersErrorMessage = ref('')
const isCategoriesLoading = ref(false)
const categoriesErrorMessage = ref('')
const isProductsLoading = ref(false)
const productsErrorMessage = ref('')

const filteredCategoriesWithProducts = computed(() => {
  if (selectedCategoryIds.value.length === 0) {
    return categoriesWithProducts.value
  }

  return categoriesWithProducts.value.filter((categoryItem) =>
    selectedCategoryIds.value.includes(categoryItem.category.id),
  )
})

async function loadBanners() {
  isBannersLoading.value = true
  bannersErrorMessage.value = ''

  try {
    const response = await getBanners({
      sort: ['sort'],
    })

    banners.value = response.data.data
  } catch (error) {
    bannersErrorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить баннеры.'
  } finally {
    isBannersLoading.value = false
  }
}

async function loadCategories() {
  isCategoriesLoading.value = true
  categoriesErrorMessage.value = ''

  try {
    const response = await getCategories({
      sort: ['name'],
    })

    categories.value = response.data.data
  } catch (error) {
    categoriesErrorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить категории.'
  } finally {
    isCategoriesLoading.value = false
  }
}

async function loadProductsByCategories() {
  isProductsLoading.value = true
  productsErrorMessage.value = ''

  try {
    const categoryProducts = await Promise.all(
      categories.value.map(async (category) => {
        const response = await getProductsByCategory(category.id, {
          sort: ['name'],
          filter: {
            isHidden: {
              _eq: false,
            },
          },
        })

        return {
          category,
          products: response.data.data.map(normalizeProduct),
        }
      }),
    )

    categoriesWithProducts.value = categoryProducts
  } catch (error) {
    productsErrorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить товары.'
  } finally {
    isProductsLoading.value = false
  }
}

onMounted(async () => {
  loadBanners()

  await loadCategories()
  await loadProductsByCategories()
})
</script>

<template>
  <section id="HomeSection">
    <div id="banners-section">
      <p v-if="isBannersLoading">Загрузка баннеров...</p>
      <p v-else-if="bannersErrorMessage">{{ bannersErrorMessage }}</p>
      <p v-else-if="banners.length === 0">Баннеров пока нет.</p>
      <BannerSlider v-else :banners="banners" />
    </div>
    <span class="title">Меню</span>
    <div id="cheap-section">
      <p v-if="isCategoriesLoading">Загрузка категорий...</p>
      <p v-else-if="categoriesErrorMessage">{{ categoriesErrorMessage }}</p>
      <p v-else-if="categories.length === 0">Категорий пока нет.</p>
      <CategoryChipGroup v-else :categories="categories" :selected-ids="selectedCategoryIds"
        @update:selected-ids="selectedCategoryIds = $event" />
    </div>

    <div id="categories-sections">
      <p v-if="isProductsLoading">Загрузка товаров...</p>
      <p v-else-if="productsErrorMessage">{{ productsErrorMessage }}</p>
      <p v-else-if="categoriesWithProducts.length === 0">Товаров пока нет.</p>
      <p v-else-if="filteredCategoriesWithProducts.length === 0">По выбранным категориям товаров нет.</p>
      <CategorySection v-for="categoryItem in filteredCategoriesWithProducts" :key="categoryItem.category.id"
        :title="categoryItem.category.name" :products="categoryItem.products" />
    </div>
  </section>
</template>

<style scoped>
#HomeSection {
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}

#banners-section {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-border-default);
  font-size: var(--font-size-h2);
}

#categories-sections {
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}
</style>
