<template>
  <nav class="navbar">
    <ul>
      <li>
        <RouterLink to="/">Domov</RouterLink>
      </li>
      <li>
        <RouterLink to="/players">Hráči</RouterLink>
      </li>
      <li>
        <RouterLink to="/teams">Tímy</RouterLink>
      </li>
      <li v-if="isAdmin">
        <RouterLink to="/users">Users</RouterLink>
      </li>
      <li>
        <RouterLink to="/participants">Hráči/Tímy</RouterLink>
      </li>
      <li>
        <RouterLink to="/leagues">Ligy</RouterLink>
      </li>
      <li>
        <RouterLink to="/seasons">Sezóny</RouterLink>
      </li>

      <!-- <li v-if="isLoggedIn">
        <strong>{{ userStore.user.username }}</strong> |
        <button @click="logout">Odhlásiť sa</button>
      </li> -->
      <li v-if="isLoggedIn" class="user-dropdown">
        <span class="username" @click="toggleDropdown">{{ userStore.user.username }}</span>
        <ul v-if="showDropdown" class="dropdown-menu">
          <li><button @click="logout">Odhlásiť sa</button></li>
        </ul>
      </li>

      <li v-else>
        <RouterLink to="/login">Prihlásenie</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script>
import { useUserStore } from '@/user'

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
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    logout() {
      this.showDropdown=false
      this.userStore.logout()
      this.$router.push({ path: '/login', query: { message: 'logout' } })
    }
  }
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
}
</style>
