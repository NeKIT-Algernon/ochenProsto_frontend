<script setup lang="ts">
import Footer from '@/components/general/Footer.vue'
import Header from '@/components/general/Header.vue'
</script>

<template>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</template>
