<template>
  <div class="main-layout">
    <div class="right-side">

      <!-- LOADING -->
      <p v-if="loading">
        Načítavam...
      </p>

      <!-- ERROR -->
      <p v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>

      <!-- LIGY A GLOBÁLNY OBSAH -->
      <div v-else class="league">

        <!-- 🏐 GLOBÁLNE POSLEDNÉ VÝSLEDKY (Vytiahnuté von z cyklu líg, vykreslia sa iba raz na vrchu stránky) -->
        <div v-if="hasCurrentSeason" class="list-or-nothing">
          <div class="activities">
            <h3>Posledné výsledky</h3>

            <p v-if="!matchActivities.length">
              V posledných 3 dňoch sa neodohrali žiadne zápasy
            </p>

            <div v-for="group in groupedActivities" :key="group.date">
              <h4 class="day-title">{{ group.date }}</h4>

              <div v-for="leagueGroup in group.leagues" :key="leagueGroup.leagueName">

                <!-- Názov ligy patriaci k tejto skupine zápasov -->
                <!-- <h5 class="league-sub-title">{{ leagueGroup.leagueName }}</h5> -->

                <div v-for="({ match }) in leagueGroup.activities" :key="match.id" class="activity-item">
                  <div class="scoreboard">

                    <!-- Vygenerovanie riadku pre domáci a hosťujúci tím jedným cyklom -->
                    <div v-for="side in [
                      { team: match.volleyHomeTeam, isWinner: match.result?.winnerId === match.volleyHomeTeam?.id, scoreKey: 'score1', totalScore: match.result?.homeTeamScore },
                      { team: match.volleyAwayTeam, isWinner: match.result?.winnerId === match.volleyAwayTeam?.id, scoreKey: 'score2', totalScore: match.result?.awayTeamScore }
                    ]" :key="side.team?.id" class="row">
                      <!-- Názov tímu + zvýraznenie víťaza -->
                      <div class="name" :class="{ 'is-winner': side.isWinner }">
                        {{ side.team?.name }}
                      </div>

                      <!-- Celkové skóre zápasu (napr. 3 alebo 1) -->
                      <div class="total-score" :class="{ 'is-winner': side.isWinner }">
                        {{ side.totalScore ?? 0 }}
                      </div>

                      <!-- Zarovnané body pre jednotlivé sety -->
                      <div class="sets">
                        <span v-for="(set, i) in match.result?.setScores" :key="i">
                          {{ set[side.scoreKey] }}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📊 CYKLUS PRE JEDNOTLIVÉ LIGY -->
        <div v-if="volleyLeagues.length">
          <div v-for="league in volleyLeagues" :key="league.leagueId" class="league-section">

            <!-- 📊 Tabuľka ligy -->
            <section>
              <div class="list-or-nothing">
                <table class="standings-table">
                  <tbody>
                    <template v-for="(entry, index) in leagueStandings[league.leagueId]" :key="entry.teamId">

                      <!-- HLAVNÝ RIADOK -->
                      <tr @click="toggleRow(entry.teamId)"
                        :class="{ dropped: entry.droppedFromLeague, opened: expandedRow === entry.teamId }">
                        <td>
                          {{ index + 1 }}.
                        </td>

                        <td>
                          <div class="name-cell">
                            <span class="name">
                              {{ entry.teamName }}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span>
                            {{ entry.points }} b.
                          </span>
                        </td>
                      </tr>

                      <!-- DETAIL -->
                      <tr v-if="expandedRow === (entry.teamId)" class="detail-row">
                        <td colspan="100%">
                          <div class="detail-stats">
                            <div class="label">Odohraté zápasy:</div>
                            <!-- Pridaná bezpečná kontrola na dĺžku poľa tímov cez voliteľné reťazenie (?.) -->
                            <div>{{ entry.matches }} / {{ league.teams?.length ? league.teams.length - 1 : 0 }}</div>

                            <div class="label">W-L:</div>
                            <div>{{ entry.wins }} - {{ entry.losses }}</div>

                            <div class="label">Sety:</div>
                            <div>{{ entry.setsWon }} : {{ entry.setsLost }}</div>
                          </div>

                          <div v-if="isAdmin" class="actions">
                            <div class="admin-buttons">
                              <AppButton label="odhlásiť z ligy" type="edit" htmlType="button"
                                @clicked.stop="dropTeamFromLeague(league.leagueId, entry.teamId)" />

                              <AppButton label="odstrániť z ligy" type="delete" htmlType="button"
                                @clicked.stop="removeTeamFromLeague(league.leagueId, entry.teamId)" />
                            </div>
                          </div>

                          <div class="detail-button">
                            <AppButton :label="'Detail tímu'" type="default" htmlType="button"
                              @clicked.stop="goToDetail('teams', entry.teamId)" />
                          </div>
                        </td>
                      </tr>

                    </template>
                  </tbody>
                </table>
              </div>
            </section>


            <!-- TLAČIDLÁ PRE ADMINA A POUŽÍVATEĽA -->
            <div class="league-actions">
              <!-- Tlačidlo pre zápasy (vidí ho každý) -->
              <AppButton :label="showMatches[league.leagueId] ? 'Skryť zápasy' : 'Zobraziť zápasy'"
                :icon="showMatches[league.leagueId] ? '🔼' : '📅'" type="default" htmlType="button"
                @clicked="toggleMatchesVisibility(league.leagueId)" />

              <!-- Tlačidlo pre pridávanie tímov (iba admin) -->
              <AppButton v-if="isAdmin && league.leagueStatus === 'CREATED'"
                :label="showAddTeams[league.leagueId] ? 'Skryť dostupné tímy' : 'Pridať tímy do ligy'"
                :icon="showAddTeams[league.leagueId] ? '✖️' : '➕'" type="default" htmlType="button"
                @clicked="toggleTeamsVisibility(league.leagueId)" />
            </div>

            <!-- SEKCIU S VÝBEROM ZOBRAZÍME IBA AK JE ZAPNUTÁ A SÚ DOSTUPNÉ TÍMY -->
            <div v-if="showAddTeams[league.leagueId]" class="list-or-nothing">
              <div v-if="availableTeamsForLeague(league).length">
                <div class="team-selection">
                  <label v-for="team in availableTeamsForLeague(league)" :key="team.id" class="team-checkbox">
                    <input type="checkbox" :value="team.id" v-model="selectedTeamIds[league.leagueId]" />
                    <span>{{ team.name }}</span>
                  </label>
                </div>

                <AppButton label="Uložiť vybrané tímy" icon="💾" type="create" htmlType="button"
                  @clicked="addTeamsAndClose(league.leagueId)" />
              </div>

              <p v-else>
                Všetky dostupné tímy už sú v tejto lige.
              </p>
            </div>

            <!-- SEKCIA ZÁPASOV -->
            <section v-if="showMatches[league.leagueId]">
              <div class="list-or-nothing" v-if="Object.keys(leagueMatches[league.leagueId] || {}).length">
                <div class="matches-wrapper">

                  <!-- Hromadné tlačidlo pre kolá konkrétnej ligy -->
                  <AppButton :label="areAnyRoundsOpened(league.leagueId) ? 'Skryť všetky kolá' : 'Zobraziť všetky kolá'"
                    :icon="areAnyRoundsOpened(league.leagueId) ? '🔼' : '🔽'" type="default" htmlType="button"
                    @clicked="toggleAllRounds(league.leagueId)" />

                  <!-- Cyklus cez kolá z backendu -->
                  <div v-for="(roundMatches, roundNumber) in leagueMatches[league.leagueId]" :key="roundNumber">
                    <h5 @click="toggleRound(league.leagueId, roundNumber)" class="round-title">
                      Kolo: {{ roundNumber }}
                      <span v-if="isRoundOpened(league.leagueId, roundNumber)">▲</span>
                      <span v-else>▼</span>
                    </h5>

                    <!-- Zoznam zápasov v kole -->
                    <ul v-show="isRoundOpened(league.leagueId, roundNumber)" class="match-list">
                      <MatchItem v-for="match in roundMatches" :key="match.id" :match="match" :leagueType="'VOLLEYBALL'"
                        :leagueStatus="league.leagueStatus" :isAdmin="isAdmin" :activeMatchId="activeMatchId"
                        :getMatchClass="getMatchClass" :isUserPlayerInMatch="isUserPlayerInMatch"
                        @toggle-form="handleToggleForm" @edit="handleToggleForm" @cancel="handleCancelResult"
                        @refresh="() => refreshMatchesForLeague(league.leagueId)" />
                    </ul>
                  </div>

                </div>
              </div>

              <h3 v-else class="center-title">Žiadne zápasy pre túto ligu.</h3>
            </section>

          </div> <!-- Koniec cyklu v-for="league in volleyLeagues" -->
        </div> <!-- Koniec v-if="volleyLeagues.length" -->

        <p v-else>
          V aktuálnej sezóne zatiaľ nie sú vytvorené žiadne volejbalové ligy.
        </p>

      </div> <!-- Koniec <div v-else class="league"> z 1. časti -->
    </div> <!-- Koniec <div class="right-side"> -->
  </div> <!-- Koniec <div class="main-layout"> -->
</template>

<script>
import { useHeaderStore } from '@/stores/header';
import { useUserStore } from '@/stores/user';
import { useFlashMessageStore } from '@/stores/flashMessage';
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';
import MatchItem from '@/components/MatchItem.vue';

export default {
  name: 'VolleyHomePage',
  data() {
    return {
      loading: true,
      errorMessage: '',
      volleyLeagues: [],
      teams: [],
      leagueStandings: {},
      selectedTeamIds: {},
      showAddTeams: {},
      showMatches: {},
      showStandings: {},
      leagueMatches: {},
      openedLeagueRounds: {},
      activeMatchId: null,
      expandedRow: null,
      hasCurrentSeason: false,
      matchActivities: [],
      header: useHeaderStore(),
      userStore: useUserStore()
    }
  },
  async created() {
    this.loading = true; // Zapneme loading na začiatku

    // 1. Používateľ a hlavička
    await this.userStore.fetchCurrentUser();
    this.initHeader();

    // 2. Sezóna a zápasy (Zápasy sa stiahnu iba ak sezóna vnútorne nastaví hasCurrentSeason = true)
    await this.loadCurrentSeason();
    if (this.hasCurrentSeason) {
      await this.loadMatchActivities();
    }

    // 3. Ostatné číselníky
    await this.fetchVolleyLeagues();
    await this.fetchTeams();

    this.loading = false; // Vypneme loading na samom konci, keď je všetko pripravené
  },

  methods: {
    async fetchVolleyLeagues() {
      try {
        this.errorMessage = '';
        const response = await api.get('/volleyball/volley_leagues/current_season');
        this.volleyLeagues = response.data;

        this.volleyLeagues.forEach(league => {
          if (!Array.isArray(this.selectedTeamIds[league.leagueId])) {
            this.selectedTeamIds[league.leagueId] = [];
          }
          if (this.showAddTeams[league.leagueId] === undefined) {
            this.showAddTeams[league.leagueId] = false;
          }
          // Inicializácia pre zápasy
          if (this.showMatches[league.leagueId] === undefined) {
            this.showMatches[league.leagueId] = false;
          }
          if (this.leagueMatches[league.leagueId] === undefined) {
            this.leagueMatches[league.leagueId] = {};
          }
          // Inicializácia štatistík
          if (this.leagueStandings[league.leagueId] === undefined) {
            this.leagueStandings[league.leagueId] = {};
          }
        });

        const statsPromises = this.volleyLeagues.map(league => this.fetchStats(league.leagueId));
        await Promise.all(statsPromises);

      } catch (err) {
        console.error('Chyba pri načítavaní volejbalových líg:', err);
        this.errorMessage = 'Nepodarilo sa načítať aktuálne volejbalové ligy.';
      }
    },

    async fetchTeams() {
      try {
        const response = await api.get('/volleyball/teams/');
        this.teams = response.data;
      } catch (err) {
        console.error('Chyba pri načítavaní tímov:', err);
      }
    },
    async fetchStats(leagueId, forceRefresh = false) {
      // Ak už štatistiky máme, neťaháme ich znova
      if (!forceRefresh && this.leagueStandings[leagueId] && this.leagueStandings[leagueId].length > 0) {
        return;
      }
      try {
        const url = `/volleyball/volley_leagues/${leagueId}/stats`;
        const res = await api.get(url);
        this.leagueStandings[leagueId] = res.data;
      } catch (err) {
        console.error(`Chyba pri načítavaní štatistík pre ligu ${leagueId}:`, err);
      }
    },

    toggleTeamsVisibility(leagueId) {
      this.showAddTeams[leagueId] = !this.showAddTeams[leagueId];
    },
    // Po úspešnom pridaní tímov rovno skryje formulár
    async addTeamsAndClose(leagueId) {
      const originalLength = this.selectedTeamIds[leagueId]?.length || 0;
      await this.addTeamsToLeague(leagueId);

      // Ak uloženie prebehlo úspešne (vymazali sa označené ID), formulár schováme
      if (originalLength > 0 && this.selectedTeamIds[leagueId].length === 0) {
        this.showAddTeams[leagueId] = false;
      }
    },

    initHeader() {
      if (!this.isLoggedIn) {
        this.header.setTitle('Handlovská', ' Beachvolejbalová liga');
        return;
      }

      const fullName = this.userStore.user?.playerName || '';

      const firstName = fullName.split(' ')[0];

      this.header.setTitle(
        'Handlovská beachvolejbalová liga', 'Vitaj ' +
      firstName
      );
    },

    async addTeamsToLeague(leagueId) {
      const teamIds = this.selectedTeamIds[leagueId] || [];

      if (!teamIds.length) {
        this.errorMessage = 'Najskôr vyber aspoň jeden tím.';
        return;
      }

      try {
        this.loading = true;
        this.errorMessage = '';

        await api.patch(
          `/volleyball/volley_leagues/${leagueId}/addTeams`,
          {
            participantIds: teamIds
          }
        );

        this.flash.showMessage('✅ Tímy boli úspešne pridané do ligy.', 'success')

        this.selectedTeamIds[leagueId] = [];


        await this.fetchVolleyLeagues()
        await this.fetchStats(leagueId, true)

      } catch (err) {
        console.error(
          'Chyba pri pridávaní tímov do ligy:',
          err
        );

        this.errorMessage =
          'Nepodarilo sa pridať tímy do ligy.';
      } finally {
        this.loading = false;
      }
    },
    availableTeamsForLeague(league) {
      const existingTeamIds = new Set(
        (league.teams || []).map(team => team.id)
      );

      return this.teams.filter(
        team => !existingTeamIds.has(team.id)
      );
    },
    async removeTeamFromLeague(leagueId, teamId) {
      // Dobrým zvykom je pridať rýchle potvrdenie, aby admin neodstránil tím omylom
      if (!confirm('Naozaj chcete odstrániť tento tím z ligy?')) {
        return;
      }

      try {
        this.loading = true;
        this.errorMessage = '';

        // Presné volanie na váš @PatchMapping("/{leagueId}/removeTeam/{teamId}")
        await api.patch(`/volleyball/volley_leagues/${leagueId}/removeTeam/${teamId}`);

        this.flash.showMessage('✅ Tím bol úspešne odstránený z ligy.', 'info')

        // Po úspešnom odstránení znova načítame ligy, aby sa zoznam okamžite aktualizoval
        await this.fetchVolleyLeagues();
        await this.fetchStats(leagueId, true);

      } catch (err) {
        console.error('Chyba pri odstraňovaní tímu z ligy:', err);
        this.errorMessage = 'Nepodarilo sa odstrániť tím z ligy.';
      } finally {
        this.loading = false;
      }
    },
    async dropTeamFromLeague(leagueId, teamId) {
      if (!confirm('Naozaj chcete odhlásiť tento tím z ligy?')) {
        return;
      }
      try {
        this.loading = true;
        this.errorMessage = '';

        const response = await api.patch(`/volleyball/volley_leagues/${leagueId}/dropTeam/${teamId}`)

        this.flash.showMessage(response.data, 'info')

        await this.fetchVolleyLeagues();
        await this.fetchStats(leagueId, true);

      } catch (err) {
        console.error('Chyba pri odhlasovaní tímu z ligy:', err);
        this.flash.showMessage('Nepodarilo sa odhlásiť tím z ligy.', 'error');
      } finally {
        this.loading = false;
      }
    },
    async toggleMatchesVisibility(leagueId) {
      if (this.showMatches[leagueId]) {
        this.showMatches[leagueId] = false;
        return;
      }

      try {
        this.loading = true;
        const response = await api.get(`/volleyball/volley-matches/${leagueId}/grouped-by-round`);
        this.leagueMatches[leagueId] = response.data;

        if (!this.openedLeagueRounds[leagueId]) {
          this.openedLeagueRounds[leagueId] = [];
        }

        this.showMatches[leagueId] = true;
      } catch (err) {
        console.error('Chyba pri načítavaní zápasov:', err);
        this.errorMessage = 'Nepodarilo sa načítať zápasy.';
      } finally {
        this.loading = false;
      }
    },

    isRoundOpened(leagueId, roundNumber) {
      return this.openedLeagueRounds[leagueId]?.includes(Number(roundNumber)) || false;
    },

    toggleRound(leagueId, roundNumber) {
      const roundNum = Number(roundNumber);
      if (!this.openedLeagueRounds[leagueId]) {
        this.openedLeagueRounds[leagueId] = [];
      }

      const index = this.openedLeagueRounds[leagueId].indexOf(roundNum);
      if (index > -1) {
        this.openedLeagueRounds[leagueId].splice(index, 1);
      } else {
        this.openedLeagueRounds[leagueId].push(roundNum);
      }
    },

    areAnyRoundsOpened(leagueId) {
      return (this.openedLeagueRounds[leagueId]?.length || 0) > 0;
    },

    toggleAllRounds(leagueId) {
      if (this.areAnyRoundsOpened(leagueId)) {
        this.openedLeagueRounds[leagueId] = [];
      } else {
        const allRounds = Object.keys(this.leagueMatches[leagueId] || {}).map(Number);
        this.openedLeagueRounds[leagueId] = allRounds;
      }
    },

    async refreshMatchesForLeague(leagueId) {
      try {
        const response = await api.get(`/volleyball/volley-matches/${leagueId}/grouped-by-round`);
        this.leagueMatches[leagueId] = response.data;
        this.activeMatchId = null; // Po úspešnom uložení formulár zatvoríme
        await this.fetchStats(leagueId, true);
        if (this.hasCurrentSeason) {
          await this.loadMatchActivities();
        }
      } catch (err) {
        console.error('Chyba pri aktualizácii zápasov:', err);
      }
    },

    // MANAŽMENT FORMULÁROV (pre @toggle-form aj @edit)
    handleToggleForm(matchId) {
      this.activeMatchId = this.activeMatchId === matchId ? null : matchId;
    },

    // ZRUŠENIE VÝSLEDKU (pre @cancel)
    async handleCancelResult(matchId) {
      if (!confirm('Naozaj chcete zrušiť výsledok tohto zápasu?')) {
        return;
      }
      try {

        await api.patch(`/volleyball/volley-matches/${matchId}/cancel-result`);

        this.flash.showMessage('✅ Výsledok zápasu bol úspešne zrušený.', 'warning');

        // Nájdeme ligu, ku ktorej zápas patrí, aby sme ju aktualizovali
        for (const leagueId in this.leagueMatches) {
          for (const round in this.leagueMatches[leagueId]) {
            if (this.leagueMatches[leagueId][round].some(m => m.id === matchId)) {
              await this.refreshMatchesForLeague(leagueId);
              break;
            }
          }
        }
      } catch (err) {
        console.error('Chyba pri rušení výsledku:', err);
        this.errorMessage = 'Nepodarilo sa zrušiť výsledok.';
      }
    },

    // KLASIFIKÁCIA TRIED PRE VÍŤAZA / PORAZENÉHO (MatchItem ju očakáva)
    getMatchClass(match, type) {
      if (!match.result) return '';

      const score1 = match.result.homeTeamScore;
      const score2 = match.result.awayTeamScore;

      if (score1 === score2) return '';

      if (type === 'home') {
        return score1 > score2 ? 'winner' : 'loser';
      } else if (type === 'away') {
        return score2 > score1 ? 'winner' : 'loser';
      }
      return '';
    },
    // KONTROLA, ČI PRIHLÁSENÝ POUŽÍVATEĽ HRÁ V ZÁPASE (pre zápis výsledkov hráčmi)
    isUserPlayerInMatch(match) {
      // Ak nie je prihlásený žiadny používateľ, rovno vrátime false
      if (!this.isLoggedIn) return false;

      // Získame ID prihláseného hráča
      const playerId = this.userStore.playerId;

      // Kontrola, či je prihlásený hráč kapitánom domáceho alebo hosťujúceho tímu
      return (
        match.volleyHomeTeam?.captain?.id === playerId ||
        match.volleyAwayTeam?.captain?.id === playerId
      );
    },
    toggleRow(id) {
      this.expandedRow = this.expandedRow === id ? null : id
    },
    async goToDetail(type, id) {
      try {
        await api.get(`/volleyball/${type}/${id}`);
        this.$router.push(`/volleyball/${type}/${id}`);
      } catch (error) {
      }
    },
    async loadCurrentSeason() {
      try {
        const res = await api.get('/seasons/current/exists');
        this.hasCurrentSeason = res.data;
      } catch {
        this.hasCurrentSeason = false;
      }
    },
    async loadMatchActivities() {
      try {
        this.errorMessage = '';
        const res = await api.get('/volleyball/match-activities/recent');
        this.matchActivities = res.data;

      } catch (e) {
        this.errorMessage = "Nepodarilo sa načítať aktivity";
        this.matchActivities = [];
      }
    },
  },

  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    isAdmin() {
      return this.userStore.isAdmin
    },
    flash() {
      return useFlashMessageStore();
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
  },
  components: { AppButton, MatchItem }
}
</script>

<style scoped>
.right-side {
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.league {
  width: 50%;
}

/* 📊 Tabuľka */
.standings-table td {
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.standings-table tr.opened {
  border-left: 1px solid #e9ecef;
  border-right: 1px solid #e9ecef;
  border-top: 1px solid #e9ecef;
}

.standings-table tbody tr:hover {
  background-color: #363537;
}

.standings-table tr.dropped td {
  color: #999;
  text-shadow: none;
  font-style: italic;
}

.list-or-nothing {
  align-items: center;
  margin-top: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.matches-wrapper {
  text-align: center;
  width: 100%;
}

.round-title {
  cursor: pointer;
  padding: 2px;
}

.match-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.team-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.team-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.team-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #228be6;
  /* Hlavná farba pre zaškrtnuté políčko */
}

.team-checkbox:has(input:checked) span {
  color: #1c7ed6;
  font-weight: 600;
}

.team-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.2s;
}

.league-actions {
  gap: 10px;
  margin: 15px 0;
}

/* DETAIL */
.detail-row td {
  background: #002E2C;
  padding: 0.8rem;
  border-left: 1px solid #e9ecef;
  border-right: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.detail-stats {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.5rem 1.5rem;
  align-items: center;
}

.detail-stats .label {
  font-weight: 700;
  color: #ffd700;
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

.activity-item .row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item .row:last-child {
  border-bottom: none;
  /* Odstráni spodnú čiaru u hosťujúceho tímu */
}

/* Názov tímu */
.activity-item .name {
  flex-grow: 1;
  text-align: left;
  /* Roztiahne názov tímu a potlačí skóre doprava */
  /* font-size: 0.95rem; */
  color: #ffffff;
}

.activity-item .name.is-winner {
  font-weight: bold;
  color: #ffd700;
}

/* 🎯 CELKOVÉ SKÓRE ZÁPASU (napr. 3 alebo 1) */
.total-score {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;

  /* Zarovnanie a priestor */
  width: 24px;
  /* Fixná šírka, aby boli domáce aj hosťujúce skóre pod sebou */
  text-align: center;
  margin-right: 20px;
  /* Výrazná medzera, ktorá oddelí hlavný výsledok od jednotlivých setov */
}

/* Ak tím vyhral zápas, jeho celkové skóre bude výraznejšie */
.total-score.is-winner {
  color: #ffd700;
  /* Zladenie s tmavočervenou farbou tvojich setov */
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

  /* Tieto 3 riadky zabezpečia rovnakú šírku a zarovnanie */
  width: 28px;
  /* Pevná šírka pre každý set (dostatočná pre 2 cifry) */
  text-align: center;
  /* Zarovnanie čísla presne na stred */
  display: inline-block;
  /* Aby span rešpektoval nastavenú šírku */
}

@media (max-width: 768px) {
  .league {
    width: 100%;
  }
}
</style>