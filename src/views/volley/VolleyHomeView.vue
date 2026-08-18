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
          <div v-for="league in volleyLeagues" :key="league.leagueId" class="league">

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

            <!-- TLAČIDLO PRE PREPNUTIE ZOBRAZENIA TÍMOV (IBA PRE ADMINA) -->
            <div v-if="isAdmin">
              <AppButton :label="showAddTeams[league.leagueId] ? 'Skryť dostupné tímy' : 'Pridať tímy do ligy'"
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
import api from '@/axios-interceptor';
import AppButton from '@/components/AppButton.vue';

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

        // Inicializácia polí pre každú ligu
        this.volleyLeagues.forEach(league => {
          if (!Array.isArray(this.selectedTeamIds[league.leagueId])) {
            this.selectedTeamIds[league.leagueId] = [];
          }
          // Nastavíme predvolený stav skrytia (false) pre každú ligu, ak ešte neexistuje
          if (this.showAddTeams[league.leagueId] === undefined) {
            this.showAddTeams[league.leagueId] = false;
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

        // Po úspešnom odstránení znova načítame ligy, aby sa zoznam okamžite aktualizoval
        await this.fetchVolleyLeagues();

      } catch (err) {
        console.error('Chyba pri odstraňovaní tímu z ligy:', err);
        this.errorMessage = 'Nepodarilo sa odstrániť tím z ligy.';
      } finally {
        this.loading = false;
      }
    }
  },
  computed: {
    isLoggedIn() {
      return this.userStore.isLoggedIn
    },
    isAdmin() {
      return this.userStore.isAdmin
    },
  },
  components: { AppButton }
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
.teams-wrapper{
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

@media (max-width: 768px) {
  .league-teams {
    width: 100%;
  }
}
</style>