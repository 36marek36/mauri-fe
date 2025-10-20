<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="currentSeason">
        <h3>Aktuálna sezóna:</h3>

        <div class="currentSeason-area ">
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
                <td>{{ league.players.length }} hráčov</td>
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
      <LoginRegisterForm />
    </div>
  </div>
</template>

<script>
import LoginRegisterForm from '@/components/LoginRegisterForm.vue';
import { useHeaderStore } from '@/stores/header';
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
    this.header.setTitle('Vitajte', '')
    this.fetchCurrentSeason();
  },
  methods: {
    async fetchCurrentSeason() {
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
    hasLeagues() {
      return this.currentSeason.leagues.length > 0;
    },
    leagueTypeLabels() {
      return {
        SINGLES: '2-HRA',
        DOUBLES: '4-HRA',
      };
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

.currentSeason-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  font-family: 'Roboto', sans-serif;
  font-size: 1.1rem;
  color: #FFD700;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.5rem;
  /* border: 2px solid #ffffff40; */
  box-shadow: 0 0 15px #FFD700;
  margin-top: 1rem;
}

.currentSeason-area::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .currentSeason-area {
    font-size: 1.2rem;
  }
}
</style>