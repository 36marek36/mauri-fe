<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="currentSeason">
        <h3>Aktuálna sezóna {{ currentSeason.year }}</h3>

        <div class="list-or-nothing">
          <!-- Loading -->
          <p v-if="loading">Načítavam aktuálnu sezónu...</p>

          <!-- Error -->
          <p v-else-if="errorMessage">{{ errorMessage }}</p>

          <!-- Content -->
          <div v-else>

            <!-- SINGLES -->
            <h3 v-if="currentSingleLeagues.length">Dvojhry</h3>
            <table v-if="currentSingleLeagues.length" class="league-table">
              <tbody>
                <tr v-for="league in currentSingleLeagues" :key="league.leagueId"
                  @click="$router.push('/leagues/' + league.leagueId)" class="league-row">
                  <td>{{ league.leagueName }}</td>
                </tr>
              </tbody>
            </table>

            <!-- DOUBLES -->
            <h3 v-if="currentDoubleLeagues.length">Štvorhry</h3>
            <table v-if="currentDoubleLeagues.length" class="league-table">
              <tbody>
                <tr v-for="league in currentDoubleLeagues" :key="league.leagueId"
                  @click="$router.push('/leagues/' + league.leagueId)" class="league-row">
                  <td>{{ league.leagueName }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Empty -->
            <p v-if="!currentSingleLeagues.length && !currentDoubleLeagues.length">
              Sezóna neobsahuje žiadne ligy.
            </p>

          </div>
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
      header: useHeaderStore(),
      userStore: useUserStore()
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
    hasLeagues() {
      return this.currentSeason?.leagues?.length > 0;
    },

    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    currentSingleLeagues() {
      return this.currentSeason.leagues?.filter(l => l.leagueType === 'SINGLES') || []
    },
    currentDoubleLeagues() {
      return this.currentSeason.leagues?.filter(l => l.leagueType === 'DOUBLES') || []
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
  max-height: 70vh;
}

.second {
  width: 50%;
}

.league-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}


.league-row {
  font-size: x-large;
  height: 60px;
  cursor: pointer;
}

.league-table td {
  padding-left: 2rem;
  text-align: left;
  white-space: nowrap;
  text-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700;
}

.league-table tbody tr:hover {
  background-color: #363537;
}


.list-or-nothing {
  margin-top: 2rem;
  overflow-y: auto;
  align-items: center;
  font-size: 1.5rem;
}


@media (max-width: 768px) {
  .currentSeason {
    width: 100%;
    max-height: none;
  }
  

  .league-table td {
    font-size: 1.1rem;
  }
}
</style>