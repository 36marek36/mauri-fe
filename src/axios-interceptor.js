import axios from 'axios'
import { useUserStore } from './user'

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && localStorage.getItem('jwt')) {
            const userStore = useUserStore()
            userStore.logout()
            showLogoutMessageAndRedirect()
        }

        return Promise.reject(error)
    }
)

// 🧠 Pomocná funkcia na zobrazenie správy a presmerovanie
function showLogoutMessageAndRedirect() {
    // Dynamicky vlož do DOM hlášku
    const div = document.createElement('div')
    div.textContent = 'Boli ste odhlásený. Presmerujem na prihlásenie.'
    div.style.position = 'fixed'
    div.style.top = '20px'
    div.style.left = '50%'
    div.style.transform = 'translateX(-50%)'
    div.style.backgroundColor = '#f44336'
    div.style.color = 'white'
    div.style.padding = '12px 24px'
    div.style.borderRadius = '4px'
    div.style.zIndex = '9999'
    div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)'
    document.body.appendChild(div)

    setTimeout(() => {
        div.remove()
        window.location.href = '/login'
    }, 2000)
}