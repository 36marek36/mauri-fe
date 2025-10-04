// import axios from 'axios'
// import { useUserStore } from './stores/user'
// import { useFlashMessageStore } from '@/stores/flashMessage'


// axios.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.status === 401 && localStorage.getItem('jwt')) {
//       const userStore = useUserStore()
//       const flash = useFlashMessageStore()

//       userStore.logout()
//       flash.showMessage('Boli ste odhlásený. Presmerujem na prihlásenie.', 'error')

//       setTimeout(() => {
//         window.location.href = '/login'
//       }, 2000)
//     }

//     return Promise.reject(error)
//   }
// )

import axios from 'axios'
import { useUserStore } from './stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Request interceptor – pridá token do každého requestu
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor – rieši 401 chybu
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && localStorage.getItem('jwt')) {
      const userStore = useUserStore()
      const flash = useFlashMessageStore()

      userStore.logout()
      flash.showMessage('Boli ste odhlásený. Presmerujem na prihlásenie.', 'error')

      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }

    return Promise.reject(error)
  }
)

export default api