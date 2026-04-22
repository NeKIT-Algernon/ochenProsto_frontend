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

const siteSettingsStore = useSiteSettingsStore(pinia)

try {
  await siteSettingsStore.loadSiteSettings()
} catch {
  // Store keeps the error state; app boot should continue.
}

app.mount('#app')
