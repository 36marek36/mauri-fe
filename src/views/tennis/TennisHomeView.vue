<template>
  <div class="main-layout">
    <div class="left-side">
    </div>
    <div class="right-side">

      <!-- LOADING -->
      <p v-if="loading">
        Načítavam posledné výsledky...
      </p>

      <!-- ERROR -->
      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <!-- 🟢 ZMENA: Podmienka upravená na hasCurrentSeason -->
      <div v-else-if="hasCurrentSeason" class="list-or-nothing">
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
            Aby si sa mohol zapojiť do líg a hrať zápasy, potrebuješ si vytvoriť profil hráča.
          </p>
          <p class="hint">
            Je to rýchle – zaberie to len pár sekúnd.
          </p>
        </div>

        <!-- 🟢 ZMENA: Spodné tlačidlo reaguje na hasCurrentSeason -->
        <div v-if="hasCurrentSeason" class="active-season" @click="openActiveSeason">
          <h4>Aktuálna sezóna</h4>
        </div>

        <div v-else class="active-season">
          <h4>Momentlemente nie je aktívna žiadna sezóna</h4>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import api from '@/axios-interceptor';

export default {
  name: 'TennisHomePage',
  data() {
    return {
      currentSeasonId: null,
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

    // Načítame minimálne informácie o sezóne
    await this.loadCurrentSeason();

    // Ak sezóna beží (máme ID), stiahneme zápasy
    if (this.currentSeasonId) {
      await this.loadMatchActivities();
    }

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
      if (!this.isLoggedIn) {
        this.header.setTitle('Handlovská', 'Tenisová liga');
        return;
      }

      const fullName = this.userStore.user?.playerName || '';

      const firstName = fullName.split(' ')[0];

      this.header.setTitle(
        'Handlovská Tenisová liga', 'Vitaj ' +
      firstName
      );
    },
    async loadCurrentSeason() {
      try {
        const res = await api.get('/seasons/current/short');
        this.currentSeasonId = res.data?.id || null;
      } catch {
        this.currentSeasonId = null;
      }
    },
    openActiveSeason() {
      if (!this.currentSeasonId) return;
      this.$router.push(`/tennis/seasons/${this.currentSeasonId}`);
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
    }
  },

  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    hasPlayer() {
      return !!this.userStore.user?.playerId
    },
    hasCurrentSeason() {
      return !!this.currentSeasonId;
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
    }
  }
}

</script>

<style scoped>
.right-side {
  justify-content: center;
  align-items: flex-start;
}

.list-or-nothing {
  overflow-y: auto;
  align-items: center;
  font-size: 1.5rem;
}

.activities {
  width: 100%;
  padding: 0 16px;
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

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.league-name {
  color: #ffffff;
}

.name {
  flex-grow: 1;
  font-size: 1.2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #ffffff;
  text-align: left;
}

.name.winner {
  color: #FFD700;
  font-weight: bold;
}

.total-score {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  width: 30px;
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
  width: 50%;
}

.error-message {
  text-align: center;
  margin: 10px auto;
}

.panel.onboarding {
  background: #002E2C;
  border: 2px solid gold;
  border-radius: 10px;
  padding: 16px;
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.panel.onboarding h3 {
  margin-bottom: 10px;
  color: gold;
}

.panel.onboarding p {
  margin-bottom: 10px;
}

.active-season {
  position: relative;
  overflow: hidden;
  padding: 16px 20px;
  border: 1px solid green;
  border-radius: 16px;
  width: 100%;
  text-align: center;
  cursor: pointer;
  background: #000000;
}

.active-season:hover {
  background: #002E2C;
}

.active-season h4 {
  position: relative;
  display: inline-block;
  overflow: hidden;
  color: #FFD700;
  font-size: 1.2rem;
  font-weight: 400;
  letter-spacing: 3px;
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


@media (max-width: 768px) {

  .activities {
    padding: 0 5px;
    font-size: 1rem;
  }

  .activities h3 {
    font-size: 1.2rem;
  }

  .day-title {
    font-size: 0.9rem;
  }

  .total-score {
    font-size: 1.1rem;
    width: 20px;
    margin-right: 10px;
  }

  .sets span {
    width: 22px;
    font-size: 0.8rem;
  }

  .right-side {
    flex-direction: column-reverse;
  }

  .second {
    width: 100%;
  }

  .active-season {
    padding: 8px 10px;
  }
}
</style>