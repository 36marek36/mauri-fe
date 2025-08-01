<template>
    <div class="change-password-form">
        <h2>Zmena hesla</h2>
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
            <div v-if="message" class="success-message">{{ message }}</div>
            <div v-if="error" class="error-message">{{ error }}</div>
        </form>
    </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import axios from 'axios'

export default {
    name: 'ChangePassword',
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            message: '',
            error: ''
        }
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
        }
    },
    methods: {
        async handleChangePassword() {
            this.message = ''
            this.error = ''

            if (!this.passwordsMatch) {
                this.error = 'Nové heslá sa nezhodujú.'
                return
            }

            try {
                await axios.patch('/api/rest/auth/change-password', {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword
                })

                this.message = 'Heslo bolo úspešne zmenené.'
                this.oldPassword = ''
                this.newPassword = ''
                this.confirmPassword = ''
            } catch (err) {
                this.error =
                    err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.'
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

.field-error {
    color: red;
    font-size: 0.85rem;
    margin-left: 130px;

}

.success-message {
    color: green;
    font-weight: bold;
    text-align: center;
    margin-top: 1rem;
}

.error-message {
    color: red;
    font-weight: bold;
    text-align: center;
    margin-top: 1rem;
}

.submit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.field-error-inline {
    color: red;
    font-size: 0.85rem;
    white-space: nowrap;
}
</style>