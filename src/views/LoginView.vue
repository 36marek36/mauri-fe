<template>
  <AppHeader :title="isLogin ? 'Prihlásenie' : 'Registrácia'" />

  <FlashMessage :message="message" :messageType="messageType" />

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
import AppHeader from '@/components/AppHeader.vue'
import axios from 'axios'
import { useUserStore } from '@/user'
import { flashMessageMixin } from '@/flashMessageMixin'
import FlashMessage from '@/components/FlashMessage.vue'


export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      isLogin: true
    }
  },
  mounted() {
    if (this.$route.query.message === 'logout') {
      this.showMessage('Boli ste úspešne odhlásený.', 'success')
    }
  },
  mixins: [flashMessageMixin],
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin
      this.username = ''
      this.password = ''
      this.confirmPassword = ''
    },
    async handleSubmit() {
      if (!this.isLogin && this.password !== this.confirmPassword) {
        this.showMessage('Heslá sa nezhodujú', 'error')
        return
      }
      const userStore = useUserStore()
      try {
        if (this.isLogin) {
          // Login API call
          const res = await axios.post('/api/rest/auth/login', {
            username: this.username,
            password: this.password
          })
          const token = res.data.token
          // ulož token, presmeruj atď.
          localStorage.setItem('jwt', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await userStore.fetchCurrentUser()

          // Vypíš do konzoly
          console.log('Prihlásený používateľ:', userStore.user)
          this.$router.push('/')
        } else {
          // Signup API call
          await axios.post('/api/rest/auth/register', {
            username: this.username,
            password: this.password
          })
          this.toggleMode()
          this.showMessage('Účet bol vytvorený. Teraz sa môžete prihlásiť.', 'success')
        }
      } catch (err) {
        this.showMessage(err.response?.data?.message || 'Nastala neočakávaná chyba.', 'error')
      }

      // try {
      //   const response = await axios.post('/api/rest/auth/login', {
      //     username: this.username,
      //     password: this.password
      //   })
      //   const token = response.data.token
      //   localStorage.setItem('jwt', token)
      //   this.$router.push('/')
      // } catch (e) {
      //   this.error = 'Zlé prihlasovacie údaje'
      // }
    }
  },
  components: { AppButton, AppHeader, FlashMessage }
}
</script>