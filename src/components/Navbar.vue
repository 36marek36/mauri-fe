<template>
  <nav class="navbar">
    <ul>
      <li>
        <RouterLink to="/">Domov</RouterLink>
      </li>
      <li v-if="isAdmin">
        <RouterLink to="/users">Users</RouterLink>
      </li>
      <li>
        <RouterLink to="/participants">Hráči/Tímy</RouterLink>
      </li>
      <li>
        <RouterLink to="/seasons">Sezóny</RouterLink>
      </li>

      <li v-if="isLoggedIn" class="user-dropdown">
        <span class="username" @click="toggleDropdown">{{ userStore.user.username }}</span>
        <div v-if="showDropdown" class="dropdown-menu">
          <AppButton v-if="playerId" label="Detail hráča" type="create" @clicked="goToPlayerDetail" htmlType="button" />
          <AppButton v-else label="Vytvoriť hráča" type="create" @clicked="goToCreatePlayer" />
          <AppButton v-if="playerId" label="Upraviť profil hráča" type="edit" @clicked="goToEditPlayer" />
          <AppButton label="Zmeniť prihlasovacie meno" type="edit" @clicked="goToChangeUsername" />
          <AppButton label="Zmeniť heslo" type="edit" @clicked="goToChangePassword" />
          <AppButton label="Odhlásiť sa" type="delete" @clicked="logout" />
        </div>
      </li>

      <li v-else>
        <RouterLink to="/login">Prihlásenie</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/user'
import AppButton from './AppButton.vue'

export default {
  name: 'Navbar',
  data() {
    return {
      showDropdown: false
    }

  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    isAdmin() {
      return this.userStore.isAdmin
    },
    playerId() {
      return this.userStore.playerId
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    goToCreatePlayer() {
      this.closeDropdown()
      this.$router.push('/players/create')
    },
    goToEditPlayer() {
      this.closeDropdown()
      this.$router.push(`/players/edit/${this.playerId}`);
    },
    goToPlayerDetail() {
      this.closeDropdown()
      this.$router.push(`/players/${this.playerId}`)
    },
    logout() {
      this.closeDropdown()
      this.userStore.logout()
      this.$router.push({ path: '/login', query: { message: 'logout' } })
    },
    goToChangeUsername() {
      this.closeDropdown();
      this.$router.push('/change-username');
    },
    goToChangePassword() {
      this.closeDropdown()
      this.$router.push('/change-password')
    }
  },
  components: { AppButton }
}
</script>

<style scoped>
.navbar {
  padding: 1rem;
  text-align: center;
}

.navbar ul {
  background: transparent;
  backdrop-filter: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* jemne biely okraj */
  padding: 0.5rem 1rem;
  width: fit-content;
  margin: auto;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  list-style: none;
  text-shadow: 0 0 1px black, 0 0 2px black, 0 0 4px black;
}

.user-dropdown {
  position: relative;
  cursor: pointer;
}

.username {
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  backdrop-filter: blur(12px);
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}


@media (max-width: 768px) {
  .navbar ul {
    width: 100%;
  }

  .navbar {
    padding: 0.5rem;
  }

  .dropdown-menu {
    right: 0;
    left: auto;
  }
}
</style>
