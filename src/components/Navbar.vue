<template>
  <div>
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="message">
        <FlashMessage v-if="hasFlashMessage" />
      </div>
      <nav class="navbar">
        <!-- HAMBURGER -->
        <button class="hamburger" @click="toggleMobileMenu">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
          <span class="label">Menu</span>
        </button>

        <ul :class="{ open: showMobileMenu }">
          <li>
            <RouterLink to="/" @click="closeMobileMenu">Domov</RouterLink>
          </li>
          <li v-if="isAdmin">
            <RouterLink to="/users" @click="closeMobileMenu">Users</RouterLink>
          </li>
          <li>
            <RouterLink to="/participants" @click="closeMobileMenu">Hráči/Tímy</RouterLink>
          </li>
          <li>
            <RouterLink to="/seasons" @click="closeMobileMenu">Sezóny</RouterLink>
          </li>

          <li v-if="isLoggedIn" class="user-dropdown">
            <a class="username" @click="toggleDropdown">{{ userStore.user.username }}</a>
            <div v-if="showDropdown" class="dropdown-menu">
              <AppButton v-if="playerId" label="Detail hráča" type="create" @clicked="goToPlayerDetail"
                htmlType="button" />
              <AppButton v-else label="Vytvoriť hráča" type="create" @clicked="goToCreatePlayer" />
              <AppButton v-if="playerId" label="Upraviť profil hráča" type="edit" @clicked="goToEditPlayer" />
              <AppButton label="Zmeniť prihlasovacie meno" type="edit" @clicked="goToChangeUsername" />
              <AppButton label="Zmeniť heslo" type="edit" @clicked="goToChangePassword" />
              <AppButton label="Odhlásiť sa" type="delete" @clicked="showLogout = true" />
            </div>
          </li>

          <li v-else>
            <RouterLink to="/login" @click="closeMobileMenu">Prihlásenie</RouterLink>
          </li>
        </ul>
        <LogoutModal :visible="showLogout" @confirm="logout" @cancel="cancelLogout" />
      </nav>
    </div>
  </div>

</template>

<script>
import { useUserStore } from '@/stores/user'
import { useFlashMessageStore } from '@/stores/flashMessage';
import AppButton from './AppButton.vue'
import LogoutModal from './LogoutModal.vue';
import FlashMessage from './FlashMessage.vue';

export default {
  name: 'Navbar',
  data() {
    return {
      showDropdown: false,
      showLogout: false,
      showMobileMenu: false
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
    },
    hasFlashMessage() {
      const flashStore = useFlashMessageStore()
      return flashStore.message.trim() !== ''
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    closeDropdown() {
      this.showDropdown = false
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    },
    goToCreatePlayer() {
      this.closeDropdown()
      this.closeMobileMenu()
      this.$router.push('/players/create')
    },
    goToEditPlayer() {
      this.closeDropdown()
      this.closeMobileMenu()
      this.$router.push(`/players/edit/${this.playerId}`);
    },
    goToPlayerDetail() {
      this.closeDropdown()
      this.closeMobileMenu()
      this.$router.push(`/players/${this.playerId}`)
    },
    logout() {
      this.closeDropdown()
      this.closeMobileMenu()
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
      this.closeMobileMenu()
      this.$router.push('/change-username');
    },
    goToChangePassword() {
      this.closeDropdown()
      this.closeMobileMenu()
      this.$router.push('/change-password')
    }
  },
  components: { AppButton, LogoutModal, FlashMessage }
}
</script>

<style scoped>
.message {
  display: flex;
  width: 50%;
  justify-content: center;
}

.navbar {
  width: 100%;
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
  flex-wrap: wrap;
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
  right: 0;
  left: auto;
}

.hamburger {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1rem;
}

.hamburger .line {
  width: 26px;
  height: 3px;
  background: white;
  border-radius: 2px;
  display: block;
}

.hamburger .label {
  font-weight: 600;
  letter-spacing: 0.5px;
}


@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .message {
    width: 100%;
  }

  .navbar {
    display: flex;
    justify-content: flex-end;
  }

  .navbar ul {
    position: absolute;
    top: 60px;
    right: 10px;
    flex-direction: column;
    width: 220px;
    display: none;
    padding: 1rem;
  }

  .navbar ul.open {
    display: flex;
  }

  .navbar li {
    text-align: center;
  }
}
</style>
