<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <div class="mainLayout">
    <Header id="main-header" />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.mainLayout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--grid-vertical-gap);
}

main {
  flex: 1;
  margin: 0 var(--grid-margin);
}
</style>