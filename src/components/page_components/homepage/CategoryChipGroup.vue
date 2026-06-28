<script setup lang="ts">
import { computed } from 'vue'
import CategoryChip from './CategoryChip.vue'
import type { Category } from '@/api'
import { capitalizeBackendText } from '@/utils/text'

const props = defineProps<{
  categories: Category[]
  selectedIds: number[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [value: number[]]
}>()

const hasSelectedChips = computed(() => props.selectedIds.length > 0)

function toggleChip(categoryId: number) {
  const isSelected = props.selectedIds.includes(categoryId)

  if (isSelected) {
    emit(
      'update:selectedIds',
      props.selectedIds.filter((selectedId) => selectedId !== categoryId),
    )
    return
  }

  emit('update:selectedIds', [...props.selectedIds, categoryId])
}

function resetChips() {
  emit('update:selectedIds', [])
}
</script>

<template>
  <div class="category-chip-group">
    <CategoryChip v-for="category in categories" :key="category.id" :label="capitalizeBackendText(category.name)"
      :checked="selectedIds.includes(category.id)" :disabled="disabled" @toggle="toggleChip(category.id)" />

    <button class="category-chip-group__reset" type="button" aria-label="Сбросить выбранные категории"
      @click="resetChips">
      ×
    </button>
  </div>
</template>

<style scoped>
.category-chip-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--small-gap);
}

.category-chip-group__reset {
  flex-shrink: 0;
  padding: 8px 12px;
  border: 1px solid var(--color-border-default);
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  font-weight: 300;
  font-size: var(--font-size-primary);
}

.category-chip-group__reset:hover {
  background-color: var(--color-border-default);
}

.category-chip-group__reset:active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .category-chip-group {
    align-items: flex-start;
  }
}
</style>
