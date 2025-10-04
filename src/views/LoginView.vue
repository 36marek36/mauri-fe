<template>

  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" placeholder="Užívatelské meno" required />
      <input v-model="password" type="password" placeholder="Heslo" required />

      <input v-if="!isLogin" v-model="confirmPassword" type="password" placeholder="Potvrdenie hesla" required />

      <AppButton :label="isLogin ? 'Prihlásiť' : 'Registrovať'" htmlType="submit" type="primary" />
    </form>

    <p style="margin-top: 1rem;">
      <a href="#" @click.prevent="toggleMode">
        {{ isLogin ? "Ešte nemáš účet? Registruj sa" : "Už máš účet? Prihlás sa" }}
      </a>
    </p>
  </div>
</template>

<script>
import AppButton from '@/components/AppButton.vue'
import api from '@/axios-interceptor';
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      isLogin: true,
    }
  },
  created() {
    const header = useHeaderStore()
    header.setTitle(this.isLogin ? 'Prihlásenie' : 'Registrácia', '')

    if (this.$route.query.message === 'logout') {
      this.flash.showMessage('Boli ste úspešne odhlásený.', 'success')
    }
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin
      this.username = ''
      this.password = ''
      this.confirmPassword = ''
      const header = useHeaderStore()
      header.setTitle(this.isLogin ? 'Prihlásenie' : 'Registrácia', '')
    },
    async handleSubmit() {
      if (!this.isLogin && this.password !== this.confirmPassword) {
        this.flash.showMessage('Heslá sa nezhodujú', 'error')
        return
      }
      const userStore = useUserStore()
      try {
        if (this.isLogin) {
          // Login API call
          const res = await api.post('/auth/login', {
            username: this.username,
            password: this.password
          })
          const token = res.data.token
          // ulož token, presmeruj atď.
          localStorage.setItem('jwt', token)
          // api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await userStore.fetchCurrentUser()

          // Vypíš do konzoly
          console.log('Prihlásený používateľ:', userStore.user)
          this.$router.push('/')
        } else {
          // Signup API call
          await api.post('/auth/register', {
            username: this.username,
            password: this.password
          })
          this.toggleMode()
          this.flash.showMessage('Účet bol vytvorený. Teraz sa môžete prihlásiť.', 'success')
        }
      } catch (err) {
        this.flash.showMessage(err.response?.data?.message || 'Nastala neočakávaná chyba.', 'error')
      }
    }
  },
  computed: {
    flash() {
      return useFlashMessageStore();
    }
  },
  components: { AppButton }
}
</script>