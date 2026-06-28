<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getAssetUrl } from '@/api'
import type { Banner } from '@/api'
import AppImage from '@/components/AppImage.vue'

const props = defineProps<{
  banners: Banner[]
}>()

const currentSlideIndex = ref(0)
const transitionName = ref('slide-next')
const touchStartX = ref<number | null>(null)
const swipeThreshold = 40
const autoplayDelay = 5000

let autoplayIntervalId: ReturnType<typeof setInterval> | null = null
let autoplayResumeTimeoutId: ReturnType<typeof setTimeout> | null = null

const currentBanner = computed(() => {
  return props.banners[currentSlideIndex.value] ?? null
})

function clearAutoplayInterval() {
  if (autoplayIntervalId) {
    clearInterval(autoplayIntervalId)
    autoplayIntervalId = null
  }
}

function clearAutoplayResumeTimeout() {
  if (autoplayResumeTimeoutId) {
    clearTimeout(autoplayResumeTimeoutId)
    autoplayResumeTimeoutId = null
  }
}

function startAutoplay() {
  clearAutoplayInterval()

  if (props.banners.length <= 1) {
    return
  }

  autoplayIntervalId = setInterval(() => {
    showNextSlide(false)
  }, autoplayDelay)
}

function stopAutoplay() {
  clearAutoplayInterval()
}

function pauseAutoplayAfterInteraction() {
  stopAutoplay()
  clearAutoplayResumeTimeout()

  autoplayResumeTimeoutId = setTimeout(() => {
    startAutoplay()
  }, autoplayDelay)
}

function showPreviousSlide(isManual = true) {
  if (props.banners.length === 0) {
    return
  }

  transitionName.value = 'slide-prev'
  currentSlideIndex.value =
    (currentSlideIndex.value - 1 + props.banners.length) % props.banners.length

  if (isManual) {
    pauseAutoplayAfterInteraction()
  }
}

function showNextSlide(isManual = true) {
  if (props.banners.length === 0) {
    return
  }

  transitionName.value = 'slide-next'
  currentSlideIndex.value = (currentSlideIndex.value + 1) % props.banners.length

  if (isManual) {
    pauseAutoplayAfterInteraction()
  }
}

function goToSlide(index: number) {
  if (index === currentSlideIndex.value) {
    return
  }

  transitionName.value = index > currentSlideIndex.value ? 'slide-next' : 'slide-prev'
  currentSlideIndex.value = index
  pauseAutoplayAfterInteraction()
}

function onTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX ?? null
  stopAutoplay()
}

function onTouchEnd(event: TouchEvent) {
  if (touchStartX.value === null) {
    return
  }

  const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.value
  const deltaX = touchEndX - touchStartX.value

  touchStartX.value = null

  if (Math.abs(deltaX) < swipeThreshold) {
    startAutoplay()
    return
  }

  if (deltaX < 0) {
    showNextSlide()
    return
  }

  showPreviousSlide()
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  clearAutoplayInterval()
  clearAutoplayResumeTimeout()
})
</script>

<template>
  <section class="banner-slider" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
    <div class="banner-slider__viewport" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <Transition :name="transitionName" mode="out-in">
        <AppImage v-if="currentBanner" :key="currentBanner.id" class="banner-slider__image-wrapper"
          :src="getAssetUrl(currentBanner.primary_photo, { format: 'webp', width: 1920 })"
          :alt="currentBanner.name" img-class="banner-slider__image" loading="eager" fetchpriority="high" />
      </Transition>

      <button class="banner-slider__control-zone banner-slider__control-zone--prev" type="button"
        @click="showPreviousSlide()" aria-label="Предыдущий баннер" />

      <button class="banner-slider__control-zone banner-slider__control-zone--next" type="button"
        @click="showNextSlide()" aria-label="Следующий баннер" />
    </div>

    <div class="banner-slider__dots">
      <button v-for="(banner, index) in banners" :key="banner.id" class="banner-slider__dot"
        :class="{ 'banner-slider__dot--active': index === currentSlideIndex }" type="button"
        :aria-label="`Перейти к баннеру ${index + 1}`" @click="goToSlide(index)" />
    </div>
  </section>
</template>

<style scoped>
.banner-slider {
  width: 100%;
  aspect-ratio: 1248 / 350;
}

.banner-slider__viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1248 / 320;
  overflow: hidden;
  border-radius: var(--radius);
}

.banner-slider__image-wrapper {
  width: 100%;
  height: 100%;
}

.banner-slider__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius);
}

.banner-slider__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-slider__control-zone {
  position: absolute;
  top: 0;
  z-index: 1;
  width: 15%;
  height: 100%;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.banner-slider__control-zone--prev {
  left: 0;
}

.banner-slider__control-zone--next {
  right: 0;
}

.banner-slider__dots {
  display: flex;
  justify-content: center;
  gap: calc(var(--radius)/2);
  margin-top: calc(var(--radius)/2);
}

.banner-slider__dot {
  width: calc(var(--radius)/2);
  height: calc(var(--radius)/2);
  ;
  border: none;
  border-radius: 50%;
  background-color: var(--color-border-default);
  cursor: pointer;
}

.banner-slider__dot--active {
  background-color: var(--color-hover);
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(56px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-56px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-56px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(56px);
}

@media (max-width: 768px) {

  .slide-next-enter-from {
    transform: translateX(32px);
  }

  .slide-next-leave-to {
    transform: translateX(-32px);
  }

  .slide-prev-enter-from {
    transform: translateX(-32px);
  }

  .slide-prev-leave-to {
    transform: translateX(32px);
  }
}
</style>
