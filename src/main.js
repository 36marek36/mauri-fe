import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './user'
import axios from 'axios'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore()

const token = localStorage.getItem('jwt')
if(token) {
    axios.defaults.headers.common['Authorization']=`Bearer ${token}`
    await userStore.fetchCurrentUser()
}

app.mount('#app')
