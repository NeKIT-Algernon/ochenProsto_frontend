<template>
  <footer>
    <h2>Очень просто</h2>
    <p>&#169; 2026</p>
  </footer>
</template>

<style scoped>
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--section-padding);
  border-top: 1px solid var(--color-border-default);
  height: var(--footer-height);
  color: var(--color-border-default);
}

p {
  font-size: var(--font-size-h2);
}
</style>