<template>
  <nav class="navbar">
    <ul>
      <li><RouterLink to="/">Domov</RouterLink></li>
      <li><RouterLink to="/players">Hráči</RouterLink></li>
      <li><RouterLink to="/teams">Tímy</RouterLink></li>
      <li><RouterLink to="/users">Users</RouterLink></li>
      <li><RouterLink to="/participants">Hráči/Tímy</RouterLink></li>
      <li><RouterLink to="/leagues">Ligy</RouterLink></li>
      <li><RouterLink to="/seasons">Sezóny</RouterLink></li>

      <li v-if="isLoggedIn" class="user-info">
        Prihlásený ako: <strong>{{ userStore.user.username }}</strong> |
        <button @click="logout">Odhlásiť sa</button>
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
  computed: {
    userStore() {
      return useUserStore()
    },
    isLoggedIn() {
      return this.userStore.isLoggedIn
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
      this.$router.push('/login')
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
   border: 1px solid rgba(255, 255, 255, 0.3); /* jemne biely okraj */
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

</style>
