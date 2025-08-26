<template>

    <div class="change-password-form">
        <form @submit.prevent="handleChangePassword">
            <div>
                <label>Staré heslo:</label>
                <input type="password" v-model="oldPassword" required />
            </div>
            <div>
                <label>Nové heslo:</label>
                <input type="password" v-model="newPassword" :class="{ 'input-error': showPasswordMismatch }"
                    required />
            </div>

            <div>
                <label>Potvrdiť nové heslo:</label>
                <input type="password" v-model="confirmPassword" :class="{ 'input-error': showPasswordMismatch }"
                    required />

            </div>
            <div class="submit-row">
                <AppButton type="default" label="Zmeniť heslo" htmlType="submit" :disabled="showPasswordMismatch" />
                <small v-if="showPasswordMismatch" class="field-error-inline">
                    Heslá sa nezhodujú
                </small>
            </div>
        </form>
    </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import axios from 'axios'
import { useHeaderStore } from '@/stores/header'
import { useFlashMessageStore } from '@/stores/flashMessage';

export default {
    name: 'ChangePassword',
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            header: useHeaderStore()
        }
    },
    created() {
        this.header.setTitle('Zmena hesla', '');
    },
    computed: {
        passwordsMatch() {
            return this.newPassword === this.confirmPassword
        },
        showPasswordMismatch() {
            return (
                this.newPassword.length > 0 &&
                this.confirmPassword.length > 0 &&
                !this.passwordsMatch
            )
        },
        flash() {
            return useFlashMessageStore();
        }
    },
    methods: {
        async handleChangePassword() {
            if (!this.passwordsMatch) {
                this.flash.showMessage('Nové heslá sa nezhodujú.', 'error')
                return
            }

            try {
                await axios.patch('/api/rest/auth/change-password', {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword
                })

                this.flash.showMessage('Heslo bolo úspešne zmenené.', 'success')
                this.oldPassword = ''
                this.newPassword = ''
                this.confirmPassword = ''
                setTimeout(() => {
                    this.$router.push('/')
                }, 3500)
            } catch (err) {
                this.flash.showMessage(err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.', 'error')
            }
        }
    },
    components: { AppButton }
}
</script>

<style scoped>
.change-password-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    /* priehľadné biele pozadie */
    backdrop-filter: blur(12px);
    /* rozmazanie pozadia za tým */
    -webkit-backdrop-filter: blur(12px);
    /* pre Safari */
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

.input-error {
    border-color: red;
}

.submit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.field-error-inline {
    color: red;
    font-size: 1rem;
    white-space: nowrap;
}
</style>