<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Arrow_left from '@/assets/icons/arrow-left.svg'
</script>

<template>
    <div class="home-page-button-block">
        <RouterLink to="/" class="home-page-button">
            <Arrow_left class="arrow-icon" /> Главная
        </RouterLink>
    </div>
</template>

<style scoped>
.home-page-button-block {
    display: block;
}

.home-page-button {
    display: inline-flex;
    color: var(--color-text-primary);
    text-decoration: none;
    font-size: var(--font-size-h4);
    align-items: center;
    gap: 8px;
    padding: 4px 16px 4px 0;
}

.arrow-icon {
    width: var(--font-size-h1);
    height: var(--font-size-h1);
}
</style>
