<template>
    <div class="login-register-form">
        <form @submit.prevent="handleSubmit">
            <input v-model="username" placeholder="Užívateľské meno" required />
            <input v-model="password" type="password" placeholder="Heslo" required />

            <input v-if="!isLogin" v-model="confirmPassword" type="password" placeholder="Potvrď heslo" required />

            <AppButton :label="isLogin ? 'Prihlásiť' : 'Registrovať'" htmlType="submit" type="primary" />
        </form>

        <p class="toggle-link">
            <a href="#" @click.prevent="toggleMode">
                {{ isLogin ? 'Nemáš účet? Registruj sa' : 'Už máš účet? Prihlás sa' }}
            </a>
        </p>
    </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import api from '@/axios-interceptor'
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage'

export default {
    name: 'LoginRegisterForm',
    data() {
        return {
            username: '',
            password: '',
            confirmPassword: '',
            isLogin: true
        }
    },
    computed: {
        flash() {
            return useFlashMessageStore()
        }
    },
    methods: {
        toggleMode() {
            this.isLogin = !this.isLogin
            this.username = ''
            this.password = ''
            this.confirmPassword = ''
        },
        async handleSubmit() {
            if (!this.isLogin && this.password !== this.confirmPassword) {
                this.flash.showMessage('Heslá sa nezhodujú', 'error')
                return
            }

            const userStore = useUserStore()

            try {
                if (this.isLogin) {
                    const res = await api.post('/auth/login', {
                        username: this.username,
                        password: this.password
                    })
                    const token = res.data.token
                    localStorage.setItem('jwt', token)
                    this.flash.showMessage('Prihlásenie úspešné', 'success')

                    await userStore.fetchCurrentUser()

                    this.username = ''
                    this.password = ''
                    this.confirmPassword = ''

                    this.$router.push('/')
                } else {
                    await api.post('/auth/register', {
                        username: this.username,
                        password: this.password
                    })
                    this.toggleMode()
                    this.flash.showMessage('Účet bol vytvorený. Teraz sa môžete prihlásiť.', 'success')
                }
            } catch (err) {
                this.flash.showMessage(
                    err.response?.data?.message || 'Nastala chyba.',
                    'error'
                )
            }
        }
    },
    components: {
        AppButton
    }
}
</script>

<style scoped>
.login-register-form {
    max-width: 400px;
    margin: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.toggle-link {
    text-align: center;
    margin-top: 1rem;
}
</style>