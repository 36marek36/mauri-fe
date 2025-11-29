import { defineStore } from "pinia";
import api from "@/axios-interceptor";
import router from "@/router";
import { useFlashMessageStore } from "./flashMessage";

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('jwt') || null,
        isLoading: false,
        error: null
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        isAdmin: (state) => state.user?.role?.includes('ADMIN'),
        playerId: (state) => state.user?.playerId || null
    },
    actions: {
        async fetchCurrentUser() {

            if (!this.token) {
                this.user = null
                return
            }

            this.isLoading = true

            try {
                api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
                const response = await api.get('/users/me')
                this.user = response.data
                this.error = null
            } catch (err) {
                this.user = null
                this.error = err.response?.data?.message || 'Chyba pri načítaní používateľa'
            } finally {
                this.isLoading = false
            }
        },
        async login(username, password) {
            const res = await api.post('/auth/login', { username, password })
            this.token = res.data.token
            localStorage.setItem('jwt', this.token)
            api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
            await this.fetchCurrentUser()
            if (window.location.pathname === '/') {
                window.location.reload();
            } else {
                router.push('/')
            }
        },

        async register(username, password) {
            await api.post('/auth/register', { username, password })
        },

        logout() {
            localStorage.removeItem('jwt')  // odstráni token zo storage
            delete api.defaults.headers.common['Authorization']    // odstráni token z hlavičiek pre ďalšie požiadavky
            this.user = null    // resetuje používateľa
            this.token = null
            console.log('Uzivatel odhlaseny')

            const flashMessage = useFlashMessageStore();
            flashMessage.showMessage('Bol si úspešne odhlásený',)

            router.push('/')
        }
    }
})