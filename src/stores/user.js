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
        isAdmin: (state) => state.user?.role?.includes('ADMIN'),
        playerId: (state) => state.user?.playerId || null
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
                this.error = null
                // console.log('User fetched:', this.user)
            } catch (err) {
                this.user = null
                this.error = err.response?.data?.message || 'Chyba pri načítaní používateľa'
            } finally {
                this.isLoading = false
            }
        },
        logout() {
            localStorage.removeItem('jwt')  // odstráni token zo storage
            delete axios.defaults.headers.common['Authorization']    // odstráni token z hlavičiek pre ďalšie požiadavky
            this.user = null    // resetuje používateľa
            console.log('Uzivatel odhlaseny')
        }
    }
})