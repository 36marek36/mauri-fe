import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        isLoading: false,
        error: null
    }),
    getters: {
        isLoggedIn: (state) => !!state.user,
        isAdmin: (state) => state.user?.role?.includes('ADMIN')
    },
    actions: {
        async fetchCurrentUser() {
            const token = localStorage.getItem('jwt')
            if (!token) {
                this.user = null
                return
            }
            this.isLoading = true
            try {
                const response = await axios.get('/api/rest/users/me')
                this.user = response.data
            } catch (err) {
                this.user = null
                this.error = err.response?.data?.message || 'Chyba pri načítaní používateľa'
            } finally {
                this.isLoading = false
            }
        },
        logout() {
            localStorage.removeItem('jwt')
            delete axios.defaults.headers.common['Authorization']
            this.user = null
        }
    }
})