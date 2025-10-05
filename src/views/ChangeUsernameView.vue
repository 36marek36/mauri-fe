<template>
    <div class="change-username-form">
        <form @submit.prevent="handleChangeUsername">
            <div>
                <label>Nové používateľské meno:</label>
                <input type="text" v-model="newUsername" required />
            </div>

            <div class="submit-row">
                <AppButton type="default" label="Zmeniť meno" htmlType="submit" />
            </div>
        </form>
    </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import api from '@/axios-interceptor'
import { useUserStore } from '@/stores/user'
import { useHeaderStore } from '@/stores/header'
import { useFlashMessageStore } from '@/stores/flashMessage'

export default {
    name: 'ChangeUsername',
    components: { AppButton },
    data() {
        return {
            newUsername: '',
            header: useHeaderStore()
        }
    },
    created() {
        this.header.setTitle('Zmena prihlasovacieho mena', '')
    },
    computed: {
        userStore() {
            return useUserStore()
        },
        flash() {
            return useFlashMessageStore()
        }
    },
    methods: {
        async handleChangeUsername() {
            if (!this.newUsername.trim()) {
                this.flash.showMessage('Používateľské meno nemôže byť prázdne.', 'error')
                return
            }

            try {
                await api.patch('/users/me/update', {
                    newUsername: this.newUsername.trim()
                })

                await this.userStore.fetchCurrentUser()

                this.flash.showMessage('Používateľské meno bolo úspešne zmenené.', 'success')
                this.newUsername = ''

                setTimeout(() => {
                    this.$router.push('/')
                }, 3500)
            } catch (err) {
                this.flash.showMessage(err.response?.data || 'Nepodarilo sa zmeniť meno.', 'error')
            }
        }
    }
}
</script>

<style scoped>
.change-username-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

form>div {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

label {
    flex: 0 0 130px;
    text-align: left;
    margin-right: 1rem;
    font-weight: bold;
}

input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input:focus {
    outline: none;
    border-color: #007bff;
}

.submit-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
}
</style>