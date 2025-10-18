<template>

  <div class="create-player">

    <form @submit.prevent="submitForm">
      <label>Meno:
        <input v-model="player.firstName" type="text" />
      </label>

      <label>Priezvisko:
        <input v-model="player.lastName" type="text" />
      </label>

      <label>Email:
        <input v-model="player.email" type="text" />
      </label>

      <label>Telefón:
        <input v-model="player.phone" type="text" />
      </label>

      <AppButton :label="isEdit ? 'Upraviť' : 'Vytvoriť'" :type="isEdit ? 'edit' : 'create'" htmlType="submit" />
      <AppButton v-if="isEdit" label="Vymazat" type="delete" @clicked="confirmDeletePlayer" />

    </form>

  </div>
  <AppModal :visible="showDeleteModal" :message="'Naozaj si chceš vymazať hráča?'" @confirm="deletePlayer"
    @cancel="cancelDelete" />
</template>

<script>
import api from '@/axios-interceptor';
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import AppButton from '@/components/AppButton.vue';
import AppModal from '@/components/AppModal.vue';

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
      isEdit: false,
      playerId: null,
      showDeleteModal: false
    }
  },
  created() {
    const header = useHeaderStore();

    this.playerId = this.$route.params.id;
    this.isEdit = !!this.playerId;

    if (this.isEdit) {
      header.setTitle('Úprava profilu hráča', '');
      this.loadPlayer();
    } else {
      header.setTitle('Vytvorenie nového hráča', '');
    }
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
    async loadPlayer() {
      try {
        const response = await api.get(`/players/${this.playerId}`);
        this.player = {
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone
        };
      } catch (error) {
        console.error('Chyba pri načítaní hráča:', error);
        this.flash.showMessage('Nepodarilo sa načítať hráča.', 'error');
        // prípadne presmerovať alebo inak riešiť
      }
    },
    async deletePlayer() {
      try {
        await api.delete('/players/' + this.playerId)
        this.flash.showMessage(`Hráč ${this.player.firstName} ${this.player.lastName} bol úspešne vymazaný.`, 'success')
        await this.userStore.fetchCurrentUser();
        this.$router.push('/participants')
      } catch (err) {
        console.error('Chyba', err)
      } finally {
        this.cancelDelete()
      }
    },
    confirmDeletePlayer() {
      this.showDeleteModal = true
    },
    cancelDelete() {
      this.showDeleteModal = false
    },
    async submitForm() {
      try {
        if (this.isEdit) {
          // PATCH request na úpravu hráča
          await api.patch(`/players/${this.playerId}`, this.player);
          this.flash.showMessage('Hráč bol úspešne upravený.', 'success');
          await this.userStore.fetchCurrentUser();
          this.$router.push('/players/' + this.playerId)
        } else {
          // POST request na vytvorenie hráča
          const endpoint = this.isAdmin
            ? '/players/admin/createPlayer'
            : '/players/user/createPlayer'

          const response = await api.post(endpoint, this.player);
          this.flash.showMessage(`Hráč ${response.data.firstName} bol úspešne vytvorený.`, 'success');
          await this.userStore.fetchCurrentUser();
          this.$router.push('/participants');
        }
      } catch (err) {
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;

          if (status === 400) {
            this.flash.showMessage(data.message || 'Chyba: neplatné dáta.', 'warning');
          } else if (status === 409) {
            this.flash.showMessage(data.message || 'Hráč už existuje.', 'warning');
          } else {
            this.flash.showMessage('Neznáma chyba pri ukladaní hráča.', 'error');
          }

          console.error('Chyba pri ukladaní hráča:', err);
        } else {
          this.flash.showMessage('Nepodarilo sa pripojiť k serveru.', 'error');
          console.error('Sieťová chyba:', err);
        }
      }
    }
  },
  components: { AppButton, AppModal }
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
