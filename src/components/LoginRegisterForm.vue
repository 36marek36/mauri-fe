<template>
    <div class="login-register-form">
        <form @submit.prevent="handleSubmit">
            <input v-model="username" placeholder="Užívateľské meno" required />
            <input v-model="password" type="password" placeholder="Heslo" required />

            <input v-if="!isLogin" v-model="confirmPassword" type="password" placeholder="Potvrď heslo" required />

            <div class="log-button">
                <AppButton :label="isLogin ? 'Prihlásiť' : 'Registrovať'" htmlType="submit" type="edit" />
            </div>

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
            this.$emit('mode-changed', this.isLogin)
        },
        async handleSubmit() {

            const userStore = useUserStore()

            if (!this.isLogin && this.password !== this.confirmPassword) {
                this.flash.showMessage('Heslá sa nezhodujú', 'error')
                return
            }

            try {
                if (this.isLogin) {
                    await userStore.login(this.username,this.password)
                    this.flash.showMessage('Prihlásenie úspešné', 'success')
                    if (this.$route.path === '/login'){
                        this.$router.push('/')
                    }
                } 
                else {
                   await userStore.register(this.username,this.password)
                    this.toggleMode()
                    this.flash.showMessage('Účet bol vytvorený. Teraz sa môžete prihlásiť.', 'success')
                }

                this.username=''
                this.password=''
                this.confirmPassword=''

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

.log-button {
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem;
    width: 100%;
}

input {
    padding: 0.5rem;
    margin: 0.2rem;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.toggle-link {
    text-align: center;
    margin-top: 1rem;
}
</style>