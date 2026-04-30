<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">
      <div class="currentSeason">
        <div class="list-or-nothing">

          <!-- LOADING -->
          <p v-if="loading">Načítavam aktuálnu sezónu...</p>

          <!-- ERROR -->
          <p class="error-message" v-else-if="errorMessage">{{ errorMessage }}</p>

          <!-- NO SEASON -->
          <p v-else-if="!currentSeason">
            Žiadna aktívna sezóna
          </p>

          <!-- CONTENT -->
          <div v-else>

            <!-- TITLE -->
            <h3>
              Sezóna {{ currentSeason.year }}
            </h3>

            <!-- SINGLES -->
            <h3 v-if="currentSingleLeagues.length">Dvojhry</h3>

            <table v-if="currentSingleLeagues.length" class="league-table">
              <tbody>
                <tr v-for="league in currentSingleLeagues" :key="league.leagueId" class="league-row"
                  @click="$router.push('/leagues/' + league.leagueId)">
                  <td>{{ league.leagueName }}</td>
                </tr>
              </tbody>
            </table>

            <!-- DOUBLES -->
            <h3 v-if="currentDoubleLeagues.length">Štvorhry</h3>

            <table v-if="currentDoubleLeagues.length" class="league-table">
              <tbody>
                <tr v-for="league in currentDoubleLeagues" :key="league.leagueId" class="league-row"
                  @click="$router.push('/leagues/' + league.leagueId)">
                  <td>{{ league.leagueName }}</td>
                </tr>
              </tbody>
            </table>

            <!-- EMPTY STATE -->
            <p v-if="!currentSingleLeagues.length && !currentDoubleLeagues.length">
              Sezóna neobsahuje žiadne ligy.
            </p>

          </div>

        </div>
      </div>
      <div class="second">

        <!-- 1. NOT LOGGED IN -->
        <div v-if="!isLoggedIn" class="panel onboarding">

          <h3>Vitaj medzi hráčmi tenisovej ligy</h3>

          <p class="intro-text">
            Zaregistruj sa a získaj prístup ku všetkým možnostiam ligy:
          </p>

          <ul class="onboarding-steps">
            <li>Vytvor si účet</li>
            <li>Nastav si hráčsky profil</li>
            <li>Prihlás sa do ligy</li>
            <li>Čakajú ťa zápasy, výsledky a porovnanie s ostatnými hráčmi</li>
          </ul>

        </div>

        <!-- 2. LOGGED IN BUT NO PLAYER -->
        <div v-else-if="!hasPlayer" class="panel onboarding">
          <h3>Dokonči svoj hráčsky profil</h3>

          <p>
            Aby si sa mohol zapojiť do líg a hrať zápasy,
            potrebuješ si vytvoriť profil hráča.
          </p>

          <p class="hint">
            Je to rýchle – zaberie to len pár sekúnd.
          </p>

          <!-- <AppButton label="Vytvoriť hráča" type="create" @clicked="goToCreatePlayer" /> -->
        </div>

        <!-- 3. LOGGED IN + PLAYER -->
        <div v-else class="panel success">
          <h3>{{ userStore.user.playerName }}</h3>

          <!-- LOADING MATCHES -->
          <p v-if="loadingMatches">Načítavam zápasy...</p>

          <div class="panel matches-preview" v-else-if="playerMatches.length">

            <div v-for="match in playerMatches" :key="match.id" class="match-row">

              <!-- HRÁČI -->
              <div class="match-players">

                <span :class="getPlayerClass(match, 'home')">
                  {{ match.homePlayer.name }}
                </span>

                <span class="vs">vs</span>

                <span :class="getPlayerClass(match, 'away')">
                  {{ match.awayPlayer.name }}
                </span>

              </div>

              <!-- VÝSLEDOK -->
              <div class="match-result">
                <span v-if="match.result">
                  {{ match.result.score1 }} : {{ match.result.score2 }}
                </span>
                <span v-else>-</span>
              </div>

              <!-- STATUS -->
              <div class="match-status" :class="statusClass(match.status)">
                {{ statusText(match.status) }}
              </div>

            </div>

          </div>
          <p v-else-if="!playerMatches.length && !loadingMatches">
            Zatiaľ nemáš žiadne zápasy.
          </p>
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
import AppButton from '@/components/AppButton.vue';

export default {
  name: 'Home Page',
  data() {
    return {
      currentSeason: null,
      loading: true,
      loadingMatches: false,
      errorMessage: '',
      createdMatches: [],
      finishedMatches: [],
      cancelledMatches: [],
      scratchedMatches: [],
      header: useHeaderStore(),
      userStore: useUserStore()
    }
  },
  async created() {
    await this.initHeader();
    await this.fetchCurrentSeason();
    await this.fetchPlayerMatches()
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
    },
    async fetchPlayerMatches() {
      this.loadingMatches = true

      try {
        const playerId = this.userStore.user?.playerId
        if (!playerId) return


        const [createdRes, finishedRes, cancelledRes, scratchedRes] = await Promise.all([
          api.get(`/matches/player/${playerId}/status/CREATED`),
          api.get(`/matches/player/${playerId}/status/FINISHED`),
          api.get(`/matches/player/${playerId}/status/CANCELLED`),
          api.get(`/matches/player/${playerId}/status/SCRATCHED`)
        ])

        this.createdMatches = createdRes.data
        this.finishedMatches = finishedRes.data
        this.cancelledMatches = cancelledRes.data
        this.scratchedMatches = scratchedRes.data

      } catch (error) {
        console.error('Chyba pri načítavaní zápasov:', error)
      } finally {
        this.loadingMatches = false
      }
    },
    goToCreatePlayer() {
      this.$router.push('/players/create')
    },
    getPlayerClass(match, side) {
      const userId = this.userStore.user.playerId

      const isUser =
        (side === 'home' && match.homePlayer.id === userId) ||
        (side === 'away' && match.awayPlayer.id === userId)

      return {
        me: isUser
      }
    },

    statusText(status) {
      if (status === 'FINISHED') return 'Odohraný'
      if (status === 'CANCELLED') return 'Zrušený'
      if (status === 'SCRATCHED') return 'Skrečovaný'
      return 'Neodohraný'
    },

    statusClass(status) {
      return {
        'st-finished': status === 'FINISHED',
        'st-cancelled': status === 'CANCELLED',
        'st-scratched': status === 'SCRATCHED',
        'st-pending': !['FINISHED', 'CANCELLED', 'SCRATCHED'].includes(status)
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
      return this.currentSeason?.leagues?.filter(l => l.leagueType === 'SINGLES') ?? []
    },
    currentDoubleLeagues() {
      return this.currentSeason?.leagues?.filter(l => l.leagueType === 'DOUBLES') ?? []
    },
    hasPlayer() {
      return !!this.userStore.user?.playerId
    },
    playerMatches() {
      return [
        ...(this.createdMatches || []),
        ...(this.finishedMatches || []),
        ...(this.cancelledMatches || []),
        ...(this.scratchedMatches || [])
      ]
    }
  },
  components: { LoginRegisterForm, CircularProgress, AppButton }
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

.error-message {
  text-align: center;
  margin: 10px auto;
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
  overflow-y: auto;
  align-items: center;
  font-size: 1.5rem;
}

.panel.onboarding {
  background: #002E2C;
  border: 2px solid gold;
  border-radius: 10px;
  padding: 16px;
  color: #e5e7eb;
}

.panel.onboarding h3 {
  margin-bottom: 10px;
  color: gold;
}

.panel.onboarding p {
  margin-bottom: 10px;
}

.panel.success {
  background: #002E2C;
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 16px 20px;
  max-width: 420px;
  margin: 0 auto;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.panel.success p strong {
  color: #FFD700;
  min-width: 140px;
}

.hint {
  /* margin-top: 6px; */
  font-size: 0.85rem;
  color: #94a3b8;

  padding-left: 10px;
  border-left: 2px solid rgba(217, 255, 0, 0.4);

  opacity: 0.9;
}

.intro-text {
  margin-bottom: 12px;
  opacity: 0.9;
}

.onboarding-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.onboarding-steps li {
  position: relative;
  padding-left: 22px;
  margin-bottom: 8px;
  line-height: 1.4;
}

/* custom bullet */
.onboarding-steps li::before {
  content: "✔";
  position: absolute;
  left: 0;
  color: #d9ff00;
}

.match-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.match-players {
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
}

.vs {
  opacity: 0.6;
}

.match-result {
  text-align: center;
}

.match-status {
  text-align: right;
  font-size: 0.8rem;
}

/* statusy */
.st-finished {
  color: #4CAF50;
}

.st-cancelled {
  color: #f44336;
}

.st-scratched {
  color: #ff9800;
}

.st-pending {
  color: #ccc;
}

/* zvýraznenie usera */
.me {
  color: #FFD700;
}


@media (max-width: 768px) {
  .currentSeason {
    width: 100%;
    max-height: none;
  }

  .right-side {
    flex-direction: column-reverse;
  }

  .league-table td {
    font-size: 1.1rem;
  }

  .second {
    width: 100%;
  }
}
</style>