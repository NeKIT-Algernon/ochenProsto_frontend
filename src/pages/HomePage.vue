<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getBanners, getCategories, getProducts } from '@/api'
import type { Banner, Category, Product } from '@/api'
import BannerSlider from '@/components/page_components/homepage/BannerSlider.vue'
import CategoryChipGroup from '@/components/page_components/homepage/CategoryChipGroup.vue'
import CategorySection from '@/components/page_components/homepage/CategorySection.vue'

interface CategoryWithProducts {
  category: Category
  products: Product[]
}

function getProductCategoryId(product: Product) {
  if (typeof product.category === 'number') {
    return product.category
  }

  if (product.category && typeof product.category === 'object' && typeof product.category.id === 'number') {
    return product.category.id
  }

  return null
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
const skeletonCategories = Array.from({ length: 4 }, (_, index) => index)
const skeletonCards = Array.from({ length: 4 }, (_, index) => index)

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
  isProductsLoading.value = true
  categoriesErrorMessage.value = ''
  productsErrorMessage.value = ''

  try {
    // Главную собираем из одного запроса категорий и одного запроса товаров, чтобы не ждать N запросов по категориям.
    const [categoriesResponse, productsResponse] = await Promise.all([
      getCategories({
        sort: ['name'],
      }),
      getProducts({
        sort: ['name'],
        filter: {
          isHidden: {
            _eq: false,
          },
        },
      }),
    ])

    categories.value = categoriesResponse.data.data
    const products = productsResponse.data.data.map(normalizeProduct)
    const productsByCategoryId = products.reduce<Record<number, Product[]>>((acc, product) => {
      const categoryId = getProductCategoryId(product)

      if (categoryId === null) {
        return acc
      }

      if (!acc[categoryId]) {
        acc[categoryId] = []
      }

      acc[categoryId].push(product)
      return acc
    }, {})

    categoriesWithProducts.value = categories.value.map((category) => ({
      category,
      products: productsByCategoryId[category.id] ?? [],
    }))
  } catch (error) {
    categoriesErrorMessage.value =
      error instanceof Error ? error.message : 'Не удалось загрузить категории.'
    productsErrorMessage.value = categoriesErrorMessage.value
  } finally {
    isCategoriesLoading.value = false
    isProductsLoading.value = false
  }
}

onMounted(() => {
  void loadBanners()
  void loadCategories()
})
</script>

<template>
  <section id="HomeSection">
    <div id="banners-section">
      <div v-if="isBannersLoading" class="homepage-skeleton homepage-skeleton--banner"></div>
      <p v-else-if="bannersErrorMessage">{{ bannersErrorMessage }}</p>
      <p v-else-if="banners.length === 0">Баннеров пока нет.</p>
      <BannerSlider v-else :banners="banners" />
    </div>
    <span class="title">Меню</span>
    <div id="cheap-section">
      <div v-if="isCategoriesLoading" class="category-chip-skeletons">
        <span v-for="item in skeletonCategories" :key="item" class="homepage-skeleton homepage-skeleton--chip"></span>
      </div>
      <p v-else-if="categoriesErrorMessage">{{ categoriesErrorMessage }}</p>
      <p v-else-if="categories.length === 0">Категорий пока нет.</p>
      <CategoryChipGroup v-else :categories="categories" :selected-ids="selectedCategoryIds"
        @update:selected-ids="selectedCategoryIds = $event" />
    </div>

    <div id="categories-sections">
      <div v-if="isProductsLoading" class="category-section-skeleton">
        <span class="homepage-skeleton homepage-skeleton--title"></span>
        <div class="category-section-skeleton__grid">
          <div v-for="item in skeletonCards" :key="item" class="homepage-skeleton homepage-skeleton--card"></div>
        </div>
      </div>
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
  gap: calc(var(--grid-vertical-gap) * 2);
}

.homepage-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.34) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: homepage-skeleton-shimmer 1.2s linear infinite;
}

.homepage-skeleton--banner {
  width: 100%;
  aspect-ratio: 1248 / 350;
  border-radius: var(--radius);
}

.category-chip-skeletons {
  display: flex;
  gap: var(--small-gap);
  flex-wrap: wrap;
}

.homepage-skeleton--chip {
  width: 140px;
  height: 42px;
  border-radius: 999px;
}

.category-section-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.homepage-skeleton--title {
  width: 220px;
  height: 28px;
  border-radius: calc(var(--radius) / 2);
}

.category-section-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-horizontal-gap);
}

.homepage-skeleton--card {
  width: 100%;
  aspect-ratio: 0.78;
  border-radius: var(--radius);
}

@keyframes homepage-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1300px) {
  .category-section-skeleton__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .category-section-skeleton__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
