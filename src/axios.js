// import axios from 'axios'

// // Vytvor si novú inštanciu axiosu
// const api = axios.create({
//     baseURL: '/api',
//     headers: {
//         'Content-Type': 'application/json'
//     }
// })

// // 🔐 Automatické pridanie tokenu
// // Nepridávaj token na verejné endpointy
// const publicPaths = ['/login', '/register', '/players/', '/teams/']
// api.interceptors.request.use(config => {
//     const token = localStorage.getItem('token')
//     const isPublic = publicPaths.some(path => config.url.startsWith(path))
//     if (token && !isPublic) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
// })

// // ⚠️ Interceptor pre chyby odpovedí (napr. expirovaný token)
// api.interceptors.response.use(
//     response => response,
//     error => {
//         const status = error.response?.status
//         const message = error.response?.data?.message

//         if (status === 401 && (message === 'Token expired' || message === 'Invalid token')) {
//             alert('Bol si odhlásený z dôvodu nečinnosti alebo neplatného tokenu.')
//             localStorage.removeItem('token')
//             delete api.defaults.headers.common['Authorization']
//             window.location.href = '/login'
//         }

//         return Promise.reject(error)
//     }
// )

// export default api