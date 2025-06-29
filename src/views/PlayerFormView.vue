<template>

  <AppHeader title="Vytvorenie nového hráča" />

  <div class="create-player">

    <form @submit.prevent="submitForm">
      <label>Meno:
        <input v-model="player.firstName" type="text" required />
      </label>

      <label>Priezvisko:
        <input v-model="player.lastName" type="text" required />
      </label>

      <label>Email:
        <input v-model="player.email" type="email" />
      </label>

      <label>Telefón:
        <input v-model="player.phone" type="text" />
      </label>

      <button type="submit">Vytvoriť</button>
    </form>

    <p v-if="responseMessage">{{ responseMessage }}</p>

  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import axios from 'axios'
import { useUserStore } from '@/user'

export default {
  name: 'CreatePlayer',
  data() {
    return {
      player: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      responseMessage: ''
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isAdmin() {
      return this.userStore.isAdmin
    }
  },
  methods: {
    async submitForm() {
      const endpoint = this.isAdmin
        ? '/api/rest/players/admin/createPlayer'
        : '/api/rest/players/user/createPlayer'

      try {
        const response = await axios.post(endpoint, this.player)
        console.log('Hráč: ' + response.data.firstName + ' bol úspešne vytvorený.')
        this.responseMessage = 'Hráč ' + response.data.firstName + ' bol úspešne vytvorený.'

        await this.userStore.fetchCurrentUser()

        setTimeout(() => {
          this.$router.push('/participants')
        }, 2000)
      } catch (error) {
        this.responseMessage = 'Chyba pri vytváraní hráča.'
        console.error(error)
      }
    }
  },
  components: { AppHeader }
}
</script>


<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
}

label {
  margin-bottom: 10px;
}

button {
  margin-top: 10px;
}
</style>
