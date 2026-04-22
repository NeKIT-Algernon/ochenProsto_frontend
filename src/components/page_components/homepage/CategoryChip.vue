<script setup lang="ts">
defineProps<{
  label: string
  checked: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button class="category-chip" :class="{ 'category-chip--checked': checked }" :disabled="disabled" type="button"
    @click="emit('toggle')">
    {{ label }}
  </button>
</template>

<style scoped>
.category-chip {
  padding: 8px 16px;
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  background-color: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  font-weight: 300;
  font-size: var(--font-size-primary);
}

.category-chip:hover {
  background-color: var(--color-border-default);
}

.category-chip--checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.category-chip--checked:hover {
  background-color: var(--color-hover);
}
</style>
