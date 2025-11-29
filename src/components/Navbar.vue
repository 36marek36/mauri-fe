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
        <a class="username" @click="toggleDropdown">{{ userStore.user.username }}</a>
        <div v-if="showDropdown" class="dropdown-menu">
          <AppButton v-if="playerId" label="Detail hráča" type="create" @clicked="goToPlayerDetail" htmlType="button" />
          <AppButton v-else label="Vytvoriť hráča" type="create" @clicked="goToCreatePlayer" />
          <AppButton v-if="playerId" label="Upraviť profil hráča" type="edit" @clicked="goToEditPlayer" />
          <AppButton label="Zmeniť prihlasovacie meno" type="edit" @clicked="goToChangeUsername" />
          <AppButton label="Zmeniť heslo" type="edit" @clicked="goToChangePassword" />
          <AppButton label="Odhlásiť sa" type="delete" @clicked="showLogout = true" />
        </div>
      </li>

      <li v-else>
        <RouterLink to="/login">Prihlásenie</RouterLink>
      </li>
    </ul>
    <LogoutModal :visible="showLogout" @confirm="logout" @cancel="cancelLogout" />
  </nav>
</template>

<script>
import { useUserStore } from '@/stores/user'
import AppButton from './AppButton.vue'
import LogoutModal from './LogoutModal.vue';

export default {
  name: 'Navbar',
  data() {
    return {
      showDropdown: false,
      showLogout: false
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
      this.showLogout = false
      this.userStore.logout()
      this.$router.push({ path: '/', query: { message: 'logout' } })
    },
    cancelLogout() {
      this.showLogout = false;
      this.showDropdown = false;
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
  components: { AppButton, LogoutModal }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem;
  text-align: center;

}

.navbar li {
  transition: transform 0.8s ease;
}

.navbar li:hover {
  transform: scale(1.2);
}

.navbar li:hover a {
  color: whitesmoke;
  text-shadow: 5px 5px 3px rgba(0, 0, 0, 0.85);
}

.navbar ul {
  background: transparent;
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.863);
  border-radius: 10px;
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
  z-index: 1000;
}

.username {
  color: #ffffff;
    text-shadow:
    -0.5px -0.5px 0 #ff0000,
    0.5px -0.5px 0 #ff0000,
    -0.5px 0.5px 0 #ff0000,
    0.5px 0.5px 0 #ff0000;
}

.navbar a.username:hover {
  color: #ffd700;
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
