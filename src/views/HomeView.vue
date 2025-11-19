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
                @click="$router.push('/leagues/' + league.leagueId)" style="cursor: pointer;">
                <td>{{ league.leagueName }}</td>
                <td>{{ leagueTypeLabels[league.leagueType] || league.leagueType }}</td>
                <td>
                  <CircularProgress :progress="league.leagueProgress" />
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Ak sezóna existuje, ale ligy nemá -->
          <p v-else>Sezóna neobsahuje žiadne ligy.</p>
        </div>
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
import { inflection } from '@/utils/inflection';

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
    this.header.setTitle('Vitajte', '')
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
    }
  },

  computed: {
    userStore() {
      return useUserStore()
    },
    hasLeagues() {
      return this.currentSeason.leagues.length > 0;
    },
    leagueTypeLabels() {
      return {
        SINGLES: '2-HRA',
        DOUBLES: '4-HRA',
      };
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
  width: 100%;
  font-size: 30px;
  max-height: 500px;
}

.league-table {
  width: 100%;
  border-collapse: collapse;
}

.league-table td {

  padding: 0.5rem;
  text-align: left;
  white-space: nowrap;

}

.league-table tbody tr:hover {
  background-color: #363537;
}



.list-or-nothing {
  margin-top: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .list-or-nothing {
    font-size: 1.2rem;
  }
}
</style>