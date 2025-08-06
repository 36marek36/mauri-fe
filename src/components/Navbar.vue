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
        <ul v-if="showDropdown" class="dropdown-menu">
          <li v-if="playerId">
            <AppButton label="Detail hráča" type="create" @clicked="goToPlayerDetail" />
          </li>
          <li v-else>
            <AppButton label="Vytvoriť hráča" type="create" @clicked="goToCreatePlayer" />
          </li>
          <li>
            <AppButton label="Zmeniť heslo" type="default" @clicked="goToChangePassword" />
          </li>
          <li>
            <AppButton label="Odhlásiť sa" type="delete" @clicked="logout" />
          </li>
        </ul>
      </li>

      <li v-else>
        <RouterLink to="/login">Prihlásenie</RouterLink>
      </li>
    </ul>

    <div v-if="userStore.error" class="error-message">
      {{ userStore.error }}
    </div>

  </nav>
</template>

<script>
import { useUserStore } from '@/user'
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
    goToPlayerDetail() {
      this.closeDropdown()
      this.$router.push(`/players/${this.playerId}`)
    },
    logout() {
      this.closeDropdown()
      this.userStore.logout()
      this.$router.push({ path: '/login', query: { message: 'logout' } })
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
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.dropdown-menu li {
  list-style: none;
  margin: 0;
}

.error-message {
  color: red;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
</style>
