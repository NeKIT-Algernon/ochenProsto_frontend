<script setup lang="ts">
import type { Component } from 'vue'

interface SwitchOption {
  label: string
  value: string
  icon?: string | Component
  iconClass?: string
}

defineProps<{
  modelValue: string
  options: [SwitchOption, SwitchOption]
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Компонент только переключает значение, а бизнес-логика остается в форме.
function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="two-state-switch" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      class="two-state-switch__option"
      :class="{ 'two-state-switch__option--active': modelValue === option.value }"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      @click="selectOption(option.value)"
    >
      <component
        :is="option.icon"
        v-if="option.icon"
        class="two-state-switch__icon"
        :class="option.iconClass"
      />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.two-state-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-self: center;
  width: min(100%, 360px);
  border: 1px solid var(--color-border-default);
  border-radius: calc(var(--radius) / 2);
  background-color: var(--color-background-field);
}

.two-state-switch__option {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-height: 44px;
  padding: 16px 16px;
  border: none;
  border-radius: calc(var(--radius) / 2);
  background-color: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: calc(var(--font-size-normal) * 0.8);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.two-state-switch__icon {
  flex-shrink: 0;
  color: var(--color-primary);
}

.two-state-switch__icon--delivery {
  width: 83px;
  height: 40px;
}

.two-state-switch__icon--pickup {
  width: 56px;
  height: 60px;
}

.two-state-switch__icon :deep(path) {
  fill: currentColor;
}

.two-state-switch__option--active {
  background-color: var(--color-primary);
  color: var(--color-background-field);
}

.two-state-switch__option--active .two-state-switch__icon {
  color: var(--color-background-field);
}

.two-state-switch__option:focus-visible {
  outline: 2px solid var(--color-hover);
  outline-offset: 2px;
}
</style>
