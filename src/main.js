import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import './axios-interceptor'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function initApp() {
  const userStore = useUserStore()
  const token = localStorage.getItem('jwt')

  if (token) {
    await userStore.fetchCurrentUser()
  }

  app.mount('#app')
}

initApp()
