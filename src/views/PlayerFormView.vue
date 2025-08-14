<template>

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

  </div>
</template>

<script>
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';

export default {
  name: 'CreatePlayer',
  data() {
    return {
      player: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      }
    }
  },
  created() {
    const header = useHeaderStore();
    header.setTitle('Vytvorenie nového hráča', '');
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    flash() {
      return useFlashMessageStore();
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
        this.flash.showMessage('Hráč ' + response.data.firstName + ' bol úspešne vytvorený.', 'success')

        await this.userStore.fetchCurrentUser()

        setTimeout(() => {
          this.$router.push('/participants')
        }, 2000)
      } catch (error) {
        this.flash.showMessage('Chyba pri vytváraní hráča.', 'error')
        console.error(error)
      }
    }
  }
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
