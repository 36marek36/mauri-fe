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

      <!-- LIGY -->
      <div v-else class="league-teams">
        <div v-if="volleyLeagues.length">
          <div v-for="league in volleyLeagues" :key="league.leagueId">

            <!-- ZOZNAM TÍMOV V LIGE -->
            <div class="list-or-nothing">
              <div v-if="league.teams?.length" class="teams-wrapper">
                <div v-for="team in league.teams" :key="team.id" class="team-row">
                  <span>{{ team.name }}</span>
                  <!-- Tlačidlo na vymazanie tímu z ligy (iba pre admina) -->
                  <AppButton v-if="isAdmin" label="" icon="➖" type="delete" htmlType="button"
                    @clicked="removeTeamFromLeague(league.leagueId, team.id)" />
                </div>
              </div>
            </div>

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
            <section v-if="showMatches[league.leagueId]" class="matches">

              <div class="list-or-nothing" v-if="Object.keys(leagueMatches[league.leagueId] || {}).length">

                <h3 class="center-title">Zápasy ligy</h3>

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
                        :leagueStatus="'ACTIVE'" :isAdmin="isAdmin" :activeMatchId="activeMatchId"
                        :getMatchClass="getMatchClass" :isUserPlayerInMatch="isUserPlayerInMatch"
                        @toggle-form="handleToggleForm" @edit="handleToggleForm" @cancel="handleCancelResult"
                        @refresh="() => refreshMatchesForLeague(league.leagueId)" />
                    </ul>

                  </div>

                </div>

              </div>

              <h3 v-else class="center-title">Žiadne zápasy pre túto ligu.</h3>

            </section>

          </div>
        </div>

        <p v-else>
          V aktuálnej sezóne zatiaľ nie sú vytvorené žiadne volejbalové ligy.
        </p>
      </div>

    </div>
  </div>
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
      loading: false,
      errorMessage: '',
      volleyLeagues: [],
      teams: [],
      selectedTeamIds: {},
      showAddTeams: {},
      showMatches: {},
      leagueMatches: {},
      openedLeagueRounds: {},
      activeMatchId: null,
      header: useHeaderStore(),
      userStore: useUserStore()
    }
  },
  async created() {
    await this.userStore.fetchCurrentUser();

    this.initHeader();
    await this.fetchVolleyLeagues();
    await this.fetchTeams();
  },

  methods: {
    async fetchVolleyLeagues() {
      try {
        this.loading = true;
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
        });
      } catch (err) {
        console.error('Chyba pri načítavaní volejbalových líg:', err);
        this.errorMessage = 'Nepodarilo sa načítať aktuálne volejbalové ligy.';
      } finally {
        this.loading = false;
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

        await this.fetchVolleyLeagues();

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

      } catch (err) {
        console.error('Chyba pri odstraňovaní tímu z ligy:', err);
        this.errorMessage = 'Nepodarilo sa odstrániť tím z ligy.';
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
        this.loading = true;

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
      } finally {
        this.loading = false;
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
    }
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

.league-teams {
  width: 50%;
}

.list-or-nothing {
  margin-top: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.teams-wrapper {
  width: 100%;
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

@media (max-width: 768px) {
  .league-teams {
    width: 100%;
  }
}
</style>