<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="list-or-nothing">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Meno</label>
            <input v-model="player.firstName" type="text" />
          </div>

          <div class="form-group">
            <label>Priezvisko</label>
            <input v-model="player.lastName" type="text" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="player.email" type="email" />
          </div>

          <div class="form-group">
            <label>Telefón</label>
            <input v-model="player.phone" type="text" />
          </div>

          <div class="form-actions">
            <AppButton :label="isEdit ? 'Upraviť' : 'Vytvoriť'" :type="isEdit ? 'edit' : 'create'" htmlType="submit" />

            <AppButton v-if="isEdit" label="Vymazať" type="delete" @clicked="confirmDeletePlayer" />
          </div>

        </form>
      </div>
      <div class="second" v-if="!isEdit">
        <div class="list-or-nothing">
          <p class="text" ref="text"></p>
        </div>
      </div>

      <AppModal :visible="showDeleteModal" :message="'Naozaj si chceš vymazať hráča?'" @confirm="deletePlayer"
        @cancel="cancelDelete" />
    </div>

  </div>


</template>

<script>
import api from '@/axios-interceptor';
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage';
import { useHeaderStore } from '@/stores/header';
import AppButton from '@/components/AppButton.vue';
import AppModal from '@/components/AppModal.vue';
import { typeText } from '@/utils/typingEffect';
import { newPlayerText } from '@/assets/newPlayerText';

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
      showDeleteModal: false,
      newPlayerText,
      userStore: useUserStore()
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
  mounted() {
    if (!this.isEdit) {
      typeText(newPlayerText, this.$refs.text, 40); // môžeš upraviť rýchlosť
    }

  },
  computed: {
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
.list-or-nothing {
  padding: 1.2rem;
  flex: 0 0 40%;
}

.second {
  flex: 0 0 60%;
}

.text {
  width: 100%;
  margin: 0.5rem;
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}

label {
  margin-bottom: 0.4rem;
  font-weight: 600;
}

input {
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #555;
  background: #3c3c3d;
  color: white;
  transition: 0.2s ease;
}

input:focus {
  border-color: #8ac6ff;
  background: #454547;
  outline: none;
  box-shadow: 0px 0px 0px 2px rgba(138, 198, 255, 0.3);
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

::v-deep ul {
  list-style: decimal;
  padding-left: 2rem;
  margin: 0;
  text-align: left;
}

::v-deep li {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

:deep(p) {
  text-align: center;
}


:deep(strong) {
  font-weight: 600;
  color: whitesmoke;
  font-size: 1.5rem;
}
</style>
