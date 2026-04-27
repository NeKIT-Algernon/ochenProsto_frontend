<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    src: string | null
    alt: string
    imgClass?: string
    loading?: 'eager' | 'lazy'
    decoding?: 'async' | 'sync' | 'auto'
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    imgClass: '',
    loading: 'lazy',
    decoding: 'async',
    fetchpriority: 'auto',
  },
)

const attrs = useAttrs()
const isLoaded = ref(false)
const hasError = ref(false)

const shouldShowImage = computed(() => {
  return Boolean(props.src) && !hasError.value
})

function onLoad() {
  isLoaded.value = true
}

function onError() {
  hasError.value = true
}
</script>

<template>
  <div class="app-image" v-bind="attrs">
    <div class="app-image__placeholder" :class="{ 'app-image__placeholder--hidden': isLoaded }"></div>

    <img
      v-if="shouldShowImage"
      class="app-image__img"
      :class="[imgClass, { 'app-image__img--loaded': isLoaded }]"
      :src="src ?? ''"
      :alt="alt"
      :loading="loading"
      :decoding="decoding"
      :fetchpriority="fetchpriority"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<style scoped>
.app-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-border-default);
}

.app-image__placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.32) 50%,
    rgba(255, 255, 255, 0.06) 100%
  );
  background-size: 200% 100%;
  animation: app-image-shimmer 1.2s linear infinite;
  transition: opacity 0.2s ease;
}

.app-image__placeholder--hidden {
  opacity: 0;
  pointer-events: none;
}

.app-image__img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.app-image__img--loaded {
  opacity: 1;
}

@keyframes app-image-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
