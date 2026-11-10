<template>
  <div class="navbar-wrapper">
    <nav class="navbar">

      <!-- LOGO -->
      <RouterLink to="/" class="brand" @click="closeAll">
        <img :src="sportIcon" class="brand-icon" />
        <span>mauri<span class="brand-highlight">.sk</span></span>
      </RouterLink>

      <!-- MOBILE BUTTON -->
      <button class="hamburger" @click="toggleMobileMenu">
        <img :src="sportIcon" class="sport-icon" />

        <span :class="['label', sport === 'volleyball'
          ? 'volleyball-label'
          : 'tennis-label']">
          MENU
        </span>
      </button>

      <!-- NAVIGATION -->
      <div :class="['nav-content', { open: showMobileMenu }]">

        <RouterLink to="/" class="nav-link" @click="closeAll">
          Domov
        </RouterLink>

        <!-- SPORT -->
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger" @click="toggleDropdown('sport')">
            Šport
            <span class="arrow">⌄</span>
          </button>

          <div v-if="activeDropdown === 'sport'" class="dropdown">

            <RouterLink to="/tennis" @click="closeAll">
              🎾 Tenis
            </RouterLink>

            <RouterLink to="/volleyball" @click="closeAll">
              🏐 Volejbal
            </RouterLink>

          </div>
        </div>

        <!-- COMPETITIONS -->
        <div class="nav-dropdown" v-if="sportPrefix">
          <button class="nav-link dropdown-trigger" @click="toggleDropdown('competitions')">
            Súťaže
            <span class="arrow">⌄</span>
          </button>

          <div v-if="activeDropdown === 'competitions'" class="dropdown">

            <template v-if="sport === 'tennis'">
              <RouterLink to="/tennis/participants" @click="closeAll">
                Hráči a tímy
              </RouterLink>

              <RouterLink to="/tennis/rating-table" @click="closeAll">
                Celkový rebríček
              </RouterLink>

              <RouterLink to="/tennis/friendly-matches" @click="closeAll">
                Priateľské zápasy
              </RouterLink>

              <RouterLink v-if="isLoggedIn" to="/tennis/new-match" @click="closeAll">
                + Nový zápas
              </RouterLink>

              <RouterLink :to="`${sportPrefix}/seasons/archive`" @click="closeAll">
                Archív sezón
              </RouterLink>
            </template>

            <template v-if="sport === 'volleyball'">
              <RouterLink to="/volleyball/teams" @click="closeAll">
                Tímy
              </RouterLink>
            </template>

          </div>
        </div>

        <!-- INFORMATION -->
        <div class="nav-dropdown" v-if="sportPrefix">
          <button class="nav-link dropdown-trigger" @click="toggleDropdown('information')">
            Informácie
            <span class="arrow">⌄</span>
          </button>

          <div v-if="activeDropdown === 'information'" class="dropdown">

            <RouterLink :to="`${sportPrefix}/league-rules`" @click="closeAll">
              Pravidlá
            </RouterLink>

            <RouterLink v-if="sport === 'tennis'" to="/tennis/aboutus" @click="closeAll">
              O nás
            </RouterLink>

            <a href="#" @click.prevent="openContacts">
              Kontakty
            </a>
          </div>
        </div>

        <!-- USER -->
        <div v-if="isLoggedIn" class="nav-dropdown user-dropdown">

          <button class="user-button" @click="toggleDropdown('user')">
            <span class="user-avatar">
              {{ userStore.user.username?.charAt(0).toUpperCase() }}
            </span>
            <span>{{ userStore.user.username }}</span>
            <span class="arrow">⌄</span>
          </button>

          <div v-if="activeDropdown === 'user'" class="dropdown user-menu">

            <div class="dropdown-heading">
              Používateľský účet
            </div>

            <template v-if="isAdmin">
              <button @click="gotoUsers">Správa používateľov</button>
              <button @click="goToCreatePlayer">Vytvoriť hráča</button>
            </template>

            <template v-if="playerId">
              <button @click="goToPlayerDetail">
                Detail hráča
              </button>
              <button @click="goToEditPlayer">
                Upraviť profil hráča
              </button>
            </template>

            <div class="dropdown-divider"></div>

            <button @click="goToChangeUsername">
              Zmeniť prihlasovacie meno
            </button>

            <button @click="goToChangePassword">
              Zmeniť heslo
            </button>

            <div class="dropdown-divider"></div>

            <button class="logout-link" @click="showLogout = true">
              Odhlásiť sa
            </button>
          </div>
        </div>

        <RouterLink v-else :to="{
          path: '/login',
          query: { redirect: $route.fullPath }
        }" class="login-button" @click="closeAll">
          Prihlásiť sa
        </RouterLink>

      </div>
    </nav>

    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeAll"></div>

    <LogoutModal :visible="showLogout" @confirm="logout" @cancel="cancelLogout" />

    <!-- CONTACTS -->
    <Teleport to="body">
      <div v-if="showContacts" class="modal-overlay" @click.self="showContacts = false">
        <div class="contacts-modal">

          <h3>Kontakty</h3>

          <a href="tel:0905542596" class="phone-link">
            <span>Tenisová liga: p. Uríček</span>
            <p>📞 0905 542 596</p>
          </a>

          <a href="tel:0905878476" class="phone-link">
            <span>Objednávky športovísk:</span>
            <p>📞 0905 878 476</p>
          </a>

          <AppButton label="Zavrieť" type="default" @clicked="showContacts = false" />

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import AppButton from './AppButton.vue'
import LogoutModal from './LogoutModal.vue'

export default {
  name: 'Navbar',

  components: {
    AppButton,
    LogoutModal
  },

  data() {
    return {
      activeDropdown: null,
      showLogout: false,
      showMobileMenu: false,
      showContacts: false
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

    sport() {
      const path = this.$route.path

      if (path.startsWith('/tennis')) return 'tennis'
      if (path.startsWith('/volleyball')) return 'volleyball'

      const redirect = this.$route.query.redirect

      if (typeof redirect === 'string') {
        if (redirect.startsWith('/tennis')) return 'tennis'
        if (redirect.startsWith('/volleyball')) return 'volleyball'
      }

      return null
    },

    sportPrefix() {
      return this.sport ? `/${this.sport}` : ''
    },

    sportIcon() {
      return this.sport === 'volleyball'
        ? '/images/icon-volley.png'
        : '/images/icon-ball.png'
    }
  },

  watch: {
    '$route.fullPath'() {
      this.closeAll()
    }
  },

  methods: {
    toggleDropdown(name) {
      this.activeDropdown =
        this.activeDropdown === name ? null : name
    },

    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
      this.activeDropdown = null
    },

    closeAll() {
      this.activeDropdown = null
      this.showMobileMenu = false
    },

    openContacts() {
      this.closeAll()
      this.showContacts = true
    },

    goToCreatePlayer() {
      this.closeAll()
      this.$router.push('/players/create')
    },

    goToEditPlayer() {
      this.closeAll()
      this.$router.push(`/players/edit/${this.playerId}`)
    },

    gotoUsers() {
      this.closeAll()
      this.$router.push('/users')
    },

    goToPlayerDetail() {
      this.closeAll()
      this.$router.push(`/tennis/players/${this.playerId}`)
    },

    goToChangeUsername() {
      this.closeAll()
      this.$router.push('/change-username')
    },

    goToChangePassword() {
      this.closeAll()
      this.$router.push('/change-password')
    },

    logout() {
      this.closeAll()
      this.showLogout = false
      this.userStore.logout()
      this.$router.push({
        path: '/',
        query: { message: 'logout' }
      })
    },

    cancelLogout() {
      this.showLogout = false
      this.activeDropdown = null
    }
  }
}
</script>

<style scoped>
.navbar-wrapper {
  width: 100%;
  position: relative;
  z-index: 1100;

  background: transparent;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border-radius: 23px;
  padding: 10px;
  box-sizing: border-box;
}

.navbar {
  min-height: 68px;
  padding: 0 22px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;

  background: rgba(15, 28, 35, 0.9);

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;

  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.82);
}

/* BRAND */

.brand {
  display: flex;
  align-items: center;
  gap: 10px;

  color: white;
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 800;
  white-space: nowrap;
}

.brand-icon {
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.brand-highlight {
  color: #f5c542;
}

/* MOBILE SPORT MENU BUTTON */

.hamburger {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  padding: 5px 10px;

  background: transparent;
  border: none;
  cursor: pointer;
}

.sport-icon {
  width: 38px;
  height: 38px;
  object-fit: contain;

  transition: transform 0.25s ease;
}

.label {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.tennis-label {
  color: #FFD700;
}

.volleyball-label {
  color: #C62828;
}

.hamburger:active .sport-icon {
  transform: rotate(25deg) scale(0.95);
}

/* NAVIGATION */

.nav-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 11px 14px;

  background: transparent;
  border: none;
  border-radius: 10px;

  color: #e8edf0;
  text-decoration: none;
  font-size: 0.94rem;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #f5c542;
}

.arrow {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

/* DROPDOWNS */

.nav-dropdown {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;

  min-width: 220px;
  padding: 8px;

  display: flex;
  flex-direction: column;
  gap: 3px;

  background: #172932;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;

  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);

  animation: dropdownIn 0.18s ease;
}

.dropdown a,
.dropdown button {
  padding: 11px 13px;

  color: #e8edf0;
  background: transparent;
  border: none;
  border-radius: 8px;

  text-align: left;
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
}

.dropdown a:hover,
.dropdown button:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #f5c542;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* USER */

.user-button {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 7px 12px;

  color: white;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;

  cursor: pointer;
}

.user-avatar {
  width: 29px;
  height: 29px;

  display: grid;
  place-items: center;

  background: #d4a92f;
  color: #172932;
  border-radius: 50%;
  font-weight: 800;
}

.user-menu {
  left: auto;
  right: 0;
  min-width: 245px;
}

.dropdown-heading {
  padding: 10px 12px;
  color: #aabac1;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 5px 0;
}

.logout-link {
  color: #ff7777 !important;
}

/* LOGIN */

.login-button {
  padding: 10px 18px;
  background: #e4b832;
  color: #18252a;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 800;
  transition: 0.2s;
}

.login-button:hover {
  background: #f5ce57;
  transform: translateY(-1px);
}

/* MOBILE */

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

/* CONTACTS */

.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);

  z-index: 99999;
  padding: 20px;
  box-sizing: border-box;
}

.contacts-modal {
  width: 100%;
  max-width: 420px;

  padding: 30px;

  background: #172932;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;

  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

  color: white;
  text-align: center;

  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contacts-modal h3 {
  margin: 0 0 10px;
  font-size: 1.4rem;
}

.phone-link {
  color: white;
  text-decoration: none;
  padding: 12px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.phone-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

.phone-link p {
  margin: 8px 0 0;
  color: #e4b832;
  font-weight: bold;
}

/* RESPONSIVE */

@media (max-width: 850px) {

  .navbar-wrapper {
    padding: 0;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    border: none;
  }

  .navbar {
    width: 100%;
    min-height: 55px;
    padding: 0;
    box-sizing: border-box;

    justify-content: flex-end;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    border: none;
  }

  /* Skrytie loga na mobile */
  .brand {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-content {
    position: absolute;

    top: calc(100% + 8px);
    right: 8px;
    left: auto;

    width: min(300px, calc(100vw - 32px));
    max-width: calc(100vw - 32px);

    padding: 15px;
    box-sizing: border-box;

    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 5px;

    background: #172932;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 15px;

    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);

    z-index: 2000;
  }

  .nav-content.open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
  }

  .nav-dropdown {
    width: 100%;
  }

  .dropdown {
    position: static;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    margin: 4px 0 8px;
    box-shadow: none;
    background: rgba(0, 0, 0, 0.2);
  }

  .user-button {
    width: 100%;
    justify-content: flex-start;
    border-radius: 10px;
    box-sizing: border-box;
  }

  .user-menu {
    left: 0;
    right: auto;
  }

  .login-button {
    text-align: center;
    margin-top: 5px;
  }
}
</style>
