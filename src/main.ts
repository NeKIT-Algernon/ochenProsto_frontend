import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useSiteSettingsStore } from './stores/siteSettings'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

const siteSettingsStore = useSiteSettingsStore(pinia)

// Не блокируем первый рендер ожиданием API, чтобы не держать белый экран.
void siteSettingsStore.loadSiteSettings().catch(() => {
  // Store keeps the error state; app boot should continue.
})
