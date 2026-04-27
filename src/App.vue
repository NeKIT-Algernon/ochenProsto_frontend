<script setup lang="ts">
import MainLayout from '@/components/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <RouterView v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <section class="route-fallback">
            <div class="route-fallback__banner"></div>
            <div class="route-fallback__line route-fallback__line--wide"></div>
            <div class="route-fallback__line"></div>
            <div class="route-fallback__grid">
              <div v-for="item in 4" :key="item" class="route-fallback__card"></div>
            </div>
          </section>
        </template>
      </Suspense>
    </RouterView>
  </MainLayout>
</template>

<style scoped>
.route-fallback {
  display: flex;
  flex-direction: column;
  gap: var(--normal-gap);
}

.route-fallback__banner,
.route-fallback__line,
.route-fallback__card {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.34) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: route-fallback-shimmer 1.2s linear infinite;
}

.route-fallback__banner {
  width: 100%;
  aspect-ratio: 1248 / 350;
  border-radius: var(--radius);
}

.route-fallback__line {
  width: 40%;
  height: 22px;
  border-radius: calc(var(--radius) / 2);
}

.route-fallback__line--wide {
  width: 60%;
}

.route-fallback__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-horizontal-gap);
}

.route-fallback__card {
  aspect-ratio: 0.78;
  border-radius: var(--radius);
}

@keyframes route-fallback-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1300px) {
  .route-fallback__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .route-fallback__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
