<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="currentSeason">
        <h3>Aktuálna sezóna:</h3>
        <div class="list-or-nothing">
          <!-- Loading stav -->
          <p v-if="loading">Načítavam aktuálnu sezónu...</p>

          <p v-else-if="errorMessage">{{ errorMessage }}</p>

          <!-- Ak existujú ligy -->
          <table v-else-if="hasLeagues" class="league-table">
            <tbody>
              <tr v-for="league in currentSeason.leagues" :key="league.leagueId"
                @click="$router.push('/leagues/' + league.leagueId)"
                :class="['league-row', league.leagueType.toLowerCase()]">
                <td>{{ league.leagueName }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Ak sezóna existuje, ale ligy nemá -->
          <p v-else>Sezóna neobsahuje žiadne ligy.</p>
        </div>
      </div>

      <div class="second">
        <!-- druhy div vedla aktualnej sezony -->
      </div>
      <LoginRegisterForm v-if="!isLoggedIn" />
    </div>
  </div>
</template>

<script>
import LoginRegisterForm from '@/components/LoginRegisterForm.vue';
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import api from '@/axios-interceptor';
import CircularProgress from '@/components/CircularProgress.vue';

export default {
  name: 'Home Page',
  data() {
    return {
      currentSeason: {},
      loading: true,
      errorMessage: '',
      header: useHeaderStore()
    }
  },
  created() {
    this.initHeader();
    this.fetchCurrentSeason();
  },
  methods: {
    async fetchCurrentSeason() {
      this.loading = true
      try {
        const response = await api.get('/seasons/current');
        this.currentSeason = response.data;
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          this.errorMessage = err.response.data.message;
        } else {
          this.errorMessage = 'Nepodarilo sa načítať aktuálnu sezónu.';
        }
      } finally {
        this.loading = false;
      }
    },
    async initHeader() {
      await this.userStore.fetchCurrentUser()

      if (this.isLoggedIn) {
        this.header.setTitle(`Vitaj ${this.userStore.user.username}`, '')
      } else {
        this.header.setTitle('Vitajte', '')
      }
    }
  },

  computed: {
    userStore() {
      return useUserStore()
    },
    hasLeagues() {
      return this.currentSeason.leagues.length > 0;
    },

    isLoggedIn() {
      return this.userStore.isLoggedIn
    }
  },
  components: { LoginRegisterForm, CircularProgress }
}

</script>

<style scoped>
.currentSeason {
  display: flex;
  flex-direction: column;
  width: 50%;
  font-size: 30px;
  max-height: 500px;
}

.second {
  width: 50%;
}

.league-table {
  width: 100%;
  border-collapse: collapse;
}

tr.league-row {
  font-size: x-large;
  height: 60px;
  background-size: contain;
  background-position: left;
  background-repeat: no-repeat;
  cursor: pointer;
}

tr.singles {
  background-image: url('/images/singles-bg.png');
}

tr.doubles {
  background-image: url('/images/doubles-bg.png');
}


.league-table td {
  padding-right: 2rem;
  text-align: right;
  vertical-align: bottom;
  white-space: nowrap;
}

.league-table tbody tr:hover {
  background-color: #363537;
}



.list-or-nothing {
  margin-top: 2rem;
  overflow-y: auto;
  align-items: center;
}

.icon-ball {
  width: 25px;
  height: 40px;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .list-or-nothing {
    font-size: 1.2rem;
  }
}
</style>