<!-- <template>
  <div>
    <h2>Prihlásenie</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      
      <AppButton
        label="Login"
        type="primary"      
        htmlType="submit"  
      />
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template> -->

<template>
   <AppHeader :title="isLogin ? 'Prihlásenie' : 'Registrácia'" />
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="username" placeholder="Užívatelské meno" required />
      <input v-model="password" type="password" placeholder="Heslo" required />

      <input
        v-if="!isLogin"
        v-model="confirmPassword"
        type="password"
        placeholder="Potvrdenie hesla"
        required
      />

      <AppButton
        :label="isLogin ? 'Prihlásiť' : 'Registrovať'"
        htmlType="submit"
        type="primary"
      />
    </form>

    <p v-if="error" style="color: red">{{ error }}</p>

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

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      isLogin: true,
      error: null
    }
  },
  methods: {
     toggleMode() {
      this.isLogin = !this.isLogin
      this.error = null
      this.username = ''
      this.password = ''
      this.confirmPassword = ''
    },
    async handleSubmit() {
      this.error = null
       if (!this.isLogin && this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }
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
          this.$router.push('/')
        } else {
          // Signup API call
          await axios.post('/api/rest/auth/register', {
            username: this.username,
            password: this.password
          })
          this.toggleMode()
          this.error = 'Účet bol vytvorený. Teraz sa môžete prihlásiť.'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Unexpected error occurred'
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
  components:{AppButton,AppHeader}
}
</script>