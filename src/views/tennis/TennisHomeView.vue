<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">

      <div class="ticker-container">
        <div class="ticker">

          <!-- NEPRIHLÁSENÝ POUŽÍVATEĽ -->
          <template v-if="!isLoggedIn">
            <strong class="ticker-title">
              Vitaj medzi hráčmi handlovskej tenisovej ligy!
            </strong>
            &nbsp; Registruj sa a získaj prístup ku všetkým možnostiam ligy:
            <span class="ticker-item">• Vytvor si účet</span>
            <span class="ticker-item">• Nastav si hráčsky profil</span>
            <span class="ticker-item">• Prihlás sa do ligy</span>
            <span class="ticker-item">• Čakajú ťa zápasy, výsledky a porovnanie s ostatnými hráčmi.</span>
          </template>

          <!-- PRIHLÁSENÝ, ALE BEZ HRÁČA -->
          <template v-else-if="!hasPlayer">
            <strong class="ticker-title">
              Dokonči svoj hráčsky profil!
            </strong>
            &nbsp; Aby si sa mohol zapojiť do líg a hrať zápasy, potrebuješ si vytvoriť profil hráča.
            <span class="ticker-item">• Je to rýchle – zaberie to len pár sekúnd.</span>
          </template>

          <!-- PRIHLÁSENÝ S HRÁČOM -->
          <template v-else>
            <strong class="ticker-title">
              Vitaj, {{ firstName }}!
            </strong>
            <span class="ticker-item">
              Prajeme ti veľa úspešných zápasov v handlovskej tenisovej lige!
            </span>
            <span class="ticker-item">
              • Nech sa ti darí na kurte!
            </span>
          </template>

        </div>
      </div>

      <!-- LOADING -->
      <p v-if="loading">
        Načítavam posledné výsledky...
      </p>

      <!-- ERROR -->
      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <div class="list-or-nothing">
        <div class="activities">

          <h3>Posledné výsledky</h3>

          <p v-if="!matchActivities.length">
            V posledných 3 dňoch sa neodohrali žiadne zápasy
          </p>

          <div v-for="group in groupedActivities" :key="group.date">

            <h4 class="day-title">
              {{ group.date }}
            </h4>

            <div v-for="league in group.leagues" :key="league.leagueName" class="league-group">
              <h5 class="league-name">
                {{ league.leagueName }}
              </h5>

              <div v-for="activity in league.activities" :key="activity.match.id" class="activity-item">
                <div class="scoreboard">

                  <!-- HOME (Domáci) -->
                  <div class="row">
                    <!-- Názov vytiahnutý priamo cez getSideEntity + zjednotená trieda winner -->
                    <div class="name" :class="{ winner: checkIfWinner(activity.match, 'home') }">
                      {{ getSideEntity(activity.match, 'home')?.name }}
                    </div>

                    <!-- Celkové skóre domáceho na sety -->
                    <div class="total-score" :class="{ 'is-winner': checkIfWinner(activity.match, 'home') }">
                      {{ activity.match.result?.score1 ?? 0 }}
                    </div>

                    <!-- Priamy cyklus cez setScores bez premapovávania v JS -->
                    <div class="sets">
                      <span v-for="(set, i) in activity.match.result?.setScores" :key="i">
                        {{ set.score1 }}
                      </span>
                    </div>
                  </div>

                  <!-- AWAY (Hosťujúci) -->
                  <div class="row">
                    <!-- Názov vytiahnutý priamo cez getSideEntity + zjednotená trieda winner -->
                    <div class="name" :class="{ winner: checkIfWinner(activity.match, 'away') }">
                      {{ getSideEntity(activity.match, 'away')?.name }}
                    </div>

                    <!-- Celkové skóre hosťa na sety -->
                    <div class="total-score" :class="{ 'is-winner': checkIfWinner(activity.match, 'away') }">
                      {{ activity.match.result?.score2 ?? 0 }}
                    </div>

                    <!-- Priamy cyklus cez setScores bez premapovávania v JS -->
                    <div class="sets">
                      <span v-for="(set, i) in activity.match.result?.setScores" :key="i">
                        {{ set.score2 }}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="second">

        <!-- 🟢 AKTUÁLNA SEZÓNA -->
        <div v-if="hasCurrentSeason" class="seasons-grid">
          <div v-for="season in seasons" :key="season.id" class="season-card"
            @click="$router.push('/tennis/seasons/' + season.id)">
            <div class="season-header">

              <div>
                <span class="season-label">
                  {{ season.status === 'ACTIVE' ? 'AKTUÁLNA SEZÓNA' : 'PRIPRAVOVANÁ SEZÓNA' }}
                </span>
                <h3>{{ season.year }}</h3>
              </div>

              <div class="total-participants">
                <strong>{{ season.totalParticipants }}</strong>
                <span>účastníkov</span>
              </div>
            </div>

            <div v-if="hasActiveSeason" class="season-stats">
              <!-- Ligy -->
              <div class="stat">
                <strong>
                  {{ inflection('league', season.totalLeagues) }}
                </strong>
              </div>

              <!-- Zápasy + Odohraté -->
              <div class="stat">
                <strong>
                  {{ inflection('match', season.totalMatches) }}
                </strong>
              </div>
            </div>
            <div class="season-date start">
              <span>Sezóna začala</span>
              <strong>{{ season.startDate }}</strong>
            </div>

          </div>
        </div>

        <div v-else>
          <h4>Momentálne nie je aktívna žiadna sezóna</h4>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import api from '@/axios-interceptor';
import { inflection } from '@/utils/inflection';

export default {
  name: 'TennisHomePage',
  data() {
    return {
      seasons: [],
      loading: true,
      errorMessage: '',
      matchActivities: [],
      header: useHeaderStore(),
      userStore: useUserStore()
    }
  },
  async created() {
    this.loading = true;

    await this.userStore.fetchCurrentUser().catch(() => { });
    this.initHeader();
    await this.fetchTennisSeasons(['ACTIVE', 'CREATED']);

    await this.loadMatchActivities();

    // Ak sezóna beží (máme ID), stiahneme zápasy
    // if (this.hasCurrentSeason) {
    //   await this.loadMatchActivities();
    // }

    this.loading = false;
  },

  methods: {
    async loadMatchActivities() {

      try {
        this.errorMessage = '';

        const res = await api.get('/match-activities/recent');
        this.matchActivities = res.data;

      } catch (e) {
        this.errorMessage = "Nepodarilo sa načítať aktivity";
      }
    },
    initHeader() {
      this.header.setTitle(
        'Handlovská Tenisová liga', ' '
      );
    },
    async fetchTennisSeasons(status) {
      try {
        const response = await api.get('/seasons/tennis', {
          params: {
            status: status
          },
          paramsSerializer: {
            indexes: null
          }
        });
        this.seasons = response.data;
        console.log(this.seasons.length)
      } catch (err) {
        console.error('Chyba pri načítavaní tenisových sezón:', err);
        this.seasons = [];
      }
    },
    getSideEntity(match, sideKey) {
      if (match.matchType === 'SINGLES') {
        return sideKey === 'home' ? match.homePlayer : match.awayPlayer;
      } else {
        return sideKey === 'home' ? match.homeTeam : match.awayTeam;
      }
    },

    // Táto metóda bezpečne overí, či entita na danej strane vyhrala zápas
    checkIfWinner(match, sideKey) {
      const entity = this.getSideEntity(match, sideKey);
      return match.result?.winnerId === entity?.id;
    },
    inflection
  },

  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    hasPlayer() {
      return !!this.userStore.user?.playerId
    },
    hasCurrentSeason() {
      return this.seasons.length > 0;
    },
    hasActiveSeason() {
      // Vráti true, ak aspoň jedna sezóna v poli má status 'ACTIVE'
      return this.seasons.some(season => season.status === 'ACTIVE');
    },

    hasCreatedSeason() {
      return this.seasons.some(season => season.status === 'CREATED');
    },
    groupedActivities() {
      if (!this.matchActivities?.length) return [];

      const dayGroups = {};

      this.matchActivities.forEach(activity => {
        const date = new Date(activity.playedAt);

        const dayKey = date.toLocaleDateString("sk-SK", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit"
        });

        if (!dayGroups[dayKey]) {
          dayGroups[dayKey] = {};
        }

        if (!dayGroups[dayKey][activity.leagueName]) {
          dayGroups[dayKey][activity.leagueName] = [];
        }

        dayGroups[dayKey][activity.leagueName].push(activity);
      });

      return Object.entries(dayGroups).map(([date, leagues]) => ({
        date,
        leagues: Object.entries(leagues).map(([leagueName, activities]) => ({
          leagueName,
          activities
        }))
      }));
    },
    firstName() {
      const fullName = this.userStore.user?.playerName || '';
      return fullName.trim().split(/\s+/)[0] || '';
    }
  }
}

</script>

<style scoped>
.right-side {
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.ticker-container {
  background: linear-gradient(to right,
      rgba(0, 0, 0, 1),
      /* viac čierna zhora */
      rgba(0, 0, 0, 0.7)
      /* takmer priehľadné dole */
    );
  border-radius: 16px;
  border: 1px solid green;
  box-shadow: 0 0 5px #FFD700;
  padding: 10px;
  width: 100%;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
}

.ticker {
  width: max-content;
  white-space: nowrap;
  animation: scroll 50s linear infinite;
}

.ticker-title {
  color: #d6b58c;
  font-size: 15px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ticker-item {
  margin-left: 25px;
  color: #ffffff;
}

.ticker-item::first-letter {
  color: #d6b58c;
}

.ticker-container:hover .ticker {
  animation-play-state: paused;
}

.list-or-nothing {
  overflow-y: auto;
  align-items: center;
  /* font-size: 1.5rem; */
}

.activities {
  width: 100%;
  padding: 0 10px;
  text-align: center;
}

.day-title {
  color: #CAE5FF;
  padding: 2px 8px;
  font-weight: 400;
  text-transform: capitalize;
  text-align: left;
}

.activity-item {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.scoreboard {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.activity-item .row {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 12px;
}

.activity-item .row:not(:last-child)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(to right,
      transparent,
      #a1a1a1 30%,
      #a1a1a1 70%,
      transparent);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.league-name {
  color: #ffffff;
  font-size: 1.2rem;
}

.name {
  flex-grow: 1;
  /* font-size: 1.2rem; */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #ffffff;
  text-align: left;
}

.name.winner {
  color: #FFD700;
}

.total-score {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  width: 24px;
  text-align: center;
  margin-right: 20px;
}

.total-score.is-winner {
  color: #FFD700;
  font-weight: bold;
}

.sets {
  display: flex;
  gap: 6px;
  font-family: monospace;
}

.sets span {
  background: #8b0000;
  color: white;
  padding: 2px 0;
  border-radius: 6px;
  font-size: 0.9rem;

  width: 28px;
  text-align: center;
  display: inline-block;
}

.second {
  width: 100%;
}

.error-message {
  text-align: center;
  margin: 10px auto;
}

.seasons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: 100%;
  align-items: start;
}

.season-card {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 10px 10px;
  border: 1px solid #888888;
  border-radius: 14px;
  background: #111;
  color: #fff;
  cursor: pointer;
  transition: 0.2s ease;
}

.season-card:hover {
  transform: translateY(-3px);
  border-color: #d9ff00;
  box-shadow: 0 8px 25px rgba(217, 255, 0, 0.12);
}

.season-header,
.season-stats {
  position: relative;
}

.season-header::after,
.season-stats::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(to right,
      transparent,
      wheat 30%,
      wheat 70%,
      transparent);
  opacity: 0.65;
}

/* HEADER */

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  padding-left: 15px;
}

.season-label {
  font-size: 0.7rem;
  color: #c9c9c9;
  letter-spacing: 2px;
}

.season-header h3 {
  margin: 2px 0 0;
  font-size: 1.8rem;
  color: #d9ff00;
}

.total-participants {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 15px;
}

.total-participants strong {
  font-size: 1.5rem;
  color: #fff;
}

.total-participants span {
  font-size: 0.75rem;
  color: #c9c9c9;
}

/* STATS */

.season-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px 0;
}

.stat {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 10px;
  border-radius: 7px;
  background: #1a1a1a;
  border: 1px solid #4d4d4d;
}

.stat strong {
  color: #fff;
  font-size: 0.95rem;
}

.stat strong.green {
  color: #00ff88;
}

.stat strong.red {
  color: #ff3333;
}

.stat strong.orange {
  color: #ff9800;
}

/* DATES */

.season-dates {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
}

.season-date {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  align-items: center;
  gap: 3px;
}

.season-date span {
  font-size: 0.7rem;
  color: #c9c9c9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.season-date strong {
  color: #d9ff00;
  font-size: 0.95rem;
}

.season-date.start strong::before {
  content: "▶";
  margin-right: 6px;
  font-size: 0.7rem;
}

@keyframes scroll {
  from {
    transform: translateX(100vw);
  }

  to {
    transform: translateX(-100%);
  }
}

@media (max-width: 768px) {

  .activities {
    padding: 0 5px;
    font-size: 0.9rem;
  }

  .activities h3 {
    font-size: 1.2rem;
  }

  .activity-item {
    padding: 8px 6px;
    border-radius: 8px;
  }

  .activity-item .row {
    padding: 4px 6px;
  }

  .day-title {
    font-size: 0.9rem;
  }

  .total-score {
    font-size: 1rem;
    width: 20px;
    margin-right: 10px;
  }

  .league-name {
    font-size: 0.9rem;
  }

  .sets {
    gap: 4px;
  }

  .sets span {
    width: 22px;
    font-size: 0.75rem;
    border-radius: 4px;
  }
}
</style>